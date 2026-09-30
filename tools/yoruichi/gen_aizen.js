// Aizen (Bleach): Caddy'de yardımsever bir âlim gibi başlar, sunucu geneli bir olayla kötü karaktere dönüşür (bkz. kubejs/server_scripts/aizen.js).
// NPC'yi verilen oyuncunun BULUNDUĞU konuma doğurur: kurulum fonksiyonunu istediğin yerde dururken çalıştır (koordinat vermeye gerek yok).
// Kullanım: node gen_aizen.js <datapack klasörü> <owner-uuid>
//   sonra oyunda (NPC'nin duracağı yerde): 'reload' ve 'function yoruichi:aizen_kur'
// Diyalogları sonradan yenilemek için: 'function yoruichi:aizen_diyalog' (NPC yüklüyken; iki aşamalıdır, 3 sn bekle). AIZEN_UUID ortam değişkeni
// (kurulumdan sonra NPC'nin gerçek uuid'si; 'data get entity @e[tag=aizen_npc,limit=1] UUID') verilirse yönlendirmeler o uuid'ye yazılır.
// Easy NPC bir diyalogda en fazla 6 görünür düğmeyi düzgün dizer; yönetici düğmesi yalnızca <=5 düğmede eklenir.
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const [root, owner] = process.argv.slice(2)
if (!root || !owner) { console.error('kullanim: node gen_aizen.js <datapack klasoru> <owner-uuid>'); process.exit(1) }
const UUID = process.env.AIZEN_UUID || crypto.randomUUID()
const BS = String.fromCharCode(92)
const NL = String.fromCharCode(10)
const SKIN_URL = 'https://raw.githubusercontent.com/anubissxd/minecraft-servers/main/assets/npc-skins/aizen_v1.png'

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

// Evre 1: yardımsever âlim. Evre 2: aynı ama ince bir tuhaflık. Evre 3: olay sürerken. Evre 4: gerçek yüzü.
const S1 = [
  'Hoş geldin, yolcu. Ben Aizen; burada bilgiyle uğraşıyorum. Kimse bir şeyi tek başına çözmek zorunda değil. Bir şey mi arıyorsun?',
  'Yine görüşüyoruz. Bu topraklarda insanlar birbirine yardım ettiğinde daha uzağa gidiyor. Sana nasıl yardımcı olabilirim?',
  'Çay soğumadan konuşalım. Sorularını dinliyorum; acelemiz yok.'
]
const S2 = [
  'Hoş geldin. Bugün tuhaf bir gün, değil mi? Herkes bir şeyler arıyor ama kimse neyi aradığını bilmiyor. Sen biliyor musun?',
  'Erwin\'in rütbeleri, hocaların sınavları... Hepsi ne kadar düzenli, fark ettin mi? Düzenin bir yazarı olmalı. Bunu hiç düşündün mü?',
  'Güvenebileceğim birine ihtiyacım var. Ama önce güveni ölçmek gerekir. Ne dersin?'
]
const S3 = 'Şu an değil. Bir şeyler oluyor. Git... ya da kal ve izle. Seçim senin.'
const S4 = [
  'Sonunda gerçekten bakıyorsun. Güzel. Her şey hep gözünün önündeydi ve sen yine de bana çay ikram ettirdin. Eğlenceliydi.',
  'Bana kızgın mısın? Yanlış anlama, sana yalan söylemedim. Yalnızca söylemediklerimi söylemedim.',
  'Düzen bir yalandır ve o yalanı yazan el benimdi. Şimdi ne yapacaksın?'
]
const b1 = () => [
  btn('Bir bilgi istiyorum.', [tag('aizen_bilgi'), CLOSE]),
  btn('Yardımına ihtiyacım var.', [tag('aizen_yardim'), CLOSE]),
  btn('Araştırmana yardım edebilirim.', [tag('aizen_arastirma'), CLOSE]),
  btn('Kimsin sen?', [tag('aizen_kim'), CLOSE]),
  btn('Ayrılıyorum.', [CLOSE])
]
const b2 = () => b1().slice(0, 4).concat([btn('Bir şey fark ettim...', [tag('aizen_supheli'), CLOSE]), btn('Ayrılıyorum.', [CLOSE])])
const b3 = () => [btn('Peki.', [CLOSE])]
const b4 = () => [
  btn('Seninle savaşacağım.', [tag('aizen_dovus'), CLOSE]),
  btn('Neden yaptın?', [tag('aizen_neden'), CLOSE]),
  btn('Gerçekte kimsin?', [tag('aizen_kim'), CLOSE]),
  btn('Ayrılıyorum.', [CLOSE])
]

const dialogs = []
const names = (p, i) => (i === 0 ? p : p + '_' + (i + 1))
S1.forEach((t, i) => dialogs.push(dialog(names('aizen_s1', i), t, b1(), names('aizen_s1', i))))
S2.forEach((t, i) => dialogs.push(dialog(names('aizen_s2', i), t, b2(), names('aizen_s2', i))))
dialogs.push(dialog('aizen_s3', S3, b3(), 'aizen_s3'))
S4.forEach((t, i) => dialogs.push(dialog(names('aizen_s4', i), t, b4(), names('aizen_s4', i))))

function route(dlg, cond) {
  return '{Type:"COMMAND",PermLevel:3,Cmd:' + q('/execute as @initiator if entity @s[' + cond + '] run easy_npc dialog open ' + UUID + ' @s ' + dlg) + '}'
}
const V = 3
const routes = []
;[['aizen_s1', 'aizen_st_1', S1], ['aizen_s2', 'aizen_st_2', S2], ['aizen_s4', 'aizen_st_4', S4]].forEach(([prefix, st, arr]) => {
  arr.forEach((t, i) => routes.push(route(names(prefix, i), 'tag=' + st + ',tag=dv_aizen_' + (i + 1))))
  routes.push(route(prefix, 'tag=' + st + arr.map((t, i) => ',tag=!dv_aizen_' + (i + 1)).join('')))
})
routes.push(route('aizen_s3', 'tag=aizen_st_3'))
// evre etiketi henüz yoksa (yeni girmiş oyuncu) evre 1 gösterilir
routes.push(route('aizen_s1', 'tag=!aizen_st_1,tag=!aizen_st_2,tag=!aizen_st_3,tag=!aizen_st_4'))
routes.push(action('/tag @initiator add dv_reroll_aizen'))

const skinUuid = uuidToInts(nameUuid(SKIN_URL))
const nbt = '{UUID:' + uuidToInts(UUID) + ',CustomName:' + q('{"color":"#8B6F47","text":"Aizen"}') + ',Tags:["korunan","aizen_npc"],' +
  'Invulnerable:1b,PersistenceRequired:1b,EasyNPCVersion:3,' +
  'EntityAttribute:{IsInvulnerable:1b,IsImmovable:1b,IsPushable:0b,PushEntities:0b,IsKnockbackResistant:1b,IsAttackableByPlayers:0b,IsAttackableByMonsters:0b,IsExplosionResistant:1b},' +
  'SkinData:{Type:"SECURE_REMOTE_URL",URL:' + q(SKIN_URL) + ',UUID:' + skinUuid + '},' +
  'ObjectiveData:{HasObjectives:1b,ObjectiveDataSet:[{Type:"LOOK_AT_PLAYER"},{Type:"LOOK_AT_MOB"},{Type:"LOOK_AT_RESET"}]},' +
  'Owner:' + uuidToInts(owner) + ',ActionData:{ActionPermissionLevel:3,ActionEventSet:{ON_INTERACTION:[' + routes.join(',') + ']}},' +
  'DialogData:{Type:"CUSTOM",DialogDataSet:[' + dialogs.join(',') + ']}}'

const fnDir = path.join(root, 'data', 'yoruichi', 'functions')
fs.mkdirSync(fnDir, { recursive: true })
// kur: komutu çalıştıran oyuncunun bulunduğu yere doğurur (yön: oyuncunun baktığı yönün tersi, yani ona bakar)
fs.writeFileSync(path.join(fnDir, 'aizen_kur.mcfunction'), [
  '# Aizen NPC kurulumu: bu fonksiyonu NPC\'nin duracağı yerde dururken çalıştır. Üretici: tools/yoruichi/gen_aizen.js',
  'execute at @s run summon easy_npc:humanoid ~ ~ ~ ' + nbt,
  'tag @s add aizen_kuruldu',
  'say Aizen kuruldu. Konumu değiştirmek için /tp @e[tag=aizen_npc,limit=1] <x> <y> <z> (script konumu 30 saniyede bir günceller)'
].join(NL) + NL)
// diyalog yenileme: iki aşamalı
const SEL = '@e[tag=aizen_npc,limit=1]'
fs.writeFileSync(path.join(fnDir, 'aizen_diyalog.mcfunction'), [
  '# Aizen diyalog yenileme, 1. aşama: NPC\'nin yakınında dur.',
  'execute at @e[tag=aizen_npc,limit=1] run forceload add ~ ~',
  'schedule function yoruichi:aizen_diyalog2 60t replace'
].join(NL) + NL)
fs.writeFileSync(path.join(fnDir, 'aizen_diyalog2.mcfunction'), [
  '# Aizen diyalog yenileme, 2. aşama.',
  'data modify entity ' + SEL + ' ActionData.ActionEventSet set value {ON_INTERACTION:[' + routes.join(',') + ']}',
  'data modify entity ' + SEL + ' DialogData set value {Type:"CUSTOM",DialogDataSet:[' + dialogs.join(',') + ']}',
  'say Aizen diyalogları yenilendi.'
].join(NL) + NL)
console.log('ok aizen uuid', UUID)
