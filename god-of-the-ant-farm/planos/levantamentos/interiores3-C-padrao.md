# C — O padrão da taverna como receita para os outros prédios

Pesquisa só de leitura para o plano do supervisor (24/11/2026, na ponta `79fdb25`). Nada no repositório foi mudado. Li os planos
(`planos/interiores-2.md`, `planos/interiores-2-contrato.md`, `planos/taverna-onda4.md`), as fundações do `CLAUDE.md`, os relatórios
da auditoria e das frentes no scratchpad (`interiores/A` a `E`, `P1`, `P4`, `P5`, `P7`), a seção 23 do `qa/AUDIT.md` inteira e o
código. Medi o jogo em Node com os mundos prontos (os scripts estão no §6). Os caminhos são relativos a `god-of-the-ant-farm/`.

## 0. Em resumo

1. **A taverna deixou dois tipos de coisa.** Uma é o motor de todo interior: a luz assada da planta, a quarta parede, a lente, a
   tela pelo lugar, o corpo contra o contorno das peças, quem anda pela planta, a roupa sem chapéu, o bebê no colo, o lugar tomado,
   a entrada pela porta, a porta de quem está dentro e o som que sai do lugar. Isso **já vale para os 31 tipos com planta**. A
   outra é o que só a taverna tem: a receita da planta, os 29 tipos de peça modelados, a decoração, a vida da sala, os verbos, os
   jogos e as provas do padrão. Isso é **o que cada prédio refaz**.
2. **As ferramentas boas da planta ficaram presas na taverna.** O corredor de 1 m (`tavClear`/`tavFlood`/`tavGrow`/`tavBand`), os
   grupos de mesa com o assento sobre a peça (`TPL`/`tavTables`), as escolhas pelo registro e pelo id (`tavAxes`/`tavFrame`) e a
   riqueza de agora (`rec.q`, `In.tavernStep`) moram em `js/int-trabalho.js` e em `js/interiors.js`, e só a taverna as chama. O
   primeiro trabalho é passá-las ao kit do motor.
3. **A distância até o padrão, medida.**
   - O grande palácio tem 939 m² e 63 peças. A estalagem tem 147 m² e 38 peças: o palácio tem um quarto da densidade dela.
   - O templo, o armazém e as oficinas têm de 4 a 9 peças em 90 a 190 m².
   - **Dos 97 tipos de peça do catálogo, 68 não têm modelo** e ainda são desenhados como caixas.
   - **A decoração só existe na taverna e na casa.** Todo outro prédio mostra só pano, lamparina e teia.
4. **O que ainda está errado em todo lugar.**
   - **Ainda se senta no ar** onde o lugar sentado fica ao lado da peça: a mesa de leitura, a mesa do escriba, o tear, a roda do
     oleiro, a bancada do ourives, a mesa comum. O conserto do L-1840 valeu só para a taverna.
   - **A esteira ainda é parede** (`C.LOW` não se pisa).
   - **A porta de dentro nunca abre para quem passa** (`In.passage` só olha a porta de entrada).
   - **Uns dez pontos do código ainda põem a pessoa dentro com `v.inside = b.id`**, sem a caminhada. É o caso da oficina, dos
     banhos, da leitura, do teatro, da audiência, da cela, da mina e do posto da torre.
5. **O custo de cada onda é o catálogo e o mundo.**
   - O `In.VERSION` é um só para o jogo inteiro. Mudar a gramática de um tipo invalida o catálogo de todos (`In.addProbed` só
     aceita a versão de agora), refaz o catálogo (≈ 1 h) e faz o save antigo julgar todos os registros.
   - A planta muda o mundo: os lugares, as camas, o que a casa guarda e os postos de trabalho. Por isso os mundos prontos são
     gerados de novo a cada onda.
6. **O que pesa nos prédios grandes.**
   - **A planta**: uma tentativa não se divide. A ínsula chega a 658 ms e o sobrado a 574.
   - **A casca do desenho**: 35 a 44 ms em Node no palácio de 24 m e no quarteirão, e 3 a 5 vezes isso no celular.
   - **O eco é um só por prédio**: o palácio soaria como um salão de 900 m².
   - **A multidão de dentro**: o 3D desenha no máximo 96 corpos inteiros, e de dentro nunca desenha a multidão simples.
   - **As bibliotecas estão quase cheias**: a dos móveis tem 3,84 de 5 MiB e a das coisas 3,25 de 3,5 MiB.
7. **A ordem que proponho.**
   1. As fundações que não mudam o que se vê: a versão da gramática por tipo, o kit, a prova padrão, a decoração em módulos, a
      biblioteca em pacotes, a riqueza genérica e a barra do lugar.
   2. As fundações que mudam o mundo, todas numa onda, com uma geração dos mundos prontos: o assento de verdade, a porta em todo
      afazer, a porta de dentro e a esteira que se pisa.
   3. As dos prédios grandes, junto com o palácio: aos pedaços, o eco por cômodo e a multidão dentro.
   4. As ondas dos prédios, na ordem do `interiores-2.md` §6, com o porto junto do Patch 35.
8. **Os riscos que a taverna ensinou.**
   - As frentes que escrevem o mesmo nome: a letra do livro, o nome da peça, a função de um objeto, o comentário que engole a
     linha.
   - O mundo que muda com a planta, a tarefa que não vai no save, e o desenho e o mundo em relógios diferentes.
   - A câmera em cada forma nova: a escada, o pódio, o terraço, o pátio.
   - As provas que mediam a receita velha, ou que abriram outro mundo sem dizer (o «corrupt save»).

---

## 1. O padrão da taverna, camada por camada

### Quadro de uma linha

| Camada | Genérico: outro prédio usa de graça | Só da taverna: cada prédio refaz | Já vale para os 31 tipos? |
|---|---|---|---|
| 1. Planta | o motor do `interiors.js` (o kit `P.*`, a grade, o caminho, os lugares, a forma, o catálogo, a migração) | a receita (`tavernBuild` e os vizinhos), o corredor de 1 m, os grupos de mesa, as variantes, `rec.q` | o motor sim; o padrão não |
| 2. Móveis | o caminho do Blender, `G.Movel3D`, as instâncias, a escada aberta, as folhas | os 29 tipos modelados (o conjunto da taverna e as peças que ela usa) | só onde há modelo; 68 tipos nas caixas |
| 3. Decoração | `G.Atmos.within` (o núcleo), `G.Atmos.rich`, o `G.Dentro3D` (as âncoras, as paredes, o chão), o `CAUSA` | `tavern(ctx)` e os campos da taverna no `within` (a mesa, os restos, os riscos, a lousa, a festa, os jogos…) | não: só taverna e casa |
| 4. Luz | `G.Luz3D` inteiro, o olho, os materiais de dentro, a janela sem vidro, as texturas altas | as lamparinas de parede (D-746), a conta da vela e da lenha (`G.Taverna.luz`) | **sim** |
| 5. Gente dentro | o caminho da planta, o ato sobre o lugar, a conversa por turnos, a roupa com causa, o bebê no colo | os clipes da mesa e da noite, os atos a dois da taverna, a coisa servida na mão | **sim** (o desenho); os gestos são por prédio |
| 6. Som | o som pelo lugar da planta, a porta com quem passa, o fogo aceso, os passos pelo chão, o eco | o burburinho de quem conversa, a música no compasso, a quarta onda | em parte (o eco por prédio) |
| 7. Corpo e câmera | a quarta parede, a Vista da sala, a lente, a tela pelo lugar, o Travar, o corpo contra as peças | nada (o degrau da porta ficou proposto: D-737) | **sim** |
| 8. Interação | `G.Interact` (os provedores `lugar`, `cama`, `porta`, `portaPlanta`, `guardados`…), a pessoa da sala, a tranca por dentro, a lista das ações | o provedor `taverna`, o cardápio, a barra «Mesa», os verbos da mesa, os jogos | em parte |
| 9. Vida da sala | `G.Vg.enter`/`leave`, `In.hold`, `In.places`, as regras de porta e de lugar, o molde da vontade, o posto, o livro, `G.linger` | `act-taverna.js` (2.340 linhas), o contexto, a festa, a cadeia dos ofícios, a bebedeira, os jogos | só as portas; cada prédio faz a sua vida |
| 10. Provas | `plantas`, `catalogo`, `luz`, `olho-dentro` o2, `interior3d`, `malhas`, `dentro` d1/d6/d7/d8, `QA.eye`, `G.VidaInv` | `taverna-padrao`, `taverna-vida`, `taverna-corpo`, `taverna-cadeia`, `noite-mesa`, `acoes`, os jogos | em parte |

### 1.1 A planta

**O motor (genérico)** — `js/interiors.js`:

- **O registro.** `b.ip` é escrito só no passo (regra 15). A planta é uma função dele, sem acaso (regra 16). As tentativas usam o
  dado próprio delas (`seedOf`, `shellSeed`), num máximo de 12 (`In.TRIES`).
- **O kit da receita** (`KIT`, linhas 350–912). O andar: `level` (com `piso`, `jirau`, `galeria`, `andar`, `terraco`, `porao` e
  `elevado`, e a laje de `SLABS`). Os cômodos e paredes: `room`, `wall`, `walls4`, `split`, `door` (entre dois cômodos ou para a
  `rua`, ou o `arco`), `hole` e `window` (a janela fica longe da laje). A escada: `stair` (`escada`, `escada-de-mao`, `degraus`, a
  `larga` e o poço grande). Para os prédios grandes: `ringWall`, `colonnade`, `tiers` (as fileiras) e `marks` (o lugar sem peça).
  As peças: `item`, `place` (contra a parede ou solta), `at` (num retângulo dado), `niche`, `bench` e `opt` (a peça de conforto,
  que sai quando fecha a passagem). As provas do encaixe: `fits`, `put`, `bodyFits` (o corpo inteiro no lugar de uso, T-446),
  `walks` e `walksIn` (tudo alcançado a pé, cômodo a cômodo nos lotes grandes), `headRoom` e `headOver` (o que pende fica abaixo do
  andar de cima, L-814).
- **As zonas guardadas** (`P.zones`). Entram no `keepClear` e nenhuma peça vai nelas. O palácio da forma já as usa: o espaço
  diante do trono, o eixo da cerimônia e os postos da guarda (`palaceFormFurnish`, `js/int-palacio.js:307`).
- **A peça em partes** (`parts`, `partsOf`). O balcão em L é sólido só pelos braços, na grade, no encaixe e no corpo.
- **A grade de 0,25 m** (`In.CELL`, `passCell`, com 0,75 m de passagem mínima). O caminho: `walkField`, `In.pathIn`, `In.walkIn`,
  `In.walkBetween` e `In.sight`. Os grupos de assentos de uma mesa: `In.groupOf`.
- **O validador** (`validate`, `fitItem`, `fitBody`, `finish`) e a assinatura estrutural (`In.signature`).
- **Os prédios grandes pela forma.** Primeiro `In.formType(type, { fam, furnish, hall, split, keep, t, bare })`: um construtor só
  (`formHall`, `js/int-civicos.js:456–481`), usado pela biblioteca, pelo templo, pelo palácio, pelos banhos e pelo paço. Depois
  `In.formSized` (os degraus maiores: o palácio de pátios de `js/forma-poder.js`, D-110) e `sizedType` (a estalagem, a casa
  rica). Por último `In.byRisk` e `In.riskLayer` (o risco da forma na planta: a grande biblioteca, as termas).
- **Os ajudantes das casas** (`In.HOME`, `js/int-familias.js`): `K.porao`, `K.ladderAt`, `K.cellarOK`, `K.roofOf`, `K.flatOK`,
  `K.wet`, `K.roofFits`.
- **A versão e a migração.** `In.VERSION` (hoje 6) e o `REC_V` (4). O save guarda `intG`. Num save antigo, `In.migrate` julga todos
  os registros (a porta, a família que o tipo não tem mais) e põe para fora quem ficou num bolsão (`outOfPocket`).
- **O catálogo.** `qa/catalogo.js` grava `js/int-catalogo.js`, lido por `In.addProbed(6, …)`. O `qa/plantas.js` confere todos os
  tipos, povos, contextos e lados.

**Só da taverna** (`js/int-trabalho.js:505–1081`, ≈ 600 linhas, todas funções fechadas dentro do arquivo):

- **As escolhas** pelo registro e pelo id: `tavAxes` (o tamanho, o fogo do povo `TAVC`, o bar em centro/canto/lado/rua, o estrado,
  a porta, o espelho, a adega) e `tavHash`. O quadro virtual com espelho: `tavFrame`.
- **As zonas das peças fixas** (`tavLayout`) e as janelas (`tavWindows`).
- **O corredor de 1 m** (`AISLE`, `TAISLE`; D-721): `tavClear`, `tavStamp`, `tavFlood`, `tavGrow` (o Dijkstra mais barato rente às
  peças), `tavReach` e `tavBand`, que viram `P.zones` com `aisle: 1`. Só `In.TAV_CORR` sai do arquivo, e só para as provas.
- **Os grupos de mesa** (`TPL` e `tavTables`): a redonda com quatro banquinhos, a comprida com bancos, a da cadeira do dono. O
  assento fica sempre sobre a peça (regra 271).
- **As posições de reserva das peças fixas** (`alt`, L-1841).
- **O padrão** (`TMIN`: o salão de 30/60/110 m² e os lugares 8/16/30) e as peças novas do catálogo (`js/int-moveis.js:130–163`).
- **A riqueza de agora**: o `rec.q`, julgado na virada do dia por `In.tavernStep` e `tavernWealth`, no `In.onNewDay`. Está escrito
  `if (rec.t === 'taverna') tavernWealth(b)` (`js/interiors.js:2868–2879`, 2895).

### 1.2 Os móveis modelados

**Genérico:**

- **O caminho do Blender.** `arte/blender/moveis.py` refaz tudo ou um só (`peça[:povo]`), e tem `--prev`, `--folha` e `--conta`.
  As formas ficam em `moveis_forma.py` (a caixa chanfrada, a tábua, o torno, o tubo, o pano, a pedra, as brasas, a tora, o tonel,
  a coifa) e a exportação em `exporta.py`.
- **A porta.** `G.Movel3D` (`js/movel3d.js`): `pick` (o modelo mais perto do povo e do tamanho, esticado só de 0,78 a 1,28), `has`,
  `geo`, `anchors`, `look` e `paint` (o material pelo que o povo tem, `G.Origem.matOK`), mais a variante `~rico` e o
  `G.MOVEIS.alias`.
- **O desenho por instâncias.** `B3.interior` → `out.inst` → `makeOpen`: um `InstancedMesh` por modelo, parte e padrão. O veio segue
  a peça (`M3UV` no `B3.dress`, L-1940). Sem modelo, volta às caixas do `FURN` (regra 262).
- A escada aberta (`inStair`, D-713) e as folhas das portas (`leafModel`).
- As regras 260–267 e as provas `qa/visual/moveis.js` e `qa/visual/malhas.js`.

**Só da taverna:**

- **Os modelos.** A tabela `arte/blender/moveis_tabela.py` tem 29 tipos com modelo: o conjunto do contrato §4 e as peças de antes
  que a taverna usa. Somando as partes que o 3D acrescenta, são 109 modelos, 218 com os níveis do meio, em 3,84 MiB.
- **Os estilos.** Só as peças da taverna têm um estilo para cada um dos seis povos. O `fogao`, o `lar` e os `jarros` têm um estilo
  só (`'ALL'`), e o `balcao-alvenaria`, o `forno-barro`, o `fogao-comal` e o `fogo-comprido` também (pelo `alias`).
- **O orçamento** da m7: uma taverna com no máximo 64 malhas e 30 mil triângulos (D-665).

**Os 68 tipos do catálogo sem modelo** (desenhados pelas caixas do `FURN`): `altar`, `armeiro`, `baia`, `balde`, `banca`,
`bancada`, `bancada-ourives`, `banco-cama`, `banco-comer`, `banco-corte`, `banco-fieis`, `banquinha`, `berco`, `bigorna`,
`braseiro`, `cabide`, `catre`, `cena`, `cepo`, `cesto`, `cesto-pendurado`, `chaves`, `cofre`, `despensa`, `eira`, `entulho`,
`estante`, `esteira-comer`, `esteira-oracao`, `estrado`, `fileira`, `fogareiro`, `fogo-chao`, `fonte`, `forja-fogo`, `fornalha`,
`fornalha-banho`, `forno`, `forno-olaria`, `ganchos`, `idolo`, `lenha`, `luta`, `manequim`, `marca`, `mesa-baixa`, `mesa-casa`,
`mesa-conferencia`, `mesa-escriba`, `mesa-leitura`, `nicho`, `palha`, `pilha-tijolos`, `piscina`, `prateleira`,
`prateleira-parede`, `redes`, `roda-oleiro`, `secador`, `solido`, `tanque-barro`, `tear`, `tina`, `tina-banho`, `tribuna`,
`trono`, `trono-camarote`, `tulha`. Alguns não se desenham de propósito (`fileira`, `marca`, `solido`, a peça da forma).

### 1.3 A decoração com causa

**Genérico:**

- **O núcleo do `G.Atmos.within(b)`** (`js/atmos.js:437–570`), puro e guardado por instante:
  - a bebida do livro (`G.Depot`, uma vasilha por unidade);
  - a comida pelas partes (`G.Origem.parts`);
  - os bens da casa;
  - a louça (o barro do povo, ou a madeira torneada);
  - a lenha;
  - a luz: a lamparina e a vela pelo que há para queimar, acesa só com alguém acordado no escuro;
  - o pano: onde o povo tece e a casa é rica, a cor de quem paga;
  - a teia (pelo desgaste).
- **A riqueza de agora** (`G.Atmos.rich`): a casa pelas moedas e pela casa mercante, a sede rica, a taverna pela casa do taverneiro,
  e os outros pela terra do dia.
- **O `G.Dentro3D`** (`js/dentro3d.js`):
  - o plano e a memória: `D.plan`, `D.sig` e o memo;
  - as luzes que a decoração dá ao `G.Luz3D`: `D.fontes`;
  - os lugares de pousar: `surfaces` (as âncoras dos modelos), `runs` (os trechos livres de parede), `ctx.wallFree`/`wallTake` (a
    parede tem dono, D-747) e `floorFree`;
  - os jeitos de pôr: `scatter`, `pack`, `beside`, `byWall`, `hangFood` (nas cavilhas antes das vigas, L-1881), `cloth`, `lamps` e
    `webs`;
  - a escolha sempre pelo `G.hash` do id.
- **As coisas e o verificador.** `arte/blender/deco.py` faz o `js/decomesh.js` (96 coisas). `qa/dentro-inv.js` guarda o `CAUSA`, uma
  regra por coisa (regra 296). As regras 290–299 e 410–413.

**Só da taverna:**

- **O desenho.** `build(ctx)` (`js/dentro3d.js:250`) faz `if (b.type === 'taverna') tavern(ctx); else if (bedsOf(b) > 0)
  house(ctx); cloth(ctx); lamps(ctx); webs(ctx);`. A taverna tem `tavern`, `tables`, `festa`, `door`, `games`, `fainted`, `spilt`,
  `slate` e boa parte de `hearth`.
- **Os campos do `within`.** `mesa`, `sujo`, `rabiscos`, `manchas`, `chao`, `lousa`, `ombro`, `festa`, `porta`, `jogos` e `caidos`
  vêm todos de um `b.type === 'taverna'`.
- **O resto.** As lamparinas de parede a cada 18 m² (D-746) e os modelos de comida, bebida, festa e jogos.

**A lacuna.**

- **O que um armazém mostra.** Os sacos, as ânforas e os fardos não aparecem. O que o 3D mostra é o `cx.fill`, uma parte abstrata do
  que a peça guarda (`fillOf`, `js/interiors.js:2642`), não as coisas.
- **O que não tem leitor.** Nada lê:
  - as ferramentas do ofício na parede;
  - as armas no armeiro;
  - os rolos da estante;
  - as oferendas do templo;
  - o tesouro do palácio;
  - os dias do preso.

### 1.4 A luz de dentro — já é de todos

- **O volume e as fontes.** `G.Luz3D` (`js/luz3d.js`):
  - as fontes: `L.sources`, com `FIRE_K` e `LAMPS` (o lampadário e o altar acesos com alguém acordado);
  - o assado: `L.bake`, feito aos pedaços (`L.job`, 3 ms por quadro);
  - o desenho: `L.frame`, `L.of` e `L.at`;
  - o atlas: 3 lugares de 64 × 32 × 64 voxels. O voxel tem 0,5 m até um lote de 32 m e fica mais grosso acima disso (`vs =
    max(0,5; ⌈L/64⌉)`): 0,625 m no colossal de 40 m e 0,875 m na maravilha de 52 m.
- **O resto da luz.**
  - O olho que se acostuma: `G.Ceu3D.EYE`.
  - As luzes de verdade com máscara (`gxLamp`, `js/fx3d.js`): 1 com sombra na Alta e 2 na Ultra (D-707).
  - A casca de dentro (`js/build3d.js`): `FLOOR` com `noble`/`mid`/`low` por tipo (`js/build3d.js:3315`), `INNER`, `DADO`, `FRISO`,
    `ICEIL`, a sombra de contato `B3.aoIn` e a janela sem vidro.
  - O recorte da cidade pelas aberturas: `R3.portalCull`, `B3.portals`.
  - As texturas altas: `G.Ground3D.hiWant`.
- **Regras e provas.** As regras 250–255 e 320–321, e o `qa/luz.js` l1–l10, que roda em todo prédio com planta.
- **Só da taverna**: a regra das lamparinas de parede e a conta da noite (`G.Taverna.luz`).

### 1.5 A gente dentro (o desenho) — já é de todos

- **O caminho da planta** (`js/people3d.js`): `wayTo`, `wayOut`, `wayDoor`, `wayStep` (no relógio do mundo, L-1906), `cellWay`,
  `mend` e `upOf`; mais o `Anim.walkWay` e o `Build3D.openPlace`.
- **O ato e a conversa.** O ato por cima do lugar é o `G.Vida3D.atPlace`. A conversa por turnos é o `talkAt` (D-752).
- **A roupa com causa** (`G.Atmos.dress`, com `inside`, `bed`, `duty` e `rich`; e o `js/look3d.js`), e o bebê no colo.
- **Os limites.** `OPEN_MAX = 3` e `OPEN_R = 8 m` (`js/build3d.js:5049`). `MAX = 96` corpos inteiros (`js/people3d.js:23`). Quem
  está dentro só é desenhado inteiro: a multidão simples nunca desenha ninguém de dentro (`js/people3d.js:1703`).
- **Regras e prova.** As regras 300–305, e o `qa/dentro-gente.js` d1–d6, que escolhe uma taverna.
- **Só da taverna**: os clipes (`js/mesa-clips.js`, `js/taverna-clips.js`, `js/taverna-noite-clips.js`), as duas partes dos atos a
  dois da taverna (`Anim.DUO`) e a coisa servida na mão (`G.Dentro3D.served`).

### 1.6 Os sons

**Genérico** (`js/audio-src.js`):

- **O lugar do som.** `A.ondeDe`/`lugarDe` dão o lugar da planta, não a porta (L-1960). O `A.perto` dá a escala de um cômodo.
- **A sala.** O chão pela planta (`A.chaoDe`), a parede (`A.paredeDe`) e o telhado (`A.telhadoDe`).
- **O eco** (`A.ecoDe`, por Sabine).
- **O que soa com causa.** A porta soa com quem passa (`In.passage`). O fogo crepita só aceso. Os passos pisam o chão da planta.
- **As tabelas e as regras.** As tabelas `G.Audio.GESTO` e `ATO`, e as regras 330–334 e 420–424.

**Só da taverna:**

- o burburinho de quem conversa agora (`op.def === 'taverna'`, `js/audio-src.js:630`; `A.vozesDe`, a língua da maioria);
- a música no compasso (`G.Audio.compasso`);
- a quarta onda: a festa em banda, a porta que cede e os jogos.

**A lacuna:**

- **O eco é do prédio inteiro.** O `A.ecoDe(b)` mede a casca toda, não o cômodo do ouvido.
- **Nada separa os cômodos.** Dentro do mesmo prédio, nenhuma parede abafa um cômodo do outro.
- **O fundo da sala existe só para a taverna e para os ofícios**, pelo `op.def`.

### 1.7 O corpo e a câmera — já são de todos

- **A quarta parede e a Vista** (`js/cam3d.js`).
  - **O corte**: `C3.cutBoxes`, `cutBox`, `keepBoxes`, `inCut`, `solidAll` e `openSolid`. O olho fica no volume da sala (D-738) e o
    corte é só da casca (regra 289).
  - **A Vista da sala** vai de um canto, sob o teto (`C3.vista`, `vistaPoseOf`, D-739).
  - **A lente**: `SIDE_FOV` 50°, `IN_FOV` e `FOV_MAX`.
- **A tela pelo lugar**: `IncUI.calm`, `IncUI.fightNear` e `Input3D.CALM`.
- **O Travar** que não mira pela parede: `Modes.lockCandidate`, `Modes.hostile`.
- **O corpo contra o contorno das peças**: `pieceDepth` no `js/avatar.js`.
- **Regras e prova.** As regras 280–289, o `QA.eye` e o `qa/olho-dentro.js`. O o2 entra em todo tipo com planta. O o3 é só para a
  taverna, a casa, a ínsula, o sobrado e o paço.
- **O que ficou aberto.**
  - **O D-737**: a escada de lado chegada de frente parece borda. Ficou proposta e não foi feita (nenhum código a cita).
  - **O T-1802**: no mega, uma taverna egípcia barra o corpo.
  - **O templo e a biblioteca astecas** param o corpo sem borda; ficaram «para a onda dos templos».

### 1.8 A interação

**Genérico:**

- **Os provedores.** `G.Interact` tem `lugar` (sentar em qualquer lugar da planta: `In.freeNear`, `In.freeFor`), `cama`, `escada`,
  `portaPlanta`, `chave`, `porta`, `guardados`, `armazem`, `pessoa`, `obra` e `atividade`, e os do trabalho no `js/trabalho.js`.
- **O registro dos verbos**: `I.verb`.
- **A pessoa da sala** é alvo e responde do lugar (D-917, D-918, regra 447). A tranca se tira por dentro (`In.guestIn`, `In.useDoor`,
  `In.doorLift`, `In.barOf`; D-910).
- **A lista das ações** (a tecla Y) é de qualquer alvo.

**Só da taverna:**

- o provedor `taverna` e os seus verbos (`T.rodada`, `T.musica`, `T.gorjeta`, `T.jogar`, `T.corpo`, `T.carta`, `T.order`,
  `T.bite`);
- o cardápio (`js/cardapio-ui.js`);
- a barra «Mesa» (`G.AcoesUI`: `UI.ORDER`, `I.here('taverna')`);
- os jogos (`G.JogoDados`, `G.Cartas`, `G.JogosCasa`, `G.JogosEnsina`, `G.JogoFX`).

### 1.9 A vida da sala (o mundo)

**As portas genéricas que a P7 criou:**

- **A entrada e a saída.** `G.Vg.enter` e `G.Vg.leave` com a caminhada, `t.inW`, `v.saiT` e `Vg.walkMS` (`js/villagers.js:348–379`).
  O `Vg.WALK_OUT` cobre `tavern`, `atender`, `lar`, `sleep`, `shelter`, `goHome`, `pray`, `termas`, `ler`, `teatro`, `rest`, `hide`
  e `conclave`.
- **O repartidor** (`In.places`, `js/interiors.js:2251`). Os passos vão nesta ordem: o corpo, os lugares guardados, quem sai, os
  presos em celas, o bebê no colo, os lugares tomados (`In.hold`/`holdAt`/`unhold`, `t.lugar`), as camas da casa, quem trabalha
  e, por fim, a regra do tipo.
- **As regras que cada tipo registra**: `In.placeRule`, `keepRule` e `bedRule` para o lugar; `In.doorRule`, `doorHold` e `doorLift`
  para a porta. A porta de entrada abre para quem passa (`In.passage`). `In.freeCount` conta os lugares livres.
- **O molde da vontade.** É o `T.wish`/`lot`/`hourOf`/`leaveOf`, o mesmo da freguesia (`G.Termas.urge`, `G.Biblioteca.urge`,
  `G.Praca`). Mais o `G.Vg.want`, o `G.Vg.weigh`, o posto (`T.onDuty`, como o `G.Termas.onDuty`) e o serviço pelo livro (a carga
  presa `to`).
- **O tempo e o contexto.** O descanso é o `G.Vg.REST`. O `G.linger` e o `G.paceCorpo` só podem ser registrados pelo `js/world.js`
  e pelo `js/act-taverna.js` (regra 476). As leituras do contexto são o `TC.of`.

**Só da taverna:**

- `js/act-taverna.js` (2.340 linhas);
- `js/taverna-contexto.js`, `js/taverna-festa.js` e `js/taverna-oficios.js`;
- a bebedeira (`js/embriaguez.js`), que se pode reaproveitar;
- os jogos.

**A lacuna.** Ainda escrevem `v.inside = b.id`, sem a caminhada:

- `js/act-lazer.js:48` (`goIn`: o teatro, a leitura);
- `js/act-servicos.js:394` (`goIn`: os banhos);
- `js/act-oficio.js:466` (o ofício);
- `js/court.js:427` (a audiência);
- `js/crime.js:35/337/342` (a cela);
- `js/economy.js:868/1126` (a mina, o posto da torre);
- `js/city.js:841` (a visita ao teatro e à biblioteca).

O desenho anda pela planta, mas o mundo não espera a caminhada.

### 1.10 As provas

- **Genéricas** (o prédio novo entra nelas de graça):
  - `qa/plantas.js`, `qa/catalogo.js confere`, `qa/interiores-inv.js`, `qa/lugares.js`, `qa/motor-plantas.js`;
  - `qa/luz.js`, `qa/olho-dentro.js` (o2), `qa/visual/interior3d.js`, `qa/visual/malhas.js`;
  - `qa/dentro.js` d1, d6, d7 e d8;
  - `qa/oldsave.js`, `qa/corrupt.js`, `qa/mundos.js`, o `QA.eye` e o `G.VidaInv`.
- **Só da taverna**:
  - o padrão: `qa/taverna-padrao.js`, com t1 a t5;
  - a vida e o corpo: `qa/taverna-vida.js`, `qa/taverna-corpo.js`, `qa/taverna-cadeia.js`, `qa/noite-mesa.js`;
  - a bebedeira e os jogos: `qa/embriaguez.js`, `qa/jogo-dados.js`, `qa/cartas.js`, `qa/jogos-casa.js`, `qa/acoes.js`;
  - os verificadores `taverna-vida-inv` e `taverna-cadeia-inv`.
- **As listas a abrir.** O prédio novo também precisa entrar nas listas fixas das provas genéricas: o o3 do `olho-dentro`, o prédio
  do `dentro-gente` e o m2 e o m7 do `moveis`.

---

## 2. A receita: o que cada prédio precisa fazer

**O tamanho.**

| Tamanho | O que é |
|---|---|
| **P** | uma tarde de uma frente: menos de ~300 linhas e uma prova rápida |
| **M** | uma frente inteira, como a P1 ou a P4 |
| **G** | duas a três frentes, como a P3 e a P2 da taverna |
| **GG** | uma onda inteira, como a quarta onda da taverna, ou algo que depende de um patch futuro |

A taverna levou ≈ 15 frentes e 137 commits em dois dias.

### 2.1 A lista de cada prédio, por camada

**1. Planta**

- [M] **A sonda do «antes».** A área de cada cômodo, as peças, os lugares de uso, a passagem mais estreita da porta até cada coisa,
  as variantes por povo e tamanho e o tempo da planta. O `medir.js` do §6 é o molde.
- [M–G] **O programa em zonas, com o kit** (F1):
  - o que cada cômodo é;
  - as peças fixas e as suas posições de reserva (`alt`);
  - as zonas guardadas;
  - o eixo de cerimônia, quando houver;
  - o corredor de 1 m da porta até toda coisa que se usa;
  - os grupos de assentos, com o assento sobre a peça (F2);
  - nenhuma peça fixa solta, a não ser de propósito (como o fogo comprido do nórdico).
- [M] **As variantes**: pelo menos 3 por povo e degrau, pelo registro e pelo id, e pela riqueza de agora (F6). Nenhum par igual.
- [P] **As peças novas do catálogo.** Medidas combinadas antes com a frente dos móveis, como no contrato §4. Nome único: o caso
  `estrado` contra `estrado-musico` (D-665).
- [P] **A versão e a migração.** O `In.VERSION` (ou a versão do tipo, F13), o catálogo gerado de novo, o fato `reforma` num save
  antigo, o `oldsave` com o `qa/oldsave_7.json` e o `corrupt`.
- [P] **A folha da matriz**: `qa/categorias/pN.js`.

**2. Móveis**

- [M–G] **Um modelo por peça do programa, para os seis povos** (na `moveis_tabela.py`). Com a variante `~rico`, as âncoras (`tampo`,
  `prateleira`, `gancho`, `nicho`), os dois níveis e o orçamento: os triângulos por peça e as malhas e triângulos do prédio, como a
  m7.
- [P–M] **A peça-herói de cada povo** (o trono, o ídolo, o altar), pelo mesmo caminho do script.

**3. Decoração**

- [M] **O leitor do tipo no `within`**, puro: o que o prédio tem e por quê. Lê o livro, a origem, a riqueza, o ofício e os anos.
- [M] **As coisas novas e o seu lugar.** As coisas no `deco.py`, com até 700 triângulos e a regra de cada uma no `CAUSA`. O
  construtor do tipo no `dentro3d.js` diz onde cada coisa pousa (as âncoras, as paredes, o chão ao lado).
- [P–M] **Os registros do mundo que a decoração lê**, feitos pela frente do mundo: o que se gasta, o que cai no chão, a marca dos
  anos.

**4. Luz**

- [P] As fontes com causa do tipo: `FIRE_K`, `LAMPS`, o ramo do `G.Atmos.fire` do tipo, e o combustível do prédio para as
  lamparinas.
- [P] A regra das lamparinas de parede, se o salão pede.
- [P] O chão, a parede e o friso do tipo (`FLOOR`, `B3.shownIn`).

**5. Gente dentro**

- [P] Uma linha no `TASK_OF` para cada tarefa nova.
- [M] Os clipes dos atos do prédio, com espelho e as duas partes no `Anim.DUO`: ajoelhar, a reverência, o martelo, o tear, o preso
  acorrentado.
- [P] A roupa de posto (`duty`).

**6. Som**

- [P–M] O fundo da sala do tipo (quem faz o quê agora) e uma linha no `G.Audio.ATO` para cada ato.

**7. Corpo e câmera**

- [P] Entrar com o corpo (o degrau e o pódio: D-737).
- [P] O tipo na lista do o3 do `olho-dentro`.
- [P] As fotos de antes e depois (`interiores/A/fotos-int.js`).

**8. Interação**

- [P–M] Os verbos do lugar (`G.Interact.verb`).
- [P–M] A barra do lugar onde o corpo toma um lugar (F14).
- [P–M] Quem está dentro responde do lugar.

**9. Vida (o mundo)**

- [M] **Entrar e sair pela porta** em todo afazer do prédio (`G.Vg.enter`, `WALK_OUT`, `In.hold`; F5).
- [M–G] **Quem vai ao prédio**: a vontade de ir (o molde), o posto de quem trabalha ali e o serviço pelo livro.
- [G–GG] **Os atos com causa do prédio**: a audiência, o banquete, o rito, a visita ao preso. E o contexto (`TC.of`: a guerra, o
  luto, a festa).

**10. Provas**

- [M] **As três provas do tipo.**
  - `qa/<tipo>-padrao.js`: o padrão medido pelas contas da prova, não pelas da receita (F16).
  - `qa/<tipo>-vida.js`: a vida com os casos ruins (o save no meio, a pessoa que morre, a mão do deus, o prédio que cai).
  - `qa/<tipo>-inv.js` com o `junta-inv.js`.
- [M] **As regras e as listas.** As regras do guard com os números reservados. O tipo nas listas das provas genéricas.

### 2.2 O retrato de hoje, medido

Planta feita sem cache, em Node, no mundo pronto `mega` (ano 118, 1.932 pessoas; o `metropole` dá números parecidos). As colunas:

- **ms**: o tempo de fazer a planta, a mediana e o máximo;
- **cômodos, peças, m²**: os do maior prédio do tipo;
- **caixas**: as peças desenhadas pelo `FURN`;
- **coisas**: a decoração (`D.plan`);
- **casca**: o `B3.interior` da casca, em Node.

| Tipo | ms (med/máx) | Cômodos | Peças | m² | Caixas | Coisas | Triângulos | Casca |
|---|---|---|---|---|---|---|---|---|
| taverna (estalagem 12 m) | 127/343 | 7 | 38 | 147 | 2 | 60 | 23.610 | 13,6 ms |
| palácio (24 m) | 67/96 | 12 | 47 | 504 | 16 | 7 | 36.362 | 35,2 ms |
| grande palácio (32 m; metrópole) | 205 | 16 | 63 | 939 | — | — | — | — |
| paço | 18 | 1 | 12 | 20 | 1 | 10 | 5.662 | 4,3 ms |
| templo (16 m) | 10/20 | 10 | 9–22 | 174 | 21 de 22 | 0 | 4.776 | 11,3 ms |
| cadeia | 17/40 | 9 | 11 | 81 | 10 de 11 | 2 | 6.656 | 16,9 ms |
| quartel | 15/32 | 8 | 10–14 | 91 | 11 de 14 | 1 | 5.676 | 1,9 ms |
| armazém / storehouse | 15/23 · 3/6 | 6–7 | 6 | 85–109 | 6 de 6 | 1–2 | 2.574–4.052 | 1,7–21 ms |
| olaria | 4/6 | 3 | 9 | 46 | 9 de 9 | 0 | 3.184 | 1,1 ms |
| forja / oficina / tecelagem | 3/18 | 4–7 | 4–6 | 46–92 | 4–5 de 5 | 1–2 | 3.420–5.870 | 5–10 ms |
| biblioteca | 18/27 | 2 | 8 | 32 | 7 de 8 | 0 | 8.756 | 7,8 ms |
| banhos | 9/18 | 3 | 6–7 | 37 | 7 de 7 | 0 | 906 | 2,5 ms |
| mercado · feira · praça | 5–22 | 1 | 13–26 | 54–137 | todas | 0 | 816–4.858 | ≤ 5,4 ms |
| casa · sobrado · ínsula | 34/101 · 11/574 · 44/658 | 3–6 | 8–12 | 17–48 | 2 a 5 | 4–7 | 2.294–5.830 | 2–9 ms |
| quarteirão | 53/88 | 23 | 42 | 223 | 15 de 42 | 11 | 20.446 | **43,8 ms** |
| teatro (24 m) | 52/63 | 3 | 41 | 670 (o maior 566) | 11 | 2 | 16.888 | 6,2 ms |

O que isso diz:

- **A densidade.** A taverna tem 26 peças por 100 m². O palácio tem 9, o grande palácio 7, o templo 5 a 13, e as oficinas e o
  armazém 4 a 7.
- **A variedade.** O palácio de pátios sai de um risco só, puro, por povo e tamanho (D-110: a forma não lê o id). O relatório B
  mediu o mesmo nos prédios pela forma (o palácio, o templo, as termas, o mercado): uma família e uma arquitetura, e o arranjo das
  termas e do mercado idêntico nos 40 prédios. A variedade de arquitetura deles é zero.
- **A planta grande sai inteira.** Uma tentativa não se divide (`In.pump` só para entre uma tentativa e outra). A ínsula e o sobrado
  já passam de meio segundo no pior caso.

### 2.3 A matriz do esforço, prédio por prédio

| Prédio | Planta | Móveis | Decoração | Luz | Gente | Som | Corpo/câm. | Interação | Vida | Provas | **Total** |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Palácio** (paço, palácio, grande, colossal) | G | G | G | M | M | M | M | M | GG | G | **GG** |
| **Casas nobres** (domus 8 m) | M | M | M | P | P | P | P | P | M | M | **G** |
| **Casas do povo** (cabana, casa, sobrado, ínsula, quarteirão, barraco) | G | G | M | P | M | M | M | P | G | G | **GG** |
| **Templo** (santuário a monumental) | G | G | G | M | M | M | M | M | G | M | **G–GG** |
| **Cadeia** | M | M | M | P | M | P | M | M | G | M | **G** |
| **Quartel** | M | M | M | P | M | P | P | M | M | M | **G** |
| **Armazém, celeiro, storehouse** | M | M | G | P | P | P | P | P | M | M | **G** |
| **Olaria** | M | M | M | P | M | P | P | M | M | M | **G** |
| **Oficinas** (forja, oficina, tecelagem, ourives, açougue) | M | G | M | P | M | M | P | M | M | M | **G** |
| **Mercado, feira, praça** | M | M | G | P | M | P | P | M | M | M | **G** |
| **Biblioteca** (e a grande) | M | M | M | P | M | P | P | M | M | P | **M–G** |
| **Banhos e termas** | M | M | M | M | M | M | P | M | P | P | **M–G** |
| **Porto e cais** (doca e armazém do porto) | **GG** | G | G | P | M | P | M | M | G | G | **GG**, com o Patch 35 |
| **Teatro, Coliseu, maravilha** | M | M | M | P | G | M | M | M | M | M | **G** |
| **Os sem dentro** (administração, coletoria, estábulo, mina, mercado negro, salga, sericultura, perolaria) | GG cada | G | M | P | M | P | M | M | G | M | **GG**, a maioria com o seu patch |

### 2.4 Os prédios que o dono citou

**O palácio** (`paco`, `palacio`, `grande_palacio`, `palacio_colossal`)

- **O que já existe.** O programa existe nos degraus maiores (`js/forma-poder.js`, D-110): o pódio, o pórtico, os pátios, as alas,
  o salão do trono (14 × 9,4 m, com 9,4 m de pé-direito), a audiência, o conselho, os escribas, a guarda, a cozinha, o banquete, o
  tesouro e os aposentos. A mobília é de `palaceFormFurnish` (`js/int-palacio.js:307`): o trono, as zonas, os postos da guarda, os
  lampadários, os bancos e as marcas da audiência em fileiras.
- **O que falta, na planta.**
  - O estrado do trono: uma fileira de `tiers` ou uma peça nova.
  - O corredor da audiência, da porta até o trono, com 1,5 a 2 m.
  - O banquete com grupos de mesa: o triclínio dos leitos para o romano e o grego, as mesas compridas para o nórdico.
  - O conselho com assentos.
  - As variantes: hoje há uma arquitetura por povo e tamanho.
- **O que falta, nos móveis.** Uns 12 tipos: o trono por povo, como peça-herói; a mesa de banquete e os leitos; o banco da corte; a
  mesa do conselho; a mesa do escriba; o cofre; o armeiro; o catre; a fonte; o braseiro; a estante do arquivo; a cadeira de honra.
- **O que falta, na decoração.** Ler o tesouro, a comida do banquete (a sede guarda como casa: `'h:'`), as armas da guarda
  (`O.forged`), as tapeçarias (onde se tece, a sede rica), os estandartes do povo, os despojos e os presentes, com o seu registro.
- **O que falta, na vida.** A corte de todo dia: hoje a audiência só acontece na resposta a uma petição, na coroação ou na embaixada
  (`Co.audiencia`, `js/court.js:393`). E o banquete com causa, o conselho, os postos da guarda e os criados.
- **O grande salão pede as fundações dos prédios grandes**: F9 (aos pedaços), F10 (o eco do cômodo) e F11 (a multidão dentro).

**As casas**

- **O que já existe.** 55 a 60 famílias, o núcleo da casa (D-196) e o `house(ctx)` da decoração.
- **O que falta.**
  - A esteira que se pisa (F3): de 24 % a 39 % do chão das moradias é esteira.
  - O assento à mesa comum (F2).
  - Os modelos dos móveis da casa: `mesa-casa`, `banco-comer`, `esteira-comer`, `banco-cama`, `berco`, `braseiro`, `fogareiro`,
    `fogo-chao`, `prateleira-parede`, `cesto`, `nicho`, `despensa` e `tina`, e os estilos por povo do `lar`, do `fogao` e dos
    `jarros`.
  - A riqueza de agora na planta (F6).
  - O ofício do chefe da casa na parede e o altar doméstico, cada um com a sua causa.
  - A ceia e a noite em casa (`js/act-lar.js`).
- **O custo de mexer.** Tocar a gramática das casas pede o `qa/casa-dentro.js 2` (21 min) e o catálogo de novo.

**A prisão** (`cadeia`)

- **O que já existe.** As celas com grade (`gradeGeo`), o corredor e a mesa do carcereiro (`w-corredor`, `w-celas`, `w-patio`), e o
  preso no passo 1 do `In.places`.
- **O que falta.**
  - A entrada pela porta: o `crime.js` ainda põe o preso na porta e lá dentro de uma vez.
  - Os modelos: `catre`, `palha`, `balde`, `chaves` e a grade de cada povo.
  - Na decoração: as correntes (os grilhões do kit, D-612), os riscos dos dias pelo tempo do preso e a tigela da ração.
  - A vida: o posto do carcereiro, a comida, as visitas e a soltura.

**O porto e o cais**

- **O que existe.** A doca não tem planta nem forma. A descarga (`js/act-porto.js`) põe as caixas num lugar do livro (`'q:'`, o
  `crateSpot`). O armazém do porto tem planta. A alfândega e o estaleiro nem existem como tipo.
- **O que falta.** Pede a fundação do interior ao ar livre (F12), e a viagem e o navio por dentro são do Patch 35 (N2, N3). Proponho
  fazer agora só o mínimo: a planta aberta do cais, com os postos, os lugares das caixas, a prancha e os cabeços.

**O armazém e o celeiro**

- **O que já existe.** A planta está boa (o corredor de carga do `PROG.storehouse`, as baias, as tulhas).
- **O que falta.**
  - Ler o que cada peça guarda e o que há de verdade: as chaves de `In.depotStores` e o livro `f:`/`b:`.
  - Mostrar as coisas: os sacos pelas partes do grão, as ânforas de azeite e de vinho, os fardos, as toras, as pedras, os lingotes
    e o sal.
  - A conta do capataz.

**A olaria**

- **O que já existe.** O terreiro já tem a roda, o forno, o secador, o tanque e a eira, e as operações do `G.Oficio`.
- **O que falta.**
  - Os modelos dessas cinco peças.
  - Um banquinho na roda, para o oleiro não sentar no ar.
  - Os potes por estágio, lidos da operação e do livro.
  - A entrada pela porta (`js/act-oficio.js:466`).

**O templo**

- **O que já existe.** A forma dos seis povos (`forma.templo`), o altar e o lampadário acesos com alguém acordado (`LAMPS`), e o
  `pray` no `WALK_OUT`.
- **O que falta.**
  - O ídolo e o altar por povo, como peças-herói.
  - O corredor até o altar e as fileiras de assento.
  - As oferendas com causa: hoje nenhum registro diz o que se oferece.
  - O incenso pelo que o povo tem.
  - O canto e o eco.
  - O posto do sacerdote e os ritos (as festas, os funerais, os casamentos).
  - O pódio do asteca que barra o corpo (§1.7).

---

## 3. As fundações que faltam

Cada uma vem com o que falta, onde, o tamanho e o que destrava.

**F1 — O kit da taverna no motor (M–G, não muda o mundo se as receitas não mudarem).**

- **O que fazer.** Passar ao `KIT` de `js/interiors.js` o que hoje é fechado em `js/int-trabalho.js`:
  - `P.aisle(lv, quarto, de, alvos, largura)`: a árvore do corredor, de `tavClear`/`tavFlood`/`tavGrow`/`tavBand`, que vira
    `P.zones` com `aisle`;
  - `P.groups(lv, quarto, modelos, o)`: o `TPL` e o empacotador do `tavTables`, com o assento sobre a peça;
  - as posições de reserva das peças fixas (`alt`);
  - o quadro virtual com espelho (`tavFrame`) e as escolhas pelo registro (`tavAxes`), como um molde.
- **O que destrava.** O eixo da audiência e o banquete do palácio; o corredor até o altar e as fileiras do templo; as mesas de
  leitura com bancos; a mesa do quartel; a mesa da casa.
- **O risco.** A taverna tem de sair igual, byte a byte: o `qa/taverna-padrao.js` antes e depois.

**F2 — O assento de verdade em todo lugar sentado (M, muda o mundo).**

- **A causa.** O `USE_ST` põe sentado o `ler`, o `escrever`, o `tecer`, o `tornear`, o `lavrar`, o `banhar` e o `comer`
  (`js/interiors.js:1943`). Onde o lugar fica ao lado da peça (`on: 0`), o `In.rootY` dá 0 e o corpo senta no ar. São a
  `mesa-leitura` (`js/int-civicos.js:54`), a `mesa-escriba`, o `tear`, a `roda-oleiro`, a `bancada-ourives` e a `mesa`
  (`js/int-moveis.js:61–183`). A E mediu 159 lugares assim na metrópole e 100 % dos leitores da biblioteca no ar; o conserto do
  L-1840 foi só da taverna.
- **O que fazer.** A regra 271 para todos os tipos: o banquinho, o banco ou a cadeira em grupo (F1), ou o assento como parte da peça
  (o banco do tear). E a regra «ninguém sentado no ar» no `qa/interiores-inv.js` para todo tipo.

**F3 — O chão coberto que se pisa (M, muda o mundo).**

- **A causa.** A esteira (6 cm), a esteira de oração (3 cm) e a de comer viram `C.LOW` na grade, e o andar só aceita `FLOOR`, `DOOR`
  e `HATCH` (`PASS` e `NEAR`, `js/interiors.js:1399–1402`). Isso é de 24 % a 39 % do chão das moradias (o relatório B).
- **O que fazer.** Um código de grade para a peça fina: pisa-se, não se fica parado em cima dela. Mexe no `PASS`, no `NEAR`, no
  `openCode`, no `lieRects` e no `In.walk`, no corpo (`avatar.js`) e no validador.
- **O risco.** Muda o caminho e o alcance de todas as casas, e pede o catálogo e o `casa-dentro` de novo.

**F4 — A porta de dentro que abre para quem passa (M, muda o que se vê).**

- **A causa.** `In.doorState` devolve `fechada` para toda porta de dentro que não é vão (`js/interiors.js:2624`), e o `In.passage` só
  conta a porta de entrada (`js/interiors.js:2478`). As folhas seguem o estado (`js/build3d.js:5181`). Com isso, no palácio, nas
  casas de cômodos, nas celas e na adega, as pessoas passam pela folha fechada.
- **O que fazer.** A passagem por uma porta de dentro: o trecho do caminho que cruza uma célula `DOOR`, no relógio do mundo (`t.inW`,
  `v.saiT`, `t.ww`, `t.mw`). E o som da porta de dentro.

**F5 — A entrada e a saída pela porta em todo afazer de estada (M–G, muda o mundo).**

- **O que fazer.** Trocar os `v.inside = b.id` com `G.Vg.door` do §1.9 pelo `G.Vg.enter`, pôr cada afazer no `WALK_OUT` e no
  `In.hold`, e uma regra do guard: ninguém escreve `v.inside` fora dos arquivos que podem.
- **O risco.** A mesma causa nos três níveis (`invariancia.sh`), o `det3`, e a cela, que é uma tarefa longa (`LONG`, L-723).

**F6 — A riqueza de agora na planta, para qualquer tipo (P–M, muda o mundo).**

- **O que fazer.** `In.wealthRule(uso, fn)`, no molde do `doorRule` e do `placeRule`. Generaliza o `rec.q` e o `In.tavernStep`: quem
  é o dono (a casa da família, o taverneiro, o tesouro do povo para a sede e o templo, o mestre da oficina), a faixa que não vai e
  volta, a paciência e o fato `riqueza`.
- **O que destrava.** A casa que enriquece e muda por dentro (D-661), e o palácio pelo tesouro. A decoração já lê o `G.Atmos.rich`.

**F7 — A decoração em módulos (M).**

- **O que fazer.**
  - **Os leitores do `within`.** Dividir o `withinOf`: o núcleo genérico e um leitor por uso (`At.withinRule(uso, fn)`), com a
    assinatura do leitor dentro da `sig`.
  - **Os construtores do `Dentro3D`.** Um registro de construtores (`D.builder(uso, fn)`) no lugar do
    `if (b.type === 'taverna')`.
  - **As leituras genéricas novas:**
    - o que uma peça de guardar tem de verdade, pelas chaves do `In.depotStores` e pelo livro, e não o `cx.fill` abstrato;
    - as ferramentas do ofício na parede (o kit do ofício, o `O.forged`);
    - os riscos dos anos, generalizados dos `rabiscos` (os dias do preso, as marcas do quartel).
- **O que destrava.** Frentes de prédios em paralelo sem brigar pelo `atmos.js` e pelo `dentro3d.js`.

**F8 — As bibliotecas de malhas em pacotes por família de prédio, carregados sob demanda (M–G).**

- **A causa.**
  - **As bibliotecas estão quase cheias.** O `js/movelmesh.js` tem 3,84 de 5 MiB (`qa/visual/malhas.js`, `LIB_MB`). O
    `js/decomesh.js` tem 3,25 de 3,5 MiB (`G.DECO.budget.arquivo`).
  - **O que falta pede várias vezes o que há.** Faltam 68 tipos de peça, cada um para seis povos.
  - **O artefato tem teto por arquivo.** Cada arquivo do artefato publicado tem até 16 MB.
- **O que fazer.** Um arquivo por família (casa, oficina, templo, palácio, guarda, armazém, porto), carregado quando um prédio dela
  abre, como as texturas altas (`G.Ground3D.hiWant`, que monta um `<script>`); o que ainda não carregou desenha pelas caixas. Os
  números em 16 bits. E juntar as partes de um modelo numa malha só, com a cor no vértice, para cortar malhas (a ideia do D-665).
- **O que destrava.** Duas frentes de móveis de prédios diferentes não regravam o mesmo arquivo gerado.

**F9 — Os prédios grandes aos pedaços (G).**

- **A receita.** Hoje o `F.build(P)` sai de uma vez. Ela vira um gerador que pausa entre os cômodos e as alas, para uma tentativa
  não custar meio segundo de um quadro: a ínsula chega a 658 ms e o grande palácio a 205 ms com 16 cômodos.
- **A casca.** Hoje é um quadro só (`part: 'shell'`). Ela passa a ser feita por andar e por ala, em vários quadros.
- **O recorte de dentro do prédio.** Hoje só os pedaços da cidade são recortados. O recorte passa a valer para os cômodos que as
  aberturas do cômodo do olho não deixam ver (como o `B3.portals`).
- **A meta de tempo por tipo**, provada no padrão: a planta, a casca, os móveis, a decoração e a luz, no PC e no celular.

**F10 — O eco e o fundo pelo cômodo (M).**

- **O eco do cômodo.** O `A.ecoDe` passa a ser o do cômodo do ouvido: a área, a altura e o chão dele.
- **A parede entre dois cômodos abafa.** É a mesma grade, o mesmo `wallBetween`.
- **O fundo de cada uso.** Uma porta para o fundo da sala de cada uso (`A.salaDe(uso, fn)`): a corte que murmura, o canto, o
  martelo, o tear, as correntes. Generaliza o burburinho da taverna (quem conversa agora).

**F11 — A multidão dentro (M).**

- **O que fazer.** Dentro de um salão grande, além de alguns metros do olho, quem está lá vai para a multidão simples (`MAXC` 320)
  com a pose do lugar (`crowdPose`), e não ocupa os 96 corpos inteiros.
- **Os limites.** O custo `vida-custo` fica em até 4 ms. O desenho só lê o mundo.

**F12 — Os interiores ao ar livre (G).**

- **A planta aberta da doca.** A casca `aberta`, como a da feira e da praça, com as `marks` dos postos do estivador, os lugares das
  caixas (o `'q:'` e o `crateSpot` saem da planta), a prancha, os cabeços e o guindaste quando o povo souber.
- **A ligação com o navio atracado.** A alfândega, o estaleiro e a escola de gladiadores entram como tipos novos no seu patch.
- **A câmera, a luz e o som.** A câmera e a luz são as de fora. O som do bairro `cais` já existe.

**F13 — A versão da gramática por tipo (M).**

- **A causa.**
  - Hoje um `In.VERSION` só leva a chave da planta (`':g' + In.VERSION`, regra 67), o `intG` do save e o `In.addProbed`.
  - Mudar o palácio invalida o catálogo inteiro. O jogo passa a provar as famílias ao vivo e trava até o catálogo ser gerado de novo
    (≈ 1 h). Num save antigo, todo registro de todo tipo é julgado de novo (as portas e as famílias se movem).
- **O que fazer.** Um `In.VERSION_T[tipo]` na chave e no catálogo, e o `intG` guardado por tipo. Uma última subida global (para a 7)
  migra para o formato novo; depois disso, cada onda só refaz os tipos que mexeu.
- **O ganho.** É o maior corte do custo de cada onda.

**F14 — A barra do lugar e os verbos do corpo por lugar (P–M).**

- **O que fazer.** A barra «Mesa» (`G.AcoesUI`, `UI.ORDER`, `I.here('taverna')`) vira `UI.bar(provedor, ordem)`, para qualquer lugar
  que o corpo tome: o trono, o altar, a bancada, o banco da nave, a mesa do banquete. E o «responder do lugar» (regra 447, L-2171)
  vale para quem está dentro de qualquer prédio.

**F15 — O tempo que se demora para quem vive (P).**

- **O que fazer.** Abrir o `G.linger` a outras causas registradas (a audiência, o banquete, o rito com o corpo dentro). Hoje a regra
  476 só deixa o `js/world.js` e o `js/act-taverna.js` registrarem.

**F16 — A prova padrão por tipo (M).**

- **O que fazer.** Um arnês comum, `qa/padrao.js <tipo>`, com uma folha por tipo:
  - a área de cada cômodo, o corredor, os assentos sobre a peça e as peças de cada zona;
  - ao menos 3 variantes e nenhum par igual;
  - o tempo da planta;
  - nenhuma peça desenhada pelas caixas, o orçamento de malhas e de triângulos;
  - a decoração toda com causa, as fontes de luz com causa;
  - o olho de o2 e o3.
  É o `taverna-padrao` somado ao `dentro`, ao `luz`, ao `olho-dentro` e ao `interior3d`, parametrizado por tipo. Barateia cada onda
  e mantém o protocolo.

### 3.1 As perguntas, uma a uma

- **Vários cômodos, portas de dentro e corredores.** O motor já tem tudo: `room`, `split`, `door` entre cômodos, `walls4`, as
  famílias de corredor entre celas, de salas em fila, de pátio com alas e de três naves (`js/int-trabalho.js:22–40`), os 23 cômodos
  e 18 portas de dentro do quarteirão, e os 16 cômodos e 15 portas do grande palácio. O validador cobra que todo cômodo seja
  alcançado. O que falta:
  - a porta de dentro abrir para quem passa (F4);
  - o «corredor de 1 m» até cada coisa ser do kit (F1);
  - o eco do cômodo (F10).
- **Andares e escadas.**
  - **A planta suporta:** os andares (`level`, com os tipos `jirau`, `galeria`, `andar`, `terraco`, `porao` e `elevado`), a grade por
    andar, o alçapão (`HATCH`), o teto baixo do jirau, que se anda de gatinhas (`LOWROOF`), e a escada com a passagem (`stair`, a
    `escada-de-mao`, a escada larga, o poço da escada grande). A ínsula e o quarteirão chegam a 5 andares.
  - **O caminho:** o `walkField` e o `In.pathIn` sobem e descem pelas escadas.
  - **O 3D:** cada andar, a escada aberta (`inStair`), o corrimão do poço (`wellRail`), as tampas e o telhado por baixo (`inRoof`).
  - **A câmera:** o piso do andar, o corte acima do olho e o alçapão (L-1870).
  - **A luz não atravessa um piso.**
  - **As pessoas:** o andar do lugar (`wlv`).
  - **O que falta:** a câmera nas escadas grandes e nos pódios (L-1863 mostra que cada forma nova acha um caso), e o corpo nos
    degraus de fora (D-737).
- **Salões grandes.** Já existem (o trono de 138 a 320 m², o teatro de 566 m²), vazios. Faltam:
  - as zonas e os grupos (F1), o estrado, as colunas por dentro (`P.colonnade`);
  - a decoração do tipo (F7), a luz das janelas altas e os muitos lampadários (o assado já aguenta);
  - o eco (F10), a multidão (F11) e os pedaços (F9).
- **Pátios.** Também já existem: a `domus.patio` (`js/int-familias.js:758–815`), os pátios do palácio, o `shell.court`, o
  `courtOpen` da luz. No pátio a câmera é a de fora e a Vista não liga, porque ela é «só sob um teto». Faltam:
  - o jardim e a fonte com causa;
  - as colunas modeladas;
  - a vida da casa no pátio;
  - a chuva molhando o chão do pátio (o `G.Agua.wet`).
- **Interiores ao ar livre.** A feira, a praça e o mercado já são `aberta`, com bancas e `marks`. Faltam:
  - o vendedor na banca e o que a banca vende (F7);
  - a doca (F12);
  - os tipos que não existem (a alfândega, o estaleiro).
- **A biblioteca de móveis e as causas da decoração.**
  - Faltam 68 tipos de peça (§1.2), e vários povos usam o modelo de outro (pelo `alias`).
  - A decoração só tem leitores para a taverna e a casa.
  - Os dois arquivos estão perto do teto (F7, F8).
- **A luz de salões grandes e a multidão dentro.**
  - **A luz.** O assado cobre muitas fontes (todas no canal G do volume). As luzes de verdade são só 2 a 4, e com sombra 1 a 2.
    Acima de 32 m o voxel fica mais grosso (0,6 a 0,9 m).
  - **A multidão.** São 96 corpos inteiros, e de dentro não há multidão simples (F11).
- **Desempenho: um palácio de 40 cômodos.** Pelas medidas, ficaria assim:
  - **A planta:** ≈ 0,5 a 0,8 s por tentativa (precisa de F9).
  - **A tabela dos lugares:** era quadrática e foi consertada (L-495, L-511). Hoje leva 234 ms no colossal e já é feita em segundo
    plano (a fila `tline`).
  - **A casca:** ≈ 100 ms em Node e 3 a 5 vezes isso no celular (precisa de F9).
  - **A luz:** em pedaços de 3 ms (o grande palácio leva uns 25 quadros).
  - **Os móveis:** com ≈ 250 peças, umas 160 malhas por modelo, parte e padrão, contra as 64 da taverna (F8: juntar as partes).
  - **A decoração:** 600 coisas ou mais.
  - **As pessoas:** um salão cheio passa dos 96 corpos (F11).
- **O custo de refazer o catálogo.**
  - **O que leva a mais tempo.** Subir o `In.VERSION` pede:
    - o `node qa/catalogo.js gera tudo` (≈ 1 h com a máquina livre, em partes paralelas: `parte` e `junta`);
    - o `confere 30` (minutos) e o `qa/plantas.js`;
    - o `qa/casa-dentro.js 2` (21 min) se mexeu nas casas.
  - **O resto.** E ainda o `oldsave` com o `qa/oldsave_7.json`, o `corrupt`, os mundos prontos de novo (`qa/prontos.js`) e o
    `qa/mundos.js`.
  - **O que acontece sem o catálogo.** O jogo prova cada combinação ao vivo e trava (o relatório B, §4).
  - **Como baratear.** Juntar todas as mudanças de gramática de uma onda numa subida só (como fez a P3, de 5 para 6) e fazer a F13.

### 3.2 A ordem proposta

```
Fase 0 — nada muda no que se vê (pode correr em paralelo):
  F13 versão por tipo ─┐
  F1  kit da taverna ──┼─► F16 prova padrão por tipo
  F7  decoração em módulos ─► F8 bibliotecas em pacotes
  F6  riqueza genérica · F14 barra do lugar · F15 linger
Fase 1 — o mundo muda (uma geração dos mundos prontos):
  F2 assento de verdade (usa F1) · F5 a porta em todo afazer · F4 a porta de dentro · F3 a esteira que se pisa
Fase 2 — junto com o primeiro prédio grande:
  F9 aos pedaços · F10 eco por cômodo · F11 multidão dentro
Ondas de prédios (cada uma com a sua sonda, o seu padrão e a sua vida):
  A palácio + casas nobres → B casas do povo → C templo → D oficinas e olaria →
  E armazém, celeiro, mercado e feira → F cadeia e quartel → G biblioteca e banhos →
  H teatro, Coliseu, maravilha → I porto e cais (F12, com o Patch 35) → J os sem dentro (cada um com o seu patch)
```

- **Por que nessa ordem.**
  - A F13 e a F1 primeiro: são baratas e barateiam todo o resto.
  - As fundações que mudam o mundo juntas: uma só geração dos mundos prontos e uma só medida da economia e da sociedade.
  - A F9 a F11 no palácio: é o primeiro prédio que precisa delas.
  - A ordem das ondas é a do `interiores-2.md` §6, com o porto adiado para o Patch 35.
- **A alternativa.** Pôr as casas do povo antes do palácio: são 60 % dos prédios, o Patch 23 (As Vidas) mora nelas e elas testam a
  F3.
- **As ondas C a G podem correr em paralelo** depois da F7, da F8 e da F13, porque cada uma passa a ter os seus arquivos.

---

## 4. Os riscos aprendidos com a taverna

- **R1 — As frentes que escrevem o mesmo nome.**
  - **Casos:** a letra do livro (`'k:'` era ao mesmo tempo o pote das Tabuletas e a despensa: as apostas sumiam, L-2064; a regra
    392); o nome da peça (`estrado` e `estrado-musico`, D-665); a função de um objeto escrita por cima de outra (`C.vista`, L-2062);
    o comentário que engole a linha (o comércio e as migrações ficaram fora do passo do mundo por semanas, L-2224, regra 475); a
    chave solta no CSS (L-2040).
  - **Como evitar:** o contrato da onda reserva as letras do livro, os nomes de peças e de coisas e os nomes exportados de cada
    frente; o supervisor confere a lista `MODS` do `main.js` a cada junção.
- **R2 — O mundo muda com a planta.**
  - **Como:** os lugares (`T.room`, L-1926: «cheia» com lugares vazios), as camas, o que a casa guarda pelos móveis (D-059) e os
    postos mudam o mundo.
  - **O exemplo:** a noite cheia só existe onde a cidade tem gente e força (T-1820; o cansaço do dia, L-1928, T-940).
  - **Como evitar:** medir antes e depois (o `sociedade-eco` a ±10 %, o `oficio-eco`), pôr a meta pelo tamanho da cidade e gerar os
    mundos prontos uma vez por onda.
- **R3 — A tarefa não vai no save.**
  - **Casos:** o taverneiro com as canecas nas mãos não servia mais (L-1932); levantar cancelava o pedido (L-1934); o corpo na rua
    ainda «sentado» (L-1936).
  - **Como evitar:** cada afazer novo de estada devolve o seu estado no load, e a prova tem um save no meio.
- **R4 — A memória da parte do passo no salto.** Dois que entravam juntos tomavam o mesmo banquinho (L-1980). Quem toma um lugar
  pergunta por quem está dentro agora; a prova roda também no salto.
- **R5 — O desenho e o mundo em relógios diferentes.** A caminhada desenhada no passo próprio (L-1906). O desenho anda no relógio do
  mundo (`t.inW`, `v.saiT`, `t.ww`, `t.mw`). Os prédios do §1.9 ainda têm esse descompasso (F5).
- **R6 — A câmera em toda forma nova.**
  - **Casos:**
    - o olho dentro da cabeça no terreiro (L-1860);
    - o salto do olho na porta (L-1862);
    - o olho dentro do ombro nos degraus do pódio (L-1863);
    - o olho acima do teto, mostrando o céu (L-1866);
    - o que pende da parede ficando no ar (L-1867);
    - o corte longe do olho (L-1868);
    - a troca de corpo (L-1869);
    - a escada até o terraço (L-1870);
    - o corte apagando a mesa onde o corpo senta (L-1872, regra 289).
  - **Como evitar:** cada prédio com escada grande, pódio, galeria, terraço ou pátio roda o o1 a o15 do `olho-dentro` com o seu tipo
    na lista e tira fotos no celular.
- **R7 — A decoração.**
  - **Casos:** a louça sem causa nas caixas e a panela nos modelos de fogo (L-1880); o que pendia das vigas cortadas pela quarta
    parede (L-1881); a chama da lamparina do tamanho de uma tocha (L-1882); a caneca de quem só comeu (L-1883); o prato vazio em
    dobro (L-2100).
  - **Como evitar:** o modelo nunca traz louça nem comida; o que pende vai primeiro às cavilhas da parede; a causa vem antes do
    desenho.
- **R8 — As mãos.** A mão atravessando o tampo (L-1885, L-1910), o canhoto (L-2080), a couraça furada (L-2083). Cada clipe novo se
  mede contra a altura real da peça: as âncoras do modelo.
- **R9 — Quem está dentro como gente.**
  - **Casos:** ninguém era pessoa para o corpo (L-2170); uma palavra tirava a pessoa da mesa (L-2171); a briga de dentro virava
    briga de rua (L-2173); o convite fazia sair e voltar (L-2174).
  - **Como evitar:** em todo prédio com gente sentada, «responder do lugar» (F14).
- **R10 — A porta.** Trancada com as mesas cheias (L-1923), o dono trancado dentro (L-2160), a casa e o templo do mesmo jeito
  (L-2161), o caminho do soldado até a soleira (L-1981). Toda regra nova de porta pergunta ao `In.guestIn`; as portas de dentro
  entram com a F4.
- **R11 — O som.** Tudo saía da porta (L-1960), a língua do estilo no lugar da do povo (L-1961), três sozinhos fazendo burburinho
  (L-1962), a conversa ouvida longe pela parede (L-1963), o fim de um ato que nunca soava (L-2120).
- **R12 — As provas.**
  - **A receita velha.** Provas que mediam a receita de antes (T-1742).
  - **As limitações do Node.** Sem as caixas do 3D (L-1861, T-1762), sem sombreador (T-1767) e com o `Date.now` parado (T-1740).
  - **O motor e a grade.** A folga de 2 cm do motor (T-1741) e o corredor medido em 10 cm (T-1743).
  - **O mundo trocado em silêncio.** O mundo pronto que não abre e cai num mundo de 22 pessoas, com «corrupt save», por um defeito
    de outro módulo (L-1871, L-1909, L-1933).
  - **O tempo da prova.** Prova contada por quadros e não por segundos do mundo (T-2103, T-1563).
  - **Como evitar:** a prova confere que abriu o mundo que pediu e conta segundos do mundo.
- **R13 — O desempenho.** O pior caso da planta (a ínsula com 658 ms), a tabela quadrática de antes (L-495) e as malhas por
  instância (D-665). Cada tipo tem a sua meta de tempo provada no padrão (F16), como o t3 da taverna (400 ms).
- **R14 — O catálogo.** O `VERSION` subido sem gerar o catálogo trava o jogo. Gerar leva ≈ 1 h, e a migração de um save antigo move
  portas e moradores (`outOfPocket`). Juntar as subidas e fazer a F13.
- **R15 — O processo.**
  - **As provas da onda.** Sem a regressão completa (D-666), cada onda precisa de provas rápidas, de segundos ou minutos, desde o
    começo. As longas ficam marcadas «antes da versão».
  - **A ordem de juntar.** Na taverna, a ordem de juntar foi fixa (P3 → P2 → P1 → P4 → P6, depois P5 → P7), e muitas frentes
    acharam defeitos umas das outras.
  - **Como evitar:** o contrato diz quem é o dono de cada arquivo e de cada trecho do `build3d.js` (§2 do contrato).
- **R16 — A regra magna e a origem.** Os mundos prontos não sabiam o barro (T-1780), e o `alias` faz vários povos usarem o modelo
  romano: «um modelo para cada povo» pode esconder que quase todos têm a mesma cara. Gerar os mundos prontos depois de mexer na
  origem, e contar os estilos próprios por povo na prova.

---

## 5. Os números reservados e a forma da onda

- **Os primeiros livres.** O guard usa regras até a 479, então a próxima livre é a **480**. As decisões vão até a D-966, e a frente
  N reservou até a D-969: a próxima livre é a **D-970**. Os defeitos vão até o L-2224 (a N reservou até o L-2229): o próximo livre é
  o **L-2230**. Os limites de prova vão até o T-2123 (a N reservou até o T-2129): o próximo livre é o **T-2130**.
- **Proposta:** cada onda reserva um bloco de 10 regras e 10 números de cada tipo por frente, como no contrato da taverna.
- **O contrato de cada onda, no molde do `planos/interiores-2-contrato.md`:**
  - as frentes e quem é dono de cada arquivo (com o trecho do `build3d.js`);
  - as peças novas com as medidas;
  - as letras do livro e os nomes;
  - os números;
  - as provas rápidas de cada frente;
  - a ordem de juntar;
  - uma só subida do `VERSION` (ou da versão do tipo);
  - uma geração dos mundos prontos no fim.

## 6. Os scripts desta pesquisa (no scratchpad, nada no repositório)

- `/tmp/claude-0/-home-user-promptzada-de-adulto-do-dr-s-ntese/474a40dc-2376-5786-aa24-770c3a52b5eb/scratchpad/interiores3/work/tipos.js`
  — os 31 tipos com planta, as suas famílias e os 25 tipos do `BDEF` sem planta.
- `/tmp/claude-0/-home-user-promptzada-de-adulto-do-dr-s-ntese/474a40dc-2376-5786-aa24-770c3a52b5eb/scratchpad/interiores3/work/itens.js`
  — o catálogo e as escadas de degraus.
- `/tmp/claude-0/-home-user-promptzada-de-adulto-do-dr-s-ntese/474a40dc-2376-5786-aa24-770c3a52b5eb/scratchpad/interiores3/work/medir.js`
  — o tempo da planta, os cômodos, as peças e a área por tipo (`node medir.js metropole|mega`, 4 s).
- `/tmp/claude-0/-home-user-promptzada-de-adulto-do-dr-s-ntese/474a40dc-2376-5786-aa24-770c3a52b5eb/scratchpad/interiores3/work/desenho.js`
  — o `B3.interior` da casca e dos móveis, as peças nas caixas, as instâncias e as coisas do `Dentro3D` (10 s).
- `/tmp/claude-0/-home-user-promptzada-de-adulto-do-dr-s-ntese/474a40dc-2376-5786-aa24-770c3a52b5eb/scratchpad/interiores3/work/audit23-short.txt`
  — a seção 23 do `qa/AUDIT.md`, uma linha por entrada.
