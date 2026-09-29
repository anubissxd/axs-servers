// Büyü hocası NPC'leri (Kakashi, Itachi) için datapack fonksiyonu üretir: NPC'yi verilen konuma doğurur, diyalogları ve
// yönlendirmeleri kurar. Mantık kubejs/server_scripts/hocalar_egitim.js içindedir; buradaki düğmeler yalnızca 'hoca_*' etiketi verir.
// Easy NPC bir diyalogda en fazla 6 görünür düğmeyi düzenleyebilir (fazlası üst üste biner); yönetici düğmesi yalnızca <=5 düğmede eklenir.
// Kullanım:
//   node gen_hocalar.js <kakashi|itachi> <datapack klasoru> <owner-uuid> <x> <y> <z> <yaw> [skin-dosyasi] [slim]
//   sonra konsolda 'reload' ve 'function yoruichi:<npc>_kur' (skin-dosyasi varsayılan <npc>_v1.png)
// NPC yeniden doğurulursa eskisi elle silinmeli (uuid çıktıda yazar, etiket hoca_npc_<npc>).
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const [npc, root, owner, X, Y, Z, YAW, skinFile, slimArg] = process.argv.slice(2)
if (!npc || !root || !owner || Z === undefined) {
  console.error('kullanim: node gen_hocalar.js <kakashi|itachi> <datapack klasoru> <owner-uuid> <x> <y> <z> <yaw> [skin-dosyasi] [slim]')
  process.exit(1)
}
const BS = String.fromCharCode(92)
const NL = String.fromCharCode(10)
const SLIM = skinFile === 'slim' || slimArg === 'slim'
const SKIN = skinFile && skinFile !== 'slim' ? skinFile : npc + '_v1.png'
const SKIN_URL = 'https://raw.githubusercontent.com/anubissxd/minecraft-servers/main/assets/npc-skins/' + SKIN
const TYPE = SLIM ? 'easy_npc:humanoid_slim' : 'easy_npc:humanoid'
const UUID = process.env.HOCA_UUID || crypto.randomUUID() // mevcut NPC'nin diyaloglarını yenilemek için HOCA_UUID verilir

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

const NPCS = {
  kakashi: {
    name: 'Kakashi', color: '#9AA0A6',
    ret: 'Hm? Kim bu... Bak, kitabımın en güzel yerindeyim. Adı sanı belli olmayan biriyle vakit harcamam. Git başımdan. Bir gün Maceracı olursan, belki.',
    ilk: 'Yaa... Bir de sen mi? Peki. Ben Kakashi. Gelmişsin madem, bir şey soracaksın herhalde. Kısa tut, sayfayı bitirmem lazım.',
    hubText: 'Tamam, dinliyorum. Chidori mi? Yıldırımı elde toplayıp tek vuruşta bırakmak... Kolay değil. Her seviye ayrı bir sınav ister ve sınavlar hızla ilgilidir. Erwin\'in rütbesi olmadan da bir şey öğretmem.',
    kabul: 'Sana bir şey soracaktım.',
    kars: [
      'Yine sen. Sayfamı bozmadan önce söyle: ne var? Bir şey mi istiyorsun, yoksa sadece etrafta mı dolaşıyorsun?',
      'Hm? A, sen misin. Yolda bir kedi çıktı, oyalandım. Neyse... bir şey mi soracaktın?',
      'Tam kitabın en heyecanlı yerindeydim. Ne kadar önemli olursa olsun, kısa tut.',
      'Yaa... bugün geç kalmadın, bu bir ilk. Ne istiyorsun?',
      'Vay, yine mi? Sabahtan beri kimse beni rahat bırakmıyor. Söyle bakalım.'
    ],
    karsBtn: 'Bir şey öğrenmek istiyorum.',
    karsGeri: 'Sadece geçiyordum.',
    buttons: () => [
      btn('Chidori öğrenmek istiyorum.', [tag('hoca_req_chidori'), CLOSE]),
      btn('Sınavı bildiriyorum.', [tag('hoca_rep_kakashi'), CLOSE]),
      btn('Eğitim durumum.', [tag('hoca_info'), CLOSE]),
      btn('Parşömenimi kaybettim.', [tag('hoca_lost_chidori'), CLOSE]),
      btn('Ayrılıyorum.', [CLOSE])
    ]
  },
  gojo: {
    name: 'Gojo', color: '#7FD1FF',
    ret: 'Yo! Hmm... adın yok, rütben yok. Endişelenme, nazik biriyim. Ama önce Maceracı ol, sonra gel; en güçlünün vaktini boşa harcamak suç sayılır. Şaka şaka. Ya da değil.',
    ilk: 'Yo! Ben Gojo Satoru. Evet, o en güçlü olan. İmza yok, üzgünüm. Bir şey soracaksan sor ama hızlı; sonsuzlukla meşgulüm.',
    hubText: 'Mavi, Kırmızı, Mor... Sırayla, tabii. Önce ikisini öğrenirsin, üçüncüsü ikisinin birleşimi. Keşif Birliği\'nde yükselmeden kapıdan içeri bile almam, hehe.',
    kabul: 'Senden bir şey öğrenmek istiyorum.',
    kars: [
      'Yo, yine sen! Bana hayran mısın yoksa gerçekten bir işin mi var? Şaka şaka. Ya da değil. Ne istiyorsun?',
      'Hehe, gene mi? Kimse en güçlüyü bu kadar sık ziyaret etmez. Söyle bakalım.',
      'Tam seni düşünüyordum... yalan, düşünmüyordum. Neyse, ne var?',
      'Ah, tatlı bir öğrenci. Kendini güçlü hissediyorsan söyle; ben zaten öyleyim.',
      'Sonsuzlukla meşgulüm ama sana bir dakikam var. Bir dakika. Çabuk.'
    ],
    karsBtn: 'Bir şey öğrenmek istiyorum.',
    karsGeri: 'Sadece selam vermek istedim.',
    buttons: () => [
      btn('Mavi öğrenmek istiyorum.', [tag('hoca_req_ao'), CLOSE]),
      btn('Kırmızı öğrenmek istiyorum.', [tag('hoca_req_aka'), CLOSE]),
      btn('Mor öğrenmek istiyorum.', [tag('hoca_req_murasaki'), CLOSE]),
      btn('Sınavı bildiriyorum.', [tag('hoca_rep_gojo'), CLOSE]),
      btn('Diğer işler.', [open('hoca_diger')]),
      btn('Ayrılıyorum.', [CLOSE])
    ],
    diger: () => [
      btn('Eğitim durumum.', [tag('hoca_info'), CLOSE]),
      btn('Mavi parşömenimi kaybettim.', [tag('hoca_lost_ao'), CLOSE]),
      btn('Kırmızı parşömenimi kaybettim.', [tag('hoca_lost_aka'), CLOSE]),
      btn('Mor parşömenimi kaybettim.', [tag('hoca_lost_murasaki'), CLOSE]),
      btn('Geri.', [CLOSE])
    ]
  },
  itachi: {
    name: 'Itachi', color: '#7A1F2B',
    ret: 'Boşuna geldin. Bu bilgi herkese emanet edilmez. Git.',
    ilk: 'Yaklaşmışsın. Adım Itachi. Buraya gelenlerin çoğu bir şey ister ve pişman olur. Sen ne için buradasın?',
    hubText: 'Bilgi arıyorsun. Amaterasu gözlerin gördüğünü yakan kara alevdir; Tsukiyomi ise zihni kıran yanılsama. İkisi de bedel ister. Amaterasu için Gece Avcısı, Tsukiyomi için Eşik Muhafızı olmalısın. Önce alev, sonra gölge.',
    kabul: 'Seninle konuşmak istiyorum.',
    kars: [
      '...Yine sen. Konuş. Ama uzun tutma.',
      'Geldin. Gözlerin hâlâ bir şey arıyor. Ne istiyorsun?',
      'Sessizce yaklaşmayı öğrenmişsin. İyi. Şimdi söyle: neden buradasın?',
      'Karanlıkta yürümek kolaydır. Peşinden gelmek zor. Sana ne lazım?',
      'Bir kez daha... Söyle, ama bu sefer önemli olsun.'
    ],
    karsBtn: 'Öğrenmek istediğim şeyler var.',
    karsGeri: 'Önemli değil.',
    diger: () => [
      btn('Eğitim durumum.', [tag('hoca_info'), CLOSE]),
      btn('Amaterasu parşömenimi kaybettim.', [tag('hoca_lost_amaterasu'), CLOSE]),
      btn('Tsukiyomi parşömenimi kaybettim.', [tag('hoca_lost_tsukiyomi'), CLOSE]),
      btn('Geri.', [CLOSE])
    ],
    buttons: () => [
      btn('Amaterasu öğrenmek istiyorum.', [tag('hoca_req_amaterasu'), CLOSE]),
      btn('Tsukiyomi öğrenmek istiyorum.', [tag('hoca_req_tsukiyomi'), CLOSE]),
      btn('Sınavı bildiriyorum.', [tag('hoca_rep_itachi'), CLOSE]),
      btn('Diğer işler.', [open('hoca_diger')]),
      btn('Ayrılıyorum.', [CLOSE])
    ]
  }
}
const N = NPCS[npc]
if (!N) { console.error('bilinmeyen npc: ' + npc); process.exit(1) }

const dialogs = [
  dialog('hoca_ret', N.ret, [btn('Anlıyorum.', [CLOSE])], 'hoca_ret'),
  dialog('hoca_ilk', N.ilk, [btn(N.kabul, [tag('hoca_met_' + npc), open('hoca_hub')], 'hoca_kabul')], 'hoca_ilk'),
  dialog('hoca_hub', N.hubText, N.buttons(), 'hoca_hub')
]
N.kars.forEach((t, i) => dialogs.push(dialog('hoca_kars_' + (i + 1), t, [btn(N.karsBtn, [open('hoca_hub')]), btn(N.karsGeri, [CLOSE])], 'hoca_kars_' + (i + 1))))
if (N.diger) dialogs.push(dialog('hoca_diger', 'Başka ne var?', N.diger(), 'hoca_diger'))
function route(dlg, cond) {
  return '{Type:"COMMAND",PermLevel:3,Cmd:' + q('/execute as @initiator if entity @s[' + cond + '] run easy_npc dialog open ' + UUID + ' @s ' + dlg) + '}'
}
const routes = [
  route('hoca_ret', 'tag=!rank_maceraci'),
  route('hoca_ilk', 'tag=rank_maceraci,tag=!hoca_met_' + npc),
  ...N.kars.map((t, i) => route('hoca_kars_' + (i + 1), 'tag=rank_maceraci,tag=hoca_met_' + npc + ',tag=hoca_kn_' + npc + '_' + (i + 1))),
  // hiç karşılama etiketi yoksa ilk karşılama
  route('hoca_kars_1', 'tag=rank_maceraci,tag=hoca_met_' + npc + N.kars.map((t, i) => ',tag=!hoca_kn_' + npc + '_' + (i + 1)).join('')),
  // her etkileşimden sonra bir sonraki karşılama yeniden seçilir (hocalar_egitim.js)
  action('/execute as @initiator if entity @s[tag=hoca_met_' + npc + '] run tag @s add hoca_reroll_' + npc)
]
const skinUuid = uuidToInts(nameUuid(SKIN_URL))
const nbt = '{UUID:' + uuidToInts(UUID) + ',CustomName:' + q('{"color":"' + N.color + '","text":"' + N.name + '"}') + ',Tags:["korunan","hoca_npc_' + npc + '"],' +
  'Invulnerable:1b,PersistenceRequired:1b,EasyNPCVersion:3,Rotation:[' + (YAW || 0) + 'f,0f],' +
  'EntityAttribute:{IsInvulnerable:1b,IsImmovable:1b,IsPushable:0b,PushEntities:0b,IsKnockbackResistant:1b,IsAttackableByPlayers:0b,IsAttackableByMonsters:0b,IsExplosionResistant:1b},' +
  'SkinData:{Type:"SECURE_REMOTE_URL",URL:' + q(SKIN_URL) + ',UUID:' + skinUuid + '},' +
  'ObjectiveData:{HasObjectives:1b,ObjectiveDataSet:[{Type:"LOOK_AT_PLAYER"},{Type:"LOOK_AT_MOB"},{Type:"LOOK_AT_RESET"}]},' +
  'Owner:' + uuidToInts(owner) + ',ActionData:{ActionPermissionLevel:3,ActionEventSet:{ON_INTERACTION:[' + routes.join(',') + ']}},' +
  'DialogData:{Type:"CUSTOM",DialogDataSet:[' + dialogs.join(',') + ']}}'

const out = [
  '# ' + N.name + ' NPC kurulumu. Üretici: tools/yoruichi/gen_hocalar.js',
  'forceload add ' + Math.floor(Number(X)) + ' ' + Math.floor(Number(Z)),
  'execute in minecraft:overworld run summon ' + TYPE + ' ' + X + ' ' + Y + ' ' + Z + ' ' + nbt,
  'data modify entity ' + UUID + ' Owner set value ' + uuidToInts(owner),
  'data modify entity ' + UUID + ' ActionData.ActionPermissionLevel set value 3',
  'forceload remove ' + Math.floor(Number(X)) + ' ' + Math.floor(Number(Z)),
  'say ' + N.name + ' kuruldu.'
]
const fnDir = path.join(root, 'data', 'yoruichi', 'functions')
fs.mkdirSync(fnDir, { recursive: true })
fs.writeFileSync(path.join(fnDir, npc + '_kur.mcfunction'), out.join(NL) + NL)
// Mevcut NPC'nin yalnızca diyalog ve yönlendirmelerini yeniler (HOCA_UUID = NPC'nin gerçek uuid'si)
const SEL = '@e[tag=hoca_npc_' + npc + ',limit=1]'
// İki aşamalı: önce yığın yüklenir (forceload), 3 sn sonra yazılır. Aynı tikte yazmak yüklenmemiş yığında sessizce başarısız olur.
const cxz = Math.floor(Number(X)) + ' ' + Math.floor(Number(Z))
const upd1 = [
  '# ' + N.name + ' diyalog yenileme, 1. aşama. Üretici: tools/yoruichi/gen_hocalar.js',
  'forceload add ' + cxz,
  'schedule function yoruichi:' + npc + '_diyalog2 60t replace'
]
const upd2 = [
  '# ' + N.name + ' diyalog yenileme, 2. aşama.',
  'data modify entity ' + SEL + ' ActionData.ActionEventSet set value {ON_INTERACTION:[' + routes.join(',') + ']}',
  'data modify entity ' + SEL + ' DialogData set value {Type:"CUSTOM",DialogDataSet:[' + dialogs.join(',') + ']}',
  'forceload remove ' + cxz,
  'say ' + N.name + ' diyalogları yenilendi.'
]
fs.writeFileSync(path.join(fnDir, npc + '_diyalog.mcfunction'), upd1.join(NL) + NL)
fs.writeFileSync(path.join(fnDir, npc + '_diyalog2.mcfunction'), upd2.join(NL) + NL)
console.log('ok', npc, 'uuid', UUID, 'skin', SKIN_URL)
