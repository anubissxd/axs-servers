// Sinema motoru: Erwin ve büyü hocalarının (Kakashi, Itachi) sahnelerini zamanlı bir senaryo olarak oynatır.
//
// Bir senaryo (timeline) adımlardan oluşur; her adımın 't' alanı (saniye) senaryo başlangıcından itibaren ne zaman çalışacağını söyler:
//   { t: 0,   title: ['ANA BAŞLIK', 'alt başlık', 'gold'] }        ekranda başlık (renk: gold, red, dark_purple...)
//   { t: 0,   sound: ['minecraft:block.bell.use', 1, 1] }           oyuncunun etrafında ses (id, ses, perde)
//   { t: 1,   say: ['Erwin', 'metin'] }                            konuşan kişi: 'Erwin', 'Kakashi' veya 'Itachi'
//   { t: 1,   note: ['metin', 'yellow'] }                           renkli sistem satırı
//   { t: 1,   cmd: 'execute at {p} run particle ...' }              serbest komut ({p} oyuncu adı)
//   { t: 8,   fn: 'hocaSceneStart', args: ['chidori'] }             oyun mantığı çağrısı (yalnızca izin verilen adlar: hocaSceneStart, kenpachiFightBegin, aizenFightBegin)
// Kurallar: sinema yalnızca bezemedir. Ödül, sayaç ve durum senaryodan bağımsız hemen işlenir; tek istisna sahne sınavlarının
// senaryo sonunda başlamasıdır (fn adımı). Oyuncu çıkarsa senaryo düşer. Aynı oyuncuda aynı anda tek senaryo çalışır.
// Not: server_scripts dosyaları aynı scope'ta çalışır; erwinSay/hocaSay gibi işlevler çalışma anında çağrılır (yükleme sırası önemsiz).

function cineList() {
  if (!global.cineTimelines) global.cineTimelines = []
  return global.cineTimelines
}

function cineBusy(name) {
  var busy = false
  cineList().forEach(c => { if (String(c.name) === String(name)) busy = true })
  return busy
}

// Aynı oyuncuda senaryo sürüyorsa yeni senaryo onun sonuna eklenir (arada 1,5 sn boşlukla); sahneler birbirini ezmez.
function cinePlay(server, name, steps) {
  var list = cineList()
  var sorted = steps.slice().sort((a, b) => a.t - b.t)
  var cur = null
  list.forEach(c => { if (String(c.name) === String(name)) cur = c })
  if (cur) {
    var last = cur.steps.length > 0 ? Number(cur.steps[cur.steps.length - 1].t) : 0
    sorted.forEach(st => {
      var copy = {}
      Object.keys(st).forEach(k => { copy[k] = st[k] })
      copy.t = last + 1.5 + Number(st.t)
      cur.steps.push(copy)
    })
    return
  }
  list.push({ name: String(name), start: Date.now(), steps: sorted, idx: 0 })
}

function cineEsc(s) { return String(s).split('\\').join('\\\\').split('"').join('\\"') }

function cineTitle(server, name, main, sub, color) {
  server.runCommandSilent('title ' + name + ' times 10 50 20')
  if (sub) server.runCommandSilent('title ' + name + ' subtitle {"text":"' + cineEsc(sub) + '","color":"' + (color || 'gold') + '"}')
  server.runCommandSilent('title ' + name + ' title {"text":"' + cineEsc(main) + '","color":"' + (color || 'gold') + '","bold":true}')
}

function cineRunStep(server, name, p, st) {
  if (st.title) cineTitle(server, name, st.title[0], st.title[1], st.title[2])
  if (st.sound) server.runCommandSilent('playsound ' + st.sound[0] + ' master ' + name + ' ~ ~ ~ ' + (st.sound[1] === undefined ? 1 : st.sound[1]) + ' ' + (st.sound[2] === undefined ? 1 : st.sound[2]))
  if (st.say) {
    if (st.say[0] === 'Erwin') erwinSay(server, name, st.say[1])
    else hocaSay(server, name, st.say[0], st.say[1])
  }
  if (st.note) server.runCommandSilent('tellraw ' + name + ' {"text":"' + cineEsc(st.note[0]) + '","color":"' + (st.note[1] || 'gray') + '"}')
  if (st.cmd) server.runCommandSilent(String(st.cmd).split('{p}').join(name))
  if (st.fn === 'hocaSceneStart') hocaSceneStart(server, p, name, st.args[0])
  if (st.fn === 'kenpachiFightBegin') kenpachiFightBegin(server, p, name)
  if (st.fn === 'aizenFightBegin') aizenFightBegin(server, p, name)
}

var cinePhase = 0

ServerEvents.tick(event => {
  cinePhase++
  if (cinePhase % 5 !== 0) return
  var list = cineList()
  if (list.length === 0) return
  var server = event.server
  var now = Date.now()
  for (var i = list.length - 1; i >= 0; i--) {
    var c = list[i]
    try {
      var p = null
      server.players.forEach(o => { if (String(o.username) === String(c.name)) p = o })
      if (!p) { list.splice(i, 1); continue }
      var elapsed = (now - Number(c.start)) / 1000
      while (c.idx < c.steps.length && c.steps[c.idx].t <= elapsed) {
        var st = c.steps[c.idx]
        c.idx = c.idx + 1
        cineRunStep(server, String(c.name), p, st)
      }
      if (c.idx >= c.steps.length) list.splice(i, 1)
    } catch (e) {
      console.error('sinema hata: ' + e)
      list.splice(i, 1)
    }
  }
}
)

// Ortak sinema parçaları: temalı açılış efektleri (komut listeleri)
const CINE_FX = {
  simsek: [
    { t: 0, sound: ['minecraft:entity.lightning_bolt.thunder', 0.7, 1.1] },
    { t: 0, cmd: 'execute at {p} run particle minecraft:electric_spark ~ ~1 ~ 0.6 0.9 0.6 0.4 60' },
    { t: 0.4, cmd: 'effect give {p} minecraft:darkness 2 0 true' }
  ],
  alev: [
    { t: 0, sound: ['minecraft:item.firecharge.use', 1, 0.6] },
    { t: 0, cmd: 'execute at {p} run particle minecraft:soul_fire_flame ~ ~1 ~ 0.6 0.9 0.6 0.05 60' },
    { t: 0.4, cmd: 'effect give {p} minecraft:darkness 2 0 true' }
  ],
  golge: [
    { t: 0, sound: ['minecraft:entity.enderman.stare', 0.6, 0.6] },
    { t: 0, cmd: 'execute at {p} run particle minecraft:portal ~ ~1 ~ 0.6 0.9 0.6 0.6 80' },
    { t: 0.4, cmd: 'effect give {p} minecraft:darkness 3 0 true' }
  ],
  zafer: [
    { t: 0, sound: ['minecraft:entity.player.levelup', 0.8, 1.2] },
    { t: 0, cmd: 'execute at {p} run particle minecraft:totem_of_undying ~ ~1 ~ 0.5 0.8 0.5 0.3 40' }
  ],
  // Itachi: karga sürüsü (yarasalar 'Karga' adıyla), 8 sn sonra silinir
  karga: [
    { t: 0.3, cmd: 'execute at {p} run summon minecraft:bat ~1.5 ~2 ~ {CustomName:\'{"text":"Karga","color":"dark_gray"}\',Tags:["hoca_karga"]}' },
    { t: 0.3, cmd: 'execute at {p} run summon minecraft:bat ~-1.5 ~2.5 ~1 {CustomName:\'{"text":"Karga","color":"dark_gray"}\',Tags:["hoca_karga"]}' },
    { t: 0.3, cmd: 'execute at {p} run summon minecraft:bat ~1 ~3 ~-2 {CustomName:\'{"text":"Karga","color":"dark_gray"}\',Tags:["hoca_karga"]}' },
    { t: 0.3, cmd: 'execute at {p} run summon minecraft:bat ~-2 ~2 ~-1.5 {CustomName:\'{"text":"Karga","color":"dark_gray"}\',Tags:["hoca_karga"]}' },
    { t: 0.3, cmd: 'execute at {p} run summon minecraft:bat ~2 ~2.5 ~2 {CustomName:\'{"text":"Karga","color":"dark_gray"}\',Tags:["hoca_karga"]}' },
    { t: 0.3, sound: ['minecraft:entity.bat.takeoff', 1, 0.6] },
    { t: 0.5, cmd: 'execute at {p} run particle minecraft:large_smoke ~ ~2 ~ 1.5 1 1.5 0.02 30' },
    { t: 3, sound: ['minecraft:entity.bat.takeoff', 0.8, 0.5] },
    { t: 8, cmd: 'execute at {p} run kill @e[tag=hoca_karga,distance=..60]' }
  ],
  // Kakashi Chidori L4: uzaktan sahte şimşekler (yalnızca parçacık ve ses; gerçek yıldırım yok, ateş/hasar riski yok)
  firtina: [
    { t: 1, cmd: 'execute at {p} positioned ~9 ~ ~5 run particle minecraft:electric_spark ~ ~ ~ 0.15 7 0.15 0.8 60' },
    { t: 1, sound: ['minecraft:entity.lightning_bolt.thunder', 0.8, 0.9] },
    { t: 2.6, cmd: 'execute at {p} positioned ~-10 ~ ~-4 run particle minecraft:electric_spark ~ ~ ~ 0.15 7 0.15 0.8 60' },
    { t: 2.6, sound: ['minecraft:entity.lightning_bolt.thunder', 0.9, 0.8] },
    { t: 4.4, cmd: 'execute at {p} positioned ~3 ~ ~-11 run particle minecraft:electric_spark ~ ~ ~ 0.15 7 0.15 0.8 60' },
    { t: 4.4, sound: ['minecraft:entity.lightning_bolt.thunder', 1, 1] }
  ],
  // Gojo: Mavi (çekim), Kırmızı (itme), Mor (birleşim)
  mavi: [
    { t: 0, sound: ['minecraft:block.beacon.activate', 0.8, 1.4] },
    { t: 0, cmd: 'execute at {p} run particle minecraft:dust 0.2 0.5 1 2 ~ ~1 ~ 1.2 0.9 1.2 0.02 70' },
    { t: 0, cmd: 'execute at {p} run particle minecraft:reverse_portal ~ ~1 ~ 1.5 1 1.5 0.05 60' },
    { t: 0.4, cmd: 'effect give {p} minecraft:darkness 2 0 true' }
  ],
  kirmizi: [
    { t: 0, sound: ['minecraft:entity.generic.explode', 0.6, 1.5] },
    { t: 0, cmd: 'execute at {p} run particle minecraft:dust 1 0.1 0.1 2 ~ ~1 ~ 1.2 0.9 1.2 0.02 70' },
    { t: 0, cmd: 'execute at {p} run particle minecraft:explosion ~ ~1 ~ 0.6 0.4 0.6 0 4' },
    { t: 0.4, cmd: 'effect give {p} minecraft:darkness 2 0 true' }
  ],
  mor: [
    { t: 0, sound: ['minecraft:entity.ender_dragon.growl', 0.5, 0.7] },
    { t: 0, cmd: 'execute at {p} run particle minecraft:dust 0.6 0.1 0.9 2 ~ ~1 ~ 1.4 1 1.4 0.02 80' },
    { t: 0, cmd: 'execute at {p} run particle minecraft:portal ~ ~1 ~ 1.4 1 1.4 0.6 80' },
    { t: 0.4, cmd: 'effect give {p} minecraft:darkness 3 0 true' }
  ],
  parsomen: [
    { t: 0, sound: ['minecraft:block.enchantment_table.use', 1, 1.1] },
    { t: 0, cmd: 'execute at {p} run particle minecraft:enchant ~ ~1.2 ~ 0.6 0.8 0.6 0.9 90' },
    { t: 0.2, cmd: 'effect give {p} minecraft:slowness 3 2 true' }
  ]
}
