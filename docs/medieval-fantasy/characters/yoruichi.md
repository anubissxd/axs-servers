# Yoruichi

- **Tür:** İnsan (easy_npc:humanoid_slim, Alex/ince kol). Önceden kediydi. Skin: [yoruichi.png](../../../distribution/medieval-fantasy/npc-textures/yoruichi.png) (uzak URL, `SECURE_REMOTE_URL`, `main` dalındaki raw adresi; diğer NPC dokuları gibi). Oyuncuların görebilmesi için dosyanın GitHub'a push edilmiş olması gerekir.
- **Konum (planlanan, VDS):** Vlorya Kalesi (-673, -262) civarı, kale dışında bir yerde. Kesin koordinat VDS'e yerleştirilirken terrain'e göre ayarlanır.
- **Konum (local test):** Dünya spawn'ına yakın (112, 87, -96) — sadece diyalog/mekanik testi için, final değil.
- **Krallık:** [Vlorya](../kingdoms/vlorya.md) — resmi üye değil, bağımsız, kalenin çevresinde dolaşan gizemli bir kedi.
- **Görevi:** Şartı sağlayan oyunculara Shunpo (Flash Step) eğitimi verir.
- **İlişkiler:** Kimseyle bağı açıklanmaz — gizemini korur.

## Konsept

Bleach'teki Yoruichi Shihouin'den ilham alınmıştır: gerçekte kim olduğunu saklayan, sıradan bir kara kedi kılığında dolaşan bir usta. Oyuncular onu **bulduklarında** (ekstra rütbe şartı yok — keşif tek şart) eğitim teklifini alabilir.

## Eğitim şartı

Yalnızca onu bulmuş olmak yeterli. Rütbe veya krallık bağı gerekmez.

## Diyalog akışı (taslak — test aşamasında)

**D1:** "Hmm... buralarda daha önce görmediğim bir surat."
→ [Konuşan bir kedi mi?]

**D2:** "Çevik görünüyorsun. Ama çeviklik sadece konuşmakla olmaz - göstermek gerekir."
- **[Bana öğret.]** → Oyuncu `yoruichi_tanisti` etiketini alır, eğitim aşamasına geçer.
- **[Sadece bir kedisin.]** → Diyalog kapanır, tekrar konuşulabilir (etiket verilmez).

**D3 (eğitim kabul edilince):** "İyi. O zaman beni takip et - görebilirsen."

## Uygulanan mekanikler (yalnızca local singleplayer testinde, VDS'e gönderilmedi)

Kaynak: `%APPDATA%\.minecraft\versions\Medieval Fantasy\kubejs\server_scripts\`

- `yoruichi_chase.js`: `yoruichi_tanisti` etiketli oyuncu 5 blok yaklaşınca Yoruichi sabit waypoint'lerden birine ışınlanır (POOF/CLOUD + `kubejs:flashstep` sesi + action bar'da laf atma). 6 kaçıştan sonra oyuncu `yoruichi_caught` alır; 30 sn hareketsizlikte sayaç sıfırlanır.
- Öğrenme sahnesi (`yoruichi_chase.js` sonu): yakalanınca ~15 sn sürer. "Yakaladın." başlığı, Yoruichi'nin hız konuşması (chat), biriken şimşek kıvılcımları, gök gürültüsü ve altın "SHUNPO / Flash Step öğrenildi" başlığı, 8 sn Hız III, sonra Yoruichi flash step ile kaybolur. Sadece komut kullanır, oyuncunun konumuna dokunmaz.
- **Flash Step artık bir Iron's Spells büyüsü** (`startup_scripts/flashstep_spell.js`, okul Ender, nadir, 3 seviye). Mantık `server_scripts/yoruichi_flashstep_fx.js` içindeki `global.flashstepCast`'te. Bakış yönünde en fazla 10 blok ışınlanır; engel (duvar, tavan, zemin) varsa onun hemen önünde durur. 10 blok içinde doğrudan bakılan bir canlı varsa (`korunan` etiketli NPC'ler hariç) onun ARKASINA geçer ve ona döner. 3 seviye: L1 7 blok/1 hak/3 sn/20 mana, L2 12 blok/2 hak/2 sn/25 mana, L3 15 blok/3 hak/1,5 sn/30 mana; Scroll Forge'da craftlanamaz ve loot olarak bulunamaz (`canBeCraftedBy` false, `setAllowLooting` false); açıklamalar İngilizce, Iron's formatında (`FLASHSTEP_RANGES/CHARGES/RECHARGES`). Yoruichi L1 parşömeni verir; L2 ve L3 Yoruichi görev zinciriyle verilecek (görevler henüz tasarlanmadı). `combat_dash`'e dokunmaz. Yoruichi sahnesinin sonunda oyuncuya parşömen verilir. Hedefin arkasına geçince hedefe 2 sn sersemleme (Yavaşlık 7 + zıplayamama) ve kısa vuruş (4 hasar, `FLASHSTEP_HIT_DAMAGE`) uygulanır. Görsel: kalkışta siyah siluet (artçı görüntü), varışta iç ve dış siyah yer halkası, siyah hız çizgileri. `/tp` komutu Grand Teleport animasyonunu tetiklediği için hedefe dönme `p.connection.teleport` ile yapılır. Startup script olduğu için değişiklik oyunu baştan açmayı gerektirir. Eskiden `combat_dash` cooldown düşüşüne bindirilen sürüm kaldırıldı (kayma iptal edilemiyordu).
- Görsel: `kubejs/assets/minecraft/textures/particle/sonic_boom_0..15.png` yatay hız çizgisi dokusuyla değiştirildi (16 kare, açık + koyu mor çizgiler, hızla solar). Flash Step bu partikülü kaybolma noktasında, yol boyunca (1,5 blokta bir), varışta ve oyuncunun kendi gözünün önünde spawn eder. Ek olarak ters yöne akan `end_rod` çizgileri, `electric_spark` ve zemin bloğunun toz parçacıkları (`block` particle) vardır. Yan etki: Warden'ın ses dalgası da artık bu dokuyla görünür (Warden çok nadir).
- Ses: `kubejs/assets/kubejs/sounds/flashstep.ogg` + `sounds.json`.

VDS'e taşırken: `YORUICHI_UUID_STR` ve `YORUICHI_WAYPOINTS` Vlorya'daki yeni NPC'ye göre güncellenmeli; diyalog ve `ON_INTERACTION` NPC entity'sindedir, dosya değildir.

## Planlanan eğitim akışı (henüz uygulanmadı)

1. **Beni yakala:** Kısa bir takip rotası, Yoruichi kaçar, oyuncu izler. Ders: hız önemli.
2. **Deneme:** Oyuncuya geçici hız/zıplama efekti verilip kısa bir parkur/zaman denemesi yaptırılır.
3. **Açılış:** Yoruichi gerçek yeteneği verir (Shunpo — anlık kısa mesafe teleport + after-image efekti, Rasengan/Chidori gibi Iron's Spells custom spell olarak kurulacak).

Bu üç aşama henüz teknik olarak kurulmadı; şu an sadece D1-D3 tanışma diyaloğu test ediliyor.

## Notlar

- Görsel: Easy NPC'nin native `minecraft:black` kedi varyantı kullanılıyor, özel doku (skin) yok — Miu'nun aksine.
- Teknik detaylar (NBT alanları, komutlar) için [quest.md](../quest.md)'deki Easy NPC bölümüne bakılabilir.

## Flash Step seviyeleri ve görev zinciri (taslak, NPC'ye henüz bağlanmadı)

Kod: `kubejs/server_scripts/yoruichi_l2.js` (sayaç), `yoruichi_flashstep_fx.js` (işaretleme). Tüm etiketler ve komutlar NPC diyalog düğmelerinden verilir (NPC'nin `ActionPermissionLevel` değeri 3 olmalı, `@initiator` konuşan oyuncudur, bkz. [quest.md](../quest.md)).

### L1 (mevcut)
İlk konuşma, kovalamaca, "Shunpo" sahnesi. Sonunda L1 parşömeni verilir. Etiketler: `yoruichi_tanisti` → `yoruichi_caught`.

### L2 — "Beş Gölge"
**Kural:** Flash Step ile bir düşmanın arkasına geçilince düşman işaretlenir (2 dakika). İşaretli düşmanın **son vuruşunu** oyuncu yaparsa sayılır. Süre sınırı yoktur (can ve silah gücü fark etmesin). 5 düşmandan sonra oyuncu `yoruichi_l2_done` alır. Sayaç oyuncunun `persistentData.flashstep_kills` alanındadır.

**Diyalog akışı (taslak):**

- **D-L2-1** (`yoruichi_caught` var, `yoruichi_l2` yok): "Tek adım atmayı öğrendin. Bir gölge tek adımla doğmaz, çocuk. Beş düşman seç. Arkalarına geç. Onlar seni fark etmeden bitir. Sonra bana dön."
  - **[Hazırım.]** → `tag @initiator add yoruichi_l2` — "Güzel. Gözlerin açık olsun."
  - **[Sonra.]** → "Acele etme. Ben buralardan gitmem."
- **D-L2-2** (`yoruichi_l2` var, `yoruichi_l2_done` yok): "Henüz bitmedi. Saymayı bilirsin: beş gölge. Arkalarına geç, sen bitir."
- **D-L2-3** (`yoruichi_l2_done` var): "Beş gölge, beş sessiz son. Fena değil... hiç fena değil. Al bunu. Adımların artık daha uzağa uzanacak."
  - **[Teşekkürler.]** → `give @initiator irons_spellbooks:scroll{"irons_spellbooks:spell_container":{data:[{id:"kubejs:flashstep",index:0,level:2,locked:1b}],maxSpells:1,mustEquip:0b,spellWheel:0b}} 1` ve `tag @initiator add yoruichi_l2_claimed`.

### L3 — "Gölge Klon" (mini boss)
Kod: `kubejs/server_scripts/yoruichi_l3.js`. Diyalogtan `yoruichi_l3_start` etiketi verilir; oyuncunun yakınında bir **Gölge Klon** doğar (vindicator, siyah deri zırh, demir kılıç, 150 can, geri itilmez, ganimet yok; tag'leri `yoruichi_shadow` ve `ysh_<oyuncu uuid>`). Kurallar: gölgeye **yalnızca sahibi ve yalnızca arkasından** hasar verilebilir (saldırganın gölgeye göre yönü, gölgenin baktığı yönün arkasında olmalı; aksi halde vuruş iptal edilir ve action bar'da uyarı çıkar). Gölge her 3–5 sn'de oyuncunun 4–7 blok çevresinde rastgele bir yere ışınlanır. 3 dakikada yenilemezse, oyuncu ölürse ya da çıkarsa gölge kaybolur ve `yoruichi_l3` etiketi silinir (ceza yok, tekrar denenir). Öldürülünce oyuncu `yoruichi_l3_done` alır; Yoruichi ile konuşunca L3 parşömeni verilir (`yoruichi_l3_claimed`).

Diyaloglar: `l3_teklif`, `l3_devam`, `l3_odul`, `l3_bitti`. Bağlamak için (L2'den sonra): `/function yoruichi:wire_l3`.

### L2 diyaloglarını NPC'ye bağlamak (datapack)
`saves/<dünya>/datapacks/yoruichi_l2/` (üretici: oturum scratchpad'i, `gen_dp2.js`) tek seferlik `yoruichi:wire_l2` fonksiyonunu içerir. Yoruichi'nin yakınındayken: `/reload`, `/datapack enable "file/yoruichi_l2"`, `/function yoruichi:wire_l2`. Fonksiyon `l2_teklif`, `l2_devam`, `l2_odul`, `l2_bitti` diyaloglarını ekler ve `ON_INTERACTION` yönlendirmesini etiketlere (`yoruichi_l2`, `yoruichi_l2_done`, `yoruichi_l2_claimed`) göre yeniden yazar. NPC'ye `yoruichi_l2_wired` etiketi koyar, ikinci çalıştırmada yeniden bağlamaz. UUID (`5a1afe8a-...`) yalnızca local test NPC'sine aittir; VDS'te yeni UUID ile üretilmelidir. Yedek: `easy_npc/backup/`.

### Kediden insana dönüşüm (datapack)
`saves/<dünya>/datapacks/yoruichi_l2/` içindeki `yoruichi:human` fonksiyonu eski kedi NPC'nin konumunda yeni bir `easy_npc:humanoid_slim` doğurur (tüm diyaloglar ve yönlendirmeler dahil, tag'ler: `korunan`, `yoruichi_npc`), kediyi siler. Yeni UUID: `fff2c1ae-28c0-4f9c-858b-94f7cbc0ca8e` (`yoruichi_chase.js` içindeki `YORUICHI_UUID_STR` ve `type=easy_npc:humanoid_slim` seçicileri buna göre güncellendi). Kullanım: Yoruichi'nin yakınında `/reload`, `/function yoruichi:human`. Üretici: `tools/yoruichi/gen_human.js`. VDS'e taşınırken aynı üretici yeni UUID'yle çalıştırılır.

**Büyü adı:** oyunda "Shunpo" (büyü kimliği hâlâ `kubejs:flashstep`, eski parşömenler çalışır). İkon: `shunpo_16x16.png`.

### Konum (VDS, Caddy bölgesi, Vlorya'ya bağlı tarafsız nokta)
- **Oturduğu yer (ev):** -1031.573, 81.5, -337.264 (`YORUICHI_HOME`, `yoruichi_chase.js`). Oturma animasyonunda durur (poz arayüzden seçilecek, anahtar henüz bilinmiyor).
- **İlk Shunpo (kaçış) noktası:** -1033.554, 72, -318.817 (`YORUICHI_FIRST_HOP`). Sonraki atlamalar bu yönde ileriye doğru otomatik üretilir (12–18 blok, zemin kontrolüyle). Kimse kovalamazsa 60 sn sonra eve döner.
- Skin push edilmeden önce konumlar sabitlenecek; VDS'e "Güncelle" ile gidecek.
- **Bakış yönü:** Yoruichi evinde **güneye (+Z)** bakar (`yaw -1.4`, `pitch 0`). Eve dönerken bu yöne çevrilir.
- **Gölge Klon (L3):** İlk Shunpo noktasında (`-1033.554, 72, -318.817`) doğar; nokta yüklü değilse (yerel test) oyuncunun yakınına düşer.
- **Geri sayım:** Yoruichi evde değilken 60 sn'lik eve dönüş süresi, 60 blok içindeki oyunculara action bar'da gösterilir ("Yoruichi eve dönüyor: N sn").

### VDS kurulum durumu (2026-09-29)
- **Yapıldı (etkin değil):** Shunpo büyüsü, kovalama/L2/L3 script'leri, lang, ses, ikon, sonic_boom dokuları ve 4 eski büyüde Scroll Forge/loot kapatma `kubejs/` altına kopyalandı (yedek: `/root/backups/medieval-fantasy/2026-09-29-before-shunpo-kubejs`); havuza iki kayıt yazıldı. Sunucu yeniden başlatılmadı, paket yayınlanmadı.
- **Datapack hazır, etkin değil:** `world/datapacks/yoruichi/` (üretici: `tools/yoruichi/gen_vds.js`, çıktı: `human`, `human_lock` fonksiyonları). "Güncelle"den sonra konsolda/oyunda: `/datapack enable "file/yoruichi"`, `/reload`, Anubis ya da swxff OP olarak `/function yoruichi:human` (NPC'yi ev noktasında doğurur, Owner'ı çalıştıran yapar), ardından `/function yoruichi:human_lock`. Sonra oturma pozu arayüzden seçilir.
- Bekleyen: oturma pozu anahtarı, Gölge Klon dövüşünün ve otomatik kaçış noktalarının VDS'te denenmesi.
