package anubis.bust;

import net.minecraftforge.api.distmarker.Dist;
import net.minecraftforge.fml.DistExecutor;
import net.minecraftforge.fml.common.Mod;

/**
 * Anubis Bust - client-only. Draws a 3D bust on chosen Easy NPC humanoids.
 * Which NPCs get one, and how it looks, comes from assets/anubis_bust/bust.json
 * (shipped by the pack in kubejs/assets/anubis_bust/bust.json).
 */
@Mod(AnubisBust.MODID)
public class AnubisBust {
    public static final String MODID = "anubis_bust";

    public AnubisBust() {
        DistExecutor.unsafeRunWhenOn(Dist.CLIENT, () -> ClientSetup::init);
    }
}
