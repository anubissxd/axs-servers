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

**Gojo şimdilik pasif:** Blue/Red/Purple öğretimi kapalı (Gojo savar); `hocalar_egitim.js` içinde `HOCA_DEVRE_DISI` ve `gen_hocalar.js` içinde Gojo `pasif: true`. Yeni VDS'te `gojo_diyalog` fonksiyonu **savan** diyaloglarla yazılmalı; açmak için [gojo.md](medieval-fantasy/characters/gojo.md) başındaki notu izle.

### Sonradan eklenenler (2026-09-30, aynı gün)

| Dosya | Ne |
|---|---|
| `server_scripts/npc_cesitlilik.js` | **yeni**: NPC diyalog sürümü etiket döndürme (Erwin, Thorfinn, Kenpachi, Yoruichi) |
| `server_scripts/kenpachi.js` | değişti: kapışma sistemi, `/kenpachi_sifirla` |
| `server_scripts/thorfinn_ticaret.js` | değişti: hayvancılık, mevsim, gece nöbeti, Birlik ikmali, hikâye, ödül azaltma |
| `server_scripts/erwin_seferleri.js` | değişti: ödül azaltma (2. tur) |
| `server_scripts/sinema_motoru.js` | değişti: `kenpachiFightBegin` izinli fn |
| datapack fonksiyonları | `erwin_setup(2)`, `thorfinn_diyalog(2)`, `kenpachi_diyalog(2)`, `yoruichi_cesit(2)`, `tum_diyaloglar_yenile` |

Yeni VDS'te diyalogları tek seferde yazmak için: `reload`, sonra `function yoruichi:tum_diyaloglar_yenile` (Erwin, Thorfinn, Kenpachi, Yoruichi ve üç hocayı sırayla günceller; 3-4 sn bekle). Yoruichi'nin çeşitlilik fonksiyonu `gen_yoruichi_cesit.js` ile **orijinal** Yoruichi verisinden (`tools/nbt_tool.js dump`) üretilir; kalıcı olarak oyunda çalıştırılır.

### Aizen (2026-09-30)

| Dosya | Ne |
|---|---|
| `server_scripts/aizen.js` | **yeni**: evreler, yardım/araştırma, ihanet olayı, boss kapışması, komutlar |
| `startup_scripts/aizen_spell.js` | **yeni**: Kyōka Suigetsu büyüsü (oyun/sunucu yeniden başlatma) |
| `assets/kubejs/lang/*.json`, `textures/gui/spell_icons/kyoka_suigetsu.png` | büyü adı ve ikonu |
| `server_scripts/npc_cesitlilik.js`, `sinema_motoru.js` | `aizen` çeşitliliği, `aizenFightBegin` izinli fn |
| datapack | `aizen_kur`, `aizen_diyalog(2)` (NPC yeni VDS'te bir kez `aizen_kur` ile doğurulur; evre `/aizen_evre`) |
| `assets/npc-skins/aizen_v1.png`, `aizen_v2.png` | GitHub'da |

Not: Aizen NPC'si yerel dünyada henüz doğurulmadıysa yeni VDS'te `aizen_kur` ile doğurulur (koordinat verilmez, yerinde durarak çalıştırılır). Sunucu evresi dünya verisindedir (`aizen_evre`); yeni VDS'te bu dünya kullanılırsa korunur, yeni dünyada 1'den başlar.

**Havuza eklenecek oyuncu cümleleri:** Erwin seferlerinin zümrüt ödülleri biraz düştü; NPC'ler artık her konuşmada farklı karşılama repliği söylüyor; Thorfinn'e gece nöbeti, Birlik ikmali, hayvancılık ve mevsim siparişleri ile hikâye bölümleri geldi; Kenpachi'ye meydan okuyup kapışabilirsin (Gece Avcısı ve üstü), yenersen Nozarashi kılıcını verir. Caddy'ye yardımsever bir âlim olan Aizen geldi; ona dikkat et.

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
