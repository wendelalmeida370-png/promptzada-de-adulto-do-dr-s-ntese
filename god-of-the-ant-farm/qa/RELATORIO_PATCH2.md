# Os Prédios Vivos — relatório de entrega (Patch 2)

> Escrito para quem não programa. **Provado** quer dizer que há uma prova que roda de verdade e o resultado está anotado
> aqui. **Parcial** quer dizer que funciona em parte, e o texto diz qual parte. **Não feito** está dito como não feito.
> O pedido inteiro está em `qa/patch2/PEDIDO.md`, o plano dos especialistas em `qa/patch2/ESTUDIO.md`; cada defeito, limite
> de teste e decisão, em `qa/AUDIT.md` (a seção 16 é a do Patch 2).

## 1. O pedido

O dono pediu, em 27–28/10, o Patch 2, «Living Buildings»: que cada prédio seja um lugar onde a vida acontece — a casa com a
família dentro, a oficina com o trabalho de verdade, o templo e a arena com gente, e a mesma construção vista de cima (o Modo
Deus) e de dentro (o Modo Encarnado). E o adendo: experiências jogáveis em toda categoria de prédio, ligadas à economia, às
pessoas e ao save.

Quatro especialistas trabalharam em paralelo, cada um na sua faixa, e o líder juntou, conferiu e publicou:
- **P1, a vida nas casas** — a família, a noite, a festa, o bebê, a casa cheia, a casa em ampliação, o corpo em casa;
- **P2, o trabalho e os serviços** — os ofícios de vários passos, a taverna, as termas, o lazer, a feira, a ronda;
- **P3, a arquitetura e os monumentos** — a mesma construção nas duas vistas, os templos, os palácios, os monumentos;
- **P4, o espaço, a navegação e a matriz** — o corpo nos lugares da planta, as escadas, as portas, o chão aberto, a matriz
  das categorias.

388 commits desde a v37 publicada (`409e1d1`), contando o deste relatório.

## 2. O que mudou para quem joga

### A vida nas casas (P1)
- **Cada um tem a sua hora** (D-071). As crianças deitam antes, os velhos levantam antes da luz, o taverneiro deita depois
  de a taverna fechar. Antes, todo mundo dormia no mesmo instante, porque era noite.
- **A noite em casa** (D-070). Há a ceia, quem cozinha ao fogo, quem conversa sentado, quem nina o bebê, o doente de cama, o
  luto e o velho que cuida dos pequenos de dia. A despensa da casa só muda pelo livro-razão.
- **O cartão da casa no Modo Deus** (D-072) mostra cada morador, onde está e por quê, lido do mundo: «no colo de Sigrid»,
  nunca «sem afazer».
- **O save não tira ninguém da cama** (L-220, D-073, L-399). Antes, carregar à noite punha a cidade inteira de pé nas portas.
- **A festa e a reunião** não levam quem está a caminho de comer, nem tiram da cama as crianças pequenas (L-233, L-234,
  L-397); a festa atravessa o save (L-222).
- **O bebê muda de colo onde está** (D-074), nunca pela cidade. **Da casa cheia saem os moços primeiro** (D-098).
- **A casa em ampliação continua sendo a casa da família** (L-371): ela mora lá durante a obra, e as duas vistas mostram a
  casa velha inteira com o andaime do tipo novo subindo em volta.
- **Os fiéis rezam dentro do templo** (L-224), não na porta.
- **O corpo encarnado** come em casa mesmo sem mesa (L-398), dorme e acorda onde dormia através do save (L-399), pega e dá
  o bebê no colo (D-074).

### O trabalho e os serviços (P2)
- **Os ofícios trabalham em fornadas de verdade** (D-076): a olaria, a tecelagem, a forja e a ourivesaria buscam o material,
  trabalham com as mãos, secam, queimam e entregam, passo por passo, pelo livro-razão. Uma fornada atravessa o save, a
  morte do artesão e o deus que derruba a oficina.
- **O tijolo da obra** (D-075): onde o povo constrói com tijolo (o adobe do Egito e dos astecas, o tijolo cozido dos gregos
  e dos romanos), parte da pedra de cada obra é tijolo feito na olaria.
- **A taverna** (D-077) é o negócio do dono: ele compra no atacado, o freguês paga a refeição e cada rodada, e o caixa bate
  com o livro. **Os banhos** (D-079) são aquecidos com a lenha do povo, pelo foguista; a água quente tira a doença e o
  cansaço.
- **O teatro e a biblioteca**: os atores se preparam, sobem ao palco, a peça acontece e há aplausos; a leitura soma à
  pesquisa do povo. No mundo de verdade o teatro não funcionava: os atores que moravam longe eram chamados tarde demais
  (L-425), e quem estava no palco saía no meio da peça para comer (L-426). Depois do conserto, a metrópole foi de 0 para 2
  peças completas em 3 dias, e a mega de 2 para 4 de 4.
- **A obra pelo livro** (L-246): o que os construtores levam a uma obra, e o que volta dela, passa pelo livro-razão com o
  motivo. **A doca terminada em pedra** não deixa mais material sem registro (L-416).
- **As mãos ocupadas** (D-094, D-100): um chamado de fora só leva alguém se a tarefa da pessoa for menos urgente, e nunca no
  meio de uma carga com destino ou de uma etapa de trabalho.
- **O campo, o curral, a mina, a feira**: o pastor leva o rebanho a um pasto com capim (L-396), o minério só conta quando sai
  da mina (L-381), a feira fecha ao meio-dia de verdade (L-387). **A ronda da noite flagra o contrabandista** (L-405).
- **O corpo encarnado no lugar de quem tem um ofício** (D-078): o oleiro, o taverneiro, o foguista, o escriba trabalham pelo
  corpo nas mesmas etapas e no mesmo ritmo.
- **O cais com os braços que as caixas pedem** (L-428). Antes, numa cidade no teto dos ofícios, um barco com 8 caixas
  ganhava 2 dos 3 estivadores que pedia, e um deles era mandado embora com 6 caixas ainda no cais.
- **Cada gesto com o seu movimento** (L-429, L-432). Quem tira a roupa nos banhos leva a mão aos cabides; antes ficava
  parado. O músico da taverna toca o alaúde; antes dançava.
- **Sem armazém, a carga vai ao chão e a obra continua** (L-406, L-433): numa cidade isolada dos armazéns, quem tem carga nas
  mãos a pousa e levanta a fogueira nova. Antes, quem trazia uma carga apanhada do chão ficava parado com ela.

### A arquitetura (P3)
- **Uma construção só, nas duas vistas** (D-080, D-093). Num tipo com forma, o deus e o corpo desenham a mesma coisa, de
  perto e de longe: os templos dos seis povos, a biblioteca, a praça, os palácios, os banhos, o paço, o mercado e os celeiros
  do Egito e dos astecas, a maravilha, o teatro e o monumento. A planta de dentro lê a forma e põe nela a função.
- **As casas** são desenhadas pelo deus a partir da casca da planta delas (D-082): a mesma casa nas duas vistas.
- **O Coliseu e as arenas onde se anda** (D-095), com as fileiras de sentar (D-084); **o monumento com degraus que o corpo
  sobe** (D-097); **a mina e o poço na escala de gente** (D-092); **a olaria e a taverna com o terreiro** (D-083).
- **O nome da fazenda não depende de quem olha** (L-394): antes, a fazenda de uma cidade conquistada se chamava «Arrozal»
  com a interface aberta e «Milharal» sem ela.

### O espaço do corpo (P4)
- **Cada um no seu lugar dentro dos prédios** (D-085). Quem está dentro de uma casa, oficina, taverna, cadeia ou templo
  ganha um lugar da planta: a cama de quem dorme, o banco de quem come, o posto de quem trabalha, uma cela por preso. Nunca
  dois no mesmo lugar, e ninguém dorme de pé. Quem dorme fica com a cabeça na cabeceira, e quem senta olha para o cômodo,
  não para a parede (L-284).
- **O corpo encarnado usa esses lugares** (D-099). Um verbo só, «lugar», senta à mesa, ao fogo, no banco do templo, entre
  quem assiste. O corpo levanta onde subiu, e salvo sentado, senta de novo ao abrir o jogo.
- **O corpo cabe onde a planta diz que ele cabe** (D-088). O pé e o topo de cada escada (L-281) e cada lugar de uso (L-282,
  L-289) valem só onde o corpo inteiro fica. O vendedor encarnado cabe atrás do balcão da taverna, o exemplo B do pedido
  (L-430).
- **O corpo chega ao pé de toda escada e sobe** (L-391): na metrópole, 463 de 463 pés. As escadas têm classe pela
  inclinação: degraus, escada, íngreme (sobe-se de frente, com as mãos) e de mão (D-086, L-280).
- **A praça e a feira se andam como a rua** (L-410), e subir uma borda alta com as mãos nunca deixa o corpo preso dentro de
  uma escada (L-411).
- **Ninguém raspa mais a quina dos prédios** ao andar pela cidade (L-354). Quem tem o caminho tapado por um prédio novo chega
  aonde ia, e não à casa do lado (L-431).
- **O corpo salvo dentro de um prédio que mudou desde o save** se levanta ao lado, nunca preso numa parede ou numa escada
  (L-422).
- **As casas na tipologia do deus** (D-082). A cabana redonda tem o fogo no meio e as esteiras em volta (T-161). O telheiro do
  anexo é chão do corpo (L-285). A casa abandonada tem o mesmo chão da habitada, e o corpo anda nela inteira (L-290, L-423).
- **O relatório geométrico de cada prédio** (D-087), no modo desenvolvedor: verde onde o corpo fica, vermelho onde não.
- **A matriz dos prédios** (D-089): as 12 categorias e o que cada uma faz e ainda não faz, calculado do código e das provas.

### Uma descoberta de fundação: a mesma semente fazia dois mundos (L-437)
Ao gerar os mundos prontos de novo, a mesma semente deu mundos diferentes de uma rodada para outra: o «Guerra mundial» chegou
à primeira metrópole no ano 62 numa geração e no 49 noutra. A causa estava num atalho antigo do código: dez lugares do mundo
embaralhavam uma lista pedindo ao navegador que a ordenasse «ao acaso» (quem migra para fundar uma vila nova, os colonos de um
navio, a multidão de uma festa…). Isso não é um embaralhamento de verdade. O motor do navegador ordena de um jeito antes de
otimizar o código e de outro depois, e como ele otimiza em paralelo, o momento muda de rodada para rodada. Agora o jogo
embaralha sempre do mesmo jeito (`G.shuffle`), a vigia do código recusa o atalho (regra 39), e uma prova nova
(`qa/salto-igual.js`) vive o mesmo mundo com o motor em dois estados diferentes e exige o mesmo resultado, dia por dia.

### O que a regressão final ainda pegou
A primeira fase da regressão completa, já com o código do L-437, achou dois limites de prova e três defeitos de verdade — e,
seguindo um deles, o líder achou um quarto, mais grave, só lendo o código:
- **A paz que não chegava** (L-439). Dois reinos exaustos (100 de cansaço da guerra) e quatro anos sem paz. Argos mandou um
  emissário com a proposta; uma hora de jogo depois, o conselho da frota o convocou para remar numa trirreme. A proposta nunca
  chegou, e o emissário «a caminho» segurou qualquer outra proposta por mais três dias. O exército e os bandos já deixavam
  emissários e mercadores em paz; a frota não. Agora deixa, e o Tratado de Argos sai no ano 10.
- **O exército de mortos** (L-438). Quando todos os soldados de um exército morriam ao mesmo tempo, ele ficava «em campo» até o
  próximo passo da guerra (meio segundo), e os mortos ainda contavam como homens fora de casa. Agora quem morre sai da lista do
  exército na hora, como já saía da do bando.
- **Quem a cidade manda embora** (L-440). Quando uma cidade cheia demais funda uma vila nova, os fundadores eram escolhidos
  sem pergunta nenhuma: podia ir o preso da cela, o emissário a caminho, o soldado de um bando — e **o próprio corpo que o
  jogador vive no Modo Encarnado**, que saía andando para a vila nova e o deus era posto para fora dele. O mesmo valia para a
  criança encarnada entre os colonos de um navio, e para o filho do governante encarnado num casamento real. E, provando isso,
  apareceu outro: os pais embarcavam para a colônia e **deixavam os bebês de menos de 2 anos para trás** (L-442) — agora a
  família só parte inteira. Agora há uma regra
  só, `G.Vg.canSend` («quem a cidade pode mandar»), e uma família vai inteira. Uma prova nova, `qa/fundadores.js`, coloca os
  cinco que não podem ir numa cidade e prova cada caminho — no código de antes, cinco das seis partes falham.
- **A luta que o save perdia** (L-443). Ao gerar os mundos de novo, a conferência de «salvar e carregar» do mundo «guerra
  mundial» achou uma patrulha no meio de uma luta pequena (sem batalha registrada) que, ao carregar, voltava a «reunindo» —
  a luta sumia. Agora a luta continua depois de carregar e termina pelas regras de sempre. Prova nova: `qa/frota-luta.js`.
- **A crônica da batalha** (L-441). Uma batalha com 4 feridos e 59 que fugiram era escrita como «formaram as linhas frente a
  frente; Lavínio recuou sem combate». Agora só é «confronto» quando ninguém se feriu.
- **Duas provas do mar** decidiam num mundo só o que é tendência (T-315, T-316): a ilha que outro povo descobriu com a própria
  viagem não é telepatia (a prova agora deixa só a viagem que ela olha no mar), e «a cultura que não é do mar explora menos» é
  julgada em cinco mundos somados (46 viagens da melhor cultura do mar contra 31 dos egípcios e 28 dos astecas).

### O fechamento: a última rodada de descoberta
Uma regressão de descoberta — o código inteiro com os mundos da geração 9 — deixou 56 falhas na fase «fundação» e mais três
na cidade e nos poderes. O líder consertou dois defeitos, e três especialistas novos revisaram o resto em paralelo, cada um com
uma lista fechada (as casas e o corpo; o trabalho e a economia; a cidade, a guerra e o tumulto). A maior parte das falhas eram
provas que procuravam, por sorte, uma situação que os mundos novos não têm mais: foram refeitas para montar a situação por regra,
cada uma com uma sabotagem mostrando que ainda pega o defeito que guarda (T-319 a T-337). Estes eram defeitos de verdade:
- **O prédio que sai do mundo** (L-444): uma ínsula derrubada para dar lugar a outra obra continuava «guardando» o bacalhau e a
  comida de uma operação que ninguém mais fazia. Agora, quando um prédio sai do mundo, o que se fazia nele acaba na hora.
- **A convocação que o save refazia** (L-445): carregar um save no meio de uma convocação chamava de novo quem já tinha largado
  o chamado. Agora o load chama só quem atendia, com o relógio dela como estava.
- **Dois velhos cuidando das mesmas crianças** (L-446), ao mesmo tempo, na mesma casa.
- **A escada do jirau** (L-447): em 12 de 329 casas da metrópole, o pé da escada ficava do outro lado da divisória, e o corpo
  nunca chegava a ela.
- **Os degraus do paço egípcio** (L-448) entravam 13 cm na torre.
- **A câmera na praça** (L-449): no Modo Encarnado, a borda de uma praça aberta era tratada como parede, e a câmera entrava na
  cabeça do corpo encostado nela.
- **O peixe que não cabia nas mãos** (L-450) voltava à água contado errado: o pesqueiro ganhava peixe do nada.
- **A fome na praça** (L-455): no meio de um motim, o soldado da guarda morria de fome com o armazém ao lado.
- **A ordem secreta** (L-456) tirava um amotinado da praça para seguir uma testemunha.
- **O «Continuar»** (L-457): logo depois de salvar um mundo grande, o botão abria o save de antes.
- **A compra que ia a bordo** (L-458): uma viagem levava como tripulante quem carregava uma compra para casa, e a compra ia junto.
- **O refúgio da caverna** (L-459): durante um ataque, a viagem chamava para o cais quem estava escondido na caverna, e a colônia
  levava crianças escondidas, com a família.

Com os mundos da geração 11, a regressão final ainda pegou mais defeitos de verdade, e sete especialistas (D a G, cada um com a
sua lista) os consertaram:
- **A oferta da casa que o mundo recusava** (L-451): o corpo via a oferta de uma casa nova mesmo com os construtores da cidade já
  cheios de obras, pagava, e o mundo recusava — de novo e de novo. Agora a oferta e a decisão perguntam a mesma regra.
- **A casa escolhida sem o jogador** (L-452): quando o par do corpo vinha à frente da família na fila, o dia da cidade comprava a
  casa e mudava o corpo junto. Agora a família do corpo decide pelo corpo.
- **O navio que atravessava uma ilha** (L-453): no desembarque de uma invasão, um transporte atrasado ia em linha reta até a praia
  por cima da terra, e os soldados desciam de onde ele estava. Agora o transporte vai pela água, e os soldados só descem perto
  da praia.
- **O barco sobre o morro novo** (L-454): quando o deus ergue terra (ou abre o mar), o rumo dos barcos agora é conferido trecho a
  trecho, e não só nas curvas.
- **A carga de quem morre no convés** (L-460) sumia sem linha no livro; agora vai para casa ou para o estoque, como a de quem se
  afoga.
- **A guerra levando quem estava com as mãos ocupadas** (L-461): a convocação, o bando, a frota e o ataque pelo mar escolhiam quem
  levava uma compra para casa ou o material de uma obra — a compra ia à guerra, a obra perdia o material. Agora quem tem as mãos
  ocupadas não é escolhido (como já valia para as viagens).
- **A ruína que guardava coisas** (L-462): depois que a lava derrubou uma olaria, um carregador ainda entregou nela a argila.
- **A festa «do ano undefined»** (L-464): a festa que atravessava um save terminava na crônica sem o ano em que começou.
- **O lugar de obra num bolsão** (L-465): o planejador escolhia para uma casa um pedaço de praia aonde as ruas não chegavam.
- **O muro sobre a feira** (L-466): as muralhas se erguiam sobre o lote das feiras, que é chão aberto.
- **Comer de frente para a cama** (L-467): numa casa sem mesa, o E do corpo oferecia comer em vez de deitar.
- **O bicho preso no curral do vizinho** (L-468): um peru que entrou pela porteira do curral vizinho nunca mais saía.
- **A pastora com o feno nas mãos** (L-471): quem cuida das crianças da casa ficava dias com a carga nas mãos, e nunca podia ir
  à taverna. Agora leva a carga ao armazém antes.

Com os mundos da geração 12, a regressão final pegou ainda estes (consertados pelo líder; o Modo Encarnado com um especialista):
- **Os navios no fundo seco** (L-475): o deus erguia terra ao lado do mar que ele mesmo tinha aberto, e os navios empurrados
  para «a água mais perto» iam parar na areia do fundo aberto. Agora só vão para o mar de verdade.
- **Quem segue a testemunha morria de fome** (L-476): o homem da ordem secreta passava de uma testemunha para a outra, sem
  parar para comer. Agora ele não sai a seguir ninguém na hora de comer, e larga para comer como os outros da ordem.
- **O navio da frota sobre a ponta de terra** (L-477): a frota parada num bloqueio mandava cada navio à sua vaga em linha reta,
  e a conta da «linha de água» pulava a quina de uma pedra. Agora a frota usa a mesma conta, casa por casa, dos outros navios
  — um defeito que o navio comum já tinha tido e consertado (L-075); o vigia do código ganhou a regra 41 para ele não voltar.
- **A porta do cais num bolsão** (L-478): um cais ao pé de um penhasco tinha a «porta» (o ponto aonde a gente vai) num pedaço
  de chão de três casas, fechado pelo penhasco; ninguém chegava lá. Agora a porta de um prédio sem planta segue a mesma regra
  das casas: o primeiro canto que dá para a rua.
- **O Modo Encarnado** (T-365 a T-367, o especialista): três provas do encarna falharam com os mundos novos — o estivador que
  o mundo mandou comer no meio da descarga, a caminhada até um armazém do porto do lado de fora do muro de Roma, a corrida
  reta que começava numa horta. Nenhuma era o jogo: as provas passaram a montar a premissa pela regra do mundo.

E a rodada antecipada das fases «cidade» e «fundação» (feita antes de gerar os mundos de novo, para os defeitos aparecerem
cedo) pegou mais dois:
- **O freguês sentado no fogão** (L-479): numa taverna sem bancos, o freguês que esperava era posto no lugar de cozinhar do
  taverneiro, uma banqueta ficava livre, e a porta deixava entrar um a mais do que os lugares (10 à mesa de 9). Agora o
  freguês fica num assento — banco, senão banqueta —, nunca no fogo da casa.
- **A colônia sem líder** (L-490): uma colônia de cinco moços de 17 a 21 anos, sem ninguém de 22, não tinha líder, e o
  módulo das expedições quebrava. Agora o líder é o mais ousado dos de 22 para cima, senão dos moços.

As outras oito falhas dessa rodada eram provas que dependiam da sorte do mundo (o pastor que gastou a tarde buscando água,
o único ator que a cidade mandou pescar, a cidade com lugar para um estivador só, a caixa de navio que a prova pensava ser
de peixe…): cada uma foi reproduzida com uma sonda e passou a montar a premissa pela regra do mundo (T-364, T-375 a T-380,
T-382). Duas ficam como falha conhecida (T-381): «a terra vale mais no bairro nobre» e «os ricos moram em terra mais cara»,
do teste da cidade, medem uma tendência de uma só história de mundo — a bissecção mostrou que passam em umas versões do
código e falham em outras, sem nenhuma mudança que as quebre. A terra, os bairros e quem mora onde são justamente o assunto
do próximo patch (Bairros Vivos), que as toma como critério de aceitação.

Com os mundos da geração 13, a regressão final pegou ainda dois defeitos do desenho 3D (consertados pelo líder; o mundo não
muda):
- **As pedras do alicerce dentro do porão** (L-492): numa cabana com anexo e porão, as pedras do alicerce do anexo eram
  desenhadas também no lado que encosta na casa — e entravam até 7 cm no porão. Agora o alicerce do anexo não põe pedra
  desse lado.
- **O corpo dentro da pedra no corredor do teatro** (L-493): a planta do teatro grego tem, nas arquibancadas, quatro corredores
  com dois degraus por fileira, mas o 3D desenhava as fileiras inteiras — quem subia pelo corredor ficava 20 cm dentro da
  pedra. Agora os corredores são da forma do teatro: a planta os lê dela (os mesmos números de antes) e o 3D desenha os
  degraus. Era a primeira vez que um teatro grego com planta aparecia nos mundos que vêm com o jogo.

E nove provas que o teto dos ofícios (D-090) desmontou: com as cidades dando menos mãos aos ofícios pequenos, a mina da
metrópole ficou sem mineiro, o teatro de Mênfis sem ator, a taverna sem taverneiro, o mercado clandestino sem
contrabandistas. As provas passaram a dar o ofício pela mão do deus durante o caso (T-385 a T-393), e cada uma foi seguida por
uma sonda até mostrar que o jogo fazia o certo. Na última volta, mais duas provas: o velho que a prova da casa faz pela
mão do deus agora vira ancião por inteiro, como o quadro dos ofícios faria (T-394), e a matriz dos prédios aprendeu a ler a
prova da memória dos mortos, que ela dava por falha sem que tivesse falhado (T-395).

Os consertos que mudam o mundo pediram os mundos prontos de novo: os sete que vêm com o jogo são da geração 13.

## 3. As fundações novas (para quem mexe no código)

| Peça | Arquivo | O que garante |
|---|---|---|
| `G.Lar` | `js/act-lar.js` | A vida em casa: uma camada do passo do mundo sobre as tarefas, sem campo novo na pessoa. A tarefa 'lar' só por ele; o relógio de cada um (`G.Lar.clock`, puro); onde cada um está e por quê (`G.Lar.why`, `roster`), lido do mundo. |
| `G.Forma` | `js/forma.js` | A arquitetura de um tipo de prédio com forma: pura (sem o mundo, sem acaso), com os números do desenho do deus; dela saem o 3D de perto e de longe, o desenho do deus e a planta. |
| `In.formType`, `In.migrate` | `js/interiors.js`, `js/int-monumentos.js` | Os tipos com forma e planta; o registro de antes que vira o da forma ao abrir. |
| `In.places`, `In.slots` | `js/interiors.js` | Um lugar por pessoa, cada pessoa num lugar (D-085): só o repartidor dá lugar; `In.slots` é a porta de leitura. |
| `G.Oficio`, `G.Taverna`, `G.Termas`, `G.Teatro` | `js/act-oficio.js`, `js/act-taverna.js`, `js/act-servicos.js`, `js/act-lazer.js` | Os ofícios em fornadas, a taverna, os banhos, o teatro e a biblioteca, como operações do mundo (`G.Act`), pelo livro-razão (`G.Depot`). |
| `G.Act.leg`, `G.Vg.busy`, `G.Vg.handsBusy` | `js/activity.js`, `js/villagers.js` | A perna de uma operação em curso e as mãos ocupadas (D-094): por onde todo chamado de fora pergunta antes de levar alguém. |
| `G.Village.swapBill` | `js/village.js` | A troca de um material por outro numa obra, com a conta e o que ela pede mudando juntos (L-416). |
| `In.BODY`, `In.standFor` | `js/interiors.js` | A regra do corpo nas plantas, uma só (D-088): o raio, a altura, o degrau e o passo; o ponto de onde o corpo toma um lugar com a borda inteira no chão (L-289, L-430). |
| `In.report` | `js/interiors.js` | O relatório geométrico de um prédio (D-087): cada achado é FALHA ou ESCOLHA com o motivo; o mesmo no modo desenvolvedor, no `qa/geometria.js` e na matriz. |
| `G.Vg.canSend`, `G.Village.pickFounders` | `js/villagers.js`, `js/village.js` | Quem a cidade pode mandar embora para sempre — os fundadores, os colonos, o casamento real (L-440): nunca o corpo do deus, o preso, o soldado, o emissário; a família inteira. |
| A matriz por prédio | `qa/matriz-predios.js`, `qa/categorias/pN.js` | As 12 categorias dos 56 tipos; cada dono escreve a sua folha, e o estado é calculado do código e das provas, nunca afirmado (D-089). |

**As regras novas da vigia do código** (`qa/guard.js`):
- 28: a forma é uma só (no 3D, um tipo com forma desenha só pela forma);
- 29: um lugar, uma pessoa (D-085);
- 31: a despensa só pelo livro;
- 32: a tarefa 'lar' só no `act-lar.js`;
- 33: a tarefa 'fest' só no `festivals.js`;
- 34: o colo do bebê só no `villagers.js` (D-074);
- 35: o custo da casa só no `act-casa.js` e no `social.js` (L-236);
- 36: a forma é pura (sem acaso, sem o mundo, sem o 3D; antes do three.js no `index.html`);
- 37: o grão é do mundo (L-394);
- 25: a operação nasce no seu arquivo (D-076, D-077);
- 26: a conta da obra é do `village.js` (D-075, L-416);
- 27: o livro-razão também no `economy.js`, no `tavern.js` e no `court.js`;
- 38: as mãos ocupadas (D-094) — e, no fechamento, a ordem secreta pergunta antes de seguir alguém (L-456), a tripulação não
  leva mãos ocupadas (L-458) nem quem está no refúgio da caverna (L-459);
- 39: o embaralhamento é `G.shuffle` (nunca um `sort` com comparador que sorteia: L-437);
- 40: quem a cidade manda embora pergunta ao `G.Vg.canSend` (L-440);
- e a 31 sem exceções: o fim do dia em casa e o tributo passaram pelo livro (T-130).

As invariantes de cada sistema novo vivem no arquivo do seu dono (`qa/lar-inv.js`, `qa/forma-inv.js`, `qa/oficio-inv.js`)
e entram no verificador pelo `qa/junta-inv.js`.

## 4. Os testes executados
A regressão completa final (`bash qa/regress.sh`) rodou em 3 e 4/11 no código desta versão, com os mundos prontos da
geração 13, no Chrome 153, numa máquina de 4 núcleos, em três partes juntadas numa pasta só: o mar, a cidade e os poderes
no `0ce9a31` (o código do mundo é o mesmo desta versão: depois dele mudaram só o 3D do teatro e a forma das arquibancadas,
com as plantas iguais, provado pela impressão de cada uma); a guerra, as vidas, o estado, a tela e o Modo Encarnado no
`70f089f`; a fundação no `70f089f`, com o lar refeito no `1711fec` (T-394, só a prova). A prova de desempenho rodou
sozinha no fim, com a máquina livre. O resumo tem uma linha por prova: **1657 linhas — 1650 provas passaram, 6 falharam
(todas conhecidas e ditas abaixo) e o navegador**. Ele virou a nova linha de base (`qa/linha-de-base.txt`).

| Fase | O que prova | Resultado |
|---|---|---|
| A vigia do código (`guard.js`) | as regras que se leem no código (41 regras: quem escreve cada campo, nenhum `Math.random`…) | passou, 147 arquivos |
| O mar | as colônias, as invasões, os naufrágios, a pesca, os saves no meio; a frota que luta através do save; o navio que não passa por cima da terra | 25 de 25, mais o desempenho |
| A guerra | as quatro guerras de 10 casos, a virada, os cativos | tudo passou |
| As vidas | duas vidas com o verificador (20 e 12 anos); a mão do deus; save e load em laço | nenhuma violação S0–S2 |
| O estado | saves danificados, o alcance, a bordo, os isolados, o determinismo, o salto em dois ritmos, o salto com o motor em dois estados | tudo passou |
| A tela | os painéis, o desenho, o macaco (teclas e cliques ao acaso), a extinção, a planta no Modo Deus | tudo passou |
| A cidade | os bairros, a vida da cidade, os quarteirões, os fundadores, a memória dos mortos, os mundos prontos | 29 de 31 (as duas do T-381) |
| Os poderes | cada poder do deus, e o caos (um deus com fé infinita) | 57 de 57; o caos limpo nas duas sementes |
| A fundação | as atividades, o porto, o negócio, a economia, a invariância, os interiores e as portas, os muros, o corpo; e as do Patch 2: a vida nas casas, os ofícios e os serviços, a forma de cada povo, o espaço do corpo, a matriz por prédio | 1221 de 1223, em 107 arquivos; 105 saindo limpos (as duas do L-494) |
| O Modo Encarnado | o corpo, o 3D, as mãos, a água, os balões e o Diário de Vida | 150 de 150; balões 8 de 8; diário 8 de 8 |
| O desempenho | o mar com muitos barcos, sozinho na máquina | passou (§8) |

**As 6 que falharam, todas conhecidas:**
- «a terra vale mais no bairro nobre» e «os ricos moram em terra mais cara» (a cidade, T-381): medem uma tendência de uma só
  história de mundo; o próximo patch as toma como critério, em várias sementes (seção 6);
- o 4 do `qa/visual/interior3d.js` na guerra mundial e na megalópole (226 e 224 pontos do teatro grego), e com ele as duas
  linhas «saiu limpo» desses arquivos: a L-494, aberta (seção 6).

**As diferenças para a linha de base** (a da v37, de 980 linhas):
- **682 linhas novas**: 676 de provas novas do Patch 2, que passaram (as da vida nas casas, dos ofícios, da taverna, das
  termas, do lazer, da forma, das plantas, do espaço do corpo, do 3D por dentro, da matriz por prédio; e os casos novos de
  provas antigas — a frota que luta, o navio e a terra, os fundadores, os guardados, a casa da terra cara, o salto com o
  motor em dois estados…, cada um com o seu registro no `AUDIT.md`), e as 6 que falharam, acima.
- **5 linhas que saíram**:
  - as duas da cidade que passavam na v37 e agora falham (T-381, acima);
  - «presos nas celas», aberto e carregado, da metrópole: a metrópole da geração 13 não tem cadeia. Pela regra do jogo
    (`crime.js`), uma cidade levanta cadeia no nível 3 com dois roubos em 12 dias ou 70 pessoas, e 30 de pedra: a maior
    cidade tem 59, e as que tiveram roubos não tinham a pedra (Roma 3, Tenochtitlan 17), só Tebas chegando lá agora. O caso
    é visto nos outros três mundos («presos nas celas, em algum mundo»: 3 presos);
  - a linha das lacunas da matriz das atividades, que agora tem outros números (seção 7).

**A fase «fundação» rodada antes da hora.** Antes de juntar os últimos ramos, o líder rodou só a fase «fundação» da
regressão na ponta (856 provas passaram, 18 linhas falharam), para achar cedo o que a junção dos ramos quebrou. Cada falha
foi para o dono certo e voltou consertada ou explicada:
- a soleira e a porta-velha: o mercado e os celeiros pela forma (L-413, L-414; as premissas T-288 e T-291);
- o motim: o load redistribuía os ofícios a partir das posições arredondadas dos bichos (L-419, consertado pelo líder);
- a volta: a convocação desfeita pela própria guerra (T-292);
- as obras, as compras, a olaria, o lazer: premissas que o mundo novo desfez (T-289, T-293 a T-297);
- a matriz: os gestos novos da casa, que vieram com o ramo do P2.

## 5. Os defeitos achados e corrigidos
A seção 16 do `qa/AUDIT.md` (o Patch 2) tem **298 entradas**: **131 defeitos do jogo** (L), **136 limites de teste** (T —
uma prova que montava mal a premissa, explicada e consertada só na prova) e **31 decisões de desenho** (D).

- **Dos 131 defeitos, 125 foram consertados**, cada um com a prova que falhava antes e passa depois (alguns em parte: o L-229,
  o L-280, o L-371 e o L-385, ditos na seção 6).
- **6 ficam abertos**, ditos na seção 6: L-409, L-412, L-420, L-424, L-491 e L-494.
- **Os maiores, por faixa:**
  - **a vida nas casas**: a casa que segura a família inteira (D-082), o bebê no colo, a despensa pelo livro;
  - **o trabalho**: a obra e a olaria pelo livro-razão, o taverneiro que compra e serve, os banhos que esfriavam para sempre
    (L-400), a peça que parava (L-426);
  - **a arquitetura**: a forma de cada povo e a planta lendo a forma, as portas que davam para bolsões (L-209, L-216, L-478);
  - **o espaço do corpo**: o corpo preso em lances e bordas (L-411, L-422), o lugar onde os pés cabem e o corpo inteiro não
    (L-430);
  - **a fundação**: a mesma semente que fazia dois mundos (L-437) e os navios que passavam por cima da terra (L-453, L-454,
    L-477).

## 6. O que fica parcial, ou não foi feito
- **L-491** (aberto; o primeiro item do próximo patch): o planejador do muro põe portão onde não se passa — colado num prédio
  mais velho que o muro, num canto, contra o mar. Nos mundos que vêm com o jogo, 9 de 26 portões da metrópole, 9 de 64 da
  megalópole e 18 de 58 da guerra mundial não deixam ninguém passar: a gente dá a volta (o cais de Roma ficava a 229 m do
  armazém do porto). O defeito é de antes deste patch, e consertá-lo muda os muros de todos os mundos.
- **L-494** (aberto): no teatro grego, três diferenças entre onde o corpo pisa (a planta) e o que se vê (o desenho): a
  orquestra desenhada 3 cm acima do chão da planta; a beira das fileiras, redonda na planta e um polígono no desenho (a 1 cm
  da beira, um ponto fica numa fileira numa e na outra fileira na outra); e as seis colunas do palco, finas demais para a
  grade da planta, que não as marca como sólidas — pela planta, o corpo atravessa a coluna. A última muda a planta e o mundo
  (os mundos prontos de novo); fica para o próximo patch, com as outras duas. A prova do 3D por dentro (`interior3d`, a 4) da
  guerra mundial e da megalópole fica como falha conhecida por isso.
- **T-381** (conhecido): «a terra vale mais no bairro nobre» e «os ricos moram em terra mais cara», do teste da cidade, falham
  nesta versão — medem uma tendência de uma só história de mundo, que muda a cada conserto. O próximo patch (Bairros Vivos)
  as toma como critério de aceitação, em várias sementes.
- **L-409** (aberto): o mundo atravessa as peças das bancas, da fonte e dos bancos.
- **L-412** (aberto): a borda alta do chão aberto num declive — o corpo sobe com as mãos, não andando.
- **L-420** (aberto): as muralhas tiram pedra do estoque do povo sem linha no livro-razão (a família do T-063); numa prova,
  as muralhas de Roma levaram 59 pedras assim.
- **L-424** (aberto): na guerra em casa, a família da casa em ampliação foge em vez de se esconder nela.
- **L-229** (parcial): as pessoas conversam em casa; o corpo encarnado ainda não entra na conversa.
- **L-385** (parcial): comer das mãos passa pelo livro-razão; as refeições do estoque do povo ficam como limite.
- **A proposta B do P1** (não feita, de propósito): o material da casa que a família pagou ser dela, e as obras da cidade só
  pegarem o que sobra. É regra nova da economia, não conserto; fica para o próximo patch.
- **L-371, a parte do trabalho** (aberta): a ronda do coletor de impostos, a volta do trabalho e o consumo da casa
  (`economy.js`) e o resumo das compras da cidade (`act-compras.js`) ainda perguntam «a casa está pronta?» em vez de «a casa
  serve para morar?» — a família de uma casa em ampliação fica de fora dessas contas.
- **T-063 e T-120** (abertos em parte): a cunhagem e a busca de material já passam pelo livro-razão; o resto do tesouro
  escrito à mão (o exército, a política, os presentes da cidade, as cavernas) e a limpeza do chão de um cemitério novo
  ficam para o próximo patch.
- **Uma pergunta de desenho para o dono:** a ronda da noite deve largar a vigia para ir à assembleia do palácio? Hoje larga
  (a assembleia é mais urgente que a ronda).
- **As escadas íngremes das casas** (L-280, parcial): cada escada tem a classe pela inclinação, e o corpo sobe a íngreme com
  as mãos; alongar a escada até 45° onde o lote deixa não foi feito (numa casa de 4 m não cabe).
- **26 de 875 lugares sobre um banco** ainda são tomados de um acesso onde o corpo inteiro não fica: o verbo «lugar» toma de até
  0,6 m (fora da prova do L-430).
- **O grande palácio egípcio** de uma das combinações do `qa/plantas.js` tira as peças de conforto uma a uma até o forno ter lugar
  para o corpo (a tentativa mais cara, 39 ms): dá para tirar primeiro a peça que bloqueia.
- **D-101** (aberta): a cidade pequena com taverna não tem taverneiro. Com 20 a 30 adultos, o corte dos ofícios (D-090) conta
  mãos, não o celeiro cheio, e tira o taverneiro mesmo com comida e lenha de sobra; a taverna fica de pé e vazia. Mudar isso
  muda a economia de todos os mundos: fica para o próximo patch (que trata justamente da vida das tavernas e dos bairros).
- **Uma pergunta de desenho para o dono:** na própria casa, o botão E oferece «comer» antes de «sentar» no lugar da mesa. O
  jogador deveria poder sentar à própria mesa sem fome?
- **A prova do ator de longe** (`qa/lazer.js` l7) passa, mas ainda pode esperar: o ator escolhido pode estar no meio de uma
  descarga no porto, e o chamado ao palco espera (como deve). O relógio do caso, que ela perdia esperando os atores, já é
  posto de novo depois deles (T-392).
- **A regra da escada no validador das plantas** (L-447): ficou na regra das casas; posta no validador, seria mais geral, mas
  deixa inválida uma planta de prova (o porão raso da cadeia).
- **O emissário atacado no caminho** (T-347): um bicho que ataca o emissário toma a missão dele, como tomaria o afazer de
  qualquer um, e ele não a retoma depois do perigo — o povo pode mandar outro.
- **16 de 4519 lugares das plantas da metrópole** (T-348, aberto): lugares de uso que o corpo não alcança a partir da porta,
  porque a conta de alcance passa por cima de frestas entre os móveis; consertar muda as plantas, o catálogo e os mundos.
- **Gente com carga nas mãos durante a guerra** (anotado pelo especialista G): no mundo da guerra mundial, 18 adultos ficam
  dois minutos com a carga nas mãos no meio da luta, da fuga ou a bordo — o que a guerra pede vem antes, e a carga espera.

## 7. A matriz dos prédios (as categorias e as atividades)
A matriz por prédio (`qa/MATRIZ-PREDIOS.md`, gerada por `qa/matriz-predios.js` do código, das folhas de cada especialista e
dos resultados desta regressão — nunca escrita à mão) põe cada um dos **56 tipos de prédio** numa das **12 categorias** e
calcula o estado de cada uma: **10 validadas e 2 parciais**.

| Categoria | Tipos | Estado | O essencial feito |
|---|---|---|---|
| Moradias | 6 | validada | 6 de 6 |
| Religião e memória | 2 | validada | 3 de 3 |
| Armazéns e celeiros | 3 | validada | 3 de 3 |
| Comércio | 3 | validada | 3 de 3 |
| Ofícios | 9 | validada | 1 de 1 |
| Serviços e convívio | 2 | validada | 2 de 2 |
| Campo e criação | 10 | validada | 3 de 3 |
| Extração e pesca | 2 | validada | 3 de 3 |
| Governo, justiça e guarda | 5 | validada | 3 de 3 |
| Palácios | 4 | **parcial** | 0 de 1 |
| Cultura e espetáculo | 5 | validada | 4 de 4 |
| Obras abertas da cidade | 5 | **parcial** | 3 de 4 |

«Validada» quer dizer: cada atividade essencial da categoria existe no código e tem uma prova que passou nesta regressão,
e a geometria das plantas não tem falha. **O que falta, dito pela própria matriz:**
- **os palácios**: as plantas têm o trono e a sala de audiência, e o governante e a família moram ali só em parte — o mundo
  ainda não leva ninguém à audiência;
- **as obras abertas da cidade**: juntar-se na praça (conversar, ouvir quem fala, a festa ali) ainda não é uma atividade;
  e o corpo do deus bebe no rio, não no poço.

A religião ficava em «funcional» só porque a matriz não sabia ler o resultado da prova da memória dos mortos, que responde
em outro formato; consertada a leitura (T-395, só na ferramenta), ela é validada como as outras.

**A matriz das atividades** (`qa/MATRIZ.md`, de `qa/matriz.js`) confere cada gesto: nenhuma oferta ou passo sem gesto, nenhum
gesto sem pose no 3D (as duas que falhariam). Ela lista, sem falhar, o que ainda não está pronto: 6 gestos que ninguém usa,
14 passos sem retorno que se veja ou ouça (quase todos decisões e etapas novas do Patch 2: o atacado e a devolução da banca,
a lenha das termas, o atuar e o copiar do teatro), 1 que só a vista do deus mostra, e o pegar e o dar o bebê, que nesta
geração dos mundos não apareceram nas cenas colhidas (a prova deles é o l15 do `qa/lar.js`, que passou).

## 8. Desempenho medido
Medido na mesma máquina de 4 núcleos, sem placa de vídeo (o 3D é desenhado por software).

- **O mar com muitos barcos** (a prova 17, sozinha na máquina): com 39 barcos (35 no mar, 104 pessoas a bordo, 154 pessoas no
  mundo), o passo do mundo leva 1,6 ms, e o pior passo, 19 ms. A tela do porto roda a 18 quadros por segundo no navegador
  sem placa de vídeo. Na v37: 1,5 ms por passo, o pior em 9 ms, os mesmos 18 quadros por segundo — o passo comum ficou
  igual; o pior passo dobrou (a cidade agora faz mais coisas por pessoa) e fica bem abaixo do teto da prova (250 ms).
- **O Modo Encarnado na metrópole** (a parte e8): perto do corpo, 29 pessoas e 64 bichos desenhados, 154 chamadas de desenho
  e 757 mil triângulos (v37: 9 pessoas, 47 bichos, 208 chamadas, 770 mil).
  - O quadro inteiro (o mundo e o 3D juntos) leva **10,9 ms** na mediana e 16,7 ms em 95% dos quadros (v37: 12,9 e 15,8).
  - Na qualidade leve: 10,3 ms na mediana e 69,6 ms em 95% dos quadros (medido logo depois da troca, quando o 3D refaz os
    pedaços perto do corpo; v37: 12,5 e 54,4).
  - O salto de 10 anos da metrópole leva 70 s (v37: 81 s).
- **A vida curta** (a semente 103, 4 povos, 5 anos, em Node, sem desenho, com a máquina livre): 16 s, de 2,9 a 3,3 s por ano
  de mundo (v37: de 3 a 6,5 s, conforme o que mais a máquina fazia).
- **Os mundos prontos** (abertos pelo menu, com a máquina ocupada por outras provas): a metrópole abre em 30 s (671 pessoas,
  save de 3,3 MB), a megalópole em 38 s (1904 pessoas, 7,3 MB), a guerra mundial em 107 s (1128 pessoas, 5,5 MB).
- **Não medido:** uma placa de vídeo de verdade e um celular.

## 9. Os próximos passos
- **Os outros caminhos que mudam alguém de cidade à mão** (achados ao seguir a L-440, ainda não olhados um a um): os refugiados
  de uma história do cadafalso (`story-cadafalso.js`), a guarda que volta para casa quando a cidade muda de povo
  (`politics.js`) e os últimos de um povo que acaba, levados por outro (`politics.js`). Cada um deve perguntar ao
  `G.Vg.canSend`, ou dizer por que não (o povo inteiro que se vai é uma força do mundo).
- **O teatro grego** (L-494): a orquestra, a beira das fileiras e as colunas do palco, com os mundos prontos de novo.
- **Os itens abertos da seção 6**, por ordem de efeito para quem joga: a família da casa em ampliação que foge em vez de se
  esconder (L-424), o corpo na conversa de casa (L-229), as muralhas fora do livro-razão (L-420), as peças das bancas que o
  mundo atravessa (L-409).
- **A proposta B do P1** (o material da casa que a família pagou), uma regra nova da economia, para o dono decidir.
- **A taverna da cidade pequena** (D-101): o corte dos ofícios olhar o celeiro cheio, ou o planejador não levantar a taverna
  que a cidade não pode servir — junto com o próximo patch, os Bairros Vivos.
- **A pergunta de desenho da ronda da noite** (largar a vigia pela assembleia do palácio): o dono decide.
- **A matriz dos prédios** diz, categoria por categoria, o que ainda não tem experiência jogável: é o mapa do próximo patch.
