# Yoruichi

- **Tür:** İnsan (`easy_npc:humanoid_slim`, Alex/ince kol). Önceden kara kediydi (eski kedi NPC kaldırıldı).
- **UUID:** `fff2c1ae-28c0-4f9c-858b-94f7cbc0ca8e` (`yoruichi_chase.js` içindeki `YORUICHI_UUID_STR`). Etiketleri: `korunan`, `yoruichi_npc`.
- **Konum (VDS):** Caddy bölgesinde, `-1032.518, 81.0, -338.304` (`YORUICHI_HOME`). Evinde **rest** pozunda durur.
- **Krallık:** Konumu Caddy bölgesinde ama **Vlorya'ya bağlıdır**: yalnızca Vlorya'lılar (`rank_vloryan`) ondan öğrenebilir. Caddy krallığına bağlı değildir.
- **Görevi:** Vlorya'lı oyunculara **Shunpo** (Bleach'teki hızlı adım; oyunda Iron's Spells büyüsü, sistem adı `kubejs:flashstep`) öğretir. Üç eğitim vardır (L1, L2, L3), her biri **zümrüt bloğu** ister.
- **Karşılığı:** Shunpo, Iron's Spells büyüsü olarak bakış yönünde ışınlanır, hedefin arkasına geçer; ayrıntı aşağıda.
- **İlişkiler:** Kimseyle bağı açıklanmaz, gizemini korur.

## Skin / Texture

<img src="../../../assets/npc-skins/yoruichi_v1.png" alt="yoruichi_v1.png" width="256">

- **Dosya:** [`assets/npc-skins/yoruichi_v1.png`](../../../assets/npc-skins/yoruichi_v1.png) (64×64, insan, Alex ince kol); swxff ekledi.
- **Oyunda:** `SkinData` `SECURE_REMOTE_URL` ile bu dosyanın GitHub ham adresine bağlı. Skin UUID'si adresin `UUID.nameUUIDFromBytes` sonucudur. Kurallar: [assets.md](../../../docs/assets.md).

## Konsept

Bleach'teki Yoruichi Shihouin'den ilham alınmıştır: kim olduğunu saklayan, çevik ve alaycı bir usta. Oyunculara doğrudan öğretmez; önce kendisini yakalatır, sonra ücret ister ve sınavlar verir.

## Eğitim şartları

1. **Rütbe:** Oyuncunun `rank_vloryan` rütbesi olmalı (FTB Ranks rank'i `vloryan`, `anubis_rank_stages.js` bunu etikete çevirir). Değilse "Sen Vlorya'dan değilsin, defol" diyaloğu açılır. Elle `tag` koymak işe yaramaz, script rütbeye göre etiketi geri siler. Rütbe `krallik_katil <oyuncu> vloryan` ile verilir.
2. **Keşif Birliği rütbesi (Erwin'e bağ):** Her eğitim için Erwin Smith'in Birlik rütbesi de aranır: L1 **Kül Bekçisi**, L2 **Kan Yeminli**, L3 **Gece Avcısı**. Yeterli değilse Yoruichi ücret almadan "Henüz erken" der (`yoruichi_pay.js`, `YORUICHI_MIN_RANK`). Ücreti daha önce ödenmiş seviye (`yoruichi_paid_l<n>`) geri çevrilmez. Erwin terfi sahnesinde Vlorya'lılara Yoruichi'nin hangi eğitiminin açıldığını da söyler.
3. **Sıra:** L1 → L2 → L3. L2 teklifi L1 bittikten (`yoruichi_caught`), L3 teklifi L2 parşömeni alındıktan (`yoruichi_l2_claimed`) sonra açılır.
3. **Ücret:** Her seviyede zümrüt bloğu (aşağıdaki tablo). Ücret her seviye için **yalnızca ilk kabulde bir kez** alınır (`yoruichi_paid_l<n>`), 60 sn sonra yeniden konuşma ya da Gölge Klon'u yeniden deneme ücret istemez.

| Seviye | Ücret | Görev |
|---|---|---|
| L1 | **3 zümrüt bloğu** | Kovalamaca, ilk Shunpo |
| L2 | **6 zümrüt bloğu** | 5 düşmanın arkasına geçip öldür |
| L3 | **10 zümrüt bloğu** | Gölge Klon mini boss |

Akış: diyalog düğmesi `yoruichi_pay_l<n>` etiketini verir ve kapanır; `kubejs/server_scripts/yoruichi_pay.js` envanterdeki zümrüt bloklarını sayar, yeterliyse keser ve görevi başlatır (`yoruichi_tanisti` / `yoruichi_l2` / `yoruichi_l3_start`), yetersizse "Yeterli zümrüt bloğun yok. N zümrüt bloğu getir (x/N)." der. Fiyatlar `YORUICHI_PRICES`'tadır; diyalog metinlerindeki fiyatlar `tools/yoruichi/gen_*.js` ve canlı NPC'de (`gen_prices.js` → `yoruichi:prices`) elle eşitlenir.

## Diyalog ve etiket akışı

Yönlendirme NPC'nin `ON_INTERACTION` komutlarındadır (`easy_npc dialog open ...`), oyuncunun etiketlerine göre:

| Oyuncu durumu | Açılan diyalog |
|---|---|
| Vlorya'lı değil | `kovulma` ("Sen Vlorya'dan değilsin...") |
| Hiç kabul etmemiş (`yoruichi_tanisti` yok) | `default` → `d2` → "Bana öğret." (ücret L1) |
| Kovalıyor (`yoruichi_tanisti` var, `yoruichi_caught` yok) | `chase_bekle` ("Beni yakalayabilirsen konuşuruz.") |
| Yakalama sahnesi sürüyor (`yoruichi_scene`) | Hiçbir diyalog açılmaz |
| `yoruichi_caught`, L2 başlamamış | `l2_teklif` ("Hazırım.", ücret L2) |
| `yoruichi_l2`, bitmemiş | `l2_devam` |
| `yoruichi_l2_done` | `l2_odul` (L2 parşömeni, `yoruichi_l2_claimed`) |
| `yoruichi_l2_claimed`, L3 başlamamış | `l3_teklif` ("Gölgeyi çağır.", ücret L3) |
| `yoruichi_l3` (sınav sürüyor) | `l3_devam` |
| `yoruichi_l3_done` | `l3_odul` (L3 parşömeni, `yoruichi_l3_claimed`) |
| `yoruichi_l3_claimed` | `l3_bitti` |

İlk konuşma metinleri (D1–D4, D2Kizgin, Kovulma) ASCII yazılmıştır; L2/L3 diyalogları Türkçe karakterlidir.

## L1: kovalamaca ve Shunpo sahnesi

Kod: `kubejs/server_scripts/yoruichi_chase.js`.

- Oyuncu "Bana öğret." deyip ücreti ödeyince `yoruichi_tanisti` alır. Yoruichi'ye **5 blok** yaklaşınca Yoruichi ışınlanır (Shunpo). **6. yaklaşımda** yakalanmış sayılır.
- **İlk atlama** `YORUICHI_FIRST_HOP` = `-1033.554, 72, -318.817` noktasınadır. Sonraki atlamalar bu yönde (ev → ilk nokta) ileriye doğru **otomatik** üretilir (12–18 blok, zemin/yaprak/su/lav kontrolüyle, uygun yer bulunmazsa açıyı değiştirerek 14 deneme).
- **Tek kovalayan:** Kovalama ilk atlamayı tetikleyen oyuncuya kilitlenir. Başkaları yaklaşırsa "Yoruichi şu an başka biriyle ilgileniyor." görür ve müdahale edemez. Sahip yakalanınca, oyundan çıkınca ya da süre dolunca kilit açılır.
- **60 sn kuralı:** Son atlamadan 60 sn sonra Yoruichi eve döner, kilit açılır ve kovalayandan `yoruichi_tanisti` **silinir**; kovalama kendiliğinden başlamaz, oyuncunun yeniden konuşması gerekir ("Sabrım tükendi. Hazır olduğunda yeniden konuş."). Kalan süre **yalnızca kovalayan oyuncunun** action bar'ında görünür ("Yoruichi eve dönüyor: N sn").
- **Varış ipucu (`YORUICHI_HINT`):** Her atlamadan sonra Yoruichi 4 sn parlar, varış noktasında 4 sn gökyüzüne uzanan siyah/beyaz parçacık sütunu çıkar ve action bar'da yön ve mesafe yazar. Kapatmak için `false`.
- **Yoruichi'nin Shunpo VFX'i:** Oyuncununkiyle aynı efekt (`yoruichiShunpoFx`).
- **Sahne (yakalanınca, ~9 sn):** "Yakaladın." başlığı ve Yoruichi'nin hız konuşması, biriken şimşek kıvılcımları, "SHUNPO" başlığı ile L1 parşömeni (7,5. sn), Yoruichi flash step ile kaybolup eve döner (9,25. sn). `yoruichi_caught` **sahne bitince** verilir; sahne sürerken `yoruichi_scene` etiketi vardır ve hiçbir diyalog açılmaz. Oyuncu sahne sırasında çıkarsa sahne kaydı silinir, kovalama baştan yapılır.
- **Poz ve yön:** Evde `easy_npc:pose/humanoid/rest`, ilk Shunpo'da ayakta (`standing`), eve dönünce yeniden `rest`. Poz değişirken `ModelData.Root` (arayüzdeki *Rotation* düğmesinin yazdığı model yönü) **korunur**: yalnızca `Pose`, `PoseName`, `Rotation`, `Position` yazılır. Varlığın yönü (`yaw`, `pitch`) ilk atlamada kaydedilir ve eve dönünce geri verilir; kayıt yoksa `YORUICHI_HOME.yaw` (180, kuzey) kullanılır.
- Atlama `tp`'sine `~ 0` eklenir: yaw aynı, pitch 0 ("oyuncuya bak" yüzünden yukarı bakar kalmasın).

## L2: "Beş Gölge"

Kod: `kubejs/server_scripts/yoruichi_l2.js`.

- Oyuncu ücreti ödeyip "Hazırım." deyince `yoruichi_l2` alır ve sayaç (`persistentData.flashstep_kills`) **sıfırlanır**.
- Shunpo ile bir düşmanın arkasına geçilince düşman **işaretlenir** (10 sn parlar; "Gölge işaretlendi. Son vuruşu sen yap."). İşaretli düşmanın **son vuruşunu** oyuncu yaparsa sayılır (işaret 2 dakika geçerli, can/silah gücü farketmesin diye süre sınırı yoktur).
- İlerleme görev aktifken her 2 sn action bar'da "Shunpo: 0/5 düşman" olarak görünür; her sayılan öldürmede sohbete de yazılır. Sayılmayan işaretli ölümler `latest.log`'a nedeniyle (`yoruichi l2: ...`) yazılır.
- 5/5 olunca `yoruichi_l2_done` verilir, Yoruichi'ye dönülür, L2 parşömeni alınır.

## L3: "Gölge Klon" (mini boss)

Kod: `kubejs/server_scripts/yoruichi_l3.js`.

- "Gölgeyi çağır." ile (ücret L3) `yoruichi_l3_start` verilir; **ilk Shunpo noktasında** (`-1033.554, 72, -318.817`, zemin varsa; yoksa oyuncunun yakınında) bir **Gölge Klon** doğar: vindicator, siyah deri zırh, demir kılıç, 150 can, geri itilmez, ganimet yok. Etiketleri: `yoruichi_shadow`, `korunan` (spawn güvenli bölgesinde silinmesin), `ysh_<oyuncu uuid>` (sahibi).
- **Yalnızca sahibi ve yalnızca arkasından** hasar verebilir; önden ya da yandan vuruş iptal edilir ("Gölgeni görmeden vuramıyorsun. Arkasına geç.").
- Gölge her 3–5 sn'de oyuncunun 4–7 blok çevresine ışınlanır. Oyuncu **10 bloktan** fazla uzaklaşırsa hemen oyuncunun **arkasına** Shunpo atar (`YL3_CHASE_DIST`, en az 2 sn arayla).
- **Bitiş:** Öldürülünce `yoruichi_l3_done`; Yoruichi'ye dönülür, L3 parşömeni alınır. 3 dakikada yenilmezse, oyuncu uzaklaşıp 160 blokten fazla açılırsa ya da çıkarsa gölge kaybolur (ücret tekrar istenmez). Oyuncu **ölürse** sınav biter, gölge silinir ve "Gölgem seni yendi. Hazır olduğunda yeniden çağır." (başka sebeple ölürse "Sınav bitti...") yazılır.

## Shunpo büyüsü

Kod: `startup_scripts/flashstep_spell.js` (kayıt), `server_scripts/yoruichi_flashstep_fx.js` (mantık, `global.flashstepCast`). Oyundaki adı **Shunpo**, iç kimliği `kubejs:flashstep` (eski parşömenler çalışır). İkon: `assets/spell-icons/flashstep.png` (16×16). Startup script olduğu için değişiklik oyunu baştan açmayı gerektirir.

| Seviye | Menzil | Hak | Hak dolumu | Mana |
|---|---|---|---|---|
| L1 | 7 blok | 1 | 3 sn | 20 |
| L2 | 12 blok | 2 | 2 sn | 25 |
| L3 | 15 blok | 3 | 1,5 sn | 30 |

- **Scroll Forge'da craftlanamaz ve sandıklarda çıkmaz** (`canBeCraftedBy` false, `setAllowLooting` false). Parşömen yalnızca Yoruichi'den alınır. Chidori, Rasengan, Tsukiyomi ve Amaterasu için de aynı kısıtlama geçerli. Açıklamalar İngilizce, Iron's formatında.
- **Nasıl atılır:** Bakış yönünde menzile kadar ışınlanır, engel (duvar, tavan, zemin) varsa hemen önünde durur; aşağı bakış yatay ağırlıklı tutulur. 10 blok (seviye menzili) içinde doğrudan bakılan bir canlı varsa onun **arkasına** geçer ve ona döner (`korunan` NPC'ler hariç, `yoruichi_shadow` hedeflenebilir). `/tp` **kullanılmaz** (Grand Teleport sinematiği tetiklenir); dönme `p.connection.teleport` ile yapılır.
- **Hedefin arkasına geçince:** 2 sn stun (Yavaşlık 7 + zıplayamama), 4 hasar (`FLASHSTEP_HIT_DAMAGE`), hedef 10 sn parlar (L2 işareti). Oyuncuya da uygulanır; PvP için karar bekliyor.
- **Zincir vuruş:** Arkasına geçince `FLASHSTEP_CHAIN_WINDOW_MS` (1,5 sn) içinde yeniden Shunpo **hak harcamaz** (mana yine harcanır); bakılan hedef yoksa menzildeki **en yakın düşmana** otomatik gider (görüş hattı temiz, önceki hedef hariç). Üst üste en fazla 3.
- **Kısa dokunulmazlık:** Shunpo sırasında 8 tick (~0,4 sn) Direnç V (%100 hasar azaltma).
- **Yanıltıcı siluet (decoy):** Kalkış noktasındaki siluet 2 sn kalır; 16 blok içinde oyuncuyu hedef alan mob'lar 2 sn boyunca hedeflerini bırakıp silüete koşar. `yoruichi_shadow` ve `korunan` etkilenmez.
- **Hak sistemi:** Süre **gerçek zaman** (`Date.now()`), reload'dan etkilenmez (eskiden tick sayacı reload'da sıfırlanıp hakları kilitliyordu). Anahtar `flashstepChargesV4`. Hak yoksa büyü hiç başlamaz (`checkPreCastConditions`), mana harcanmaz ve mesaj çıkmaz.
- **Iron's bekleme göstergesi:** Hak **kalmayınca** bir sonraki hakkın dolmasına kalan süre Iron's `PlayerCooldowns`'a yazılır (`addCooldown` + `syncToPlayer`), kitap/büyü çubuğu/çarkındaki simgede bekleme görünür. Hak varken yazılmaz; zincir penceresi açıkken pencere bitince yazılır.
- **Efektler:** Kalkışta ve varışta siyah hız çizgileri (`sonic_boom_0..15.png`, vanilla partikülün dokusu değiştirildi; Warden'ın ses dalgası da böyle görünür), artçı siyah siluet, siyah toz (`dust`), yol boyunca çizgi izi, iki yer halkası. Sesler `kubejs/assets/kubejs/sounds/flashstep.ogg`.
- **Uygulanmadı (bilerek):** Shunko (yıldırım zırhı buff'ı), dengeyi bozar diye ertelendi.

## Kurulum ve işletme (VDS)

- **Durum (2026-09-29):** Paket 1.3.6 ile ilk sürüm yayınlandı; sonraki değişiklikler VDS'te canlı, `kubejs/server_scripts/` altına kopyalanıp `reload` ile yüklendi (havuza yama notları yazıldı, bir sonraki "Güncelle"de oyunculara gider). Yedek: `/root/backups/medieval-fantasy/2026-09-29-before-shunpo-kubejs`.
- **NPC kurulumu:** `world/datapacks/yoruichi/` (üretici: `tools/yoruichi/gen_vds.js`). `human` NPC'yi ev noktasında doğurur (sahip swxff), `human_lock` hasar almaz/itilmez yapar, `prices` ücret diyaloglarını uygular, `routes2` sahne/kovalama sırasındaki diyalog kilidini uygular. Bunlar `data modify entity` ile canlı NPC verisini değiştirir.
- **NPC'yi sıfırdan kurmak:** Konsolda `function yoruichi:human`, sonra `function yoruichi:human_lock`. Owner'ı OP'nin UUID'si yapar; Easy NPC komutları NPC sahibinin yetkisiyle çalıştırır (yoksa diyalog açılmaz, `quest.md`).
- **Model yönü ve poz:** Yönü Easy NPC arayüzünden (`/easy_npc_config_ui configure <uuid>` → *Rotation*) ayarla; poz kodla değiştirilirken korunur.
- **Yerel test:** Yerel dünyada VDS koordinatları yok; kovalama mevcut konumdan çalışır, ev/eve dönüş çalışmaz, Gölge Klon oyuncunun yakınında doğar.

### Test için sıfırlama

Oyuncunun Yoruichi durumunu sıfırlamak için şu etiketler silinir (`tag <oyuncu> remove ...`): `yoruichi_tanisti`, `yoruichi_caught`, `yoruichi_scene`, `yoruichi_l2`, `yoruichi_l2_done`, `yoruichi_l2_claimed`, `yoruichi_l3`, `yoruichi_l3_start`, `yoruichi_l3_done`, `yoruichi_l3_claimed`, `yoruichi_pay_l1/2/3`, `yoruichi_paid_l1/2/3`. Sayaç L2 kabulünde zaten sıfırlanır. Zümrüt bloğu için `give <oyuncu> minecraft:emerald_block 20`.

## Açık konular

- **Kayıp parşömen:** Yoruichi parşömeni yalnızca bir kez verir; kaybolursa yeniden alma yolu yok (yeniden satın alma önerildi).
- **Rütbe şartı:** `rank_vloryan` şartı kodda ve diyalogda var; bilerek mi, karar bekliyor.
- **PvP:** Hedefin arkasına geçince oyuncuya da stun/hasar uygulanıyor; sınırlanıp sınırlanmayacağı belirlenmedi.
- **Görev kitabı:** FTB Quests'te Yoruichi görevi/keşif ipucu yok.
- Poz, yön ve dövüş dengesi (can, hasar, ücretler) oynanarak ayarlanacak.
