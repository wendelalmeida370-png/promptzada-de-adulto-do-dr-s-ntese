# Bloco F2 — a segunda rodada da freguesia: a praça ao fim da tarde, o foguista no posto, o bairro dos banhos

Agente F, segunda rodada. Base: `f5d08ed` (a ponta do líder). Números reservados: L-911 a L-929, T-921 a T-929,
D-225 a D-229; regras do guard 79 e 80. O `bloco-F.md` (a primeira rodada) fica como está.

**Estado:** os itens 1, 2 e 3 feitos, com prova (`qa/praca.js`, `qa/praca-inv.js`), sabotagens e medidas; do item 4, o
passeio antigo com a regra do tempo (T-919) feito e provado, e **as crianças nos banhos com um dos pais não foram feitas** —
fica aberto. Um bug de fora dos três itens, achado pelas vizinhas e consertado: o cadafalso chamava da refeição quem
morria de fome (L-913, §5b).

Os arquivos mexidos:

| arquivo | o quê |
|---|---|
| `js/act-lazer.js` | a praça (`G.Praca`: `wish`, `lot`, `hourOf`, `fair`, `pick`, `spot`, `urge`, `go`, `playAt`, a tarefa `'praca'`, o texto, o save) |
| `js/villagers.js` | o `decide` (a linha da praça; a refeição do foguista: `post`, `mealFirst`), o `start` (`'home'` passa pela praça; `'praca'`), o `'play'` das crianças |
| `js/act-servicos.js` | o posto do foguista (`Te.onDuty` com as horas antes de abrir, a perna, `callStoker`, `Te.mealFirst`, a espera à fornalha); o banho na chave «banho» |
| `js/life.js` | **uma linha** (a água da casa não vai com o foguista de posto) — ver §3 |
| `js/urban.js` | **três linhas** (a chave «banho», o perfil «de banhos», o texto dele; e a palavra «banho» tirada do texto do «boêmio») — ver §4 |
| `js/audio-src.js` | **cinco palavras** (a família «banho» do som) — ver §4 |
| `js/possess.js` | **uma entrada** (o que o corpo vê de um bairro «de banhos») — ver §4 |
| `qa/praca.js`, `qa/praca-inv.js` | a prova e as regras do verificador (novos) |
| `qa/freguesia.js` | o b7 confere a chave «banho» (e que nenhuma nota dos banhos vai a outra chave) |
| `js/city.js` | **uma linha** no `Ci.leisureTask` (o passeio só manda aos banhos quem tem tempo: T-919) |
| `qa/termas-mao.js`, `qa/termas-grandes.js` | o começo do primeiro bloco e o D1: o dia chama o foguista, a mão da prova não (T-929) |
| `qa/tempo-livre.js` | uma linha no `rest()`: um passo mais antes de olhar o gesto (T-924a) |
| `qa/lazer.js` | três cuidados da mão da prova, nenhum caso afrouxado: o l6 guarda o tempo da tarde durante a peça, o l11 julga o lugar pela hora (como o l10), o l12 descansa a atriz do caso (T-924b a d) |
| `js/justice.js` | **três palavras e uma linha** (`starving`: o carrasco e o arauto não saem de quem tem a fome acima de 85) — L-913, §5b |
| `qa/fome.js` | o caso h21 (o cadafalso não tira ninguém da refeição da fome) |

## 1. A medida de antes (a base `f5d08ed`, sem nenhuma mão: só a paz do deus)

O medidor: `scratchpad/ag/F/mede2.js` (de dentro de `qa/`: `MUNDO=metropole node …/mede2.js 5`). Conta, a cada segundo do
mundo, por cidade e por hora do dia (40 partes): quem está parado na praça (acordado, fora de casa, sem andar, dentro do
lote da praça mais meia casa), quem está na conversa dela (a tarefa `'praca'`, parado), as crianças a brincar nela, todos
os que estão na praça (parados ou de passagem, o lote mais uma casa), à porta do mercado, na taverna, em casa acordado, em
família à porta, na fogueira; e, pelo livro, as ceias, as refeições frias, os copos da taverna, as entradas do teatro e dos
banhos; e de cada dia de banhos, as entradas, a lenha e a parte das horas com a água quente.

**A metrópole pronta, dias 58 a 62** (704 → 842 pessoas). Parados na praça, por hora (de 0,025 em 0,025 do dia):

| cidade (pessoas) | 0,600 | 0,625 | 0,650 | 0,675 | 0,700 | 0,725 |
|---|---|---|---|---|---|---|
| Argos (108) | 0,2 | 0,1 | 0,2 | 0,2 | 0,2 | 0,1 |
| Mênfis (133, 2 praças) | 0,1 | 0,4 | 0,0 | 0,2 | 0,3 | 0,1 |
| Roma (47) | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 |
| Tenochtitlan (146) | 0,6 | 1,3 | 1,6 | 2,0 | 1,5 | 1,2 |
| Tebas (65) | 0,1 | 0,0 | 0,0 | 0,3 | 0,3 | 0,0 |
| Kaupang (37) | 0,0 | 0,0 | 0,0 | 0,0 | 0,1 | 0,0 |

O mundo, por dia: 12,8 ceias (cozidas), 82,6 refeições frias, 21,6 copos na taverna, 23,2 entradas do teatro, 22,6
entradas pagas dos banhos. A fornalha acesa em **17 de 20** dias de banhos (96 banhos).

**A mega pronta, dias 50 a 54** (446 → 538 pessoas): Mênfis (172, 2 praças) 0,6 a 0,2; Roma (89) 0,4 a 0,8; Delfos (39)
0,0 a 0,2. O mundo, por dia: 26,2 ceias, 82,4 refeições frias, 24,8 copos, 6,4 entradas do teatro, 16,2 banhos pagos. A
fornalha acesa em **5 de 11** dias de banhos (os de Hedeby e de Delfos **não têm foguista**: T-926).

Os arquivos: `scratchpad/ag/F/r2/antes/` (`mede2-*.txt`, `mede2b-*.txt` com as linhas novas do medidor, `fornalha-*.txt`,
`bairro-metropole.txt`).

### O dia deste mundo acaba antes de escurecer (T-921, limite aberto — a decisão é do líder)

O fim da tarde deste mundo é curto, e não por falta de vontade: o povo acorda antes da luz e **está exausto antes de
escurecer**. A energia de um adulto acordado cai 1,25 por centésimo do dia (`villagers.js`, `needs`): de 100 ao acordar
(0,03) aos 22 que mandam para a cama são 62 centésimos — às 0,65, enquanto o relógio de cada um (`G.Lar.clock`) diz 0,74 a
0,81. Medido na metrópole, no segundo dia: às 0,58, 357 de 387 adultos têm a energia entre 20 e 40; às 0,66, 146 abaixo
de 20; às 0,70, 253 — e 176 de 388 já dormem ou vão dormir (136 pela energia, 1 pelo relógio). Na hora da praça (0,53 a
0,60), de cada cem adultos-dia: 13 já dormem, 9 estão no teatro, 4 nos banhos, 3 comem, uns 45 estão no meio de uma
carga, de uma obra grande, de uma operação ou de um posto — e só uns 14 estão livres ou num trabalho que se larga. Em
Tenochtitlan, 29 de cada cem estão no teatro e 24 dormem; em Mênfis, 18 no teatro, 13 nos banhos, 30 dormem. **O fim da
tarde já é do teatro, dos banhos e da cama; o que sobra para a praça é pouco.** Por isso a praça desta rodada tem gente,
mas não uma multidão (§2). Uma praça cheia até escurecer pede mexer na energia do dia (por exemplo: quem descansa — na
praça, à porta de casa, à mesa da taverna — cansa menos que quem trabalha), e isso muda a taverna (que fecha às 0,84 a
0,88 com dois fregueses às 0,75), a ceia e o sono de todos: fica proposto, não feito.

**E o sol que se demora encurta-o ainda mais.** Enquanto uma cena de história corre, o relógio do dia anda a 0,35
(`main.js`: `G.Scene.lingers`, «the sun lingers») — e a fome e o cansaço continuam a correr em segundos. Numa tarde com
uma cena, os mesmos centésimos do dia custam quase três vezes a energia: no segundo dia do caso l6 da `qa/lazer.js`
(Tenochtitlan, dia 59), das 0,505 às 0,60 o relógio andou a menos de metade, 22 pessoas entraram no teatro com 26 a 43 de
energia e 15 saíram para a cama com 9, a meio da peça; os três atores também, e a peça parou. Visto com o rastro
`scratchpad/ag/F/lzfull.js`; não mexi (é do `main.js` e do `scene.js`); entra na conta do T-921.

## 2. Item 1 — a praça e o mercado ao fim da tarde (D-225, D-226, D-229)

### O desenho (o que existia: a tarefa «social», o `Po.forum`, os lugares da praça, o descanso da D-157)

O que já havia para «ficar e conversar»: a vida da cidade de quem está sem trabalho (`G.City.leisureTask` → a tarefa
`'citylife'`: seis a treze segundos num ponto sorteado da praça — é de onde vinham os 0,2), a conversa de dois (`'social'`),
o descanso à fogueira ou à porta de casa (`'rest'`, D-157), a família à porta (`'family'`), os ajuntamentos chamados
(`Po.forum`: o voto, o pão — chamados, não vontades). Os lugares marcados na planta da praça (os bancos, os pares de
«conversar») só o corpo do deus usa: o repartidor de lugares (`In.places`, regra 29) dá lugar a quem está **dentro** de um
prédio, e a praça é chão aberto (T-922). Nenhum deles é uma escolha de cada um com causa — fiz a escolha, numa tarefa
própria (`'praca'`, só do `act-lazer.js`) com o gesto que já existe (`v.act = 'talk'`: a linha do som e a pose do 3D já
estavam lá; nenhum gesto novo).

**Quem** (`Pr.wish`, a parte dos dias): todo crescido com casa, 0,60; mais o velho (62 ou mais, +0,25), o moço (menos de
26, +0,20), o sociável (+0,15), o mercador onde há mercado (à porta dele, ou numa praça a 8 casas dele: +0,30); menos quem
mora longe (a casa a mais de 8 casas: cai até um quinto, em 30 casas). **Quando**: o fim da tarde — cada um de uma hora
sua (`Pr.hourOf`: os velhos das 0,50 às 0,56, os outros das 0,53 às 0,60), até escurecer (0,73) e não mais do que as
pernas aguentam (`Pr.TIRED`); não na chuva, na tempestade, no frio forte (o da terra ou um inverno do deus), com a guerra
à porta (`G.War.threat`), no pânico, nem durante uma festa da cidade (`Pr.fair`). **Quanto**: a sorte do dia de cada um
(`Pr.lot`, o `G.hash` da pessoa e do dia — nada do acaso do mundo, nenhum campo novo na pessoa). **O que impede**: a
fome (mais de 65), o cansaço (menos de 23 de energia), a doença, o medo, a carga nas mãos, a perna de uma operação
(D-094), os pequenos para cuidar, um bebê no colo, o luto, o foguista no posto, a praça cheia (três por casa do lote:
doze na praça de duas por duas; quem vem a caminho conta), a caminhada de mais de 30 casas; nunca o corpo do deus.
**Onde**: a praça mais perto de casa (D-157: a das suas ruas), ou a porta do mercado enquanto ele vende (as horas das
bancas, `G.Biz.hours`: até 0,62); o lugar de cada um é dele o dia inteiro (`Pr.spot`: em volta do meio da praça, fora da
fonte, pelo `G.hash`), virado para quem está mais perto.

**Como entra na escolha do dia** (`decide`):
- antes do fim do dia de trabalho (0,60), a partir da hora de cada um: a opção `'praca'` vale 0,6 — mais que o trabalho
  de um dia comum (0,55), menos que o de um trabalhador aplicado (0,69) —, e **larga-se por ela o afazer comum do dia**
  (`Pr.CUT`: o machado, a enxada, a colheita, a rede, o calçamento, o treino, a obra comum); nunca a carga, a perna de uma
  operação, o posto (a guarda, a ronda), a pedra (a mina, a pedreira) nem a obra grande da cidade (`set.gw`, D-174). Sem
  isso a praça ficava vazia: um afazer do dia segura-se contra tudo o que pesa menos, e só 16 de cada cem adultos têm um
  instante livre nessa janela;
- por mais um instante depois dele (até 0,62), só para quem o fim do dia apanhou no meio de um afazer comum (`Pr.OVER`):
  um afazer em curso nunca é largado pelo caminho de casa nem pela taverna — a praça não tira ninguém delas;
- com o dia de trabalho acabado, a praça é **a caminho de casa** (`start`, `'home'`): a ceia e a horta primeiro, depois a
  praça, depois a família à porta — a taverna e o teatro, escolhidos antes do caminho de casa como sempre, não perdem
  ninguém para ela.

**As crianças** (D-226): as de sete anos ou mais que moram a 8 casas de uma praça brincam nela, e não à porta de casa, em
seis tardes de cada dez (`Pr.playAt`: a sorte do dia pelo `G.hash`; das 0,50 ao escurecer, com tempo bom). O jogo é o
delas (`villagers.js`, `'play'`): a praça só diz onde. Sem custo de trabalho — e é o que mais enche a praça à tarde.

**A vida do bairro** (D-229): a praça cheia **não conta em chave nenhuma** do `G.Urban.note`. A conversa da praça não é
troca (não há venda), não é «noite» (a taverna e o espetáculo: o erro da D-202 seria repetido), e nenhuma outra chave é
dela; uma chave própria («praça», um perfil «de praça cheia») é possível pelo mesmo caminho da chave «banho» (§4), e não a
fiz: toda cidade tem a praça no centro, e o perfil diria «centro» de outro jeito.

**O save**: quem estava na conversa ou a caminho segue nela depois de um load (o gancho do `act-lazer.js` guarda a praça,
o lugar e de que escolha veio; um save de antes não tem a lista, e uma lista estragada não devolve nada).

### As medidas de depois (o mesmo medidor, os mesmos dias, na paz do deus)

**A metrópole pronta, dias 58 a 62** (704 → 818 pessoas). Parados na praça, por hora — antes → depois:

| cidade (pessoas) | 0,600 | 0,625 | 0,650 | 0,675 | 0,700 | 0,725 |
|---|---|---|---|---|---|---|
| Argos (102) | 0,2 → 1,1 | 0,1 → 1,1 | 0,2 → 1,1 | 0,2 → 1,0 | 0,2 → 0,7 | 0,1 → 0,2 |
| Mênfis (130, 2 praças) | 0,1 → 0,9 | 0,4 → 0,7 | 0,0 → 1,0 | 0,2 → 0,8 | 0,3 → 0,7 | 0,1 → 0,2 |
| Roma (47) | 0,0 → 0,7 | 0,0 → 0,7 | 0,0 → 0,8 | 0,0 → 0,4 | 0,0 → 0,3 | 0,0 → 0,1 |
| Tenochtitlan (142) | 0,6 → 2,2 | 1,3 → 2,7 | 1,6 → 3,6 | 2,0 → 3,8 | 1,5 → 3,1 | 1,2 → 0,8 |
| Tebas (63) | 0,1 → 1,3 | 0,0 → 0,9 | 0,0 → 1,3 | 0,3 → 1,4 | 0,3 → 1,1 | 0,0 → 0,3 |

Todos os que estão na praça (parados ou de passagem, o lote mais uma casa), das 0,575 às 0,650 — antes → depois: Argos
1,7 / 1,9 / 1,4 / 1,3 → 4,8 / 4,2 / 4,0 / 2,6; Mênfis 1,2 / 1,0 / 1,9 / 0,9 → 3,9 / 5,2 / 2,8 / 3,9; Tenochtitlan 3,4 / 1,9 /
3,1 / 3,3 → 5,5 / 4,8 / 5,2 / 5,7; Tebas 4,8 / 3,8 / 1,3 / 1,6 → 5,6 / 5,7 / 4,6 / 3,6. As crianças a brincar na praça à
tarde (0,525 a 0,600): Argos 0,6 a 0,9 → 1,6 a 2,1; Mênfis 0,1 a 0,3 → 2,1 a 2,4; Tenochtitlan 0,7 a 1,5 → 2,4 a 3,7.

**A mega pronta, dias 50 a 54** (446 → 545 pessoas). Parados na praça, das 0,600 às 0,700 — antes → depois: Mênfis (173,
2 praças) 0,6 / 0,5 / 0,3 / 0,3 / 0,4 → **5,1 / 3,7 / 4,7 / 4,9 / 3,9** (todos na praça: 4,1 / 5,6 / 4,0 / 3,7 → 12,1 / 9,6 /
9,5 / 8,9); Roma (103) 0,4 / 0,6 / 0,6 / 0,8 / 0,5 → 2,2 / 3,6 / 4,5 / 2,9 / 1,9.

**O que já vivia** (o mundo, por dia; uma história de cada lado — os dias vividos são caóticos: entre duas histórias do
mesmo código as ceias foram de 10,8 a 27,2 por dia):

| por dia | metrópole antes | metrópole depois | mega antes | mega depois |
|---|---|---|---|---|
| ceias em casa (cozidas) | 12,8 | 15,2 | 26,2 | 25,4 |
| refeições frias | 82,6 | 79,0 | 82,4 | 72,0 |
| copos na taverna | 21,6 | 20,8 | 24,8 | 22,8 |
| entradas do teatro | 23,2 | 26,6 | 6,4 | 5,2 |
| entradas pagas dos banhos | 22,6 | 30,6 | 16,2 | 21,0 |
| a fornalha acesa (dias de banhos) | 17 de 20 | 19 de 20 | 5 de 11 | 9 de 14 |

A fogueira: de tarde (0,45 a 0,60), 0,0 a 0,4 pessoas por cidade antes e 0,0 a 1,0 depois (o contador de histórias
fica: o ofício dele não é largado pela praça); do fim do dia de trabalho em diante não havia ninguém nela antes, nem há
depois. A família à porta de casa (as crianças, sobretudo), das 0,625 às 0,700 — antes → depois: Argos 9,2 a 15,3 → 8,0 a
12,4; Mênfis 10,4 a 13,7 → 11,9 a 16,8; Roma 3,3 a 6,5 → 3,5 a 6,2 (a metrópole); Mênfis da mega 8,5 a 12,8 → 13,3 a 18,9.

**A leitura honesta:** a praça passou de vazia a ter gente — um a quatro adultos na conversa de cada vez nas cidades de
cem ou mais (quatro a cinco na Mênfis da mega), mais as crianças à tarde; três a doze pessoas na praça entre as 0,55 e as
0,68 onde havia uma a quatro. Não é uma multidão, e não será sem mexer no dia do mundo (T-921): nos três dias da prova,
24 paradas na praça por dia no mundo inteiro, de uns 390 adultos.

## 3. Item 2 — o foguista no posto (T-918 → L-911, D-227)

**A causa, medida na base** (`scratchpad/ag/F/fornalha.js`: o que o foguista fazia nas horas dos banhos, dia a dia). Com
foguista e lenha, a fornalha ficou fria em 3 de 20 dias da metrópole e acendeu tarde em muitos (a água quente só desde
0,41 a 0,60 em oito dias; as portas abrem às 0,25). O que o levava: um chamado de fora (o adeus de um navio 39% das horas
do dia, um julgamento 33% a 42%, uma comemoração 33%, uma festa 40%), a água de casa (24% a 34%), a refeição (a fome
até 93), e — o que mais atrasava — **o afazer da manhã**: sem nada para fazer nos banhos antes de abrir, o foguista vai
cortar lenha ou colher como qualquer um, e um afazer do dia segura-se contra o seguinte da mesma espécie (`decide`:
`cur.kind === best`): as portas abriam com a fornalha fria enquanto ele acabava uma árvore e a levava ao armazém.

**Como os outros serviços abertos seguram o posto** (D-102, o taverneiro, o marinheiro, o ator): a D-102 guarda **a
vaga** (uma mão por serviço aberto acima do teto dos ofícios), não o posto; o taverneiro atende com a prioridade 1,05 e a
taverna abre às 0,55, fora das horas da água de casa (0,06 a 0,55) — não precisa de mais; o marinheiro é chamado pela
porta `G.Vg.canSend` e fica a bordo; **o ator é o modelo**: no palco ele está na *perna* da operação dele (`def.leg`,
D-094), e um chamado de fora abaixo de 3 não o tira dela (L-426, L-503). Fiz o mesmo para o foguista.

**O conserto** (D-227):
1. **O posto é a perna da operação** (`A.hooks.leg`): o foguista no afazer da fornalha (`'fornalha'`, `'lenhaTermas'`),
   com o fogo ainda sem dar até fechar, tem as mãos ocupadas para todo chamado de fora (`G.Vg.busy`, `G.Vg.handsBusy`: a
   festa, a comemoração, o adeus, o julgamento, a leva…). Só enquanto está nele: quem já estava numa festa ou num
   julgamento quando as portas vão abrir não segura perna nenhuma (a regra `QA.maos` da D-094 continua limpa).
2. **De posto desde antes de abrir** (`Te.onDuty`): 0,05 do dia antes das portas, mais a caminhada de onde ele está até
   lá (até 0,08 mais); uma vez a caminho da fornalha, de posto até as portas abrirem.
3. **O dia dos banhos chama-o ao posto** (`callStoker`, no segundo do mundo): de posto e noutro afazer que não pesa mais
   (o machado, a enxada, a talha de casa, um passeio), ele larga-o e vai à fornalha — busca a lenha, espera a hora junto
   dela (`t.pre`), alimenta-a ao abrir. Nunca da cama, de uma refeição, de um perigo, de um chamado de mais peso, nem com
   uma carga nas mãos; nunca o corpo do deus.
4. **A água de casa vai com outro da casa** (`js/life.js`, uma linha — ver abaixo); sozinho em casa, a talha espera o
   fogo alimentado até fechar (duas achas dão o dia: o posto dura minutos).
5. **A refeição é antes de abrir** (`Te.mealFirst`, no `decide`): nas 0,2 do dia antes das portas, com mais de 30 de
   fome, ele come; de posto, só sai para comer com fome de morrer (mais de 85) — e aí o dia dos banhos não o chama de
   volta da refeição.

**A linha exata no `js/life.js`** (a escolha de quem vai buscar a água da casa, no `L.update`, logo depois do
`if (v.task && v.task.pri >= 1.05) continue;`):

```js
        // (nor the stoker at his post, the fire of his baths still to feed: another of the house goes, or the jar waits for
        // the fire fed to the closing — G.Termas.onDuty, D-227)
        if (G.Termas && G.Termas.onDuty && G.Termas.onDuty(v)) continue;
```

**O que fica aberto do lado do foguista:** os banhos **sem foguista** (na mega pronta, os de Hedeby, 35 pessoas, em cinco
dias de cinco, e os de Delfos): quem dá o ofício é o repartidor (do agente X) e a procura (`E.demand`: um foguista por
banhos com 8 adultos e a comida garantida) — T-926; e o foguista **já num chamado** (uma festa, um julgamento) quando as
portas vão abrir fica nele até o fim, e a água esquenta tarde nesse dia — T-927.

## 4. Item 3 — o bairro dos banhos não é «boêmio» (D-202 → L-912, D-228)

**A decisão: uma chave própria, «banho», com o seu perfil, «de banhos»** — e não um peso na «noite». Um peso não resolve:
medido na base depois de doze dias na paz do deus, o bairro dos banhos de Mênfis (11 banhos por dia, sem taverna nem
teatro nele) tinha 2,88 de «noite» por célula e era «boêmio» (o perfil liga a 0,3); para os banhos sozinhos nunca fazerem
um bairro boêmio o peso teria de ser menor que um décimo — e as termas grandes, com o dobro dos banhos, passariam de
novo. O banho de dia não é noite: é outra vida do bairro, e o bairro onde vinte pessoas se banham por dia **é** um bairro
de banhos.

**As linhas exatas no `js/urban.js`** (três, e uma palavra):

```js
  U.KEYS = ['cais', 'pesca', 'troca', 'oficio', 'mina', 'campo', 'armas', 'fe', 'saber', 'noite', 'banho', 'crime'];   // + 'banho'
```
```js
    termal: { name: 'de banhos', k: 'banho', on: 0.3, off: 0.15 },                                                   // nos U.TAGS, depois do boemio
```
```js
    termal: (q, on) => (on ? 'Os banhos encheram: gente na água todo dia.' : `Os banhos esvaziaram: ${quiet(q, 'banho', 'ninguém nos banhos', 'cada vez menos banhistas')}.`),   // no WHY
    boemio: (q, on) => (on ? 'A noite pegou: taverna e espetáculo cheios.' : …                                        // saiu a palavra «banho»
```

As marcas (0,3 para ligar, 0,15 para desligar, por célula e por dia) são as do «boêmio» e do «de comércio vivo»: num
bairro de seis células, dois banhos por dia. O save: a conta do dia (`S.urbAcc`) e a vida dos bairros (`d.vida`) são por
chave — um save de antes abre como estava (as contas de «noite» que os banhos lá tinham deixado somem na média lenta, em
uns cinco dias), e a chave nova começa em zero.

**No `js/act-servicos.js`** (meu): as duas notas do `payEntry` passam de `'noite'` a `'banho'`.

**No `js/audio-src.js`** (o som lê a vida do bairro pela família do gesto: o fundo do bairro dos banhos é o hábito da
chave dele): `A.FAMS` ganha `'banho'`; `FAM_DEF.termas` e `FAM_DEF.lenhaTermas`, `FAM_TASK.termas` e `FAM_TASK.fornalha`,
e a linha do gesto `banhar` passam de `'noite'` a `'banho'`; `TAG_OF` ganha `banho: 'termal'`. **No `js/possess.js`**: o
`SEEN_TAG` ganha `termal: 'gente indo e vindo dos banhos'` (o que o corpo vê de um bairro que não sabe nomear).

**A regra 50 do guard** (a porta só de dentro do passo do mundo) continua a passar: as notas são as mesmas duas chamadas,
onde a entrada se fecha.

## 5. A prova — `qa/praca.js` (com `qa/praca-inv.js`)

`node qa/praca.js [metropole|mega]`, `ONLY=a,b,f3,…`, `DIAS=n`; a prova inteira: ≈ 8 min na metrópole.

| parte | o que prova |
|---|---|
| a1, a1b | o que impede a praça — 22 impedimentos, um de cada vez, zeram a vontade de quem a tinha (o corpo do deus, a carga, o preso, o cativo, a bordo, a criança, a fome, o cansaço, a doença, o medo, o sono, sem casa, cedo, de noite, sem tempo, a chuva, a tempestade, o frio forte, o inverno do deus, o pânico, a guerra à porta, a festa); e a praça cheia (quem vem a caminho conta), a distância, o foguista no posto, a sorte do dia |
| a2 | quem quer mais (o velho, o moço, o sociável, o mercador junto do mercado) e menos (quem mora longe, até o piso) |
| a3 | a sorte do dia é da pessoa e do dia, espalhada por igual, a mesma o dia inteiro, outra amanhã; perguntar de fora do passo não muda o mundo nem tira do acaso dele |
| a4, a4m | a praça mais perto de casa (numa cidade com duas: a mega); o lugar de cada um dentro da praça, fora da fonte, o mesmo o dia inteiro; o mercado só enquanto vende |
| a5 | o que se larga pela praça (o machado, a enxada, a obra comum) e o que não (a pedra, o posto, a obra grande, a carga, um afazer de mais peso, a refeição); a hora de cada um; depois do fim do dia, só quem está no meio de um afazer comum |
| b1 a b5 | três dias vividos sem ninguém mandado, na paz do deus: a praça tem gente na conversa e crianças a brincar; ninguém é chamado dormindo, com carga, com as mãos numa operação, de posto, com fome, na chuva, fora de hora, criança, sendo o corpo do deus, com a sorte fora da vontade ou no meio de um afazer de mais peso; ninguém na conversa depois de escurecer; a taverna, o teatro, os banhos e a ceia continuam; o verificador limpo |
| f1, f2 | nos mesmos dias: com foguista e lenha no povo, a fornalha acesa em todo dia de banhos, e cedo; o foguista de posto não é levado por uma vontade, pela água de casa, nem da fornalha por um chamado de fora |
| f3a, f3b, f3c | pela mão da prova: chamado do machado à fornalha antes de abrir, o chamado de fora que não o leva (e que o leva com o fogo alimentado), a fome de um dia comum que não o tira; a refeição antes de abrir, a fome de morrer que o tira e não é desfeita; a talha de casa que espera, e vai com outro da casa |
| q1 a q4 | cada entrada conta uma vez em «banho», nunca noutra chave; doze dias saltados: o bairro com os banhos cheios é «de banhos», nenhuma nota de «noite» vem dos banhos; a conta atravessa um save, e um save de antes abre como estava; as famílias do som são as chaves do bairro |
| e1 a e6 | um save no meio da conversa (duas vezes: o mesmo futuro, quem estava segue nela); quem morre a caminho e na conversa; a guerra à porta; a chuva que começa; o deus derruba a praça; o escuro |
| t | o passeio antigo com a regra do tempo (T-919): cedo leva aos banhos, perto de fechar não |
| h | o verificador pega oito mentiras (o cativo, a criança, a carga, o sono, a noite, a praça que não existe, a de outra cidade, a praça cheia demais) e nada sem elas |

**As regras do verificador** (`qa/praca-inv.js`, a juntar ao `qa/qa.js` pelo `junta-inv.js` — o sistema «praca»): ninguém
cativo, preso ou criança na conversa (S2); a conversa é numa praça ou num mercado de pé, da cidade da pessoa (S2); ninguém
nela com carga ou dormindo (S3); ninguém nela fora das horas da praça (S3); nenhuma praça com mais gente do que comporta
(S3).


## 5b. O que as vizinhas acharam (fora dos três itens)

### L-913 — o cadafalso chamava da refeição quem morria de fome (`js/justice.js`)

**Como apareceu.** A parte `i` da `qa/freguesia.js` (quatro anos saltados na paz do deus) falhou neste ramo com a regra S2
da fome: «Graco #7025 (Roma) morre de fome com comida ao alcance: o armazém (1238 no estoque); tarefa justice, vida 8».

**Reproduzido** (`scratchpad/ag/F/graco.js`: o mesmo salto, a seguir quem a regra acusa): no dia 59 Roma e Mileto ardem
de noite; Graco, sacerdote, passa a noite a apagar o fogo (o afazer do fogo pesa 4, a refeição da fome 2,5): às 0,215 tem
a fome a 99, a energia a 0 e 13 de vida; foge do fogo, e às 0,305 vai comer; **às 0,310 é chamado para arauto de uma
execução** (4,5) com 9 de vida, e a regra acusa às 0,325. Só comeu às 0,50, com 4 de vida.

**A causa.** O `pickExecutioner` e o `pickHerald` deixam de fora quem tem um afazer de 3 ou mais e quem tem as mãos numa
operação (D-094) — mas a refeição de quem tem a fome acima de 85 pesa 2,5, e o cadafalso (5 e 4,5) tirava-o dela.

**O conserto** (o menor: uma linha nova e três palavras): `const starving = v => v.hunger > 85;` e `|| starving(v)` nas
duas escolhas, e `&& !starving(r)` em quem governa como arauto. Quem tem a fome que a escolha de cada um põe acima de todo
trabalho não é carrasco nem arauto: sai outro.

**A prova:** `qa/fome.js` **h21** (o molde dos casos «achado pela regra S2»): uma execução «logo» numa cidade calma, todos
os crescidos com a fome a 90 pela mão da prova menos dois, livres e de barriga cheia — o carrasco e o arauto são esses
dois. **A sabotagem** `j1` (o `starving` desligado): o h21 falha — «o arauto, Ocelotl (fome 91) — TIRADO DA REFEIÇÃO».

**O que fica dito e não mexido:** quem apaga o fogo não come (o fogo pesa 4; a regra da fome não acusa quem está no
fogo, de propósito) — nessa noite quatro pessoas de Roma e de Mileto chegaram a 5 a 13 de vida no fogo com a fome no
máximo. Não é desta rodada.

### As três linhas da `qa/lazer.js` (T-924b a d) — a mão da prova, nenhum caso afrouxado

A `lazer` falhou em três casos neste ramo, e nenhum pela praça (com o tempo guardado, o l6 tem **21** que vieram por
conta própria e viram a peça até o fim; na ponta da primeira rodada eram 15). Vistos um a um com rastros
(`scratchpad/ag/F/lzfull.js`):

- **l6** (a saída da tarde por conta própria): no primeiro dia do caso choveu às 0,555 — as portas abrem às 0,56 — e 49
  de Tenochtitlan abrigaram-se a caminho (a prova já tirava a chuva no começo da tarde, no `ready()`; a chuva veio
  depois); no segundo, o sol demorou-se por uma cena (ver o T-921) e a plateia foi dormir a meio; no terceiro, uma leva
  de guerra e os atores a dormir. **A prova guarda o tempo da tarde durante a peça** (o `dry()` a cada segundo do caso),
  como já o guardava no começo. O que o caso afirma não mudou.
- **l11** (o leitor chamado antes do save): depois do load, livre e à porta da biblioteca, a leitora escolheu o rolo de
  novo pela vontade do dia dela (D-200, da primeira rodada) dentro dos dois segundos, e o caso lia «o livro ainda a tem».
  **O caso julga o lugar pela hora dele** — o de antes do load tem de ter sido solto; um lugar tomado depois é novo —,
  como o l10 do mesmo arquivo já faz para o teatro. O bug que o caso guarda (L-435: o livro que guardava os lugares para
  sempre) continua acusado: o lugar velho tem a hora velha.
- **l12** (o ator chamado não é levado por um afazer de fora): a atriz a caminho, nos dados deste ramo, era Itzel, com 38
  de energia às 0,40 — foi para a cama às 0,53, antes da peça, e o caso lia «não chegou à peça». **A mão da prova
  descansa a atriz do caso** ao pô-la à porta (a energia a 85, como o leitor do l11): o caso é o afazer de fora, não o
  sono dela.

## 6. Os resultados

**A prova inteira** (`node qa/praca.js`, a metrópole): **30 passam, 0 falham** (≈ 9 min). As linhas que dizem números,
dessa rodada: b1 «73 paradas na praça (24,3 por dia no mundo), 183 tardes de criança a brincar na praça; Argos (95): 1,7
por dia; Mênfis (120): 2,3; Tenochtitlan (129): 4,3, três de uma vez; Tebas (62): 2,7»; b2 «112 idas à praça: dormindo
0, com carga 0, as mãos numa operação 0, o foguista de posto 0, com fome 0, na chuva 0, fora de hora 0, criança 0, o corpo
do deus 0, a sorte fora da vontade 0, um afazer de mais peso 0; o que largaram: pave 2, farm 4, estate 9, chop 12, drill
6, build 7; 25 delas à porta do mercado; das 0,53 às 0,68»; b4 «em 3 dias: 100 copos na taverna, 89 entradas do teatro,
82 entradas dos banhos, 92 ceias em casa»; f1 «12 dias de banhos, 12 com a fornalha acesa; a água quente desde 0,27 em
oito deles, 0,28, 0,34, 0,35 e 0,49 nos outros»; q1 «69 notas "banho" para 69 entradas; noutra chave: 0»; q2 «as notas de
"noite" em 12 dias: teatro 424, taverna 146; de "banho": banhos 282 … Tebas: Bairro da Feira [de comércio vivo, letrado,
boêmio, de banhos]»; e1 «o save às 0,617 com 33 na conversa ou a caminho: logo depois de abrir 33 com a conversa de volta
… os dois futuros iguais».

**As sabotagens** (`scratchpad/ag/F/sab-F2.py`, uma de cada vez numa cópia nova pelo `sab-run.sh`; os resultados em
`scratchpad/ag/F/r2/provas/sabotagens.txt` e `sabotagens2.txt`): **37 sabotagens, 35 acusadas pela prova.**

| sabotagem | o que desfaz | quem acusa |
|---|---|---|
| p1 | o mundo de antes: a praça fora da escolha de cada um | b1 |
| p2, p3, p4, p5, p18 | o corpo do deus mandado; a carga nas mãos; sem a regra da chuva; sem a da guerra; o faminto vai | a1 |
| p6 | a sorte do dia tirada do acaso do mundo | a3 |
| p7, p10, p20 | quem vem a caminho não conta; o foguista de posto vai; a praça cheia leva mais um | a1b |
| p8, p9 | quem mora longe quer igual; o velho, o moço e o sociável querem igual | a2 |
| p11, p19, p21 | larga-se qualquer afazer (a pedra, o posto, a obra grande); sem a hora de cada um; depois do fim do dia a praça passa à frente do caminho de casa | a5 |
| p12 | o escuro não acaba a conversa | e6 |
| p13 | a chuva e a guerra não acabam a conversa em curso | e3, e4 |
| p14 | o save não leva a conversa | e1 |
| p15, p16 | o mercado a qualquer hora; o lugar de cada um dentro da fonte | a4m, a4 |
| p17 | as crianças brincam na praça na chuva | e4 |
| f1, f2, f5, f6 | o dia dos banhos não chama o foguista; o posto não é perna; a fome de um dia comum tira-o do posto; não há posto antes de abrir | f3a |
| f4 | sem a refeição antes de abrir | f3b |
| t1 | o passeio manda aos banhos a qualquer hora | t |
| q1, q2 | o banho volta a contar como «noite»; o banho conta duas vezes | q1 |
| q3 | sem o perfil dos banhos | q2 |
| q4 | o som dos banhos ainda é o da noite | q4 |
| h1 a h4 | o verificador sem a regra do cativo, da noite, da praça cheia, da praça de outra cidade | h |
| **f3** | a água de casa leva o foguista (a linha do `life.js` tirada) | **ninguém** — T-928 |
| **f7** | o dia dos banhos chama o foguista de volta da refeição (a guarda do `callStoker` tirada) | **ninguém** — T-928 |

As duas que passam (T-928, dito e não escondido): com o chamado ao posto (`callStoker`) o foguista de posto tem sempre
um afazer da fornalha de prioridade 1,05, ou está **dentro** dos banhos — e a escolha de quem busca a água já pula quem
tem um afazer de 1,05 e quem está dentro de um prédio; a linha do `life.js` só fecha o segundo em que o posto começa.
E a refeição de quem tem fome de morrer pesa 1,2 ou 2,5 — o chamado ao posto só tira de afazeres de 1,05 ou menos —, de
modo que a guarda «não o chama da refeição» só vale para uma refeição que pese menos (a ceia à mesa de casa, 0,5), que a
prova não provoca. As duas ficam no código como cinto e suspensório; a **regra 80** do guard proposta abaixo cobra a
primeira pelo código.

**As vizinhas** — (preenchido no fim)

**Os dez anos de paz** — (preenchido no fim)

## 7. Para o líder juntar

### `qa/AUDIT.md` — as linhas

| nº | tipo | texto |
|---|---|---|
| L-911 | bug (consertado, F: D-227) | **O foguista deixava a fornalha fria** (o T-918 medido). Na metrópole pronta, com foguista e lenha, a fornalha ficou apagada em 3 de 20 dias de banhos e acendeu tarde em oito (a água quente só desde 0,41 a 0,60; as portas abrem às 0,25). A causa: sem nada para fazer nos banhos antes de abrir, o foguista corta lenha ou colhe como qualquer um, e um afazer do dia segura-se contra o seguinte da mesma espécie (`decide`: `cur.kind === best`) — as portas abriam com ele a acabar uma árvore; e, à fornalha, um chamado de fora o levava (o adeus de um navio 39% das horas do dia dele, um julgamento 33% a 42%, uma comemoração 33%, uma festa 40%), a talha de casa (24% a 34%) e a refeição (a fome até 93). O conserto: D-227. Depois: 12 de 12 dias com a fornalha acesa nos três dias da prova (a água quente desde 0,27 em oito), 19 de 20 nos cinco dias medidos (o vigésimo: o foguista com a fome a 100, a comer ou a dormir 98% das horas) e 9 de 9 na mega. |
| L-912 | bug (consertado, F: D-228) | **Os banhos sozinhos faziam um bairro «boêmio»** (a D-202 medida). A entrada nos banhos contava na chave «noite» da vida do bairro; com a freguesia (L-717), doze dias na paz do deus deixavam a Cidade Velha de Mênfis — 11 banhos por dia, nenhuma taverna, nenhum teatro — com 2,88 de «noite» por célula e o perfil «boêmio» (liga a 0,3), e a crônica dizia «a noite pegou». O conserto: D-228. |
| T-919 | limite de teste (fechado, F) | **O passeio com a regra do tempo.** O `G.City.leisureTask` só manda aos banhos quem tem tempo para o banho antes de fechar (`G.Termas.inTime`: a caminhada, os cabides e meio banho) — a porta `Te.visit` fica como era, para as provas que mandam banhistas pela mão. `qa/praca.js` t. |
| T-921 | limite (aberto; a decisão é do líder) | **O dia deste mundo acaba antes de escurecer.** A energia de um adulto acordado cai 1,25 por centésimo do dia: de 100 ao acordar (0,03) aos 22 que mandam para a cama são 62 centésimos — às 0,65 —, e o relógio de cada um (`G.Lar.clock`, D-071) diz 0,74 a 0,81. Na metrópole, às 0,70, 253 de 388 adultos têm menos de 20 de energia e 176 dormem ou vão dormir (136 pela energia, 1 pelo relógio). A praça, a taverna, a ceia e a família à porta disputam os mesmos dez centésimos do dia. Proposta, não feita: quem descansa (à mesa, à porta, na praça) cansar menos do que quem trabalha. |
| T-922 | limite (aberto) | **Os lugares marcados da praça só o corpo do deus usa.** Os bancos e os pares de «conversar» da planta da praça são do repartidor de lugares (`In.places`, regra 29), que dá lugar a quem está *dentro* de um prédio; a praça é chão aberto. Quem para na praça fica num ponto seu em volta do meio dela, fora da fonte (`Pr.spot`, pelo `G.hash`) — sem saber dos bancos nem do que a forma de um povo põe noutro lugar (os rostros). Uma porta do `interiors.js` para os lugares de um chão aberto resolveria. |
| T-923 | limite de teste (dito) | **Dois cuidados da mão da prova `qa/praca.js`.** (a) A regra pedida de dentro do passo guarda o tempo do segundo: o `Pr.fair` (a chuva, o frio, a guerra, a festa) vale pelo segundo do mundo em que foi pedido, dentro do passo; a prova que muda a chuva com a mão e pergunta na mesma hora pergunta de fora do passo (`a1`). (b) O ajuntamento da primeira hora da capital leva o foguista a caminho da refeição (ainda não de posto: como qualquer um): o `f3b` tenta a refeição antes de abrir cidade a cidade e fica com a primeira cuja manhã não tem chamado; diz as que tentou. |
| L-913 | bug (consertado, F; achado pela regra S2 no salto da `qa/freguesia.js`) | **O cadafalso chamava da refeição quem morria de fome.** O carrasco (5) e o arauto (4,5) de uma execução eram escolhidos entre quem não tinha um afazer de 3 ou mais; a refeição da fome acima de 85 pesa 2,5. Graco, sacerdote de Roma, uma noite a apagar o fogo da cidade, com a fome no máximo e 9 de vida, a caminho de comer, foi chamado para arauto: «morre de fome com comida ao alcance … tarefa justice». O conserto (`js/justice.js`, `starving`): quem tem a fome acima de 85 não é carrasco nem arauto — nem quem governa, como arauto. `qa/fome.js` h21; a sabotagem j1. |
| T-924 | limite de teste (consertado nas provas; nenhum caso afrouxado) | **Quatro casos de provas vizinhas que passavam ou falhavam pelos dados.** (a) O `tempo-livre` t2 olhava entre dois passos. O descanso junto à fogueira marca a chegada num passo (`t.st = 2`) e o gesto (`v.act = 'sit'`) no seguinte; o caso devolvia a tarefa no passo da chegada e conferia o gesto — passava ou falhava pelo passo em que a pessoa chegava (na base: «sentado a 1,2 dela», passa; neste ramo, outra história: «sentado a 1,3 dela», falha, com o texto «Descansando junto à fogueira»). A prova vive um passo mais antes de olhar. *(Uma linha no `rest()` do `qa/tempo-livre.js`.)* (b) O `lazer` l6 (a saída da tarde por conta própria) só tirava a chuva no começo da tarde: nos dados deste ramo choveu às 0,555, as portas abrem às 0,56, e 49 de Tenochtitlan abrigaram-se a caminho; a prova guarda o tempo da tarde durante a peça (`dry()`), e o caso tem 21 que vieram e viram. (c) O `lazer` l11 lia «o livro ainda tem o leitor» quando a leitora, livre depois do load e à porta, escolhia o rolo de novo pela vontade do dia (D-200); julga agora o lugar pela hora dele, como o l10. (d) O `lazer` l12 tomava a primeira atriz a caminho: nos dados deste ramo, uma com 38 de energia às 0,40, que foi dormir antes da peça; a mão da prova descansa-a ao pô-la à porta. |
| T-929 | limite de teste (consertado na prova) | **O `termas-mao` pedia o ofício do foguista com as portas já abertas.** A vila de mentira dava os passos do foguista pela mão (`E.jobTask` às 0,26: buscar a lenha, depois alimentar a fornalha). Com o posto (D-227) o dia dos banhos chama-o às 0,19 — e a mão da prova, ao pedir o ofício por cima, tirava-lhe a carga de lenha das mãos (o `workTask` do jogo vê a carga antes do ofício; a prova não): quatro casos falhavam («lenha junto à fornalha 0», a água fria). A prova agora deixa o dia chamá-lo: às 0,17 sem afazer, às 0,20 chamado («lenhaTermas», três achas junto à fornalha, à espera da hora), às 0,26 as portas abrem frias e em dez segundos o fogo tem duas achas. *(O começo do primeiro bloco do `qa/termas-mao.js`; o D1 do `qa/termas-grandes.js`, do mesmo jeito: às 0,10 fechado, às 0,20 chamado, às 0,26 as portas abrem.)* |
| T-925 | limite de teste (dito) | **As células dos bairros mudam de dono no salto.** Em doze dias a célula dos banhos de Mênfis passou de um bairro a outro (a Cidade Velha, o Mercado Velho, o Bairro dos Escribas, conforme a história), e a taverna com ela; o `q2` prova pela origem das notas (nenhuma nota de «noite» vem dos banhos) e pelo perfil que há ou está a caminho (`q.tp`), não pelas casas que o bairro tem no fim. |
| T-926 | limite (aberto, do repartidor: X) | **Banhos sem foguista.** Na mega pronta, os banhos de Hedeby (26 a 35 pessoas) não têm foguista em cinco dias de cinco, e os de Delfos no dia em que abrem: a procura (`E.demand`: um foguista com 8 adultos e a comida garantida) e o teto dos ofícios não o dão. Sem foguista a água é fria e ninguém busca lenha. |
| T-927 | limite (aberto) | **O foguista já num chamado quando as portas vão abrir.** Quem está numa festa (3,2) ou num julgamento quando o posto começa fica nele até o fim — o posto só é perna de quem está no afazer da fornalha, para a regra das mãos ocupadas (`QA.maos`, D-094) continuar limpa —, e nesse dia a água esquenta tarde: 1 dia em 12 na prova (Tebas, às 0,49). |
| T-928 | limite de teste (dito) | **Duas sabotagens que a prova não acusa** (de 37): a linha do `life.js` (a água de casa não leva o foguista de posto) e a guarda do `callStoker` (o dia dos banhos não o chama de volta da refeição). O chamado ao posto dá ao foguista um afazer de 1,05 no segundo em que o posto começa, e a escolha da água já pula quem tem um afazer de 1,05 e quem está dentro de um prédio; e a refeição de quem tem fome de morrer pesa mais que 1,05. As duas ficam como cinto e suspensório; a regra 80 do guard cobra a primeira pelo código. |
| D-225 | decisão (F) | **A praça ao fim da tarde é uma vontade de cada um** (`js/act-lazer.js`, `G.Praca`; a tarefa `'praca'`). Quem (`wish`): todo crescido com casa em 0,60 dos dias; mais o velho, o moço, o sociável, o mercador junto do mercado; menos quem mora longe. Quando: de uma hora sua (`hourOf`: 0,53 a 0,60; os velhos 0,50 a 0,56) ao escurecer; não na chuva, no frio forte, com a guerra à porta, no pânico, numa festa (`fair`). Quanto: a sorte do dia (`lot`, o `G.hash` da pessoa e do dia). O que impede: a fome, o cansaço, a doença, o medo, a carga, a perna de uma operação, os pequenos, o bebê no colo, o luto, o posto, a praça cheia, a distância; nunca o corpo do deus. Onde: a praça mais perto de casa, ou a porta do mercado enquanto vende. Na escolha do dia: antes do fim do dia de trabalho, a opção `'praca'` (0,6: acima do trabalho comum) **larga o afazer comum** — o machado, a enxada, a rede, o calçamento, o treino, a obra comum; nunca a carga, a operação, o posto, a pedra, a obra grande —, e por um instante depois dele só quem ficou no meio de um; com o dia acabado, a praça é a caminho de casa (a ceia e a horta primeiro; a taverna e o teatro escolhidos antes, como sempre). A conversa atravessa um save. Medido: de 0,0 a 2,0 parados na praça por hora para 0,7 a 3,8 na metrópole e 2 a 5 na mega; 24 paradas por dia no mundo. |
| D-226 | decisão (F) | **As crianças brincam na praça à tarde.** As de sete anos ou mais que moram a 8 casas de uma praça brincam nela, e não à porta de casa, em seis tardes de dez (`G.Praca.playAt`: a sorte do dia pelo `G.hash`; das 0,50 ao escurecer, com tempo bom). O jogo é o delas (`villagers.js`, `'play'`); a praça só diz onde. Sem custo de trabalho. Medido: 0,1 a 1,5 crianças na praça à tarde para 1,6 a 3,7 nas cidades grandes da metrópole. |
| D-227 | decisão (F: o posto de um serviço aberto) | **O posto do foguista segura.** (1) O posto é a perna da operação dele (`A.hooks.leg`, como o palco do ator, D-094): no afazer da fornalha, com o fogo sem dar até fechar, nenhum chamado de fora abaixo de 3 o leva. (2) De posto desde antes de abrir (`Te.onDuty`: 0,05 do dia mais a caminhada, até 0,13). (3) O dia dos banhos chama-o ao posto (`callStoker`): larga o afazer que não pesa mais e vai à fornalha — nunca da cama, de uma refeição, de um chamado de mais peso, com carga, nem sendo o corpo do deus. (4) A água de casa vai com outro da casa (`life.js`). (5) A refeição é antes de abrir (`Te.mealFirst`); de posto só sai para comer com mais de 85 de fome. Os outros serviços: a D-102 guarda a vaga, não o posto; o taverneiro abre fora das horas da água; o ator já tinha a perna. |
| D-228 | decisão (F, na D-202: a chave própria) | **O banho tem a sua chave na vida do bairro: «banho», e o perfil «de banhos».** Não um peso na «noite»: para os banhos sozinhos nunca fazerem um bairro boêmio o peso teria de ser menor que um décimo, e as termas grandes passariam de novo. `U.KEYS` ganha `'banho'`, `U.TAGS` ganha `termal` (liga a 0,3, desliga a 0,15: as marcas do «boêmio»), com o texto dele; o texto do «boêmio» perde a palavra «banho». O som acompanha (a família «banho» no `audio-src.js`) e o corpo vê «gente indo e vindo dos banhos» (`possess.js`). Depois de doze dias: a Cidade Velha de Mênfis é «de oficinas, de banhos»; a Feira de Tebas, com a taverna, «boêmio, de banhos». |
| D-229 | decisão (F) | **A praça cheia não conta em chave nenhuma da vida do bairro.** A conversa da praça não é troca (não há venda) nem «noite» (seria o erro da D-202); uma chave própria daria um perfil «de praça cheia» a todo centro de cidade — diria «centro» de outro jeito. Fica sem chave; se o dono quiser, o caminho é o da chave «banho». |

### `qa/README.md` — as linhas

- `qa/praca.js` — a praça ao fim da tarde, o foguista no posto e o bairro dos banhos (D-225 a D-228), em Node:
  `node qa/praca.js [metropole|mega]`, `ONLY=a,b,f3,q2,e,t,h`, `DIAS=n`; a prova inteira ≈ 9 min (a parte `a` e a `h` em
  20 s). Cobre `js/act-lazer.js` (a praça), `js/act-servicos.js` (o posto do foguista, a chave «banho»), as vontades do
  `decide` do `js/villagers.js`, a linha da água do `js/life.js`, a chave e o perfil do `js/urban.js`.
- `qa/praca-inv.js` — as regras do verificador da praça (o sistema «praca»), a juntar pelo `junta-inv.js`.

### `qa/regress.sh`

Na fase «cidade» (ou «vida»), depois da `freguesia`: `node qa/praca.js` (≈ 9 min) e `node qa/praca.js mega`.

### `qa/guard.js` — as regras 79 e 80

```js
// 79. "a conversa da praça é do act-lazer.js, e a vontade dela não sorteia" (D-225, D-226): a tarefa 'praca' só o
// js/act-lazer.js dá (a escolha de cada um — G.Praca.go, só do start do js/villagers.js — e o gancho do save dele); e no
// js/act-lazer.js, do bloco «the plaza at the end of the afternoon» até o Pr.taskText, nenhuma chamada ao acaso do mundo nem
// ao do que só se vê: a sorte do dia, a hora e o lugar de cada um são o G.hash da pessoa e do dia
for (const f of files) src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (f !== 'act-lazer.js' && /type:\s*'praca'/.test(c)) fails.push(`praca: ${f}:${k + 1} dá a conversa da praça fora de act-lazer.js (D-225): ${l.trim().slice(0, 110)}`);
  if (f !== 'villagers.js' && /\bPraca\.go\s*\(/.test(c)) fails.push(`praca: ${f}:${k + 1} manda alguém à praça fora da escolha de cada um (o start de villagers.js — D-225): ${l.trim().slice(0, 110)}`); });
{ const f = 'act-lazer.js'; const L = src[f] || []; const i0 = L.findIndex(l => l.includes('the plaza at the end of the afternoon (D-225)')), i1 = L.findIndex(l => l.includes('Pr.taskText = function'));
  if (i0 < 0 || i1 < i0) fails.push(`praca: ${f} — não achei o bloco da vontade da praça: a regra 79 não tem o que conferir`);
  else for (let k = i0; k < i1; k++) { const c = L[k].replace(/(^|\s)\/\/\s.*$/, ''); if (/\bG\.(R|rr|ri|pick|chance|shuffle|VR|vrr|vri|vpick|vchance|vshuffle)\(/.test(c)) fails.push(`praca: ${f}:${k + 1} sorteia dentro da vontade da praça (a sorte do dia é o G.hash da pessoa e do dia — D-225): ${L[k].trim().slice(0, 110)}`); } }
// 80. "o banho tem a sua chave, e o posto do foguista segura" (D-227, D-228): a chave «banho» da vida do bairro só o
// js/act-servicos.js nota (a entrada nos banhos, onde ela se fecha), e ele não nota «noite» — o banho de dia não é noite; a
// água da casa pergunta ao posto antes de levar alguém (js/life.js: G.Termas.onDuty), e o posto é a perna da operação do
// foguista (A.hooks.leg, no js/act-servicos.js)
for (const f of files) src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (f !== 'act-servicos.js' && /Urban\.note(B)?\s*\([^)]*'banho'/.test(c)) fails.push(`banho: ${f}:${k + 1} nota a chave «banho» fora de act-servicos.js (D-228): ${l.trim().slice(0, 110)}`);
  if (f === 'act-servicos.js' && /Urban\.note(B)?\s*\([^)]*'noite'/.test(c)) fails.push(`banho: ${f}:${k + 1} conta o banho como «noite» (a chave dele é «banho» — D-228): ${l.trim().slice(0, 110)}`); });
if (!(src['life.js'] || []).some(l => /Termas\.onDuty\(v\)\)\s*continue;/.test(l))) fails.push('posto: life.js — a escolha de quem busca a água da casa não pergunta ao posto do foguista (G.Termas.onDuty — D-227)');
if (!(src['act-servicos.js'] || []).some(l => /A\.hooks\.leg\.push\(/.test(l) && /Te\.onDuty\(v\)/.test(l))) fails.push('posto: act-servicos.js — o posto do foguista não é perna da operação dele (A.hooks.leg — D-227)');
```

### `CLAUDE.md` — as frases

- No protocolo, ponto 3 (depois da linha das termas): «Mexeu na praça (`G.Praca` no `act-lazer.js`, a linha dela no
  `decide`, o `'play'` das crianças), no posto do foguista (`Te.onDuty`, `callStoker`, a linha da água do `life.js`) ou
  na chave «banho» da vida do bairro? Também `node qa/praca.js` (as partes `a` e `h` em 20 s: `ONLY=a,h`).»
- Em «A cidade — `G.Urban`», na lista das chaves: acrescentar `banho`; na dos perfis: «de banhos».
- Em «Os ofícios e os serviços», depois da frase da freguesia: «**A praça ao fim da tarde é uma vontade** (D-225, D-226):
  quem para na praça das suas ruas vai pela escolha do dia (`decide`: `'praca'` antes do fim do dia de trabalho — larga o
  afazer comum do dia, nunca a carga, a operação, o posto, a pedra, a obra grande —, e a caminho de casa no `'home'`),
  com a causa do molde (`G.Praca.wish`, `lot`, `hourOf`, `fair`, `pick`); a tarefa `'praca'` só o `act-lazer.js` dá
  (regra 79); as crianças das ruas da praça brincam nela à tarde (`G.Praca.playAt`). **O posto de um serviço aberto
  segura** (D-227): o foguista de posto (`G.Termas.onDuty`: desde antes de as portas abrirem até o fogo dar até fechar)
  é chamado à fornalha pelo dia dos banhos, tem as mãos ocupadas para todo chamado de fora enquanto está nela
  (`A.hooks.leg`), não vai buscar a água de casa (`life.js`) e come antes de abrir (`G.Termas.mealFirst`). **O banho tem
  a sua chave na vida do bairro** («banho», o perfil «de banhos»: D-228; regra 80) — nunca «noite». `qa/praca.js` prova.»

### `qa/patch3/PLANO.md`

A segunda rodada do F: feita (itens 1, 2 e 3; do item 4, só o T-919). Abertos: T-921 (o dia do mundo acaba antes de
escurecer — é o que limita a praça), T-922, T-926 (do X), T-927, as crianças nos banhos com um dos pais.
