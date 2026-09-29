# Anubis Bust

Medieval Fantasy için **client-only** Forge 1.20.1 modu. Seçilen Easy NPC insan NPC'lerine (`humanoid`, `humanoid_slim`) **hacimli göğüs** çizer. Wildfire'ın Female Gender modu Easy NPC'de çalışmadığı için (katmanı yalnızca oyuncu çizicisine ekliyor) yazıldı.

> **Durum (2026-09-30): derlendi, ama oyunda HİÇ denenmedi.** VDS'te oyun istemcisi yok; yalnızca derleme, jar içeriği ve doku örnekleme görseli doğrulandı. Çizim kodu hata verirse mod kendini kapatır ve `latest.log`'a yazar (oyunu çökertmez). **Pakete konmadı.** Önce bir istemcide denenecek.

## Nasıl çalışır

- Açılışta `easy_npc` ad alanındaki tüm varlık türlerinin çizicilerine bir `RenderLayer` ekler (`ClientSetup`).
- Katman her NPC için `bust.json`'a bakar. NPC'nin **skin adresi** (`getSkinURL`, yansıma ile okunur) veya özel adı kayıttaki `match` metnini içeriyorsa çizer.
- Gövde kemiğine (`body`) iki kutu çizer, yani eğilme/poz/animasyonu izler. Doku NPC'nin **kendi skin'idir**: kutunun ön yüzü skin'deki göğüs pikselleri (taban `(20,22)`-`(28,26)`, jacket kopyası `+16` satır aşağısı). Renkler otomatik uyumludur.
- Fizik: dikey hareket ve yürüme döngüsüyle sürülen basit yay (tick başına adım, kare başına ara değer). Kapatılabilir.
- NPC zırh giyiyorsa (`hideWithChestplate`) çizilmez; görünmezken de çizilmez.
- 64×64 skin (Steve/Alex) varsayılır. 64×32 eski skin'de çalışmaz.

## `bust.json` (kurulum)

Yeri: oyuncuda `kubejs/assets/anubis_bust/bust.json` (paketle gelir; KubeJS klasörü kaynak paketi olarak yüklenir). Örnek: [`bust.json.ornek`](bust.json.ornek). Dosya yoksa hiçbir NPC göğüs almaz.

| Alan | Anlamı | Varsayılan |
|---|---|---|
| `match` | Skin adresinde/adında aranacak küçük harfli metin (`yoruichi` → `yoruichi_v1.png`, `_v2` de uyar) | zorunlu |
| `width`, `height`, `depth` | Boyut çarpanı (1.0 = her yan 4×4×2 piksel) | 1.0 |
| `spread` | İki yan arası ek açıklık, piksel (eksi = birbirine yakın) | 0 |
| `y`, `z` | Varsayılan konumdan kayma, piksel | 0 |
| `tilt` | Aşağı eğim, derece | 8 |
| `overlay` | Skin'in jacket (üst katman) kopyasını da çiz | true |
| `physics`, `physicsAmount` | Yay hareketi açık/kapalı, şiddeti | true, 1.0 |
| `hideWithChestplate` | NPC göğüslük giyiyorsa çizme | true |

Değişiklik oyunda `F3+T` (kaynakları yeniden yükle) ile uygulanır.

## Test (kullanıcı)

1. `anubis-bust-1.0.0.jar` → deneme profilinin `mods/`'una. (Yerel Modrinth profiline dosya koymak **senin kararın**; Claude dokunmaz.)
2. `bust.json.ornek` → aynı profilde `kubejs/assets/anubis_bust/bust.json`.
3. Yoruichi'ye bak. `logs/latest.log`'da şu satırlar olmalı: `[anubis_bust] N Easy NPC renderer(s) got the bust layer`, `bust.json loaded: 1 entry`, `drawing bust for NPC ...`.
4. Görünmüyorsa: log'da `render failed` var mı? Yoksa `match` metni skin adresine/adına uyuyor mu? Boyutlar (`width/height/depth`) ve konum (`y`, `z`) `bust.json`'dan ayarlanır; jar yeniden derlenmez.

Beklenen bilinmeyenler (ilk denemede bakılacak): sağ/sol kutunun hangi göğüs yarısını örneklediği (skin simetrikse fark yok), eğim yönü (`tilt` eksi/artı), NPC'nin `disableLayers` seçeneği, ışık/şeffaflık.

## Derleme

Ortam: Java 17, ForgeGradle 6, `net.minecraftforge:forge:1.20.1-47.4.20`, resmi eşlemeler; dış bağımlılık yok (Easy NPC yansımayla okunur).

```bash
mkdir -p /root/dev/bust && cd /root/dev/bust      # gradle/, gradlew: anubis-dashhud projesinden kopyalanır
JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 ./gradlew build --offline
# çıktı: build/libs/anubis-bust-<sürüm>.jar
```

Yeni VDS'te ilk derleme internet ister (`--offline` olmadan; Forge/mapping indirir, ~1 GB `~/.gradle`). `anubis-dashhud` ile aynı düzen: bkz. [../anubis-dashhud/README.md](../anubis-dashhud/README.md).

Pakete koymak (denendikten ve Anubis onayladıktan sonra): jar → sunucuda `client-extra/mods/`, `bust.json` → sunucuda `kubejs/assets/anubis_bust/bust.json`, sonra `havuz ekle ... paket` ve "Güncelle".
