// Büyü hocaları: Kakashi (Chidori), Itachi (Amaterasu, Tsukiyomi) ve Gojo (Mavi, Kırmızı, Mor).
//
// Yoruichi/Shunpo modelinin genelleştirilmiş hâli: oyuncu hocaya gider, seviye başına zümrüt bloğu öder, kısa bir öldürme
// sınavını geçer, hocaya rapor verir ve o seviyenin büyü parşömenini alır. Her seviye sırayla açılır.
// Erwin bağı: her hoca, oyuncunun Erwin'deki Keşif Birliği rütbesini (erwin_rank) şart koşar; büyü öğrenmek emek ister.
//   Chidori: Kül Bekçisi (L1-L2), Kan Yeminli (L3), Gece Avcısı (L4). Amaterasu: Gece Avcısı. Tsukiyomi: Eşik Muhafızı
//   ve Amaterasu'nun tamamı. Gojo: Mavi ve Kırmızı Gece Avcısı (son seviye Eşik Muhafızı), Mor Eşik Muhafızı ve Mavi + Kırmızı'nın tamamı.
// Gojo'nun büyüleri kendi kayıtlı büyüleridir (startup_scripts/gojo_spells.js; oyunda İngilizce adları Blue, Red, Purple).
// Etkilerini Iron's Gravity Fissure / Shockwave / Eldritch Blast'ten ödünç alırlar. 'alias' parşömende görünen ad.
//
// Etkileşim: hoca diyaloğundaki düğmeler bir etiket verir ve kapanır; bu script etiketi alır (Erwin ile aynı yöntem):
//   hoca_req_<büyü>, hoca_rep_<hoca>, hoca_info, hoca_lost_<büyü>. Durum oyuncunun kalıcı verisindedir (persistentData 'hoca_*').
// Sınavlar: hedef listesinden N yaratığı öldürmek; bazılarında 'win' saniyelik kayan pencere içinde (hız sınavı).
// Not: server_scripts dosyaları aynı scope'ta çalışıyor; Erwin'in EG_* hedef grupları ve erwinRank() çalışma anında kullanılır,
// bu yüzden hedefler fonksiyonla (tembel) tanımlanır. Bu dosya adı erwin_seferleri.js'den sonra yüklenir.

// Kayıp parşömen: en yüksek öğrenilen seviyenin ücretinin yarısı (ucuz olursa parşömen arkadaşlara çoğaltılır)
function hocaLostFee(spell, lvl, bond) {
  var f = spell.fees[lvl - 1] / 2
  if (bond >= 3) f = f / 2 // Usta Öğrenci: yarı yarıya
  else if (bond >= 2) f = f * 0.75 // Öğrenci: %25 indirim
  return Math.max(1, Math.floor(f))
}

const HOCA_SPELLS = {
  chidori: {
    npc: 'Kakashi', id: 'kubejs:chidori', name: 'Chidori', max: 4, requires: '',
    minRank: [1, 1, 2, 3], fees: [5, 9, 14, 18],
    quests: [
      { title: 'Zil Sınavı', unit: 'zil', need: 1, win: 0, scene: 'bell', targets: () => [],
        brief: 'Chidori hızdır, güç değil. Karşına çıkacak gölgem elindeki zili taşıyor; 90 saniye içinde ona vur. Yaklaştığını hissedince kaçar, o yüzden ani ve hızlı ol.' },
      { title: 'Şimşek Zinciri', unit: 'düşman', need: 10, win: 150,
        targets: () => EG_ZOMBIES.concat(EG_SKELETONS, EG_SPIDERS, EG_CREEPERS, EG_ENDERMEN, EG_ILLAGERS),
        brief: 'Yıldırım tek çarpar ama sıçrar. İki buçuk dakikada on düşman. Sıra kaçırma.' },
      { title: 'Bin Kuşun Sesi', unit: 'düşman', need: 8, win: 120,
        targets: () => EG_ILLAGERS.concat(EG_GRAVEYARD, EG_CHAOS, EG_NETHER_SOLDIERS),
        brief: 'Artık güçlü hedeflere vuracaksın. İki dakikada sekiz. Bu adımı geçen Chidori\'yi gerçekten tutabilir.' },
      { title: 'Kırılmayan Yıldırım', unit: 'yıkıntı bekçisi', need: 6, win: 180,
        targets: () => EG_CATA_MINOR.concat(EG_IAF_LESSER),
        brief: 'Son sınav. Yıkıntıların ve kadim yaratıkların içinden geç; üç dakikada altısı. Yıldırım geri dönmez.' }
    ],
    praise: [
      'Fena değil. İlk kıvılcım senin. Hâlâ yavaşsın ama gelişiyorsun.',
      'Şimşek atlamayı öğrendin. Sık kullanma, elin yorulur.',
      'Bu hız... Tam Chidori. Dikkat et, bin kuşun sesi dostları da uyandırır.',
      'Artık Chidori tamamen senin. Kılıç kadar keskin, yıldırım kadar hızlı. Bir daha sormayacağım: hazırsın.'
    ]
  },
  amaterasu: {
    npc: 'Itachi', id: 'kubejs:amaterasu', name: 'Amaterasu', max: 3, requires: '',
    minRank: [3, 3, 3], fees: [7, 12, 18],
    quests: [
      { title: 'Kara Alevin Doğuşu', unit: 'ateş askeri', need: 14, win: 0,
        targets: () => EG_NETHER_SOLDIERS.concat(EG_NETHER_FORTRESS),
        brief: 'Kara alev, yakılanı unutmaz. Nether\'in askerlerini yak; on dördü yeter.' },
      { title: 'Sönmeyen Ateş', unit: 'kale nöbetçisi', need: 14, win: 0,
        targets: () => EG_NETHER_FORTRESS.concat(['minecraft:ghast']),
        brief: 'Ateş kaleye ulaştığında sönmemeli. On dört nöbetçiyi devir; alev seni izlesin.' },
      { title: 'Yakılan Ruhlar', unit: 'kadim varlık', need: 8, win: 0,
        targets: () => EG_GRAVEYARD_ELITE.concat(EG_CATA_MINOR),
        brief: 'Yakılması gereken ruhlar var. Ölmüşleri huzura kavuştur; sekiz kadim varlık.' }
    ],
    praise: [
      'Alev seni tanıdı. Ama unutma: yakmak kolay, söndürmek imkânsızdır.',
      'Kara alev artık gölgen gibi. Onu büyütme; o seni büyütür.',
      'Amaterasu\'nun son adımını attın. Ateş artık senin. Kimseye zarar vermemeye çalış.'
    ]
  },
  tsukiyomi: {
    npc: 'Itachi', id: 'kubejs:tsukiyomi', name: 'Tsukiyomi', max: 3, requires: 'amaterasu',
    minRank: [4, 4, 4], fees: [9, 16, 25],
    quests: [
      { title: 'Sahte Gerçek', unit: 'gerçek gölge', need: 1, win: 0, scene: 'illusion', targets: () => [],
        brief: 'Tsukiyomi zihni kırar. Etrafında beş gölge belireceğim; yalnızca biri gerçek. Gerçek olan yerinden kıpırdamaz, sahtelerin yeri değişir. Yanlışa vurursan gözün kararır. İki dakikan var.' },
      { title: 'Aynaların Ardı', unit: 'büyücü', need: 8, win: 0,
        targets: () => EG_MAGE_CULTS.concat(['minecraft:evoker', 'minecraft:illusioner']),
        brief: 'Yanılsama ustalarıyla yüzleş. Sekiz büyücü; onlar da aynı oyunu oynar, sen kazan.' },
      { title: 'Sonsuz Gece', unit: 'gece hükümdarı', need: 1, win: 0,
        targets: () => EG_CATA_BOSS_A.concat(EG_MOWZIE_BOSS, EG_BOMD, ['irons_spellbooks:dead_king', 'irons_spellbooks:fire_boss']),
        brief: 'Son sınav gerçek ile yanılsamanın sınırında. Bir gece hükümdarını yen; o zaman sana hangi gerçeğin sana ait olduğunu göstereceğim.' }
    ],
    praise: [
      'İlk yanılsamayı gördün. Devam et.',
      'İkinci katmanı da geçtin. Gözlerin artık gerçeği ayırt eder.',
      'Tsukiyomi\'nin son adımı. Zaman ve mekân artık sana bağlı. Bunun bedelini unutma.'
    ]
  },
  ao: {
    npc: 'Gojo', id: 'kubejs:gojo_blue', name: 'Mavi', alias: 'Blue', max: 3, requires: '',
    minRank: [3, 3, 4], fees: [6, 10, 16],
    quests: [
      { title: 'Sonsuzluğun Kıyısı', unit: 'düşman', need: 16, win: 120,
        targets: () => EG_ZOMBIES.concat(EG_SKELETONS, EG_SPIDERS, EG_CREEPERS),
        brief: 'Mavi çeker. Etrafındakileri kendine çek; hepsi elinin altında olsun. İki dakikada on altı düşman.' },
      { title: 'Çekim Alanı', unit: 'düşman', need: 12, win: 150,
        targets: () => EG_ILLAGERS.concat(EG_CHAOS, EG_NETHER_SOLDIERS),
        brief: 'Kalabalık işine yarar, ama onları toplamayı bilmelisin. İki buçuk dakikada on iki düşman.' },
      { title: 'Kütle Çekimi', unit: 'güçlü varlık', need: 8, win: 150,
        targets: () => EG_CATA_MINOR.concat(EG_IAF_LESSER, EG_MUTANTS),
        brief: 'Ağır olan şeyler daha güçlü çekilir. Yıkıntıların ve mutantların içinden geç; iki buçuk dakikada sekiz.' }
    ],
    praise: [
      'Fena değil. Mavi seni tanıdı. Ben ilk denemede yapmıştım ama tamam, sen de fena değilsin.',
      'Çekim alanı büyüyor. Dikkat et, bazen çektiğin şey seni de çeker.',
      'Mavi tamam. Şimdi uzayı büküp bükmeyeceğin sana kalmış.'
    ]
  },
  aka: {
    npc: 'Gojo', id: 'kubejs:gojo_red', name: 'Kırmızı', alias: 'Red', max: 3, requires: '',
    minRank: [3, 3, 4], fees: [6, 10, 16],
    quests: [
      { title: 'Kırmızı Patlama', unit: 'düşman', need: 12, win: 0,
        targets: () => EG_ENDERMEN.concat(EG_CREEPERS, EG_NETHER_SOLDIERS),
        brief: 'Kırmızı iter. Çeken Mavi\'nin tam tersi: her şey senden uzaklaşır. On iki hedefi patlat.' },
      { title: 'Tersine Çevrilmiş', unit: 'düşman', need: 12, win: 150,
        targets: () => EG_GRAVEYARD.concat(EG_NETHER_FORTRESS),
        brief: 'Mezarlıkların ve kalelerin içinden it, it, it. İki buçuk dakikada on iki.' },
      { title: 'Kızıl Kıyamet', unit: 'seçkin düşman', need: 8, win: 150,
        targets: () => EG_MAGE_CULTS.concat(EG_KNIGHTS, EG_GRAVEYARD_ELITE),
        brief: 'Sertlerin sertleri. Büyücüler, şövalyeler ve ölü seçkinler; iki buçuk dakikada sekiz.' }
    ],
    praise: [
      'İşte bu. Küçük ama etkili. Mavi\'yle birlikte ilginç olur.',
      'Kırmızı büyüyor. Kimse o patlamanın ortasında durmak istemez.',
      'Kırmızı tamam. Şimdi Mavi ile birleşeceği günü düşün.'
    ]
  },
  murasaki: {
    npc: 'Gojo', id: 'kubejs:gojo_purple', name: 'Mor', alias: 'Purple', max: 3, requires: 'ao,aka',
    minRank: [4, 4, 4], fees: [12, 20, 32],
    quests: [
      { title: 'İki Bir Olur', unit: 'seçkin düşman', need: 10, win: 150,
        targets: () => EG_GRAVEYARD_ELITE.concat(EG_CATA_MINOR, EG_IAF_LESSER, EG_DEEPER_ELITE),
        brief: 'Mor, Mavi ile Kırmızı\'nın birleşimidir. Hem çek hem it. İki buçuk dakikada on seçkin düşman.' },
      { title: 'Yok Etme', unit: 'boss', need: 1, win: 0,
        targets: () => EG_CATA_BOSS_A.concat(EG_MOWZIE_BOSS),
        brief: 'Mor dokunduğunu siler. Bir boss\'a karşı dene; yenersen bir sonraki adıma hazırsın.' },
      { title: 'Boşluk', unit: 'kadim boss', need: 1, win: 0,
        targets: () => EG_CATA_BOSS_B.concat(EG_BOMD, EG_DRAGONS, ['irons_spellbooks:dead_king', 'irons_spellbooks:fire_boss']),
        brief: 'Son adım. Bir kadim boss\'u yen. Ardında bir şey kalmayacak.' }
    ],
    praise: [
      'Mavi ve Kırmızı birleşti. İşte bu. Bunu herkese gösterme.',
      'Mor artık senin. Ama unutma: bir şeyi silmek, onu geri getirmenin yolunu kapatmak demektir.',
      'Mor tamam. Şimdi bu gücü kime karşı kullanacağın... hehe, sana kalmış.'
    ]
  }
}
// Şimdilik devre dışı büyüler: hoca öğretmez, oyuncuyu savar (kod ve veriler yerinde; anahtarı silince tekrar açılır).
const HOCA_DEVRE_DISI = { ao: true, aka: true, murasaki: true }
const HOCA_SAVMA = {
  Gojo: [
    'Şimdi mi? Hayır. Ben de meşgulüm, sen de hazır değilsin. Git, sonra gel.',
    'Hehe, o kadar acelen ne? Mavi, Kırmızı, Mor... hepsi sırası gelince. Şimdi değil.',
    'Sonsuzluk seni bekleyebilir. Ben de. Ama şu an değil, tamam mı?',
    'Bugün öğretmen olma havamda değilim. Yarın gel. Ya da hiç gelme, hehe.',
    'En güçlü olan ben olmasaydım bu kadar meşgul olmazdım. Git bakalım.'
  ]
}
const HOCA_KEYS = ['chidori', 'amaterasu', 'tsukiyomi', 'ao', 'aka', 'murasaki']
const HOCA_TAGS = ['hoca_rep_kakashi', 'hoca_rep_itachi', 'hoca_info', 'hoca_req_chidori', 'hoca_req_amaterasu', 'hoca_req_tsukiyomi', 'hoca_lost_chidori', 'hoca_lost_amaterasu', 'hoca_lost_tsukiyomi',
  'hoca_rep_gojo', 'hoca_req_ao', 'hoca_req_aka', 'hoca_req_murasaki', 'hoca_lost_ao', 'hoca_lost_aka', 'hoca_lost_murasaki']
const HOCA_COLOR = { Kakashi: 'gray', Itachi: 'dark_red', Gojo: 'aqua' }

function hocaHas(p, tag) {
  var found = false
  p.getTags().forEach(t => { if (String(t) === tag) found = true })
  return found
}

function hocaEsc(s) { return String(s).split('\\').join('\\\\').split('"').join('\\"') }

function hocaSay(server, name, npc, text) {
  var parts = String(text).split('**')
  var comps = ['{"text":"' + npc + '","color":"' + HOCA_COLOR[npc] + '","bold":true}', '{"text":": ","color":"gray","bold":false}']
  for (var i = 0; i < parts.length; i++) {
    if (parts[i] === '') continue
    comps.push('{"text":"' + hocaEsc(parts[i]) + '","color":"white","italic":true' + ',"bold":false' + '}')
  }
  server.runCommandSilent('tellraw ' + name + ' [' + comps.join(',') + ']')
}

function hocaNote(server, name, text, color) {
  server.runCommandSilent('tellraw ' + name + ' {"text":"' + hocaEsc(text) + '","color":"' + (color || 'gray') + '"}')
}

function hocaBar(server, name, text, color) {
  server.runCommandSilent('title ' + name + ' actionbar {"text":"' + hocaEsc(text) + '","color":"' + (color || 'green') + '"}')
}

function hocaLvl(p, key) { return Number(p.persistentData.getInt('hoca_lvl_' + key)) || 0 }
function hocaActive(p) { return String(p.persistentData.getString('hoca_act')) }

function hocaErwinRank(p) {
  var r = Number(p.persistentData.getInt('erwin_rank'))
  return isNaN(r) ? 0 : r
}


// ------------------------------------------------------------------ Hoca bağı
// Bağ, o hocadan öğrenilen toplam seviyeye bağlıdır (ayrı bir sayaç yok): 1+ Tanıdık, 3+ Öğrenci, hepsi Usta Öğrenci.
// Hoca sınav başlarken ve rapor alırken bağa uygun bir söz söyler. Kayıp parşömen ücreti Öğrenci'de %25, Usta Öğrenci'de yarı yarıya iner.
const HOCA_NPC_SPELLS = { Kakashi: ['chidori'], Itachi: ['amaterasu', 'tsukiyomi'], Gojo: ['ao', 'aka', 'murasaki'] }
const HOCA_BOND_NAMES = ['Yabancı', 'Tanıdık', 'Öğrenci', 'Usta Öğrenci']
const HOCA_BOND_LINES = {
  Kakashi: [
    [],
    ['Yine sen. Fena değilsin, ha.', 'Bir seviye geçtin. Artık yabancı sayılmazsın.'],
    ['Öğrencim olmaya başladın. Yolda kaybolmadan gelmen bile bir başarı.', 'Bugün de geç kalmadın; bu iyi bir işaret.'],
    ['Artık öğretecek pek bir şeyim kalmadı. Bazen benden fazlasını yapıyorsun.', 'Yıldırım seni tanıyor. Ben de.']
  ],
  Itachi: [
    [],
    ['Gözlerin bir şey görmeye başladı.', 'Devam et. Ama uzağa gitme.'],
    ['Bana güvenmeyi öğreniyorsun. Bu da bir bedeldir.', 'Karanlıkta yürümeye alıştın. İyi.'],
    ['Gerçeği gördün. Onu taşımak artık sana kalmış.', 'Öğretecek son şeyi öğrettim. Gerisi senin.']
  ],
  Gojo: [
    [],
    ['Hehe, yine sen. Fena değilsin, kabul ediyorum.', 'Bir adım attın. En güçlünün öğrencisi olmaya doğru.'],
    ['Öğrencim olmaya başladın. Ama bana yetişmen için çok var, hehe.', 'Bugün de geldin. Sıkılmıyorum senden, bu bir iltifat.'],
    ['Artık öğretecek pek bir şey kalmadı. Ama en güçlü ben olmaya devam ediyorum, tamam mı?', 'Sonsuzluk seni tanıyor. Ben de. Fena bir ikili olduk.']
  ]
}

function hocaBond(p, npc) {
  var total = 0
  var max = 0
  HOCA_NPC_SPELLS[npc].forEach(k => { total += hocaLvl(p, k); max += HOCA_SPELLS[k].max })
  if (total >= max) return 3
  if (total >= 3) return 2
  return total >= 1 ? 1 : 0
}

function hocaBondText(p, npc) {
  var lines = HOCA_BOND_LINES[npc][hocaBond(p, npc)]
  return lines && lines.length > 0 ? lines[Math.floor(Math.random() * lines.length)] : ''
}

function hocaEmeraldBlocks(server, p, name) {
  try {
    return Number(p.inventory.count('minecraft:emerald_block'))
  } catch (e) {
    return Number(server.runCommandSilent('clear ' + name + ' minecraft:emerald_block 0')) || 0
  }
}

function hocaScroll(spell, lvl) {
  return 'irons_spellbooks:scroll{"irons_spellbooks:spell_container":{data:[{id:"' + spell.id + '",index:0,level:' + lvl + ',locked:1b}],maxSpells:1,mustEquip:0b,spellWheel:0b}}'
}

// Kayan pencere: sınavın 'win' saniyelik penceresinde kaç öldürme var
function hocaWindowKills(pd, win, now) {
  var list = String(pd.getString('hoca_kills')).split(',').filter(x => x !== '').map(Number)
  return list.filter(t => now - t <= win * 1000)
}

function hocaHave(pd, quest) {
  if (quest.win > 0) return hocaWindowKills(pd, quest.win, Date.now()).length
  return Number(pd.getInt('hoca_have'))
}

function hocaQuestText(p) {
  var pd = p.persistentData
  var act = hocaActive(p)
  var spell = HOCA_SPELLS[act]
  if (!spell) return ''
  var lvl = Number(pd.getInt('hoca_act_lvl'))
  var q = spell.quests[lvl - 1]
  var s = spell.name + ' L' + lvl + ' — ' + q.title + ': ' + Math.min(hocaHave(pd, q), q.need) + '/' + q.need + ' ' + q.unit
  if (q.win > 0) s += ' (' + q.win + ' sn içinde)'
  return s
}

function hocaRequest(server, p, name, key) {
  var pd = p.persistentData
  var spell = HOCA_SPELLS[key]
  var npc = spell.npc
  if (HOCA_DEVRE_DISI[key]) {
    var sv = HOCA_SAVMA[npc]
    hocaSay(server, name, npc, sv[Math.floor(Math.random() * sv.length)])
    return
  }
  if (!hocaHas(p, 'rank_maceraci')) {
    hocaSay(server, name, npc, 'Adını duymadım. Önce Maceracı olarak tanınmalısın.')
    return
  }
  if (cineBusy(name)) {
    hocaSay(server, name, npc, 'Bir saniye. Dinle.')
    return
  }
  if (hocaActive(p) !== '') {
    var aq = HOCA_SPELLS[hocaActive(p)].quests[Number(pd.getInt('hoca_act_lvl')) - 1]
    if (aq.scene && hocaActive(p) === key && !hocaSceneOf(name) && hocaHave(pd, aq) < aq.need) {
      cinePlay(server, name, [{ t: 0, title: ['YENİDEN', HOCA_SPELLS[key].name, 'gray'] }, { t: 1, say: [npc, 'Bir daha deneyelim. Bu kez ücret yok.'] }, { t: 2.5, fn: 'hocaSceneStart', args: [key] }])
      return
    }
    hocaSay(server, name, npc, 'Zaten bir sınavın var: ' + hocaQuestText(p) + '. Önce onu bitir.')
    return
  }
  var lvl = hocaLvl(p, key)
  if (lvl >= spell.max) {
    hocaSay(server, name, npc, spell.name + '\'de öğretebileceğim bir şey kalmadı. Kaybettiysen parşömenini yenileyebilirim.')
    return
  }
  var next = lvl + 1
  var reqs = spell.requires === '' ? [] : String(spell.requires).split(',')
  for (var ri = 0; ri < reqs.length; ri++) {
    if (hocaLvl(p, reqs[ri]) < HOCA_SPELLS[reqs[ri]].max) {
      hocaSay(server, name, npc, HOCA_SPELLS[reqs[ri]].name + ' seviyesini tamamen öğrenmeden buna geçemezsin. Önce onu bitir.')
      return
    }
  }
  var need = spell.minRank[next - 1]
  if (hocaErwinRank(p) < need) {
    hocaSay(server, name, npc, 'Henüz hazır değilsin. Keşif Birliği\'nde **' + ERWIN_RANK_NAMES[need] + '** olmalısın. Erwin\'in seferlerini tamamla, sonra gel.')
    return
  }
  var fee = spell.fees[next - 1]
  if (Number(pd.getInt('hoca_paid_' + key)) < next) {
    var have = hocaEmeraldBlocks(server, p, name)
    if (isNaN(have) || have < fee) {
      hocaSay(server, name, npc, 'Bu eğitim bir bedel ister: ' + fee + ' zümrüt bloğu (' + (isNaN(have) ? 0 : have) + '/' + fee + ').')
      return
    }
    server.runCommandSilent('clear ' + name + ' minecraft:emerald_block ' + fee)
    pd.putInt('hoca_paid_' + key, next)
    hocaNote(server, name, '-' + fee + ' zümrüt bloğu', 'gray')
  }
  var q = spell.quests[next - 1]
  pd.putString('hoca_act', key)
  pd.putInt('hoca_act_lvl', next)
  pd.putInt('hoca_have', 0)
  pd.putString('hoca_kills', '')
  hocaIntro(server, p, name, key, next, q)
}

function hocaReport(server, p, name, npcKey) {
  var pd = p.persistentData
  var key = hocaActive(p)
  if (key === '') {
    hocaNote(server, name, 'Aktif bir büyü sınavın yok. Hocandan yeni bir sınav iste.', 'gray')
    return
  }
  var spell = HOCA_SPELLS[key]
  if (spell.npc.toLowerCase() !== npcKey) {
    hocaNote(server, name, 'Aktif sınavını ' + spell.npc + ' verdi; ona rapor ver.', 'gray')
    return
  }
  var lvl = Number(pd.getInt('hoca_act_lvl'))
  var q = spell.quests[lvl - 1]
  if (hocaHave(pd, q) < q.need) {
    hocaSay(server, name, spell.npc, 'Henüz bitmedi: ' + hocaQuestText(p) + '.' + (q.win > 0 ? ' Süre dolduysa baştan denemen gerekir.' : ''))
    return
  }
  server.runCommandSilent('give ' + name + ' ' + hocaScroll(spell, lvl) + ' 1')
  pd.putInt('hoca_lvl_' + key, lvl)
  pd.putString('hoca_act', '')
  pd.putInt('hoca_act_lvl', 0)
  pd.putInt('hoca_have', 0)
  pd.putString('hoca_kills', '')
  hocaOutro(server, p, name, key, lvl)
}

function hocaInfo(server, p, name) {
  var pd = p.persistentData
  hocaNote(server, name, '— Büyü Eğitimi —', 'dark_purple')
  HOCA_KEYS.forEach(k => {
    var s = HOCA_SPELLS[k]
    var l = hocaLvl(p, k)
    var line = s.name + ' (' + s.npc + '): seviye ' + l + '/' + s.max
    if (l < s.max) {
      var need = s.minRank[l]
      line += hocaErwinRank(p) >= need ? '  — sonraki: ' + s.fees[l] + ' zümrüt bloğu' : '  — gerekli rütbe: ' + ERWIN_RANK_NAMES[need]
    }
    hocaNote(server, name, line, l >= s.max ? 'gold' : 'gray')
  })
  hocaNote(server, name, 'Bağ: Kakashi ' + HOCA_BOND_NAMES[hocaBond(p, 'Kakashi')] + ' · Itachi ' + HOCA_BOND_NAMES[hocaBond(p, 'Itachi')] + ' · Gojo ' + HOCA_BOND_NAMES[hocaBond(p, 'Gojo')], 'dark_purple')
  if (hocaActive(p) !== '') hocaNote(server, name, 'Aktif sınav: ' + hocaQuestText(p), 'yellow')
}

function hocaLost(server, p, name, key) {
  var spell = HOCA_SPELLS[key]
  if (HOCA_DEVRE_DISI[key]) {
    var sv = HOCA_SAVMA[spell.npc]
    hocaSay(server, name, spell.npc, sv[Math.floor(Math.random() * sv.length)])
    return
  }
  var lvl = hocaLvl(p, key)
  if (lvl < 1) {
    hocaSay(server, name, spell.npc, 'Sana henüz bir şey öğretmedim, kaybedecek bir parşömenin yok.')
    return
  }
  var fee = hocaLostFee(spell, lvl, hocaBond(p, spell.npc))
  var have = hocaEmeraldBlocks(server, p, name)
  if (isNaN(have) || have < fee) {
    hocaSay(server, name, spell.npc, 'Parşömeni yeniden yazmak ' + fee + ' zümrüt bloğu ister (' + (isNaN(have) ? 0 : have) + '/' + fee + ').')
    return
  }
  server.runCommandSilent('clear ' + name + ' minecraft:emerald_block ' + fee)
  server.runCommandSilent('give ' + name + ' ' + hocaScroll(spell, lvl) + ' 1')
  hocaSay(server, name, spell.npc, 'Bir daha kaybetme. Bu, seviye ' + lvl + ' parşömeni.')
}


// ------------------------------------------------------------------ Sahneli sınavlar
// Sahne mobları 'korunan' etiketli: hub güvenli bölgesi (anubis_hub_safe.js) canavar doğmasını engeller, bu etiket muaf tutar.
// Bell (Chidori L1): 'Gölge Kakashi' zil taşır, oyuncu 2 blok yakına gelince yüzeyde başka bir noktaya ışınlanır; oyuncu 90 sn içinde
// vurup öldürmeli. Illusion (Tsukiyomi L1): 5 yanılsama, biri gerçek (durağan), 4'ü sürekli yer değiştirir; sahte olan vurulunca
// oyuncuya körlük verilir ve yenisi doğar; gerçeği öldüren geçer. Varlıklar 'hoca_scene' etiketli; sahne kaydı global.hocaScenes'te.
const HOCA_BELL_MS = 90000
const HOCA_ILLUSION_MS = 120000
const HOCA_ILLUSION_DECOYS = 4

function hocaScenes() {
  if (!global.hocaScenes) global.hocaScenes = []
  return global.hocaScenes
}

function hocaSceneOf(name) {
  var found = null
  hocaScenes().forEach(sc => { if (String(sc.name) === name) found = sc })
  return found
}

function hocaSceneRemove(server, name) {
  var list = hocaScenes()
  for (var i = list.length - 1; i >= 0; i--) {
    if (String(list[i].name) === name) list.splice(i, 1)
  }
  // önce kayıt silinir; ölüm olayı sahne bulamayınca yok sayar
  server.runCommandSilent('kill @e[tag=hb_' + name + ']')
  server.runCommandSilent('kill @e[tag=il_' + name + ']')
}

function hocaFindPlayer(server, name) {
  var found = null
  server.players.forEach(o => { if (String(o.username) === name) found = o })
  return found
}

function hocaRand(a, b) { return a + Math.random() * (b - a) }

function hocaSpreadAround(server, p, name, selector, minR, maxR) {
  var ang = Math.random() * 6.283185307
  var rad = hocaRand(minR, maxR)
  var x = Math.round((Number(p.x) + Math.cos(ang) * rad) * 10) / 10
  var z = Math.round((Number(p.z) + Math.sin(ang) * rad) * 10) / 10
  server.runCommandSilent('spreadplayers ' + x + ' ' + z + ' 0 1 false ' + selector)
}

function hocaSummonScene(server, name, tagsList, cname, hp, extra) {
  var nbt = '{CustomName:\'{"text":"' + cname + '","color":"gray"}\',CustomNameVisible:1b,NoAI:1b,Silent:1b,PersistenceRequired:1b,Glowing:1b,IsBaby:0b,Health:' + hp + 'f,' +
    'Attributes:[{Name:"minecraft:generic.max_health",Base:' + hp + 'd}],DeathLootTable:"minecraft:empty",' +
    'ActiveEffects:[{Id:12,Amplifier:0,Duration:12000,ShowParticles:0b}],Tags:["hoca_scene","hoca_new","korunan",' + tagsList.map(t => '"' + t + '"').join(',') + ']' + (extra || '') + '}'
  server.runCommandSilent('execute at ' + name + ' run summon minecraft:zombie ~ ~ ~ ' + nbt)
}

function hocaSceneStart(server, p, name, key) {
  var spell = HOCA_SPELLS[key]
  var lvl = Number(p.persistentData.getInt('hoca_act_lvl'))
  var q = spell.quests[lvl - 1]
  hocaSceneRemove(server, name)
  var sc = { name: name, kind: q.scene, start: Date.now(), last: Date.now(), debt: 0, spawnAt: 0 }
  hocaScenes().push(sc)
  if (q.scene === 'bell') {
    hocaSummonScene(server, name, ['hb_' + name], 'Gölge Kakashi', 6, ',HandItems:[{id:"minecraft:bell",Count:1b},{}]')
    hocaSpreadAround(server, p, name, '@e[tag=hoca_new]', 7, 10)
    server.runCommandSilent('tag @e[tag=hoca_new] remove hoca_new')
  } else {
    hocaSummonScene(server, name, ['il_' + name, 'il_real_' + name], 'Yanılsama', 12, '')
    hocaSpreadAround(server, p, name, '@e[tag=hoca_new]', 4, 7)
    server.runCommandSilent('tag @e[tag=hoca_new] remove hoca_new')
    for (var i = 0; i < HOCA_ILLUSION_DECOYS; i++) hocaIllusionDecoy(server, p, name)
  }
  hocaNote(server, name, q.scene === 'bell' ? 'Gölge Kakashi belirdi. 90 saniyen var!' : 'Beş yanılsama belirdi. Gerçek olan yerinden kıpırdamaz. 2 dakikan var!', 'aqua')
}

function hocaIllusionDecoy(server, p, name) {
  hocaSummonScene(server, name, ['il_' + name], 'Yanılsama', 1, '')
  hocaSpreadAround(server, p, name, '@e[tag=hoca_new]', 4, 8)
  server.runCommandSilent('tag @e[tag=hoca_new] remove hoca_new')
}

function hocaSceneEnd(server, name, msg, color) {
  hocaSceneRemove(server, name)
  hocaNote(server, name, msg, color)
}

function hocaSceneTick(server, phase) {
  var list = hocaScenes()
  for (var i = list.length - 1; i >= 0; i--) {
    var sc = list[i]
    var name = String(sc.name)
    var p = hocaFindPlayer(server, name)
    var limit = sc.kind === 'bell' ? HOCA_BELL_MS : HOCA_ILLUSION_MS
    if (!p) { hocaSceneRemove(server, name); continue }
    if (Date.now() - Number(sc.start) > limit) {
      hocaSceneEnd(server, name, 'Süre doldu. Sahne kayboldu. Hocandan sınavı yeniden başlatmasını iste (ücretsiz).', 'gray')
      continue
    }
    if (sc.kind === 'bell') {
      // her 2 tikte: oyuncu 2.6 blok yakına girdiyse gölge yüzeyde başka bir noktaya kaçar
      if (phase % 2 === 0) {
        var ang = Math.random() * 6.283185307
        var rad = hocaRand(8, 11)
        var x = Math.round((Number(p.x) + Math.cos(ang) * rad) * 10) / 10
        var z = Math.round((Number(p.z) + Math.sin(ang) * rad) * 10) / 10
        server.runCommandSilent('execute as ' + name + ' at @s as @e[tag=hb_' + name + ',distance=..2.6] at @s run particle minecraft:poof ~ ~1 ~ 0.3 0.5 0.3 0.05 12')
        server.runCommandSilent('execute as ' + name + ' at @s as @e[tag=hb_' + name + ',distance=..2.6] run spreadplayers ' + x + ' ' + z + ' 0 1 false @s')
      }
    } else {
      if (phase % 10 === 0) {
        // her 0.5 sn bir sahte gölge yer değiştirir
        var a2 = Math.random() * 6.283185307
        var r2 = hocaRand(4, 8)
        var x2 = Math.round((Number(p.x) + Math.cos(a2) * r2) * 10) / 10
        var z2 = Math.round((Number(p.z) + Math.sin(a2) * r2) * 10) / 10
        server.runCommandSilent('spreadplayers ' + x2 + ' ' + z2 + ' 0 1 false @e[tag=il_' + name + ',tag=!il_real_' + name + ',limit=1,sort=random]')
      }
      if (Number(sc.debt) > 0 && Date.now() - Number(sc.spawnAt) > 3000) {
        sc.debt = Number(sc.debt) - 1
        sc.spawnAt = Date.now()
        hocaIllusionDecoy(server, p, name)
      }
    }
  }
}

// Sahne varlığı öldü: oyuncu öldürdüyse ilerleme, başkası öldürdüyse sahne biter
function hocaSceneDeath(event) {
  var ent = event.entity
  var tags = []
  ent.getTags().forEach(t => tags.push(String(t)))
  if (tags.indexOf('hoca_scene') < 0) return false
  var owner = ''
  var real = false
  tags.forEach(t => {
    if (t.indexOf('hb_') === 0) owner = t.substring(3)
    else if (t.indexOf('il_real_') === 0) { owner = t.substring(8); real = true }
    else if (t.indexOf('il_') === 0 && owner === '') owner = t.substring(3)
  })
  if (owner === '') return true
  var sc = hocaSceneOf(owner)
  if (!sc) return true // sahne kaydı silinmiş (temizlik); yok say
  var server = ent.server
  var src = event.source.actual
  var byOwner = src && src.isPlayer() && String(src.username) === owner
  var isBell = tags.indexOf('hb_' + owner) >= 0
  if (isBell || real) {
    if (!byOwner) {
      hocaSceneEnd(server, owner, 'Gölge başka bir şeyin elinde yok oldu. Sınavı hocandan yeniden başlat.', 'gray')
      return true
    }
    var pl = hocaFindPlayer(server, owner)
    pl.persistentData.putInt('hoca_have', 1)
    hocaSceneRemove(server, owner)
    hocaNote(server, owner, isBell ? 'Zil senin! Sınav tamam. Hocana dönüp haber ver.' : 'Gerçek olanı buldun. Sınav tamam. Hocana dönüp haber ver.', 'gold')
    hocaBar(server, owner, 'Sınav tamam. Hocana rapor ver.', 'gold')
    server.runCommandSilent('playsound minecraft:block.note_block.chime master ' + owner + ' ~ ~ ~ 1 1.5')
    return true
  }
  // sahte yanılsama vuruldu: ceza + yenisi doğacak
  if (byOwner) {
    server.runCommandSilent('effect give ' + owner + ' minecraft:blindness 4 0 true')
    server.runCommandSilent('effect give ' + owner + ' minecraft:slowness 3 1 true')
    hocaNote(server, owner, 'Sahte! Gözün karardı.', 'dark_gray')
  }
  sc.debt = Number(sc.debt) + 1
  sc.spawnAt = Date.now()
  return true
}


// ------------------------------------------------------------------ Hoca hikâyeleri (sinema_motoru.js ile oynar)
// Her seviyenin açılış senaryosu: tema efekti, başlık, hocanın anlatısı, sonra sınav talimatı. Kapanış: parşömen töreni.
const HOCA_STORY = {
  chidori: { fx: 'simsek', color: 'aqua', levels: [
    { main: 'ZİL SINAVI', lines: ['Üç kişi, iki zil. Yıllar önce ben de bu oyunu oynadım; tek fark, artık hile yok.', 'Gölgem elinde zille orada bekliyor. Yakalayabilirsen Chidori\'nin ilk kıvılcımı senin.'], outro: 'Zil çaldı... çaldı mı? Neyse. Kıvılcım senin.' },
    { main: 'ŞİMŞEK ZİNCİRİ', lines: ['Yıldırım tek çarpmaz; bir düşmandan ötekine sıçrar.', 'Yavaşlarsan zincir kopar. Nefesini tut, sayıyı tamamla.'], outro: 'İki, üç, dört... sayıp durmadın. Sıçrama duygusu bu.' },
    { main: 'BİN KUŞUN SESİ', lines: ['Bir zamanlar bu sesi duyunca kuşlar susardı.', 'Şimdi gücünü tanıyacaksın. Güç, kontrol edilince güçtür.'], outro: 'Sesi duydun mu? Kuşlar sustu.' },
    { main: 'KIRILMAYAN YILDIRIM', lines: ['Son sınav. Ardına bakma, yıldırım geri dönmez.', 'Kadim ve yıkık olanlarla yüzleşeceksin. Onlar çok uzun süredir uyuyor.'], outro: 'Artık Chidori senin. Ama bu, seni onu kullanmaya mecbur etmez.' }
  ] },
  amaterasu: { fx: 'alev', color: 'dark_red', levels: [
    { main: 'KARA ALEVİN DOĞUŞU', lines: ['Alevin doğması bir bedel ister.', 'Nether\'in askerleri yakıt olacak. Ateş sana bakacak; sen ona bakma.'], outro: 'Alev seni kabul etti. Yanıyorsun ama tanıdığın bir yanmayla.' },
    { main: 'SÖNMEYEN ATEŞ', lines: ['Kara alev su ile sönmez. Bunu unutma.', 'Kaleyi yak. Nöbetçiler kül olsun.'], outro: 'Sönmeyen ateşi taşımak, bir sorumluluktur.' },
    { main: 'YAKILAN RUHLAR', lines: ['Bazıları yandığı için değil, unutulduğu için ölür.', 'Mezarların içinde uyuyanlar ve yıkıntıların bekçileri... onlara son ver.'], outro: 'Alevi öğrendin. Şimdi onu nasıl bırakacağını da öğren.' }
  ] },
  tsukiyomi: { fx: 'golge', color: 'dark_purple', levels: [
    { main: 'SAHTE GERÇEK', lines: ['Gerçek nedir? Görebildiğin mi, sana gösterilen mi?', 'Etrafında beş gölge belireceğim. Biri gerçek. Gözlerine güvenme.'], outro: 'Doğruyu buldun. Karanlık seni yutmadan önce.' },
    { main: 'AYNALARIN ARDI', lines: ['Yanılsama ustaları aynaların arkasında yaşar.', 'Onları yen. Aynayı kır.'], outro: 'Aynalar kırıldı. Artık kendini de görebilirsin.' },
    { main: 'SONSUZ GECE', lines: ['Son sınav gecenin kendisidir.', 'Bir hükümdarı yen. Onun gölgesi seni ele geçirmeden.'], outro: 'Sonsuz gece bitmez. Ama artık içinde yolunu biliyorsun.' }
  ] },
  ao: { fx: 'mavi', color: 'aqua', levels: [
    { main: 'SONSUZLUĞUN KIYISI', lines: ['Bak, bu kadar basit: çekmek. Uzayı bükmek de bunun bir uzantısı.', 'Etrafındaki her şeyi kendine çek. Ellerinin arasında toplansın.'], outro: 'Çekildiler... hepsi. Mavi seni sevdi.' },
    { main: 'ÇEKİM ALANI', lines: ['Alan büyüdükçe çektiğin şey de büyür.', 'Yağmacıların, kaosun ve Nether askerlerinin içinden geç. Hepsi sana doğru gelsin.'], outro: 'Çekim alanı. Artık hepsi senin etrafında dönüyor.' },
    { main: 'KÜTLE ÇEKİMİ', lines: ['Ağır şeyler ağır çekilir. Sen daha ağırsın.', 'Yıkıntıların, mutantların ve kadim yaratıkların içinden geç. Boşluğa ilan et kendini.'], outro: 'Mavi tamam. Uzay senin için biraz daha küçüldü.' }
  ] },
  aka: { fx: 'kirmizi', color: 'red', levels: [
    { main: 'KIRMIZI PATLAMA', lines: ['Mavi çeker; Kırmızı iter. Tersine çevirme sanatı bu.', 'Bir şeyleri kendinden uzağa fırlat. Patlat. Sonra bir daha.'], outro: 'Patladı. Hehe, çok güzel.' },
    { main: 'TERSİNE ÇEVRİLMİŞ', lines: ['Kırmızı, ters yöndeki çekimdir. Her şey senden kaçar.', 'Mezarlıkların ve kalelerin içinden it, it, it.'], outro: 'Ters çevrildi. Şimdi hepsi senin gölgenden kaçıyor.' },
    { main: 'KIZIL KIYAMET', lines: ['Sertlerin sertleri karşında. İtmek yetmez, ezmen gerekir.', 'Büyücüler, şövalyeler, ölü seçkinler... hepsini yere ser.'], outro: 'Kırmızı tamam. Ardında yalnızca toz kaldı.' }
  ] },
  murasaki: { fx: 'mor', color: 'dark_purple', levels: [
    { main: 'İKİ BİR OLUR', lines: ['Mavi ve Kırmızı ayrı ayrı güzeldir. Birleşirse... işte o zaman ilginç olur.', 'Seçkin düşmanlara karşı hem çek hem it. Ben izliyorum.'], outro: 'İkisi birleşti. Hissediyor musun? Bu başka bir şey.' },
    { main: 'YOK ETME', lines: ['Mor dokunduğunu siler. İz bırakmaz.', 'Bir boss\'u dene. Ölmeden önce vurmayı unutma.'], outro: 'Sildin. Gerçekten sildin. Ürkütücü, değil mi?' },
    { main: 'BOŞLUK', lines: ['Son adım. Geriye bir şey kalmayacak.', 'Kadim bir boss\'u yen. Ardında sadece boşluk bırak.'], outro: 'Mor tamam. Şimdi neyi silmek istediğini iyi seç, hehe.' }
  ] }
}
const HOCA_MILESTONE = {
  Kakashi: ['Yarısı tamam. Devam, sakin ol.', 'İyi gidiyorsun; ama hata hep yarıda yapılır.'],
  Itachi: ['Alev büyüyor. Ona yol ver.', 'Yarı yoldasın. Yavaşlama.'],
  Gojo: ['Yarısı bitti mi? Ben ilk baktığımda bitirmiştim, hehe. Devam et.', 'İyi gidiyorsun. Ama bu kadar kolay olmamalıydı, değil mi?']
}
const HOCA_MASTERY_LINE = {
  chidori: 'Chidori artık senin. İyi kullan.',
  amaterasu: 'Kara alevi tamamen öğrendin. Ona borçlu değilsin, o sana borçlu.',
  tsukiyomi: 'Gerçek ve yanılsama arasındaki çizgi artık senin elinde.',
  ao: 'Mavi artık senin. Uzayı büktün, tebrikler. Ben bunu çocukken yapmıştım ama neyse.',
  aka: 'Kırmızı artık senin. Her şeyi it, her şeyi patlat. Hehe.',
  murasaki: 'Mor artık senin. Bunu ancak bir avuç kişi yapabildi. Ben de aralarındayım, tabii.'
}

function hocaIntro(server, p, name, key, lvl, q) {
  var spell = HOCA_SPELLS[key]
  var st = HOCA_STORY[key]
  var lv = st.levels[lvl - 1]
  var steps = CINE_FX[st.fx].slice()
  if (spell.npc === 'Itachi') steps = steps.concat(CINE_FX.karga)
  if (key === 'chidori' && lvl === 4) steps = steps.concat(CINE_FX.firtina)
  steps.push({ t: 0.5, title: [lv.main, spell.name + ' — seviye ' + lvl + '/' + spell.max, st.color] })
  var t = 3
  lv.lines.forEach(l => { steps.push({ t: t, say: [spell.npc, l] }); t += 3.2 })
  var bl = hocaBondText(p, spell.npc)
  if (bl !== '') { steps.push({ t: t, say: [spell.npc, bl] }); t += 2.5 }
  steps.push({ t: t, say: [spell.npc, '**' + q.title + '.** ' + q.brief] })
  t += 1
  steps.push({ t: t, note: ['Sınav: ' + q.need + ' ' + q.unit + (q.scene ? '' : ' öldür') + (q.win > 0 ? ' (' + q.win + ' saniye içinde)' : '') + '. Bitince ' + spell.npc + '\'ye dön.', 'yellow'] })
  if (q.scene) steps.push({ t: t + 0.5, fn: 'hocaSceneStart', args: [key] })
  cinePlay(server, name, steps)
}

function hocaOutro(server, p, name, key, lvl) {
  var spell = HOCA_SPELLS[key]
  var st = HOCA_STORY[key]
  var lv = st.levels[lvl - 1]
  var steps = CINE_FX.parsomen.slice()
  if (spell.npc === 'Itachi' && lvl >= spell.max) steps = steps.concat(CINE_FX.karga)
  if (key === 'chidori' && lvl === 4) steps = steps.concat(CINE_FX.firtina)
  steps.push({ t: 0.5, title: [spell.name + ' — SEVİYE ' + lvl, 'Parşömen alındı', 'gold'] })
  steps.push({ t: 2.5, say: [spell.npc, spell.praise[lvl - 1]] })
  steps.push({ t: 5.5, say: [spell.npc, lv.outro] })
  var t = 8.5
  var bl = hocaBondText(p, spell.npc)
  if (bl !== '') { steps.push({ t: t, say: [spell.npc, bl] }); t += 2.5 }
  steps.push({ t: t, note: [spell.name + ' seviye ' + lvl + ' parşömenini aldın.' + (spell.alias ? ' (Parşömende "' + spell.alias + '" yazar.)' : ''), 'gold'] })
  if (lvl >= spell.max) {
    steps.push({ t: t + 1, title: ['USTALIK', spell.name, 'gold'] })
    steps.push({ t: t + 1, sound: ['minecraft:ui.toast.challenge_complete', 1, 0.9] })
    steps.push({ t: t + 1.5, cmd: 'execute at {p} run particle minecraft:totem_of_undying ~ ~1 ~ 0.6 0.9 0.6 0.35 80' })
    steps.push({ t: t + 3, say: [spell.npc, HOCA_MASTERY_LINE[key]] })
  }
  var gift = hocaGiftIfDue(server, p, name, spell.npc)
  if (gift) {
    steps.push({ t: t + 5, say: [spell.npc, gift.say] })
    steps.push({ t: t + 5.5, cmd: gift.give })
    steps.push({ t: t + 5.5, note: [gift.note, 'gold'] })
  }
  cinePlay(server, name, steps)
}


// ------------------------------------------------------------------ Bağ hediyesi
// Bir hocayla bağ 'Usta Öğrenci'ye çıkınca (o hocadan öğrenilebilen tüm seviyeler) hoca kozmetik bir hediye verir (bir kez).
// Hediye: koyu boyalı deri parça, kırılmaz; zırh değeri düşük olduğundan yalnızca görünüş içindir.
const HOCA_GIFTS = {
  Itachi: { flag: 'hoca_gift_itachi', say: 'Bunu al. Bir zamanlar bana aitti. Karanlıkta yürürken seni saklar.', note: 'Itachi sana "Gece Pelerini" armağan etti (kozmetik).',
    give: 'give {p} minecraft:leather_chestplate{display:{Name:\'{"text":"Gece Pelerini","color":"dark_red","italic":false}\',Lore:[\'{"text":"Itachi armağan etti.","color":"dark_gray","italic":true}\'],color:1710618},Unbreakable:1b,HideFlags:4} 1' },
  Gojo: { flag: 'hoca_gift_gojo', say: 'Al bunu. Gözlerini sakla; herkes onlara bakınca aptallaşıyor. Hehe.', note: 'Gojo sana "Sonsuzluğun Bandı" armağan etti (kozmetik).',
    give: 'give {p} minecraft:leather_helmet{display:{Name:\'{"text":"Sonsuzluğun Bandı","color":"aqua","italic":false}\',Lore:[\'{"text":"Gojo armağan etti.","color":"dark_gray","italic":true}\'],color:1381653},Unbreakable:1b,HideFlags:4} 1' },
  Kakashi: { flag: 'hoca_gift_kakashi', say: 'Yaa... bunu sana bırakıyorum. Bir tane daha vardı ama bulamadım.', note: 'Kakashi sana "Kopya Bandanası" armağan etti (kozmetik).',
    give: 'give {p} minecraft:leather_helmet{display:{Name:\'{"text":"Kopya Bandanası","color":"gray","italic":false}\',Lore:[\'{"text":"Kakashi armağan etti.","color":"dark_gray","italic":true}\'],color:2263842},Unbreakable:1b,HideFlags:4} 1' }
}

// Bağ Usta Öğrenci ise ve hediye daha verilmediyse {say, give, note} döndürür ve bayrağı işaretler
function hocaGiftIfDue(server, p, name, npc) {
  var g = HOCA_GIFTS[npc]
  if (!g) return null
  if (hocaBond(p, npc) < 3) return null
  if (Number(p.persistentData.getInt(g.flag)) === 1) return null
  p.persistentData.putInt(g.flag, 1)
  return { say: g.say, give: g.give.split('{p}').join(name), note: g.note }
}

// Kakashi Chidori L4 sınavı sürerken uzaktan sahte şimşek (yalnızca parçacık ve ses)
function hocaFakeBolt(server, name) {
  var a = Math.random() * 6.283185307
  var r = 8 + Math.random() * 6
  var dx = (Math.cos(a) * r).toFixed(1)
  var dz = (Math.sin(a) * r).toFixed(1)
  server.runCommandSilent('execute at ' + name + ' positioned ~' + dx + ' ~ ~' + dz + ' run particle minecraft:electric_spark ~ ~ ~ 0.15 7 0.15 0.8 60')
  server.runCommandSilent('playsound minecraft:entity.lightning_bolt.thunder master ' + name + ' ~ ~ ~ 0.6 ' + (0.8 + Math.random() * 0.4).toFixed(2))
}

// Karşılama çeşitliliği: her hocanın 5 karşılama repliği var (hoca_kars_1..5). Oyuncuda o an geçerli olan 'hoca_kn_<hoca>_<n>' etiketi
// hangisinin açılacağını belirler; hoca ile her konuşmadan sonra (hoca_reroll_<hoca> etiketi) bir öncekinden farklı yeni biri seçilir.
const HOCA_KARS_COUNT = 5
const HOCA_KARS_NPCS = ['kakashi', 'itachi', 'gojo']

function hocaRerollGreeting(server, p, name) {
  HOCA_KARS_NPCS.forEach(n => {
    if (!hocaHas(p, 'hoca_reroll_' + n)) return
    server.runCommandSilent('tag ' + name + ' remove hoca_reroll_' + n)
    var cur = 0
    for (var i = 1; i <= HOCA_KARS_COUNT; i++) {
      if (hocaHas(p, 'hoca_kn_' + n + '_' + i)) { cur = i; server.runCommandSilent('tag ' + name + ' remove hoca_kn_' + n + '_' + i) }
    }
    var next = cur
    while (next === cur) next = 1 + Math.floor(Math.random() * HOCA_KARS_COUNT)
    server.runCommandSilent('tag ' + name + ' add hoca_kn_' + n + '_' + next)
  })
}

var hocaPhase = 0

ServerEvents.tick(event => {
  hocaPhase++
  if (hocaScenes().length > 0) {
    try { hocaSceneTick(event.server, hocaPhase) } catch (e) { console.error('hoca sahne hata: ' + e) }
  }
  if (hocaPhase % 10 !== 0) return
  var server = event.server
  server.players.forEach(p => {
    try {
      var name = String(p.username)
      hocaRerollGreeting(server, p, name)
      for (var i = 0; i < HOCA_TAGS.length; i++) {
        var tg = HOCA_TAGS[i]
        if (!hocaHas(p, tg)) continue
        server.runCommandSilent('tag ' + name + ' remove ' + tg)
        if (tg.indexOf('hoca_rep_') === 0) hocaReport(server, p, name, tg.substring(9))
        else if (tg === 'hoca_info') hocaInfo(server, p, name)
        else if (tg.indexOf('hoca_req_') === 0) hocaRequest(server, p, name, tg.substring(9))
        else if (tg.indexOf('hoca_lost_') === 0) hocaLost(server, p, name, tg.substring(10))
      }
      if (hocaPhase % 80 === 0 && hocaActive(p) !== '') hocaBar(server, name, hocaQuestText(p), 'aqua')
      if (hocaPhase % 160 === 0 && hocaActive(p) === 'chidori' && Number(p.persistentData.getInt('hoca_act_lvl')) === 4) hocaFakeBolt(server, name)
    } catch (e) {
      console.error('hoca hata: ' + e)
    }
  })
})

EntityEvents.death(event => {
  try {
    if (hocaSceneDeath(event)) return
    var src = event.source.actual
    if (!src || !src.isPlayer()) return
    var pd = src.persistentData
    var key = String(pd.getString('hoca_act'))
    if (key === '') return
    var spell = HOCA_SPELLS[key]
    var lvl = Number(pd.getInt('hoca_act_lvl'))
    var q = spell.quests[lvl - 1]
    var id = String(event.entity.type)
    if (q.targets().indexOf(id) < 0) return
    var now = Date.now()
    var before = hocaHave(pd, q)
    if (before >= q.need) return
    if (q.win > 0) {
      var list = hocaWindowKills(pd, q.win, now)
      list.push(now)
      pd.putString('hoca_kills', list.join(','))
    } else {
      pd.putInt('hoca_have', before + 1)
      if (q.need >= 4 && before + 1 === Math.ceil(q.need / 2)) hocaSay(src.server, String(src.username), spell.npc, HOCA_MILESTONE[spell.npc][Math.floor(Math.random() * 2)])
    }
    var name = String(src.username)
    var server = src.server
    if (before + 1 >= q.need) {
      hocaBar(server, name, spell.name + ' sınavı tamam. ' + spell.npc + '\'ye rapor ver.', 'gold')
      hocaNote(server, name, 'Sınav tamamlandı! ' + spell.npc + '\'ye dönüp haber ver' + (q.win > 0 ? ' (pencere dolmadan)' : '') + '.', 'gold')
      server.runCommandSilent('playsound minecraft:block.note_block.chime master ' + name + ' ~ ~ ~ 1 1.5')
    } else {
      hocaBar(server, name, hocaQuestText(src), 'aqua')
    }
  } catch (e) {
    console.error('hoca sayac hata: ' + e)
  }
})

PlayerEvents.loggedOut(event => {
  try {
    hocaSceneRemove(event.server, String(event.player.username))
  } catch (e) {
    console.error('hoca cikis hata: ' + e)
  }
})

// Yönetici: /hoca_sifirla <oyuncu> tüm hoca ilerlemesini sıfırlar (test için; op seviye 2)
ServerEvents.commandRegistry(event => {
  const { commands: Commands, arguments: Arguments } = event
  event.register(Commands.literal('hoca_sifirla').requires(s => s.hasPermission(2)).then(Commands.argument('oyuncu', Arguments.PLAYER.create(event)).executes(ctx => {
    var p = Arguments.PLAYER.getResult(ctx, 'oyuncu')
    var pd = p.persistentData
    HOCA_KEYS.forEach(k => { pd.putInt('hoca_lvl_' + k, 0); pd.putInt('hoca_paid_' + k, 0) })
    pd.putInt('hoca_gift_itachi', 0)
    pd.putInt('hoca_gift_gojo', 0)
    pd.putInt('hoca_gift_kakashi', 0)
    pd.putString('hoca_act', '')
    pd.putInt('hoca_act_lvl', 0)
    pd.putInt('hoca_have', 0)
    pd.putString('hoca_kills', '')
    ctx.source.sendSuccess(Text.of(String(p.username) + ' için hoca ilerlemesi sıfırlandı.'), false)
    return 1
  })))
})
