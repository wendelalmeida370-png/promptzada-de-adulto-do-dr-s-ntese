#!/bin/bash
# navegador.sh comando... — roda um teste que abre o navegador (o 3D por software usa 1–2 núcleos) só quando há vaga:
# no máximo VAGAS (2) navegadores ao mesmo tempo na máquina, para que várias pessoas/agentes testando juntos não a afoguem.
# Ex.: bash qa/navegador.sh node qa/encarna.js /tmp/fotos
VAGAS=${VAGAS:-2}
while true; do
  for i in $(seq 1 "$VAGAS"); do
    exec 9>"/tmp/gotaf-navegador-$i.lock"
    if flock -n 9; then "$@"; s=$?; flock -u 9; exit $s; fi
  done
  sleep 7
done
