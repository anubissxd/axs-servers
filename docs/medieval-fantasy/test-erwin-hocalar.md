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
