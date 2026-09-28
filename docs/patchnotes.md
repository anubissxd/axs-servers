# Yama Notları

Oyuncuların pakette neyin değiştiğini gördüğü iki yer var:

1. **AnuDownloader'daki "Yama Notları" düğmesi:** `distribution/<paket>/patchnotes.md` dosyasını uygulama içinde bir pencerede gösterir. Adres `index.json`'daki `patchnotes_url`'dir (commit SHA'sına sabitli).
2. **Discord Update kanalı:** Aynı metin bir embed olarak duyurulur.

İkisini de `guncelle` üretir (bkz. [guncelleme-akisi.md](guncelleme-akisi.md)). `patchnotes.md` elle düzenlenmez.

---

## Metin nereden gelir

Yama notu, havuzdaki (`havuz ekle ...`) kayıtların **metinlerinden** oluşur. Her kayıt bir madde olur:

```markdown
# Medieval Fantasy - 1.3.4

- İçilebilir iksirler artık 16'lı yığınlanıyor.
- ...
```

- Her yayında dosya **baştan yazılır**; önceki sürümün notları silinir.
- Havuz boşken paket değiştiyse tek madde "Küçük düzeltmeler." yazılır. Bu olmamalı: değişikliği yapan havuza yazmalı.
- Paket değişmeden yapılan "Güncelle"de (sadece sunucu tarafı) yama notu yazılmaz, duyuru gitmez. O kayıtlar arşive gider.

**Şimdilik metni, değişikliği yapan kişinin Claude'u yazar.** Anubis ileride yama notu yazım kurallarını ekleyecek; eklenince bu bölüme yazılır ve o kurallara uyulur.

### Yazarken dikkat

Bu kurallar önceki duyurulardan çıkan tercihlerdir:

- Oyuncunun anlayacağı Türkçe, tam cümle, sonunda nokta. Başlık gibi kısa ise `**Kalın başlık:** açıklama.` biçimi kullanılabilir.
- Dosya/sınıf adı değil, oyuncunun göreceği etki yazılır ("Ejderhaların ısırma hasarı 17 → 20.").
- **Oyuncuyu suçlayan teşhis yazılmaz.** Bir sorun için oyuncudan bir şey isteniyorsa nötr adımlar yazılır ve gerekirse `debug.log` istenir.
- Mod adları özgün haliyle yazılır (Iron's Spells, Ice and Fire).
- Tek bir küçük değişiklik için ayrı yama çıkarılmaz; değişiklikler havuzda birikir.

---

## Discord duyurusu

`/root/scripts/notify_pack.py "<Paket Adı>" <sürüm> < patchnotes.md`

- **Update** kanalına, "Minecraft" adlı webhook ile, `@everyone` etiketli bir embed atar: başlık "`<Paket> v<sürüm> yayınlandı`", altında notlar, en altta "AnuDownloader'ı aç → Kur / Güncelle."
- Webhook adresi yalnızca bu script'te (VDS'te) durur, repoya girmez.
- Attığı mesajın ID'sini `/root/scripts/update_message_id.txt`'e yazar.
- **Gece kuralı (TR 01:00–08:00):** Gece yeni mesaj atıp herkesi `@everyone` ile uyandırmaz. Onun yerine son duyuru mesajını düzenler (PATCH) ve yeni sürümün notlarını ikinci bir embed olarak ekler. Bir mesaj en fazla 10 embed taşıyabilir; dolarsa en eskisi düşer.
- `servers` kanalının webhook'u (`update_players.py`) yalnızca sunucu durum mesajı içindir; duyuru için kullanılmaz.

Paketle birlikte AnuDownloader uygulamasının yeni sürümü de çıktıysa tek mesajda verilir: başlık yalnızca paket sürümü, en altta `## AnuDownloader X.Y.Z` bölümü.

Paket dışı duyurular (ör. "YAKINDA...", sunucu açılışı) yalnızca Anubis veya swxff açıkça isterse atılır.
