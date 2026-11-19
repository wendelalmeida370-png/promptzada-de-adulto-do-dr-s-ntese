# O navegador — o documento completo (quem sabe onde está no mar)

**A máxima:** navegar tem de ser tão bom que poderia ser um jogo sozinho — a terceira noite sem ver terra, a estrela do polo um
palmo mais baixa que ontem, o prumo que sobe com areia branca no sebo, o corvo solto que não volta (há terra perto!), a nuvem
parada no horizonte, e o grito do vigia lá do mastro: **terra!** — exatamente onde você disse que ela estaria. Usa a vida a bordo
([`navios.md`](navios.md), com o vento e o mar do §2b), o céu (`G.Ceu`), o calendário ([`calendario.md`](calendario.md)) e a fundação
dos ofícios ([`oficios-fundacao.md`](oficios-fundacao.md)). Os números são propostas para começar.

## As bases e as perícias

**As bases** (as leis do mundo que valem para todos, de qualquer ofício — [`pericias.md`](pericias.md)): o mar; o tempo (as estações, as monções); a distância (as travessias de dias, maiores com o mundo grande).

**As perícias que o ofício usa:** **Navegar** (a principal) — e Marinharia, Ler o tempo, Letras. A prática e as técnicas são das perícias: o que se aprende aqui vale em todo ofício que usa a mesma perícia, e os títulos pedem o nível delas.

## 1. A fantasia

O dono do navio quer chegar à ilha do estanho, que ninguém da cidade sabe onde fica — só o velho fenício que morreu no inverno, e
deixou a você o rolo de couro com as anotações dele: «do cabo do templo branco, com a Ursa pela proa esquerda, dois dias e uma
noite; quando o fundo der lama negra, vira para o poente». Vocês saem com a brisa da terra, de madrugada. Na segunda noite o céu
fecha. Você não vê a Ursa; segue a ondulação, que vem sempre do mesmo lado, e conta as horas. De manhã joga o prumo: lama negra.
Vira para o poente. À tarde, uma nuvem parada que não se mexe com as outras. Você solta o corvo; ele sobe, sobe — e voa direto para
ela. Ao pôr do sol, a ilha aparece. A tripulação grita. O dono do navio vai ficar rico. E agora você sabe um caminho que vale mais
que o navio.

## 2. A história e o nome

**O piloto** (o *kybernetes* dos gregos, o que segura o leme e sabe o caminho) era o homem mais valioso do navio. Os fenícios
guardavam as suas rotas como segredo de Estado — conta-se de um capitão que, seguido por um navio estrangeiro que queria descobrir o
caminho do estanho, jogou o próprio navio nos baixios para não revelar a rota, e foi pago pela cidade pela carga perdida. Os gregos
escreviam **périplos**, livros que descreviam a costa de porto em porto. Um navegador grego antigo descobriu como **o vento das
monções** virava com a estação e abriu o caminho direto pelo alto-mar até as terras do outro lado. Os povos do norte soltavam corvos
para achar terra. **No jogo, o ofício chama-se navegador; no navio, o piloto.**

## 3. O que já existe no jogo

Os navios e as suas rotas (`naval.js`), os portos, as rotas de comércio pelo mar, **as expedições** com os seus acontecimentos (a
calmaria, a corrente, a tempestade, o ânimo da tripulação — `expeditions.js`), as colônias, o primeiro encontro de povos pelo mar, o
céu com o sol, a lua, as nuvens e o vento (`G.Ceu`), a maré (`Sea.tide`), as aves e os bichos do mar, os boatos, o que o
personagem sabe (`G.Possess.knows`). **O que falta:** o vento que empurra pela direção ([`navios.md`](navios.md) §2b), o céu de
estrelas, o fundo do mar que se lê, e **o mar sem mapa**.

## 4. A regra de ouro: no mar aberto, ninguém sabe onde está

**Longe da costa, a tela não mostra onde o navio está.** O navegador sabe só o que deduz: a estima (o rumo e o tempo), as estrelas,
o sol, o fundo, as aves, o mar. Errar é de verdade — e é isso que faz o ofício. A carta que aparece na tela é **a que ele mesmo vai
desenhando** com o que observou (a porta do que o personagem sabe ganha o mar), e ela pode estar errada.

## 5. O mundo que fala (o que o navegador lê)

| O que se lê | Como é no jogo | O que diz |
|---|---|---|
| **A estrela do polo** | o céu de estrelas de cada mundo, fixo, com as constelações que os povos daquele mundo nomeiam (`lore.js`) | o norte; **a altura dela acima do horizonte diz o quanto se está ao norte** (o céu do jogo é do tamanho do mundo do jogo: do sul ao norte do mapa, ela sobe alguns palmos) |
| **A estrela da rota** | as estrelas nascem e se põem sempre nos mesmos pontos do horizonte | navegar para onde uma estrela nasce; quando ela sobe, seguir a próxima que nasce no mesmo ponto |
| **O sol** | o caminho do sol do `G.Ceu` | ao meio-dia, o sul; **onde ele nasce muda com a estação** (o calendário) |
| **O céu de cada estação** | as constelações da noite mudam com a estação | a época do ano; quais estrelas se pode usar |
| **A costa** | os cabos, as montanhas vistas do mar, o templo no promontório, **o farol** | onde se está, pelo périplo |
| **O fundo** | cada lugar do mar tem o seu fundo (areia branca, lama negra, cascalho, conchas, rocha), pela fundura e pela costa — uma conta pura | o prumo com sebo traz o fundo, e o fundo, com a fundura, diz onde se está |
| **As aves** | as aves do mar voam para terra ao entardecer; o corvo de bordo voa alto e, se vê terra, vai para ela | a direção da terra; se ela está perto |
| **A ondulação** | o mar aberto ondula com o vento de longe; a ilha quebra e reflete as ondas | a direção do vento de longe; a ilha escondida |
| **As nuvens** | a nuvem que se forma e fica parada sobre a ilha alta | a ilha que ainda não se vê |
| **A cor da água** | azul fundo no alto-mar, verde sobre o raso, barrenta na boca do rio | o raso perto; o rio |
| **O cheiro de terra** | o vento que vem da terra traz o cheiro da mata, da fumaça | a terra a barlavento |
| **O vento** | o vento do céu, os ventos com nome de cada povo, **a brisa da terra de madrugada e a do mar à tarde**, **as monções que viram com a estação** | sair do porto de manhã, entrar à tarde; o caminho longo que só se faz numa estação |
| **A corrente e a maré** | o mapa das correntes, a maré duas vezes por dia | o estreito na hora certa; o porto raso só na cheia |
| **O tempo** | o halo da lua, o céu vermelho de manhã, a ondulação que cresce sem vento, as aves que voam baixo | a tempestade que vem |

## 6. As ferramentas

| Coisa | Como se consegue | Para quê |
|---|---|---|
| **O prumo e a linha com nós** | a forja (o chumbo), o cordoeiro | a fundura e o fundo (o sebo na base traz a amostra) |
| **O sebo** | o açougueiro | grudar o fundo no prumo |
| **O périplo** | escrito por você, comprado, herdado, roubado | os caminhos de porto em porto; **um livro que vale ouro** |
| **A carta do mar** | desenhada por você | o que você já viu e mediu |
| **O corvo ou a pomba de bordo** | criado e treinado (o falcoeiro, o criador de pombos) | achar a terra |
| **A vara de medir** (ou a mão no braço esticado) | o carpinteiro | a altura da estrela e do sol acima do horizonte |
| **O gnômon** | o carpinteiro | a sombra do meio-dia (a altura do sol) |
| **A ampulheta de água** ou as contas do tempo | o oleiro | o tempo navegado (a estima) |
| **O remo de governo** | o carpinteiro naval | o leme do navio antigo (um remo grande na popa) |
| **A lanterna** | o oleiro | ler as anotações à noite |

## 7. O gesto (o coração)

1. **Planejar:** o périplo, a estação (a monção, o mar fechado do inverno), os ventos, a água e a comida, **a hora de sair** (a maré,
   a brisa da terra).
2. **Governar:** o remo de governo e a vela com o vento — de popa, de través, bordejando contra; a ordem à tripulação.
3. **A estima:** guardar na cabeça (e nas anotações) o rumo e o tempo. **A tela mostra só o que você anotou**; com a prática, a estima
   erra menos.
4. **Ler o céu de noite:** achar a estrela do polo, **medir a altura dela com a mão no braço esticado** (cada dedo, um passo de
   altura), escolher a estrela da rota.
5. **Ler o sol de dia:** a sombra do gnômon ao meio-dia, o ponto onde ele nasceu.
6. **Sondar:** jogar o prumo, contar os nós da linha até o fundo, **olhar o sebo**: areia branca, lama negra, conchas — e comparar com
   o périplo.
7. **Soltar a ave:** o corvo sobe, gira, e vai — ou volta para o navio (não há terra à vista dele).
8. **Ler o mar e o tempo:** a ondulação, a nuvem parada, a cor da água, o cheiro, o halo da lua.
9. **Decidir:** seguir, esperar, voltar, correr com o temporal, buscar abrigo atrás do cabo, **fugir da costa a sotavento** (o vento
   que empurra o navio contra as pedras é o maior perigo do mar).
10. **Entrar no porto:** o canal entre os baixios, as marcas da terra, a maré — o trabalho do piloto do porto.

## 8. A recompensa que se vê e se ouve

O céu de estrelas inteiro no mar escuro; a estrela que você conhece aparecendo entre as nuvens; o prumo subindo com a areia que
você esperava; **o corvo que voa reto para o horizonte**; a nuvem parada; o primeiro pássaro de terra pousando no mastro; **«terra!»**
— e a costa aparecendo exatamente onde você disse; o porto à vista depois de dias; a tripulação que confia em você; o cartão da rota
(os dias, o caminho, o recorde).

## 9. Os perigos

| Perigo | Como vem | O que se faz |
|---|---|---|
| **Perder-se** | a estima errada, o céu fechado dias seguidos | o fundo, as aves, o mar; voltar ao último lugar certo |
| **A comida e a água** | a viagem mais longa que o plano | a ração; a ilha da água no périplo |
| **A costa a sotavento** | o vento forte empurrando o navio contra as pedras | sair para o largo cedo; a âncora; rezar |
| **O recife e o baixio** | a carta errada; a noite | o prumo; a cor da água; o vigia |
| **A tempestade** | o tempo que se lê mal | correr com o temporal; o abrigo |
| **A calmaria** | o vento que morre | os remos; a paciência; a água que acaba |
| **A neblina** | a costa que some | o prumo; o som da arrebentação |
| **A tripulação** | o medo de estar perdido, o ânimo que cai (o ânimo das expedições) | a confiança no piloto — ou o motim |
| **O pirata** | a rota conhecida demais | a rota secreta |

## 10. As técnicas (18, das perícias que o ofício usa)

Cada técnica é de uma perícia (o catálogo em [`pericias.md`](pericias.md)): aprendida aqui, vale em todo ofício que usa a mesma perícia.

| Técnica | Perícia | O que faz | De quem se aprende |
|---|---|---|---|
| A estima | Navegar | o rumo e o tempo erram menos | um piloto velho, ou mil horas no leme |
| A estrela do polo | Navegar | achar o norte de noite | um piloto, um sacerdote das estrelas |
| A altura da estrela | Navegar | saber o quanto se está ao norte | um mestre navegador |
| As estrelas da rota | Navegar | as estrelas que nascem no ponto certo de cada caminho | um mestre (e cada rota tem as suas) |
| O sol do meio-dia | Navegar | a altura do sol pelo gnômon | um sábio, um livro |
| O céu das estações | Navegar | as constelações de cada estação | um sacerdote das estrelas |
| A sonda | Navegar | ler a fundura e o fundo | um piloto da costa |
| O fundo de cada lugar | Navegar | reconhecer o fundo das águas conhecidas | descoberta (cada sondagem anotada) |
| A ave de bordo | Navegar | treinar e soltar o corvo | um homem do norte, um falcoeiro |
| A ondulação | Navegar | ler a ilha escondida pelo mar | descoberta (dias no alto-mar) |
| A nuvem da ilha | Navegar | ver a ilha antes de vê-la | um piloto velho |
| A cor da água | Navegar | o raso e o rio | um piloto da costa |
| A brisa do dia | Marinharia | sair de manhã, entrar à tarde | um pescador velho |
| As monções | Navegar | o caminho longo pela estação | um mestre navegador, ou um périplo raro |
| O bordejo | Marinharia | subir contra o vento | um marinheiro |
| Ler o tempo | Ler o tempo | a tempestade antes dela | um piloto velho |
| O canal do porto | Marinharia | entrar sem encalhar | o piloto daquele porto |
| Escrever o périplo | Letras | anotar o caminho para outros | um escriba, um mestre |

## 11. A prática da perícia principal — Navegar (o que cada faixa abre)

| Faixa | O que abre |
|---|---|
| Ajudante (0–20) | a costa à vista; o leme com ordem |
| Piloto da costa (20–40) | a sonda; os marcos; a estima curta |
| Piloto (40–60) | **as estrelas**: a estrela do polo e a sua altura; a estima de um dia |
| Piloto de mar aberto (60–85) | a ondulação e a nuvem da ilha; a estima de dias |
| Mestre navegador (85–100) | sentir o lugar do navio no mar como se visse a carta |

## 12. Os títulos

| Título | O que pede | O que dá |
|---|---|---|
| **Ajudante de piloto** | entrar num navio | o leme com ordem; o soldo |
| **Piloto da costa** | navegar 30; dez viagens de cabotagem sem perder o navio | o périplo da costa; o soldo de piloto |
| **Piloto de mar aberto** | navegar 55; uma travessia sem costa à vista | os mercadores e os reis o disputam |
| **Mestre navegador** | navegar 75; **um périplo seu** que outros usam | aprendizes; a expedição de quem governa |
| **Descobridor** | **uma terra ou uma rota nova** | **a terra ou a rota com o seu nome**, na crônica e nas cartas |

## 13. A coleção, os recordes e as lendas

- **O périplo próprio:** cada porto, cabo, fundo, estrela e vento anotado; **a carta do mar** desenhada; **o céu** — as constelações
  conhecidas.
- **Os recordes:** a travessia mais rápida, a viagem mais longa, a terra mais distante — de pessoas reais da cidade.
- **As lendas** (nascem do mundo, existem com ou sem o jogador, de quem achar primeiro):

| Lenda | O que é |
|---|---|
| **A ilha do estanho** | a fonte secreta do estanho (o estanho é raro e faz o bronze): **quem sabe o caminho do mar até ela manda no bronze** |
| **A ilha mais distante** | a terra mais longe da costa do mundo; quem a acha a nomeia |
| **A rota das monções** | o caminho direto pelo alto-mar, que só se faz numa estação |
| **O périplo dos antigos** | a carta do mar de um povo antigo ([`passado.md`](passado.md)), achada numa ruína — e ela fala de uma terra |
| **O estreito das correntes** | a passagem que só se faz numa hora da maré, numa estação |

## 14. A economia

**O piloto é o mais bem pago da tripulação**; o périplo copiado se vende caro; **a rota secreta vale mais que o navio** (e se rouba, se
compra, se esconde — o capitão que afunda o próprio navio para não revelar o caminho); os mercadores dependem do piloto; quem governa
paga as expedições de descoberta.

## 15. O mundo

As expedições do mundo passam a ter **um navegador de verdade**, e a prática dele pesa no que acontece (o navio do bom piloto se perde
menos — pelas mesmas regras do corpo); o primeiro encontro com outro povo pelo mar; as colônias; **o saber que anda**: o périplo
copiado, o boato do caminho, o piloto que muda de povo e leva as rotas; **o farol** — uma obra nova, a marca da costa que guia de
noite (e o seu ofício, o faroleiro).

## 16. Por povo

O **Egito** (a costa até as terras do incenso, o rio com os seus pilotos, a navegação colada à costa); os **gregos** (os périplos,
a Ursa Maior, as colônias por todo o mar); os **romanos** (a rota do grão, os faróis, os portos grandes); o **norte** (o alto-mar,
**os corvos**, a pedra do sol das lendas, o «caminho das baleias»); os **astecas** (as canoas dos lagos e da costa, **o saber do céu**
— os ciclos das estrelas que eles conheciam como ninguém).

## 17. A camada do ambiente

| A fotografia | O som | O tremor | A tela | A mochila |
|---|---|---|---|---|
| o céu de estrelas inteiro, o horizonte vazio, o nascer do sol no mar, a costa que aparece | o casco que range, o vento na vela, o prumo que bate na água, o grito do vigia, o silêncio do alto-mar | a ondulação, o temporal | **nenhum ponto no mapa no alto-mar**: só a carta que você desenha, as anotações, o céu e o horizonte | a vista do navegador: o prumo, o périplo, a carta, a vara de medir, a gaiola do corvo |

## 18. Os derivados

O **piloto do porto** (o prático que leva os navios para dentro), o **cartógrafo do mar**, o **observador das estrelas** (o sacerdote
do céu), o **faroleiro**, o **timoneiro**, o **vigia do mastro** (o alto do mastro: a escalada), o **mestre de vela**.

## 19. As fases e as provas

| Fase | O quê |
|---|---|
| Nv1 — O vento e a vela | a vela pelo vento, o bordejo, a brisa do dia, a corrente, a maré ([`navios.md`](navios.md) §2b; Patch 26) |
| Nv2 — O céu | o céu de estrelas de cada mundo, a estrela do polo e a sua altura, as estrelas da rota, o sol do meio-dia, o céu de cada estação |
| Nv3 — O mar que fala | o fundo e a sonda, as aves e o corvo, a ondulação, a nuvem da ilha, a cor da água, o cheiro de terra, os sinais do tempo |
| Nv4 — O mar sem mapa | a regra de ouro (a posição só pelo que se sabe), a estima, a carta e o périplo como coisas do mundo |
| Nv5 — A descoberta | as lendas, os títulos, a terra com o seu nome, os navegadores do mundo nas expedições |

**As provas:** o céu de estrelas é uma conta pura (a mesma estrela no mesmo lugar para o mesmo mundo, a mesma hora e a mesma estação);
**a tela do mar aberto nunca mostra a posição que o personagem não sabe** (uma regra do `guard.js`, pela porta `G.Possess.knows`); o
prumo traz o fundo de verdade daquele lugar; a ave segue a regra do mundo; o périplo diz só o que alguém anotou; o navegador do mundo
navega pelas mesmas regras; os casos ruins (o save perdido no mar, o piloto que morre no meio da viagem — quem navega agora?, o céu
fechado dias seguidos, o deus que manda o vento); e **o teste do dono: dias no mar, sem enjoar.**

## 20. Quando entra

**O vento e a vela** com os barcos pequenos (Patch 26); **o ofício inteiro** com a viagem no mar (Patch 36); **as travessias de dias**
com o mundo grande (Patch 41) ([`roteiro.md`](roteiro.md)).
