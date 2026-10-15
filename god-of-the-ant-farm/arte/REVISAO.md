# Revisão de arte — o Modo Encarnado depois da onda 1 (A1, direção de arte)

O que foi olhado: a **integração** (`integracao` @ f163fcd, a mesma imagem do worktree do A1 depois do merge), contra o
**jogo original** (`SP/visual/antes`). Cada imagem foi aberta e olhada de verdade; as regiões citadas estão entre
colchetes. A cor foi medida com `SP/a1/cor.py` (neon = saturação > 70% onde há luz; a faixa do alto e do rodapé, onde
fica a HUD, fica de fora). Critério: a direção da `arte/BIBLIA.md` — *stylized high-fidelity fantasy*, silhueta, material
com grão e uso, cor natural, detalhe onde o olho para.

Fontes desta versão (rascunho 1, 13:30):
- `SP/rodada-integra/caca/caca-01..05` (os quadros do caçador, 900 × 560: Hedeby, metrópole, um mundo novo);
- `SP/rodada-integra/encarna/e1-mercado`, `e1-no-mercado`, `e1-porto`, `e1-atravessou` (Birka, na metrópole) e
  `e6-terreno` (Hedeby) — quadros do Modo Encarnado, qualidade média;
- as fotos fixas da integração em qualidade alta (`SP/a1/fotos-alta`, as 13 vistas) estão na fila do navegador: quando
  saírem, esta revisão ganha o lado a lado de cada vista (antes | depois) e é atualizada.

## O veredito em uma linha

**A cidade já mudou de jogo; a natureza e as pessoas ainda não.** A casa nórdica de perto, o muro de pedra, a água do
porto e a luz da madrugada já são *stylized high-fidelity*; ao lado delas, árvores frutíferas, arbustos, pedras e
cactos em poliedros chapados, frutas-cubo vermelhas e roupas que colam no corpo como tinta puxam o quadro de volta para
2000. O salto visível agora está na **natureza (A3)** e nas **roupas e rostos (A4)** — e em ligar as peças-herói que já
existem (A2).

## O que já está bom — manter e copiar

- **A casa nórdica de perto** [caca-01, à direita; e6-terreno, ao centro]: tábua em pé com veio, nó e prego, a porta de
  pranchas com cinta de ferro e argola, a mão-francesa, a base de pedra de campo, o beiral de turfa com tufos de capim
  pendurados. É a régua de qualidade do estúdio.
- **O muro de pedra de campo** [e1-mercado, à esquerda]: a pedra na escala certa, argamassa clara, musgo nas juntas.
- **A telha romana** [caca-04 e o recorte `SP/a1/crop-romanas.png`]: o telhado de quatro águas com a figura de telha e
  a cumeeira lê como romano a 10 m.
- **A água do porto** [e1-porto, à direita]: o reflexo do céu, as ondinhas do canal, a areia molhada escurecendo na
  beira — bonita e calma.
- **A luz da madrugada** [e1-mercado, e1-porto]: a hora quente e baixa, a névoa que separa o fundo.
- **O capim alto** [e1-atravessou]: a densidade é a de um prado de verdade.
- **A HUD** [todas]: discreta, legível sobre neve e céu claro, a bússola no alto.

## O que ainda lê como "MMORPG de 2000" (em ordem de dano)

1. **Árvores frutíferas e arbustos de poliedros chapados**, verde forte, com frutas-cubo vermelhas de ~30 cm
   [e6-terreno, à esquerda embaixo; caca-01, à esquerda embaixo; recorte `SP/a1/crop-casa-arbusto.png`, à direita]. É o
   sinal mais forte de "jogo antigo" em todas as imagens — e aparece ao lado da melhor coisa do jogo (a parede de tábuas).
2. **Roupas que colam no corpo** [caca-04, a mulher asteca: o vestido creme é um maiô; caca-02 e e6-terreno: o avental
   amarelo é um cone rígido] — o corpo contínuo do A4 está bom; o que falta é o pano.
3. **Pinheiros em cones empilhados** e **pedras-bloco** [caca-02, à direita; caca-03, à esquerda e ao centro].
4. **As bancas do mercado** [e1-no-mercado]: caixas amarelo-oliva lisas com tampo escuro e frutas em bolas de cor pura —
   brinquedo.
5. **Os bichos** [e1-mercado, ao centro: o cervo/lhama laranja; e6-terreno: as galinhas]: corpos facetados de brinquedo.
6. **Os navios** (fx3d): casco facetado de 6 seções, caixa de convés, mastro e vela simples.

## A2 — arquitetura (build3d, props3d, things3d)

1. **Ligar as peças-herói que já existem.** Na integração nenhuma malha do Blender é desenhada (nenhum
   `G.Mesh3D.part` no código): as pontas da cumeeira são os segmentos do `bargeEnd`. No seu trabalho em andamento (lido sem
   editar, 13:42) o `dragao` já entra nas casas ricas e a `runa` já tem lugar — ótimo. Faltam: a `empena` (`cavalo` ou
   `voluta` pelo `G.hash(b.id)`, nas casas que não levam dragão: hoje são segmentos), o `portal` na porta de frente da casa
   longa e do salão, e a `banca` no mercado (item 4). O como está em `SP/a1/pedidos.md` e na BIBLIA §8. De passagem: as pontas das terças saindo da empena são
   prismas de 6 lados [e6-terreno, no alto; `SP/a1/crop-confere.png`, à esquerda] — 8 a 10 lados e um chanfro na ponta.
2. **Janelas dos povos quentes rentes à parede, de moldura vermelho-vivo** [crop-romanas, à direita: as quatro janelas]:
   recuar o vidro na espessura da parede (15–25 cm de vão, a parede mostrando a grossura), acalmar a moldura (o
   acabamento do povo × `calm(…, 0.75, 0.9)` — vermelho-vivo só em área pequena, BIBLIA §2.2), e um postigo ou grade em
   algumas (variação pelo id).
3. **A parede lisa de caixa** [crop-romanas: a casa romana lê como caixa de reboco perfeita]: com os materiais novos
   ligados (caiação, estuque, adobe), a parede ganha calombo e pincel; falta quebrar a caixa — base de cantaria/arenito
   (`ashlar`, `sandstone`), cunhais de pedra nos cantos, uma cornija sob o beiral (a faixa escura sob o beiral, que você já
   fez no trabalho em andamento, ajuda). Uma coisa-herói por casa (porta com arco ou alpendre, um balcão).
4. **As bancas do mercado** [e1-no-mercado; `SP/a1/crop-bancas.png`]: hoje um caixote com três bolas de 36 cm. A malha
   `banca` (feita para isto, do tamanho da sua `stalls()`) traz o balcão de tábuas, o toldo listrado com a barra
   recortada, os cestos com montes de fruta, os sacos e um caixote — a feira de Hedeby da BIBLIA §10.
5. **Os nove materiais das outras culturas** já estão ligados no seu trabalho em andamento (números de padrão a partir
   de 34, com `#ifdef`): a conferir nas vistas `metropole-*` quando entregar — o grego branco e azul, o romano de tégula e cantaria, o egípcio de
   adobe e arenito, o asteca de estuque e tezontle.
6. **Detalhe menor**: na casa nórdica a porta e a parede ficam do mesmo marrom [caca-01, à direita]; a porta nórdica do
   povo é bem mais escura (`#3a2616` contra `#7e5e40`) — confira se a porta usa `P.door`.
7. **O arroz maduro do arrozal** [e1-porto, embaixo — que eu tinha chamado de capim; correção do A3]: as folhas amarelas
   em ponta de flecha estão grandes demais (cada uma ~0,4 m) e todas iguais; mais finas, mais numerosas, de altura e cor
   variadas, as espigas caídas de maduras (`fields()` do `build3d.js`).

## A3 — terreno e natureza (ground3d, grass3d, árvores e plantas do realm3d)

1. **Árvores frutíferas e arbustos**: trocar os poliedros chapados por cartões de folha (como o arbusto de folhas
   desenhadas já faz [crop-casa-arbusto, à direita, no alto]) ou, no mínimo, massas suaves com a folha na textura e luz
   que atravessa; frutas de 6–10 cm, muitas e meio escondidas, cor dentro da BIBLIA (S ≤ 60 numa área tão grande).
   Onde está no código: as frutas são `SH.ico0` (icosaedro de 20 faces) com **0,3 m** na copa larga e 0,16 m nas bagas
   do arbusto, todas `#c8283a` (S ~80%) — `realm3d.js`, o fim do `default:` das copas e o arbusto de `S.bushes`; as massas
   da copa vêm do `crownInto` (as facetas aparecem de perto). No seu trabalho em andamento (lido sem editar, 13:43) o
   arbusto já tem massas redondas de perto e bagas pequenas em cachos de três — é isso; falta a árvore frutífera, cujas
   frutas continuam com 0,3 m (agora lisas): 6–10 cm, mais numerosas, parte delas dentro da copa.
2. **Coníferas** [caca-02, à direita]: camadas irregulares de galhos (cartões com agulha), pontas caídas, cada árvore com
   o seu tom (pelo id).
3. **Pedras e rochedos** [caca-03]: o bloco de poucas faces lê como 2000; a forma com facetas partidas e o material
   `crag`/`rock`, o pé enterrado com terra e capim em volta (BIBLIA §5: tudo encosta no chão).
4. **O capim do prado** [e1-atravessou]: a densidade é ótima, mas o verde satura (31% do quadro em verde saturado): puxe
   para o capim da BIBLIA (S 50–62). (As "lanças" amarelas de e1-porto não são capim seu: são o arroz maduro do arrozal,
   do `build3d.js` — a nota foi para o A2, item 7; correção do A3.)
5. **Cactos** [caca-03]: cilindros lisos; 8–12 costelas, braços curvados para cima, espinho na figura.
6. **A neve em manchas no chão** [e6-terreno, em volta da casa]: lê como tinta branca derramada; a borda macia e a neve
   com volume (a sua camada nova de neve no chão deve resolver — conferir).
7. **A grama em mancha de borda dura sobre a terra** [e1-mercado, embaixo à esquerda]: um retângulo verde chapado,
   recortado — a transição grama/terra precisa da borda esfiapada (tufos, terra aparecendo) que o chão do Modo Deus já
   insinua.
8. **Orçamento**: `needles` tinha 295 KB na pilha — **resolvido** pelo A3 na onda 2 (139 KB).

## A4 — personagens e animação (people3d, body3d)

1. **O pano**: a roupa é a cor pintada no corpo — o vestido da asteca colado como maiô [crop-romanas, à esquerda], o
   avental nórdico um cone rígido [e6-terreno]. Volume e caimento: o *huipil* asteca solto, com decote e costura; a saia
   abrindo do quadril; dobras e barra irregular; um pouco de balanço no andar.
2. **Os tecidos da pilha não são usados**: `wool`, `linen`, `leather`, `fur` (feitos na onda 1 para as pessoas) não
   aparecem em nenhum lugar do `people3d.js`/`body3d.js`. Ao lado de uma parede com veio e prego, a roupa lisa de cor única
   destoa. `G.Ground3D.texGLSL()` + `m3raw(M3_WOOL, uv)` no shader do corpo, por parte (a túnica de lã, a camisa de linho,
   o cinto e o sapato de couro, a capa de pele) — a escala está no `M3S_<NOME>`.
3. **Os olhos encaram** [crop-romanas, o rosto; caca-01]: esferas grandes de pupila escura; olho menor, pálpebra de cima
   fazendo sombra, sobrancelha; a pele com um pouco de calor nas bochechas e no nariz.
4. **Uma mancha escura de bordas serrilhadas na barriga** da mulher asteca [`SP/a1/crop-confere.png`, à direita], como
   algo de baixo atravessando o vestido (a ponta de uma trança? o cinto?) — conferir com o `People3D.check()`.
5. **Os bichos** [e1-mercado, e6-terreno]: corpos facetados; a mesma passagem do corpo contínuo das pessoas (formas
   suaves, pernas de verdade, pelagem calma).
6. **Manter**: o corpo contínuo (nenhuma junta aparecendo), as tranças e os cabelos, os acessórios (colar, braceletes, a
   barra da capa).

## A5 — luz, água, céu (realm3d luz, fx3d, post3d)

1. **Os navios** (fx3d): o casco facetado vira o `casco` do Blender trocando uma linha (no mesmo quadro unitário que o
   seu `hg`); o pedido está em `SP/a1/pedidos.md`.
2. **O mar raso perto da praia de dia** [caca-02, embaixo à esquerda]: leitoso, quase branco, se confundindo com o céu —
   conferir na vista `hedeby-praia` (a névoa sobre a água ao meio-dia, a cor da água rasa).
3. **A sombra profunda** [e1-atravessou, o muro à esquerda]: o lado na sombra fica quase preto; falta o céu enchendo a
   sombra (a luz do céu azulada). BIBLIA §11: nada some no escuro.
4. **Manter**: a água do porto, a madrugada, a névoa de profundidade.

## O que destoa entre as áreas

1. **Duas fidelidades no mesmo quadro**: a parede tem figura de 512 px com veio, prego e nó a 1 cm; a árvore, o arbusto,
   a pedra e o bicho ao lado são poliedros sem figura [e6-terreno: a parede × a macieira]. O olho lê dois jogos. A
   natureza e as pessoas precisam do mesmo grau de material que a arquitetura já tem.
2. **Verde que briga**: a turfa dos telhados é um verde de musgo calmo (S ~50%); a folhagem e o capim ao lado são verde
   forte, puxando para o lima [caca-01: o arbusto × o telhado; e1-atravessou: o prado × a turfa]. Acalmar na origem (A3),
   não na correção de cor.
3. **Vermelho demais**: a moldura das janelas romanas, as frutas-cubo, os acabamentos — cada um saturado, juntos viram
   ruído [crop-romanas; e6-terreno]. Vermelho só em acento pequeno.
4. **Pano liso ao lado de madeira com veio**: as pessoas são as únicas coisas sem material [caca-01: Liv × a parede].

## Depois da onda 2 — o que as fotos já mostram

As fotos fixas da integração da onda 2 (`integracao` @ 1ca7583) estão na fila da catraca (`SP/a1/fotos-integ2`). Até lá,
as fotos que já existem.

**A integração (a primeira imagem do conjunto: `SP/a6/poco-integra/`, do A6, 23:30, contra `SP/a6/poco-antes/`):**
- **Defeito novo — a neve com manchas ciano e roxas** [poco-0.png, todo o chão; poco-1.png, à direita no meio;
  recorte `SP/a1/crop-neve-rosa.png`]: onde a neve cobre o capim, o chão fica ciano-menta e o escuro da figura do capim
  vira roxo, como se o verde fosse tirado em vez de coberto (61% do recorte puxa para o ciano). No jogo original a mesma
  neve é branco-azulada — e na mesma integração, **sobre o chão de agulhas** [poco-2.png], a neve está branca e azulada
  como deve: o defeito é só onde a neve cobre capim. Prioridade alta: Hedeby é toda de neve.
  **A causa (achada fora do navegador):** não é a neve, é a **figura do capim sobre uma base clara**. O chão é a cor da
  casa × a razão da figura; a razão do capim tem matiz própria (o fio puxa ao verde-azulado, a terra entre os fios ao
  vermelho), que sobre o verde é variedade e sobre o branco do frio — onde a camada de neve é fina e o chão de baixo
  (`bareOf`) só entrou pela metade — vira fio menta e buraco roxo. A folha `SP/a1/neve-razao.png` põe a figura `grass` da
  pilha sobre três bases como o shader põe: a base clara reproduz o recorte (7% ciano, 24% roxo, `SP/a1/razao.py`); `turf`,
  `forest` e `needles` fazem o mesmo, terra, areia, pedra e neve não. O conserto é do A3 (`ground3d.js`): a matiz da
  figura só na medida em que a base tem matiz (a função `m3tint` em `SP/a1/pedidos.md` — sobre o verde quase nada muda,
  sobre o branco frio sobra uma geada cinza: 0% ciano, 3% roxo) e, onde o deus pinta o branco do frio, o chão de baixo
  inteiro, não meio branco. A curva e o grade do A5 não são precisos para o defeito.
- O capim sob as árvores ficou azul-acinzentado sobre o chão de folhas [poco-1.png, à esquerda]: conferir se é a geada de
  propósito.
- Melhor: os pinheiros com ramos e franja de agulhas, a pedra com um tom por faceta, o chão de mata de folha seca e a
  borda da neve esfiapada [poco-1.png].
- Igual ao original: o urso-polar ainda é um boneco de cápsulas [poco-1.png, ao centro] (A4, bichos).
- De dentro da copa, os ramos do pinheiro são folhas verdes planas e enormes [poco-2.png, no alto] (A3): perto do olho,
  esmaecer ou recortar o ramo, ou dar espessura de agulha à borda; e a pedra grande ainda é um bloco com uma racha
  [poco-2.png, à esquerda] — o tom por faceta ajuda, falta a forma partida.

**Os branches de cada um:**

**A5** (`SP/a5/onda2/depois2/`, o branch do A5 sobre a integração da onda 1):
- **A noite virou noite** [noite-alta.png]: a tocha acende uma poça de luz quente no chão e na neve, a janela da casa do
  fundo brilha, o céu tem estrelas, e o lado das tábuas no escuro ainda se lê. No jogo original a noite era um laranja
  chapado (35% do quadro em laranja saturado, `cor.py`). É a melhor mudança de luz do estúdio até aqui.
- **A praia** [praia.png]: a areia com ondulação, a água rasa num gradiente turquesa que escurece com a fundura, a linha
  das ondas acompanhando a margem — a borda reta da casa sumiu (a nota 2 do A5 respondida).
- **O dia** [praca-alta.png, casa-alta.png]: luz limpa, sombras macias, o céu calmo.
- **Ainda 2000: a chama da fogueira** [casa-alta.png, ao centro]: um cone laranja de 6 lados com brilho aditivo — lê como
  cone de trânsito. Línguas de fogo em cartões cruzados com o gradiente da chama, tremendo e mudando de altura (pelo
  `G.VR`), umas brasas subindo; o cone só como núcleo de brilho.
- E do A2, no mesmo quadro: **as pedras da fogueira** são oito esferas cinza de 22 cm (na sombra, bolas pretas) e as
  toras, três cilindros lisos (`campfire()` do `build3d.js`): pedras partidas do material `rock` meio enterradas, toras com
  casca e a ponta carbonizada.

## O que a caça do A6 achou e também é de arte

Do relatório do A6 sobre a integração (`SP/a6/integracao-relatorio.md`), o que se vê e quebra a imagem:
- **Bichos flutuando ou afundando** (A4 / líder): corpos inteiros 0,4–1,75 m no ar com os pés 0,5 m dentro do chão, outros
  inteiros debaixo dele [caca-02, caca-03, caca-05-novo]. Nenhum detalhe salva uma coisa que flutua (BIBLIA §5).
- **As pedras e o disco escuro das bocas de caverna** na altura do meio da boca: numa encosta, enterrados de um lado e no
  ar do outro (A2, `things3d.js` — já corrigido no trabalho em andamento dele).
- A blusa colada da mulher asteca (A4) — a mesma nota 1 do A4 aqui.

E na caça sobre a integração da onda 2 (`SP/a6/rodada-cdd464f/caca/caca.txt`, o código de cdd464f; 0 S1 e 0 S2 — os
bichos no ar e as pedras das cavernas sumiram), o que é de arte:
- **A selva neon** (A3): em Tenochtitlan, 84% dos pixels de planta iluminados e 48% dos de folha na mata densa acima de
  S 70 — a BIBLIA §2.2 chama de neon superfície grande acima de 70. É o "verde que briga" (abaixo) na terra dos astecas:
  a copa calma que já se fez para o norte (8d99e59) precisa valer para a selva e o sub-bosque também.
- **O corpo saindo pela saia** (A4): na porta de Hedeby, a saia longa deixa o corpo passar até 7 cm em 16 de 206 pedaços,
  a curta até 9,5 cm — de perto, a perna aparece através do pano.
- **O chão atravessando uma superfície deitada** entre os prédios de Hedeby (A2): 1 m² dela cortado pelo chão desenhado.

## As entregas da onda 2 (acompanhamento)

| Quem | O que entregou (commits) | Fotos depois | Revisto |
|---|---|---|---|
| A3 | neve como camada com bordas orgânicas; arbusto de frutinhas; linha d'água; biomas dos outros povos (dunas, oliveira, sub-bosque); copas de folhas, pinheiros de ramos, frutas pequenas, cactos com costelas, capim no pé das pedras; pé das árvores nas encostas; copas num verde mais calmo, perto do musgo da turfa; pedras com um tom por faceta; as poças do pântano com o céu; a borda esfiapada do capim (9 commits até 19:14) | na integração do líder (em andamento) | no código (d68aec0): as frutas com 8–11 cm, três por massa da copa, lisas e de cor mais funda — a nota 1 atendida; o resto pelos títulos responde aos itens 2–6 e ao "verde que briga". Conferir nas fotos dele |
| A2 | 12 commits até 18:58: os materiais novos por padrão (os nove dos povos com `#ifdef`); as peças do Blender (as duas cabeças de dragão pelo id da casa, a empena, o portal, a banca, as pedras rúnicas); a onda 5 dos outros povos (vão das janelas de 16/22 cm, venezianas, grades, cornija, cunhais, soco, alpendre, templos); os pátios com mercadoria; as pedras das bocas de caverna no chão; o orçamento da Leve e da Média; a escada da porta nas encostas (19:24) | na integração do líder (em andamento) | pelos títulos e pelo relatório, responde aos itens 1–6 do A2; conferir nas fotos (com a pilha de 47 materiais: o branch dele ainda tem a de 38, e sem ela os materiais novos caem no desenho antigo) |
| A4 | 15 commits até 19:16: as roupas com os tecidos da pilha (lã, linho, couro — o pedido do A1); a blusa solta (o huipil, a dobra do quíton) e as roupas de cada povo; saias presas no quadril abrindo em pregas, barra irregular; capa e saias com caimento e sem atravessar o corpo; rostos com olhos de brilho, sobrancelhas, humor e piscar; os olhos do tamanho de olho de verdade ("revisão do A1"); ninguém nu (com verificador); os bichos deitados na encosta, nascendo no chão; três níveis de detalhe pela distância; a luz da borda seguindo o céu da hora (pedido do A5) | na integração do líder (em andamento) | pelos títulos, responde às notas 1–5 do A4; conferir nas fotos da integração |
| A5 | 10 commits até 19:06: os navios com o casco trincado do Blender (o pedido do A1), a caixa facetada de reserva; a beira da água acompanhando o chão (a praia larga, a margem do rio sem a borda reta da casa); a luz pintada das chamas, sombras suaves, a curva que não esmaga os escuros; toda chama e porta acesa iluminando o redor, a sombra de contato sob os pés; a água rasa menos espelho; raios de sol no pós; as pegadas só na neve (pedido do A3); o orçamento da Leve e da Média | na integração do líder (em andamento) | pelos títulos, responde às notas 1–3 do A5 (o navio, o mar raso, a sombra que esmagava os escuros); conferir nas fotos |

## A1 — o que a própria revisão mudou na coluna do A1

- O letreiro de chegada ficava por cima das notícias em tela de até 900 px [caca-04, caca-05-novo: a notícia apagada
  atrás do nome] — corrigido (66e06a2).
- As notícias ocupavam o centro do alto com três caixas, e eram a mesma notícia em três cidades [e1-atravessou,
  e1-no-mercado] — agora vira uma linha "— e em mais 2 lugares", no máximo duas na tela (77d85a0).
- Os tecidos da pilha (onda 1) não chegaram às pessoas: o pedido vai ao A4 (acima).
- Na pilha, contando como a BIBLIA conta (o WebP, antes do base64), só a `turf` do A1 passa do teto de 200 KB por
  material (211 KB; `forest` 194, `grass` 179, `canvas` 152) — e a BIBLIA admite os chãos e a turfa vistos de perto até
  300. O total cabe: na integração, 49 materiais, 5,19 de 6 MiB de base64. Se apertar, a `turf` é a primeira a ganhar
  `hblur`/`q`. (Antes eu tinha escrito os números do base64, 4/3 maiores — corrigido.)
