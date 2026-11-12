# Bloco X — o ofício que fica (Bairros Vivos, terceira leva)

Agente X. Números reservados: **L-950 a L-969, T-950 a T-969, D-210 a D-214; regras 73 e 74 do guard**.
Ramo: `worktree-agent-ab1e0b6fbb80f0a8d` (base `b2b61f0`). Rascunho e medidores: `scratchpad/ag/X/` (`mede.js`, `eco.js`,
`olha.js`, `instr.py`, `copia.sh`, `lote-eco.sh`, `fome-dbg.js`; a cópia do jogo de antes, instrumentada: `copias/antes.ks3Ym3`).

## 0. ESTADO DO TRABALHO (em dia a cada passo — para quem retomar)

**Feito e no ramo (commits `deb8d5c`, `9bdbb6c` e o seguinte):**
- a regra nova no `js/village.js` (`assignJobs`, `pickHand` no lugar de `pickRoleForList`, `took`, `V.tenure`, `V.tradeLog`,
  `V.tradeAsked`, `V.TRADE_TAU / TRADE_GAP / TRADE_MIN / TRADE_BREAD`; o chamador em `V.update` passa o tempo decorrido);
- os campos novos da pessoa `roleDay` e `roleBack` na lista `SHAPE` (`js/villagers.js`); a memória da cidade `set.ofm` (vai no
  save com a cidade, como tudo dela; o save das pessoas é genérico: nada a mexer no `js/save.js`);
- a causa na biografia (`js/life.js`: `L.onRole(v, prev, why)` → «Voltou a ser lenhador.», «Tornou-se guerreira — a guerra
  chamou.»);
- a prova `qa/oficio-fica.js` (x1 a x13) e as regras `qa/oficio-fica-inv.js`: a prova inteira x1 a x11 rodou de uma vez e
  passou; x12, x13 e as conferências novas rodadas uma a uma;
- **as sabotagens** (`scratchpad/ag/X/sab-X.py`, `sab-all.sh`; as saídas em `sab-out/`): a primeira rodada das 27 — 23
  acusadas pelo caso delas; das 4 que não: a s22 («a emergência tira de quem só o instante diz que sobra») não fazia falhar
  nada e a condição saiu do jogo (a emergência tira de quem o instante tem sobrando, como sempre foi); a s8 («sem a volta
  primeiro»), a s20 («nenhum ofício dá a mão») e a s26 («o load reparte») fizeram a prova ganhar três conferências (x4: quem
  vai a um terceiro ofício pela necessidade não foi devolvido; x6: a mão vem de outro ofício; x10: duas mãos por trocar na
  hora do save) — **a segunda rodada dessas (s20, s8, s26, s8b, s25, s7) está rodando**;
- o guard e a vida curta (`soak 103 … 5 1 1`: 0 violações) passam com a regra.

**Achado na segunda medida da economia, e consertado (commit `25b9f11`):** com a regra do commit `409156d`, seis mundos de 40
anos tinham 414 mortos de guerra onde antes tinham 287, e a gente somava 900 onde antes 1050. Causa: na emergência a memória
só subia (`mem = max(mem, pede)`), e o exército ficava com os soldados da melhor hora dele quando o cansaço e a fome mandam
soldados para casa (`G.War.warriorWant`); e uma emergência não tirava mãos do ofício de outra. Agora os ofícios de uma
emergência pedem o que o instante pede, para cima e para baixo, e a emergência tira de qualquer ofício a que o instante sobra.
**Medido em dez sementes** (`scratchpad/ag/X/eco2/tabela-v3.md`; antes → depois): gente 1657 → 1667, mortos de guerra 529 →
574 (+9 %: dentro do acaso das guerras, de 34 a 91 por mundo), mortos de fome 15 → 4, comida +1 %, madeira +13 %, pedra +2 %,
prédios +7 %, cidades 67 → 69; a comida por pessoa mais baixa de um povo 1,65 → 2,48. Depois disso (ainda sem commit do
teste, só da regra): quem a emergência puxou e a necessidade mandou a um terceiro ofício segue com o ofício a que volta; a
prova x5 ganhou «o exército cansado solta soldados» e «com fome, a guerra dá soldados à roça» (as duas passam).

**O que a primeira fila das outras provas achou — consertado e no ramo (commit `7debadc`):**
1. *O começo de um mundo novo ficou lento* (o `qa/atividades.js` caiu: aos 40 s o primeiro adulto da capital sem casa). Medido
   (`scratchpad/ag/X/comeco.js`, semente 7): antes, 9 construtores aos 10 s, a primeira casa aos 22,6 s, todos com casa aos
   200 s; com a memória, nenhum construtor aos 10 s, a primeira casa aos 59 s, todos com casa aos 300 s. **Conserto:** a
   cidade no dia da fundação (`V.TRADE_NEW`: um dia desde `set.founded`) não tem memória — a repartição dela é a do instante.
   Depois: 9 construtores aos 10 s, a primeira casa aos 18,8 s, 31 de 33 com casa aos 200 s.
2. *A vaga demorava um terço de dia* (o `qa/marinheiros.js` m8: o posto de quem viaja ficou vazio). **Conserto:** o posto
   vazio — a memória e o instante com a mão inteira (0,95 ou mais) — pede na hora ao ofício a que o instante mais sobra (e a
   que a memória não pede mais do que tem), e a memória desse solta a mão junto (não a pede de volta na piscada seguinte).
   Depois: o m8 passa (e na volta o posto é de quem viajou); o x6 da prova: as 4 vagas tomadas em um oitavo de dia por uma
   mão de outro ofício.
3. *Uma cidade sem memória (um save de antes)* começa dos ofícios que a gente dela tem, não do instante — a primeira
   repartição de um mundo salvo não é uma repartição de todo mundo de novo.
4. *O `qa/load-oficio.js` (L-419)* esperava o caçador a mais em 30 passadas e a volta em 6 s: agora no passo da memória (passa).
5. *O x3 da prova*: um dia só de um mundo pequeno tem o teto dobrado (T-954; a década do salto segue em 0,12).
6. *O `qa/motim.js` na «cidade»* (m3, m6, m7: nenhum guerreiro em Mênfis) falha igual no jogo de antes: a regressão o roda
   na metrópole, e o `provas.sh` também agora.
7. *O `qa/fome.js` h13* (ninguém da tripulação chegou ao cais em 40 s — o limite T-691 da própria prova) falhou numa rodada e
   passou noutra: depende do mundo do instante; conferir na rodada de agora.

**Depois disso, no ramo (commit `269c4e4`):** a vaga na hora só para o ofício em que não ficou ninguém (medido na mega: para
toda mão inteira que falta dava um quinto de trocas a mais); a cidade sem memória volta a começar do instante (começar dos
ofícios que a gente tem só espalhava por dois dias as mesmas trocas); o ofício de uma emergência com mãos demais as solta ao
ofício que tem lugar; quem a guerra deixou sem ofício segue com o ofício a que volta; a prova ganhou o x14 (o dia da
fundação) e «o posto vazio pede na hora».

**A FILA A TERMINOU** (`scratchpad/ag/X/fila5/`): a prova inteira — 54 linhas passam, 2 falham (o x3 «as trocas no salto»:
0,122 com o teto 0,12 — ver o T-954: o teto do mundo do zero espera a medida de antes; o x13: a obra escolhida era uma casa
que recebeu a pedra nos 45 s — a prova passou a escolher a obra que mais pedra espera; **falta rodar o x13 e o x3 de novo**).
As outras provas (`fila5/provas/resumo.txt`): passam o guard, load-oficio (6), as cinco «-mao» (129), atividades (14), motim
na metrópole (11), porto (19), sabe (32), quintal (9), taverna (10), olaria (11), lazer (15), obra (13), leva (2),
tempo-livre (6), ladrao-bairro (8), fundadores (6), det3, a vida de 5 e de 20 anos (0 violações), oldsave, salto-igual (3).
**Falham oito casos em sete provas** — fome h13 (ninguém da tripulação no cais em 40 s), marinheiros m9 (a menor energia 13,
o piso 15), vida-bairro v6 (o dragão não deixou o bairro pobre) e o verificador dela (um preso fora da cela, S3), roupa r7
(uma pessoa vestida diferente depois do save), degraus g2c2 (0 olhares com a obra grande à espera), termas e1 (o foguista
abrigou-se da chuva o dia da prova: conferido com um rastro — ofício, posto e memória intactos), maos m10 (nenhuma viagem
de uma cidade com caverna perto), casa-mercante k5.

**A prova da borboleta, lida** (`scratchpad/ag/X/borb1/resumo.txt`: as sete provas no jogo de ANTES, `b2b61f0`, com o acaso do
mundo deslocado de um sorteio por passada do repartidor): **falham ali também** o fome (h18 e h18b — outros casos que o meu
h13), o maos m10 (a mesma mensagem), o roupa r7 (a mesma: uma pessoa vestida diferente depois do save) e o casa-mercante k5 (e
o k7) — dependem do acaso do futuro do mundo pronto, não da regra. **Passam ali** o termas, o degraus, o marinheiros m9 e o
vida-bairro v6, que com a regra falham — olhados um a um, com rastro (cópias de depuração em `scratchpad/ag/X/copias/dbg*`):
- *termas e1*: o foguista de Tenochtitlan está no ofício, no posto e na memória (1 pedido, 1 lembrado, nenhuma troca); passou
  o dia da prova abrigado da chuva (tarefa `shelter`) — o tempo do mundo mudou com o acaso;
- *degraus g2c2*: a obra grande (o teatro de Mênfis) já tinha recebido toda a pedra nos 120 s de antes (falta 0: `V.keeps`
  0), e a prova não achou nenhum olhar «com a obra grande à espera» (pede três) — a turma fez o trabalho dela; o g2c (a
  turma: 11 construtores de 71 adultos) passa;
- *marinheiros m9*: a menor energia (13, o piso da prova é 15) é da líder da viagem, uma caçadora de 53 anos na ronda da
  noite dos caçadores — nenhuma troca de ofício dela, ninguém de pé no cais;
- *vida-bairro v6* (o bairro que enriquece e empobrece): **falha 4 de 4 com a regra** (e com o acaso deslocado de um e de dois
  sorteios) e passa 2 de 2 no jogo de antes. Rastro dia a dia: o bairro escolhido (de Argos, de Mênfis, de Roma, conforme a
  rodada) está numa cidade em guerra — metade das casas vazias desde o primeiro dia da chuva (vazia 0,51), a cidade cai de 35
  adultos para 12 em quatro dias e muda de povo, e o chão do bairro se refaz a cada dia (17, 14, 23, 6, 10… casas) —: a
  chuva de moedas e o dragão da prova não têm um bairro parado onde cair. **Fica aberto** (T-956): a guerra da metrópole da
  geração 19 corre de outro jeito com a regra (o futuro do mundo pronto é outro), e pode ser que corra pior para as cidades
  grandes — a medida dos mundos prontos vividos dez dias, antes e depois (em curso), diz a gente e os mortos de guerra.
  O verificador dela (um preso sem tarefa num instante, S3) não se repetiu nas rodadas com o acaso deslocado.

**As trocas num mundo do zero, antes e depois** (`scratchpad/ag/X/zero/`, semente 103, os anos 20 a 30 no salto, todas as
trocas de ofício a ofício): antes 183 em 11 dias entre 76 adultos = 0,216 por adulto por dia (75 trocaram, 24 três vezes ou
mais, 5 seis ou mais, o que mais 14); depois 126 entre 84 = 0,129 (76 trocaram, 13 três ou mais, nenhum seis, o que mais 5; 99
pela necessidade, 20 pela guerra, 3 voltas, 7 idas e voltas). Um mundo novo de cidades pequenas troca menos que uma metrópole
antes e ganha menos com a regra: o teto do x3 passou a 0,16 (três quartos de antes), e a prova passa (commit `407689f`).

**A fila B, lida até onde chegou** (a sessão caiu no meio dos mundos prontos; o que ficou inteiro):
- *a economia com a regra final* (`eco2/tabela-v5.md`; dez sementes, 40 anos; antes → depois): gente 1657 → 1551 (−6 %),
  mortos de guerra 529 → 604 (+14 %), mortos de fome 15 → 5, comida +6 %, madeira +15 %, pedra +20 %, prédios +10 %, cidades
  67 → 67, a comida por pessoa mais baixa 1,65 → 1,53. Por década (`python3 guerra.py eco2 antes v5 <sementes>`): até o ano
  30 a regra não custa nada (gente 1386 → 1410; mortos de guerra e flecha 339 → 331); a diferença é toda da última década
  (224 mortos de guerra antes, 324 depois), em que dois mundos trocam de sorte (o 9: 120 → 211 de gente; o 31: 211 → 120).
  As diferenças mundo a mundo têm desvio de 52 de gente e de 22 de mortos de guerra: a média (−11 de gente, +7,5 mortos por
  mundo) fica a 0,6 e a 1,1 desvio do zero — **não se distingue do acaso das guerras com dez mundos**. Mas nos olhares das
  décadas há mais gente de guerreiro depois (ano 30: 25 → 56 na `v3` e na `v5`): a medida a seguir conta isso ano a ano;
- *as trocas do zero* (`fila6/mede-*-zero.txt`): 0,216 → 0,129 por adulto por dia (já dito acima).

**A fila D, lida** (`fila-d.sh`; a parte `borb` — o acaso deslocado — não rodou):
- *os mundos prontos vividos dez dias* (`fila-prontos/pronto-antes-*.txt`, `fila7/pronto-depois-*.txt`; antes → depois, a
  regra `v5`): **metrópole** gente 704 → 638 antes, → 759 depois; mortos de guerra e flecha 231 → 159; de fome 4 → 7; comida
  produzida nos dez dias 11536 → 14085; prédios 735 → 785; o pior instante de fome 72 → 62 pessoas. **Mega** gente 446 → 550
  antes, → 554 depois; mortos de guerra e flecha 87 → 59; de fome 2 → 2; comida 9644 → 9420; prédios 495 → 495; o pior
  instante 41 → 33. **Não custa nos mundos prontos.**
- *as armas olhadas a cada ano* (`python3 armas.py eco2 a6,v6 <sementes>`; dez mundos de 40 anos, 400 olhares): os
  povos-ano em guerra 14,5 % antes → 11,9 % depois (menos guerra); **dos adultos dos povos em guerra, guerreiros 20,8 % →
  21,7 %; dos povos em paz, 2,9 % → 3,5 % (um quinto a mais)**; e os mortos de guerra por povo-ano em guerra 2,5 → 3,6. Nos
  mundos prontos igual: em paz 7,9 % → 10,1 % (metrópole) e 5,7 % → 6,7 % (mega).
- **A causa, medida** (`scratchpad/ag/X/paz.js`: uma guerra declarada na metrópole, 90 s de leva, a paz do deus): com a
  regra `v5` os soldados de Argos iam de 19 a 17 em 10 s, 16 num oitavo de dia, 12 num quarto, 9 em meio dia, 8 num dia e 5
  em dia e meio (a paz pede 4 a 5) — **o exército voltava para casa ao longo de um dia e meio**, pela memória dos dois
  ofícios (a do exército só solta devagar, a do ofício de cada um só pede devagar); antes da regra, em segundos.
- **Consertado (na árvore, ainda sem commit — a medida `v7` roda):** (1) *a emergência acabada, quem ela puxou volta pelo
  instante, como veio* — o ofício em que está tem uma mão a mais agora (duas, enquanto ainda é o de uma emergência: a conta
  dos adultos pisca de um), o que deixou tem falta de uma agora, e a memória dos dois acompanha a mão (`village.js`, o bloco
  `over` / `lacks` antes da volta pela memória). Medido com o `paz.js`: os soldados de Argos 19 → 12 em 10 s, 11 num oitavo
  de dia, 6 em meio dia; a prova ganhou o **x15** (num oitavo de dia 28 das 40 mãos puxadas de volta, os soldados 23 → 11
  onde a paz pede 7; e «quem voltou não é levado adiante»). (2) *a leva pesa como sempre pesou* — a mão livre primeiro
  (L-461) e um tanto de cada um (`G.hash` do id, o mesmo em toda guerra) no lugar do sorteio —: com «os bravos» sozinhos (a
  coragem dá golpe e segura o soldado na linha: `war.js` 581, `wars.js` 604) cada povo-ano de guerra matava metade a mais.
  x5 com as duas: passa (a coragem de quem foi chamado 0,56, a de quem ficou 0,47).

**A economia `v7`, lida** (os dois consertos; `eco2/tabela-v7.md`, `python3 armas.py eco2 a6,v6,v7 <sementes>`; antes →
`v7`): gente 1657 → 1608 (−3 %; mundo a mundo a diferença tem desvio de 37: a média −5 fica a 0,4 desvio do zero), mortos
de guerra 529 → 558 (+5 %; desvio 11, a média +3 a 0,8 desvio), mortos de fome 15 → 7, comida −1 %, madeira +13 %, pedra
+20 %, prédios +3 %, cidades 67 → 67, a comida por pessoa mais baixa 1,65 → 1,53. **As armas voltaram ao que eram:** dos
adultos dos povos em guerra, guerreiros 20,8 % antes, 21,7 % na `v6`, **20,6 % na `v7`**; em paz 2,9 %, 3,5 %, **3,3 %**;
mortos de guerra por povo-ano em guerra 2,46, 3,64, **2,34**.

**A economia `v8`, lida** (só o conserto (1), a leva só dos bravos): gente 1536 (−7 %), mortos de guerra 635 (+20 %), 2,79
por povo-ano de guerra; quatro dos dez mundos idênticos aos da `v7` (num mundo de vilas a guerra tira de ofícios de uma ou
duas mãos, e não há o que escolher: na metrópole, de 18 chamados de Argos só 4 saíram de ofícios com mais de duas mãos). A
diferença para a `v7` (+8 mortos de guerra por mundo, desvio 17: 1,4 desvio) não se separa do acaso, mas as três medidas com
«só os bravos» (`v5` +14 %, `v8` +20 %, e a `v3` de antes +9 %) ficaram acima de antes e a da leva de sempre não (+5 %):
**a leva ficou** — é o peso de antes (o sorteio trocado pela sorte de cada um), a mudança menor. **Commit `9ab1a24`**: os
dois consertos, o x15, o x5 com o caso montado da leva e o povo cansado pela conta da própria guerra (T-957: a mão da prova
em `f.weariness` era desfeita a cada passo pelo `wars.js`; o caso passava por outra causa), e o medidor `qa/oficio-eco.js`.

**A última fila, até aqui** (`fila-g.sh <jogo> scratchpad/ag/X/fila8`, pode ser lançada de novo — pula o que tem a saída
inteira): **a prova inteira com a regra final: 60 linhas passam, nenhuma falha** (`fila8/prova.txt`: a metrópole 0,104 pela
necessidade por adulto por dia, a mega 0,087, o zero 0,102; a casa guarda a cara 80 % e 92 %; em volta das casas 78 e 29
por dia). As outras provas (`fila8/provas/resumo.txt`), até o `maos`: passam guard, load-oficio, as cinco «-mao»,
atividades, motim (metrópole), porto, sabe, quintal, taverna, olaria, lazer, obra, leva; **falham as mesmas de antes** —
fome h13, marinheiros m9, roupa r7 (a mesma pessoa #9391 que no jogo de antes com o acaso deslocado), termas e1, maos m10,
degraus g2c2 — **e uma nova, o degraus g4e** («com a pedra dada, anda»: a obra recebeu 8 de pedra em dois anos, o piso é
12; na rodada de antes desta regra, 12 justos; no jogo de antes com o acaso deslocado, 28). **Olhado com rastro**
(`dbg-g4.py`, estação por estação, com a regra e no jogo de antes): nos dois Roma tem os mesmos 4 construtores os dois anos
inteiros (pede 4, lembra 4,00 — **nenhuma troca de ofício na cidade**, só um moço); a pedra do povo vai de 150 a 45 com a
regra (8 para a obra) e de 150 a 0 no jogo de antes (24 para a obra): **a pedra guardada para a obra grande vaza para
outras obras do povo nos dois** (é o L-783 do ramo do líder, «as casas novas pela sobra», e a carroça da obra, D-215 — que
este ramo, na base `b2b61f0`, não tem), e quantas cargas chegam à obra nos dois anos é o acaso do mundo. Testei também a
volta pelo instante só para a guerra (a turma da obra grande ficando pela memória): o g4e dá os mesmos 8 — não é dela, e
ficou a regra medida (a volta pelo instante das três emergências).

**As outras provas, todas rodadas com a regra final** (`fila8/provas/resumo.txt`): passam também casa-mercante (9),
tempo-livre, ladrao-bairro, fundadores, det3 («igual» nas três comparações), a vida de 5 e a de 20 anos (0 violações, nenhum
erro), oldsave e salto-igual (3). Falham as sete ditas acima (fome h13, marinheiros m9, roupa r7, degraus g2c2 e g4e, termas
e1, maos m10), com as mesmas mensagens de antes.

**As primeiras sabotagens da regra final mostraram a prova frouxa no x5** (`fila8/sab-velho/`): a s34 (sem a volta pelo
instante) e a s36 (a memória não acompanha a mão) foram acusadas pelo x15; a s35 (a leva só dos bravos) pelo caso montado
da leva; mas a **s29** (a memória da emergência só sobe) e a **s33** (o exército com mãos demais só solta as que puxou) **não
foram acusadas** — nos mundos delas o exército de Argos ia só a 11 ou 13 soldados nos 90 s da leva (a guerra de verdade
cansava o povo durante a leva: a mão da prova em `f.weariness` não segurava nada, T-957), e o caso do povo cansado passava
com qualquer regra. **A prova foi apertada (na árvore, ainda sem commit):** a guerra é mantida fresca pela mão da prova na
conta dela mesma (`fresh`: os mortos, as batalhas perdidas, os desertores dos dois lados a zero enquanto a leva se faz — a
guerra não cansa nem acaba por tratado no meio), no x5 e no x15. Com isso: x5 e x15 passam (21 soldados, o instante pede
21; cansado, pede 14 e são 14 em 15 s). A **s37** (a margem de duas mãos enquanto a emergência dura) não foi acusada: a
prova ganhou uma linha de informação («chamados de novo pela mesma emergência em menos de um dia») para ver se a margem
tem efeito na metrópole; se não tiver, fica dito como guarda sem caso próprio.

**RODANDO AGORA:** as 36 sabotagens de novo com a prova apertada (`fila8/sab/resumo.txt`), os mundos prontos em dez dias e
as trocas do zero com a regra final, e por último o vida-bairro. **Depois:** a prova inteira uma última vez (a de 60 linhas
é de antes do aperto do x5/x15: apagar `fila8/prova.feito` e rodar de novo), guard + vida curta, commit da prova.
**Enquanto uma fila roda, o `js/` e o `qa/*.js` da árvore não podem mudar** (o `qa/oficio-fica.js` pode: o `eco.js` não o lê).

**Falta (nesta ordem):**
1. ler a última fila: o que falhar de novo nas outras provas, olhar (as oito de antes: a conta da borboleta acima); uma
   sabotagem não acusada → a prova ganha a conferência ou a condição sai do jogo (a s37, a margem da emergência, não tem
   caso próprio: se não for acusada, dizer);
2. (feito: a `v7`, a `v8`, o commit dos consertos)
3. fechar este bloco: as seções 4 a 10 estão em `scratchpad/ag/X/bloco-final-4a10.md` (cópia em
   `qa/patch3/bloco-X-fim-rascunho.md`) — faltam os números finais (ANTES_ZERO = 0,22; DEPOIS_RESUMO; ECO_RESUMO; ECO_GUERRA;
   ECO_FOME; PRONTO_RESUMO; X4_X5_RESUMO; ZERO_SALTO; TETO_ZERO_TXT; T840_DEPOIS; OUTRAS_PROVAS_NOTA = a conta das sete
   provas acima), o T-956, o x15 e a volta pelo instante no D-211, a leva no D-212, e a tabela das sabotagens; juntar tudo
   no `bloco-X.md` e apagar o rascunho;
4. o último commit (a árvore limpa; o `qa/oldsave_7.json` que a prova oldsave reescreve volta com `git checkout --`) e o
   relatório final.

**Nota:** não existe `qa/oficios.js` (o pedido o cita): as provas dos ofícios são `load-oficio.js`, `oficinas-mao.js`,
`olaria-mao.js`, `taverna-mao.js`, `termas-mao.js`, `lazer-mao.js`.

## 1. O que foi medido (antes — geração 19, o jogo em `b2b61f0`)

O medidor (`mede.js`, em Node pelo `nodemundo`) olha o `v.role` de todos a cada passo e, numa cópia do jogo com ganchos no
`assignJobs` (`instr.py`), o que cada ofício pedia em cada passada e qual ramo fez cada troca.

| mundo | adultos | trocas de ofício por dia | por adulto por dia | trocaram (em 2 dias) | três vezes ou mais | seis ou mais | idas e voltas A→B→A |
|---|---|---|---|---|---|---|---|
| metrópole (2 dias no passo) | 337 | 231 | 0,69 | 195 | 62 | 14 (o que mais: 12) | 120 |
| mega (2 dias no passo) | 261 | 110 | 0,42 | 105 | 31 | 4 (o que mais: 9) | 45 |

- **Quem faz a troca:** todas pelo ramo «sobra → falta» do `assignJobs` (três por passada de 4 s); os moços que fazem 16 (17
  em 2 dias na metrópole) e os velhos que fazem 62 (8) são poucos. A mudança líquida do censo dos ofícios em 2 dias — o que de
  fato precisava mudar — foi 89 na metrópole (de 462 trocas) e 57 na mega (de 221): o resto é ida e volta.
- **Entre quais:** na metrópole, campo → campo 203, oficina → guerreiro 59, campo → oficina 55, oficina → campo 53, oficina →
  oficina 39 — **o ofício de oficina com prédio (`v.job`) não é mais estável que o do campo**: troca com a meta do teto dos
  ofícios e com os soldados. Os pares: mineiro ↔ caçador 55, mineiro → agricultor 15, lenhador → mineiro 13, lenhador → coletor 11.
- **Por quê (o que o instante pede não para quieto):** em 2 dias, nas 19 cidades da metrópole, o pedido de mineiros mudou 130
  vezes, o de caçadores 128, lenhadores 81, guerreiros 63, agricultores 43, construtores 39, coletores 35. O que vira: as feras a
  menos de 20 casas (`threats`: 270 vezes — um caçador a mais, um mineiro a menos), o que as oficinas pedem com o estoque do
  instante (`ecoN`: 107), o número de adultos (65), as obras (49), e **o celeiro que cruza a marca e volta** (`fed`: 42 vezes —
  cada vez, a metade dos agricultores da cidade larga a roça ou volta: 9 das 64 mãos de Tenochtitlan; e o corte do resto mínimo
  tira 7 ofícios de oficina junto). Em Tenochtitlan o celeiro cruzou a marca cinco vezes em um terço de dia.
- **Quanto dura um ofício antes de trocar** (metrópole, os que trocaram): menos de um décimo de dia 141, menos de meio dia 162,
  menos de um dia 56.
- **Quem era escolhido:** um sorteio (`G.R()`) com a mão desocupada na frente — cada necessidade da hora levava outra pessoa.
- **O que se vê** (a conta desta prova rodada no jogo de antes): os ofícios que as casas mostram (`G.Atmos.about`) mudaram 156
  vezes por dia em 101 casas na metrópole (75 em 46 na mega); dos moradores com um ofício que a casa mostra, 83 de 133 (62 %)
  ficaram com ele dois dias inteiros na metrópole (67 de 88, 76 %, na mega); dos lenhadores, 3 de 10.

## 2. A regra (D-210 a D-212) e as medidas de depois (até aqui)

**Em três frases, para o dono:** (1) a cidade não troca mais o ofício de ninguém pelo que falta nesta hora: ela guarda uma
memória do que cada ofício vem pedindo (uma média de meio dia) e só muda alguém quando a falta durou; (2) quem muda é sempre
a mão mais nova do ofício — os moços primeiro —, e quem tomou um ofício fica nele ao menos três dias (os velhos de casa nunca
saem); (3) a fome, a guerra e a obra grande com a vez ainda puxam braços na hora, mas quem é puxado guarda o ofício que deixou
e volta a ele quando a emergência passa — e a biografia diz («a guerra chamou», «voltou a ser lenhador»).

| mundo | trocas pela necessidade por adulto por dia | antes | ficaram com o ofício que a casa mostra | antes | o que as casas mostram muda (por dia) | antes |
|---|---|---|---|---|---|---|
| metrópole (2 dias; uma guerra começa no meio) | 0,071 | 0,69 | 106 de 126 (84 %) | 62 % | 52 em 65 casas | 156 em 101 |
| mega (1,5 dia) | 0,078 | 0,42 | 74 de 82 (90 %) | 76 % | 24 em 27 casas | 75 em 46 |
| do zero, semente 103, anos 20 a 30 no salto | 0,110 | (a medir) | — | — | — | — |

Ninguém trocou pela necessidade duas vezes em menos de três dias. As emergências à parte: na metrópole, 27 chamados «guerra»
nos dois dias; no x4, com o armazém de Tenochtitlan a zero, 19 mãos puxadas em 70 s, 14 de volta ao ofício delas em dois dias
(3 chamadas antes por outra causa, 2 ainda fora); no x5, 45 chamados às armas em 90 s.

**A economia** (seis sementes, continente 128, 4 povos, 40 anos de salto; antes → depois; medida com a regra de antes dos três
acertos pequenos — a refazer):

| semente | gente | mortos de fome | comida | madeira | pedra | prédios | cidades |
|---|---|---|---|---|---|---|---|
| 103 | 183 → 129 | 0 → 2 | 10607 → 8941 | 2570 → 2186 | 1313 → 792 | 165 → 152 | 6 → 5 |
| 7 | 191 → 139 | 3 → 3 | 12382 → 11989 | 4293 → 3740 | 1075 → 1447 | 205 → 195 | 7 → 8 |
| 2024 | 171 → 171 | 0 → 2 | 10536 → 10528 | 3494 → 3626 | 1318 → 1368 | 180 → 209 | 8 → 8 |
| 11 | 207 → 146 | 0 → 2 | 13668 → 10425 | 4700 → 3278 | 1422 → 1012 | 247 → 188 | 8 → 6 |
| 42 | 157 → 202 | 5 → 2 | 8771 → 10024 | 2242 → 4374 | 1195 → 1286 | 157 → 213 | 8 → 7 |
| 555 | 141 → 248 | 3 → 0 | 8193 → 9658 | 2766 → 4252 | 960 → 1316 | 155 → 245 | 5 → 8 |
| **soma** | **1050 → 1035** | **11 → 11** | **64157 → 61565** | **20065 → 21456** | **7283 → 7221** | **1109 → 1202** | **42 → 42** |

A comida por pessoa mais baixa de um povo, olhada a cada ano, nunca passou abaixo de 1,5 em nenhum dos doze mundos. Os mortos de
fome são gente longe de casa com o armazém cheio (um soldado voltando da guerra, um cativo), antes e depois. Os mundos se separam
pelo acaso das guerras (na 555: 41 mortos de guerra antes, 13 depois): a soma é que diz.

## 3. Decisões tomadas no caminho (rascunho — viram D-210 a D-212 e L-95x na seção final)

- A memória (`set.ofm`) e não «a troca só na virada do dia»: a média reage em proporção (um pedido de mais 9 mãos passa em
  segundos, o de mais uma leva um terço de dia) e filtra o que pisca; a vaga (morre o ferreiro) pede na hora, porque a memória
  ainda o tem. A virada do dia juntaria todas as trocas num instante e deixaria uma obra um dia inteiro sem construtor.
- O celeiro por graus: os agricultores iam de um por fazenda a dois de uma vez quando o celeiro cruzava a marca (`fed`); agora
  de 1 a 2 em proporção entre sete décimos da marca e a marca. A marca sozinha era um interruptor.
- Quem dá a mão numa emergência é o ofício a que o instante **e** a memória sobram: duas emergências ao mesmo tempo (a obra
  grande com a vez e a fome) tomavam de volta as mãos uma da outra cada vez que uma piscava.
- A guerra chama os bravos (como antes), não as mãos mais novas: as mãos mais novas de uma cidade são os moços, e a leva era de
  meninos e meninas de dezesseis.
- A volta primeiro: quem a emergência puxou volta ao ofício dele assim que há lugar (um quarto de mão pela memória, uma pelo
  instante, uma mão de distância); e antes dos três dias não vai a um terceiro ofício.
- O primeiro ofício (aos 16, o de quem chega, o do liberto) não prende: os dias dele começam três atrás.
- O repartidor não sorteia mais nada (`pickHand`): os desempates são os dias no ofício, a idade e o id.
- O preso e quem está no mar não têm o ofício trocado (como o corpo do deus, L-473): não podem tomar outro.
