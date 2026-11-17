# A natureza — o plano e o contrato da grande atualização visual

Este documento é o contrato da atualização da natureza (AUDIT, seção 21, D-465 a D-469). Toda parte o lê antes de começar e escreve
só nos seus arquivos e nas marcas deixadas para ela. O protocolo de qualidade do `CLAUDE.md` vale inteiro, e a regra do dono
«Nada vem do nada» também: o que se vê tem causa no mundo.

## 1. O pedido e o alvo

O pedido do dono, palavra por palavra, está em `arte/natureza/pedido.md`. Em uma frase: **a natureza como um dos maiores motivos para
passar horas no jogo** — florestas, montanhas, cachoeiras e céus que façam o jogador pensar «nossa, que jogo lindo», com a força de
um documentário (BBC Earth, National Geographic), em quatro pilares: **a vegetação e os biomas**, **o relevo e a geologia**, **a
água**, **o céu, a luz e a atmosfera**. A exigência especial é a **floresta tropical de verdade**: mata fechada em camadas, teto de
copas, raios de sol entre as folhas, sombra funda, neblina úmida, cipós, samambaias, musgo, troncos caídos, clareiras e trilhas.

- **O estilo**: o low-poly do jogo evolui para um acabamento sofisticado — não vira fotografia; ganha camadas, luz e detalhe.
- **O alvo principal é o PC** (Alta e Ultra são a vitrine). **O celular continua jogável** (Leve e Média ficam leves) — e nada se corta
  na Alta por causa dele.
- **Gerado e diverso**: tudo procedural, pelo que o mundo já sabe, sem repetição artificial — e determinístico.
- **As duas vistas**: o Modo Encarnado (3D) é a vitrine; a vista do deus acompanha cada pilar.

## 2. O que os batedores mediram (comece daqui; não repita o estudo)

Os quatro estudos estão em `arte/natureza/estudo-*.md` — leia o do seu pilar inteiro e o resumo dos outros. O essencial:

- **Vegetação** (`estudo-vegetacao.md`): uma árvore por casa de 4 m, no meio, em grade; a selva tem árvore em 58% das casas num mundo
  novo e em 27% num mundo vivido (o mato que volta tem uma meta só para o mapa todo); nada entre o capim (≤ 1,1 m) e a copa (~8 m); a
  árvore da selva é o carvalho 35% maior; cada árvore achatada triângulo por triângulo, sem instância (o pedaço denso: 61 mil
  triângulos, 325 ms para montar); de longe, bolas de 20 triângulos; o capim alto do mundo (`S.veg`, que esconde os bichos) não é
  desenhado; o caminho das pessoas ignora as árvores. **Encher o mundo de árvores não fecha a mata: o que fecha são as camadas
  entre o chão e a copa.**
- **Relevo** (`estudo-relevo.md`): a casa tem 4 m e a unidade de altura 1,5 m; os mapas têm de 256 a 768 m; **a maior montanha tem 40 a
  60 m** (pouco mais que o dobro do Coliseu do jogo); os penhascos são rampas esticadas de uma casa, com uma rocha só; além da borda,
  só mar e névoa; as cavernas existem só na vista do deus (no 3D, a boca); o chão do 3D é exatamente o do mundo (`W.hAt`).
- **Água** (`estudo-agua.md`): **as cachoeiras já existem no mundo** (`S.relief.falls`: 36 a 42 quedas num mundo montanhoso, 14 com
  nome) e **nenhuma é desenhada** (uma rampa de chão entre duas lâminas); o sentido da corrente é jogado fora pelo gerador e o 3D o
  adivinha mal (perde 10 a 50% dos rios); a água tem uma cor só, reflete só a cor do céu; a chuva não molha o 3D (`S.wet` não é lido).
- **Céu** (`estudo-ceu.md`): a luz já é uma só para todo material (os uniformes `GX` e o remendo `toon()` do `realm3d.js`) — **é a
  porta que todos os pilares usam**; o céu é um domo pintado por rampas, as nuvens uma textura que desliza pelo relógio da vista; o
  amanhecer e o pôr do sol são o mesmo véu rosa; a sombra só existe a 36–68 m do corpo (nenhuma montanha faz sombra); a mata é
  iluminada como campo aberto; uma névoa só para o mapa; sem relâmpago no 3D.

## 3. A arquitetura (D-465 a D-469)

### 3.1 Duas fases (D-465)
- **Fase A — só se vê.** Tudo o que esta atualização desenha sai do que o mundo **já** guarda, por funções puras e determinísticas.
  **O mundo fica igual byte a byte**: a mesma semente faz o mesmo mundo, nenhum save muda, nenhum mundo pronto precisa ser gerado de
  novo, nenhuma linha de base de mundo muda. É aqui que mora o salto visual: as camadas da mata, a rocha com estratos e os penhascos
  esculpidos, as cachoeiras desenhadas onde o mundo já tem queda, o céu físico, as nuvens, a luz da mata, a neblina por lugar.
  Uma exceção pequena, dita em cada parte: **o corpo do jogador** pode passar a bater no que se desenha (os caules da mata, as
  pedras), como já bate nas pedras (`Sp.stones`) — regra do corpo, pela porta do `G.Space`, nunca do caminho das pessoas.
- **Fase B — o mundo.** Depois que a fase A estiver junta e o dono tiver visto: a mata que esconde os bichos e atrapalha ou impede a
  passagem das pessoas (o custo do caminho, a cobertura do `fauna-meio.js`), a selva mais densa por bioma e o mato que volta por bioma,
  o relevo novo da geração (os cânions, as escarpas com a queda alta de um salto só e o poço fundo, os estratos com patamares, as
  dunas, as geleiras, picos mais altos se valer o custo), a corrente que empurra quem nada. Cada uma pelo protocolo inteiro, com os
  mundos prontos gerados de novo. **Nenhuma parte da fase A mexe no mundo.**

### 3.2 As quatro fontes, puras (D-466)
Cada pilar tem uma fonte **pura** do que ele sabe — sem acaso nenhum (nem `G.R` nem `G.VR`: a mesma entrada, a mesma saída), sem
escrever no mundo, sem three.js, sem relógio de parede, rodando em Node como o `G.Atmos` — lida pelo 3D, pela vista do deus e, na fase
B, pelo mundo. Refeita quando o chão muda (`S.typeVer`, as árvores, `W.touchWalk`) e **feita inteira quando pedida** (nunca aos
poucos pelos quadros: a fase B a lerá no passo do mundo, e o salto e o passo não podem se separar). O `guard.js` cobra a pureza
(regra 167).
- **`G.Ceu`** (`js/ceu.js`, o pilar do céu): o sol e a lua (com fases), o céu da hora e do lugar, as nuvens do lugar com a deriva pelo
  relógio do mundo, o **mapa do ar** (a neblina e a sua causa: a mata úmida, o vale, o rio, a queda d'água, o pântano; o dossel que
  tapa o céu), **a sombra dos montes**, o arco-íris com causa, a tempestade, **o vento** (um só, o do mundo — `G.Meio.wind` — para as
  plantas, a água e as partículas).
- **`G.Mata`** (`js/mata.js`, o pilar da vegetação): a densidade e as camadas de cada lugar (o bioma, a umidade, o dossel das árvores
  do mundo, as clareiras de árvore caída, as trilhas do desgaste `S.wear`, as estradas, os prédios, o fogo, um ruído da semente), as
  espécies por nicho, **o mapa do dossel** visto de cima (que o céu lê para a luz da mata).
- **`G.Agua`** (`js/agua.js`, o pilar da água): a corrente (rumo, velocidade, vazão — refeita pela foz do que o save tem), as quedas e as
  corredeiras, o rumo da costa, o molhado e as poças, **a altura da onda desenhada** (a mesma conta do sombreador, para os navios e
  quem nada ficarem na onda).
- **`G.Geo`** (`js/geo.js`, o pilar do relevo): o tipo de rocha e os estratos de cada lugar, a forma desenhada de cada casa de
  penhasco (uma função pura, no molde do `Sp.bedDrop` — zero na borda com casa andável, **fora** do `Sp.footAt` que o mundo usa para as
  portas), as formações e as pedras, o horizonte além da borda.

### 3.3 A luz, o vento e a cor num lugar só (D-466)
- **A luz é do céu.** Nenhum pilar calcula céu nem luz própria: a água, a mata e o relevo leem os uniformes do ar e da luz (`GX`, o
  remendo `toon()` do `realm3d.js`, que o pilar do céu passa a ter no seu `js/ceu3d.js`) no sombreador e o `G.Ceu` no JavaScript.
  Assim a cor e a luz casam entre si por construção.
- **O vento é um só** (`G.Ceu.wind`, pelo vento do mundo): as folhas, o capim, a água, a névoa e a chuva se movem para o mesmo lado.
- **As qualidades**: cada pilar acrescenta os seus campos às qualidades pelo `G.Realm.qualAdd(campo, { baixa, media, alta, ultra })`, do
  seu próprio arquivo — ninguém edita a tabela `QUAL` do `realm3d.js`.

### 3.4 O horizonte e a escala (D-467)
- **Sem exagero de altura no desenho**: esticar a cena estica as pessoas, e mudar o metro do mundo muda tudo; o chão onde se anda
  continua o do mundo, para os pés baterem.
- **Dentro do mapa**, as montanhas ganham forma e geologia (os estratos, as faces de rocha, as formações, os penhascos esculpidos, a
  figura de longe com a grade fina onde o relevo é forte, a sombra dos montes); picos mais altos são da fase B, se valerem o custo.
- **Além da borda**, a terra continua **só onde a terra do mapa toca a borda** (os continentes): um anel desenhado que sobe do relevo da
  borda em serras e cordilheiras — essas podem ser imponentes (centenas de metros, neve, geleiras), porque estão longe. Onde o mapa
  acaba no mar (as ilhas, os arquipélagos), o horizonte é o mar, como as expedições contam («mar vazio»): nenhuma terra boiando no
  horizonte que o mundo não tem.

### 3.5 O orçamento por qualidade (D-468)
- **Leve e Média continuam leves** (o celular, a máquina fraca): a regra do D-032 vale para a Média (no máximo ≈ +10% no quadro,
  medido na mesma máquina, antes e depois). **Alta e Ultra são a vitrine**: a mata densa, as nuvens com volume, a luz no ar, o
  reflexo de verdade moram nelas. **A mesma natureza em todas** — as maiores só desenham mais dela, mais longe e mais fina.
- As tabelas de cada pilar estão nos estudos (vegetação §3.4, relevo §3.5, água §3.5, céu §3.7) e são o ponto de partida: cada parte
  mede e diz o que custou. O alvo da `arte/BIBLIA.md` (feito para a Média por software) é revisto para a Alta e a Ultra nesta
  atualização, e escrito lá por quem medir.
- **Nada de montagem pesada num quadro**: o que custa (os pedaços da mata, a sombra dos montes, a tabela do céu) é montado em fatias
  pelo orçamento do `stream`, ou num `Worker` com o mesmo código puro.

### 3.6 As decisões já tomadas (D-469)
- **A hora dourada mais longa**: a forma da curva do sol demora perto do horizonte (≈ 35 s de relógio em vez de ≈ 18 s), sem mexer no
  `G.isNight` nem no mundo — junto com o tempo do corpo a 0,27 (D-365, aprovado pelo dono).
- **As nuvens de tempo bom variam de um dia para o outro**, com causa no lugar, na umidade e na hora (o `G.hash` do dia e do lugar,
  como a roupa pelo id: só se vê, sem acaso do mundo).
- **O matiz da hora passa a vir do `G.Ceu`**: a vista do deus (o `AMB` do `render.js`) lê dele; as fotos do deus mudam, ditas no AUDIT.
- **As estações do ano não são desta atualização** (seriam mudança do mundo: as plantações, a caça, a neve).

## 4. As partes

Cada parte é um agente que trabalha na sua árvore (`git worktree`), a partir do commit deste contrato, e entrega commits na sua branch,
sem empurrar; o arquiteto junta. **A ordem**: o céu começa primeiro (a fonte da luz e o mapa do ar, que os outros leem — a «base
barata» do estudo do céu) junto com a vegetação (a exigência especial do dono); o relevo e a água entram assim que a segunda onda da
jogabilidade liberar a máquina.

### 21a — A vegetação e os biomas
**Fase A:** o `G.Mata` (`js/mata.js`); as camadas da mata no 3D (`js/mata3d.js`: a rasteira num campo em volta do olho, como o
`Grass3D`; a arbustiva e o sub-dossel por instância por pedaço — `InstancedMesh` / `BatchedMesh` do three r170; os cipós entre
árvores do mundo; as epífitas e o musgo; os troncos caídos, as raízes, a folhagem no chão); **a árvore do mundo** tirada do
`realm3d.js` para o `js/arvore3d.js`, com as espécies por bioma e por nicho (as emergentes gigantes da selva, as palmeiras, os fetos
arborescentes…), os níveis de detalhe e a manta do dossel e os impostores de longe; o capim alto do mundo (`S.veg`) desenhado; o vento
e a passagem de quem anda (o empurrão nas plantas); **a identidade de cada bioma** (a selva, o temperado, a taiga, a savana, o
deserto, a tundra, o pântano…); o mapa do dossel para o céu; a vista do deus (o chão debaixo da mata, a densidade); **a etapa do
corpo**: os caules duros derivados que o corpo não atravessa (`Sp.stems`, no molde do `Sp.stones`). **Fase B** (depois): a mata no
caminho e na cobertura, a selva mais densa por bioma.
*Dono de*: `js/mata.js`, `js/mata3d.js`, `js/arvore3d.js`, os protótipos das plantas (`js/planta-formas.js` ou malhas do
`arte/blender/`), `js/grass3d.js`, o bloco das árvores e das plantas do `realm3d.js` (o `floraGeo`, `KIND`, `TPAL`, `treeInto`,
`crownInto`, `MAT.flora/leaf/plant` — levados para os seus arquivos), o `Sp.stems` do `space.js`, a parte das árvores do
`render.js` / `art.js`, as receitas dos biomas no `biomes.js` (como dado).

### 21b — O relevo e a geologia
**Fase A:** o `G.Geo` (`js/geo.js`); **a rocha com estratos** no sombreador do chão (o tipo de rocha por lugar, as camadas que
continuam de um paredão ao outro, a rocha molhada, o musgo pelo `G.Mata`); **os penhascos esculpidos** (a forma desenhada de cada casa
de penhasco, saliências, quebras, nunca no chão onde se anda); a figura de longe com a grade fina onde o relevo é forte (a silhueta das
serras); **as pedras e as formações** por instância (blocos, pilares, arcos, matacões), do relevo — o musgo nelas lê a mata; **o
horizonte** além da borda onde a terra a toca (3.4), com serras, neve e geleiras; a boca da caverna escavada no morro (as cavernas por
dentro, no 3D, são uma etapa à parte); a praia (a areia, as falésias da costa com estratos); a vista do deus. **Fase B** (depois): o
relevo novo da geração (o estudo §3.3).
*Dono de*: `js/geo.js`, `js/geo3d.js` (novo), `js/ground3d.js`, o bloco do chão do `realm3d.js` (os pedaços do terreno, a figura de
longe, o anel além da borda), o `Sp.cliffAt` do `space.js` (só do desenho), as pedras (hoje no `floraGeo`: o relevo as leva para o
`geo3d.js`, combinado com a 21a), a parte do relevo do `render.js`, o `tex3d.js` só pelo seu gerador (`arte/texturas.py`).

### 21c — A água
**Fase A:** o `G.Agua` (`js/agua.js`); **o desenho da água** tirado do `realm3d.js` para o `js/agua3d.js`: a água que corre pelo
sentido da corrente, a espuma com causa (a praia, o pé da queda, as margens, as pedras, a esteira dos navios), as ondas com volume
perto do olho que quebram paralelas à praia, a cor pelo lugar e pela profundidade (o trópico, o frio, a lama, o recife; o rio turvo
depois da chuva), **a lâmina de cada queda e de cada corredeira que o mundo já tem**, com a espuma no pé, o borrifo, a névoa (pelo mapa
do ar do céu), a rocha molhada e o arco-íris; **a chuva que molha** (o chão e os telhados escurecem e brilham, as poças, os fios
d'água — pelo `S.wet`); o reflexo por qualidade (as nuvens na Média, a cena pela tela e a refração na Alta, o mar plano na Ultra); a
vista do deus. Nada de onda desenhada acima de ≈ 15 cm sem a mesma altura para quem nada e para os navios.
*Dono de*: `js/agua.js`, `js/agua3d.js`, o bloco da água do `realm3d.js`, a parte da água do `fx3d.js` (os respingos, a névoa da
queda — um lote de partículas próprio), a parte da água do `render.js`.

### 21d — O céu, a luz e a atmosfera
**Fase A, a base primeiro** (o que os outros leem): o `G.Ceu` (`js/ceu.js`) com o sol, a lua e o céu da hora — o `light()` do 3D lendo
dele **com a mesma imagem de hoje primeiro** (provado pelas fotos iguais), depois mudando; a deriva das nuvens pelo relógio do mundo; a
sombra das nuvens em todo material; o mapa do ar (a neblina por lugar, o dossel); a sombra dos montes; **o remendo da luz** (`GX`,
`toon()`) levado para o `js/ceu3d.js`, com as portas que a água, a mata e o relevo leem. **Depois**: a luz da mata (o dossel que tapa o
céu, as manchas de sol, os cartões de luz na Média, a luz no ar de verdade na Alta e na Ultra), **o céu físico** (a dispersão da luz)
com o crepúsculo de verdade e a hora dourada longa (D-469), as nuvens em camadas e com volume (volumétricas na Ultra), as nuvens de
chuva do mundo como cúmulo-nimbo com cortina de chuva, **o relâmpago** onde o mundo fez cair o raio, a noite (a lua com fases, as
estrelas que giram, o halo, a aurora), o arco-íris com causa; o pós (`post3d.js`); a vista do deus (o `AMB`, o `sky.js`).
*Dono de*: `js/ceu.js`, `js/ceu3d.js`, o bloco da luz, do céu e da névoa do `realm3d.js` (`light()`, o domo, `GX`, `toon()`), o
`post3d.js`, o `sky.js`, a parte do céu e do raio do `fx3d.js`, o `AMB` do `render.js`.

## 5. Os donos de cada arquivo e as marcas

| Arquivo | Dono | Os outros |
|---|---|---|
| `js/realm3d.js` | dividido por blocos: a luz e o céu (21d), as árvores e as plantas (21a), a água (21c), o chão e o além da borda (21b) | **cada parte leva o seu bloco para o seu arquivo novo** e mexe só nele; a orquestração da cena (a câmera, os pedaços, o laço do quadro) fica onde está: uma linha que chama o arquivo novo, no mínimo, dita no relatório |
| `QUAL` (as qualidades) | ninguém edita | `G.Realm.qualAdd` do arquivo de cada parte |
| `js/ground3d.js` | 21b | a 21a lê/passa o chão da mata por uma porta (`G.Mata.floor`), a 21c a margem molhada (`G.Agua.wet`) — combinadas, mínimas, ditas |
| `js/fx3d.js` | dividido: a água (21c), o céu e o raio (21d), as folhas e as árvores que caem (21a) | cada parte num trecho seu; partícula nova num lote próprio |
| `js/space.js` | o `Sp.stems` (21a), o `Sp.cliffAt` (21b), só do desenho e do corpo | **ninguém muda o `Sp.footAt`, o `BODY_R` nem o `STEP_UP`** (as portas do mundo nascem deles) |
| `js/render.js`, `js/art.js` (o deus) | cada parte na sua parte (as árvores 21a, o relevo 21b, a água 21c, o `AMB` 21d) | trechos separados |
| `js/people3d.js`, `js/anim-*.js`, `js/avatar.js`, `js/cam3d.js` | (da base do corpo, juntos) | a natureza não mexe; a câmera dentro da mata e o corpo nos caules, pelas portas (`Sp.stems`), mínimos, ditos |
| `js/nature.js`, `js/relief.js`, `js/biomes.js`, `js/world.js`, `fauna-meio.js` | (o mundo) | **fase A: ninguém muda o mundo**; as receitas dos biomas como dado, sem mudar o que o mundo gera |
| `index.html`, `css/style.css`, `qa/guard.js`, `qa/AUDIT.md`, `qa/README.md` | todos | **cada parte só abaixo da sua marca** (`21a`…`21d`) |
| `qa/qa.js`, `CLAUDE.md`, `worlds/`, `arte/BIBLIA.md` | o arquiteto | proponha as linhas; a BÍBLIA recebe o orçamento novo de quem medir, pela junção |

## 6. Os números

| Parte | Bugs (L-) | Decisões (D-) | Limites de prova (T-) | Regras do guard |
|---|---|---|---|---|
| contrato | — | 465–469 | — | 167–168 |
| 21a a vegetação | 1500–1549 | 470–489 | 1510–1529 | 169–175 |
| 21b o relevo | 1550–1589 | 490–504 | 1530–1544 | 176–181 |
| 21c a água | 1590–1629 | 505–519 | 1545–1559 | 182–187 |
| 21d o céu | 1630–1669 | 520–534 | 1560–1574 | 188–193 |

## 7. Como cada parte trabalha

1. **A árvore**: `git reset --hard <o commit do contrato>` (o número vem no pedido); commits na sua branch; não empurre.
2. **O protocolo** do `CLAUDE.md` inteiro: invariante (o seu `*-inv.js`, juntado pelo `qa/junta-inv.js`), cenário com os casos ruins (o
   save no meio, o deus muda o chão, o inverno, a tempestade, a árvore cortada, o fogo), regra do guard para o que se lê no código, cada
   bug no AUDIT. **A prova de que a fase A não mexe no mundo**: o save igual byte a byte antes e depois de desenhar, e o mesmo mundo da
   mesma semente com e sem quadros (`qa/det3.js`); o verificador limpo. **As verificações do 3D que já existem e ninguém chama**
   (`R3.floraCheck`, `Grass3D.check`, `R3.waterCheck`, `R3.bedCheck`) entram nas provas do seu pilar.
3. **As fotos**: cada parte tem a sua prova de fotos (as vistas fixas do `qa/visual/natureza.js`, ampliadas, pela fila do navegador),
   antes e depois, na Média e na Alta, de dia, ao pôr do sol e com chuva, e as mostra no relatório. O dono julga pelo que vê.
4. **A máquina é dividida e recicla a cada hora e meia, mais ou menos** (o contêiner reinicia; o que roda em segundo plano morre sem
   avisar): **commit de cada passo que passar**, provas curtas (as partes por `ONLY=`), o que se mediu guardado num arquivo da pasta de
   rascunho. O navegador só pela fila (`bash qa/navegador.sh …`); a foto na Alta por software demora minutos: tire poucas e boas.
5. **Fora da sua área**: o mínimo, num trecho bem delimitado, dito no relatório. Se o contrato estiver errado ou faltar uma porta, a
   solução mais simples que respeite o espírito dele, documentada aqui.
6. **O texto**: o que o jogador lê em português; os comentários do código em inglês curto, dizendo o porquê, como os vizinhos.
7. **O relatório final** (em português simples): o que foi feito e como fica na tela; os arquivos; as provas e o resultado de cada uma;
   o custo medido por qualidade; os IDs do AUDIT e as regras do guard; as linhas propostas para o `CLAUDE.md`; o que ficou aberto
   (e o que seria da fase B); as fotos antes e depois (o caminho de cada uma).

## 8. As portas do céu (21d — o que a água, a mata e o relevo leem)

A luz, o céu e o ar têm uma fonte só (D-466, D-520): o **`G.Ceu`** (`js/ceu.js`, puro, roda em Node) diz os números; o **`G.Ceu3D`**
(`js/ceu3d.js`) os dá ao desenho — as luzes, o domo, as estrelas, os uniformes do ar (`GX`) e o remendo da luz nos pedaços de
sombreador do three.js (`toon`). O `realm3d.js` só chama: `G.Ceu3D.toon(THREE)` antes de qualquer material, `G.Ceu3D.init(...)` no
`init`, `G.Ceu3D.quality(q)` no `applyQuality`, `G.Ceu3D.light(focus)` a cada quadro (devolve a luz, `G.Ceu.L`, que a água lê).
**Ninguém mais calcula céu, sol ou luz** (regras 188 e 189 do guard).

### 8.1 No JavaScript — o `G.Ceu` (só lê o mundo; a mesma pergunta, a mesma resposta)
| porta | o que dá |
|---|---|
| `G.Ceu.sun(t)` · `moonDir(t)` · `moon(t, dia)` | a direção (unitária: x leste, y cima, z sul) e `s` (o seno da altura) do sol; a da lua; a fase (`phase` 0 nova, 0,5 cheia) e a parte acesa (`lit`) pelo dia do mundo (`MONTH` = 8 dias). A curva demora perto do horizonte (`SHAPE` = 1,3: 6° → 0° em ≈ 37 s do relógio do corpo, com o corpo a 0,27; D-469); o sol nasce e se põe nas mesmas horas (`RISE`, `SET`) — o `G.isNight` não é do céu |
| `G.Ceu.light(t, tempo, nNuvens, botões, L)` | a luz da hora inteira: `sun`, `key` e `keyI` (a luz-chave: o sol, ou a lua quando ela carrega a luz — `byMoon`, `kd`), `sky` (a luz do céu na sombra), `bounce`, `hor`, `zen`, `top`, `glow`, `belt`, `exp`, `mist`, `stars`, `cover`, `cloudCol`/`cloudSh`, o grade da noite (`grN`, `toe`) — em luz linear |
| `G.Ceu.ambient(t, tempo)` · `nightness(t, tempo)` | o matiz da hora do deus (a tabela `AMB`, lida pela altura do sol: `plainHour`) — o `render.js` pergunta aqui, e o 3D tinge a sua luz por ele |
| `G.Ceu.wind(tempo)` | o vento do mundo, um só (`a`, `x`, `y`, `s`; `k` é a força que os bichos sentem — o mesmo do `G.Meio.wind`): as folhas, o capim, a água, a névoa e as nuvens vão com ele |
| `G.Ceu.drift(relógio, tempo)` · `cloudN(X, Z, deriva, fino)` · `cover(t, tempo, nNuvens, dia, x, y)` · `cloudShade(X, Y, Z, sol, cobertura, força)` | as nuvens: um campo só, num plano a `CLOUD.h` (350 m) sobre o mar, `CLOUD.scale` (2200 m) de lado, que anda pelo relógio do mundo (`S.clock`) em duas camadas (a deriva); a cobertura sobre um lugar (o dia — `dayAir`, pelo `G.hash` do dia —, a chuva, a tempestade, as nuvens de chuva do mundo por perto, o calor da tarde na terra úmida); a parte da luz-chave que chega a um ponto debaixo delas |
| `G.Ceu.airMap()` · `air(x, y)` · `mistNow(t, tempo)` | **o mapa do ar**: um valor por canto de casa (N+1 de lado), refeito quando o chão muda (`airKey`: `S.typeVer`, a versão do `G.Mata` — não a dos prédios): `dawn` (a névoa da manhã: o vale, o rio e o lago, o pântano), `last` (a que fica: a mata úmida, o borrifo das quedas `S.relief.falls`, o pântano), `top` (a altura do topo, m), `cano` (o dossel, do `G.Mata`), `why` (as causas, por bits: `WHY`); `pic` é a figura RGBA que o 3D sobe; `mistNow` diz quão grossa cada névoa está na hora |
| `G.Ceu.shadeFor(direção)` · `shadeAt` · `shadeRay` | **a sombra dos montes**: por canto, a altura sobre o chão até onde a sombra da terra chega para a luz que vem daquela direção (0: na luz) — a varredura N² pela direção da luz; `shadeRay` é o raio de força bruta das provas |
| `G.Ceu.sky(t, x, y, tempo)` · `airOf(x, y)` · `through(altura, mie)` | o céu físico da hora e do lugar: a faixa do crepúsculo (`band`), o halo do ar em volta do sol (`halo`, pelo ar do lugar: `mie`, `haze`), a sombra da Terra (`shadow`), a luz nas barrigas das nuvens (`under`); a luz do sol pelo ar que atravessa |
| `G.Ceu.rainbow(t, x, y)` · `aurora(t, x, y, tempo, cobertura)` · `POLE` · `starTurn(t)` · `moonLight(dia)` | o arco-íris com causa (o chão molhado `S.wet` sem chuva agora, o sol abaixo de 42°), a aurora com causa (a noite fria `S.temp` e limpa), o polo e o giro das estrelas, a luz da lua pela fase |

**O dossel vem do `G.Mata` (21a)**: o céu lê `G.Mata.luz(i)` — ou, sem ela, `G.Mata.at(i).luz` — (0 aberto, 1 um teto, por casa) e a
versão `G.Mata.ver` (número, texto ou função, que muda quando o dossel muda), e não refaz o dossel das árvores (regra 191). Sem o
`G.Mata`, o dossel é zero. (O `ceu.js` pergunta pelo nome, `G['Mata']`, porque o arquivo da 21a ainda não está junto: juntando,
pode virar `G.Mata`.)

### 8.2 No sombreador — o `GX` e as peças que todo material tem
- **Os uniformes do ar (`G.Realm.GX`)**, os mesmos objetos em todo material da biblioteca do three.js (e em quem os passa à mão):
  `gxSunW`, `gxHor`, `gxGlow`, `gxBelt` (o céu na direção), `gxAir`, `gxAir2` (a névoa de distância), `gxLM*` (a luz pintada das
  chamas, do `fx3d.js`), `gxGr`, `gxTn`, `gxAmb` (o grade, o pé da curva, a luz do céu contra a do meio-dia) e os novos:
  `gxAirMap` (R névoa da manhã, G dossel, B névoa que fica, A topo da névoa em passos de 0,3 m), `gxShade` (R, G a sombra dos
  montes em duas horas, em passos de 0,2 m; B o chão, em passos de 0,3 m), `gxCloudN` (o pano das nuvens), `gxAirB` (1/casa,
  1/cantos, ligado, a altura do mundo na tela), `gxAirK` (a névoa da manhã agora, a que fica agora, o dossel ligado, a espessura),
  `gxCl0`–`gxCl2` (a deriva, os pesos, a sombra, o plano, a cobertura), `gxShadeK`, `gxKeyW` (para a luz-chave), `gxCanopy` (a luz
  do céu sob um teto cheio, rgb; a altura das copas), `gxSunBox` (onde o mapa de sombras do sol alcança), `gxFlash` (o clarão do
  relâmpago agora).
- **As funções** (em todo material com luz ou com névoa): `gxHaze(d)` (a cor do horizonte numa direção: a névoa e o reflexo do
  céu usam a mesma), `gxTone`/`gxGrade` (a curva e o grade: `R3.GLSL.grade`), `gxMapUV(xz)` (um ponto da terra nos mapas),
  `gxCloud(p)` (o pano das nuvens no plano), `gxLightAt(wp, out ks, out sk)` (a parte da luz-chave que chega — as nuvens, os
  montes, as falhas do dossel — e a da luz do céu sob o dossel).
- **No `main` de todo material com luz**, depois do `lights_fragment_begin`: `gxWP` (o ponto no mundo), `gxKS` (a parte da
  luz-chave que chega ali) e `gxSK` (a parte da luz do céu, verde-dourada sob a mata). A luz que um material faz por conta — o sol
  atravessando as folhas, o brilho do sol na água — multiplica por `gxKS`; quem tem a sua própria luz-chave (a água: `uKeyCol`)
  a multiplica por `gxKS` também, para escurecer com as nuvens e os montes. O clarão (`gxFlash`) já entra na luz do céu.
- **O céu para quem o reflete**: `G.Realm.skyU` (`top`, `hor`, `sunDir`, `sunCol`, `keyDir`, `moonDir`, `cover`…) e `G.Realm.LT` (a
  luz desta hora, só de leitura); `G.Ceu3D.canopyAt(X, Y, Z)` (o dossel sobre um ponto, já com «debaixo das copas»).
- **O raio**: `G.FX.lightning(x, y)` (a palavra do mundo ao que se vê, no `fx.js`) passa ao `G.Ceu3D.bolt`; `G.Ceu3D.live()` são
  os raios vivos; `G.Ceu3D.flash()` o clarão agora (regra 192).
- **As qualidades do céu** (pelo `G.Realm.qualAdd`, regra 193): `shafts` (os cartões de luz da mata, na Média), `vlight` (a luz no
  ar pelo mapa de sombras: 1 na Alta, 2 na Ultra), `vclouds` (as nuvens com corpo, na Ultra).

## 8b. As portas da mata (21a)

O `G.Mata` (`js/mata.js`) é a fonte pura da vegetação: lê o mundo (o bioma, o clima, as árvores e os seus estágios, o desgaste, as
estradas, os prédios, os muros, o fogo, a cinza, as cidades, a semente) e não escreve nada; sem acaso nenhum. Guarda uma memória de
**regiões de 16 × 16 casas** (os pedaços do 3D), cada uma refeita **no momento em que é lida** quando o que a faz mudou (as suas casas e as
das oito vizinhas, pela assinatura) — nunca aos poucos pelos quadros.

| porta | o que dá | quem lê |
|---|---|---|
| `G.Mata.canopy(x0, y0, w, h, campo)` | **o mapa do dossel visto de cima**: `{ data: Uint8Array(w × h), w, h, x0, y0, sig }`, um byte por casa (0 céu aberto, 255 teto fechado) — quanto do céu as copas das árvores do mundo tapam ali; sem retângulo, o mapa inteiro. `sig` é o mesmo número enquanto nada debaixo mudou: **refaça a sua figura só quando a `sig` mudar** (o mapa inteiro de 192 casas: ≈ 250 ms da primeira vez, ≈ 13 ms para conferir depois; peça o retângulo em volta do olho num mapa grande). `campo` lê outro mapa da mesma memória (`'dens'`, `'umid'`, `'borda'`, `'clar'`, `'alto'`, `'mata'`) | o céu (21d: a luz da mata, a neblina, os cartões de luz nas clareiras); o 3D da mata |
| `G.Mata.region(rx, ry)` | uma região inteira (`rx`, `ry` em regiões de 16 casas): `{ x0, y0, dens, dossel, umid, borda, clar, alto, mata, sig }`, cada campo um `Uint8Array(256)` (0..255; `alto` em quartos de metro) | o 3D (um pedaço de cada vez), a vista do deus |
| `G.Mata.regionNow(rx, ry)` | a mesma, conferida com o mundo no máximo uma vez por instante do relógio do mundo (o mundo só muda no passo) | o corpo e o desenho a cada quadro |
| `G.Mata.at(i)` / `G.Mata.fresh(i)` | uma casa, em números 0..1 (`alto` em metros); `fresh` faz do zero, sem memória (o verificador compara os dois) | as provas, o verificador |
| `G.Mata.floor(i)` | o chão da mata numa casa: `folhas` (a serapilheira debaixo do dossel) e `musgo` (a sombra úmida), 0..1 | o chão (21b: o `Ground3D` pode ler daqui as folhas do chão), a vista do deus |
| `G.Mata.tree(t)` | **as medidas de uma árvore do mundo de pé**: altura `H`, o coração da copa `cy`, o raio `r`, o achatamento `fl`, o alto `top` (m), se é emergente, a forma (`arq`: 0 guarda-chuva, 1 camadas, 2 coluna, 3 figueira) — as mesmas do desenho, das folhas que caem, do que pousa na árvore e do mapa do dossel | o `Arvore3D`, a porta `anchor`, o mapa do dossel |
| `G.Mata.stemsOf(i)` / `G.Space.stems(i)` | os caules duros da mata numa casa (`[X, Z, raio, tipo]` em metros): o feto arborescente, a árvore jovem, a palmeira fina, a touceira de bambu, a embaúba da clareira — o 3D os desenha ali e **o corpo do jogador não os atravessa**; o mundo nunca pergunta (fase A) | o 3D, o `avatar.js` (o `pushRound`) |
| `G.Mata.niche(região, lx, ly, x, y)` | o nicho de um ponto: a luz debaixo do dossel, a umidade, a borda, a clareira, a encosta, o bioma | o 3D (a espécie de cada planta) |
| `G.Arvore3D.anchor(t, 'colmeia'\|'ninho'\|'copa'\|'tronco')`, `G.Arvore3D.perchY(a)` | onde pousa o que pousa numa árvore do mundo, em metros, pela árvore desenhada (D-476) | o `things3d.js`, o `people3d.js`, o que vier (as folhas que caem, um pássaro) |
| `G.Mata3D.setShade(k)` | quanto as plantas da mata se pintam na sombra do dossel (1; 0 desliga): **quando o céu escurecer todo material pelo mapa do ar, a 21d põe 0** — as plantas não ficam duas vezes na sombra | o céu (21d) |

As medidas: o alto das copas de uma árvore crescida da selva fica a 17–28 m, as emergentes (uma em cada onze crescidas) 6 a 12 m
acima delas; as outras espécies têm as medidas de antes. **O vento** das plantas é o `R3.U.wind`, o único do 3D (o bloco do céu o
escreve; quando o `G.Ceu.wind` existir, ele passa a escrevê-lo, e as plantas seguem sem mudar nada). **A fase B** lerá o `G.Mata` no
passo do mundo: para isso a memória precisa de uma versão das árvores no `nature.js` (a leitura de uma casa em O(1)), que a fase A não
pôs para não mexer no mundo.

## 8c. As portas da água (21c)

O `G.Agua` (`js/agua.js`) é a fonte pura da água: lê o mundo (o chão e o tipo de cada casa, o nível de cada rio `S.wl`, as quedas
`S.relief.falls`, o gelo do inverno súbito, o mar aberto ao meio, as pontes e os prédios, o molhado `S.wet`, a chuva que cai, o clima, o
fundo do mar do `G.Sea`) e não escreve nada; sem acaso nenhum; não pergunta ao `G.Space` (a regra 23). A corrente é refeita **inteira**
quando pedida e o chão mudou (`S.typeVer`, `S.walkVer`); toda escolha dela é feita **no nível que o save guarda** (o centésimo da unidade
de altura, `G.Agua.levelQ`: L-1590) — a mesma corrente num mundo e no mesmo mundo salvo e carregado. O desenho é o `G.Agua3D` (`js/agua3d.js`).

| porta | o que dá | quem lê |
|---|---|---|
| `G.Agua.field()` / `G.Agua.flow(i)` | a corrente: `{ dx, dz, sp, q, D, par, dist, cx, cz }` (Float32Array por casa: o rumo, a velocidade em m/s, a vazão em casas de rio, a distância à foz, a casa para onde corre, a distância à praia em m e o rumo da terra); `flow(i)` uma casa (`{ x, z, sp, q }`; nada sob o gelo) | o 3D (o retrato da corrente), a vista do deus; na fase B, a corrente que empurra quem nada |
| `G.Agua.steps(x0, y0, w, h)` | os degraus da água num retângulo: `{ i, j, x, y, tx, ty, ax, ay, bx, by, nx, ny, top, low, drop, dq, q, sp, fall, name, kind ('queda'\|'corredeira'), frozen, sea }` — o lado partilhado em casas, as faces em metros | a lâmina e o borrifo (21c), a vista do deus; **o céu (21d): a névoa da queda no mapa do ar** (o pé `tx, ty`, a altura `drop`, a vazão `q`) |
| `G.Agua3D.sheetOf(s)` | o perfil desenhado da lâmina de um degrau (`{ sL, prof: [[d, y]…] }`, metros: onde ela bate na água de baixo) | o borrifo, as provas |
| `G.Agua.look(i)` / `turbid(i)` | a cor da água pelo lugar (`{ kind, col: [r, g, b] sRGB, clar, tur }`) e o quanto está turva | o 3D, a vista do deus |
| `G.Agua.foam(i)` | `[o pé de queda/corredeira, a corrente contra a margem ou uma pedra]`, 0..1 | o 3D |
| `G.Agua.shore(i)` / `shoreAt(X, Z)` | a distância à praia (m) e o rumo da terra | o 3D (o trem da praia) |
| `G.Agua.wet(i)` / `spray(i)` / `puddle(x, y)` / `rainNow(x, y)` | o molhado de uma casa de terra (0..1: o `S.wet` e a chuva de agora), o borrifo das quedas em volta do pé, onde a chuva empoça (0..1, um ponto em casas), a chuva que cai agora | o 3D, a vista do deus |
| `G.Agua.waveY(X, Z, t, vento, mar, fundo)` / `waveGLSL()` / `WAVE` | **a altura da onda desenhada** (m, nunca mais de 15 cm: D-506) — a mesma conta do sombreador (`waveGLSL`, feita dos mesmos números `WAVE`); `t` o relógio da vista (`R3.time()`), `vento` o do 3D (`R3.U.wind`) | o navio (`fx3d.js`), a esteira, as provas; o que vier a boiar |
| `G.Agua3D.wetU()` / `groundGLSL()` / `solidGLSL()` | o retrato do molhado (R a chuva agora, G onde empoça, B o borrifo; um texel por casa) e o pedaço de sombreador do chão molhado (`aguaWetGround`) e do telhado molhado (`aguaWetSolid`), com o brilho `gAgSheen` | o chão (`ground3d.js`, 21b), os prédios (`build3d.js`) |
| `G.Agua3D.light(key, keyI, skyIrr, k)` | a luz do sol e do céu na água, e os retratos que andam com o mundo (chamada do `light()` — na junção, do `ceu3d.js`) | o céu (21d) |

**O que a água lê do céu** (21d, junto em 327a14a): os pedaços do three.js remendados pelo `G.Ceu3D.toon` (o ar `gxHaze`, `gxAir`,
a luz das chamas `gxLM`), **o pano das nuvens** (`gxCloud`, no plano `gxCl2.x`: a água encontra-o ao longo do raio refletido, como o
domo o encontra do olho — as nuvens no reflexo desde a Média), **a parte da luz-chave que chega** (`gxKS`: o brilho do sol na água e a
luz no corpo dela escurecem sob as nuvens, os morros e o dossel), o `skyU` (o alto do céu, o rumo da luz, `cover`, `cloudCol`,
`cloudSh`), a luz da hora que o `G.Ceu3D.light(focus)` devolve (`key`, `keyI`, `sky`: o quadro do `realm3d.js` a passa ao
`G.Agua3D.light`), **o vento único** (`R3.U.wind`, escrito pelo `G.Ceu.wind`; o borrifo vai com o `G.Ceu.wind`) e **o sol**
(`G.Ceu.sun`: o arco-íris do borrifo, com o sol atrás do olho e mais baixo que 42° — a causa é o próprio borrifo, não o chão molhado
do arco-íris do céu, `G.Ceu.rainbow`). **A névoa da queda é do mapa do ar do céu** (`Ce.WHY.queda`): a água não desenha névoa. **A fase B** lerá o `G.Agua` no passo do mundo (a corrente que empurra o nadador e quem vadeia, a onda maior com quem nada
nela): a regra 182 muda com o protocolo inteiro.
