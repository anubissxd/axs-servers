# NPC cevapları: sohbet yerine diyalog penceresi

NPC'ler, bir diyalog düğmesine tıklandığında verdikleri cevapları (bekleme, red, rapor, bilgi ekranları, teklifler) sohbete değil, **Easy NPC diyalog penceresinde** gösterir. Kapışma, sahne, gezinme ve başlık/ses gibi **oyun akışının içindeki** replikler sohbette kalır (pencere bir sahnenin ortasına açılmasın diye).

## Nasıl çalışır

Ortak kod: `kubejs/server_scripts/npc_dialog.js` (kopyası [tools/kubejs-yerel/](../tools/kubejs-yerel/README.md)).

1. Her NPC'nin `<npc>_yanit` adlı bir cevap diyaloğu vardır (Tamam. düğmeli). Yoksa script kendiliğinden ekler (`npcDlgEnsure`), elle kurulum gerekmez.
2. Cevap metni bu diyaloğun `Texts[0].Text` alanına yazılır, sonra `easy_npc dialog open <npc-uuid> <oyuncu> <diyalog>` ile oyuncuya açılır.
3. Aynı tikte gelen sözler tek pencerede birleşir (`npcDlgSay`); liste/kayıt satırları yeni satırda başlar.
4. Yazma başarısız olursa (NPC yüklü değil vb.) cevap eski yolla **sohbete** düşer ve `logs/kubejs/server.log`'a "npc diyalog yazilamadi" satırı düşer.

Bilinen tuzaklar (oyunda bulundu):
- `data modify` yazılacak değer zaten aynıysa **başarısız** döner; bu yüzden script önce yer tutucu (`.`), sonra gerçek metni yazar.
- Minecraft'ın komut SNBT dizgesinde `\n` kaçışı **yoktur**; satır sonu gerçek satır sonu karakteriyle girer (kabul edilmezse boşlukla birleştirilip yeniden denenir).
- Etiket/düğme tepkisi için Erwin'de etiket kontrolü 2 tikte bir (0,1 sn) çalışır.

## Kapsam

| NPC | Diyalog | Diyalog adı | Sohbette kalanlar |
|---|---|---|---|
| Erwin | Tüm cevaplar, bilgi ekranları, sefer teklifleri (`erwin_teklif_<n>`, `erwin_bahis_<n>`: seç ve Kan Bahsi) | `erwin_yanit` | Sefer olay mesajları (ilerleme, ödül, terfi sahnesi) |
| Thorfinn | Tüm cevaplar, stok, sipariş, nöbet, ikmal, rütbe | `thorfinn_yanit` | Ticaret ekranı sonrası uyarı, nöbet sona erdi, nöbet tamam |
| Kakashi / Itachi / Gojo | Eğitim isteği, bedel, rapor, parşömen yenileme, büyü eğitimi bilgisi | `kakashi_yanit`, `itachi_yanit`, `gojo_yanit` | Sınav sahnesi, sınav sonucu, "Bir saniye. Dinle." |
| Kenpachi | Meydan okuma reddi, "kral", "kim" cevapları | `kenpachi_yanit` | Kapışma repliği, reiatsu sahnesi |
| Aizen | Bilgi, çay, araştırma, yiyecek, inceleme, "kim yaptı", şüphe, meydan okuma reddi | `aizen_yanit` | Kapışma, gezinme (Shunpo) repliği, olay mesajları |
| Yoruichi | Rütbe/ücret cevapları | `yoruichi_yanit` | Eğitim sahnesi, kovalama, gölge sınavı |

Yeni bir NPC'ye eklemek için: NPC'nin UUID'sini bul, `npcDlgSay(server, uuid, '<npc>_yanit', oyuncu, metin, yeniSatir, sohbetYedegi)` çağıran küçük bir `xxxSayDlg` fonksiyonu yaz ve yalnızca dialog düğmesine verilen cevapları buna çevir.
