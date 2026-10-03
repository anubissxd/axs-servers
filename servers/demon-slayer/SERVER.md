# Demon Slayer

Minecraft Version: 1.20.1
Mod Loader: Forge 47.4.20
Java Version: 17
Durum: **Client paketi (Modrinth + CurseForge profili).** VDS'e henüz taşınmadı, sunucu kurulumu yok.

## Amaç

Arkadaş grubuyla Demon Slayer temalı, animasyonlu ve Epic Fight savaşlı oyun. Tek bir Demon Slayer modu temel alınır (Orca'nın Kimetsu no Yaiba'sı), üzerine Epic Fight eklenir.

## Önemli Modlar

- Kimetsu no Yaiba (Orca) `KimetsunoYaiba-ver3`: temel mod (Geckolib + Player Animator)
- Epic Fight 20.14.17 + Epic Fight Compat Suite (`efcompat`, CurseForge profilinde var, Modrinth profilinde şu an yok)
- Weapons of Miracles 2.0.171, `kxecomp` (Kimetsu X EpicFight: silah izleri ve ek silah türleri), Rapier Moveset Addon (`refm`)
- KnY Extra Additions + `kimetsunoyaibamultiplayer` + `kny_worlds`
- Paxi (global datapack ve resourcepack yükleyici) + YUNG's API

Tam liste: [mods.md](mods.md), [mods.json](mods.json) (sha1/sha512 ile). Jar'lar repoda yok.

## Bu repodaki içerik

- `configs/`: profilin `config/` klasörü. `configs/paxi/` içinde **bizim yazdığımız** düzeltme paketleri:
  - `datapacks/ef_kny_weapons`: eski "EpicKimetsuNoYaiba" modunun silah türleri ve skill'leri, WOM 2.0 ile çökmeyecek şekilde düzeltilmiş.
  - `datapacks/kxe_wom_fix`: `kxecomp`'un WOM Satsujin animasyonlarını (oyuncuda pasif skill yokken çöküyor) Epic Fight karşılıklarıyla değiştirir.
  - `datapacks/kxe_geo_mobs_off`: GeckoLib renderer'lı 28 Orca mobunun Epic Fight tanımını kapatır (EF afterimage partikülü çöküyor).
  - `resourcepacks/Breathing Animation Fix`: Orca nefes animasyonlarında karakterin donmasını düzeltir (uzun `animation_length` değerleri kısaltıldı, ayrıntı `DEGISIKLIKLER.txt`).
  - `resourcepacks/Extra Additions Fix`: KnY Extra Additions'ın Orca'nın animasyon dosyasını (95 animasyon) 26'ya indirmesini engeller, sadece naginata animasyonlarını ekler.

## Notlar ve bilinen sorunlar

- Orca'nın mob tanımları Epic Fight'ta kapalı (çökme). Mobların savaşı Orca'nın kendi yapay zekâsıyla.
- WOM 2.0.171'in bazı animasyonları oyuncuda WOM'un pasif skilli yokken çöküyor. Tehlikeli 29 animasyon tarandı, kullanılanlar değiştirildi (bkz. `kxe_wom_fix`, `ef_kny_weapons`).
- `kxecomp` 0.4 bitmemiş: Iguro, Kanroji, Rengoku vb. `kxe:test` geçici türünde.
- Modrinth uygulamasındaki `EpicKimetsuNoYaiba` kaydı veritabanından silindi (dosya değiştirilmişti). Bu mod artık kullanılmıyor, yalnızca silah verileri `ef_kny_weapons` olarak taşınıyor.
- Dünya `New World` bu modlarla oluşturuldu. `kimetsunoyaibamultiplayer` / `kny_worlds` sonradan çıkarılırsa dünya açılmayabilir (önce yedek alın).
- Nichirin kılıçları için yazılan 2D sprite paketi ("Nichirin Texture") kaldırıldı, yedeği yalnızca Anubis'in bilgisayarında.
