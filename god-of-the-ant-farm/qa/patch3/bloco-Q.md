# Bloco Q — «o quintal: as coisas em volta das casas» (agente Q, Bairros Vivos)

Ramo `worktree-agent-adfab9d9d2b785603`, a partir de `20b0a58`. Números usados: decisões **D-186 a D-188**, bugs **L-840 e
L-841**, limites de teste **T-840 a T-845**, regras do guard **59 e 60**. Livres: D-189, L-842 a L-859, T-846 a T-859.

Tudo aqui está pronto para colar. O que cada seção afirma foi rodado; os resultados estão na seção 7.

**Atenção ao juntar** (seção 6): as regras novas do verificador estão num arquivo novo, `qa/quintal-inv.js` — não no
`qa/atmos-inv.js`, porque mexer nele faz o `guard.js` falhar na regra 21 até o `junta-inv.js` rodar, e isso é do líder.

---

## 1. Linhas para o `qa/AUDIT.md`

```
| D-186 | decisão (do agente Q, nos Bairros Vivos — o quintal) | **As coisas em volta de um prédio ficam no lote dele, onde ninguém anda — e o prédio desenhado pela planta tem esse lugar.** O T-703 dizia: a casa, a taverna e a olaria desenhadas pela planta enchem o lote, e o que o `G.Atmos.about` diz que elas têm não tinha onde ficar (1 ou 2 coisas nas 184 casas da metrópole; nenhuma taverna com barris). **Medido:** a casa de um lote de 4 m tem a parede a 8–20 cm da beira do lote (`int-familias.js`: a margem da casca); nenhuma casa encosta noutra — os quatro lados dão para chão que o mundo anda (na metrópole, de 736 lados, 1 dá para outro lote) —; o corpo é um círculo de 0,32 m cujo centro não chega a menos de 23 cm da beira de um lote (`avatar.js`, `blocked`), e dentro do lote só pisa na soleira e nos degraus das portas (`Space.indoor`); o mapa do mundo tem o lote inteiro por parede. Logo: o único chão junto de uma casa onde uma coisa nunca é atravessada por ninguém é o próprio lote. **Decisão:** nada vai para a rua. O `props3d.js` lê a casca (`B3.shellOf`) e acha, em cada lado do lote, a faixa entre a face de fora mais perto da beira — a casca, um anexo, a cerca do terreiro, uma escada de fora — e a beira do lote (`shellSlots`), cortada nas portas e nos portões (65 cm para cada lado do vão) e nos degraus que o Build3D pôs (`K.steps`). **(1) Faixa funda** (22 cm ou mais além das pedras da fundação: a casa no seu quintal, D-082; o lado da casa da taverna; o pé da cerca de um terreiro): as coisas de antes, no chão. **(2) Faixa de um palmo** (a casa do centro, 6 a 15 cm): coisas **finas**, de pé na soleira da fundação — o topo das pedras, na altura do piso, 40 cm ou mais sobre a rua — ou penduradas na parede, livres das janelas do térreo (com o alcance das venezianas) e a 10 cm das quinas (22 cm no norte: os esteios). **(3) A cabana redonda**, que enche o lote nos quatro lados: nos cantos do lote, fora do anel e das pedras (um quadrado de ~39 cm). **(4) A taverna**: os barris do que ela tem para servir, fora do terreiro — encostados na parede da casa onde o lote deixa uma faixa ao lado dela (1,2 m na taverna de 8 m dos povos de casa estreita), senão pequenos ao pé da cerca, junto do portão; a mesa e o estrado de pipas do terreiro são móveis da planta e seguem como eram. **(5) A olaria**: os potes das peças cruas ao pé da cerca, do lado de fora, junto do portão (potes de ~21 cm: a faixa tem 32). Nada disto muda a planta, a porta, o chão que o mundo anda nem onde o corpo pisa: só o `props3d.js` e três linhas do `build3d.js` (a assinatura dos montes de um armazém, L-841; `B3.made`). De longe, nada, como antes. **Custo** (medido, de perto, nível alto): metrópole +41 428 triângulos em 207 casas, tavernas e olarias (5,9 %; em média +294 por prédio com coisas, no máximo +744); cidade +6 600 (6,8 %); mega +25 188 (5,5 %); nenhuma malha a mais (as coisas vão na geometria do pedaço do mapa, com o prédio). Prova: `qa/quintal.js` (q1 a q8, metrópole, cidade e mega), as regras `qa/quintal-inv.js` e 23 sabotagens. Fecha o T-703. |
| D-187 | decisão (do agente Q, nos Bairros Vivos — o quintal) | **O que uma casa de um palmo de parede mostra.** A mesma causa de antes (`G.Atmos.about`, D-163), em peças de um palmo de fundo: **a lenha** do lenhador, rachada miúda e empilhada com uma acha de fundo, as pontas para a rua, e o machado nos seus pregos por cima (onde uma janela não deixa, a pilha baixa, sem o machado); **a bebida** que a casa guarda, uma botija de barro (de couro no norte) por bebida ou óleo, até três, na soleira junto da porta — o barril não cabe em 12 cm; na faixa funda e no canto da cabana redonda segue barril —; **os ofícios** de quem mora: a rede pendurada com as boias e o remo de pé (pescador), o couro esticado nos pregos (caçador), o escudo redondo na cor da casa e a lança (guerreiro, arqueiro), as meadas tingidas num varão (tecelão), o forcado, o ancinho e a peneira no prego (agricultor, coletor, vinhateiro) — cada um com uma variante mais estreita para a parede curta, e **até dois ofícios por casa** (cada parede tem vão para um; no quintal, um só, como antes); **o varal** rente à parede, em dois pregos, nas casas que o estendem (o id, 40 %, como antes); e **o sinal de casa habitada** junto da porta, sempre — a vassoura, a tina de lavar no prego ou a réstia de cebolas (de pimentas, nas terras do milho), qual, pelo id; onde as janelas não deixam parede, um cesto baixo na soleira. Casa vazia, nada. A lenha, as botijas e as coisas de um ofício são do mundo — quem mora ali — e nunca saem pela parte dos enfeites do nível gráfico (`Realm.Q().props`); o varal e o sinal de casa habitada saem (60 % no nível médio). O id só diz onde cada coisa fica e de que tamanho é; nenhum sorteio (regra 59 do guard). O que não tem lugar é contado e dito pela prova: na metrópole, 13 de 95 casas com ofício não têm vão de parede livre de janelas para as coisas dele (na cidade 4 de 18, na mega 9 de 52); toda casa habitada mostra algo (131 de 131; cidade 24 de 24; mega 72 de 74 — os dois quarteirões, T-845); toda casa de lenhador, a lenha (16 de 16; mega 12 de 12). |
| D-188 | decisão (do agente Q, nos Bairros Vivos — o quintal) | **A vista do deus não mostra nada em volta das casas, e segue assim.** Conferido: o desenho do deus de uma casa é o retrato do tipo e do povo (um para todas as casas iguais — `arch.js`, `art.js`), sem lenha, barril, varal nem coisas de ofício; o que ela mostra em volta de um prédio são os montes do estoque junto do armazém (`render.js`, `drawPiles` — os mesmos números do 3D, `Props3D.piles`) e, nos terreiros da taverna e da olaria, os móveis da planta (a mesa, as pipas, a talha, o forno, as estantes de secar — `arch.js`, pela casca), que o 3D desenha iguais. Não inventei nada lá: as coisas do quintal são do Modo Encarnado, de perto. O que as duas vistas têm em comum segue de acordo (a `fidelidade` passa: as coisas do quintal ficam fora da medida do prédio). |
| L-840 | bug (do agente Q, nos Bairros Vivos — o quintal; já estava na base) | **A faixa das coisas só conhecia o retângulo da casca: punha coisas dentro de um anexo e debaixo do piso de um terreiro.** O `slots` do `props3d.js` media a faixa de cada lado da casca até a beira do lote, sem saber dos anexos, do terreiro nem das escadas de fora. Na metrópole: a oficina `workshop#4755` (casca com um puxado a oeste) tinha a bigorna e o carvão dentro do puxado; e nas sete olarias com peças cruas os potes iam para «a faixa ao sul do telheiro», que é o terreiro — postos na altura do chão da rua, 40 cm debaixo do piso do terreiro, onde ninguém os via (a prova de antes contava 12 «coisas» ali). **Correção:** as faixas de um prédio desenhado pela planta contam todas as faces de fora (`shellSlots`: a casca, os anexos, a cerca do terreiro, as escadas), e a mais perto da beira do lote é a de cada trecho. **Prova:** `qa/quintal.js` q3 (nenhuma coisa dentro de uma parede; sabotagem s7: «olaria#3463: potes dentro de uma parede (entra 0,46 m)»). |
| L-841 | bug (do agente Q, nos Bairros Vivos — o quintal; já estava na base) | **Os montes do estoque de um armazém desenhado pela planta ficavam como tinham sido desenhados.** A assinatura do quadro só contava os montes (`Props3D.piles`) dos armazéns sem planta; o armazém de planta com quintal (um `armazem` e um `celeiro` sobre esteios na metrópole) desenhava os montes e não era refeito quando o estoque do povo mudava. **Correção:** a assinatura conta os montes onde o desenho tem lugar para eles (`Props3D.yardOf`), com planta ou sem. **Prova:** `qa/quintal.js` q4 (o estoque mudado à mão, o quadro refeito; sabotagem s20). |
| T-840 | limite de teste (do agente Q, nos Bairros Vivos — o quintal; aberto, para decisão) | **O ofício de uma pessoa é o da hora, e troca muito: o que a casa mostra dos ofícios muda várias vezes ao dia.** O `G.Atmos.about` (D-163) lê o ofício de agora (`v.role`), que o repartidor de ofícios (`village.js`, `assignJobs`) refaz conforme a necessidade da cidade. Medido na metrópole: em dois dias, 206 de 399 adultos trocaram de ofício ao menos uma vez (20 deles seis vezes ou mais; as trocas mais comuns: mineiro ↔ caçador ↔ agricultor, lenhador → agricultor/coletor/mineiro); num dia, o que há em volta de um prédio mudou 250 vezes em 104 prédios (nas casas: agricultor 68, caçador 66, lenhador 57, varal 40, coletor 32, guerreiro 25, morador 11, pescador 10) — dos 16 lenhadores com lenha à porta no instante do mundo pronto, sobram 4 dois dias depois, outros. Enquanto a casa de planta não tinha lugar para coisas isso não se via; agora a lenha, a rede e o escudo de uma casa aparecem e somem ao longo do dia com o ofício de quem mora, e os pedaços do mapa perto do corpo são refeitos por isso (215 vezes num dia de mundo na metrópole inteira, em 37 pedaços; o que mais, 31 vezes — só os de perto são refeitos de fato). A regra está cumprida (só o que a casa tem, agora), mas a casa não guarda a cara. **Proposta, não feita** (muda a regra do verificador `atmos-inv.js` «lenha sem lenhador» e a regra 52 do guard, que são do líder): tirar os ofícios que a casa mostra do **trabalho de uma vida** de quem mora (`v.st`: a madeira, a comida, a pedra, as peles, o peixe que cada um trouxe na vida — já no mundo e no save), não do ofício da hora: a casa de quem cortou lenha a vida inteira tem a lenha, e muda devagar. Medido: dos 399 adultos, 99 têm a madeira como o maior trabalho da vida. Reler o que há em volta a cada N segundos em vez de a cada mudança ajuda pouco (de 215 quadros refeitos para 143 com 20 s, 97 com 60 s): as trocas são espalhadas no dia. |
| T-841 | limite de teste (do agente Q, nos Bairros Vivos — o quintal) | **Tirado só o corte das portas, a prova não acusa: os degraus guardam o mesmo lugar.** A faixa é cortada duas vezes diante de uma porta: no vão dela (65 cm para cada lado) e nos degraus postos pelo Build3D (`K.steps`). Toda casa do mundo pronto está 40 cm ou mais sobre a rua e tem degraus diante da porta, tão largos quanto o corte do vão: a sabotagem s2 (só o corte do vão tirado) e a s8b (só o dos degraus) não põem nenhuma coisa diante de uma porta, e a `quintal` q3 passa nas duas; com os dois cortes tirados (s8) a q3 acusa («tina na frente de uma porta», 167 violações). As duas proteções ficam (uma porta sem degraus — um piso ao rés do chão, uma porta para um terreiro — só tem a primeira; uma escada ao longo da parede só a segunda), e cada linha é cobrada pela regra 60 do guard, que acusa a s2 e a s8b. |
| T-842 | limite de teste (do agente Q, nos Bairros Vivos — o quintal) | **A regra «tem pelo mundo e nada desenhado» do verificador só vale onde o desenho tem uma faixa de um passo.** O `QA.yard` acusa (S3) o prédio com coisas pelo mundo e nenhuma desenhada quando o desenho dele tem lugar (`Props3D.roomOf` > 0 e a maior faixa, `Props3D.spanOf`, com 90 cm ou mais): uma casa sem faixa nenhuma (o quarteirão, T-845) ou só com vãos curtos entre portas e janelas pode não mostrar nada, e isso é a exceção contada pela `quintal` q1, não uma violação. E no verificador do jogo (`QA.check`) a regra só olha a dúzia de casas, tavernas e olarias a menos de 8 casas do corpo, onde o 3D está feito — sem corpo, ou sem o 3D (as vidas em Node), nada: o mundo inteiro é a `quintal` q7 que olha. |
| T-843 | limite de teste (do agente Q, nos Bairros Vivos — o quintal) | **As provas do quintal desenham no nível gráfico alto; as figuras, sem texturas.** A `quintal` põe o nível «alta» (`Realm.setQuality`), em que nada dos enfeites é deixado de fora: no nível médio (o que o Node tem por padrão, `props: 0,6`) o varal e o sinal de casa habitada saem em 4 de cada 10 casas, pelo id — a lenha, as botijas, as coisas dos ofícios, os barris e os potes nunca —, e a `atmosfera` a4 segue nesse nível. As figuras de `qa/patch3/fotos-Q/` são um desenho por software dos triângulos do próprio 3D, com as cores de cada face e sem as texturas, as sombras nem o céu do jogo: servem para ver onde cada coisa fica e de que tamanho é, não o acabamento. |
| T-844 | limite de teste (do agente Q, nos Bairros Vivos — o quintal) | **A `atmosfera` a4 já não acha, no mundo pronto, uma casa de planta sem lugar para coisas.** O caso «a casa de planta sem quintal não tem o quadro refeito pelo que não mostra» (sabotagem o5 do agente V) precisava de uma casa habitada sem faixa; com o D-186 toda casa da metrópole tem a sua. A a4 diz («nenhuma casa de planta sem lugar para coisas neste mundo») e a prova passou para a `quintal` q4, com uma casa sem lugar feita pela mão da prova (a casca levada até a beira do lote enquanto é olhada, devolvida depois): o que ela tem muda (o `about`), o quadro é o mesmo (sabotagem s16). |
| T-845 | limite de teste (do agente Q, nos Bairros Vivos — o quintal; aberto) | **O que ficou sem lugar.** (1) As coisas de um ofício numa cabana redonda (não há parede reta: só a lenha, o barril e o cesto nos cantos). (2) A casa cujas paredes não têm um vão de ~60 cm a 1 m livre de portas e janelas para as coisas do ofício (13 de 95 na metrópole): mostra o resto. (3) A casa sobre esteios: só no chão, onde o lote deixa faixa funda (nenhuma nos mundos prontos). (4) O banco da casa: não cabe num palmo; fica só na casa com quintal. |
```

E trocar o texto de duas linhas que já existem:

- **T-703**: marcar «(fechado, Q — D-186)».
- **T-702** (medido de novo; o texto certo): «**O cuidado de um prédio pode diferir depois de um load.** O valor da terra vem do retrato do dia da cidade (`G.Urban.peek`), que é derivado e não vai no save. Logo depois do load nenhuma cidade tem retrato e o cuidado lê só o bairro, a casa mercante e a casa vazia (94 prédios diferentes na metrópole); o próprio mundo refaz o retrato, uma cidade por passo (`Urban.update`, L-694): depois de 19 passos — 1,9 s de mundo, as 19 cidades — sobra 1 prédio diferente logo após abrir o mundo pronto, 5 depois de um dia vivido: os de terra cujo valor mudou desde a madrugada, porque o retrato refeito é o da hora do load, não o da virada do dia. Só o desenho muda, e só até a virada do dia. A `atmosfera` a7 conta e diz os dois números; não os exige. Fazer o retrato do load igual ao da madrugada pediria guardá-lo no save (é derivado) ou refazer a madrugada: não feito.»

## 2. Linhas para o `qa/README.md`

```
| `quintal.js` | `[ONLY=q1,q3] node quintal.js [mundo]` | O lugar das coisas em volta dos prédios desenhados pela planta (D-186, D-187), em Node com o three.js e os arquivos do 3D, sem a mão no desenho, na metrópole (e `cidade`, `mega`): toda casa habitada mostra algo, a do lenhador a lenha, a de um ofício as coisas dele, a taverna com o que servir os barris, a olaria com peças cruas os potes — ou a exceção contada, com o porquê —, e nada sem causa (q1); o lenhador, a jarra de vinho, a família, a prateleira e as peças cruas dados e tirados à mão: a coisa aparece e some e a assinatura do quadro muda (q2); coisa a coisa pela geometria — no próprio lote, fora de toda parede, em nenhum chão que alguém anda, na frente de nenhuma porta, sobre nenhuma janela, nenhuma em cima de outra — com as plantas por fazer e feitas (q3); o quadro refeito só pelo que mostra, a casa sem lugar e os montes do armazém (q4); só desenha (q5); o save no meio (q6); as regras do verificador limpas e acusando a mentira (q7); os triângulos a mais (q8). ≈ 40 s na metrópole. Cobre `props3d.js` e a assinatura do quadro do `build3d.js`. |
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

Levam ≈ 35 s, 7 s e 22 s sozinhas e saem com código 1 se um caso falha. Não mudam o mundo pronto nem o save: a linha de base
ganha só as linhas delas, e a linha da `atmosfera` a4 e a7 muda de texto (os casos seguem passando).

## 4. Regras novas do `qa/guard.js`

Antes da linha `if (fails.length) { console.log(fails.join('\n')); …`. Rodei o guard com elas coladas numa cópia
(`ag/Q/guard-test.sh`): passa na minha árvore (152 arquivos) e acusa as sabotagens s1, s2, s4b, s5, s6, s7, s8, s8b, s11, s13,
s16 (regra 60) e s18 (regra 59).

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
// (`P3.yardOf`, com `yard.get(b.id) > 0`); (5) e nada de `K.b.… =`: o desenho não escreve no prédio
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
  need(/P3\.yardOf = b => !!KIND\[b\.type\] && \(!\(G\.Build3D && G\.Build3D\.shellOf && G\.Build3D\.shellOf\(b\)\) \|\| yard\.get\(b\.id\) > 0\);/, 'a assinatura só onde o desenho tem lugar (P3.yardOf)');
  (src['props3d.js'] || []).forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, ''); if (/\bK\.b\.[A-Za-z_]+(\[[^\]]*\])?\s*(=(?!=)|\+=|-=|\+\+|--)/.test(c)) fails.push(`quintal: props3d.js:${k + 1} escreve no prédio que desenha (o desenho só lê): ${l.trim().slice(0, 110)}`); }); }
```

## 5. Frases para o `CLAUDE.md`

Em «As fundações», logo depois de «O que se vê tem causa — `G.Atmos`»:

```
- **O quintal — o lugar das coisas em volta de um prédio** (`js/props3d.js`, D-186, D-187): o que o `G.Atmos.about(b)` diz que um prédio tem fica **no lote do próprio prédio, onde ninguém anda** — o mapa do mundo tem o lote por parede e o corpo só pisa nele na soleira e nos degraus das portas (`Space.indoor`) —, nunca na rua: o corpo não colide com enfeites. Num prédio desenhado pela planta as faixas saem da casca (`shellSlots`: de cada lado, da face de fora mais perto — a casca, um anexo, a cerca do terreiro — até a beira do lote), cortadas nas portas, nos portões e nos degraus que o Build3D pôs (`K.steps`): faixa funda, as coisas no chão; faixa de um palmo (a casa do centro), coisas **finas** na soleira da fundação ou penduradas na parede, livres das janelas; a cabana redonda, nos cantos do lote. Coisa nova em volta de um prédio: uma peça pedida ao `take` (nunca posta à mão num ponto do lote), com o seu nome (`tag`), a sua causa no `G.Atmos.about` e a sua linha nas regras do `qa/quintal-inv.js` (`QA.yard`: nada sem causa, nada onde não pode); as escolhas pelo id (`K.hv`), nunca por sorteio (regra 59 do guard); nada escrito no prédio, e a assinatura do quadro só conta o que há em volta onde o desenho tem lugar (`P3.yardOf`; regra 60). Prova: `qa/quintal.js` (metrópole, cidade, mega).
```

E, na regra 3 do protocolo, onde diz «Mexeu na roupa, na fumaça, nas janelas ou no que há em volta dos prédios (…)? Também
`node qa/roupa.js` e `node qa/atmosfera.js`», acrescentar: «e, pelo que há em volta dos prédios (`props3d.js`), `node qa/quintal.js`
(e `node qa/quintal.js cidade`)».

## 6. Para juntar

- **`qa/junta-inv.js`**: acrescentar `'qa/quintal-inv.js'` à lista `FILES` (depois de `'qa/atmos-inv.js'`) e rodar
  `node qa/junta-inv.js`. O arquivo só define `QA.yard` e pendura uma olhada no `QA.more`; sem o 3D feito, ou sem corpo, não
  faz nada (as vidas em Node não mudam). Não mexi no `qa/atmos-inv.js`.
- **Nenhum arquivo novo em `js/`**; o `index.html` não mudou.
- **Os mundos prontos não precisam ser gerados de novo.** Só mudei `js/props3d.js` e três linhas do `js/build3d.js`, que só
  desenham (o `guarda3d` passa); a `quintal` q5 confere, nos três mundos, o canônico, o save, cada pessoa, prédio e operação e
  o acaso do mundo iguais depois de tudo desenhado, com as plantas feitas; o `det3` passa; a pasta `worlds/` está como veio.
- Arquivos de outros agentes em que mexi: `qa/atmosfera.js` (do V: a a4 nos dois desenhos, a a7 com o cuidado medido).

## 7. As provas e as sabotagens (o que rodei)

(os números finais entram no fim: ver a última seção do relatório do agente)

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
8. **O aspecto, com as texturas e a luz do jogo**, não foi visto: as figuras são sem texturas (T-843). Vale uma olhada no
   navegador antes de publicar.
