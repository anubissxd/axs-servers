// Yoruichi'yi kediden insana (easy_npc:humanoid_slim) donusturen datapack fonksiyonu uretir.
// Eski kedi NPC'nin konumunda yeni insan NPC dogar (tum diyaloglar + yonlendirmeler dahil), kedi silinir.
// Kullanim: node gen_human.js <datapack klasoru> <yeni-uuid> [eski-uuid]
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const root = process.argv[2]
const NEW = process.argv[3]
const OLD = process.argv[4] || '5a1afe8a-cbf7-47a3-a751-39b4f228f3b6'
const SKIN_URL = 'https://raw.githubusercontent.com/anubissxd/minecraft-servers/main/assets/npc-skins/yoruichi_v1.png'
const BS = String.fromCharCode(92)
const NL = String.fromCharCode(10)

function uuidToInts(u) {
  const h = u.replace(/-/g, '')
  const out = []
  for (let i = 0; i < 4; i++) out.push(BigInt.asIntN(32, BigInt('0x' + h.slice(i * 8, i * 8 + 8))).toString())
  return '[I;' + out.join(',') + ']'
}

function q(s) { return '"' + s.split(BS).join(BS + BS).split('"').join(BS + '"') + '"' }
function action(cmd) { return '{Type:"COMMAND",PermLevel:3,Cmd:' + q(cmd) + '}' }
function open(name) { return '{Type:"OPEN_NAMED_DIALOG",Cmd:' + q(name) + '}' }
const CLOSE = '{Type:"CLOSE_DIALOG"}'
function adminBtn() { return '{Conditions:[{Type:"PLAYER_TAG",Name:"rank_admin"}],Name:"[Admin] Kapat",Actions:[' + CLOSE + ']}' }
function btn(name, actions, label) { return '{Name:' + q(name) + (label ? ',Label:' + q(label) : '') + ',Actions:[' + actions.join(',') + ']}' }
function dialog(name, text, buttons, label) {
  return '{Options:{AllowEscClose:0,ShowCloseButton:0,ButtonConditionMode:"HIDE"},Texts:[{Text:' + q(text) + '}],' +
    (label ? 'Label:' + q(label) + ',' : '') + 'Buttons:[' + buttons.concat([adminBtn()]).join(',') + '],Name:' + q(name) + '}'
}

const scroll = lvl => 'irons_spellbooks:scroll{"irons_spellbooks:spell_container":{data:[{id:"kubejs:flashstep",index:0,level:' + lvl + ',locked:1b}],maxSpells:1,mustEquip:0b,spellWheel:0b}}'

const dialogs = [
  // --- mevcut (ilk konusma) diyaloglar, metinler oldugu gibi ---
  dialog('D4', 'Yakaladin demek... Guzel. Simdi sana gercekten ogretebilirim.', [btn('Tamam.', [CLOSE])]),
  dialog('D1', 'Hmm... buralarda daha once gormedigim bir surat.', [btn('Konusan bir kedi mi?', [open('d2')], 'd1_devam')], 'default'),
  dialog('Kovulma', "Sen Vlorya'dan degilsin. Bu bilgiye layik degilsin. Defol.", [btn('(ayril)', [CLOSE])]),
  dialog('D2Kizgin', 'Bunu hak ettin. Ama vurusa verdigin tepkiye baktim - hic fena degilmis. Simdi gercekten ogrenmek ister misin? Bedeli 3 zumrut blogu.', [
    btn('Tamam, ogret.', [action('/tag @initiator add yoruichi_pay_l1'), CLOSE], 'd2_kizgin_ogret')
  ], 'd2_kizgin'),
  dialog('D2', 'Cevik gorunuyorsun. Ama ceviklik sadece konusmakla olmaz - gostermek gerekir. Ogretmenin bedeli: 3 zumrut blogu.', [
    btn('Bana ogret.', [action('/tag @initiator add yoruichi_pay_l1'), CLOSE], 'd2_ogret'),
    btn('Sadece bir kedisin.', [action('/damage @initiator 4 minecraft:mob_attack by ' + NEW), open('d2_kizgin')], 'd2_ret')
  ]),
  dialog('D3', 'Iyi. O zaman beni takip et - gorebilirsen.', [btn('Tamam.', [CLOSE])]),
  dialog('chase_bekle', 'Beni yakalayabilirsen konuşuruz.', [btn('Tamam.', [CLOSE])], 'chase_bekle'),
  // --- L2 ---
  dialog('l2_teklif', 'Tek adım attın, çocuk. Ama bir gölge tek adımla doğmaz. Beş düşman seç. Arkalarına geç, onlar seni fark etmeden bitir. Sonra bana dön. Bedeli 6 zümrüt bloğu.', [
    btn('Hazırım.', [action('/tag @initiator add yoruichi_pay_l2'), CLOSE]), btn('Sonra.', [CLOSE])
  ], 'l2_teklif'),
  dialog('l2_devam', 'Henüz bitmedi. Saymayı bilirsin: beş gölge. Arkalarına geç, sonu sen getir.', [btn('Tamam.', [CLOSE])], 'l2_devam'),
  dialog('l2_odul', 'Beş gölge, beş sessiz son. Fena değil... hiç fena değil. Al bunu. Adımların artık daha uzağa uzanacak.', [
    btn('Teşekkürler.', [action('/give @initiator ' + scroll(2) + ' 1'), action('/tag @initiator add yoruichi_l2_claimed'), CLOSE])
  ], 'l2_odul'),
  dialog('l2_bitti', 'Ustalık bir gecede gelmez. Git, adımlarını sına. Hazır olduğunda ben buradayım.', [btn('Tamam.', [CLOSE])], 'l2_bitti'),
  // --- L3 ---
  dialog('l3_teklif', 'İki adım attın. Üçüncüsü benim gölgem. O da benim gibi durmaz: görmediğin yerden vurmak zorundasın. Arkasına geç, sırtına vur. Önden vuracaksan hiç uğraşma. Bedeli 10 zümrüt bloğu.', [
    btn('Gölgeyi çağır.', [action('/tag @initiator add yoruichi_pay_l3'), CLOSE]), btn('Henüz değil.', [CLOSE])
  ], 'l3_teklif'),
  dialog('l3_devam', 'Gölgem seni bekliyor. Arkasına geç... ve görmeden vur.', [btn('Tamam.', [CLOSE])], 'l3_devam'),
  dialog('l3_odul', 'Gölgemi bitirdin... Demek Shunpo gerçekten senin oldu. Al bunu. Artık hiçbir gölge sana yetişemez.', [
    btn('Teşekkürler.', [action('/give @initiator ' + scroll(3) + ' 1'), action('/tag @initiator add yoruichi_l3_claimed'), CLOSE])
  ], 'l3_odul'),
  dialog('l3_bitti', 'Bundan sonrası senin. Sadece unutma: en hızlı olan, hiç yakalanmayandır.', [btn('Tamam.', [CLOSE])], 'l3_bitti')
]

function route(dlg, cond) {
  return '{Type:"COMMAND",PermLevel:3,Cmd:' + q('/execute as @initiator if entity @s[' + cond + '] run easy_npc dialog open ' + NEW + ' @s ' + dlg) + '}'
}
const routes = [
  '{Type:"COMMAND",PermLevel:3,Cmd:' + q('/execute as @initiator unless entity @s[tag=rank_vloryan] run easy_npc dialog open ' + NEW + ' @s kovulma') + '}',
  route('default', 'tag=rank_vloryan,tag=!yoruichi_caught,tag=!yoruichi_scene,tag=!yoruichi_tanisti'),
  route('chase_bekle', 'tag=rank_vloryan,tag=yoruichi_tanisti,tag=!yoruichi_caught,tag=!yoruichi_scene'),
  route('l2_teklif', 'tag=rank_vloryan,tag=yoruichi_caught,tag=!yoruichi_l2,tag=!yoruichi_l2_done,tag=!yoruichi_l2_claimed'),
  route('l2_devam', 'tag=rank_vloryan,tag=yoruichi_l2,tag=!yoruichi_l2_done'),
  route('l2_odul', 'tag=rank_vloryan,tag=yoruichi_l2_done,tag=!yoruichi_l2_claimed'),
  route('l3_teklif', 'tag=rank_vloryan,tag=yoruichi_l2_claimed,tag=!yoruichi_l3,tag=!yoruichi_l3_done,tag=!yoruichi_l3_claimed'),
  route('l3_devam', 'tag=rank_vloryan,tag=yoruichi_l3,tag=!yoruichi_l3_done'),
  route('l3_odul', 'tag=rank_vloryan,tag=yoruichi_l3_done,tag=!yoruichi_l3_claimed'),
  route('l3_bitti', 'tag=rank_vloryan,tag=yoruichi_l3_claimed')
]

// Skin UUID'si (docs/assets.md): URL'nin Java UUID.nameUUIDFromBytes(UTF-8) sonucu; yanlissa NPC varsayilan dokuyla gorunur
function nameUuid(str) {
  const h = crypto.createHash('md5').update(Buffer.from(str, 'utf8')).digest()
  h[6] = (h[6] & 0x0f) | 0x30
  h[8] = (h[8] & 0x3f) | 0x80
  const x = h.toString('hex')
  return x.slice(0, 8) + '-' + x.slice(8, 12) + '-' + x.slice(12, 16) + '-' + x.slice(16, 20) + '-' + x.slice(20)
}
const skinUuid = uuidToInts(nameUuid(SKIN_URL))
const nbt = '{UUID:' + uuidToInts(NEW) + ',CustomName:' + q('{"color":"#B983FF","text":"Yoruichi"}') + ',Tags:["korunan","yoruichi_npc"],' +
  'Invulnerable:1b,PersistenceRequired:1b,EasyNPCVersion:3,' +
  'EntityAttribute:{IsInvulnerable:1b,IsImmovable:1b,IsPushable:0b,PushEntities:0b,IsKnockbackResistant:1b,IsAttackableByPlayers:0b,IsAttackableByMonsters:0b,IsExplosionResistant:1b},' +
  'SkinData:{Type:"SECURE_REMOTE_URL",URL:' + q(SKIN_URL) + ',UUID:' + skinUuid + '},' +
  'ObjectiveData:{HasObjectives:1b,ObjectiveDataSet:[{Type:"LOOK_AT_PLAYER"},{Type:"LOOK_AT_MOB"},{Type:"LOOK_AT_RESET"}]},' +
  'ActionData:{ActionEventSet:{ON_INTERACTION:[' + routes.join(',') + ']}},' +
  'DialogData:{Type:"CUSTOM",DialogDataSet:[' + dialogs.join(',') + ']}}'

const fnDir = path.join(root, 'data', 'yoruichi', 'functions')
fs.mkdirSync(fnDir, { recursive: true })
const run = [
  '# Yoruichi: kedi -> insan (humanoid_slim). Uretici: gen_human.js',
  'execute at ' + OLD + ' run summon easy_npc:humanoid_slim ~ ~ ~ ' + nbt,
  'kill ' + OLD,
  'data modify entity ' + NEW + ' Owner set from entity @s UUID',
  'data modify entity ' + NEW + ' ActionData.ActionPermissionLevel set value 3',
  'tellraw @s {"text":"Yoruichi artık insan formunda.","color":"green"}'
]
fs.writeFileSync(path.join(fnDir, 'human_run.mcfunction'), run.join(NL) + NL)
fs.writeFileSync(path.join(fnDir, 'human.mcfunction'),
  'execute if entity ' + OLD + ' run function yoruichi:human_run' + NL +
  'execute unless entity ' + OLD + ' run tellraw @s {"text":"Eski kedi Yoruichi bulunamadı (yüklü değil ya da zaten dönüştürülmüş).","color":"yellow"}' + NL)
console.log('ok, yeni uuid', NEW, 'uzunluk', run[1].length)
