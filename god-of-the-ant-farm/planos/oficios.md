# Os Ofícios — o plano (do Patch 26 em diante)

O pedido do dono (a conversa depois do plano do Patch 23): cada ofício com uma mecânica própria, **profunda e ligada ao
mundo** — nunca um minijogo solto. Gostoso de fazer (a recompensa que se vê e se ouve), com progressão, recompensas e um
ciclo que prende: «só esse ofício poderia ser um jogo». Ofício no sentido largo: **o que o personagem está vivendo** —
pescar, guerrear, roubar, rezar, e também ser escravo de galé, preso, órfão. Uma escada: as mecânicas fundamentais, os
ofícios fundamentais e os ofícios derivados. Vem depois do Patch 25 (o plano dos NPCs está em
`planos/patch23-as-vidas.md`); é trabalho de meses, um ofício por vez, cada um até ficar ótimo.

## 1. O princípio: o ofício é um laço do mundo, não um minijogo

O que liga os ofícios já existe no jogo: **nada vem do nada** (D-440). O anzol de ferro vem da forja, o ferro da mina, a lenha
da forja do lenhador; o peixe vai para a taverna, para o salgador, para o mercado; o barco vem do carpinteiro, com a madeira
do lenhador e a vela do tecelão. Então cada ofício tem **entradas que vêm de outros ofícios e saídas que outros precisam** — e
o que o jogador faz muda a cidade (o preço, a fome, a fama, os laços, as histórias). O «minijogo» é só a parte das mãos; o
sentido vem do mundo.

## 2. O molde de todo ofício (o teste do «jogo sozinho»)

Um ofício só está pronto quando tem as dez coisas:

1. **O gesto com habilidade de verdade:** ler a situação, acertar o tempo, escolher o risco — um jogador bom faz melhor que um
   ruim, mesmo com o personagem iniciante.
2. **A antecipação e o clímax** (a recompensa audiovisual): a espera, o sinal, o momento certo, a explosão — a câmera que
   chega, o som que sobe, o instante em câmera lenta, a coisa mostrada (o cartão do peixe, da espada, da colheita) e a
   reação das pessoas em volta («que peixão!»). O controle vibra.
3. **O mundo responde:** quem compra, o preço que muda, o que falta à cidade, quem precisa do que você faz.
4. **Variedade:** os lugares, o tempo, as estações, as horas, as espécies, os materiais — a mesma hora nunca se repete.
5. **Raridade e lendas:** o peixe raro, o veio de ouro, a espada perfeita; a lenda que o motor de histórias conta e que
   alguém um dia pega.
6. **Ferramentas que mudam o jeito de jogar** — não só os números: a rede pesca diferente do anzol.
7. **Técnicas** aprendidas com mestres (um laço), com livros (a biblioteca) ou descobertas: cada uma é um verbo novo.
8. **Risco e perda:** a tempestade, a ferida, a multa, o barco perdido, a peça que racha no fogo.
9. **Fama, título e laços:** aprendiz, oficial, mestre; o colega de ofício, o mestre, o rival; um dia, os seus aprendizes.
10. **Missões e histórias do ofício:** o pedido do vizinho, o concurso na festa, a lenda que se caça (o Patch 23 dá a base).

E **o dia completo** de cada ofício: preparar, ir, fazer, voltar, vender ou guardar, consertar, descansar.

## 3. A progressão: o que cresce

Um misto, com o peso no que muda o jeito de jogar:

- **O corpo aprende fazendo** (o número, discreto): cada ofício tem a sua prática, que sobe com o uso e cada vez mais devagar;
  ela alarga as janelas do gesto e abre a leitura (o pescador experiente começa a ver as sombras dos peixes, a ler o vento).
  Aparece em palavras e numa barra na aba do ofício — «aprendiz», «bom», «mestre» —, nunca em números pulando na tela.
- **O jogador aprende** (a maestria real): o gesto tem profundidade; a mão do jogador conta.
- **As técnicas** (o qualitativo, o mais divertido): «a isca viva», «o nó do pescador», «a rede de arrasto», «a têmpera na
  água fria», cada uma ensinada por alguém, lida num livro ou descoberta, e cada uma muda o que se pode fazer.
- **As ferramentas e os materiais:** madeira, bronze, ferro — feitos por outros ofícios, comprados, ou feitos por você.
- **O título e a fama:** a cidade reconhece o mestre; as pessoas tratam diferente; o mestre abre a sua oficina e toma
  aprendizes do mundo.
- **A coleção e os recordes:** as espécies pescadas, os tamanhos, as peças forjadas, as lendas alcançadas.
- **Os marcos comemorados:** o primeiro peixe grande, a primeira espada vendida — o momento na tela, a linha no Diário de
  Vida, a notícia que corre a cidade.

## 4. Um ofício ou vários?

Como na vida: **um ofício principal e quantos o tempo deixar praticar.**

- O principal é a identidade — o que a cidade sabe de você, o título, o dia de trabalho (o repartidor de ofícios nunca troca
  o ofício do corpo, L-473).
- Qualquer outro pode ser praticado nas horas livres: pescar num dia de folga, cuidar da horta da casa. A prática de cada um
  cresce separada.
- O limite é natural: as horas do dia, o cansaço, as estações, as ferramentas que se tem.
- Trocar de principal é possível — e às vezes é a própria história: as viradas (o Patch 23) e as **passagens** de uma
  condição para outra (§ 6).

## 5. A escada

**As mecânicas fundamentais** (o que já existe e o que falta fazer antes dos ofícios que dependem delas):

| Mecânica | Hoje | Falta |
|---|---|---|
| O corpo, o movimento, a câmera | feito (D-355 a D-369) | — |
| A interação e o trabalho das mãos | feito (`G.Interact`, `G.Trabalho`) | os gestos de cada ofício |
| As coisas, a mochila, a forma das coisas | feito (`G.Inv`, `G.ItemArt`) | as ferramentas novas |
| A origem das coisas | feito (`G.Origem`) | as receitas novas |
| O combate do corpo | a base feita (`G.Combate`) | a profundidade (Patch 28) |
| A água, o relevo, o céu, a mata | feito (a natureza, fase A) | — |
| O mercado do corpo | as bancas existem | comprar e vender com preço que reage, a oficina própria |
| Mestre e aprendiz | — | ensinar e aprender técnicas, pelos laços |
| A vida a bordo e o porto | o navio existe por fora | os barcos e os navios por dentro, o chão que anda, o itinerário do porto, a viagem, a batalha no mar ([`navios.md`](navios.md)) |
| A arena | o anfiteatro e os gladiadores existem | lutar nela com o corpo, a plateia, a fama |
| A montaria | o cavalariço existe | montar, cavalgar |
| A construção pelo corpo | as obras existem | o corpo levantando, pedra a pedra |
| A lei e o crime | feito (a cela, o cadafalso, as testemunhas) | a profundidade (Patch 24) |

**Os ofícios fundamentais** (um tronco por família): a Pesca, a Lavoura, a Criação, a Mata e a caça, a Mineração, a Oficina,
o Combate, o Mar, a Sombra, o Comércio, a Fé e o saber, a Arte, o Poder. **Os derivados** nascem de cada tronco (a lista a
seguir).

## 6. Todos os ofícios (os que o mundo já tem e os que vislumbramos)

Em **negrito**, os que as pessoas do mundo já fazem hoje (o ofício existe no código); os outros são novos.

**Água** (tronco: a Pesca)
- **pescador** ([`oficio-pesca.md`](oficio-pesca.md)), **mergulhador**, **marinheiro**, **estivador** ([`oficio-estivador.md`](oficio-estivador.md)), **salineiro**, **salgador**
- pescador de rio e de lago (o anzol), pescador de rede e de arrastão, pescador de alto-mar (o tubarão, a baleia), mergulhador
  de pérolas e de esponjas, carpinteiro naval, navegador e piloto (as estrelas, as cartas), capitão, barqueiro de rio,
  balseiro, pirata e corsário, remador de galé (a condição do escravo), **contrabandista** do mar

**Terra** (tronco: a Lavoura)
- **agricultor**, **lavrador**, **fruticultor**, **vinhateiro**, **apicultor**, **sericultor**, **coletor**
- horticultor (a horta da casa), arrozeiro, oliveiro e lagareiro (o azeite), moleiro, padeiro, cervejeiro, adegueiro

**Criação** (tronco: o pastoreio)
- **pastor**, **cavalariço**, **açougueiro**
- vaqueiro, criador de cavalos, domador, queijeiro, tropeiro, curtidor (o couro)

**Mata** (tronco: a caça e a mata)
- **caçador**, **lenhador**, **explorador**
- caçador de feras (o leão, o urso), armadilheiro, falcoeiro, ervanário, carvoeiro, mateiro e guia, caçador de monstros
  (o dragão existe)

**Pedra e fogo** (tronco: a Oficina)
- **mineiro**, **ferreiro**, **oleiro**, **ourives**, **tecelão**, **construtor**
- armeiro, fundidor do bronze, pedreiro e canteiro, carpinteiro, marceneiro (os móveis das casas), vidreiro, tintureiro,
  alfaiate e costureira, sapateiro, cordoeiro (a corda), cesteiro (o vime), escultor, arquiteto (as obras grandes)

**Subterrâneo** (os troncos: a Mineração e o Saber; o plano em [`subterraneo.md`](subterraneo.md))
- **mineiro**
- garimpeiro, escorador, o homem do fogo, aguadeiro da mina, lapidário, explorador de cavernas, coletor de cristais e de
  salitre, arqueólogo, caçador de tesouros, decifrador de inscrições, cartógrafo das profundezas, saqueador de túmulos,
  negociante de antiguidades, guia das profundezas, sapador, poceiro, cavador de túneis

**Combate** (tronco: o Combate)
- **guerreiro**, **arqueiro**, **gladiador** ([`oficio-gladiador.md`](oficio-gladiador.md)), **vigia**, **carcereiro**, o capataz — o comitre e o feitor ([`oficio-capataz.md`](oficio-capataz.md))
- mercenário, cavaleiro, lanceiro, campeão de duelos, caçador de recompensas, guarda-costas, mestre de armas, comandante

**Sombra** (tronco: o crime)
- **contrabandista**, o ladrão (o furto já existe no mundo)
- batedor de carteira, arrombador, salteador de estrada, receptador, falsificador de moedas, espião, chantagista, assassino
  de aluguel

**Comércio e serviço** (tronco: o Comércio)
- **mercador**, **feirante**, **taverneiro**, **foguista**, **cobrador**
- caravaneiro, cambista e banqueiro, estalajadeiro, cozinheiro, barbeiro, aguadeiro, carregador, mensageiro

**Fé e saber** (tronco: o templo e a biblioteca)
- **sacerdote**, **escriba**, **copista**, **curandeiro**, o profeta e o oráculo (existem nas histórias)
- monge, peregrino, astrólogo, mestre-escola, médico e cirurgião, parteira, cartógrafo, cronista (escreve a crônica do mundo),
  filósofo

**Arte** (tronco: o espetáculo)
- **ator**, o atleta e o coro (existem nas festas e no teatro)
- bardo e contador de histórias (conta as histórias do próprio mundo), músico, dançarino, pintor, poeta, auriga (a corrida de
  carros), acrobata

**Poder** (tronco: a política)
- quem governa, o emissário, a nobreza (existem)
- conselheiro, juiz, embaixador, cortesão, agitador e rebelde, general

**As condições** (o que não se escolhe, e de onde se pode sair)
- **cativo**, preso, acorrentado, **criança**, órfão, **ancião** (existem)
- escravo de galé, escravo da mina, servo, mendigo, exilado, foragido, náufrago, viúvo, herdeiro

**As passagens** (uma vida que muda de ofício pela história): o escravo de galé que se revolta ou foge, vira liberto, e depois
gladiador, mercenário, marinheiro ou pirata; o preso que sai e vira contrabandista; o órfão que um mestre adota e vira
aprendiz; o soldado que deserta e vira salteador; o pescador que enriquece e vira armador de navios. Cada passagem nasce de um
fato do mundo, nunca de um menu.

## 7. O modelo: a Pesca (o primeiro, porque as bases já existem — a água, o pesqueiro contado, o navio)

- **Preparar:** a isca (a minhoca do chão, a isca viva pescada antes), a linha (do cordoeiro), o anzol (osso, bronze, ferro —
  da forja), a rede (do tecelão ou do cordoeiro), o barco (do carpinteiro naval, com a madeira do lenhador).
- **Onde:** o rio, o lago, a costa, o recife, o alto-mar; o pesqueiro tem os peixes contados (`G.Pesca`): pescar demais
  esvazia; os cardumes vêm com a estação e a hora (a madrugada), o vento e a chuva (`G.Ceu`), a profundidade (`G.Agua`).
- **O gesto:** ler a água (as sombras, as aves que mergulham), lançar (a mira e a força), esperar (a boia, os sons), fisgar
  (o instante certo), lutar (a tensão da linha contra a força e o cansaço do peixe — o peixe grande luta como bicho, pelo
  cérebro dos bichos), trazer.
- **A recompensa que se vê:** a boia que afunda, a linha que estala, a vara que enverga, a câmera que chega, a câmera lenta
  ao sair da água, o peixe se debatendo nas mãos, o tamanho medido, o cartão da espécie, a pessoa na margem que grita, o
  recorde batido.
- **O dia:** vender no mercado ou à taverna, salgar para o inverno (o salgador e o bacalhau), consertar a rede, descansar.
- **O longo prazo:** o barco maior, a tripulação de amigos, o pesqueiro secreto (e o rival que segue você até lá), o título
  de mestre pescador, os aprendizes.
- **As lendas:** o peixe lendário do lago (uma história do motor de histórias), o tubarão que rasga as redes (uma missão), a
  baleia do alto-mar.
- **O mundo:** a cidade com fome come o seu peixe; quem governa proíbe pescar no lago sagrado; a tempestade afunda o barco; o
  colega de barco vira o amigo da aba de Relacionamentos.
- **Os derivados:** o pescador de alto-mar (o navio, a tripulação, dias no mar — depois da vida a bordo), o mergulhador (o
  fôlego, as pérolas para o ourives), o marinheiro, o navegador.

**Outro modelo, das condições: o escravo de galé** (por inteiro em [`condicao-escravo-gale.md`](condicao-escravo-gale.md)). O ritmo do remo (que dá a velocidade do navio, também na batalha), as
correntes, o chicote, a fome; os laços com os outros remadores; o plano de fuga (uma missão com eles: a ferramenta escondida,
a hora da tempestade, a revolta); e a saída — fugir, ser libertado, morrer — para o próximo ofício.

## 8. A ordem dos patches (um tronco por vez, quando as bases dele estiverem prontas)

| Patch | O que entra | Por quê agora |
|---|---|---|
| 26 — A fundação dos ofícios | a máquina comum a todos (o registro dos ofícios, a prática, as técnicas, os títulos, a coleção, os recordes, a aba do ofício no painel), o kit da recompensa audiovisual (a câmera, a câmera lenta, o som que sobe, o cartão da coisa, a reação das pessoas), o mercado do corpo, mestre e aprendiz; e **a Pesca** inteira | as bases da água e do peixe existem |
| 27 — A terra | a Lavoura e a Criação (a horta, o campo, as estações, o solo, os bichos de criação) | o campo, as estações e os bichos existem |
| 28 — A arena e a guerra | o combate profundo; o guerreiro, o gladiador (a arena com o corpo), o mercenário, o campeão | depende do combate |
| 29 — O mar | a vida a bordo e o porto ([`navios.md`](navios.md)); o marinheiro, o navegador, o remador de galé ([`condicao-escravo-gale.md`](condicao-escravo-gale.md)), o pirata, o pescador de alto-mar | depende do navio por dentro |
| 30 — A mata | o caçador, o armadilheiro, o lenhador, o ervanário, o carvoeiro | a mata e os bichos existem |
| 31 — A oficina | o ferreiro, o armeiro, o oleiro, o tecelão, o carpinteiro, o marceneiro; a construção pelo corpo | a origem das coisas existe |
| 32 — A sombra | o ladrão, o contrabandista, o espião, o assassino | depende do conflito (Patch 24) |
| 33 — O comércio | o mercador, o caravaneiro, o taverneiro | o mercado do corpo (26) |
| 34 — A fé e o saber | o sacerdote, o curandeiro, o escriba, o oráculo | o templo e a biblioteca existem |
| 35 — A arte | o bardo (as histórias do mundo), o músico, o ator, o auriga | as histórias e o teatro existem |
| 36 — O poder | jogar como quem governa, o conselheiro, o juiz | a política existe |

As condições e as passagens entram com o tronco de cada uma (o remador de galé no 29, o preso no 32, o gladiador liberto no 28).

## 9. Como cada patch de ofício se prova

- O protocolo de sempre (a invariante, o cenário com os casos ruins, a regra do guard, o AUDIT).
- **O ofício não cria nada do nada:** cada entrada pelo livro, cada saída com a origem (o `ORIGEM.md` ganha as linhas).
- **O mundo sem o corpo é o mesmo:** as pessoas do mundo fazem o ofício pelos mesmos gestos e o mesmo mundo sai (como o t13
  do trabalho).
- **A variedade medida:** numa hora de jogo no ofício, quantas situações diferentes aparecem (lugares, espécies, tempos,
  acontecimentos) — com um piso.
- **O teste do dono:** uma hora só naquele ofício, sem enjoar. O ofício só sai quando passar nesse teste.
