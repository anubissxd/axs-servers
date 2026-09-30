// Yoruichi L2 sinavi: "Shunpo ile 5 dusmanin arkasina gec ve onlari sen oldur".
// Kural: Shunpo ile bir dusmanin arkasina gecilince dusman isaretlenir (fs_owner = oyuncu,
// fs_mark = sunucu tick'i; yoruichi_flashstep_fx.js; isaretli dusman parlar). Isaretliyi SON VURUSU sen yaparsan
// sayilir, isaret 2 dakika (2400 tick) gecerli. Sure siniri yok ki can/silah gucu farketmesin.
// Sayac sadece 'yoruichi_l2' etiketi olan (sinava baslamis) ve 'yoruichi_l2_done' almamis oyuncuda
// islenir. 5/5 olunca 'yoruichi_l2_done' verilir; Yoruichi ile konusunca parsomen alir.
// Ilerleme (0/5, 1/5, ...) gorev aktifken her 2 sn action bar'da gorunur; her sayilan oldurmede sohbete de yazilir.
// Etiketler NPC diyalog dugmesinden verilir (docs/medieval-fantasy/characters/yoruichi.md).
// Not: server_scripts dosyalari ayni scope'ta calisiyor, isimler benzersiz olmali.
const YORUICHI_L2_TARGET = 5
const YORUICHI_L2_MARK_TICKS = 2400

function yoruichiL2HasTag(p, tag) {
  var found = false
  p.getTags().forEach(t => { if (String(t) === tag) found = true })
  return found
}

function yoruichiL2Progress(server, name, n) {
  server.runCommandSilent('title ' + name + ' actionbar {"text":"Shunpo: ' + n + '/' + YORUICHI_L2_TARGET + ' düşman","color":"light_purple"}')
  server.runCommandSilent('tellraw ' + name + ' [{"text":"Yoruichi görevi","color":"light_purple","bold":true},{"text":": ' + n + '/' + YORUICHI_L2_TARGET + ' düşman.","color":"white","bold":false}]')
}

EntityEvents.death(event => {
  try {
    var pd = event.entity.persistentData
    if (!pd.contains('fs_owner')) return // isaretli degil, sessizce gec
    var src = event.source.actual
    if (!src || !src.isPlayer()) {
      console.info('yoruichi l2: isaretli dusman oyuncu disinda oldu, sayilmadi')
      return
    }
    if (String(pd.getString('fs_owner')) !== String(src.getStringUuid())) {
      console.info('yoruichi l2: isaretli dusmani baska oyuncu oldurdu, sayilmadi')
      return
    }
    if (global.flashstepTickV3 - Number(pd.getInt('fs_mark')) > YORUICHI_L2_MARK_TICKS) {
      console.info('yoruichi l2: isaretin suresi dolmustu, sayilmadi')
      return
    }
    if (!yoruichiL2HasTag(src, 'yoruichi_l2') || yoruichiL2HasTag(src, 'yoruichi_l2_done')) {
      console.info('yoruichi l2: oyuncuda yoruichi_l2 gorevi aktif degil, sayilmadi')
      return
    }

    var n = Number(src.persistentData.getInt('flashstep_kills')) + 1
    src.persistentData.putInt('flashstep_kills', n)
    var name = String(src.username)
    if (n >= YORUICHI_L2_TARGET) {
      event.server.runCommandSilent('tag ' + name + ' add yoruichi_l2_done')
      event.server.runCommandSilent('tag ' + name + ' remove yoruichi_l2')
      yoruichiL2Progress(event.server, name, n)
      event.server.runCommandSilent('tellraw ' + name + ' [{"text":"Yoruichi","color":"light_purple","bold":true},{"text":": Beş gölge, beş sessiz son. Bana dön.","color":"white","italic":true,"bold":false}]')
    } else {
      yoruichiL2Progress(event.server, name, n)
    }
  } catch (e) {
    console.error('yoruichi l2 sayac hata: ' + e)
  }
})

// Gorev aktifken (yoruichi_l2 var, yoruichi_l2_done yok) ilerleme her 2 saniyede action bar'da gorunur: "Shunpo: 0/5 dusman".
var yoruichiL2Phase = 0
ServerEvents.tick(event => {
  yoruichiL2Phase++
  if (yoruichiL2Phase % 40 !== 0) return
  event.server.players.forEach(p => {
    try {
      if (!yoruichiL2HasTag(p, 'yoruichi_l2') || yoruichiL2HasTag(p, 'yoruichi_l2_done')) return
      var n = Number(p.persistentData.getInt('flashstep_kills'))
      event.server.runCommandSilent('title ' + String(p.username) + ' actionbar {"text":"Shunpo: ' + n + '/' + YORUICHI_L2_TARGET + ' düşman","color":"light_purple"}')
    } catch (e) {
      // gosterge kozmetik
    }
  })
})
