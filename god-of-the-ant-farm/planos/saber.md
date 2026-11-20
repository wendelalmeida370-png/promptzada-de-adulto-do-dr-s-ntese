# O saber — a base da descoberta, da pesquisa e da técnica (aprovado pelo dono, 20/11/2026)

A ideia do dono (20/11/2026): **falta uma base da tecnologia, da pesquisa e da ciência** — a roda, a matemática, a astronomia, a
química, a física —, e **os ofícios de quem leva cada povo ao progresso**: o pesquisador, o matemático, o filósofo. No jogo há coisas
encadeadas — a pirâmide grande pede matemática e arquitetura, o ferro pede saber fundir, o escriba pede a escrita — e essa cadeia
precisa de uma base. **Na língua das quatro camadas** ([`oficios-fundacao.md`](oficios-fundacao.md) §1b), a «fundação» que o dono
pediu é **uma base** (uma lei do mundo) **com as suas perícias**; os ofícios vêm depois, cada um com o seu documento.

## 1. A resposta curta: faz sentido — e é o buraco que faltava tapar

**Como o jogo faz hoje** (lido no código, `js/civs.js`):

- **Dez artes por povo:** a roda, a escrita, a navegação, o arco, o bronze, a alvenaria, a moeda, a engenharia, a filosofia e o
  ferro. **Dezoito arquivos do jogo perguntam** «este povo tem a arte?» antes de deixar fazer alguma coisa (o porto, a carroça, a
  muralha, o mercado, o arqueiro, a forja de bronze).
- **A pesquisa é uma barra do povo** que enche sozinha: um pouco por dia, mais um tanto **pelo número de pessoas**, mais um tanto por
  biblioteca e teatro de pé, vezes um bônus da escrita e da filosofia. Cheia a barra, a arte vem.
- **A ordem é fixa por povo** (o romano numa ordem, o grego noutra); só o mar puxa a navegação para a frente.
- **Entre povos, o saber pula por sorteio** a quem tem paz ou comércio, e **o deus pode mandar um sonho** (a Inspiração).

**E dez é pouco:** nos mundos prontos de hoje, **um povo descobre as dez artes entre o ano 25 e o 55** (medido no mundo de cem
anos e no de quinhentos) — e depois não há mais nada a aprender por séculos.

**Os buracos:**
1. **O saber é a única coisa do mundo que ainda vem do nada.** Nada vem do nada (D-440) vale para o ferro, o pão e o elmo — mas a
   arte do ferro vem de uma barra que enche com a contagem de gente. **Ninguém descobriu a roda:** não há inventor, nem cidade, nem
   dia, nem causa.
2. **O dia de verdade da biblioteca não conta** — as leituras e as cópias que ela já tem (`G.Biblioteca`); conta só o prédio de pé.
3. **O saber nunca se perde:** nenhum povo esquece, nenhuma biblioteca queimada faz falta, nenhum mestre morre levando o segredo.
4. **A necessidade não guia:** um povo que perde todas as guerras para o ferro não corre atrás do ferro; um povo com fome não
   procura o arado melhor.
5. **Só há dez saltos grandes:** nada entre eles — nem a polia, nem o anzol farpado, nem o moinho, nem a vela latina.
6. **O corpo não entra:** ninguém pode ser o inventor, o sábio, o que mediu a altura da pirâmide pela sombra.

**Por isso a ideia faz sentido:** é a base que faz o saber obedecer à regra de todo o resto do jogo — **tem quem descobriu, de onde
veio, onde mora, e pode se perder.**

## 2. A lei do mundo (o que a base diz)

**Todo saber tem quem o descobriu, por que causa, onde mora — e pode se perder.** Cinco leis:

1. **Nasce de alguém, por uma causa.** A **necessidade** (o problema de verdade: a cheia, a fome, a guerra perdida, a pedra que não
   sobe), a **observação** (o céu, a natureza, o próprio ofício), o **ensaio** (tentar, errar, anotar) e o **acaso visto por um olho
   treinado** (o cobre que escorre no forno do oleiro). **Nunca da contagem de gente.**
2. **Mora em pessoas e em escritos.** Quem sabe (a pessoa, pela prática), o mestre que ensinou, o livro, a tabuinha, a inscrição na
   pedra — e **a tradição**, o saber que um povo inteiro faz todo dia (o bronze que cem ferreiros forjam não se esquece fácil). O saber
   de um povo é o que as suas pessoas e os seus escritos guardam.
3. **Anda com quem o leva.** O aprendiz, o mercador, **o artesão levado como cativo**, o viajante, o livro copiado e vendido, o espião
   que rouba o segredo — como os boatos (D-620), nunca por sorteio entre povos.
4. **Se perde.** O mestre que morre sem aprendiz, a biblioteca que queima, a cidade saqueada com os seus sábios, a escrita que
   ninguém mais lê. **Aconteceu de verdade:** depois de 1200 a.C. os gregos perderam a escrita por quatro séculos. E o saber perdido
   fica no passado em camadas ([`passado.md`](passado.md)), **para ser achado** — o livro numa tumba, o instrumento no fundo do mar.
5. **Pede o que o mundo tem.** O material (a argila da tabuinha, o papiro, a tinta, o instrumento de bronze), o lugar (a escola, a
   biblioteca, o observatório, a oficina), **o tempo livre** (quem pesquisa não planta: um povo com fome não tem sábios) e **o saber de
   antes** (a cadeia: ninguém chega à abóbada sem o arco).

## 3. As camadas do saber

| Camada | O que é | Exemplo |
|----|----------|----------|
| **As artes** | o que muda o povo inteiro; **as portas** que o jogo já pergunta (as dez de hoje e as novas) | a escrita, o bronze, a engenharia |
| **As descobertas** | **os passos de cada arte**, encadeados; cada uma com quem a fez, onde, quando e por quê | o bronze: o cobre derretido → a mistura com o estanho → o molde |
| **Os achados** | **as invenções pequenas, nascidas do ofício**, com efeito pequeno e com causa | a polia, o anzol farpado, a relha de ferro do arado, a âncora de duas patas |
| **O que cada um sabe** | as descobertas e os achados que cada pessoa conhece, e de quem aprendeu | a ferreira que aprendeu a liga com o velho de outra cidade |

**As artes continuam as portas** (os dezoito arquivos continuam perguntando «o povo tem?»), mas **o povo passa a ter uma arte quando
as descobertas dela chegaram a ele de verdade** — feitas por alguém, ensinadas, escritas, espalhadas pelas suas cidades. **Os achados**
são o tempero de cada ofício: pequenos, como os estados da comida ([`cozinha.md`](cozinha.md) §8b) — o anzol farpado segura um peixe a
mais, nunca transforma a pesca.

## 4. Os ramos do saber (sem anacronismo)

Na Antiguidade **não havia «físicos» nem «químicos»** com esses nomes: a física era parte da **filosofia natural** (o filósofo que
pergunta do que o mundo é feito) e da **mecânica** (o engenheiro das máquinas); a química era **o saber dos artesãos do fogo** (o
ferreiro, o vidreiro, o tintureiro, o perfumista) e, no fim, **a alquimia**. O jogo usa os nomes da época, em **catorze ramos** — os dez da tabela
abaixo e mais **a lavoura e a criação**, **o mar e os barcos**, **a guerra** e **a troca e o governo** (todos no catálogo, §4b):

| Ramo | O que estuda | Exemplos de descobertas (a cadeia) | O que muda no jogo |
|----|----|----------|------------|
| **Os números e a forma** | a conta, a geometria | a marca de contagem → a tábua de contas → a corda de doze nós (o ângulo reto) → a sombra que mede a altura → a demonstração | **os degraus maiores dos monumentos** (a pirâmide grande pede o ângulo que não muda), a medição dos campos depois da cheia (menos briga de divisa), as contas do tesouro que não se perdem |
| **O céu** | a astronomia, o calendário (e a astrologia, como era) | as fases da lua → a sombra mais curta do ano (o solstício, pelo sol de verdade do jogo) → a estrela que nasce antes do sol (o aviso da estação) → **o calendário do povo** → a previsão | **o povo que sabe o ano planta no dia certo** (com o calendário de quatro estações); a festa no dia certo; **as estrelas do navegador**; a fama de quem prevê |
| **As máquinas** | a mecânica | a alavanca → a polia → o guindaste → o parafuso de água → a roda d'água → as engrenagens | **o guindaste do cais** (o estivador), **a obra que sobe mais rápido**, a água levada aos campos, **o moinho** (o moleiro), as máquinas de cerco; e **os autômatos** — a porta do templo que abre sozinha (o «milagre» dos sacerdotes) |
| **As obras** | a arquitetura | a viga → **o arco** → a abóbada → o concreto → a cúpula | **o aqueduto**, a ponte de pedra, as salas grandes das termas, o porto dentro do mar, os degraus maiores de cada prédio |
| **O fogo e as misturas** | o saber dos artesãos (a «química» da época) e, tarde, a alquimia | o cobre que derrete → o bronze → o ferro → o aço; a areia e a cinza → **o vidro**; as tintas (**a púrpura**); o sabão; a cal → o concreto | o bronze e o ferro (que já existem) pela sua cadeia; **o vidro** (o vidreiro); **a roupa tingida e cara** (a roupa que o 3D já lê do que o povo sabe fazer); a cerveja e o vinho melhores |
| **O corpo e a cura** | a medicina | as ervas → pôr o osso no lugar → fechar a ferida → **a quarentena** → a cirurgia | **menos mortes no parto** e de ferida que apodrece; **a peste que para** na quarentena (a Praga do deus encontra os médicos); o templo onde os doentes dormem |
| **A natureza** | a história natural | o bicho que volta no mesmo dia → a semente escolhida → **a rotação dos campos** → o livro dos bichos | a terra que cansa menos (o lavrador), a criação melhor (o pastor), **o caçador que sabe por onde a migração passa** ([`natureza-viva.md`](natureza-viva.md)) |
| **A terra e os povos** | a geografia, a história escrita | o périplo (a costa contada) → **o mapa** → a crônica | **o mapa do povo**: só o que os seus viajantes viram (o deus vê tudo; o povo, só o que mapeou); a história escrita (as marcas) |
| **O pensamento** | a filosofia: a lógica, a ética, a política | a pergunta → o argumento → a escola → a lei pensada | **as cidades mais leais** (o que a filosofia já dá hoje), **a lei escrita** (o juiz), **regimes novos nascidos de ideias** (quem governa), **a dúvida sobre os deuses** (§9) |
| **A palavra** | a escrita, a língua | a marca de contagem → o símbolo → o som → **o alfabeto** → a tradução | a escrita (que já existe); com o alfabeto, **mais gente lê** (o escriba mais barato); o saber de outro povo traduzido |

**A pirâmide do dono:** cada degrau maior de um monumento passa a pedir o seu saber (`G.Escala`): a pirâmide pequena, a conta e a
corda; a grande, **o ângulo que não muda** (os números e a forma), **a rampa e a alavanca** (as máquinas) e **as contas da obra** (a
escrita). Um povo sem esse saber ergue a pirâmide do tamanho que sabe — e a maior espera um sábio.

## 4b. O catálogo: as seis eras e as descobertas (a expansão pedida pelo dono)

**O pedido do dono** (20/11/2026): dez artes é pouco — **nos mundos prontos de hoje, um povo descobre as dez entre o ano 25 e o 55**
(medido no mundo de cem anos e no de quinhentos), e depois não há mais nada a aprender por quatro séculos e meio; os sábios e
esta base ficariam inúteis. **O saber tem de render até o ano 500, até o ano 1000** — e **cada descoberta tem de mudar alguma coisa de
verdade** na civilização: abrir uma possibilidade, mudar um rendimento, salvar vidas, encurtar um trabalho, dar uma arma, um prédio,
um navio, um regime. **Nada para encher linguiça.**

**As seis eras** (o saber de antes pede o de depois; nenhum povo pula uma era inteira):

| Era | O nome | O que marca | Os povos da frente chegam (anos) |
|---|---|---|---|
| **I** | **As primeiras** | o fogo, o barro, a semente, o cão | no começo do mundo (o que cada povo já sabe) |
| **II** | **O bronze e a escrita** | o metal fundido, a roda, a vela, a conta escrita | 5 a 40 |
| **III** | **O ferro e a moeda** | o ferro, a alvenaria, o alfabeto, a polia, o cavalo montado | 20 a 100 |
| **IV** | **Os clássicos** | a geometria, a filosofia, a engenharia, o arco, a trirreme, a quarentena | 40 a 250 |
| **V** | **O auge** | o concreto e a cúpula, o vidro soprado, a roda d'água, a vela latina, o astrolábio | 200 a 600 |
| **VI** | **A longa idade** | o arado pesado, a coelheira, o moinho de vento, o estribo, a bússola, o papel, o zero | 500 a 1000 e além |

**As dez artes de hoje ficam nos anos de hoje** (eras II a IV, até por volta do ano 60) — o mundo de hoje continua igual no começo, e
a prova de equivalência vale (§12). **O que é novo enche os séculos seguintes.** E **nenhum povo chega a tudo:** o chão (sem rio, sem
moinho d'água; sem estanho, sem bronze; sem caramujo do mar, sem púrpura), o gosto, as guerras e as perdas fazem cada povo seguir o
seu caminho — **quem tem, ensina; quem não tem, compra, rouba ou fica sem.**

**O teto** (decidido pelo dono, 20/11/2026): o catálogo vai **até a beira da pólvora** — sem pólvora, sem imprensa, sem relógio
mecânico. Assim o mundo continua com a cara antiga que o jogo tem (as roupas, os prédios, as armas). **Este é o saber da era antiga do
jogo**; as eras depois dela (a pólvora, as máquinas, a eletricidade, a informação, o futuro) são uma ideia do dono para muito mais à
frente ([`eras.md`](eras.md)).

Nas tabelas: **(hoje)** marca as dez artes que já existem; **«O que se vê»** é a coisa nova no mundo, à vista (a regra logo abaixo);
**«Pede»** é o saber de antes (e o material ou o lugar, quando há).

### O que se vê (a recompensa à vista — a regra do dono)

**Toda descoberta muda o que se vê, não só um número.** O guindaste tem de estar no cais, a foice de ferro na mão do ceifador, o arado
pesado no campo, a bússola na mão do piloto, a roda d'água girando no rio, a vela triangular no mar. **Ver o que a pesquisa tornou
possível é a grande recompensa** — maior que o número que melhorou.

1. **Toda descoberta tem a sua coisa no mundo:** um objeto (a ferramenta, a arma, o instrumento — com a forma, a figura e o material no
   catálogo das coisas), um prédio ou uma parte dele (o aqueduto, a cúpula, o moinho, o farol), um bicho (o cavalo ferrado, o boi de
   canga), uma parte de navio (a vela latina, o leme de popa) ou **uma cena** — **o saber que não é coisa vira gente fazendo**: a
   lógica é o debate na praça, os dedos contando os argumentos; o censo é o recenseador de porta em porta; o banco é a mesa do
   banqueiro com o cofre.
2. **Nas duas vistas:** no corpo, de perto; **e do deus, de cima** — o aqueduto cruzando o campo, os moinhos girando nos morros, os
   campos em faixas do arado pesado, as velas triangulares no mar. **Ver uma civilização mudar de cara ao longo dos séculos é uma das
   melhores recompensas do deus.**
3. **O que se vê tem causa:** a coisa aparece só onde o povo tem o saber **e** o material (o kit que o 3D desenha já obedece a isso, pela
   porta da origem das coisas), e onde a usam de verdade (o guindaste onde há obra ou cais; a roda d'água onde há rio e moinho).
4. **Com o arcabouço inteiro:** a animação (a roda do guindaste com gente andando dentro, o ceifador com a foice), o som (a roda
   d'água, o moinho, a prensa) e a interação do corpo (usar a foice, girar o guindaste, ler a bússola).
5. **A perda também se vê:** o saber perdido deixa **a ruína que ninguém mais sabe consertar** — o aqueduto partido, a cúpula que
   ninguém mais ergue —, e o povo depois olha para ela sem saber como foi feita.

### A lavoura e a criação

| Era | Descoberta | O que muda | O que se vê | Pede |
|--|-------|------------|-----------|-----|
| I | O pau de cavar e a enxada | a primeira roça | a enxada de pau e de pedra nas mãos, a roça em covas | — |
| I | A semente guardada | guardar a melhor espiga: a colheita cresce um pouco a cada geração | os potes de semente na casa; a espiga mais cheia no campo | Observar |
| I | O cão e a cabra | o cão que guarda o rebanho (já existe), o leite, a lã | o cão junto ao rebanho, as cabras no curral | — |
| II | O boi manso | o boi castrado puxa o arado e a carroça | o boi com a canga | o cão e a cabra |
| II | O cavalo domado | o cavalo atrelado: o carro de guerra, a carroça ligeira | o cavalo atrelado ao carro | o boi manso |
| II | O arado de pau | **um lavrador cuida de um campo maior** | o arado puxado pelos bois, os sulcos riscados no campo | o boi manso |
| II | O pousio | a terra que descansa um ano não cansa | o campo de capim em descanso ao lado do campo plantado | Observar |
| II | Os canais de irrigação | a roça na terra seca perto do rio; a cheia guardada | os canais de água saindo do rio entre os campos | a enxada; um rio |
| II | O queijo | o leite que dura o inverno inteiro | as formas de queijo na despensa, o pano pingando | o cão e a cabra |
| III | A relha de ferro | o arado entra na terra dura | a ponta de ferro no arado, a terra escura revirada | o ferro |
| III | A foice de ferro | a colheita na metade do tempo | a foice de ferro na mão do ceifador, os feixes atados | o ferro |
| III | O enxerto | o pomar, a vinha e a oliveira dão mais e mais cedo | as árvores em fileiras, o corte amarrado no galho | a semente guardada |
| III | O cavalo montado | o mensageiro, o pastor, o caçador e o guerreiro a cavalo | gente a cavalo pelas estradas | o cavalo domado |
| III | O feno guardado | **o rebanho atravessa o inverno** (com as estações) | os montes de feno e o palheiro no inverno | a foice |
| IV | A rotação com leguminosas | o feijão que devolve a força da terra: menos pousio | os campos de cores diferentes, o feijão em flor | o pousio |
| IV | O esterco no campo | a colheita maior onde há curral | a carroça de esterco, o monte junto ao curral | o pousio |
| IV | A colmeia | o mel (comida com origem) e a cera (a vela, o selo) | as colmeias de barro e de palha, quem tira o mel com fumaça | — |
| IV | A seleção das raças | o boi maior, a ovelha de lã fina | o boi grande, a ovelha de lã branca e fina | a semente guardada |
| V | O moinho d'água | **o grão da cidade moído pela água**: mãos livres para outros ofícios | a roda d'água girando no rio, a casa do moinho | a engrenagem; um rio |
| V | A ceifadeira | a carroça que ceifa o campo plano | a carroça de dentes empurrada pelo boi no trigo | a roda; o ferro |
| V | O viveiro de peixes | o peixe criado em tanque | os tanques de pedra com peixe | os canais |
| V | A ferradura | o cavalo na pedra e na estrada sem estragar o casco | o ferreiro ferrando o cavalo, a ferradura no casco | o ferro; o cavalo montado |
| VI | O arado pesado | **as terras pesadas do norte se abrem**: o povo do frio passa a ter campo | o arado grande de rodas, a parelha de oito bois, os campos em faixas compridas | a relha de ferro |
| VI | A coelheira | **o cavalo puxa o dobro** sem se sufocar: o arado e a carroça a cavalo | o colar acolchoado no cavalo que puxa o arado | a ferradura |
| VI | Os três campos | um terço a mais da terra em uso todo ano | três campos grandes, cada um de uma cor | a rotação |
| VI | O moinho de vento | moer onde não há rio | as pás girando no alto do morro | a engrenagem |

### O fogo e as misturas

| Era | Descoberta | O que muda | O que se vê | Pede |
|--|-------|------------|-----------|-----|
| I | O forno de barro | o pote cozido (a olaria) | o forno abobadado fumegando, os potes queimando | — |
| I | O cobre batido | o primeiro enfeite e a primeira faca de metal | o enfeite de cobre no pescoço | cobre à vista |
| II | A fundição do cobre | a ferramenta de cobre | o forno de fundir, o cobre escorrendo no molde | o forno; o minério |
| II | **O bronze (hoje)** | a arma e a ferramenta de bronze | (já se vê) a arma e o escudo de bronze dourado | o cobre e o estanho |
| II | A roda de oleiro | o pote mais rápido e mais fino | o oleiro na roda que gira, os potes iguais em fila | a roda |
| II | A cal | a argamassa e o reboco | o forno de cal, as paredes brancas rebocadas | o forno |
| II | O ouro fundido | a joia (o ourives) | a joia de ouro nos ricos | o ouro achado |
| III | **O ferro (hoje)** | a arma e a ferramenta de ferro | (já se vê) a arma de ferro escura | o minério de ferro; o forno quente |
| III | A têmpera | a lâmina e a ferramenta mais duras | a lâmina chiando na água, o vapor | o ferro |
| III | O vidro moldado | a conta, o frasco | as contas coloridas, o frasco de vidro | a areia e a cinza |
| III | A púrpura | **o pano mais caro do mundo** (a roupa do rei, o comércio) | o manto roxo do rei; as cubas de tinta na praia | o caramujo do mar |
| IV | O aço | a lâmina que não entorta: **a arma e a ferramenta melhores** | a lâmina clara e brilhante | a têmpera |
| IV | O latão | a moeda e o instrumento que brilham | o instrumento e a moeda amarelos | o cobre; a calamina |
| IV | A cerâmica vidrada | o pote que não vaza: guardar e vender | os potes brilhantes e coloridos | a roda de oleiro |
| IV | O sabão | **menos doença onde se lava** | a lavadeira no rio com espuma, as barras de sabão | a cinza e a gordura |
| IV | Os pigmentos | a pintura que dura (a marca) | as paredes pintadas de cores vivas, o pintor com os potes | Ensaiar |
| V | O vidro soprado | o vidro barato: **a janela de vidro**, o copo, o frasco | o soprador com o cano; as janelas de vidro, os copos na mesa | o vidro moldado |
| V | O concreto | **a cúpula e o porto dentro do mar** | as cúpulas; o molhe do porto dentro do mar | a cal; a cinza do vulcão |
| V | A amálgama | mais ouro tirado do minério — e o mercúrio que envenena | a bacia de mercúrio do mineiro, o vapor | o ouro; o mercúrio |
| VI | O aço de cadinho | **a melhor lâmina do mundo** (o segredo de uma cidade) | a lâmina com as ondas no metal | o aço |
| VI | A destilação | o perfume, o remédio, a bebida forte | o alambique de vidro e de cobre, as gotas | o vidro soprado |
| VI | O fogo grego | **a arma de fogo no mar** — o segredo mais guardado | o sifão na proa da galé, o fogo sobre a água | a destilação; o petróleo achado |

### As obras

| Era | Descoberta | O que muda | O que se vê | Pede |
|--|-------|------------|-----------|-----|
| I | O pau a pique | a cabana | a cabana de varas e barro | — |
| I | O tijolo cru | a casa de barro | os tijolos secando ao sol, a casa de barro | — |
| II | O tijolo cozido | a parede que a chuva não desfaz | o forno de tijolo, as paredes vermelhas | o forno |
| II | A viga e a coluna | o templo de pedra | o templo de colunas e vigas de pedra | — |
| III | **A alvenaria (hoje)** | a muralha, a rua calçada, o sobrado | (já se vê) as muralhas, as ruas calçadas, os sobrados | a cal |
| III | A telha cozida | **o telhado que não pega fogo**: a cidade queima menos | os telhados de telha vermelha | o forno |
| III | As ordens das colunas | o templo maior (um degrau acima) | os capitéis: o simples, o de volutas, o de folhas | a viga e a coluna; Medir |
| IV | O arco | **a ponte de pedra**, o portão, o aqueduto | as pontes de arco, os portões em arco | Calcular |
| IV | A abóbada | a sala grande sem colunas | o teto curvo da sala grande | o arco |
| IV | O aqueduto | **a água que chega à cidade**: as termas, as fontes | o aqueduto de arcos cruzando o campo, a fonte na praça | o arco; a engenharia |
| IV | O esgoto | a cidade grande com menos doença | as bocas do esgoto na rua e no rio | o arco |
| V | A cúpula | **os degraus de cima** do templo e das termas | as cúpulas dos templos e das termas | o concreto; o círculo |
| V | O hipocausto | o chão aquecido das grandes termas | os pilaretes debaixo do chão das termas, o vapor | a telha; o tijolo cozido |
| V | A ínsula alta | a cidade densa, de vários andares | os prédios de quatro andares | o concreto |
| V | O farol | o navio que chega de noite sem bater | a torre com o fogo no alto | a alvenaria |
| VI | O arco quebrado | o salão mais alto e mais claro | o salão alto de arcos pontudos | a abóbada |
| VI | O guindaste de roda | **o monumento sobe na metade do tempo** | a roda grande com gente andando dentro, erguendo a pedra | a polia composta |

### As máquinas

| Era | Descoberta | O que muda | O que se vê | Pede |
|--|-------|------------|-----------|-----|
| I | A alavanca | mover a pedra grande | o tronco de alavanca sob a pedra | — |
| I | Os rolos | arrastar a pedra sobre troncos | a pedra deslizando sobre troncos | — |
| II | **A roda (hoje)** | a carroça, o carro de guerra | (já se vê) as carroças | os rolos |
| II | A rampa | **a pedra que sobe à obra alta** (a pirâmide) | a rampa de terra subindo ao lado da obra | a alavanca |
| III | A polia | o mastro, o poço, a carga erguida | a polia no poço e no mastro | a roda |
| III | O shaduf | a água erguida para a roça pelo contrapeso | o balde com o contrapeso na beira do rio | a alavanca |
| III | O torno | a tigela, a perna da mesa, o eixo | o torneiro girando a madeira, as tigelas | a roda |
| IV | **A engenharia (hoje)** | o aqueduto, a estrada, o aríete, a catapulta | (já se vê) o aqueduto, a estrada, a catapulta | a polia; Calcular |
| IV | A polia composta | **o guindaste do cais e da obra** (o estivador, o construtor) | o guindaste de madeira no cais e na obra | a polia |
| IV | O parafuso | **a prensa do azeite e do vinho**; a água erguida | a prensa de parafuso no lagar | Engenhar |
| IV | A bomba de pistão | **a água contra o fogo**: a cidade apaga incêndios | gente bombeando água no incêndio, a mangueira de couro | o parafuso |
| V | A engrenagem | o moinho d'água, o relógio, o contador de passos | as rodas dentadas dentro do moinho | a polia composta |
| V | Os autômatos | a porta do templo que abre sozinha — o «milagre» dos sacerdotes | a porta do templo que se abre sozinha, a estátua que se mexe | a engrenagem |
| V | A eolípila | o brinquedo do vapor — **um saber sem uso** naquele tempo (a curiosidade e a marca) | a bola de bronze que gira soltando vapor, na casa do sábio | a engrenagem |
| VI | O trabuco de contrapeso | **o cerco que derruba muralhas** | o trabuco lançando pedras no cerco | a polia composta |
| VI | A manivela e o pedal | a roda de fiar e o torno de pedal: **mãos mais rápidas** | a roda de fiar com o pedal, o torno de pedal | a engrenagem |

### O mar e os barcos

| Era | Descoberta | O que muda | O que se vê | Pede |
|--|-------|------------|-----------|-----|
| I | A canoa e a jangada | pescar e cruzar o rio | as canoas e as jangadas no rio | — |
| II | **A navegação (hoje)** | a vela: o porto, o barco de pesca, o mercante | (já se vê) a vela quadrada, o porto | a canoa |
| II | O casco de tábuas | o barco maior | o barco de tábuas | — |
| III | A quilha | o navio que não vira com o vento | o casco grande com a quilha no estaleiro | o casco de tábuas |
| III | O calafeto | o porão seco: a carga vai longe | o piche escuro no casco, o caldeirão de piche | o piche |
| III | A birreme | a galé de dois andares de remos | a galé de duas fileiras de remos | a quilha |
| IV | A trirreme | **a batalha no mar** | a galé de três fileiras, com o esporão | a birreme; Engenhar |
| IV | A âncora de ferro | o navio que segura na tempestade | a âncora de duas patas na proa | o ferro |
| IV | O périplo | a costa escrita: a rota segura | o rolo da costa na mão do piloto | a escrita |
| V | A vela latina | **navegar contra o vento** (o vento do mar) | a vela triangular | Engenhar |
| V | O casco de esqueleto | o navio maior e mais barato | as costelas do navio de pé no estaleiro | a quilha |
| VI | O leme de popa | o navio grande que obedece | o leme no meio da popa | o casco de esqueleto |
| VI | A bússola | **navegar com o céu fechado** | a agulha na tigela d'água na mão do piloto | a pedra que aponta o norte |
| VI | A carta do mar | a rota desenhada, com as distâncias | a carta aberta na mesa do capitão | a bússola; o mapa |

### O céu e o tempo

| Era | Descoberta | O que muda | O que se vê | Pede |
|--|-------|------------|-----------|-----|
| I | As fases da lua | o mês contado: a festa no dia certo | as marcas da lua no poste do templo | Observar |
| II | O ano do sol | o gnômon e o solstício: **o dia certo de plantar** | a vara fincada e as marcas da sombra no chão da praça | as fases da lua |
| II | A estrela que avisa | **a estação anunciada** (a cheia, o frio) | o sacerdote no terraço antes do amanhecer | o ano do sol |
| II | O calendário do povo | a lavoura e as festas pelo ano certo | o calendário pintado na parede do templo | a escrita |
| III | O relógio de sol | as horas do dia (o mercado, o tribunal) | o relógio de sol na praça | o gnômon |
| III | As constelações | **o navegador acha o norte de noite** | o mapa do céu no teto do templo | Observar |
| IV | O relógio de água | as horas da noite: a ronda da vigia, a fala medida no tribunal | o vaso que pinga no tribunal e na vigia | a cerâmica |
| IV | A terra redonda | o mapa e o navegador mais certos | o globo na escola do sábio | o triângulo |
| IV | O ciclo dos eclipses | **o eclipse previsto** — o céu ganha eclipses de verdade, pelo ciclo da lua | o eclipse anunciado, a multidão olhando o céu | o calendário; Calcular |
| V | O astrolábio | **a latitude no mar**, a hora de noite | o disco de bronze na mão do astrônomo e do piloto | a trigonometria |
| V | As tábuas dos planetas | o astrólogo da corte (a fama, a política) | o astrólogo da corte com as tábuas | a trigonometria |
| VI | O ano exato | o calendário que não escorrega com os séculos | o calendário novo anunciado na praça | as tábuas dos planetas |

### Os números e a forma

| Era | Descoberta | O que muda | O que se vê | Pede |
|--|-------|------------|-----------|-----|
| I | A contagem | o talho no osso: quantos | os talhos no osso e na vara | — |
| II | O número escrito | a conta do armazém e da troca | os números na tabuinha do armazém | a escrita |
| II | A corda de nós | **o campo medido**: a divisa depois da cheia | a corda de nós esticada no campo, as estacas da divisa | Medir |
| III | A tábua de contas | **o mercador e o cobrador sem erro** | a tábua de pedrinhas na banca do mercador | o número escrito |
| III | As frações | a herança, o saque e a colheita repartidos com justiça | a partilha feita diante de todos | o número escrito |
| IV | O triângulo | a obra no esquadro: **os degraus maiores** | o esquadro e o fio de prumo na mão do pedreiro | a corda de nós |
| IV | A escala | **a planta desenhada antes da obra** (o arquiteto) | a planta riscada no papiro antes da obra | o triângulo |
| IV | A demonstração | o saber que se prova: a escola dos números | o sábio desenhando na areia, os discípulos em volta | a lógica |
| V | O círculo | a cúpula, a roda, **quanto cabe no celeiro** | o compasso, a cúpula riscada | a demonstração |
| V | A trigonometria | **medir de longe**: o monte, o rio, o céu | o instrumento de mirar, medindo o monte | o círculo |
| V | Os juros | o empréstimo (o banqueiro) | a tabela na mesa do banqueiro | a tábua de contas |
| VI | O zero e os algarismos | **a conta grande fácil**: o tesouro do reino | os algarismos novos nos livros de contas | o número escrito; o comércio com quem os tem |
| VI | A álgebra | a herança complicada, a obra, o comércio | o livro de contas do sábio | os algarismos |

### A palavra e o registro

| Era | Descoberta | O que muda | O que se vê | Pede |
|--|-------|------------|-----------|-----|
| I | A marca do dono | o pote e o boi marcados: de quem é | as marcas no pote e no couro do boi | — |
| II | **A escrita (hoje)** | o escriba, a biblioteca, a história guardada | (já se vê) o escriba, a biblioteca | a marca do dono |
| II | A tabuinha e o papiro | o material de escrever — de onde houver argila, de onde houver papiro | as tabuinhas secando, os rolos de papiro | a escrita |
| III | O alfabeto | **mais gente lê**: o escriba mais barato, o recado escrito | as letras nas placas, mais gente lendo | a escrita |
| III | O selo | o contrato em que se confia | o selo de argila e de cera nos fardos e nas cartas | a escrita |
| III | A lei escrita | **a pena igual para todos** (o juiz) | a lei gravada na pedra da praça | a escrita |
| IV | O rolo e a biblioteca | o livro guardado e copiado | as estantes de rolos | o alfabeto |
| IV | A tradução | o saber e o tratado de outro povo | o tradutor ao lado do embaixador | Decifrar |
| IV | A taquigrafia | o discurso escrito na hora (a assembleia, o tribunal) | o escrivão anotando depressa na assembleia | o alfabeto |
| V | O códice | o livro de páginas: dura mais, copia-se mais depressa | o livro de páginas | o pergaminho ou o papiro |
| V | O pergaminho | escrever sem papiro, na pele | as peles esticadas secando no curtume | o curtume |
| V | O catálogo | a biblioteca onde se acha o livro: **a pesquisa anda mais depressa** | as etiquetas nos rolos, o catálogo na entrada da biblioteca | o rolo e a biblioteca |
| VI | O papel | **escrever barato**: mais livros, mais gente que lê | as folhas de papel secando, os livros mais baratos | o comércio com quem o tem |

### O corpo e a cura

| Era | Descoberta | O que muda | O que se vê | Pede |
|--|-------|------------|-----------|-----|
| I | As ervas | o chá, o unguento (a perícia que já existe) | os maços de ervas pendurados | — |
| I | A tala | o osso quebrado que cola direito | o braço na tala | — |
| II | A sutura | **menos morte de ferida** | os pontos na ferida | a agulha de bronze |
| II | A parteira | **menos morte no parto** | a parteira chamada à casa | Curar |
| III | Os humores e a sangria | **o saber errado**: o médico que sangra o doente — até alguém provar o contrário | a tigela de sangue, o doente pálido | Argumentar |
| III | O mel e o vinho na ferida | a ferida que não apodrece | o pano com mel sobre a ferida | as ervas |
| IV | A higiene | a água limpa, a latrina: **a cidade grande com menos doença** | as latrinas, as fontes limpas, gente lavando as mãos | o esgoto |
| IV | A quarentena | **a peste que para** | a casa marcada, o guarda na porta | Observar |
| IV | A amputação | o ferido que vive (com a muleta, que já existe) | o coto enfaixado, a muleta | a sutura |
| V | A anatomia | a cirurgia melhor — e o sacerdote contra | a mesa do médico, os desenhos do corpo | a amputação; Ensaiar |
| V | O hospital | **o soldado ferido que volta** | o pátio de camas com os feridos | a higiene |
| VI | O álcool na ferida | a ferida limpa | o frasco na mala do médico | a destilação |
| VI | Os óculos | **o velho escriba que continua lendo** | os óculos no nariz do velho escriba | o vidro soprado |

### A natureza

| Era | Descoberta | O que muda | O que se vê | Pede |
|--|-------|------------|-----------|-----|
| III | O livro das plantas | o curandeiro e o lavrador sabem mais | o livro com as plantas desenhadas | a escrita; Observar |
| IV | O livro dos bichos | o caçador e o pastor sabem mais | o livro com os bichos desenhados | a escrita |
| IV | A migração sabida | **a temporada de caça e de pesca** ([`natureza-viva.md`](natureza-viva.md)) | o caçador esperando na passagem, no dia certo | Observar |
| V | A seda | **o pano de seda** — o segredo de um povo, e o espião que o rouba | as amoreiras, as bandejas do bicho-da-seda, a roupa de seda que brilha | a amoreira; o bicho-da-seda |
| V | O jardim das plantas | o remédio cultivado perto | os canteiros de ervas junto ao templo da cura | o livro das plantas |

### A terra e os povos

| Era | Descoberta | O que muda | O que se vê | Pede |
|--|-------|------------|-----------|-----|
| II | O itinerário | a estrada contada: quantos dias até lá | o marco de pedra na estrada, com as distâncias | a escrita |
| III | O mapa | o que os viajantes viram, desenhado | o mapa na parede do palácio | o itinerário |
| IV | A crônica | a história escrita (a marca) | o cronista escrevendo os anos | a escrita |
| IV | Os costumes dos outros | o embaixador e o mercador erram menos com o outro povo | o embaixador com os presentes certos | a crônica |
| V | As coordenadas | o mapa certo | a grade sobre o mapa | a trigonometria |
| VI | O mapa do mundo conhecido | **a expedição que vai ao branco do mapa** | o grande mapa, com o branco nas bordas | as coordenadas |

### O pensamento e a lei

| Era | Descoberta | O que muda | O que se vê | Pede |
|--|-------|------------|-----------|-----|
| III | A pergunta da natureza | o mundo explicado sem os deuses: **o começo da filosofia natural** | o sábio olhando a água, a roda de ouvintes | a escrita |
| IV | **A filosofia (hoje)** | as cidades mais leais, a academia | (já se vê) a academia | a pergunta da natureza |
| IV | A lógica | o argumento que se segue: o tribunal e a escola | o debate em passos, os dedos contando os argumentos | a filosofia |
| IV | A retórica | **a assembleia que se convence** (quem governa) | o orador na tribuna, a multidão que se vira | a lógica |
| IV | A ideia da república | **o regime de muitos** (quem governa) | a assembleia votando com pedrinhas na urna | a filosofia |
| IV | O direito | o caso de antes vale para o de hoje: a justiça mais certa | o jurista com os rolos de casos | a lei escrita |
| V | A escola de filosofia | **o sábio formado mais depressa** (Ensinar) | o pórtico com o mestre e os discípulos | a lógica |
| V | A dúvida | **a fé cai onde se pergunta** — e o deus repara (§9) | o filósofo na praça, o sacerdote de cara feia, o templo mais vazio | a escola |
| V | A ética de quem aguenta | o povo e o soldado que aguentam a perda | o soldado calmo na derrota, o velho sereno | a escola |

### A guerra

| Era | Descoberta | O que muda | O que se vê | Pede |
|--|-------|------------|-----------|-----|
| I | A lança e o escudo | a primeira luta organizada | a lança e o escudo de couro | — |
| II | **O arco (hoje)** | o arqueiro no exército e no muro | (já se vê) os arqueiros | — |
| II | O carro de guerra | a carga sobre rodas | o carro de duas rodas com o cavalo e o arqueiro | a roda; o cavalo domado |
| II | O arco composto | **a flecha mais longe** | o arco curvo, de chifre e madeira | o arco; a cola de chifre |
| III | A formação | a turma que luta junta: **menos mortos por luta** | a fileira fechada, os escudos lado a lado | Tática |
| III | A cavalaria | o guerreiro a cavalo | a tropa a cavalo | o cavalo montado |
| IV | O aríete coberto | o portão que cai | o telhado de couro sobre o tronco, contra o portão | a engenharia |
| IV | A cota de malha | a proteção que dobra com o corpo | os anéis de ferro sobre o corpo | o ferro |
| IV | A legião | a formação que se refaz no meio da luta | as fileiras que trocam no meio da luta | a formação |
| V | A besta | **a arma que qualquer um aprende depressa** | a arma de mira com gatilho | Engenhar |
| V | A balista | o cerco de longe | a grande besta de cerco sobre o muro | a engenharia |
| VI | O estribo | **a carga da cavalaria pesada** | o pé no estribo, a lança deitada da carga | a cavalaria; a ferradura |

### A troca e o governo

| Era | Descoberta | O que muda | O que se vê | Pede |
|--|-------|------------|-----------|-----|
| II | A balança e os pesos | **a troca honesta** (menos fraude) | a balança de dois pratos na banca | Medir |
| III | **A moeda (hoje)** | o mercado, a rota que rende mais | (já se vê) as moedas | o ouro fundido; o selo |
| III | O contrato | a dívida escrita (o fiado do taverneiro) | a tabuinha selada entre os dois | a escrita |
| IV | O cambista | as moedas de dois povos trocadas na feira | a mesa do cambista na feira, com moedas de vários povos | a moeda |
| IV | O censo | **o imposto certo** (quem governa) | o recenseador de porta em porta com as tabuinhas | o número escrito |
| IV | O correio do rei | **a ordem e a notícia correm** (os mensageiros a cavalo) | o mensageiro a cavalo, a posta com cavalos frescos | o cavalo montado; a estrada |
| V | O banco | o depósito e o empréstimo | a mesa do banqueiro, o cofre | os juros |
| V | O seguro do mar | o mercador arrisca o navio | o contrato do navio assinado no porto | o banco |
| VI | A letra de câmbio | **comerciar longe sem levar o ouro** | a carta selada no lugar do saco de ouro | o banco |

**A conta:** **187 descobertas** em catorze ramos e seis eras, cada uma com o que muda e com o que se vê, **mais os achados de cada ofício** (a seguir) — contra as dez
artes de hoje.

### Os achados (as invenções pequenas, de cada ofício)

Cada patch de ofício traz **de cinco a quinze achados** — pequenos, com causa, nascidos de quem faz o ofício: **o anzol farpado**, a
rede de malha fina e a armadilha de cesto (o pescador); **a escora em quadro** e a lamparina fechada (o mineiro); **o fole duplo** e a
lima (o ferreiro); a quilha nova (o carpinteiro naval); **a receita nova** (o cozinheiro, o cervejeiro); **o nó novo** (o marinheiro);
a sela com arção (o cavalariço); o fio de prumo (o pedreiro). **O achado tem nome:** quem o fez, a cidade, o dia — e o título de
inventor.

### Como os efeitos e o que se vê chegam ao jogo

**O catálogo é o mapa; os efeitos e o que se vê chegam por partes.** O patch do saber (§15) faz o motor, o registro e os efeitos que mexem no que
o jogo já tem; **cada patch depois implementa as descobertas do seu ramo** — a terra, as da lavoura; o porto e o navio, as do mar; a
oficina, as do fogo; a guerra, as da guerra. Uma descoberta só entra no jogo **com o seu efeito de verdade, com o que se vê e com a sua prova**;
até lá, ela fica no catálogo — nunca no jogo como nome sem efeito, nem como efeito sem nada à vista.

## 5. Como se descobre (o motor do mundo, sem o jogador)

1. **Os problemas do povo.** O mundo já guarda os problemas de verdade de cada povo: a fome, a guerra perdida (e para quem: o ferro
   do inimigo), a cheia, a pedra que não sobe à obra, a peste, os navios perdidos no mar. **Eles apontam a pesquisa.** O gosto de cada
   povo continua como um peso (o romano pende para as obras, o grego para o pensamento e o mar, o egípcio para o céu e as obras) — a
   ordem fixa de hoje vira gosto.
2. **Quem pesquisa.** Os sábios (os ofícios do §14) e **os artesãos no próprio ofício**. Cada um trabalha numa pergunta: as noites de
   observação, os ensaios na oficina, **as leituras e as cópias da biblioteca** (o dia dela, enfim, conta). O avanço vem da perícia, do
   lugar, do material e **dos livros que há** (o saber de antes).
3. **A centelha.** A descoberta acontece com causa: o avanço que se juntou e, às vezes, **o acaso que o mundo deu** (o forno do oleiro
   aceso perto do minério de cobre, a pedra que caiu e mostrou o veio) — pelo acaso do mundo (`G.R`), no passo do mundo.
4. **O registro.** **Uma descoberta não ensinada nem escrita morre com quem a fez.** Ensinada (mestre e aprendiz,
   [`oficios-fundacao.md`](oficios-fundacao.md) §2.5) ou escrita (o livro, que vai à biblioteca e é copiado), ela fica.
5. **A arte chega ao povo.** Quando as descobertas de uma arte estão vivas nas suas cidades — em pessoas e em escritos —, a arte é do
   povo, e as portas de hoje abrem.
6. **A difusão, com quem leva.** Entre povos, o saber anda com pessoas: o mercador, o cativo artesão, o viajante, o livro vendido, o
   emissário. **O segredo guardado** (o vidro de uma cidade, a liga de outra) é um saber que o povo esconde — e que o espião pode roubar.
7. **A perda, com causa.** O sábio morto na guerra, a biblioteca queimada (o fogo que já existe), a cidade saqueada, o último mestre que
   morre. **O saber de muitas mãos** (o bronze que todo ferreiro forja, a roda de toda carroça) **dura enquanto o povo dura**; **o saber
   de poucos** (a escrita, a filosofia, a engenharia, as ciências) **pode se perder** quando os que sabem e os escritos se vão. Perdida a
   arte, a porta fecha de novo: o que está de pé fica, mas não se ergue outro — até alguém achar de novo, ou achar o livro.
8. **O ritmo.** Cada descoberta pede mais que a anterior — o saber de antes, mais gente sabida, o lugar, o material, **a cidade grande
   que sustenta quem só estuda** (a era V pede cidades grandes; a VI, povos grandes com escolas). **Uma vida de sábio faz uma a três
   descobertas de verdade**; um povo da frente acha, em média, **uma descoberta a cada cinco a dez anos** — e no mundo inteiro, com
   vários povos, as perdas e os caminhos diferentes, **há sempre alguém descobrindo alguma coisa até o ano 1000**.

## 6. Como o corpo vive o saber (o laço de jogo)

O saber **usa o mundo de verdade do jogo**: o sol que anda, **a lua com as suas fases**, as estrelas que giram em volta do polo, as
quatro estações, a maré, o peso das coisas, as receitas da origem. **O jogador não lê uma árvore de tecnologia — ele observa, mede,
ensaia e prova.**

| O que se faz | Como se joga | O que se ganha |
|----|------------|-------|
| **Observar** | a noite inteira no telhado ou no morro: anotar a lua e as estrelas na tabuinha, noite após noite; **a vara no chão** (o gnômon) e a sombra ao meio-dia, dia após dia; o bicho que volta | o padrão achado: **o ano contado**, a fase prevista, a estação anunciada |
| **Medir** | **a corda de doze nós** que faz o ângulo reto; a sombra da vara contra a sombra do obelisco (**a altura pela sombra**); a balança; o relógio de água; o campo depois da cheia | a medida certa: a divisa justa, a altura da obra, o peso honesto |
| **Ensaiar** | **mudar uma coisa de cada vez**: o braço da alavanca, o número de polias, a parte de estanho na liga, a areia e a cinza do vidro; o modelo pequeno antes da máquina grande; anotar | a máquina que funciona, a liga boa, o vidro claro — e **o fracasso que ensina** (a leitura diz por quê) |
| **Misturar** | a liga, o vidro, a tinta, o remédio — **a combinação livre da cozinha** ([`cozinha.md`](cozinha.md)) aplicada ao fogo e às ervas | a receita nova, com nome |
| **Ler, copiar, comparar** | na biblioteca: o que outros escreveram, o livro de outro povo (Decifrar, Letras), a tabela antiga | o saber de antes, sem refazer |
| **Ensinar e debater** | **a escola**: os discípulos (a máquina do grupo); **o debate na praça** contra o rival (a índole, a fama); **a prova pública** diante do rei: o eclipse anunciado, a máquina que ergue a pedra | o discípulo que continua, a fama, **o patrono** |
| **Escrever** | o livro — **uma marca** ([`marcas.md`](marcas.md)) | **o seu nome na descoberta**, quinhentos anos depois («o teorema de {nome}»); o livro achado pelo arqueólogo |

### Os grupos de pesquisa (o pedido do dono)

**Pesquisar em grupo** é a máquina do grupo ([`grupos.md`](grupos.md)) com os papéis do saber:

- **O projeto:** uma pergunta grande, com um patrono que paga e cobra — **o calendário novo do rei**, **a máquina para o cerco**, **o
  aqueduto que cruza o vale**, **a cura da febre do pântano**, **o mapa da costa até o fim**.
- **Os papéis:** o mestre (que guia), o observador das noites (cada um com a sua parte do céu), quem calcula, **o artesão que monta
  o modelo**, o copista, quem colhe as ervas ou os bichos, o viajante que traz o livro de longe.
- **As ordens e as situações:** «mede de novo», «anota tudo», «esse ensaio de novo»; **a corrida contra a escola rival** (quem
  descobre primeiro leva o nome), o patrono impaciente, o membro que vende o segredo, a noite nublada que estraga a série.
- **O jogador em qualquer lugar:** encarnado no mestre, no discípulo, no artesão ou no patrono — **e responsável, ou um dos
  responsáveis**, pela descoberta.
- **O crédito:** a descoberta leva o nome de quem a fez — **ou de quem a assinou**: o mestre que leva a glória do discípulo, o
  discípulo que se revolta, o nome dividido. O registro guarda quem fez de verdade (a verdade fica no mundo); a fama, quem a cidade
  acredita (os boatos).

**As recompensas:** a descoberta com o seu nome; o título; **a mudança no mundo que se vê** (o aqueduto erguido por causa do seu
arco, a cidade que não passa mais fome por causa do seu calendário); a fama; o patrono; a escola que continua depois de você.

**Os riscos:** **a perseguição** (o filósofo que pergunta demais sobre os deuses e o rei — a cicuta: o juiz e o carrasco); o rival que
rouba a ideia; **o patrono que quer armas** (a máquina de guerra para o cerco); a biblioteca que queima com o trabalho de uma vida; o
ensaio que fere ou envenena (o mercúrio do alquimista); **a previsão que falha em público** (a fama que cai).

## 7. As perícias novas (o grupo «O saber»)

Oito perícias novas; **Letras** (ler e escrever), **Decifrar** (a escrita que ninguém mais lê), **Navegar** (as estrelas do mar),
**Ler o tempo** e **Ervas**, que já existem, entram no saber também. Cada perícia tem **o olho de quem sabe** ([`leitura.md`](leitura.md)):
quanto mais alta, mais o mundo se deixa ler.

| Perícia | O que é | As técnicas (exemplos) | O olho de quem sabe |
|----|---------|---------|-------|
| **Observar** | o olho paciente: o céu, a natureza, o que se repete; a anotação de cada noite | A noite inteira · O gnômon · As fases da lua · A estrela antes do sol · O caderno do céu · O bicho que volta | o aprendiz vê «estrelas»; o mestre vê a que nasceu mais cedo hoje |
| **Medir** | o tamanho, o peso e o tempo das coisas: a corda, a vara, a sombra, a balança, o relógio de água | A corda de doze nós · A altura pela sombra · A balança de dois pratos · O relógio de água · A groma (as retas do campo) · O passo contado | vê a obra torta antes de ela subir |
| **Calcular** | os números e a forma: da tábua de contas à demonstração | A tábua de contas · A regra de três · O triângulo e o círculo · A demonstração · A tabela pronta · O número grande | a conta errada salta aos olhos |
| **Ensaiar** | o experimento: tentar, variar uma coisa de cada vez, anotar, repetir | Uma coisa de cada vez · O caderno do ensaio · O modelo pequeno · A repetição · O fracasso que ensina | sabe por que deu errado, não só que deu |
| **Engenhar** | projetar a máquina e a obra antes da madeira e da pedra | A alavanca e o apoio · A polia e o guindaste · O parafuso de água · O arco e a cimbra · A roda d'água · O plano desenhado | vê onde a viga vai ceder |
| **Argumentar** | a lógica, a pergunta, a prova, a refutação e a fala que convence — do filósofo ao advogado | A pergunta que desmonta · O argumento em passos · A refutação · O exemplo que convence · Falar à assembleia | ouve o furo no argumento do outro |
| **Ensinar** | passar o saber: a lição, o discípulo, a escola — quanto do que se sabe chega ao outro | A lição pelo exemplo · O discípulo certo · A escola · O livro que ensina sozinho | sabe o que o aluno não entendeu |
| **Curar** | o corpo e a cura: olhar o doente, a ferida, o osso, a febre, o parto | Olhar o doente · O osso no lugar · Fechar a ferida · A febre e o repouso · O parto difícil · A quarentena | vê a febre antes de ela subir |

**Quem usa cada uma** (além dos ofícios do §14): Medir e Calcular, o construtor e o arquiteto, o mercador (a balança), o cobrador;
Observar, o navegador, o caçador, o lavrador; Engenhar, o construtor, o estivador (o guindaste), o soldado do cerco; Argumentar, quem
governa, o juiz, o advogado; Ensinar, todo mestre de todo ofício; Curar, o curandeiro, a parteira, o barbeiro, o soldado ferido.

## 8. Os lugares e o dinheiro do saber

- **Os lugares:** **a escola** (qualquer casa com mestre e discípulos), **a biblioteca** (que já existe, com o dia dela contando —
  e a grande biblioteca, com o dobro), **a academia** (o nome grego dela, que já existe), **o observatório** (o terraço do templo, a
  torre — o céu precisa de altura e de horizonte), **a oficina do engenheiro**, **o templo da cura** (onde os doentes dormem), e, tarde,
  **o museu** (a casa dos sábios, à moda de Alexandria).
- **Quem paga o sábio** ([`economia-oficios.md`](economia-oficios.md)): **o patrono** (o rei, o templo, a cidade, o rico), os discípulos
  que pagam a escola, o livro vendido, **a encomenda** (o rei quer a máquina de guerra; o templo, o calendário; a cidade, o aqueduto), o
  prêmio da cidade.
- **O tempo livre:** os sábios saem da gente do povo, pelo repartidor de ofícios — **um povo com fome não sustenta sábios**; a fome
  os manda de volta ao campo.

## 9. O saber e o deus (conferido — e pertinente)

- **A Inspiração** (que já existe: o sonho que revela o segredo) **passa a cair numa pessoa**: o sonhador acorda sabendo — e tem de
  ensinar ou escrever, ou o sonho morre com ele.
- **O eclipse do deus e o eclipse do astrônomo:** o Sinal nos Céus (que já existe) apaga o sol ao meio-dia; **o astrônomo que não o
  previu** perde a fama — ou diz que foi o deus. O povo que sabe o céu teme menos o sinal; o que não sabe, mais.
- **O filósofo que duvida dos deuses** faz cair a fé de quem o ouve — e **o deus pode fulminá-lo**, fazendo dele um mártir (a ideia
  dele ganha fama). Um laço inteiro entre o saber e a fé, visto de cima.
- **A biblioteca que o raio queima** leva séculos de saber de um povo (a idade das trevas que o deus pode causar), e **a Praga** encontra
  os médicos e a quarentena.
- **De cima, o deus vê o mapa inteiro** que os cartógrafos do povo ainda não desenharam.

## 10. As falas, as animações, as interações, o grupo, as marcas e a leitura

**Os assuntos novos:** a descoberta nova, o sábio que chegou, o eclipse anunciado, a máquina que o rei viu, a biblioteca que queimou,
o filósofo preso, o remédio novo, o segredo roubado.

**As falas** (exemplos):
- (o lavrador) «O sábio diz que a cheia vem quando aquela estrela aparece antes do sol. Ano passado ele acertou.»
- (o discípulo) «Mestre, se a sombra da vara é metade da vara, a da pirâmide também é metade da pirâmide?»
- (o rival, na praça) «Ele não sabe nada. Só pergunta.»
- (o sacerdote) «O céu é dos deuses. Quem o mede, o ofende.»
- (o rei) «Quero uma máquina que derrube aquele muro. Para ontem.»
- (o ferreiro velho) «Um de estanho para nove de cobre. Meu mestre me disse, e o mestre dele a ele.»
- (o viajante) «No outro povo o vidro é claro como a água. Ninguém diz como fazem.»
- (a viúva, depois do fogo) «Trinta anos de livros. Viraram cinza numa noite.»

**As animações:** olhar o céu deitado no telhado, **marcar a tabuinha** (o estilete), fincar a vara e marcar a ponta da sombra,
esticar a corda de nós com um ajudante, **a tábua de contas** (as pedrinhas), desenhar na areia com a vara, montar o modelo pequeno,
pesar na balança, **o gesto do debate** (a mão que conta os passos do argumento), ensinar apontando, ler junto à lamparina, examinar o
doente, pôr o osso no lugar.

**As interações:** observar (o céu, a sombra, o bicho — E segurado, a vigília); medir (a corda, a sombra, a balança); ensaiar (na
bancada da oficina); consultar o livro (na biblioteca); escrever o que se achou; **demonstrar** (diante de quem se escolher: o rei, a
assembleia, o rival); ensinar (o verbo social que chama o discípulo); debater; examinar o doente.

**O grupo** ([`grupos.md`](grupos.md)): **a escola** — o mestre e os discípulos (os papéis: o mestre, o discípulo, o copista; as
ordens: «anota», «mede de novo», «segura a corda»; as situações: a prova pública, o rival na praça, a perseguição); **a expedição do
saber** — o naturalista e o cartógrafo com o mateiro e o navegador.

**As marcas** ([`marcas.md`](marcas.md)): **o livro**, **a descoberta com nome**, **o instrumento** (a esfera de bronze achada no fundo
do mar séculos depois), a escola que leva o nome do mestre, o mapa; e **o saber perdido como tesouro** do passado.

**A leitura** ([`leitura.md`](leitura.md)): **o saber é a própria leitura feita jogo** — por que o ensaio falhou (o braço curto demais,
o estanho de menos), por que a previsão errou (a nuvem, a conta), por que o rei não acreditou (a fama, a prova fraca). E **o olho de
quem sabe** de cada perícia (§7).

## 11. As regras (o contrato da base)

1. **Todo saber tem dono e causa:** cada descoberta e cada achado têm quem os fez, onde, quando e por quê, no registro do saber — que
   só o arquivo do saber escreve (proposta: `js/saber.js`, `G.Saber`), dentro do passo do mundo.
2. **As portas de hoje continuam as portas:** os dezoito arquivos continuam perguntando «o povo tem a arte?» (`G.Civ.has`); o que muda é
   como o povo chega lá. **Ninguém escreve a arte de um povo à mão** fora do saber.
3. **Nunca pela contagem de gente:** o avanço vem de quem pesquisa, do lugar, do material e dos livros.
4. **Entre povos, só com quem leva** — nunca por sorteio entre povos.
4b. **Toda descoberta chega com o que se vê** (§4b): a coisa no mundo, nas duas vistas, com a sua causa — nunca só um número.
5. **O material vem da origem:** o instrumento de bronze só onde há bronze, o papiro de onde há papiro (D-440).
6. **A aparência e o povo nunca decidem quem é sábio:** a índole (a curiosidade, a paciência), a prática e a vida, sim; o gosto do
   povo é da instituição, como manda o contrato da sociedade.
7. **A mesma causa nos três níveis:** o salto, o passo e o corpo descobrem igual; o mundo sem o corpo é o mesmo.
8. **O load não decide nada:** o save guarda o registro; um save de antes abre com as artes que tinha, guardadas **pela tradição** do
   povo (§12).

## 12. A ponte com o que já existe

**É uma reforma da base, como o calendário** — por isso vai por fases e com a prova de equivalência:

- **As dez artes ficam, nos anos de hoje** (eras II a IV), e passam a ter as suas descobertas; **o catálogo novo (§4b) enche os
  séculos seguintes** — cada descoberta entra no jogo só com o seu efeito de verdade.
- **A ordem fixa de cada povo** vira o gosto dele; **o mar que chama** a navegação continua, como necessidade.
- **O sorteio entre povos** vira o saber levado por gente; **o sonho do deus** vira o sonhador.
- **Os saves de antes:** as artes que o povo tinha ficam como **tradição** (o saber do povo inteiro, que não se perde enquanto o povo
  dura); o registro começa dali.
- **A prova de equivalência:** com o motor novo e sem os extras, **as mesmas sementes dão as mesmas artes em anos parecidos aos de
  hoje** (o ano de cada arte de cada povo, dentro de uma faixa), a mesma gente, a mesma guerra. Só depois entram a perda, os achados e
  as artes novas.

## 13. As provas

- **As invariantes:** toda arte conhecida tem quem a guarde — pessoa, escrito ou tradição (S1); toda descoberta tem quem a fez, o
  dia, o lugar e a causa (S2); ninguém guarda o saber de um material que o povo nunca teve (S2); o saber entre povos só com quem levou
  (S2).
- **Os cenários:** o mestre que morre sem aprendiz; a biblioteca que queima; a cidade que cai com o último sábio; o save no meio de
  uma pesquisa; o sonho do deus no sonhador que morre na mesma noite; o corpo que descobre; dois povos que descobrem a mesma coisa
  cada um por si; o cativo artesão que leva a liga ao povo que o levou.
- **As regras do guard:** o registro do saber só o arquivo do saber escreve; nenhuma arte posta à mão; nenhum avanço pela contagem de
  gente.
- **Os medidores:** o ano de cada arte em cada povo (a faixa de hoje, na fase 1); as mortes de parto e de ferida (a medicina); a
  fome (o calendário e a rotação); quantas artes se perderam em mil anos, e por quê.
- **O teste do dono:** uma noite de observação, uma prova pública diante do rei — horas sem enjoar.

## 14. Os ofícios que nascem dele

A lista tinha **o sábio** (o filósofo, o astrólogo, o cartógrafo), **o escriba** e **o curandeiro**. A base pede mais fundura — **os
seis ofícios do saber, aprovados pelo dono** (20/11/2026; cada um terá o seu documento):

| Ofício | O laço de jogo (por que aguenta horas) | A perícia principal |
|------|-------------|----|
| **O filósofo** | a pergunta, a escola, o debate na praça, **o perigo** (o rei e os deuses), a ideia que muda a cidade e o regime | Argumentar |
| **O astrônomo** (com o astrólogo, como era) | a vigília, o padrão achado, **a previsão que acerta ou falha em público**, o calendário do povo, o eclipse | Observar |
| **O engenheiro** (com o mecânico e o geômetra) | **projetar e ver funcionar**: o guindaste, a roda d'água, o aqueduto, a máquina de cerco; o modelo pequeno, a falha, a obra | Engenhar |
| **O médico** | o doente que chega, **o diagnóstico pelo que se vê**, a ferida, o osso, a febre, a peste e a quarentena — a vida nas mãos | Curar |
| **O naturalista** | **a expedição**, o bicho e a planta documentados, o livro dos bichos (com a natureza viva e o olho da natureza) | Observar |
| **O alquimista** (tardio) | **a mistura**, o segredo, o ouro sonhado, o vidro, a tinta, o perigo do ensaio | Ensaiar |

**Os ramos e os títulos** (não aguentam horas sozinhos, mas vivem dentro dos ofícios):
- **o matemático** — o sábio dos números: **ramo do engenheiro e do astrônomo**, com «o teorema de {nome}» como título (a matemática
  pura, sozinha, é difícil de fazer divertida no corpo; dentro da medida, do céu e da obra, é ótima);
- **o cartógrafo** — ramo do naturalista e do navegador (o mapa do povo);
- **o inventor** — **título de qualquer um** que fizer um achado, de qualquer ofício;
- **o mestre-escola** e **o tradutor** — dentro do escriba;
- **o curandeiro** continua o curador do povo (as ervas, a parteira, o barbeiro); **o médico** é o ofício fundo da cura.

**A conta da lista:** **o sábio sai e entram os seis** — de 78 para **83 ofícios** (aprovado, 20/11/2026: «não precisa enxugar»).

## 15. Quando entra

O saber pede **as pessoas** (o Patch 23: a memória, as marcas para o livro), **o calendário** (o céu e o ano) e **a máquina das perícias**
(o Patch 25). E os patches das mãos (a terra, a mina, a oficina) **precisam dele já de pé**, para trazer as suas descobertas e os seus
achados em vez de remendar depois. Por isso:

- **«Sa — O saber»: um patch da base, depois do 27 e antes da terra (28)**, em fases (Sa, para não confundir com as fases S do
  subterrâneo):
  1. **Sa1 — o registro e a ponte:** o registro, as dez artes com as suas descobertas, quem pesquisa, a prova de equivalência;
  2. **Sa2 — a necessidade e a perda:** os problemas do povo guiando a pesquisa, o saber levado por gente, a perda com causa, o
     segredo;
  3. **Sa3 — o corpo descobre:** observar, medir, ensaiar, misturar, demonstrar; os achados; as perícias novas;
  4. **Sa4 — os lugares e o dinheiro:** a escola, o observatório, o patrono, a encomenda.
- **Cada patch depois traz os seus achados e as descobertas do seu ramo** com o efeito de verdade (a terra, as da lavoura; o porto e o
  navio, as do mar; a oficina, as do fogo; a guerra, as da guerra; o anzol farpado da pesca, a escora da mina).
- **Os ofícios do saber** (o filósofo, o astrônomo, o engenheiro, o médico, o naturalista, o alquimista) **no Patch 38**, «A fé, o saber
  e o passado» — o engenheiro talvez antes, com a oficina (32), se o dono preferir.

## 16. O estado

**Aprovado pelo dono** (20/11/2026): a base, **os seis ofícios**, **a expansão do catálogo** («tem que render até o ano 500, até o ano
1000»), os grupos de pesquisa, o saber que se perde, o saber errado, nenhum povo chegando a tudo. **O teto** (decidido): até a beira da pólvora — o saber da era antiga; **toda descoberta com o que se vê** (o pedido do dono, 20/11/2026).
