package anubis.bust;

import com.mojang.blaze3d.vertex.PoseStack;
import com.mojang.blaze3d.vertex.VertexConsumer;
import com.mojang.math.Axis;
import net.minecraft.client.model.EntityModel;
import net.minecraft.client.model.HumanoidModel;
import net.minecraft.client.model.geom.ModelPart;
import net.minecraft.client.renderer.MultiBufferSource;
import net.minecraft.client.renderer.RenderType;
import net.minecraft.client.renderer.entity.LivingEntityRenderer;
import net.minecraft.client.renderer.entity.RenderLayerParent;
import net.minecraft.client.renderer.entity.layers.RenderLayer;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.util.Mth;
import net.minecraft.world.entity.EquipmentSlot;
import net.minecraft.world.entity.LivingEntity;

import java.lang.reflect.Method;
import java.util.Map;
import java.util.Optional;
import java.util.WeakHashMap;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Draws two boxes (plus a slightly larger jacket copy) on the chest of an Easy NPC humanoid,
 * textured from the NPC's own skin, with a small spring for bounce.
 */
public class BustLayer extends RenderLayer<LivingEntity, EntityModel<LivingEntity>> {
    private static final float SPRING = 0.30f, DAMPING = 0.22f, LIMIT = 1.5f;

    private static final Map<Class<?>, Optional<Method>> SKIN_URL = new ConcurrentHashMap<>();
    private static final Map<LivingEntity, State> STATES = new WeakHashMap<>();

    private static final class State {
        int tick = Integer.MIN_VALUE;
        double lastY;
        float bounce, prevBounce, vel;
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    public BustLayer(LivingEntityRenderer renderer) {
        super((RenderLayerParent) renderer);
    }

    /** Easy NPC exposes the skin address as getSkinURL(); read by reflection so we need no compile-time dependency. */
    private static String skinUrl(LivingEntity e) {
        Optional<Method> m = SKIN_URL.computeIfAbsent(e.getClass(), c -> {
            try {
                return Optional.of(c.getMethod("getSkinURL"));
            } catch (ReflectiveOperationException ex) {
                return Optional.empty();
            }
        });
        if (m.isEmpty()) return "";
        try {
            Object r = m.get().invoke(e);
            return r == null ? "" : r.toString();
        } catch (ReflectiveOperationException | RuntimeException ex) {
            return "";
        }
    }

    private static boolean broken = false;
    private static boolean announced = false;

    @Override
    public void render(PoseStack pose, MultiBufferSource buffer, int light, LivingEntity entity,
                       float limbSwing, float limbSwingAmount, float partial, float ageInTicks,
                       float netHeadYaw, float headPitch) {
        if (broken) return;
        try {
            draw(pose, buffer, light, entity, partial);
        } catch (Throwable t) {
            broken = true;
            org.slf4j.LoggerFactory.getLogger("anubis_bust").error("[anubis_bust] render failed, bust disabled until restart", t);
        }
    }

    private void draw(PoseStack pose, MultiBufferSource buffer, int light, LivingEntity entity, float partial) {
        if (entity.isInvisible()) return;
        if (!(getParentModel() instanceof HumanoidModel<?> humanoid)) return;

        String name = entity.hasCustomName() ? entity.getCustomName().getString() : "";
        BustConfig.Entry cfg = BustConfig.INSTANCE.find(skinUrl(entity), name);
        if (cfg == null) return;
        if (cfg.hideWithChestplate && !entity.getItemBySlot(EquipmentSlot.CHEST).isEmpty()) return;

        if (!announced) {
            announced = true;
            org.slf4j.LoggerFactory.getLogger("anubis_bust").info("[anubis_bust] drawing bust for NPC '{}'", name);
        }

        float bounce = cfg.physics ? bounce(entity, cfg, partial) : 0f;

        ResourceLocation tex = getTextureLocation(entity);
        int overlayCoords = LivingEntityRenderer.getOverlayCoords(entity, 0f);
        ModelPart[] parts = cfg.parts();

        pose.pushPose();
        try {
            humanoid.body.translateAndRotate(pose); // follows sneaking, poses and animations of the body
            VertexConsumer vc = buffer.getBuffer(RenderType.entityTranslucent(tex));
            for (int side = 0; side < 2; side++) {
                float sign = side == 0 ? 1f : -1f; // model +x first
                pose.pushPose();
                try {
                    pose.translate(sign * (2f + cfg.spread) / 16f, (4f + cfg.y + bounce) / 16f, (-2f + cfg.z) / 16f);
                    pose.mulPose(Axis.XP.rotationDegrees(cfg.tilt));
                    pose.scale(cfg.width, cfg.height, cfg.depth);
                    parts[side].render(pose, vc, light, overlayCoords);
                    if (cfg.overlay) parts[2 + side].render(pose, vc, light, overlayCoords);
                } finally {
                    pose.popPose();
                }
            }
        } finally {
            pose.popPose();
        }
    }

    /** Spring driven by vertical movement and the walk cycle; stepped once per game tick, interpolated per frame. */
    private static float bounce(LivingEntity e, BustConfig.Entry cfg, float partial) {
        State st;
        synchronized (STATES) {
            st = STATES.computeIfAbsent(e, k -> new State());
        }
        if (st.tick != e.tickCount) {
            if (st.tick == Integer.MIN_VALUE) st.lastY = e.getY();
            float amp = cfg.physicsAmount;
            float dy = (float) (e.getY() - st.lastY);
            st.lastY = e.getY();
            float walk = Mth.cos(e.walkAnimation.position() * 1.3324f) * e.walkAnimation.speed() * 0.18f;
            float force = (-dy * 5f + walk) * amp;
            st.vel += force - SPRING * st.bounce - DAMPING * st.vel;
            st.prevBounce = st.bounce;
            st.bounce = Mth.clamp(st.bounce + st.vel, -LIMIT * amp, LIMIT * amp);
            st.tick = e.tickCount;
        }
        return Mth.lerp(partial, st.prevBounce, st.bounce);
    }
}
