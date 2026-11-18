# A Pesca — o documento completo (Patch 26, parte 2: o primeiro ofício)

**A máxima:** pescar tem de ser tão bom que poderia ser um jogo sozinho — horas a fio, só pescando, sem enjoar. Este documento
usa a fundação dos ofícios ([`oficios-fundacao.md`](oficios-fundacao.md)). Os números são propostas para começar; a afinação
vem jogando.

## 1. A fantasia

Madrugada no lago. A névoa baixa, uma garça parada no junco. Você cavou minhocas na terra úmida atrás de casa, amarrou o anzol
de bronze na linha que comprou do cordoeiro e escolheu o remanso onde ontem viu um peixe pular. A boia treme — é o miúdo,
beliscando. Você espera. A boia some de uma vez: você fisga, a vara enverga até quase quebrar, a linha corta a água para o
junco. Você anda pela margem, cede com o braço, segura quando ele cansa. A água explode, o mundo desacelera por um instante —
um bagre enorme no ar, as escamas brilhando no primeiro sol. Na margem, um menino grita e corre chamar o pai. Onze quilos e
meio: o recorde da cidade era de onze. À noite, na taverna, já estão falando de você.

## 2. O que já existe no jogo

- **O peixe é contado** (`js/act-pesca.js`): cada água tem os seus pesqueiros (quadras de 8×8 casas), cada um comporta o peixe
  da sua água; onde se pesca demais o peixe acaba e, deixado em paz, volta.
- **O que morde** é o daquela água (`G.Waters`); **o jeito de pescar é o do povo** (as mãos, o arpão, a linha, a rede).
- **O dia do pescador do mundo** (`js/fishers.js`): a rede, o barco, a tripulação, o cais.
- **O corpo já pesca** (o trabalho «pescar» do `G.Trabalho`), com a ferramenta da mochila.
- **A conserva** (o salgador e o bacalhau), **o mergulhador e as pérolas**, **os bichos do mar** (a baleia, o golfinho, a orca,
  a tartaruga, o tubarão) e, na beira, o crocodilo e o hipopótamo.
- **Os barcos por dentro ainda não existem** (a canoa, o barco a remo, o barco de pesca e o itinerário do porto são da vida a
  bordo, [`navios.md`](navios.md)): a pesca da margem não depende deles; a da costa e a de alto-mar, sim.

## 3. As espécies (36)

**As mordidas:** **belisca** (o miúdo, várias vezes antes de levar), **voraz** (afunda de uma vez), **desconfiado** (larga se
sentir o peso: a linha frouxa), **arrasta** (sai nadando com a isca: a boia corre de lado). **As lutas:** **corredor** (dispara
longe), **saltador** (pula: abaixe a vara ou ele se solta), **de fundo** (puxa para baixo, devagar e forte), **esperto** (vai
para o junco e as pedras: enrosca), **pesado** (cansa devagar), **manso** (vem fácil). **A raridade:** comum, incomum, rara,
lendária. **O peso:** o comum e o recorde possível do mundo.

### Rio e lago do norte

| Espécie | Onde e quando | Isca | Morde / luta | Peso | Raridade | Para quê |
|---|---|---|---|---|---|---|
| Truta | água fria e corrente, manhã | mosca, larva | desconfiada / saltadora | 0,5–4 kg | comum | comida boa |
| Salmão | sobe o rio no outono | isca viva, mosca | voraz / saltador | 3–30 kg | incomum (fora do outono, rara) | comida, salgado, defumado |
| Lúcio | junco do lago parado | isca viva | voraz / esperto | 2–20 kg | incomum | comida; os dentes cortam a linha de fibra |
| Perca | lago, dia inteiro | minhoca | belisca / manso | 0,2–2 kg | comum | comida; isca viva para os grandes |
| Enguia | rio de noite, fundo de lama | entranhas, minhoca | arrasta / de fundo | 0,5–5 kg | comum | comida, defumada; escorrega da mão |
| Esturjão | rio grande, fundo, primavera | entranhas | arrasta / pesado | 20–150 kg | rara | comida, ovas (o caviar, caro), cola de peixe |

### Rio e lago do sul

| Espécie | Onde e quando | Isca | Morde / luta | Peso | Raridade | Para quê |
|---|---|---|---|---|---|---|
| Carpa | lago e remanso, tarde quente | massa de pão | desconfiada / pesada | 1–20 kg | comum | comida |
| Bagre | rio barrento, noite | entranhas, minhoca | voraz / de fundo | 1–40 kg | comum (os grandes, raros) | comida |
| Tilápia | o Nilo e os lagos quentes | massa, minhoca | belisca / manso | 0,3–3 kg | comum | comida (o povo egípcio) |
| Perca do Nilo | o Nilo, fundo, madrugada | isca viva | voraz / pesado | 5–100 kg | rara | comida, fama |
| Peixe-elétrico | o Nilo, lama | minhoca | arrasta / manso — **dá choque** na mão | 1–10 kg | incomum | o curandeiro o quer (o choque contra a dor) |
| Peixe-branco | os lagos do povo asteca | larva | belisca / manso | 0,2–1 kg | comum | comida (pescado em rede) |

### Costa

| Espécie | Onde e quando | Isca | Morde / luta | Peso | Raridade | Para quê |
|---|---|---|---|---|---|---|
| Sardinha | cardume na costa, verão | rede, tarrafa | — | 0,05–0,1 kg | comum | comida, salgada, isca |
| Anchova | cardume, primavera | rede | — | 0,03 kg | comum | o garum |
| Cavala | cardume, manhã | tira de peixe | voraz / corredora | 0,3–2 kg | comum | comida, isca |
| Tainha | foz do rio, maré enchendo | massa | desconfiada / saltadora | 1–6 kg | comum | comida, ovas secas |
| Robalo | pedras com espuma, entardecer | isca viva | voraz / esperto | 1–12 kg | incomum | comida fina |
| Dourada | areia e pedra, dia | caranguejo, mexilhão | desconfiada / corredora | 0,5–6 kg | incomum | a mesa do rico |
| Sargo | pedras, ondas | mexilhão | belisca / esperto | 0,3–3 kg | comum | comida |
| Linguado | fundo de areia | minhoca do mar | arrasta / de fundo | 0,5–8 kg | incomum | comida fina |
| Polvo | toca nas pedras | covo, a mão | — / agarra (puxar com jeito) | 1–15 kg | incomum | comida; o polvo grande foge do covo |
| Lula | de noite, com luz | tocha e isca | belisca / corredora | 0,2–3 kg | incomum | comida; a tinta (o copista a quer) |

### Os do fundo e das pedras (a mão, o covo, o mergulho)

| Espécie | Onde | Como | Peso | Raridade | Para quê |
|---|---|---|---|---|---|
| Caranguejo | areia e pedras da costa | covo, a mão (belisca o dedo) | 0,2–2 kg | comum | comida, isca |
| Camarão | estuário, noite | tarrafa, rede fina | — | comum | comida, isca |
| Mexilhão | pedras na maré baixa | a mão | — | comum | comida, isca |
| Ostra | baía rasa | a mão, mergulho | — | comum | comida (de vez em quando, uma pérola pequena) |

### Recife (o mergulho e a linha)

| Espécie | Onde e quando | Isca / como | Morde / luta | Peso | Raridade | Para quê |
|---|---|---|---|---|---|---|
| Garoupa | buraco no recife | isca viva | voraz / esperta (entra na toca) | 3–60 kg | incomum | comida fina |
| Moreia | fenda do recife | entranhas | voraz / **morde quem a pega** | 1–15 kg | incomum | comida; o perigo do mergulho |
| Peixe-papagaio | recife raso, dia | o arpão | — / corredor | 1–8 kg | comum | comida, as cores |
| Lagosta | toca no recife, noite | covo, mergulho | — | 0,5–8 kg | incomum | o banquete do rico |
| Ostra de pérola | recife fundo | mergulho | — | — | rara (a pérola, mais ainda) | a pérola para o ourives |

### Mar aberto (o barco; o alto-mar inteiro com o navio, no Patch 29)

| Espécie | Onde e quando | Isca | Morde / luta | Peso | Raridade | Para quê |
|---|---|---|---|---|---|---|
| Atum | passa na primavera, em cardume | isca viva grande | voraz / corredor e pesado | 20–300 kg | incomum | comida, salgado, as armações do sul |
| Peixe-espada | mar fundo, noite | lula | voraz / saltador | 20–200 kg | rara | comida, a espada (troféu) |
| Bacalhau | mar frio do norte | arenque | voraz / pesado | 2–40 kg | comum (no norte) | o bacalhau salgado |
| Arenque | cardume frio | rede | — | 0,2 kg | comum | comida, isca, salgado |
| Tubarão | mar aberto, cheiro de sangue | carne | voraz / **luta como fera** (o cérebro dos bichos) | 50–500 kg | rara | a pele, os dentes, o óleo, a fama — e o perigo |

## 4. Os lendários (cada um uma história de anos)

| Lendário | Onde | As pistas | O que pede | A recompensa |
|---|---|---|---|---|
| **O Velho do Lago** — uma carpa de 80 kg | o lago mais fundo do mundo | boatos dos pescadores, linhas partidas, a sombra ao entardecer, um velho que diz ter visto | linha de seda, anzol de ferro, massa de mel e cevada (uma técnica), a madrugada de outono | o título de lenda; o povo lembra para sempre |
| **A Rainha Prateada** — o atum de 500 kg | passa uma vez por ano, longe da costa | as aves, o cardume que foge | o barco, uma tripulação de amigos, a linha mais forte | idem; a tábua dos recordes |
| **O peixe sagrado do templo** | o lago sagrado | o sacerdote fala dele | pescá-lo é **sacrilégio**: crime, com testemunhas | a desgraça, ou a fama de ímpio |
| **O axolote dos lagos** | os lagos do povo asteca | as crianças contam | o povo não o pesca: tirá-lo ofende | uma missão de devolvê-lo à água |

## 5. O equipamento (cada coisa muda o jeito de pescar)

| Coisa | Níveis | Como se consegue | O que muda |
|---|---|---|---|
| **Vara** | de junco → de aveleira → de mestre | o junco se corta na margem (coleta); a aveleira, o lenhador; a de mestre, encomenda ao carpinteiro | o alcance do lance, a força que a vara aguenta, o quanto ela avisa a mordida |
| **Linha** | de fibra → de crina → de seda | a fibra, o cordoeiro (ou fazer, com a técnica do nó); a crina, o cavalariço; a seda, comprada caro onde o povo tem seda | **o limite da tensão**: fibra 60, crina 75, seda 95 (de 100); a seda é quase invisível (os desconfiados mordem mais) |
| **Anzol** | de osso → de bronze → de ferro | o osso, do bicho caçado ou do açougueiro (fazer); o bronze e o ferro, a forja (só onde o povo os tem) | o tamanho do peixe que segura; o ferro não abre com o grande |
| **Boia** | de pena → de cortiça | fazer (a pena da ave, a cortiça da árvore) | o quanto se vê a mordida miúda |
| **Iscas** | minhoca, larva, massa de pão, entranhas, mexilhão, caranguejo, tira de peixe, isca viva, mosca | cavar a terra úmida; o cereal da casa (a massa); o açougueiro; a maré baixa; pescar o miúdo; a mosca feita à mão (técnica) | **cada espécie prefere a sua**; a isca se gasta pelo livro |
| **Linha de mão** | uma | o cordoeiro | sem vara: a mordida sentida no dedo; a luta com o corpo |
| **Linha de fundo e espinhel** | de 3 a 30 anzóis | o cordoeiro e a forja | várias linhas esperando; volta-se depois para ver |
| **Covo** | de vime | o cesteiro, ou fazer (técnica) | pôr num lugar, voltar no outro dia |
| **Tarrafa** | uma | o tecelão e o cordoeiro | o arremesso em roda sobre o cardume (técnica) |
| **Rede de espera e de arrasto** | pequena → grande | o tecelão e o cordoeiro | a de arrasto pede barco e duas pessoas ou mais |
| **Arpão e fisga** | de madeira → de bronze → de ferro (a fisga, três pontas) | o lenhador e a forja | ver o peixe e mirar à frente dele (a água engana o olho) |
| **Puçá** | um | o cesteiro | tirar da água o peixe grande sem perder |
| **Cesto (samburá)** | pequeno → grande | o cesteiro | quanto se leva (o peso conta na mochila) |
| **Barco** | canoa → barco a remo → barco a vela de pesca | a canoa se faz de um tronco (machado e técnica); os outros, o carpinteiro naval | aonde se chega (pede os barcos pequenos do [`navios.md`](navios.md)) |

**Tudo se gasta:** a linha desfia, a rede rasga, o anzol perde a ponta, a vara racha. Consertar é parte do dia (uma técnica), e
o material do conserto vem do livro.

**Sem carretilha:** na Antiguidade a linha ficava presa na ponta da vara e a luta era com o corpo. A **carretilha** é uma
invenção que se descobre tarde (§7).

## 6. O gesto, com os números

1. **Ler a água:** as aves que mergulham (o cardume), o peixe que pula, o redemoinho (a pedra embaixo), a cor da água, o vento
   (sopra a linha para o lado), a hora e a estação; com a prática, **as sombras** (§8).
2. **O lance:** segurar para dar força (uma barra que enche) e soltar; a linha voa com o vento; cair rente ao junco sem
   enganchar é o lance perfeito (o junco engancha 1 lance em 5 sem a técnica).
3. **A espera:** de 10 segundos a alguns minutos do mundo, conforme o pesqueiro, a hora e a isca; os miúdos beliscam (as
   mordidas falsas); mexer a isca atrai (técnica).
4. **A fisgada:** a boia afunda e há **uma janela** — de 0,35 s no aprendiz a 0,8 s no grande perito; cedo demais perde a isca,
   tarde demais o peixe cospe. Cada mordida pede o seu tempo (o desconfiado: espere a segunda puxada).
5. **A luta:** a tensão vai de 0 a 100 — a vara enverga, a linha zumbe, e uma marca discreta mostra a força. **O peixe puxa em
   arrancadas** (o corredor, longas; o de fundo, curtas e fortes); ceder (soltar o braço) baixa a tensão, puxar cansa o peixe e
   sobe a tensão; passar do limite da linha **parte**; o anzol fraco abre com o peixe grande. O esperto corre para o junco: virar a
   vara para o outro lado ou andar pela margem o tira de lá. O saltador: abaixar a vara no salto. A luta de um peixe comum dura de
   10 a 30 segundos; a de um grande, alguns minutos; a de um lendário, uma madrugada.
6. **Trazer:** o puçá para o grande (sem ele, o grande se solta na beira 1 vez em 3); o momento da recompensa (o kit da fundação);
   o peixe nas mãos, o peso medido.

**Os outros jeitos:** o arpão (andar devagar na água rasa — o barulho espanta —, mirar à frente da sombra); a tarrafa (o arremesso
em roda, no tempo do cardume); os covos (escolher onde pôr; voltar no outro dia); a rede de arrasto (a equipe e o barco); o
mergulho (o fôlego, a profundidade, a pérola, a moreia, o tubarão).

## 7. As técnicas (18)

| Técnica | O que faz | Como se aprende | Pede |
|---|---|---|---|
| O nó firme | a linha não parte no nó (+10 de limite) | um mestre, ou descoberta (perder 10 peixes no nó) | — |
| A isca viva | pescar o miúdo e usá-lo nos grandes | um mestre | o nó firme |
| Mexer a isca | atrai os desconfiados | descoberta (esperar parado 50 vezes) | — |
| A mosca | fazer moscas de pena e linha: a truta e o salmão | um mestre do norte, ou um livro | a linha de crina |
| Ler as aves | as aves mostram o cardume no mapa da água | descoberta (ver as aves mergulharem 10 vezes) | — |
| Ler a maré | a hora boa da costa | um pescador da costa | — |
| A linha de fundo | várias linhas esperando | um mestre | o nó firme |
| O espinhel | trinta anzóis numa linha só | um mestre | a linha de fundo |
| O covo | fazer e pôr covos | o cesteiro, ou um pescador | — |
| A tarrafa | o arremesso em roda | um pescador da costa | — |
| Pescar de noite com tocha | o peixe e a lula sobem para a luz | **descoberta** (a primeira noite de pesca com tocha) | — |
| A fisga | arpão de três pontas, o peixe não escapa | um mestre | o arpão |
| A rede de arrasto | pescar com gente e barco | a confraria do porto (com o título de pescador) | o barco |
| Consertar a rede e a linha | o desgaste não acaba com a coisa | um mestre | — |
| A salga e a defumação | guardar o peixe meses | o salgador | o sal, a lenha |
| O garum | o molho de peixe fermentado (vale muito no sul) | um livro dos gregos e romanos, ou um mestre do sul | a salga |
| A pesca no gelo | abrir o buraco no lago gelado | um mestre do norte | o inverno do norte |
| A carretilha | a linha enrolada numa roda: o lance longo e a luta fácil | **o livro e a descoberta**, tarde | a roda do povo, prática 70 |

## 8. A prática (o que cada faixa abre)

| Faixa | O que abre |
|---|---|
| Aprendiz (0–20) | o básico: a janela da fisgada curta, o lance curto |
| Iniciado (20–40) | ver os cardumes na superfície; a janela maior; o lance mais longe |
| Oficial (40–60) | **as sombras** dos peixes na água; o nome da mordida aparece («desconfiado») |
| Perito (60–85) | sentir o tamanho antes de trazer («é grande»); a linha aguenta mais (+10) |
| Grande perito (85–100) | ler a água de longe (o pesqueiro bom brilha na leitura); a janela máxima |

A prática sobe por peixe trazido, mais pelos difíceis e raros, menos pelos que se repetem; falhar também ensina um pouco.

## 9. Os títulos (como se consegue)

| Título | O que pede | O que dá |
|---|---|---|
| **Aprendiz de pescador** | o primeiro peixe | a coleção aberta |
| **Pescador** | prática 40; 12 espécies na coleção; vender 100 peixes; o aceite dos pescadores do porto (pelo laço e pela fama) | a confraria do porto (a rede de arrasto), as encomendas da taverna, preço melhor (+10%) |
| **Mestre pescador** | prática 70; 24 espécies; **a peça de mestre** (um peixe raro acima do peso da cidade, ou um lendário à vista); ter ensinado um aprendiz até pescador; o voto dos mestres do porto | as encomendas do templo e dos ricos, os aprendizes, o lugar na festa, voz na assembleia, preço melhor (+25%) |
| **Lenda** | pegar um lendário | a memória do povo; o nome na tábua dos recordes para sempre |

## 10. A coleção, os recordes e os prêmios

- **O caderno das espécies:** 36 e os 4 lendários, as que faltam em silhueta; o peso maior de cada uma.
- **Os recordes da cidade:** são de pessoas reais do mundo; bater um vira notícia e fala; a **tábua dos recordes** na taverna do porto.
- **Os prêmios:** completar uma água (as seis do norte, as dez da costa…) dá uma técnica escondida ou uma coisa feita pelo
  ourives (o anzol de ouro, que não pesca, mas se mostra) e fama.

## 11. A economia

- **O preço** de cada espécie sai do valor dela e da cidade: a fome sobe, muitos pescadores baixam, o peixe fresco vale mais que o
  de ontem (o peixe estraga em dois dias sem a salga).
- **As encomendas:** a taverna (sardinhas para a festa), o templo (o peixe do sacrifício), o rico (a lagosta, a dourada), o
  curandeiro (o peixe-elétrico), o ourives (a pérola), o mercador (o salgado para outra cidade) — com prazo e pagamento.
- **O concurso da festa:** os pescadores do mundo e o corpo, uma manhã, o maior peixe e o maior cesto; o prêmio em moedas e fama.

## 12. Os acontecimentos (a variedade de cada hora)

O cardume que chega; a garça que rouba o peixe do cesto; a tempestade (voltar ou arriscar); o crocodilo na beira; o hipopótamo
que vira a canoa; a lontra que rouba a isca; a chuva de verão (o peixe morde mais); a lua cheia (o peixe da noite); **o anel no
bucho** (uma coisa que alguém perdeu na água de verdade); o náufrago agarrado a uma tábua; o rival no seu pesqueiro; a criança
que quer aprender; a rede presa num tronco; o eclipse, raríssimo.

## 13. Por povo

O norte (o bacalhau, o arenque, o salmão, a salga, a pesca no gelo); o Egito (o Nilo, a tilápia, a perca do Nilo, o
peixe-elétrico, o barco de papiro, o crocodilo e o hipopótamo); os gregos e os romanos (o atum das armações, a dourada, o polvo,
o garum); os astecas (os lagos, as redes, o peixe-branco, o axolote que não se pesca).

## 14. O ciclo

O lance (minutos) → a manhã de pesca (preparar, ir, pescar, voltar) → o dia (vender, salgar, consertar, cozinhar em casa) → as
estações (o salmão no outono, o atum na primavera, o gelo no inverno) → o longo prazo (as ferramentas, o barco, os títulos, a
coleção, os aprendizes, os lendários).

## 15. Os derivados e as fases

**Os derivados:** o pescador da costa, o mergulhador, o pescador de alto-mar (Patch 29), o salgador e o defumador; e os que servem
a pesca: o cordoeiro, o cesteiro, o carpinteiro naval.

| Fase | O quê |
|---|---|
| P1 — O rio e o lago | a vara, a linha de mão, o arpão, o covo; as 12 espécies de água doce; o Velho do Lago; a tábua dos recordes |
| P2 — A costa | a tarrafa, a costa e os do fundo; a canoa e o barco a remo (a N1 do [`navios.md`](navios.md)) |
| P3 — O mergulho | o recife, a pérola, a moreia, o tubarão |
| P4 — A conserva e o mercado | a salga, a defumação, o garum, as encomendas, o concurso |
| Patch 29 | o alto-mar, com o navio |

## 16. As provas

Todo peixe sai do pesqueiro contado; a isca se gasta pelo livro; o anel no bucho é uma coisa perdida de verdade; o cartão só
mostra o que existe; o mundo sem o corpo é o mesmo (os pescadores do mundo pescam pelos mesmos gestos); os casos ruins (o save
no meio da luta, o corpo que se afoga, a tempestade, o deus que mata o peixe na linha, o pesqueiro esgotado); a variedade medida
por hora; e **o teste do dono: uma hora só pescando, sem enjoar.**
