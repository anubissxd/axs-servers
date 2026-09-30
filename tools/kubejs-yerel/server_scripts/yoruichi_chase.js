// Yoruichi Shunpo kacisi: "yoruichi_tanisti" etiketi olan (egitimi kabul eden) ama
// henuz "yoruichi_caught" almamis oyuncu ona TRIGGER_DISTANCE kadar yaklasinca, Yoruichi
// ANCHOR etrafinda rastgele bir noktaya isinlanip kacar (flash step parcaciklari + ses +
// action bar'da alayci mesaj). MAX_HOPS kere tekrarlanir, sonrasinda durur ve
// "yoruichi_caught" etiketi verilir - bundan sonra onunla konusmak dogrudan D3'e (egitim
// sahnesi) gecer (bkz. preset'teki ON_INTERACTION).
// Oyuncu pes edip uzaklasirsa (TIMEOUT_TICKS boyunca tetiklemezse) sayac sifirlanir, yeniden
// baslar - ceza yok.
//
// Not: YORUICHI_UUID su an local test entity'sinin UUID'si. VDS'e tasinirken (Vlorya'ya
// yerlestirilince) yeni UUID ile guncellenmeli.
// Not2: server_scripts dosyalari ayni scope'ta calisiyor, isimler benzersiz olmali.
const YoruichiUUIDClass = Java.loadClass('java.util.UUID')
const YoruichiBlockPos = Java.loadClass('net.minecraft.core.BlockPos')
const YoruichiParticles = Java.loadClass('net.minecraft.core.particles.ParticleTypes')
const YoruichiModCapabilities = Java.loadClass('com.github.L_Ender.cataclysm.init.ModCapabilities')

const YORUICHI_UUID_STR = 'fff2c1ae-28c0-4f9c-858b-94f7cbc0ca8e'
// VDS (Caddy, Vlorya'ya bagli tarafsiz nokta): Yoruichi burada OTURUR.
const YORUICHI_HOME = { x: -1032.518, y: 81.0, z: -338.304, yaw: 180, pitch: 0 } // Kuzey (-Z) bakar; evde yaslanir
// Ilk Shunpo (kacis) noktasi: elle verildi. Sonraki atlamalar ILERISINE DOGRU otomatik uretilir
// (bkz. yoruichiNextWaypoint): ev -> ilk nokta yonu korunur, her atlama 12-18 blok ileri, zemin secilir.
const YORUICHI_FIRST_HOP = { x: -1033.554, y: 72, z: -318.817 }
const YORUICHI_HOP_MIN = 12
const YORUICHI_HOP_MAX = 18
const YORUICHI_HOME_RETURN_TICKS = 1200 // 60 sn kimse kovalamazsa eve doner
const YORUICHI_TRIGGER_DISTANCE = 5
const YORUICHI_MAX_HOPS = 6
const YORUICHI_TIMEOUT_TICKS = 600 // 30 saniye

// action bar JSON'una gidiyor: Turkce karakterler \\uXXXX kacisiyla (komut/encoding sorunu olmasin)
const YORUICHI_TAUNTS = [
  'Yava\\u015fs\\u0131n!',
  'Bu kadar m\\u0131?',
  'Daha h\\u0131zl\\u0131 olmal\\u0131s\\u0131n!',
  'Neredeyse... neredeyse de\\u011fil.',
  'Miyav! Yakala beni!',
  '\\u00c7ok mu yorgunsun?'
]

function yoruichiFind(level) {
  return level.getEntity(YoruichiUUIDClass.fromString(YORUICHI_UUID_STR))
}

function yoruichiActionBar(server, player, text) {
  server.runCommandSilent('title ' + player.username + ' actionbar {"text":"' + text + '","color":"light_purple"}')
}

// Ilk (iyi calisan) versiyon: POOF + CLOUD parcaciklari + flashstep sesi.
function yoruichiFlashParticles(server, level, x, y, z) {
  level.sendParticles(YoruichiParticles.POOF, x, y + 0.5, z, 12, 0.3, 0.4, 0.3, 0.02)
  level.sendParticles(YoruichiParticles.CLOUD, x, y + 0.3, z, 8, 0.2, 0.2, 0.2, 0.01)
  server.runCommandSilent('playsound kubejs:flashstep neutral @a ' + x + ' ' + y + ' ' + z + ' 1.0 1.0')
}

// Yoruichi'nin Shunpo'su: oyuncunun Shunpo'suyla ayni efekt (siyah hiz cizgileri, artci siluet, siyah toz,
// yer halkalari). Yardimcilar yoruichi_flashstep_fx.js'te (fsStreak, fsAfterimage, ...). Hata olursa eski
// (duman) efekte duser.
function yoruichiShunpoFx(server, level, sx, sy, sz, ex, ey, ez) {
  try {
    var dx = ex - sx
    var dz = ez - sz
    var hl = Math.sqrt(dx * dx + dz * dz) || 1
    fsAfterimage(level, sx, sy, sz, -dz / hl, dx / hl)
    fsStreak(level, sx, sy + 1.0, sz)
    fsDust(server, level, sx, sy, sz, 20, 0.4)
    fsSparks(server, level, sx, sy, sz, dx / hl, dz / hl)
    server.runCommandSilent('playsound kubejs:flashstep neutral @a ' + sx.toFixed(2) + ' ' + sy.toFixed(2) + ' ' + sz.toFixed(2) + ' 1.0 1.0')
    if (Math.abs(dx) + Math.abs(dz) > 1.5) {
      fsTrail(server, level, sx, sy, sz, ex, ey, ez)
      fsLater(1, function () {
        try {
          fsStreak(level, ex, ey + 1.0, ez)
          fsDust(server, level, ex, ey, ez, 28, 0.5)
          fsBlackBurst(server, ex, ey, ez, 28)
          fsGroundRing(level, ex, ey, ez, 1.0, 14)
          server.runCommandSilent('playsound kubejs:flashstep neutral @a ' + ex.toFixed(2) + ' ' + ey.toFixed(2) + ' ' + ez.toFixed(2) + ' 0.8 1.1')
        } catch (e1) {
          console.error('yoruichi shunpo varis fx hata: ' + e1)
        }
      })
      fsLater(4, function () { fsGroundRing(level, ex, ey, ez, 2.2, 24) })
    }
  } catch (e) {
    console.error('yoruichi shunpo fx hata: ' + e)
    yoruichiFlashParticles(server, level, sx, sy, sz)
    yoruichiFlashParticles(server, level, ex, ey, ez)
  }
}

// Varis ipucu: oyuncu Yoruichi'nin nereye gittigini gorsun. (1) Yoruichi 4 sn parlar (duvar arkasindan da secilir),
// (2) varis noktasinda 4 sn boyunca gokyuzune uzanan siyah-beyaz parcacik sutunu, (3) action bar'da yon ve mesafe.
// Kapatmak icin YORUICHI_HINT = false.
const YORUICHI_HINT = true
const YORUICHI_RAD2DEG = 57.29577951308232

function yoruichiDirName(dx, dz) {
  // dogu +X, guney +Z; aci 0 = dogu, 90 = guney (saat yonu)
  var a = Math.atan2(dz, dx) * YORUICHI_RAD2DEG
  var names = ['do\u011fu', 'g\u00fcneydo\u011fu', 'g\u00fcney', 'g\u00fcneybat\u0131', 'bat\u0131', 'kuzeybat\u0131', 'kuzey', 'kuzeydo\u011fu']
  var i = Math.round((a + 360) % 360 / 45) % 8
  return names[i]
}

function yoruichiHint(server, level, p, fromX, fromY, fromZ, dest) {
  if (!YORUICHI_HINT) return
  try {
    server.runCommandSilent('effect give ' + YORUICHI_UUID_STR + ' minecraft:glowing 4 0 true')
    for (var k = 0; k < 8; k++) {
      fsLater(k * 10, function () {
        server.runCommandSilent('particle minecraft:dust 0.02 0.01 0.04 2 ' + dest.x.toFixed(2) + ' ' + (dest.y + 8).toFixed(2) + ' ' + dest.z.toFixed(2) + ' 0.15 8 0.15 0 24 force')
        server.runCommandSilent('particle minecraft:end_rod ' + dest.x.toFixed(2) + ' ' + (dest.y + 8).toFixed(2) + ' ' + dest.z.toFixed(2) + ' 0.05 8 0.05 0 10 force')
      })
    }
    var dx = dest.x - Number(p.getX())
    var dz = dest.z - Number(p.getZ())
    var dy = dest.y - Number(p.getY())
    var dist = Math.round(Math.sqrt(dx * dx + dz * dz))
    var vert = dy > 3 ? ', yukar\u0131da' : (dy < -3 ? ', a\u015fa\u011f\u0131da' : '')
    var text = 'Yoruichi ' + yoruichiDirName(dx, dz) + ' y\u00f6n\u00fcnde, ' + dist + ' blok uzakta' + vert + '.'
    fsLater(20, function () { yoruichiActionBar(server, p, text) })
  } catch (e) {
    console.error('yoruichi ipucu hata: ' + e)
  }
}

// (x, z) sutununda refY civarinda yuruyulebilir zemini bul: altinda tam blok, ustunde 2 bos blok,
// yaprak/su/lav degil. Yuklenmemis chunk'a dokunmaz (isLoaded). Bulamazsa null.
function yoruichiGround(level, x, z, refY) {
  var bx = Math.floor(x), bz = Math.floor(z)
  for (var y = Math.floor(refY) + 20; y >= Math.floor(refY) - 25; y--) {
    var below = new YoruichiBlockPos(bx, y - 1, bz)
    if (!level.isLoaded(below)) return null
    var feet = new YoruichiBlockPos(bx, y, bz)
    var head = new YoruichiBlockPos(bx, y + 1, bz)
    if (level.getBlockState(below).getCollisionShape(level, below).isEmpty()) continue
    var bid = String(level.getBlock(bx, y - 1, bz).id)
    if (bid.indexOf('leaves') >= 0 || bid.indexOf('lava') >= 0 || bid.indexOf('water') >= 0) return null
    if (!level.getBlockState(feet).getCollisionShape(level, feet).isEmpty()) return null
    if (!level.getBlockState(head).getCollisionShape(level, head).isEmpty()) return null
    var fid = String(level.getBlock(bx, y, bz).id)
    if (fid.indexOf('water') >= 0 || fid.indexOf('lava') >= 0) return null
    return y
  }
  return null
}

// Sonraki atlama: NPC'nin bulundugu yerden ev->ilk nokta yonunde 12-18 blok ileri (gerekirse
// yandan acili), zemin secilerek. Ilk atlamada (NPC evdeyse) elle verilen nokta kullanilir.
function yoruichiNextWaypoint(level, npc, hopIndex) {
  var ox = Number(npc.getX()), oy = Number(npc.getY()), oz = Number(npc.getZ())
  var hx = ox - YORUICHI_HOME.x, hz = oz - YORUICHI_HOME.z
  if (hopIndex === 1 && hx * hx + hz * hz < 36) return { x: YORUICHI_FIRST_HOP.x, y: YORUICHI_FIRST_HOP.y, z: YORUICHI_FIRST_HOP.z }
  var dirX = YORUICHI_FIRST_HOP.x - YORUICHI_HOME.x, dirZ = YORUICHI_FIRST_HOP.z - YORUICHI_HOME.z
  var dl = Math.sqrt(dirX * dirX + dirZ * dirZ) || 1
  dirX /= dl
  dirZ /= dl
  for (var i = 0; i < 14; i++) {
    var ang = i === 0 ? 0 : (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 0.35 // radyan, aci PI kullanmadan
    var ndx = dirX * Math.cos(ang) - dirZ * Math.sin(ang)
    var ndz = dirX * Math.sin(ang) + dirZ * Math.cos(ang)
    var len = YORUICHI_HOP_MIN + Math.random() * (YORUICHI_HOP_MAX - YORUICHI_HOP_MIN)
    var x = ox + ndx * len, z = oz + ndz * len
    var y = yoruichiGround(level, x, z, oy)
    if (y !== null && Math.abs(y - oy) <= 14) return { x: x, y: y, z: z }
  }
  return null
}

// --- Ev pozu 'rest' (Easy NPC ModelData; eski adi 'yaslanma') ---
// Easy NPC kendi hazir pozlarini (data/easy_npc/poses/humanoid/*.json) ModelData'ya su bicimde yazar:
// Rotation: derece -> radyan [x,y,z,0]; Position: [x,-y,z]. Yaslanma: leaning.json, ayakta: hepsi 0.
// Ev noktasinda YASLANIR; ilk Shunpo atlamasinda ayakta olur, kovalama boyunca ayakta kalir,
// eve donunce tekrar yaslanir.
const YORUICHI_POSE_LEAN = { // ev pozu: Easy NPC 'rest' (data/easy_npc/poses/humanoid/rest.json)
  Head: { r: [5, 0, 5], p: [0, -12, 0] },
  Body: { r: [0, 0, 2.5], p: [0, -12, 0] },
  RightArm: { r: [-75, -30, 0], p: [-1, -11, 0] },
  LeftArm: { r: [-52.5, -5, 0], p: [0, -12, 0] },
  RightLeg: { r: [-32.5, -20, 0], p: [-3, -2, -2] },
  LeftLeg: { r: [-90, 40, 0], p: [6.75, -10, 0] }
}
const YORUICHI_BONES = ['Head', 'Body', 'RightArm', 'LeftArm', 'RightLeg', 'LeftLeg']
const YORUICHI_DEG = 0.017453292519943295

function yoruichiF(v) {
  var n = Number(v)
  if (n === 0) n = 0 // -0 -> 0
  return n.toFixed(7) + 'f'
}

function yoruichiPoseSnbt(lean) {
  var rot = []
  var pos = []
  for (var i = 0; i < YORUICHI_BONES.length; i++) {
    var b = YORUICHI_BONES[i]
    var d = lean ? YORUICHI_POSE_LEAN[b] : { r: [0, 0, 0], p: [0, 0, 0] }
    rot.push(b + ':[' + yoruichiF(d.r[0] * YORUICHI_DEG) + ',' + yoruichiF(d.r[1] * YORUICHI_DEG) + ',' + yoruichiF(d.r[2] * YORUICHI_DEG) + ',0.0f]')
    pos.push(b + ':[' + yoruichiF(d.p[0]) + ',' + yoruichiF(-d.p[1]) + ',' + yoruichiF(d.p[2]) + ']')
  }
  return { name: 'easy_npc:pose/humanoid/' + (lean ? 'rest' : 'standing'), rot: '{' + rot.join(',') + '}', pos: '{' + pos.join(',') + '}' }
}

// ModelData.Root (arayuzdeki Rotation ile ayarlanan MODEL yonu) DEGISTIRILMEZ: sadece poz alanlari yazilir.
// (Onceden ModelData tamamen degistiriliyordu, Root sifirlaniyor ve elle ayarlanan yon bozuluyordu.)
function yoruichiSetPose(server, lean) {
  var p = yoruichiPoseSnbt(lean)
  var base = 'data modify entity ' + YORUICHI_UUID_STR + ' ModelData.'
  server.runCommandSilent(base + 'Pose set value "DEFAULT"')
  server.runCommandSilent(base + 'PoseName set value "' + p.name + '"')
  server.runCommandSilent(base + 'Rotation set value ' + p.rot)
  server.runCommandSilent(base + 'Position set value ' + p.pos)
}

// NOT: global bir Java Map: null degeri yazip sonra reload'da okumak NullPointerException veriyor (log ile kanitlandi:
// yoruichi_chase.js reload'da yuklenmedi). Anahtarlar V2, degerler bos metin ('') - asla null yazma.
// --- Tek kovalayan: ayni anda yalniz bir oyuncu kovalar; digerleri mudahale edemez ---
if (!global.yoruichiOwnerV2) global.yoruichiOwnerV2 = ''
if (!global.yoruichiOwnerNameV2) global.yoruichiOwnerNameV2 = ''
if (!global.yoruichiBusyMsg) global.yoruichiBusyMsg = {}

// Kovalama biterken sahibi birakir. timedOut=true (60 sn doldu): 'yoruichi_tanisti' silinir,
// oyuncu Yoruichi ile yeniden konusmadan kovalama baslamaz.
function yoruichiReleaseOwner(server, timedOut) {
  var uid = global.yoruichiOwnerV2
  var name = global.yoruichiOwnerNameV2
  global.yoruichiOwnerV2 = ''
  global.yoruichiOwnerNameV2 = ''
  if (uid) delete global.yoruichiChaseState[uid]
  if (timedOut && name) {
    server.runCommandSilent('tag ' + name + ' remove yoruichi_tanisti')
    yoruichiSay(server, name, 'Sabr\u0131m t\u00fckendi. Haz\u0131r oldu\u011funda yeniden konu\u015f.')
  }
}

// Kimse kovalamiyorsa Yoruichi eve doner ve oturur (ev chunk'i yukluyse).
function yoruichiGoHome(server, level, npc) {
  var pos = new YoruichiBlockPos(Math.floor(YORUICHI_HOME.x), Math.floor(YORUICHI_HOME.y), Math.floor(YORUICHI_HOME.z))
  if (!level.isLoaded(pos)) return
  var hx = Number(npc.getX()) - YORUICHI_HOME.x, hz = Number(npc.getZ()) - YORUICHI_HOME.z
  if (hx * hx + hz * hz < 4) return
  // Yon: kovalama baslarken NPC'nin o anki (elle/arayuzden ayarlanmis) yonu kaydedilir, donunce geri verilir;
  // kayit yoksa (ornegin sunucu yeniden basladiysa) YORUICHI_HOME.yaw kullanilir.
  var homeYaw = Number(global.yoruichiHomeYawV2)
  var homePitch = Number(global.yoruichiHomePitchV2)
  if (isNaN(homeYaw)) homeYaw = YORUICHI_HOME.yaw
  if (isNaN(homePitch)) homePitch = YORUICHI_HOME.pitch
  var fromX = Number(npc.getX()), fromY = Number(npc.getY()), fromZ = Number(npc.getZ())
  server.runCommandSilent('tp @e[type=easy_npc:humanoid_slim,tag=yoruichi_npc,limit=1] ' + YORUICHI_HOME.x + ' ' + YORUICHI_HOME.y + ' ' + YORUICHI_HOME.z + ' ' + homeYaw + ' ' + homePitch)
  yoruichiShunpoFx(server, level, fromX, fromY, fromZ, YORUICHI_HOME.x, YORUICHI_HOME.y, YORUICHI_HOME.z)
  yoruichiSetPose(server, true)
}

if (!global.yoruichiChaseState) global.yoruichiChaseState = {}

ServerEvents.tick(event => {
  if (event.server.tickCount % 10 !== 0) return

  // Eve donus: son atlamadan (kovalamadan) YORUICHI_HOME_RETURN_TICKS sonra. Yoruichi evde degilse
  // yakindaki oyunculara action bar'da geri sayim gosterilir.
  var homeLevel = event.server.overworld()
  var homeNpc = homeLevel ? yoruichiFind(homeLevel) : null
  if (homeNpc) {
    var hdx = Number(homeNpc.getX()) - YORUICHI_HOME.x, hdz = Number(homeNpc.getZ()) - YORUICHI_HOME.z
    if (hdx * hdx + hdz * hdz > 4 && global.yoruichiLastHop) {
      var leftTicks = Number(global.yoruichiLastHop) + YORUICHI_HOME_RETURN_TICKS - event.server.tickCount
      if (leftTicks <= 0) {
        yoruichiGoHome(event.server, homeLevel, homeNpc)
        yoruichiReleaseOwner(event.server, true)
      } else if (event.server.tickCount % 20 === 0) {
        var secs = Math.ceil(leftTicks / 20)
        // geri sayim SADECE kovalayan oyuncuya gorunur (baskalari gormez)
        var ownerName = String(global.yoruichiOwnerNameV2 || '')
        if (ownerName) {
          event.server.players.forEach(pl => {
            if (String(pl.username) === ownerName) yoruichiActionBar(event.server, pl, 'Yoruichi eve dönüyor: ' + secs + ' sn')
          })
        }
      }
    }
  }

  event.server.players.forEach(p => {
    var tags = []
    p.getTags().forEach(t => tags.push(String(t)))
    if (tags.indexOf('yoruichi_tanisti') === -1) return
    if (tags.indexOf('yoruichi_caught') !== -1) return
    if (tags.indexOf('yoruichi_scene') !== -1) {
      // sahne suruyor: kovalama islenmez. Sahne kaydi kaybolduysa (yeniden baslatma/cikis) etiket temizlenir, kovalama yeniden yapilir
      var sceneOn = false
      global.yoruichiCutscenes.forEach(cs => { if (String(cs.name) === String(p.username)) sceneOn = true })
      if (!sceneOn) event.server.runCommandSilent('tag ' + p.username + ' remove yoruichi_scene')
      return
    }

    var level = p.level
    var npc = yoruichiFind(level)
    if (!npc) return

    var uid = p.getStringUuid()
    if (!global.yoruichiChaseState[uid]) global.yoruichiChaseState[uid] = { hops: 0, lastTick: 0, lastWaypoint: -1 }
    var state = global.yoruichiChaseState[uid]
    // guvenlik: yoruichi_caught etiketi yoksa ama eski/kalinti sayac hala maxta ise sifirla
    if (state.hops >= YORUICHI_MAX_HOPS) state.hops = 0

    var dx = p.getX() - npc.getX()
    var dy = p.getY() - npc.getY()
    var dz = p.getZ() - npc.getZ()
    var dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

    if (dist < YORUICHI_TRIGGER_DISTANCE) {
      var oldX = Number(npc.getX())
      var oldY = Number(npc.getY())
      var oldZ = Number(npc.getZ())
      // baska biri kovalarken mudahale edemez
      if (global.yoruichiOwnerV2 && global.yoruichiOwnerV2 !== String(uid)) {
        var lastMsg = Number(global.yoruichiBusyMsg[String(uid)]) || 0
        if (event.server.tickCount - lastMsg > 100) {
          global.yoruichiBusyMsg[String(uid)] = event.server.tickCount
          yoruichiActionBar(event.server, p, 'Yoruichi \u015fu an ba\u015fka biriyle ilgileniyor.')
        }
        return
      }
      if (!global.yoruichiOwnerV2) {
        global.yoruichiOwnerV2 = String(uid)
        global.yoruichiOwnerNameV2 = String(p.username)
        yoruichiSetPose(event.server, false) // ilk Shunpo: yaslanma biter, ayakta
        // evdeki yonu kaydet (eve donunce geri verilir); NPC evde degilse kaydetme
        var sdx = oldX - YORUICHI_HOME.x, sdz = oldZ - YORUICHI_HOME.z
        if (sdx * sdx + sdz * sdz < 36) {
          global.yoruichiHomeYawV2 = Number(npc.getYRot())
          global.yoruichiHomePitchV2 = Number(npc.getXRot())
        }
      }
      state.hops++
      state.lastTick = event.server.tickCount


      if (state.hops >= YORUICHI_MAX_HOPS) {
        yoruichiShunpoFx(event.server, level, oldX, oldY, oldZ, oldX, oldY, oldZ)
        event.server.runCommandSilent('tag ' + p.username + ' add yoruichi_scene') // caught sahne bitince verilir
        delete global.yoruichiChaseState[uid]
        global.yoruichiCutscenes.push({ name: p.username, t: 0 })
      } else {
        var dest = yoruichiNextWaypoint(level, npc, state.hops)
        if (!dest) {
          // uygun nokta yok: atlamayi say ama yerinde kal (parcacik + laf)
          dest = { x: Number(npc.getX()), y: Number(npc.getY()), z: Number(npc.getZ()) }
        }
        global.yoruichiLastHop = event.server.tickCount
        // ~ 0: yaw ayni kalir, bakis (pitch) 0'a sifirlanir (oyuncuya bakmak icin yukari donuk kalmasin)
        event.server.runCommandSilent('tp @e[type=easy_npc:humanoid_slim,tag=yoruichi_npc,limit=1] ' + dest.x + ' ' + dest.y + ' ' + dest.z + ' ~ 0')
        yoruichiHint(event.server, level, p, oldX, oldY, oldZ, dest)
        yoruichiShunpoFx(event.server, level, oldX, oldY, oldZ, dest.x, dest.y, dest.z)
        var taunt = YORUICHI_TAUNTS[Math.floor(Math.random() * YORUICHI_TAUNTS.length)]
        yoruichiActionBar(event.server, p, taunt)
      }
    } else if (state.hops > 0 && (event.server.tickCount - state.lastTick) > YORUICHI_TIMEOUT_TICKS) {
      state.hops = 0
    }
  })
})

// --- Shunpo ogrenme sahnesi ---
// Yoruichi'yi yakalayinca (yoruichi_caught verildigi an) baslar, ~11 sn surer: ovgu, Bleach
// tarzi "hiz" konusmasi, biriken simsek kivilcimlari, "SUNPO" basligi ve Yoruichi'nin flash
// step ile kaybolmasi. Sadece komut kullanir (oyuncunun konumuna/hareketine dokunmaz).
// Sahne sirasinda oyuncu cikarsa komutlar sessizce basarisiz olur, sorun degil.
if (!global.yoruichiCutscenes) global.yoruichiCutscenes = []

function yoruichiSay(server, name, text) {
  server.runCommandSilent('tellraw ' + name + ' [{"text":"Yoruichi","color":"light_purple","bold":true},{"text":": ' + text + '","color":"white","italic":true}]')
}

function yoruichiTitle(server, name, title, subtitle, color) {
  server.runCommandSilent('title ' + name + ' times 10 50 20')
  server.runCommandSilent('title ' + name + ' subtitle {"text":"' + subtitle + '","color":"light_purple"}')
  server.runCommandSilent('title ' + name + ' title {"text":"' + title + '","color":"' + color + '","bold":true}')
}

function yoruichiAtPlayer(server, name, cmd) {
  server.runCommandSilent('execute at ' + name + ' run ' + cmd)
}

ServerEvents.tick(event => {
  var list = global.yoruichiCutscenes
  if (list.length === 0) return
  var server = event.server
  for (var i = list.length - 1; i >= 0; i--) {
    var c = list[i]
    var n = c.name
    var t = c.t

    if (t === 0) {
      yoruichiTitle(server, n, 'Yakalad\u0131n.', 'Fena de\u011filmi\u015f.', 'white')
      yoruichiAtPlayer(server, n, 'playsound kubejs:flashstep neutral @a ~ ~ ~ 1.0 0.9')
      yoruichiAtPlayer(server, n, 'particle minecraft:cloud ~ ~1 ~ 0.6 0.5 0.6 0.05 20')
    } else if (t === 40) {
      yoruichiSay(server, n, 'H\u0131z, sadece ko\u015fmak de\u011fildir.')
    } else if (t === 75) {
      yoruichiSay(server, n, 'G\u00f6lgenden bile \u00f6nce oraya varmakt\u0131r.')
      yoruichiAtPlayer(server, n, 'playsound minecraft:entity.lightning_bolt.thunder ambient @a ~ ~ ~ 0.4 1.6')
    } else if (t === 105) {
      yoruichiSay(server, n, 'Bak, sana bir \u015fey g\u00f6stereyim. Ad\u0131na... Shunpo.')
      yoruichiAtPlayer(server, n, 'playsound minecraft:block.beacon.activate neutral @a ~ ~ ~ 0.7 1.8')
    } else if (t === 150) {
      // doruk: ekran parlar, simsek sesi, baslik
      yoruichiTitle(server, n, 'SHUNPO', 'Shunpo par\u015f\u00f6meni verildi', 'gold')
      server.runCommandSilent('give ' + n + ' irons_spellbooks:scroll{"irons_spellbooks:spell_container":{data:[{id:"kubejs:flashstep",index:0,level:1,locked:1b}],maxSpells:1,mustEquip:0b,spellWheel:0b}} 1')
      yoruichiAtPlayer(server, n, 'particle minecraft:flash ~ ~1 ~ 0 0 0 0 1 force')
      yoruichiAtPlayer(server, n, 'particle minecraft:end_rod ~ ~1 ~ 0.4 0.8 0.4 0.4 60 force')
      yoruichiAtPlayer(server, n, 'particle minecraft:electric_spark ~ ~1 ~ 0.6 0.9 0.6 0.5 60 force')
      yoruichiAtPlayer(server, n, 'playsound minecraft:entity.lightning_bolt.thunder ambient @a ~ ~ ~ 0.8 1.3')
      yoruichiAtPlayer(server, n, 'playsound minecraft:ui.toast.challenge_complete master ' + n + ' ~ ~ ~ 1.0 1.0')
      yoruichiAtPlayer(server, n, 'playsound kubejs:flashstep neutral @a ~ ~ ~ 1.0 1.3')
      server.runCommandSilent('effect give ' + n + ' minecraft:speed 8 2 true')
    } else if (t === 185) {
      yoruichiSay(server, n, 'Par\u015f\u00f6meni b\u00fcy\u00fc kitab\u0131na i\u015fle ya da elinde tutup kullan. Bakt\u0131\u011f\u0131n yere, hatta d\u00fc\u015fman\u0131n arkas\u0131na ge\u00e7ersin.')
      // Yoruichi flash step ile kaybolur ve evine (oturdugu yere) doner (ev chunk'i yukluyse)
      server.runCommandSilent('execute at @e[type=easy_npc:humanoid_slim,tag=yoruichi_npc,limit=1] run particle minecraft:cloud ~ ~0.5 ~ 0.3 0.4 0.3 0.05 20 force')
      server.runCommandSilent('execute at @e[type=easy_npc:humanoid_slim,tag=yoruichi_npc,limit=1] run particle minecraft:electric_spark ~ ~0.5 ~ 0.3 0.4 0.3 0.4 30 force')
      server.runCommandSilent('execute at @e[type=easy_npc:humanoid_slim,tag=yoruichi_npc,limit=1] run playsound kubejs:flashstep neutral @a ~ ~ ~ 1.0 1.2')
      var homeNpc2 = yoruichiFind(server.overworld())
      if (homeNpc2) yoruichiGoHome(server, server.overworld(), homeNpc2)
      yoruichiReleaseOwner(server, false)
      server.runCommandSilent('tag ' + n + ' add yoruichi_caught')
      server.runCommandSilent('tag ' + n + ' remove yoruichi_scene')
    }

    // 105-150 arasi: oyuncunun etrafinda biriken simsek kivilcimlari, giderek siklasir
    if (t > 105 && t < 150 && t % 4 === 0) {
      yoruichiAtPlayer(server, n, 'particle minecraft:electric_spark ~ ~1 ~ 0.7 0.9 0.7 0.25 ' + (4 + Math.floor((t - 105) / 8)) + ' force')
    }

    c.t++
    if (c.t > 195) list.splice(i, 1)
  }
})

// Kovalayan oyuncu cikarsa Yoruichi eve doner, kovalama sahibi birakilir.
PlayerEvents.loggedOut(event => {
  try {
    // yarim kalan sahne: kaydi sil ve scene etiketini kaldir (oyuncu sahneyi bastan oynar; parsomen verilmemisti)
    var leaving = String(event.player.username)
    global.yoruichiCutscenes = global.yoruichiCutscenes.filter(cs => String(cs.name) !== leaving)
    event.player.server.runCommandSilent('tag ' + leaving + ' remove yoruichi_scene')
    if (global.yoruichiOwnerV2 && global.yoruichiOwnerV2 === String(event.player.getStringUuid())) {
      var lvl = event.player.server.overworld()
      var n = lvl ? yoruichiFind(lvl) : null
      if (n) yoruichiGoHome(event.player.server, lvl, n)
      yoruichiReleaseOwner(event.player.server, false)
    }
  } catch (e) {
    console.error('yoruichi cikis hata: ' + e)
  }
})
