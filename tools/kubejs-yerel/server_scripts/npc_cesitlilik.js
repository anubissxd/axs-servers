// NPC diyalog çeşitliliği: aynı karşılama sürekli tekrar etmesin diye her NPC'nin karşılama diyaloğunun birden fazla sürümü vardır.
// Easy NPC diyalogları sabit olduğundan, sürümler ayrı diyaloglar olarak tanımlanır (dv_<npc>_<n>) ve hangisinin açılacağı oyuncudaki
// 'dv_<npc>_<n>' etiketiyle belirlenir. NPC'nin etkileşim yönlendirmesi her konuşmada 'dv_reroll_<npc>' etiketini verir; bu script
// bir öncekinden farklı yeni bir sürüm seçer. (Hocaların karşılamaları aynı mantıkla hocalar_egitim.js'te; Miu bu sisteme dahil değildir.)
// Not: server_scripts dosyaları aynı scope'ta çalışır, isimler benzersiz olmalı.

const CESIT_NPCS = { erwin: 4, thor: 4, kenpachi: 4, yoruichi: 3, aizen: 3 } // npc: sürüm sayısı

var cesitPhase = 0

function cesitHas(p, tag) {
  var found = false
  p.getTags().forEach(t => { if (String(t) === tag) found = true })
  return found
}

ServerEvents.tick(event => {
  cesitPhase++
  if (cesitPhase % 10 !== 0) return
  var server = event.server
  server.players.forEach(p => {
    try {
      var name = String(p.username)
      Object.keys(CESIT_NPCS).forEach(n => {
        if (!cesitHas(p, 'dv_reroll_' + n)) return
        server.runCommandSilent('tag ' + name + ' remove dv_reroll_' + n)
        var count = CESIT_NPCS[n]
        var cur = 0
        for (var i = 1; i <= count; i++) {
          if (cesitHas(p, 'dv_' + n + '_' + i)) { cur = i; server.runCommandSilent('tag ' + name + ' remove dv_' + n + '_' + i) }
        }
        var next = cur
        while (next === cur) next = 1 + Math.floor(Math.random() * count)
        server.runCommandSilent('tag ' + name + ' add dv_' + n + '_' + next)
      })
    } catch (e) {
      console.error('npc cesitlilik hata: ' + e)
    }
  })
})
