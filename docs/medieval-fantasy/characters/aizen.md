# Aizen

*(Sistem 5 perdelik hikâye olarak yazıldı ve simülasyonda test edildi; gerçek oyunda test edilmedi.)*

- **Tür:** İnsan (easy_npc:humanoid, klasik kol). Etiketleri: `korunan`, `aizen_npc`. NPC uuid'si `727d69ef-1a95-4410-912e-287eed99b61a` (üreticinin çıktısı; kurulumdan sonra `data get entity @e[tag=aizen_npc,limit=1] UUID` ile doğrula).
- **Konum:** **-1307, 80, -393** (swxff belirledi, 2026-10-01; önceki deneme -1310, 77, -392; Caddy bölgesinin batısı, spawn hub merkezinin -984, -375 yaklaşık 326 blok batısında, dolayısıyla hub güvenli bölgesinin (96 blok) dışında). Kurulum: orada dururken `function yoruichi:aizen_kur` (koordinat verilmez, komutu çalıştıranın yerine doğar; önce `/tp @s -1307 80 -393`). Sonra istenirse `/tp @e[tag=aizen_npc,limit=1] <x> <y> <z>`; script konumu yüklüyken 30 sn'de bir kaydeder. Gerçek dünyada henüz doğurulmadı. Not: Perde I-II Shunpo karşılaması yalnızca Aizen'in 6-14 blok çevresine gelen oyuncular için çalışır; spawn'dan uzak olduğu için oyuncular ona kendileri gitmeli.
- **Krallık:** Caddy (önerilen). Bir yardımsever âlim olarak Erwin ve Thorfinn'in yanında güvenilir görünür.
- **Konsept:** Bleach'teki Aizen: nazik ve bilge görünür, aslında her şeyi baştan kurmuştur. Sunucu **geneli** bir olayla maskesini düşürür ve boss olur.
- **İlişkiler:** Erwin, Kenpachi ve diğerleri ihanet sahnesinde tepki verir. Gizli rolü oyunculara erken açık edilmez.

## Skin / Texture

- **Dosyalar:** [`assets/npc-skins/aizen_v1.png`](../../../assets/npc-skins/aizen_v1.png) (yardımsever hâli, swxff'in `aizen-1.png`'si) ve `aizen_v2.png` (kötü hâli, swxff'in `aizen.png`'si). Detay: [assets/npc-skins/README.md](../../../assets/npc-skins/README.md).
- **Oyunda:** `SkinData` `SECURE_REMOTE_URL`. İhanet olayında NPC `v1`'den `v2`'ye ve isim rengi altın kahveden mora geçer.

## Hikâye (5 perde)

Bleach'in Soul Society bölümünden esinli: **kendi sahte ölümünü/yaralanmasını kuran, herkesi yıllarca yönlendiren bir kukla ustası.** Gücü Kyōka Suigetsu (mükemmel yanılsama). Sunucuda yanılsama, "düzenin bir yazarı var mı?" sorusuna dönüşür.

**Gerçek plan:** Aizen Caddy'ye "Sis'in kaynağını araştıran bir âlim" olarak gelir. **Sis'i o uyandırmıştır**, Keşif Birliği'ni Erwin'e ona karşı savaşsın diye kurdurmuştur; her sefer, her ölüm ve oyuncuların her gözlemi onun deney verisidir. Sahte "saldırı"da yaralı numarası yapar, oyuncular ona yiyecek getirir; her yardım onun gücüne katkıdır ve sonunda bununla dalga geçer.

| Perde | Evre | Süre (oynanmış) | Ne olur |
|---|---|---|---|
| **I. Misafir** | 1 | 10 saat | Nazik âlim: bilgi, çay, gözlem görevleri. Oyuncu yaklaşınca **Shunpo ile önüne gelir**, konuşur, sonra Shunpo ile yerine döner |
| **II. Şüphe** | 2 | 8 saat | Aynı hizmetler ama soğuk tuhaflıklar; 30 dakikada bir sohbete diğer NPC'lerin şüpheli sözleri düşer; defter sayfaları |
| **III. Yaralı** | 3 | 5 saat | "Aizen'e saldırıldı": herkese sahne, Aizen yaslanma pozunda. Oyuncular **yiyecek getirir** (12 ekmek → 1 zümrüt, sunucu geneli sayılır), **yaralarını inceler** (8 ipucu: yara sahte). 25 dakikada bir NPC'lerden soruşturma ifadeleri düşer |
| **IV. İhanet** | 4 | ~33 sn | Sessizlik, cam kırılması, "Gözlük düştü"; "Bu yara hiç yoktu... siz de bana ekmek getirdiniz"; **en çok yardım eden** anılır; **şüphelenenlere "Kırık Gözlük"** kozmetiği |
| **V. Kötü** | 5 | kalıcı | Boss kapışması (Eşik Muhafızı). İlk yenen duyurulur |

Toplam **23 saatlik oynanmış süre** sonra ihanet kendiliğinden oynar. Süreler `aizen.js` başında (`AIZEN_EVRE1_MS`, `AIZEN_EVRE2_MS`, `AIZEN_EVRE3_MS`).

### Perde ipuçları (oyuncunun görebildiği)

- **Defter (evre 1-2):** Araştırma görevleri tamamlandıkça 6 sayfa açılır ("Güven, en ucuz silahtır", "Bir yardımı kabul etmek borç imzalamaktır", "Düzeni yazan hep bendim"...).
- **Evre 2 ambiyans (10 replik, 30 dk):** Kenpachi "gözleri kılıç gibi bakıyor", Erwin "defterlerinde seferlerimin tarihleri var", Thorfinn "çayı demleyenin aklında ne var", Gojo "fazla iyi biri", Itachi "yanılsama kokusu", Yoruichi, Kakashi.
- **Evre 3 ifadeler (10 replik, 25 dk):** Erwin "hiçbir izci bir şey görmemiş", Kenpachi "ben olsam yüzüne bakarım", Thorfinn "yatağı hiç ezilmemiş", Gojo "bu kadar temiz yara", Itachi "kan kokusu yok", Kakashi "kitap ters okunuyordu", Yoruichi "hiç kıpırdamıyor".
- **İnceleme (8 ipucu, oyuncu başına sırayla):** temiz ama eski yara, morarmamış bilekler, hâlâ sıcak fincan, solunumla oynamayan yara, kılıç izi yok, camı kırık ama çerçevede çizik yok, bakışın bir an keskinleşmesi, defterin son cümlesi ("İyi oyuncu, seyircinin gülmesini beklemez"). 6'ya ulaşınca "Bu yaralar sahte olabilir" uyarısı gelir ve ihanette Kırık Gözlük hediyesi hak edilir.

### Shunpo

- **Shunpo görünümü (2026-10-01):** Aizen'in tüm görünür hızlı hareketleri (oyuncuya gelme, eve dönme, kapışmada arkana geçme) düz ışınlanma değil Shunpo: kalkışta siyah silüet ve kıvılcım, yolda hız çizgileri, varışta yer halkası ve flashstep sesi (`npc_shunpo.js`, Yoruichi'nin efekt fonksiyonlarını kullanır). İlk karşılama: oyuncu ilk kez evinin 6-14 blok çevresine gelince Shunpo ile önüne gelir.
- **Perde I-II:** Oyuncu Aizen'in duruş noktasının 6-14 blok çevresine gelip ondan uzak durursa Aizen duman ve iz bırakarak **oyuncunun önüne Shunpo ile gelir**, bir söz söyler (evreye göre nazik ya da tuhaf), 30 saniye sonra Shunpo ile yerine döner. Oyuncu başına 20 dakikada bir, aynı anda tek gezinti.
- **Perde V (boss):** Kenpachi'deki gibi 12 bloktan uzaklaşırsan arkana Shunpo yapar (3,5 sn bekleme).

## Sonrası

Aizen'i ilk yenen kişi tüm sunucuya duyurulur ("AIZEN İLK KEZ YENİLDİ" başlığı) ve Aizen sonraki konuşmalarda "Beni ilk yenen X idi" der.

## Evreler (sunucu geneli, otomatik)

Sunucunun evresi dünya verisinde (`server.persistentData` `aizen_evre`) tutulur ve **kendiliğinden ilerler**. Süre yalnızca sunucuda **en az bir oyuncu varken** işler (`aizen_ms`); sunucu boşken ya da kapalıyken sayaç durur. Sayaç NPC kurulunca başlar (`aizen_kur` etiketiyle konumu kaydeder). Script her oyuncuya evreye uygun etiketi verir (`aizen_st_1..5`); diyalog yönlendirmesi bu etiketle yapılır.

**Yönetici:** `/aizen_yer <x> <y> <z>` (Aizen'in evini ayarlar ve Shunpo ile oraya götürür), `/aizen_durum` (evre, kalan süre, toplanan yardım), `/aizen_evre <1-5>` (sayacı o evrenin başlangıcına çeker: 3 yaralı sahnesini, 4 ihanet olayını, 5 doğrudan kötü evreyi başlatır), `/aizen_sifirla <oyuncu>` (araştırma, inceleme, yardım, gözlük bayrağı, boss bekleme), `/aizen_odul <oyuncu>` (büyü kayıtlı olduğunda Kyōka Suigetsu parşömenini verir). Oyun olayın ortasında kapanırsa evre 4'te takılmaz (script evre 5'e çeker). Olay sırasında çevrimdışı olan oyuncu girişte "Sen yokken..." notunu görür.

## Evre ayrıntıları

### Evre 1-2: yardımsever Aizen

- **Bilgi:** Oyuncunun Erwin rütbesine göre gerçekten işe yarar ipucu; evre 2'de ürkütücü bir ek cümle.
- **Yardım:** 6 saatte bir "Aizen'in çayı": 30 sn yenilenme ve doygunluk (altın havuç kaldırıldı).
- **Araştırma (gözlem):** Küçük öldürme görevi (3-14 adet). Ödül **1-2 zümrüt**. Günde 5, arada 4 dakika. Tamamlanan görev sayısı 1, 3, 5, 8, 12, 16'ya ulaşınca defter sayfaları açılır.
- **Kimsin sen?:** Evreye göre yanıt (evre 1 âlim, evre 3 "bir gölge", evre 5 gerçek yüzü).
- **Bir şey fark ettim... (evre 2):** Aizen ustaca geçiştirir; 3 kez sorup 8 araştırma tamamlamış oyuncuya "Zeki birisin. Bunu başkasına söyleme." der.

### Evre 3: yaralı Aizen

Herkese "AIZEN YARALANDI" sahnesi (Erwin ve Kenpachi'nin tepkisi), NPC yaslanma pozuna geçer (Yoruichi'nin `rest` pozu). Dialog: "Yiyecek getireyim" (12 ekmek → 1 zümrüt; oyuncu başına 10 dk arayla, günde 3; toplam ve oyuncu sayacı dünya verisinde tutulur), "Yaralarına bakıyorum" (sıradaki ipucu), "Kim yaptı?", "Ayrılıyorum".

### Evre 4: ihanet olayı

Herkese aynı anda ~33 sn: sessizlik, Erwin ve Kenpachi'nin tepkisi, cam kırılma sesi ve "AIZEN — Gözlük düştü", pozun dikleşmesi, doku değişimi (10,2. sn), Aizen'in açıklaması ("Bu yara hiç yoktu... siz de bana ekmek getirdiniz", "Sis'i ben uyandırdım"), **en çok yardım edenin adı ve sayısı**, ve ≥6 inceleme yapmış oyunculara **"Kırık Gözlük"** (kozmetik deri kask). 33. saniyede evre 5.

### Evre 5: boss kapışması (`aizen.js`, Kenpachi'nin motoruna benzer)

- **Koşul:** Evre 5 ve Erwin'de **Eşik Muhafızı**. Aynı anda tek kapışma; yenilgide 3 dk, zaferde 10 dk bekleme.
- **Savaşçı:** Aynı dokuyla ayrı Easy NPC (`aizen_fighter`), canı **450**, zırhı 10. Orijinal Aizen yer altına gizlenir, sonra geri gelir.
- **Yakın vuruş:** 8 hasar (evre 3'te 10), 1,6 sn arayla. **Shunpo:** 12 bloktan uzaklaşırsan arkana ışınlanır.
- **Kido:** 5-14 blok arasında 6 büyü hasarı (mor parçacık ışını), 4 sn arayla.
- **Can %66 altı — Kyōka Suigetsu:** 22 sn'de bir kısa mide bulantısı ve körlük; gerçek Aizen 6 sn görünmez olur ve arkana geçer; etrafında **3 sahte Aizen** (1 canlı, parlayan) belirir, 10 sn sonra silinir. Sahteye vurmak körlük ve yavaşlık verir.
- **Can %33 altı — Kurohitsugi:** 15 sn'de bir işaretlenen noktadan 2,2 sn içinde uzaklaşmazsan 14 hasar ve yavaşlık.
- **Bitiş:** Ölürsen, 160 blok uzaklaşırsan, çıkarsan ya da 15 dk geçerse Aizen kazanır. Öldürürsen **ilk seferde Kyōka Suigetsu parşömeni** (büyü kayıtlı değilse 12 zümrüt, yeniden başlatınca `/aizen_odul`), sonraki galibiyetlerde 5 zümrüt.

## Kyōka Suigetsu (ödül büyüsü)

`kubejs:kyoka_suigetsu` (startup script `aizen_spell.js`; **oyunun yeniden başlatılması gerekir**). 2 seviye, efsanevi, eldritch okulu, mana 80/110, bekleme 120 sn. Etkisini bielgg_spells'in **Mirroring** büyüsünden (ekipmanını ve büyülerini kopyalayan ayna kopyalar) ödünç alır; ödünç alınan büyüye dokunulmaz. Adı ve açıklaması dil dosyalarında, ikonu `assets/spell-icons/kyoka_suigetsu.png` (16×16, ilk sürüm: mor ayna).

## Diyalog ve etiketler

Yönlendirme: evre etiketi `aizen_st_<n>` (1-5) ve karşılama sürümü `dv_aizen_<k>` (evre 1, 2, 3 ve 5'in 3 sürümü; `npc_cesitlilik.js` her konuşmadan sonra yeniler). Düğmeler yalnızca etiket verir (`aizen_bilgi`, `aizen_yardim`, `aizen_arastirma`, `aizen_kim`, `aizen_supheli`, `aizen_getir`, `aizen_incele`, `aizen_neden`, `aizen_dovus`), mantık `aizen.js`'te. Easy NPC'nin sınırı nedeniyle ana menü en çok 6 düğme.

## Kurulum

1. `node tools/yoruichi/gen_aizen.js <datapack> <owner-uuid>` (yerel dünyada fonksiyonlar zaten var).
2. Oyunda NPC'nin duracağı yerde `/reload`, sonra `function yoruichi:aizen_kur`.
3. Diyalogları yenilemek için NPC'nin yakınında `function yoruichi:aizen_diyalog` (3 sn bekle).
4. Başka bir şey gerekmez: sayaç NPC kurulunca kendiliğinden başlar ve ihanet olayı oynanmış 23 saat sonra kendiliğinden oynar. `/aizen_durum` ile bakabilirsin; test için `/aizen_evre 2` ve `/aizen_evre 3` ile hızlandır.
