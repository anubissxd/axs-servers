# Dokümantasyon

Bu klasör projede çalışan **herkesin** (Anubis, swxff ve ikisinin Claude'u) sistemi, kuralları ve yarım kalan işleri unutmaması için var. Yeni bir oturuma başlayan Claude önce bu dosyayı, sonra işine göre ilgili dosyayı okur.

Bir sistemi değiştirdiğinde (yeni script, yeni kural, yeni klasör) ilgili doküman **aynı işte** güncellenir. Doküman kod kadar önemlidir.

## Hangi dosya ne anlatır

| Dosya | Konu |
|---|---|
| [vds.md](vds.md) | VDS: sunucu, servis, klasörler, script'ler, cron, yedekler, konsola komut gönderme |
| [guncelleme-akisi.md](guncelleme-akisi.md) | **Değişiklik havuzu ve "Güncelle" komutu** — iki kişinin değişikliklerinin tek seferde sunucuya + AnuDownloader'a + Discord'a gitmesi |
| [lokal-dunya.md](lokal-dunya.md) | **VDS dünyasını tek oyunculu modda çalışmak**: yedeği indirme, oyuncu verisini aktarma, VDS'e geri taşıma |
| [vds-aktarma-notlari.md](vds-aktarma-notlari.md) | **Singleplayer'da geliştirilenlerin yeni VDS'e aktarma listesi**: değişen dosyalar, sıra, havuz cümleleri |
| [patchnotes.md](patchnotes.md) | Yama notları: nerede durur, nasıl yazılır, Discord duyurusu, gece kuralı |
| [anudownloader.md](anudownloader.md) | AnuDownloader uygulaması, manifest, paket içeriği, uygulamanın kendisini güncelleme |
| [npc-diyalog.md](npc-diyalog.md) | **NPC cevapları diyalog penceresinde**: nasıl çalışır, hangi NPC neyi diyalogda verir, bilinen tuzaklar |
| [assets.md](assets.md) | **Görseller:** büyü ikonları (`assets/spell-icons/`) ve NPC dokuları (`assets/npc-skins/`): kurallar, adlandırma, nasıl bağlanır |
| [vds-tasima.md](vds-tasima.md) | **VDS taşıma / felaket kurtarma:** yedek nerede (GitHub release, şifreli), parola nerede, yeni VDS'te sırayla geri kurulum, yeni IP'de değişecekler |
| [medieval-fantasy/quest.md](medieval-fantasy/quest.md) | Evren, rütbeler, FTB Quests / Easy NPC teknik detayları. **Görev eklemeden önce okunur.** |
| [medieval-fantasy/test-erwin-hocalar.md](medieval-fantasy/test-erwin-hocalar.md) | Erwin ve Kakashi/Itachi için **gerçek oyun test listesi** (henüz oynanmadı) |
| [medieval-fantasy/characters/](medieval-fantasy/characters/) | NPC'ler (isim, konum, UUID, diyalog) |
| [medieval-fantasy/kingdoms/](medieval-fantasy/kingdoms/) | Krallıklar |
| [medieval-fantasy/stories/](medieval-fantasy/stories/) | Hikâyeler |

Genel proje kuralları (sunucuların bağımsızlığı, mod ekleme/kaldırma, yedek politikası) repo kökündeki `CLAUDE.md`'dedir.

## Şu an neredeyiz (2026-09-30, devir teslim)

Yeni oturuma başlayan Claude (Anubis'in veya swxff'in) önce burayı okur.

- **VDS yok.** Eski VDS silindi, yenisi gelmedi. Sunucuda hiçbir şey yapılamaz; "Güncelle" ve yayın yeni VDS ayağa kalkana kadar bekler. Yeni VDS gelince: [vds-tasima.md](vds-tasima.md), ardından [vds-aktarma-notlari.md](vds-aktarma-notlari.md).
- **Geliştirme yerelde.** swxff, VDS yedeğinden kurulan tek oyunculu dünyada çalışıyor (`saves/Medieval Fantasy VDS`, [lokal-dunya.md](lokal-dunya.md)). Buradaki KubeJS dosyalarının kopyası repoda: [tools/kubejs-yerel/](../tools/kubejs-yerel/README.md). NPC ve dünya değişiklikleri repoya girmez, yalnızca dokümanda izlenir.
- **Son paket yayını:** 1.3.7 (2026-09-29). Sonrası yayınlanmadı: Watut/CoroUtil, Thorfinn, Kenpachi, Gojo, hocalar, Aizen.
- **Üzerinde çalışılan iş:** NPC diyalog ve Shunpo sisteminin oyunda test edilmesi ([npc-diyalog.md](npc-diyalog.md), test listesi bölüm K-L). Yalnızca Erwin'in cevap ve teklif diyalogları oyunda çalıştığı görüldü; diğer NPC'ler yazıldı ama denenmedi. Aizen -1307, 80, -393'e yerleştirildi, Shunpo karşılaması denenmekte.
- **Sıradaki büyük iş:** Yeni VDS'e taşıma. Havuz cümleleri [vds-aktarma-notlari.md](vds-aktarma-notlari.md) §3 ve Aizen bölümünde, yeni VDS'te yazılacak.
- **Kim ne yapıyor:** swxff yerel oynanış geliştirmesi (NPC, hikâye, büyü); Anubis altyapı, VDS ve paket yayını (yedek, taşıma, göğüs modu).

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

- **Depo adı değişti (2026-10-01):** GitHub deposu `anubissxd/minecraft-servers` → **`anubissxd/axs-servers`**. Eski adres (git, raw dosyalar, release) yönlendirmeyle çalışmaya devam ediyor, bu yüzden hiçbir şey bozulmadı. Henüz eski adı kullananlar: `distribution/` altındaki manifest/index URL'leri, `tools/anudownloader/*.ps1` (uygulama güncelleme ve manifest yolları), `tools/vds/guncelle.py`, NPC üreticileri (`tools/yoruichi/gen_*.js` doku URL'leri), dünyadaki NPC doku adresleri ve docs/CLAUDE.md metinleri. Bunları yeni ada çevirmek bir AnuDownloader sürümü ve manifest yeniden üretimi gerektirir; Anubis karar verene kadar eski ad bırakıldı. Yerel `git remote` yeni adresle güncellendi; VDS'teki repo kopyasında (`/root/repo`) yeni VDS'te `git remote set-url origin https://github.com/anubissxd/axs-servers` yapılır.
- **VDS taşıma (2026-09-30, ACİL):** Eski VDS (`31.58.91.7`) silinecek. Sunucu kapatıldı (2026-09-29 22:31 UTC), her şey şifreli olarak GitHub release `vds-yedek-2026-09-30`'a yedeklendi, kod ve ayarlar repoda `tools/vds/altyapi/`. **Yeni VDS gelene kadar bekle**, sonra [vds-tasima.md](vds-tasima.md) 2. bölümü izle. Parola Anubis'in bilgisayarında (`Desktop\Anubis\VDS-Yedek-Anahtar.txt`), repoda yok. Yeni IP'de değişecekler aynı dosyanın 3. bölümünde.
- **What Are They Up To (Watut) + CoroUtil (2026-09-29):** Sunucuya kuruldu (`mods/`, her iki tarafta gerekli), sunucu yükledi (hata yok), havuzda kayıtlı. **Henüz yayınlanmadı** (Güncelle bekliyor; yeni VDS'te önce sunucu ayağa kalkmalı). Client tarafı VDS'te denenemedi: oyuncu modelini/animasyonunu değiştirir, `mobplayeranimator`/`emotes` gibi modlarla çakışma ihtimali var. Yayından sonra bir oyuncuyla bakılacak, sorun çıkarsa `remove.txt`/paketten çıkarma kararı Anubis'te.
- **Göğüs hacmi / NPC (2026-09-30):** Wildfire'ın Female Gender modu Easy NPC'ye uygulanmaz (katmanı yalnız oyuncu çizicisine ekliyor). Bunun yerine kendi client modumuz yazıldı ve derlendi: [tools/anubis-bust/](../tools/anubis-bust/README.md) (jar repoda). **Oyunda denenmedi, pakete konmadı.** Sıradaki adım: Anubis jar'ı ve `bust.json.ornek`'i kendi deneme profilinde dener (adımlar mod README'sinde), sonucu söyler; boyut/konum `bust.json`'dan ayarlanır. Beğenilirse `client-extra/mods/` + `kubejs/assets/anubis_bust/bust.json` + havuz + "Güncelle".
- **Oyuncu sıfırlama (2026-09-28):** Anubissxd ve swxff karakterleri sıfırlandı (yedek: `/root/backups/medieval-fantasy/2026-09-28-before-player-reset`). Oyuncu dosyaları silindi, FTB Ranks rütbeleri kaldırıldı, swxff'in OP'si alındı. Görev ilerlemesi ve yetenek ağaçları sunucu belleğinde durduğu için `kubejs/server_scripts/anubis_player_reset.js` ikisinin **ilk girişinde** bunları komutla sıfırlar. İkisi de girip logda `ANUBIS_RESET tamamlandi` görüldükten sonra bu dosya silinir (sonraki "Güncelle"den önce).
- **Yan görevler (2026-10-01):** Kakashi, Itachi ve Yoruichi'nin 5'er yan görevi yazıldı (haber, iz, av, topla, ulas), oyunda denenmedi: [yan-gorevler.md](medieval-fantasy/yan-gorevler.md). Gojo pasif olduğu için dışarıda.
- **Erwin, Kakashi, Itachi (2026-09-29):** Erwin'in Keşif Birliği seferleri VDS'te canlı; Kakashi (Chidori, -786.5 72 -331.5) ve Itachi (Amaterasu, Tsukiyomi, -805.5 72 -475.5) VDS'te kuruldu, dokuları ve diyalogları var. Hiçbiri gerçek oyuncuyla test edilmedi: [test-erwin-hocalar.md](medieval-fantasy/test-erwin-hocalar.md). Erwin ve hoca havuz kayıtları bir sonraki "Güncelle"de gider.
- **Yoruichi / Shunpo (2026-09-29):** VDS'te canlı ve L1–L3 swxff tarafından denendi; ayrıntı [yoruichi.md](medieval-fantasy/characters/yoruichi.md). Açık kararlar (aynı dosyada "Açık konular"): kayıp parşömen yeniden alma, `rank_vloryan` şartı, PvP stun/hasar, FTB Quests keşif görevi. Yeni büyü ve ücret gibi oyuncuya dönük değişiklikler havuzda; bir sonraki "Güncelle"de yama notuna girer.
- **Yerel geliştirme, VDS'e taşınmadı (2026-09-30, swxff):** Thorfinn (ticaret, nöbet, ikmal, hayvancılık, mevsim, hikâye), Kenpachi (kapışma, Nozarashi, Shunpo), Gojo (Blue/Red/Purple; öğretim kapalı), hocaların dönen karşılama replikleri ve **Aizen** (5 perdelik hikâye, Kyōka Suigetsu) yerel tek oyunculu dünyada yapıldı. Kubejs script'lerinin kopyası [tools/kubejs-yerel/](../tools/kubejs-yerel/README.md) altındadır (asıl dosyalar yerel profilde `%APPDATA%.minecraftersionsMedieval Fantasykubejs`). Dosya listesi ve sıra: [vds-aktarma-notlari.md](vds-aktarma-notlari.md). Havuz cümleleri orada (§3 ve Aizen bölümü), yeni VDS'te yazılacak.
- **Aizen (2026-10-01):** Yerel dünyada -1307, 80, -393'e yerleştirildi (`/aizen_yer`). Denenecekler: Shunpo karşılaması (3,5-6 blok, aynı kat), diyalog cevapları, perdeler (`/aizen_evre 2-5`), boss kapışması. Test: [test-erwin-hocalar.md](medieval-fantasy/test-erwin-hocalar.md) bölüm J.
- **NPC diyalog ve Shunpo (2026-10-01):** Tüm NPC konuşmaları sohbet yerine diyalog penceresinde (kapışma içi replikler ekran altında); NPC hareketleri Shunpo efektiyle (`npc_shunpo.js`). Kenpachi'nin yerinde görünmediği bildirildi (kayıtta yerinde, nedeni araştırılıyor). Oyuncuya dönük değişiklikler (altın elma/havuç kaldırıldı, sefer teklifleri diyalogda) yeni VDS'te havuza yazılacak.
