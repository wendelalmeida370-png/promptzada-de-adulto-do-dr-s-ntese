# Bairros Vivos (Living Districts) — o plano técnico, antes de mexer no código

> Em uma frase: o jogo já tem bairros com nome, tipo e história (o `G.Urban`), mas o tipo de um bairro vem só do que está
> construído nele. O plano é fazer o bairro **contar, todo dia, o que de fato aconteceu nele** (carga no cais, peixe, vendas,
> fornadas, colheitas, treino, rezas, rodadas na taverna, roubos, casas vazias) e deixar que a roupa das pessoas, a fumaça,
> as luzes, o som e a tela do corpo saiam **dessa vida real**, nunca de enfeite. Nenhum sistema paralelo: tudo cresce dentro
> do `G.Urban` e das portas que o jogo já tem.

## 1. Diagnóstico resumido do que existe
- **Bairros: existe um sistema, e só um — `G.Urban` (`js/urban.js`).** Todo dia, uma cidade por passo do mundo, a cidade é
  repartida em células de 6×6 casas com valor da terra, núcleos (lar, praça, mercado, porto, templo, poder, armas, portão) e
  bairros. Cada bairro (`set.urb.d`, vai no save) tem nome único, vocação `k` (centro, mercantil, nobre, popular, artesão,
  porto, militar, templo, agrário), idade, histerese de 4 dias para mudar e uma história curta (`hist`, 14 linhas). O planejador,
  as avenidas, o preço da casa, a mudança dos ricos, a ronda do vigia, as plantas e o corpo (`Possess.where`) já leem os bairros.
- **A vocação mede o que está construído e quem mora, não o que acontece**: um cais parado continua «porto»; o bairro popular
  quase nunca nasce; vila e aldeia não têm perfil; a história diz «era X, virou Y» sem o porquê, e some quando a cidade é
  abandonada.
- **Pessoas reais com vida real já existem**: ofícios (estivador, pescador, ferreiro, taverneiro, vigia, ator, foguista…),
  grupo social (`v.grp`: nobreza, mercadores, sacerdotes, militares, artesãos, povo), moedas da casa e do bolso pelo livro-razão,
  embriaguez, canto e briga na taverna, treino e ronda dos soldados, roubo com testemunha e prisão, festas, motins, a noite em
  casa. **Não existe marinheiro**: o navio mercante navega sem tripulação.
- **Roupa**: o 3D veste cada um sem acaso (`outfitOf`, `people3d.js`) por povo, ofício, riqueza da casa, governante, idade e
  sexo, com o id dando a individualidade; não lê o grupo social, a época, o frio nem a bebedeira. O 2D só pinta a cor do ofício.
- **Som**: tudo sintetizado, **mono**, com volume pela posição na tela do Modo Deus; o ambiente já ouve algumas fontes reais
  (a multidão que compra, o martelo do ferreiro, os bichos, os lutadores); a música é uma escala só para todos os povos; o canto
  da taverna é só gesto.
- **Atmosfera**: fogo, navios, chuva, trilhas gastas e carroças vêm do mundo; a **fumaça das oficinas e as janelas acesas vêm
  do tipo do prédio** (sempre acesas, haja ou não forno aceso ou gente acordada); os objetos em volta das casas são enfeite pelo id.
- **A tela do corpo é onisciente**: mostra o bairro, o nome de qualquer um e as moedas de qualquer casa. Mas o jogo já tem
  conhecimento: quem o corpo conheceu (`met`), o que viu (`seen`), o que cada um sabe de cada fato (`Stories.know`), o que cada
  povo sabe do mapa (`G.Know`).
- **As três resoluções** (o salto, o passo, o corpo) são **uma simulação só**: o salto anda em passos de 1 s em dois ritmos, e
  o `G.Urban` roda no ritmo lento. O retrato do dia sai de madrugada no passo e de manhã no salto — por isso **a identidade só
  pode vir de contagens do dia inteiro, nunca de uma foto do instante**.

## 2. As lacunas reais (em ordem de valor para quem joga)
1. O bairro é «o que está construído», não «o que acontece»; um rótulo só; sem decadência econômica.
2. O 3D e o som não sabem nada do bairro nem da atividade: fumaça, luz e objetos são enfeite; o som não tem direção.
3. A tela do corpo sabe tudo, inclusive o que o personagem não poderia saber.
4. A identidade das pessoas é incompleta (grupo social, época, frio, bebedeira, postura).
5. Os acontecimentos e as histórias não sabem em que bairro acontecem.
6. A história do bairro é rasa (sem causa) e some com a cidade.
7. O porto não tem marinheiros.
8. Só cidade grande (nível 3+) tem bairros com perfil.
9. **A terra e quem mora onde não se alinham** (achado no fechamento do Patch 2, T-381): a casa é «rica» pela moeda dela onde
   quer que esteja; o bairro nobre pode nascer na borda barata e continuar «nobre» depois de esvaziar; a compra das casas caras
   pelos ricos (D-009) troca uma casa por ano em cada cidade. Os casos «a terra vale mais no bairro nobre» e «os ricos moram em
   terra mais cara» do teste da cidade passam numa história do mundo e falham em outra.
10. **Os prédios de serviço vazios nas cidades pequenas** (D-101, T-377, T-378): o teto dos ofícios (D-090) deixa a taverna sem
   taverneiro, o teatro sem ator e o cais com um estivador só — um bairro boêmio ou um porto movimentado precisam de gente que
   o teto hoje não dá.

## 3. O escopo exato desta atualização
**Entra:**
- **A vida do bairro** (`G.Urban`): contagens reais do dia por bairro, guardadas como uma média lenta (`d.vida`, ~12 números) e
  **perfis múltiplos com histerese** (`d.tags`: porto movimentado, pesqueiro, mercado, oficinas, campo, quartel, sagrado, boêmio,
  perigoso, nobre, pobre, em decadência…). A vocação `k` de hoje fica como está (é a forma construída que o planejador usa); o
  perfil é o que acontece. Vila e aldeia ganham perfil (um bairro só). A história ganha a causa («o cais parou: nenhum navio em
  5 anos») e vira memória do mundo quando a cidade acaba.
- **Marinheiros de verdade**: o navio mercante leva tripulação da cidade (pelas portas `G.Naval.board`/`G.Vg.canSend`), com
  salário pelo livro-razão; quem volta traz a viagem na biografia, gasta na taverna do porto, pode beber, cantar, brigar.
- **O mundo usa a vida do bairro onde já decide por lugar**: o ladrão age onde a vigia é fraca e há o que roubar; o freguês
  procura a taverna perto; o vagar e o tempo livre perto de casa (o bairro, não só o centro); as histórias e a crônica dizem o
  bairro onde aconteceu.
- **A roupa e o porte**: `outfitOf` passa a ler o grupo social, a época/técnica do povo, o frio e a bebedeira (o cambaleio no
  3D); o 2D ganha o mínimo legível (a roupa do grupo). Ferramenta sempre a do gesto real.
- **A atmosfera pela atividade**: fumaça só com forno aceso, termas quentes ou taverna aberta; janela acesa só com gente
  acordada dentro; objetos em volta da casa tirados do que a casa e o ofício de fato têm (a rede do pescador que pesca, as caixas
  do cais que existem); desgaste, umidade e cuidado pela idade do prédio, pela cheia e pelo valor da terra.
- **O som com direção e com fonte**: cada som de lugar vem de uma pessoa, prédio, operação ou navio de verdade perto do ouvido
  (tabela gesto→som sobre o `G.Act.ANIM`), com direção e distância pela câmera do corpo e pela tela do Modo Deus, abafado dentro
  de casa; o fundo do bairro é misturado devagar pela vida real, pela hora e pelo tempo — **porto vazio não soa a porto**; a
  taverna canta quando alguém canta; a música muda de escala e timbre por povo e época, sem trilha fixa por bairro.
- **A tela que respeita o que o personagem sabe**: `G.Possess.knows` — o nome do bairro só se o personagem o conhece (mora,
  morou, esteve lá, ouviu falar); senão, o que se vê («ruas de oficinas, cheiro de forno»). O nome de um estranho só depois de
  conhecê-lo; as moedas de uma casa estranha nunca. A tela pode ser desligada e o lugar continua reconhecível.

**Não entra (dito para não fingir):** idiomas e sotaques falados (o jogo não tem voz; no máximo um timbre de murmúrio por povo,
se couber); uma carroça que quebra, um músico de praça, um patrão discutindo — **só entram se a simulação já tiver a causa**
(não se cria gente nem cena para enfeitar); trocar a vocação `k` que o planejador usa (fica para depois, com dados da vida).

**Entra também, achado no fechamento do Patch 2:**
- **Os portões que não deixam passar** (L-491, o primeiro item, antes de tudo): o planejador do muro (`siege.js`, `planWall`)
  só põe portão onde há passagem dos dois lados de um eixo — nem colado num prédio mais velho, nem num canto, nem contra o mar
  —; a invariante (todo portão aberto tem passagem) e a prova. Nos mundos da geração 13, 9 de 26 portões da metrópole, 9 de 64
  da megalópole e 18 de 58 da guerra mundial não deixam passar. Muda os muros de todos os mundos: entra junto com a primeira
  geração dos mundos deste patch.
- **O teatro grego, a planta contra o desenho** (L-494): a orquestra 3 cm acima do chão da planta, a beira das fileiras (o
  polígono do 3D contra o círculo da planta) e as seis colunas do palco, que a planta não marca como sólidas. A última muda a
  planta e o mundo: entra junto com a primeira geração dos mundos deste patch, como os portões.
- **A terra e a vocação pela vida** (lacuna 9): o perfil «nobre» e «pobre» do bairro sai de quem mora nele hoje (não de quem
  morou), e a terra cara puxa os ricos pela mesma porta da compra (D-009), com o ritmo dela medido e dito; um bairro que
  esvaziou perde o perfil pela histerese, com a causa na história.
- **O teto dos ofícios e os serviços** (lacuna 10, D-101): decidir com o dono se o teto (D-090) passa a guardar uma mão para cada
  serviço aberto (a taverna, o teatro, o cais com carga) antes dos ofícios de comida — muda a economia de todos os mundos, por
  isso entra como decisão (D-) antes do código, com a prova de moedas e a de invariância.

## 4. Dependências técnicas
- **Tudo depende do contrato da vida do bairro** (`d.vida`, `d.tags`, `G.Urban.note`, `G.Urban.at`): ele é decidido pelo líder
  antes de distribuir o trabalho (item 6) e implementado primeiro.
- Os marinheiros dependem só do navio (`naval.js`) e das portas de bordo; não esperam a vida do bairro.
- A roupa, a atmosfera e o som podem começar já, lendo o mundo direto (gestos, operações, navios); só o «fundo do bairro» do som
  e o desgaste por bairro esperam o contrato.
- O mundo usando o bairro (ladrão, freguês, vagar, histórias) espera a vida do bairro **e** os marinheiros.
- Os mundos prontos mudam (marinheiros, decisões por bairro): **gerados de novo uma vez, no fim**.

## 5. Arquivos e módulos envolvidos
- **A vida do bairro e o que se sabe**: `js/urban.js` (dono), `js/possess.js` (`where`, `knows`, os lugares do corpo),
  `js/incui.js`, `js/interact.js` (os cartões), `js/save.js` (se precisar), e uma linha `G.Urban.note(...)` onde a atividade real
  se fecha: `act-porto.js`, `act-negocio.js`, `act-oficio.js`, `act-taverna.js`, `act-servicos.js`, `act-lazer.js`, `fishers.js`,
  `estates.js`, `crime.js`, `festivals.js`, `war.js` (o treino).
- **O mundo**: `js/naval.js` (tripulação), `js/harbor.js`, `js/act-taverna.js` (freguês), `js/crime.js` (onde o ladrão age),
  `js/villagers.js` (o tempo livre perto de casa), `js/stories.js` (`St.where` com o bairro), `js/lore.js` e `js/village.js`
  (a memória da cidade abandonada).
- **O que se vê**: `js/people3d.js` (`outfitOf`, o cambaleio), `js/art.js` (2D), `js/fx3d.js` (fumaça, janelas),
  `js/render.js` (a fumaça do 2D), `js/props3d.js` (objetos), `js/build3d.js` (desgaste).
- **O que se ouve**: `js/audio.js` (e, se crescer, um `js/audio-src.js` irmão), lendo `cam3d` sem escrever nada.
- **Provas**: `qa/qa.js` (invariantes `urb` novas), `qa/guard.js` (regras novas), `qa/urb1.js`/`urb2.js` (estendidas), provas
  novas por sistema (item 13), `qa/visual/corpo-rig.js`, `qa/audiorun.js`, `qa/invariancia*`, `qa/regress.sh`, `qa/README.md`.

## 6. A estratégia de implementação
- **O contrato primeiro (o líder decide, antes de qualquer agente):**
  - `G.Urban.note(x, y, chave, n)` — a única porta por onde a atividade real do dia entra no bairro; só o passo do mundo chama
    (o desenho e o som nunca: regra nova no `guard.js`). As chaves: `cais`, `pesca`, `troca`, `oficio`, `campo`, `armas`, `fe`,
    `noite`, `crime`, mais as contagens que o próprio `G.Urban` faz das casas (riqueza, barracos, casas vazias, gente).
  - Na virada do dia de cada cidade, o `G.Urban` fecha as contagens do dia em `d.vida` (média lenta, 2 casas decimais, por
    morador ou por célula) e acerta `d.tags` com a mesma histerese que a vocação já usa. Sem acaso; desempate pelo id.
  - `G.Urban.at(x, y)` — um índice célula→bairro feito para quem só lê (o 3D, o som, a tela), trocando o `districtAt` de hoje,
    que varre todas as células a cada chamada.
  - Save antigo: sem `vida`, ela começa vazia e se enche no primeiro dia; o load não decide nada (L-419).
- **A mesma causa nos três níveis**: a contagem vem do mesmo evento do mundo no salto, no passo e no corpo — por isso a vida do
  bairro sai igual nos três (é a prova do item 13). A presença do corpo não muda nenhuma contagem.
- **O que só se vê e se ouve lê, nunca escreve**: `G.VR` para o acaso do desenho e do som; nada de campo novo que a simulação leia.

## 7. Quantos agentes
**Quatro especialistas e o líder.** Cada um tem uma fronteira real de arquivos, que não se cruzam:
- **F — o bairro e o que se sabe dele** (a vida do bairro, a história com causa, o índice, as linhas `note`, a tela do corpo).
- **M — o mundo** (os marinheiros; o ladrão, o freguês e o tempo livre pelo bairro; as histórias com o bairro; a memória da
  cidade que acaba).
- **V — o que se vê** (a roupa e o porte; a fumaça, as janelas, os objetos e o desgaste pela atividade).
- **S — o que se ouve** (as fontes com direção, o fundo do bairro pela vida real, a música por povo e época).
- **O líder**: o contrato, a revisão de cada entrega, o `AUDIT.md`, os mundos prontos, a regressão, o relatório e a publicação.

Menos que isso juntaria trabalhos grandes e independentes num agente só (o tempo dobraria sem economizar nada); mais que isso
partiria arquivos ao meio.

## 8. A função de cada um
- **F**: implementa o contrato no `urban.js`, as linhas `note` nos módulos de atividade (um commit pequeno e cedo, para os
  outros já partirem dele), o perfil de vila e aldeia, a história com causa, a invariante `urb` nova, a regra do `guard`, o cenário
  provocado (o cais que para, o bairro que enriquece, a cidade abandonada); depois, a tela do corpo (`knows`, o nome só para quem
  conhece, os cartões).
- **M**: a tripulação do navio mercante (salário, viagem, volta, biografia), o freguês e o ladrão que leem a vida do bairro, o
  tempo livre perto de casa, `St.where` com o bairro, o bairro como memória quando a cidade acaba — cada um com invariante e
  cenário (o marinheiro de verdade da seção 3 do pedido: paga com o seu dinheiro, bebe, briga ou canta, e isso tem consequência).
- **V**: `outfitOf` com grupo, época, frio e bebedeira; o cambaleio no 3D; a fumaça e as janelas pela atividade real; os
  objetos tirados do que existe; o desgaste pela idade, pela cheia e pela terra — com `corpo-rig`, `guarda3d` e fotos por perfil.
- **S**: as fontes de som com direção e distância, a tabela gesto→som, o fundo do bairro pela vida real, o silêncio do porto
  vazio, a música por povo e época — com o `audiorun.js` gravando cada fonte e de quem ela vem.

## 9. O que roda em paralelo
- **Primeira onda**: F (o contrato e as linhas `note`), M (os marinheiros), V (a roupa e a atmosfera que leem o mundo direto),
  S (as fontes com direção). Os quatro mexem em arquivos diferentes.
- **Segunda onda**: F (a tela do corpo), M (o mundo pelo bairro), V e S (o que lê `d.vida`: o desgaste e o fundo do bairro).

## 10. O que depende de quê
- O commit das linhas `note` do F entra antes que o M mexa em `crime.js` e `act-taverna.js` (os dois arquivos que se tocam).
- O M «pelo bairro» espera a vida do bairro do F estar junta.
- V e S leem `d.vida` só depois do F junto; até lá, leem o mundo direto.
- Os mundos prontos são gerados uma vez, depois de M e F juntos; a regressão completa roda nos mundos novos; a prova de
  desempenho sozinha no fim.

## 11. Como evitar conflito de edição
- Cada agente numa cópia própria (worktree), com a lista dos arquivos que pode mudar; fora dela, só lê.
- Os dois arquivos que se tocam (`crime.js`, `act-taverna.js`) seguem a ordem do item 10.
- `qa/AUDIT.md`, `CLAUDE.md`, `qa/linha-de-base.txt` e `worlds/` só o líder escreve; cada agente escreve as suas entradas num
  arquivo à parte, com números reservados por agente.
- O líder junta um ramo por vez, roda o vigia do código e uma vida curta depois de cada junção.

## 12. Como economizar tokens
- A auditoria já está feita e guardada: cada agente recebe só a parte dela que é sua (arquivo:linha), o contrato e os arquivos
  dele — ninguém lê o repositório inteiro, ninguém refaz a auditoria.
- Relatórios curtos (até 25 linhas), com o estado de cada prova e o commit.
- O líder lê as diferenças dos arquivos centrais (o contrato, o save, as portas), não todo o código de cada um.
- Revisão cruzada só onde rende: S e V conferem a leitura de `d.vida` com o F; o líder confere o que mexe no mundo.
- Nenhum agente parado à espera: quem termina a onda sai; volta só com tarefa nova.

## 13. Os critérios de validação e de conclusão
Toda feature nova chega com a sua invariante (`qa/qa.js`), o seu cenário provocado (com save no meio, a pessoa que morre no
meio, o deus que interfere, o mapa que muda) e, se tiver regra que se lê no código, a sua regra no `guard.js`. Os dez testes
do pedido viram provas concretas:
1. **Reconhecimento sem a tela** — em bairros de perfis diferentes da metrópole e do mundial, com a tela desligada, o retrato do
   que o corpo vê e ouve (quem passa e com que roupa, que fontes soam, fumaça, luz, objetos) difere por perfil, e cada sinal
   aponta para quem o causa; mais as fotos para o dono olhar. *(A máquina não prova o reconhecimento humano; prova que os sinais
   existem, diferem e têm causa.)*
2. **Causalidade** — toda fonte de som, fumaça, janela acesa e objeto aponta para uma pessoa, prédio, operação ou navio vivo;
   uma regra do `guard` impede o desenho e o som de criar ou mudar coisas do mundo.
3. **Individualidade** — duas pessoas do mesmo ofício e bairro não se vestem iguais; quem foge do padrão continua fugindo.
4. **Coerência econômica** — o marinheiro recebe, gasta e bebe pelo livro-razão; as provas de moedas e de invariância seguem limpas.
5. **Coerência audiovisual** — o porto vazio fica em silêncio de porto; a taverna só canta com alguém cantando.
6. **Persistência** — a vida do bairro e os perfis atravessam o save igual; um save antigo abre e se enche no primeiro dia.
7. **Transformação histórica** — o cais que para faz o porto decair, com a causa na história; nos mundos dos anos 100, 500 e
   1000, os bairros mudam de perfil com a história.
8. **Independência de contexto** — em todos os povos e épocas dos mundos prontos, sem nada preso a uma cidade.
9. **Transição de resolução** — a vida do bairro sai igual (dentro da margem das contagens) no salto, no passo e com o corpo, e
   o corpo entrando não muda nada (`invariancia.sh` mais um caso novo).
10. **Desempenho** — o `G.Urban` entra no medidor do modo desenvolvedor; o índice troca a varredura de hoje; a fase de
    desempenho da regressão não piora.
11. **A terra e quem mora onde** — os casos 3 («a terra vale mais no bairro nobre») e 12 («os ricos moram em terra mais cara»)
    do `qa/urb1.js` passam em várias sementes (não só na 41), e a T-381 sai da linha de base como FALHOU conhecido.
12. **Os portões** — em todos os mundos prontos, todo portão aberto tem passagem (a sonda dos portões vira prova; a invariante
    nova acusa o portão sem passagem), e a L-491 fecha.
13. **O teatro grego** — o 4 do `interior3d.js` passa na guerra mundial e na megalópole (a orquestra, a beira das fileiras e as
    colunas do palco, L-494), e sai da linha de base como FALHOU conhecido.

**A atualização só termina** com: as provas acima passando; a regressão completa nos mundos gerados de novo, com cada linha
`NOVO:` explicada; o `AUDIT.md`, o `README` das provas e o `CLAUDE.md` em dia; o relatório final nos 12 itens do pedido, separando
«feito e provado», «feito e ainda sem prova», «parcial» e «planejado e não feito»; e o jogo publicado.

## 14. O que mudou com a Arquitetura Monumental (antes de começar)
A Arquitetura Monumental veio antes (D-105) e mexeu no que este plano lê: a cidade escolhe o tamanho de cada prédio, abre
espaço e guarda terra para as obras grandes (`G.Escala`, D-106, D-115 a D-121). O plano acima continua valendo, com estes
acertos:
- **Já feito:** a L-494 (o teatro grego, a planta contra o desenho) foi consertada; a D-101 foi decidida como D-102 (o teto
  dos ofícios guarda uma pessoa para cada serviço aberto — a taverna, o teatro, o cais com carga).
- **Em parte:** a L-491 (os portões que não deixam passar) continua o primeiro item, mas dois casos dela já foram consertados
  (L-603, o portão entre dois prédios; L-604, o prédio fechado pelo plano do muro). A L-658 (o muro para no vau e nos rasos)
  entra junto com ela.
- **Os defeitos que a Arquitetura Monumental achou no fim e deixou para cá**, porque consertá-los muda o passo do mundo (entram
  antes da primeira geração dos mundos deste patch, cada um com a sua prova): L-631 (o resto: o bicho dentro de prédio por
  escritas de posição), L-636 (o passeio de compras não pergunta pelas mãos), L-646 (o guarda que perde o ladrão esquece o
  crime), L-652 (efeitos que só se veem sorteiam do acaso do mundo — candidata a regra do `guard.js`), L-656 (a fera que dorme
  na toca sai do elenco de uma história), L-657 (a receita do painel do desenvolvedor), e os dois que a reg18 achou nos
  marinheiros: L-682 (quem espera no cais durante a preparação nunca dorme) e L-683 (o posto de trabalho fica com quem está
  no cais ou a bordo) — entram com a tripulação de verdade (item dos marinheiros), com o teto dos ofícios (D-102); e o que a
  reg19 achou na guerra: L-685 (a conquista que deixa um povo só com cidades vazias não o acaba na hora — o conserto proposto
  e a prova estão no AUDIT: o `emptied` do L-090 tornado porta pública, chamado no fim do `Wr.conquer`) e o L-686 (o fogo nos
  campos do lote guardado deixa ruínas em cima dele até o dia seguinte; decidido o conserto (B) no D-149, com a prova na
  `escala.js`; a `lote-bolsao` q3 volta a passar com ele) e o L-687 (a leva chama de novo quem está na lista de um exército em
  reunião: o conserto e a prova `qa/leva.js` já testados, prontos para aplicar, em `qa/patch3/consertos/L-687-leva.patch`;
  a pasta `consertos/` guarda os consertos prontos dos defeitos deixados para cá), o L-688 (a saída da caverna pela casa de
  quem sai: conserto pronto em `consertos/L-688-caverna.patch`; a `maos` m13 volta a passar com ele) e o L-689 (a muralha de
  Birka fechou uma faixa de Kaupang num bolsão: entra com o L-491 e o L-658 no primeiro item — o portão com os dois lados
  abertos e o `openWays` também para os prédios de outra cidade; a `agua-solta`, a `cais-longe`, o `caminho-longo` e a
  `represa` voltam a passar com ele), e três do C com o conserto pronto: L-690 (o quintal da casa derrubada não muda de lugar;
  `consertos/L-690-quintal.patch`; a `escala` e3h volta a passar), L-691 (o muro que fecha um prédio de caminho longo ao longo
  da linha; `consertos/L-691-muro-caminho.patch`; com o L-491; o `muros` 7a volta a passar) e L-692 (o balanço do bicho de
  árvore desfaz o afastamento do lote novo; da família do L-631; `consertos/L-692-bicho-arvore.patch`; o `rebanho` r12 volta a
  passar). Todos os patches de `consertos/` aplicam limpo na versão publicada da Arquitetura Monumental. E o L-693 (quem perdeu os dois braços senta na taverna e nunca é servido; da mesma família, a carga da obra que
  talvez não pergunte a força das mãos, T-645) e o L-694 (o load encerra as reuniões da ordem e zera relógios de módulo —
  o que o C já dizia no D-148), e o L-696 (o aluguel deixa a marca de juntar na casa antiga; `consertos/L-696-aluguel.patch`,
  com a prova `qa/aluguel-poupa.js` dentro dele), e o L-698 (a morte do corpo por uma fera com nome sai duas vezes na
  crônica; `consertos/L-698-fera.patch`, com a prova `qa/corpo-fera.js` dentro dele; junto, a fera que o registro dos mortos
  não guarda: a cova, o além e a tela da morte do corpo dizem «uma fera»). Uma pergunta da cidade para medir junto (T-639): Mênfis era metrópole
  no ano 30 da mega e só pediu a cadeia no 49 — a cadeia é o último desejo do planejador, que começa uma obra por vez. E, dito
  pelo C no D-148: o load ainda limpa as reuniões da ordem (`s.meets = []`, o conclave fora do save) e zera os relógios de
  outros módulos — o que o mundo vivo continuaria vai no save (L-419).
- **As decisões deixadas para cá:** D-128 (uma cidade que põe prédios no coração de outra), D-132 (a)–(c) (o degrau antigo, o
  paço que cede ao palácio, a maravilha no fogo), D-135 (a fogueira das ruas antes do segundo ofício de comida), D-138 (a
  agenda de quem governa: a festa da cidade contra a audiência), D-144 (o ofício que precisa das mãos), D-145 (quem herda o
  quê do cativo), T-447 (a família rica pede a casa rica), e as lacunas da matriz «palácio/morar» (o governante mora no
  palácio) e «cidade/juntar» (o povo se junta na praça).
- **A terra das capitais:** nos mundos prontos da geração 18 nenhuma Roma ergue o Coliseu de 40 m, e nenhum degrau acima de
  6 casas fica pronto sozinho fora das maravilhas (a Grande Pirâmide de Mênfis e o Templo Mayor de Tenochtitlan; o grande
  palácio de 32 m de Argos está em obra). O bairro nobre, a
  terra cara e quem mora onde (lacuna 9) são o mesmo assunto: medir a terra das capitais junto com a D-128 e a D-132 (a).
- **Fora deste patch, registrado:** os prédios de serviço (os banhos, a biblioteca, o mercado, a administração, o paço) já têm
  a escada escrita no `escala.js`, mas nenhum povo sabe erguê-los maiores — falta a forma e a planta desses tamanhos.

## 15. A execução (um agente só, a pedido do dono)
O dono pediu que os Bairros Vivos fossem tocados por um agente só, sem especialistas, junto com os ajustes da Arquitetura
Monumental e uma conferência do equilíbrio da fauna. A ordem do plano fica: primeiro o que muda o mundo (os consertos
deixados para cá, a fauna, a vida do bairro, os marinheiros, o mundo pelo bairro), depois o que só se vê e se ouve, e no fim
os mundos prontos de novo, a regressão inteira e o relatório.
- **Feito, primeiro lote:** os sete consertos guardados aplicados (L-687, L-688, L-690, L-691, L-692, L-696, L-698; a pasta
  `consertos/` saiu, os patches estão no histórico); os portões que deixam passar, o muro que atravessa o vau e a cidade
  vizinha que não fica presa (L-491, L-658, L-689: `muros.js` 12a–12d); a fauna (D-151, `fauna.js`).
- **Feito, o resto do que muda o mundo antes da vida do bairro:** o povo sem alma que acaba na hora (L-685), a ruína no lote
  guardado (L-686), os bichos fora dos prédios (L-631), o passeio de compras e as mãos (L-636), o guarda que volta ao roubo
  (L-646); o efeito fora do acaso do mundo (L-652, regra 48), a fera na toca (L-656, regra 49), o save dos bichos (L-699), a
  fera na borda da cidade (L-657), a taverna de quem não tem braços (L-693, D-152), o load sem segundo dia (L-694, `G.mod`).
- **Feito, a vida do bairro (D-153):** `G.Urban.note` / `at` / `profile` / `is`, `d.vida`, `d.tags`, o todo da cidade, a
  história com a causa, a memória da cidade que acabou; regra 50; `vida-bairro.js` v1–v9 (L-700, L-701, D-154).
- **Feito, os marinheiros de verdade (D-155):** o ofício `marinheiro`, a tripulação do navio mercante (`Nv.crewFor`, o
  estado `embark`, `Nv.crewHome`, o soldo pelo livro, a viagem na biografia, a folga da noite da volta), a carga do navio
  que volta do meio do caminho (L-702), o chamado ao cais que atravessa o save (L-703), o posto de quem viaja (L-683) e a
  noite de quem espera no cais (L-682); `marinheiros.js` m1–m10, dez sabotagens.
- **Feito, o mundo pelo bairro (primeira parte):** a ronda da vigia vai primeiro ao bairro perigoso e o ladrão pesa a ronda
  e a vida do bairro da casa (D-156, `ladrao-bairro.js`); o descanso à porta de casa e a taverna das próprias ruas (D-157,
  `tempo-livre.js`); a crônica diz o bairro (`G.Urban.ofPlace`); e os defeitos que as provas vizinhas acharam no caminho: a
  noite do roubo no save (L-704), o porquê de quem dorme ao relento no save (L-705, `relento.js`), a presa caída onde os pés
  não vão (L-706, `caca-margem.js`, com verificador novo), a folga de quem voltou do mar qualquer que seja o ofício (L-707),
  a busca d'água perdida no caminho (L-708, `jarra.js`), o cuidado do rebanho largado no meio (L-709), a casa de quem perdeu
  os braços, que não comprava (L-710); e os limites de prova T-685 a T-693.
- **Feito, a terra e quem mora onde (lacuna 9, primeira parte):** medida em seis mundos crescidos como os do `urb1`
  (sementes 41, 7, 13, 23, 57, 88). A bandeira da casa mercante é da família, não das paredes (D-158, L-711,
  `casa-mercante.js`); quem mora de aluguel também compra a casa cara, e quem vende fica de inquilino na casa deixada (D-159,
  `casa.js` h19, a porta `G.Casa.lease`, regra 61 do guard); o caso 3 do `urb1` mede a terra sob o que faz o bairro (T-694).
  Com isso: o caso 3 passa em cinco das seis (falha na 23: o bairro do paço de Argos nasce em terra barata) e o caso 12 em
  quatro (empata na 57 e na 88, por 0,1 e 0,2). **Aberto para o fecho** (o teste 11 pede várias sementes, e a 41 da
  regressão passa nos dois): repetir a medida das seis com a casa rica em terra cara (T-447) junto, e decidir se a casa cara
  alugada por um dono que mora noutro lugar também se vende.
- **Achado no caminho, antigo:** a casa perdida era escrita no campo dos membros perdidos — quem morava numa casa que pegou
  fogo trabalhava a 85% para sempre e aparecia «Sem uma perna», e quem tinha perdido um braço o ganhava de volta (L-712,
  `perdas.js`, com verificador novo); e os limites de prova T-695 (`casa` h12), T-696 (`lar` l17), T-697 (`ladrao-bairro` b1), T-698 (`compras` c18) e T-699 (`casa-mercante` k2–k4); e a bandeira que não passava ao irmão pequeno (L-713, `casa-mercante.js` k8).
- **Feito e juntado, quatro das cinco frentes paralelas** (cada uma num ramo, com o bloco dela em `qa/patch3/bloco-*.md`):
  - **o que se vê** (V; D-162 a D-165): `G.Atmos`, a fonte única do que a vista do deus e o 3D mostram do que acontece —
    a roupa pelo grupo, pelo que o povo sabe fazer, pelo frio e pela bebida; a fumaça só com fogo de verdade, a janela só
    com gente acordada, as coisas em volta só do que o prédio tem, o desgaste pelos anos e pelo cuidado do bairro
    (`roupa.js`, `atmosfera.js`, regras 51 e 52);
  - **o que se ouve** (S; D-166 a D-169): a cena de som com dono, lado, distância e paredes; o fundo do bairro pelo hábito
    vezes as mãos no trabalho agora; a música pelo povo e pela época (`som.js`, regras 53 e 54);
  - **a tela que respeita o que o personagem sabe** (K; D-170 a D-173): `G.Possess.knows`, o registro `v.ken`, a tecla H
    (`sabe.js`, `sabe-tela.js`, regras 55 e 56; L-760, L-761);
  - **a Arquitetura Monumental no 3D e na forma** (E; D-178 a D-181, L-800 a L-803): o Coliseu 17% mais leve de perto e
    com o velário, o portal da Grande Pirâmide, a paliçada, os teatros e a cávea de longe (`visual/monumentos-ajustes.js`).
  E, achado pelo S e consertado pelo líder: quem é tomado dentro de um prédio fica dentro dele (L-741, `corpo-dentro.js`).
- **Conferido na árvore juntada, no navegador:** o 3D desenha sem erro de módulo (`encarna` e11), a tela do corpo
  (`sabe-tela`), as trocas de corpo e a casa por dentro (e4, e18), e um mundo salvo na versão da linha de base (c2d68e1)
  aberto na de agora, sem violação em dez anos (`oldsave`). Duas provas que caíam por causa de mudanças do patch foram
  acertadas: a pesca do corpo medida debaixo de tempestade (T-802) e os carregadores da disputa no cais, que a cidade
  agora manda para o mar como marinheiros (T-803).
- **Em curso, seis frentes** (o dono deu carta branca para quantos agentes fossem precisos): a Arquitetura Monumental no
  mundo (M): os degraus grandes erguidos pelas próprias cidades, a casa rica em terra cara, o governante no palácio, o
  povo na praça; **as termas grandes** (T; o T-784: a forma, a planta e o 3D das termas de 20 e de 28 m); **as coisas em
  volta das casas** (Q; o T-703: lugar para a lenha, os barris, os potes e as redes nos prédios desenhados pela planta);
  **as pontes** (P: a ponte de rua calçada era uma laje cinza lisa — vista nas fotos do diário —, e ganha pedra, mureta
  e arco pelo povo do chão; só desenho); **a grande biblioteca e o paço municipal** (B; o resto do T-784: 16 m, seis
  povos); e **a casa por dentro** (G; T-403, T-436, T-446: o lugar de comer e o fogo no núcleo de toda casa, o motor que
  recusa a peça onde o corpo não cabe, os depósitos do celeiro em qualquer semente).
- **O diário do patch para o dono** (`qa/patch3/diario/`, publicado como artefato): o que entrou, o que está em obras e o
  que cada coisa muda no jogo, com capturas de verdade do Modo Encarnado (`qa/visual/fotos-diario.js`); atualizado a
  cada frente juntada.
- **Aberto das frentes juntadas, dito no AUDIT:** a medida do quadro do Coliseu com a máquina livre (T-781); os 42 sons
  novos, que só o ouvido do dono julga; o aspecto da roupa e das janelas, que pede fotos antes de publicar.
- **A seguir:** juntar as frentes M, T, Q, P, B e G, e o fecho (os mundos prontos da geração 20, a regressão inteira, a medida das
  seis sementes da terra, o relatório).
