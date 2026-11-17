# Pilar 2 — Geografia e estruturas naturais (relatório do batedor)

> Estudo sobre a árvore em `76e3cae`, sem nenhuma mudança no jogo (nenhum commit). Números medidos em Node (`qa/nodemundo.js`, script em
> `scratchpad/natureza/mede-relevo.js` e os outros de §9), lidos do código, e fotos do 3D pela fila (§7). Concluído.

## 1. O que existe

### 1.1 A escala (a raiz de tudo)
- `js/space.js`: **uma casa = 4 m** (`Sp.TILE`), **uma unidade de altura = 1,5 m** (`Sp.HM`); o mar (`G.SEA = 2`) fica a 3 m.
- Mapas (`js/ui.js` `UI.SIZES`): 64, 80, 96, 128, 160, 192 casas → **256 m a 768 m de lado**. O mundo inteiro do maior
  mapa cabe num círculo de 1 km. Cinco casas da borda são forçadas a mar aberto (`Rf.heights`, «the world ends in open water»).
- A altura é **um número por canto de casa** (`S.H`, `(N+1)²` floats), interpolada bilinearmente (`W.hAt`). Não há
  nada mais fino que 4 m no mundo: o relevo do mundo tem resolução de 4 m na horizontal.
- A altitude «falada» é uma ficção: `Rf.meters(h) = 12u + 5,2u²` (u = unidades acima do mar) — um pico que o 3D desenha a
  56 m é anunciado como «7.560 m»; o maior de um mundo alpino de 192 casas, desenhado a 59 m, «8.460 m».

### 1.2 Medido (semente 4242, 2 povos, clima variado)
| relevo | mapa | pico (3D, acima do mar) | penhasco | encosta > 2,6 u | declive p90 / p99 / máx de uma casa | maior desnível em 12 m | cachoeira maior |
|---|---|---|---|---|---|---|---|
| plano | ilha 80 (320 m) | 13 m | 7,6% | 9,4% | 3,8 / 6,8 / 9,0 m | 12,7 m | — |
| suave | continente 128 (512 m) | 26 m («1.800 m») | 9,1% | 10,8% | 4,0 / 7,1 / 11,4 m | 17,4 m | 4,4 m |
| montanhoso | continente 128 | 41 m («4.270 m») | 15,2% | 16,8% | 5,6 / 11,6 / 24,8 m | 31,6 m | 20 m |
| alpino | continente 128 | 55 m («7.560 m») | 19,0% | 20,5% | 6,5 / 17,5 / 31,1 m | 41,4 m | 16 m |
| alpino | ilha 80 | 50 m | 22,7% | 24,5% | 8,9 / 25,4 / 39,7 m | 45,4 m | 12 m |
| alpino, várias cordilheiras | continente 192 (768 m) | 59 m («8.460 m») | 22,7% | 25,0% | 6,6 / 15,3 / 31,3 m | 38,8 m | 28,7 m |
| montanhoso, falésias, muitos planaltos | continente 160 | 43 m | 22,1% | 24,3% | 6,5 / 11,1 / 24,3 m | 33,1 m | 21,9 m |

(«penhasco» = `S.cliff`, a casa cujos cantos diferem mais de `Rf.CLIFF` = 2,8 u = 4,2 m; ninguém anda nela. «Encosta» = a
casa com mais de 2,6 u = 3,9 m entre o canto mais alto e o mais baixo, que o 3D já pinta de rocha. O declive de uma casa é o
desnível entre os quatro cantos, em metros, sobre 4 m.)

**Leitura:** a maior montanha do jogo é um morro de 40–60 m num mundo de meio quilômetro. Um quinto da terra de um mundo
alpino é penhasco — mas cada penhasco é uma rampa de uma casa só (4 m de largura), desenhada como um quadrilátero esticado.

### 1.3 A geração do relevo — `js/relief.js` (556 linhas), chamado por `G.genWorld` (`js/world.js`)
Ordem (`world.js` ~l. 411–580), tudo com o acaso da geração (`G.mulberry32(seed)` e ruídos `G.makeNoise(seed+k)`):
1. **Forma da terra** (`landShapeFn`: ilha, continente, arquipélago, istmo, mar) → `isl` (0..1).
2. **`Rf.heights`**: colinas fbm (`P.hill`) + **cordilheiras** (uma espinha que serpenteia, gaussiana `exp(-(d/w)²)` com
   largura `max(3,1; N·0,052)` casas, crista quebrada por `1-|fbm|`, 1–2 **passos** que rebaixam a espinha 74%), **planaltos
   e mesas** (topo plano + borda abrupta, `rim` 0,016 ou rampa 0,2), **bacias** (onde os lagos se juntam), e a borda do
   mapa rebaixada ao mar. Presets `RELEVO`: `peak` 9 / 15 / 25 / 36 u (plano/suave/montanhoso/alpino).
3. **`Rf.erode`**: erosão hidráulica por gotas (≈1,3 gotas por canto × `erode`, vida 36 passos, pincel 3×3) — sulcos nas
   encostas e leques no pé.
4. Classificação mar/terra, **vaus** entre ilhas, só a maior massa fica (menos no mapa «mar»).
5. **`Rf.coast`**: **falésias sobre o mar** (+2,6..5,4 u num anel de até 14 casas da água, por ruído; preset `costa`).
6. **`Rf.hydro`**: inundação por prioridade (heap) → para onde a água vai, **lagos** (bacias fundas), acumulação → **rios**,
   **torrentes de montanha**, nível da água por casa (`S.wl`), **degraus em cascata** (onde a descida passa de 0,3 u por
   casa, o nível é quantizado em degraus de `Q` ≈ 2,5–5 m: poços e quedas),
   lista de **cachoeiras** (`rel.falls`, queda > 0,8 u), e **vales**: as margens são cortadas em V até `wl + 0,22 + d·k`.
7. **`Rf.normalize`** (a margem fica na face da água), **`Rf.connect`** (todo planalto ou vale cercado de penhasco ganha uma
   **rampa**, até 6 rodadas — «nenhum povo fica preso»), `Rf.findPeaks`, `Rf.nameAll` (nomes de cordilheiras, picos, passos,
   cachoeiras, lagos).
8. Tipos de chão (`world.js` ~l. 545): `T = {DEEP, SEA, RIVER, SAND, GRASS, MEADOW, ROCKY}` — **só 7 tipos**; ROCKY = encosta
   > `Rf.STEEP` (2,05 u) ou o décimo mais alto da terra (metade de cima das montanhas). Depois `G.Biome.assign` (clima por
   latitude diagonal + altitude, umidade por ruído; 7 biomas: temperado, neve, taiga, pântano, selva, savana, deserto).
9. Vegetação e pedras por bioma (com linha das árvores: 68% da altura máxima), recursos garantidos em volta de cada povo,
   jazidas (`G.Eco.genDeposits`), **cavernas** (`G.Caves.gen`).

Cache derivado: `Rf.cliffs` grava `S.cliff`, `S.slope`, `S.th`, `S.deep` e sobe `S.typeVer` (+ `W.invalidateLand`).

### 1.4 Por onde se anda
- `W.walkable(i)` (`world.js` l. 138): terra que não é penhasco (`S.cliff`), nem bloqueada, nem água funda sem ponte/gelo,
  nem muro. **O penhasco é a única regra de relevo do andar**: a encosta de 3,9 m numa casa se anda; a de 4,3 m, não.
- O custo do caminho (`W.cost`, l. 712): rio 3,2, areia 1,08, rochoso 1,25, vezes `1 + declive × 0,22` (a encosta custa),
  vezes o custo do bioma. Os assentos das cidades (`genWorld`: declive ≤ 1,4 / 2,1 / 3 numa janela de 5 casas), as obras
  (`W.slope`, `V.podiumFits`) e a fauna (`fauna-meio.js`: o morro subido pesa no passo) leem o mesmo relevo — **21 módulos
  leem `S.slope`/`S.cliff`/`W.slope`**.
- O corpo encarnado: `STEP_UP` 0,6 m (`space.js` l. 370; `Avatar.TUNE.stepUp`), a borda só com o pulo (regra 125 do guard),
  e o mapa de regiões (`W.reachIds`) é feito do grafo das casas andáveis — o corpo pisa onde as pessoas pisam.
- As portas dos prédios (`G.Space.entryFits`) e o assento dos prédios (`V.podiumFits`, `V.levelLot` que aplaina até 3 u por
  canto) leem o mesmo `S.H`.

### 1.5 Quem muda o relevo depois da geração
- `powers.js` (o meteoro: cratera −1,5 u e borda +0,45 u), `miracles.js` (erguer terra/ilha), `village.js` `V.levelLot`
  (aterro da obra grande). Todos chamam `Rf.fixArea` / `Rf.cliffs` → `S.typeVer++`. O save guarda `S.H` inteiro.

### 1.6 As cavernas — `js/caves.js` (1.500 linhas)
- **Uma camada 2D debaixo do mundo**, uma célula por casa (`S.ug.k`: rocha, galeria, salão, riacho, lago, boca, escavado,
  poço), com o tipo de pedra pelo bioma (`C.ROCKS`: calcário, gelo, arenito, pedra úmida e musgo, basalto), estalactites,
  colunas, cristais, vagalumes, cogumelos, ossos, fósseis, guano, veios de minério, morcegos, ursos, oráculo, tumbas, pinturas,
  bandidos. Altura das paredes «na vista de baixo»: `C.FLOOR` 2, `C.WALL` 3,2.
- Desenhada **só na vista do deus** (`js/cave-art.js`, 380 linhas: a vista «de baixo», com estratos cortados nas mesmas
  alturas em volta).
- **No 3D só existe a boca** (`js/things3d.js` `caves`, l. 332): meio disco escuro (`MeshBasic` preto) na encosta, com sete
  dodecaedros em volta; os poços e dolinas, um decalque escuro e nove pedras. **O corpo não entra**: `possess.js` l. 58
  recusa encarnar quem está numa caverna («as cavernas em 3D ainda não existem»).
- 2–11 cavernas por mundo (medido): `want = terra/900 × quantidade`, uma por povo a 7–22 casas.

### 1.7 O chão no 3D — `js/realm3d.js` (`terrainGeo`, chunks) e `js/ground3d.js` (o shader)
- **Chunks de 16×16 casas (64×64 m)**. Cada um tem a figura **longe** (feita para o mapa inteiro ao abrir o 3D: grade de
  **2 casas = 8 m**, 8×8 quadrados, **128 triângulos**, baixada 0,3 m; árvores como icosaedro/cone; casas como caixas) e a
  figura **perto** (feita em volta do corpo e jogada fora atrás: grade de **meia casa = 2 m**, 32×32, **2.048 triângulos**
  de chão, com o leito dos rios cavado por `Sp.bedDrop`). O chão é **exatamente** `W.hAt × HM`: o desenho não acrescenta
  relevo nenhum à forma — nem perto. A normal vem das alturas (`normalAt`, contínua entre chunks).
- Anel perto por qualidade (`QUAL.near` = 1/2/4/5 chunks): 9 / 21 / 69 / 97 chunks = **18 mil / 43 mil / 141 mil / 199 mil
  triângulos de chão**, raio ≈ 96 / 160 / 288 / 352 m. Num mapa de 128 casas a Ultra põe o mapa quase inteiro «perto»
  (131 mil triângulos). O mapa inteiro «longe»: 2 mil (64) a 18 mil (192) triângulos. **O chão é barato** perto do
  orçamento da BIBLIA (~310–330 mil triângulos perto do corpo na metrópole, Média) — sobra muito para um chão mais fino.
- O shader (`ground3d.js` `FRAG`, `gStack`): a cor de cada casa é a do deus (`tileCol`) num texel por casa (`DataTexture`
  N×N), misturada entre as quatro casas com borda esfiapada; por cima, as figuras da pilha (`G.TEX3D`, 512 px): capim,
  terra, areia, **`stony`**, **`crag`** (rocha de penhasco: camadas dobradas, juntas, líquen; 5 m de período), neve,
  folhas, lama, seixos… **Onde a encosta é forte** (`steep = 1 − smoothstep(0,55; 0,8; normal.y)`, ≈ acima de 37°) entra
  a `crag` **projetada de lado** (triplanar em X ou Z, nunca esticada) e cinzenta da cor do lugar (`gRockish`); o relevo de
  centímetros vem do alfa das figuras (a luz lê `dFdx(gHgt)`), apagando-se além de 25–75 m. A cor da rocha só muda por
  bioma (`render.js` `rockColor`: granito cinza; arenito vermelho no deserto e na savana; escura na selva; neve agarrada no
  frio) — **um só material de rocha para o mundo inteiro**. Estratos desenhados só no modo sem figuras (`k == 16`: um seno
  em Y).
- As **pedras** (`S.rocks`, recurso de pedra do mundo, onde o corpo pisa — `G.Space.stones`) são **dois dodecaedros**
  (12 faces), cor por bioma, musgo ou neve no topo, cinco lascas em volta e um anel de capim perto.
- A neve: camada do shader, pelo frio (`snowAt`), pela altitude e pela encosta (some na face íngreme).
- **Árvores nunca em penhasco**; linha das árvores a 68% da altura máxima (só se o pico passa de 12 u ≈ 18 m).

### 1.8 Além da borda do mapa
- `realm3d.js` `makeOcean`: **um anel de água ao nível do mar de 1.400 m** em volta do mapa (a mesma água, marca
  `aShore = −1`, ondas longas). Mais nada: nenhuma terra, ilha, serra ou nuvem baixa além da borda.
- O céu (`skyMesh`, esfera de 1.400 m escalada para dentro do `camera.far`): **abaixo do horizonte, a cor da névoa**
  («the far haze over the sea, a little darker downward»). Estrelas, nuvens numa camada só (ruído 2D projetado), disco do
  sol e da lua.
- A névoa (`gxAir`, aplicada antes da curva de tom em todo material): `A.x = 1,25 / view` → o `camera.far = 3 / A.x =
  2,4 × view` (500 a 1.600 m): **Leve 200 m de vista, Média 360, Alta 640, Ultra 900**; a névoa já come ~80% na distância
  da vista. Névoa baixa sobre a água e nos vales (`gxAir.y/z`), mais densa de madrugada. Na Média, um mapa de 512 m mal se
  vê de ponta a ponta.
- Quem olha da praia para fora vê: mar → névoa → céu. **Não há horizonte de montanhas.**

### 1.9 A vista do deus — `js/render.js`
- Projeção isométrica (`proj`): uma casa = 32×16 px, uma unidade de altura = **4 px** (`R.HS`); o 3D, na descida, achata
  a cena para 0,62 da altura (`R3.setDepth`, `modes.js`) para casar com ela. Um pico de 37 u sobe 148 px na tela.
- Cada casa é um quadrilátero com luz pelo gradiente (`light = 1 + vx·0,13 + vy·0,045`); a casa íngreme (> `STEEP`) vira
  `rockColor` com **estratos**: linhas de contorno a cada 1,15 u (`strata`), escura e clara, e duas pedras soltas ao pé;
  a encosta acima de 0,9 u acastanha o capim. Os rios que descem têm degraus e cachoeiras de frente (`waterSteps`). A base
  do diorama: solo em degradê com duas linhas de estrato e a coluna d'água (`drawBase`). As cavernas: a vista de baixo
  (`cave-art.js`, `R.under`).

### 1.10 Custo da geração (medido em Node, máquina ocupada)
Mundo novo inteiro: 1,8 s (continente 128 alpino) a 2,6 s (192). O relevo é uma parte pequena: `heights` 83–373 ms,
`erode` 41–212, `hydro` 45–141, `connect` 50–102, `coast` 12–28, `normalize` 11–47 → **0,27 s a 0,8 s**. Há folga para
uma erosão bem mais rica (mais gotas, erosão térmica, estratos) sem o jogador sentir.

## 2. Os limites diante do pedido

1. **A escala vertical.** A maior montanha que o jogo faz tem **40–60 m** — pouco mais que o dobro do Coliseu do próprio
   jogo (40 m de lote, 26 m de altura; o de 13 casas, 30 m; o Templo Mayor, 35 m; medido pelo `G.Forma`) — num mundo de
   256–768 m. O presets `peak` (9/15/25/36 u) e a largura das cordilheiras (`w ≈ N·0,052` ≈ 26–40 m de
   sigma) fazem cristas estreitas e baixas. A altitude em milhares de metros é só texto (`Rf.meters`). Do chão, um pico de
   55 m a 100 m de distância ocupa ~29° da vista (metade do quadro) — não é pouco; a 300 m, 10°. O que falta não é só
   altura: é **forma** e **leitura de escala**.
2. **A forma é a de um campo de alturas de 4 m.** Um número por canto de casa, interpolado: nada mais fino que 4 m, nada
   que se debruce sobre si (nenhum **arco, saliência, gruta, chaminé, ponte natural**), nenhuma crista mais aguda que uma
   casa. As cordilheiras são gaussianas com ruído (`1−|fbm|` na crista) — lombos arredondados; não há agulhas, circos,
   arestas, vales em U.
3. **O penhasco é uma rampa esticada.** 15–23% da terra dos mundos montanhosos é `S.cliff`, e cada casa de penhasco (até
   31 m de queda em 4 m) é desenhada como o mesmo quadrilátero liso da grama, com a `crag` projetada de lado. Não há
   paredão, cornija, estrato saliente, tálus no pé, coluna de basalto. **E ninguém anda numa casa de penhasco** — é o lugar
   onde o desenho poderia fazer o que quisesse e hoje não faz nada.
4. **Uma rocha só.** Uma figura `crag` (5 m de período) para todo penhasco do mundo, tingida por bioma (cinza / vermelho /
   escuro). Não há geologia: nem tipo de rocha por região, nem estratos que continuem de um paredão ao outro (o que faz um
   cânion parecer cânion), nem dobra, nem mergulho das camadas. O deus desenha estratos como linhas de contorno a cada
   1,15 u, iguais em todo lugar.
5. **Não existe cânion nem geleira.** O `hydro` corta vales em V ao longo dos rios (margem até `wl + 0,22 + d·k`) — não
   há rio encaixado entre paredes num planalto. Não há gelo de geleira, morena, circo; só a neve do shader pelo frio.
6. **As falésias são baixas e uniformes**: `Rf.coast` ergue 2,6–5,4 u (4–8 m) num anel por ruído; não há promontório e
   enseada alternados, pilar no mar (*stack*), arco marinho, plataforma de abrasão. A praia é a casa de areia de declive < 1
   a até 2 casas do mar.
7. **As formações rochosas não existem.** As «pedras» são o recurso de pedra do mundo (`S.rocks`, dois dodecaedros, onde o
   corpo pisa). Não há mesa isolada pequena, torre, *hoodoo*, *tor*, inselbergue, carste em torres, bloco errático,
   rocha equilibrada.
8. **As cavernas não existem em 3D.** Só a boca (meio disco preto) — e o corpo não entra. O «arco da caverna emoldurando a
   cordilheira» da referência é impossível hoje por duas razões: não há gruta 3D e não há cordilheira no horizonte.
9. **Além da borda, nada.** Um anel de água a 1.400 m e a névoa. Todo mapa é uma ilha (5 casas de mar forçadas na borda);
   não há terra no horizonte, nem serra ao fundo do vale (a foto `ref-ceu`).
10. **A luz não mostra o relevo de longe.** A sombra do sol cobre só 36–68 m em volta do corpo (`QUAL.sbox`): uma montanha
    não faz sombra no vale ao entardecer; não há oclusão do céu nos vales (o `shadeAt` escurece só a concavidade, perto).
    A névoa da Média come 80% a 360 m — num mundo de 512 m, a montanha do outro lado já é névoa.
11. **A figura longe é grossa**: grade de 8 m, baixada 0,3 m. Uma crista de 4 m some de longe; a silhueta das montanhas —
    o que mais se vê delas — é a parte mais pobre.
12. **O que as fotos mostram a mais** (§7): a borda da neve e do capim segue a grade das casas em **degraus serrilhados**
    junto da água e nas encostas (a cor e o tipo são um texel por casa); a rocha **estica e borra** onde a face olha na
    diagonal (a projeção de lado só escolhe entre X e Z); pontinhos pretos na borda da neve sobre a rocha; e a escala é
    medida pelos pinheiros de 10 m ao lado — o pico de 56 m é «cinco pinheiros».

**O que a escala permite.** Num mundo de 512–768 m não cabe uma montanha de 2.000 m, mas cabem: paredões de 60–150 m
(o Pão de Açúcar tem 396 m; um paredão de 120 m ao lado de uma pessoa de 1,75 m é esmagador), cânions de 30–60 m,
falésias de 20–40 m, torres de 15–30 m — **se o mundo der lugar a eles**: mais altura gasta terra (mais penhasco, menos
chão para cidade). E cabe, fora do mapa, **qualquer altura**: a serra do horizonte não gasta chão nenhum.

**Quem pisa num penhasco hoje** (o que a escultura das faces tem de respeitar): nenhuma pessoa (`W.walkable`), nenhuma
árvore (`genWorld`, `canGrow`), nenhum prédio — mas **os bichos que escalam** (`sp.climb: true`: a cabra-montesa, o
leopardo-das-neves, o leopardo — `animals.js` l. 408) e **os ninhos de penhasco** (águia, gaivota — `nests.js` l. 42) ficam
em casas de penhasco, na altura `W.hAt`. E o rio nunca é penhasco (`Rf.cliffs` só marca terra), e **o 3D não desenha
cachoeira nenhuma** hoje (a água de cada casa é um quadrado plano no seu `wl`; a queda é um degrau entre dois quadrados —
é do pilar da água, mas a parede atrás dela é deste).

## 3. A proposta de arquitetura

### 3.1 A regra: duas camadas e uma ponte
- **O mundo** (`relief.js`, `world.js`) decide onde há terra, a altura de cada canto, quem é penhasco, rio, por onde se anda.
  Mudança aqui é mudança de mundo: protocolo inteiro, mundos prontos gerados de novo, linha de base explicada.
- **O desenho** (o 3D e o deus) só inventa forma **onde ninguém do mundo pisa a altura**: dentro das casas de penhasco, debaixo
  da água funda e **fora do mapa**. Nas casas andáveis o chão desenhado é o do mundo ao centímetro (os pés de todos estão
  nele: `Sp.floorY`, `Sp.footAt`). O precedente já existe: `Sp.bedDrop` — o leito que o 3D cava nos rios e que o chão, o
  corpo e os pés de todo desenhado leem da mesma função pura. A escultura dos penhascos é o mesmo molde: **uma função pura do
  Space** (`Sp.cliffAt(x, y)`, zero na borda com toda casa andável), lida pelo chão, pelos pés dos escaladores e pelos ninhos.
- **A ponte: `G.Geo`** (`js/geo.js`, novo, **puro**: sem acaso do mundo, só a semente por ruído puro e `G.hash`): o tipo de
  rocha de cada lugar e as **camadas** — a altura de cada estrato, a espessura, o mergulho, a dobra, a cor. Lido pelo shader
  do 3D, pelo deus (os estratos coloridos nas mesmas alturas), pelas cavernas (`C.rockOf` passa a perguntar a ele) e, se o
  dono quiser, pela mina (que rocha dá que pedra). Uma camada vista num paredão continua no paredão do outro lado do cânion —
  é isso que faz o olho acreditar.

### 3.2 Só de se ver (sem mudar o mundo; vale para todo save antigo e todo mundo pronto)
Por ordem de valor sobre custo:

| | O quê | Como | Custo | Risco |
|---|---|---|---|---|
| **V1** | **Geologia nas faces** | o shader do chão troca a `crag` única por rochas por tipo (`G.Geo`): estratos em Y do mundo (contínuos entre paredões), mergulho perto das cordilheiras, colunas no basalto, juntas no granito, bandas creme/vermelhas no arenito, calcário claro com caneluras; a projeção de lado de verdade (as projeções misturadas pelo peso da normal, sem o borrão da diagonal das fotos); a borda entre casas de tipos diferentes sem o degrau da grade nas encostas; o relevo de centímetros pela altura da figura (já existe); 4–6 figuras novas na pilha (`arte/mat_natureza.py`: arenito em camadas, calcário, basalto, granito, gelo azul, tálus) | baixo: shader + pilha (~1 MiB a mais dos 6 MiB); zero triângulo | nenhum para o mundo; a pilha e o tempo de decodificar |
| **V2** | **A figura longe que mostra a serra** | grade de 4 m (não 8) nos chunks de relevo forte (declive máximo > 2 u), sem baixar 0,3 m onde a crista é a silhueta; a normal pelas alturas de 4 m | 512 triângulos por chunk áspero; o mapa de 192 inteiro ≤ 74 mil | nenhum |
| **V3** | **Sombra do relevo** | um mapa de horizonte do campo de alturas (N×N texels, refeito quando o sol anda ~2°, em fatias por quadro, ou na placa): a montanha faz sombra no vale ao entardecer, o vale tem menos céu; lido pelo chão, pelas árvores longe, pela água. **O dono é o pilar do céu** (`ceu.md`: `G.Ceu.shade()`, medido 10 ms no N=192); o relevo só entrega o `S.H` — e a figura longe (V2) tem de casar com a sombra | baixo | nenhum |
| **V4** | **A escultura dos penhascos** | `Sp.cliffAt`: nas casas de penhasco, os estratos do `G.Geo` viram **bancadas e espelhos** (a altura em degraus: patamar raso, espelho quase vertical), a crista arredondada ou em cornija, o tálus no pé — sempre zero na borda com casa andável; malha fina **só** nas casas de penhasco perto (0,5 m; 0,25 m na Ultra a 60 m); os escaladores, os ninhos e as bocas de caverna perguntam a mesma função | 50–150 mil triângulos no mundo alpino de 128 inteiro perto (1.199 casas de penhasco); ~15 mil por chunk perto de serra | médio: os pés dos escaladores (a pose contra o chão: `bichos-pose`), a câmera, a água ao pé; **fora do `Sp.footAt`** (o mundo o lê para o pé das escadas das portas, L-325) — ou com prova de que nenhuma porta tem pé em casa de penhasco. Malha que segue a face (linhas por altura) nas faces altas: na grade de 0,5 m em XZ, a face mediana (6,5 m em 4 m) tem linhas a cada 0,8 m de altura, mas a do p99 (≈ 20 m), a cada 2,5 m |
| **V5** | **Kits de rocha** (peças instanciadas) | blocos, lajes, colunas de basalto, cornijas, pilares, por tipo de rocha (malhas feitas como as da fauna: `arte/rocha.py` → `js/rockmesh.js`), presas na face dentro da coluna da casa de penhasco, e acima de 2,5 m sobre qualquer casa andável vizinha — a cornija que se debruça, o paredão em blocos; escolha e giro pelo `G.hash` da casa | 1–3 chamadas de desenho por tipo (instâncias); ~300 triângulos por peça perto, 12 longe | médio: nada pode entrar no ar onde se anda; a câmera pergunta `solid` |
| **V6** | **O horizonte** | fora do mapa, uma serra de verdade: 2–3 anéis de silhueta (300–1.500 m de altura, a 2–8 km), neve no alto, a névoa própria (azul que vai sumindo), a luz do sol de lado; desenhada **antes** da cena, com câmera própria (o `far` do jogo continua), feita da semente por ruído puro | 3–10 mil triângulos, 1–3 chamadas | **decisão de projeto** (ver abaixo); casa com o céu |
| **V7** | **A boca de caverna escavada** | a garganta entrando no morro (só abaixo da superfície, atrás da boca), o escuro em degradê, o lábio de rocha pelo kit; o paredão e o abrigo com forma | pequeno | baixo |
| **V8** | **As pedras-recurso** | malhas melhores para `S.rocks`, com `G.Space.stones` (o que o pé pisa) trocado junto | pequeno | o corpo pisa nelas: `movimento`, `corpo-mundo` |

**O tamanho das faces (medido, `mede-penhascos.js`):** os penhascos vêm em 58–128 trechos por mundo, quase todos **faixas
de uma casa de largura**: 71–82% das casas de penhasco tocam casa andável; a queda por casa tem mediana de 6,3–6,8 m,
p90 10–12 m, p99 18–22 m. Então a escultura (V4) trabalha numa face de 6–12 m de altura e 4 m de fundo, presa embaixo e
em cima pela casa andável — 2 a 4 estratos por face; e os kits (V5) cobrem faixas longas e finas. Hoje há 6 bichos
parados em casa de penhasco num mundo novo (os escaladores).

**O que não fazer.** (1) **Exagerar a altura no desenho**: `scene.scale.y` estica as pessoas e as casas (é como a descida
casa com o deus, 0,62); trocar `Sp.HM` é mudar o metro do mundo — as portas (`Sp.entryFits`), o pódio (`V.podiumFits`, 3 m),
as escadas das plantas, o aterro (`V.levelLot`) leem metros: é mudança de mundo disfarçada, e o deus tem a própria escala
(`R.HS`). (2) **Alisar o chão andável no desenho** (bicúbico, ruído de detalhe): os pés ficam no `W.hAt` bilinear e passam a
flutuar ou afundar. (3) **Pôr enfeite de relevo onde se anda** (seixos altos, lajes soltas em encosta andável): o corpo não
colide com enfeite (a regra do quintal): só figura no shader, ou coisa fina rente ao chão.

**A decisão do horizonte (V6).** Todo mapa é uma ilha, e as expedições que passam da borda voltam com «Mar vazio — nada no
horizonte» (`expeditions.js`). Uma serra além do mar contradiz isso. Três saídas, para o dono e o coordenador: (a) a serra
só no **mapa novo de borda de serra** (W3 abaixo), onde ela é a continuação do mundo; (b) a serra «inalcançável» com uma
linha na lore (as expedições a avistam, nunca a alcançam — «a terra que foge»); (c) só a ilha (horizonte de mar, com
nuvens e luz melhores — o pilar do céu).

### 3.3 Do mundo (a geração) — três degraus
Tudo novo com o **seu próprio fio de acaso** (`G.mulberry32(seed ^ K)`, `G.makeNoise(seed + K)`, como `nameAll` e
`Caves.gen` já fazem): acrescentar sorteios ao `rng` principal desloca a escolha dos povos e das árvores de todo mundo.

**W1 — a forma, na mesma escala** (o maior ganho de mundo pelo menor risco):
- **Cordilheiras de crista viva**: ruído *ridged* multifractal ao longo da espinha (agulhas, colos, arestas), vários picos
  em vez de um lombo, flancos assimétricos (um lado em paredão, o outro em rampa — já há `asym`).
- **Estratos no relevo** (*terraces*): nos planaltos, mesas e montes sedimentares (`G.Geo` diz onde), a altura em
  bancadas: **faixas de penhasco** (inandáveis) separadas por **patamares andáveis** — o relevo de degraus do deserto e
  do cânion. As rampas do `Rf.connect` ligam os patamares (ele já faz isso por planalto).
- **Cânions**: onde um rio corta um planalto de rocha em camadas, o vale vira garganta — paredes de penhasco de 20–60 m,
  degraus pelos estratos, o rio no fundo (o `hydro` já sabe a acumulação: a profundidade cresce com ela). Não há ponte
  alta no mundo (o tabuleiro fica a 12 cm sobre a água, D-190): a travessia é pelo fundo, por rampa — o `connect` cuida.
- **Erosão melhor**: mais gotas e de vários tamanhos (vales de verdade, leques no pé), e **erosão térmica** (o tálus: a
  encosta de entulho no ângulo de repouso de cada rocha; o arenito duro fica em paredão com chapéu — a mesa).
- **Litoral**: **promontórios e enseadas** alternados pela dureza da rocha (falésia no duro, praia no mole), falésias de
  10–30 m nos promontórios, **pilares no mar** (*stacks*: uma casa de terra de penhasco na água rasa — o «fica só a maior
  massa de terra» precisa deixá-los), plataforma de abrasão; praias de tamanho variado, com dunas no seco.
- **Formações** (cada uma queimada no `S.H` — como a altura é por canto, um canto alto faz das 2×2 casas que o tocam a sua
  face (8 m de pé) e os quatro cantos de uma casa, das 3×3 em volta (12 m) — inandáveis por construção; a forma fina dela é do desenho (V4/V5) — e listada em
  `S.relief.forms`, com nome, para o livro do deus e as histórias): torres e *hoodoos* no deserto, inselbergues na savana,
  carste em torres na selva (as torres de Guilin), *tors* e blocos erráticos na taiga e na tundra, colunas de basalto nos
  picos, mesas pequenas (*buttes*). O 3D dá a cada uma a sua forma pelos kits (V5).
- **Geleiras**: no alpino frio, os vales altos em **U**, **circos** sob os picos (a erosão glacial na geração), e a
  geleira como camada do mundo (`S.gelo`, como `S.ice`: andável devagar, sem árvore nem campo, a nascente do rio na língua
  dela — o `hydro` começa as torrentes ali). No 3D, o gelo azul com fendas e a morena (V1/V5); no deus, a língua branca.
- **A escarpa e a queda alta** (o pedido do pilar da água, `agua.md` §3.2.2): hoje toda cachoeira grande é uma escada de
  torrente de 4 m (o passo `Q` do `hydro` quantiza a descida em degraus de 2,5–5 m), num poço raso, só nos biomas frios.
  A geologia dá a forma certa: **rocha dura sobre rocha mole** (o chapéu de arenito ou basalto de um planalto, `G.Geo`) faz
  a borda em paredão; o rio de vazão grande que a cruza cai **num salto só** (o `Q` não quantiza aquela queda) e cava ao pé um
  **poço fundo e largo** (um lago pequeno, `S.deep`), com o paredão recuando em anfiteatro (a foto `ref-cachoeira`). Também
  nos biomas quentes (planaltos na selva). A parede atrás da queda (basalto molhado, musgo) é a escultura V4 com a rocha
  do lugar; a lâmina, a espuma e a névoa são da água e do céu.
- **Dunas**: hoje são só ondulações do shader (`k == 3`). Dunas de verdade (2–6 m, 20–40 m entre cristas, barcanas ou
  cordões pelo vento dominante da semente) são altura de casa andável — portanto do mundo: no deserto, o `S.H` da areia em
  ondas (andável e lenta), o 3D com as ripas por cima (já existem).
- **Vales**: planícies de aluvião nos rios grandes (largas e baixas: onde as cidades querem estar), terraços fluviais.

**W2 — a escala** (o que mais muda o jogo): uma opção «Colossal» de relevo (ou a escala do `peak` crescendo com o mapa):
picos de **70–100 u (105–150 m)** nos mapas de 128 para cima, maciços largos (`w` ≈ N·0,09), paredões de 60–120 m. O
preço: mais penhasco (mais de 30% da terra), menos chão para cidade (os assentos já descem para «chão mais áspero» quando
falta vale), mais passos e rampas, a névoa e o `far` da Média curtos demais, o deus com picos de 400–600 px que escondem as
cidades atrás deles (`R.maxH`, o recorte dos chunks do deus). Só depois de W1 provado.

**W3 — a serra na borda** (uma opção de mapa: «costa de serra» ou «vale entre montanhas»): um ou dois lados do mapa não
acabam no mar, acabam numa muralha de montanha — as últimas casas do mundo em penhasco e rocha (inandáveis, sem gastar
chão útil) e, **além da borda, a serra continuando só no desenho**, de qualquer altura (V6 sem a contradição da lore). O
`Rf.heights` deixa de forçar mar nesse lado; o `hydro` continua escoando para o mar dos outros lados; os navios, a pesca e
as rotas não chegam a esse lado; o deus desenha a muralha na borda do diorama. É a resposta mais forte a «cordilheiras
imponentes» que a escala do mapa permite: a cordilheira fica onde ninguém precisa morar.

### 3.4 A geração convincente (a receita)
- **Geologia primeiro** (`G.Geo`, determinística): mapa de rocha — granito no núcleo das cordilheiras, xisto/ardósia nos
  flancos frios, arenito e calcário em camadas nos planaltos, nas mesas e no seco, calcário de carste no úmido quente,
  basalto nos picos altos (já é a regra das cavernas) — com fronteiras por ruído deformado (*domain warp*), nunca em
  grade. Cada rocha diz a sua dureza (quanto a erosão a come), o ângulo do tálus, a espessura dos estratos, a cor (dentro
  das faixas da BIBLIA: pedra quase sem cor, S 8–20; o arenito pode ir mais quente).
- **Depois o relevo** pela rocha: o duro fica em paredão e chapéu, o mole vira encosta e vale; o rio desce pelo mole.
- **Depois a água** (o `hydro` de hoje) e só então o **acabamento** (tálus, praias, dunas).
- **Diversidade**: os parâmetros por cordilheira e por semente (mergulho, espessura, paleta), as formações por bioma, a
  variação por casa pelo `G.hash` — e uma prova que conta (ver §6) quantas formas e rochas diferentes um mundo tem.

### 3.5 Níveis de detalhe e orçamento por qualidade
| | Leve | Média | Alta | Ultra |
|---|---|---|---|---|
| V1 geologia (shader) | cor por rocha, sem relevo de figura | figuras, relevo até 25 m | + mergulho e dobra | + paralaxe nas faces perto |
| V2 longe | 8 m | 4 m nos chunks ásperos | 4 m | 4 m, 2 m nas cristas |
| V3 sombra do relevo (do céu) | — | 128² (mapa de 128) | N² | 2N² |
| V4 escultura | — | 1 m, até 100 m | 0,5 m, até 200 m | 0,25 m a 60 m, 0,5 m até 300 m |
| V5 kits | — | peças grandes até 120 m | todas até 250 m | todas, figura longe das grandes |
| V6 horizonte | 1 anel liso | 1 anel | 2 anéis | 3 anéis, neve com brilho |
| Triângulos a mais (alpino 128) | 0 | ~40 mil | ~150 mil | ~300 mil |

(A BIBLIA mede ~310–330 mil triângulos perto do corpo na metrópole na Média; o chão hoje é 43 mil disso. O alvo é o PC:
a Alta e a Ultra podem gastar; a Leve não pode custar mais que hoje.)

### 3.6 As cavernas no 3D — em duas fases
1. **Só de se ver (V7)**: a boca como garganta de verdade, o escuro que entra no morro, a forma por tipo (paredão, abrigo,
   fenda, poço, dolina), morcegos saindo ao entardecer (já é do mundo). Nada muda para o corpo.
2. **O corpo entra** (mundo + corpo): a camada de baixo já existe (`S.ug`: as galerias, salões, riachos, lagos, o que há no
   chão, as pinturas, as tumbas). O 3D faz dela um **interior**: o contorno das células andáveis (`C.walk`) por *marching
   squares* alisado, paredes deslocadas pela rocha do lugar (`G.Geo`), teto em abóbada com estalactites, o chão a uma
   profundidade que desce das bocas, o lago negro, o riacho (com o pilar da água), as coisas do chão (`C.FT`) em 3D, a luz
   só da tocha (o `FX3D` já pinta luzes). O corpo: o `possess.js` deixa de recusar (`v.ug`), o `Space.surface` responde por
   baixo, a boca é uma porta (como a do prédio), a câmera fica nas galerias (como fica nos cômodos), a superfície some ou é
   cortada. É um sistema grande (do tamanho dos interiores), com o protocolo inteiro: cenário de entrar, salvar dentro,
   morrer dentro, o deus mexendo (o meteoro, a mina que cava `DUG`), os bichos que dormem lá dentro.
   A foto `ref-relevo` (o arco da gruta emoldurando a serra) só existe com as duas coisas: esta fase e o horizonte (V6/W3).

### 3.7 A vista do deus
- Os estratos pelo `G.Geo`: faixas de cor nas mesmas alturas que o 3D desenha, não mais linhas de contorno iguais em todo
  lugar (a regra da fidelidade deus × 3D, como a do `qa/visual/fidelidade.js` para os prédios).
- A sombra do relevo (V3) na luz do deus ao amanhecer e ao entardecer; a neve e a geleira; o tálus no pé das faces; as
  formações com desenho próprio; as falésias e os pilares no mar.
- Com W2 (picos altos), uma decisão de leitura: o deus esconde cidades atrás das montanhas — ou o deus achata o que passa
  de uma altura (uma curva na `proj`, monotônica, só do desenho) ou a montanha na frente do cursor fica translúcida.
- Com W3, a muralha na borda do diorama (só os lados de trás na vista atual) e a serra além, pintada como fundo.

## 4. Os riscos

- **Determinismo.**
  - A geração é toda do `G.mulberry32(seed)` em sequência: um sorteio a mais no `Rf.heights` desloca os povos, as árvores e
    as cavernas de todo mundo. Cada coisa nova do relevo tira de **um fio próprio** (`seed ^ K`), e a ordem dos passos fica fixa.
  - O que só se vê (`G.Geo`, a escultura, os kits, o horizonte) é **puro**: ruído da semente e `G.hash`, nunca `G.R`
    nem `Math.random` (o guard cobra); nos shaders, nada de `fract(sin(...))` que dependa da placa para decidir forma
    (só para o grão). A forma desenhada de um penhasco é a mesma em toda máquina e em todo load (o `sig` dos chunks já
    leva `S.H` e `S.cliff`).
  - Ordenar listas novas (formações, estratos) sem `sort` com comparador que sorteia (regra 39).
- **Por onde se anda.**
  - Toda casa que vira penhasco (estratos, cânions, formações, falésias) sai do grafo: o `Rf.connect` tem de continuar
    ligando tudo (hoje até 6 rodadas, só ilhas ≥ 10 casas: pode deixar um patamar de estrato de 9 casas preso — **com
    estratos isso fica comum**: a regra precisa olhar patamar por patamar).
  - O mapa de regiões (`W.reachIds`) vem disso: nada a mudar, mas a geração precisa terminar com `Rf.cliffs` e o
    `typeVer` certo.
  - No desenho, nada pode entrar no ar das casas andáveis abaixo de ~2,5 m (o corpo não colide com enfeite; a câmera
    pergunta `solid`).
  - Os **escaladores e os ninhos** pisam casa de penhasco: a escultura tem de dar a eles a mesma superfície.
  - **As portas**: o `Sp.entryFits` exige chão a um passo e degraus que os pés sobem — mais relevo, menos lote com porta:
    a prova de portas (`portas-casos`, `soleira`, `pe-da-escada`) e os mundos prontos.
- **As cidades.** Os assentos (`genWorld`: declive ≤ 1,4 → 2,1 → 3), `V.findSite`, `V.podiumFits`, `V.levelLot`, o campo
  guardado (`V.reservas`) e as obras grandes de 6–13 casas querem chão plano: mais relevo é menos cidade. Os estratos são
  a saída honesta (patamares planos); W2 sem patamares pode deixar um povo sem lugar para a maravilha. A prova é o
  `oficio-eco` / `degraus` / os dez mundos de 40 anos com o relevo novo, comparados com os de hoje (gente, comida, obras).
- **Os bichos.** O `fauna-meio.js` lê o morro (o passo, a vigia no morro, o refúgio na rocha), as tocas, as cavernas; o
  equilíbrio da fauna (`qa/fauna.js` f2) depende do chão pastável — mais rocha e penhasco, menos capim.
- **O deus.** Picos maiores escondem o que está atrás (`R.maxH`, o recorte dos chunks do deus, `RS = 2` de cache); os
  milagres e o meteoro (`powers.js`, `miracles.js`) num estrato ou numa formação passam pelo `Rf.fixArea` — que precisa
  continuar a chamar `Rf.cliffs` e o 3D precisa refazer a escultura (o `sig` dos chunks pega `S.H`).
- **Mundos prontos e saves.** Toda mudança de geração (W1–W3) muda **todo** mundo de toda semente: os mundos prontos
  (`worlds/*.js`, gerados pelo salto do jogo por `qa/prontos.js` — horas) e a `linha-de-base.txt` (as fases mar, guerra,
  vida…) mudam; cada `NOVO:` explicado. Os saves antigos guardam o `S.H` inteiro (`save.js` l. 95, centésimos) e
  continuam com o relevo deles — o que só se vê (V1–V8) vale para eles também. Campo novo do mundo (`S.relief.forms`,
  `S.gelo`) entra no `save.js` e é opcional no load (`qa/oldsave.js`, `qa/corrupt.js`).
- **Desempenho.**
  - O chão é barato hoje (2.048 triângulos por chunk perto); a escultura e os kits podem triplicar isso perto da serra:
    LOD por qualidade (§3.5) e a medida da fase `perf` com a máquina livre.
  - A geração ganha tempo com erosão melhor (hoje 0,3–0,8 s de relevo num mundo de 2 s): manter < +1 s no 192.
  - A pilha de figuras tem teto (6 MiB, ~200 KB por material).
  - O horizonte não pode custar na Leve.
  - Refazer a escultura num chunk quando um meteoro cai é refazer só a parte «ground».
- **A leitura do deus × 3D** (a fidelidade): a mesma rocha, as mesmas faixas nos dois — senão o dono vê dois mundos.

## 5. Os arquivos de um executor deste pilar, e onde ele topa com os outros

**Os dele:**
- `js/relief.js` — mundo: as cordilheiras de crista viva, os estratos, os cânions, a erosão térmica, o litoral, a escarpa
  e a queda alta, as dunas, as formações, as geleiras, a borda de serra. Talvez `js/relief-forms.js` (as formações e os
  nomes delas) para não inchar o arquivo.
- `js/world.js` — os tipos de chão e a ordem da geração (`genWorld`), a guarda da maior massa de terra (os pilares no mar).
- `js/geo.js` — **novo, puro**: a geologia (rocha por lugar, estratos, cores). Entra na lista do guard como puro.
- `js/cliff3d.js` — **novo, só se vê**: a escultura das casas de penhasco (V4) e os kits (V5), por chunk, com LOD; chamado
  da parte «ground» do `realm3d.js` (`makePart`) e da figura longe. `js/rockmesh.js` + `arte/rocha.py` (as malhas das
  peças de rocha, como a `arte/fauna.py` faz os bichos).
- `js/horizon3d.js` — **novo, só se vê**: a serra além da borda (V6), com o passo de desenho próprio.
- `js/space.js` — a função pura `Sp.cliffAt` (como a `Sp.bedDrop`), fora do `footAt` do mundo.
- `js/ground3d.js` — a geologia no shader, o gelo, o tálus, a rocha por tipo (a seção «materiais» é do A1).
- `arte/mat_natureza.py` → `js/tex3d.js` (gerado) — as rochas novas.
- `js/things3d.js` — a boca de caverna escavada (V7); depois `js/cave3d.js` (a fase 2 das cavernas) e o que ela pede ao
  `possess.js`, `avatar.js`, `space.js`, `cam3d.js`, `modes.js`.
- `js/render.js` (a parte do relevo: `rockColor`, `strata`, a luz das casas) e `js/cave-art.js` — a vista do deus.
- `js/caves.js` — só `C.rockOf` passando a perguntar ao `G.Geo`.

**As fronteiras:**
- **Vegetação** (`vegetacao.md`): onde as árvores podem estar (`world.js` — a linha das árvores, os penhascos,
  `canGrow`), a flora nas encostas e nas faces (a selva cobre o paredão de verde na `ref-cachoeira`: a escultura exporta
  **patamares** onde a vegetação pode pôr plantas, e o musgo nas rochas lê o `G.Mata` dela). **As pedras e as formações são
  deste pilar** (o batedor da vegetação concorda: hoje estão no `floraGeo`, na parte das plantas do chunk). O chão da mata
  e o capim (`ground3d.js` / `grass3d.js`) são dela; a rocha, deste.
- **Água** (`agua.md`): o `Rf.hydro` está dentro do `relief.js` — **o relevo é dono da forma** (os vales, as margens, a
  escarpa, o poço, o cânion, a queda alta) e a água do desenho (a lâmina, a espuma, a correnteza, a cor, o `waterGeo`, o
  `bedDrop`, o `flowTick`). Interface: `S.wl`, `S.type`, `S.deep`, `S.relief.falls`. O litoral: o relevo faz a falésia e a
  praia; a água faz a onda, a espuma e a maré no shader do chão (o trecho da praia do `ground3d.js` é dividido).
- **Céu** (`ceu.md`): a sombra dos montes (`G.Ceu.shade`, do `S.H`), a neblina dos vales (do `S.H`), a perspectiva aérea
  e a névoa (`gxAir`) — que precisam deixar ver o horizonte (V6) e as cordilheiras de longe: o horizonte desenha **antes** da
  cena com a névoa do céu na sua distância; a exposição pelo lugar dentro da caverna e debaixo do arco (o céu é dono).
  O `realm3d.js` (o `light()`, o `GX`, o domo) é do céu; os chunks (`terrainGeo`, `buildFar`, `makePart`) são do relevo.

## 6. As provas que o pilar precisaria

**Invariantes (`qa/relevo-inv.js`, juntadas pelo `qa/junta-inv.js`):**
- S1: todo patamar andável de ≥ 10 casas alcança a maior região da sua massa de terra (o `Rf.connect` cumpriu).
- S1: toda formação de `S.relief.forms` é casa de penhasco e tem chão andável em volta; nenhum pilar no mar some; o topo
  plano de uma torre (casa andável presa entre penhascos, menor que as 10 casas do `connect`) não recebe pessoa, prédio,
  árvore de chão nem bicho que não escala.
- S2: o desenho bate com o mundo — nas casas andáveis, o chão desenhado é o `W.hAt` (+ `bedDrop`) ao centímetro; nas casas de
  penhasco, `Sp.cliffAt` é zero em toda borda com casa andável; nenhuma peça de rocha a menos de 2,5 m sobre casa andável
  vizinha; nenhuma peça flutuando nem atravessando a face.
- S2: escaladores e ninhos sobre a superfície esculpida (a mesma do desenho).
- S3: o `G.Geo` dá a mesma rocha e as mesmas camadas para o mesmo lugar (puro); a figura do deus e a do 3D com a mesma faixa.
- S3: geleira (`S.gelo`) só no frio e no alto; poço da queda alta é `deep`.

**Regras do guard:**
- `geo.js` puro (sem `G.R`, sem escrita no mundo);
- `cliff3d.js`, `horizon3d.js`, `rockmesh.js`, `cave3d.js` na lista do que só se vê;
- só o `relief.js` (e os escritores de hoje: `powers.js`, `miracles.js`, `village.js`) escreve o `S.H`, e todo escritor
  chama o `Rf.fixArea` ou o `Rf.cliffs` (cobrar a dupla);
- o desenho do chão e dos pés pergunta ao `Sp.cliffAt`, nunca refaz a conta (como a regra 64 faz com as pontes);
- o relevo novo tira acaso de fios próprios (nenhum `rng()` novo no `Rf.heights` sem o seu `seed ^ K`).

**Cenários (`qa/relevo.js`, partes curtas e a longa):**
- r1 a matriz de geração (`genmx` via `ev.js`: sementes × tipos × tamanhos × climas × relevos): conta penhasco, patamares,
  cânions, formações, geleiras, cachoeiras altas, praias; ninguém preso; mundo de 192 em < +1 s; **variedade** (quantas
  rochas, quantos tipos de formação, quantas formas de costa por mundo — uma prova contra a repetição);
- r2 save/load no meio (o relevo, as formações, a geleira voltam iguais; `oldsave` carrega o mundo de antes);
- r3 o deus mexe: meteoro num pilar, milagre de erguer terra num cânion, aterro de obra num patamar — `fixArea`, as
  regiões, a escultura refeita;
- r4 as cidades crescem 40 anos no relevo novo (os dez mundos do `oficio-eco`, os `degraus`): gente, fome, obras grandes,
  portas — comparados com hoje;
- r5 os bichos: a cabra no paredão esculpido, o ninho na falésia, a fauna (`fauna.js` f2) com menos capim;
- r6 o corpo: anda junto do paredão sem entrar na rocha, a câmera não entra nela (Node, pela geometria: `tres-node.js`,
  como o `qa/visual/pontes.js`); na fase 2, entra na caverna, salva dentro, morre dentro.

**Visuais:**
- `qa/visual/relevo-fotos.js`: sementes fixas, vistas fixas (a montanha de perto e de longe, o paredão, o cânion, a
  falésia com pilar, a praia, a geleira, a boca da caverna, o horizonte; Alta e Média) — o antes e depois do dono;
- `qa/visual/guarda3d.js` com os módulos novos (o 3D só desenha);
- a fidelidade deus × 3D da rocha;
- a fase `perf` (triângulos e quadro por qualidade, com a serra perto).

## 7. As figuras de hoje

**Figuras de escala, sem o navegador** (em `scratchpad/natureza/figuras-escala/`; feitas de `relevo-alpino.json`, o `S.H`
do mundo alpino 4242 — continente 128, falésias, uma cordilheira — exportado por `exporta-relevo.js` e desenhado por
`figuras-escala.py`, numpy + PIL). **Não são o desenho do jogo**: são a forma do mundo em metros de verdade, para medir.
- `perfil-leste-oeste.png`, `perfil-norte-sul.png` — o perfil pelo pico mais alto em escala 1:1, com o Coliseu do jogo
  (40 m de lote, 26 m de altura) e uma pessoa (1,75 m) ao lado: o «Umor», que o jogo chama de 7.560 m, é um lombo de **56 m** sobre uma base de
  ~120 m; as casas de penhasco (vermelho) são as rampas de cada lado.
- `mapa-penhascos.png` — o mapa inteiro com luz de noroeste: 1.446 casas de penhasco (vermelho) — o anel uniforme das
  falésias em volta de toda a ilha (a opção «falésias» faz o litoral inteiro igual) e a serra no meio; a neve no norte.
- `olho-perto.png` — do olho (1,6 m), a 106 m do pico: **de perto a forma já impressiona** — a serra enche o quadro, com
  agulhas de 4 m de faceta; o que falta é o que o desenho faz da forma (a face lisa esticada, uma rocha só, nenhuma
  sombra de longe) e a altura para quem olha de mais longe.
- `olho-longe.png` — do olho, a 207 m: a mesma serra já é uma fileira de morros baixos no horizonte; atrás dela, o mar.

**As fotos do jogo** (o 3D de verdade, Alta, pela fila `bash qa/navegador.sh`): o script está em
`scratchpad/natureza/fotos-relevo.js` (seis vistas — a montanha de perto e de longe, o paredão, o litoral com falésia, o
horizonte além da borda, a serra do alto — e a vista do deus do mesmo mundo; mede triângulos, chamadas e o `far`).
(resultado abaixo, se a fila deu vez)

- 1ª tentativa (Alta, 1000×620): esperou ~25 min na fila (a geração dos mundos prontos e o `encarna` de outra parte
  ocupavam as duas vagas) e, com a máquina ocupada (carga 9–11 em 4 núcleos), a primeira foto passou dos 5 min do
  `page.screenshot` — o 3D por software da Alta com o mapa quase inteiro «perto» não coube.
- **2ª tentativa (Média, 800×500): feita**, sem erro de página nem de módulo. Em
  `scratchpad/natureza/fotos-relevo/` (o registro em `run2.log` / `fotos.txt`). Mundo: continente 128 alpino, falésias,
  semente 4242; o pico «Umor» (56 m) em 75,29.

| foto | onde | o que mostra | chamadas · triângulos (Média) |
|---|---|---|---|
| `montanha-perto.png` | a ~100 m do pico, 6 m acima do mar | a serra como **um morro cinza e liso** com as camadas da `crag` em faixas (a única «geologia» que existe); os pinheiros de ~10 m medem a montanha e a encolhem (o pico tem 5–6 pinheiros de altura); à esquerda a falésia é uma rampa lisa entrando no mar; **a borda da neve e do capim serrilhada em degraus de casa** junto da água | 111 · 208 mil |
| `encosta.png` | numa casa a 46 m, junto de um trecho de penhasco | o penhasco de perto: **a figura da rocha esticada e borrada** onde a face olha na diagonal (a projeção de lado mistura X e Z), o pico como pirâmide facetada de triângulos de 2 m, a neve recortada pela casa | 87 · 270 mil |
| `litoral.png` | numa encosta de rocha a 21 m sobre o mar | a rocha íngreme como manchas borradas com **pontinhos pretos** na borda da neve; o mar plano até a névoa — com um **xadrez de casas na água** (é do pilar da água); um bloco de pedra branco (dodecaedro com neve) | 40 · 128 mil |
| `horizonte.png` | na praia da borda, olhando para fora do mapa | **mar, névoa e céu — mais nada**: o horizonte de hoje | 34 · 114 mil |
| `deus.png` | a vista do deus sobre a serra | os quadriláteros cinzentos facetados com as linhas de estrato, a neve, o rótulo «Umor 7.560 m», as quedas com nome («Queda Tarras», «Queda Ulor»), a caverna («Covão do Gelo Azul») | — |

O `far` da Média foi 864 m; o primeiro quadro custou 86 s por software (os shaders se fazendo) e a foto inteira 10 min
com a máquina em carga 21 — as outras, segundos. As vistas `montanha-longe` e `alto` (a serra do alto) e a Alta ficaram
para outra rodada com a máquina livre (`Q=alta bash qa/navegador.sh node fotos-relevo.js JOGO PASTA`).

## 8. A ordem sugerida

0. **As fotos de antes** (`qa/visual/relevo-fotos.js`, sementes e vistas fixas) e as invariantes do relevo de hoje (para
   que a mudança se meça).
1. **Só de se ver, sem risco**: V1 (geologia nas faces, `G.Geo`), V2 (a figura longe de 4 m), V7 (a boca da caverna) —
   e a V3 com o pilar do céu. Vale para todo save e mundo pronto; não toca o mundo. É onde a vista muda mais cedo.
2. **O mundo, na mesma escala** (W1): a geologia guiando o relevo — cristas vivas, estratos com patamares, cânions, erosão
   térmica, litoral de promontórios e pilares, a escarpa com a queda alta (o pedido da água), dunas, formações, geleiras.
   Junto, a escultura dos penhascos e os kits (V4, V5), porque é aí que as faces novas aparecem. Protocolo inteiro, mundos
   prontos gerados de novo, linha de base.
3. **O horizonte** (V6) depois da decisão de lore — ou o mapa de borda de serra (W3), que o resolve sem contradição.
4. **As cavernas por dentro** (a fase 2 de §3.6): grande, do tamanho dos interiores; depois de 1–3.
5. **A escala** (W2), só se depois de 1–4 as montanhas ainda parecerem pequenas — é a que mais custa ao resto do jogo.

## 9. Como medi (os scripts deste estudo, em `scratchpad/natureza/`)
- `mede-relevo.js` — a tabela de §1.2 (`node mede-relevo.js RAIZ_DO_JOGO`: mundos novos pelo `qa/nodemundo.js`, semente
  4242, cada relevo e tamanho).
- `tempo-geracao.js` — o custo de cada passo do relevo (§1.10), pelo relógio do processo (o `Date` do harness é parado).
- `mede-penhascos.js` — o tamanho das faces, os trechos, quem toca casa andável, os bichos em penhasco (§3.2).
- `altura-monumentos.js` — a altura das maravilhas pelo `G.Forma` (o Coliseu 26–30 m, a pirâmide 23–24 m, o Templo Mayor 35 m).
- `exporta-relevo.js` + `figuras-escala.py` — as figuras de escala (§7).
- `fotos-relevo.js` — as fotos do jogo pela fila do navegador (§7).
- Os triângulos do chão por qualidade (§1.7) são conta do código (`terrainGeo`: grade de 0,5 e 2 casas; `QUAL.near`), não
  medida de placa.
