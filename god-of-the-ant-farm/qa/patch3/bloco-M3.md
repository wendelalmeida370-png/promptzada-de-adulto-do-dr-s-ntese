# Bloco M3 — a terra guardada cedo, o fogo nos monumentos, a última pedra, a régua em dez sementes (Bairros Vivos, o agente M, 3ª rodada)

Ramo: `worktree-agent-a8f5af9594fd9a4f1`. A base desta rodada: `1321040` (o merge do ramo do líder sobre o fim da 2ª rodada,
`b54057e`; sem conflito); a ponta do líder `bedce41` juntada no meio (`ef5ca48`, sem conflito). Números reservados: L-785 a
L-799, T-774 a T-779, D-218, D-219 e D-230 a D-234; regras 81 e 82 do guard. A tarefa: `scratchpad/ag/M/tarefa3.md`.

Os roteiros de medida estão em `scratchpad/ag/M/` (a pasta inteira é
`/tmp/claude-0/-home-user-promptzada-de-adulto-do-dr-s-ntese/9e17ed97-a1b5-5d1c-a5da-c23519ea4f04/scratchpad/ag/M/`); os desta rodada:
`regua.js` (a régua da T-772: um mundo do zero pelo salto, ano a ano, e aos 60 e aos 90 anos a gente, os mortos de fome e de
guerra, as cidades, os degraus grandes fundados, acabados, de pé — por povo que os ergueu —, os anos-de-povo sem renda de pedra,
as cidades novas e a que distância nascem de uma capital que guarda campo, o minério, o ouro e a pedra pelo livro; `ABRE=<save>`
abre um save, `SET=K=V` muda uma constante, `SEMGRANDES=1` recusa todo degrau maior), `tabela.py` (as tabelas da régua),
`ultima.js` (a última pedra: cada obra grande em curso, ano a ano, e para onde foi a pedra do povo, pelo livro), `pedra211.js`
(por que a renda de pedra de um povo é baixa: a rocha, as mãos por ofício, as minas, o alvo e o estoque), `maravilha41.js` (uma
obra grande do nascimento ao fim, num salto só, só escutando), `sab-M3.py` (as sabotagens), `fila3.sh` (a fila, um `node` de
cada vez). As saídas: `r3a/` e `r3b/` (as réguas de antes — o código do `b2b61f0` —, a reprodução da última pedra, os casos do
líder), `r3c/` (as provas, as sabotagens e as réguas do código final). As cópias de código de antes e as cópias das sabotagens
foram apagadas do rascunho depois de medidas (o disco).

## 0. O estado de cada parte

| parte | estado | commit |
|---|---|---|
| a árvore em dia: o merge do começo (`1321040`) e o da ponta do líder antes do relatório (`bedce41`) | FEITO, sem conflito | `ef5ca48` |
| 1. a terra guardada cedo (parte da D-160): o campo cívico (D-230), o anel de vinte para os degraus de 8 e 10 (D-231), as cidades novas longe do campo (D-232); a ordem do campo tem caso (T-773) | FEITO (seção 1) | `64594d7`, `13366d0` |
| 2. o fogo nos monumentos (T-771, D-219): a pedra fica de pé, o motim não derruba sozinho, a obra em curso guarda a pedra, o salão de madeira do norte queima como casa (o caso (b), mantido pela medida); o fogo apaga em minutos (L-787) | FEITO (seção 2) | `64594d7`, `13366d0` |
| 3. a última pedra (L-786, D-233): reproduzida, a causa medida, a regra e a prova (`canteiro` c11) | FEITO (seção 3) | `13366d0` |
| a semente 211 (a pergunta do líder): a causa medida; o ajuste que tentei (as minas levam só a turma, L-785) medido em quatro mundos e **retirado** | FEITO (seção 4) | `13366d0` (entra), `2260676` (sai) |
| a maravilha da semente 41 que não está de pé aos 91 anos (a pergunta do líder) | RESPONDIDO (seção 4b): acabada em 20 anos, queimou pronta | — |
| 4. T-772: a régua em dez sementes, antes e depois, e os mesmos mundos sem obra grande | FEITO (seção 5) | — |
| as sabotagens (`sab-M3.py`): 33, todas acusadas (quatro pediram um caso novo ou um caso mais fino) | FEITO (seção 6) | — |
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
- **A ordem do campo guardado tem caso (T-773).** `terra-guardada` f8: pela varredura da própria prova (`V.resFits`, porta só de
  leitura), o campo é o lote plano mais perto, e um por aplainar só sem nenhum plano ao alcance. A sabotagem (`lev || best`) é
  acusada: em 5 capitais dos mundos prontos há um lote por aplainar mais perto que o plano mais perto.

**O que a prova mediu nos mundos prontos** (`terra-guardada` f1, f7, f8): das 14 capitais de nível 3 a que falta um dos três de
24 m, **10 guardam um campo cívico** e 4 não acham terra (nenhuma já tem os três) — a megalópole: Mênfis a 15 casas do meio,
Roma a 22, Argos a 19 (um lote por aplainar, 9,1 m de relevo); a metrópole: Tenochtitlan a 34. Com o anel de vinte, **12
buscas de degraus de 8 casas ou mais que não achavam lote passam a achar** (13 já achavam até o raio e doze) — o grande palácio
de Tenochtitlan a 47 casas do meio, o de Hedeby a 35, a maravilha e o colossal de Argos a 37.

**A medida de depois** (`terra.js`, a mesma régua da 2ª rodada; «antes» é o fim da 2ª rodada).

Nos mundos prontos, os pares capital × tipo com lote (as capitais que justificam e pagam algum degrau maior):

| mundo | antes | depois |
|---|---|---|
| metrópole | 8 com lote / 15 sem | 10 / 13 |
| megalópole | 18 / 2 | 20 / 0 |
| anos 500 | 3 / 7 | 3 / 7 |
| anos 1000 | 0 / 11 | 0 / 11 |
| **os quatro** | **29 de 64** | **33 de 64** |

(Nos mundos prontos o ganho é só o do anel de vinte: o campo cívico é guardado no olhar do dia da cidade, e o mundo aberto
pela régua ainda não viveu um dia.)

Nos mundos do zero, aos 60 e aos 100 anos (`SEMPAGAR=1`: todo degrau maior que a capital justifica — só a terra; as mesmas três
sementes; os mundos de antes e de depois não são o mesmo mundo):

| semente | aos 60, antes | aos 60, depois | aos 100, antes | aos 100, depois |
|---|---|---|---|---|
| 41 | 5 com lote / 9 sem; 0 de 3 capitais sem lote nenhum | 6 / 0; 0 de 1 | 0 / 13; 3 de 3 | 0 / 4; 1 de 1 |
| 7 | 3 / 13; 2 de 3 | 5 / 5; 0 de 2 | 1 / 20; 3 de 4 | 7 / 11; 1 de 4 |
| 103 | 7 / 8; 1 de 3 | 12 / 9; 0 de 4 | 0 / 14; 3 de 3 | 0 / 8; 2 de 2 |
| **as três** | **15 / 30; 3 de 9** | **23 / 14; 0 de 7** | **1 / 47; 9 de 10** | **7 / 23; 4 de 7** |

**Aos 60 anos nenhuma capital fica sem lote** (eram 3 de 9), e os pares com lote passam de um terço a quase dois terços. **Aos
100 anos a terra ainda acaba para a maioria** (4 de 7 capitais sem lote nenhum; eram 9 de 10) — mas o que falta ali é o que
sobrou por erguer: na semente 41 a capital única ergueu 15 degraus grandes antes, e os 4 tipos sem lote são os que restam.

**As cidades novas: o número 20 e a colonização.** Nos dez mundos do código final nasceram 81 cidades em 90 anos (de 4 a 11 por
mundo); **nenhuma a menos de 20 casas de uma cidade que guarda campo**, salvo uma a 19,9 (o meio da casa: a conta do sítio é
pela casa, a da régua pelo meio dela); a menos de 26 casas, 15 das 81. **Com e sem a regra, no mesmo código** (`SET=RES_CLEAR=0`, três sementes, aos 90 anos): a
211 — 13 cidades e 11 novas com a regra, 12 e 8 sem; a 13 — 12 e 11 com, 12 e 9 sem; a 101 — 14 e 11 com, 14 e 13 sem (e sem a
regra 2 nasceram a menos de 20 casas de quem guardava campo). **A regra não segura a colonização**: aos 90 anos os mundos têm
com ela as mesmas cidades ou mais (13 contra 12, 12 e 12, 14 e 14), e o número 20 do líder fica. O que a régua não diz é se 26
seria melhor para a terra da capital: 15 das 81 cidades novas nascem entre 20 e 26 casas de quem guarda campo.
Nos mundos de antes (o código do `b2b61f0`, que só guardava o campo da maravilha) nasceram 3 cidades a menos de 20 casas de quem
guardava campo nos sete mundos em que a régua já contava isso (2 na semente 13, 1 na 29).
Um limite que não é desta regra: um povo não funda além de 6 ou 7 cidades (a expansão por terra, `checkExpansion`) — na
semente 41 do código final, um povo só, de 888 pessoas, tem 7 cidades e fundou 4 em 90 anos.

**Uma observação de desenho** (não mexi): a ordem «o plano mais perto» guarda em Tenochtitlan da metrópole um campo a 34 casas
do meio havendo um lote por aplainar a 17. É a ordem decidida na 2ª rodada para o campo da maravilha (aplainar custa obra), e
a carroça cobre a distância; se o líder quiser o campo cívico mais perto, a regra seria «o que se aplaina, quando fica a menos
da metade da distância do plano».

## 2. O fogo nos monumentos (T-771, D-219)

**A regra.** `V.bigStep(b)`: o degrau maior de obra pública (não o monumento, que nunca foi do fogo). `V.stoneWork(b)`: o que o
fogo não leva ao chão sozinho — todo degrau maior em obra, e, dos prontos, os de pedra.

- **Pronto, de pedra** (romano, grego, egípcio, asteca, clássico): o fogo fere — o telhado, o que há dentro: a resistência cai
  até a parte da conta que não é madeira (`V.fireFloor`: 77% de um teatro de 24 m, dois terços de um palácio, quatro quintos de
  uma maravilha) e `b.burnHp` guarda o que o fogo levou — e não derruba. Com a madeira queimada ele não alimenta mais o fogo
  (`V.fireFuel` → nada: o `nature.js` pergunta), e enquanto queima a chama é baixa e passa devagar (`Nat.STONE_SPREAD`, um quarto
  do que passa por uma casa: aceso num canto, 1 das 36 casas dele em chamas meio minuto depois, contra 36 queimando como casa).
  A crônica diz («O fogo consumiu o telhado e o que havia dentro do …: a pedra ficou de pé»).
- **O fogo de um monumento apaga em minutos (L-787, achado nesta rodada antes da entrega).** O dano do fogo é repartido pelo
  lote do prédio; com a chama baixa e o fogo passando devagar, um teatro de 24 m aceso num canto levava dois minutos e meio (154 s, medido) para
  gastar a madeira — um fogo no meio da cidade todo esse tempo, com as casas em volta ao alcance dele. (Eu tinha escrito «49
  minutos», a conta de uma casa só em chamas sem o fogo passar adiante: a sabotagem que desfaz a regra mediu 154 s.) Agora a
  madeira de um monumento se
  gasta em `Nat.STONE_SECS` (12) segundos por casa do lado com uma casa em chamas, mais depressa com mais (um canto aceso e
  deixado a si: apagado em 30 s, no que o fogo deixa); e a obra em curso perde a madeira quando o fogo levou a parte dela.
- **O motim** (o caso do líder: Mênfis da semente 103): as tochas são fogo (`Nat.ignite`) e as pedras são dano de causa «riot»;
  os dois ferem o palácio de pedra até o mesmo chão e não o derrubam. O motim de verdade da prova (36 pessoas contra o grande
  palácio de Roma da megalópole, o save no meio do fogo) acaba com «O palácio ardeu» e o palácio de pé com 509 de 700; as
  mesmas tochas e pedras sem a regra (o controle da própria prova): ruína.
- **Em obra** (todo povo): o fogo queima como em qualquer obra até levar a madeira — a do canteiro sai pelo livro («fogo») e a
  obra volta a esperá-la, o progresso volta ao que a pedra assentada permite —, e a obra fica, com a pedra e o tijolo. Não
  alimenta mais o fogo até ter madeira de novo. Acabada depois, está inteira (a madeira foi trazida de novo, pelo livro).
- **O salão de madeira do povo do norte** (`V.TIMBER`; o ajuste do líder, caso (b)): pronto, queima até o chão **como uma casa**
  e o fogo passa por ele como por uma casa — nunca mais depressa (a resistência pelo lote, L-784, já o faz durar: 1280 contra
  320). Em obra, guarda a pedra como toda obra grande.
- **O deus e a guerra derrubam como antes**: o raio (32 golpes), o meteoro (1), o cerco (46 pedras), o terremoto (10).
- A casa, a cabana, os prédios do degrau clássico: como antes (a cidade continua a queimar).

**A decisão (b) ou (c) dos salões de madeira, pela medida: fica o (b).** Nas dez sementes do código final os povos do norte
acabaram 7 salões de madeira (4 na semente 29, 1 na 7, 1 na 77, 1 na 101) e **os 7 estão de pé aos 90 anos**; nenhum queimou.
O critério do líder para o (c) — o povo nórdico chegar aos 90 anos sem nenhum degrau grande de pé por causa do fogo — não
aconteceu em nenhuma das dez. O interruptor está no código (`V.TIMBER_BURNS`): se um dia a medida mudar, o (c) é uma linha.

**O que o fogo fez nas dez sementes.** Antes (o código do `b2b61f0`): 10 degraus grandes caídos em 90 anos, **todos pelo fogo**
(8 prontos, 2 em obra). Depois: **nenhum caído**; um templo de 16 m ferido pelo fogo e de pé (Argos da semente 311).

**Os casos do líder, vividos com este código** (`regua.js` com `ABRE=`; os mundos seguem outro caminho a partir do save, as
tarefas não vão nele): a semente 103 do ano 81 ao 91 — o palácio de 24 m de Mênfis (#13146) pegou fogo e **está de pé aos 91
anos com 1498 de 1680** («o fogo levou 182»), o templo de 24 m em obra ao lado; a semente 41 do ano 81 ao 91 — o incêndio de
Hedeby não se repetiu neste caminho: o Templo de Madeira (#9327) de pé, o Grande Salão do Rei a 88%, igual com (b) e com (c).
O que a regra faria no incêndio de Hedeby como o líder o viu: o Grande Salão do Rei, em obra (72%), perderia a madeira e
ficaria com a pedra; o Templo de Madeira de 16 m, pronto, queimaria como uma casa (o caso (b), provado no `fogo-pedra` p8).

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

**O preço da regra, dito** (não medi um caso em que doa): enquanto a obra grande está a uma carga do fim, as outras obras do
povo esperam por até 20 de pedra — uma vez por obra grande. Se a obra grande não tem quem busque (a cidade dela sem construtor
nenhum), a pedra guardada fica parada até a cidade perder a vez ou a obra cair; o planejador dá à obra que guarda pedra uma
turma de construtores (D-174), e nas dez sementes do código final nenhuma obra grande ficou parada por isso (45 fundadas, 41
acabadas, 4 em obra aos 90 anos).

## 4. A semente 211 sem obra grande (a T-816 do líder): por quê, e a renda de pedra

**A pergunta**: a pedra só é tirada havendo obra que a peça? Se for, o `V.affords` (a menor entre o último ano e a média,
D-216) não deixa nascer o pedido que a faria ser tirada.

**O que a medida mostra: não é falta de pedido.** No save do líder do ano 81 (`pedra211.js`), o povo de Argos — 146 pessoas, 7
cidades — tem pedido de sobra e ninguém para tirar:

- a pedra do armazém em 1, o alvo em 491 (quinze obras à espera de pedra: estátuas, torres, a forja, mercados, casas); a renda,
  6 a 9 por ano; a madeira em 25, o alvo em 239;
- rocha há: de 8 a 37 rochas a menos de 26 casas de cada cidade, e chão de pedreira em todas;
- os braços: os seis «mineiros» do povo estavam todos com posto numa mina, no minério (o `E.place` do `economy.js` põe na mina
  todo «mineiro» sem posto enquanto há lugar), e as mãos livres para a lenha, a coleta e a pedra eram 4 de 23 crescidos na
  capital — os ofícios levam o resto.

Portanto o `V.affords` estava certo em não pagar o teatro de Argos (4 + 15 × min(0, 21) = 4): a média de 21 era história; a
renda de verdade era 6 por ano, e o teatro de 200 de pedra levaria trinta anos. **O `V.affords` ficou como estava** (a
maravilha da semente 41, seção 4b, mostra a mesma regra pagando o que a renda de fato trouxe).

**O ajuste que tentei, medi e tirei (L-785).** «As minas levam só a turma que o planejador lhes deu, os outros mineiros são da
pedra» (duas linhas no `assignJobs`, o `E.place` limitado; a prova `pedreiros.js`). No save do ano 81 a pedra do povo de Argos
passou de 9 para 81, 37 e 56 por ano. **Mas em quatro mundos inteiros, o mesmo código com e sem a regra, aos 90 anos:**

| semente | gente (com → sem) | mortos de guerra | degraus grandes de pé | minério tirado | ouro | pedra entregue |
|---|---|---|---|---|---|---|
| 211 | 575 → 791 | 187 → 97 | 5 → 5 | 136 → 1271 | 183 → 288 | 9088 → 10779 |
| 41 | 942 → 888 | 86 → 62 | 9 → 15 | 770 → 587 | 118 → 298 | 12258 → 11451 |
| 7 | 278 → 209 | 190 → 245 | 4 → 3 | 12 → 361 | 39 → 164 | 4864 → 3145 |
| 103 | 205 → 258 | 247 → 327 | 0 → 4 | 30 → 985 | 23 → 275 | 4340 → 3853 |
| **as 4** | **2000 → 2146** | **710 → 731** | **18 → 27** | **948 → 3204** | **363 → 1025** | **30550 → 29228** |

Com a regra: a pedra entregue +4,5%, o minério −70%, o ouro −65%, os degraus grandes de pé 18 contra 27, a gente −7%. O ganho
de pedra do save não se sustenta num mundo inteiro e o custo no minério e no ouro é grande. **A regra saiu** (`2260676`): o
`economy.js` e o `assignJobs` estão como na base; o remendo (para repor: `git apply -R`) e a prova ficaram no rascunho
(`l785-tirada.diff`, `pedreiros.js`, `pedreiros-inv.js`), para o agente X se quiser retomar pela conta das mãos.

**E a semente 211 no código final** (sem essa regra): 791 pessoas aos 90 anos, **5 degraus grandes fundados, acabados e de pé**
(na árvore juntada de quando o líder mediu: 204 pessoas e nenhum; no código de antes, `b2b61f0`: 438 pessoas, 1 fundado, nenhum
acabado). O que mudou entre a medida do líder e o código final, e que a régua não separa: a casa cheia do H e os consertos do
líder (o tijolo que não chega, L-720) na ponta `bedce41`; desta rodada, o fogo que não derruba, o campo cívico e as últimas
pedras. Os anos-de-povo sem renda de pedra na 211: 165 de 369 antes, 60 de 244 depois.

**O que fica do repartidor, para o agente X** (medido, não mexido): as mãos livres para a lenha, a coleta e a pedra são 3 ou 4
numa capital de 23 crescidos; nas dez sementes do código final, de 24% a 52% dos anos-de-povo passam sem nenhuma pedra entregue
ao armazém (1094 de 2845 no total; antes 814 de 2262 nas oito sementes contadas).

## 4b. A maravilha da semente 41 que não está de pé aos 91 anos (a pergunta do líder)

**Reproduzido** com o código do líder (`55d8533`, o mesmo salto de 90 anos de uma vez do `degraus` g8; `maravilha41.js`, que só
escuta as portas e o livro; a saída em `r3b/maravilha41-lider.txt`; o mesmo mundo: 876 pessoas no ano 91, os mesmos degraus
fundados nos mesmos anos):

| ano | o que houve |
|---|---|
| 36 | **FUNDA a maravilha de 40 m** em Mênfis (nível 3, 38 pessoas; o povo egípcio: 119 pessoas em 5 cidades). A conta do degrau: 192 de madeira, 768 de pedra. O povo tinha 0 de pedra, renda de 44 por ano, média 37 |
| 56 | **PRONTA a maravilha** — vinte anos de obra; o povo então com 238 pessoas, Mênfis com 84. No mesmo ano funda o palácio de 24 m |
| 62 | pronto o palácio de 24 m (6 anos) |
| 76 | **CAI o palácio de 24 m, pronto: fogo** (e a biblioteca de 16 m, pronta: fogo) |
| 85 | **CAI a maravilha de 40 m, pronta: fogo** — 29 anos de pé |

**As respostas.** A maravilha não parou por pedra nem perdeu a vez, e não queimou em obra: **foi acabada em vinte anos e
queimou pronta**, no incêndio da cidade do ano 85; o palácio de 24 m, pronto havia 14 anos, queimou no ano 76. É a T-771
inteira — os dois são de pedra (egípcios), e com a D-219 desta rodada o fogo os fere e não os derruba (na mesma semente, com o
código final e a régua ano a ano: 15 degraus grandes fundados, 15 acabados, 15 de pé aos 90 anos). **E a cidade de 38 pessoas
não pediu demais**: quem paga é o povo (119 pessoas em 5 cidades, 44 de pedra por ano), e a obra ficou pronta em vinte anos,
enquanto o povo dobrava; o `V.affords` com a média dos anos (D-216) pagou o que a renda de fato trouxe. Não mexi.

## 5. T-772: «não custar a cidade» em dez sementes

A régua (`regua.js`): continente de 128, 4 povos, o salto ano a ano. **Antes**: o código do `b2b61f0`. **Depois**: o código
final desta rodada (a ponta do líder `bedce41` juntada). Os dois mundos de cada semente não são o mesmo mundo — entre um código
e outro há a 2ª rodada, a casa cheia do H, os consertos do líder e esta rodada —, e a mesma semente dá 315 ou 888 pessoas.

**Aos 60 anos** (antes → depois)

| semente | gente | mortos de fome | mortos de guerra | cidades | degraus grandes fundados | acabados | de pé | caídos |
|---|---|---|---|---|---|---|---|---|
| 41 | 217 → 372 | 2 → 0 | 103 → 62 | 9 → 7 | 1 → 6 | 1 → 5 | 1 → 5 | 0 → 0 |
| 7 | 217 → 122 | 3 → 4 | 159 → 193 | 10 → 6 | 2 → 3 | 2 → 2 | 2 → 2 | 0 → 0 |
| 103 | 190 → 255 | 1 → 1 | 162 → 92 | 10 → 9 | 3 → 3 | 0 → 1 | 0 → 1 | 1 → 0 |
| 211 | 217 → 337 | 5 → 1 | 105 → 89 | 9 → 11 | 0 → 2 | 0 → 2 | 0 → 2 | 0 → 0 |
| 13 | 137 → 138 | 2 → 3 | 111 → 174 | 7 → 7 | 1 → 1 | 1 → 1 | 1 → 1 | 0 → 0 |
| 29 | 180 → 155 | 0 → 1 | 109 → 115 | 9 → 8 | 3 → 1 | 1 → 0 | 0 → 0 | 2 → 0 |
| 59 | 254 → 68 | 0 → 2 | 119 → 117 | 8 → 6 | 4 → 2 | 2 → 2 | 2 → 2 | 0 → 0 |
| 77 | 120 → 194 | 3 → 3 | 167 → 153 | 7 → 8 | 1 → 2 | 1 → 1 | 1 → 1 | 0 → 0 |
| 101 | 267 → 182 | 1 → 1 | 106 → 222 | 14 → 12 | 2 → 2 | 2 → 2 | 2 → 2 | 0 → 0 |
| 311 | 195 → 85 | 1 → 1 | 95 → 186 | 8 → 9 | 2 → 1 | 1 → 1 | 1 → 1 | 0 → 0 |
| **as 10** | **1994 → 1908** | **18 → 17** | **1236 → 1403** | **91 → 83** | **19 → 23** | **11 → 17** | **10 → 17** | **3 → 0** |

**Aos 90 anos** (antes → depois)

| semente | gente | mortos de fome | mortos de guerra | cidades | degraus grandes fundados | acabados | de pé | caídos |
|---|---|---|---|---|---|---|---|---|
| 41 | 315 → 888 | 5 → 0 | 269 → 62 | 14 → 7 | 5 → 15 | 2 → 15 | 2 → 15 | 0 → 0 |
| 7 | 495 → 209 | 5 → 4 | 215 → 245 | 14 → 8 | 2 → 5 | 2 → 3 | 2 → 3 | 0 → 0 |
| 103 | 275 → 258 | 3 → 3 | 328 → 327 | 14 → 13 | 5 → 6 | 1 → 4 | 0 → 4 | 2 → 0 |
| 211 | 438 → 791 | 9 → 1 | 197 → 97 | 12 → 13 | 1 → 5 | 0 → 5 | 0 → 5 | 0 → 0 |
| 13 | 298 → 347 | 2 → 4 | 142 → 190 | 11 → 12 | 3 → 1 | 2 → 1 | 1 → 1 | 1 → 0 |
| 29 | 499 → 368 | 0 → 1 | 109 → 128 | 12 → 12 | 6 → 4 | 3 → 4 | 2 → 4 | 2 → 0 |
| 59 | 700 → 114 | 0 → 2 | 136 → 134 | 13 → 8 | 7 → 2 | 6 → 2 | 3 → 2 | 3 → 0 |
| 77 | 272 → 225 | 3 → 4 | 170 → 323 | 12 → 10 | 2 → 4 | 1 → 4 | 1 → 4 | 0 → 0 |
| 101 | 185 → 408 | 3 → 1 | 369 → 252 | 11 → 14 | 2 → 2 | 2 → 2 | 2 → 2 | 0 → 0 |
| 311 | 398 → 124 | 2 → 1 | 98 → 224 | 8 → 7 | 6 → 1 | 4 → 1 | 2 → 1 | 2 → 0 |
| **as 10** | **3875 → 3732** | **32 → 21** | **2033 → 1982** | **121 → 104** | **39 → 45** | **23 → 41** | **15 → 41** | **10 → 0** |

**O que as dez dizem.** A gente aos 90 anos: −3,7% (aos 60: −4,3%), com quatro sementes que sobem (a 41 quase triplica, a 211
quase dobra, a 101 dobra) e seis que descem (a 59 e a 311 caem a um terço ou menos) — o mesmo espalhamento da 2ª rodada com quatro
sementes: por esta comparação não dá para dizer que custa nem que rende. Os mortos de fome caem (32 → 21), os de guerra ficam
(2033 → 1982). Os degraus grandes: fundados 39 → 45, **acabados 23 → 41, de pé 15 → 41, caídos 10 → 0**.

**A pergunta feita direito: o mesmo código, com e sem obra grande.** Seis das dez sementes de novo com o código final e o
`V.affords` recusando todo degrau maior (`SEMGRANDES=1`: só os degraus clássicos):

| semente | gente aos 60 (com → sem) | gente aos 90 | mortos de fome aos 90 | mortos de guerra aos 90 | degraus grandes de pé aos 90 |
|---|---|---|---|---|---|
| 211 | 337 → 153 | 791 → 353 | 1 → 4 | 97 → 161 | 5 → 0 |
| 41 | 372 → 251 | 888 → 273 | 0 → 3 | 62 → 385 | 15 → 0 |
| 7 | 122 → 94 | 209 → 116 | 4 → 5 | 245 → 231 | 3 → 0 |
| 103 | 255 → 225 | 258 → 258 | 3 → 3 | 327 → 289 | 4 → 0 |
| 13 | 138 → 121 | 347 → 121 | 4 → 2 | 190 → 309 | 1 → 0 |
| 29 | 155 → 160 | 368 → 390 | 1 → 1 | 128 → 121 | 4 → 0 |
| **as 6** | **1379 → 1004** | **2861 → 1511** | **13 → 18** | **1049 → 1496** | **32 → 0** |

**A obra grande não custa gente.** Nos seis pares, o mundo com obra grande tem mais gente em quatro, a mesma numa e 6% menos
numa (a 29); no total, 2861 contra 1511 aos 90 anos, e menos mortos de fome (13 contra 18) e de guerra (1049 contra 1496). O
tamanho do ganho não é para levar ao pé da letra — os dois mundos de um par se separam no primeiro degrau fundado e a guerra
de cada um é outra —, mas nenhum dos seis mostra a cidade pagando a obra com gente. Não há ajuste a fazer por este lado.

**Depois, aos 90 anos: quem ergueu, e a pedra**

| semente | de pé, por povo que ergueu | feridos pelo fogo e de pé | anos-de-povo sem pedra entregue (antes → depois) | cidades novas em 90 anos (a menos de 20 / de 26 casas de quem guarda campo) |
|---|---|---|---|---|
| 41 | egípcio 15 | 0 | — → 39/161 | 4 (0 / 3) |
| 7 | egípcio 1, nórdico 1, grego 1 | 0 | — → 152/356 | 5 (0 / 2) |
| 103 | egípcio 1, asteca 2, grego 1 | 0 | 112/339 → 131/346 | 10 (0 / 3) |
| 211 | egípcio 1, romano 4 | 0 | 165/369 → 60/244 | 11 (0 / 0) |
| 13 | asteca 1 | 0 | 123/321 → 121/281 | 11 (0 / 2) |
| 29 | nórdico 4 | 0 | 86/263 → 78/249 | 10 (0 / 0) |
| 59 | asteca 1, romano 1 | 0 | 94/287 → 131/278 | 6 (0 / 1) |
| 77 | asteca 2, egípcio 1, nórdico 1 | 0 | 76/242 → 100/306 | 8 (1 a 19,9 / 3) |
| 101 | romano 1, nórdico 1 | 0 | 88/252 → 140/352 | 11 (0 / 1) |
| 311 | grego 1 | 1 | 70/189 → 142/272 | 5 (0 / 0) |

## 6. As provas e as sabotagens

**As provas, no código final (depois do merge da ponta do líder):**

| prova | casos | resultado |
|---|---|---|
| `qa/terra-guardada.js` (nova; f1 a f9) | 25 | passa (65 s) |
| `qa/fogo-pedra.js` (nova; p1 a p8) | 28 | passa (195 s) |
| `qa/canteiro.js` (c1 a c11; o c11 novo, o c7 e o c10d refeitos) | 62 | passa (199 s) |
| `qa/aterro.js` | 29 | passa |
| `qa/degraus.js` sem o g8 (o g9c refeito: o golpe é do cerco) | 66 | passa |
| `qa/casa-rica.js` | 48 | passa (ver a nota abaixo) |
| `qa/morar-palacio.js` m1, m3, m9; `qa/juntar.js`; `qa/mina.js` | 22; 24; 8 | passam |
| `qa/escala.js`; `qa/maos.js` (antes do merge da ponta) | 130; 15 | passam |
| `qa/visual/forma-deus.js`; `qa/visual/fidelidade.js` (o `render.js` mexido) | 27; 8 | passam |
| `node qa/guard.js`; a vida curta (`soak.js 103 continente 128 4 normal 5 1 1`) | — | passam, antes de cada commit |

**Três provas que mudei porque a regra mudou** (nenhuma afrouxada para ficar verde; cada uma diz por quê no próprio arquivo):

- `canteiro` c7: o fogo já não leva ao chão a obra grande em curso (D-219) — o caso prova agora que o fogo leva a madeira, a
  obra fica e a carroça segue e entrega; e que o cerco, que derruba, faz a carga voltar e nenhuma carroça ir à ruína.
- `degraus` g9c: «o mesmo golpe» que derruba o degrau clássico e deixa o maior de pé é do cerco — o fogo numa obra grande para
  no que não é madeira, e não mostraria a resistência pelo lote (L-784).
- `canteiro` c10d: depois do merge da ponta do líder um construtor traz 2 de madeira além do que as mãos e as carroças já
  traziam (a causa não achei: ver a T-777). O caso é da carga da carroça buscada de novo no armazém: cobra agora que o que vem
  a caminho nunca passe do que a obra espera em uma carga das mãos (4) ou mais — e a sabotagem dele (quem busca não conta as
  carroças) continua acusada (o excesso vai a 10).

**Duas falhas que não são desta rodada, medidas:**

- `qa/carga-comum.js` m5 («a fruta e o mel») **falha na base `1321040`** igual à minha árvore (15 passam, 1 falha: os três
  adultos tentados são chamados para o fogo e para a fuga). Não mexi.
- `qa/casa-rica.js` r3d falhava na minha árvore antes do merge da ponta (a casa rica a 93% em três anos, 4 de pedra por
  chegar, com o palácio da cidade parado em 22%) e **passa depois dele** — o tijolo que não chega (L-720, do líder) é o que
  destravou. As minhas regras não estavam no caminho: a D-233 nunca chegou a guardar nada naquele caso (o palácio esperava 45
  de pedra ou mais).

**As sabotagens** (`sab-M3.py`; cada uma numa cópia nova do jogo, uma de cada vez, apagada depois; as saídas em `r3c/`):
**33, todas acusadas.**

| sabotagem | o que desfaz | quem acusa |
|---|---|---|
| a1 | nenhuma capital guarda campo cívico | `terra-guardada` f1a (e f2a, f3a, f4a, f5a: sem campo, sem caso) |
| a2 | um degrau de qualquer tamanho dos três cabe no campo | f2b |
| a3 | as buscas do planejador não veem o campo cívico | f1a, f2b, f2c, f3b |
| a4 | o campo não é largado quando um prédio é posto nele | f2c, f3b |
| a5 | o degrau de 24 m não é fundado no campo guardado para ele | f3b |
| a6 | nenhuma cidade nova é afastada (`V.keptNear` nunca acusa) | f6b |
| a7 | a colônia por mar não pergunta | f6c |
| a8 | os degraus de 8 e 10 não procuram mais longe | f7a, f7b |
| a9 | qualquer cidade guarda campo cívico, capital ou não | f4b |
| a10 | o campo fica guardado com os três de pé | f4c |
| a11 | o campo fica guardado com a terra que não serve mais | **f9b (caso novo: o mar entra no campo)** — o poço do deus do f2c larga o campo por outra porta («ocupada») e deixava esta passar |
| a12 | a vila dos libertos não pergunta | f6c |
| a13 | o campo guardado toma um lote por aplainar antes do plano mais perto (a T-773) | f8 |
| b1 | o fogo leva o monumento de pedra ao chão | `fogo-pedra` p1b, p7b, p7d |
| b2 | o monumento de pedra alimenta o fogo como uma casa | p1b, p2 |
| b3 | a obra grande em curso queima até o chão | p6b, p6e, p6f |
| b4 | a madeira do canteiro não sai pelo livro | p6b, p6e |
| b5 | o fogo passa pelo monumento de pedra como por uma casa | **p2, refeito**: conta o máximo de casas dele em chamas ao mesmo tempo (11 como pedra, 20 com a sabotagem, 36 como casa); o retrato aos 30 s deixava passar, com o fogo já apagado |
| b6 | o monumento com a madeira queimada continua a alimentar o fogo | p1b |
| b7 | nada derruba o monumento de pedra (nem o raio, nem o cerco) | p5 |
| b8 | o salão de madeira pronto é guardado como pedra | p8b |
| b9 | as pedras do motim derrubam o palácio de pedra | p7b, p7d |
| b10 | a obra queimada em curso é acabada chamuscada | p6f, p8e |
| b11 | a marca do que o fogo levou não é guardada | p1b, p4b |
| b12 | o fogo não deixa nada (o chão em 1) | p1b |
| b13 | o progresso da obra queimada fica acima do que a pedra permite | **p6b, refeito**: a obra com o que chegou já assentado (62%) volta a 38%; com nada assentado a sabotagem passava |
| b14 | o monumento queima pelo lote, como uma casa (a L-787 desfeita) | **p2b, mais fino**: apagado em 30 s (com a sabotagem, 154 s; o limite, 90 s) |
| c1 | toda obra pode levar as últimas pedras da obra grande | `canteiro` c11b, c11e |
| c2 | nada é nunca a última carga (`V.LAST` em 0) | c11b, c11c, c11f, c11g |
| c3 | a carroça deixa o chão no armazém mesmo na última carga | c11c |
| c4 | os construtores não perguntam o que o armazém tem para a obra deles | c11e |
| c5 | a carga na estrada continua guardada no armazém | c11c |
| k11 | quem busca não conta o que as carroças trazem (da 2ª rodada, de novo depois de o c10d mudar) | c10c, c10d |

## 7. Pronto para colar

### 7.1 `qa/AUDIT.md`

| id | tipo | texto |
|---|---|---|
| D-230 | decisão (parte da D-160) | **O campo cívico.** A capital que é cidade guarda, além do campo da maravilha (D-121), um campo de 6 casas para o primeiro degrau de 24 m que lhe falta — o teatro, o palácio ou o templo (`V.CIVIC`, `V.civWork`) —, procurado até o raio e doze, pelas mesmas portas (`resLot`, `resFits`, `V.reservaDia`; `set.urb.civ`, no save). Os campos da própria cidade podem ficar em cima; qualquer dos três de 6 casas é fundado nele (`resSite`) e a cidade guarda outro no dia seguinte. Larga-o fundada a obra, ocupado, sem o nível por `V.RES_YEARS`, sem ser capital, com os três de pé, ou com a terra que não serve mais. O deus o vê (`V.reservas`). Medido: aos 100 anos a terra em volta de uma capital acabou (2 de 46 pares capital × degrau com lote, bloco M2); das 14 capitais de nível 3 dos mundos prontos a que falta um dos três, 10 guardam o campo. `qa/terra-guardada.js` f1 a f5, f9; a invariante em `qa/terra-guardada-inv.js`. |
| D-231 | decisão | **Os degraus de 8 e 10 casas procuram até o anel de vinte.** `V.reachOf(set, type, n)`: o degrau de 8 casas ou mais de uma obra de dentro da cidade (o grande palácio, o colossal, a maravilha de quem a ergue dentro) procura aos 6, aos 12 e aos 20 além do raio, como as de fora; a carroça da obra (D-215) cobre a distância. Nos mundos prontos, 12 buscas que não achavam lote passam a achar. `qa/terra-guardada.js` f7. |
| D-232 | decisão | **A cidade nova nasce longe de uma capital que guarda campo.** `V.keptNear(x, y)`: a cidade que guarda um campo (da maravilha ou cívico) a menos de `V.RES_CLEAR` (20 casas) do ponto. Perguntam os quatro que escolhem o sítio de uma cidade nova: a expansão por terra (`village.js`), a colônia por mar (`naval.js`), a da expedição (`expeditions.js`), a vila dos libertos (`war.js`). O povoado dos náufragos e o primeiro desembarque num mundo vazio não escolhem. Nas dez sementes da régua, 81 cidades novas em 90 anos, nenhuma a menos de 20 casas de quem guarda campo. `qa/terra-guardada.js` f6; a regra 81 do guard. |
| D-219 | decisão (fecha a T-771) | **O fogo fere o monumento de pedra e não o derruba.** O degrau maior de obra pública pronto (`V.bigStep`), de pedra (`V.stoneWork`), perde para o fogo a parte de madeira da conta (`V.fireFloor`; `b.burnHp` guarda o que o fogo levou), não alimenta mais o fogo depois (`V.fireFuel`, que o `nature.js` pergunta), e o fogo passa por ele a um quarto do que passa por uma casa (`Nat.STONE_SPREAD`). O motim (tochas e pedras, a causa «riot») fere até o mesmo chão. A obra grande em curso, de todo povo, perde a madeira — a do canteiro pelo livro («fogo»), o progresso de volta ao que a pedra permite — e fica; acabada, está inteira. O salão de madeira do povo do norte (`V.TIMBER`), pronto, queima como uma casa (o caso (b) do líder, mantido pela medida: nas dez sementes os 7 salões acabados estão de pé aos 90 anos). O raio, o meteoro, o terremoto e o cerco derrubam como antes; as casas e os degraus clássicos queimam como antes. Antes: todo prédio que pegava fogo ia ao chão se não chovesse — nas dez sementes da régua, os 10 degraus grandes perdidos foram todos para o fogo; depois, nenhum perdido. `qa/fogo-pedra.js` p1 a p8. |
| L-787 | ajuste (desta rodada) | **O fogo de um monumento dura como o de uma casa grande.** O dano do fogo num prédio é repartido pelo lote; no degrau de pedra, com a chama baixa e o fogo passando devagar, um teatro de 24 m aceso num canto levava 154 s para gastar a madeira — um fogo no meio da cidade todo esse tempo. Agora a madeira de um monumento se gasta em `Nat.STONE_SECS` (12) segundos por casa do lado com uma casa em chamas, mais depressa com mais (o mesmo canto: 30 s); e a obra em curso perde a madeira quando o fogo levou a parte dela, não a resistência inteira. `qa/fogo-pedra.js` p2b. |
| D-233 | decisão | **As últimas pedras são da obra grande.** O que a obra grande com a vez ainda espera de pedra, quando é uma carga de carroça ou menos (`V.LAST`, 20), é dela no armazém do povo: `V.lastStone(set)`, `V.stoneFor(b)` — os construtores de qualquer outra obra não a levam (`villagers.js`, `freeFor`) e a última carga da carroça não tem chão (`city.js`). Acima de uma carga, as obras em curso seguem como antes (D-174). Nada guardado: lido do mundo. `qa/canteiro.js` c11. |
| L-786 | bug | **A última pedra.** O palácio de 24 m de Tenochtitlan da semente 41 ficou em 98% e em 100% do ano 61 para lá do 67 à espera de 5 e depois de 1 de pedra. A causa medida (`ultima.js`): o armazém do povo em 0 ou 1; a pedra que chegava (4, 8, 4 por ano) saía toda, nas mãos, para as outras obras do povo junto dos armazéns delas, antes que o construtor do palácio andasse as suas vinte casas — não o chão da carroça, que eu tinha suposto. A correção: a D-233. |
| L-785 | medida (ajuste tentado e retirado) | **As minas levam todos os «mineiros» sem posto — e é melhor assim.** O `E.place` põe na mina todo «mineiro» sem posto enquanto há lugar, e os pedreiros que o planejador pede pela falta de pedra descem com a turma: na semente 211 (ano 81) os seis mineiros de um povo de 146 estavam todos no minério e a pedra chegava a 6 por ano. Limitar a mina à turma do planejador deu 81, 37 e 56 de pedra por ano naquele save — e, em quatro mundos de 90 anos com e sem a regra, +4,5% de pedra, −70% de minério, −65% de ouro, 18 degraus grandes de pé contra 27, −7% de gente. A regra não entrou (`2260676`); o remendo ficou guardado. O que segura a pedra é a conta das mãos livres (3 ou 4 numa capital de 23 crescidos), do repartidor. |
| T-773 | limite de teste (fechado) | **A ordem do campo guardado tem caso.** `qa/terra-guardada.js` f8: pela varredura da própria prova (`V.resFits`), o campo é o lote plano mais perto, e um por aplainar só sem nenhum plano ao alcance; em 5 capitais dos mundos prontos há um lote por aplainar mais perto que o plano mais perto. A sabotagem a13 (`lev \|\| best`) é acusada. |
| T-772 | medida (fechada) | **«Não custar a cidade» em dez sementes.** Antes (`b2b61f0`) → depois (o código final da 3ª rodada do M), aos 90 anos: a gente 3875 → 3732 (−3,7%, quatro sementes sobem e seis descem), os mortos de fome 32 → 21, os de guerra 2033 → 1982, os degraus grandes fundados 39 → 45, acabados 23 → 41, de pé 15 → 41, caídos 10 → 0. E o mesmo código final com e sem obra grande, em seis sementes: 2861 pessoas contra 1511, 13 mortos de fome contra 18, 1049 de guerra contra 1496 — a obra grande não custa gente. |
| T-774 | limite (aberto) | **Ninguém conserta um prédio ferido.** O monumento chamuscado fica no que o fogo deixou (66% a 80% da resistência) até ser ampliado; não há ofício nem conta de conserto no jogo, para prédio nenhum. |
| T-775 | limite (aberto) | **O monumento chamuscado não se vê.** A fuligem do 3D aparece abaixo de 60% da resistência, e o fogo deixa de 66% a 80%: `b.burnHp` está no prédio para o desenho ler (o `G.Atmos.wear`), não usei. |
| T-776 | limite de teste (aberto) | **A expansão por terra não tem caso vivido da D-232.** `checkExpansion` é interno e depende de dados (a gente, o sorteio): o `terra-guardada` f6 prova a porta e lê nos quatro arquivos que quem escolhe o sítio pergunta (a regra 81); a régua das dez sementes conta as cidades novas e a distância a que nascem de quem guarda campo. |
| T-777 | limite (aberto) | **Uma carga das mãos a mais na conta dos construtores, depois do merge da ponta `bedce41`.** No `canteiro` c10 (a obra com tudo o que espera já a caminho, nas mãos e nas carroças) um construtor tira 2 de madeira do armazém além disso; antes do merge, nenhuma. A causa não achei (as duas linhas do H no `buildTask`/`workTask`, ou a tarefa guardada pela cena, L-722: uma carga contada fora que ainda chega). O excesso é menor que uma carga das mãos e a sobra volta ao armazém; o c10d cobra agora «menos que uma carga das mãos». |
| T-778 | limite (aberto) | **A última carga de duas obras grandes do mesmo povo não tem caso.** `V.stoneFor` desconta as últimas pedras das outras obras grandes do povo; nos mundos de prova não há duas a uma carga do fim ao mesmo tempo. |

### 7.2 `qa/README.md`

- `qa/terra-guardada.js` — a terra guardada cedo (parte da D-160; D-230, D-231, D-232; T-773), em Node, nos mundos prontos: f1 o campo cívico das capitais, f2 as buscas do planejador não o tomam (e o poço do deus o desfaz), f3 o degrau de 24 m é fundado nele, f4 só a capital que é cidade, f5 o save, f6 as cidades novas longe (a porta e os quatro que perguntam), f7 os anéis de busca dos degraus de 8 e 10, f8 a ordem (o plano mais perto; por aplainar só sem plano), f9 a terra que não serve mais (o mar entra no campo). Um minuto. Mexeu em `resLot`, `resFits`, `resSite`, `V.reservaDia`, `V.reachOf`, `V.keptNear` ou em quem escolhe o sítio de uma cidade nova: rode-a.
- `qa/terra-guardada-inv.js` — as regras do verificador do campo cívico e da marca do fogo (`b.burnHp`).
- `qa/fogo-pedra.js` — o fogo nos monumentos (D-219, L-787), em Node, na metrópole e na megalópole: p1 o monumento pronto aceso de propósito, p2 o fogo passa devagar e apaga sozinho em meio minuto, p3 o save no meio, p4 a chuva, p5 o deus e a guerra derrubam, p6 a obra grande em curso (e acabada depois), p7 o motim (as portas dele e um motim de verdade, com o save no meio), p8 o salão de madeira do norte. Três a seis minutos (`ONLY=p1,p5` em dois). Mexeu no fogo (`nature.js` `Nat.fuel`, `updateFire`), no `V.damageBuilding`, no `riots.js` ou na resistência de um prédio: rode-a.
- `qa/canteiro.js` — ganhou o c11 (as últimas pedras, D-233); o c7 mudou com a D-219 (o fogo leva a madeira da obra em curso e ela fica; o cerco a derruba e a carga volta) e o c10d cobra o excesso a caminho (T-777).
- `qa/degraus.js` — o g9c é «o mesmo golpe» do cerco (o fogo é do `fogo-pedra.js`).

### 7.3 `qa/regress.sh` (a fase «fundacao», junto das provas da obra grande)

```
node qa/terra-guardada.js
node qa/fogo-pedra.js
```
(o `qa/canteiro.js` e o `qa/degraus.js` já estão lá.) E no `qa/junta-inv.js`: `qa/terra-guardada-inv.js`.

### 7.4 `qa/guard.js` — as regras 81 e 82

- **Regra 81 — quem escolhe o sítio de uma cidade nova pergunta ao `V.keptNear`** (D-232). Os arquivos de `js/` que chamam `addSettlement(` com um sítio escolhido — `village.js`, `naval.js`, `expeditions.js`, `war.js` — têm `keptNear(`; um arquivo novo que chame `addSettlement(` e não esteja na lista dos que não escolhem (`main.js`, `events.js`) é acusado. O padrão que a prova usa: `/keptNear\((x, y|tx, ty)\)/` em cada um dos quatro.
- **Regra 82 — as marcas da obra grande que só o `village.js` escreve, e as portas que os outros perguntam** (D-219, D-230, D-233): `\bu\.civ\s*=[^=]|urb\.civ\s*=[^=]` (o campo cívico: hoje duas linhas, as duas no `village.js` — `\.civ\s*=` sozinho pega o povo dos navios e das batalhas) e `burnHp\s*[-+]?=[^=]` (a marca do fogo) só em `js/village.js` (conferido: nenhuma ocorrência fora dele); o `js/nature.js` pergunta o que um prédio dá ao fogo ao `fireFuel(`; em `js/villagers.js` o construtor olha o armazém pelo `freeFor(` (um só `G.Fac.free(b.set`, o da definição dela), e em `js/city.js` a carroça da obra pergunta a pedra ao `stoneFor(`.

### 7.5 `CLAUDE.md` (em «As fundações», junto da obra grande)

- **O campo cívico — `V.civWork` / `V.reservas` / `V.keptNear`** (`js/village.js`, D-230 a D-232): a capital que é cidade guarda, além do campo da maravilha, um campo de 6 casas para o primeiro degrau de 24 m que lhe falta (`set.urb.civ`, no save; só o `village.js` escreve — o `guard.js` cobra, regra 82); quem desenha os campos guardados pergunta ao `V.reservas(set)`. **Quem escolhe o sítio de uma cidade nova pergunta ao `V.keptNear(x, y)`** (regra 81): nenhuma cidade nasce a menos de `V.RES_CLEAR` casas de uma que guarda campo. Os degraus de 8 casas ou mais procuram até o anel de vinte (`V.reachOf(set, type, n)`). `qa/terra-guardada.js` prova.
- **O fogo e a obra grande — `V.stoneWork` / `V.fireFuel` / `V.fireFloor`** (`js/village.js`, D-219): o degrau maior de obra pública pronto, de pedra, é ferido pelo fogo e pelo motim até a parte da conta que não é madeira e não cai sozinho (`b.burnHp`: o que o fogo levou; só o `village.js` escreve); a obra grande em curso perde a madeira pelo livro («fogo») e fica; o salão de madeira do povo do norte (`V.TIMBER`), pronto, queima como uma casa. Quem pergunta o que um prédio dá ao fogo pergunta ao `V.fireFuel(b)` (o `nature.js`); quem derruba de propósito (o deus, a guerra) passa a causa dele ao `V.damageBuilding` — só as causas «fire» e «riot» param no chão do fogo. Mexeu no fogo, no motim ou na resistência de um prédio? `node qa/fogo-pedra.js`.
- **As últimas pedras — `V.lastStone` / `V.stoneFor`** (`js/village.js`, D-233): o que a obra grande com a vez ainda espera de pedra, quando é uma carga de carroça ou menos, é dela no armazém do povo. Quem leva pedra do armazém para uma obra pergunta ao `V.stoneFor(b)` (os construtores, pelo `freeFor` do `villagers.js`; a carroça da obra) — nunca ao `G.Fac.free` (regra 82). `qa/canteiro.js` c11 prova.
- Em «Antes de cada commit»: «Mexeu no fogo (`nature.js`), no `V.damageBuilding` ou no motim? Também `node qa/fogo-pedra.js` (`ONLY=p1,p5,p7` em três minutos). Mexeu nos campos guardados, em quem escolhe o sítio de uma cidade nova ou nos anéis de busca? `node qa/terra-guardada.js` (um minuto).»

## 8. Arquivos mexidos (desde a base `1321040`, fora o merge da ponta do líder)

- `js/village.js` — o campo cívico (`V.CIVIC`, `V.civWork`, `V.reservas`, `civDia`, `resOver`, `resLot`, `resSite`, `resPlaced`, `letGo`, `V.resFits`), `V.reachOf(set, type, n)`, `V.keptNear` e a expansão por terra; o fogo (`V.bigStep`, `V.TIMBER`, `V.stoneWork`, `V.fireFloor`, `V.fireRoom`, `V.fireFuel`, `siteBurnt`, `V.damageBuilding`, a obra acabada inteira no `V.completeBuilding`, a marca no `V.ungrow`); as últimas pedras (`V.LAST`, `V.lastStone`, `V.stoneFor`). Nada no `assignJobs` (as duas linhas da L-785 entraram e saíram).
- `js/nature.js` — `Nat.fuel` pergunta ao `V.fireFuel`; a chama baixa, o dano e o passo do fogo no degrau de pedra (`Nat.STONE_SPREAD`, `Nat.STONE_SECS`).
- `js/villagers.js` — `freeFor` (os três lugares em que o construtor olha o armazém).
- `js/city.js` — a última carga da carroça da obra sem chão, pela `V.stoneFor`.
- `js/naval.js`, `js/expeditions.js`, `js/war.js` — quem escolhe o sítio de uma cidade nova pergunta ao `V.keptNear`.
- `js/render.js` — o deus vê todo campo guardado (`V.reservas`).
- `js/economy.js` — sem mudança no fim (a L-785 entrou e saiu).
- provas: `qa/terra-guardada.js`, `qa/terra-guardada-inv.js`, `qa/fogo-pedra.js` (novas); `qa/canteiro.js` (c11, c7, c10d), `qa/degraus.js` (g9c), `qa/visual/forma-deus.js` (o caso que esconde a reserva esconde as duas).
- `qa/patch3/bloco-M3.md` (este).

## 9. O que ficou aberto

- **T-768** (o povo sem a roda leva a obra longe nas mãos): não fiz — pede corpo e desenho (um carregador de padiola).
- **T-769** (a pedra antes de assentar): não fiz, como pedido.
- **T-774**: ninguém conserta um prédio ferido. **T-775**: o monumento chamuscado não se vê no 3D.
- **T-776**: a expansão por terra não tem caso vivido da D-232 (a régua conta). **T-777**: uma carga das mãos a mais depois do
  merge da ponta `bedce41` (o c10d). **T-778**: a última carga de duas obras grandes do mesmo povo não tem caso.
- **O campo cívico longe**: a ordem «o plano mais perto» guarda um campo a 34 casas havendo um por aplainar a 17 (seção 1).
- **A obra em curso que queima duas vezes**: depois de queimada, com a madeira trazida de novo, um segundo fogo leva a madeira
  no primeiro instante (a resistência já está no que o fogo deixa). Raro; não medi.
- **O povoado dos náufragos** não pergunta ao `V.keptNear` (nasce onde o mar os deixou).
- **As mãos livres** (do repartidor, o agente X): de 24% a 52% dos anos-de-povo sem pedra entregue; a madeira do povo de Argos
  da 211 em 25 de um alvo de 239.
- **`qa/carga-comum.js` m5 falha na base `1321040`** (e na minha árvore, igual).
- **A régua ano a ano e o salto de uma vez** dão mundos de tamanhos muito diferentes entre versões do código (a semente 41: 219
  pessoas na árvore juntada de antes do H, 876 no g8 da ponta `55d8533`, 888 no código final): as comparações deste bloco são
  sempre entre mundos feitos pela mesma régua.
