// Ortak NPC Shunpo: NPC'lerin (Aizen, Kenpachi...) hızlı yer değiştirmeleri düz '/tp' değil, Shunpo olarak görünür:
// kalkış noktasında siyah silüet ve kıvılcım, yol boyunca hız çizgileri, varışta yer halkası ve siyah patlama, flashstep sesi.
// Görsel, Yoruichi'nin Shunpo büyüsünün (yoruichi_flashstep_fx.js) fs* fonksiyonlarını kullanır; o dosya yüklü değilse eski duman efektine düşer.
// Not: server_scripts dosyaları aynı scope'ta çalışır, isimler benzersiz olmalı (npcShunpo önekli). Math.PI bu ortamda NaN dönebilir: sabit kullan.

const NPC_SHUNPO_PI = 3.141592653589793

function npcShunpoFxReady() {
  return typeof fsTrail === 'function' && typeof fsSparks === 'function' && typeof fsAfterimage === 'function' && typeof fsGroundRing === 'function' && typeof fsBlackBurst === 'function' && typeof fsLater === 'function'
}

function npcShunpoSound(server, x, y, z) {
  server.runCommandSilent('playsound kubejs:flashstep neutral @a ' + Number(x).toFixed(2) + ' ' + Number(y).toFixed(2) + ' ' + Number(z).toFixed(2) + ' 0.8 1.1')
}

// Oyuncunun önündeki (dist > 0) ya da arkasındaki (dist < 0) nokta. Bakış yönü okunamazsa oyuncunun kendi konumu döner.
function npcShunpoPoint(p, dist) {
  var yaw = Number(p.yaw)
  if (isNaN(yaw)) return { x: Number(p.x), y: Number(p.y), z: Number(p.z) }
  var rad = yaw * NPC_SHUNPO_PI / 180
  return { x: Number(p.x) - Math.sin(rad) * dist, y: Number(p.y), z: Number(p.z) + Math.cos(rad) * dist }
}

// ent: NPC varlığı. (tx, ty, tz): varış. faceName: varışta bakılacak oyuncu (isteğe bağlı, '' = bakma).
function npcShunpoTo(server, ent, tx, ty, tz, faceName) {
  var ax = Number(ent.x), ay = Number(ent.y), az = Number(ent.z)
  var uuid = String(ent.uuid)
  var level = ent.level
  var dx = tx - ax, dz = tz - az
  var len = Math.sqrt(dx * dx + dz * dz)
  var ux = len > 0.001 ? dx / len : 0
  var uz = len > 0.001 ? dz / len : 1
  if (npcShunpoFxReady()) {
    try {
      fsAfterimage(level, ax, ay, az, -uz, ux)
      fsSparks(server, level, ax, ay, az, ux, uz)
      fsTrail(server, level, ax, ay, az, tx, ty, tz)
    } catch (e) {
      console.error('npc shunpo gorsel hata: ' + e)
    }
    npcShunpoSound(server, ax, ay, az)
  } else {
    server.runCommandSilent('execute at ' + uuid + ' run particle minecraft:smoke ~ ~1 ~ 0.3 0.6 0.3 0.05 25')
    server.runCommandSilent('execute at ' + uuid + ' run playsound minecraft:entity.enderman.teleport master @a ~ ~ ~ 0.8 1.7')
  }
  server.runCommandSilent('tp ' + uuid + ' ' + Number(tx).toFixed(2) + ' ' + Number(ty).toFixed(2) + ' ' + Number(tz).toFixed(2))
  if (faceName) server.runCommandSilent('execute as ' + uuid + ' at @s facing entity ' + faceName + ' eyes run tp @s ~ ~ ~ ~ ~')
  if (npcShunpoFxReady()) {
    fsLater(1, function () {
      try {
        fsGroundRing(level, tx, ty, tz, 0.8, 12)
        fsGroundRing(level, tx, ty, tz, 1.5, 18)
        fsBlackBurst(server, tx, ty, tz, 18)
      } catch (e) {
        console.error('npc shunpo varis gorsel hata: ' + e)
      }
      npcShunpoSound(server, tx, ty, tz)
    })
  } else {
    server.runCommandSilent('execute at ' + uuid + ' run particle minecraft:end_rod ~ ~1 ~ 0.2 0.5 0.2 0.02 8')
  }
}
