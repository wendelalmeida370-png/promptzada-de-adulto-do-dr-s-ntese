#!/bin/bash
# Como o js/lib/three.min.js foi feito (o jogo não tem etapa de build: este arquivo é gerado uma vez e guardado no repositório).
# O Three.js (licença MIT) só é distribuído como módulo ES, e módulos não carregam abrindo index.html direto do disco (file://).
# Por isso ele vira um script comum (IIFE) que define window.THREE — exatamente a versão abaixo, para o jogo funcionar offline.
#   bash tools/vendor-three.sh
set -e
V=0.170.0; E=0.24.0
OUT="$(cd "$(dirname "$0")/.." && pwd)/js/lib/three.min.js"
DIR=$(mktemp -d); cd "$DIR"
npm init -y > /dev/null
npm install --no-audit --no-fund three@$V esbuild@$E > /dev/null
echo "export * from 'three';" > entry.js
npx esbuild entry.js --bundle --format=iife --global-name=THREE --minify --legal-comments=inline --target=es2019 --outfile=three.min.js
{ echo "/* three.js r${V#0.} — https://threejs.org — MIT License, Copyright 2010-2024 Three.js Authors (gerado por tools/vendor-three.sh) */"; cat three.min.js; } > "$OUT"
echo "ok: $OUT ($(wc -c < "$OUT") bytes)"
