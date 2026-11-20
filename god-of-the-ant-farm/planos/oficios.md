# Os Ofícios — o plano (do Patch 25 em diante)

O pedido do dono (a conversa depois do plano do Patch 23): cada ofício com uma mecânica própria, **profunda e ligada ao
mundo** — nunca um minijogo solto. Gostoso de fazer (a recompensa que se vê e se ouve), com progressão, recompensas e um
ciclo que prende: «só esse ofício poderia ser um jogo». Ofício no sentido largo: **o que o personagem está vivendo** —
pescar, guerrear, roubar, rezar, e também ser escravo de galé, preso, órfão. Uma escada: as mecânicas fundamentais, os
ofícios fundamentais e os ofícios derivados. Vem depois do Patch 24 (o plano dos NPCs está em
`planos/patch23-as-vidas.md`); é trabalho de meses, um ofício por vez, cada um até ficar ótimo.


**As quatro camadas** (aprovado, 19/11/2026): as bases (as leis do mundo), as perícias (a prática e as técnicas), os ofícios (que
usam perícias) e as condições — o catálogo em [`pericias.md`](pericias.md).
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
| O combate do corpo | a base feita (`G.Combate`) | a profundidade (Patch 33) |
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

## 6. Todos os ofícios (a lista aprovada pelo dono, 20/11/2026)

**77 ofícios e 13 condições.** Cada um aguenta horas de jogo sozinho (a máxima); o que não aguentava virou **especialidade** (um
ramo do mesmo jogo), **papel** ou **título** (um lugar no grupo, um degrau da carreira) ou **função do mundo** (o que se faz por um
dia). ★ = já tem o seu documento a fundo.

**O mar (8):** ★ [pescador](oficio-pesca.md) (inclui o pescador de rede) · **mergulhador** (o recife, as pérolas, o naufrágio) ·
★ [navegador](oficio-navegador.md) (inclui o piloto do porto, o cartógrafo do mar) · **marinheiro** (inclui o barqueiro, o canoeiro;
capitão é título) · **construtor naval** (o estaleiro, o casco) · ★ [estivador](oficio-estivador.md) (inclui o guindasteiro) ·
★ [remador de galé](condicao-escravo-gale.md) (voga é título) · ★ [pirata](oficio-pirata.md) (inclui o corsário, o naufragador)

**A terra (5):** **agricultor** (o campo, a horta, o pomar, o arrozal) · **vinhateiro e lagareiro** (o vinho e o azeite) ·
**apicultor** · **pastor** (inclui o queijeiro, a transumância) · **criador de cavalos** (inclui o domador)

**A cozinha (3)** ([`cozinha.md`](cozinha.md)): **cozinheiro** (inclui o doceiro, o cozinheiro de bordo, o provador) · **padeiro**
(inclui o moleiro) · **açougueiro** (inclui o salgador e o defumador)

**A mata (5):** ★ [mateiro](oficio-mateiro.md) (inclui o guia da mata, o batedor) · **caçador** (inclui o armadilheiro, o caçador
de feras) · **falcoeiro** · **ervanário** (o remédio e o veneno) · **lenhador** (inclui o carvoeiro)

**As alturas (2)** ([`montanha.md`](montanha.md)): **guia de montanha** (inclui o resgatador) · **coletor das alturas** (os
penhascos, o mel das rochas, o cristal, o gelo)

**O subterrâneo (3):** ★ [mineiro](oficio-mineiro.md) (inclui o sapador, o poceiro) · **garimpeiro** (o rio, a bateia, a corrida do
ouro) · **explorador de cavernas**

**A descoberta (1):** **explorador** (as terras sem mapa, o primeiro encontro com outro povo)

**O passado (3)** ([`passado.md`](passado.md)): ★ [arqueólogo](oficio-arqueologo.md) (inclui o decifrador, o restaurador) ·
★ [caçador de tesouros](oficio-cacador-tesouros.md) · ★ [saqueador de túmulos](oficio-saqueador.md)

**A oficina (11):** **ferreiro** (inclui o fundidor) · **armeiro** · **ourives** (inclui o lapidário) · **oleiro** · **tecelão**
(inclui o tintureiro, a seda) · **alfaiate** · **coureiro** (o couro, o sapato, a sela) · **carpinteiro** (inclui o marceneiro) ·
**cordoeiro** (a corda, a rede, o cesto) · **vidreiro** · **construtor** (inclui o pedreiro; arquiteto é título)

**A luta (8):** **soldado** (inclui o arqueiro, o fundeiro, o escalador de muralhas) · **cavaleiro** · **mercenário** ·
**comandante** (general é título) · ★ [gladiador](oficio-gladiador.md) (inclui o bestiário; lanista é título) · **guarda** (inclui o
carcereiro, o guarda-costas) · **caçador de recompensas** (inclui o rastreador de fugitivos) · ★ [capataz](oficio-capataz.md) (o
comitre e o feitor)

**A sombra (6):** **ladrão** (inclui o batedor de carteira, o arrombador) · **salteador** (o pirata da terra) · **contrabandista**
(inclui o receptador) · **falsificador** · **espião** (inclui o informante, o chantagista) · **assassino** (inclui o envenenador)

**O comércio (4):** ★ [taverneiro](oficio-taverneiro.md) (inclui o cervejeiro; estalajadeiro é título) · **mercador** (inclui o
feirante, o especieiro) · **caravaneiro** · **banqueiro** (inclui o cambista)

**A fé e o saber (6):** **sacerdote** · **oráculo** (os presságios, a profecia que um rei vem ouvir) · **monge** (inclui o eremita,
o peregrino) · **escriba** (inclui o copista, o cronista, o mestre-escola) · **sábio** (o filósofo, o astrólogo, o cartógrafo) ·
**curandeiro** (inclui o médico, a parteira, o barbeiro)

**A arte (7):** **bardo** (inclui o poeta) · **músico** · **ator** (inclui o dançarino, o acrobata) · **pintor** · **escultor** ·
**auriga** · **atleta**

**O poder (5):** ★ [quem governa](oficio-governante.md) (o rei, o cônsul, o imperador, o porta-voz… — inclui o nobre) ·
**conselheiro** (inclui o cortesão) · **juiz** · **embaixador** · **agitador**

**As condições (13):** ★ [galeote](condicao-escravo-gale.md) · escravo da mina · gladiador escravo · cativo e preso · servo ·
mendigo · exilado · foragido · náufrago · perdido (inclui o soterrado) · órfão, criança, ancião · viúvo · herdeiro

**As funções do mundo** (fazem-se por um dia, sem ser ofício inteiro): aguadeiro, carregador, mensageiro, foguista, servente,
faroleiro, salineiro, cobrador.

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

## 8. A ordem dos patches

A ordem de fazer está no [`roteiro.md`](roteiro.md) (patches 25 a 42): a fundação e a Pesca primeiro; depois quem tira da
natureza (a terra, a escalada e a mata, a mina; a montanha de dias depois do mundo grande), quem transforma (a oficina), quem luta, rouba e navega (a arena, a sombra, o mar), quem troca
(o comércio) e, por último, a fé e o saber, a arte e o poder. As condições e as passagens entram com o tronco de cada uma.

## 9. Como cada patch de ofício se prova

- O protocolo de sempre (a invariante, o cenário com os casos ruins, a regra do guard, o AUDIT).
- **O ofício não cria nada do nada:** cada entrada pelo livro, cada saída com a origem (o `ORIGEM.md` ganha as linhas).
- **O mundo sem o corpo é o mesmo:** as pessoas do mundo fazem o ofício pelos mesmos gestos e o mesmo mundo sai (como o t13
  do trabalho).
- **A variedade medida:** numa hora de jogo no ofício, quantas situações diferentes aparecem (lugares, espécies, tempos,
  acontecimentos) — com um piso.
- **O teste do dono:** uma hora só naquele ofício, sem enjoar. O ofício só sai quando passar nesse teste.
