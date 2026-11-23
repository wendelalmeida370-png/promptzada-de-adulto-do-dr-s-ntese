# Os interiores 2.0 — o contrato técnico do piloto da taverna (D-650 a D-664)

O plano para o dono está em [`interiores-2.md`](interiores-2.md). Este é o contrato da equipe: as frentes, quem é dono de cada
arquivo, as portas novas, as peças novas do catálogo com as medidas, os números reservados das regras e das entradas do
`qa/AUDIT.md`, as provas e como se junta. **Leia também o `CLAUDE.md` da raiz inteiro** (o protocolo e as fundações valem para cada
linha), o `arte/BIBLIA.md` e o `arte/ESTUDIO.md`, e os relatórios da auditoria (os caminhos no §8).

## 1. As frentes e as ondas

| Onda | Frente | O que entrega | Alcance |
|---|---|---|---|
| 1 | **P1 — A luz e os materiais de dentro** | o volume de luz assado da planta, a sombra de contato, as fontes com causa, as luzes de verdade sem vazar pela parede (1 com sombra na Alta, 2 na Ultra), a janela aberta de cada povo, o olho que se acostuma, o material de dentro com brilho na Alta, os materiais de dentro (chão, parede, teto, madeiras por povo e riqueza) com UV, o defeito do plano liso a ~2,2 m, o interior feito aos pedaços e a cidade recortada pelas portas | **todo interior** |
| 1 | **P2 — Os móveis modelados** | o caminho do Blender (o `bpy` no venv do scratchpad) → `js/movelmesh.js`; a porta `G.Movel3D`; o desenho por instâncias no `build3d.js`; o conjunto da taverna de cada povo (§4); a escada aberta; as folhas da porta | o conjunto da taverna, e a volta às caixas de hoje onde não houver modelo |
| 1 | **P3 — A planta da taverna** | as receitas novas da taverna (a taberna de 8 m, a taverna de 12 m, a hospedaria de 16 m) com zonas, corredor e variantes por povo e riqueza; as peças novas no catálogo (§4); o salão até o telhado; o `In.VERSION` e o catálogo gerado de novo | a família da taverna |
| 1 | **P4 — A câmera, a tela e a entrada do corpo** | o olho no terreiro (defeito), a quarta parede, a entrada sem salto, a lente pela tela, a «Vista da sala», o corpo em trama de perto, a tela pelo lugar, o «Travar» que não mira através da parede, o corpo que não entra nos móveis, o degrau da porta da taverna que sobe sem pulo | **todo interior** |
| 1 | **P6 — As pessoas dentro, no desenho** | o ato por cima do lugar (beber, brindar, servir, tocar, comer, conversar com as mãos, brigar de pé), os gestos a dois dentro, o andar pela planta (`In.pathIn`), entrar e sair desenhados pela porta, o chapéu e o elmo que saem, a roupa com causa (o avental, a faixa, o xale, o tingido, os penteados), a ferramenta que flutua sem corpo | **todo interior** (só se vê) |
| 2 | **P5 — A decoração com causa** | a porta `G.Atmos.within(b)` (pura) e o desenho `G.Dentro3D` (`js/dentro3d.js`): o que cada prédio mostra e por quê, nos encaixes dos móveis, nas paredes, no teto; as fontes de luz da decoração (`G.Dentro3D.fontes`); o verificador `qa/dentro-inv.js` | a taverna inteira; o básico com causa em todo interior |
| 2 | **P7 — A vida da taverna no mundo** | a taverna cheia à noite (a hora, os amigos juntos), o freguês à mesa com banquinho, o taverneiro levando a caneca à mesa, o músico com instrumento de verdade (com a origem), a entrada e a saída pela porta (o mundo espera a caminhada), cada um no seu lugar (o repartidor sem empurrar), a porta que abre para quem passa e a da taverna aberta na hora dela, o bebê no colo em todo prédio, a taverna «cheia» com lugares vazios | o mundo (pede as provas de mundo igual) |

**A ordem de juntar** (o supervisor): P3 → P2 → P1 → P4 → P6 na primeira onda; depois P5 → P7. Os mundos prontos são gerados de
novo pelo supervisor, uma vez, depois das frentes que mudam o mundo.

## 2. Quem é dono de cada arquivo

Cada frente só muda os seus arquivos. **Um arquivo de outra frente, só pelo supervisor** (peça no relatório o que precisa).

| Frente | Arquivos (e, no `build3d.js`, só a parte dita) |
|---|---|
| P1 | `js/luz3d.js` (novo), `js/ceu3d.js`, `js/fx3d.js`, `js/realm3d.js` (os materiais e os sombreadores; o corte do material de dentro da quarta parede, **pela porta da P4** — §3), `js/post3d.js`, `arte/mat_dentro.py` (novo), `arte/texturas.py` (o orçamento), `js/tex3d.js` (gerado), e no `js/build3d.js` **a casca de dentro**: os chãos, as paredes, os tetos, as janelas, o `g.ao` de dentro, o `FIRE_K`, o plano liso, o feitio do interior aos pedaços e o recorte da cidade |
| P2 | `arte/blender/moveis*.py` (novos), `js/movelmesh.js` (novo, gerado), `js/movel3d.js` (novo), no `js/build3d.js` **o `FURN`, o `piece`, o desenho dos móveis no `B3.interior`, a escada e as folhas da porta**, `qa/visual/malhas.js` (o orçamento da biblioteca dos móveis) |
| P3 | `js/interiors.js` (a gramática: o `P.*`, as células, as zonas, o `VERSION`, a migração — **não** o repartidor de lugares nem o `doorState`, que são da P7), `js/int-trabalho.js`, `js/int-familias.js` (só a família da taverna e da hospedaria), `js/int-moveis.js`, `js/int-catalogo.js` (gerado pelo `qa/catalogo.js`), as folhas `qa/categorias/*.js` da taverna |
| P4 | `js/cam3d.js`, `js/incui.js`, `js/input3d.js`, `js/modes.js`, `css/style.css`, `js/avatar.js` (a colisão com os móveis), `js/space.js` (só o degrau da porta da taverna, se for seguro — é parte do mundo), e no `js/build3d.js` **só o registro da caixa de corte do olho** na lista dos cortes |
| P6 | `js/people3d.js`, `js/anim-body.js`, `js/look3d.js`, `js/vida3d.js`, `js/anim-*.js`, `js/*-clips.js` (os gestos que precisar), no `js/atmos.js` **só o `G.Atmos.dress`** (a roupa com causa; o `within` é da P5), e no `js/build3d.js` **só o `openPlace`** |
| P5 | `js/atmos.js` (a porta `within`), `js/dentro3d.js` (novo), `qa/dentro-inv.js` (novo) |
| P7 | `js/villagers.js`, `js/act-taverna.js`, `js/tavern.js`, `js/act-lar.js` (o bebê no colo), no `js/interiors.js` **só o repartidor de lugares (`In.places`), o `doorState` e o `walkIn`**, e o instrumento (`js/itens.js`, `js/itemforma.js`, o `ORIGEM.md`) |

**Os de todos** (o supervisor junta): o `qa/AUDIT.md` (cada frente escreve **só na sua subseção** da seção 23), o `qa/guard.js`
(cada frente acrescenta regras **com os seus números**, §5, no fim do arquivo), o `index.html` (as linhas dos arquivos novos já estão
lá, pelo contrato), o `CLAUDE.md` (**ninguém mexe**: cada frente escreve no relatório as linhas que propõe, e o supervisor as põe).

## 3. As portas novas

- **`G.Luz3D`** (P1, `js/luz3d.js`, só se vê): o volume de luz assado da planta de um interior aberto — `G.Luz3D.of(b)` → o volume
  (a textura 3D e a transformação do lote) ou `null`; `G.Luz3D.at(x, y, z)` → `{ ceu, fogo }` no ponto (para o olho que se acostuma).
  Puro: a mesma planta e as mesmas fontes, o mesmo volume; guardado por planta e pela assinatura das fontes.
- **`G.Movel3D`** (P2, `js/movel3d.js`, só se vê): `has(kind, civ, w, d)`, `geo(kind, civ, w, d, lod)` (a geometria do
  `G.MESH3D` `movel-*`, com as partes por material: `madeira`, `madeira2`, `ferro`, `bronze`, `pano`, `barro`, `palha`, `pedra`,
  `couro`), `anchors(kind, civ, w, d)` → `[{ k: 'tampo' | 'prateleira' | 'gancho' | 'nicho', x, y, z, w, d }]` no quadro da peça (onde a
  decoração pousa; a P5 usa). Sem modelo, `has` diz `false` e o `FURN` de hoje desenha.
- **`G.Dentro3D`** (P5, `js/dentro3d.js`, só se vê): `fontes(b)` → `[{ x, y, z, cor: [r, g, b], forca, raio, tremor }]` (no quadro do lote,
  em metros: as lamparinas e as velas que a decoração põe, cada uma com a sua causa) — **a P1 já a chama: o contrato deixa um esboço
  que devolve `[]`**; `draw(b, plan, ...)` o desenho.
- **`G.Atmos.within(b)`** (P5, pura, no `atmos.js`): o que o prédio mostra e por quê (a bebida, a comida, as ferramentas, os panos, a
  riqueza de agora, as lamparinas acesas, o desgaste) — só lê o mundo, escolhe pelo `G.hash` do id, nunca sorteia.
- **A caixa de corte do olho** (P4): o `G.Cam3D.cutBox()` → a caixa entre o olho e o corpo, ou `null`; a P4 a põe na lista dos cortes
  do `build3d.js`; **a P1 faz o material de dentro respeitar os cortes** como o de fora já respeita (o `M3CUT`). Até a P1 juntar, a P4
  prova com a colisão (o protótipo do agente D) e com o lado de fora.
- **A «Vista da sala»** (P4): uma ação do `Input3D.def` (a tecla e o botão), que o jogador aperta — o olho sobe acima do teto cortado.

## 4. As peças novas do catálogo (a P3 põe, a P2 modela)

Medidas em metros (largura × fundo × altura), no quadro da peça (a frente para +Z; quem usa fica na frente). A P3 pode mudar uma
medida **só pedindo ao supervisor** (a P2 está modelando com ela).

| Peça | Medidas | Lugares | Notas |
|---|---|---|---|
| `banquinho` | 0,40 × 0,40 × 0,45 | 1 «sentar» **em cima** (o quadril a 0,45) | o freguês da mesa; de cada povo (o banquinho de três pés, o de couro, o de junco) |
| `mesa-redonda` | 0,90 × 0,90 × 0,74 | — (os lugares são os banquinhos em volta) | redonda; a de pedra do romano rico |
| `mesa-taverna` | 1,60 × 0,80 × 0,74 | — (os banquinhos ou os bancos dos dois lados) | comprida; a mesa de cavaletes |
| `banco` (refeito) | 1,40 × 0,35 × 0,45 | 2 «sentar» | com pernas de verdade |
| `cadeira` | 0,50 × 0,50 × 0,45 (o encosto a 0,95) | 1 «sentar» | a do dono rico: o klismos grego, a cátedra romana, a cadeira egípcia de pés de leão |
| `balcao` (refeito) | 1,80 × 0,60 × 1,00 | 1 «vender» atrás | **encostado à parede**, com o taverneiro entre ele e a `prateleira-bar` |
| `balcao-alvenaria` | 2,40 × 1,60 × 1,00 (em L) | 1 «vender» dentro do L | o do romano e do clássico: a alvenaria com os jarros embutidos, voltado para a rua |
| `prateleira-bar` | 1,80 × 0,40 × 1,90 | — | guarda (a bebida); três tábuas; o que mostra é da P5 |
| `anforeira` | 1,20 × 0,50 × 1,10 | — | guarda; o suporte das ânforas de ponta |
| `barril` | 0,60 × 0,60 × 0,90 | — | guarda; aduelas com aros (o povo sem ferro, aros de vime) |
| `lareira` | 1,40 × 0,60 × 1,20 (a coifa até o teto) | 1 «cozinhar» | o fogo do romano, do grego e do clássico |
| `forno-barro` | 1,00 × 1,00 × 1,10 | 1 «cozinhar» | o do egípcio |
| `fogao-comal` | 1,20 × 0,70 × 0,60 | 1 «cozinhar» | o do asteca |
| `fogo-comprido` | 3,00 × 0,90 × 0,30 | 4–6 «sentar» em volta (nos bancos) | o do nórdico, **no meio do salão** (a única ilha de propósito) |
| `estrado` | 1,60 × 1,20 × 0,25 | 1 «tocar» em cima | o canto do músico |
| `cuba`, `pipas`, `lampadario`, `cama`, `arca`, `mesa` | as de hoje | as de hoje | a P2 refaz o desenho; a P3 não muda as medidas |

**As peças de antes que a taverna usa** e que a P2 também modela: as que estiverem na planta nova (a cama e a arca dos quartos,
o lampadário, a cuba, as pipas).

## 5. Os números reservados

Cada frente usa **só os seus números** (para os ramos juntarem sem trombar):

| Frente | Regras do `guard.js` | Decisões | Defeitos | Limites de prova |
|---|---|---|---|---|
| supervisor | — | D-650 a D-669 | — | — |
| P1 | 250 a 259 | D-700 a D-709 | L-1800 a L-1819 | T-1700 a T-1719 |
| P2 | 260 a 269 | D-710 a D-719 | L-1820 a L-1839 | T-1720 a T-1739 |
| P3 | 270 a 279 | D-720 a D-729 | L-1840 a L-1859 | T-1740 a T-1759 |
| P4 | 280 a 289 | D-730 a D-739 | L-1860 a L-1879 | T-1760 a T-1779 |
| P5 | 290 a 299 | D-740 a D-749 | L-1880 a L-1899 | T-1780 a T-1799 |
| P6 | 300 a 309 | D-750 a D-759 | L-1900 a L-1919 | T-1800 a T-1819 |
| P7 | 310 a 319 | D-760 a D-769 | L-1920 a L-1939 | T-1820 a T-1839 |

## 6. O protocolo de cada frente

1. **O ramo:** cada frente trabalha no seu ramo (a sua cópia de trabalho), em commits pequenos; **nunca faz push** nem junta com
   outro ramo. No fim, o relatório ao supervisor: o que fez, os números, o que não deu, o que precisa de outra frente, **as linhas que
   propõe para o `CLAUDE.md`**.
2. **Antes de cada commit:** `node qa/guard.js` e a vida curta `node qa/soak.js 103 continente 128 4 normal 5 1 1`, e as provas da
   sua parte (as do `CLAUDE.md` para os arquivos que mexeu, e as do §7).
3. **Toda coisa nova com o seu verificador e o seu cenário** (o protocolo do `CLAUDE.md`): uma invariante no `qa/qa.js` ou no
   verificador da parte, um cenário que provoca a coisa nos casos ruins (o save no meio, a pessoa que morre, o deus que interfere, o
   mapa que muda), e uma regra no `guard.js` onde a regra se lê no código.
4. **Todo defeito achado** numa entrada do `qa/AUDIT.md` (na sua subseção da seção 23), com a causa e a correção; **reproduza antes
   de consertar**.
5. **Corrija a causa, não o sintoma.** Nada de esconder um erro com `try/catch`, pular uma prova ou afrouxar uma invariante.
6. **A máquina é dividida** (4 núcleos, sem placa de vídeo; o navegador usa o SwiftShader): o navegador **só pela fila**
   (`bash qa/navegador.sh …`), nada de regressão completa (é do supervisor), as provas longas uma de cada vez.
7. **O que só se vê só se vê:** nenhum arquivo de desenho escreve no mundo nem tira do acaso do mundo (`G.R`); a escolha do desenho
   é pelo `G.hash` do id — **nunca sorteio** (a regra magna); nenhuma memória do desenho depende de quando ele olhou.
8. **As fotos:** o script de fotos da auditoria está em
   `/tmp/claude-0/-home-user-promptzada-de-adulto-do-dr-s-ntese/474a40dc-2376-5786-aa24-770c3a52b5eb/scratchpad/interiores/A/fotos-int.js`
   (copie e adapte; ponha as suas fotos na pasta da sua frente no scratchpad, `.../scratchpad/interiores/Pn/`). Ponha no relatório
   as fotos de antes e depois.

## 7. As provas de cada frente (além das do `CLAUDE.md` para os arquivos que mexeu)

- **P1:** `qa/visual/guarda3d.js`, `qa/visual/interior3d.js` (com a folga de um rodapé ou de uma barra: um T- seu), `qa/visual/fidelidade.js`
  (a janela sem vidro muda as aberturas), `qa/visual/corpo-casa.js`, `qa/ceu.js`, `ONLY=e11 node qa/encarna.js` (os sombreadores
  compilam), as fotos pela fila; **novo:** a luz de dentro não vaza pela parede, toda fonte tem causa, o mesmo volume para a mesma
  planta.
- **P2:** `qa/visual/interior3d.js` (cada peça no seu retângulo e no seu chão, cada tipo desenhado), `qa/visual/guarda3d.js`,
  `qa/visual/malhas.js` (com o orçamento novo da biblioteca); **novo:** nenhuma peça da taverna desenhada pelas caixas, cada modelo no
  seu orçamento de triângulos, as partes de metal só onde o povo tem o metal.
- **P3:** `qa/plantas.js`, `node qa/catalogo.js confere` (depois de gerar), `qa/motor-plantas.js`, `qa/lugares.js`,
  `qa/monumental-poder.js` (a taverna: ao menos 8 mesas e o balcão alcançado), `qa/terreiro.js`, `qa/interiores.js` e
  `qa/interiores-inv.js`, `qa/matriz-predios.js`, `qa/taverna*.js`, `qa/oldsave.js` com o `qa/oldsave_7.json` e `qa/corrupt.js`;
  **novo:** o salão da taverna com a área e o corredor do padrão (`interiores-2.md` §5.1), o balcão encostado, ninguém sentado no ar, as
  variantes (ao menos 3 por povo e tamanho, nenhum par igual).
- **P4:** `qa/movimento.js` (m6, m11, m12), `bash qa/navegador.sh node qa/movimento-tela.js PASTA` (t6, t7, t10), `qa/conversa-camera.js`,
  a tela do `qa/corpo-fera.js`, a parte 9 do `qa/visual/interior3d.js`, `qa/visual/monumental.js`, `qa/visual/pontes.js`,
  `qa/visual/soleira.js`, `qa/visual/porta.js`, `qa/visual/pe-da-escada.js`, `qa/visual/corpo-casa.js`; **novo:** o olho nunca dentro
  do sólido em todo prédio (também com o corpo dentro, menos na cama), a quarta parede, a mira do arco que não bate na parede cortada.
- **P6:** `qa/vida3d.js` (v1–v6, v8–v10), `qa/visual/gestos-vida.js`, `qa/vida-guarda.js`, `qa/visual/corpo-rig.js`, `qa/visual/maos.js`,
  `qa/visual/andar.js`, `qa/roupa.js`, `qa/atmosfera.js`, `qa/vida-custo.js`, `qa/solto.js`, `qa/genoma.js` (as partes da mão),
  `qa/visual/rostos.js` (r1–r3, r6, r7); **novo:** ninguém desenhado dentro de um móvel nem de uma parede, quem entra é desenhado
  andando da porta, ninguém de chapéu de sol dentro de casa.
- **P5** e **P7:** no contrato da segunda onda.

## 8. A auditoria (leia a da sua parte)

`/tmp/claude-0/-home-user-promptzada-de-adulto-do-dr-s-ntese/474a40dc-2376-5786-aa24-770c3a52b5eb/scratchpad/interiores/`:
`A/RELATORIO.md` (as fotos e as notas; `A/melhores/`), `B/RELATORIO.md` (a planta), `C/RELATORIO.md` (o desenho, a luz, os materiais,
o desempenho), `D/RELATORIO.md` (a câmera, o corpo, a tela), `E/RELATORIO.md` (a vida dentro). **As referências do dono:**
`/root/.claude/uploads/474a40dc-2376-5786-aa24-770c3a52b5eb/53c4feda-image.png`, `.../d4fadcdd-image.png`, `.../72fcfada-image.jpg`
(o clima — o calor, a luz de fogo, a casa cheia — com os objetos de cada povo da Antiguidade, nunca a cópia).
