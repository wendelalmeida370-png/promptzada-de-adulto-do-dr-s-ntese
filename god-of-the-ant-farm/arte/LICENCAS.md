# Licenças — tudo o que vai no jogo publicado, de onde veio e o que pode

Inventário mantido pelo A1. Regra do estúdio: só entra no jogo o que é **original** (feito por código aqui) ou tem
**licença verificada** que permite redistribuir junto do jogo — e entra **embutido** (o jogo abre do disco, `file://`:
nada de buscar arquivo, CDN ou rede em tempo de execução). Coisa nova de fora: acrescente uma linha aqui *antes* do commit.

## A confirmação (a versão publicada, 19/10/2026)

- **Nenhum asset de jogo comercial.** Nenhuma textura, modelo, som, letra ou trecho de código veio de jogo comercial nem
  de loja de assets. Todo o visual é feito por código aqui (as texturas, as malhas, o corpo das pessoas, o céu, a água,
  a luz); o som é sintetizado na hora; de fora vêm só o three.js (MIT) e duas fontes (OFL), na tabela abaixo.
- **Nada baixado em tempo de execução.** O jogo só lê os próprios arquivos — os scripts do `index.html` e, quando o
  jogador escolhe um mundo pronto, o `worlds/<nome>.js` dele (`js/ready.js`), do mesmo lugar de onde o jogo abriu. Não há
  CDN, fonte de fora, `fetch`, XHR nem WebSocket no código; as texturas são `data:` embutidos no `js/tex3d.js`, e as
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
| **As malhas feitas no Blender** — `dragao` e `dragao2` (as cabeças da cumeeira), `runa` (pedra rúnica), `portal` (portal entalhado), `empena` (cabeça de cavalo e voluta), `casco` (casco de navio), `banca` (banca de feira) | `js/mesh-<nome>.js` (gerados), lidos pelo `js/mesh3d.js` (`G.Mesh3D`); postos pelo `js/build3d.js` (A2) e, o casco, pelo `js/fx3d.js` (A5) | **Originais**: modeladas por código no Blender (`arte/blender/<nome>.py`) e escritas por `arte/blender/exporta.py` | do projeto (o que se cria com o Blender é de quem cria; a GPL do Blender vale para o programa, não para a obra) |
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
  textura, HDRI nem modelo de terceiros: tudo é feito por código.
- **Funcionam**: pypi.org, registry.npmjs.org (de onde vieram as fontes), raw.githubusercontent.com,
  fonts.googleapis.com (os testes bloqueiam este de propósito, para ver o jogo como ele abre sem internet).
- Arquivo baixado é dado, não programa: fica numa pasta própria do rascunho e só se lê (ex.: as fontes do npm).
