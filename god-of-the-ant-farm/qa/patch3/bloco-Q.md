# Bloco Q — «o quintal: as coisas em volta das casas» (agente Q, Bairros Vivos)

Ramo `worktree-agent-adfab9d9d2b785603`, a partir de `20b0a58`. Números usados: decisões **D-186 a D-188**, bugs **L-840 e
L-841**, limites de teste **T-840 a T-845**, regras do guard **59 e 60**. Livres: D-189, L-842 a L-859, T-846 a T-859.

Tudo aqui está pronto para colar. O que cada seção afirma foi rodado; os resultados estão na seção 7.

**Atenção ao juntar** (seção 6): as regras novas do verificador estão num arquivo novo, `qa/quintal-inv.js` — não no
`qa/atmos-inv.js`, porque mexer nele faz o `guard.js` falhar na regra 21 até o `junta-inv.js` rodar, e isso é do líder.

---

## 1. Linhas para o `qa/AUDIT.md`

```
| D-186 | decisão (do agente Q, nos Bairros Vivos — o quintal) | **As coisas em volta de um prédio ficam no lote dele, onde ninguém anda — e o prédio desenhado pela planta tem esse lugar.** O T-703 dizia: a casa, a taverna e a olaria desenhadas pela planta enchem o lote, e o que o `G.Atmos.about` diz que elas têm não tinha onde ficar (1 ou 2 coisas nas 184 casas da metrópole; nenhuma taverna com barris). **Medido:** a casa de um lote de 4 m tem a parede a 8–20 cm da beira do lote (`int-familias.js`: a margem da casca); nenhuma casa encosta noutra (na metrópole, dos 736 lados das 184 casas, nenhum dá para o lote de outro prédio: 659 dão para a rua ou chão aberto, 46 para um campo, 31 para chão que não se anda; na mega, 1 de 388 dá para outro lote); o corpo é um círculo de 0,32 m cujo centro não chega a menos de 23 cm da beira de um lote (`avatar.js`, `blocked`), e dentro do lote só pisa na soleira e nos degraus das portas (`Space.indoor`); o mapa do mundo tem o lote inteiro por parede. Logo: o único chão junto de uma casa onde uma coisa nunca é atravessada por ninguém é o próprio lote. **Decisão:** nada vai para a rua. O `props3d.js` lê a casca (`B3.shellOf`) e acha, em cada lado do lote, a faixa entre a face de fora mais perto da beira — a casca, um anexo, a cerca do terreiro, uma escada de fora — e a beira do lote (`runsOf`, `shellSlots`), cortada nas portas e nos portões (65 cm para cada lado do vão) e nos degraus que o Build3D pôs (`K.steps`). **(1) Faixa funda** (22 cm ou mais além das pedras da fundação: a casa no seu quintal, D-082; o lado da casa da taverna; o pé da cerca de um terreiro): as coisas de antes, no chão. **(2) Faixa de um palmo** (a casa do centro, 6 a 15 cm): coisas **finas**, de pé na soleira da fundação — o topo das pedras, na altura do piso, 40 cm ou mais sobre a rua — ou penduradas na parede, livres das janelas do térreo (com o alcance das venezianas) e a 10 cm das quinas (22 cm no norte: os esteios). **(3) A cabana redonda**, que enche o lote nos quatro lados: nos cantos do lote, fora do anel e das pedras (um quadrado de ~39 cm). **(4) A taverna**: os barris do que ela tem para servir, fora do terreiro — encostados na parede da casa onde o lote deixa uma faixa ao lado dela (1,2 m na taverna de 8 m dos povos de casa estreita), senão pequenos ao pé da cerca, junto do portão; a mesa e o estrado de pipas do terreiro são móveis da planta e seguem como eram. **(5) A olaria**: os potes das peças cruas ao pé da cerca, do lado de fora, junto do portão (potes de ~21 cm: a faixa tem 32). **(6) O quarteirão** entra entre as casas (não tinha coisas nem no desenho de kit). O lugar é sabido pela casca **antes do primeiro desenho** (`P3.yardOf` → `roomBy`): a assinatura do quadro conta o que há em volta desde o começo, e o primeiro quadro de um pedaço do mapa não é feito duas vezes (antes, só o desenho dizia se havia lugar). Nada disto muda a planta, a porta, o chão que o mundo anda nem onde o corpo pisa: só o `props3d.js` e três linhas do `build3d.js` (a assinatura dos montes de um armazém, L-841; `B3.made`). De longe, nada, como antes. **Custo** (medido, de perto, nível alto): metrópole +41 428 triângulos nas 207 casas, tavernas e olarias (704 934 → 746 362, 5,9 %; em média +294 por prédio com coisas, no máximo +744); cidade +6 600 (6,8 %; +254; +468); mega +25 992 (5,7 %; +309; +980); nenhuma malha a mais (as coisas vão na geometria do pedaço do mapa, com o prédio). O que há em volta muda 250 vezes por dia de mundo na metrópole (T-840): os pedaços do mapa de perto são refeitos por isso. Prova: `qa/quintal.js` (q1 a q8, metrópole, cidade e mega), as regras `qa/quintal-inv.js` e 26 sabotagens. Fecha o T-703. |
| D-187 | decisão (do agente Q, nos Bairros Vivos — o quintal) | **O que uma casa de um palmo de parede mostra.** A mesma causa de antes (`G.Atmos.about`, D-163), em peças de um palmo de fundo: **a lenha** do lenhador, rachada miúda e empilhada com uma acha de fundo, as pontas para a rua, e o machado nos seus pregos por cima (onde uma janela não deixa, a pilha baixa, sem o machado); **a bebida** que a casa guarda, uma botija de barro (de couro no norte) por bebida ou óleo, até três, na soleira junto da porta — o barril não cabe em 12 cm; na faixa funda e no canto da cabana redonda segue barril —; **os ofícios** de quem mora: a rede pendurada com as boias e o remo de pé (pescador), o couro esticado nos pregos (caçador), o escudo redondo na cor da casa e a lança (guerreiro, arqueiro), as meadas tingidas num varão (tecelão), o forcado, o ancinho e a peneira no prego (agricultor, coletor, vinhateiro) — cada um com uma variante mais estreita para a parede curta, e **até dois ofícios por casa** (cada parede tem vão para um; no quintal, um só, como antes); **o varal** rente à parede, em dois pregos, nas casas que o estendem (o id, 40 %, como antes); e **o sinal de casa habitada** junto da porta, sempre — a vassoura, a tina de lavar no prego ou a réstia de cebolas (de pimentas, nas terras do milho), qual, pelo id; onde as janelas não deixam parede, um cesto baixo na soleira; na cabana redonda, um cesto no canto. Casa vazia, nada. A lenha, as botijas e as coisas de um ofício são do mundo — quem mora ali — e nunca saem pela parte dos enfeites do nível gráfico (`Realm.Q().props`); o varal e o sinal de casa habitada saem (60 % no nível médio). O id só diz onde cada coisa fica e de que tamanho é; nenhum sorteio (regra 59 do guard). O que não tem lugar é contado e dito pela prova: toda casa habitada mostra algo (metrópole 131 de 131; cidade 24 de 24; mega 74 de 74); toda casa de lenhador, a lenha (16 de 16; mega 12 de 12); das casas com um ofício, mostram uma coisa dele 82 de 95 na metrópole, 14 de 18 na cidade e 45 de 52 na mega — as outras não têm vão de parede livre de portas e janelas (ou são cabanas redondas: 2 na cidade, 1 na mega). |
| D-188 | decisão (do agente Q, nos Bairros Vivos — o quintal) | **A vista do deus não mostra nada em volta das casas, e segue assim.** Conferido: o desenho do deus de uma casa é o retrato do tipo e do povo (um para todas as casas iguais — `arch.js`, `art.js`), sem lenha, barril, varal nem coisas de ofício; o que ela mostra em volta de um prédio são os montes do estoque junto do armazém (`render.js`, `drawPiles` — os mesmos números do 3D, `Props3D.piles`) e, nos terreiros da taverna e da olaria, os móveis da planta (a mesa, as pipas, a talha, o forno, as estantes de secar — `arch.js`, pela casca), que o 3D desenha iguais. Não inventei nada lá: as coisas do quintal são do Modo Encarnado, de perto. O que as duas vistas têm em comum segue de acordo (a `fidelidade` e a `forma-deus` passam: as coisas do quintal ficam fora da medida do prédio). |
| L-840 | bug (do agente Q, nos Bairros Vivos — o quintal; já estava na base) | **A faixa das coisas só conhecia o retângulo da casca: punha coisas dentro de um anexo e debaixo do piso de um terreiro.** O `slots` do `props3d.js` media a faixa de cada lado da casca até a beira do lote, sem saber dos anexos, do terreiro nem das escadas de fora. Na metrópole: a oficina `workshop#4755` (casca com um puxado a oeste) tinha a bigorna e o carvão dentro do puxado; e nas sete olarias com peças cruas os potes iam para «a faixa ao sul do telheiro», que é o terreiro — postos na altura do chão da rua, 40 cm debaixo do piso do terreiro, onde ninguém os via (a prova de antes contava 12 «coisas» ali). **Correção:** as faixas de um prédio desenhado pela planta contam todas as faces de fora (`runsOf`: a casca, os anexos, a cerca do terreiro, as escadas), e a mais perto da beira do lote é a de cada trecho. **Prova:** `qa/quintal.js` q3 (nenhuma coisa dentro de uma parede; sabotagem s7: «olaria#3463: potes dentro de uma parede (entra 0,46 m)»). |
| L-841 | bug (do agente Q, nos Bairros Vivos — o quintal; já estava na base) | **Os montes do estoque de um armazém desenhado pela planta ficavam como tinham sido desenhados.** A assinatura do quadro só contava os montes (`Props3D.piles`) dos armazéns sem planta; o armazém de planta com quintal (um `armazem` e um `celeiro` sobre esteios na metrópole) desenhava os montes e não era refeito quando o estoque do povo mudava. **Correção:** a assinatura conta os montes onde o desenho tem lugar para eles (`Props3D.yardOf`), com planta ou sem. **Prova:** `qa/quintal.js` q4 («celeiro#5131: os montes do estoque 1/1/6 → 8/6/0, o quadro refeito»; sabotagem s20: «os montes do estoque mudam e o quadro não é refeito»). |
| T-840 | limite de teste (do agente Q, nos Bairros Vivos — o quintal; aberto, para decisão) | **O ofício de uma pessoa é o da hora, e troca muito: o que a casa mostra dos ofícios muda várias vezes ao dia.** O `G.Atmos.about` (D-163) lê o ofício de agora (`v.role`), que o repartidor de ofícios (`village.js`, `assignJobs`) refaz conforme a necessidade da cidade. Medido na metrópole: em dois dias, 206 de 399 adultos trocaram de ofício ao menos uma vez (20 deles seis vezes ou mais; as trocas mais comuns: mineiro ↔ caçador ↔ agricultor, lenhador → agricultor, coletor ou mineiro); num dia, o que há em volta de um prédio mudou 250 vezes em 104 prédios (nas casas: agricultor 68, caçador 66, lenhador 57, varal 40, coletor 32, guerreiro 25, morador 11, pescador 10) — das 16 casas com um lenhador no instante do mundo pronto, dois dias depois há 4 lenhadores, outros. Enquanto a casa de planta não tinha lugar para coisas isso não se via; agora a lenha, a rede e o escudo de uma casa aparecem e somem ao longo do dia com o ofício de quem mora, e os pedaços do mapa perto do corpo são refeitos por isso (215 vezes num dia de mundo na metrópole inteira, em 37 pedaços; o que mais, 31 vezes — só os de perto são refeitos de fato; antes do D-186 eram as olarias, os cais e as feiras: 35 das 250 mudanças). A regra está cumprida (só o que a casa tem, agora), mas a casa não guarda a cara. **Proposta, não feita** (muda a regra do verificador `atmos-inv.js` «lenha sem lenhador» e a regra 52 do guard, que são do líder): tirar os ofícios que a casa mostra do **trabalho de uma vida** de quem mora (`v.st`: a madeira, a comida, a pedra, as peles, o peixe que cada um trouxe na vida — já no mundo e no save), não do ofício da hora: a casa de quem cortou lenha a vida inteira tem a lenha, e muda devagar. Medido: dos 399 adultos, 99 têm a madeira como o maior trabalho da vida. Reler o que há em volta a cada N segundos em vez de a cada mudança ajuda pouco (de 215 quadros refeitos para 143 com 20 s, 97 com 60 s): as trocas são espalhadas no dia. |
| T-841 | limite de teste (do agente Q, nos Bairros Vivos — o quintal) | **Tirado só o corte do vão das portas, a prova não acusa: os degraus guardam o mesmo lugar.** A faixa é cortada duas vezes diante de uma porta: no vão dela (65 cm para cada lado) e nos degraus postos pelo Build3D (`K.steps`). Toda casa do mundo pronto está 40 cm ou mais sobre a rua e tem degraus diante da porta, pelo menos tão largos quanto o vão: a sabotagem s2 (só o corte do vão tirado) não põe nenhuma coisa diante de uma porta, e a `quintal` q3 passa; a regra 60 do guard a acusa (a linha do corte é cobrada). Tirado só o corte dos degraus (s8b) a q3 acusa («tina onde o corpo pisa (a soleira de uma porta)», 19 violações com as plantas feitas — os degraus e o patamar são mais largos que o vão); tirados os dois (s8), 167 e 257 («tina na frente de uma porta»). As duas proteções ficam: uma porta sem degraus (um piso ao rés do chão, uma porta para um terreiro) só tem a primeira. |
| T-842 | limite de teste (do agente Q, nos Bairros Vivos — o quintal) | **A regra «tem pelo mundo e nada desenhado» do verificador só vale onde o desenho tem uma faixa de um passo.** O `QA.yard` acusa (S3) o prédio com coisas pelo mundo e nenhuma desenhada quando o desenho dele tem lugar (`Props3D.roomOf` > 0 e a maior faixa, `Props3D.spanOf`, com 90 cm ou mais): uma casa só com vãos curtos entre portas e janelas pode não mostrar nada, e isso é a exceção contada pela `quintal` q1 (no máximo uma casa em vinte), não uma violação. E no verificador do jogo (`QA.check`) a regra só olha a dúzia de casas, tavernas e olarias a menos de 8 casas do corpo, onde o 3D está feito — sem corpo, ou sem o 3D (as vidas em Node), nada: o mundo inteiro é a `quintal` q7 que olha. |
| T-843 | limite de teste (do agente Q, nos Bairros Vivos — o quintal) | **As provas do quintal desenham no nível gráfico alto; as figuras, sem texturas.** A `quintal` põe o nível «alta» (`Realm.setQuality`), em que nada dos enfeites é deixado de fora: no nível médio (o que o Node tem por padrão, `props: 0,6`) o varal e o sinal de casa habitada saem em 4 de cada 10 casas, pelo id — a lenha, as botijas, as coisas dos ofícios, os barris e os potes nunca —, e a `atmosfera` a4 segue nesse nível. As figuras de `qa/patch3/fotos-Q/` são um desenho por software dos triângulos do próprio 3D, com a cor de cada face e sem as texturas, as sombras nem o céu do jogo: servem para ver onde cada coisa fica e de que tamanho é, não o acabamento. |
| T-844 | limite de teste (do agente Q, nos Bairros Vivos — o quintal) | **A `atmosfera` a4 já não acha, no mundo pronto, uma casa de planta sem lugar para coisas.** O caso «a casa de planta sem quintal não tem o quadro refeito pelo que não mostra» (sabotagem o5 do agente V) precisava de uma casa habitada sem faixa; com o D-186 toda casa da metrópole tem a sua. A a4 diz («nenhuma casa de planta sem lugar para coisas neste mundo») e a prova passou para a `quintal` q4, com uma casa sem lugar feita pela mão da prova (a casca levada até a beira do lote enquanto é olhada, devolvida depois): o que ela tem muda (o `about`), o quadro é o mesmo (sabotagem s16). |
| T-845 | limite de teste (do agente Q, nos Bairros Vivos — o quintal; aberto) | **O que ficou sem lugar.** (1) As coisas de um ofício numa cabana redonda (não há parede reta: só a lenha, o barril e o cesto nos cantos). (2) A casa cujas paredes não têm um vão de ~60 cm a 1 m livre de portas e janelas para as coisas do ofício (13 de 95 na metrópole): mostra o resto. (3) A casa sobre esteios: só no chão, onde o lote deixa faixa funda (nenhuma nos mundos prontos). (4) O banco da casa: não cabe num palmo; fica só na casa com quintal. |
```

E trocar o texto de duas linhas que já existem:

- **T-703**: marcar «(fechado, Q — D-186)».
- **T-702** (medido de novo; o texto certo): «**O cuidado de um prédio pode diferir depois de um load.** O valor da terra vem do
  retrato do dia da cidade (`G.Urban.peek`), que é derivado e não vai no save. Logo depois do load nenhuma cidade tem retrato e o
  cuidado lê só o bairro, a casa mercante e a casa vazia (92 a 94 prédios diferentes na metrópole); o próprio mundo refaz o
  retrato, uma cidade por passo (`Urban.update`, L-694): 85 depois de 1 passo, 52 depois de 5, 14 depois de 10, e depois de
  20 passos — 2 s de mundo, as 19 cidades com retrato — sobra 1 prédio diferente quando o save é feito logo depois de abrir o
  mundo pronto (a madrugada), e 8 na `atmosfera` a7 rodada inteira, em que o save vem depois de tudo o que os outros casos
  viveram: os de terra cujo valor mudou desde a madrugada, porque o retrato refeito é o da hora do load, não o da virada do
  dia. Só o desenho muda, e só até a virada do dia. A `atmosfera` a7 conta e diz os dois números; não os exige. Fazer o retrato do load igual ao da madrugada pediria
  guardá-lo no save (é derivado) ou refazer a madrugada: não feito.»

## 2. Linhas para o `qa/README.md`

```
| `quintal.js` | `[ONLY=q1,q3] node quintal.js [mundo]` | O lugar das coisas em volta dos prédios desenhados pela planta (D-186, D-187), em Node com o three.js e os arquivos do 3D, sem a mão no desenho, na metrópole (e `cidade`, `mega`): toda casa habitada mostra algo, a do lenhador a lenha, a de um ofício as coisas dele, a taverna com o que servir os barris, a olaria com peças cruas os potes — ou a exceção contada, com o porquê —, e nada sem causa (q1); o lenhador, a jarra de vinho, a família, a prateleira e as peças cruas dados e tirados à mão: a coisa aparece e some e a assinatura do quadro muda (q2); coisa a coisa pela geometria — no próprio lote, fora de toda parede, em nenhum chão que alguém anda, na frente de nenhuma porta, sobre nenhuma janela, nenhuma em cima de outra — com as plantas por fazer e feitas (q3); o quadro refeito só pelo que mostra, a casa sem lugar, o primeiro quadro que não se faz duas vezes e os montes do armazém (q4); só desenha (q5); o save no meio (q6); as regras do verificador limpas e acusando a mentira (q7); os triângulos a mais (q8). ≈ 30 s na metrópole. Cobre `props3d.js` e a assinatura do quadro do `build3d.js`. |
| `quintal-inv.js` | (invariantes; carregado pela prova acima com `extra: ['qa/quintal-inv.js']`) | As regras do verificador do quintal (sistema `atmos`), `QA.yard(lista)`: o prédio com coisas pelo mundo e nenhuma desenhada onde o desenho tem lugar; a coisa desenhada sem causa (lenha sem lenhador, barril sem bebida, coisas de um ofício que não mora ali, barris de prateleira vazia, potes sem nada cru, coisa em casa vazia); a coisa onde não pode (fora do lote, dentro de uma parede, em chão que se anda, na soleira ou nos degraus de uma porta, na frente de uma porta, sobre uma janela, em cima de outra) — todas S3. A causa é contada dos campos do mundo e o lugar da casca e do mapa do mundo, nunca das faixas do `Props3D`. No `QA.check`, a dúzia de prédios junto do corpo, onde o 3D está feito. Para entrar no `qa.js`: `node qa/junta-inv.js` (o líder). |
| `visual/quintal-fotos.js` | `node visual/quintal-fotos.js <saída.png> <mundo> <prédio> [vista] [W H]` · `bash visual/quintal-fotos.sh` | As figuras do quintal, em Node, por um desenho por software dos triângulos do 3D (sem navegador, sem texturas): um prédio de um mundo pronto (um id, o n-ésimo de um tipo, a n-ésima casa de um ofício) visto de frente, do lado, de um canto, de cima, de um ponto dado ou diante da k-ésima coisa em volta dele; `PAR=1` põe lado a lado o antes (sem o `Props3D`) e o depois; `VINHO=n` dá bebida à casa pela mão da figura. O `.sh` refaz as 14 figuras de `qa/patch3/fotos-Q/`. Só lê o jogo. |
```

E na linha do `atmosfera.js`, trocar o trecho da a4 e da a7 por: «… os objetos — em volta de cada casa só o que ela tem, no desenho pela
planta (o do jogo, sem a mão no desenho) e no do kit; tirado à mão, some (a4); … o save no meio, e o cuidado contado logo depois
do load e depois de um passo por cidade (a7) …».

## 3. Entradas para o `qa/regress.sh`

Fase **«fundacao»**, no grupo das provas do 3D em Node (a linha que tem `F roupa roupa.js; F atmosfera atmosfera.js;`):

```
F quintal quintal.js; F quintal-cidade quintal.js cidade; F quintal-mega quintal.js mega;
```

Levam ≈ 30 s, 7 s e 17 s sozinhas e saem com código 1 se um caso falha. Não mudam o mundo pronto nem o save: a linha de base
ganha só as linhas delas, e as linhas da `atmosfera` a4 e a7 mudam de texto (os casos seguem passando).

## 4. Regras novas do `qa/guard.js`

Antes da linha `if (fails.length) { console.log(fails.join('\n')); …`. Rodei o guard com elas coladas numa cópia
(`ag/Q/guard-test.sh`): passa na minha árvore (152 arquivos) e acusa as sabotagens s1, s2, s4b, s5, s6, s7, s8, s8b, s11, s13,
s16, s21 (regra 60) e s18 (regra 59).

```js
// 59. "o quintal é o mesmo a cada desenho" (Bairros Vivos — D-186): o js/props3d.js não tira de acaso nenhum — nem do mundo
// (G.R, rr, ri, pick, chance, shuffle), nem do que só se vê (G.VR e os seus), nem Math.random. O que há em volta de um prédio
// sai do mundo (G.Atmos.about) e onde cada coisa fica e de que tamanho é, do id do prédio (K.hv, G.hash): a mesma casa
// mantém a cara, o quadro refeito é o mesmo de antes, e o save no meio não muda nada (qa/quintal.js q6)
(src['props3d.js'] || []).forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/\bG\.(R\(\)|rr\(|ri\(|pick\(|chance\(|shuffle\(|VR\(\)|vrr\(|vri\(|vpick\(|vchance\(|vshuffle\()|Math\.random/.test(c)) fails.push(`quintal: props3d.js:${k + 1} tira de um acaso (o que há em volta de um prédio é do mundo e do id dele — K.hv, G.hash): ${l.trim().slice(0, 110)}`); });
// 60. "as coisas em volta ficam no próprio lote, fora do caminho" (D-186): no js/props3d.js, (1) as faixas de um prédio
// desenhado pela planta saem da casca — o `slots` passa pelo `shellSlots`, que lê o `shellOf` do Build3D e conta, lado a lado,
// a face de fora mais perto da beira do lote (a casca, os anexos, a cerca do terreiro, as escadas de fora); (2) as portas e os
// portões cortam a faixa (`cut.push([uc - h.w / 2 - 0.65, …`) e os degraus postos pelo Build3D também (`K.steps`); (3) o que
// é fino fica livre das janelas (`fit`, com `s.wins`) e de pé na soleira da fundação (`if (s.thin) y = LEDGE`), nunca mais
// fundo que a faixa (`run.d - 0.02`); (4) a assinatura do quadro só conta o que há em volta onde o desenho tem lugar
// (`P3.yardOf`: pelas faixas do último desenho, `yard.get(b.id) > 0`, e antes dele pela casca, `roomBy`); (5) e nada de
// `K.b.… =`: o desenho não escreve no prédio
{ const need = (rx, what) => { if (!(src['props3d.js'] || []).some(l => rx.test(l.replace(/(^|\s)\/\/\s.*$/, '')))) fails.push(`quintal: props3d.js sem ${what} — a regra 60 não acha o lugar das coisas`); };
  need(/if \(B\.shell && !B\.open\) \{ const sl = shellSlots\(K\); if \(sl\) return sl; \}/, 'as faixas da casca (slots → shellSlots)');
  need(/const S = B3 && B3\.shellOf \? B3\.shellOf\(K\.b\) : null;/, 'a casca lida do Build3D (shellOf)');
  need(/for \(const a of sh\.annex \|\| \[\]\) solids\.push\(/, 'os anexos entre as faces de fora');
  need(/if \(sh\.yard\) solids\.push\(\{ r: sh\.yard\.r, k: 'fence' \}\)/, 'a cerca do terreiro entre as faces de fora');
  need(/cut\.push\(\[uc - h\.w \/ 2 - 0\.65, uc \+ h\.w \/ 2 \+ 0\.65\]\)/, 'o corte das portas e dos portões');
  need(/const treads = \(K\.steps \|\| \[\]\)\.map\(/, 'os degraus postos pelo Build3D (K.steps)');
  need(/if \(n\[1\] > n0 && n\[0\] < n1 && a\[1\] > run\.u0 && a\[0\] < run\.u1\) cut\.push\(/, 'o corte dos degraus');
  need(/const bad = a => s\.wins\.some\(w => w\[2\] < hgt && a < w\[1\] && a \+ l > w\[0\]\);/, 'o que é fino livre das janelas (fit)');
  need(/depth = Math\.min\(THIN_MAX, run\.d - 0\.02\); thin = true;/, 'o que é fino nunca mais fundo que a faixa');
  need(/if \(s\.thin\) y = LEDGE;/, 'o que é fino de pé na soleira da fundação');
  need(/P3\.yardOf = b => !!KIND\[b\.type\] && \(!\(G\.Build3D && G\.Build3D\.shellOf && G\.Build3D\.shellOf\(b\)\) \|\| \(yard\.has\(b\.id\) \? yard\.get\(b\.id\) > 0 : roomBy\(b\)\)\);/, 'a assinatura só onde o desenho tem lugar (P3.yardOf)');
  (src['props3d.js'] || []).forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/\bK\.b\.[A-Za-z_]+(\[[^\]]*\])?\s*(=(?!=)|\+=|-=|\+\+|--)/.test(c)) fails.push(`quintal: props3d.js:${k + 1} escreve no prédio que desenha (o desenho só lê): ${l.trim().slice(0, 110)}`); }); }
```

## 5. Frases para o `CLAUDE.md`

Em «As fundações», logo depois de «O que se vê tem causa — `G.Atmos`»:

```
- **O quintal — o lugar das coisas em volta de um prédio** (`js/props3d.js`, D-186, D-187): o que o `G.Atmos.about(b)` diz que um prédio tem fica **no lote do próprio prédio, onde ninguém anda** — o mapa do mundo tem o lote por parede e o corpo só pisa nele na soleira e nos degraus das portas (`Space.indoor`) —, nunca na rua: o corpo não colide com enfeites. Num prédio desenhado pela planta as faixas saem da casca (`runsOf` / `shellSlots`: de cada lado, da face de fora mais perto — a casca, um anexo, a cerca do terreiro — até a beira do lote), cortadas nas portas, nos portões e nos degraus que o Build3D pôs (`K.steps`): faixa funda, as coisas no chão; faixa de um palmo (a casa do centro), coisas **finas** na soleira da fundação ou penduradas na parede, livres das janelas; a cabana redonda, nos cantos do lote. Coisa nova em volta de um prédio: uma peça pedida ao `take` (nunca posta à mão num ponto do lote), com o seu nome (`tag`), a sua causa no `G.Atmos.about` e a sua linha nas regras do `qa/quintal-inv.js` (`QA.yard`: nada sem causa, nada onde não pode); as escolhas pelo id (`K.hv`), nunca por sorteio (regra 59 do guard); nada escrito no prédio, e a assinatura do quadro só conta o que há em volta onde o desenho tem lugar — sabido pela casca antes do primeiro desenho (`P3.yardOf`; regra 60). Prova: `qa/quintal.js` (metrópole, cidade, mega).
```

E, na regra 3 do protocolo, onde diz «Mexeu na roupa, na fumaça, nas janelas ou no que há em volta dos prédios (…)? Também
`node qa/roupa.js` e `node qa/atmosfera.js`», acrescentar: «e, pelo que há em volta dos prédios (`props3d.js`), `node qa/quintal.js`
(e `node qa/quintal.js cidade`)».

## 6. Para juntar

- **`qa/junta-inv.js`**: acrescentar `'qa/quintal-inv.js'` à lista `FILES` (depois de `'qa/atmos-inv.js'`) e rodar
  `node qa/junta-inv.js`. O arquivo só define `QA.yard` e pendura uma olhada no `QA.more`; sem o 3D feito, ou sem corpo, não
  faz nada (as vidas em Node não mudam). Não mexi no `qa/atmos-inv.js`.
- **Nenhum arquivo novo em `js/`**; o `index.html` não mudou.
- **Os mundos prontos não precisam ser gerados de novo.** Em `js/` só mudei o `props3d.js` e seis linhas do `build3d.js`, que só
  desenham (o `guarda3d` passa); a `quintal` q5 confere, nos três mundos, o canônico, o save, cada pessoa, prédio e operação e
  o acaso do mundo iguais depois de tudo desenhado, com as plantas feitas (q3: as mesmas coisas, nos mesmos lugares, com as
  plantas por fazer e feitas); o `det3` e a vida curta passam; a pasta `worlds/` está como veio.
- Arquivo de outro agente em que mexi: `qa/atmosfera.js` (do V: a a4 nos dois desenhos, a a7 com o cuidado medido).
- As figuras: `qa/patch3/fotos-Q/` (14: `01` a `05` são pares antes | depois; `06` a `14`, detalhes das coisas). Refazer:
  `bash qa/visual/quintal-fotos.sh` (alguns minutos, um `node` por figura).

## 7. As provas e as sabotagens (o que rodei, no código final — `c0ff863`)

### A prova nova e a mudada

| Prova | Como roda | Resultado |
|---|---|---|
| `qa/quintal.js` | `cd qa && node quintal.js` (metrópole) | **9 passam, 0 falham** (q1 a q8 e «sem erro de módulo nem aviso no console») |
| `qa/quintal.js` | `node quintal.js cidade` | **9 passam, 0 falham** |
| `qa/quintal.js` | `node quintal.js mega` | **9 passam, 0 falham** |
| `qa/atmosfera.js` | `cd qa && node atmosfera.js` (metrópole) | **10 passam, 0 falham** (a a4 sem a mão no desenho, e depois pelo kit) |

Os números da q1 (o que tem pelo mundo e o que mostra), no nível alto:

| | casas | habitadas / com algo | lenhador | ofício | tavernas | olarias | coisas nas casas |
|---|---|---|---|---|---|---|---|
| metrópole | 184 | 131 / 131 | 16 / 16 | 82 / 95 | 3 / 3 (de 8) | 7 / 7 (de 15) | 307 (306 finas) |
| cidade | 33 | 24 / 24 | 0 / 0 | 14 / 18 | — | 2 / 2 (de 3) | 46 (43 finas) |
| mega | 97 | 74 / 74 | 12 / 12 | 45 / 52 | 5 / 5 (de 7) | 5 / 5 (de 8) | 166 (165 finas) |

Nenhuma casa dos mundos prontos guarda bebida no instante em que foram gerados (0 / 0): o barril da bebida é provado pela mão da
prova (q2: «com vinho, a botija à porta; sem ele, some»; a a4 pelo kit: «um barril à porta»). As 53 casas vazias da metrópole
(9 na cidade, 23 na mega) não mostram nada. Na q3: 322 coisas na metrópole (49 na cidade, 181 na mega), 0 violações antes e
depois de feitas as plantas; a coisa que mais chega à beira do lote fica 1,0 cm dentro dele; a mais próxima do meio de uma
porta, a 1,08 m.

Os casos ruins do protocolo: o save no meio (q6); a pessoa some no meio (q2: a família tirada da casa; o lenhador que deixa de
ser); o deus interfere / o mundo muda (q2: a jarra de vinho dada e tirada, a prateleira esvaziada, as peças cruas zeradas; q4:
o estoque do povo, o ofício que troca); só desenha (q5).

### As sabotagens: 26, das quais 25 acusadas pelas provas e a outra pela regra 60 do guard

Cada uma desfaz uma parte numa cópia do jogo (`ag/Q/sab-Q.py`, pelo `bv/sab-run.sh`) e roda só o caso que deve acusá-la.

| Sabotagem | O que desfaz | Quem acusou |
|---|---|---|
| s1 | o lugar novo desligado (as faixas de antes para o prédio de planta) | q1 («131 habitadas, 2 com algo à vista») e a regra 60 |
| s2 | o corte do vão das portas tirado (os degraus ainda guardam o lugar) | **a prova não** (T-841); a regra 60 do guard |
| s3 | lenha em casa sem lenhador | q1 («lenha sem lenhador na casa») e q7 |
| s3a | a mesma, olhada pela prova do V | atmosfera a4 («planta: … lenha sem lenhador na casa») |
| s4 | o que há em volta fora da assinatura do quadro (não refaz quando o mundo muda) | q2 («a lenha não segue o lenhador (assinatura igual)») |
| s4a | a mesma, olhada pela prova do V | atmosfera a4 |
| s4b | o prédio de planta dito sem lugar (como antes do D-186) | q2 e a regra 60 |
| s5 | as coisas finas tão fundas quanto quiserem (para a rua) | q3 («pescador em chão que se anda», 71 violações) e a regra 60 |
| s6 | as janelas já não afastam o que é alto | q3 («pescador (1,95 m de alto) sobre uma janela de peitoril a 0,87 m», 134) e a regra 60 |
| s7 | as faixas só conhecem o retângulo da casca (L-840) | q3 («olaria#3463: potes dentro de uma parede (entra 0,46 m)») e a regra 60 |
| s8 | nenhum corte diante das portas (nem o vão nem os degraus): uma coisa na frente da porta | q3 («tina na frente de uma porta», 167 e 257 violações) e a regra 60 |
| s8b | só o corte dos degraus tirado | q3 («tina onde o corpo pisa (a soleira de uma porta)», 19) e a regra 60 |
| s9 | os barris da taverna seja o que for que ela tem | q1 e q2 |
| s9a | a mesma, olhada pela prova do V | atmosfera a4 («barris com a prateleira vazia») |
| s10 | os potes da olaria seja o que for que ela tem secando | q1 e q2 |
| s11 | o desenho deixa uma marca no prédio | q5 e a regra 60 |
| s12 | o sinal de casa habitada em casa vazia | q1 e q7 |
| s13 | o que é fino fora da soleira da fundação (na altura do chão, dentro das pedras) | q3 («tina fina fora da soleira da fundação (−0,48 m)», 239) e a regra 60 |
| s14 | as botijas da bebida em casa sem bebida | q1 e q7 |
| s15 | os cantos da cabana redonda entram no anel | q3, na cidade («agricultor dentro da parede redonda») |
| s16 | o quadro da casa sem lugar refeito pelo que ela não mostra | q4 e a regra 60 |
| s17 | as coisas de um ofício onde quer que more alguém | q1 e q7 |
| s18 | uma escolha por sorteio em vez do id da casa | q6 («97 diferentes depois do load») e a regra 59 |
| s19 | os barris e os potes para dentro da linha da cerca | q3 («potes dentro de uma parede (entra 0,28 m)») |
| s20 | os montes do armazém de planta fora da assinatura (L-841) | q4 |
| s21 | o lugar só sabido depois do primeiro desenho (o primeiro quadro feito duas vezes) | q4 («207 prédios têm o primeiro quadro feito duas vezes») e a regra 60 |

As quatro sabotagens pedidas: desligar o lugar novo (s1), pôr uma coisa na frente da porta (s8; a s2 e a s8b são as suas
metades), mostrar lenha em casa sem lenhador (s3, s3a), não refazer quando o mundo muda (s4, s4a, s4b).

### As provas que já existiam, de novo

| Prova | Resultado |
|---|---|
| `node qa/guard.js` | PASSOU (152 arquivos) |
| o guard com as regras 59 e 60 coladas (numa cópia) | PASSOU (152 arquivos); acusa s1, s2, s4b, s5, s6, s7, s8, s8b, s11, s13, s16, s21 (regra 60) e s18 (regra 59) |
| `node qa/visual/guarda3d.js .` | PASSOU (27 arquivos do 3D; avisos 0) |
| `node qa/roupa.js` | TUDO PASSOU (10 passam, 0 falham) |
| `node qa/visual/corpo-rig.js` | TUDO PASSOU (10 passam) |
| `node qa/visual/fidelidade.js` | PASSOU (8 passam, 0 falham) |
| `node qa/visual/soleira.js` | TUDO PASSOU (15 passam) |
| `node qa/visual/corpo-casa.js` | TUDO PASSOU (19 passam) |
| `PARTE=node node qa/visual/monumental.js` | TUDO PASSOU (44 passam) |
| `node qa/visual/forma-deus.js` | PASSOU (27 passam, 0 falham) |
| `node qa/visual/carga-mundo.js` | TUDO PASSOU (8 passam) |
| `node soak.js 103 continente 128 4 normal 5 1 1` | 5 anos, violações 0, erros nenhum |
| `node qa/det3.js 77 arquipelago 96 3 2` | PASSOU |
| `ONLY=e11 node qa/encarna.js SAIDA` (navegador, por `bash qa/navegador.sh`, sozinho, no fim) | TUDO PASSOU (9 passam; sem erros de página) |

Não rodei, como manda o COMUM2: `qa/regress.sh`, `qa/prontos.js` e a prova de desempenho.

### O custo (medido em Node, com a máquina dividida — não a prova de desempenho)

- Triângulos a mais, de perto, no nível alto (q8): metrópole +41 428 em 207 casas, tavernas e olarias (5,9 %), em média +294
  por prédio com coisas (casa +290, olaria +447, taverna +112), no máximo +744; cidade +6 600 (6,8 %); mega +25 992 (5,7 %).
- Malhas a mais: nenhuma (as coisas vão na geometria do pedaço do mapa). De longe: nada.
- Quadros refeitos: o que há em volta muda 250 vezes por dia de mundo na metrópole (T-840), em 37 pedaços do mapa (215
  vezes ao todo; o que mais, 31); só os pedaços de perto do corpo são refeitos de fato. O primeiro quadro de um pedaço não é
  feito duas vezes (q4).

## 8. O que ficou aberto

1. **O ofício da hora troca muito** (T-840): a lenha, a rede e o escudo de uma casa aparecem e somem ao longo do dia com o
   ofício de quem mora, e os pedaços do mapa perto do corpo são refeitos por isso. Proposta: os ofícios que a casa mostra pelo
   trabalho de uma vida (`v.st`). É uma decisão de desenho que mexe em regras do líder (o `atmos-inv.js`, a regra 52 do guard).
2. **A medida do quadro** (o tempo de montar um pedaço do mapa de perto, com as coisas, e a frequência com que é refeito no
   Modo Encarnado) é do líder, com a máquina livre. Os números de triângulos estão na D-186 e na `quintal` q8.
3. **O cuidado depois de um load** (T-702): medido de novo; o texto certo está na seção 1. Não consertado: pediria guardar no
   save o retrato do dia, que é derivado.
4. **Os potes da olaria e os barris da taverna, do lado de fora da cerca, são pequenos** (a faixa tem 32 cm na olaria e 40 na
   taverna). Uma ideia, não feita: os potes secando em cima do muro do terreiro (um muro baixo de 20 cm de largo, nos povos
   que não fazem cerca de varas), que se veem de mais longe.
5. **As estantes de secar e as pipas do terreiro**, móveis da planta, são desenhadas de fora sempre cheias (o `shellYard` do
   `build3d.js` não lhes diz quanto guardam; de dentro, com a planta aberta, mostram o que o prédio tem — `B3.fillOf`). Já era
   assim; é do desenho dos interiores (E, K).
6. **A bigorna do lado de fora de uma forja ou oficina de planta** (onde o lote deixa faixa funda): é a do desenho de kit,
   sempre lá, e a planta tem a sua dentro. Não mexi (D-163 não a cobre).
7. **A assinatura conta os panos do varal mesmo nas casas que não o estendem** (o `about.sig` não sabe da escolha pelo id): um
   morador a mais numa casa sem varal refaz o quadro sem mudar nada à vista. Pequeno (40 das 250 mudanças do dia); para
   acertar, a assinatura do que há em volta teria de sair do `props3d.js`, que sabe o que cada casa mostra.
8. **Uma rua de casas, vista de longe, mostra pouco**: as coisas são de um palmo de fundo (não podem ir para a rua) e as casas
   dos mundos prontos ficam soltas, uma casa de chão entre elas — a figura `02` é honesta nisso. De perto leem-se bem.
9. **O aspecto, com as texturas e a luz do jogo**, não foi visto: as figuras são sem texturas (T-843). Vale uma olhada no
   navegador antes de publicar.
