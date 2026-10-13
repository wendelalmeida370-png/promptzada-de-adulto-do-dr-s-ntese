# Projeto Encarnação — a fundação do Modo Encarnado

> **Uma realidade. Duas perspectivas.** O Modo Deus e o Modo Encarnado olham para o *mesmo* `G.S`: a mesma
> geografia, as mesmas pessoas (com os mesmos `id`), a mesma economia, a mesma história. Não existe um "mundo 3D".
> Existe uma *câmera* 3D e um *corpo* que o jogador empresta.

Este documento é o Marco 0 (auditoria + arquitetura) e a referência de quem for estender o modo. As decisões
de design numeradas (D-0xx) estão também no `qa/AUDIT.md`.

---

## 1. O que o jogo já era (auditoria)

| Peça | Onde | O que importa para o 3D |
|---|---|---|
| Estado autoritativo | `G.S` (`world.js` `newState`) | tudo que existe: grade `N×N` de casas (`type`, `H` nas quinas, `wl` nível da água, `cliff`, `deep`, `road`, `wall`, `occ` = prédio, `treeAt`, `objAt`), mapas `villagers`, `buildings`, `trees`, `rocks`, `bushes`, `animals`, `ships`… |
| Laço da simulação | `main.js` `simulate` → `step` → `MODS` | passos de até 0,05 s (0,075/0,1 a 8×/16×), `dt` real limitado a 0,1 s; tudo que envelhece integra o `dt` — **30 ou 60 quadros por segundo envelhecem o mundo igual; o mundo não depende da câmera** |
| Tempo | `S.clock` (s), `S.time` (0..1 do dia), `S.day`; `G.DAY_LEN` = 200 s | um dia = um ano de vida das pessoas |
| Pessoas | `villagers.js` `updateAll`: `needs` → `emergency` (a cada ~0,3 s) → `decide` (a cada ~2 s) → `runTask` | a IA só move quem tem tarefa; toda tarefa nasce por `setTask` (as de fora quase sempre por `Vg.give`, que respeita prioridade) |
| Coordenadas | posições em *casas* (float), `x` leste, `y` sul; altura `W.groundH(x,y)` (terreno ou água) e `W.hAt` (terreno) em *unidades de altura* (`G.SEA` = 2) | a projeção isométrica `R.proj(x,y,h)` = `[(x−y)·16, (x+y)·8 − h·4]` px; o Modo Deus gira em 4 vistas |
| Por onde se anda | `W.walkable`, `W.reachIds` (regiões), `S.cliff`, prédios que bloqueiam (`blocks`), muros (`S.wall`), gelo (`S.ice`), fundo do mar aberto (`S.dry`) | **o 3D usa as mesmas regras**: o que a simulação diz que não se pisa, o corpo também não pisa |
| Desenho | `render.js` (Canvas 2D, isométrico, chunks em cache), `art.js` (pessoas: `Art.clothOf`), `arch.js` (`Arch.PAL[civ]`: paredes, telhados, portas por civilização) | o 3D lê as mesmas cores — a mesma pessoa tem a mesma roupa nos dois modos |
| Interface | `ui.js` (ficha `#inspector`, botões `data-act`) | o botão **Encarnar** entra ao lado de Seguir / Família / Biografia |
| Save | `save.js` + `G.saveHooks` | o encarnado é guardado (`S.avatar`) e um save feito encarnado volta encarnado |
| Narrativa | `stories.js` `St.signal(kind, d)`, `Life.bio`, `Village.log`, `Lore` | as ações do jogador entram por esses mesmos canais |

**Escala medida.** Uma casa ocupa **1 casa** da grade; um armazém 2×2; uma fazenda 3×3. As pessoas andam
1,25–1,5 casa por segundo de simulação. O relevo vai de 0,3 a ~19 unidades de altura.

**Limitações estruturais encontradas (e o que foi feito):**
- A IA podia mexer em qualquer pessoa a qualquer hora → criada a *autoridade de posse* (§4).
- As cenas (`scene.js`) podiam "pegar" qualquer pessoa como ator → a tarefa `avatar` é protegida.
- Muitos sistemas dão ordens diretas (`setTask`) — por exemplo, a guerra convoca, a justiça prende → `setTask` pergunta à posse antes (§4.3).
- O mapa é pequeno para viagens épicas (128–256 casas = 0,5–1 km a 4 m por casa) → **documentado, não ampliado** (pedido explícito).

---

## 2. As escalas canônicas — `G.Space` (`js/space.js`)

| Grandeza | Valor | Por quê |
|---|---|---|
| 1 casa da grade | **4 m** | uma casa de 1 casa = 4×4 m (um chalé), uma pessoa de 1,75 m cabe na porta; uma fazenda 3×3 = 12×12 m |
| 1 unidade de altura | **1,5 m** | morros de 10–20 unidades viram 15–28 m; o mar (`G.SEA` = 2) fica a 3 m |
| Eixos 3D | `X = x·4`, `Z = y·4`, `Y = h·1,5` (Y para cima) | leste = +X, sul = +Z, como a grade |
| Tempo encarnado | **1× encarnado = 0,35× do Modo Deus** (D-015) | as pessoas andam 1,35 casa/s de simulação = 5,4 m/s; no ritmo humano isso vira ~1,9 m/s, e o dia dura ~9,5 min |

Conversões (todas em `G.Space`): `toWorld(x,y)`, `toTile(X,Z)`, `groundY(X,Z)` (o chão ou a água por cima),
`floorY(X,Z)` (o terreno), `waterY(X,Z)`, `surface(X,Z)` (o que há ali: chão, água rasa, água funda, penhasco,
prédio, muro — perguntando à simulação), e `screen(x,y,h)` (a projeção do Modo Deus). **A tela nunca é fonte de
verdade de posição**: a verdade é `v.x, v.y` em casas.

---

## 3. Os modos — `G.Modes` (`js/modes.js`)

```
GOD ──enter(v)──► TO_INC ──► INC ──leave()──► TO_GOD ──► GOD
                              │  └─ o corpo morre ─► DYING ─► TO_GOD
                              └─ switchTo(o): outro corpo, de dentro (um escurecer rápido, sem voo)
```

Uma única peça decide: o desenho ativo (Canvas 2D, WebGL ou os dois se fundindo), para onde vão teclado e mouse
(`G.Modes.key`, chamado primeiro pelo `main.js`), qual interface aparece, a escala do tempo (`G.Modes.timeScale`) e
quem é o corpo. Nenhuma outra parte do código guarda "estou encarnado?" — perguntam a `G.Modes`.

**A descida (D-016).** (1) A câmera do Modo Deus centra e aproxima; a câmera 3D, ainda invisível, fica exatamente onde
está o olho do deus: a mesma direção (lida do próprio gradiente de `Render.proj`, qualquer que seja o giro da vista),
30° acima do chão, de longe e com lente fechada (9°: quase ortográfica), e longe o bastante para enquadrar o mesmo pedaço
do mundo naquele zoom. (2) As duas imagens se fundem. (3) O mundo 3D começa achatado como o desenho do deus (o relevo do
Modo Deus é 4 px por unidade de altura contra 16 px por casa — `Realm.setDepth(0,62)`) e ganha sua profundidade verdadeira
enquanto a lente abre e o olho desce num arco até as costas da pessoa — a pose final é pedida ao próprio `Cam3D`, então
a mão passa para o jogador sem salto. A interface divina some aos poucos; a do corpo aparece. A volta é o mesmo voo ao
contrário, terminando com a pessoa selecionada e seguida no Modo Deus. Um save feito encarnado abre direto no corpo
(`Modes.wake`, um despertar curto, sem descida).

**O tempo (D-015).** Encarnado, o mundo anda a 0,35× da velocidade 1× do Modo Deus (o passo de uma pessoa: os NPCs andam
~1,9 m/s, como o jogador). Dormir acelera 14× (uma noite passa em ~12 s). O menu pausa. O mesmo relógio, o mesmo mundo:
só a velocidade muda.

## 4. A posse — `G.Possess` (`js/possess.js`)

### 4.1 A verdade
- `S.avatar = { id, kind, since, t0, x0, y0, asks, deeds, seen, met }` — guardado no save. Só o `possess.js` escreve
  (regra 9 do `guard.js`).
- A pessoa controlada tem a tarefa `{ type: 'avatar', pri: 100 }` — a marca do corpo; só o `possess.js` a dá (regra 9).
- **A mesma pessoa**: mesmo `id`, nome, idade, família, casa, povo, saúde, memórias. Nada é clonado.

### 4.2 Autoridade
No laço das pessoas (`villagers.js`): `needs` continua (fome, cansaço, idade, doença, fogo, cura, gravidez, velhice — a
mortalidade não some); `emergency`, `decide` e `runTask` não rodam para o corpo (`Possess.live` no lugar). O
controlador (`js/avatar.js`) escreve `v.x, v.y` (em casas), `v.face`, `v.moving`, `v.walkPh` e gasta os caminhos
(`S.wear`) como qualquer um — o Modo Deus vê a pessoa andar onde o jogador anda. O vigia anti-travamento ignora o corpo.

### 4.3 Ordens de fora
`setTask` e `Vg.give` perguntam a `G.Possess.ask(v, tarefa)`:
- **Pedidos** (a convocação, um incêndio, uma festa, a assembleia, uma história…) não tomam o corpo: viram um
  **chamado** no HUD (`asks`, com contagem) — a base das obrigações sociais futuras ("e se você não for?").
- **Forças do mundo** (`FORCE`: cadeia, cela, condenação, cativeiro, embarque, a água) encerram a encarnação com aviso.
- Um sistema que tome o corpo sem perguntar (o `Naval.board`, a captura, a migração) é visto no passo seguinte
  (`Possess.update`): a encarnação acaba e a nova tarefa fica.
- Uma cena (`scene.js`) não toma o corpo (`avatar` está nos `GUARDED`).

### 4.4 Devolver
`release(why)`: tira a marca, zera o caminho, `think = 0` → no passo seguinte a IA decide de onde a pessoa está.
A biografia ganha uma linha (`god`: "Viveu 2 dias guiado pelo deus: cortou 3 árvores, conversou com 5 pessoas…"),
a crônica também quando houve algo a contar, e as histórias recebem o sinal `avatarEnd`.

### 4.5 A morte
`Village.kill` é a única porta para fora do mundo: o `possess.js` a acompanha. A morte é de verdade — o registro dos
mortos, o corpo no chão (se violenta), o luto da família, a cova; a linha da crônica diz que foi "com o deus vivendo em
seu corpo". A câmera sobe devagar sobre o corpo, o nome e a causa aparecem, e o jogador volta a ser deus com o morto
selecionado. Ninguém é restaurado. Cair de mais de 6,5 m machuca (causa `queda`).

### 4.6 Capacidades (tipos de encarnação)
`Possess.caps(v)` diz o que o corpo pode — andar (m/s, do passo da própria pessoa), correr, pular, fôlego, nadar,
escalar, planar, mergulhar — a partir da pessoa (idade, perna perdida, doença) e do **tipo** (`KINDS`: só `humano`
agora; `extraordinario` e `avatarDivino` são lugares reservados, D-018). O controlador nunca pergunta "é humano?".

### 4.7 O que uma aventura futura pergunta (`Possess.context()`)
`who` (identidade real), `where` (cidade, bairro, bioma, chão), `stories` (as histórias do motor que envolvem a pessoa),
`knows` (família, quem conheceu encarnado), `witnessed` (as linhas da crônica contadas perto do corpo), `goals` (os
chamados), `around` (gente perto), `deeds`, `caps`. É a porta do "viver uma história" (Parte XI).

## 5. O mundo em 3D — `G.Realm` (`js/realm3d.js`) e companhia

- **Renderizador:** Three.js r170 embutido (`js/lib/three.min.js`, MIT, gerado por `tools/vendor-three.sh`) —
  WebGL2, instancing, sombras, neblina. Offline. Nada de CDN.
- **Chunks** de 16×16 casas (64×64 m). Cada um tem duas imagens: a **distante**, feita para o mapa inteiro quando o
  modo abre (chão grosso, blocos para as casas, copas simples — o horizonte, a cidade vista do morro), e a **próxima**,
  feita em volta do corpo enquanto ele anda e jogada fora atrás dele (geometria devolvida com `dispose`), com orçamento
  de milissegundos por quadro, e guardada um pouco além de onde é feita (sem fazer e jogar fora a mesma ao andar na
  borda). Um chunk é refeito quando o que há **dentro dele** muda (assinatura: alturas, tipo de chão, penhascos, nível do
  rio, árvores, arbustos, prédios, estradas, gelo, fundo seco, muros — nada de contadores gerais do mundo: L-099), e só a
  parte que mudou — o chão, as plantas ou os prédios. Ao reabrir o modo, só as imagens distantes que mudaram são refeitas.
  O contexto 3D só é criado na primeira descida (`Realm.ready`): o Modo Deus nunca segura um.
- **O visual é o do Modo Deus** (v33, `qa/AUDIT.md` §10, D-019 a D-021): as mesmas cores, as mesmas formas, os mesmos
  tons — no meio da descida as duas imagens são quase a mesma cidade.
- **Chão** (`js/ground3d.js`): a malha das quinas `S.H` (a mesma altura do Modo Deus — o teste e1 confere vértice a
  vértice), pintada por uma figura do mapa — uma casa por ponto, com a cor do próprio `Render.tileColor` do deus (ruas,
  roças, neve, areia, trilha gasta, cinza) e o tipo de chão. O shader mistura as quatro casas em volta de cada ponto com
  borda irregular (rua e roça com linha firme e meio-fio) e põe o grão de cada tipo (capim, areia, seixos, neve, poças do
  pântano, ondas da duna, lajotas, sulcos da roça, camadas da rocha nas encostas). A figura segue o mundo: as fileiras em
  volta do corpo são refeitas umas por quadro, e uma fileira do mapa inteiro também (o verificador `vista3d` e o e11
  conferem casa por casa). A cor dos vértices é só a sombra (as cavidades, o pé das paredes).
- **Água**: o mar a 3 m (e um oceano até o horizonte), rios e lagos no seu nível (`wl`); ondas que andam, o céu refletido
  de lado, o brilho do sol, o raso claro (o fundo aparece) e o fundo escuro, espuma onde a água encosta na terra; o gelo
  do Inverno Súbito, as paredes de água do Abrir o Mar; pontes de tábua (ou de pedra, nas ruas calçadas) sobre os rios.
- **Céu e luz**: nuvens que andam com o vento do mundo (mais cobertas e cinzentas na chuva), o sol baixo, a lua, as
  estrelas; o sol sobe só até ~55° (um lado da casa claro, o outro na sombra, como no desenho do deus); a curva de cor
  neutra (as cores não lavam); sombras.
- **Vegetação**: as árvores reais (`S.trees`: espécie, tamanho, estágio, variante) com copas de vários tufos facetados nos
  três tons do deus, pinheiros em camadas, palmeiras de folhas caídas, salgueiros com cortinas, acácias em guarda-chuva,
  neve em cima onde a terra é fria; tudo balança com o vento (atributo `aK`). A árvore derrubada cai de verdade (FX3D) e
  deita. Arbustos com as frutas que têm, pedras com musgo ou neve; capim do bioma em tufos de folhas (dourado na savana,
  junco no pântano, nada na neve), flores; tudo balança e abre caminho para o corpo.
- **Prédios** (`js/build3d.js`): cada prédio real com tipo, tamanho, paleta da civilização (`Arch.PAL`), o **material do
  povo** (padrões desenhados no shader, `Build3D.PAT`: enxaimel, reboco, adobe, tábuas; telha, telha plana, palha, grama;
  pedra na base) e os telhados altos do desenho do deus (beiral, empenas fechadas, cumeeira; as casas longas nórdicas com
  telhado de grama e cabeças de dragão), janelas com moldura, peitoril e postigos, portas de tábua com batente e degrau,
  chaminés (com fumaça), andaimes da obra, fuligem quando ferido; ~50 tipos. Muralhas e portões de pedra, aquedutos com
  arcos. Roças em fileiras de plantas com a safra real de cada casa (trigo, cevada, arroz alagado, milho, sorgo, com as
  alturas do desenho do deus); cemitérios com as lápides reais.
- **Pessoas** (`js/people3d.js`): o corpo e as pessoas próximas são as **pessoas reais** — boneco arredondado (quadril,
  tronco com cintura e ombros, cinto, pescoço, cabeça com olhos que piscam, sobrancelhas e nariz, cabelo — grisalho nos
  velhos —, braços e pernas articulados, saia/túnica, carga, ferramenta), com a pele, o cabelo, a roupa do ofício (e a
  cor do povo para guerreiros) e a altura da idade e do sexo; animado pela **máquina de estados** `G.Anim3D` (idle,
  andar — com o quadril e o tronco —, correr, agachado, pular, cair, aterrissar, girar, vadear, golpear, colher,
  carregar, rezar, sentar, conversar, dançar, luto, abraço, dormir, nadar, arremessar, amarrado, lutar, interagir)
  escolhida pelo que a pessoa faz no mundo. Quem está parado perto do corpo vira a cabeça para ele (`People3D.lookFor`).
  Mais longe: figuras simples das mesmas pessoas, com pernas que andam; além: nada. Os bichos com corpo, pescoço,
  focinho, orelhas, olhos, chifres ou galhada, crina, cauda (que abana no cão), pernas em trote, pastando; aves de duas
  patas no chão e batendo as asas no ar.
- **Efeitos** (`js/fx3d.js`, só se veem, acaso do desenho): o fogo onde o mundo está pegando fogo e as fogueiras das
  vilas (chamas, faíscas, coluna de fumaça, luz), a fumaça das chaminés, a chuva (e a neve) do clima do mundo com gotas
  batendo no chão e anéis na água, poeira e neve levantadas por quem corre, respingos e anéis de quem anda na água,
  lascas do machado e da picareta, folhas caindo com o vento, vaga-lumes nas noites quentes; os **navios reais** com a
  cor do povo na vela.
- **Qualidade baixa**: sem o grão do chão, sem os padrões dos prédios, sem o capim, sem sombras — as cores lisas.

## 6. "LOD de simulação" — o que é e o que não é (D-017)
A simulação deste jogo já roda **todo mundo, sempre**, barato (é ela que faz a história). Encarnar **não muda a
simulação de ninguém**: muda só o detalhe do desenho (perto: boneco completo e animado; média distância: figura
simples; longe: nada). Por isso um NPC distante não pode "ressuscitar" quando o jogador chega: o 3D só desenha o que
`G.S` diz. A física 3D é só do corpo do jogador; os NPCs andam pelos caminhos da simulação e o 3D os mostra onde estão.

## 7. O corpo — `G.Avatar` (`js/avatar.js`) e a câmera — `G.Cam3D` (`js/cam3d.js`)
- Passo fixo de 1/60 s com acumulador e interpolação do desenho (a sensação não muda com o FPS).
- Onde se pisa é **`W.walkable`**, a mesma regra das pessoas (`Space.surface`): mar, rio fundo, penhasco, prédio,
  muro não se pisam; um degrau acima de 0,6 m também não. O corpo é um círculo (0,32 m): só o lado para onde ele vai
  bate — encostado numa parede, ele sempre consegue sair. Troncos e pedras grandes empurram para o lado.
- Aceleração/frenagem, giro suave na direção do movimento (passos no lugar ao girar muito), corrida com fôlego,
  pulo com *coyote time* e *jump buffer*, gravidade com peso, aterrissagem que dobra os joelhos, ladeira que pesa.
- Os valores de sensação estão em `Avatar.TUNE` (aceleração, frenagem, giro, gravidade, coyote, buffer, degrau, raio,
  gasto e volta do fôlego…); a câmera em `Cam3D.OPT` (sensibilidade, inverter, seguir, FOV, distância).
- Estados de locomoção em tabela (`Avatar.LOCO`: chão, ar, dormindo, ocupado com as mãos): nadar, escalar, planar
  serão linhas novas (`Avatar.addLoco`), não um controlador novo.
- Câmera: órbita no ombro, limites de inclinação, zoom, suavização, volta para trás das costas quando se anda e se
  larga o mouse, nunca dentro do chão, de prédio ou muro (entra na hora, sai devagar), nunca debaixo d'água — os muros e
  os portões têm para ela a mesma forma de pedra que o desenho (`Build3D.wallSolid`): o vão do portão é livre;
  `Cam3D.lock` para o lock-on futuro.
- Entrada (`js/input3d.js`): ações com teclas trocáveis (`gotaf-keys`); mouse preso (pointer lock) ou arrastar;
  dedos: metade esquerda é o direcional, a direita gira a câmera, botões na tela. Ouvintes postos uma vez só.

## 8. Interação — `G.Interact` (`js/interact.js`)
Registro de provedores (`G.Interact.add({ id, prio, reach, find, label, can, run })`). Cada um olha o que está ao
alcance e na frente do corpo e diz o que dá para fazer; `can` confere de novo na hora (alcance, existência,
possibilidade, permissão: a árvore que outro está cortando é dele, o armazém é do seu povo). A cadeia é sempre
**entrada → ação → estado do mundo → consequência → visível nos dois modos**:
- **Conversar**: a pessoa vira, responde com uma fala tirada do que é verdade sobre ela (a tarefa, a fome, o luto, a
  família, a guerra, a história que vive) — o balão aparece também no Modo Deus — e abre a **ficha** com os dados reais
  (pais, filhos, casa, jeito, o que faz, memórias, histórias em andamento) e o botão **Encarnar** essa pessoa.
- **Porta**: bater (quem mora e quem está em casa), entrar em casa e **dormir**, **comer no armazém** (sai do
  estoque do povo), **guardar** o que carrega (`Village.addStock`), **rezar** no templo (devoção), ler as lápides.
- **Mãos**: **cortar** a árvore (o mesmo contador do lenhador; ela cai por `Nature.fellTree`) e pegar a lenha,
  **colher** frutas (comer na hora se tiver fome), **quebrar** pedra, **levar material para uma obra** (entra no que
  falta da construção), observar bichos.
- Os feitos contam (`Possess.deed`) para a biografia e a crônica, e cada um é sinalizado às histórias (`avatarDeed`).

## 9. O que está pronto, o que é provisório, o que fica para depois
Ver o relatório honesto em `qa/RELATORIO_ENCARNACAO.md` (o que foi testado de verdade, os números medidos, os limites).
