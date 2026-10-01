// Yan görevler (pilot: Kakashi). Mentor NPC'lerin yalnızca büyü öğretmen olmaması için karaktere uygun, tekrarlanabilir küçük işler.
// Kakashi: (1) "Geç Kalan Haberci": mühürlü ruloyu başka bir NPC'ye ulaştır (süre sınırlı teslimat), (2) "Kopya Defteri": savrulan sayfaları bul
// (yakında parlayan izlere sağ tıkla). Erişim: Maceracı rütbesi yeterli (hoca şartı yok). Ödül: az zümrüt (Erwin/Thorfinn'den düşük), OP eşya yok.
// Diyalog: hoca hub'ına 'Bir işin var mı?' düğmesi (etiket 'yg_kakashi') kod tarafından eklenir (ygEnsureButton); cevaplar diyalog penceresinde.
// Durum oyuncunun persistentData'sında 'yg_k_*'. Yönetici: /yan_gorev_sifirla <oyuncu>.
// Not: server_scripts dosyaları aynı scope'ta çalışır, isimler benzersiz olmalı (yg önekli). Math.PI NaN dönebilir: sabit kullan.

const YG_PI = 3.141592653589793
const YG_KAKASHI_UUID = '6de0f631-c97e-44de-a0ea-d1778f073f74'
const YG_DAILY_LIMIT = 4
const YG_COOLDOWN_MS = 180000
const YG_TIME_HABER_MS = 12 * 60000
const YG_TIME_IZ_MS = 10 * 60000
const YG_BUTTON_NAME = 'Bir işin var mı?'

// Teslimat hedefleri (konumlar NPC dokümanlarından). minRank: Erwin Birliği rütbesi (0 = Yeminsiz).
const YG_TARGETS = [
  { key: 'erwin', name: 'Erwin Smith', uuid: '504788d8-3dc0-407e-aebf-ca04dc17cfcb', dlg: 'erwin_yanit', x: -988.5, y: 68, z: -371.5, minRank: 0,
    line: 'Kakashi\'nin rulosu... Bu sefer de geç kaldı, değil mi? Teşekkür ederim, mührü sağlam. Buyur, emeğinin karşılığı.' },
  { key: 'thorfinn', name: 'Thorfinn', uuid: '1e6fe9d9-ae31-4abf-8b86-0bcc093b2413', dlg: 'thorfinn_yanit', x: -979.5, y: 68, z: -371.5, minRank: 0,
    line: 'Kakashi\'den mi? O adam hiç zamanında göndermez. Neyse, getirdin. Al bakalım, hak ettin.' },
  { key: 'kenpachi', name: 'Kenpachi', uuid: '078b6d17-96a0-49f6-b6c8-c88c78c6c45a', dlg: 'kenpachi_yanit', x: -629.5, y: 68, z: -437.5, minRank: 1,
    line: 'Hah, koca hocanın ulağı olmuşsun. Ver şunu. ... Fena değil, buraya kadar gelebildin. Al, bir zümrüt lafım olmaz.' },
  { key: 'yoruichi', name: 'Yoruichi', uuid: 'fff2c1ae-28c0-4f9c-858b-94f7cbc0ca8e', dlg: 'yoruichi_yanit', x: -1032.5, y: 81, z: -338.3, minRank: 1,
    line: 'Kakashi\'nin rulosu, hm? Bu kadar yolu yürüyerek mi geldin? Hızlanman lazım. Yine de teşekkürler; al, yol parası.' }
]

const YG_KAKASHI_HABER = [
  'Yolda kara bir kedi geçti, o yüzden yine geç kaldım. Şu ruloyu {h}\'e ulaştırır mısın? Mühür açılmasın. {dk} dakikan var.',
  'Bir rulo yazdım, ama götürecek vaktim yok. Hem zaten yolda kaybolurum. {h}\'e verirsen sevinirim. {dk} dakikan var.',
  'Şunu {h}\'e götür. İçinde ne olduğunu sorma; ben de hatırlamıyorum. {dk} dakika içinde ulaşırsa yeter.'
]
const YG_KAKASHI_IZ = [
  'Not defterimin sayfaları rüzgârda savruldu. Etrafta {n} sayfa olmalı; parlayan izleri takip et, her birine sağ tıkla. {dk} dakikan var.',
  'Defterimi okurken bir rüzgâr çıktı, sayfalar uçtu. Yakınlarda {n} sayfa arıyorum. Parlayan izlere sağ tıkla, {dk} dakikan var.'
]
const YG_KAKASHI_DONE_HABER = ['Ulaştı demek. İyi iş. Al, emeğinin karşılığı.']
const YG_KAKASHI_DONE_IZ = [
  'Hepsi burada. Sayfalar sırasıyla... hm, bir tanesi ters. Neyse. İyi iş, al bakalım.',
  'Defterim tamam. Bir daha rüzgârlı havada dışarıda okumayacağım. Al, sana borcum.'
]

function ygHas(p, tag) {
  var found = false
  p.getTags().forEach(t => { if (String(t) === tag) found = true })
  return found
}

function ygPick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function ygBar(server, name, text, color) {
  server.runCommandSilent('title ' + name + ' actionbar {"text":"' + npcDlgEsc(text) + '","color":"' + (color || 'gold') + '"}')
}

function ygToday() { return new Date().toISOString().slice(0, 10) }

function ygDone(p) {
  var pd = p.persistentData
  return String(pd.getString('yg_k_day')) === ygToday() ? Number(pd.getInt('yg_k_day_count')) : 0
}

// Kakashi'nin menüsünü kurar. Easy NPC bir diyalogda en fazla 6 düğmeyi düzgün dizer ([Admin] Kapat dahil, fazlası üst üste biner), bu yüzden
// ana menüde (hoca_hub) yalnızca 'Diğer işler.' düğmesi vardır; durum, parşömen yenileme ve yan görev alt menüdedir (hoca_diger).
// Yeniden üretilen diyalog düzeni bozarsa bir sonraki kontrolde (10 sn) yeniden kurulur. Üretici (gen_hocalar.js) aynı düzeni kurar.
function ygEnsureButton(server) {
  var u = YG_KAKASHI_UUID
  var opts = '{AllowEscClose:0,ShowCloseButton:0,ButtonConditionMode:"HIDE"}'
  var adm = '{Conditions:[{Type:"PLAYER_TAG",Name:"rank_admin"}],Name:"[Admin] Kapat",Actions:[{Type:"CLOSE_DIALOG"}]}'
  var tagBtn = function (n, tg) { return '{Name:"' + n + '",Actions:[{Type:"COMMAND",PermLevel:3,Cmd:"/tag @initiator add ' + tg + '"},{Type:"CLOSE_DIALOG"}]}' }
  var diger = '{Options:' + opts + ',Texts:[{Text:"Başka ne var?"}],Label:"hoca_diger",Buttons:[' +
    [tagBtn('Eğitim durumum.', 'hoca_info'), tagBtn('Parşömenimi kaybettim.', 'hoca_lost_chidori'), tagBtn(YG_BUTTON_NAME, 'yg_kakashi'), '{Name:"Geri.",Actions:[{Type:"CLOSE_DIALOG"}]}', adm].join(',') +
    '],Name:"hoca_diger"}'
  var set = 'data modify entity ' + u + ' DialogData.DialogDataSet'
  var hub = ' DialogData.DialogDataSet[{Name:"hoca_hub"}].Buttons'
  server.runCommandSilent('execute unless data entity ' + u + ' DialogData.DialogDataSet[{Name:"hoca_diger"}] run ' + set + ' append value ' + diger)
  server.runCommandSilent('execute unless data entity ' + u + hub + '[{Name:"Diğer işler."}] run data modify entity ' + u + hub + ' insert 2 value {Name:"Diğer işler.",Actions:[{Type:"OPEN_NAMED_DIALOG",Cmd:"hoca_diger"}]}')
  ;['Eğitim durumum.', 'Parşömenimi kaybettim.', YG_BUTTON_NAME].forEach(n => server.runCommandSilent('data remove entity ' + u + hub + '[{Name:"' + n + '"}]'))
}

function ygClearTask(server, name, p) {
  var pd = p.persistentData
  pd.putString('yg_k_task', '')
  pd.putString('yg_k_target', '')
  pd.putInt('yg_k_have', 0)
  pd.putInt('yg_k_need', 0)
  pd.putLong('yg_k_expire', 0)
  server.runCommandSilent('kill @e[tag=yg_iz_' + name + ']')
  server.runCommandSilent('kill @e[tag=yg_izv_' + name + ']')
  server.runCommandSilent('clear ' + name + ' minecraft:paper{ykRulo:1b}')
}

function ygKakashiSay(server, name, text) {
  hocaSay(server, name, 'Kakashi', text)
}

function ygReward(server, p, name, task) {
  var pd = p.persistentData
  var em = 2 + Math.floor(Math.random() * 2) + (erwinRank(p) >= 2 ? 1 : 0)
  server.runCommandSilent('give ' + name + ' minecraft:emerald ' + em)
  pd.putInt('yg_k_total', Number(pd.getInt('yg_k_total')) + 1)
  if (String(pd.getString('yg_k_day')) !== ygToday()) { pd.putString('yg_k_day', ygToday()); pd.putInt('yg_k_day_count', 0) }
  pd.putInt('yg_k_day_count', Number(pd.getInt('yg_k_day_count')) + 1)
  pd.putLong('yg_k_next', Date.now() + YG_COOLDOWN_MS)
  return em
}

function ygSpawnNotes(server, name, p, n) {
  var cx = Number(p.x), cz = Number(p.z)
  for (var i = 0; i < n; i++) {
    var ang = Math.random() * 2 * YG_PI
    var dist = 25 + Math.random() * 35
    var x = cx + Math.cos(ang) * dist
    var z = cz + Math.sin(ang) * dist
    server.runCommandSilent('execute in minecraft:overworld positioned ' + x.toFixed(1) + ' 0 ' + z.toFixed(1) + ' positioned over motion_blocking_no_leaves run summon minecraft:interaction ~ ~ ~ {Tags:["yg_iz","yg_iz_' + name + '"],width:1.0f,height:1.4f,response:1b}')
    // uzaktan ve duvar arkasından bile görünen parlayan kitap (yalnızca görsel; sayılmaz, etiketi 'yg_izv')
    server.runCommandSilent('execute in minecraft:overworld positioned ' + x.toFixed(1) + ' 0 ' + z.toFixed(1) + ' positioned over motion_blocking_no_leaves run summon minecraft:item_display ~ ~ ~ {Tags:["yg_izv","yg_izv_' + name + '"],item:{id:"minecraft:writable_book",Count:1b},item_display:"fixed",billboard:"vertical",Glowing:1b,glow_color_override:16766720,view_range:3.0f,transformation:{left_translation:[0f,0.9f,0f],left_rotation:[0f,0f,0f,1f],scale:[0.9f,0.9f,0.9f],right_rotation:[0f,0f,0f,1f]}}')
  }
  return Number(server.runCommandSilent('execute if entity @e[tag=yg_iz_' + name + ']'))
}

function ygKakashiRequest(server, p, name) {
  var pd = p.persistentData
  if (!ygHas(p, 'rank_maceraci')) { ygKakashiSay(server, name, 'Adını duymadım. Önce Maceracı olarak tanınmalısın; sonra konuşuruz.'); return }
  var task = String(pd.getString('yg_k_task'))
  var now = Date.now()
  if (task !== '' && Number(pd.getLong('yg_k_expire')) <= now) {
    ygClearTask(server, name, p)
    ygKakashiSay(server, name, 'Süre dolmuş. Olsun, ben de zaten geç kalıyorum. Yeni bir iş istersen söyle.')
    return
  }
  if (task === 'haber') {
    var tg = YG_TARGETS.filter(t => t.key === String(pd.getString('yg_k_target')))[0]
    var left = Math.max(1, Math.ceil((Number(pd.getLong('yg_k_expire')) - now) / 60000))
    if (!server.runCommandSilent('execute if entity @a[name=' + name + ',nbt={Inventory:[{id:"minecraft:paper",tag:{ykRulo:1b}}]}]')) server.runCommandSilent('give ' + name + ' minecraft:paper{ykRulo:1b,display:{Name:\'{"text":"Mühürlü Rulo","color":"gold","italic":false}\',Lore:[\'{"text":"Kakashi\\\'nin mührü. Açma.","color":"gray","italic":false}\']}} 1')
    ygKakashiSay(server, name, 'Rulo hâlâ sende, ' + (tg ? tg.name : 'hedef') + '\'e ulaştır. ' + left + ' dakikan kaldı. Yanına gitmen yeterli.')
    return
  }
  if (task === 'iz') {
    var have = Number(pd.getInt('yg_k_have')), need = Number(pd.getInt('yg_k_need'))
    if (have >= need) {
      var emI = ygReward(server, p, name, 'iz')
      ygClearTask(server, name, p)
      ygKakashiSay(server, name, ygPick(YG_KAKASHI_DONE_IZ))
      ygBar(server, name, 'Ödül: ' + emI + ' zümrüt', 'green')
    } else {
      var leftI = Math.max(1, Math.ceil((Number(pd.getLong('yg_k_expire')) - now) / 60000))
      ygKakashiSay(server, name, 'Sayfaları topluyorsun: ' + have + '/' + need + '. Parlayan izlere sağ tıkla. ' + leftI + ' dakikan kaldı.')
    }
    return
  }
  // yeni iş
  if (ygDone(p) >= YG_DAILY_LIMIT) { ygKakashiSay(server, name, 'Bugünlük yeter. Ben de kitabıma dönmek istiyorum. Yarın gel.'); return }
  var wait = Number(pd.getLong('yg_k_next')) - now
  if (wait > 0) { ygKakashiSay(server, name, 'Biraz dinlen. ' + Math.ceil(wait / 60000) + ' dakika sonra yeni bir işim olabilir.'); return }
  var rank = erwinRank(p)
  if (Math.random() < 0.5) {
    var pool = YG_TARGETS.filter(t => t.minRank <= rank)
    var t = ygPick(pool)
    pd.putString('yg_k_task', 'haber')
    pd.putString('yg_k_target', t.key)
    pd.putLong('yg_k_expire', now + YG_TIME_HABER_MS)
    server.runCommandSilent('give ' + name + ' minecraft:paper{ykRulo:1b,display:{Name:\'{"text":"Mühürlü Rulo","color":"gold","italic":false}\',Lore:[\'{"text":"Kakashi\\\'nin mührü. Açma.","color":"gray","italic":false}\']}} 1')
    ygKakashiSay(server, name, ygPick(YG_KAKASHI_HABER).split('{h}').join(t.name).split('{dk}').join(String(YG_TIME_HABER_MS / 60000)) + ' Ekranın altında hedefin yönü, mesafesi ve kalan süre yazar.')
  } else {
    var n = 4
    pd.putString('yg_k_task', 'iz')
    pd.putInt('yg_k_have', 0)
    var spawned = ygSpawnNotes(server, name, p, n)
    if (!(spawned >= 2)) {
      ygClearTask(server, name, p)
      ygKakashiSay(server, name, 'Sayfalar uçmadı galiba... Buralar pek uygun değil. Biraz açık bir yerde tekrar sor.')
      return
    }
    pd.putInt('yg_k_need', spawned)
    pd.putLong('yg_k_expire', now + YG_TIME_IZ_MS)
    ygKakashiSay(server, name, ygPick(YG_KAKASHI_IZ).split('{n}').join(String(spawned)).split('{dk}').join(String(YG_TIME_IZ_MS / 60000)) + ' Ekranın altında kaç sayfa topladığın, en yakın sayfanın oku (baktığın yöne göre) ve kalan süre yazar; sayfalar uzaktan, duvar arkasından bile parlayan altın bir kitap olarak görünür.')
  }
}

var ygPhase = 0

// Oyuncunun baktığı yöne göre ok: ↑ önünde, → sağında, ↓ arkanda, ← solunda (yaw 0 = güney, 90 = batı)
function ygArrow(dx, dz, yaw) {
  var arrows = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖']
  var bearing = Math.atan2(dx, -dz) * 180 / YG_PI
  var rel = (bearing - (Number(yaw) + 180) + 720) % 360
  return arrows[Math.round(rel / 45) % 8]
}

// Yön adı (kuzey = -z, doğu = +x)
function ygCompass(dx, dz) {
  var names = ['kuzey', 'kuzeydoğu', 'doğu', 'güneydoğu', 'güney', 'güneybatı', 'batı', 'kuzeybatı']
  var ang = Math.atan2(dx, -dz) * 180 / YG_PI
  var idx = Math.round(((ang + 360) % 360) / 45) % 8
  return names[idx]
}

// Oyuncuya ait en yakın sayfa izi: { d, dx, dz } ya da null
function ygNearestIz(server, name, p) {
  var best = null
  try {
    var it = server.overworld().getAllEntities().iterator()
    while (it.hasNext()) {
      var e = it.next()
      var mine = false
      e.getTags().forEach(x => { if (String(x) === 'yg_iz_' + name) mine = true })
      if (!mine) continue
      var dx = Number(e.x) - Number(p.x), dz = Number(e.z) - Number(p.z)
      var d = Math.sqrt(dx * dx + dz * dz)
      if (best === null || d < best.d) best = { d: d, dx: dx, dz: dz }
    }
  } catch (err) { best = null }
  return best
}

// Ekranın altında sürekli görev durumu: ne yapılacak, kaç tane, ne kadar uzakta, hangi yönde, kalan süre.
function ygProgress(server, p, name, task, pd, now) {
  var left = Math.max(0, Math.ceil((Number(pd.getLong('yg_k_expire')) - now) / 1000))
  var mm = Math.floor(left / 60), ss = left % 60
  var time = mm + ':' + (ss < 10 ? '0' : '') + ss
  if (task === 'haber') {
    var tg = YG_TARGETS.filter(t => t.key === String(pd.getString('yg_k_target')))[0]
    if (!tg) return
    var dx = tg.x - Number(p.x), dz = tg.z - Number(p.z)
    var d = Math.round(Math.sqrt(dx * dx + dz * dz))
    ygBar(server, name, 'Rulo: ' + tg.name + '\'e ulaştır  ' + ygArrow(dx, dz, p.yaw) + ' ' + d + ' blok · ' + time, 'gold')
  } else if (task === 'iz') {
    var have = Number(pd.getInt('yg_k_have')), need = Number(pd.getInt('yg_k_need'))
    if (have >= need) { ygBar(server, name, 'Sayfalar: ' + have + '/' + need + ' · Kakashi\'ye dön · ' + time, 'green'); return }
    var n = ygNearestIz(server, name, p)
    var where = n ? '  ' + ygArrow(n.dx, n.dz, p.yaw) + ' ' + Math.round(n.d) + ' blok' : '  izleri ara'
    ygBar(server, name, 'Sayfalar: ' + have + '/' + need + where + ' · ' + time, 'gold')
  }
}

ServerEvents.tick(event => {
  ygPhase++
  var server = event.server
  if (ygPhase === 40 || ygPhase % 200 === 0) ygEnsureButton(server)
  if (ygPhase % 4 !== 0) return
  server.players.forEach(p => {
    try {
      var name = String(p.username)
      if (ygHas(p, 'yg_kakashi')) {
        server.runCommandSilent('tag ' + name + ' remove yg_kakashi')
        ygKakashiRequest(server, p, name)
      }
      var pd = p.persistentData
      var task = String(pd.getString('yg_k_task'))
      if (task === '') return
      var now = Date.now()
      if (Number(pd.getLong('yg_k_expire')) <= now) {
        ygClearTask(server, name, p)
        ygBar(server, name, 'Kakashi\'nin işi için süre doldu.', 'gray')
        return
      }
      if (ygPhase % 20 === 0) ygProgress(server, p, name, task, pd, now)
      if (task === 'haber' && ygPhase % 8 === 0) {
        var tg = YG_TARGETS.filter(t => t.key === String(pd.getString('yg_k_target')))[0]
        if (!tg) return
        var dx = Number(p.x) - tg.x, dz = Number(p.z) - tg.z, dy = Math.abs(Number(p.y) - tg.y)
        if (Math.sqrt(dx * dx + dz * dz) <= 4.5 && dy <= 4 && server.runCommandSilent('execute if entity @a[name=' + name + ',nbt={Inventory:[{id:"minecraft:paper",tag:{ykRulo:1b}}]}]')) {
          var em = ygReward(server, p, name, 'haber')
          ygClearTask(server, name, p)
          npcDlgSay(server, tg.uuid, tg.dlg, name, tg.line, false, t => ygBar(server, name, tg.name + ': ' + t, 'gold'))
          ygBar(server, name, 'Ödül: ' + em + ' zümrüt. Kakashi\'ye haber vermene gerek yok.', 'green')
        }
      }
      if (task === 'iz' && ygPhase % 10 === 0) {
        server.runCommandSilent('execute as @e[tag=yg_iz_' + name + '] at @s run particle minecraft:end_rod ~ ~1.2 ~ 0.15 0.4 0.15 0.01 4 force ' + name)
        server.runCommandSilent('execute as @e[tag=yg_iz_' + name + '] at @s run particle minecraft:enchant ~ ~1.0 ~ 0.3 0.5 0.3 0.4 6 force ' + name)
        // uzaktan görünen ışık sütunu: sayfanın üstünde yukarı doğru dizilen parıltı
        server.runCommandSilent('execute as @e[tag=yg_iz_' + name + '] at @s run particle minecraft:end_rod ~ ~5 ~ 0.04 4 0.04 0.01 14 force ' + name)
      }
    } catch (e) {
      console.error('yan gorev hata: ' + e)
    }
  })
})

// 'Sayfa' izine sağ tık
ItemEvents.entityInteracted(event => {
  try {
    if (String(event.hand) !== 'MAIN_HAND') return
    var t = event.target
    if (!t) return
    var isIz = false
    t.getTags().forEach(x => { if (String(x) === 'yg_iz') isIz = true })
    if (!isIz) return
    var p = event.player
    var name = String(p.username)
    var mine = false
    t.getTags().forEach(x => { if (String(x) === 'yg_iz_' + name) mine = true })
    var server = p.server
    if (!mine) { ygBar(server, name, 'Bu iz sana ait değil.', 'gray'); return }
    var pd = p.persistentData
    if (String(pd.getString('yg_k_task')) !== 'iz') return
    server.runCommandSilent('execute at ' + String(t.uuid) + ' run particle minecraft:end_rod ~ ~1 ~ 0.3 0.5 0.3 0.05 20 force ' + name)
    server.runCommandSilent('playsound minecraft:entity.experience_orb.pickup master ' + name + ' ~ ~ ~ 0.8 1.2')
    server.runCommandSilent('execute at ' + String(t.uuid) + ' run kill @e[tag=yg_izv_' + name + ',distance=..2]')
    server.runCommandSilent('kill ' + String(t.uuid))
    var have = Number(pd.getInt('yg_k_have')) + 1
    pd.putInt('yg_k_have', have)
    var need = Number(pd.getInt('yg_k_need'))
    if (have >= need) ygBar(server, name, 'Tüm sayfalar toplandı! Kakashi\'ye dön.', 'gold')
    else ygBar(server, name, 'Sayfa bulundu: ' + have + '/' + need, 'gold')
  } catch (e) {
    console.error('yan gorev etkilesim hata: ' + e)
  }
})

ServerEvents.commandRegistry(event => {
  const { commands: Commands, arguments: Arguments } = event
  event.register(Commands.literal('yan_gorev_sifirla').requires(s => s.hasPermission(2)).then(Commands.argument('oyuncu', Arguments.PLAYER.create(event)).executes(ctx => {
    var p = Arguments.PLAYER.getResult(ctx, 'oyuncu')
    var name = String(p.username)
    ygClearTask(ctx.source.server, name, p)
    var pd = p.persistentData
    pd.putLong('yg_k_next', 0)
    pd.putInt('yg_k_day_count', 0)
    ctx.source.sendSuccess(Text.of(name + ' için yan görevler sıfırlandı.'), false)
    return 1
  })))
  // /kakashi_menu_kontrol: Kakashi menüsünü kurar ve ana menü ile alt menünün düğmelerini yazar (tanı komutu)
  event.register(Commands.literal('kakashi_menu_kontrol').requires(s => s.hasPermission(2)).executes(ctx => {
    var server = ctx.source.server
    ygEnsureButton(server)
    var out = []
    try {
      var e = server.overworld().getEntity(Java.loadClass('java.util.UUID').fromString(YG_KAKASHI_UUID))
      if (!e) { ctx.source.sendFailure(Text.of('Kakashi yüklü değil (yanına git).')); return 0 }
      var set = e.nbt.getCompound('DialogData').getList('DialogDataSet', 10)
      for (var i = 0; i < set.size(); i++) {
        var d = set.getCompound(i)
        var nm = String(d.getString('Name'))
        if (nm !== 'hoca_hub' && nm !== 'hoca_diger') continue
        var bl = d.getList('Buttons', 10)
        var names = []
        for (var j = 0; j < bl.size(); j++) names.push(String(bl.getCompound(j).getString('Name')))
        out.push(nm + ' (' + names.length + '): ' + names.join(' | '))
      }
    } catch (err) {
      out.push('okuma hata: ' + err)
    }
    ctx.source.sendSuccess(Text.of(out.length > 0 ? out.join('\n') : 'hub/diger bulunamadı'), false)
    return 1
  }))
})
