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

**D1:** "Merhaba *[oyuncu]*! Güzel bir maceraya atılmaya hazır mısın? Neyse niye soruyorum ki? Her türlü katılmak zorundasın. Emrediyorum! Miyav."
→ [Devam]

**D2:** "Öncelikle sen Kutsanmış bir varlıksın. Benim tarafımdan olmasa da benim kadar kudretli birisi tarafından."
→ [Devam]

**D3:** "Her neyse. Artık ölümsüzsün. En azından yarı olacak şekilde. Öldüğünde burada tekrar diriliyorsun. Fakat her öldüğünde benliğinden bir parça yok olup gidiyor."
- **[Tamam.]** → Oyuncu **Maceracı** ve **Kutsanmış** rütbelerini alır; bu konuşma bir daha açılmaz.
- **[Niye?]** → Miu oyuncuya 10 hasar verir →
  **Niye:** "NE BİLEYİM BEN BE SALAK!?"
  - **[Tamam.]** → Oyuncu **Maceracı** ve **Kutsanmış** rütbelerini alır; bu konuşma bir daha açılmaz.
