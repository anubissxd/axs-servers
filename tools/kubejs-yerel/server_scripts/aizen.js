// Aizen (Bleach): Caddy'de yardımsever bir âlim olarak başlar, SUNUCU GENELİ bir olayla kötü karaktere dönüşür ve bir boss'a evrilir.
// 5 PERDELİK HİKÂYE (Bleach'in Soul Society bölümünden esinli). Sunucu evresi dünya verisinde (server.persistentData 'aizen_evre'):
//   1 Misafir: nazik âlim, Sis'in kaynağını "araştırıyor" (bilgi, çay, gözlem görevleri). Ara sıra Shunpo ile yanına gelir.
//   2 Şüphe: aynı ama ince tuhaflıklar; diğer NPC'lerin şüpheli sözleri sohbete düşer.
//   3 Yaralı: "biri saldırdı"; Aizen yaralı ve zayıf (yaslanma pozu). Oyuncular yardım getirir (şükran) ve yaralarını inceler (ipuçları:
//     yara sahte). Herkesin getirdiği yardım sunucu geneli sayılır. (Anime: Aizen'in sahte ölümü ve gizlenmesi.)
//   4 İhanet: kısa sinematik geçiş: "yardım ettiğiniz için teşekkürler", en çok yardım eden ve şüphelenen oyuncular anılır.
//   5 Kötü: boss kapışması (Kido, Shunpo, Kyōka Suigetsu, Kurohitsugi); ilk yenen duyurulur.
// EVRELER KENDİLİĞİNDEN İLERLER: sayaç yalnızca sunucuda en az bir oyuncu varken işler (aizen_ms): evre 1 AIZEN_EVRE1_MS, evre 2 AIZEN_EVRE2_MS,
// evre 3 AIZEN_EVRE3_MS sürer, sonra ihanet kendiliğinden oynar. Yönetici müdahalesi: /aizen_evre <1-5> (sayacı o evrenin başlangıcına çeker),
// /aizen_durum. Diyalog yönlendirmesi oyuncu etiketleriyle (aizen_st_<n>); script her oyuncuya evreye uygun etiketi verir.
// Diyalog düğmeleri yalnızca etiket verir: aizen_bilgi, aizen_yardim, aizen_arastirma, aizen_kim, aizen_supheli (evre 2), aizen_getir ve
// aizen_incele (evre 3), aizen_neden ve aizen_dovus (evre 5). Boss: Kenpachi'nin motoruna benzer, ayrı yazıldı.
// Not: server_scripts dosyaları aynı scope'ta çalışır; cinePlay, erwinRank, EG_* çalışma anında kullanılır. 'global' Java haritasıdır: null yazma.

global.aizenFight = false
global.aizenIntro = ''
global.aizenTimers = []
global.aizenWander = false

// Evre süreleri: yalnızca sunucuda oyuncu varken sayılır (oynanan süre). Değiştirmek için bu iki sayıyı ayarla.
const AIZEN_EVRE1_MS = 10 * 3600 * 1000 // yardımsever evre: 10 saat oynanmış süre
const AIZEN_EVRE2_MS = 8 * 3600 * 1000 // şüphe evresi: 8 saat oynanmış süre (toplam 18 saat sonra ihanet)
const AIZEN_EVRE3_MS = 5 * 3600 * 1000 // yaralı evre: 5 saat oynanmış süre (toplam 23 saat sonra ihanet)
const AIZEN_IPUCU_MS = 30 * 60 * 1000 // evre 2'de sohbete bir ipucu düşme aralığı
const AIZEN_IPUCU3_MS = 25 * 60 * 1000 // evre 3'te sohbete bir ifade düşme aralığı
const AIZEN_GEZ_MS = 20 * 60 * 1000 // Shunpo ile yanına gelme: oyuncu başına bekleme
const AIZEN_GETIR_MS = 10 * 60 * 1000 // yardım getirme: oyuncu başına bekleme
const AIZEN_GETIR_GUNLUK = 3
const AIZEN_GETIR_ITEM = 'minecraft:bread'
const AIZEN_GETIR_N = 12

const AIZEN_HINTS = [
  ['Kenpachi', 'dark_red', 'O gözlüklü âlimden hoşlanmadım. Kılıcı yok ama gözleri kılıç gibi bakıyor.'],
  ['Erwin Smith', 'dark_green', 'Aizen\'in defterlerinde seferlerimin tarihleri yazıyor. Neden?'],
  ['Thorfinn', 'gold', 'Çay tatlı. Ama çayı demleyenin aklından ne geçtiğini bilmek isterdim.'],
  ['Gojo', 'aqua', 'Şu Aizen... hehe, güvenmek için fazla iyi biri. Bu kadar iyi olanlar genellikle bir şey saklar.'],
  ['Itachi', 'dark_red', 'Gözlerim bir yanılsamanın kokusunu alıyor. Kaynağını bulamıyorum.'],
  ['Kakashi', 'gray', 'Bir arkadaşım söylerdi: iyi biri gibi görünenlere dikkat et. Yaa... bilmem, ben yalnızca okuyorum.'],
  ['Yoruichi', 'light_purple', 'Hızlı olan biri bile bazen kimi kovaladığını bilmez. İyi bak, çocuk.'],
  ['Kenpachi', 'dark_red', 'Sinek bile ne zaman bir örümceğin ağında olduğunu anlar. Sen anlamıyorsun.'],
  ['Erwin Smith', 'dark_green', 'Seferlerde kaybettiğimiz kişiler... Aizen\'in notlarında rakam olarak yazıyorlar. Bu hoşuma gitmiyor.'],
  ['Thorfinn', 'gold', 'Toprak yalan söylemez. Ama âlimler söyler.']
]

// Evre 3: soruşturma ifadeleri (sohbete düşer)
const AIZEN_HINTS3 = [
  ['Erwin Smith', 'dark_green', 'Aizen\'e kim saldırdı? Hiçbir izci bir şey görmemiş. Sis bile o gece durmuş.'],
  ['Kenpachi', 'dark_red', 'Bana bakmayın. Kimseyi öldürmeden önce yüzüne bakarım. Ve o gözlüklüyü vurmadım.'],
  ['Thorfinn', 'gold', 'Yarası ilk baktığımda taze görünmüyordu. Ama ben çiftçiyim, hekim değilim.'],
  ['Gojo', 'aqua', 'Aizen\'in yarası... hehe, "bu kadar temiz" bir yara nadir görülür. Kılıç mı? Büyü mü?'],
  ['Itachi', 'dark_red', 'Kan kokusu yok. Yalnızca bir yanılsamanın izi. Bunu Aizen\'in kendisi söyleseydi hiç şaşırmazdım.'],
  ['Kakashi', 'gray', 'Yaa... ben bir şey görmedim. Ama Aizen\'in yatağının yanındaki kitap ters okunuyordu. Neyse.'],
  ['Erwin Smith', 'dark_green', 'Bir şeyi fark ettim: Aizen bu kadar zayıfken bile Birliğin gücünü soruyor. Neden?'],
  ['Yoruichi', 'light_purple', 'Yavaş yürüyen biri bile kaçarken hızlanır. Aizen ise hiç kıpırdamıyor. Çok sakin.'],
  ['Kenpachi', 'dark_red', 'Kırk kişiyle savaşmıştım ve hepsi dururken bile daha az sakin olurlardı.'],
  ['Thorfinn', 'gold', 'Toprak yalan söylemez. Aizen\'in yatağı ise dün gece hiç ezilmemiş.']
]
const AIZEN_INCELE = [
  'Yara temiz kesilmiş; ama kan kuru ve eski görünüyor. Bir saatlik bir yara için fazla eski.',
  'Aizen\'in bilekleri hiç morarmamış. Kimsenin tutmadığı biri gibi.',
  'Yatağın yanındaki fincan hâlâ sıcak. Yaralı biri, çayını sıcak tutmak için yerinden kalkmaz.',
  'Yarası solunum sırasında hiç oynamıyor. Sanki hiç nefes almamış gibi.',
  'Sırtına karşı duvarda, kılıç izi yok. Saldıran biri kılıç kullanmadıysa ne kullandı?',
  'Gözlüğün camı kırık; ama çerçevede çizik yok. Kırılmış değil, kırılmış gibi yapılmış.',
  'Aizen\'in bakışı bir an sana kilitlendi ve hemen ağırlaştı. Bu yaralı bir adamın bakışı değil.',
  'Defterinin son sayfasında yalnızca tek bir cümle: "İyi oyuncu, seyircinin gülmesini beklemez."'
]
const AIZEN_HEDIYE_KANIT = 6 // bu kadar şey incelemiş oyuncu ihanette "Kırık Gözlük" alır

const AIZEN_TAGS = ['aizen_bilgi', 'aizen_yardim', 'aizen_arastirma', 'aizen_kim', 'aizen_supheli', 'aizen_getir', 'aizen_incele', 'aizen_neden', 'aizen_dovus']
const AIZEN_SKIN_1 = '{Type:"SECURE_REMOTE_URL",URL:"https://raw.githubusercontent.com/anubissxd/minecraft-servers/main/assets/npc-skins/aizen_v1.png",UUID:[I;2099446325,-1651101577,-1219253577,2102217700]}'
const AIZEN_SKIN_2 = '{Type:"SECURE_REMOTE_URL",URL:"https://raw.githubusercontent.com/anubissxd/minecraft-servers/main/assets/npc-skins/aizen_v2.png",UUID:[I;-1821690747,-2046673432,-1301293645,-1469846623]}'

function aizenHas(p, tag) {
  var found = false
  p.getTags().forEach(t => { if (String(t) === tag) found = true })
  return found
}
function aizenEsc(s) { return String(s).split('\\').join('\\\\').split('"').join('\\"') }
function aizenRand(a, b) { return a + Math.floor(Math.random() * (b - a + 1)) }
function aizenPick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function aizenStage(server) {
  var v = Number(server.persistentData.getInt('aizen_evre'))
  return v >= 1 && v <= 5 ? v : 1
}

function aizenSay(server, name, text) {
  var st = aizenStage(server)
  var color = st >= 4 ? 'dark_purple' : 'gold'
  server.runCommandSilent('tellraw ' + name + ' [{"text":"Aizen","color":"' + color + '","bold":true},{"text":": ","color":"gray","bold":false},{"text":"' + aizenEsc(text) + '","color":"white","italic":true,"bold":false}]')
}
function aizenNote(server, name, text, color) {
  server.runCommandSilent('tellraw ' + name + ' {"text":"' + aizenEsc(text) + '","color":"' + (color || 'gray') + '"}')
}

// Aizen'in konuşma diyaloğuna verdiği cevaplar diyalog penceresinde açılır (npc_dialog.js); kapışma ve gezinme repliği sohbette kalır.
// NPC, 'aizen_npc' etiketiyle bulunur (UUID sabit değil).
function aizenDlgUuid(server) {
  var e = aizenNpcPos(server)
  return e ? String(e.uuid) : ''
}

function aizenSayDlg(server, name, text) {
  var u = aizenDlgUuid(server)
  if (u === '') { aizenSay(server, name, text); return }
  npcDlgSay(server, u, 'aizen_yanit', name, text, false, t => aizenSay(server, name, t))
}

function aizenLineDlg(server, name, text, color) {
  var u = aizenDlgUuid(server)
  if (u === '') { aizenNote(server, name, text, color); return }
  npcDlgSay(server, u, 'aizen_yanit', name, text, true, t => aizenNote(server, name, t, color))
}

// ------------------------------------------------------------------ Evre etiketleri ve gecikmeli komutlar
function aizenSyncTags(server, p, name) {
  var st = aizenStage(server)
  var want = 'aizen_st_' + st
  if (aizenHas(p, want)) return
  for (var i = 1; i <= 5; i++) {
    if (i !== st) server.runCommandSilent('tag ' + name + ' remove aizen_st_' + i)
  }
  server.runCommandSilent('tag ' + name + ' add ' + want)
}

function aizenLater(ms, cmd) {
  var list = global.aizenTimers
  list.push({ at: Date.now() + ms, cmd: cmd })
}

function aizenTimersTick(server) {
  var list = global.aizenTimers
  // oyun olayın ortasında kapandıysa evre 3'te takılı kalmasın
  if (list.length === 0) {
    if (aizenStage(server) === 4) { server.persistentData.putInt('aizen_evre', 5); aizenApplySkin(server, true); aizenSetPose(server, false) }
    return
  }
  var now = Date.now()
  for (var i = list.length - 1; i >= 0; i--) {
    if (Number(list[i].at) <= now) {
      var cmd = String(list[i].cmd)
      list.splice(i, 1)
      if (cmd === '@home') { aizenGoHome(server) } else if (cmd === '@stage5') { server.persistentData.putInt('aizen_evre', 5) } else if (cmd.indexOf('@') !== 0) server.runCommandSilent(cmd)
      else if (cmd === '@skin2') aizenApplySkin(server, true)
    }
  }
}

function aizenApplySkin(server, villain) {
  // NPC yüklü olmayabilir: kayıtlı konumunun yığını geçici yüklenir, 3 sn sonra yazılır, 4 sn sonra bırakılır
  var pd = server.persistentData
  var hx = Math.floor(Number(pd.getDouble('aizen_hx')))
  var hz = Math.floor(Number(pd.getDouble('aizen_hz')))
  server.runCommandSilent('forceload add ' + hx + ' ' + hz)
  aizenLater(3000, 'data modify entity @e[tag=aizen_npc,limit=1] SkinData set value ' + (villain ? AIZEN_SKIN_2 : AIZEN_SKIN_1))
  aizenLater(3200, 'data modify entity @e[tag=aizen_npc,limit=1] CustomName set value \'{"color":"' + (villain ? '#6A0DAD' : '#8B6F47') + '","text":"Aizen"}\'')
  aizenLater(4500, 'forceload remove ' + hx + ' ' + hz)
}

// ------------------------------------------------------------------ Otomatik ilerleme
// aizen_ms: NPC kurulduktan sonra sunucuda oyuncu varken biriken süre. 'aizen_var' NPC bir kez bulunduğunda 1 olur (NPC yokken sayaç işlemez).
function aizenAdvance(server, dtMs) {
  var pd = server.persistentData
  if (Number(pd.getInt('aizen_var')) !== 1) return
  var st = aizenStage(server)
  if (st >= 4) return
  var ms = Number(pd.getLong('aizen_ms')) + dtMs
  pd.putLong('aizen_ms', ms)
  if (st === 1 && ms >= AIZEN_EVRE1_MS) { pd.putInt('aizen_evre', 2); st = 2 }
  if (st === 2 && ms >= AIZEN_EVRE1_MS + AIZEN_EVRE2_MS) { aizenWound(server); st = 3 }
  if (st === 2 || st === 3) {
    var period = st === 2 ? AIZEN_IPUCU_MS : AIZEN_IPUCU3_MS
    var list = st === 2 ? AIZEN_HINTS : AIZEN_HINTS3
    var key = st === 2 ? 'aizen_hint_i' : 'aizen_hint3_i'
    var hint = Number(pd.getLong('aizen_hint_ms')) + dtMs
    if (hint >= period) {
      hint = 0
      var i = Number(pd.getInt(key))
      var hh = list[i % list.length]
      pd.putInt(key, i + 1)
      server.players.forEach(p => {
        server.runCommandSilent('tellraw ' + String(p.username) + ' [{"text":"' + hh[0] + '","color":"' + hh[1] + '","bold":true},{"text":": ","color":"gray","bold":false},{"text":"' + aizenEsc(hh[2]) + '","color":"white","italic":true,"bold":false}]')
      })
    }
    pd.putLong('aizen_hint_ms', hint)
  }
  if (st === 3 && ms >= AIZEN_EVRE1_MS + AIZEN_EVRE2_MS + AIZEN_EVRE3_MS) aizenBetrayal(server)
}

function aizenStatusText(server) {
  var pd = server.persistentData
  var st = aizenStage(server)
  var ms = Number(pd.getLong('aizen_ms'))
  var h = x => (Math.round(x / 360000) / 10) + ' saat'
  if (Number(pd.getInt('aizen_var')) !== 1) return 'Aizen NPC\'si henüz bulunamadı (kurulmadı ya da hiç yüklenmedi); sayaç işlemiyor.'
  if (st >= 4) return 'Evre ' + st + ' (ihanet gerçekleşti). Toplanan yardım: ' + Number(pd.getInt('aizen_yardim_toplam')) + '.'
  var target = st === 1 ? AIZEN_EVRE1_MS : (st === 2 ? AIZEN_EVRE1_MS + AIZEN_EVRE2_MS : AIZEN_EVRE1_MS + AIZEN_EVRE2_MS + AIZEN_EVRE3_MS)
  var next = st === 1 ? 'evre 2 (şüphe)' : (st === 2 ? 'evre 3 (yaralı)' : 'ihanet')
  return 'Evre ' + st + '. Oynanan süre: ' + h(ms) + ' (' + next + ' için ' + h(Math.max(0, target - ms)) + ' kaldı). Toplanan yardım: ' + Number(pd.getInt('aizen_yardim_toplam')) + '.'
}

// ------------------------------------------------------------------ İhanet olayı (evre 3)
// NPC pozu: Yoruichi'nin 'rest' (yaslanma) pozu; NPC'nin kayıtlı konumunun yığını geçici yüklenir, 3 sn sonra yazılır
function aizenSetPose(server, wounded) {
  var pd = server.persistentData
  var hx = Math.floor(Number(pd.getDouble('aizen_hx')))
  var hz = Math.floor(Number(pd.getDouble('aizen_hz')))
  var p = yoruichiPoseSnbt(wounded)
  var base = 'data modify entity @e[tag=aizen_npc,limit=1] ModelData.'
  server.runCommandSilent('forceload add ' + hx + ' ' + hz)
  aizenLater(3000, base + 'Pose set value "DEFAULT"')
  aizenLater(3100, base + 'PoseName set value "' + p.name + '"')
  aizenLater(3200, base + 'Rotation set value ' + p.rot)
  aizenLater(3300, base + 'Position set value ' + p.pos)
  aizenLater(4800, 'forceload remove ' + hx + ' ' + hz)
}

// Evre 3 başlangıcı: "saldırı" haberi (anime: Aizen'in sahte ölümü). Herkese kısa sahne, NPC yaralı poza geçer.
function aizenWound(server) {
  server.persistentData.putInt('aizen_evre', 3)
  server.persistentData.putLong('aizen_hint_ms', 0)
  server.players.forEach(p => {
    var name = String(p.username)
    cinePlay(server, name, [
      { t: 0, sound: ['minecraft:entity.lightning_bolt.thunder', 0.6, 0.5] },
      { t: 0.3, title: ['AIZEN YARALANDI', 'Caddy\'de bir saldırı oldu', 'dark_red'] },
      { t: 3, note: ['Erwin: "Aizen\'e saldırılmış! Hâlâ nefes alıyor. Kimin yaptığını bulacağız."', 'dark_green'] },
      { t: 6.5, note: ['Kenpachi: "Hah? Kimse ona el kaldırmadı. Bana öyle bakmayın, ben olsam yüzüne bakarım."', 'dark_red'] },
      { t: 10, note: ['Aizen yaralı ve zayıf. Ona yardım getirebilir, yaralarını inceleyebilirsin.', 'gray'] }
    ])
  })
  aizenSetPose(server, true)
}

function aizenBetrayal(server) {
  var pd = server.persistentData
  pd.putInt('aizen_evre', 4)
  // en çok yardım eden
  var top = ''
  var topN = 0
  try {
    var m = JSON.parse(String(pd.getString('aizen_yardim_top')) || '{}')
    Object.keys(m).forEach(k => { if (Number(m[k]) > topN) { topN = Number(m[k]); top = k } })
  } catch (e) { top = '' }
  var total = Number(pd.getInt('aizen_yardim_toplam'))
  server.players.forEach(p => {
    var name = String(p.username)
    var steps = [
      { t: 0, sound: ['minecraft:entity.lightning_bolt.thunder', 0.8, 0.6] },
      { t: 0, cmd: 'effect give {p} minecraft:darkness 12 0 true' },
      { t: 0.4, title: ['CADDY SESSİZLEŞTİ', 'Rüzgâr durdu', 'dark_purple'] },
      { t: 4, note: ['Erwin: "Bu sessizlik... bir şey çok yanlış. Sis bile duruyor."', 'dark_green'] },
      { t: 7, note: ['Kenpachi: "Hah! Sonunda! Maskeni düşür, gözlüklü sinek!"', 'dark_red'] },
      { t: 10, sound: ['minecraft:block.glass.break', 1, 0.5] },
      { t: 10.1, sound: ['minecraft:entity.wither.spawn', 0.5, 0.6] },
      { t: 10.2, title: ['AIZEN', 'Gözlük düştü', 'dark_purple'] },
      { t: 10.2, cmd: 'execute at {p} run particle minecraft:soul ~ ~1 ~ 2 1 2 0.05 60' },
      { t: 10.2, cmd: 'execute at {p} run particle minecraft:end_rod ~ ~1 ~ 3 1.5 3 0.2 60' },
      { t: 13.5, note: ['Aizen: "Yanılsama nasıl bir şey bilir misin? Görmediğin şeyi görmeye başlarsın. Ve gördüğüne inanırsın."', 'dark_purple'] },
      { t: 17.5, note: ['Aizen: "Bu yara hiç yoktu. Bir yastığa uzanıp iyileşmeyi bekleyen bir adamı oynadım, siz de bana ekmek getirdiniz."', 'dark_purple'] },
      { t: 21.5, note: ['Aizen: "Sis\'i ben uyandırdım. Birliği ben kurdurdum. Seferleriniz, ölülerinizle birlikte, benim deneyimdi."', 'dark_purple'] }
    ]
    var t = 25.5
    if (top !== '') {
      steps.push({ t: t, note: ['Aizen: "' + total + ' kez yardım getirildi. En çok yardım eden ' + top + ' idi (' + topN + ' kez). Sana özel bir teşekkürüm var: ilk kanı senin nefesinden alacağım."', 'dark_purple'] })
      t += 4
    }
    var pdp = p.persistentData
    var kanit = Number(pdp.getInt('aizen_kanit'))
    if (kanit >= AIZEN_HEDIYE_KANIT && Number(pdp.getInt('aizen_gozluk')) !== 1) {
      pdp.putInt('aizen_gozluk', 1)
      steps.push({ t: t, note: ['Aizen: "...Ve içinizden birkaçı bu yaraların sahte olduğunu fark etti. Onlara gösterecek bir şeyim yok. Yalnızca... saygı."', 'dark_purple'] })
      steps.push({ t: t + 3, cmd: 'give {p} minecraft:leather_helmet{display:{Name:\'{"text":"Kırık Gözlük","color":"dark_purple","italic":false}\',Lore:[\'{"text":"Aizen adlı âlimin gözlüğü. Şüphelenenlere kalan tek yadigâr.","color":"gray","italic":true}\'],color:6684825},Unbreakable:1b,HideFlags:4} 1' })
      steps.push({ t: t + 3, note: ['"Kırık Gözlük" aldın (kozmetik). Aizen\'in maskesini erken fark eden oyunculara verilir.', 'gold'] })
      t += 5
    }
    steps.push({ t: t + 1, note: ['Aizen artık savaşa hazır. Keşif Birliği\'nde Eşik Muhafızı olanlar ona meydan okuyabilir.', 'gray'] })
    cinePlay(server, name, steps)
  })
  aizenLater(10200, '@skin2')
  aizenSetPose(server, false)
  aizenLater(33000, '@stage5')
}

// ------------------------------------------------------------------ Bilgi, yardım, araştırma, kim
const AIZEN_TIPS = [
  'Keşif Birliği\'nin komutanı Erwin Smith, spawn\'da. Küçük seferlerle başla, adın duyulsun.',
  'Kül Bekçisi olduğuna göre Kakashi Chidori\'nin ilk seviyelerini öğretebilir; Vlorya\'lıysan Yoruichi de Shunpo\'nun ilk adımını gösterir. Thorfinn\'in ambarı da açıldı.',
  'Ticaret sabır işidir: Thorfinn\'in hasat, nöbet ve ikmal işleri cebini doldurur. Erwin\'in seferleri ise asıl gelir.',
  'Itachi artık Amaterasu\'yu öğretecek kadar yeteneğini görüyor. Kenpachi\'ye meydan okumak için de yetiyorsun.',
  'Neredeyse hepsini gördün. Tsukiyomi\'yi Itachi öğretir. Bazı kapılar hâlâ kapalı, ama kapalı kapıların ardında ne olduğu merak edilmeli.'
]
const AIZEN_TIP_ODD = [
  ' Bunları sana neden söylüyorum, biliyor musun? Çünkü gözlemek benim işim.',
  ' Herkes kendi yolunu seçtiğini sanır. Hoş bir yanılgı.',
  ' Yardımım karşılıksız değil; yalnızca bedelini henüz söylemedim.'
]

function aizenInfo(server, p, name) {
  var rank = Number(erwinRank(p))
  var text = AIZEN_TIPS[Math.min(4, rank)]
  if (aizenStage(server) === 2) text += aizenPick(AIZEN_TIP_ODD)
  aizenSayDlg(server, name, text)
}

function aizenHelp(server, p, name) {
  var pd = p.persistentData
  var left = Number(pd.getLong('aizen_help_next')) - Date.now()
  if (left > 0) {
    aizenSayDlg(server, name, 'Bugünkü çayın hazır olması için ' + Math.ceil(left / 60000) + ' dakika daha bekle. Fazlası zarar verir.')
    return
  }
  server.runCommandSilent('effect give ' + name + ' minecraft:regeneration 30 1 true')
  server.runCommandSilent('effect give ' + name + ' minecraft:saturation 5 0 true')
  pd.putLong('aizen_help_next', Date.now() + 6 * 3600000)
  aizenSayDlg(server, name, aizenStage(server) === 2 ? 'İç. Çay yalnızca bedeni iyileştirir; zihni değil. O konuda sana güveniyorum.' : 'İç, sana iyi gelecek. Zor günlerde bir fincan çay çok şey değiştirir.')
  aizenLineDlg(server, name, 'Aizen\'in çayı: 30 sn yenilenme ve doygunluk.', 'gold')
}

const AIZEN_TASKS = [
  { key: 'zombi', label: 'zombi', n: [10, 14], targets: () => EG_ZOMBIES },
  { key: 'iskelet', label: 'iskelet', n: [8, 12], targets: () => EG_SKELETONS },
  { key: 'orumcek', label: 'örümcek', n: [8, 12], targets: () => EG_SPIDERS },
  { key: 'creeper', label: 'creeper', n: [5, 7], targets: () => EG_CREEPERS },
  { key: 'enderman', label: 'enderman', n: [3, 5], targets: () => EG_ENDERMEN },
  { key: 'yagmaci', label: 'yağmacı', n: [6, 9], targets: () => EG_ILLAGERS },
  { key: 'mezarlik', label: 'mezarlık yaratığı', n: [5, 7], targets: () => EG_GRAVEYARD }
]
const AIZEN_TASK_BY_KEY = {}
AIZEN_TASKS.forEach(t => { AIZEN_TASK_BY_KEY[t.key] = t })
// Notlar: tamamlanan araştırma sayısına göre açılır. İlk ikisi masum, sonrakiler giderek tuhaflaşır.
const AIZEN_NOTES = {
  1: 'Aizen\'in defteri, sayfa 1: "Sis her gece biraz daha yaklaşıyor. Kimse bunun neden olduğunu sormuyor; herkes nasıl durduracağını soruyor. İlk hata bu."',
  3: 'Sayfa 2: "İnsanlar tehdit karşısında birbirine tutunur. Bu yüzden Birlik kuruldu, bu yüzden rütbeler var. Güven, en ucuz silahtır."',
  5: 'Sayfa 3: "Bir sefer, bir ölüm, bir veri. Her yenilgi, sonuçlar tablomdaki bir satır."',
  8: 'Sayfa 4: "Kyōka Suigetsu bir şeyi göstermez; sana gösterdiğim şeyi gerçek sandırır. Aradaki fark, ömürleri belirler."',
  12: 'Sayfa 5: "Bir yardımı kabul etmek, bir borç imzalamaktır. Onlar imzaladı, üstelik teşekkür ettiler."',
  16: 'Sayfa 6: "Düzeni kimin yazdığını soran ilk kişi ben olacağım. Cevabı bulduğumda gülmeyeceğim: çünkü hep bendim."'
}

function aizenTaskActive(p) { return String(p.persistentData.getString('aizen_r_key')) !== '' }

function aizenResearch(server, p, name) {
  var pd = p.persistentData
  if (aizenTaskActive(p)) {
    var have = Number(pd.getInt('aizen_r_have'))
    var need = Number(pd.getInt('aizen_r_need'))
    if (have >= need) { aizenResearchReward(server, p, name); return }
    aizenSayDlg(server, name, 'Gözlemin sürüyor: ' + have + '/' + need + ' ' + String(pd.getString('aizen_r_label')) + '. Bitirince bana dön.')
    return
  }
  var day = Math.floor(Date.now() / 86400000)
  if (Number(pd.getInt('aizen_r_day')) !== day) { pd.putInt('aizen_r_day', day); pd.putInt('aizen_r_day_count', 0) }
  if (Number(pd.getInt('aizen_r_day_count')) >= 5) {
    aizenSayDlg(server, name, 'Bugünlük yeter. Fazla gözlem, gözlemcinin de zihnini yorar.')
    return
  }
  var left = Number(pd.getLong('aizen_r_next')) - Date.now()
  if (left > 0) {
    aizenSayDlg(server, name, 'Acele etme. ' + Math.ceil(left / 60000) + ' dakika sonra yeni bir gözlem hazır olur.')
    return
  }
  var t = aizenPick(AIZEN_TASKS)
  var n = aizenRand(t.n[0], t.n[1])
  pd.putString('aizen_r_key', t.key)
  pd.putString('aizen_r_label', t.label)
  pd.putInt('aizen_r_need', n)
  pd.putInt('aizen_r_have', 0)
  aizenSayDlg(server, name, 'Bir gözlem: ' + n + ' ' + t.label + ' karşılaş ve alt et. Sayıları not edeceğim. Bitince gel.')
  aizenLineDlg(server, name, 'Araştırma: ' + n + ' ' + t.label + '. Bitince Aizen\'e dön.', 'gold')
}

function aizenResearchReward(server, p, name) {
  var pd = p.persistentData
  var em = aizenRand(1, 2)
  server.runCommandSilent('give ' + name + ' minecraft:emerald ' + em)
  pd.putString('aizen_r_key', '')
  var total = Number(pd.getInt('aizen_r_total')) + 1
  pd.putInt('aizen_r_total', total)
  pd.putInt('aizen_r_day_count', Number(pd.getInt('aizen_r_day_count')) + 1)
  pd.putLong('aizen_r_next', Date.now() + 240000)
  aizenSayDlg(server, name, 'Sayılar tam. Sağ ol. Bu, emeğin karşılığı: ' + em + ' zümrüt.')
  cinePlay(server, name, [{ t: 0, sound: ['minecraft:block.enchantment_table.use', 0.8, 1.3] }, { t: 0.2, title: ['GÖZLEM TAMAM', '+' + em + ' zümrüt', 'gold'] }])
  if (AIZEN_NOTES[total]) aizenLineDlg(server, name, AIZEN_NOTES[total], 'dark_aqua')
}

function aizenTaskDeath(event) {
  var src = event.source.actual
  if (!src || !src.isPlayer()) return
  if (!aizenTaskActive(src)) return
  var pd = src.persistentData
  if (Number(pd.getInt('aizen_r_have')) >= Number(pd.getInt('aizen_r_need'))) return
  var t = AIZEN_TASK_BY_KEY[String(pd.getString('aizen_r_key'))]
  if (!t) return
  if (t.targets().indexOf(String(event.entity.type)) < 0) return
  var have = Number(pd.getInt('aizen_r_have')) + 1
  pd.putInt('aizen_r_have', have)
  var name = String(src.username)
  if (have >= Number(pd.getInt('aizen_r_need'))) {
    aizenNote(src.server, name, 'Gözlem tamam! Aizen\'e dön.', 'gold')
    src.server.runCommandSilent('playsound minecraft:block.note_block.chime master ' + name + ' ~ ~ ~ 1 1.5')
  } else {
    src.server.runCommandSilent('title ' + name + ' actionbar {"text":"Gözlem: ' + have + '/' + Number(pd.getInt('aizen_r_need')) + ' ' + aizenEsc(String(pd.getString('aizen_r_label'))) + '","color":"gold"}')
  }
}

function aizenBring(server, p, name) {
  var pd = p.persistentData
  var day = Math.floor(Date.now() / 86400000)
  if (Number(pd.getInt('aizen_g_day')) !== day) { pd.putInt('aizen_g_day', day); pd.putInt('aizen_g_day_count', 0) }
  if (Number(pd.getInt('aizen_g_day_count')) >= AIZEN_GETIR_GUNLUK) {
    aizenSayDlg(server, name, 'Yeter... bugünlük bu kadar. Nefes almak bile zor. Yarın... yine yardım edersin.')
    return
  }
  var left = Number(pd.getLong('aizen_g_next')) - Date.now()
  if (left > 0) {
    aizenSayDlg(server, name, 'Biraz... dinlenmem lazım. ' + Math.ceil(left / 60000) + ' dakika sonra tekrar gel.')
    return
  }
  var have = 0
  try { have = Number(p.inventory.count(AIZEN_GETIR_ITEM)) } catch (e) { have = 0 }
  if (isNaN(have) || have < AIZEN_GETIR_N) {
    aizenSayDlg(server, name, 'Ekmek... ' + AIZEN_GETIR_N + ' ekmek yeter. Karnım aç, kuvvetim yok. (sende ' + (isNaN(have) ? 0 : have) + ' var)')
    return
  }
  server.runCommandSilent('clear ' + name + ' ' + AIZEN_GETIR_ITEM + ' ' + AIZEN_GETIR_N)
  server.runCommandSilent('give ' + name + ' minecraft:emerald 1')
  pd.putLong('aizen_g_next', Date.now() + AIZEN_GETIR_MS)
  pd.putInt('aizen_g_day_count', Number(pd.getInt('aizen_g_day_count')) + 1)
  var sd = server.persistentData
  sd.putInt('aizen_yardim_toplam', Number(sd.getInt('aizen_yardim_toplam')) + 1)
  try {
    var m = JSON.parse(String(sd.getString('aizen_yardim_top')) || '{}')
    m[name] = Number(m[name] || 0) + 1
    sd.putString('aizen_yardim_top', JSON.stringify(m))
  } catch (e) { sd.putString('aizen_yardim_top', '{}') }
  aizenSayDlg(server, name, aizenPick(['Teşekkür ederim... Sen çok iyi birisin. Bunu unutmayacağım.', 'İyi ki varsın. Bu... çok işime yaradı.', 'Ekmek... ne güzel. Sana borçluyum.']))
  aizenLineDlg(server, name, 'Aizen\'in şükranı: 1 zümrüt. (Sunucu geneli toplam yardım: ' + Number(sd.getInt('aizen_yardim_toplam')) + ')', 'gold')
}

function aizenExamine(server, p, name) {
  var pd = p.persistentData
  var i = Number(pd.getInt('aizen_kanit'))
  if (i >= AIZEN_INCELE.length) {
    aizenLineDlg(server, name, 'Aizen\'in yaralarını her yönüyle inceledin. Başka bir şey bulamıyorsun; ama bulduklarını ciddiye al.', 'dark_gray')
    return
  }
  aizenLineDlg(server, name, 'İnceleme ' + (i + 1) + '/' + AIZEN_INCELE.length + ': ' + AIZEN_INCELE[i], 'dark_aqua')
  pd.putInt('aizen_kanit', i + 1)
  if (i + 1 === AIZEN_HEDIYE_KANIT) aizenLineDlg(server, name, 'Bir şey ters... Bu yaralar sahte olabilir. Ama henüz kanıt yetmez.', 'yellow')
}

function aizenWho(server, p, name) {
  if (aizenStage(server) === 3) {
    aizenSayDlg(server, name, aizenPick(['Kim... yaptı? Bilmiyorum. Karanlıktı. Yalnızca bir gölge... Sonra acı.', 'Bir saldırı... Nefesimi kesti. Birlik... beni korumuyordu. Kimse yoktu.']))
    return
  }
  var firstBy = String(server.persistentData.getString('aizen_ilk_yenen'))
  if (aizenStage(server) >= 5) {
    var l = [
      'Ben Aizen. Bu topraklara düzeni getiren, sana yardım eden, sana yol gösteren. Yani hepsi. Ve hiçbiri; çünkü hepsi yalandı.',
      'Bir gözlemci, bir yazar, bir kukla ustası. İstediğin adı seç; hepsi doğru.'
    ]
    if (firstBy !== '') l.push('Beni ilk yenen ' + firstBy + ' idi. Bunu unutmadım; benim de hafızam bir hediyedir.')
    aizenSayDlg(server, name, aizenPick(l))
    return
  }
  aizenSayDlg(server, name, aizenPick([
    'Yalnızca bir âlimim. Kitaplar, notlar, gözlemler... Dünya nasıl işliyor, onu anlamaya çalışıyorum.',
    'Adım Aizen. Bilgiyle uğraşırım ve bilgiyi paylaşmayı severim. Sis\'in kaynağını anlamaya çalışıyorum; Birliğe bu yüzden yardım ediyorum.'
  ]))
}

function aizenSuspicion(server, p, name) {
  var pd = p.persistentData
  pd.putInt('aizen_s_count', Number(pd.getInt('aizen_s_count')) + 1)
  var total = Number(pd.getInt('aizen_r_total'))
  if (Number(pd.getInt('aizen_s_count')) >= 3 && total >= 8) {
    aizenSayDlg(server, name, 'Zeki birisin. Bunu başkasına söyleme. Henüz zamanı değil.')
    return
  }
  aizenSayDlg(server, name, aizenPick([
    'Hm? Ne fark ettin? Belki yorgunsun. Bir çay iyi gelir.',
    'Merak, insanı ya bilgeye ya deliye çevirir. Sen henüz hangisi olduğuna karar vermemişsin gibi.',
    'Bazen bir şey fark ettiğini sanırsın; aslında sana fark ettirilmiştir. Bunu düşün.'
  ]))
}

function aizenWhy(server, p, name) {
  aizenSayDlg(server, name, aizenPick([
    'Sis\'i ben uyandırdım. Bu topraklar bir düzenin taklidiydi: krallar, rütbeler, kediler... Ben yalnızca düzeni kimin yazdığını sormanın yolunu kapattım.',
    'Erwin\'in Birliği Sis\'le savaşırken toplanan her veri, her sefer, her ölüm benim deneyimdi. Siz zümrüt için savaşırken ben cesaretinizi ölçtüm.',
    'Çay içtin, notları okudun, gözlem yaptın. Her gözlem, planımın eksik parçasını tamamladı. Teşekkür ederim.'
  ]))
}

// ------------------------------------------------------------------ Boss kapışması (evre 4)
const AIZEN_HP = 450
const AIZEN_ARMOR = 10
const AIZEN_RANK = 4
const AIZEN_MAX_MS = 900000
const AIZEN_ARENA_R = 160

function aizenNpcPos(server) {
  var found = null
  try {
    var it = server.overworld().getAllEntities().iterator()
    while (it.hasNext()) {
      var e = it.next()
      var tg = false
      e.getTags().forEach(t => { if (String(t) === 'aizen_npc') tg = true })
      if (tg) { found = e; break }
    }
  } catch (err) { found = null }
  return found
}

function aizenHide(server, hide) {
  if (hide) {
    var e = aizenNpcPos(server)
    if (e) {
      server.persistentData.putDouble('aizen_hx', Number(e.x))
      server.persistentData.putDouble('aizen_hy', Number(e.y))
      server.persistentData.putDouble('aizen_hz', Number(e.z))
      server.runCommandSilent('execute as @e[tag=aizen_npc] run tp @s ' + Number(e.x) + ' -58 ' + Number(e.z))
    }
  } else {
    var pd = server.persistentData
    server.runCommandSilent('execute as @e[tag=aizen_npc] run tp @s ' + Number(pd.getDouble('aizen_hx')) + ' ' + Number(pd.getDouble('aizen_hy')) + ' ' + Number(pd.getDouble('aizen_hz')))
  }
}

function aizenFighterEntity(server, uuidStr) {
  try { return server.overworld().getEntity(Java.loadClass('java.util.UUID').fromString(String(uuidStr))) } catch (e) { return null }
}

function aizenIntsOf(uuid) {
  var hex = String(uuid.toString()).split('-').join('')
  var out = []
  for (var i = 0; i < 4; i++) out.push(parseInt(hex.substring(i * 8, i * 8 + 8), 16) | 0)
  return out
}

function aizenChallenge(server, p, name) {
  var pd = p.persistentData
  if (aizenStage(server) < 5) {
    aizenSayDlg(server, name, 'Bana meydan mı okuyorsun? Ne için? Ben yalnızca bir âlimim.')
    return
  }
  if (global.aizenFight) {
    aizenSayDlg(server, name, 'Şu an başka biriyle ilgileniyorum. Sıranı bekle.')
    return
  }
  var left = Number(pd.getLong('aizen_next')) - Date.now()
  if (left > 0) {
    aizenSayDlg(server, name, 'Yenilgiden yeni çıktın. Dinlen; ' + Math.ceil(left / 60000) + ' dakika sonra gel.')
    return
  }
  if (Number(erwinRank(p)) < AIZEN_RANK) {
    aizenSayDlg(server, name, 'Seninle savaşmak için henüz erken. Keşif Birliği\'nde Eşik Muhafızı ol; o zaman gerçekten bir savaş olur.')
    return
  }
  var steps = [
    { t: 0, sound: ['minecraft:entity.wither.ambient', 0.8, 0.5] },
    { t: 0, cmd: 'effect give {p} minecraft:darkness 6 0 true' },
    { t: 0.3, title: ['AIZEN', 'Yanılsamanın Efendisi', 'dark_purple'] },
    { t: 2, sound: ['minecraft:block.beacon.deactivate', 1, 0.6] },
    { t: 2.5, note: ['Aizen: "Bu bile bir oyundu, değil mi? Peki. Bu son perdeyi birlikte oynayalım."', 'dark_purple'] },
    { t: 5.5, fn: 'aizenFightBegin' }
  ]
  pd.putLong('aizen_next', Date.now() + 60000)
  global.aizenIntro = name
  cinePlay(server, name, steps)
}

function aizenFightBegin(server, p, name) {
  if (global.aizenFight) return
  global.aizenIntro = ''
  var uuid = Java.loadClass('java.util.UUID').randomUUID()
  var ints = aizenIntsOf(uuid)
  var nbt = '{UUID:[I;' + ints.join(',') + '],CustomName:\'{"color":"#6A0DAD","text":"Aizen"}\',CustomNameVisible:1b,Tags:["aizen_fighter","korunan"],' +
    'PersistenceRequired:1b,EasyNPCVersion:3,Health:' + AIZEN_HP + 'f,' +
    'Attributes:[{Name:"minecraft:generic.max_health",Base:' + AIZEN_HP + 'd},{Name:"minecraft:generic.armor",Base:' + AIZEN_ARMOR + 'd},{Name:"minecraft:generic.knockback_resistance",Base:1d}],' +
    'EntityAttribute:{IsInvulnerable:0b,IsImmovable:0b,IsPushable:0b,PushEntities:0b,IsKnockbackResistant:1b,IsAttackableByPlayers:1b,IsAttackableByMonsters:0b,IsExplosionResistant:0b},' +
    'SkinData:' + AIZEN_SKIN_2 + ',HandItems:[{id:"minecraft:iron_sword",Count:1b},{}]}'
  aizenHide(server, true)
  var pd = server.persistentData
  server.runCommandSilent('execute in minecraft:overworld run summon easy_npc:humanoid ' + Number(pd.getDouble('aizen_hx')) + ' ' + Number(pd.getDouble('aizen_hy')) + ' ' + Number(pd.getDouble('aizen_hz')) + ' ' + nbt)
  global.aizenFight = { name: name, uuid: String(uuid), start: Date.now(), phase: 1, nextHit: Date.now() + 2500, nextKido: Date.now() + 5000, nextShunpo: Date.now() + 4000, nextIllusion: Date.now() + 22000, nextKuro: Date.now() + 15000, nextSay: Date.now() + 14000, kuro: false, decoyUntil: 0 }
  aizenSay(server, name, 'Güzel. Şimdi izle. Ve gözlerine güvenme.')
}

function aizenFightEnd(server, won, reason) {
  var f = global.aizenFight
  if (!f) return
  global.aizenFight = false
  var name = String(f.name)
  if (aizenFighterEntity(server, f.uuid)) server.runCommandSilent('kill ' + f.uuid)
  server.runCommandSilent('kill @e[tag=aizen_decoy]')
  aizenHide(server, false)
  server.runCommandSilent('effect clear ' + name + ' minecraft:blindness')
  server.runCommandSilent('effect clear ' + name + ' minecraft:nausea')
  var p = null
  server.players.forEach(o => { if (String(o.username) === name) p = o })
  if (p) {
    p.persistentData.putLong('aizen_next', Date.now() + (won ? 600000 : 180000))
    if (!won) aizenSay(server, name, reason || 'Bu kadar mı? Gerçekten bir oyun sanmıştım.')
  }
}

function aizenSpellReady() {
  try {
    var SR = Java.loadClass('io.redspace.ironsspellbooks.api.registry.SpellRegistry')
    var RL = Java.loadClass('net.minecraft.resources.ResourceLocation')
    return String(SR.getSpell(new RL('kubejs', 'kyoka_suigetsu')).getSpellId()) === 'kubejs:kyoka_suigetsu'
  } catch (e) { return false }
}

function aizenFightWin(server) {
  var f = global.aizenFight
  if (!f) return
  var name = String(f.name)
  var p = null
  server.players.forEach(o => { if (String(o.username) === name) p = o })
  aizenFightEnd(server, true)
  if (!p) return
  var pd = p.persistentData
  var steps = [
    { t: 0, sound: ['minecraft:entity.player.levelup', 1, 0.5] },
    { t: 0.3, title: ['AIZEN YENİLDİ', 'Yanılsama dağıldı', 'gold'] },
    { t: 2, note: ['Aizen: "...Ne ilginç. Bu ihtimali hesaba katmamıştım. Fena değil."', 'dark_purple'] }
  ]
  if (String(server.persistentData.getString('aizen_ilk_yenen')) === '') {
    server.persistentData.putString('aizen_ilk_yenen', name)
    server.players.forEach(o => {
      var on = String(o.username)
      cinePlay(server, on, [{ t: 0, sound: ['minecraft:ui.toast.challenge_complete', 1, 0.8] }, { t: 0.3, title: ['AIZEN İLK KEZ YENİLDİ', name, 'gold'] }, { t: 3, note: [name + ' Aizen\'i ilk kez yendi. Caddy bu zaferi hatırlayacak.', 'gold'] }])
    })
  }
  var first = Number(pd.getInt('aizen_yenildi')) !== 1
  if (first && aizenSpellReady()) {
    pd.putInt('aizen_yenildi', 1)
    server.runCommandSilent('give ' + name + ' irons_spellbooks:scroll{"irons_spellbooks:spell_container":{data:[{id:"kubejs:kyoka_suigetsu",index:0,level:1,locked:1b}],maxSpells:1,mustEquip:0b,spellWheel:0b}} 1')
    steps.push({ t: 5, note: ['Aizen: "Al. Kyōka Suigetsu. Yanılsama artık senin. Onunla kimi kandırdığına dikkat et."', 'dark_purple'] })
    steps.push({ t: 5.5, note: ['Kyōka Suigetsu parşömenini aldın.', 'gold'] })
  } else if (first) {
    server.runCommandSilent('give ' + name + ' minecraft:emerald 12')
    steps.push({ t: 5, note: ['Kyōka Suigetsu büyüsü henüz kayıtlı değil (oyunu tamamen yeniden başlatmadın). Şimdilik 12 zümrüt; yeniden başlattıktan sonra yönetici /aizen_odul <oyuncu> ile parşömeni verebilir.', 'gray'] })
  } else {
    server.runCommandSilent('give ' + name + ' minecraft:emerald 5')
    steps.push({ t: 5, note: ['Aizen: "Tekrar mı? Teselli olarak 5 zümrüt."', 'dark_purple'] })
  }
  cinePlay(server, name, steps)
}

var aizenFightPhase = 0

function aizenFightTick(server) {
  var f = global.aizenFight
  if (!f) return
  var name = String(f.name)
  var p = null
  server.players.forEach(o => { if (String(o.username) === name) p = o })
  var e = aizenFighterEntity(server, f.uuid)
  var now = Date.now()
  if (!p || p.health <= 0) { aizenFightEnd(server, false, 'Yere serildin bile. Sıkıcı.'); return }
  if (!e) {
    if (now - Number(f.start) > 4000) aizenFightEnd(server, false, 'Kaçtın mı? Yanılsamadan çıkmak kolay değildir.')
    return
  }
  if (now - Number(f.start) > AIZEN_MAX_MS) { aizenFightEnd(server, false, 'Vakit doldu. Perde kapandı.'); return }
  var pd = server.persistentData
  var home = { x: Number(pd.getDouble('aizen_hx')), z: Number(pd.getDouble('aizen_hz')) }
  if (Math.sqrt(Math.pow(Number(p.x) - home.x, 2) + Math.pow(Number(p.z) - home.z, 2)) > AIZEN_ARENA_R) { aizenFightEnd(server, false, 'Kaçmak mı? Yanılsamadan kaçılmaz.'); return }
  var dx = Number(p.x) - Number(e.x)
  var dz = Number(p.z) - Number(e.z)
  var dist = Math.sqrt(dx * dx + dz * dz)
  var dy = Math.abs(Number(p.y) - Number(e.y))
  var hp = Number(e.health)
  // evreler: %66 ve %33
  var phase = hp < AIZEN_HP / 3 ? 3 : (hp < AIZEN_HP * 2 / 3 ? 2 : 1)
  if (phase > Number(f.phase)) {
    f.phase = phase
    if (phase === 2) {
      cinePlay(server, name, [{ t: 0, sound: ['minecraft:entity.evoker.prepare_summon', 1, 0.6] }, { t: 0.2, title: ['KYŌKA SUIGETSU', 'Yanılsama başlıyor', 'dark_purple'] }, { t: 2, note: ['Aizen: "Şimdi ne gördüğünden emin misin?"', 'dark_purple'] }])
    } else {
      cinePlay(server, name, [{ t: 0, sound: ['minecraft:entity.ender_dragon.growl', 1, 0.5] }, { t: 0.2, title: ['KUROHITSUGI', 'Kara tabut', 'dark_purple'] }, { t: 2, note: ['Aizen: "Bu son perde. Kaçabilirsen kaç."', 'dark_purple'] }])
    }
  }
  // yönel ve yaklaş
  var speed = phase === 1 ? 0.3 : 0.4
  server.runCommandSilent('execute as ' + f.uuid + ' at @s facing entity ' + name + ' feet rotated ~ 0 run tp @s ~ ~ ~ ~ 0')
  if (dist > 4.2 && dist < 40 && dy < 6) server.runCommandSilent('execute as ' + f.uuid + ' at @s facing entity ' + name + ' feet rotated ~ 0 run tp @s ^ ^ ^' + speed)
  // Shunpo (Kenpachi'ninkine benzer): uzaklaşırsan arkana
  if ((dist > 12 || dy > 6) && now >= Number(f.nextShunpo)) {
    var fe = aizenFighterEntity(server, f.uuid)
    var pl = server.getPlayer(name)
    if (fe && pl) {
      var bp = npcShunpoPoint(pl, -2.6)
      npcShunpoTo(server, fe, bp.x, bp.y, bp.z, name)
    }
    f.nextShunpo = now + 3500
    return
  }
  // yakın vuruş
  if (dist <= 4.2 && dy <= 3 && now >= Number(f.nextHit)) {
    var dmg = phase === 3 ? 10 : 8
    server.runCommandSilent('damage ' + name + ' ' + dmg + ' minecraft:mob_attack by ' + f.uuid)
    server.runCommandSilent('execute at ' + name + ' run particle minecraft:sweep_attack ~ ~1 ~ 0.2 0.2 0.2 0 1')
    server.runCommandSilent('execute at ' + name + ' run playsound minecraft:entity.player.attack.sweep master ' + name + ' ~ ~ ~ 1 0.7')
    f.nextHit = now + 1600
  }
  // Kido: uzaktan büyü ışını (5-14 blok)
  if (dist > 5 && dist < 14 && now >= Number(f.nextKido)) {
    server.runCommandSilent('damage ' + name + ' 6 minecraft:magic by ' + f.uuid)
    ;[2, 4, 6, 8, 10].forEach(d => {
      if (d < dist) server.runCommandSilent('execute as ' + f.uuid + ' at @s facing entity ' + name + ' eyes run particle minecraft:end_rod ^ ^1.5 ^' + d + ' 0.1 0.1 0.1 0.02 6')
    })
    server.runCommandSilent('execute at ' + name + ' run particle minecraft:dust 0.6 0.1 0.9 2 ~ ~1 ~ 0.3 0.5 0.3 0 25')
    server.runCommandSilent('execute at ' + name + ' run playsound minecraft:entity.blaze.shoot master ' + name + ' ~ ~ ~ 1 1.4')
    f.nextKido = now + 4000
  }
  // Kyōka Suigetsu (evre 2+): kopyalar ve yanılsama
  if (phase >= 2 && now >= Number(f.nextIllusion)) {
    server.runCommandSilent('effect give ' + name + ' minecraft:nausea 5 0 true')
    server.runCommandSilent('effect give ' + name + ' minecraft:blindness 2 0 true')
    server.runCommandSilent('effect give ' + f.uuid + ' minecraft:invisibility 6 0 true')
    for (var i = 0; i < 3; i++) {
      server.runCommandSilent('execute at ' + name + ' run summon minecraft:zombie ~' + aizenRand(-7, 7) + ' ~ ~' + aizenRand(-7, 7) + ' {CustomName:\'{"text":"Aizen","color":"dark_purple"}\',CustomNameVisible:1b,NoAI:1b,Silent:1b,PersistenceRequired:1b,Glowing:1b,IsBaby:0b,Health:1f,Attributes:[{Name:"minecraft:generic.max_health",Base:1d}],DeathLootTable:"minecraft:empty",ActiveEffects:[{Id:12,Amplifier:0,Duration:400,ShowParticles:0b}],Tags:["aizen_decoy","korunan"]}')
    }
    server.runCommandSilent('execute at ' + name + ' rotated as ' + name + ' run tp ' + f.uuid + ' ^ ^ ^-2.2')
    f.decoyUntil = now + 10000
    f.nextIllusion = now + 22000
    aizenSay(server, name, aizenPick(['Hangisi gerçek?', 'Gördüğün, benim gösterdiğimdir.', 'Doğru olanı seçebilir misin?']))
  }
  if (Number(f.decoyUntil) > 0 && now >= Number(f.decoyUntil)) {
    server.runCommandSilent('kill @e[tag=aizen_decoy]')
    f.decoyUntil = 0
  }
  // Kurohitsugi (evre 3): işaretlenen noktadan 2 sn içinde kaç
  if (phase >= 3) {
    if (!f.kuro && now >= Number(f.nextKuro)) {
      f.kuro = { x: Number(p.x), y: Number(p.y), z: Number(p.z), at: now + 2200 }
      server.runCommandSilent('execute at ' + name + ' run particle minecraft:dust 0.1 0.0 0.1 3 ~ ~0.2 ~ 3 0.1 3 0 80')
      server.runCommandSilent('execute at ' + name + ' run playsound minecraft:block.beacon.power_select master ' + name + ' ~ ~ ~ 1 0.6')
      aizenNote(server, name, 'Kurohitsugi! Bulunduğun yerden uzaklaş!', 'dark_purple')
    } else if (f.kuro && now >= Number(f.kuro.at)) {
      var kd = Math.sqrt(Math.pow(Number(p.x) - f.kuro.x, 2) + Math.pow(Number(p.z) - f.kuro.z, 2))
      server.runCommandSilent('particle minecraft:dust 0.1 0.0 0.1 3 ' + f.kuro.x + ' ' + (f.kuro.y + 1) + ' ' + f.kuro.z + ' 2 2 2 0 120 force')
      server.runCommandSilent('particle minecraft:explosion ' + f.kuro.x + ' ' + (f.kuro.y + 1) + ' ' + f.kuro.z + ' 1 1 1 0 6 force')
      if (kd <= 4.5) {
        server.runCommandSilent('damage ' + name + ' 14 minecraft:magic by ' + f.uuid)
        server.runCommandSilent('effect give ' + name + ' minecraft:slowness 3 1 true')
      }
      f.kuro = false
      f.nextKuro = now + 15000
    }
  }
  if (now >= Number(f.nextSay)) {
    aizenSay(server, name, aizenPick(['Hâlâ ayaktasın. Şaşırtıcı.', 'Her adımın benim gözlemimdeydi.', 'Bunu bekliyordum, ama yine de eğlenceli.']))
    f.nextSay = now + 20000 + aizenRand(0, 8000)
  }
}

// ------------------------------------------------------------------ Shunpo ile yanına gelme
// Evre 1-2: oyuncu Aizen'in duruş noktasının yakınına gelip ondan uzak durursa, Aizen Shunpo ile (duman ve iz) önüne gelir, kısa bir söz söyler,
// 30 sn sonra yine Shunpo ile yerine döner. Oyuncu başına 20 dakikada bir; aynı anda tek gezinti. Evre 3 ve sonrasında yapılmaz.
function aizenShunpoFx(server, sel) {
  server.runCommandSilent('execute at ' + sel + ' run particle minecraft:smoke ~ ~1 ~ 0.3 0.6 0.3 0.05 20')
  server.runCommandSilent('execute at ' + sel + ' run particle minecraft:end_rod ~ ~1 ~ 0.2 0.5 0.2 0.02 6')
  server.runCommandSilent('execute at ' + sel + ' run playsound minecraft:entity.enderman.teleport master @a ~ ~ ~ 0.8 1.7')
}

const AIZEN_GEZ_1 = ['Ah, seni görmek güzel. Yolun buraya düşmüş, ne şans.', 'Yolcu... Bir fincan çay içmek ister misin? Konuşacak çok şey var.', 'Yorgun görünüyorsun. Gel, bir dakika otur.']
const AIZEN_GEZ_2 = ['Bir şey soracaktım... Ama sanırım cevabı zaten biliyorsun.', 'Beni görmeden geçemezdin, değil mi? Çünkü bazı yolların sonu hep aynı yere çıkar.', 'Sürekli buradasın. Çok ilginç bir tesadüf.']

function aizenWander(server, p, name) {
  var st = aizenStage(server)
  if (st > 2) return
  if (global.aizenFight || global.aizenIntro) return
  var w = global.aizenWander
  if (w && Number(w.until) > Date.now()) return
  var pd = p.persistentData
  if (Number(pd.getLong('aizen_wander_next')) > Date.now()) return
  var sd = server.persistentData
  if (Number(sd.getInt('aizen_var')) !== 1) return
  var hx = Number(sd.getDouble('aizen_hx'))
  var hz = Number(sd.getDouble('aizen_hz'))
  var dHome = Math.sqrt(Math.pow(Number(p.x) - hx, 2) + Math.pow(Number(p.z) - hz, 2))
  // yalnızca yakın (3,5-6 blok) ve aynı kat (en çok 3 blok yükseklik farkı): merdivenden çıkmadan aşağı inmesin, uzağa gitmesin
  if (dHome < 3.5 || dHome > 6) return
  if (Math.abs(Number(p.y) - Number(sd.getDouble('aizen_hy'))) > 3) return
  // oyuncu yakın ve NPC uzakta: Shunpo
  var npcE = aizenNpcPos(server)
  if (!npcE) return
  var dest = npcShunpoPoint(p, 2.8)
  npcShunpoTo(server, npcE, dest.x, dest.y, dest.z, name)
  aizenSay(server, name, aizenPick(st === 1 ? AIZEN_GEZ_1 : AIZEN_GEZ_2))
  pd.putLong('aizen_wander_next', Date.now() + AIZEN_GEZ_MS)
  global.aizenWander = { until: Date.now() + 30000, home: true }
  aizenLater(30000, '@home')
}

function aizenGoHome(server) {
  var sd = server.persistentData
  var npcE = aizenNpcPos(server)
  if (npcE) npcShunpoTo(server, npcE, Number(sd.getDouble('aizen_hx')), Number(sd.getDouble('aizen_hy')), Number(sd.getDouble('aizen_hz')), '')
  global.aizenWander = false
}

// ------------------------------------------------------------------ Ana döngü
var aizenPhase = 0

ServerEvents.tick(event => {
  var server = event.server
  aizenPhase++
  if (aizenPhase % 2 === 0 && global.aizenFight) {
    try { aizenFightTick(server) } catch (e) { console.error('aizen kapisma hata: ' + e); aizenFightEnd(server, false) }
  }
  if (aizenPhase % 200 === 0 && !global.aizenFight && !global.aizenIntro) {
    server.runCommandSilent('kill @e[tag=aizen_fighter]')
    server.runCommandSilent('kill @e[tag=aizen_decoy]')
    server.runCommandSilent('execute as @e[tag=aizen_npc,y=-70,dy=30] run tp @s ' + Number(server.persistentData.getDouble('aizen_hx')) + ' ' + Number(server.persistentData.getDouble('aizen_hy')) + ' ' + Number(server.persistentData.getDouble('aizen_hz')))
  }
  if (aizenPhase % 200 === 0 && server.players.length > 0 && !global.aizenFight) {
    try { aizenAdvance(server, 10000) } catch (e) { console.error('aizen ilerleme hata: ' + e) }
  }
  if (aizenPhase % 600 === 0 && !global.aizenFight && !global.aizenIntro && !global.aizenWander) {
    var npc = aizenNpcPos(server)
    if (npc && Number(npc.y) > 0) {
      server.persistentData.putInt('aizen_var', 1)
      server.persistentData.putDouble('aizen_hx', Number(npc.x))
      server.persistentData.putDouble('aizen_hy', Number(npc.y))
      server.persistentData.putDouble('aizen_hz', Number(npc.z))
    }
  }
  if (aizenPhase % 10 !== 0) return
  aizenTimersTick(server)
  server.players.forEach(p => {
    try {
      var name = String(p.username)
      aizenSyncTags(server, p, name)
      aizenWander(server, p, name)
      // kurulum fonksiyonu (aizen_kur) etiketi verir: NPC'nin konumu ve varlığı kaydedilir, otomatik ilerleme sayacı başlar
      if (aizenHas(p, 'aizen_kuruldu')) {
        server.runCommandSilent('tag ' + name + ' remove aizen_kuruldu')
        server.persistentData.putInt('aizen_var', 1)
        server.persistentData.putDouble('aizen_hx', Number(p.x))
        server.persistentData.putDouble('aizen_hy', Number(p.y))
        server.persistentData.putDouble('aizen_hz', Number(p.z))
        aizenNote(server, name, 'Aizen kuruldu; sunucu evresi otomatik ilerleyecek (evre 1: ' + (AIZEN_EVRE1_MS / 3600000) + ' saat, evre 2: ' + (AIZEN_EVRE2_MS / 3600000) + ' saat oynanmış süre). Durum: /aizen_durum', 'gray')
      }
      for (var i = 0; i < AIZEN_TAGS.length; i++) {
        var tg = AIZEN_TAGS[i]
        if (!aizenHas(p, tg)) continue
        server.runCommandSilent('tag ' + name + ' remove ' + tg)
        var st = aizenStage(server)
        if (tg === 'aizen_kim') aizenWho(server, p, name)
        else if (tg === 'aizen_dovus') aizenChallenge(server, p, name)
        else if (tg === 'aizen_neden') aizenWhy(server, p, name)
        else if (tg === 'aizen_getir') { if (st === 3) aizenBring(server, p, name) }
        else if (tg === 'aizen_incele') { if (st === 3) aizenExamine(server, p, name) }
        else if (st >= 3) aizenSayDlg(server, name, 'Bu artık seni ilgilendirmiyor.')
        else if (tg === 'aizen_bilgi') aizenInfo(server, p, name)
        else if (tg === 'aizen_yardim') aizenHelp(server, p, name)
        else if (tg === 'aizen_arastirma') aizenResearch(server, p, name)
        else if (tg === 'aizen_supheli') aizenSuspicion(server, p, name)
      }
    } catch (e) {
      console.error('aizen hata: ' + e)
    }
  })
})

EntityEvents.death(event => {
  try {
    aizenTaskDeath(event)
    var tags = []
    event.entity.getTags().forEach(t => tags.push(String(t)))
    if (tags.indexOf('aizen_decoy') >= 0) {
      var s0 = event.source.actual
      if (s0 && s0.isPlayer()) {
        event.server.runCommandSilent('effect give ' + String(s0.username) + ' minecraft:blindness 3 0 true')
        event.server.runCommandSilent('effect give ' + String(s0.username) + ' minecraft:slowness 3 1 true')
        aizenNote(event.server, String(s0.username), 'Sahte! Yanılsamaya kandın.', 'dark_gray')
      }
      return
    }
    if (tags.indexOf('aizen_fighter') < 0) return
    var f = global.aizenFight
    if (!f) return
    var src = event.source.actual
    if (src && src.isPlayer() && String(src.username) === String(f.name)) aizenFightWin(event.server)
    else aizenFightEnd(event.server, false, 'Başkası benim yerime bitirmiş. Anlamsız.')
  } catch (e) {
    console.error('aizen olum hata: ' + e)
  }
})

PlayerEvents.loggedIn(event => {
  try {
    var server = event.server
    var st = aizenStage(server)
    var p = event.player
    if (st >= 5 && !aizenHas(p, 'aizen_haber')) {
      event.server.runCommandSilent('tag ' + String(p.username) + ' add aizen_haber')
      aizenNote(server, String(p.username), 'Sen yokken Caddy\'de bir şey oldu: Aizen maskesini düşürdü. Artık yardımsever bir âlim değil.', 'dark_purple')
    }
  } catch (e) {
    console.error('aizen giris hata: ' + e)
  }
})

PlayerEvents.loggedOut(event => {
  try {
    var f = global.aizenFight
    if (f && String(f.name) === String(event.player.username)) aizenFightEnd(event.server, false)
  } catch (e) {
    console.error('aizen cikis hata: ' + e)
  }
})

// ------------------------------------------------------------------ Yönetici komutları
ServerEvents.commandRegistry(event => {
  const { commands: Commands, arguments: Arguments } = event
  // /aizen_evre <1-4>: sunucu evresini ayarlar. 3 verilince ihanet sahnesi oynar (evre 4'e otomatik geçer). 1-2: yardımsever hâline döner.
  event.register(Commands.literal('aizen_durum').requires(s => s.hasPermission(2)).executes(ctx => {
    ctx.source.sendSuccess(Text.of(aizenStatusText(ctx.source.server)), false)
    return 1
  }))
  // /aizen_evre <1-5>: sayacı o evrenin başlangıcına çeker ve evreyi ayarlar. 3 yaralı evreyi (poz ve sahne), 4 ihanet olayını, 5 doğrudan kötü evreyi başlatır.
  event.register(Commands.literal('aizen_evre').requires(s => s.hasPermission(2)).then(Commands.argument('evre', Arguments.INTEGER.create(event)).executes(ctx => {
    var n = Math.max(1, Math.min(5, Number(Arguments.INTEGER.getResult(ctx, 'evre'))))
    var server = ctx.source.server
    var pd = server.persistentData
    if (n === 1) { pd.putLong('aizen_ms', 0); pd.putInt('aizen_evre', 1); aizenApplySkin(server, false); aizenSetPose(server, false) }
    if (n === 2) { pd.putLong('aizen_ms', AIZEN_EVRE1_MS); pd.putInt('aizen_evre', 2); aizenApplySkin(server, false); aizenSetPose(server, false) }
    if (n === 3) { pd.putLong('aizen_ms', AIZEN_EVRE1_MS + AIZEN_EVRE2_MS); aizenApplySkin(server, false); aizenWound(server) }
    if (n === 4) { pd.putLong('aizen_ms', AIZEN_EVRE1_MS + AIZEN_EVRE2_MS + AIZEN_EVRE3_MS); aizenBetrayal(server) }
    if (n === 5) { pd.putInt('aizen_evre', 5); aizenApplySkin(server, true); aizenSetPose(server, false) }
    ctx.source.sendSuccess(Text.of('Aizen evresi ' + n + ' yapıldı.'), false)
    return 1
  })))
  // /aizen_yer <x> <y> <z>: Aizen'in evini ayarlar ve Shunpo ile oraya götürür (konum kaydı/ev bu noktaya çekilir)
  event.register(Commands.literal('aizen_yer').requires(s => s.hasPermission(2)).then(Commands.argument('x', Arguments.DOUBLE.create(event)).then(Commands.argument('y', Arguments.DOUBLE.create(event)).then(Commands.argument('z', Arguments.DOUBLE.create(event)).executes(ctx => {
    var server = ctx.source.server
    var x = Number(Arguments.DOUBLE.getResult(ctx, 'x')), y = Number(Arguments.DOUBLE.getResult(ctx, 'y')), z = Number(Arguments.DOUBLE.getResult(ctx, 'z'))
    var e = aizenNpcPos(server)
    if (!e) { ctx.source.sendFailure(Text.of('Aizen bulunamadı (yüklü değil ya da kurulmadı). Yakınına git ya da aizen_kur çalıştır.')); return 0 }
    server.persistentData.putDouble('aizen_hx', x)
    server.persistentData.putDouble('aizen_hy', y)
    server.persistentData.putDouble('aizen_hz', z)
    server.persistentData.putInt('aizen_var', 1)
    global.aizenWander = false
    npcShunpoTo(server, e, x, y, z, '')
    ctx.source.sendSuccess(Text.of('Aizen evi ' + x + ' ' + y + ' ' + z + ' yapıldı.'), false)
    return 1
  })))))
  // /aizen_sifirla <oyuncu>: oyuncunun Aizen ilerlemesini sıfırlar (araştırma, yardım, boss ödül bayrağı, bekleme)
  event.register(Commands.literal('aizen_sifirla').requires(s => s.hasPermission(2)).then(Commands.argument('oyuncu', Arguments.PLAYER.create(event)).executes(ctx => {
    var p = Arguments.PLAYER.getResult(ctx, 'oyuncu')
    var pd = p.persistentData
    ;['aizen_r_have', 'aizen_r_need', 'aizen_r_total', 'aizen_r_day', 'aizen_r_day_count', 'aizen_s_count', 'aizen_yenildi', 'aizen_kanit', 'aizen_g_day', 'aizen_g_day_count', 'aizen_gozluk'].forEach(k => pd.putInt(k, 0))
    ;['aizen_r_key', 'aizen_r_label'].forEach(k => pd.putString(k, ''))
    ;['aizen_help_next', 'aizen_r_next', 'aizen_next', 'aizen_g_next', 'aizen_wander_next'].forEach(k => pd.putLong(k, 0))
    aizenFightEnd(ctx.source.server, false)
    ctx.source.sendSuccess(Text.of(String(p.username) + ' için Aizen ilerlemesi sıfırlandı.'), false)
    return 1
  })))
  // /aizen_odul: büyü uyandıktan sonra (oyunu yeniden başlatınca) yenilgi ödülünü almamış oyuncuya Kyōka Suigetsu verir
  event.register(Commands.literal('aizen_odul').requires(s => s.hasPermission(2)).then(Commands.argument('oyuncu', Arguments.PLAYER.create(event)).executes(ctx => {
    var p = Arguments.PLAYER.getResult(ctx, 'oyuncu')
    if (!aizenSpellReady()) { ctx.source.sendFailure(Text.of('Kyōka Suigetsu büyüsü henüz kayıtlı değil (oyun yeniden başlatılmalı).')); return 0 }
    ctx.source.server.runCommandSilent('give ' + String(p.username) + ' irons_spellbooks:scroll{"irons_spellbooks:spell_container":{data:[{id:"kubejs:kyoka_suigetsu",index:0,level:1,locked:1b}],maxSpells:1,mustEquip:0b,spellWheel:0b}} 1')
    p.persistentData.putInt('aizen_yenildi', 1)
    ctx.source.sendSuccess(Text.of('Kyōka Suigetsu parşömeni verildi.'), false)
    return 1
  })))
})
