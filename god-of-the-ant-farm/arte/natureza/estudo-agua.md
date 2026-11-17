# Pilar 3 — A água e os fenômenos naturais (estudo do batedor)

Árvore estudada: `76e3cae`. Só estudo: nenhum código do jogo mudado.

**Em poucas linhas.** A água do 3D já tem uma base boa (profundidade lida do leito em cada ponto, Fresnel, quatro trens de onda, espuma de praia, cáusticas, as chamas refletidas à noite), mas **não desenha cachoeira nenhuma** (o mundo tem 36–42 quedas principais, 14 com nome, num mundo montanhoso ou alpino; o 3D deixa um degrau seco entre as duas lâminas), **perde a corrente em 10–50 % dos rios**, pinta **toda a água de uma cor só** (a vista do deus distingue trópico, frio, lama, recife), **reflete só a cor do céu** (nem as nuvens, nem a mata, nem o morro) e **a chuva não molha nada** (o mundo tem `S.wet`; o 3D não lê). As quedas que o gerador faz são torrentes de 4 m em escada, sem poço, em montanha fria: a cachoeira de documentário precisa do pilar do relevo. A proposta: uma fonte só e pura da água (`G.Agua`: corrente completa, degraus, costa, molhado, poças, a onda desenhada), um arquivo do 3D (`agua3d.js`: o material refeito por camadas, a lâmina das quedas, espuma por causa, ondas com volume perto do olho, reflexo em degraus por qualidade) e as provas (`qa/agua.js`, as invariantes que já existem no código e nenhuma prova chama).

Scripts deste estudo (todos fora do repositório): `agua-scripts/` ao lado deste arquivo.

## 1. O que existe

### O mundo
- Tipos de chão: `G.T = { DEEP:0, SEA:1, RIVER:2, SAND:3, ... }` (`js/world.js:9`). Mar = `DEEP`/`SEA` no nível `G.SEA = 2.0`; rio **e lago** = `T.RIVER`, cada casa com o seu nível `S.wl[i]` (Float32, no save, `save.js:97`).
- Rios e lagos nascem em `G.Relief.hydro` (`js/relief.js:233`): inundação a partir do mar (priority flood), `down[i]` = para onde a água de cada casa vai, `acc` = chuva juntada; rio onde `acc` passa de um limiar; torrentes de montanha (relevo com `peak >= 14`); níveis por casa do mar para cima; trechos íngremes "quantizados" em degraus (poços e quedas, passo `Q = 1.6 + peak*0.035`).
- **Cachoeiras já existem no mundo**: `S.relief.falls = [{x,y,tx,ty,drop,tot?,steps?,sub?,name?}]` — onde `wl[i] - wl[down] > 0.8`; quedas a 1–2 casas viram uma só (o topo leva a altura toda). Nomeadas as grandes (`nameAll`). Vão no save (`relief`).
- **O sentido da corrente NÃO é guardado**: `down[]` é devolvido por `hydro` e jogado fora (`world.js:521`). O 3D o deduz de `S.wl` (`realm3d.js` `flowTick`); a vista do deus também (`render.js` `drawCurrents`).

#### Números medidos (Node, `nodemundo.js`; script `agua-scripts/conta-agua.js`)
Escala: 1 casa = 4 m (`G.Space.TILE`), 1 unidade de altura = 1,5 m (`G.Space.HM`).

| mundo | lado | água doce (rio / lago) | funda | quedas (principais / nomeadas) | maiores quedas (m) | degrau de água p90 / máx (m) |
|---|---|---|---|---|---|---|
| pronto cidade (Hedeby) | 512 m | 314 / 217 | 174 | 0 | — | 0,36 / 0,78 |
| pronto metrópole | 640 m | 519 / 336 | 160 | 3 / 0 | 2,2 · 1,8 · 1,5 | 0,43 / 2,2 |
| pronto mega | 640 m | 584 / 539 | 344 | 7 / 4 | 9,1 · 6,0 · 3,4 | 0,97 / 4,2 |
| pronto mundial | 640 m | 648 / 394 | 252 | 14 / 10 | 8,7 · 8,3 · 8,2 · 6,4 | 1,1 / 4,6 |
| gerado 4242 plano | 768 m | 662 / 1163 | 761 | 1 / 0 | 2,0 | 0,36 / 2,0 |
| gerado 4242 suave | 768 m | 720 / 880 | 583 | 6 / 5 | 9,9 · 9,3 · 8,0 | 1,2 / 3,0 |
| gerado 4242 montanhoso | 768 m | 1058 / 1179 | 839 | 36 / 14 | 21 · 15 · 14 · 14 · 12 | 2,7 / 9,2 |
| gerado 4242 alpino | 768 m | 1139 / 1011 | 749 | 42 / 14 | 32 · 28 · 25 · 22 · 21 | 3,5 / 9,5 |

- Os mundos prontos que o dono mais abre (Hedeby, a metrópole) quase não têm queda: as cachoeiras moram nos mundos montanhosos e alpinos. Uma cachoeira «de documentário» (20–30 m) só existe hoje no relevo alpino/montanhoso.
- **Sentido da corrente medido** (`agua-scripts/fluxo.js`): a conta do 3D (`flowTick`) contra o `down[]` verdadeiro do `hydro` (pego antes de ser jogado fora). Onde ela acha corrente, acerta (0–2 % contra); mas **a corrente some em 10–50 % das casas de rio** (|f| < 0,45: o sombreador volta ao vento) — 48–50 % no relevo plano, 26–31 % no suave, 10–16 % no montanhoso/alpino. Causa: o rio de planície fica todo no nível do mar ou em trechos de nível igual (`wl` igual), e a conta só vê descida.
- **Protótipo «pela foz»** (`agua-scripts/fluxo2.js`, só medição): Dijkstra a partir das casas de rio vizinhas do mar subindo o rio (sem descer de nível), e um segundo passe a partir dos lagos sem saída (os rios que acabam num lago «encolhido» do `hydro`, que perde a saída: 500–1100 casas de água doce por mundo não têm caminho ao mar!). Resultado: corrente em 90–99 % das casas de rio, 1–7 % contra o `down[]`. É derivável do que o save já tem (`S.type`, `S.wl`), puro, refeito por `S.typeVer`.

### A chuva, o vento, a maré (o mundo)
- `S.weather = { kind, t, rain, windA, windS, drought, storm, nextEvent }` (`world.js:58`), `updateWeather` em `js/nature.js:204`. **A chuva geral (`w.rain`) só sobe durante a tempestade** (`storm`, até 0,85); fora dela a chuva é local, das nuvens (`S.clouds`: `natural`, `divine`, `storm`), lida por `G.Nature.rainAt(x, y)` e `cloudIntensity`. Raios nas nuvens de tempestade (`G.Powers.naturalLightning`).
- `S.wet[i]` (Float32 por casa): a chuva molha o chão sob a nuvem (`+inten·dt·0,25`), seca em dias (`-dayF·1,6`, `·3` na seca). Lido pelo fogo e pelo crescimento das plantas. **O 3D não lê `S.wet`**: o chão não escurece nem brilha com a chuva; não há poças.
- Vento: `windA` (direção que vagueia), `windS` (0,3 normal, 0,45 seca, 0,95 tempestade). O 3D lê em `U.wind` (`realm3d.js:2069`) — ondas, capim, chuva, fumaça.
- Maré: `G.Sea.tide()` (cosseno do dia: duas por dia), `Sea.shift()` (até 0,48 casa para o mar na baixa, 0,2 para a praia na alta), `Sea.dryAt`, `Sea.tideSegs/tideChains` (`js/sea.js:245`). **Só a vista do deus desenha a maré** (`Sea.drawTide`); o 3D não tem maré (o mar fica sempre em `G.SEA`). As conchas e o mangue usam a maré no mundo.
- O deus muda a água: o milagre de afundar/erguer (`miracles.js:174`, depois `Rf.fixArea`), o Inverno Súbito (`S.ice`, só `winter.js`), o mar aberto ao meio (`S.dry`, só `seapart.js`). O nível dos rios (`S.wl`) não muda com cheia nem seca (o comentário do `flowTick` sobre «a flood, a drought» está velho).
- O fundo do mar: `G.Sea.floor` (areia, pedra, pradaria, recife, kelp, buraco azul, lama), `Sea.dl`, pilares e arcos (`Sea.stacks`), grutas — tudo derivado do chão, não vai no save.
- A água doce dos bichos (`fauna-meio.js`): `dF` (passos até a água doce) e `dL` (a que dura a seca), refeitos por `S.typeVer`; os bebedouros (`G.Meio.places`), as travessias (`crossings`).
- O nado: o corpo (`avatar.js` `swim`, `waterAt` = `W.waterH·HM`, plano por casa; `TUNE.swimIn 0,66 · swimOut 0,56 · wadeDrag 0,5`), afogar (`drown`), subir a margem (`tryClimb`). **A corrente não empurra o nadador** (nem a pessoa que vadeia). As pessoas do mundo: `v.act = 'swim'`/`'dive'` (mergulhadores, `waters.js`), náufragos.

### O 3D (Modo Encarnado)
Tudo em `js/realm3d.js` (2.107 linhas), menos as partículas (`js/fx3d.js`) e o chão molhado (`js/ground3d.js`).
- **A malha da água** (`waterGeo`, `realm3d.js:987`): **um quadrado plano por casa** (2 triângulos, 4 × 4 m), na altura do mar (`G.SEA·HM`) ou do `S.wl` da casa + 5 cm. Cada canto leva a marca `aShore` (0 aberto, 1 junto à terra, 2 parada — tanque, fonte —, -1 o mar além do mapa). Na beira, o quadrado continua sobre a terra baixa (`seaReaches`, `bankLevel`) e a linha d'água sai do encontro com o chão, não da borda da casa. Por pedaço de 16 × 16 casas: uma malha de água perto, uma longe (sem as beiras), mais o «oceano» além do mapa (`makeOcean`, 1.400 m de moldura). Gelo do Inverno Súbito (`MAT.ice`) e as paredes do mar aberto ao meio (`MAT.wallWater`, Phong liso).
- **Entre duas casas de rio de níveis diferentes não há nada**: nenhuma face vertical. Numa queda, a lâmina de cima acaba no ar, e a de baixo começa um ou mais metros abaixo; o que se vê entre elas é uma rampa do chão (os cantos da borda partilhada ficam no nível de cima — `Rf.normalize` põe na face da água o canto que toca terra —, e a casa de baixo mostra o leito subindo de dentro da água até o lábio). **O 3D não desenha cachoeira nenhuma** — nenhum arquivo do 3D lê `S.relief.falls` (só o som `audio.js:341`, a câmera do cinema `cinema.js:630`, as histórias e a vista do deus).
- **Uma cor só para toda a água do mundo** (`SHALLOW = [64, 162, 172]`, `realm3d.js:868`, e o fundo `uDeep` fixo): o 3D pinta igual o mar da tundra, o do trópico, o recife, a foz lamacenta e o lago de montanha — **a vista do deus os distingue** (`Sea.look`, `sea.js:787`: raso quente turquesa, frio verde-acinzentado, lama, recife). As duas vistas discordam: ganho rápido e barato.
- **A câmera nunca entra na água** (`cam3d.js:120` e `:273`: a face da água é parede para o olho, + 25–30 cm): não há vista submersa a fazer; com ondas de volume, a margem tem de usar a mesma onda (`waveY`).
- **O sombreador** (`MAT.water`, `MeshPhongMaterial` + `onBeforeCompile`, `realm3d.js:661–777`), já bem pensado:
  - vértice: três senos (ondulação de ~0,2 m, mais com o vento, quase nada junto à terra e em água rasa — `uBed`);
  - fragmento: **quatro trens de ondas somados** (Gerstner só na normal, comprimentos 11 m → 3,5 m, com o vento; nos rios o rumo vem da **textura de corrente** `uFlow`), quatro leituras da textura de grão (`uDet`, a do chão, 256², feita em JS) para as marolas, sumindo de longe (22–130 m);
  - **profundidade de verdade em cada ponto**: textura do leito (`bedTick`, meia casa por texel, Half Float, refeita por `S.typeVer`) → cor do corpo (verde-claro na areia, azul, escuro no fundo: `exp(-wD·0,32)`), transparência (`1-exp(-wD·0,9)`);
  - **Fresnel** (Schlick) com o céu refletido: só **a cor do céu** (`gxHaze` + `uSkyTop`), **sem as nuvens do domo, sem morro, árvore, casa** — nada da cena aparece na água;
  - brilho do sol/lua (`pow 900` e `pow 90`), crista iluminada por dentro, as **chamas da noite refletidas** pela pintura de luz (`gxLM`, dois passos de raio);
  - **espuma**: renda na linha d'água (onde o leito sobe), arrebentação em faixas que correm para a praia (`bdep` de 0,42 a 0,06 m), carneirinhos com vento forte; um pouco nas margens dos rios; nenhuma espuma ligada à corrente, às pedras ou à queda.
  - Qualidade Leve: `WCHEAP` (só as ondas longas, sem marolas nem renda, sem o reflexo das chamas).
- **O chão debaixo d'água** (`ground3d.js:577–600`): cáusticas (`gCaus`) no leito, o azul por cima do fundo, a areia molhada que escurece e brilha, o vai-e-vem da onda na praia (`lap`), a linha de algas da maré alta. O leito do rio é cavado pelo 3D (`G.Space.bedDrop`: canela num vau, 1,75 m onde o mundo diz fundo).
- **A corrente** (`flowTick`, `realm3d.js:895`): textura RGBA N × N, rumo da casa vizinha de água mais baixa, alisado em 4 rodadas, refeito por `S.typeVer` e a cada 6 s. Leva as ondas e as marolas rio abaixo — mas falha em 10–50 % das casas (ver acima).
- **A névoa**: uma névoa de altura global (`gxAir`: base no nível do mar, mais grossa de madrugada e na chuva) e o «haze» da distância (`gxHaze`). Não há névoa local (cachoeira, lago de montanha, vale).
- **A chuva** (`fx3d.js:437`): 1.600 riscos em volta do olho (neve em pontos no frio), inclinados pelo vento, quantos `max(w.rain, rainAt)` pedem; respingos no chão e anéis na água (`ripple`), mais o céu cinza, a névoa e a exposição. **Não molha nada**: sem chão escuro/brilhante, sem poça, sem escorrer de telhado nem enxurrada. Raio: só o clarão da vista do deus (`sky.js`) e o som.
- **Os respingos e anéis**: pés na água (`feet`), o nadador (anéis, braçadas, rastro de espuma, bolhas ao afogar), a chuva na água; os navios (`fx3d.js:458`, casco do Blender instanciado, balanço e arfagem) **não deixam esteira nem onda de proa**.
- **O nado no 3D**: o corpo boia no nível plano (`waterAt`), as pessoas a `waterH − 0,32 m` (`people3d.js:1757`), os bichos em `groundH`. Qualquer onda maior no desenho que não seja a do mundo descola os nadadores e os navios da água desenhada.
- **Quanto custa** (pelo código): 2 triângulos por casa de água (um mundo de 192² tem ~24 mil casas de mar → ~48 mil triângulos se tudo estivesse à vista; na prática, um pedaço perto + os de longe). O custo é **de pixel**: o mar enche metade da tela, e cada pixel faz 4 trens de onda, 12 leituras de textura (leito ×3, corrente, grão ×4 das marolas, espuma ×3, a borda que vagueia) e, à noite, mais 3 no laço das chamas. Uma chamada de desenho por pedaço com água (perto e longe).
- **Os níveis de qualidade** (`QUAL`, `realm3d.js:40`): baixa (Leve), media, alta, ultra; a água só distingue Leve (`WCHEAP`) das outras. O pós-processamento (`post3d.js`) tem a imagem da cena com profundidade (`rtS.depthTexture`) só quando há SAO/bloom/raios (Alta, Ultra) — mas a água é desenhada **na mesma passada** que o resto (transparente, sem escrever profundidade), então não pode ler o que está atrás dela (sem refração, sem SSR).
- **A pele nas regras**: os arquivos do 3D estão na lista do «só se vê» do `qa/guard.js:29`; a altura do tabuleiro das pontes é do `G.Space.deckAt` (regra 64); o orçamento da Bíblia (`arte/BIBLIA.md` §5): cena média ≤ 500 mil triângulos e ≤ 200 chamadas, a Alta pode dobrar triângulos; uma geometria por material por pedaço; a pilha de texturas ≤ 6 MiB (sobra 0,8 MiB).

### A vista do deus (`js/render.js`, `js/sea.js`)
- O mar é **pintado no cache dos pedaços**: o fundo (areia com marcas de onda, pedra com alga, pradaria, corais coloridos, kelp) visto através do «vidro» (`seaGlass`, a cor da água de `Sea.look` por profundidade) e o oceano de fora (`drawOcean`).
- Rios e lagos: cor plana (os lagos mais fundos no meio), **degraus de água** (`waterSteps`: lábio claro nos degraus pequenos, lâmina em degradê com espuma nos grandes), **correntes animadas** (riscos claros descendo pela casa vizinha mais baixa — o mesmo problema de planície: sem descida, sem risco), **cachoeiras** voltadas para a câmera (6 fios tracejados que correm + o poço fervendo) e **borrifo** subindo delas (partículas `G.FX`).
- Espuma da praia (duas linhas que respiram), **a maré** (`Sea.drawTide`: a faixa que descobre e cobre a areia), os brilhos (`sparkles`), a bioluminescência das noites quentes (`Sea.glowing`), peixes saltando.
- Chuva: riscos na tela, o chão molhado mais escuro (`S.wet`), arco-íris depois da chuva e relâmpago no céu (`sky.js`), sombras das nuvens.

#### Como são as cachoeiras que o mundo faz (`agua-scripts/quedas.js`)
As oito maiores de cada mundo (mundial pronto; gerado 4242 montanhoso e alpino), todas iguais no feitio:
- **largura de uma casa só (4 m) no topo** — são torrentes de montanha (`hydro`, «mountain torrents»), nunca um rio largo;
- **as grandes são escadas**: 21 m em 8 saltos, 32 m em 8, 28 m em 7 (o passo `Q` do `hydro` quantiza a descida em degraus de 2,5–5 m; quedas a até duas casas viram uma só, `tot`/`steps`). Uma queda única alta, como a da foto, não sai do gerador;
- **o poço embaixo é raso e estreito** (1–3 casas no mesmo nível, nunca `deep`, nunca lago);
- em volta, muito paredão e encosta íngreme (9–34 casas de paredão em 7 × 7), **quase nenhuma árvore**, e **sempre nos biomas frios** (neve, taiga, temperado). Nenhuma no trópico.
- Mundos prontos «cidade» e «metrópole» não têm queda que mereça o nome.

Conclusão: **a cachoeira de documentário (alta, um véu só, num paredão, com poço largo e mata em volta) é antes de tudo uma questão do relevo (o mundo)**; o pilar da água desenha bem a que existe (a escada de saltos) e combina com o relevo um tipo novo de queda.
- **Largura dos rios** (`agua-scripts/largura.js`, na perpendicular do `down[]`): metade das casas de rio é de um canal de **uma casa (4 m)**, ~22 % de duas, 8 % de três, 14–21 % de quatro ou mais (os trechos largos são quase sempre perto da foz). A bacia maior drena 2–3 mil casas. Não há «grande rio» de 30–60 m; a correnteza visível vai ser sobretudo de riachos e torrentes.

## 2. Os limites diante do pedido

| O dono pediu | Hoje | O que falta e de quem é |
|---|---|---|
| **Cachoeiras espetaculares** | O mundo tem quedas (`S.relief.falls`, com nome), mas **o 3D não desenha nenhuma**: a lâmina de cima acaba no ar, um degrau de 1 a 5 m até a de baixo, e entre elas o barranco. Na vista do deus, 6 fios tracejados e um borrifo. E as quedas do gerador são torrentes de 4 m de largura, em escada, sem poço, em montanha fria e sem mata | Desenhar a lâmina, a espuma no pé, a névoa e o borrifo (**só de se ver**); a cachoeira alta de um véu só, com poço largo e mata em volta, tem de nascer no relevo (**do mundo**, com o pilar do relevo) |
| **Rios com correnteza** | As ondas e marolas descem o rio onde há descida; **10–50 % das casas de rio ficam sem corrente** (planície, trechos de nível igual, rio no nível do mar). Nenhuma espuma de corredeira, nenhum redemoinho atrás de pedra, nenhuma folha levada | Um campo de corrente derivado e completo (rumo **e velocidade**, pela foz e pela descida) — derivado do que o save tem; fluxo nas normais e na espuma (**só de se ver**) |
| **Lagos** | Lago = rio parado (`aShore` não marca; o `Waters.kind` lê 13 de 25 vizinhos); ondas do vento, mais calmas; cor por profundidade | Espelho de verdade (o lago calmo reflete o morro e a mata), névoa da manhã, juncos na margem (vegetação) |
| **Oceano e ondas** | Quatro trens de ondas na normal, o vértice mexe 0,2 m numa malha de 4 m (não se vê volume), a arrebentação é uma faixa de espuma que corre; nada de onda que se ergue e quebra; a maré só na vista do deus | Ondas com volume perto do olho (malha fina perto da câmera), a crista que empina e quebra paralela à praia (pela profundidade e pelo rumo da costa), a maré mexendo a linha d'água no 3D |
| **Espuma** | Linha da praia, arrebentação, carneirinhos, um pouco na margem dos rios | Espuma levada pela corrente, no pé das quedas e corredeiras, em volta das pedras e dos pilares de ponte, esteira dos navios |
| **Reflexos** | Só a cor do céu (sem nuvens), o sol, a lua e as chamas da noite | As nuvens do céu (barato, já) e, nas qualidades altas, **a cena** — morro, mata, casa — por reflexo em espaço de tela (SSR) e, na Ultra, plano do mar |
| **Névoa da queda d'água** | Nenhuma (a névoa é uma só no mapa todo, presa ao nível do mar) | Partículas de borrifo e névoa local (um mapa de névoa por lugar, combinado com o céu), arco-íris no borrifo com o sol atrás do olho |
| **Chuva que molha e escorre** | Riscos em volta do olho, respingos e anéis; o mundo tem `S.wet` por casa — **o 3D não o lê** | Chão, pedra, telhado e tronco escuros e brilhantes pelo `S.wet`; poças nas baixadas; fios d'água nas encostas e pingos dos beirais; o rio turvo e espumoso depois da chuva |
| **Água contra o terreno** | Leito cavado, areia molhada, cáusticas, linha da maré, algas | Espuma nas pedras e margens pela corrente, rocha molhada no borrifo, lama na margem pisada, o gelo de inverno com cachoeira congelada |
| **Profundidade/refração** | Profundidade pelo leito (textura), cor e transparência por ela; sem distorção | Refração do fundo (com a cena copiada antes da água) nas qualidades altas |

## 3. A proposta de arquitetura para o pilar

### 3.1 A espinha: uma fonte só da água — `G.Agua` (`js/agua.js`, novo, puro)
Como o `G.Space` e o `G.Atmos`: **só lê o mundo, não escreve, não sorteia** (nem `G.R`, nem `G.VR`), refeito quando o chão muda (`S.typeVer`) e zerado num `G.worldHooks`. Não vai no save (é derivado de `S.type`, `S.wl`, `S.H`, `S.relief`, `G.Sea`). O 3D, a vista do deus, o som e (se se quiser) o corpo perguntam a ele:
- `Agua.flow(i)` → rumo (x, z) e **velocidade** de cada casa de rio: pela descida (`wl`) onde ela existe e, onde não, pela distância à foz (Dijkstra a partir do mar subindo o rio sem descer de nível) e, para os rios que acabam num lago sem saída, ao lago (o protótipo `fluxo2.js`: corrente em 90–99 % das casas, contra 50–90 % hoje). A velocidade sai do declive do curso e da **vazão** (quantas casas de rio drenam por ali — a mesma árvore da Dijkstra), com teto; lago e tanque, parados.
- `Agua.steps()` → todo degrau entre duas casas de água vizinhas: a borda partilhada, o nível de cima e de baixo, a vazão, se é queda do mundo (`S.relief.falls`, com nome) ou corredeira (degrau de 5 cm a 1,2 m). Fora as bordas com ponte (`S.road`), prédio ou gelo (o gelo vira «cachoeira congelada»).
- `Agua.shore(x, y)` → a distância à terra e **o rumo da costa** (do `Sea.dl` e do leito alisados): as ondas chegam paralelas à praia, a arrebentação empina pela profundidade.
- `Agua.wet(i)` → o quanto a casa está molhada agora (o `S.wet` do mundo e a chuva que cai: `weather.rain`, `Nature.rainAt`), e `Agua.puddle(x, y)` → o lugar das poças (baixadas e chão plano, pela curvatura do `S.H` e pelo `G.hash`: sempre as mesmas poças).
- `Agua.waveY(X, Z, t)` → **a altura da onda desenhada**, a mesma conta do sombreador (um gêmeo em JS das constantes do GLSL): é por ela que o desenho põe na onda os navios, os nadadores e o que boia — o mundo continua no nível plano (`W.waterH`).

### 3.2 O que é do mundo (protocolo inteiro: invariante, cenário, regra do guard, AUDIT)
1. **O sentido da corrente** — *não precisa mudar o mundo*: o `G.Agua.flow` deriva do save de hoje. Guardar o `down[]` do `hydro` (um campo novo no save) não vale a pena: quebra os saves velhos, e o milagre de afundar/erguer já muda os rios sem refazer o `hydro`.
2. **Onde há queda** — já existe (`S.relief.falls`, no save). **A cachoeira de documentário é um pedido ao relevo**: um tipo novo de queda no gerador — um rio de vazão grande (não a torrente de 4 m) que atravessa uma escarpa (borda de planalto ou mesa, paredão de basalto), **um salto só** (sem a quantização em degraus do `hydro`, só nessa queda), com **poço fundo e largo** embaixo (um lago pequeno ao pé, `S.deep`), também nos biomas quentes. Mudança do mundo: os mundos prontos gerados de novo, `qa/mundos.js`, e o `conta-agua.js` virado prova.
3. **A chuva que o mundo já tem** — `S.weather` (chuva geral só na tempestade + as nuvens locais), `S.wet` por casa, o vento. Nada a mudar: o 3D passa a ler o `S.wet` (hoje só o fogo, as plantas e a vista do deus leem).
4. **A maré** — já é do mundo (`G.Sea.tide/shift`, puras do relógio). No 3D, só a linha do vai-e-vem e a areia molhada sobem e descem 1–2 m na praia; o mar fica em `G.SEA`, onde os pés o sentem: honesto com o mundo e sem mexer no nado.
5. **(Opcional, fase 2) A corrente empurra o corpo** — o nadador e quem vadeia derivam rio abaixo pelo `G.Agua.flow`. É regra do corpo (`avatar.js` `swim`/`wade`): `qa/movimento.js`, encarna e14, invariante no `movimento-inv.js`, e a mesma regra para as pessoas do mundo que nadarem em rio (D-015: o mesmo mundo para os dois).

### 3.3 O que é só de se ver (`js/agua3d.js`, novo, na lista do «só se vê»; a água do `realm3d.js` passa para ele)
1. **O material da água refeito em camadas** (o de hoje é a base: profundidade pelo leito, Fresnel, sol, chamas):
   - **corrente no sombreador**: uma textura de fluxo (rumo + velocidade + vazão, do `G.Agua.flow`, por casa, filtrada) e o *flow map* de duas fases (duas leituras deslocadas pela corrente, misturadas meio ciclo fora de fase — a água corre sem esticar); marolas e espuma levadas;
   - **espuma por causa**: (a) a da praia e da arrebentação (existe); (b) a da corredeira e do pé da queda — um mapa de espuma por casa feito do `G.Agua.steps()` (forte no pé, morrendo rio abaixo pela corrente); (c) a das margens e das pedras — onde a corrente bate na terra rasa (o leito) e nas pedras do rio (`S.rocks` ao lado da água); (d) a esteira e a proa dos navios (no `fx3d`, pela velocidade do `svis`);
   - **ondas do mar com volume perto do olho**: uma malha fina só perto da câmera (grade radial de 1 a 3 m, até ~150 m, presa ao olho e cortada onde há terra; o resto continua um quadrado por casa), Gerstner no vértice pelo `G.Agua.waveY`; **a onda que quebra**: perto da praia a onda encurta, empina e tomba pela profundidade (o leito) e pelo rumo da costa (`G.Agua.shore`), com espuma na crista e o lençol que sobe a areia (o `lap` do `ground3d.js` passa a seguir a mesma onda e a maré);
   - **cor pelo lugar**: turquesa sobre areia no mar quente, verde-azul no temperado, leitoso nos rios de geleira (frio + altitude), barrento nos rios de planície e no pântano, e **turvo depois da chuva** (a causa é o `S.wet` rio acima);
   - **reflexos em degraus** (3.5): as nuvens do domo sempre; a cena em espaço de tela nas altas; o plano do mar na Ultra.
2. **A cachoeira e a corredeira desenhadas** (uma geometria nova por pedaço, na parte «ground», material `fall`): para cada degrau do `G.Agua.steps()` perto do corpo, uma **lâmina** que sai do lábio da casa de cima em arco (a velocidade de saída pela corrente de cima, parábola até o nível de baixo), da largura da borda; nas quedas em escada, uma lâmina por salto, encadeadas; um sombreador que corre para baixo (estrias, transparência nas bordas, branco aerado na queda grande, o sol atravessando), a **espuma fervendo no pé** (disco animado), o **borrifo e a névoa** (partículas do `fx3d` num lote próprio — o lote de 1.600 é dividido com a fumaça e as folhas), a **rocha molhada** em volta (um mapa do borrifo no `ground3d.js`), o **arco-íris no borrifo** quando o sol está atrás do olho. Na corredeira (degrau pequeno), uma rampa curta de água branca. No Inverno Súbito, a lâmina vira gelo (pingentes).
3. **A névoa por lugar** (com o pilar do céu): um mapa de névoa em volta do corpo (como o `gxLM` da luz das chamas) com as fontes: a queda (forte, perto), o lago e o rio na madrugada fria, a mata úmida (vegetação), o vale. O céu é dono da névoa; a água dá as fontes.
4. **A chuva que molha** (o céu é dono da chuva que cai, do raio e da nuvem): um mapa de molhado (`S.wet` + chuva agora, por casa) lido pelo chão (`ground3d.js`), pelas paredes e telhados (`build3d.js`), pelos troncos e pedras (a flora) — escurece e dá brilho de céu; **poças** nos lugares do `G.Agua.puddle` (anéis da chuva, reflexo do céu, secando com o `S.wet`); **fios d'água** escorrendo nas encostas e rochas íngremes (estrias no sombreador do chão); **pingos dos beirais** (o `build3d.js` sabe onde estão os beirais); o rio com mais espuma e turvo.
5. **A água e o terreno**: espuma e anel em volta das pedras do rio e dos pilares das pontes (sem sair da casa da ponte: D-190), lama na margem pisada (o `S.wear` ao lado da água), folhas boiando levadas pela corrente (as que o `fx3d` já faz cair, quando caem na água).
6. **O nadador, o navio e o bicho na onda**: o desenho deles soma o `G.Agua.waveY` (só no que se vê: o lugar do mundo não muda; para o corpo, pelo `Avatar.present`, como o `b.yOff` do degrau).

### 3.4 A vista do deus
- As correntes (`drawCurrents`) e as cachoeiras pelo `G.Agua` (os rios de planície ganham corrente; a espuma do pé pela vazão; corredeira branca nos degraus pequenos).
- Poças brilhando onde o `S.wet` é alto (o chão já escurece), o rio turvo depois da chuva, a névoa da queda como um borrifo maior, a esteira dos navios, a arrebentação em linhas paralelas à costa pelo `G.Agua.shore`.
- A cachoeira alta do relevo novo com a sua figura (o véu de frente, o poço com espuma, o arco-íris de manhã).

### 3.5 Os níveis de detalhe e o orçamento por qualidade
O custo da água é de **pixel**, não de triângulo (2 triângulos por casa; o mar enche meia tela). A regra: cada qualidade paga o que a máquina dela aguenta, e a Leve não fica mais cara.

| | Leve (`baixa`) | Média | Alta | Ultra |
|---|---|---|---|---|
| corrente (flow map) | 1 fase, sem marola | 2 fases | 2 fases | 2 fases |
| espuma (praia, queda, margem, pedra) | praia + pé da queda | todas | todas | todas + esteira fina |
| ondas do mar | só na normal (hoje) | normal + vértice na malha de 4 m | malha fina perto (2 m), quebra na praia | malha de 1 m, quebra na praia |
| cachoeira | lâmina simples, sem névoa | lâmina + espuma + borrifo (poucas partículas) | + névoa por lugar, rocha molhada | + arco-íris, mais partículas |
| reflexo | cor do céu (hoje) | céu **com nuvens** | + cena em espaço de tela (SSR, meia resolução) + refração | + plano do mar perto do olho (meia resolução, sem capim nem gente) |
| chuva que molha | — | chão e telhado escuros e brilhantes | + poças com anéis, fios nas encostas | + pingos dos beirais |

- **SSR e refração pedem dividir o quadro**: hoje a água é desenhada na mesma passada que o resto (transparente, sem profundidade). Para ler o que está atrás e em volta: desenhar os opacos, **copiar a cor e a profundidade** (o `post3d.js` já tem a imagem da cena com `depthTexture` na Alta/Ultra) e só então a água. Custo: uma cópia (e a resolução do MSAA) por quadro, mais o sombreador mais caro; só na Alta e na Ultra.
- **O plano do mar** (Ultra): a cena desenhada de novo, espelhada no nível do mar, em meia resolução e só com o chão, as casas e as árvores grandes — dobra parte das chamadas de desenho (a Bíblia: ≤ 200 na Média; a Alta pode dobrar triângulos): por isso só na Ultra, e medido.
- Na Bíblia: uma geometria por material por pedaço — a lâmina das quedas é **um material novo** (uma chamada a mais por pedaço com queda; poucos têm); as texturas da água (normal, espuma) feitas em JS como o grão do chão (`makeDetail`), **fora da pilha de 6 MiB**.

## 4. Os riscos

- **O corpo nadando.** O nado lê a água plana do mundo (`Avatar.waterAt` = `W.waterH·HM`, por casa); as pessoas a `waterH − 0,32 m`, os bichos e os navios no nível. Onda desenhada maior que ~15 cm perto do corpo descola o nadador da água que se vê (a cabeça debaixo da crista, ou o corpo flutuando no vale). Saída: o desenho dos que boiam soma o mesmo `G.Agua.waveY` do sombreador (só no que se vê, pelo `Avatar.present` / o `Yf` do `people3d.js` / o `wy` dos navios), e a onda grande morre perto da margem e em água rasa, onde se anda (o que o vértice já faz: `smoothstep(0.05, 0.9, dep)`). O degrau de nível entre duas casas (a lâmina nova da queda) não muda o nado: quem nada passa do lábio e cai, como hoje. As provas: encarna e14 (o corpo na água, o fôlego, o afogar, o save), e9 (a terra que afunda), `qa/movimento.js` se a corrente empurrar.
- **As pontes** (`qa/visual/pontes.js`, D-190, regra 64). A ponte é a rua sobre uma casa de rio; o tabuleiro é o dos pés (`deckAt`, 12 cm sobre a água). A lâmina de queda e a espuma em volta dos pilares **não podem atravessar a borda de uma casa de ponte nem passar para o prédio vizinho** (p5), nem ficar sobre o caminho (p3); a malha fina das ondas do mar não pode subir acima do tabuleiro (ondas de mais de 12 cm debaixo da ponte furariam o tabuleiro — a onda morre em água rasa e a ponte é sobre rio, mas o canal do porto pode ser mar raso: conferir). Rodar `node qa/visual/pontes.js` a cada mudança na água perto das pontes.
- **Os navios.** Andam em `G.SEA` com balanço próprio (`fx3d.js:465`); com ondas de volume eles precisam do `G.Agua.waveY` (arfagem e rolagem pela inclinação da onda) e da esteira; o cais (`harbor.js`) e o casco que encosta na praia continuam onde o mundo diz.
- **A beira d'água que já foi consertada.** A linha d'água sai do encontro com o chão (`seaReaches`, `bankLevel`, a borda que «vagueia meio metro» do sombreador): as verificações `R3.waterCheck` (água sobre terra seca, água de rio sob prédio ou estrada) e `R3.bedCheck` (o leito que a água lê contra a altura do chão) **existem no `realm3d.js` mas nenhuma prova as chama** — transformá-las em invariante antes de mexer (ver 6).
- **O chão debaixo d'água é cavado pelo 3D** (`G.Space.bedDrop`) e é o mesmo para os pés, para a malha do chão e para a textura do leito: a cor pela profundidade, a espuma da margem e o fundo da cachoeira têm de ler o mesmo leito (o `uBed`), nunca outra conta.
- **Desempenho.** A água custa por pixel: com SSR, refração, malha fina e duas fases de fluxo, a Média por software (o teste de todo dia) pode ficar bem mais cara — por isso a tabela de 3.5 e a medida de antes/depois em vistas fixas (a minha, de hoje, está na seção 7). O lote de partículas (1.600, partilhado com a fumaça, as folhas, a poeira) não aguenta a névoa de uma queda grande: lote próprio com teto por qualidade. A cópia da cena para o SSR é uma passada inteira a mais; o plano do mar dobra chamadas.
- **«O 3D só desenha».** Tudo do `agua3d.js` no `LOOK` do `guard.js` (o `guarda3d.js` acusa arquivo novo do 3D fora da lista); nada de `G.R`; as partículas pelo `G.VR`; a espuma, a posição das poças e os enfeites pelo `G.hash`. O `G.Agua` é do lado do mundo mas puro: uma regra no guard como a do `space.js` (regra 23) — só lê, não sorteia.
- **O deus muda a água.** Afundar/erguer terra (`miracles.js` → `Rf.fixArea`), o Inverno Súbito (`S.ice`), o mar aberto (`S.dry` + as paredes de água), o fogo apagado pela chuva: os campos do `G.Agua` e as lâminas refeitos pelo `S.typeVer` (o `sigOf` dos pedaços já soma o `wl` e o gelo), o gelo sem corrente e com queda congelada, o mar aberto sem onda dentro do leito seco.
- **Saves velhos e mundos prontos.** Nada do só de se ver toca o save. A cachoeira grande do relevo muda a geração: todos os mundos prontos gerados de novo pelo salto do jogo (`qa/prontos.js`), `qa/mundos.js`, `qa/oldsave.js`.
- **Os outros pilares mexendo no mesmo sombreador.** O material da água lê o céu (`gxHaze`, `skyU`, a névoa `gxAir`) e o chão (`uBed`, `uDet`): se o pilar do céu trocar a névoa ou o domo, a água tem de chamar a mesma função (um pedaço de GLSL partilhado), nunca uma cópia.

## 5. Os arquivos de um executor deste pilar, e onde ele topa com os outros

| Arquivo | O que muda | Toca em quem |
|---|---|---|
| `js/agua.js` (novo, lado do mundo, puro) | `G.Agua`: corrente, vazão, degraus, costa, molhado, poças, `waveY` | lido pelo 3D, pela vista do deus, pelo som e (fase 2) pelo corpo |
| `js/agua3d.js` (novo, só se vê) | o material da água (tirado do `realm3d.js`), a lâmina das quedas, as texturas de fluxo e espuma, o gancho do reflexo | **céu** (o reflexo do domo e das nuvens, o sol, a névoa) |
| `js/realm3d.js` | `waterGeo` delega; a lâmina na parte «ground» dos pedaços; a malha fina do mar perto do olho; o `flowTick`/`bedTick` passam para o `agua3d.js` | **relevo** (o chão, a rocha atrás da queda), **céu** (`light()`, `skyU`, `GX`) |
| `js/fx3d.js` | borrifo e névoa das quedas (lote próprio), esteira e proa, pingos dos beirais, anéis nas poças, folhas boiando | **céu** (a chuva que cai, o raio), **vegetação** (as folhas que caem) |
| `js/ground3d.js` | o chão molhado pelo `S.wet`, poças, fios d'água nas encostas, a rocha molhada do borrifo, o vai-e-vem com a maré | **relevo** (o material da rocha, as falésias, o cânion), **vegetação** (a margem) |
| `js/build3d.js` | paredes e telhados molhados; os beirais que pingam | (os prédios: A2) |
| `js/post3d.js` | a cópia da cena antes da água (Alta/Ultra), o SSR e a refração | **céu** (os raios de sol, o bloom do brilho na água) |
| `js/render.js`, `js/sea.js` | a vista do deus pelo `G.Agua` (correntes, espuma, poças, a queda alta) | **relevo** (a figura da queda nova) |
| `js/audio-src.js` | a corredeira e a queda pela vazão (hoje só `falls` por distância) | (o som: regra 53, todo som tem dono) |
| `js/relief.js` (com o pilar do relevo) | a queda alta de um salto, o poço fundo, o rio largo na escarpa | **relevo** é o dono |
| `js/avatar.js` (fase 2) | a corrente no nado e no vau | (o controle do corpo) |
| `qa/guard.js` | `agua3d.js` no `LOOK`; regra do `G.Agua` puro; regra do gêmeo JS/GLSL da onda | |
| `index.html` | os dois arquivos na ordem (`agua.js` depois do `sea.js`; `agua3d.js` antes do `realm3d.js`) | |

Onde os pilares se encontram:
- **Relevo**: a cachoeira precisa de queda — sem a escarpa e o poço do gerador, a lâmina mais bonita é a de uma escada de torrentes de 4 m; a rocha atrás da queda (basalto molhado, musgo) é o material de rocha do relevo; a praia, a falésia e a gruta do mar (`Sea.stacks`, `Sea.grottos`) são do relevo, a espuma nelas é da água.
- **Vegetação**: a mata em volta da cachoeira e da margem (samambaia no borrifo, junco no lago, mangue na foz quente), as folhas na água, a planta que se curva com a chuva; o reflexo da mata no lago só aparece com o SSR (Alta/Ultra).
- **Céu e luz**: o reflexo (o domo, as nuvens, o sol e a lua, a cor da hora), a névoa (o céu é o dono; a água dá as fontes por lugar), a chuva que cai e o raio (o céu) contra a chuva que molha e escorre (a água), o arco-íris no borrifo (a direção do sol), o brilho do relâmpago na água.

## 6. As provas que o pilar precisaria

- **`qa/agua.js`** (Node, segundos; um cenário do protocolo):
  - a1 **a corrente**: em mundos gerados de cada relevo (o `hydro` interceptado, como o `fluxo.js`), toda casa de rio com caminho à foz ou a um lago tem rumo; ≥ 95 % de acordo com o `down[]` verdadeiro; lago e tanque parados; a mesma corrente num save carregado e no mundo vivo;
  - a2 **puro**: calcular a corrente, os degraus, a costa, as poças e as lâminas não muda o save (a string igual antes e depois), não tira do `G.R` (`qa/rngtrace.js`), e um mundo novo / um load zeram os caches;
  - a3 **as lâminas**: todo degrau ≥ 5 cm entre casas de água perto do corpo tem a sua lâmina (as quedas com nome sempre); a lâmina fica na borda das duas casas, de cima no `wl` de cima e embaixo no de baixo (± 5 cm), nunca atravessa casa de ponte, prédio ou gelo; mesma geometria duas vezes (os dois acasos mexidos no meio);
  - a4 **os casos ruins**: o deus afunda e ergue a terra no meio de um rio com queda (a lâmina e a corrente seguem), o Inverno Súbito (sem corrente, queda congelada), o mar aberto (sem onda no leito seco), save/load no meio, a ponte nova sobre um degrau;
  - a5 **o que boia**: o nadador, as pessoas que nadam, os navios desenhados a ± 5 cm da água desenhada (`G.Agua.waveY`) e o lugar do mundo igual (`W.waterH`);
  - a6 **a chuva que molha**: o mapa de molhado segue o `S.wet` (molha sob a nuvem, seca em dias), poças só onde o `G.Agua.puddle` as põe, nada molhado dentro de casa.
- **Invariantes** (`qa/qa.js` ou um `qa/agua-inv.js` com o `junta-inv.js`): «a água desenhada bate com o mundo» — o `R3.waterCheck` e o `R3.bedCheck` (hoje sem prova) a cada vista do 3D nas provas do navegador (encarna e11); «toda queda do mundo perto do corpo tem a sua lâmina»; «nenhuma lâmina sobre ponte, prédio ou estrada».
- **`qa/guard.js`**: o `agua3d.js` no `LOOK`; o `G.Agua` só lê e não sorteia; a onda numa fonte só (o gêmeo JS do GLSL com as mesmas constantes, ou o GLSL feito a partir delas).
- **No navegador** (pela fila): `qa/visual/agua-fotos.js` (vistas fixas por semente: rio, lago, praia, praia ao entardecer, cachoeira de perto e do alto, rio na chuva, noite com tochas no cais — o roteiro deste estudo, `agua-scripts/fotos-agua.js`, serve de base), antes/depois para o dono; `qa/visual/agua-mede.js`: o quadro com e sem a água em cada qualidade (como a medida da seção 7) e as chamadas/triângulos contra a Bíblia.
- **As de sempre que a água toca**: `node qa/visual/pontes.js`, `node qa/visual/guarda3d.js .`, a e11 e a e14 do `qa/encarna.js`, `qa/visual/mar-estudio.js` (os bichos do mar na superfície), `qa/movimento.js` (se a corrente empurrar), `qa/meio.js` (os bebedouros, se a água doce mudar), `qa/som.js` (a corredeira com dono), e a regressão inteira antes da versão.

## 7. As fotos de hoje e a medida

**Como medi.**
- Pelo código: a leitura do `realm3d.js` (a malha, o sombreador, a corrente, o leito), do `fx3d.js`, do `ground3d.js`, do `render.js`/`sea.js` (a vista do deus), do `relief.js` (`hydro`), do `nature.js` (o tempo), do `avatar.js` (o nado).
- Em Node, sem navegador (`qa/nodemundo.js`): `agua-scripts/conta-agua.js` (a água de cada mundo), `fluxo.js` e `fluxo2.js` (a corrente do 3D contra o `down[]` verdadeiro do `hydro`, interceptado num mundo novo; o protótipo «pela foz»), `quedas.js` (as maiores quedas de perto), `largura.js` (a largura dos rios). Mundos: os prontos (cidade, metrópole, mega, mundial) e o continente 192 da semente 4242 (e 77) em cada relevo.
- No navegador (planejado), uma rodada curta pela fila (`bash qa/navegador.sh node agua-scripts/fotos-agua.js . agua-fotos`), a mesma receita do `qa/visual/natureza.js` (o aquecimento sem desenhar, três quadros desenhados de verdade), qualidade Média, 1000 × 620, no continente 192 da semente 4242, relevo montanhoso: o rio, o lago maior, a praia, a maior cachoeira (Véu da Brisa, 21 m em 8 saltos) de perto e do alto, o rio na chuva. Em cada vista: as chamadas, os triângulos, as malhas e os triângulos de água desenhados, e o tempo do quadro **com e sem o material da água** (o 3D por software — SwiftShader —: vale como proporção, não como tempo de placa de vídeo; a máquina estava dividida com outras provas).

**O que aconteceu com as fotos.** A rodada ficou **uma hora na fila do navegador sem vaga** (as duas vagas tomadas por provas longas de outras partes — `prontos.js`, `encarna.js`, as fotos do relevo e da vegetação — e uns dez à espera; a máquina com carga 17–20 em 4 núcleos) e foi parada pelo limite de tempo sem tirar nenhuma foto. **Não há fotos de hoje deste pilar.** O roteiro está pronto e testado contra as funções do jogo (as mesmas do `qa/visual/natureza.js`); com a máquina livre, ≈ 10–15 min:

```
cd god-of-the-ant-farm
bash qa/navegador.sh node /tmp/claude-0/-home-user-promptzada-de-adulto-do-dr-s-ntese/474a40dc-2376-5786-aa24-770c3a52b5eb/scratchpad/natureza/agua-scripts/fotos-agua.js . /tmp/claude-0/-home-user-promptzada-de-adulto-do-dr-s-ntese/474a40dc-2376-5786-aa24-770c3a52b5eb/scratchpad/natureza/agua-fotos
```

Ele grava `rio.png`, `lago.png`, `praia.png`, `cachoeira.png` (de perto, do lado do poço), `cachoeira-alto.png` (do alto, 14 m), `rio-chuva.png` e `fotos-agua.txt` (chamadas, triângulos, malhas e triângulos de água, o quadro com e sem a água, partículas e gotas). O que se espera ver, pelo código: na cachoeira, **duas lâminas planas com uma rampa de leito entre elas** (os cantos da borda partilhada ficam no nível de cima — `Rf.normalize` põe na face da água o canto que toca terra —, e a casa de baixo mostra o chão subindo de dentro da água até o lábio), sem água caindo; no rio de planície, as marolas indo com o vento, não com o rio; o mar e o lago da mesma cor turquesa; o reflexo sem nuvens.
