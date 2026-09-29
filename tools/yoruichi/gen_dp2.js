// Yoruichi NPC'sine L2 diyaloglarini baglayan datapack uretir.
const fs = require('fs')
const path = require('path')
const UUID = '5a1afe8a-cbf7-47a3-a751-39b4f228f3b6'
const BS = String.fromCharCode(92) // \

const root = process.argv[2] // datapack klasoru
const fnDir = path.join(root, 'data', 'yoruichi', 'functions')
fs.mkdirSync(fnDir, { recursive: true })
fs.writeFileSync(path.join(root, 'pack.mcmeta'), JSON.stringify({ pack: { pack_format: 15, description: 'Yoruichi L2 diyalog baglantisi' } }, null, 2))

function q(s) { return '"' + s.split(BS).join(BS + BS).split('"').join(BS + '"') + '"' }

const scrollL2 = 'irons_spellbooks:scroll{"irons_spellbooks:spell_container":{data:[{id:"kubejs:flashstep",index:0,level:2,locked:1b}],maxSpells:1,mustEquip:0b,spellWheel:0b}}'

function action(cmd) { return '{Type:"COMMAND",PermLevel:3,Cmd:' + q(cmd) + '}' }
const CLOSE = '{Type:"CLOSE_DIALOG"}'
function adminBtn() { return '{Conditions:[{Type:"PLAYER_TAG",Name:"rank_admin"}],Name:"[Admin] Kapat",Actions:[' + CLOSE + ']}' }
function btn(name, actions) { return '{Name:' + q(name) + ',Actions:[' + actions.join(',') + ']}' }
function dialog(name, text, buttons) {
  return '{Options:{AllowEscClose:0,ShowCloseButton:0,ButtonConditionMode:"HIDE"},Texts:[{Text:' + q(text) + '}],Label:"' + name + '",Buttons:[' + buttons.concat([adminBtn()]).join(',') + '],Name:"' + name + '"}'
}

const dialogs = [
  dialog('l2_teklif', 'Tek adım attın, çocuk. Ama bir gölge tek adımla doğmaz. Beş düşman seç. Arkalarına geç, onlar seni fark etmeden bitir. Sonra bana dön.', [
    btn('Hazırım.', [action('/tag @initiator add yoruichi_l2'), CLOSE]),
    btn('Sonra.', [CLOSE])
  ]),
  dialog('l2_devam', 'Henüz bitmedi. Saymayı bilirsin: beş gölge. Arkalarına geç, sonu sen getir.', [btn('Tamam.', [CLOSE])]),
  dialog('l2_odul', 'Beş gölge, beş sessiz son. Fena değil... hiç fena değil. Al bunu. Adımların artık daha uzağa uzanacak.', [
    btn('Teşekkürler.', [
      action('/give @initiator ' + scrollL2 + ' 1'),
      action('/tag @initiator add yoruichi_l2_claimed'),
      CLOSE
    ])
  ]),
  dialog('l2_bitti', 'Ustalık bir gecede gelmez. Git, adımlarını sına. Hazır olduğunda ben buradayım.', [btn('Tamam.', [CLOSE])])
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
  open('l2_bitti', 'tag=rank_vloryan,tag=yoruichi_l2_claimed')
]

const lines = []
lines.push('# Yoruichi L2 diyalog baglantisi (bir kez calisir). Uretici: scratchpad/gen_dp.js')
for (const d of dialogs) lines.push('data modify entity ' + UUID + ' DialogData.DialogDataSet append value ' + d)
lines.push('data modify entity ' + UUID + ' ActionData.ActionEventSet.ON_INTERACTION set value [' + routes.join(',') + ']')
lines.push('tag ' + UUID + ' add yoruichi_l2_wired')
lines.push('tellraw @s {"text":"Yoruichi L2 diyalogları bağlandı.","color":"green"}')
const NL = String.fromCharCode(10)
fs.writeFileSync(path.join(fnDir, 'wire_l2_run.mcfunction'), lines.join(NL) + NL)
fs.writeFileSync(path.join(fnDir, 'wire_l2.mcfunction'),
  'execute if entity @e[type=easy_npc:cat,tag=yoruichi_npc,tag=yoruichi_l2_wired] run tellraw @s {"text":"Yoruichi L2 diyalogları zaten bağlı.","color":"yellow"}' + NL +
  'execute unless entity @e[type=easy_npc:cat,tag=yoruichi_npc,tag=yoruichi_l2_wired] run function yoruichi:wire_l2_run' + NL)
console.log('ok', lines.length, 'satir')
