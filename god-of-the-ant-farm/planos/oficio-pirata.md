# O pirata — o documento completo (o lobo do mar)

**A máxima:** ser pirata tem de ser tão bom que poderia ser um jogo sozinho — a vela no horizonte, a perseguição com o vento a favor
e os remos batendo no ritmo da flauta, os ganchos voando, a abordagem, o mercador que se rende só de ouvir o seu nome, o saque contado
na enseada escondida à luz das fogueiras, a parte de cada um, o inverno no refúgio, a taverna do porto que não pergunta — e a frota de
guerra que um dia vem limpar o mar. **Como ele é:** o pirata rouba, mata, sequestra e vende gente. O jogo o mostra assim, sem enfeitar
— e **o mundo responde a tudo o que ele faz**. Usa a vida a bordo e a batalha no mar ([`navios.md`](navios.md)), o vento e o mar
(§2b dos navios), o navegador ([`oficio-navegador.md`](oficio-navegador.md)), o combate do corpo, a sombra, o remador de galé
([`condicao-escravo-gale.md`](condicao-escravo-gale.md)), o calendário ([`calendario.md`](calendario.md)) e a fundação dos ofícios
([`oficios-fundacao.md`](oficios-fundacao.md)). Os números são propostas para começar.

## 1. A fantasia

Do alto do penhasco da ilha, o vigia acena com o espelho: uma vela redonda, pesada, saindo do estreito ao meio-dia — o mercador do
vinho que o estivador do porto jurou, por três moedas, que levaria também a filha do senador. A sua galé leve sai da enseada com o
vento de través e trinta remos. O mercador vê, tenta correr; está carregado demais e joga ânforas ao mar para ficar leve. Na segunda
hora vocês passam rente ao costado dele e quebram metade dos remos; na terceira, os ganchos voam. Metade da tripulação dele larga as
armas quando ouve quem você é; a outra metade luta e morre no convés. O vinho vai para o porão; a moça, para o resgate. À noite, na
enseada, a tripulação conta as ânforas, discute a parte de cada um, e o velho do leme jura que o golfinho que nadou ao lado da proa foi
um sinal do deus do mar. Você sabe que o senador vai pagar — e sabe que, na primavera, vai mandar navios atrás de você.

## 2. A história e o nome

- **A pirataria é tão antiga quanto o mar.** Os **povos do mar** devastaram as costas do Egito e deixaram a guerra gravada nos templos;
  nos tempos dos heróis gregos, perguntar a um estrangeiro que chegava de barco se ele era pirata era uma pergunta educada; uma rainha
  de uma costa de enseadas fez da pirataria a política do seu reino e desafiou Roma.
- **Os piratas de uma costa montanhosa chegaram a dominar o mar inteiro:** dizia-se que tinham mastros dourados, velas de púrpura e
  remos revestidos de prata — o saque exibido. Sequestraram **um jovem nobre romano** que, enquanto esperava o resgate, mandava que
  ficassem calados quando ele dormia, lia-lhes os seus versos, chamava-os de ignorantes e **prometeu crucificá-los** — e, livre,
  voltou com navios e cumpriu.
- **Roma precisou de uma campanha inteira** para limpar o mar — e, com os vencidos, fez uma coisa sábia: **deu-lhes terras longe da
  costa para viverem como lavradores.**
- **O negócio era o saque, o resgate e a venda de gente:** os cativos viravam escravos — e muitos, remadores de galé.
- **O pirata** rouba por conta própria; **o corsário** rouba com licença de um rei, contra os inimigos dele; **o naufragador** acende
  luzes falsas na costa para os navios baterem nas pedras.

## 3. O que já existe no jogo

Os navios, os portos e **as rotas de comércio pelo mar** (os alvos), as frotas e **as razias** (`fleets.js`), as expedições, os cativos
de guerra e o trabalho forçado, a fuga e a revolta (`war.js`), o crime e a justiça, **os boatos e a fama**, os laços e as memórias, as
ilhas e **as grutas do mar** (`sea.js` já tem a «Gruta do Contrabandista»), **o casco à deriva** (o navio sem tripulação que o vento
leva), o refúgio nas cavernas quando o inimigo chega, o mercado, as tavernas, as moedas das casas (`h.coin`). **O que falta:** o navio
por dentro e o convés que balança (N2), o itinerário do porto (N3), a viagem e a batalha no mar com o corpo (N4, N5), o vento que
empurra pela direção, o navegador, a sombra (o receptador).

## 4. Os navios do pirata

O pirata quer **velocidade, pouco calado e muitos braços** — não um porão grande. As galés seguem a medida da gente do mundo (a
[`condicao-escravo-gale.md`](condicao-escravo-gale.md)): a de trinta remos é a comum; as grandes, raras.

| Navio | Remos e gente | O que tem de bom | O que tem de ruim |
|---|---|---|---|
| **A canoa de guerra** | 10 a 20 remadores | rápida no raso, escondida em qualquer mangue | só costa; nenhum porão |
| **O barco ligeiro** (o lembo) | 16 a 30 remos, uma vela | rápido, raso, barato — **o barco dos piratas pequenos** | o mar grosso o vira |
| **A galé de meia fileira** (a hemiólia) | 30 a 50 remos | **a fileira de trás se desmonta na hora da abordagem**: os remadores viram combatentes e o mastro desce para dar lugar | cara; pede muita gente |
| **O navio de proa alta do norte** | 24 a 60 remos, vela quadrada | alto-mar, praia em qualquer lugar, os remadores são os guerreiros | pouco porão |
| **O mercador tomado** | poucos remos, vela grande | **o porão** e o disfarce (parece um mercador) | lento; a presa foge dele |
| **A galé de guerra tomada** | 60 ou mais remos, esporão | o esporão, o medo | precisa de muita gente; toda frota a reconhece |

**O navio se faz e se melhora** no refúgio, pelo carpinteiro naval (a madeira pelo livro): o casco mais fino (mais rápido, mais frágil),
mais remos, o esporão de bronze, a vela de linho ou de couro, a cor da vela (escura para a noite), **o luxo** — a proa dourada, a vela de
púrpura, que não fazem o navio andar mais, mas fazem o nome correr mais depressa.

## 5. A tripulação (os papéis)

| Papel | O que faz | O que pesa |
|---|---|---|
| **O capitão** | decide a caça, comanda a abordagem, fala pela tripulação | a fama, o saque que traz, a força |
| **O imediato** | o braço do capitão; comanda quando ele cai | a confiança da tripulação |
| **O piloto** | o caminho, as enseadas, as rotas da presa | sem ele, o navio se perde ([`oficio-navegador.md`](oficio-navegador.md)) |
| **O mestre de abordagem** | lidera o salto ao convés da presa | a coragem, a espada |
| **O contramestre** | os remos, as velas, a disciplina do dia a dia | a voz, o ritmo |
| **Os remadores-guerreiros** | remam na caça, lutam na abordagem | o fôlego, a força |
| **Os arqueiros e os fundeiros** | a primeira chuva de flechas e pedras | a pontaria no mar que balança |
| **O carpinteiro** | o casco furado, o remo quebrado, o mastro | sem ele, o navio morre devagar |
| **O curandeiro** | a ferida, a febre, a amputação | quantos voltam |
| **O cozinheiro** | a comida e a água que duram | o ânimo |
| **O intérprete** | fala a língua dos cativos e das famílias | o resgate de outro povo |
| **O vigia** | o mastro, o penhasco | quem vê primeiro |
| **O grumete** | tudo o que ninguém quer fazer | aprende |

Cada um é uma pessoa do mundo, com a índole, os laços, a coragem e a ganância dela.

## 6. O acordo da tripulação

Antes de sair, a tripulação jura o acordo diante do altar do deus do mar:

| O que se combina | Como costuma ser |
|---|---|
| **A parte** | cada um uma parte; o capitão duas; o imediato, o piloto e o mestre de abordagem, uma e meia; o grumete, meia |
| **A parte do ferido** | quem perde a mão, o olho ou a perna recebe partes a mais (a vida marca o corpo, e o acordo paga) |
| **A parte do morto** | vai para a família, se o capitão for honesto |
| **As decisões grandes** | atacar uma cidade, trocar de capitão, mudar de mar — o conselho da tripulação |
| **Os castigos** | o roubo da parte de outro, a covardia na abordagem, a traição: perder a parte, o açoite, **o abandono numa ilha** com um odre de água, a morte |

**Cada tripulação tem o seu jeito**, pela índole do capitão e da gente: há as que votam, as que obedecem a um tirano, as que dividem
igual. **A parte injusta e o castigo injusto plantam o motim.** O abandonado na ilha vira uma condição do mundo: o náufrago que espera
um navio — e que um dia pode voltar.

## 7. A vida a bordo e no refúgio

- **No mar:** os turnos de remo e de vigia, a pesca para comer, a água racionada, os dados, as canções, a briga, **os dias de espera**
  pela presa (o tédio também é parte do ofício: é quando a tripulação conversa, briga, planeja), a tempestade, o enjoo do novato.
- **Na abordagem:** a corrida, o medo, o sangue, a contagem dos mortos.
- **No refúgio:** a enseada escondida, a gruta do mar, a ilha com água doce; **virar o casco na praia** para raspar e consertar; a
  comida, a água, a madeira — tudo de algum lugar, pelo livro.
- **O inverno** (o calendário: **o mar fecha no inverno**, e até os piratas param): meses no refúgio — o saque gasto, a taverna, as
  mulheres e os homens do porto, as brigas, os planos para a primavera, **a política da tripulação** (quem quer outro capitão), os
  consertos. Uma tripulação que passa mal o inverno não chega inteira à primavera.

## 8. A caça

### 8.1. A informação (o ouro do pirata)

- **A tábua dos navios do porto** (o itinerário — N3): qual navio sai, quando, para onde, com o quê. Quem a sabe: **o estivador** que
  carregou ([`oficio-estivador.md`](oficio-estivador.md)), o funcionário do porto comprado, **o taverneiro** que ouve os marinheiros, a
  mulher do porto, o rival que quer se vingar de um mercador.
- **Os boatos** dos navios ricos, das frotas do tributo, do grão da estação.
- **A informação errada** também existe: o mercador esperto espalha que o navio rico sai na terça e sai na segunda; a armadilha da
  frota de guerra espalha um navio rico que não existe.

### 8.2. As presas

| Presa | O que leva | O que custa |
|---|---|---|
| **A pesqueira** | quase nada | pouco — e o pescador sabe as enseadas (um informante) |
| **O mercador de grão** | o grão (pesado, vale para quem tem fome) | pouco risco |
| **O mercador de vinho e de azeite** | as ânforas | pouco risco; muito peso |
| **O mercador de metal** | **o estanho, o cobre, o ferro** — o que faz as armas | os povos guardam essas rotas |
| **O navio de passageiros** | as bolsas, **os nobres para o resgate** | os guardas pessoais |
| **O navio de cativos** | gente acorrentada | **a escolha**: vender, ou soltar (e ganhar tripulação e outra fama) |
| **A frota do grão** | o grão de uma cidade inteira, na estação | a escolta |
| **O navio do tributo** | **o ouro de um rei**, uma vez por ano | a escolta de guerra; o rei que nunca perdoa |
| **A galé de guerra** | as armas, o navio | fuja dela — a não ser que ela esteja sozinha e ferida |

### 8.3. A espera e as artimanhas

- **O lugar:** o estreito, o cabo, a saída do porto, o canal entre as ilhas — **onde as rotas passam** (o piloto sabe as rotas).
- **O vigia** no alto do penhasco (a escalada), **os sinais** de espelho e de fumaça até a enseada.
- **O sol nas costas:** atacar de madrugada, vindo do nascente — a presa olha contra o sol e não vê.
- **A noite sem luz:** chegar perto no escuro, a vela escura.
- **O disfarce:** o navio que parece um pescador ou um mercador até estar perto demais.
- **A isca:** o «naufrágio» falso que pede ajuda; **as luzes falsas na costa** (o naufragador) que levam o navio às pedras.

### 8.4. Ler a presa (a olho, nunca por um marcador)

**O quanto ela afunda na água** (carregada: lenta e rica), **os escudos na amurada e os elmos** (armada), **quantos remos** (rápida), **a
vela** (de que porto, de que povo), **a pressa** (quem foge tem o que perder), **o que ela joga ao mar** (está ficando leve: vai escapar).

## 9. A perseguição

- **O vento e os remos de cada um** ([`navios.md`](navios.md) §2b): a vela é mais rápida de popa e de través; contra o vento só a galé
  avança — **a galé pirata sobe contra o vento enquanto o mercador de vela fica parado**: o melhor terreno de caça.
- **O fôlego dos remadores** (o banco cansa — o ritmo da flauta e do tambor): a caça longa vence quem tem mais gente para revezar.
- **Ficar a barlavento** (com o vento a seu favor) é escolher a hora de atacar.
- **O mercador joga a carga ao mar** para ficar leve — e a carga afunda ou boia, perdida pelo livro (`ao mar`).
- **O raso** onde o navio grande não entra, **a noite** que esconde, **a tempestade** que separa.
- **A costa a sotavento:** empurrar a presa contra as pedras — e não ir junto.

## 10. A abordagem (passo a passo)

1. **A intimidação:** a vela conhecida, o tambor, o grito, **o nome**. **A fama decide:** o mercador que sabe que aquele pirata poupa
   quem se rende entrega-se; o que sabe que ele mata todos luta até o fim. **O medo é a arma mais barata.**
2. **A chuva de flechas e pedras:** os arqueiros e os fundeiros limpam o convés da presa; **as flechas de fogo** na vela (o fogo do mundo
   pega no linho — e o saque pode queimar junto).
3. **Quebrar os remos:** passar rente ao costado com os próprios remos recolhidos e partir os remos da presa — **o navio para** sem
   afundar.
4. **Os ganchos e a prancha:** lançar, puxar, prender os cascos; a prancha ou o salto no vão entre os cascos (o mar balança os dois).
5. **A luta no convés:** o combate do corpo **no chão que anda** (N2), a proa, o mastro, a popa, a escotilha do porão; quem cai entre os
   cascos é esmagado ou se afoga com o peso do bronze.
6. **O esporão:** a galé de guerra afunda a presa — e o saque vai junto para o fundo; serve para ameaçar, raramente para ganhar.
7. **A rendição:** baixar a vela, jogar as armas; **o capitão da presa entrega a chave do porão** — ou morre com ela.
8. **A revista:** o porão, a caixa do capitão, **as moedas escondidas no lastro**, o passageiro que esconde o anel na boca.

## 11. A razia na costa

O pirata não ataca só no mar: **desembarca de madrugada** numa praia, ataca a aldeia ou o templo da costa, pega o que pode e quem pode,
e volta aos navios **antes que o exército chegue** — uma corrida contra o tempo. O povo foge para os morros e para as cavernas (o
refúgio que o mundo já tem), o fogo de alarme corre de torre em torre, a guarda vem. **Saquear um templo é sacrilégio** — e o povo
inteiro passa a odiar o seu nome. As razias do mundo (`fleets.js`) já existem; o corpo passa a viver uma por dentro.

## 12. O saque (nada vem do nada)

- **O que se leva é a carga que o navio levava**, pelo livro (`G.Depot`). O navio carregado de pedra não rende.
- **O navio:** levá-lo (falta gente), vendê-lo, queimá-lo, deixá-lo à deriva.
- **A contagem** na enseada, à luz das fogueiras: o ouro pesado, as ânforas contadas, as armas repartidas.
- **Vender:** o porto que não pergunta (o receptador, a sombra), a ilha dos piratas, o mercador desonesto — **a peça conhecida** (a
  taça de um rei) só se vende longe, ou derretida.
- **Esconder:** **o tesouro enterrado** na ilha, com o mapa na cabeça (ou num couro) — e se o pirata morre sem buscá-lo, ele fica para o
  caçador de tesouros ([`passado.md`](passado.md)).

## 13. O resgate e os cativos

- **O valor do cativo:** quem ele é (o nobre, o filho do mercador rico, o sacerdote), quanto a família tem (**as moedas da casa dela,
  de verdade**), se quem governa pagaria por ele.
- **A carta:** quem escreve (um cativo letrado, o escriba do refúgio), o intermediário (um porto neutro, um sacerdote, um mercador), o
  lugar da troca (a ilha, o templo), **a armadilha** (os soldados escondidos na troca).
- **A espera:** o cativo come, dorme, conversa, às vezes vira quase amigo da tripulação — ou a despreza, como o nobre romano. **A palavra
  do pirata vale dinheiro:** quem devolve o cativo inteiro quando a família paga tem os resgates pagos; quem não devolve não recebe mais
  nenhum, e todos lutam até o fim.
- **A venda:** o cativo sem resgate vai para o mercado de gente — **vira escravo, às vezes remador de galé** (a condição). O jogo mostra
  esse peso: a família que espera, a criança que cresce lembrando.
- **O que volta:** o cativo resgatado lembra (a memória-chave do Patch 23) — e às vezes volta com navios.
- **A outra escolha:** **soltar os cativos de um navio negreiro** ou os galeotes de uma galé tomada — a tripulação cresce (quem foi solto
  costuma ficar), e o nome muda nos portos (para uns, herói; para os donos, o pior dos piratas).

## 14. A fama (o medo e a palavra)

| A fama | O que faz |
|---|---|
| **Temido** | as presas se rendem mais; os portos fecham a porta; a recompensa sobe |
| **De palavra** | os resgates são pagos; os portos piratas o recebem |
| **Cruel** | as presas lutam até o fim; a tripulação dura obedece; o ódio vira caçada |
| **Generoso** | o povo pobre da costa esconde você; as canções; os rivais o acham fraco |
| **Sacrílego** | o templo saqueado: o povo inteiro contra você; a tripulação supersticiosa tem medo |
| **Desconhecido** | ninguém se rende; ninguém o caça |

A fama corre pelos boatos com os marinheiros e os mercadores, de porto em porto; **o bardo canta** — verdadeiro ou aumentado.

## 15. Os presságios e o deus do mar

Os marinheiros vivem de sinais: **o golfinho** que nada com a proa (bom), **a ave** que pousa no mastro, o sonho do capitão, o sacrifício
antes da caça, o fogo que dança no alto do mastro na tempestade. **O jogo não tem magia nos sinais — tem a crença:** os sinais
mexem no ânimo da tripulação de verdade (o medo e a coragem são do mundo). E **o deus do jogo existe:** no Modo Deus, o jogador pode
mandar a tempestade, o vento bom ou o raio sobre os piratas — a única «vontade do deus do mar» de verdade é a dele.

## 16. O refúgio que vira cidade

O refúgio cresce: as cabanas, a taverna, o receptador, o carpinteiro naval, as famílias, o mercado do saque — **uma cidade de piratas**.
Com os anos ela pode virar **um povo** (uma confederação de piratas que manda numa costa inteira, como os da costa montanhosa), fazer
acordos com cidades que lucram com ela, ter torres de vigia e uma cadeia de fogos de alarme — **e virar alvo** de uma campanha de
quem governa.

## 17. O mar contra você (as consequências)

- **A lei:** a pirataria é o pior crime do mar; o pirata pego vai para o cadafalso — **ou para o banco da galé** (o galeote).
- **As frotas:** quem governa manda navios de guerra atrás do pirata famoso; **a campanha contra a pirataria** — um rei que junta frotas
  e varre o mar, enseada por enseada.
- **A recompensa:** a cabeça do pirata tem preço — e a tripulação pode vendê-lo.
- **A escolta:** os mercadores passam a viajar em comboio, com soldados; a presa fácil some.
- **O passado volta:** o cativo vendido que ficou livre, o filho do capitão morto, a família que pagou o resgate, o abandonado da ilha.

## 18. Os caminhos (as entradas e as saídas)

**As entradas:** o marinheiro que se amotina e toma o navio; o pescador arruinado; **o galeote que fugiu** (a saída da galé que vira
entrada da pirataria); o soldado sem soldo; o cativo que a tripulação aceita; o filho de um refúgio de piratas; encarnar um pirata do
mundo; **roubar um navio** de noite no porto.

**As saídas:**
- **o corsário** — a licença de um rei em guerra para atacar só os navios do inimigo (e dividir com o rei);
- **o perdão** — o rei que perdoa e contrata o pirata para caçar piratas;
- **o assentado** — o pirata vencido que recebe terras longe da costa e vira lavrador (a saída que Roma deu);
- **o rei do mar** — a frota que manda numa costa;
- o pirata velho que conta histórias na taverna;
- o abandonado na ilha; a forca; o banco da galé; o fundo do mar.

## 19. As ferramentas

| Coisa | Para quê |
|---|---|
| **A galé leve** | rápida, de remos e vela, rasa |
| **Ganchos e cordas** | prender o casco da presa |
| **A prancha** | passar de um convés para o outro |
| **A espada curta, a lança, o escudo** | a abordagem (da forja do povo onde foram feitas, ou do saque) |
| **O arco e a funda** | a primeira chuva |
| **As flechas de fogo** | a vela da presa |
| **A flâmula** | **o nome no mastro**: o medo que rende |
| **O espelho e a fumaça** | os sinais entre o vigia e a enseada |
| **A carta das enseadas** | os esconderijos (o piloto) |
| **As correntes** | os cativos |
| **O altar do navio** | o juramento, o sacrifício |

## 20. O gesto (o que o corpo faz)

**Vigiar** do penhasco (a escalada); **remar e comandar o ritmo** (a flauta: a velocidade e o cansaço do banco); **governar** na caça
(o vento, a corrente, o raso); **atirar** do convés que balança; **lançar o gancho** (a distância, o tempo do balanço dos dois cascos);
**saltar** o vão entre os cascos; **lutar** no convés; **gritar a rendição** (a voz e a fama); **revistar** o porão; **contar** o saque;
**negociar** o resgate; **falar à tripulação** (a parte, o castigo, o plano — a conversa que segura ou derruba um capitão).

## 21. A recompensa que se vê e se ouve

A vela no horizonte depois de dias de espera; **o tambor que acelera** e os remos batendo juntos; a presa que joga a carga ao mar; o
estalo dos remos dela quebrando; **o estrondo dos cascos**; o gancho que prende; o salto; **a tripulação da presa largando as armas**
quando ouve o seu nome; o porão aberto; a enseada à noite com as fogueiras e o saque no chão; a vela de púrpura entrando no porto pirata
e todos olhando.

## 22. Os perigos

| Perigo | Como vem |
|---|---|
| **A galé de guerra** | a frota que caça, a escolta do comboio |
| **A presa que luta** | os soldados escondidos, o mercador armado |
| **A armadilha** | a informação falsa, o navio rico que não existe |
| **A tempestade e o recife** | o mar, a costa a sotavento |
| **O motim** | a parte injusta, a fome, a derrota, o capitão fraco ou cruel demais |
| **A traição** | o companheiro que vende você pela recompensa; o informante que vende os dois lados |
| **A doença a bordo** | a água ruim, a ferida que inflama |
| **A fome e a sede** | a caça que não vem |
| **O receptador** | o preço baixo, a entrega |
| **O inverno** | o refúgio sem comida, a tripulação que se desfaz |

## 23. As técnicas (24)

| Técnica | O que faz | De quem se aprende |
|---|---|---|
| Ler a presa | carregada, armada, rápida — pelo que se vê | um pirata velho |
| O informante | a tábua dos navios do porto | a rede do porto |
| Pesar a informação | a armadilha antes de cair nela | descoberta |
| A emboscada do estreito | esperar onde as rotas passam | um piloto, um pirata velho |
| O sol nas costas | atacar vindo do nascente | um pirata velho |
| A noite sem luz | chegar perto sem ser visto | descoberta |
| O disfarce | parecer pescador ou mercador | descoberta |
| A perseguição pelo vento | o ângulo certo para alcançar | um piloto |
| Contra o vento | caçar a vela onde ela não anda | um capitão de galé |
| O raso | fugir onde o navio grande encalha | um piloto da costa |
| Quebrar os remos | parar a presa sem afundá-la | um capitão de guerra |
| O gancho | prender na primeira | descoberta |
| A luta no convés | o equilíbrio no chão que balança | um marinheiro, um gladiador |
| A flecha de fogo | a vela da presa (sem queimar o saque) | um arqueiro |
| O grito e o nome | a rendição pelo medo | a fama |
| A revista | o que a presa esconde | um pirata velho |
| A razia | desembarcar, pegar e sair antes do exército | um pirata do norte |
| O resgate | a carta, o intermediário, a troca sem armadilha | um pirata velho |
| A parte justa | a tripulação contente | descoberta (ou o motim) |
| Ler a tripulação | o motim antes dele | descoberta |
| Virar o casco | consertar e limpar o navio na praia | um carpinteiro naval |
| O esconderijo | a enseada que ninguém acha | um piloto, um pescador |
| O porto que não pergunta | vender sem ser pego | a sombra |
| O inverno bem passado | a tripulação inteira na primavera | um capitão velho |

## 24. A prática (o que cada faixa abre)

| Faixa | O que abre |
|---|---|
| Grumete (0–20) | o remo, a corda, a luta de quem vai atrás |
| Pirata (20–40) | o gancho; ler a presa |
| Imediato (40–60) | **a perseguição pelo vento**; ler a tripulação |
| Capitão (60–85) | a emboscada; o nome que rende; o resgate |
| Rei do mar (85–100) | a frota inteira na mão; o refúgio que vira cidade |

## 25. Os títulos (do mar, não da lei)

| Título | O que pede | O que dá |
|---|---|---|
| **Grumete pirata** | entrar numa tripulação | meia parte |
| **Pirata** | prática 25; uma abordagem | a parte inteira |
| **Mestre de abordagem** | prática 45; três presas | o comando da abordagem; parte e meia |
| **Capitão pirata** | prática 65; **o seu navio e a sua tripulação** | o navio, a flâmula, **o nome nos portos** |
| **Rei do mar** | prática 85; **uma frota e uma costa** | os outros pagam a sua parte; um rei pode querer comprar você |

## 26. A coleção, os recordes e as lendas

- **A coleção:** os navios tomados (com o nome de cada um), as presas famosas, os resgates, as enseadas conhecidas, as cicatrizes.
- **Os recordes:** o maior saque, o maior resgate, a caça mais longa — e as cabeças com o maior preço.
- **As lendas** (nascem do mundo; finitas; de quem chegar primeiro):

| Lenda | O que é |
|---|---|
| **O tesouro do maior pirata** | o saque escondido de um pirata famoso do mundo que morreu sem buscá-lo |
| **A ilha-fortaleza** | a ilha com a melhor enseada do mundo, a água doce, o penhasco do vigia |
| **O navio fantasma** | o casco à deriva com o porão cheio e ninguém a bordo (o mundo já tem cascos à deriva) |
| **O navio do tributo** | o ouro de um rei, uma vez por ano, na estação — a presa de uma vida |
| **O grande resgate** | o filho de um rei |

## 27. A economia (o pirata muda o mundo)

- **O saque pelo livro**, **o resgate em moedas de verdade**, a venda de cativos (a condição), a parte do receptador, do informante e do
  funcionário comprado, o soldo do corsário, a recompensa pela cabeça.
- **A rota que o pirata torna cara:** o mercador paga escolta, viaja em comboio ou desiste da rota; **o preço sobe** na cidade que
  dependia dela (o vinho, o estanho, o grão) — **o comércio do mundo sente** (as rotas de comércio que já existem respondem ao risco).
- **A cidade que lucra:** o porto que compra o saque barato e fecha os olhos.

## 28. Por povo

O **Egito** (as costas atacadas pelos povos do mar; os guardas do delta); os **gregos** (a pirataria das ilhas, a pergunta educada, os
piratas que viravam colonos); os **romanos** (os piratas da costa montanhosa com as velas de púrpura, o nobre sequestrado, a campanha que
limpou o mar e as terras dadas aos vencidos); o **norte** (as razias do mar, os navios de proa alta que encalham em qualquer praia, os
guerreiros que remam); os **astecas** (as canoas de guerra dos lagos e da costa, o ataque à cidade rival pela água, os cativos para os
templos).

## 29. A camada do ambiente

| A fotografia | O som | O tremor | A tela | A mochila |
|---|---|---|---|---|
| a vela no horizonte; o convés na abordagem, de perto, com o mar entre os cascos; a enseada de noite com as fogueiras | **o tambor dos remos que acelera**, o grito de guerra, os ganchos, **o estrondo dos cascos**, o estalo dos remos quebrando, o mar, as canções da tripulação | o choque dos cascos, o esporão, o salto | **a presa lida a olho** (o quanto afunda, os escudos, os remos); **o ânimo da tripulação lido nos rostos**; nada de marcador | a vista do pirata: a espada, o gancho, o saque, as cartas de resgate, a carta das enseadas |

## 30. As ligações com os outros ofícios

O **navegador** (o pirata precisa dele, e as rotas são a caça), o **estivador** e o **taverneiro** (os informantes), o **receptador** (a
sombra), o **remador de galé** (o galeote que vira pirata; o pirata que vira galeote), o **capataz** (o comitre da galé tomada), o
**mercador** (a presa e o comprador), o **soldado da frota** e o **caçador de piratas** (o outro lado), o **carpinteiro naval**, o
**curandeiro**, o **bardo** (as canções), o **caçador de tesouros** (o tesouro enterrado).

## 31. O cuidado com o tema

Como o capataz e o saqueador: o jogo mostra a pirataria pelo que ela faz — o saque, o sangue, o sequestro, a venda de gente — sem
transformar a crueldade em pontos. **O medo é uma arma de verdade, e o ódio que ele planta também.** Há caminhos de honra (a palavra
cumprida, os cativos soltos) e de horror (o massacre, o navio negreiro), e o mundo lembra dos dois.

## 32. Os derivados

O **corsário**, o **naufragador** (as luzes falsas na costa), o **informante do porto**, o **receptador** do saque, o **vigia** da ilha, o
**contrabandista** do mar, o **carpinteiro do refúgio**, o **intermediário de resgates**, o **caçador de piratas** (o capitão da frota que
limpa o mar).

## 33. As fases e as provas

| Fase | O quê |
|---|---|
| Pi1 — A caça | a informação, as presas, a espera e as artimanhas, ler a presa, a perseguição pelo vento e pelos remos |
| Pi2 — A abordagem | a intimidação pela fama, as flechas, quebrar os remos, os ganchos, a luta no convés, o esporão, a rendição, a revista |
| Pi3 — O saque e os cativos | a carga pelo livro, a contagem, vender, esconder, o resgate, a venda, soltar |
| Pi4 — A tripulação e o refúgio | os papéis, o acordo, o ânimo, o motim, o inverno, os presságios, o refúgio que vira cidade |
| Pi5 — O mar contra você | a lei, as frotas, a campanha, a recompensa, o corsário, o perdão, o assentado, o rei do mar, as lendas, a economia que muda |

**As provas:**
- o saque é a carga que estava no navio (pelo livro); o que se joga ao mar sai do livro;
- o resgate sai das moedas da casa da família, e a palavra cumprida ou quebrada muda os resgates seguintes;
- o cativo vendido entra nas regras da condição; o galeote solto entra na tripulação pelas mesmas regras;
- a rendição pesa a fama de verdade (pelos boatos que a presa ouviu);
- o tesouro enterrado fica no mundo depois da morte do pirata;
- a rota com piratas fica mais cara pelas regras do comércio;
- o mundo sem o corpo é o mesmo (os piratas do mundo caçam, repartem, se amotinam e caem pelas mesmas regras, cada um pela sua índole);
- os casos ruins: o save no meio da abordagem, o capitão que morre na luta, o motim no meio da caça, a frota de guerra que chega, a troca
  do resgate com soldados escondidos, o inverno sem comida, o deus que manda a tempestade;
- e **o teste do dono: horas no mar, sem enjoar.**

## 34. Quando entra

Com a viagem e a batalha no mar (Patch 36), depois do navio por dentro e do porto (35), da sombra (34) e do combate profundo (33);
**o mar de dias** com o mundo grande (41) ([`roteiro.md`](roteiro.md)).
