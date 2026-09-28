# Güncelleme Akışı: Havuz ve "Güncelle"

Anubis ve swxff (ve ikisinin Claude'u) sunucuda aynı anda çalışır. Değişiklikler tek bir **havuzda** birikir; ikisinden biri **"Güncelle"** dediğinde tek komut bunların hepsini sunucuya, AnuDownloader paketine ve Discord'a yansıtır.

```
 Anubis / Claude ─┐                          ┌─> sunucu yeniden başlar
                  ├─> VDS'te değişiklik ──> havuz ──"Güncelle"──> guncelle ─┼─> paket yayınlanır (değiştiyse)
 swxff / Claude ──┘   + havuz ekle                                  └─> Discord'a yama notu (paket değiştiyse)
```

---

## 1. Değişiklik yaparken: havuza yaz

Sunucuda **bir şey değiştiren herkes** değişikliği bitirir bitirmez havuza bir satır ekler:

```bash
ssh root@31.58.91.7 'havuz ekle <kim> <paket|sunucu> "<oyuncuya gidecek cümle>"'
```

- `<kim>`: `Anubis` veya `swxff`
- `<paket|sunucu>`:
  - `paket`: oyuncunun dosyalarını da değiştiren şeyler (mod ekleme/kaldırma/güncelleme, `config/`, `kubejs/`, resourcepack...)
  - `sunucu`: sadece sunucuda kalan şeyler (sunucu-only mod, `world/serverconfig`, görevler, NPC'ler, dünya)
- Metin **yama notuna olduğu gibi girer**. Oyuncunun anlayacağı Türkçe, tek madde, noktalı cümle. Teknik dosya adı değil, oyuncunun göreceği etki yazılır. Kuralları: [patchnotes.md](patchnotes.md).

Örnek:

```bash
ssh root@31.58.91.7 'havuz ekle Anubis paket "İçilebilir iksirler artık 16'"'"'lı yığınlanıyor."'
```

Tırnak içinde kesme işareti (`'`) varsa yukarıdaki gibi `'"'"'` ile kaçırılır. Daha kolayı, satırı VDS'te bir dosyaya yazıp `havuz ekle Anubis paket "$(cat /tmp/pa/not.txt)"` kullanmak.

Diğer komutlar:

```bash
havuz liste        # birikenleri gör (numaralı)
havuz sil 3        # 3 numaralı kaydı sil (yanlış yazıldıysa sil, doğrusunu ekle)
```

Havuz dosyası: `/root/pending/medieval-fantasy.jsonl` (her satır bir JSON kaydı: zaman, kim, tür, metin). Elle düzenlenmez; `havuz` komutu kilit kullanır, iki kişi aynı anda yazsa da satırlar karışmaz.

**Havuza yazılmayan değişiklik yama notunda çıkmaz**, ama dosya değiştiği için pakete yine girer. Yani yazmayı unutmak oyuncuya habersiz değişiklik demektir.

Bir iş birden fazla adımda yapılıyorsa havuza iş **bitince** tek satır yazılır. Yarım iş havuza yazılmaz ve "Güncelle" denmeden önce ya bitirilir ya geri alınır. Yarım kalan işler [README.md](README.md) "Yarım kalan işler"e not edilir.

---

## 2. "Güncelle" denince

Anubis veya swxff **"Güncelle"** (veya "sunucuyu güncelle", "yayınla", "AnuDownloader'a gönder") dediğinde o kişinin Claude'u şunu çalıştırır:

```bash
ssh root@31.58.91.7 'guncelle --kim <kim> --kuru'
```

`--kuru` hiçbir şeyi değiştirmez; havuzdaki kayıtları, pakette değişen dosyaları ve olacakları listeler. Claude bunu kontrol eder:

- Pakette değişen her dosya havuzdaki bir kayıtla açıklanıyor mu? Açıklanmayan bir değişiklik varsa (başkasının unuttuğu kayıt, geçici test dosyası) **durup kişiye söyler**. Geçici/yanlış dosya pakete girmemeli.
- Sorun yoksa gerçek komutu çalıştırır:

```bash
ssh root@31.58.91.7 'guncelle --kim <kim>'
```

`guncelle` sırayla şunları yapar:

1. **Kilit alır.** İkinci bir `guncelle` aynı anda başlarsa hemen "başka bir guncelle çalışıyor" der ve çıkar.
2. VDS'teki repo kopyasını `origin/main`'e çeker.
3. Sunucudaki dosyaları tarar, yayındaki `manifest.json` ile karşılaştırır.
4. **Yedek alır** (`backup_fantasy.sh`).
5. Çevrimiçi oyuncu varsa 60 saniye boyunca sohbetten uyarır, sonra sunucuyu durdurur ve başlatır. **Sunucunun gerçekten açıldığını** (sunucu listesine cevap verdiğini) 10 dakikaya kadar bekler. Açılmazsa **yayın yapmadan durur**; loglara bakılır.
6. **Paket değiştiyse:**
   1. Yeni/değişen dosyaları GitHub Release'e (`medieval-fantasy-pack-overflow`) yükler. Değişmeyenler eski URL'lerini korur.
   2. Manifest'teki bütün URL'leri 8 paralel test eder; hepsi `302` dönmezse **yayın yapmadan durur**.
   3. `manifest.json`, `patchnotes.md` (havuzdaki metinlerden) yazar. Paket sürümünün son hanesini bir artırır (`--surum X.Y.Z` ile elle de verilebilir).
   4. Commit + push eder, `index.json`'daki `manifest_url`/`patchnotes_url`'yi bu commit'in SHA'sına sabitler, tekrar commit + push eder, jsDelivr purge çağırır.
   5. Discord **Update** kanalına yama notunu gönderir (gece kuralı: [patchnotes.md](patchnotes.md)).
7. **Paket değişmediyse:** Sadece sunucu yeniden başlar. Sürüm artmaz, Discord'a bir şey gitmez.
8. İşlenen havuz kayıtlarını `/root/pending/archive/<paket>-<zaman>-<sürüm|sunucu>.jsonl`'e taşır. `guncelle` çalışırken eklenen kayıtlar havuzda kalır.

Hata olursa havuz boşalmaz; sorun çözülüp `guncelle` tekrar çalıştırılır. Release'e yüklenmiş ama manifest'e girmemiş dosyalar zararsızdır, bir sonraki çalışmada yeniden yüklenir.

### Yeniden başlatma gerektirmeyen değişiklikler

Bazı değişiklikler canlı uygulanabilir ve "Güncelle" beklemez:

- Görevler: `ftbquests reload`
- Rütbeler: `ftbranks reload`
- `kubejs/server_scripts`: `reload`
- NPC'ler (Easy NPC `/data merge` ile)

Bunlar yine de havuza yazılır (`sunucu` türüyle; `kubejs` dosyası oyuncuya da gittiği için `paket` türüyle), çünkü bir sonraki "Güncelle"de dosyalar pakete girer ve yama notunda görünmelidir.

---

## 3. Yerel repo ile çalışırken

`guncelle` VDS'ten repoya commit atar (yazar: "Anubis VDS"). Kendi bilgisayarında repoda çalışan herkes işe başlamadan önce `git pull` yapar, yoksa push reddedilir. `distribution/<paket>/manifest.json`, `patchnotes.md` ve `index.json` **elle düzenlenmez**; onları yalnızca `guncelle` yazar.

Eski yöntem (Windows'ta `tools/anudownloader/Build-Manifest-VDS.ps1` + elle commit/pin) yalnızca `guncelle` bozulursa yedek olarak kullanılır; adımları [anudownloader.md](anudownloader.md)'de.

AnuDownloader uygulamasının **kendisini** güncellemek bu akışın dışındadır (Windows'ta derlenir). Bkz. [anudownloader.md](anudownloader.md) bölüm 5.
