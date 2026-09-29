# VDS taşıma ve felaket kurtarma

Eski VDS (`31.58.91.7`) **30 Eylül 2026'da silindi/silinecek**. Bu doküman: her şeyin nereye yedeklendiği, yeni VDS'te sistemin nasıl geri kurulacağı ve yeni adrese geçince nelerin değişeceği. Yeni VDS gelince sırayla bunu izle.

> Yeni oturuma başlayan Claude: önce [README.md](README.md), sonra bu dosya. Kullanıcı yeni VDS'in adresini ve SSH erişimini verene kadar **bekle**; VDS'te hiçbir şeyi kendiliğinden başlatma, "Güncelle" kuralları aynen geçerli ([guncelleme-akisi.md](guncelleme-akisi.md)).

---

## 1. Yedek nerede

| Ne | Nerede | Şifreli mi |
|---|---|---|
| Kod, script'ler (webhook'lar **silinmiş**), sistem ayarları, server.properties | Bu repo: [`tools/vds/altyapi/`](../tools/vds/altyapi/) | Hayır (gizli bilgi yok) |
| Gerçek script'ler (webhook'lu), `/root/pending`, `/root/dev` (mdk, kaynaklar), `/root/mod-bekleyen`, `/root/staging`, `authorized_keys` | GitHub release `vds-yedek-2026-09-30` → `extras.tar.zst.enc.*` | **Evet** |
| **Tüm sunucu klasörü** (`/root/servers/medieval-fantasy`: dünya, oyuncu verileri, mod jar'ları, config, kubejs, NPC'ler, ops/whitelist, `server-only-mods.txt`) | Aynı release → `server-medieval-fantasy.tar.zst.enc.00/.01/.02` | **Evet** |
| Eski dünya (`2026-09-25-old-world-final`) | Aynı release → `old-world-final.tar.zst.enc.*` | **Evet** |
| Oyuncu paketi (mod/config dosyaları) | GitHub release `medieval-fantasy-pack-overflow` + `distribution/medieval-fantasy/manifest.json` | Hayır (zaten herkese açık) |
| AnuDownloader kurulum dosyası | GitHub release `anudownloader` | Hayır |

Release: <https://github.com/anubissxd/minecraft-servers/releases/tag/vds-yedek-2026-09-30>

**Şifre:** yedek AES-256 ile şifrelidir (`openssl enc -aes-256-cbc -pbkdf2 -iter 200000`). Parola **repoda ve GitHub'da yoktur**. Anubis'in bilgisayarında:

```
C:\Users\Alp\Desktop\Anubis\VDS-Yedek-Anahtar.txt
```

(yanında `VDS-Yedek-Meta\` klasörü: crontab, servis dosyası, paket listesi, sistem notları). Bu iki şeyi **kaybetme / silme**; parola olmadan yedek açılmaz.

### Yedeğe girmeyenler

- `/root/backups/medieval-fantasy/auto/` (günlük otomatik yedekler, ~39 GB) ve diğer tarihli yedekler (`*-before-*`, `*-after-castle-place` vb., ~8 GB). Tek kaynak dünya zaten `server-medieval-fantasy` arşivinde.
- Tokenlar: **GitHub token'ı ve VDS'teki `gh` oturumu yedeklenmedi.** Yeni VDS'te `gh auth login` yeniden yapılır.
- Cache ve derleme çıktıları (`~/.gradle`, `~/.cache`).

---

## 2. Yeni VDS'te geri kurulum (sırayla)

Hedef sistem: Ubuntu 24.04, ~10 GB RAM, ≥ 60 GB disk, açık TCP port **25567**.

### 2.1 Erişim ve paketler

1. `root` için SSH anahtarlarını ekle: Anubis (`vds-raven`) ve swxff (`swxff medieval-fantasy-vds`) `.pub` anahtarları. Liste eski VDS'in `authorized_keys`'inde ve `VDS-Yedek-Meta\authorized_keys.txt` içindeydi. Şifre kullanılmaz.
2. Paketler:

```bash
apt update && apt install -y openjdk-17-jdk-headless openjdk-21-jdk-headless screen git python3 python3-pip zstd curl unzip gh
```

(Tam eski liste: [`paketler.txt`](../tools/vds/altyapi/sistem/paketler.txt).) Sunucu **Java 17** ile çalışır.
3. GitHub: `gh auth login` (kullanıcı `anubissxd`, HTTPS). Token'ın bu repoya **release yükleme ve push** yetkisi olmalı. Bunu Anubis yapar; token asla repoya yazılmaz.

### 2.2 Yedeği indir ve aç

```bash
mkdir -p /root/yedek-in && cd /root/yedek-in
gh release download vds-yedek-2026-09-30 -R anubissxd/minecraft-servers
sha256sum -c server-medieval-fantasy.sha256 extras.sha256
# parolayı /root/.yedek-anahtar dosyasına koy (Anubis'in bilgisayarındaki VDS-Yedek-Anahtar.txt içeriği), chmod 600

cat extras.tar.zst.enc.* | openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -pass file:/root/.yedek-anahtar | zstd -dc | tar -C / -xf -
mkdir -p /root/servers
cat server-medieval-fantasy.tar.zst.enc.* | openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -pass file:/root/.yedek-anahtar | zstd -dc | tar -C / -xf -
```

Dosyalar aynı yola (`/root/servers/medieval-fantasy`, `/root/scripts`, `/root/pending`, `/root/dev`...) açılır. Eski dünya gerekirse `old-world-final.tar.zst.enc.*` aynı şekilde `/`'e açılır (`/root/backups/medieval-fantasy/2026-09-25-old-world-final`).

### 2.3 Servis, cron, script'ler

```bash
cp /root/yedek-meta/minecraft-fantasy.service /etc/systemd/system/    # veya repodan: tools/vds/altyapi/sistem/
systemctl daemon-reload && systemctl enable minecraft-fantasy
crontab /root/yedek-meta/crontab.txt          # update_players, günlük yedek (04:00), chunky_guard
```

- CPU sınırı (`50-CPUQuota.conf`) eski VDS'te geçici (`/run/...`) ayardı; gerekirse `systemctl set-property --runtime minecraft-fantasy CPUQuota=<değer>`. Zorunlu değil.
- `/root/scripts/*` (gerçek webhook'larla) `extras` arşivinden gelir. Repodaki `tools/vds/altyapi/scripts/` kopyalarında webhook alanları `GIZLI_...` yer tutucusudur; onlar **yalnızca kod referansıdır**, gerçek script'lerin üzerine yazma.
- `/root/servers/medieval-fantasy/run.sh` ve `user_jvm_args.txt` arşivde var (kopyaları `tools/vds/altyapi/`).

### 2.4 Repo ve `guncelle` / `havuz`

```bash
mkdir -p /root/repo && cd /root/repo && gh repo clone anubissxd/minecraft-servers
ln -sf /root/repo/minecraft-servers/tools/vds/guncelle.py /usr/local/bin/guncelle
ln -sf /root/repo/minecraft-servers/tools/vds/havuz.py   /usr/local/bin/havuz
chmod +x /root/repo/minecraft-servers/tools/vds/*.py
```

`/root/pending/medieval-fantasy.jsonl` (havuz) `extras` arşiviyle geri gelir; **açılmamış kayıtlar** olabilir, `havuz liste` ile bak.

### 2.5 Başlat ve doğrula

```bash
systemctl start minecraft-fantasy
sleep 120; tail -50 /root/servers/medieval-fantasy/logs/latest.log     # "Done (...)!" bekle
ss -tlnp | grep 25567
```

Doğrulama: logda `Done`, hata yok; Discord durum mesajı (update_players) yeşil; bir oyuncu bağlanabiliyor. Whitelist ve rütbeler dünyayla birlikte gelir.

---

## 3. Yeni adrese geçince değişecekler

Eski adres: `31.58.91.7`. **Yeni IP'de şunlar güncellenir:**

| Yer | Ne yapılır |
|---|---|
| Oyuncular | Minecraft'ta sunucu adresini yeni IP ile yeniden ekler (`<yeni-ip>:25567`). AnuDownloader sunucu adresi yazmaz. |
| `/root/scripts/update_players.py` | `public_addr` yeni `IP:25567` yapılır (Discord durum mesajında görünür). |
| `tools/anudownloader/Build-Manifest-VDS.ps1` | `SshHost` varsayılanı (yedek yöntem). |
| `docs/vds.md`, `docs/guncelleme-akisi.md`, `docs/anudownloader.md`, `CLAUDE.md` | `31.58.91.7` geçen satırlar. |
| SSH | `known_hosts` uyarısı: Anubis/swxff eski kaydı siler (`ssh-keygen -R 31.58.91.7`). |
| Discord | Webhook'lar VDS'ten bağımsız, değişmez. İstersen yenile. |

Domain kullanılmıyor; ileride bir alan adı alınırsa IP değişimi bu tabloya inmez, sadece DNS güncellenir.

---

## 4. Bilinmesi gerekenler

- Sunucu `online-mode=false` (TLauncher paketi), `white-list=true`. Ayarlar: [`tools/vds/altyapi/sunucu-ayarlari/server.properties`](../tools/vds/altyapi/sunucu-ayarlari/server.properties).
- Yedek alındığında sunucu **kapalıydı** (sunucu: 2026-09-29 22:31 UTC, `save-all flush` sonrası `systemctl stop`). Dünya o andaki halinde. Sonraki her değişiklik yedekte yoktur.
- Sunucu, yedeğin ardından bir kez **What Are They Up To (Watut) + CoroUtil** testi için açıldıysa bu, dünyada ihmal edilebilir fark yaratır. Ayrıntı: `docs/README.md` "Yarım kalan işler".
- Yedekleri yükleyen script: eski VDS'te `/root/yedek_yukle.sh` (`extras` arşivinde). Aynı mantık tekrar gerekirse: `tar | zstd -T4 -3 | openssl enc ... | split -b 1900M`, sonra `gh release upload`.
