# Licenças — tudo o que entra no jogo, de onde veio e o que pode

Inventário mantido pelo A1. Regra do estúdio: só entra no jogo o que é **original** (feito por código aqui) ou tem
**licença verificada** que permite redistribuir junto do jogo — e entra **embutido** (o jogo abre do disco, `file://`:
nada de buscar arquivo, CDN ou rede em tempo de execução). Coisa nova de fora: acrescente uma linha aqui *antes* do commit.

## O que vai dentro do jogo

| O quê | Onde | Origem | Licença |
|---|---|---|---|
| As texturas da pilha (madeiras, pedras, telhados, chãos, casca, porta, ferro, tecidos, corda, couro, pelo, vime, musgo e os chãos da mata; e, na onda 2, as das outras culturas: cantaria, mármore, tégula, caiação, madeira pintada, adobe, arenito, estuque, tezontle) | `js/tex3d.js` | **Originais**: geradas por código em `arte/texturas.py`, `arte/texlib.py`, `arte/mat_*.py` (ruído, células, traços — nenhuma foto, nenhuma imagem de terceiros) | do projeto |
| Malhas feitas no Blender: `dragao` (cabeça da cumeeira), `runa` (pedra rúnica), `portal` (portal entalhado), `empena` (cabeça de cavalo e voluta), `casco` (casco de navio), `banca` (banca de feira) | `js/mesh-*.js` | **Originais**: modeladas por código no Blender (`arte/blender/*.py`) e exportadas por `arte/blender/exporta.py` | do projeto (o que se cria com o Blender é de quem cria; a GPL do Blender vale para o programa, não para a obra) |
| O corpo das pessoas (malha com ossos, rosto, cabelos, roupas) | `js/bodymesh.js` (gerado), `js/body3d.js` | **Originais**: superfícies de distância modeladas por código em NumPy (`arte/corpo*.py`, do A4) | do projeto |
| Leitor de malhas | `js/mesh3d.js` | escrito aqui | do projeto |
| A curva de tons "PBR Neutral" do pós-processamento | `js/post3d.js` (função `neutral`) | transcrita do three.js r170 (`NeutralToneMapping`), que a tirou da referência do Khronos Group (KhronosGroup/ToneMapping) | **MIT** (three.js); a referência do Khronos é **Apache-2.0** — as duas permitem redistribuir com aviso; o aviso do three.js está no `js/lib/three.min.js` |
| As técnicas do pós-processamento: sombra de contato (SAO — McGuire, Mara e Luebke, 2012) e brilho em escada de imagens menores (*dual filter*, Bjørge 2015) | `js/post3d.js` | **escritas aqui** a partir dos artigos publicados (técnica não tem licença; nenhum código copiado) | do projeto |
| three.js r170 | `js/lib/three.min.js` | three.js (npm `three@0.170.0`), empacotado como script comum por `tools/vendor-three.sh` (esbuild) | **MIT** — Copyright 2010-2024 Three.js Authors (o aviso está na primeira linha do arquivo) |
| Fonte **Nunito** (a letra da interface) | embutida em `css/style.css` (`@font-face`, WOFF2 em base64) | npm `@fontsource-variable/nunito@5.3.0`, arquivo `nunito-latin-wght-normal.woff2` (variável 200–1000, letras latinas, 39 KB) | **SIL Open Font License 1.1** — Copyright 2014 The Nunito Project Authors; sem nome reservado; texto em `arte/licencas/Nunito-OFL.txt` |
| Fonte **Cinzel** (nomes e títulos) | embutida em `css/style.css` | npm `@fontsource-variable/cinzel@5.3.0`, `cinzel-latin-wght-normal.woff2` (variável 400–900, 26 KB) | **SIL Open Font License 1.1** — Copyright 2020 The Cinzel Project Authors; sem nome reservado; texto em `arte/licencas/Cinzel-OFL.txt` |
| As mesmas duas fontes, pelo Google Fonts | `<link>` no `index.html` | fonts.googleapis.com (só quando há internet; as embutidas, declaradas depois, são as usadas) | OFL 1.1 |

A OFL deixa usar, embutir e redistribuir as fontes com o jogo, inclusive comercialmente; não deixa vendê-las sozinhas, e
pede que o aviso de copyright e a licença as acompanhem (estão em `arte/licencas/`). O subconjunto latino cobre todos os
acentos do português.

## Ferramentas (não entram no jogo)

| Ferramenta | Para quê | Licença |
|---|---|---|
| Python 3, NumPy 2.4, Pillow 12.3 (libwebp) | fabricar as texturas (`arte/texturas.py`, `arte/mat_*.py`), o corpo (`arte/corpo*.py`), a folha de contato (`arte/folha.py`) e os lado a lado das fotos (`qa/visual/compara.py`) | PSF; BSD-3; MIT-CMU (HPND); libwebp BSD-3 |
| DejaVu Sans (a letra dos rótulos da folha de contato, do sistema) | só nas imagens de conferência, nunca no jogo | Bitstream Vera / DejaVu (livre, redistribuível) |
| Blender 5.0.1 como módulo Python (`bpy`, no venv do rascunho; com NumPy 1.26, SciPy) | modelar e exportar malhas (`arte/blender/`), fotografar modelos (Cycles na CPU) | GPL-2.0-or-later (o programa; o Cycles é Apache-2.0); SciPy BSD-3; a obra criada é do autor |
| Node 22, Playwright + Chromium (SwiftShader) | testes e fotos (`qa/`, `qa/visual/`) | MIT; Apache-2.0; BSD-3 (SwiftShader Apache-2.0) |
| esbuild | empacotar o three.js uma vez (`tools/vendor-three.sh`) | MIT |

## Rede nesta máquina (verificado em 14/10/2026)

- **Bloqueados** (sem resposta): polyhaven.com, ambientcg.com, kenney.nl, quaternius.com, blender.org — por isso não há
  textura, HDRI nem modelo de terceiros: tudo é feito por código.
- **Funcionam**: pypi.org, registry.npmjs.org (de onde vieram as fontes), raw.githubusercontent.com,
  fonts.googleapis.com (os testes bloqueiam este de propósito, para ver o jogo como ele abre sem internet).
- Arquivo baixado é dado, não programa: fica numa pasta própria do rascunho e só se lê (ex.: as fontes do npm).
