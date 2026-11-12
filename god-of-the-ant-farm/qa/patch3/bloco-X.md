# Bloco X — o ofício que fica (Bairros Vivos, terceira leva)

Agente X. Números reservados: **L-950 a L-969, T-950 a T-969, D-210 a D-214; regras 73 e 74 do guard**.
Usados: **D-210 a D-214, T-950 a T-958** (nenhum L: o defeito era o T-840, de desenho). Ramo: `worktree-agent-ab1e0b6fbb80f0a8d`
(base `b2b61f0`). Rascunho, medidores e saídas: `scratchpad/ag/X/` (`mede.js` as trocas, `eco.js` a economia e as armas, `paz.js`
a volta depois da paz, `sab-X.py` as sabotagens, `fila8/` a última rodada de tudo, `fila9/` a prova inteira antes da junção,
`fila10/` a árvore juntada; a cópia do jogo de antes, com ganchos no repartidor: `copias/antes.ks3Ym3`). As cópias descartáveis
do jogo (as das sabotagens e as de depuração, 2,3 G) foram apagadas: o rascunho ficou com 97 M. No repositório ficam a prova `qa/oficio-fica.js`, as regras `qa/oficio-fica-inv.js` e o
medidor `qa/oficio-eco.js`.

## 0. Estado: o que foi feito, o que não foi

**Feito** (commits em `git log --oneline b2b61f0..HEAD`):
1. *Medido primeiro* (seção 1): quantos adultos trocam de ofício, quantas vezes, entre quais ofícios, por qual ramo do
   repartidor e por quê, na metrópole e na mega prontas e num mundo do zero.
2. *A regra* (seção 2; D-210 a D-214): a memória da cidade, a mão mais nova sem sorteio, três dias no ofício tomado, as
   emergências que passam por cima e devolvem, o celeiro por graus, a causa dita. Campos novos da pessoa na lista `SHAPE`
   (`roleDay`, `roleBack`); a memória da cidade (`set.ofm`) vai no save com a cidade; um save de antes carrega e vive (x10).
3. *A cidade não morre de fome* (seção 2): dez mundos do zero de 40 anos e os dois mundos prontos vividos dez dias, antes e
   depois — a gente, os mortos de fome e de guerra, a comida, a madeira e a pedra produzidas, os prédios, as cidades, **e as
   armas**. A medida achou dois custos da primeira regra (o exército que guardava os soldados da melhor hora; o exército que
   voltava para casa em dia e meio depois da paz) e os dois foram consertados e medidos de novo.
4. *O que se vê* (seção 2): o que há em volta das casas muda a metade do que mudava; quem mora numa casa com um ofício que
   ela mostra fica com ele (80 % e 92 % nos dias da prova, onde era 62 % e 76 %); quintal, roupa e sabe passam.
5. *A prova* `qa/oficio-fica.js` (x1 a x15, 63 linhas) com as regras `qa/oficio-fica-inv.js`, e **36 sabotagens** (seção 3):
   34 acusadas pelo caso delas; duas guardas ficam sem caso próprio (ditas).
6. *As outras provas* (seção 3): as 34 rodadas com a regra final — 27 passam; as que falham, uma a uma, com o que se viu.
7. *O ramo do líder juntado* (`bedce41`; o commit da junção `64f498d`, e o da prova depois dela `f7a1d5a`): a junção foi
   automática; na árvore juntada o guard passa, a vida curta não tem violação nem erro e a prova inteira passa (63 linhas)
   — seção 3.

**Não feito / aberto** (seção 10): o `qa/vida-bairro.js` v6 (T-956); a cidade a que faltam mãos (T-950); os mundos
prontos não foram gerados (não são meus: a mudança os muda — seção 9); as regras 73 e 74 do guard, a junção das regras no
`qa.js`, o `regress.sh`, o AUDIT, o README e o CLAUDE.md são do líder (os textos estão nas seções 4 a 8).

**Nota:** não existe `qa/oficios.js` (o pedido o cita): as provas dos ofícios são `load-oficio.js`, as cinco «-mao» e as do
mundo pronto (`olaria`, `taverna`, `termas`, `lazer`, `obra`) — foram essas as rodadas (T-953).

## 1. O que foi medido (antes — geração 19, o jogo em `b2b61f0`)

O medidor (`mede.js`, em Node pelo `nodemundo`) olha o `v.role` de todos a cada passo e, numa cópia do jogo com ganchos no
`assignJobs` (`instr.py`), o que cada ofício pedia em cada passada e qual ramo fez cada troca.

| mundo | adultos | trocas de ofício por dia | por adulto por dia | por cidade por dia | trocaram | três vezes ou mais | seis ou mais | idas e voltas A→B→A |
|---|---|---|---|---|---|---|---|---|
| metrópole (2 dias no passo, 19 cidades) | 337 | 231 | 0,69 | 12 | 195 | 62 | 14 (o que mais: 12) | 120 |
| mega (2 dias no passo, 10 cidades) | 261 | 110 | 0,42 | 11 | 105 | 31 | 4 (o que mais: 9) | 45 |
| do zero, semente 103, anos 20 a 30 no salto (4 cidades) | 76 | 16 | 0,22 | 4 | 75 | 24 | 5 (o que mais: 14) | 39 |

- **Quem faz a troca:** todas pelo ramo «sobra → falta» do `assignJobs` (três por passada de 4 s); os moços que fazem 16 (17
  em 2 dias na metrópole) e os velhos que fazem 62 (8) são poucos. A mudança líquida do censo dos ofícios em 2 dias — o que de
  fato precisava mudar — foi 89 na metrópole (de 462 trocas) e 57 na mega (de 221): **o resto é ida e volta** (causa que não
  dura). No mundo do zero, 11,5 de 183.
- **Entre quais:** na metrópole, campo → campo 203, oficina → guerreiro 59, campo → oficina 55, oficina → campo 53, oficina →
  oficina 39 — **o ofício de oficina com prédio (`v.job`) não era mais estável que o do campo**: trocava com a meta do teto dos
  ofícios e com os soldados. Os pares: mineiro ↔ caçador 55, mineiro → agricultor 15, lenhador → mineiro 13, lenhador → coletor 11.
  No mundo do zero: açougueiro ↔ caçador 15, guerreiro → agricultor 8, caçador ↔ marinheiro 13, marinheiro ↔ mineiro 12.
- **Por quê (o que o instante pede não para quieto):** em 2 dias, nas 19 cidades da metrópole, o pedido de mineiros mudou 130
  vezes, o de caçadores 128, lenhadores 81, guerreiros 63, agricultores 43, construtores 39, coletores 35. O que vira: as feras a
  menos de 20 casas (`threats`: 270 vezes — um caçador a mais, um mineiro a menos), o que as oficinas pedem com o estoque do
  instante (`ecoN`: 107), o número de adultos (65), as obras (49), e **o celeiro que cruza a marca e volta** (`fed`: 42 vezes —
  cada vez, a metade dos agricultores da cidade larga a roça ou volta: 9 das 64 mãos de Tenochtitlan; e o corte do resto mínimo
  tira 7 ofícios de oficina junto). Em Tenochtitlan o celeiro cruzou a marca cinco vezes em um terço de dia.
- **Causas duráveis** (a troca que tinha de acontecer): o moço que faz dezesseis, o velho que faz sessenta e dois, a morte de
  quem tinha o posto, a oficina nova, a guerra declarada, a obra grande que ganha a vez, o celeiro que de fato esvazia.
  **Oscilação** (a troca que se desfaz): todo o resto — quatro em cada cinco trocas na metrópole (373 de 462), três em cada
  quatro na mega (164 de 221).
- **Quanto dura um ofício antes de trocar** (metrópole, os que trocaram): menos de um décimo de dia 141, menos de meio dia 162,
  menos de um dia 56.
- **Quem era escolhido:** um sorteio (`G.R()`) com a mão desocupada na frente — cada necessidade da hora levava outra pessoa.
- **O que se vê** (a conta da prova rodada no jogo de antes): os ofícios que as casas mostram (`G.Atmos.about`) mudavam 156
  vezes por dia em 101 casas na metrópole (75 em 46 na mega); dos moradores com um ofício que a casa mostra, 83 de 133 (62 %)
  ficaram com ele dois dias inteiros na metrópole (67 de 88, 76 %, na mega); dos lenhadores, 3 de 10.

## 2. A regra (D-210 a D-214) e as medidas de depois

**Em três frases, para o dono:**
1. A cidade não troca mais o ofício de ninguém pelo que falta nesta hora: ela guarda uma memória do que cada ofício vem
   pedindo (uma média de meio dia) e só muda alguém quando a falta durou — a não ser que o posto tenha ficado vazio (morreu
   o único ferreiro): aí outro o toma na hora.
2. Quem muda é sempre a mão mais nova do ofício — os moços primeiro —, sem sorteio, e quem tomou um ofício fica nele ao
   menos três dias (três anos da vida dele); os velhos de casa ficam.
3. A fome, a guerra e a obra grande com a vez ainda puxam braços na hora, mas quem é puxado guarda o ofício que deixou e
   volta a ele assim que a emergência passa — a guerra acabada, o soldado está de volta à oficina dele em segundos —, e a
   biografia diz («a guerra chamou», «voltou a ser lenhador»).

**Quais causas passam por cima, e por quanto tempo:** a fome (menos de um dia de pão no armazém do povo: 2,5 por cabeça) —
os ofícios que dão de comer; a guerra (o povo com inimigos) — os guerreiros; a obra grande com a vez (D-174) — os
construtores da turma. Enquanto a causa dura, esses ofícios pedem o que o instante pede (para cima e para baixo: o exército
cansado ou com fome solta soldados na hora). Passada a causa, quem foi puxado volta assim que o ofício dele tem falta de uma
mão. O fogo não passa pelo repartidor (é tarefa, não ofício). As feras a vinte casas **não** passam mais por cima (eram a
maior fonte de troca): quem é bravo defende a cidade com o ofício que tem, como antes.

**As trocas de ofício, antes e depois** (a prova `qa/oficio-fica.js` com a regra final; «pela necessidade» é a troca calma,
a que a regra segura; as das emergências vão à parte, com a causa):

| mundo | antes: por adulto por dia | depois: pela necessidade | por cidade por dia: antes → depois | as outras trocas ditas, nos dias da prova |
|---|---|---|---|---|
| metrópole (2 dias; uma guerra começa no meio) | 0,69 | **0,104** (69 entre 333) | 12 → 1,8 | guerra 69, moços e libertos 23, volta 10, obra 6 |
| mega (1,5 dia) | 0,42 | **0,087** (33 entre 254) | 11 → 2,2 | moços 18 |
| do zero, semente 103, anos 20 a 30 no salto | 0,22 | **0,102** (63 em 620 adultos-dia) | 4 → 1,7 | moços e vilas novas 74, guerra 9, volta 2 |

Ninguém trocou pela necessidade duas vezes em menos de três dias (a regra do verificador cobra em toda prova). Pelo medidor (`mede.js`, todas as trocas de ofício a ofício, o mesmo mundo do zero nos anos 20 a 30): antes 183 em 11 dias entre 76 adultos (0,216; 24 pessoas três vezes ou mais, 5 seis ou mais, o que mais 14; 39 idas e voltas); depois 74 entre 60 adultos (0,115; 8 três vezes ou mais, nenhuma seis, o que mais 4; 4 idas e voltas; 61 pela necessidade, 9 pela guerra, 2 voltas).

**O que se vê em volta de uma casa** (`G.Atmos.about`: a lenha, a rede, o escudo — os ofícios que a casa mostra):

| mundo | muda por dia: antes | depois | ficaram com o ofício que a casa mostra, os dias inteiros: antes | depois |
|---|---|---|---|---|
| metrópole (com a guerra no meio) | 156 em 101 casas | **78 em 78 casas** | 83 de 133 (62 %) | **102 de 127 (80 %)** |
| mega | 75 em 46 casas | **29 em 33 casas** | 67 de 88 (76 %) | **71 de 77 (92 %)** |

Dos lenhadores da metrópole, 3 de 8 ficaram os dois dias (antes 3 de 10): os outros foram chamados às armas e a lenha some
com eles enquanto a guerra dura (a regra do `atmos`: só o que a casa tem agora) — seção 10, item 9. Na mega, 2 de 2.
Os perfis dos bairros (`G.Urban`), a roupa (`G.Atmos.dress`), o quintal e o que o personagem sabe leem o ofício da pessoa:
`qa/quintal.js`, `qa/roupa.js` e `qa/sabe.js` com a regra — seção 3.

**A cidade não morre de fome — dez mundos do zero** (continente 128, 4 povos, 40 anos de salto, as sementes 103, 7, 2024,
11, 42, 555, 9, 31, 77, 314; antes → depois, a regra final; `scratchpad/ag/X/eco2/tabela-v7.md`):

| semente | gente | mortos de guerra | mortos de fome | comida | madeira | pedra | prédios | cidades | a comida por pessoa mais baixa |
|---|---|---|---|---|---|---|---|---|---|
| 103 | 183 → 168 | 41 → 50 | 0 → 2 | 10607 → 10396 | 2570 → 2829 | 1313 → 1191 | 165 → 158 | 6 → 5 | 3,23 → 2,90 |
| 7 | 191 → 150 | 53 → 57 | 3 → 0 | 12382 → 10214 | 4293 → 3866 | 1075 → 1476 | 205 → 201 | 7 → 7 | 3,73 → 2,35 |
| 2024 | 171 → 178 | 41 → 58 | 0 → 0 | 10536 → 11431 | 3494 → 4300 | 1318 → 1448 | 180 → 193 | 8 → 8 | 1,65 → 2,75 |
| 11 | 207 → 221 | 45 → 54 | 0 → 0 | 13668 → 12704 | 4700 → 4881 | 1422 → 1596 | 247 → 228 | 8 → 8 | 2,94 → 2,55 |
| 42 | 157 → 109 | 66 → 57 | 5 → 2 | 8771 → 8121 | 2242 → 3132 | 1195 → 1107 | 157 → 166 | 8 → 6 | 3,36 → 1,53 |
| 555 | 141 → 199 | 41 → 52 | 3 → 1 | 8193 → 9630 | 2766 → 3499 | 960 → 1295 | 155 → 198 | 5 → 7 | 2,86 → 2,10 |
| 9 | 120 → 137 | 74 → 53 | 1 → 0 | 8970 → 10134 | 2420 → 3029 | 1397 → 1451 | 166 → 151 | 4 → 6 | 2,75 → 4,00 |
| 31 | 211 → 149 | 49 → 58 | 0 → 2 | 11208 → 8901 | 4315 → 3825 | 1404 → 1854 | 238 → 195 | 10 → 8 | 1,95 → 3,25 |
| 77 | 119 → 141 | 73 → 69 | 3 → 0 | 9854 → 10749 | 3073 → 3232 | 1069 → 1003 | 144 → 163 | 5 → 4 | 3,09 → 2,62 |
| 314 | 157 → 156 | 46 → 50 | 0 → 0 | 8727 → 10046 | 2995 → 4458 | 789 → 1915 | 153 → 218 | 6 → 8 | 3,73 → 3,39 |
| **soma** | **1657 → 1608** (−3 %) | **529 → 558** (+5 %) | **15 → 7** | **102916 → 102326** (−1 %) | **32868 → 37051** (+13 %) | **11942 → 14336** (+20 %) | **1810 → 1871** (+3 %) | **67 → 67** | 1,65 → 1,53 |

- **Medido com o `js/` do commit `9ab1a24`, que é o da regra final** (depois dele só a prova mudou). **Não medi os dez mundos de
  novo na árvore juntada com o ramo do líder** (lá a prova e a vida curta passam; a economia dos dez mundos, não rodada).
- **Como ler:** cada mundo é outro mundo depois da mudança (o repartidor não tira mais do acaso do mundo, e uma guerra a mais
  ou a menos muda tudo): mundo a mundo a diferença de gente tem desvio de 37 e a de mortos de guerra de 11. A soma: gente −5
  por mundo (0,4 desvio do zero), mortos de guerra +3 por mundo (0,8 desvio) — **não se distingue do acaso das guerras**;
  mortos de fome a metade; comida igual; madeira, pedra e prédios a mais (menos idas e voltas é mais trabalho feito).
- A comida por pessoa mais baixa de um povo, olhada a cada ano, nunca passou abaixo de 1,5 (a mais baixa de cada mundo é
  dos primeiros anos, antes de a regra pesar). Os mortos de fome são gente longe de casa com o armazém cheio, antes e depois
  (um soldado voltando da guerra, um cativo: T-952).
- **As armas** (a conta que achou o que a soma da gente escondia; `python3 armas.py eco2 a6,v6,v8,v7 <sementes>`, 400
  olhares de cada lado):

| a regra | povos-ano em guerra | guerreiros entre os adultos dos povos em guerra | dos povos em paz | mortos de guerra por povo-ano em guerra | gente | mortos de guerra |
|---|---|---|---|---|---|---|
| antes (`b2b61f0`) | 14,5 % | 20,8 % | 2,9 % | 2,46 | 1657 | 529 |
| a regra sem a volta pelo instante, a leva só dos bravos (`v5`/`v6`) | 11,9 % | 21,7 % | 3,5 % | 3,64 | 1551 | 604 |
| com a volta pelo instante, a leva só dos bravos (`v8`) | 16,3 % | 20,1 % | 3,2 % | 2,79 | 1536 | 635 |
| **a regra final: a volta pelo instante, a leva de sempre (`v7`)** | 16,5 % | **20,6 %** | **3,3 %** | **2,34** | **1608** | **558** |

  O caminho da medida: a primeira regra (a memória da emergência só subia) deu, em seis mundos, 414 mortos de guerra onde
  antes 287 e 900 pessoas onde 1050 — o exército guardava os soldados da melhor hora dele; consertado (os ofícios de uma
  emergência seguem o instante para cima e para baixo). A segunda (`v5`) deu um quinto a mais de guerreiros nos povos em paz
  e metade a mais de mortos por povo-ano de guerra — o exército voltava para casa ao longo de dia e meio (`paz.js`: os
  soldados de Argos 19 → 16 num oitavo de dia depois da paz, 8 num dia; a paz pede 4); consertado (quem a emergência puxou
  volta pelo instante: 19 → 12 em 10 s) e a leva voltou a pesar como pesava (a sorte de cada um no lugar do sorteio).

**Os mundos prontos vividos dez dias, no passo** (a geração 19; antes → depois):

| mundo (a geração 19, dez dias no passo) | gente no fim | mortos de guerra e de flecha | mortos de fome | comida produzida nos dez dias | prédios | o pior instante de fome | povos-olhar em guerra | guerreiros entre os adultos: em guerra | em paz |
|---|---|---|---|---|---|---|---|---|---|
| metrópole (704 pessoas no instante salvo), antes | 638 | 231 | 4 | 11536 | 735 | 72 pessoas | 99 de 192 | 25,2 % | 7,9 % |
| metrópole, **depois** | **689** | **216** | **8** | **12423** | **776** | 62 | 78 de 206 | 26,7 % | 7,8 % |
| mega (446), antes | 550 | 87 | 2 | 9644 | 495 | 41 | 18 de 160 | 22,9 % | 5,7 % |
| mega, **depois** | **508** | **106** | **1** | **8612** | **488** | 36 | 53 de 160 | 22,3 % | 6,8 % |

Cada mundo pronto é um futuro só: a metrópole acaba os dez dias com mais gente e menos mortos de guerra que antes, a mega com
menos gente e mais mortos — na mega de depois há guerra em 53 dos 160 povos-olhar, na de antes em 18: é a guerra que cada
futuro tem. A conta que diz do repartidor é a dos dez mundos, acima. Os 8 mortos de fome da metrópole de depois, um a um
(`scratchpad/ag/X/fila9/pronto-fome-metropole.txt`): cinco guerreiros, dois sacerdotes e uma agricultora, dos dias 59 a 64 (a
guerra começa no segundo dia), em fuga ou a caminho de comer, com 4 a 10 de comida por cabeça no armazém do povo de cada
um — gente longe de casa (T-952), não uma cidade sem comida.

## 3. As provas, as sabotagens e as outras provas

**A prova** `qa/oficio-fica.js` (≈ 13 min inteira; `ONLY=x4` uma parte). A última rodada inteira antes da junção, com a regra
final: **62 linhas passam, nenhuma falha** (`scratchpad/ag/X/fila9/prova-final.txt`, commit `5b8b9db`; os números da tabela
abaixo são dela). **Na árvore juntada com o ramo do líder** (`bedce41`; a junção `64f498d`): a primeira rodada inteira deu 60 de 62 — dois
casos da prova que dependiam do mundo (o x5 «o exército cansado» pedia o exército no que o instante pede, mais um, em 45 s,
e ficaram 2 soldados a mais; o x15 comparava os dias de quem voltou com os do começo do caso), não a regra: acertados na
prova (commit `f7a1d5a`), e **a prova inteira passa: 63 linhas, nenhuma falha** (`scratchpad/ag/X/fila10/prova-juntada2.txt`).
Os números dela na árvore juntada: a metrópole 0,071 pela necessidade por adulto por dia (50 entre 351; antes 0,69), 86 % dos
moradores com o ofício que a casa mostra os dois dias, 50 mudanças por dia em volta das casas; a mega 0,073 (28 entre 256),
90 %, 25 por dia; o zero 0,093, nenhum morto de fome, 44 → 125 pessoas; a paz devolve 22 das 37 mãos num oitavo de dia. O
guard passa (156 arquivos), a vida curta (103, 5 anos) não tem violação nem erro, o `load-oficio` passa; as sabotagens da
guerra e da paz rodadas de novo ali (`fila10/sab`): s29, s34, s35 e s36 acusadas, a s33 sem caso próprio, como antes.

| parte | o que prova | o que mediu na última rodada |
|---|---|---|
| x1 | a metrópole vivida dois dias: as trocas pela necessidade abaixo do teto (0,12; antes 0,69), a necessidade que durou move mãos, quem troca é a mão mais nova (das mãos do ofício deixado que o repartidor podia levar, a parte com menos dias nele do que quem trocou: o teto 30 %), ninguém duas vezes em menos de três dias, toda troca com causa, nenhum cativo no repartidor, a casa guarda a cara, o que há em volta das casas | 0,104; 33 das 69 trocas para um ofício que já tinha mãos; 8 %; 178 mudanças, todas ditas; 80 %; 78 por dia |
| x2 | o mesmo na mega, um dia e meio | 0,087; 18 das 33; 0 % (a idade do meio de quem trocou 20, a de todos 27); 92 %; 29 por dia |
| x3 | um mundo do zero: os anos 20 a 30 no salto abaixo do teto (0,16; antes 0,22), um dia no passo, o armazém, a fome | 0,102 no salto; 0,125 no dia; a comida por pessoa mais baixa 2,90; 2 mortos de fome; 44 → 118 pessoas |
| x4 | a fome puxa e devolve | 19 mãos em 70 s, cada uma com o ofício a que volta e os dias; 15 de volta em 0,6 dia (4 chamadas antes por outra emergência) |
| x5 | a guerra puxa (a guerra mantida fresca pela conta dela mesma, a leva de 30 s): os bravos antes dos outros, e entre dois a sorte de cada um (um caso montado pela mão da prova); na hora, cada um com o ofício de onde saiu; o povo cansado (vinte batalhas perdidas) solta em 45 s a metade dos soldados a mais, ou mais, e a memória do exército em cada cidade do povo é o que o instante pede; com fome, a guerra dá soldados à roça | 44 chamados em 30 s (8 → 25 soldados de 73 adultos); cansado: o instante pedia 26 e pede 16, e os soldados são 16 em 15 s; com fome: 9 soldados à roça em 40 s |
| x6 | a vaga, com a memória da cidade em repouso pela mão da prova (ela lembra de cada ofício as mãos que ele tem): morre quem tinha sozinho um ofício de oficina — outro toma o ofício e o posto, na hora, e a mão vem de outro ofício | 4 de 4 (copista, ator, foguista, taverneiro) em um oitavo de dia |
| x7 | a oficina nova ganha gente | Argos ganha a Administração: uma escriba em 0,375 dia |
| x8 | o moço de dezesseis ganha ofício (os dias começam três atrás); o velho de sessenta e dois o larga e não volta a nenhum | Tutmés oleiro; Neferu anciã |
| x9 | o corpo do deus, o preso e quem está no mar não têm o ofício trocado (num ofício que a cidade não pede, de onde o repartidor tira a mão ao lado) — e soltos, têm | 3 das 3 ao lado trocaram; os três ficaram; soltos, trocaram |
| x10 | o save no meio: o load não troca ninguém (com duas mãos por trocar na hora do save) nem mexe na memória; o mesmo save duas vezes, o mesmo futuro; um save de antes carrega e vive | 0 trocas pelo load em 19 cidades; 18 trocas iguais no meio dia; o save de antes: 0,073 no primeiro dia |
| x11 | o salto é o passo: a memória de uma cidade chega ao mesmo lugar no mesmo tempo de mundo | 62,5 % no passo, 60,3 % no salto (a conta: 63,2 %) |
| x12 | o celeiro por graus | 9, 14, 18 agricultores a 130 %, 85 %, 60 % da marca (antes 9, 18, 18) |
| x13 | a obra grande com a vez junta a turma na hora | Mênfis: 1 → 9 construtores em 45 s, cada um com o ofício de onde saiu |
| x14 | o dia da fundação: um mundo novo reparte pelo instante | aos 12 s, 9 construtores; a primeira casa aos 16,4 s (pela memória 59 s; antes 22,6 s) |
| x15 | a paz devolve: quem a guerra puxou volta pelo instante, e quem voltou não é levado adiante | num oitavo de dia 31 das 43 mãos de volta, com os dias; os soldados 24 → 12 (a paz pede 8); pela memória dos dois ofícios eram 7 de 43 |

**As sabotagens** (`scratchpad/ag/X/sab-X.py`; cada uma numa cópia nova do jogo, com a parte da prova que a acusa; a última
rodada, com a regra final: `scratchpad/ag/X/fila8/sab/resumo.txt`, `sab2` e `sab3` para as que rodaram de novo depois de a
prova ganhar conferências, e `fila10/sab` para as cinco da guerra e da paz rodadas na árvore juntada). **O que as sabotagens ensinaram à prova:** cinco delas passavam e cada uma mostrou um caso frouxo — a
s29 e a s33 (o x5 tinha a primeira batalha da guerra dentro do caso, e não lia a memória do exército: T-957), a s32 (o x6: três dos quatro postos eram
tomados por um acaso da memória), a s20 (nenhum caso pedia que a necessidade que durou movesse uma mão), a s3 (a idade do
meio não distinguia a mão mais nova da mais velha, e a sabotagem era «acusada» por um engano de outra conferência). A prova
foi apertada até acusar cada uma; ficaram duas sem caso próprio (s33 e s37: seção 10, item 4).

36 sabotagens rodadas, 34 acusadas; não acusadas: s33, s37.

| sabotagem | o que estraga | a parte rodada | acusada? | pelo caso |
|---|---|---|---|---|
| s1 | a memória desligada: o que um ofício pede volta a ser o do instante | x2,x11 | sim (2) | «x2 a mega: as trocas pela necessidade»; «x11 o salto e o passo» |
| s2 | o ofício tomado não prende (sem os três dias) | x1 | sim (2) | «x1 a metrópole: ninguém troca duas vezes às pressas»; «x1 a metrópole: o verificador e os erros» |
| s3 | quem troca é a mão mais velha do ofício | x1 | sim (1) | «x1 a metrópole: quem troca é a mão mais nova» |
| s5 | a fome não é emergência | x4 | sim (2) | «x4 a fome puxa na hora»; «x4 e devolve» |
| s6 | a guerra não é emergência | x5 | sim (3) | «x5 a guerra chama os bravos»; «x5 a leva: a sorte de cada um pesa»; «x5 a guerra puxa na hora» |
| s7 | quem é puxado não guarda o ofício a que volta | x4 | sim (2) | «x4 a fome puxa na hora»; «x4 e devolve» |
| s8 | sem volta nenhuma (nem pelo instante nem pela memória): quem foi puxado só sai como qualquer mão | x4,x15 | sim (2) | «x4 e devolve»; «x15 a paz feita, os soldados voltam para casa» |
| s8b | … e sem preferência nenhuma por quem volta | x4 | sim (1) | «x4 e devolve» |
| s9 | quem é puxado perde os dias que tinha no ofício | x4 | sim (2) | «x4 a fome puxa na hora»; «x4 e devolve» |
| s10 | o corpo do deus repartido como qualquer um | x9 | sim (1) | «x9 o corpo do deus, o preso e quem está no mar ficam» |
| s11 | o preso repartido como qualquer um | x9 | sim (1) | «x9 o corpo do deus, o preso e quem está no mar ficam» |
| s12 | quem está no mar repartido como qualquer um | x9 | sim (1) | «x9 o corpo do deus, o preso e quem está no mar ficam» |
| s13 | o load mexe na memória (e a cria) | x10 | sim (1) | «x10 o load não decide nada» |
| s14 | a memória da cidade fora do save | x10 | sim (1) | «x10 o load não decide nada» |
| s14b | o dia do ofício e o ofício a que se volta fora do save | x10 | sim (1) | «x10 o load não decide nada» |
| s15 | a memória anda pela passada, não pelo tempo (no salto, a metade) | x11 | sim (1) | «x11 o salto e o passo» |
| s16 | o repartidor não diz a causa | x8 | sim (2) | «x8 o moço ganha ofício»; «x8 o verificador e os erros» |
| s17 | o primeiro ofício dado sem palavra | x8 | sim (2) | «x8 o moço ganha ofício»; «x8 o verificador e os erros» |
| s18 | o velho guarda um ofício a que voltar | x8 | sim (2) | «x8 o velho larga o ofício»; «x8 o verificador e os erros» |
| s19 | o primeiro ofício prende como qualquer outro | x8 | sim (1) | «x8 o moço ganha ofício» |
| s20 | nenhum ofício dá a mão | x2 | sim (1) | «x2 a mega: a necessidade que durou move mãos» |
| s21 | o celeiro volta a ser um interruptor | x12 | sim (1) | «x12 o celeiro por graus» |
| s23 | a guerra chama as mãos mais novas, não os bravos | x5 | sim (2) | «x5 a guerra chama os bravos»; «x5 a leva: a sorte de cada um pesa» |
| s25 | quem foi puxado vai a um terceiro ofício antes dos dias | x4 | sim (1) | «x4 o verificador e os erros» |
| s26 | o load reparte os ofícios | x10 | sim (1) | «x10 o load não decide nada» |
| s27 | a obra grande com a vez não é emergência | x13 | sim (1) | «x13 a obra grande com a vez puxa na hora» |
| s28 | quem foi puxado e mandado adiante perde o ofício a que volta | x4 | sim (1) | «x4 a fome puxa na hora» |
| s29 | a memória da emergência só sobe (o exército guarda os soldados da melhor hora) | x5 | sim (1) | «x5 a memória do exército é o que o instante pede» |
| s30 | uma emergência não tira mãos do ofício de outra | x5 | sim (1) | «x5 com fome, a guerra dá soldados à roça» |
| s31 | a cidade no dia da fundação reparte pela memória | x14 | sim (1) | «x14 o dia da fundação: todas as mãos ao que falta» |
| s32 | o posto vazio espera como qualquer necessidade | x6 | sim (1) | «x6 a vaga: o posto vazio pede na hora» |
| s33 | o ofício de uma emergência com mãos demais só solta as que ela puxou | x5 | **não** | — |
| s34 | a emergência acabada, quem ela puxou espera a memória dos dois ofícios (sem a volta pelo instante) | x15 | sim (1) | «x15 a paz feita, os soldados voltam para casa» |
| s35 | a leva só dos bravos (sem a sorte de cada um) | x5 | sim (1) | «x5 a leva: a sorte de cada um pesa» |
| s36 | a memória dos dois ofícios não acompanha a mão que volta | x15 | sim (1) | «x15 quem voltou não é levado adiante» |
| s37 | sem a margem de duas mãos enquanto a emergência dura | x1,x5,x15 | **não** | — |

**As outras provas, com a regra final** (`scratchpad/ag/X/fila8/provas/resumo.txt`):

| prova | resultado | o que falhou |
|---|---|---|
| `guard` | passa (PASSOU (156 arquivos); 2 s) | — |
| `load-oficio` | passa (6 linhas; 49 s) | — |
| `oficinas-mao` | passa (21 linhas; 0 s) | — |
| `olaria-mao` | passa (21 linhas; 1 s) | — |
| `taverna-mao` | passa (29 linhas; 0 s) | — |
| `termas-mao` | passa (31 linhas; 0 s) | — |
| `lazer-mao` | passa (27 linhas; 0 s) | — |
| `atividades` | passa (14 linhas; 11 s) | — |
| `fome` | **falha** (24 linhas; 44 s) | FOME: FALHOU (h13 a tripulação esperando no cais da viagem come, como quem está em campo) |
| `motim` | passa (11 linhas; 93 s) | — |
| `marinheiros` | **falha** (20 linhas; 412 s) | MARINHEIROS: FALHOU (1) |
| `porto` | passa (19 linhas; 323 s) | — |
| `sabe` | passa (32 linhas; 49 s) | — |
| `roupa` | **falha** (9 linhas; 46 s) | FALHOU: r7 o save no meio: salvo e carregado, cada um vestido como antes |
| `quintal` | passa (9 linhas; 41 s) | — |
| `degraus` | **falha** (50 linhas; 244 s) | DEGRAUS: FALHOU (g2c2 a turma é da obra grande, g4e com a pedra dada, anda) |
| `taverna` | passa (10 linhas; 121 s) | — |
| `olaria` | passa (11 linhas; 136 s) | — |
| `termas` | **falha** (5 linhas; 74 s) | TERMAS: FALHOU (e1 um-dia-dos-banhos) |
| `lazer` | passa (15 linhas; 159 s) | — |
| `obra` | passa (13 linhas; 16 s) | — |
| `leva` | passa (2 linhas; 7 s) | — |
| `maos` | **falha** (14 linhas; 59 s) | MAOS: FALHOU (m10 a tripulação escondida na caverna) |
| `casa-mercante` | passa (9 linhas; 189 s) | — |
| `tempo-livre` | passa (6 linhas; 26 s) | — |
| `ladrao-bairro` | passa (8 linhas; 147 s) | — |
| `fundadores` | passa (6 linhas; 17 s) | — |
| `det3` | passa (fim em 30 s; erros: nenhum; 31 s) | — |
| `soak5` | passa (erros: nenhum; 23 s) | — |
| `soak20` | passa (erros: nenhum; 98 s) | — |
| `oldsave` | passa (erros no novo: nenhum; 98 s) | — |
| `salto-igual` | passa (3 linhas; 254 s) | — |
| `vida-bairro` | **falha** (9 linhas; 1178 s) | FALHOU: 2 (v6 rico-e-pobre, v7 a-peste) |

**A conta das que falham** (as mesmas mensagens nas duas rodadas inteiras, a de antes dos dois consertos e a da regra final;
«a borboleta» é a prova rodada no jogo de antes, `b2b61f0`, com o acaso do mundo deslocado de um sorteio por passada do
repartidor: `scratchpad/ag/X/borb1/` — a prova que falha ali depende do acaso do futuro do mundo pronto, não da regra):

| prova | o caso | o que se viu |
|---|---|---|
| `fome` | h13: ninguém da tripulação no cais de uma viagem em 40 s | o limite da própria prova (T-691: a tripulação vem ao cais quando cada um acaba o que faz). Na borboleta falham outros dois casos da mesma prova (h18, h18b) e este passa: a prova depende do instante do mundo pronto. Não olhei mais fundo. |
| `marinheiros` | m9: a menor energia de quem espera no cais 13 (o piso 15) | com rastro: é a líder da viagem, uma caçadora de 53 anos na ronda da noite dos caçadores — nenhuma troca de ofício dela, ninguém de pé no cais na hora de dormir. Na borboleta passa. |
| `roupa` | r7: a pessoa #9391 vestida de outro jeito depois do save | **na borboleta falha igual, com a mesma pessoa**: T-958 (não é do repartidor; o x10 confere que o load não mexe em ofício nenhum). |
| `maos` | m10: nenhuma viagem que saia de uma cidade com caverna perto | na borboleta falha com a mesma mensagem: a prova precisa de um mundo que este futuro não dá. |
| `termas` | e1: um dia dos banhos sem banho quente | com rastro (na versão anterior da regra; a mensagem de agora é a mesma, letra por letra): o foguista de Tenochtitlan está no ofício, no posto e na memória (pede 1, lembra 1, nenhuma troca) e passou o dia da prova abrigado da chuva — o tempo do mundo mudou com o acaso. Na borboleta passa. |
| `degraus` | g2c2: 0 olhares «com a obra grande à espera» (a prova pede três) | com rastro: o teatro de Mênfis recebeu toda a pedra nos 120 s de antes (a turma fez o trabalho dela; o g2c, a turma de 11 construtores de 71 adultos, passa). Na borboleta passa. |
| `degraus` | g4e: o teatro de Roma recebeu 8 de pedra em dois anos (o piso 12) | com rastro, estação por estação, com a regra e no jogo de antes (`dbg-g4.py`): nos dois, os mesmos 4 construtores os dois anos inteiros e **nenhuma troca de ofício na cidade**; a pedra do povo vai de 150 a 45 com a regra (8 para a obra) e de 150 a 0 no jogo de antes (24 para a obra) — a pedra guardada vaza para outras obras do povo (o L-783 e a carroça da obra, D-215, do ramo do líder). Na borboleta, 28; na versão anterior da regra, 12 justos. |
| `vida-bairro` | v6 (e v7, no mesmo bairro) | T-956, aberto: a seção 10, item 1. O verificador dela, limpo (62 dias vividos). |

Passam, com a regra final: guard; load-oficio (6); as cinco «-mao» (129 linhas); atividades (14); motim na metrópole (11: na
«cidade» falha igual no jogo de antes, e a regressão o roda na metrópole); porto (19); sabe (32); quintal (9); taverna (10);
olaria (11); lazer (15); obra (13); leva (2); casa-mercante (9); tempo-livre (6); ladrao-bairro (8); fundadores (6); det3
(«igual» nas três comparações); a vida de 5 e a de 20 anos (0 violações, nenhum erro); oldsave; salto-igual (3).

**Na árvore juntada** rodei de novo, das outras, só o `load-oficio` (passa) e o `degraus` g2 e g4: **o g4e passa** (o teatro de
Roma recebe 92 de pedra em dois anos, com o L-783 e a carroça da obra do ramo do líder) e o g2c2 falha igual (0 olhares com
a obra à espera). **As outras provas não foram rodadas na árvore juntada** — nem o `vida-bairro`.

## 4. Linhas do AUDIT (prontas para colar)

| D-210 | decisão (do agente X, nos Bairros Vivos — o ofício que fica; fecha o T-840) | **O ofício é da pessoa e muda devagar, por causa: o que cada ofício pede, para o repartidor, é a memória da cidade — não o instante.** O repartidor (`village.js`, `assignJobs`) contava a cada 4 s o que o instante pedia de cada ofício e passava três mãos dos ofícios com sobra aos com falta; e o que o instante pede não para quieto. **Medido** (geração 19, `scratchpad/ag/X/mede.js`, com ganchos no `assignJobs`): na metrópole 231 trocas de ofício por dia entre 337 adultos (0,69 por adulto por dia; 195 trocaram em dois dias, 62 três vezes ou mais, 14 seis ou mais; 120 idas e voltas A→B→A; a mudança líquida do censo dos ofícios, o que de fato precisava mudar, 89 das 462), na mega 110 por dia entre 261 (0,42), num mundo do zero nos anos 20 a 30 183 trocas em 11 dias entre 76 adultos (0,22 por adulto por dia; 75 trocaram, 24 três vezes ou mais, 5 seis ou mais). Em dois dias, nas 19 cidades da metrópole, o pedido de mineiros mudou 130 vezes, o de caçadores 128, lenhadores 81, guerreiros 63, agricultores 43: as feras a menos de vinte casas (270 viradas — um caçador a mais, um mineiro a menos), o que as oficinas pedem pelo estoque do instante (107), as obras (49), o celeiro que cruza a marca e volta (42: D-213). O ofício de oficina com prédio (`v.job`) **não** era mais estável que o do campo (oficina → guerreiro 59, campo → oficina 55, oficina → campo 53, oficina → oficina 39 das 462). Um terço dos ofícios largados tinha durado menos de um décimo de dia. **Decisão:** cada cidade guarda a memória do que cada ofício pede (`set.ofm`, no save com a cidade): uma média lenta do que o instante pede, de meio dia (`V.TRADE_TAU`), que anda pelo tempo passado desde a última passada (o salto reparte a cada 8 s e cada passada dele vale por duas: `el`). Uma mão passa de um ofício a outro quando **a memória e o instante concordam** — o que pede tem falta de meia mão pela memória e de uma agora; o que dá tem um quarto de mão de sobra pela memória e não tem falta agora — **e os dois estão a uma mão e meia pela memória** (`V.TRADE_GAP`: mais que uma, para a troca não se desfazer sozinha). **O posto que ficou vazio** (ninguém no ofício — morre o único ferreiro, o carcereiro embarca —, a memória e o instante com a mão inteira) **pede na hora** ao ofício a que o instante mais tem sobrando, se a memória não pede a esse mais do que ele tem; a memória de quem dá solta a mão junto (não a pede de volta na piscada seguinte do instante). Quem não tem ofício (o moço aos dezesseis, quem chega, o liberto) toma na hora o que mais pede pela memória (um quarto de mão ou mais; senão, coletor, como antes). **A cidade no dia da fundação** (`V.TRADE_NEW`: um dia desde `set.founded`) **não tem memória**: a repartição dela é a do instante, como sempre foi — com a memória, as primeiras casas de um mundo novo esperavam um minuto pelos construtores (a primeira casa aos 59 s onde era aos 22,6 s; agora aos 16 a 19 s). O load não mexe na memória nem troca ninguém (L-419); uma cidade sem memória (de um save de antes) começa do instante (medido na mega: começar dos ofícios que a gente tem só espalha por dois dias as mesmas duas dúzias de trocas do primeiro quarto de dia). **Por que a memória e não «a troca só na virada do dia»:** a média responde em proporção — um pedido de mais nove mãos passa em segundos, o de mais uma leva um terço de dia —, a obra nova não fica um dia sem construtor, e as trocas não caem todas no mesmo instante. **Medido depois** (`qa/oficio-fica.js`, a regra final): na metrópole 0,104 pela necessidade por adulto por dia (69 entre 333 em dois dias; com uma guerra no meio: mais 69 chamados às armas, 10 voltas, 6 pela obra grande), na mega 0,087 (33 entre 254), no mundo do zero 0,102; ninguém trocou pela necessidade duas vezes em menos de três dias; dos moradores com um ofício que a casa mostra, 80 % ficaram com ele os dois dias na metrópole (antes 62 %) e 92 % na mega (76 %); o que há em volta das casas muda 78 vezes por dia na metrópole (antes 156) e 29 na mega (75). **A cidade não passa fome:** dez mundos do zero de 40 anos (antes → depois): gente 1657 → 1608 (−3 %), mortos de guerra 529 → 558 (+5 %), mortos de fome 15 → 7, comida −1 %, madeira +13 %, pedra +20 %, prédios +3 %, cidades 67 → 67 — a gente e os mortos de guerra dentro do acaso das guerras (o desvio das diferenças mundo a mundo: 37 pessoas, 11 mortos); os mundos prontos vividos dez dias: a metrópole acaba com 689 pessoas (antes 638), 216 mortos de guerra e de flecha (231), 8 de fome (4); a mega com 508 (550), 106 (87), 1 (2) — cada mundo pronto é um futuro só, e a guerra de cada um é outra. Sem a memória (sabotagem s1) a mega volta a 0,13. Muda o mundo: os mundos prontos têm de ser gerados de novo (os da geração 19 não têm a memória: a primeira passada parte do instante, e a prova espera um quarto de dia). Prova: `qa/oficio-fica.js` x1 a x3, x6, x7, x10, x11, x14 e as regras `qa/oficio-fica-inv.js`; sabotagens s1 (a memória desligada → x2 e x11), s13 (o load mexe na memória → x10), s14 e s14b (a memória e os dias fora do save → x10), s15 (a memória anda pela passada, não pelo tempo: no salto lembra 37,5 % onde o passo lembra 62,5 % → x11), s20 (nenhum ofício dá a mão → x2 «a necessidade que durou move mãos»), s26 (o load reparte → x10), s31 (o dia da fundação pela memória → x14), s32 (o posto vazio espera como qualquer necessidade → x6). |
| D-211 | decisão (do agente X — o ofício que fica) | **A fome, a guerra e a obra grande com a vez passam por cima da memória — e quem elas puxam volta ao ofício dele.** Emergência é emergência: com menos de um dia de pão no armazém do povo (`V.TRADE_BREAD`: 2,5 por cabeça), os ofícios que dão de comer (coletor, agricultor e os do `G.Eco.FOOD_TRADES`); com o povo em guerra, os guerreiros; com uma obra grande com a vez na cidade (`V.keeps(set) > 0`, D-174), os construtores — **pedem o que o instante pede, para cima e para baixo** (a memória deles é o instante enquanto a causa dura), e tiram a mão do ofício a que o instante mais tem sobrando, três por passada, como o repartidor sempre fez — o de outra emergência também (o povo com fome em guerra manda soldados à roça). **Por quanto tempo:** enquanto a causa dura; passada, quem foi puxado volta pelo instante (abaixo) e a memória do ofício solta o resto devagar (meio dia). O ofício de uma emergência com mais mãos do que o instante pede (o exército cansado) solta qualquer uma delas ao ofício que tem lugar (um quarto de mão pela memória, uma agora). **Quem é puxado guarda o ofício que deixou** (`v.roleBack`) **e os dias que tinha nele** (`v.roleDay` não muda), e a biografia diz («Tornou-se guerreira — a guerra chamou.»); **e volta pelo instante, como veio**: assim que o ofício em que está tem uma mão a mais agora (duas, enquanto ainda é o de uma emergência: a conta dos adultos de uma cidade pisca de um) e o ofício que deixou tem falta de uma agora — três por passada, e a memória dos dois acompanha a mão (o ofício a que volta lembra as mãos que tem com ele: não tem mão de sobra para um terceiro; o que ele deixa não lembra mais do que as que lhe ficam) —, e a biografia diz («Voltou a ser lenhador.»). **Achado pela medida das armas** (`scratchpad/ag/X/eco.js`, quantos adultos são guerreiros nos povos em guerra e em paz, olhados a cada ano em dez mundos de 40 anos; e os mundos prontos vividos dez dias): com a volta só pela memória dos dois ofícios (a do exército solta devagar, a do ofício de cada um pede devagar), os povos em paz tinham um quinto a mais de guerreiros que antes (2,9 % dos adultos → 3,5 %; na metrópole pronta 7,9 % → 10,1 %, na mega 5,7 % → 6,7 %) e cada povo-ano de guerra matava metade a mais (2,46 mortos → 3,64); medido de perto (`scratchpad/ag/X/paz.js`: uma guerra declarada na metrópole, 90 s de leva, a paz do deus), os soldados de Argos iam de 19 a 16 num oitavo de dia, 12 num quarto, 9 em meio dia, 8 num dia, 5 em dia e meio (a paz pede 4 a 5) — o exército voltava para casa ao longo de um ano e meio da vida dos soldados; antes da regra, em segundos. Com a volta pelo instante: 19 → 12 em 10 s, 11 num oitavo de dia, 6 em meio dia (quem fica é quem o ofício dele não tem falta agora: vai pela memória, como qualquer mão); dez mundos: dos adultos dos povos em guerra 20,6 % são guerreiros (antes 20,8 %; sem a volta pelo instante 21,7 %), dos povos em paz 3,3 % (2,9 %; 3,5 %), e cada povo-ano de guerra mata 2,34 (2,46; 3,64); na metrópole pronta vivida dez dias, em paz 7,8 % (antes 7,9 %; sem a volta pelo instante 10,1 %). Quem o ofício dele não tem lugar volta pela memória (um quarto de mão pela memória, uma agora, a uma mão de distância — não a uma e meia). Antes dos três dias no ofício dele, não vai a um terceiro; se a necessidade o manda a um terceiro (o dele não tinha lugar), ou a guerra o deixa sem ofício e ele ganha um de novo, segue com o ofício a que volta, e os dias recomeçam. O fogo não passa pelo repartidor (é tarefa, `runFire`); as feras a vinte casas pediam um caçador na hora e eram a maior fonte de troca (270 viradas em dois dias): agora passam pela memória, e quem é bravo defende a cidade como antes, com o ofício que tem. **A guerra chama os bravos, não as mãos mais novas** — as mãos mais novas de uma cidade são os moços, e a leva seria de meninos e meninas de dezesseis. **A leva pesa como sempre pesou:** a coragem (vezes três), um a mais para o homem, as mortes em combate, a mão livre primeiro (L-461) e, no lugar do sorteio de antes, a sorte de cada um (`G.hash` do id: a mesma em toda guerra, nenhum acaso tirado). Medido: com só os bravos chamados (sem a sorte), dez mundos de 40 anos tinham 635 mortos de guerra onde com a leva de sempre têm 558 e antes tinham 529 — 1,4 desvio do acaso das guerras, do lado dos pesos com que as guerras foram afinadas (a coragem dá golpe, `war.js`, e segura o soldado na linha, `wars.js`); num mundo de vilas a guerra tira de ofícios de uma ou duas mãos e não há o que escolher (quatro dos dez mundos são idênticos com uma leva e com a outra; na metrópole, de 18 chamados de Argos só 4 saíram de ofícios com mais de duas mãos). **Achado no caminho, pela medida da economia:** com a memória da emergência só subindo (`max`), o exército ficava com os soldados da melhor hora dele quando o cansaço e a fome mandam soldados para casa (`G.War.warriorWant`), e uma emergência não tirava mãos da outra: seis mundos de 40 anos tinham 414 mortos de guerra onde antes 287, e 900 pessoas onde 1050. Com a regra final, dez mundos: gente 1657 → 1608, mortos de guerra 529 → 558, e 2,46 → 2,34 mortos por povo-ano em guerra. Medido (`qa/oficio-fica.js`): x4: com o armazém de Tenochtitlan a zero, 19 mãos puxadas em 70 s, cada uma com o ofício a que volta e os dias que tinha; com o armazém cheio, 15 de volta em 0,6 dia (as outras 4 chamadas antes por outra emergência); x5: 44 chamados às armas em 30 s (os soldados de Argos 8 → 25, de 73 adultos); o povo cansado: o instante pedia 26 e pede 16, e os soldados são 16 em 15 s; com fome em guerra, 9 soldados à roça em 40 s; x13: a turma de Mênfis 1 → 9 construtores em 45 s; x15: a paz feita, 31 das 43 mãos puxadas de volta num oitavo de dia (pela memória dos dois ofícios eram 7). Sabotagens: s5 (a fome não é emergência → x4), s6 (a guerra → x5), s27 (a obra grande → x13), s7 (o puxado não guarda o ofício → x4), s9 (perde os dias → x4), s8 (sem volta nenhuma, nem pelo instante nem pela memória → x4 e x15), s8b (… e sem preferência por quem volta → x4), s25 (o puxado vai a um terceiro ofício antes dos dias → x4, pelo verificador), s28 (o puxado mandado adiante perde o ofício a que volta → x4), s23 (a guerra chama as mãos mais novas → x5), s29 (a memória da emergência só sobe → x5 «a memória do exército é o que o instante pede»), s30 (uma emergência não tira da outra → x5), s34 (sem a volta pelo instante → x15), s36 (a memória não acompanha a mão que volta → x15), s35 (a leva só dos bravos → x5 «a sorte de cada um pesa»). **Duas guardas sem caso próprio** (sabotadas, a prova passa): a s33 — «o ofício de uma emergência com mãos demais solta qualquer uma delas ao ofício que tem lugar» (posta antes da volta pelo instante, para o exército cansado; hoje a volta pelo instante e a regra calma fazem o mesmo: 25 → 15 soldados em 15 s sem ela) — e a s37 — a margem de duas mãos enquanto a emergência dura (na metrópole, 0 chamados de novo pela mesma emergência em menos de um dia, com ela e sem ela). Ficaram porque a economia e todas as provas foram medidas com elas; tirá-las pede os dez mundos de novo (`node qa/oficio-eco.js`; o bloco X, seção 10). |
| D-212 | decisão (do agente X — o ofício que fica) | **Quem troca é a mão mais nova do ofício, sem sorteio; um ofício tomado fica três dias; o primeiro ofício não prende.** Quem saía de um ofício era sorteado (`pickRoleForList`: `G.R()` e a mão desocupada na frente): cada necessidade da hora levava outra pessoa, e metade da cidade tinha outro ofício dois dias depois. Agora (`pickHand`): primeiro quem volta ao ofício de que uma emergência o tirou, depois quem está no ofício só pela emergência, depois **quem tem menos dias nele** (`v.roleDay`, o dia em que o tomou; `V.tenure`), o mais moço entre iguais, e o id — nenhum sorteio: as mãos velhas de casa ficam, e o que vai e vem cai nos mesmos poucos. Os pesos de antes valem em dias: os bravos fazem os caçadores, os devotos os sacerdotes, o artesão com posto e quem aprendeu criança o ofício que tem saem depois, quem aprendeu o ofício que pede vai antes. **Um ofício tomado pela necessidade fica ao menos três dias** (`V.TRADE_MIN`; só uma emergência tira a mão antes). **O primeiro ofício** (aos dezesseis, o de quem chega, o do liberto) **não prende**: foi o do instante, e os dias dele começam três atrás — os moços são os primeiros a ir aonde a cidade pede. Quem nunca teve o dia escrito (um save de antes) conta os dias desde os dezesseis. **O corpo do deus** (L-473), **o preso** e **quem está no mar** (`G.Naval.away`) não têm o ofício trocado: não podem tomar outro, e o que têm espera por eles (na volta de quem viajou, sai do posto quem o cobriu: é a mão mais nova). O velho que faz sessenta e dois não volta a ofício nenhum. Medido: ninguém trocou pela necessidade duas vezes em menos de três dias; das mãos do ofício deixado que o repartidor podia levar, só 8 % na metrópole e 0 % na mega tinham menos dias nele do que quem trocou (a mão mais velha primeiro dá 90 %); a idade do meio de quem trocou, 30 anos na metrópole (a de todos os adultos 31) e 20 na mega (27). Sabotagens: s2 (o ofício tomado não prende → x1 e o verificador), s3 (a mão mais velha primeiro → x1 «quem troca é a mão mais nova»), s19 (o primeiro ofício prende → x8), s10, s11, s12 (o corpo, o preso, quem está no mar repartidos como qualquer um → x9), s18 (o velho guarda um ofício a que voltar → x8 e o verificador). |
| D-213 | decisão (do agente X — o ofício que fica) | **O celeiro por graus: os agricultores vão de um a dois por fazenda em proporção, não num interruptor.** «O celeiro cheio manda metade dos agricultores às pedreiras e ao mato»: a conta era uma marca só (`fed`: a comida do povo acima de sete por cabeça) — acima dela um agricultor por fazenda e um quarto dos adultos no máximo, logo abaixo dois e quase metade. O celeiro de uma cidade em equilíbrio vive em cima da marca: em Tenochtitlan cruzou-a cinco vezes num terço de dia, e a cada vez 9 das 64 mãos da cidade largavam a roça ou voltavam a ela (e o corte do resto mínimo tirava 7 ofícios de oficina junto). Agora os agricultores que o instante pede vão de dois por fazenda (com o celeiro a sete décimos da marca ou menos) a um (na marca), em proporção (`full`); a marca segue valendo para o coletor mínimo e a turma da pedreira do povo, que a memória alisa. Medido (`qa/oficio-fica.js` x12): em Tenochtitlan (9 fazendas, a marca 1120), com o celeiro a 130 % da marca o instante pede 9 agricultores, a 85 % pede 14, a 60 % pede 18 (antes: 9 e 18). Sabotagem s21 (o interruptor de volta: 9, 18, 18 → x12). |
| D-214 | decisão (do agente X — o ofício que fica) | **Cada troca do repartidor diz a causa.** `G.Village.tradeLog` guarda as últimas 600 trocas do repartidor — a pessoa, a cidade, de que ofício a qual, o dia, a causa (`novo` sem ofício antes; `falta` a necessidade que durou, ou o posto vazio; `volta` de volta de uma emergência; `fome`, `guerra`, `obra` puxado por uma; `longe` o construtor que não alcança obra nenhuma, L-389) e as contas (o que a memória e o instante pediam e as mãos que havia, do ofício tomado e do deixado) — e `G.Village.tradeAsked(id)` o que o instante pediu na última passada de uma cidade: para quem pergunta (as provas, o desenvolvedor), nunca para o mundo — nada os lê no passo, não vão no save, recomeçam com cada mundo. A causa de uma emergência e da volta dela fica também na biografia da pessoa (`G.Life.onRole(v, prev, why)`: o quinto campo da linha «trade»). As regras do verificador (`qa/oficio-fica-inv.js`): o dia do ofício é um dia que já houve e nunca de antes dos dezesseis; o ofício a que se volta é um ofício, outro que o que se tem, e nunca de uma criança ou de um ancião; a memória da cidade são números, nunca negativos; ninguém troca pela necessidade duas vezes em menos de três dias; nenhuma troca sem causa; e o dia, o ofício a que se volta e a memória entram no estado canônico (um save que os perde é visto). Sabotagens: s16 (o repartidor não diz a causa → x8 e o verificador), s17 (o primeiro ofício dado sem palavra → x8). |
| T-950 | limite (do agente X — o ofício que fica; aberto, de antes) | **Na cidade a que faltam mãos, a vaga de um ofício que ainda tem gente espera.** O que os ofícios pedem pode somar mais que os adultos da cidade — os serviços abertos que a cidade com a comida segura guarda além do teto (D-102), os marinheiros, os estivadores: Roma da metrópole pede 24 a 26 mãos e tem 20 a 23 adultos, nenhum no mato. Aí nenhum ofício tem mão de sobra, nem pelo instante nem pela memória, e a vaga só é tomada por um moço que faz dezesseis anos ou quando o celeiro enche e os agricultores sobram. Antes era igual na regra (sem sobra o repartidor não trocava) e o piscar do pedido de outro ofício é que enchia a vaga — esvaziando outra. Medido (`scratchpad/ag/X/vaga2.js`, na metrópole, nove postos de uma mão só esvaziados, um por cidade): 9 de 9 tomados de novo em meio dia, antes e depois. A prova (x6) escolhe cidades com duas mãos ou mais no mato. Uma regra para repartir a falta (qual ofício fica vazio quando faltam mãos) não foi feita: muda a economia das cidades pequenas, e não é do ofício que fica. |
| T-951 | limite (do agente X — o ofício que fica; aberto, de antes) | **Os anos de uma pessoa correm à frente dos dias do mundo.** A idade anda `dt / G.DAY_LEN` por segundo sempre; o dia do mundo anda a 0,35 disso enquanto uma cena demora (`main.js`: `G.Scene.lingers()`). Então `S.day − v.born` não é a idade: na metrópole pronta há gente «nascida no dia 44» com dezesseis anos feitos no dia 55. Quem conta os anos de alguém usa `v.age`; a regra do verificador do ofício («tem o ofício há mais dias do que os anos depois dos dezesseis») compara os dias do mundo com a idade, que só pode estar à frente. Não mexido. |
| T-952 | limite (do agente X — o ofício que fica; aberto, de antes) | **Gente longe de casa morre de fome com o armazém cheio.** Nos mundos do zero de 40 anos medidos (dez sementes, antes e depois), os mortos de fome — 15 antes, 7 depois, nos dez mundos — são soldados que voltam da guerra a pé (a tarefa «eat», a caminho de casa, a 10 a 50 casas dela, com 500 de comida no armazém do povo), um cativo, um pescador, alguém em fuga; a comida por pessoa mais baixa de um povo, olhada a cada ano, nunca passou abaixo de 1,5 (1,65 antes, 1,53 depois: a mais baixa de cada mundo é dos primeiros anos dele). Na metrópole pronta vivida dez dias, 8 mortos de fome com a regra (4 antes): cinco guerreiros, dois sacerdotes e uma agricultora, em fuga ou a caminho de comer, com 4 a 10 de comida por cabeça no armazém do povo de cada um. Não é do repartidor (acontece antes e depois); a prova (x3) confere o armazém, e conta os mortos de fome com um teto de cinco em trinta anos. |
| T-953 | limite de teste (do agente X) | O pedido cita `qa/oficios.js`, que não existe: as provas dos ofícios são `load-oficio.js` e as «-mao» (`oficinas-mao`, `olaria-mao`, `taverna-mao`, `termas-mao`, `lazer-mao`) e as do mundo pronto (`olaria`, `taverna`, `termas`, `lazer`, `obra`); foram essas as rodadas. |
| T-954 | limite de teste (do agente X — o ofício que fica) | **As trocas de um mundo pequeno, contadas num dia só, variam com o acaso do dia; e um mundo novo troca mais que uma metrópole.** O x3 da `qa/oficio-fica.js` mede um mundo do zero (semente 103, quatro povos): nos anos 20 a 30, no salto, 0,10 a 0,12 trocas pela necessidade por adulto por dia conforme a versão da regra (cidades de dez a quarenta adultos, vilas novas no dia da fundação delas, onde a repartição é a do instante), contra 183 trocas em 11 dias entre 76 adultos (0,22 por adulto por dia; 75 trocaram, 24 três vezes ou mais, 5 seis ou mais) antes; e um dia só no passo, entre cinquenta e oitenta adultos, deu 0,055, 0,104, 0,122 e 0,136 em quatro rodadas (seis a onze trocas). Os tetos desse caso: 0,16 no salto (três quartos de antes) e 0,24 no dia só. |
| T-955 | limite de teste (do agente X — o ofício que fica) | **Provas que dependiam da repartição do instante.** (1) `qa/load-oficio.js` (L-419) punha lobos a um fio das vinte casas de uma cidade e esperava um caçador a mais «assentado» em trinta passadas, e a volta em 6 s: com a memória, os ofícios assentam com os lobos no passo dela (até 150 passadas, até ninguém mudar por 50) e o passo do mundo redistribui depois do load em até 400 s — acertado na prova, que passa. (2) `qa/atividades.js` supõe que aos 40 s de um mundo novo o primeiro adulto da capital tem casa: acusou o começo lento (consertado: o dia da fundação, D-210). (3) `qa/marinheiros.js` m8 espera o posto de quem viaja coberto logo: acusou a vaga lenta (consertado: o posto vazio pede na hora, D-210). (4) `qa/motim.js` na «cidade» (m3, m6, m7: nenhum guerreiro em Mênfis) falha igual no jogo de antes; a regressão o roda na metrópole, onde passa. As outras provas rodadas com a regra final e o que falha nelas, uma a uma: a seção 3 do bloco. |
| T-956 | limite de teste (do agente X — o ofício que fica; **aberto**) | **O `qa/vida-bairro.js` v6 (o bairro que enriquece e empobrece) falha com a regra na metrópole da geração 19 — e o v7 (a peste), que usa o mesmo bairro.** Passou no jogo de antes nas duas rodadas que fiz (uma delas com o acaso do mundo deslocado de um sorteio por passada do repartidor) e falhou cinco vezes de cinco com a regra (duas versões dela inteiras, e três só do v6, duas delas com o acaso deslocado de um e de dois sorteios). **O que a prova faz:** vive dez dias de salto (a metrópole entra em guerra no segundo), escolhe o bairro com mais casas com gente entre os que ainda não são ricos nem pobres, chove moedas nas casas dele doze dias e espera o perfil «rico»; depois o dragão leva as moedas e ela espera o «pobre». **Olhado no dia da escolha** (`scratchpad/ag/X/v6cand.js`, o dia 68): no jogo de antes os candidatos são Argos / Cidade Velha (8 casas, 6 com gente) e Roma / Colina do Templo — e com um sorteio a mais a prova pegou Tenochtitlan / Cidade Velha (20 casas), que sem o sorteio está fora («rica» 0,39); com a regra, Mênfis / Cidade Velha do Leste (10 de 10 com gente), Argos / Mercado Velho e Argos / Cidade Velha (10 casas, 4 com gente: «vazia» 0,47). O bairro escolhido é outro em cada futuro, e os que saíram com a regra estavam meio vazios ou esvaziaram na guerra: casa vazia não fica rica — com a chuva, «rica» parou em 0,36 a 0,41 em Argos / Cidade Velha (13 casas) e o perfil não veio; em Mênfis ficou rico em nove dias e não ficou pobre em dezesseis (as casas esvaziaram: casa vazia também não é pobre); em Roma o bairro tinha 0 casas no fim. Um rastro dia a dia (de uma versão anterior da regra) tinha mostrado o mesmo: metade das casas vazias desde o primeiro dia da chuva, a cidade de 35 adultos a 12 em quatro dias, mudando de povo. **O que não sei:** se cinco de cinco contra duas de duas é acaso (a escolha da prova depende de um limiar — «rica» abaixo de 0,3 — que os bairros da metrópole cruzam de um futuro a outro) ou se a regra deixa as cidades velhas da metrópole mais vazias aos dez dias (no salto, a metrópole tinha no dia 68 723 pessoas no jogo de antes e 676 com a regra; no passo, vivida dez dias, 638 e 689 — os dois sentidos). **Para o líder:** rodar de novo com a geração 20; e a prova devia escolher um bairro habitado (poucas casas vazias) de uma cidade em paz — como a `qa/freguesia.js` vive os seus dias na paz do deus (T-910). Não mexi na prova (não é minha). |
| T-957 | limite de teste (do agente X — o ofício que fica; achado na própria prova e consertado) | **A mão da prova no cansaço de um povo em guerra é desfeita a cada passo.** O x5 da `qa/oficio-fica.js` punha `f.weariness = 90` a cada passo para ver o exército cansado soltar soldados — mas com o povo em guerra é a própria guerra que mede o cansaço (`wars.js`: `exhaustion(w)` faz a conta dos mortos, das batalhas perdidas, dos dias, e escreve `f.weariness` no fim do passo dela): a mão da prova não durava um passo, e o caso passava quando o pedido de soldados caía por outra causa (os adultos a menos). Visto quando o caso montado da leva mudou o mundo da prova e o pedido não caiu (o cansaço lido: 20 a 35). Agora a mão da prova é na conta da guerra: enquanto a leva se faz, a guerra é mantida fresca (`fresh` na prova: os mortos, as batalhas perdidas e os desertores dos dois lados a zero a cada passo — a guerra não cansa nem acaba por tratado no meio do caso); para cansar o povo, vinte batalhas perdidas no lado dele (`w.side[id].lost`: o cansaço a 100); e o caso exige que o povo siga em guerra. Duas sabotagens que deixaram de ser acusadas (a s29, a memória da emergência só sobe; a s33) mostraram o resto: nos mundos delas a guerra tinha a primeira batalha dentro dos 90 s da leva (Argos de 38 a 32 adultos, outro governante), e o que o instante pedia era obra da guerra. A leva do x5 passou a 30 s (antes de os exércitos marcharem: 8 → 25 soldados, igual com a regra e com as sabotagens), e o caso do povo cansado confere duas coisas: a metade dos soldados a mais, ou mais, se vai em 45 s (quem volta na hora é quem tem o ofício dele com falta de uma mão — quantos, o mundo diz: 9 de 9 neste ramo, 8 de 10 na árvore juntada com o ramo do líder) e **a memória do exército, em cada cidade do povo, é o que o instante pede** (é esta que acusa a s29: um teto «o exército no que o instante pede, mais um, em 45 s» acusava a s29 neste ramo e reprovou a própria regra na árvore juntada — outra conferência que dependia do mundo). Do mesmo jeito o x15 comparava os dias de quem voltou com os do começo do caso, e quem a necessidade tinha mandado adiante antes de a guerra o puxar tem os dias do ofício novo: compara com os dias de cada um na hora da paz. Quem escrever uma prova com um povo em guerra: a mão é em `G.Wars.active()` → `w.side[id]`, não em `f.weariness`; e o caso tem de acabar antes da primeira batalha, ou segurá-la. Do mesmo jeito, «a guerra chama os bravos» era uma média (a coragem de quem foi chamado contra a de quem ficou: 0,56 contra 0,47 num mundo, 0,46 contra 0,48 noutro — a guerra tira de ofícios de uma ou duas mãos, e a média é do mundo, não da regra): virou um caso montado pela mão da prova (um ofício de seis mãos, duas feitas bravas: a guerra chama as duas antes das outras, e das duas a de sorte maior). |
| T-958 | limite de teste (achado pelo agente X; **aberto**, não é do repartidor) | **`qa/roupa.js` r7: uma pessoa da metrópole pronta fica vestida de outro jeito depois de um save, em todo futuro da metrópole que não seja o do jogo de antes.** A pessoa #9391: antes do save `cloth #b49a84, over #9b6740, cloak #b78f3c, hat #b77…`; depois, com a regra do ofício que fica, `cloth #b7b1aa, over #50484c, cloak #2a2430…`; e **no jogo de antes (`b2b61f0`) com um sorteio a mais por passada do repartidor** — o acaso do mundo deslocado, nada mais —, a mesma pessoa, `cloth #b6a486, over #a18346…`. No jogo de antes sem o deslocamento a prova passa. O ofício dela não muda no load (o `qa/oficio-fica.js` x10 confere os ofícios, os dias e a memória de todos antes e depois): alguma outra coisa que a roupa dela lê (`G.Atmos.dress`) não vai no save ou se refaz no load, num estado que o futuro exato do jogo de antes não visita. Não olhei a causa. Para o dono do `atmos.js`: `qa/detloc.js` com o save do instante da prova, ou imprimir o `D.code` da #9391 antes e depois do load. |

**No T-840** (a linha do agente Q), acrescentar ao fim: «**Fechado** pelo D-210 a D-213 (o ofício que fica, agente X): o ofício deixou de ser o da hora — a proposta do trabalho de uma vida não foi precisa, e a regra do `atmos-inv.js` («lenha sem lenhador») e a regra 52 ficam como estão. Depois: na metrópole pronta, dos moradores com um ofício que a casa mostra 80 % ficam com ele dois dias inteiros (era 62 %), e o que há em volta das casas muda a metade (78 vezes por dia, era 156); na mega 92 % (76 %) e 29 por dia (75).»

## 5. Linhas do README (as provas novas)

| `oficio-fica.js` | `[ONLY=x1,x4] node oficio-fica.js` (≈ 13 min inteira; cada parte 1 a 4 min) | O ofício é da pessoa, e muda devagar, por causa (D-210 a D-214; fecha o T-840), em Node, com o `possess.js`: x1 e x2 a metrópole e a mega prontas vividas dois dias e um dia e meio no passo — as trocas pela necessidade abaixo do teto (0,12 por adulto por dia; antes 0,69 e 0,42), a necessidade que durou move mãos (trocas para um ofício que já tinha mãos, não só para o posto vazio), quem troca é a mão mais nova (das mãos do ofício deixado que o repartidor podia levar, a parte com menos dias nele do que quem trocou: 30 % no máximo), ninguém troca duas vezes em menos de três dias, toda troca com a causa dita, nenhum cativo no repartidor, a casa guarda a cara (quem mora nela com um ofício que ela mostra fica com ele os dias inteiros: 75 % ou mais) e o que há em volta das casas muda pouco (seis décimos de antes, no máximo); x3 um mundo do zero (semente 103): os anos 20 a 30 no salto e um dia no passo abaixo do teto deles (T-954), o armazém de nenhum povo esvaziou, o povo cresceu; x4 a fome puxa e devolve (o armazém do povo a zero pela mão da prova, depois cheio); x5 a guerra puxa (a guerra mantida fresca pela mão da prova na conta dela mesma, T-957) — os bravos antes dos outros e, entre dois, a sorte de cada um (um caso montado) —, o povo cansado solta a metade dos soldados a mais e a memória do exército é o que o instante pede, e o povo com fome em guerra manda soldados à roça; x6 a vaga, com a memória da cidade em repouso pela mão da prova (morre quem tinha sozinho um ofício de oficina: outro toma o ofício e o posto, na hora, e a mão vem de outro ofício); x7 a oficina nova ganha gente; x8 o moço ganha ofício, o velho o larga; x9 o corpo do deus, o preso e quem está no mar não têm o ofício trocado (num ofício que a cidade não pede, de onde o repartidor tira a mão ao lado) e, soltos, têm; x10 o save no meio — o load não troca ninguém (com duas mãos por trocar na hora do save) nem mexe na memória, o mesmo save duas vezes vive o mesmo futuro, um save de antes carrega e vive; x11 o salto e o passo: a memória de uma cidade chega ao mesmo lugar no mesmo tempo de mundo nos dois ritmos; x12 o celeiro por graus; x13 a obra grande com a vez junta a turma na hora; x14 o dia da fundação: um mundo novo tem os construtores das primeiras casas nos primeiros segundos; x15 a paz devolve: uma guerra declarada e a paz do deus — num oitavo de dia as mãos que a guerra puxou estão de volta no ofício delas com os dias que tinham (pelo instante, como vieram), o exército desce para perto do que a paz pede, e quem voltou não é levado adiante por um terceiro ofício. Os tetos e os «antes» de cada linha são medidas desta prova no jogo de antes (`qa/patch3/bloco-X.md`). As sabotagens: `scratchpad/ag/X/sab-X.py` (a tabela, no bloco). |
| `oficio-fica-inv.js` | (carregado pelas provas; juntado ao `qa.js` pelo `junta-inv.js`) | As regras do verificador para o ofício que fica (sistema «oficio»): o dia em que a pessoa tomou o ofício (`v.roleDay`) é um dia que já houve e não é de antes dos dezesseis; o ofício de que uma emergência a tirou (`v.roleBack`) é um ofício, outro que o que ela tem, nunca de criança nem de ancião; a memória da cidade (`set.ofm`) são números nunca negativos; pelo registro do repartidor (`G.Village.tradeLog`), ninguém troca pela necessidade duas vezes em menos de `V.TRADE_MIN` dias e nenhuma troca fica sem causa; o dia, o ofício a que se volta e a memória entram no estado canônico. |
| `oficio-eco.js` | `node oficio-eco.js [sementes] [anos] [tipo] [tam] [povos]` (dez mundos de 40 anos: ≈ 20 min) · `node oficio-eco.js pronto:metropole [dias]` | **Um medidor, não uma prova** (não falha por número nenhum; só por erro do jogo): a economia e as armas para quem mexe no repartidor de ofícios, no que um ofício pede ou na guerra. Cada mundo do zero no salto, um ano por vez: a gente, os mortos de guerra, de flecha e de fome, a comida, a madeira e a pedra produzidas, os prédios, as cidades, a comida por pessoa mais baixa de um povo, e **as armas** — dos adultos dos povos em guerra e dos povos em paz, quantos são guerreiros (olhados a cada ano), e os mortos de guerra por povo-ano em guerra; no fim, a soma. Um mundo pronto, no passo, com as armas a cada quarto de dia. Rodar no jogo de antes e no de depois com as mesmas sementes e comparar as somas: mundo a mundo o acaso das guerras dá ±37 de gente e ±11 mortos (D-211: foi a conta das armas, não a soma da gente, que mostrou o exército que não voltava para casa). As contas do jogo em `b2b61f0`, as dez sementes: 20,8 % e 2,9 % dos adultos, 2,46 mortos por povo-ano de guerra. |

E na linha do `load-oficio.js`, trocar «o menor número, até três, que pede um caçador a mais (T-324)» por: «…, com os ofícios assentados no passo da memória da cidade (D-210: até 150 passadas), e o passo do mundo que redistribui depois do load em até 400 s».

## 6. Entradas do `regress.sh`

Na fase «fundacao», uma linha só dela (leva uns 15 minutos sozinha, e abre a metrópole dez vezes):
`  (F oficio-fica oficio-fica.js) &`

E no `junta-inv.js`: juntar `qa/oficio-fica-inv.js` (o sistema «oficio» é novo: se a regra 21 do guard tem a lista dos sistemas, entra lá).

## 7. Regras novas do `guard.js`

**Regra 73 — o dia do ofício, o ofício a que se volta e a memória da cidade só o repartidor escreve.** Em todo `js/*.js` que não seja o `village.js`, nenhuma linha (fora de comentário) pode casar
`/\.(roleDay|roleBack)\s*=[^=]|\.ofm\s*=[^=]|\.ofm\s*\[[^\]]+\]\s*=[^=]/`
(no `village.js` as escritas estão em `took`, na linha do ancião do `assignJobs` e em `const mem = set.ofm || (…set.ofm = {})`, com `mem[r] = …` depois). Mensagem: «o ofício que fica: `<arquivo>` escreve o dia do ofício, o ofício a que se volta ou a memória da cidade — só o repartidor (village.js) escreve (D-210 a D-212)». Hoje: nenhuma ocorrência fora do `village.js` (o `villagers.js` só tem os nomes na lista `SHAPE`).

**Regra 74 — o repartidor não sorteia, e o ofício de um adulto só muda por ele ou por uma porta dita.** (a) No `village.js`, do `function took(` até a linha `// ------------------------------ housing`, nenhuma chamada `/G\.(R|rr|ri|pick|chance|shuffle|VR|vrr|vri|vpick|vchance)\(/` (fora de comentário), e o nome `pickRoleForList` não existe mais em nenhum `js/*.js`. (b) Fora do `village.js`, uma escrita `/\.role\s*=\s*'[a-z_]+'/` que não seja `'cativo'` nem um `G.BDEF.<tipo>.role = …` só nas duas portas de hoje: `economy.js` (`E.openBlackMarket`: `v.role = 'contrabandista'`) e `miracles.js` (a mão do deus: `v.role = 'guerreiro'`). Mensagem: «o ofício que fica: `<arquivo>` dá um ofício a uma pessoa — só o repartidor (village.js), o mercado clandestino e a mão do deus (D-212)». Hoje: só essas duas (conferido com `grep`).

## 8. Frases para o `CLAUDE.md` (uma fundação nova, depois de «Quem a cidade manda embora»)

- **O ofício é da pessoa — `G.Village.tenure` / `tradeLog` / `tradeAsked`** (`js/village.js`, D-210 a D-214): o repartidor de ofícios (`assignJobs`) não troca ninguém pelo que falta nesta hora. O que cada ofício pede, para ele, é a memória da cidade (`set.ofm`, no save com a cidade: a média de meio dia do que o instante pede, andada pelo tempo — igual no salto e no passo); uma mão troca quando a memória e o instante concordam e os dois ofícios estão a uma mão e meia; o posto que ficou vazio pede na hora, e a cidade no dia da fundação reparte pelo instante. Quem troca é a mão mais nova do ofício (`v.roleDay`), sem sorteio nenhum (`pickHand`; o `guard.js` cobra, regra 74), e um ofício tomado fica ao menos três dias; o primeiro ofício (aos dezesseis) não prende. A fome (menos de um dia de pão no armazém do povo), a guerra e a obra grande com a vez (D-174) puxam na hora — os ofícios delas seguem o instante, para cima e para baixo —, e quem é puxado guarda o ofício que deixou (`v.roleBack`) e os dias dele, e **volta pelo instante, como veio** (o ofício em que está com uma mão a mais agora, o dele com falta de uma agora): a guerra acabada, o exército está em casa em segundos, não num ano da vida dos soldados. O dia, o ofício a que se volta e a memória só o repartidor escreve (regra 73); o corpo do deus, o preso e quem está no mar não têm o ofício trocado. **Sistema novo que mude o que um ofício pede** (`G.Eco.demand`, o `want` do `assignJobs`) **não precisa de histerese própria: a memória alisa** — mas uma conta que salta de um a dois de uma vez numa marca (o celeiro, D-213) faz melhor em ir por graus; e **um pedido que vem e vai em minutos** (as caixas no cais) é atendido pela memória do ofício, não na hora: se precisa mesmo de braços na hora, entra como emergência no `assignJobs` (`urgent`), com a causa dita (`took(v, de, causa)`), nunca escrevendo `v.role`. Para saber por que alguém trocou: `G.Village.tradeLog` (a causa e as contas) e a biografia. Uma prova que provoca o repartidor espera no passo da memória (o `qa/load-oficio.js` é o modelo). `qa/oficio-fica.js` prova.
- No parágrafo «Mexeu no planejador das obras grandes…», acrescentar: Mexeu no repartidor de ofícios (`village.js` — `assignJobs`, `pickHand`, `took` —, o que um ofício pede no `economy.js` `E.demand` / `E.share`, `G.War.warriorWant`)? Também `node qa/oficio-fica.js` (uma parte: `ONLY=x1`; a prova inteira, ≈ 15 min, antes da versão), `node qa/load-oficio.js`, `node qa/marinheiros.js` e, porque a economia inteira passa por ele, os dez mundos de 40 anos do `node qa/oficio-eco.js` (a gente, os mortos de guerra e de fome, a comida, **e as armas**: quantos adultos são guerreiros nos povos em guerra e em paz, e os mortos por povo-ano de guerra — foi essa conta, e não a soma da gente, que mostrou o exército que não voltava para casa).

## 9. O que esta mudança muda nos mundos prontos

Muda o mundo (quem tem qual ofício, e daí tudo): **os mundos prontos têm de ser gerados de novo** (a geração 20, pelo líder), e a
linha de base da regressão com eles. Os da geração 19 abrem e vivem (a prova os usa): sem a memória no save, a primeira passada
de cada cidade parte do instante (um quarto de dia de trocas a mais), e os dias de cada um contam-se desde os dezesseis.
Depois da geração 20, os «antes» das linhas do x1/x2 seguem sendo os da geração 19 (são a medida do defeito), e os tetos devem
seguir valendo — se a metrópole nova tiver uma guerra nos dois dias da prova, as trocas «guerra» entram à parte, como hoje (a
guerra da metrópole da geração 19 começa a um dia e um quarto do instante salvo).

Arquivos de outros agentes tocados: **`js/village.js`** (do M: só o bloco `// ---- the trade that stays` antes do `assignJobs`,
o corpo do `assignJobs`, `pickHand` no lugar de `pickRoleForList` e uma linha em `V.update`; nada em `plan`, `grow`,
`startProject`, `findSite`, `keeps`, `quarries`). `js/villagers.js`: três linhas no fim da lista `SHAPE` (os dois campos e o comentário; o F mexe no `decide`,
longe). `js/life.js`: `L.onRole` e a linha «trade» do `L.bioLine`. `qa/load-oficio.js`: o `settle` e o caso o2 (o passo da
memória). Arquivos novos, só em `qa/`: `oficio-fica.js`, `oficio-fica-inv.js`, `oficio-eco.js`. Nenhum arquivo novo em `js/`; o
catálogo das plantas não muda. **Para quem junta os ramos:** o `village.js` do líder ganhou linhas no `assignHousing` (o R) e
no planejador (o M) — nada no `assignJobs`, no `pickHand` nem na linha do `tJobs` do `V.update`, que são as minhas; o
`villagers.js` do F mexe no `decide`/`start`, eu só no fim da lista `SHAPE`.

## 10. O que ficou aberto

1. **T-956 — o `qa/vida-bairro.js` v6 (e o v7, no mesmo bairro)** falha com a regra na metrópole da geração 19, cinco vezes
   de cinco, e passou no jogo de antes (duas de duas): o bairro que a prova escolhe no décimo dia é outro em cada futuro, e os que saíram com
   a regra estavam meio vazios (casa vazia não fica rica nem pobre). Não sei dizer se é acaso da escolha ou se a regra deixa
   as cidades velhas mais vazias aos dez dias de guerra (a gente da metrópole: 723 → 676 no salto, 638 → 689 no passo).
   Para o líder: rodar com a geração 20; e a prova devia escolher um bairro habitado de uma cidade em paz. **É o item que
   mais pede um segundo olhar.**
2. **As outras provas que falham** (seção 3, a conta): fome h13, marinheiros m9, roupa r7, termas e1, maos m10, degraus g2c2 e
   g4e — as mesmas mensagens no jogo de antes com o acaso deslocado (roupa, maos, fome), ou olhadas com rastro (termas,
   marinheiros, degraus: nenhuma troca de ofício envolvida). **Com a geração 20 têm de ser rodadas de novo**: são casos
   escolhidos num instante de um mundo pronto, e o mundo pronto muda.
3. **T-958 — `qa/roupa.js` r7**: a pessoa #9391 da metrópole fica vestida de outro jeito depois de um save em todo futuro
   da metrópole que não seja o do jogo de antes — também no jogo de antes com um sorteio a mais por passada do repartidor (a
   capa e a sobreveste mudam; o ofício dela não muda no load: x10). Alguma coisa que a roupa dela lê não vai no save ou se
   refaz no load. Não é do repartidor; não olhei a causa (é do `atmos.js` / do `people3d.js`, do líder).
4. **Duas guardas sem caso próprio** (D-211): a cláusula «o ofício de uma emergência com mãos demais solta qualquer uma»
   (sabotagem s33) e a margem de duas mãos enquanto a emergência dura (s37). Sabotadas, a prova passa. Ficaram porque a
   economia e as provas foram medidas com elas; para tirá-las, medir os dez mundos de novo (`node qa/oficio-eco.js`).
5. **T-950** — a cidade a que faltam mãos: qual ofício fica vazio (de antes; não feito).
6. **T-951** — os anos de uma pessoa correm à frente dos dias do mundo (de antes; não mexido).
7. **T-952** — gente longe de casa morre de fome com o armazém cheio (de antes; não é do repartidor).
8. **As trocas que restam** (0,09 a 0,10 por adulto por dia) são dos moços achando o ofício (o primeiro ofício não prende),
   das vagas de quem morre ou faz sessenta e dois, e das vilas no dia da fundação; num mundo novo de cidades de dez adultos a
   conta por adulto é mais alta que numa metrópole (T-954). Uma regra mais dura (o moço fica onde caiu) custaria à cidade
   pequena a mão que ela pede.
9. **O que a casa mostra numa guerra**: quem é chamado às armas vira guerreiro na hora (o escudo à porta) e volta depois — a
   lenha some e volta com ele (na metrópole da geração 19, com a guerra no meio dos dois dias, 3 dos 8 lenhadores ficaram com
   o ofício os dois dias). É a regra do `atmos` (só o que a casa tem, agora), e é causa durável; se o dono quiser que a casa do
   lenhador siga com a lenha enquanto ele está na guerra, o `G.Atmos.about` pode ler `v.roleBack || v.role` (uma linha no
   `atmos.js` e na regra do `atmos-inv.js`, que são do líder) — não feito.
10. **Os pedidos de minutos** (as caixas no cais pedem estivadores, D-102/L-428): o `qa/porto.js` passa com a memória, mas um
    porto sem navio há dias responde ao primeiro navio no passo da memória (um terço de dia para a primeira mão a mais), não em
    segundos. Não é emergência hoje; se o cais ficar com caixas, é o candidato (uma linha no `urgent` do `assignJobs`).
11. **A obra grande longe do armazém** (o `degraus` g4e): com a turma inteira no ofício os dois anos, o teatro de Roma
    recebeu 8 de pedra com a regra e 24 no jogo de antes, de 150 no armazém — a pedra guardada vaza para outras obras do
    povo nos dois (o L-783 e a carroça da obra, D-215, do ramo do líder, são desse defeito; este ramo não os tem). Com os
    ramos juntos, rodar o `degraus` e o `canteiro` de novo.
12. **As regras 73 e 74 do guard, a junção do `oficio-fica-inv.js` no `qa.js`, a linha do `regress.sh`, o AUDIT, o README e o
    CLAUDE.md** são do líder (este bloco tem os textos). **Os mundos prontos** não foram gerados (seção 9).
