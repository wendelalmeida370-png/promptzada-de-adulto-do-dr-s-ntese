# O passado em camadas — a mecânica fundamental (decisão do dono, 19/11/2026)

A base comum do arqueólogo ([`oficio-arqueologo.md`](oficio-arqueologo.md)), do caçador de tesouros
([`oficio-cacador-tesouros.md`](oficio-cacador-tesouros.md)) e do saqueador de túmulos ([`oficio-saqueador.md`](oficio-saqueador.md)).
**A pergunta do dono:** como há tesouro de rei antigo no ano 15? **A resposta aprovada:** em camadas — o passado de antes do mundo
nasce com ele, como a geologia, e o passado do próprio mundo cresce com os anos e o cobre. Os números são propostas para começar.

## 1. As regras

1. **Nada vem do nada.** Toda coisa enterrada foi feita por alguém, de um material que existia na terra dela, e chegou ali por
   um motivo (o enterro, a guerra, a cheia, o esquecimento).
2. **Nada nasce para o jogador.** O passado existe com ou sem o corpo, e **qualquer um acha**: o lavrador, o pedreiro, o mineiro,
   o rio que come a barranca.
3. **É finito.** O que se tira não volta. Os povos antigos se esgotam devagar; o passado do mundo só cresce com novas mortes,
   guerras e cidades que acabam.
4. **A verdade fica no mundo; o que se diz dela é boato.** A crônica de cada povo antigo é guardada inteira (no save); o que as
   pessoas sabem dela é o que acharam, decifraram e ouviram.
5. **A mesma semente, o mesmo passado.** Os povos antigos nascem pelo acaso do mundo (`G.R`), na criação; os detalhes que só se
   veem, pelo `G.hash`.

## 2. A camada 1 — os povos antigos (nascem com o mundo)

Na criação do mundo, depois do mapa e das jazidas, o gerador escreve **dois a quatro povos antigos** — não simula séculos: escreve
uma crônica curta e coerente com o mapa.

| O que se escreve | Como |
|---|---|
| **Onde viveram** | onde uma cidade escolheria: o rio, a terra boa, a costa abrigada (a mesma conta das cidades do mundo); às vezes, onde uma cidade de hoje vai nascer em cima |
| **Quando** | a ordem entre eles (o mais velho, o do meio, o último) — as camadas |
| **O que sabiam** | a era: a pedra, o cobre, o bronze (nunca além do que a terra deles dava) |
| **Como eram** | um estilo de construir (um dos estilos do jogo, mais antigo e gasto), os deuses deles, os nomes, **uma escrita própria** que ninguém mais lê |
| **Os reis** | uma lista curta de nomes e feitos — a verdade que as inscrições contam |
| **Como acabaram** | por uma causa que o mapa explica: **a cheia** (perto do rio), **o vulcão** (perto da terra de fogo), **a guerra** com outro povo antigo, **a peste**, **a seca** (o deserto que avançou) |
| **O que ficou** | os sítios (a tabela abaixo) |

**Os sítios de um povo antigo:**

| Sítio | O que há | Onde fica |
|---|---|---|
| **A cidade** | os muros baixos sob o mato e a terra, as casas, a praça, o lixo (os cacos — o achado mais comum) | onde viveram |
| **O cemitério** | as covas comuns com o pouco de cada um | junto da cidade |
| **O túmulo do rei** | a câmara, o enxoval (as armas, as joias, os vasos, a máscara), às vezes as defesas que os antigos fizeram | a colina, o vale escondido, a caverna |
| **O santuário** | as estátuas, as oferendas, as inscrições | o alto, a fonte, a caverna |
| **A mina antiga** | as galerias que seguiram **a parte rasa de um veio de verdade** — o veio que sobrou é menor | sobre uma jazida do mundo |
| **O esconderijo** | o tesouro enterrado na última guerra | perto da cidade, sem marca |
| **A caverna pintada** | as pinturas (a arte das cavernas do jogo), os ossos, as ferramentas de pedra | as cavernas do mundo |
| **O naufrágio** | o barco com a carga | a costa, o fundo raso |

**Os grandes sítios** (um por povo antigo, no máximo): a capital, o túmulo do maior rei, o santuário principal — os lendários
dos três ofícios.

**O material de cada coisa** é o da terra daquele povo: ouro só se havia ouro nas jazidas perto deles, bronze só se havia cobre e
estanho, a pedra que a região tem. A era manda também: o povo da pedra deixa sílex, osso entalhado e cerâmica; o do bronze, armas
de bronze, joias de ouro, selos com escrita. **Moeda só de quem chegou a cunhar** (a maioria dos antigos não cunhou).

**A ligação com os mitos:** os mitos que o mundo já conta (`lore.js`: «os antigos a chamam…», os ditos antigos) passam a falar
desses povos. Às vezes o mito guarda a verdade de um lugar («a cidade das sete portas afundou no lago»), às vezes a deturpa.

## 3. A camada 2 — o passado do próprio mundo (cresce com os anos)

O que a simulação já faz vira arqueologia quando envelhece, **sem inventar nada**:

| O que acontece no mundo | O que fica |
|---|---|
| **Um enterro** | a cova com o que foi enterrado junto — **o enxoval sai do povo e da família pelo livro** (`G.Depot`, código `enxoval`): o rei com as armas e as joias, o pobre com quase nada |
| **Um rei que morre** | o túmulo maior, o monumento (a pirâmide e o mausoléu do mundo guardam quem o povo enterrou neles) |
| **Uma cidade que acaba** | as ruínas (o tipo `ruin`, o `S.urbPast` que lembra os bairros), com o que ficou nas casas |
| **Uma batalha** | as armas e os mortos no campo (o que cai no chão é o `S.loose`) |
| **A guerra que chega** | **o tesouro escondido**: quem tem moedas e vê o inimigo chegar enterra-as; se morre, ninguém sabe onde — só a família, por boato |
| **O fogo, a cheia, o terremoto** | a camada de cinza, a camada de lama — a marca no chão do que aconteceu |
| **O naufrágio** | o navio no fundo com a carga |
| **O ossuário** | os ossos dos cemitérios cheios (já existe) |

## 4. O tempo que enterra (as camadas)

- **O que fica no chão anos a fio é coberto:** a poeira, as folhas, a lama da cheia, a terra que desce do morro. Depois de alguns
  anos a coisa passa de «no chão» para «enterrada» (a profundidade cresce com o tempo e com o lugar: perto do rio, rápido; no
  alto da rocha, devagar).
- **As camadas:** cada lugar guarda as suas, de baixo para cima — a terra virgem, o povo antigo mais velho, a cinza do fogo que o
  acabou, o povo antigo seguinte, a lama da cheia, a cidade do mundo. **Quanto mais fundo, mais velho.**
- **O tempo gasta:** a madeira apodrece, o ferro enferruja, o tecido some, o bronze fica verde, o ouro fica como era. Uma coisa
  achada tem o estado que os anos e a terra deram (a terra seca do deserto guarda quase tudo; a terra molhada, quase nada).

## 5. A camada 3 — o perdido de agora

A bolsa que caiu, a faca esquecida, as economias que o lavrador enterrou no quintal e não contou a ninguém (o gesto existe no
mundo: quem guarda moedas sem cofre pode enterrá-las). Pouco valor, mas o primeiro achado de muita gente.

## 6. Quem acha (o mundo inteiro, com ou sem o corpo)

| Quem | Como |
|---|---|
| **O lavrador** | o arado que bate num pote — os cacos, a moeda, às vezes um túmulo |
| **O pedreiro** | a fundação que cava sobre uma ruína |
| **O mineiro** | a galeria que rompe numa mina antiga |
| **O poceiro** | o poço que acha a camada de cinza |
| **O rio e a chuva** | a barranca que desmorona e mostra os ossos; a cheia que descobre um muro |
| **O deus** | o terremoto ou a cheia do Modo Deus pode abrir uma câmara — **o deus revela, nunca cria** |
| **Os três ofícios** | procurando de propósito |

O achado de alguém do mundo vira **boato** (o sistema de boatos): «o arado do Tal achou ouro no campo do morro». O boato traz
curiosos, caçadores e saqueadores — e às vezes quem governa, que reclama o achado.

## 7. Os sinais (como se sabe onde cavar)

- **O monte:** o túmulo e a ruína são morros que não deviam estar ali.
- **A sombra rasante:** com o sol baixo (o caminho do sol do `G.Ceu`), os muros enterrados fazem sombras no chão que de dia não se
  veem.
- **A plantação diferente:** sobre um muro enterrado o capim seca mais cedo; sobre uma vala, fica mais verde — na seca se vê o
  desenho da cidade.
- **As pedras alinhadas** no mato, **os cacos** na terra arada.
- **O mito, a inscrição, o mapa velho, a história do avô.**

## 8. O valor de uma antiguidade (o coração dos três ofícios)

Uma antiguidade vale por três coisas:

1. **O material:** o ouro pesa ouro (o saqueador derrete e vende a peso).
2. **A arte:** a mão de quem fez — a joia trabalhada vale mais que o ouro dela.
3. **A história:** de quem foi, de quando, o que conta. **Só existe se alguém souber** — a coroa identificada como «a coroa do
   último rei de Tal» vale dez vezes a coroa sem nome.

**O ouro derretido não volta a ser coroa:** o saqueador que derrete ganha rápido e apaga a história para sempre; o arqueólogo
que identifica ganha devagar e devolve ao mundo um pedaço do passado. Os dois caminhos são escolhas de verdade.

## 9. O mercado das antiguidades

Quem compra: **quem governa** (a coleção do palácio, o prestígio), **o templo** (as coisas sagradas), **as casas mercantes ricas**
(a bandeira na porta, D-158), **os mercadores** que levam para longe pelas rotas, **a biblioteca** (as tábuas, as inscrições).
Quem vende sem perguntar: **o receptador**. **A lei** de cada povo diz de quem é o achado (a tabela no documento do caçador de
tesouros): muitas vezes, uma parte é de quem governa — declarar ou esconder.

## 10. As provas (quando for feito)

- a mesma semente faz os mesmos povos antigos; nenhum sítio antigo nasce depois da criação;
- **todo objeto antigo tem material de uma jazida perto do povo dele e uma era que permite** (uma regra do verificador);
- o enxoval sai do povo pelo livro; ninguém é enterrado com o que não tinha;
- o que fica no chão é enterrado com o tempo, igual no salto, no passo e no corpo;
- o achado do mundo sem o corpo é o mesmo (o lavrador acha igual);
- o save guarda os sítios, as camadas, o que já foi tirado; um save de antes ganha os povos antigos ao abrir, pela semente, só
  onde o mundo ainda não construiu;
- os mundos prontos se geram de novo.

## 11. Quando entra

**No Patch 31** (com o subterrâneo): os povos antigos na criação, o enxoval, o tesouro escondido na guerra, o tempo que enterra —
barato, e assim os mundos de 500 e 1.000 anos já guardam séculos de história quando os ofícios chegarem. **No Patch 39:** os três
ofícios, a escavação, a decifração, o mercado ([`roteiro.md`](roteiro.md)).
