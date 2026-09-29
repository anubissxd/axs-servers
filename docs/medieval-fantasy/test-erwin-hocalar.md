# Test listesi: Erwin, Kakashi, Itachi

Bu sistemler simülasyonla ve sunucu komutlarıyla sınandı ama **gerçek oyuncuyla hiç oynanmadı.** İlk gerçek testte bu listeyi adım adım yürütün, sonucu (geçti/kaldı ve notlar) en alttaki tabloya yazın. Sistem açıklaması: [erwin-smith.md](characters/erwin-smith.md), [kakashi.md](characters/kakashi.md), [itachi.md](characters/itachi.md). Komutlar: [../vds.md](../vds.md) ("Oyun içi yönetici komutları").

**Hazırlık:** Test oyuncusu OP ise `/erwin_sifirla <oyuncu>` ve `/hoca_sifirla <oyuncu>` çalıştırın. Oyuncuda `rank_maceraci` etiketi olmalı (yoksa Erwin reddeder). `guncelle` çalıştırılmaz; test yalnızca çalışan sunucuda yapılır.

## A. Erwin: temel akış
1. Rütbesiz oyuncu Erwin'e tıklar → "Keşif Birliği herkesi kabul etmez..." mesajı. (`rank_maceraci` etiketi yoksa)
2. Maceracı oyuncu tıklar → ilk konuşma → "Katılıyorum" → ana diyalog açılır.
3. "Sefer istiyorum" → sohbette 3 teklif ve [A] [B] [C] [☠] çıkar. Tıklamalar çalışıyor mu?
4. Bir sefer seç → başlık, ses, "Görev: N ... öldür" mesajı. Eylem çubuğunda sayaç görünüyor mu?
5. Hedefi öldür → sayaç artıyor, bitince "Sefer tamamlandı" ve çan sesi.
6. "Rapor veriyorum" → ödül (zümrüt bloğu), zafer başlığı ve parçacıkları, defter kaydı.
7. Hemen tekrar iste → "Biraz dinlen. N dk..." (bekleme 4 dk).
8. Günlük sınır: 5 sefer sonrası reddedilir mi?

## B. Erwin: ek sistemler
1. **Kan Bahsi ([☠]):** Seç, öl (`/kill`) → seferin iptal olduğu mesajı. Bahsi kazan → ödül x1,5.
2. **Kanlı Ay:** Teklifte "☾ Kanlı Ay" olan bir sefer çıkana kadar isteyin; hedef ve ödül artıyor mu?
3. **Kader Zinciri:** Rütbe yeterse üçüncü teklif "⛓ ..." olur; bölümler arası otomatik geçiş ve final ödülü.
4. **Ölüm Emri:** Sefer bitince isimli parlayan yaratık doğuyor mu (başlık ve çan)? Öldürünce ekstra ödül.
5. **Unvanlar ve defter:** "Birlik kaydım" ve "Sefer defterim" doğru bilgiyi yazıyor mu?
6. **Terfi:** Gerekli sefer sayısına ulaşınca terfi sahnesi (başlık, 3-4 satır Erwin) ve hoca ipucu.
7. **Ambar (Thorfinn):** Erwin'de "Ambar nerede?" Thorfinn'e yönlendirmeli. Asıl test aşağıdaki Thorfinn bölümünde.
7b. **Eski not (artık Thorfinn):** `/erwin_rutbe <oyuncu> 1` ile rütbeyi ayarla. Thorfinn'de "Ticaret" ticaret ekranını açmalı; rütbenin mallarını göstermeli. Bir mal al: ekran kapanınca "Ambar stoğum" stoğun bir azaldığını göstermeli, ekranı yeniden açınca aynı mal daha az (veya kapalı) olmalı. Rütbeyi 3 yapıp daha fazla mal açıldığını kontrol et. Süre dolunca yenileniyor mu? İki oyuncu aynı anda açarsa ikincisi "meşgul" almalı.

## C. Ölümde veri
1. Bir sefer al, sayacı ilerlet. `/kill` ile öl, yeniden doğ.
2. "Seferim nasıl gidiyor?" → sefer ve sayaç duruyor mu? Rütbe ve unvan korunuyor mu?
3. Kaybolduysa: log'da `yedek:` satırı var mı (yedek geri yükledi mi)? `/yedek_test` BASARILI mı?

## D. Kakashi (NPC kurulduktan sonra)
1. Rütbe şartı: Kül Bekçisi olmadan "Chidori" isteği reddedilir.
2. L1 Zil Sınavı: açılış sahnesi (şimşek, başlık, 2 satır), sonra "Gölge Kakashi" doğar. Yaklaşınca kaçıyor mu? Vurunca sınav tamam mı? Süre dolunca kayboluyor, yeniden başlatma ücretsiz mi?
3. Parşömen töreni (parçacık, başlık, övgü) ve parşömen envantere geliyor mu? Parşömeni kullanınca büyü öğreniliyor mu?
4. L2-L4 kayan pencere sınavları: pencere dışındaki öldürmeler sayılmıyor mu?
5. L4: sahte şimşek ortamı (8 sn'de bir) ve kapanışta ustalık sahnesi; hasar/ateş yok mu?
6. Kayıp parşömen: ücret doğru mu, bağ indirimi uygulanıyor mu?
7. Bağ hediyesi: Usta Öğrenci'de "Kopya Bandanası" bir kez geliyor mu?

## E. Itachi (NPC kurulduktan sonra)
1. Rütbe şartı: Gece Avcısı olmadan Amaterasu reddedilir; Tsukiyomi için Eşik Muhafızı ve Amaterasu tamam olmalı.
2. Amaterasu L1-L3: açılış (alev sesi, karga sürüsü, başlık) ve öldürme sınavları. Karga sürüsü 8 sn sonra siliniyor mu?
3. Tsukiyomi L1 (Sahte Gerçek): 5 yanılsama doğar; sahtelerin yeri değişir, gerçek durur. Sahteye vurunca körlük, gerçeği öldürünce sınav tamam.
4. Tsukiyomi L3: boss hedefi geçerli mi (rastgele biri seçilir)?
5. Parşömen ve ustalık sahnesi; "Gece Pelerini" hediyesi bir kez.

## F. Genel
1. Sinema sırasında başka istek "Bir saniye. Dinle." ile bekletiliyor mu?
2. Sahne mobları hub yakınında da doğuyor mu (`korunan` etiketi)?
3. Oyuncu sahnede çıkarsa varlıklar siliniyor mu? Sunucuda takılı kalan `hoca_scene`/`hoca_karga` varlığı var mı (`/kill @e[tag=hoca_scene]`, `/kill @e[tag=hoca_karga]`)?
4. Log'da `erwin ... hata`, `hoca ... hata`, `sinema hata` satırı var mı?

## Sonuç tablosu

| Tarih | Bölüm | Sonuç | Not |
|---|---|---|---|
| | | | |


## G. Thorfinn (ticaret)

1. **Tanışma:** Thorfinn'e tıkla. İlk seferde tanışma diyaloğu, sonra ana menü (4 düğme) açılmalı; düğmeler üst üste binmemeli.
2. **Ticaret:** `/erwin_rutbe <oyuncu> 1`. "Ticaret" ticaret ekranını açmalı, 4 mal göstermeli, bedel **zümrüt** olmalı (blok değil). Rütbesizken ("erwin_rutbe 0") reddedilmeli.
3. **Stok:** Bir mal al. Ekranı kapat, "Diğer işler → Stok durumu" stoğun azaldığını göstermeli; ekranı yeniden açınca aynı mal kapalı/daha az olmalı. Başka bir oyuncuda stok ayrı olmalı.
4. **Yüksek fiyat:** Rütbeyi 3 yap. Totem (128 zümrüt) iki yuvalı görünmeli; yeterli zümrütle alınabilmeli.
5. **Hasat siparişi:** "Hasat siparişi" ile sipariş al, malı topla, tekrar "Hasat siparişi" ile teslim et: zümrüt ve sahne (başlık) gelmeli. Sipariş sürerken yenisini vermemeli; günde 4, arada 3 dk sınır.
6. **Toprak rütbesi:** `thor_total` 8'e ulaşınca "TOPRAK RÜTBESİ" sahnesi ve yemek siparişleri açılmalı ("Toprak kaydım").
7. **Sıfırlama:** `/thorfinn_sifirla <oyuncu>` her şeyi temizlemeli.

## H. Gojo, Kenpachi ve FTB rütbeleri

1. **Rütbe başlığı:** `/erwin_rutbe <oyuncu> 3` sonrası sohbette ve oyuncu listesinde adın yanında **[Gece Avcısı]** görünmeli (Kutsanmış yerine). Rütbe artınca eski rank alınmalı (`/tag <oyuncu> list` içinde tek Birlik `rank_*` etiketi).
2. **Gojo tanışma:** Rütbesizken küçümser, Maceracıyken tanışma diyaloğu ("Yo! Ben Gojo Satoru...") açılmalı; ilk menü büyülerle değil kısa bir tanışmayla başlamalı. Ana menü 6 düğme, üst üste binmemeli.
3. **Mavi/Kırmızı:** `/erwin_rutbe <oyuncu> 3`; Mavi L1 için 6 blok; kill sınavı; rapor sonrası parşömende **Blue** (Mavi) ve **Red** (Kırmızı) yazmalı; büyü kitabında/parşömen aramada "Blue", "Red", "Purple" ile bulunmalı (oyunu yeniden başlattıktan sonra). L3 için rütbe 4 gerekir.
4. **Mor:** Mavi ve Kırmızı üç seviye bitmeden reddedilmeli; sonra rütbe 4, L1 12 blok; parşömen **Purple**.
5. **Kayıp parşömen ve bağ:** "Diğer işler" altından; hediye "Sonsuzluğun Bandı" (bağ Usta Öğrenci olunca).
6. **Kenpachi:** Üç düğme küçümsesin; "Seninle dövüşmek istiyorum" reiatsu sahnesini oynatmalı (ekran kararır, kalp atışı, kısa yavaşlama, hasar yok). Doku 64×64 olarak doğru görünmeli.

## I. Yeni: Thorfinn'in geri kalanı, Kenpachi kapışması, çeşitli diyaloglar

1. **Diyalog çeşitliliği:** Erwin, Thorfinn, Kenpachi ve Yoruichi ile art arda 5-6 kez konuş (her seferinde menüyü kapat). Karşılama her seferinde farklı olmalı (bir öncekiyle aynısı çıkmamalı). Hocalar da aynı.
2. **Hayvancılık ve mevsim:** `/erwin_rutbe` gerekmeden Thorfinn'den sipariş al; yumurta/tüy/süt/bal peteği gibi hayvan ürünleri çıkabilmeli. Serene Seasons açıkken bazı siparişlerin sonunda "(Kış siparişi)" gibi mevsim notu görünmeli.
3. **Gece nöbeti:** Gündüz "Gece nöbeti" reddedilmeli. `/time set night` sonra kabul: 12+ zombi/iskelet/örümcek/creeper öldür (action bar sayaç). Bitince Thorfinn'e dön, zümrüt ve başlık gelmeli. Şafak sökünce (`/time set day`, 3 dk sonra) nöbet düşmeli.
4. **Birlik ikmali:** Erwin rütben 2 altıyken reddetmeli; `/erwin_rutbe <oyuncu> 2` ile ikmal siparişi al, malı getir, ödemeyi gör, aynı gün ikinciyi reddetmeli.
5. **Thorfinn hikâyesi:** `thor_total` 1, 8, 16... değerlerine ulaşınca başlık ve iki replik gelmeli ("İLK HASAT", "YARA"...).
6. **Kenpachi kapışması:** Rütben 2 altındayken "Seninle dövüşmek istiyorum" reiatsu sahnesi ve uyarı vermeli. `/erwin_rutbe <oyuncu> 3` sonra kapışma başlamalı: sahne, savaşçı Kenpachi doğar (orijinali kaybolur), sana yürür ve vurur (7 hasar, 1,5 sn). Canı yarıya inince "GERÇEK GÜÇ" sahnesi, daha sert vurur. Kazanırsan Nozarashi kılıcı gelmeli ve orijinal Kenpachi yerine dönmeli. Ölürsen/kaçarsan savaşçı silinmeli ve orijinal geri gelmeli. `/kenpachi_sifirla` ile yeniden dene.
   - **Bilmediklerimiz:** Savaşçı Easy NPC'nin tp ile yürümesi ve `damage` ile vurması gerçek oyunda denenmedi; savaşçı doğmuyorsa/hareket etmiyorsa `logs/latest.log`'a bak ("kenpachi kapisma hata").
