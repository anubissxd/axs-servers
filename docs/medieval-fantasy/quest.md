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
- **Birden fazla yığılmayan eşya (iksir, alet, zırh) ödülü:** her biri için ayrı bir `item` ödülü ekleyin; tek ödüle `Count: 2b` yazmayın.
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
| 1 | **Büyü Masası** | `4D41434552414334` | 0 | `irons_spellbooks:inscription_table` **craftla** (`only_from_crafting`) | 2 Can İksiri (Instant Health I; iki ayrı ödül: `4D41434552414336`, `4D41434552414337`) | Tekli. Iron's Spells'e giriş: büyü parşömenlerini büyü kitabına işlemek. `hide_until_deps_complete`. |
| 2 | **Büyü Kitabı** | `4D41434552414338` | 1 | `irons_spellbooks:iron_spell_book` (Ironbound Tome) **craftla** (`only_from_crafting`) | 2 Can İksiri (`4D4143455241433A`, `4D4143455241433B`) | Zincir: Büyü Masası → Büyü Kitabı. İlk büyü kitabı, 6 büyü yuvası. `hide_until_deps_complete`. |
| 3 | **Parşömen Ocağı** | `4D4143455241433C` | 2 | `irons_spellbooks:scroll_forge` **craftla** (`only_from_crafting`) | 2 Can İksiri (`…3E`, `…3F`) | Zincir devamı. Buradan yol ikiye ayrılır. |
| 4 | **Büyü Okulları** | `4D41434552414340` | 3 | `checkmark` (oyuncu okuyup işaretler) | — | Okullar ve odak eşyaları anlatılır. |
| 5 | **Mürekkep** | `4D41434552414342` | 3 | `irons_spellbooks:common_ink` **edin** | — | Mürekkep nadirliği ve kazanda yükseltme anlatılır. Common Ink sandıklardan/ganimetten gelir. |
| 6–21 | **Okul görevleri** (16 adet) | `…44` – `…62` (task: +1) | 4 **ve** 5 | Belirli büyünün **parşömenine** sahip ol | — | Ateş: Firebolt, Buz: Icicle, Şimşek: Electrocute, Kutsal: Healing Circle, Ender: Magic Missile, Kan: Ray of Siphoning, Evocation: Fang Strike, Doğa: Poison Arrow, Su (Aqua): Water Ball, Ses (Sound): Clef, Ruh (Spirit): Soul Burst, Simetri (Symmetry): Jade Bullet, Technomancy: Laserbolt — hepsi Common. Common büyüsü olmayanlar: Abyssal: Tidal Tear (Uncommon), Eldritch: Summon Sculk Centipede (Rare), Unstable: Glitch Projectiles (Rare). 2 sütun × 8 satır (x 10 ve 11.5, y -5.25…5.25, aralık 1.5). |

Kapı görevinden iki kol çıkar: **sağ kol** Iron's Spells (yukarıdaki 1–21), **sol kol** RPG Series / Spell Engine (aşağıdaki 22–32).

| # | Görev | ID | Bağlı olduğu | Hedef | Ödül | Not |
|---|---|---|---|---|---|---|
| 22 | **Büyü Bağlama Masası** | `4D41434552414364` | 0 | `spell_engine:spell_binding` **craftla** (`only_from_crafting`) | 2 Can İksiri (tek ödül, `Count: 2b`, `…66`) | Konum (-2, 0). |
| 23 | **Sınıflar** | `4D41434552414367` | 22 | `checkmark` | — | Kitap yaratma (Book + 1 seviye), 8 sınıf kitabı, lapis ile büyü bağlama, kademe kuralı, Spell Book yuvası, tuşlar. |
| 24 | **Rünler** | `4D41434552414369` | 22 | `runes:crafting_altar` **craftla** | — | Hangi sınıf hangi rünü harcar, sunak iki kat verir, Rune Pouch. |
| 25–32 | **Sınıf yolları** (8 adet) | `…6B` – `…79` (task: +1) | 23 | `advancement` task: `rpg_series:spell_novice_<sınıf>` (kitaba ilk büyüyü bağlamak) | — | Arcane, Ateş, Buz (wizards), Paladin, Rahip (paladins), Okçu (archers), Haydut, Savaşçı (rogues). Açıklamada kitap, silahlar, bedel ve 6 büyü. 2 sütun × 4 satır (x -6 / -7.5). |

- **RPG Series görev tespiti:** Spell Engine'in kendi advancement'ları (`rpg_series:*`) görev olarak kullanılabilir: `type: "advancement"`, `advancement: "rpg_series:..."`, `criterion: ""`. Masayı ziyaret: `rpg_series:classes`; kitap yaratma: `rpg_series:path_choose_<sınıf>`; ilk büyüyü bağlama: `spell_novice_<sınıf>`; kitabı doldurma: `spell_master_<sınıf>`; kitaptan büyü atma: `spell_cast_<sınıf>_book`.

Sonraki boş ID önerisi: `4D4143455241437B` ve sonrası (bölüm ID'si + artan son hex hane: …39, 3A, 3B, 3C…).
