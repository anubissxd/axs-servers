# VDS

Medieval Fantasy sunucusu, oyuncu paketinin kaynağı ve bütün otomasyon tek bir Linux VDS'te durur.

- **Adres:** `31.58.91.7` — bağlantı `ssh root@31.58.91.7` (yalnızca anahtarla)
- **Sistem:** Ubuntu 24.04, ~10 GB RAM, 99 GB disk
- **Oyuncuların bağlandığı adres:** `31.58.91.7:25567`

Anahtarlar `/root/.ssh/authorized_keys`'te durur (bkz. [README.md](README.md) "Kim kimdir"). Yeni biri eklenirken dosyanın yedeği alınır ve yalnızca `.pub` anahtar eklenir.

---

## Sunucu

| | |
|---|---|
| Klasör | `/root/servers/medieval-fantasy` |
| Sürüm | Minecraft 1.20.1, Forge 47.4.20, Java 17 |
| Port | 25567 |
| Servis | `minecraft-fantasy` (systemd) |
| Konsol | `screen` oturumu `fantasy` |
| JVM ayarları | `user_jvm_args.txt` |

Servis, sunucuyu `screen -dmS fantasy run.sh nogui` ile açar. `Restart=on-failure` olduğu için çökerse kendiliğinden yeniden açılır.

**Yeniden başlatma elle yapılmaz, `guncelle` yapar** (bkz. [guncelleme-akisi.md](guncelleme-akisi.md)). Elle durdurmak şart olursa: konsola `stop` gönder, servis `inactive` olana kadar bekle, sonra `systemctl start minecraft-fantasy`. `systemctl restart` kullanılmaz: kayıt bitmeden süreci öldürebilir.

### Konsola komut göndermek

```bash
screen -S fantasy -X stuff 'say merhaba\n'
```

Türkçe karakter veya tırnak içeren uzun komutlar `stuff` ile bozulur. Önce komutu bir dosyaya yaz, sonra yapıştır:

```bash
screen -S fantasy -X readbuf -e utf8 /tmp/komut.txt
screen -S fantasy -X paste .
```

Komutun çıktısı `logs/latest.log`'a düşer.

SSH'a satır içi yazılan Python/tırnaklı komutlar kolayca bozulur. Script'i dosya olarak yazıp `scp` ile `/tmp/pa/` altına at, orada çalıştır. VDS'te `python3` (PIL dahil) ve `javap` var.

### Sunucu klasöründe önemli yerler

| Yol | Ne |
|---|---|
| `mods/` | Sunucunun çalıştırdığı modlar. `server-only-mods.txt`'te yazanlar hariç hepsi oyuncuya da gider. |
| `client-extra/` | Sadece oyuncuya giden modlar, resourcepack ve shaderpack'ler. Sunucu yüklemez. |
| `server-only-mods.txt` | Pakete girmeyen sunucu modları (Chunky, spark, FTB Ranks...) |
| `mods-disabled/` | Kaldırılmış ama geri dönüş için saklanan jar'lar |
| `config/`, `defaultconfigs/` | Mod ayarları. `config/` oyuncuya da gider (oyuncuda yoksa yazılır). |
| `world/serverconfig/` | Dünyaya özel ayarlar (FTB Ranks, OPAC...). **Sunucu kapanırken bu dosyaları yeniden yazar**: düzenlemek için önce durdur, düzenle, sonra başlat. |
| `kubejs/` | KubeJS script'leri. `server_scripts` için konsolda `reload`; `startup_scripts` için yeniden başlatma gerekir. |
| `config/ftbquests/quests/` | Görevler. Konsolda `ftbquests reload` ile uygulanır; oyuncuya sunucudan gönderilir, paket yayını gerekmez. |
| `easy_npc/` | Easy NPC verileri |
| `logs/latest.log`, `crash-reports/` | Loglar |

Rütbeler (`world/serverconfig/ftbranks/ranks.snbt`) konsolda `ftbranks reload` ile yenilenir.

**Spawn güvenli bölgesi:** `kubejs/server_scripts/anubis_hub_safe.js`, spawn çevresinde canavar doğmasını engeller ve bölgeye yürüyerek giren canavarları 5 saniyede bir siler. Bölge: x -984.5, z -375.5, 96 blok yarıçap, sadece Overworld. Elle temizlemek için konsolda `anubis_hub_temizle` yazılır. Canavar kontrolü `getEntityType().getCategory()` ile yapılır; KubeJS'te `entity.type` metin döndürür, sınıfı vermez.

---

## Script'ler ve komutlar

| Komut / dosya | Ne yapar |
|---|---|
| `guncelle` → `/root/repo/minecraft-servers/tools/vds/guncelle.py` | Havuzdaki değişiklikleri sunucuya, AnuDownloader'a ve Discord'a yansıtır. [guncelleme-akisi.md](guncelleme-akisi.md) |
| `havuz` → `/root/repo/minecraft-servers/tools/vds/havuz.py` | Değişiklik havuzu: `havuz ekle / liste / sil` |
| `/root/scripts/notify_pack.py` | Discord **Update** kanalına yama notu duyurusu. Webhook yalnızca burada durur. [patchnotes.md](patchnotes.md) |
| `/root/scripts/update_players.py` | Discord **servers** kanalındaki "sunucu açık / oyuncu sayısı" mesajını her dakika düzenler. Duyuru için kullanılmaz. |
| `/root/scripts/backup_fantasy.sh` | Dünya + ayar yedeği (aşağıda) |
| `/root/scripts/chunky_guard.py` | Sunucu boşken Chunky'yi düşük CPU ile çalıştırır, oyuncu girince durdurur. Dünya ön üretimi bitti; şu an boşta. |
| `/root/scripts/wl.py <isim>` | Oyuncuyu whitelist'e ekler (offline UUID ile) |
| `/root/scripts/maint-on.sh`, `maint-off.sh` | Discord durum mesajı için bakım bayrağı |

`guncelle` ve `havuz` repodaki `tools/vds/`'den `/usr/local/bin/`'e sembolik bağlıdır. Script'i değiştirmek için repoda düzenle, push et, VDS'te `git -C /root/repo/minecraft-servers pull` yap.

### Zamanlanmış görevler (root crontab)

```
* * * * *  update_players.py      Discord durum mesajı
0 4 * * *  backup_fantasy.sh      gece yedeği (UTC 04:00 = TR 07:00)
* * * * *  chunky_guard.py        Chunky bekçisi
```

### Repo kopyası

`/root/repo/minecraft-servers`, GitHub reposunun VDS'teki kopyasıdır. `guncelle` yayını buradan commit + push eder (commit yazarı "Anubis VDS"). Bu klasörde elle çalışılmaz; commitlenmemiş değişiklik varsa `guncelle` çalışmayı reddeder.

GitHub erişimi `gh` ile, yalnızca `minecraft-servers` reposuna **Contents: Read and write** izni olan bir fine-grained token ile yapılır. Token yalnızca VDS'te (`gh auth`) durur. Süresi dolarsa `guncelle` yükleme/push adımında hata verir; Anubis yeni token oluşturup şu komutla girer:

```bash
ssh -t root@31.58.91.7 gh auth login
```

(GitHub.com → HTTPS → "Paste an authentication token"). Ardından bir kez `gh auth setup-git` çalıştırılır.

---

## Oyun içi yönetici komutları (KubeJS)

Konsoldan ya da oyunda (op 2) çalışır. Sistem açıklamaları ilgili karakter dokümanlarında.

| Komut | Ne yapar |
|---|---|
| `/erwin_sifirla <oyuncu>` | Oyuncunun tüm Erwin ilerlemesini (rütbe, sefer, unvan, defter, dükkân stoğu, `erwin_met`) sıfırlar |
| `/erwin_rutbe <oyuncu> <0-4>` | Test için Birlik rütbesini doğrudan ayarlar ve Thorfinn stoğunu yeniler |
| `/thorfinn_sifirla <oyuncu>` | Thorfinn siparişini, toprak rütbesini, stoğunu ve `thor_met` etiketini sıfırlar |
| `function yoruichi:gojo_kur`, `function yoruichi:kenpachi_kur` | Gojo ve Kenpachi'yi doğurur (`gen_hocalar.js gojo ...`, `gen_kenpachi.js`; ikisi de geçici `forceload` kullanır, Owner/izin seviyesi doğurma NBT'sindedir). `_diyalog` fonksiyonları yalnızca diyalogları yeniler |
| `/aizen_durum`, `/aizen_evre <1-5>`, `/aizen_sifirla <oyuncu>`, `/aizen_odul <oyuncu>` | Aizen evresi ve kalan süre (evreler kendiliğinden ilerler), müdahale (3 yaralı, 4 ihanet, 5 kötü), oyuncu sıfırlama, Kyōka Suigetsu ödülü |
| `function yoruichi:aizen_kur`, `function yoruichi:aizen_diyalog` | Aizen'i komutu çalıştıranın bulunduğu yere doğurur; diyalogları yeniler (NPC yakındayken) |
| `function yoruichi:thorfinn_diyalog` | Thorfinn NPC'sinin adını, dokusunu ve diyaloglarını yeniler (`tools/yoruichi/gen_thorfinn.js` üretir) |
| `/hoca_sifirla <oyuncu>` | Oyuncunun Kakashi/Itachi ilerlemesini (seviyeler, ücret kayıtları, hediye bayrakları, aktif sınav) sıfırlar |
| `/yedek_test` | Oyuncu verisi yedeğinin Java çağrılarını sahte bir bölmeyle sınar; "BASARILI" yazmalı |
| `/anubis_hub_temizle` | Hub çevresindeki yüklü canavarları siler |
| `function yoruichi:erwin_setup` | Erwin'in diyalog ve yönlendirmelerini kurar/yeniler (konsol; `tools/yoruichi/gen_erwin.js` üretir) |
| `function yoruichi:kakashi_kur`, `function yoruichi:itachi_kur` | NPC'yi doğurur (önce `tools/yoruichi/gen_hocalar.js` ile üretilip datapack'e konur) |
| `function yoruichi:kakashi_diyalog`, `function yoruichi:itachi_diyalog` | Var olan hoca NPC’sinin yalnızca diyalogları yeniler (üretim: `HOCA_UUID=<npc-uuid> node gen_hocalar.js ...`). Kur fonksiyonları `forceload` ile yükler, aksi halde yüklenmemiş yığında Owner ve izin seviyesi yazılamaz |

Temizlik: takılı sahne varlıkları `/kill @e[tag=hoca_scene]`, karga sürüsü `/kill @e[tag=hoca_karga]`. Sınama listesi: [medieval-fantasy/test-erwin-hocalar.md](medieval-fantasy/test-erwin-hocalar.md).

## Yedekler

Hepsi `/root/backups/medieval-fantasy/` altındadır.

- **`auto/`**: `backup_fantasy.sh` her gece ve her `guncelle` başında alır. Dünya, `server.properties`, whitelist, ops, `config`, `kubejs`, `global_packs`. 7 günden eskiler silinir.
- **Elle alınan yedekler** `<tarih>-<neden>` adıyla (ör. `2026-09-26-before-castle-2`). Dünyada riskli bir iş (yapı yerleştirme, bölge silme, oyuncu verisi düzenleme) öncesinde alınır. Oyuncu verisi yedekleri `playerdata-<isim>-<tarih>` veya `<isim>-playerdata-before-<iş>.dat` adıyla tutulur.

Bir bölgeyi yedekten geri yüklemek için sunucu durdurulur, ilgili `region/`, `entities/`, `poi/` chunk'ları yedekten kopyalanır, sonra sunucu başlatılır.

---

## Diğer klasörler

| Yol | Ne |
|---|---|
| `/root/pending/` | Değişiklik havuzu ve arşivi ([guncelleme-akisi.md](guncelleme-akisi.md)) |
| `/root/mod-bekleyen/` | İndirilmiş ama henüz kurulmamış mod adayları |
| `/root/staging/` | Hazırlık alanı |
| `/root/dev/` | Mod kaynak/derleme çalışmaları (MDK, decompiler) |
| `/tmp/pa/` | Geçici script'ler (kalıcı değil) |
