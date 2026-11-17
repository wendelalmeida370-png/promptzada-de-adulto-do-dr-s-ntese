# Pilar 1 — Vegetação e biomas: o estudo (batedor, sem implementar)

Árvore lida: `76e3cae`. Nada do jogo foi mudado. 

## 1. O que existe

### 1.1 No mundo (a verdade)

**Os biomas — `js/biomes.js` (`G.Biome`, `G.BIOMES`).** Sete biomas por casa (`S.biome`, Uint8, no save em RLE):
temperado 0, neve 1, taiga 2, pântano 3, selva 4, savana 5, deserto 6. O clima é determinístico pela semente e pelo
relevo: `S.temp` e `S.moist` (Uint8 por casa, refeitos no load por `B.climate`, não salvos), `B.classify(t, m, altura)`.
Cada bioma traz: `fert`, `cost` (custo do caminho), `speed` (passo dos bichos), a lista de árvores com peso (`trees`),
`dens` (chance de árvore dentro de uma mancha de mata), `sparse` (fora dela), `patch` (o limiar do ruído de mata),
`bush`, `fire`, `grow`. A selva: `trees: jungle 5, palm 1, banana .5, cacao .45, coffee .35, pepper .3, acai .25`,
`dens 0.82`, `sparse 0.16`, `patch -0.06` (a mata cobre a maior parte), `bush 0.1`, `cost 1.12`, `speed 0.85`.
`B.canGrow(kind, i)` e o `HOME` dizem onde cada espécie nasce. `B.style(i)` dá o «estilo» do chão
(`snow/dune/swamp/savanna/jungle/taiga/grass`) que o 3D usa para o capim e o chão.

**As árvores — `js/nature.js` (`G.Nature`).** `S.trees` (Map id → árvore) e o índice `S.treeAt` (Int32 por casa): **no
máximo uma árvore por casa** (casa = 4 × 4 m; `addTree` recusa a casa com árvore, objeto ou prédio). A árvore:
`{id, x, y, kind, size, maxSize, stage: grow|fall|log|stump|burnt, wood, chop, claim, v (0..2), ph, fallT, fallDir, t}`,
posta no meio da casa ± 0,2 a 0,22 casa. Tetos: `maxTrees = max(1100, 0,42 × casas de terra)`, e o mato que volta
sozinho até `wildTarget = 0,14 × casas de terra` (longe das cidades). A árvore crescida semeia vizinha (1 a 2,4 casas)
se a espécie cabe ali. Madeira por espécie (`WOOD`, e `G.Flora` para as frutíferas). Fogo por casa (`Nat.fuel`: 'tree',
'bush', 'grass'…), arbustos (`S.bushes`, um por casa em `S.objAt`, com frutinhas) e pedras (`S.rocks`, também em
`S.objAt`).

**A geração — `js/world.js` linhas 634–692.** Por casa de terra (fora do raio 3,2 das cidades iniciais, fora de
penhasco, acima da linha das árvores com 90% de recusa): areia do deserto → cacto/tamareira; rochoso → pedra 20% ou
pinheiro 12%; o resto: `dense = forest(x,y) > BD.patch` e `rng() < BD.dens` (ou `BD.sparse` fora) → uma árvore com
tamanho 0,75–1,05 (15% jovens). Senão arbusto na borda da mata (`fd ∈ (−0,08; 0,1)` e `BD.bush`) ou pedra 1%. Depois
«garante» 18 árvores, 5 arbustos e 5 pedras perto de cada acampamento. Tudo do `rng` semeado do mundo.

**As frutíferas e as abelhas — `js/flora.js` (`G.Flora`).** As espécies de fruto (`apple, mulberry, olive, banana,
cacao, coffee, pepper, acai, date, incense`) amadurecem fruta no galho (`t.fruit`, salva), gente colhe (`'pick'`) e
bichos comem; colmeias em árvores velhas (`S.hives`).

**Quanta árvore numa floresta (medido no código):** uma casa tem 16 m². Na mancha de selva, 82% das casas têm uma árvore:
≈ **0,82 árvore por 16 m², espaçamento médio ≈ 4,4 m entre troncos**, todas no meio da sua casa (± 0,9 m), em grade.
Fora das manchas, 16%. Na temperada, 58% dentro e 3,5% fora; savana 13%/2,5%; taiga 62%/5%. **Não existe sub-bosque no
mundo**: nada entre o capim e a copa — só o arbusto (um por casa, ≤ 10% das casas, na borda da mata) e o capim.

**O que o mundo faz com elas.**
- *Madeira e lenhador:* `villagers.js` `nearestTree` / `chopTask` (raio 22 casas, árvore crescida ≥ 0,7 e alcançável
  pelo mapa de regiões); `G.Nature.fellTree` → `stage 'fall' → 'log'`, `wood` por espécie × tamanho; toco que rebrota.
  O corpo também derruba (`interact.js` 685). O fogo queima (`burnt` → `stump`).
- *Bichos — cobertura (`fauna-meio.js` `coverAt`):* árvore crescida 0,8 (jovem 0,45), arbusto 0,55, o capim alto que os
  pastadores deixaram (`S.veg[i] > 0,95`: `COVERB` por bioma, selva 0,55, savana 0,6), o junco do pântano junto da água
  0,65. Lido na hora, nunca guardado. Usado para esconder o caçador e o filhote, o abrigo da tempestade, a tocaia na
  beira d'água, o sentido do outro (`k *= 1 − 0,35 × c`). `fauna-luta.js` 956 tem uma cobertura própria (árvore, veg >
  0,55, árvore a 1,6). `animals.js` dá comida de folha (`browse`) onde há árvore. A sombra (`shadeAt`) é árvore ≥ 0,6
  numa das cinco casas.
- *`S.veg` (o pasto, Float32 por casa):* **não vai no save** (o load o zera para 0,85 do teto) — já é uma pequena
  diferença entre o mundo vivo e o carregado; os bichos o comem, a cidade o pisa.
- *Passagem das pessoas:* o caminho (`W.cost`) **não sabe de árvore**: só o bioma (`cost` 1,12 na selva), a inclinação, o
  desgaste, o fogo e o medo das feras (`W.danger`). Uma pessoa do mundo passa por dentro da mata como por um prado. O
  passo dos bichos usa `BIOMES.speed` (0,85 na selva).
- *Passagem do corpo:* o corpo colide só com o tronco (`G.Space.trunk(t)`: raio de colisão 0,28 + 0,32 × tamanho: 0,38–0,66 m),
  lido em `avatar.js` 361 e no `space.js`. Copa, arbusto e capim não colidem; o capim e as plantas se abrem em volta do
  corpo (`uBody` no `MAT.plant` e no `Grass3D`).

### 1.2 No 3D (Modo Encarnado)

**Os pedaços (`realm3d.js`, «chunks»).** O mapa em pedaços de 16 × 16 casas (64 × 64 m). Cada pedaço tem:
- uma **figura de longe** (`buildFar`, para todo o mapa): o chão a passo 2, a água, e **cada árvore como uma única forma**
  (um cone de 8 lados para as coníferas, um icosaedro de 20 faces para as outras) pintada com os tons da espécie — sem
  tronco, sem folha (`floraGeo(…, far=true)`);
- uma **figura de perto** nos `q.near` pedaços em volta do foco (raio 1/2/4/5 pedaços = 64/128/256/320 m em
  Leve/Média/Alta/Ultra), em três partes refeitas só quando o que mostram muda (`PARTS`: chão, plantas, prédios). A
  parte das plantas são **três geometrias por pedaço** (`MAT.flora` — troncos, galhos, raízes, as massas da copa, pedras,
  cactos, frutas; `MAT.plant` — o que dobra: folhas de palmeira, cortinas do salgueiro, tufos; `MAT.leaf` — os cartões de
  folha com alfa), com sombra lançada e recebida. **Não há instância**: cada árvore é achatada triângulo a triângulo no
  `Geo.put` (geometria sem índice), três chamadas de desenho por pedaço (+ as da sombra).

**A árvore no 3D — `treeInto` (realm3d.js 1444–1585).** Tipos de desenho do `KIND`: `round` (carvalho, frutíferas,
bétula, oliveira), `tall` (a árvore da selva: o mesmo `round` 1,35 × mais alto e largo), `cone` (pinheiros: tronco +
5 camadas de galhos «rasgadas» + ponta), `palm`/`banana` (tronco em 4 anéis inclinado + 7 a 11 folhas em 3 lâminas, os
folíolos), `cactus` (colunas com costelas e braços), `bush` (café, pimenta, olíbano), `flat` (acácia: guarda-chuva),
`baobab`, `willow` (copa + 26 cortinas). As medidas: `treeDims` — altura H = (5 + 7 × tamanho) × (0,85..1,15) m, a
copa com raio (2,6 × tamanho + 0,8) × (1,35 na selva) e centro a 0,66 H. **A árvore da selva crescida: ~12 m (10–14),
copa de ~9 m de largura começando a ~8 m do chão.** A copa (`crownInto`) é feita de 7 a 9 «massas» (dodecaedro perto,
icosaedro simples longe), iluminadas como um volume só (`g.sph`), com a figura de folhas da pilha (`M3_FOLIAGE`,
`M3_BOUGHS`) aplicada em projeção tripla no shader; **perto** (dentro de 40 m × `lod`: 20/30/40/56 m) cartões de folha
(`card4`, quatro figuras numa textura de canvas 256²: folha larga, folhinhas, agulhas, «as folhas grandes do sul»)
saindo da borda de cada massa (3 por massa na selva), e raízes e galhos finos. A cor: `TPAL` (três tons por espécie,
três variantes `t.v`), um pouco mudada pelo id (`tpal`), acalmada (`LCALM 0,3`). Tudo determinístico pelo `G.hash(t.id…)`.
`R3.crownOf(t)` dá a copa para as folhas que caem (FX). `R3.floraCheck` é o verificador das árvores (pé no chão, copa
longe, UV). `R3.treeMesh(t)` faz uma árvore solta (a que cai, no `fx3d.js`).

**O orçamento de uma árvore (contado pelo código).** Tronco `LatheGeometry` 8 lados × 5 anéis ≈ 80 tri; 4 galhos de 6
lados ≈ 48; 4 a 5 raízes ≈ 25; copa de 9 massas × 36 tri (dodecaedro) ≈ 324; cartões 27 × 2 = 54. **Uma árvore da selva
perto ≈ 500–560 triângulos** (dentro do teto da BÍBLIA: ≤ 1,2 mil); longe, um icosaedro de 20.

**O capim e o chão de perto — `js/grass3d.js` (`G.Grass3D`).** Um campo de tufos em volta do olho, **por instância, uma
chamada de desenho**: um tufo de 5 lâminas × 3 segmentos (30 triângulos), numa grade presa ao mundo (células de 0,5 m ÷
√`grassDen`), raio `q.field` (0/12/30/40 m). O que cresce onde vem do `Ground3D.grassMap()` (R espessura, G altura até
1,5 m, B flores, A o tipo: verde, ouro da savana, junco, o da selva, o curto da taiga, o das dunas) e o chão de cada
casa (`map`). **Na selva o tufo vira «folhas largas» (o `kind == 3.0` alarga a lâmina 3,2× e a arqueia), 0,6–1,1 m de
altura, mais ralo na sombra das árvores.** O vento: rajadas que correm por uma textura de ruído (`uGust`), o corpo e
seis andantes abrem o capim (`uBody`, `uPush`). E as **miudezas no chão** (segunda instância, células de 1 m, raio 13 m ×
√`props`): seixo, três seixos, folha caída, graveto, flor, pinha, concha, cogumelo — escolhidas pelo hash da célula e
pelo chão (`floorMap`: R as folhas das árvores em volta, G se pode, B a umidade, A a neve). A Leve não desenha capim
(`grass: 0`); com `grass` ligado e `field = 0` (só por ajuste do jogador) o capim volta a ser os tufos estáticos do `grassGeo` (realm3d 1674, na geometria `MAT.plant` do pedaço).

**O vento.** Um vento do mundo (`S.weather.windA/windS`) chega ao 3D como `U.wind` (x, y = direção × força, z =
força) e `U.time`. `MAT.flora` balança as copas pelo `aK` de cada ponto (o tronco 0, a copa ~0,24, a conífera +4,
a fruta +2, codificados num atributo só), `MAT.leaf` o mesmo + tremor de folha, `MAT.plant` mais rápido e cedendo ao
corpo, o capim com rajadas.

**A qualidade (`realm3d.js` `QUAL`).**

| campo | Leve | Média | Alta | Ultra | o que faz na vegetação |
|---|---|---|---|---|---|
| `near` | 1 | 2 | 4 | 5 | pedaços de perto (árvores inteiras) — o resto é a figura de longe |
| `view` | 200 | 360 | 640 | 900 | até onde se vê (m) |
| `detail` | 0 | 1 | 1 | 1 | sem ele: sem cartões de folha, sem figura no tronco/pedra (`NOPAT`) |
| `lod` | 0,5 | 0,75 | 1 | 1,4 | cartões, raízes, galhos finos, relevo da casca até 40 m × lod |
| `grass` / `field` | 0 / 0 | 1 / 12 | 1 / 30 | 1 / 40 | o campo de capim (raio m); Leve: sem capim |
| `grassDen` | 0,5 | 0,5 | 0,7 | 1 | parte dos tufos desenhada |
| `props` | 0,25 | 0,6 | 1 | 1 | raio das miudezas no chão |
| `shadows` | 0 | 1024 | 2048 | 4096 | as árvores lançam e recebem sombra |
| `rays` | 0 | 0 | 1 | 1 | os raios do sol baixo pelas frestas (pós) |
| `aniso` | 1 | 1 | 4 | 8 | amostras da folha vista de lado |

### 1.3 Na vista do deus (2D)

`art.js` `Art.trunk(kind, v)` e `Art.canopy(kind, v)`: um sprite por espécie e variante (3), feito uma vez em canvas
(bolhas escuras / base / claras; a selva: elipses largas, folhas largas na borda, cipós riscados no tronco, uma flor
laranja na variante 1). `render.js` `drawEntity` caso 1: tronco + copa com balanço pelo vento (`o.ph`), fruta, toco,
tora, queimada; de longe só a copa. O chão é a cor da casa (`render.js` `tileColor` → `G.Biome.groundColor`: a grade
temperatura × umidade); a casa de selva ganha 4 pares de folhinhas e uma flor rara (`drawTile`), o pântano poças e
junco, a savana fios dourados — mas nada depende das árvores: **o chão debaixo de uma floresta no deus é o mesmo de uma
casa sem árvore do mesmo bioma**; a floresta se lê só pelo amontoado de sprites. Os vaga-lumes da noite nascem em casas com árvore.

### 1.4 Números medidos

**Pelo código, em Node** (o `qa/visual/tres-node.js` do jogo, que monta o 3D só como geometria; script
`scratchpad/natureza/scripts/mede-flora.js`). Mundo gerado da `natureza.js` (semente 4242, continente 192, clima variado):

| bioma | casas de terra | casas com árvore | arbustos | espécies |
|---|---|---|---|---|
| temperado | 3451 | 20,7% | 1,8% | carvalho 306, pinheiro 201, bétula 124, frutíferas |
| neve | 2281 | 6,5% | 0,3% | pinheiro nevado |
| taiga | 2430 | 20,1% | 1,3% | pinheiros, bétula |
| pântano | 1649 | 23,1% | 3,2% | salgueiro 220, açaí 104, bananeira |
| **selva** | 1490 | **57,6%** | **1,3%** | jungle 518, palmeira 139, cacau, banana, café, pimenta, açaí |
| savana | 1332 | 5,6% | 1,3% | acácia 55, baobá 10 |
| deserto | 985 | 1,7% | 0,1% | cacto |

No mundo pronto **«metrópole»** (dia 68, depois de os lenhadores trabalharem e o mato voltar devagar): selva **26,8%**,
temperado 16,6%, taiga 17,2%, savana 1,1%. O que o dono vê nos mundos prontos é uma selva com uma árvore em cada quatro
casas.

O pedaço de 64 × 64 m mais denso de cada bioma, desenhado de perto (`G.Realm.floraOf`, com cartões):

| pedaço | árvores | vizinho mais perto | triângulos (copas+troncos / dobram / cartões) | por árvore | figura de longe |
|---|---|---|---|---|---|
| selva (gerado) | 122 | 3,7 m | 52.614 / 2.500 / 5.794 = **60.908** | ~500 | 2.436 |
| pântano | 98 | 4,2 m | 45.303 / 3.096 / 4.084 = 52.483 | ~535 | 1.960 |
| temperado | 62 | 3,9 m | 27.472 / 890 / 3.600 = 31.962 | ~515 | 1.192 |
| taiga | 67 | 4,1 m | 17.592 / 224 / 4.178 = 21.994 | ~330 | 1.132 |
| selva (metrópole) | 79 | 3,6 m | 36.314 | ~460 | 1.460 |

Uma árvore sozinha, de perto: jungle 573 tri, carvalho 568, pinheiro 256, palmeira 211, acácia 422, baobá 240, cacto
792, salgueiro 422, bétula 444, **cacaueiro 1.108** (as frutas: 3 por massa × 9 massas × 20 tri), café 516. Um pedaço de
selva cheio (82% das 256 casas, ~210 árvores) daria ~105 mil triângulos só de plantas; a Média desenha de perto 21
pedaços (raio 2,5 pedaços), a Alta 69 e a Ultra 97 — **numa selva de verdade fechada, hoje, só as árvores de perto passariam de 1 a
2 milhões de triângulos na Média** (antes do recorte pela vista), contra o alvo da BÍBLIA de ≤ 500 mil para a cena toda.
Ou seja: a selva atual já está no limite da técnica atual (cada árvore achatada triângulo por triângulo, sem instância
nem níveis de detalhe no meio do caminho); a densidade pedida não cabe nela.

**O anel de perto de hoje, em volta do lugar da selva** (`scripts/mede-anel.js`, o teto: cartões em todos os pedaços):
na Média, 21 pedaços, 823 árvores, **468 mil triângulos de plantas**; na Alta, 69 pedaços, 2.403 árvores, **1,22 milhão**.
A figura de longe do mapa inteiro: 2.683 árvores, ~51 mil. Antes do recorte pela vista e sem a imagem da sombra, a selva
de hoje — com uma árvore em cada duas casas — já está no alvo da BÍBLIA para a cena inteira da Média.

**O custo de montar** (CPU, Node, máquina ocupada — carga ~10 em 4 núcleos; `scripts/mede-tempo.js`): as plantas de
perto do pedaço de selva mais denso de hoje levam **325 ms** para montar (60.908 tri); o mesmo pedaço com uma árvore
crescida em toda casa livre (219 árvores) leva **447 ms**, dá **116.489 tri** e **13,6 MiB** de geometria (sem índice:
posição, normal, cor, balanço, UV em Float32). A montagem de um pedaço é um bloco só no `buildNear` — cada vez que o
corpo cruza o anel fino (`floraFine` muda a assinatura) ou uma árvore do pedaço cresce um quarto, cai ou queima, a parte
das plantas inteira é refeita: um soluço de um terço de segundo por pedaço. Uma selva cheia na Média (21 pedaços de
perto) seria ~285 MiB de geometria de plantas. **É o argumento decisivo pela instância**: uma forma por protótipo,
compartilhada, e 32–64 bytes por planta.

**No navegador**: ver a §7 (as fotos e as chamadas/triângulos de cada vista, pela `qa/visual/natureza.js` com `MEDE=1`).

## 2. Os limites diante do pedido

Por que a floresta tropical hoje é «terreno aberto com árvores espaçadas», em ordem de peso:

1. **Não há nada entre o capim e a copa.** O 3D desenha o chão, o capim do Grass3D (na selva, tufos de «folhas largas»
   de 0,6–1,1 m, mais ralos na sombra), as árvores do mundo e o arbusto raro (1,3% das casas de selva). A copa da árvore da
   selva começa a ~8 m. **Entre 1 m e 8 m o olho atravessa a mata até o horizonte**: sem árvores jovens, palmeiras de
   sub-bosque, fetos arborescentes, samambaias, helicônias, cipós, epífitas, sapopemas (as raízes são 5 cones finos),
   troncos caídos (só existem depois de um lenhador).
2. **O teto não fecha.** Uma camada só de altura (10–14 m), copa de ~9 m de largura feita de bolotas redondas — a mesma
   receita do carvalho, 35% maior: «um brócolis grande». Sem árvores emergentes, sem segundo andar, sem o guarda-chuva
   achatado e largo das copas tropicais que se encostam umas nas outras.
3. **A densidade do mundo é baixa e em grade.** Uma árvore por casa de 4 m, no meio da casa ± 0,9 m: a grade se lê; as
   manchas do ruído de mata deixam clareiras grandes de capim; e o mundo vivido rareia a selva (lenhador; o mato que
   volta tem um alvo global de 14% das casas de terra, não um por bioma): 58% num mundo novo, **27% na metrópole**.
4. **A luz de mata fechada não existe.** A sombra da copa só dentro da caixa da sombra (±40 m na Média, nada na Leve);
   fora dela a selva é iluminada como um prado. Não há luz filtrada verde, manchas de sol, umidade, névoa baixa local;
   os raios do pós (`post3d.js`) só com o sol baixo e na direção dele, só na Alta e na Ultra.
5. **Pouca diversidade.** Um tipo `jungle` × 3 tons (`t.v`), uma receita de copa, uma figura de folha «do sul» para os
   cartões. Nada de figueira-mata-pau, bambu, palmeira de leque, feto, árvore florida, bromélia. A repetição só é quebrada
   pelo hash do tamanho, do giro e das bolotas.
6. **De longe, um campo de bolas.** Além dos pedaços de perto (128 m na Média), cada árvore vira um icosaedro de 20
   triângulos ou um cone: nada funde as copas num dossel contínuo; o relevo do dossel visto do alto não existe.
7. **O chão da mata é pobre.** A textura `forest` sob as árvores e as miudezas do Grass3D (folha, graveto, cogumelo, num
   raio de 13 m); sem serapilheira espessa, raízes à mostra, musgo nas pedras e nos troncos além do sulco da casca.
8. **A interação é pela metade.** As plantas se abrem para o corpo e seis andantes (`uBody`, `uPush`), não para os
   bichos; a chuva não molha nem pesa as folhas; o vento é um só para o mapa inteiro (a rajada do Grass3D é a única
   variação local).
9. **O que o mundo sabe e o 3D não mostra.** O capim alto que os pastadores deixaram (`S.veg > 0,95`, a cobertura que
   esconde bichos no `fauna-meio.js`) não é desenhado: o capim do 3D tem altura fixa por tipo de chão. Um bicho
   «escondido no capim» aparece inteiro.

**O que falta, por camada pedida:** emergentes e teto (redesenho das árvores da selva, níveis de detalhe, dossel de longe);
árvores menores e palmeiras de sub-bosque (camada nova); arbustos, samambaias, helicônias, vegetação rasteira (camada nova,
por instância); cipós e trepadeiras (ligados às árvores do mundo); raízes (sapopemas), musgo (casca e pedra), troncos
caídos, folhas no chão (chão e camada nova); clareiras e trilhas (de onde a mata é suprimida: o desgaste dos caminhos, os
prédios, a árvore caída — e uma regra de densidade); a luz (o mapa do dossel para o pilar da luz).

## 3. A proposta de arquitetura

### 3.0 A ideia em uma frase

**O mundo guarda o que conta (a árvore que dá madeira, queima, tem tronco que bate e esconde bichos); todo o resto da
mata é uma função pura do que o mundo já guarda, desenhada por instância, em camadas e níveis de detalhe — e a densidade
dessa mata é uma regra só (`G.Mata`), lida pelo 3D agora e, numa segunda etapa, pelo mundo (passagem e cobertura).**
É o molde do `G.Atmos` (uma fonte só, de leitura, para as duas vistas) e do `G.Space.stones` (a forma derivada que o 3D
desenha e o pé pisa).

### 3.1 O que é só de se ver e o que é do mundo

| coisa | onde vive | por quê | custo para as provas / mundos prontos / desempenho |
|---|---|---|---|
| A árvore que conta (copa, madeira, fogo, tronco que bate, colmeia, fruta) | **mundo**: `S.trees`, uma por casa (como hoje) | o lenhador, o fogo, os bichos, o corpo e o save dependem dela | nenhum (não muda) |
| Como essa árvore é desenhada (altura de dossel, emergente, sapopema, copa em guarda-chuva) | **só se vê**, pelo `G.hash(t.id)` + bioma + umidade | é a mesma árvore com outra forma; o mundo não lê a forma | as provas do 3D (`floraCheck`, e11, `guarda3d`); as coisas presas à árvore passam a perguntar a uma porta (§3.6) |
| Sub-bosque mole: samambaias, helicônias, arbustos, capim alto, plântulas, palmeiras de touceira, bambuzinho, folhas no chão | **só se vê**, espalhado pelo hash da célula, na densidade do `G.Mata` | nada disso tem tronco que pare um corpo: dobra com o empurrão (`uBody`/`uPush`) | nenhum no mundo; desempenho: a camada nova (§3.4) |
| Cipós e epífitas | **só se vê**, ligados a pares de árvores do mundo vizinhas (hash dos dois ids) | pendem das copas que existem; somem quando uma cai | refeitos com a parte das plantas do pedaço (já na assinatura) |
| Caule duro que não é árvore do mundo (feto arborescente, árvore jovem de 10–20 cm, tronco caído derivado) | **porta pura no `G.Space`** (`Sp.stems(i)`, `Sp.logs(i)`) lida pelo 3D e pelo corpo, como o `Sp.stones(r)` | o corpo não pode atravessar um tronco que vê; o mundo dos outros não muda | o `avatar.js` colide com eles (o `movimento.js`, as provas do corpo); nenhum save novo |
| **Densidade da mata (0..1 por casa)** e a sua forma no chão (clareira, trilha, mata fechada) | **função pura do mundo salvo**: `G.Mata.at(i)` (§3.2) | uma regra só para as duas vistas e, depois, para o mundo | etapa 1: nenhum (só o 3D e o deus leem); etapa 2: ver a linha de baixo |
| Mata que atrapalha a passagem e esconde (etapa 2) | **mundo**, lendo o `G.Mata.at` | coerência: o que se vê fechado esconde e custa a atravessar | **alto**: o `W.cost` muda os caminhos de todo mundo → mundos prontos de novo, linha de base, `det3`, invariância, equilíbrio da fauna (`fauna.js` f2, `meio.js`), guerra (`portao-guerra`), economia (`oficio-eco`) |
| Mais árvores na selva (densidade do mundo, mato que volta por bioma) (etapa 3) | **mundo**: `biomes.js` (`dens`, `patch`, `sparse`), `nature.js` (`wildTarget` por bioma, a sucessão nas clareiras) | a selva vivida não pode cair para 27% | **alto**: muda a geração e o mundo vivido: mundos prontos, fauna (comida de folha, cobertura), madeira, fogo; o save cresce ~40 bytes por árvore |

### 3.2 A regra da densidade — `G.Mata` (arquivo novo, `js/mata.js`, puro)

Uma função **pura** de dados que o save já tem, sem acaso do mundo nem do que só se vê (o hash da casa e a semente), e
uma pequena memória refeita por versões:
- **entrada**: bioma, `S.temp`, `S.moist` (refeitos do clima no load: são do relevo e da semente), distância à água
  (`G.Meio` já tem `dF`; ou a do `biomes.js`), a vizinhança de árvores do mundo (`S.treeAt`: o dossel e a luz), as
  clareiras de árvore caída (`stage` stump/log/burnt e `t.t`, quanto tempo faz — a sucessão: a clareira enche de
  embaúba e helicônia depois), `S.wear` (as trilhas: `pathLevel` ≥ 1 abre caminho; ≥ 2 é trilha batida), `S.road`,
  `S.occ`, `S.wall`, o anel das cidades (`G.Meio.townAt` já existe), `S.burnt`/`S.scar` (o fogo limpa), `S.slope`/
  `S.cliff`, a neve (`Ground3D.snowAt`), e um ruído de baixa frequência da semente (manchas de mata fechada, clareiras
  naturais, touceiras de bambu).
- **saída** por casa: `dens` (0..1: rasteira → impenetrável), `luz` (o quanto o dossel fecha: 0 aberto, 1 teto), e a
  composição (quanto de samambaia, de palmeira, de bambu, de capim alto) — números, nunca objetos.
- **memória**: um `Uint8Array` por campo, refeito **por região suja, no momento da leitura** — nunca por uma ronda de
  quadros como o `Ground3D.rows` (ver §4: o mundo não pode ler um campo atrasado) — pelas versões que já existem
  (`S.typeVer`, `S.walkVer`) e uma nova das árvores, `Nat.treeVer`, que `addTree`/`removeTree`/`fellTree` e toda mudança
  de `stage` sobem (a regra do guard: o estágio de uma árvore muda por uma porta do `nature.js`). Num módulo, zerada pelo
  `G.worldHooks`. Quem lê fora do passo do mundo só lê.
- **dependências**: só arquivos do mundo. A neve vem da temperatura pela mesma fórmula do `Ground3D.snowAt` — mas o
  `ground3d.js` é do 3D (a lista da regra 9) e não roda no `nodemundo`: a regra da neve passa para o mundo (o `biomes.js`)
  e o `Ground3D.snowAt` a chama, para continuar uma regra só (D-028).
- **o guard**: só o `mata.js` escreve a memória; nenhum `G.R`/`G.VR`/`Math.random` dentro dele; e, na etapa 2, quem
  decide passagem e cobertura pergunta ao `G.Mata` (nunca recalcula a sua própria).
- **o verificador** (`QA.check`, «mata»): a memória bate com o recálculo em casas sorteadas pelo hash; zero em estrada,
  prédio, água e cinza; trilha onde o desgaste é ≥ 2.

Na etapa 1 só o 3D e a vista do deus leem o `G.Mata`; o mundo fica igual byte a byte (a prova: o save igual antes e
depois de desenhar, como a `quadro-limpo` e a `pontes` p8 fazem). Na etapa 2 o `W.cost` multiplica por `1 + k × dens`
(nunca bloqueia: impenetrável é caro, não parede — o mapa de regiões, `W.reachIds`, não muda), o `coverAt` do meio usa
`max(c, dens × 0,8)`, o passo dos bichos grandes pelo `A.speedHooks`, e o corpo e as pessoas andam mais devagar no
mato (o fator do `villagers.js` `move` e do `avatar.js`, como a inclinação). As trilhas nascem de onde se anda — o
desgaste já é do mundo; os bichos poderiam desgastar também (hoje só as pessoas).

### 3.3 As camadas da selva no 3D (o que se desenha)

Do chão para cima, cada uma com a sua técnica:

| camada | o que é | técnica | de onde |
|---|---|---|---|
| chão | serapilheira, raízes à mostra, musgo, poças | textura (`forest`, `moss`, `soil` da pilha) pela camada «folhas» do `floorMap` mais funda onde `luz` é alta; miudezas do Grass3D com folhas largas caídas e raízes | `Ground3D`, `Grass3D` |
| rasteira (0,2–1,5 m) | samambaias, aráceas, helicônias, plântulas, capim de sombra | **campo por instância em volta do olho** (o molde do Grass3D: grade presa ao mundo, posição no shader, uma chamada por protótipo), lendo um mapa da densidade do `G.Mata` | `js/mata3d.js` (novo) |
| arbustiva (1,5–5 m) | palmeiras de touceira (açaí, geonoma), fetos arborescentes, arbustos, bambu | **instância por pedaço**, montada na CPU pelo espalhamento determinístico, níveis de detalhe por distância | `mata3d.js` |
| sub-dossel (5–15 m) | árvores jovens, palmeiras altas, a árvore pequena do sub-bosque | instância por pedaço; os de caule duro pelo `Sp.stems` (o corpo bate) | `mata3d.js` + `space.js` |
| dossel (20–32 m) | as árvores do mundo da selva redesenhadas: tronco reto e liso, sapopemas, copa achatada e larga (6–9 m de raio) que encosta na vizinha | a árvore do mundo, com níveis de detalhe (§3.4) | `treeInto` (realm3d → um arquivo próprio) |
| emergentes (40–50 m) | ~1 em 12 árvores crescidas da selva (pelo hash do id e o tamanho): a sumaúma, o angelim | idem, mais alta, copa em guarda-chuva acima do teto | idem |
| cipós e epífitas | cordas pendentes entre copas e até o chão, bromélias nos galhos, barba-de-velho no pântano | fitas de poucos segmentos (balançam), cartões pequenos | ligados a pares de árvores do mundo |
| luz e ar | sombra do teto, manchas de sol, neblina baixa | **mapa do dossel** (vista de cima, 1 texel por 2 m) dado ao pilar da luz | `mata3d.js` → pilar 4 |

### 3.4 Instância, níveis de detalhe e orçamento

- **Protótipos, não árvores achatadas.** Uma biblioteca de 30–60 formas (5–8 samambaias, 4 aráceas, 3 helicônias,
  4 palmeiras de touceira, 3 fetos arborescentes, 4 arbustos, 3 bambus, 6 plântulas/árvores jovens, as copas e troncos
  das espécies do mundo em 3 níveis), cada uma uma `BufferGeometry` indexada pequena (60–600 tri), feitas uma vez por
  código (pelo hash, como o `fsh()` de hoje) ou pelo Blender do `arte/blender/` (a convenção das malhas já existe:
  `G.Mesh3D.part`). A variação vem de 6 números por instância (posição, giro, escala, tinta, fase do vento, rigidez).
- **Três maneiras de desenhar, pelo tamanho e pela quantidade:**
  1. *campo em volta do olho* (rasteira, dezenas de milhares): `InstancedBufferGeometry` com a grade no shader, como o
     `Grass3D` — uma chamada por protótipo (ou por grupo de protótipos num atlas). Na máquina sem placa (SwiftShader) o
     vértice descartado no shader ainda custa (D-029): a densidade é o espaçamento da grade, não um sorteio; e o truque das
     miudezas do Grass3D (cada célula traz todas as formas e só uma fica) não escala para dezenas de protótipos — cada
     protótipo tem a sua grade própria, ou as listas de instância vêm da CPU (abaixo);
  2. *instância por pedaço* (arbustiva, sub-dossel, cipós; centenas a milhares): `InstancedMesh` ou `BatchedMesh` do
     three r170 (está no build: várias formas numa chamada, recorte por instância pela vista, a forma trocada por nível
     de detalhe com `setGeometryIdAt`) — os dados da instância montados uma vez por pedaço, refeitos pela assinatura;
  3. *dossel de longe*: em vez de 200 icosaedros por pedaço, **uma manta do dossel** — uma grade de 2–4 m por pedaço com
     a altura do alto das copas (o máximo das cúpulas das árvores do mundo) e a cor de cada copa, ~500–2.000 tri por
     pedaço; e, entre a manta e as árvores inteiras, **impostores** (cartões com a figura da copa vista de 8 lados) ou a
     copa simplificada (1–3 bolotas, ~60–120 tri).
- **Níveis de detalhe da árvore do mundo** (hoje: inteira com cartões até 40 m × `lod`, inteira sem cartões até o anel
  de perto, um icosaedro além): **perto** (≤ 30–60 m) a forma inteira, cartões, raízes, cipós; **meio** (≤ 120–250 m) tronco
  simples + copa de poucas massas, sem cartões; **longe** a manta/impostor. A troca por distância sem soluço: ou por
  instância (a forma de cada nível num `BatchedMesh`) ou com dissolvência pelo hash do pixel (o `MAT.leaf` já faz).
- **O orçamento por qualidade** (proposta para o A5, dono dos presets — campos novos `mata`, `mataR`, `cipo`, `impost`):

| qualidade | rasteira (raio, parte) | arbustiva / sub-dossel | dossel | cipós, epífitas | sombra das plantas | alvo extra numa selva |
|---|---|---|---|---|---|---|
| Leve | nada (o capim de hoje: nada) | até 30 m, 30% | meio além de 40 m, manta além do anel | não | não | ≤ +40 mil tri, +2 chamadas |
| Média | 15 m, 50% | até 60 m, 60% | inteira até 30 m | perto | só o dossel | ≤ +200 mil tri, +6 chamadas |
| Alta | 35 m, 80% | até 120 m, 100% | inteira até 60 m, impostores | sim | dossel + arbustiva perto | ≤ +500 mil tri, +10 chamadas |
| Ultra | 50 m, 100% | até 200 m | inteira até 90 m | + epífitas, musgo | todas perto | ≤ +1 milhão tri, +12 chamadas |

  O alvo da BÍBLIA (Média ≤ 500 mil tri e ≤ 200 chamadas para a cena toda) foi medido para não ficar mais cara que o jogo
  antes do estúdio *por software*; o dono disse que o alvo é o PC. Proposta: Leve e Média continuam baratas (celular,
  máquina fraca) e o «documentário» mora na Alta e na Ultra — com a regra de sempre: a mesma mata em todas, as maiores
  só desenham mais dela, mais longe e mais fina.
- **A sombra.** As plantas pequenas não entram na imagem da sombra (o custo dela é um terço dos triângulos da Média,
  medido no estúdio); o dossel entra. Fora da caixa da sombra, o **mapa do dossel** escurece o chão, a rasteira e as
  pessoas debaixo do teto (e esverdeia a luz do céu ali) — barato, para a mata inteira, também na Leve.
- **A transparência.** Cartões com recorte por alfa custam no excesso de pintura (a câmera dentro da mata vê dez camadas):
  folhas de perto como triângulos opacos cortados no feitio da folha (a samambaia em tiras, a helicônia em lâminas), o
  alfa só de longe; `alphaToCoverage` com MSAA no PC; nada de transparência misturada.
- **A montagem.** Nada de 325 ms num quadro: os dados da instância de um pedaço montados em fatias pelo orçamento do
  `stream` (ou num `Worker` com o mesmo código puro — o hash e o `G.Mata` não dependem do DOM), e a parte das plantas
  separada em «árvores do mundo» (refeita quando uma árvore muda) e «mata derivada» (refeita quando o `G.Mata` da área
  muda), para um lenhador não refazer a mata inteira.

### 3.5 A geração procedural e a diversidade sem repetição

- **Espalhamento por amostragem de disco de Poisson determinística por célula** (uma grade de 1–2 m; em cada célula, um
  ponto pelo hash da célula e da semente, aceito pela densidade do `G.Mata` naquele ponto, com o ruído de sub-casa para a
  borda não seguir a grade de 4 m) — nada de grade visível.
- **Espécies por nicho, não por sorteio**: cada protótipo tem um nicho (luz, umidade, distância à água, inclinação,
  borda de clareira, beira de trilha, perto de tronco) e o espalhamento escolhe pelo peso do nicho naquele ponto: a
  helicônia na clareira e na beira do rio, a samambaia na sombra funda, o bambu nas manchas do ruído, a palmeira de
  touceira no baixio úmido, o feto arborescente na encosta úmida. É isso que dá «coerência natural» e mata a repetição:
  o mesmo protótipo aparece onde a regra o põe, em manchas, não salpicado.
- **Variação por instância**: escala (± 30%), giro, inclinação para a luz (pendem para a clareira), tinta (± 8% em matiz
  e valor, folha nova avermelhada em 3%), idade (plântula → adulta), o vento (fase e rigidez). As árvores do mundo da
  selva: 4–6 «arquiteturas» de copa (guarda-chuva, camadas, colunar, palmeira, figueira de raízes aéreas) escolhidas pelo
  hash do id, todas na paleta calma.
- **A paleta**: a BÍBLIA §2.2 (capim S 50–62, nunca S > 65 em grande área) e a lição da «selva neon» (84% dos pixels de
  planta acima de S 70 em Tenochtitlan): a selva é escura e funda, o verde varia em valor e matiz (azulado na sombra,
  amarelado no sol), acentos pequenos (a flor da helicônia, o ipê florido raro).

### 3.6 O vento, a chuva e a passagem de quem anda

- **Vento em três níveis**: o tronco (lento, pouco, pela altura), o galho (cada massa da copa com a sua fase), a folha
  (o tremor dos cartões). A rajada que já corre no Grass3D (`uGust`, a textura de nuvem andando com o vento) vale para
  toda planta: uma onda que atravessa o dossel. Tudo pelos atributos de cada ponto (rigidez, fase) e pelos uniformes
  `U.time`, `U.wind` — só se vê.
- **A chuva**: lida do `S.weather.rain` e do `G.Nature.rainAt` (as nuvens que molham): folhas mais escuras e brilhantes,
  o vento mais pesado, gotas pingando das copas depois (partículas do `fx3d.js` pelo `G.VR`).
- **Quem passa**: o corpo e as seis pessoas mais perto já abrem o capim (`uBody`, `uPush`); estender aos bichos perto
  (a lista do `People3D`) e a toda camada mole (a samambaia se abre e volta). A câmera atrás do corpo dentro da mata: a
  dissolvência perto do olho (hoje 1,5 m, `MAT.flora`/`MAT.leaf`) vira um cilindro entre o olho e o corpo para toda
  planta (a mata nunca tapa o corpo).
- **As coisas presas à árvore perguntam a uma porta** (`R3.treeAnchor(t)` ou um `G.Flora3D.anchor(t, 'colmeia'|
  'ninho'|'pouso'|'fruta'|'copa')`): hoje a colmeia (`things3d.js`: chão + 2,6 + tamanho × 2,2 m), o ninho
  (3 + tamanho × 3,2), o bicho na árvore (`people3d.js`: no máximo 4 m), as folhas que caem (`R3.crownOf`) e a árvore que
  cai (`R3.treeMesh`, a tora de 4,5 × tamanho m no `treeInto`) leem medidas próprias; com o dossel a 25 m, sem a porta a
  colmeia fica no meio do tronco liso e o macaco no pé da árvore.

### 3.7 A identidade de cada bioma

| bioma | o que o define (o que o olho deve reconhecer a 100 m) |
|---|---|
| **Selva** | cinco andares; emergentes acima do teto; dossel contínuo verde-escuro em ondas; troncos retos lisos com sapopemas e musgo; cipós caindo; sub-bosque fechado de palmeiras, samambaias e helicônias; serapilheira funda; luz verde e manchas de sol; névoa baixa de manhã; bambu nas manchas e beira de rio |
| **Temperado** | carvalhos e faias largos de 15–25 m, bétulas claras em grupos; sub-bosque aberto de aveleira e samambaia-águia nas clareiras; tapete de folhas, musgo do lado úmido do tronco, tronco caído com fungos, flores do prado na borda |
| **Taiga** | abetos cônicos de alturas variadas e pontas finas, alguns mortos em pé; chão de musgo, líquen e mirtilo; poucas bétulas; neve pesando nos galhos; manchas escuras e frias |
| **Tundra / neve** | quase sem árvores: arbustos rasteiros (salgueiro anão, urze), líquen nas pedras, capim-algodão; pinheiros raquíticos e tortos na borda (krummholz), o vento deitando tudo para um lado |
| **Savana** | capim dourado alto (1–2 m) que o vento penteia; acácias de copa chata espaçadas, baobás; cupinzeiros; arbustos de espinho; cicatrizes de fogo (`S.burnt`) |
| **Deserto** | dunas (do pilar do relevo), touceiras secas, cactos e arbustos espaçados com sombra dura, tamareiras no oásis, pedra; quase nada se mexe |
| **Pântano** | salgueiros e árvores com raízes na água, junco e taboa em massa, plantas aquáticas boiando (ninfeias, aguapé — fronteira com a água), barba-de-velho pendurada, troncos mortos em pé na água, névoa |

(Não há estações no jogo hoje; se vierem, entram na tinta e na queda das folhas pela mesma porta.)

### 3.8 A vista do deus

- **O chão da mata**: a casa sob dossel pintada mais escura e musgosa (a mesma medida `luz` do `G.Mata`) no
  `render.js` `tileColor`/`drawTile` — o chão da floresta deixa de ser o verde do prado. Exige redesenhar a casa quando a
  árvore vizinha muda (`G.Nature.markDirty` das 8 vizinhas no `addTree`/`removeTree`/queda — hoje só a casa da árvore).
- **O sub-bosque**: os detalhes da casa de selva (hoje 4 pares de folhinhas e uma flor) ganham samambaia, palmeira baixa,
  helicônia pela densidade e composição do `G.Mata` — no cache dos pedaços do chão, sem custo por quadro.
- **O dossel**: sprites da selva mais largos e sobrepostos (o `Art.canopy('jungle')` de 40 × 40 px), 4–6 arquiteturas
  pelo hash do id em vez de 3 variantes, a emergente maior; cipós riscados entre árvores vizinhas no zoom de perto. Nada
  que pareça uma árvore onde o mundo não tem árvore (o deus derruba, clica e queima árvores: o que parece árvore tem de
  ser uma).
- **Custo**: tudo cacheado em canvas como hoje; nenhuma entidade por planta derivada.

### 3.9 As etapas sugeridas

1. **Etapa 1 — só se vê** (o mundo igual byte a byte): `G.Mata` puro lido só pelo 3D e pelo deus; a árvore da selva
   redesenhada em dossel e emergentes com níveis de detalhe e a manta de longe; as camadas por instância; cipós; o mapa do
   dossel para o pilar da luz; o capim alto do `S.veg` desenhado; a porta das coisas presas à árvore; a vista do deus.
   Provas do 3D e do deus; nenhum mundo pronto gerado de novo (a não ser que se queira as fotos novas — o mundo é o mesmo).
2. **Etapa 1b — o corpo bate no que vê**: `Sp.stems` / `Sp.logs` puros no `space.js`, o `avatar.js` colidindo (como com
   as pedras). Mexe só no corpo: o `movimento.js`, as provas do corpo, a invariância.
3. **Etapa 2 — o mundo lê a mata**: passagem (`W.cost`, o passo), cobertura (`coverAt`), passo dos bichos. O protocolo
   inteiro, regressão completa, mundos prontos de novo.
4. **Etapa 3 — mais selva no mundo**: densidades do `biomes.js`, o mato que volta por bioma, a sucessão nas clareiras.
   Idem.

## 4. Os riscos

- **Determinismo.** Toda variação do que se vê pelo `G.hash` do id ou da célula com a semente, nunca `G.R` (a regra 9
  do guard já cobre os arquivos do 3D; o `mata3d.js` entra na lista, o `mata.js` numa lista própria «puro, só lê» como a
  do `atmos.js`, regra 51). Efeitos passageiros (gota, folha que cai) pelo `G.VR`. **Na etapa 2 o perigo é o atraso**: o
  `Ground3D` refaz o seu mapa uma faixa por quadro — se o `W.cost` lesse uma memória que anda por quadros, o salto e o
  passo (e o mundo com e sem tela) veriam campos diferentes e se separariam (o `det3`, o `detloc`, a invariância A–F
  acusariam). A memória do `G.Mata` tem de ser exata a cada leitura: refeita por versão e região sujas, no momento da
  leitura, nunca por uma ronda de quadros.
- **Mundos prontos.** Etapa 1: nada muda no save. Etapas 2 e 3: todos os sete de novo pelo salto do jogo (`qa/prontos.js`,
  horas para o «anos1000»), `qa/mundos.js`, e a linha de base da regressão com cada `NOVO:` explicado.
- **O salto.** A densidade é lida só onde decide (custo de caminho, cobertura); a função tem de ser O(1) por leitura
  (um `Uint8Array`), porque o `W.cost` roda dentro da busca A* milhares de vezes por passo. O salto não desenha: nada do
  3D pode ser pré-requisito do mundo (o `floraFine` de hoje é só do desenho).
- **A vida dos bichos (cobertura).** A cobertura decide a caça, a tocaia na água, o filhote escondido, o sentido do
  outro (D-300 a D-309). Mais cobertura na selva = predadores mais eficientes e presas mais escondidas: o equilíbrio de 60
  anos (`qa/fauna.js` f2, T-1319, já oscilante), o `qa/meio.js` e o `qa/luta.js` precisam ser medidos de novo; a L-1013
  («um mundo novo era todo capim alto») mostra que um limiar errado esconde todo mundo. Na etapa 1 nada muda nos bichos.
  Do lado da tela: a mata fechada que esconde o leopardo é verdade, mas o `corpo-fera` (D-297: «o golpe visto antes de
  chegar») pede que o perigo se anuncie (som, folhas mexendo pelo bicho que passa) — senão é injusto.
- **O capim alto do `S.veg` não vai no save** (o load o recomeça a 85% do teto, abaixo dos 95% do «capim alto»): se o
  3D o desenhar, depois de um load o capim alto some de todo o mapa e volta aos poucos. Decidir antes: salvar o `S.veg`
  (muda o save e a cobertura dos bichos depois de um load — hoje o bicho escondido no capim também deixa de estar
  escondido ao carregar) ou aceitar e dizer na AUDIT.
- **O lenhador e as coisas presas à árvore.** Com a árvore da selva desenhada a 25–45 m, a árvore que cai (`fx3d.js`
  `R3.treeMesh`), a tora (4,5 × tamanho m no `treeInto`), a colmeia, o ninho, o macaco na árvore e as folhas que caem
  precisam da porta da §3.6, ou ficam no lugar errado. O e9/e11 do `encarna` (a árvore cai pelo corte, cai e deita) e a
  `represa` r3 (o castor e o lenhador) tocam nisso.
- **O corpo.** A câmera atrás do corpo dentro da mata (a dissolvência em cilindro); os caules duros derivados nunca em
  estrada, prédio, porta, degraus, desgaste ≥ 1, nem fechando um bolsão em volta de um ponto onde o corpo cabe (as
  pessoas do mundo, que passam por tudo, nunca podem ir aonde o corpo não vai — e o corpo nunca pode ficar preso: as
  provas do `soleira`, do `porta`, do `chao-aberto`, do `movimento`). A tela que diz o que há ali (`interact.js`) não
  oferece cortar um caule derivado (não é madeira do mundo).
- **Desempenho.** Medido aqui: 325–450 ms para montar um pedaço de selva e 13,6 MiB de geometria por pedaço cheio — sem
  instância e montagem fatiada, a selva densa engasga a cada passo pelo mapa. O excesso de pintura dos cartões com alfa é
  o custo escondido de toda mata fechada (a câmera dentro dela); a sombra das plantas pequenas, o outro. A fase «perf» da
  regressão compara com a linha de base: todo aumento precisa ser medido e explicado (`qa/visual/desempenho.js
  --compara`).
- **PC e celular.** O PC é o alvo: a mata densa mora na Alta e na Ultra. O celular fica jogável pela Leve e pela Média
  (sem rasteira na Leve, raios curtos na Média), a memória de geometria pela instância, e nenhum teto posto pelo celular.
  A máquina de teste não tem placa: as provas comparam chamadas e triângulos; os tempos só relativos (D-137).
- **A paleta.** Muitas camadas de verde somam saturação (a «selva neon» do A6: 84% dos pixels de planta acima de S 70).
  Toda camada nova passa pela régua da BÍBLIA (capim S 50–62, nada de S > 65 em área grande) — uma prova numérica dos
  pixels de planta, como a do A6.

## 5. Os arquivos e as fronteiras com os outros pilares

**Arquivos novos (sugestão):**
- `js/mata.js` — a regra da densidade (pura, lida pelas duas vistas; na etapa 2, pelo mundo); a tabela das receitas de
  cada bioma pode morar como dado no `G.BIOMES` (`mata: {...}`) do `biomes.js`.
- `js/mata3d.js` — as camadas do 3D: o campo da rasteira em volta do olho, a instância por pedaço (arbustiva,
  sub-dossel), os cipós e epífitas, o mapa do dossel, a manta do dossel de longe; o seu `check()`.
- `js/arvore3d.js` — a árvore do mundo no 3D (tirar de dentro do `realm3d.js` o bloco do A3: `KIND`, `TPAL`, `tpal`,
  `treeDims`, `crownInto`, `treeInto`, `fsh`, `card4`, `R3.crownOf`, `R3.treeMesh`, `R3.floraCheck`) com os níveis de
  detalhe e a porta `anchor`.
- `js/planta-formas.js` (ou malhas do `arte/blender/` → `js/mesh-plantas.js`) — os protótipos, puros; a folhagem num atlas
  feito no canvas em tempo de jogo, pelo hash (como o `MAT.leaf` de hoje: não gasta o orçamento de 6 MiB da pilha, onde
  sobram 0,8 MiB), ou, se o A1 aceitar, um atlas novo na pilha.
- Provas: `qa/mata.js`, `qa/mata-inv.js` (as regras do verificador), `qa/visual/mata3d.js`.

**Arquivos que mudam:** `realm3d.js` (o `floraGeo` dividido; a figura de longe; a assinatura das plantas; os blocos
`MAT.flora`, `MAT.leaf`, `MAT.plant`; o `QUAL` pelo A5), `grass3d.js` (a densidade do `G.Mata`, o capim alto do
`S.veg`, o empurrão dos bichos), `ground3d.js` (o chão sob o dossel: `floorOf`, `grassOf`), `things3d.js` (colmeia e ninho
pela porta), `people3d.js` (o bicho na árvore pela porta; os andantes que empurram), `fx3d.js` (a árvore que cai, as folhas,
as gotas), `space.js` + `avatar.js` (etapa 1b), `render.js` + `art.js` (o deus), `nature.js` (`Nat.treeVer`, o
`markDirty` das vizinhas; etapa 3), `biomes.js` (receitas; etapa 3), `fauna-meio.js`, `world.js`, `villagers.js`,
`animals.js` (etapa 2), `index.html`, `qa/guard.js`, `qa/qa.js`, `qa/README.md`, `qa/AUDIT.md`, `arte/BIBLIA.md` (a tabela
de identidade dos biomas e o orçamento novo).

**Onde topa com os outros pilares:**
- **Chão e relevo (2):** o material do chão da mata (`forest`, `moss`, `soil`, a mistura no shader do `Ground3D`), as
  pedras (hoje desenhadas no `floraGeo`, na parte das plantas — decidir de quem ficam: pedras e formações rochosas são do
  relevo, o musgo nelas lê o `G.Mata`), a linha das árvores pela altitude (`world.js` `treeLine`), a vegetação nas
  encostas e nos penhascos (`S.slope`, `S.cliff`: o 3D do relevo que mudar a forma do chão muda onde as plantas pisam —
  toda planta pergunta a altura ao `G.Space`/`W.groundH`, nunca guarda a sua), a neve (`Ground3D.snowAt`, uma regra só,
  D-028).
- **Água (3):** a beira (junco, taboa, mangue, aguapé e ninfeia sobre a água — a planta é deste pilar, a superfície onde
  ela boia é da água), a margem molhada (`floorMap` B), a névoa da cachoeira que molha a mata em volta, nada de rasteira
  onde a água desenha espuma e areia molhada (`wetCorner`).
- **Céu, luz e atmosfera (4):** o mapa do dossel (este pilar entrega; o da luz o usa para a luz filtrada, as manchas de
  sol, os raios volumétricos pelas frestas e a neblina debaixo do teto), o vento (uma fonte só, `U.wind` e a rajada
  `uGust`: se o pilar 4 fizer um vento local, as plantas leem o mesmo), a chuva (`S.weather.rain`, `Nature.rainAt`), a
  curva de tom e a gradação (a saturação final das plantas depende delas — a «selva neon» foi da gradação também).
- **Os bichos (fora dos quatro):** a cobertura (etapa 2) e o pouso nas árvores (a porta da §3.6); o pé do bicho na
  rasteira (o empurrão).

## 6. As provas

**Em Node (segundos a minutos):**
- `qa/mata.js` (nova): **m1** o `G.Mata` é puro — o mesmo mundo dá o mesmo campo; nenhum sorteio consumido (o `S.rng`
  igual antes e depois de ler o mapa inteiro); **m2** a memória bate com o recálculo depois de cada mudança do mundo
  (árvore cortada, queimada, crescida um décimo, prédio, estrada, desgaste, inverno do deus) e depois de um save e um
  load; **m3** zero em estrada, prédio, muro, água e cinza; trilha onde o desgaste é ≥ 2; **m4** a clareira da árvore
  caída e a sua volta pelos dias; **m5** (etapa 2) o salto e o passo dão o mesmo campo e os mesmos caminhos; **m6**
  (etapa 1b) os caules duros nunca em rua, porta, degraus, desgaste, e nenhum bolsão onde o corpo fique preso (um
  enchimento a partir de cada ponto onde o corpo cabe).
- `qa/visual/mata3d.js` (nova, pelo `tres-node.js`): cada camada em cada bioma — instâncias e triângulos por qualidade
  dentro do orçamento; nada sem número; tudo no chão (o pé a ±0,2 m do `floorY`, como o `floraCheck`); nada em estrada,
  prédio ou água; a mesma geometria duas vezes; **o save igual byte a byte antes e depois de desenhar** (como a `pontes`
  p8 e a `quadro-limpo`); a montagem de um pedaço abaixo de um teto de ms (relativo); os cipós terminam em árvores que
  existem; a porta `anchor` dentro da copa/tronco desenhados; o mapa do dossel bate com as árvores.
- O `R3.floraCheck` e o `Grass3D.check` estendidos — **e chamados**: hoje nenhuma prova nem o verificador os chama
  (achado deste estudo: `grep` no `qa/` e no `js/` só acha as definições; o `Ground3D.check` é o único das plantas e do
  chão que o `qa/qa.js` e o e11 leem) — vale uma entrada T- no `AUDIT.md` quando o executor começar; `node qa/guard.js` com as regras novas (só o `mata.js` escreve a
  memória; o `mata3d.js` na lista do que só se vê; quem decide passagem e cobertura pergunta ao `G.Mata`); `node
  qa/visual/guarda3d.js .` (o 3D desenha sem erro de módulo), `node qa/visual/corpo-rig.js`, `qa/visual/quadro-limpo.js`
  (o deus não muda o mundo).
- A régua da cor: a parte dos pixels de planta acima de S 65 numa foto de selva (como a caça do A6).

**No navegador (pela fila):**
- `qa/visual/natureza.js` com vistas novas: dentro da selva fechada na altura do olho, olhando para o alto (o teto), numa
  clareira, numa trilha, de madrugada (a névoa), de cima (o dossel de longe); `MEDE=1` em Média, Alta e Ultra.
- `qa/visual/desempenho.js` com uma vista fixa de selva no conjunto (para a fase «perf» da regressão cobri-la), chamadas
  e triângulos comparados com a linha de base.
- `ONLY=e11 node qa/encarna.js` (o 3D desenha), o e9 (a árvore cai pelo corte), `qa/movimento-tela.js` e `qa/corpo-fera.js
  tela` numa selva (a câmera e a mata; a fera vista antes do golpe).

**Na etapa 2 e 3, além disso:** a regressão completa, `det3`, `bash qa/invariancia.sh`, `qa/fauna.js` (f2), `qa/meio.js`,
`qa/luta.js`, `qa/portao-guerra.js`, `qa/oficio-eco.js`, os mundos prontos de novo e `qa/mundos.js`; e um verificador
novo no `qa/qa.js` («mata»: a memória igual ao recálculo; nada de mata em estrada, prédio, água; trilha onde se anda).

## 7. As fotos de hoje

**Fotos geométricas, em Node** (sem navegador: o desenho por software do `qa/visual/quintal-fotos.js` aplicado ao chão e
às plantas de perto, `G.Realm.floraOf`, num quadrado de 32 × 32 casas; **sem textura, sem o capim do Grass3D, sem a luz
do jogo, os cartões de folha aparecem como polígonos cheios** — servem para ver a estrutura, não a aparência; uma caixa
vermelha de 1,75 m a 4 m do olho dá a escala; script `scratchpad/natureza/scripts/foto-mata-node.js`, o lugar escolhido
pela regra da `natureza.js`, mundo 4242). Pasta: `scratchpad/natureza/veg-fotos/node/`:
- `selva-olho.png` — **a selva na altura do olho**: o chão verde aberto, troncos espaçados em grade, uma só camada de
  copas a 8–12 m, o céu no horizonte entre os troncos; um arbusto. É, literalmente, «terreno aberto com árvores espaçadas»
  (205 árvores em 32 × 32 casas: 20% das casas, porque o lugar mistura selva, trilha e borda).
- `selva-alto.png` — a selva de 32 m de altura: um tapete de bolotas e cartões da mesma altura, sem emergentes; manchas de
  chão aparecendo; a borda com a encosta nua.
- `temperado-olho.png` — o bosque temperado: carvalhos, bétulas e pinheiros, o mesmo vão aberto debaixo das copas. **Lado a
  lado com a selva, os dois se leem quase iguais** (a selva só tem árvores maiores).
- `selva-cheia-olho.png` — **o mesmo lugar com uma árvore do mundo em toda casa livre de selva** (a densidade máxima que
  o mundo de hoje permite: uma por casa; +48 árvores no quadrado, 253): mais troncos, e o mesmo chão aberto e o mesmo
  horizonte entre eles. **Encher o mundo de árvores, sozinho, não fecha a mata**: o que fecha é o que fica entre o chão e
  a copa (as camadas da §3.3); a densidade do mundo (etapa 3) é para a selva vivida não cair para 27%, não para o olho.
- `savana-olho.png` — o lugar «de savana» da regra cai numa borda com a selva: capim dourado na frente, árvores largas e
  palmeiras atrás; a savana não tem identidade própria além da cor do chão e da acácia rara (5,6% das casas).

**Achado de prova (T-, para o executor):** a `qa/visual/natureza.js` escolhe o lugar de cada bioma pela nota mais alta
acima de −1; no mundo 4242 de hoje toda casa candidata da selva tem nota abaixo de −1 (o mar e a beira contam contra),
e a vista `b-selva` sai «sem lugar» (conferido em Node pela mesma regra). Para estas fotos a regra foi copiada aceitando a
nota negativa (`scripts/natureza-veg.js`).

**Fotos do jogo, no navegador** (pela fila `qa/navegador.sh`, qualidade Média, com chamadas de desenho e triângulos de
cada vista; `scripts/natureza-veg.js`: a selva no olho, do alto, a temperada, a savana e as mesmas na vista do deus).
A primeira rodada pegou a vaga às 05:26 e **a foto da selva estourou o prazo de 4 min** (o quadro já desenhado; a captura
da tela pelo 3D por software, com a máquina em carga 15–24 em 4 núcleos — não é medida de desempenho, mas mostra o peso
de uma selva por software). Uma segunda rodada, com a janela menor e 10 min por foto, esperou 36 min na fila sem
vaga (sete testes de outros na frente, carga 15–24) e foi retirada para não segurar a fila. **As fotos do jogo ficaram
por tirar**; com a máquina livre, o comando é:
`PLAYWRIGHT=/opt/node22/lib/node_modules/playwright Q=media VW=760 VH=470 bash qa/navegador.sh node
scratchpad/natureza/scripts/natureza-veg.js $PWD SAIDA selva-olho,selva-alto,temperado,savana` (de dentro de
`god-of-the-ant-farm/`; tira também as quatro vistas do deus; o registro `SAIDA/natureza.txt` traz chamadas e triângulos
de cada vista). Os números de triângulos deste relatório vêm do Node (§1.4), que conta a mesma geometria.
