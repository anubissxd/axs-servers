// Yoruichi L3 sinavi: "Golge Klon" mini boss.
// Akis: Yoruichi diyalogundan 'yoruichi_l3_start' etiketi verilir -> golge cagrilir ->
// oyuncu 'yoruichi_l3' (sinav suruyor) etiketi alir. Golge SADECE ARKASINDAN vurulabilir
// (Shunpo ile arkasina gecmek gerekir); onden/yandan vurus iptal edilir. Golge her
// 3-5 saniyede bir oyuncunun yakininda rastgele bir noktaya isinlanir. Oldurulunce oyuncu
// 'yoruichi_l3_done' alir, Yoruichi ile konusunca L3 parsomeni verilir.
// 3 dakikada yenilemezse (ya da oyuncu olur/cikarsa) golge kaybolur, etiket silinir, tekrar denenir.
// Golge: vindicator (siyah deri zirh, demir kilic), tagleri 'yoruichi_shadow' ve
// 'ysh_<oyuncu uuid>' (sahibi). 'korunan' etiketi de tasir: anubis_hub_safe.js spawn bolgesinde 'korunan'
// etiketli canavarlari silmez (Yoruichi spawn guvenli bolgesinde oturuyor). Bagimlilik yok, vanilla mob.
// Not: server_scripts dosyalari ayni scope'ta calisiyor, isimler benzersiz olmali.
// fsStreak / fsBlackBurst yoruichi_flashstep_fx.js'ten gelir (calisma zamaninda cagrilir).
// Math.PI bu ortamda NaN donuyordu (log ile kanitlandi: a=NaN); sabit kullan
const YL3_PI = 3.141592653589793
const Yl3LivingEntity = Java.loadClass('net.minecraft.world.entity.LivingEntity')
const Yl3BlockPos = Java.loadClass('net.minecraft.core.BlockPos')

const YL3_TIMEOUT_TICKS = 3600 // 3 dakika
const YL3_CHASE_DIST = 10 // oyuncu bu mesafeden fazla uzaklasirsa golge arkasina isinlanir
const YL3_CHASE_COOLDOWN_TICKS = 40 // arka arkaya 'arkana gec' arasi en az 2 sn
const YL3_HEALTH = 150
const YL3_BEHIND_DOT = -0.25 // saldirgan-hedef yonu ile hedefin baktigi yon arasindaki kosinus siniri (arkasi)

if (!global.yoruichiShadowStateV1) global.yoruichiShadowStateV1 = {}

function yl3EntHasTag(ent, tag) {
  var found = false
  ent.getTags().forEach(t => { if (String(t) === tag) found = true })
  return found
}

function yl3Say(server, name, text) {
  yoruichiSay(server, name, text)
}

function yl3ActionBar(server, name, text) {
  server.runCommandSilent('title ' + name + ' actionbar {"text":"' + text + '","color":"dark_gray"}')
}

function yl3FindShadow(p) {
  var uid = String(p.getStringUuid())
  var list = p.level.getEntitiesOfClass(Yl3LivingEntity, p.getBoundingBox().inflate(160.0))
  for (var i = 0; i < list.size(); i++) {
    var e = list.get(i)
    if (yl3EntHasTag(e, 'ysh_' + uid)) return e
  }
  return null
}

// Oyuncunun cevresinde bos bir nokta bul (oyuncu kutusuyla yaklasik olcum).
function yl3FreeSpot(level, p, minR, maxR) {
  var box = p.getBoundingBox()
  var px = Number(p.getX()), py = Number(p.getY()), pz = Number(p.getZ())
  if (isNaN(px) || isNaN(py) || isNaN(pz)) {
    console.error('yoruichi l3: oyuncu konumu gecersiz x=' + p.getX() + ' y=' + p.getY() + ' z=' + p.getZ())
    return null
  }
  for (var i = 0; i < 12; i++) {
    var a = Math.random() * 2 * YL3_PI
    var r = minR + Math.random() * (maxR - minR)
    var dx = Math.cos(a) * r
    var dz = Math.sin(a) * r
    var pos = new Yl3BlockPos(Math.floor(px + dx), Math.floor(py), Math.floor(pz + dz))
    if (!level.isLoaded(pos)) continue
    // hedef nokta bos olmali VE altinda zemin olmali (havaya doganlar boşluğa düşüp kayboluyordu)
    if (level.noCollision(p, box.move(dx, 0, dz)) && !level.noCollision(p, box.move(dx, -0.6, dz))) {
      return { x: px + dx, y: py, z: pz + dz }
    }
  }
  return null
}

function yl3Spawn(server, p) {
  var level = p.level
  var uid = String(p.getStringUuid())
  var name = String(p.username)
  // Golge ilk Shunpo noktasinda dogar (YORUICHI_FIRST_HOP, yoruichi_chase.js); nokta yuklu/zeminli degilse
  // (ornegin yerel test dunyasi) oyuncunun yakinina duser.
  var spot = null
  var fixedSpawn = false
  try {
    var gy = yoruichiGround(level, YORUICHI_FIRST_HOP.x, YORUICHI_FIRST_HOP.z, YORUICHI_FIRST_HOP.y)
    if (gy !== null) {
      spot = { x: YORUICHI_FIRST_HOP.x, y: gy, z: YORUICHI_FIRST_HOP.z }
      fixedSpawn = true
    }
  } catch (eFix) { }
  if (!spot) spot = yl3FreeSpot(level, p, 5, 6)
  global.yoruichiShadowFixed = fixedSpawn
  if (!spot) {
    yl3Say(server, name, 'Burada zemin yok ya da yer dar. Yere in, daha açık bir yere gel.')
    return false
  }
  var black = '{display:{color:1052688}}'
  var nbt = '{CustomName:\'{"text":"G\u00f6lge Klon","color":"dark_gray"}\',CustomNameVisible:1b,PersistenceRequired:1b,' +
    'Tags:["yoruichi_shadow","korunan","ysh_' + uid + '"],Health:' + YL3_HEALTH + 'f,DeathLootTable:"minecraft:empty",' +
    'Attributes:[{Name:"generic.max_health",Base:' + YL3_HEALTH + 'd},{Name:"generic.attack_damage",Base:6d},{Name:"generic.movement_speed",Base:0.32d},{Name:"generic.knockback_resistance",Base:1d}],' +
    'HandItems:[{id:"minecraft:iron_sword",Count:1b},{}],HandDropChances:[0f,0f],' +
    'ArmorItems:[{id:"minecraft:leather_boots",Count:1b,tag:' + black + '},{id:"minecraft:leather_leggings",Count:1b,tag:' + black + '},{id:"minecraft:leather_chestplate",Count:1b,tag:' + black + '},{id:"minecraft:leather_helmet",Count:1b,tag:' + black + '}],' +
    'ArmorDropChances:[0f,0f,0f,0f]}'
  var sres = server.runCommandSilent('summon minecraft:vindicator ' + spot.x.toFixed(2) + ' ' + spot.y.toFixed(2) + ' ' + spot.z.toFixed(2) + ' ' + nbt)
  if (!sres) console.error('yoruichi l3: summon komutu basarisiz (NBT hatasi olabilir), sonuc=' + sres)
  fsStreak(level, spot.x, spot.y + 1.0, spot.z)
  fsBlackBurst(server, spot.x, spot.y, spot.z, 30)
  server.runCommandSilent('playsound kubejs:flashstep neutral @a ' + spot.x.toFixed(2) + ' ' + spot.y.toFixed(2) + ' ' + spot.z.toFixed(2) + ' 1.0 0.8')
  return true
}

function yl3Blink(server, level, p, sh) {
  var box = sh.getBoundingBox()
  for (var i = 0; i < 10; i++) {
    var a = Math.random() * 2 * YL3_PI
    var r = 4 + Math.random() * 3
    var nx = Number(p.getX()) + Math.cos(a) * r
    var nz = Number(p.getZ()) + Math.sin(a) * r
    var dx = nx - Number(sh.getX())
    var dy = Number(p.getY()) - Number(sh.getY())
    var dz = nz - Number(sh.getZ())
    var pos = new Yl3BlockPos(Math.floor(nx), Math.floor(p.getY()), Math.floor(nz))
    if (!level.isLoaded(pos)) continue
    if (level.noCollision(sh, box.move(dx, dy, dz)) && !level.noCollision(sh, box.move(dx, dy - 0.6, dz))) {
      var ox = Number(sh.getX()), oy = Number(sh.getY()), oz = Number(sh.getZ())
      fsStreak(level, ox, oy + 1.0, oz)
      fsBlackBurst(server, ox, oy, oz, 14)
      sh.teleportTo(nx, Number(p.getY()), nz)
      fsStreak(level, nx, Number(p.getY()) + 1.0, nz)
      fsBlackBurst(server, nx, Number(p.getY()), nz, 14)
      server.runCommandSilent('playsound kubejs:flashstep neutral @a ' + nx.toFixed(2) + ' ' + Number(p.getY()).toFixed(2) + ' ' + nz.toFixed(2) + ' 0.8 0.8')
      return
    }
  }
}

// Golge oyuncunun ARKASINA (bakis yonunun tersine) 2.5-4 blok isinlanir; zemin/engel kontrolu; olmazsa rastgele halkaya duser.
function yl3BlinkBehind(server, level, p, sh) {
  var look = p.getLookAngle()
  var lx = Number(look.x()), lz = Number(look.z())
  var ll = Math.sqrt(lx * lx + lz * lz)
  if (ll < 0.01) { yl3Blink(server, level, p, sh); return }
  var bx = -lx / ll, bz = -lz / ll
  var box = sh.getBoundingBox()
  var dists = [3, 2.5, 4]
  var angs = [0, 0.6, -0.6, 1.2, -1.2]
  for (var i = 0; i < dists.length; i++) {
    for (var j = 0; j < angs.length; j++) {
      var c = Math.cos(angs[j]), sn = Math.sin(angs[j])
      var nx = Number(p.getX()) + (bx * c - bz * sn) * dists[i]
      var nz = Number(p.getZ()) + (bx * sn + bz * c) * dists[i]
      var dx = nx - Number(sh.getX())
      var dy = Number(p.getY()) - Number(sh.getY())
      var dz = nz - Number(sh.getZ())
      var pos = new Yl3BlockPos(Math.floor(nx), Math.floor(p.getY()), Math.floor(nz))
      if (!level.isLoaded(pos)) continue
      if (level.noCollision(sh, box.move(dx, dy, dz)) && !level.noCollision(sh, box.move(dx, dy - 0.6, dz))) {
        var ox = Number(sh.getX()), oy = Number(sh.getY()), oz = Number(sh.getZ())
        fsStreak(level, ox, oy + 1.0, oz)
        fsBlackBurst(server, ox, oy, oz, 14)
        sh.teleportTo(nx, Number(p.getY()), nz)
        fsStreak(level, nx, Number(p.getY()) + 1.0, nz)
        fsBlackBurst(server, nx, Number(p.getY()), nz, 14)
        server.runCommandSilent('playsound kubejs:flashstep neutral @a ' + nx.toFixed(2) + ' ' + Number(p.getY()).toFixed(2) + ' ' + nz.toFixed(2) + ' 0.8 0.8')
        return
      }
    }
  }
  yl3Blink(server, level, p, sh)
}

function yl3EndTrial(server, p, sh, message) {
  var name = String(p.username)
  try { if (sh) sh.discard() } catch (e) { }
  server.runCommandSilent('tag ' + name + ' remove yoruichi_l3')
  delete global.yoruichiShadowStateV1[String(p.getStringUuid())]
  if (message) yl3Say(server, name, message)
}

ServerEvents.tick(event => {
  var server = event.server
  // 5 tick'te bir kontrol yeterli
  global.yoruichiShadowPhase = (Number(global.yoruichiShadowPhase) || 0) + 1
  if (global.yoruichiShadowPhase % 5 !== 0) return
  try {
    server.players.forEach(p => {
      try {
        var uid = String(p.getStringUuid())
        var name = String(p.username)
        var state = global.yoruichiShadowStateV1[uid]

        if (yl3EntHasTag(p, 'yoruichi_l3_start')) {
          server.runCommandSilent('tag ' + name + ' remove yoruichi_l3_start')
          if (!state && !yl3EntHasTag(p, 'yoruichi_l3_done') && yl3Spawn(server, p)) {
            server.runCommandSilent('tag ' + name + ' add yoruichi_l3')
            state = global.yoruichiShadowStateV1[uid] = { born: global.flashstepTickV3, nextBlink: global.flashstepTickV3 + 80 }
            yl3Say(server, name, global.yoruichiShadowFixed ? 'Gölgem aşağıda, ilk adımını attığım yerde seni bekliyor. Arkasına geç... ve görmeden vur.' : 'Gölgem seni bekliyor. Arkasına geç... ve görmeden vur.')
          }
          return
        }

        if (!yl3EntHasTag(p, 'yoruichi_l3')) return
        var sh = yl3FindShadow(p)

        // sinav bayat (oyun kapanip acilmis) ya da golge yok olmus
        if (!state) {
          yl3EndTrial(server, p, sh, null)
          return
        }
        if (!p.isAlive()) {
          yl3EndTrial(server, p, sh, null)
          return
        }
        if (!sh) {
          yl3EndTrial(server, p, null, 'Gölge dağıldı. Hazır olduğunda yeniden gel.')
          return
        }
        if (Number(sh.getY()) < Number(p.getY()) - 8) {
          yl3Blink(server, p.level, p, sh) // altta kalmis: yakinina geri al
        }
        var now = global.flashstepTickV3
        if (now - state.born > YL3_TIMEOUT_TICKS) {
          yl3EndTrial(server, p, sh, 'Süre doldu. Gölgem sıyrıldı. Yeniden gel.')
          return
        }
        var sdx = Number(sh.getX()) - Number(p.getX())
        var sdy = Number(sh.getY()) - Number(p.getY())
        var sdz = Number(sh.getZ()) - Number(p.getZ())
        var sdist = Math.sqrt(sdx * sdx + sdy * sdy + sdz * sdz)
        if (sdist > YL3_CHASE_DIST && now >= (Number(state.nextChaseBlink) || 0)) {
          // oyuncu uzaklasti: golge hemen arkasina Shunpo atar
          yl3BlinkBehind(server, p.level, p, sh)
          state.nextChaseBlink = now + YL3_CHASE_COOLDOWN_TICKS
          state.nextBlink = now + 60 + Math.floor(Math.random() * 41)
        } else if (now >= state.nextBlink) {
          yl3Blink(server, p.level, p, sh)
          state.nextBlink = now + 60 + Math.floor(Math.random() * 41)
        }
      } catch (e2) {
        console.error('yoruichi l3 oyuncu hata: ' + e2)
      }
    })
  } catch (e) {
    console.error('yoruichi l3 tick hata: ' + e)
  }
})

// Golge sadece sahibi tarafindan ve ARKASINDAN vurulabilir.
EntityEvents.hurt(event => {
  try {
    var ent = event.entity
    if (!yl3EntHasTag(ent, 'yoruichi_shadow')) return
    var att = event.source.actual
    var ownerTag = 'ysh_' + (att && att.isPlayer() ? String(att.getStringUuid()) : '')
    if (!att || !att.isPlayer() || !yl3EntHasTag(ent, ownerTag)) {
      event.cancel()
      return
    }
    var look = ent.getLookAngle()
    var fx = Number(look.x()), fz = Number(look.z())
    var tx = Number(att.getX()) - Number(ent.getX())
    var tz = Number(att.getZ()) - Number(ent.getZ())
    var fl = Math.sqrt(fx * fx + fz * fz) || 1
    var tl = Math.sqrt(tx * tx + tz * tz) || 1
    var dot = (fx * tx + fz * tz) / (fl * tl)
    if (dot > YL3_BEHIND_DOT) {
      event.cancel()
      yl3ActionBar(att.server, String(att.username), 'Gölgeni görmeden vuramıyorsun. Arkasına geç.')
    }
  } catch (e) {
    console.error('yoruichi l3 hurt hata: ' + e)
  }
})

EntityEvents.death(event => {
  try {
    var ent = event.entity
    // Oyuncu sinav sirasinda oldu: sinav biter, golge silinir, mesaj verilir (ucret tekrar istenmez)
    if (ent.isPlayer() && yl3EntHasTag(ent, 'yoruichi_l3')) {
      var killer = event.source.actual
      var byShadow = killer && yl3EntHasTag(killer, 'yoruichi_shadow')
      yl3EndTrial(ent.server, ent, yl3FindShadow(ent), byShadow ? 'G\u00f6lgem seni yendi. Haz\u0131r oldu\u011funda yeniden \u00e7a\u011f\u0131r.' : 'S\u0131nav bitti. Haz\u0131r oldu\u011funda yeniden gel.')
      return
    }
    if (!yl3EntHasTag(ent, 'yoruichi_shadow')) return
    var att = event.source.actual
    if (!att || !att.isPlayer() || !yl3EntHasTag(ent, 'ysh_' + String(att.getStringUuid()))) return
    var name = String(att.username)
    var server = att.server
    server.runCommandSilent('tag ' + name + ' add yoruichi_l3_done')
    server.runCommandSilent('tag ' + name + ' remove yoruichi_l3')
    delete global.yoruichiShadowStateV1[String(att.getStringUuid())]
    server.runCommandSilent('title ' + name + ' times 10 50 20')
    server.runCommandSilent('title ' + name + ' subtitle {"text":"Yoruichi\'ye dön.","color":"light_purple"}')
    server.runCommandSilent('title ' + name + ' title {"text":"GÖLGE YENİLDİ","color":"dark_gray","bold":true}')
    yl3Say(server, name, 'Gölgemi bitirdin... Bana dön.')
  } catch (e) {
    console.error('yoruichi l3 death hata: ' + e)
  }
})

// Oyuncu cikinca golge ortada kalmasin.
PlayerEvents.loggedOut(event => {
  try {
    var p = event.player
    var sh = yl3FindShadow(p)
    if (sh) sh.discard()
    delete global.yoruichiShadowStateV1[String(p.getStringUuid())]
    p.server.runCommandSilent('tag ' + String(p.username) + ' remove yoruichi_l3')
  } catch (e) {
    console.error('yoruichi l3 cikis hata: ' + e)
  }
})
