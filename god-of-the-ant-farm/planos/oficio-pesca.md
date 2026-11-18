# A Pesca (Patch 26, parte 2: o primeiro ofício)

O primeiro ofício inteiro, sobre a fundação ([`oficios-fundacao.md`](oficios-fundacao.md)). É o primeiro porque as bases
dele já existem: a água desenhada e a onda (`G.Agua`), o vento e o tempo (`G.Ceu`), os bichos do mar, o nado do corpo e o
peixe contado.

## 1. A fantasia

Madrugada no lago. A névoa baixa, uma garça parada no junco. Você cavou minhocas na terra úmida atrás de casa, amarrou o
anzol de bronze na linha que comprou do cordoeiro e escolheu o remanso onde ontem viu um peixe pular. A boia treme — é o
miúdo, beliscando. Você espera. A boia some de uma vez: você fisga, a vara enverga até quase quebrar, a linha corta a água
para o junco. Você anda pela margem, cede com o braço, segura quando ele cansa. A água explode, o mundo desacelera por um
instante — um bagre enorme no ar, as escamas brilhando no primeiro sol. Na margem, um menino grita e corre chamar o pai.
Onze quilos e meio: o recorde da cidade era de onze. À noite, na taverna, já estão falando de você.

## 2. O que já existe no jogo

- **O peixe é contado** (`js/act-pesca.js`): cada água tem os seus pesqueiros (quadras de 8×8 casas), cada um comporta o peixe
  da sua água (o mar aberto muito, o recife mais, o rio pouco); onde se pesca demais o peixe acaba e, deixado em paz, volta.
- **O que morde** é o daquela água (`G.Waters`); **o jeito de pescar é o do povo** (as mãos, o arpão, a linha, a rede).
- **O dia do pescador do mundo** (`js/fishers.js`): sair de manhã, pegar a rede, o barco, a tripulação, voltar ao cais.
- **O corpo já pesca** (o trabalho «pescar» do `G.Trabalho`), com a ferramenta da mochila, e leva o peixe ao armazém.
- **A conserva:** o salgador (o bacalhau); **o mergulhador e as pérolas** (o ourives as usa).
- **Os bichos do mar:** a baleia, o golfinho, a orca, a tartaruga, o tubarão; e na beira, o crocodilo e o hipopótamo.

## 3. Os peixes

Um catálogo novo de espécies (≈ 36 na primeira leva), cada uma com:
- **onde vive** (rio, lago, costa, recife, mar aberto; a terra de cada povo) e **quando** (a estação, a hora, o tempo);
- **a isca que prefere**;
- **o jeito de morder** (o tímido belisca várias vezes; o voraz afunda de uma vez; o desconfiado larga se sentir o peso);
- **o jeito de lutar** (o corredor dispara; o saltador pula — abaixe a vara; o de fundo puxa para baixo; o esperto foge para o
  junco ou para as pedras);
- **o tamanho** (do pequeno ao enorme, numa curva: os grandes são raros), **a raridade** e **o valor**;
- **o que dá** (a comida — com a origem «peixe» —, o óleo, a pele, a concha, a pérola).

**Por terra** (o mesmo mundo, a água de cada lugar):
- **Rio e lago do norte:** truta, salmão (sobe o rio no outono), lúcio, perca, enguia.
- **Rio e lago do sul:** carpa, bagre, tilápia e perca do Nilo (o povo egípcio), peixe-branco dos lagos (o povo asteca).
- **Costa:** sardinha, cavala, tainha, robalo, dourada, polvo, lula, caranguejo, mexilhão.
- **Recife:** garoupa, moreia, peixe-papagaio, lagosta, esponja, a ostra de pérola.
- **Mar aberto** (com o barco): atum, peixe-espada, bacalhau e arenque (o norte), o tubarão.

**As lendárias** (cada uma uma história do motor de histórias, que dura anos):
- **o Velho do Lago** — uma carpa gigante que parte toda linha; as pistas são boatos, linhas partidas de outros pescadores, uma
  sombra enorme ao entardecer;
- **a Rainha Prateada** — o atum que passa uma vez por ano;
- **o peixe sagrado do templo** — pescá-lo é sacrilégio (um crime, com testemunhas);
- **o axolote dos lagos** — que o povo dos lagos não pesca.

## 4. O equipamento (cada coisa muda o jeito de pescar)

| Coisa | Como pesca | De onde vem |
|---|---|---|
| As mãos | o rio raso: agarrar | — |
| O arpão e a fisga | ver o peixe, mirar à frente dele (a água engana o olho), arremessar | o lenhador e a forja |
| A linha de mão | sem vara: sentir a mordida no dedo; a luta com o corpo | o cordoeiro |
| A vara com linha e boia | lançar longe, esperar, fisgar, lutar | o lenhador, o cordoeiro |
| A linha de fundo e o espinhel | várias linhas esperando; voltar para ver | o cordoeiro, a forja |
| O covo | uma armadilha de vime: pôr num lugar e voltar no outro dia | o cesteiro |
| A tarrafa | a rede jogada em roda sobre o cardume | o tecelão, o cordoeiro |
| A rede de espera e a de arrasto | deixar na água; arrastar com gente e barco | o tecelão, o cordoeiro |
| O puçá | tirar o peixe grande da água | o cesteiro |
| A canoa, o barco a remo, o barco a vela | ir aonde o peixe está | o carpinteiro naval |

**Os anzóis:** de osso, de bronze, de ferro — o bronze e o ferro só onde o povo os tem (a forja, `O.forged`). **As linhas:** de
fibra, de crina de cavalo, de seda (a melhor e a mais rara: a seda do povo). **As iscas:** a minhoca (cavada na terra úmida), a
larva, **a isca viva** (um peixinho pescado antes), a massa de pão (do cereal — nada vem do nada), as entranhas (do açougueiro),
a mosca feita à mão (uma técnica).

**Sem carretilha.** Na Antiguidade não se enrolava a linha numa carretilha: a vara tem a linha presa na ponta e a luta é com o
corpo — andar pela margem, ceder com o braço, enrolar a linha no pulso. A **carretilha** é uma invenção que se descobre tarde
(pede a roda e uma técnica): um dos grandes momentos da progressão.

## 5. O gesto (o coração)

1. **Ler a água:** as aves que mergulham, o peixe que pula, o redemoinho, a cor da água, o vento (sopra a linha), a hora (a
   madrugada e o entardecer), a estação; com a prática, **as sombras dos peixes** aparecem na água.
2. **O lance:** segurar para dar força, soltar para lançar; a mira e o vento; o lance perfeito cai rente ao junco sem
   enganchar.
3. **A espera:** a boia, os sons, o mundo em volta (a garça, o pôr do sol, o barco que passa); os miúdos beliscam (as mordidas
   falsas); com uma técnica, mexer a isca atrai.
4. **A fisgada:** a boia afunda e há **o instante certo** — cedo demais, perde a isca; tarde demais, o peixe cospe o anzol.
   Cada espécie morde de um jeito, e reconhecer a mordida é habilidade (com a prática, o personagem a sabe dizer).
5. **A luta:** a tensão da linha aparece na vara que enverga, no som da linha e numa marca discreta: quando o peixe corre,
   ceda; quando cansa, puxe; se esticar demais, **a linha parte** (o limite vem da linha e do anzol que você tem). Cada espécie
   luta do seu jeito; o esperto corre para o junco e para as pedras — leve-o para longe andando pela margem ou virando a
   vara; o peixe grande luta como os bichos do jogo (pelo cérebro deles).
6. **Trazer:** o puçá para o grande, a mão para o pequeno; **o momento da recompensa** (o kit da fundação); o peixe nas mãos
   (a animação de segurar e mostrar), o tamanho medido.

**Os outros jeitos têm o seu gesto:**
- **o arpão:** andar devagar na água rasa (o peixe foge do barulho), mirar à frente da sombra, a fisga de três pontas;
- **a tarrafa:** o arremesso em roda sobre o cardume, no tempo certo;
- **os covos:** escolher onde pôr e voltar no outro dia — um ciclo como o de uma horta;
- **a rede de arrasto:** um trabalho de equipe com gente do mundo (os amigos, os aprendizes) e o barco;
- **o mergulho:** o fôlego, a profundidade, a ostra de pérola, a moreia, o tubarão.

## 6. A recompensa que se vê e se ouve

- **A água:** os círculos da boia, o respingo, o peixe que pula num instante desacelerado, as escamas na luz da hora
  (`G.Ceu`).
- **O som:** a água, a linha zumbindo quando estica, o estalo quando parte, o silêncio da espera, a gritaria na margem.
- **A câmera:** chega mais perto na luta, enquadra a saída da água.
- **O cartão do peixe:** a figura, o nome, o peso e o tamanho, a raridade, «recorde da cidade!», onde, a hora, a isca.
- **As pessoas:** quem está na margem reage; a criança corre para ver; em casa, a família fala do peixe no jantar.
- **O que fica:** a linha no Diário de Vida; a notícia que corre a cidade («o filho do ferreiro perdeu o recorde»); a tábua dos
  recordes na taverna do porto.

## 7. O ciclo

- **O curto (minutos):** um lance, um peixe.
- **O dia:** preparar (cavar a minhoca, consertar a rede, escolher o lugar pela hora, pela estação e pelo tempo), pescar, voltar
  com a cesta (o peso conta na mochila), vender (o mercado, a taverna, a encomenda) ou guardar (salgar, defumar), cozinhar em casa
  (a família come o seu peixe), descansar.
- **As estações:** o salmão sobe o rio no outono, o atum passa na primavera, o lago congela no inverno do norte (a pesca no gelo).
- **O longo prazo (semanas):** o barco melhor, a tripulação de amigos, **o pesqueiro secreto** (e o rival que segue você até lá),
  o título de mestre, a coleção completa, os aprendizes; o pesqueiro esgotado se todos pescarem demais — e as brigas no porto.
- **As lendas:** a caçada ao Velho do Lago, que pode durar anos de jogo.

## 8. A progressão

- **A prática:** alarga o instante da fisgada, aguenta mais tensão, abre a leitura (as sombras, o nome da mordida), lança mais
  longe e mais certo.
- **As técnicas** (a primeira leva, ≈ 18): o nó firme; a isca viva; mexer a isca; a linha de fundo; o espinhel; o covo; a tarrafa;
  ler as aves; ler a maré; **pescar de noite com tocha** (o peixe sobe para a luz); a fisga; a rede de arrasto; consertar a rede;
  a salga e a defumação; **o garum** (o molho de peixe dos povos do sul); o mergulho fundo; **a pesca no gelo** (o norte);
  **a carretilha** (tarde: pede a roda).
- **De quem se aprende:** o velho pescador da vila (um mestre do mundo), os livros da biblioteca (os gregos escreviam sobre a
  pesca), a descoberta (a primeira noite com tocha).
- **As ferramentas:** o anzol de osso → bronze → ferro; a linha de fibra → crina → seda; a canoa → o barco a remo → o barco a vela.
- **Os títulos:** aprendiz de pescador → pescador → **mestre pescador** (a peça de mestre: uma espécie rara, e o aceite dos
  pescadores do porto) → **a lenda** (quem pegou um lendário).
- **A coleção:** o caderno das espécies (as que faltam em silhueta), os tamanhos, os recordes.

## 9. O mundo (o que não deixa virar minijogo)

- **A economia:** o preço do peixe em cada cidade (a fome o encarece; muitos pescadores o barateiam); as encomendas (a taverna, o
  templo, o banquete do rico); o mercador que leva o peixe salgado a outra cidade.
- **O peixe contado:** pescar demais esvazia o pesqueiro de todos — os pescadores do mundo reclamam, e quem governa pode proibir a
  pesca num lugar por um tempo (a lei).
- **A lei e a fé:** o lago sagrado (sacrilégio), a taxa do porto (o cobrador), os dias santos.
- **Os laços:** o colega de barco, o mestre, o rival, o freguês fiel; a família que come o seu peixe; o filho que aprende com você.
- **Os perigos:** a tempestade (o barco vira, o corpo nada até a margem), o crocodilo e o hipopótamo na beira do rio, a moreia e o
  tubarão no mergulho, a água gelada do norte, o afogamento (e o resgate do Patch 23).
- **As histórias e as missões:** o pedido do vizinho («um peixe grande para o casamento da minha filha»), **o concurso de pesca na
  festa** (os pescadores do mundo competem pela prática deles), a lenda do Velho do Lago, o náufrago achado no mar.
- **O anel no bucho do peixe:** a coisa que alguém deixou cair na água de verdade (o que caiu no chão é do mundo) pode aparecer
  dentro de um peixe pescado — e voltar ao dono é uma história.
- **As falas:** os pescadores falam do tempo, do peixe que fugiu, da lenda; quem passa pergunta «pegou algo?».
- **O mundo pesca igual:** os pescadores do mundo usam os mesmos gestos, ganham prática, batem recordes; o melhor pescador da
  cidade é uma pessoa de verdade.

## 10. Por povo (pela terra e pelas artes de cada um)

- **O norte:** o bacalhau e o arenque, a salga, a pesca no gelo, o salmão do outono.
- **O Egito:** o Nilo, a perca e a tilápia, o barco de papiro, o crocodilo e o hipopótamo.
- **Os gregos e os romanos:** o atum das armações, a dourada, o polvo, o garum.
- **Os astecas:** os lagos, as redes, o peixe-branco, o axolote que não se pesca.

## 11. Os derivados (que nascem deste tronco)

- **o pescador da costa** (a tarrafa, os covos de polvo, o marisco);
- **o mergulhador** (as pérolas para o ourives, as esponjas; o fôlego; os perigos);
- **o pescador de alto-mar** (o barco a vela, dias no mar, o atum, a baleia) — depois da vida a bordo (Patch 29);
- **o salgador e o defumador** (a conserva, o garum);
- e os que servem a pesca: **o cordoeiro** (as linhas e as redes), **o cesteiro** (os covos e o puçá), **o carpinteiro naval**
  (os barcos).

## 12. As fases dentro do patch

| Fase | O quê |
|---|---|
| P1 — O rio e o lago | a vara, a linha de mão, o arpão, o covo; ≈ 14 espécies; o Velho do Lago; a tábua dos recordes |
| P2 — A costa | a tarrafa, o polvo, o caranguejo, o marisco; a canoa e o barco a remo com o corpo remando; ≈ 12 espécies |
| P3 — O mergulho | o fôlego, as pérolas, as esponjas, a moreia, o tubarão |
| P4 — A conserva e o mercado | a salga, a defumação, o garum; as encomendas; o concurso da festa |
| Depois (Patch 29) | o alto-mar, com a vida a bordo do navio |

## 13. As provas

- **Nada vem do nada:** todo peixe sai do pesqueiro contado; a isca se gasta pelo livro; o anel no bucho é uma coisa perdida de
  verdade.
- **O cartão só mostra o que existe:** o peixe pescado é o do mundo; o recorde é verdadeiro.
- **O mundo sem o corpo é o mesmo:** os pescadores do mundo pescam pelos mesmos gestos e o mesmo mundo sai.
- **Os casos ruins:** o save no meio da luta (a luta é uma operação do mundo: volta ou acaba limpa); o corpo se afoga no meio; a
  tempestade no meio da saída; o deus mata o peixe na linha; o pesqueiro esgotado; o rival no pesqueiro secreto.
- **A variedade medida:** numa hora de pesca, quantas situações diferentes (espécies, lugares, tempos, acontecimentos) — com um
  piso.
- **O teste do dono:** uma hora só pescando, sem enjoar. A Pesca só sai quando passar.
