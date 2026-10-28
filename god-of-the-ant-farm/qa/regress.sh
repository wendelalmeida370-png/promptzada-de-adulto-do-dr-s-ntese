#!/bin/bash
# A regressão completa, antes de cada versão: bash qa/regress.sh [pasta de saída]   (≈ 3 h numa máquina de 4 núcleos — 2 h dela é o Modo Encarnado, sozinho)
# Roda o vigia do código, as 17 provas do mar, as 10 da guerra (e o cativo em casa), as da cidade (bairros, porto, taverna, moradia, crime, quarteirão), a memória dos mortos, os mundos prontos, vidas longas com o verificador, a mão divina, saves danificados,
# o save como ponto fixo, os mapas de alcance e de quem está a bordo, o determinismo, os painéis, o desenho, o macaco no teclado, os poderes (os novos e o deus caótico)
# e o Modo Encarnado (encarna.js: o 3D de verdade, com o WebGL por software do navegador de testes).
# No fim escreve resumo.txt e o compara com a linha de base (linha-de-base.txt): o que mudou desde a última versão aparece como NOVO.
# Tudo é determinístico (a mesma semente faz o mesmo mundo): uma prova que muda de resultado mudou porque o jogo mudou.
cd "$(dirname "$0")"
OUT=${1:-/tmp/gotaf-regress}; mkdir -p "$OUT"
# (SKIP="mar guerra" pula fases já rodadas nessa pasta — mar, guerra, vida, estado, tela, cidade, poderes, fundacao, perf; sem SKIP a
# pasta começa limpa — fases: mar, guerra, vida, estado, tela, cidade, poderes, fundacao, encarnado, perf. Com a máquina ocupada:
# SKIP="perf" agora, e depois, com ela livre, só o desempenho: SKIP="mar guerra vida estado tela cidade poderes fundacao encarnado" bash regress.sh pasta)
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
skip guerra || { for m in small medium walls save; do (DET=1 timeout 1500 node guerra10.js $m 7 > "$OUT/guerra_$m.txt" 2>&1) & done; (timeout 600 node vira.js > "$OUT/vira.txt" 2>&1) & (timeout 900 node cativos.js > "$OUT/cativos.txt" 2>&1) & wait; }
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
(timeout 900 node ev.js 5 continente 128 4 2 ilhado.js > "$OUT/ilhado.txt" 2>&1) &
(timeout 1700 node det3.js 77 arquipelago 96 3 2 > "$OUT/determinismo.txt" 2>&1) &
(timeout 2400 node salto.js 41 > "$OUT/salto.txt" 2>&1) &
wait; echo "== saves danificados, alcance, a bordo, isolados, determinismo, o salto em dois ritmos"
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
# (e as famílias que o modo desenvolvedor faz: cada filho ao menos 11 anos depois dos pais, L-219)
skip poderes || { (timeout 1500 node poderes.js > "$OUT/poderes.txt" 2>&1) & (timeout 1500 node ev.js 7 continente 128 4 3 chaos.js > "$OUT/caos.txt" 2>&1) & (timeout 1500 node ev.js 13 arquipelago 128 4 3 chaos.js > "$OUT/caos_13.txt" 2>&1) & (timeout 900 node devfamilias.js > "$OUT/devfamilias.txt" 2>&1) & wait; }
echo "== poderes: $(grep -c '^PASSOU' "$OUT/poderes.txt" 2>/dev/null) passaram, $(grep -c '^FALHOU' "$OUT/poderes.txt" 2>/dev/null) falharam; caos: $(cat "$OUT"/caos*.txt 2>/dev/null | grep -c '"viol": \[\]') de 2 limpos"
# 7b. a fundação da v37, em Node (sem navegador): o depósito e as operações, o porto, o negócio, a economia de verdade (a fome,
# as moedas, a casa, as compras, a pesca, as filas, o saque, a carga comum nas mãos), a invariância entre os três níveis, os interiores (o registro, a
# casca, todas as plantas de todas as famílias, os prédios da vida comum e a vida deles, as portas, os muros), o corpo contra as
# regras do mundo (a soleira, a porta, a casa por dentro) e o 3D lido por números; o catálogo das plantas e as invariantes no qa.js iguais aos arquivos de onde vêm;
# e o que a v37 achou de antigo: o exército que volta para casa e o save no caminho, o motim no save, o lugar dos cais
skip fundacao || { F() { local n=$1; shift; timeout 7200 node "$@" > "$OUT/fund_$n.txt" 2>&1; echo "saída $?" >> "$OUT/fund_$n.txt"; }
  (F plantas plantas.js; F fome fome.js; F casa casa.js; F compras compras.js; F volta volta.js 7) & (F atividades atividades.js; F porto porto.js; F negocio negocio.js; F invariancia invariancia.js; F vidacurta vidacurta.js; F moedas moedas.js; F pesca pesca.js; F motim motim.js metropole; F docas docas.js; F derrota derrota.js 11; F protagonista protagonista.js; F carga-comum carga-comum.js) &
  (F interiores interiores.js; F casca casca.js; F civicos civicos.js; F catalogo catalogo.js confere; F junta junta-inv.js confere; F muros muros.js; F vida-predios vida-predios.js; F portas-casos portas-casos.js cidade; F lances lances.js cidade; F lances-anos100 lances.js anos100; F perdidos perdidos.js; F filas filas.js; F saque saque.js) &
  (F corpo-mundo visual/corpo-mundo.js; F maos visual/maos.js; F estiva visual/estiva.js; F carga-mundo visual/carga-mundo.js; F disputa visual/disputa.js; F corpo-rig visual/corpo-rig.js; F guarda3d visual/guarda3d.js ..; F soleira visual/soleira.js; F porta-velha visual/porta-velha.js; F porta visual/porta.js; F corpo-casa visual/corpo-casa.js; F interior3d visual/interior3d.js; F cais visual/cais.js; F dupla visual/dupla.js; F matriz matriz.js "$OUT/MATRIZ.md") & wait; }
echo "== fundação: $(cat "$OUT"/fund_*.txt 2>/dev/null | grep -c '^PASSOU') passaram, $(cat "$OUT"/fund_*.txt 2>/dev/null | grep -c '^FALHOU') falharam; $(grep -L '^saída 0' "$OUT"/fund_*.txt 2>/dev/null | wc -l) arquivos com saída de erro"
# 7c. o Modo Encarnado: a cidade real em 3D, a pessoa real, o mundo que continua, a troca, a morte, o terreno, os saves A–E,
# o estresse (30 idas e voltas, a caminhada longa, o salto de 10 anos), os casos ruins e o visual (e11) — com fotos em encarna-fotos/
# (≈ 1 h 20 sozinho: o 3D é desenhado de verdade, sem placa de vídeo — desde a v33, com o chão e os padrões, mais pesado: T-032)
# (e, depois, as falas e os textinhos do mundo sobre os olhos do corpo, numa pechincha: visual/baloes.js, L-211 — fotos em baloes-fotos/;
# e o Diário de Vida, a página e o deixar de lado pelas mãos do corpo: visual/diario.js, D-061 — fotos em diario-fotos/)
skip encarnado || { (timeout 10800 node encarna.js "$OUT/encarna-fotos" > "$OUT/encarnado.txt" 2>&1); (timeout 3600 node visual/baloes.js .. "$OUT/baloes-fotos" > "$OUT/baloes.txt" 2>&1); (timeout 3600 node visual/diario.js .. "$OUT/diario-fotos" > "$OUT/diario.txt" 2>&1); }
echo "== encarnado: $(grep -c '^PASSOU' "$OUT/encarnado.txt" 2>/dev/null) passaram, $(grep -c '^FALHOU' "$OUT/encarnado.txt" 2>/dev/null) falharam; balões: $(grep -c '^PASSOU' "$OUT/baloes.txt" 2>/dev/null) passaram, $(grep -c '^FALHOU' "$OUT/baloes.txt" 2>/dev/null) falharam; diário: $(grep -c '^PASSOU' "$OUT/diario.txt" 2>/dev/null) passaram, $(grep -c '^FALHOU' "$OUT/diario.txt" 2>/dev/null) falharam; $(grep -h '^DESEMPENHO' "$OUT/encarnado.txt" 2>/dev/null | cut -c1-200)"
# 8. desempenho: sozinho na máquina, para os tempos valerem alguma coisa
skip perf || m17 perf 7; echo "== desempenho: $(grep -h 'PASSOU\|FALHOU' "$OUT/mar_perf.txt" | cut -c1-160)"
# resumo: uma linha por prova
{
  for f in "$OUT"/mar_*.txt; do grep -h "PASSOU\|FALHOU" "$f" | sed -E 's/^(PASSOU|FALHOU) \| ([^|]*)\|.*/\1 | mar \2/'; done
  for f in "$OUT"/cidade_*.txt; do [ -f "$f" ] && grep -h "^PASSOU\|^FALHOU" "$f" | sed -E 's/^(PASSOU|FALHOU) \| ([^|]*)\|.*/\1 | cidade \2/'; done
  [ -f "$OUT/salto.txt" ] && grep -h "^PASSOU\|^FALHOU" "$OUT/salto.txt" | sed -E 's/^(PASSOU|FALHOU) \| ([^|]*)\|.*/\1 | salto \2/'
  [ -f "$OUT/vira.txt" ] && grep -h "^PASSOU\|^FALHOU" "$OUT/vira.txt" | sed -E 's/^(PASSOU|FALHOU) \| ([^|]*)\|.*/\1 | guerra \2/'
  [ -f "$OUT/cativos.txt" ] && grep -h "^PASSOU\|^FALHOU" "$OUT/cativos.txt" | sed -E 's/^(PASSOU|FALHOU) \| ([^|]*)\|.*/\1 | cativos \2/'
  [ -f "$OUT/poderes.txt" ] && grep -h "^PASSOU\|^FALHOU" "$OUT/poderes.txt" | sed -E 's/^(PASSOU|FALHOU) \| ([^|]*)\|.*/\1 | poderes \2/'
  [ -f "$OUT/devfamilias.txt" ] && grep -h "^PASSOU\|^FALHOU" "$OUT/devfamilias.txt" | sed -E 's/^(PASSOU|FALHOU) \| ([^|]*)\|.*/\1 | \2/'
  # (o macaco: as violações S0–S2 que ele acha contam — antes só os erros contavam, T-122)
  [ -f "$OUT/macaco.txt" ] && { grep -q "^violações S0-S2: nenhuma" "$OUT/macaco.txt" && echo "PASSOU | macaco sem violações S0–S2" || echo "FALHOU | macaco sem violações S0–S2"; }
  [ -f "$OUT/encarnado.txt" ] && grep -h "^PASSOU\|^FALHOU" "$OUT/encarnado.txt" | sed -E 's/^(PASSOU|FALHOU) \| ([^|]*)\|.*/\1 | \2/'
  [ -f "$OUT/baloes.txt" ] && grep -h "^PASSOU\|^FALHOU" "$OUT/baloes.txt" | sed -E 's/^(PASSOU|FALHOU) \| ([^|]*)\|.*/\1 | \2/'
  [ -f "$OUT/diario.txt" ] && grep -h "^PASSOU\|^FALHOU" "$OUT/diario.txt" | sed -E 's/^(PASSOU|FALHOU) \| ([^|]*)\|.*/\1 | \2/'
  for f in "$OUT"/fund_*.txt; do [ -f "$f" ] && { grep -h "^PASSOU |\|^FALHOU |" "$f" | sed -E 's/^(PASSOU|FALHOU) \| ([^|]*)\|.*/\1 | \2/'; grep -q '^saída 0' "$f" && echo "PASSOU | fundação $(basename "$f" .txt | cut -c6-) saiu limpo" || echo "FALHOU | fundação $(basename "$f" .txt | cut -c6-) saiu limpo"; }; done
  for f in caos caos_13; do [ -f "$OUT/$f.txt" ] && { grep -q '"viol": \[\]' "$OUT/$f.txt" && grep -q '"errs": \[\]' "$OUT/$f.txt" && echo "PASSOU | $f sem violações S0–S2" || echo "FALHOU | $f sem violações S0–S2"; }; done
  for f in "$OUT"/guerra_*.txt; do grep -h " PASS \| FAIL " "$f" | grep -v RESULT | sed -E 's/^([^—]*) (PASS|FAIL) .*/\2 | guerra \1/; s/^PASS/PASSOU/; s/^FAIL/FALHOU/'; done
  grep -h "^PASSOU\|^FALHOU" "$OUT/guard.txt" "$OUT/determinismo.txt" | sed -E 's/^(PASSOU|FALHOU).*/\1/' | head -2 | paste -d' ' - <(echo vigia; echo determinismo) | sed 's/ / | /'
  for f in vida_103 vida_107; do v=$(grep -c "^  S[0-2] " "$OUT/$f.txt"); echo "$([ "$v" = 0 ] && echo PASSOU || echo FALHOU) | $f sem violações S0–S2"; done
  for f in "$OUT"/*.txt; do e=$(grep -h "erros: \|^erros " "$f" | grep -v "erros: nenhum\|erros nenhum\|erros de módulo: {}" | head -1); [ -n "$e" ] && echo "FALHOU | $(basename "$f" .txt) com erros: ${e:0:120}"; done
  grep -q '"fails": \[\]' "$OUT/alcance.txt" && echo "PASSOU | alcance" || echo "FALHOU | alcance"
  grep -q '"fails": \[\]' "$OUT/bordo.txt" && echo "PASSOU | a bordo" || echo "FALHOU | a bordo"
  grep -q '"fails": \[\]' "$OUT/ilhado.txt" && echo "PASSOU | isolados (bolsão, náufrago, governante)" || echo "FALHOU | isolados (bolsão, náufrago, governante)"
  grep -q "falhas: nenhuma" "$OUT/corrupt.txt" && echo "PASSOU | saves danificados" || echo "FALHOU | saves danificados"
  grep -q '"fails": \[\]' "$OUT/memoria.txt" && echo "PASSOU | memória dos mortos" || echo "FALHOU | memória dos mortos"
  grep -q "^MUNDOS: ok" "$OUT/mundos.txt" && echo "PASSOU | mundos prontos" || echo "FALHOU | mundos prontos"
} | sed 's/  */ /g' > "$OUT/resumo.txt"
echo; cat "$OUT/resumo.txt"
echo; echo "== diferenças desde a linha de base"
if [ -f linha-de-base.txt ]; then diff <(sort linha-de-base.txt) <(sort "$OUT/resumo.txt") | grep '^[<>]' | sed 's/^</ANTES:/; s/^>/NOVO: /' || echo "(nenhuma)"; else echo "(sem linha de base: copie resumo.txt para qa/linha-de-base.txt)"; fi
echo "fim em $(( ($(date +%s) - t0) / 60 )) min; tudo em $OUT"
