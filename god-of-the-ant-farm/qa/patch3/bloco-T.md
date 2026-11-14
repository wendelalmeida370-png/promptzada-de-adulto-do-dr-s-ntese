# Bloco do agente T — as termas grandes (T-784)

> Pronto para colar. Números usados: D-182, D-183, D-184; T-820 a T-828. Livres: L-820 a L-839 (nenhum bug do jogo de antes
> foi achado), T-829 a T-839, D-185, e as regras 62 e 63 do guard (ver o item 4). Tudo o que está dito «passa» foi rodado
> nesta árvore (o ramo `worktree-agent-a3af712c842981954`, sobre o 20b0a58); o que não foi rodado está dito.
>
> **Arquivos novos em `js/`:** `forma-termas.js` (depois do `forma-poder.js`) e `int-termas.js` (depois do `int-palacio.js`,
> antes do `int-monumentos.js`) — as duas linhas `<script>` já estão no `index.html`.
> **O catálogo das plantas** (`js/int-catalogo.js`) foi gerado de novo no commit **529415d**, junto com a recusa das famílias de
> receita e o caso novo da `qa/escala.js` (não ficou num commit só dele: o líder gera de novo ao juntar). O que mudou nele: 36
> chaves novas `banhos|{classico,grego,romano}|h|w|n5` e `|n7`; nenhuma chave de antes mudou (`node qa/catalogo.js confere 12` passa).
> **Não toquei** em `village.js`, `city.js`, `polity.js`, `act-casa.js`, `villagers.js`, `interiors.js`, `escala.js`.

## 1. Linhas do AUDIT (seção da Arquitetura Monumental — ou a dos Bairros Vivos)

| T-784 | limite de teste (fechado em parte, T: as termas; a grande biblioteca, o mercado coberto e o paço seguem abertos — ver o item 6) | **As termas de 20 m e as grandes termas de 28 m dos povos da terma existem**: a forma (`js/forma-termas.js`), a planta pela forma (`js/int-termas.js`), o 3D e a vista do deus pela forma, o dia dos banhos nas piscinas delas. O degrau já estava na escada (`escala.js`: termas, 5 casas, 120 pessoas; grandes termas, 7 casas, cidade de nível 4 com 220) e liga-se sozinho com a forma do tamanho (`Es.can` pergunta ao `Fo.has`). Provas: `qa/termas-grandes.js` (33 linhas), `qa/visual/termas-3d.js` (5), `qa/visual/termas-corpo.js` (15); as regras do verificador em `qa/termas-grandes-inv.js`. |
| D-182 | decisão (T: `forma.js`, `stylesOf`) | **Uma forma de tamanho só cai no desenho do povo clássico para um povo que não tem forma clássica própria desse tipo.** As formas de tamanho (`Fo.def(tipo, povo, fn, [n…])`) procuravam primeiro a do povo e depois a do «clássico». Com as termas definidas só para o romano, o grego e o clássico, o `Fo.has('banhos', 'egipcio', 5)` respondia que sim — o egípcio, o asteca e o nórdico ganhavam «as termas do clássico» de 20 e 28 m no lugar do lago sagrado, do temazcal e da sauna (que são outros três desenhos, não feitos). Agora a queda no clássico vale só quando o povo não tem forma clássica do tipo (`FORMS[tipo][povo]`): quem tem a sua fica com os tamanhos que ela tem. Nenhum tipo de antes muda (todos os seis povos têm as suas formas de tamanho nos templos, palácios e teatros). Prova: `termas-grandes` A1 (o degrau só nos povos da terma), `qa/escala.js` e0c. Sabotagem s2 (a queda para todo povo): A1 falha («egipcio: termas oferecidas a um povo sem termas»). |
| D-183 | decisão (T: `forma-termas.js`, `int-termas.js`, `build3d.js` `riskSkip`) | **As termas têm desenho próprio — não são os três cômodos dos banhos da vila aumentados.** A forma guarda um «risco» (como o templo e o palácio: `riscoTermas`, a família `forma.banhos`) que a planta deita pela camada `In.riskLayer` e que o 3D e o deus desenham. **As termas (5 casas, 20 m):** a escadaria larga na frente do lote, a palestra aberta com a colunata (8 colunas), o portal; dentro, seis cômodos — o vestiário com os 6 cabides, o frigidário com a piscina fria, o tepidário com a morna, o caldário com a quente sob a cúpula, a fornalha no cômodo dela encostada na parede do caldário, o de serviço —, 24 lugares na água em 3 piscinas. **As grandes termas (7 casas, 28 m):** simétricas em torno do eixo da entrada — dois vestiários (12 cabides), dois tepidários, a fornalha e o suadouro nas pontas, o caldário no fundo com três piscinas quentes sob a cúpula, a grande sala fria no meio com duas piscinas, quatro colunas e o clerestório com janelas acima do beiral, e na palestra duas piscinas abertas de natação —, 120 lugares na água em 9 piscinas. O romano tem a cúpula sobre tambor e telhados de quatro águas (15,3 e 17,9 m de altura); o grego e o clássico, o frontão e a cúpula baixa (13,5 e 15,9 m). No degrau maior a única família de planta oferecida é a da forma (as oito de receita recusam, dizendo «as termas de um degrau maior são as da forma»); o degrau clássico fica com as nove que tinha. No 3D, as janelas que a forma pinta nas paredes da casca são as da planta (com o vidro dela) e não se desenham duas vezes; as do clerestório, acima do beiral, são da forma. Os banhos clássicos de cada povo — a forma e as plantas — ficaram iguais (A4: um número por povo, igual ao do 20b0a58). Provas: `termas-grandes` A1–A5, B1–B7, C1–C2; `visual/termas-3d` t1–t4; `visual/termas-corpo`. Sabotagens: s1 (a cúpula fora do caldário → A3), s3 (as famílias de receita oferecidas → B1, B7), s4 (a planta não deita as piscinas mornas → B3, B4, C2, H1, H2 e `termas-corpo` 2), s5 (espelhos de meio metro → B5, C1), s9 (a fornalha longe da parede do caldário → A3), s10 (a janela da forma por cima da da planta → `termas-3d` t1: «13 com dois vidros»), s13 (a cúpula dos banhos clássicos maior → A4), s15 (as termas ao preço dos banhos → A5). |
| D-184 | decisão (T: `act-servicos.js`, `pool`; `int-termas.js`, a ordem das piscinas) | **Cada banhista entra na piscina mais vazia.** O repartidor dos lugares dava a quem entrava na água o primeiro lugar livre da tabela: nos banhos de várias piscinas todos se apertavam na primeira e as outras ficavam vazias (nas grandes termas, 16 banhistas em 2 das 9 piscinas). Agora, ao sair dos cabides, o banhista escolhe a piscina com a menor parte dos lugares tomada (no empate, a ordem da planta — que nas termas é: as quentes, as mornas, as frias, as abertas) e a tarefa dele leva a peça (`t.item`, que o repartidor já respeitava); o livro do dia guarda a piscina de cada um (`m.it`) e o gancho do save a devolve. Não muda nada do mundo — nem quantos cabem na água, nem o caixa, nem o banho —, só onde cada um aparece; vale também para os banhos clássicos de planta com mais de uma piscina. Prova: `termas-grandes` D1 (10 banhistas nas 3 piscinas das termas, 16 nas 9 das grandes, o primeiro na do caldário), D3 (os mesmos 20 lugares depois do save), E2a/E2b (num mundo de verdade). Sabotagens: s6 (sem escolha → D1), s8 (o save não devolve a piscina → D3), s11 (a planta na ordem do risco, as frias primeiro → D1). |
| T-820 | limite de teste (aberto, do líder: é uma decisão de equilíbrio) | **Em nenhum mundo pronto uma cidade de um povo da terma chega às 120 pessoas que a escada pede para as termas.** Medido (`G.Escala.choose` em cada cidade): na metrópole, Argos (grego) tem 89 e Roma 41; no mega, Roma 91; no mundial, nos anos e na cidade, nenhuma cidade romana, grega ou clássica passa disso (as capitais grandes são egípcias). Com os números de hoje (termas: 120; grandes termas: nível 4 e 220) nenhuma cidade dos mundos prontos ergue as termas sozinha — elas existem no jogo pela mão do deus, ou num mundo jogado por mais tempo. Não mexi no `escala.js` (mudar o limite muda o que as cidades constroem nos mundos gerados e nas provas dos outros agentes). Sugestão: termas com 80 pessoas (Argos e a Roma do mega as ergueriam) e grandes termas com nível 4 e 160; ou deixar como está e dizer no relatório do dono que as termas são de metrópole. A prova F1 mostra o caminho inteiro trazendo gente pela mão da prova. |
| T-821 | limite de teste (aberto) | **Não vi a cidade acabar as termas sozinha.** Na F1, Argos (com 125 pessoas e a pedra dadas pela mão da prova) funda as termas pela porta dela (`G.Village.startProject`), a 34 casas do meio, com a conta e o trabalho do degrau — e em 6 anos de mundo os pedreiros levam a obra de 0 a 14 % (com adultos sem casa no lugar das crianças: 17 %). A obra anda, mas no passo das grandes obras da cidade (D-117, D-120: a vez dos pedreiros, a casa e a comida primeiro). Não segui adiante: a prova termina a obra pela mão só na F2 (a ampliação), e a vida das termas prontas está provada na E1b (um ano de mundo com elas de pé), na E2 e na G1. |
| T-822 | limite de teste (aberto, do desenho) | **De dentro das termas o teto é liso, na altura do beiral**: a cúpula do caldário e o clerestório da grande sala veem-se de fora (de perto e de longe: `termas-3d` t1, t3) e na vista do deus, mas o 3D de dentro fecha cada cômodo com o teto plano da planta (`inRoof`, o tipo «plano»). Abrir a cúpula por dentro pede um teto de interior pela forma, que o `build3d.js` não tem para nenhum prédio. |
| T-823 | limite de teste (aberto, de antes — para o líder olhar antes da regressão) | **Três linhas que a linha de base tem como PASSOU falham no próprio 20b0a58, nesta máquina, e falham igual neste ramo:** `escala e19h` («5 de 6 mandados aos jogos; o camarote não encheu»), `escala e19i` («sem save») e `termas e1 um-dia-dos-banhos` (o Temazcal de Tenochtitlan, na metrópole: «lenha 0» — o foguista não acende a fornalha no tempo do caso, o banho sai frio). Rodei as duas provas numa cópia do 20b0a58 (o `git archive` dele, com os mundos prontos dele) e o texto das três falhas é o mesmo, letra por letra. Não são das termas (a escolha da piscina não muda o mundo, e o Temazcal tem uma piscina só). Na regressão vão aparecer como `NOVO:` com ou sem este ramo. |
| T-824 | limite de teste (aberto) | **As figuras das termas são do desenho por software das provas** (`visual/fidelidade-lib.js`), como as do E: cor chapada, sem os padrões das pedras, sem sombras, e a cúpula do deus sem o degradê. Servem para ver a forma e a planta; as de navegador saem na regressão. |
| T-825 | limite de teste (aberto) | **O povo clássico não tem cidade em nenhum mundo das provas** (os prontos e o da semente 103): as termas dele — o desenho do grego — estão provadas na forma, na planta, nos pés e no dia de mentira (A, B, C, D2 e `termas-3d`), não num mundo de verdade. |
| T-826 | limite de teste (aberto) | **Os banhos que Roma tem na metrópole não têm lote de 5 casas em volta** (`G.Village.growLot` não acha: estão fechados entre as casas) — a cidade não os ampliaria nem com gente. A prova da ampliação (F2) usa banhos postos pela mão do deus em chão livre de Lavínio, e ali é a porta do planejador (`G.Village.grow`) que amplia. |
| T-827 | limite de teste (aberto) | **Junto de Roma e de Argos da metrópole a mão do deus só acha lote de 7 casas em ladeira** (10,7 e 12,3 m de desnível, a 19 e 18 casas do meio): as grandes termas ficam de pé com a planta e o relatório sem defeito, mas a entrada não é cobrada ali (como nos palácios e templos de mão em ladeira). Em chão plano (as termas de 5 nas duas cidades, e as quatro do mundo novo) a entrada cabe. A cidade, pela porta dela, só funda em lote que o pódio cobre (`V.PODIUM`). |
| T-828 | limite de teste (aberto) | **A prova do corpo não pega um espelho alto**: com os degraus da escadaria a 37 cm (a sabotagem s5), o controle do corpo ainda sobe e a `visual/termas-corpo.js` passa; quem pega é a regra da planta (B5: espelho ≤ 0,30 m) e os pés medidos (C1). |

## 2. Linhas do README das provas

| `termas-grandes.js` | `node termas-grandes.js [A1,B,…]` (`VERB=1` cada caso que falha; ~4,5 min inteira, as partes A a D em 10 s) | As termas (5 casas) e as grandes termas (7 casas) dos povos da terma (T-784, D-182 a D-184), em Node. **A** a forma e a escada: o lote, o pé, o risco, o degrau só no romano, no grego e no clássico; o desenho próprio (os cômodos por função, cada piscina no seu, a cúpula sobre o caldário, a fornalha na parede dele, a simetria das grandes); os banhos clássicos iguais aos de antes (um número por povo); a conta da obra. **B** a planta nos quatro lados, dois degraus e três povos, só pela família da forma; a mesma duas vezes; as paredes de meia; os lugares (24 e 120 na água, 6 e 12 cabides, a fornalha, os bancos) alcançados da porta; as regras do corpo; o tempo. **C** os pés da rua até dentro a cada 2 cm; o caminho do jogo a cada lugar. **D** o dia dos banhos numa vila de mentira com a planta do degrau: o foguista, os banhistas cada um no seu lugar de piscina (na mais vazia), a casa cheia e a espera nos cabides, o save no meio, o corpo do deus. **E** de pé num mundo pronto e num novo pela mão do deus; um dia de verdade nas termas de Argos e nas grandes termas de Roma, com um save no meio carregado duas vezes. **F** a cidade funda as termas sozinha (com gente pela mão da prova: T-820) e amplia os banhos que tinha. **G** a obra salva no meio, as termas derrubadas com gente na água, o foguista que morre; um save de antes abre igual. **H** as regras do verificador pegam a mentira. Sabotagens: 16 (`s1` a `s16`), cada uma pega pelo caso dela. |
| `termas-grandes-inv.js` | (carregado pelas provas: `M.load({ qa: true, extra: ['qa/termas-grandes-inv.js'] })`; o líder o junta) | As regras do verificador dos lugares na água (sistema `termas`), para os banhos de qualquer degrau com planta: nunca mais gente na água que os lugares de banhar da planta (S2); quem está na água está num lugar de piscina (S3; fora quando o corpo do deus está lá dentro); as termas de um degrau maior, de pé, têm três piscinas ou mais alcançadas da porta, 20 lugares na água, 4 cabides e a fornalha com o posto do foguista (S2). |
| `visual/termas-3d.js` | `node visual/termas-3d.js [t1,t2,…]` (1 s) | As termas no 3D e na vista do deus, em Node, sem navegador: cada uma num chão plano, medida por raios. **t1** as janelas da casca com um vidro só (o da planta), o clerestório das grandes com os seus; **t2** de dentro, cada peça da planta desenhada, a água na bacia de cada piscina, as colunas da grande sala no lugar; **t3** de longe a cúpula e o bloco, dentro dos tetos de triângulos; **t4** o deus pinta sem peça que falte. |
| `visual/termas-corpo.js` | `node visual/termas-corpo.js [termas\|grandes]` (30 s) | O corpo do deus vai da rua a cada piscina, com o controle do próprio corpo, quadro a quadro (como a `visual/corpo-casa.js`), nas termas de Roma e nas grandes termas de Argos do mundo da semente 103: a escadaria, a palestra, um cabide, a beira de cada piscina (3 e 9), a fornalha, um save lá dentro, de volta à rua; em todo quadro os pés no chão da planta. |
| `visual/termas-fotos.js` | `node qa/visual/termas-fotos.js <pasta> [nome,…]` (de dentro de `god-of-the-ant-farm/`; 5 s) | As figuras das termas para o relatório (não é prova): antes e depois, a vista do deus e o 3D, de fora, a planta colorida e cada cômodo de dentro (`qa/patch3/fotos-T/`). |

E na linha da `escala.js`: «e0c os banhos — o degrau maior só nos povos da terma, e só na cidade que o justifica».
E na folha dos banhos da matriz (`qa/categorias/p2.js`, a atividade `banho`): a prova `qa/termas-grandes.js` entrou na lista (já está no ramo). A `qa/MATRIZ-PREDIOS.md` **não** foi gerada de novo no ramo: sem a pasta da regressão a `matriz-predios.js` rebaixa as categorias de «validada», e deixei o arquivo como estava — o líder a gera com o resultado da regressão.

## 3. Entradas do `regress.sh`

Na fase «fundacao», junto das provas dos ofícios e serviços (onde estão `termas-mao` e `termas`):

    F termas-grandes termas-grandes.js;

e junto das provas visuais em Node (a linha do `F corpo-rig visual/corpo-rig.js; F monumentos-ajustes visual/monumentos-ajustes.js; …`):

    F termas-3d visual/termas-3d.js; F termas-corpo visual/termas-corpo.js;

Linhas novas que a linha de base vai ganhar (todas PASSOU): `termas-grandes A1` a `A5`, `B1` a `B5`, `B6a`, `B6b`, `B7`, `C1`, `C2`, `D1` (duas), `D2` (duas), `D3`, `D4` (duas), `E1a`, `E1b`, `E2a`, `E2b`, `F1`, `F2`, `G1`, `G2`, `H1`, `H2`, `termas-grandes erros`; `termas-3d t1.` a `t4.` e `termas-3d sem erro do jogo`; as 15 linhas da `termas-corpo`; e `escala e0c` (a `qa/escala.js` já está na regressão).

## 4. Regras do `guard.js`

Nenhuma regra nova. O que as termas têm de «só tal arquivo…» já é cobrado pelas regras que existem: a forma pura (a regra das `forma*.js`: o `forma-termas.js` entra pelo nome e pela posição no `index.html`), a planta sem acaso (a 16), o 3D só pela forma (a 28), o lugar de alguém só pelo repartidor (a 29: a escolha da piscina conta pelo `In.slots` e pelo `In.places`, sem ler os pontos de uma peça). O guard passa com os dois arquivos novos. As regras 62 e 63 ficam livres.

## 5. Frases para o `CLAUDE.md`

Em «A escala de cada prédio — `G.Escala`», depois de «…e os degraus novos vêm de arquivos próprios (`js/forma-*.js`, puros como o `forma.js`, pelo `Fo.def`)»:

> Uma forma de tamanho só cai no desenho do povo clássico para um povo sem forma clássica própria do tipo (D-182): os banhos têm as termas (5 casas) e as grandes termas (7) só no romano, no grego e no clássico (`js/forma-termas.js`, a planta em `js/int-termas.js`, D-183).

Em «Os ofícios e os serviços», no fim:

> Nos banhos, cada banhista entra na piscina mais vazia (`G.Termas.pool`, D-184): a tarefa leva a peça (`t.item`), o livro do dia guarda-a (`m.it`) e o save a devolve.

No protocolo, item 3, depois de «…as provas «-mao» e as do mundo pronto dos ofícios — `olaria`, `taverna`, `termas`, `lazer`, `obra`… —»:

> Mexeu nas termas (`forma-termas.js`, `int-termas.js`, o dia dos banhos do `act-servicos.js`)? Também `node qa/termas-grandes.js` (as partes A a D em 10 s: `node qa/termas-grandes.js A,B,C,D`), `node qa/visual/termas-3d.js` e `node qa/visual/termas-corpo.js`.

## 6. O que ficou aberto

- **O limite de gente das termas** (T-820): do líder. Com os números de hoje nenhum mundo pronto as tem sem a mão do deus.
- **A obra pelas mãos da cidade até o fim** (T-821): fundada e andando; não a vi pronta sozinha em 6 anos de mundo.
- **O teto de dentro** (T-822): liso; a cúpula e o clerestório só de fora.
- **O povo clássico num mundo de verdade** (T-825): nenhum mundo das provas tem cidade dele.
- **Os mundos prontos não precisam ser gerados de novo por causa deste ramo:** nenhum tem termas, os banhos clássicos ficaram iguais (A4; G2: os 8 banhos da metrópole e do mega abrem como no save), e a escolha da piscina não muda o mundo (o `det3` e a vida curta passam — ver o relatório).
- **O item 4 do pedido — o degrau maior de outro serviço — não foi começado.** Pela conta do líder o meu seria só o **mercado coberto** (a biblioteca e o paço são do B). O que medi lendo o código, para quem o fizer: (a) o degrau já está na escada (`escala.js`: `coberto`, 4 casas, 150 pessoas) e liga-se com uma forma de tamanho `Fo.def('mercado', povo, fn, [4])` — os seis povos têm mercado clássico próprio (`marketF`), então pelo D-182 cada povo precisa da sua forma de 4 (ou só alguns o terão); (b) a planta é um `In.formSized('mercado', fn)` como o `int-termas.js`; (c) o trabalho que as termas não tinham: o mercado é chão de bancas — as bancas são do `act-negocio.js` (`G.Biz`, `S.biz`; a regra 18) e o lugar do balcão vem da planta por `G.Biz.spotOf(b, slot)`; um mercado de 16 m com mais bancas mexe em quantas bancas a cidade tem, em quem vende onde e nas provas do negócio (`negocio`, `compras`, `moedas`), que não são deste ramo; (d) falta decidir o desenho (a nave coberta com as bancas em duas filas, o pátio, os depósitos) e provar o dia do mercado nele como a D e a E daqui provam o dos banhos. Não comecei porque não dava para terminar provado.

## 7. O que rodei, e o que deu (na ponta do ramo, um processo de cada vez)

| Prova | Resultado |
|---|---|
| `node qa/guard.js` | PASSOU (154 arquivos) |
| `node qa/soak.js 103 continente 128 4 normal 5 1 1` (navegador) | 5 anos, nenhuma violação, erros: nenhum |
| `node qa/det3.js 77 arquipelago 96 3 2` (navegador) | PASSOU (o save carregado duas vezes: igual) |
| `node qa/oldsave.js <20b0a58> <ramo> 103 continente 128 4 3 2` (navegador) | o save do 20b0a58 carrega no ramo: 0 violações ao carregar e depois de 5 anos, nenhum erro |
| `node qa/termas-grandes.js` | 33 passam, 0 falham (4 min 28 s) |
| `node qa/visual/termas-3d.js` | 5 passam, 0 falham |
| `node qa/visual/termas-corpo.js` | 15 passam, 0 falham |
| `node qa/termas-mao.js` | 31 passam, 0 falham |
| `node qa/termas.js` | 5 passam, **1 falha** (e1 — igual no 20b0a58: T-823) |
| `node qa/escala.js` | 126 passam, **2 falham** (e19h, e19i — iguais no 20b0a58: T-823); o caso novo e0c passa |
| `node qa/palacios.js` | 17 passam, 0 falham |
| `node qa/monumentos.js` | 9 passam, 0 falham |
| `node qa/plantas.js` | 10 passam, 0 falham (13 min) |
| `node qa/lugares.js` | 18 passam, 0 falham |
| `node qa/matriz-predios.js` | PASSOU |
| `node qa/monumental-poder.js` | 61 passam, 0 falham |
| `node qa/catalogo.js confere 12` | 13 passam, 0 falham |
| `node qa/visual/fidelidade.js` | 8 passam, 0 falham |
| `node qa/visual/forma-deus.js` | 27 passam, 0 falham |
| `node qa/visual/monumentos-ajustes.js` | 12 passam, 0 falham |
| `PARTE=node node qa/visual/monumental.js` | 44 passam, 0 falham |
| `node qa/visual/guarda3d.js .` | PASSOU |
| `node qa/visual/corpo-rig.js` | 10 passam, 0 falham |
| `ONLY=e11 node qa/encarna.js SAIDA` (navegador) | 9 passam, 0 falham |
| `node qa/visual/corpo-casa.js` | 19 passam, 0 falham |
| `node qa/visual/soleira.js` | 15 passam, 0 falham |
| `node qa/visual/pe-da-escada.js` | 5 passam, 0 falham |
| `node qa/interiores.js` | 9 passam, 0 falham |
| `node qa/portas-casos.js` | 19 passam, 0 falham |

**Não rodei:** `qa/regress.sh`, `qa/prontos.js`, a prova de desempenho (proibidos nesta rodada); `qa/som.js`, `qa/sabe.js`, `qa/roupa.js`, `qa/atmosfera.js` (não mexi em gesto, na tela do corpo, na roupa nem na fumaça).

**As 16 sabotagens** (cada uma numa cópia nova do jogo; o roteiro está em `scratchpad/ag/T/sab-T.py`): s1 a cúpula fora do caldário → A3 · s2 a forma de tamanho cai no clássico para todo povo → A1 · s3 as famílias de receita oferecidas no degrau maior → B1, B7 · s4 a planta não deita as piscinas mornas → B3, B4, C2, H1, H2 e `termas-corpo` 2 · s5 os espelhos da escadaria a meio metro → B5, C1 (a `termas-corpo` não pega: T-828) · s6 sem a escolha da piscina → D1 · s7 a água sempre «tem lugar» → D2 (30 na água para 24 lugares, e a regra nova do verificador acusa) · s8 o save não devolve a piscina → D3 · s9 a fornalha longe da parede do caldário → A3 · s10 a janela da forma por cima da da planta → `termas-3d` t1 · s11 a planta com as piscinas frias primeiro → D1 · s12 a regra dos lugares na água cega a cinco a mais → H1 · s13 a cúpula dos banhos clássicos maior → A4 · s14 as termas pedidas a qualquer cidade → F1 · s15 as termas ao preço dos banhos → A5 · s16 a regra dos cômodos contente com uma piscina → H1.

## 8. As figuras (para a página do relatório)

Em `qa/patch3/fotos-T/` (38 figuras), tiradas em Node por `qa/visual/termas-fotos.js` — o desenho por software das provas: **cor chapada, sem os padrões das pedras e sem sombras** (T-824). Os bonecos cinzentos têm 1,75 m (a escala).

| Arquivo | O que mostra |
|---|---|
| `antes-depois-romano.png`, `antes-depois-grego.png` | de cima para baixo os banhos de 8 m (o «antes»: o único degrau que existia), as termas de 20 m e as grandes termas de 28 m; à esquerda a vista do deus, à direita o 3D |
| `classico-deus-3d.png` | as termas e as grandes termas do povo clássico (o desenho do grego) nas duas vistas |
| `termas-romano-rua.png`, `termas-grego-rua.png`, `grandes-termas-romano-rua.png`, `grandes-termas-grego-rua.png` | da rua, à altura do olho: a escadaria, a colunata da palestra, o bloco com a cúpula |
| `…-do-alto.png` (4) | de cima e de lado: os telhados, a cúpula do caldário, o clerestório da grande sala, a palestra com as piscinas abertas (nas grandes) |
| `…-planta.png` (4) | a planta colorida por cômodo: o vestiário, o frigidário, o tepidário, o caldário, a fornalha, a palestra; as piscinas, os cabides, os bancos |
| `…-palestra.png` (4) | de dentro da palestra, olhando o pórtico e o portal |
| `termas-…-vestiario.png`, `-frigidario.png`, `-tepidario.png`, `-caldario.png` (8) | os cômodos das termas de 20 m de dentro: os cabides, cada piscina com a sua água, a fornalha |
| `grandes-termas-…-grande-sala.png`, `-grande-sala-de-lado.png`, `-caldario.png`, `-tepidario.png`, `-vestiario.png` (10) | as grandes termas de dentro: a grande sala fria com as duas piscinas e as quatro colunas, o caldário com as três piscinas quentes, um tepidário, um vestiário |
