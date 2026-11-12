# Bloco M2 — a obra grande anda e acha terra (Bairros Vivos, o agente M, 2ª rodada)

Ramo: `worktree-agent-a8f5af9594fd9a4f1` (a base desta rodada: `b2b61f0`, o ramo do líder juntado). Números reservados: L-783 a
L-799, T-768 a T-779, D-215 a D-219, regras 75 e 76 do guard. **Este arquivo é mantido em dia a cada passo**: o que está marcado
«FEITO» está em commit; «EM CURSO» está na árvore sem commit; «A FAZER» não começou.

Os roteiros de medida ficam em `scratchpad/ag/M/` (a pasta inteira é
`/tmp/claude-0/-home-user-promptzada-de-adulto-do-dr-s-ntese/9e17ed97-a1b5-5d1c-a5da-c23519ea4f04/scratchpad/ag/M/`): `traca2.js`
(um mundo pelo salto: o que cada capital tentou, fundou, acabou, o que ficou parado e por quê), `vida.js` (a gente, a fome, as
casas e os degraus grandes por década; o que derruba um monumento), `terra.js` (que capitais não acham lote, o que tapa o chão,
que regra abriria), `longe.js` (uma obra a uma distância dada dos armazéns), `tempo.js` (quanto cada capital leva para erguer
um degrau sozinha), `contas.js` (a conta de cada degrau), `geologia.js`, `pedreira.js`, `turma.js`, `mina.js` (a pedra: onde
há, quem a quebra, cada ida à rocha), `sab-M2.py` e `fila2.sh` (as sabotagens e a fila de um `node` de cada vez). As saídas:
`traca2-s41-a.txt`, `traca2-s7-a.txt`, `terra-<mundo>*.txt`, `longe-mega-*.txt`, `tempo-metropole-teatro6.txt` (o começo da
rodada), `m1/` (as três sementes de 60 anos), `mb/` (o g8, os traços, a terra nos mundos do zero, a pedra), `mc/` (as vidas de
90 anos, o g8 e as provas com o código final), `qa/` (as provas vizinhas), `ms/` e `ms2/` (as sabotagens). `base2/` é o código
do `b2b61f0`, o «antes» de todas as medidas.

## 0. O estado de cada parte

| parte | estado | commit |
|---|---|---|
| T-767: a porta `V.planNow` e os dois casos que faltavam (`degraus` g1p, g5n2) | FEITO | `b70b0b0` |
| T-760: a carroça da obra grande (D-215), a prova `qa/canteiro.js` (c1 a c9) | FEITO | `7840218`, `77cf5d9`, `a47508e` |
| T-761: aplainar o lote (a D-120 (3)) — D-217, a prova `qa/aterro.js` t1 a t7 | FEITO | `77cf5d9`, `a47508e` |
| «o degrau do tamanho da pedra do povo»: a renda média e os 15 anos — D-216, `qa/aterro.js` m1 a m3 | FEITO | `77cf5d9`, `a47508e` |
| L-783: a pedra que a obra grande guarda escapava para as casas novas das cidades-irmãs (`degraus` g1h, g4e; `canteiro` c8) | FEITO | `77cf5d9`, `a47508e` |
| L-784: o degrau maior com a resistência do lote dele (`degraus` g9) | FEITO | `aa9ec8e` |
| a experiência «a pedra antes de assentar no dia da pedreira» | MEDIDA e NÃO ENTREGUE (seção 5d) | — |
| as medidas de antes e de depois: o g8 (1, 1b), a obra longe (2), a terra nos mundos prontos e do zero aos 60 e aos 100 anos (3), o tempo de cada degrau (5), a gente e a fome em quatro sementes aos 60 e aos 90 anos (5b), a pedra (5c) | FEITO | (neste bloco) |
| as sabotagens (38, `scratchpad/ag/M/sab-M2.py`, as saídas em `scratchpad/ag/M/ms/` e `ms2/`): 37 acusadas, uma sem caso (a14, T-773) | FEITO (seção 10) | — |
| as provas vizinhas com o código final: `degraus` g1 a g7, g1h, g1p, g9 (66 passam) e o g8 inteiro (ok); `aterro` (29), `canteiro` (52), `casa-rica` (48), `juntar` (24), `obra` (13), `calcada` (6), `lote-bolsao` (4), `moedas` (9), `muros` (30), `invariancia` (6), `escala` (127 passam; falham só as e19h e e19i, que já falhavam na base e são do agente X), `det3 77 arquipelago 96 3 2` (PASSOU), `urb1 41 128 90` (12 passam), a vida de 20 anos com o verificador (0 violações, nenhum erro), a vida curta, o guard | FEITO (todas com o código final, menos a `invariancia` e o `urb1`, que rodaram com o do `a47508e`: o que veio depois foi só a L-784 e a porta de leitura `Vg.coming`) | — |

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

## 1b. O g8 depois (o `degraus` g8 inteiro e os traços: dois mundos do zero, 90 anos, o código entregue)

`ONLY=g8 node degraus.js` (o código final, com a L-784): **DEGRAUS: ok** — **9 degraus grandes fundados, 5 de pé no ano 91** (um templo de 16 m, dois palácios de 24 m, um teatro de 24 m, um templo de 16 m; antes: 5 a 7 fundados, 4 de pé), o verificador limpo nos dois
mundos (com as invariantes da carroça e do aplainar). O que cada capital fundou e ACABOU (`traca2.js`, saídas em
`scratchpad/ag/M/mb/traca-s41-f.txt` e `traca-s7-f.txt`):

**Semente 41** — 454 pessoas no ano 91 (antes: 315); 4 fundados, 3 acabados:

| obra | cidade ao fundar | fundada | acabou | antes desta rodada |
|---|---|---|---|---|
| templo de 16 m | Argos (nível 3, 42 pessoas) | ano 32 | **ano 45 (13 anos)** | o mesmo (o mundo é o mesmo até ali) |
| palácio de 24 m | Mênfis (30 pessoas) | **ano 52** | **ano 65 (13 anos)** | fundado no ano 69, pronto no 85 (16 anos) |
| palácio de 24 m, num lote aplainado | Tenochtitlan (31 pessoas) | **ano 56** | **ano 67 (11 anos)** | fundado no ano 77; 31% em 14 anos, nunca acabou |
| palácio de 24 m | Argos (99 pessoas) | ano 88 | 33% em 3 anos | — (antes: as termas de 20 m, 97% em 7 anos; um templo, 26% em 3) |

**Semente 7** — 225 pessoas no ano 91 (antes: 495); 5 fundados, 3 acabados (`mc/vida90-s7-final.txt`):

| obra | cidade ao fundar | fundada | acabou | antes desta rodada |
|---|---|---|---|---|
| teatro de 24 m | Mênfis (47 pessoas) | ano 33 | **ano 44 (11 anos)**; de pé no ano 91 | ano 51 (18 anos) |
| templo ampliado para 16 m | Hedeby (46 pessoas) | ano 44 | ano 49 (5 anos); de pé | ano 47 → 48 (1 ano) |
| palácio de 24 m, num lote aplainado | Mênfis (30 pessoas) | ano 51 | ano 72 (**21 anos**: 60% aos 10; a cidade encolheu de 36 para 22 pessoas); **queimou no ano 76** | não era fundado |
| palácio de 24 m, num lote aplainado | Argos (41 pessoas) | ano 63 | **queimou em obra no ano 65**, com 55% | não era fundado |
| teatro de 24 m, num lote aplainado | Hedeby (37 pessoas) | ano 88 | 34% em 3 anos | não era fundado |

**De pé no ano 91**: semente 41, o templo e dois palácios, mais um palácio em obra (antes: o templo e um palácio); semente 7, o
teatro e o templo, mais um teatro em obra (antes: o teatro e o templo).

**O fogo leva os monumentos (L-784, T-771).** Com o código do `a47508e` a semente 7 perdia três das cinco obras grandes para o
fogo: o palácio de Argos em obra (ano 65), o teatro de Mênfis 27 anos depois de pronto (ano 71) e o palácio de Mênfis 17 anos
depois (ano 89) — `mb/vida90-s7-perdas.txt`. A causa de parte disso era um defeito dos degraus: a conta e o trabalho de um
degrau são os dele (D-106), mas a resistência era a do degrau clássico — um teatro de 24 m com os 320 de um de 12 —, e o fogo
tira o mesmo de um prédio de qualquer tamanho. Corrigido (L-784, seção 6): a resistência pelo lote; o teatro passa a
atravessar o incêndio do ano 71. O palácio de Mênfis ainda queima (ano 76, 4 anos depois de pronto) e o de Argos em obra
também: no jogo todo prédio que pega fogo queima até o fim se não chover (só o tipo «monument» não alimenta o fogo,
`nature.js` `Nat.fuel`), e ninguém apaga. Fica aberto (T-771), com a proposta D-219.

**A gente aos 90 anos.** Semente 41: 454 (antes 315). Semente 7: 225 (antes 495) — o mundo de depois é mais violento (294
mortos de guerra em 90 anos contra 187; 30 em golpes contra 19) e para de crescer entre os anos 61 e 91 (243, 253, 261, 225;
antes 217, 298, 397, 495); a fome é a mesma (5 mortos de fome em 90 anos nos dois) e nenhuma capital fica sem comida. Dois
mundos, dois sentidos: ver a seção 5b para as quatro sementes de 90 anos.

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

**Feito (D-215, commits `7840218` e `77cf5d9`)**: a carroça da obra grande (`city.js`, `Ci.workCart`). O canteiro já existia — o
lugar `o:` do depósito, o que chegou a uma obra e ainda não foi assentado (L-246) —; faltava quem levasse de longe. A obra
grande com a vez (`set.vez`, `set.gw`) a mais de 6 casas (`Ci.WORK_FAR`; eram 12 na primeira forma) do armazém mais perto
recebe por carroça de bois do povo que sabe a roda: 20 de cada vez (`WORK_LOAD`), duas a caminho no máximo (`WORK_CARTS`), a
cada 20 s (`WORK_EVERY`), deixando 20 de pedra no armazém (`WORK_FLOOR`, L-783), do armazém mais perto da obra ao canteiro,
pelo livro nas duas pontas («carroca-obra» `f:` → `c:`, «obra-carroca» `c:` → `o:`). A carroça cuja obra fica pronta, cai, é
largada, queima ou muda de povo leva a carga para casa («carroca-volta», ao armazém do povo que a mandou); o que a obra já não
espera ao chegar volta na carroça. O relógio e o dia em que não achou caminho são da cidade (`set.cartT`, `set.cartNo`: no
save). O que as carroças trazem conta como «a caminho» para quem iria buscar (`Ci.carted(b, k)`, lido das próprias carroças;
`villagers.js` `coming`): a conta da obra, `b.incoming`, continua só das mãos dos construtores (a invariante do ofício não
muda). O povo sem a roda continua levando nas mãos (aberto: T-768).

**Depois**: na prova (`canteiro` c1e, o mesmo mundo com e sem carroça, a 37 casas, em dois anos, com 20 de pedra deixados no
armazém): **71 → 203** entraram na obra (83% pronta). No `longe.js` a 35 casas (a primeira forma da regra): pronta em 2 anos
(antes: 75% em três e parada). Nos mundos do zero: o teatro de Mênfis da semente 7, a 23 casas de um armazém, de 18 para 11
anos.

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

**Nos mundos do zero, aos 60 e aos 100 anos** (`terra.js` com `SEMPAGAR=1`: todo degrau maior que a capital justifica, pague ou
não — só a terra; três sementes, continente de 128, 4 povos; «antes» o código do `b2b61f0`, «depois» o entregue; os mundos
de antes e de depois não são o mesmo mundo — o de depois já ergueu mais —, as contas são de cada um):

| semente | aos 60, antes | aos 60, depois | aos 100, antes | aos 100, depois |
|---|---|---|---|---|
| 41 | 5 tipos com lote / 11 sem; 1 de 3 capitais sem lote nenhum | 5 / 9; 0 de 3 | 0 / 19; 4 de 4 | 0 / 13; 3 de 3 |
| 7 | 2 / 17; 3 de 4 | 3 / 13; 2 de 3 | 0 / 17; 3 de 3 | 1 / 20; 3 de 4 |
| 103 | 4 / 10; 1 de 3 | 7 / 8; 1 de 3 | 2 / 8; 0 de 2 | 0 / 14; 3 de 3 |
| as três | 11 / 38; 5 de 10 | 15 / 30; 3 de 9 | 2 / 44; 7 de 9 | **1 / 47; 9 de 10** |

Aos 60 anos o aplainar ajuda (de 5 capitais sem lote nenhum para 3). **Aos 100 anos a terra acabou, com ou sem ele**: nenhuma
capital acha lote para quase nada, e nenhuma das regras candidatas abre (aplainar 4 ou 5 níveis, procurar 8 ou 14 casas mais
longe, derrubar o dobro, os campos das irmãs: zero em todas as capitais das sementes 41 e 7). O que tapa, no ano 101 (o código
entregue, `mb/terra-s41-100.txt`, `mb/terra-s7-100.txt`):
- Argos da semente 41 (nível 4, 109 pessoas na capital e 333 no povo, 81 de pedra por ano — pagaria tudo): 66 a 87% dos lotes
  com água, 62 a 77% com penhasco em volta, 60 a 77% com relevo além do pódio, 41 a 57% com prédio da cidade que não cai; o
  lote seco e vazio mais perto, a 22 casas, tem 10,5 m de relevo e penhasco no anel.
- Mênfis da semente 41: 80 a 91% com prédio de **outra cidade** (13 cidades num continente de 128), 56 a 82% com relevo.
- Mênfis da semente 7 (o teatro e o palácio de 6): 73% água, 53% prédio de outra cidade, 53% relevo; o seco mais perto tem
  16,9 m de relevo.

## 4. O que foi feito no `77cf5d9` e no `a47508e` (o aplainar, a renda média, a pedra que escapava)

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

## 5. Quanto tempo leva cada degrau (o que o líder pediu: cidades de 40, 80, 120 pessoas)

**A conta de pedra de cada degrau** (`contas.js`; um povo de tijolo paga uma parte em adobe):

| degrau | pedra | madeira | trabalho |
|---|---|---|---|
| templo de 16 m / de 24 m / de 32 m | 121 / 154 / 231 | 62 / 79 / 118 | 143 / 234 / 358 |
| teatro de 24 m / 32 m / 40 m | 200 / 272 / 368 | 60 / 82 / 111 | 200 / 320 / 440 |
| termas de 20 m / de 28 m | 130 / 180 | 37 / 51 | 156 / 234 |
| palácio de 24 m / grande palácio de 32 m / colossal de 40 m | 210 / 432 / 1008 | 105 / 162 / 306 | 250 / 572 / 1584 |
| maravilha de 40 m / de 52 m | 768 / 1200 | 192 / 300 | 1200 / 1950 |
| biblioteca de 16 m, monumento de 16 m | 106, 225 | 48, 38 | 132, 225 |

**O que decide o tempo é a pedra por ano do povo, não o tamanho da capital.** Medido:

| capital ao fundar | a pedra do povo por ano | obra | tempo |
|---|---|---|---|
| 30 a 50 pessoas (o povo com 30 a 100; os mundos do zero até o ano 60) | 5 a 20 | templo de 16 m | 13 anos (Argos, s41), 10 (Tenochtitlan, s103), 4 (Argos, s211) |
| | | teatro de 24 m | 11 anos (Mênfis, s7; antes 18), 10 (Roma, s211) |
| | | palácio de 24 m | 13 e 11 anos (Mênfis e Tenochtitlan, s41), 21 (Mênfis, s7: a cidade encolheu) |
| 60 a 90 pessoas (Tenochtitlan da s103 do ano 63 ao 89) | uns 50 (pela conta: a maravilha são 768 de pedra em 15 anos) | teatro de 24 m | 5 anos |
| | | palácio de 24 m | 6 anos |
| | | maravilha de 40 m | **15 anos** (86 pessoas ao fundar, nível 4) |
| mundos prontos (`tempo.js`, um teatro de 24 m por cada capital sozinha, com a carroça) | 92 | Hedeby da metrópole, 33 pessoas | 3 anos |
| | uns 19 | Roma, 41 pessoas | uns 13 |
| | 156 no ano medido, uns 5 depois | Tenochtitlan, 118 pessoas | uns 12 (a pedra acaba) |
| | — | Mênfis, 104 pessoas | uns 8 |

Pela conta: com 15 de pedra por ano um templo de 16 m leva 8 anos, um teatro ou um palácio de 24 m 13 a 14, a maravilha 51;
com 40 por ano, 3, 5 e 19; com 80, um ano e meio, dois e meio e 10. A D-216 faz o planejador pedir o degrau que essa conta
fecha em 15 anos: a capital de 40 pessoas ergue o templo de 16 m ou o teatro de 24 m, não a maravilha.

## 5b. «Não custar a cidade» (T-764): quatro sementes do zero, aos 60 e aos 90 anos, antes e depois

Continente de 128, 4 povos, salto, sem a mão do deus (`scratchpad/ag/M/vida.js`; as saídas em `scratchpad/ag/M/m1/` — os 60
anos — e `mc/vida90-*.txt`, `mb/vida90-s7-antes.txt` — os 90). «Antes» é o código do `b2b61f0` (a base da rodada, exportada em
`scratchpad/ag/M/base2/`); «depois», o entregue (`aa9ec8e`).

**Aos 60 anos** (o que o líder pediu: a gente, a fome, as casas):

| semente | | gente | adultos sem casa | com fome no ano 61 | mortos de fome em 60 anos | cidades | casas (de pedra, cabanas, sobrados) | degraus grandes de pé / em obra |
|---|---|---|---|---|---|---|---|---|
| 41 | antes | 217 | 1 | 25 | 2 | 9 | 48, 25, 8 | 1 / 0 |
| 41 | depois | 243 | 1 | 13 | 2 | 10 | 36, 43, 8 | 1 / 2 |
| 7 | antes | 217 | 1 | 27 | 3 | 10 | 37, 60, 13 | 2 / 0 |
| 7 | depois | 243 | 0 | 21 | 4 | 12 | 37, 72, 13 | 2 / 1 |
| 103 | antes | 190 | 7 | 9 | 1 | 10 | 25, 60, 11 | 0 / 2 |
| 103 | depois | 200 | 0 | 15 | 1 | 12 | 39, 68, 11 | 0 / 1 |
| 211 | antes | 217 | 0 | 16 | 5 | 9 | 27, 49, 6 | 0 / 0 |
| 211 | depois | 163 | 0 | 6 | 8 | 10 | 30, 45, 7 | 1 / 0 |
| as quatro | antes → depois | 841 → 849 | 9 → 1 | 77 → 55 | 11 → 15 | | | 3 / 2 → 4 / 4 |

**Aos 90 anos:**

| semente | gente por década do ano 61 ao 91, antes | depois | mortos de fome em 90 anos | mortos de guerra | degraus grandes fundados, acabados, de pé no ano 91: antes | depois |
|---|---|---|---|---|---|---|
| 41 | 217, 279, 302, **315** | 243, 221, 329, **454** | 5 → 5 | 249 → 145 | 5, 2, 2 | 4, 3, **3** |
| 7 | 217, 298, 397, **495** | 243, 253, 261, **225** | 5 → 5 | 187 → 294 | 2, 2, 2 | 5, 3, **2** (dois queimados) |
| 103 | 190, 247, 315, **275** | 200, 208, 253, **323** | 3 → 3 | 290 → 199 | 5, 1, **0** (o teatro 77% em 42 anos, a maravilha 68% em 37, o palácio queimado) | 4, 4, **4**: o templo de 16 m (10 anos), o teatro de 24 m (5), o palácio de 24 m (6) e **a maravilha de 40 m de Tenochtitlan (15 anos, pronta no ano 89)** |
| 211 | 217, 309, 351, **438** | 163, 192, 224, **307** | 9 → 10 | 177 → 231 | 1, 0, 0 | 3, 2, **2** (o templo de Argos em 4 anos, o teatro de Roma em 10) |
| as quatro | **1523** | **1309** (−14%) | 22 → 23 | 903 → 869 | 13 fundados, 5 acabados, **4 de pé** | 16 fundados, 12 acabados, **11 de pé** |

O que isto diz, sem enfeite:
- **A fome quase não mudou**: em 90 anos, 22 mortos de fome nos quatro mundos antes e 23 depois; aos 60 anos, 11 e 15 (a
  diferença é a semente 211: 5 → 8). Os adultos sem casa no ano 61 caem de 9 para 1.
- **A gente**: aos 60 anos, igual (841 → 849). Aos 90, duas sementes sobem (+44%, +17%) e duas descem (−55%, −30%); a soma
  desce 14%. O que separa os mundos são as guerras (145 a 294 mortos de guerra por mundo em 90 anos, contra 3 a 10 de fome), e
  os mundos de antes e de depois deixam de ser o mesmo mundo na primeira obra grande. **Quatro sementes
  não me deixam dizer que a rodada não custa gente aos 90 anos, nem que custa**: é um risco aberto (T-772), e o líder tem a
  regressão para medir com mais mundos.
- **Os monumentos**: de 4 de pé para 11, e a primeira maravilha acabada por um povo sozinho.
- Na semente 41 há menos casas de pedra e mais cabanas aos 60 anos (48/25 → 36/43): é a L-783 — enquanto a obra grande guarda
  a pedra, as casas novas são de madeira; aos 90 anos, 81 de pedra e 55 cabanas (antes 97 e 35).

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

## 5d. A experiência «a pedra antes de assentar» — medida e NÃO entregue

Por que a turma quase não quebra pedra (`mina.js`, semente 103, ano 56): em ano e meio os 5 construtores de Tenochtitlan
**foram à pedra 4 vezes** — três interrompidas no caminho (a sede, a fome, a peregrinação), uma rendeu 4 de pedra. A regra de
hoje (D-174) manda à pedreira só quem não tem nada para assentar, e quase sempre há: uma carga de madeira para uma obra
pequena, uma pedra que a carroça de uma cidade-irmã deixou no armazém.

Experimentei: no dia da pedreira (metade da turma, pelo dia), com o armazém sem pedra, o construtor da cidade da obra grande
vai à pedra **antes** de qualquer obra (`villagers.js`, o `case 'construtor'` do `workTask`; o diff está em
`scratchpad/ag/M/d218-restrita.diff`, o caso de prova em `d218-g2q.diff`). Três sementes, 60 anos:

| semente | a primeira obra grande: sem a regra → com ela | gente no ano 61: antes da rodada / o entregue (`a47508e`) / com a regra | mortos de fome em 60 anos |
|---|---|---|---|
| 41 | o templo de 16 m de Argos: 13 → **7 anos** (o mesmo mundo até a fundação) | 217 / 243 / 197 | 2 / 2 / 2 |
| 7 | o teatro de 24 m de Mênfis: 11 → 11 anos | 217 / 243 / 158 | 3 / 4 / 6 |
| 103 | o templo de 16 m de Tenochtitlan: 77% em 8 anos → **5 anos** | 190 / 200 / 189 | 1 / 1 / 0 |

A regra dobra a pedra de duas das três obras, e a gente fica menor nas três sementes do que sem ela (−19%, −35%, −5%; contra
o código de antes da rodada, −9%, −27%, 0%). As guerras dominam esses números (92 a 163 mortos de guerra por mundo) e três
sementes não separam a causa do acaso; mas o canal existe por construção — os braços que vão à pedra são tirados das obras
pequenas da cidade (os campos, os poços, as oficinas) em metade dos dias —, e a 1ª rodada já tinha medido um quinto a menos de
gente com todo construtor ocioso na pedreira. «Sem custar a vida da cidade»: **não entreguei**. Fica na T-769, com os números,
para o líder decidir o preço (a regra é uma linha).

## 6. As linhas do AUDIT (prontas para colar)

| D-215 | decisão (do agente M, 2ª rodada, sobre a T-760) | **A carroça da obra grande.** Medido (megalópole, Mênfis, um teatro de 24 m com o armazém do povo cheio): a 14 casas de um armazém os construtores levam 33 cargas no primeiro ano e a obra fica pronta em três; a 35 casas, 9 cargas num ano e nenhuma no terceiro — o trabalho de assentar é pouco (200 s de um construtor para o teatro inteiro), o relógio de uma obra é o material que chega, quatro de cada vez, e a 35 casas cada construtor faz menos de uma viagem por dia. O canteiro já existia: o lugar `o:` do depósito, o que chegou a uma obra e ainda não foi assentado (L-246). Decidido (`city.js`, `Ci.workCart`): a obra grande com a vez (`set.vez`, `set.gw`) a mais de 6 casas (`Ci.WORK_FAR`) do armazém mais perto recebe por carroça de bois do povo que sabe a roda — 20 de cada vez (`WORK_LOAD`), duas a caminho no máximo (`WORK_CARTS`), uma a cada 20 s (`WORK_EVERY`), deixando 20 de pedra no armazém (`WORK_FLOOR`, L-783) —, do armazém mais perto da obra ao canteiro, pelo livro nas duas pontas («carroca-obra», «obra-carroca»); os construtores assentam. A carroça cuja obra fica pronta, cai, é largada, queima ou muda de povo leva a carga para casa («carroca-volta»: ao armazém do povo que a mandou, nunca ao do vencedor), e o que a obra já não espera ao chegar volta na carroça. O relógio e o dia sem caminho são da cidade (`set.cartT`, `set.cartNo`, no save). O que as carroças trazem conta como «a caminho» para quem iria buscar (`Ci.carted`, lido das próprias carroças; `villagers.js` `coming`); a conta da obra (`b.incoming`) continua só das mãos dos construtores. A estrada do povo que morre não leva a carroça da obra (ela não é de rota nenhuma). Não é uma fogueira nem um prédio: nenhum núcleo novo do `G.Urban`, nenhum fogo das histórias. Depois: a 37 casas, em dois anos, 71 → 203 entraram na obra. Prova: `qa/canteiro.js` (c1 a c9), `qa/canteiro-inv.js`. |
| D-216 | decisão (do agente M, 2ª rodada) | **O degrau do tamanho da pedra do povo: a renda média e quinze anos.** `V.affords` multiplicava por 20 a renda de pedra do último ano; a renda de um ano é a de um ano bom. Medido (metrópole, um teatro de 24 m por cada capital sozinha, com a carroça): Tenochtitlan (118 pessoas, 10 construtores) recebe 97 no primeiro ano e 10, 6, 2, 3, 4 nos seguintes — a renda do ano medido era 156 e a dos seis seguintes uns 5; nos mundos do zero a maravilha de Tenochtitlan da semente 103 (47 pessoas) ficava em 11% em 7 anos, faltando 740 de pedra, e o teatro de Hedeby em 35% em 12 anos. Decidido (`village.js`): `V.affords` pergunta o estoque mais `V.YEARS` = 15 anos da **menor** entre a renda do último ano (`V.stoneIncome`) e a média lenta dos anos (`V.stoneMean`: um quinto de cada ano que passa, `V.MEAN`, os anos sem pedra contados; guardada ao lado da conta do ano — `f.pedra[3]` o dia até onde foi levada, `f.pedra[4]` a média —, levada adiante na primeira pedra de cada dia; uma conta sem média — a de um save de antes — começa no último ano inteiro; quem pergunta de fora do passo do mundo recebe a mesma resposta e não escreve nada). Depois (semente 103, 60 anos): em vez da maravilha e do teatro parados, Tenochtitlan ergue o templo de 16 m (77% em 8 anos). Prova: `qa/aterro.js` m1 a m3; a invariante em `qa/aterro-inv.js`. |
| D-217 | decisão (do agente M, 2ª rodada, sobre a T-761: a D-120 (3) do líder) | **O lote aplainado.** Medido nos mundos prontos e nos do zero (bloco M2, seções 1 e 3): o relevo é o que mais barra o lote de um degrau grande — junto do lote seco e vazio mais perto de cada capital há 7 a 30 m dele, e o pódio cobre 4,5 —; na megalópole duas capitais com gente e pedra não achavam lote para degrau nenhum, na metrópole uma. Decidido (`village.js`, `earth` / `V.earthOf` / `V.earthPlan` / `V.podiumFits` / `V.levelLot`): o lote que o pódio não cobre pode ser aplainado pela obra antes da fundação — os cantos do lote trazidos para uma faixa da altura do pódio, a meio entre o mais baixo e o mais alto; os cantos a uma e a duas casas acompanham por dois terços e um terço; nenhum canto mexe mais de 3 níveis, 4,5 m (`V.LEVEL`: relevo de até 13,5 m); um canto da margem que toca água, boca de caverna, muro, estrada ou prédio que não é campo fica onde está, e um canto da beira do lote que toca um desses barra o lote; o anel fica sem penhasco e nenhuma casa seca da margem vira um; as alturas escritas são as do save (centésimos de nível). **O plano primeiro**: `V.findSite` pergunta os lotes que o pódio cobre em todos os anéis e só então os que se aplainam; `V.openSite` põe um lote que se aplaina atrás de todos os planos; o campo guardado (D-121) fica com o plano mais perto e, sem nenhum para o degrau, com o que se aplaina; a ampliação no lugar continua só com o pódio (um prédio de pé não tem o chão mexido debaixo dele). `V.startProject` aplaina ao fundar um degrau maior de obra pública (`b.terra`, a soma dos níveis movidos; a crônica: «Mênfis aplainou o chão para o Palácio de Milhões de Anos: o lote tinha 7,2 m de relevo.»), avisa o mapa (`S.typeVer++`, `W.invalidateLand()`, `W.touchWalk()`, `G.Relief.fixArea`, as pessoas no lugar postas no chão novo) e a terra movida entra no trabalho da obra (`V.workOf`: `b.terra × V.EARTH`). Depois, nos mundos prontos: os tipos com lote passam de 17 a 29 (de 64), e na megalópole nenhuma capital fica sem lote. Aplainar 4 ou 5 níveis quase não abre mais nada. Prova: `qa/aterro.js` t1 a t7; a invariante em `qa/aterro-inv.js`; `escala` e13a e `degraus` g5 passam a aceitar o lote aplainado. |
| L-783 | bug (achado pelo `degraus` g4e com a carroça posta) | **A pedra que a obra grande guarda escapava para as casas novas das cidades-irmãs.** Na metrópole, 150 de pedra dados ao armazém do povo de Roma com o teatro de 24 m esperando e a vez: em dois anos o teatro recebia 8 a 9 — o resto ia para sobrados de Lavínio, Óstia, Cápua e Tíbur, um ourives, uma forja, um poço. Causas: (a) o planejador escolhia o tipo da casa nova de uma cidade (`Ci.homeType`: sobrado com 22 de pedra no armazém, ínsula com 40) pelo estoque inteiro do povo — a L-714 só guardara a melhoria das casas de pé e os extras; (b) o armazém é de quem chega primeiro, e a obra grande a 8 casas de um armazém esperava as mãos da turma enquanto as obras pequenas das irmãs levavam. Correção: no `plan()` as casas novas contam só a sobra (`stH`: o estoque menos `V.stoneKept`); a carroça serve toda obra grande com a vez a mais de 6 casas do armazém (era 12) e deixa 20 de pedra nele (`Ci.WORK_FLOOR`), para o poço e a oficina de quem mora ali. Depois: o teatro recebe 85 em dois anos. Prova: `degraus` g1h (a cidade-irmã com gente sem casa funda uma cabana com a pedra guardada e um sobrado com a obra servida), g4e; `canteiro` c8. |
| L-784 | bug (achado medindo o que derruba um monumento pronto) | **O degrau maior tinha a resistência do degrau clássico.** A conta e o trabalho de um degrau são os dele (D-106), e a resistência (`b.hp`, `b.maxHp`) era a do tipo — um teatro de 24 m com os 320 de um de 12, um palácio colossal de 40 m com os 420 do palácio de 12. O fogo tira o mesmo de um prédio de qualquer tamanho (`nature.js`: o dano de cada casa em chamas dividido pelas casas do prédio), e levava o degrau grande no mesmo minuto de uma cabana grande. Semente 7, 90 anos: das cinco obras grandes, três perdidas para o fogo — o palácio de Argos em obra (ano 65), o teatro de Mênfis 27 anos depois de pronto (ano 71), o palácio de Mênfis 17 anos depois (ano 89). Correção (`village.js`, `V.hpOf(type, n)`): um degrau maior que o do tipo aguenta o que o lote dele é — a resistência do tipo vezes a área do lote sobre a do degrau clássico —, ao ser fundado (`V.addBuilding`), ao ser ampliado no lugar (`V.enlarge`: o dano que tinha, mantido) e ao desistir da ampliação (`V.ungrow`). Os prédios de um save de antes ficam como estavam (nada é decidido no load); os mundos prontos gerados de novo já nascem com ela. Depois: o teatro de Mênfis atravessa o incêndio do ano 71 e está de pé no ano 91. Prova: `degraus` g9 (o teatro de cada tamanho, o mesmo fogo, ampliado, salvo, desistido). |
| T-760 | limite → fechado | A obra longe dos armazéns: a carroça da obra grande (D-215). |
| T-761 | limite → fechado em parte | A terra: o lote aplainado (D-217); o que resta está na recomendação da D-160 e na T-770. |
| T-767 | limite → fechado | A porta de prova `V.planNow(set)` (só as provas e o modo desenvolvedor a chamam: regra 75 do guard) e os dois casos que faltavam: `degraus` g1p (nenhuma casa melhorada enquanto a obra grande espera pedra — a sabotagem s4 passa a ser acusada) e g5n2 (nunca uma segunda maravilha, com um chão de 13 casas livre dado ao planejador — a s9). |
| T-768 | limite (aberto) | **O povo sem a roda leva a obra longe nas mãos.** A carroça da obra é do povo que sabe a roda (como as do comércio); sem ela a obra a 35 casas continua a uma carga por dia de cada construtor (`canteiro` c2d). Um carregador de padiola — uma carga maior nas mãos de dois — pede corpo e desenho próprios. |
| T-769 | limite (aberto; medido, não mexido) | **A pedra não rende: é o relógio de toda obra grande.** Semente 103, ano 56: o mundo inteiro (219 pessoas, 4 povos) entrega 97 de pedra por ano; um templo de 16 m pede uns 150, um teatro ou um palácio de 24 m uns 200, a maravilha uns 850. Não falta rocha (Tenochtitlan, com o templo parado esperando 99: 17 rochas alcançáveis a 44 casas, 550 de pedra, e chão rochoso a 10 casas do meio); faltam mãos na pedra: 5 construtores na turma e 2 mineiros, os dois na mina; num ano os construtores passam 3% do tempo quebrando pedra (27% dormem, 17% um deles segue alguém para a sociedade secreta, 12% em peregrinação à caverna, 15% levam ao templo a pouca pedra do armazém). O que destravaria (decisão de jogo e áreas de outros): mineiros de pedra sem mina enquanto a obra grande guarda pedra (`assignJobs`); uma carga maior da pedreira (padiola, carroça); ou a turma à pedra antes de assentar no dia da pedreira — **experimentada e não entregue**: dobra a pedra de duas de três obras (o templo de Argos da semente 41 de 13 para 7 anos, o de Tenochtitlan da 103 para 5) e a gente fica menor nas três sementes aos 60 anos (243/243/200 → 197/158/189), sem que três sementes separem a causa do acaso das guerras (bloco M2, seção 5d; o diff em `scratchpad/ag/M/d218-restrita.diff`). |
| T-771 | limite (aberto; a proposta é a D-219) | **Todo prédio que pega fogo queima até o fim se não chover, e ninguém apaga.** Só o tipo «monument» não alimenta o fogo (`nature.js`, `Nat.fuel`); um templo, um teatro, um palácio, a pirâmide queimam como uma cabana, só mais devagar depois da L-784. Semente 7 com o código final: o palácio de 24 m de Mênfis queima 4 anos depois de pronto (21 anos de obra), o de Argos em obra com 55%. |
| D-219 | proposta (do agente M; **não feita**: é regra do fogo, decisão do líder) | **O monumento de pedra pronto não alimenta o fogo.** Estender a exceção do «monument» no `Nat.fuel` às obras públicas de degrau maior **prontas** (o teatro, o templo, o palácio, a maravilha: pedra), deixando queimar a obra em curso (os andaimes) — uma linha. Ou o contrário, o povo apagar (um balde do poço: corpo, gesto e som novos). |
| T-773 | limite de teste (aberto) | **A ordem do campo guardado não tem caso que a acuse.** O campo guardado (D-121) fica com o lote plano mais perto e só sem nenhum para o degrau com o que se aplaina (`resLot`: `best || lev`); a sabotagem a14 (`lev || best`) passa pelo `aterro` t6 — nos mundos prontos nenhuma das quatro capitais que guardariam um campo tem, para o mesmo degrau, um lote plano e um que se aplaina ao alcance. O caso de propósito pede o deus erguendo uma colina no lote plano mais perto (`G.Miracles.raise`). |
| T-770 | limite (aberto) | **A maravilha das capitais velhas não tem terra.** Na metrópole (Roma, Hedeby, Argos, Mênfis) e nos mundos de 500 e 1000 anos nenhuma regra de terra abre o lote de 40 m: 68 a 86% dos lotes têm água, 50 a 87% prédio de outra cidade, e o relevo dos poucos secos passa de 13,5 m. Resta a reserva cedo (D-121), que agora guarda também um lote que se aplaina (`aterro` t6: Roma e Argos da megalópole, Karnak do mundial), e a maravilha noutra cidade do povo (D-121 (3)). |

## 7. As linhas do README, as entradas da regressão, as regras do guard, as frases do CLAUDE.md

**README** (tabela das provas):

| `canteiro.js` | `[ONLY=c1,c3] node canteiro.js [mundo]` | A carroça da obra grande (T-760, D-215), em Node, na megalópole: a obra a 37 casas de um armazém recebe pela carroça, as cargas pelo livro, nada some nem nasce, duas a caminho no máximo, vinte por carga, ninguém busca o que a carroça traz, e contra o mesmo mundo sem carroça pelo menos o dobro em dois anos (c1); a obra perto não tem carroça, o povo sem a roda também não, sem a vez nenhuma nova (c2); a obra fica pronta (c3), o deus a derruba (c4), o fogo a leva (c7), a cidade é tomada (c6) com a carroça a caminho — a carga volta ao povo que a mandou, pelo livro; o save com a carroça a caminho e o mesmo futuro duas vezes (c5); a pedra que a carroça deixa no armazém, a madeira sem chão, duas a caminho no máximo, a estrada que morre (c8, L-783); a carga que a obra já não espera volta na carroça (c9); o que a carroça traz conta para quem iria buscar, e ninguém busca no armazém (c10). ≈ 2 min; 52 linhas. Cobre `city.js` (`Ci.workCart`, `Ci.carted`) e o `Vg.coming` do `villagers.js`. |
| `canteiro-inv.js` | (carregado pelas provas: `M.load({ qa: true, extra: [..., 'qa/canteiro-inv.js'] })`) | As invariantes da carroça da obra, para o `junta-inv.js` juntar: a carroça de uma obra não é de rota nenhuma, tem caminho, leva um material e no máximo `WORK_LOAD`, a carga de ida só na ida e a de volta só na volta, e no máximo `WORK_CARTS` a caminho de cada obra. |
| `aterro.js` | `[ONLY=t1,m2] node aterro.js` | O chão aplainado para a obra grande (T-761, D-217) e a renda de pedra ao longo dos anos (D-216), em Node, nos mundos prontos: o plano do aplainar em todo lote que se aplaina perto das capitais da megalópole e da metrópole — nenhum canto mexe mais de 3 níveis nem a mais de 2 casas do lote, nenhum toca água, caverna, muro, estrada ou prédio, o lote fica no pódio, o anel sem penhasco, cada canto vai aonde a regra manda — e cada causa de não se aplainar (t1); o planejador funda num lote aplainado onde o pódio não cobre nenhum: o chão escrito como o plano, a terra na obra e no trabalho dela, a crônica, o mapa avisado (t2); o save no meio, a obra pronta, o deus que a derruba — o chão fica (t3); o pódio primeiro: o mesmo lote que sem o aplainar, ali e em 50 buscas dos mundos prontos (t4); a ampliação no lugar só com o pódio, e um poço junto de um canto que mexeria barra o lote (t5); o campo guardado e o lote aberto: o plano primeiro (t6, t7); a porta que aplaina avisa o mapa (t8); a média da renda de pedra, um quinto de cada ano (m1); o povo pede pelo estoque e quinze anos da menor entre o último ano e a média (m2); pelo livro, quando o dia vira (m3). ≈ 1 min. Cobre `village.js` (`earth`, `V.levelLot`, `V.findSite`, `lotFor`, `resLot`, `V.openSite`, `V.startProject`, `V.workOf`, `V.affords`, `V.stoneMean`). |
| `aterro-inv.js` | (carregado pela prova) | As invariantes do aplainar e da renda média, para o `junta-inv.js` juntar: a terra de uma obra (`b.terra`) é um número de níveis maior que zero e só num degrau maior de obra pública; a conta da renda de pedra de um povo (`f.pedra`) tem o dia, o ano e o anterior, e a média (o dia até onde foi levada, não depois de hoje, e um número que não é negativo). |

E na linha do `degraus.js`: os casos novos g9 (a resistência do degrau, L-784), g1p (o olhar do planejador: nenhuma casa melhorada com a obra grande esperando pedra, T-767), g1h (as casas novas das cidades-irmãs pela sobra, L-783) e g5n2 (nunca uma segunda maravilha); a seleção sem o g8 passa a `ONLY=g1,g1h,g1p,g2,g3,g4,g5,g5t,g5m,g5v,g6,g7,g9` (≈ 3 a 5 min).

**`regress.sh`** (fase «fundacao»): `F canteiro canteiro.js; F aterro aterro.js;`

**Regra 75 do guard — «as portas do planejador»** (T-767, D-217): `G.Village.planNow` só é chamada pelas provas e pelo modo desenvolvedor, e só o `village.js` aplaina um lote (`V.levelLot`). (O `G.Space.planNow`, a planta feita na hora, é outra porta e fica fora do padrão.)
```js
for (const f of files) if (f !== 'village.js') src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if ((f !== 'dev.js' && /\b(Village|V)\.planNow\s*\(/.test(c)) || /\blevelLot\s*\(/.test(c)) fails.push(`planejador: ${f}:${k + 1} chama uma porta do planejador (V.planNow é das provas e do modo desenvolvedor, T-767; V.levelLot é do village.js, D-217): ${l.trim().slice(0, 110)}`); });
```
**Regra 76 do guard — «a carroça da obra é do city.js»** (D-215): só o `city.js` cria uma carroça de obra (`Ci.workCart`) e só ele escreve o relógio dela na cidade (`set.cartT`, `set.cartNo`).
```js
for (const f of files) if (f !== 'city.js') src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/\.cart(T|No)\s*(=(?!=)|-=|\+=)/.test(c) || /\bworkCart\s*\(/.test(c)) fails.push(`carroça da obra: ${f}:${k + 1} mexe na carroça da obra grande fora do city.js (D-215): ${l.trim().slice(0, 110)}`); });
```
(Conferido à mão com `grep` nos `js/*.js` de agora: nenhum dos dois padrões casa fora do arquivo dono.)

**CLAUDE.md** (as portas novas, para a lista das fundações):
- **A carroça da obra grande — `G.City.workCart` / `G.City.carted(b, k)`** (`js/city.js`, D-215): a obra grande com a vez a mais de
  6 casas do armazém mais perto recebe por carroça do povo que sabe a roda, vinte de cada vez, pelo livro («carroca-obra»,
  «obra-carroca»; a carga da carroça que perde a obra, ou que a obra já não espera, volta por «carroca-volta»), deixando 20 de
  pedra no armazém (`Ci.WORK_FLOOR`, L-783). O canteiro é o lugar `o:` da obra (L-246). O que as carroças trazem conta como a
  caminho para quem iria buscar — pergunte a `G.Vg.coming(b, k)` (as mãos e as carroças) ou a `Ci.carted`; `b.incoming` é só das
  mãos dos construtores. Só o `city.js` cria a
  carroça e escreve o relógio dela (`set.cartT`, `set.cartNo`; regra 76). `qa/canteiro.js` prova.
- **O lote aplainado — `G.Village.earthOf` / `earthPlan` / `podiumFits` / `levelLot`** (`js/village.js`, D-217): o lote de um degrau
  maior de obra pública que o pódio não cobre pode ser aplainado pela obra na fundação (até 3 níveis por canto, a margem de duas
  casas acompanha, nada mexe ao lado de água, muro, estrada, caverna ou prédio que não é campo, nenhum penhasco novo). Quem
  julga um lote com pódio pergunta a `V.podiumFits` — nunca `W.slope(...) <= V.PODIUM` sozinho —; a busca dá primeiro os lotes
  planos; a ampliação no lugar nunca aplaina; só `V.startProject` chama `V.levelLot` (regra 75), e a terra movida (`b.terra`)
  entra no trabalho da obra (`V.workOf`). `qa/aterro.js` prova.
- **A renda de pedra — `G.Village.stoneIncome` / `stoneMean` / `affords`** (D-120, D-216): um degrau maior é pedido pelo estoque
  mais `V.YEARS` (15) anos da menor entre a renda do último ano e a média lenta dos anos (`f.pedra`, no save com o povo). Quem
  pergunta de fora do passo do mundo não escreve.
- **As casas novas pela sobra** (L-783): enquanto uma obra grande do povo guarda pedra, o tipo da casa nova de qualquer cidade
  dele é escolhido pelo que sobra (`V.stoneKept`), como a melhoria das casas e os extras (L-714).
- **A resistência de um prédio — `G.Village.hpOf(type, n)`** (L-784): um degrau maior que o do tipo aguenta o que o lote dele é;
  quem funda, amplia ou desfaz a ampliação de um prédio pergunta a `V.hpOf` — nunca `def.hp` para um prédio de degrau.
- **O olhar do planejador — `G.Village.planNow(set)`** (T-767): a porta das provas e do modo desenvolvedor para um olhar do
  planejador agora; nada do mundo a chama (regra 75).
- No protocolo (item 3): «Mexeu no planejador das obras grandes…» ganha `node qa/canteiro.js` e `node qa/aterro.js`.

## 8. A recomendação para a D-160 (a terra), com os números de cada alternativa

O que medi (seção 3): nos mundos prontos de 50 a 60 anos, de 64 pares capital × tipo que justificam e pagam um degrau maior,
17 achavam lote; nos mundos do zero, aos 60 anos 11 de 49, e **aos 100 anos 2 de 46**. A terra em volta de uma capital acaba
entre os 60 e os 100 anos: água, penhasco, o relevo, os prédios da própria cidade que não caem e, cada vez mais, as outras
cidades.

| alternativa | o que abre | o que custa | o que fiz |
|---|---|---|---|
| **aplainar o lote** (a D-120 (3)): corte e aterro de até 3 níveis, o pódio por cima | mundos prontos: 17 → 29 de 64; megalópole: nenhuma capital sem lote; do zero aos 60 anos: capitais sem lote nenhum 5 de 10 → 3 de 9; aos 100 anos: nada | o trabalho da terra na obra (2 por nível); o chão muda uma vez, na fundação | **FEITO** (D-217) |
| aplainar mais (4 ou 5 níveis) | quase nada a mais (um grande palácio na metrópole; zero nos mundos do zero aos 100) | paredes de terra de 6 a 7,5 m junto das ruas | não |
| **procurar 8 casas mais longe** (os «de dentro» a raio + 14 e + 20) | mundos prontos, depois do aplainar: o templo e o palácio de 6 de Mênfis da metrópole, o grande palácio de Hedeby e de Tenochtitlan, a maravilha e o colossal de Hedeby da megalópole; do zero aos 100 anos: nada | o prédio cívico longe do centro (a D-120 (1) os quer perto); com a carroça a distância já não segura a obra (D-215) | **não fiz — recomendo** para os degraus de 8 e 10 casas (o grande palácio, o colossal), que não cabem em centro nenhum: uma linha no `V.reachOf` |
| derrubar mais casas baixas da própria cidade (o dobro, o triplo) | nada, em nenhuma capital | — | não |
| os campos das cidades-irmãs | nada | — | não |
| **guardar o campo cedo** (a D-121, hoje só para a maravilha e o colossal, só na capital de nível 3) | é a única que alcança os 100 anos: aos 60 ainda há lote para 15 de 45, aos 100 para 1 de 48. Com o aplainar a reserva já guarda um lote que se aplaina (`aterro` t6: Roma e Argos da megalópole e Karnak do mundial passam a ter campo para a maravilha) | um lote de 6 a 10 casas sem prédio por décadas (os campos da própria cidade podem ficar nele, como hoje) | **não fiz — é a decisão que recomendo ao líder**: a capital de nível 3 guardar, além do campo da maravilha, **um campo cívico de 6 casas** (o do teatro, do palácio ou do templo de 24 m, o primeiro que ela ainda não tem), pelas mesmas portas (`resLot`, `resFits`, `V.reservaDia`); e as cidades novas do povo não fundarem a menos de 20 casas de uma capital com campo guardado (o que mais tapa aos 100 anos é prédio de outra cidade: 53 a 91%) |

Em uma frase: **o aplainar destrava os primeiros 60 anos; depois disso só a terra guardada cedo** — e a distância entre as
cidades de um mesmo continente.

## 9. O que ficou aberto

- **T-768**: o povo sem a roda leva a obra longe nas mãos.
- **T-769**: a pedra não rende — o relógio de toda obra grande (seções 5, 5c e 5d). A experiência «a pedra antes de assentar»
  está medida e guardada (`scratchpad/ag/M/d218-restrita.diff`, `d218-g2q.diff`), não entregue.
- **T-770 e a D-160**: a terra acaba entre os 60 e os 100 anos; só a reserva cedo alcança (seção 8).
- **T-771 e a proposta D-219**: o fogo ainda leva o palácio pronto e a obra em curso; ninguém apaga.
- **T-772 (novo)**: a gente aos 90 anos — duas sementes sobem, duas descem, a soma desce 14% (seção 5b). Não sei separar a
  rodada do acaso das guerras com quatro sementes; a regressão do líder tem mais mundos.
- **O tempo de um palácio numa cidade que encolhe**: o de Mênfis da semente 7 levou 21 anos (a D-216 pede o que 15 anos da
  renda de então pagam; a renda caiu com a cidade). A obra não é largada: espera.
- **A última pedra**: o palácio de Tenochtitlan da semente 41 ficou em 98% do ano 61 ao 67 esperando 5 de pedra — a carroça
  não leva o que está abaixo dos 20 do chão do armazém (L-783), e as mãos da turma demoram. Uma regra possível: o chão não vale
  para a carga que acaba a obra. Não fiz: não medi.
- `terra.js`: nas termas de uma capital da semente 7 aos 100 anos o `V.landWhy` conta 7 lotes que servem e a busca não acha
  nenhum — as duas contas não são a mesma (o `landWhy` não aplica todas as regras da busca). Não olhei.
- **T-773**: a ordem do campo guardado (o plano antes do que se aplaina) não tem caso que a acuse — a sabotagem a14.
- Os números D-218 (reservado, não usado) e L-785 a L-799, T-774 a T-779 ficam livres.

## 10. As sabotagens (cada parte desfeita numa cópia nova do jogo, e a prova que a acusou)

`scratchpad/ag/M/sab-M2.py <pasta> <nome>` (com `check`: os 38 padrões casam com o código de agora); as saídas em
`scratchpad/ag/M/ms/` e `ms2/`. **37 de 38 acusadas.** As cinco que não foram acusadas na primeira passada (k3, k11, a7, a9, i5)
ganharam um caso novo cada uma e foram rodadas de novo; uma ficou sem caso (a14, T-773).

| | a parte desfeita | quem acusou |
|---|---|---|
| k1 | nenhuma carroça | `canteiro` c1b, c1d, c1e, c1g |
| k2 | a carga sem limite | `canteiro` c1d |
| k3 | sem limite de carroças a caminho | `canteiro` c8g (caso novo: a porta pedida quatro vezes com o armazém cheio) e o verificador (c8f, a invariante do `canteiro-inv.js`) — na primeira passada o c1d não acusava: a 37 casas, uma a cada 20 s, nunca passam de duas |
| k4 | a obra perto também ganha carroça | `canteiro` c2b |
| k5 | o povo sem a roda manda carroça | `canteiro` c2d |
| k6 | a cidade sem a vez manda carroça | `canteiro` c2e |
| k7 | a carroça que perde a obra some com a carga | `canteiro` c3c |
| k8 | a carroça segue para a obra da cidade tomada | `canteiro` c6c |
| k9 | a carroça não deixa pedra no armazém | `canteiro` c8b, c8c, c8d |
| k10 | a estrada que morre leva a carroça da obra | `canteiro` c8e |
| k11 | o que a carroça traz não conta para quem iria buscar | `canteiro` c10c, c10d (caso novo: a conta `Vg.coming`, e ninguém busca no armazém) — o c1g sozinho não acusava |
| k12 | a carga que a obra já não espera some na volta | `canteiro` c9c |
| k13 | a regra da distância de volta a 12 casas | `degraus` g4e |
| a1 | a fundação não aplaina | `aterro` t2b |
| a2 | sem limite do que um canto mexe | `aterro` t1a |
| a3 | os cantos da margem mexem ao lado de água, muro e prédio | `aterro` t1a |
| a4 | o canto da beira do lote junto de água ou prédio fica, e o lote aplaina assim mesmo | `aterro` t1a, t1b, t5c |
| a5 | penhascos no anel e na margem | `aterro` t1a |
| a6 | a ampliação no lugar aceita um lote que se aplaina | `aterro` t5b |
| a7 | o lote que se aplaina perguntado junto com os planos | `aterro` t4d (caso novo: 50 buscas dos mundos prontos dão o mesmo lote com e sem o aplainar) — o t4b sozinho não acusava |
| a8 | a terra movida não entra no trabalho | `aterro` t2d, t3a |
| a9 | o mapa não é avisado | `aterro` t8b (caso novo: a porta `V.levelLot` pedida sozinha) — no t2 a fundação que vem logo depois avisava por ela |
| a10 | as alturas escritas sem os centésimos do save | `aterro` t3a, t3c |
| a11 | sem linha na crônica | `aterro` t2d |
| a12 | a margem não acompanha | `aterro` t1a |
| a13 | relevo sem fim | `aterro` t1a, t1b |
| a14 | o campo guardado fica com o lote que se aplaina antes do plano | **não acusada** (T-773) |
| a15 | o lote aberto que se aplaina não vai para o fim | `aterro` t7a |
| i1 | a renda do último ano sozinha | `aterro` m2b |
| i2 | vinte anos | `aterro` m2c |
| i3 | os anos sem pedra não contam na média | `aterro` m1a |
| i4 | a média sozinha | `aterro` m2b |
| i5 | a média não é levada adiante quando o dia vira | `aterro` m3 (refeito: a primeira pedra do dia novo) |
| h1 | as casas novas das cidades-irmãs pelo estoque inteiro | `degraus` g1h3 |
| s4 | casas melhoradas com a obra grande esperando pedra | `degraus` g1p2 |
| r1 | o degrau maior com a resistência do tipo | `degraus` g9b, g9c |
| r2 | a ampliação no lugar fica com a resistência de antes | `degraus` g9d |
| r3 | a ampliação desfeita fica com a resistência maior | `degraus` g9d |

(E a s9 — nunca uma segunda maravilha —, acusada pelo `degraus` g5n2 no começo da rodada: `b70b0b0`.)
