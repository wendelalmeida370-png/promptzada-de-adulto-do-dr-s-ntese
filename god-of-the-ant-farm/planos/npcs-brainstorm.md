# O brainstorm dos NPCs (18/11/2026)

A conversa com o dono depois da v14: tornar os NPCs os mais imersivos da história dos jogos — inteligentes o quanto der (sem
IA dentro do jogo), com milhares de falas contextuais, centenas de animações, iniciativa própria e missões que nascem da vida
deles. O plano de execução está em [`patch23-as-vidas.md`](patch23-as-vidas.md); aqui fica o raciocínio.

## 1. O que os NPCs já têm (v14)

A índole (seis eixos e três valores, metade dos pais); os laços com quatro sentimentos (afeto, confiança, respeito, atração),
a data e o esfriamento; as marcas de quem fez o quê (teto de 8); a fama e a memória da cidade; os boatos que viajam e se
distorcem; os doze verbos do corpo; duas vontades (`ajudar`, `acerto`); o crime com testemunhas; a rotina inteira (trabalho,
casa, praça, taverna, banhos, festas); o rosto e o porte pelo humor; os atos a dois; o que o personagem sabe. **O que falta:**
poucas falas; os NPCs quase nunca procuram o corpo; o laço sem o «momento»; memórias curtas; nenhuma meta de vida; o inimigo
não planeja.

## 2. A matriz (impacto e dificuldade de 1 a 5)

| # | Ideia | Impacto | Dificuldade |
|---|---|---|---|
| 1 | O «momento» no laço (chateado agora, o amor de fundo fica) | 5 | 2 |
| 2 | Memórias-chave permanentes | 5 | 2 |
| 3 | A aba de Relacionamentos (estilo The Sims) | 5 | 2 |
| 4 | Falas que lembram (milhares por combinação) | 5 | 2 |
| 5 | Convites ao corpo (beber, praça, pescar, festa) | 5 | 2–3 |
| 6 | Reações espontâneas curtas | 4 | 2 |
| 7 | Humor do dia com causa | 4 | 2 |
| 8 | Presentes com gosto | 4 | 2 |
| 9 | Reputação do corpo por cidade | 4 | 2–3 |
| 10 | Chamar pelo nome e pelo apelido | 3 | 1 |
| 11 | Pedidos que viram missão no diário | 5 | 3 |
| 12 | Metas de vida | 5 | 3 |
| 13 | Viradas de vida (os 180 graus) | 5 | 3 |
| 14 | Hábitos que nascem da repetição | 4 | 3 |
| 15 | Favores e dívidas | 4 | 3 |
| 16 | Família viva | 4 | 3 |
| 17 | Romance completo | 4 | 3 |
| 18 | Conversas entre NPCs com assunto | 4 | 3 |
| 19 | O inimigo que age em escalada (até a emboscada e o assassinato) | 5 | 4 |
| 20 | Centenas de animações | 5 | 4 |
| 21 | Planos de vários passos | 5 | 5 |
| 22 | Mentira, segredo e chantagem | 4 | 4–5 |
| 23 | Grupos (panelinhas, confrarias, gangues, seitas) | 4 | 4 |
| 24 | Murmúrios de voz por povo | 3 | 3 |
| 25 | Sonhos e pesadelos, o cão que sente a morte do dono | 2 | 2 |
| 26 | Lábios com a fala | 2 | 3 |

(O «cérebro de IA» da primeira versão da matriz saiu: foi força de expressão do dono — nenhuma IA dentro do jogo.)

## 3. As falas contextuais (é possível: milhares)

- **O assunto é um fato real que o NPC sabe** (pelos boatos, pelo que viveu): o bairro, a cidade, o tempo, o corpo, os
  outros, quem governa (o rei que morreu ontem, o rei que oprime), a guerra, os preços, a viagem de alguém, a expedição, a
  caverna sagrada, o bicho raro.
- **O jeito de dizer:** a índole, a idade, o ofício, o humor, o laço com quem ouve, o povo.
- **As variações:** várias versões de cada frase, com lacunas (o nome, o lugar, há quantos dias).
- **A conta:** 60 assuntos × 8 jeitos × 5 versões = 2.400 frases-base; com os nomes e os fatos, dezenas de milhares de falas.
- **O risco de falar mal do rei:** pesa quem está perto, a coragem, o regime; o corajoso fala alto, o prudente cochicha, o
  outro se cala quando o guarda chega; ouvido pelo guarda, vira denúncia de verdade (decidido no passo do mundo).
- **As provas:** toda fala aponta para um fato verdadeiro; ninguém fala do que não sabe; nada se repete em pouco tempo.

## 4. As animações (a fala do corpo)

- **A máquina já existe em boa parte:** o animador por camadas, os clipes, a passada, o porte, o ócio, o rosto, os atos a dois,
  as cenas, as coisas nas mãos.
- **Por que nível 4:** o contato entre corpos de tamanhos diferentes, o contato com o mundo, tudo feito à mão em código, a
  conferência de cada clipe, a animação seguindo o mundo e nunca o contrário.
- **A fábrica que baixa para nível 2 a 3 por clipe:** os pontos de encaixe no mundo, os papéis (A, B, C…), as peças por camada
  que se somam, a variação de cada um pela índole e pela idade, entrar e sair de cada ação, a camada de reação, as provas
  automáticas de cada clipe.
- **O teto:** não há teto técnico (um clipe pesa poucos quilobytes); o limite é o tempo de criar e conferir. Meta realista: de
  300 a 500 clipes, em ondas de 40 a 60 — com as combinações, milhares de momentos diferentes. Mais de 1.000 dá, mas cada um
  acrescenta menos.
- **Para depois:** a captura de movimento gratuita, se a licença permitir.

## 5. As missões geradas (o quão perto das melhores do gênero)

- **O teto, de 0 a 10** (as secundárias do The Witcher 3 = 10; as «vá buscar» automáticas = 2–3): o texto e a encenação polida
  ≈ 5–6; a sensação de história real com peso ≈ 7–8; a reatividade e a memória (a sua família, os seus inimigos de verdade, o
  mundo que lembra) — aqui passa.
- **Os truques:**
  1. toda missão nasce de um fato real do mundo, nunca de um sorteio;
  2. quem pede e por quê (o laço, a fama, não conseguir sozinho, a personalidade; recusar tem consequência);
  3. esqueletos escritos à mão, preenchidos pelo mundo (20 a 40 tipos: a criança sumida, o amor proibido, a dívida, a falsa
     acusação, a herança, a briga de famílias, o monstro que não é, o segredo do morto, a traição, a peregrinação, a caça
     ao bicho raro, o sobrevivente da expedição…);
  4. a estrutura em atos (o pedido, a complicação, a reviravolta, a escolha, o desfecho, o eco);
  5. a reviravolta tirada dos fatos do próprio mundo (os segredos, os boatos errados, os motivos escondidos);
  6. a investigação com pistas verdadeiras (as pegadas, as testemunhas que podem mentir, os boatos, a coisa no chão, o
     livro-razão);
  7. várias saídas pelos sistemas (a luta, a conversa, as moedas, a esperteza);
  8. escolhas cinzentas que nascem dos laços;
  9. o eco dias depois — o que mais parece feito à mão;
  10. o mundo não espera (a missão pode falhar pelo tempo);
  11. a encenação sem cutscene (a câmera de conversa, os atos a dois, o momento certo, o NPC que leva o corpo até o lugar);
  12. um contador de histórias (o diretor do motor de histórias) que dá o ritmo;
  13. curadoria: só vira missão o que tem drama;
  14. a história pessoal do corpo (quem ele insultou, quem ele salvou);
  15. o diário conta a missão como relato.
- **A base:** o motor de histórias (`js/stories.js`) já faz os fatos com a causa e quem sabe, o julgamento de quem tem laço, o
  diretor e o fim pelo mundo; falta o papel do corpo (o plano está no Patch 23, frente 23d).
