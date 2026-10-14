#!/bin/bash
# rodada: the visual round on a game folder (a colleague's worktree, the integration) — the guard and the rules of the 3D,
# the proofs of the Modo Encarnado that touch the 3D, the hunter, the measures and the photos, then a short report:
#   bash qa/visual/rodada.sh PASTA_DO_JOGO SAIDA
#   RAPIDO=1 a shorter round (the hunt in 5 places, 4 views measured, the main photos) · PARTES="guard encarna caca desempenho fotos"
#   ANTES=folder of the 'before' photos · BASE=desempenho.json of the reference (default: qa/visual/base/desempenho.json)
#   PARALELO=1 two browsers at once (each still through qa/navegador.sh) · ONLY=e1,e6,... the encarna parts · FOTOS=todas
#   VAGA=1 the round already holds a place in the turnstile — every step runs in it, one after another, without queueing
#   again: bash qa/navegador.sh env VAGA=1 bash qa/visual/rodada.sh PASTA SAIDA
# SAIDA/relatorio.txt: what failed and its probable owner (arte/ESTUDIO.md §3) · SAIDA/lado-a-lado/: before | after
set -u
[ $# -ge 2 ] || { echo "uso: bash qa/visual/rodada.sh PASTA_DO_JOGO SAIDA"; exit 2; }
GAME=$(cd "$1" && pwd) || exit 2
[ -f "$GAME/index.html" ] || { echo "rodada: $GAME não é a pasta do jogo (sem index.html)"; exit 2; }
mkdir -p "$2"; OUT=$(cd "$2" && pwd)
HERE=$(cd "$(dirname "$0")" && pwd)
export PLAYWRIGHT=${PLAYWRIGHT:-/opt/node22/lib/node_modules/playwright}
NAV="bash $HERE/../navegador.sh"; [ -n "${VAGA:-}" ] && NAV="" && PARALELO=""
PARTES=${PARTES:-guard encarna caca desempenho fotos}
ENC=${ONLY:-e1,e6,e10,e11,e12,e13,e14,e15}
ANTES=${ANTES:-/tmp/claude-0/-home-user-promptzada-de-adulto-do-dr-s-ntese/9e17ed97-a1b5-5d1c-a5da-c23519ea4f04/scratchpad/visual/antes}
BASE=${BASE:-$HERE/base/desempenho.json}
PRINC=hedeby-praca,hedeby-casa,hedeby-rua-alto,hedeby-noite,hedeby-mata,corpo-frente,metropole-rua
[ "${FOTOS:-}" = todas ] && LISTA="" || LISTA=${FOTOS:-$PRINC}
has() { case " $PARTES " in *" $1 "*) return 0;; esac; return 1; }
commit=$(git -C "$GAME" log -1 --format=%h 2>/dev/null || echo '?')
[ -n "$(git -C "$GAME" status --porcelain -- js index.html 2>/dev/null)" ] && commit="$commit+mudanças"
start=$(date '+%Y-%m-%d %H:%M')
meta() { printf '{"game":"%s","commit":"%s","start":"%s","end":"%s","rapido":"%s","encarna":"%s"}\n' "$GAME" "$commit" "$start" "${1:-}" "${RAPIDO:-}" "$ENC" > "$OUT/rodada.json"; }
meta
say() { echo "[$(date '+%H:%M:%S')] $*"; }
say "rodada em $GAME @ $commit → $OUT (partes: $PARTES)"

if has guard; then
  node "$GAME/qa/guard.js" "$GAME" > "$OUT/guard.txt" 2>&1; say "guard.js: $(tail -1 "$OUT/guard.txt")"
  node "$HERE/guarda3d.js" "$GAME" > "$OUT/guarda3d.txt" 2>&1; say "guarda3d.js: $(tail -1 "$OUT/guarda3d.txt")"
fi
# (each test through the machine's turnstile: at most two browsers on it, whoever runs them)
run_encarna() { ONLY=$ENC timeout 7200 $NAV node "$GAME/qa/encarna.js" "$OUT/encarna" > "$OUT/encarna.txt" 2>&1; say "encarna: $(grep -c '^PASSOU' "$OUT/encarna.txt") passaram, $(grep -c '^FALHOU' "$OUT/encarna.txt") falharam"; }
run_caca() { timeout 7200 $NAV node "$HERE/caca.js" "$GAME" "$OUT/caca" > "$OUT/caca.log" 2>&1; say "caça: $(grep -m1 'problemas diferentes' "$OUT/caca/caca.txt" 2>/dev/null || tail -1 "$OUT/caca.log")"; }
run_desempenho() {
  timeout 7200 $NAV node "$HERE/desempenho.js" "$GAME" "$OUT/desempenho" > "$OUT/desempenho.log" 2>&1
  if [ -f "$BASE" ] && [ -f "$OUT/desempenho/desempenho.json" ]; then node "$HERE/desempenho.js" --compara "$BASE" "$OUT/desempenho/desempenho.json" "$OUT/desempenho/compara.txt" > /dev/null; fi
  say "desempenho: $(tail -1 "$OUT/desempenho.log")"
}
run_fotos() {
  timeout 7200 $NAV node "$HERE/fotos.js" "$GAME" "$OUT/fotos" $LISTA > "$OUT/fotos.log" 2>&1
  if [ -d "$ANTES" ]; then python3 "$HERE/compara.py" "$ANTES" "$OUT/fotos" "$OUT/lado-a-lado" > /dev/null 2>&1; fi
  say "fotos: $(grep -c '^[a-z-]*: {' "$OUT/fotos.log") vistas; $(grep '^erros:' "$OUT/fotos.log")"
}
if [ -n "${PARALELO:-}" ]; then
  { has caca && run_caca; has desempenho && run_desempenho; } &
  { has encarna && run_encarna; has fotos && run_fotos; } &
  wait
else
  has caca && run_caca
  has encarna && run_encarna
  has desempenho && run_desempenho
  has fotos && run_fotos
fi
meta "$(date '+%Y-%m-%d %H:%M')"
node "$HERE/relatorio.js" "$OUT"
