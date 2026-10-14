# Licenças — tudo o que entra no jogo, de onde veio e o que pode

Inventário mantido pelo A1. Regra do estúdio: só entra no jogo o que é **original** (feito por código aqui) ou tem
**licença verificada** que permite redistribuir junto do jogo — e entra **embutido** (o jogo abre do disco, `file://`:
nada de buscar arquivo, CDN ou rede em tempo de execução). Coisa nova de fora: acrescente uma linha aqui *antes* do commit.

## O que vai dentro do jogo

| O quê | Onde | Origem | Licença |
|---|---|---|---|
| As 31 texturas da pilha (madeiras, pedras, telhados, chãos, casca, porta, ferro, tecidos, corda, couro, pelo, vime) | `js/tex3d.js` | **Originais**: geradas por código em `arte/texturas.py`, `arte/texlib.py`, `arte/mat_*.py` (ruído, células, traços — nenhuma foto, nenhuma imagem de terceiros) | do projeto |
| Malhas (hoje: a cabeça de dragão da cumeeira nórdica) | `js/mesh-*.js` | **Originais**: modeladas por código no Blender (`arte/blender/*.py`) e exportadas por `arte/blender/exporta.py` | do projeto (o que se cria com o Blender é de quem cria; a GPL do Blender vale para o programa, não para a obra) |
| Leitor de malhas | `js/mesh3d.js` | escrito aqui | do projeto |
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
| Python 3, NumPy 2.4, Pillow 12.3 (libwebp) | fabricar as texturas (`arte/texturas.py`) e a folha de contato (`arte/folha.py`) | PSF; BSD-3; MIT-CMU (HPND); libwebp BSD-3 |
| Blender 5.0.1 como módulo Python (`bpy`, no venv do rascunho; com NumPy 1.26, SciPy) | modelar e exportar malhas (`arte/blender/`), fotografar modelos (Cycles na CPU) | GPL-2.0-or-later (o programa); a obra criada é do autor |
| Node 22, Playwright + Chromium (SwiftShader) | testes e fotos (`qa/`) | MIT; Apache-2.0; BSD-3 |
| esbuild | empacotar o three.js uma vez | MIT |

## Rede nesta máquina (verificado em 14/10/2026)

- **Bloqueados** (sem resposta): polyhaven.com, ambientcg.com, kenney.nl, quaternius.com, blender.org — por isso não há
  textura, HDRI nem modelo de terceiros: tudo é feito por código.
- **Funcionam**: pypi.org, registry.npmjs.org (de onde vieram as fontes), raw.githubusercontent.com,
  fonts.googleapis.com (os testes bloqueiam este de propósito, para ver o jogo como ele abre sem internet).
- Arquivo baixado é dado, não programa: fica numa pasta própria do rascunho e só se lê (ex.: as fontes do npm).
