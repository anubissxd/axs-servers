// Kyōka Suigetsu (Aizen'in yanılsama büyüsü): Aizen'i yenince ödül olarak parşömen verilir (server_scripts/aizen.js). Etkisini bielgg_spells'in
// Mirroring büyüsünden (kullanıcının ekipmanını ve büyülerini kopyalayan ayna kopyalar) ödünç alır; kendi adı, ikonu, mana ve bekleme değerleri vardır.
// Ödünç alınan büyüye dokunulmaz. 2 seviye. Baştan uzun bekleme: kopyalar güçlüdür.
// Startup script: değişiklik için oyunun tamamen yeniden başlatılması gerekir.
// Not: startup_scripts dosyaları aynı scope'ta çalışır, isimler benzersiz olmalı.
const KyokaSpellRegistry = Java.loadClass('io.redspace.ironsspellbooks.api.registry.SpellRegistry')
const KyokaResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation')

StartupEvents.registry('irons_spellbooks:spells', event => {
  event.create('kyoka_suigetsu')
    .setSchool('irons_spellbooks:eldritch')
    .setMinRarity('legendary')
    .setMaxLevel(2)
    .canBeCraftedBy(player => false)
    .setAllowLooting(false)
    .setCastType('instant')
    .setCooldownSeconds(120)
    .setBaseManaCost(80)
    .setManaCostPerLevel(30)
    .setUniqueInfo((level, caster) => [Text.gray('Creates illusory mirror clones of yourself')])
    .onCast(ctx => {
      try {
        const base = KyokaSpellRegistry.getSpell(new KyokaResourceLocation('bielgg_spells', 'mirroring'))
        base.onCast(ctx.getLevel(), ctx.getSpellLevel(), ctx.getEntity(), ctx.getCastSource(), ctx.getPlayerMagicData())
      } catch (e) {
        console.error('kyoka suigetsu onCast hata: ' + e)
      }
    })
})
