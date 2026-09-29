# Kenpachi

*(Sistem VDS'te kurulu, gerçek oyunda test edilmedi. Şimdilik yalnızca küçümser; ileride görev eklenecek.)*

- **Tür:** İnsan (easy_npc:humanoid, klasik kol). Etiketleri: `korunan`, `kenpachi_npc`.
- **Konum:** -629.5, 68, -437.5 (Drondra Krallığı, Kral Vargoth'un yanı)
- **Krallık:** [Drondra](../kingdoms/drondra.md)
- **Görevi:** Drondra Kralı'nı koruyan; fiziksel kuvvetin ve ham gücün simgesi. Kimseyi kendine denk görmez.
- **Konsept:** Bleach'teki Kenpachi Zaraki'den ilham alınmıştır: savaş düşkünü, kaba, güçle hava atan, zayıfları küçümseyen.
- **İlişkiler:** Kral Vargoth'un koruyucusu.

## Skin / Texture

<img src="../../../assets/npc-skins/kenpachi_v1.png" alt="kenpachi_v1.png" width="256">

- **Dosya:** [`assets/npc-skins/kenpachi_v1.png`](../../../assets/npc-skins/kenpachi_v1.png) (64×64, insan, klasik kol). swxff'in verdiği doku eski 64×32 biçimindeydi; vanilla'nın eski-doku dönüşümüyle 64×64'e çevrildi.
- **Oyunda:** `SkinData` `SECURE_REMOTE_URL` ile bu dosyanın GitHub ham adresine bağlı. Kurallar: [assets.md](../../assets.md).

## Diyalog

Şimdilik tek menü, oyuncuyu ezmek üzerine kurulu. Diyalog düğmeleri yalnızca etiket verir, yanıtlar `kubejs/server_scripts/kenpachi.js`'te rastgele seçilir.

| Düğme | Etiket | Yanıt |
|---|---|---|
| Kralla görüşmek istiyorum | `kenpachi_kral` | 4 küçümseyici yanıttan biri |
| Kimsin sen? | `kenpachi_kim` | 3 tanıtımdan biri |
| Seninle dövüşmek istiyorum | `kenpachi_dovus` | **Reiatsu sahnesi**: ekran kararır, kalp atışı sesi, kırmızı parçacıklar, "REİATSU" başlığı, 3 sn yavaşlama ve bir küçümseme. Hasar yoktur |

## Teknik

- NPC: `node tools/yoruichi/gen_kenpachi.js <datapack> <owner-uuid>`, sonra sunucuda `reload` ve `function yoruichi:kenpachi_kur` (yükü çözmek için geçici `forceload`; Owner ve izin seviyesi doğurma anında NBT'ye yazılır). Yalnızca diyalog yenilemek için `KENPACHI_UUID=<npc-uuid>` verip `kenpachi_diyalog` fonksiyonunu kullan.
- İlk kurulumda Owner/izin seviyesi ayrı komutla yazıldığı için yüklenmemiş yığında kaybolmuştu; elle düzeltildi ve üretici artık bunları doğurma NBT'sine koyuyor.
