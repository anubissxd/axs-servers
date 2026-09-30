// Erwin Smith: sefer diyaloglari ve yonlendirmeleri (Easy NPC) icin datapack fonksiyonu uretir.
// Mantik kubejs/server_scripts/erwin_seferleri.js icindedir; buradaki dugmeler yalnizca 'erwin_*' etiketi verir.
// Easy NPC bir diyalogda en fazla 6 gorunur dugmeyi duzenleyebilir (fazlasi ust uste biner); yonetici dugmesi yalnizca <=5 dugmede eklenir.
// Kullanim: node gen_erwin.js <datapack klasoru> <owner-uuid>   (sonra konsolda 'reload' ve 'function yoruichi:erwin_setup'; oyuncu cevrimdisi olabilir)
const fs = require('fs')
function uuidToInts(u) {
  const h = u.replace(/-/g, '')
  const out = []
  for (let i = 0; i < 4; i++) out.push(BigInt.asIntN(32, BigInt('0x' + h.slice(i * 8, i * 8 + 8))).toString())
  return '[I;' + out.join(',') + ']'
}
const path = require('path')
const ERWIN = '504788d8-3dc0-407e-aebf-ca04dc17cfcb'
const BS = String.fromCharCode(92)
const NL = String.fromCharCode(10)
function q(s) { return '"' + s.split(BS).join(BS + BS).split('"').join(BS + '"') + '"' }
function action(cmd) { return '{Type:"COMMAND",PermLevel:3,Cmd:' + q(cmd) + '}' }
function open(name) { return '{Type:"OPEN_NAMED_DIALOG",Cmd:' + q(name) + '}' }
const CLOSE = '{Type:"CLOSE_DIALOG"}'
const adminBtn = '{Conditions:[{Type:"PLAYER_TAG",Name:"rank_admin"}],Name:"[Admin] Kapat",Actions:[' + CLOSE + ']}'
function btn(name, actions, label) { return '{Name:' + q(name) + (label ? ',Label:' + q(label) : '') + ',Actions:[' + actions.join(',') + ']}' }
function dialog(name, text, buttons, label) {
  return '{Options:{AllowEscClose:0,ShowCloseButton:0,ButtonConditionMode:"HIDE"},Texts:[{Text:' + q(text) + '}],' +
    (label ? 'Label:' + q(label) + ',' : '') + 'Buttons:[' + (buttons.length <= 5 ? buttons.concat([adminBtn]) : buttons).join(',') + '],Name:' + q(name) + '}'
}
const tag = t => action('/tag @initiator add ' + t)

// Her rütbe için 4 karşılama sürümü (sürüm 1 orijinal metin). Hangisi açılacağı oyuncudaki dv_erwin_<n> etiketine bağlıdır (npc_cesitlilik.js).
const HUB_VARIANTS = [
  [
    'Yeminsiz. Adını duydum ama henüz kimse senin için yemin etmedi. Sisin içinde küçük işlerle başla; karanlık seni tanısın.',
    'Yeminsiz... Bu unvan kimseyi korumaz, ama herkesin bir yerden başlaması gerekir. Sis seni bekliyor.',
    'Yine sen. Henüz bir rütben yok ama gözlerin kararlı. Küçük bir işle başla, gerisi gelir.',
    'Duvarların ötesinde ne olduğunu bilmiyorsun. Öğrenmenin yolu küçük adımlardan geçiyor. Bir sefer al.'
  ],
  [
    'Kül Bekçisi. Küllerin ötesine geçebilirsin artık. Hangi avın peşine düşeceksin?',
    'Kül Bekçisi. Ateşin söndüğü yerde yürüyorsun. Fazla derine inme; henüz hazır değilsin.',
    'Kül Bekçisi, yeniden burada. Ambar açık, seferler seni bekliyor. Söyle.',
    'Küllerin altında hâlâ sıcak bir şey var. Onu bulmak istiyorsan bir sefer al.'
  ],
  [
    'Kan Yeminli. Karanlığın derinleri seni bekliyor. Dikkatli seç, dikkatli in.',
    'Kan Yeminli. Yeminini tutmak, ilk adımı atmaktan zordur. Bugün ne yapıyoruz?',
    'Yine dönmüşsün. Bu iyi. Dönmeyenlerin isimlerini defterime yazıyorum.',
    'Kan Yeminli, sefer masası açık. Karanlık sabırsız değil, ama ben sabırsızım.'
  ],
  [
    'Gece Avcısı. Kan sözleri için adın fısıldanıyor. Hazırsan konuşalım.',
    'Gece Avcısı. Sana gösterdiğim her yol biraz daha dar. Yürümeye hazır mısın?',
    'Bazıları gece avcısı olur, bazıları gecenin avı. Sen hangisisin? Kanıtla.',
    'Gece Avcısı, seferler artık kolay değil. Ama kolay olsaydı seni çağırmazdım.'
  ],
  [
    'Eşik Muhafızı. Kıyamet seferleri yalnızca senin gibi birine emanet edilir. Söyle, hangi kapıyı kapatıyoruz?',
    'Eşik Muhafızı. Kapılar açılıyor. Sen kapatanlardan olacaksın, değil mi?',
    'Eşik Muhafızı, yine dönmen bir zafer. Bu sefer hangi kıyameti erteliyoruz?',
    'Komutan olarak söylüyorum: senin gibileri geri döndürmek benim işim. Şimdi seferini seç.'
  ]
]
const HUB_TEXT = [
  'Yeminsiz. Adını duydum ama henüz kimse senin için yemin etmedi. Sisin içinde küçük işlerle başla; karanlık seni tanısın.',
  'Kül Bekçisi. Küllerin ötesine geçebilirsin artık. Hangi avın peşine düşeceksin?',
  'Kan Yeminli. Karanlığın derinleri seni bekliyor. Dikkatli seç, dikkatli in.',
  'Gece Avcısı. Kan sözleri için adın fısıldanıyor. Hazırsan konuşalım.',
  'Eşik Muhafızı. Kıyamet seferleri yalnızca senin gibi birine emanet edilir. Söyle, hangi kapıyı kapatıyoruz?'
]
// Rütbe dükkânı Thorfinn'e taşındı (thorfinn_ticaret.js); Erwin'deki düğme yalnızca yönlendirir.
function hubButtons() {
  return [
    btn('Sefer / rapor.', [tag('erwin_req'), CLOSE]),
    btn('Seferi bırakıyorum.', [tag('erwin_abort'), CLOSE]),
    btn('Ambar nerede?', [tag('erwin_ambar'), CLOSE]),
    btn('Diğer işler.', [open('erwin_diger')]),
    btn('Ayrılıyorum.', [CLOSE])
  ]
}
function digerButtons() {
  return [
    btn('Seferim nasıl gidiyor?', [tag('erwin_info'), CLOSE]),
    btn('Birlik kaydım.', [tag('erwin_stat'), CLOSE]),
    btn('Sefer defterim.', [tag('erwin_log'), CLOSE]),
    btn('Geri.', [CLOSE])
  ]
}
const dialogs = [
  dialog('erwin_diger', 'Başka bir işin mi var?', digerButtons(), 'erwin_diger'),
  // Script (erwin_seferleri.js erwinSay) bu diyaloğun metnini her cevapta yazıp oyuncuya açar; buradaki metin yalnızca yer tutucudur.
  dialog('erwin_yanit', '...', [btn('Tamam.', [CLOSE])], 'erwin_yanit'),
  dialog('erwin_ret','Keşif Birliği herkesi kabul etmez. Sınırdaki tehlike gerçek; kılıç tutmayı bilenler gelir. Önce Maceracı olarak adını duyur, sonra konuşuruz.', [btn('Anlıyorum.', [CLOSE])], 'erwin_ret'),
  dialog('erwin_ilk', 'Ben Erwin Smith, Keşif Birliği\'nin komutanıyım. Caddy\'nin sınırlarında, duvarların ötesinde gördüklerimizi kimseye anlatamazsın; ama onlarla savaşacak insanlara ihtiyacım var. Seferler bana yazılan raporlardan doğar: her sefer bir hedef, bir bedel ve bir ödül. Küçük başlarsın; iyi dönersen daha derine gönderirim. Ölümcül seferler ise yalnızca hayatta kalanlara açılır. Ne dersin?', [
    btn('Katılıyorum.', [tag('erwin_met'), open('erwin_hub_0')], 'erwin_kabul')
  ], 'erwin_ilk')
]
// Sefer teklifleri: erwin_teklif_<n> (seç) ve erwin_bahis_<n> (Kan Bahsi); n = teklif sayısı. Metin ve düğme adları script tarafından (erwinOfferDialog) her teklifte yazılır.
const PICK_LETTERS = ['A', 'B', 'C']
const pick = v => action('/scoreboard players set @initiator erwin_pick ' + v)
for (let n = 1; n <= 3; n++) {
  const sel = [], bet = []
  for (let i = 0; i < n; i++) {
    sel.push(btn(PICK_LETTERS[i], [pick(i + 1), CLOSE]))
    bet.push(btn('☠ ' + PICK_LETTERS[i], [pick(i + 11), CLOSE]))
  }
  sel.push(btn('☠ Kan Bahsi ile seç.', [open('erwin_bahis_' + n)]))
  sel.push(btn('Şimdilik kalsın.', [CLOSE]))
  bet.push(btn('Geri.', [open('erwin_teklif_' + n)]))
  dialogs.push(dialog('erwin_teklif_' + n, '...', sel, 'erwin_teklif_' + n))
  dialogs.push(dialog('erwin_bahis_' + n, '...', bet, 'erwin_bahis_' + n))
}
for (let r = 0; r < 5; r++) HUB_VARIANTS[r].forEach((t, k) => { const nm = k === 0 ? 'erwin_hub_' + r : 'erwin_hub_' + r + '_' + (k + 1); dialogs.push(dialog(nm, t, hubButtons(), nm)) })

function route(dlg, cond) {
  return '{Type:"COMMAND",PermLevel:3,Cmd:' + q('/execute as @initiator if entity @s[' + cond + '] run easy_npc dialog open ' + ERWIN + ' @s ' + dlg) + '}'
}
const routes = [
  route('erwin_ret', 'tag=!rank_maceraci'),
  route('erwin_ilk', 'tag=rank_maceraci,tag=!erwin_met')
]
const V = HUB_VARIANTS[0].length
for (let r = 0; r <= 4; r++) {
  const rankCond = r === 0 ? 'tag=!erwin_rank_1,tag=!erwin_rank_2,tag=!erwin_rank_3,tag=!erwin_rank_4' : 'tag=erwin_rank_' + r
  const base = 'tag=rank_maceraci,tag=erwin_met,' + rankCond
  for (let k = 1; k <= V; k++) routes.push(route(k === 1 ? 'erwin_hub_' + r : 'erwin_hub_' + r + '_' + k, base + ',tag=dv_erwin_' + k))
  // hiç sürüm etiketi yoksa ilk sürüm
  routes.push(route('erwin_hub_' + r, base + Array.from({ length: V }, (_, i) => ',tag=!dv_erwin_' + (i + 1)).join('')))
}
// her etkileşimden sonra yeni sürüm seçilir (npc_cesitlilik.js)
routes.push(action('/execute as @initiator if entity @s[tag=erwin_met] run tag @s add dv_reroll_erwin'))

// İki aşamalı: önce yığın yüklenir (forceload), 3 sn sonra yazılır; aynı tikte yazmak yüklenmemiş yığında sessizce başarısız olur.
const out1 = [
  '# Erwin Smith diyalog kurulumu, 1. aşama. Üretici: tools/yoruichi/gen_erwin.js',
  'forceload add -989 -372',
  'schedule function yoruichi:erwin_setup2 60t replace'
]
const out = [
  '# Erwin Smith diyalog kurulumu, 2. aşama.',
  'data modify entity ' + ERWIN + ' ActionData set value {ActionEventSet:{ON_INTERACTION:[' + routes.join(',') + ']}}',
  'data modify entity ' + ERWIN + ' DialogData set value {Type:"CUSTOM",DialogDataSet:[' + dialogs.join(',') + ']}',
  'data modify entity ' + ERWIN + ' Owner set value ' + uuidToInts(process.argv[3]),
  'data modify entity ' + ERWIN + ' ActionData.ActionPermissionLevel set value 3',
  'forceload remove -989 -372',
  'say Erwin Smith sefer diyalogları kuruldu.'
]

const fnDir = path.join(process.argv[2], 'data', 'yoruichi', 'functions')
fs.mkdirSync(fnDir, { recursive: true })
fs.writeFileSync(path.join(fnDir, 'erwin_setup.mcfunction'), out1.join(NL) + NL)
fs.writeFileSync(path.join(fnDir, 'erwin_setup2.mcfunction'), out.join(NL) + NL)
console.log('ok', out[1].length, out[2].length)
