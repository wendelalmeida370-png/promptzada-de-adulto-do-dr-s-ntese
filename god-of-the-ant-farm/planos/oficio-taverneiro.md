# O taverneiro — o documento completo (a casa onde a cidade se encontra)

**A máxima:** ter uma taverna tem de ser tão bom que poderia ser um jogo sozinho — a cerveja que você mesmo fez na cuba, a sala
cheia numa noite de festa, o freguês que pede «o de sempre» sem dizer o quê, o marinheiro que paga uma rodada para todos, os dois
que cochicham no canto e se calam quando você passa, a briga que você acalma com uma frase (ou não), a tábua do fiado que cresce, o
viajante que pede um quarto e traz a notícia de uma guerra — e a madrugada, a casa vazia, as moedas contadas à luz do fogo que se
apaga. **A taverna é onde a cidade se encontra**, e o taverneiro ouve tudo. Usa a taverna que o jogo já tem (`G.Taverna`), a
fundação dos ofícios ([`oficios-fundacao.md`](oficios-fundacao.md)), a economia ([`economia-oficios.md`](economia-oficios.md)) e o
grupo ([`grupos.md`](grupos.md)). Os números são propostas para começar.

## As bases e as perícias

**As bases** (as leis do mundo que valem para todos, de qualquer ofício — [`pericias.md`](pericias.md)): a lei e a gente (a fama, os
boatos, os laços, o crime, a lei de cada povo sobre a bebida); a origem das coisas (a cerveja só do grão, o prato só do que a cidade
tem); o tempo (a festa, a estação, a colheita boa ou ruim); o corpo (a bebida, a fome, a noite).

**As perícias que o ofício usa:** **Hospitalidade** (a principal) — e Fermentar, Cozinhar, Ler as pessoas, Negociar, Letras, Investigar,
Intimidar, Lutar (sem arma), Comandar (a criadagem), Jogo. A prática e as técnicas são das perícias: o que se aprende aqui vale em todo
ofício que usa a mesma perícia, e os títulos pedem o nível delas.

## 1. A fantasia

Você herdou do seu tio uma taverna pequena perto do cais: quatro mesas, um balcão, a cuba nos fundos. De manhã você compra o grão
no armazém — caro, a colheita foi ruim — e põe a cerveja para fermentar; a de anteontem está pronta. Ao meio-dia, a panela do caldo
de peixe. À tarde chegam os estivadores, cansados, e pedem «o de sempre». À noite, um navio estrangeiro atracou: a sala enche de
marinheiros com moedas novas, um deles paga uma rodada para todos e começa a cantar. No canto, dois homens que você nunca viu
cochicham sobre «o navio do senador» e se calam quando você passa com a jarra. O ferreiro, que já deve três noites na tábua do fiado,
pede mais uma. Um marinheiro empurra outro, a mesa cai, alguém puxa uma faca — você bate a jarra no balcão e diz o nome do pai do
mais novo. A faca volta para a cinta. De madrugada, a casa vazia, você conta as moedas, lava as canecas — e decide se conta ao guarda
o que ouviu sobre o navio do senador. Ou se vende.

## 2. A história e o nome

**A taverna é das casas mais antigas da cidade.** No Egito havia **as casas da cerveja**, e a cerveja era comida de todo dia — os
trabalhadores das grandes obras recebiam parte da paga em pão e cerveja. Os gregos bebiam o vinho sempre misturado com água (beber
puro era coisa de bárbaro); nas cidades dos romanos, o balcão de pedra com as jarras embutidas dava para a rua, e nas paredes das
tavernas de uma cidade que um vulcão enterrou ficaram os rabiscos dos fregueses — queixas de vinho aguado, contas, amores, ofensas
ao dono. **O taverneiro tinha má fama:** acusado de aguar o vinho, de acolher ladrões, de ouvir demais. Na estrada, a hospedaria dava
cama, comida e estábulo ao viajante; no norte, **o hóspede era sagrado**; entre os astecas, **o pulque tinha lei** — os velhos bebiam,
os moços que se embebedavam eram castigados. **No jogo, o ofício chama-se taverneiro; o dono de uma hospedaria, estalajadeiro.**

## 3. O que já existe no jogo (uma base pronta)

**A taverna do jogo já vive** (`G.Taverna`, `act-taverna.js`): o dia dela é uma operação do mundo — abre e fecha na hora, com o seu
livro (quem foi servido, o que se vendeu, o que entrou, o que custou, o que faltou); **o taverneiro é o dono** — num povo de moeda,
compra no armazém do povo, com o dinheiro da casa dele, o que vai servir, e o que os fregueses pagam vai para a casa dele (sem moeda,
a taverna é do povo); **o freguês vem por vontade dele** (a hora, o dinheiro da casa, um lugar livre, a taverna das suas ruas —
`G.Taverna.visitTask`), senta, pede, espera, paga, bebe, talvez outra rodada; «acabou» quando falta; **a cerveja e o pulque são
fornadas da cuba**, do grão que o taverneiro comprou; o vinho e o hidromel vêm do armazém; **o prato** sai da origem da comida (o
prato de peixe só onde se pesca); as bebidas de cada povo (`tavern.js`); a música e as brigas; os lugares de cada um (o freguês num
assento, nunca no fogão); a taberna e **a hospedaria** como degraus do prédio (`G.Escala`); a vida do bairro («noite», o bairro
boêmio). **O corpo do deus já pede, paga, bebe, serve, abre e fecha pelas mesmas portas.** O ofício acrescenta a profundidade.

## 4. O ciclo do dia

1. **De manhã:** comprar (o grão, o vinho, a comida) pelo preço do dia; **fermentar** (a cuba); a adega (o que está pronto, o que
   azedou).
2. **Ao meio-dia:** **cozinhar** o prato do dia; varrer; as mesas.
3. **À tarde:** abrir; os primeiros fregueses (os do trabalho).
4. **À noite:** a sala cheia — **servir, ler a sala, cuidar das mesas**: o fiado, a briga, o bêbado, a música, os cochichos, o
   viajante.
5. **De madrugada:** fechar, **contar** (a tábua do fiado, as moedas), lavar, decidir o que fazer com o que se ouviu.
6. **A semana e a estação:** a festa (a casa cheia — encher a adega antes), a colheita ruim (o grão caro), o navio no porto (os
   marinheiros), o inverno (o vinho quente), os dias de guarda.

## 5. O que se serve

| O quê | De onde vem | A arte |
|---|---|---|
| **A cerveja** | a cuba, do grão comprado (só de cereal) | **Fermentar**: o grão, a água, o tempo, o calor — a boa e a azeda |
| **O pulque** (astecas) | a cuba, da seiva do agave | Fermentar |
| **O hidromel** (norte) | o mel | Fermentar |
| **O vinho** | o armazém, o vinhateiro, o mercador | **misturar com água** (o costume grego) — ou aguar demais (a fraude) |
| **O vinho quente com mel e especiarias** (o inverno) | o vinho, o mel, o que o comércio traz | Cozinhar |
| **O prato do dia** | o que a cidade tem (o peixe só onde se pesca, a carne onde há criação) | **Cozinhar**: o caldo que rende, o assado, o pão |
| **A bebida estrangeira** | a receita aprendida de um viajante de outro povo | Fermentar — uma descoberta |

**A cozinha por inteiro** (os ingredientes, as receitas, a qualidade, a mesa) está em [`cozinha.md`](cozinha.md) — o taverneiro
é o primeiro cozinheiro do jogo. **A qualidade conta:** a cerveja boa enche a casa e traz o freguês fiel; a azeda espanta; **a que adoece** (o lote ruim) vira boato e
pode fechar a casa.

## 6. A adega e o dinheiro

- **Comprar na hora certa:** o grão depois da colheita boa é barato; antes da festa, tudo encarece.
- **Guardar:** os barris e as ânforas na adega (pelo livro); **o que estraga** — a cerveja azeda em dias, a comida em menos; o vinho
  bom melhora com os anos (e um barril guardado por décadas vira lenda).
- **O preço da rodada** (`G.Taverna.PRICE`) e **a medida** (`G.Taverna.DOSE`): a medida justa, a generosa (o freguês fiel, o estoque que
  acaba) e a curta (o lucro, a fama de ladrão).
- **A tábua do fiado:** quem deve, quanto, desde quando (escrita a giz — Letras); dar fiado traz freguês e risco; **cobrar** é
  conversa (Negociar), ou ameaça (Intimidar), ou perdão (o laço).
- **A paga da criadagem**, o aluguel ou a casa própria, **o imposto**, a licença (onde o povo pede), **a proteção** (a gangue que quer
  a sua parte — o conflito do Patch 24: pagar, recusar, chamar o guarda).

## 7. A sala (o coração do ofício)

**Servir** é a parte das mãos; **ler a sala** é a arte:

| O que acontece | O que o taverneiro faz |
|---|---|
| **O freguês fiel** | lembra o «de sempre», o nome, a família; o laço cresce |
| **O estranho** | olha, pergunta de onde vem — e escuta a notícia |
| **O bêbado** | sabe a hora de parar de servir; manda para casa; chama alguém da família; põe para fora |
| **A briga** | **acalma** (a voz, o nome do pai, a rodada da paz), **separa**, **põe para fora**, ou deixa — e paga a mesa quebrada |
| **O ladrão** | vê a mão no bolso alheio; avisa, pega, ou finge que não viu |
| **Os cochichos** | **ouve sem parecer que ouve** (Investigar) — a conspiração, o roubo planejado, o navio rico |
| **Os amantes** | o canto escuro; o segredo que o taverneiro guarda (ou vende) |
| **A música** | o bardo que se contrata, o marinheiro que canta, **a música certa para a hora** |
| **O jogo** | os dados da casa (a casa leva uma parte), a trapaça, a briga que o jogo traz |
| **O guarda** | a bebida por conta da casa (o suborno pequeno), a batida da lei (o jogo, os conspiradores) |
| **A rodada de alguém** | o marinheiro rico, o noivo, o vencedor — a sala inteira bebe, e lembra de quem pagou |

## 8. A hospedaria (o degrau maior)

Os quartos e as camas (a planta da hospedaria), o estábulo, a comida do viajante, **o livro dos hóspedes** (quem chegou, de onde, para
onde); o cofre dos valores. **Quem chega:** o mercador, o peregrino, o mensageiro, o soldado, o caçador de tesouros — **e o fugitivo, o
espião, o assassino**. **Os perigos:** o hóspede que some sem pagar, o hóspede roubado (e o estalajadeiro suspeito), **a morte no
quarto três** (uma história que o motor de histórias conta, e a lei investiga). **O que vale:** a notícia que chega de longe antes de
todos.

## 9. A lei e os costumes (por povo)

| Povo | A taverna | A lei |
|---|---|---|
| **Egito** | **a casa da cerveja**; a cerveja como comida e como paga | a cerveja dos trabalhadores das obras |
| **Gregos** | a casa do vinho misturado com água (o banquete é em casa, a taverna é do povo) | aguar é o costume; o vinho puro é escândalo |
| **Romanos** | o balcão de pedra que dá para a rua, as jarras embutidas, os rabiscos nas paredes; a hospedaria na estrada | as regras sobre o que se pode vender e até que hora |
| **Norte** | a casa da cerveja e do hidromel; **o hóspede é sagrado** | quem fere um hóspede sob o seu teto é desonrado |
| **Astecas** | a casa do pulque | **o pulque tem lei**: os velhos bebem; o moço bêbado é castigado — e quem serviu, também |

## 10. Os perigos

| Perigo | Como vem |
|---|---|
| **A briga** | a bebida, o jogo, a rixa antiga, a turma rival — a mesa quebrada, a faca, o morto |
| **O fogo** | o fogão e as tochas: **a taverna é a casa que mais pega fogo** (o fogo do mundo) |
| **O lote ruim** | a cerveja que adoece: o boato que fecha a casa |
| **O fiado** | quem não paga; quem morre devendo |
| **O roubo** | a caixa de noite; o hóspede ladrão |
| **A proteção** | a gangue que quer a sua parte |
| **A lei** | a batida do guarda; a licença; a lei da bebida de cada povo |
| **O rival** | a outra taverna, o preço baixo, o boato que ele espalha |
| **Saber demais** | o que se ouviu pode valer ouro — ou uma faca de noite |

## 11. As técnicas (24, das perícias que o ofício usa)

Cada técnica é de uma perícia (o catálogo em [`pericias.md`](pericias.md)): aprendida aqui, vale em todo ofício que usa a mesma perícia.

| Técnica | Perícia | O que faz | De quem se aprende |
|---|---|---|---|
| A medida certa | Hospitalidade | a medida que contenta sem quebrar a adega | o velho taverneiro |
| Lembrar o freguês | Hospitalidade | o «de sempre», o nome, a família — o freguês fiel | descoberta |
| A voz que acalma | Hospitalidade | a briga que acaba com uma frase | um taverneiro velho |
| A rodada da paz | Hospitalidade | a bebida por conta da casa que desfaz a briga | descoberta |
| A música certa | Hospitalidade | a canção que enche a casa na hora certa | um bardo |
| O quarto limpo | Hospitalidade | o hóspede que volta e recomenda | um estalajadeiro |
| O valor do hóspede | Hospitalidade | o cofre, a palavra — o hóspede seguro | um estalajadeiro |
| Ler a sala | Ler as pessoas | quem vai brigar, quem vai roubar, quem está triste | descoberta (mil noites) |
| A hora de parar | Ler as pessoas | o bêbado antes de virar problema | um taverneiro velho |
| Ouvir sem parecer | Investigar | os cochichos da mesa do canto | descoberta |
| A cerveja boa | Fermentar | o grão, a água, o tempo, o calor certos | um mestre cervejeiro |
| O pulque | Fermentar | a seiva do agave | um mestre do pulque |
| O hidromel | Fermentar | o mel que vira bebida | um velho do norte |
| A bebida estrangeira | Fermentar | a receita de outro povo | um viajante |
| O caldo que rende | Cozinhar | o prato barato que enche | uma cozinheira velha |
| O prato do dia | Cozinhar | o que a cidade tem, bem feito | um cozinheiro |
| O vinho quente | Cozinhar | o vinho, o mel e as especiarias do inverno | descoberta |
| Comprar na hora certa | Negociar | o grão barato depois da colheita | um mercador |
| Cobrar o fiado | Negociar | a conta paga sem perder o freguês | um taverneiro velho |
| A tábua do fiado | Letras | a conta que não se perde | um escriba |
| Pôr para fora | Lutar (um jeito por arma) | o bêbado na rua sem ninguém se ferir | o leão de chácara |
| O olhar que basta | Intimidar | a mão que larga a faca | descoberta |
| Os dados da casa | Jogo | o jogo que dá lucro e não dá briga | um jogador velho |
| Aguar o vinho | Contrabando | o lucro — e a fama de ladrão, se descobrem | ninguém ensina em voz alta |

## 12. A prática da perícia principal — Hospitalidade (o que cada faixa abre)

| Faixa | O que abre |
|---|---|
| Servente (0–20) | servir, a jarra, a caneca |
| Taverneiro (20–40) | a medida certa; lembrar o freguês |
| Bom de casa (40–60) | **ler a sala**: quem vai pedir, quem vai brigar, quem quer conversa |
| Casa cheia (60–85) | a voz que acalma; a sala inteira na mão |
| Mestre da casa (85–100) | a taverna que é o coração do bairro |

## 13. Os títulos

| Título | O que pede | O que dá |
|---|---|---|
| **Servente** | trabalhar numa taverna | a paga do dia, o que se ouve |
| **Taverneiro** | hospitalidade 25; **ter a sua taverna** (alugada, herdada, comprada, construída) | a casa, a cuba, o livro |
| **Estalajadeiro** | hospitalidade 45; **a hospedaria** (o degrau maior do prédio) | os quartos, os viajantes, as notícias de longe |
| **A casa com nome** | hospitalidade 65; a taverna conhecida em outras cidades | os fregueses de longe; o bardo que canta a casa |
| **Mestre das casas** | hospitalidade 80; duas tavernas ou mais | a renda de várias casas; aprendizes |

## 14. A coleção, os recordes e as lendas

- **A coleção:** as receitas aprendidas (as bebidas de cada povo), os fregueses fiéis, **as histórias da casa** (a briga famosa, o
  casamento, a noite em que o rei bebeu ali sem que ninguém soubesse).
- **Os recordes:** a noite mais cheia, a maior rodada paga, o maior fiado.
- **As lendas** (nascem do mundo):

| Lenda | O que é |
|---|---|
| **A taverna mais velha do mundo** | a casa que serve desde a fundação da cidade, de mão em mão (o tempo a faz; ninguém a cria) |
| **A cerveja dos antigos** | uma receita de um povo antigo, achada por um arqueólogo num túmulo ([`passado.md`](passado.md)) |
| **O barril do século** | o vinho guardado por cinquenta anos numa adega do mundo |
| **A mesa do rei** | a mesa em que alguém que governou bebeu quando ainda era ninguém (a história de verdade da pessoa) |

## 15. A economia

O jeito principal é **a venda** (a rodada, o prato, o quarto); os outros, **a encomenda** (o casamento, a festa, o funeral), **a renda**
(a casa própria, as outras tavernas) e **a informação** (vender o que se ouviu — ao guarda, ao mercador, ao pirata). A paga da
criadagem, a adega, o aluguel, o imposto, a proteção ([`economia-oficios.md`](economia-oficios.md)). **A taverna é o termômetro da
cidade:** a colheita ruim, a guerra, o navio que chegou — tudo aparece no preço e na sala.

## 16. O mundo

A taverna é **o coração do bairro** (o bairro boêmio da vida do bairro): o lugar das notícias (os boatos nascem e correm nela), dos
amores, das brigas, dos negócios (o mercador fecha o trato na mesa), **do recrutamento** (o capitão pirata, o mateiro contratado, o
soldado alistado), das conspirações (a sala dos fundos), da gangue, do bardo. **O taverneiro conhece todo mundo** — e todo mundo o
conhece. A taverna que pega fogo, a que a guerra fecha, a que a lei fecha; a que passa de pai para filho.

## 17. A camada do ambiente

| A fotografia | O som | O tremor | A tela | A mochila |
|---|---|---|---|---|
| a luz quente do fogo e das lamparinas, a fumaça, o quadro apertado da sala cheia, a madrugada vazia | **as vozes em camadas**, as risadas, as canecas, a música, o fogo — e **o silêncio quando o guarda entra** | a briga, a mesa que cai | **a sala lida nos rostos** (quem espera, quem bebeu demais, quem cochicha); a tábua do fiado; a caixa | a vista do taverneiro: as chaves, a tábua, a bolsa, a lista da adega |

## 18. As falas, as animações, as interações, o grupo, as marcas e a leitura

Cada ofício chega com a sua parte da **máquina de falas**, da **fábrica de animações**, das **interações** e do **grupo**
([`oficios-fundacao.md`](oficios-fundacao.md) §2.14). Sugestões para começar:

**Os assuntos novos:** a taverna cheia ou vazia, a cerveja boa ou azeda, a briga da noite, quem pagou a rodada, o fiado de alguém, o
navio que trouxe marinheiros, o viajante que contou a notícia, a taverna que fechou.

**As falas:**
- (o freguês fiel) «O de sempre.» — (o taverneiro) «Já tá na mesa.»
- (o marinheiro rico) «Mais uma rodada pra casa toda, que hoje eu pago!»
- (o freguês) «Taverneiro, essa cerveja tá azeda!»
- (ao bêbado) «Já bebeu demais, amigo. Vai pra casa, que a tua mulher tá esperando.»
- (ao do fiado) «Tua conta já tá maior que a minha parede.»
- (o viajante) «Tem quarto? E comida quente?»
- (o guarda) «Essa é por conta da casa, né?»
- (o começo da briga) «Repete o que você disse!» — (o taverneiro) «Aqui não. Lá fora, ou nunca mais.»
- (a mesa do canto, quando ele chega) «…e o navio sai na — ah, mais uma jarra, por favor.»
- (o boato que nasce) «Ouvi na taverna do cais que a guerra começou no sul.»

**As animações:** servir da jarra e da ânfora na medida, levar três canecas de uma vez, limpar o balcão, mexer a panela, pôr o prato,
contar as moedas no avental, riscar a tábua do fiado a giz, apoiar no balcão escutando, o gesto de silêncio para a sala, pôr um bêbado
para fora pelo braço, separar dois que brigam, rolar o barril para a adega, provar a cerveja, fechar as janelas, dormir sentado atrás do
balcão.

**As interações:** servir (E num freguês); anotar o pedido; dar fiado ou negar; parar de servir; pôr para fora; acalmar a briga; ouvir
uma mesa (E segurado); vender o que se ouviu; comprar a adega no armazém; fermentar na cuba; cozinhar; contratar o músico; alugar um
quarto; pagar ou recusar a proteção; abrir e fechar.

**O grupo** ([`grupos.md`](grupos.md)): a casa — **os papéis**: o servente, a cozinheira, o leão de chácara, o músico; **as ordens**:
«mesa três», «mais cerveja», «põe ele pra fora», «fecha a porta»; **as situações**: a noite cheia, a briga, a batida do guarda, a festa.

**As marcas** ([`marcas.md`](marcas.md)): **a parede dos rabiscos** (os nomes, as contas, os amores dos fregueses, que duram enquanto a taverna dura), a mesa do rei, o nome da casa.

**A leitura** ([`leitura.md`](leitura.md)): **por que o freguês não voltou** (o prato frio, o vinho aguado, a briga da semana, o fiado cobrado na frente dos outros), **por que a sala está vazia** (a festa na taverna do outro bairro, o preço, a chuva). Lê-se no rosto de quem come, no prato que volta, no que se diz na rua — nunca numa nota.

## 19. Os derivados

O **estalajadeiro** (a hospedaria), o **cervejeiro** (a cuba, para outras tavernas), a **cozinheira**, o **servente**, o **leão de
chácara**, o **músico da casa**, o **dono dos dados**, o **informante** (o taverneiro que vende o que ouve).

## 20. As fases e as provas

| Fase | O quê |
|---|---|
| Tv1 — A casa e a adega | comprar, fermentar, cozinhar, guardar; o que estraga; a medida e o preço |
| Tv2 — A sala | servir, lembrar o freguês, ler a sala, o bêbado, a briga, a música, o jogo, a rodada |
| Tv3 — O dinheiro | o fiado, a criadagem, o aluguel, o imposto, a proteção, a fraude |
| Tv4 — A hospedaria | os quartos, os viajantes, o livro dos hóspedes, os perigos |
| Tv5 — O coração do bairro | ouvir e vender o que se ouve, o recrutamento, as conspirações, a fama da casa, as lendas |

**As provas:** tudo pelo livro da taverna que já existe (o que entrou, o que saiu, o que estragou); a cerveja só de cereal, o prato só
do que a cidade tem; o freguês vem por vontade própria (ninguém nasce para encher mesa); o fiado é uma dívida de verdade na tábua; a
informação vendida é um fato que alguém ouviu; o mundo sem o corpo é o mesmo (as tavernas do mundo vivem pelas mesmas regras); os casos
ruins (o save no meio da noite cheia, o fogo na cozinha, a briga com morte, o taverneiro que morre devendo, a batida do guarda); e **o
teste do dono: noites inteiras atrás do balcão, sem enjoar.**

## 21. Quando entra

**No Patch 27, como o segundo ofício**, junto com o acabamento e o molde afinado: a pesca prova o molde num ofício da natureza; **o
taverneiro o prova num ofício todo de gente** — e a taverna do jogo já está pronta como base. Dois ofícios opostos afinam o molde
antes de ele ser repetido nos outros troncos ([`roteiro.md`](roteiro.md)).
