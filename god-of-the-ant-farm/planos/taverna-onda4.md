# A taverna, quarta onda — o contrato (D-667)

O dono jogou a taverna da terceira onda («tá incrível») e pediu para fortalecê-la ainda mais. Este é o contrato da quarta onda: o que cada frente faz, os nomes que todas usam e os números de cada uma. **Nada vem do nada** (D-440): cada coisa que acontece tem a sua causa no mundo, e cada coisa usada tem origem. **O contexto manda** (D-668): a taverna é a do mundo que acontece em volta dela.

As regras de sempre valem: as fundações do `CLAUDE.md`, um acaso por sistema, o livro (`G.Depot`) para toda coisa e moeda, o `Possess.apply` para as mãos do corpo, os verbos pelo `G.Interact.verb` e as leituras puras. E vale a regra do dono (D-666): só as provas rápidas da parte mexida; nada de regressão nem de prova longa.

## O que o dono pediu

1. **Comemorações com causa.** Exemplos dele: o reino conquistou um lugar, há um novo rei, a cidade cresceu, algo muito bom aconteceu na vida do taverneiro. No dia da festa: um grupo de bardos em vez de um músico, a comida especial, a decoração diferente, as atrações.
2. **O contexto.** Com a guerra à porta e gente morrendo perto, a taverna não fica aberta com o povo bebendo. O taverneiro tranca a porta, ou abre a casa para esconder o povo, e o inimigo pode tentar arrombar a porta atrás de quem se esconde.
3. **A bebedeira pela índole.**
   - O agressivo xinga, provoca, chama para a briga e joga a cerveja no outro.
   - O amável se solta: dança no meio do salão e puxa conversa com quem não conhece.
   - Quem bebe demais cambaleia e desmaia, dentro ou na frente da taverna, e o taverneiro o tira de lá.
   - O corpo do jogador também bebe e fica bêbado: o andar torto e cambaleante, a vista turva, o desmaio na rua.
4. **A cadeia da taverna** (fundação para os ofícios). Pela procura e pelo tamanho da casa, a taverna contrata um cozinheiro e um cervejeiro, compra todo dia o que precisa e faz a sua produção, com realismo.
5. **Dois jogos de mesa, bonitos, com aposta.**
   - O jogo de dados, do tipo porrinha, num 2D estilizado: clica-se e os dados rolam.
   - O jogo de cartas de cada povo: os deuses e as criaturas de cada mitologia, em cartas lindas, de dar vontade de colecionar. A mecânica é nossa. No futuro, as cartas raras, lendárias e únicas vão poder ser colecionáveis.
6. **Mais animações**, a vida que se vê ao redor de quem senta para olhar.

## As frentes e os arquivos de cada uma

| Frente | Quem | O que faz | Arquivos seus |
|---|---|---|---|
| **T1 — A taverna no mundo que acontece** | a P7 | o contexto (a guerra, o abrigo, o arrombamento, o luto, a tempestade, a doença, o fogo perto, a fome, a festa da cidade) e as comemorações com causa | `js/act-taverna.js`, `js/taverna-contexto.js` (novo), `js/taverna-festa.js` (novo); um gancho mínimo no `war.js` / `siege.js` para o arrombamento |
| **T2 — A bebedeira** | nova | o álcool de cada bebida, o quanto cada um bebeu, a índole que decide o que o bêbado faz, o desmaio e quem o carrega; o corpo do jogador bêbado | `js/embriaguez.js` (novo, o mundo), `js/embriaguez-corpo.js` (novo, o corpo); ganchos mínimos no `villagers.js` (o `SHAPE`, o `needs`), no `possess.js`, no `cam3d.js`, no `post3d.js` e no `avatar.js` |
| **T3 — A cadeia da taverna** | nova | o cozinheiro e o cervejeiro contratados pela procura e pelo tamanho, as compras do dia, a cerveja, o vinho, o hidromel e o pulque feitos, os pratos cozinhados | `js/taverna-oficios.js` (novo); no `village.js` (os ofícios, `assignJobs`), no `economy.js` (`E.demand`) e no `act-oficio.js` (a cuba), o mínimo |
| **T4 — O jogo de dados** | nova | as regras, a tela 2D, a aposta pelo livro, os dados de verdade (a coisa nova `dados`), os fregueses que jogam entre si | `js/jogo-dados.js` (novo, puro), `js/jogo-dados-ui.js` (novo), uma seção do `css/style.css`; a linha no catálogo (`itens.js`, `itemforma.js`, `itemicons.js`) |
| **T5 — O jogo das cartas** | nova | as cartas de cada povo, a mecânica, a arte, a tela, a aposta, o baralho de verdade (pela origem), os fregueses que jogam entre si | `js/cartas.js` (novo, puro), `js/cartas-arte.js` (novo), `js/cartas-ui.js` (novo), uma seção do `css/style.css`; a linha no catálogo |
| **T6 — As animações** | a P6 | o clipe de cada ato novo desta tabela, com espelho; as duas partes de cada ato a dois | `js/taverna-clips.js`, arquivos de clipe novos, o `people3d.js` e o `vida3d.js`, o mínimo |
| **T7 — O que se vê** | a P5 | os enfeites da festa, a porta trancada e a arrombada, a bebida jogada no chão, os dados e as cartas na mesa, o prato da festa | `js/dentro3d.js`, o `within` do `atmos.js`, `arte/blender/deco*.py` → `js/decomesh.js` |
| **T8 — O que se ouve** | a P9 | o som de tudo isto | `js/audio-src.js`, `js/audio.js` |

Uma frente que precise de um arquivo de outra pede no relatório, ou faz uma mudança mínima, separada e dita. **Ninguém reescreve o trabalho de outra frente.**

## O vocabulário dos atos (o contrato: estes nomes, exatamente)

Já existem e são reaproveitados: `talk`, `chat`, `laugh`, `tell`, `gossip`, `cheer`, `hug`, `insult`, `threaten`, `shout`, `swear`, `spit`, `shove`, `fight`, `stagger`, `weep`, `carry` / `carried` (do `G.SocAtos`), e `brinde`, `danca`, `palmas`, `cantar-junto`, `cochilo`, `cambalear`, `limpar-mesa`, `recolher-canecas`, `gorjeta`, `expulsar`, `fechar`, `jogo-ossos` (da terceira onda). A causa de cada um continua a do mundo.

Os novos:

| Ato | Frente | O que é | Causa |
|---|---|---|---|
| `trancar` | T1 | o taverneiro passa a tranca na porta | o perigo à porta: a força inimiga na cidade ou perto, o alarme, gente morrendo perto |
| `abrigar` | T1 | o taverneiro chama para dentro quem está na rua | o mesmo perigo, e a índole dele (a coragem, a bondade) |
| `esconder` | T1 | quem se abriga fica agachado nos cantos, em silêncio | o perigo lá fora |
| `arrombar` | T1 | o soldado inimigo força a porta trancada | o saque ou a caça a quem se esconde; a porta tem resistência (madeira, tranca) |
| `discurso` | T1 | quem dá a festa ergue a caneca e anuncia o motivo | uma comemoração com causa |
| `jogar-bebida` / `molhado` | T2 | o bêbado agressivo joga a bebida no outro (ato a dois) | a bebedeira e a índole agressiva; a bebida que ele tinha na mão |
| `cantoria` | T2 | o bêbado canta alto, sozinho | a bebedeira e a índole expansiva |
| `desmaio` | T2 | o bêbado cai e fica deitado | beber demais para o corpo dele |
| `arrastar` / `arrastado` | T2 | o taverneiro, ou um amigo, tira o desmaiado de lá (ato a dois) | o desmaio dentro da casa; a força de quem arrasta |
| `mexer-cuba` | T3 | o cervejeiro mexe a cuba | a cerveja que a casa precisa, com o grão que tem |
| `cozinhar` | T3 | quem cozinha, no fogo da taverna (o nome já existe no `act-lar.js`; é o mesmo gesto) | o prato que a casa precisa, com o que tem |
| `jogo-dados` | T4 | os fregueses jogam dados | os dados de verdade na mesa, a índole, o dinheiro |
| `jogo-cartas` | T5 | os fregueses jogam cartas | o baralho de verdade na mesa, a índole, o dinheiro |

Cada ato novo tem a sua linha no `G.Audio.ATO` (a T8 põe o som e a frente do mundo põe a linha) e no `TASK_OF` do `vida3d.js` quando for tarefa nova. O ato a dois tem as duas partes no `Anim.DUO` (T6).

## O que se lê (os estados: quem escreve e quem lê)

| Estado | Quem escreve | Quem lê |
|---|---|---|
| `b.festa` = `{ motivo, causa, dia, ate, prato, enfeites: [{ k, de }], bardos: [ids] }` | T1 | T7 (os enfeites pelo material: as guirlandas das flores, as fitas do pano onde se tece, os estandartes do povo), T8 (a música do grupo), T6 |
| a porta da taverna: `trancada` / `arrombada` (pelo `In.doorState` / `In.doorRule`; a porta arrombada fica até ser consertada, com a madeira pelo livro) | T1 | T7, T8, T6 |
| `v.ebrio` (de 0 a cerca de 1,5; no `SHAPE` e no save; sobe com a dose de cada bebida e desce com o tempo, a comida e o sono) | T2 | T6 (o cambalear, o rosto), T8 (a voz arrastada), a tela do corpo |
| a bebida jogada no chão: uma `poca` no `op.data.chao` da taverna, pela porta da P7 | T2 | T7 |
| os jogos à mesa: `G.JogoDados.atMesa(b, mesa)` e `G.Cartas.atMesa(b, mesa)` (portas puras de cada jogo) | T4, T5 | T7 (os dados e as cartas na mesa), T6, T8 |
| os ofícios da casa: `G.TavernaOficios.staff(b)` → `{ cozinheiro, cervejeiro }` | T3 | T1, T6, T7 |

## As coisas novas do catálogo (cada uma com receita, origem e figura)

- **`dados`** (T4): de osso (do abate ou da caça) ou de madeira.
- **`baralho`** (T5): o baralho de cada povo no material que ele tem — papiro, amate, madeira, cera ou barro —, com a sua linha no `ORIGEM.md`. Não há papel nesses mundos: as «cartas» são tabuletas pintadas, e o nome do jogo pode dizê-lo.
- **Os enfeites da festa** (T1 diz o que se gasta; T7 desenha): flores (da flora ou da horta), pano (onde se tece), madeira.

## Os números reservados

| Frente | regras do guard | D | L | T |
|---|---|---|---|---|
| supervisor | — | D-667 a D-669 | — | — |
| T1 (P7) | 344 a 359 | D-812 a D-829 | L-1980 a L-1999 | T-1880 a T-1899 |
| T2 | 360 a 369 | D-830 a D-839 | L-2000 a L-2019 | T-1900 a T-1919 |
| T3 | 370 a 379 | D-840 a D-849 | L-2020 a L-2039 | T-1920 a T-1939 |
| T4 | 380 a 389 | D-850 a D-859 | L-2040 a L-2059 | T-1940 a T-1959 |
| T5 | 390 a 399 | D-860 a D-869 | L-2060 a L-2079 | T-1960 a T-1979 |
| T6 (P6) | 400 a 409 | D-870 a D-879 | L-2080 a L-2099 | T-1980 a T-1999 |
| T7 (P5) | 410 a 419 | D-880 a D-889 | L-2100 a L-2119 | T-2000 a T-2019 |
| T8 (P9) | 420 a 429 | D-890 a D-899 | L-2120 a L-2139 | T-2020 a T-2039 |

Na seção 23 do `qa/AUDIT.md`, cada frente usa uma subseção «Onda 4 — Tn».

## As decisões do supervisor

- **D-667:** este contrato.
- **D-668 — O contexto manda.** A taverna não abre para a festa nem para a bebida com a guerra à porta, o luto pelo governante, o fogo perto ou a doença na cidade. O que ela faz em cada caso é do mundo, com causa, e a índole de quem decide pesa.
- **D-669 — Os jogos são do mundo.** O resultado de um lance de dados ou de uma mão de cartas é decidido no passo do mundo, pelo `G.hash` da partida, da rodada e de quem joga, nunca pelo acaso do que só se vê. A tela só mostra o que o mundo decidiu (o rolar dos dados é a vista do resultado) e as apostas vão pelo livro. Os fregueses do mundo jogam entre si pelas mesmas regras.
