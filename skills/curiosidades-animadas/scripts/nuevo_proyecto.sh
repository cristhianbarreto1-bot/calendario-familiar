#!/usr/bin/env bash
# Crea un proyecto de short nuevo a partir de la plantilla.
# Uso: bash nuevo_proyecto.sh <carpeta_destino>
#   ej: bash nuevo_proyecto.sh ~/curiosidades-animadas/2026-11-17-pulpos
set -euo pipefail
DIR_SKILL="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="${1:?Indicá la carpeta destino}"
BASE="$(dirname "$DEST")"
mkdir -p "$BASE"

# Reutiliza node_modules de un proyecto anterior para no reinstalar cada vez
if [ -d "$DEST" ]; then echo "Ya existe $DEST"; exit 1; fi
cp -r "$DIR_SKILL/template" "$DEST"

CACHE="$BASE/.node_modules_cache"
if [ -d "$CACHE/node_modules" ]; then
  cp -r "$CACHE/node_modules" "$DEST/node_modules"
else
  (cd "$DEST" && npm install --no-audit --no-fund)
  mkdir -p "$CACHE" && cp -r "$DEST/node_modules" "$CACHE/node_modules"
fi

if [ ! -f "$DEST/public/sfx/pop.wav" ]; then
  python3 "$DIR_SKILL/scripts/sonidos_base.py" "$DEST/public"
fi
echo "Proyecto listo en $DEST"
