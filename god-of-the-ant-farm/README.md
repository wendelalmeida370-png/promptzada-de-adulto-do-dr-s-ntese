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
| Trocar aba de poderes | `Tab` (Dádivas · Ira · Terra · Mar · Natureza · Cidade · Palavra · Destino · Além) |
| Minimapa | `M` · ou o ícone do mapa no topo (clique/arraste nele para voar até lá) |
| Ver o subterrâneo | `U` · ou o ícone da caverna no topo · ou “Ver o interior” ao tocar a boca de uma caverna |
| O Livro do Mundo | `L` · ou o ícone do livro no topo |
| Histórias | `K` · ou o ícone da pena no topo |
| Painel dos reinos | `R` · ou clique no chip do povo no topo |
| Mostrar/ocultar fronteiras | `B` |
| Ver a cidade por bairros | `V` (bairros pela vocação · de novo: o valor da terra · de novo: desliga) · clique no **nome de uma cidade** para o painel da cidade, no **nome de um bairro** para o painel do bairro |
| Cancelar poder | botão direito · `Esc` |
| Pausar | `Espaço` |
| Velocidade | botões 1x / 2x / 4x / **8x** / **16x** · `+` / `-` (em mundos muito grandes, o 16x mostra a velocidade real que o computador consegue manter) |
| Avançar no tempo | `J` · ou o botão ⏭ ao lado das velocidades — pula anos de história (veja abaixo) |
| Crônica | `H` · ou o ícone do pergaminho no topo (no celular, ela sobe por baixo da tela; toque de novo ou no ✕ para fechar) |
| Árvore genealógica | `T` (com alguém selecionado) |
| Modo cinema | `C` · ou o ícone da câmera no topo — `N` próxima cena · `Esc` sai · um clique sai e seleciona o que você tocou |
| Câmera de guerra | `G` · ou o ícone da espada no topo (só aparece enquanto há exércitos em campo) · ou **Assistir** no alerta de batalha — escolha uma frente para seguir só aquela batalha |
| Guerras | `X` · ou **Guerras** no painel Reinos — causas, tensões, exércitos, batalhas, cercos, com **Ir até** |
| O mar | `O` · ou o ícone da bússola no topo — expedições (com o livro da viagem e o rastro no mapa), frotas e batalhas no mar, e o que cada povo sabe do mundo |
| Modo foto | `P` · ou o ícone da máquina fotográfica — `Esc` sai |
| Modo desenvolvedor | `F2` · ou **Modo desenvolvedor** no menu (`Esc`) · ou `?dev` no fim do endereço — veja abaixo |
| Menu | `Esc` |

## O que acontece na ilha

- **Habitantes autônomos** com nome, idade, personalidade (corajoso, curioso, devoto, romântico…), fome, energia, vida, devoção e medo. Uma *utility AI* escolhe o que fazer a cada momento: trabalhar, comer, dormir, socializar, cortejar, rezar, explorar — e emergências (fogo, meteoros, lobos) passam na frente de tudo.
- **Trabalho real**: lenhadores derrubam árvores e carregam a madeira, coletores colhem frutas, pescam e caçam, agricultores plantam e colhem trigo, mineiros quebram pedra, construtores buscam material no armazém e erguem as obras em etapas visíveis (fundação → estrutura → pronto). Os números da interface são o estoque real.
- **Trilhas emergentes**: os caminhos mais usados viram estradas de terra.
- **Famílias**: casais se formam, bebês nascem (as camponesas levam o bebê amarrado às costas para o trabalho; quem vai à guerra, à caça ou à patrulha deixa o bebê em casa com alguém), crianças brincam e crescem, idosos morrem. Cemitérios, luto, funerais e árvore genealógica.
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

O relevo muda a vida: subir custa caro (os caminhos contornam as montanhas e procuram os passos), encostas deixam todos mais lentos, **paredões não se escalam**, ninguém constrói em penhasco, o alto é frio (a neve e a taiga sobem as encostas) e menos fértil, o minério está nas terras altas — e na guerra, **quem está no alto bate mais forte**. Os bichos também leem o terreno: escolhem destinos aonde dá para chegar, **dão a volta** num paredão, num muro ou num lago em vez de ficar empurrando a parede, e desistem de uma presa do outro lado do penhasco.

**A câmera gira livre**, de forma contínua: **dois dedos girando** na tela do celular (a pinça continua dando zoom), o **botão do meio** do mouse ou `Shift` + arrastar no PC, ou arrastando a agulha da bússola. Enquanto gira, o mundo é desenhado no ângulo do momento — o relevo de verdade, as casas inteiras, com telhado, varanda e todos os detalhes (na metade do giro o desenho de um lado se funde suavemente com o do outro; de muito longe viram volumes nas cores do seu povo), árvores, gente e bichos de pé —; ao soltar, ele **assenta suavemente** no lado mais próximo (um giro rápido leva ao lado seguinte), onde volta o desenho completo. `Q`/`E` dão um quarto de volta suave. São quatro lados de descanso, com as construções, as pessoas e os animais virados para o lado certo. **Montanhas escondem** o que está atrás delas — quem você selecionou continua visível como um fantasma através da rocha.

## Cavernas: o mundo de baixo

Debaixo do mundo inteiro há uma **camada subterrânea**. Nos morros e serras a água cavou **galerias** e **salões**, com **rios subterrâneos**, **lagos negros**, **estalagmites**, **colunas**, **grutas de cristal**, **vaga-lumes de caverna** pendurados do teto, cogumelos que brilham, ossos e **fósseis**. Nas paredes aparecem **veios de minério** — cobre, estanho, ferro, ouro, sal-gema e gemas.

**As bocas nascem da geografia** — cada caverna escolhe onde se abrir, e a forma vem do lugar:
- **Paredão**: uma boca larga cortada numa parede de montanha ou falésia, com a rocha subindo acima dela;
- **Abrigo sob a rocha**: um beiral de pedra na encosta, com a sombra embaixo;
- **Dolina**: no chão plano, o terreno afundou num buraco redondo de pedra;
- **Fenda**: uma rachadura estreita entre pedrões, no meio do pedregal;
- **Poço**: um buraco que desce reto para o escuro.

A pedra tem a cor do bioma (calcário no temperado, gelo azul na neve, arenito vermelho no deserto e na savana, pedra úmida com musgo no pântano e na selva, basalto escuro na taiga), e em volta crescem tufos, cipós ou neve. Quando um rio subterrâneo passa pela caverna, a boca mais baixa vira **nascente**: a água sai da pedra. Nas manhãs frias a caverna **respira** — um bafo de névoa sai da boca.

**Dentro, o chão não é plano**: as galerias descem conforme entram, os salões têm **beirais** junto das paredes e **bacias** no meio, os lagos ficam no fundo, e às vezes uma **fenda sem fundo** corta o caminho. As paredes mostram as **camadas da rocha** (os estratos), as poças brilham, raios de luz descem das bocas com poeira dançando, gotas caem do teto. Clique em qualquer coisa lá dentro — uma estalagmite, um cristal, o lago, o abismo, a aranha, o urso dormindo — e o painel conta o que é.

**A vista de dentro**: o botão da caverna no topo (ou `U`) mostra o mundo de baixo — a rocha cortada rente ao teto das cavernas, com as paredes de trás inteiras e as da frente rebaixadas, para nada ficar escondido. Lá é escuro: o que ilumina é a **luz do dia caindo pelas bocas**, as **tochas** de quem entra, a **fogueira dos bandidos**, os vaga-lumes e os cristais. Dá para girar, dar zoom, clicar nas pessoas e nas cavernas. O som muda: gotas pingando e o zumbido da rocha.

**Quem vive no escuro**: **morcegos** (saem ao entardecer numa fita negra que sobe da boca da caverna, caçam insetos à noite, voltam antes do amanhecer — e o **guano** deles vira adubo para as roças), **ursos** que passam a noite (o inverno) dormindo no fundo e às vezes saem com um filhote, **aranhas**, **grilos-das-cavernas**, **salamandras cegas** e **peixes cegos** nos lagos.

**O que os povos fazem com elas** — tudo acontece de verdade, com gente andando lá dentro de tocha na mão:
- **Descobrem**: quem passa perto de uma boca entra e explora; às vezes acha um **tesouro** esquecido (um geodo de ametista, um ídolo de ouro, moedas que ninguém sabe cunhar, a ossada de uma fera gigante) — e nasce uma lenda.
- **Pintam a própria história** nas paredes: guerras, reis, sinais do deus, feras, naufrágios — com mãos de ocre em volta. As pinturas aparecem nas paredes (gire para ver as que estão de costas), ficam na ficha da caverna e no Livro, e os **idosos contam o que está pintado** às crianças.
- **Enterram os reis**: quando um governante morre, o cortejo desce com tochas até a **tumba**, feita no jeito de cada povo — sarcófago pintado com máscara de ouro, urna de bronze, sarcófago de mármore, barco de pedras com a espada, altar com máscara de jade — com o ouro do tesouro.
- **Ouvem o oráculo**: num povo devoto alguém começa a ouvir vozes na gruta; todo dia sobe com a fumaça, **profetiza** (guerra, paz, uma coroa que cai, fome, fartura, a mão do deus) e os **peregrinos** vêm de longe. Profecia cumprida vira lenda; profecia falha derruba a fé na gruta.
- **Se escondem da guerra**: quando a cidade é atacada, crianças, velhos e mães com bebês correm para a caverna e só saem quando o perigo passa.
- **Mineram**: mineiros descem até os veios e voltam carregados de minério, ouro, gemas ou sal; quando o veio acaba, a galeria cavada fica — e outros veios aparecem mais fundo.
- **As minas são galerias de verdade**: o poço de cada mina (de ferro, de ouro…) desce para uma rede de túneis debaixo do morro, que vai crescendo com o trabalho. O mineiro desce com a tocha, cava a frente do veio e sobe carregado; quando a galeria encontra uma caverna natural, as duas se ligam. Na ficha da mina, **Ver as galerias** mostra os túneis por dentro, e o veio se esgota de verdade.

**Momentos que acontecem sozinhos** (ninguém manda, é o mundo):
- Numa **tempestade**, os bichos de fora correm para a caverna mais perto — e lá dentro **caça e caçador fazem trégua**, cada um no seu canto, até o céu abrir.
- As **crianças desafiam umas às outras** a entrar na caverna: vão até a boca, gritam para ouvir o **eco**, uma entra mais fundo — e saem correndo e rindo. Fica na biografia.
- Depois de uma batalha, uma criança pode se esconder lá dentro; ao amanhecer, os **morcegos** voltam aos milhares; ao entardecer e ao amanhecer, **andorinhões** rodopiam diante dos paredões.
- **Bandidos** fazem de uma caverna afastada o seu esconderijo: à noite saem em fila, assaltam a vila mais próxima e voltam com o butim; saqueiam túmulos de reis; até que o povo roubado manda guerreiros entrarem com tochas para acabar com eles.

No **Novo mundo** escolha **Cavernas**: nenhuma, poucas, normais ou muitas. No Livro do Mundo, a aba **Cavernas** conta a história de cada uma, com um botão para ver o interior. Os poderes **Abrir Gruta** e **Desabamento** (aba Terra) criam uma caverna nova sob uma colina ou derrubam o teto de uma — com quem estiver dentro.

## Avançar no tempo

O botão ⏭ (ou `J`) abre **Avançar no tempo**: o mundo vive sozinho e depressa — de verdade, cada nascimento, obra e batalha acontece —, só que sem desenhar nada. Você vê os anos passarem num mapa do mundo inteiro (reinos, estradas, cidades crescendo, batalhas acendendo em vermelho), com os contadores e as grandes notícias da crônica, e pode **parar quando quiser** (`Esc`). No fim, um resumo do que aconteceu.

- **Até quando**: 10, 25 ou 50 anos · até a primeira cidade · até a primeira metrópole · até a primeira megalópole · até a próxima guerra.
- **Como passam os anos**: **anos de paz e fartura** (a sua bênção: nenhuma guerra começa, colheitas e obras andam mais rápido, pedreiras e matas rendem o dobro, o saber avança mais depressa e os berços se enchem; celeiros cheios mandam metade dos lavradores para as pedreiras — os povos crescem até virar impérios, e quando a bênção acaba eles voltam a se olhar como rivais) ou **deixar o mundo seguir** (guerras, pestes e fomes vêm quando vierem).
- No **Novo Mundo**, "Começar" faz o mesmo antes de você chegar: 30 anos depois, na era das cidades ou na era dos impérios.
- Durante o salto o mundo vive em **dois ritmos**: as pessoas, as lutas, os exércitos, os navios e o fogo em meios passos; os bichos, as plantas, o planejamento das cidades, a política e a economia em passos inteiros. Bichos longe de qualquer pessoa e quem está dormindo vivem a cada dois passos (com o tempo somado); as contagens (gente de um povo, de uma vila) são feitas uma vez por passo. Nada é inventado — só fica mais barato o que ninguém está vendo.

### Mundos prontos

**Mundos prontos** (no menu principal, no menu do jogo e na tela do Avançar no tempo) abre na hora mundos que o próprio jogo já viveu, ano por ano, com as mesmas regras: **a primeira cidade**, **a primeira metrópole**, **a primeira megalópole**, **a guerra mundial** (no momento em que o mundo se parte em blocos) e o mesmo mundo depois de **100**, **500** e **1000 anos**. Cada um vem com o ano, a gente, os povos e a maior cidade escritos no cartão. Abrir um mundo pronto é como carregar um save: ele passa a ser o seu mundo salvo (o anterior é substituído).

### A memória dos mortos

O mundo lembra seus mortos por três gerações. Depois de 80 anos, um nome some do registro — a menos que alguém vivo o chame de pai, mãe ou avô, ou que ele tenha importado: governantes, heróis, quem ganhou um apelido, os grandes guerreiros. Os cemitérios guardam doze túmulos; quando uma cidade já tem os cemitérios que o seu tamanho pede, o mais antigo é reaproveitado e os ossos vão para o **ossuário**. Assim um mundo de mil anos não carrega dezenas de milhares de estranhos nem vira um campo de cemitérios.

Mundos grandes (mais de mil e poucas almas) são salvos **comprimidos** no navegador — cabem dez vezes mais, e o jogo só para um instante.

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

- **Mais de 70 espécies** na terra (de tigres, leopardos-das-neves, rinocerontes, búfalos, bisões, gnus, alces, cabras-montesas, castores, lontras, preguiças, avestruzes e sucuris a cervos, lobos e elefantes), no mar (golfinhos, focas, morsas, baleias, tubarões, orcas, tartarugas) e no céu (gaivotas, águias, abutres, corvos, araras, tucanos, corujas, cegonhas, gansos-selvagens, garças, flamingos).
- **Plantas → herbívoros → predadores → predadores de topo.** O capim cresce em cada pedaço de chão e é pastado; herbívoros comem capim, folhas e frutos; predadores caçam herbívoros; urso, leão, onça, crocodilo, tubarão, orca e águia estão no topo. Carniceiros (hienas, abutres, corvos) limpam as carcaças, e a carniça aduba o chão de novo.
- Cada espécie tem **habitat**, **fome**, **idade**, **filhotes** e um **limite** que a terra aguenta. Se os lobos somem, os cervos explodem — e depois passam fome. Espécies extintas podem voltar, aos poucos, vindas de terras distantes.
- Predadores perseguem, emboscam (onças, jiboias e crocodilos ficam de tocaia), e os mais ousados atacam gente sozinha — um bicho que mata duas pessoas ganha nome e vira lenda.
- Os caçadores caçam o que existe por perto; os pescadores disputam os cardumes com as focas e as garças.
- Clique num animal para ver o que ele come, quem o caça, onde vive e quantas vítimas fez. O **Bestiário** (no Livro do Mundo) mostra a teia alimentar inteira com as populações reais e sua história.

### Bichos que pensam, raros que valem uma fortuna, migrações e ninhos

- **Comportamento de verdade**: os grandes felinos se agacham e se esgueiram rente ao capim antes do **bote**; lobos e leões **cercam pelos flancos** para a presa correr para a boca do líder; o leopardo **sobe a caça na árvore**; o crocodilo **arrasta para o fundo** e gira; a sucuri **enrola e aperta**. A presa se debate, há sangue e carne voando, os carniceiros chegam depois. **Macacos** vivem em bando no alto das árvores — comem, se catam, vigiam — e passam de uma copa para outra **balançando num cipó**. Elefantes **velam os seus mortos**.
- **Raros**: de vez em quando nasce um bicho de pelagem rara — o **tigre branco**, a **pantera-negra**, o leão branco, o elefante branco, o cervo branco, o lobo negro. É uma visão, uma lenda e uma fortuna: os caçadores largam tudo para ir atrás, e quem traz a pele vira assunto da cidade inteira.
- **Migrações com motivo**: na savana, **gnus, zebras e gazelas** deixam o pasto que comeram até o chão (mais cedo na seca) e vão atrás do capim mais verde, **atravessando os rios** onde os **crocodilos** os esperam no vau — com **leões e hienas** no rastro. Os **bisões** seguem o capim das planícies. Todo ano as **renas** sobem para a tundra para dar cria e descem de volta para o abrigo da taiga, com os lobos atrás. **Gansos e cegonhas** voam em **formação de V** entre o frio e os brejos quentes. E no fim de cada verão os **salmões sobem os rios frios** saltando nas cachoeiras — onde os **ursos** ficam de pé na água pescando.
- **Ninhos**: papagaios, corvos, garças, tucanos e corujas nas árvores grandes; **cegonhas no telhado** das casas (e casa com cegonha, dizem, terá filho — e de fato um pouco mais); águias e gaivotas nos paredões; gansos e pinguins no chão (raposas e corvos roubam os ovos). Primeiro os gravetos, depois os ovos, um dos pais chocando, os filhotes de bico aberto — e um dia eles voam. O povo para na rua para olhar, e as crianças passam horas de pescoço esticado. Os **castores** roem as árvores da beira de um riacho, fazem uma **represa** e constroem a toca na água parada.

## Riquezas da terra, dos bichos e do mar

Além de pão e madeira, o mundo dá **25 riquezas**, cada uma com seu preço, sua região e quem a deseja:

| De onde vem | Riquezas |
|---|---|
| **Bichos** | **marfim** (elefantes), **peles** (lobos, ursos, raposas, felinos), **pele rara** (vale mais que uma casa), **couro exótico** (cobras e crocodilos), **chifre** de rinoceronte, **plumas** (avestruzes, araras), **óleo de baleia**, **carne-seca**, **queijo** |
| **Plantas** | **mel** e **cera**, **seda**, **cacau**, **café**, **especiarias**, **azeite**, **vinho**, **tâmaras**, **incenso** |
| **Mar e rios** | **sal**, **bacalhau**, **atum**, **camarão**, **pérolas**, **coral** |

- **O caçador esfola** a caça onde ela caiu e volta com a carne num ombro e a pele (ou as presas, ou as plumas) no outro; a primeira vez que um povo traz marfim ou plumas, a crônica registra. Na feira se vê o que a cidade tem: presuntos pendurados, cervo, o peixe do dia, queijos, jarros de azeite e vinho, sacos de café.
- **Frutas na árvore**: maçãs, azeitonas e amoras nas matas temperadas; **banana, cacau, café, pimenta e açaí** na selva; **tâmaras e olíbano** onde o deserto encontra a água. O fruto amadurece no galho (e aparece lá), macacos, pássaros e ursos comem, gente sobe e enche o cesto. **Abelhas** penduram favos nas árvores velhas perto das flores; o mel é tirado com fumaça — e um urso também sabe tirá-lo.
- As casas ricas querem o que é raro; cidades com fome comem as reservas salgadas e secas.

### Propriedades: pomares, plantações, vinhedos, apiários, salinas e seda

- Cada povo planta **só o que cresce ali e o que conhece**: das árvores selvagens por perto, dos próprios costumes ou do que as caravanas trouxeram. **Pomares** (maçã, oliva, tâmara, banana, açaí, amora), **plantações** de cacau, café, pimenta e olíbano, **vinhedos** com a tina onde se pisa a uva, **apiários** de colmeias, **salinas** na beira do mar (o salineiro rasteleia o sal em montes), a **casa da seda** (as lagartas comem folha de amoreira e o fio é desenrolado do casulo — um povo pode **descobrir a seda**) e o **pátio da salga**, onde o peixe vira bacalhau seco.
- Cada uma tem seus ofícios — fruticultor, lavrador, vinhateiro, apicultor, salineiro, sericultor, salgador — e suas animações: colher no galho, defumar a colmeia, pisar a uva, girar a prensa, rastelar o sal, desenrolar a seda, salgar o peixe. Cativos são mandados para as plantações e as salinas.
- **As roças mudam com a terra**: trigal, cevada, **arrozal** alagado, **milharal**, sorgo.

### O palácio, o cobrador e a taverna

- **Cada governante tem a sua vaidade**: um chefe modesto mora numa casa só um pouco maior que as outras (o **paço**); um rei orgulhoso ergue um **palácio**; um vaidoso, um **grande palácio** com alas e jardins; e o mais vaidoso de todos quer o **maior palácio do mundo** — o **palácio colossal**, fora da cidade, com telhados de ouro, fontes e uma avenida de estátuas. Para isso ele tira metade dos construtores de todas as outras obras, **sobe os impostos**, deixa as roças esperando — e o povo resmunga (o contrabando cresce). Cada civilização ergue o seu: colunas com flores de papiro e obeliscos, pirâmide de degraus, salão comprido como um navio, colunas de mármore e cúpula.
- **Antes da moeda há tributo**: os cobradores batem de porta em porta com a sua tábua de contas e levam ao chefe sacos do que as casas têm.
- **A taverna** abre cedo; à noite há vinho e **música** (notas flutuando no ar), **bêbados** voltando para casa cambaleando — e de vez em quando uma **briga**.

### Peixes de cada água

- **Bacalhau e arenque só nos mares frios**, sardinha nos temperados, **atum** no mar quente e fundo, garoupa sobre os recifes, lagosta e polvo entre as pedras, **camarão** nas fozes lamacentas e nos mangues. **Salmão e truta** nos rios frios, carpa e enguia nos lagos, tilápia e bagre nos rios quentes, o gigante **pirarucu** (e as **piranhas**, que mordem quem entra) nos rios da selva — 17 espécies, cada uma com o seu valor. A crônica registra o primeiro de cada um, e um povo que pesca muito **vive da pesca**: bacalhau e atum viram riqueza de comércio.
- Onde o mar é quente e tem coral, os **mergulhadores de pérolas** nadam até o recife, mergulham três vezes e voltam com ostras — às vezes com uma **pérola**, um galho de **coral** ou, muito raramente, uma **pérola negra**.

### Comércio de luxo: rotas, casas de mercadores, monopólios e guerras

- Um povo com marfim, seda, café ou pérolas sobrando manda um **mercador com um cavalo de carga** (o asteca carrega nas costas) a um povo que não tem; voltam moedas ou outras mercadorias. O mesmo caminho percorrido de novo e de novo ganha nome — a **Rota do Marfim**, a **Rota da Seda**, a Rota do Café — e os navios também levam riquezas pelo mar.
- Os mercadores enriquecem: a casa deles ganha **bandeira na porta**, e uma **elite de mercadores** pode, um dia, derrubar um tirano vaidoso de impostos altos e governar como **conselho**.
- Um povo que é o único a vender algo tem o **monopólio** e cobra mais caro; um que compra e não sabe produzir pode **cobiçar os cafezais do vizinho** e ir à guerra por eles. Caravanas que cruzam terra hostil são **roubadas** — e uma estrada roubada duas vezes é motivo de guerra.
- No painel **Reinos**, cada povo mostra as suas rotas, casas de mercadores, monopólios e do que vive.

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
- Nos mapas **Enorme, Colossal e Titânico** as cidades não ficam presas: uma capital pode passar de centenas de habitantes, com **quarteirões** de casas de pátio (quatro sobrados em volta de um pátio) — uma metrópole que já subiu em ínsulas refaz o seu centro em quarteirões, derrubando casas baixas, sobrados, hortas e campos da própria cidade (nunca um prédio público, nunca as últimas fazendas; as famílias levam suas moedas) —, várias praças, mercados, termas e teatros, e ruas que se espalham por dezenas de quadras. Em testes, um mundo 160×160 pacífico chegou a 1.000 habitantes e à primeira megalópole por volta do ano 100.
- Casas evoluem para **sobrados** e **ínsulas**; surgem **praça**, **mercado**, **celeiro**, **biblioteca**, **teatro**, **termas**, **palácio**, **porto** e uma **maravilha** — tudo desenhado no estilo de cada civilização. Enquanto ainda não é cidade, uma vila põe a pedra e os braços primeiro no que a faz crescer — trocar as cabanas por casas de pedra, a praça, o mercado, o templo ou o celeiro —, e os extras (taverna, monumento, forja, casa do chefe, pomares, tributo) esperam a cidade ou uma pilha de pedra sobrando; com os celeiros cheios, metade dos agricultores vai para o mato e a pedreira; a capital segura seus casais jovens até virar cidade; e um povo pequeno só vai à guerra por um motivo forte. Uma cidade que ainda não tem palácio, teatro nem maravilha sonha primeiro com o teatro: é o que a faz virar metrópole. Quando o centro já está cheio, as grandes obras vão para a borda da cidade — além dos muros, se for preciso.
- **Ruas de verdade**: cada cidade traça o seu plano — duas **ruas principais** que se cruzam na praça (os romanos e os gregos, nas cidades maiores, fazem uma **grade** de quarteirões) e **vielas** que ligam a porta de cada casa à rua mais perto. As ruas ficam reservadas: ninguém constrói em cima delas. Primeiro são de terra batida; quando a cidade cresce e sobra pedra, são **calçadas**. Por elas passam pedestres, carroças e o gado indo para o pasto.
- **Estradas** e **pontes** ligam as cidades.
- **Carroças** levam bens pelas **rotas internas** e pelas **rotas de comércio** entre povos amigos.
- **Aquedutos** trazem água do rio, arco por arco.

## A vida na cidade

Nada é enfeite: cada coisa que se vê na cidade é alguém fazendo um trabalho de verdade, com matéria-prima de verdade.

- **Empregos fixos e rotinas**: cada pessoa tem um ofício e um local de trabalho. O mineiro atravessa a cidade até a **mina** no veio de minério e volta carregado; o agricultor vai à colheita e volta; o guerreiro sobe na **torre** ou guarda o portão da muralha e depois volta para a casa onde mora. À tarde uns vão para casa jantar da despensa, outros para a **taverna**.
- **Criação de gado**: **currais** (com cerca de verdade: galinha, porco e ovelha não atravessam; entram e saem pela porteira) com vacas, ovelhas, cabras, porcos ou perus (conforme a civilização) e **estábulos** de cavalos. Pastores soltam o rebanho de manhã, levam ao pasto, vigiam contra lobos e trazem de volta; quando não há capim, buscam **feno** no celeiro e enchem o cocho. Tosquiam ovelhas, ordenham vacas e cabras, recolhem ovos. Os animais comem, dão cria — e morrem de fome se ninguém cuida.
- **Cadeias de produção**: lã → **tecelagem** → tecido; animal levado na corda → **açougue** → carne e couro; minério → **forja** (queimando lenha) → ferramentas e **armas**; ouro → **ourivesaria** → joias; argila tirada da beira do rio → **olaria** → cerâmica; ouro e pedra → **estátua de ouro** do deus.
- **Veios de ferro e ouro** no mapa (montanhas, desertos, rios da selva): quem tem, minera; quem não tem, compra — ou conquista.
- **Mercado, feira e mercado clandestino**: mercadores reabastecem no armazém e vendem às famílias; a **feira** arma barracas toda manhã e desmonta ao meio-dia; o **contrabandista** rouba à noite e vende barato, até a guarda dar uma batida.
- **Dinheiro e impostos**: com a Moeda, os **coletores de impostos** batem de porta em porta, o ouro é cunhado em moedas, salários são pagos às famílias, e cada governo cobra sua taxa (tirania 30%, era de ouro menos). Casas com tecido, cerâmica e joias vivem melhor; impostos altos e escassez derrubam a lealdade. O **prédio administrativo** (bouleutério, basílica, casa do vizir, tecpan, salão do thing) tem escribas que ajudam a governar.
- **Muito mais animações**: tear, martelo na forja, torno de oleiro, tosquia, ordenha, pastor com cajado, varrer, servir na taverna, escrever, bater à porta, esgueirar-se, pechinchar, beber, carregar lã, tecido, couro, minério, armas, ouro, cerâmica, moedas e feno.
- Clique num edifício para ver quem trabalha lá, o estoque, o rebanho ou o veio; no painel **Reinos**, cada povo mostra bens, tesouro, imposto e a produção do dia anterior.

## Bairros, porto, taverna, quintais, barracos e a lei

A cidade não é mais um anel em volta da fogueira: ela cresce de **vários núcleos** ao mesmo tempo — o velho fogo, as praças e mercados, o porto, o templo, o palácio, o quartel, os portões e as estradas que chegam — e cada coisa procura o lugar ao qual pertence.

- **Valor da terra**: cada pedaço da cidade vale mais perto do palácio, do templo e da praça, no alto e seco, junto à água e dentro da muralha; vale menos ao lado da forja, do curtume e dos currais, e na borda. **Prédios altos só onde a terra é cara**: na terra barata, a mesma família faz uma casa baixa, com quintal.
- **Bairros que nascem sozinhos**: o centro antigo, o bairro do comércio, o dos nobres, o popular, o dos ofícios, o do porto, o militar, o sagrado, os campos — e, se faltar casa, o de barracos. Cada um tem **nome próprio** da sua cultura (Ágora, Fórum, Cerâmico, Subura, Tianguis, Colina dos Nobres, Rua dos Ferreiros, Cais dos Barcos, Chinampas, Burgo Velho…), ano de nascimento e história: cresce, muda de vocação, esvazia, é engolido por um vizinho — e a crônica conta. O nome aparece no mapa; clique para abrir o painel do bairro (gente, riqueza, valor da terra, trabalho, idade, história).
- **Avenidas** ligam o velho fogo a cada núcleo e são calçadas antes das ruas de dentro. Uma cidade grande demais para uma muralha só cerca a **cidade velha**.
- **Quintais**: as casas da borda arejada ganham uma **horta**; a família cava, cuida no fim do dia (ou cedo, antes do trabalho) e colhe — a comida vai para a despensa da casa. Quando a cidade adensa em volta, o quintal some.
- **O porto**: a carga do navio mercante desce em **caixas no cais**; os **estivadores** levam caixa por caixa ao **armazém do porto**, e só então ela entra no estoque. Quem é chamado no meio do caminho devolve a caixa ao cais.
- **A taverna**: cada povo bebe o seu — vinho (gregos e romanos), hidromel (nórdicos), **cerveja** (egípcios), **pulque** (astecas); cerveja e pulque são feitos ali mesmo pelo taverneiro, do grão da cidade. A primeira caneca vem com a refeição; cada rodada a mais custa moeda da casa de quem bebe. Luto, companhia e um temperamento sociável pedem mais uma; três ou mais e a manhã seguinte pesa.
- **Sem teto, por um motivo**: quem fica sem casa sabe por quê (a casa pegou fogo, caiu no terremoto, foi destruída na guerra, foi derrubada para uma obra, ou a cidade não tem lugar). Depois de duas noites na rua, levanta um **barraco** de tábuas na terra mais barata da borda — e um bairro de barracos pode nascer ali. Quando aparece uma casa com lugar, a família se muda; quem junta moedas troca o barraco por uma cabana. A biografia guarda tudo.
- **O roubo e a lei**: o ladrão tem motivo (fome com o bolso vazio, noites na rua, um primeiro roubo que deu certo, a pobreza no meio de casas cheias de moedas). Ele vai de noite à porta de uma casa e leva parte das moedas — que saem de verdade de lá. Quem estava acordado perto **viu**, e só sabe o que viu; uma testemunha que cruza um guarda conta. O guarda **não sabe onde o ladrão está**: procura na casa dele, onde foi visto, em volta, e desiste se não acha; o ladrão pode fugir. Preso, vai amarrado até a **cadeia** (celas contadas, carcereiro) pelo tempo que a **lei do seu povo** manda (tirania três anos, reinos e templos dois, repúblicas e democracias um, tribos só a devolução) — e as moedas voltam para a casa roubada. Ninguém tira o preso da cela para uma festa ou uma assembleia; só um tumulto de verdade. Uma cidade com cadeia, com roubos ou grande mantém uma **guarda**, que faz **ronda** à noite com tocha pelos bairros.
- **O painel da cidade** (clique no nome da cidade no mapa): gente, riqueza, valor da terra, sem-teto e por quê, barracos, quintais, porto, noite, ordem — e a lista dos bairros.

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
- Festas dão lealdade, devoção e fé; custam comida, tecido, cerâmica e animais.
- **Ninguém festeja com o inimigo às portas**: se a cidade está sitiada, em batalha, com um exército inimigo marchando perto ou com o alarme tocando, a festa do ano não acontece (a Crônica registra) e uma festa em andamento é interrompida. Mas depois de **vencer** uma defesa, na noite seguinte a cidade faz a **noite da vitória**: fogueiras, comida, música — e a lembrança dos que morreram.

## Exércitos, batalhas e cercos

- **Exércitos de verdade**: o povo levanta **recrutas** da região inteira (a guerra consome as **armas** da forja; sem elas vão com porrete, como milícia) e o tamanho depende da população, do governo, da comida e da ambição do líder (veja *Guerras de verdade*, abaixo).
- **Tipos de tropa**: **lanceiros**, **espadachins**, **arqueiros**, **cavalaria** (cavalos do estábulo; carros de guerra egípcios), **tropas de elite** de cada cultura e **milícia**.
- **Oficiais**: um **general** com o título da cultura (Estratego, Legado, Grande Comandante, Tlacochcalcatl, Jarl), **coronéis** de ala (Taxiarca, Tribuno, Hersir…) e **capitães** de cada companhia (Lochagos, Centurião, Tequihua, Skipari…) com estandartes — a águia romana, o leque egípcio, o estandarte de plumas asteca, o estandarte do corvo nórdico.
- **Formações**: linha, **falange**, **parede de escudos**, **cunha** (svinfylking), **tartaruga** (testudo), ordem dispersa dos arqueiros e coluna de marcha. Cada companhia tem uma frente: golpes pelo **flanco** e pelas **costas** machucam mais e derrubam o **moral**; companhias com moral baixo **debandam**, e se muitas fogem o exército é desbaratado. Lanças vencem cavalos, espadas vencem lanças, a colina e o rio contam.
- **O general escolhe o plano** olhando o inimigo e o terreno: **cerco** e fome, **ataque por vários portões** para dividir os defensores, **pinça** com a cavalaria pelos flancos, **guerrilha** (queimar campos, roubar rebanhos, matar quem sai e sumir), a **cunha** dos berserkers, a **tartaruga** romana contra flechas.
- **Quem defende também planeja**: o reino manda um exército de socorro e escolhe entre **defender as muralhas**, **emboscada na floresta** (caindo sobre o flanco inimigo), **segurar o alto da colina** ou **o vau do rio** — ou a batalha campal diante da cidade. Quando dois exércitos se encontram, formam **linhas de batalha**.
- **Cercos profundos**: trincheiras e tendas em volta da cidade fora do alcance das flechas; a cidade passa a viver só da **comida dentro dos muros** e pode morrer de fome e **se render**. **Aríetes**, **catapultas**, **torres de cerco** que baixam a ponte sobre o muro, **escadas** (os defensores empurram), soldados que escalam e **abrem o portão por dentro**, **sapadores** que cavam sob a muralha até ela desabar, **óleo fervente** despejado do portão (incendeia aríetes) e — sob generais cruéis — **cadáveres catapultados** por cima dos muros para espalhar a **peste**.
- **A guerra pesa**: cada golpe joga o corpo para trás e espirra sangue na direção do golpe; aparas de espadas soltam faíscas e o clangor do metal. Golpes pesados (elites, berserkers, heróis) **decepam braços** — que voam e ficam no chão — e às vezes **cabeças**. Quem sobrevive a um braço cortado fica **sem ele pelo resto da vida**: um coto enfaixado, trabalho mais lento, golpes mais fracos, e a memória na biografia. Quem morre **cai de verdade** — tomba, quica, fica — e uma poça de sangue se espalha embaixo.
- **Os mortos ficam onde caíram**: com as roupas, o escudo e as flechas ainda cravadas. Com o tempo **incham** (moscas em volta), os **corvos** chegam para comer, eles **ressecam** e viram **esqueleto**, até sumirem. Quando o combate acaba, **coveiros** saem da cidade — parentes primeiro, depois cativos, depois quem estiver livre — e **arrastam** os corpos: os nossos para o **cemitério** (e a família vai ao enterro), os inimigos para a **pira**, que queima longe das casas. Deixados ali, os corpos **apodrecendo trazem doença** a quem mora perto, e a Crônica registra: “O fedor dos mortos trouxe a doença a Roma”.
- **No mar**: frotas com **almirante** (navarco, prefeito da frota, jarl do mar…), **esporões de bronze** que abalroam, **abordagem** (o corvo romano, ganchos e machados nórdicos) que toma o navio inimigo, **brulotes** em chamas lançados contra frotas maiores e **bloqueio de portos**: nenhum barco de pesca ou mercante sai nem entra.

## Guerras de verdade: causa, tensão, campanha, paz

Uma guerra não é mais um estado entre dois povos que manda meia dúzia de saqueadores por dia: é uma **cadeia histórica** — motivo → tensão → decisão → preparação → mobilização → campanha → batalhas → cercos e ocupações → desgaste → negociação → paz → consequências. O resultado nunca é escrito: os exércitos, a fome, o moral e o terreno decidem.

- **Toda guerra tem um porquê** — e um nome: *a Guerra do Vau de Hedeby*, *a Guerra pela Coroa do Clã de Hrafn*, *a Guerra dos Celeiros de Roma*, *a Segunda Guerra das Terras de Argos*. Causas: uma cidade perdida que se quer de volta, rebeldes, vassalagem, fome, as riquezas do vizinho, caravanas roubadas, vingança, uma fronteira disputada, a ambição de um governante, o medo de um vizinho forte demais, uma aliança, uma traição. Cada lado tem **objetivos** (tomar esta cidade, retomar aquela, submeter os rebeldes, saquear os celeiros, quebrar o poder do inimigo — ou defender o que é seu).
- **A tensão vem antes**: entre cada par de povos a temperatura sobe em degraus — **atrito**, **crise**, **à beira da guerra** — pelos rancores, incursões, cidades reclamadas, pastos disputados, cobiça, fome e pelo gênio dos governantes. Os sinais aparecem na Crônica: patrulhas na fronteira, **ferreiros trabalhando de noite** (a forja passa a fazer armas já na crise), celeiros sendo enchidos, mensageiros visitando os aliados, homens se juntando. A guerra só é declarada depois que a crise amadurece — um **ataque de surpresa** é escolha rara de um governante cruel e muito mais forte.
- **Escala real**: **incursão** (3–14 guerreiros, como guerreiam as aldeias pequenas), **escaramuça** (10–29), **batalha** (exércitos organizados) e a **guerra** em si. O tamanho de um exército vem da população adulta, do regime, do líder, dos objetivos, da comida e do cansaço: uma aldeia de 90 nunca manda 200 — manda 7 ou 14; um reino médio manda dezenas; uma civilização grande, centenas (até ~260 por exército; mais do que isso é uma segunda leva).
- **Mobilização visível**: o chamado às armas atravessa o reino; cada cidade **guarda uma guarnição**; os convocados largam o trabalho e andam até o **ponto de reunião**, pegam uma arma no arsenal (sem arma, vão de porrete), esperam os outros, a comida é carregada nas **carroças** e um **comandante** é nomeado — só então o exército marcha, junto, em coluna.
- **O exército é uma coisa**: nome (*a Legião do Leste*, *a Hoste do Norte*, *o Exército Jaguar do Sul*), comandante, companhias (lanceiros, espadachins, arqueiros, cavalaria, elite, milícia), moral, **comida para N dias**, missão, fase. Se o comandante cai, o moral despenca e um capitão assume.
- **Campanha**: à noite o exército **acampa** — tendas, fogueiras, sentinelas, gente dormindo — e marcha de novo ao amanhecer; em terra inimiga **forrageia e pilha**, perto de casa reabastece no celeiro; com as carroças vazias o moral cai, os homens **desertam** de noite (e os desertores voltam a pé para casa) e por fim o exército desiste. Tomada uma cidade, deixa uma **guarnição** e marcha sobre a próxima — ou volta.
- **Batalhas registradas**: quando dois exércitos se encontram, **formam as linhas e esperam** a trombeta antes de avançar; o alerta **“Batalha iminente: N combatentes — Assistir”** aparece (nunca força a câmera). Cada batalha ganha nome pelo lugar (*a Batalha das Colinas de Mênfis*, *a Batalha do Vau*), e guarda forças, comandantes, mortos, feridos, capturados, fugitivos e quem ficou com o campo. Ninguém luta até o último homem: companhias que perdem muita gente **quebram e fogem**, o pânico contagia as vizinhas, feridos graves saem da linha, quem não consegue mais correr **se rende** — e a perseguição para onde a batalha acabou.
- **Cercos de verdade**: uma cidade murada não cai porque seis homens apareceram. O sitiante cerca, cava trincheiras e espera; dentro, a cidade vive do que tem nos muros, passa fome, **adoece** e pode **se render**; o general só manda o assalto pela brecha, pela fome ou quando a vantagem é esmagadora — e, sem pão e diante de muros ainda bem guardados, **levanta o cerco**. O reino sitiado manda um **exército de socorro** (se tiver gente bastante para ter chance) que cai sobre as linhas do cerco.
- **Ocupação**: a cidade tomada fica **ocupada** antes de ser integrada — lealdade baixa, guarnição — e às vezes **se levanta** e volta para o antigo dono.
- **Civis**: com um exército a caminho de uma cidade sem muros, velhos, crianças e mães com bebês **fogem para outra cidade** e voltam quando o perigo passa.
- **Desgaste**: o tempo, os mortos, as batalhas perdidas, as cidades caídas, a fome e os homens longe do campo cansam um povo; a lealdade das vilas cai, e então se busca a paz. Quem alcança o objetivo **oferece a paz** nos seus termos; quem ainda está vencendo no campo não aceita.
- **Paz com nome**: *o Tratado de Argos*, *a Paz do Vau*. Cidades ocupadas ficam com o vencedor ou são **devolvidas**; numa paz branca tudo volta como era; **prisioneiros são trocados**; há tributo e vassalagem. Os exércitos voltam para casa — veteranos com a guerra na biografia, famílias na porta —, refugiados voltam, os mortos entram na Crônica e, se foram muitos, a guerra vira lenda. Quem perdeu guarda **rancor**, e a cidade perdida vira causa da próxima guerra.
- **Alianças que pesam**: aliados entram na guerra — ou **não respondem ao chamado** (cansados, amigos do outro lado), e isso não se esquece; de vez em quando um aliado ambicioso **trai** e entra do lado mais forte. Guerras com vários povos de cada lado.
- **Painel Guerras** (`X`, ou o botão **Guerras** no painel Reinos): guerras em curso e passadas, as **tensões** entre povos, e para cada guerra a causa, os objetivos de cada lado, convocados, mortos, feridos, cativos, desertores, batalhas vencidas e perdidas, cidades tomadas, **desgaste**, os exércitos em campo (comandante, força, composição, moral, suprimentos, missão, fase), cidades ocupadas, cercos, batalhas e a crônica da guerra — com **Ir até** em tudo. A ficha de um soldado mostra o exército dele; a de um veterano, as batalhas.
- **A Convocação** (uma missão encenada): o chamado chega a uma casa — a criança que pergunta “você volta?”, a companheira que já sabia desde que os ferreiros começaram a bater de noite — e alguém dá a quem parte **algo para levar** (a pedrinha pintada, o amuleto do avô, a pena de quetzal). Depois, **a coluna** saindo na beira da estrada; **a véspera** junto à fogueira do acampamento (o companheiro, os boatos, o comandante passando, e às vezes uma promessa: “se eu não voltar, leva isto pra ela”); e por fim **a volta** — o abraço, o braço que ficou na guerra, o objeto devolvido — ou **a notícia**: a coluna volta sem a pessoa, e quem prometeu caminha até a porta com o objeto na mão. Quem morre, quem é capturado, quem deserta é decidido pela guerra que o mundo está lutando.

## O mar

- **Portos**, **barcos de pesca** atrás de cardumes, **exploradores** que descobrem povos distantes, **navios mercantes** em rotas marítimas.
- **Frotas de guerra** que combatem no mar, **invasões anfíbias** (os nórdicos adoram) e **colônias** em outras ilhas.
- O mapa **Mar Aberto** separa cada povo em sua ilha: só a navegação os une.
- **Água transparente**: perto da praia dá para ver o **fundo do mar** — areia com sulcos das ondas, pedras com algas, pradarias de algas, a luz das ondas dançando no fundo — e a água vai ficando mais grossa e azul conforme afunda: **turquesa** nos mares quentes, **verde-acinzentada** nos frios, turva de **lama** onde o rio chega. Longe da costa o oceano escurece até o **abismo**, com fossas mais escuras ainda.
- **O que há no fundo e na costa**: **recifes de coral** coloridos nos mares quentes (com cardumes de peixinhos girando por cima), **florestas de kelp** nos frios (as folhas boiando na superfície), raros **buracos azuis** — um poço redondo e escuro no meio do raso —, **pilares de pedra** e **arcos** diante dos paredões (com gaivotas e biguás pousados), **grutas marinhas** na base das falésias, acesas de azul por dentro, e **gelo à deriva** nos mares gelados, andando com o vento. Tocando em qualquer um deles, o painel conta o que é (de perto, também o fundo).
- **Marés**: duas vezes por dia o mar recua e volta. Na **maré baixa** aparece uma faixa de areia molhada (pedra escura nos costões) com **poças** e os furinhos dos mariscos, e **caranguejos** correm de lado; na **maré alta** a água sobe a praia, e a espuma acompanha. Na maré baixa os **coletores e os velhos descem para catar mariscos** (comida de verdade para a cidade — e a crônica registra o dia em que o povo descobriu isso), as **crianças correm para as poças** atrás de caranguejos, polvinhos e estrelas-do-mar, e quem demora demais volta correndo, molhado até o peito, quando a maré sobe. Fica tudo na biografia.
- **Momentos do mar** (acontecem sozinhos): em algumas **noites quentes e calmas o mar brilha** — cada onda que quebra e a esteira de cada barco acendem de azul; na primeira vez, cada povo explica do seu jeito (Poseidon passando, Netuno contente, as almas a caminho do Ocidente, a saia de jade de Chalchiuhtlicue, o fogo do mar que promete arenque). **Tartarugas-marinhas** sobem as praias quentes de noite para desovar, e no entardecer seguinte as **tartaruguinhas** saem da areia e correm para o mar enquanto as gaivotas levam algumas — as crianças da vila vêm correndo assistir. **Golfinhos** vêm brincar na proa dos barcos. E, muito de vez em quando, uma **baleia encalha** na praia: o povo desce com facas e cestos, há carne para muitos dias, e a **ossada** fica na areia (salva com o mundo). O modo cinema filma tudo isso.
- **O pescador de verdade**: quem pesca é uma pessoa com nome. De manhã ela passa no galpão, pega a **rede e os remos**, desce ao cais, **embarca** com os companheiros (a canoa leva dois, o barco três, a traineira cinco — cada povo tem os seus), rema até o pesqueiro, joga a rede, espera, puxa, e volta com o peixe nas **caixas**; no cais as caixas são **descarregadas** uma a uma e levadas nas costas até o **armazém**. Nas horas de folga as redes são **remendadas** no varal, e no **estaleiro** os carpinteiros levantam o casco do barco seguinte, tábua por tábua. Os pesqueiros de perto se esgotam com o tempo, e os cardumes mudam de lugar.
- **O que cada povo sabe do mundo**: nenhum povo sabe o que não viu. Cada ilha, para cada povo, é **desconhecida**, **boato**, **avistada**, **explorada**, **mapeada** ou **habitada**. As notícias só chegam com quem volta: o pescador que viu fumaça numa costa distante, a expedição que voltou, o náufrago que alguém encontrou. **Boatos** nascem dessas histórias, passam de boca em boca e **mudam no caminho** (o "ferro" vira "ouro"); podem estar certos, ou não — e às vezes uma expedição inteira vai atrás de **ouro de tolo**. Uma expedição que morre no mar **não conta nada a ninguém**: em casa só se sabe que ela não voltou.
- **O lugar faz o povo**: num mundo de ilhas (**Mar Aberto** ou **Arquipélago**), todo povo do litoral já começa sabendo remar e pescar — canoa e rede são mais antigas que qualquer arte — e o amor ao mar depende mais de onde se vive do que dos deuses de cada um: astecas numa ilha também viram gente do mar. Os nórdicos e gregos continuam os mais ousados, mas não os únicos. E o mar molda quem vive dele: portos, barcos e viagens que voltam fazem o povo gostar cada vez mais da água (devagar, em gerações); as que não voltam fazem o contrário. Quando um povo decide uma viagem e falta madeira, ele guarda madeira para o casco (os lenhadores trabalham para isso) — ou empresta um barco de pesca parado no cais.
- **Ninguém se lança ao mar sem motivo**: cada povo tem seu temperamento marinho (amor ao mar, curiosidade, gosto por expansão, coragem para o risco), que muda com a história — uma era de navegações depois das descobertas, as costas viradas para o mar depois de muitas perdas, e até o **tabu** de uma direção de onde ninguém voltou. O que empurra para o mar é concreto: **falta de ferro** (as forjas esfriam), terra pequena para tanta gente, pesqueiros esgotados, um **boato**, um vizinho que já navega, um governante que quer o nome gravado no que for descoberto — ou alguém que se ama e não voltou. Uma ilha rica e bem servida pesca e vive; não sai colonizando tudo.
- **Expedições**: um aventureiro sozinho numa canoa, um mercador que paga a viagem e um capitão que comanda, ou a **grande expedição do Estado**, com vários navios, cartógrafo, naturalista e soldados. Cada uma tem preparação (navios no estaleiro, comida carregada em caixas para o cais), a **despedida** com as famílias, a partida, os dias no mar — tempestades, calmarias, febre, fome, motim, baleias, o mar de luz, monstros que os pescadores juravam existir, **pistas de terra** (aves, galhos verdes boiando, a nuvem parada no horizonte) —, a terra à vista, o desembarque, a exploração (bichos nunca vistos, minérios, o nome dado à terra), o **primeiro contato** com outro povo (presentes, medo, hospitalidade ou flechas), a volta, ou o naufrágio. **O livro da viagem** guarda tudo, capítulo por capítulo, com o rastro no mapa. Quem fica para trás numa praia vira **náufrago**: monta acampamento, faz uma jangada, vive entre estranhos — e às vezes volta para casa anos depois, quando já tinham acendido a lamparina dos mortos.
- **Colônias com motivo**: só quando há razão (gente demais, ferro ou ouro do outro lado, um porto contra um inimigo, terra boa), num lugar avaliado por quem explorou. O primeiro ano é frágil; muitas não passam do primeiro inverno.
- **Guerra no mar de verdade**: cada povo monta **frotas** com almirante e nome (a Classis da Invasão, a Frota-Dragão de Hedeby, as Canoas de Guerra de Tenochtitlan), tripuladas por gente de verdade — marinheiros do cais e, se for preciso, gente tirada da convocação. Há **formações**, **moral**, dano por partes (casco, mastro, vela, água entrando, fogo), **abordagens** com tábuas entre os cascos, navios **tomados**, **bloqueios** que deixam o porto inimigo sem pesca nem comércio, **corsários** atrás dos barcos de pesca e a **invasão anfíbia** completa: o exército se reúne no porto, sobe nos transportes, atravessa protegido pela escolta, **desembarca na praia** (com a cabeça de praia segurando a areia), luta em terra e, se precisar, volta correndo para os barcos. Ninguém se teletransporta. Se a paz chega no meio do mar, a frota dá meia-volta. As batalhas no mar entram no registro da guerra junto com as de terra.
- **O painel do mar** (`O`): expedições no mar e passadas (com **Seguir**, **Ver líder** e o livro), náufragos, frotas e batalhas navais (com **Ir até** e **Seguir a capitânia**), e o **mapa do conhecimento** de cada povo — o mesmo mundo, visto por cada um deles.
- **Os povos usam o mar de verdade**: quem vive na costa (e mais ainda quem vive numa ilha, passa fome ou é nórdico ou grego) aprende **navegação** cedo; o **primeiro porto** passa na frente das outras obras — e, numa ilha sem árvores, o cais é terminado **em pedra**. O povo **guarda madeira** para os primeiros **barcos de pesca** (os construtores não mexem nela) e, com **fome**, manda mais barcos ao mar. Nas ilhas sem floresta, os lenhadores vão à praia catar a **madeira que o mar traz**. Guerras entre povos do litoral vão mais vezes **pelo mar**.

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

### Guerra mundial

Muito rara. Só acontece quando há pelo menos quatro povos de bom tamanho, quase todos já se conhecem e as rixas antigas se acumularam (mais guerras, mais rancor, líderes belicosos tornam mais provável; povos pacíficos, menos). Quando estoura, o mundo inteiro se divide — e há sempre um **motivo**:
- **o ouro** das minas, **uma coroa** disputada, **a fé** (um deus contra outro), **o sangue** de uma afronta antiga, **a fome** de terras férteis;
- **o império**: quando um povo fica forte demais, os outros se juntam numa **Grande Coalizão** contra ele;
- **o caos**: às vezes não há blocos — é **todos contra todos**.

Cada povo escolhe um lado pelo que sente pelos dois líderes, e os blocos tentam se equilibrar. Dentro de um bloco todos viram **aliados**; entre blocos, **guerra**. Ninguém pode fazer **paz separada**: a guerra só termina quando um bloco cai ou quando todos estão cansados demais — e aí vem a **paz geral**, com os mortos e as cidades conquistadas contados na Crônica e uma lenda no Livro. O painel **Reinos** mostra os blocos e o motivo, e o botão da câmera de guerra pulsa em vermelho.

## Política: quem manda, quem tem o dinheiro, e o que o povo faz com isso

### Regimes e economia
Cada povo é governado de um jeito, e pode mudar: **tribo**, **chefia**, **reino**, **império**, **monarquia com conselho** (o rei reina, mas imposto e guerra passam pelos nobres e mercadores — *Boulé*, *Thing*, *Senado*), **feudalismo** (as terras repartidas entre senhores que juram lealdade; os camponeses pagam a eles), **teocracia**, **república** (ninguém herda o poder: há mandato e eleição), **democracia** (a assembleia de todos vota as leis e escolhe quem governa), **oligarquia** (as famílias mais ricas — *Liga dos Mercadores*, *Conselho dos Pochteca*), **ditadura** (o general e os quartéis), **tirania**, **comuna** (terras, celeiros e ferramentas de todos) e **anarquia** (ninguém manda, ninguém paga imposto). Cada civilização tem os seus nomes e títulos (Arconte, Falador da Lei, Tribuno da Plebe, Cihuacoatl, Imperator…). Um regime precisa que o povo esteja pronto para ele: leis pedem escrita, senhores pedem terras para senhorear.

E a **ordem econômica**: **livre comércio** (mercadores e donos de terra enriquecem; o governo vive de imposto), **tudo é do governante** (terras, minas e comércio do trono), **terras dos senhores**, **tudo é de todos** (o que sobra é repartido por igual) e **economia do templo** (os celeiros são dos sacerdotes). Os pomares, plantações e minas têm **dono** de verdade — uma casa rica, um senhor, o templo, ou ninguém.

### Os grupos e o que querem
Dentro de cada povo há **nobreza**, **mercadores**, **sacerdotes**, **militares**, **artesãos** e **povo** — gente de verdade, contada pela casa, pela profissão e pela riqueza. Cada grupo tem **influência** (que depende do regime: num feudo mandam os nobres, numa oligarquia os mercadores, numa democracia o povo), **satisfação** e um **líder** (o mais rico, ambicioso e corajoso). Impostos, fome, guerra longa, a crueldade de quem governa, a obra do palácio, o próprio regime — tudo pesa. Quem está infeliz **quer** alguma coisa: pão, paz, o soldo atrasado, imposto mais baixo, livre comércio, um conselho, uma república. O painel **Reinos** mostra os grupos, suas barras, seus líderes e o que pedem.

### O governante decide
Pela personalidade e pelo momento, quem governa **aumenta** ou **baixa impostos**, **estatiza** tudo (os guardas entram nas casas ricas, levam as moedas e arrancam as bandeiras dos mercadores — e os mercadores e os nobres nunca esquecem), **devolve o comércio**, **reparte as terras** entre os nobres (e pode virar feudo), **abre um conselho**, **abre os celeiros** ao povo ou institui o **dízimo**.

### Petições, motins e revoluções
- **Petição**: o grupo infeliz vai, com o líder à frente, até a porta do palácio pedir. O governante ouve e cede — ou manda todos para casa, e o cruel prende quem falou "por insolência".
- **Motim**: com impostos altos, fome, um confisco, um pedido negado ou um tirano, a cidade sai às ruas com **tochas e pedras**. Junta-se na praça aos gritos ("Abaixo os impostos!", "Pão!", "Ladrão!"), marcha contra o que odeia — a **casa dos impostos**, o **palácio**, o **celeiro**, o **cadafalso** — põe fogo, saqueia comida e moedas. O governante responde pelo que é: o brando sai à varanda e **cede**; o duro manda a guarda, e a guarda **mata**; os corajosos revidam com paus e pedras, os outros apanham e correm. Termina **esmagado** (os cabeças presos e levados ao cadafalso), **com concessão**, **disperso** ao anoitecer — ou, quando a guarda é pouca e a cidade está furiosa demais, **vira revolução**. À noite, as tochas iluminam a praça.
- **Revolução** com propósito: quem se levanta quer um regime (os mercadores querem república, o povo quer democracia ou comuna) e, se vence, o povo passa a ser governado de outro jeito; golpes de militares instalam ditaduras. Repúblicas e democracias têm **eleições** de verdade, com votos contados.

### Execuções públicas e sacrifícios
Uma sentença é marcada para **um dia e uma hora** — o meio-dia — e gritada pelo arauto nas ruas. O **cadafalso** sobe na praça; os condenados esperam amarrados; o **carrasco de capuz** e os guardas tomam posição; a cidade **para para ver**. O arauto lê a sentença sobre os tambores, e então se faz, do jeito de cada povo: **forca** com alçapão (os nórdicos e muitos outros), **machado** ou **espada** no cepo, **fogueira** para os hereges, **cruz** para cativos e rebeldes romanos, **pedras** atiradas pela própria multidão grega, a **guilhotina** da justiça revolucionária (repúblicas, democracias e comunas julgando traidores e conspiradores) — e, entre os astecas, o **sacrifício no alto da pirâmide**: a faca de obsidiana, o coração erguido para o Sol, o corpo rolando pela escadaria (sem templo, numa pedra de sacrifício na praça). A multidão reage pelo que sente: **aplaude**, vaia ("Assassinos!", "É inocente!"), a família **chora** ao pé do cadafalso, as crianças escondem o rosto. Os enforcados e os crucificados **ficam expostos** por um tempo, com os corvos; os queimados ficam no poste. Uma praça que odeia a sentença pode **invadir o cadafalso** e soltar os condenados. Se o cadafalso está ocupado, os próximos esperam **presos**, e vão depois.

### Sociedades secretas e boatos
Gente poderosa — um mercador rico, um nobre, um sacerdote, às vezes o companheiro de quem governa, às vezes o próprio governante — funda em segredo uma ordem: **A Ordem do Olho Velado** (quer governar por trás do trono), **A Liga do Selo Dourado** (o comércio de todos os reinos), **O Culto da Serpente Antiga** (despertar um deus esquecido), **Os Filhos da Aurora** (derrubar os tiranos), **A Confraria da Lâmpada** (um saber proibido)… Os membros são de **vários reinos** — os mercadores que andam pelas estradas levam o juramento a outras terras, e a ordem abre casas lá. Eles se reúnem nas noites sem lua numa **caverna**, numa **clareira no bosque** ou no **porão de uma casa comum**: vestem **mantos e capuzes**, acendem velas em círculo e um braseiro, cantam numa língua antiga — e as ordens sombrias derramam **sangue** sobre a pedra.
- **Testemunhas**: quem sai na noite e vê é **comprado** (um saco de moedas na porta), **iniciado**, ou **silenciado** — alguém da ordem o segue até ficar sozinho. Ou conta.
- **Boatos**: a cidade fala — de ordens que existem e de ordens que **nunca existiram**, de gente que pertence e de gente que não ("a velha do poço é da Seita do Poço"). O painel **Reinos** mostra os boatos de cada povo; só você, o deus, vê quais são verdade (◉) e quais são mentira (○), e quais ordens existem e quantos membros têm ali.
- **Influência**: a liga dos mercadores enche os cofres dos irmãos e, se o governante é um deles, faz baixar impostos e devolver o comércio; os irmãos votam nos seus nas eleições; a ordem do poder, forte num reino, arma um **golpe**; os filhos da aurora preparam levantes contra tiranos.
- **Inquérito**: quando os boatos chegam ao trono, um governante devoto, cruel ou desconfiado manda alguém **investigar** — de dia perguntas, de noite vigília. Se acha, a ordem é **descoberta**, os membros presos de capuz e levados à **fogueira**. Se a ordem percebe, quem pergunta demais aparece morto. E se não há nada para achar, um governante com medo pode queimar **inocentes** mesmo assim. Se quem governa é da ordem, o boato morre — e quem o espalhou corre perigo.
- Na ficha de cada pessoa, o deus vê o que ninguém sabe: *Em segredo: grão-mestre da Ordem do Olho Velado*.

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
| Ira | Dragão | 120 | Um dragão desce do céu e faz o covil nas alturas: rasantes de fogo sobre a cidade apontada, leva o ouro das casas ricas e dorme sobre o tesouro. Arqueiros e torres atiram; enquanto dorme, os bravos se reúnem e sobem ao covil — quem der o último golpe vira o Matador de Dragões, os ossos ficam e o tesouro se esparrama. Se ninguém o matar, parte levando tudo (o dragão das terras frias é branco e sopra gelo) |
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
| Mar | Abrir o Mar | 75 | Clique no mar entre duas margens: as águas se erguem em duas paredes e o fundo vira caminho de uma terra à outra (de preferência duas terras que não se alcançavam a pé). O povo desce para catar os peixes que ficaram na areia e atravessa a pé — exércitos também; navios no caminho são empurrados para a água. Quase um dia depois as paredes tremem, quem está lá embaixo corre, e o mar se fecha: quase todos que não saíram a tempo morrem afogados |
| Natureza | Chamar Animais ✦ | 16 | Um bando da espécie que você escolher, dentre as que vivem ali |
| Natureza | Primavera Sagrada | 24 | Capim alto, arbustos carregados, flores — e os animais da área dão cria na hora |
| Natureza | Grande Migração ✦ | 30 | Os rebanhos de uma espécie atravessam o mapa até o ponto escolhido; os predadores vão atrás |
| Natureza | Domar Fera | 35 | Um predador vira guardião da cidade mais próxima: ataca feras e inimigos, usa coleira na cor do povo |
| Natureza | Mudar o Clima ✦ | 50 | Neve eterna, taiga, bosque, pântano, selva, savana ou deserto: o chão, as árvores e os animais mudam junto |
| Natureza | Gafanhotos | 38 | Uma nuvem voa até as plantações mais próximas e devora colheitas, capim e frutos |
| Natureza | Fera Lendária | 85 | Um predador gigante típico daquela terra desperta, com nome e epíteto, para caçar gente |
| Natureza | Inverno Súbito | 45 | Um dia de neve numa região: os lagos e rios congelam e viram caminho a pé, as plantações morrem; no degelo, quem ainda está no gelo cai na água gelada |
| Cidade | Chuva de Ouro | 40 | Moedas caem do céu sobre um bairro: o que cai no telhado fica na casa, o que cai na rua é de quem pegar primeiro (o povo corre a catar; um povo sem moeda leva o ouro ao armazém). Rua rica atrai ladrão |
| Cidade | Vinho nos Poços | 28 | Por meio dia os poços de uma cidade dão vinho: o povo larga o trabalho, bebe, dança e cambaleia — e quem bebeu demais acorda de ressaca |
| Palavra | Profecia ✦ | 35 | Anuncie a queda, a grandeza, a morte do governante, a guerra ou a paz de uma cidade; se acontecer, a fé explode |
| Palavra | Mandamento ✦ | 50 | Uma lei divina para um povo: *Não matarás*, *Crescei e multiplicai-vos*, *Trabalharás*, *Honrarás teu deus*, *Buscarás o saber*, *Guerra santa* |
| Palavra | Inspiração ✦ | 60 | Revele a tecnologia que quiser a um povo |
| Palavra | Sinal nos Céus ✦ | 30 | Cometa, eclipse, aurora ou chuva de estrelas — cada povo interpreta à sua maneira |
| Palavra | Visão | 25 | Um adulto vira profeta: prega, espalha fé e às vezes revela povos distantes |
| Palavra | Sonho Coletivo ✦ | 45 | Um povo inteiro sonha o mesmo sonho e acorda para ele: uma grande obra (um monumento começa na capital), a paz (oferecem a paz aos inimigos), os deuses (devoção e templos cheios) ou uma terra além do mar (agora sabem que ela existe) |
| Destino | Ungir | 45 | Quem você tocar passa a governar seu povo; um cativo ungido lidera a fuga dos outros |
| Destino | Herói | 55 | Um campeão escolhido pelos céus: luta como dez e nunca foge |
| Destino | Libertação | 30 | Quebra as correntes dos cativos e salva condenados da execução |
| Destino | Fúria | 35 | Força redobrada na área — e o povo atingido parte para a guerra |
| Destino | Discórdia | 40 | A lealdade de uma vila despenca e os vizinhos passam a se odiar |
| Destino | Muralha Divina | 65 | Muralhas de pedra erguem-se numa noite ao redor de uma cidade |
| Destino | Paz Divina | 80 | Encerra todas as guerras; ninguém declara guerra por dois dias e meio |
| Destino | Amor Divino ✦ | 20 | Toque alguém sem par e escolha quem vai amar: os dois correm um para o outro e viram um casal — até de povos diferentes (um vai morar com o outro, e os dois povos se estimam mais) |
| Destino | Duelo de Campeões | 55 | Toque uma batalha: o melhor guerreiro de cada lado sai da fila e os dois lutam sozinhos, até o fim; quem vence vira o Campeão (ou a Campeã), e o lado de quem cai foge do campo |
| Além | Ressurreição ✦ | 90 | Toque um corpo ainda no chão ou um cemitério e escolha quem volta (quem morreu há até seis anos): o mesmo nome, a mesma família. A viúva recebe o marido de volta; quem já casou de novo, não |
| Além | Fantasmas | 35 | Por duas noites os mortos de um cemitério andam entre as casas: o povo foge, as famílias choram, os devotos rezam — e um fantasma aponta o ladrão que ninguém pegou ou vai atrás de quem o matou |

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

### Câmera de guerra

Uma parte do cinema que filma **só a guerra**. Quando há exércitos em campo, aparece no topo o ícone da **espada** (com o número de frentes); `G` também abre. E quando uma batalha está para começar — duas linhas se formando, um cerco, um assalto, uma emboscada armada ou saltando da mata, uma frota de invasão, um desembarque — surge um **alerta** com o botão **Assistir**, que leva direto para lá.

Lá dentro, uma barra com as **frentes** (*Argos × Óstia · cerco*, *No mar · batalha naval*…): **Todas as frentes** ou só uma — a câmera passa a seguir **apenas aquela batalha, aquela guerra**, até ela acabar. As frentes que esquentam enquanto você assiste a outra **pulsam** na barra. A câmera procura os momentos táticos:

- **a coluna em marcha**, filmada da cabeça, com quantos passos faltam até as casas — e, no chão, a **trilha** por onde o exército passou e uma **seta tracejada** até o alvo;
- **as defesas se organizando**: o plano do general (as muralhas, o alto da colina, o vau do rio, a linha diante da cidade);
- **a emboscada**: os soldados escondidos na mata (um anel pulsando mostra onde estão), o inimigo **rumo à armadilha** sem saber de nada — e o momento em que eles **saltam sobre o flanco**;
- **o flanco** e **a carga**: a cavalaria contornando pela ala esquerda ou direita e caindo sobre o inimigo;
- **os arqueiros**, **o general** no meio da batalha, **o corpo a corpo** (onde a luta está agora, com os mortos até ali) e **a debandada** quando uma companhia quebra;
- no cerco, **o aríete** no portão, **a catapulta**, **a torre de cerco** e os soldados **na muralha**;
- no mar, galeras caçando, brulotes, navios em chamas e o desembarque.

Ela corta mais rápido que o cinema comum: uma emboscada saltando passa na frente de uma coluna que ainda caminha. Sem exércitos em campo, o cinema volta sozinho ao mundo todo. O botão com a espada na barra (ou `G`) também volta ao cinema comum; no cinema comum, um botão **Seguir só a guerra** aparece enquanto houver frentes.

## O Livro do Mundo

Cada mundo nasce com **nome**, **mito da criação**, **lendas de origem** de cada povo (com seu deus e seu símbolo) e **duas profecias antigas** — que se cumprem quando o mundo, ou você, as faz acontecer. Depois o livro se escreve sozinho:

- **Crônicas**: um capítulo a cada sete anos, com título e tom escolhidos pelo que dominou o período (*O Tempo das Espadas*, *A Era das Velas*, *Os Anos de Cinza*…), contado pelos cronistas do maior povo, com os fatos reais: guerras, conquistas, rachas, cidades, descobertas, nascimentos, mortes e intervenções divinas.
- **Lendas**: heróis e profetas (com o fim de cada um), vulcões e seus mortos, o Kraken, feras devoradoras de gente e feras lendárias, guardiões domados, invernos sem fim e desertos que surgiram, pragas de gafanhotos, cidades afogadas, ilhas que subiram do mar, maravilhas, megalópoles, eras de ouro, profecias cumpridas.
- **Cavernas**: cada caverna do mundo, quem a descobriu, as pinturas das paredes, os túmulos, o oráculo e o que ele disse, os bandidos que passaram por lá — com um botão para ver o interior.
- **Bestiário**: todas as espécies do mundo em níveis da cadeia alimentar, com população, tendência, nascimentos, mortes por causa (fome, velhice, caçadores, cada predador) e extinções. Clique numa espécie para destacar o que ela come e quem a caça.
- **Povos** e **Profecias**: a história de cada povo e o destino de cada palavra dita.

## Histórias

O mundo cria os fatos; um **diretor de histórias** procura histórias dentro deles. Ninguém escreveu nenhuma delas para esta partida: cada uma começa de algo que **aconteceu de verdade** — uma morte vista de perto, alguém levado acorrentado, uma fuga do cativeiro, uma cidade perdida, uma fera que matou um pai, um conto que uma criança ouviu junto à fogueira — e só segue o que o mundo faz depois. Nunca se inventa passado.

- **Como nasce**: o mundo emite sinais → viram **fatos** (com lugar, testemunhas, quem sabe o quê e a guerra que os causou) → cada tipo de história avalia se ali há uma **semente** → o **diretor** escolhe poucas para acompanhar (3 a 9, conforme a população). Ele evita duas do mesmo tipo ao mesmo tempo, tragédias demais seguidas, várias histórias da mesma batalha; o que mostrou há pouco (o tipo, o tom, o parentesco, o lugar, o desfecho, até o título) pesa menos e volta a valer com o tempo. Sementes cujo protagonista morreu ou cujo motivo deixou de existir somem.
- **Os tipos** (primeira biblioteca): **Vingança** (só jura quem sabe quem matou), **Resgate** de um parente cativo, **Volta para casa** (a fuga do cativeiro ou a saudade de um povo libertado), **Reconquista** (um governante que não esquece a cidade perdida), **O Sonho** (uma criança que ouviu falar de um lugar real e quer vê-lo um dia), **Peregrinação** (um devoto que perde alguém e promete ir a um oráculo, a uma maravilha, ao templo da capital) e **A Caçada** à fera que matou alguém da família. E as histórias das riquezas e do mundo vivo: **A Fera Rara** (um caçador atrás do tigre branco que apareceu perto da cidade — pela fortuna, pela glória ou, se for devoto, só para vê-lo de perto e deixá-lo ir), **A Caravana** (o mercador cuja estrada ganhou nome: as viagens, os ladrões, a guerra que fecha o caminho, até a família virar uma casa de mercadores, conquistar o monopólio ou chegar ao conselho que governa), **O Palácio** (o governante vaidoso e a sua obra: as pedras, o imposto, o povo resmungando, as visitas ao canteiro, o dia em que fica pronto — ou o trono perdido antes disso, e o herdeiro que manda continuar), **A Pérola Negra** (o mergulhador que achou uma: vender na capital, dar a quem ama ou devolver ao mar — e o governante cobiçoso que manda os guardas), **A Cegonha** (a casa que espera um filho com cegonhas no telhado, ou a criança que conta os dias até os filhotes voarem), **A Travessia** (um jovem que anda até o vau para ver a manada cruzar o rio, com os crocodilos esperando) e **A Guerra pela Riqueza** (o governante que foi à guerra pelo café, pelas especiarias ou para proteger uma rota, até tomar as terras ou voltar sem nada). E as histórias do poder: **O Cadafalso** (alguém que você ama será enforcado ao meio-dia: juntar quem vem junto, levantar a praça ou subir no cadafalso — e às vezes ser pego e subir nele também), **A Insurreição** (o trono matou alguém seu: reuniões à noite, longe das casas, com os poucos que ousam, um a um mais gente, um traidor de vez em quando, e o dia do levante), **O Que Viu na Noite** (a testemunha dos capuzes, seguida pelas ruas), **O Inquérito** (achar uma ordem secreta — se ela existe), **A Causa dos Mercadores** (o confisco, a mesa dos fundos, o ouro que paga as tochas) e **A Conspiração** (a faca e a coroa).
- **Premissas verdadeiras**: cada pessoa guarda o que **já viu com os próprios olhos** (o mar, uma montanha, um lago, uma cachoeira, uma caverna, uma maravilha). Só sonha com o mar quem mora longe dele e nunca o viu — e a viagem vai até a costa mais próxima de casa. O lugar sonhado fica de verdade longe (um quarto do mapa ou mais), na mesma terra, e quem já mora ao lado de um lago não sonha com outro. Peregrinação é estrada, não passeio: o lugar santo fica bem longe da vila (o oráculo onde o morto servia, a maravilha, o templo da capital em outra cidade).
- **Viagens de verdade**: quem parte leva pão da despensa, se despede de quem estiver por perto, e o caminho escreve os capítulos do que o mundo mostrar — um passo de montanha, um lago, uma cachoeira, um vau, a cidade de outro povo (ou a volta longe dela, se há guerra), a chegada a outra terra (pântano, deserto, tundra), a chuva ou a tempestade. Se a noite pega na estrada, acendem um **foguinho** e dormem ao relento. A chegada é escrita pela hora, pelo tempo e pelo lugar; depois vem **a volta**, e quem viu o mar conta às crianças — que às vezes começam a sonhar também.
- **Missões com ação**: quem tem coragem vai **buscar o cativo de noite** — espera escondido nos arredores, entra quando todos dormem, e o mundo decide se há alguém acordado (pode libertar, ser pego, ou ter que correr); quem jurou vingança e vê o assassino **acorrentado na própria cidade** vai ficar frente a frente com ele — e o que faz é quem é: o cruel mata ali mesmo, o devoto **perdoa**; depois do acerto, uma visita ao **túmulo** de quem foi vingado. O caçador espera a fera **na boca da toca**.
- **As pessoas agem, um pouco**: quem carrega uma história usa parte do tempo livre nela — treina com a lança no fim do dia, vai à beira da cidade olhar para onde levaram alguém, viaja, reza, segue o rastro da fera; se alista quando há guerra contra o povo do inimigo e o procura no campo de batalha; um vingador cujo alvo é o próprio governante dá ouvidos a uma conspiração; um governante que perdeu uma cidade pende para a guerra que a retome. Fome, sono, perigo e o trabalho de todo dia vêm antes (quem está na estrada não é chamado para buscar água nem para a festa). O diretor nunca teletransporta, ressuscita, protege ou força encontros: o que acontece é do mundo. (Só o **modo desenvolvedor** força alguma coisa — e só quando você pede.)
- **Companheiros**: ninguém precisa ir sozinho. Numa vingança, num resgate, numa caçada, numa peregrinação, num levante, quem carrega a história **pede** a alguém que vá junto — um irmão que perdeu o mesmo pai, a companheira, um caçador da vila — e a pessoa **responde pelo que é**: aceita ("aonde você for, eu vou", "eu também perdi alguém") ou recusa (tem filhos pequenos, tem medo, "não é assunto meu", está velha demais para a estrada). Às vezes alguém **se oferece** antes de ser chamado, e o protagonista aceita ou manda de volta. O grupo anda junto, acampa junto, para junto no fim do caminho e **luta junto**; quem cai fica registrado na história. As decisões passam por um ponto único, pronto para o futuro **modo encarnado**: quando houver um jogador vivendo uma pessoa, o convite espera a resposta dele.
- **Saber não é a verdade**: cada pessoa sabe o que **viu**, o que **soube pela família**, o que **ouviu contar** ou o que **todos dizem**.
- **Fins de verdade**: cumprida, fracassada, **roubada pelo destino** (outro matou o alvo), abandonada, **transformada** (a vingança que vira prece), esquecida, interrompida, reencontro — e **herdada**: um filho, um irmão ou o companheiro pode levar a promessa adiante.
- **Histórias se cruzam**: o assassino de uma é o cativo de outra; quem foi resgatado numa é o vingador da seguinte.
- **Painel Histórias** (`K` ou a pena no topo): um livro — cada história tem sua cor e seu emblema, a frase que a resume, o retrato do protagonista, a **trilha de etapas** (o conto → crescer → a partida → a estrada → o lugar → a volta…), o **mapa da jornada** com a casa, o destino, o caminho que a pessoa realmente andou e onde cada capítulo aconteceu, os capítulos numerados e com título (◎ leva a câmera ao lugar), quem mais está nela, a situação agora e o que ainda pode acontecer, e o **selo do desfecho**. Botões para ver a pessoa, **segui-la** ou ir até lá. Quando uma história começa ou chega ao clímax, um **cartão** desliza na tela (Ler · Seguir); um **losango colorido** flutua sobre quem carrega uma história; e a ficha de cada pessoa mostra as histórias de que ela faz parte.
- **Cenas (as missões encenadas)**: os momentos decisivos não são só escritos — são **encenados** pelas pessoas do mundo, com direção, diálogo e câmera própria. Um motor de cenas (`G.Scene`) toma emprestadas as pessoas da cena (o que estavam fazendo volta depois), leva cada uma ao seu lugar sem ser visto e só então abre a tela; faz falar em **balões que se escrevem letra a letra** (dizer, gritar, sussurrar, pensar, cantar), mudar de pose (ajoelhar, apontar, implorar, abraçar, cortar corda, sacar a faca, esconder-se, jurar), andar, correr, esgueirar-se, seguir alguém — e **espera o mundo** quando é o mundo que decide (a fera morre? o guarda acorda? a reunião chegou ao rito?). Na tela: faixas de cinema, cartão de título, legendas com retrato, nomes sobre as pessoas, música e golpes de som, **câmera lenta** no instante que importa, tremor, clarão. O sol anda mais devagar enquanto uma cena está na tela. Cada cena deixa suas falas e quadros no capítulo da história.
  - **O Cadafalso**: o pregão e o cesto que cai, o sussurro na cela à noite, o plano em volta da lanterna, a praça ao meio-dia (fogo no celeiro, a flecha na corda, a multidão, ou uma faca sozinha), a fuga, a fogueira na mata — ou o corpo descido de noite e um juramento.
  - **O Inquérito**: a ordem diante do trono (e, às vezes, quem ordena é um deles — só você sabe), a velha do poço, a cera e o sangue onde ninguém vai, a **vigília**: as figuras chegando uma a uma no escuro, o braseiro, o cântico, alguém de joelhos no círculo, o graveto que estala e o capuz que vem com a tocha — a perseguição no escuro com gritos atrás — ou o mestre que tira o capuz; depois a palavra no palácio, as portas batidas ao amanhecer, ou a faca no caminho de casa de quem contou a quem não devia.
  - **O Que Viu na Noite**: a manhã sem comer, os passos que param quando você para, o convite com manto, o saco de moedas na porta.
  - **Vingança**: o juramento sobre o corpo; o assassino acorrentado frente a frente — a faca na mão, o juramento lembrado, e então o golpe, o perdão ("a faca cai na terra") ou "ainda não"; o túmulo, contado que está feito; e **o duelo**: quando os dois estão de verdade na mesma luta (os dois povos em guerra, os dois combatendo, a poucos passos), a batalha abre espaço — câmera lenta, o nome gritado, a resposta de quem matou (o firme, o cínico, o medroso), as armas erguidas — e só então o capítulo "Frente a frente" é escrito; depois os dois lutam até o fim, e ninguém mais se mete entre eles. Quem cai, quem é rendido, ou a batalha que separa os dois ("não acabou") decide o resto. Um acampamento não é um campo de batalha: levar comida à fogueira ao lado do inimigo não é encontrá-lo.
  - **Resgate**: a noite na cidade inimiga, o guarda com a tocha, o sussurro, as correntes cortadas, a corrida.
  - **Caçada / Fera Rara**: o rastro, a fera saindo do mato, a luta viva até o fim — ou os olhos do bicho branco, vistos enfim e deixados ir.
  - **Insurreição** (a vela e o nome jurado), **Causa dos Mercadores** (a mesa dos fundos, o ouro e as tochas), **Conspiração** (as facas sob os mantos, "GUARDAS!", a coroa e os joelhos em volta), **Pérola Negra** (o presente de olhos fechados, o mar que recebe de volta, o mercador que morde para ver se é vidro), **Cegonha** (os filhotes vistos da rua), **Palácio** (o governante diante dos andaimes: mais alto).
  - **Jornadas**: a partida na porta (o abraço, a criança que pede algo do fim da estrada), a primeira fogueira, a **chegada** (a câmera mostra o lugar inteiro e desce até quem andou tanto) e a volta, com as crianças correndo na frente.
  - **O momento**: em qualquer história seguida, um capítulo forte que acontece perto do protagonista vira um plano curto sobre ele, com o texto na tela.
- **Acompanhar uma missão**: **Seguir** uma história faz as cenas dela abrirem sozinhas (inclusive a próxima logo depois de uma que terminou). Um cartão no canto mostra a etapa, o que a pessoa está fazendo agora e o **próximo momento com contagem regressiva**, marcado no mapa e por uma **seta na borda da tela**; ⏩ **avança o mundo** e para pouco antes. Uma cena forte de outra história levanta o aviso **AGORA** (Assistir); cenas perdidas ficam guardadas para **rever** com falas e quadros. Cartões de história esperam a cena acabar.
- Só os clímax de verdade viram aviso; entram na **Crônica** e, quando excepcionais, nas **Lendas**; o **modo cinema** às vezes filma o momento; e os **velhos contam junto à fogueira** as histórias que acabaram. Tudo é salvo com o mundo e sobrevive a mortes, conquistas, extinções e ao Avançar no tempo.

## Modo desenvolvedor

Uma bancada para quem faz o jogo: ver o que é raro, o que é tardio e o que deu errado — sem esperar a sorte. Abre com **`F2`**, com **Modo desenvolvedor** no menu (`Esc`) ou com **`?dev`** no fim do endereço; fica ligado neste navegador até você desligar (⏻ no painel). O painel fica ao lado do mundo, que **continua vivo** (não é uma janela que pausa), e um selo no canto mostra ano, população, quadros por segundo, parâmetros alterados e avisos de erro. Tudo o que ele faz passa pelas **funções do próprio jogo**: uma guerra forçada é declarada como qualquer guerra, uma vingança nasce de uma morte de verdade diante de uma testemunha de verdade — então o que se vê é o que o jogo faria, e um teste no painel testa o caminho inteiro.

- **Tempo**: velocidades até 64× (acima de 16×, o quanto a máquina aguenta), a hora do dia, **avançar 1 a 100 anos** (mundo livre ou anos de paz e fartura), pular até a primeira cidade, metrópole, megalópole ou guerra; **momentos guardados** A, B e C para voltar ao mesmo instante e repetir um teste ou reproduzir um bug; mundos novos de teste com um clique (ilha, continente, mar aberto, arquipélago belicoso, istmo, colossal).
- **Povos**: escolha o povo A e o povo B — famílias, fartura, a próxima arte ou todas; golpe, revolução, levante, revolta popular (pelo motivo que quiser), matar o governante (quem herda?), execução pública, sacrifício, mudar o regime, festival (ou grandioso), sociedade secreta, imigrantes, doença; conhecerem-se, guerra, paz, aliança, ódio mortal, uma campanha agora.
- **Guerra**: a **Guerra Mundial** (pelo motivo do mundo ou o que você escolher), **preparar o mundo** para ela, **avançar 60 anos de fartura e começá-la** (com impérios, que é quando ela é grande), ou esperar que nasça sozinha; as guerras, batalhas e exércitos em curso, com ir até e paz.
- **Mar**: o diagnóstico do povo (o que o impede de partir, o amor ao mar, a vontade), preparar (navegação, doca, barcos), expedição solitária, média ou grande, colônia, frota de guerra, invasão por mar, afundar um navio de expedição, tempestade; as expedições no mar, para seguir.
- **Histórias**: todos os tipos, com as ativas e as sementes de cada um. **Criar** faz acontecer o fato que dá origem à história (uma morte diante de um parente, uma captura, uma fera com nome que mata alguém, uma condenação, um levante, uma grande expedição, um naufrágio, uma convocação, um bicho raro perto da cidade) e a segue; **esperar** avança o tempo até nascer uma semente daquele tipo; **promover** transforma a melhor semente em história agora. As ativas mostram a fase, o que o protagonista faz agora e o próximo momento, com **até o próximo capítulo**. Para cada vingança, **forçar o encontro** põe os dois numa escaramuça a poucos passos — e a lista de condições do duelo (✓/✗) mostra por que ele ainda não aconteceu. **Diretor solto**: mais histórias ao mesmo tempo, mais depressa, sem fadiga.
- **Raros**: tempestade, seca, lobos, doença, fertilidade, descoberta, manada, imigrantes; um bicho de pelagem rara ou uma **fera devoradora** perto da câmera; e **esperar até acontecer** — o tempo corre até a coisa acontecer e a câmera vai até lá: Guerra Mundial, guerra, batalha em campo aberto, batalha naval, cerco, golpe, revolução, tirano, revolta, execução, festival, sociedade secreta, coroação, cidade conquistada, povo extinto, secessão, peste, maravilha, cidade nova, profecia, sacrifício, expedição, naufrágio, náufrago, colônia, primeiro contato, bicho raro, fera devoradora.
- **Parâmetros**: multiplicadores que mudam as chances do mundo — Guerra Mundial, vontade de guerra, eventos, nascimentos, pesquisa, revoltas, vontade de ir ao mar, pelagens raras, e o diretor de histórias (quantas ao mesmo tempo, o ritmo, a fadiga). 1 é o jogo como ele é; 0 desliga; 10 é dez vezes mais. Atalhos: Caos, Paz total, Histórias ao máximo, Raridades, Crescimento turbo. Só valem com o modo ligado.
- **Inspeção**: os números do mundo agora; **rótulos sobre as pessoas** (a tarefa, a história, vida/fome/energia, o id); **caçar bugs** (gente dentro d'água sem nadar, fora do mapa, presa numa cena que acabou, com o caminho falhando; povos sem capital ou com governante morto; histórias paradas, atrasadas ou com protagonista morto; expedições sem navio nem gente; batalhas abertas há dias; bandos vazios) com **ir** até cada problema, e um **vigia** que procura sozinho a cada 10 s; os **erros e avisos que o jogo engoliu** para não parar; **onde o tempo da máquina vai** (cada sistema, em milissegundos por segundo); os **sinais** que o motor de histórias ouviu; o **estado bruto** de quem está selecionado (com matar, curar, envelhecer, coroar). **Copiar relatório** junta tudo — o mundo, os povos, as histórias, os problemas, os erros, os sinais e a crônica recente — para colar numa conversa e investigar.

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
js/wars.js        guerras como história: tensão, causas, nomes, objetivos, mobilização, exércitos de campanha, batalhas e cercos registrados, ocupação, desgaste, tratados, refugiados
js/wars-ui.js     painel Guerras: guerras, tensões, exércitos, batalhas, cercos
js/story-war.js   A Convocação: a guerra vista de uma casa (o chamado, a coluna, a véspera, a volta ou a notícia)
js/politics.js    líderes, dinastias, governos, lealdade, rachas, golpes, tirania, diplomacia
js/polity.js      regimes e economia de cada povo, os grupos (nobreza, mercadores, sacerdotes, militares, artesãos, povo), decisões do governante, petições, revoluções com propósito, eleições, o painel de política
js/justice.js     execuções públicas: sentença com hora marcada, cadafalso, arauto, carrasco, multidão que reage, forca/machado/espada/fogueira/cruz/pedras, sacrifício na pirâmide, corpos expostos, presos esperando a vez
js/riots.js       motins: tochas na praça, a marcha, fogo e saque, a guarda, os desfechos (esmagado, concessão, disperso, revolução)
js/secrets.js     sociedades secretas: fundação, membros de vários reinos, reuniões à noite com mantos, rituais, testemunhas, boatos verdadeiros e falsos, inquéritos, caça às bruxas, influência política
js/war.js         exércitos, combate, saques, conquista, massacres, torres, cativos, revoltas, ameaça sobre uma cidade
js/worldwar.js    a guerra mundial: motivos, blocos, aliados sem paz separada, paz geral
js/city.js        níveis de cidade, novos edifícios, plano de ruas e vielas, calçamento, estradas, rotas, carroças, aquedutos
js/sea.js         o mar: fundo e água transparente (uma camada lisa por cima), recifes, kelp, buracos azuis, pilares, arcos, grutas marinhas, gelo, marés, mariscos, cardumes, caranguejos, mar que brilha, tartarugas, baleia encalhada
js/naval.js       portos, navios, rotas, abordagem, brulotes, destroços, naufrágios
js/seaknow.js     o que cada povo sabe do mundo: regiões (desconhecida → habitada), quem carrega as notícias, boatos com origem que mudam no caminho, nomes dados às terras
js/fishers.js     o pescador de verdade: galpão, redes, embarque, pesqueiro, caixas, descarga, armazém, redes no varal, estaleiro, barcos por cultura
js/expeditions.js expedições: motivos, temperamento marinho, preparação, despedida, viagem e seus acontecimentos, descoberta, primeiro contato, volta, perda, náufragos, colônias
js/fleets.js      frotas de guerra: almirante, tripulação, formações, moral, batalhas no mar, abordagem, bloqueio, corsários, invasão anfíbia com transportes e cabeça de praia
js/sea-ui.js      painel do mar: expedições e o livro da viagem, frotas e batalhas, mapa do conhecimento de cada povo
js/story-sea.js   Além do Horizonte (a viagem vista do cais: despedida, vigília, volta, notícia) e O Náufrago (a praia, as marcas, a jangada, a volta)
js/siege.js       arqueiros, tropas de elite, muralhas, portões, aríetes, catapultas, torres de cerco, escadas, sapadores, óleo fervente, peste, sacrifícios
js/economy.js     economia urbana: ofícios, currais, minas, forja, tecelagem, mercados, feira, taverna, impostos, crime
js/estates.js     propriedades: pomares, plantações, vinhedos, apiários, salinas, casa da seda, salga; os grãos de cada terra
js/court.js       a vaidade de cada governante (paço, palácio, grande palácio, palácio colossal), tributo e cobradores, a taverna de noite
js/waters.js      os peixes de cada água e clima, o que valem, quem vive da pesca, os mergulhadores de pérolas
js/trade.js       comércio de luxo: caravanas com cavalo de carga, rotas com nome, casas de mercadores, conselho, monopólios, cobiça, roubos, navios
js/festivals.js   calendário de festas de cada civilização: procissões, ritos, jogos, sacrifícios, o Fogo Novo
js/stories.js     motor de histórias: sinais do mundo, fatos com testemunhas e causa, quem sabe o quê, sementes, diretor (capacidade, fadiga, ritmo), histórias como máquinas de estado abertas, storylets, herança, empurrões de comportamento, contexto para um futuro modo aventura, save/load
js/story-world.js o que cada pessoa já viu, distâncias reais, direções, marcos no caminho, palavras para hora, tempo e terra, costumes de cada povo, a fogueira de quem dorme na estrada
js/story-lib.js   biblioteca de histórias: vingança, resgate, volta para casa, reconquista, sonho, peregrinação, caçada — com seus textos e variantes por civilização
js/story-riches.js histórias das riquezas e do mundo vivo: fera rara, caravana, palácio, pérola negra, cegonha, travessia, guerra pela riqueza
js/story-party.js companheiros: convite, oferta, aceitar ou recusar pelo que cada um é, o grupo que anda, acampa e luta junto; ganchos para o futuro jogador
js/story-politics.js histórias do poder: o cadafalso, a insurreição, a testemunha, o inquérito, a causa dos mercadores, a conspiração
js/talk.js        balões de fala: máquina de escrever, gritar, sussurrar, pensar, cantar
js/scene.js       motor de cenas: elenco emprestado, caminhar até o lugar sem ser visto, falas, poses, câmera de cena, faixas, títulos, legendas, câmera lenta, objetos de cena, flechas, registro das falas e quadros
js/story-cadafalso.js O Cadafalso encenado: pregão, cela, plano, praça, mata, luto
js/story-secrets.js O Inquérito e O Que Viu na Noite encenados: ordem, pistas, vigília, perseguição, denúncia, batida, a faca no caminho; a manhã, os passos, o convite, as moedas
js/story-roads.js a estrada encenada: partida, fogueira, chegada por tipo de lugar, volta
js/story-deeds.js vingança, resgate, caçada e insurreição encenadas; o momento das histórias seguidas
js/story-fortunes.js causa dos mercadores, conspiração, fera rara, pérola, cegonha e palácio encenados
js/story-track.js acompanhar a história seguida: cartão, próximo momento, marcador e seta, avançar até lá, AGORA, cenas perdidas
js/story-ui.js    painel Histórias, linha na ficha da pessoa, histórias contadas pelos velhos, cenas do cinema
js/life.js        biografia viva, família no fim da tarde, histórias dos velhos, aprendizes, água e filas, fileiras e chamada ao trabalho
js/carnage.js     guerra que pesa: sangue, membros decepados, corpos que apodrecem, coveiros, piras, a doença dos mortos
js/army.js        exércitos: recrutamento, companhias, oficiais, formações, moral, planos de ataque e de defesa, cercos
js/villagers.js   IA dos habitantes (necessidades, decisões, tarefas)
js/pets.js        animais da cidade: cães, gatos, galinhas e pombos
js/animals.js     mais de 70 espécies, habitats, capim, cadeias alimentares, bote, flanco, árvore, cipó, luto, pelagens raras, caça, filhotes, guardiões
js/flora.js       árvores que dão fruto (o fruto no galho), quem come, colheita com cesto, colmeias selvagens e o mel tirado com fumaça
js/riches.js      as 25 riquezas: catálogo, preços, caça que esfola e volta com a pele, peles raras, reservas, o que se vê na feira
js/migrate.js     as grandes migrações: savana atrás das chuvas, bisões, renas, gansos e cegonhas em V, a subida dos salmões e os ursos
js/nests.js       ninhos (árvore, telhado, paredão, chão) com ovos e filhotes, quem para para olhar, castores e represas
js/powers.js      poderes divinos e percepção
js/miracles.js    Terra, Mar, Palavra, eras de ouro, maldições, heróis, muralhas divinas
js/wild.js        aba Natureza: chamar animais, primavera, migração, domar, clima, gafanhotos, feras lendárias
js/winter.js      aba Natureza: o Inverno Súbito (gelo que vira chão, neve que mata a colheita, o degelo)
js/dragon.js      aba Ira: o Dragão (covil, rasantes de fogo, o ouro roubado, os bravos no covil, o Matador de Dragões, os ossos)
js/seapart.js     aba Mar: Abrir o Mar (o fundo que vira chão entre duas paredes de água, os peixes na areia, a travessia, o fechamento)
js/citygifts.js   aba Cidade: Chuva de Ouro (o povo cata as moedas) e Vinho nos Poços (bebem, dançam, ressaca)
js/beyond.js      aba Além: Ressurreição (do corpo ou da cova) e Fantasmas (assombram, apontam segredos)
js/fates.js       Amor Divino e Duelo de Campeões (Destino), Sonho Coletivo (Palavra)
js/caves.js       a camada de baixo: cavernas, bocas de cada tipo, níveis de piso, abismos, galerias, rios e lagos subterrâneos, veios, bichos do escuro, morcegos, ursos, pinturas, tumbas reais, oráculo, refúgio, abrigo na tempestade, desafio do eco, minas em galerias, bandidos, poderes Abrir Gruta e Desabamento
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
js/cinema.js      modo cinema: o diretor que escolhe as cenas, a câmera, as legendas; a câmera de guerra (frentes, alertas, cenas táticas)
js/photo.js       modo foto: congelar, filtros, miniatura, moldura, salvar PNG
js/timeskip.js    avançar no tempo: anos que passam sem desenhar, mapa em time-lapse, anos de paz e fartura, resumo; a procura do modo desenvolvedor
js/main.js        loop, input, câmera, menu, introdução
js/devmode.js     modo desenvolvedor: tempo, povos, guerra, mar, histórias (receitas, sementes, diretor), raros, parâmetros, inspeção
```
