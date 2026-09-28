# GOD OF THE ANT FARM

> *Watch them live. Help them prosper. Or remind them who their god is.*

Um jogo de simulação divina que roda direto no navegador. Ilhas, continentes e arquipélagos procedurais, povos autônomos que crescem, viram reinos, negociam, se casam, racham, guerreiam, escravizam e se libertam — e você: uma entidade que observa e interfere.

## Como jogar

**Abra `index.html` no navegador** (Chrome, Edge, Firefox ou Safari recentes). Só isso: não precisa de servidor, build ou instalação. Tudo é JavaScript puro + Canvas 2D, sem bibliotecas externas.

> Se preferir servir por HTTP: `npx serve .` ou `python3 -m http.server` dentro desta pasta.

Em **NEW WORLD** você escolhe o **mapa** (Ilha, Continente, Arquipélago ou Istmo), o **tamanho** (64, 80 ou 96), quantos **povos** despertam (1 a 4) e o **temperamento** deles (pacíficos, imprevisíveis ou belicosos).

O jogo salva automaticamente no `localStorage` do navegador (a cada 45 s e ao fechar a aba). Use **CONTINUE** no menu para voltar ao seu mundo. Saves da versão anterior (um só povo) são convertidos automaticamente.

## Controles

| Ação | Controle |
|---|---|
| Mover a câmera | arrastar com o mouse (botão esquerdo ou direito) · `WASD` / setas |
| Zoom | roda do mouse · pinça no touch |
| Ver detalhes | clique num habitante, animal ou construção |
| Seguir alguém | duplo clique no habitante · `F` |
| Poderes | barra inferior ou teclas `1`–`6` da aba atual, depois clique no mapa |
| Trocar aba de poderes | `Tab` (Dádivas · Ira · Destino) |
| Painel dos reinos | `R` · ou clique no chip do povo no topo |
| Mostrar/ocultar fronteiras | `B` |
| Cancelar poder | botão direito · `Esc` |
| Pausar | `Espaço` |
| Velocidade | botões 1x / 2x / 4x · `+` / `-` |
| Crônica | `H` |
| Árvore genealógica | `T` (com alguém selecionado) |
| Menu | `Esc` |

## O que acontece na ilha

- **Habitantes autônomos** com nome, idade, personalidade (corajoso, curioso, devoto, romântico…), fome, energia, vida, devoção e medo. Uma *utility AI* escolhe o que fazer a cada momento: trabalhar, comer, dormir, socializar, cortejar, rezar, explorar — e emergências (fogo, meteoros, lobos) passam na frente de tudo.
- **Trabalho real**: lenhadores derrubam árvores e carregam a madeira, coletores colhem frutas, pescam e caçam, agricultores plantam e colhem trigo, mineiros quebram pedra, construtores buscam material no armazém e erguem as obras em etapas visíveis (fundação → estrutura → pronto). Os números da interface são o estoque real.
- **Trilhas emergentes**: os caminhos mais usados viram estradas de terra.
- **Famílias**: casais se formam, bebês nascem, crianças brincam e crescem, idosos morrem. Cemitérios, luto, funerais e árvore genealógica.
- **Progressão orgânica**: Acampamento → Aldeia → Povoado → Comunidade Agrícola → Vila Artesã → Vila Sagrada → Vila Desenvolvida → Pequena Civilização. Com gente suficiente, grupos partem para fundar novos assentamentos.
- **Natureza viva**: florestas que se espalham e regeneram, coelhos, cervos, javalis e lobos, peixes pulando, pássaros, vaga-lumes, nuvens, chuvas, tempestades, secas.
- **Fogo de verdade**: se espalha com o vento, queima árvores, plantações e casas; moradores formam brigadas com baldes do poço; a chuva apaga.
- **Dia e noite** com janelas acesas, tochas, fogueiras e braseiros.
- **Eventos com moderação**: tempestades, secas, lobos, febre, estações de fertilidade, descobertas, viajantes chegando de barco.

## Povos, reinos e guerras

- **Vários povos** começam em cantos distantes do mapa, cada um com cor, bandeira, estoque, território (fronteiras desenhadas no chão) e era próprios. Quando se encontram, a história começa.
- **Líderes com personalidade**: cada governante tem agressividade, crueldade, devoção e ambição. Títulos e numerais dinásticos (*Rainha Mara II*), epítetos conquistados em vida (*o Conquistador*, *a Pia*, *o Sanguinário*, *a Libertadora*, *o Breve*…) e uma coroa na cabeça.
- **Governos que mudam**: Tribo → Chefia → Reino; Teocracia sob líderes devotos; **Tirania** sob líderes cruéis ou usurpadores; **Conselho** depois de uma revolução; **Povo Livre** fundado por ex-cativos.
- **Lealdade e rachas**: cada vila tem lealdade (distância da capital, fome, guerra, tirania, conquista recente, orgulho local). Vilas infelizes declaram **independência** e viram povos novos. Na morte de um rei, um nobre ambicioso pode recusar o herdeiro: **guerra de sucessão**.
- **Golpes e revoluções**: ambiciosos conspiram e tentam matar o governante; tiranos executam em praça pública (todos assistem, o medo cresce); o povo pode se levantar e derrubar o tirano.
- **Diplomacia visível**: primeiro contato, emissários que caminham até a capital vizinha com presentes, propostas de paz ou de aliança (e às vezes são executados), caravanas de comércio, casamentos entre povos e **casamentos reais**, tréguas, tributos e **vassalagem**. Aliados entram nas guerras uns dos outros.
- **Guerra**: guerreiros com escudo na cor do povo, quartéis, torres de vigia com arqueiros. Exércitos se reúnem, marcham com porta-estandarte e atacam para **saquear**, **fazer cativos**, **conquistar** vilas ou — sob líderes cruéis — **massacrar** e incendiar. Defensores lutam, crianças e idosos se escondem em casa. Batalhas viram relatos na crônica; heróis ganham fama.
- **Cativos**: levados amarrados, fazem trabalho forçado (inclusive nas obras do tirano), dormem no **cercado**, rezam por liberdade, fogem à noite, são recapturados, se revoltam — e às vezes fundam um povo livre. Líderes clementes os aceitam como membros com o tempo; conselhos abolem o cativeiro.
- **Queda de povos**: capitais são tomadas, povos inteiros deixam de existir; os últimos sobreviventes se juntam a vizinhos ou se rendem.

## Poderes divinos

Os poderes ficam em três abas (`Tab` troca):

| Aba | Poder | Custo | Efeito |
|---|---|---|---|
| Dádivas | Chuva | 10 | Rega, apaga incêndios, encerra secas |
| Dádivas | Crescimento | 14 | Árvores, frutos e trigo crescem na hora |
| Dádivas | Cura | 12 | Cura feridos e doentes |
| Dádivas | Fertilidade | 30 | Dois dias de colheitas e nascimentos abundantes |
| Dádivas | Mão Divina | grátis | Pegue alguém, solte ou arremesse (assusta) |
| Ira | Raio | 18 | Mata, fere, incendeia — tiranos também sangram |
| Ira | Meteoro | 70 | Sombra crescente, pânico, impacto, onda de choque, cratera — e pedra de presente |
| Ira | Matilha | 22 | Invoca lobos famintos |
| Ira | Terremoto | 55 | Construções racham e desabam, árvores tombam, pedras brotam |
| Ira | Praga | 32 | Uma doença muito contagiosa nasce no ponto escolhido |
| Destino | Ungir | 45 | Quem você tocar passa a governar seu povo; um cativo ungido lidera a fuga dos outros |
| Destino | Libertação | 30 | Quebra as correntes dos cativos e salva condenados da execução |
| Destino | Fúria | 35 | Força redobrada na área — e o povo atingido parte para a guerra |
| Destino | Discórdia | 40 | A lealdade de uma vila despenca e os vizinhos passam a se odiar |
| Destino | Paz Divina | 80 | Encerra todas as guerras; ninguém declara guerra por dois dias e meio |

**Preces**: em momentos difíceis (seca, incêndio, doença, fome, lobos, invasores, cativeiro, tirania) a vila reza pedindo algo específico. Um aviso dourado aparece sobre a barra de poderes — clique nele para ir até lá com o poder certo selecionado. Atender faz a devoção disparar; ignorar custa devoção.

**Fé** é o recurso dos poderes. Ela nasce da **devoção** (quando você ajuda) e do **medo** (quando você castiga). Medo também rende fé, mas deixa o povo lento e menos fértil — e quem perde parentes para a sua fúria perde a devoção. O painel inferior mostra como eles te enxergam: *Um mistério*, *Protetor*, *Deus amado*, *Deus temido*, *Tirano divino*…

## Estrutura do código

```
index.html        HUD, menus e ordem dos scripts
css/style.css     interface
js/util.js        RNG, ruído, heap, nomes
js/world.js       estado, geração dos mapas (ilha, continente, arquipélago, istmo), pathfinding A*
js/nature.js      árvores, arbustos, rochas, fogo, clima, nuvens
js/village.js     construções, planejador, empregos, moradia, crônica, marcos, fé
js/factions.js    povos: cores, bandeiras, estoques, território e fronteiras
js/politics.js    líderes, dinastias, governos, lealdade, rachas, golpes, tirania, diplomacia
js/war.js         exércitos, combate, saques, conquista, massacres, torres, cativos, revoltas
js/villagers.js   IA dos habitantes (necessidades, decisões, tarefas)
js/animals.js     presas e predadores
js/powers.js      poderes divinos e percepção
js/events.js      eventos e viajantes de barco
js/fx.js          partículas e efeitos
js/art.js         arte procedural (sprites e vetores)
js/render.js      renderizador isométrico, iluminação, clima
js/audio.js       áudio sintetizado com WebAudio (efeitos, ambiente, música)
js/save.js        salvar / carregar
js/ui.js          interface
js/main.js        loop, input, câmera, menu, introdução
```
