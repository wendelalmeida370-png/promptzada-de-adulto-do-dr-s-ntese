# Licenças — tudo o que vai no jogo publicado, de onde veio e o que pode

Inventário mantido pelo A1. Regra do estúdio: só entra no jogo o que é **original** (feito por código aqui) ou tem
**licença verificada** que permite redistribuir junto do jogo — e entra **embutido** (o jogo abre do disco, `file://`:
nada de buscar arquivo, CDN ou rede em tempo de execução). Coisa nova de fora: acrescente uma linha aqui *antes* do commit.

## A confirmação (a versão publicada, 19/10/2026)

- **Nenhum asset de jogo comercial.** Nenhuma textura, modelo, som, letra ou trecho de código veio de jogo comercial nem
  de loja de assets. Todo o visual é feito por código aqui (as texturas, as malhas, o corpo das pessoas, o céu, a água,
  a luz); o som é sintetizado na hora; de fora vêm só o three.js (MIT) e duas fontes (OFL), na tabela abaixo — e, desde
  o P8 dos interiores 2.0 (23/11/2026), as fotografias de materiais do Poly Haven, de domínio público (CC0), que a Alta e
  a Ultra usam dentro dos prédios (a seção «As texturas fotografadas dos interiores», com cada uma).
- **Nada baixado em tempo de execução.** O jogo só lê os próprios arquivos — os scripts do `index.html` e, quando o
  jogador escolhe um mundo pronto, o `worlds/<nome>.js` dele (`js/ready.js`), do mesmo lugar de onde o jogo abriu. Não há
  CDN, fonte de fora, `fetch`, XHR nem WebSocket no código; as texturas são `data:` embutidos no `js/tex3d.js` (e, na Alta e
  na Ultra, nos `js/tex3d-alta-<nome>.js`, que o jogo pede do mesmo lugar por uma tag de script, como os mundos prontos), e as
  letras, `data:` embutidos no `css/style.css`. O `<link>` do Google Fonts que o `index.html` ainda tinha (as mesmas duas
  fontes, só quando havia internet) **saiu nesta versão**: as embutidas já eram as usadas.
- Como foi conferido: `grep -n "https\?://" index.html` (nada), `grep -ln "fetch(\|XMLHttpRequest\|WebSocket\|import("
  js/*.js` (nada), `grep -n "Loader" js/*.js` fora do `js/lib/` (nada), nenhum arquivo de imagem, som ou fonte solto no
  jogo (`find` por png/jpg/webp/ogg/mp3/wav/woff/ttf/glb/svg fora de `qa/`: nada).

## O que vai dentro do jogo

| O quê | Onde no código | Origem | Licença |
|---|---|---|---|
| **three.js r170** (o motor do 3D) | `js/lib/three.min.js` | npm `three@0.170.0`, empacotado uma vez como script comum por `tools/vendor-three.sh` (esbuild) | **MIT** — Copyright 2010-2024 Three.js Authors; o aviso está na primeira linha do arquivo |
| **As texturas da pilha** — 49 materiais: madeiras, pedras, telhados, chãos, casca, porta, ferro, tecidos, corda, couro, pelo, vime; os chãos e as plantas da natureza (musgo, agulhas, lama, seixos, folhagem, ramos); os das outras culturas (cantaria, mármore, tégula, caiação, madeira pintada, adobe, arenito, estuque, tezontle) | `js/tex3d.js` (gerado; lido pelo `js/ground3d.js`, `G.Ground3D.tex`/`texGLSL`, e usado pelo chão, prédios, plantas e pessoas) | **Originais**: feitas por código em `arte/texturas.py` + `arte/texlib.py`, com `arte/mat_objetos.py` e `arte/mat_culturas.py` (A1) e `arte/mat_natureza.py` (A3) — ruído, células e traços; nenhuma foto, nenhuma imagem de terceiros | do projeto |
| **As texturas altas dos interiores** (P8) — 14 materiais de dentro na Alta e na Ultra: 10 fotografias (o reboco, o tabuado, a terra batida, a lajota, as lajes, a madeira, a viga, as tábuas, a pedra, o barro) e 4 figuras do projeto em 1024 (o mosaico, o friso, a esteira, o tapete) | `js/tex3d-alta.js` (o manifesto) e `js/tex3d-alta-<nome>.js` (gerados pelo `arte/tex_alta.py`; lidos só pelo `js/ground3d.js`, `G.Ground3D.hiWant`) | as fotografias: **Poly Haven** (polyhaven.com), cada uma com o autor e os arquivos na seção «As texturas fotografadas dos interiores»; as 4 figuras: **originais** (`arte/mat_dentro.py`) | fotografias: **CC0** (domínio público); figuras: do projeto |
| **As malhas feitas no Blender** — `dragao` e `dragao2` (as cabeças da cumeeira), `runa` (pedra rúnica), `portal` (portal entalhado), `empena` (cabeça de cavalo e voluta), `casco` (casco de navio), `banca` (banca de feira) | `js/mesh-<nome>.js` (gerados), lidos pelo `js/mesh3d.js` (`G.Mesh3D`); postos pelo `js/build3d.js` (A2) e, o casco, pelo `js/fx3d.js` (A5) | **Originais**: modeladas por código no Blender (`arte/blender/<nome>.py`) e escritas por `arte/blender/exporta.py` | do projeto (o que se cria com o Blender é de quem cria; a GPL do Blender vale para o programa, não para a obra) |
| **As coisas que se seguram e se vestem (20d)** — as formas 3D dos 23 tipos do catálogo em cada material (47 chaves, três níveis cada) e as suas figuras da tela do inventário (47 imagens WebP de 128 × 128, embutidas como `data:`) | `js/itemforma.js` (as receitas, código), `js/itemarte.js` (a porta `G.ItemArt`), `js/itemicons.js` (as figuras, gerado) | **Originais**: as formas modeladas por código aqui (secções varridas, superfícies de dois parâmetros, o veio e as lascas por uma função de espalhamento), sem nenhum modelo, foto ou textura de fora; as figuras fotografadas dessas formas pelo próprio three.js do jogo, na luz do jogo, no Chromium sem tela (`qa/visual/itens-figuras.js`) | do projeto |
| **O corpo das pessoas** — corpos, olhos, cabelos, barbas, roupas, com ossos e pesos | `js/bodymesh.js` (gerado), lido pelo `js/body3d.js` e pelo `js/people3d.js` | **Original** (A4): formas por campos de distância em NumPy (`arte/corpo_forma.py`, `arte/corpo_sdf.py`, `arte/corpo_roupa.py`), simplificadas pelo Blender e escritas por `arte/corpo.py` | do projeto |
| **As letras da interface e da HUD**: **Nunito** (o texto) e **Cinzel** (nomes e títulos), variáveis, só as letras latinas (todos os acentos do português) | embutidas em `css/style.css` (os dois `@font-face` no fim do arquivo, WOFF2 em base64), com o aviso de copyright e da licença no comentário logo acima | npm `@fontsource-variable/nunito@5.3.0` (`nunito-latin-wght-normal.woff2`, 39 KB) e `@fontsource-variable/cinzel@5.3.0` (`cinzel-latin-wght-normal.woff2`, 26 KB) | **SIL Open Font License 1.1** — Copyright 2014 The Nunito Project Authors (github.com/googlefonts/nunito); Copyright 2020 The Cinzel Project Authors (github.com/NDISCOVER/Cinzel); sem nome reservado; o texto inteiro das duas licenças em `arte/licencas/Nunito-OFL.txt` e `arte/licencas/Cinzel-OFL.txt` |
| **A curva de tons** "PBR Neutral" (com o pé dos escuros aliviado pelo A5) | `js/realm3d.js` (`gxTone`, no `GXGRADE`; a mesma curva no pós, `js/post3d.js`) | transcrita do three.js r170 (`NeutralToneMapping`), que a tirou da referência do Khronos Group (KhronosGroup/ToneMapping) | **MIT** (three.js); a referência do Khronos é **Apache-2.0** — as duas permitem redistribuir com aviso; o aviso do three.js está no `js/lib/three.min.js` |
| **Técnicas escritas aqui a partir de artigos** (técnica não tem licença; nenhum código copiado): a sombra de contato SAO (McGuire, Mara e Luebke, 2012) e o brilho em escada de imagens menores (*dual filter*, Bjørge 2015) no `js/post3d.js`; as sombras suaves que procuram quem faz sombra e alargam a penumbra com a distância (PCSS, Fernando 2005, num disco de Vogel) no `js/realm3d.js`, remendando os pedaços de shader do three.js (MIT); o ruído curto `fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453)`, fórmula de uso geral e domínio público | `js/post3d.js`, `js/realm3d.js` | escritas aqui | do projeto |
| **Os mundos prontos** | `worlds/*.js`, abertos pelo `js/ready.js` | gerados pelo salto do próprio jogo (`qa/prontos.js`) | do projeto |
| **O som e a música** | `js/audio.js` | sintetizados na hora (WebAudio: osciladores, ruído e eco feitos pelo código); nenhum arquivo de som | do projeto |
| Todo o resto: a simulação, o 3D, a interface, os textos | `js/*.js`, `css/style.css`, `index.html` | escrito aqui | do projeto |

A OFL deixa usar, embutir e redistribuir as fontes com o jogo, inclusive comercialmente; não deixa vendê-las sozinhas, e
pede que o aviso de copyright e a licença as acompanhem: o aviso e o nome da licença estão no comentário do
`css/style.css` junto das fontes, e o texto inteiro das duas licenças em `arte/licencas/`. **Ao publicar**, essa pasta vai
junto com o jogo (ou, se a publicação for uma página só, o texto das duas OFL vai num comentário dela). A licença MIT do
three.js pede o aviso de copyright junto do código: está na primeira linha do `js/lib/three.min.js`.

## As texturas fotografadas dos interiores (P8, D-770)

Na Alta e na Ultra, os materiais de dentro (o reboco caiado, o tabuado, a terra batida, a lajota, as lajes, a madeira dos
móveis, a viga, as tábuas da parede, a pedra, o barro) são **fotografias do Poly Haven** (polyhaven.com), todas **CC0**
(domínio público: usar, mudar e redistribuir sem pedir nem citar — a citação vai aqui por cortesia e para refazer). Cada uma
foi neutralizada pelo `arte/tex_alta.py` (a luz grande tirada, o brilho sobre a média, o matiz calmado: a cor é a do povo, a do
mundo) e vai embutida nos `js/tex3d-alta-<nome>.js` (base64, WebP); o mosaico, o friso, a esteira e o tapete são as figuras do
`arte/mat_dentro.py` refeitas em 1024 (do projeto). Um comando refaz tudo: `python3 arte/tex_alta.py --raw PASTA` (os arquivos
baixados ficam na `PASTA`, fora do repositório, conferidos pelo md5 que a API do Poly Haven dá). A tabela abaixo é escrita por
ele; o `qa/guard.js` cobra que toda fotografia do `js/tex3d-alta.js` esteja aqui (regra 321).

<!-- tex_alta: início -->
| Material | Textura (Poly Haven) | Autor(es) | Arquivos (2K, JPG) | Licença |
|---|---|---|---|---|
| `caiado` | **Painted Plaster Wall** — https://polyhaven.com/a/painted_plaster_wall | Amal Kumar | https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/painted_plaster_wall/painted_plaster_wall_diff_2k.jpg · https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/painted_plaster_wall/painted_plaster_wall_nor_gl_2k.jpg · https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/painted_plaster_wall/painted_plaster_wall_rough_2k.jpg · https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/painted_plaster_wall/painted_plaster_wall_ao_2k.jpg | **CC0** |
| `tabuado` | **Wood Planks** — https://polyhaven.com/a/wood_planks | Amal Kumar | https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/wood_planks/wood_planks_diff_2k.jpg · https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/wood_planks/wood_planks_nor_gl_2k.jpg · https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/wood_planks/wood_planks_rough_2k.jpg · https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/wood_planks/wood_planks_ao_2k.jpg | **CC0** |
| `terra` | **Clay Floor 001** — https://polyhaven.com/a/clay_floor_001 | Dimitrios Savva, Rico Cilliers | https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/clay_floor_001/clay_floor_001_diff_2k.jpg · https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/clay_floor_001/clay_floor_001_nor_gl_2k.jpg · https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/clay_floor_001/clay_floor_001_rough_2k.jpg · https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/clay_floor_001/clay_floor_001_ao_2k.jpg | **CC0** |
| `lajota` | **Terracotta Floor Tiles** — https://polyhaven.com/a/terracotta_floor_tiles | Dimitrios Savva | https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/terracotta_floor_tiles/terracotta_floor_tiles_diff_2k.jpg · https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/terracotta_floor_tiles/terracotta_floor_tiles_nor_gl_2k.jpg · https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/terracotta_floor_tiles/terracotta_floor_tiles_rough_2k.jpg · https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/terracotta_floor_tiles/terracotta_floor_tiles_ao_2k.jpg | **CC0** |
| `lajes` | **Floor Tiles 04** — https://polyhaven.com/a/floor_tiles_04 | Rob Tuytel | https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/floor_tiles_04/floor_tiles_04_diff_2k.jpg · https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/floor_tiles_04/floor_tiles_04_nor_gl_2k.jpg · https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/floor_tiles_04/floor_tiles_04_rough_2k.jpg · https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/floor_tiles_04/floor_tiles_04_ao_2k.jpg | **CC0** |
| `madeira` | **Oak Veneer 01** — https://polyhaven.com/a/oak_veneer_01 | Jenelle van Heerden | https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/oak_veneer_01/oak_veneer_01_diff_2k.jpg · https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/oak_veneer_01/oak_veneer_01_nor_gl_2k.jpg · https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/oak_veneer_01/oak_veneer_01_rough_2k.jpg · https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/oak_veneer_01/oak_veneer_01_ao_2k.jpg | **CC0** |
| `viga` | **Rough Wood** — https://polyhaven.com/a/rough_wood | Rob Tuytel | https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/rough_wood/rough_wood_diff_2k.jpg · https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/rough_wood/rough_wood_nor_gl_2k.jpg · https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/rough_wood/rough_wood_rough_2k.jpg · https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/rough_wood/rough_wood_ao_2k.jpg | **CC0** |
| `tabuas` | **Weathered Planks** — https://polyhaven.com/a/weathered_planks | Dario Barresi, Dimitrios Savva | https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/weathered_planks/weathered_planks_diff_2k.jpg · https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/weathered_planks/weathered_planks_nor_gl_2k.jpg · https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/weathered_planks/weathered_planks_rough_2k.jpg · https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/weathered_planks/weathered_planks_ao_2k.jpg | **CC0** |
| `pedra` | **Castle Wall Variation** — https://polyhaven.com/a/castle_wall_varriation | Rob Tuytel | https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/castle_wall_varriation/castle_wall_varriation_diff_2k.jpg · https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/castle_wall_varriation/castle_wall_varriation_nor_gl_2k.jpg · https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/castle_wall_varriation/castle_wall_varriation_rough_2k.jpg · https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/castle_wall_varriation/castle_wall_varriation_ao_2k.jpg | **CC0** |
| `barro` | **Clay Plaster** — https://polyhaven.com/a/clay_plaster | Amal Kumar | https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/clay_plaster/clay_plaster_diff_2k.jpg · https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/clay_plaster/clay_plaster_nor_gl_2k.jpg · https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/clay_plaster/clay_plaster_rough_2k.jpg · https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/clay_plaster/clay_plaster_ao_2k.jpg | **CC0** |
<!-- tex_alta: fim -->

## Ferramentas (não vão no jogo)

| Ferramenta | Para quê | Licença |
|---|---|---|
| Python 3, NumPy 2.4, Pillow 12.3 (libwebp) | fabricar as texturas (`arte/texturas.py`, `arte/mat_*.py`), o corpo (`arte/corpo*.py`), a folha de contato (`arte/folha.py`) e os lado a lado das fotos (`qa/visual/compara.py`) | PSF; BSD-3; MIT-CMU (HPND); libwebp BSD-3 |
| DejaVu Sans (a letra dos rótulos da folha de contato, do sistema) | só nas imagens de conferência, nunca no jogo | Bitstream Vera / DejaVu (livre, redistribuível) |
| Blender 5.0.1 como módulo Python (`bpy`, no venv do rascunho; com NumPy 1.26, SciPy) | modelar e exportar malhas (`arte/blender/`), simplificar o corpo (`arte/corpo.py`), fotografar modelos (Cycles na CPU) | GPL-2.0-or-later (o programa; o Cycles é Apache-2.0); SciPy BSD-3; a obra criada é do autor |
| Node 22, Playwright + Chromium (SwiftShader) | testes e fotos (`qa/`, `qa/visual/`) | MIT; Apache-2.0; BSD-3 (SwiftShader Apache-2.0) |
| esbuild | empacotar o three.js uma vez (`tools/vendor-three.sh`) | MIT |

## Rede nesta máquina (verificado em 14/10/2026)

- **Bloqueados** (sem resposta): polyhaven.com, ambientcg.com, kenney.nl, quaternius.com, blender.org — por isso não há
  textura, HDRI nem modelo de terceiros: tudo é feito por código. **Mudou em 23/11/2026:** a API e os arquivos do Poly Haven
  (`api.polyhaven.com`, `dl.polyhaven.org`) passaram a responder — de lá vêm as fotografias CC0 dos interiores (P8); o
  ambientCG responde à API, mas os arquivos dele (`acg-download.struffelproductions.com`) seguem bloqueados.
- **Funcionam**: pypi.org, registry.npmjs.org (de onde vieram as fontes), raw.githubusercontent.com,
  fonts.googleapis.com (os testes bloqueiam este de propósito, para ver o jogo como ele abre sem internet).
- Arquivo baixado é dado, não programa: fica numa pasta própria do rascunho e só se lê (ex.: as fontes do npm).
