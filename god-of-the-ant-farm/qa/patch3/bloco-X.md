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

**RODANDO AGORA: a fila A** (`fila-a.sh <jogo> scratchpad/ag/X/fila4`): a prova inteira (`fila4/prova.txt`) e as outras
provas (`fila4/provas/resumo.txt`). **Depois dela, a fila B** (`fila-b.sh <jogo> scratchpad/ag/X/fila4 v5`): a economia
com a regra final em dez sementes (`eco2/v5-<semente>.txt`; a tabela: `python3 tabela.py eco2 antes v5 103 7 2024 11 42 555 9
31 77 314`), as trocas num mundo do zero antes e depois (`fila4/mede-*-zero.txt`), os mundos prontos dez dias antes e depois
(`fila-prontos/pronto-antes-*.txt`, `fila4/pronto-depois-*.txt`) e as 29 sabotagens de novo (`sab-out/resumo.txt`).
**Enquanto uma fila roda, o `js/` e o `qa/*.js` da árvore não podem mudar.** A economia medida até aqui (dez sementes, a
tabela `eco2/tabela-v3.md`) é a da regra do commit `25b9f11`, de antes do dia da fundação e da vaga na hora.

**Falta (nesta ordem):**
1. ler os resultados da fila A; consertar o que uma prova acusar (causa, não sintoma) e anotar aqui; guard; commit;
2. a fila B; ler; se a economia `v5` custar gente ou comida, ajustar;
3. fechar este bloco: as seções 4 a 10 estão escritas em `qa/patch3/bloco-X-fim-rascunho.md` — faltam os números finais
   (ECO_RESUMO, PRONTO_RESUMO, ANTES_ZERO, ECO_FOME), o achado da guerra no texto do D-211 (os ofícios da emergência seguem o
   instante nos dois sentidos; uma emergência dá mãos a outra; o puxado mandado a um terceiro ofício segue com o ofício a que
   volta), no D-210 o dia da fundação, a vaga na hora e a cidade sem memória que começa do que tem, o T-954 e as sabotagens
   s28, s29, s30 (e as novas do dia da fundação e da vaga); juntar tudo no `bloco-X.md` e apagar o rascunho;
4. o último commit (a árvore limpa) e o relatório final.

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
