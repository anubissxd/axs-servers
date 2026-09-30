// Kenpachi (Bleach): Drondra Kralı'nın koruyucusu, kaba kuvvetin sembolü. Şimdilik yalnızca küçümser ve gözdağı verir
// (ileride görevler eklenecek). Diyalog düğmeleri yalnızca etiket verir: kenpachi_kral, kenpachi_kim, kenpachi_dovus.
// 'Dövüş'te: Gece Avcısı (Erwin rütbesi 3) değilsen reiatsu sahnesi ve küçümseme (hasar yok); rütben yeterliyse gerçek KAPIŞMA başlar
// (aşağıda). Kapışma sunucu tarafında komutlarla yürür: Kenpachi'nin savaşçı sürümü Easy NPC olarak doğar, script onu oyuncuya doğru
// yürütür, yakındayken 'damage' komutuyla vurur; canı yarıya inince ikinci evre (hızlanır, sert vurur). Yenersen Nozarashi kılıcı (bir kez).
// Not: server_scripts dosyaları aynı scope'ta çalışır; cinePlay (sinema_motoru.js) çalışma anında çağrılır.

// 'global' Java haritası oyun açıkken script yeniden yüklense de kalır ve eski sürümden kalan null değer her okumada NullPointerException verir.
// Bu yüzden yükleme sırasında değerler her zaman null olmayan başlangıç değerlerine çekilir (devam eden bir kapışma yeniden yüklemede sıfırlanır).
global.kenpachiFight = false
global.kenpachiIntro = ''

const KENPACHI_TAGS = ['kenpachi_kral', 'kenpachi_kim', 'kenpachi_dovus']

const KENPACHI_KRAL = [
  'Kral mı? Hah! Vargoth\'a ulaşmak istiyorsan önce beni geçeceksin. Geçemezsin ama, bu yüzden zahmet etme.',
  'Kralın huzurunu bozacak kadar cesursun, bunu takdir ederim. Bir de kılıç tutabilsen.',
  'Kapıyı ben tutarım. Önce beni ikna et... ya da yere ser. İkincisini denemene bile izin vermem, sıkıcı olur.',
  'Kral seni görmek istemiyor. Ben de istemiyorum. Ne kadar iyi anlaşıyoruz, değil mi?'
]
const KENPACHI_KIM = [
  'Kenpachi. Kralın kılıcı, dişi, ne istersen. Adımı ezberle; ölmeden önce duyman gereken son isim olabilir.',
  'Kim olduğumu sormak zayıfların işi. Ben ne olduğumu kanla anlatırım.',
  'Hah! Bir sinek bana kim olduğumu soruyor. Kenpachi. Şimdi git, aklın varsa.'
]
const KENPACHI_DOVUS = [
  'Titriyorsun. Hah! Tam da beklediğim gibi.',
  'Bir vuruş... sadece bir vuruş bile dayanamazsın. Git, biraz büyü, sonra gel. Belki o zaman canım sıkılmaz.',
  'Eğlenceli olabilirsin diye umdum. Boşuna umutlanmışım.',
  'Kılıcımı çekmeyeceğim bile. Seni ezmek için o kadar zahmet fazla.'
]

// ------------------------------------------------------------------ Kapışma
const KENPACHI_HOME = { x: -629.5, y: 68, z: -437.5 }
const KENPACHI_FIGHT_RANK = 3 // Gece Avcısı
const KENPACHI_HP = 300
const KENPACHI_ARMOR = 8
const KENPACHI_COOLDOWN_MS = 300000
const KENPACHI_MAX_MS = 600000
const KENPACHI_ARENA_R = 160 // başlangıç noktasından uzaklaşma sınırı (kaçış); Kenpachi zaten Shunpo ile yetişir

function kenpachiHasTag(p, tag) {
  var found = false
  p.getTags().forEach(t => { if (String(t) === tag) found = true })
  return found
}

function kenpachiIntsOf(uuid) {
  // Rhino Java long değerlerini Number'a çevirip kesinliği bozar; UUID metninden 32 bitlik onaltılık parçalar alınır
  var hex = String(uuid.toString()).split('-').join('')
  var out = []
  for (var i = 0; i < 4; i++) out.push(parseInt(hex.substring(i * 8, i * 8 + 8), 16) | 0)
  return out
}

function kenpachiFighterEntity(server, uuidStr) {
  try { return server.overworld().getEntity(Java.loadClass('java.util.UUID').fromString(String(uuidStr))) } catch (e) { return null }
}

function kenpachiHideOriginal(server, hide) {
  if (hide) server.runCommandSilent('execute as @e[tag=kenpachi_npc] run tp @s ' + KENPACHI_HOME.x + ' -58 ' + KENPACHI_HOME.z)
  else server.runCommandSilent('execute as @e[tag=kenpachi_npc] run tp @s ' + KENPACHI_HOME.x + ' ' + KENPACHI_HOME.y + ' ' + KENPACHI_HOME.z)
}

function kenpachiSwordCmd(name) {
  var id = Item.exists('knightquest:cleaver') ? 'knightquest:cleaver' : 'minecraft:netherite_sword'
  return 'give ' + name + ' ' + id + '{display:{Name:\'{"text":"Nozarashi","color":"dark_red","italic":false}\',Lore:[\'{"text":"Kenpachi Zaraki\\\'nin kılıcı.","color":"gray","italic":false}\',\'{"text":"Ağır, tırtıklı, kana susamış.","color":"dark_gray","italic":true}\']},' +
    'AttributeModifiers:[{AttributeName:"minecraft:generic.attack_damage",Name:"Nozarashi",Amount:11,Operation:0,UUID:[I;1177452801,-1543553364,-1523101440,1902313001],Slot:"mainhand"},' +
    '{AttributeName:"minecraft:generic.attack_speed",Name:"Nozarashi",Amount:-3.1,Operation:0,UUID:[I;1177452802,-1543553364,-1523101440,1902313002],Slot:"mainhand"}],Unbreakable:1b,HideFlags:2} 1'
}

// Kapışmaya uygunluk ve başlatma (diyalogdaki 'dövüş' düğmesi)
function kenpachiChallenge(server, p, name) {
  var pd = p.persistentData
  var rank = Number(pd.getInt('erwin_rank')) || 0
  if (global.kenpachiFight) {
    kenpachiSay(server, name, 'Şu an başka biriyle uğraşıyorum. Sıranı bekle, sinek.')
    return
  }
  var left = Number(pd.getLong('kenpachi_next')) - Date.now()
  if (left > 0) {
    kenpachiSay(server, name, 'Daha yeni ezildin. Biraz dinlen; ' + Math.ceil(left / 60000) + ' dakika sonra gel.')
    return
  }
  if (!kenpachiHasTag(p, 'rank_maceraci') || rank < KENPACHI_FIGHT_RANK) {
    kenpachiPressure(server, name, 'Bana meydan okumak için önce Keşif Birliği\'nde Gece Avcısı ol. Şimdi seninle uğraşırsam sıkıcı olur.')
    return
  }
  var steps = [
    { t: 0, sound: ['minecraft:entity.ravager.roar', 1, 0.5] },
    { t: 0, cmd: 'effect give {p} minecraft:darkness 5 0 true' },
    { t: 0.2, title: ['KENPACHI ZARAKI', 'Drondra Kralının Kılıcı', 'dark_red'] },
    { t: 1.5, sound: ['minecraft:entity.warden.heartbeat', 1, 0.7] },
    { t: 1.5, cmd: 'execute at {p} run particle minecraft:dust 0.7 0.05 0.05 2 ~ ~1 ~ 1.6 1 1.6 0.02 80' },
    { t: 2.5, note: ['Kenpachi: "Hah! Sonunda biri kılıcımı çekmeme sebep olacak. Hazır ol, sinek!"', 'dark_red'] },
    { t: 4.5, sound: ['minecraft:entity.warden.heartbeat', 1, 0.6] },
    { t: 5, fn: 'kenpachiFightBegin' }
  ]
  pd.putLong('kenpachi_next', Date.now() + 60000)
  global.kenpachiIntro = name
  cinePlay(server, name, steps)
}

function kenpachiFightBegin(server, p, name) {
  if (global.kenpachiFight) return
  global.kenpachiIntro = ''
  var uuid = Java.loadClass('java.util.UUID').randomUUID()
  var ints = kenpachiIntsOf(uuid)
  var skinUuid = '[I;314074904,-1074318272,-2135068285,-60046125]'
  var nbt = '{UUID:[I;' + ints.join(',') + '],CustomName:\'{"color":"#B22222","text":"Kenpachi"}\',CustomNameVisible:1b,Tags:["kenpachi_fighter","korunan"],' +
    'PersistenceRequired:1b,EasyNPCVersion:3,Health:' + KENPACHI_HP + 'f,' +
    'Attributes:[{Name:"minecraft:generic.max_health",Base:' + KENPACHI_HP + 'd},{Name:"minecraft:generic.armor",Base:' + KENPACHI_ARMOR + 'd},{Name:"minecraft:generic.knockback_resistance",Base:1d}],' +
    'EntityAttribute:{IsInvulnerable:0b,IsImmovable:0b,IsPushable:0b,PushEntities:0b,IsKnockbackResistant:1b,IsAttackableByPlayers:1b,IsAttackableByMonsters:0b,IsExplosionResistant:0b},' +
    'SkinData:{Type:"SECURE_REMOTE_URL",URL:"https://raw.githubusercontent.com/anubissxd/minecraft-servers/main/assets/npc-skins/kenpachi_v1.png",UUID:' + skinUuid + '},' +
    'HandItems:[{id:"' + (Item.exists('knightquest:cleaver') ? 'knightquest:cleaver' : 'minecraft:netherite_sword') + '",Count:1b},{}]}'
  kenpachiHideOriginal(server, true)
  server.runCommandSilent('execute in minecraft:overworld run summon easy_npc:humanoid ' + KENPACHI_HOME.x + ' ' + KENPACHI_HOME.y + ' ' + KENPACHI_HOME.z + ' ' + nbt)
  global.kenpachiFight = { name: name, uuid: String(uuid), start: Date.now(), phase: 1, nextHit: Date.now() + 2000, nextSay: Date.now() + 15000, nextShunpo: Date.now() + 3000, nextDoor: 0 }
  server.runCommandSilent('execute at ' + name + ' run playsound minecraft:entity.ravager.roar master ' + name + ' ~ ~ ~ 1 0.6')
  kenpachiSay(server, name, 'Gel bakalım! Ağlama yeter ki.')
}

function kenpachiFightEnd(server, won, reason) {
  var f = global.kenpachiFight
  if (!f) return
  global.kenpachiFight = false // 'global' bir Java haritası: null yazmak sonraki okumada hata verir
  var name = String(f.name)
  var e = kenpachiFighterEntity(server, f.uuid)
  if (e) server.runCommandSilent('kill ' + f.uuid)
  kenpachiHideOriginal(server, false)
  server.runCommandSilent('effect clear ' + name + ' minecraft:slowness')
  var p = null
  server.players.forEach(o => { if (String(o.username) === name) p = o })
  if (p) {
    p.persistentData.putLong('kenpachi_next', Date.now() + (won ? KENPACHI_COOLDOWN_MS : 120000))
    if (!won) kenpachiSay(server, name, reason || 'Hah! Bu kadar mı? Sıkıcıydı. Git, biraz büyü, sonra tekrar dene.')
  }
}

function kenpachiFightWin(server) {
  var f = global.kenpachiFight
  if (!f) return
  var name = String(f.name)
  var p = null
  server.players.forEach(o => { if (String(o.username) === name) p = o })
  kenpachiFightEnd(server, true)
  if (!p) return
  var pd = p.persistentData
  var steps = [
    { t: 0, sound: ['minecraft:entity.player.levelup', 1, 0.6] },
    { t: 0.3, title: ['KAPIŞMA KAZANILDI', 'Kenpachi Zaraki yere serildi', 'gold'] },
    { t: 2, note: ['Kenpachi: "Hah... hahaha! Sonunda! Tam da bunu bekliyordum. Bir sinek olmadığını gösterdin."', 'dark_red'] }
  ]
  var first = Number(pd.getInt('kenpachi_kilic')) !== 1
  if (first) {
    pd.putInt('kenpachi_kilic', 1)
    server.runCommandSilent(kenpachiSwordCmd(name))
    steps.push({ t: 5, note: ['Kenpachi: "Al bunu. Nozarashi. Bir daha kaybetme, yoksa seni de ezerim."', 'dark_red'] })
    steps.push({ t: 5.5, note: ['Nozarashi kılıcını aldın.', 'gold'] })
  } else {
    server.runCommandSilent('give ' + name + ' minecraft:emerald 6')
    steps.push({ t: 5, note: ['Kenpachi: "Yine mi? Neyse. Bu bir teselli. 6 zümrüt."', 'dark_red'] })
  }
  pd.putInt('kenpachi_wins', Number(pd.getInt('kenpachi_wins')) + 1)
  cinePlay(server, name, steps)
}

var kenpachiFightPhase = 0

function kenpachiFightTick(server) {
  var f = global.kenpachiFight
  if (!f) return
  var name = String(f.name)
  var p = null
  server.players.forEach(o => { if (String(o.username) === name) p = o })
  var e = kenpachiFighterEntity(server, f.uuid)
  var now = Date.now()
  if (!p || p.health <= 0) { kenpachiFightEnd(server, false, 'Hah! Yere serildin bile. Bu kadar mı?'); return }
  if (!e) {
    // savaşçı henüz doğmadıysa kısa süre bekle
    if (now - Number(f.start) > 4000) kenpachiFightEnd(server, false, 'Kaçtın mı? Sıkıcı.')
    return
  }
  var dx = Number(p.x) - Number(e.x)
  var dz = Number(p.z) - Number(e.z)
  var dist = Math.sqrt(dx * dx + dz * dz)
  var dy = Math.abs(Number(p.y) - Number(e.y))
  if (now - Number(f.start) > KENPACHI_MAX_MS) { kenpachiFightEnd(server, false, 'Vakit doldu. Sıkıldım. Defol.'); return }
  if (Math.sqrt(Math.pow(Number(p.x) - KENPACHI_HOME.x, 2) + Math.pow(Number(p.z) - KENPACHI_HOME.z, 2)) > KENPACHI_ARENA_R) {
    kenpachiFightEnd(server, false, 'Kaçmaya mı çalışıyorsun? Korkak.')
    return
  }
  // evre 2: can yarıya inince
  var hp = Number(e.health)
  if (Number(f.phase) === 1 && hp < KENPACHI_HP / 2) {
    f.phase = 2
    var steps = [
      { t: 0, sound: ['minecraft:entity.ender_dragon.growl', 1, 0.6] },
      { t: 0, cmd: 'effect give {p} minecraft:darkness 4 0 true' },
      { t: 0, cmd: 'execute at {p} run particle minecraft:dust 0.8 0.05 0.05 3 ~ ~1 ~ 3 1.5 3 0.02 150' },
      { t: 0.2, title: ['GERÇEK GÜÇ', 'Kenpachi gözündeki bandı çıkardı', 'dark_red'] },
      { t: 2, note: ['Kenpachi: "Hah! Şimdi eğlenmeye başlıyoruz! Beni yarıya kadar getirdin, tebrikler... hehe!"', 'dark_red'] }
    ]
    cinePlay(server, name, steps)
    server.runCommandSilent('execute at ' + f.uuid + ' run effect give @a[distance=..9] minecraft:slowness 3 1 true')
  }
  var speed = Number(f.phase) === 1 ? 0.32 : 0.44
  var reach = 3.8
  // Shunpo: oyuncu uzaklaştıysa (ya da çok yukarıdaysa/başka yükseklikteyse) Kenpachi arkasına ışınlanır (siyah-beyaz duman, ışınlanma sesi)
  if ((dist > 9 || dy > 6) && now >= Number(f.nextShunpo || 0)) {
    server.runCommandSilent('execute at ' + f.uuid + ' run particle minecraft:smoke ~ ~1 ~ 0.3 0.6 0.3 0.05 25')
    server.runCommandSilent('execute at ' + f.uuid + ' run particle minecraft:end_rod ~ ~1 ~ 0.2 0.5 0.2 0.02 8')
    server.runCommandSilent('execute at ' + name + ' rotated as ' + name + ' run tp ' + f.uuid + ' ^ ^ ^-2.4')
    server.runCommandSilent('execute at ' + f.uuid + ' run particle minecraft:smoke ~ ~1 ~ 0.3 0.6 0.3 0.05 25')
    server.runCommandSilent('execute at ' + f.uuid + ' run playsound minecraft:entity.enderman.teleport master @a ~ ~ ~ 1 1.7')
    f.nextShunpo = now + (Number(f.phase) === 1 ? 3500 : 2000)
    f.nextHit = Math.max(Number(f.nextHit), now + 500)
    return
  }
  // kapı: yolu üstünde kapı varsa açar gibi geçer (ışınlanma zaten duvarları aşar); ses çalar
  if (now >= Number(f.nextDoor || 0) && server.runCommandSilent('execute as ' + f.uuid + ' at @s if block ^ ^ ^1.3 #minecraft:doors') > 0) {
    server.runCommandSilent('execute at ' + f.uuid + ' run playsound minecraft:block.wooden_door.open block @a ~ ~ ~ 1 0.9')
    f.nextDoor = now + 1800
  }
  // yönel + yaklaş (yalnızca yatay; yakındayken durur)
  server.runCommandSilent('execute as ' + f.uuid + ' at @s facing entity ' + name + ' feet rotated ~ 0 run tp @s ~ ~ ~ ~ 0')
  if (dist > reach - 0.6 && dist < 40 && dy < 6) {
    server.runCommandSilent('execute as ' + f.uuid + ' at @s facing entity ' + name + ' feet rotated ~ 0 run tp @s ^ ^ ^' + speed)
  }
  // vuruş
  if (dist <= reach && dy <= 3 && now >= Number(f.nextHit)) {
    var dmg = Number(f.phase) === 1 ? 7 : 10
    server.runCommandSilent('damage ' + name + ' ' + dmg + ' minecraft:mob_attack by ' + f.uuid)
    server.runCommandSilent('execute at ' + name + ' run particle minecraft:sweep_attack ~ ~1 ~ 0.2 0.2 0.2 0 1')
    server.runCommandSilent('execute at ' + name + ' run playsound minecraft:entity.player.attack.strong master ' + name + ' ~ ~ ~ 1 0.6')
    f.nextHit = now + (Number(f.phase) === 1 ? 1500 : 1000)
  }
  // ara sıra sözler
  if (now >= Number(f.nextSay)) {
    var lines = ['Hah! Daha sert vur!', 'Bu kadar mı? Eğlendir beni!', 'Ölmeden önce biraz mücadele et!', 'Güzel... güzel! Devam et!']
    kenpachiSay(server, name, kenpachiPick(lines))
    f.nextSay = now + 18000 + Math.floor(Math.random() * 8000)
  }
}

function kenpachiPick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function kenpachiEsc(s) { return String(s).split('\\').join('\\\\').split('"').join('\\"') }

function kenpachiSay(server, name, text) {
  server.runCommandSilent('tellraw ' + name + ' [{"text":"Kenpachi","color":"dark_red","bold":true},{"text":": ","color":"gray"},{"text":"' + kenpachiEsc(text) + '","color":"white","italic":true}]')
}

// Reiatsu sahnesi: ekran kararır, kalp atışı, kırmızı parçacıklar, kısa yavaşlama. Yalnızca gövde gösterisi, hasar yok.
function kenpachiPressure(server, name, line) {
  var steps = [
    { t: 0, sound: ['minecraft:entity.warden.heartbeat', 1, 0.7] },
    { t: 0, cmd: 'effect give {p} minecraft:darkness 4 0 true' },
    { t: 0, cmd: 'effect give {p} minecraft:slowness 3 1 true' },
    { t: 0, cmd: 'execute at {p} run particle minecraft:dust 0.7 0.05 0.05 2 ~ ~1 ~ 1.4 1 1.4 0.02 60' },
    { t: 0.2, title: ['REİATSU', 'Ağır bir baskı nefesini kesti', 'dark_red'] },
    { t: 0.9, sound: ['minecraft:entity.warden.heartbeat', 1, 0.6] },
    { t: 1.6, sound: ['minecraft:entity.warden.heartbeat', 1, 0.6] }
  ]
  cinePlay(server, name, steps)
  kenpachiSay(server, name, line)
}

var kenpachiPhase = 0

ServerEvents.tick(event => {
  var server = event.server
  kenpachiPhase++
  if (kenpachiPhase % 2 === 0 && global.kenpachiFight) {
    try { kenpachiFightTick(server) } catch (e) { console.error('kenpachi kapisma hata: ' + e); kenpachiFightEnd(server, false) }
  }
  if (kenpachiPhase % 200 === 0 && !global.kenpachiFight && !global.kenpachiIntro) {
    server.runCommandSilent('kill @e[tag=kenpachi_fighter]')
    server.runCommandSilent('execute as @e[tag=kenpachi_npc,y=-70,dy=30] run tp @s ' + KENPACHI_HOME.x + ' ' + KENPACHI_HOME.y + ' ' + KENPACHI_HOME.z)
  }
  if (kenpachiPhase % 10 !== 0) return
  server.players.forEach(p => {
    try {
      var name = String(p.username)
      for (var i = 0; i < KENPACHI_TAGS.length; i++) {
        var tg = KENPACHI_TAGS[i]
        var has = false
        p.getTags().forEach(t => { if (String(t) === tg) has = true })
        if (!has) continue
        server.runCommandSilent('tag ' + name + ' remove ' + tg)
        if (tg === 'kenpachi_kral') kenpachiSay(server, name, kenpachiPick(KENPACHI_KRAL))
        else if (tg === 'kenpachi_kim') kenpachiSay(server, name, kenpachiPick(KENPACHI_KIM))
        else if (tg === 'kenpachi_dovus') kenpachiChallenge(server, p, name)
      }
    } catch (e) {
      console.error('kenpachi hata: ' + e)
    }
  })
})

// Savaşçı Kenpachi öldü: oyuncu öldürdüyse zafer, başkası ya da başka nedenle öldüyse kapışma biter
EntityEvents.death(event => {
  try {
    var tags = []
    event.entity.getTags().forEach(t => tags.push(String(t)))
    if (tags.indexOf('kenpachi_fighter') < 0) return
    var f = global.kenpachiFight
    if (!f) return
    var src = event.source.actual
    if (src && src.isPlayer() && String(src.username) === String(f.name)) kenpachiFightWin(event.server)
    else kenpachiFightEnd(event.server, false, 'Sıkıcı. Başkası benim işimi bitirmiş.')
  } catch (e) {
    console.error('kenpachi olum hata: ' + e)
  }
})

PlayerEvents.loggedOut(event => {
  try {
    var f = global.kenpachiFight
    if (f && String(f.name) === String(event.player.username)) kenpachiFightEnd(event.server, false)
  } catch (e) {
    console.error('kenpachi cikis hata: ' + e)
  }
})

// Yönetici: /kenpachi_sifirla <oyuncu> kapışma ilerlemesini sıfırlar (kılıç bayrağı, bekleme); devam eden kapışmayı bitirir
ServerEvents.commandRegistry(event => {
  const { commands: Commands, arguments: Arguments } = event
  event.register(Commands.literal('kenpachi_sifirla').requires(s => s.hasPermission(2)).then(Commands.argument('oyuncu', Arguments.PLAYER.create(event)).executes(ctx => {
    var p = Arguments.PLAYER.getResult(ctx, 'oyuncu')
    p.persistentData.putInt('kenpachi_kilic', 0)
    p.persistentData.putInt('kenpachi_wins', 0)
    p.persistentData.putLong('kenpachi_next', 0)
    kenpachiFightEnd(ctx.source.server, false)
    ctx.source.sendSuccess(Text.of(String(p.username) + ' için Kenpachi kapışması sıfırlandı.'), false)
    return 1
  })))
})
