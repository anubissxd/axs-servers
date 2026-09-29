# Itachi (Amaterasu ve Tsukiyomi öğretmeni)

*(Sistem hazır ve VDS'te; NPC henüz oyunda yok. Skin ve konum bekleniyor.)*

- **Tür:** İnsan (easy_npc:humanoid; kol tipi skin'e göre)
- **Öğrettiği büyüler:** Amaterasu (`kubejs:amaterasu`, 3 seviye), Tsukiyomi (`kubejs:tsukiyomi`, 3 seviye); bkz. `kubejs/startup_scripts/amaterasu_spell.js`, `tsukiyomi_spell.js`
- **Krallık:** Tarafsız
- **Konum:** *belirlenecek*
- **Skin dosyası:** `assets/npc-skins/itachi_v1.png` (bkz. [assets.md](../../assets.md))
- **Neden Itachi (ikisi de):** Amaterasu ve Tsukiyomi onun imza teknikleridir. İki büyü tek NPC'de olur ama **iki ayrı eğitim yolu** vardır.

## Şart

- **Amaterasu:** `rank_maceraci` ve Erwin'de **Gece Avcısı** ([Keşif Birliği](erwin-smith.md)).
- **Tsukiyomi:** Amaterasu'nun 3 seviyesi tamam ve Erwin'de **Eşik Muhafızı**.

## Eğitim

Ücret zümrüt bloğu. Her seviye sırayla açılır; ücret seviye başına bir kez alınır. Kayıp parşömen: en yüksek öğrenilen seviyenin ücretinin yarısı.

| Yol | Sınav | Ücret |
|---|---|---|
| Amaterasu L1 Kara Alevin Doğuşu | 14 Nether askeri | 6 |
| Amaterasu L2 Sönmeyen Ateş | 14 kale nöbetçisi (blaze, wither iskeleti, ghast) | 10 |
| Amaterasu L3 Yakılan Ruhlar | 8 kadim varlık (mezarlık elit, yıkıntı bekçisi) | 16 |
| Tsukiyomi L1 Sahte Gerçek (sahne) | 5 yanılsama: 1 gerçek (durağan), 4 sahte (sürekli yer değiştirir). Gerçeği öldür; sahteye vurursan körlük. 2 dk | 8 |
| Tsukiyomi L2 Aynaların Ardı | 8 büyücü (Iron's kült, evoker, illusioner) | 14 |
| Tsukiyomi L3 Sonsuz Gece | 1 gece hükümdarı (Cataclysm/BoMD/Mowzie/Iron's boss) | 22 |

Toplam: Amaterasu 32, Tsukiyomi 44 zümrüt bloğu.

**Sahneli sınav:** Tsukiyomi L1'de 5 "Yanılsama" doğar: biri gerçek (12 canlı, yerinden kıpırdamaz), dördü sahte (1 canlı, yarım saniyede bir biri yer değiştirir). Sahteyi vurunca oyuncuya 4 sn körlük + yavaşlık gelir ve 3 sn sonra yenisi doğar. Gerçek olan ölünce sınav geçilir. Süre dolarsa ya da başkası öldürürse hocadan ücretsiz yeniden başlatılır.

**Hoca bağı:** Itachi'den öğrenilen toplam seviyeye göre Yabancı → Tanıdık (1+) → Öğrenci (3+) → Usta Öğrenci (6). Bağa uygun sözler ve kayıp parşömen indirimi (Öğrenci %25, Usta Öğrenci yarı yarıya).

## Teknik

- Mantık: `kubejs/server_scripts/hocalar_egitim.js` (Kakashi ile aynı dosya, aynı sistem).
- Diyalog düğmeleri `hoca_req_amaterasu`, `hoca_req_tsukiyomi`, `hoca_rep_itachi`, `hoca_info`, `hoca_lost_amaterasu`, `hoca_lost_tsukiyomi` etiketleri verir.
- NPC kurulumu: `node tools/yoruichi/gen_hocalar.js itachi <datapack> <owner-uuid> <x> <y> <z> <yaw> [skin] [slim]`, sonra `reload` ve `function yoruichi:itachi_kur`.
- Yönetici: `/hoca_sifirla <oyuncu>`.

## Diyaloglar

- **Rütbesiz (`hoca_ret`):** "Boşuna geldin. Bu bilgi herkese emanet edilmez. Önce Maceracı olarak adını duyur."
- **İlk konuşma (`hoca_ilk`):** kendini tanıtır, iki büyüyü ve rütbe şartlarını anlatır.
- **Ana diyalog (`hoca_hub`):** Amaterasu / Tsukiyomi öğrenmek istiyorum, sınavı bildiriyorum, eğitim durumum, iki parşömen için "kaybettim", ayrıl.
