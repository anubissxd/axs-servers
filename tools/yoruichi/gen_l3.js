// Yoruichi L3 (Golge Klon) diyalog baglantisi: yoruichi_l2 datapack'ine wire_l3 ekler.
// Once yoruichi:wire_l2 calistirilmis olmali (L2 diyaloglari orada eklenir).
const fs = require('fs')
const path = require('path')
const UUID = '5a1afe8a-cbf7-47a3-a751-39b4f228f3b6'
const BS = String.fromCharCode(92)
const NL = String.fromCharCode(10)
const root = process.argv[2]
const fnDir = path.join(root, 'data', 'yoruichi', 'functions')
fs.mkdirSync(fnDir, { recursive: true })

function q(s) { return '"' + s.split(BS).join(BS + BS).split('"').join(BS + '"') + '"' }
const scrollL3 = 'irons_spellbooks:scroll{"irons_spellbooks:spell_container":{data:[{id:"kubejs:flashstep",index:0,level:3,locked:1b}],maxSpells:1,mustEquip:0b,spellWheel:0b}}'
function action(cmd) { return '{Type:"COMMAND",PermLevel:3,Cmd:' + q(cmd) + '}' }
const CLOSE = '{Type:"CLOSE_DIALOG"}'
function adminBtn() { return '{Conditions:[{Type:"PLAYER_TAG",Name:"rank_admin"}],Name:"[Admin] Kapat",Actions:[' + CLOSE + ']}' }
function btn(name, actions) { return '{Name:' + q(name) + ',Actions:[' + actions.join(',') + ']}' }
function dialog(name, text, buttons) {
  return '{Options:{AllowEscClose:0,ShowCloseButton:0,ButtonConditionMode:"HIDE"},Texts:[{Text:' + q(text) + '}],Label:"' + name + '",Buttons:[' + buttons.concat([adminBtn()]).join(',') + '],Name:"' + name + '"}'
}

const dialogs = [
  dialog('l3_teklif', 'İki adım attın. Üçüncüsü benim gölgem. O da benim gibi durmaz: görmediğin yerden vurmak zorundasın. Arkasına geç, sırtına vur. Önden vuracaksan hiç uğraşma.', [
    btn('Gölgeyi çağır.', [action('/tag @initiator add yoruichi_l3_start'), CLOSE]),
    btn('Henüz değil.', [CLOSE])
  ]),
  dialog('l3_devam', 'Gölgem seni bekliyor. Arkasına geç... ve görmeden vur.', [btn('Tamam.', [CLOSE])]),
  dialog('l3_odul', 'Gölgemi bitirdin... Demek Shunpo gerçekten senin oldu. Al bunu. Artık hiçbir gölge sana yetişemez.', [
    btn('Teşekkürler.', [
      action('/give @initiator ' + scrollL3 + ' 1'),
      action('/tag @initiator add yoruichi_l3_claimed'),
      CLOSE
    ])
  ]),
  dialog('l3_bitti', 'Bundan sonrası senin. Sadece unutma: en hızlı olan, hiç yakalanmayandır.', [btn('Tamam.', [CLOSE])])
]

function open(dlg, cond) {
  return '{Type:"COMMAND",PermLevel:3,Cmd:' + q('/execute as @initiator if entity @s[' + cond + '] run easy_npc dialog open ' + UUID + ' @s ' + dlg) + '}'
}
const routes = [
  '{Type:"COMMAND",PermLevel:3,Cmd:' + q('/execute as @initiator unless entity @s[tag=rank_vloryan] run easy_npc dialog open ' + UUID + ' @s kovulma') + '}',
  open('default', 'tag=rank_vloryan,tag=!yoruichi_caught'),
  open('l2_teklif', 'tag=rank_vloryan,tag=yoruichi_caught,tag=!yoruichi_l2,tag=!yoruichi_l2_done,tag=!yoruichi_l2_claimed'),
  open('l2_devam', 'tag=rank_vloryan,tag=yoruichi_l2,tag=!yoruichi_l2_done'),
  open('l2_odul', 'tag=rank_vloryan,tag=yoruichi_l2_done,tag=!yoruichi_l2_claimed'),
  open('l3_teklif', 'tag=rank_vloryan,tag=yoruichi_l2_claimed,tag=!yoruichi_l3,tag=!yoruichi_l3_done,tag=!yoruichi_l3_claimed'),
  open('l3_devam', 'tag=rank_vloryan,tag=yoruichi_l3,tag=!yoruichi_l3_done'),
  open('l3_odul', 'tag=rank_vloryan,tag=yoruichi_l3_done,tag=!yoruichi_l3_claimed'),
  open('l3_bitti', 'tag=rank_vloryan,tag=yoruichi_l3_claimed')
]

const lines = []
lines.push('# Yoruichi L3 diyalog baglantisi (bir kez calisir; once wire_l2)')
for (const d of dialogs) lines.push('data modify entity ' + UUID + ' DialogData.DialogDataSet append value ' + d)
lines.push('data modify entity ' + UUID + ' ActionData.ActionEventSet.ON_INTERACTION set value [' + routes.join(',') + ']')
lines.push('tag ' + UUID + ' add yoruichi_l3_wired')
lines.push('tellraw @s {"text":"Yoruichi L3 diyalogları bağlandı.","color":"green"}')
fs.writeFileSync(path.join(fnDir, 'wire_l3_run.mcfunction'), lines.join(NL) + NL)
fs.writeFileSync(path.join(fnDir, 'wire_l3.mcfunction'),
  'execute unless entity @e[type=easy_npc:cat,tag=yoruichi_npc,tag=yoruichi_l2_wired] run tellraw @s {"text":"Önce /function yoruichi:wire_l2 çalıştır.","color":"red"}' + NL +
  'execute if entity @e[type=easy_npc:cat,tag=yoruichi_npc,tag=yoruichi_l3_wired] run tellraw @s {"text":"Yoruichi L3 diyalogları zaten bağlı.","color":"yellow"}' + NL +
  'execute if entity @e[type=easy_npc:cat,tag=yoruichi_npc,tag=yoruichi_l2_wired,tag=!yoruichi_l3_wired] run function yoruichi:wire_l3_run' + NL)
console.log('ok', lines.length, 'satir')
