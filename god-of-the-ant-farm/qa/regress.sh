#!/bin/bash
# A regressão completa, antes de cada versão: bash qa/regress.sh [pasta de saída]   (≈ 1 h 45 min numa máquina de 4 núcleos — 1 h dela é o Modo Encarnado, sozinho)
# Roda o vigia do código, as 17 provas do mar, as 10 da guerra, as da cidade (bairros, porto, taverna, moradia, crime, quarteirão), a memória dos mortos, os mundos prontos, vidas longas com o verificador, a mão divina, saves danificados,
# o save como ponto fixo, os mapas de alcance e de quem está a bordo, o determinismo, os painéis, o desenho, o macaco no teclado, os poderes (os novos e o deus caótico)
# e o Modo Encarnado (encarna.js: o 3D de verdade, com o WebGL por software do navegador de testes).
# No fim escreve resumo.txt e o compara com a linha de base (linha-de-base.txt): o que mudou desde a última versão aparece como NOVO.
# Tudo é determinístico (a mesma semente faz o mesmo mundo): uma prova que muda de resultado mudou porque o jogo mudou.
cd "$(dirname "$0")"
OUT=${1:-/tmp/gotaf-regress}; mkdir -p "$OUT"
# (SKIP="mar guerra" pula fases já rodadas nessa pasta — mar, guerra, vida, estado, tela, cidade, poderes, perf; sem SKIP a pasta
# começa limpa — fases: mar, guerra, vida, estado, tela, cidade, poderes, encarnado, perf. Com a máquina ocupada: SKIP="perf" agora, e
# depois, com ela livre, só o desempenho: SKIP="mar guerra vida estado tela cidade poderes encarnado" bash regress.sh pasta)
skip() { [[ " $SKIP " == *" $1 "* ]]; }
[ -z "$SKIP" ] && rm -f "$OUT"/*.txt
t0=$(date +%s)
echo "== vigia do código"; node guard.js "${GAMEDIR:-$(dirname "$PWD")}" > "$OUT/guard.txt" 2>&1; tail -1 "$OUT/guard.txt"
# 1. o mar: 17 provas, quatro de cada vez
m17() { DET=1 timeout 1500 node mar17.js $1 $2 > "$OUT/mar_$1.txt" 2>&1; }
if ! skip mar; then
(m17 rich 7; m17 iron 7; m17 temper 11; m17 fisher 3) &
(m17 solo 7; m17 grand 11; m17 know 7; m17 dead 11) &
(m17 colony 7; m17 invasion 7; m17 bigbattle 7; m17 sink 7) &
(m17 saveexp 7; m17 savewar 7; m17 skip 7) &
wait; echo "== mar: $(cat "$OUT"/mar_*.txt | grep -c PASSOU) passaram, $(cat "$OUT"/mar_*.txt | grep -c FALHOU) falharam"
fi
# 2. a guerra: 10 provas em quatro mundos
skip guerra || { for m in small medium walls save; do (DET=1 timeout 1500 node guerra10.js $m 7 > "$OUT/guerra_$m.txt" 2>&1) & done; (timeout 600 node vira.js > "$OUT/vira.txt" 2>&1) & wait; }
echo "== guerra: $(cat "$OUT"/guerra_*.txt | grep -v RESULT | grep -c ' PASS ') passaram, $(cat "$OUT"/guerra_*.txt | grep -v RESULT | grep -c ' FAIL ') falharam"
# 3. o mundo vivendo: anos com o verificador e save→load, a mão divina, o save como ponto fixo
if ! skip vida; then
(timeout 1700 node soak.js 103 continente 128 4 normal 20 5 1 > "$OUT/vida_103.txt" 2>&1) &
(timeout 1700 node soak.js 107 arquipelago 128 4 belicoso 12 3 1 > "$OUT/vida_107.txt" 2>&1) &
(timeout 900 node hand.js 5 continente 128 4 3 40 > "$OUT/mao.txt" 2>&1) &
(timeout 900 node ev.js 9 continente 128 4 4 saveloop.js > "$OUT/saveloop.txt" 2>&1) &
wait; echo "== vidas, mão, saveloop"
fi
# 4. saves danificados, alcance, a bordo, determinismo
if ! skip estado; then
(timeout 1700 node corrupt.js 7 > "$OUT/corrupt.txt" 2>&1) &
(timeout 900 node ev.js 31 mar 160 4 3 reach.js > "$OUT/alcance.txt" 2>&1) &
(timeout 900 node ev.js 31 mar 160 4 8 aboard.js > "$OUT/bordo.txt" 2>&1) &
(timeout 1700 node det3.js 77 arquipelago 96 3 2 > "$OUT/determinismo.txt" 2>&1) &
(timeout 2400 node salto.js 41 > "$OUT/salto.txt" 2>&1) &
wait; echo "== saves danificados, alcance, a bordo, determinismo, o salto em dois ritmos"
fi
# 5. o que o jogador vê: painéis, desenho, o macaco, o fim do mundo
if ! skip tela; then
(timeout 900 node ev.js 21 continente 128 4 6 uismoke.js > "$OUT/paineis.txt" 2>&1) &
(FRAMES=1 timeout 900 node ev.js 22 arquipelago 128 4 4 rendersmoke.js > "$OUT/desenho.txt" 2>&1) &
(timeout 900 node monkey.js 7 90 > "$OUT/macaco.txt" 2>&1) &
(timeout 900 node ev.js 13 ilha 80 2 2 extinct.js > "$OUT/extincao.txt" 2>&1) &
wait; echo "== painéis, desenho, macaco, extinção"
fi
# 6. a cidade: bairros, valor da terra, núcleos e avenidas; o porto, a taverna, a horta, o barraco, o roubo e a cadeia; o quarteirão
# (e o tempo: a memória dos mortos — esquecer, o ossuário, a vala — e os mundos prontos abertos pelo menu)
skip cidade || { (timeout 2400 node urb1.js 41 128 90 > "$OUT/cidade_bairros.txt" 2>&1) & (timeout 2000 node urb2.js 7 > "$OUT/cidade_vida.txt" 2>&1) &
  (timeout 900 node ev.js 5 continente 128 4 4 memoria.js > "$OUT/memoria.txt" 2>&1) & (timeout 2400 node mundos.js > "$OUT/mundos.txt" 2>&1) & wait
  (timeout 1500 node quarteirao.js > "$OUT/cidade_quarteirao.txt" 2>&1); }
echo "== cidade: $(cat "$OUT"/cidade_*.txt 2>/dev/null | grep -c '^PASSOU') passaram, $(cat "$OUT"/cidade_*.txt 2>/dev/null | grep -c '^FALHOU') falharam; memória e mundos prontos: $(grep -h '^MUNDOS' "$OUT/mundos.txt" 2>/dev/null)"
# 7. os poderes do deus: os novos (v30) provocados de propósito com os casos ruins, e o deus caótico lançando todos ao acaso
skip poderes || { (timeout 1500 node poderes.js > "$OUT/poderes.txt" 2>&1) & (timeout 1500 node ev.js 7 continente 128 4 3 chaos.js > "$OUT/caos.txt" 2>&1) & (timeout 1500 node ev.js 13 arquipelago 128 4 3 chaos.js > "$OUT/caos_13.txt" 2>&1) & wait; }
echo "== poderes: $(grep -c '^PASSOU' "$OUT/poderes.txt" 2>/dev/null) passaram, $(grep -c '^FALHOU' "$OUT/poderes.txt" 2>/dev/null) falharam; caos: $(cat "$OUT"/caos*.txt 2>/dev/null | grep -c '"viol": \[\]') de 2 limpos"
# 7b. o Modo Encarnado: a cidade real em 3D, a pessoa real, o mundo que continua, a troca, a morte, o terreno, os saves A–E,
# o estresse (30 idas e voltas, a caminhada longa, o salto de 10 anos) e os casos ruins — com fotos em encarna-fotos/ (≈ 1 h sozinho:
# o 3D é desenhado de verdade, sem placa de vídeo)
skip encarnado || (timeout 5400 node encarna.js "$OUT/encarna-fotos" > "$OUT/encarnado.txt" 2>&1)
echo "== encarnado: $(grep -c '^PASSOU' "$OUT/encarnado.txt" 2>/dev/null) passaram, $(grep -c '^FALHOU' "$OUT/encarnado.txt" 2>/dev/null) falharam; $(grep -h '^DESEMPENHO' "$OUT/encarnado.txt" 2>/dev/null | cut -c1-200)"
# 8. desempenho: sozinho na máquina, para os tempos valerem alguma coisa
skip perf || m17 perf 7; echo "== desempenho: $(grep -h 'PASSOU\|FALHOU' "$OUT/mar_perf.txt" | cut -c1-160)"
# resumo: uma linha por prova
{
  for f in "$OUT"/mar_*.txt; do grep -h "PASSOU\|FALHOU" "$f" | sed -E 's/^(PASSOU|FALHOU) \| ([^|]*)\|.*/\1 | mar \2/'; done
  for f in "$OUT"/cidade_*.txt; do [ -f "$f" ] && grep -h "^PASSOU\|^FALHOU" "$f" | sed -E 's/^(PASSOU|FALHOU) \| ([^|]*)\|.*/\1 | cidade \2/'; done
  [ -f "$OUT/salto.txt" ] && grep -h "^PASSOU\|^FALHOU" "$OUT/salto.txt" | sed -E 's/^(PASSOU|FALHOU) \| ([^|]*)\|.*/\1 | salto \2/'
  [ -f "$OUT/vira.txt" ] && grep -h "^PASSOU\|^FALHOU" "$OUT/vira.txt" | sed -E 's/^(PASSOU|FALHOU) \| ([^|]*)\|.*/\1 | guerra \2/'
  [ -f "$OUT/poderes.txt" ] && grep -h "^PASSOU\|^FALHOU" "$OUT/poderes.txt" | sed -E 's/^(PASSOU|FALHOU) \| ([^|]*)\|.*/\1 | poderes \2/'
  [ -f "$OUT/encarnado.txt" ] && grep -h "^PASSOU\|^FALHOU" "$OUT/encarnado.txt" | sed -E 's/^(PASSOU|FALHOU) \| ([^|]*)\|.*/\1 | \2/'
  for f in caos caos_13; do [ -f "$OUT/$f.txt" ] && { grep -q '"viol": \[\]' "$OUT/$f.txt" && grep -q '"errs": \[\]' "$OUT/$f.txt" && echo "PASSOU | $f sem violações S0–S2" || echo "FALHOU | $f sem violações S0–S2"; }; done
  for f in "$OUT"/guerra_*.txt; do grep -h " PASS \| FAIL " "$f" | grep -v RESULT | sed -E 's/^([^—]*) (PASS|FAIL) .*/\2 | guerra \1/; s/^PASS/PASSOU/; s/^FAIL/FALHOU/'; done
  grep -h "^PASSOU\|^FALHOU" "$OUT/guard.txt" "$OUT/determinismo.txt" | sed -E 's/^(PASSOU|FALHOU).*/\1/' | head -2 | paste -d' ' - <(echo vigia; echo determinismo) | sed 's/ / | /'
  for f in vida_103 vida_107; do v=$(grep -c "^  S[0-2] " "$OUT/$f.txt"); echo "$([ "$v" = 0 ] && echo PASSOU || echo FALHOU) | $f sem violações S0–S2"; done
  for f in "$OUT"/*.txt; do e=$(grep -h "erros: \|^erros " "$f" | grep -v "erros: nenhum\|erros nenhum" | head -1); [ -n "$e" ] && echo "FALHOU | $(basename "$f" .txt) com erros: ${e:0:120}"; done
  grep -q '"fails": \[\]' "$OUT/alcance.txt" && echo "PASSOU | alcance" || echo "FALHOU | alcance"
  grep -q '"fails": \[\]' "$OUT/bordo.txt" && echo "PASSOU | a bordo" || echo "FALHOU | a bordo"
  grep -q "falhas: nenhuma" "$OUT/corrupt.txt" && echo "PASSOU | saves danificados" || echo "FALHOU | saves danificados"
  grep -q '"fails": \[\]' "$OUT/memoria.txt" && echo "PASSOU | memória dos mortos" || echo "FALHOU | memória dos mortos"
  grep -q "^MUNDOS: ok" "$OUT/mundos.txt" && echo "PASSOU | mundos prontos" || echo "FALHOU | mundos prontos"
} | sed 's/  */ /g' > "$OUT/resumo.txt"
echo; cat "$OUT/resumo.txt"
echo; echo "== diferenças desde a linha de base"
if [ -f linha-de-base.txt ]; then diff <(sort linha-de-base.txt) <(sort "$OUT/resumo.txt") | grep '^[<>]' | sed 's/^</ANTES:/; s/^>/NOVO: /' || echo "(nenhuma)"; else echo "(sem linha de base: copie resumo.txt para qa/linha-de-base.txt)"; fi
echo "fim em $(( ($(date +%s) - t0) / 60 )) min; tudo em $OUT"
