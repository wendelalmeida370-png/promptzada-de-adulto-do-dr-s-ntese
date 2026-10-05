# GOD OF THE ANT FARM

> *Watch them live. Help them prosper. Or remind them who their god is.*

Um jogo de simulação divina que roda direto no navegador. Ilhas, continentes, arquipélagos e mares abertos procedurais — com cordilheiras nevadas, planaltos, falésias, rios que descem das montanhas, cachoeiras e lagos; com tundra, taiga, florestas, pântanos, selvas, savanas e desertos, e mais de 40 espécies de animais presas numa cadeia alimentar de verdade; povos autônomos — gregos, nórdicos, egípcios, astecas e romanos — que crescem de acampamento a megalópole, navegam, negociam, se casam, racham, guerreiam, cercam cidades, escravizam e se libertam. Cada mundo escreve a própria lenda. E você: uma entidade que observa e interfere.

## Como jogar

**Abra `index.html` no navegador** (Chrome, Edge, Firefox ou Safari recentes). Só isso: não precisa de servidor, build ou instalação. Tudo é JavaScript puro + Canvas 2D, sem bibliotecas externas.

> Se preferir servir por HTTP: `npx serve .` ou `python3 -m http.server` dentro desta pasta.

Em **NEW WORLD** você escolhe o **mapa** (Ilha, Continente, Arquipélago, Istmo ou Mar Aberto), o **tamanho** (Pequeno 64, Médio 80, Grande 96, **Enorme 128, Colossal 160 ou Titânico 192**), quantos **povos** despertam (1 a 4 — até 6 nos mapas enormes), o **clima** (variado, frio, temperado, tropical ou árido), o **relevo** (plano, suave, montanhoso, alpino ou aleatório — com cordilheiras, planaltos e mesas, falésias na costa, lagos e **cavernas** à escolha), a **civilização** de cada um (ou sorteio, ou povos clássicos sem nome), **quando começar** (no princípio, 30 anos depois, na era das cidades ou na era dos impérios) e o **temperamento** dos povos (pacíficos, imprevisíveis ou belicosos).

O jogo salva automaticamente no `localStorage` do navegador (a cada 45 s e ao fechar a aba) — os mapas grandes são compactados para caber. Use **CONTINUE** no menu para voltar ao seu mundo. Saves da versão anterior (um só povo) são convertidos automaticamente.

## Controles

| Ação | Controle |
|---|---|
| Mover a câmera | arrastar com o mouse (botão esquerdo ou direito) · `WASD` / setas |
| Girar a câmera | **dois dedos girando** na tela · **botão do meio** ou `Shift` + arrastar · arrastar a agulha da bússola · `Q` / `E` (um quarto de volta) |
| Zoom | roda do mouse · pinça no touch |
| Ver detalhes | clique num habitante, animal ou construção |
| Seguir alguém | duplo clique no habitante · `F` |
| Poderes | barra inferior ou teclas `1`–`8` da aba atual, depois clique no mapa |
| Trocar aba de poderes | `Tab` (Dádivas · Ira · Terra · Mar · Natureza · Palavra · Destino) |
| Minimapa | `M` · ou o ícone do mapa no topo (clique/arraste nele para voar até lá) |
| Ver o subterrâneo | `U` · ou o ícone da caverna no topo · ou “Ver o interior” ao tocar a boca de uma caverna |
| O Livro do Mundo | `L` · ou o ícone do livro no topo |
| Painel dos reinos | `R` · ou clique no chip do povo no topo |
| Mostrar/ocultar fronteiras | `B` |
| Cancelar poder | botão direito · `Esc` |
| Pausar | `Espaço` |
| Velocidade | botões 1x / 2x / 4x / **8x** / **16x** · `+` / `-` (em mundos muito grandes, o 16x mostra a velocidade real que o computador consegue manter) |
| Avançar no tempo | `J` · ou o botão ⏭ ao lado das velocidades — pula anos de história (veja abaixo) |
| Crônica | `H` |
| Árvore genealógica | `T` (com alguém selecionado) |
| Modo cinema | `C` · ou o ícone da câmera no topo — `N` próxima cena · `Esc` ou um clique sai |
| Modo foto | `P` · ou o ícone da máquina fotográfica — `Esc` sai |
| Menu | `Esc` |

## O que acontece na ilha

- **Habitantes autônomos** com nome, idade, personalidade (corajoso, curioso, devoto, romântico…), fome, energia, vida, devoção e medo. Uma *utility AI* escolhe o que fazer a cada momento: trabalhar, comer, dormir, socializar, cortejar, rezar, explorar — e emergências (fogo, meteoros, lobos) passam na frente de tudo.
- **Trabalho real**: lenhadores derrubam árvores e carregam a madeira, coletores colhem frutas, pescam e caçam, agricultores plantam e colhem trigo, mineiros quebram pedra, construtores buscam material no armazém e erguem as obras em etapas visíveis (fundação → estrutura → pronto). Os números da interface são o estoque real.
- **Trilhas emergentes**: os caminhos mais usados viram estradas de terra.
- **Famílias**: casais se formam, bebês nascem, crianças brincam e crescem, idosos morrem. Cemitérios, luto, funerais e árvore genealógica.
- **Progressão orgânica**: Acampamento → Aldeia → Povoado → Comunidade Agrícola → Vila Artesã → Vila Sagrada → Vila Desenvolvida → Pequena Civilização. Com gente suficiente, grupos partem para fundar novos assentamentos.
- **Natureza viva**: florestas que se espalham e regeneram, peixes pulando, vaga-lumes, nuvens, chuvas, tempestades, secas (veja *Biomas* e *Animais* abaixo).
- **Fogo de verdade**: se espalha com o vento, queima árvores, plantações e casas; moradores formam brigadas com baldes do poço; a chuva apaga.
- **Dia e noite** com janelas acesas, tochas, fogueiras e braseiros. O dia é longo (200 s na velocidade 1×): dá tempo de ir longe, trabalhar e voltar antes de escurecer — a fome, o sono e a fé seguem o ritmo do dia, não do relógio.
- **Eventos com moderação**: tempestades, secas, lobos, febre, estações de fertilidade, descobertas, viajantes chegando de barco.

## Montanhas, rios e o chão do mundo

O terreno não é mais uma planície: cada mundo nasce com **relevo de verdade**, escolhido no Novo Mundo.

- **Cordilheiras**: uma espinha de montanhas atravessa a terra, com picos que passam de 5.000 m no relevo alpino, **neve eterna** no alto, encostas de rocha com as camadas à mostra (granito cinza, arenito vermelho nos desertos) e **passos** — selas baixas onde se atravessa de um vale ao outro.
- **Colinas, planaltos e mesas**: platôs de topo plano cercados de paredões, às vezes com uma segunda mesa por cima; sempre com uma rampa ou trilha para subir, para que nenhum povo fique preso.
- **Falésias** onde a terra encontra o mar (ou praias, ou os dois), e **depressões** onde a água se junta.
- **A chuva esculpe o terreno**: uma simulação de erosão cava ravinas nas encostas e espalha sedimento aos pés das montanhas antes do primeiro dia.
- **Rios que descem**: nascem nas montanhas, seguem o vale até o mar ou até um lago, cada trecho na sua altura. Onde o terreno cai, o rio cai junto: **cachoeiras** com espuma, véu de água e névoa (e o barulho delas no som ambiente), corredeiras nos trechos íngremes. Riachos de montanha descem para engrossar os rios.
- **Lagos nas bacias**, cada um no seu nível — inclusive lagos de altitude.
- **Raso e fundo**: na beira dos rios e lagos a água é rasa — gente e bichos atravessam com água pelos joelhos; no meio é funda e só nadadores entram (capivaras, sapos, aves aquáticas, peixes). Ninguém dorme dentro d'água, e uma rua calçada vira passagem.
- **Nomes**: a cordilheira, os picos (com a altitude), os passos, as grandes cachoeiras (com a altura da queda — as escadarias de saltos contam como uma só) e os lagos ganham nomes, que aparecem no mapa e numa aba nova do Livro do Mundo, **Geografia**, com um botão para voar até cada lugar.

O relevo muda a vida: subir custa caro (os caminhos contornam as montanhas e procuram os passos), encostas deixam todos mais lentos, **paredões não se escalam**, ninguém constrói em penhasco, o alto é frio (a neve e a taiga sobem as encostas) e menos fértil, o minério está nas terras altas — e na guerra, **quem está no alto bate mais forte**.

**A câmera gira livre**, de forma contínua: **dois dedos girando** na tela do celular (a pinça continua dando zoom), o **botão do meio** do mouse ou `Shift` + arrastar no PC, ou arrastando a agulha da bússola. Enquanto gira, o mundo é desenhado no ângulo do momento — o relevo de verdade, as construções como volumes nas cores e telhados do seu povo, árvores, gente e bichos de pé —; ao soltar, ele **assenta suavemente** no lado mais próximo (um giro rápido leva ao lado seguinte), onde volta o desenho completo. `Q`/`E` dão um quarto de volta suave. São quatro lados de descanso, com as construções, as pessoas e os animais virados para o lado certo. **Montanhas escondem** o que está atrás delas — quem você selecionou continua visível como um fantasma através da rocha.

## Cavernas: o mundo de baixo

Debaixo do mundo inteiro há uma **camada subterrânea**. Nos morros e serras a água cavou **galerias** e **salões**, com **rios subterrâneos**, **lagos negros**, **estalagmites**, **colunas**, **grutas de cristal**, **vaga-lumes de caverna** pendurados do teto, cogumelos que brilham, ossos e **fósseis**. Nas paredes aparecem **veios de minério** — cobre, estanho, ferro, ouro, sal-gema e gemas. As **bocas** se abrem nas encostas, como arcos escuros.

**A vista de dentro**: o botão da caverna no topo (ou `U`) mostra o mundo de baixo — a rocha cortada rente ao teto das cavernas, com as paredes de trás inteiras e as da frente rebaixadas, para nada ficar escondido. Lá é escuro: o que ilumina é a **luz do dia caindo pelas bocas**, as **tochas** de quem entra, a **fogueira dos bandidos**, os vaga-lumes e os cristais. Dá para girar, dar zoom, clicar nas pessoas e nas cavernas. O som muda: gotas pingando e o zumbido da rocha.

**Quem vive no escuro**: **morcegos** (saem ao entardecer numa fita negra que sobe da boca da caverna, caçam insetos à noite, voltam antes do amanhecer — e o **guano** deles vira adubo para as roças), **ursos** que passam a noite (o inverno) dormindo no fundo e às vezes saem com um filhote, **aranhas**, **grilos-das-cavernas**, **salamandras cegas** e **peixes cegos** nos lagos.

**O que os povos fazem com elas** — tudo acontece de verdade, com gente andando lá dentro de tocha na mão:
- **Descobrem**: quem passa perto de uma boca entra e explora; às vezes acha um **tesouro** esquecido (um geodo de ametista, um ídolo de ouro, moedas que ninguém sabe cunhar, a ossada de uma fera gigante) — e nasce uma lenda.
- **Pintam a própria história** nas paredes: guerras, reis, sinais do deus, feras, naufrágios — com mãos de ocre em volta. As pinturas aparecem nas paredes (gire para ver as que estão de costas), ficam na ficha da caverna e no Livro, e os **idosos contam o que está pintado** às crianças.
- **Enterram os reis**: quando um governante morre, o cortejo desce com tochas até a **tumba**, feita no jeito de cada povo — sarcófago pintado com máscara de ouro, urna de bronze, sarcófago de mármore, barco de pedras com a espada, altar com máscara de jade — com o ouro do tesouro.
- **Ouvem o oráculo**: num povo devoto alguém começa a ouvir vozes na gruta; todo dia sobe com a fumaça, **profetiza** (guerra, paz, uma coroa que cai, fome, fartura, a mão do deus) e os **peregrinos** vêm de longe. Profecia cumprida vira lenda; profecia falha derruba a fé na gruta.
- **Se escondem da guerra**: quando a cidade é atacada, crianças, velhos e mães com bebês correm para a caverna e só saem quando o perigo passa.
- **Mineram**: mineiros descem até os veios e voltam carregados de minério, ouro, gemas ou sal; quando o veio acaba, a galeria cavada fica — e outros veios aparecem mais fundo.
- **Bandidos** fazem de uma caverna afastada o seu esconderijo: à noite saem em fila, assaltam a vila mais próxima e voltam com o butim; saqueiam túmulos de reis; até que o povo roubado manda guerreiros entrarem com tochas para acabar com eles.

No **Novo mundo** escolha **Cavernas**: nenhuma, poucas, normais ou muitas. No Livro do Mundo, a aba **Cavernas** conta a história de cada uma, com um botão para ver o interior. Os poderes **Abrir Gruta** e **Desabamento** (aba Terra) criam uma caverna nova sob uma colina ou derrubam o teto de uma — com quem estiver dentro.

## Avançar no tempo

O botão ⏭ (ou `J`) abre **Avançar no tempo**: o mundo vive sozinho e depressa — de verdade, cada nascimento, obra e batalha acontece —, só que sem desenhar nada. Você vê os anos passarem num mapa do mundo inteiro (reinos, estradas, cidades crescendo, batalhas acendendo em vermelho), com os contadores e as grandes notícias da crônica, e pode **parar quando quiser** (`Esc`). No fim, um resumo do que aconteceu.

- **Até quando**: 10, 25 ou 50 anos · até a primeira cidade · até a primeira metrópole · até a primeira megalópole · até a próxima guerra.
- **Como passam os anos**: **anos de paz e fartura** (a sua bênção: nenhuma guerra começa, colheitas e obras andam mais rápido, pedreiras e matas rendem o dobro, o saber avança mais depressa e os berços se enchem; celeiros cheios mandam metade dos lavradores para as pedreiras — os povos crescem até virar impérios, e quando a bênção acaba eles voltam a se olhar como rivais) ou **deixar o mundo seguir** (guerras, pestes e fomes vêm quando vierem).
- No **Novo Mundo**, "Começar" faz o mesmo antes de você chegar: 30 anos depois, na era das cidades ou na era dos impérios.

## Biomas e clima

O clima nasce da latitude (neve ao norte, trópicos ao sul), da altitude, da umidade, dos rios e do mar. Cada mundo mistura **sete biomas**, cada um com chão, árvores, fertilidade, custo de caminhada, risco de fogo e bichos próprios:

| Bioma | Árvores | Terra | Animais típicos |
|---|---|---|---|
| **Tundra gelada** | pinheiros nevados | quase nada cresce | renas, bois-almiscarados, lebres e raposas-do-ártico, ursos-polares, focas, pinguins |
| **Taiga** | pinheiros e bétulas | pobre | renas, cervos, lobos, ursos, corvos |
| **Floresta temperada** | carvalhos, bétulas, pinheiros | boa | coelhos, cervos, javalis, raposas, lobos, ursos, águias |
| **Pântano** | salgueiros | fértil, mas lento de atravessar | rãs, capivaras, garças, flamingos, jiboias, crocodilos |
| **Floresta tropical** | árvores gigantes e palmeiras | muito fértil | macacos, antas, capivaras, araras, jiboias, onças |
| **Savana** | acácias e baobás | média; o capim pega fogo fácil | zebras, gazelas, girafas, elefantes, hipopótamos, hienas, leões, abutres |
| **Deserto** | cactos e palmeiras de oásis | quase estéril | camelos, gazelas, lagartos, fenecos, víboras |

Os povos preferem começar onde se sentem em casa (nórdicos no frio, egípcios junto ao deserto e ao rio, astecas na selva).

## Animais e cadeias alimentares

- **40 espécies** na terra, no mar (golfinhos, focas, baleias, tubarões, orcas, tartarugas) e no céu (gaivotas, águias, abutres, corvos, araras, garças, flamingos).
- **Plantas → herbívoros → predadores → predadores de topo.** O capim cresce em cada pedaço de chão e é pastado; herbívoros comem capim, folhas e frutos; predadores caçam herbívoros; urso, leão, onça, crocodilo, tubarão, orca e águia estão no topo. Carniceiros (hienas, abutres, corvos) limpam as carcaças, e a carniça aduba o chão de novo.
- Cada espécie tem **habitat**, **fome**, **idade**, **filhotes** e um **limite** que a terra aguenta. Se os lobos somem, os cervos explodem — e depois passam fome. Espécies extintas podem voltar, aos poucos, vindas de terras distantes.
- Predadores perseguem, emboscam (onças, jiboias e crocodilos ficam de tocaia), e os mais ousados atacam gente sozinha — um bicho que mata duas pessoas ganha nome e vira lenda.
- Os caçadores caçam o que existe por perto; os pescadores disputam os cardumes com as focas e as garças.
- Clique num animal para ver o que ele come, quem o caça, onde vive e quantas vítimas fez. O **Bestiário** (no Livro do Mundo) mostra a teia alimentar inteira com as populações reais e sua história.

## Civilizações

Cada povo pode ser de uma civilização histórica — ou um povo clássico, sem nome. A civilização muda nomes, roupas, armas, arquitetura, títulos, unidades, tecnologias e o próprio jeito de viver:

| Civilização | Traços | Unidade de elite | Maravilha |
|---|---|---|---|
| **Gregos** | pesquisa rápida, colônias, comércio; cidades orgulhosas e independentes | Falange de hoplitas | Acrópole |
| **Nórdicos** | mar, pesca, caça, saques costeiros; plantam mal | Berserker (nunca foge) | Salão de Valhala |
| **Egípcios** | colheitas fartas junto ao rio, fé profunda, obras de pedra | Carro de guerra | Pirâmide |
| **Astecas** | guerras floridas (capturam em vez de matar), sacrifícios, fé | Guerreiro-Águia | Templo Mayor |
| **Romanos** | estradas, aquedutos, disciplina, assimilação dos conquistados | Legião | Coliseu |

**Tecnologias** (a roda, a escrita, navegação, arco e flecha, bronze, alvenaria, a moeda, engenharia, filosofia, ferro) são pesquisadas por cada povo em ordem própria e se espalham pelo comércio e pela paz.

## Cidades que crescem

- **Acampamento → Aldeia → Vila → Cidade → Metrópole → Megalópole**, com placas de nome sobre cada cidade.
- Nos mapas **Enorme, Colossal e Titânico** as cidades não ficam presas: uma capital pode passar de centenas de habitantes, com **quarteirões** de casas de pátio (quatro sobrados em volta de um pátio), várias praças, mercados, termas e teatros, e ruas que se espalham por dezenas de quadras. Em testes, um mundo 160×160 pacífico chegou a 1.000 habitantes e à primeira megalópole por volta do ano 100.
- Casas evoluem para **sobrados** e **ínsulas**; surgem **praça**, **mercado**, **celeiro**, **biblioteca**, **teatro**, **termas**, **palácio**, **porto** e uma **maravilha** — tudo desenhado no estilo de cada civilização. Uma cidade que ainda não tem palácio, teatro nem maravilha sonha primeiro com o teatro: é o que a faz virar metrópole. Quando o centro já está cheio, as grandes obras vão para a borda da cidade — além dos muros, se for preciso.
- **Ruas** de cascalho e depois calçadas crescem do centro para fora; **estradas** e **pontes** ligam as cidades.
- **Carroças** levam bens pelas **rotas internas** e pelas **rotas de comércio** entre povos amigos.
- **Aquedutos** trazem água do rio, arco por arco.

## A vida na cidade

Nada é enfeite: cada coisa que se vê na cidade é alguém fazendo um trabalho de verdade, com matéria-prima de verdade.

- **Empregos fixos e rotinas**: cada pessoa tem um ofício e um local de trabalho. O mineiro atravessa a cidade até a **mina** no veio de minério e volta carregado; o agricultor vai à colheita e volta; o guerreiro sobe na **torre** ou guarda o portão da muralha e depois volta para a casa onde mora. À tarde uns vão para casa jantar da despensa, outros para a **taverna**.
- **Criação de gado**: **currais** com vacas, ovelhas, cabras, porcos ou perus (conforme a civilização) e **estábulos** de cavalos. Pastores soltam o rebanho de manhã, levam ao pasto, vigiam contra lobos e trazem de volta; quando não há capim, buscam **feno** no celeiro e enchem o cocho. Tosquiam ovelhas, ordenham vacas e cabras, recolhem ovos. Os animais comem, dão cria — e morrem de fome se ninguém cuida.
- **Cadeias de produção**: lã → **tecelagem** → tecido; animal levado na corda → **açougue** → carne e couro; minério → **forja** (queimando lenha) → ferramentas e **armas**; ouro → **ourivesaria** → joias; argila tirada da beira do rio → **olaria** → cerâmica; ouro e pedra → **estátua de ouro** do deus.
- **Veios de ferro e ouro** no mapa (montanhas, desertos, rios da selva): quem tem, minera; quem não tem, compra — ou conquista.
- **Mercado, feira e mercado clandestino**: mercadores reabastecem no armazém e vendem às famílias; a **feira** arma barracas toda manhã e desmonta ao meio-dia; o **contrabandista** rouba à noite e vende barato, até a guarda dar uma batida.
- **Dinheiro e impostos**: com a Moeda, os **coletores de impostos** batem de porta em porta, o ouro é cunhado em moedas, salários são pagos às famílias, e cada governo cobra sua taxa (tirania 30%, era de ouro menos). Casas com tecido, cerâmica e joias vivem melhor; impostos altos e escassez derrubam a lealdade. O **prédio administrativo** (bouleutério, basílica, casa do vizir, tecpan, salão do thing) tem escribas que ajudam a governar.
- **Muito mais animações**: tear, martelo na forja, torno de oleiro, tosquia, ordenha, pastor com cajado, varrer, servir na taverna, escrever, bater à porta, esgueirar-se, pechinchar, beber, carregar lã, tecido, couro, minério, armas, ouro, cerâmica, moedas e feno.
- Clique num edifício para ver quem trabalha lá, o estoque, o rebanho ou o veio; no painel **Reinos**, cada povo mostra bens, tesouro, imposto e a produção do dia anterior.

## Fim de tarde, histórias, ofícios e filas

A vida pequena, a que acontece entre um trabalho e outro. Tudo aqui **toma o lugar** de algo que as pessoas já faziam (voltar para casa, brincar, rezar) — então o dia não perde a forma: nas medições (50 dias de um mundo em guerra), a família à porta ocupa cerca de 2% do tempo de todos, a água ~2%, o aprendizado ~1,5%, recolher os mortos ~0,5% e as histórias bem menos que isso — uns 6% no total.

- **Fim de tarde em família**: quando o trabalho acaba, cada família se senta **à porta da própria casa**, em volta de um foguinho, e janta da despensa. Quem chega por último ganha um **abraço**; os pais **jogam os pequenos para o alto**; as crianças correm em volta do fogo. Quando os adultos entram, as crianças vão junto.
- **Os velhos contam histórias**: ao entardecer, um ancião se senta junto à fogueira da vila e as crianças (e um ou outro adulto) sentam no chão do outro lado para ouvir. As histórias **aconteceram de verdade** — são entradas da Crônica (a guerra de vinte anos atrás, o raio, a fundação), as lendas do Livro do Mundo ou a **vida de quem conta**, em primeira pessoa (“Perdi meu braço esquerdo lutando perto de Birka”). Histórias de medo assustam, as dos deuses aumentam a devoção, e as crianças lembram delas depois.
- **Filhos aprendem o ofício dos pais**: dos nove anos em diante, a criança vai com o pai ou a mãe para o trabalho e **imita** o que eles fazem — o machado, a forja, o tear, a enxada, o cajado, até o treino com lança. Com a prática ela **aprende o ofício**: ao crescer, tende a seguir a mesma profissão e trabalha 15% mais rápido nela.
- **Água e filas**: cada casa bebe seu jarro em cerca de um dia. Toda manhã alguém vai ao **poço** (ou à beira do rio), espera na **fila** e volta com o **jarro na cabeça**. Casa sem água adoece mais — um poço faz diferença de verdade.
- **Rotinas coletivas**: fiéis rezando em **fileiras** diante do templo, com o sacerdote à frente; soldados treinando **em formação**, golpeando todos juntos; nas cidades maiores, ao amanhecer, a **trompa** (ou o tambor, entre egípcios e astecas) que chama ao trabalho.
- **Animais da cidade**: **cães** com nome (Argos, Ferox, Garm, Xolo…) que seguem o dono, tocam o rebanho com o pastor, brincam com as crianças, latem e **expulsam raposas e lobos**, e dormem enrolados na porta; **gatos** nas soleiras (muitos no Egito); **galinhas** e um galo no quintal (os ovos vão para a despensa; as raposas vêm atrás delas); **pombos** na praça que levantam voo quando alguém passa. Contados de verdade, por cidade.
- **Biografia viva**: cada pessoa guarda os **marcos reais** da sua vida — onde e de quem nasceu, com quem aprendeu o ofício, quem amou, os filhos, os que perdeu, as festas em que teve papel, as guerras, o primeiro inimigo, as feridas, o cativeiro, as histórias que ouviu. O painel mostra as últimas memórias; o botão **Biografia** abre a vida inteira, dia por dia, até a morte e o destino do corpo.
- **Novas animações**: contar histórias com os braços, ouvir sentado de pernas cruzadas (e levar a mão à boca no susto), abraçar, jogar a criança para o alto, esperar na fila, carregar o jarro na cabeça, arrastar um corpo, cambalear com o golpe, andar de muleta, viver sem um braço.

## Festividades

Cada povo tem seu calendário, e as festas acontecem de verdade no mundo, com gente andando, carregando, dançando, comendo — e morrendo.

- **Gregos**: **Panateneias** (o peplo novo levado em procissão até a deusa e uma novilha do curral sacrificada no altar; a cada quatro anos as **Grandes Panateneias**, com corrida), **Dionísias** (coro, atores de máscara e vinho) e os **Jogos Olímpicos** a cada quatro anos, com a **trégua sagrada**: nenhum grego marcha enquanto duram.
- **Romanos**: **Saturnália** (à noite, com velas: os senhores servem a mesa e os cativos comem como convidados), **Jogos** com gladiadores e pão para a multidão, e o **Triunfo** depois de uma conquista: o exército desfila com os cativos acorrentados até o templo.
- **Egípcios**: **Festa de Opet** (a barca dourada do deus nos ombros dos sacerdotes, do templo até o rio e de volta), a **Bela Festa do Vale** (as famílias passam a noite no cemitério com tochas e oferendas) e **Wepet Renpet** (água nova do rio para os campos, que crescem mais).
- **Astecas**: **Toxcatl** (numa noite do ano, o cativo que foi o deus Tezcatlipoca dança, sobe a pirâmide e é sacrificado; sem cativo, um peru), **Tlacaxipehualiztli** (o cativo amarrado à pedra redonda luta contra guerreiros-águia e jaguar) e, a cada **52 anos**, o **Fogo Novo**: toda a cerâmica é quebrada, todas as luzes da cidade se apagam, e só depois que o fogo novo acende no alto da pirâmide os corredores levam tochas de casa em casa.
- **Nórdicos**: **Jól** (a grande fogueira, o blót com um animal sacrificado e chifres de hidromel até o amanhecer), **Midsommar** (roda de dança em volta do mastro) e o **Thing** (o recitador das leis fala aos homens livres).
- Cada cidade faz **uma festa por ano**, alternando o calendário (os Jogos a cada 4 anos e o Fogo Novo a cada 52 têm prioridade quando chega a vez deles); vilas pequenas, um ano sim, outro não. Participa **parte da cidade** — os vizinhos do lugar da festa, os devotos, crianças, idosos e quem está de folga —, enquanto agricultores, pastores, mineiros e guardas seguem trabalhando. Assim as festas ocupam menos de um décimo do tempo das pessoas.
- Festas dão lealdade, devoção e fé; custam comida, tecido, cerâmica e animais. São interrompidas se o inimigo chega.

## Exércitos, batalhas e cercos

- **Exércitos de verdade**: o povo levanta **recrutas** da região inteira (a guerra consome as **armas** da forja; sem elas vão com porrete, como milícia) e o tamanho depende do governo, da comida e da ambição do líder — dezenas, às vezes mais de cem soldados.
- **Tipos de tropa**: **lanceiros**, **espadachins**, **arqueiros**, **cavalaria** (cavalos do estábulo; carros de guerra egípcios), **tropas de elite** de cada cultura e **milícia**.
- **Oficiais**: um **general** com o título da cultura (Estratego, Legado, Grande Comandante, Tlacochcalcatl, Jarl), **coronéis** de ala (Taxiarca, Tribuno, Hersir…) e **capitães** de cada companhia (Lochagos, Centurião, Tequihua, Skipari…) com estandartes — a águia romana, o leque egípcio, o estandarte de plumas asteca, o estandarte do corvo nórdico.
- **Formações**: linha, **falange**, **parede de escudos**, **cunha** (svinfylking), **tartaruga** (testudo), ordem dispersa dos arqueiros e coluna de marcha. Cada companhia tem uma frente: golpes pelo **flanco** e pelas **costas** machucam mais e derrubam o **moral**; companhias com moral baixo **debandam**, e se muitas fogem o exército é desbaratado. Lanças vencem cavalos, espadas vencem lanças, a colina e o rio contam.
- **O general escolhe o plano** olhando o inimigo e o terreno: **cerco** e fome, **ataque por vários portões** para dividir os defensores, **pinça** com a cavalaria pelos flancos, **guerrilha** (queimar campos, roubar rebanhos, matar quem sai e sumir), a **cunha** dos berserkers, a **tartaruga** romana contra flechas.
- **Quem defende também planeja**: o reino manda um exército de socorro e escolhe entre **defender as muralhas**, **emboscada na floresta** (caindo sobre o flanco inimigo), **segurar o alto da colina** ou **o vau do rio** — ou a batalha campal diante da cidade. Quando dois exércitos se encontram, formam **linhas de batalha**.
- **Cercos profundos**: trincheiras e tendas em volta da cidade fora do alcance das flechas; a cidade passa a viver só da **comida dentro dos muros** e pode morrer de fome e **se render**. **Aríetes**, **catapultas**, **torres de cerco** que baixam a ponte sobre o muro, **escadas** (os defensores empurram), soldados que escalam e **abrem o portão por dentro**, **sapadores** que cavam sob a muralha até ela desabar, **óleo fervente** despejado do portão (incendeia aríetes) e — sob generais cruéis — **cadáveres catapultados** por cima dos muros para espalhar a **peste**.
- **A guerra pesa**: cada golpe joga o corpo para trás e espirra sangue na direção do golpe; aparas de espadas soltam faíscas e o clangor do metal. Golpes pesados (elites, berserkers, heróis) **decepam braços** — que voam e ficam no chão — e às vezes **cabeças**. Quem sobrevive a um braço cortado fica **sem ele pelo resto da vida**: um coto enfaixado, trabalho mais lento, golpes mais fracos, e a memória na biografia. Quem morre **cai de verdade** — tomba, quica, fica — e uma poça de sangue se espalha embaixo.
- **Os mortos ficam onde caíram**: com as roupas, o escudo e as flechas ainda cravadas. Com o tempo **incham** (moscas em volta), os **corvos** chegam para comer, eles **ressecam** e viram **esqueleto**, até sumirem. Quando o combate acaba, **coveiros** saem da cidade — parentes primeiro, depois cativos, depois quem estiver livre — e **arrastam** os corpos: os nossos para o **cemitério** (e a família vai ao enterro), os inimigos para a **pira**, que queima longe das casas. Deixados ali, os corpos **apodrecendo trazem doença** a quem mora perto, e a Crônica registra: “O fedor dos mortos trouxe a doença a Roma”.
- **No mar**: frotas com **almirante** (navarco, prefeito da frota, jarl do mar…), **esporões de bronze** que abalroam, **abordagem** (o corvo romano, ganchos e machados nórdicos) que toma o navio inimigo, **brulotes** em chamas lançados contra frotas maiores e **bloqueio de portos**: nenhum barco de pesca ou mercante sai nem entra.

## O mar

- **Portos**, **barcos de pesca** atrás de cardumes, **exploradores** que descobrem povos distantes, **navios mercantes** em rotas marítimas.
- **Frotas de guerra** que combatem no mar, **invasões anfíbias** (os nórdicos adoram) e **colônias** em outras ilhas.
- O mapa **Mar Aberto** separa cada povo em sua ilha: só a navegação os une.

## Povos, reinos e guerras

- **Vários povos** começam em cantos distantes do mapa, cada um com cor, bandeira, estoque, território (fronteiras desenhadas no chão) e era próprios. Quando se encontram, a história começa.
- **Líderes com personalidade**: cada governante tem agressividade, crueldade, devoção e ambição. Títulos e numerais dinásticos (*Rainha Mara II*), epítetos conquistados em vida (*o Conquistador*, *a Pia*, *o Sanguinário*, *a Libertadora*, *o Breve*…) e uma coroa na cabeça.
- **Governos que mudam**: Tribo → Chefia → Reino; Teocracia sob líderes devotos; **Tirania** sob líderes cruéis ou usurpadores; **Conselho** depois de uma revolução; **Povo Livre** fundado por ex-cativos.
- **Lealdade e rachas**: cada vila tem lealdade (distância da capital, fome, guerra, tirania, conquista recente, orgulho local). Vilas infelizes declaram **independência** e viram povos novos. Na morte de um rei, um nobre ambicioso pode recusar o herdeiro: **guerra de sucessão**.
- **Golpes e revoluções**: ambiciosos conspiram e tentam matar o governante; tiranos executam em praça pública (todos assistem, o medo cresce); o povo pode se levantar e derrubar o tirano.
- **Diplomacia visível**: primeiro contato, emissários que caminham até a capital vizinha com presentes, propostas de paz ou de aliança (e às vezes são executados), caravanas de comércio, casamentos entre povos e **casamentos reais**, tréguas, tributos e **vassalagem**. Aliados entram nas guerras uns dos outros.
- **Guerra**: guerreiros com escudo na cor do povo, quartéis, torres de vigia com arqueiros. Exércitos se reúnem, marcham com porta-estandarte e atacam para **saquear**, **fazer cativos**, **conquistar** vilas ou — sob líderes cruéis — **massacrar** e incendiar. Defensores lutam, crianças e idosos se escondem em casa. Batalhas viram relatos na crônica; heróis ganham fama.
- **Cercos**: cidades grandes erguem **muralhas** (madeira, depois pedra) com portões que se fecham quando o inimigo chega e **arqueiros** nas ameias; os atacantes trazem **aríetes** e **catapultas**, abrem brechas e invadem.
- **Cativos**: levados amarrados, fazem trabalho forçado (inclusive nas obras do tirano), dormem no **cercado**, rezam por liberdade, fogem à noite, são recapturados, se revoltam — e às vezes fundam um povo livre. Líderes clementes os aceitam como membros com o tempo; conselhos abolem o cativeiro.
- **Queda de povos**: capitais são tomadas, povos inteiros deixam de existir; os últimos sobreviventes se juntam a vizinhos ou se rendem.

## Poderes divinos

Os poderes ficam em sete abas (`Tab` troca). Poderes marcados com ✦ abrem uma escolha antes de agir.

| Aba | Poder | Custo | Efeito |
|---|---|---|---|
| Dádivas | Chuva | 10 | Rega, apaga incêndios, encerra secas |
| Dádivas | Crescimento | 14 | Árvores, frutos e trigo crescem na hora |
| Dádivas | Cura | 12 | Cura feridos e doentes |
| Dádivas | Fertilidade | 30 | Dois dias de colheitas e nascimentos abundantes |
| Dádivas | Era de Ouro | 110 | Três dias de prosperidade para um povo: colheita, obras, comércio, pesquisa, lealdade |
| Dádivas | Mão Divina | grátis | Pegue alguém, solte ou arremesse (assusta) |
| Ira | Raio | 18 | Mata, fere, incendeia — tiranos também sangram |
| Ira | Meteoro | 70 | Sombra crescente, pânico, impacto, cratera — e pedra de presente |
| Ira | Matilha | 22 | Invoca lobos famintos |
| Ira | Terremoto | 55 | Construções racham e desabam, árvores tombam, pedras brotam |
| Ira | Praga | 32 | Uma doença muito contagiosa nasce no ponto escolhido |
| Ira | Maldição | 45 | Dois dias de colheitas murchas, poucos nascimentos, pesca ruim e lealdade em queda |
| Terra | Erguer Terra | 40 | Ilhas novas, pontes de terra entre povos isolados, colinas |
| Terra | Afundar Terra | 60 | O mar invade: separe continentes ou engula parte de uma cidade |
| Terra | Floresta Sagrada | 24 | Uma floresta densa, com frutos e cervos |
| Terra | Veio de Pedra | 28 | Chão rochoso e rochedos cheios de pedra |
| Terra | Abrir Gruta | 34 | Uma caverna se abre sob a colina: galerias, salões, um rio no escuro — e algo que brilha no fundo |
| Terra | Desabamento | 45 | O teto de uma caverna desaba: soterra bandidos, ursos, tesouros e túmulos |
| Terra | Vulcão | 120 | Uma montanha nasce e explode: bombas e rios de lava, cinzas, terra fértil depois — e pode despertar de novo |
| Mar | Cardume | 8 | Um cardume enorme para os pescadores |
| Mar | Ventos Favoráveis | 20 | Navios na área andam muito mais rápido por dois dias |
| Mar | Tempestade | 45 | Ondas, raios e navios quebrados |
| Mar | Maremoto | 90 | Uma onda gigante corre até a costa mais próxima e varre tudo |
| Mar | Kraken | 70 | O monstro caça navios até ser morto pelas frotas ou voltar ao fundo |
| Natureza | Chamar Animais ✦ | 16 | Um bando da espécie que você escolher, dentre as que vivem ali |
| Natureza | Primavera Sagrada | 24 | Capim alto, arbustos carregados, flores — e os animais da área dão cria na hora |
| Natureza | Grande Migração ✦ | 30 | Os rebanhos de uma espécie atravessam o mapa até o ponto escolhido; os predadores vão atrás |
| Natureza | Domar Fera | 35 | Um predador vira guardião da cidade mais próxima: ataca feras e inimigos, usa coleira na cor do povo |
| Natureza | Mudar o Clima ✦ | 50 | Neve eterna, taiga, bosque, pântano, selva, savana ou deserto: o chão, as árvores e os animais mudam junto |
| Natureza | Gafanhotos | 38 | Uma nuvem voa até as plantações mais próximas e devora colheitas, capim e frutos |
| Natureza | Fera Lendária | 85 | Um predador gigante típico daquela terra desperta, com nome e epíteto, para caçar gente |
| Palavra | Profecia ✦ | 35 | Anuncie a queda, a grandeza, a morte do governante, a guerra ou a paz de uma cidade; se acontecer, a fé explode |
| Palavra | Mandamento ✦ | 50 | Uma lei divina para um povo: *Não matarás*, *Crescei e multiplicai-vos*, *Trabalharás*, *Honrarás teu deus*, *Buscarás o saber*, *Guerra santa* |
| Palavra | Inspiração ✦ | 60 | Revele a tecnologia que quiser a um povo |
| Palavra | Sinal nos Céus ✦ | 30 | Cometa, eclipse, aurora ou chuva de estrelas — cada povo interpreta à sua maneira |
| Palavra | Visão | 25 | Um adulto vira profeta: prega, espalha fé e às vezes revela povos distantes |
| Destino | Ungir | 45 | Quem você tocar passa a governar seu povo; um cativo ungido lidera a fuga dos outros |
| Destino | Herói | 55 | Um campeão escolhido pelos céus: luta como dez e nunca foge |
| Destino | Libertação | 30 | Quebra as correntes dos cativos e salva condenados da execução |
| Destino | Fúria | 35 | Força redobrada na área — e o povo atingido parte para a guerra |
| Destino | Discórdia | 40 | A lealdade de uma vila despenca e os vizinhos passam a se odiar |
| Destino | Muralha Divina | 65 | Muralhas de pedra erguem-se numa noite ao redor de uma cidade |
| Destino | Paz Divina | 80 | Encerra todas as guerras; ninguém declara guerra por dois dias e meio |

**Preces**: em momentos difíceis (seca, incêndio, doença, fome, lobos, invasores, cativeiro, tirania) a vila reza pedindo algo específico. Um aviso dourado aparece sobre a barra de poderes — clique nele para ir até lá com o poder certo selecionado. Atender faz a devoção disparar; ignorar custa devoção.

**Fé** é o recurso dos poderes. Ela nasce da **devoção** (quando você ajuda) e do **medo** (quando você castiga). Medo também rende fé, mas deixa o povo lento e menos fértil — e quem perde parentes para a sua fúria perde a devoção. O painel inferior mostra como eles te enxergam: *Um mistério*, *Protetor*, *Deus amado*, *Deus temido*, *Tirano divino*…

## O céu e os sons

- **Clima bonito**: **névoa** nos baixios, nos rios e nos pântanos ao amanhecer (e depois da chuva); **raios de sol** atravessando a tela nas horas douradas; o céu fica rosado e alaranjado no nascer e no pôr do sol; **sombras de nuvens** deslizam sobre os campos com o vento; **arco-íris** quando uma chuva de verdade passa; **vaga-lumes** nas noites quentes, perto de árvores e da água; **folhas** arrancadas pelo vento; **redemoinhos de poeira** no deserto e na savana ao meio-dia; **relâmpagos** iluminando o céu dentro das tempestades.
- **Som ambiente pelo lugar**: o jogo escuta o que a câmera está mostrando. Na costa, **ondas** quebrando e **gaivotas**; no rio, **água correndo**; na mata, **folhas** ao vento e **pássaros** (vários cantos); na cidade, o **murmúrio** das pessoas (mais forte com a feira cheia), o **martelo da forja**, **cães** e **galinhas**; à noite, **corujas**, **sapos** e grilos; no frio e no deserto, **vento**; numa batalha, o **estrondo** e o **clangor** das armas. Longe (zoom aberto) tudo fica mais baixo e mais misturado.

## Modo foto

Aperte `P` (ou o ícone da máquina fotográfica): o mundo **congela**, a interface some e a câmera continua livre para enquadrar. Uma pequena barra oferece filtros (**Dourado, Sépia, Preto e branco, Vivo, Luar**), **Miniatura** (tilt-shift: o alto e o baixo desfocados, como uma maquete), **Vinheta**, **Moldura** com o nome do lugar, do mundo e o dia, **Nomes** das cidades e a **hora do dia** da foto. **Capturar** salva um PNG exatamente como está na tela (e mostra a foto, para salvar com o botão direito onde o download for bloqueado). `Esc` ou `P` saem e o mundo volta a andar na velocidade em que estava.

## Modo cinema

Aperte `C` (ou o ícone da câmera) e solte o mundo: a interface some atrás de faixas pretas e uma **câmera diretora** passa a filmar sozinha. A cada segundo ela pesa tudo o que está acontecendo de verdade no mundo e vai atrás do que vale mais a pena:

- **batalhas campais** (filmadas entre os dois exércitos), assaltos, cercos, guerrilhas, exércitos em marcha — e, numa batalha longa, um segundo olhar de perto no general;
- **festividades** no momento certo (a procissão segue quem carrega o peplo ou a barca; a subida da pirâmide segue a vítima) — e nunca chegando para o último minuto;
- **batalhas navais**, brulotes, navios em chamas, frotas de invasão e desembarques;
- **histórias ao pé do fogo**, **famílias à porta** no fim da tarde, a **fila do poço**, o **campo dos mortos** depois de uma batalha e a **pira** queimando, e o **arco-íris** quando a chuva passa;
- o que acabou de entrar na **crônica**: um nascimento, uma morte, uma nova aldeia, uma maravilha, um golpe, um meteoro;
- **incêndios**, com quantas pessoas estão lutando contra o fogo;
- a **vida comum**: uma criança brincando, um casal namorando, um pastor, um ferreiro, um cobrador de impostos — com um halo suave sob os pés de quem a legenda fala;
- **caçadas** da vida selvagem, a **feira**, uma **prece** pedindo sua ajuda e planos gerais das cidades ao amanhecer, ao entardecer e à noite.

Perto, a câmera desliza; longe, corta pelo preto. Enquanto fica numa cena ela se aproxima ou se afasta devagar, e uma legenda diz onde estamos, o que se vê e quem é quem. Ela evita repetir cenas e tipos de cena, mas volta mais cedo às grandes (uma batalha, um cerco). `N` pula para a próxima cena; `Espaço` e `+`/`-` continuam pausando e mudando a velocidade; mexer a câmera (arrastar, roda, `WASD`) assume o controle e o diretor volta sozinho depois de alguns segundos. `Esc`, `C` ou um clique encerram o filme.

## O Livro do Mundo

Cada mundo nasce com **nome**, **mito da criação**, **lendas de origem** de cada povo (com seu deus e seu símbolo) e **duas profecias antigas** — que se cumprem quando o mundo, ou você, as faz acontecer. Depois o livro se escreve sozinho:

- **Crônicas**: um capítulo a cada sete anos, com título e tom escolhidos pelo que dominou o período (*O Tempo das Espadas*, *A Era das Velas*, *Os Anos de Cinza*…), contado pelos cronistas do maior povo, com os fatos reais: guerras, conquistas, rachas, cidades, descobertas, nascimentos, mortes e intervenções divinas.
- **Lendas**: heróis e profetas (com o fim de cada um), vulcões e seus mortos, o Kraken, feras devoradoras de gente e feras lendárias, guardiões domados, invernos sem fim e desertos que surgiram, pragas de gafanhotos, cidades afogadas, ilhas que subiram do mar, maravilhas, megalópoles, eras de ouro, profecias cumpridas.
- **Cavernas**: cada caverna do mundo, quem a descobriu, as pinturas das paredes, os túmulos, o oráculo e o que ele disse, os bandidos que passaram por lá — com um botão para ver o interior.
- **Bestiário**: todas as espécies do mundo em níveis da cadeia alimentar, com população, tendência, nascimentos, mortes por causa (fome, velhice, caçadores, cada predador) e extinções. Clique numa espécie para destacar o que ela come e quem a caça.
- **Povos** e **Profecias**: a história de cada povo e o destino de cada palavra dita.

## Estrutura do código

```
index.html        HUD, menus e ordem dos scripts
css/style.css     interface
js/util.js        RNG, ruído, heap, nomes
js/civs.js        civilizações: nomes, traços, governos, unidades, tecnologias
js/world.js       estado, geração dos mapas (ilha, continente, arquipélago, istmo), pathfinding A* (subir custa, paredões barram)
js/relief.js      relevo: cordilheiras, colinas, planaltos e mesas, falésias, bacias, erosão, rios que descem, lagos, cachoeiras, passos, nomes dos lugares
js/biomes.js      clima, biomas, árvores e chão de cada bioma
js/nature.js      árvores, arbustos, rochas, fogo, clima, nuvens
js/village.js     construções, planejador, empregos, moradia, crônica, marcos, fé
js/factions.js    povos: cores, bandeiras, estoques, território e fronteiras
js/politics.js    líderes, dinastias, governos, lealdade, rachas, golpes, tirania, diplomacia
js/war.js         exércitos, combate, saques, conquista, massacres, torres, cativos, revoltas
js/city.js        níveis de cidade, novos edifícios, ruas, estradas, rotas, carroças, aquedutos
js/naval.js       portos, pesca, exploração, comércio marítimo, frotas com almirante, abordagem, brulotes, bloqueios, invasões, colônias
js/siege.js       arqueiros, tropas de elite, muralhas, portões, aríetes, catapultas, torres de cerco, escadas, sapadores, óleo fervente, peste, sacrifícios
js/economy.js     economia urbana: ofícios, currais, minas, forja, tecelagem, mercados, feira, taverna, impostos, crime
js/festivals.js   calendário de festas de cada civilização: procissões, ritos, jogos, sacrifícios, o Fogo Novo
js/life.js        biografia viva, família no fim da tarde, histórias dos velhos, aprendizes, água e filas, fileiras e chamada ao trabalho
js/carnage.js     guerra que pesa: sangue, membros decepados, corpos que apodrecem, coveiros, piras, a doença dos mortos
js/army.js        exércitos: recrutamento, companhias, oficiais, formações, moral, planos de ataque e de defesa, cercos
js/villagers.js   IA dos habitantes (necessidades, decisões, tarefas)
js/pets.js        animais da cidade: cães, gatos, galinhas e pombos
js/animals.js     40 espécies, habitats, capim, cadeias alimentares, caça, filhotes, migrações, guardiões
js/powers.js      poderes divinos e percepção
js/miracles.js    Terra, Mar, Palavra, eras de ouro, maldições, heróis, muralhas divinas
js/wild.js        aba Natureza: chamar animais, primavera, migração, domar, clima, gafanhotos, feras lendárias
js/caves.js       a camada de baixo: cavernas, galerias, rios e lagos subterrâneos, veios, bichos do escuro, morcegos, ursos, pinturas, tumbas reais, oráculo, refúgio, minas, bandidos, poderes Abrir Gruta e Desabamento
js/lore.js        gênese, profecias antigas, crônicas, lendas, bestiário e o Livro do Mundo
js/events.js      eventos e viajantes de barco
js/fx.js          partículas e efeitos
js/art.js         arte procedural (sprites e vetores)
js/fauna-art.js   o desenho de cada espécie
js/arch.js        arquitetura de cada civilização
js/sky.js         névoa, raios de sol, arco-íris, sombras de nuvens, vaga-lumes, folhas, redemoinhos, relâmpagos
js/cityart.js     oficinas, currais, feira, minas e veios no estilo de cada civilização
js/cave-art.js    arte das cavernas: estalagmites, colunas, cristais, vaga-lumes, pinturas rupestres, tumbas de cada povo, oráculo, acampamento, bichos, morcegos, bocas
js/render.js      renderizador isométrico (terreno em blocos com nível de detalhe, quatro vistas, montanhas que escondem), rocha em camadas, cachoeiras e correnteza, iluminação, clima
js/minimap.js     minimapa com fronteiras e cidades
js/audio.js       áudio sintetizado com WebAudio (efeitos, som ambiente conforme o lugar, música)
js/save.js        salvar / carregar
js/ui.js          interface
js/cinema.js      modo cinema: o diretor que escolhe as cenas, a câmera, as legendas
js/photo.js       modo foto: congelar, filtros, miniatura, moldura, salvar PNG
js/timeskip.js    avançar no tempo: anos que passam sem desenhar, mapa em time-lapse, anos de paz e fartura, resumo
js/main.js        loop, input, câmera, menu, introdução
```
