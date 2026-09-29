# Erwin Smith

*(Önceki adı: Şövalye Aldric. Aynı NPC, aynı konum ve işlev; ad ve görünüm değişti.)*

- **Tür:** İnsan (easy_npc:humanoid, klasik kol)
- **Konum:** -988.5, 68, -371.5 (spawn)
- **Krallık:** [Caddy](../kingdoms/caddy.md) (tarafsız, hiçbir krallığa bağlı değil)
- **Görevi:** Keşif Birliği komutanı. Maceracı rütbeli oyunculara tekrarlanmayan, kademeli zorlaşan **öldürme seferleri** verir (aşağıda). Aldric'ten kalan ticaret ("Tedarik" düğmesi) duruyor.
- **Görünüş:** Attack on Titan'daki Erwin Smith (sarı saç, Survey Corps yeşil pelerini)
- **İlişkiler:** Çamur'un adamı

## Skin / Texture

<img src="../../../assets/npc-skins/erwin_v1.png" alt="erwin_v1.png" width="256">

- **Dosya:** [`assets/npc-skins/erwin_v1.png`](../../../assets/npc-skins/erwin_v1.png) (64×64, insan, klasik kol)
- **Oyunda:** `SkinData` `SECURE_REMOTE_URL` ile bu dosyanın GitHub ham adresine bağlı, skin UUID'si adresin `UUID.nameUUIDFromBytes` sonucu (bkz. [assets.md](../../../docs/assets.md)).

## Hikâye

## Sefer Sistemi (Keşif Birliği)

**Şart:** `rank_maceraci`. Rütbesizlere Erwin reddeder (`erwin_ret`).

**Akış:** "Sefer istiyorum" → Erwin rütbeye uygun **3 sefer teklif eder** (sohbette tıklanır: [A] [B] [C]) → oyuncu seçer, hedefi öldürür (eylem çubuğunda sayaç) → "Rapor veriyorum" → ödül. Aynı anda tek sefer; sefer sonrası 2 dk, bırakınca 5 dk bekleme; günde en çok 10 sefer. Son 4 sefer teklifte tekrarlanmaz; teklifler 10 dk geçerli. Hedef sayısı her tekliflenişte aralıktan rastgele seçilir.

**Rütbeler (terfi):** Acemi → Er (3 Devriye) → Onbaşı (4 Sefer) → Çavuş (4 Derin Sefer) → Birlik Kaptanı (3 Ölümcül Sefer). Rütbe `erwin_rank_1..4` etiketidir; Erwin'in ana diyaloğu rütbeye göre değişir.

| Tür | Kim görür | Hedefler | Ödül (zümrüt bloğu) |
|---|---|---|---|
| I Devriye | Acemi, Er | zombi, iskelet, örümcek, creeper, boğulmuş, slime (8-30 adet) | 1-2 |
| II Sefer | Er, Onbaşı | yağmacı, enderman, mezarlık, derin karanlık, kaos, cadı, Nether askeri, büyücü, düşmüş şövalye (4-16) | 2-4 |
| III Derin Sefer | Onbaşı, Çavuş | ravager, kale, mutant, kadim yaratıklar, orman ruhu, yıkıntı bekçisi (1-16) | 4-7 |
| IV Ölümcül | Çavuş, Kaptan | tek boss: Cataclysm, BoMD, Mowzie, Iron's, Souls | 8-14 |
| V Efsane | Kaptan | ejderha, Leviathan/Scylla, Wither, Warden, Ender Ejderhası | 16-24 |

Her ödüle şansa bağlı ekstra ganimet (altın elma, elmas, tecrübe, mürekkep; IV-V'te netherite/totem) eklenir; **%5 büyük zafer** blok ödülünü ikiye katlar. Ekonomi: Yoruichi'nin eğitimi toplam 19 blok; bir Tür I seferi ortalama 1,5 blok.

**Teknik:** mantık `kubejs/server_scripts/erwin_seferleri.js` (şablonlar, teklif, sayaç, ödül, terfi; durum oyuncunun `persistentData`'sında `erwin_*`). Diyalog düğmeleri `erwin_req/rep/info/stat/abort` etiketi verir, script alır. Diyalogları `tools/yoruichi/gen_erwin.js` üretir (datapack fonksiyonu `yoruichi:erwin_setup`, konsoldan çalıştırılır). Yönetici komutu: `/erwin_sifirla <oyuncu>` tüm ilerlemeyi sıfırlar. Hedef kimlikleri sunucu kayıt defterinden doğrulandı; yeni mod eklenirse şablonlara elle eklenir.

**Açık:** oyunda uçtan uca test edilmedi (swxff çevrimdışıydı); ödül dengesi oyuncu geri bildirimine göre ayarlanır.

## Diyaloglar

Ana diyaloglar (`erwin_ret`, `erwin_ilk`, `erwin_hub_0..4`) `gen_erwin.js` içindedir; teklif/ödül/terfi konuşmaları script'te (Erwin'in sohbet mesajları).
