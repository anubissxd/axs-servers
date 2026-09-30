// Gojo'nun büyüleri: Blue (Mavi), Red (Kırmızı), Purple (Mor). Oyunda İngilizce adlarıyla görünür ve aranır.
// Her biri kendi kayıtlı büyüsüdür (kubejs:gojo_blue, kubejs:gojo_red, kubejs:gojo_purple); etkisini Iron's Spells'in mevcut bir büyüsünden
// ödünç alır (onCast içinde o büyünün kendi onCast'ını çağırır), üstüne kendi parçacık efektini ekler:
//   Blue   -> Gravity Fissure (ender): ileri giden küçük kara delik, çeker
//   Red    -> Shockwave (lightning): patlama dalgası, savurur
//   Purple -> Eldritch Blast (eldritch): yıkım ışını (Mavi ve Kırmızı'nın birleşimi, Gojo'da yalnızca ikisini bitirenlere)
// Ödünç alınan büyülerin kendisine dokunulmaz. Hasar/menzil ödünç alınan büyünün seviyesine göre ölçeklenir, mana ve bekleme burada ayarlanır.
// Sistem adları ve dil dosyası: kubejs/assets/kubejs/lang/*.json (spell.kubejs.gojo_*), ikonlar: textures/gui/spell_icons/gojo_*.png.
// Startup script: değişiklik için oyunun tamamen yeniden başlatılması gerekir.
// Not: startup_scripts dosyaları aynı scope'ta çalışır, isimler benzersiz olmalı.
const GojoSpellRegistry = Java.loadClass('io.redspace.ironsspellbooks.api.registry.SpellRegistry')
const GojoResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation')
const GojoParticleTypes = Java.loadClass('net.minecraft.core.particles.ParticleTypes')

// getSpell(String) ile getSpell(ResourceLocation) Rhino'da belirsiz kalır; ResourceLocation nesnesi verilerek çözülür.
function gojoBorrow(baseId, ctx) {
  const parts = String(baseId).split(':')
  const base = GojoSpellRegistry.getSpell(new GojoResourceLocation(parts[0], parts[1]))
  try {
    base.onCast(ctx.getLevel(), ctx.getSpellLevel(), ctx.getEntity(), ctx.getCastSource(), ctx.getPlayerMagicData())
  } catch (e) {
    console.error('gojo büyüsü ' + baseId + ' onCast hata: ' + e)
  }
}

function gojoFx(ctx, particle, count) {
  const caster = ctx.getEntity()
  const eye = caster.getEyePosition()
  ctx.getLevel().sendParticles(particle, eye.x(), eye.y() - 0.3, eye.z(), count, 0.6, 0.5, 0.6, 0.05)
}

StartupEvents.registry('irons_spellbooks:spells', event => {
  event.create('gojo_blue')
    .setSchool('irons_spellbooks:ender')
    .setMinRarity('epic')
    .setMaxLevel(3)
    .canBeCraftedBy(player => false)
    .setAllowLooting(false)
    .setCastType('long')
    .setCastTime(30)
    .setCooldownSeconds(20)
    .setBaseManaCost(45)
    .setManaCostPerLevel(10)
    .setUniqueInfo((level, caster) => [Text.gray('Pulls creatures toward a point of collapsing space')])
    .onCast(ctx => {
      gojoBorrow('irons_spellbooks:gravity_fissure', ctx)
      gojoFx(ctx, GojoParticleTypes.SOUL_FIRE_FLAME, 40)
    })

  event.create('gojo_red')
    .setSchool('irons_spellbooks:lightning')
    .setMinRarity('epic')
    .setMaxLevel(3)
    .canBeCraftedBy(player => false)
    .setAllowLooting(false)
    .setCastType('long')
    .setCastTime(20)
    .setCooldownSeconds(15)
    .setBaseManaCost(40)
    .setManaCostPerLevel(10)
    .setUniqueInfo((level, caster) => [Text.gray('Repels everything around you in a blast')])
    .onCast(ctx => {
      gojoBorrow('irons_spellbooks:shockwave', ctx)
      gojoFx(ctx, GojoParticleTypes.FLAME, 50)
    })

  event.create('gojo_purple')
    .setSchool('irons_spellbooks:eldritch')
    .setMinRarity('legendary')
    .setMaxLevel(3)
    .canBeCraftedBy(player => false)
    .setAllowLooting(false)
    .setCastType('instant')
    .setCooldownSeconds(60)
    .setBaseManaCost(100)
    .setManaCostPerLevel(30)
    .setUniqueInfo((level, caster) => [Text.gray('Blue and Red merged into a single erasing beam')])
    .onCast(ctx => {
      gojoBorrow('irons_spellbooks:eldritch_blast', ctx)
      gojoFx(ctx, GojoParticleTypes.DRAGON_BREATH, 60)
    })
})
