# assets

Projenin görselleri. **Her görsel ya `spell-icons/` ya da `npc-skins/` altında durur.** Kurallar ve neden: [docs/assets.md](../docs/assets.md).

| Klasör | Ne | Oyunda nereye gider |
|---|---|---|
| [spell-icons/](spell-icons/) | Bizim eklediğimiz Iron's Spells büyülerinin ikonları (16×16 PNG) | Sunucuda `kubejs/assets/kubejs/textures/gui/spell_icons/`; paketle oyuncuya gider |
| [npc-skins/](npc-skins/) | Easy NPC'lerin özel dokuları (kedi 64×32, insan 64×64) | NPC'ye GitHub ham adresiyle bağlanır (`SkinData.URL`) |

Bu klasörlerdeki dosyaları **elle oyuna kopyalamayın**: kaynak burasıdır, oyundaki kopya buradan alınır.
