# Aizen

*(Sistem yazıldı ve simülasyonda test edildi; NPC oyunda kurulmadı, gerçek oyunda test edilmedi.)*

- **Tür:** İnsan (easy_npc:humanoid, klasik kol). Etiketleri: `korunan`, `aizen_npc`. NPC uuid'si `727d69ef-1a95-4410-912e-287eed99b61a` (üreticinin çıktısı; kurulumdan sonra `data get entity @e[tag=aizen_npc,limit=1] UUID` ile doğrula).
- **Konum:** Kurulumu **komutu çalıştırdığın yere** yapar (koordinat verilmedi): NPC'nin duracağı yerde dururken `function yoruichi:aizen_kur`. Sonra istersen `/tp @e[tag=aizen_npc,limit=1] <x> <y> <z>` ile taşırsın; script konumu yüklüyken 30 sn'de bir kaydeder.
- **Krallık:** Caddy (önerilen). Bir yardımsever âlim olarak Erwin ve Thorfinn'in yanında güvenilir görünür.
- **Konsept:** Bleach'teki Aizen: nazik ve bilge görünür, aslında her şeyi baştan kurmuştur. Sunucu **geneli** bir olayla maskesini düşürür ve boss olur.
- **İlişkiler:** Erwin, Kenpachi ve diğerleri ihanet sahnesinde tepki verir. Gizli rolü oyunculara erken açık edilmez.

## Skin / Texture

- **Dosyalar:** [`assets/npc-skins/aizen_v1.png`](../../../assets/npc-skins/aizen_v1.png) (yardımsever hâli) ve `aizen_v2.png` (kötü hâli; şimdilik aynı dosya). Detay: [assets/npc-skins/README.md](../../../assets/npc-skins/README.md).
- **Oyunda:** `SkinData` `SECURE_REMOTE_URL`. İhanet olayında NPC `v1`'den `v2`'ye ve isim rengi altın kahveden mora geçer.

## Evreler (sunucu geneli)

Sunucunun evresi dünya verisinde (`server.persistentData` `aizen_evre`) tutulur; **yönetici belirler**. Script her oyuncuya evreye uygun etiketi verir (`aizen_st_1..4`); diyalog yönlendirmesi bu etiketle yapılır.

| Evre | Anlamı | Aizen |
|---|---|---|
| **1** | Yardımsever | Bilgi, günlük çay, küçük araştırma görevleri |
| **2** | Şüphe (ince tuhaflıklar) | Aynı hizmetler ama diyaloglarda soğuk tuhaflıklar, "Bir şey fark ettim..." düğmesi |
| **3** | İhanet olayı (geçiş) | Herkese sinematik sahne; ~16 sn sonra evre 4 olur, doku değişir |
| **4** | Kötü | Yardım/araştırma kapanır; "Seninle savaşacağım", "Neden yaptın?", "Gerçekte kimsin?" |

Komutlar (op): `/aizen_evre <1-4>` (3 verilince ihanet olayı oynar ve evre 4'e geçer; 1-2 verilince yardımsever doku), `/aizen_sifirla <oyuncu>`, `/aizen_odul <oyuncu>` (büyü kayıtlı olduğunda Kyōka Suigetsu parşömenini verir). Oyun olayın ortasında kapanırsa evre 3'te takılmaz (script bunu evre 4'e çeker). Olay sırasında çevrimdışı olan oyuncu girişte "Sen yokken..." notunu görür.

### Evre 1-2: yardımsever Aizen

- **Bilgi:** Oyuncunun Erwin rütbesine göre gerçekten işe yarar bir ipucu (kime gidilir, ne açıldı). Evre 2'de ipucuna ürkütücü bir ek cümle eklenir.
- **Yardım:** 6 saatte bir "Aizen'in çayı": 30 sn yenilenme, doygunluk ve 4 altın havuç.
- **Araştırma (gözlem):** Küçük öldürme görevi (zombi, iskelet, örümcek, creeper, enderman, yağmacı, mezarlık yaratığı; 3-14 adet). Ödül **1-2 zümrüt**. Günde 5, arada 4 dakika. Tamamlanan görev sayısı 1, 3, 5, 8, 12, 16'ya ulaşınca Aizen'in "notları" açılır: ilk ikisi masum, sonrakiler giderek tuhaflaşır (ipuçları).
- **Kimsin sen?:** Evreye göre farklı yanıtlar.
- **Bir şey fark ettim... (evre 2):** Aizen ustaca geçiştirir; 3 kez sorup 8 araştırma tamamlamış olan oyuncuya "Zeki birisin. Bunu başkasına söyleme." der.

### Evre 3: ihanet olayı

Herkese aynı anda: gök gürültüsü, kararma, "BİR ŞEY DEĞİŞTİ", Erwin ve Kenpachi'nin tepkisi, "AIZEN — Gözlük düştü" başlığı, ruh parçacıkları ve Aizen'in "Bu düzeni ben kurdum" sözü. Doku değişimi 9,5. saniyede, evre 4'e geçiş 16,5. saniyede. Doku komutları, NPC yüklü olmasa da çalışsın diye kayıtlı konumun yığını geçici yüklenir (`forceload`).

### Evre 4: boss kapışması (`aizen.js`, Kenpachi'nin motoruna benzer)

- **Koşul:** Evre 4 ve Erwin'de **Eşik Muhafızı**. Aynı anda tek kapışma; yenilgide 3 dk, zaferde 10 dk bekleme.
- **Savaşçı:** Aynı dokuyla ayrı Easy NPC (`aizen_fighter`), canı **450**, zırhı 10. Orijinal Aizen yer altına gizlenir, sonra geri gelir.
- **Yakın vuruş:** 8 hasar (evre 3'te 10), 1,6 sn arayla. **Shunpo:** 12 bloktan uzaklaşırsan arkana ışınlanır.
- **Kido:** 5-14 blok arasında 6 büyü hasarı (mor parçacık ışını), 4 sn arayla.
- **Evre 2 (can %66 altı) — Kyōka Suigetsu:** 22 sn'de bir kısa mide bulantısı ve körlük; gerçek Aizen 6 sn görünmez olur ve arkana geçer; etrafında **3 sahte Aizen** (1 canlı, parlayan) belirir, 10 sn sonra silinir. Sahteye vurmak körlük ve yavaşlık verir.
- **Evre 3 (can %33 altı) — Kurohitsugi:** 15 sn'de bir işaretlenen noktadan 2,2 sn içinde uzaklaşmazsan 14 hasar ve yavaşlık.
- **Bitiş:** Ölürsen, 160 blok uzaklaşırsan, çıkarsan ya da 15 dk geçerse Aizen kazanır. Öldürürsen **ilk seferde Kyōka Suigetsu parşömeni** (büyü kayıtlı değilse 12 zümrüt, yeniden başlatınca `/aizen_odul`), sonraki galibiyetlerde 5 zümrüt.

## Kyōka Suigetsu (ödül büyüsü)

`kubejs:kyoka_suigetsu` (startup script `aizen_spell.js`; **oyunun yeniden başlatılması gerekir**). 2 seviye, efsanevi, eldritch okulu, mana 80/110, bekleme 120 sn. Etkisini bielgg_spells'in **Mirroring** büyüsünden (ekipmanını ve büyülerini kopyalayan ayna kopyalar) ödünç alır; ödünç alınan büyüye dokunulmaz. Adı ve açıklaması dil dosyalarında, ikonu `assets/spell-icons/kyoka_suigetsu.png` (16×16, ilk sürüm: mor ayna).

## Diyalog ve etiketler

Yönlendirme: evre etiketi `aizen_st_<n>` ve karşılama sürümü `dv_aizen_<k>` (her evrenin 3 sürümü; `npc_cesitlilik.js` her konuşmadan sonra yeniler). Düğmeler yalnızca etiket verir (`aizen_bilgi`, `aizen_yardim`, `aizen_arastirma`, `aizen_kim`, `aizen_supheli`, `aizen_neden`, `aizen_dovus`), mantık `aizen.js`'te. Easy NPC'nin sınırı nedeniyle ana menü en çok 6 düğme.

## Kurulum

1. `node tools/yoruichi/gen_aizen.js <datapack> <owner-uuid>` (yerel dünyada fonksiyonlar zaten var).
2. Oyunda NPC'nin duracağı yerde `/reload`, sonra `function yoruichi:aizen_kur`.
3. Diyalogları yenilemek için NPC'nin yakınında `function yoruichi:aizen_diyalog` (3 sn bekle).
4. `/aizen_evre 1` (varsayılan zaten 1). İhanet zamanı gelince `/aizen_evre 3`.
