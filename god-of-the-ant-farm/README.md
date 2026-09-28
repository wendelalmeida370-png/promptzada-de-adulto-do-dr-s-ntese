# GOD OF THE ANT FARM

> *Watch them live. Help them prosper. Or remind them who their god is.*

Um jogo de simulação divina que roda direto no navegador. Uma pequena ilha procedural, um punhado de habitantes autônomos e você: uma entidade que observa e interfere.

## Como jogar

**Abra `index.html` no navegador** (Chrome, Edge, Firefox ou Safari recentes). Só isso: não precisa de servidor, build ou instalação. Tudo é JavaScript puro + Canvas 2D, sem bibliotecas externas.

> Se preferir servir por HTTP: `npx serve .` ou `python3 -m http.server` dentro desta pasta.

O jogo salva automaticamente no `localStorage` do navegador (a cada 45 s e ao fechar a aba). Use **CONTINUE** no menu para voltar ao seu mundo.

## Controles

| Ação | Controle |
|---|---|
| Mover a câmera | arrastar com o mouse (botão esquerdo ou direito) · `WASD` / setas |
| Zoom | roda do mouse · pinça no touch |
| Ver detalhes | clique num habitante, animal ou construção |
| Seguir alguém | duplo clique no habitante · `F` |
| Poderes | barra inferior ou teclas `1`–`8`, depois clique no mapa |
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

## Poderes divinos

| | Poder | Custo | Efeito |
|---|---|---|---|
| 1 | Chuva | 10 | Rega, apaga incêndios, encerra secas |
| 2 | Crescimento | 14 | Árvores, frutos e trigo crescem na hora |
| 3 | Cura | 12 | Cura feridos e doentes |
| 4 | Fertilidade | 30 | Dois dias de colheitas e nascimentos abundantes |
| 5 | Raio | 18 | Mata, fere, incendeia |
| 6 | Meteoro | 70 | Sombra crescente, pânico, impacto, onda de choque, cratera — e pedra de presente |
| 7 | Matilha | 22 | Invoca lobos famintos |
| 8 | Mão Divina | grátis | Pegue alguém, solte ou arremesse (assusta) |

**Fé** é o recurso dos poderes. Ela nasce da **devoção** (quando você ajuda) e do **medo** (quando você castiga). Medo também rende fé, mas deixa o povo lento e menos fértil — e quem perde parentes para a sua fúria perde a devoção. O painel inferior mostra como eles te enxergam: *Um mistério*, *Protetor*, *Deus amado*, *Deus temido*, *Tirano divino*…

## Estrutura do código

```
index.html        HUD, menus e ordem dos scripts
css/style.css     interface
js/util.js        RNG, ruído, heap, nomes
js/world.js       estado, geração da ilha, pathfinding A*
js/nature.js      árvores, arbustos, rochas, fogo, clima, nuvens
js/village.js     construções, planejador, empregos, moradia, crônica, marcos, fé
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
