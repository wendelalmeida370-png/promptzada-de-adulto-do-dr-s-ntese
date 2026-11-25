# Os interiores 3 — o contrato da onda A: o palácio e a casa rica (com a Fase 2)

*Rascunho do supervisor, escrito enquanto as fundações (a Fase 0 e a Fase 1, [`interiores-3-contrato.md`](interiores-3-contrato.md))
andam. As portas das fundações (o kit, os postos, a decoração por uso, os pacotes, a barra do lugar, a demora, a porta, o assento)
entram aqui pelos nomes daquele contrato; o supervisor acerta este texto quando elas forem juntadas, antes de abrir as frentes.*

O alvo é a ficha da onda A no plano ([`interiores-3.md`](interiores-3.md) §8, «Onda A — o palácio e a casa rica»), com o que os
levantamentos dizem de cada degrau e de cada povo (`planos/levantamentos/`: o B §3, o D, a parte do poder). **Leia antes de começar:** o
`CLAUDE.md` da raiz inteiro; a ficha inteira; o contrato das fundações; e o levantamento da sua parte.

**O pedido do dono** (24/11/2026): «o palácio é muito importante, ele tem que ser majestoso por dentro, tem que ser lindo, tem que ser
incrível, perfeito, bonito esteticamente, artístico»; «no palácio não vive só o governante, vivem outros burocratas»; a reunião com os
aristocratas na mesa gigante; o banquete. E o padrão: **a taverna de hoje é o mínimo** — o palácio tem de ficar acima dela em cada
critério da prova padrão (`qa/padrao.js`), e cada degrau maior mais majestoso pelo uso, não pelo vazio.
**Nada vem do nada** (o lembrete do dono, 24/11/2026): o ouro do trono, as moedas do tesouro, a comida do banquete, as armas do armeiro,
as tapeçarias, o material de escrever — cada um só onde o povo o tem, pelo livro e pela origem; e **a estrutura dos ofícios fica
pronta** (os postos da frente O): quando o Patch 40 chegar, o governante, o conselho, a corte e o pessoal só ligam a jogabilidade.

## 1. O que o dono vai ver (a régua da onda)

1. O portão com a guarda, o pátio de honra e a fila de quem vem pedir.
2. O salão do trono: o eixo livre da porta ao estrado; as colunas; os bancos da corte; o trono do povo no alto dos degraus, com o arauto
   ao lado; a luz de cada povo.
3. A sala do conselho com a mesa grande: a cabeceira, os lugares pela posição, os escribas contra a parede, a antecâmara.
4. O salão do banquete com a mesa de cada povo: os leitos do romano e do grego, as mesas compridas do nórdico, as cadeiras do egípcio,
   as esteiras e o biombo do asteca; o lugar de honra, o caminho dos criados, o canto dos músicos.
5. O tesouro trancado, com as moedas de verdade do povo; o arquivo no material de escrever do povo; o gabinete com o selo e o mapa.
6. Os aposentos da família, a ala do serviço com as camas de quem trabalha ali, o corpo da guarda, a cozinha e a copa.
7. Tudo modelado, com causa e com luz; e a gente que vive ali: a corte, a guarda, os criados, os escribas, a família.

## 2. As frentes

| Frente | O que entrega |
|---|---|
| **A0 — os prédios grandes aos pedaços** (a Fase 2, F9) | a planta e a casca feitas aos pedaços (o `F.build(P)` como gerador que pausa entre os cômodos; a casca por andar e por ala; o recorte de dentro, como o `B3.portals`), para um palácio de 40 cômodos não travar um quadro — hoje a ínsula já chega a 658 ms; tudo o mais igual |
| **A1 — a planta do poder** | as plantas dos quatro degraus (o paço de 8 m e o novo de 12 m, o palácio de 24 m, o grande de 32, o colossal de 40) e da casa rica de cada povo: as zonas (a pública, a da corte, a do serviço, a privada), o eixo de Estado, o estrado do trono que se sobe sem pulo, as salas da ficha, as portas guardadas, o caminho dos criados por fora do eixo; o salão do jarl do nórdico; o conserto do degrau morto (`escala.js`, D-973) e a forma do paço de 12 m; as peças novas no catálogo (§4); a versão de cada tipo e o catálogo deles |
| **A2 — os móveis do poder** | os modelos do Blender das peças novas, de cada povo (§4), no pacote do poder (as bibliotecas da frente X), com os níveis de detalhe e as partes por material; a peça-herói é o trono |
| **A3 — a decoração e a luz do poder** | as regras do `within` e do desenho de dentro para os usos do poder (o tesouro, o banquete, o armeiro, as tapeçarias, os estandartes e os despojos, o material de escrever, as máscaras dos antepassados da casa rica…), as coisas novas do Blender e a luz de cada povo no palácio (as janelas altas, os candelabros, as lucernas, o fogo comprido, os poços de luz) |
| **A4 — o som e o eco** (a Fase 2, F10) | o eco pelo cômodo (`A.ecoDe`, a parede que abafa, `A.salaDe(uso, fn)`), e os sons do palácio: a água das fontes, o murmúrio da fila, a lira e a flauta do banquete, os cães debaixo dos bancos (nórdico), o sistro e a harpa (egípcio), o búzio e o tambor das horas (asteca), o arauto |
| **A5 — a gente no desenho** (a Fase 2, F11) | a multidão dentro (a corte de pé na audiência, o banquete cheio), os gestos da corte (reclinar no banquete, prostrar-se diante do trono, sair de costas, o arauto, a guarda no posto, o criado com a bandeja, o escriba que escreve), a roupa da corte com causa |
| **A6 — a vida da corte** | as camas do pessoal (D-972); a guarda com os postos de dentro e as camas de turno; a fila da audiência do portão ao trono pelo eixo; a reunião do conselho quando o mundo decide (o imposto, a guerra, o pão); o banquete quando o mundo dá a causa (D-976); a família à mesa da família e nas camas; as portas guardadas e trancadas de noite |
| **A7 — o tesouro do povo** (D-975) | os cofres do palácio como lugar do livro (a letra `x:`), a coletoria levando o imposto até lá, as escritas à mão do tesouro fechadas (T-063), o ladrão e as chaves |
| **A8 — o corpo e a tela no palácio** | o corpo pelo eixo, no estrado, nos bancos, à mesa do banquete e do conselho; a «Vista da sala» do salão grande; a porta guardada que pergunta quem é o corpo; o trono de quem governa; as barras do lugar (o trono, o conselho, o banquete) e a demora da audiência e do banquete |

**A ordem de juntar:** A0 → A1 → A2 → A8 → A5 → A4 → A3 → A7 → A6. **Uma subida da versão** de cada tipo do poder (o paço, os três
palácios, a casa), feita pela A1; **uma geração dos mundos prontos**, pelo supervisor, no fim; as fotos de antes (a sonda, `qa/visual/
sonda-fotos.js`) tiradas pelo supervisor antes de abrir as frentes, e as de depois no fim.

## 3. Quem é dono de cada arquivo

| Frente | Arquivos |
|---|---|
| A0 | no `js/interiors.js` o motor que faz a planta (o `F.build`, o `pump`, o `want`); no `js/build3d.js` a casca de dentro aos pedaços e o recorte |
| A1 | `js/int-palacio.js`, `js/int-monumentos.js` (o paço e os salões), `js/int-familias.js` (só a casa rica), `js/forma-poder.js` e a forma nova do paço de 12 m, `js/escala.js` (só os degraus do poder), as peças novas do catálogo (`js/int-moveis.js` ou um arquivo novo de peças do poder), `js/int-catalogo.js` (os tipos do poder) |
| A2 | `arte/blender/moveis*.py` (os modelos novos), as linhas novas da `moveis_tabela.py`, o pacote do poder gerado |
| A3 | as regras do poder no `within` e no desenho de dentro (num arquivo novo, `js/dentro-poder.js`, pelas portas da frente L), as linhas novas da `TABLE` do `deco.py`, as lâmpadas do poder no `G.Luz3D.LAMPS`, as linhas do `CAUSA` do `qa/dentro-inv.js` |
| A4 | `js/audio-src.js` (o eco pelo cômodo, a sala de cada uso), `js/audio.js` (os sons novos e as suas linhas no `GESTO` e no `ATO`) |
| A5 | `js/people3d.js` (a multidão de dentro), os clipes novos (`js/corte-clips.js`, novo), `js/vida3d.js` (as linhas do `TASK_OF`), no `js/atmos.js` só o `dress` da corte, `js/look3d.js` |
| A6 | `js/court.js`, `js/act-casa.js` (as camas do pessoal: só ele decide — regra 72), `js/polity.js` (o conselho), `js/banquete.js` (novo), as regras de lugar e de porta dos tipos do poder (`In.placeRule`, `In.doorRule`) |
| A7 | `js/tesouro.js` (novo: a letra `x:` do livro), as linhas do tesouro no `js/economy.js` e no `js/politics.js` e no que o `qa/moedas.js` nomear, `qa/moedas.js` |
| A8 | `js/interact.js` (os provedores do trono, do conselho, do banquete e da porta guardada), `js/incui.js`, `js/cam3d.js` (o salão grande), `js/avatar.js` (o estrado), as barras registradas no `js/acoes-ui.js` |

Os de todos ficam como no contrato das fundações: o `qa/AUDIT.md` (cada frente na sua subseção), o `qa/guard.js` (as regras com os
seus números, no fim), o `index.html` (a frente põe a linha do seu arquivo novo), o `CLAUDE.md` (ninguém mexe: as linhas no relatório).

## 4. As peças novas (a A1 põe no catálogo, a A2 modela)

As medidas são o retângulo da peça na planta (`w` de frente, `d` de fundo, `h` de alto, em metros); o modelo de cada povo cabe dentro
dele. **A A1 pode acertá-las no primeiro commit**, e o supervisor avisa a A2. Os usos dos lugares novos estão no §5.

| Peça | w × d × h | Os lugares | De cada povo (o modelo) |
|---|---|---|---|
| `trono-estado` (a peça-herói) | 1,2 × 1,0 × 1,9 (o assento a 0,5) | um `trono` | romano: a cadeira de espaldar na abside, de bronze e marfim onde o povo os tem; grego: o trono de madeira com marfim e ouro e o escabelo; egípcio: o trono folhado a ouro, com os leões; asteca: o assento de junco de espaldar alto coberto de pele de onça; nórdico: o assento alto entre os dois postes entalhados; clássico: o trono de gesso de espaldar ondulado |
| `estrado-trono` | 3,2 × 2,6 × 0,45 (três degraus de 15 cm) | o chão de cima; um `arauto` ao lado | a pedra de cor (romano, clássico), a madeira (nórdico), a rampa (egípcio); **o corpo sobe sem pulo** |
| `dossel` | 1,6 × 1,2 × 3,0 (sobre o trono) | — | só o egípcio (as serpentes e os leques de plumas) e o asteca (o biombo à frente) |
| `mesa-conselho` | 4,0 × 1,2 × 0,76 (10 a 12) e 6,0 × 1,3 × 0,76 (16 a 20) | um `cabeceira`, os `conselho` pelos lados | a mesa do povo; com a cadeira de espaldar alto na cabeceira |
| `cadeira-alta` | 0,6 × 0,6 × 1,4 | um `sentar` (a cabeceira) | do povo |
| `leito-banquete` | 2,2 × 0,9 × 0,65 (três convivas) | três `reclinar` | romano e grego; o leito do meio é o de honra |
| `mesa-banquete` | 1,0 × 0,7 × 0,5 (a baixa, no meio dos leitos) e 3,0 × 0,8 × 0,75 (a de cavalete do nórdico) | — e `comer` pelos lados | romano e grego (a baixa); nórdico (o cavalete com os bancos) |
| `cadeira-leao` | 0,55 × 0,55 × 0,95 | um `comer` | egípcio (os pés de leão), com a mesinha das oferendas |
| `braseirinho` | 0,3 × 0,3 × 0,2 | — (aquece o prato) | asteca: um para cada prato, diante da esteira |
| `biombo` | 1,6 × 0,1 × 1,6 | — | asteca (diante do rei que come) |
| `mesa-mapa` | 1,8 × 1,2 × 0,85 | `consultar` pelos lados | do povo; o mapa é a causa (o que o povo conhece do mundo) |
| `estante-arquivo` | 1,6 × 0,45 × 2,1 | `arquivar` | o material de escrever do povo: as tabuinhas de barro nas prateleiras inclinadas (clássico), os rolos (egípcio, grego), as tabuinhas de cera e as placas de bronze (romano), o amate dobrado (asteca); o nórdico não tem arquivo — a lei é memória |
| `arca-ferro` | 1,0 × 0,6 × 0,7 | `guardar` | o romano (presa ao chão); os outros, o `cofre` de hoje, modelado |
| `armeiro` (hoje caixa) | 1,6 × 0,5 × 1,9 | `armar` | as armas que o povo forjou, à mostra |
| `lar-redondo` | 3,2 × 3,2 × 0,25 | `aquecer` em volta | o clássico (o lar pintado de Pilos, no meio da sala do trono) e o grego (o fogo de Héstia) |
| `banco-corte` (já existe) | 2,4 × 0,4 × 0,45 | `sentar` | modelado de cada povo |
| `catre` (já existe) | 0,8 × 1,9 × 0,45 | `deitar` | as camas do pessoal e da guarda |
| `fonte` (já existe) | 1,2 × 1,2 × 0,6 | — | a do pátio, de cada povo |

## 5. Os nomes combinados

- **Os cômodos** (o `fn`): `trono`, `audiencia`, `conselho`, `antecamara`, `banquete`, `tesouro`, `gabinete`, `arquivo`, `cozinha`,
  `copa`, `despensa`, `adega`, `guarda`, `servico` (a ala do serviço), `familia` (os aposentos), `jantar` (a mesa da família),
  `hospedes`, `oratorio`, `patio`, `galeria`. A A1 pode acertá-los no primeiro commit, avisando.
- **Os usos dos lugares novos:** `trono` (quem governa), `arauto`, `cabeceira`, `conselho`, `reclinar` (o jeito novo de usar o lugar: o
  corpo deitado de lado, apoiado no cotovelo esquerdo), `servir` (o caminho dos criados), `fila` (a fila da audiência), `posto-guarda`,
  `escrever`, `arquivar`, `consultar`, `guardar`, `armar`.
- **O livro:** a letra `x:` é o tesouro do povo (os cofres do palácio, D-975); só o `js/tesouro.js` a escreve.
- **As camas do pessoal:** um campo novo da sede, que não é `aposentos` nem `housing` (o nome fica para a A6, com o cuidado do L-974);
  só o `act-casa.js` decide quem dorme nelas.
- **Os gestos novos:** `reclinar`, `prostrar`, `sair-de-costas`, `anunciar` (o arauto), `posto` (a guarda), `bandeja` (o criado),
  `escrever` (o escriba); cada um com a sua linha no `TASK_OF`, no `G.Audio.GESTO` e, se for ato, no `G.Audio.ATO`.

## 6. Os números reservados

Depois das fundações (que vão até a regra 559, a D-1069, o L-2309 e o T-2209):

| Frente | Regras | Decisões | Defeitos | Limites de prova |
|---|---|---|---|---|
| A0 | 560 a 569 | D-1070 a D-1079 | L-2310 a L-2319 | T-2210 a T-2219 |
| A1 | 570 a 579 | D-1080 a D-1089 | L-2320 a L-2329 | T-2220 a T-2229 |
| A2 | 580 a 589 | D-1090 a D-1099 | L-2330 a L-2339 | T-2230 a T-2239 |
| A3 | 590 a 599 | D-1100 a D-1109 | L-2340 a L-2349 | T-2240 a T-2249 |
| A4 | 600 a 609 | D-1110 a D-1119 | L-2350 a L-2359 | T-2250 a T-2259 |
| A5 | 610 a 619 | D-1120 a D-1129 | L-2360 a L-2369 | T-2260 a T-2269 |
| A6 | 620 a 629 | D-1130 a D-1139 | L-2370 a L-2379 | T-2270 a T-2279 |
| A7 | 630 a 639 | D-1140 a D-1149 | L-2380 a L-2389 | T-2280 a T-2289 |
| A8 | 640 a 649 | D-1150 a D-1159 | L-2390 a L-2399 | T-2290 a T-2299 |

## 7. As provas da onda

- **Todas:** o protocolo do contrato das fundações (§5); a prova padrão (`node qa/padrao.js palacio` e os outros tipos do poder) acima da
  taverna em cada critério; a prova dos postos (`qa/postos.js`) sem falta nos tipos do poder; o mundo sem o corpo igual onde a frente não
  muda o mundo.
- **A0:** a planta e o desenho iguais byte a byte; o tempo do pior quadro de um palácio colossal e da ínsula, antes e depois.
- **A1:** `qa/plantas.js`, `qa/motor-plantas.js`, `qa/morar-palacio.js` (`ONLY=m1,m3,m9`), `qa/degraus.js` (sem o g8) pelo degrau do
  paço, `node qa/catalogo.js confere` dos tipos do poder.
- **A2:** `qa/visual/moveis.js`, `qa/visual/malhas.js`, as fotos de cada trono pela fila.
- **A3:** `qa/dentro.js`, `ONLY=l1,l2,l3 node qa/luz.js`, `qa/visual/interior3d.js`.
- **A4:** `ONLY=s1,s2,s8 node qa/som.js` e a parte da sala.
- **A5:** `qa/vida3d.js` (`ONLY=v1,v2,v3,v4,v5,v6,v8,v9,v10`), `qa/visual/gestos-vida.js`, `qa/vida-custo.js` (≤ 4 ms na Alta), com a
  máquina livre.
- **A6:** `qa/morar-palacio.js`, `qa/casa-cheia.js`, `qa/sociedade.js` (`ONLY=so1,so2,so4`), `qa/juntar.js`.
- **A7:** `qa/moedas.js`, três mundos do `qa/oficio-eco.js`, o medidor da sociedade com poucas sementes.
- **A8:** `ONLY=m1,m3,m4,m6,m9 node qa/movimento.js`, `ONLY=o1,o4,o8,o10 node qa/olho-dentro.js`, `qa/interacao.js` (`ONLY=n1,n4`),
  `qa/acoes.js`, e no navegador a tela pelo corpo no palácio.

## 8. O que o supervisor decide antes de abrir (as decisões em aberto da ficha)

- Juntar a sala do conselho ao aposento do outro lado do trono (recomendado na ficha, para a mesa de 16 a 20).
- O palácio «antigo» de 12 m: fica como está, ou a cidade o refaz no degrau novo.
- Quanto cresce o salão do trono por degrau; os dois banquetes do grande palácio.
- As camas do pessoal valem para a casa rica, ou o quarto do criado espera a condição do servo.
- O colossal, que nunca aparece nos mundos prontos: provado num mundo de teste.
