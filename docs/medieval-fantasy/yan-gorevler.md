# Mentor yan görevleri (Kakashi, Itachi, Yoruichi)

Mentor NPC'ler yalnızca büyü öğretmen olmasın diye karaktere uygun, tekrarlanabilir küçük işler verir. Her mentorun **5 görevi** vardır. Her görev oyuncu başına bir kez yapılır; hepsi bitince mentor "şimdilik iş yok" der. Mantık: `kubejs/server_scripts/yan_gorev.js` (kopya: [tools/kubejs-yerel/](../../tools/kubejs-yerel/README.md)). Durum oyuncunun `persistentData`'sında `yg_*`. Yönetici: `/yan_gorev_sifirla <oyuncu>`, tanı: `/kakashi_menu_kontrol`. **Gerçek oyunda denenmedi.**

## Kurallar

- **Erişim:** Maceracı rütbesi (`rank_maceraci`); hoca eğitimi şart değil. Gojo şimdilik pasif olduğu için dışarıda.
- **Aynı anda tek yan görev** (başka mentorun işi varsa "önce onu bitir" der). **Her görev oyuncu başına yalnızca bir kez** yapılır; mentorun 5 görevi bitince mentor karaktere uygun bir sözle şimdilik iş kalmadığını söyler (ileride yeni görevler eklenecek). Görevler arası 3 dk bekleme. Süresi dolan ya da bırakılan görev tamamlanmış sayılmaz, tekrar verilebilir.
- **Ödül:** 2-4 zümrüt (Kan Yeminli ve üstünde +1), Erwin tür I-II (1-4) ve Thorfinn tür I siparişleri (2-4) ile aynı düzeyde; her görev bir kez yapılabildiği için bir mentorun 5 görevinden toplam en çok ~20 zümrüt. Altın elma gibi OP eşya yok.
- **Düğme:** Kakashi: Diğer işler → "Bir işin var mı?"; Itachi: Diğer işler → aynı; Yoruichi: reddetme ve bitiş diyaloglarında (`Kovulma*`, `l3_bitti*`). Düğmeler kodla eklenir (10 sn içinde), üreticide (`gen_hocalar.js`) de var. Easy NPC bir diyalogda en fazla 6 düğmeyi düzgün dizdiği için ana menüler şişirilmedi.
- **Takip:** Ekran altında sürekli durum (sayaç, yön oku baktığın yöne göre, yaklaşık mesafe, kalan süre).

## Görev türleri

| Tür | Nasıl |
|---|---|
| `haber` | Mühürlü Rulo (kağıt, `ykRulo`) hedef NPC'ye (Erwin, Thorfinn, Kenpachi, Yoruichi, Kakashi, Itachi) götürülür; hedefin 4,5 blok yakınında otomatik teslim, hedef NPC pencerede teşekkür eder |
| `iz` | Oyuncunun 30-80 blok çevresinde eşyalar oluşur: sağ tıklanan görünmez `interaction` kutusu + yalnızca yakından (~19 blok) görünen parlayan `item_display`. Uzaktan yalnızca ok ve yaklaşık mesafe (10'un katı) yazar |
| `av` | Süre içinde N canavar (`monster` kategorisi) öldür, mentora dön |
| `topla` | Belirli eşyayı getir; mentora teslimde envanterden alınır |
| `ulas` | Bir krallığa/yere git (Drondra, Granfos, Vlorya kaleleri, spawn, Yoruichi'nin evi); yeterince yaklaşınca otomatik tamamlanır |

## Görevler

| Mentor | Görev | Tür | Ayrıntı | Süre |
|---|---|---|---|---|
| Kakashi | Geç Kalan Haberci | haber | Rulo hedefe | 12 dk |
| | Kopya Defteri | iz | 4 sayfa (parlayan kitap) | 10 dk |
| | Yoldaki Gölgeler | av | 12 canavar | 8 dk |
| | Kopyalanacak Kitaplar | topla | 3 kitap | 15 dk |
| | Yol Gösterici | ulas | Bir kaleye git | 10 dk |
| Itachi | Karga Tüyleri | iz | 5 tüy (parlayan) | 10 dk |
| | Sessiz Av | av | 10 canavar | 7 dk |
| | Gözcülük | ulas | Bir yere git | 12 dk |
| | Kara Mürekkep | topla | 8 mürekkep kesesi | 15 dk |
| | Sessiz Mesaj | haber | Rulo hedefe | 12 dk |
| Yoruichi | Kayıp Kediler | iz | 4 kedi (parlayan morina) | 8 dk |
| | Gölge Yarışı | ulas | Bir yere hızlıca git | 5 dk |
| | Haberci Kedi | haber | Rulo hedefe, acele | 6 dk |
| | Hızlı Av | av | 8 canavar, kısa süre | 3 dk |
| | Balık Ziyafeti | topla | 8 çiğ morina | 15 dk |

## Test

1. Her mentorda düğme çıkıyor mu, ana menüler düzgün diziliyor mu (üst üste binme yok).
2. Art arda iş iste (her seferinde `/yan_gorev_sifirla <oyuncu>` ile bekleme süresini sıfırla): aynı görev ard arda gelmemeli.
3. Her türü bir kez bitir: rulo teslimi, parlayan eşyalar (yakından görünür, uzaktan görünmez), canavar sayacı, eşya teslimi, varış.
4. Süre dolunca görev iptal olmalı, izler silinmeli. Başka mentora gidince "önce onu bitir" demeli.
5. Sorun olursa `logs/kubejs/server.log`'ta "yan gorev" satırlarına bak.
