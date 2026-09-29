# Kakashi (Chidori öğretmeni)

*(Sistem ve NPC VDS'te kurulu; gerçek oyunda test edilmedi.)*

- **Tür:** İnsan (easy_npc:humanoid; kol tipi skin'e göre)
- **Öğrettiği büyü:** Chidori (4 seviye, `kubejs:chidori`, bkz. `kubejs/startup_scripts/chidori_spell.js`)
- **Krallık:** Tarafsız (Yoruichi gibi bir öğretmen; Vlorya'ya bağlı değil)
- **Konum:** -786.5, 72, -331.5 (yön: güney; oyuncuya bakar)
- **Skin dosyası:** `assets/npc-skins/kakashi_v1.png` (bkz. [assets.md](../../assets.md))
- **Neden Kakashi:** Chidori'yi yaratan ve öğreten kişidir; Yoruichi modeli (öğretmen NPC, öğrenci oyuncu).

## Şart

`rank_maceraci` ve Erwin'de ([Keşif Birliği](erwin-smith.md)) rütbe: L1-L2 için **Kül Bekçisi**, L3 için **Kan Yeminli**, L4 için **Gece Avcısı**. Her seviye sırayla açılır, her seviye için ayrı ücret ve sınav vardır.

## Eğitim

Ücret zümrüt bloğu (Yoruichi'de toplam 19, Chidori 4 seviye ve güçlü olduğu için toplam 46). Hız sınavlarında öldürmeler kayan bir zaman penceresi içinde sayılır (pencere dışına düşen öldürme sayılmaz).

| Seviye | Sınav | Ücret | Rütbe |
|---|---|---|---|
| L1 Zil Sınavı (sahne) | "Gölge Kakashi" zil taşır; oyuncu 2 blok yakına gelince yüzeyde başka bir noktaya kaçar. 90 sn içinde ona vurup öldür | 5 | Kül Bekçisi |
| L2 Şimşek Zinciri | 150 sn içinde 10 düşman (+enderman, yağmacı) | 9 | Kül Bekçisi |
| L3 Bin Kuşun Sesi | 120 sn içinde 8 güçlü hedef (yağmacı, mezarlık, kaos, Nether askeri) | 14 | Kan Yeminli |
| L4 Kırılmayan Yıldırım | 180 sn içinde 6 yıkıntı bekçisi / kadim yaratık | 18 | Gece Avcısı |

Ödül: o seviyenin Chidori parşömeni. Ücret bir seviye için **bir kez** alınır (sınavı bırakıp tekrar denemek ücretsiz). Kayıp parşömen: en yüksek öğrenilen seviyenin ücretinin yarısı (ör. Chidori L4 için 9 blok); ucuz olsaydı parşömen arkadaşlara çoğaltılırdı.

**Sahneli sınav:** L1'de "Gölge Kakashi" (6 canlı, NoAI, parlayan zombi, elinde zil) doğar; oyuncu yaklaşınca kaçar. Başkası öldürürse ya da süre dolarsa sahne biter; hocaya tekrar "Chidori öğrenmek istiyorum" denince **ücretsiz** yeniden başlar. Sahne mobları `korunan` etiketlidir (hub güvenli bölgesi canavar doğmasını engelliyor, bu etiket muaf tutar).

**Sinema:** Her sınav bir açılış senaryosuyla başlar: şimşek sesi ve kıvılcım parçacıkları, seviye başlığı ("ZİL SINAVI", "ŞİMŞEK ZİNCİRİ", "BİN KUŞUN SESİ", "KIRILMAYAN YILDIRIM"), Kakashi'nin 2 satırlık anlatısı, sonra sınav talimatı ve (sahneli sınavda) sahnenin başlaması. Rapor verince parşömen töreni: büyü parçacıkları, seviye başlığı, övgü, kapanış sözü, bağ sözü; son seviyede "USTALIK" sahnesi. Kill sınavlarında yarı yolda hoca kısa bir söz söyler. Sinema sürerken yeni istek "Bir saniye. Dinle." ile bekletilir.

**Yıldırım fırtınası (Chidori L4):** Sınav açılışında uzaktan üç şimşek çakar (elektrik kıvılcımı sütunu ve gök gürültüsü), sınav sürerken 8 saniyede bir rastgele yönde sahte şimşek düşer; kapanışta yeniden. Tamamen kozmetik: gerçek yıldırım yok, hasar veya ateş riski yok.

**Hoca bağı:** Kakashi'den öğrenilen toplam seviyeye göre Yabancı → Tanıdık (1+) → Öğrenci (3+) → Usta Öğrenci (4). Sınav başlarken ve rapor alırken bağa uygun bir söz söyler. Usta Öğrenci olununca Kakashi bir kez kozmetik hediye verir: "Kopya Bandanası" (koyu mavi deri miğfer, kırılmaz). Kayıp parşömen ücreti Öğrenci'de %25, Usta Öğrenci'de yarı yarıya iner.

## Teknik

- Mantık: `kubejs/server_scripts/hocalar_egitim.js` (aynı dosyada Itachi de var). Durum oyuncunun `persistentData`'sında `hoca_*` (`hoca_lvl_chidori`, `hoca_paid_chidori`, aktif sınav `hoca_act`).
- Diyalog düğmeleri `hoca_req_chidori`, `hoca_rep_kakashi`, `hoca_info`, `hoca_lost_chidori` etiketi verir; script alır.
- NPC kurulumu: `node tools/yoruichi/gen_hocalar.js kakashi <datapack> <owner-uuid> <x> <y> <z> <yaw> [skin] [slim]`, sonra sunucuda `reload` ve `function yoruichi:kakashi_kur`.
- Yönetici: `/hoca_sifirla <oyuncu>` tüm hoca ilerlemesini sıfırlar.

## Diyaloglar

- **Rütbesiz (`hoca_ret`):** "Yaa... Adını duymadım. Yolda kayboldum da, geç kaldım. Önce Maceracı olarak tanınmalısın; sonra konuşuruz."
- **İlk konuşma (`hoca_ilk`):** kendini tanıtır (Kopya Ninja), Chidori'yi anlatır, Keşif Birliği şartını söyler.
- **Ana diyalog (`hoca_hub`):** Chidori öğrenmek istiyorum / Sınavı bildiriyorum / Eğitim durumum / Parşömenimi kaybettim / Ayrılıyorum. Sınav, bildirim ve ödül konuşmaları chat mesajı olarak script'te.
