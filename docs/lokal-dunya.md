# VDS dünyasını tek oyunculu modda çalışmak

VDS kapalıyken (taşınma sürecinde) sunucunun dünyasıyla yerelde çalışmak için: VDS yedeği indirilir, `saves/` altına ayrı bir dünya olarak açılır ve oyuncunun verisi tek oyunculu dünyanın istediği yere (level.dat'taki `Player`) aktarılır.

## Kurulum (2026-09-30'da yapıldı)

- **Kaynak:** VDS yedeği `20260929-2225.tar.gz` (güncelleme sonrası son yedek, 4,3 GB). İndirilen kopya `%LOCALAPPDATA%\Temp\vdsdl\` altında; istenirse silinebilir, asıl yedek VDS'te durur.
- **Konum:** `%APPDATA%\.minecraft\versions\Medieval Fantasy\saves\Medieval Fantasy VDS` (OneDrive dışında).
- **Oyuncu:** Sunucudaki swxff (UUID `f0993f6d-…`, çevrimdışı mod) ile yerel TLauncher hesabı (`5dac0ecf-…`) aynı UUID'yi kullanmaz. \`tools/nbt_tool.js singleplayer\` sunucudaki oyuncu dosyasını level.dat'a kopyalar (UUID'yi yerel hesaba çevirerek) ve cheats'i açar. Orijinal level.dat \`level.dat.vds-orijinal\` olarak saklanır.
- **Çalışmayanlar:** FTB Ranks sunucuya özel olduğundan tek oyunculuda yoktur (ad yanında Birlik rütbesi görünmez; Erwin/hoca/Thorfinn'in rütbe şartı kendi sayacına baktığı için çalışır). Easy NPC sahipliği UUID'ye bağlı olduğundan NPC'leri arayüzden düzenlemek yerine komutla düzenle (diyaloglar ve etkileşim etkilenmez).

## VDS'e geri taşırken

- **Script, config, doküman, datapack değişiklikleri** yerel profil ile VDS aynı dosyalardır; yeni VDS'e normal yoldan yüklenir (kubejs, config, `world/datapacks`).
- **Dünya değişiklikleri** (yapılar, NPC'ler) yalnızca yerel dünyada kalır. Yeni VDS'e taşırken iki yol vardır: yerel dünyayı yeni sunucunun \`world\` klasörü yap (en basit; oyuncu verisi için aşağıdaki komut), ya da VDS yedeğini kurup yalnızca gerekli değişiklikleri (NPC'ler, komutlar) yeniden uygula.
- **Oyuncu ilerlemesini sunucu UUID'sine geri aktarmak:** \`node tools/nbt_tool.js export-player "<dünya>" f0993f6d-14c8-31ac-87bd-e19999446b86\` (level.dat'taki Player'ı \`playerdata/f0993f6d-….dat\` olarak yazar; öncekini \`.oncesi\` diye saklar).
- Diğer oyuncuların ilerlemesi (Anubis vb.) VDS yedeğindeki \`playerdata\` dosyalarında durur; yerel dünyada onlarla oynanmaz.
