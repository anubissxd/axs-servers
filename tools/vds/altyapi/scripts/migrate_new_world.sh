#!/bin/bash
# Medieval Fantasy: mod temizligi + performans modlari + yeni dunya hazirligi.
# Sunucu DURMUS olmali. Silinen jar'lar yedek klasorune tasinir (geri alinabilir).
set -e
S=/root/servers/medieval-fantasy
B=/root/backups/medieval-fantasy/2026-09-25-old-world-final
R=$B/removed-jars
mkdir -p "$R"
cd "$S"

systemctl is-active -q minecraft-fantasy.service && { echo "SUNUCU HALA ACIK"; exit 1; }

REMOVE=(
  "ardas_uncrafting_table-1.2-forge-1.20.1.jar"
  "betterarcheology-1.2.1-1.20.1.jar"
  "bettermobcombat-forge-1.20.1-1.3.0-norecruits.jar"
  "bielgg_spells-1.5-patchwork.jar"
  "elder_tales-1.5.1.jar"
  "EndingLibrary-1.20.1-2.2.1fix-all.jar"
  "farmersrespite-1.20.1-2.1.2.jar"
  "farmers_spell-1.0.5-1.20.1-all.jar"
  "frightsdelight-forge-1.20.1-1.4.8.jar"
  "IllagerInvasion-v8.0.7-1.20.1-Forge.jar"
  "TConstruct-1.20.1-3.12.1.231.jar"
  "Mantle-1.20.1-1.11.117.jar"
  "constructs_casting-2.2.5.jar"
  "nethersdelight-1.20.1-4.0.jar"
  "paladin_spells-1.20.1-1.1.1.jar"
  "puffish_biome_dither-1.0.0-1.19.2-forge.jar"
  "simplest_excavators-1.20.1-1.1.5.jar"
  "simplest_hammers-1.20.1-1.1.4.jar"
  "smallships-forge-1.20.1-2.0.0-b1.4.jar"
  "spelunkery-1.20.1-0.3.16-forge.jar"
  "Resourcify (1.20.1-forge)-1.8.6.jar"
  "toms_storage-1.20-1.7.1.jar"
  "recruits-1.20.1-1.15.2.jar"
  "weaponmaster_ydm-forge-1.20.1-4.2.3.jar"
  "zombieawareness-1.20.1-1.13.1.jar"
  "coroutil-forge-1.20.1-1.3.7.jar"
  "Structory_1.20.x_v1.3.5.jar"
  "Structory_Towers_1.20.x_v1.0.7.jar"
  "[forge]ctov-3.4.14.jar"
  "lithostitched-forge-1.20.1-1.4.11.jar"
  "PhilipsRuins1.20.1-5.7.jar"
  "formationsoverworld-1.0.5-mc1.20.jar"
  "formations-1.0.4-forge-mc1.20.2.jar"
  "tlc_forge-1.0.3-R-1.20.X.jar"
)
missing=0
for f in "${REMOVE[@]}"; do
  if [ -f "mods/$f" ]; then mv "mods/$f" "$R/"
  elif [ -f "client-extra/mods/$f" ]; then mv "client-extra/mods/$f" "$R/"
  else echo "BULUNAMADI: $f"; missing=$((missing+1)); fi
done
echo "kaldirilan: $(ls "$R" | wc -l), bulunamayan: $missing"

# cift Xaero kopyalari (mods/ icindekiler kaliyor)
for f in xaerominimap-forge-1.20.1-26.5.0.jar xaeroworldmap-forge-1.20.1-1.46.0.jar; do
  [ -f "mods/$f" ] && [ -f "client-extra/mods/$f" ] && mv "client-extra/mods/$f" "$R/client-extra-dup-$f"
done

# FancyMenu + kutuphaneleri sadece client'a
for f in fancymenu_forge_3.9.12_MC_1.20.1.jar konkrete_forge_1.8.0_MC_1.20-1.20.1.jar melody_forge_1.0.3_MC_1.20.1-1.20.4.jar; do
  mv "mods/$f" "client-extra/mods/$f"
done

# performans modlari
cp _staged_perf/both/*.jar mods/
cp _staged_perf/server/*.jar mods/
cp _staged_perf/client/*.jar client-extra/mods/

# server-only listesi
cp server-only-mods.txt "$B/server-only-mods.before.txt"
grep -vE '^\[forge\]ctov-3\.4\.14\.jar$|^starlight-1\.1\.2\+forge\.1cda73c\.jar$' server-only-mods.txt > /tmp/so.txt
printf '%s\n' "enhancedai-3.3.7.5.jar" "async-locator-forge-1.20-1.3.0.jar" "structure_layout_optimizer-forge-1.0.11.jar" "alternate_current-mc1.20-1.7.0.jar" >> /tmp/so.txt
mv /tmp/so.txt server-only-mods.txt

# Tinkers'a ait can calma override'i
rm -rf global_packs/required_data/anubis_fixes/data/tconstruct

# hub scripti yeni hub kurulana kadar devre disi
mkdir -p _disabled_scripts && mv kubejs/server_scripts/anubis_hub_spawn.js _disabled_scripts/

# dunyaya ozel sunucu ayarlari -> defaultconfigs (yeni dunya buradan alir)
mkdir -p defaultconfigs
for f in world/serverconfig/*; do
  n=$(basename "$f")
  case "$n" in mantle-server.toml|recruits-server.toml|toms_storage-server.toml|wind_spellbooks-server.toml) continue;; esac
  cp -r "$f" defaultconfigs/
done
sed -i -E 's/^(\s*maxPlayerClaims\s*=\s*)500$/\14/' defaultconfigs/openpartiesandclaims-server.toml
grep -E '^\s*maxPlayerClaims' defaultconfigs/openpartiesandclaims-server.toml

# eski dunya (arsivlendi) -> sil
rm -rf world
echo "TAMAM"
