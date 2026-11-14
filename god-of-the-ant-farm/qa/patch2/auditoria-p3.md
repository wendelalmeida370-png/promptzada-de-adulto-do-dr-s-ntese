# Auditoria do P3 — a arquitetura nas duas vistas e os monumentos (Fase A)

Base: `f0f75f8` (v37). Tudo aqui foi lido no código; nada rodou (a máquina está na geração dos mundos). O que pede
reprodução diz como — a reprodução roda depois do aviso. Legenda: **lido** = visto no código, sem dúvida de leitura;
**a medir** = depende de números que só a prova dá.

## 0. O diagnóstico em cinco linhas

1. **Dois autores de forma que nunca se leem.** O deus desenha em `arch.js` (+ `cityart.js`, `court.js`, `estates.js`,
   `harbor.js`, `social.js`, `waters.js`, `art.js`), em pixels; o 3D tem formas próprias no `build3d.js` (o `KIT`) e, desde a
   v37, a casca da planta (`G.Interiors.shellOf`, D-038). O que as duas vistas têm em comum é só a paleta e o lote.
2. **A casca só sabe fazer casas.** Os 26 tipos com planta (o templo, os banhos, o paço, os três palácios, o mercado, a
   taverna, a olaria…) saem no corpo como uma caixa com o telhado da casa do povo; as formas de templo e palácio do `KIT`
   viraram código morto.
3. **Os 30 sem planta têm formas genéricas.** A maravilha é a mesma pirâmide de seis caixas para quatro povos — **o
   Coliseu do corpo é essa pirâmide** —; a egípcia é um cone de 8 lados; teatro, monumento e estátua são os mesmos para
   todos; e a figura de longe é caixa com duas águas para tudo.
4. **O deus não lê a casca.** A porta, a cumeeira, os andares e a cabana redonda do deus são dele, não os da planta; e a
   cadeia não tem desenho do deus (some).
5. **O conserto pela causa:** uma definição só da forma (`js/forma.js`), de onde o 3D constrói e a planta do monumento se
   arma, e à qual o desenho do deus fica amarrado por número (`qa/visual/fidelidade.js`), na câmera da descida (D-016).

## 1. O inventário

| Peça | Onde | O que faz |
|---|---|---|
| Paletas dos 6 estilos | `arch.js` `PAL` (l. 70) | as cores de parede, base, telhado, acabamento — lidas pelas duas vistas (o 3D por `palOf`) |
| O kit isométrico do deus | `arch.js` 12–233 | `P(dx,dy,z) = [(dx−dy)·16, (dx+dy)·8 − z]`: x, y em casas a partir do meio do lote, z em pixels; caixa, paredes, duas águas, quatro águas, colunata, degraus, pirâmide em degraus, tigela, cúpula, estátua |
| Os desenhos do deus | `arch.js` 236–900 (casa, cabana, quarteirão, salão, templo, monumento, armazém, celeiro, oficina, quartel, torre, praça, mercado, biblioteca, teatro, banhos, palácio, doca, aqueduto, maravilha); `cityart.js` (as oficinas, a taverna, a administração, a coletoria, o mercado clandestino, a estátua; os chãos dos currais e da feira); `court.js` 375–525 (paço, grande palácio, colossal); `art.js` 405–623 (os originais do clássico); `estates.js`, `harbor.js`, `social.js`, `waters.js` | um sprite por (tipo, `b.v`, povo, extra), em cache, sempre com a porta na face da frente-esquerda (+y) |
| A ponte deus → tela | `render.js` `drawBuilding` 2468, `drawMass`/`MASS` 2220 (a caixa de longe e girando), `drawSite`, ruína, cemitério, fogueira | só desenha |
| O 3D dos prédios | `build3d.js`: `kit` 425, `HEIGHT` 420, `KIT` 1459–1676 (forma de cada tipo), `house`, `longhouse`, `smithy`, `roundHut`, `stalls`, `fields`, `openings`, `roofOf`, `footing`, `doorSteps` | o perto, em metros, a partir do canto do lote |
| A casca no 3D | `build3d.js` 2477–3035: `B3.shellOf`, `shellHouse`, `shellRound`, `shellOpen`, `sideFace`, `opening`, `dressSide`, `flatTop`, `courtRoof`, `smokeOf`, `stilts`; o dentro: `B3.interior`, `FURN`, `insideTick`, `openPlace` | o prédio com planta desenhado da casca (a mesma de longe e de perto) |
| A figura de longe | `build3d.js` `farGeo` 1955 | caixa + duas águas por prédio (pela casca, ou pelo `HEIGHT`) |
| Em volta | `props3d.js` (lenha, barris, o estoque no pátio), `things3d.js` | só se vê |
| Malhas e materiais | `mesh-*.js` (7 do Blender), `tex3d.js` (49 materiais, gerado) | |
| As plantas cívicas | `int-civicos.js` (itens: ídolo, altar, bancos e esteiras dos fiéis, catre, armeiro, palha, piscina, fornalha, trono…; os programas templo, quartel, cadeia, banhos, paço sobre a receita de salão do `int-trabalho.js`); `int-palacio.js` (o palácio de pátio e alas; a feira aberta) | |

**No `G.S` e no save:** nada meu. O desenho vem de `b.type`, `b.style`, `b.v`, `b.wd`, o lote, `built/progress/hp` e da
casca (`b.ip`, que só o `interiors.js` escreve, regra 15). Estado de módulo do 3D zerado nos `worldHooks` (`chim`, `tops`,
`lamps`, `rolesMap`, `shellMemo`). O cache de sprites do deus não zera, mas a chave é pura.

**As provas que existem:** `Build3D.check` (número, fora do lote > 1,6 m, enterrado, flutuando, chão cortado),
`Props3D.check`, `qa/visual/geo3d.js`, `casas.js`, `fotos.js`, `interior3d.js`, `qa/casca.js` (a casca de longe = a da
planta), `qa/plantas.js`, `guarda3d.js`, a e11 do encarna. **Nenhuma compara as duas vistas.**

## 2. A classificação

| Peça | Estado |
|---|---|
| Paleta, materiais, `STUFF`/`PAT` | funcional e reutilizável |
| Desenhos do deus | funcional (é a referência do dono), mas não lê a casca: incompatível com a planta (porta, cumeeira, andares, cabana redonda) |
| Casca no 3D (`shellHouse`…) | funcional e reutilizável — vocabulário de casa: falta colunata, pódio/crepidoma, frontão, cúpula, pirâmide, pilono, tambor de arcos, arquibancada |
| `KIT` das casas e oficinas | código morto para o que foi construído com registro (fica para a obra e para save sem registro) |
| `KIT` dos monumentos (maravilha, teatro, monumento, estátua, torre, praça, aqueduto, biblioteca, administração, coletoria, mercado clandestino) | só visual e genérico: outra construção que a do deus |
| `KIT.temple`, `KIT.palacio`, `KIT.banhos` | código morto com registro (e mesmo assim genéricos) |
| Figura de longe, `HEIGHT` | parcial: caixa + duas águas; uma altura por tipo, não por povo |
| Plantas dos templos | existem, mas genéricas (a mesma receita de salão para todo povo; só muda banco ou esteira) |
| Plantas da maravilha, do teatro, do monumento | ausentes — bloqueadas pelo motor (P4-10) |
| Prova que amarra as vistas | ausente |

## 3. Os defeitos da minha área

Cada um vira L-26x quando corrigido, com a prova que falhava passando.

**L-a. O Coliseu (o caso do dono).** `build3d.js` 1524: fora o egípcio, a maravilha é seis caixas de 3,4 m, cada uma 14%
menor, e uma caixa de ouro — a mesma para o romano (Coliseu), o grego (Acrópole), o nórdico (Valhala), o asteca (Templo
Mayor) e o clássico. O deus (`arch.js` 834–900) tem seis formas: a tigela de três andares de arcos com os mastros do velário
(romano); o planalto de pedra com o templo de colunas e a estátua (grego); o salão de teto de escudos de ouro com dois
dragões (nórdico); a pirâmide de cinco degraus com a escada e os dois santuários, azul e vermelho (asteca); a pirâmide
lisa de ponta de ouro e porta (egípcio); o zigurate de quatro andares com o olho (clássico). De longe (`farGeo`), toda
maravilha é uma caixa de 10 m com telhado de duas águas. *Causa:* forma própria do `KIT`. *Reproduzir:* `fidelidade.js`
no romano: silhueta e aberturas (o deus mostra ~45 arcos; o 3D, nenhum).

**L-b. A Grande Pirâmide é um cone de 8 lados.** `build3d.js` 1523 usa `SH.cone` = `ConeGeometry(0.5, 1, 8)`
(`realm3d.js` 340): raio 8,1 m — a base octogonal passa ~1,5 m do lote de 12 m de cada lado (o `B3.check` só acusa acima de
1,6 m); sem a ponta de ouro e sem a porta do deus; de longe, uma caixa de 24,7 m de teto plano. O "obelisco" do
monumento (1514) é a mesma agulha redonda, sem piramídio. *Reproduzir:* `B3.bounds(b)` dá ~15 m de largura num lote de 12.

**L-c. Os templos de todos os povos são um casarão.** Com registro (todo templo construído na v37), o 3D desenha a casca do
`work()` do `int-trabalho.js` (94–106): retângulo do lote com margem de 0,15–0,3 m e o telhado da casa do povo. O deus:
crepidoma, peristilo e frontão (grego); pódio com escada e pórtico (romano); pilonos com mastros e bandeiras (egípcio);
pirâmide de quatro degraus com santuário e crista (asteca); igreja de madeira de três telhados com torre e dragões
(nórdico). *Causa:* a gramática da casca não tem os elementos do templo. O mesmo com os banhos (as termas de cúpula, o
lago sagrado, o temazcal, a sauna), o paço e os palácios (colunatas, cúpula, pilonos, plataforma em degraus, jardins).

**L-d. Teatro, monumento e estátua iguais para todo povo.** `KIT.teatro` (1538): a mesma meia-tigela de 45 caixas; o deus:
jardim sagrado com tanque (egípcio), campo de pelota (asteca), salão do hidromel (nórdico), arena de dois andares de arcos
(romano), meia-tigela com o palco (grego, clássico). `KIT.monument`: a agulha; o deus: a estátua de ouro com lança (grego),
a coluna de Trajano (romano), a pedra do sol (asteca), as três pedras da serpente (nórdico), o obelisco (egípcio, clássico).
`KIT.estatua`: um boneco de caixas cinzentas; o deus: o deus em ouro de cada povo.

**L-e. O deus não lê a casca** (o P4-6, do lado meu). O sprite é por (tipo, `b.v`, povo): a porta sempre na face +y; a
cumeeira pelo `b.v` (o 3D pelo dado da planta); os andares fixos (sobrado 2, ínsula 3 ou 4 — a planta dá ao sobrado até 3,
à ínsula 4 ou 5, à casa até 2); a cabana quadrada do grego e do romano onde a planta é redonda, a redonda do asteca onde ela
é retangular. *Reproduzir:* nos mundos prontos, contar os prédios com planta cujo lado da porta, a cumeeira ou os andares
não são os do sprite.

**L-f. A cadeia não aparece na visão de Deus.** `render.js` 2489–2490: `Art.building('cadeia', …)` dá `null` em todo
estilo (não está no `MAXZ`, nem no `A.EXT`, nem no `art.js`), e o `drawBuilding` sai: só a caixa de longe quando o mundo
gira. *Reproduzir (Node, sem mundo):* `G.Arch.building('cadeia', 0, s)` e `G.Art.building(...)` nulos para os 6 estilos.

**L-g. A salina e a salga não têm forma no 3D, e os campos novos ficam sobre pedra.** O `draw()` cai no `house()` quando
o `KIT` não tem o tipo: sobre os tanques de sal do deus, uma casa de 12 × 12 m. E `Space.BASELESS` (`space.js` 135, do
P4) foi escrita à mão sem `pomar`, `apiario`, `salina`: o 3D põe uma laje de pedra de 0,4 m sob o pomar (o deus usa
`def.field`, sem base).

**L-h. Os telhados planos pela casca perderam o povo.** `flatTop` (2959) não põe nada no terraço além da planta: o toldo e a
torre de vento de toda casa egípcia, os vasos de flores da asteca, que o deus desenha (e que o `house()` antigo tinha),
sumiram no corpo. E a casa asteca de andares em degraus (`stepped`) só existe no `KIT`, não na casca.

**L-i. Altura sem regra.** As alturas do deus e do 3D batem por acaso. A ligação oficial é a da descida (D-016: a cena do 3D
achatada em 0,62, 30° e 5,657 px por metro → **1 m de altura = 3,04 px do deus**). O templo grego bate (17 px ↔ 5,6 m); a
casa não (a parede de 9 px pede 3,0 m; o 3D tem 2,6). `HEIGHT` dá 26 m a toda maravilha (o deus: de 50 a 78 px).

**L-j. Os eventos acontecem na frente** (`festivals.js` 88; do P1): os Jogos lutam diante da arena, as Dionísias diante
do teatro. Do meu lado, falta o espaço: **não há arquibancada, palco nem arena em planta nenhuma** (o exemplo C).

## 4. As dependências

| Com quem | Preciso | Dou |
|---|---|---|
| **P4** (motor) | a extensão do §5.5 dele: arquibancada (fileiras com altura própria, as escadinhas), cômodo em anel na casca redonda (a arena e o deambulatório), base maciça sob um nível `elevado` (pódio, crepidoma, plataforma, pirâmide), colunata como arcada externa que abre num pórtico, a escada íngreme de templo como a classe «escada de mão» larga (a do Templo Mayor tem ~76°); `BASELESS` lida do `def.field`; o `In.VERSION`, o catálogo e os mundos de novo quando as famílias do templo mudarem | as receitas dos monumentos, do teatro e do templo de cada povo (`int-monumentos.js`, `int-civicos.js`); a forma que a casca deve seguir; o desenho no 3D dos elementos novos; a porta do deus pelo lado da planta (P4-6) |
| **P1** (pessoas, festas) | as festas e o lazer lendo os pontos das plantas | os pontos de uso, nomes já combinados: `assistir`, `atuar`, `lutar`, `rezar`, `oficiar`/`ofertar`, `topo`; trono `sentar` e `audiencia`; o `openPlace` com o `q.st` |
| **P2** (ofícios) | o que a olaria, a taverna e o mercado mostram por fora (o forno no pátio? o largo aberto do mercado?) — a família da casca é dele e do P4 | a forma de fora fiel ao deus, para eles escolherem a família certa |
| **Líder** | a linha do `js/forma.js` e do `js/int-monumentos.js` no `index.html`; o `forma.js` na regra 16 do `guard.js` (sem acaso); o arquivo `qa/forma-inv.js` no `junta-inv.js`; o bloco de desenho dos palácios do `court.js` (375–525) passar a ser meu (hoje não é de ninguém); uma leva só dos mundos prontos com o P4 | os textos L/T/D da minha faixa, as provas, os relatórios |

## 5. O desenho

**5.1 A forma (`js/forma.js`, `G.Forma`).** Dados e funções puras — nada do `G.S`, nada de acaso (variação só pelo
`G.hash(b.id)`): `G.Forma.of(type, style)` dá a definição no quadro canônico da planta (a entrada na frente, `v = L`; `u`
de lado; metros; `y` do chão para cima), ou `null` para os tipos cuja forma é a da casca (as casas, as oficinas). A forma é
uma lista de elementos: `bloco`, `degraus` (crepidoma, pódio), `piramide` (lisa, com o piramídio), `escalonada` (degraus e
escada da frente), `colunata` (quantas, raio, ordem), `entablamento`, `frontao`, `telhado`, `cupula`, `tambor` (o anel de
arcos em andares e o ático), `cavea` (fileiras em anel ou meio anel), `arena`, `palco`, `pilono`, `obelisco`, `estatua`
(pose, ouro ou pedra), `pedra` (rúnica, do sol), `mastros`, `braseiros`, `jardim`/`tanque`, `campo` (de pelota). Mais:
`G.Forma.ZPX = 3.04` (D-016), a altura do alto de cada forma (no lugar do `HEIGHT` para esses tipos) e a entrada.
Os números vêm do desenho do deus (a referência), convertidos: casas × 4 m, pixels ÷ 3,04. Onde a proporção do deus não se
anda pela regra do corpo (a escada de ~76° do Templo Mayor), a forma diz o que é: escada de mão larga, ou alto restrito.

**5.2 O 3D da forma (`build3d.js`).** `formInto(K, F)`: um construtor por elemento, no material do povo, com o fino só onde
`K.fine`; o `KIT` da maravilha, do teatro, do monumento e da estátua passa a ser `formInto`; nos tipos com planta e forma
(templo, banhos, paço, palácios), a casca da planta e, em volta dela, os elementos da forma que não são casca (colunata,
pódio, frontão, cúpula, pilono, pirâmide) — no mesmo quadro (o lado da casca). A figura de longe e o `heightAt` da forma.
O `B3.check` mais justo para as formas (fora do lote acima de 0,3 m).

**5.3 As plantas dos monumentos (`int-monumentos.js`)**, sobre a extensão do P4, com a casca tirada da forma:
- **Coliseu** (maravilha romana, e a arena do teatro romano, menor): casca redonda de r ≈ 5,8 m; no térreo a arena (o
  círculo aberto), o deambulatório (o anel) e os quatro vomitórios nos eixos (o da frente é a entrada); a cavea em fileiras
  com escadinhas (os lugares `assistir`); o hipogeu (os bastidores sob a arena: a espera dos gladiadores e das feras), por
  uma escada do deambulatório; `lutar` no chão da arena.
- **Teatro grego e clássico:** meia cavea, a orquestra (`atuar`), a skene com a colunata, os párodos. **Campo de pelota:** o
  campo entre os muros, as plataformas de cima com `assistir`. **Salão do hidromel:** o salão (bancos, o fogo comprido, o
  assento alto: `atuar` para o escaldo). **Jardim sagrado:** o jardim aberto com o tanque, `rezar` diante da imagem.
- **Templo Mayor:** a pirâmide de cinco degraus, a escada (de mão larga) até o topo, os dois santuários com o altar
  (`oficiar`, `ofertar`) e o `topo`; `rezar` em fileiras no pátio ao pé. **Grande Pirâmide:** maciça; a porta que o deus
  desenha é a entrada lacrada; o lugar da oferenda ao pé da face da frente. **Acrópole:** o planalto, a subida, o templo de
  colunas com a imagem, a estátua ao ar livre, o altar diante do templo. **Valhala:** o grande salão (o assento do rei, os
  bancos, o fogo, as mesas). **Zigurate:** maciço; `rezar` ao pé.
- **Os templos de cada povo** (novas receitas, minhas): grego (crepidoma, peristilo, pronaos, cela com a imagem, o altar
  fora, diante da fachada), romano (pódio alto, escada, pórtico de colunas, cela), egípcio (pilonos, pátio de colunas a céu
  aberto, sala hipostila, santuário), asteca (pirâmide de quatro degraus, escada, santuário com crista, o pátio ao pé),
  nórdico (nave e coro, a galeria coberta em volta, os três telhados), clássico (degraus, pórtico, cela). `rezar` em
  fileiras diante da imagem em todos.

**5.4 O deus amarrado à forma e à casca.** (a) Pela prova (`fidelidade.js`, parte b): o sprite de cada tipo e povo contra a
projeção da forma — o código do deus fica como está, e um desvio é pego. (b) O deus lê a casca nos prédios com planta: a
face da porta pela `entrance.side` e a rotação (espelho para a face direita; sem porta nas faces de trás), a cumeeira
(`roof.along`), os andares, a cabana redonda, o anexo — a chave do sprite por esses números, a memória medida. (c) A cadeia
ganha o seu desenho do deus (`cityart.js`, por povo).

**5.5 A prova (`qa/visual/fidelidade.js`), em Node com o `tres-node.js`.** Para os 56 tipos × 6 estilos, um prédio de
mentira, construído, num lote plano, com o registro feito à mão (`In.newRecord`, porta ao sul — a face da porta do deus):
(1) o deus por um contexto que grava (o `G.Art.sprite` trocado: polígonos e cores), rasterizado; (2) o 3D (perto e longe)
projetado pela câmera da descida — `P(dx, dy, z)` com `z = Y × 3,04` —, com z-buffer na direção do olhar, rasterizado igual.
Mede: a silhueta (IoU), a altura do alto, o perfil da largura em 8 faixas, a linha do chão (o contorno da planta vista da
frente), as aberturas (manchas escuras nas faces: quantas e quanta área), e a silhueta de longe. Os limites fixados por
princípio, calibrados uma vez nas casas (onde as vistas concordam) e escritos no arquivo com o motivo — nunca afrouxados
para passar. Parte (b), onde há forma: o deus contra a forma, o 3D contra a forma (a planta vista de cima, as alturas, as
contagens de colunas, andares, arcos, santuários). **Hoje ela tem de falhar** em: maravilha (romano, grego, nórdico,
asteca; egípcio pelo octógono), teatro, monumento, estátua, templo, palácios, banhos, mercado, cadeia, salina, praça,
aqueduto, torre nórdica, biblioteca e administração do norte e do sul — a medir.

**5.6 Invariantes e regras.** As do desenho vivem nas provas do 3D (o `QA.check` é do mundo). As do mundo
(`qa/forma-inv.js`): S2 — todo monumento construído tem planta válida e a entrada na rua; S3 — a casca de um prédio com
forma segue a forma (o mesmo contorno e a mesma frente). Regras do `guard.js` a pedir: o `forma.js` sem `G.S` e sem acaso
(na regra 16); «a forma é uma só»: no `build3d.js`, o `KIT` dos tipos que o `G.Forma` define é o `formInto`.

**5.7 O save.** Nada novo no `G.S` para o desenho. Os tipos novos com planta (maravilha, teatro, monumento) ganham registro
na fundação (`In.found`) e, nos saves antigos, pelo `In.migrate`. O templo com famílias novas: `In.VERSION` sobe, o
catálogo é gerado de novo, os mundos prontos também — com o P4, numa leva só.

## 6. O que vou fazer, em ordem

- **B1** `qa/visual/fidelidade.js` (+ a biblioteca: o gravador do deus, a projeção da descida, as medidas, o relatório).
  Depois do aviso: roda no código de hoje → a tabela com os números ao líder.
- **B2** `js/forma.js` com o vocabulário, o `ZPX` e as seis maravilhas; a parte (b) da prova.
- **B3** `formInto` no `build3d.js`; a maravilha pela forma; o longe e a altura pela forma → o Coliseu, a Pirâmide, o Templo
  Mayor, a Acrópole, Valhala e o zigurate passam na prova (Node).
- **B4** o `openPlace` com o `q.st` (pedido do P1).
- **C** as três fatias por fora: a casa (o deus lê a casca; o povo de volta ao telhado plano, com o P4), a olaria (o forno
  fora, o pátio — com o P2 e o P4), a taverna (o pátio da frente; o salão do hidromel) — na prova, os 3 tipos × 6.
- **D** teatro, monumento, estátua, templo, palácios e banhos de cada povo pela forma; as plantas do Coliseu, dos teatros,
  do Templo Mayor, da Acrópole, de Valhala e dos templos (com a extensão do P4: o exemplo C); a cadeia no deus; a porta do
  deus pela planta.
- **E** o resto da tabela abaixo: praça, aqueduto, torre nórdica, biblioteca, administração, coletoria, mercado aberto,
  mercado clandestino, os celeiros de cúpula do Egito e de barro dos astecas, estábulo, salina e salga, os campos.
- **F** a prova dos 56 × 6 (passando, ou a lista honesta do que ficou parcial), `guard`, `guarda3d`, `corpo-rig`, a e11, o
  `plantas.js` e o `casca.js` com as plantas novas; fotos antes e depois pela catraca (os monumentos do `mundial` e do
  `mega`, a descida sobre o Coliseu).

## 7. A minha parte da matriz (o espaço e a forma)

| Categoria (nomes por povo) | Função e atividades | Quem | Objetos com função | O jogador deveria | O que sustenta hoje | Estado |
|---|---|---|---|---|---|---|
| **Templo** | a fé do povo; rezar, oficiar, ofertar; as festas sagradas | o sacerdote; os fiéis; o cortejo das festas | ídolo, altar (`oficiar`, `ofertar`), fileiras (`rezar`/`sentar`), lampadário, cofre | rezar diante da imagem, oficiar sendo sacerdote, ofertar, assistir ao rito | planta (`int-civicos`), a devoção e a reza (P1), as festas (P1) | **parcial**: a planta tem altar e imagem; a reza é na porta; a forma de fora é genérica (L-c) |
| **Monumento** | a marca da vila; rezar e visitar | quem passa, quem reza | — (sem planta) | ver de perto, rezar ao pé | a reza no monumento (P1) | **só visual**, e no 3D outra construção (L-d) |
| **Estátua de Ouro** | o deus em ouro | quem passa | — | ver, rezar ao pé | o custo em ouro | **só visual**, cinzenta no 3D (L-d) |
| **Maravilha** (Coliseu, Grande Pirâmide, Templo Mayor, Acrópole, Valhala) | a obra do povo; o lazer; as festas como templo; o Toxcatl no alto | o povo da capital | — (sem planta) | explorar o que for acessível, assistir aos jogos (romano), subir ao alto (asteca), rezar | lazer (`city.js`), festas (P1), lore e histórias | **só visual**, e no 3D a forma errada (L-a, L-b) |
| **Teatro** (Teatro, Arena, Salão do Hidromel, Campo de Pelota, Jardim Sagrado) | espetáculos, jogos e ritos; o lazer | atores, coro, gladiadores, o público | — (sem planta) | **assistir de um lugar da plateia** (exemplo C), atuar ou lutar quando chamado | o lazer «dentro» sem lugar; as Dionísias e os Ludi (P1), mas na frente | **parcial**: o evento é real e ligado às festas, mas sem espaço (L-j) |

**A tabela de divergências das duas vistas.** Fonte do 3D: **C** casca da planta · **K** `KIT` · **H** `house()` genérica.
Igual: **=** a mesma construção · **≈** a mesma, com perdas · **≠** outra construção. Causa: **1** dois autores · **2** a
casca só faz casa · **3** o longe genérico · **4** o deus não lê a casca · **5** lista à mão · **6** o povo perdido no
terraço. Tudo **lido**; a gravidade de cada ≈ é **a medir** pela prova.

| Tipo | 3D | Deus | Corpo | = | Causa |
|---|---|---|---|---|---|
| maravilha | K | 6 formas (L-a) | zigurate p/ 4 povos; cone de 8 lados p/ o egípcio | ≠ (clássico ≈) | 1, 3 |
| teatro | K | jardim, campo de pelota, salão, arena, meia-tigela | a mesma meia-tigela de caixas | ≠ (grego ≈) | 1, 3 |
| monument | K | estátua, coluna de Trajano, pedra do sol, pedras rúnicas, obelisco | agulha redonda (o nórdico: pedras rúnicas ✓) | ≠ (nórdico =) | 1 |
| estatua | K | deus de ouro por povo | boneco cinzento | ≠ | 1 |
| temple | C | 6 formas (L-c) | casarão com o telhado da casa | ≠ | 2 |
| palacio, grande_palacio, palacio_colossal | C | colunatas, cúpula, pilonos, plataforma em degraus, jardins (`arch.js`, `court.js`) | pátio e alas com o telhado da casa | ≠ (nórdico ≈) | 2 |
| paco | C | por povo (`court.js`) | salão de casa | ≈ (asteca e egípcio ≠) | 2 |
| banhos | C | termas de cúpula; lago sagrado; temazcal; sauna | salão de casa | ≠ | 2 |
| mercado | C | largo calçado com bancas (+ tholos, stoa, galpões) | salão fechado | ≠ | 2 |
| cadeia | C | **nada** (L-f) | casca | ≠ | — |
| biblioteca, administracao | K | por povo (pórtico, basílica, pilonos, plataforma, salão do thing) | a mesma casa de 2 andares com colunata (no norte, de telha) | ≈ clássicos; ≠ egípcio, asteca, nórdico | 1 |
| coletoria | K | casa-forte de pedra | casa comum | ≈ | 1 |
| torre | K | pedra com ameias; nórdico: torre de madeira em pernas | pedra para todos | ≠ nórdico | 1 |
| praca | K | círculo de pedras, stoa, rostra e coluna, obelisco e palmeiras, altar e bancas, fonte | a fonte para todos | ≠ (clássico =) | 1 |
| aqueduto | K | caixa-d'água de arcos; tanque com shaduf (egípcio); tina em pernas (nórdico) | bloco de pedra para todos | ≈ clássicos; ≠ egípcio, nórdico | 1 |
| mercado_negro | K | barraco de restos, cortina, lanterna | duas bancas | ≠ | 1 |
| estabulo | K | estábulo comprido ao fundo do cercado | caixa fechada no lote | ≠ | 1 |
| salina, salga | H | tanques de sal; casa com varais de peixe | casa genérica (a salina: casa sobre os tanques) | ≠ | 5 |
| pomar, apiario | K | no chão | sobre laje de pedra (L-g) | ≈ | 5 |
| celeiro, storehouse | C | celeiros de cúpula (egípcio), de barro com palha (asteca), sobre esteios (nórdico) | salão de casa (esteios só se a família for essa) | ≠ egípcio, asteca; ≈ outros | 2, 4 |
| olaria | C | casinha no canto, o pátio com o forno de colmeia, a roda, as tábuas de secar | caixa no lote todo, o forno dentro | ≈ (o forno some por fora) | 2 |
| taverna | C | casa com o pátio da frente (bancos, barris, letreiro); o salão do hidromel | caixa no lote todo, letreiro | ≈ | 2 |
| forja, workshop, tecelagem, acougue, ourives | C | casa com o galpão aberto do ofício | caixa (às vezes com telheiro) | ≈ | 2 |
| hut | C | redonda (asteca, clássico) ou quadrada | a família da planta escolhe | ≈ / ≠ conforme a família | 4 |
| house, sobrado, insula | C | por povo (a asteca em degraus, a egípcia com toldo e torre de vento, a romana com lojas e toldos) | caixa com os andares da planta | ≈ (asteca ≠; andares e cumeeira podem não bater) | 4, 6 |
| quarteirao | C | quatro casas em volta do pátio | quadra da planta | ≈ | 4 |
| barraco | C | tábuas e telhado de uma água | = | = | — |
| quartel | C | salão, cavalete de lanças, escudos | salão e mastro | ≈ | 2 |
| armazem, doca | C, K | salão e caixas; cais, guindaste | salão; cais | ≈ | — |
| feira, curral, cercado, cemetery, campfire, well, farm, plantacao, vinhedo, horta, mina, ruin, sericultura, perolaria | K / C | — | — | = ou ≈ | — |
| **todos sem casca** | — | — | de longe: caixa com duas águas | ≠ de longe | 3 |
