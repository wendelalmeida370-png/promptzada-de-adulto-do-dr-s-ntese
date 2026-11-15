# Estúdio virtual — Visual Evolution Overhaul do Modo Encarnado

Equipe de agentes que melhora a **aparência** do Modo Encarnado sem tocar no que o mundo é. Este arquivo é o contrato
comum: leia inteiro antes de mexer em qualquer coisa. O líder (o agente que coordena) é o único que integra no branch
principal; cada especialista trabalha no seu worktree e entrega commits no seu branch.

## 1. A regra que não se discute

O 3D **só desenha** o que `G.S` diz. Nada aqui muda o mundo, a economia, a guerra, o save. Os arquivos do 3D estão na lista
do "só se vê" do `qa/guard.js` (regra 9): não sorteiam com `G.R`, não gravam campos que a simulação lê. Variação visual de
uma coisa vem do **id dela** (`G.hash(b.id)`, `G.hash(v.id)`, `G.hash(t.id)`): a mesma casa é sempre a mesma casa, de
qualquer ângulo, em qualquer sessão, vista do alto ou de perto. Efeitos passageiros (partículas, piscar) usam `G.VR()`.
Estado de módulo começa de novo a cada mundo (`G.worldHooks`). Leia `CLAUDE.md` (as fundações) — vale para todos.

Proibido: reescrever o renderer, o controlador do corpo (`avatar.js`: física, colisão, locomoção), a posse (`possess.js`),
os modos (`modes.js`), o gerador do mundo, a cidade (`urban.js`), o save. Mudar posição, tamanho (footprint) ou colisão de
uma construção. Trocar a escala. Introduzir outro motor. Depender de internet/CDN em tempo de execução.

## 2. Contratos técnicos

- **Unidades**: 1 unidade do 3D = 1 metro. Uma casa do mapa = 4 m (`G.Space.TILE`); uma unidade de altura = 1,5 m
  (`G.Space.HM`). Y para cima, X para leste, Z para o sul. Onde algo está vem de `G.Space` (`toWorld`, `of`, `floorY`…).
- **Construções** (`build3d.js`): cada prédio é desenhado dentro da sua caixa de footprint `b.x..b.x+b.w`, `b.y..b.y+b.h`
  (casas do mapa), em metros locais a partir do canto (`K.box(x, y, z, sx, sy, sz, cor)` etc.). A cultura vem de
  `styleOf(b)` / a paleta `K.P` (de `arch.js`, que o Modo Deus também usa — **não editar** `arch.js`); o material de cada
  peça é o padrão `g.pat` (`Build3D.PAT`). Variantes: escolhidas por `G.hash(b.id ...)`, nunca por sorteio.
- **Pessoas** (`people3d.js`): a aparência vem de `P3.look(v)` (pele, cabelo, roupa do ofício e do povo, idade, sexo);
  a pose vem de `G.Anim3D.pose(estado, t, vel)` e é misturada por `Anim.blend`; o rig é a cadeia de quadros em `P3.body`
  (pelve → tronco → pescoço; ombro → antebraço → mão; coxa → canela → pé). O corpo jogado (`P3.avatar`, alimentado por
  `avatar.js`) usa a mesma pose e o mesmo desenho. A interface `P3.body(idx, X, Y, Z, yaw, pose, L, marker)` e os estados
  de `ST` são o contrato com o resto do jogo.
- **Materiais** (a pilha de texturas): `arte/texturas.py` fabrica, `js/tex3d.js` guarda (gerado — não editar à mão),
  `G.Ground3D.tex()` / `G.Ground3D.U3()` dão a pilha e seus uniformes, `G.Ground3D.texGLSL()` dá as funções GLSL
  `m3raw(camada, uv)`, `m3col(t)`, `m3slope(camada, uv, h)` e as constantes `M3_<NOME>` (camada) e `M3S_<NOME>`
  (1 / metros que a figura cobre). Cada camada = cor do material dividida pela própria média (×0,5) + altura no alfa:
  **cor final = cor que o mundo dá × `m3col`** — o Modo Deus e o 3D continuam com as mesmas cores. Enquanto a pilha não
  carregou (`uTexOn == 0`), cada material desenha como antes (o padrão procedural) — esse é o fallback, não removam.
  Material novo: um arquivo `arte/mat_<area>.py` com uma lista `MATS` no mesmo formato de `arte/texturas.py`
  (`(nome, função, metros, descrição)`); o `texturas.py` junta todos. Rodar `python3 arte/texturas.py` regenera
  `js/tex3d.js` (≈3 min). Orçamento: 512×512 por material, ≤ 6 MB de base64 no total.
- **Malhas feitas fora** (Blender como módulo Python, em `/tmp/.../scratchpad/venv`, `bpy` instalado): exportadas para um
  `js/<nome>.js` de dados (sem `fetch`: o jogo abre por `file://`, e o WebGL não aceita imagens/arquivos de outra origem).
  Formato: `G.MESH3D.<nome> = { pos: base64(Float32), nor: base64(Int8 normalizado), idx: base64(Uint16|Uint32),
  col/uv/skin opcionais }`, decodificadas por um leitor pequeno. Escala em metros, Y para cima, frente para +Z.
- **Qualidade**: `G.Realm.Q()` dá o preset (`baixa`, `media`, `alta`; campos `shadows`, `grass`, `detail`, `npcs`,
  `field`, `view`, `near`, `scale`). Só o especialista de renderização acrescenta/muda presets; os outros **leem** os
  campos para escalar o que fazem (ex.: decoração só com `detail`).
- **Provas próprias de cada módulo**: cada módulo do 3D tem (ou ganha) um `X.check()` que devolve a lista do que está
  errado no seu desenho (peça fora da caixa, NaN, flutuando, contagem impossível) — o QA as junta nos testes.
- **Fotos**: `qa/visual/fotos.js` (vistas fixas: mesma semente, lugar, câmera, hora, qualidade) e
  `qa/visual/compara.py` (antes | depois). Toda entrega mostra fotos antes/depois das vistas que mudaram.
- **A máquina**: 4 núcleos; um navegador de teste (o 3D por software) usa ~2. **Todo teste que abre navegador passa por
  `bash qa/navegador.sh ...`** (no máximo 2 ao mesmo tempo, os outros esperam). Testes:
  `PLAYWRIGHT=/opt/node22/lib/node_modules/playwright`, ex.:
  `PLAYWRIGHT=... bash qa/navegador.sh node qa/encarna.js /tmp/x` (`ONLY=e11,e12` para partes).
  `node qa/guard.js` (1 s) antes de cada commit.

## 3. Quem é dono de quê

| Agente | Pode editar | Entrega |
|---|---|---|
| **Líder** (Technical Director) | `index.html`, `js/realm3d.js` núcleo (classe `Geo`, `R3.mat`, `init()` exceto os blocos de material dos outros, chunks, `R3.frame`), `js/modes.js`, `js/main.js`, `js/space.js`, `qa/guard.js`, `qa/AUDIT.md`, `README.md`, `CLAUDE.md`, a seção "materiais" de `js/ground3d.js` (`G3.tex`, `U3`, `texGLSL`) | integração, merges, testes globais, aprovação |
| **A1 Art Director & Pipeline** | `arte/` (exceto `mat_<area>.py` dos outros), `js/tex3d.js`, `js/mesh3d.js` (leitor de malhas), `css/style.css`, `js/incui.js` (a HUD) | bíblia de arte, texturas, exportador Blender → JS, manifesto de licenças, HUD |
| **A2 Arquitetura** | `js/build3d.js`, `js/props3d.js` (novo: decoração contextual), `js/things3d.js` (lampiões, carroças e as outras coisas do mundo; desde a onda 2), `arte/mat_arquitetura.py` | casas, telhados, vigas, portas, janelas, fundações, variantes, decoração por função |
| **A3 Terreno & Natureza** | `js/ground3d.js` (exceto a seção "materiais"), `js/grass3d.js`, em `js/realm3d.js`: `shadeAt`, `normalAt`, `terrainGeo`, `roadGeo`, `KIND`, `TPAL`, `tpal`, `leafCol`, `crownOf`, `BARK`, `barkCol`, `treeInto`, `floraGeo`, `GRASS`, `FLOWER`, `grassGeo`, `R3.treeMesh` e os blocos `MAT.flora`, `MAT.leaf`, `MAT.plant` do `init()`; `arte/mat_natureza.py` | chão com texturas e transições, árvores, arbustos, pedras, capim, flores, costas |
| **A4 Personagens & Animação** | `js/people3d.js`, `js/body3d.js` (novo), `js/bodymesh.js` (gerado), `arte/corpo*.py`; em `js/avatar.js` **só** `animate()` e a linha que alimenta `P3.avatar` | corpo contínuo com pele, rosto, cabelos, roupas por cultura/ofício, animações, bichos |
| **A5 Luz, Materiais & Renderização** | em `js/realm3d.js`: `QUAL`/`Q`/`setQuality`, `toon()`, o bloco do renderer/luzes/`ShaderChunk` no `init()`, `applyQuality`, `resize`, `light()`, `WATER`, `waterCol`, `WGeo`, `wetCorner`, `waterGeo`, `makeOcean`, o bloco `MAT.water`/`MAT.ice`; `js/fx3d.js`; `js/cam3d.js` (só enquadramento/FOV); `js/post3d.js` (novo: pós-processamento) | luz do dia/tarde/noite, sombras, AO, tone mapping, céu, névoa, água, presets (incl. `ultra`) |
| **A6 QA & Desempenho** | `qa/visual/` (novos testes, medidas, relatórios), testes novos em arquivos próprios `qa/visual/*.js`; nada em `js/` | baseline, medidas (draw calls, triângulos, ms por quadro *relativos* — a máquina não tem GPU), caça a problemas, regressão |

Arquivo fora da sua coluna: **não edite** — escreva no relatório o que precisa e o líder decide. Linhas de `<script>` novas
no `index.html`: pode acrescentar a sua, no bloco do Modo Encarnado, e avisar no relatório.

## 4. Como entregar

1. Trabalhe só no seu worktree; commits pequenos com mensagem em português (o que e por quê). Sem push, sem force,
   sem rebase de trabalho alheio.
2. Antes de cada commit: `node qa/guard.js`; para o 3D, as partes do `qa/encarna.js` que tocam a sua área
   (e11 desenho, e12 o mundo no 3D, e13/e14/e15 corpo) via `qa/navegador.sh`; o verificador (`QA.check`) limpo;
   nenhum `G.modErr`, nenhum erro de página.
3. Fotos antes/depois (`qa/visual/fotos.js` no worktree antigo e no seu) das vistas que a sua mudança afeta; olhe-as
   de verdade (frente, fundos, de cima, perto) — critério de aceite é ficar **visivelmente melhor**, não só sem erro.
4. Relatório final curto: o que mudou (arquivos), fotos (caminhos), testes rodados e resultado, custo (triângulos,
   draw calls), o que ficou pendente, o que precisa de outro agente/do líder.

## 5. Direção de arte (resumo — a bíblia completa é `arte/BIBLIA.md`, do A1)

Stylized high-fidelity fantasy: formas legíveis e orgânicas (nada de caixas cruas), materiais com grão e desgaste,
cores harmoniosas e naturais (verdes de musgo e capim, não neon; madeira quente; pedra fria), luz que dá volume,
névoa que dá profundidade, detalhe concentrado onde o olho para (portas, janelas, beirais, rostos, mãos) e calma no resto.
Cada cultura com sua linguagem (nórdico: madeira escura, turfa, cabeças de dragão; clássico: reboco e telha; grego:
branco e azul; egípcio: adobe; asteca: reboco pintado e terraços). Hedeby (nórdica, mundo pronto `cidade`) é o piloto.

## 6. Onda 2 (a retomada)

- **O ponto de partida é o branch `integracao`** (as entregas da onda 1 de todos, juntas e testadas pelo líder). Primeiro
  comando no worktree novo: `git merge --ff-only integracao`. O líder junta as entregas da onda 2 nele por merge; para ver
  o trabalho de um colega antes disso, leia o branch dele (`git log/show worktree-agent-<id>`) — sem editar.
- Trabalho deixado pela metade na onda 1 (sem commit): `scratchpad/pendente/A2-wip.patch` e `A4-wip.patch`
  (`git apply`). O que um especialista pediu a outro está em `scratchpad/a<N>/pedidos.md` — leia os pedidos a você.
- A catraca do navegador (`qa/navegador.sh`, 2 vagas) é de todos: rodadas longas só com `RAPIDO=1`; nada de laço que
  segura a vaga sem precisar. Quatro núcleos para seis agentes: gere texturas/malhas uma vez, não em laço.
- **Revisão cruzada**: o A1 revisa a imagem de todos (arte/REVISAO.md); o A6 roda a rodada nos branches de cada um e
  escreve o que achou em `scratchpad/a6/achados-<agente>.md`. Leia o que é para você antes de cada entrega.
- **A porta da integração** (o líder, antes de levar o `integracao` ao branch principal): `qa/guard.js`, `qa/visual/guarda3d.js`, `qa/visual/corpo-rig.js` (Node, segundos), a parte e11 do `qa/encarna.js` (o 3D desenha sem erro de módulo) e a vida curta (`qa/soak.js`). Só guard + soak não bastam: eles não abrem o 3D (L-109, T-043).
- Onda 5 (generalizar): o que ficou bom em Hedeby (nórdico) passa às outras culturas — clássico (romano), grego,
  egípcio, asteca —, cada uma com a sua linguagem (§5). Fotos: as vistas `metropole-*` e mundos com as outras culturas.
