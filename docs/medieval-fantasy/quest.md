# Medieval Fantasy — Görev Rehberi

Bu dosya, Medieval Fantasy sunucusuna görev (quest) ekleyecek herkes ve onların Claude'u için yazıldı.
Görev eklemeden önce baştan sona okuyun.

> **Claude için:** Yeni bir görev oluşturmadan önce **mevcut görevleri inceleyin**: bu dosyadaki [7. Görevler](#7-görevler) listesini ve VDS'teki `config/ftbquests/quests/chapters/*.snbt` dosyalarını okuyun. Yeni görevi onlara göre kurun: aynı bölüm yapısı, aynı kapı (stage) görevi, benzer dil ve açıklama tonu, çakışmayan görev ID'leri ve mantıklı konum (x/y). Aynı işi yapan bir görev zaten varsa yenisini eklemeyin, var olanı genişletin. Karakterler için [characters/](characters/), krallıklar için [kingdoms/](kingdoms/), hikâyeler için [stories/](stories/) klasörüne bakın.

---

## 1. Proje hakkında kısaca

- **Sunucu:** Minecraft **1.20.1 Forge**, ~300 modlu bir paket. VDS üzerinde çalışır (`/root/servers/medieval-fantasy`, port 25567).
- **Oyuncu paketi:** Arkadaşlar paketi **AnuDownloader** ile kurar; paket VDS'ten üretilir (bkz. repo kökündeki `CLAUDE.md`).
- **Tek kaynak VDS'tir.** Görevler, NPC'ler, rütbeler ve script'ler sunucudadır.
- **İki kural (istisnasız):** Sunucuyu yeniden başlatmak ve AnuDownloader paketini yayınlamak **yalnızca proje sahibi açıkça söylediğinde** yapılır. Detaylar kök `CLAUDE.md`'de.

---

## 2. Evrenin yapısı: Dark Fantasy + Medieval Fantasy

Dünya, klasik ortaçağ fantastiğinin (şövalyeler, kaleler, krallıklar, ejderhalar) üstüne karanlık fantastik bir katman eklenmiş bir yerdir.
Işıklı köylerin ve kale surlarının hemen dışında kara büyü, lanetli yaratıklar ve eski felaketlerin kalıntıları vardır.
Görevleri yazarken bu ikiliği koruyun: **ortaçağ düzeni** (krallıklar, rütbeler, yemin, şövalyelik) ile **karanlık tehdit** (ölümsüzler, lanetler, kadim canavarlar) yan yana durur.

Paketteki modlar bu atmosferi şöyle kuruyor:

| Katman | Ne hissettiriyor | Başlıca modlar |
|---|---|---|
| **Ortaçağ ve şövalyelik** | Zırhlar, silahlar, kaleler, muhafızlar | Epic Knights (+ Antique Legacy, Slavic Armory), Knight Quest, Knights and Castles, Spartan Weaponry / Shields, Simply Swords, Guard Villagers, Medieval Buildings |
| **Büyü (aydınlık ve karanlık)** | Büyü okulları, büyü kitapları, cüppeler | Iron's Spells 'n Spellbooks ve eklentileri (Cataclysm Spellbooks, Traveloptics, Apprentice Codex, Magic from the East, Hazennstuff, So Many Spells, Darker Magic), Goety (+ Awaken, Revelation: nekromansi, kara büyü, ritüeller) |
| **Kadim canavarlar ve bosslar** | Zor, ödüllü, hikâyeye bağlanabilecek düşmanlar | L_Ender's Cataclysm, Bosses of Mass Destruction, Legendary Monsters, Mowzie's Mobs, Marium's Soulslike Weaponry |
| **Mitoloji ve ejderhalar** | Ejderhalar, efsanevi yaratıklar | Ice and Fire (ateş/buz/şimşek ejderhaları, gorgon, hydra...) |
| **Karanlık ve korku** | Lanetli, ürkütücü mob'lar ve bölgeler | Born in Chaos, The Graveyard, Deeper and Darker, Aquamirae, Enhanced Celestials (kan ayı), Enderman / Creeper Overhaul |
| **Keşif** | Zindanlar, harabeler, kuleler, farklı biyomlar | When Dungeons Arise (+ Seven Seas), Moog's Voyager Structures, Nova Structures, Towns and Towers, Dungeons and Taverns, Terralith, Alex's Caves, Lootr |
| **Karakter gelişimi** | Yetenek ağaçları, eşya özellikleri, silah seviyesi | Apotheosis (affix, gem), Puffish Skills / Iron's skill tree, Weapon Leveling |
| **Günlük yaşam** | Yemek, depolama, yolculuk | Farmer's Delight (+ Brewin' and Chewin'), Sophisticated Backpacks / Storage, Waystones |

Güncel mod listesi VDS'te `mods/` klasöründedir. Bir göreve bir modun eşyasını, yaratığını veya yapısını koymadan önce paketin içinde olduğunu kontrol edin.

---

## 3. Krallıklar ve karakterler (özet)

| Krallık | Tarz | Rütbe (rank id) |
|---|---|---|
| [Granfos](kingdoms/granfos.md) | Büyü, okumuş büyücüler | `granfosian` |
| [Drondra](kingdoms/drondra.md) | Faşist, kaba kuvvet, barbar | `drondrian` |
| [Vlorya](kingdoms/vlorya.md) | Gizlilik, suikast, çeviklik | `vloryan` |
| [Caddy](kingdoms/caddy.md) | Çamur'un krallığı; spawn'daki yardımcılar | — |

Bir oyuncu **yalnızca bir** krallığa bağlılık yemini edebilir. Karakterlerin sırlarını (ör. Çamur'un gerçek kral olması, Usta Büyücü'nün kimliği) oyunculara görev metinlerinde erken açık etmeyin. Tam liste: [characters/README.md](characters/README.md).

---

## 4. Rütbe (rol) sistemi

"Rol" ve "rütbe" aynı şeydir: FTB Ranks modundaki **rank**.

| Rütbe | Nasıl alınır | Görev stage'i |
|---|---|---|
| **Kutsanmış** (`kutsanmis`) | Miu ile ilk konuşmada | `rank_kutsanmis` |
| **Maceracı** (`maceraci`) | Miu ile ilk konuşmada | `rank_maceraci` |
| **Drondrian / Vloryan / Granfosian** | Seçilen krallığın kralından | `rank_drondrian` / `rank_vloryan` / `rank_granfosian` |

Sohbette sadece en yüksek rütbe görünür. Sıralama: **Kutsanmış > Krallık rütbeleri > Maceracı**.

---

## 5. Görev kuralları

1. **Görevler rütbelere özeldir.** Her görev bir rütbeye aittir:
   - **Maceracı görevleri:** Paketteki modları bilmeyen oyunculara **modları öğreten** görevler. Öğretici, adım adım, ödülü teşvik edici.
   - **Krallık görevleri:** **Sadece o krallığa** özel görevler. Krallığın tarzına uymalı (Granfos → büyü, Drondra → güç ve zulüm, Vlorya → gizlilik ve suikast).
   - **Kutsanmış görevleri:** **Daha kompleks ve zor** görevler. Bazen bir boss kesmek, bazen önemli bir eşyayı bulmak.
2. **Tekli veya zincir:** Görev tek başına olabilir ya da birbirine bağlı görevlerle bir zincir oluşturabilir. Hangisi olacağı görevin yapısına ve gidişatına göre seçilir.
3. **Görev kaynağı:** Görevler **genelde NPC'lerden** alınır, ama her görev için şart değildir. Ör. bir kraldan alınan görev oyuncunun görev listesine eklenir.
4. **Filtreler:** İki tür filtre vardır:
   - **Rütbeye özel:** Görev sadece **bir** rütbeye aittir.
   - **Kişiye özel:** Görev sadece **bir veya birden fazla belirli oyuncuya** aittir.

---

## 6. Teknik: görev nasıl bağlanır

**Rütbe → görev bağlantısı.** Sunucudaki `kubejs/server_scripts/anubis_rank_stages.js` script'i her oyuncunun FTB Ranks rütbelerini birkaç saniyede bir `rank_<id>` adlı oyuncu etiketine çevirir. FTB Library bu etiketleri **stage** olarak okur. Bu yüzden FTB Quests'te bir görevi bir rütbeye bağlamak için:

- Görevin (veya zincirin ilk görevinin) başına **Stage** tipinde bir task koyun, stage adı `rank_<id>` (ör. `rank_maceraci`).
- Zincirin geri kalanı bu göreve bağımlı (dependency) olur.
- Rütbesi olmayan oyuncu Stage task'ını tamamlayamaz, dolayısıyla zinciri açamaz.

**Kişiye özel görevler.** Oyuncuya `/tag <oyuncu> add gorev_<ad>` ile bir etiket verin (veya bir NPC düğmesi versin) ve görevin başına bu etiketle bir Stage task koyun. Etiket stage olarak okunur.

**NPC'den görev vermek (Easy NPC).** NPC'lerin diyalog düğmelerine `COMMAND` eylemi eklenir. Bilinen tuzaklar:

- `@initiator` konuşan oyuncunun **adıyla** değişir.
- NPC'nin `ActionData.ActionPermissionLevel` değeri 3 değilse komutlar en düşük yetkiyle çalışır ve **sessizce başarısız olur**. NPC'yi Easy NPC menüsünden OP olarak düzenleyince bu değer otomatik yazılır; komutla kuruluyorsa elle verilmeli.
- `ftbranks add` komutu `@s` kabul etmez: `ftbranks add @initiator <rank>` yazın.
- Krallık rütbesi için `krallik_katil @initiator <rank>` komutu vardır (oyuncu başka bir krallığa bağlıysa reddeder).
- NPC'ler `korunan` etiketi taşır; mob temizleme komutlarında `tag=!korunan` kullanın.

**Nerede durur?** Görev dosyaları VDS'te `config/ftbquests/quests/` altındadır: her bölüm `chapters/<ad>.snbt`. Görevler oyun içinde OP iken FTB Quests editörüyle de düzenlenebilir.

**Dosyadan eklerken:**
- Görev, task ve bölüm ID'leri 16 haneli hex'tir ve tüm dosyalarda benzersiz olmalıdır.
- Dosyayı değiştirdikten sonra sunucu konsolunda `ftbquests reload` çalıştırın; logda "Loaded N chapters, M quests" satırını kontrol edin. Yeniden başlatma gerekmez.
- Görev kitabı oyunculara **sunucudan** gönderilir: görev değişiklikleri için AnuDownloader paketini yayınlamaya gerek yoktur.
- Craft etmeyi şart koşan eşya görevi: `type: "item"` + `only_from_crafting: true` (eşyayı başka yoldan elde etmek tamamlamaz).
- **Iron's Spells parşömeni görevi:** Bütün parşömenler aynı eşyadır (`irons_spellbooks:scroll`); büyü, eşyanın NBT'sinde durur. NBT anahtarı **`"irons_spellbooks:spell_container"`**'dır (tırnak içinde; `ISB_Spells` eski sürümlerin anahtarıdır ve 3.16'da çalışmaz, görev hiç tamamlanmaz). Gerçek bir parşömenin NBT'si: `{"irons_spellbooks:spell_container": {data: [{id: "<mod>:<büyü>", index: 0, level: 1, locked: 1b}], maxSpells: 1, mustEquip: 0b, spellWheel: 0b}}`. Emin olmak için oyuncunun envanterindeki bir parşömeni `data get entity <oyuncu> Inventory` ile okuyun.
  - **Görev filtresi** (`item`): `tag: {"irons_spellbooks:spell_container": {data: [{id: "<mod>:<büyü>"}]}}` + `match_nbt: true` + `weak_nbt_match: true`. Zayıf eşleşme sadece büyü kimliğine bakar, seviyeye bakmaz.
  - **İkon:** Hem görevin (`icon`) hem task'ın ikonu, aynı büyüyü taşıyan **tam** parşömen NBT'si olmalı (index, level, locked, maxSpells... dahil). Parşömenin dokusu büyünün okuluna göre değiştiği için ateş görevinde ateş parşömeni görünür. Odak eşyasını ikon yapmayın.
- **Büyü okulları:** Pakette 16 okul var (Iron's Spells'in 9'u + Somake Spells'in Aqua'sı, Familiars Lib'in Sound'u, Magic from the East'in Spirit ve Symmetry'si, Cataclysm Spellbooks'un Abyssal ve Technomancy'si, BielGG'nin Unstable'ı). Hangi büyünün hangi okulda, hangi nadirlikte ve craftlanabilir olduğu **çalışan sunucudan** okunmalı: `SpellRegistry` / `SchoolRegistry` üzerinden geçici bir KubeJS komutuyla (`getSchoolType`, `getMinRarity` 0=Common…4=Legendary, `isEnabled`, `requiresLearning`, `allowCrafting`) ve odak eşyası için okulun `getFocus()` etiketi. Eklentiler büyüleri başka okullara da ekler (ör. Apprentice Codex'in büyüleri Iron's okullarında).
- **Aqua odağı:** Somake Spells, Aqua odak etiketini 1.20.1'in okumadığı `tags/item/` klasörüne koymuş; etiket boş kaldığı için `kubejs/server_scripts/anubis_aqua_focus.js` Nautilus Shell'i etikete ekler.
- **`only_from_crafting` sadece normal craft masasında çalışır.** Scroll Forge, Alchemist Cauldron gibi özel makinelerin çıktılarında kullanmayın; o görevler eşyanın envanterde olmasıyla tamamlanır.
- Rütbesi olmayanlardan gizlemek için: görevi kapı görevine bağlayın (`dependencies`) ve `hide_until_deps_complete: true` verin.
- **Görünüm kuralı:** Bütün görevler **circle** şeklinde ve **aynı boyutta**. Görevlere `shape` veya `size` yazmayın; varsayılan (`data.snbt` → `default_quest_shape: "circle"`) kullanılır. Her göreve ve her task'a konusuna uygun bir `icon` verin (kapı görevleri ve Stage task'ları dahil; ör. Maceracı kapısı ve task'ı `minecraft:iron_sword`).
- **Yazım kuralı:** Cümle olan her metin (task başlıkları, alt başlıklar, açıklamalar) **nokta ile biter** ve Türkçe yazım kurallarına uyar (ör. "-deki/-daki" bitişik: "bölgesindeki"). Görev ve bölüm **başlıkları** ("Maceracı Rütbesi", "Büyü Masası") noktasızdır. Spawn yerine oyuncuya "Başlangıç bölgesi" denir.
- **Birden fazla eşya ödülü:** tek `item` ödülüne adedi yazın (ör. 2 Can İksiri = `Count: 2b`, tek slot). İksirler 16'lı yığınlanır (`kubejs/startup_scripts/anubis_potion_stack.js`). Yığılmayan eşyalarda (alet, zırh) her biri için ayrı ödül ekleyin.
- **Craft görevleri:** Task başlığı "<Eşya adı> craftla." biçimindedir (ör. "Inscription Table craftla."), "craft et" yazılmaz.
- **Tarif anlatımı:** Maceracı görevleri oyuncunun hiçbir şey bilmediğini varsayar; tarifi adım adım betimleyin. Örnek: "Masanın tarifini öğrenmek için envanterini aç. Ekranın sağ tarafındaki eşya listesinin altında bir arama kutusu var; bu kutuya **Inscription Table** yaz. Listede beliren masa simgesinin üzerine gel ve **R** tuşuna bas. Açılan pencerede masayı hangi malzemelerle ve nasıl craftlayacağını göreceksin."
- **Uzunluk kuralı:** Başlık, alt başlık (`subtitle`) ve task başlıkları **kısa** olur (ör. "Miu ile konuş."). Ayrıntı **açıklamaya** (`description`) yazılır: uzun, açıklayıcı ve güzel cümlelerle ne yapılacağı, nerede, neden ve tamamlanınca ne olacağı anlatılır (ör. "Başlangıç bölgesindeki Miu ile konuşarak Maceracı rütbesine sahip olman gerekir. Rütbeyi aldığın anda…").

---

## 7. Görevler

Yeni görevler bu başlığın altına eklenir. Her görev için: adı, ait olduğu rütbe veya kişi, veren NPC (varsa), tekli mi zincir mi, hedefler ve ödüller.

### Bölüm: Maceracı (`chapters/maceraci.snbt`, bölüm ID `4D41434552414331`)

Maceracı rütbesine ait, modları öğreten görevler. Görev listesinden alınır (NPC gerekmez).

| # | Görev | ID | Bağlı olduğu | Hedef | Ödül | Not |
|---|---|---|---|---|---|---|
| 0 | **Maceracı Rütbesi** (kapı) | `4D41434552414332` | — | Stage `rank_maceraci` | — | Miu'dan rütbe alınca kendiliğinden tamamlanır. Bölümdeki bütün görevler buna bağlanır. |
| 1 | **Büyü Masası** | `4D41434552414334` | 42 (Büyüler ve Rünler) | `irons_spellbooks:inscription_table` **craftla** (`only_from_crafting`) | 2 Can İksiri (Instant Health I; tek ödül `Count: 2b`, `4D41434552414336`) | Tekli. Iron's Spells'e giriş: büyü parşömenlerini büyü kitabına işlemek. `hide_until_deps_complete`. |
| 2 | **Büyü Kitabı** | `4D41434552414338` | 1 | `irons_spellbooks:iron_spell_book` (Ironbound Tome) **craftla** (`only_from_crafting`) | 2 Can İksiri (tek ödül, `4D4143455241433A`) | Zincir: Büyü Masası → Büyü Kitabı. İlk büyü kitabı, 6 büyü yuvası. `hide_until_deps_complete`. |
| 3 | **Parşömen Ocağı** | `4D4143455241433C` | 2 | `irons_spellbooks:scroll_forge` **craftla** (`only_from_crafting`) | 2 Can İksiri (tek ödül, `…3E`) | Zincir devamı. Buradan yol ikiye ayrılır. |
| 4 | **Büyü Okulları** | `4D41434552414340` | 3 | `checkmark` (oyuncu okuyup işaretler) | — | Okullar ve odak eşyaları anlatılır. |
| 5 | **Mürekkep** | `4D41434552414342` | 3 | `irons_spellbooks:common_ink` **edin** | — | Mürekkep nadirliği ve kazanda yükseltme anlatılır. Common Ink sandıklardan/ganimetten gelir. |
| 6–21 | **Okul görevleri** (16 adet) | `…44` – `…62` (task: +1) | 4 **ve** 5 | Belirli büyünün **parşömenine** sahip ol | — | Ateş: Firebolt, Buz: Icicle, Şimşek: Electrocute, Kutsal: Healing Circle, Ender: Magic Missile, Kan: Ray of Siphoning, Evocation: Fang Strike, Doğa: Poison Arrow, Su (Aqua): Water Ball, Ses (Sound): Clef, Ruh (Spirit): Soul Burst, Simetri (Symmetry): Jade Bullet, Technomancy: Laserbolt — hepsi Common. Common büyüsü olmayanlar: Abyssal: Tidal Tear (Uncommon), Eldritch: Summon Sculk Centipede (Rare), Unstable: Glitch Projectiles (Rare). 2 sütun × 8 satır (x 12 ve 13.5, y -8.25…2.25, aralık 1.5). |

Yerleşim: kapı (0, 0) → **Büyüler ve Rünler** (2, 0) → sağ-yukarı **Iron's Spells** kolu (1–21, zincir y = -3; Okullar (10, -4.5), Mürekkep (10, -1.5)) ve sağ-aşağı **RPG Series** kolu (22–32, masa (4, 3)). Kapıdan yukarı **Apotheosis** kolu (33–41).

| # | Görev | ID | Bağlı olduğu | Hedef | Ödül | Not |
|---|---|---|---|---|---|---|
| 42 | **Büyüler ve Rünler** | `4D41434552414391` | 0 | `checkmark` (task `…92`) | — | İki büyü yolunu tanıtır: Iron's Spells (parşömen, kitap, okullar, mana, silah fark etmez) ve RPG Series (sınıf kitabı, sınıf silahı, rün). İkon `irons_spellbooks:arcane_essence`. |

| # | Görev | ID | Bağlı olduğu | Hedef | Ödül | Not |
|---|---|---|---|---|---|---|
| 22 | **Büyü Bağlama Masası** | `4D41434552414364` | 42 (Büyüler ve Rünler) | `spell_engine:spell_binding` **craftla** (`only_from_crafting`) | 2 Can İksiri (tek ödül, `…66`) | Konum (4, 3). |
| 23 | **Sınıflar** | `4D41434552414367` | 22 | `checkmark` | — | 8 sınıf kitabı ve silahları (genel bakış). Konum (6, 3). |
| 24 | **Rünler** | `4D41434552414369` | 22 | `runes:crafting_altar` **craftla** | — | Hangi sınıf hangi rünü harcar, sunak iki kat verir, Rune Pouch. |
| 25–32 | **Sınıf yolları** (8 adet) | `…6B` – `…79` (task: +1) | 23 | `advancement` task: `rpg_series:spell_novice_<sınıf>` (kitaba ilk büyüyü bağlamak) | — | Arcane, Ateş, Buz (wizards), Paladin, Rahip (paladins), Okçu (archers), Haydut, Savaşçı (rogues). Açıklamada kitap, silahlar, bedel ve 6 büyü. Her sınıf bir satır: yol (8, y) → İlk Büyü `spell_cast_<sınıf>_book` (9.5, y) → Usta `spell_master_<sınıf>` (11, y); y = 3 … 13.5. |

- **RPG Series görev tespiti:** Spell Engine'in kendi advancement'ları (`rpg_series:*`) görev olarak kullanılabilir: `type: "advancement"`, `advancement: "rpg_series:..."`, `criterion: ""`. Masayı ziyaret: `rpg_series:classes`; kitap yaratma: `rpg_series:path_choose_<sınıf>`; ilk büyüyü bağlama: `spell_novice_<sınıf>`; kitabı doldurma: `spell_master_<sınıf>`; kitaptan büyü atma: `spell_cast_<sınıf>_book`.

**Üst kol: Apotheosis** (kapıdan yukarı; sol sütun macera, sağ sütun efsun):

| # | Görev | ID | Bağlı olduğu | Hedef | Ödül | Not |
|---|---|---|---|---|---|---|
| 33 | **Nadir Eşyalar** | `…7C` | 0 | advancement `apotheosis:affix/root` (affix'li eşya edin) | — | Nadirlik renkleri, eşyaların kaynağı, bosslar. (0, -2) |
| 34 | **Mücevherler** | `…7E` | 33 | `apotheosis:affix/gem` | — | Mücevher nadirlikleri; örs düşürerek Gem Dust. (-1.5, -3.5) |
| 35 | **Mücevher Yuvası** | `…80` | 34 | `apotheosis:affix/socket` | — | Smithing Table ile takma, Sigil of Socketing / Withdrawal. |
| 36 | **Kurtarma Masası** | `…82` | 35 | `apotheosis:salvaging_table` **craftla** | 2 Can İksiri (`…84`) | Nadirlik malzemeleri. |
| 37 | **Mücevher Kesme Masası** | `…85` | 36 | `apotheosis:gem_cutting_table` **craftla** | 2 Can İksiri (`…87`) | Mücevher yükseltme. |
| 38 | **Yeniden Dövme Masası** | `…88` | 37 | `apotheosis:simple_reforging_table` **craftla** | 2 Can İksiri (`…8A`) | Reforging Table'a yükseltme. (-1.5, -9.5) |
| 39 | **Efsunun Sırları** | `…8B` | 33 | `apotheosis:enchanting/30ench` | — | Eterna / Quanta / Arcana. (1.5, -3.5) |
| 40 | **Hellshelf** | `…8D` | 39 | `apotheosis:enchanting/hellshelf` | — | Hellshelf, Seashelf. |
| 41 | **Güçlü Efsun** | `…8F` | 40 | `apotheosis:enchanting/60ench` | — | Güçlendirilmiş raflar, Deepshelf / Endshelf. (1.5, -6.5) |

- **Apotheosis rakamları** jar'daki `data/apotheosis/enchanting_stats/*.json`'dan doğrulandı: seviye = Eterna × 2; normal kitaplık en fazla 15 Eterna (30. seviye), Hellshelf / Seashelf en fazla 22.5 (45), Blazing / Glowing Hellshelf ve Crystalline / Heart-Forged Seashelf 30 (60), Deepshelf 35–37.5, Endshelf 45–50 (100).

**Sol kol: Ice and Fire** (kapıdan sola; üst sıra ehlileştirme, alt sıra ocak ve çelik). Hepsi `advancement` task'ı (`iceandfire:iceandfire/<ad>`, `criterion: ""`), ödül yok.

| # | Görev | ID | Bağlı olduğu | Advancement | Konum | Anlattığı |
|---|---|---|---|---|---|---|
| 43 | **Canavarlar Kitabı** | `…93` | 0 | `bestiary` | (-2, 0) | 3 Manuscript → Bestiary, Bestiary Lectern ile sayfa açma |
| 44 | **Ejderha Avcısı** | `…95` | 43 | `kill_if_dragon` | (-4, 0) | 3 tür, 5 evre, nerede yaşarlar, dövüş ipuçları, ölüden ganimet ve kan |
| 45 | **Ejderha Yumurtası** | `…97` | 44 | `dragon_egg` | (-6, -1.5) | Ateş / buz / şimşek yumurtasını çatlatma |
| 46 | **Ejderha Maması** | `…99` | 45 | `dragon_meal` | (-8, -1.5) | Besleme, Dragon Meal, sağ tıkla bilgi |
| 47 | **Ejderha Asası** | `…9B` | 46 | `dragon_staff` | (-10, -1.5) | Kafatası + çubuk; oturt / dolaştır / eşlik |
| 47a | **Ejderhaya Binmek** | `…DF` | 47 | `checkmark` | (-12, -1.5) | 3. evreden itibaren eğil + sağ tık; zıplama, Dragon Down, Dragon Breath, Dragon Strike, kamera tuşu |
| 47b | **Ejderha Flütü** | `…E1` | 47a | `dragon_flute` | (-14, -1.5) | 2 kemik + demir; uçan evcilleri indirir (Hippogryph, Amphithere de) |
| 47c | **Ejderha Boynuzu** | `…E3` | 47b | `dragon_horn` | (-16, -1.5) | 4 kemik + çubuk; ejderhayı sakla / çağır |
| 47d | **Ejderha Zırhı** | `…E5` | 47c | `dragonarmor` | (-18, -1.5) | Baş / boyun / gövde / kuyruk; bloklarla, en güçlüsü ejderha çeliği |
| 47e | **Ejderha Üretmek** | `…E7` | 47d | `checkmark` | (-20, -1.5) | 4. evre, Lily Mixture, önce erkek sonra dişi, cinsiyet işaretleri |
| 48 | **Ejderha Kemiği** | `…9D` | 44 | `dragonbone_tool` | (-6, 1.5) | Wither Bone, pul zırhı, kanla güçlendirilmiş kılıç |
| 49 | **Ejderha Ocağı** | `…9F` | 48 | `dragon_forge_core` | (-8, 1.5) | Tuğla, çekirdek (kalp), yapı, ejderhayla çalıştırma |
| 50 | **Ejderha Çeliği** | `…A1` | 49 | `dragonsteel` | (-10, 1.5) | Demir + kan → Dragonsteel, etkileri |

- **Ice and Fire bilgileri** modun kendi Bestiary sayfalarından (`assets/iceandfire/lang/bestiary/en_us_0/*.txt`) ve tariflerinden doğrulandı.

**Alt-sol kol: İksirler** (kapıdan aşağı; ana sütun x = -1.5, yan görevler x = -3 / -4.5). Sunucuda `naturalRegeneration` **kapalı**: can yalnızca iksir, Altın Elma, büyü ve efektlerle dolar. Bu kol bunu öğütler.

| Görev | ID | Bağlı | Hedef | Konum | Anlattığı |
|---|---|---|---|---|---|
| **Can Yenilenmez** | `…A3` | 0 | `checkmark` | (-1.5, 2) | Can kendiliğinden dolmaz; şifa kaynakları; yanında iksir taşı |
| **Altın Elma** | `…BB` | Can Yenilenmez | `golden_apple` **craftla** | (-3, 3.5) | Yenilenme II + Emilim |
| **Simya Standı** | `…A5` | Can Yenilenmez | `brewing_stand` **craftla** | (-1.5, 3.5) | Yakıt (1 Blaze Powder = 20), yuvalar, su şişesi. Ödül 2 Can İksiri (`…A7`) |
| **Garip İksir** | `…A8` | Simya Standı | `potion` `awkward` | (-1.5, 5) | Nether Wart, ruh kumunda çoğaltma |
| **Faydalı İksirler** | `…BD` | Garip İksir | `checkmark` | (-3, 5) | Malzeme → iksir listesi, Fermented Spider Eye ile tersine çevirme |
| **Ateşe Dayanıklılık** | `…BF` | Faydalı İksirler | `potion` `fire_resistance` | (-4.5, 5) | Magma Cream, ateş ejderhası / Nether |
| **Şifa İksiri** | `…AA` | Garip İksir | `potion` `strong_healing` | (-1.5, 6.5) | Parıldayan Karpuz, Glowstone, ölümsüzlere zarar |
| **Zarar İksiri** | `…C1` | Şifa İksiri | `potion` `harming` | (-3, 6.5) | Fermented Spider Eye; ölümsüzleri iyileştirir |
| **Yenilenme İksiri** | `…AC` | Şifa İksiri | `potion` `regeneration` | (-1.5, 8) | Ghast Tear, 45 sn |
| **Uzun Süreli İksir** | `…C3` | Yenilenme İksiri | `potion` `long_regeneration` | (-1.5, 9.5) | Redstone; Glowstone ile birlikte olmaz |
| **Fırlatılan İksir** | `…AE` | Uzun Süreli İksir | `splash_potion` (herhangi) | (-1.5, 11) | Gunpowder, dostları iyileştirme |
| **Kalıcı İksir** | `…C5` | Fırlatılan İksir | `lingering_potion` (herhangi) | (-1.5, 12.5) | Dragon's Breath |

İksir görevlerinde task: `item: {Count: 1b, id: "minecraft:potion", tag: {Potion: "minecraft:<tür>"}}` + `match_nbt` + `weak_nbt_match`. Ödül olarak verilen `healing` iksirleri görevi kendiliğinden tamamlamasın diye Şifa görevi `strong_healing` ister.

**Apotheosis iksir tılsımı (Potion Charm):** Kara listesi boş; Yenilenme iksirinden kalıcı yenilenme tılsımı yapılabiliyor. Görevlerde öğretilmedi.

**Alt-sağ kol: Sophisticated Backpacks + Storage** (kapıdan aşağı; ana sütun x = 1.5, çanta eklentileri x = 0):

| Görev | ID | Bağlı | Hedef (**craftla**) | Konum |
|---|---|---|---|---|
| **Sırt Çantası** | `…B0` | 0 | `sophisticatedbackpacks:backpack` (ödül 2 Can İksiri `…B2`) | (1.5, 2) |
| **Bakır Çanta** | `…B3` | Sırt Çantası | `copper_backpack` | (1.5, 3.5) |
| **Çanta Eklentileri** | `…B5` | Bakır Çanta | `upgrade_base` | (1.5, 5) |
| Toplama / Mıknatıs / Besleme / Simya / Doldurma / Yığın / Craft / Yok Edilemez | `…C7`–`…D5` (ikişer) | Çanta Eklentileri | `pickup_upgrade`, `magnet_upgrade`, `feeding_upgrade`, `alchemy_upgrade`, `refill_upgrade`, `stack_upgrade_tier_1`, `crafting_upgrade`, `everlasting_upgrade` | (0, 6.5 … 17) |
| **Gelişmiş Sandık** | `…B7` | Çanta Eklentileri | `sophisticatedstorage:chest` | (1.5, 6.5) |
| **Sandığı Yükselt** | `…D7` | Gelişmiş Sandık | `basic_to_iron_tier_upgrade` | (1.5, 8) |
| **Sınırlı Varil** | `…D9` | Sandığı Yükselt | `limited_barrel_1` | (1.5, 9.5) |
| **Koli Bandı** | `…DB` | Sınırlı Varil | `packing_tape` (`dropPacked = false`, yani bant gerekli) | (1.5, 11) |
| **Depo Kontrolcüsü** | `…B9` | Koli Bandı | `controller` | (1.5, 12.5) |
| **Depo Bağlantısı** | `…DD` | Depo Kontrolcüsü | `storage_link` (Storage Tool ile bağlama) | (1.5, 14) |

**RPG kolu ayrıntısı** (Sınıflar'dan aşağı, x = 6): **Kitap Yaratmak** (6, 4.5) → **Büyü Bağlamak** (6, 6) → **Kitabı Takmak** (6, 7.5) → **Büyü Atmak** (6, 9) → **Büyü Gücü** (6, 10.5). Hepsi `checkmark`. Rünler (4, 4.5)'e taşındı. Spell Engine ayarları (`config/spell_engine/server.json5`): kitap yaratma 1 seviye, büyü atınca kitap 10 sn değiştirilemez, bekleme varken kitap çıkarılamaz, büyüler tokluk harcar.

**Iron's büyü kitapları** (Ironbound Tome'dan yukarı, x = 6): **Altın** (6, -4.5) → **Elmas** (6, -6) → **Netherite** (6, -7.5) → **Efsanevi Kitaplar** (6, -9). Yanlarda **Uyanan Kitaplar** (Somake, 4.5, -4.5), **Eklenti Kitapları** (4.5, -6), **Okul Kitapları** (7.5, -6). Craft görevleri 2 Can İksiri verir. Rakamlar canlı sunucudan (`getMaxSpellSlots` + Curios özellikleri) okundu:

| Kitap | Yuva | Özellik |
|---|---|---|
| Copper / Ironbound / Gold / Diamond / Netherite | 5 / 6 / 8 / 10 / 12 | Gold %15 hazırlama, +50 mana · Diamond +100 mana · Netherite +200 mana, %20 bekleme |
| Blaze, Druidic, Villager, Evoker, Cursed Doll, Necronomicon | 10 | okul gücü %10, +200 mana |
| Ice, Dragonskin, Legendary | 12 | Ice/Ender %10, +200 mana |
| Somake I / II / III | 8 / 10 / 12 | okul gücü %5 / %15 / %25, +100 / 200 / 300 mana; okulun büyüleri atılarak uyanır |
| Cataclysm (Ignis, Codex of Malice, Abyss, Desert), Volume of the Deep | 12 | %30 okul gücü, +300 mana (Deep: Eldritch %15, %20 bekleme) |
| Disc Driver / Stockpiler's Dream | 15 | Technomancy %30 / 8000 mana ama mana dolmaz |
| Unstable Spellbook | 8 | Unstable %25, +400 mana |

**Sol-üst: Savaş** (x = -4.5'ten sola). Satır y = -3: **Dövüş Sanatı** (-4.5, -3; kapıya bağlı; Better Combat) → **Takla** (Combat Roll: 4 sn, en az 6 tokluk, havada / silah beklemesinde yok, yenilmezlik yok) → **Atılma** (Combat Dash: 3 hak, 4,5 sn) → **Silah Seviyesi** (Weapon Leveling: öldürme 1, vuruş %20 şansla 1 deneyim, en fazla 500, kırılmaz) → **Ölümün Bedeli** (Diminishing Health: ölümde %5; Altın Elma %5, uyku %5, 6 günde bir %5). Satır y = -4.5: **Yetenek Ağaçları** → **Sınıf Yetenekleri** (Class Skills, 13 puan) → **Silah Ustalığı** (Weapon Skills, 6 puan) → **Büyü Ağaçları** (Magic I → Primary School → Secondary School → Magic II) → **Maceracı Yetenekleri**. Ayrıca özel **Anubis** ağacı var (`global_packs/required_data/anubis_fixes`, 5 yetenek, kilitli başlar). Hepsi `checkmark`.

**Sol-üst: Silah ve Zırh** (y = -6): **Silah Çeşitleri** (-4.5, -6) → **Zırh Çeşitleri** → **Kalkanlar** → **Uzak Menzil** → **Efsanevi Silahlar**. İki buluşma noktası (`dependency_requirement: "one_completed"`, iki yoldan biri yeter):
- **Silahına Mücevher** (-3, -7.5): Silah Çeşitleri **veya** Apotheosis Mücevher Yuvası. Apotheosis bütün silah ve zırhlarda çalışır.
- **Silah Yetenekleri** (4, 6, RPG kolunda): Büyü Bağlama Masası **veya** Silah Çeşitleri. RPG silah yetenekleri silah adına ve türüne göre bütün silahlara dağılır (`config/spell_engine/weapon_fallback.json`): kılıç → Swift Strikes, claymore → Flurry, büyük çekiç → Ground Slam, çift balta → Whirlwind, teber → Thrust, mızrak → Impale, orak → Swipe, hançer → Fan of Knives, gürz → Smash, balta → Cleave.

**Sol-alt: Yemek ve Mevsimler** (Can Yenilenmez'e bağlı; Altın Elma (-3, 3.5)'e taşındı). Satır y = 3: **Açlık ve Can** (-6, 3) → **Bıçak** → **Kesme Tahtası** → **Pişirme Kabı** → **Şifalı Çorba** (beef_stew) → **Doyurucu Yemekler** → **Ziyafet** (-15, 3). Satır y = 4.5: **Zengin Toprak** (-6, 4.5), Pişirme Kabı'ndan **Tava** (-10.5), **Fıçı** (Brewin' and Chewin') → **Şarapçılık** (Vinery) → **Mutfak** (Bakery, Candlelight, Hearth and Harvest). Satır y = 6: **Mevsimler** (-6, 6) → **Takvim** → **Mevsim Sensörü**. Farmer's Delight ve diğerlerinde modun kendi advancement'ları kullanıldı.
- **Comfort gerçekten iyileştirir:** Farmer's Delight'ın `ComfortEffect`'i gamerule'a bakmıyor; tokluk barı boşken canı dolduruyor. Can yenilenmesi kapalı olsa da çorbalar şifa kaynağı.
- **Serene Seasons** (`config/sereneseasons`): alt mevsim 8 gün (mevsim 24, yıl 96 gün), sunucu boşken de ilerler, mevsim dışı ekin yavaş büyür (`out_of_season_crop_behavior = 0`), y 48 altı her mevsim verimli.

**ID'ler:** Bölümün tek bayt son eki (`4D414345524143xx`) `…FF`'de doldu. Sonrası `4D414345524144xx` önekiyle devam eder; bu önek bölüm ID'si ile çakışmaz. Her ID tam **16 hex hane** olmalı; 17 haneli bir ID FTB Quests'i bozar.

Sonraki boş ID önerisi: `4D41434552414464` ve sonrası.
