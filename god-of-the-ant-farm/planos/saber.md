# O saber — a base da descoberta, da pesquisa e da técnica (proposta, 20/11/2026)

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
ferreiro, o vidreiro, o tintureiro, o perfumista) e, no fim, **a alquimia**. O jogo usa os nomes da época:

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
5. **O material vem da origem:** o instrumento de bronze só onde há bronze, o papiro de onde há papiro (D-440).
6. **A aparência e o povo nunca decidem quem é sábio:** a índole (a curiosidade, a paciência), a prática e a vida, sim; o gosto do
   povo é da instituição, como manda o contrato da sociedade.
7. **A mesma causa nos três níveis:** o salto, o passo e o corpo descobrem igual; o mundo sem o corpo é o mesmo.
8. **O load não decide nada:** o save guarda o registro; um save de antes abre com as artes que tinha, guardadas **pela tradição** do
   povo (§12).

## 12. A ponte com o que já existe

**É uma reforma da base, como o calendário** — por isso vai por fases e com a prova de equivalência:

- **As dez artes ficam** e passam a ter as suas descobertas; artes novas entram só com o motor de pé (o vidro, o arco de pedra, o
  calendário, a medicina, o alfabeto…).
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

A lista aprovada tem hoje **o sábio** (o filósofo, o astrólogo, o cartógrafo), **o escriba** e **o curandeiro**. A base pede mais
fundura — **a proposta** (para o dono decidir; cada um terá o seu documento):

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

**A conta da lista:** **o sábio sai e entram seis** — de 78 para 83 ofícios. **O dono decide** quais entram (todos, ou só os mais
fortes: o filósofo, o astrônomo, o engenheiro e o médico).

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
- **Cada patch depois traz os seus achados e as suas descobertas** (o anzol farpado da pesca, a relha do arado da terra, a escora da
  mina, o vidro da oficina).
- **Os ofícios do saber** (o filósofo, o astrônomo, o engenheiro, o médico, o naturalista, o alquimista) **no Patch 38**, «A fé, o saber
  e o passado» — o engenheiro talvez antes, com a oficina (32), se o dono preferir.

## 16. O estado

**Proposta** (20/11/2026), feita a pedido do dono. Espera a aprovação do desenho e a decisão sobre os ofícios do §14.
