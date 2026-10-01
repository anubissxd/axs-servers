# Itachi (Amaterasu ve Tsukiyomi öğretmeni)

*(Sistem ve NPC VDS'te kurulu; gerçek oyunda test edilmedi.)*

- **Tür:** İnsan (easy_npc:humanoid; kol tipi skin'e göre)
- **Öğrettiği büyüler:** Amaterasu (`kubejs:amaterasu`, 3 seviye), Tsukiyomi (`kubejs:tsukiyomi`, 3 seviye); bkz. `kubejs/startup_scripts/amaterasu_spell.js`, `tsukiyomi_spell.js`
- **Krallık:** Tarafsız
- **Konum:** -805.5, 72, -475.5 (yön: güney; oyuncuya bakar)
- **Skin dosyası:** `assets/npc-skins/itachi_v1.png` (bkz. [assets.md](../../assets.md))
- **Neden Itachi (ikisi de):** Amaterasu ve Tsukiyomi onun imza teknikleridir. İki büyü tek NPC'de olur ama **iki ayrı eğitim yolu** vardır.

## Şart

- **Amaterasu:** `rank_maceraci` ve Erwin'de **Gece Avcısı** ([Keşif Birliği](erwin-smith.md)).
- **Tsukiyomi:** Amaterasu'nun 3 seviyesi tamam ve Erwin'de **Eşik Muhafızı**.

## Eğitim

Ücret zümrüt bloğu. Her seviye sırayla açılır; ücret seviye başına bir kez alınır. Kayıp parşömen: en yüksek öğrenilen seviyenin ücretinin yarısı.

| Yol | Sınav | Ücret |
|---|---|---|
| Amaterasu L1 Kara Alevin Doğuşu | 14 Nether askeri | 7 |
| Amaterasu L2 Sönmeyen Ateş | 14 kale nöbetçisi (blaze, wither iskeleti, ghast) | 12 |
| Amaterasu L3 Yakılan Ruhlar | 8 kadim varlık (mezarlık elit, yıkıntı bekçisi) | 18 |
| Tsukiyomi L1 Sahte Gerçek (sahne) | 5 yanılsama: 1 gerçek (durağan), 4 sahte (sürekli yer değiştirir). Gerçeği öldür; sahteye vurursan körlük. 2 dk | 9 |
| Tsukiyomi L2 Aynaların Ardı | 8 büyücü (Iron's kült, evoker, illusioner) | 16 |
| Tsukiyomi L3 Sonsuz Gece | 1 gece hükümdarı (Cataclysm/BoMD/Mowzie/Iron's boss) | 25 |

Toplam: Amaterasu 37, Tsukiyomi 50 zümrüt bloğu.

**Sahneli sınav:** Tsukiyomi L1'de 5 "Yanılsama" doğar: biri gerçek (12 canlı, yerinden kıpırdamaz), dördü sahte (1 canlı, yarım saniyede bir biri yer değiştirir). Sahteyi vurunca oyuncuya 4 sn körlük + yavaşlık gelir ve 3 sn sonra yenisi doğar. Gerçek olan ölünce sınav geçilir. Süre dolarsa ya da başkası öldürürse hocadan ücretsiz yeniden başlatılır.

**Sinema:** Her sınav açılışı temalıdır: Amaterasu'da kara alev sesi, ruh ateşi parçacıkları ve kararma; Tsukiyomi'de enderman bakışı sesi, portal parçacıkları ve uzun kararma. Seviye başlıkları ("KARA ALEVİN DOĞUŞU", "SÖNMEYEN ATEŞ", "YAKILAN RUHLAR", "SAHTE GERÇEK", "AYNALARIN ARDI", "SONSUZ GECE"), Itachi'nin anlatısı, sınav talimatı; rapor verince parşömen töreni ve son seviyede "USTALIK" sahnesi. Yarı yolda kısa bir söz. Sinema sürerken yeni istek bekletilir.

**Karga sahneleri:** Itachi'nin her sınav açılışında oyuncunun etrafında 5 "Karga" (yarasa) belirir, kanat sesi ve duman parçacıklarıyla 8 saniye sonra silinir; ustalık kapanışında da tekrar oynar.

**Hoca bağı:** Itachi'den öğrenilen toplam seviyeye göre Yabancı → Tanıdık (1+) → Öğrenci (3+) → Usta Öğrenci (6). Bağa uygun sözler ve kayıp parşömen indirimi; Usta Öğrenci olununca (Amaterasu ve Tsukiyomi tamam) Itachi bir kez kozmetik hediye verir: "Gece Pelerini" (koyu deri göğüslük, kırılmaz). İndirim (Öğrenci %25, Usta Öğrenci yarı yarıya).

## Teknik

- Mantık: `kubejs/server_scripts/hocalar_egitim.js` (Kakashi ile aynı dosya, aynı sistem).
- Diyalog düğmeleri `hoca_req_amaterasu`, `hoca_req_tsukiyomi`, `hoca_rep_itachi`, `hoca_info`, `hoca_lost_amaterasu`, `hoca_lost_tsukiyomi` etiketleri verir.
- NPC kurulumu: `node tools/yoruichi/gen_hocalar.js itachi <datapack> <owner-uuid> <x> <y> <z> <yaw> [skin] [slim]`, sonra `reload` ve `function yoruichi:itachi_kur`.
- Yönetici: `/hoca_sifirla <oyuncu>`.

## Diyaloglar

- **Rütbesiz (`hoca_ret`):** "Boşuna geldin. Bu bilgi herkese emanet edilmez. Önce Maceracı olarak adını duyur."
- **İlk konuşma (`hoca_ilk`):** kendini tanıtır, iki büyüyü ve rütbe şartlarını anlatır.
- **Ana diyalog (`hoca_hub`):** Amaterasu / Tsukiyomi öğrenmek istiyorum, sınavı bildiriyorum, eğitim durumum, iki parşömen için "kaybettim", ayrıl.


**Karşılama:** Tanıştıktan sonra her gelişte hoca isteksiz bir karşılama repliğiyle başlar (5 farklı replik, `hoca_kars_1..5`); büyü menüsü ancak "öğrenmek istiyorum" denince açılır. Hangi replik açılacağı oyuncudaki `hoca_kn_<hoca>_<n>` etiketiyle belirlenir ve her konuşmadan sonra bir öncekinden farklı yeni biri seçilir (`hocalar_egitim.js` `hocaRerollGreeting`, etkileşimde `hoca_reroll_<hoca>` etiketi).

## Yan görevler

Itachi 5 yan görev verir (haber, iz, av, topla, ulas): [yan-gorevler.md](../yan-gorevler.md).
