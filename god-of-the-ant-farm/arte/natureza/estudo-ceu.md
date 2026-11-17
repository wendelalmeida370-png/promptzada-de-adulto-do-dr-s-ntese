# Pilar 4 — o céu, a luz e a atmosfera (estudo do batedor, árvore em 76e3cae)

> Estudo e medição, nenhum código do jogo mudado. Os roteiros meus (fora do jogo) estão em `scratchpad/natureza/ceu-scripts/`
> (`horas.js`: as fotos; `prova-custo.js`: o custo do céu e da sombra dos montes no processador). As fotos: `fotos-ceu-alta/`.

**Em uma página.** O 3D já tem uma base de luz cuidada e coerente: uma luz-chave (sol/lua) e um hemisfério, a curva de tons e o
grade próprios dentro de cada material (a mesma imagem com e sem pós), a névoa que casa a terra com o céu, a sombra macia
perto do corpo, a noite com a luz pintada das chamas, e o mesmo matiz da hora que a vista do deus — tudo função só de `S.time` e
`S.weather`. O que falta para o pedido: **o céu é pintado por rampas** (sem dispersão: sem o halo largo do sol baixo, sem o vale
aceso de dourado), **as nuvens são uma textura 2D que desliza** (sem corpo, sem tipos; a tempestade sem relâmpago no 3D),
**não há luz volumétrica no mundo** (os raios da Alta são de tela e não passam pelas copas), **a mata é iluminada como campo
aberto**, **a neblina é uma só no mapa**, **não há sombra de montanha**, e **o pôr do sol dura ~33 s de relógio**. A proposta: um
módulo puro **`G.Ceu`** (o sol, a lua, o céu da hora e do lugar, as nuvens do dia, um **mapa do ar** com a neblina por causa e o
dossel, a **sombra dos montes**, o arco-íris e a tempestade com causa) que o 3D, o deus e os outros pilares leem — no 3D pelas
mesmas portas de hoje (`GX`, o remendo do `toon()`); o céu físico calculado pequeno no processador; a luz da mata em três degraus
(o dossel e um "cookie" em todas as qualidades, cartões de luz na Média, luz volumétrica pelo mapa de sombras na Alta/Ultra);
nuvens em camadas/cartões até a Alta e volumétricas na Ultra; tudo só de se ver (`G.hash`, `G.VR`, o relógio do mundo).

## 1. O que existe

### 1.1 O caminho do desenho do 3D (realm3d.js → post3d.js)

- **Renderizador** (`js/realm3d.js` `init()`, l. 358): `THREE.WebGLRenderer({antialias:true, powerPreference:'high-performance'})`,
  `NeutralToneMapping` (Khronos PBR Neutral) com exposição pela hora, saída sRGB. Câmera perspectiva FOV 60, perto 0,1, longe 1600
  (o `R3.viewFar()` corta pela névoa: 500–1600 m).
- **Os materiais são Lambert/Phong do three com pedaços trocados** (`toon()`, l. 219): o `ShaderChunk` é remendado uma vez para
  TODOS os materiais da biblioteca — a luz difusa num "meio-toon" (smoothstep no N·L + borda de luz `RIM`), a borda do mapa de
  sombras que some macia, a sombra macia própria (PCSS: busca de bloqueadores num disco de 10 amostras + penumbra de 16 amostras,
  `gxSoft`), a luz pintada das chamas (o mapa `gxLM`/`gxLM2` de 96×96 m em volta do corpo, que o `fx3d.js` pinta), a névoa trocada
  (névoa de distância quadrática + neblina baixa exponencial por altura, com o azul indo primeiro, e a cor da névoa = a cor do
  horizonte do céu na mesma direção, `gxHaze`), e a curva de tons + grade próprios (`gxTone`: a Neutral com o pé devolvido;
  `gxGrade`: um pouco mais rica nos meios-tons, um S suave, a noite que perde as cores, sombras frias/luzes quentes).
  **Tudo isso acontece no fim de cada material** (o `tonemapping_fragment`), por isso o desenho direto à tela (Leve, Média) e o
  desenho pelo pós (Alta, Ultra) dão a mesma imagem.
- **As luzes**: UMA `HemisphereLight` (o céu por cima, o chão quente por baixo) e UMA `DirectionalLight` (o sol de dia, a lua de
  noite: "uma luz: cada material paga por cada luz"), mais 0/2/3/4 `PointLight` (Leve/Média/Alta/Ultra, `q.lights`: as chamas
  mais perto do corpo ganham luz de verdade, `fx3d.js` l. 253 — as outras são pintadas no `gxLM`). Nada de IBL/envMap.
- **As sombras**: o mapa de sombras do sol num quadrado em volta do corpo (`placeKey`, l. 2010), metade do lado `q.sbox` (36–68 m),
  empurrado um pouco à frente do olhar, com os texels presos no chão (não rastejam). Viés pequeno e `normalBias` de 0,7 texel.
  Refeito a cada `q.shadowEvery` quadros. Fora desse quadrado não há sombra projetada (só a sombra das nuvens no chão, abaixo).

- **A luz da hora** (`light(focus)`, l. 1892, a cada quadro): o sol anda por `S.time` (nasce em −0,015, põe-se em 0,735; no
  máximo ~55° de ângulo — ~61° vistos, §1.8 —, "para as paredes terem um lado de luz e um de sombra"); de noite a lua faz o arco. Tudo é lido pelo seno
  da altura do sol `s` em rampas fixas (`RAMP`, l. 1861: a cor do sol, o zênite, o horizonte, o brilho em volta do sol, a faixa
  rosa do lado oposto depois do pôr, a exposição que abre no escuro de 1 a 1,75), mais um toque pela hora (`AIRT`: a manhã mais
  fria e limpa, a tarde mais quente) e **o matiz da luz do deus** (`G.Render.ambient()` do `render.js`, a tabela `AMB` por hora)
  que tinge o sol (60%), o céu (30–35%) e o brilho (65%) — é assim que o amanhecer rosa e o fim de tarde dourado do deus são os
  mesmos do 3D. A chuva cinza o céu e apaga o sol (até −72%) e o brilho. O céu de preenchimento (`hemi.color`) é a média do domo
  pintado + um piso de luz da noite; o chão (`groundColor`) é o rebote quente do sol. `R3.LT` guarda a luz desta hora, só de leitura
  ("para os testes e para o que quer casar com ela"); `R3.TUNE` são os botões (exposição, sol, céu, saturação, etc.).
- **A névoa** (no `tonemapping_fragment` de cada material, l. 299): a névoa de distância `tau = (d·k)²` com `k = 1,25/view`
  (a qualidade decide até onde se vê), começando depois da distância do olho ao corpo; a neblina baixa
  `0,0055·MIST(hora)·exp(−0,12·(y−mar))`, grossa no amanhecer (`MIST`: 1 → 0,16 ao meio-dia → 0,42 à noite), mais grossa na
  chuva; o azul vai primeiro (o morro longe fica azul antes de sumir); no fim da vista tudo é névoa. **Uma neblina só, igual em
  todo o mapa** — não há neblina por lugar (vale, mata, rio, queda d'água), nem por umidade (`S.moist`), nem por bioma.

### 1.2 O céu do 3D

- **Um domo** (`SphereGeometry(1400, 32, 16)`, `ShaderMaterial` próprio, l. 392): do horizonte (`gxHaze`, a mesma cor em que a
  terra longe se desfaz) ao zênite por `pow(h, 0.42)`; o brilho em volta do sol (`s⁴` e `s¹⁶`), a faixa do crepúsculo do lado
  oposto (`gxBelt`); debaixo do horizonte, a névoa um pouco mais escura. **Céu pintado, não físico**: nada de dispersão Rayleigh/Mie,
  nada de cor que dependa da altura do olho, do sol abaixo do horizonte iluminando nuvens por baixo, de sombra da terra.
- **O disco do sol** (`disc`, 24× a cor do sol: passa do branco, o brilho da Alta o pega) e **o da lua** com halo pequeno
  (`pow(cm,300)`), ambos atrás das nuvens. A lua **não tem fases** nem textura; a direção dela é um arco fixo por hora.
- **As estrelas** (l. 444): 1500 pontos com magnitudes de verdade (muitas fracas, poucas fortes), cores (branca, azul-branca,
  laranja), mais densas ao longo da Via Láctea, cintilando mais perto do horizonte, escondidas pelas mesmas nuvens do domo; e a
  Via Láctea pintada no domo (uma faixa com ruído, `uStars`). Escolhidas por `G.hash` (sempre o mesmo céu).
- **As nuvens**: **uma camada 2D só, no próprio domo** — o ruído de nuvem (`G.Ground3D.cloudNoise()`, 128×128, dois canais de fBm)
  projetado em `d.xz/(h+0.08)` e arrastado pelo vento do mundo (`U.wind`); cobertura `cover = 0,36 + chuva·0,55 + tempestade·0,2 +
  nuvens do mundo·0,01` (até 0,98); a luz de cada nuvem por um passo de "auto-sombra" (o ruído lido um pouco para o lado da luz) e
  a borda prateada/dourada do lado do sol; na Leve (`SKYCHEAP`) um canal só, sem a auto-sombra. **Não há volume, não há altura de
  nuvem, não há tipos (cúmulo, cirro, estrato, cúmulo-nimbo), não há parallax** — a mesma textura fina em todo o céu; elas não
  mudam de forma, só deslizam. Perto do horizonte o `d.xz/(h+0.08)` estica e repete a textura.
- **As nuvens de chuva do mundo** (`S.clouds`, do `nature.js`: «natural», «storm», «divine») aparecem no 3D só como **partículas**
  (`fx3d.js` l. 572): bolas macias de 26–46 m a ~70 m de altura, cinza pela intensidade, a até 380 m do corpo. Não entram no domo.
- **A sombra das nuvens no chão** (`G.Ground3D.clouds`, o mesmo ruído a 520 m por repetição, arrastado com o vento; escurece até
  30% sob sol forte, nada à noite) — **só no material do chão** (`MAT.land`): as árvores, as casas, a água e as pessoas não
  escurecem quando a sombra passa.

### 1.3 O pós-processamento (`js/post3d.js`, só Alta e Ultra)

A cena vai para uma imagem de ponto flutuante (meio-float, MSAA 4×, com textura de profundidade); depois: **SAO** (oclusão de
ambiente pela profundidade, 8 ou 12 amostras, metade ou inteira, borrada sem cruzar bordas; some a 66–110 m), **bloom** (o que
passa do branco: joelho macio + escada de 5 imagens), **raios de sol** (*crepuscular rays* de tela: o céu perto do sol, onde nada
está na frente, arrastado em 20 amostras para o lugar do sol na tela, duas passadas em ¼ do tamanho; só com o sol de frente, mais
forte quando baixo, nenhum na chuva) e por fim a mesma exposição + `gxTone` + `gxGrade` dos materiais, sRGB e um grão contra as
faixas. **Não há**: antisserrilhado temporal (TAA), profundidade de campo, desfoque de movimento, LUT de cor por hora/bioma,
névoa volumétrica, *light shafts* no espaço do mundo (os raios são só de tela: somem quando o sol sai do quadro; numa mata não há
"céu perto do sol" visível pelas copas, então quase não aparecem), refração/calor, vinheta, aberração.
Sem `EXT_color_buffer_float` (WebGL1, celular fraco) o pós desliga sozinho (`P3.failed`) e a imagem vai direta à tela, igual na
cor porque a curva está nos materiais.

### 1.4 As qualidades (`QUAL`, realm3d.js l. 40) e o orçamento

| campo | Leve (`baixa`) | Média | Alta | Ultra |
|---|---|---|---|---|
| `scale` (resolução × devicePixelRatio, teto 2) | 0,6 | 0,75 | 1 | 1 |
| `shadows` (lado do mapa do sol) / `sbox` (meia-largura, m) | 0 / – | 1024 / 40 | 2048 / 52 | 4096 / 68 |
| `shadowEvery` (refaz a sombra a cada n quadros) | – | 3 | 1 | 1 |
| `soft` (sombra macia PCSS) | 0 | 0 | 1 | 1 |
| `ao` / `bloom` / `rays` (pós) | 0/0/0 | 0/0/0 | 1/1/1 | 2/1/1 |
| `view` (m; a névoa = 1,25/view) | 200 | 360 | 640 | 900 |
| `near` (anel de pedaços perto) / `lod` | 1 / 0,5 | 2 / 0,75 | 4 / 1 | 5 / 1,4 |
| `lights` (chamas com luz própria) | 0 | 2 | 3 | 4 |
| `aniso` | 1 | 1 | 4 | 8 |
| `detail` (texturas, padrões, céu e água finos) | 0 (`SKYCHEAP`, `WCHEAP`, `NOPAT`) | 1 | 1 | 1 |
| capim (`grass`, `field`, `grassDen`) | não | 12 m, 0,5 | 30 m, 0,7 | 40 m, 1 |

A regra do orçamento (D-032): **a Média não pode custar mais de +10% que o jogo antes do estúdio** (medido na mesma máquina); por
isso ela já roda com a imagem a 0,75 e a sombra a cada 3 quadros (o "corte de reserva"). A Leve tem de ficar mais barata que antes;
a Alta e a Ultra "são para máquina com placa de vídeo e não entram na regra". A bíblia (§6): cena na Média ≤ 500 mil triângulos e
≤ 200 chamadas de desenho (a Alta pode dobrar os triângulos); medido hoje, ~114–144 chamadas e ~310–330 mil triângulos perto do
corpo (metrópole, Média). As outras áreas **leem** os campos (`detail`, `lod`, `props`, `grassDen`), só o dono da luz os muda.

### 1.5 O tempo do mundo (quem é a verdade)

- `S.weather` (`world.js` l. 59; escrito só pelo `nature.js` `updateWeather`): `rain` (0–0,85, global, sobe na tempestade e desce
  sozinho), `storm` (segundos restantes de tempestade), `drought`, `windA` (ângulo que vagueia), `windS` (0,3 calmo, 0,45 seca,
  0,95 tempestade). Não há temperatura do ar, umidade do ar, nebulosidade, neblina, frente, pressão.
- `S.clouds` (as nuvens do mundo, locais, que molham o chão `S.wet` por onde passam e apagam fogo; as «storm» dão raios de verdade
  pelo `G.Powers.naturalLightning` — o mundo sorteia com `G.R`); a chuva sobre o corpo é `max(weather.rain, Nature.rainAt(x,y))`.
- `S.temp` e `S.moist` (por casa, do `biomes.js`): o calor e a umidade do lugar. **Ninguém do céu os lê** (só a roupa, o
  `G.Biome.cold` que troca a chuva por neve, os vagalumes).
- `S.wet` (o chão molhado, que seca ao longo do dia): o `ground3d.js` já desenha poças com o céu refletido.
- **Estações**: não há estação visual. O "ano" do `migrate.js` é comprimido num dia (as fases da primavera, do verão, do outono
  pelas horas: 0,1 / 0,2 / 0,55 / 0,66), só para as manadas e as aves. A neve é do bioma frio (`R3.snowAt`, `G.Ground3D.snowXZ`)
  e do **Inverno Súbito** do deus (`winter.js`: `S.winters`, `S.ice` — a neve enterra o capim, os rios gelam; o 3D desenha o gelo
  pelo `MAT.ice` e o frio pelo `G.Atmos.cold`).
- **A chuva no 3D** (`fx3d.js` l. 437): 1600 traços em volta do olho (a neve em flocos onde o bioma é frio), inclinados pelo
  vento, mais as gotas que batem no chão e os anéis na água. **A tempestade no 3D não tem relâmpago nem clarão** — o raio do
  mundo (`G.FX.lightning`) e o clarão de chapa do `sky.js` (`st.flash`) são só da vista do deus; no 3D ouve-se o trovão (`audio`)
  e mais nada. O céu na chuva fica um cinza uniforme (o `cover` sobe, as cores vão a cinza); não há a base escura do cúmulo-nimbo,
  a cortina de chuva vista de longe, o arco-íris (o deus tem; o 3D não).

### 1.6 O dia e a noite

- O dia do mundo: `G.DAY_LEN = 200` s. O corpo vive o mundo a `G.Space.TIME = 0,35` → **um dia em 9,5 min de relógio**; a proposta
  D-365 (0,27 → 12,3 min) ficou para o dono (D-464). Enquanto uma cena corre, o relógio do dia anda a `G.LINGER = 0,35` (`G.dayPace`,
  só o `tick` do `main.js` pergunta; regra 62). A luz do 3D é função **só de `S.time` e de `S.weather`** — nenhum estado próprio
  — por isso salto, load e duas vistas dão a mesma luz.
- A noite: a lua como luz-chave (azulada, 0,42), o piso de luz da noite no hemisfério, o grade que tira a cor do que é escuro
  (a noite azul-cinza) e mantém a cor onde a chama acende; **a luz pintada das chamas** (`gxLM`: cada fogueira, tocha e porta
  acesa perto do corpo ilumina o chão, as paredes e os rostos, com o reflexo delas na água); as janelas acesas (`Build3D.night`,
  e por causa: `G.Atmos.lit(b)` — alguém acordado lá dentro); a fumaça só com fogo de verdade (`G.Atmos.fire`); os vagalumes nas
  noites quentes e secas (`S.temp`). A bíblia (§12, A5) dá a noite por cumprida ("a melhor mudança de luz do estúdio").
- **A vista do deus** (`render.js` + `sky.js`): o fundo é um degradê de 2 px (dia, noite, um toque de rosa/laranja no crepúsculo)
  com 90 estrelas; a luz da hora é um `multiply` da cor `AMB` sobre a cena inteira (`lightingPass`), com as luzes e o fogo somados
  num canvas de luz; o `sky.js` põe neblina de manhã nas baixadas e nos pântanos (*sprites*), sombras de nuvem (5 manchas
  "do que só se vê", `G.VR`), raios de sol na tela nas horas douradas (7 cunhas em `screen`), arco-íris depois da chuva, clarão
  dentro da tempestade, redemoinhos de poeira, folhas ao vento, vagalumes; as nuvens do mundo como *sprites* (`G.Art.cloud`).

### 1.7 A luz das matas, hoje

- Uma mata no 3D é luz de céu aberto: o hemisfério (o céu inteiro) ilumina o chão debaixo das copas igual a um campo; **não há
  oclusão do céu pela copa** (só o SAO de tela na Alta/Ultra, que some a 66–110 m e mede centímetros, não um dossel de 30 m).
  A sombra das copas no chão só existe dentro do mapa de sombras do sol (36–68 m em volta do corpo, nenhuma na Leve), e o mapa
  de sombra das folhas é feito dos cartões (`MAT.leaf`, `alphaTest`) e das bolas da copa: é uma sombra, não uma penumbra salpicada
  de luz.
- As folhas têm luz atravessando (o sol atrás da copa brilha na borda: `pow(bl,4)·0,2/0,28`) e borda de luz (`RIM`).
- Não há luz volumétrica no mundo (nada de raio que se veja **no ar** entre os troncos), nem neblina localizada, nem a cor verde
  do ar da mata. Os raios de tela da Alta só nascem do **céu visível** perto do sol: através de uma copa fechada quase não existem.

### 1.8 Os números do relógio do céu (calculados das fórmulas do `light()`)

(Pela direção de verdade, `dirOf` normalizado — que inclina o sol para o sul —, não pelo ângulo bruto `alt`.)

| `S.time` | 0,00 | 0,02 | 0,05 | 0,10 | 0,36 | 0,60 | 0,66 | 0,70 | 0,72 | 0,735 | 0,75 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| altura do sol | 2,9° | 6,8° | 12,8° | 23° | **61°** (máx.) | 27,5° | 15° | 6,8° | 2,9° | 0° | −2,5° |

(O comentário do código fala em "não mais que ~55°": é o `alt` antes de normalizar; a altura vista é ~61°.)
**O pôr do sol dura ~33 s de relógio** no corpo: o sol de 6° a 0° leva 6,2 s do mundo (18 s no corpo, a 0,35) e o crepúsculo
civil (0° a −6°) 5,2 s do mundo (15 s); o náutico, mais 8 s. O dia claro (sol acima de 6°) é 6,6 min, a noite funda (abaixo de
−6°) 1,9 min. A 0,27 (D-365) o pôr do sol iria a ~42 s. **Este é o limite mais duro para "nascer e pôr do sol impressionantes":
a hora dourada passa num piscar** (a cena, com `G.LINGER`, a estica só enquanto dura).

(As medidas e as fotos estão no §7.)

## 2. Os limites diante do pedido (e das fotos de referência)

O que já é bom e deve ficar: a curva de tons e o grade (a cor do deus preservada, nada estourado nem esmagado), a noite (a lua,
as estrelas, a poça quente das chamas, as janelas por causa), a névoa que casa a terra com o céu na mesma direção, a sombra macia
da Alta, a luz que atravessa as folhas, o mesmo matiz da hora nas duas vistas. O que falta, pelo que o dono pediu:

1. **O pôr do sol passa num piscar** (~33 s de relógio, §1.8) e o céu dele é um degradê: o `ref-ceu.jpg` tem o sol baixo com
   um halo largo de luz no ar (dispersão para a frente, Mie), a névoa do vale acesa de dourado, as cristas recortadas contra a luz,
   as nuvens com volume acesas de rosa por baixo, a sombra das montanhas atravessando o vale. Nada disso existe: o céu é pintado
   por rampas (`RAMP`) sem dispersão; a névoa é uma só cor por direção, sem o "brilho do sol no ar"; as nuvens são uma textura fina
   que só desliza; **não há sombra de montanha** (a sombra do sol só existe 36–68 m em volta do corpo e nenhuma na Leve).
   Nas fotos de hoje (§7) **o amanhecer e o pôr do sol são o mesmo quadro**: um véu rosa-lilás uniforme no céu inteiro, sem o
   laranja junto ao sol subindo para o azul, sem nuvem acesa, e a paisagem lavada na mesma névoa rosa — calmo, mas chapado.
2. **As nuvens não têm corpo** (uma camada 2D no domo; sem tipos, sem altura, sem forma que muda, repetindo e esticando perto do
   horizonte); as nuvens de chuva do mundo são bolas de partícula a 70 m; a tempestade não tem base escura, nem cortina de chuva,
   nem relâmpago no 3D. A deriva delas vai pelo relógio da vista (`U.time`, que começa em zero quando o 3D abre), não pelo do
   mundo: o mesmo mundo à mesma hora mostra outro céu conforme há quanto tempo o 3D está aberto, e o deus e o corpo não veem as
   mesmas nuvens.
3. **Não há luz volumétrica no mundo**: os raios da Alta são de tela, nascem do céu visível perto do sol e somem quando o sol sai
   do quadro — numa mata fechada (o `ref-floresta.jpg`: os feixes inclinados entre os troncos, o ar úmido aceso) quase não existem;
   na Média e na Leve não existem.
4. **A mata é iluminada como campo aberto**: o céu inteiro ilumina o chão debaixo do dossel (não há oclusão do céu pela copa),
   não há a penumbra salpicada de manchas de sol, nem a cor verde-dourada do ar da mata, nem a neblina presa no sub-bosque.
5. **A neblina é uma só no mapa todo** (altura do mar + a hora + a chuva): nada de neblina de vale ao amanhecer (`ref-ceu`), da
   mata úmida, do rio, da queda d'água (`ref-cachoeira`: a névoa da queda), do pântano; o `S.moist`, o `S.temp`, o relevo e a
   água não chegam à névoa do 3D. (A vista do deus já põe neblina nas baixadas e nos pântanos pelo `sky.js` — o 3D não.)
6. **A sombra das nuvens só cai no chão** (as árvores, as casas, a água e as pessoas não escurecem quando ela passa).
7. **A lua não tem fases nem desenho; as estrelas não giram com a noite**; não há arco-íris no 3D (o deus tem), nem aurora, nem
   estrela cadente, nem halo, nem a sombra da terra subindo do lado oposto no crepúsculo.
8. **Não há estação do ano nem variedade de dia para dia**: o céu de cada dia limpo é igual ao de ontem (o vento muda pouco, as
   nuvens têm sempre a mesma cobertura de 0,36); só a chuva e a tempestade o mudam.
9. **Uma luz só para o mapa todo**: o deserto, a selva, a tundra e o mar têm a mesma luz, o mesmo ar, o mesmo céu na mesma hora
   (só a névoa da distância e a chuva/neve local mudam). O pedido quer identidade por bioma: o ar seco e duro do deserto, o
   úmido e leitoso da selva, o frio e limpo da tundra.
10. **O reflexo do céu na água** é o degradê horizonte→zênite, sem as nuvens, sem a lua, sem o halo do sol (só o brilho do sol
    em `pow(rs, 900)`); a água não tem a cor do céu daquela direção (a água é de outro pilar, mas lê o que o céu der).
11. **A troca de exposição é pela hora, não pelo lugar**: dentro da mata, numa caverna (`ref-relevo`, o arco de rocha), debaixo
    de uma ponte, a exposição é a do campo aberto — nada da "porta de luz" do arco da caverna com o vale estourado lá fora.
12. **O orçamento é apertado na Média** (D-032: +10% sobre o jogo de antes do estúdio, já usando o corte de reserva) e a máquina
    de testes não tem placa: tudo o que é passe de tela cheia (nuvens com volume, raios no mundo, névoa volumétrica) só cabe na Alta
    e na Ultra, e por software custa segundos por quadro.

## 3. A proposta de arquitetura do pilar

### 3.1 O princípio: um lugar só para "o clima e a luz do instante" — `G.Ceu`

Hoje a luz da hora vive em três tabelas que se olham: o `AMB` do `render.js` (o deus), o `RAMP`/`AIRT`/`MIST` do `realm3d.js` (o
3D, tingido pelo `AMB`) e as constantes do `sky.js` (as horas douradas do deus, por `S.time` em faixas fixas). E o "céu" só existe
dentro do `light()` do 3D. A proposta é **um módulo puro, `js/ceu.js` (`G.Ceu`)**, na lista do que só se vê (`LOOK`) e do que só lê
— sem acaso nenhum, sem escrever nada, sem three.js (roda em Node, como o `G.Atmos`) — que responde, para o mundo como está
(`S.time`, `S.day`, `S.clock`, `S.weather`, `S.clouds`, `S.wet`, `S.temp`, `S.moist`, `S.biome`, `S.H`, `S.trees`, `S.winters`):

| pergunta | o que dá | quem lê |
|---|---|---|
| `G.Ceu.sun(t)` / `moon(t, day)` | a direção, a altura, a cor e a força do sol e da lua (a fase da lua pelo `S.day`); o mesmo caminho do sol de hoje, com a forma da curva que demora perto do horizonte (§3.2) | o 3D (luz-chave, céu, água), o deus (raios, sombra dos montes), o som (o coro do amanhecer) |
| `G.Ceu.sky(t, x, y)` | o céu desta hora e deste lugar em poucos números: zênite, horizonte, brilho do sol, faixa do crepúsculo, a luz do céu (irradiância do alto, do horizonte, do chão), a exposição, o "humor" da hora (calor, saturação) — e, por bioma, o ar (seco/limpo/úmido/leitoso) | o `light()` do 3D; o fundo e o `multiply` do deus (`AMB` passa a ser lido daqui); o grade |
| `G.Ceu.clouds(x, y)` | a cobertura e os tipos de nuvem acima de um lugar (cúmulo de bom tempo, cirro alto, estrato de chuva, cúmulo-nimbo da tempestade), a altura da base, a deriva **pelo relógio do mundo** (`S.clock`) | o domo, as nuvens com volume, a sombra das nuvens, a água (o reflexo), o deus (os *sprites* do céu) |
| `G.Ceu.air(x, y)` e o **mapa do ar** (`G.Ceu.airMap()`, uma figura por casa, refeita quando o chão muda: `S.typeVer`, as árvores) | a neblina do lugar e a sua causa: a umidade da mata (as copas + `S.moist`), o vale (a altura abaixo da média em volta), o rio e a queda d'água (a água que cai, do pilar da água), o pântano; a cobertura do dossel (quanto do céu a copa tapa); a altura do topo da neblina | a névoa de todos os materiais, os raios, a exposição dentro da mata, o deus (onde põe a neblina) |
| `G.Ceu.shade()` — **a sombra dos montes** (uma figura por casa: o sol visto ou tapado pelo relevo, pela altura do sol) | o relevo que faz sombra no vale ao amanhecer e ao pôr do sol, em qualquer distância e em qualquer qualidade (até na Leve) | o 3D (luz-chave × sombra do relevo, além do mapa de sombras perto do corpo), o deus (um véu por casa), o pilar do relevo |
| `G.Ceu.rainbow(x, y)` | o arco-íris **com causa**: o chão molhado de uma chuva que acabou (`S.wet` sem chuva agora), o sol baixo atrás de quem olha | o domo do 3D, o `sky.js` do deus (que hoje guarda um estado próprio) |
| `G.Ceu.storm(x, y)` | a escuridão da tempestade, a cortina de chuva, os raios do mundo recentes (a lista dos que o mundo fez: lugar e instante, guardada pelo efeito, ver §3.5) | o 3D (relâmpago, clarão), o deus |

A "fonte de verdade" para os outros pilares é este módulo e, no 3D, **as mesmas figuras e uniformes** que ele alimenta — o padrão
que o jogo já tem e funciona: o `GX` (uniformes do ar e da luz, iguais em todo material) e o remendo do `toon()` (onde todo
material lê a luz). A água, a vegetação e o relevo **não calculam luz nem céu**: leem o `GX`/`skyU` (no shader) e o `G.Ceu` (no JS).
Assim casam a cor e a luz entre si por construção. Ganchos sugeridos:
- `GX.gxSkyLUT` (a figura do céu por direção, §3.2) — a água reflete o céu por ela; a névoa usa a mesma cor;
- `GX.gxAirMap` (o mapa do ar: neblina, dossel, topo da neblina, sombra dos montes — uma RGBA8 de N×N casas);
- `GX.gxCloud` (a deriva, a cobertura e a figura das nuvens) — o domo, a sombra das nuvens em todo material, o reflexo;
- `GX.gxFlash` (o clarão do relâmpago neste quadro) — o céu, as nuvens e o hemisfério sobem juntos.

### 3.2 O céu: físico na base, pintado por cima

- **Dispersão de verdade, calculada pequena e no processador**: as tabelas de Hillaire (2020) — a transmitância (64×16) e a "vista
  do céu" (64×32 direções) — calculadas em JS, em `Float32Array`, quando o sol se move mais que ~0,2° (alguns ms, e o resultado vai
  numa `DataTexture` de meio-float; numa máquina sem `float` cai no RGBA8 com escala). Por que no processador: roda igual em
  qualquer placa, inclusive no celular e no SwiftShader; dá para provar em Node (a cor do céu numa hora é um número); e é
  determinístico. A Rayleigh dá o azul profundo do zênite e o laranja do pôr do sol; a Mie dá o **halo largo e quente em volta do
  sol** que o `ref-ceu` tem; o sol abaixo do horizonte acende o céu por baixo; a sombra da terra (o cinturão de Vênus) nasce
  sozinho. A densidade da Mie muda com o lugar e o tempo (o deserto seco e duro, a selva leitosa, a chuva cinza, a seca com
  poeira) — é aí que entra a identidade de cada bioma.
- **Pintado por cima**: o `AMB` do deus continua mandando no matiz da hora (o mesmo amanhecer rosa nas duas vistas), o grade
  continua o mesmo, e o resultado passa pelos limites da bíblia (V ≤ 96 no sol, nada de neon). A direção de arte (*stylized
  high-fidelity*, a leitura do BotW) é a de um céu físico com as cores escolhidas, não a de um céu fotorrealista.
- **A névoa vira perspectiva aérea**: a cor que a terra longe pega é a da tabela do céu naquela direção, com a luz do sol
  espalhada no ar (o morro contra o sol fica dourado, o de costas azul), e a transmitância pela distância. Mais a **névoa por
  altura e por lugar** do mapa do ar (§3.4).
- **A hora dourada que demora** (só de se ver): o caminho do sol continua nascendo em −0,015 e se pondo em 0,735 (o `G.isNight`, o
  `AMB` e todas as regras do mundo ficam iguais), mas a forma da curva entre os dois passa a demorar perto do horizonte (por
  exemplo `0,96·sen(πu)^p`, `p ≈ 1,5`, como a noite já faz com 1,6): o sol de 0° a 6° passaria de ~18 s para ~35 s de relógio.
  Decisão do coordenador com o dono (o meio-dia fica um pouco mais longo e "alto", a manhã e a tarde mais curtas); junta-se à
  decisão do D-365/D-464 (o tempo do corpo a 0,27 daria mais 30%).
- **A noite**: a lua com fases (um ciclo pelos dias do mundo, `S.day`, por exemplo 8 dias), desenhada (uma figura procedural com
  mares escuros, por `G.hash`), a luz dela pela fase (a noite de lua nova bem mais escura, a de lua cheia azul-prateada), o brilho
  da terra na parte escura; as estrelas girando em volta do polo pela hora (uma rotação do grupo, de graça); a Via Láctea com mais
  corpo; e o que ainda não existe: **aurora** nas noites frias e limpas da tundra e da taiga (`S.temp` baixo, sem nuvem; cortinas
  verdes e roxas no domo — com causa: o frio e o céu limpo), estrelas cadentes (`G.VR`), o halo de 22° em volta da lua com cirro.

### 3.3 As nuvens, por qualidade

- **Leve**: a camada do domo de hoje (um canal), mas com a deriva pelo relógio do mundo e a cobertura do `G.Ceu.clouds`.
- **Média**: **duas a três camadas no domo** (o cirro alto e fino, o cúmulo médio com "volume falso" — a altura da nuvem pelo
  ruído, a normal pelo gradiente, acesa pelo sol com a borda prateada e o pé escuro; o estrato baixo na chuva), com paralaxe entre
  elas; **cartões de nuvem** (8 a 20 figuras de cúmulo e de cúmulo-nimbo feitas uma vez num canvas, por `G.hash`) perto do
  horizonte e **nas nuvens do mundo** (`S.clouds`: cada nuvem de chuva do mundo vira um cúmulo-nimbo de verdade, com a base escura
  e a cortina de chuva — um cilindro de traços que rola —, no lugar e no tamanho que o mundo diz, visto de longe).
- **Alta**: o mesmo, mais a **marcha de raios barata** só para os cúmulos (¼ da imagem, ~24 passos, a luz de cada passo lida da
  altura da camada — sem marcha até o sol), composta no pós.
- **Ultra**: **nuvens volumétricas de verdade** (marcha de raios numa faixa de altura, ruído 3D Perlin-Worley 64³ feito uma vez
  por `G.hash` numa `Data3DTexture`, o mapa do tempo desenhado das `S.clouds` e da cobertura do dia, a luz com Beer-Powder e duas
  fases de Henyey-Greenstein, ½ da imagem com ruído azul e reaproveitamento do quadro anterior). Numa placa de vídeo de PC, 1–3 ms.
- **A sombra das nuvens em todo material** (todas as qualidades): uma linha no remendo do `toon()` multiplicando a luz-chave pela
  mesma figura que o domo desenha, projetada pela direção do sol — as árvores, as casas, a água e as pessoas escurecem juntas
  quando a nuvem passa. Sai do `ground3d.js` (que hoje a faz sozinho) para o remendo comum.
- **Variedade de dia para dia** (só de se ver, com causa): a cobertura e o tipo de nuvem de cada dia vêm do lugar e da hora — a
  terra úmida e quente faz cúmulo à tarde (`S.moist` × `S.temp` × o sol), a seca deixa o céu limpo e leitoso de poeira, a chuva do
  mundo faz o estrato, a tempestade o cúmulo-nimbo — e de uma "massa de ar do dia" por `G.hash(S.day)` (nunca do acaso do mundo).
  Nuvem de tempo bom nunca escurece como chuva: quem decide se chove continua sendo o mundo.

### 3.4 A luz da mata, os raios de sol e a neblina por lugar (o `ref-floresta`)

1. **O dossel tapa o céu** (todas as qualidades): o mapa do ar traz, por casa, quanto do céu as copas tapam (o `luz` do `G.Mata`
   que o pilar da vegetação propõe; até ele existir, das `S.trees` e do `R3.crownOf`, borrado), e o remendo da luz multiplica a luz do céu (o hemisfério) por ele **abaixo da altura das copas** — o chão
   e os troncos da mata ficam fundos, e a luz que sobra fica verde-dourada (a luz que passou pelas folhas). É uma leitura de
   textura por fragmento; dá a "sombra profunda" do pedido até na Leve.
2. **As manchas de sol no chão da mata**: onde o mapa de sombras do sol alcança (Média em diante), elas já saem das copas; além
   dele (e na Leve), um "cookie" de folhas — uma figura de luz e sombra projetada pela direção do sol, mais densa onde o dossel é
   mais fechado — faz o salpicado sem mapa de sombras.
3. **Os raios de sol no ar**:
   - **Alta e Ultra — luz volumétrica de verdade pelo mapa de sombras**: no pós, a ½ ou ¼ da imagem, de cada pixel até a sua
     profundidade (no máximo ~60 m), 16 a 32 passos lendo o mapa de sombras do sol que já existe (e que já tem as copas e os
     cartões de folha) e a sombra das nuvens; cada passo soma a luz espalhada pela fase de Henyey-Greenstein (muito para a frente
     no ar úmido) × a densidade do ar do mapa do ar (alta na mata, no vale de manhã, junto da queda d'água). Ruído azul e um borrão
     que respeita as bordas. Isso faz os feixes inclinados entre os troncos do `ref-floresta` e o vale aceso do `ref-ceu`, e
     substitui com vantagem os raios de tela de hoje (que ficam para o sol no céu aberto, longe).
   - **Média — cartões de luz**: onde o mapa do ar diz "mata fechada com uma clareira ou uma falha no dossel" (as falhas saem das
     árvores do mundo, por `G.hash` do lugar), quadros aditivos finos e longos, inclinados pela direção do sol, que somem com o sol
     alto demais, baixo demais, de costas, na chuva e à noite. Barato (uma geometria no pedaço perto, sem passe de tela cheia), lê
     bem no estilo do jogo.
   - **Leve**: nada além do dossel e do cookie.
4. **A neblina por lugar** (todas as qualidades, uma leitura do mapa do ar no remendo da névoa): a densidade e a altura do topo da
   neblina por casa — **o vale** ao amanhecer (o mapa de "quanto abaixo da média em volta", vezes o `MIST` da hora: o vale do
   `ref-ceu`), **a mata úmida** (o dossel × `S.moist`: o ar leitoso que esconde o fundo da selva), **o rio e o pântano**, **a queda
   d'água** (o pilar da água marca onde a água cai; o ar em volta fica cheio da névoa dela — o `ref-cachoeira`), **depois da chuva**
   (`S.wet` alto e o sol: a terra fumegando). A cor da neblina é a do céu daquela direção mais a luz do sol espalhada — dourada
   contra o sol, azulada de costas.
5. **A exposição pelo lugar**: debaixo de um dossel fechado, numa caverna ou dentro de casa, o olho abre (a exposição lida do mapa do
   ar e do `Space.indoor` no lugar do olho, nunca de uma leitura de pixels da placa — determinístico e barato), e o que está ao sol
   lá fora estoura um pouco: o feixe de luz na mata e o vale visto pelo arco da caverna (`ref-relevo`).

### 3.5 As tempestades e a chuva

- **O relâmpago no 3D**: o raio do mundo (o `G.Powers.naturalLightning` / `P.lightning`, sorteados pelo mundo) já chama o efeito do
  deus (`G.FX.lightning`); uma chamada irmã (`G.FX3D.bolt(x, y)`, no mesmo lugar, efeito com `G.VR` pela regra 48) desenha o raio
  ramificado no lugar exato onde o mundo o fez cair (fitas aditivas, a forma por `G.VR`), acende a nuvem por dentro, sobe o
  hemisfério e o céu por um instante (`gxFlash`) e o trovão chega com o atraso da distância. O clarão de chapa sem raio (o que o
  `sky.js` faz no deus) vem do `G.VR` só de se ver, dentro das nuvens de tempestade.
- **A chuva que escurece**: na chuva, o mundo inteiro fica molhado na cor (mais escuro e com um brilho do céu de lado — a "pele
  molhada" no remendo comum, pela chuva do lugar e pelo `S.wet`), o ar fica cinza e fecha a vista (já fecha), a base das nuvens
  desce, a cortina de chuva das nuvens do mundo aparece de longe, os traços perto do olho ganham respingo e névoa no chão.
- **Depois da chuva**: o arco-íris com causa (§3.1), a terra fumegando ao sol, as poças com o céu (o `ground3d.js` já tem).

### 3.6 As sombras

- **A sombra dos montes** (`G.Ceu.shade()`, todas as qualidades): uma figura N×N refeita em JS a cada ~1° de sol (256² casas × ~64
  passos ≈ alguns ms, espalhados em vários quadros), lida pela luz-chave de todo material — as cristas fazem sombra no vale ao
  amanhecer e ao pôr do sol em qualquer distância, o que o mapa de sombras perto do corpo nunca fará. A mesma figura pode dar ao
  deus um véu por casa no `lightingPass`.
- **Cascatas**: na Ultra (e talvez na Alta), uma segunda faixa do mapa de sombras mais larga (200–400 m, menos texels) para as
  árvores e as casas de longe — num atlas com a de perto, um remendo do `shadowmap_pars_fragment` (uma luz direcional a mais
  custaria em todo material, "cada material paga por cada luz").
- O resto fica: a sombra macia da Alta (PCSS), o SAO, a sombra de contato das pessoas.

### 3.7 O orçamento por qualidade (proposta; a medir na mesma máquina, como manda o D-032)

| | Leve | Média | Alta | Ultra |
|---|---|---|---|---|
| céu | tabela do céu no processador (64×32), uma leitura | + duas a três camadas de nuvem com volume falso, cartões de nuvem, nuvens do mundo como cúmulo-nimbo | + marcha barata dos cúmulos (¼) | nuvens volumétricas (½, temporal) |
| névoa | distância + altura + mapa do ar (uma leitura) | igual | igual + perspectiva aérea completa | igual |
| luz da mata | dossel + cookie | + manchas pelo mapa de sombras + cartões de luz | + luz volumétrica pelo mapa de sombras (¼, 16 passos) | (½, 32 passos) |
| sombras | sombra dos montes | + mapa do sol 1024 (como hoje) | 2048 (como hoje) | 4096 + cascata larga |
| tempestade | relâmpago, clarão, chuva | + cortina de chuva, pele molhada | igual | igual |
| noite | lua com fases, estrelas que giram | + aurora, halo | igual | igual |

A conta do D-032 é a Média: tudo o que entra nela é uma leitura de figura a mais em cada fragmento (o mapa do ar, a sombra das
nuvens e dos montes juntos numa só RGBA) e geometria pequena (cartões); nada de passe de tela cheia. Se não couber, o primeiro corte
é a camada de nuvem de volume falso (fica a de hoje) e os cartões de luz na mata a mais de 30 m.

### 3.8 Quanto custa no processador o que se propõe calcular fora da placa (medido, protótipo)

Um protótipo à parte (`scratchpad/natureza/ceu-scripts/prova-custo.js`, não é do jogo), em Node, nesta máquina com carga ~10 em 4
núcleos (os tempos são um teto; numa máquina livre, menos):
- a tabela da transmitância (64×16, uma vez por mundo): **94 ms**; a "vista do céu" 64×32 com 24 passos por raio: **29 ms** por
  altura do sol — refeita a cada ~0,2° (o sol anda ~0,26° por segundo de relógio no corpo), ou seja ~30 ms por segundo, que se
  espalha por linhas em vários quadros (ou vai para a placa onde há imagem de ponto flutuante). Sai um céu de verdade: ao meio-dia
  o zênite (0,09; 0,19; 0,40) e o horizonte claro; a 15° o horizonte do lado do sol já laranja (3,8; 2,7; 1,5); a 2°, vermelho
  (5,5; 1,6; 0,16) com o lado de costas apagando. Sem a tabela da dispersão múltipla o crepúsculo fica preto demais (a −4°,
  quase zero): o executor precisa da terceira tabela de Hillaire (32×32) ou de deixar o crepúsculo para a camada pintada (o `belt`).
- a sombra dos montes num relevo N×N, marchando até 64 casas pela direção do sol: **10 ms (N=192), 17 ms (N=256), 58 ms (N=384)**
  por altura do sol. Os mundos prontos têm N = 128 a 160 (512–640 m): ~5–8 ms, refeita a cada ~1° de sol, em pedaços. Os picos
  chegam a 36 unidades × 1,5 m = 54 m (o relevo «alpino» do `relief.js`): com o sol a 3°, a sombra de um pico passa de 1 km — atravessa
  o mapa inteiro.

### 3.9 A ordem sugerida e as decisões que não são do executor

**Ordem** (cada degrau entregável sozinho, com as suas provas):
1. **A base, barata, em todas as qualidades**: o `G.Ceu` com o sol, a lua e o céu da hora (o `light()` lendo dele, a mesma imagem de
   hoje primeiro — uma troca sem mudar nada, provada pelas fotos iguais); a deriva das nuvens pelo relógio do mundo; a sombra das
   nuvens em todo material; o mapa do ar (neblina por lugar, dossel); a sombra dos montes. É isto que os outros pilares leem: deve
   chegar **antes** deles mexerem na cor da água, da mata e do relevo.
2. **A luz da mata**: o dossel tapando o céu, o cookie das folhas, os cartões de luz (Média), a luz volumétrica no pós (Alta/Ultra),
   a exposição pelo lugar.
3. **O céu físico**: a tabela do céu, a perspectiva aérea, o halo do sol; o pôr do sol que demora (se o dono quiser).
4. **As nuvens e a tempestade**: as camadas com volume falso, os cartões, as nuvens do mundo como cúmulo-nimbo com cortina de chuva,
   o relâmpago no lugar do raio, a pele molhada.
5. **A noite e o que ainda não existe**: a lua com fases e desenho, as estrelas que giram, a aurora, o arco-íris com causa, as
   estrelas cadentes, o halo.
6. **A Ultra**: as nuvens volumétricas de verdade, a cascata larga das sombras.

**Decisões para o coordenador e o dono** (não são do executor):
- a hora dourada mais longa (a forma da curva do sol, §3.2) — e, junto, o tempo do corpo 0,35 → 0,27 (D-365, D-464);
- nuvens de tempo bom que variam de dia para dia sem chuva (só de se ver, com causa no lugar e na hora): aceitável dentro do «o
  que se vê tem causa»?;
- estações do ano: o mundo não tem (o "ano" do `migrate.js` cabe num dia). Uma estação visual (o verde da primavera, o outono, o
  inverno que não é o do deus) é mudança do **mundo** (as plantações, a caça, a neve dependeriam dela) — fora deste pilar, pelo
  protocolo inteiro;
- quem é a fonte do matiz da hora (`AMB` do `render.js` ou o `G.Ceu`): mexer nele muda as fotos do deus;
- um anel de montanhas de longe além do mapa (com o pilar do relevo e a direção de arte).

## 4. Os riscos

- **O desempenho no celular e na Média**: tudo o que entra na Média é leitura de figura por fragmento em todos os materiais; o
  remendo do `toon()` está em todo programa (43 programas): cada linha a mais pesa na compilação (por software, lenta) e no
  fragmento. Regra: tudo por `#ifdef` pela qualidade, e a Média medida contra a de hoje (D-032). O celular sem imagem de ponto
  flutuante (`EXT_color_buffer_float`) perde o pós (já é assim) — o céu do processador e o mapa do ar valem para ele; as nuvens
  volumétricas e a luz volumétrica, não. A memória: o ruído 3D 64³ RGBA8 = 1 MiB, as tabelas e o mapa do ar < 0,5 MiB.
- **A máquina sem placa (SwiftShader, T-1421 — as figuras e as fotos feitas no navegador de testes por software)**: o passe de
  nuvens e o de luz volumétrica multiplicam o tempo de um quadro por software (a Alta já custa ~2× a Média só pelo pós). As provas
  que fotografam na Alta (as do `monumental`, o `bichos-gestos jogo`, as `fotos`) ficam mais lentas: o executor mede e, se preciso,
  as provas que não são do céu fotografam com os passes novos desligados (uma chave de prova, nunca a qualidade do jogador).
  Os ms do software não dizem o custo numa placa: o orçamento real precisa de uma medida numa máquina com placa (o dono pelo celular
  e pelo PC dele) — combinar com o coordenador.
- **O determinismo**: tudo é só de se ver — `G.hash` (as formas, a massa de ar do dia, as falhas do dossel), `G.VR` (o raio
  ramificado, as estrelas cadentes, o clarão de chapa), o relógio do mundo para o que deve ser igual nas duas vistas (a deriva das
  nuvens: `S.clock`, não o `U.time` de hoje) e o relógio da vista para o que só tremula. **Nunca `G.R`**: o raio do mundo continua
  sorteado pelo mundo; o 3D só desenha onde ele caiu. O `G.Ceu` puro (sem acaso, sem escrever) com a sua regra no `guard.js`.
  A mudança da deriva das nuvens para o relógio do mundo muda as fotos de hoje (as nuvens aparecem noutro lugar).
- **As fotos mudam** (todas: o céu, a luz e a névoa estão em todo quadro). A linha de base das fotos fixas (`qa/visual/fotos.js`,
  `natureza.js`, `vista3d.js`, `fotos-diario.js`), as colunas «luz» e «preto%» do `desempenho.js` e os limites do `caca.js` («plantas
  pretas de dia» acima de 30% dos pixels quase pretos; «quadro preto») — escurecer a mata com o dossel vai bater no `caca.js`: o
  ajuste é decisão escrita (D-xxx) com a foto, nunca afrouxar em silêncio; a bíblia (V < 8 vira buraco) continua valendo: a mata
  funda tem de ficar legível. A `fidelidade.js` (o deus, o 3D e a forma do mesmo prédio) e a `forma-deus.js` olham a cor do deus: se
  o `AMB` passar a vir do `G.Ceu`, conferir.
- **A vista do deus**: é canvas 2D com cache de chão por pedaços; não acompanha uma sombra de monte que anda a cada grau (refazer o
  cache custa) — vai por um véu por casa no `lightingPass`, em baixa resolução. Tudo o que o 3D ganhar do `G.Ceu` (a neblina por
  lugar, o arco-íris com causa, o relâmpago no lugar do raio, as nuvens do dia) deve aparecer no deus pelos meios dele, para "o mesmo
  amanhecer das duas alturas" continuar verdade. Cuidado com o `AMB`: ele é a luz inteira do deus, e mexer nele muda todas as fotos
  do deus.
- **O three.js remendado por texto** (`toon()` troca pedaços do `ShaderChunk` por busca de texto): uma versão nova do three que
  mude um pedaço avisa no console e a luz fica incompleta. Mais remendos = mais pontos frágeis; o executor mantém o padrão `rep()`
  (avisa alto) e uma prova que compila os materiais e confere que nenhum remendo falhou (o `qa/visual/guarda3d.js` é o lugar).
- **O tamanho do mundo**: o mapa tem 512–640 m e a vista vai a 900 m na Ultra: além do mapa é mar (`makeOcean`). As "cordilheiras
  ao fundo" do `ref-ceu` não existem fora do mapa — é com o pilar do relevo (um anel de montanhas de longe, só de se ver?) e com a
  direção de arte (o mundo é um diorama na vista do deus).
- **A luz da hora é a mesma para todo o mapa hoje**: tornar o ar dependente do lugar (bioma, mata, vale) faz a luz mudar quando o
  corpo anda — a transição tem de ser suave (o mapa do ar borrado, a exposição com inércia pela distância, não pelo tempo de
  relógio, para não depender de quadros).
- **O pôr do sol mais longo** muda o caminho do sol que a vista do deus também usa (os raios das horas douradas do `sky.js` são por
  faixas fixas de `S.time`): os dois têm de ler o mesmo `G.Ceu.sun`.

## 5. Os arquivos

**Novos (do pilar):**
- `js/ceu.js` — `G.Ceu`, puro, sem three.js (o sol, a lua, o céu da hora e do lugar, as nuvens do dia, o mapa do ar, a sombra dos
  montes, o arco-íris, a tempestade); carregado depois do `atmos.js` e antes do `sky.js`/`render.js` (o deus também lê); na lista
  `LOOK` do `guard.js`.
- `js/ceu3d.js` — o céu desenhado do 3D: o domo pela tabela do céu, as camadas e os cartões de nuvem, as nuvens volumétricas
  (Ultra), a lua com fases, as estrelas que giram, a aurora, o arco-íris, o raio e o clarão, a cortina de chuva; tira do `init()` do
  `realm3d.js` o domo e as estrelas de hoje (que hoje são do A5 dentro do `realm3d.js`). Na lista `LOOK`.
- `qa/ceu.js` (prova em Node), `qa/ceu-inv.js` (as invariantes, juntadas pelo `junta-inv.js`), `qa/visual/ceu-fotos.js` (as fotos
  fixas pelas horas e pelo tempo).

**Mudados:**
- `js/realm3d.js` — o `light()` passa a ler o `G.Ceu` (sai o `RAMP`/`AIRT`/`MIST`/`dirOf` daqui); o `toon()` ganha as leituras
  comuns (o mapa do ar na névoa e na luz do céu, a sombra das nuvens e dos montes na luz-chave, o clarão, a pele molhada); o `QUAL`
  ganha os campos novos (`clouds`, `vlight`, `shafts`, `csm`…); o `placeKey`, a cascata. O `GX` ganha `gxSkyLUT`, `gxAirMap`,
  `gxCloud`, `gxFlash`.
- `js/post3d.js` — a luz volumétrica pelo mapa de sombras, a composição das nuvens volumétricas, a exposição pelo lugar.
- `js/fx3d.js` — o raio ramificado (`F3.bolt`), a chuva com respingo e névoa no chão, a cortina de chuva das nuvens do mundo, as
  nuvens do mundo (hoje partículas) passam ao `ceu3d.js`.
- `js/ground3d.js` — a sombra das nuvens sai dele para o remendo comum; a cor do céu nas poças vem da tabela do céu (é do pilar do
  relevo/chão: combinar).
- `js/sky.js` e `js/render.js` (o deus) — leem o `G.Ceu` (as horas douradas, a neblina por lugar, o arco-íris com causa, o clarão
  no lugar do raio, o véu da sombra dos montes, o fundo do céu); o `AMB` passa a ser do `G.Ceu` (ou o `G.Ceu` lê o `AMB` — decidir
  quem é a fonte; a proposta: a tabela do matiz da hora mora no `ceu.js` e o `render.js` a pergunta).
- `js/powers.js` / `js/nature.js` (do mundo) — uma linha ao lado do `G.FX.lightning` (o efeito do 3D, com `G.VR` pela regra 48).
- `js/incui.js` (o menu Gráficos) — as chaves novas da qualidade (nuvens, raios), se o jogador puder mudá-las.
- `qa/guard.js`, `qa/qa.js` (a regra «céu» no `QA.check`), `qa/README.md`, `qa/AUDIT.md`, `CLAUDE.md` (a fundação nova: "o céu e o
  ar do instante — `G.Ceu`"), `arte/BIBLIA.md` (o céu e a luz por bioma e por hora).

**Onde topa com os outros pilares:**
- **Vegetação**: o dossel do mapa do ar. O batedor da vegetação propõe o `G.Mata` (`js/mata.js`, puro), que dá por casa a densidade
  (`dens`) e **o quanto o dossel fecha (`luz`)** — **o `G.Ceu` lê o `G.Mata.at(i).luz`, não calcula o dossel de novo** (uma regra só;
  enquanto o `G.Mata` não existe, das `S.trees` e do `R3.crownOf`); as clareiras e as trilhas do `G.Mata` são onde vão os cartões
  de luz e onde a neblina da mata abre; as falhas do dossel
  onde vão os cartões de luz; a luz que atravessa as folhas (`MAT.leaf`, `MAT.flora`, hoje do A3/A5 juntos); o custo das folhas no
  mapa de sombras (a luz volumétrica depende dele); o vento (o `grass3d.js` já usa o ruído das nuvens para as rajadas: `uGust`) —
  o vento do instante (as rajadas) pode morar no `G.Ceu` também.
- **Água**: o reflexo do céu pela tabela do céu (`gxSkyLUT`), as nuvens e a lua no reflexo, o brilho do sol, a névoa sobre a água, a
  névoa da queda d'água no mapa do ar (o pilar da água diz onde a água cai: `S.relief.falls` já existe), o relâmpago na água, os
  anéis da chuva. O batedor da água também pede "um mapa de névoa por lugar, combinado com o céu" e o arco-íris no borrifo da
  queda: **é o mesmo mapa do ar** — um só, do `G.Ceu`, com a queda d'água como uma das causas (o borrifo de partículas fica com a
  água; a névoa que fica no ar, com o céu); o arco-íris do borrifo pela mesma regra do `G.Ceu.rainbow` (o sol atrás de quem olha).
- **Relevo**: a sombra dos montes (feita do `S.H`), a neblina dos vales (do `S.H`), a perspectiva aérea das cordilheiras, as
  cavernas e os arcos (o céu que não entra: a exposição pelo lugar), a neve que brilha ao sol baixo, o anel de montanhas de longe.

## 6. As provas que o pilar precisaria

1. **`qa/ceu.js`, em Node, sem navegador (segundos)**: o `G.Ceu` puro — a mesma pergunta ao mesmo mundo dá a mesma resposta; não
   tira acaso (o `S.rng` igual antes e depois) e não escreve (a assinatura do mundo igual); o caminho do sol contínuo nas 24 h, sob
   o horizonte de noite, o máximo de ~61°; a fase da lua pelo dia; as cores em faixa (sem NaN, nada estourado, a noite nunca preta: o
   piso de luz); o matiz da hora do deus e o do 3D iguais em cada hora; o pôr do sol com a duração decidida; o mapa do ar com causa
   (neblina só onde há mata úmida, vale, rio, queda d'água, pântano — cada casa com neblina diz a sua causa; nenhuma no deserto seco
   ao meio-dia); a sombra dos montes contra um raio de força bruta em pontos ao acaso; o arco-íris só com o chão molhado, sem chuva
   e com o sol baixo atrás; o mesmo save carregado duas vezes, o mesmo mapa do ar; save/load no meio de uma tempestade, o deus que
   muda o clima (`Mudança de Clima`), o Inverno Súbito, o chão que muda (uma árvore cortada abre o dossel: o mapa do ar refeito).
2. **As invariantes (`qa/ceu-inv.js`, a regra «céu» do `QA.check`)**: de dia a luz-chave é o sol (já existe no `lightCheck`); com
   chuva sobre o corpo a cobertura nunca é de céu limpo; nenhum raio desenhado sem um raio do mundo naquele lugar há pouco; a
   neblina do mapa do ar só onde a causa existe; o mapa do ar e a sombra dos montes da mesma versão do chão (`S.typeVer`).
3. **Regras novas no `guard.js`**: o `ceu.js` puro (sem `G.R`/`G.VR`/`Math.random`, sem escrever em `G.S`); só o `ceu.js` calcula o
   caminho do sol e da lua (o `dirOf` do `realm3d.js` e as faixas de `S.time` do `sky.js` passam a perguntar); a deriva das nuvens
   pelo relógio do mundo; ninguém além do `realm3d.js` escreve os uniformes do ar (`GX`).
4. **No navegador (pela fila)**: `qa/visual/ceu-fotos.js` — as horas fixas (amanhecer, manhã, meio-dia, tarde, pôr do sol,
   crepúsculo, noite de lua cheia e de lua nova), o tempo (chuva, tempestade com um raio provocado, depois da chuva com o arco-íris,
   seca), os lugares (o alto com vista, a mata fechada, o vale de manhã, a queda d'água, o deserto, a tundra com aurora), em cada
   qualidade; o `qa/visual/caca.js` (nada preto de dia, nada estourado); o `desempenho.js` com o custo dos passes novos (o pós já diz
   `P3.ms`); a e11 do `encarna` (o 3D desenha sem erro de módulo em cada qualidade); o `guarda3d.js` (nenhum remendo do `toon()`
   falhou, os materiais compilam).
5. **A regressão inteira antes da versão** (`regress.sh`), com as fotos de antes e depois lado a lado (`qa/visual/compara.py`) e a
   nota da bíblia: "visivelmente melhor".

## 7. As fotos de hoje e a medida de um quadro

**Como**: um roteiro meu, à parte do jogo (`scratchpad/natureza/ceu-scripts/horas.js`, feito sobre o `qa/visual/fotos.js`: o mesmo
jeito de assentar o mundo sem desenhar e desenhar só os dois últimos quadros e o da foto), pela fila `qa/navegador.sh`, no mundo
pronto «cidade» (N = 128; a maior cidade é Roma), com o corpo num **morro com vista** (a casa andável mais alta acima da média do
anel de 10 casas em volta) e na **mata mais fechada** (a casa livre com mais árvores num quadrado de 9×9), o olhar **para o sol**
(amanhecer, pôr do sol) ou **de costas** (meio-dia, noite). A medida de cada foto: o tempo do quadro da foto (o `performance.now`
em volta do `G.Main.frameFor` com um `readPixels` para esperar a placa), as chamadas e os triângulos do `renderer.info`, o
`G.Post3D.info()`.

**O que vale por software (SwiftShader, T-1421: o navegador de testes não tem placa de vídeo; as figuras saem iguais da mesma
forma, os bytes não)**: as fotos valem (a cor, a luz, a forma); as chamadas de desenho e os triângulos valem; **os milissegundos
não dizem o custo numa placa** — só comparam uma versão com outra na mesma máquina e com a mesma carga, e esta rodada correu com a
máquina cheia (carga 8–11 em 4 núcleos, dois navegadores e várias provas de outras partes), então nem isso: aqui eles dão só a
ordem de grandeza do que uma prova que fotografa paga.

**As fotos** (Alta, 1000×620, mundo «cidade», 17/11/2026, árvore 76e3cae), em
`/tmp/claude-0/-home-user-promptzada-de-adulto-do-dr-s-ntese/474a40dc-2376-5786-aa24-770c3a52b5eb/scratchpad/natureza/fotos-ceu-alta/`
(o registro de cada uma em `log.txt` na mesma pasta; nenhum erro de página nem de módulo):

| foto | hora (`S.time`) | sol | o que se vê |
|---|---|---|---|
| `alto-amanhecer.png` | 0,00 | 3,7°, de frente | o morro nevado, o corpo contra o disco do sol (com o brilho da Alta); **o céu inteiro um véu rosa-lilás uniforme**, sem nuvem que se veja, sem degradê do laranja junto ao sol para o azul em cima; a mata ao longe se desfaz na mesma névoa rosa; nenhum raio visível; pouco contraste — bonito e calmo, mas chapado |
| `alto-meiodia.png` | 0,36 | 61°, de costas | o melhor quadro: céu azul limpo do zênite a um horizonte claro, umas nuvens finas e achatadas (a camada 2D do domo), a neve branca sem estourar, o mar até a névoa; **não há linha de horizonte nem terra ao longe** (o mapa acaba em mar); luz limpa mas sem drama |
| `alto-por.png` | 0,72 | 2,1°, de frente | **igual ao amanhecer**: o mesmo véu rosa-lilás no céu todo, o disco do sol com halo; as copas com borda quente; nenhuma sombra longa de morro, nenhum vale aceso, nenhuma nuvem rosa; o salpicado das copas que somem perto do olho aparece como ruído |
| `alto-noite.png` | 0,86 | −52° (a lua), de costas | a noite que a bíblia aprova: estrelas, a camada de nuvens cinza e fina, a poça quente da tocha na neve, o morro legível no escuro; o mar escuro com faixas horizontais ao longe (coisa da água); nenhuma lua no quadro |
| `mata-meiodia.png` | 0,36 | 61°, para o sol (fora do quadro) | a câmera ficou atrás de um tronco (a colisão da câmera): a mata ao meio-dia é **clara e por igual**, o chão debaixo das copas iluminado como campo, o mar azul entre os troncos; **nenhuma mancha de sol, nenhuma penumbra funda** |
| `mata-por.png` | 0,71 | 4°, de frente | a mata ao pôr do sol com a tocha acesa e vagalumes: **aqui os raios de tela da Alta aparecem**, fracos, entre os troncos à esquerda (onde há céu atrás); o sub-bosque continua claro (o céu inteiro o ilumina), as copas abertas mostram o céu lilás; nada do ar úmido aceso do `ref-floresta` |

**O custo medido** (Alta, por software, máquina com carga 15–22 em 4 núcleos e dois navegadores — ver acima o que isso vale):

| foto | ms do quadro | chamadas (cena) | triângulos do quadro (com a sombra) | passes do pós |
|---|---|---|---|---|
| alto-amanhecer | 13 524 | 246 (230) | 1,21 M | 16 (com os raios) |
| alto-meiodia | 15 556 | 233 (220) | 1,09 M | 13 |
| alto-por | 16 806 | 301 (285) | 1,41 M | 16 |
| alto-noite | 8 558 | 236 (223) | 1,06 M | 13 |
| mata-meiodia | 20 066 | 117 (104) | 0,66 M | 13 |
| mata-por | 18 654 | 231 (215) | 0,97 M | 16 |

Leitura: a cena típica na Alta tem **~220–290 chamadas e ~1–1,4 milhão de triângulos por quadro** (a passada da sombra entra na
conta: a referência de antes do estúdio, `qa/visual/base/desempenho.txt`, tinha ~300 chamadas e 1,4 M na Alta), o pós faz 13
passes (16 com os raios de sol) em 10 imagens; por software um quadro custa **8–20 s** nesta máquina cheia (numa máquina livre, a
equipe do estúdio mediu ~2,5–4,4 s na Alta e ~2,2–4 s na Média). Uma prova que fotografa paga isso por quadro desenhado — razão
para os passes novos (nuvens, luz volumétrica) terem uma chave de prova e para as provas fotografarem pouco. A comparação na Média
(sem o pós) ficou de fora: a fila do navegador estava com seis trabalhos de outras partes esperando.
