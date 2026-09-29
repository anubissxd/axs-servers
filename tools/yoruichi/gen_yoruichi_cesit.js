// Yoruichi: tekrar eden durum diyaloglarına (beklerken, görev sürerken, bittiğinde, Vlorya'lı değilken) ek sürümler ekler,
// böylece her konuşmada aynı cümleyi duymazsın. Sürüm etiketi dv_yoruichi_<n> (npc_cesitlilik.js seçer).
// Mevcut yönlendirmeler korunur: her hedef diyalog için sürüm 2 ve 3 yönlendirmesi eklenir, asıl yönlendirme yalnızca sürüm 1 (veya etiketsiz) için çalışır.
// Yeni diyaloglar var olanların kopyasıdır (düğmeler aynı), yalnızca metin değişir; kopyalama oyunda komutla yapılır (data modify ... append from).
// Kullanım:
//   node tools/nbt_tool.js dump "<dünya>/easy_npc/npcs/fff2c1ae-28c0-4f9c-858b-94f7cbc0ca8e.npc.nbt" > yoruichi.json
//   node gen_yoruichi_cesit.js <datapack klasörü> <yoruichi.json>       sonra 'reload' ve 'function yoruichi:yoruichi_cesit'
// Tekrar çalıştırılabilir: önce eski kopyalar silinir, yönlendirmeler baştan yazılır. NOT: dump dosyası her seferinde ORİJİNAL yönlendirmelerden alınmalıdır; zaten çeşitli yönlendirmeleri içeren bir dump kullanılırsa sürüm satırları süzülür ve yeniden üretilir.
const fs = require('fs')
const path = require('path')

const [root, dumpFile] = process.argv.slice(2)
if (!root || !dumpFile) { console.error('kullanim: node gen_yoruichi_cesit.js <datapack klasoru> <yoruichi.json>'); process.exit(1) }
const UUID = 'fff2c1ae-28c0-4f9c-858b-94f7cbc0ca8e'
const BS = String.fromCharCode(92)
const NL = String.fromCharCode(10)
function q(s) { return '"' + s.split(BS).join(BS + BS).split('"').join(BS + '"') + '"' }

// diyalog adı -> ek sürüm metinleri (sürüm 2 ve 3)
const VARIANTS = {
  chase_bekle: [
    'Hâlâ buradasın? Yakalamak dediğin şey konuşarak olmaz. Hareket et.',
    'Hehe. Yavaşsın. Ben burada duruyorum ama sen yine de ulaşamıyorsun.'
  ],
  l2_devam: [
    'Beş gölge. Her biri arkasından. Hâlâ tamamlamadın; boşa konuşma.',
    'Gölgeler kendiliğinden düşmez. Git, işini bitir, sonra gel.'
  ],
  l3_devam: [
    'Gölgem sabırlı biri değil. Fazla bekletirsen kaybeden sen olursun.',
    'Bir şeyi görmeden vurmak... asıl sınav bu. Git.'
  ],
  l3_bitti: [
    'Öğreteceklerimi öğrettim. Gerisi senin, ama beni bir daha arama, hehe.',
    'Hız... bir gün seni de yakalayacak kadar hızlı biri çıkar. O güne kadar iyi kullan.'
  ],
  Kovulma: [
    'Buralara Vlorya olmayan girmez. Git.',
    'Bu bilgi sana ait degil. Yolun acik olsun... baska yerde.'
  ]
}

const j = JSON.parse(fs.readFileSync(dumpFile, 'utf8'))
const base = (j.ActionData.ActionEventSet.ON_INTERACTION || []).filter(r => !String(r.Cmd).includes('dv_reroll_yoruichi') && !String(r.Cmd).includes('dv_yoruichi_'))
const routes = []
base.forEach(r => {
  const cmd = String(r.Cmd)
  const m = cmd.match(/^\/execute as @initiator (if|unless) entity @s\[(.*)\] run easy_npc dialog open (\S+) @s (\S+)$/)
  if (!m || !VARIANTS[m[4]]) { routes.push(cmd); return }
  const [, kind, cond, uuid, dlg] = m
  const pre = '/execute as @initiator ' + kind + ' entity @s[' + cond + ']'
  const post = ' run easy_npc dialog open ' + uuid + ' @s '
  // sürüm 2, 3 (koşul + o sürümün etiketi), sonra sürüm 1 / etiketsiz. 'unless' koşulu için etiket ayrı 'if' ile birleştirilir.
  VARIANTS[dlg].forEach((t, i) => routes.push(pre + ' if entity @s[tag=dv_yoruichi_' + (i + 2) + ']' + post + dlg + '_' + (i + 2)))
  routes.push(pre + ' unless entity @s[tag=dv_yoruichi_2] unless entity @s[tag=dv_yoruichi_3]' + post + dlg)
})
const routeSnbt = routes.map(c => '{Type:"COMMAND",PermLevel:3,Cmd:' + q(c) + '}')
routeSnbt.push('{Type:"COMMAND",PermLevel:3,Cmd:' + q('/execute as @initiator run tag @s add dv_reroll_yoruichi') + '}')

const S = 'data modify entity ' + UUID + ' '
const stage2 = ['# Yoruichi ek diyalog sürümleri. Üretici: tools/yoruichi/gen_yoruichi_cesit.js']
Object.keys(VARIANTS).forEach(name => {
  VARIANTS[name].forEach((text, i) => {
    const nm = name + '_' + (i + 2)
    stage2.push('data remove entity ' + UUID + ' DialogData.DialogDataSet[{Name:' + q(nm) + '}]') // tekrar çalıştırmada kopyalar çoğalmasın
    stage2.push(S + 'DialogData.DialogDataSet append from entity ' + UUID + ' DialogData.DialogDataSet[{Name:' + q(name) + '}]')
    stage2.push(S + 'DialogData.DialogDataSet[-1].Name set value ' + q(nm))
    stage2.push(S + 'DialogData.DialogDataSet[-1].Label set value ' + q(nm))
    stage2.push(S + 'DialogData.DialogDataSet[-1].Texts[0].Text set value ' + q(text))
  })
})
stage2.push(S + 'ActionData.ActionEventSet set value {ON_INTERACTION:[' + routeSnbt.join(',') + ']}')
stage2.push('forceload remove -1033 -339')
stage2.push('say Yoruichi ek diyalogları yüklendi.')

const fnDir = path.join(root, 'data', 'yoruichi', 'functions')
fs.mkdirSync(fnDir, { recursive: true })
fs.writeFileSync(path.join(fnDir, 'yoruichi_cesit.mcfunction'), ['forceload add -1033 -339', 'schedule function yoruichi:yoruichi_cesit2 60t replace'].join(NL) + NL)
fs.writeFileSync(path.join(fnDir, 'yoruichi_cesit2.mcfunction'), stage2.join(NL) + NL)
console.log('ok', routes.length, 'yonlendirme,', stage2.length - 4, 'komut')
