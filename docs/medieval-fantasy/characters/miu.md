# Miu

- **Tür:** Kedi (easy_npc:cat)
- **Konum:** -979, 68, -380 (spawn)
- **Krallık:** [Caddy](../kingdoms/caddy.md)
- **Görevi:** Oyunculara Maceracı rank'ini verir (planlanan)
- **Poz:** Oturuyor, hareketsiz
- **Görünüş:** Özel doku [miu_v2.png](../../../distribution/medieval-fantasy/npc-textures/miu_v2.png), gerçek kedi Miu'ya göre
- **İlişkiler:** Çamur'un arkadaşı

## Hikâye

## Diyaloglar

### İlk karşılaşma

Sadece daha önce "Tamam." dememiş oyuncuya açılır (oyuncu etiketi: `miu_tanisti`).
Diyalogdan çıkılamaz: çarpı yok, ESC çalışmaz. Sadece OP'lar (`rank_admin` etiketi) her sayfada gizli **[Admin] Kapat** düğmesini görür.

**D1:** "Merhaba *[oyuncu]*! Güzel bir maceraya atılmaya hazır mısın? Neyse niye soruyorum ki? Her türlü atılmak zorundasın. Emrediyorum! Miyav."
→ [Devam]

**D2:** "Öncelikle sen Kutsanmış bir varlıksın ve benim tarafımdan olmasa da benim kadar kudretli birisi tarafından kutsandın. Her neyse."
→ [Devam]

**D3:** "Artık ölümsüzsün. En azından yarı-ölümsüzsün. Öldüğünde burada tekrar diriliyorsun. Fakat her öldüğünde benliğinden bir parça yok olup gidiyor. Dikkatli ol."
- **[Tamam.]** → Oyuncu **Maceracı** ve **Kutsanmış** rütbelerini alır; bu konuşma bir daha açılmaz.
- **[Niye?]** → Oyuncu hemen **Maceracı** ve **Kutsanmış** rütbelerini alır ve bu konuşma bir daha açılmaz; ardından Miu oyuncuya 10 hasar verir →
  **Niye:** "NE BİLEYİM BEN BE SALAK!?"
  - **[Tamam.]** → Diyalog kapanır. (Vuruş diyaloğu kesse bile rütbeler zaten verilmiştir.)
