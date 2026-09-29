// Yoruichi ucret diyaloglari: mevcut NPC'de ilgili diyalogların metnini ve "kabul" dugmesini gunceller.
// Kullanim: node gen_prices.js <cikti mcfunction yolu> <npc-uuid>
const fs = require('fs')
const out = process.argv[2]
const U = process.argv[3]
const BS = String.fromCharCode(92)
const NL = String.fromCharCode(10)
function q(s) { return '"' + s.split(BS).join(BS + BS).split('"').join(BS + '"') + '"' }
const CLOSE = '{Type:"CLOSE_DIALOG"}'
function act(cmd) { return '{Type:"COMMAND",PermLevel:3,Cmd:' + q(cmd) + '}' }

// Fiyatlar (yoruichi_pay.js YORUICHI_PRICES ile ayni olmali): l1 3, l2 6, l3 10 zumrut blogu
const rows = [
  { name: 'D2', text: 'Cevik gorunuyorsun. Ama ceviklik sadece konusmakla olmaz - gostermek gerekir. Ogretmenin bedeli: 3 zumrut blogu.', pay: 'l1' },
  { name: 'D2Kizgin', text: 'Bunu hak ettin. Ama vurusa verdigin tepkiye baktim - hic fena degilmis. Simdi gercekten ogrenmek ister misin? Bedeli 3 zumrut blogu.', pay: 'l1' },
  { name: 'l2_teklif', text: 'Tek adım attın, çocuk. Ama bir gölge tek adımla doğmaz. Beş düşman seç. Arkalarına geç, onlar seni fark etmeden bitir. Sonra bana dön. Bedeli 6 zümrüt bloğu.', pay: 'l2' },
  { name: 'l3_teklif', text: 'İki adım attın. Üçüncüsü benim gölgem. O da benim gibi durmaz: görmediğin yerden vurmak zorundasın. Arkasına geç, sırtına vur. Önden vuracaksan hiç uğraşma. Bedeli 10 zümrüt bloğu.', pay: 'l3' }
]
const lines = ['# Yoruichi ucretleri: L1 3, L2 6, L3 10 zumrut blogu (yoruichi_pay.js). Uretici: tools/yoruichi/gen_prices.js']
for (const r of rows) {
  const base = 'data modify entity ' + U + ' DialogData.DialogDataSet[{Name:"' + r.name + '"}]'
  lines.push(base + '.Texts set value [{Text:' + q(r.text) + '}]')
  lines.push(base + '.Buttons[0].Actions set value [' + act('/tag @initiator add yoruichi_pay_' + r.pay) + ',' + CLOSE + ']')
}
lines.push('tellraw @s {"text":"Yoruichi ücretleri uygulandı (3 / 6 / 10 zümrüt bloğu).","color":"green"}')
fs.writeFileSync(out, lines.join(NL) + NL)
console.log('ok', lines.length)
