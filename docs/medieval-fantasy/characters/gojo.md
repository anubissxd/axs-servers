# Gojo

*(Sistem VDS'te kurulu; büyüler modlardan hazır, gerçek oyunda test edilmedi.)*

- **Tür:** İnsan (easy_npc:humanoid, klasik kol). UUID `6bbe609e-4759-4904-9795-3e7974da69f8`, etiketleri `korunan`, `hoca_npc_gojo`.
- **Konum:** -819.5, 69, -472.5 (istenen -820, 69, -473; NPC blok ortasına oturdu)
- **Görevi:** Mavi, Kırmızı ve Mor büyülerini öğretir. Kakashi ve Itachi ile aynı sistemi kullanır ([hocalar_egitim.js](../../../kubejs/server_scripts/hocalar_egitim.js) mantığı): rütbe şartı, zümrüt bloğu ücreti, sınav, parşömen, bağ ve hediye.
- **Konsept:** Jujutsu Kaisen'deki Gojo Satoru: kendinden emin, alaycı, "en güçlü" olduğunu her fırsatta söyler.
- **Erwin bağı:** Diğer hocalar gibi Erwin'in Keşif Birliği rütbesini şart koşar; terfi sahnelerinde Erwin ona da yönlendirir.

## Skin / Texture

<img src="../../../assets/npc-skins/gojo_v1.png" alt="gojo_v1.png" width="256">

- **Dosya:** [`assets/npc-skins/gojo_v1.png`](../../../assets/npc-skins/gojo_v1.png) (64×64, insan, klasik kol); swxff ekledi.
- **Oyunda:** `SkinData` `SECURE_REMOTE_URL` ile bu dosyanın GitHub ham adresine bağlı. Kurallar: [assets.md](../../assets.md).

## Büyüler (modlardan hazır, yeniden başlatma gerekmez)

Bu üç büyü sunucudaki modlarda zaten kayıtlı olduğu için hemen çalışır. Oyunda parşömen üzerinde **mod adıyla** görünür (Gojo bunu söyler). Kendi adıyla ayrı bir büyü istenirse ileride KubeJS büyüsü yazılabilir (yeniden başlatma ve istemci güncellemesi gerektirir).

| Büyü | Anime | Oyunda kullanılan | Neden |
|---|---|---|---|
| **Mavi** (Ao) | Çekim | Iron's Spells **Gravity Fissure** (ender, epic): ileri giden küçük kara delik, yakındakileri çeker | Çekim/toplama hissi |
| **Kırmızı** (Aka) | İtme | Iron's Spells **Shockwave**: elektrikli patlama, çevresindekileri savurur | Patlayıcı itme |
| **Mor** (Murasaki) | Mavi + Kırmızı birleşimi | Iron's Spells **Eldritch Blast** (efsanevi, mor eldritch ışını) | Mor renk ve yıkım ışını; Chidori dengesinde de referans alınan büyü |

Elenen adaylar: Cataclysm Gravitational Pull (Mavi'ye yakın ama yalnızca kendine çeker), bielgg Red Buster (balta gerektirir), bielgg Neutron Lance / Worldbreaker / Absolute End (en yüksek can hasarı verir, aşırı güçlü).

## Eğitim şartları

Her büyü 3 seviyedir. Ücret zümrüt **bloğudur** (öğretme ücreti). Seviyeler sırayla açılır.

| Büyü | Seviye | Erwin rütbesi | Ücret | Sınav |
|---|---|---|---|---|
| Mavi | L1 Sonsuzluğun Kıyısı | Gece Avcısı | 6 | 120 sn'de 16 zombi/iskelet/örümcek/creeper |
| Mavi | L2 Çekim Alanı | Gece Avcısı | 10 | 150 sn'de 12 yağmacı/kaos/Nether askeri |
| Mavi | L3 Kütle Çekimi | Eşik Muhafızı | 16 | 150 sn'de 8 yıkıntı bekçisi/kadim/mutant |
| Kırmızı | L1 Kırmızı Patlama | Gece Avcısı | 6 | 12 enderman/creeper/Nether askeri |
| Kırmızı | L2 Tersine Çevrilmiş | Gece Avcısı | 10 | 150 sn'de 12 mezarlık/kale yaratığı |
| Kırmızı | L3 Kızıl Kıyamet | Eşik Muhafızı | 16 | 150 sn'de 8 büyücü/şövalye/ölü seçkin |
| Mor | L1 İki Bir Olur | Eşik Muhafızı | 12 | 150 sn'de 10 seçkin düşman |
| Mor | L2 Yok Etme | Eşik Muhafızı | 20 | 1 boss (Cataclysm/Mowzie) |
| Mor | L3 Boşluk | Eşik Muhafızı | 32 | 1 kadim boss (Cataclysm/BoMD/ejderha/Dead King) |

**Mor**, Mavi ve Kırmızı'nın üç seviyesini de tamamlamayı şart koşar. Toplam ücret: Mavi 32, Kırmızı 32, Mor 64 zümrüt bloğu.

Kayıp parşömen ücreti, bağ ve hediye diğer hocalarla aynıdır (`hocaLostFee`; Usta Öğrenci hediyesi "Sonsuzluğun Bandı", kozmetik deri kask).

## Diyalog ve etiketler

Ana menü 6 düğme (Easy NPC'nin sınırı): Mavi, Kırmızı, Mor, Sınavı bildiriyorum, Diğer işler, Ayrılıyorum. "Diğer işler": Eğitim durumum, Mavi/Kırmızı/Mor parşömenimi kaybettim, Geri. Etiketler: `hoca_req_ao|aka|murasaki`, `hoca_rep_gojo`, `hoca_info`, `hoca_lost_ao|aka|murasaki`. Yönlendirme: Maceracı değilse `hoca_ret`, tanışmadıysa `hoca_ilk`, sonra rastgele karşılama (`hoca_kars_n`), oradan `hoca_hub`.

**Karşılama:** Tanıştıktan sonra her gelişte hoca isteksiz bir karşılama repliğiyle başlar (5 farklı replik, `hoca_kars_1..5`); büyü menüsü ancak "öğrenmek istiyorum" denince açılır. Hangi replik açılacağı oyuncudaki `hoca_kn_<hoca>_<n>` etiketiyle belirlenir ve her konuşmadan sonra bir öncekinden farklı yeni biri seçilir (`hocalar_egitim.js` `hocaRerollGreeting`, etkileşimde `hoca_reroll_<hoca>` etiketi).

## Teknik

- NPC: `node tools/yoruichi/gen_hocalar.js gojo <datapack> <owner-uuid> -820 69 -473 0`, sonra `reload` ve `function yoruichi:gojo_kur`. Yenilemek için `HOCA_UUID=<npc-uuid>` ile `gojo_diyalog`.
- Tema efektleri `sinema_motoru.js`'te (`mavi`, `kirmizi`, `mor`).
