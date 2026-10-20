#!/bin/bash
# invariancia.sh: os testes A a F do adendo da invariância causal, juntos — o mesmo mundo, em qualquer resolução
#   bash qa/invariancia.sh [pasta]        (≈ 25 min; o navegador pela catraca da equipe quando houver uma, senão direto)
#   A  a loja no salto × no passo · B  uma descarga atravessando passo → salto → corpo → save · C  as pessoas de uma
#      atividade depois de dois dias longe · E  o livro-razão, cada efeito com a sua causa, nada duas vezes · F  com e sem
#      quadros, bit a bit: qa/invariancia.js (Node, C1)
#   D  a planta e os móveis atravessando o salto, o save (duas vezes), a reforma, a ruína, um save antigo: qa/interiores.js;
#      a casca de longe igual à planta em todos os prédios dos mundos prontos: qa/casca.js (Node, C2)
#   §5 a apresentação nunca à frente do mundo (a caixa na mão, a banca, o cais, a porta): a parte e16 do encarna (navegador,
#      C3) — se ela existir nesta versão
#   e o de sempre, agora com as atividades e os interiores ligados: det3.js (a mesma semente, com e sem quadros, e o mesmo
#   save carregado duas vezes) no navegador
cd "$(dirname "$0")"
OUT=${1:-/tmp/invariancia-$(date +%s)}; mkdir -p "$OUT"
export PLAYWRIGHT=${PLAYWRIGHT:-/opt/node22/lib/node_modules/playwright}
# (o navegador pela catraca, se esta máquina tem uma; senão direto)
CAT=$(ls /tmp/claude-*/*/*/scratchpad/onda2/catraca.sh 2>/dev/null | head -1); nav() { if [ -n "$CAT" ]; then PRIO=1 bash "$CAT" "$@"; else "$@"; fi; }
t0=$(date +%s)
echo "== A, B, C, E, F (Node)"; timeout 2400 node invariancia.js > "$OUT/invariancia.txt" 2>&1; grep -h "^PASSOU\|^FALHOU" "$OUT/invariancia.txt"
echo "== D (Node)"; timeout 2400 node interiores.js > "$OUT/interiores.txt" 2>&1; grep -h "^PASSOU\|^FALHOU" "$OUT/interiores.txt" | sed 's/^/  /'
timeout 2400 node casca.js > "$OUT/casca.txt" 2>&1; grep -h "^PASSOU\|^FALHOU" "$OUT/casca.txt" | sed 's/^/  /'
if grep -q "need('e16')" encarna.js; then echo "== §5 no 3D (navegador)"; ( export ONLY=e16; nav timeout 5400 node encarna.js "$OUT/e16" > "$OUT/e16.txt" 2>&1 ); grep -h "^PASSOU\|^FALHOU" "$OUT/e16.txt"; else echo "== §5 no 3D: a parte e16 ainda não está nesta versão"; fi
echo "== a mesma semente, com e sem quadros; o mesmo save duas vezes (navegador)"; nav timeout 2400 node det3.js 77 arquipelago 96 3 2 > "$OUT/det3.txt" 2>&1; grep -h "^PASSOU\|^FALHOU" "$OUT/det3.txt" | tail -6
f=$(cat "$OUT"/*.txt | grep -c "^FALHOU"); p=$(cat "$OUT"/*.txt | grep -c "^PASSOU")
echo "== invariância: $p passaram, $f falharam; $(( ($(date +%s) - t0) / 60 )) min; tudo em $OUT"
[ "$f" = 0 ]
