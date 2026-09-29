# Kakashi (Chidori öğretmeni)

*(Sistem hazır ve VDS'te; NPC henüz oyunda yok. Skin ve konum bekleniyor.)*

- **Tür:** İnsan (easy_npc:humanoid; kol tipi skin'e göre)
- **Öğrettiği büyü:** Chidori (4 seviye, `kubejs:chidori`, bkz. `kubejs/startup_scripts/chidori_spell.js`)
- **Krallık:** Tarafsız (Yoruichi gibi bir öğretmen; Vlorya'ya bağlı değil)
- **Konum:** *belirlenecek*
- **Skin dosyası:** `assets/npc-skins/kakashi_v1.png` (bkz. [assets.md](../../assets.md))
- **Neden Kakashi:** Chidori'yi yaratan ve öğreten kişidir; Yoruichi modeli (öğretmen NPC, öğrenci oyuncu).

## Şart

`rank_maceraci` ve Erwin'de ([Keşif Birliği](erwin-smith.md)) rütbe: L1-L2 için **Kül Bekçisi**, L3 için **Kan Yeminli**, L4 için **Gece Avcısı**. Her seviye sırayla açılır, her seviye için ayrı ücret ve sınav vardır.

## Eğitim

Ücret zümrüt bloğu (Yoruichi'de toplam 19, Chidori 4 seviye ve güçlü olduğu için toplam 40). Hız sınavlarında öldürmeler kayan bir zaman penceresi içinde sayılır (pencere dışına düşen öldürme sayılmaz).

| Seviye | Sınav | Ücret | Rütbe |
|---|---|---|---|
| L1 Yıldırımın İlk Adımı | 180 sn içinde 8 düşman (zombi, iskelet, örümcek, creeper) | 4 | Kül Bekçisi |
| L2 Şimşek Zinciri | 150 sn içinde 10 düşman (+enderman, yağmacı) | 8 | Kül Bekçisi |
| L3 Bin Kuşun Sesi | 120 sn içinde 8 güçlü hedef (yağmacı, mezarlık, kaos, Nether askeri) | 12 | Kan Yeminli |
| L4 Kırılmayan Yıldırım | 180 sn içinde 6 yıkıntı bekçisi / kadim yaratık | 16 | Gece Avcısı |

Ödül: o seviyenin Chidori parşömeni. Ücret bir seviye için **bir kez** alınır (sınavı bırakıp tekrar denemek ücretsiz). Kayıp parşömen: 2 zümrüt bloğu (en yüksek öğrenilen seviyede yeniden yazılır).

## Teknik

- Mantık: `kubejs/server_scripts/hocalar_egitim.js` (aynı dosyada Itachi de var). Durum oyuncunun `persistentData`'sında `hoca_*` (`hoca_lvl_chidori`, `hoca_paid_chidori`, aktif sınav `hoca_act`).
- Diyalog düğmeleri `hoca_req_chidori`, `hoca_rep_kakashi`, `hoca_info`, `hoca_lost_chidori` etiketi verir; script alır.
- NPC kurulumu: `node tools/yoruichi/gen_hocalar.js kakashi <datapack> <owner-uuid> <x> <y> <z> <yaw> [skin] [slim]`, sonra sunucuda `reload` ve `function yoruichi:kakashi_kur`.
- Yönetici: `/hoca_sifirla <oyuncu>` tüm hoca ilerlemesini sıfırlar.

## Diyaloglar

- **Rütbesiz (`hoca_ret`):** "Yaa... Adını duymadım. Yolda kayboldum da, geç kaldım. Önce Maceracı olarak tanınmalısın; sonra konuşuruz."
- **İlk konuşma (`hoca_ilk`):** kendini tanıtır (Kopya Ninja), Chidori'yi anlatır, Keşif Birliği şartını söyler.
- **Ana diyalog (`hoca_hub`):** Chidori öğrenmek istiyorum / Sınavı bildiriyorum / Eğitim durumum / Parşömenimi kaybettim / Ayrılıyorum. Sınav, bildirim ve ödül konuşmaları chat mesajı olarak script'te.
