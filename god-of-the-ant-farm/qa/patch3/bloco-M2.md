# Bloco M2 — a obra grande anda e acha terra (Bairros Vivos, o agente M, 2ª rodada)

Ramo: `worktree-agent-a8f5af9594fd9a4f1` (a base desta rodada: `b2b61f0`, o ramo do líder juntado). Números reservados: L-783 a
L-799, T-768 a T-779, D-215 a D-219, regras 75 e 76 do guard. **Este arquivo é mantido em dia a cada passo**: o que está marcado
«FEITO» está em commit; «EM CURSO» está na árvore sem commit; «A FAZER» não começou.

Os roteiros de medida ficam em `scratchpad/ag/M/`: `traca2.js` (um mundo pelo salto: o que cada capital tentou, fundou, acabou,
o que ficou parado e por quê), `terra.js` (que capitais não acham lote, o que tapa o chão, que regra abriria), `longe.js` (uma
obra a uma distância dada dos armazéns, com o armazém cheio), `tempo.js` (quanto cada capital leva para erguer um degrau
sozinha). As saídas: `traca2-s41-a.txt`, `traca2-s7-a.txt`, `terra-<mundo>.txt` (antes) e `terra-<mundo>-d.txt` (com o
aplainar), `longe-mega-*.txt`, `tempo-metropole-teatro6.txt`.

## 0. O estado de cada parte

| parte | estado | commit |
|---|---|---|
| T-767: a porta `V.planNow` e os dois casos que faltavam | FEITO | `b70b0b0` |
| T-760: a carroça da obra grande (D-215), a prova `qa/canteiro.js` | FEITO | `7840218` |
| T-761: aplainar o lote (a D-120 (3)) — D-217, a prova `qa/aterro.js` t1–t5 | FEITO | `77cf5d9` |
| «o degrau do tamanho da pedra do povo»: a renda média e os 15 anos — D-216, `qa/aterro.js` m1–m3 | FEITO | `77cf5d9` |
| L-783: a pedra que a obra grande guarda escapava para as casas novas das cidades-irmãs; a carroça para toda obra a mais de 6 casas, com 20 de pedra deixados no armazém | FEITO | `77cf5d9` |
| as medidas de depois (o g8, as três sementes de 60 anos, a terra nos mundos do zero) | A FAZER (a terra dos mundos prontos e a obra longe já medidas: seções 2 e 3) | — |
| as sabotagens da carroça, do aplainar, da renda média e da L-783 | A FAZER | — |
| as provas vizinhas no fim (`casa-rica`, `juntar`, `obra`, `calcada`, `urb1`, `moedas`, `muros`, `lote-bolsao`, a `escala` inteira, `det3`, a vida de 20 anos) | A FAZER (já rodadas com o código do `77cf5d9`: `aterro` ok, `canteiro` ok, `degraus` g1 a g7 ok, `escala` e0, e7 a e10, e15, e16, e21 sem falha, o guard, a vida curta) | — |

## 1. O g8 na árvore juntada, antes de mexer (o que cada capital tentou, fundou, acabou)

Dois mundos do zero (continente de 128, 4 povos), 90 anos de salto, sem a mão do deus, com o código do `b2b61f0`
(`traca2.js`; as perguntas do roteiro não mexem no mundo: guardam e devolvem o acaso e a memória das buscas).

**Semente 41** — 315 pessoas e 14 cidades no ano 91; 5 degraus grandes fundados, 2 acabados:

| obra | cidade ao fundar | fundada | acabou | o que travou |
|---|---|---|---|---|
| templo de 16 m | Argos (nível 3, 42 pessoas) | ano 32 | **ano 45 (13 anos)** | a pedra: o povo com 0 a 12 de renda por ano; a 4 casas de um armazém |
| palácio de 24 m | Mênfis (nível 3, 33 pessoas) | ano 69 | **ano 85 (16 anos)** | a pedra (27 a 48 por ano no povo) e a distância: a 24 casas de um armazém, 2 a 4 construtores |
| palácio de 24 m | Tenochtitlan (nível 3, 30 pessoas; depois 18 a 20) | ano 77 | **não: 31% em 14 anos**, faltam 192 de 210 de pedra | os braços: 9 adultos na capital, **1 construtor**; a 20 casas de um armazém; a renda do povo 15 por ano |
| termas de 20 m | Argos (80 pessoas) | ano 84 | 97% em 7 anos (faltam 2 de pedra) | a pedra |
| templo de 16 m | Mênfis (52 pessoas) | ano 88 | 26% em 3 anos | — |

**Semente 7** — 495 pessoas e 14 cidades no ano 91; 2 fundados, 2 acabados: o teatro de 24 m de Mênfis (47 pessoas; fundado no
ano 33, **pronto no 51: 18 anos**, a 23 casas de um armazém, 1 a 3 construtores) e o templo de Hedeby ampliado para 16 m (um ano).

**O que mais trava, pelo que as capitais dizem no ano 91** (a linha «a escada» do roteiro, para cada tipo com degrau maior):
- **a terra**: nenhuma capital dos dois mundos acha lote para degrau maior nenhum além do que já tem. Hedeby da semente 7 — 84
  pessoas na capital, 352 no povo, 184 de pedra por ano, **paga tudo, até a maravilha** — não tem um lote de 6 casas: «71% com
  água, 62% com relevo além do pódio, 56% com prédio de outra cidade, 53% com penhasco em volta; o mais perto sem água nem prédio,
  a 13 casas, tem 18,4 m de relevo». Argos (94 pessoas): o lote seco e vazio mais perto, a 22 casas, tem 14 m de relevo; Mênfis:
  30 m; Tenochtitlan: 14 m.
- **a pedra**: a renda dos povos fica entre 0 e 55 por ano quase sempre; o estoque, perto de zero.
- **os braços**: as capitais têm 20 a 94 pessoas; a turma de 15% dos adultos são 1 a 8 construtores.

(Os números do líder para o g8 da árvore juntada — 5 fundados, 4 de pé nos dois mundos — e os do roteiro — 7 fundados, 4
acabados — diferem na contagem: o roteiro conta também as termas, e as suas perguntas a cada dez anos não mexem no mundo, mas o
g8 do líder rodou com o `degraus.js`, sem elas. O que importa aqui é o porquê de cada obra.)

## 2. A obra longe dos armazéns (T-760) — medida, feita, medida de novo

**Antes** (`longe.js`, megalópole, Mênfis, 140 pessoas, 12 construtores; um teatro de 24 m; o armazém do povo mantido cheio do
que a obra pede, para medir só o caminho):

| | a 14 casas de um armazém | a 35 casas |
|---|---|---|
| ano 1 | 132 em 33 entregas de 9 pessoas; 51% | 36 em 9 entregas de 7 pessoas |
| ano 2 | 48 em 12 entregas; 71% | 30 em 8 entregas |
| ano 3 | 76 em 19 entregas; **pronta** | **nada: 0 entregas**; parada em 75% (e parte do que tinha veio das pedras do próprio lote) |

O que os construtores faziam com o dia: 30 a 41% dormindo, 12 a 16% andando com a carga para a obra grande, 5 a 8% indo ao
armazém, 2 a 4% assentando. O trabalho de assentar é pouco (a obra inteira do teatro são 200 segundos de um construtor): **o
relógio de uma obra é o material que chega**, quatro de cada vez nas mãos de cada um. A 35 casas, menos de uma viagem por dia
de cada construtor.

**Feito (D-215, commit `7840218`)**: a carroça da obra grande (`city.js`, `Ci.workCart`). O canteiro já existia — o lugar `o:` do
depósito, o que chegou a uma obra e ainda não foi assentado (L-246) —; faltava quem levasse de longe. A obra grande com a vez
(`set.vez`, `set.gw`) a mais de 12 casas (`Ci.WORK_FAR`) do armazém mais perto recebe por carroça de bois do povo que sabe a
roda: 20 de cada vez (`WORK_LOAD`), duas a caminho no máximo (`WORK_CARTS`), a cada 20 s (`WORK_EVERY`), do armazém mais perto
da obra ao canteiro, pelo livro nas duas pontas («carroca-obra» `f:` → `c:`, «obra-carroca» `c:` → `o:`). A carroça cuja obra fica
pronta, cai, é largada, queima ou muda de povo leva a carga para casa («carroca-volta», ao armazém do povo que a mandou). O
relógio e o dia em que não achou caminho são da cidade (`set.cartT`, `set.cartNo`: no save). O que as carroças trazem conta
como «a caminho» para quem iria buscar (`Ci.carted(b, k)`, lido das próprias carroças; `villagers.js` `coming`): a conta da obra,
`b.incoming`, continua só das mãos dos construtores (a invariante do ofício não muda). O povo sem a roda continua levando nas
mãos (aberto: T-768).

**Depois**: na prova (`canteiro` c1e, o mesmo mundo com e sem carroça, a 37 casas, em dois anos): **79 → 227** entraram na obra
(92% pronta). No `longe.js` a 35 casas: pronta em 2 anos (antes: 75% em três e parada).

## 3. A terra (T-761) — medida

**Quantas capitais com gente e pedra para um degrau maior não acham lote** (`terra.js`, pelas buscas do próprio planejador, do
maior degrau que pagam para o menor; os mundos prontos da geração 19):

| mundo | capitais (nível 2+) que justificam e pagam algum degrau maior | sem lote para nenhum | tipos com lote / sem lote (antes) | (com o aplainar, EM CURSO) |
|---|---|---|---|---|
| metrópole (ano 58) | 5 | 1 (Mênfis) | 6 / 17 | 8 / 15 |
| megalópole (ano 50) | 4 | 2 (Argos, Hedeby) | 11 / 9 | 18 / 2; nenhuma capital sem lote |
| anos 500 | 2 | 2 (Skagen, Mênfis) | 0 / 10 | 3 / 7 |
| anos 1000 | 2 | 2 | 0 / 11 | 0 / 11 |
| mundial, cidade | 2 e 1 | 0 | — | — |

**O que tapa o chão** (a parte dos lotes do tamanho, até onde a cidade procura, que cada coisa barra; uma capital por linha):
- metrópole, o palácio de 6 de Argos: 75% prédio de outra cidade, 59% relevo além do pódio, 45% água, 41% penhasco em volta; o
  lote seco e vazio mais perto, a 13 casas, tem 10,8 m de relevo. A maravilha de 10: 87% / 86% / 68% / 56%.
- metrópole, Mênfis (tudo): 68 a 86% água, 45 a 51% prédio de outra cidade, 33 a 57% relevo.
- megalópole, Argos e Hedeby (6 casas): 57 a 79% água, 40 a 65% relevo, 34 a 40% prédio da cidade que não cai.
- anos 500 e 1000, Mênfis (772 a 979 de pedra em estoque): 54 a 75% água, 47 a 67% prédio de outra cidade, 39 a 66% muro ou
  estrada, 48 a 67% relevo; «nenhum seco e sem prédio» para 8 e 10 casas.
- as casas baixas da própria cidade quase nunca são o que barra: dobrar ou triplicar o que uma obra pode derrubar não abre lote
  nenhum, em nenhuma capital; os campos das cidades-irmãs também não.

**O que cada regra candidata abriria** (cada uma posta à prova nas buscas do planejador, uma capital sem lote por vez):

| regra | o que abre |
|---|---|
| o relevo: pódio de 4, 5, 6 níveis em vez de 3 (sem aplainar) | metrópole: o palácio de Argos (4), o grande palácio de Roma e de Hedeby (6), a maravilha de Roma e de Hedeby só com 8; megalópole: o teatro e o grande palácio de Argos e de Hedeby (4 e 5), o colossal de Mênfis e de Roma (5), a maravilha de Hedeby (8); anos 500/1000: os degraus de 4 de Mênfis (4 e 5) |
| **aplainar** (a D-120 (3): corte e aterro de até 3 níveis, o pódio por cima — relevo de até 13,5 m) | o que está na coluna «com o aplainar» acima: na megalópole o colossal de Mênfis e de Roma, o teatro e o grande palácio de Argos, o teatro, o palácio e o grande palácio de Hedeby; na metrópole o palácio de Argos e o grande palácio de Roma, e os outros lotes ficam mais perto (as termas de Argos de 34 para 17 casas do meio); nos anos 500, os degraus de 4 de Mênfis |
| aplainar com 4 ou 5 níveis em vez de 3 | quase nada a mais (só o grande palácio de Hedeby da metrópole) |
| procurar mais longe: 8 casas além (o raio + 14 e + 20) | **depois do aplainar**: metrópole, o templo e o palácio de 6 de Mênfis, o grande palácio de Hedeby e de Tenochtitlan; megalópole, **a maravilha e o colossal de Hedeby** |
| derrubar mais casas baixas (o dobro, o triplo) | nada |
| os campos das cidades-irmãs | nada |
| a maravilha de 10 na metrópole (Roma, Hedeby, Argos, Mênfis) | **nenhuma regra abre**: 68 a 86% de água, 50 a 87% de prédio de outra cidade, e o relevo dos poucos lotes secos passa de 13,5 m. Só a reserva cedo (D-121) — que com o aplainar passa a poder guardar um lote que se aplaina |

## 4. O que foi feito no `77cf5d9` (o aplainar, a renda média, a pedra que escapava)

1. **O aplainar (D-217)**, no `js/village.js`: `earth(x, y, n, apply, plan)` / `V.earthOf` / `V.earthPlan` / `V.podiumFits` /
   `V.levelLot`, `V.LEVEL = 3`, `V.EARTH = 2`, `V.LEVEL_LAST`. A regra: os cantos do lote são trazidos para uma faixa da altura do
   pódio (menos um centésimo: as alturas vão ao save com dois decimais), a meio entre o mais baixo e o mais alto; os cantos a uma
   e a duas casas seguem por dois terços e um terço; um canto da margem que toca água, boca de caverna, muro, estrada (de
   calçada para cima) ou prédio que não é campo fica onde está, e um canto da beira do lote que toca um desses barra o lote;
   nenhum canto mexe mais de 3 níveis (4,5 m); o anel fica sem penhasco e nenhuma casa seca da margem vira um. Os códigos do
   `V.earthOf`: 0 o pódio cobre; > 0 a terra a mover (a soma dos níveis de todos os cantos); -1 relevo demais (mais que o pódio e
   duas vezes `V.LEVEL`: 13,5 m); -2 água, caverna ou beira do mapa; -3 muro, estrada ou prédio; -4 um canto mexe demais; -5
   penhasco. **O plano primeiro**: `V.findSite` pergunta os lotes que o pódio cobre em todos os anéis (o raio, + 6, + 12) e só
   então, com a marca `levelOK`, os que se aplainam, na mesma ordem; `V.openSite` põe um lote que se aplaina atrás de todos os
   planos (`V.LEVEL_LAST`); o campo guardado (`resLot`) fica com o plano mais perto e, sem nenhum, com o aplainável mais perto.
   A ampliação no lugar (`lotFor` com `own`) continua só com o pódio: um prédio de pé não tem o chão mexido debaixo dele.
   `V.startProject` aplaina antes de fundar um degrau maior de obra pública (`b.terra`, a linha na crônica: «Mênfis aplainou o
   chão para o Palácio Colossal: o lote tinha 7,2 m de relevo.») e avisa o mapa (`S.typeVer++`, `W.invalidateLand()`,
   `W.touchWalk()`, `G.Relief.fixArea`, as pessoas no lugar postas no chão novo); `V.workOf` soma a terra (`b.terra × V.EARTH`).
2. **A renda média (D-216)**: `V.stoneMean(fid)` — a média lenta dos anos, guardada ao lado da conta do ano (`f.pedra[3]` o dia
   até onde a média foi levada, `f.pedra[4]` a média; um quinto de cada ano que passa, `V.MEAN`; os anos sem pedra contam; uma
   conta sem média, a de um save de antes ou a posta à mão por uma prova, começa no último ano inteiro). `V.affords` pergunta o
   estoque mais **15** anos (`V.YEARS`, eram 20) da **menor** entre a renda do último ano (`V.stoneIncome`) e a média.
3. **L-783, a pedra que escapava**: o armazém é do povo inteiro (L-714), e a pedra que a obra grande guarda saía para (a) as casas
   novas das cidades-irmãs — o planejador escolhia o tipo de casa (`Ci.homeType`: sobrado com 22 de pedra, ínsula com 40) pelo
   estoque inteiro: agora pelo estoque menos o que as obras grandes do povo guardam (`V.stoneKept`), no `plan()`; e (b) quem
   chegava primeiro ao armazém — a obra grande a 8 casas de um armazém esperava as mãos da turma enquanto as obras pequenas das
   irmãs, ao lado do armazém delas, levavam: a carroça serve toda obra grande com a vez a mais de **6** casas do armazém mais
   perto (`Ci.WORK_FAR`, era 12) e deixa **20** de pedra no armazém (`Ci.WORK_FLOOR`), para o poço e a oficina de quem mora ali.
   Medido no `degraus` g4e (Roma da metrópole, o teatro de 24 m, 150 de pedra dados ao povo): em dois anos a obra recebia 8 a 9
   (o resto: sobrados de Lavínio, Óstia, Cápua e Tíbur, um ourives, uma forja, um poço); agora **85**.
4. **As provas vizinhas que mudaram com isto** (no mesmo commit): `degraus` g3 ouve o livro desde a fundação (com a carroça o
   teatro da prova fica pronto no primeiro ano), g4 acaba as obras do povo inteiro antes de medir, g5 pergunta o degrau com o
   chão como o planejador o acha (sem os outros templos da cidade um lote que se aplaina guarda o templo de 24 m em vez do de
   16) e confere o trabalho com a terra movida. A `escala` e7b/e8b/e9b falhava com a primeira forma do aplainar (um lote
   aplainável perto ganhava de um plano mais longe, e um templo era erguido de novo em vez de ampliado): por isso «o plano
   primeiro»; hoje `ONLY=e0,e7,e8,e9,e10,e15,e16,e21 node escala.js` não acusa nada.

## 5. O que mediu o `tempo.js` (quanto leva um teatro de 24 m, a capital alimentada, a pedra por conta dela; já com a carroça)

| capital (metrópole) | gente, adultos, construtores | a que distância | por ano | no ritmo |
|---|---|---|---|---|
| Tenochtitlan | 118, 64, 10 | 31 casas | 97, 10, 6, 2, 3, 4 | 55% em 6 anos; uns 12 ao todo — **a pedra acaba**: gasto o estoque (93), chegam 2 a 10 por ano |
| Mênfis | 104, 58, 10 | 30 casas | 98, 62, 15, 4, 3, 9 | 77% em 6 anos; uns 8 ao todo — a pedra acaba |
| Roma | 41, 23, 4 | 28 casas | 41, 7, 26, 8, 12, 20 | 51% em 6 anos; uns 13 ao todo |
| Hedeby | 33, 20, 3 | 19 casas | 64, 17, … | **pronta em 3 anos** (o povo com 92 de pedra por ano) |

A lição: com a carroça e a turma, **o que decide o tempo é a pedra que o povo tem por ano**, não o tamanho da capital. A renda
de um ano (a que o `V.affords` usava, vezes 20) é a de um ano bom: Tenochtitlan tinha 156 no ano medido e uns 5 por ano nos
seis seguintes, com as rochas em volta quebradas. Daí a D-216 (a média dos anos, 15 anos).

## 5b. «Não custar a cidade» (T-764): três sementes do zero, 60 anos, antes e depois

Continente de 128, 4 povos, 60 anos de salto, sem a mão do deus (`scratchpad/ag/M/vida.js`; as saídas em `scratchpad/ag/M/m1/`).
«Antes» é o código do `b2b61f0` (a base da rodada, exportada em `scratchpad/ag/M/base2/`); «depois», o do `77cf5d9`.

| semente | | gente | adultos sem casa | com fome no ano 61 | mortos de fome em 60 anos | cidades | casas | degraus grandes de pé / em obra |
|---|---|---|---|---|---|---|---|---|
| 41 | antes | 217 | 1 | 25 | 2 | 9 | 48 de pedra, 25 cabanas, 8 sobrados | 1 / 0 |
| 41 | depois | 243 | 1 | 13 | 2 | 10 | 36 de pedra, 43 cabanas, 8 sobrados | 1 / 2 |
| 7 | antes | 217 | 1 | 27 | 3 | 10 | 37, 60, 13 | 2 / 0 |
| 7 | depois | 243 | 0 | 21 | 4 | 12 | 37, 72, 13 | 2 / 1 |
| 103 | antes | 190 | 7 | 9 | 1 | 10 | 25, 60, 11 | 0 / 2 |
| 103 | depois | 200 | 0 | 15 | 1 | 12 | 39, 68, 11 | 0 / 1 |

A cidade não pagou: mais gente nos três mundos (+12%, +12%, +5%), a fome igual (7 mortos de fome antes, 7 depois, em 180 anos de
mundo), ninguém a mais sem casa. Na semente 41 há menos casas de pedra e mais cabanas (48/25 → 36/43): é a L-783 — enquanto a
obra grande guarda a pedra, as casas novas são de madeira.

**O que cada capital fundou e acabou em 60 anos:**

| semente | antes | depois |
|---|---|---|
| 41 | templo de 16 m de Argos (42 pessoas): ano 32 → 45, **13 anos**. Mais nada | o mesmo templo (ano 32 → 45: o mundo é o mesmo até ali); **o palácio de 24 m de Mênfis** (30 pessoas) fundado no ano 52, 85% aos 9 anos (faltam 46 de pedra); **o palácio de 24 m de Tenochtitlan** (31 pessoas) no ano 56, num lote aplainado, 98% aos 5 anos (faltam 5 de pedra). Antes estes dois eram fundados nos anos 69 e 77 (o g8 de antes, seção 1) |
| 7 | teatro de 24 m de Mênfis (47 pessoas): ano 33 → 51, **18 anos**; o templo de Hedeby ampliado para 16 m no ano 47, 1 ano | o mesmo teatro: ano 33 → 44, **11 anos**; o templo de Hedeby ampliado no ano 44, 5 anos; **o palácio de 24 m de Mênfis** fundado no ano 51 num lote aplainado, 60% aos 10 anos |
| 103 | teatro de 24 m de Hedeby (50 pessoas), ano 49: **35% em 12 anos**; a maravilha de 40 m de Tenochtitlan (47 pessoas), ano 54: **11% em 7 anos, faltam 740 de pedra**; o palácio de 24 m de Argos (34 pessoas), ano 54: perdido | **o templo de 16 m de Tenochtitlan** (46 pessoas), ano 53: 77% aos 8 anos (faltam 42 de pedra). A maravilha e o teatro que o povo não podia pagar não são mais fundados (D-216) |

## 5c. A pedra que não rende — o que mais segura as obras hoje (medido; não mexi)

Depois da carroça, do aplainar e da D-216, o relógio de toda obra grande dos mundos do zero é a pedra que o povo tira por ano.
Medido na semente 103, ano 56, com o código de agora (`geologia.js`, `turma.js`, `pedreira.js`):

- **O mundo inteiro (219 pessoas, 4 povos) entrega 97 de pedra por ano** aos armazéns. Um templo de 16 m pede uns 150, um
  palácio ou um teatro de 24 m uns 200, a maravilha de 40 m uns 850.
- **Não falta rocha**: Tenochtitlan (50 pessoas, nível 3, o templo de 16 m parado em 46% esperando 99 de pedra) tem a 26 casas
  do meio 4 rochas (125 de pedra), a 44 casas 17 rochas (550), todas alcançáveis, e chão rochoso onde se anda e a cidade
  alcança: 14 casas a 10 do meio, 41 a 26. `Vg.canQuarry` diz sim.
- **Faltam mãos na pedra**: a cidade tem 5 construtores (a turma, 15% de 29 adultos) e 2 mineiros — os dois na mina (o
  minério), nenhum na pedra. Num ano, de 574 amostras dos construtores (uma a cada 2 s): 27% dormindo, 17% «stalk» (um deles
  seguindo alguém para a sociedade secreta dele, o ano inteiro), 12% em peregrinação à caverna, 15% indo e vindo com a pouca
  pedra do armazém para o templo, 15% na vida de cada um (comer, água, loja, família, conclave), 3,5% calçando — e **3,1%
  quebrando pedra**. Em um ano a obra recebeu 14 de pedra, todos do armazém; da pedreira da turma, nada.
- Uma viagem à pedreira rende 3 de pedra (4 de uma rocha): com a vida que as pessoas têm (um ano são 200 s), um construtor que
  só quebrasse pedra traria uns 15 por ano.

**O que eu faria (não fiz: mexe em áreas de outros agentes ou é decisão de jogo — fica como T-769, aberto):**
1. mineiros de pedra quando a obra grande espera pedra: hoje os «mineiros» que a cidade tem vão todos para a mina, e a turma
   é de construtores (D-174) — o repartidor de ofícios (`assignJobs`, do agente X) poderia dar à cidade da obra um ou dois
   mineiros sem mina enquanto a obra guarda pedra;
2. a turma inteira na pedreira nos dias sem nada para assentar (hoje metade, pelo dia): dobra os 3% — pouco;
3. a carga da pedreira: uma padiola (dois levam 8) ou a carroça indo à pedreira — pede corpo e desenho (T-768).

## 6. As linhas do AUDIT (prontas para colar) — as partes FEITAS

| D-215 | decisão (do agente M, 2ª rodada, sobre a T-760) | **A carroça da obra grande.** Medido (megalópole, Mênfis, um teatro de 24 m com o armazém do povo cheio): a 14 casas de um armazém os construtores levam 33 cargas no primeiro ano e a obra fica pronta em três; a 35 casas, 9 cargas num ano e nenhuma no terceiro — o trabalho de assentar é pouco (200 s de um construtor para o teatro inteiro), o relógio de uma obra é o material que chega, quatro de cada vez, e a 35 casas cada construtor faz menos de uma viagem por dia. O canteiro já existia: o lugar `o:` do depósito, o que chegou a uma obra e ainda não foi assentado (L-246). Decidido (`city.js`, `Ci.workCart`): a obra grande com a vez (`set.vez`, `set.gw`) a mais de 12 casas (`Ci.WORK_FAR`) do armazém mais perto recebe por carroça de bois do povo que sabe a roda — 20 de cada vez (`WORK_LOAD`), duas a caminho no máximo (`WORK_CARTS`), uma a cada 20 s (`WORK_EVERY`) —, do armazém mais perto da obra ao canteiro, pelo livro nas duas pontas («carroca-obra», «obra-carroca»); os construtores assentam. A carroça cuja obra fica pronta, cai, é largada, queima ou muda de povo leva a carga para casa («carroca-volta»: ao armazém do povo que a mandou, nunca ao do vencedor). O relógio e o dia sem caminho são da cidade (`set.cartT`, `set.cartNo`, no save). O que as carroças trazem conta como «a caminho» para quem iria buscar (`Ci.carted`, lido das próprias carroças; `villagers.js` `coming`); a conta da obra (`b.incoming`) continua só das mãos dos construtores. Não é uma fogueira nem um prédio: nenhum núcleo novo do `G.Urban`, nenhum fogo das histórias. Depois: a 37 casas, em dois anos, 79 → 227 entraram na obra. Prova: `qa/canteiro.js` (35 linhas), `qa/canteiro-inv.js`. |
| T-768 | limite (aberto) | **O povo sem a roda leva a obra longe nas mãos.** A carroça da obra é do povo que sabe a roda (como as do comércio); sem ela a obra a 35 casas continua a uma carga por dia de cada construtor (`canteiro` c2d: 40 num ano). Um carregador de padiola — uma carga maior nas mãos de dois — pede corpo e desenho próprios. |

(As linhas da D-216, da D-217 e dos bugs que as provas vizinhas acusarem entram quando essas partes tiverem commit.)

## 7. As linhas do README, as entradas da regressão, as regras do guard, as frases do CLAUDE.md — as partes FEITAS

README:

| `canteiro.js` | `[ONLY=c1,c3] node canteiro.js [mundo]` | A carroça da obra grande (T-760, D-215), em Node, na megalópole: a obra a 37 casas de um armazém recebe pela carroça, as cargas pelo livro, nada some nem nasce, duas a caminho no máximo, vinte por carga, e contra o mesmo mundo sem carroça pelo menos o dobro em dois anos (c1); a obra perto não tem carroça, o povo sem a roda também não, sem a vez nenhuma nova (c2); a obra fica pronta (c3), o deus a derruba (c4), o fogo a leva (c7), a cidade é tomada (c6) com a carroça a caminho — a carga volta ao povo que a mandou, pelo livro; o save com a carroça a caminho e o mesmo futuro duas vezes (c5). ≈ 2 min. Cobre `city.js` (`Ci.workCart`, `Ci.carted`) e o `coming` do `villagers.js`. |
| `canteiro-inv.js` | (carregado pela prova: `M.load({ qa: true, extra: ['qa/degraus-inv.js', 'qa/canteiro-inv.js'] })`) | As invariantes da carroça da obra, para o `junta-inv.js` juntar: a carroça de uma obra não é de rota nenhuma, tem caminho, leva um material e no máximo `WORK_LOAD`, a carga de ida só na ida e a de volta só na volta, e no máximo `WORK_CARTS` a caminho de cada obra. |

`regress.sh` (fase «fundacao»): `F canteiro canteiro.js;`

Regra 75 do guard (texto e padrão): **«a porta de prova do planejador»** (T-767) — `V.planNow` só é chamada por provas e pelo modo
desenvolvedor: nenhum arquivo de `js/` fora do `village.js` e do `dev.js` tem `planNow(`.
```js
for (const f of files) if (f !== 'village.js' && f !== 'dev.js') src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/\bplanNow\s*\(/.test(c)) fails.push(`planejador: ${f}:${k + 1} chama o olhar do planejador (V.planNow) fora das provas e do modo desenvolvedor (T-767): ${l.trim().slice(0, 110)}`); });
```
Regra 76 do guard: **«a carroça da obra é do city.js»** (D-215) — só o `city.js` cria uma carroça de obra (`obra:` num objeto posto em
`S.carts`) e só ele escreve o relógio dela na cidade (`set.cartT`, `set.cartNo`).
```js
for (const f of files) if (f !== 'city.js') src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/\.cart(T|No)\s*(=(?!=)|-=|\+=)/.test(c) || /\bworkCart\s*\(/.test(c)) fails.push(`carroça da obra: ${f}:${k + 1} mexe na carroça da obra grande fora do city.js (D-215): ${l.trim().slice(0, 110)}`); });
```

CLAUDE.md (as portas novas):
- **A carroça da obra grande — `G.City.workCart` / `G.City.carted(b, k)`** (`js/city.js`, D-215): a obra grande com a vez a mais de
  12 casas do armazém mais perto recebe por carroça do povo que sabe a roda, vinte de cada vez, pelo livro («carroca-obra»,
  «obra-carroca»; a carga da carroça que perde a obra volta por «carroca-volta»). O canteiro é o lugar `o:` da obra (L-246). O que
  as carroças trazem conta como a caminho para quem iria buscar — pergunte a `Ci.carted`; `b.incoming` é só das mãos dos
  construtores. `qa/canteiro.js` prova.
- **O olhar do planejador — `G.Village.planNow(set)`** (T-767): a porta das provas e do modo desenvolvedor para um olhar do
  planejador agora; nada do mundo a chama (o `guard.js` cobra, regra 75).

## 8. A recomendação para a D-160 (a terra) — provisória, até as medidas de depois

1. **Aplainar (a D-120 (3)) é a regra que mais abre**, e é a que estou fazendo (D-217): pelos mundos prontos, de 17 lotes com
   terra e 47 sem, passa-se a 29 com e 35 sem, e na megalópole nenhuma capital fica sem lote. Três níveis de corte e de aterro
   bastam: quatro ou cinco quase não abrem mais nada.
2. **Procurar 8 casas mais longe** (os «de dentro» do raio + 6/+ 12 para + 14/+ 20) é a segunda: abre, depois do aplainar, o
   templo e o palácio de Mênfis da metrópole, o grande palácio de Hedeby e de Tenochtitlan e a maravilha de Hedeby da
   megalópole. Com a carroça a distância deixou de travar a obra. **Não fiz**: a D-120 (1) diz que os «de dentro» ficam perto,
   e é decisão do líder. Custa uma linha (`V.reachOf`).
3. **Derrubar mais casas baixas e tomar os campos das irmãs não abrem nada**: não recomendo.
4. **A maravilha das capitais velhas** (a metrópole: Roma, Hedeby, Argos, Mênfis; os anos 500 e 1000) não tem regra de terra que a
   abra: água e prédios de outras cidades. O que resta é a reserva cedo (D-121), que agora pode guardar um lote que se aplaina, e
   a maravilha noutra cidade do povo (D-121 (3), já feita).

## 9. O que ficou aberto (até aqui)

- T-768: o povo sem a roda (acima).
- A pedra que acaba em volta das capitais (as rochas são finitas; a pedreira das terras altas só onde há terra rochosa a 26
  casas): é o que mais segura as obras nos mundos do zero. Não mexi na economia da pedra.
