// Erwin Smith: "Keşif Birliği Seferleri" (öldürme görevleri).
//
// Kısaca: Maceracı rütbeli oyuncu Erwin'den sefer ister; Erwin, rütbeye uygun 3 sefer TEKLİF eder (rastgele, her seferinde
// farklı, son 4 sefer tekrar edilmez). Oyuncu sohbetteki [A] [B] [C]'ye tıklayarak birini seçer, hedef canavarları öldürür,
// Ek sistemler: Kader Zinciri (3 bölümlük bağlı sefer), Kanlı Ay (%20 lanetli teklif, ödül x2), Kan Bahsi (ödül x1.5, ölürsen iptal),
// Ölüm Emri (%20 isimli elit hedef, ekstra ödül), Unvanlar ve Sefer Defteri.
// Erwin'e RAPOR verir ve ödülünü alır. Seferler tamamlandıkça Birlik rütbesi yükselir (Yeminsiz → Kül Bekçisi → Kan Yeminli → Gece Avcısı → Eşik Muhafızı),
// yeni ve zor sefer türleri açılır. Ödül: zümrüt (zorluğa göre aralık; blok nadir ekstra) + şansa bağlı ekstra ganimet + %5 "büyük zafer".
// Yoruichi'nin eğitim ücretleri de zümrüt bloğudur; Erwin bu ekonominin gelir kapısıdır (bkz. yoruichi_pay.js).
//
// Etkileşim: Easy NPC diyalog düğmeleri bir istek etiketi verir ve kapanır; bu script etiketi alır:
//   erwin_req (sefer iste), erwin_rep (rapor), erwin_info (şu anki sefer), erwin_stat (rütbe/kayıt), erwin_abort (bırak).
// Oyuncu durumu oyuncunun kalıcı verisindedir (persistentData 'erwin_*'); sunucu yeniden başlasa da kaybolmaz.
// Sınırlar: aynı anda tek sefer, seferler arası bekleme, günlük sefer sınırı (sömürüyü/enflasyonu önler).
// Not: 'global' bir Java haritasıdır, null yazılmaz; oyuncu durumu global'de tutulmaz.
// Not2: server_scripts dosyaları aynı scope'ta çalışıyor, isimler benzersiz olmalı (erwin* öneki).

// ------------------------------------------------------------------ Ayarlar
const ERWIN_COOLDOWN_MS = 240000 // sefer bitince yeni sefer istemek için bekleme (4 dk)
const ERWIN_ABORT_COOLDOWN_MS = 300000 // seferi bırakınca bekleme (5 dk)
const ERWIN_DAILY_LIMIT = 5 // günde en fazla tamamlanabilir sefer (UTC günü)
const ERWIN_OFFER_TTL_MS = 600000 // teklifler 10 dk geçerli
const ERWIN_CRIT_CHANCE = 0.03 // "büyük zafer": zümrüt ödülü ikiye katlanır
const ERWIN_RANK_NAMES = ['Yeminsiz', 'Kül Bekçisi', 'Kan Yeminli', 'Gece Avcısı', 'Eşik Muhafızı']
// Rütbe r'de teklif edilen tür (tier) havuzu
const ERWIN_RANK_TIERS = [[1], [1, 2], [2, 3], [3, 4], [4, 5]]
// Terfi koşulu: rütbe r, PROMO_TIER[r] türünden PROMO_COUNT[r] sefer tamamlayınca r+1 olur
const ERWIN_PROMO_TIER = [1, 2, 3, 4]
const ERWIN_PROMO_COUNT = [4, 5, 5, 4]

// ------------------------------------------------------------------ Hedef grupları (varlık kimlikleri)
// Kimlikler sunucudaki kayıt defterinden doğrulandı (2026-09-29).
function erwinIds(ns, names) {
  var out = []
  for (var i = 0; i < names.length; i++) out.push(ns + ':' + names[i])
  return out
}
const EG_ZOMBIES = ['minecraft:zombie', 'minecraft:husk', 'minecraft:zombie_villager']
const EG_SKELETONS = ['minecraft:skeleton', 'minecraft:stray']
const EG_SPIDERS = ['minecraft:spider', 'minecraft:cave_spider']
const EG_CREEPERS = ['minecraft:creeper'].concat(erwinIds('creeperoverhaul', ['badlands_creeper', 'bamboo_creeper', 'beach_creeper', 'cave_creeper', 'dark_oak_creeper', 'desert_creeper', 'dripstone_creeper', 'hills_creeper', 'jungle_creeper', 'ocean_creeper', 'savannah_creeper', 'snowy_creeper', 'spruce_creeper', 'swamp_creeper']))
const EG_ENDERMEN = ['minecraft:enderman'].concat(erwinIds('endermanoverhaul', ['badlands_enderman', 'cave_enderman', 'coral_enderman', 'crimson_forest_enderman', 'dark_oak_enderman', 'desert_enderman', 'end_enderman', 'end_islands_enderman', 'flower_fields_enderman', 'ice_spikes_enderman', 'nether_wastes_enderman', 'savanna_enderman', 'snowy_enderman', 'soulsand_valley_enderman', 'swamp_enderman', 'warped_forest_enderman', 'windswept_hills_enderman']))
const EG_ILLAGERS = ['minecraft:pillager', 'minecraft:vindicator', 'minecraft:evoker', 'minecraft:illusioner']
const EG_GRAVEYARD = erwinIds('graveyard', ['acolyte', 'corrupted_pillager', 'corrupted_vindicator', 'ghoul', 'nameless_hanged', 'nightmare', 'reaper', 'revenant', 'skeleton_creeper', 'wraith'])
const EG_DEEPER = erwinIds('deeperdarker', ['sculk_centipede', 'sculk_leech', 'sculk_snapper', 'shattered', 'shriek_worm', 'sludge'])
const EG_CHAOS = erwinIds('born_in_chaos_v1', ['barrel_zombie', 'bone_imp', 'bonescaller', 'decaying_zombie', 'decrepit_skeleton', 'dread_hound', 'firelight', 'lifestealer', 'nightmare_stalker', 'restless_spirit', 'skeleton_demoman', 'skeleton_thrasher', 'swarmer', 'zombie_bruiser', 'zombie_clown', 'zombie_fisherman', 'zombie_lumberjack'])
const EG_MAGE_CULTS = erwinIds('irons_spellbooks', ['apothecarist', 'archevoker', 'catacombs_zombie', 'cryomancer', 'cultist', 'magehunter_vindicator', 'necromancer', 'pyromancer'])
const EG_KNIGHTS = erwinIds('knightquest', ['eldknight', 'fallen_knight', 'samhain']).concat(['knights_and_castles:undead_knight'], erwinIds('legendary_monsters', ['beheaded_knight', 'haunted_knight', 'resurrected_knight', 'posessed_paladin']))
const EG_NETHER_SOLDIERS = ['minecraft:piglin', 'minecraft:zombified_piglin', 'minecraft:hoglin', 'minecraft:zoglin']
const EG_NETHER_FORTRESS = ['minecraft:wither_skeleton', 'minecraft:blaze']
const EG_MUTANTS = erwinIds('mutantmonsters', ['mutant_creeper', 'mutant_enderman', 'mutant_skeleton', 'mutant_zombie'])
const EG_IAF_LESSER = erwinIds('iceandfire', ['troll', 'cockatrice', 'deathworm', 'stymphalian_bird', 'siren', 'cyclops', 'gorgon'])
const EG_MOWZIE = erwinIds('mowziesmobs', ['foliaath', 'grottol', 'naga', 'bluff', 'umvuthana_raptor', 'umvuthana_crane'])
const EG_LEGENDARY = erwinIds('legendary_monsters', ['ambusher', 'ancient_guardian', 'chorusling', 'cloud_golem', 'flame_drifter', 'flameborn_guard', 'flameborn_warrior', 'frostbitten_golem', 'lava_eater', 'mossy_golem', 'shulker_mimic', 'skeletosaurus', 'wandering_eye'])
const EG_CATA_MINOR = erwinIds('cataclysm', ['draugr', 'elite_draugr', 'ignited_berserker', 'ignited_revenant', 'deepling', 'deepling_brute', 'deepling_priest', 'koboleton', 'kobolediator', 'aptrgangr', 'amethyst_crab'])
const EG_ALEX = erwinIds('alexscaves', ['brainiac', 'caniac', 'corrodent', 'deep_one', 'deep_one_knight', 'deep_one_mage', 'ferrouslime', 'gum_worm', 'magnetron', 'nucleeper', 'underzealot', 'vesper', 'watcher'])
const EG_GRAVEYARD_ELITE = erwinIds('graveyard', ['nightmare', 'nameless_hanged', 'reaper', 'revenant'])
const EG_DEEPER_ELITE = erwinIds('deeperdarker', ['stalker', 'shriek_worm', 'shattered'])
const EG_CATA_BOSS_A = erwinIds('cataclysm', ['ignis', 'netherite_monstrosity', 'ender_guardian', 'the_harbinger', 'the_prowler'])
const EG_CATA_BOSS_B = erwinIds('cataclysm', ['the_leviathan', 'scylla', 'maledictus', 'ancient_remnant'])
const EG_BOMD = erwinIds('bosses_of_mass_destruction', ['void_blossom', 'obsidilith', 'gauntlet', 'lich'])
const EG_MOWZIE_BOSS = erwinIds('mowziesmobs', ['ferrous_wroughtnaut', 'frostmaw', 'umvuthi'])
const EG_DRAGONS = erwinIds('iceandfire', ['fire_dragon', 'ice_dragon', 'lightning_dragon'])
const EG_SOULS_BOSS = erwinIds('soulsweapons', ['draugr_boss', 'accursed_lord_boss', 'chaos_monarch', 'frost_giant', 'moonknight'])

// ------------------------------------------------------------------ Sefer şablonları
// tier: 1 Devriye, 2 Sefer, 3 Derin Sefer, 4 Ölümcül Sefer, 5 Efsane Sefer
// unit: sayılan hedefin adı (Türkçe), min/max: hedef sayısı, brief: Erwin'in görev talimatı
const ERWIN_TEMPLATES = [
  // ---- Tür I: Devriye ----
  { key: 't1_zombi', tier: 1, title: 'Zombi Avı', unit: 'ölü asker', targets: EG_ZOMBIES, min: 14, max: 20, w: 3, brief: 'Geceleri sınıra sızan ölü askerler var. Onları geri püskürt; sayıları çoğalmadan.' },
  { key: 't1_iskelet', tier: 1, title: 'İskelet Devriyesi', unit: 'iskelet', targets: EG_SKELETONS, min: 12, max: 16, w: 3, brief: 'Okçu iskeletler yolları tehlikeli hâle getirdi. Sınır yollarını temizle.' },
  { key: 't1_orumcek', tier: 1, title: 'Örümcek Temizliği', unit: 'örümcek', targets: EG_SPIDERS, min: 12, max: 16, w: 3, brief: 'Mağara ağızlarında örümcek yuvaları var. Erzak kafilelerimiz geçemiyor.' },
  { key: 't1_surunen', tier: 1, title: 'Sürünen Temizliği', unit: 'creeper', targets: EG_CREEPERS, min: 8, max: 12, w: 3, brief: 'Creeper\'lar tarlalara ve depolara zarar veriyor. Uzaktan ve dikkatli davran.' },
  { key: 't1_karisik', tier: 1, title: 'Karışık Devriye', unit: 'düşman', targets: EG_ZOMBIES.concat(EG_SKELETONS, EG_SPIDERS), min: 22, max: 30, w: 2, brief: 'Bugün özel bir hedef yok. Gördüğün her ölü askeri, iskeleti ve örümceği temizle.' },
  { key: 't1_sahil', tier: 1, title: 'Sahil Devriyesi', unit: 'boğulmuş', targets: ['minecraft:drowned'], min: 10, max: 14, w: 2, brief: 'Boğulmuşlar kıyıdan karaya çıkıyor. Balıkçılarımızı korumamız gerek.' },
  { key: 't1_balcik', tier: 1, title: 'Balçık Temizliği', unit: 'slime', targets: ['minecraft:slime'], min: 8, max: 12, w: 1, brief: 'Bataklık bölgesinde balçıklar yollara taşmış. Kıymetli malzemeler kayboluyor.' },

  // ---- Tür II: Sefer ----
  { key: 't2_yagmaci', tier: 2, title: 'Yağmacı Çetesi', unit: 'yağmacı', targets: EG_ILLAGERS, min: 10, max: 14, w: 3, brief: 'Yağmacılar sınır köylerine saldırıyor. Çetelerini dağıtmalıyız.' },
  { key: 't2_ender', tier: 2, title: 'Gölge Uzunları', unit: 'enderman', targets: EG_ENDERMEN, min: 8, max: 12, w: 2, brief: 'Uzun gölgeler avcılarımı dağıttı. Enderman\'ları azaltmalıyız. Göz teması kurma.' },
  { key: 't2_mezarlik', tier: 2, title: 'Mezarlık Seferi', unit: 'mezarlık yaratığı', targets: EG_GRAVEYARD, min: 8, max: 12, w: 3, brief: 'Eski mezarlıklardan yaratıklar yükseliyor. Toprağa gömülmesi gerekenleri geri gönder.' },
  { key: 't2_karanlik', tier: 2, title: 'Derin Karanlık', unit: 'karanlık yaratık', targets: EG_DEEPER, min: 8, max: 12, w: 2, brief: 'Derinlerdeki karanlık kıpırdıyor. Sessiz ol, fenerini yanında tut, onları geri püskürt.' },
  { key: 't2_kaos', tier: 2, title: 'Kaos Sürüsü', unit: 'kaos yaratığı', targets: EG_CHAOS, min: 10, max: 14, w: 2, brief: 'Bilinmeyen, tuhaf yaratıklar dolaşıyor. Nereden geldikleri belli değil; sayıları azalmalı.' },
  { key: 't2_cadi', tier: 2, title: 'Cadı Avı', unit: 'cadı', targets: ['minecraft:witch'], min: 4, max: 6, w: 2, brief: 'Bataklıktaki cadılar iksirleriyle devriyeleri zehirledi. İksirlerine dikkat.' },
  { key: 't2_nether', tier: 2, title: 'Alevler Ötesi', unit: 'Nether askeri', targets: EG_NETHER_SOLDIERS, min: 12, max: 16, w: 2, brief: 'Nether\'in bu yakasındaki askerler sınıra yaklaşıyor. Ateşe hazırlıklı git.' },
  { key: 't2_kar', tier: 2, title: 'Çöl ve Kar Devriyesi', unit: 'çöl/kar yaratığı', targets: ['minecraft:husk', 'minecraft:stray'], min: 12, max: 16, w: 1, brief: 'Uç bölgelerdeki devriyelerim haber alamıyor. Yolları açık tut.' },
  { key: 't2_sihir', tier: 2, title: 'Sihir Karşıtı Fırkalar', unit: 'büyücü', targets: EG_MAGE_CULTS, min: 5, max: 8, w: 2, brief: 'Yasak büyülerle uğraşan fırkalar var. Mühürlü kalelerde saklanıyorlar.' },
  { key: 't2_dusmus', tier: 2, title: 'Düşmüş Şövalyeler', unit: 'düşmüş şövalye', targets: EG_KNIGHTS, min: 6, max: 10, w: 2, brief: 'Bir zamanlar bizden olanlar artık ölümün emrinde. Onları huzura kavuştur.' },

  // ---- Tür III: Derin Sefer ----
  { key: 't3_ravager', tier: 3, title: 'Yıkım Canavarları', unit: 'ravager', targets: ['minecraft:ravager'], min: 3, max: 4, w: 2, brief: 'Yağmacıların yıkım canavarları çiftlikleri ezdi. Onları teker teker durdur.' },
  { key: 't3_kale', tier: 3, title: 'Kale Seferi', unit: 'kale nöbetçisi', targets: EG_NETHER_FORTRESS, min: 12, max: 16, w: 3, brief: 'Nether kalelerinde nöbetçiler çoğaldı. Kemik ve alev; ikisini de azalt.' },
  { key: 't3_mutant', tier: 3, title: 'Mutant Avı', unit: 'mutant', targets: EG_MUTANTS, min: 1, max: 2, w: 1, brief: 'Bazı canavarlar normalden çok büyümüş. Bu tek bir avcıya göre değil; dikkatli ol.' },
  { key: 't3_iaf', tier: 3, title: 'Kadim Yaratıklar', unit: 'kadim yaratık', targets: EG_IAF_LESSER, min: 4, max: 6, w: 3, brief: 'Efsanelerdeki yaratıklar gerçek çıktı: trol, kokatris, gorgon... Gözlerine bakma, kıyıdan uzak dur.' },
  { key: 't3_mowzie', tier: 3, title: 'Orman Ruhları', unit: 'orman ruhu', targets: EG_MOWZIE, min: 5, max: 8, w: 2, brief: 'Ormanın derinlerinde yerliler ve bitki canavarları yolları kesiyor. Kesme, temizle.' },
  { key: 't3_efsane', tier: 3, title: 'Efsanevi Nöbetçiler', unit: 'nöbetçi', targets: EG_LEGENDARY, min: 6, max: 10, w: 2, brief: 'Kadim harabelerde tuhaf nöbetçiler uyandı. Yapılarını korumak için ölene kadar savaşırlar.' },
  { key: 't3_yikinti', tier: 3, title: 'Kadim Yıkıntılar', unit: 'yıkıntı bekçisi', targets: EG_CATA_MINOR, min: 6, max: 10, w: 2, brief: 'Yıkıntılardaki eski kavimlerin askerleri hâlâ nöbette. Deneyimli bir savaşçı gerek.' },
  { key: 't3_mezarelit', tier: 3, title: 'Mezarlığın Gerçek Sahipleri', unit: 'mezarlık elit', targets: EG_GRAVEYARD_ELITE, min: 4, max: 6, w: 2, brief: 'Mezarlıktaki daha güçlü hayaletleri ve orakçıları hedef al. Sabırlı ol.' },
  { key: 't3_derin', tier: 3, title: 'Derinin Derini', unit: 'derin yaratık', targets: EG_DEEPER_ELITE, min: 3, max: 5, w: 2, brief: 'Derin karanlığın avcıları, iz süren yaratıklar. Çok sessiz, çok ölümcül.' },
  { key: 't3_maden', tier: 3, title: 'Yer Altı Tehlikesi', unit: 'mağara yaratığı', targets: EG_ALEX, min: 8, max: 12, w: 2, brief: 'Yeraltı mağaralarında garip canavarlar var. Geri dönenler anlatıyor: hiçbiri normal değil.' },

  // ---- Tür IV: Ölümcül Sefer (tek büyük hedef) ----
  { key: 't4_cata', tier: 4, title: 'Kadim Kâbus', unit: 'kâbus', targets: EG_CATA_BOSS_A, min: 1, max: 1, w: 3, brief: 'Yıkıntıların derinlerinde bir kâbus uyandı. Adı bile ürpertici. Sefer hazırlığı yap, dönmeyi bilerek git.' },
  { key: 't4_bomd', tier: 4, title: 'Yıkım Koruyucusu', unit: 'koruyucu', targets: EG_BOMD, min: 1, max: 1, w: 2, brief: 'Bu yaratık kendi mabedinden çıkmıyor. Onu yenmeden geçit yok.' },
  { key: 't4_mowzie', tier: 4, title: 'Orman Bekçisi', unit: 'bekçi', targets: EG_MOWZIE_BOSS, min: 1, max: 1, w: 2, brief: 'Kadim bekçiler kendi topraklarını korur. Onlarla savaşacaksan hazırlıklı git.' },
  { key: 't4_kral', tier: 4, title: 'Ölüm Kral\'ı', unit: 'ölüm hükümdarı', targets: ['irons_spellbooks:dead_king', 'irons_spellbooks:fire_boss', 'graveyard:lich'], min: 1, max: 1, w: 2, brief: 'Ölümsüz ve ateş kralları büyü kalelerinde hüküm sürüyor. Birinin başını getir.' },
  { key: 't4_ruh', tier: 4, title: 'Kadim Ruh', unit: 'kadim varlık', targets: EG_SOULS_BOSS, min: 1, max: 1, w: 1, brief: 'Efsanelerde adı geçen kadim varlıklardan biri geri döndü. Kim olduğunu görünce anlarsın.' },
  { key: 't4_koruyucu', tier: 4, title: 'Gözcü', unit: 'gözcü', targets: ['minecraft:elder_guardian'], min: 1, max: 1, w: 1, brief: 'Okyanus anıtlarının kadim gözcüsü. Onunla savaşmak, dayanıklılık meselesidir.' },

  // ---- Tür V: Efsane Sefer (yalnızca Eşik Muhafızı) ----
  { key: 't5_ejder', tier: 5, title: 'Ejderha Avı', unit: 'ejderha', targets: EG_DRAGONS, min: 1, max: 1, w: 3, brief: 'Bir ejderha gökyüzünü karartıyor. Bu, birliğin en büyük seferi. Dönmeyenler olur; sen dön.' },
  { key: 't5_leviathan', tier: 5, title: 'Derinlerin Efendisi', unit: 'efendi', targets: EG_CATA_BOSS_B, min: 1, max: 1, w: 3, brief: 'Yıkıntıların ve derinlerin efendileri kıpırdanıyor. Onlarla yüzleşmek, tek başına bir zafer.' },
  { key: 't5_wither', tier: 5, title: 'Solmuş Hükümdar', unit: 'hükümdar', targets: ['minecraft:wither'], min: 1, max: 1, w: 2, brief: 'Bir Wither çağrıldı ve dizginlenmeyecek. Ölmeden ona son ver.' },
  { key: 't5_warden', tier: 5, title: 'Karanlığın Muhafızı', unit: 'muhafız', targets: ['minecraft:warden'], min: 1, max: 1, w: 2, brief: 'Derin karanlıkta bir muhafız uyandı. Duyar, koklar, hissetmez; ona rağmen yen.' },
  { key: 't5_ejderha_son', tier: 5, title: 'Son Ejderha', unit: 'ejderha', targets: ['minecraft:ender_dragon'], min: 1, max: 1, w: 2, brief: 'Uç\'un efendisi. Birliğin efsanesi burada yazılır.' }
]

// Hedef sayıları ~%25 artırıldı (kazanım kolay olmasın); tek hedefli (boss) seferlere dokunulmaz
ERWIN_TEMPLATES.forEach(t => { if (t.max > 1) { t.min = Math.ceil(t.min * 1.25); t.max = Math.ceil(t.max * 1.25) } })
const ERWIN_BY_KEY = {}
ERWIN_TEMPLATES.forEach(t => { ERWIN_BY_KEY[t.key] = t })

// ------------------------------------------------------------------ Ödül tabloları
// em: zümrüt (bozuk) aralığı [min, max]; blockP/blockN: zümrüt BLOĞU ise nadir bir ekstradır (blok asıl ödeme aracıdır, ödül olarak seyrek verilir).
// bonus: bağımsız şans ile eklenen ekstra ganimet (şanslar aşağıda %40 kısılır).
// Ödül dengesi: 9 zümrüt = 1 blok. Tür I sefer ortalama 2 zümrüt (~0,22 blok), Tür IV ~11 zümrüt + %14 ihtimalle 1 blok. Yoruichi toplam 19 blok = 171 zümrüt ister.
const ERWIN_REWARDS = {
  1: { em: [1, 3], blockP: 0.03, blockN: [1, 1], bonus: [
    { id: 'minecraft:iron_ingot', n: [8, 16], p: 0.28, label: 'demir külçe' },
    { id: 'minecraft:experience_bottle', n: [4, 8], p: 0.24, label: 'tecrübe şişesi' },
    { id: 'irons_spellbooks:common_ink', n: [1, 2], p: 0.1, label: 'sıradan mürekkep' },
    { id: 'minecraft:diamond', n: [1, 1], p: 0.05, label: 'elmas' }
  ] },
  2: { em: [2, 4], blockP: 0.045, blockN: [1, 1], bonus: [
    { id: 'minecraft:gold_ingot', n: [8, 16], p: 0.24, label: 'altın külçe' },
    { id: 'minecraft:experience_bottle', n: [8, 16], p: 0.28, label: 'tecrübe şişesi' },
    { id: 'minecraft:diamond', n: [1, 2], p: 0.14, label: 'elmas' },
    { id: 'irons_spellbooks:uncommon_ink', n: [1, 1], p: 0.1, label: 'sıra dışı mürekkep' },
    { id: 'irons_spellbooks:arcane_essence', n: [2, 4], p: 0.12, label: 'gizemli öz' }
  ] },
  3: { em: [4, 7], blockP: 0.075, blockN: [1, 1], bonus: [
    { id: 'minecraft:experience_bottle', n: [16, 24], p: 0.28, label: 'tecrübe şişesi' },
    { id: 'minecraft:diamond', n: [2, 3], p: 0.24, label: 'elmas' },
    { id: 'irons_spellbooks:rare_ink', n: [1, 1], p: 0.08, label: 'nadir mürekkep' },
    { id: 'minecraft:netherite_scrap', n: [1, 1], p: 0.05, label: 'netherite parçası' },
  ] },
  4: { em: [9, 14], blockP: 0.14, blockN: [1, 1], bonus: [
    { id: 'minecraft:experience_bottle', n: [32, 32], p: 0.32, label: 'tecrübe şişesi' },
    { id: 'minecraft:diamond', n: [3, 5], p: 0.28, label: 'elmas' },
    { id: 'minecraft:netherite_scrap', n: [1, 2], p: 0.16, label: 'netherite parçası' },
    { id: 'irons_spellbooks:epic_ink', n: [1, 1], p: 0.08, label: 'destansı mürekkep' },
    { id: 'minecraft:totem_of_undying', n: [1, 1], p: 0.04, label: 'ölümsüzlük totemi' }
  ] },
  5: { em: [18, 26], blockP: 0.22, blockN: [1, 2], bonus: [
    { id: 'minecraft:experience_bottle', n: [64, 64], p: 0.4, label: 'tecrübe şişesi' },
    { id: 'minecraft:diamond', n: [6, 10], p: 0.32, label: 'elmas' },
    { id: 'minecraft:netherite_ingot', n: [1, 1], p: 0.08, label: 'netherite külçe' },
    { id: 'irons_spellbooks:legendary_ink', n: [1, 1], p: 0.06, label: 'efsanevi mürekkep' },
    { id: 'minecraft:totem_of_undying', n: [1, 1], p: 0.06, label: 'ölümsüzlük totemi' }
  ] }
}

Object.keys(ERWIN_REWARDS).forEach(k => ERWIN_REWARDS[k].bonus.forEach(b => { b.p = Math.round(b.p * 60) / 100 }))

// ------------------------------------------------------------------ Erwin'in sesi (metin havuzları)
const ERWIN_OFFER_HEAD = [
  'Önümde bugün üç sefer var. Hangisi seni daha çok ilgilendiriyor?',
  'Sınırdan gelen raporlara göre şu üç iş bekliyor. Seç.',
  'Gözcülerim üç ihtiyaç bildirdi. Birini sen üstlen.'
]
const ERWIN_ACCEPT = [
  'Karar verdin. Hazırlığını yap, yola çık. Sağ salim dön.',
  'İyi seçim. Bilgin olsun: şansı olanlar hazırlıklı olanlardır.',
  'Anlaştık. Dönünce raporunu bekliyorum.'
]
const ERWIN_PRAISE = {
  1: ['İlk adım her zaman en zorudur. Devriyeyi iyi tamamladın.', 'Sınır biraz daha güvenli. Böyle devam et.', 'Yeterince iyisin. Ama iş daha başlıyor.'],
  2: ['İyi iş. Bu seferi herkes tamamlayamaz.', 'Adamlarım senin gibi olsaydı, kayıplarımız az olurdu.', 'Bugün sınırda kimse ölmedi. Bu senin sayende.'],
  3: ['Derin sefer... Az kişi bu kadar temiz dönüyor. Etkilendim.', 'Bir birlik komutanı bunu duysa bile şaşırırdı.', 'Bu kadar tehlikeyi hiçe sayan biri arıyordum.'],
  4: ['Ölümcül bir sefer ve sen hâlâ ayaktasın. Efsaneler böyle doğar.', 'Bunu gördüm ama yine de inanamadım. Tebrikler.', 'Bu zaferin adı Caddy\'de anılacak.'],
  5: ['Bu artık bir sefer değil, bir destan. Adın birliğin kayıtlarına geçti.', 'İnsanlık için bir adım daha. Bunu yapabilecek kimse yoktu. Sen vardın.', 'Böyle bir zaferi yalnızca birkaç kişi yazar. Sen birisin.']
}
const ERWIN_PROMO_TEXT = [
  'Sisin içinden üç kez döndün. Artık yeminsiz değilsin: bugünden itibaren **Kül Bekçisi**\'sin. Seni gerçek avlara çıkarabilirim.',
  'Av üstüne av... Karanlık dönüşlerini fark etmeye başladı. Bundan sonra **Kan Yeminli**\'sin. Daha derin yerlere inebilirsin.',
  'Yemin sana dar geldi. Artık bir **Gece Avcısı**\'sın. Kan sözleri sana açık; ama unutma, onlar geri dönmeyi vaat etmez.',
  'Ölümle yeterince göz göze geldin. **Eşik Muhafızı** unvanını hak ettin. Karanlığın son kapısını artık sana emanet edebilirim.'
]
// Rütbe terfisinde açılan büyü hocası ipuçları (hocalar_egitim.js)
const ERWIN_TEACHER_HINT = {
  1: 'Kakashi artık Chidori\'yi sana öğretebilir. Vlorya\'lıysan Yoruichi de Shunpo\'nun ilk adımını gösterir.',
  2: 'Chidori\'nin 3. seviyesi Kakashi\'de açıldı. Yoruichi\'nin ikinci eğitimi (Beş Gölge) de açık.',
  3: 'Itachi Amaterasu\'yu öğretmeye hazır. Chidori\'nin son seviyesi de Kakashi\'de açıldı. Yoruichi\'nin Gölge Klon sınavı da açık. Gojo Mavi ve Kırmızı\'yı öğretmeye hazır.',
  4: 'Itachi Tsukiyomi\'yi öğretmeye hazır (önce Amaterasu\'yu tamamla). Gojo Mor\'u öğretmeye hazır (önce Mavi ve Kırmızı\'yı tamamla).'
}
// Sinema verisi (sinema_motoru.js): sefer kabul başlıkları ve terfi hikâyesi
const ERWIN_TIER_COLOR = ['', 'gray', 'green', 'gold', 'red', 'dark_red']
const ERWIN_PROMO_STORY = {
  1: ['Sınırın ötesinde Sis her gece biraz daha yaklaşıyor. Feneri taşıyacak kadar güçlüsün artık.', 'Kül Bekçileri, yanan şeyin son nöbetçisidir. Onları hiç unutmayız.'],
  2: ['Kan Yemini kimseye zorla verilmez. Bir kez ettin mi, geri dönüşü yok.', 'Adın artık listenin başında; düşmanlar da bunu bilecek.'],
  3: ['Gece Avcıları karanlığın içinde yürür ama karanlığa dönüşmez. Sen de dönüşme.', 'Kan Sözleri ağırdır. Taşıyabileceğini gördüm.'],
  4: ['Eşik, insanlıkla karanlığın kesiştiği yerdir. Orada durup bekleyecek biri gerekir.', 'Bugünden itibaren o kişi sensin.']
}
function erwinAcceptSteps(tier, title) {
  var steps = [{ t: 0.3, title: [ERWIN_TIER_NAMES[tier].toUpperCase(), title, ERWIN_TIER_COLOR[tier]] }]
  if (tier <= 2) steps.push({ t: 0, sound: ['minecraft:block.bell.use', 0.8, 0.9] })
  else steps.push({ t: 0, sound: ['minecraft:event.raid.horn', 0.7, 1] })
  if (tier >= 4) {
    steps.push({ t: 0.6, sound: ['minecraft:entity.ender_dragon.growl', 0.4, 0.7] })
    steps.push({ t: 0.5, cmd: 'effect give {p} minecraft:darkness 3 0 true' })
  }
  return steps
}
const ERWIN_TIER_NAMES = ['', 'Sis Devriyesi', 'Av', 'Karanlığa İniş', 'Kan Sözü', 'Kıyamet Seferi']

// ------------------------------------------------------------------ Kader Zincirleri
// 3 bölümlük bağlı seferler. Bölüm bitince Erwin hikâyeyi sürdürür, sonraki bölüm otomatik başlar. Son bölümde ikinci bir ödül (yarı blok) atılır.
// minRank: teklif için en düşük rütbe (0-4). Tamamlanan zincir tekrar teklif edilmez.
const ERWIN_CHAINS = [
  { id: 'mezarlik', title: 'Mezarlığın Uyanışı', minRank: 1, steps: [
    { tier: 2, title: 'Toprağın Altındakiler', unit: 'mezarlık yaratığı', targets: EG_GRAVEYARD, need: 8, brief: 'Eski mezarlıkta toprak kıpırdıyor. Önce yükselenleri geri gönder.' },
    { tier: 2, title: 'Ölülerin Ordusu', unit: 'ölü asker', targets: EG_ZOMBIES.concat(EG_SKELETONS), need: 24, brief: 'Biri onları çağırıyor. Ordusunu dağıt; çağıran görünmeden yenilemez.' },
    { tier: 3, title: 'Çağıranın Sonu', unit: 'mezarlık elit', targets: EG_GRAVEYARD_ELITE.concat(['graveyard:lich']), need: 4, brief: 'Sonunda çağıran kendini gösterdi. Bu gece mezarlık sessizliğe gömülmeli.' } ] },
  { id: 'yagmaci', title: 'Kızıl Yağmacılar', minRank: 1, steps: [
    { tier: 2, title: 'Kızıl Bayrak', unit: 'yağmacı', targets: EG_ILLAGERS, need: 10, brief: 'Kızıl bayrak taşıyan çeteler köyleri yakıyor. Önce öncü kolu ez.' },
    { tier: 3, title: 'Yıkım Getirenler', unit: 'ravager', targets: ['minecraft:ravager'], need: 3, brief: 'Çete lideri yıkım canavarlarını serbest bıraktı. Sürüyü durdur.' },
    { tier: 3, title: 'Kızıl Efendi', unit: 'büyücü', targets: ['minecraft:evoker', 'minecraft:illusioner', 'irons_spellbooks:cultist'], need: 4, brief: 'Bayrağın ardında büyü oynayanlar var. Onları sustur.' } ] },
  { id: 'derin', title: 'Derinin Çağrısı', minRank: 3, steps: [
    { tier: 2, title: 'Kıpırdayan Karanlık', unit: 'karanlık yaratık', targets: EG_DEEPER, need: 10, brief: 'Karanlık derinde nefes alıyor. Yüzeye çıkanları öldür.' },
    { tier: 3, title: 'İz Sürenler', unit: 'derin yaratık', targets: EG_DEEPER_ELITE, need: 4, brief: 'Bu yaratıklar kokunu almak için yaşıyor. Sessizce ve hızlı ol.' },
    { tier: 4, title: 'Sessizliğin Kralı', unit: 'gözcü', targets: ['deeperdarker:stalker', 'deeperdarker:shattered'], need: 2, brief: 'Karanlığın yönetenleri açığa çıktı. Onları yenmeden dönme.' } ] },
  { id: 'alev', title: 'Alevlerin Bedeli', minRank: 3, steps: [
    { tier: 2, title: 'Kor Devriyesi', unit: 'Nether askeri', targets: EG_NETHER_SOLDIERS, need: 14, brief: 'Nether askerleri kapıdan sızıyor. Önce sızanları yak.' },
    { tier: 3, title: 'Kale Nöbetçileri', unit: 'kale nöbetçisi', targets: EG_NETHER_FORTRESS, need: 14, brief: 'Kaleye giden yol nöbetçilerle dolu. Yolu aç.' },
    { tier: 4, title: 'Ateşin Sahibi', unit: 'kâbus', targets: ['cataclysm:ignis', 'cataclysm:netherite_monstrosity'], need: 1, brief: 'Kalenin sahibi sana bir kapı açtı. İçeri gir, dönerken kapıyı kapat.' } ] },
  { id: 'kadim', title: 'Kadim Uyanış', minRank: 4, steps: [
    { tier: 3, title: 'Uyanan Efsaneler', unit: 'kadim yaratık', targets: EG_IAF_LESSER, need: 6, brief: 'Kadim yaratıklar uyandı. Bu bir tesadüf değil.' },
    { tier: 3, title: 'Yıkıntı Bekçileri', unit: 'yıkıntı bekçisi', targets: EG_CATA_MINOR, need: 10, brief: 'Sebebi yıkıntılar. Bekçileri temizle, ardını göreceğiz.' },
    { tier: 5, title: 'Kıyamet Ejderi', unit: 'ejderha', targets: EG_DRAGONS, need: 1, brief: 'Hepsinin başında bir ejderha var. Gökyüzünü geri al.' } ] }
]
const ERWIN_CHAIN_BY_ID = {}
ERWIN_CHAINS.forEach(c => { ERWIN_CHAIN_BY_ID[c.id] = c })

// Ölüm Emri: isimli elit hedef adları
const ERWIN_NAMED = ['Kanlı Orakçı', 'Solgun Efendi', 'Kül Hükümdarı', 'Çürük Dişli', 'Gölge Kesen', 'Ağıt Taşıyan', 'Zincirbozan', 'Kırık Taçlı']

// Unvanlar: [anahtar, ad, koşul(pd)]
const ERWIN_TITLES = [
  ['kirk_golge', 'Kırk Gölge', pd => Number(pd.getInt('erwin_total')) >= 40],
  ['sonsuz_nobet', 'Sonsuz Nöbetçi', pd => Number(pd.getInt('erwin_total')) >= 100],
  ['kan_ustasi', 'Kan Sözü Ustası', pd => Number(pd.getInt('erwin_done_4')) >= 5],
  ['ejderha_katili', 'Ejderha Katili', pd => Number(pd.getInt('erwin_done_5')) >= 1],
  ['kader_kirici', 'Kader Kırıcı', pd => Number(pd.getInt('erwin_chains_done')) >= 3],
  ['ay_avcisi', 'Ay Avcısı', pd => Number(pd.getInt('erwin_cursed_done')) >= 5],
  ['emir_avcisi', 'Ölüm Emri Avcısı', pd => Number(pd.getInt('erwin_named_kills')) >= 5],
  ['bahisci', 'Kan Bahisçisi', pd => Number(pd.getInt('erwin_bets_won')) >= 5]
]

// ------------------------------------------------------------------ Yardımcılar
function erwinRand(a, b) { return a + Math.floor(Math.random() * (b - a + 1)) }
function erwinPickOne(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function erwinHas(p, tag) {
  var found = false
  p.getTags().forEach(t => { if (String(t) === tag) found = true })
  return found
}

function erwinJsonEsc(s) {
  return String(s).split('\\').join('\\\\').split('"').join('\\"')
}

// Erwin konuşuyor: "Erwin Smith: ..." (yeşil ad, italik metin). **kalın** işaretlerini kalın yapar.
function erwinSayChat(server, name, text) {
  var parts = String(text).split('**')
  var comps = ['{"text":"Erwin Smith","color":"dark_green","bold":true}', '{"text":": ","color":"gray","bold":false}']
  for (var i = 0; i < parts.length; i++) {
    if (parts[i] === '') continue
    comps.push('{"text":"' + erwinJsonEsc(parts[i]) + '","color":"white","italic":true' + ',"bold":false' + '}')
  }
  server.runCommandSilent('tellraw ' + name + ' [' + comps.join(',') + ']')
}

// Erwin'in cevapları sohbet yerine diyalog penceresinde açılır: 'erwin_yanit' diyaloğunun metni yazılır, sonra oyuncuya açılır (easy_npc dialog open).
// Aynı tikte birden çok söz gelirse birleşir. Diyalog yazılamazsa (NPC yüklü değil, diyalog kurulmamış) sohbete düşer.
// Sohbette kalması gerekenler (tıklanabilir teklif listesi) erwinSayChat kullanır.
const ERWIN_NPC_UUID = '504788d8-3dc0-407e-aebf-ca04dc17cfcb'
var erwinPending = {}

// Not: Minecraft'ın tırnaklı SNBT dizgesinde '\n' kaçışı YOKTUR (yalnızca \\ ve \"); satır sonu gerçek satır sonu karakteri olarak girer.
function erwinSnbtEsc(s) {
  return String(s).split('\\').join('\\\\').split('"').join('\\"')
}

// Diyalog verisini yazar. 'data modify' değer zaten aynıysa başarısız (0) döner; bu yüzden önce farklı bir yer tutucu yazılır, sonra gerçek değer.
function erwinDlgSet(server, dlg, path, value) {
  var base = 'data modify entity ' + ERWIN_NPC_UUID + ' DialogData.DialogDataSet[{Name:"' + dlg + '"}].' + path + ' set value '
  var ok = 0
  try {
    server.runCommandSilent(base + '"."')
    ok = server.runCommandSilent(base + '"' + erwinSnbtEsc(value) + '"')
    // satır sonu kabul edilmezse satırlar boşlukla birleştirilerek yeniden denenir
    if (!(ok > 0) && String(value).indexOf('\n') >= 0) ok = server.runCommandSilent(base + '"' + erwinSnbtEsc(String(value).split('\n').join(' ')) + '"')
  } catch (e) {
    console.error('erwin diyalog yazma hata: ' + e)
    ok = 0
  }
  if (!(ok > 0)) console.error('erwin diyalog yazilamadi: ' + dlg + ' ' + path + ' (erwin_setup calistirildi mi, NPC yuklu mu?)')
  return ok > 0
}

function erwinDlgOpen(server, name, dlg) {
  server.runCommandSilent('easy_npc dialog open ' + ERWIN_NPC_UUID + ' ' + name + ' ' + dlg)
}

function erwinSay(server, name, text) {
  npcDlgSay(server, ERWIN_NPC_UUID, 'erwin_yanit', name, text, false, t => erwinSayChat(server, name, t))
}

// Liste/kayıt gösterimi: her çağrı yeni satır (erwinNote ile aynı imza; renk diyalogda kullanılmaz).
function erwinSayLine(server, name, text, color) {
  npcDlgSay(server, ERWIN_NPC_UUID, 'erwin_yanit', name, text, true, t => erwinNote(server, name, t, color))
}

function erwinNote(server, name, text, color) {
  server.runCommandSilent('tellraw ' + name + ' {"text":"' + erwinJsonEsc(text) + '","color":"' + (color || 'gray') + '"}')
}

function erwinBar(server, name, text, color) {
  server.runCommandSilent('title ' + name + ' actionbar {"text":"' + erwinJsonEsc(text) + '","color":"' + (color || 'green') + '"}')
}

function erwinRank(p) {
  var r = Number(p.persistentData.getInt('erwin_rank'))
  if (isNaN(r) || r < 0) r = 0
  if (r > 4) r = 4
  return r
}

function erwinSetRankTag(server, name, r) {
  for (var i = 1; i <= 4; i++) server.runCommandSilent('tag ' + name + ' remove erwin_rank_' + i)
  if (r >= 1) server.runCommandSilent('tag ' + name + ' add erwin_rank_' + r)
}

function erwinStars(tier) {
  var s = ''
  for (var i = 0; i < tier; i++) s += '★'
  return s
}

function erwinDay() { return Math.floor(Date.now() / 86400000) }

function erwinDoneToday(p) {
  var pd = p.persistentData
  return Number(pd.getInt('erwin_day')) === erwinDay() ? Number(pd.getInt('erwin_day_count')) : 0
}

function erwinFmtMs(ms) {
  var s = Math.ceil(ms / 1000)
  var m = Math.floor(s / 60)
  return m + ' dk ' + (s % 60) + ' sn'
}

function erwinContractActive(p) { return String(p.persistentData.getString('erwin_c_key')) !== '' }

function erwinContractText(p) {
  var pd = p.persistentData
  return String(pd.getString('erwin_c_title')) + ' (' + Number(pd.getInt('erwin_c_have')) + '/' + Number(pd.getInt('erwin_c_need')) + ' ' + String(pd.getString('erwin_c_unit')) + ')'
}


// ------------------------------------------------------------------ Sefer başlatma / kayıt
// Bir sefer aktif olurken oyuncu verisine yazılan alanlar: erwin_c_*.
// c_pct: ödül yüzdesi (100 normal, Kanlı Ay 200, Kan Bahsi x1.5), c_bet, c_cursed, c_named (Ölüm Emri var mı),
// c_chain (zincir kimliği ya da ''), c_step (zincirde 0 tabanlı bölüm)
function erwinBegin(pd, c) {
  pd.putString('erwin_c_key', c.key)
  pd.putString('erwin_c_title', c.title)
  pd.putString('erwin_c_unit', c.unit)
  pd.putString('erwin_c_targets', c.targets.join(','))
  pd.putInt('erwin_c_tier', c.tier)
  pd.putInt('erwin_c_need', c.need)
  pd.putInt('erwin_c_have', 0)
  pd.putInt('erwin_c_pct', c.pct)
  pd.putInt('erwin_c_bet', c.bet ? 1 : 0)
  pd.putInt('erwin_c_cursed', c.cursed ? 1 : 0)
  pd.putInt('erwin_c_named', c.named ? 1 : 0)
  pd.putString('erwin_c_chain', c.chain || '')
  pd.putInt('erwin_c_step', c.step || 0)
  pd.putInt('erwin_named_open', 0)
}

function erwinClearContract(p) {
  var pd = p.persistentData
  pd.putString('erwin_c_key', '')
  pd.putString('erwin_c_title', '')
  pd.putString('erwin_c_unit', '')
  pd.putString('erwin_c_targets', '')
  pd.putString('erwin_c_chain', '')
  var ints = ['erwin_c_tier', 'erwin_c_need', 'erwin_c_have', 'erwin_c_pct', 'erwin_c_bet', 'erwin_c_cursed', 'erwin_c_named', 'erwin_c_step']
  ints.forEach(k => pd.putInt(k, 0))
}

function erwinOwnedTitles(pd) {
  return String(pd.getString('erwin_titles')).split(',').filter(x => x !== '')
}

// Yeni kazanılan unvanları verir ve duyurur
function erwinCheckTitles(server, p, name) {
  var pd = p.persistentData
  var owned = erwinOwnedTitles(pd)
  ERWIN_TITLES.forEach(t => {
    if (owned.indexOf(t[0]) >= 0) return
    if (!t[2](pd)) return
    owned.push(t[0])
    pd.putString('erwin_titles', owned.join(','))
    cinePlay(server, name, [{ t: 0, title: ['YENİ UNVAN', t[1], 'light_purple'] }, { t: 0, sound: ['minecraft:ui.toast.challenge_complete', 1, 0.8] }, { t: 2, say: ['Erwin', 'Adın artık **' + t[1] + '** diye anılacak. Bunu hak ettin.'] }])
  })
}

function erwinLogAdd(pd, title, blocks) {
  var d = new Date().toISOString().slice(0, 10)
  var list = String(pd.getString('erwin_log')).split(';').filter(x => x !== '')
  list.push(d + '|' + title + '|' + blocks)
  while (list.length > 10) list.shift()
  pd.putString('erwin_log', list.join(';'))
}

// ------------------------------------------------------------------ Teklifler
// Teklif: 3 sefer. Biri en düşük, biri en yüksek açık türden; üçüncüsü rastgele türden. Son 4 sefer tekrar edilmez.
// %30 ihtimalle üçüncü teklif bir Kader Zinciri olur (rütbe yetiyorsa ve tamamlanmamışsa).
// Teklif kaydı: "T:<şablon>:<hedef sayısı>:<kanlı ay 0/1>" veya "C:<zincir>:0:0"
function erwinBuildOffers(p) {
  var pd = p.persistentData
  var r = erwinRank(p)
  var tiers = ERWIN_RANK_TIERS[r]
  var recent = String(pd.getString('erwin_recent')).split(',')
  var chosen = []
  var order = [tiers[0], tiers[tiers.length - 1], erwinPickOne(tiers)]
  for (var i = 0; i < 3; i++) {
    var pool = []
    ERWIN_TEMPLATES.forEach(t => {
      if (t.tier !== order[i]) return
      if (chosen.indexOf(t.key) >= 0) return
      if (recent.indexOf(t.key) >= 0) return
      for (var w = 0; w < t.w; w++) pool.push(t)
    })
    if (pool.length === 0) {
      // son çare: aynı türden tekrar edilebilir, ama teklif içinde farklı olsun
      ERWIN_TEMPLATES.forEach(t => {
        if (t.tier === order[i] && chosen.indexOf(t.key) < 0) pool.push(t)
      })
    }
    if (pool.length === 0) continue
    chosen.push(erwinPickOne(pool).key)
  }
  var offers = chosen.map(k => {
    var t = ERWIN_BY_KEY[k]
    var need = erwinRand(t.min, t.max)
    var cursed = 0
    if (t.tier <= 3 && need >= 4 && Math.random() < 0.2) {
      need = Math.round(need * 1.5)
      cursed = 1
    }
    return 'T:' + k + ':' + need + ':' + cursed
  })
  // zincir: 3. teklifin yerine geçer
  if (offers.length === 3 && Math.random() < 0.3) {
    var done = String(pd.getString('erwin_chain_ids')).split(',')
    var avail = ERWIN_CHAINS.filter(c => c.minRank <= r && done.indexOf(c.id) < 0)
    if (avail.length > 0) offers[2] = 'C:' + erwinPickOne(avail).id + ':0:0'
  }
  return offers
}

function erwinOfferData(raw) {
  var parts = raw.split(':')
  var head, info, tier, extra = ''
  if (parts[0] === 'C') {
    var ch = ERWIN_CHAIN_BY_ID[parts[1]]
    tier = ch.steps[ch.steps.length - 1].tier
    head = '⛓ ' + ch.title
    info = ' — ' + ch.steps.length + ' bölümlük Kader Zinciri  '
    extra = '  son bölümde ekstra ödül'
  } else {
    var t = ERWIN_BY_KEY[parts[1]]
    tier = t.tier
    head = t.title
    info = ' — ' + parts[2] + ' ' + t.unit + '  '
    if (parts[3] === '1') extra = '  ☾ Kanlı Ay: ödül x2'
  }
  var rw = ERWIN_REWARDS[tier].em
  return { chain: parts[0] === 'C', head: head, info: info, tier: tier, extra: extra, rw: rw }
}

function erwinOfferLine(server, name, idx, raw) {
  var d = erwinOfferData(raw)
  var labels = ['A', 'B', 'C']
  var head = d.head, info = d.info, tier = d.tier, extra = d.extra, rw = d.rw
  var parts = [d.chain ? 'C' : '']
  var comps = [
    '{"text":" [' + labels[idx] + '] ","color":"gold","bold":true,"clickEvent":{"action":"run_command","value":"/trigger erwin_pick set ' + (idx + 1) + '"},"hoverEvent":{"action":"show_text","contents":"Bu seferi seç"}}',
    '{"text":"[☠] ","color":"dark_red","bold":true,"clickEvent":{"action":"run_command","value":"/trigger erwin_pick set ' + (idx + 11) + '"},"hoverEvent":{"action":"show_text","contents":"Kan Bahsi: ödül x1.5, ama ölürsen sefer iptal olur"}}',
    '{"text":"' + erwinJsonEsc(head) + '","color":"' + (parts[0] === 'C' ? 'light_purple' : 'white') + '","bold":true}',
    '{"text":"' + erwinJsonEsc(info) + '","color":"gray"}',
    '{"text":"' + erwinStars(tier) + '","color":"red"}',
    '{"text":"  ödül ≈ ' + rw[0] + '-' + rw[1] + ' zümrüt","color":"green"}'
  ]
  if (extra !== '') comps.push('{"text":"' + erwinJsonEsc(extra) + '","color":"dark_purple"}')
  server.runCommandSilent('tellraw ' + name + ' [' + comps.join(',') + ']')
}

// Teklifleri diyalog penceresinde gösterir: 'erwin_teklif_<n>' (seç, n = teklif sayısı 1-3) ve 'erwin_bahis_<n>' (Kan Bahsi ile seç).
// Düğmeler 'erwin_pick' skorunu ayarlar (A/B/C = 1-3, Kan Bahsi = 11-13), geri kalanını tick döngüsü halleder. Yazılamazsa false döner (sohbete düşülür).
function erwinOfferDialog(server, name, offers) {
  var n = offers.length
  var letters = ['A', 'B', 'C']
  var lines = [], names = [], bahisNames = []
  for (var i = 0; i < n; i++) {
    var d = erwinOfferData(offers[i])
    lines.push('[' + letters[i] + '] ' + d.head + d.info.replace(/\s+$/, '') + ' ' + erwinStars(d.tier) + ' ödül ≈ ' + d.rw[0] + '-' + d.rw[1] + ' zümrüt' + (d.extra !== '' ? ' (' + d.extra.trim() + ')' : ''))
    names.push(letters[i] + ': ' + d.head)
    bahisNames.push('☠ ' + letters[i] + ': ' + d.head)
  }
  var body = lines.join('\n')
  var dlg = 'erwin_teklif_' + n
  var bdlg = 'erwin_bahis_' + n
  var ok = erwinDlgSet(server, dlg, 'Texts[0].Text', erwinPickOne(ERWIN_OFFER_HEAD) + '\n\n' + body + '\n\nTeklifler 10 dakika geçerli.')
  ok = ok && erwinDlgSet(server, bdlg, 'Texts[0].Text', 'Kan Bahsi: ödül x1.5, ama ölürsen sefer iptal olur. Hangisine bahis oynuyorsun?\n\n' + body)
  for (var j = 0; ok && j < n; j++) {
    ok = erwinDlgSet(server, dlg, 'Buttons[' + j + '].Name', names[j]) && erwinDlgSet(server, bdlg, 'Buttons[' + j + '].Name', bahisNames[j])
  }
  if (!ok) return false
  erwinDlgOpen(server, name, dlg)
  return true
}

function erwinOffer(server, p, name) {
  var pd = p.persistentData
  var offers = erwinBuildOffers(p)
  if (offers.length === 0) {
    erwinSay(server, name, 'Şu an sana verecek uygun bir seferim yok. Biraz sonra tekrar gel.')
    return
  }
  var shown = erwinOfferDialog(server, name, offers)
  if (!shown) {
    erwinSayChat(server, name, erwinPickOne(ERWIN_OFFER_HEAD))
    for (var i = 0; i < offers.length; i++) erwinOfferLine(server, name, i, offers[i])
    erwinNote(server, name, 'Seçmek için [A] [B] [C]\'ye tıkla. [☠] = Kan Bahsi (ödül x1.5, ölürsen iptal). Teklifler 10 dakika geçerli.', 'white')
  }
  pd.putString('erwin_o_1', offers[0] || '')
  pd.putString('erwin_o_2', offers[1] || '')
  pd.putString('erwin_o_3', offers[2] || '')
  pd.putLong('erwin_o_time', Date.now() + ERWIN_OFFER_TTL_MS)
  server.runCommandSilent('scoreboard players set ' + name + ' erwin_pick 0')
  server.runCommandSilent('scoreboard players enable ' + name + ' erwin_pick')
}

function erwinOffersActive(p) {
  var pd = p.persistentData
  return Number(pd.getLong('erwin_o_time')) > Date.now() && String(pd.getString('erwin_o_1')) !== ''
}

function erwinStartChainStep(server, p, name, chain, step, pct, bet) {
  var s = chain.steps[step]
  erwinBegin(p.persistentData, { key: 'chain:' + chain.id, title: chain.title + ' — ' + s.title, unit: s.unit, targets: s.targets, tier: s.tier, need: s.need, pct: pct, bet: bet, cursed: false, named: false, chain: chain.id, step: step })
  cinePlay(server, name, [{ t: 0.3, title: ['BÖLÜM ' + (step + 1) + '/' + chain.steps.length, s.title, 'light_purple'] }, { t: 0, sound: ['minecraft:block.bell.use', 0.8, 0.7] }])
  erwinSay(server, name, '**' + chain.title + '**, bölüm ' + (step + 1) + '/' + chain.steps.length + ': ' + s.title + '. ' + s.brief)
  erwinNote(server, name, 'Görev: ' + s.need + ' ' + s.unit + ' öldür.', 'yellow')
}

function erwinAccept(server, p, name, idx, bet) {
  var pd = p.persistentData
  if (!erwinOffersActive(p)) {
    erwinSay(server, name, 'Bu teklifler artık geçerli değil. Yeni bir sefer iste.')
    return
  }
  if (erwinContractActive(p)) {
    erwinSay(server, name, 'Zaten bir seferin var. Önce onu bitir ya da bırak.')
    return
  }
  var raw = String(pd.getString('erwin_o_' + idx))
  if (raw === '') return
  var parts = raw.split(':')
  pd.putLong('erwin_o_time', 0)
  pd.putString('erwin_o_1', '')
  pd.putString('erwin_o_2', '')
  pd.putString('erwin_o_3', '')
  server.runCommandSilent('scoreboard players set ' + name + ' erwin_pick 0')
  if (parts[0] === 'C') {
    var chain = ERWIN_CHAIN_BY_ID[parts[1]]
    if (!chain) return
    erwinStartChainStep(server, p, name, chain, 0, bet ? 150 : 100, bet)
  } else {
    var t = ERWIN_BY_KEY[parts[1]]
    var need = Number(parts[2])
    if (!t || isNaN(need)) return
    var cursed = parts[3] === '1'
    var pct = cursed ? 200 : 100
    if (bet) pct = Math.floor(pct * 3 / 2)
    var named = t.tier <= 3 && need >= 2 && Math.random() < 0.2
    erwinBegin(pd, { key: t.key, title: t.title, unit: t.unit, targets: t.targets, tier: t.tier, need: need, pct: pct, bet: bet, cursed: cursed, named: named, chain: '', step: 0 })
    erwinSay(server, name, '**' + t.title + '** (' + ERWIN_TIER_NAMES[t.tier] + ', ' + erwinStars(t.tier) + '). ' + t.brief)
    if (cursed) erwinNote(server, name, '☾ Kanlı Ay yükseldi: hedef sayısı arttı, ödül iki katı.', 'dark_purple')
    cinePlay(server, name, erwinAcceptSteps(t.tier, t.title))
    erwinNote(server, name, 'Görev: ' + need + ' ' + t.unit + ' öldür. Bitince Erwin\'e dön ve raporunu ver.', 'yellow')
    if (named) erwinSay(server, name, 'Bir şey daha: bu seferde adı fısıldanan bir **Ölüm Emri** olabilir. Görürsen kaçırma.')
  }
  if (bet) erwinNote(server, name, '☠ Kan Bahsi: ödül x1.5. Ölürsen sefer iptal olur.', 'dark_red')
  erwinSay(server, name, erwinPickOne(ERWIN_ACCEPT))
}

// ------------------------------------------------------------------ Rapor / ödül
// pct: ödül yüzdesi (blok sayısına uygulanır)
function erwinReward(server, p, name, tier, pct) {
  var table = ERWIN_REWARDS[tier]
  var scale = (pct || 100) / 100
  var em = Math.max(1, Math.floor(erwinRand(table.em[0], table.em[1]) * scale))
  var crit = Math.random() < ERWIN_CRIT_CHANCE
  if (crit) em = em * 2
  var summary = [em + ' zümrüt']
  server.runCommandSilent('give ' + name + ' minecraft:emerald ' + em)
  var total = em
  if (Math.random() < Math.min(1, table.blockP * scale)) {
    var bl = erwinRand(table.blockN[0], table.blockN[1])
    server.runCommandSilent('give ' + name + ' minecraft:emerald_block ' + bl)
    summary.push(bl + ' zümrüt bloğu')
    total += bl * 9
  }
  var bonusScale = Math.min(1, scale)
  table.bonus.forEach(b => {
    if (Math.random() >= b.p * bonusScale) return
    if (!Item.exists(b.id)) return
    var n = erwinRand(b.n[0], b.n[1])
    server.runCommandSilent('give ' + name + ' ' + b.id + ' ' + n)
    summary.push(n + ' ' + b.label)
  })
  return { crit: crit, summary: summary, blocks: total }
}

function erwinPromote(server, p, name) {
  var pd = p.persistentData
  var r = erwinRank(p)
  if (r < 4 && Number(pd.getInt('erwin_done_' + ERWIN_PROMO_TIER[r])) >= ERWIN_PROMO_COUNT[r]) {
    r = r + 1
    pd.putInt('erwin_rank', r)
    erwinSetRankTag(server, name, r)
    var promo = CINE_FX.zafer.slice()
    promo.push({ t: 0.3, title: ['TERFİ', ERWIN_RANK_NAMES[r], 'gold'] })
    promo.push({ t: 0, sound: ['minecraft:ui.toast.challenge_complete', 1, 1] })
    promo.push({ t: 3, say: ['Erwin', ERWIN_PROMO_TEXT[r - 1]] })
    promo.push({ t: 7, say: ['Erwin', ERWIN_PROMO_STORY[r][0]] })
    promo.push({ t: 11, say: ['Erwin', ERWIN_PROMO_STORY[r][1]] })
    if (ERWIN_TEACHER_HINT[r]) promo.push({ t: 14, note: [ERWIN_TEACHER_HINT[r], 'dark_purple'] })
    cinePlay(server, name, promo)
  }
}

function erwinReport(server, p, name) {
  var pd = p.persistentData
  if (!erwinContractActive(p)) {
    erwinSay(server, name, 'Raporlayacak bir seferin yok. Yeni bir sefer istemek istersen söyle.')
    return
  }
  var need = Number(pd.getInt('erwin_c_need'))
  var have = Number(pd.getInt('erwin_c_have'))
  if (have < need) {
    erwinSay(server, name, 'Henüz bitmedi. Şimdiye kadar ' + have + '/' + need + ' ' + String(pd.getString('erwin_c_unit')) + '. İşini bitir, sonra gel.')
    return
  }
  var tier = Number(pd.getInt('erwin_c_tier'))
  var key = String(pd.getString('erwin_c_key'))
  var title = String(pd.getString('erwin_c_title'))
  var pct = Number(pd.getInt('erwin_c_pct')) || 100
  var bet = Number(pd.getInt('erwin_c_bet')) === 1
  var cursed = Number(pd.getInt('erwin_c_cursed')) === 1
  var chainId = String(pd.getString('erwin_c_chain'))
  var step = Number(pd.getInt('erwin_c_step'))
  var chain = chainId !== '' ? ERWIN_CHAIN_BY_ID[chainId] : null
  var lastStep = !chain || step >= chain.steps.length - 1

  var res = erwinReward(server, p, name, tier, pct)
  var summary = res.summary
  var blocks = res.blocks
  if (chain && lastStep) {
    // zincirin son bölümü: ikinci bir ödül atılır (yarı blok ödülü; ganimet şansları tam)
    var res2 = erwinReward(server, p, name, tier, Math.floor(pct / 2))
    summary = summary.concat(res2.summary)
    blocks += res2.blocks
  }

  // kayıtlar
  pd.putInt('erwin_done_' + tier, Number(pd.getInt('erwin_done_' + tier)) + 1)
  pd.putInt('erwin_total', Number(pd.getInt('erwin_total')) + 1)
  var today = erwinDay()
  if (Number(pd.getInt('erwin_day')) !== today) {
    pd.putInt('erwin_day', today)
    pd.putInt('erwin_day_count', 0)
  }
  pd.putInt('erwin_day_count', Number(pd.getInt('erwin_day_count')) + 1)
  if (cursed) pd.putInt('erwin_cursed_done', Number(pd.getInt('erwin_cursed_done')) + 1)
  if (bet) pd.putInt('erwin_bets_won', Number(pd.getInt('erwin_bets_won')) + 1)
  erwinLogAdd(pd, title, blocks)

  // mesajlar
  erwinSay(server, name, erwinPickOne(ERWIN_PRAISE[tier] || ERWIN_PRAISE[1]))
  if (res.crit) erwinNote(server, name, '★ BÜYÜK ZAFER! Ödülün ikiye katlandı.', 'gold')
  if (bet) erwinNote(server, name, '☠ Kan Bahsini kazandın: ödül x1.5.', 'dark_red')
  erwinNote(server, name, 'Ödülün: ' + summary.join(', ') + '.', 'green')
  var winSteps = CINE_FX.zafer.slice()
  winSteps.push({ t: 0.3, title: [chain && lastStep ? 'KADER ZİNCİRİ TAMAM' : 'SEFER TAMAM', '+' + blocks + ' zümrüt', chain && lastStep ? 'light_purple' : ERWIN_TIER_COLOR[tier]] })
  cinePlay(server, name, winSteps)

  if (chain && !lastStep) {
    // zincir sürüyor: sonraki bölüm hemen başlar (bekleme yok)
    erwinPromote(server, p, name)
    erwinStartChainStep(server, p, name, chain, step + 1, pct, bet)
    erwinCheckTitles(server, p, name)
    return
  }
  if (chain) {
    var ids = String(pd.getString('erwin_chain_ids')).split(',').filter(x => x !== '')
    ids.push(chain.id)
    pd.putString('erwin_chain_ids', ids.join(','))
    pd.putInt('erwin_chains_done', Number(pd.getInt('erwin_chains_done')) + 1)
    erwinNote(server, name, '⛓ Kader Zinciri tamamlandı: ' + chain.title, 'light_purple')
  } else {
    var recent = String(pd.getString('erwin_recent')).split(',').filter(x => x !== '')
    recent.push(key)
    while (recent.length > 4) recent.shift()
    pd.putString('erwin_recent', recent.join(','))
  }
  pd.putLong('erwin_next', Date.now() + ERWIN_COOLDOWN_MS)
  erwinClearContract(p)
  erwinPromote(server, p, name)
  erwinCheckTitles(server, p, name)
}

function erwinInfo(server, p, name) {
  if (erwinContractActive(p)) {
    var pd = p.persistentData
    erwinSayLine(server, name, 'Sefer: ' + erwinContractText(p), 'yellow')
    erwinSayLine(server, name, ERWIN_TIER_NAMES[Number(pd.getInt('erwin_c_tier'))] + ' ' + erwinStars(Number(pd.getInt('erwin_c_tier'))), 'red')
    if (Number(pd.getInt('erwin_c_bet')) === 1) erwinSayLine(server, name, '☠ Kan Bahsi aktif: ölürsen sefer iptal olur.', 'dark_red')
    if (Number(pd.getInt('erwin_c_cursed')) === 1) erwinSayLine(server, name, '☾ Kanlı Ay: ödül iki katı.', 'dark_purple')
    if (String(pd.getString('erwin_c_chain')) !== '') {
      var ch = ERWIN_CHAIN_BY_ID[String(pd.getString('erwin_c_chain'))]
      if (ch) erwinSayLine(server, name, '⛓ Kader Zinciri: bölüm ' + (Number(pd.getInt('erwin_c_step')) + 1) + '/' + ch.steps.length, 'light_purple')
    }
    if (Number(pd.getInt('erwin_named_open')) === 1) erwinSayLine(server, name, 'Ölüm Emri hedefi yakınlarda: ismini taşıyan parlayan yaratığı bul.', 'dark_red')
  } else if (erwinOffersActive(p)) {
    var liveOffers = [String(p.persistentData.getString('erwin_o_1')), String(p.persistentData.getString('erwin_o_2')), String(p.persistentData.getString('erwin_o_3'))].filter(x => x !== '')
    if (!erwinOfferDialog(server, name, liveOffers)) erwinSay(server, name, 'Tekliflerin hâlâ geçerli. "Sefer / rapor" ile listeyi yeniden açabilirsin.')
  } else {
    erwinSay(server, name, 'Şu an bir seferin yok. Sefer istemek için bana söyle.')
  }
}

function erwinStat(server, p, name) {
  var pd = p.persistentData
  var r = erwinRank(p)
  erwinSayLine(server, name, '— Keşif Birliği Kaydı —', 'dark_green')
  erwinSayLine(server, name, 'Rütben: ' + ERWIN_RANK_NAMES[r], 'gold')
  erwinSayLine(server, name, 'Toplam sefer: ' + Number(pd.getInt('erwin_total')) + '  (bugün: ' + erwinDoneToday(p) + '/' + ERWIN_DAILY_LIMIT + ')', 'white')
  erwinSayLine(server, name, 'Sis Devriyesi ' + Number(pd.getInt('erwin_done_1')) + ' · Av ' + Number(pd.getInt('erwin_done_2')) + ' · İniş ' + Number(pd.getInt('erwin_done_3')) + ' · Kan Sözü ' + Number(pd.getInt('erwin_done_4')) + ' · Kıyamet ' + Number(pd.getInt('erwin_done_5')), 'gray')
  erwinSayLine(server, name, 'Zincir ' + Number(pd.getInt('erwin_chains_done')) + '/' + ERWIN_CHAINS.length + ' · Kanlı Ay ' + Number(pd.getInt('erwin_cursed_done')) + ' · Ölüm Emri ' + Number(pd.getInt('erwin_named_kills')) + ' · Kazanılan bahis ' + Number(pd.getInt('erwin_bets_won')), 'gray')
  if (r < 4) {
    var need = ERWIN_PROMO_COUNT[r]
    var have = Number(pd.getInt('erwin_done_' + ERWIN_PROMO_TIER[r]))
    erwinSayLine(server, name, 'Sonraki terfi (' + ERWIN_RANK_NAMES[r + 1] + '): ' + ERWIN_TIER_NAMES[ERWIN_PROMO_TIER[r]] + ' türünden ' + Math.min(have, need) + '/' + need, 'yellow')
  } else {
    erwinSayLine(server, name, 'En yüksek rütbedesin. Kıyamet seferleri seni bekliyor.', 'yellow')
  }
  var owned = erwinOwnedTitles(pd)
  var names = []
  ERWIN_TITLES.forEach(t => { if (owned.indexOf(t[0]) >= 0) names.push(t[1]) })
  erwinSayLine(server, name, 'Unvanlar: ' + (names.length > 0 ? names.join(', ') : 'henüz yok'), 'dark_purple')
}

function erwinLog(server, p, name) {
  var list = String(p.persistentData.getString('erwin_log')).split(';').filter(x => x !== '')
  if (list.length === 0) {
    erwinSay(server, name, 'Defterimde henüz senin adına bir kayıt yok.')
    return
  }
  erwinSayLine(server, name, '— Sefer Defteri (son ' + list.length + ') —', 'dark_green')
  for (var i = list.length - 1; i >= 0; i--) {
    var f = list[i].split('|')
    erwinSayLine(server, name, f[0] + '  ' + f[1] + '  (+' + f[2] + ' zümrüt)', 'gray')
  }
}

function erwinAbort(server, p, name) {
  if (!erwinContractActive(p)) {
    erwinSay(server, name, 'Bırakacak bir seferin yok.')
    return
  }
  erwinClearContract(p)
  p.persistentData.putLong('erwin_next', Date.now() + ERWIN_ABORT_COOLDOWN_MS)
  erwinSay(server, name, 'Seferi bıraktın. Anlıyorum; her savaşçı her yükü taşıyamaz. Biraz dinlen, sonra yeniden gel.')
}

// ------------------------------------------------------------------ İstek işleme
function erwinRequest(server, p, name) {
  var pd = p.persistentData
  if (!erwinHas(p, 'rank_maceraci')) {
    erwinSay(server, name, 'Keşif Birliği herkesi kabul etmez. Önce Maceracı rütbeni almalısın.')
    return
  }
  if (erwinContractActive(p)) {
    if (Number(pd.getInt('erwin_c_have')) >= Number(pd.getInt('erwin_c_need'))) {
      erwinReport(server, p, name)
      return
    }
    erwinSay(server, name, 'Zaten bir seferin var: ' + erwinContractText(p) + '. Önce onu bitir ya da bırak.')
    return
  }
  if (erwinDoneToday(p) >= ERWIN_DAILY_LIMIT) {
    erwinSay(server, name, 'Bugün yeterince sefer yaptın. Bedenin ve zihnin dinlenmeli. Yarın seni yeniden çağırırım.')
    return
  }
  var left = Number(pd.getLong('erwin_next')) - Date.now()
  if (left > 0) {
    erwinSay(server, name, 'Biraz dinlen. ' + erwinFmtMs(left) + ' sonra yeni bir sefer hazır olur.')
    return
  }
  erwinOffer(server, p, name)
}

// Rütbe dükkânı Thorfinn'e taşındı (thorfinn_ticaret.js): satın alma zümrütle, stok az ve kişiye özel. Erwin yalnızca yönlendirir.
function erwinAmbar(server, name) {
  erwinSay(server, name, 'Birliğin ambarı artık Thorfinn\'de, Caddy\'nin çiftliğinde. Rütbeni o da tanır ama pazarlıkta kimseye kıyak yapmaz.')
}

var erwinPhase = 0
var erwinInitDone = false
const ERWIN_PICKS = [1, 2, 3, 11, 12, 13]
const ERWIN_TAGS = ['erwin_req', 'erwin_rep', 'erwin_info', 'erwin_stat', 'erwin_abort', 'erwin_log']

// Birlik rütbeleri FTB Ranks'te de vardır (world/serverconfig/ftbranks/ranks.snbt; güçleri Kutsanmış'ın üstünde, bu yüzden sohbette
// ve oyuncu listesinde Erwin rütben görünür). Oyuncu Erwin'le tanışınca 'yeminsiz' rank'i, terfide sıradaki rank verilir; eskisi alınır.
// Durum oyuncunun 'erwin_ftb' değerinde tutulur; yönetici sıfırlaması/rütbe ayarı da bu eşitlemeyle yansır.
const ERWIN_FTB_IDS = ['yeminsiz', 'kul_bekcisi', 'kan_yeminli', 'gece_avcisi', 'esik_muhafizi']

function erwinSyncFtbRank(server, p, name) {
  var want = erwinHas(p, 'erwin_met') ? ERWIN_FTB_IDS[erwinRank(p)] : ''
  var have = String(p.persistentData.getString('erwin_ftb'))
  if (want === have) return
  ERWIN_FTB_IDS.forEach(id => {
    if (id !== want) server.runCommandSilent('ftbranks remove ' + name + ' ' + id)
  })
  if (want !== '') server.runCommandSilent('ftbranks add ' + name + ' ' + want)
  p.persistentData.putString('erwin_ftb', want)
}

function erwinHandleTags(server, p, name, fast) {
  if (!fast) erwinSyncFtbRank(server, p, name)
  if (erwinHas(p, 'erwin_ambar')) {
    server.runCommandSilent('tag ' + name + ' remove erwin_ambar')
    erwinAmbar(server, name)
  }
  for (var i = 0; i < ERWIN_TAGS.length; i++) {
    var tg = ERWIN_TAGS[i]
    if (!erwinHas(p, tg)) continue
    server.runCommandSilent('tag ' + name + ' remove ' + tg)
    if (tg === 'erwin_req') erwinRequest(server, p, name)
    else if (tg === 'erwin_rep') erwinReport(server, p, name)
    else if (tg === 'erwin_info') erwinInfo(server, p, name)
    else if (tg === 'erwin_stat') erwinStat(server, p, name)
    else if (tg === 'erwin_abort') erwinAbort(server, p, name)
    else if (tg === 'erwin_log') erwinLog(server, p, name)
  }
  // teklif seçimi (trigger skoru)
  if (erwinOffersActive(p)) {
    for (var a = 0; a < ERWIN_PICKS.length; a++) {
      server.runCommandSilent('execute if score ' + name + ' erwin_pick matches ' + ERWIN_PICKS[a] + ' run tag ' + name + ' add erwin_pick_' + ERWIN_PICKS[a])
    }
    for (var b = 0; b < ERWIN_PICKS.length; b++) {
      var v = ERWIN_PICKS[b]
      if (erwinHas(p, 'erwin_pick_' + v)) {
        server.runCommandSilent('tag ' + name + ' remove erwin_pick_' + v)
        server.runCommandSilent('scoreboard players set ' + name + ' erwin_pick 0')
        erwinAccept(server, p, name, v > 10 ? v - 10 : v, v > 10)
        break
      }
    }
  } else if (Number(p.persistentData.getLong('erwin_o_time')) > 0 && Number(p.persistentData.getLong('erwin_o_time')) <= Date.now()) {
    p.persistentData.putLong('erwin_o_time', 0)
    p.persistentData.putString('erwin_o_1', '')
    p.persistentData.putString('erwin_o_2', '')
    p.persistentData.putString('erwin_o_3', '')
  }
}

ServerEvents.tick(event => {
  var server = event.server
  if (!erwinInitDone) {
    erwinInitDone = true
    // trigger hedefi: oyuncular sohbetteki [A] [B] [C] / [☠]'e tıklayarak '/trigger erwin_pick set N' çalıştırır
    server.runCommandSilent('scoreboard objectives add erwin_pick trigger')
  }
  erwinPhase++
  if (erwinPhase % 10 !== 0) {
    // diyalog düğmeleri yanıt versin diye etiket/seçim kontrolü her 2 tikte (0,1 sn) yapılır
    if (erwinPhase % 2 === 0) {
      server.players.forEach(p => {
        try { erwinHandleTags(server, p, String(p.username), true) } catch (e) { console.error('erwin etiket hata: ' + e) }
      })
    }
    return
  }
  server.players.forEach(p => {
    try {
      var name = String(p.username)
      erwinHandleTags(server, p, name)
      // atmosfer: Tür IV-V seferde uzaktan kalp atışı (her 32 sn)
      if (erwinPhase % 640 === 0 && erwinContractActive(p) && Number(p.persistentData.getInt('erwin_c_tier')) >= 4) {
        server.runCommandSilent('playsound minecraft:entity.warden.heartbeat master ' + name + ' ~ ~ ~ 0.5 1')
      }
      // ilerleme göstergesi (her 4 saniyede)
      if (erwinPhase % 80 === 0 && erwinContractActive(p)) {
        var have = Number(p.persistentData.getInt('erwin_c_have'))
        var need = Number(p.persistentData.getInt('erwin_c_need'))
        if (have >= need) erwinBar(server, name, 'Sefer tamam: ' + String(p.persistentData.getString('erwin_c_title')) + '. Erwin\'e rapor ver.', 'gold')
        else erwinBar(server, name, 'Sefer: ' + erwinContractText(p), 'green')
      }
    } catch (e) {
      console.error('erwin sefer hata: ' + e)
    }
  })
})

// ------------------------------------------------------------------ Öldürme sayacı ve Ölüm Emri
function erwinSpawnNamed(server, src, name, entity, tier) {
  var pd = src.persistentData
  var nm = erwinPickOne(ERWIN_NAMED)
  var hp = 40 + tier * 30
  var dim = 'minecraft:overworld'
  try { dim = String(entity.level.dimension) } catch (e) { }
  var nbt = '{CustomName:\'{"text":"' + nm + '","color":"dark_red"}\',CustomNameVisible:1b,Glowing:1b,Health:' + hp + 'f,' +
    'Attributes:[{Name:"minecraft:generic.max_health",Base:' + hp + 'd},{Name:"minecraft:generic.armor",Base:' + (6 + tier * 3) + 'd}],Tags:["erwin_named","en_' + name + '"]}'
  server.runCommandSilent('execute in ' + dim + ' run summon ' + String(entity.type) + ' ' + entity.x + ' ' + entity.y + ' ' + entity.z + ' ' + nbt)
  pd.putInt('erwin_named_open', 1)
  pd.putInt('erwin_c_named', 0)
  cinePlay(server, name, [{ t: 0.2, title: ['☠ ÖLÜM EMRİ', nm, 'dark_red'] }, { t: 0, sound: ['minecraft:block.bell.use', 1, 0.5] }, { t: 0.3, cmd: 'execute at {p} run particle minecraft:soul ~ ~1 ~ 1.5 0.8 1.5 0.03 40' }])
  erwinNote(server, name, '☠ Ölüm Emri: ' + nm + ' belirdi! Onu da öldürürsen ekstra ödül alırsın.', 'dark_red')
  server.runCommandSilent('playsound minecraft:entity.wither.spawn master ' + name + ' ~ ~ ~ 0.5 1.4')
}

EntityEvents.death(event => {
  try {
    var src = event.source.actual
    if (!src || !src.isPlayer()) return
    var pd = src.persistentData
    var name = String(src.username)
    var server = src.server

    // Ölüm Emri hedefi öldü mü?
    var isNamed = false
    event.entity.getTags().forEach(t => { if (String(t) === 'en_' + name) isNamed = true })
    if (isNamed && Number(pd.getInt('erwin_named_open')) === 1) {
      pd.putInt('erwin_named_open', 0)
      pd.putInt('erwin_named_kills', Number(pd.getInt('erwin_named_kills')) + 1)
      var tierN = Number(pd.getInt('erwin_c_tier')) || 1
      var resN = erwinReward(server, src, name, tierN, 50)
      erwinSay(server, name, 'Ölüm Emri yerine getirildi. Bu işin ücreti ayrı: ' + resN.summary.join(', ') + '.')
      erwinCheckTitles(server, src, name)
      return
    }

    if (String(pd.getString('erwin_c_key')) === '') return
    var need = Number(pd.getInt('erwin_c_need'))
    var have = Number(pd.getInt('erwin_c_have'))
    if (have >= need) return
    var id = String(event.entity.type)
    var targets = String(pd.getString('erwin_c_targets')).split(',')
    if (targets.indexOf(id) < 0) return
    have = have + 1
    pd.putInt('erwin_c_have', have)
    if (have >= need) {
      erwinBar(server, name, 'Sefer tamam: ' + String(pd.getString('erwin_c_title')) + '. Erwin\'e rapor ver.', 'gold')
      erwinNote(server, name, 'Sefer tamamlandı! Erwin Smith\'e dönüp raporunu ver.', 'gold')
      server.runCommandSilent('playsound minecraft:block.note_block.chime master ' + name + ' ~ ~ ~ 1 1.5')
      if (Number(pd.getInt('erwin_c_named')) === 1) erwinSpawnNamed(server, src, name, event.entity, Number(pd.getInt('erwin_c_tier')))
    } else {
      erwinBar(server, name, 'Sefer: ' + erwinContractText(src), 'green')
    }
  } catch (e) {
    console.error('erwin sayac hata: ' + e)
  }
})

// Kan Bahsi: ölen oyuncunun bahisli seferi iptal olur
PlayerEvents.respawned(event => {
  try {
    var p = event.player
    var pd = p.persistentData
    if (!erwinContractActive(p) || Number(pd.getInt('erwin_c_bet')) !== 1) return
    var name = String(p.username)
    erwinClearContract(p)
    pd.putLong('erwin_next', Date.now() + ERWIN_COOLDOWN_MS)
    erwinNote(event.server, name, '☠ Kan Bahsini kaybettin: sefer iptal oldu.', 'dark_red')
    erwinSay(event.server, name, 'Karanlık bahsini aldı. Ayağa kalk ve tekrar dene.')
  } catch (e) {
    console.error('erwin bahis hata: ' + e)
  }
})

// ------------------------------------------------------------------ Yönetici: /erwin_sifirla <oyuncu>
// Oyuncunun tüm Erwin ilerlemesini sıfırlar (test ve hata düzeltme için; op seviye 2).
ServerEvents.commandRegistry(event => {
  const { commands: Commands, arguments: Arguments } = event
  event.register(Commands.literal('erwin_sifirla').requires(s => s.hasPermission(2)).then(Commands.argument('oyuncu', Arguments.PLAYER.create(event)).executes(ctx => {
    var p = Arguments.PLAYER.getResult(ctx, 'oyuncu')
    var server = ctx.source.server
    var name = String(p.username)
    var pd = p.persistentData
    var keys = ['erwin_rank', 'erwin_total', 'erwin_day', 'erwin_day_count', 'erwin_c_tier', 'erwin_c_need', 'erwin_c_have', 'erwin_c_pct', 'erwin_c_bet', 'erwin_c_cursed', 'erwin_c_named', 'erwin_c_step', 'erwin_named_open', 'erwin_chains_done', 'erwin_cursed_done', 'erwin_named_kills', 'erwin_bets_won', 'erwin_done_1', 'erwin_done_2', 'erwin_done_3', 'erwin_done_4', 'erwin_done_5']
    keys.forEach(k => pd.putInt(k, 0))
    var skeys = ['erwin_recent', 'erwin_c_key', 'erwin_c_title', 'erwin_c_unit', 'erwin_c_targets', 'erwin_c_chain', 'erwin_o_1', 'erwin_o_2', 'erwin_o_3', 'erwin_titles', 'erwin_log', 'erwin_chain_ids']
    skeys.forEach(k => pd.putString(k, ''))
    pd.putLong('erwin_next', 0)
    pd.putLong('erwin_o_time', 0)
    erwinSetRankTag(server, name, 0)
    server.runCommandSilent('tag ' + name + ' remove erwin_met')
    server.runCommandSilent('scoreboard players set ' + name + ' erwin_pick 0')
    ctx.source.sendSuccess(Text.of(name + ' için Erwin ilerlemesi sıfırlandı.'), false)
    return 1
  })))
  // Test için: oyuncunun Birlik rütbesini doğrudan ayarlar (0-4). Ayrıca kişisel dükkân stoğunu sıfırlar.
  event.register(Commands.literal('erwin_rutbe').requires(s => s.hasPermission(2)).then(Commands.argument('oyuncu', Arguments.PLAYER.create(event)).then(Commands.argument('rutbe', Arguments.INTEGER.create(event)).executes(ctx => {
    var p = Arguments.PLAYER.getResult(ctx, 'oyuncu')
    var server = ctx.source.server
    var name = String(p.username)
    var n = Math.max(0, Math.min(4, Number(Arguments.INTEGER.getResult(ctx, 'rutbe'))))
    p.persistentData.putInt('erwin_rank', n)
    erwinSetRankTag(server, name, n)
    thorShopResetStock(p)
    ctx.source.sendSuccess(Text.of(name + ' için Erwin rütbesi ' + n + ' (' + ERWIN_RANK_NAMES[n] + ') yapıldı, Thorfinn stoğu yenilendi.'), false)
    return 1
  }))))
})
