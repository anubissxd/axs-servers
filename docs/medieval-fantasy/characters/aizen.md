# Aizen

*(Sistem yazıldı ve simülasyonda test edildi; NPC oyunda kurulmadı, gerçek oyunda test edilmedi.)*

- **Tür:** İnsan (easy_npc:humanoid, klasik kol). Etiketleri: `korunan`, `aizen_npc`. NPC uuid'si `727d69ef-1a95-4410-912e-287eed99b61a` (üreticinin çıktısı; kurulumdan sonra `data get entity @e[tag=aizen_npc,limit=1] UUID` ile doğrula).
- **Konum:** Kurulumu **komutu çalıştırdığın yere** yapar (koordinat verilmedi): NPC'nin duracağı yerde dururken `function yoruichi:aizen_kur`. Sonra istersen `/tp @e[tag=aizen_npc,limit=1] <x> <y> <z>` ile taşırsın; script konumu yüklüyken 30 sn'de bir kaydeder.
- **Krallık:** Caddy (önerilen). Bir yardımsever âlim olarak Erwin ve Thorfinn'in yanında güvenilir görünür.
- **Konsept:** Bleach'teki Aizen: nazik ve bilge görünür, aslında her şeyi baştan kurmuştur. Sunucu **geneli** bir olayla maskesini düşürür ve boss olur.
- **İlişkiler:** Erwin, Kenpachi ve diğerleri ihanet sahnesinde tepki verir. Gizli rolü oyunculara erken açık edilmez.

## Skin / Texture

- **Dosyalar:** [`assets/npc-skins/aizen_v1.png`](../../../assets/npc-skins/aizen_v1.png) (yardımsever hâli, swxff'in `aizen-1.png`'si) ve `aizen_v2.png` (kötü hâli, swxff'in `aizen.png`'si). Detay: [assets/npc-skins/README.md](../../../assets/npc-skins/README.md).
- **Oyunda:** `SkinData` `SECURE_REMOTE_URL`. İhanet olayında NPC `v1`'den `v2`'ye ve isim rengi altın kahveden mora geçer.

## Hikâye

**Aizen** Caddy'ye kendini "Sis'in kaynağını araştıran bir âlim" olarak tanıtır ve Birliğe yardım eder. Gerçek şu: **Sis'i o uyandırdı**, Keşif Birliği'ni ona karşı savaşsın diye kurdurdu; Erwin'in her seferi, her ölüm, oyuncuların her gözlemi onun deneyinin verisi oldu. Bleach'teki Aizen gibi: iyi biri gibi görünen, yıllardır herkesi yönlendiren, en sonunda "hepsi benim planımdı" diyen bir kukla ustası; gücü Kyōka Suigetsu (mükemmel yanılsama). Bu sunucuda yanılsama, "düzenin bir yazarı var mı?" sorusuna dönüşür: rütbeler, hocalar, ticaret, hepsi düzenli görünür ve düzeni yazan el hep oradadır.

**İpuçları (oyuncunun görebileceği):** Evre 2'de diğer NPC'ler sohbete kendiliğinden şüpheli sözler düşürür (Kenpachi'nin gözlüklü âlimden hoşlanmaması, Erwin'in "defterlerde seferlerimin tarihleri var" demesi, Thorfinn'in "çayı demleyenin aklında ne var", Gojo'nun "fazla iyi biri", Itachi'nin yanılsama kokusu, Yoruichi'nin "kimi kovaladığını bilmeyen hızlı", vb.; 10 replik, 30 dakikada bir). Aizen'in **defteri**: araştırma görevleri tamamlandıkça 6 sayfa açılır (Sis'in kimse sorulmayan sebebi, güvenin en ucuz silah olması, seferlerin "veri" olarak yazılması, Kyōka Suigetsu'nun "gösterdiğini gerçek sandırma"sı, yardımın imzalanmış borç olması, "düzeni yazan hep bendim").

**İhanet (otomatik):** Yardımsever ve şüphe evreleri bitince herkese aynı sahne: sessizlik, Erwin ve Kenpachi'nin tepkisi, cam kırılma sesiyle "AIZEN — Gözlük düştü", sonra Aizen'in açıklaması: "Sis'i ben uyandırdım. Birliği ben kurdurdum. Seferleriniz, ölülerinizle birlikte, benim deneyimdi... Çay için, notlar için, kanınız için sağ olun."

**Sonrası:** Aizen'i ilk yenen kişi tüm sunucuya duyurulur ("AIZEN İLK KEZ YENİLDİ" başlığı) ve Aizen sonraki konuşmalarda "Beni ilk yenen X idi" der.

## Evreler (sunucu geneli, otomatik)

Sunucunun evresi dünya verisinde (`server.persistentData` `aizen_evre`) tutulur ve **kendiliğinden ilerler**. Süre yalnızca sunucuda **en az bir oyuncu varken** işler (oynanan süre, `aizen_ms`); sunucu boşken ya da kapalıyken sayaç durur. Sayaç NPC kurulunca başlar (`aizen_kur` etiketiyle konumu kaydeder). Süreler `aizen.js` başında: `AIZEN_EVRE1_MS` = **10 saat**, `AIZEN_EVRE2_MS` = **8 saat**; yani toplam **18 saatlik oynanmış süre** sonra ihanet olayı kendiliğinden oynar. Script her oyuncuya evreye uygun etiketi verir (`aizen_st_1..4`); diyalog yönlendirmesi bu etiketle yapılır.

| Evre | Süre | Anlamı | Aizen |
|---|---|---|---|
| **1** | ilk 10 saat | Yardımsever | Bilgi, günlük çay, küçük araştırma görevleri |
| **2** | sonraki 8 saat | Şüphe | Aynı hizmetler ama soğuk tuhaflıklar, "Bir şey fark ettim..." düğmesi, sohbete ipuçları düşer |
| **3** | ~27 sn | İhanet olayı (geçiş) | Herkese sinematik sahne, doku ve isim rengi değişir |
| **4** | kalıcı | Kötü | Yardım/araştırma kapanır; "Seninle savaşacağım", "Neden yaptın?", "Gerçekte kimsin?" |

**Yönetici (isteğe bağlı müdahale):** `/aizen_durum` (evre ve kalan süre), `/aizen_evre <1-4>` (sayacı o evrenin başlangıcına çeker; 3 hemen ihanet olayını oynatır), `/aizen_sifirla <oyuncu>`, `/aizen_odul <oyuncu>` (büyü kayıtlı olduğunda Kyōka Suigetsu parşömenini verir). Oyun olayın ortasında kapanırsa evre 3'te takılmaz (script evre 4'e çeker). Olay sırasında çevrimdışı olan oyuncu girişte "Sen yokken..." notunu görür.

### Evre 1-2: yardımsever Aizen

- **Bilgi:** Oyuncunun Erwin rütbesine göre gerçekten işe yarar bir ipucu (kime gidilir, ne açıldı). Evre 2'de ipucuna ürkütücü bir ek cümle eklenir.
- **Yardım:** 6 saatte bir "Aizen'in çayı": 30 sn yenilenme, doygunluk ve 4 altın havuç.
- **Araştırma (gözlem):** Küçük öldürme görevi (zombi, iskelet, örümcek, creeper, enderman, yağmacı, mezarlık yaratığı; 3-14 adet). Ödül **1-2 zümrüt**. Günde 5, arada 4 dakika. Tamamlanan görev sayısı 1, 3, 5, 8, 12, 16'ya ulaşınca Aizen'in "notları" açılır: ilk ikisi masum, sonrakiler giderek tuhaflaşır (ipuçları).
- **Kimsin sen?:** Evreye göre farklı yanıtlar.
- **Bir şey fark ettim... (evre 2):** Aizen ustaca geçiştirir; 3 kez sorup 8 araştırma tamamlamış olan oyuncuya "Zeki birisin. Bunu başkasına söyleme." der.

### Evre 3: ihanet olayı

Herkese aynı anda: gök gürültüsü, kararma, "CADDY SESSİZLEŞTİ", Erwin ve Kenpachi'nin tepkisi, cam kırılma sesi ve "AIZEN — Gözlük düştü", Aizen'in üç repliği (yanılsama, "Sis'i ben uyandırdım", "sağ olun"). Doku değişimi 10,2. saniyede, evre 4'e geçiş 27. saniyede. Doku komutları NPC yüklü olmasa da çalışsın diye kayıtlı konumun yığını geçici yüklenir (`forceload`). Sunucuda o an oyuncu yoksa olay tetiklenmez (sayaç zaten oyuncu yokken işlemez).

### Evre 4: boss kapışması (`aizen.js`, Kenpachi'nin motoruna benzer)

- **Koşul:** Evre 4 ve Erwin'de **Eşik Muhafızı**. Aynı anda tek kapışma; yenilgide 3 dk, zaferde 10 dk bekleme.
- **Savaşçı:** Aynı dokuyla ayrı Easy NPC (`aizen_fighter`), canı **450**, zırhı 10. Orijinal Aizen yer altına gizlenir, sonra geri gelir.
- **Yakın vuruş:** 8 hasar (evre 3'te 10), 1,6 sn arayla. **Shunpo:** 12 bloktan uzaklaşırsan arkana ışınlanır.
- **Kido:** 5-14 blok arasında 6 büyü hasarı (mor parçacık ışını), 4 sn arayla.
- **Evre 2 (can %66 altı) — Kyōka Suigetsu:** 22 sn'de bir kısa mide bulantısı ve körlük; gerçek Aizen 6 sn görünmez olur ve arkana geçer; etrafında **3 sahte Aizen** (1 canlı, parlayan) belirir, 10 sn sonra silinir. Sahteye vurmak körlük ve yavaşlık verir.
- **Evre 3 (can %33 altı) — Kurohitsugi:** 15 sn'de bir işaretlenen noktadan 2,2 sn içinde uzaklaşmazsan 14 hasar ve yavaşlık.
- **Bitiş:** Ölürsen, 160 blok uzaklaşırsan, çıkarsan ya da 15 dk geçerse Aizen kazanır. Öldürürsen **ilk seferde Kyōka Suigetsu parşömeni** (büyü kayıtlı değilse 12 zümrüt, yeniden başlatınca `/aizen_odul`), sonraki galibiyetlerde 5 zümrüt.

## Kyōka Suigetsu (ödül büyüsü)

`kubejs:kyoka_suigetsu` (startup script `aizen_spell.js`; **oyunun yeniden başlatılması gerekir**). 2 seviye, efsanevi, eldritch okulu, mana 80/110, bekleme 120 sn. Etkisini bielgg_spells'in **Mirroring** büyüsünden (ekipmanını ve büyülerini kopyalayan ayna kopyalar) ödünç alır; ödünç alınan büyüye dokunulmaz. Adı ve açıklaması dil dosyalarında, ikonu `assets/spell-icons/kyoka_suigetsu.png` (16×16, ilk sürüm: mor ayna).

## Diyalog ve etiketler

Yönlendirme: evre etiketi `aizen_st_<n>` ve karşılama sürümü `dv_aizen_<k>` (her evrenin 3 sürümü; `npc_cesitlilik.js` her konuşmadan sonra yeniler). Düğmeler yalnızca etiket verir (`aizen_bilgi`, `aizen_yardim`, `aizen_arastirma`, `aizen_kim`, `aizen_supheli`, `aizen_neden`, `aizen_dovus`), mantık `aizen.js`'te. Easy NPC'nin sınırı nedeniyle ana menü en çok 6 düğme.

## Kurulum

1. `node tools/yoruichi/gen_aizen.js <datapack> <owner-uuid>` (yerel dünyada fonksiyonlar zaten var).
2. Oyunda NPC'nin duracağı yerde `/reload`, sonra `function yoruichi:aizen_kur`.
3. Diyalogları yenilemek için NPC'nin yakınında `function yoruichi:aizen_diyalog` (3 sn bekle).
4. Başka bir şey gerekmez: sayaç NPC kurulunca kendiliğinden başlar ve ihanet olayı oynanmış 18 saat sonra kendiliğinden oynar. `/aizen_durum` ile bakabilirsin; test için `/aizen_evre 2` ve `/aizen_evre 3` ile hızlandır.
