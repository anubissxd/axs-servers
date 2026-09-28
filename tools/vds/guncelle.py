#!/usr/bin/env python3
# "Guncelle" komutu: havuzdaki degisiklikleri sunucuya ve AnuDownloader paketine
# tek seferde yansitir. Ayrintilar: docs/guncelleme-akisi.md
#
#   guncelle --kim <isim>              tam guncelleme
#   guncelle --kim <isim> --kuru       hicbir sey degistirmeden ne olacagini goster
#   guncelle --kim <isim> --surum X.Y.Z   paket surumunu elle ver (varsayilan: son hane +1)
#
# Sira:
#   1. kilit (ayni anda tek guncelle) + repo'yu origin/main'e cek
#   2. sunucudaki dosyalari tara, yayindaki manifest'le karsilastir
#   3. yedek al, oyunculari uyar, sunucuyu yeniden baslat, acildigini dogrula
#   4. paket degistiyse: dosyalari Release'e yukle, URL'leri test et, manifest +
#      yama notu + surum yaz, commit/push, index.json'u commit SHA'sina sabitle,
#      jsDelivr purge, Discord duyurusu
#   5. havuzu arsivle
# Sunucu acilmazsa veya URL testi basarisizsa yayin yapilmaz.
import sys, os, json, time, hashlib, shutil, socket, struct, subprocess, fcntl
import datetime, argparse, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor

sys.path.insert(0, os.path.dirname(os.path.realpath(__file__)))
import havuz

REPO_SLUG = "anubissxd/minecraft-servers"
REPO_DIR = "/root/repo/minecraft-servers"
NOTIFY = "/root/scripts/notify_pack.py"
LOCK_FILE = "/run/lock/anubis-guncelle.lock"

PACKS = {
    "medieval-fantasy": {
        "name": "Medieval Fantasy",
        "server": "/root/servers/medieval-fantasy",
        "service": "minecraft-fantasy",
        "screen": "fantasy",
        "port": 25567,
        "tag": "medieval-fantasy-pack-overflow",
        "backup": "/root/scripts/backup_fantasy.sh",
    },
}

# sunucudaki klasor -> oyuncudaki klasor (Build-Manifest-VDS.ps1 ile ayni)
FOLDER_MAP = [
    ("mods", "mods"),
    ("config", "config"),
    ("datapacks", "datapacks"),
    ("client-extra/mods", "mods"),
    ("client-extra/resourcepacks", "resourcepacks"),
    ("client-extra/shaderpacks", "shaderpacks"),
    ("kubejs", "kubejs"),
    ("world/datapacks/anubis_customs", "global_packs/required_data/anubis_customs"),
    ("global_packs/required_data", "global_packs/required_data"),
]
EXCLUDED_PREFIXES = ("config/spark/tmp/", "config/chunky/tasks/", "kubejs/config/", "kubejs/README.txt")
EXCLUDED_SUFFIXES = (".bak", ".tmp", ".log")
EMPTY_SHA = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"


def log(msg):
    print(msg, flush=True)


def run(cmd, cwd=None, check=True):
    r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if check and r.returncode != 0:
        raise SystemExit("HATA: %s\n%s%s" % (" ".join(cmd), r.stdout, r.stderr))
    return r


def git(*args, check=True):
    return run(["git", "-C", REPO_DIR] + list(args), check=check)


def asset_name(rel):
    # GitHub, asset adindaki bosluk/kesme gibi karakterleri degistiriyor; ayni
    # donusumu burada yapmazsak manifest var olmayan bir URL'ye isaret eder.
    out = rel.replace("/", "__")
    return "".join(c if (c.isascii() and (c.isalnum() or c in "._+-")) else "_" for c in out)


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def scan(pack):
    server = pack["server"]
    so_path = os.path.join(server, "server-only-mods.txt")
    server_only = set()
    if os.path.exists(so_path):
        for l in open(so_path, encoding="utf8"):
            t = l.strip()
            if t and not t.startswith("#"):
                server_only.add(t)
    files = {}
    for src, dest in FOLDER_MAP:
        root = os.path.join(server, src)
        if not os.path.isdir(root):
            continue
        for dirpath, _, names in os.walk(root):
            for n in sorted(names):
                full = os.path.join(dirpath, n)
                rel = dest + "/" + os.path.relpath(full, root).replace(os.sep, "/")
                if rel.startswith(EXCLUDED_PREFIXES) or rel.endswith(EXCLUDED_SUFFIXES):
                    continue
                if rel.startswith("mods/") and rel[5:] in server_only:
                    continue
                if rel in files:  # sunucu kopyasi client-extra'dakinden once gelir
                    continue
                h = sha256(full)
                if h == EMPTY_SHA:
                    continue
                files[rel] = {"sha256": h, "full": full}
    if not files:
        raise SystemExit("HATA: sunucuda dosya bulunamadi: " + server)
    return files


# --- sunucu -----------------------------------------------------------------

def varint(n):
    o = b""
    while True:
        b = n & 0x7F
        n >>= 7
        o += bytes([b | (0x80 if n else 0)])
        if not n:
            return o


def read_varint(s):
    n = i = 0
    while True:
        b = s.recv(1)[0]
        n |= (b & 0x7F) << (7 * i)
        i += 1
        if not b & 0x80:
            return n


def online_players(port):
    """Sunucu cevap veriyorsa cevrimici oyuncu sayisi, vermiyorsa None."""
    try:
        s = socket.create_connection(("127.0.0.1", port), timeout=5)
        host = b"localhost"
        p = b"\x00" + varint(763) + varint(len(host)) + host + struct.pack(">H", port) + b"\x01"
        s.sendall(varint(len(p)) + p)
        s.sendall(b"\x01\x00")
        read_varint(s)
        read_varint(s)
        ln = read_varint(s)
        d = b""
        while len(d) < ln:
            d += s.recv(ln - len(d))
        return json.loads(d)["players"]["online"]
    except Exception:
        return None


def console(pack, cmd):
    subprocess.run(["screen", "-S", pack["screen"], "-X", "stuff", cmd + "\n"])


def restart(pack):
    service = pack["service"]
    if run(["systemctl", "is-active", service], check=False).stdout.strip() == "active":
        log("Yedek aliniyor...")
        run([pack["backup"]])
        n = online_players(pack["port"])
        if n:
            log("%d oyuncu cevrimici, 60 sn uyari veriliyor." % n)
            for left, wait in ((60, 30), (30, 20), (10, 10)):
                console(pack, "say Sunucu guncelleme icin %d saniye icinde yeniden baslayacak." % left)
                time.sleep(wait)
        log("Sunucu durduruluyor...")
        console(pack, "stop")
        for _ in range(180):
            if run(["systemctl", "is-active", service], check=False).stdout.strip() != "active":
                break
            time.sleep(2)
        else:
            raise SystemExit("HATA: sunucu 6 dakikada kapanmadi; elle bak (screen -r %s)." % pack["screen"])
    log("Sunucu baslatiliyor...")
    run(["systemctl", "start", service])
    for i in range(120):  # 10 dk
        time.sleep(5)
        if run(["systemctl", "is-active", service], check=False).stdout.strip() != "active":
            raise SystemExit("HATA: sunucu acilirken kapandi. logs/latest.log ve crash-reports/ incele. YAYIN YAPILMADI.")
        if online_players(pack["port"]) is not None:
            log("Sunucu acildi (%d sn)." % ((i + 1) * 5))
            return
    raise SystemExit("HATA: sunucu 10 dakikada acilmadi. logs/latest.log incele. YAYIN YAPILMADI.")


# --- yayin ------------------------------------------------------------------

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None


def url_status(url):
    opener = urllib.request.build_opener(NoRedirect)
    req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "anubis-guncelle/1.0"})
    try:
        return opener.open(req, timeout=30).status
    except urllib.error.HTTPError as e:
        return e.code
    except Exception:
        return 0


def test_urls(urls):
    with ThreadPoolExecutor(8) as ex:  # fazlasinda GitHub gecici 502 donuyor
        res = dict(zip(urls, ex.map(url_status, urls)))
    bad = [u for u, c in res.items() if c != 302]
    if bad:
        time.sleep(10)
        with ThreadPoolExecutor(4) as ex:
            res2 = dict(zip(bad, ex.map(url_status, bad)))
        bad = [u for u, c in res2.items() if c != 302]
    return bad


def bump(version):
    parts = version.split(".")
    parts[-1] = str(int(parts[-1]) + 1)
    return ".".join(parts)


def write_json(path, data):
    with open(path, "w", encoding="utf8", newline="\n") as f:
        json.dump(data, f, indent=2, ensure_ascii=True)
        f.write("\n")


def push():
    if git("push", "-q", "origin", "main", check=False).returncode != 0:
        git("pull", "-q", "--rebase", "origin", "main")
        git("push", "-q", "origin", "main")


def publish(pack_id, pack, files, old_by_path, remove_list, index, entries, version, kim):
    name, tag = pack["name"], pack["tag"]
    dist = os.path.join(REPO_DIR, "distribution", pack_id)

    to_upload = [rel for rel, f in files.items()
                 if rel not in old_by_path or old_by_path[rel]["sha256"] != f["sha256"]]
    new_files = []
    stage = "/tmp/anubis_guncelle_stage"
    shutil.rmtree(stage, ignore_errors=True)
    os.makedirs(stage)
    uploaded = {}
    for i in range(0, len(to_upload), 10):
        batch = to_upload[i:i + 10]
        paths = []
        for rel in batch:
            dst = os.path.join(stage, asset_name(rel))
            shutil.copyfile(files[rel]["full"], dst)
            paths.append(dst)
        log("Yukleniyor [%d-%d/%d]" % (i + 1, i + len(batch), len(to_upload)))
        run(["gh", "release", "upload", tag] + paths + ["--repo", REPO_SLUG, "--clobber"])
        for rel, p in zip(batch, paths):
            uploaded[rel] = os.path.getsize(p)
            os.remove(p)
    shutil.rmtree(stage, ignore_errors=True)

    for rel, f in files.items():
        if rel in uploaded:
            new_files.append({
                "path": rel,
                "filename": rel.rsplit("/", 1)[-1],
                "sha256": f["sha256"],
                "size": uploaded[rel],
                "url": "https://github.com/%s/releases/download/%s/%s" % (REPO_SLUG, tag, asset_name(rel)),
            })
        else:
            new_files.append(old_by_path[rel])

    log("URL'ler test ediliyor (%d)..." % len(new_files))
    bad = test_urls([f["url"] for f in new_files])
    if bad:
        for u in bad[:20]:
            log("  302 donmedi: " + u)
        raise SystemExit("HATA: %d URL calismiyor. YAYIN YAPILMADI (dosyalar Release'de, manifest yazilmadi)." % len(bad))

    manifest = {
        "pack_name": name,
        "version": version,
        "generated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "source": "vds:" + pack["server"],
        "remove": remove_list,
        "files": new_files,
    }
    write_json(os.path.join(dist, "manifest.json"), manifest)

    lines = [e["metin"] for e in entries] or ["Küçük düzeltmeler."]
    notes = "# %s - %s\n\n" % (name, version) + "\n".join("- " + l for l in lines) + "\n"
    with open(os.path.join(dist, "patchnotes.md"), "w", encoding="utf8", newline="\n") as f:
        f.write(notes)

    git("add", "distribution/%s/manifest.json" % pack_id, "distribution/%s/patchnotes.md" % pack_id)
    git("commit", "-q", "-m", "%s %s: manifest ve yama notu (guncelle, %s)" % (name, version, kim))
    push()
    sha = git("rev-parse", "HEAD").stdout.strip()

    raw = "https://raw.githubusercontent.com/%s/%s/distribution/%s/" % (REPO_SLUG, sha, pack_id)
    for p in index["packs"]:
        if p["id"] == pack_id:
            p["version"] = version
            p["manifest_url"] = raw + "manifest.json"
            p["patchnotes_url"] = raw + "patchnotes.md"
    write_json(os.path.join(REPO_DIR, "distribution", "index.json"), index)
    git("add", "distribution/index.json")
    git("commit", "-q", "-m", "%s %s yayinda, %s'e pinlendi" % (name, version, sha[:8]))
    push()
    log("Yayinlandi: %s %s (manifest %s)" % (name, version, sha[:8]))

    # eski AnuDownloader surumleri index.json'u jsDelivr'dan okuyor
    try:
        urllib.request.urlopen("https://purge.jsdelivr.net/gh/%s@main/distribution/index.json" % REPO_SLUG, timeout=30).read()
    except Exception as e:
        log("jsDelivr purge basarisiz (onemsiz): %s" % e)

    r = subprocess.run(["python3", NOTIFY, name, version], input=notes, capture_output=True, text=True)
    log("Discord: " + (r.stdout.strip() or r.stderr.strip()))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--kim", required=True, help="guncellemeyi baslatan kisi")
    ap.add_argument("--paket", default="medieval-fantasy")
    ap.add_argument("--kuru", action="store_true", help="hicbir sey degistirme, sadece goster")
    ap.add_argument("--surum", help="paket surumu (varsayilan: son hane +1)")
    a = ap.parse_args()
    pack = PACKS[a.paket]

    lock = open(LOCK_FILE, "w")
    try:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        raise SystemExit("Baska bir guncelle su an calisiyor. Bitmesini bekle.")

    if git("status", "--porcelain").stdout.strip():
        raise SystemExit("HATA: %s icinde commitlenmemis degisiklik var; once temizle." % REPO_DIR)
    git("pull", "-q", "--rebase", "origin", "main")

    entries = havuz.read_pool(a.paket)
    dist = os.path.join(REPO_DIR, "distribution", a.paket)
    with open(os.path.join(dist, "manifest.json"), encoding="utf-8-sig") as f:
        old = json.load(f)
    old_by_path = {f["path"]: f for f in old["files"]}
    with open(os.path.join(REPO_DIR, "distribution", "index.json"), encoding="utf-8-sig") as f:
        index = json.load(f)
    cur_version = next(p["version"] for p in index["packs"] if p["id"] == a.paket)

    remove_list = []
    rm_path = os.path.join(dist, "remove.txt")
    if os.path.exists(rm_path):
        remove_list = [l.strip() for l in open(rm_path, encoding="utf-8-sig") if l.strip() and not l.strip().startswith("#")]

    log("Sunucu dosyalari taraniyor...")
    files = scan(pack)
    for t in remove_list:
        if t in files:
            raise SystemExit("HATA: remove.txt pakette hala olan bir dosyayi siliyor: " + t)
    changed = sorted(r for r, f in files.items() if r not in old_by_path or old_by_path[r]["sha256"] != f["sha256"])
    dropped = sorted(r for r in old_by_path if r not in files)
    pack_changed = bool(changed or dropped or remove_list != old.get("remove", []))
    version = a.surum or bump(cur_version)

    log("Havuz: %d kayit" % len(entries))
    for e in entries:
        log("  [%s] %s (%s)" % (e["tur"], e["metin"], e["kim"]))
    log("Paket: %d yeni/degisen, %d cikan dosya" % (len(changed), len(dropped)))
    for r in (changed + ["- " + d for d in dropped])[:40]:
        log("  " + r)
    if pack_changed:
        log("-> Paket %s -> %s olarak yayinlanacak, Discord'a duyurulacak." % (cur_version, version))
    else:
        log("-> Pakette degisiklik yok: sadece sunucu yeniden baslar, surum artmaz, duyuru gitmez.")
    if a.kuru:
        log("(kuru calisma: hicbir sey yapilmadi)")
        return

    restart(pack)
    if pack_changed:
        publish(a.paket, pack, files, old_by_path, remove_list, index, entries, version, a.kim)

    # guncelle calisirken eklenen kayitlar havuzda kalsin; sadece islenenler arsivlenir
    def archive():
        now = havuz.read_pool(a.paket)
        done, rest = now[:len(entries)], now[len(entries):]
        if done:
            stamp = datetime.datetime.now().strftime("%Y%m%d-%H%M")
            label = version if pack_changed else "sunucu"
            with open(os.path.join(havuz.POOL_DIR, "archive", "%s-%s-%s.jsonl" % (a.paket, stamp, label)), "w", encoding="utf8") as f:
                for e in done:
                    f.write(json.dumps(e, ensure_ascii=False) + "\n")
        havuz.write_pool(a.paket, rest)
    os.makedirs(os.path.join(havuz.POOL_DIR, "archive"), exist_ok=True)
    havuz.locked(archive)
    log("Tamam. Havuz bosaltildi.")


if __name__ == "__main__":
    main()
