# Estudo — Pilar 1: os personagens (corpos, rostos, expressões, diversidade)

Batedor do arquiteto, 17/11. Só leitura no repositório; nada foi commitado. O jogo foi lido do checkout principal
`/home/user/promptzada-de-adulto-do-dr-s-ntese/god-of-the-ant-farm` (abaixo, os caminhos são relativos a ele). Os experimentos
estão em `.../scratchpad/sociedade/personagens/exp/` e as figuras em `.../scratchpad/sociedade/personagens/` (lista no apêndice).

---

## 0. O essencial em dez achados

1. **Toda a gente tem a mesma cabeça.** Há dois corpos (homem e mulher), feitos da mesma argila (`arte/corpo_forma.py:83-138`), e
   nenhuma variação de forma por pessoa. O que muda é a cor (pele, cabelo, íris, lábios), o penteado (8 malhas), a barba (3), a
   roupa e uma escala uniforme pela idade. Ninguém é largo, magro, gordo, musculoso, alto ou baixo (`js/people3d.js:497-499`).
2. **O rosto é pintura sobre uma máscara.** Sobrancelhas, lábios, boca aberta e pálpebras são pintados no shader
   (`js/body3d.js:201-264`). As pálpebras são pintadas na própria superfície do globo ocular, sem espessura nem sombra. **Não
   existe osso de rosto** (nem mandíbula, nem pálpebra: os 40 ossos estão em `js/bodymesh.js`), e a malha do rosto é uma sopa de
   triângulos irregulares saída do decimador: serve para uma forma parada, não para uma expressão.
3. **Por que o rosto da foto do dono parece pequeno e duro.** Na distância padrão da câmera (4,8 m, campo de 58°,
   `js/cam3d.js:26`), a cabeça tem ≈ 100 px na tela do celular e ≈ 57 px num PC 1080p. O olho aberto pintado tem 1,6 cm de
   altura (≈ 3 px no PC), a sobrancelha 7 mm (≈ 1,4 px) e o lábio 8 mm. Abaixo de 3 px um traço pintado some. Somam-se a luz
   Lambert sem brilho na pele, os lábios e as sobrancelhas sem contraste e o «chanel» asteca, que lê como capacete. A argila crua
   (fotos em `morfos/`) mostra ainda os globos oculares saltados da órbita rasa.
4. **O mundo já guarda a aparência, mas pobre e pelo acaso do mundo.** Os campos são `v.skin` e `v.hair`
   (`js/villagers.js:96-97`). A pele vem inteira do pai ou da mãe, com cara-ou-coroa no `G.R()`, ou de uma lista de 4 tons por
   povo (`js/civs.js`). Os mundos prontos têm 12 a 14 peles e 12 a 14 cabelos. `v.face` **não** é rosto: é o lado para onde o
   boneco do deus olha (±1). Nenhuma decisão do mundo lê `skin` ou `hair`: só o desenho, o cadáver (`carnage.js:123`), o
   registro dos mortos (`village.js:2274`) e quem volta dos mortos (`beyond.js:117`).
5. **O mundo tem causas que o 3D não desenha.**
   - O braço perdido (`v.lost.armL|armR`) e a perna perdida (`v.lost.leg`) aparecem na vista do deus (um braço só, a muleta:
     `js/art.js:856, 894, 1074`), mas no 3D a pessoa tem os quatro membros.
   - A gravidez (`v.preg`, contagem regressiva de 0,55 dia, `villagers.js:2069, 508`) não se vê em lugar nenhum.
   - Nos mundos prontos: metrópole com 21 sem um membro e 30 grávidas; mega com 25 e 28.
6. **O desenho tem uma arquitetura excelente para a variedade.** Uma chamada de desenho por malha serve a multidão inteira: cada
   pessoa é uma linha de uma textura de números com as matrizes dos 40 ossos e 43 parâmetros (`body3d.js:21-29, 444-453,
   478-517`). Pôr *morph targets* por pessoa nesse esquema é natural: uma textura de deslocamentos compartilhada e os pesos na
   linha de cada um. A variedade não custa chamadas de desenho novas.
7. **Os alvos de forma podem sair da mesma argila.** Provado em `exp/morfos.py`, sem Blender, em 5 s:
   - 9 alvos de identidade (mandíbula, rosto longo, nariz longo e largo, lábios, maçãs, arcada, queixo, crânio) projetando a
     malha de hoje na argila mudada (`arte/corpo_sdf.py:255`, `project`), cada um em menos de 1 s;
   - 48 KB em int8, só os pontos da cabeça.
   A malha decimada de hoje rasga onde a mudança é grande (o nariz longo). Por isso a cabeça precisa de uma topologia nova, com
   anéis em volta dos olhos e da boca.
8. **O genoma pode ser puro e não mudar um bit do mundo.** Provado em `exp/genoma.js`: 28 genes diploides em 56 caracteres,
   14 µs por nascimento, feito só do id, da semente e dos genomas dos pais, sem tirar nada do `G.R`.
   - Filho–pai fica a 0,65; irmãos a 0,68; dois do mesmo povo a 1,08; de povos diferentes a 1,13. O rosto varia mais dentro do
     povo que entre povos, de propósito.
   - Filhos de mãe nórdica com pai egípcio saem com a pele no meio dos dois.
   - Em 6.500 pessoas há 8 quase-gêmeos.
9. **Os vizinhos de arquivo hoje são um só.** `people3d.js`, `body3d.js`, `bodymesh.js` e os `anim-*.js` são todos «da 20a»
   (`JOGABILIDADE.md` §5). Os três pilares vão mexer neles. É preciso cortar:
   - o look e a roupa (`lookFill`, `outfitOf`) num arquivo do pilar dos personagens;
   - a atuação do rosto (`MOOD`, `easeMood`, `blinkAt`, `faceOf`, `lookFor`) num `anim-face.js` do pilar da animação.
10. **O custo cabe.** Um corpo perto tem hoje 9.804 triângulos (a cabeça 3.822, dos quais 504 nos olhos), a 12 m 2.560 e a
    26 m 480. Corpos inteiros: 12, 30, 60 ou 90 por qualidade.
    - A proposta mantém os triângulos (a cabeça nova com ≈ 4 mil, bem distribuídos) e acrescenta ≈ 40 a 50 alvos, ≈ 2 a 4 MB de
      textura na placa e ≈ 0,4 MB no arquivo.
    - As chamadas de desenho ficam iguais, a não ser pelos penteados novos.
    - A densidade medida chega a 31 pessoas a 12 m de alguém (metrópole). Pela conta (§4.5), os 60 qps devem se manter no PC, e
      no celular na qualidade baixa (12 corpos). Isso é estimativa: a medida de verdade é a primeira coisa da fase 1.

---

## 1. Como uma pessoa é feita e desenhada hoje

### 1.1 A malha
- **Gerada** por `arte/corpo.py`, em ≈ 10 min, com o `bpy` do venv:
  - argila de campos de distância: `arte/corpo_forma.py` (as formas) e `arte/corpo_sdf.py` (o barro);
  - *surface nets* com passo de 4,5 mm no corpo perto (`corpo.py:288`);
  - decimador do Blender, com peso no rosto (`face_weight`, `corpo.py:146-150`): «o rosto com o triplo do detalhe»;
  - oclusão por raios e pesos por osso.
  - Determinístico.
- **O corpo**: `body(fem)` (`corpo_forma.py:83-109`), um de homem e um de mulher. A cabeça (`:112-138`) é feita de:
  - um crânio, um elipsoide do rosto e duas mandíbulas em cone;
  - maçãs, queixo, arcada e duas órbitas subtraídas;
  - nariz (cone, ponta, asas), lábios (dois elipsoides e um corte) e orelhas.
  - A cabeça é «crescida» 1,06 de propósito (`:5`, `:105`).
- **Os olhos**: globos de raio 1,82 cm (`EYE_R` 0,0172 × 1,06, `:213-220`; o real é ≈ 1,2 cm). É uma esfera UV de 14 × 10 no
  perto, 8 × 6 no meio, e nenhuma longe (`corpo.py:153-174, 288-291`).
- **`js/bodymesh.js`** (1,83 MB, gerado): 40 ossos `pel spine chest neck head` + ombro, cotovelo e mão com meios-ossos, dedos,
  polegar, coxa, joelho, pé, dedos do pé, quatro da saia, dois da capa, tocha, ferramenta, carga. **Nenhum osso no rosto.**
  Os pontos da cabeça vão 1.905 no `head` e 52 no `neck` (medido em `exp/malha.js`).

| Malha | Perto | 12–26 m | > 26 m |
|---|---|---|---|
| corpoM / corpoF | 9.804 tri (cabeça 3.822, frente do rosto 2.318, olhos 504) | 2.560 (cabeça 473, olhos 160) | 480 (cabeça 74, sem olhos) |
| 8 cabelos | 1.400–2.200 | 488–770 | 166–264 |
| 3 barbas | 700–1.100 | 244–384 | — |
| saias, capa, toga, bata, tanga | 900–2.600 | 312–938 | 108–516 |
| 10 chapéus e elmos | 600–1.400 | 210–520 | 156–192 |

- Medidas da cabeça (corpoM): topo 1,822 m e queixo ≈ 1,53 m, ou seja ≈ 0,29 m (o real é ≈ 0,23 m para 1,75 m); meia-largura
  0,104 m.
- A BÍBLIA §6 ainda diz «Pessoa ≤ 3 mil (corpo 2 mil + roupa e cabelo)». O corpo de hoje já tem 9,8 mil: **a tabela precisa ser
  atualizada**, como foi a dos bichos (D-265, D-322).

### 1.2 O desenho (`js/body3d.js`)
- `InstancedBufferGeometry` por malha, com o atributo `aRow` (`:39-54`). Uma textura de números `TW × 96` (`MAXR`, `:23`). Por
  linha:
  - as 40 matrizes 3 × 4 (3 texels cada);
  - os texels 0 e 1, com o rosto (fechado, olhar x/y, boca, sorriso, sobrancelhas, raiva, rubor);
  - 2 e 3, com o corte da roupa;
  - 4 a 19, com as cores e os estilos;
  - 20 a 39, com o pano e as juntas;
  - 40, com mais rosto (tristeza, olhos arregalados, olhos sorrindo) e a couraça (`:173-177, 491-509`).
- A pele é dobrada no shader (`SKIN`, `:58-85`), o pano da saia e da capa tem física no shader (`CLOTH`, `:91-170`) e a pintura
  vai por zona (`PAINT`, `:178-404`). O material é `MeshLambertMaterial` com luz de borda (`:409-427`). As sombras usam o mesmo
  esqueleto (`depth`, `:428-433`).
- **Uma chamada de desenho por malha usada no quadro**, para a multidão toda (`B3.end`, `:526-531`), e outra para a sombra.
- O rosto pintado:
  - **O olho** (`b3eye`, `:201-229`):
    - o branco, a íris e a pupila são desenhados na direção do olhar sobre o globo parado; o globo não gira;
    - dois brilhos;
    - a pálpebra de cima e a de baixo são faixas da cor da pele *na superfície do globo*, de `up = 0,42` a `lo = −0,47` do
      raio: uma abertura de ≈ 1,6 cm;
    - a íris tem ≈ 1,95 cm de diâmetro (o real é ≈ 1,2 cm) e é cortada pelas duas pálpebras.
  - **O resto do rosto** (`b3face`, `:232-264`):
    - um arco de sobrancelha de 3,6 a 7,4 mm de espessura;
    - os lábios entre y 1,585 e 1,64;
    - a boca aberta é uma fenda escura (`open`), com dentes só no riso;
    - rubor nas bochechas e na ponta do nariz.
- **Os humores** (`people3d.js:556-565`):
  - 8 canais (`smile up angry sad wide squint jaw blush`), escolhidos pelo `v.emo.k` do mundo (`lookFill`, `:531`) ou pela
    bebida;
  - passam de um a outro em ≈ ⅓ s (`easeMood`);
  - o piscar vai pelo relógio do id (`blinkAt`, `:1839`);
  - o olhar segue o corpo do jogador a 6 m (`lookFor`, `:1882`);
  - a fala é `pose.talk`;
  - tudo se junta no `faceOf` (`:1631-1637`).

### 1.3 Quem é desenhado e como
- O nível de detalhe vai pela distância do olho: 12 m e 26 m (`LODD`, `people3d.js:1910`).
- Corpos inteiros: `q.npcs` = 12 na baixa, 30 na média, 60 na alta e 90 na ultra (`realm3d.js:41-44`), até `view × 0,22`. Além
  disso vem a «multidão» de cápsulas, até 320: corpo, cabeça-esfera de 10 × 8, cabelo e duas pernas, na cor da roupa e da pele
  (`people3d.js:76-83, 1814-1831`).
- **O look** (`lookFill`, `:493-534`):
  - altura de 1,75 no adulto e 1,68 a partir dos 70, × 0,95 na mulher; a criança vai de 0,75 a 1,65 m, com a cabeça maior
    (`headK`, `:615, 1404`);
  - o cabelo embranquece dos 62 aos 80 (`:502-506`).
- **A roupa** (`outfitOf`, `:595-758`): muito rica, pelo povo, o ofício, o sexo, a idade, a riqueza da casa, o grupo
  (`G.Atmos.dress`), o frio, o inventário (elmo, couraça) e o cativo. Penteado, barba e íris são escolhidos pelo
  `G.hash(id·13 + k·7919)` (`:607, 625-633`). Tudo «só se vê».
- **O que falta desenhar**: o membro perdido, a gravidez, a manqueira, a muleta, a corcunda do velho (a postura é da animação),
  a magreza da fome, o corpo do trabalho.

### 1.4 Por que o rosto parece «pequeno e duro» (a foto do dono)
O celular mostra a câmera em terceira pessoa a ≈ 2,6 a 4,8 m (`Cam3D` 4,8 m, 58°). A conta da tela é px/m = H / (2·d·tan 29°):

| Onde | Cabeça | Abertura do olho (1,6 cm) | Íris | Sobrancelha (7 mm) | Lábio (8 mm) |
|---|---|---|---|---|---|
| Celular de pé (≈ 1.900 px de 3D), 4,8 m | ≈ 100 px | ≈ 6 px | ≈ 7 px | ≈ 2,5 px | ≈ 3 px |
| PC 1080p, 4,8 m | ≈ 57 px | ≈ 3 px | ≈ 4 px | ≈ 1,4 px | ≈ 1,6 px |
| PC 1080p, 1,2 m (câmera de conversa) | ≈ 230 px | ≈ 13 px | ≈ 16 px | ≈ 6 px | ≈ 6 px |

Os traços pintados de 1 a 3 px somem ou tremem. Além disso:
- a pálpebra sem volume não faz sombra no olho;
- a pele Lambert é chapada (sem *wrap*, sem brilho, sem calor no terminador);
- a boca é uma linha;
- sobrancelha e cílio têm pouco contraste (`b3face`: a cor da sobrancelha é `min(cabelo·0,55, pele·0,42)`);
- a mesma cabeça para todos.

A BÍBLIA §12 já registrava «olhos do tamanho de olho»: a escolha antiga foi a proporção real. **Decisão de arte para o
arquiteto:** estilizar o olho (abertura ≈ 1,4×, íris ≈ 1,15× da real, cílio escuro de 1,5 mm), engrossar a sobrancelha
(9–12 mm) e dar geometria às pálpebras e à boca. Uma câmera de conversa (o rosto a ≈ 1,2 m) é do pilar do corpo e da câmera
(`cam3d.js` é da 20b).

---

## 2. O que o mundo já sabe da aparência de uma pessoa

| Campo (`SHAPE`, `villagers.js:37-66`) | Como nasce | Quem lê | No save |
|---|---|---|---|
| `skin` | `Vg.create`: a cor inteira de um dos pais por `G.R() < 0,5`, ou `G.pick(civ.skin)` (4 tons por povo, `civs.js:18,40,63,86,108`; sem povo, 6 tons, `villagers.js:9`) | o desenho (`art.js`, `people3d.js`, `naval.js:1064`), o cadáver (`carnage.js:123`), o morto (`village.js:2274`), quem volta (`beyond.js:117`) | sim (e no registro dos mortos) |
| `hair` | igual (5 ou 6 por povo, 8 sem povo) | igual; embranquece no desenho dos 62 aos 80 | sim |
| `kidCloth` | `G.pick(KID_CLOTH)` | o desenho | sim |
| `g`, `age`, `born`, `civ` | o mundo | o mundo inteiro | sim |
| `mother`, `father`, `kids` | `Vg.create` / `V.birth` (`village.js:2205-2219`; gêmeos em 5%) | o mundo; `G.person(id)` acha vivos e mortos (`village.js:59`) | sim; o registro dos mortos guarda pais, filhos, pele e cabelo (`village.js:2271-2277`) |
| `traits` | `rollTraits([mãe, pai])` com `G.R` (herda traços) | as decisões | sim |
| `preg` | `v.preg = DAY_LEN·0,55` (`villagers.js:2069`), contagem regressiva | o mundo; a tela («Grávida», `ui.js:575`) | sim |
| `lost` | `{armL|armR|leg}` (`carnage.js:97-99`) | o mundo (trabalho, luta, passo — `villagers.js:122, 406`, `combate.js:85`, `war.js:600`); o deus desenha | sim |
| `emo` | o sentimento do instante (`v.emo.k`) | o balão do deus e o humor do rosto no 3D | **não** (`save.js:84`) |
| `face` | `G.R() < 0,5 ? 1 : −1` | o lado do boneco do deus (`G.Render.sface`) — **não é rosto** | sim |
| `grp`, `role`, `home` | o mundo | a roupa (`G.Atmos.dress`) | sim |

- **Herança**: só «a cor do pai ou a da mãe» (sem mistura), pelo acaso do mundo.
- **Envelhecimento**: só o cabelo grisalho e a escala.
- **Tipos de corpo**: nenhum.
- **Mundos prontos** (`exp/povos.js`):
  - cidade: 138 pessoas, 4 povos, 14 peles, nenhum velho;
  - metrópole: 944 pessoas, 5 povos (asteca, grego, nórdico, egípcio, romano), 12 peles, 52 velhos, 21 sem um membro, 30
    grávidas; só 27 egípcios vivem entre astecas — os povos quase não se misturam;
  - mega: 720 pessoas, 13 peles, 25 sem membro, 28 grávidas.
  - Densidade máxima: 31 pessoas a 12 m de alguém (o raio do corpo fino), 53 a 20 m e 105 a 40 m (mega).
- `G.hash` (`util.js:87-92`) dá só 100.000 valores e multiplica fora do `Math.imul`. Serve aos enfeites, mas **o genoma deve
  usar um hash de 32 bits próprio** (`Math.imul`), com a semente do mundo misturada — senão o id 1 de todo mundo tem o mesmo
  rosto.

---

## 3. A vista do deus (2D)

`Art.villager` (`js/art.js:783-1147`):
- Uma pessoa tem ≈ 16 unidades de altura no zoom 1. A cabeça é um círculo de raio 2,05 na cor da pele.
- O cabelo é uma calota; a mulher tem cabelo comprido (`v.g === 'f'`); a barba vai por `v.id % 3` (`:1097`).
- O olho é um retângulo de 0,55 × 0,65 (`:1094`). A boca só aparece gritando, e a lágrima só no luto (`:1095-1096`).
- A escala muda só pela idade (`sc`, `:788`).
- Já desenha o braço perdido e a muleta da perna perdida (`:847, 856, 894, 1074`), o grupo e o frio pela mesma porta do 3D
  (`Art.rank` → `G.Atmos.dress`, `:776-782`).
- De longe, dois retângulos (`:793-798`).

**O que cabe ali, barato e pela mesma fonte do 3D** (uma função pura por id, guardada em cache):
- a altura (escala y ± 8%) e a largura do corpo (gordo, magro, musculoso: escala x do tronco);
- a silhueta do penteado (comprido, coque, careca, tranças, crespo volumoso) e a barba pelo genoma e pela idade, no lugar do
  `id % 3`;
- a cor da pele e do cabelo do genoma (a mesma do 3D);
- o grisalho (já existe), a corcunda do velho (rotação do tronco), a barriga da grávida.
- Rosto, nesse tamanho, não. Um rosto só caberia num **retrato** do painel da pessoa (`ui.js` `personHTML`, `:546`): um
  retrato 3D renderizado do rosto pelo próprio three.js, ou um retrato 2D vetorial pelos genes. Fica como pergunta aberta.

Custo: algumas operações de canvas por pessoa visível, desprezível (o deus desenha com nível de detalhe).

---

## 4. A proposta

### 4.1 Princípios
- **O genoma é do mundo** (nasce no passo do mundo, vai no save e no registro dos mortos), mas **nenhuma decisão o lê**. Só o
  desenho lê (o 3D, a vista do deus, um retrato).
- Ele é **puro**: o id, a semente do mundo, os genomas dos pais e o povo. **Nenhum sorteio do `G.R`**: o mundo continua byte a
  byte o mesmo (os sorteios de `skin` e `hair` de hoje ficam onde estão).
- Fenótipo **por herança e região, nunca ligado a moral, inteligência, crime ou ofício**. A maior parte dos genes de rosto tem o
  mesmo meio em todos os povos (a variedade dentro de um povo é maior que entre povos). Os povos diferem em pigmento, cabelo, olho e um pouco
  na altura, nas maçãs e no nariz. Nada de «a cara de bandido».
- **A vida deixa marca no corpo, pelo mundo** (como a roupa já lê o `G.Atmos.dress`): a idade, a gravidez, o membro perdido, a
  fome, os anos de um ofício pesado, a casa rica. O desenho lê esses campos; nada é guardado de novo.

### 4.2 O genoma — `G.Genoma` (`js/genoma.js`, puro)
- **28 genes** em `exp/genoma.js`, cada um com 2 alelos de 6 bits (0–63; 32 é o meio):
  - pele e pigmento: `melanina`, `subtom`;
  - cabelo: `cabeloCor`, `cabeloRuivo`, `cabeloTextura` (liso, ondulado, cacheado, crespo);
  - olhos: `olhoCor`, `olhosAfast`, `olhoTam`, `palpebra` (a dobra, o olho amendoado);
  - rosto: `cranio`, `rostoLongo`, `mandibula`, `queixo`, `macas`, `arcada`, `narizLongo`, `narizLargo`, `narizPonte`,
    `labios`, `orelhas`;
  - corpo: `altura`, `massa`, `musculo`, `ombros`;
  - pelos e pele: `barbaDens`, `calvicie`, `sardas`, `sobrancelha`.
  - Texto de 56 caracteres (base64url). Medido nos mundos prontos, contando vivos e mortos: +71 KB na metrópole (4,07 MB, +1,8%),
    +59 KB na mega (+1,6%) e +85 KB no de 100 anos (+2,2%).
  - Alternativa menor: haploide de 28 caracteres. Perde-se o «salta uma geração», mas ainda se parece com os pais.
- **Nascimento**: `G.Genoma.child(id, genMãe, genPai, semente)`. Cada alelo vem de um dos dois do pai ou da mãe, escolhido pelo
  hash do id do filho. Uma mutação pequena em 2% dos alelos.
  - Fenótipo = a média dos dois alelos (aditivo): os filhos regressam à média e os irmãos diferem.
  - Gêmeos (5%) são fraternos, porque os ids diferem.
- **Primeira geração** (quem nasce sem pais: o mundo novo, imigrantes, colonos de outro povo):
  `G.Genoma.founder(id, civ, sol, semente)`. Para cada gene, a média e o desvio do «povo fundador» (`POOL` por povo; o que não
  está na tabela fica com 32 ± 9), com a inversa da normal sobre o hash de 32 bits.
  - A região: a melanina do fundador anda com o sol da terra onde o povo começou (o clima da capital fundadora), ±6 unidades.
  - Os povos misturam pela vida do mundo (cativos, conquistas, casamentos reais, colonos) e a herança espalha.
- **Onde se escreve**:
  - uma linha no `Vg.create` (`villagers.js:85-99`): `gen: o.gen || G.Genoma.of(...)`, e `'gen'` na lista `SHAPE`;
  - o registro dos mortos (`village.js:2271-2275`: `gen: v.gen`), porque o pai morto antes do parto ainda passa os genes
    (`V.birth` lê `S.dead`, `:2207`);
  - o cadáver (`carnage.js:123`) e quem volta dos mortos (`beyond.js:117`) copiam;
  - o save leva sozinho (`save.js:82-92` copia a pessoa inteira).
- **Saves de antes, sem genoma**: o load preenche, em ordem de nascimento (`born`, depois o id), mortos e vivos.
  - Quem tem pais com genoma herda deles; quem não tem é fundador.
  - **Os genes de pigmento são postos a partir do `v.skin` e do `v.hair` salvos** (a inversa da tabela de cores), para a pessoa
    de antes continuar da mesma cor.
  - É um conserto do load, puro e determinístico (o mesmo save aberto duas vezes dá os mesmos genomas), que não decide nada do
    mundo (L-419).
  - Os mundos prontos sem genoma funcionam como saves de antes. Gerá-los de novo é o arquiteto que faz, depois da junção.
- **A cor da pele** — duas maneiras:
  - **(A)** O `v.skin` continua a verdade. O genoma só desloca o tom de leve. Os filhos de um casal misto saem da cor de um dos
    dois (como hoje).
  - **(B', recomendada)** O `v.skin` continua nascendo como hoje (os sorteios do `G.R` não mudam), mas **quem desenha lê a cor do
    genoma** (`G.Feicao.skin(v)`, a mesma nas duas vistas). Para quem nasceu antes do genoma, o pigmento vem do `v.skin`. O
    `v.skin` vira só a semente da cor dos de antes.
  - Numa versão que mude o mundo de qualquer forma (mundos prontos regerados, linha de base atualizada), tirar os sorteios de
    `skin` e `hair` do `Vg.create` (uma decisão D- própria).

### 4.3 Do genoma à forma — `G.Feicao` (`js/feicao.js`, só se vê)
Porta única: `G.Feicao.of(v)` → um objeto, em cache por id e refeito quando a idade passa de um degrau de 0,25 ano, ou quando
mudam a gravidez, o membro perdido, a casa ou o ofício (como o `sig` da roupa, `people3d.js:604`). Ele dá:
- **Os pesos de identidade** (≈ 16 a 20 alvos do rosto e do crânio) = os genes do rosto, atenuados no bebê (a identidade vai de
  0,4 ao nascer a 1,0 aos 16: os bebês são parecidos e o rosto se firma crescendo).
- **Os pesos da idade** (curvas contínuas da idade em anos, `v.age`):
  - `bebe` (0–2): crânio grande, rosto pequeno, bochecha cheia, nariz pequeno;
  - `crianca` (2–12);
  - `jovem` (12–20): a mandíbula e o nariz crescem, o rosto alonga;
  - `maduro` (40+): o sulco nasolabial e as pálpebras pesadas;
  - `velho` (60+): papada, maçãs caídas, lábio mais fino, nariz e orelhas maiores, as têmporas fundas.
  - Na pintura, as rugas (testa, pés de galinha, sulco) e as manchas sobem com a idade.
  - **A mesma pessoa é reconhecível** porque os pesos de identidade não mudam com a idade: a idade soma por cima.
- **O corpo**:
  - `altura` (± 8%, sobre o 1,75/1,65 de hoje: 1,61–1,89 m no homem);
  - `massa` (magro ↔ gordo) e `musculo`, e um pouco de `ombros`.
  - Gene, mais a vida pelo mundo: a casa rica engorda um pouco, a fome emagrece (o `G.Atmos` já lê a casa), anos de ofício
    pesado (ferreiro, construtor, mineiro, guerreiro) dão músculo.
  - Os corpos gordo, magro e musculoso são alvos do corpo inteiro (§4.5).
- **A gravidez**: o peso do alvo `gestante` = 1 − `v.preg`/(0,55·DAY_LEN), que só existe enquanto `v.preg > 0`.
- **O membro perdido** (`v.lost`):
  - alvos `cotoBracoE`, `cotoBracoD` (o braço termina acima do cotovelo, com o coto arredondado da argila) e `cotoPerna` (acima
    do joelho);
  - a manga cobre o coto (pintura);
  - a manqueira é da animação, pela causa `v.lost.leg`;
  - a muleta é uma coisa (D-440, «nada vem do nada»). O inventário (20c) precisaria dar uma `muleta` de madeira no kit de quem
    perdeu a perna, como o kit do ofício (`G.Inv.held`). Pergunta aberta.
  - **Só onde o mundo tem a causa**: nenhuma deficiência inventada.
- **As cores**: pele (melanina + subtom; o rubor e a ponta do nariz como hoje), cabelo (cor, ruivo, grisalho pela idade como
  hoje), íris (olhoCor), lábios (da pele), sardas.
- **O penteado e a barba**:
  - do povo e da época (as tabelas de hoje, `people3d.js:594, 632-657`), escolhidos pelo `cabeloTextura` e pela idade;
  - malhas novas: `crespo` (volume), `cacheado`, `ondulado`, `entradas` (a calvície que avança — `calvicie` × idade troca
    cheio → entradas → coroa → careca), `tranca-nordica`, `topete-asteca`;
  - barba pelo `barbaDens`, pelo costume do povo (o egípcio raspa, `people3d.js:651`) e pela idade, com o bigode e a barba
    rala; a barba por fazer é pintada.
- **As roupas e os acessórios**: os de hoje (`outfitOf` + `G.Atmos.dress`, muito bons), mais o que o mundo justifica e só se
  vê:
  - brinco e colar de quem tem joias (`I.joias`, `atmos.js:240`);
  - o kohl egípcio e a pintura de guerra asteca (pintura no rosto);
  - a faixa de cabeça.

### 4.4 O rosto
**A cabeça nova** (a parte artística central):
- **Uma topologia feita para mexer.** Uma «gaiola» de controle escrita em código (≈ 300 pontos em quadriláteros, como se modela
  uma cabeça low-poly à mão) com:
  - anéis em volta de cada olho (as bordas das pálpebras de cima e de baixo, a dobra);
  - anéis em volta da boca (o lábio de dentro e o de fora, o canto);
  - o sulco nasolabial, a ponte do nariz, a mandíbula e a orelha simplificada.
- Ela é subdividida uma ou duas vezes (Catmull-Clark, o modificador do Blender) e **projetada na argila** (`corpo_sdf.project`):
  a forma é a de hoje, com uma topologia limpa.
- Perto ≈ 4 mil triângulos (hoje 3,8 mil, bem mais mal distribuídos), no meio ≈ 700 e longe ≈ 120.
- As regiões são conhecidas pelo nome (a borda da pálpebra, o anel do lábio). Por isso **as expressões podem ser calculadas** por
  regra (giro da pálpebra em volta do centro do olho, giro da mandíbula na articulação, canto da boca puxado com decaimento) e
  gravadas como alvos.

**As peças**:
- **pálpebras de verdade**: uma faixa de pele sobre o globo, com espessura e sombra, e a linha dos cílios (geometria fina ou
  pintura no anel da borda);
- **o globo**: o de hoje (a íris desenhada na direção do olhar continua), com a abertura e a íris maiores, como na §1.4;
- **a boca de verdade**: a fenda dos lábios aberta na topologia, um saco escuro por dentro, uma fileira de dentes de cima e uma
  de baixo (≈ 60 triângulos) e a língua (≈ 20);
- **as sobrancelhas**: pintura sobre a UV (abaixo), mais grossas, ou uma tira de geometria baixa no perto.

**A pintura**:
- Uma UV para a cabeça (a gaiola tem a sua) e uma textura de máscaras do rosto, compartilhada, feita por código
  (`arte/texlib.py`), de 512²:
  - R a sobrancelha (a forma e a densidade por gene);
  - G os lábios e o contorno;
  - B as rugas por idade;
  - A sardas e a barba por fazer.
  - ≈ 150 a 250 KB em WebP. A pilha `tex3d.js` tem ≈ 0,8 MiB de folga (BÍBLIA §6).
- Os genes escolhem o quanto de cada máscara aparece. A pintura de hoje nas coordenadas do corpo (`b3face`) vira leitura da UV.
  Como a pintura vai presa ao ponto (a posição de antes do alvo, `vBind`), ela segue a forma.

**A luz da pele** (só se vê, barato):
- difusa com *wrap* e um tom quente no terminador (o *subsurface* falso);
- um brilho pequeno nos lábios e nos olhos (os olhos já têm);
- a oclusão (`aAO` já existe);
- um gradiente de pintura (a testa mais clara, o maxilar mais escuro, a olheira).
- Nada de mapa de normais fino: o estilo é low-poly limpo (a BÍBLIA §1, a calma de *Palia*).

**As expressões — os canais** (a porta do pilar da animação; FACS simplificado). Uma tabela fixa `G.Feicao.CANAIS`, com cada
canal em 0..1 (os pares E/D separados onde importa):
```
olhoFechaE, olhoFechaD      (piscar, sono, dor — pálpebra por osso, ver abaixo)
olhoArregala, olhoAperta    (medo/surpresa; riso/desconfiança)
sobrancelhaSobeDentro       (tristeza, medo, preocupação)
sobrancelhaSobeFora         (surpresa)
sobrancelhaDesce            (raiva, concentração)
bochechaSobe                (o sorriso de verdade)
narizFranze                 (nojo)
labioSobeCima               (nojo, desprezo)
sorrisoE, sorrisoD          (canto da boca para cima e para trás)
tristezaBoca                (canto para baixo)
bocaEstica                  (medo, dor: os lábios esticados)
bocaAperta                  (raiva contida, esforço)
bocaBico / bocaO            (o «u» e o «o»)
mandibula                   (abrir a boca — osso, ver abaixo)
mandibulaLado
bochechaInfla               (esforço, sopro)
lingua                      (raro)
```
- As emoções viram receitas desses canais, numa tabela `G.Feicao.EXPR`:
  - alegria = sorriso + bochecha + olhoAperta leve;
  - tristeza = sobrancelhaSobeDentro + tristezaBoca + olhar baixo;
  - raiva = sobrancelhaDesce + bocaAperta / mandíbula + olhoArregala leve;
  - medo = sobrancelhaSobe (dentro e fora) + olhoArregala + bocaEstica;
  - nojo = narizFranze + labioSobeCima;
  - surpresa = sobrancelhaSobeFora + olhoArregala + mandíbula;
  - dor = olhoAperta + bocaEstica + sobrancelhaDesce;
  - cansaço = olhoFecha 0,4 + boca solta;
  - embriaguez = olhoFecha 0,5 + sorriso torto (E ≠ D) + rubor;
  - choro = tristeza + olhoAperta + o tremor do queixo (o ritmo é da animação) + a lágrima (um efeito).
- **A fala** em 5 visemas: A (mandíbula), E/I (estica), O/U (bico), M/B/P (aperta), F/V (o lábio de baixo). O jogo não tem fala
  gravada: o pilar da animação os anima num ritmo de sílabas pela pessoa que fala.
- **Ossos novos e poucos**: `jaw` (mandíbula) e quatro pálpebras (`lidUE`, `lidUD`, `lidLE`, `lidLD`), acrescentados *ao fim*
  da lista de ossos (`bodymesh.js` `bones`; os índices de hoje ficam). A rotação dá a pálpebra que passa por cima do globo e a
  boca que abre num arco, coisas que um alvo linear achata. São 5 × 3 texels por linha, desprezível. O resto vai por alvos.
- **Os níveis**:
  - perto: todos os canais e ossos;
  - meio (12–26 m): mandíbula, piscar, sorriso e sobrancelhas (6 alvos);
  - longe: nada (o rosto pintado como hoje).

### 4.5 A técnica no 3D (dentro do `body3d.js` de hoje)
- **Os alvos numa textura compartilhada** (`uMorph`, RGBA16F) indexada pelo ponto: um atributo `aMorph` (o índice do ponto na
  tabela de alvos, ou −1) e `gl_VertexID` não é preciso. Uma «linha de alvos» por malha e nível.
- **Os pesos na linha da pessoa**: ≈ 12 texels a mais (48 pesos), depois dos 43 de hoje. Para não varrer 48 alvos em cada ponto,
  a linha leva uma lista compacta dos alvos ativos (índice e peso): a identidade com ≈ 20 sempre ativos, a expressão com 3 a 6.
- No vertex shader, antes do `b3skin`: `p += Σ wₖ·Δₖ(aMorph)` e `n += Σ wₖ·ΔNₖ` (normais só nos alvos de expressão e de
  corpo; a identidade pode ficar sem). **A passada da sombra ignora os alvos do rosto** (só os do corpo), o que corta o custo
  pela metade.
- **Cabelo, barba, chapéu e roupa seguem o corpo**: os alvos que mexem no crânio, na mandíbula e no corpo são **transferidos**
  para essas malhas no gerador (cada ponto do cabelo toma o deslocamento do ponto do couro cabeludo mais perto, com decaimento).
  As colisões do pano no shader (`CLOTH`: raios 0,17/0,2 do tronco, 0,092 da coxa…) ganham um fator de largura da pessoa (um
  texel), senão a barriga gorda atravessa a saia.
- **Custo** (estimativa; a medida de verdade na fase 1):

| | Hoje | Proposta |
|---|---|---|
| Triângulos de um corpo perto | 9.804 + cabelo e roupa (até ≈ 19,5 mil) | ≈ 10 mil + cabelo e roupa (a cabeça nova no lugar da velha) |
| Chamadas de desenho | 1 por malha usada no quadro (+ sombra) | igual; + os penteados novos que aparecerem (≈ +4 a 8 na rua cheia) |
| Alvos (perto) | 0 | ≈ 20 identidade + ≈ 18 expressão + ≈ 6 idade + ≈ 8 corpo |
| Busca de texel por quadro, alta (60 corpos; ≈ 30 perto × ≈ 2 mil pontos da cabeça × ≈ 26 ativos) | — | ≈ 1,6 M (os ossos de hoje já fazem 12 por ponto: até 60 × 4,9 mil × 12 ≈ 3,5 M) |
| Baixa (12 corpos) | — | ≈ 0,6 M — cabe no celular |
| Placa (alvos de todas as malhas e níveis, posição + normal em RGBA16F) | — | ≈ 2 a 4,5 MB |
| Arquivo (`bodymesh.js`) | 1,83 MB | + ≈ 0,4–0,6 MB (int8 a 0,15–0,2 mm, só os pontos que mexem) |
| CPU por pessoa e quadro | `Body3D.put` ≈ 43 texels | + 12 texels; `G.Feicao.of` em cache |
| Gerar (offline) | ≈ 10 min | + ≈ 2 min (cada alvo < 1 s; a transferência para ≈ 25 malhas) |

- **Alternativas**, com os seus custos:
  1. **Cabeças-base separadas** (6 a 8 por sexo, como os penteados). Cada uma +1 chamada de desenho (+1 de sombra) por cabeça
     visível, e a variedade continua de catálogo («cópias com pequenas alterações»). **Não.**
  2. **Malha própria por pessoa** (os alvos aplicados na CPU e uma geometria por pessoa). Quebra a multidão numa chamada; 90
     corpos = 90+ chamadas. **Não.**
  3. **`InstancedMesh` do three r170** (`setMorphAt`, `morphTexture`, `USE_INSTANCING_MORPH`, `js/lib/three.min.js`). Faz o
     mesmo, mas o jogo não usa `InstancedMesh` nos corpos: a pele e o pano são do shader próprio. Trocar o desenho inteiro por
     isso é um risco sem ganho. **Não**, mas a forma do three (uma textura de pesos por instância) é a mesma da recomendada:
     serve de referência.
  4. **Identidade cozida na CPU numa linha por pessoa** (as posições da cabeça já com a identidade, ≈ 2 mil texels por linha,
     ≈ 1,5 MB para 96 linhas; refeita só quando a pessoa entra na vista ou muda de idade). Medido em `exp/cozer.js`, com a
     máquina ocupada: 0,14 ms por cabeça; 30 que entram de uma vez dão 4,2 ms, que precisam ser repartidos entre quadros. No
     shader, 1 busca em vez de ≈ 20. **Reserva para o celular**, se a medida da fase 1 pedir.
  5. **A expressão na CPU** (os alvos somados em JS a cada quadro e enviados à placa): medido 1,7 ms por quadro só a soma, para
     30 pessoas e 6 alvos, mais o envio de 180 mil números por quadro. **Não.**

### 4.6 O caminho das malhas (pipeline)
- **Ficar no gerador de hoje** (`arte/corpo.py` + `corpo_forma`/`corpo_sdf`/`corpo_roupa`). Está provado que os alvos saem da
  argila em segundos. Acrescentar:
  - `arte/rosto_gaiola.py`: a gaiola da cabeça, as regiões e a UV;
  - `arte/rosto_alvos.py`: as variações da argila de identidade, da idade e do corpo, a projeção e as expressões por regra;
  - a transferência para o cabelo, a roupa e os chapéus;
  - o formato `v: 2` do `bodymesh.js`, com `morph: { malha: { idx, alvos: { nome: deltas } } }` e os ossos novos ao fim.
  - O `Body3D.init` recusa o formato que não entende (como hoje recusa o rig que discorda, `body3d.js:465-468`).
- **Prévias sem navegador**: `arte/corpo_prev.py` (o PIL), `qa/visual/corpo-rig.js` (a pele na CPU) e, para a luz de verdade,
  `arte/blender/foto.py`.
- **Licenças** (`arte/LICENCAS.md`): hoje tudo é original e feito por código. A proposta continua assim.
  - **Alternativa**: a base e os alvos do MakeHuman (CC0 desde a 1.1: idade, sexo, peso, músculo, proporções, centenas de alvos
    de rosto). Ganha-se tempo, mas o estilo é realista (choca com o low-poly estilizado), pesa (a malha de ≈ 13 mil quads pede
    retopologia) e precisa baixar os dados na máquina de quem gera.
  - Se entrar, vai uma linha nas licenças **antes** do commit. Recomendo só como referência de proporções.

---

## 5. As provas

### 5.1 O que já existe para as pessoas
- `qa/visual/corpo-rig.js`: a pele na CPU, sem navegador — a ligação bate, ninguém nu, a roupa com pano, o corpo não sai da saia.
  Exporta `P3`, `B3`, `bend`, `MESH`, `LOOK` (`:122`).
- `qa/visual/corpo-filme.js` + `arte/corpo_prev.py`: quadros da pele em movimento, sem navegador.
- `qa/visual/corpo-estudio.js`, `corpo-fotos.js` (o rosto de perto, o custo da multidão com 36 e 96), `andar.js`, `maos.js`.
- `qa/roupa.js`: a roupa lida do mundo, em Node. O r2, «o mesmo duas vezes é o mesmo», é o molde de uma prova de identidade.
- `qa/visual/bichos-olhos.js`: o molde de uma prova de olhos.

### 5.2 Provas novas
1. **`qa/genoma.js`** (Node, segundos a um minuto):
   - g1 puro: o mesmo nascimento dá o mesmo genoma; com e sem o módulo, `S.rng` e o hash do mundo iguais depois de 5 dias (só o
     campo `gen` difere).
   - g2 herança: filho mais perto dos pais que de estranhos; irmãos; avós; cada alelo do filho existe num dos alelos do pai ou
     da mãe.
   - g3 fundadores: as distribuições por povo e região; nenhum par idêntico em N mil.
   - g4 saves de antes: um save sem genoma abre; todos ganham um; o mesmo save aberto duas vezes dá os mesmos; a pele desenhada
     de quem já existia fica a ΔE < 3 do `v.skin`.
   - g5 o pai morto passa os genes; o registro dos mortos guarda o `gen`; o cadáver e quem volta dos mortos têm o rosto que tinham.
   - **g6 «ninguém decide pela aparência»**: o mesmo mundo vivido 10 dias com os genomas de verdade e com todos trocados por um
     genoma constante dá o mesmo hash do mundo, campo por campo, fora o `gen`. É a prova forte da regra.
   - g7 o peso do save.
2. **`qa/visual/rostos.js`** (Node, pela pele da CPU do `corpo-rig.js` + os alvos):
   - cada alvo é finito e dentro da caixa;
   - os pares E/D são espelhos;
   - **a pálpebra fechada cobre o globo** (raios da frente não acham ponto do olho com `olhoFecha = 1`);
   - **a boca em repouso fecha** (sem fresta);
   - **a mandíbula aberta mostra os dentes e não atravessa o pescoço**;
   - cabelo, barba e chapéu não deixam a cabeça passar em nenhuma combinação de identidade (o gordo, o crânio largo);
   - o pano não deixa o corpo gordo passar (como o «corpo não sai pela saia» de hoje);
   - o coto fecha (sem buraco).
   - E figuras do alinhamento (`corpo_prev`): por idade (0, 2, 5, 9, 14, 20, 35, 55, 70, 85), por sexo, por povo e por corpo.
3. **`qa/visual/rostos-fotos.js`** (navegador, pela fila; o molde é `exp/rostos-fotos.js`):
   - o alinhamento no jogo;
   - **a mesma pessoa ao longo dos anos** (a mesma `v` com `age` 5, 15, 25, 45, 70, lado a lado) e uma medida: a correlação dos
     recortes do rosto alinhados é maior entre «a mesma pessoa em idades diferentes» que entre «pessoas diferentes da mesma
     idade»;
   - **o retrato de família** (pais e três filhos);
   - as expressões nos três níveis;
   - o custo (chamadas, triângulos e o tempo do quadro com 30, 60 e 90 corpos, contra a linha de base).
4. **O verificador** (`qa/feicao-inv.js` → `QA.check`, depois `node qa/junta-inv.js`):
   - S3 toda pessoa viva tem um `gen` válido (tamanho e alfabeto);
   - S2 o alelo do filho vem do pai ou da mãe quando eles são conhecidos e têm genoma (pega quem escrever `gen` à mão);
   - S4 os pesos da linha desenhada são finitos.
5. **O guarda** (`qa/guard.js`, regras novas):
   - (a) `gen` só é escrito pelo `genoma.js`, pelo `Vg.create` (a linha da porta), pelas cópias do morto, do cadáver e de quem
     volta, e pelo load;
   - (b) **`.gen`, `G.Genoma` e `G.Feicao` só são lidos por arquivos do desenho** (`people3d`, `body3d`, `feicao`, `art`,
     `render`, o retrato da `ui`) e pelas cópias: um arquivo de decisão que os leia falha;
   - (c) `genoma.js` puro (como a regra 112: nem `G.S`, nem `G.R`/`G.VR`, nem `Math.random`, nem `Date`);
   - (d) todo canal que o pilar da animação pede existe no `G.Feicao.CANAIS` (como a regra 93 dos gestos);
   - (e) `feicao.js` só se vê (regra 113).

---

## 6. As fronteiras com os outros dois pilares

### 6.1 O pilar da animação (posa o rosto e o corpo)
**As portas que ele precisa**:
- **`pose.face`**: um `Float32Array(G.Feicao.CANAIS.length)` dentro da pose (o objeto que já existe: `POSE0`,
  `people3d.js:774`), escrito por ele a cada quadro e lido pelo `Body3D.put`.
  - O piscar, o olhar (`gazeX/Y`), o `lookY` e o `talk` de hoje viram canais ou ficam como estão.
  - A `MOOD` de hoje vira a tabela `G.Feicao.EXPR` (receitas iniciais pelos personagens; o pilar da animação a ajusta e a
    dirige no tempo).
- **`L.corpo`** (só leitura, do `G.Feicao.of`):
  - `altura`, `massa`, `musculo`, `idade` (o degrau e o contínuo), `gestante`;
  - `falta: { bracoE, bracoD, perna }` (a manqueira, um braço só nos clipes de duas mãos);
  - `forca`, que já existe em `L.str`.
  - O andar do velho, do gordo e da grávida se adapta lendo isso.
- **As proporções da criança** (pernas curtas): pedem comprimentos de osso por pessoa no `P3.rig` (as constantes `LEG.L1`,
  `RIG.shin`, `AU`, `AF` e o pescoço viram números da pessoa) e na IK. Esse arquivo é da animação: **uma fase juntos** (§8,
  fase 5). Até lá, a criança é a escala de hoje mais o alvo da idade.

### 6.2 O pilar social (nunca lê a aparência)
- Nenhuma decisão lê `gen`, `G.Feicao` ou a cor (regra (b) do guarda e prova g6).
- A atração, a confiança, o preconceito e a reputação vêm da personalidade, da memória e dos fatos, nunca do rosto, da pele ou
  do corpo.
- **Recomendo a regra mais simples: o social não lê nada do corpo** (só o que o mundo já usa: idade, sexo, doença, membro
  perdido — esses são do mundo, não da aparência).

### 6.3 Quem é dono do quê (proposta)

| Arquivo | Dono | Os outros |
|---|---|---|
| `js/genoma.js` (novo, puro), `js/feicao.js` (novo, só se vê) | personagens | só leem (o social, nunca) |
| `arte/corpo*.py`, `arte/rosto*.py` (novos), `js/bodymesh.js` (gerado) | personagens | — |
| `js/body3d.js` (o shader: alvos, pele, pintura do rosto) | personagens | a animação só pelos canais (`pose.face`) e os ossos novos |
| `js/look3d.js` (novo: `lookFill`, `outfitOf`, `IRIS`, `HAIRS`, tirados do `people3d.js`) | personagens | — |
| `js/anim-face.js` (novo: `MOOD`→`EXPR` no tempo, piscar, olhar, fala, `faceOf`, tirados do `people3d.js`) | animação | personagens dão a tabela inicial |
| `js/people3d.js` (o laço do quadro, o rig) e `js/anim-*.js` | animação | personagens: a chamada do `G.Feicao` e os ossos novos no `P3.rig` (o mínimo, dito) |
| `js/villagers.js` (`Vg.create`, `SHAPE`), `js/village.js` (registro dos mortos), `carnage.js`, `beyond.js`, `save.js` (o preenchimento do load) | o mundo | personagens: uma linha cada, dita |
| `js/art.js` (`Art.villager`) | (vista do deus) | personagens: a altura, a largura, o penteado, a barba e a cor pelo `G.Feicao` |
| `qa/genoma.js`, `qa/visual/rostos*.js`, `qa/feicao-inv.js` | personagens | — |

As regras de faixa: os números L-/D-/T- e as regras do guarda são dados pelo arquiteto, como na `JOGABILIDADE.md` §6.

---

## 7. Riscos
1. **A arte da cabeça é o trabalho difícil**: a gaiola em código, as regiões e as expressões por regra. É preciso olho de
   modelador e muitas prévias. Mitigação: começar pela gaiola com prévias diárias (`corpo_prev`, `foto.py`) e validar 5 rostos
   com o dono antes de gerar 50 alvos.
2. **O pano e o cabelo contra os corpos novos**: a barriga gorda e o crânio largo atravessam a saia, a capa, o elmo. Mitigação:
   a transferência dos alvos, o fator de largura nas colisões do `CLOTH` e a prova «nada passa» em todas as combinações.
3. **O custo no celular**: busca de texel no vertex shader em celulares fracos. Mitigação: medir na fase 1; a alternativa 4 (a
   identidade cozida por linha); a passada da sombra sem alvos de rosto; o meio com 6 alvos.
4. **O vale da estranheza**: um rosto que mexe demais num corpo low-poly. Mitigação: amplitudes moderadas, olhos estilizados
   e não realistas, a calma da BÍBLIA.
5. **A determinância**: um load que preencha genomas fora de ordem, ou um hash que dependa da ordem de iteração. Mitigação: a
   ordem (`born`, id) e as provas g1 e g4.
6. **Os vizinhos de arquivo**: os três pilares no `people3d.js` ao mesmo tempo. Mitigação: o corte da §6.3 *antes* das ondas
   (um commit do arquiteto que só move funções, com as provas de hoje passando).
7. **A expectativa «AAA»**: o alvo é o low-poly estilizado de acabamento profissional (BÍBLIA §1), não rosto fotorrealista. É
   bom dizer isso ao dono com as fotos da fase 2.

---

## 8. O plano em fases

| Fase | O quê | Provas | Muda o mundo? |
|---|---|---|---|
| **0. O corte** (o arquiteto) | `look3d.js` e `anim-face.js` saem do `people3d.js`, sem mudar nada; a BÍBLIA §6 com o orçamento novo da pessoa | todas as de hoje do corpo (`corpo-rig`, `roupa`, `andar`, encarna e11) iguais | não |
| **1. O genoma** | `js/genoma.js` (puro); `gen` no `SHAPE`, no `Vg.create`, no morto, no cadáver, em quem volta; o load preenche; `G.Feicao` dá a cor (B') e a altura ±8% no 3D e na vista do deus | `qa/genoma.js` g1–g7; o verificador; as regras do guarda (a), (b), (c); a vida curta; `qa/det3.js` | só o campo novo no save (os sorteios iguais) |
| **2. A cabeça nova** | a gaiola, a UV, as pálpebras, a boca por dentro, o olho estilizado, a luz da pele; os ossos `jaw` e pálpebras; o formato `bodymesh v2` | `corpo-rig`, `rostos.js` (pálpebra, boca), fotos de perto e de meia distância com o dono | não |
| **3. A identidade e a idade** | os alvos de identidade (≈ 20) e de idade (≈ 6) por projeção; transferência ao cabelo, à barba e aos chapéus; a textura de máscaras (rugas, sardas, sobrancelha); penteados novos (crespo, cacheado, ondulado, entradas); a mesma pessoa reconhecível ao longo dos anos | `rostos.js`, `rostos-fotos.js` (alinhamento, anos, família), o custo contra a linha de base | não |
| **4. O corpo** | gordo, magro, musculoso, ombros, gestante, os cotos; as colisões do pano com a largura; a vida no corpo (casa rica, fome, ofício pesado) | «nada passa» em todas as combinações; `roupa.js`; `corpo-rig` | não |
| **5. Com a animação** | `pose.face` e os canais (a tabela `EXPR`, os visemas); `L.corpo` para o andar; os comprimentos de osso da criança no `P3.rig` e na IK | as da animação (`andar`, `maos`, `corpo-rig`, `movimento`) e `rostos-fotos` com expressões | não |
| **6. A vista do deus e o retrato** | altura, largura, penteado, barba, corcunda, barriga pelo `G.Feicao` no `Art.villager`; o retrato no painel da pessoa (pergunta aberta) | `fidelidade`-like: as duas vistas da mesma pessoa batem na cor e na silhueta | não |

**Antes da versão**: a regressão inteira (`qa/regress.sh`). Os mundos prontos são regerados pelo arquiteto depois da fase 1, para
levar o `gen`.

---

## 9. Perguntas abertas para o arquiteto
1. **O olho estilizado** (abertura ≈ 1,4×, íris ≈ 1,15×, cílio e sobrancelha de contraste) contra a proporção real que a
   BÍBLIA §12 registrou. Quem decide é o A1 e o dono, com fotos.
2. **A cor da pele**: (A) o `v.skin` continua a verdade, ou (B') o desenho lê o genoma e o `v.skin` vira só a semente dos de
   antes? Quando tirar os sorteios de `skin`/`hair` do `Vg.create` (é uma mudança do mundo)?
3. **Genoma diploide (56 caracteres) ou haploide (28)?** O diploide dá o «puxou ao avô» e custa ≈ 2% de save (metade disso o
   haploide).
4. **A câmera de conversa** (o rosto a ≈ 1,2 m ao falar com alguém): é do `cam3d.js` (20b). Entra neste patch?
5. **A muleta**: uma coisa do kit no `G.Inv.held` (20c), de madeira, para quem perdeu a perna, como o kit do ofício. «Nada vem do
   nada» pede que ela tenha origem. Ou a muleta fica fora do 3D?
6. **A vida no corpo** (a casa rica engorda, a fome emagrece, o ofício dá músculo): o dono quer? É bonito e tem causa no mundo,
   mas exige cuidado para não virar estereótipo de classe.
7. **O retrato no painel da pessoa** (a tela do deus): um retrato 3D renderizado do rosto, ou nenhum?
8. **O corte do `people3d.js`** (§6.3) antes de as ondas começarem: o arquiteto faz?
9. **MakeHuman (CC0)** como fonte de dados: sim, não, ou só como referência?

---

## Apêndice — os experimentos e as figuras
- `exp/malha.js` — os triângulos e as medidas da cabeça e dos olhos, de cada nível (Node).
- `exp/povos.js` — os mundos prontos: povos, idades, peles, cabelos, membros perdidos, grávidas, densidade (Node).
- `exp/morfos.py` — os alvos de identidade tirados da argila na malha de hoje (python3, 5 s). Figuras:
  - `morfos/morfos-1.png`: a base, a mandíbula larga, o rosto longo, o nariz longo, o nariz largo;
  - `morfos/morfos-2.png`: lábios, maçãs, arcada, queixo, crânio;
  - `morfos/morfos-mistos-1.png` e `-2.png`: seis rostos misturados por um hash, de frente e de três quartos.
  - (São a argila sem a pintura do shader: servem para julgar a forma e a topologia.)
- `exp/genoma.js` — o genoma diploide, a herança e as distâncias (Node, 0,1 s).
- `exp/rostos-fotos.js` — as fotos do jogo (navegador, pela fila): rostos de perto e a meia distância (nórdicos, asteca de 18
  anos, egípcia, grego e romana velhos, criança, bebê, sem braço, grávida), cinco humores num rosto, a vista «como a foto do
  celular» e o custo com 30, 60 e 90 corpos. A pasta é `personagens/fotos/` (ver a nota no fim, se houver).

## Nota da 22a — as folhas de cinco rostos (`personagens/`)
As mesmas cinco pessoas da metrópole pronta (um nórdico jovem, uma egípcia adulta, um asteca jovem, uma grega idosa, um romano
idoso), de perto (0,85 m), pelo desenho do jogo (`qa/visual/rostos-fotos.js`, `Q=media`, parte `cinco`).
- `cinco-rostos-0-antes.jpg` — antes da 22a (7555851): o olho pintado sem pálpebra, a boca uma linha, os cinco com a mesma
  estrutura.
- `cinco-rostos-1-primeira.jpg` — a primeira folha da cabeça nova (fase 3, 77366a8): as pálpebras, os cílios, o brilho e a
  sobrancelha já se leem. As notas do arquiteto sobre ela: o olhar de boneca assustada (o branco em cima e embaixo da íris), a boca
  ainda uma linha, as manchas escuras nas bochechas e no queixo, a sobrancelha listrada, os cinco ainda com a mesma estrutura — e,
  das nossas, o vermelho na beira da sombra forte demais (lido como ruge a alguns passos).
- O que mudou por elas (D-557): o olho calmo no repouso (a pálpebra de cima sobre 13% da íris, a de baixo na borda; o branco só no
  canal `wide`), a boca com o arco, o volume, a cor, a sombra e os cantos, o rosto que não se sombreia a si mesmo no mapa de sombra
  (as manchas eram isso, não a oclusão nem as normais), a sobrancelha com forma e fios, os alvos de identidade com alcance de ver a
  alguns passos, a luz quente da pele estreita e fraca.
