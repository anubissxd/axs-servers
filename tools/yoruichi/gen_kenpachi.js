// Kenpachi (Bleach): Drondra Kralı'nın koruyucusu. NPC'yi verilen konuma doğurur, diyalogları ve yönlendirmeyi kurar.
// Mantık kubejs/server_scripts/kenpachi.js içindedir; buradaki düğmeler yalnızca 'kenpachi_*' etiketi verir.
// Kullanım: node gen_kenpachi.js <datapack klasörü> <owner-uuid> [x y z yaw]   (varsayılan -630 68 -438 0)
//   sonra konsolda 'reload' ve 'function yoruichi:kenpachi_kur'. Kurulum yükü çözmek için geçici forceload kullanır.
// Aynı NPC'nin yalnızca diyaloglarını yenilemek için KENPACHI_UUID=<npc-uuid> ver: 'kenpachi_diyalog' fonksiyonu da üretilir.
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const [root, owner, X0, Y0, Z0, YAW0] = process.argv.slice(2)
if (!root || !owner) {
  console.error('kullanim: node gen_kenpachi.js <datapack klasoru> <owner-uuid> [x y z yaw]')
  process.exit(1)
}
const X = X0 !== undefined ? X0 : '-630'
const Y = Y0 !== undefined ? Y0 : '68'
const Z = Z0 !== undefined ? Z0 : '-438'
const YAW = YAW0 !== undefined ? YAW0 : '0'
const UUID = process.env.KENPACHI_UUID || crypto.randomUUID()
const SKIN_URL = 'https://raw.githubusercontent.com/anubissxd/minecraft-servers/main/assets/npc-skins/kenpachi_v1.png'
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
const CLOSE = '{Type:"CLOSE_DIALOG"}'
const adminBtn = '{Conditions:[{Type:"PLAYER_TAG",Name:"rank_admin"}],Name:"[Admin] Kapat",Actions:[' + CLOSE + ']}'
function btn(name, actions, label) { return '{Name:' + q(name) + (label ? ',Label:' + q(label) : '') + ',Actions:[' + actions.join(',') + ']}' }
// Easy NPC bir diyalogda en fazla 6 görünür düğmeyi düzgün dizer; yönetici düğmesi yalnızca <=5 düğmede eklenir.
function dialog(name, text, buttons, label) {
  return '{Options:{AllowEscClose:0,ShowCloseButton:0,ButtonConditionMode:"HIDE"},Texts:[{Text:' + q(text) + '}],' +
    (label ? 'Label:' + q(label) + ',' : '') + 'Buttons:[' + (buttons.length <= 5 ? buttons.concat([adminBtn]) : buttons).join(',') + '],Name:' + q(name) + '}'
}
const tag = t => action('/tag @initiator add ' + t)

// Karşılama sürümleri (sürüm 1 orijinal). Hangisi açılacağı oyuncudaki dv_kenpachi_<n> etiketine bağlıdır (npc_cesitlilik.js).
const HUB_VARIANTS = [
  'Hm. Bir sinek daha. Kralın kapısına kadar gelmişsin... yürüyüşün bile zayıf. Ne var, çabuk söyle. Sıkılırsam kılıcımı çekerim, ve o zaman konuşacak kimse kalmaz.',
  'Hah! Yine mi? Kılıcımı çekmeden seni ezmek istemiyorum. Sıkıcı olurdu.',
  'Ne bakıyorsun? Kralın kapısındayım, sen bir sinek gibi vızıldıyorsun. Söyle.',
  'Uğraşmak istemiyorum. Ya bir şey söyle ya da defol.'
]
const hubButtons = () => [
  btn('Kralla görüşmek istiyorum.', [tag('kenpachi_kral'), CLOSE]),
  btn('Kimsin sen?', [tag('kenpachi_kim'), CLOSE]),
  btn('Seninle dövüşmek istiyorum.', [tag('kenpachi_dovus'), CLOSE]),
  btn('Ayrılıyorum.', [CLOSE])
]
const dialogs = [
  ...HUB_VARIANTS.map((txt, i) => { const nm = i === 0 ? 'kenpachi_hub' : 'kenpachi_hub_' + (i + 1); return dialog(nm, txt, hubButtons(), nm) })
]
const open = n => '{Type:"COMMAND",PermLevel:3,Cmd:' + q('/execute as @initiator if entity @s[' + n.cond + '] run easy_npc dialog open ' + UUID + ' @s ' + n.dlg) + '}'
const routes = [
  ...HUB_VARIANTS.map((txt, i) => open({ dlg: i === 0 ? 'kenpachi_hub' : 'kenpachi_hub_' + (i + 1), cond: 'tag=dv_kenpachi_' + (i + 1) })),
  open({ dlg: 'kenpachi_hub', cond: HUB_VARIANTS.map((x, i) => 'tag=!dv_kenpachi_' + (i + 1)).join(',') }),
  action('/tag @initiator add dv_reroll_kenpachi')
]
const skinUuid = uuidToInts(nameUuid(SKIN_URL))
const NAME = q('{"color":"#B22222","text":"Kenpachi"}')
const cx = Math.floor(Number(X))
const cz = Math.floor(Number(Z))

const nbt = '{UUID:' + uuidToInts(UUID) + ',CustomName:' + NAME + ',Tags:["korunan","kenpachi_npc"],' +
  'Invulnerable:1b,PersistenceRequired:1b,EasyNPCVersion:3,Rotation:[' + YAW + 'f,0f],' +
  'EntityAttribute:{IsInvulnerable:1b,IsImmovable:1b,IsPushable:0b,PushEntities:0b,IsKnockbackResistant:1b,IsAttackableByPlayers:0b,IsAttackableByMonsters:0b,IsExplosionResistant:1b},' +
  'SkinData:{Type:"SECURE_REMOTE_URL",URL:' + q(SKIN_URL) + ',UUID:' + skinUuid + '},' +
  'ObjectiveData:{HasObjectives:1b,ObjectiveDataSet:[{Type:"LOOK_AT_PLAYER"},{Type:"LOOK_AT_MOB"},{Type:"LOOK_AT_RESET"}]},' +
  'Owner:' + uuidToInts(owner) + ',ActionData:{ActionPermissionLevel:3,ActionEventSet:{ON_INTERACTION:[' + routes.join(',') + ']}},' +
  'DialogData:{Type:"CUSTOM",DialogDataSet:[' + dialogs.join(',') + ']}}'

const out = [
  '# Kenpachi NPC kurulumu. Üretici: tools/yoruichi/gen_kenpachi.js',
  'forceload add ' + cx + ' ' + cz,
  'execute in minecraft:overworld run summon easy_npc:humanoid ' + X + ' ' + Y + ' ' + Z + ' ' + nbt,
  'data modify entity ' + UUID + ' Owner set value ' + uuidToInts(owner),
  'data modify entity ' + UUID + ' ActionData.ActionPermissionLevel set value 3',
  'forceload remove ' + cx + ' ' + cz,
  'say Kenpachi kuruldu.'
]
const upd1 = ['# Kenpachi diyalog yenileme, 1. aşama.', 'forceload add ' + cx + ' ' + cz, 'schedule function yoruichi:kenpachi_diyalog2 60t replace']
const upd2 = [
  '# Kenpachi diyalog yenileme, 2. aşama.',
  'data modify entity ' + UUID + ' ActionData.ActionEventSet set value {ON_INTERACTION:[' + routes.join(',') + ']}',
  'data modify entity ' + UUID + ' DialogData set value {Type:"CUSTOM",DialogDataSet:[' + dialogs.join(',') + ']}',
  'forceload remove ' + cx + ' ' + cz,
  'say Kenpachi diyalogları yenilendi.'
]
const fnDir = path.join(root, 'data', 'yoruichi', 'functions')
fs.mkdirSync(fnDir, { recursive: true })
fs.writeFileSync(path.join(fnDir, 'kenpachi_kur.mcfunction'), out.join(NL) + NL)
fs.writeFileSync(path.join(fnDir, 'kenpachi_diyalog.mcfunction'), upd1.join(NL) + NL)
fs.writeFileSync(path.join(fnDir, 'kenpachi_diyalog2.mcfunction'), upd2.join(NL) + NL)
console.log('ok kenpachi uuid', UUID)
