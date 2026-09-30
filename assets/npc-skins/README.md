# NPC dokuları

Bütün özel NPC dokuları bu klasördedir; oyunda GitHub ham adresi üzerinden yüklenir (`SkinData` `SECURE_REMOTE_URL`). Bir dokuyu değiştirirken **yeni sürüm adı** kullan (`_v2`), aksi halde önbellek eski dokuyu gösterir. Kurallar: [docs/assets.md](../../docs/assets.md).

| Önizleme | Dosya | Karakter | Kol | Not |
|---|---|---|---|---|
| <img src="camur_v2.png" width="96"> | `camur_v2.png` | Çamur | — | Kedi |
| <img src="miu_v2.png" width="96"> | `miu_v2.png` | Miu | — | Kedi |
| <img src="erwin_v1.png" width="96"> | `erwin_v1.png` | Erwin Smith | klasik | |
| <img src="yoruichi_v1.png" width="96"> | `yoruichi_v1.png` | Yoruichi | ince | |
| <img src="kakashi_v1.png" width="96"> | `kakashi_v1.png` | Kakashi | klasik | |
| <img src="itachi_v1.png" width="96"> | `itachi_v1.png` | Itachi | klasik | |
| <img src="thorfinn_v1.png" width="96"> | `thorfinn_v1.png` | Thorfinn | klasik | |
| <img src="kenpachi_v1.png" width="96"> | `kenpachi_v1.png` | Kenpachi | klasik | Orijinal 64×32 (eski biçim) idi; vanilla'nın eski-doku dönüşümüyle 64×64'e çevrildi |
| <img src="gojo_v1.png" width="96"> | `gojo_v1.png` | Gojo | klasik | |
| <img src="aizen_v1.png" width="96"> | `aizen_v1.png` | Aizen (yardımsever hâli) | klasik | swxff verdi. Olaydan önce kullanılır |
| <img src="aizen_v2.png" width="96"> | `aizen_v2.png` | Aizen (kötü hâli) | klasik | Şimdilik `aizen_v1.png` ile aynı dosya; farklı bir doku verilirse bu dosya değiştirilir (yeni sürüm adı: `aizen_v3.png` ve `aizen.js` içindeki adres). İhanet olayında NPC bu dokuya geçer |

Yeni doku eklerken dosyayı buraya `<karakter>_v1.png` adıyla koy ve bu tabloya bir satır ekle.
