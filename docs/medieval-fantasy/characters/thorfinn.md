# Thorfinn (eski Çiftçi Tobias)

*(Aynı NPC, aynı konum; ad, görünüm ve iş değişti. Sistem VDS'te kurulu, gerçek oyunda test edilmedi.)*

- **Tür:** İnsan (easy_npc:humanoid, klasik kol). UUID `1e6fe9d9-ae31-4abf-8b86-0bcc093b2413`, etiketleri `korunan`, `thorfinn_npc`.
- **Konum:** -979.5, 68, -371.5 (spawn)
- **Krallık:** [Caddy](../kingdoms/caddy.md)
- **Görevi:** Sunucudaki **bütün ticaret** onun elindedir: mal satışı (Birlik ambarı) ve hasat siparişleri.
- **İlişkiler:** Çamur'un adamı. Erwin'in rütbelerini tanır ve mal açarken onlara bakar; Erwin ambarı sorulunca ona yönlendirir.
- **Konsept:** Vinland Saga'daki Thorfinn'den ilham alınmıştır. Eski bir savaşçı, şimdi çiftçi; sakin, yorgun ve dürüst. Kolay kazanılan şeye güvenmez.

## Skin / Texture

<img src="../../../assets/npc-skins/thorfinn_v1.png" alt="thorfinn_v1.png" width="256">

- **Dosya:** [`assets/npc-skins/thorfinn_v1.png`](../../../assets/npc-skins/thorfinn_v1.png) (64×64, insan, klasik kol); swxff ekledi.
- **Oyunda:** `SkinData` `SECURE_REMOTE_URL` ile bu dosyanın GitHub ham adresine bağlı. Kurallar: [assets.md](../../assets.md).

## Ticaret kuralları (bilinçli olarak sert)

- **Bir şey SATIN alırken bedel ZÜMRÜT** (zümrüt bloğu değil). Zümrüt bloğu yalnızca ders/eğitim ücretidir (Yoruichi, Kakashi, Itachi). Tek ayrım budur.
- Mallar Keşif Birliği rütbesine göre açılır (Kül Bekçisi ve üstü). Stok **az ve kişiye özeldir** (her maldan en çok 1 adet), yenilenme süresi uzundur (8 saatten 8 güne kadar).
- Zümrüt kazanmanın iki yolu vardır: Erwin'in seferleri (asıl kaynak, ödül bozuk zümrüttür) ve Thorfinn'in hasat siparişleri (küçük, emek isteyen kaynak).

### Dükkân (Easy NPC ticaret ekranı)

Fiyat zümrüt olarak; 64'ün üstü iki takas yuvasına bölünür. Kalan stok oyuncu başına tutulur (`thor_shop_*`), tembel yenilenir. Ekran her açılışta oyuncunun rütbesine ve stoğuna göre kurulur (`npc.setTradingOffers`), alımlar (`uses`) her 10 tickte okunup kişisel stoktan düşülür. Tek NPC'ye bağlı olduğundan aynı anda tek oyuncu açabilir.

| Rütbe | Mal | Fiyat (zümrüt) | Stok / yenilenme |
|---|---|---|---|
| Kül Bekçisi | 8 altın havuç | 8 | 1 / 8 sa |
| Kül Bekçisi | 32 ok | 6 | 1 / 8 sa |
| Kül Bekçisi | 16 pişmiş et | 6 | 1 / 8 sa |
| Kül Bekçisi | 4 tecrübe şişesi | 12 | 1 / 12 sa |
| Kan Yeminli | 1 altın elma | 24 | 1 / 24 sa |
| Kan Yeminli | 2 ender incisi | 32 | 1 / 24 sa |
| Kan Yeminli | 12 tecrübe şişesi | 40 | 1 / 24 sa |
| Gece Avcısı | 1 elmas | 40 | 1 / 48 sa |
| Gece Avcısı | 1 netherite parçası | 96 | 1 / 96 sa |
| Gece Avcısı | 1 ölümsüzlük totemi | 128 | 1 / 144 sa |
| Eşik Muhafızı | 32 tecrübe şişesi | 96 | 1 / 48 sa |
| Eşik Muhafızı | 1 netherite parçası | 80 | 1 / 96 sa |
| Eşik Muhafızı | 1 büyülü altın elma | 128 | 1 / 192 sa |

Tablo `THOR_SHOP` (`thorfinn_ticaret.js`) ile aynıdır. Fiyatlar 1-128 zümrüt arasında olmalıdır (iki yuva sınırı).

### Hasat siparişleri

Thorfinn belirli mal ister; teslimde zümrüt öder. Bir seferde tek sipariş, günde 4, siparişler arası 3 dakika, bırakılırsa ceza beklemesi. Son 8 sipariş tekrar etmez.

| Toprak rütbesi | Açılış (teslim) | Sipariş türleri | Örnek ödül |
|---|---|---|---|
| Çırak | 0 | Ham mahsul (buğday, havuç, patates, domates, soğan, pirinç, çilek...) | 3-5 zümrüt |
| Ekinci | 8 | + Pişmiş yemek (güveçler, çorbalar, ekmek, baget...) | 7-10 zümrüt |
| Toprak Ustası | 24 | Yemek + şarap ve ziyafet (şaraplar, bal şarabı, kimchi, ratatuy...) | 12-18 zümrüt |
| Bereketin Bekçisi | 48 | Yalnızca şarap ve ziyafet | 12-18 zümrüt (+%6 ile 1 zümrüt bloğu) |

Mod eşyaları (Farmer's Delight, Bakery, Vinery, Brewin' and Chewin', Hearth and Harvest) `Item.exists` ile doğrulanır; olmayan sipariş havuzdan düşer. Küçük ekstralar: Tür 1'de %30 kemik unu, Tür 2'de %25 altın havuç, Tür 3'te %6 zümrüt bloğu.

## Diyalog ve etiketler

Yönlendirme `ON_INTERACTION` komutlarındadır: `thor_met` yoksa `thor_ilk` (tanışma), varsa `thor_hub`. Düğmeler yalnızca etiket verir, mantık `thorfinn_ticaret.js`'te. Easy NPC bir diyalogda en fazla 6 düğmeyi düzgün dizer; ana menü 4, alt menü 5 düğme.

| Düğme | Etiket |
|---|---|
| Ticaret | `thor_shop` |
| Hasat siparişi (iste / teslim et) | `thor_ord` |
| Siparişim nasıl? | `thor_info` |
| Siparişi bırakıyorum | `thor_abort` |
| Stok durumu | `thor_stok` |
| Toprak kaydım | `thor_kayit` |

## Yönetim

- `/thorfinn_sifirla <oyuncu>`: sipariş, toprak rütbesi, stok ve `thor_met` sıfırlanır.
- `/erwin_rutbe <oyuncu> <0-4>`: Birlik rütbesini ayarlar ve Thorfinn stoğunu yeniler (test).
- NPC yenileme: `node tools/yoruichi/gen_thorfinn.js <datapack> <owner-uuid>`, sonra sunucuda `reload` ve `function yoruichi:thorfinn_diyalog`.
- Oyuncu verisi (`thor_*`) `oyuncu_yedek.js` ile ölüm/giriş kayıplarına karşı yedeklenir.
