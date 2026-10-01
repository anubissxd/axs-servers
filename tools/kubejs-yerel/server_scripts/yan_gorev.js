// Yan görevler: mentor NPC'ler (Kakashi, Itachi, Yoruichi) yalnızca büyü öğretmen olmasın diye karaktere uygun, tekrarlanabilir küçük işler verir.
// Her mentorun 5 görevi vardır; arka arkaya aynı görev verilmez (son 2 görev hariç tutulur). Erişim: Maceracı rütbesi (mentor şartı yok).
// Görev türleri:
//   haber  : mühürlü ruloyu başka bir NPC'ye ulaştır (süre sınırlı teslimat; hedefe yaklaşınca otomatik tamamlanır)
//   iz     : savrulan eşyaları bul (yakında parlayan eşya, sağ tık; yakından görünür, uzaktan yalnızca ok ve yaklaşık mesafe)
//   av     : süre içinde belirli sayıda canavar öldür; sonra mentora dön
//   topla  : belirli eşyayı getir; mentora teslim edilir (envanterden alınır)
//   ulas   : bir krallığa/yere git (varışta otomatik tamamlanır)
// Ödül: az zümrüt (Erwin/Thorfinn'den düşük), OP eşya yok. Günde mentor başına 4 iş, işler arası 3 dk. Aynı anda tek yan görev.
// Diyalog: mentorun menüsüne 'Bir işin var mı?' düğmesi kodla eklenir (ygEnsureButtons); cevaplar diyalog penceresinde, ilerleme ekran altında.
// Durum oyuncunun persistentData'sında 'yg_*'. Yönetici: /yan_gorev_sifirla <oyuncu>, tanı: /kakashi_menu_kontrol.
// Not: server_scripts dosyaları aynı scope'ta çalışır, isimler benzersiz olmalı (yg önekli). Math.PI NaN dönebilir: sabit kullan.

const YG_PI = 3.141592653589793
const YG_DAILY_LIMIT = 4
const YG_COOLDOWN_MS = 180000
const YG_BUTTON_NAME = 'Bir işin var mı?'

const YG_MENTORS = {
  kakashi: { name: 'Kakashi', uuid: '6de0f631-c97e-44de-a0ea-d1778f073f74', tag: 'yg_kakashi', color: 16766720 },
  itachi: { name: 'Itachi', uuid: '6ea2c950-4873-485e-afb6-6b74c244f238', tag: 'yg_itachi', color: 11141290 },
  yoruichi: { name: 'Yoruichi', uuid: 'fff2c1ae-28c0-4f9c-858b-94f7cbc0ca8e', tag: 'yg_yoruichi', color: 16733695 }
}

// Teslimat hedefleri (konumlar NPC dokümanlarından). minRank: Erwin Birliği rütbesi (0 = Yeminsiz).
const YG_TARGETS = [
  { key: 'erwin', name: 'Erwin Smith', uuid: '504788d8-3dc0-407e-aebf-ca04dc17cfcb', dlg: 'erwin_yanit', x: -988.5, y: 68, z: -371.5, minRank: 0,
    line: 'Bir rulo mu? Mührü sağlam. Gönderen kim olursa olsun işini bilir. Buyur, emeğinin karşılığı.' },
  { key: 'thorfinn', name: 'Thorfinn', uuid: '1e6fe9d9-ae31-4abf-8b86-0bcc093b2413', dlg: 'thorfinn_yanit', x: -979.5, y: 68, z: -371.5, minRank: 0,
    line: 'Haberci mi oldun? Bu aralar herkes bir şey taşıtıyor. Neyse, getirdin. Al bakalım, hak ettin.' },
  { key: 'kenpachi', name: 'Kenpachi', uuid: '078b6d17-96a0-49f6-b6c8-c88c78c6c45a', dlg: 'kenpachi_yanit', x: -629.5, y: 68, z: -437.5, minRank: 1,
    line: 'Hah, bir ulakla uğraşacak halim yok. Ver şunu. ... Buraya kadar gelebildin, fena değil. Al, bir zümrüt lafım olmaz.' },
  { key: 'yoruichi', name: 'Yoruichi', uuid: 'fff2c1ae-28c0-4f9c-858b-94f7cbc0ca8e', dlg: 'yoruichi_yanit', x: -1032.5, y: 81, z: -338.3, minRank: 1,
    line: 'Bir rulo, hm? Bu kadar yolu yürüyerek mi geldin? Hızlanman lazım. Yine de teşekkürler; al, yol parası.' },
  { key: 'kakashi', name: 'Kakashi', uuid: '6de0f631-c97e-44de-a0ea-d1778f073f74', dlg: 'kakashi_yanit', x: -786.5, y: 72, z: -331.5, minRank: 0,
    line: 'Ulaştırdın demek. Ben olsaydım yolda kaybolurdum. İyi iş, al bakalım.' },
  { key: 'itachi', name: 'Itachi', uuid: '6ea2c950-4873-485e-afb6-6b74c244f238', dlg: 'itachi_yanit', x: -805.5, y: 72, z: -475.5, minRank: 0,
    line: 'Sessizce ulaştı. Teşekkür ederim. Bu, emeğinin karşılığı.' }
]

// Varış yerleri (ulas görevi): krallık kaleleri ve spawn. r yatay yarıçap.
const YG_PLACES = [
  { name: 'Drondra Kalesi', x: -625, z: -425, r: 12 },
  { name: 'Granfos Kalesi', x: -817, z: -474, r: 12 },
  { name: 'Vlorya Kalesi', x: -673, z: -262, r: 12 },
  { name: 'Caddy (spawn)', x: -984.5, z: -375.5, r: 10 },
  { name: 'Yoruichi\'nin evi', x: -1032.5, z: -338.3, r: 8 }
]

// Görevler. offer: {dk} süre, {n} adet, {l} etiket, {h} hedef, {y} yer. done: tamamlayınca mentorun sözü.
const YG_TASKS = {
  kakashi: [
    { id: 'k_haber', type: 'haber', time: 12, offer: 'Yolda kara bir kedi geçti, o yüzden yine geç kaldım. Şu ruloyu {h}\'e ulaştırır mısın? Mühür açılmasın. {dk} dakikan var.',
      done: 'Ulaştı demek. İyi iş. Al, emeğinin karşılığı.' },
    { id: 'k_iz', type: 'iz', time: 10, n: 4, item: 'minecraft:writable_book', unit: 'sayfa', radius: [30, 70],
      offer: 'Not defterimin sayfaları rüzgârda savruldu. Etrafta {n} sayfa olmalı; yaklaşınca parlayan bir kitap olarak görürsün, sağ tıkla. {dk} dakikan var.',
      done: 'Defterim tamam. Bir daha rüzgârlı havada dışarıda okumayacağım. Al, sana borcum.' },
    { id: 'k_av', type: 'av', time: 8, n: 12, unit: 'canavar',
      offer: 'Yolda beni takip eden birkaç gölge var, kitap okurken rahatsız ediyorlar. {n} canavar öldür, sonra bana dön. {dk} dakikan var.',
      done: 'Rahat bir okuma günü olacak. Sağ ol. Al, hak ettin.' },
    { id: 'k_topla', type: 'topla', time: 15, item: 'minecraft:book', n: 3, label: 'kitap',
      offer: 'Kopyalamam gereken eserler var ama kitabım kalmadı. Bana {n} {l} getir. {dk} dakikan var.',
      done: 'Mükemmel, bunları kopyalayacağım. Al, emeğin için.' },
    { id: 'k_ulas', type: 'ulas', time: 10, offer: 'Bir yeri kontrol etmem gerekiyordu ama yine geç kaldım. {y}\'e git; yeterince yaklaşman yeter. {dk} dakikan var.',
      done: 'Gidebildin demek. Yol tarifi gerek yoktu galiba. Al, yol parası.' }
  ],
  itachi: [
    { id: 'i_iz', type: 'iz', time: 10, n: 5, item: 'minecraft:feather', unit: 'karga tüyü', radius: [35, 80],
      offer: 'Kargalarım bölgeye dağıldı, tüylerini bırakmışlar. {n} tüy bul. Yaklaşınca parladıklarını görürsün, sağ tıkla. {dk} dakikan var.',
      done: 'Hepsi yerinde. Kargalar döndü. Teşekkür ederim.' },
    { id: 'i_av', type: 'av', time: 7, n: 10, unit: 'canavar',
      offer: 'Gece sessizliği bozan yaratıklar var. {n} tanesini sessizce sustur ve bana dön. {dk} dakikan var.',
      done: 'Sessizlik geri döndü. İyi iş.' },
    { id: 'i_ulas', type: 'ulas', time: 12, offer: 'Bir yeri gözetlemem gerekiyor ama yerimden ayrılmak istemiyorum. {y}\'e git ve çevreyi gör. Yeterince yaklaşman yeter. {dk} dakikan var.',
      done: 'Çevreyi gördün. Bu bana yeter. Al.' },
    { id: 'i_topla', type: 'topla', time: 15, item: 'minecraft:ink_sac', n: 8, label: 'mürekkep kesesi',
      offer: 'Karanlık işler için mürekkep lazım. Bana {n} {l} getir. {dk} dakikan var.',
      done: 'Bu mürekkep işe yarar. Teşekkür ederim.' },
    { id: 'i_haber', type: 'haber', time: 12, offer: 'Bir mesaj var, ama kimsenin duymaması gerek. Şu ruloyu {h}\'e sessizce ulaştır. {dk} dakikan var.',
      done: 'Mesaj yerine ulaştı. Teşekkür ederim.' }
  ],
  yoruichi: [
    { id: 'y_iz', type: 'iz', time: 8, n: 4, item: 'minecraft:cod', unit: 'kedi', radius: [30, 65],
      offer: 'Kediler kaçmış, hepsi benim huysuz soydaşlarım. {n} kediyi bul. Yaklaşınca parlarlar, sağ tıkla, hepsini tut! {dk} dakikan var.',
      done: 'Hepsini buldun mu? Fena değilsin. Kediler seni sevmiş olmalı. Al.' },
    { id: 'y_ulas', type: 'ulas', time: 5, offer: 'Hadi bir yarışalım! {y}\'e benden önce git, tabii ben oradaymışım gibi. Hızlı ol, {dk} dakikan var.',
      done: 'Hmm, fena değil. Daha hızlı olabilirdin ama bu kez geçer. Al.' },
    { id: 'y_haber', type: 'haber', time: 6, offer: 'Acele bir haber var! Şu ruloyu {h}\'e ulaştır, {dk} dakikan var. Yavaş kalma!',
      done: 'Zamanında ulaştı. Hızlanıyorsun. Al.' },
    { id: 'y_av', type: 'av', time: 3, n: 8, unit: 'canavar',
      offer: 'Hız denemesi: {dk} dakikada {n} canavar. Yetişebilirsen bana dön!',
      done: 'Çabuk oldu, hoşuma gitti. Al, hak ettin.' },
    { id: 'y_topla', type: 'topla', time: 15, item: 'minecraft:cod', n: 8, label: 'çiğ morina',
      offer: 'Ben bir kedi değilim, bunu unutma. Ama balık sevmem demedim. Bana {n} {l} getir. {dk} dakikan var.',
      done: 'Mmm, balık. Konuşan bir kedi için fena bir rüşvet değil. Al.' }
  ]
}

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

function ygSay(m, server, name, text) {
  if (m === 'yoruichi') yoruichiSay(server, name, text)
  else hocaSay(server, name, YG_MENTORS[m].name, text)
}

function ygTaskOf(m, id) { return YG_TASKS[m] ? YG_TASKS[m].filter(t => t.id === id)[0] : undefined }

function ygDone(p, m) {
  var pd = p.persistentData
  return String(pd.getString('yg_day_' + m)) === ygToday() ? Number(pd.getInt('yg_cnt_' + m)) : 0
}

// ------------------------------------------------------------------ Menü düğmeleri
// Easy NPC bir diyalogda en fazla 6 düğmeyi düzgün dizer ([Admin] Kapat dahil, fazlası üst üste biner).
// Kakashi: ana menüde (hoca_hub) yalnızca 'Diğer işler.' vardır; durum, parşömen ve yan görev alt menüdedir (hoca_diger).
// Itachi: alt menüsüne (hoca_diger) eklenir. Yoruichi: reddetme/bitiş diyaloglarına eklenir.
function ygTagBtn(n, tg) { return '{Name:"' + n + '",Actions:[{Type:"COMMAND",PermLevel:3,Cmd:"/tag @initiator add ' + tg + '"},{Type:"CLOSE_DIALOG"}]}' }

function ygEnsureButtons(server) {
  var u = YG_MENTORS.kakashi.uuid
  var opts = '{AllowEscClose:0,ShowCloseButton:0,ButtonConditionMode:"HIDE"}'
  var adm = '{Conditions:[{Type:"PLAYER_TAG",Name:"rank_admin"}],Name:"[Admin] Kapat",Actions:[{Type:"CLOSE_DIALOG"}]}'
  var diger = '{Options:' + opts + ',Texts:[{Text:"Başka ne var?"}],Label:"hoca_diger",Buttons:[' +
    [ygTagBtn('Eğitim durumum.', 'hoca_info'), ygTagBtn('Parşömenimi kaybettim.', 'hoca_lost_chidori'), ygTagBtn(YG_BUTTON_NAME, YG_MENTORS.kakashi.tag), '{Name:"Geri.",Actions:[{Type:"CLOSE_DIALOG"}]}', adm].join(',') +
    '],Name:"hoca_diger"}'
  var hub = ' DialogData.DialogDataSet[{Name:"hoca_hub"}].Buttons'
  server.runCommandSilent('execute unless data entity ' + u + ' DialogData.DialogDataSet[{Name:"hoca_diger"}] run data modify entity ' + u + ' DialogData.DialogDataSet append value ' + diger)
  server.runCommandSilent('execute unless data entity ' + u + hub + '[{Name:"Diğer işler."}] run data modify entity ' + u + hub + ' insert 2 value {Name:"Diğer işler.",Actions:[{Type:"OPEN_NAMED_DIALOG",Cmd:"hoca_diger"}]}')
  ;['Eğitim durumum.', 'Parşömenimi kaybettim.', YG_BUTTON_NAME].forEach(n => server.runCommandSilent('data remove entity ' + u + hub + '[{Name:"' + n + '"}]'))
  // Itachi: alt menüde 'Geri.'dan önce
  var ui = YG_MENTORS.itachi.uuid
  var dg = ' DialogData.DialogDataSet[{Name:"hoca_diger"}].Buttons'
  server.runCommandSilent('execute unless data entity ' + ui + dg + '[{Name:"' + YG_BUTTON_NAME + '"}] run data modify entity ' + ui + dg + ' insert 3 value ' + ygTagBtn(YG_BUTTON_NAME, YG_MENTORS.itachi.tag))
  // Yoruichi: reddetme (Kovulma*) ve bitiş (l3_bitti*) diyaloglarının başına
  var uy = YG_MENTORS.yoruichi.uuid
  ;['Kovulma', 'Kovulma_2', 'Kovulma_3', 'l3_bitti', 'l3_bitti_2', 'l3_bitti_3'].forEach(dn => {
    var bp = ' DialogData.DialogDataSet[{Name:"' + dn + '"}].Buttons'
    server.runCommandSilent('execute unless data entity ' + uy + bp + '[{Name:"' + YG_BUTTON_NAME + '"}] run data modify entity ' + uy + bp + ' insert 0 value ' + ygTagBtn(YG_BUTTON_NAME, YG_MENTORS.yoruichi.tag))
  })
}

// ------------------------------------------------------------------ Durum
function ygClearTask(server, name, p) {
  var pd = p.persistentData
  pd.putString('yg_m', '')
  pd.putString('yg_task', '')
  pd.putString('yg_target', '')
  pd.putInt('yg_have', 0)
  pd.putInt('yg_need', 0)
  pd.putLong('yg_expire', 0)
  server.runCommandSilent('kill @e[tag=yg_iz_' + name + ']')
  server.runCommandSilent('kill @e[tag=yg_izv_' + name + ']')
  server.runCommandSilent('clear ' + name + ' minecraft:paper{ykRulo:1b}')
}

function ygReward(server, p, name, m) {
  var pd = p.persistentData
  var em = 2 + Math.floor(Math.random() * 2) + (erwinRank(p) >= 2 ? 1 : 0)
  server.runCommandSilent('give ' + name + ' minecraft:emerald ' + em)
  if (String(pd.getString('yg_day_' + m)) !== ygToday()) { pd.putString('yg_day_' + m, ygToday()); pd.putInt('yg_cnt_' + m, 0) }
  pd.putInt('yg_cnt_' + m, Number(pd.getInt('yg_cnt_' + m)) + 1)
  pd.putLong('yg_next_' + m, Date.now() + YG_COOLDOWN_MS)
  return em
}

function ygGiveRulo(server, name, m) {
  server.runCommandSilent('give ' + name + ' minecraft:paper{ykRulo:1b,display:{Name:\'{"text":"Mühürlü Rulo","color":"gold","italic":false}\',Lore:[\'{"text":"' + YG_MENTORS[m].name + '\\\'in mührü. Açma.","color":"gray","italic":false}\']}} 1')
}

function ygHasRulo(server, name) {
  return Number(server.runCommandSilent('execute if entity @a[name=' + name + ',nbt={Inventory:[{id:"minecraft:paper",tag:{ykRulo:1b}}]}]')) > 0
}

function ygCountItem(server, name, item) {
  return Number(server.runCommandSilent('clear ' + name + ' ' + item + ' 0'))
}

function ygSpawnItems(server, name, p, t, m) {
  var cx = Number(p.x), cz = Number(p.z)
  for (var i = 0; i < t.n; i++) {
    var ang = Math.random() * 2 * YG_PI
    var dist = t.radius[0] + Math.random() * (t.radius[1] - t.radius[0])
    var x = cx + Math.cos(ang) * dist
    var z = cz + Math.sin(ang) * dist
    var pos = 'execute in minecraft:overworld positioned ' + x.toFixed(1) + ' 0 ' + z.toFixed(1) + ' positioned over motion_blocking_no_leaves run summon '
    server.runCommandSilent(pos + 'minecraft:interaction ~ ~ ~ {Tags:["yg_iz","yg_iz_' + name + '"],width:1.0f,height:1.4f,response:1b}')
    // yalnızca yakından (~19 blok) görünen parlayan eşya; sayılmaz, etiketi 'yg_izv'
    server.runCommandSilent(pos + 'minecraft:item_display ~ ~ ~ {Tags:["yg_izv","yg_izv_' + name + '"],item:{id:"' + t.item + '",Count:1b},item_display:"fixed",billboard:"vertical",Glowing:1b,glow_color_override:' + YG_MENTORS[m].color + ',view_range:0.3f,transformation:{left_translation:[0f,0.9f,0f],left_rotation:[0f,0f,0f,1f],scale:[0.9f,0.9f,0.9f],right_rotation:[0f,0f,0f,1f]}}')
  }
  return Number(server.runCommandSilent('execute if entity @e[tag=yg_iz_' + name + ']'))
}

function ygFmt(text, vars) {
  var s = String(text)
  Object.keys(vars).forEach(k => { s = s.split('{' + k + '}').join(String(vars[k])) })
  return s
}

// ------------------------------------------------------------------ İstek / rapor (mentorun düğmesi)
function ygRequest(server, p, name, m) {
  var pd = p.persistentData
  var say = function (t) { ygSay(m, server, name, t) }
  if (!ygHas(p, 'rank_maceraci')) { say('Adını duymadım. Önce Maceracı olarak tanınmalısın; sonra konuşuruz.'); return }
  var now = Date.now()
  var am = String(pd.getString('yg_m'))
  if (am !== '' && Number(pd.getLong('yg_expire')) <= now) {
    ygClearTask(server, name, p)
    say('Süre dolmuş. Olsun, yeni bir iş istersen söyle.')
    return
  }
  if (am !== '' && am !== m) { say('Önce ' + YG_MENTORS[am].name + '\'in verdiği işi bitir; sonra benimle konuşursun.'); return }
  if (am === m) { ygReport(server, p, name, m); return }
  // yeni iş
  if (ygDone(p, m) >= YG_DAILY_LIMIT) { say('Bugünlük yeter. Yarın gel.'); return }
  var wait = Number(pd.getLong('yg_next_' + m)) - now
  if (wait > 0) { say('Biraz dinlen. ' + Math.ceil(wait / 60000) + ' dakika sonra yeni bir işim olabilir.'); return }
  // son 2 görev hariç rastgele seç
  var last = String(pd.getString('yg_last_' + m)).split(',').filter(x => x !== '')
  var pool = YG_TASKS[m].filter(t => last.indexOf(t.id) < 0)
  if (pool.length === 0) pool = YG_TASKS[m]
  var t = ygPick(pool)
  var rank = erwinRank(p)
  var vars = { dk: t.time, n: t.n || '', l: t.label || '' }
  if (t.type === 'haber') {
    var cand = YG_TARGETS.filter(x => x.minRank <= rank && x.key !== m && Math.sqrt(Math.pow(Number(p.x) - x.x, 2) + Math.pow(Number(p.z) - x.z, 2)) > 60)
    if (cand.length === 0) cand = YG_TARGETS.filter(x => x.key !== m)
    var tg = ygPick(cand)
    pd.putString('yg_target', tg.key)
    ygGiveRulo(server, name, m)
    vars.h = tg.name
  } else if (t.type === 'ulas') {
    var places = YG_PLACES.filter(x => { var d = Math.sqrt(Math.pow(Number(p.x) - x.x, 2) + Math.pow(Number(p.z) - x.z, 2)); return d > 80 && d < 600 })
    if (places.length === 0) places = YG_PLACES
    var pl = ygPick(places)
    pd.putString('yg_target', String(YG_PLACES.indexOf(pl)))
    vars.y = pl.name
  } else if (t.type === 'iz') {
    var spawned = ygSpawnItems(server, name, p, t, m)
    if (!(spawned >= 2)) {
      server.runCommandSilent('kill @e[tag=yg_iz_' + name + ']')
      server.runCommandSilent('kill @e[tag=yg_izv_' + name + ']')
      say('Bu civarda uygun bir yer yok gibi. Biraz açık bir yerde tekrar sor.')
      return
    }
    pd.putInt('yg_need', spawned)
    vars.n = spawned
  } else if (t.type === 'av' || t.type === 'topla') {
    pd.putInt('yg_need', t.n)
  }
  pd.putString('yg_m', m)
  pd.putString('yg_task', t.id)
  pd.putInt('yg_have', 0)
  pd.putLong('yg_expire', now + t.time * 60000)
  pd.putString('yg_last_' + m, (last.length > 0 ? last[last.length - 1] + ',' : '') + t.id)
  say(ygFmt(t.offer, vars) + ' Ekranın altında ne yapman gerektiği ve kalan süre yazar.')
}

function ygComplete(server, p, name, m, t) {
  var em = ygReward(server, p, name, m)
  ygClearTask(server, name, p)
  ygSay(m, server, name, t.done)
  ygBar(server, name, 'Ödül: ' + em + ' zümrüt', 'green')
}

function ygReport(server, p, name, m) {
  var pd = p.persistentData
  var t = ygTaskOf(m, String(pd.getString('yg_task')))
  if (!t) { ygClearTask(server, name, p); ygSay(m, server, name, 'Bir karışıklık oldu, görevi sıfırladım. Yeniden iste.'); return }
  var have = Number(pd.getInt('yg_have')), need = Number(pd.getInt('yg_need'))
  var left = Math.max(1, Math.ceil((Number(pd.getLong('yg_expire')) - Date.now()) / 60000))
  if (t.type === 'haber') {
    if (!ygHasRulo(server, name)) ygGiveRulo(server, name, m)
    var tg = YG_TARGETS.filter(x => x.key === String(pd.getString('yg_target')))[0]
    ygSay(m, server, name, 'Rulo sende, ' + (tg ? tg.name : 'hedef') + '\'e ulaştır. ' + left + ' dakikan kaldı.')
  } else if (t.type === 'iz') {
    if (have >= need) ygComplete(server, p, name, m, t)
    else ygSay(m, server, name, 'Topladığın: ' + have + '/' + need + ' ' + t.unit + '. Parlayan eşyalara sağ tıkla. ' + left + ' dakikan kaldı.')
  } else if (t.type === 'av') {
    if (have >= need) ygComplete(server, p, name, m, t)
    else ygSay(m, server, name, 'Öldürdüğün: ' + have + '/' + need + ' ' + t.unit + '. ' + left + ' dakikan kaldı.')
  } else if (t.type === 'topla') {
    var inv = ygCountItem(server, name, t.item)
    if (inv >= need) {
      server.runCommandSilent('clear ' + name + ' ' + t.item + ' ' + need)
      ygComplete(server, p, name, m, t)
    } else {
      ygSay(m, server, name, 'Sende ' + inv + '/' + need + ' ' + t.label + ' var. Eksiğini tamamla. ' + left + ' dakikan kaldı.')
    }
  } else if (t.type === 'ulas') {
    var pl = YG_PLACES[Number(pd.getString('yg_target'))]
    ygSay(m, server, name, (pl ? pl.name : 'Hedef') + '\'e gitmen gerekiyor, yeterince yaklaşman yeter. ' + left + ' dakikan kaldı.')
  }
}

// ------------------------------------------------------------------ Yardımcılar: yön oku ve yakın nesne
// Oyuncunun baktığı yöne göre ok: ↑ önünde, → sağında, ↓ arkanda, ← solunda (yaw 0 = güney, 90 = batı)
function ygArrow(dx, dz, yaw) {
  var arrows = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖']
  var bearing = Math.atan2(dx, -dz) * 180 / YG_PI
  var rel = (bearing - (Number(yaw) + 180) + 720) % 360
  return arrows[Math.round(rel / 45) % 8]
}

// Oyuncuya ait en yakın iz: { d, dx, dz } ya da null
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

// Ekranın altında sürekli görev durumu (saniyede bir)
function ygProgress(server, p, name, pd, now) {
  var m = String(pd.getString('yg_m'))
  var t = ygTaskOf(m, String(pd.getString('yg_task')))
  if (!t) return
  var left = Math.max(0, Math.ceil((Number(pd.getLong('yg_expire')) - now) / 1000))
  var time = Math.floor(left / 60) + ':' + (left % 60 < 10 ? '0' : '') + (left % 60)
  var have = Number(pd.getInt('yg_have')), need = Number(pd.getInt('yg_need'))
  var mn = YG_MENTORS[m].name
  if (t.type === 'haber') {
    var tg = YG_TARGETS.filter(x => x.key === String(pd.getString('yg_target')))[0]
    if (!tg) return
    var dx = tg.x - Number(p.x), dz = tg.z - Number(p.z)
    ygBar(server, name, 'Rulo: ' + tg.name + '\'e ulaştır  ' + ygArrow(dx, dz, p.yaw) + ' ' + Math.round(Math.sqrt(dx * dx + dz * dz)) + ' blok · ' + time, 'gold')
  } else if (t.type === 'ulas') {
    var pl = YG_PLACES[Number(pd.getString('yg_target'))]
    if (!pl) return
    var ux = pl.x - Number(p.x), uz = pl.z - Number(p.z)
    ygBar(server, name, pl.name + '\'e git  ' + ygArrow(ux, uz, p.yaw) + ' ' + Math.round(Math.sqrt(ux * ux + uz * uz)) + ' blok · ' + time, 'gold')
  } else if (t.type === 'iz') {
    if (have >= need) { ygBar(server, name, t.unit + ': ' + have + '/' + need + ' · ' + mn + '\'e dön · ' + time, 'green'); return }
    var n = ygNearestIz(server, name, p)
    // zorluk: kesin mesafe yok, yaklaşık (10'un katı) ve yön oku
    var where = n ? '  ' + ygArrow(n.dx, n.dz, p.yaw) + ' ~' + (Math.max(10, Math.round(n.d / 10) * 10)) + ' blok' : '  ara'
    ygBar(server, name, t.unit + ': ' + have + '/' + need + where + ' · ' + time, 'gold')
  } else if (t.type === 'av') {
    ygBar(server, name, t.unit + ' öldür: ' + have + '/' + need + (have >= need ? ' · ' + mn + '\'e dön' : '') + ' · ' + time, have >= need ? 'green' : 'gold')
  } else if (t.type === 'topla') {
    var inv = Math.min(need, ygCountItem(server, name, t.item))
    ygBar(server, name, t.label + ': ' + inv + '/' + need + (inv >= need ? ' · ' + mn + '\'e dön' : '') + ' · ' + time, inv >= need ? 'green' : 'gold')
  }
}

var ygPhase = 0

ServerEvents.tick(event => {
  ygPhase++
  var server = event.server
  if (ygPhase === 40 || ygPhase % 200 === 0) ygEnsureButtons(server)
  if (ygPhase % 4 !== 0) return
  server.players.forEach(p => {
    try {
      var name = String(p.username)
      Object.keys(YG_MENTORS).forEach(m => {
        if (ygHas(p, YG_MENTORS[m].tag)) {
          server.runCommandSilent('tag ' + name + ' remove ' + YG_MENTORS[m].tag)
          ygRequest(server, p, name, m)
        }
      })
      var pd = p.persistentData
      var m = String(pd.getString('yg_m'))
      if (m === '') return
      var now = Date.now()
      if (Number(pd.getLong('yg_expire')) <= now) {
        ygClearTask(server, name, p)
        ygBar(server, name, YG_MENTORS[m].name + '\'in işi için süre doldu.', 'gray')
        return
      }
      var t = ygTaskOf(m, String(pd.getString('yg_task')))
      if (!t) return
      if (ygPhase % 20 === 0) ygProgress(server, p, name, pd, now)
      if (t.type === 'haber' && ygPhase % 8 === 0) {
        var tg = YG_TARGETS.filter(x => x.key === String(pd.getString('yg_target')))[0]
        if (!tg) return
        var dx = Number(p.x) - tg.x, dz = Number(p.z) - tg.z, dy = Math.abs(Number(p.y) - tg.y)
        if (Math.sqrt(dx * dx + dz * dz) <= 4.5 && dy <= 4 && ygHasRulo(server, name)) {
          var em = ygReward(server, p, name, m)
          ygClearTask(server, name, p)
          npcDlgSay(server, tg.uuid, tg.dlg, name, tg.line, false, x => ygBar(server, name, tg.name + ': ' + x, 'gold'))
          ygBar(server, name, 'Ödül: ' + em + ' zümrüt. ' + YG_MENTORS[m].name + '\'e haber vermene gerek yok.', 'green')
        }
      }
      if (t.type === 'ulas' && ygPhase % 8 === 0) {
        var pl = YG_PLACES[Number(pd.getString('yg_target'))]
        if (pl && Math.sqrt(Math.pow(Number(p.x) - pl.x, 2) + Math.pow(Number(p.z) - pl.z, 2)) <= pl.r) {
          var em2 = ygReward(server, p, name, m)
          ygClearTask(server, name, p)
          npcBarSay(server, name, YG_MENTORS[m].name, t.done, 'gold')
          ygBar(server, name, 'Ödül: ' + em2 + ' zümrüt', 'green')
        }
      }
      if (t.type === 'iz' && ygPhase % 20 === 0) {
        server.runCommandSilent('execute as @e[tag=yg_iz_' + name + '] at @s run particle minecraft:enchant ~ ~1.0 ~ 0.3 0.5 0.3 0.3 6 normal ' + name)
      }
    } catch (e) {
      console.error('yan gorev hata: ' + e)
    }
  })
})

// Canavar öldürme sayacı (av görevi)
EntityEvents.death(event => {
  try {
    var src = event.source.actual
    if (!src || !src.isPlayer()) return
    var pd = src.persistentData
    if (String(pd.getString('yg_m')) === '') return
    var t = ygTaskOf(String(pd.getString('yg_m')), String(pd.getString('yg_task')))
    if (!t || t.type !== 'av') return
    var isMonster = false
    try { isMonster = String(event.entity.getType().getCategory().getName()) === 'monster' } catch (e0) { isMonster = false }
    if (!isMonster) return
    var have = Number(pd.getInt('yg_have'))
    if (have >= Number(pd.getInt('yg_need'))) return
    pd.putInt('yg_have', have + 1)
  } catch (e) {
    console.error('yan gorev olum hata: ' + e)
  }
})

// Parlayan eşyaya sağ tık (iz görevi)
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
    if (!mine) { ygBar(server, name, 'Bu sana ait değil.', 'gray'); return }
    var pd = p.persistentData
    var tk = ygTaskOf(String(pd.getString('yg_m')), String(pd.getString('yg_task')))
    if (!tk || tk.type !== 'iz') return
    server.runCommandSilent('execute at ' + String(t.uuid) + ' run particle minecraft:end_rod ~ ~1 ~ 0.3 0.5 0.3 0.05 20 force ' + name)
    server.runCommandSilent('playsound minecraft:entity.experience_orb.pickup master ' + name + ' ~ ~ ~ 0.8 1.2')
    server.runCommandSilent('execute at ' + String(t.uuid) + ' run kill @e[tag=yg_izv_' + name + ',distance=..2]')
    server.runCommandSilent('kill ' + String(t.uuid))
    var have = Number(pd.getInt('yg_have')) + 1
    pd.putInt('yg_have', have)
    var need = Number(pd.getInt('yg_need'))
    if (have >= need) ygBar(server, name, 'Hepsi toplandı! ' + YG_MENTORS[String(pd.getString('yg_m'))].name + '\'e dön.', 'gold')
    else ygBar(server, name, tk.unit + ' bulundu: ' + have + '/' + need, 'gold')
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
    Object.keys(YG_MENTORS).forEach(m => { pd.putLong('yg_next_' + m, 0); pd.putInt('yg_cnt_' + m, 0); pd.putString('yg_last_' + m, '') })
    ctx.source.sendSuccess(Text.of(name + ' için yan görevler sıfırlandı.'), false)
    return 1
  })))
  // /kakashi_menu_kontrol: mentor menülerini kurar ve Kakashi'nin ana menü ile alt menü düğmelerini yazar (tanı komutu)
  event.register(Commands.literal('kakashi_menu_kontrol').requires(s => s.hasPermission(2)).executes(ctx => {
    var server = ctx.source.server
    ygEnsureButtons(server)
    var out = []
    try {
      var e = server.overworld().getEntity(Java.loadClass('java.util.UUID').fromString(YG_MENTORS.kakashi.uuid))
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
