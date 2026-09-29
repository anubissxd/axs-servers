package anubis.bust;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.mojang.logging.LogUtils;
import net.minecraft.client.model.geom.ModelPart;
import net.minecraft.client.model.geom.PartPose;
import net.minecraft.client.model.geom.builders.CubeDeformation;
import net.minecraft.client.model.geom.builders.CubeListBuilder;
import net.minecraft.client.model.geom.builders.LayerDefinition;
import net.minecraft.client.model.geom.builders.MeshDefinition;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.server.packs.resources.Resource;
import net.minecraft.server.packs.resources.ResourceManager;
import net.minecraft.server.packs.resources.ResourceManagerReloadListener;
import org.slf4j.Logger;

import java.io.BufferedReader;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

/** Reads assets/anubis_bust/bust.json (top-most resource pack wins) and bakes the cube models. */
public final class BustConfig implements ResourceManagerReloadListener {
    public static final BustConfig INSTANCE = new BustConfig();
    private static final Logger LOG = LogUtils.getLogger();
    private static final ResourceLocation FILE = new ResourceLocation(AnubisBust.MODID, "bust.json");

    private volatile List<Entry> entries = Collections.emptyList();

    private BustConfig() {}

    /**
     * One NPC entry. Sizes are multipliers (1.0 = a 4x4x2 pixel box per side), offsets are in model pixels.
     * "match" is a lower-case substring looked for in the NPC's skin URL and, failing that, its custom name.
     */
    public static final class Entry {
        public String match = "";
        public float width = 1f, height = 1f, depth = 1f;
        public float spread = 0f;      // extra distance between the two sides, pixels (negative = closer)
        public float y = 0f, z = 0f;   // shift from the default chest spot, pixels
        public float tilt = 8f;        // downward tilt, degrees
        public boolean overlay = true; // also draw the jacket layer of the skin
        public boolean physics = true;
        public float physicsAmount = 1f;
        public boolean hideWithChestplate = true;

        private ModelPart[] parts; // baseR, baseL, overlayR, overlayL (R = model +x side)

        synchronized ModelPart[] parts() {
            if (parts == null) {
                parts = new ModelPart[] {
                    bake(18, 20, 0f), bake(22, 20, 0f),
                    bake(18, 36, 0.25f), bake(22, 36, 0.25f)
                };
            }
            return parts;
        }
    }

    // The front face of the box must land on the chest pixels of the skin: the body front starts at (20,20),
    // its jacket copy at (20,36). With a 2 px deep box the front face sits at texOffs + (2,2).
    private static ModelPart bake(int u, int v, float inflate) {
        MeshDefinition mesh = new MeshDefinition();
        mesh.getRoot().addOrReplaceChild("b",
            CubeListBuilder.create().texOffs(u, v).addBox(-2f, -2f, -2f, 4f, 4f, 2f, new CubeDeformation(inflate)),
            PartPose.ZERO);
        return LayerDefinition.create(mesh, 64, 64).bakeRoot().getChild("b");
    }

    public Entry find(String skinUrl, String customName) {
        List<Entry> list = entries;
        if (list.isEmpty()) return null;
        String url = skinUrl == null ? "" : skinUrl.toLowerCase(Locale.ROOT);
        String name = customName == null ? "" : customName.toLowerCase(Locale.ROOT);
        for (Entry e : list) {
            if (e.match.isEmpty()) continue;
            if (url.contains(e.match) || name.contains(e.match)) return e;
        }
        return null;
    }

    @Override
    public void onResourceManagerReload(ResourceManager rm) {
        List<Entry> out = new ArrayList<>();
        try {
            Optional<Resource> res = rm.getResource(FILE);
            if (res.isPresent()) {
                try (BufferedReader r = res.get().openAsReader()) {
                    JsonObject root = JsonParser.parseReader(r).getAsJsonObject();
                    JsonArray arr = root.has("npcs") ? root.getAsJsonArray("npcs") : new JsonArray();
                    for (JsonElement el : arr) {
                        JsonObject o = el.getAsJsonObject();
                        Entry e = new Entry();
                        e.match = str(o, "match", "").toLowerCase(Locale.ROOT);
                        e.width = num(o, "width", 1f);
                        e.height = num(o, "height", 1f);
                        e.depth = num(o, "depth", 1f);
                        e.spread = num(o, "spread", 0f);
                        e.y = num(o, "y", 0f);
                        e.z = num(o, "z", 0f);
                        e.tilt = num(o, "tilt", 8f);
                        e.overlay = bool(o, "overlay", true);
                        e.physics = bool(o, "physics", true);
                        e.physicsAmount = num(o, "physicsAmount", 1f);
                        e.hideWithChestplate = bool(o, "hideWithChestplate", true);
                        if (!e.match.isEmpty()) out.add(e);
                    }
                }
            }
        } catch (Exception ex) {
            LOG.error("[anubis_bust] could not read bust.json, no NPC will get a bust", ex);
            out.clear();
        }
        entries = out;
        LOG.info("[anubis_bust] bust.json loaded: {} entr{}", out.size(), out.size() == 1 ? "y" : "ies");
    }

    private static String str(JsonObject o, String k, String d) { return o.has(k) ? o.get(k).getAsString() : d; }
    private static float num(JsonObject o, String k, float d) { return o.has(k) ? o.get(k).getAsFloat() : d; }
    private static boolean bool(JsonObject o, String k, boolean d) { return o.has(k) ? o.get(k).getAsBoolean() : d; }
}
