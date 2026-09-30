# kubejs-yerel: yerel geliştirme kopyaları

VDS kapalıyken (2026-09-30 sonrası) swxff'in yerel tek oyunculu dünyada yazdığı/değiştirdiği KubeJS dosyalarının **yedek kopyası**. Asıl çalışan dosyalar `%APPDATA%\.minecraft\versions\Medieval Fantasy\kubejs\` altındadır; buradakiler kaybolmasın ve Anubis'in Claude'u görebilsin diye repodadır.

Yeni VDS gelince bu dosyalar `/root/servers/medieval-fantasy/kubejs/` altına aynı alt klasörle konur (`server_scripts/`, `startup_scripts/`; `assets-lang/*.json` → `assets/kubejs/lang/`). Dosya listesi, sıra ve tuzaklar: [docs/vds-aktarma-notlari.md](../../docs/vds-aktarma-notlari.md).

| Dosya | Konu |
|---|---|
| `server_scripts/aizen.js`, `startup_scripts/aizen_spell.js` | Aizen: 5 perdelik hikâye, Kyōka Suigetsu |
| `server_scripts/kenpachi.js` | Kenpachi kapışması, Nozarashi, Shunpo |
| `server_scripts/thorfinn_ticaret.js` | Thorfinn ticaret, nöbet, ikmal, hikâye |
| `server_scripts/erwin_seferleri.js` | Erwin seferleri (ödül azaltma) |
| `server_scripts/hocalar_egitim.js`, `startup_scripts/gojo_spells.js` | Kakashi/Itachi/Gojo hocaları, Blue/Red/Purple |
| `server_scripts/npc_dialog.js` | Ortak NPC diyalog yardımcıları (cevaplar diyalog penceresinde, [docs/npc-diyalog.md](../../docs/npc-diyalog.md)) |
| `server_scripts/npc_shunpo.js` | Ortak NPC Shunpo: NPC hareketleri düz tp değil, Yoruichi Shunpo efektiyle (kalkış silueti, iz, varış halkası, ses); Aizen ve Kenpachi kullanır |
| `server_scripts/yan_gorev.js` | Yan görevler (pilot: Kakashi; teslimat ve sayfa bulma), bkz. [kakashi.md](../../docs/medieval-fantasy/characters/kakashi.md) |
| `server_scripts/npc_cesitlilik.js` | NPC karşılama repliği çeşitliliği |
| `server_scripts/sinema_motoru.js`, `yoruichi_chase.js` | Ortak altyapı (Shunpo, poz, sahneler) |
| `assets-lang/en_us.json`, `tr_tr.json` | Büyü adları ve açıklamaları (**dosyanın tamamı**, VDS'tekiyle birleştirmeden ezme; önce fark al) |

**Kural:** Yerel profilde bu dosyalardan biri değişince buradaki kopya da güncellenir (aynı commit).
