// Thorfinn (Vinland Saga): Caddy'nin çiftçisi ve tüccarı. Sunucudaki bütün ticaret onun elindedir.
// Kurallar (bilinçli olarak sert):
//   - Bir şey SATIN alırken bedel ZÜMRÜT ile ödenir (zümrüt bloğu değil). Zümrüt bloğu yalnızca ders/eğitim ücretidir.
//   - Malların çoğu Keşif Birliği rütbesi ister (erwinRank), stok az ve kişiye özeldir, yenilenme süresi uzundur.
//   - Zümrüt kazanmanın yolu: Erwin'in seferleri (asıl kaynak) ve Thorfinn'in hasat siparişleri (küçük, emek isteyen kaynak).
// Etiket akışı (diyalog düğmeleri yalnızca etiket verir, mantık burada): thor_shop, thor_ord, thor_info, thor_abort, thor_stok, thor_kayit
// Not: server_scripts dosyaları aynı scope'ta çalışır; erwinRank / ERWIN_RANK_NAMES / erwinHas / cinePlay çalışma anında kullanılır.

const THOR_UUID = '1e6fe9d9-ae31-4abf-8b86-0bcc093b2413'
const THOR_SHOP_TIMEOUT_MS = 600000
const THOR_DAILY_ORDERS = 4
const THOR_ORDER_COOLDOWN_MS = 180000

// ------------------------------------------------------------------ Dükkân (Easy NPC ticaret ekranı)
// rank: gereken Birlik rütbesi (1-4), price: ZÜMRÜT (en çok 128), stock: oyuncu başına bir yenilenmede alınabilecek adet, hours: yenilenme süresi (gerçek saat).
// Stok KİŞİYE ÖZELDİR (oyuncunun persistentData'sı: thor_shop_*), tembel yenilenir. Stoklar yarıya indirildi: en çok 1 adet; zaten 1 olanların yenilenme süresi iki katına çıktı.
const THOR_SHOP = [
  { key: 'havuc', stock: 1, hours: 8, rank: 1, id: 'minecraft:golden_carrot', n: 8, price: 8 },
  { key: 'ok', stock: 1, hours: 8, rank: 1, id: 'minecraft:arrow', n: 32, price: 6 },
  { key: 'et', stock: 1, hours: 8, rank: 1, id: 'minecraft:cooked_beef', n: 16, price: 6 },
  { key: 'tsisesi', stock: 1, hours: 12, rank: 1, id: 'minecraft:experience_bottle', n: 4, price: 12 },
  { key: 'altinelma', stock: 1, hours: 24, rank: 2, id: 'minecraft:golden_apple', n: 1, price: 24 },
  { key: 'inci', stock: 1, hours: 24, rank: 2, id: 'minecraft:ender_pearl', n: 2, price: 32 },
  { key: 'tsisesi2', stock: 1, hours: 24, rank: 2, id: 'minecraft:experience_bottle', n: 12, price: 40 },
  { key: 'elmas', stock: 1, hours: 48, rank: 3, id: 'minecraft:diamond', n: 1, price: 40 },
  { key: 'pargasi', stock: 1, hours: 96, rank: 3, id: 'minecraft:netherite_scrap', n: 1, price: 96 },
  { key: 'totem', stock: 1, hours: 144, rank: 3, id: 'minecraft:totem_of_undying', n: 1, price: 128 },
  { key: 'tsisesi3', stock: 1, hours: 48, rank: 4, id: 'minecraft:experience_bottle', n: 32, price: 96 },
  { key: 'pargasi2', stock: 1, hours: 96, rank: 4, id: 'minecraft:netherite_scrap', n: 1, price: 80 },
  { key: 'buyulu', stock: 1, hours: 192, rank: 4, id: 'minecraft:enchanted_golden_apple', n: 1, price: 128 }
]

function thorJsonEsc(s) { return String(s).split('\\').join('\\\\').split('"').join('\\"') }

function thorSay(server, name, text) {
  server.runCommandSilent('tellraw ' + name + ' [{"text":"Thorfinn","color":"gold","bold":true},{"text":": ' + thorJsonEsc(text) + '","color":"white","italic":true,"bold":false}]')
}

function thorNote(server, name, text, color) {
  server.runCommandSilent('tellraw ' + name + ' {"text":"' + thorJsonEsc(text) + '","color":"' + (color || 'gray') + '"}')
}

function thorHas(p, tag) {
  var found = false
  p.getTags().forEach(t => { if (String(t) === tag) found = true })
  return found
}

function thorItemName(id) { return String(id).split(':')[1].split('_').join(' ') }

function thorFmtMins(mins) {
  return mins >= 60 ? Math.floor(mins / 60) + ' sa ' + (mins % 60) + ' dk' : mins + ' dk'
}

function thorStockLeft(p, item) {
  var sd = p.persistentData
  var now = Date.now()
  var next = Number(sd.getLong('thor_shop_t_' + item.key))
  if (next === 0 || now >= next) {
    sd.putInt('thor_shop_' + item.key, item.stock)
    sd.putLong('thor_shop_t_' + item.key, now + item.hours * 3600000)
  }
  return Number(sd.getInt('thor_shop_' + item.key))
}

// /erwin_rutbe komutu bunu çağırır
function thorShopResetStock(p) {
  THOR_SHOP.forEach(it => { p.persistentData.putLong('thor_shop_t_' + it.key, 0) })
}

function thorStockInfo(server, p, name) {
  thorNote(server, name, '— Thorfinn\'in ambarı (sana özel stok) —', 'gold')
  var r = erwinRank(p)
  THOR_SHOP.forEach(it => {
    var left = thorStockLeft(p, it)
    var mins = Math.max(0, Math.ceil((Number(p.persistentData.getLong('thor_shop_t_' + it.key)) - Date.now()) / 60000))
    var lock = it.rank > r ? ' [' + ERWIN_RANK_NAMES[it.rank] + ']' : ''
    thorNote(server, name, it.n + ' ' + thorItemName(it.id) + ' — ' + it.price + ' zümrüt — stok ' + left + '/' + it.stock + ' (yenilenme ' + thorFmtMins(mins) + ')' + lock, left > 0 ? (it.rank > r ? 'dark_gray' : 'gray') : 'red')
  })
}

function thorShopFindPlayer(server, name) {
  var found = null
  server.players.forEach(o => { if (String(o.username) === String(name)) found = o })
  return found
}

function thorShopNpc(server) {
  try { return server.overworld().getEntity(Java.loadClass('java.util.UUID').fromString(THOR_UUID)) } catch (e) { return null }
}

// Ticaret ekranı tek NPC'ye bağlıdır: oyuncu için açılmadan hemen önce teklif listesi yazılır (maxUses = kalan stok).
// Ekran açıkken yapılan alımlar (uses) her 10 tickte okunup oyuncunun stoğundan düşülür; ekran kapanınca son eşitleme yapılır.
function thorShopSync(server, forceEnd) {
  var sh = global.thorShop
  if (!sh || !sh.user) return
  var p = thorShopFindPlayer(server, sh.user)
  var npc = thorShopNpc(server)
  if (npc && p) {
    try {
      var list = npc.getTradingOffers()
      for (var i = 0; i < sh.keys.length && i < list.size(); i++) {
        var used = Number(list.get(i).getUses())
        var delta = used - Number(sh.seen[i])
        if (delta > 0) {
          var key = sh.keys[i]
          var cur = Number(p.persistentData.getInt('thor_shop_' + key))
          p.persistentData.putInt('thor_shop_' + key, Math.max(0, cur - delta))
          sh.seen[i] = used
        }
      }
    } catch (e) {
      console.error('thorfinn dukkan eslestirme hata: ' + e)
    }
  }
  var closed = false
  if (!p) closed = true
  else {
    try { closed = p.containerMenu === p.inventoryMenu } catch (e) { closed = (Date.now() - Number(sh.start)) > 45000 }
    if (Date.now() - Number(sh.start) < 3000) closed = false
  }
  if (forceEnd || closed || Date.now() - Number(sh.start) > THOR_SHOP_TIMEOUT_MS) sh.user = ''
}

function thorShopOpen(server, p, name) {
  var rank = erwinRank(p)
  if (rank < 1) {
    thorSay(server, name, 'Mallarım adı duyulmuş insanlara. Keşif Birliği\'nde **Kül Bekçisi** ol, sonra konuşuruz. Kolay kazanılan şey kolay harcanır.'.split('**').join(''))
    return
  }
  thorShopSync(server, false)
  var sh = global.thorShop
  if (sh && sh.user && String(sh.user) !== name) {
    thorNote(server, name, 'Thorfinn şu an başka biriyle pazarlık ediyor. Biraz bekle.', 'gray')
    return
  }
  var npc = thorShopNpc(server)
  if (!npc) {
    thorSay(server, name, 'Ambarın kilidi takıldı. Biraz sonra gel.')
    return
  }
  var keys = []
  var seen = []
  var list = NBT.listTag()
  THOR_SHOP.forEach(it => {
    if (it.rank > rank) return
    if (!Item.exists(it.id)) return
    var left = thorStockLeft(p, it)
    keys.push(it.key)
    seen.push(0)
    var buy = NBT.compoundTag()
    buy.putString('id', 'minecraft:emerald')
    buy.putByte('Count', Math.min(64, it.price))
    var sell = NBT.compoundTag()
    sell.putString('id', it.id)
    sell.putByte('Count', it.n)
    var rec = NBT.compoundTag()
    rec.put('buy', buy)
    if (it.price > 64) {
      var buyB = NBT.compoundTag()
      buyB.putString('id', 'minecraft:emerald')
      buyB.putByte('Count', it.price - 64)
      rec.put('buyB', buyB)
    }
    rec.put('sell', sell)
    rec.putInt('maxUses', Math.max(1, left))
    rec.putInt('uses', left > 0 ? 0 : 1)
    rec.putInt('xp', 0)
    rec.putFloat('priceMultiplier', 0)
    rec.putInt('specialPrice', 0)
    rec.putInt('demand', 0)
    list.add(rec)
  })
  var root = NBT.compoundTag()
  root.put('Recipes', list)
  global.thorShop = { user: name, keys: keys, seen: seen, start: Date.now() }
  try {
    server.runCommandSilent('data modify entity ' + THOR_UUID + ' TradingData set value {TradingDataSet:{Type:"CUSTOM",MaxUses:64,RewardedXP:0,ResetsEveryMin:0,LastReset:0L}}')
    npc.setTradingOffers(new (Java.loadClass('net.minecraft.world.item.trading.MerchantOffers'))(root))
    server.runCommandSilent('easy_npc trading open ' + THOR_UUID + ' ' + name)
  } catch (e) {
    console.error('thorfinn dukkan acilis hata: ' + e)
    global.thorShop = { user: '', keys: [], seen: [], start: 0 }
    thorSay(server, name, 'Ambarın kilidi takıldı. Biraz sonra gel.')
    return
  }
  thorNote(server, name, 'Bedel zümrüttür. Stok sana özel ve az; tükenen mal uzun süre sonra yenilenir.', 'gold')
}

// ------------------------------------------------------------------ Hasat siparişleri
// Thorfinn'e mal teslim edip zümrüt kazanırsın. Ödül bilerek küçüktür: emek ister, hızlı zenginleştirmez.
// tier 1: ham mahsul, 2: pişmiş yemek, 3: şarap/içecek/ziyafet. Mod eşyaları Item.exists ile doğrulanır (olmayan sipariş havuzdan düşer).
const THOR_ORDERS_EXTRA = []
const THOR_ORDERS = [
  { key: 'bugday', tier: 1, id: 'minecraft:wheat', n: [40, 56], em: [2, 3], label: 'buğday' },
  { key: 'havuc', tier: 1, id: 'minecraft:carrot', n: [32, 48], em: [2, 3], label: 'havuç' },
  { key: 'patates', tier: 1, id: 'minecraft:potato', n: [32, 48], em: [2, 3], label: 'patates' },
  { key: 'pancar', tier: 1, id: 'minecraft:beetroot', n: [24, 32], em: [2, 3], label: 'pancar' },
  { key: 'kabak', tier: 1, id: 'minecraft:pumpkin', n: [12, 16], em: [3, 4], label: 'kabak' },
  { key: 'karpuz', tier: 1, id: 'minecraft:melon_slice', n: [40, 56], em: [2, 3], label: 'karpuz dilimi' },
  { key: 'yaban', tier: 1, id: 'minecraft:sweet_berries', n: [28, 40], em: [2, 3], label: 'tatlı yaban mersini' },
  { key: 'domates', tier: 1, id: 'farmersdelight:tomato', n: [20, 28], em: [3, 4], label: 'domates' },
  { key: 'sogan', tier: 1, id: 'farmersdelight:onion', n: [20, 28], em: [3, 4], label: 'soğan' },
  { key: 'pirinc', tier: 1, id: 'farmersdelight:rice', n: [28, 40], em: [3, 4], label: 'pirinç' },
  { key: 'cilek', tier: 1, id: 'bakery:strawberry', n: [20, 28], em: [3, 4], label: 'çilek' },
  { key: 'yabanmersini', tier: 1, id: 'hearthandharvest:blueberries', n: [20, 28], em: [3, 4], label: 'yaban mersini' },
  { key: 'ekmek', tier: 2, id: 'minecraft:bread', n: [20, 28], em: [5, 6], label: 'ekmek' },
  { key: 'etcorba', tier: 2, id: 'farmersdelight:beef_stew', n: [5, 7], em: [6, 8], label: 'sığır güveci' },
  { key: 'tavukcorba', tier: 2, id: 'farmersdelight:chicken_soup', n: [5, 7], em: [6, 8], label: 'tavuk çorbası' },
  { key: 'sebzecorba', tier: 2, id: 'farmersdelight:vegetable_soup', n: [5, 7], em: [6, 8], label: 'sebze çorbası' },
  { key: 'kabakcorba', tier: 2, id: 'farmersdelight:pumpkin_soup', n: [5, 7], em: [6, 8], label: 'kabak çorbası' },
  { key: 'pilav', tier: 2, id: 'farmersdelight:fried_rice', n: [5, 7], em: [6, 8], label: 'kızarmış pirinç' },
  { key: 'balik', tier: 2, id: 'farmersdelight:fish_stew', n: [5, 7], em: [6, 8], label: 'balık güveci' },
  { key: 'salata', tier: 2, id: 'farmersdelight:mixed_salad', n: [5, 7], em: [6, 8], label: 'karışık salata' },
  { key: 'patatesdolma', tier: 2, id: 'farmersdelight:stuffed_potato', n: [5, 7], em: [6, 8], label: 'dolma patates' },
  { key: 'baget', tier: 2, id: 'bakery:baguette', n: [8, 12], em: [5, 7], label: 'baget' },
  { key: 'kruvasan', tier: 2, id: 'bakery:croissant', n: [8, 12], em: [5, 7], label: 'kruvasan' },
  { key: 'muffin', tier: 2, id: 'hearthandharvest:blueberry_muffin', n: [7, 10], em: [5, 7], label: 'yaban mersinli kek' },
  { key: 'sarap', tier: 3, id: 'vinery:red_wine', n: [3, 4], em: [11, 14], label: 'kırmızı şarap' },
  { key: 'kirazsarabi', tier: 3, id: 'vinery:cherry_wine', n: [3, 4], em: [11, 14], label: 'kiraz şarabı' },
  { key: 'elmasarabi', tier: 3, id: 'vinery:apple_wine', n: [3, 4], em: [11, 14], label: 'elma şarabı' },
  { key: 'bal', tier: 3, id: 'brewinandchewin:mead', n: [3, 4], em: [10, 12], label: 'bal şarabı' },
  { key: 'kimchi', tier: 3, id: 'brewinandchewin:kimchi', n: [5, 7], em: [9, 11], label: 'kimchi' },
  { key: 'pizza', tier: 3, id: 'brewinandchewin:pizza', n: [3, 4], em: [10, 12], label: 'pizza' },
  { key: 'ratatouille', tier: 3, id: 'farmersdelight:ratatouille', n: [5, 7], em: [10, 12], label: 'ratatuy' },
  { key: 'biftek', tier: 3, id: 'farmersdelight:steak_and_potatoes', n: [5, 7], em: [10, 12], label: 'biftek ve patates' },
  { key: 'makarna', tier: 3, id: 'farmersdelight:pasta_with_meatballs', n: [5, 7], em: [10, 12], label: 'köfteli makarna' }
,
  // hayvancılık: yumurta, süt, deri, tüy, bal, yün
  { key: 'yumurta', tier: 1, id: 'minecraft:egg', n: [24, 32], em: [2, 3], label: 'yumurta' },
  { key: 'tuy', tier: 1, id: 'minecraft:feather', n: [24, 32], em: [2, 3], label: 'tüy' },
  { key: 'deri', tier: 1, id: 'minecraft:leather', n: [12, 16], em: [2, 3], label: 'deri' },
  { key: 'yun', tier: 1, id: 'minecraft:white_wool', n: [20, 28], em: [2, 3], label: 'beyaz yün' },
  { key: 'sut', tier: 2, id: 'minecraft:milk_bucket', n: [4, 6], em: [5, 7], label: 'süt kovası' },
  { key: 'petek', tier: 2, id: 'minecraft:honeycomb', n: [10, 14], em: [5, 7], label: 'bal peteği' },
  { key: 'domuz', tier: 2, id: 'minecraft:cooked_porkchop', n: [12, 18], em: [5, 7], label: 'pişmiş domuz' },
  { key: 'balmumu', tier: 2, id: 'minecraft:honey_bottle', n: [4, 6], em: [6, 8], label: 'bal şişesi' }
]
// Mevsim siparişleri (Serene Seasons): yalnızca o mevsimde verilir, ödeme biraz yüksektir. Mevsim okunamazsa (mod yok) verilmez.
const THOR_SEASON_ORDERS = [
  { season: 'SPRING', key: 'm_tohum', tier: 1, id: 'minecraft:wheat_seeds', n: [40, 56], em: [3, 4], label: 'buğday tohumu (ilkbahar ekimi)' },
  { season: 'SPRING', key: 'm_pancar', tier: 1, id: 'minecraft:beetroot_seeds', n: [24, 32], em: [3, 4], label: 'pancar tohumu (ilkbahar ekimi)' },
  { season: 'SUMMER', key: 'm_karpuz', tier: 1, id: 'minecraft:melon_slice', n: [56, 72], em: [3, 4], label: 'karpuz dilimi (yaz bolluğu)' },
  { season: 'SUMMER', key: 'm_yaban', tier: 1, id: 'minecraft:sweet_berries', n: [40, 56], em: [3, 4], label: 'yaban mersini (yaz bolluğu)' },
  { season: 'AUTUMN', key: 'm_kabak', tier: 1, id: 'minecraft:pumpkin', n: [20, 28], em: [4, 5], label: 'kabak (hasat zamanı)' },
  { season: 'AUTUMN', key: 'm_elma', tier: 1, id: 'minecraft:apple', n: [24, 32], em: [3, 4], label: 'elma (hasat zamanı)' },
  { season: 'WINTER', key: 'm_et', tier: 2, id: 'minecraft:cooked_beef', n: [18, 24], em: [6, 8], label: 'pişmiş et (kış stoğu)' },
  { season: 'WINTER', key: 'm_ekmek', tier: 2, id: 'minecraft:bread', n: [28, 36], em: [6, 8], label: 'ekmek (kış stoğu)' }
]
THOR_SEASON_ORDERS.forEach(o => { THOR_ORDERS_EXTRA.push(o) })
const THOR_ORDER_BY_KEY = {}
THOR_ORDERS.forEach(o => { THOR_ORDER_BY_KEY[o.key] = o })
THOR_ORDERS_EXTRA.forEach(o => { THOR_ORDER_BY_KEY[o.key] = o })

// Toprak rütbesi: teslim edilen sipariş sayısına göre. İzinli sipariş türleri rütbeyle açılır.
const THOR_LAND_RANKS = [
  { name: 'Çırak', from: 0, tiers: [1] },
  { name: 'Ekinci', from: 8, tiers: [1, 2] },
  { name: 'Toprak Ustası', from: 24, tiers: [2, 3] },
  { name: 'Bereketin Bekçisi', from: 48, tiers: [3] }
]

function thorSeason(server) {
  try {
    if (!Platform.isLoaded('sereneseasons')) return ''
    var SH = Java.loadClass('sereneseasons.api.season.SeasonHelper')
    return String(SH.getSeasonState(server.overworld()).getSeason().name())
  } catch (e) {
    return ''
  }
}

const THOR_SEASON_NAMES = { SPRING: 'İlkbahar', SUMMER: 'Yaz', AUTUMN: 'Sonbahar', WINTER: 'Kış' }

function thorLandRank(p) {
  var total = Number(p.persistentData.getInt('thor_total'))
  var r = 0
  for (var i = 0; i < THOR_LAND_RANKS.length; i++) if (total >= THOR_LAND_RANKS[i].from) r = i
  return r
}

function thorRand(a, b) { return a + Math.floor(Math.random() * (b - a + 1)) }

function thorOrderActive(p) { return String(p.persistentData.getString('thor_o_key')) !== '' }

function thorOrderText(p) {
  var pd = p.persistentData
  return Number(pd.getInt('thor_o_n')) + ' ' + String(pd.getString('thor_o_label'))
}

function thorDoneToday(p) {
  var day = Math.floor(Date.now() / 86400000)
  if (Number(p.persistentData.getInt('thor_day')) !== day) {
    p.persistentData.putInt('thor_day', day)
    p.persistentData.putInt('thor_day_count', 0)
  }
  return Number(p.persistentData.getInt('thor_day_count'))
}

function thorOrderRequest(server, p, name) {
  var pd = p.persistentData
  if (thorOrderActive(p)) {
    var have = 0
    try { have = Number(p.inventory.count(String(pd.getString('thor_o_id')))) } catch (e) { have = 0 }
    if (!isNaN(have) && have >= Number(pd.getInt('thor_o_n'))) {
      thorOrderDeliver(server, p, name)
      return
    }
    thorSay(server, name, 'Önce bir öncekini bitir: ' + thorOrderText(p) + ' (elinde ' + (isNaN(have) ? 0 : have) + '). Getirmeden yenisini vermem.')
    return
  }
  if (thorDoneToday(p) >= THOR_DAILY_ORDERS) {
    thorSay(server, name, 'Bugünlük yeter. Toprak da dinlenir, sen de. Yarın gel.')
    return
  }
  var left = Number(pd.getLong('thor_next')) - Date.now()
  if (left > 0) {
    thorSay(server, name, 'Yeni bir sipariş için ' + thorFmtMins(Math.max(1, Math.ceil(left / 60000))) + ' bekle. Acele eden yolda düşer.')
    return
  }
  var lr = thorLandRank(p)
  var allowed = THOR_LAND_RANKS[lr].tiers
  var recent = String(pd.getString('thor_recent')).split(',').filter(x => x !== '')
var season = thorSeason(server)
  var seasonal = THOR_ORDERS_EXTRA.filter(o => o.season === season && allowed.indexOf(o.tier) >= 0 && Item.exists(o.id) && recent.indexOf(o.key) < 0)
  var pool = THOR_ORDERS.filter(o => allowed.indexOf(o.tier) >= 0 && Item.exists(o.id) && recent.indexOf(o.key) < 0)
  // mevsim siparişleri varsa yarı yarıya bunlardan seçilir
  if (seasonal.length > 0 && Math.random() < 0.5) pool = seasonal
  if (pool.length === 0) pool = THOR_ORDERS.filter(o => allowed.indexOf(o.tier) >= 0 && Item.exists(o.id))
  if (pool.length === 0) {
    thorSay(server, name, 'Bugün senden isteyeceğim bir şey yok.')
    return
  }
  var o = pool[Math.floor(Math.random() * pool.length)]
  var n = thorRand(o.n[0], o.n[1])
  var em = thorRand(o.em[0], o.em[1])
  pd.putString('thor_o_key', o.key)
  pd.putString('thor_o_id', o.id)
  pd.putString('thor_o_label', o.label)
  pd.putInt('thor_o_n', n)
  pd.putInt('thor_o_em', em)
  pd.putInt('thor_o_tier', o.tier)
  recent.push(o.key)
  while (recent.length > 8) recent.shift()
  pd.putString('thor_recent', recent.join(','))
  var seasonNote = o.season ? ' (' + THOR_SEASON_NAMES[o.season] + ' siparişi)' : ''
  thorSay(server, name, 'Bu sefer ' + n + ' ' + o.label + seasonNote + ' lazım. Ambar boş kalmasın. Getirdiğinde ' + em + ' zümrüt öderim; fazlasını isteme.')
  thorNote(server, name, 'Sipariş: ' + n + ' ' + o.label + ' → ' + em + ' zümrüt. Hazır olunca Thorfinn\'e tekrar tıkla.', 'gold')
}

// Thorfinn'in hikâyesi: her eşikte bir bölüm anlatır (sinema motoruyla). Teslim/nöbet/ikmal her biri sayaca bir ekler.
const THOR_STORY = {
  1: { title: 'İLK HASAT', lines: ['Bu topraklar bana bir şey öğretti: kılıç keser biçer, ama toprak besler.', 'Eskiden ben de kesip biçerdim. Şimdi sadece ekin biçiyorum.'] },
  8: { title: 'YARA', lines: ['Bir zamanlar bir adamın peşinden gittim. İntikam... o zaman her şey buydu.', 'O adam öldü, ben kaldım. Elimde hiçbir şey yoktu. Sonra bir tırmık tuttum.'] },
  16: { title: 'İKİ EL', lines: ['Kılıç tutan el ile tırmık tutan el aynı el. Fark, neye sarıldığında.', 'Kavganın bir çözüm olduğunu sanırdım. Değilmiş.'] },
  24: { title: 'DÜŞMANSIZ', lines: ['Bana bir kez sordular: düşmanın kim? Cevap veremedim. Bu yüzden buradayım.', 'Düşmanı olmayan biri, kimseyi öldürmek zorunda değildir.'] },
  36: { title: 'TOPRAĞIN SÖZÜ', lines: ['Her tohum bir söz verir: yeter ki sabret. İnsanlar da öyle.', 'Sen de bu topraklarda sabrı öğrendin. Bunu küçümseme.'] },
  48: { title: 'BEREKET', lines: ['Bir zamanlar barış için savaştığımı sandım. Sonra anladım: barış, savaşmayı bırakınca gelir.', 'Toprak seni tanıyor artık. Ben de. Bereketin bekçisi sensin.'] }
}

function thorStoryCheck(server, p, name) {
  var total = Number(p.persistentData.getInt('thor_total'))
  var ch = THOR_STORY[total]
  if (!ch) return
  var steps = [
    { t: 3.5, sound: ['minecraft:block.amethyst_block.chime', 0.8, 0.7] },
    { t: 4, title: [ch.title, 'Thorfinn anlatıyor', 'gold'] }
  ]
  var t = 6
  ch.lines.forEach(l => { steps.push({ t: t, note: ['Thorfinn: "' + l + '"', 'gold'] }); t += 3.2 })
  cinePlay(server, name, steps)
}

function thorOrderDeliver(server, p, name) {
  var pd = p.persistentData
  if (!thorOrderActive(p)) {
    thorSay(server, name, 'Teslim edecek bir siparişin yok.')
    return
  }
  var id = String(pd.getString('thor_o_id'))
  var n = Number(pd.getInt('thor_o_n'))
  var have = 0
  try { have = Number(p.inventory.count(id)) } catch (e) { have = 0 }
  if (isNaN(have) || have < n) {
    thorSay(server, name, 'Eksik. ' + n + ' ' + String(pd.getString('thor_o_label')) + ' istedim, sende ' + (isNaN(have) ? 0 : have) + ' var.')
    return
  }
  var em = Number(pd.getInt('thor_o_em'))
  var tier = Number(pd.getInt('thor_o_tier'))
  server.runCommandSilent('clear ' + name + ' ' + id + ' ' + n)
  server.runCommandSilent('give ' + name + ' minecraft:emerald ' + em)
  var extras = []
  // küçük şans: yüksek türde nadiren bir zümrüt bloğu, düşük türde kemik unu
  if (tier >= 3 && Math.random() < 0.04) {
    server.runCommandSilent('give ' + name + ' minecraft:emerald_block 1')
    extras.push('1 zümrüt bloğu')
  } else if (tier === 1 && Math.random() < 0.3) {
    server.runCommandSilent('give ' + name + ' minecraft:bone_meal 8')
    extras.push('8 kemik unu')
  } else if (tier === 2 && Math.random() < 0.25) {
    server.runCommandSilent('give ' + name + ' minecraft:golden_carrot 8')
    extras.push('8 altın havuç')
  }
  var before = thorLandRank(p)
  pd.putInt('thor_total', Number(pd.getInt('thor_total')) + 1)
  pd.putInt('thor_day_count', thorDoneToday(p) + 1)
  pd.putLong('thor_next', Date.now() + THOR_ORDER_COOLDOWN_MS)
  pd.putString('thor_o_key', '')
  var after = thorLandRank(p)
  thorSay(server, name, 'İyi mal. Toprağa saygı gösteren biri olduğun belli.')
  thorNote(server, name, 'Ödemen: ' + em + ' zümrüt' + (extras.length > 0 ? ', ' + extras.join(', ') : '') + '.', 'green')
  var steps = [{ t: 0, sound: ['minecraft:block.composter.ready', 1, 1] }, { t: 0.2, title: ['SİPARİŞ TAMAM', '+' + em + ' zümrüt', 'gold'] }]
  if (after > before) {
    steps.push({ t: 3, title: ['TOPRAK RÜTBESİ', THOR_LAND_RANKS[after].name, 'green'] })
    steps.push({ t: 3, sound: ['minecraft:ui.toast.challenge_complete', 1, 1] })
    steps.push({ t: 4.5, note: ['Thorfinn: "Toprakla geçen her mevsim insanı biraz daha sakinleştirir. Sen de yol aldın, ' + THOR_LAND_RANKS[after].name + '."', 'gold'] })
  }
  cinePlay(server, name, steps)
  thorStoryCheck(server, p, name)
}

function thorOrderInfo(server, p, name) {
  if (thorNobetActive(p)) thorNote(server, name, 'Gece nöbeti: ' + Number(p.persistentData.getInt('thor_n_have')) + '/' + Number(p.persistentData.getInt('thor_n_need')) + ' yaratık', 'dark_green')
  if (String(p.persistentData.getString('thor_i_key')) !== '') thorNote(server, name, 'Birlik ikmali: ' + Number(p.persistentData.getInt('thor_i_n')) + ' ' + String(p.persistentData.getString('thor_i_label')), 'gold')
  if (!thorOrderActive(p)) {
    thorSay(server, name, 'Şu an sana verdiğim bir sipariş yok.')
    return
  }
  var have = 0
  try { have = Number(p.inventory.count(String(p.persistentData.getString('thor_o_id')))) } catch (e) { have = 0 }
  thorNote(server, name, 'Sipariş: ' + thorOrderText(p) + ' — elinde ' + (isNaN(have) ? 0 : have) + ' — ödül ' + Number(p.persistentData.getInt('thor_o_em')) + ' zümrüt', 'gold')
}

function thorOrderAbort(server, p, name) {
  if (!thorOrderActive(p)) {
    thorSay(server, name, 'Bırakacak bir siparişin yok.')
    return
  }
  p.persistentData.putString('thor_o_key', '')
  p.persistentData.putLong('thor_next', Date.now() + 2 * THOR_ORDER_COOLDOWN_MS)
  thorSay(server, name, 'Sözünü tutamayan birine bir daha güvenmek zor. Yenisi için biraz bekle.')
}

// ------------------------------------------------------------------ Gece nöbeti (korkuluk)
// Gece canavarlar tarlayı yer. Nöbeti kabul edip geceleyin N canavar öldürürsün (dünyanın neresinde olursa). Kısa süreli, küçük ödül.
const THOR_NOBET_DAILY = 3
const THOR_NOBET_COOLDOWN_MS = 900000
const THOR_NOBET_MAX_MS = 900000

function thorIsNight(server) {
  try {
    var t = Number(server.overworld().getDayTime()) % 24000
    return t >= 13000 && t <= 23000
  } catch (e) { return false }
}

function thorNobetTargets() {
  return EG_ZOMBIES.concat(EG_SKELETONS, EG_SPIDERS, EG_CREEPERS)
}

function thorNobetActive(p) { return Number(p.persistentData.getInt('thor_n_active')) === 1 }

function thorNobetRequest(server, p, name) {
  var pd = p.persistentData
  if (thorNobetActive(p)) {
    var have = Number(pd.getInt('thor_n_have'))
    var need = Number(pd.getInt('thor_n_need'))
    if (have >= need) { thorNobetReward(server, p, name); return }
    thorSay(server, name, 'Nöbet sürüyor: ' + have + '/' + need + ' yaratık. Bitirmeden gelme.')
    return
  }
  var day = Math.floor(Date.now() / 86400000)
  if (Number(pd.getInt('thor_n_day')) !== day) { pd.putInt('thor_n_day', day); pd.putInt('thor_n_day_count', 0) }
  if (Number(pd.getInt('thor_n_day_count')) >= THOR_NOBET_DAILY) {
    thorSay(server, name, 'Bugün yeterince nöbet tuttun. Uyku da bir görevdir.')
    return
  }
  var left = Number(pd.getLong('thor_n_next')) - Date.now()
  if (left > 0) {
    thorSay(server, name, 'Yorgunsun. ' + thorFmtMins(Math.max(1, Math.ceil(left / 60000))) + ' sonra gel.')
    return
  }
  if (!thorIsNight(server)) {
    thorSay(server, name, 'Nöbet geceye aittir. Karanlık çökünce gel; gündüz canavarlar tarlaya yaklaşmaz.')
    return
  }
  var lr = thorLandRank(p)
  var need2 = 12 + lr * 2
  pd.putInt('thor_n_active', 1)
  pd.putInt('thor_n_have', 0)
  pd.putInt('thor_n_need', need2)
  pd.putLong('thor_n_start', Date.now())
  thorSay(server, name, 'Karanlık tarlamı yiyor. Gece boyunca ' + need2 + ' yaratığı geri püskürt; zombi, iskelet, örümcek, creeper. Şafak sökmeden ve yorulmadan.')
  thorNote(server, name, 'Nöbet: ' + need2 + ' gece yaratığı öldür. Bitince Thorfinn\'e dön.', 'gold')
  cinePlay(server, name, [{ t: 0, sound: ['minecraft:entity.wolf.howl', 0.7, 0.8] }, { t: 0.3, title: ['GECE NÖBETİ', 'Tarlayı koru', 'dark_green'] }])
}

function thorNobetReward(server, p, name) {
  var pd = p.persistentData
  var em = 3 + thorLandRank(p)
  server.runCommandSilent('give ' + name + ' minecraft:emerald ' + em)
  pd.putInt('thor_n_active', 0)
  pd.putInt('thor_n_day_count', Number(pd.getInt('thor_n_day_count')) + 1)
  pd.putLong('thor_n_next', Date.now() + THOR_NOBET_COOLDOWN_MS)
  pd.putInt('thor_total', Number(pd.getInt('thor_total')) + 1)
  thorSay(server, name, 'Tarla sağ. Sabaha kadar nöbet tuttun; bu sana yakışır.')
  thorNote(server, name, 'Ödemen: ' + em + ' zümrüt.', 'green')
  cinePlay(server, name, [{ t: 0, sound: ['minecraft:block.composter.ready', 1, 1] }, { t: 0.2, title: ['NÖBET BİTTİ', '+' + em + ' zümrüt', 'gold'] }])
  thorStoryCheck(server, p, name)
}

function thorNobetTick(server) {
  server.players.forEach(p => {
    try {
      if (!thorNobetActive(p)) return
      var pd = p.persistentData
      var elapsed = Date.now() - Number(pd.getLong('thor_n_start'))
      if (elapsed > THOR_NOBET_MAX_MS || (elapsed > 180000 && !thorIsNight(server) && Number(pd.getInt('thor_n_have')) < Number(pd.getInt('thor_n_need')))) {
        pd.putInt('thor_n_active', 0)
        pd.putLong('thor_n_next', Date.now() + THOR_NOBET_COOLDOWN_MS)
        thorNote(server, String(p.username), 'Nöbet sona erdi: şafak söktü ya da süre doldu. Thorfinn yorulduğunu söyler.', 'gray')
      }
    } catch (e) { }
  })
}

EntityEvents.death(event => {
  try {
    var src = event.source.actual
    if (!src || !src.isPlayer()) return
    if (!thorNobetActive(src)) return
    var pd = src.persistentData
    if (Number(pd.getInt('thor_n_have')) >= Number(pd.getInt('thor_n_need'))) return
    if (!thorIsNight(src.server)) return
    if (thorNobetTargets().indexOf(String(event.entity.type)) < 0) return
    var have = Number(pd.getInt('thor_n_have')) + 1
    pd.putInt('thor_n_have', have)
    var name = String(src.username)
    if (have >= Number(pd.getInt('thor_n_need'))) {
      thorNote(src.server, name, 'Nöbet tamam! Thorfinn\'e dön.', 'gold')
      src.server.runCommandSilent('playsound minecraft:block.note_block.chime master ' + name + ' ~ ~ ~ 1 1.5')
    } else {
      src.server.runCommandSilent('title ' + name + ' actionbar {"text":"Nöbet: ' + have + '/' + Number(pd.getInt('thor_n_need')) + '","color":"dark_green"}')
    }
  } catch (e) {
    console.error('thorfinn nobet sayaci hata: ' + e)
  }
})

// ------------------------------------------------------------------ Birlik ikmali (Erwin'in birliği için yemek)
// Keşif Birliği için toplu yemek siparişi. Erwin'de en az Kan Yeminli olmalısın; günde bir kez. Ödül tek sipariştekinden yüksektir.
const THOR_IKMAL = [
  { key: 'i_et', id: 'minecraft:cooked_beef', n: [24, 32], label: 'pişmiş et' },
  { key: 'i_ekmek', id: 'minecraft:bread', n: [32, 40], label: 'ekmek' },
  { key: 'i_gu', id: 'farmersdelight:beef_stew', n: [12, 16], label: 'sığır güveci' },
  { key: 'i_corba', id: 'farmersdelight:vegetable_soup', n: [12, 16], label: 'sebze çorbası' },
  { key: 'i_domuz', id: 'minecraft:cooked_porkchop', n: [24, 32], label: 'pişmiş domuz' }
]

function thorIkmalRequest(server, p, name) {
  var pd = p.persistentData
  if (erwinRank(p) < 2) {
    thorSay(server, name, 'Birliğin ikmali yalnızca yeminini kanla mühürlemiş olanlara emanet edilir. Erwin\'in yanında Kan Yeminli ol.')
    return
  }
  if (String(pd.getString('thor_i_key')) !== '') {
    var id = String(pd.getString('thor_i_id'))
    var n = Number(pd.getInt('thor_i_n'))
    var have = 0
    try { have = Number(p.inventory.count(id)) } catch (e) { have = 0 }
    if (!isNaN(have) && have >= n) {
      var em = Number(pd.getInt('thor_i_em'))
      server.runCommandSilent('clear ' + name + ' ' + id + ' ' + n)
      server.runCommandSilent('give ' + name + ' minecraft:emerald ' + em)
      pd.putString('thor_i_key', '')
      pd.putInt('thor_i_total', Number(pd.getInt('thor_i_total')) + 1)
      pd.putInt('thor_total', Number(pd.getInt('thor_total')) + 1)
      pd.putInt('thor_i_day', Math.floor(Date.now() / 86400000))
      thorSay(server, name, 'Birlik bu akşam tok yatacak. Erwin\'e selamımı söyle.')
      thorNote(server, name, 'Ödemen: ' + em + ' zümrüt.', 'green')
      cinePlay(server, name, [{ t: 0, sound: ['minecraft:entity.villager.celebrate', 1, 1] }, { t: 0.2, title: ['İKMAL TAMAM', '+' + em + ' zümrüt', 'gold'] }])
      thorStoryCheck(server, p, name)
      return
    }
    thorSay(server, name, 'İkmal bekliyor: ' + n + ' ' + String(pd.getString('thor_i_label')) + ' (sende ' + (isNaN(have) ? 0 : have) + ').')
    return
  }
  if (Number(pd.getInt('thor_i_day')) === Math.floor(Date.now() / 86400000)) {
    thorSay(server, name, 'Bugünkü ikmali zaten teslim ettin. Birlik yarına kadar idare eder.')
    return
  }
  var pool = THOR_IKMAL.filter(o => Item.exists(o.id))
  if (pool.length === 0) { thorSay(server, name, 'Şu an ikmal listesi boş.'); return }
  var o = pool[Math.floor(Math.random() * pool.length)]
  var n2 = thorRand(o.n[0], o.n[1])
  var em2 = thorRand(8, 11)
  pd.putString('thor_i_key', o.key)
  pd.putString('thor_i_id', o.id)
  pd.putString('thor_i_label', o.label)
  pd.putInt('thor_i_n', n2)
  pd.putInt('thor_i_em', em2)
  thorSay(server, name, 'Keşif Birliği sefere çıkıyor. ' + n2 + ' ' + o.label + ' istiyorlar. Erwin iyi öder; ben adil öderim: ' + em2 + ' zümrüt.')
  thorNote(server, name, 'İkmal: ' + n2 + ' ' + o.label + ' → ' + em2 + ' zümrüt (günde bir). Hazır olunca Thorfinn\'e tekrar tıkla ("Birlik ikmali").', 'gold')
}

function thorStat(server, p, name) {
  var lr = thorLandRank(p)
  var pd = p.persistentData
  var nxt = lr + 1 < THOR_LAND_RANKS.length ? ' — sonraki rütbe için ' + (THOR_LAND_RANKS[lr + 1].from - Number(pd.getInt('thor_total'))) + ' teslim' : ' — en yüksek rütbe'
  thorNote(server, name, 'Toprak rütben: ' + THOR_LAND_RANKS[lr].name + ' · teslim edilen sipariş ' + Number(pd.getInt('thor_total')) + nxt, 'gold')
  thorNote(server, name, 'Bugün ' + thorDoneToday(p) + '/' + THOR_DAILY_ORDERS + ' sipariş. Birlik rütben: ' + ERWIN_RANK_NAMES[erwinRank(p)] + '.', 'gray')
}

// ------------------------------------------------------------------ Etiket işleme
var thorPhase = 0
const THOR_TAGS = ['thor_shop', 'thor_ord', 'thor_info', 'thor_abort', 'thor_stok', 'thor_kayit', 'thor_nobet', 'thor_ikmal']

ServerEvents.tick(event => {
  var server = event.server
  thorPhase++
  if (thorPhase % 10 !== 0) return
  thorShopSync(server, false)
  thorNobetTick(server)
  server.players.forEach(p => {
    try {
      var name = String(p.username)
      for (var i = 0; i < THOR_TAGS.length; i++) {
        var tg = THOR_TAGS[i]
        if (!thorHas(p, tg)) continue
        server.runCommandSilent('tag ' + name + ' remove ' + tg)
        if (tg === 'thor_shop') thorShopOpen(server, p, name)
        else if (tg === 'thor_ord') thorOrderRequest(server, p, name)
        else if (tg === 'thor_info') thorOrderInfo(server, p, name)
        else if (tg === 'thor_abort') thorOrderAbort(server, p, name)
        else if (tg === 'thor_stok') thorStockInfo(server, p, name)
        else if (tg === 'thor_kayit') thorStat(server, p, name)
        else if (tg === 'thor_nobet') thorNobetRequest(server, p, name)
        else if (tg === 'thor_ikmal') thorIkmalRequest(server, p, name)
      }
    } catch (e) {
      console.error('thorfinn hata: ' + e)
    }
  })
})

// ------------------------------------------------------------------ Yönetici: /thorfinn_sifirla <oyuncu>
ServerEvents.commandRegistry(event => {
  const { commands: Commands, arguments: Arguments } = event
  event.register(Commands.literal('thorfinn_sifirla').requires(s => s.hasPermission(2)).then(Commands.argument('oyuncu', Arguments.PLAYER.create(event)).executes(ctx => {
    var p = Arguments.PLAYER.getResult(ctx, 'oyuncu')
    var pd = p.persistentData
    var name = String(p.username)
    ;['thor_total', 'thor_day', 'thor_day_count', 'thor_o_n', 'thor_o_em', 'thor_o_tier', 'thor_n_active', 'thor_n_have', 'thor_n_need', 'thor_n_day', 'thor_n_day_count', 'thor_i_n', 'thor_i_em', 'thor_i_day', 'thor_i_total'].forEach(k => pd.putInt(k, 0))
    ;['thor_o_key', 'thor_o_id', 'thor_o_label', 'thor_recent', 'thor_i_key', 'thor_i_id', 'thor_i_label'].forEach(k => pd.putString(k, ''))
    pd.putLong('thor_next', 0)
    pd.putLong('thor_n_next', 0)
    thorShopResetStock(p)
    ctx.source.server.runCommandSilent('tag ' + name + ' remove thor_met')
    ctx.source.sendSuccess(Text.of(name + ' için Thorfinn ilerlemesi sıfırlandı.'), false)
    return 1
  })))
})
