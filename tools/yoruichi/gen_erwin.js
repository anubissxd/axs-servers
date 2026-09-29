// Erwin Smith: sefer diyaloglari ve yonlendirmeleri (Easy NPC) icin datapack fonksiyonu uretir.
// Mantik kubejs/server_scripts/erwin_seferleri.js icindedir; buradaki dugmeler yalnizca 'erwin_*' etiketi verir.
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
const TRADE_ID = '[I;1305766263,957300831,-2141226545,-598731039]' // Aldric'ten kalan mevcut ticaret kaydi
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
    (label ? 'Label:' + q(label) + ',' : '') + 'Buttons:[' + buttons.concat([adminBtn]).join(',') + '],Name:' + q(name) + '}'
}
const tag = t => action('/tag @initiator add ' + t)

const HUB_TEXT = [
  'Yeminsiz. Adını duydum ama henüz kimse senin için yemin etmedi. Sisin içinde küçük işlerle başla; karanlık seni tanısın.',
  'Kül Bekçisi. Küllerin ötesine geçebilirsin artık. Hangi avın peşine düşeceksin?',
  'Kan Yeminli. Karanlığın derinleri seni bekliyor. Dikkatli seç, dikkatli in.',
  'Gece Avcısı. Kan sözleri için adın fısıldanıyor. Hazırsan konuşalım.',
  'Eşik Muhafızı. Kıyamet seferleri yalnızca senin gibi birine emanet edilir. Söyle, hangi kapıyı kapatıyoruz?'
]
function hubButtons() {
  return [
    btn('Sefer istiyorum.', [tag('erwin_req'), CLOSE]),
    btn('Rapor veriyorum.', [tag('erwin_rep'), CLOSE]),
    btn('Seferim nasıl gidiyor?', [tag('erwin_info'), CLOSE]),
    btn('Birlik kaydım.', [tag('erwin_stat'), CLOSE]),
    btn('Sefer defterim.', [tag('erwin_log'), CLOSE]),
    btn('Seferi bırakıyorum.', [tag('erwin_abort'), CLOSE]),
    btn('Tedarik.', ['{Type:"OPEN_TRADING_SCREEN",Id:' + TRADE_ID + '}']),
    btn('Ayrılıyorum.', [CLOSE])
  ]
}
const dialogs = [
  dialog('erwin_ret', 'Keşif Birliği herkesi kabul etmez. Sınırdaki tehlike gerçek; kılıç tutmayı bilenler gelir. Önce Maceracı olarak adını duyur, sonra konuşuruz.', [btn('Anlıyorum.', [CLOSE])], 'erwin_ret'),
  dialog('erwin_ilk', 'Ben Erwin Smith, Keşif Birliği\'nin komutanıyım. Caddy\'nin sınırlarında, duvarların ötesinde gördüklerimizi kimseye anlatamazsın; ama onlarla savaşacak insanlara ihtiyacım var. Seferler bana yazılan raporlardan doğar: her sefer bir hedef, bir bedel ve bir ödül. Küçük başlarsın; iyi dönersen daha derine gönderirim. Ölümcül seferler ise yalnızca hayatta kalanlara açılır. Ne dersin?', [
    btn('Katılıyorum.', [tag('erwin_met'), open('erwin_hub_0')], 'erwin_kabul')
  ], 'erwin_ilk')
]
for (let r = 0; r < 5; r++) dialogs.push(dialog('erwin_hub_' + r, HUB_TEXT[r], hubButtons(), 'erwin_hub_' + r))

function route(dlg, cond) {
  return '{Type:"COMMAND",PermLevel:3,Cmd:' + q('/execute as @initiator if entity @s[' + cond + '] run easy_npc dialog open ' + ERWIN + ' @s ' + dlg) + '}'
}
const routes = [
  route('erwin_ret', 'tag=!rank_maceraci'),
  route('erwin_ilk', 'tag=rank_maceraci,tag=!erwin_met'),
  route('erwin_hub_0', 'tag=rank_maceraci,tag=erwin_met,tag=!erwin_rank_1,tag=!erwin_rank_2,tag=!erwin_rank_3,tag=!erwin_rank_4')
]
for (let r = 1; r <= 4; r++) routes.push(route('erwin_hub_' + r, 'tag=rank_maceraci,tag=erwin_met,tag=erwin_rank_' + r))

const out = [
  '# Erwin Smith: sefer diyalogları. Üretici: tools/yoruichi/gen_erwin.js',
  'data modify entity ' + ERWIN + ' ActionData set value {ActionEventSet:{ON_INTERACTION:[' + routes.join(',') + ']}}',
  'data modify entity ' + ERWIN + ' DialogData set value {Type:"CUSTOM",DialogDataSet:[' + dialogs.join(',') + ']}',
  'data modify entity ' + ERWIN + ' Owner set value ' + uuidToInts(process.argv[3]),
  'data modify entity ' + ERWIN + ' ActionData.ActionPermissionLevel set value 3',
  'say Erwin Smith sefer diyalogları kuruldu.'
]
const fnDir = path.join(process.argv[2], 'data', 'yoruichi', 'functions')
fs.mkdirSync(fnDir, { recursive: true })
fs.writeFileSync(path.join(fnDir, 'erwin_setup.mcfunction'), out.join(NL) + NL)
console.log('ok', out[1].length, out[2].length)
