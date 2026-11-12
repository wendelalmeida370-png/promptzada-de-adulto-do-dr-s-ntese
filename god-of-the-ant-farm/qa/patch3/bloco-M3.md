# Bloco M3 — a terra guardada cedo, o fogo nos monumentos, a última pedra, as minas e a pedra (Bairros Vivos, o agente M, 3ª rodada)

Ramo: `worktree-agent-a8f5af9594fd9a4f1`. A base desta rodada: `1321040` (o merge do ramo do líder, `claude/god-ant-farm-game-v7t3xm`,
sobre o fim da 2ª rodada, `b54057e`; sem conflito). Números reservados: L-785 a L-799, T-774 a T-779, D-218, D-219 e D-230 a
D-234; regras 81 e 82 do guard. A tarefa: `scratchpad/ag/M/tarefa3.md`. **Este arquivo é mantido em dia a cada passo.**

Os roteiros de medida estão em `scratchpad/ag/M/` (a pasta inteira é
`/tmp/claude-0/-home-user-promptzada-de-adulto-do-dr-s-ntese/9e17ed97-a1b5-5d1c-a5da-c23519ea4f04/scratchpad/ag/M/`); os desta rodada:
`regua.js` (a régua da T-772: um mundo do zero pelo salto, ano a ano, e aos 60 e aos 90 anos a gente, os mortos de fome e de
guerra, as cidades, os degraus grandes fundados, acabados, de pé — por povo que os ergueu —, os anos-de-povo sem renda de pedra,
as cidades novas e a que distância nascem de uma capital que guarda campo; `ABRE=<save>` abre um save em vez de fazer um mundo,
`SET=K=V` muda uma constante), `ultima.js` (a última pedra: cada obra grande em curso, ano a ano, e para onde foi a pedra do
povo, pelo livro), `pedra211.js` (por que a renda de pedra de um povo é zero: a rocha ao alcance, as mãos por ofício, as minas,
o alvo e o estoque, o livro da pedra), `sab-M3.py` (as sabotagens), `fila3.sh` (a fila, um `node` de cada vez). As saídas:
`r3a/` (as réguas de antes — o código do `b2b61f0` —, a reprodução da última pedra, os casos do líder) e `r3b/` (as provas e as
réguas de depois).

## 0. O estado de cada parte

| parte | estado | commit |
|---|---|---|
| a árvore em dia (o merge) e as provas da 2ª rodada na árvore juntada | FEITO (passam) | `1321040` |
| 1. a terra guardada cedo (parte da D-160): o campo cívico (D-230), o anel de vinte para os degraus de 8 e 10 (D-231), as cidades novas longe do campo (D-232) | FEITO (seção 1) | `64594d7` |
| 2. o fogo nos monumentos (T-771, D-219): a pedra fica de pé, o motim não derruba sozinho, a obra em curso guarda a pedra, o salão de madeira do norte | FEITO (seção 2) | `64594d7` |
| 3. a última pedra (L-786, D-233): reproduzida, a causa medida, a regra e a prova (`canteiro` c11) | FEITO (seção 3) | (a seguir) |
| a semente 211 (a pergunta do líder): a causa medida — as minas levam todos os pedreiros (L-785) —, o ajuste, a prova (`pedreiros.js`) | FEITO (seção 4) | (a seguir) |
| 4. T-772: a régua em dez sementes, antes e depois | EM CURSO (seção 5) | — |
| T-773: a ordem do campo guardado tem caso (`terra-guardada` f8) | FEITO | (a seguir) |
| as sabotagens (`sab-M3.py`: 35) | A RODAR (seção 6) | — |
| T-768 (o povo sem a roda) | NÃO FEITO (pede corpo e desenho; seção 9) | — |

## 1. A terra guardada cedo (parte da D-160)

**O que entrou.**

- **O campo cívico (D-230).** A capital que é cidade (nível ≥ `V.RES_TIER`, 3) guarda, além do campo da maravilha, **um campo de
  6 casas** (`V.CIVIC_N`) para o primeiro degrau de 24 m que ainda não tem — o teatro, o palácio ou o templo (`V.CIVIC`,
  `V.civWork(set)`: os três de 24 m que faltam e que o povo sabe erguer) —, procurado até onde essas obras procuram (o raio e
  doze, `V.CIVIC_REACH`), pelas mesmas portas do campo da maravilha (`resLot`, `resFits`, `V.reservaDia`). Fica em `set.urb.civ`
  (no save, com a cidade). Os campos da própria cidade podem ficar em cima dele (descem quando a obra chega). Qualquer dos três
  de 6 casas é fundado nele (`resSite`), e a cidade guarda outro, a partir do dia seguinte, para o próximo que lhe falta. Larga o
  campo: fundada a obra («fundada»), um prédio posto em cima («ocupada»), a cidade que deixou de ser cidade por `V.RES_YEARS`
  («nivel»), que deixou de ser capital («capital»), que já tem os três («feito»), a terra que não serve mais («terra»). A
  crônica diz («… guardou um campo de 24 metros a N casas do centro para as suas grandes obras: ali não se ergue nada»), e o
  deus vê o campo (`render.js`: `V.reservas(s)`, «Reservado para as grandes obras da cidade»).
- **Procurar mais longe para os degraus de 8 e 10 casas (D-231).** `V.reachOf(set, type, n)`: o degrau de 8 casas ou mais de uma
  obra que fica dentro da cidade (o grande palácio, o colossal, a maravilha de quem a ergue dentro) procura, sem lote aos 6 e
  aos 12, até o anel de vinte — como as que ficam fora. A carroça traz o que a obra espera: a distância já não a segura (D-215).
- **As cidades novas longe de uma capital com campo guardado (D-232).** `V.keptNear(x, y)`: a cidade que guarda um campo (o da
  maravilha ou o cívico) a menos de `V.RES_CLEAR` (20 casas) do ponto, ou nada. Perguntam os quatro que escolhem o sítio de uma
  cidade nova: por terra (`village.js`, a expansão — que já pedia 15 casas de toda cidade), por mar (`naval.js`, `Nv.colonize`),
  a colônia da expedição (`expeditions.js`, `siteFor`) e a vila dos libertos (`war.js`, `Wr.freeSite`). Não perguntam: o
  povoado dos náufragos (nasce onde o mar os deixou) e o primeiro desembarque num mundo vazio.

**A medida de antes desta rodada** (bloco M2, seção 6; `terra.js`): nos mundos prontos, 29 de 64 pares capital × tipo com lote;
do zero, 3 de 9 capitais sem lote nenhum aos 60 anos e 9 de 10 aos 100.

**O que a prova mediu nos mundos prontos** (`terra-guardada` f1, f7): das 14 capitais de nível 3 a que falta um dos três de
24 m, **10 guardam um campo cívico** e 4 não acham terra (nenhuma já tem os três) — por exemplo a megalópole: Mênfis a 15 casas
do meio, Roma a 22, Argos a 19 (um lote por aplainar, 9,1 m de relevo); a metrópole: Tenochtitlan a 34. Com o anel de vinte,
**12 buscas de degraus de 8 casas ou mais que não achavam lote passam a achar** (13 já achavam até o raio e doze) — o grande
palácio de Tenochtitlan a 47 casas do meio, o de Hedeby a 35, a maravilha e o colossal de Argos a 37.

**A medida de depois** (`terra.js`, nos mundos prontos e do zero aos 60 e aos 100 anos): (a medir — seção 5).

**As cidades novas** (o número 20 e a colonização): (a medir — seção 5).

## 2. O fogo nos monumentos (T-771, D-219)

**A regra.** `V.bigStep(b)`: o degrau maior de obra pública (não o monumento, que nunca foi do fogo). `V.stoneWork(b)`: o que o
fogo não leva ao chão sozinho — todo degrau maior em obra, e, dos prontos, os de pedra.

- **Pronto, de pedra** (romano, grego, egípcio, asteca, clássico): o fogo fere — o telhado, o que há dentro: a resistência cai
  até a parte da conta que não é madeira (`V.fireFloor`: 77% de um teatro de 24 m, dois terços de um palácio, quatro quintos de
  uma maravilha) e `b.burnHp` guarda o que o fogo levou — e não derruba. Com a madeira queimada ele não alimenta mais o fogo
  (`V.fireFuel` → nada: o `nature.js` pergunta), e enquanto queima a chama é baixa e passa devagar (`Nat.STONE_SPREAD`, um quarto
  do que passa por uma casa: aceso num canto, 1 das 36 casas dele em chamas meio minuto depois, contra 36 queimando como casa).
  A crônica diz («O fogo consumiu o telhado e o que havia dentro do …: a pedra ficou de pé»).
- **O motim** (o caso do líder: Mênfis da semente 103): as tochas são fogo (`Nat.ignite`) e as pedras são dano de causa «riot»;
  os dois ferem o palácio de pedra até o mesmo chão e não o derrubam. O motim de verdade da prova (36 pessoas contra o grande
  palácio de Roma da megalópole) acaba com «O palácio ardeu» e o palácio de pé com 509 de 700.
- **Em obra** (todo povo): o fogo queima como em qualquer obra até levar a madeira — a do canteiro sai pelo livro («fogo») e a
  obra volta a esperá-la, o progresso volta ao que a pedra assentada permite —, e a obra fica, com a pedra e o tijolo. Não
  alimenta mais o fogo até ter madeira de novo. Acabada depois, está inteira (a madeira foi trazida de novo, pelo livro).
- **O salão de madeira do povo do norte** (`V.TIMBER`; o ajuste do líder, caso (b)): pronto, queima até o chão **como uma casa**
  e o fogo passa por ele como por uma casa — nunca mais depressa (a resistência pelo lote, L-784, já o faz durar: 1280 contra
  320). Em obra, guarda a pedra como toda obra grande. **A decisão (b) ou (c)** — dar aos de madeira prontos a proteção dos de
  pedra se, com (b), o povo nórdico chega aos 90 anos sem nenhum degrau grande de pé —: (a decidir pela régua — seção 5).
- **O deus e a guerra derrubam como antes**: o raio (32 golpes), o meteoro (1), o cerco (46 pedras), o terremoto (10).
- A casa, a cabana, os prédios do degrau clássico: como antes (a cidade continua a queimar).

**Os casos do líder, vividos com este código** (`regua.js` com `ABRE=`; os mundos seguem outro caminho a partir do save, as
tarefas não vão nele): a semente 103 do ano 81 ao 91 — o palácio de 24 m de Mênfis (#13146) pegou fogo e **está de pé aos 91
anos com 1498 de 1680** («o fogo levou 182»), o templo de 24 m em obra ao lado; a semente 41 do ano 81 ao 91 — o incêndio de
Hedeby não se repetiu neste caminho: o Templo de Madeira (#9327) de pé, o Grande Salão do Rei a 88%, igual com (b) e com (c).

**Aberto** (seção 9): ninguém conserta um prédio ferido — o monumento chamuscado fica no que o fogo deixou até ser ampliado
(T-774); a fuligem do 3D só aparece abaixo de 60% da resistência, e o fogo deixa 66% a 80% (T-775).

## 3. A última pedra (L-786, D-233)

**Reproduzido** (`ultima.js`, a semente 41 com o código da 2ª rodada, `b54057e`, a mesma régua ano a ano; a saída em
`r3a/ultima-s41-r2.txt`). O palácio de 24 m de Tenochtitlan, a 20 casas do armazém:

| ano | o palácio | o povo asteca (pessoas) | a pedra do povo: entrou → saiu | o que chegou ao palácio |
|---|---|---|---|---|
| 59 | 85%, espera 48 | 74 | (até aqui: 825 entregues; 132 foram direto da pedreira à obra) | — |
| 60 | 90%, espera 32 | 77 | 4 → 21 («obra») | 16 |
| 61 | 98%, espera 5 | 78 | 23 → 23 | 27 |
| 62 | 100%, **espera 1** | 33 (o povo rachou) | 0 → 0 | 4 |
| 63, 64 | espera 1 | 33, 36 | 0 → 0 | **0** |
| 65 | espera 1 | 36 | 4 → 5 | **0** |
| 66 | espera 1 | 34 | 8 → 9 | **0** |
| 67 | espera 1 | 32 | 4 → 8 | **0** |

**A causa não é o chão da carroça** (o que eu tinha dito sem medir, na 2ª rodada): o armazém do povo esteve em 0 ou 1 de pedra
o tempo todo — a carroça não teria o que levar com chão ou sem. A pedra que chegava (4, 8, 4 por ano) **saía toda para as
outras obras do povo** («obra»: as casas e as oficinas das outras cidades, junto dos armazéns delas), levada nas mãos em
segundos, antes que o único construtor da cidade do palácio (16 pessoas, o nível 3 caído a 1) andasse as suas vinte casas. A
D-174 guarda a pedra da obra grande do que nunca acaba (calçar, as carroças do comércio, melhorar casa de pé, começar um
extra); as obras já em curso seguem — e com a pedra chegando aos poucos são elas que ficam com tudo.

**A regra (D-233).** O que a obra grande com a vez ainda espera de pedra, **quando é uma carga de carroça ou menos** (`V.LAST`,
20), é dela no armazém do povo: `V.lastStone(set)` (o que ela espera, menos o que os construtores e as carroças dela já trazem;
zero acima de uma carga, zero sem a vez — nada guardado, lido do mundo a cada vez) e `V.stoneFor(b)` (a pedra do povo que se
pode levar para a obra `b`: toda a livre para a obra grande com a vez; para qualquer outra, o que passa das últimas pedras que
as obras grandes do povo guardam). Os construtores perguntam (`villagers.js`, `freeFor`, nos três lugares em que o construtor
olha o armazém), e **a última carga da carroça não tem chão** (`city.js`: o `Ci.WORK_FLOOR` de 20 só vale acima de uma carga).
Acima de uma carga nada muda: as casas que a cidade precisa continuam (D-174).

**A prova** (`canteiro` c11, na megalópole): as portas (à espera de 140: nada guardado, a casa leva os 12 do armazém; à espera
de 5 com 12 no armazém: a casa pode levar 7 e a obra 12; com 5: 0 e 5; com 3: 0 e 3); a carroça leva 5 de um armazém com 5 (o
chão é 20) e, com a carga na estrada, nada mais fica guardado; **vivido, o povo sem a roda** (Roma e uma cidade-irmã com três
casas em obra, a pedra do povo chegando uma a uma, nunca mais de 5 no armazém): com a regra a obra recebe as suas 5 em 68 s e
nenhuma outra obra deixa o armazém abaixo do que é dela (0 quebras), com o save no meio; **sem a regra (o controle da própria
prova): 426 s, e 31 vezes outra obra levou a pedra que era dela** (87 de pedra para as outras antes de a obra ter as suas 5); a
obra que perde a vez ou é derrubada pelo deus não guarda nada.

## 4. A semente 211: por que a renda de pedra é zero (L-785)

**A pergunta do líder**: a pedra só é tirada havendo obra que a peça? Se for, o `V.affords` (a menor entre o último ano e a
média, D-216) não deixa nascer o pedido que a faria ser tirada.

**O que a medida mostra: não é isso.** No save do líder do ano 81 (`pedra211.js`), o povo de Argos — 146 pessoas, 7 cidades —
tem **pedido de sobra e ninguém para tirar**:

- a pedra do armazém em 1, o alvo em 491 (quinze obras à espera de pedra: estátuas, torres, a forja, mercados, casas); a renda,
  6 a 9 por ano; a madeira em 25, o alvo em 239;
- **rocha há**: de 8 a 37 rochas a menos de 26 casas de cada cidade, e chão de pedreira em todas;
- **os braços**: os seis «mineiros» do povo (3 em Argos, 1 em Óstia, 1 em Delfos, 1 em Alba Longa) **estavam todos com posto
  numa mina, no minério**. O planejador (`assignJobs`) pede os pedreiros pela falta de pedra e **soma** a eles a turma das
  minas (tirada dos lenhadores e dos coletores); e o `economy.js` (`E.place`: «idle miners take up the free places in the
  mines») punha na mina **todo** «mineiro» sem posto enquanto houvesse lugar — quatro por mina, mais lugares do que mineiros.
  Os pedreiros que o planejador queria na pedra desciam à mina com a turma. (Na 2ª rodada isto já tinha aparecido em Mênfis —
  «os 8 mineiros cavavam minério, todos» — e eu contornei com a turma de construtores da obra grande; a causa ficou.)
- as mãos livres são poucas: em Argos, de 23 crescidos, 4 para a lenha, a coleta e a pedra (os ofícios levam o resto) — isto
  é do repartidor (o agente X), não mexi.

Portanto o `V.affords` está certo em não pagar o teatro de Argos (4 + 15 × min(0, 21) = 4): a média de 21 era história; a renda
de verdade era 6 por ano, e o teatro de 200 de pedra levaria trinta anos. **O `V.affords` ficou como estava.**

**O ajuste (L-785).** As minas levam só a turma que o planejador lhes deu: `set.minaN` (o `m` do `assignJobs`: duas linhas
ali), e o `E.place` não põe na mina mais que isso e tira de lá quem passa disso; os outros «mineiros» são da pedra. Uma cidade
ainda não planejada (um save de antes, ao abrir) fica como estava até a primeira repartição. Interruptor para medir:
`G.Eco.CREW_CAP`.

**A medida.** O mesmo save do ano 81, os três anos seguintes, a pedra entregue ao armazém do povo de Argos:

| | ano 82 | ano 83 | ano 84 |
|---|---|---|---|
| antes (todos na mina) | 9 | — | — (6 a 9 por ano nos anos de antes) |
| depois (a turma só) | **81** | **37** | **56** |

E a semente 211 do zero, aos 90 anos: na árvore juntada, 204 pessoas e nenhuma obra grande; com este código, 336 pessoas, 3
degraus grandes fundados, 2 acabados e de pé (o palácio de 24 m de Mênfis em 22 anos, o templo de 16 m de Argos em 7) e o
teatro de 24 m de Argos em obra. A régua das dez sementes (seção 5) diz o que isto faz à gente e à guerra.

**A prova** (`qa/pedreiros.js`, `qa/pedreiros-inv.js`): (os números — seção 6).

**O que fica do repartidor, para o agente X** (medido, não mexido): as mãos livres para a lenha, a coleta e a pedra são 3 ou 4
numa capital de 23 crescidos; a madeira do mesmo povo está em 25 de um alvo de 239.

## 5. As medidas

(a preencher: a régua em dez sementes, antes e depois; a terra depois; as cidades novas.)

## 6. As provas e as sabotagens

(a preencher.)

## 7. Pronto para colar

### 7.1 `qa/AUDIT.md`

| id | tipo | texto |
|---|---|---|
| D-230 | decisão (parte da D-160) | **O campo cívico.** A capital que é cidade guarda, além do campo da maravilha (D-121), um campo de 6 casas para o primeiro degrau de 24 m que lhe falta — o teatro, o palácio ou o templo (`V.CIVIC`, `V.civWork`) —, procurado até o raio e doze, pelas mesmas portas (`resLot`, `resFits`, `V.reservaDia`; `set.urb.civ`, no save). Os campos da própria cidade podem ficar em cima; qualquer dos três de 6 casas é fundado nele (`resSite`) e a cidade guarda outro no dia seguinte. Larga-o fundada a obra, ocupado, sem o nível por `V.RES_YEARS`, sem ser capital, com os três de pé, ou com a terra que não serve mais. O deus o vê (`V.reservas`). Medido: aos 100 anos a terra em volta de uma capital acabou (2 de 46 pares capital × degrau com lote, bloco M2); das 14 capitais de nível 3 dos mundos prontos a que falta um dos três, 10 guardam o campo. `qa/terra-guardada.js` f1 a f5; a invariante em `qa/terra-guardada-inv.js`. |
| D-231 | decisão | **Os degraus de 8 e 10 casas procuram até o anel de vinte.** `V.reachOf(set, type, n)`: o degrau de 8 casas ou mais de uma obra de dentro da cidade (o grande palácio, o colossal, a maravilha de quem a ergue dentro) procura aos 6, aos 12 e aos 20 além do raio, como as de fora; a carroça da obra (D-215) cobre a distância. Nos mundos prontos, 12 buscas que não achavam lote passam a achar. `qa/terra-guardada.js` f7. |
| D-232 | decisão | **A cidade nova nasce longe de uma capital que guarda campo.** `V.keptNear(x, y)`: a cidade que guarda um campo (da maravilha ou cívico) a menos de `V.RES_CLEAR` (20 casas) do ponto. Perguntam os quatro que escolhem o sítio de uma cidade nova: a expansão por terra (`village.js`), a colônia por mar (`naval.js`), a da expedição (`expeditions.js`), a vila dos libertos (`war.js`). O povoado dos náufragos e o primeiro desembarque num mundo vazio não escolhem. `qa/terra-guardada.js` f6; a regra 81 do guard. |
| D-219 | decisão (fecha a T-771) | **O fogo fere o monumento de pedra e não o derruba.** O degrau maior de obra pública pronto (`V.bigStep`), de pedra (`V.stoneWork`), perde para o fogo a parte de madeira da conta (`V.fireFloor`; `b.burnHp` guarda o que o fogo levou), não alimenta mais o fogo depois (`V.fireFuel`, que o `nature.js` pergunta), e o fogo passa por ele a um quarto do que passa por uma casa (`Nat.STONE_SPREAD`). O motim (tochas e pedras, a causa «riot») fere até o mesmo chão. A obra grande em curso, de todo povo, perde a madeira — a do canteiro pelo livro («fogo»), o progresso de volta ao que a pedra permite — e fica; acabada, está inteira. O salão de madeira do povo do norte (`V.TIMBER`), pronto, queima como uma casa (o ajuste do líder; a decisão (b)/(c) na seção 2 do bloco M3). O raio, o meteoro, o terremoto e o cerco derrubam como antes; as casas e os degraus clássicos queimam como antes. Antes: todo prédio que pegava fogo ia ao chão se não chovesse — nas dez sementes da régua, todo degrau grande perdido foi para o fogo. `qa/fogo-pedra.js` p1 a p8. |
| L-787 | bug (desta rodada, achado antes da entrega) | **O monumento em fogo baixo era uma tocha de uma hora.** O dano do fogo num prédio é repartido pelo lote; no degrau de pedra, com a chama baixa e o fogo passando devagar, uma casa do teatro de 24 m em chamas levava 49 minutos para gastar a madeira — o povo chamado ao fogo todo esse tempo. Agora a madeira de um monumento se gasta em `Nat.STONE_SECS` (12) segundos por casa do lado com uma casa em chamas (dois minutos num de 24 m), mais depressa com mais; e a obra em curso perde a madeira quando o fogo levou a parte dela, não a resistência inteira. `qa/fogo-pedra.js` p2b. |
| D-233 | decisão | **As últimas pedras são da obra grande.** O que a obra grande com a vez ainda espera de pedra, quando é uma carga de carroça ou menos (`V.LAST`, 20), é dela no armazém do povo: `V.lastStone(set)`, `V.stoneFor(b)` — os construtores de qualquer outra obra não a levam (`villagers.js`, `freeFor`) e a última carga da carroça não tem chão (`city.js`). Acima de uma carga, as obras em curso seguem como antes (D-174). Nada guardado: lido do mundo. `qa/canteiro.js` c11. |
| L-786 | bug | **A última pedra.** O palácio de 24 m de Tenochtitlan da semente 41 ficou em 98% e em 100% do ano 61 para lá do 67 à espera de 5 e depois de 1 de pedra. A causa medida (`ultima.js`): o armazém do povo em 0 ou 1; a pedra que chegava (4, 8, 4 por ano) saía toda, nas mãos, para as outras obras do povo junto dos armazéns delas, antes que o construtor do palácio andasse as suas vinte casas — não o chão da carroça, que eu tinha suposto. A correção: a D-233. |
| L-785 | bug | **As minas levavam todos os pedreiros.** O planejador (`assignJobs`) pede os pedreiros pela falta de pedra e soma a eles a turma das minas; o `economy.js` (`E.place`) punha na mina todo «mineiro» sem posto enquanto houvesse lugar, quatro por mina. Na semente 211 da árvore juntada (ano 81), um povo de 146 pessoas com rocha em volta de todas as cidades e quinze obras à espera de pedra recebia 6 a 9 de pedra por ano, os seus seis «mineiros» todos no minério — e nenhuma obra grande em 90 anos. Agora as minas levam só a turma que o planejador lhes deu (`set.minaN`); os outros «mineiros» são da pedra. No mesmo save: 81, 37 e 56 de pedra por ano. `qa/pedreiros.js` q1 a q5; a invariante em `qa/pedreiros-inv.js`. |
| T-773 | limite de teste (fechado) | **A ordem do campo guardado tem caso.** `qa/terra-guardada.js` f8: pela varredura da própria prova (`V.resFits`), o campo é o lote plano mais perto, e um por aplainar só sem nenhum plano ao alcance; em 5 capitais dos mundos prontos há um lote por aplainar mais perto que o plano mais perto. A sabotagem a13 (`lev \|\| best`) é acusada. |
| T-772 | medida | **«Não custar a cidade» em dez sementes.** (os números: a seção 5 do bloco M3.) |
| T-774 | limite (aberto) | **Ninguém conserta um prédio ferido.** O monumento chamuscado fica no que o fogo deixou (66% a 80% da resistência) até ser ampliado ou até a obra em curso acabar; não há ofício nem conta de conserto no jogo, para prédio nenhum. |
| T-775 | limite (aberto) | **O monumento chamuscado não se vê.** A fuligem do 3D aparece abaixo de 60% da resistência, e o fogo deixa de 66% a 80%: `b.burnHp` está no prédio para o desenho ler (o `G.Atmos.wear`), não usei. |
| T-776 | limite de teste (aberto) | **A expansão por terra não tem caso vivido da D-232.** `checkExpansion` é interno e depende de dados (a gente, o sorteio): o `terra-guardada` f6 prova a porta e lê nos quatro arquivos que quem escolhe o sítio pergunta (a regra 81); a régua das dez sementes conta as cidades novas e a distância a que nascem de quem guarda campo. |

### 7.2 `qa/README.md`

- `qa/terra-guardada.js` — a terra guardada cedo (parte da D-160; D-230, D-231, D-232; T-773), em Node, nos mundos prontos: f1 o campo cívico das capitais, f2 as buscas do planejador não o tomam (e o poço do deus o desfaz), f3 o degrau de 24 m é fundado nele, f4 só a capital que é cidade, f5 o save, f6 as cidades novas longe (a porta e os quatro que perguntam), f7 os anéis de busca dos degraus de 8 e 10, f8 a ordem (o plano mais perto; por aplainar só sem plano). Um minuto. Mexeu em `resLot`, `resFits`, `resSite`, `V.reservaDia`, `V.reachOf`, `V.keptNear` ou em quem escolhe o sítio de uma cidade nova: rode-a.
- `qa/terra-guardada-inv.js` — as regras do verificador do campo cívico e da marca do fogo (`b.burnHp`).
- `qa/fogo-pedra.js` — o fogo nos monumentos (D-219, L-787), em Node, na metrópole e na megalópole: p1 o monumento pronto aceso de propósito, p2 o fogo passa devagar e apaga sozinho em minutos, p3 o save no meio, p4 a chuva, p5 o deus e a guerra derrubam, p6 a obra grande em curso (e acabada depois), p7 o motim (as portas dele e um motim de verdade, com o save no meio), p8 o salão de madeira do norte. Nove minutos (`ONLY=p1,p5` em dois). Mexeu no fogo (`nature.js` `Nat.fuel`, `updateFire`), no `V.damageBuilding`, no `riots.js` ou na resistência de um prédio: rode-a.
- `qa/pedreiros.js`, `qa/pedreiros-inv.js` — as minas e os pedreiros (L-785), na megalópole: q1 a turma do planejador, q2 a pedra em falta (e o controle), q3 o save, q4 o save de antes e a porta, q5 o minério continua a sair. Um minuto. Mexeu no `E.place` (`economy.js`) ou na conta dos «mineiros» do `assignJobs`: rode-a.
- `qa/canteiro.js` — ganhou o c11 (as últimas pedras, D-233) e o c7 mudou com a D-219 (o fogo leva a madeira da obra em curso e ela fica; o cerco a derruba e a carga volta).

### 7.3 `qa/regress.sh` (a fase «fundacao», junto das provas da obra grande)

```
node qa/terra-guardada.js
node qa/fogo-pedra.js
node qa/pedreiros.js
```
(o `qa/canteiro.js` já está lá.) E no `qa/junta-inv.js`: `qa/terra-guardada-inv.js` e `qa/pedreiros-inv.js`.

### 7.4 `qa/guard.js` — as regras 81 e 82

- **Regra 81 — quem escolhe o sítio de uma cidade nova pergunta ao `V.keptNear`** (D-232). Os arquivos de `js/` que chamam `addSettlement(` com um sítio escolhido — `village.js`, `naval.js`, `expeditions.js`, `war.js` — têm `keptNear(`; um arquivo novo que chame `addSettlement(` e não esteja na lista dos que não escolhem (`main.js`, `events.js`) é acusado. O padrão que a prova usa: `/keptNear\((x, y|tx, ty)\)/` em cada um dos quatro.
- **Regra 82 — as marcas da obra grande que só o `village.js` escreve, e as portas que os outros perguntam** (D-219, D-230, D-233, L-785): `\bu\.civ\s*=[^=]|urb\.civ\s*=[^=]` (o campo cívico: hoje duas linhas, as duas no `village.js` — `\.civ\s*=` sozinho pega o povo dos navios e das batalhas), `burnHp\s*[-+]?=[^=]` (a marca do fogo) e `minaN\s*=[^=]` (a turma das minas) só em `js/village.js` (conferido: nenhuma ocorrência fora dele); o `js/nature.js` pergunta o que um prédio dá ao fogo ao `fireFuel(`; em `js/villagers.js` o construtor olha o armazém pelo `freeFor(` (um só `G.Fac.free(b.set`, o da definição dela), e em `js/city.js` a carroça da obra pergunta a pedra ao `stoneFor(`.

### 7.5 `CLAUDE.md` (em «As fundações», junto da obra grande)

- **O campo cívico — `V.civWork` / `V.reservas` / `V.keptNear`** (`js/village.js`, D-230 a D-232): a capital que é cidade guarda, além do campo da maravilha, um campo de 6 casas para o primeiro degrau de 24 m que lhe falta (`set.urb.civ`, no save; só o `village.js` escreve — o `guard.js` cobra, regra 82); quem desenha os campos guardados pergunta ao `V.reservas(set)`. **Quem escolhe o sítio de uma cidade nova pergunta ao `V.keptNear(x, y)`** (regra 81): nenhuma cidade nasce a menos de `V.RES_CLEAR` casas de uma que guarda campo. Os degraus de 8 casas ou mais procuram até o anel de vinte (`V.reachOf(set, type, n)`). `qa/terra-guardada.js` prova.
- **O fogo e a obra grande — `V.stoneWork` / `V.fireFuel` / `V.fireFloor`** (`js/village.js`, D-219): o degrau maior de obra pública pronto, de pedra, é ferido pelo fogo e pelo motim até a parte da conta que não é madeira e não cai sozinho (`b.burnHp`: o que o fogo levou; só o `village.js` escreve); a obra grande em curso perde a madeira pelo livro («fogo») e fica; o salão de madeira do povo do norte (`V.TIMBER`), pronto, queima como uma casa. Quem pergunta o que um prédio dá ao fogo pergunta ao `V.fireFuel(b)` (o `nature.js`); quem derruba de propósito (o deus, a guerra) passa a causa dele ao `V.damageBuilding` — só as causas «fire» e «riot» param no chão do fogo. Mexeu no fogo, no motim ou na resistência de um prédio? `node qa/fogo-pedra.js`.
- **As últimas pedras — `V.lastStone` / `V.stoneFor`** (`js/village.js`, D-233): o que a obra grande com a vez ainda espera de pedra, quando é uma carga de carroça ou menos, é dela no armazém do povo. Quem leva pedra do armazém para uma obra pergunta ao `V.stoneFor(b)` (os construtores, pelo `freeFor` do `villagers.js`; a carroça da obra) — nunca ao `G.Fac.free` (regra 82). `qa/canteiro.js` c11 prova.
- **As minas levam só a sua turma — `set.minaN`** (`js/village.js`, `js/economy.js`, L-785): o planejador diz quantos «mineiros» são das minas; o `E.place` não põe mais que isso na mina, e os outros são da pedra. Quem muda a conta dos «mineiros» no `assignJobs` mantém o `set.minaN`. `qa/pedreiros.js` prova.
- Em «Antes de cada commit»: «Mexeu no fogo (`nature.js`), no `V.damageBuilding` ou no motim? Também `node qa/fogo-pedra.js` (`ONLY=p1,p5,p7` em três minutos). Mexeu nos campos guardados, em quem escolhe o sítio de uma cidade nova ou nos anéis de busca? `node qa/terra-guardada.js` (um minuto). Mexeu no `E.place` ou na conta dos «mineiros»? `node qa/pedreiros.js` (um minuto).»

## 8. Arquivos mexidos

(a preencher.)

## 9. O que ficou aberto

(a preencher.)
