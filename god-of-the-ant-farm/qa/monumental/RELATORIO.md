# A Arquitetura Monumental — relatório de entrega

> Escrito para quem não programa. **Provado** quer dizer que há uma prova que roda de verdade e que o resultado está
> anotado aqui. **Parcial** quer dizer que funciona em parte, e o texto diz qual parte. O que não foi feito está dito.
> O pedido está em `qa/monumental/PEDIDO.md` (o §18 pede estes 13 itens, nesta ordem). O diagnóstico está em
> `DIAGNOSTICO.md`, o plano em `PLANO.md` e o briefing da equipe em `EQUIPE.md`, na mesma pasta. Cada defeito, limite
> de teste e decisão está em `qa/AUDIT.md`, seção 17.
> A página com as fotos é o artefato do relatório (o link está no fim).

O dono pediu, em 4/11, que os prédios públicos e monumentais tivessem a escala da sua função, por fora e por dentro e nas
duas vistas, com consequência na simulação: o Coliseu, os palácios, as pirâmides, os templos, os teatros e a taverna.
Também pediu que a casa pequena continuasse pequena: «escala arquitetônica coerente, diversidade, identidade e
monumentalidade», sem «gigantismo indiscriminado». Este patch veio antes dos Bairros Vivos (D-105), porque o tamanho dos
prédios muda o desenho das cidades que os bairros leem.

**364 commits desde o pedido (`1cd85d3`).** Cinco especialistas trabalharam em paralelo, cada um no seu ramo, e o líder
juntou, conferiu e publicou.

## 1. O diagnóstico original

Antes de mexer em qualquer coisa, o líder mediu o jogo como ele estava (`DIAGNOSTICO.md`, no código do fechamento do
Patch 2 e nos mundos da geração 13). Os prédios tinham sido desenhados na **escala do ícone da visão do deus**: cada tipo
ocupava de 1 a 5 casas do mapa, e cada casa tem 4 m. As pessoas, as portas, os móveis e os degraus já estavam em escala
real, com o corpo de 1,75 m. Por isso uma pessoa diante do «Coliseu» estava diante de um prédio de 11,6 m com uma arena de
4 m.

| Prédio | Como era | O maior espaço de dentro |
|---|---|---|
| Coliseu (a maravilha romana) | 12 × 12 m, 13,8 m de alto | a arena: 4 m de diâmetro |
| Grande Pirâmide | 12 × 12 m e 24,3 m de alto: 78° de inclinação, uma agulha (a de Gizé tem 52°) | uma esplanada de 12 × 1,2 m |
| Palácio | 12 × 12 m | o trono: 9,7 × 3,8 m |
| Templos | 8 × 8 m | naves de 3 × 3 a 5,5 × 4 m; de 0 a 6 lugares de rezar |
| Teatro grego | 12 × 12 m, 3 m de alto | 87 espectadores |
| Taverna | 8 × 8 m | um salão de 6 × 3,7 m: uma mesa e meia |
| Cabana, casa, sobrado | 4 × 4 m | cômodos de 3,4 × 3,4 m |

Nenhum espaço passava de 6,5 m de pé-direito e quase não havia corredores. Nada ligava o tamanho do prédio ao tamanho da
cidade, a não ser a escada dos três palácios. E havia terra: Mênfis, a maior cidade da megalópole, com 322 pessoas, cobria
só 12% da sua área com prédios.

## 2. As causas técnicas

1. **A pegada era uma tabela fixa por tipo** (`G.BDEF`). Todo templo tinha 8 m e todo teatro 12 m, tanto no povoado de 15
   pessoas quanto na capital de 322.
2. **A forma era uma só por tipo e povo** (`G.Forma.of(type, style)`, guardada por `tipo:povo`). Não existia «templo
   pequeno» e «templo grande» do mesmo povo: a arquitetura não sabia o que era tamanho.
3. **As formas nasceram do desenho do deus** (`arch.js`). As medidas vinham de um ícone feito para ser lido em 2 ou 3 casas
   do mapa; daí a arena de 4 m e a pirâmide-agulha.
4. **O lote é sempre quadrado** (todos os 56 tipos). Esse limite ficou e foi respeitado: o oval, o comprido e as alas cabem
   no quadrado, com pátio, praça ou recinto em volta.
5. **O planejador não pedia terreno grande** (`V.findSite`), e nada guardava terra para um monumento.
6. **A lotação vem dos lugares da planta** (`In.places`, D-085). Isso estava certo e ficou; só que as plantas pequenas
   davam poucos lugares.

## 3. Os sistemas e os arquivos modificados

Do pedido até aqui: **364 commits, 155 arquivos do jogo e das provas (fora as fotos), 17.264 linhas acrescentadas e 1.702
tiradas.**

**Os arquivos novos do jogo:**
- `js/escala.js` (`G.Escala`, D-106): a escada de tamanhos de cada tipo, o que a cidade precisa ter para cada degrau,
  quanto custa e quanto demora. É pura: não escreve no mundo nem tira do acaso.
- `js/forma-espetaculo.js` (M1): as formas grandes do espetáculo e das maravilhas. São o Coliseu (D-107), a Grande Pirâmide
  (D-108), os teatros de cada povo (D-109), o campo de bola, Valhala, a Acrópole, o zigurate, o Templo Mayor e o grande
  monumento.
- `js/forma-poder.js` (M2): as formas grandes do poder e da fé. São os palácios de pátios (D-110, D-111) e os templos de
  cada povo (D-112, D-123).

**Os arquivos que mais mudaram:**
- `village.js`: a cidade escolhe o degrau, acha a terra ou abre espaço, guarda o lote, amplia e paga a obra (D-115, D-116,
  D-117, D-120, D-121).
- `build3d.js`: o 3D desenha pela forma em qualquer tamanho (D-118).
- `arch.js` e `render.js`: o deus pinta o prédio pela forma, na ordem certa entre as pessoas (D-113, D-114).
- As plantas de dentro: `interiors.js`, `int-catalogo.js`, `int-monumentos.js`, `int-palacio.js` e `int-familias.js`.
- `space.js`: a porta e a entrada dos prédios grandes.
- `court.js`: os palácios e a audiência (D-124).
- `cam3d.js`: a câmera nos espaços grandes (D-119).
- `act-lazer.js` e `festivals.js`: o espetáculo enche a plateia (D-122, D-130).
- `forma.js`: a forma sabe o tamanho.

**As provas novas:**
- `monumental.js`: os testes de aceitação A a H do pedido.
- `monumental-poder.js` e `visual/monumental.js`: o I, o 3D, a câmera, o corpo, o desempenho e as fotos.
- `visual/forma-deus.js` e `forma-deus-fotos.js`: o deus pela forma.
- `escala.js`: o cenário da escala, com os casos ruins.
- `lote-bolsao.js`, `retirada.js` e `fera-rara.js`.
- Três verificadores novos, ligados ao `qa.js` pelo `junta-inv.js`: `escala-inv` (o lote, a forma e a planta do mesmo
  tamanho; o degrau é um da escada), `monumental-inv` e `poder-inv`.

**As regras novas da vigia do código** (`qa/guard.js`):
- 42: o degrau e o lote (`b.esc`, `b.w = b.h = n`) só o `village.js` escreve.
- 43: a escala é pura.
- 44: o deus desenha o prédio do tamanho dele.
- 45: todo arquivo do jogo se lê, sem erro de sintaxe.
- 46: as marcas do quadro numa pessoa são do desenho (L-589).
- 47: a retirada de um bando tem uma porta só, `G.War.retreat` (L-647).

## 4. A arquitetura da solução

Antes de os especialistas começarem, o líder fixou um contrato no código, sem mudar nada que se visse (D-106, commit
`f422ac3`). Com ele, cada um trabalhou sem precisar ler o código dos outros:

1. **A escala** (`G.Escala`). Cada tipo tem uma escada de degraus: o lado do lote, o que a cidade precisa ter (nível, gente,
   técnica) e quanto custa e demora (`Es.billOf`, `V.workOf`). A mesma cidade escolhe sempre o mesmo degrau.
2. **O prédio guarda o seu degrau** (`b.esc`) e o seu lote. Um prédio de um save antigo fica do tamanho que tinha: nada se
   refaz ao carregar.
3. **A cidade experimenta os degraus** (`V.startProject`), do maior que ela justifica e pode pagar para o menor, e o
   primeiro que acha terra fica. A capital apertada ergue um templo menor que a folgada: a escala sai do mundo, não de uma
   tabela (D-140).
4. **A forma sabe o tamanho** (`G.Forma.of(type, style, n)`). As formas antigas são o degrau clássico; os degraus novos têm
   formas próprias, registradas por `Fo.def` nos arquivos novos. **Registrar a forma de um tamanho é o que liga o
   degrau**: a cidade só oferece um degrau que o povo sabe erguer (`Es.can`).
5. **Uma definição para as duas vistas.** O deus pinta o prédio a partir da mesma forma que o 3D constrói e que a planta lê
   (D-113): o que o deus vê, o corpo pisa.
6. **A planta lê a forma no tamanho do prédio** (`In.formType`, `rec.n`). Os assentos, os lugares de rezar e as mesas são
   lugares da planta, e a lotação cresce sozinha com o prédio.
7. **A ampliação no lugar** (D-116). A cidade que cresceu amplia o seu monumento: o mesmo prédio, o mesmo nome e um fato
   novo no registro e na crônica.
8. **A terra** (D-115, D-120, D-121, D-127). O desnível do lote vira pódio de pedra (até 3 m pela regra da cidade; a forma
   cobre até 4,5 m). A cidade abre espaço para a obra grande: muda campos de lugar e realoja famílias de casas baixas. Nunca
   toca em prédio público nem nas duas últimas fazendas, e sempre traz mais camas do que tira. A capital que vai precisar
   de uma obra grande guarda o lote, desenhado com estacas e corda.
9. **As regras do corpo valem em qualquer tamanho** (`In.BODY`, D-088): degrau de no máximo 30 cm, porta de pelo menos
   2,2 m, parapeito onde a queda passa de 1 m, assento de 40 a 45 cm. Crescer o prédio nunca cresce o degrau nem a porta de
   gente.

As três decisões que o dono deixou ao líder (D-102 a D-104) foram feitas neste patch:
- o teto dos ofícios guarda uma pessoa para cada serviço aberto;
- a ronda da noite fica no posto durante a assembleia;
- o corpo senta à própria mesa sem precisar ter fome.

## 5. Os agentes e a justificativa da quantidade

Cinco especialistas, cada um na sua cópia do projeto (um worktree no seu ramo) e dono dos seus arquivos (`PLANO.md` §4,
`EQUIPE.md`). O líder juntava os ramos, escrevia o AUDIT, o README e a regressão, mediava os pedidos entre donos e decidia.

| Quem | O que fez | Rodadas |
|---|---|---|
| M1 · espetáculo | o Coliseu (D-107, D-125), a Grande Pirâmide (D-108), os teatros de cada povo (D-109, D-122, D-131), o campo de bola, Valhala, a Acrópole, o zigurate, o grande monumento: forma e planta; a festa e a peça (D-130) | 18 |
| M2 · poder e fé | os palácios (D-110, D-111), os templos do santuário ao monumental (D-112, D-123), a taverna e a hospedaria, a casa rica: forma e planta | 10 |
| V · visão do deus | o pintor da forma na vista do deus (D-113), a ordem de desenho dos prédios grandes (D-114), a reserva desenhada, a fidelidade entre as vistas | 12 |
| C · a cidade | a escolha do degrau, a terra, o pódio, abrir espaço, a reserva, a ampliação, o custo (D-115 a D-117, D-120, D-121, D-127, D-132, D-140), os ofícios (D-102, D-144), os portões dos muros, a retirada (L-647) | 18 |
| E · 3D e corpo | o 3D dos prédios grandes (D-118), a câmera (D-119), o corpo nas escadarias e nos assentos, sentar à mesa (D-104), as células do corpo (D-146), o desempenho (D-134, D-137), as fotos | 9 |

**Por que não menos.** A forma e a planta de uma família de prédios andam juntas, então cada família tem um dono só. Mas as
famílias são muitas: seis povos vezes os tipos grandes. Dividir em espetáculo e poder cortou o tempo pela metade sem dois
mexerem no mesmo arquivo. O desenho do deus, a cidade e o 3D são domínios inteiros e independentes.

**Por que não mais.** A câmera, o corpo e o desempenho moram nos mesmos arquivos, e a máquina tem 4 núcleos: mais agentes
rodando provas ao mesmo tempo deixariam todos mais lentos.

As rodadas contam cada volta de trabalho e entrega. A partir da rodada final, as rodadas foram a triagem das regressões
15 a 18: cada falha ia ao dono do arquivo, e um defeito fora do domínio de alguém ia a quem tinha folga.

O registro de defeitos e decisões (`qa/AUDIT.md`, seção 17) ganhou **359 linhas** nesta versão:
- 137 defeitos: 130 consertados e 7 abertos, deixados para os Bairros Vivos (§12);
- 181 limites de prova: 174 resolvidos ou registrados e 7 abertos (§12);
- 41 decisões.

## 6. A estratégia de contexto e de tokens

- **O contrato antes da equipe.** Cada especialista trabalhou contra uma interface fixa (D-106), sem ler o código dos outros.
- **Um arquivo, um dono.** Um pedido a outro dono ia escrito no relatório da rodada, e o líder repassava. Os arquivos
  comuns (AUDIT, CLAUDE.md, README, regressão, linha de base, vigia) eram só do líder, que recebia os blocos de texto
  prontos.
- **Uma lista de leitura para cada um**, com a regra «procure e leia trechos»: os arquivos grandes (o `build3d.js` tem
  336 KB) só nas partes que cada um mexe.
- **Os números do AUDIT reservados por faixa** para cada especialista, sem disputa por número.
- **Os mesmos agentes, rodada após rodada.** O líder retomava cada especialista com a memória dele, mandando só o que mudou
  e as linhas exatas das provas que falharam.
- **As provas falam em linhas.** Cada caso é uma linha «PASSOU» ou «FALHOU» com os números, e o líder lê só as que
  falharam. O resumo da regressão é comparado com a linha de base, e só as diferenças (`NOVO:`) pedem explicação.
- **O trabalho pesado fora da conversa.** A geração dos mundos, a regressão e o catálogo das plantas rodam em segundo
  plano, e o líder lê só o resumo.
- **A junção numa cópia separada** (um worktree de integração). Assim o líder juntava ramos enquanto a regressão rodava no
  ramo principal.

## 7. As categorias arquitetônicas atualizadas

<!--SEC7-->

## 8. As melhorias de escala externa

| Prédio | Antes | Agora |
|---|---|---|
| Coliseu (D-107) | 12 m de lado, 13,8 m de alto | 40 m de lado e 25,6 m de alto (o colossal: 52 m e 30,4 m); oval de quatro centros; fachada de 21 m em 3 andares de arcos e o ático; 4 entradas |
| Grande Pirâmide (D-108) | agulha de 78° | lisa a 51,85°, base de 36 m e 22,9 m de alto (colossal: 38 m e 24,2 m); a entrada, o corredor, a galeria e a câmara |
| Templo Mayor | 12 m | 40 m: terraços, a escada dupla, os dois santuários no alto, a praça cerimonial |
| Valhala, Acrópole, zigurate | 12 m | 40 e 52 m: o salão nórdico de 34 × 13 m, a Acrópole com a grande escada, o zigurate com o terraço |
| Teatros (D-109) | 12 m, 87 lugares | 24, 32 e 40 m; a cávea, a orquestra, o palco e os bastidores; o romano em meio círculo com a *scaenae frons* |
| Palácios (D-110, D-111) | 12 a 20 m | 24, 32 e 40 m pela forma, de 16 a 23 m de alto. Pódio, escadaria, pátios abertos ao céu, alas e o telhado de cada povo: o grego e o romano com colunata (o romano com cúpula), o egípcio de pilone, o nórdico de tábua sob turfa |
| Templos (D-112, D-123) | 8 m | 16, 24 e 32 m: o grego no crepidoma, o romano no pódio, o egípcio de pilone, o asteca sobre a pirâmide, o hof nórdico |
| Taverna | 8 m | 8, 12 e 16 m (a hospedaria com dois pisos e pátio) |
| Casa rica | não existia | 8 × 8 m com átrio, só para a família rica (mas ninguém a ergue ainda: T-447) |
| Cabana e casa | 4 × 4 m | 4 × 4 m: continuam pequenas (teste G) |
| Grande monumento | não existia | 16 m: o obelisco, a coluna do triunfo, a Pedra do Sol, o deus de ouro, o navio de pedras |

A pegada, a altura e a silhueta de longe saem da mesma forma. O deus vê o prédio do tamanho dele (D-113, L-525), e quem
está ao lado de um prédio grande é desenhado na frente dele, não atrás (D-114, L-526). Na visão do deus, a capital que
guarda terra mostra o lote reservado com estacas, corda e o rótulo (D-121).

## 9. As melhorias de escala interna

| Espaço | Antes | Agora |
|---|---|---|
| A arena do Coliseu | 4 m | 20,2 × 13,2 m, a 2,4 m abaixo do pódio, com o subsolo |
| Os assentos do Coliseu | não havia | 742 (1.406 no colossal), todos alcançados a pé de uma porta; o camarote do imperador com o trono e a corte (D-125) |
| A sala do trono | 9,7 × 3,8 m | 14 × 9,4 m e 9,4 m de pé-direito; 50 lugares de audiência virados para o trono (D-124) |
| A nave do santuário monumental | 3 × 3 a 5,5 × 4 m | de 12 × 16 a 28,6 × 10,4 m, com 9,6 a 11,8 m de altura; pelo menos 40 lugares de rezar |
| O salão da hospedaria | 6 × 3,7 m | 10,7 × 10,8 m, 15 mesas e 88 fregueses sentados; cozinha, depósito, balcão e quartos em cima |
| Os teatros | 87 lugares | de 304 a 913 lugares (o salão do hidromel nórdico senta de 19 a 37, D-122); palco, bastidores e camarins (a skene com teto, D-131) |
| O palácio contra a casa do povo | não se comparava | o lote e o chão dos cômodos mais de 30 vezes os da casa (teste B) |

Cada assento, banco, esteira, mesa e lugar em pé é um lugar da planta (D-085). Uma pessoa do mundo o ocupa, e o corpo
encarnado também pode ocupá-lo. A tabela dos lugares do Coliseu levava 96 s; agora leva décimos de segundo e é feita aos
poucos, sem parar o mundo (L-495, L-511, T-432).

## 10. As melhorias de navegação e funcionalidade

- **O corpo anda pelos prédios grandes.** No Coliseu, vai da rua pelos arcos até a areia e as arquibancadas, subindo os
  corredores das fileiras até o camarote. Nas pirâmides, vai pela entrada até a câmara; nos palácios, pelo pátio até o
  trono; nos templos, pela escadaria até a nave. Antes, o corpo era tirado da arena em até 1 s (L-550).
- **O corpo senta para assistir, levanta e segue.** Toma um assento livre e fica contra o parapeito, sem cair (L-551).
- **A câmera nos espaços grandes** (D-119, L-553). Olhando para cima diante de uma fachada de 21 m, o topo e a cabeça
  aparecem. Na arena, no pátio e no salão do trono, a câmera nunca entra na pedra.
- **O corpo e as pessoas do mundo são barrados pelas mesmas células da planta** (D-146, L-645). O desenho pode passar delas
  no máximo meia célula.
- **As pessoas do mundo enchem os prédios.** O espetáculo leva a plateia e os atores (D-122), e o teatro não abre peça no
  dia da festa da cidade (D-130). A audiência do palácio chama quem está de folga (D-124), sem tirar a ronda do posto
  (D-103). A taverna e o teatro das cidades pequenas têm gente (D-102).
- **A cidade constrói o monumento de verdade.** Ela escolhe o tamanho, acha ou abre a terra, junta a pedra durante anos e
  amplia quando cresce. Somando os sete mundos prontos da geração 18, isto é o que as cidades ergueram sozinhas, sem a mão
  do deus:
  - **dois monumentos de 40 m:** a Grande Pirâmide de Mênfis (megalópole, que chega ao nível 5 no ano 99) e o Templo
    Mayor de Tenochtitlan (guerra mundial, ano 114);
  - **palácios de 24 m:** nove de pé e um em obra; e o grande palácio de 32 m de Argos, em obra (metrópole);
  - **teatros de 24 m:** dez, três deles ainda em obra;
  - **templos de 16 m:** cinco;
  - **grandes monumentos de 16 m:** dois (anos 500 e 1000);
  - **tavernas de 12 m:** vinte e seis (três em obra), e uma hospedaria de 16 m (megalópole).

  Os degraus maiores (o teatro de 32 e 40 m, o templo de 24 e 32 m, o palácio colossal de 40 m, os colossais de 52 m) ainda
  não aparecem em nenhum mundo pronto. São provados pela mão do deus (`handFound`) e pelas regras da escala (§12).

## 11. Os resultados dos testes

<!--SEC11-->

## 12. As limitações que ainda persistem

**O que o patch não cobriu:**
- **Os prédios de serviço continuam no tamanho de antes:** os banhos, a biblioteca, o mercado, a administração, o paço,
  o quartel e as oficinas. A escada dos quatro primeiros e a do paço já estão escritas no `escala.js` (as termas de 20 e
  28 m, a biblioteca, o mercado coberto e o paço municipal de 16 m). Mas nenhum povo sabe erguê-los ainda, porque falta a
  forma ou a planta desses tamanhos, e a cidade não oferece um degrau que o povo não sabe erguer. O caminho fica aberto.
- **O lote é sempre quadrado.** Funciona, com praça, recinto ou pátio em volta, mas é um limite.
- **Os degraus maiores ainda não nascem sozinhos nos mundos prontos.** Nenhuma Roma dos mundos prontos chegou a erguer o
  Coliseu de 40 m. Isso é a escala funcionando como foi decidida: a cidade experimenta do maior para o menor, e o primeiro
  que acha terra e pedra fica (D-140). Mas o Coliseu, os teatros de 32 e 40 m, os templos de 24 e 32 m e os palácios
  colossais só aparecem pela mão do deus. Os Bairros Vivos vão medir a terra das capitais (D-128, D-132).
- **A casa rica ninguém ergue** (T-447): ela é escolha da família, e a família rica ainda não pede o degrau dela.
- **O povo clássico não tem cidade em nenhum mundo pronto** (T-401): o zigurate e o teatro clássico só são provados no
  mundo em branco e pelas regras da escala.

**O que funciona com ressalva:**
- **O 3D dos templos novos não desenha tudo** (T-410). Faltam as torres do pilone egípcio e a torre com a flecha do hof
  nórdico, e o telhado do hof sai de turfa; o deus desenha tudo.
- **As plantas dependem dos dados** (T-436, T-403, T-446). Elas passam em todos os prédios dos mundos de hoje e no catálogo
  inteiro, mas uma rodada de robustez da gramática das plantas, com outras sementes, fica para depois.
- **O desenho de perto do Coliseu pesa.** No desenho por software das provas, custa +12% sobre a figura de longe. A
  medida fina do tempo de quadro só vale numa placa de vídeo (D-134, D-137).
- **Sentar à própria mesa em casa quase nunca aparece:** a planta da casa só põe a mesa no chão que sobra depois das camas.

**Os defeitos achados no fim e deixados para os Bairros Vivos.** Consertar qualquer um deles muda o passo do mundo e
obrigaria a gerar os mundos prontos outra vez; cada um está descrito no AUDIT, com a causa:
- L-631, em parte: um bicho ainda pode acabar dentro de um prédio por escritas de posição que não perguntam onde ele fica
  (os nascimentos já estão consertados, L-654).
- L-636: o passeio de compras de quem tem moeda no bolso não pergunta se as mãos estão livres.
- L-646: o guarda que não acha o ladrão esquece o crime para sempre.
- L-652: as partículas do vulcão e de outros efeitos que só se veem sorteiam do acaso do mundo.
- L-656: a fera que dorme na toca ou migra sai do mundo, e uma história que a tinha no elenco a perderia (latente).
- L-657: a receita «um animal raro perto de gente» do painel do desenvolvedor não dá a fera nas cidades grandes.
- L-658: os muros param no vau dos rios, e com os portões fechados a cidade não fica fechada.

**Os buracos antigos que também ficam para os Bairros Vivos:**
- o governante morar no palácio (a lacuna «palácio/morar» da matriz);
- o povo se juntar na praça («cidade/juntar»);
- a fogueira das ruas da vila mínima (D-135);
- a agenda de quem governa (D-138);
- quem herda o quê do cativo (D-145);
- o ofício que precisa das mãos (D-144);
- uma cidade que põe prédios no coração de outra (D-128).
- os portões de muro que não deixam passar (L-491, aberto desde o Patch 2 e primeiro item dos Bairros Vivos; neste patch o C
  consertou dois casos dele: o portão entre dois prédios, L-603, e o prédio fechado pelo plano do muro, L-604).

## 13. As evidências visuais

Fotos tiradas pelo próprio jogo, nas provas (`qa/visual/monumental.js`, `qa/visual/forma-deus-fotos.js`), com o corpo
encarnado e na visão do deus. Estão em `qa/monumental/fotos/`; a imagem de antes é a que o dono mandou
(`qa/monumental/antes.png`).

| Foto | O que mostra |
|---|---|
| `1-fora.jpg` | o Coliseu de Roma visto da rua pelo corpo encarnado: 40 m de lado, três andares de arcos e o ático |
| `2-arena.jpg` | dentro do Coliseu: a arena de 20 × 13 m e o pódio de pedra em volta |
| `3-anel.jpg` | as fileiras da cávea e os corredores que o corpo sobe até o alto |
| `14-camarote.jpg`, `15-camarote-perto.jpg` | o camarote do imperador, onde quem governa assiste aos jogos |
| `16-coliseu13-fora.jpg`, `17-coliseu13-arena.jpg` | o degrau colossal: 52 m de lado, a fachada maior que o quadro |
| `deus-coliseu.jpg`, `deus-coliseu-obra.jpg` | o mesmo Coliseu na visão do deus, pronto e em obra: o desenho sai da forma do 3D |
| `deus-reserva.jpg` | a capital guarda o lote do monumento: estacas, corda e o rótulo «Reservado para o Templo Mayor» |
| `4-palacio-fora.jpg`, `5-palacio-patio.jpg`, `6-palacio-trono.jpg` | o palácio romano: pódio e escadaria, o pátio aberto ao céu, a sala do trono de 14 × 9,4 m |
| `11-palacio-grego.jpg`, `12-palacio-egipcio.jpg`, `13-palacio-nordico.jpg` | o palácio de três outros povos: o grego de dois pisos com a colunata, o egípcio de telhado plano, o nórdico de tábua sob turfa com a paliçada |
| `7-templo-grego.jpg`, `8-templo-egipcio.jpg`, `9-templo-nordico.jpg`, `10-templo-egipcio-salao.jpg` | os templos: o grego no crepidoma, o egípcio com o pilone e o salão, o hof nórdico |

A página do relatório com as fotos: <!--LINK-RELATORIO-->. O jogo com esta versão:
https://claude.ai/artifact/FRcF3GmtiP1aMhyqU7cKUe.
