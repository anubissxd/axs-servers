# Singleplayer'da geliştirilenler: yeni VDS'e aktarma notları

Eski VDS kapatıldıktan sonra (2026-09-30) yeni işler **VDS yedeğinden kurulan yerel tek oyunculu dünyada** geliştirildi ([lokal-dunya.md](lokal-dunya.md)). Yeni VDS gelince aşağıdakilerin hepsi oraya taşınmalı. Genel VDS geri kurulumu: [vds-tasima.md](vds-tasima.md). Bu dosya yalnızca **yedekten sonra eklenenleri** listeler.

**Güncel durum kontrolü:** Eski VDS'teki son yayın paket **1.3.7** (2026-09-29 22:28). Aşağıdaki dosyalar 1.3.7'den **sonra** değişti/eklendi (eski VDS'teki dosyalarla karşılaştırılarak doğrulandı). Yeni bir şey eklenince bu listeye eklenir.

## 1. Değişen ve yeni dosyalar

Yerel profil: `%APPDATA%\.minecraft\versions\Medieval Fantasy\` (yeni VDS'te `/root/servers/medieval-fantasy/`).

| Dosya (kubejs/ altında) | Durum | Ne |
|---|---|---|
| `server_scripts/hocalar_egitim.js` | değişti | Karşılama repliklerinin dönmesi (`hocaRerollGreeting`, `hoca_kn_*` / `hoca_reroll_*` etiketleri); Gojo büyülerinin kimlikleri `kubejs:gojo_blue/red/purple` ve parşömen adı (alias) Blue/Red/Purple |
| `startup_scripts/gojo_spells.js` | **yeni** | Blue, Red, Purple büyüleri (Iron's Gravity Fissure / Shockwave / Eldritch Blast'ten ödünç etki, kendi mana/bekleme/nadirlik) |
| `assets/kubejs/lang/en_us.json`, `tr_tr.json` | değişti | `spell.kubejs.gojo_blue/red/purple` adları ve açıklamaları |
| `assets/kubejs/textures/gui/spell_icons/gojo_blue.png`, `gojo_red.png`, `gojo_purple.png` | **yeni** | İkonlar (16×16; repoda `assets/spell-icons/` altında da var) |

**Dünya verisi (datapack fonksiyonları):** `world/datapacks/yoruichi/data/yoruichi/functions/` içine şu dosyalar eklendi (yerel dünyada var, repoda yok; üreticiden yeniden üretilebilir):

- `kakashi_diyalog.mcfunction`, `kakashi_diyalog2.mcfunction`, `itachi_diyalog(2).mcfunction`, `gojo_diyalog(2).mcfunction`, `hocalar_diyalog_hepsi.mcfunction`

Üretim (repodaki [tools/yoruichi/gen_hocalar.js](../tools/yoruichi/gen_hocalar.js)): `HOCA_UUID=<npc-uuid> node gen_hocalar.js <kakashi|itachi|gojo> <datapack> <owner-uuid> <x> <y> <z> 0`. NPC uuid'leri: Kakashi `6de0f631-c97e-44de-a0ea-d1778f073f74`, Itachi `6ea2c950-4873-485e-afb6-6b74c244f238`, Gojo `6bbe609e-4759-4904-9795-3e7974da69f8`. Koordinatlar: Kakashi -786.5 72 -331.5, Itachi -805.5 72 -475.5, Gojo -820 69 -473.

## 2. Yeni VDS'te sırayla

1. **Önce genel geri kurulum** ([vds-tasima.md](vds-tasima.md)): sunucu klasörü, mod jar'ları, config, kubejs (1.3.7 hâli).
2. **Bu listedeki dosyaları üzerine yaz** (yukarıdaki tablo). Startup script ve dil/ikon dosyaları **paketin parçası**: `guncelle` bunları oyuncu paketine de koyar.
3. **Yerel dünyayı VDS dünyası yapıyorsan**: `world/` yerine yerel dünyayı koy, sonra oyuncu ilerlemesini sunucu UUID'sine aktar: `node tools/nbt_tool.js export-player "<dünya>" f0993f6d-14c8-31ac-87bd-e19999446b86` ([lokal-dunya.md](lokal-dunya.md)). **Yeniden yapmayacaksan** (VDS yedeğinden kurulmuş dünyayla devam edeceksen) yerel dünyadaki yapı/NPC değişikliklerini elle uygula (aşağıda §4).
4. **Hocaların yeni diyaloglarını yaz:** dünya yedeğinde eski diyaloglar var. `world/datapacks/yoruichi/.../functions/` içine fonksiyonları koy, konsolda `reload`, sonra `function yoruichi:hocalar_diyalog_hepsi` (3-4 sn bekle: önce yığınları yükler, sonra yazar).
5. **Sunucuyu yeniden başlat** (startup script yüklensin), sonra `guncelle --kim swxff --kuru` ile bak; dosyalar havuz kayıtlarıyla açıklanmalı (§3). Kural: yalnızca kullanıcı "Güncelle" deyince.
6. **Test:** [test-erwin-hocalar.md](medieval-fantasy/test-erwin-hocalar.md) bölüm H (Gojo, Kenpachi, rütbe başlığı) ve karşılama repliklerinin dönmesi.

## 3. Havuza yazılacak oyuncu cümleleri

Yeni VDS'te havuz boşsa `havuz ekle swxff paket "..."` ile şunları yaz (yama notu bu cümlelerden oluşur):

- Büyü hocaları (Kakashi, Itachi, Gojo) artık tanıştıktan sonra da her gelişinde isteksiz ve farklı bir replikle karşılıyor; menü ancak "öğrenmek istiyorum" denince açılıyor.
- Gojo'nun büyüleri artık kendi adlarıyla: **Blue**, **Red** ve **Purple**. Büyü kitabında ve aramada bu adlarla bulunuyor, kendi ikonları var.

## 4. Kaybolmaması gerekenler (yerel dünyada durur)

- Yerel dünyadaki yapı/NPC değişiklikleri **repoya girmez.** Şu an yerel dünyada VDS yedeğine göre **dünya olarak değişen bir şey yok** (yalnızca hoca diyalog fonksiyonları çalıştırıldıysa NPC verisi değişir, o da yukarıdaki adımla yeniden üretilir).
- Bundan sonra yerel dünyada bir NPC eklenirse (konum, uuid, üretici komutu) buraya not düş, yoksa yeni VDS'e geçince kaybolur.
- Oyuncu ilerlemesi (swxff'in sefer/hoca/Thorfinn kayıtları) yerel dünyanın level.dat'ında; sunucuya `export-player` ile aktarılır.

## 5. Bilinen tuzaklar

- `data modify entity` ile NPC verisi yazmak **yüklenmemiş yığında sessizce başarısız olur** (Owner/izin seviyesi kaybolur). Hoca fonksiyonları iki aşamalıdır (önce `forceload`, 3 sn sonra yazma). Yeni NPC'ler için üreticiler Owner ve izin seviyesini doğurma NBT'sine koyuyor.
- FTB Ranks tek oyunculuda yoktur; Birlik rütbeleri (Yeminsiz ... Eşik Muhafızı) `world/serverconfig/ftbranks/ranks.snbt` içinde tanımlı (güç 70-74). Yeni VDS'te bu dosyanın yedekteki hâlinde bulunduğunu doğrula; yoksa [medieval-fantasy/characters/erwin-smith.md](medieval-fantasy/characters/erwin-smith.md) içindeki FTB Ranks bölümündeki tanımdan yeniden yaz ve `ftbranks reload` çalıştır.
- Startup script değişikliği için sunucu **ve oyuncular** oyunu tamamen yeniden başlatmalı; paket güncellenmeden oyuncular Blue/Red/Purple'ı görmez.
