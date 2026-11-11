#!/bin/bash
# quintal-fotos.sh: the figures of the report of D-186 (what lies about the buildings drawn from their plans), one after the
# other (one node at a time), into qa/patch3/fotos-Q/:   bash qa/visual/quintal-fotos.sh   (from the game's folder)
#   the first five: before | after in one picture (PAR=1); the rest: details of the things, after
cd "$(dirname "$0")/../.." || exit 9
O=qa/patch3/fotos-Q; mkdir -p "$O"
foto() { local name=$1 world=$2 id=$3 view=$4; shift 4; env "$@" timeout 300 node qa/visual/quintal-fotos.js "$O/$name.png" "$world" "$id" "$view" 800 520 2>&1 | tail -1 | cut -c1-330; }
foto 01-casa-do-lenhador-antes-depois metropole 12461 coisa:0:4.4:1.2 PAR=1
foto 02-rua-de-casas-antes-depois metropole 2938 olho:-2.5,-11,3.4,0.5,-2,1.0,50 PAR=1
foto 03-taverna-antes-depois metropole 8450 olho:9.5,6.5,2.0,3.0,0.5,0.8,52 PAR=1
foto 04-olaria-antes-depois metropole 3463 coisa:0:4.4:1.5 PAR=1
foto 05-casa-de-pescador-e-lenhador-antes-depois metropole 12999 olho:5.0,-5.6,1.6,0.6,-0.6,1.0,56 PAR=1
[ -n "$SO_PARES" ] && exit 0
foto 06-escudo-e-lanca-do-guerreiro metropole 2941 coisa:0:4.2:1.4 Q=1
foto 07-varal-rente-a-parede metropole 3055 coisa:0:3.2:1.0 Q=1
foto 08-botijas-da-bebida-a-porta metropole 2941 coisa:0:3:0.5 VINHO=2
foto 09-couro-do-cacador metropole 16146 coisa:0:4.2:1.4 Q=1
foto 10-forcado-ancinho-e-cesto-do-lavrador metropole 7815 coisa:0:4.2:1.4 Q=1
foto 11-rede-e-remo-do-pescador metropole 7252 coisa:0:4.2:1.4 Q=1
foto 12-tina-da-casa metropole 2919 coisa:0:3.2:1.0 Q=1
foto 13-restia-a-porta metropole 3003 coisa:0:3:0.8 Q=1
foto 14-cabana-redonda-barril-no-canto cidade 2247 olho:3.6,5.2,1.5,0.6,1.6,0.5,50 VINHO=1
