# EldenCraft

Minecraft Version: 1.20.1
Mod Loader: Forge 47.4.20
Java Version: 17
Durum: **Client paketi (Modrinth + CurseForge profili).** VDS'e henüz taşınmadı, sunucu kurulumu yok.

## Amaç

Iron's Spells 'n Spellbooks ve eklentileri ile Epic Fight ve eklentilerini aynı pakette çalıştıran büyü + yakın dövüş paketi. Arkadaşın beğendiği Epic Fight modları da (TLSkinCape hariç) eklendi.

## Önemli Modlar

- Iron's Spells 'n Spellbooks ve popüler eklentileri (Create Wizardry kurulmadı)
- Epic Fight 20.14.17 ve eklentileri (Nightfall, Combat Evolution 2.3.0, Epic Foes vb.)
- Arkadaşın modları (`C:\...\Desktop\mods`): 3D modelli silah modları, ek skill ve hareket modları
- BielGG Spells Experience: `config/bielgg_spells-experience.properties` içinde `mode=patches_only` (Apprentice's Codex ile `mod_content` modu çakışıyor)

Tam liste: [mods.md](mods.md), [mods.json](mods.json). 5 mod `.disabled` olarak duruyor (BattleArts, BattleartsApi, gliders, palladium, epic_parcool_momentum). Jar'lar repoda yok.

## Notlar

- Epic Fight 20.14.17, ExCap'i kaldırdığı için Battle Arts ile çakışıyor, ikisi bu yüzden kapalı. Epic Foes en az 20.14.17 ister.
- Atlas Additions ve Wizard Samurai VDS testinde çöktüğü için pakette yok. Impactful uyumsuz.
- Modrinth ve CurseForge profilleri birbirinin aynısıdır (78 aktif jar). Bir profile mod eklenince diğerine de eklenir.
- `configs/`: profilin `config/` klasörü. Dünya (`saves`) ve loglar repoda yok.
