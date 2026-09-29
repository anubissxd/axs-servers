// Thorfinn (eski Çiftçi Tobias): mevcut NPC'nin adını, dokusunu, diyaloglarını ve yönlendirmelerini yeniler.
// Mantık kubejs/server_scripts/thorfinn_ticaret.js içindedir; buradaki düğmeler yalnızca 'thor_*' etiketi verir.
// Kullanım: node gen_thorfinn.js <datapack klasörü> <owner-uuid>   (sonra konsolda 'reload' ve 'function yoruichi:thorfinn_diyalog')
// Easy NPC bir diyalogda en fazla 6 görünür düğmeyi düzgün dizer (fazlası üst üste biner); yönetici düğmesi yalnızca <=5 düğmede eklenir.
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const [root, owner] = process.argv.slice(2)
if (!root || !owner) {
  console.error('kullanim: node gen_thorfinn.js <datapack klasoru> <owner-uuid>')
  process.exit(1)
}
const NPC_UUID = '1e6fe9d9-ae31-4abf-8b86-0bcc093b2413' // eski Çiftçi Tobias (aynı NPC)
const X = -979.5
const Z = -371.5
const SKIN_URL = 'https://raw.githubusercontent.com/anubissxd/minecraft-servers/main/assets/npc-skins/thorfinn_v1.png'
const BS = String.fromCharCode(92)
const NL = String.fromCharCode(10)

function uuidToInts(u) {
  const h = u.replace(/-/g, '')
  const out = []
  for (let i = 0; i < 4; i++) out.push(BigInt.asIntN(32, BigInt('0x' + h.slice(i * 8, i * 8 + 8))).toString())
  return '[I;' + out.join(',') + ']'
}
function nameUuid(str) {
  const h = crypto.createHash('md5').update(Buffer.from(str, 'utf8')).digest()
  h[6] = (h[6] & 0x0f) | 0x30
  h[8] = (h[8] & 0x3f) | 0x80
  const x = h.toString('hex')
  return x.slice(0, 8) + '-' + x.slice(8, 12) + '-' + x.slice(12, 16) + '-' + x.slice(16, 20) + '-' + x.slice(20)
}
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

const dialogs = [
  dialog('thor_ilk', 'Yolcu. Adım Thorfinn. Bir zamanlar kılıç taşırdım; şimdi toprak sürüyorum. Caddy\'de ne alınıp ne satılacaksa benden geçer. Ama baştan söyleyeyim: burada hiçbir şey ucuz değil. Toprak da öyle, emek de. Kolay kazanılan şey kolay harcanır. Ne istiyorsun?', [
    btn('Seninle ticaret konuşmak istiyorum.', [tag('thor_met'), open('thor_hub')], 'thor_kabul')
  ], 'thor_ilk'),
  dialog('thor_hub', 'Toprak yalan söylemez; emeğin karşılığını verir. Mallarım rütbesi olana açık, bedeli zümrütle ödersin. Ya da bana bir iş yaparsın: ambarımın açığı var.', [
    btn('Ticaret.', [tag('thor_shop'), CLOSE]),
    btn('Hasat siparişi.', [tag('thor_ord'), CLOSE]),
    btn('Diğer işler.', [open('thor_diger')]),
    btn('Ayrılıyorum.', [CLOSE])
  ], 'thor_hub'),
  dialog('thor_diger', 'Başka bir şey mi?', [
    btn('Siparişim nasıl?', [tag('thor_info'), CLOSE]),
    btn('Siparişi bırakıyorum.', [tag('thor_abort'), CLOSE]),
    btn('Stok durumu.', [tag('thor_stok'), CLOSE]),
    btn('Toprak kaydım.', [tag('thor_kayit'), CLOSE]),
    btn('Geri.', [CLOSE])
  ], 'thor_diger')
]
function route(dlg, cond) {
  return '{Type:"COMMAND",PermLevel:3,Cmd:' + q('/execute as @initiator if entity @s[' + cond + '] run easy_npc dialog open ' + NPC_UUID + ' @s ' + dlg) + '}'
}
const routes = [
  route('thor_ilk', 'tag=!thor_met'),
  route('thor_hub', 'tag=thor_met')
]
const SEL = NPC_UUID
const cx = Math.floor(X)
const cz = Math.floor(Z)
const out = [
  '# Thorfinn (eski Çiftçi Tobias) yenileme. Üretici: tools/yoruichi/gen_thorfinn.js',
  'forceload add ' + cx + ' ' + cz,
  'data modify entity ' + SEL + ' CustomName set value ' + q('{"color":"#C8A165","text":"Thorfinn"}'),
  'data modify entity ' + SEL + ' SkinData set value {Type:"SECURE_REMOTE_URL",URL:' + q(SKIN_URL) + ',UUID:' + uuidToInts(nameUuid(SKIN_URL)) + '}',
  'tag ' + SEL + ' add thorfinn_npc',
  'data modify entity ' + SEL + ' ActionData set value {ActionEventSet:{ON_INTERACTION:[' + routes.join(',') + ']}}',
  'data modify entity ' + SEL + ' DialogData set value {Type:"CUSTOM",DialogDataSet:[' + dialogs.join(',') + ']}',
  'data modify entity ' + SEL + ' Owner set value ' + uuidToInts(owner),
  'data modify entity ' + SEL + ' ActionData.ActionPermissionLevel set value 3',
  'forceload remove ' + cx + ' ' + cz,
  'say Thorfinn kuruldu.'
]
const fnDir = path.join(root, 'data', 'yoruichi', 'functions')
fs.mkdirSync(fnDir, { recursive: true })
fs.writeFileSync(path.join(fnDir, 'thorfinn_diyalog.mcfunction'), out.join(NL) + NL)
console.log('ok thorfinn')
