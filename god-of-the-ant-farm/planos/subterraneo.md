# O subterrâneo no corpo (uma mecânica fundamental, e os ofícios que ela abre)

O pedido do dono (18/11/2026): o subterrâneo já existe na vista do deus, mas ainda não no Modo Encarnado — e vai entrar «em
breve»: as minas, as cavernas, a busca de tesouros, a arqueologia, os aventureiros atrás de pedras preciosas e de coisas de
povos antigos. Aqui fica o registro, o esboço da mecânica e os ofícios que ela abre.

## 1. O que já existe

- **O subterrâneo do mundo** na vista do deus: as cavernas (`js/caves.js` — os bichos dormem e se abrigam nelas, as pessoas se
  refugiam nelas na guerra), a camada de baixo do mapa, a arte das cavernas (`js/cave-art.js`).
- **As minas:** as jazidas e os veios (o cobre, o estanho, o ferro, o ouro), a mina que se esgota, o mineiro, o minério que só
  nasce da mina (a origem das coisas).
- **O oráculo da caverna** (quem governa vai consultá-lo), o dragão e as tocas dos bichos.
- **O passado do próprio mundo:** as cidades que acabaram (a memória delas, as ruínas), os cemitérios e o ossuário, as coisas
  perdidas no chão — **o mundo já guarda um passado de verdade para se cavar.**

## 2. O que falta (o corpo debaixo da terra)

1. **Andar nos túneis e nas cavernas em 3D:** o chão, as paredes e o teto de pedra, a passagem estreita, a descida pela corda.
2. **A luz é um recurso:** o escuro de verdade; a tocha e a lamparina gastam o óleo e a madeira (pelo livro); sem luz, as mãos na
   parede.
3. **O ar e a água:** o ar ruim no fundo, a fumaça que não sai, a água que mina e inunda.
4. **O desabamento:** a escora de madeira segura o teto; sem ela, a rocha cede — e o soterrado precisa de quem o tire.
5. **Perder-se:** o labirinto; o mapa que se desenha andando; o fio amarrado na entrada.
6. **Os bichos de baixo:** o morcego, o urso da caverna, a cobra, a toca do dragão.

## 3. A regra: o tesouro é o passado de verdade

**Nada vem do nada:** o tesouro que se acha é o que um povo do mundo fez e deixou de verdade — o túmulo do rei que morreu há
duzentos anos, com o que foi enterrado com ele; as ruínas de uma cidade que acabou, com o que ficou nelas; a moeda de um povo que
não existe mais; a coisa que alguém escondeu numa caverna numa guerra. A arqueologia cava a história que o próprio mundo viveu (e
os mundos de quinhentos e mil anos são os mais ricos). Pedras preciosas e cristais têm a sua jazida, como o cobre e o estanho.

### O passado em camadas (a pergunta do dono, aprovado em 19/11/2026; por inteiro em [`passado.md`](passado.md))

**A pergunta:** como há tesouro de rei antigo e antiguidade no ano 15, se o mundo acabou de nascer? **A proposta:** as duas
coisas, em camadas (aprovada) — o passado de antes do mundo, que nasce com ele, e o passado do próprio mundo, que cresce com os anos.

1. **O passado de antes (nasce com o mundo, como a geologia).** Ao criar o mundo, pela semente, nascem dois a quatro **povos
   antigos** que viveram ali antes: onde moraram (onde uma cidade moraria — o rio, a terra boa), o que sabiam (a pedra, o
   bronze), o estilo, a escrita que ninguém mais lê, e **como acabaram** pelo próprio mapa (a cheia, o vulcão, a guerra, a peste).
   O que ficou: as ruínas cobertas de mato e terra, os túmulos com o enxoval do rei, a mina antiga que seguiu a parte rasa de um
   veio de verdade, o tesouro escondido, a pintura da caverna, os ossos. **Nada vem do nada:** o material de cada coisa é o da
   terra daquele povo (túmulo de ouro só perto de ouro). É finito, vai no save, existe desde o dia 0 e **qualquer um acha** — o
   arado que bate num pote, a mina que rompe numa galeria velha, a cidade que cava a fundação sobre uma ruína. Os mitos que o
   mundo já conta (`lore.js`: «os antigos a chamam…») passam a falar desses povos — e às vezes o mito diz a verdade de onde está.
2. **O passado do próprio mundo (cresce com os anos).** O que a simulação já faz vira arqueologia quando envelhece: a cidade que
   acabou (o `S.urbPast` já a lembra), o rei enterrado com as coisas dele (o enxoval sai do povo pelo livro), as armas do campo de
   batalha, o tesouro que alguém enterrou na guerra e morreu sem buscar, o navio afundado com a carga. **O tempo enterra:** o que
   fica no chão anos a fio é coberto e só se acha cavando. **As camadas:** quanto mais fundo, mais velho — os antigos embaixo, o
   mundo por cima (o arqueólogo lê as camadas).
3. **O perdido de agora:** a bolsa que caiu, as economias que o lavrador enterrou.

**Como fica no tempo:** no ano 15, o caçador de tesouros vive dos antigos (raros e fundos) e do perdido de agora; no ano 100, o
passado do mundo já é maior; no mundo de 500 ou 1.000 anos, os antigos estão quase esgotados e o passado do próprio mundo
domina — **o túmulo do rei cuja história você viu, ou que você mesmo viveu.** O ofício também nasce por causa, não por
calendário: o achado vira boato, o boato traz os caçadores, e o saque do túmulo de um rei do mundo é crime e sacrilégio.

**Os sinais:** o monte do túmulo, as pedras alinhadas no mato, a plantação que cresce diferente sobre os muros enterrados, a
inscrição da caverna, o mito, o mapa velho comprado de um negociante, o achado do arado.

**A ordem (o truque):** o ofício entra no Patch 40, mas **o registro do passado começa antes** — o enxoval dos enterros, o
tesouro escondido e o tempo que enterra entram cedo e baratos (com o subterrâneo, no 32). Assim, quando o arqueólogo chegar, os
mundos prontos de 500 e 1.000 anos já terão séculos de história de verdade debaixo da terra. Os povos antigos mudam a criação
do mundo: os mundos prontos se geram de novo.

## 4. Os ofícios que o subterrâneo abre

**A mina** (o tronco: a Mineração)
- **mineiro** (já existe) — e os do cobre, do estanho, do ferro, do ouro;
- **garimpeiro** — o ouro do rio, na bateia; a pedra preciosa no cascalho;
- **escorador** — a madeira que segura o teto (a vida dos outros nas mãos dele);
- **o homem do fogo** — a técnica antiga de esquentar a rocha com fogo e rachar com água;
- **aguadeiro da mina** — tirar a água que inunda (o balde, a roda, o parafuso de água);
- **carregador de minério**;
- **lapidário** — cortar e polir as pedras preciosas (para o ourives);
- **feitor da mina** (o capataz da mina) e **o escravo da mina** (a condição).

**As cavernas**
- **explorador de cavernas** — descer onde ninguém desceu, mapear;
- **coletor de cristais e de salitre**;
- **caçador das cavernas** — o urso da caverna, os morcegos;
- **o eremita** — a vida escondida numa caverna;
- **o oráculo e o sacerdote dos mistérios** — os ritos de baixo da terra (os templos subterrâneos dos povos antigos).

**O passado** (o tronco: o Saber e a Aventura)
- **arqueólogo, ou antiquário** — cavar as ruínas do próprio mundo e entender quem viveu ali;
- **caçador de tesouros** — o túmulo, a câmara escondida, a moeda perdida;
- **decifrador de inscrições** — ler a escrita de um povo que acabou (o escriba do passado);
- **cartógrafo das profundezas**;
- **saqueador de túmulos** (a sombra) — o crime, o sacrilégio, o povo que não perdoa;
- **negociante de antiguidades** — e o receptador do que foi roubado.

**A aventura**
- **aventureiro e guia das profundezas** — levar outros até lá e trazer de volta;
- **caçador de monstros** — a toca do dragão.

**A guerra e as obras**
- **sapador** — cavar por baixo da muralha no cerco (o cerco já existe);
- **poceiro** — cavar os poços e as cisternas;
- **cavador de túneis** — os aquedutos e os canais de baixo da terra.

**As condições**
- **o soterrado** — preso num desabamento, a luta para sair;
- **o escravo da mina**;
- **o refugiado da caverna** (já existe no mundo: o povo se esconde nelas na guerra);
- **o foragido escondido**.

## 5. As partes (para quando for feito)

| Parte | O quê |
|---|---|
| S1 — Descer | as cavernas no 3D do corpo, a luz, a corda, o escuro |
| S2 — A mina | o veio, a picareta, a escora, a água, o desabamento, o minério que sobe |
| S3 — O passado | o tesouro do passado de verdade, as ruínas, os túmulos, as inscrições |
| S4 — Os perigos | o ar, a inundação, o desabamento, perder-se, os bichos de baixo |
| S5 — Os ofícios | o garimpeiro, o lapidário, o arqueólogo, o caçador de tesouros, o sapador, e os outros |

Os ofícios do subterrâneo entram no Patch 32 («O subterrâneo e a mina») e o passado (a S3, a arqueologia) no Patch 40, com a fé e o saber; os planos de cada
um seguem o molde dos ofícios ([`oficios.md`](oficios.md)).
