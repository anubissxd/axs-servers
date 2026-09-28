# AnuDownloader — Nasıl Çalışır

AnuDownloader, arkadaşların mod paketini kurup güncel tuttuğu Windows uygulamasıdır. Bu dosya, projede çalışan herkesin (ve Claude'unun) sistemi anlaması için yazıldı. Kaynak: `tools/anudownloader/`.

> **Kural (istisnasız):** Paketin oyunculara giden halini değiştirmek (manifest üretmek, GitHub Release'e dosya yüklemek, `index.json`'u güncellemek) **yalnızca Anubis veya swxff "Güncelle" dediğinde**, `guncelle` komutuyla yapılır (bkz. [guncelleme-akisi.md](guncelleme-akisi.md)). Yarım veya test edilmemiş bir paket herkesin kurulumunu bozar.

---

## 1. Parçalar

| Parça | Yer | Görevi |
|---|---|---|
| Uygulama | `tools/anudownloader/AnuDownloader.ps1` | PowerShell + WinForms arayüzü; `ps2exe` ile `AnuDownloader.exe`'ye derlenir |
| Kurulum | `tools/anudownloader/Setup.iss` → `AnuDownloader-Setup.exe` | Inno Setup installer; GitHub Release `anudownloader`'a yüklenir |
| Paket listesi | `distribution/index.json` | Uygulama sürümü + her paketin sürümü, manifest ve yama notu adresleri |
| Paket içeriği | `distribution/<paket>/manifest.json` | Paketteki her dosya: yol, SHA-256, indirme URL'si |
| Yama notları | `distribution/<paket>/patchnotes.md` | Uygulamadaki "Yama Notları" penceresinde gösterilir |
| Silinecekler | `distribution/<paket>/remove.txt` | Oyuncudan da silinmesi gereken dosyalar (manifest'in `remove` alanına yazılır) |
| Paket üretici | `tools/anudownloader/Build-Manifest-VDS.ps1` | Paketi **VDS'teki sunucu klasöründen** üretir |
| Dosyalar | GitHub Releases (`medieval-fantasy-pack`, `medieval-fantasy-pack-overflow`) | Mod/config dosyalarının indirildiği yer |

Şu an `index.json`'da yalnızca **Medieval Fantasy** paketi var.

---

## 2. Oyuncu tarafında ne olur

1. Uygulama `index.json`'u okur. Sırayla: GitHub **contents API** (önbelleksiz, push anında güncel) → `raw.githubusercontent.com` → jsDelivr (ikisi de önbellekli; yedek olarak).
2. Uygulamanın kendi sürümü `index.json`'daki `app.version`'dan eskiyse güncelleme teklif eder ve `setup_url`'deki installer'ı indirip çalıştırır.
3. Oyuncu paketi ve launcher'ını seçer: **Modrinth App, CurseForge veya TLauncher**. Uygulama ilgili profil klasörünü (`folder_name`) diskte kendisi bulur.
4. Güncelleme başlarken açık launcher'ları ve oyunu kapatır; bittiğinde Modrinth / CurseForge'u yeniden açar (TLauncher açılmaz).
5. `manifest.json`'daki her dosyanın SHA-256'sı yereldekiyle karşılaştırılır; **yalnızca değişen veya eksik dosyalar** indirilir (paket baştan inmez).
6. **Config dosyaları yalnızca oyuncuda yoksa yazılır** (oyuncunun ayarları ezilmesin diye). İstisna: sunucuyla aynı olması zorunlu olan birkaç ayar her seferinde yeniden yazılır (`Test-AnuSeedOnlyPath` içindeki `$alwaysSync` listesi).
7. `mods/` klasöründe manifest'te olmayan **gevşek `.jar` dosyaları silinir** (paketten çıkarılan modlar). Resourcepack, shaderpack gibi diğer dosyalar yalnızca manifest'in `remove` listesindeyse silinir.
8. Modrinth kullanıyorsa silinen dosyaların Modrinth veritabanı kayıtları da temizlenir; JVM ayarları ve etkin resourcepack listesi (`enabled_resourcepacks`) ayarlanır.
9. Sonunda özet gösterilir (indirilen / silinen dosya sayısı).

---

## 3. Paket nasıl üretilir (VDS = tek kaynak)

**VDS hem sunucunun hem oyuncu paketinin tek kaynağıdır.** Mod eklemek, güncellemek, kaldırmak yalnızca VDS'te yapılır; paket oradan üretilir. Kimsenin kendi bilgisayarındaki Modrinth profiline dosya koyulmaz (o profil AnuDownloader'ı test etmek için kullanılır).

VDS klasörü (`/root/servers/medieval-fantasy`) → oyuncudaki klasör:

| VDS'te | Oyuncuda | Not |
|---|---|---|
| `mods/` | `mods/` | Sunucunun çalıştırdığı modlar (iki tarafta gerekenler) |
| `client-extra/mods/` | `mods/` | Sadece oyuncuda çalışan modlar; sunucu yüklemez |
| `client-extra/resourcepacks/`, `client-extra/shaderpacks/` | `resourcepacks/`, `shaderpacks/` | |
| `config/`, `kubejs/`, `global_packs/required_data/` | aynı adla | Config yalnızca oyuncuda yoksa yazılır |
| `server-only-mods.txt` | — | Pakete **girmeyen** sunucu modları (Chunky, spark, FTB Ranks...) |

**Bir modun tarafını seçerken dikkat:** Ağ kanalı açan veya blok/eşya/entity gibi senkronize kayıt ekleyen bir mod **iki tarafta da** olmalıdır; bunu jar'ı inceleyerek kontrol edin, tahmin etmeyin. Yanlış tarafa konan mod, oyuncunun sunucuya bağlanmasını engeller ("mismatched mod channel list" / "Your client is missing...").

**Bir modu kaldırmadan önce** sadece bağımlılıklarına değil `META-INF/coremods.json` ve mixin hedeflerine de bakın: bazı jar'lar başka modları çalışır tutan yamalar taşır (ör. `bielgg_spells-1.5-patchwork.jar` Cataclysm uyumluluk yamasını taşır).

---

## 4. Yayınlama adımları

**Normal yol: VDS'te `guncelle`.** Aşağıdaki adımların hepsini (manifest, yükleme, URL testi, yama notu, sürüm, commit, SHA sabitleme, purge, Discord) tek komut yapar. Anlatımı: [guncelleme-akisi.md](guncelleme-akisi.md). Kod: `tools/vds/guncelle.py`. Manifest üretimi `Build-Manifest-VDS.ps1` ile aynı mantıktadır (aynı klasör eşlemesi, aynı hariç tutulan dosyalar, aynı asset adı dönüşümü); birinde değişiklik yapılırsa öbürüne de yapılır.

Aşağıdaki elle yöntem yalnızca `guncelle` çalışmazsa, Anubis'in Windows bilgisayarından yedek olarak kullanılır:

1. **Manifest'i üret:**
   ```powershell
   cd tools/anudownloader
   .\Build-Manifest-VDS.ps1 -ServerPath /root/servers/medieval-fantasy -Tag medieval-fantasy-pack-overflow `
       -PackName "Medieval Fantasy" -ManifestOut ..\..\distribution\medieval-fantasy\manifest.json -Version <sürüm>
   ```
   Sadece yeni/değişen dosyalar Release'e yüklenir; değişmeyenler eski URL'lerini korur. Ana release (`medieval-fantasy-pack`) GitHub'ın 1000 dosya sınırında dolu olduğu için yeni dosyalar `-overflow` release'ine gider.
2. **URL'leri test et** (yayından **önce**, sonucu görerek): manifest'teki her URL `302` dönmeli. Aynı anda çok istek atmayın (8 paralel yeterli); GitHub fazlasına geçici `502` döndürür.
3. `patchnotes.md`'yi yaz (içeriği proje sahibi verir; eski içerik silinir, yenisi yazılır) ve `index.json`'da paketin `version`'ını artır. Pakete gerçek bir değişiklik yoksa ikisine de dokunulmaz.
4. `manifest.json` + `patchnotes.md`'yi commit + push et.
5. `git rev-parse HEAD` ile commit SHA'sını al; `index.json`'daki `manifest_url` ve `patchnotes_url`'yi **o SHA'ya sabitle**:
   `https://raw.githubusercontent.com/anubissxd/minecraft-servers/<40-hane-SHA>/distribution/<paket>/manifest.json`
   (Sabitlenmemiş `main` adresleri önbellekten eski içerik döndürebiliyor; SHA'lı adres her yayında değiştiği için bu sorun olmaz.)
6. `index.json`'u commit + push et. (Eski uygulama sürümleri için jsDelivr purge da çağrılır.)
7. **Discord duyurusu:**
   `ssh root@31.58.91.7 python3 /root/scripts/notify_pack.py "<Paket Adı>" <sürüm> < distribution/<paket>/patchnotes.md`
   Webhook adresi yalnızca VDS'teki script'te durur; repoya girmez. Ayrıntılar: [patchnotes.md](patchnotes.md).
8. Havuzu elle arşivle: `/root/pending/medieval-fantasy.jsonl` içeriğini `/root/pending/archive/`'e taşı.

**Yayın gerektirmeyenler:** FTB Quests görevleri (görev kitabı oyuncuya sunucudan gönderilir), sunucu-only ayarlar, dünyaya/NPC'lere yapılan değişiklikler.

**Silinen dosyalar:** Paketten bir resourcepack/shaderpack/config çıkarıldıysa veya eskisi yenisiyle değiştirildiyse, oyuncudaki yolu `distribution/<paket>/remove.txt`'e eklenir; build script bunu manifest'in `remove` alanına yazar.

---

## 5. Uygulamanın kendisini güncellemek

1. `AnuDownloader.ps1`'i düzenle, uygulama sürümünü artır.
2. **Derlemeden önce sözdizimi kontrolü zorunlu** (`ps2exe` script'i ayrıştırmadan gömer; hatalı bir exe herkeste açılmaz):
   ```powershell
   $errors = $null
   $null = [System.Management.Automation.Language.Parser]::ParseFile('AnuDownloader.ps1', [ref]$null, [ref]$errors)
   if ($errors) { $errors | % { "satir $($_.Extent.StartLineNumber): $($_.Message)" }; throw "syntax hatasi" }
   ```
3. `ps2exe` ile exe'yi, Inno Setup (`ISCC.exe Setup.iss`) ile installer'ı derle.
4. Exe'yi bir kez aç: görünür pencere sayısı 1 ve başlığı "AnuDownloader" olmalı (hata kutusu da aynı başlığı taşır; "işlem ayakta" yeterli değildir).
5. Installer'ı `anudownloader` release'ine yükle, `index.json`'da `app.version`'ı artır.

Bozuk bir sürüm yayınlanırsa onu kuranlar uygulamayı açamaz, dolayısıyla uygulama içi güncellemeyi de kullanamaz: düzeltilmiş installer'ın linki onlara elle verilir.
