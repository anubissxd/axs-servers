// Yoruichi ucretleri: her egitim (L1, L2, L3) zumrut blogu ister.
// Akis: diyalog dugmesi 'yoruichi_pay_l<n>' etiketini verir ve kapanir; bu script etiketi alir, envanterde
// yeterli zumrut blogu varsa keser ve gorevi baslatir (l1: yoruichi_tanisti, l2: yoruichi_l2, l3: yoruichi_l3_start),
// yoksa "yeterli zumrut blogun yok" der. Ucret her seviye icin BIR KEZ alinir ('yoruichi_paid_l<n>' etiketi):
// 60 sn sonra yeniden konusma ya da Golge Klon'u yeniden deneme ucret istemez.
// Diyaloglardaki ucret metinleri (yoruichi.md, tools/yoruichi/gen_*.js) bu degerlerle ELLE esitlenmelidir.
// Not: server_scripts dosyalari ayni scope'ta calisiyor, isimler benzersiz olmali.
const YORUICHI_PRICES = { l1: 3, l2: 6, l3: 10 } // zumrut blogu

// Keşif Birliği bağı: Yoruichi de Erwin'in rütbesini sorar (Kakashi/Itachi gibi). Ücret ödenmiş bir seviye (yoruichi_paid_<n>) geri çevrilmez.
// Rütbe sırası: 1 Kül Bekçisi, 2 Kan Yeminli, 3 Gece Avcısı (isimler erwin_seferleri.js ERWIN_RANK_NAMES'ten okunur).
const YORUICHI_MIN_RANK = { l1: 1, l2: 2, l3: 3 }

var yoruichiPayPhase = 0

function yoruichiPayHasTag(p, tag) {
  var found = false
  p.getTags().forEach(t => { if (String(t) === tag) found = true })
  return found
}

function yoruichiEmeraldBlocks(server, p, name) {
  try {
    return Number(p.inventory.count('minecraft:emerald_block'))
  } catch (e) {
    // yedek: 'clear ... 0' silmeden esitleri sayar
    return Number(server.runCommandSilent('clear ' + name + ' minecraft:emerald_block 0')) || 0
  }
}

function yoruichiPay(server, p, name, k) {
  server.runCommandSilent('tag ' + name + ' remove yoruichi_pay_' + k)
  var price = YORUICHI_PRICES[k]
  if (!yoruichiPayHasTag(p, 'yoruichi_paid_' + k)) {
    var needRank = YORUICHI_MIN_RANK[k]
    if (erwinRank(p) < needRank) {
      yoruichiSayDlg(server, name, 'Henüz erken. Keşif Birliği\'nde ' + ERWIN_RANK_NAMES[needRank] + ' olmadan sana bir şey öğretmem. Erwin\'in seferlerinde adını duyur, sonra gel.')
      return
    }
    var have = yoruichiEmeraldBlocks(server, p, name)
    if (isNaN(have) || have < price) {
      yoruichiSayDlg(server, name, 'Yeterli zümrüt bloğun yok. ' + price + ' zümrüt bloğu getir (' + (isNaN(have) ? 0 : have) + '/' + price + ').')
      return
    }
    server.runCommandSilent('clear ' + name + ' minecraft:emerald_block ' + price)
    server.runCommandSilent('tag ' + name + ' add yoruichi_paid_' + k)
    yoruichiSay(server, name, price + ' zümrüt bloğu. Adil bir ücret.')
  }
  if (k === 'l1') {
    server.runCommandSilent('tag ' + name + ' add yoruichi_tanisti')
    yoruichiSay(server, name, 'İyi. O zaman beni takip et - görebilirsen.')
  } else if (k === 'l2') {
    p.persistentData.putInt('flashstep_kills', 0) // yeni denemede sayac sifirdan baslar
    server.runCommandSilent('tag ' + name + ' add yoruichi_l2')
  } else if (k === 'l3') {
    server.runCommandSilent('tag ' + name + ' add yoruichi_l3_start')
  }
}

ServerEvents.tick(event => {
  yoruichiPayPhase++
  if (yoruichiPayPhase % 5 !== 0) return
  event.server.players.forEach(p => {
    try {
      var name = String(p.username)
      var keys = ['l1', 'l2', 'l3']
      for (var i = 0; i < keys.length; i++) {
        if (yoruichiPayHasTag(p, 'yoruichi_pay_' + keys[i])) yoruichiPay(event.server, p, name, keys[i])
      }
    } catch (e) {
      console.error('yoruichi odeme hata: ' + e)
    }
  })
})
