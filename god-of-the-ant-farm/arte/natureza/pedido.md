# O pedido do dono — a grande atualização visual da natureza (palavras dele)

Quero realizar uma grande atualização visual no God of the Ant Farm, concentrada em um objetivo: transformar a natureza do jogo em algo absolutamente impressionante, imersivo e visualmente memorável.

Vamos trabalhar quatro grandes pilares:

1. Vegetação e biomas: florestas tropicais realmente densas e fechadas, com múltiplas camadas de vegetação, árvores de diferentes portes, cipós, arbustos, samambaias, musgos e biodiversidade. Florestas temperadas, savanas, desertos, tundras e outros biomas também precisam ter identidade visual própria.

2. Geografia e estruturas naturais: montanhas imponentes, cordilheiras, geleiras, falésias, cânions, cavernas profundas, formações rochosas, vales, praias e rios. Quero relevo rico, variado e geologicamente convincente.

3. Água e fenômenos naturais: cachoeiras espetaculares, rios com correnteza, lagos, oceanos, ondas, espuma, reflexos, névoa, chuva e interação da água com o terreno.

4. Céu, iluminação e atmosfera: nascer e pôr do sol impressionantes, variação realista das cores do céu, nuvens dinâmicas, iluminação volumétrica, sombras, neblina, tempestades e ciclos de dia e noite.

Organização: utilize agentes especializados para trabalhar em paralelo nos diferentes pilares, enquanto você coordena a arquitetura, integração e consistência visual entre eles.

Referência de qualidade: quero que explorar a natureza seja uma experiência comparável à contemplação de um documentário da BBC Earth ou National Geographic. O jogador precisa olhar para uma floresta, montanha, cachoeira ou paisagem e pensar: 'Nossa, que jogo lindo!'.

Não quero simplesmente adicionar objetos ao cenário. Quero ecossistemas visualmente ricos, com profundidade, diversidade, identidade e coerência natural.

Preserve a identidade artística do jogo, evoluindo o estilo low-poly para um acabamento muito mais sofisticado, detalhado e profissional.

Antes de implementar, analise os sistemas existentes, identifique limitações e planeje a evolução. Priorize também otimização, geração procedural e diversidade para que os ambientes não pareçam repetitivos.

Não se limite aos exemplos apresentados. Explore possibilidades que ainda não existem no jogo.

Objetivo final: fazer da natureza um dos maiores motivos para alguém querer passar horas jogando God of the Ant Farm.

## Exigência especial: florestas tropicais e vegetação densa

Quero uma transformação radical na representação das florestas tropicais. Elas precisam ser verdadeiras matas fechadas, profundas e exuberantes, e não terrenos abertos com árvores espaçadas.

Implemente:

- Múltiplas camadas de vegetação: árvores gigantes emergentes, copas densas, árvores menores, arbustos, samambaias, palmeiras, cipós, trepadeiras, raízes expostas, musgos e vegetação rasteira.
- Copas sobrepostas, formando verdadeiros tetos florestais, bloqueando parcialmente a luz solar.
- Variação de densidade: áreas praticamente impenetráveis, clareiras naturais, trilhas, vegetação intermediária e pequenas aberturas.
- Iluminação característica de mata fechada, com raios solares atravessando as copas, sombras profundas, umidade e neblina localizada.
- Grande diversidade de formatos, tamanhos, cores e espécies vegetais, evitando repetições artificiais.
- Interação da vegetação com vento, chuva, animais e passagem de seres vivos.
- Raízes, troncos caídos, folhas no chão, matéria orgânica e detalhes que transmitam a sensação de uma floresta viva.

Quero que o jogador entre em uma floresta tropical e sinta que está dentro de uma selva de verdade. A vegetação deve envolver o ambiente, esconder partes do terreno, criar profundidade e transmitir uma sensação de escala e biodiversidade impressionante.

Referência visual: florestas tropicais reais, como a Amazônia e outras grandes florestas equatoriais. Quero uma experiência visual digna de documentários da National Geographic.

Atenção: essa densidade precisa ser gerada proceduralmente e otimizada, sem comprometer o desempenho do jogo.

## As referências que ele mandou (na pasta de rascunho da sessão: /tmp/claude-0/-home-user-promptzada-de-adulto-do-dr-s-ntese/474a40dc-2376-5786-aa24-770c3a52b5eb/scratchpad/natureza/ — fotos da internet, fora do repositório)
- `ref-floresta.jpg` — mata fechada com raios de sol atravessando a copa, samambaias, musgo, cipós pendentes, névoa.
- `ref-ceu.jpg` — pôr do sol dourado, nuvens volumétricas, vale com névoa, montanhas com neve ao fundo, pedras e capim em primeiro plano.
- `ref-cachoeira.jpg` — cachoeira alta num paredão de basalto, poço turquesa, névoa, floresta tropical em volta.
- `ref-relevo.jpg` — arco de rocha de uma caverna emoldurando cordilheiras, vale verde, rocha porosa e quente.

## O contexto do jogo
- Alvo principal: o PC (placa de vídeo de computador); o celular continua jogável, mas não põe teto.
- O jogo tem duas vistas: o Modo Deus (2D isométrico, `render.js`, `art.js`, `arch.js`…) e o Modo Encarnado (3D, three.js r170: `realm3d.js`, `ground3d.js`, `grass3d.js`, `build3d.js`, `people3d.js`, `fx3d.js`, `post3d.js`, `sky.js`…). A natureza precisa ficar linda nas duas, com o 3D como vitrine.
- O mundo é a verdade e o 3D só desenha (CLAUDE.md): tudo o que é só de se ver é feito de forma determinística (`G.hash`, `G.VR`), nunca do acaso do mundo; o que muda o mundo (onde há árvore, por onde se anda, onde os bichos se escondem, a madeira que se tira) passa pelas regras do mundo e pelo protocolo inteiro.
