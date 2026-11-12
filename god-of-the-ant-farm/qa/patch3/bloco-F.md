# Bloco do agente F — a freguesia (os banhos, a biblioteca, a praça; L-717)

> **Estado: EM CURSO** (este arquivo é mantido em dia a cada passo; o que está dito «passa» foi rodado nesta árvore).
> Ramo `worktree-agent-a4d17534a654b4869`, sobre o `b2b61f0` (a árvore nasceu no `main` e foi avançada para a ponta do ramo
> do líder com `git merge --ff-only b2b61f0`, antes de qualquer mudança).
> Números reservados: L-910 a L-929, T-910 a T-929, D-200 a D-204; regras 69 e 70 do guard.
> Usados até agora: D-200, D-201 (ver o item 1). Rascunho e medidas: `scratchpad/ag/F/` (`antes/`, `depois/`).
> **Não toquei** em `city.js`, `village.js`, `interiors.js`, `polity.js`, `urban.js`, nem em nenhum arquivo compartilhado.

## 0. O andamento (para quem retomar)

**Feito e rodado:**
- as medidas de antes (item 7), na base limpa (`git archive b2b61f0` em `scratchpad/ag/F/base/`);
- a vontade do banho (`G.Termas.urge` / `go` / `pick` / `wish` / `lot` / `hourOf`, `js/act-servicos.js`) e a da leitura
  (`G.Biblioteca.urge` / `go` / …, `js/act-lazer.js`), as duas linhas no `decide` e as duas no `start` do `js/villagers.js`;
- um banho por dia e um rolo por dia também pelo passeio (`Te.visit`, `Bi.visit`);
- as regras do verificador (`qa/freguesia-inv.js`) e a prova (`qa/freguesia.js`): **as 23 linhas passam** (a, b, i, c, d,
  e1 a e5, h). O que a prova ensinou no caminho: o dia do mundo não tem um número fixo de segundos vividos (uma cena que
  se demora atrasa o relógio, `main.js`: o primeiro dia da metrópole dura 306 s) — todo caso acaba pelo dia e pela hora
  do mundo; e a metrópole pronta entra em guerra no segundo ou no terceiro dia, por uma história que um fio muda — os
  dias vividos da parte `b` e o salto da `i` são na paz do deus (o poder do jogo, `G.Politics.divinePeace`), e a guerra é
  o caso `e3`;
- o guard passa (156 arquivos); a vida curta (`soak 103 continente 128 4 normal 5 1 1`): 5 anos, nenhuma violação.

**Em curso:** as 30 sabotagens (`scratchpad/ag/F/sab-todas.sh` → `scratchpad/ag/F/sab/*.txt`, o resumo em `depois/sab-1.txt`).

**Falta (nesta ordem):**
1. as provas vizinhas (`scratchpad/ag/F/viz.sh`: `termas`, `termas-mao`, `termas-grandes`, `lazer`, `lazer-mao`, `saber`,
   `tempo-livre`, `lar`, `atividades`, `invariancia.js`; e o `det3` no navegador), no ramo e, as que falharem, na base;
2. as medidas de depois na mega e nos mundos do zero (duas sementes, 30 anos; `scratchpad/ag/F/producao.js`) — a
   metrópole já está medida (item 7);
3. a praça e o mercado ao fim da tarde (o item 4 da tarefa): **não começado**; o desenho está no item 6;
4. o guard e a vida curta de novo antes do último commit.

## 1. Linhas do AUDIT (Bairros Vivos)

| L-717 | bug (consertado nos Bairros Vivos, F) | **Ninguém ia aos banhos** (a linha de antes fica; acrescentar:) **Correção:** o banho e a leitura são uma vontade de cada um, escolhida entre as outras do dia (`villagers.js`, `decide`: os tipos `'banho'` e `'ler'`, ao lado da taverna e do teatro — `G.Termas.urge` / `go`, `G.Biblioteca.urge` / `go`), com causa (D-200, D-201). Medido na metrópole pronta, os mesmos dias: de 0 banhos em 20 dias-de-banhos para 13 e 12 por dia em Mênfis (até 12 na água de uma vez), 6 e 10 em Tebas, 1 e 2 em Roma, 1 por dia em Tenochtitlan (o Temazcal tem um lugar só na água); as leituras de 0 para 1 a 3 por dia em cada biblioteca. Prova: `qa/freguesia.js`. *(as sabotagens: por rodar)* |
| D-200 | decisão (F: `act-servicos.js`, `villagers.js`) | **A vontade do banho.** *Quem:* todo adulto de uma cidade com banhos, uma parte dos dias (`Te.wish`): 0,30 — 0,50 num povo da terma (o romano, o grego, o clássico: o hábito) —, mais 0,25 no ofício sujo (mineiro, ferreiro, oleiro, construtor, estivador, lenhador), mais 0,15 na casa de nobre ou de mercador, mais 0,15 para o cansado (energia abaixo de 50); o doente que está de pé, todo dia (o banho quente tira uma parte da doença: é o efeito que o banho já tinha; o de cama com febre fica na cama). *Menos:* quem mora longe (a casa a mais de 10 casas dos banhos: a vontade cai com a distância, até um quarto dela a 40 casas) e a água fria (a metade: sem fogo na fornalha o banho vale menos). *Quando:* nas horas dos banhos (0,25 a 0,70), cada um a partir da sua hora (pelo `G.hash` da pessoa: o velho, o nobre e o doente da manhã — 0,27 a 0,43 —; quem trabalha, do começo da tarde — 0,38 a 0,46: o banho é o fim de um dia de trabalho mais curto), e só com tempo de andar até lá, despir-se e ter meio banho antes de fechar; quem está longe sai mais cedo. *Quanto:* se hoje é dia de banho é a sorte do dia de cada um (`Te.lot`: o `G.hash` da pessoa e do dia, abaixo da vontade) — **nenhum sorteio do acaso do mundo, nenhum campo novo na pessoa** —, e um banho por dia (`v.bathDay`, que o banho já escrevia; vale também para o passeio: `Te.visit`). *O que impede:* a casa sem moeda para a entrada, os banhos cheios (quem está a caminho conta), mais de 30 casas a andar, a fome (acima de 55), o cansaço de cama (abaixo de 25), uma carga nas mãos ou a perna de uma operação (D-094), os pequenos para cuidar, uma tarefa em curso que pese tanto quanto o banho (0,4: o banho nunca corta um trabalho; começa quando a tarefa acaba); **nunca o corpo do deus**. A vontade vale 0,75 (o trabalho de um dia vale 0,55), 0,90 a do doente; a caminho ou lá dentro vale 1 (só a fome e o sono tiram alguém do banho). **As crianças não vão** (o `decide` dos adultos; ir com o pai ou a mãe fica aberto). |
| D-201 | decisão (F: `act-lazer.js`, `villagers.js`) | **A vontade de ler.** *Quem:* num povo com a escrita, o curioso (0,40 dos dias), a gente das letras — o sacerdote, o escriba — (0,30), a casa de nobre ou de mercador (0,25); somam; **quem não é nenhum deles não lê**. Menos quem mora longe (como nos banhos). *Quando:* nas horas da biblioteca (0,28 a 0,72), cada um a partir da sua hora na manhã dela (0,29 a 0,36), com tempo de andar e ler um rolo inteiro antes de fechar. *Quanto:* a sorte do dia de cada um (`Bi.lot`, sem acaso do mundo), um rolo por dia (`v.readDay`; vale para o passeio). *O que impede:* as mesas cheias (quem vem a caminho conta), a distância, a fome, a carga, os pequenos, uma tarefa de peso; nunca o corpo do deus. A leitura que passa do que a biblioteca conta no dia (8; 16 na grande) não soma à pesquisa — quem lê, lê para si. |

*(D-202 a D-204, L-910…, T-910…: por escrever — a praça; o Temazcal de um lugar; a terma longe do meio da cidade; a chave «noite» dos banhos.)*

## 2. Linhas do README das provas

| `freguesia.js` | `[ONLY=a,b1,c,…] [DIAS=3] node freguesia.js [metropole\|mega]` (≈ 5 min inteira; a parte `a` em 5 s) | A freguesia dos banhos e da biblioteca (L-717, D-200, D-201), em Node. **a** a regra, sem viver: o que impede (19 impedimentos, cada um zera a vontade), quem quer mais, a sorte do dia (espalhada por igual, sem acaso do mundo, a mesma dentro e fora do passo), a biblioteca. **b** três dias vividos no mundo pronto sem a mão da prova: os banhos por dia e por cidade, ninguém duas vezes no dia, a entrada pelo livro-razão, ninguém chamado dormindo, com carga ou sendo o corpo, quem mora longe vai menos, as leituras por dia, a vida do bairro, o verificador. **c** os banhos, as termas e as grandes termas no mesmo lote de uma cidade de um povo da terma com 260 pessoas (trazidas pela mão da prova): as maiores enchem mais. **d** a grande biblioteca com leitores. **e** um save no meio de um banho e de uma leitura carregado duas vezes; quem morre a caminho e na água; a cidade em guerra; o povo sem moeda; o deus derruba os banhos. **h** o verificador pega a mentira. |
| `freguesia-inv.js` | (carregado pela prova; o líder o junta) | As regras do verificador (sistema `freguesia`): ninguém cativo ou preso com a ida aos banhos ou à biblioteca (S2); ninguém lê num povo sem a escrita, a idade de cada porta (S2); um banho e um rolo por dia (S3); ninguém a caminho com uma carga ou dormindo (S3). |

## 3. Entradas do `regress.sh`

Na fase «fundacao», junto das provas dos ofícios e serviços (`termas-mao`, `termas`, `lazer`): `F freguesia freguesia.js;`

## 4. Regras do `guard.js` (propostas)

- **Regra 69 — a vontade não sorteia.** Em `js/act-servicos.js` e `js/act-lazer.js`, o corpo de `Te.wish`, `Te.lot`, `Te.hourOf`, `Te.pick`, `Te.urge`, `Te.go` (e os seis `Bi.` iguais) não chama `G.R(`, `G.rr(`, `G.ri(`, `G.pick(`, `G.chance(`, `G.shuffle(`, nem os do que só se vê (`G.VR`…): a sorte do dia é o `G.hash` da pessoa e do dia. Padrão: entre a linha `// ---… the wish for a bath (D-200)` e `Te.go = function` (e entre `// ---- the wish to read (D-201)` e `Bi.go = function`), nenhum `/\bG\.(R|rr|ri|pick|chance|shuffle|VR|vrr|vri|vpick|vchance)\(/`.
- **Regra 70 — o dia do banho e da leitura é de quem os dá.** `v.bathDay =` só no `js/act-servicos.js` e `v.readDay =` só no `js/act-lazer.js` (fora o `save.js`); e `G.Termas.go(` / `G.Biblioteca.go(` só no `js/villagers.js` (o `start`): ninguém manda gente aos banhos por fora da escolha de cada um.

## 5. Frases para o `CLAUDE.md`

Em «Os ofícios e os serviços», no fim:

> **A freguesia é uma vontade de cada um** (D-200, D-201): quem vai aos banhos e à biblioteca vai pela sua escolha do dia (`decide`: `'banho'`, `'ler'` — `G.Termas.urge` / `go`, `G.Biblioteca.urge` / `go`), com causa: quem (`wish`), quando (`hourOf`, com tempo antes de fechar), quanto (a sorte do dia de cada um, `lot` — o `G.hash` da pessoa e do dia, nunca o acaso do mundo — e uma vez por dia: `v.bathDay`, `v.readDay`), o que impede (a moeda, a casa cheia — quem vem a caminho conta —, a distância, a fome, as mãos ocupadas; nunca o corpo do deus). Serviço novo com freguês segue o molde; ninguém manda gente a um serviço para enchê-lo. `qa/freguesia.js` prova.

No protocolo, item 3, na linha das termas: «…e, pelo lado de quem se banha e de quem lê, `node qa/freguesia.js` (a parte `a` em 5 s: `ONLY=a`)».

## 6. O que ficou aberto / por fazer

- **A praça e o mercado ao fim da tarde** (o item 4 da tarefa): não começado. Medido antes (item 7): passa muita gente a 6 casas do meio da praça o dia todo, mas parada na praça (a 3,5 casas, sem andar) há 0 a 7 pessoas ao fim da tarde — em Mênfis (112 pessoas, sete bairros) 0,2. O desenho pensado: uma escolha do fim da tarde no `decide` (`'praca'`, `G.Praca.urge` / `go` no `act-lazer.js`) para quem mora perto de uma praça ou de um mercado (a praça das suas ruas, como a taverna do D-157), mais o sociável e o velho, e mais onde já há gente; a tarefa é a `'citylife'` que já existe. Quem mora longe descansa à porta de casa (D-157).
- **O Temazcal tem um lugar só na água** (Tenochtitlan, 79 a 125 pessoas: no máximo 3 ou 4 banhos por dia): é a planta do banho asteca (não é deste ramo).
- **A terma longe do meio da cidade**: o lote de 7 casas que a mão do deus acha junto de Argos fica a 18 casas do meio; a cidade, pela porta dela, fundou as termas a 34 (T-821). Quem está a mais de 30 casas não vai, e quem está longe perde a tarde: as termas longe ficam com menos gente. Medido na prova `c` (260 pessoas em volta do meio, a terma a 18 casas): 23 banhos no dia e até 22 na água de uma vez nas grandes termas (120 lugares), 18 e 16 nas termas (24 lugares), 8 e 8 nos banhos (8 lugares).
- **A chave da vida do bairro**: a entrada nos banhos conta como «noite» (o perfil «boêmio»: «taverna, banho e espetáculo cheios» — já era assim). Com banhistas de verdade o bairro dos banhos de Mênfis passa a ter «noite» 1,6 por célula (o perfil liga a 0,3 depois de quatro dias): os banhos sozinhos fazem um bairro «boêmio». Se o dono quiser o banho à parte (um perfil «de banhos»), é uma chave nova (`banho`) no `G.Urban.KEYS` e um perfil no `U.TAGS` — não inventei: fica proposto.
- **As crianças** não vão aos banhos nem à biblioteca pela vontade (só os de 16 anos ou mais).
- **O salto dá menos banhos que o passo**: 10 anos da metrópole no salto: 93 banhos em 43 dias de banhos (2,2 por dia e por prédio); no passo, 5 a 8 por dia de paz nos dois maiores. Por medir melhor.

## 7. As medidas

### Antes (a base `b2b61f0`, cinco dias vividos, ninguém mandado) — `scratchpad/ag/F/antes/`

**Metrópole** (do dia 58 ao 63): 0 banhos em 20 dias-de-banhos (Tenochtitlan, Roma, Mênfis, Tebas), 23 de lenha queimada (0,6 a 2,0 por dia e por prédio); 1 banho pedido em cinco dias (74 passeios pedidos). Bibliotecas (Argos, Tenochtitlan, Tebas): 0 leituras.
**Mega** (do dia 50 ao 55): 7 banhos em 14 dias-de-banhos (Mênfis 5, Hedeby 1, Kaupang 1), 20 de lenha; 24 banhos pedidos pelo passeio, 11 aceitos. Bibliotecas: 1 leitura em cinco dias (Kaupang).
**A praça e o mercado** (a média de pessoas a 6 casas do meio / paradas a 3,5 casas, a soma dos da cidade), às 0,60, 0,65 e 0,70 do dia — metrópole: Argos praça 10,4 (3,2) · 11,3 (6,6) · 2,7 (0,2); Mênfis praça 9,5 (0,2) · 6,7 (0,2) · 3,2 (0,2), mercado 10,6 (1,2) · 8,8 (0,5) · 4,7 (0,4); Roma praça 6,8 (0,7) · 5,7 (0,6) · 3,3 (0,3); Tenochtitlan praça 15,6 (0,8) · 11,8 (0,6) · 7,2 (0,8); Tebas praça 18,0 (2,3) · 15,4 (2,1) · 5,8 (0,8). A tabela inteira, hora a hora: `antes/mede-metropole.txt`, `antes/mede-mega.txt`.
**Dez anos da metrópole no salto**: 704 → 619 pessoas; comida produzida 13 348, madeira 2 361, pedra 1 333; mortes: fome 4, doença 5, velhice 18, todas 256 (a guerra dos dias 60 a 62); banhos: 34 dias abertos, 3 banhos, 53 de lenha; 0 leituras.

### Depois (o ramo, com a vontade) — `scratchpad/ag/F/depois/`

**Metrópole, quatro dias vividos** (`bare.js`, sem observador): Mênfis 13, 12, 1, 7 · Tebas 6, 10, 3, 6 · Roma 1, 2, 0, 3 · Tenochtitlan 1, 1, 0, 1 (o terceiro dia, o 60, é de guerra: as quatro cidades em armas). Até 12 na água de uma vez em Mênfis, 10 em Tebas. Leituras: Argos 3, 0 · Tenochtitlan 2, 1 · Tebas 2, 0, 1.
**Por pessoa e por dia** (três dias, 625 pessoas-dia): quem mora a até 16 casas dos banhos 12 %, mais longe 4 %; o ofício sujo 13 %, os outros sãos 7 %.
**Dez anos da metrópole no salto**: 704 → 635 pessoas; comida 12 454 (−7 %), madeira 2 662 (+13 %), pedra 1 898 (+42 %); mortes: fome 8, doença 2, velhice 15, todas 226; banhos: 43 dias abertos, 93 banhos, 40 de lenha; 23 leituras. *(Uma rodada só de cada lado, e a guerra corre diferente nas duas: as diferenças de madeira e pedra mostram o tamanho do ruído. Falta repetir com várias histórias e nos mundos do zero.)*

## 8. O que rodei, e o que deu

| Prova | Resultado |
|---|---|
| `node qa/guard.js` | PASSOU (156 arquivos) |
| `node qa/freguesia.js` (4 min 50 s) | 21 passam, **1 falha** (b1 — defeito da prova, em curso) |
| `ONLY=a node qa/freguesia.js` (5 s) | 5 passam |
