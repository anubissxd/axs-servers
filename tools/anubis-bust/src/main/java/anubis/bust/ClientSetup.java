package anubis.bust;

import com.mojang.logging.LogUtils;
import net.minecraft.client.renderer.entity.EntityRenderer;
import net.minecraft.client.renderer.entity.LivingEntityRenderer;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.world.entity.EntityType;
import net.minecraftforge.client.event.EntityRenderersEvent;
import net.minecraftforge.client.event.RegisterClientReloadListenersEvent;
import net.minecraftforge.eventbus.api.IEventBus;
import net.minecraftforge.fml.javafmlmod.FMLJavaModLoadingContext;
import net.minecraftforge.registries.ForgeRegistries;
import org.slf4j.Logger;

/** Client-only wiring. Kept out of the @Mod class so a dedicated server never loads client classes. */
final class ClientSetup {
    private static final Logger LOG = LogUtils.getLogger();

    private ClientSetup() {}

    static void init() {
        IEventBus bus = FMLJavaModLoadingContext.get().getModEventBus();
        bus.addListener(ClientSetup::onAddLayers);
        bus.addListener(ClientSetup::onReloadListeners);
    }

    private static void onReloadListeners(RegisterClientReloadListenersEvent event) {
        event.registerReloadListener(BustConfig.INSTANCE);
    }

    /** Adds the layer to every Easy NPC living-entity renderer; the layer itself decides per NPC whether to draw. */
    @SuppressWarnings({"unchecked", "rawtypes"})
    private static void onAddLayers(EntityRenderersEvent.AddLayers event) {
        int added = 0;
        for (ResourceLocation id : ForgeRegistries.ENTITY_TYPES.getKeys()) {
            if (!"easy_npc".equals(id.getNamespace())) continue;
            EntityType<?> type = ForgeRegistries.ENTITY_TYPES.getValue(id);
            if (type == null) continue;
            EntityRenderer<?> renderer;
            try {
                renderer = event.getRenderer((EntityType) type);
            } catch (RuntimeException ex) {
                continue;
            }
            if (renderer instanceof LivingEntityRenderer lr) {
                lr.addLayer(new BustLayer(lr));
                added++;
                LOG.info("[anubis_bust] layer added to {}", id);
            }
        }
        LOG.info("[anubis_bust] {} Easy NPC renderer(s) got the bust layer", added);
    }
}
