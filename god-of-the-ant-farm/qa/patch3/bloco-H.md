# Bloco H — a casa cheia que não esvazia (Bairros Vivos; fecha a L-718)

Ramo: `worktree-agent-a929dac5d95efe183`. Base: `64d3b23`; no meio do trabalho, a pedido do líder, o ramo dele foi trazido
(merge sem conflito, commit `3e2db0c`) até `3f6f663` — que contém o `3213d2d` (a freguesia do agente F e o `K.waiting` da L-719).
Números usados: **L-970 a L-972; T-970 a T-980; D-220 a D-224; regras 77 e 78** (livres: L-973 a L-989, T-981 a T-989).
Arquivos do jogo mexidos: `js/act-casa.js` (o plano, a decisão, a estrada, a casa dada, a cabana das mãos, o diário, a ficha) e
`js/villagers.js` (duas linhas: seção 9). Arquivos novos: `qa/casa-cheia.js`, `qa/casa-cheia-inv.js`, `qa/patch3/sab-H.py`, este
bloco. Folha da matriz mexida: `qa/categorias/p1.js` (a linha «casa»: a frase e a prova nova). **Não mexi** no `js/village.js`
(o `assignHousing` ficou como estava: D-224), no `js/social.js`, no `js/save.js` (as marcas novas moram dentro de `b.encomenda` e de
`b.poupa`, que o save já leva inteiros), nem em arquivo compartilhado nenhum. Nenhum arquivo novo em `js/` (o `index.html` não mudou).
O catálogo das plantas não muda.

Em uma frase: num povo de moeda, a família que divide a casa com outra, não cabe mais e não junta o preço de um teto **recebe do
povo a casa que ele tem vazia** (no mesmo dia, pelo que tem além do pouco que guarda) ou, sem casa vazia e depois de dois dias
juntando sem chegar ao preço, **levanta uma cabana com as próprias mãos** (os crescidos da família são os construtores, a madeira
é a do armazém do povo, o chão é a metade barata da cidade). O diário e a ficha da casa dizem o caminho com a causa.

## 0. O que se mediu antes de mexer (os mundos prontos da geração 19, o código da base `64d3b23`; os roteiros em `scratchpad/ag/H/`)

**Como uma casa passa da lotação e quanto tempo fica** (`m2-anos.js`, o salto do jogo, ano a ano):

| mundo | anos | casas acima no começo → no fim (com o dobro) | dias seguidos acima, das que saíram | dias na fila (lotada / casal), dos que saíram |
|---|---|---|---|---|
| metrópole | 20 | 17 (10) → 10 (0); o dobro some no 6.º ano | 70 casas: mediana 2, média 3,3, máx 13 | 109 famílias: mediana 2, média 2,5, máx 13 |
| cidade | 30 | 16 (2) → 6 (0); de 13 a 16 acima nos nove primeiros anos, 8 com o dobro no 4.º | 36 casas: mediana 6, média 6,4, máx 16 | 66 famílias: mediana 3, média 4, máx 14 |
| do zero (semente 103, continente 128, 4 povos) | 30 | 0 → 11; do ano 9 ao 19, de 17 a 20 casas acima em 26 a 36 | 35 casas: mediana 7, média 9,6, máx 22 | 55 famílias: mediana 3, média 5,8, máx 20 |

**Quem mora na casa acima da lotação** (`m3-quem.js`, só lendo) — o que decidiu a regra: há duas casas cheias diferentes.

| mundo (dia) | várias famílias na mesma casa | uma família só (maior que a casa que tem) | com o dobro |
|---|---|---|---|
| metrópole (58) | 16 de 17 | 1 | 10, todas de várias famílias |
| mega (50) | 11 de 14 | 3 | 2, de várias famílias |
| mundial (63) | 4 de 6 | 2 | 0 |
| anos500 (501) | 6 de 7 | 1 (com crescidos solteiros) | 0 |
| anos1000 (1001) | 16 de 19 | 3 (com crescidos solteiros) | 3, de várias famílias |
| cidade (15) | 0 de 16 | **16** | 2: oito numa cabana de quatro |
| do zero, ano 12 | 4 de 20 | **16** (de 5 a 7 numa cabana de 4) | 0 |

- **A casa de várias famílias** (os exemplos do líder): Cápua, 22 numa casa de 6 (7+7+8); Tebas, 18 num sobrado de 9 (2+8+8); Ribe,
  15 numa casa de 6 (7+8) **com duas casas do povo vazias ao lado**; Texcoco, 18 numa casa de 6 com três casas do povo vazias; Mileto,
  13 numa casa de 6 com duas. A casa vazia não era tomada por dois motivos: a família não tinha o preço dela (80% de uma casa), e o
  plano (`K.plan`) só via a casa vazia **com camas para a família inteira** — a família de sete nunca tomava a casa de seis (L-970).
- **A família sozinha, maior que a casa que tem** (o mundo novo: 16 das 16 da «cidade»): não há quem saia. Fica fora desta regra
  (D-224, T-975).
- Cápua, olhada dia a dia (`m4-capua.js`): é uma colônia de dois dias (as obras nascidas nos dias 56 e 57); em três dias a regra de
  antes já a desfaz (uma família paga 5 moedas por uma cabana, outra recebe a casa nova do povo). O retrato do mundo pronto pegou-a
  no segundo dia.

**Por que o pote da casa cheia está vazio** (o livro-razão das moedas das casas, por casa e por dia, `m2-anos.js`; e o que nasce e
some de moeda no mundo, `m6-moedas.js`):

| mundo | a casa cheia: entra / sai por dia | de onde entra | para onde sai | as outras casas: entra / sai |
|---|---|---|---|---|
| metrópole (20 anos) | 1,46 / 3,17 | salário 0,62, renda da terra 0,22, aluguel 0,17, segredo 0,15 | mudança 1,68, obra da casa 0,94, compras 0,17 | 2,71 / 1,91 |
| cidade (30 anos) | 1,34 / 1,12 | salário 0,47, comissão 0,31, segredo 0,24 | obra da casa 0,36, mudança 0,22, compras 0,18, imposto 0,10 | 2,11 / 1,46 |
| do zero (30 anos) | 0,45 / 0,20 | comissão 0,21, salário 0,14 | compras 0,08, obra da casa 0,04 | 0,43 / 0,16 |

- **Não é falha no caminho das moedas: é pobreza de verdade.** Em dez anos de «cidade» nenhuma moeda some do mundo (as linhas do
  livro para `@mundo`: zero, na base e no ramo), e nascem de 61 a 187 moedas (a comissão das caravanas, a renda da terra, o segredo —
  fontes raras e de valor desigual: umas 20 comissões de caravana em dez anos) para umas 35 casas. Uma casa ganha de 0,4 a 1,5 moeda por dia, o
  pote é de todos os que moram nela (`K.savings`), e uma casa custa de 10 a 19: num mundo novo o preço é uma vida. Na metrópole
  (23 moedas por casa em média) quem tem paga — a mediana é de 2 dias.
- **A madeira, o chão, as casas vazias** (`m1-retrato.js`, `m4-capua.js`): na metrópole os povos têm de 23 a 103 de madeira (o de
  Roma, 28), e as obras de cada povo esperam mais madeira do que o armazém tem (as do povo de Roma: de 62 a 172 esperadas, com 0 a 28
  no armazém) — não existe «sobra além do que as obras esperam»; por isso a regra pede a madeira **que há livre no armazém** (D-222).
  Casas do povo vazias na metrópole: 12 (Texcoco 3, Ribe 2, Tíbur 2, Mileto 2, Tebas, Óstia, Delfos), mais de 4 a 9 casas de dono
  vazias (para alugar) em cada cidade grande; na «cidade», 5. Chão: a busca de lote do planejador achou lugar para uma cabana em
  todo caso tentado; as ilhas pequenas do anos1000 (Gotland Menor, Cholula: 0 vagas, nenhuma obra) podem não ter.

## 1. O que foi feito (os itens da tarefa, na ordem)

1. **Ler o que existe** — feito (o `act-casa.js` inteiro, o `assignHousing`, o barraco, as moedas, as linhas do AUDIT, as provas).
2. **Medir antes** — feito: a seção 0.
3. **A regra** — feito (`js/act-casa.js`; D-220 a D-224):
   - **o plano** (`K.plan`): a casa vazia serve à família com camas para todos, como antes, **ou** — para a família que divide a
     casa com outra — onde ela viveria sem ficar mais apertada do que está; para a família sozinha na casa que tem, só uma casa com
     mais camas. Vale para a compra, para o aluguel e para a casa dada (L-970);
   - **a casa vazia do povo, dada** (`cede`, D-221): no dia da cidade, sem esperar, à família perguntada («lotada» ou «casal») que
     não tem o preço; paga o que a parte dela no pote tem além das duas moedas que guarda, até o preço (pelo livro,
     «compra-casa», ao tesouro); é a dona. A família sozinha numa casa sua menor deixa-a ao povo em troca;
   - **a cabana das próprias mãos** (`raiseByHand`, `K.handsTask`, D-222): sem casa vazia do povo, depois de `K.HANDS_DAYS` (2)
     dias juntando sem chegar ao preço; uma cabana (4 camas, 10 de madeira); só para a família que divide a casa com outra e que
     numa cabana não ficaria mais apertada; a madeira livre no armazém do povo, menos a que os navios guardam e a que as outras
     cabanas de mãos esperam (`K.spare`); o lote pela busca do planejador, pedido na metade barata da cidade (nível 2+); uma por
     cidade de cada vez (`K.MAX_HANDS`); não conta nas duas obras pagas dos construtores; o que a família tem além do que guarda
     paga a madeira (até 3 moedas), guardado na obra como numa casa paga; sem mãos crescidas da família na cidade, passa aos
     construtores do povo;
   - **o que não muda**: `K.need`, quem sai primeiro (D-098), a casa rica, a casa mercante, a sede, o caminho de quem tem o
     preço, o povo sem moeda; o corpo do deus — o dia nunca decide pela família dele; a oferta no armazém diz o caminho novo e o
     corpo pede (sem paciência: a escolha é do jogador).
4. **A tela** — feito (D-223): o Diário de Vida diz a estrada com a causa (`K.road`, `K.roadSays`: a casa vazia do povo; «se em 2
   dias não juntarmos o preço, levantamos a nossa cabana com as nossas mãos»; «não juntamos o preço: vamos levantar…»; «…e o povo
   não tem madeira de sobra»; «…a cidade não tem chão livre»; «estamos levantando a nossa cabana com as nossas mãos (40%)»); a
   ficha da casa no Modo Deus diz por que ela está cheia (`K.fullSays`, pelo `E.buildingHTML`: quantos para quantas camas, quantas
   famílias, a família que o dia pergunta e o que a segura hoje). Só leem (regra 78; o c14).
5. **A prova, as invariantes, as sabotagens** — feito: `qa/casa-cheia.js` (16 casos), `qa/casa-cheia-inv.js` (6 regras),
   `qa/patch3/sab-H.py` (28 sabotagens, todas acusadas): seção 8.
6. **Medir depois** — feito: seção 2.
7. **Do aviso do líder (L-719)**: a cabana das mãos é uma encomenda como as outras para o `K.waiting` (uma casa por família, por
   qualquer porta); o par que chega depois não pede outra, trabalha na cabana e muda com a família (`famNow`; o caso c16; L-972).

## 2. O que mudou no mundo — a medida de depois, com a mesma régua

`m5-regua.js`: cada mundo pronto saltado 10 anos; a cada dia, as casas acima da lotação e com o dobro, e quem mora nelas; a soma
dos 11 dias em casas-dia. **Antes** = a ponta do líder `3f6f663` (uma cópia com o `act-casa.js` e o `villagers.js` dela); **depois**
= o ramo. A régua tem ruído — o mesmo código dá outro futuro se o mundo vive um segundo a mais antes do salto (T-970) —, por isso
**três tiradas de cada mundo** (2, 3 e 5 s vividos antes do salto), ditas na ordem.

| em 10 anos (três tiradas) | cidade antes | cidade depois | metrópole antes | metrópole depois | mega antes | mega depois |
|---|---|---|---|---|---|---|
| casas-dia **com o dobro, de várias famílias** | 5 / 5 / 4 | **0 / 0 / 2** | 24 / 23 / 29 | **12 / 13 / 11** | 28 / 36 / 21 | **11 / 13 / 8** |
| casas-dia acima da lotação, de várias famílias | 20 / 9 / 8 | 4 / 3 / 6 | 63 / 52 / 61 | 34 / 40 / 47 | 61 / 94 / 48 | 43 / 39 / 38 |
| casas-dia com o dobro (todas) | 35 / 37 / 26 | 21 / 16 / 27 | 35 / 33 / 36 | 18 / 17 / 16 | 32 / 36 / 21 | 11 / 15 / 8 |
| pessoas-dia em casa com o dobro (%) | 18,4 / 21,2 / 14,2 | 12,3 / 8,5 / 15,4 | 6,3 / 6,2 / 7,4 | 3,3 / 3,4 / 3,1 | 8,2 / 7,9 / 5,7 | 2,3 / 3,6 / 2,3 |
| o máximo de dias seguidos com o dobro (das que saíram) | 6 / 5 / 10 | 5 / 5 / 8 | 5 / 6 / 5 | 3 / 4 / 3 | 9 / 9 / 8 | 2 / 3 / 2 |
| casas-dia acima da lotação (todas) | 162 / 133 / 149 | 135 / 153 / 141 | 168 / 175 / 179 | 199 / 166 / 169 | 127 / 140 / 84 | 116 / 103 / 86 |
| no fim: acima / com o dobro / a pior | 11/1/8 · 7/2/13 · 8/0/7 | 4/1/8 · 9/0/8 · 4/0/6 | 13/0/12 · 12/0/14 · 13/1/20 | 15/1/8 · 11/0/8 · 9/0/10 | 11/4/18 · 15/3/13 · 5/2/12 | 14/1/15 · 12/2/11 · 4/0/8 |
| casas dadas pelo povo / cabanas das mãos (vistas no fim) | 0 | 3/1 · 4/0 · 3/0 | 0 | 5/4 · 6/4 · 2/1 | 0 | 6/3 · 5/2 · 5/0 |

Uma tirada cada: **mundial** — com o dobro de várias famílias 1 → 0, acima de várias famílias 58 → 41 (2 casas dadas, 1 cabana);
**do zero, 30 anos** — com o dobro de várias famílias 1 → 0, acima de várias famílias 31 → 21 (1 casa dada).

O que a tabela diz: **as casas-dia de várias famílias com o dobro da lotação caem a menos da metade**, e a casa com o dobro que
sai dele sai em no máximo 2 a 4 dias na metrópole e na mega (a paciência e a vez: uma decisão por dia em cada cidade; antes, 5 a 9).
O que fica é o dia zero herdado do mundo pronto (as 8 da metrópole e as 2 da mega no primeiro dia do salto) e a família sozinha
maior que a casa que tem (T-975: numa tirada da metrópole uma casa assim fica os dez dias com o dobro) — por isso «acima da lotação
(todas)» quase não muda, e na «cidade» (16 de 16 de família só) o dobro de família só continua.

**A saúde da economia** (as mesmas tiradas; antes → depois):

| | cidade | metrópole | mega |
|---|---|---|---|
| madeira do povo, média dos dias | 83 / 72 / 59 → 56 / 66 / 67 | 126 / 138 / 147 → 125 / 131 / 121 | 588 / 609 / 621 → 529 / 450 / 565 |
| mortes de fome | 1 / 0 / 1 → 0 / 1 / 0 | 3 / 5 / 5 → 3 / 14 / 8 | 7 / 0 / 4 → 1 / 3 / 4 |
| prédios acabados | 35 / 28 / 22 → 29 / 24 / 29 | 106 / 102 / 123 → 104 / 91 / 92 | 111 / 125 / 97 → 114 / 117 / 110 |
| moedas no fim: tesouros + casas | 176 / 138 / 137 → 96 / 107 / 58 | 5288 / 5091 / 5119 → 5196 / 4925 / 5209 | 2203 / 2336 / 2221 → 2441 / 2467 / 2477 |

- **A madeira**: na mega, de 2 049 de madeira que as obras tiraram do armazém em dez anos, **40 foram para cabanas de mãos** (4
  cabanas; uma tirada, `m6-moedas.js`); o armazém recebeu 3 188 e deu 2 656 (a base: 3 344 e 3 204). A média do estoque fica de 8 a
  15% abaixo em duas das três cenas — dentro do que as tiradas variam entre si na «cidade», abaixo de todas na mega; não sei
  atribuir a diferença da mega às cabanas (40 em 2 049) e deixo-a dita (T-978).
- **A fome e as obras**: sem direção (a metrópole tem uma tirada com 14 mortes de fome, as outras iguais; a mega, menos); as obras
  acabadas, dentro do ruído (no mundial, a base de antes do merge acaba 68, 43 e 49 prédios em três tiradas; a ponta do líder, 53;
  o ramo, 59).
- **As moedas**: nenhuma some (o livro: zero linhas para `@mundo` nas duas). Na «cidade» as três primeiras tiradas do ramo nasceram
  menos moedas (106, 98, 61 contra 181, 140, 130) — fui ver: são as comissões das caravanas e os segredos, poucos e desiguais (uma
  pele rara vale 28 moedas de comissão, um queijo 2); com mais cinco tiradas de cada (7, 9, 11, 13 e 17 s) a ordem se inverte em
  quatro (ramo 187, 168, 80, 162, 151; base 98, 135, 135, 134, 129). Em oito tiradas: base 135 em média, ramo 127. Ruído.
- **O tesouro** recebe menos por casa (quem recebe a casa vazia paga o que tem, não o preço): de 2 a 6 casas dadas em dez anos por
  mundo.

## 3. As linhas do AUDIT (prontas para colar)

A **L-718** passa de «aberto» a consertada: «(consertado nos Bairros Vivos, pelo agente H: D-220 a D-224, L-970 a L-972 — a casa
de várias famílias; a família sozinha maior que a casa que tem fica aberta, T-975)».

| L-970 | bug (consertado nos Bairros Vivos, pelo agente H; a metade da causa da L-718 que se lia no código) | **A família de sete nunca tomava a casa de seis vazia ao lado.** O plano de uma família que precisa de casa (`K.plan`, no `act-casa.js`) só via a casa vazia — a do povo, para comprar, e a de um dono, para alugar — **com camas para a família inteira** (`housing >= fam.length`). Na metrópole da geração 19, Ribe tinha 15 pessoas numa casa de 6 (duas famílias, de 7 e de 8) e duas casas do povo vazias, de 6; Texcoco, 18 numa casa de 6 com três; e a mesma família, com moedas, podia mandar levantar uma casa de 6 nova (a obra nunca perguntou se cabia). **Correção:** a casa vazia serve com camas para todos, como antes (a de número menor), ou — à família que divide a casa com outra — onde ela viveria sem ficar mais apertada do que está (gente por cama: a de mais camas primeiro); à família sozinha na casa que tem (com os seus crescidos solteiros: não há outra família para sair, D-098), só uma casa com mais camas — nunca uma igual. Vale para a compra, o aluguel e a casa dada (D-221). **Prova:** `qa/casa-cheia.js` c1 — «a house#2240 do povo, vazia, 6 camas para 7: lá a família viveria a 1,17 por cama, hoje vive a 2,00; o plano: toma a house#2240»; a família sozinha (7 numa casa de 6) não toma a casa igual; com um sobrado vazio ao lado, toma o sobrado. **Sabotagem** (s1, o plano de antes): o c1b falha — «o plano: NÃO a toma». |
| L-971 | bug (consertado nos Bairros Vivos, pelo agente H) | **Morto quem a marcou, a obra das mãos de uma família ficava sem dono até ficar de pé.** A herança de uma casa (o `G.Village.kill` do `act-casa.js`) só passa o dono de uma casa que vale para morar (`lived(b)`); numa obra, o dono ia a zero e voltava quando a casa ficava de pé (para uma casa paga, é o que a prova h7 do `casa.js` sempre viu). Para a cabana das mãos a regra do verificador pede dono da família (H1), e acusou no caso da morte: «hut#5459: obra das mãos de uma família e o dono (#0) não é dela». **Correção:** na morte de um dos escritos, a obra das mãos é de quem responde por ela agora (`encomenda.by`, o seguinte da família); sem mãos crescidas da família na cidade, deixa de ser obra de mãos na hora (os construtores do povo a acabam, e os pequenos mudam, como numa casa paga). A casa paga ficou como era. **Prova:** c7 — «Sitamun morreu: a obra hut#5459 é de Sneferu»; o par acaba a cabana e a família muda; mortos os dois, «a obra é dos construtores do povo», de pé em 17 s, os 5 pequenos nela. **Sabotagens:** s16 (sem passar o dono) — c7b e c7c falham; s15 (a obra sem mãos fica órfã) — c7e e c7f falham. |
| L-972 | bug (consertado nos Bairros Vivos, pelo agente H; a outra ponta da L-719) | **De pé a casa da família, só mudava quem estava escrito na obra: o par que veio depois ficava na casa cheia.** A casa encomendada muda os escritos em `b.encomenda.fam` (`completeBuilding`, no `act-casa.js`); o par que veio morar com um deles depois da obra marcada não está escrito, e quem o juntaria é o repartidor de casas, que só leva um par para a casa do outro **havendo cama** — e a cabana de quatro de uma família de seis não tem. Reproduzido no c16 com a linha de antes (a sabotagem s28): «Sitamun mora na hut#5459, Sneferu na house#2204». **Correção:** a família de uma encomenda é a de agora (`famNow`): os escritos e o par que mora com um deles; esse par muda com a família quando a casa fica de pé (vale para a casa paga também), trabalha na cabana das mãos (`K.handsTask`) e conta entre as mãos dela. A pergunta «a família já espera uma casa?» é a do líder (`K.waiting`, L-719) e vale igual para a cabana das mãos: o par não pede outra casa por nenhuma porta — a decisão, o corpo, a casa vazia do povo, o dia da cidade. **Prova:** c16 (6 linhas) — «espera hut#5459; com moedas, pedindo: «A casa da família já está sendo levantada.»; pelo corpo: o mesmo; sem moedas e com uma casa vazia do povo: o mesmo; depois de dois dias da cidade: 1 obra da família»; «na obra: Sitamun, Sneferu (Sneferu: trabalhou, 2 cargas)»; «a família de agora (7) inteira na cabana». **Sabotagens:** s26 (a pergunta de antes da L-719) — c16c falha, «ENCOMENDOU»; s27 (o par não trabalha) — c16d; s28 — c16e. |
| D-220 | decisão (do agente H, nos Bairros Vivos; fecha a L-718 pela causa que a medida deu) | **A casa cheia são duas, e só uma é defeito.** Medido antes de mexer (os mundos da geração 19): na casa acima da lotação mora ou **mais de uma família** (16 de 17 na metrópole, 11 de 14 na mega, 16 de 19 no anos1000 — e todas as que têm o dobro) ou **uma família só, maior que a casa que tem** (16 de 16 na «cidade», 16 de 20 num mundo do zero no ano 12: de 5 a 8 numa cabana de 4). Na primeira há quem saia e não sai; na segunda não há quem saia — a casa é que é pequena. O pote vazio é pobreza de verdade, não falha do livro: nenhuma moeda some, nascem poucas (de 61 a 187 em dez anos de «cidade»), uma casa ganha de 0,4 a 1,5 por dia e custa de 10 a 19; onde há moeda (a metrópole, 23 por casa), quem tem paga em 2 dias. Decidido: a regra nova é para a família que **divide a casa com outra** («lotada» ou «casal», a que o dia da cidade pergunta: a mais moça, D-098) e **não tem o preço**, num povo de moeda; não muda quem precisa de casa (`K.need`), quem sai primeiro, o caminho de quem tem o preço, a casa rica, a mercante, a sede, o povo sem moeda (que já recebe do povo). Duas estradas: D-221 e D-222; a tela: D-223; o que ficou de fora de propósito: D-224. |
| D-221 | decisão (do agente H) | **A casa vazia do povo é dada a quem não cabe e não tem o preço — pelo que a família tem.** Antes de se levantar outra casa: no dia da cidade, sem paciência (a casa está vazia hoje, e um solteiro que sai de uma casa cheia a ocuparia de graça em 2,5 s, pelo repartidor), a família perguntada que não tem o preço muda para a casa vazia do povo que o plano toma (L-970) e é a dona. Paga o que a parte dela no pote da casa cheia tem além das duas moedas que guarda (`K.KEEP`), até o preço, pelo livro («compra-casa», ao tesouro); a casa guarda o que custou (`b.custo`). Quem tem o preço paga-o inteiro, como antes. A família sozinha numa casa sua menor (só toma uma maior) deixa a que tinha ao povo: uma troca, não uma segunda casa. Por que dada e não alugada do povo: o aluguel deixaria a família «de aluguel» para sempre na fila, juntando sem comprar luxo, e a dívida com o povo não tem a quem a casa voltar; e o precedente é dar — o povo sem moeda dá a casa, o repartidor dá a casa vazia ao solteiro, e o inquilino que não paga fica com a casa que o povo compra do dono. **Prova:** c2 (dada no mesmo dia; «1 linha «compra-casa»: 3,25 de h:2204 para f:1662 … a família levou 3,35 moedas»; quem tem o preço paga 10,29), c3 (a troca), c12 (a casa que aparece no meio da paciência é dada). **Sabotagens:** s2 (não dá), s3 (de graça), s4 (paga tudo, sem guardar), s5 (sem a troca), s25 (espera a paciência). |
| D-222 | decisão (do agente H) | **Quem não cabe e não junta o preço levanta a sua cabana com as próprias mãos.** Sem casa vazia do povo, a família que há `K.HANDS_DAYS` (2) dias junta sem chegar ao preço (a casa guarda o dia em que começou: `b.poupa.d`) marca uma cabana — só cabana (D-224) —, e os crescidos dela a levantam: o dia de trabalho de cada um pergunta primeiro pela obra da família (`G.Casa.handsTask`, uma linha no `workTask` do `villagers.js`), e os construtores do povo nunca a pegam (uma linha no `buildTask`). **A madeira** é a do armazém do povo, tirada pelo livro («obra») como em toda obra — quem traz uma carga nas mãos leva-a antes ao seu lugar —, e a obra só começa com os 10 de madeira livres (`K.spare`: o que o armazém tem, menos o que os navios guardam — `f._rsv`, pelo `G.Fac.free` —, o que as operações seguram e o que as outras cabanas de mãos esperam): medido, as obras de um povo esperam sempre mais madeira do que há, e «a sobra além das obras» seria nunca. **O chão**: a busca de lote do planejador (`V.findSite`, com todas as regras dela), pedida na metade barata da cidade — a terra que vale no máximo a mediana das casas da cidade — nas cidades de nível 2 ou mais, e em qualquer lote se ali não houver; sem lote, a família espera, o diário diz, e tenta no dia seguinte (`b.poupa.chao`). **Quanto**: uma em obra por cidade (`K.MAX_HANDS`: a obra é uma obra da cidade enquanto está de pé, e fica pronta em 16 a 170 s do mundo com os crescidos da família, em 270 a 480 s com um só: T-980); não conta nas duas obras pagas dos construtores. **Para quem**: a família que divide a casa com outra e que numa cabana não ficaria mais apertada do que está (a de 7 numa casa de 12 para 6, sim; a de 8 num sobrado de 10 para 9, não). **As moedas**: o que a parte da família tem além do que guarda paga a madeira (até 3 moedas), guardado na obra como numa casa paga — vai ao povo quando a cabana fica de pé, volta se ela nunca fica. **Sem mãos** (os crescidos morrem, a família é levada cativa): a obra passa aos construtores do povo, uma casa paga como as outras. A marca é `b.encomenda.maos` (no save com o prédio). **Prova:** c4 (a paciência, a obra, o livro, o chão barato, a sobra), c5 (só a família trabalha; a madeira; a mudança), c6 (save no meio), c7 (a morte), c8 (a conquista), c9 (sem madeira), c10 (sem chão), c11 (o corpo), c12, c13, c16. **Sabotagens:** s6 a s19, s22, s24. |
| D-223 | decisão (do agente H) | **A tela diz o caminho com a causa, e só lê.** O Diário de Vida (a meta da casa, `A.hooks.diary` do `act-casa.js`) diz a estrada da família: «não temos o preço, mas o povo tem uma casa vazia e a dá a quem não cabe mais onde está»; «se em 2 dias não juntarmos o preço, levantamos a nossa cabana com as nossas mãos»; «não juntamos o preço: vamos levantar a nossa cabana com as nossas mãos»; «…e o povo não tem madeira de sobra para uma cabana agora»; «…e há cabanas demais sendo levantadas na cidade agora»; «…e a cidade não tem chão livre»; com a obra marcada, «estamos levantando a nossa cabana com as nossas mãos (40%)». A ficha da casa no Modo Deus (`K.fullSays`, pelo `E.buildingHTML`) diz por que ela está cheia: «Casa cheia: 12 moradores para 6 camas — 2 famílias. A família de Sitamun (7) não juntou o preço de outra casa (6 de 19 moedas): vai levantar a sua cabana com as próprias mãos.» — ou o que a segura: a vez, os construtores, a madeira, o chão, a cabana em que viveria mais apertada, a família sozinha grande demais. A oferta do corpo no armazém diz a estrada («Pedir ao povo a casa que ele tem vazia», «Levantar a nossa cabana com as nossas mãos»). Uma porta de leitura para todos: `K.road(v)` → `cede` / `maos` (em quantos dias) / o porquê de não haver. **Prova:** c4 (as frases), c9, c10, c13, c14 (o mundo igual depois de 11 diários, estradas e ofertas e 4 fichas lidos: o cânone, todas as marcas das casas, o acaso do mundo, a busca de lotes do dia). **Sabotagem:** s21 (a estrada lida marca a casa) — o c14 falha, «o mundo MUDOU». |
| D-224 | decisão (do agente H: o que ficou de fora de propósito) | **(1) Só cabana pelas mãos.** Uma casa de pedra pede pedra (a do povo é da obra grande: D-174), tijolo de olaria e oficina; as casas pagas da metrópole esperam tijolo a 75% e 92%. A cabana de 4 para uma família de 7 ou 8 continua acima da lotação (1,75 a 2 por cama), mas sozinha na casa que é dela: a cidade com oficina a refaz em casa de pedra, como faz com toda cabana. **(2) A família sozinha maior que a casa que tem não levanta nada com as mãos** e só troca por uma casa maior do povo: uma segunda cabana igual não a melhora, e a reforma pelas próprias mãos (cabana → casa) pede a pedra que os mundos novos não têm — fica aberta com a medida (T-975). **(3) O `assignHousing` não mudou**: o solteiro continua a tomar a casa vazia do povo antes da família (T-976). **(4) Sem aluguel do povo** (D-221). **(5) O povo sem moeda fica como era**: a família pede e o povo levanta com os construtores; a casa vazia do povo já era dada — agora também a que tem menos camas que a família (L-970). **(6) O corpo do deus**: o dia não decide pela família dele (L-452); a oferta e o pedido são dele, sem paciência. |
| T-970 | limite de teste (dito; a régua do bloco H) | **Dez anos de salto de um mundo pronto não são uma medida: são uma tirada.** O mesmo código dá outro futuro se o mundo vive um segundo a mais antes do salto: no mundial, a base sozinha acaba 68, 43 e 49 prédios em três tiradas, tem 52, 43 e 39 de madeira em média, 74, 62 e 84 mortes; na «cidade» nascem de 98 a 181 moedas em oito tiradas da base. Uma comparação de antes e depois com uma tirada de cada lado diz pouco: a régua do bloco (`m5-regua.js`, `PRE=n`) usa três de cada, e onde a diferença ficou dentro do que as tiradas variam, o bloco diz «ruído». |
| T-971 | limite de teste (dito) | **A regra H6 do verificador só vê quem é olhado em dias seguidos.** «A casa de várias famílias com o dobro, com a estrada aberta, que continua assim além da vez» pede saber desde quando a estrada está aberta, e o mundo não guarda isso (o dia em que a casa começou a juntar não serve: a casa vazia do povo pode ter aparecido hoje — a primeira versão da regra acusou cabanas de Tenochtitlan e de Hedeby, na «cidade», nos dias 18 e 19, por um dia 12 de antes de a regra existir). A regra lembra, no próprio verificador, o dia em que viu a estrada aberta pela primeira vez (zera em outro mundo ou num load) e acusa (S3) quem continua assim mais dias do que a posição na fila explica. Numa vida olhada uma vez só não acusa nada. O c15 olha a cada dia do salto. |
| T-972 | limite de teste (dito) | **A casa cheia de cada caso da prova é feita pela mão da prova** (`arma`): uma família da cidade (o casal e os pequenos, sozinha na casa que tinha) posta na casa de outra, dona dela e que cabe nela, com o que era seu levado pelo livro («teste»); a casa que tinha fica do povo, vazia. Para o dia da cidade perguntar só a família do caso, as outras da fila deixam a casa nova para depois pela porta do próprio diário (`K.giveUp`, D-061); as casas vazias que o plano tomaria — as do povo e as de aluguel (na metrópole a família com 6 moedas alugava uma no primeiro dia, e o caso acabava ali) — saem do chão; a paciência anda pela mão (`b.poupa.d` dois dias atrás) nos casos do meio, e de verdade no c15. A família sozinha (c3, c13) é a do mundo; sem uma, a de uma casa de parente que mora noutra (a mão a faz dona — a metrópole) ou a de uma casa sua em que cabe, com as camas do tipo a menos enquanto o caso dura. O c16 separa o casal pela mão antes de marcar a obra (na «cidade» não há crescido sem par no povo inteiro). |
| T-973 | limite de teste (da prova vizinha `casa-mercante.js`; não mexi nela) | **O k2 falha no ramo quando a prova roda inteira, e passa sozinho.** «a família de Hipátia (6) mudou de house#2937 para house#3002, em Argos: … a bandeira da família está em NENHUMA porta». Fui ver (uma cópia da prova com rastro, apagada): a dona da bandeira, Hipátia, 29 anos, **morreu em guerra no dia 60, o dia da mudança**, antes de a ronda do dia levar a bandeira para a casa nova — e a bandeira desce da casa onde ninguém da família mora. O caso escolhe a primeira casa que serve no mundo de dois dias depois do k1, que no ramo é outro (na base escolhe Cuauhtémoc, de Tenochtitlan). `ONLY=k2` passa no ramo na metrópole e na mega. A base (`3f6f663`) passa os 9 (o k7 da T-936 já não falha nela). Sugestão ao dono da prova: se o dono da bandeira morre no ano do caso, escolher outra casa. |
| T-974 | limite de teste (da prova vizinha `lar.js`; não mexi nela) | **O l2 («a vigia e a casa que espera») falha no ramo: quem espera morre de velhice no meio da espera.** «Flávia #3357 esperou em casa 2,6 s». Fui ver (uma cópia com rastro, apagada): a tarefa dela acaba dentro do `V.kill` — Flávia, **60 anos, morre de velhice às 17h40 do dia 58** na vida do ramo; na base não morre (seis tiradas com sorteios a mais antes do caso: espera de 16 a 33 s em todas). O caso escolhe quem sai de vigia com menos de 60 anos, e não olha a idade de quem fica. O l16 e o l16b falham na base e no ramo com a mesma frase (T-688). Sugestão: quem espera, com menos de 55. |
| T-975 | limite (aberto, com a medida) | **A família sozinha maior que a casa que tem continua acima da lotação.** É a casa cheia do mundo novo: 16 das 16 da «cidade» (dia 15), 16 das 20 de um mundo do zero no ano 12 — de 5 a 8 numa cabana de 4, 7 ou 8 numa casa de 6 —, e as duas com o dobro da «cidade» (oito numa cabana). Nas três tiradas de dez anos da «cidade», as casas-dia com o dobro de família só ficam (30 / 32 / 22 antes; 21 / 16 / 25 depois). O que a regra nova faz por ela: a troca pela casa maior do povo, quando há uma vazia (c3). O que ficou para decidir: a reforma pelas próprias mãos (a cabana que vira casa no lugar, como a cidade faz com `improve`) — pede 14 de madeira e 10 de pedra, e os povos da «cidade» têm de 0 a 22 de pedra. |
| T-976 | limite (aberto) | **O solteiro toma a casa vazia do povo antes da família.** O repartidor de casas (`assignHousing`, a cada 2,5 s) manda o crescido solteiro de uma casa cheia para a casa com mais lugar — a vazia do povo, da qual passa a ser dono no dia seguinte (Cápua: a casa#26152 com um morador). A família perguntada só a recebe no dia da cidade. Não mexi (D-224: o `village.js` é de M e de X); com a casa dada no mesmo dia a corrida é de horas, não de dias. |
| T-977 | limite (aberto) | **No povo sem moeda a casa cheia fica quando falta madeira.** Num mundo do zero, do ano 9 ao 16 (antes da moeda), de 17 a 20 casas acima: quase todas de família só (T-975), e as outras ouvem «O povo não tem madeira e pedra que cheguem para uma casa agora» (a regra de antes: uma vez e meia a conta no armazém; os quatro povos somam de 14 a 40 de madeira). A regra nova não toca o povo sem moeda (D-224). |
| T-978 | limite (dito) | **A média de madeira do povo ficou de 8 a 15% abaixo na metrópole e na mega, e não sei dizer que é da regra.** As cabanas das mãos gastam 10 de madeira cada: na mega, 40 em 2 049 que as obras tiraram do armazém em dez anos. A diferença do estoque médio (mega: 588 / 609 / 621 antes, 529 / 450 / 565 depois) é maior do que isso explica e do tamanho do que as tiradas variam noutras cenas (T-970); fica dita para quem medir com mais tiradas. |
| T-979 | limite (dito) | **Os mundos prontos precisam ser gerados de novo** (a regra muda quem mora onde desde o primeiro dia de um povo de moeda), e as medidas do bloco são dos mundos da geração 19. A matriz por prédio (`node qa/matriz-predios.js`) falha na ponta do líder e no ramo com a mesma linha — «moradia/cear (p1.js): a folha diz feita, o código não tem: peça mesa nas plantas» (a mesa das casas mudou de nome na D-196) —, igual com e sem a minha mudança na folha `p1.js` (as duas saídas comparadas); o `MATRIZ-PREDIOS.md` que ela regrava ficou como estava no ramo do líder. |
| T-980 | limite de teste (dito; da prova `casa-cheia.js`) | **A cabana de um adulto só leva dias do mundo, e a prova vive os dias como eles são.** Na mega, morto quem marcou a obra (c7), o par viúvo — um agricultor — acaba a cabana sozinho entre o enterro, a noite em casa, a horta, a corte de um viúvo novo, a oração, as compras e a biblioteca; a carga de madeira que tinha nas mãos quando o sono chegou volta ao armazém (a regra da D-222: uma carga nas mãos vai antes ao seu lugar). Segui-o passo a passo (uma cópia da prova com rastro, apagada): a cabana a 80% aos 289 s, a última madeira a caminho aos 581 s. A primeira versão da prova segurava a manhã pela mão (a hora do mundo de volta ao começo do dia quando a tarde chegava) e dava 600 s ao caso — e nesses 600 s ele dormiu três vezes. Agora a prova não mexe na hora do mundo e dá 2 000 s a esse caso (1 000 a 1 400 aos outros): de pé em 478 s na mega, 271 s na «cidade», 303 s na metrópole. Com os dois crescidos, a cabana fica de pé em 16 s («cidade»), 67 s (mega) e 124 s (metrópole, um só trabalhou). Não é defeito da regra; fica dito para quem achar lenta a cabana de quem ficou só. |

## 4. As linhas do README (prontas para colar)

| `casa-cheia.js` | `[ONLY=c2,c5] [ANOS=6] node casa-cheia.js [cidade\|metropole\|mega]` (≈ 80 s na «cidade»; de 5 a 10 min na metrópole e na mega com `ANOS=4`) | A casa cheia que não esvazia (L-718; D-220 a D-224), em Node, num mundo pronto; a casa cheia de cada caso é feita pela mão da prova (uma família da cidade posta na casa de outra). **c1** o plano toma a casa vazia do povo onde a família viveria menos apertada (L-970); **c2** a casa vazia do povo dada a quem não tem o preço, no mesmo dia, pelo livro, com o pouco que a família guarda — quem tem o preço paga-o inteiro; **c3** a troca: a família sozinha na casa pequena e a casa maior do povo; **c4** as próprias mãos: a paciência, a obra da família (cabana, com dono, na metade barata da cidade), o livro, a sobra de madeira, o diário e a ficha; **c5** a família levanta — só ela trabalha, a obra não conta nas duas pagas, a madeira sai do armazém pelo livro, a mudança; **c6** save e load no meio; **c7** o chefe morre, os dois morrem; **c8** a cidade é conquistada no meio; **c9** falta madeira (e a dos navios não é sobra); **c10** falta chão; **c11** o corpo do deus na família (o dia não decide, a oferta diz, o corpo pede); **c12** a casa vazia do povo que aparece no meio; **c13** quem não vai por esta estrada (a família sozinha, o povo sem moeda, quem tem o preço, a cabana em que viveria mais apertada, cabanas demais em obra); **c14** a tela só lê; **c15** o mundo: anos de salto com o verificador a cada dia — nenhuma casa de várias famílias fica com o dobro além da paciência e da vez; **c16** o par que chega depois da obra marcada (L-719, L-972). As sabotagens: `qa/patch3/sab-H.py` (28). |

E, na lista dos `*-inv.js`: `casa-cheia-inv.js` — as regras H1 a H6 da casa cheia (a obra das mãos de uma família: cabana, com dono
da família, só a família nela, o que separou; não conta nas obras pagas; a casa de várias famílias com o dobro e a estrada aberta) e
o que a ida e volta do save confere (a marca das mãos, o dia da poupança).

## 5. As entradas do `regress.sh` (fase «fundacao», na linha dos Bairros Vivos)

```
F casa-cheia casa-cheia.js;
```

(em Node, sem navegador; ≈ 80 s.) E no `CLAUDE.md` (protocolo, item 3): «Mexeu em quem não cabe na casa (`act-casa.js` — `K.plan`,
`K.road`, a casa dada, a cabana das mãos, `K.handsTask` —, o `buildTask` e o `workTask` do `villagers.js`)? Também `node
qa/casa-cheia.js` (80 s) e `node qa/casa.js`.»

## 6. As regras novas do `guard.js` (77 e 78, prontas para colar)

```js
// 77. "a obra das mãos de uma família é do act-casa.js" (D-222): a marca de que uma casa em obra é levantada pela própria família
// (b.encomenda.maos) só o js/act-casa.js escreve; o js/villagers.js a deixa de fora dos construtores do povo (o buildTask) e
// pergunta por ela no dia de trabalho de cada um (o workTask → G.Casa.handsTask) — sem a primeira linha os construtores a tomam,
// sem a segunda ninguém a levanta
for (const f of files) if (f !== 'act-casa.js') src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/encomenda\.maos\s*=(?!=)|encomenda\s*=\s*\{[^}]*\bmaos\s*:/.test(c)) fails.push(`obra das mãos: ${f}:${k + 1} escreve a marca da obra das mãos de uma família fora de act-casa.js (D-222): ${l.trim().slice(0, 110)}`); });
{ const L = (src['villagers.js'] || []).map(l => l.replace(/(^|\s)\/\/\s.*$/, ''));
  if (!L.some(l => /b\.encomenda\s*&&\s*b\.encomenda\.maos\)\s*continue;/.test(l))) fails.push('obra das mãos: villagers.js sem a linha do buildTask que deixa a obra das mãos de uma família de fora dos construtores do povo (D-222)');
  if (!L.some(l => /G\.Casa\.handsTask\s*\(/.test(l))) fails.push('obra das mãos: villagers.js sem a pergunta do dia de trabalho ao G.Casa.handsTask (D-222)'); }
// 78. "a estrada lida não escreve" (D-223): as portas de leitura da casa cheia — K.spare, noHands, K.road, K.roadSays, K.fullSays
// e K.can, no js/act-casa.js — são pedidas pelo diário, pela ficha da casa e pela oferta do corpo, de fora do passo do mundo: não
// buscam lote (a busca sorteia e guarda o dia sem lugar), não fundam, não movem nem pagam, não marcam casa nenhuma
{ const L = src['act-casa.js'] || []; const bad = /findSite\s*\(|startProject\s*\(|addBuilding\s*\(|removeBuilding\s*\(|\bD\.(move|make|use|store)\s*\(|\.(poupa|dono|encomenda|aluga|custo|home|res|maos|chao)\s*=(?!=)|\bG\.(R|rr|ri|pick|chance|shuffle)\s*\(|\b(cede|raiseByHand|lease|buy|raise|move|pay)\s*\(/;
  for (const st of [/^  K\.spare = function/, /^  function noHands\(/, /^  K\.road = function/, /^  K\.roadSays = function/, /^  K\.fullSays = function/, /^  K\.can = function/]) {
    const a = L.findIndex(l => st.test(l)); if (a < 0) { fails.push(`a estrada só lê: act-casa.js sem ${st} — a regra 78 não acha a porta`); continue; }
    let z = a + 1; while (z < L.length && !/^  \};?$/.test(L[z])) z++;
    for (let k = a; k < z; k++) { const c = L[k].replace(/(^|\s)\/\/\s.*$/, ''); if (bad.test(c)) fails.push(`a estrada só lê: act-casa.js:${k + 1} escreve no mundo dentro de uma porta de leitura (D-223): ${L[k].trim().slice(0, 110)}`); } } }
```

Conferidas contra o `js/` do ramo com os mesmos padrões, em Python (`scratchpad/ag/H/regras.py`): nenhuma acusação no ramo; linhas
plantadas em memória acusadas — `b.encomenda = { …, maos: 1 };` no `social.js`, `b.encomenda.maos = 0;` no `village.js`, o
`villagers.js` sem a linha do `buildTask`, sem a pergunta do `workTask`; `h.poupa = {…}` dentro do `K.road`, um `findSite` dentro do
`K.fullSays`, um `D.move` dentro do `K.can` —; um comentário com `b.encomenda.maos = 1` no `ui.js`, não. A primeira versão do padrão
77 (`maos:` em qualquer lugar) acusava o `act-pesca.js` e o `audio-src.js` («pescar com as mãos»): ficou a de cima. **Não rodei o
`guard.js` com as regras coladas** (não edito o `guard.js`).

## 7. As frases do CLAUDE.md (a fundação nova)

- **Quem não cabe e não tem o preço — `G.Casa.road` / `G.Casa.handsTask` / `G.Casa.spare`** (`js/act-casa.js`, D-220 a D-224): a
  casa acima da lotação são duas — a de várias famílias, onde há quem saia, e a da família sozinha maior que a casa que tem, onde
  não há. Para a primeira, num povo de moeda, a família que o dia da cidade pergunta (`K.queue`: a mais moça, D-098) e que não tem
  o preço tem duas estradas, lidas por uma porta só (`K.road(v)`: `cede`, `maos` e em quantos dias, ou o porquê de não haver):
  **a casa vazia do povo, dada** no mesmo dia pelo que a família tem além do pouco que guarda (`K.KEEP`), pelo livro — o plano
  (`K.plan`) toma a casa vazia com camas para todos ou, para quem divide a casa com outra, onde viveria sem ficar mais apertado; a
  família sozinha só toma uma casa com mais camas, e deixa a sua ao povo —; e **a cabana das próprias mãos**, depois de
  `K.HANDS_DAYS` dias juntando sem o preço: a marca é `b.encomenda.maos`, que só o `act-casa.js` escreve (o `guard.js` cobra, regra
  77); os crescidos da família a levantam pelo dia de trabalho de cada um (`G.Casa.handsTask`, perguntado pelo `workTask`), os
  construtores do povo nunca (o `buildTask` a pula); a madeira sai do armazém do povo pelo livro e só com a sobra de pé
  (`G.Casa.spare`: sem a dos navios nem a que as outras cabanas esperam); o lote é o do planejador, na metade barata da cidade; uma
  por cidade (`K.MAX_HANDS`), fora das duas obras pagas; sem mãos crescidas da família, passa aos construtores. **Uma casa por
  família, por qualquer porta** (`K.waiting`, L-719): a obra das mãos é uma encomenda como as outras, e a família de uma encomenda é
  a de agora — os escritos e o par que veio morar com um deles (`famNow`: trabalha nela e muda junto, L-972). O diário, a ficha da
  casa (`K.fullSays`) e a oferta do corpo dizem a estrada com a causa e só leem (regra 78). O dia nunca decide pela família do
  corpo. Estrada nova de moradia: uma entrada no `K.road` e a sua frase no `K.roadSays` e no `K.fullSays`. `qa/casa-cheia.js` prova.

## 8. As provas e as sabotagens (o que rodei, com o código final do ramo)

**`qa/casa-cheia.js`** (`node casa-cheia.js [mundo]`; os casos c1 a c16):

| mundo | resultado |
|---|---|
| cidade (o padrão; `ANOS=6`) | **102 passam, 0 falham** (82 s) |
| metrópole (`ANOS=4`) | **101 passam, 0 falham** (≈ 10 min, com a máquina ocupada por outros agentes) |
| mega (`ANOS=4`) | **101 passam, 0 falham** (≈ 6 min) |

O c15 na «cidade» (6 anos de salto, o verificador a cada dia): nenhuma regra da casa cheia acusada; nenhuma casa de várias famílias
com o dobro além de 0 dias; 3 casas dadas pelo povo. Na metrópole (4 anos): nenhuma regra acusada; 980 casas-dia, 13 de
várias famílias com o dobro, e a que mais durou assim, 2 dias (a house#25751 de Cápua, 14 para 6, desde o dia 58 — o dia zero
herdado do mundo pronto); 5 casas dadas pelo povo, nenhuma cabana das mãos. Na mega (4 anos): nenhuma regra acusada; 511 casas-dia,
3 de várias famílias com o dobro, a que mais durou, 1 dia (a house#17141 de Tebas, 12 para 6, desde o dia 50); nenhuma casa dada, 2
cabanas das mãos.

Duas coisas que só a mega mostrou, e que mudaram a prova (não a regra):

- **a cidade refaz a cabana das mãos em casa logo que ela fica de pé** (o `improve` do planejador: a cabana mais velha da cidade
  vira casa no lugar, `b.upgradeFrom`, com a família dentro) — «de pé em 68 s (a cidade já a refaz em casa, com a família
  dentro)». A prova conta como de pé a cabana que já entrou em reforma (`dePe`), e só conta estranhos na obra e linhas do livro
  enquanto ela é a obra da família (até a linha «obra-feita»);
- **a cabana de um adulto só leva dias do mundo** (T-980): o c7d — morto quem marcou a obra, o par a acaba sozinho — falhava na
  mega com a cabana a 80% no fim dos 600 s que a prova dava. Agora a prova vive os dias do mundo como eles são e dá a esse caso
  2 000 s: de pé em 478 s na mega, 271 s na «cidade», 303 s na metrópole.

**As sabotagens** (`bash sab-run.sh <jogo> sab-H.py <nome> casa-cheia.js <casos> <saída>`, cada uma numa cópia nova do jogo, na
«cidade»; 28 de 28 acusadas — o primeiro caso que acusou; rodadas de novo, todas, com a prova final, a que vive os dias do mundo):

| | o que desfaz | casos | quem acusou |
|---|---|---|---|
| s1 | o plano de antes: a casa vazia só com camas para todos | c1 | c1b «o plano: NÃO a toma» |
| s2 | a casa vazia do povo não é dada | c2 | c2c «0 de 7 da família moram na house#2240», c2d, c2e |
| s3 | dada de graça | c2 | c2b «por 0 (o que passa das 2 que guarda: 3,25)», c2d |
| s4 | a família paga tudo, sem guardar | c2, c4 | c2b «por 5,25», c2d, c4g |
| s5 | sem a troca | c3 | c3e «a house#2271 ficou COM DONO» |
| s6 | sem paciência | c4 | c4b «em 0 dia(s)», c4c «a obra: hut#5459» |
| s7 | sem as mãos | c4 | c4f «nenhuma obra para Sitamun» |
| s8 | os construtores pegam a obra da família | c5 | c5d «de fora da família: Ahmose (construtor), Ankhesen (construtor)», c5e |
| s9 | o dia de trabalho não pergunta pela obra | c5 | c5c «no tempo do caso a obra ficou em 0% … na obra: ninguém» |
| s10 | a obra das mãos conta nas pagas | c5 | c5b «os construtores RECUSAM» |
| s11 | a cabana em qualquer chão | c4 | c4h «a busca do lote NÃO pediu a metade barata» |
| s12 | a madeira dos navios conta como sobra | c9 | c9c «a sobra é 25 … a obra: COMEÇOU» |
| s13 | a madeira que as outras cabanas esperam conta | c4 | c4i «40 antes, 40 com a cabana esperando 10» |
| s14 | sem madeira, começa assim mesmo | c9 | c9b «a obra: hut#5459», c9c |
| s15 | a obra sem mãos fica órfã | c7 | c7e «CONTINUA das mãos da família», c7f (a regra H1) |
| s16 | morto quem marcou, a obra sem dono | c7 | c7b «é de ninguém», c7c (a regra H1) |
| s17 | a família sozinha também levanta | c13 | c13b |
| s18 | sem teto de cabanas em obra | c13 | c13g «a obra: hut#5459» |
| s19 | a cabana também para quem ficaria mais apertado | c13 | c13f «a estrada «maos»; a obra: hut#5459» |
| s20 | o dia decide pela família do corpo | c11 | c11c «a obra: hut#5459», c11d |
| s21 | a estrada lida escreve | c14 | c14b «o mundo MUDOU» |
| s22 | o save perde a marca das mãos | c6 | c6c («maos»: 0 depois do load), c6d «de fora da família na obra: 2» |
| s23 | o povo sem moeda vai pela estrada nova | c13 | c13d «a estrada «maos»» |
| s24 | a falta de chão não é guardada | c10 | c10b «o dia sem chão: undefined», c10c |
| s25 | a casa vazia espera a paciência | c12 | c12c «a família mora na house#2204» |
| s26 | a pergunta de antes da L-719 | c16 | c16c «com moedas, pedindo: «ENCOMENDOU»» |
| s27 | o par que chegou depois não trabalha | c16 | c16d «Sneferu: NÃO foi visto, 0 carga(s)» |
| s28 | só muda quem estava escrito | c16 | c16e «Sneferu na house#2204» |

**As provas vizinhas** (no ramo, com o código final; a base é a ponta do líder `3f6f663`):

| prova | no ramo | na base |
|---|---|---|
| `casa.js` | 24 passam, 0 falham | — |
| `casa-rica.js` (com o r9 do líder) | 54 passam, 0 falham | — |
| `aluguel-poupa.js` | 4 passam, 0 falham | — |
| `morar-palacio.js` | 108 passam, 0 falham | — |
| `fundadores.js` | 6 passam, 0 falham | — |
| `relento.js` | 4 passam, 0 falham | — |
| `compras.js` | 19 passam, 0 falham | — |
| `casa-mercante.js` | 8 passam, **1 falha: k2** (T-973: a dona da bandeira morre em guerra no dia do caso; `ONLY=k2` passa na metrópole e na mega) | 9 passam, 0 falham |
| `lar.js` | 23 passam, **3 falham: l2** (T-974: quem espera morre de velhice no meio), l16 e l16b (T-688, iguais à base) | 24 passam, 2 falham: l16, l16b |
| `matriz-predios.js` | 1 falha: «moradia/cear … peça mesa» | a mesma (T-979) |
| `guard.js` | PASSOU (156 arquivos) | — |
| vida curta (`soak.js 103 continente 128 4 normal 5 1 1`, no navegador) | 5 anos, violações 0, erros: nenhum | — |
| `det3.js 77 arquipelago 96 3 2` (no navegador) | PASSOU: a geração, A × B, A × C e D iguais | — |

Não rodei: a regressão inteira, a prova de desempenho, o `prontos.js`, o `junta-inv.js` (as regras só entram no `qa.js` pela junção
do líder), o `oldsave.js` e o `corrupt.js` (o save não mudou de forma: as marcas novas são campos dentro de objetos que o save já
leva; um save de antes não as tem, e a regra lê a falta como «não»).

## 9. As linhas em arquivos de outros agentes (exatamente onde)

`js/villagers.js` (o `decide` é do agente F; o repartidor de ofícios, do X — não toquei em nenhum dos dois):

1. no `buildTask`, logo depois de `if (b.built || b.set !== v.set || b.type === 'ruin') continue;`:
   ```js
   // (a hut a family raises with its own hands is the family's to raise, never the people's builders': its grown ones come
   // to it by their own door — G.Casa.handsTask, act-casa.js, D-222)
   if (b.encomenda && b.encomenda.maos) continue;
   ```
2. no `workTask`, depois da linha da carga com destino (`G.Act.resumeCarry … holdCarry`) e antes do bloco `if (v.carry && v.carry.k
   !== 'water') {`:
   ```js
   // (a family raising its own hut with its hands works on it before the trade of the day — a load in the hands to its
   // place first: act-casa.js, D-222)
   if (!v.captive && G.Casa && G.Casa.handsTask) { const t = G.Casa.handsTask(v); if (t) return t; }
   ```

O merge do ramo do líder (as 6 linhas do agente F no mesmo arquivo) entrou sem conflito. `js/village.js`, `js/city.js`,
`js/act-servicos.js`, `js/act-lazer.js`: nada.

## 10. O que ficou aberto

- **A família sozinha maior que a casa que tem** (T-975): a maior parte das casas «acima da lotação» do mundo novo, e o dobro da
  «cidade». Pede decisão: a reforma pelas próprias mãos (cabana → casa, no lugar) gasta pedra.
- **O solteiro e a casa vazia do povo** (T-976): o `assignHousing` não mudou.
- **O povo sem moeda sem madeira** (T-977).
- **A madeira média** um pouco abaixo na metrópole e na mega, sem causa provada (T-978).
- **As provas vizinhas frágeis** que falham no ramo por um sorteio do mundo: `casa-mercante.js` k2 (T-973), `lar.js` l2 (T-974) —
  não as editei.
- **As regras 77 e 78** não foram rodadas dentro do `guard.js`; **as regras do verificador** (`qa/casa-cheia-inv.js`) só entram no
  `qa.js` pela junção (`junta-inv.js`).
- **Os mundos prontos** precisam ser gerados de novo (T-979); a tabela do líder no AUDIT («17 de 184…») é da geração 19.
