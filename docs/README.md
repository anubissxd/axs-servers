# Dokümantasyon

Bu klasör projede çalışan **herkesin** (Anubis, swxff ve ikisinin Claude'u) sistemi, kuralları ve yarım kalan işleri unutmaması için var. Yeni bir oturuma başlayan Claude önce bu dosyayı, sonra işine göre ilgili dosyayı okur.

Bir sistemi değiştirdiğinde (yeni script, yeni kural, yeni klasör) ilgili doküman **aynı işte** güncellenir. Doküman kod kadar önemlidir.

## Kim kimdir

| Kişi | GitHub | Minecraft | VDS SSH anahtarı | Rol |
|---|---|---|---|---|
| Anubis | `anubissxd` (repo sahibi) | `Anubissxd` | `vds-raven` | Proje sahibi, OP |
| swxff | `swaffX` (write yetkili) | `swxff` | `swxff medieval-fantasy-vds` | Geliştirici, OP 4 |

İkisi de VDS'e `root` olarak **anahtarla** bağlanır. Şifre hiçbir zaman otomatik kullanılmaz; yeni kişi için `.pub` anahtarı istenir, özel anahtar (private key) asla paylaşılmaz.

## Hangi dosya ne anlatır

| Dosya | Konu |
|---|---|
| [vds.md](vds.md) | VDS: sunucu, servis, klasörler, script'ler, cron, yedekler, konsola komut gönderme |
| [guncelleme-akisi.md](guncelleme-akisi.md) | **Değişiklik havuzu ve "Güncelle" komutu** — iki kişinin değişikliklerinin tek seferde sunucuya + AnuDownloader'a + Discord'a gitmesi |
| [patchnotes.md](patchnotes.md) | Yama notları: nerede durur, nasıl yazılır, Discord duyurusu, gece kuralı |
| [anudownloader.md](anudownloader.md) | AnuDownloader uygulaması, manifest, paket içeriği, uygulamanın kendisini güncelleme |
| [assets.md](assets.md) | **Görseller:** büyü ikonları (`assets/spell-icons/`) ve NPC dokuları (`assets/npc-skins/`): kurallar, adlandırma, nasıl bağlanır |
| [medieval-fantasy/quest.md](medieval-fantasy/quest.md) | Evren, rütbeler, FTB Quests / Easy NPC teknik detayları. **Görev eklemeden önce okunur.** |
| [medieval-fantasy/characters/](medieval-fantasy/characters/) | NPC'ler (isim, konum, UUID, diyalog) |
| [medieval-fantasy/kingdoms/](medieval-fantasy/kingdoms/) | Krallıklar |
| [medieval-fantasy/stories/](medieval-fantasy/stories/) | Hikâyeler |

Genel proje kuralları (sunucuların bağımsızlığı, mod ekleme/kaldırma, yedek politikası) repo kökündeki `CLAUDE.md`'dedir.

## En önemli kurallar (özet)

1. **VDS tek kaynaktır.** Sunucu da oyuncu paketi de `/root/servers/medieval-fantasy`'den gelir. Kimsenin yerel Modrinth profiline dosya koyulmaz.
2. **Her değişiklik havuza yazılır.** Sunucuda bir şey değiştiren herkes (veya Claude'u) hemen `havuz ekle ...` çalıştırır. Havuzda olmayan değişiklik yama notunda çıkmaz. → [guncelleme-akisi.md](guncelleme-akisi.md)
3. **Yeniden başlatma ve yayın sadece "Güncelle" ile.** Anubis veya swxff "Güncelle" demeden sunucu yeniden başlatılmaz, paket yayınlanmaz, duyuru atılmaz. "Güncelle" deyince tek komut (`guncelle`) hepsini yapar.
4. **Sadece istenen adım yapılır.** Diyalog, NPC metni, görev metni gibi içerik istenmeden yazılmaz.
5. **Gizli bilgiler repoya girmez.** Discord webhook adresleri ve GitHub token'ı yalnızca VDS'te durur.
6. **Mod tarafı tahminle seçilmez.** Client/server ayrımından önce ağ kanalı ve kayıtlar (registry), mod kaldırmadan önce coremod ve mixin'ler kontrol edilir. → [anudownloader.md](anudownloader.md)
7. **Dünyada riskli iş öncesi yedek.** `/root/backups/medieval-fantasy/<tarih>-<neden>` → [vds.md](vds.md)

## Yarım kalan işler

Bir iş yarım kalırsa buraya yazılır, bitince silinir. Böylece öbür kişi (veya Claude'u) nerede kalındığını görür.

- **Oyuncu sıfırlama (2026-09-28):** Anubissxd ve swxff karakterleri sıfırlandı (yedek: `/root/backups/medieval-fantasy/2026-09-28-before-player-reset`). Oyuncu dosyaları silindi, FTB Ranks rütbeleri kaldırıldı, swxff'in OP'si alındı. Görev ilerlemesi ve yetenek ağaçları sunucu belleğinde durduğu için `kubejs/server_scripts/anubis_player_reset.js` ikisinin **ilk girişinde** bunları komutla sıfırlar. İkisi de girip logda `ANUBIS_RESET tamamlandi` görüldükten sonra bu dosya silinir (sonraki "Güncelle"den önce).
- **Yoruichi / Shunpo (2026-09-29):** Dosyalar VDS'e kopyalandı ama sunucu yeniden başlatılmadı (startup script + paket yayını "Güncelle" ile). "Güncelle" sonrası Yoruichi'yi kurmak için [yoruichi.md](medieval-fantasy/characters/yoruichi.md) "VDS kurulum durumu"nu izle.
