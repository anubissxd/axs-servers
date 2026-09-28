#!/usr/bin/env python3
# Degisiklik havuzu: iki gelistiricinin (ve Claude'larinin) yaptigi degisiklikler
# "guncelle" calisana kadar burada birikir. Ayrintilar: docs/guncelleme-akisi.md
#
#   havuz ekle <kim> <paket|sunucu> "<oyuncuya gidecek cumle>"
#   havuz liste
#   havuz sil <no>          (liste'deki numara)
#
# Havuz dosyasi: /root/pending/<paket-id>.jsonl, her satir bir kayit.
# --paket <id> verilmezse medieval-fantasy kullanilir.
import sys, os, json, datetime, fcntl

POOL_DIR = "/root/pending"
TURLER = ("paket", "sunucu")


def pool_path(pack):
    return os.path.join(POOL_DIR, pack + ".jsonl")


def read_pool(pack):
    p = pool_path(pack)
    if not os.path.exists(p):
        return []
    with open(p, encoding="utf8") as f:
        return [json.loads(l) for l in f if l.strip()]


def write_pool(pack, entries):
    os.makedirs(POOL_DIR, exist_ok=True)
    tmp = pool_path(pack) + ".tmp"
    with open(tmp, "w", encoding="utf8") as f:
        for e in entries:
            f.write(json.dumps(e, ensure_ascii=False) + "\n")
    os.replace(tmp, pool_path(pack))


def locked(fn):
    # iki kisi ayni anda yazarsa satirlar karismasin
    os.makedirs(POOL_DIR, exist_ok=True)
    with open(os.path.join(POOL_DIR, ".lock"), "w") as lf:
        fcntl.flock(lf, fcntl.LOCK_EX)
        return fn()


def main(argv):
    pack = "medieval-fantasy"
    if "--paket" in argv:
        i = argv.index("--paket")
        pack = argv[i + 1]
        del argv[i:i + 2]
    if not argv:
        print("kullanim: havuz ekle <kim> <paket|sunucu> \"<metin>\" | havuz liste | havuz sil <no>")
        return 1
    cmd = argv[0]

    if cmd == "ekle":
        if len(argv) != 4 or argv[2] not in TURLER or not argv[3].strip():
            print("kullanim: havuz ekle <kim> <paket|sunucu> \"<metin>\"")
            return 1
        entry = {
            "zaman": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
            "kim": argv[1],
            "tur": argv[2],
            "metin": argv[3].strip(),
        }
        locked(lambda: write_pool(pack, read_pool(pack) + [entry]))
        print("havuza eklendi:", entry["metin"])
        return 0

    if cmd == "liste":
        entries = read_pool(pack)
        if not entries:
            print("havuz bos (%s)" % pack)
        for n, e in enumerate(entries, 1):
            print("%d. [%s] %s (%s, %s)" % (n, e["tur"], e["metin"], e["kim"], e["zaman"]))
        return 0

    if cmd == "sil":
        if len(argv) != 2 or not argv[1].isdigit():
            print("kullanim: havuz sil <no>")
            return 1
        n = int(argv[1])

        def do():
            entries = read_pool(pack)
            if not 1 <= n <= len(entries):
                print("boyle bir kayit yok:", n)
                return 1
            gone = entries.pop(n - 1)
            write_pool(pack, entries)
            print("silindi:", gone["metin"])
            return 0
        return locked(do)

    print("bilinmeyen komut:", cmd)
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
