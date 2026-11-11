# Bloco M — os ajustes da Arquitetura Monumental que são regra do mundo (Bairros Vivos)

Ramo: `worktree-agent-a8f5af9594fd9a4f1` (base `61dc62b`). Números usados: L-780…, T-760…, D-174 a D-177, regras 57 e 58.
Arquivos do jogo mexidos: `js/village.js`, `js/villagers.js`, `js/city.js`, `js/act-casa.js`, `js/polity.js`.
Arquivos novos: `qa/degraus.js`, `qa/degraus-inv.js`, `qa/casa-rica.js`, `qa/juntar.js`, este bloco.
**O mundo muda** (o passo do mundo: quem quebra pedra, onde a pedra vai, o que a cidade pede): os mundos prontos precisam ser
gerados de novo, e a linha de base refeita.

## 0. O que se mediu antes de mexer (os mundos prontos da geração 19 e mundos do zero)

Os roteiros de medida ficaram em `scratchpad/ag/M/` (`mede.js` o que a regra responde a cada capital; `traca.js` o salto ano a
ano com o que cada capital pede e recebe; `pedra.js` o livro-razão da pedra de um povo; `constr.js` o que os construtores fazem;
`pop.js` um mundo do zero década a década).

**O que a regra da escala responde a cada capital** (justifica? paga? acha terra?):

| mundo (ano) | capital | nível, gente (povo) | pedra, renda/ano | onde a escada parava |
|---|---|---|---|---|
| metrópole (58) | Tenochtitlan | 3, 118 (159) | 93, +156 | o palácio de 6 em obra **sem nenhuma das 210 de pedra**; o campo de 40 m guardado para a maravilha, nunca usado |
| metrópole (58) | Mênfis | 4, 104 (162) | 29, +80 | justifica o templo de 6: nenhum lote («68% com água, 45% com prédio de outra cidade»), e em volta do templo de 4 não há como crescer |
| metrópole (58) | Roma | 3, 41 (137) | 13, +106 | a maravilha de 10: nenhum dos 4264 lotes serve (78% água, 60% relevo além do pódio) |
| metrópole (58) | Argos, Hedeby | 3, 89 e 33 | 7 e 25 | o teatro de 6 em obra a 0% de pedra |
| megalópole (50) | Roma | 3, 91 (127) | 10, +60 | o campo guardado para o Coliseu; não o pede: a maravilha é o último desejo, atrás do teatro |
| megalópole (50) | Mênfis | 5, 140 | 182, +248 | tem a Grande Pirâmide de 10; o templo é o **santuário de 8 m**: justifica o de 24 m e não há como crescer no lugar |
| megalópole (50) | Argos | 3, 43 (71) | 39, +24 | o palácio de 6 a 0% de pedra |
| anos 500 / 1000 | Mênfis | 4, 189 e 215 (746 e 784) | **979 e 772 em estoque** | a pedra de uma maravilha no armazém e **nenhum lote** de 6, 8 ou 10 casas: «nenhum seco e sem prédio» (água 62–75%, muro ou estrada 52–66%, prédio de outra cidade 49–64%) |

**O que acontecia em 25 anos de salto, sem mexer em nada** (`traca.js`):
- metrópole, anos 58 → 83: o palácio de 6 de Tenochtitlan ficou **21 anos com 0 das 210 de pedra**, até a cidade ser tomada; o
  teatro de 6 de Hedeby só ficou pronto por volta do ano 80; Mênfis pediu a maravilha todo ano e nunca achou terra. **Nenhum
  degrau acima de 6 casas começou.**
- megalópole, anos 50 → 75: o teatro de 6 de Roma ficou **21 anos** em obra (51 → 72) e só então o Coliseu foi fundado, no ano
  74 (a 0% no 75); o palácio de 6 de Argos, **25 anos a 0%**; Mênfis quis ampliar o templo, o teatro e o monumento todo ano:
  «sem lote para ampliar», 25 vezes.
- um mundo do zero (semente 103, continente de 128, 4 povos, 80 anos): Mênfis guardou o campo da pirâmide no ano 40 e **até o
  ano 80 nunca a pediu**; os banhos e a administração ficaram 20 anos em obra sem pedra.

**Para onde ia a pedra** (`pedra.js`, Tenochtitlan, 118 a 124 pessoas, 4 anos): entravam **17 a 38 de pedra por ano** (1 a 6
mineiros de ~84 adultos; 9 a 12 construtores), e saíam 20 a 37 para as outras obras (casas melhoradas, armazém), 11 a 14 para o
calçamento e **45 num ano nas carroças do comércio**. O palácio: nada. Um mineiro traz perto de 10 de pedra por ano; a
maravilha de 10 casas custa 768.

**As causas, em ordem de peso:**
1. **A pedra não cresce com a cidade.** O repartidor de ofícios dá à pedra uma parte do «resto» dos braços (os que sobram
   depois dos ofícios, dos lavradores, dos construtores e dos soldados), e o resto é de 1 a 4 braços em qualquer cidade: uma
   capital de 160 pessoas tem os mesmos 2 ou 3 mineiros de uma aldeia de 20. O construtor sem nada para assentar ia calçar rua
   (as ruas nunca acabam) e depois cortar lenha (a lenha quase sempre está abaixo do desejo do armazém) — quebrar pedra era o
   último recurso, e quase nunca chegava a vez.
2. **A pedra que entra vai para o que não acaba**: melhorar cada casa de pé (cabana → casa → sobrado → ínsula), calçar, e sair
   nas carroças.
3. **Uma obra cívica de cada vez**: a obra parada sem pedra segura a fila, e a maravilha é o último desejo da fila.
4. **A ampliação no lugar nunca acha espaço** (em volta de todo templo, teatro e monumento há estrada, estátua, sobrado,
   oficina, muro ou água), e só o maior degrau era tentado.
5. **A terra**: nas capitais maduras (anos 500 e 1000) não há lote nenhum; aí a pedra sobra e a terra falta. Não mexi nisto
   (ver «o que ficou aberto»).
6. **O critério de «justifica»** (a gente e o nível de cada degrau) não é o que segura: as capitais chegam a 100–220 pessoas e
   justificam o templo de 24 e 32 m e o teatro de 32 m; o que falta é pedra (mundos novos) ou terra (mundos velhos). Ficou
   como estava.

## 1. O que foi feito (os itens do pedido, na ordem)

| item | estado | prova |
|---|---|---|
| 1. Os degraus grandes nascem sozinhos | **feito e provado** (a pedra, os braços, o degrau de novo, a maravilha primeiro); a terra das capitais velhas e a obra longe dos armazéns ficam abertas (T-760, T-761) | `qa/degraus.js`, `qa/degraus-inv.js` |
| 2. A casa rica (T-447) | **feito e provado** | `qa/casa-rica.js` |
| 3. O governante mora no palácio | **não feito** (o porquê e o caminho: seção 9) | — |
| 4. O povo se junta na praça | **feito em parte e provado**: os ajuntamentos são na praça; os lugares da planta para quem vem, não (T-762) | `qa/juntar.js` |
| 5. A mesa em casa | **não feito** (não comecei) | — |

## 2. As linhas do AUDIT (prontas para colar)

| D-174 | decisão (do agente M, nos Bairros Vivos, sobre «os degraus grandes não nascem sozinhos») | **A obra grande tem a pedra e os braços do povo dela.** Medido nos mundos da geração 19 (o bloco M, seção 0): o palácio de 6 de Tenochtitlan ficou 21 anos sem nenhuma das 210 de pedra, o teatro de Roma 21, o palácio de Argos 25; um povo de 160 pessoas tinha 1 a 6 mineiros e 17 a 38 de pedra por ano, e ela ia para cada casa melhorada, para o calçamento e para as carroças (45 num ano). Decidido: (1) **a pedra guardada** — a obra grande que espera pedra numa cidade com a vez (alimentada e em casa, D-120) é marcada pelo planejador (`set.gw`, no save com a cidade) e guarda o que ainda espera (`V.keeps`, `V.stoneKept`): o calçamento e as carroças do comércio só levam o que sobra (`V.stoneSpare`: `city.js`), nenhuma casa de pé é melhorada (`improve`), nenhuma outra obra que custa pedra começa (já era: D-117); as obras já começadas acabam e as casas de que a cidade precisa seguem; (2) **a turma** — a cidade da obra tem pelo menos 15% dos adultos como construtores (`V.GANG`), e as outras cidades do povo com os celeiros cheios e rocha por perto, 1/12 (`V.GANG_Q`: a pedreira do povo) — construtores, nunca «mineiros»: as minas de uma cidade tomam todo mineiro sem posto, e os 8 mineiros de Mênfis cavavam minério; (3) **quem quebra a pedra** — o construtor da turma sem nada para assentar quebra pedra em metade dos dias antes de calçar rua (`V.quarries`), a rocha em volta da obra primeiro (`aboutWork`: até 20 casas dela, além dos 28 do meio da cidade), e a leva direto à obra (`haulStone`); sem rua para calçar, qualquer construtor quebra a pedra que as obras da cidade esperam antes de cortar lenha para o armazém; (4) **a vez alcança a obra longe** (`V.workPri(b, v)`): três dias em quatro de cada construtor (pelo dia, `G.hash`, sem sorteio) a obra grande pesa como se estivesse no meio da cidade, e no quarto valem as obras mais perto; a casa que uma família pagou guarda diante dela o lugar que tinha (200 contra 400, L-313 com a D-117). O que ficou de fora de propósito: tirar braços dos ofícios ou da lavoura (a vez só existe com a cidade alimentada), e o construtor de qualquer obra quebrar pedra antes da rua — medido: com todo construtor ocioso na pedreira as ruas param (a rua é um terço da velocidade de todo pé), e dois mundos do zero tinham 14% e 23% menos gente no ano 51; só a turma da obra grande tira braços das ruas. Provas: `qa/degraus.js` g1 a g4, g7; as regras do verificador no `qa/degraus-inv.js`. Sabotagens: a tabela da seção 8 do bloco. Os números de depois: seção 3 do bloco. |
| D-175 | decisão (do agente M, sobre a D-116: «nenhum prédio de antes acha onde crescer») | **O degrau maior nasce de novo noutro lugar, e a ampliação tenta a escada inteira.** A ampliação no lugar (D-116) só tentava o maior degrau que a cidade justifica, e em volta de todo templo, teatro e monumento dos mundos prontos há estrada, estátua, sobrado, oficina, muro ou água: Mênfis da megalópole, nível 5 e 140 pessoas, com a pedra de uma pirâmide, ficou 25 anos com o santuário de 8 m. Decidido (`V.grow`): (1) os degraus acima do que o prédio tem são tentados do maior para o menor, como numa obra nova (D-106); (2) sem espaço em volta para um degrau, ele é erguido de novo noutro lugar (`V.findSite`, e a abertura de espaço do D-115), e o antigo fica como está — o templo novo ao lado do santuário velho; só o maior prédio do tipo na cidade pede, e nunca uma segunda maravilha (a maravilha é uma, do povo); (3) uma obra grande de cada vez: um templo ou um monumento de degrau maior em obra também conta (antes só as cívicas); a crônica diz («… começou um Templo de 24 metros de lado: em volta do antigo, de 8, não havia espaço para crescer.»). Uma vila não (não justifica o degrau). Provas: `qa/degraus.js` g5, g5m, g5v. |
| D-176 | decisão (do agente M) | **A maravilha do campo guardado vem primeiro.** Num mundo do zero (semente 103) Mênfis guardou o campo de 40 m no ano 40 e até o ano 80 nunca pediu a pirâmide: a maravilha é o último desejo do planejador, atrás de cada praça, mercado, biblioteca, teatro e banho, com uma obra cívica de cada vez. Decidido (`plan`, `village.js`): quando o planejador deseja a maravilha e a capital guarda o campo dela (`set.urb.res`), ela passa à frente de toda obra que não é de viver nem de guardar a cidade e da subida de degrau dos outros prédios (`V.grow`); e enquanto ela não começa (a madeira curta hoje), nenhuma outra obra cívica começa no lugar dela — senão a obra grande da vez seriam os banhos, e a maravilha esperaria anos de novo. Prova: `qa/degraus.js` g6. |
| D-177 | decisão (do agente M, fecha a T-447) | **A família rica pede a casa rica.** O degrau `domus` da casa (2 casas, 8 m, a casa do pátio) é escolha da família (D-106), e ninguém pedia. Decidido (`act-casa.js`, `K.rich`, `K.orderRich`, no dia de cada cidade): pede o dono da casa em que mora, adulto, que depois de pagar fica com pelo menos 40 moedas da sua parte no pote da casa (`K.RICH`: o que faz uma casa «rica» aos olhos da cidade, `urban.js`); numa cidade (nível 2+) de um povo de moeda que sabe o degrau; nunca quem já mora numa casa rica ou numa casa de bandeira, quem precisa de casa (esse vai pela outra porta) ou quem já espera uma. Onde: só em terra cara (`G.Urban.valueAt` ≥ 40, a terra onde a cidade já levanta sobrado), pelo buscador da cidade no tamanho do degrau. Como: os materiais e o chão pagos pelo livro («obra-casa», da casa da família para a obra; a obra que se perde devolve), a obra dos construtores do povo, a mudança quando fica pronta — tudo pelas portas que a casa comum já tinha. Uma casa rica em obra em cada cidade de cada vez, depois das famílias que precisam de casa. A casa antiga continua dela. O corpo do deus não pede por esta porta (T-763). Só o `act-casa.js` pede o degrau da família (nem o `social.js` nem o `trade.js` mudaram). Provas: `qa/casa-rica.js` r1 a r7; em dois anos de salto na metrópole duas famílias a pediram sozinhas e uma já estava de pé. |
| L-780 | bug (consertado nos Bairros Vivos; achado pela prova `degraus` g6) | **O campo guardado esperava um plano de ruas que servisse.** A fundação da obra no campo guardado (`resSite` → `resFits`) julgava as ruas do lote pelo plano de ruas da cidade (`G.City.onStreet`), e não só pelas que estão no chão; o plano é refeito a cada prédio que muda, e uma rua só planejada através do lote — nunca calçada —, que o anel não religasse, fazia a obra «esperar» para sempre. Conserto: num campo já guardado, na fundação, contam as ruas calçadas (`relinks(…, laid)`); o plano se redesenha em volta da obra quando ela existe. A escolha do campo e a ronda diária ficam como eram. Prova: `degraus` g6 (falhava: a capital com o campo guardado não pedia a maravilha; passa). Sabotagem s16. |
| L-781 | bug (consertado nos Bairros Vivos; a lacuna «cidade/juntar» da matriz) | **O voto e o pão eram à porta do palácio, com a praça vazia ao lado.** `Po.crowd` (o voto, o pão dos celeiros) juntava o povo onde o governante recebe (`Po.seat`): a porta do melhor palácio quando há um — em Tenochtitlan, a 33 casas da praça —, e a crônica dizia «na praça». A auditoria dos ajuntamentos: a sentença e a execução já eram na praça (`justice.js`), a festa também (`festivals.js`), a história ao pé do fogo fica no fogo, a audiência é do palácio (D-124). Conserto: a porta `Po.forum(set)` — a praça mais antiga da cidade; sem praça, onde o governante recebe, como antes — para o voto, o pão e o lugar da notícia da eleição. Prova: `qa/juntar.js` (24 linhas). Sabotagens f1, f2. Os lugares da planta para quem vem à praça continuam abertos (T-762). |
| L-782 | bug (do próprio D-175, nunca publicado; achado pela prova vizinha `escala` e7 e e9 antes do fecho; consertado) | **O santuário sem espaço erguia o templo noutro lugar, e o que tinha espaço nunca crescia.** O `V.grow` novo perguntava prédio por prédio, na ordem em que nasceram: o primeiro templo da cidade, sem espaço em volta, erguia o degrau de novo noutro lugar antes de a cidade perguntar ao segundo, que tinha espaço para crescer onde está (em Roma da metrópole, o santuário da prova no meio de um lote livre de 4 casas: `escala` e7b «V.grow ampliou temple#27028» — um prédio novo, não o santuário). Conserto: antes de erguer um degrau de novo, a cidade pergunta se outro prédio do tipo tem espaço em volta para esse degrau (`roomFor`); se tem, é a vez dele, mais adiante na mesma ronda. Prova: `escala` e7 e e9 (falhavam: 15 passam, 3 falham; passam: 31 e 0 com e0, e7 a e10, e15, e16). Sabotagem s17 (acusada por e7b e e9b). |
| T-760 | limite (aberto) | **A obra grande longe dos armazéns quase não anda.** O lote de um degrau grande pode ficar longe do meio da cidade (D-120); a 34–39 casas de todo armazém uma carga leva um dia inteiro de quem a leva (o caminho contra o dia de 200 s, a fome, a sede, o sono) — medido: o palácio de Tenochtitlan a 34 casas, o teatro de prova de Mênfis a 39: 4 a 51 de pedra em três anos, contra 88 em dois a 14 casas. A vez que alcança longe (D-174) e a pedreira em volta da obra ajudam onde há rocha perto dela; o que resolveria é um ponto de entrega ao pé da obra (o «acampamento da obra»: uma fogueira é ponto de entrega e não custa material, mas uma fogueira nova é também um núcleo de casas do `G.Urban` e o fogo das histórias — precisa de desenho próprio). E uma capital pequena tem poucos braços: Roma da metrópole, 41 pessoas, tem 4 construtores (as provas dos braços e dos anos usam uma capital de 60 ou mais). |
| T-761 | limite (aberto) | **A terra das capitais velhas.** Nos mundos dos anos 500 e 1000 Mênfis tem 772 a 979 de pedra em estoque e nenhum lote de 6, 8 ou 10 casas («nenhum seco e sem prédio»: água, muro ou estrada, prédio de outra cidade, relevo). A D-175 dá o degrau de novo onde há lote; onde não há, nada. Não mexi na terra (aplainar — a D-120 (3), nunca feita —, o coração de outra cidade, o degrau antigo no lugar): são regras de terreno que pedem medida própria. |
| T-762 | limite (aberto) | **Quem vem à praça não toma os lugares da planta.** A praça tem os lugares de ouvir, conversar e falar (a planta, `int-civicos.js`), mas o repartidor (`In.places`) dá lugar a quem o mundo tem «dentro» do prédio (`v.inside`), e o desenho do deus não mostra quem está dentro: num chão aberto, a multidão da praça sumiria da vista do deus. Para fechar: o deus desenhar quem está «dentro» de um chão aberto no lugar que o repartidor deu (`render.js`), e então o ajuntamento entrar pela porta dos lugares (`In.placeRule('praca')`). |
| T-763 | limite (aberto) | **O corpo do deus não tem a oferta da casa rica.** A família do corpo é do jogador para decidir (L-452): o dia da cidade a pula; a oferta no armazém (`casa.encomendar`) continua a da casa de que se precisa. |
| T-764 | limite de medida | **O efeito da turma sobre a gente não se separa do acaso das histórias.** Mundos do zero, a mesma semente antes e depois: nos primeiros 30 anos, sem obra grande, a gente é quase a mesma (semente 7: 101/141/149 contra 98/142/151; semente 41: 93/128/106 contra 96/124/119); depois as histórias se separam (guerras, colônias): no ano 51 a semente 7 tinha 224 antes e 156 depois, a 41, 180 antes e 186 depois; na megalópole, 25 anos, de +3% a +29% no caminho e −3% no fim. Duas sementes não dizem a direção: a regressão mede em mais. |
| T-765 | limite (aberto; a lacuna «palácio/morar» da matriz) | **O governante não mora no palácio.** Não fiz. O porquê e o caminho: seção 9 do bloco M. |
| T-766 | limite (aberto) | **A mesa em casa** (sentar-se à própria mesa na refeição de casa): não comecei. |

## 3. Os números de depois

Medidos com o mesmo roteiro (`traca.js`), no mesmo mundo pronto, antes (a base `61dc62b`, exportada em `scratchpad/ag/M/base/`)
e depois. **Estes números são de uma versão intermediária do código** (a pedra guardada, a turma, o degrau de novo, a maravilha
primeiro — antes dos últimos ajustes: a vez que alcança longe, a casa paga diante da obra grande, a L-780); com o código final
o que medi foi o que as provas dizem (seção 8) e o caso g8 (abaixo).

**Megalópole, anos 50 → 75, sem a mão do deus:**

| | antes | depois |
|---|---|---|
| Roma | o teatro de 6 em obra 21 anos (51 → 72); o Coliseu fundado no ano 74, a 0% no 75 | **o Coliseu (10 casas, 40 m) fundado no ano 51 e de pé no 68** |
| Mênfis | o santuário de 8 m; «sem lote para ampliar» 25 vezes | **o Grande Templo de 24 m fundado de novo (de pé por volta do 57) e o Grande Monumento de 16 m (por volta do 62)** |
| a gente do mundo (anos 59/62/65/68/71/74) | 508 / 475 / 524 / 575 / 636 / 703 | 570 / 611 / 679 / 694 / 676 / 680 |

**Mundos do zero (continente de 128, 4 povos), a gente por década até o ano 51:** semente 7: 101/141/149/165/224 antes,
98/142/151/133/156 depois; semente 41: 93/128/106/137/180 antes, 96/124/119/183/186 depois (a semente 41 tinha uma maravilha de
10 casas a 28% no ano 51, sem a mão). As primeiras décadas são iguais; depois as histórias se separam (T-764).

## 4. As linhas do README (prontas para colar)

| `degraus.js` | `[ONLY=g1,g5] [MUNDO=mega] [SEMENTES=41,7 ANOS=90] node degraus.js` | Os degraus grandes nascem sozinhos (D-174 a D-176, L-780), em Node: a pedra da obra grande — a marca do planejador, o que ela guarda, o que sobra para o calçamento e as carroças, nenhuma casa melhorada, sem a vez a pedra é de todos, a vez alcança a obra longe (g1); os braços — o construtor que quebra pedra, a turma, a carga direto à obra, a pedreira do povo (g2); a obra anda no salto, custa e demora o do degrau, o save no meio e o mesmo futuro duas vezes (g3); sem pedra o povo não pede e a obra em curso espera (g4); o degrau erguido de novo, do maior para o menor, uma obra grande de cada vez, nunca outra maravilha, uma vila não (g5, g5m, g5v); a maravilha do campo guardado primeiro (g6); a guerra no meio (g7); mundos do zero pelo salto: uma capital ergue sozinha um degrau grande e nenhuma vila (g8). g1–g7 ≈ 3,5 min; g8: ver o bloco. Cobre `village.js` (o planejador, `V.grow`, a pedra guardada, os ofícios), `villagers.js` (a obra, a pedreira do construtor), `city.js` (a pedra do calçamento e das carroças). |
| `degraus-inv.js` | (carregado pelas provas: `M.load({ qa: true, extra: ['qa/degraus-inv.js'] })`) | As invariantes do bloco M, para o `junta-inv.js` juntar ao `qa.js`: a obra grande da vez (`set.gw`) é uma obra pública em curso da própria cidade; o que ela guarda (`V.keeps`) é finito e nunca mais do que a obra espera de pedra; uma família, uma casa encomendada; a casa rica encomendada é o degrau maior, com o preço pago; o chamado do voto ou do pão aponta para uma praça quando a cidade tem uma. |
| `casa-rica.js` | `[ONLY=r1,r3] node casa-rica.js [mundo]` | A família rica pede a casa rica (T-447, D-177), em Node, num mundo pronto: o pedido em terra cara, pago pelo livro, com a conta e o trabalho do degrau (r1); o dia da cidade pede por ela, depois de quem precisa de casa, uma de cada vez (r2); a obra, a mudança, a casa antiga, a planta, o save no meio (r3); quem encomendou morre, a família inteira morre (r4); o deus derruba a obra e as moedas voltam (r5); quem não pede (r6); o planejador nunca a ergue, e em dois anos de salto as famílias a pedem sozinhas (r7). Cobre `act-casa.js` (`K.rich`, `K.orderRich`). |
| `juntar.js` | `[ONLY=j1,j3] node juntar.js [mundo]` | O povo se junta na praça (L-781; «cidade/juntar»): o voto e o pão na praça, e os chamados chegam (j1, j2); sem praça, onde o governante recebe (j3); a audiência continua no palácio e a ronda no posto (j4); duas praças, a praça que o deus tira no meio, o save (j5). ≈ 45 s. Cobre `polity.js` (`Po.forum`, `Po.crowd`). |

## 5. As entradas do `regress.sh` (fase «fundacao», na linha dos Bairros Vivos)

```
F degraus degraus.js; F casa-rica casa-rica.js; F juntar juntar.js;
```

(as três rodam em Node, sem navegador; `degraus.js` sem `ONLY` roda também o g8 — o tempo dele está na seção 8.)

## 6. As regras novas do `guard.js` (57 e 58, prontas para colar)

```js
// 57. "a obra grande da vez é do planejador" (D-174): a marca da obra grande que guarda a pedra do povo (set.gw) só o
// js/village.js escreve (o planejador, cada vez que planeja a cidade); quem gasta a pedra do povo no que nunca acaba (calçar, a
// carroça do comércio, melhorar uma casa) pergunta a V.stoneSpare; quem quer saber da obra, a V.keeps / V.stoneKept /
// V.quarries. (o «X.gw» do build3d.js é o chão da forma no 3D, outra coisa)
const GW_OK = [['build3d.js', 'X.gw = gw;']];
for (const f of files) if (f !== 'village.js') src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/\.gw\s*=(?!=)/.test(c) && !ok(GW_OK, f, l)) fails.push(`obra grande: ${f}:${k + 1} escreve a obra grande da vez (set.gw) fora de village.js (D-174): ${l.trim().slice(0, 110)}`); });
// 58. "a casa rica é da família" (D-177, T-447): o degrau da família (G.Escala: «familia») só o js/act-casa.js pede — o
// planejador, o social.js e o trade.js nunca erguem uma casa rica; a família a encomenda e a paga pelo livro (K.orderRich)
for (const f of files) if (f !== 'act-casa.js' && f !== 'escala.js') src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/familia\s*:\s*true/.test(c)) fails.push(`casa rica: ${f}:${k + 1} pede o degrau da família fora de act-casa.js (D-177): ${l.trim().slice(0, 110)}`); });
```

(conferidas contra o código do ramo: ver a seção 8.)

## 7. As frases do CLAUDE.md (as portas novas)

- **A pedra da obra grande — `G.Village.keeps` / `stoneKept` / `stoneSpare` / `quarries` / `workPri(b, v)`** (`js/village.js`,
  D-174): a obra grande que espera pedra numa cidade com a vez é marcada pelo planejador (`set.gw`, no save com a cidade; só o
  `village.js` escreve — o `guard.js` cobra, regra 57) e guarda a pedra do povo que ainda espera. Quem gasta a pedra do povo no
  que nunca acaba (calçar, a carroça do comércio, melhorar uma casa de pé) pergunta a `V.stoneSpare(fid)`, nunca a
  `f.stock.stone`. A cidade da obra tem a turma (`V.GANG` dos adultos, construtores — nunca «mineiros», que as minas tomam), as
  outras cidades alimentadas do povo, a pedreira (`V.GANG_Q`); o construtor da turma sem nada para assentar quebra pedra em
  metade dos dias (`V.quarries`, pelo dia e pelo `G.hash`, sem sorteio) e a leva direto à obra. A vez da obra grande alcança a
  obra longe três dias em quatro (`V.workPri(b, v)`). `qa/degraus.js` prova.
- **O degrau maior nasce de novo — `G.Village.grow`** (D-175, D-176): a ampliação tenta a escada do maior para o menor; sem
  espaço em volta, o degrau é erguido de novo noutro lugar e o antigo fica; uma obra grande de cada vez, nunca uma segunda
  maravilha; a maravilha do campo guardado passa à frente das outras obras cívicas (`plan`). O campo já guardado é julgado, na
  fundação, pelas ruas calçadas, não pelo plano de ruas (L-780).
- **A casa rica é da família — `G.Casa.rich` / `G.Casa.orderRich`** (`js/act-casa.js`, D-177): só o `act-casa.js` pede o degrau
  da família (o `guard.js` cobra, regra 58): o dono rico da casa em que mora, em terra cara (`G.Urban.valueAt` ≥
  `K.RICH_LAND`), pago pelo livro («obra-casa»), uma em obra por cidade, depois de quem precisa de casa (`qa/casa-rica.js`).
- **Onde o povo se junta — `G.Polity.forum(set)`** (`js/polity.js`, L-781): o voto e o pão são na praça mais antiga da cidade;
  sem praça, onde o governante recebe (`Po.seat`). Ajuntamento novo pergunta a `Po.forum` (`qa/juntar.js`).

## 9. O que ficou aberto

- **T-760** a obra grande longe dos armazéns (uma carga por dia); a proposta: o ponto de entrega ao pé da obra.
- **T-761** a terra das capitais velhas (anos 500 e 1000): nenhum lote; aplainar nunca foi feito.
- **T-762** os lugares da planta da praça para quem vem ao ajuntamento (o deus não desenha quem está «dentro»).
- **T-763** a oferta da casa rica ao corpo do deus.
- **T-764** a gente do mundo medida só em duas sementes do zero e na megalópole.
- **T-765 — o governante mora no palácio: não feito.** O que achei ao ler: um palácio não é moradia (`G.BDEF[type].housing`
  não existe nele), e «morar» é uma teia que passa por muitas portas, cada uma com as suas provas: o repartidor de casas
  (`assignHousing`, `village.js`: só prédios de moradia, e a casa de dono não se troca), a noite em casa (`act-lar.js`: a
  regra de lugares `In.placeRule` é da casa e do templo; as camas vêm da planta de tipo «casa»), o depósito da casa (`h:` —
  as moedas e a despensa da família ficam na casa; um palácio tem o depósito `b:` do prédio), o dono e o herdeiro
  (`act-casa.js`: `b.dono`, o aluguel — a função `rent`, que o líder mudou nesta rodada), a marca da casa mercante
  (`trade.js`, D-158, do líder), a mudança (`social.js` `moveUp`, do líder), as classes da cidade (`urban.js` `houseClass`)
  e as invariantes do `qa.js` sobre `v.home`. O caminho que eu seguiria, e que não cabia com segurança no tempo: (1) uma
  planta de aposentos no palácio (camas e despensa, pela porta dos guardados, D-053), (2) o palácio como «moradia do
  ofício» — o governante e a família têm `v.home` no palácio enquanto ele governa, a casa antiga continua dele (como na
  casa rica), e a sucessão devolve a família à casa dela —, por uma porta só no `act-casa.js` ou no `court.js`, (3) as
  invariantes: quem mora num palácio é o governante do povo ou da família dele; nenhum outro prédio sem moradia tem
  morador, (4) a prova com os casos ruins: a sucessão, a deposição, o palácio tomado numa guerra, o palácio em ruínas, o
  save no meio, o corpo do deus governante. Não comecei nenhum código disto.
- **T-766 — a mesa em casa: não comecei.**
- **Um arquivo perdido fora do repositório**: `/g5.txt` (807 bytes, na raiz do sistema de arquivos), criado por engano meu
  quando uma variável de saída estava vazia num comando. A verificação de segurança não me deixou apagá-lo; fica para o líder
  ou o dono apagar (`rm /g5.txt`). Não é do jogo.
