# Görseller: Büyü İkonları ve NPC Dokuları

Projedeki görseller iki klasörde toplanır ve **GitHub'da tutulur**. Amaç: bir görselin ne olduğunu, nerede kullanıldığını ve nasıl değiştirileceğini repoya bakan herkes görsün.

```
assets/
├── spell-icons/   büyü ikonları
└── npc-skins/     NPC dokuları
```

---

## 1. Büyü ikonları (`assets/spell-icons/`)

Bizim yazdığımız Iron's Spells büyülerinin envanter/büyü çubuğu ikonları. Şu an:

| Dosya | Büyü | Nerede tanımlı |
|---|---|---|
| `amaterasu.png` | Amaterasu | `kubejs/startup_scripts/amaterasu_spell.js` |
| `chidori.png` | Chidori | `kubejs/startup_scripts/chidori_spell.js` |
| `rasengan.png` | Rasengan | `kubejs/startup_scripts/rasengan_spell.js` |
| `tsukiyomi.png` | Tsukiyomi | `kubejs/startup_scripts/tsukiyomi_spell.js` |
| `flashstep.png` | Shunpo (oyunda görünen ad) | `kubejs/startup_scripts/flashstep_spell.js`. Büyünün sistem adı `flashstep`, adı Shunpo; dosya sistem adıyla adlandırılır. Büyü kodunu swxff push edecek |

**Bunlar aktif olarak kullanılıyor.** Iron's Spells bir büyünün ikonunu büyünün adından bulur: `kubejs:<büyü>` büyüsünün ikonu `textures/gui/spell_icons/<büyü>.png` dosyasıdır. Bu yüzden **dosya adı büyünün KubeJS adıyla birebir aynı olmalıdır**.

Oyundaki (VDS) yeri:

```
/root/servers/medieval-fantasy/kubejs/assets/kubejs/textures/gui/spell_icons/<büyü>.png
```

`kubejs/` klasörü pakete girdiği için ikon oyunculara da bu yoldan gider.

### Kurallar

- **16×16 PNG**, şeffaf arka plan, Minecraft stiline uygun.
- **Dosya adı = büyü adı**, küçük harf, Türkçe karakter ve boşluk yok (`flashstep.png`, `flashstep_16x16_minecraft.png` değil; oyunda görünen ad Shunpo olsa bile dosya adı sistem adı `flashstep` olur). Boyut ya da "minecraft" gibi son ek eklenmez.
- Yeni ikon önce `assets/spell-icons/`'a eklenir, sonra aynı dosya VDS'teki yola konur (aynı içerik, aynı ad).
- İkonu değiştirirken iki yerde de değiştirin ve commit mesajında hangi büyünün ikonu olduğunu yazın.
- Masaüstündeki "Icons" klasörü kaynak değildir; kaynak bu klasördür.

---

## 2. NPC dokuları (`assets/npc-skins/`)

Easy NPC'lerin özel dokuları (ör. Miu ve Çamur'un gerçek kedilerine göre yapılan dokuları). Şu an:

| Dosya | NPC | Not |
|---|---|---|
| `miu_v2.png` | Miu | Gerçek kedi Miu'ya göre |
| `camur_v2.png` | Çamur | Gerçek kedi Çamur'a göre |
| `yoruichi_v1.png` | Yoruichi | İnsan formu (Alex, ince kol); swxff ekledi |

Yeni NPC dokuları (ör. Yoruichi) aynı klasöre eklenir.

### Nasıl bağlanır

NPC'nin `SkinData` bölümü GitHub'daki ham dosyaya bakar:

```
SkinData{Type:"SECURE_REMOTE_URL", URL:"https://raw.githubusercontent.com/anubissxd/minecraft-servers/main/assets/npc-skins/<dosya>.png", UUID:<aşağıya bak>}
```

**UUID**, adresin Java `UUID.nameUUIDFromBytes(URL.getBytes(UTF_8))` sonucudur. Eksik ya da yanlış olursa NPC varsayılan dokuyla görünür. `/data merge entity <npc> {SkinData:{...}}` ile verilir.

### Kurallar

- **Boyut NPC türüne göre:** kedi NPC'ler **64×32** (vanilla `tabby.png` düzeni), insan NPC'ler **64×64** (klasik oyuncu skin düzeni; Alex için ince kol).
- **Dosya adı: `<npc>_v<sürüm>.png`**, küçük harf, Türkçe karakter yok.
- **Dokuyu değiştirirken yeni bir dosya adı kullanın** (`miu_v2.png` → `miu_v3.png`). Oyuncuların oyunu adresi önbelleğe alır; aynı adla değiştirilen doku onlarda güncellenmez. Eski sürüm dosyası silinebilir ama önce NPC'nin adresi yeniye çevrilmiş olmalıdır.
- Dosya `main` dalına itilmeden NPC'ye bağlanmaz: adres çalışmıyorsa NPC dokusuz görünür.
- Standart (hazır) dokular kullanan NPC'ler için buraya dosya eklenmez; yalnızca **özel** dokular burada tutulur.

---

## 3. Ne zaman hangisi

| Ne ekliyorsun | Nereye | Sonra |
|---|---|---|
| Yeni büyü ikonu | `assets/spell-icons/<büyü>.png` | VDS'te `kubejs/assets/kubejs/textures/gui/spell_icons/` içine aynı dosya; `havuz ekle ... paket` |
| Yeni NPC dokusu | `assets/npc-skins/<npc>_v1.png`, `main`'e it | NPC'ye `SkinData` ile bağla; `docs/medieval-fantasy/characters/<npc>.md`'ye yaz |
| Değişen doku | Yeni sürüm adı (`_v2` → `_v3`) | NPC adresini yeniye çevir |

---

## 4. Karakter dosyasında gösterim

Özel dokusu olan her NPC için `docs/medieval-fantasy/characters/<npc>.md` dosyasında, özellik listesinin hemen altında bir **`## Skin / Texture`** bölümü olur: dokunun görseli (`<img ... width="256">`, küçük olduğu için büyütülmüş), dosya bağlantısı, boyutu ve oyunda nasıl bağlandığı. Yeni özel doku eklendiğinde bu bölüm de aynı işte eklenir. Örnek: [miu.md](medieval-fantasy/characters/miu.md).
