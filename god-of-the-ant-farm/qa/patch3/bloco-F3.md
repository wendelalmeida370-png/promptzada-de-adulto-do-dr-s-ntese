# Bloco F3 — a terceira rodada da freguesia: o dia de cada um dura até a hora de deitar (D-240, L-915)

Agente F, terceira rodada. Números reservados: L-915 a L-919, T-940 a T-949, D-241 a D-244 (a D-240 é a decisão do
líder: o texto dela está no §7); regras do guard 62 e 63. Os blocos `bloco-F.md` e `bloco-F2.md` ficam como estão.

**As bases, exatas.** Os commits da rodada, no ramo `worktree-agent-a4d17534a654b4869`: `74d8510` (o passo do dia e o
descanso, sobre a `6921b8c`), `1a8a64a` (o merge da `int20` em `580a920`), `083ba61` (a prova, a guarda do trabalho, as
duas provas vizinhas) e `7797396` (o merge da `int20` em `8490aa9`); o commit do bloco por cima. **As medidas de antes e
depois (§3, §4) são da `580a920` (antes: uma cópia da árvore fora do repositório) contra a `580a920` com o código desta
rodada (depois).** As provas finais, as sabotagens e as vizinhas (§5 a §7) são da árvore juntada `7797396` (`8490aa9` com
esta rodada).

**Estado.** As duas mudanças feitas, com prova (`qa/dia.js`, `qa/dia-inv.js`), sabotagens e medidas:

1. **L-915** — o sol que se demora segura também a fome e o cansaço: uma porta só para o passo do dia (`G.dayPace`,
   `G.pace`), pedida uma vez por passo.
2. **D-240** — quem descansa cansa menos: `G.Vg.resting(v)`, uma tabela só, `G.Vg.REST = 0,2`.

**O alvo, dito sem rodeio:** o adulto do alvo — acorda, trabalha até o fim da tarde, depois descansa — chega à hora de
deitar do relógio dele com 24 de energia e fica à mesa até a taverna fechar com 23 (`qa/dia.js` a4, pela mão; a conta no
§2). **No mundo vivido o alvo não se alcança só com o descanso**: a gente deste mundo descansa 6 centésimos do dia por
adulto (a andar, 45; no §4 o porquê), e às 0,70 ainda 13% a 33% dos adultos dormem ou vão dormir pelo cansaço (eram 23% a
55%); às 0,66, 5% a 10% (eram 22% a 42%). Não inventei outra alavanca: o §4 diz o que medi e o que proporia.

**Os três itens que o líder juntou no caminho:**

- **`freguesia` b1 (Tebas 0, 4, 8, 9)** — não era o dia pela metade nem a fornalha: **uma tempestade das 0,42 até
  depois de fechar**, com 16 a caminho dos banhos de volta para casa. Limite da prova, consertado nela sem afrouxar o
  que o caso afirma (T-943, §6).
- **`visual/termas-corpo.js` 2 (a fornalha não está livre para o corpo)** — o lugar da fornalha é do foguista de posto
  (D-227; um lugar, uma pessoa: D-085), e só o foguista tem a oferta de alimentar o fogo: o caso diz isso e prova o lugar
  livre com o foguista fora do posto (T-944, §6).
- **«A praça corta a caminhada de quem ia à taverna»** — **não corta**: medido nos dias vividos, 0 de 138 idas à taverna
  (antes) e 0 de 197 (depois) acabaram na praça; a ida à taverna pesa 0,5, o caminho de casa e a praça 0,45, e a vontade
  da praça é zero para quem tem um afazer de 0,45 ou mais. O que tirou das mesas a gente do `som` s5a foi **uma
  tempestade** (68 de 111 mandados: «shelter», 1,05) e a hora de deitar (23): rastro no §6 (T-945). Nenhum conserto no
  jogo.

Os arquivos mexidos:

| arquivo | o quê |
|---|---|
| `js/world.js` | **nove linhas** depois do `G.DAY_K`: `G.LINGER`, `G.dayPace`, `G.pace` e o gancho que o repõe (§1) |
| `js/main.js` | **o `tick`**: a linha do relógio do dia vira duas (`G.pace = G.dayPace(); S.time += dt / G.DAY_LEN * G.pace;`) e o comentário (§1) |
| `js/villagers.js` | o bloco do descanso antes do `needs` (`Vg.REST`, `REST_TASK`, `LAR_WORK`, `REST_USE`, `Vg.resting`); no `needs`, `dn = dd * G.pace`, a fome e a energia por `dn`, e `* (Vg.resting(v) ? Vg.REST : 1)` na queda de quem está acordado |
| `qa/dia.js`, `qa/dia-inv.js` | novos: a prova e as regras do verificador (o sistema «dia») |
| `qa/freguesia.js` | o b1: o dia que a tempestade levou (T-943) — as linhas no §8 |
| `qa/visual/termas-corpo.js` | o caso 2: a fornalha e o posto (T-944) — as linhas no §8 |

Nada novo na pessoa, nada novo no save, nenhum sorteio. Não mexi no cansaço do trabalho (100/80 por centésimo do dia) nem
nos limiares do sono (22 e 15), nem em `CLAUDE.md`, `AUDIT.md`, `README.md`, `regress.sh`, `guard.js`, `qa.js`,
`junta-inv.js`, `linha-de-base.txt`, `PLANO.md`, `worlds/`.

---

## 1. O desenho

### L-915 — o passo do dia (`js/world.js`, `js/main.js`, `js/villagers.js`)

Enquanto uma cena corre (`G.Scene.lingers()`: alguma cena das histórias com `st === 'run'`), o relógio do dia anda a
0,35 — «uma cena de noite não acaba no meio». Só o relógio andava assim: o `needs` contava a fome, o cansaço e o sono em
segundos (`dt / G.DAY_K`), e uma tarde com cena custava perto de três vezes a energia das horas dela.

```js
// js/world.js
G.LINGER = 0.35;
G.dayPace = () => (G.Scene && G.Scene.lingers && G.Scene.lingers() ? G.LINGER : 1);
G.pace = 1;
G.worldHooks.push(() => { G.pace = 1; });
// js/main.js, tick
G.pace = G.dayPace();
S.time += dt / G.DAY_LEN * G.pace;
// js/villagers.js, needs
const dd = dt / G.DAY_K; const dn = dd * G.pace;   // a fome, a energia de quem está acordado e o sono: por dn
```

- **Uma porta, uma pergunta por passo.** Só o `tick` pergunta (`G.dayPace()`), e quem vive o passo lê o `G.pace`: 200
  perguntas ao `G.Scene.lingers` em 200 passos, com 705 pessoas no mundo (`qa/dia.js` s3). No salto o `tick` roda nos
  dois meios passos rápidos (`fine`), e as pessoas vivem logo depois dele, no mesmo meio passo: o `G.pace` que o `needs`
  lê é o do relógio daquele meio passo.
- **O que vai com o dia e o que fica em segundos (D-241).** Com o passo do dia: a fome (acordado e a dormir), a queda
  da energia de quem está acordado e o que o sono devolve. Em segundos, como sempre: a idade (`v.age += dt / day` — a
  pedido), a doença e a imunidade, a vida que a fome e a doença tiram, a devoção, o medo, os relógios dos gestos e das
  tarefas, o nado (`v.energy -= dt * 3`).
- **`G.pace` não vai no save**: é do passo; um mundo novo ou um save aberto recomeça em 1 (o gancho) e o primeiro passo
  pergunta de novo. A cena também não vai no save («a save made during one keeps the world, not the scene»).

**O salto tem cenas a correr?** Tem: o módulo das cenas é do ritmo rápido do salto (`FINE`), e as cenas das histórias
correm nele como no passo. Medido em dez anos saltados da metrópole na paz do deus, em quatro histórias de cada lado:
uma cena a correr em **7% a 19% dos passos** (13,0 · 14,0 · 8,1 · 18,9 antes; 12,6 · 15,2 · 7,0 · 16,4 depois), e **um dia
dura 210 a 228 s** em média em vez de 200 (dias de 250 a 260 s quando uma vigília ou um chamado dura 80 a 90 s). São
poucas cenas e longas, de uma a quatro pessoas cada — a vigília (`iq-vigilia`, 82 a 90 s), o cais e a volta do herói
(`hz-cais`, `hz-volta`, 43 a 64 s), o chamado e a volta (`cv-`), a partida, a chegada e a volta de uma jornada (`jn-`, 10
a 23 s), o juramento (`vg-juramento`) —, e cada uma segura o sol do mundo inteiro. Nos dias vividos é o mesmo, e é do dado
da história: 0% a 28% dos segundos em oito histórias de quatro dias.

**O efeito, medido.**
- *O cansaço.* Na metrópole de antes (`580a920`), quatro dias seguidos com 200, 217, 261 e 200 s: às 0,60 dormiam ou iam
  dormir pelo cansaço **12, 163, 315 e 18** de ~362 adultos — nos dois dias com cena a cidade estava na cama antes das
  0,60. Depois (dias de 200, 269, 244 e 200 s): **7, 16, 10 e 23** de ~369.
- *A fome.* Num dia de 218 s a fome crescia 109 centésimos em vez de 100. Em dez anos de paz (§3) a comida produzida vai
  de 15 155 a 14 256 na média de quatro histórias (−6%; a comida nos armazéns igual, ninguém morre de fome): come-se pelo
  dia, não pelos segundos.

### D-240 — quem descansa cansa menos (`js/villagers.js`)

```js
Vg.REST = 0.2;
const REST_TASK = {
  tavern: t => t.st >= 2, teatro: t => t.st >= 1, ler: t => t.st >= 1, termas: t => t.st === 2,
  praca: t => t.st === 2, rest: t => t.st === 2, talk: t => !t.dance, pray: t => t.st === 2,
  family: t => t.st >= 2 && !t.lift, shelter: t => t.st === 2, lar: t => t.st === 2 && !LAR_WORK[t.what],
};
const LAR_WORK = { cozinhar: 1, cuidar: 1 };
const REST_USE = { sentar: 1, comer: 1, beber: 1, ler: 1, banhar: 1, rezar: 1, assistir: 1, deitar: 1, aquecer: 1 };
Vg.resting = function (v) {
  if (!v || v.sleeping || v.moving) return false;
  const a = G.S.avatar; if (a && a.id === v.id) return !!(a.use && REST_USE[a.use.use]);
  const t = v.task; if (!t || t.kind === 'work') return false;
  const f = REST_TASK[t.type]; return !!f && f(t);
};
// needs: … (awake ? -dn * (100 / 80) * (velho 1,12) * (fuga 1,6) * (Vg.resting(v) ? Vg.REST : 1) : dn * (100 / 22))
```

**A tabela (D-242) — o afazer e o estado dele em que o corpo descansa:**

| descansa | não descansa |
|---|---|
| à mesa da taverna: sentado, à espera, a comer, a beber (`tavern`, estado 2 e 3) | a caminhada até a taverna (estado 0, 1) |
| na plateia (`teatro`, de 1 em diante) | a caminhada até o teatro |
| sobre um rolo (`ler`, de 1 em diante) | a caminhada até a biblioteca |
| na água dos banhos (`termas`, estado 2) | os cabides, despir e vestir (1 e 3) |
| na conversa da praça (`praca`, 2) | a caminhada até a praça |
| junto à fogueira ou à porta de casa (`rest`, 2) | a caminhada até lá |
| na conversa com um amigo, num abraço (`talk`) | a dança (`talk` com `dance`) |
| a rezar (`pray`, 2) | a caminhada ao templo; **o sacerdote que conduz as orações** (o afazer é o ofício dele: `kind: 'work'`) |
| com a família à porta (`family`, de 2 em diante) | o filho levantado no ar (`lift`) |
| em casa fora da tempestade (`shelter`, 2) | a corrida para casa |
| em casa, acordado: à ceia, na conversa, junto do fogo, à espera, a ninar, de cama, de luto (`lar`, 2) | cozinhar e cuidar dos pequenos (o trabalho da casa); a caminhada para casa |
| | todo afazer de trabalho (`kind: 'work'`), seja qual for o gesto; a pausa entre dois afazeres (`idle`, 1,5 s) e o passeio (`wander`); a refeição no armazém; **a festa** (ver abaixo); quem dorme; quem anda |

- **A caminhada até o lugar cansa como caminhada**: ninguém em descanso a andar (`v.moving`), e além disso a tabela só
  conta o estado em que a pessoa chegou — cinto e suspensório (as sabotagens r10 e r13 tiram um de cada vez).
- **O trabalho do dia cansa como trabalho, seja qual for o gesto**: o sacerdote ajoelhado a conduzir as orações está no
  ofício dele (medido: 0,5 centésimos por adulto-dia do mundo em `work:pray`).
- **O corpo do deus pela mesma regra (D-244)**: a marca do corpo é a tarefa `avatar`, que não diz o que o corpo faz; o
  corpo descansa pelo lugar que as mãos dele seguram (`S.avatar.use`, posto por `G.Possess.use`): sentar, comer, beber,
  ler, banhar, rezar, assistir, deitar, aquecer. De pé ou a andar, cansa como qualquer um; num lugar de trabalho da
  planta (cozinhar, moldar, vender…), também.
- **A festa fica de fora, de propósito.** A tarefa `fest` não diz o estágio (a marcha, a dança, a luta, o banquete e a
  vigília são do `festivals.js`, no objeto da festa), e a porta do descanso não lê o gesto. Medido: 3,7 centésimos por
  adulto-dia parados numa festa (0,5 deles depois das 0,60). Se o dono quiser o banquete e a vigília como descanso, é uma
  linha na tabela e uma porta de leitura no `festivals.js` (o estágio de uma festa) — fica dito no §4.
- **A pausa entre dois afazeres (`idle`, «Descansando» no texto da pessoa) não é descanso**: é o fôlego de um segundo e
  meio entre dois afazeres do dia de trabalho; com ela na tabela o dia de trabalho cansaria menos (a sabotagem r15).
- A porta é pura: não escreve, não sorteia, não tem campo novo. Custa uma leitura por pessoa acordada por passo.

---

## 2. A conta do K (D-243)

Um adulto acorda às 0,03 (o relógio dele: 0,005 a 0,055) com 100 e deita às 0,74 a 0,81 (+0,02 o sociável); a cama chama
aos 22 (e manda aos 15). A trabalhar ou a andar gasta 1,25 por centésimo do dia.

| | às 0,60 | na hora de deitar (0,775) | às 0,88 (a taverna fecha) |
|---|---|---|---|
| sem descanso (antes) | 28,8 | **6,9** (os 22 chegam às 0,654) | — |
| K = 0,5 | 28,8 | 17,8 | 11,3 |
| K = 0,3 | 28,8 | 22,2 | 18,3 (sai da mesa às 0,78) |
| **K = 0,2** | 28,8 | **24,4** | **21,8** |
| K = 0,1 | 28,8 | 26,6 | 25,3 |

Com K = 0,3 o adulto do alvo chega à hora de deitar com 22, mas não fica à mesa até a taverna fechar; com K = 0,2 as duas
metades do alvo cabem: perto de 22 na hora de deitar (24,4 para quem acorda às 0,03; 22,1 para quem acorda às 0,005 e
deita às 0,74) e 21,8 às 0,88. Fiquei com **0,2**. Medi a metrópole com 0,3 e com 0,2 antes de escolher (na base
anterior, `6921b8c`): a dormir pelo cansaço às 0,70, 117 e 84 de ~390; às 0,73, 179 e 137; à mesa às 0,80, 0,5 e 1,8.

Pela mão (`qa/dia.js` a4): Xiuhcoatl, construtor, acorda às 0,042 com 100, de pé e sem descanso até as 0,60 (30,0),
depois em descanso: **24,3 na hora de deitar dele (0,829), 23,0 às 0,88**.

---

## 3. As medidas de antes e depois

O medidor (`mede3.js`, na pasta de rascunho; o mesmo dos dois lados): o mundo pronto, o primeiro dia vivido e não contado
(começa de noite), quatro dias contados na paz do deus, ninguém mandado. Antes: `580a920`. Depois: `580a920` com esta
rodada. Duas histórias de cada mundo (a segunda: um sorteio do acaso do mundo antes do primeiro passo). «Pela energia»:
dorme ou vai dormir e não é a hora do relógio dele.

### A dormir ou a ir dormir pela energia (adultos; a média dos quatro dias)

| | 0,60 | 0,66 | 0,70 | 0,73 | de |
|---|---|---|---|---|---|
| metrópole — antes | 127,0 | 149,5 (40%) | 211,3 (55%) | 249,0 (64%) | ~378 |
| metrópole — **depois** | 14,0 | **26,8 (7%)** | **115,8 (30%)** | **181,5 (45%)** | ~386 |
| metrópole, 2ª história — antes | 45,5 | 77,3 (23%) | 161,8 (46%) | 224,8 (63%) | ~345 |
| metrópole, 2ª história — **depois** | 16,3 | **35,5 (9%)** | **127,3 (33%)** | **194,3 (49%)** | ~387 |
| mega — antes | 103,3 | 104,5 (41%) | 119,0 (47%) | 139,3 (54%) | ~252 |
| mega — **depois** | 7,5 | **11,3 (5%)** | **31,8 (13%)** | **54,3 (22%)** | ~250 |
| mega, 2ª história — antes | 53,5 | 55,5 (22%) | 59,3 (23%) | 103,5 (40%) | ~252 |
| mega, 2ª história — **depois** | 6,3 | **15,8 (6%)** | **57,3 (22%)** | **98,0 (37%)** | ~258 |

Pelo relógio, nessas horas: 0 · 0 · 0 a 1 · 0 a 11 (antes e depois). Os dias de antes, um a um, vão de 8 a 315 às 0,60
(as cenas: L-915); os de depois, de 1 a 24.

### A energia e as horas

| | metrópole antes → depois | 2ª história | mega antes → depois | 2ª história |
|---|---|---|---|---|
| energia de quem está acordado às 0,60 (média; mediana) | 27,8; 27,1 → **35,0; 30,5** | 29,6; 27,9 → 33,8; 29,9 | 30,3; 28,2 → 43,2; 39,9 | 40,4; 29,9 → 35,8; 30,9 |
| na hora de deitar do relógio de cada um: já na cama ou a caminho | 65,0% → **61,0%** | 72,6% → 60,2% | 59,2% → 44,7% | 56,7% → 56,8% |
| … e a energia dos que estão acordados (p25; mediana; p75) | 11,9; 52,8; 82,8 → **20,1; 27,5; 40,3** | 8,5; 23,1; 49,4 → 18,6; 24,6; 38,3 | 39,7; 78,0; 86,8 → 24,3; 37,2; 51,0 | 37,0; 60,9; 77,4 → 20,4; 26,5; 35,9 |
| … abaixo de 15 (adulto-dias acordados) | 155 de 563 → **97 de 639** | 149 de 405 → 128 de 639 | 60 de 424 → 35 de 568 | 37 de 450 → 77 de 457 |
| a hora de acordar dos adultos (média; p10), em centésimos | −3,3; −29,1 → **+3,6; −11,9** | 2,6; −19,4 → 4,4; −9,5 | −4,6; −31,6 → 3,7; −9,4 | −6,4; −40,3 → 4,8; −9,3 |
| acordado, por adulto-dia (centésimos) | 70,2 → 74,1 | 72,2 → 74,0 | 70,8 → 76,4 | 71,5 → 75,2 |
| **no trabalho** (`kind 'work'`), por adulto-dia | 25,4 → **29,7** | 26,2 → 28,8 | 29,7 → 24,2 ¹ | 25,6 → 30,0 |
| **nas horas de trabalho (0,05 a 0,60) com tempo bom, a parte dos acordados no trabalho** ³ | 45,9% → **53,2%** | 46,6% → 51,5% | 53,9% → 53,9% | 54,7% → 55,2% |
| a andar, por adulto-dia | 43,5 → 45,3 | 44,9 → 46,5 | 43,8 → 38,8 | 40,1 → 45,0 |
| em descanso (`Vg.resting`), por adulto-dia | — → **6,5** | — → 5,2 | — → 18,4 ¹ | — → 7,4 |
| um dia, em segundos (cena em % dos segundos) | 219,5 (14,0%) → 228,3 (19,3%) | 203,3 (2,6%) → 200,0 (0%) | 219,3 (13,7%) → 243,3 (27,6%) | 228,8 (19,4%) → 211,5 (8,4%) |

¹ A primeira história da mega de depois é de tempestade: 15% dos segundos da tarde em casa fora da chuva (`shelter`, que é
descanso), 17,9 dos 18,4 centésimos de descanso. O trabalho caiu nela pelo tempo, não pela regra: na segunda história
sobe (25,6 → 30,0).

³ Medido à parte (`trabalho.js`, três dias contados; antes: a `8490aa9`; depois: a árvore juntada), porque a tempestade
esconde a conta por adulto-dia: debaixo dela ninguém trabalha (o abrigo). A mega de depois com a tempestade sobre 34% das
horas de trabalho tem 21,4 centésimos de trabalho por adulto-dia — e, com tempo bom, os mesmos 53,9% no trabalho da mega
de antes sem tempestade (29,7 centésimos); a mega de antes com a tempestade sobre 14% das horas tem 24,6. **Quem
trabalha, trabalha o mesmo; na metrópole, mais** (os dias com cena de antes punham a cidade na cama à tarde).

Antes, a mediana alta da energia «dos acordados na hora de deitar» (52,8; 78,0) era gente que já tinha dormido: deitava
às 0,66, acordava de noite com a energia cheia (a hora de acordar: p10 de −29 a −40 centésimos, isto é, entre as 0,60 e as
0,71 da véspera). Depois, a gente acorda de manhã (p10 −9 a −12; mediana +3,4 a +3,7).

### A taverna, as janelas, a ceia, o teatro, os banhos

| | metrópole antes → depois | 2ª história | mega antes → depois | 2ª história |
|---|---|---|---|---|
| à mesa da taverna às 0,75 · 0,80 · 0,85 (no mundo) | 1,8 · 1,0 · 0,0 → 2,3 · 0,3 · 0,0 | 1,3 · 0,3 · 0,0 → 3,0 · 0,5 · 0,5 | 2,5 · 2,8 · 1,0 → 5,0 · 0,8 · 0,5 | 4,0 · 1,3 · 0,5 → 4,5 · 1,8 · 0,5 |
| casas com a janela acesa (`G.Atmos.lit`) às 0,74 · 0,78 · 0,82 | 21,0 · 18,3 · 3,5 → **34,3 · 21,3 · 3,5** de 210 | 15,3 · 10,5 · 4,3 → 22,5 · 16,0 · 2,8 | 28,3 · 25,3 · 3,5 → 46,5 · 37,0 · 5,3 de 115 | 35,8 · 27,0 · 3,8 → 21,8 · 20,3 · 2,8 |
| copos na taverna por dia | 17,5 → **44,5** | 19,5 → 35,0 | 23,0 → 41,5 | 31,5 → 49,0 |
| ceias por dia | 23,5 → 30,5 | 15,3 → 26,0 | 35,5 → 43,8 | 44,8 → 31,0 |
| refeições frias por dia | 114,3 → 131,8 | 119,8 → 130,8 | 99,8 → 89,5 | 102,8 → 75,5 |
| entradas do teatro por dia | 27,5 → 36,5 | 22,3 → 28,8 | 8,3 → 4,3 ¹ | 7,0 → 7,5 |
| banhos pagos por dia | 22,5 → 27,8 | 24,3 → 21,8 | 22,5 → 10,3 ¹ | 12,3 → 22,0 |

**A taverna de noite continua vazia, e já não é pelo cansaço.** O medidor das mesas (`taverna-noite.js`, a metrópole,
quatro dias): antes, 58 vezes à mesa, sentaram às 0,68 com 24,1 de energia (mediana), levantaram às 0,72 com 18,5, **30
das 58 para a cama pelo cansaço**; depois, **104 vezes à mesa**, sentaram às 0,68 com 26,8, levantaram às 0,72 com **26,0**
(o descanso: a energia quase não cai), **19 das 104 para a cama pelo cansaço** — e ninguém, antes ou depois, à mesa depois
das 0,84. A visita dura 3,3 a 3,8 centésimos do dia (sete segundos: senta, é servido, bebe, sai) e a taverna só é
escolhida ao fim da tarde (`decide`: `eve`, das 0,60 às 0,73): às 0,77 já não chega ninguém. Às 0,82 as janelas estão
apagadas dos dois lados (3 de 210): a noite em casa (`G.Lar.urge`) dura até a hora de deitar de cada um, 0,74 a 0,83.

### As praças (parados por hora, das 0,600 às 0,725; entre parênteses a cidade)

| | 0,600 | 0,625 | 0,650 | 0,675 | 0,700 | 0,725 |
|---|---|---|---|---|---|---|
| metrópole, Tenochtitlan (137–146) — antes | 0,7 | 0,8 | 1,7 | 1,8 | 1,5 | 0,7 |
| — **depois** | 1,4 | 2,4 | 3,3 | 4,3 | 4,3 | 1,9 |
| metrópole, Mênfis (128–131) — antes | 1,5 | 1,9 | 2,0 | 1,3 | 1,0 | 0,1 |
| — **depois** | 3,8 | 2,3 | 2,5 | 2,1 | 1,8 | 0,7 |
| metrópole, Argos (107–110) — antes | 1,0 | 1,9 | 1,8 | 1,2 | 0,5 | 0,0 |
| — **depois** | 1,9 | 2,0 | 2,5 | 2,3 | 1,9 | 0,7 |
| **metrópole, Hedeby (35–36) — antes** | 2,9 | 0,2 | 0,0 | 0,0 | 0,0 | 0,0 |
| — **depois** | 4,1 | 2,8 | 1,1 | 0,8 | 0,5 | 0,3 |
| metrópole 2ª história, Hedeby (35–38) — antes → depois | 5,1 → 5,4 | 3,8 → 1,6 | 0,4 → 0,3 | 0,3 → 0,3 | 0,0 → 0,4 | 0,2 → 0,1 |
| mega, Mênfis (167–172) — antes | 2,3 | 3,6 | 4,8 | 6,1 | 4,6 | 1,2 |
| — **depois** | 5,6 | 5,9 | 6,0 | 6,5 | 6,5 | 1,9 |
| mega, Roma (77–78) — antes | 2,1 | 2,3 | 2,3 | 2,2 | 1,6 | 0,3 |
| — **depois** | 5,2 | 5,3 | 6,0 | 6,9 | 6,3 | 1,2 |
| mega, Hedeby (20–33) — antes → depois | 0,6 → 1,1 | 1,2 → 1,3 | 1,0 → 1,5 | 1,0 → 1,6 | 0,5 → 1,5 | 0,1 → 0,3 |
| mega 2ª história, Mênfis — antes → depois | 4,8 → 8,9 | 4,2 → 9,3 | 4,5 → 10,1 | 5,3 → 10,4 | 3,8 → 10,5 | 1,4 → 2,5 |
| mega 2ª história, Hedeby (17–35) — antes → depois | 0,0 → 1,6 | 0,0 → 2,2 | 0,0 → 2,2 | 0,0 → 2,2 | 0,0 → 2,0 | 0,0 → 0,4 |

A praça de Hedeby tem gente (a D-245 já estava nos dois lados da medida: é a `580a920`): com esta rodada ela segura a
gente até escurecer em três das quatro histórias (na segunda da metrópole fica como estava). Nenhuma sabotagem das rodadas
anteriores falava do frio: a `p4` da segunda rodada tira a regra da chuva (`w.rain > 0.3`), e a linha do frio que a D-245
tirou não era alvo de nenhuma.

### Dez anos de paz (a metrópole no salto, na paz do deus; quatro histórias de cada lado)

| | antes (4 histórias) | depois (4 histórias) | média antes → depois |
|---|---|---|---|
| gente no fim | 977 · 954 · 971 · 975 | 965 · 974 · 978 · 962 | 969 → 970 |
| comida produzida | 15 569 · 15 460 · 13 455 · 16 134 | 14 064 · 14 242 · 14 809 · 13 908 | 15 155 → 14 256 (−6%) |
| madeira produzida | 5 803 · 5 545 · 5 323 · 5 530 | 5 836 · 6 376 · 5 856 · 5 128 | 5 550 → 5 799 (+4%) |
| pedra produzida | 2 322 · 2 629 · 2 466 · 2 424 | 2 560 · 3 081 · 2 696 · 3 094 | 2 460 → 2 858 (+16%) |
| comida nos armazéns no fim | 6 134 · 6 170 · 5 866 · 6 197 | 6 353 · 5 881 · 6 073 · 6 181 | 6 092 → 6 122 |
| mortes de fome | 0 · 0 · 0 · 0 | 0 · 0 · 0 · 0 | 0 → 0 |
| mortes, todas | 27 · 34 · 27 · 27 | 34 · 29 · 28 · 31 | 28,8 → 30,5 |
| navios mercantes que saíram | 61 · 57 · 60 · 59 | 59 · 48 · 59 · 51 | 59,3 → 54,3 (−8%) |
| notas de cais (carga) | 211 · 192 · 192 · 185 | 197 · 154 · 193 · 172 | 195 → 179 (−8%) |
| banhos; leituras | 271 · 226 · 258 · 296; 59 · 67 · 68 · 73 | 293 · 298 · 259 · 225; 74 · 74 · 73 · 70 | 263 → 269; 67 → 73 |
| verificador (S0 a S2) no fim | 0 · 0 · 0 · 0 | 1 ² · 0 · 0 · 0 | |

A economia não cai: a gente é a mesma, os armazéns iguais, ninguém morre de fome, a madeira e a pedra sobem. **A comida
produzida desce 6%** — é o L-915: come-se pelo dia (num dia de 218 s a fome crescia 9% a mais), e a lavoura acompanha a
fome. **Os navios descem 8%** (em duas das quatro histórias, 9 e 8 a menos; nas outras duas, 2 e 1): fica dito como
**T-946, aberto** — não é a noite (as saídas por oitavo do dia, numa história: 16, 9, 6, 9, 7, 9, 1, 0 antes e 16, 8, 4, 8,
5, 6, 1, 0 depois: quase nenhuma de noite dos dois lados; os marinheiros em terra a dormir, 38% e 39% dos olhares), e
acompanha a comida produzida (nas três histórias em que ela desce 9% a 14% os navios descem; na que sobe 10%, ficam
iguais) — a hipótese, não provada: menos comida produzida, menos carga para levar.

² «terra-guardada: banhos#27154: o que o fogo levou é −1,96» — é o L-726 (a chama que morria molhada devolvia vida ao
prédio), consertado pelo líder na `4538faf`, que a `580a920` ainda não tinha.

---

## 4. O que o mundo vivido mostra, e o que eu proporia (T-940, aberto — a decisão é do líder)

**O alvo pede 15 centésimos de descanso por dia, e a gente deste mundo descansa 6.** Para chegar à hora de deitar (0,775)
com 22, quem acorda às 0,03 tem 78 de energia para 74,5 centésimos acordado: 78 = 1,25 × (74,5 − r) + 0,25 × r dá
**r = 15 centésimos em descanso**. O medidor da tarde (`tarde.js`, a metrópole, três dias, 1 130 adulto-dias):

| por adulto-dia, em centésimos do dia | acordado | em descanso | a andar | parado sem descanso |
|---|---|---|---|---|
| o dia inteiro | 73,4 | **5,8** | **45,3** | 22,3 |
| das 0,60 à hora de deitar de cada um | 14,6 | **3,5** | **8,0** | 3,1 |

- *Em descanso (5,8):* o teatro 1,0; a família à porta 0,8; a água dos banhos 0,8; em casa (descansar, conversar, esperar,
  a ceia, de cama) 1,8; a praça 0,5; a mesa da taverna 0,3; a leitura 0,2.
- *A andar (45,3):* 61% do tempo acordado. Na tarde, 8,0 de 14,6: a caminhada para a cama 1,5; a família à porta 0,8 (anda
  tanto quanto fica); a festa 0,5; a refeição, a obra, a horta, a ronda, a entrega, 0,4 cada; a taverna 0,3.
- *Parado sem descanso (22,3):* a festa 3,7; a guarda 2,0; as redes, a assembleia, a refeição, o ofício, a horta, a banca.

Na mega de tempestade (17,9 centésimos por adulto-dia em casa fora da chuva) o descanso chega a 23,4 — e é a história em
que só 13% dormem pelo cansaço às 0,70 e 22% às 0,73: onde há os 15 centésimos, o alvo aparece.

**Por que a tarde não é de descanso.** O dia de trabalho acaba pela hora (`eve`, 0,60: o trabalho vale 0,7 do que valia,
e a casa, a taverna, a praça ganham), mas o que vem depois são afazeres curtos — a família à porta, a horta, a ceia a
cozinhar, a praça, um copo de sete segundos — com um pensamento novo e uma caminhada nova entre cada dois; e a noite em
casa junto do fogo (`G.Lar.urge`) só começa depois de escurecer (0,73), quando um terço já foi para a cama.

**O que eu proporia (não fiz; são outras alavancas, e cada uma pede a sua medida e a sua prova):**

1. **A tarde em casa** (`act-lar.js`, a vida em casa): quem escolhe a casa ao fim do dia de trabalho fica nela acordado —
   junto do fogo, à ceia, na conversa (`lar`, estado 2: já é descanso) — até a hora de deitar, em vez de sair de novo
   para afazeres curtos; isto é, a vontade de casa (`G.Lar.urge`) vale desde o fim do dia de trabalho, não só depois de
   escurecer. É a que mais rende: a tarde tem 14,6 centésimos acordados, 8 deles a andar.
2. **A taverna até fechar** (`act-taverna.js`, `decide`): a visita dura sete segundos e a taverna só se escolhe até as
   0,73. Mais um copo enquanto a energia e a bolsa dão (17 de 124 já voltam para outra rodada), e a escolha da taverna a
   valer depois de escurecer para quem está acordado e antes da hora de deitar. Com o K de agora a energia dá: quem
   senta às 0,68 com 26,8 levanta às 0,72 com 26,0.
3. **O banquete e a vigília de uma festa como descanso** (uma linha na tabela, uma porta de leitura do estágio no
   `festivals.js`): até 3,7 centésimos por adulto-dia numa história com festa todos os dias.
4. *(Não proporia)* baixar mais o K: com K = 0 os 5,8 centésimos de descanso poupariam mais 1,5 de energia por dia. A
   alavanca não é o quanto o descanso poupa: é o quanto se descansa.

---

## 5. A prova — `qa/dia.js` (com `qa/dia-inv.js`)

`[ONLY=a,s,b,v,n,h] [DIAS=n] [SHIFT=k] node qa/dia.js [metropole|mega]` — em Node, no mundo pronto.

| parte | o que afirma |
|---|---|
| **a1** | o descanso contra o trabalho, pela mão: a mesma energia (80), corpos lado a lado, dez centésimos do dia — de pé e sem descanso cai 100/80 por centésimo, como sempre (12,50); na conversa, REST disso (2,50); o velho, 1,12 do moço (2,80) |
| **a2** | a tabela, entrada a entrada (36 casos: 13 de descanso, 23 que não são — a caminhada até cada lugar, os cabides, a dança, o filho no ar, a cozinha, o cuidado dos pequenos, o sacerdote no ofício, o machado, a pausa, o passeio, a festa, a refeição no armazém; e ninguém a andar nem a dormir, seja qual for o afazer) |
| **a3** | o que não mudou: quem dorme recupera 100/22 por centésimo do dia |
| **a4** | o adulto do alvo, pela mão: 100 ao acordar, de pé e sem descanso até as 0,60, depois em descanso — de 19 a 28 na hora de deitar do relógio dele, 15 ou mais à hora de a taverna fechar (a mão renova o afazer a cada 40 s: um afazer do dia acaba aos 70 — T-947) |
| **s1, s2** | o sol que se demora (a porta `G.Scene.lingers` pela mão da prova): em 20 s do mundo, 3,5 centésimos do dia — e a fome, o cansaço (de pé e na conversa) e o sono por eles; a idade em segundos; sem cena, 10 centésimos |
| **s3** | a porta do passo do dia é pedida uma vez por passo do mundo, não por pessoa (200 em 200) |
| **b1** | o corpo do deus pela mesma regra: de pé cansa 100/80; com um lugar de descanso da planta nas mãos (`G.Possess.use`), REST disso |
| **v1** | os dias vividos (três contados, na paz do deus, ninguém mandado): às 0,66 não mais de 15% dos adultos dormem ou vão dormir pelo cansaço; às 0,70 não mais de 40% |
| **v2** | o dia de trabalho não encolheu: nas horas de trabalho (0,05 a 0,60) com tempo bom, 42% ou mais dos adultos acordados estão no trabalho (em oito histórias: 46% a 55% antes, 51% a 55% depois) |
| **v3** | ninguém acordado cansa mais depressa do que o dia: a regra do verificador olhada de dois em dois segundos nos dias vividos, e em mais 30 s com o sol a demorar-se pela mão da prova |
| **v4, v5** | o verificador (S0 a S2) e os erros nos dias vividos; e o que se mede e não se afirma (a taverna, as janelas, a energia na hora de deitar), dito na linha |
| **n** | um save a meio da noite (0,85), carregado duas vezes: o mesmo futuro em 40 s; nada novo no save; o passo do dia recomeça em 1 |
| **h** | o verificador pega quatro mentiras (o passo fora dos dois valores; em descanso a andar; em descanso no trabalho; a cansar em segundos com o sol a demorar-se) — e nada sem elas |

**Os pisos do v1 saíram de oito histórias** (quatro de antes, quatro de depois — a lição do T-923c): às 0,66, 22% a 42%
antes e 5% a 10% depois — o piso de 15% separa os dois lados em todas; às 0,70, 23% a 55% antes e 13% a 33% depois — o
piso de 40% é um cinto (a mega de tempestade de antes tinha 23%), não acusa sozinho a rodada desfeita (T-942).

**A invariante que vale no mundo inteiro** (`qa/dia-inv.js`, o sistema «dia»): (S2) o passo do dia é 1 ou o do sol que
se demora; (S2) ninguém em descanso a andar, a dormir, nem num afazer de trabalho; (S3) **ninguém acordado cansa mais
depressa do que o dia** — entre duas olhadas a até doze segundos uma da outra, com o sol a demorar-se no meio, a energia
de quem está acordado não cai mais do que os centésimos do dia que passaram deixam (100/80 por centésimo; o velho 1,12;
quem foge 1,6). É a marca do L-915. Só olha a queda que os segundos explicam e o dia não (uma queda maior é um golpe — o
inverno do deus, a ressaca, a mão de uma prova —, não o cansaço). **Limite (T-941):** com as olhadas a mais de doze
segundos a regra não fala — num salto, numa vida olhada de ano em ano; é das provas que olham de perto (o v3, o h).

### Os resultados (a árvore juntada `7797396`)

| a prova | resultado |
|---|---|
| `node qa/dia.js` (a metrópole) | **18 de 18** |
| `node qa/dia.js mega` | **18 de 18** |
| `SHIFT=1 ONLY=v,n node qa/dia.js` (outra história da metrópole) | **6 de 6** |
| `SHIFT=1 ONLY=v,n node qa/dia.js mega` (outra história da mega) | 5 de 6 — o v4 acusa a regra P7 da sede (`paco`), que não é desta rodada: **L-916**, abaixo |
| `node qa/guard.js` | PASSOU (156 arquivos); com as regras 62 e 63 numa cópia: PASSOU |
| a vida curta (`soak.js 103 continente 128 4 normal 5 1 1`, no navegador) | nenhuma violação, nenhum erro |
| `det3.js 77 arquipelago 96 3 2` (no navegador) | PASSOU: A × B igual (com e sem quadros), A × C igual, o save carregado duas vezes igual |

As linhas que contam (a metrópole; entre parênteses a mega):

- **a1** — em 10,00 centésimos do dia: de pé sem afazer de descanso, 12,50 (a conta: 12,50); dois na conversa, 2,50 e 2,50 (2,50; REST 0,2); a velha de 66 anos na conversa, 2,80 (2,80). (A mega: os mesmos números, com uma de 70 anos.)
- **a4** — Nezahualcóyotl (acorda às 0,029, deita às 0,799): 28,4 às 0,60 (a conta 28,7); **23,5 na hora de deitar dele**; 21,5 às 0,88, quando a taverna fecha. (A mega: Seti, acorda às 0,031, deita às 0,776: 28,8; **24,3**; 21,8.)
- **s1** — com a cena: 20,0 s, 3,50 centésimos do dia; de pé: energia −4,37, fome +3,99, idade +0,100; na conversa: −0,87; a dormir: +15,91. **s2** — sem a cena: 10,00 centésimos, energia −12,50. **s3** — 200 perguntas à cena em 200 passos (705 pessoas no mundo; 451 na mega).
- **b1** — Neferu, vivido pelo deus, na casa dele: de pé, 5,31 em 4,25 centésimos (a conta 5,31); no lugar «deitar», 1,06 (1,06).
- **v1** — a dormir ou a ir dormir pela energia: às 0,66, 7,1% dos adultos (33 de 356, 22 de 359, 22 de 382); às 0,70, 31,9%. (A mega, de tempestade: 4,3% e 7,2%. As outras histórias: a metrópole 9,2% e 32,8%; a mega 6,5% e 21,9%.)
- **v2** — 53,2% dos acordados no trabalho nas horas de trabalho com tempo bom; 29,9 centésimos de trabalho por adulto-dia, 6,6 em descanso. (A mega: 53,9%, com a tempestade em 33% das horas de trabalho — 21,4 centésimos de trabalho e 21,7 de descanso por adulto-dia; as outras histórias: 51,5% e 55,2%.)
- **v3** — nenhuma vez em 710 s dos dias vividos, uma cena a correr em 175 deles (24,6%), nem nos 30 s da mão. (A mega: 756 s, cena em 32,4%; a outra história da metrópole: nenhuma cena em 597 s — os 30 s da mão dão corpo ao caso.)
- **v5** (medido, não afirmado) — à mesa da taverna às 0,75 · 0,80 · 0,85: 1,7 · 0,3 · 0,0; casas com a janela acesa às 0,74 · 0,78 · 0,82: 35,0 · 19,7 · 3,3 de 208; a energia de quem está acordado na hora de deitar dele: mediana 26,5 (78 de 453 adulto-dias abaixo de 15).
- **n** — o save às 0,854 do dia 60 (3,66 MB): nenhum campo novo; depois de abrir, o passo do dia é 1; 40 s depois, as duas vidas iguais.
- **h** — o passo a 0,5 acusado; em descanso a andar acusado; em descanso no trabalho acusado; a cansar em segundos com a cena: acusado em 6 de 6 olhadas, mais ninguém acusado; sem as mentiras, 0 antes e 0 depois.

**L-916 (achado, aberto; não é desta rodada) — a sede cheia demais e quem casa com alguém de outra casa.** Na outra
história da mega o v4 diz: «paco: Nefertiti #13938 mora em paco#8062, cheia demais (8 para 6 camas), sem ser dos que têm
de morar com quem governa (D-206) (desde o dia 52 às 0,33, em 100 olhadas de dois em dois segundos)». O rastro (`paco.js`):
Nefertiti, 18 anos, filha dos dois que governam, com o par Khufu #14231, que mora noutra casa (#8176); a acusação dura
**202 s**, até o dia 53 às 0,33. O `crowd` do `act-casa.js` tira da sede cheia as casas dos parentes casados **cujo par
mora na sede** e depois os crescidos **sem par**: quem tem o par a morar noutra casa não é de nenhuma das duas listas e
fica até a rotina das casas juntar o casal no dia seguinte — e a regra P7 do verificador conta-a entre os que têm de sair
depois de 8 s. Na `8490aa9` sem esta rodada, os mesmos três dias (dois sorteios) não a mostram: é da história (quem tem
par aos dezoito), não do cansaço. Só aparece a quem olha o verificador de perto: as outras provas olham no fim. Não mexi
(é do `act-casa.js`, regra 72, e da regra P7): a linha do AUDIT, com a proposta, está no §8.

---

## 6. Os três itens do líder, com rastro

### `freguesia` b1 — Tebas 0, 4, 8, 9 (T-943: limite da prova)

O rastro (`fg-b1.js`, na `580a920`, o primeiro dia vivido de Tebas, de 0,05 em 0,05 do dia: quem tinha a vontade do dia
e o que impedia cada um). O mundo começa às 0,002 do dia 58 — **o dia é inteiro**, não pela metade; os banhos (#20789, 35
lugares) abrem às 0,25 com a fornalha acesa (2 de lenha, calor 83).

| hora | com a vontade do dia (de 25 adultos) | o que impedia | o céu e a cidade |
|---|---|---|---|
| 0,25 a 0,35 | 8,6 a 11 | antes da hora de cada um (8 a 10) | uma festa na cidade até as 0,40 (5 nela) |
| 0,40 | 12 | **2,5 a caminho dos banhos**; antes da hora 2,8; na obra 2,1; a bordo 2 | a tempestade começa (0,4 do tempo) |
| 0,45 | 13,7 | **em casa fora da tempestade 7,8**; sem tempo antes de fechar 1,9; 0,5 ainda a caminho | chuva 0,8, tempestade; 17 de 25 em casa |
| 0,50 a 0,65 | 14 | sem tempo antes de fechar (8,8 → 14: em casa, longe, com a tempestade) | a tempestade o tempo todo; 20 de 25 em casa |
| 0,70 | 8 | os banhos fecham | a tempestade ainda |

Zero entradas: **a tempestade caiu sobre a cidade das 0,42 até depois de fechar**, quando só dois ou três tinham chegado
à hora deles (em Tebas a hora de cada um é tarde: a festa da manhã e o trabalho primeiro), e levou para casa quem ia a
caminho — na saída do líder, a mesma causa: «a caminho, largaram: {"shelter":16, …}». O abrigo (1,05) pesa mais que o
banho (0,4): é a regra de sempre (o caso a1 da mesma prova: «uma tarefa de peso em curso»). O jogo está certo.

**O conserto, na prova** (`qa/freguesia.js` b1): o dia que a tempestade levou — sobre a cidade em 40% ou mais das horas
dos banhos (a regra do abrigo do próprio jogo: `S.weather.storm > 0 && S.weather.rain > 0.3`) — é **dito** («·tempestade»)
e **não se conta**, como o da cidade em armas. O que o caso afirma fica igual: cada dia de banhos com a fornalha acesa, em
paz e sem a tempestade a levar o dia, tem banhistas; e continuam a ser precisos três dias desses, e três banhos por dia na
média.

### `visual/termas-corpo.js` 2 — a fornalha e o posto (T-944: limite da prova)

**A regra.** O lugar da fornalha (o uso «alimentar») é um, e é do foguista enquanto ele está de posto — desde antes de
abrir até o fogo dado até fechar (D-227). Um lugar, uma pessoa (D-085): o `In.freeFor` não dá ao corpo um lugar que
alguém tem. E só o foguista alimenta o fogo: a oferta «Pôr lenha na fornalha» é do corpo que é o foguista destes banhos
(`act-servicos.js`, `offers`: `v.job === b.id && v.role === 'foguista'`) — o corpo que não é o foguista não tem nada a
fazer naquele lugar. Antes da D-227 o foguista só estava à fornalha nos segundos de cada acha, e o caso encontrava o lugar
vazio.

**O caso, agora:** o corpo (que não é o foguista) chega a um passo da fornalha e **não a toma** — o lugar é de quem o
mundo tem nele, e esse é o foguista destes banhos; depois, com o fogo dado até fechar pela mão da prova (o livro do dia,
até o que a fornalha leva: duas achas), **o posto acaba, o foguista sai e o lugar fica livre** para as mãos do corpo.
Depois: «a fornalha era de Caio, o foguista de posto: o corpo a 0,08 m dela, o lugar não era para ele; com o fogo dado até
fechar, o foguista saiu em 5 s (de posto: não) e o lugar ficou livre». O corpo foguista (toma-se o foguista: o afazer dele
acaba e o lugar é das mãos dele, com a oferta) é o caso do `qa/termas-mao.js`.

As três provas das termas, na árvore juntada: na árvore da rodada (`e968f88`, sobre a junção `7797396`), `node qa/termas-grandes.js` **33 de 33** (as partes A a D sozinhas, 23 de 23), `node qa/visual/termas-corpo.js` **15 de 15** e `node qa/visual/termas-3d.js` **5 de 5**. O caso 2 do corpo, nas termas: «5 de 5 lugares alcançados (o mais longe do ponto: 0,17 m); a fornalha era de Caio, o foguista de posto: o corpo a 0,08 m dela, o lugar não era para ele; com o fogo dado até fechar, o foguista saiu em 5 s (de posto: não) e o lugar ficou livre»; nas grandes termas, 11 de 11 lugares.

### «A praça corta a caminhada de quem ia à taverna?» — não (T-945)

**Os pesos.** A ida à taverna (`G.Taverna.visitTask`) pesa **0,5** («a little above going home: the evening's choice is
not undone on the way, nor at the table»), não 0,4; o caminho de casa, que passa pela praça, pesa 0,45, e a tarefa da
praça 0,45; a vontade da praça (`Pr.urge`) é zero para quem tem um afazer de 0,45 ou mais que não seja um trabalho comum.
Uma saída de lazer já escolhida aguenta contra outra de peso parecido: pela conta dos pesos (`cur.pri >= bp`) e porque a
escolha da mesma espécie não desfaz a que está em curso (`cur.kind === best`).

**A medida** (`taverna-ida.js`, a metrópole, quatro dias vividos na paz do deus, cada ida à taverna dada pela escolha de
cada um):

| | antes (`580a920`) | depois |
|---|---|---|
| idas à taverna | 138 (34,5 por dia) | 197 (49,3 por dia) |
| sentaram | 65 (47%) | 124 (63%) |
| não sentaram | 73 | 73 |
| — o que tomou a caminhada | a cama pelo cansaço (1,2) 36; a refeição (1,2) 20; uma história (0,9) 5; a festa (3,2) 4; um navio 2; outros 6 | a cama pelo cansaço 39; a refeição 16; a festa 6; a conferência e o balcão 6; outros 6 |
| **— e em 12 s estavam na praça ou a caminho dela** | **0** | **0** |
| idas à praça que acabaram na taverna | 2 de 94 | 2 de 182 |
| copos por dia · à mesa às 0,75 · 0,80 · 0,85 | 17,5 · 1,8 · 1,0 · 0,0 | 44,5 · 2,3 · 0,3 · 0,0 |

**O que tirou das mesas a gente do `som` s5a.** O caso de antes do T-855 (a visita dada pela mão, sem segurar), a prova
inteira na `580a920`, com rastro de cada mandado: «nenhuma taverna com três às mesas» — dos 111 mandados, **68 não
sentaram por «shelter» (1,05): uma tempestade**; 23 pela hora de deitar («sleep», 1,5: o caso vive até as 0,84); 3 pela
festa, 3 chamados ao balcão, 5 por outros afazeres de peso; 7 sentaram. **Nenhum pela praça nem pelo caminho de casa.** E
na árvore desta rodada o mesmo caso de antes passa («Mênfis, taverna #8250, 4 às mesas»): outra história, sem
tempestade àquela hora. A visita segurada pelo T-855 fica bem como mão da prova (o caso é o som da taverna, não o tempo);
a causa escrita nele («a praça a caminho, 0,45, corta a caminhada à taverna, 0,4») é que não é essa — a linha do AUDIT
está no §8.

**O que esvazia a taverna de verdade** está no §3 e no §4: a visita dura sete segundos e a taverna só se escolhe até as
0,73.

---

## 7. As sabotagens e as vizinhas

### As sabotagens (cada regra desfeita numa cópia do jogo, a prova da rodada contra ela; `sab-F3.py`, `sab-todas3.sh`)

| | o que a sabotagem desfaz | as partes rodadas | os casos que acusam |
|---|---|---|---|
| d1 | o cansaço de novo em segundos, o relógio a demorar-se sozinho | s, h, v | s1, v1, v3, h |
| d2 | a fome de novo em segundos | s | s1 |
| d3 | o ganho do sono de novo em segundos | s | s1 |
| d4 | o relógio não se demora (o passo dito, o relógio no seu) | s | s1, s2 |
| d5 | nada se demora: o passo sempre 1 | s, v3 | s1, s2, s3 |
| d6 | o passo pedido por pessoa, não uma vez por passo | s | s3 |
| d7 | o passo de um save aberto é o que o módulo tinha | n | n |
| d8 | a idade se demora com o sol | s | s1 |
| r1 | nenhum descanso (REST = 1: o mundo de antes) | a, b, v1 | a1, a4, v1 |
| r2 | o descanso só corta o cansaço pela metade | a | a4 |
| r3 | o trabalho cansa menos também | a, v | a1, a4 |
| r4 | quem anda descansa | a, v3 | a2, v3 |
| r5 | quem dorme é dito em descanso | a, h | a2 |
| r6 | o trabalho do dia com gesto de descanso é descanso (o sacerdote) | a, v3 | a2, v3 |
| r7 | o corpo do deus nunca descansa | b | b1 |
| r8 | o corpo do deus descansa de pé | b | b1 |
| r9 | o corpo do deus pela tabela do povo | b | b1 |
| r10 | a caminhada até a taverna é descanso | a | a2 |
| r11 | a dança é descanso | a | a2 |
| r12 | a cozinha e o cuidado dos pequenos são descanso | a | a2 |
| r13 | os cabides dos banhos são descanso | a | a2 |
| r14 | a conversa não é descanso | a | a1, a2, a4 |
| r15 | o fôlego entre dois afazeres é descanso | a | a1, a2, a4 |
| r16 | o velho em descanso cansa como o moço | a | a1 |
| r17 | o dia de trabalho cansa mais (100/70) | a, s | a1, a4, s1, s2 |
| i1 a i4 | o verificador sem cada uma das suas quatro regras | h | h (as quatro) |
| c1 | o frio do lugar fecha a praça de novo (D-245 desfeita) — contra a `qa/praca.js` | a1 | a1 |

**Todas acusadas: 30 de 30.** E as regras 62 e 63 do guard contra 17 mentiras (`sab-guard3.sh`: g1 a g10, h1 a h7), cada uma
numa cópia do `js/`: **17 de 17 acusadas**; sem mentira, PASSOU (156 arquivos).

### As provas vizinhas (na árvore da rodada, `e968f88`)

| a prova | resultado |
|---|---|
| `freguesia` | 23 de 23 (702 s) |
| `fome` | 27 de 27 |
| `lazer` · `lazer-mao` | 15 de 15 · 27 de 27 |
| `taverna` · `taverna-mao` | 10 de 10 · 29 de 29 |
| `tempo-livre` | 6 de 6 |
| `termas` · `termas-mao` · `termas-grandes` | 6 de 6 · 31 de 31 · 33 de 33 |
| `visual/termas-corpo` · `visual/termas-3d` | 15 de 15 · 5 de 5 |
| `praca` (a metrópole e a mega) | 31 de 31 nas duas |
| `atmosfera` | 10 de 10 |
| `roupa` | 9 de 10 — o r5 (a bebedeira no 3D): **T-961**, consertado pelo líder na junção (a prova aquece o corpo 30 quadros antes de medir) |
| `casa` · `juntar` · `sabe` | 24 de 24 · 24 de 24 · 32 de 32 |
| `marinheiros` · `load-oficio` · `oficio-fica` x1 | 21 de 21 · 7 de 7 · 10 de 10 |
| `som` | 32 de 34 — o s3a (**T-963**: o ouvido da prova caía no bairro vizinho) e o s7a (**T-964**: o bairro olhado era a cidade velha, redesenhada quase todo dia), os dois consertados pelo líder na junção; na árvore juntada, 34 de 34 |
| `invariancia` (A a F) | 6 de 6 |
| `lar` | 24 de 26 — o l16 e o l16b, a falha conhecida da linha de base (**T-688**), igual antes desta rodada |
| `corrupt` · `oldsave` · `det3` · a vida curta | 135 casos (20 recusados, 115 carregaram, nenhuma falha) · limpo (+10 anos, 0 violações) · PASSOU · nenhum erro |

---

## 8. Para o líder juntar

### `qa/AUDIT.md` — as linhas

| nº | tipo | texto |
|---|---|---|
| L-915 | bug (consertado, F: D-241; pedido do líder no T-921) | **O sol que se demora só segurava o relógio: a fome e o cansaço corriam em segundos.** Enquanto uma cena das histórias corre, o relógio do dia anda a 0,35 (`main.js` `tick`, «a night scene does not end in the middle of it») — e o `needs` contava a fome, a energia e o sono pelos segundos (`dt / G.DAY_K`): uma tarde com cena custava perto de três vezes a energia das horas dela, e um dia de 218 s dava 9% de fome a mais. As cenas correm no passo e no salto (o módulo é do ritmo rápido): 7% a 19% dos passos de dez anos saltados, um dia de 210 a 228 s em média. Medido na metrópole pronta, quatro dias de 200, 217, 261 e 200 s: às 0,60 dormiam ou iam dormir pelo cansaço 12, 163, 315 e 18 de ~362 adultos. **Correção:** uma porta só para o passo do dia — `G.dayPace()` (`js/world.js`: 0,35 com uma cena a correr, 1 sem), pedida uma vez por passo pelo `tick`, que guarda a resposta em `G.pace`; o relógio do dia e, no `needs`, a fome, a queda da energia e o que o sono devolve andam por ele («dn»). A idade, a doença, a vida que a fome tira e o que se conta em segundos ficam em segundos. Nada no save (um mundo novo e um save aberto recomeçam em 1). Depois, quatro dias de 200, 269, 244 e 200 s: 7, 16, 10 e 23. **Prova:** `qa/dia.js` s1 a s3 (20 s com uma cena: 3,5 centésimos do dia, a energia −4,37, a fome +3,99, quem dorme +15,91, a idade +0,100; 200 perguntas à cena em 200 passos, com 705 pessoas), v3 e h (a regra do verificador). **Sabotagens:** d1 a d8 (§7 do `bloco-F3.md`). |
| L-916 | bug (achado pelo F, **aberto** — é do `act-casa.js` e da regra P7 do `morar-palacio-inv.js`: do H e do líder; não é da 3ª rodada) | **Quem mora na sede cheia demais e casa com alguém de outra casa fica nela até a cidade juntar o casal — e o verificador acusa-o o dia inteiro.** Achado pelo v4 da `qa/dia.js` (o verificador olhado de dois em dois segundos nos dias vividos) na mega com um sorteio antes do primeiro passo: «Nefertiti #13938 mora em paco#8062, cheia demais (8 para 6 camas), sem ser dos que têm de morar com quem governa (D-206)», do dia 52 às 0,32 ao dia 53 às 0,33 — **202 s**. Com rastro: Nefertiti, 18 anos, filha dos dois que governam (Tiye #6023 e Ptahhotep #6889), com o par Khufu #14231, que mora noutra casa (#8176); na sede, oito para seis camas. O `crowd` (`act-casa.js`) tira da sede cheia, primeiro, as casas dos parentes casados **cujo par mora na sede** (`L.some(o => o.id === v.partner)`) e, depois, os crescidos **sem par** (`!o.partner`): quem tem o par a morar noutra casa não é de nenhuma das duas listas e fica, até a rotina das casas juntar o casal no dia seguinte. A regra P7 do verificador conta-a entre os que têm de sair (o par não está na sede, não tem pequenos, não cuida deles) depois de 8 s. Na `8490aa9` sem a 3ª rodada, os mesmos três dias (dois sorteios) não a mostram: é da história (quem tem par aos dezoito), não da energia. **Proposta, não feita:** no `crowd`, o segundo laço leva também o crescido cujo par não mora na sede (para a casa do par, se couber); ou a P7 dá ao recém-casado o dia que a cidade leva a juntar o casal. Como reproduzir: `SHIFT=1 node qa/dia.js mega` com `ONLY=v` (ou o verificador a cada 2 s em três dias vividos da mega, na paz do deus). |
| D-240 | decisão (do líder, a do T-921; feita pelo F) | **Quem descansa cansa menos do que quem trabalha, e o dia de cada um dura até a hora de deitar do relógio dele.** Acordado, a energia cai pelo que o corpo faz: a trabalhar ou a andar, 100/80 por centésimo do dia, como sempre (o velho 1,12; quem foge 1,6); em descanso — parado e à toa: à mesa da taverna, na plateia, sobre um rolo, na água dos banhos, na conversa da praça ou de um amigo, junto à fogueira ou à porta de casa, com a família à porta, em casa acordado (à ceia, junto do fogo, de cama, de luto), abrigado da tempestade, a rezar —, uma fração `G.Vg.REST` disso. O cansaço do trabalho e os limiares do sono (22 e 15) não mudam: o dia de trabalho é o mesmo, e a tarde dura até a hora de deitar (`G.Lar.clock`). Uma porta pura (`G.Vg.resting(v)`), a tabela num lugar só (`js/villagers.js`), lida só pelo `needs`; a caminhada até o lugar cansa como caminhada. Sem campo novo na pessoa, nada no save, nenhum sorteio. O alvo do K: o adulto que trabalha até o fim da tarde e depois descansa chega à hora de deitar com a energia perto de 22, e quem senta à mesa da taverna pode ficar até ela fechar. |
| D-241 | decisão (F) | **O que vai com o dia e o que fica em segundos.** Com o passo do dia (`G.pace`): a fome (acordado e a dormir), a queda da energia de quem está acordado e o que o sono devolve — o que guarda o ritmo do dia. Em segundos: a idade (pedido do líder), a doença e a imunidade, a vida que a fome e a doença tiram, a devoção e o medo, os relógios dos gestos e das tarefas, o nado. Só o `tick` pergunta à cena e escreve o `G.pace` (regra 62 do guard); no salto, uma pergunta por meio passo rápido, antes de as pessoas viverem esse meio passo. |
| D-242 | decisão (F) | **A tabela do descanso.** O afazer e o estado dele em que o corpo descansa: `tavern` (sentado: 2, 3), `teatro` (de 1), `ler` (de 1), `termas` (2: na água; os cabides não), `praca` (2), `rest` (2), `talk` (não a dança), `pray` (2), `family` (de 2; não o filho no ar), `shelter` (2), `lar` (2; não cozinhar nem cuidar dos pequenos). Nunca: quem anda (`v.moving`) ou dorme; **um afazer de trabalho (`kind: 'work'`), seja qual for o gesto** — o sacerdote que conduz as orações está no ofício dele —; a pausa de um segundo e meio entre dois afazeres (`idle`, que o texto da pessoa chama «Descansando») e o passeio; a refeição no armazém; **a festa** (a tarefa não diz o estágio — a marcha, a dança, o banquete são do `festivals.js` —, e a porta não lê o gesto: 3,7 centésimos por adulto-dia parados numa festa ficam de fora; para o banquete e a vigília contarem, uma linha na tabela e uma porta de leitura do estágio). Afazer novo em que a pessoa fica parada e à toa: uma linha na tabela, com o estado, e um caso no a2 da `qa/dia.js`. |
| D-243 | decisão (F) | **`G.Vg.REST = 0,2`, pela conta do adulto do alvo.** Acorda às 0,03 com 100, trabalha até as 0,60 (28,8), descansa: na hora de deitar (0,775) tem 17,8 com 0,5; 22,2 com 0,3; **24,4 com 0,2**; às 0,88, quando a taverna fecha, 18,3 com 0,3 (sai da mesa às 0,78) e **21,8 com 0,2**. Só o 0,2 dá as duas metades do alvo. Pela mão (`qa/dia.js` a4): 30,0 às 0,60, 24,3 na hora de deitar (0,829), 23,0 às 0,88. Medido na metrópole com 0,3 e com 0,2 (a dormir pelo cansaço às 0,70: 117 e 84 de ~390). Baixar mais não rende: a gente descansa 6 centésimos por dia (T-940). |
| D-244 | decisão (F) | **O corpo do deus descansa pelo lugar que as mãos dele seguram.** A marca do corpo é a tarefa `avatar`, que não diz o que o corpo faz; a regra física é a mesma: de pé ou a andar cansa 100/80 por centésimo, e com um lugar de descanso da planta nas mãos (`S.avatar.use`, posto por `G.Possess.use`: sentar, comer, beber, ler, banhar, rezar, assistir, deitar, aquecer) cansa `REST` disso. Num lugar de trabalho da planta (cozinhar, moldar, vender…), como no trabalho. `qa/dia.js` b1: 5,31 em 4,25 centésimos de pé; 1,06 deitado. |
| T-940 | limite (aberto; a decisão é do líder) | **No mundo vivido o alvo da D-240 não se alcança só com o descanso: a gente descansa 6 centésimos do dia, e o alvo pede 15.** Para chegar à hora de deitar (0,775) com 22, quem acorda às 0,03 precisa de 15 centésimos em descanso (78 = 1,25 × (74,5 − r) + 0,25 × r). Medido (a metrópole, três dias, 1 130 adulto-dias): por adulto-dia, 73,4 centésimos acordado — 5,8 em descanso, **45,3 a andar**, 22,3 parado sem descanso; das 0,60 à hora de deitar, 14,6 acordado — 3,5 em descanso, 8,0 a andar. Depois da rodada, às 0,66 dormem ou vão dormir pelo cansaço 5% a 10% dos adultos (eram 22% a 42%), às 0,70, 13% a 33% (eram 23% a 55%), às 0,73, 22% a 49% (eram 40% a 64%); na hora de deitar do relógio de cada um, 45% a 61% já estão na cama (eram 57% a 73%), e a energia dos acordados tem a mediana em 25 a 37. Na mega de tempestade (18 centésimos por dia em casa fora da chuva, que é descanso) só 13% dormem pelo cansaço às 0,70: onde há os 15 centésimos, o alvo aparece. A tarde não é de descanso porque o que vem depois do trabalho são afazeres curtos (a família à porta, a horta, a ceia a cozinhar, a praça, um copo de sete segundos) com uma caminhada entre cada dois, e a noite em casa junto do fogo (`G.Lar.urge`) só começa depois de escurecer. **Propostas, não feitas** (outras alavancas): (1) a tarde em casa — quem escolhe a casa ao fim do dia de trabalho fica nela acordado até a hora de deitar (`act-lar.js`); (2) a taverna até fechar — a visita dura sete segundos e a taverna só se escolhe até as 0,73: mais um copo enquanto a energia e a bolsa dão, e a escolha a valer depois de escurecer (`act-taverna.js`, `decide`); (3) o banquete e a vigília de uma festa como descanso (D-242). |
| T-941 | limite do verificador (dito) | **A regra «ninguém acordado cansa mais depressa do que o dia» só fala entre duas olhadas a até doze segundos uma da outra.** Guarda de cada um a energia, o relógio do dia e os segundos da olhada anterior (no arquivo da regra, nunca no mundo), e só julga a queda que os segundos explicam e o dia não, com o sol a demorar-se no meio; uma queda maior é um golpe (o inverno do deus, a ressaca, a mão de uma prova). Numa vida olhada de ano em ano, ou no fim de um salto, não diz nada: é das provas que olham de perto (`qa/dia.js` v3: de dois em dois segundos; h). As outras duas regras do sistema «dia» (o passo do dia é 1 ou 0,35; ninguém em descanso a andar, a dormir ou no trabalho) valem a qualquer olhada. |
| T-942 | limite de teste (dito) | **Os pisos dos dias vividos da `qa/dia.js` saíram de oito histórias, e o segundo é um cinto.** Às 0,66 dormiam ou iam dormir pelo cansaço 22% a 42% dos adultos antes e 5% a 10% depois: o piso de 15% separa os dois lados em todas. Às 0,70, 23% a 55% antes e 13% a 33% depois: o piso de 40% não acusa sozinho a rodada desfeita (a mega de tempestade de antes tinha 23%). O dia de trabalho (v2) não se mede pelos centésimos por adulto-dia: debaixo de uma tempestade ninguém trabalha, e a mega com a tempestade sobre um terço das horas de trabalho tem 21 centésimos por 30 sem ela, antes ou depois da rodada — a primeira versão do caso (22 centésimos por adulto-dia) falhava nela. Mede-se pela parte dos adultos acordados que está no trabalho nas horas de trabalho (0,05 a 0,60) com tempo bom: 46% a 55% antes, 51% a 55% depois; o piso é 42%. E uma história pode não ter cena nenhuma em quatro dias (0% a 28% dos segundos): o v3 tem os seus 30 s com o sol a demorar-se pela mão da prova. |
| T-943 | limite de teste (consertado na prova, F; achado pelo líder ao juntar a 2ª rodada) | **O `qa/freguesia.js` b1 falhava na árvore juntada: «Tebas (62 pessoas, 35 lugares) 0, 4, 8, 9 … 1 vazios».** Com rastro (quem tinha a vontade do dia em Tebas e o que impedia cada um, de 0,05 em 0,05 do dia): o primeiro dia vivido é inteiro (o mundo começa às 0,002) e a fornalha estava acesa; uma festa na cidade até as 0,40 e a hora de cada um tarde (8 a 10 dos 11 com a vontade «antes da hora dele» até as 0,35); às 0,40 dois ou três a caminho — e **uma tempestade das 0,42 até depois de fechar**: 17 a 21 dos 25 adultos em casa fora dela (o abrigo pesa 1,05, o banho 0,4), e de casa já não havia tempo antes de fechar. Na saída do líder, a mesma causa: «a caminho, largaram: {"shelter":16}». O jogo está certo. | `qa/freguesia.js` b1: o dia em que a tempestade esteve sobre a cidade em 40% ou mais das horas dos banhos (a regra do abrigo do jogo: `S.weather.storm > 0 && S.weather.rain > 0.3`) é dito («·tempestade») e não se conta, como o da cidade em armas; os banhos desse dia saem dos dois lados da média. O que o caso afirma não mudou: cada dia de banhos com a fornalha acesa, em paz e sem a tempestade a levar o dia, tem banhistas (três dias desses ao menos, três banhos por dia na média). |
| T-944 | limite de teste (consertado na prova, F; achado pela regressão de descoberta da fundação) | **O `qa/visual/termas-corpo.js` 2 falhava: «a fornalha: o lugar não está livre para o corpo».** Com o posto (D-227) o foguista está à fornalha desde antes de abrir até o fogo dado até fechar, e o lugar dela (um só, o uso «alimentar») é dele: um lugar, uma pessoa (D-085). O corpo que não é o foguista não tem a oferta de alimentar o fogo (`act-servicos.js`, `offers`: só o corpo foguista destes banhos). Antes da D-227 o foguista só estava à fornalha nos segundos de cada acha, e o caso achava o lugar vazio. | `qa/visual/termas-corpo.js` 2: com o lugar tomado, o caso confere que é do foguista destes banhos, leva o corpo a um passo dele e confere que o lugar não lhe é dado; depois dá o fogo até fechar pela mão da prova (o livro do dia, até as duas achas que a fornalha leva), espera o foguista sair e leva o corpo ao lugar livre. Depois: «a fornalha era de Caio, o foguista de posto: o corpo a 0,08 m dela, o lugar não era para ele; com o fogo dado até fechar, o foguista saiu em 5 s (de posto: não) e o lugar ficou livre». |
| T-945 | resposta com rastro (F; a pergunta do T-855) | **A praça não corta a caminhada de quem ia à taverna.** A ida à taverna pesa 0,5 (`G.Taverna.visitTask`), o caminho de casa e a praça 0,45, e a vontade da praça é zero para quem tem um afazer de 0,45 ou mais (`Pr.urge`). Medido na metrópole, quatro dias vividos: de 138 idas à taverna antes da 3ª rodada e 197 depois, **nenhuma** acabou na praça (em 12 s); o que toma a caminhada é a cama pelo cansaço (36 e 39), a refeição (20 e 16), a festa, uma história. **O `som` s5a de antes do T-855 falhava por uma tempestade:** a prova inteira na `580a920`, com rastro de cada mandado — dos 111, 68 não sentaram por «shelter» (1,05), 23 pela hora de deitar («sleep», 1,5), 3 pela festa, 3 chamados ao balcão, nenhum pela praça nem pelo caminho de casa; na árvore da 3ª rodada o mesmo caso passa (outra história: «4 às mesas»). A visita segurada pela prova (T-855) fica bem — o caso é o som da taverna, não o tempo —; a causa escrita no T-855 («a praça a caminho, 0,45, corta a caminhada à taverna, 0,4») corrige-se por esta. |
| T-946 | limite (aberto) | **Em dez anos de paz saem 8% menos navios mercantes depois da 3ª rodada do F** (quatro histórias de cada lado: 61 · 57 · 60 · 59 antes, 59 · 48 · 59 · 51 depois; as notas de cais 195 → 179). Não é a noite (as saídas por oitavo do dia, numa história: 16, 9, 6, 9, 7, 9, 1, 0 antes e 16, 8, 4, 8, 5, 6, 1, 0 depois; os marinheiros em terra a dormir, 38% e 39% dos olhares). Acompanha a comida produzida, que desce 6% na média (o L-915: come-se pelo dia) — nas três histórias em que ela desce os navios descem, na que sobe ficam iguais. A hipótese, não provada: menos comida produzida, menos carga para levar. A gente (969 → 970), os armazéns (6 092 → 6 122 de comida), as mortes de fome (0 → 0), a madeira (+4%) e a pedra (+16%) não caem. |
| T-947 | limite de teste (dito) | **A mão de uma prova que segura alguém num afazer renova-o antes dos 70 s.** Todo afazer fora da lista dos longos (`villagers.js`, `LONG`) acaba aos 70 s de idade, e o seguinte vem pela escolha de cada um: o a4 da `qa/dia.js` (um dia inteiro de pé e depois em descanso, pela mão) dava 43,5 às 0,60 em vez de 30 — o afazer da prova tinha acabado às 0,39 e a pessoa foi ler. A mão renova o afazer a cada 40 s. E um corpo largado dentro de casa fica um passo sem afazer («dentro sem motivo», S2 do lar): a prova vive um segundo depois de largar o corpo antes de olhar. |
| T-948 | limite de teste (dito) | **Nenhuma sabotagem ficou sem acusação.** As 29 sabotagens das regras desta rodada (o passo do dia d1 a d8, o descanso r1 a r17, o verificador i1 a i4) são acusadas pela `qa/dia.js`, a c1 (a D-245 desfeita) pela `qa/praca.js` a1, e as 17 mentiras das regras 62 e 63 pelo `guard.js`. O que fica dito: a fila das sabotagens foi cortada uma vez no meio (o limite de duas horas das tarefas em segundo plano, na r12) e relançada pelo líder fora dele — as que já tinham resultado não rodaram de novo —, e a c1, que a fila não tinha, rodou à parte. A sabotagem só diz que a prova enxerga a regra desfeita; o que a regra vale no mundo vivido está no §3. |

### As linhas exatas em arquivos que não são meus

- **`js/world.js`** — nove linhas novas logo depois de `G.DAY_K = G.DAY_LEN / 100;`: o comentário (cinco linhas), `G.LINGER = 0.35;`, `G.dayPace = () => (G.Scene && G.Scene.lingers && G.Scene.lingers() ? G.LINGER : 1);`, `G.pace = 1;` e `G.worldHooks.push(() => { G.pace = 1; });`. Nada mais.
- **`js/main.js`** — no `tick`: o comentário de uma linha virou duas, e a linha `S.time += dt / G.DAY_LEN * (G.Scene && G.Scene.lingers && G.Scene.lingers() ? 0.35 : 1);` virou `G.pace = G.dayPace();` e `S.time += dt / G.DAY_LEN * G.pace;`. O `skipStep` não mudou (chama o mesmo `tick`).
- **`js/villagers.js`** — (1) o bloco novo «rest (D-240)» antes do `needs`: `Vg.REST`, `REST_TASK`, `LAR_WORK`, `REST_USE`, `Vg.resting`; (2) no `needs`: `const dd = dt / G.DAY_K;` ganhou `const dn = dd * G.pace;`; a linha da fome usa `dn` em vez de `dd`; a linha da energia usa `dn` nos dois ramos e ganhou `* (Vg.resting(v) ? Vg.REST : 1)` no de quem está acordado. As outras contas do `needs` (a vida que a fome e a doença tiram) continuam com `dd`. Nada no `decide`, nada nos limiares.
- **`qa/freguesia.js`** (b1, T-943) — o cabeçalho (a frase do dia de tempestade); em `partB`: o mapa `storm` e a função `stormy` (com o comentário), a linha que conta os olhares de tempestade nas horas de cada banho, dentro do `live`; no b1: `stormDays` e `stormEnt` na declaração, a função `inStorm`, o `if (inStorm(r)) { stormDays++; stormEnt += r.ent; continue; }` no laço dos dias, o «·tempestade» na linha de cada cidade, `total - stormEnt >= lit0 * 3` no lugar de `total >= lit0 * 3` (os banhos de um dia de tempestade saem dos dois lados da média), e o texto do caso («em paz e sem a tempestade a levar o dia», os dias de tempestade contados e ditos).
- **`qa/visual/termas-corpo.js`** (caso 2, T-944) — o cabeçalho (o parágrafo do lugar da fornalha); no laço dos lugares: `const pl` virou `let pl`, o bloco novo `if (!pl && e.use === 'alimentar') { … }` (quem tem o lugar, se é o foguista destes banhos, o corpo a um passo, o lugar não dado, o fogo dado até fechar pela mão, a espera, o lugar livre), a variável `post` com o que se viu, dita na linha do caso; o título do caso ganhou «(a fornalha, quando o foguista deixa o posto: D-227)». Os outros casos não mudaram.

### `qa/README.md` — as linhas

| arquivo | como rodar | o que prova |
|---|---|---|
| `dia.js` | `[ONLY=a,s,b,v,n,h] [DIAS=n] [SHIFT=k] node dia.js [metropole\|mega]` (≈ 8 min inteira; as partes da mão — `ONLY=a,s,b,h` — em 3 min) | O dia de cada um dura até a hora de deitar (D-240 a D-244) e o sol que se demora segura a fome e o cansaço (L-915), em Node: o descanso contra o trabalho pela mão, a tabela do descanso entrada a entrada, o adulto do alvo, uma cena a correr (o relógio, a fome, o cansaço e o sono a 0,35; a idade em segundos; a porta pedida uma vez por passo), o corpo do deus, três dias vividos na paz do deus (quem dorme pelo cansaço às 0,66 e às 0,70, o dia de trabalho, a regra «ninguém acordado cansa mais depressa do que o dia»), um save a meio da noite, o verificador. `SHIFT=k` vive outra história dos mesmos dias. Cobre `js/world.js` (`G.dayPace`, `G.pace`), o `tick` do `js/main.js`, o `needs` e o `Vg.resting` do `js/villagers.js` |
| `dia-inv.js` | carregado pelo `dia.js` (e pelo `junta-inv.js`) | As regras do verificador do sistema «dia»: o passo do dia é 1 ou o do sol que se demora; ninguém em descanso a andar, a dormir nem num afazer de trabalho; ninguém acordado cansa mais depressa do que o dia (entre olhadas a até 12 s: T-941) |

### `qa/regress.sh`

Na fase «fundacao», junto das provas da vida nas casas: `F dia dia.js; F dia-mega dia.js mega`. E `qa/dia-inv.js` na lista do `qa/junta-inv.js` (a regra 21 do guard cobra).

### `qa/guard.js` — as regras 62 e 63

Prontas para colar antes do `if (fails.length)` final. Testadas numa cópia do guard fora da árvore: a árvore limpa passa («PASSOU (156 arquivos)»), e as 17 mentiras, cada uma numa cópia do `js/`, são acusadas (a lista no §7).

```js
// 62. "o passo do dia tem uma porta só" (L-915, D-241): enquanto uma cena corre o sol se demora, e o que guarda o ritmo do dia
// vai com ele. (a) só o G.dayPace (world.js) pergunta ao Scene.lingers; (b) o passo de cada passo do mundo (G.pace) só o tick
// do main.js escreve — e o world.js, que o declara e o repõe a 1 num mundo novo ou num save aberto —, e só o tick chama o
// G.dayPace: quem vive o passo lê o G.pace, uma conta por passo, não por pessoa; (c) o relógio do dia anda por ele (main.js) e
// a fome e a energia do dia também (villagers.js needs: «dn»); a idade, a doença e o que se conta em segundos, não
for (const f of files) src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/\.lingers\s*\(/.test(c) && !(f === 'world.js' && /G\.dayPace = \(\) =>/.test(c))) fails.push(`o passo do dia: ${f}:${k + 1} pergunta ao Scene.lingers fora do G.dayPace (L-915): ${l.trim().slice(0, 110)}`);
  if (/\bG\.pace\s*(=(?!=)|[-+*/]=|\+\+|--)/.test(c) && !(f === 'main.js' && c.trim() === 'G.pace = G.dayPace();') && !(f === 'world.js' && (c.trim() === 'G.pace = 1;' || c.trim() === 'G.worldHooks.push(() => { G.pace = 1; });'))) fails.push(`o passo do dia: ${f}:${k + 1} escreve o G.pace fora do tick (L-915): ${l.trim().slice(0, 110)}`);
  if (/\bG\.dayPace\s*\(/.test(c) && !(f === 'main.js' && c.trim() === 'G.pace = G.dayPace();')) fails.push(`o passo do dia: ${f}:${k + 1} chama o G.dayPace fora do tick — quem vive o passo lê o G.pace (L-915): ${l.trim().slice(0, 110)}`); });
{ const code = l => l.replace(/(^|\s)\/\/\s.*$/, ''); const Lm = (src['main.js'] || []).map(code), Lv = (src['villagers.js'] || []).map(code), Lw = (src['world.js'] || []).map(code);
  const tk = Lm.filter(l => /\bS\.time\s*\+=/.test(l));
  if (tk.length !== 1 || !/S\.time \+= dt \/ G\.DAY_LEN \* G\.pace;/.test(tk[0])) fails.push('o passo do dia: o relógio do dia (main.js tick, «S.time += …») não anda pelo G.pace, ou anda em mais de um lugar (L-915)');
  const hg = Lv.filter(l => /^\s*v\.hunger = Math\.min\(100, v\.hunger \+ /.test(l)), en = Lv.filter(l => /^\s*if \(v\.age >= 2\) v\.energy = G\.clamp\(v\.energy \+ /.test(l));
  if (hg.length !== 1 || !/v\.hunger \+ dn \* /.test(hg[0])) fails.push('o passo do dia: a fome do dia (villagers.js needs) não anda pelo passo do dia («dn») (L-915)');
  if (en.length !== 1 || !/\(awake \? -dn \* /.test(en[0]) || !/ : dn \* \(100 \/ 22\)\)/.test(en[0])) fails.push('o passo do dia: a energia do dia (villagers.js needs) não anda pelo passo do dia («dn») (L-915)');
  if (Lv.filter(l => /const dn = dd \* G\.pace;/.test(l)).length !== 1) fails.push('o passo do dia: villagers.js needs sem «const dn = dd * G.pace» (L-915)');
  if (!Lv.some(l => /^\s*v\.age \+= dt \/ day;/.test(l))) fails.push('o passo do dia: a idade (villagers.js needs) deixou de andar em segundos («v.age += dt / day») (D-241)');
  if (!Lw.some(l => /G\.worldHooks\.push\(\(\) => \{ G\.pace = 1; \}\);/.test(l))) fails.push('o passo do dia: world.js não repõe o G.pace num mundo novo ou num save aberto (L-915)'); }
// 63. "o descanso tem uma tabela só, e o cansaço do dia é do needs" (D-240, D-242): (a) a parte do descanso (Vg.REST) e a porta
// (Vg.resting) entram na conta da energia numa linha só — a do needs (villagers.js) —, e nenhum outro arquivo do jogo lê o
// Vg.REST; (b) a porta e a tabela só leem: nenhuma escrita na pessoa, na tarefa ou no mundo e nenhum sorteio, do «Vg.REST =»
// ao fim do «Vg.resting = function»; (c) nenhuma outra linha do jogo muda a energia de alguém por uma taxa do tempo (× dt,
// dd, dn): o cansaço do dia é do needs — o nado, que cansa em segundos, é a exceção dita
{ const code = l => l.replace(/(^|\s)\/\/\s.*$/, ''); const L = (src['villagers.js'] || []).map(code);
  const a = L.findIndex(l => /^\s*Vg\.REST = /.test(l)), r = L.findIndex(l => /^\s*Vg\.resting = function \(v\) \{/.test(l));
  if (a < 0 || r < a) fails.push('o descanso: villagers.js sem «Vg.REST =» seguido de «Vg.resting = function (v) {» — a regra 63 não acha a porta');
  else { let z = r + 1; while (z < L.length && !/^  \};?$/.test(L[z])) z++;
    for (let k = a + 1; k <= z; k++) { const c = L[k];
      if (/\b(v|t|a|o|S|G\.S)\.[\w.]+\s*(=(?!=)|[-+*/]=|\+\+|--)/.test(c) || /\b(Vg\.setTask|Vg\.give|Vg\.endTask|setTask|end)\s*\(/.test(c)) fails.push(`o descanso: villagers.js:${k + 1} escreve dentro da porta do descanso (D-240): ${c.trim().slice(0, 110)}`);
      if (/\bG\.(R|rr|ri|pick|chance|shuffle|VR|vrr|vri|vpick|vchance|vshuffle)\s*\(|Math\.random/.test(c)) fails.push(`o descanso: villagers.js:${k + 1} sorteia dentro da porta do descanso (D-240): ${c.trim().slice(0, 110)}`); } }
  const use = []; for (const f of files) src[f].forEach((l, k) => { const c = code(l); if (/\bVg\.REST\b/.test(c) && !/^\s*Vg\.REST = /.test(c)) use.push([f, k + 1, c]); });
  const en = use.filter(([f, , c]) => f === 'villagers.js' && /^\s*if \(v\.age >= 2\) v\.energy = G\.clamp\(v\.energy \+ /.test(c) && /\* \(Vg\.resting\(v\) \? Vg\.REST : 1\)/.test(c));
  if (en.length !== 1) fails.push('o descanso: a linha da energia do needs (villagers.js) não tem «* (Vg.resting(v) ? Vg.REST : 1)» (D-240)');
  for (const [f, k, c] of use) if (!en.some(e => e[0] === f && e[1] === k)) fails.push(`o descanso: ${f}:${k} lê o Vg.REST fora da linha da energia do needs (D-240): ${c.trim().slice(0, 110)}`);
  const RATE_OK = [['villagers.js', 'v.energy -= dt * 3;']]; // (swimming for one's life: in seconds, with or without a scene)
  for (const f of files) src[f].forEach((l, k) => { const c = code(l); const m = /\.energy\s*([-+*/]?=)(?!=)([^;]*)/.exec(c); if (!m || !/\b(dt|dd|dn|dt2|h)\b/.test(m[2])) return;
    if (f === 'villagers.js' && /^\s*if \(v\.age >= 2\) v\.energy = G\.clamp\(v\.energy \+ \(awake \? -dn \* /.test(c)) return; if (ok(RATE_OK, f, l)) return;
    fails.push(`o descanso: ${f}:${k + 1} muda a energia de alguém por uma taxa do tempo fora do needs (D-240): ${l.trim().slice(0, 110)}`); }); }
```

### `CLAUDE.md` — as frases

No protocolo, ponto 3 (antes de cada commit), junto das outras:

> Mexeu no passo do dia, na fome ou no cansaço (`world.js` — `G.dayPace`, `G.pace` —, o `tick` do `main.js`, o `needs` e o `Vg.resting` do `villagers.js`), ou num afazer em que a pessoa fica parada e à toa? Também `node qa/dia.js` (as partes da mão em três minutos: `ONLY=a,s,b,h`; a prova inteira, com os dias vividos, 8 min; `node qa/dia.js mega` antes da versão).

Nas fundações:

> - **O passo do dia — `G.dayPace` / `G.pace`** (`js/world.js`, L-915, D-241): enquanto uma cena corre o sol se demora (o relógio do dia a `G.LINGER`, 0,35), e o que guarda o ritmo do dia vai com ele — a fome, o cansaço e o sono (`villagers.js` `needs`: «dn»). Só o `tick` do `main.js` pergunta (`G.pace = G.dayPace()`, uma vez por passo; no salto, uma por meio passo rápido) e quem vive o passo lê o `G.pace`: ninguém mais pergunta ao `G.Scene.lingers` nem escreve o `G.pace` (o `guard.js` cobra, regra 62). A idade, a doença, a vida que a fome tira e tudo o que se conta em segundos continuam em segundos. **Ritmo novo que seja do dia** (uma necessidade que cresce por centésimo do dia) multiplica pelo `G.pace`; a duração de um gesto ou de uma tarefa, não. Não vai no save: um mundo novo e um save aberto recomeçam em 1. `qa/dia.js` prova.
> - **Quem descansa cansa menos — `G.Vg.resting(v)` / `G.Vg.REST`** (`js/villagers.js`, D-240, D-242 a D-244): acordado, a energia cai pelo que o corpo faz — a trabalhar ou a andar, 100/80 por centésimo do dia; parado e à toa (à mesa da taverna, na plateia, sobre um rolo, na água dos banhos, na conversa da praça ou de um amigo, junto à fogueira ou à porta de casa, com a família à porta, em casa acordado, abrigado da tempestade, a rezar), `Vg.REST` (0,2) disso. Uma tabela só — o afazer e o estado dele em que o corpo descansa; a caminhada até lá cansa como caminhada —, lida só pelo `needs` (regra 63); a porta é pura. **O trabalho do dia (`kind: 'work'`) cansa como trabalho, seja qual for o gesto**; o corpo do deus descansa pelo lugar que as mãos dele seguram (`S.avatar.use`). **Afazer novo em que a pessoa fica parada e à toa** entra na tabela com o estado certo e no a2 da `qa/dia.js`; nenhuma outra linha do jogo muda a energia de alguém por uma taxa do tempo. O cansaço do trabalho, os limiares do sono (22 e 15) e o `REST` não se mexem sem medir de novo o adulto do alvo (`qa/dia.js` a4) e os dias vividos (v1): a tarde de cada um depende deles (T-940).

### `qa/patch3/PLANO.md`

> **A 3ª rodada do F (D-240, L-915), juntada sobre a `8490aa9`.** Feito: o passo do dia numa porta só (a fome e o cansaço com o relógio quando o sol se demora) e o descanso que cansa menos (`G.Vg.resting`, `REST` 0,2), com a `qa/dia.js`, as regras 62 e 63 do guard e o sistema «dia» do verificador. Medido em oito histórias: às 0,66 dormem pelo cansaço 5% a 10% dos adultos (eram 22% a 42%); às 0,70, 13% a 33% (eram 23% a 55%). **Aberto, para decisão:** T-940 (o alvo pede 15 centésimos de descanso por dia e a gente descansa 6: a tarde em casa, a taverna até fechar, o banquete da festa) e T-946 (8% menos navios em dez anos de paz). Respondido com rastro: o `freguesia` b1 e o `som` s5a eram tempestades (T-943, T-945); a fornalha é do foguista de posto (T-944).

---

## 9. Na junção (o líder)

A rodada entrou na árvore de integração `int20` (o merge `cc18b0b`, o bloco aplicado em `ffe0e4e`), por cima do lote do líder
que já estava na principal (`a634b1d`: L-727 a L-730, T-959, T-960, T-868, T-869). O que a junção achou e fez:

| entrada | o quê |
|---|---|
| **T-961** | `qa/roupa.js` r5 (a bebedeira no 3D): o caso media o cambalear nos primeiros quadros, com o corpo ainda a aquecer; a prova aquece 30 quadros antes de medir — limite da prova. |
| **D-246**, **T-962** | `qa/casa-dentro.js` c5: com a noite em casa desta rodada, a casa come junta onde a família está acordada (o caso afirma isso, não uma peça); e a folha da ceia na matriz (`qa/categorias/p1.js`) com as peças da casa de hoje. |
| **T-963** | `qa/som.js` s3a: o ouvido da prova caía no bairro vizinho da estivadora (o fundo de um bairro conta as mãos do bairro do ouvido) — limite da prova. |
| **T-964** | `qa/som.js` s7a: o bairro olhado era a cidade velha, cujos chãos o jogo redesenha quase todo dia; a prova olha outro bairro, lê em cada chão dele e recomeça noutra história se ele for redesenhado — limite da prova. |
| **L-731** | **defeito do jogo**, achado pelo `volta.js` v3 da regressão de descoberta: a guerra perguntava «há caminho?» à busca do instante, e o portão fechado pelo alarme virava «não há caminho» — nenhum exército contra a capital murada em alarme, nenhum socorro para a cidade murada sitiada. Consertado pelo mapa de regiões (`wars.js`, `war.js`, `village.js`, `city.js`); regra 85 do guard; prova nova `qa/portao-guerra.js` (sem o conserto, p1 a p3 falham; com ele, os quatro passam). |
| **L-732** | aberto: os muros têm buracos (as hortas, os currais, os pomares e as ruas na linha); só o de Mênfis, dos 22 muros dos mundos prontos, fecha a cidade. Para uma rodada própria. |
| **T-940** | a decisão: a tarde em casa e a taverna até fechar ficam para uma rodada própria depois do fecho (a nota na linha do AUDIT). |
| T-946, L-916 | ficam abertos como o F deixou. |

As provas na árvore juntada (`ea79802`): `node qa/guard.js` PASSOU (156 arquivos); a vida curta limpa; `qa/dia.js` 18 de 18
(o F) e 20 de 20 com as partes novas; `qa/som.js` 34 de 34; `qa/portao-guerra.js` 5 de 5; as vizinhas da guerra e dos muros
(guerra10 nos quatro mundos, vira, cativos, volta, retirada, fundadores, muros) sem nenhuma falha; e as sabotagens desta
rodada, no §7.

**A régua das dez sementes** (`regua.js`, 90 anos, a árvore juntada contra a `8208230`): no ano 90, 3 106 pessoas contra
3 774 — quase toda a diferença é a semente 77 (884 → 187: antes um império único desde o ano 61, em paz; agora quatro a
cinco povos em guerra), e sem ela 2 890 → 2 919 —; as mortes de guerra +25% (o socorro e as campanhas do L-731); as obras
grandes fundadas 42 contra 39, acabadas 37 e 37, de pé 35 e 36, caídas 2 (as duas nórdicas de madeira em Hedeby, pelo fogo:
D-219); nenhum erro. A linha completa está no L-731.
