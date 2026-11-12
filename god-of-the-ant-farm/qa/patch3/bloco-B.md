# Bloco do agente B — a grande biblioteca (16 m) dos seis povos; o paço municipal ficou por fazer

> Pronto para colar. Números usados: L-870 a L-874, T-870 a T-876, D-192, D-193. Ficam livres: L-875 a L-889, T-877 a T-889,
> D-194 e D-195 (eram do paço), a regra 66 do guard. A regra 65 está proposta no item 4. Tudo o que está dito «passa» foi
> rodado nesta árvore; o que não foi rodado está dito no item 6.
>
> **O pedido tinha dois prédios; entrego um, inteiro e provado: a grande biblioteca.** O paço municipal não foi começado
> (T-874, com o que medi lendo o código, para quem for fazer).

## 1. Linhas do AUDIT (a seção dos Bairros Vivos)

| D-192 | decisão (B: `forma-saber.js`, `int-saber.js`, `act-lazer.js`) | **A grande biblioteca (16 m, 4 casas) é a mesma biblioteca, maior: as mesmas operações para mais gente.** O degrau `grande` da escada do tipo (`G.Escala`: 150 pessoas, a conta ×2,4 — 48 de madeira e 106 de pedra, 132 de trabalho) liga-se sozinho com a forma do tamanho de cada povo (`Fo.def('biblioteca', povo, fn, [4])`, arquivo novo e puro `js/forma-saber.js`); a planta lê a forma (`In.formSized('biblioteca', …)`, arquivo novo `js/int-saber.js`) e sai pela **mesma família** da clássica, `forma.salao` — o registro de um save antigo não muda, e a biblioteca clássica (8 m) faz a planta de antes (o resumo das 24 plantas clássicas é o mesmo na base 16310aa e neste ramo: `466df9fd`, `saber b2g`). **Cada povo com o seu desenho, sem gigantismo** (as paredes de 4,2 m — a clássica — a 6,8 m — a romana, com o entablamento —; de 6,5 a 10,8 m de alto com o telhado; o pódio de 0,5 a 1 m): a **romana**, de pórtico de seis colunas e frontão sobre a porta, a sala de leitura atravessada (13,8 × 5,9 m) e ao fundo a exedra da imagem entre o escritório e o acervo; a **stoa grega**, três salas em fila (o acervo, a sala com a imagem, o escritório) abertas para a stoa de oito colunas — com mesas sob ela — e o pátio das oliveiras; a **Casa da Vida egípcia**, o pátio murado com o tanque de lótus e as palmeiras, o pórtico de papiros, o vestíbulo entre o acervo e o escritório e a sala de quatro colunas ao fundo; o **amoxcalli asteca**, o pátio dos braseiros no alto da plataforma, o pórtico de pilares, a sala e ao fundo o acervo e o escritório; o **salão do escaldo nórdico**, o cercado de paliçada com as pedras de runas, a galeria, o salão de quatro esteios com o lar no meio; a **casa das tábuas clássica**, o pátio murado com a tina de barro e o cipreste, o alpendre de oito postes, a sala à esquerda, o acervo e o escritório à direita. **O que a planta tem** (`In.GRANDE_BIBLIOTECA`, cobrado pela própria planta e pelo verificador): 16 lugares de ler ao menos (8 mesas de duas pessoas; a grega tem 20 — as clássicas dos seis povos têm de 4 a 5), 3 mesas de escriba ao menos (as plantas têm 4), 8 estantes ao menos (de 8 a 16), a imagem com as lâmpadas onde o povo a tem, os bancos do pórtico e do pátio; cada lugar alcançado da porta da rua. **O dia** (`act-lazer.js`): `G.Biblioteca.maxOf(b)` — 16 leituras (a clássica: 8), `maxCopias(b)` — 12 cópias (6), `copistas(b)` — 3 copistas (1): o `E.jobsOf` da grande biblioteca emprega três, e o pedido de ofícios da cidade (`E.demand`) soma os copistas de cada biblioteca. O ganho de cada leitura e de cada cópia é o de sempre (`Bi.READ`, `Bi.COPY`), o horário também: o teto do dia dobra porque cabe o dobro da gente — nenhuma operação nova. A regra do dia da biblioteca no verificador (`qa/oficio-inv.js`) passou a ler o teto do degrau (`maxOf`, `maxCopias`), ou acusaria a 9ª leitura da grande. O 3D desenha o degrau só pela forma (`riskForm`, o caminho do templo: nenhum desenho novo no `build3d.js`) e o deus pinta-o pela forma (nenhuma peça sem pintor). Provas: `qa/saber.js` (b1 a b9), `qa/saber-inv.js`, `qa/escala.js` e0c. |
| D-193 | decisão (B: `forma-saber.js`, `int-saber.js`, uma linha no `build3d.js`) | **Um prédio da cidade sobre a sua plataforma faz-se com um jogo de peças só — `Fo.saber` e `In.byRisk`.** O `forma-saber.js` guarda o jogo com que as seis bibliotecas foram riscadas (`Fo.saber.kit`: a plataforma e a escadaria de espelhos de 0,25 m, o bloco das paredes do povo, o pátio murado ou a paliçada com o portão, os pórticos e as colunas, os cômodos, as janelas, as peças do pátio; `paint`: o risco pintado em peças do vocabulário da forma; `formOf`; `under`: o telhado da planta por baixo do da forma) e o `int-saber.js` o construtor que lê qualquer risco desses (`In.byRisk(P, F, nome, mobiliar)`: a casca, os níveis, as paredes, os anexos, as colunatas, o pátio, a escadaria, a entrada, os cômodos, as peças da forma como sólidos — e chama quem mobilia). Quem fizer o paço municipal (T-874) escreve o risco de cada povo e a função que mobilia; o resto está feito. **As janelas que o deus pinta nas faces do bloco são, no 3D, as da casca**: a forma leva um elemento `janelas` por parede (o deus não lê a planta), e o `riskSkip` do `build3d.js` o põe de lado quando o prédio é desenhado pelo risco — as aberturas da planta já são as janelas (L-871). |
| L-870 | bug (consertado, B: `forma-saber.js`; achado pela `saber b5a`) | **O alpendre da casa das tábuas tinha um poste no eixo do pátio, diante de quem entra.** Sete postes igualmente espaçados põem o do meio no eixo do portão; a prova dos pés (da rua até a sala, a cada 2 cm) parava nele («parados em v 10,48»). Oito postes: o vão do meio fica no eixo. Sabotagem (sete postes de novo): a `b5a` falha. |
| L-871 | bug (consertado, B: `build3d.js` `riskSkip`, uma linha; achado ao olhar a primeira figura do 3D) | **O 3D desenhava as janelas duas vezes: as da casca (a planta) e, por cima, as que a forma pinta para o deus.** Num prédio desenhado pelo risco, a casca abre as janelas da planta; o elemento `janelas` da forma (o que o deus pinta nas faces do bloco, porque não lê a planta) era desenhado também, um quadro escuro colado por fora de cada vão. O ramo do templo do `riskSkip` ganhou `if (q.k === 'janelas') return outer(q);` — a mesma regra das portas de fora. As formas de antes não têm `janelas` em prédio de risco: nada mudou nelas (`visual/fidelidade.js`, `visual/forma-deus.js`, `monumental-poder.js` passam). A prova: `visual/saber-3d.js` v4 — um olhar de fora pelo meio de cada janela, até a face da parede: nenhuma vidraça antes dela (as da casca ficam dentro da parede). Sabotagem (a linha tirada): a v4 falha nas seis («8 com uma vidraça antes da face da parede»…). As provas que já existiam **não** pegavam isto (a `interior3d.js` passa com a linha tirada: T-873). |
| L-872 | bug (consertado, B: `forma-saber.js`; achado pela `visual/interior3d.js` no save da `saber b7`) | **Os painéis pintados do fundo da stoa grega ficavam 4,5 cm fora da face da parede.** O 3D desenha uma `placa` 3 cm à frente do `v` dela; a 2 cm da face, o painel ficava a 5: de quem está sob a stoa, a parede não estava onde a planta a tem («biblioteca#27029 parede 3 a 2,57 m, 1,8 m: −4,5 cm», quatro olhares). Os painéis passam a um dedo da face (`v = B[3] − 0,02`: 1 cm). Depois: `interior3d.js` no save, 16 passam, 0 falham. Sabotagem (os 2 cm de antes): a `interior3d` 2 falha. |
| L-873 | bug (consertado, B: `forma-saber.js`; achado pela `visual/saber-3d.js` v4) | **A faixa pintada da Casa da Vida egípcia tapava as janelas.** As janelas altas iam de 3,8 a 4,4 m do chão e a faixa de baixo da cornija de 3,9 a 4,5: no 3D, olhando de fora, havia a faixa diante dos onze vãos (medido pelo olhar da prova: 11 de 11). As janelas descem para 2,9 a 3,5 m — sob a faixa, acima das estantes. Sabotagem (a altura de antes): a v4 falha («11 com algo sólido diante do vão»). |
| L-874 | bug (consertado, B: `forma-saber.js`; achado pela `visual/saber-3d.js` v4) | **Uma meia coluna da biblioteca romana ficava diante de uma janela, em cada lado.** As meias colunas dos lados iam de 3 em 3 m a partir do fundo (1,6, 4,6, 7,6) e as duas janelas de cada lado ficam a 3,3 e 7,7: a coluna de 7,6 tapava a janela. As colunas vão para os cantos e para entre as janelas (1,5, 5,5, 9,5). Sabotagem (o passo de antes): a v4 falha («2 com algo sólido diante do vão»). |
| T-870 | limite de teste (aberto, para o líder e o M) | **Nenhuma cidade dos mundos prontos ergue hoje a grande biblioteca sozinha — por gente ou por terra.** O degrau pede 150 pessoas (`escala.js`). Medido: nos mundos `cidade` (a maior cidade com 35), `metropole` (118), `mega` (140) e `mundial` (130) nenhuma cidade chega lá; no `anos500` (Mênfis 189, Tebas 183) e no `anos1000` (Mênfis 215) as cidades escolhem o degrau primeiro (`Es.choose`: grande/4 > biblioteca/2) e podem pagá-lo (`V.affords` verdadeiro), mas **não têm mais um lote de 4 casas**: `V.findSite(set, 'biblioteca', undefined, 4)` nulo, `V.openSite` nulo e `V.growLot` da biblioteca que têm nulo — a mesma falta que o `_noSite` delas mostra para o palácio de 6, o teatro de 6 a 10 e a taverna de 4. O `V.startProject` cai então no degrau clássico, como manda a regra. A prova (`saber b8`) confere a escolha no mundo de 500 anos e ergue o degrau no mundo da metrópole, onde a cidade passa a justificá-lo com as famílias que chegam pela porta do modo desenvolvedor (`G.Dev.act.fam`): com 104 pessoas só a clássica, com 151 a grande primeiro; sem pedra nem renda de pedra não a paga; com pedra, o `V.startProject` ergue o lote de 4 e o `V.grow` amplia no lugar a clássica que a cidade tinha. Não mexi no `village.js` nem no número do degrau. Para decidir: baixar o degrau para 120 pessoas (como as termas e o grande teatro), ou gerar mundos prontos depois de juntar os ramos — hoje o dono só vê a grande biblioteca pela mão do deus (modo desenvolvedor) ou num mundo novo que cresça. |
| T-871 | limite de teste (aberto, não é deste ramo) | **`qa/escala.js` e19h e e19i falham na base 16310aa** («5 de 6 mandados aos jogos; o camarote não encheu» e, por consequência, «sem save»). Medido numa cópia limpa da base (`git archive 16310aa`), `ONLY=e19 node qa/escala.js`: as mesmas duas falhas, as outras sete da e19 passam. Neste ramo a prova inteira dá 126 PASSOU e essas 2 FALHOU. Fica para o dono do Coliseu / o líder. |
| T-872 | limite de teste (aberto) | **As figuras deste ramo são desenho por software, em Node; nenhuma é foto do navegador.** O deus pelo pintor gravado e o 3D pelos triângulos do `Build3D` (`visual/fidelidade-lib.js`); o corte, a vista da sala e a da rua são os mesmos triângulos (`Build3D.outside` e `Build3D.interior`) em perspectiva, por um desenhador de rascunho meu (fora do repositório): sem luz do jogo, sem sombras, sem texturas, sem gente, sem o que há em volta. Servem para ver a forma, a planta e os móveis; não provam o quadro do jogo. E **o corpo andando pela mão do jogador** (o controle, a câmera, a colisão do `input3d`/`cam3d`) dentro da grande biblioteca não foi rodado no navegador: em Node está provado o chão sob os pés da rua até a sala (`b5a`), cada lugar alcançado da porta (`b3a`) e o corpo tomado na sala que senta, lê e sai (`b7e`). |
| T-873 | limite de teste (fechado neste ramo, com duas entradas novas na regressão) | **As provas do 3D não viam a grande biblioteca: nenhum mundo pronto tem uma, e a do 3D de dentro não vê o que a forma desenha por fora.** (1) A `saber b7`, com `SALVA=<arquivo.json>`, grava o mundo da metrópole com as grandes bibliotecas de pé (cinco: uma em cada capital, pela mão do deus), e a `visual/interior3d.js` roda nesse save — as paredes onde a planta diz, os vãos livres, os pisos, os tetos, cada móvel, as folhas das portas, o lado de fora que fecha: achou o L-872 e, depois dele, 16 passam, 0 falham. (2) A `interior3d.js` **passa com as janelas desenhadas duas vezes** (a sabotagem do L-871: 16 passam): ela olha a casca e o interior, não o que a forma põe por fora da parede. A prova nova `visual/saber-3d.js` (segundos, em Node) olha de fora cada janela — e achou mais dois defeitos que nenhuma outra prova acusava (L-873, L-874). O mesmo olhar serviria aos outros prédios desenhados pelo risco (os templos, os palácios): não o estendi a eles. |
| T-874 | limite (aberto: o segundo prédio do pedido) | **O paço municipal (o degrau `paco_municipal` de 16 m da `administracao`) não foi feito.** A biblioteca tomou o tempo todo, e o pedido mandava parar no que não coubesse terminar provado. O que medi lendo o código, para quem for fazer: (a) **a `administracao` não tem planta** — não há `In.TYPES.administracao`, e as formas clássicas dela (`forma.js`, linhas 1019 a 1062) não têm `body` nem porta: os escribas trabalham «à mesa» (`desk`) sem lugar de planta. A biblioteca já tinha tipo de planta e família (`forma.salao`); o paço precisa primeiro de um tipo — e registrar o tipo dá registro de planta às administrações clássicas de todos os saves (portas, entrada, gente dentro), o que o pedido proíbe («o degrau clássico fica como está»). O caminho que eu seguiria: registrar o tipo com uma família que só se arma no lote de 4 (`In.formSized('administracao', …)`), e um portão pequeno no `interiors.js` (do agente G: `In.found` e a migração) para que o prédio de 2 casas não ganhe registro; (b) a forma: o jogo de peças está pronto (D-193: `Fo.saber.kit` e `In.byRisk`) — falta o risco de cada povo (a cúria romana, o bouleutério grego de fileiras em U, a casa do vizir, o tecpan, o salão do thing, a casa do escriba-chefe) e a função que mobilia (os assentos em volta, a mesa do coletor, o arquivo); (c) o trabalho: `E.demand` tem `case 'administracao': n = 2` (`economy.js`, linha 226) e o `BDEF.jobs` é 2 — mais escribas pede um `E.jobsOf` do degrau, como o da biblioteca, e os lugares `escrever` na planta; o efeito dos escribas (`f._scribes`, a lealdade) está no `polity.js`, que é do M — qualquer número novo lá fica para o líder; (d) as provas: o molde é o `qa/saber.js` (b1 a b9), a lista `sem` do `qa/escala.js` (linha 89) perde `administracao`, e o catálogo ganha as chaves do tipo novo. |
| T-875 | registro (para o líder) | **Rodei o `node qa/junta-inv.js` uma vez, contra a regra do COMUM3** («o líder junta»), ao mudar a regra do dia da biblioteca no `qa/oficio-inv.js` (D-192) — a regra 21 do guard cobra o `qa/qa.js` em dia com as folhas. O commit 92ce2e0 leva por isso o trecho gerado do `qa/qa.js` (só o bloco do `oficio-inv.js`: as duas linhas do teto do dia). Se o líder preferir, descarta esse trecho e roda o junta depois de juntar os ramos; o `qa/saber-inv.js` (novo) **não** foi juntado — entra na lista do `junta-inv.js` pelo líder. |
| T-876 | registro (o que rodei no navegador, sozinho, pelo `qa/navegador.sh`) | **Três provas de navegador, as três passam**: `det3.js 77 arquipelago 96 3 2` — PASSOU (a geração com e sem quadros igual; A × B, A × C e D iguais; 33 s; erros: nenhum); a parte e11 do `encarna.js` (o `build3d.js` mudou uma linha) — 9 passam, 0 falham, sem erros de página; `oldsave.js <a base 16310aa> <este ramo>` — um mundo de 20 anos salvo na base carrega aqui com 0 violações, e +5 e +10 anos com 0; erros: nenhum. **Nenhuma delas tem uma grande biblioteca no mundo** (são mundos pequenos): o que provam é que o que mudei não quebra o resto. A grande biblioteca dentro do jogo, no navegador — o quadro, a câmera, o corpo pela mão do jogador — não foi vista (T-872). |

## 2. Linhas do README das provas

| `saber.js` | `node saber.js [b1,b2,…]` (ou `ONLY=b1,b2`; `VERB=1` cada caso que falha; `SALT=n` as plantas noutros dados; `SALVA=<arquivo.json>` grava o mundo da b7 com as grandes bibliotecas de pé; ~1 min) | A grande biblioteca (16 m) dos seis povos (D-192), em Node: **b1** a forma de cada povo (o lote, o pé dentro dele, o risco, o degrau só no tamanho da forma, as seis diferentes); **b2** a planta em todo povo e lado (24), em 192 outros prédios (os dados dos móveis, paredes-meias, terra quente, bairro rico), a mesma duas vezes, a casca de longe a da planta, o relatório geométrico, o tempo, e a biblioteca clássica com a planta de antes (o resumo gravado); **b3** o que ela é (a sala, o acervo, o escritório, o pórtico, o pátio; ≥ 16 lugares de ler, ≥ 3 mesas de escriba, ≥ 8 estantes; cada lugar alcançado da porta) e contra a clássica do mesmo povo; **b4** as regras do corpo (a escadaria, a entrada, o parapeito, as portas); **b5** os pés da rua até a sala, a cada 2 cm; **b6** o dia numa vila feita à mão, romana e grega (os leitores enchem os lugares, o dia conta 16 leituras e 12 cópias e nada além, três copistas cada um na sua mesa, a clássica ao lado como antes, o pedido de ofícios, quem morre lendo, o save no meio, a derrubada no meio, o verificador limpo em todo segundo — e acusa o livro que mente); **b7** de pé no mundo da metrópole (a mão do deus em cada capital, o verificador inteiro que acusa o livro que mente, os leitores andando de verdade — mais de oito sentados —, o save com eles sentados, o corpo do deus que senta, lê e sai, a obra salva no meio, a ruína); **b8** a cidade que justifica e pode pagar (a escolha no mundo de 500 anos; no da metrópole, as famílias que chegam, sem pedra não paga, o `V.startProject` ergue o lote de 4 e o `V.grow` amplia no lugar, salvo no meio); **b9** os saves de antes (as clássicas como eram). 40 linhas; 21 sabotagens (`bloco-B.md`, item 9). |
| `visual/saber-3d.js` | `node visual/saber-3d.js [povo,…]` (~10 s, em Node, sem navegador) | A grande biblioteca no desenho do deus e no 3D, cada uma das seis num chão plano: **v1** o deus pinta pela forma (nenhuma peça sem pintor, nenhuma volta quebrada); **v2** a silhueta do deus contra a do 3D (≥ 0,95) e o alto; **v3** o 3D pelo risco da forma, dentro dos tetos de triângulos (perto ≤ 60 mil, longe ≤ 2 mil); **v4** as janelas — um olhar de fora pelo meio de cada janela que a forma pinta, até a face da parede: nada sólido diante do vão (L-873, L-874) e nenhuma vidraça antes da face (L-871); **v5** por dentro, cada peça da planta desenhada. |
| `saber-inv.js` | carregado pelas provas (`extra`) e, depois de juntado, pelo `qa.js` | As regras do verificador da grande biblioteca (sistema `saber`, S2): os copistas que o prédio emprega cabem nas mesas de escriba da planta; quem está no livro do dia lendo cabe nos lugares de ler; a grande biblioteca tem os lugares que o degrau promete (16 de ler, 3 de escriba). Só lê (a tabela dos lugares é da memória do motor das plantas). |

Na linha do `escala.js`: «e0c: a grande biblioteca tem a forma dos seis povos e a cidade abaixo das pessoas do degrau escolhe a clássica; a lista dos tipos sem degrau maior (e0b) perdeu `biblioteca`».

## 3. Entradas do `regress.sh`

Na fase «fundacao», junto do `F monumental-poder monumental-poder.js;`:

    SALVA="$OUT/saber-mundo.json" F saber saber.js; F interior3d-saber visual/interior3d.js "$OUT/saber-mundo.json"; F saber-3d visual/saber-3d.js;

(a segunda depois da primeira: lê o save que ela grava; a `SALVA` é um caminho inteiro). Linhas novas que a linha de base vai ganhar (todas PASSOU): as 40 da `saber` (b1a … b9a e «sem erro do jogo»), as 16 da `interior3d-saber`, as 6 da `saber-3d`, e `escala e0c`. A `escala e0b` muda de texto (a lista sem `biblioteca`).

No `qa/junta-inv.js`: `saber-inv.js` na lista das folhas (depois do `poder-inv.js`).

**Conflito à vista com o agente T**: os dois mexemos na linha 89 do `qa/escala.js` (a lista `sem`): eu tirei `biblioteca`, o T tira `banhos`. A linha junta fica `const sem = ['mercado', 'administracao'];` (e sem `administracao` quando o paço existir).

## 4. Regras do `guard.js`

**Regra 65 (proposta; hoje sem nenhuma ocorrência — conferido com `grep`)**: o dia de uma biblioteca é o do degrau dela.

- Texto: «`Biblioteca.MAX` (o teto do dia da biblioteca clássica) só se lê no `js/act-lazer.js`: quem quer o teto do dia, as cópias ou os copistas de um prédio pergunta `G.Biblioteca.maxOf(b)`, `maxCopias(b)`, `copistas(b)` (D-192: a grande biblioteca conta o dobro e emprega três)».
- Padrão: em todo `js/*.js` menos o `act-lazer.js`, `/\bBiblioteca\.MAX\b/`; e no `act-lazer.js`, `Bi.MAX` só nas linhas que definem `Bi.MAX`, `Bi.maxOf` e `Bi.maxCopias` (`/\bBi\.MAX\b/` fora de `/Bi\.(MAX|maxOf|maxCopias) =/`).

A regra 66 fica livre (era do paço).

## 5. Frases para o `CLAUDE.md`

No protocolo, item 3, depois da frase do som:

> Mexeu na grande biblioteca (`forma-saber.js`, `int-saber.js`, o dia dela no `act-lazer.js`)? Também `node qa/saber.js` (um minuto: a forma, a planta, o dia, o corpo, a cidade que a ergue, os saves de antes) e `node qa/visual/saber-3d.js` (segundos: o deus e o 3D, as janelas olhadas de fora); se mudou a forma ou o que o 3D desenha, também `SALVA=/tmp/s.json node qa/saber.js b7` e `node qa/visual/interior3d.js /tmp/s.json` (o 3D de dentro, num save com elas de pé).

Em «Os ofícios e os serviços», no fim:

> **O dia de uma biblioteca é o do degrau dela** (D-192): `G.Biblioteca.maxOf(b)`, `maxCopias(b)`, `copistas(b)` — a grande biblioteca (16 m) conta o dobro das leituras e das cópias e emprega três copistas, com as mesmas operações; ninguém lê `Biblioteca.MAX` para um prédio (regra 65).

Em «A escala de cada prédio — `G.Escala`», no fim:

> Um prédio da cidade sobre a sua plataforma risca-se com o jogo do `forma-saber.js` (`Fo.saber.kit`, `paint`, `formOf`) e a planta dele lê o risco pelo `In.byRisk` (`int-saber.js`): quem faz um degrau novo escreve o risco de cada povo e a função que mobilia (D-193). As janelas que a forma pinta para o deus (`janelas`) são, no 3D, as da casca.

## 6. O que ficou aberto

- **O paço municipal** (T-874): não começado. O jogo de peças para fazê-lo ficou pronto (D-193).
- **Nenhum mundo pronto mostra a grande biblioteca sozinha** (T-870): o degrau de 150 pessoas e a terra das cidades velhas. Decisão do líder/M.
- **As duas falhas da `escala e19`** (T-871): já estavam na base.
- **A grande biblioteca no navegador** (T-872, T-876): ninguém a viu ainda dentro do jogo de verdade — nem fotos, nem o corpo andando pela mão do jogador, nem o quadro. O que rodei no navegador (o determinismo, a e11 do Encarnado, o save antigo) passa, mas em mundos sem ela. Para ver: fundar pela mão do deus o degrau «Grande biblioteca» numa cidade (a porta é a `G.Village.handFound`, a mesma dos outros degraus; não conferi o caminho no menu), ou um mundo que cresça até 150 pessoas numa cidade com terra.
- **A folha da matriz por prédio**: a atividade `ler` da biblioteca está nas folhas `qa/categorias/p2.js` (o copista, o P2) e `p3.js`/`p4.js` (a forma e a planta); não mexi nelas — a `qa/saber.js` pode entrar como prova da atividade `ler` na folha do P2.
- **Os mundos prontos não foram gerados de novo** (não rodei o `qa/prontos.js`, como pedido): nada do que mudei muda um mundo sem cidade de 150 pessoas com terra — a impressão do mundo da metrópole (abrir, viver 60 s, saltar 1 ano) é a mesma na base 16310aa e no código final deste ramo: `abre 2965b58c · 60 s d1a4e92f · +1 ano b1c5e930` (o resumo do `QA.canon()`; dia 59, 749 pessoas, o mesmo acaso; nenhum degrau maior no mundo), medido nas duas árvores com um roteiro de rascunho. Quando o líder juntar os ramos e gerar os mundos, o `qa/mundos.js` é dele.

## 7. Os arquivos

- **Novos**: `js/forma-saber.js` (a forma: pura), `js/int-saber.js` (a planta), `qa/saber.js`, `qa/saber-inv.js`, `qa/visual/saber-3d.js`, `qa/patch3/bloco-B.md`, `qa/patch3/fotos-B/` (24 figuras).
- **`index.html`**: duas linhas `<script>` — `js/forma-saber.js` depois do `forma-poder.js`, `js/int-saber.js` depois do `int-palacio.js`.
- **`js/act-lazer.js`**: `Bi.grande`, `Bi.maxOf`, `Bi.maxCopias`, `Bi.copistas`, o `E.jobsOf` da grande biblioteca, o teto do dia e o pedido de ofícios pelo degrau (D-192).
- **`js/build3d.js`**: uma linha no `riskSkip` (o ramo do templo): `if (q.k === 'janelas') return outer(q);` (L-871). Não toquei na casca nem na soleira (do agente Q).
- **`js/int-catalogo.js`**: gerado de novo, num commit só dele (`node qa/catalogo.js gera tudo biblioteca`): 36 chaves novas (`biblioteca|povo|quente|riqueza|n4`), nenhuma de antes mudou; `node qa/catalogo.js confere 120`: 120 passam, 0 falham.
- **`qa/oficio-inv.js`** (e o trecho gerado do `qa/qa.js`, T-875): a regra do dia da biblioteca lê o teto do degrau.
- **`qa/escala.js`**: a lista `sem` (linha 89) sem `biblioteca`; o caso e0c.
- **Não toquei**: `js/village.js`, `js/city.js`, `js/polity.js`, `js/interiors.js`, `js/int-familias.js`, `js/int-moveis.js`, `js/props3d.js`, `js/realm3d.js`, os banhos, `worlds/`.

## 8. As figuras (para a página do relatório)

Em `qa/patch3/fotos-B/`, de cada um dos seis povos (`romano`, `grego`, `egipcio`, `asteca`, `nordico`, `classico`), quatro figuras (T-872: desenho por software, em Node):

- `biblioteca-<povo>-deus-3d.png` — à esquerda o deus (o pintor gravado), no meio o 3D de perto, à direita a figura de longe; o lote de 16 m riscado em vermelho. A silhueta do deus contra a do 3D: de 0,971 a 0,988 nos seis.
- `biblioteca-<povo>-corte.png` — a planta em perspectiva, cortada a 2,3 m do chão, vista de cima da frente: a sala de leitura com as mesas, as estantes, a imagem, o escritório com as mesas de escriba, o acervo, o pórtico, o pátio.
- `biblioteca-<povo>-da-sala.png` — de dentro da sala de leitura, dos olhos de quem entra (1,62 m).
- `biblioteca-<povo>-da-rua.png` — da rua, a 7,5 m da frente do lote, dos olhos de uma pessoa (a clássica de um pouco mais alto, para se ver o pátio por cima do muro).

Olhei todas. O que consertei ao olhar: as janelas duas vezes no 3D (L-871); o pátio egípcio escondido atrás de um muro de 3,2 m (baixei o muro a 2 m e dei ao portão ombreiras, lintel, cornija e o disco do sol); o muro liso da casa das tábuas (ganhou a fiada de telhas). O que os meus olhos **não** viram e as provas acharam depois: a faixa egípcia sobre as janelas (L-873), a meia coluna romana diante de uma janela (L-874), os painéis gregos fora da parede (L-872) — as figuras dos três povos foram tiradas de novo depois dos consertos. O que não fica bonito e deixei: na vista do deus, o fundo da stoa grega (os painéis pintados) não aparece — a projeção de cima esconde a parede sob um pórtico fundo; aparece no 3D.

## 9. O que rodei (os números) e as sabotagens

**As provas deste ramo, no código final:**

| prova | resultado |
|---|---|
| `node qa/saber.js` | 40 passam, 0 falham |
| `SALT=7` e `SALT=31` `node qa/saber.js b2,b3` (as plantas noutros dados) | 10 passam, 0 falham, cada uma (o `SALT=n` que rodei antes era zero — os dados do jogo: não valia) |
| `node qa/visual/saber-3d.js` | 6 passam, 0 falham |
| `node qa/visual/interior3d.js <o save da saber b7>` | 16 passam, 0 falham (7 bibliotecas com planta no save, as 5 grandes entre elas) |
| `node qa/escala.js` (inteira, 7 min) | 126 passam, 2 falham — e19h e e19i, iguais na base (T-871) |
| `node qa/catalogo.js confere 120` | 120 passam, 0 falham |
| `node qa/guard.js` | PASSOU (154 arquivos) |
| `node qa/soak.js 103 continente 128 4 normal 5 1 1` | 5 anos, nenhuma violação, nenhum erro |
| `bash qa/navegador.sh node qa/det3.js 77 arquipelago 96 3 2` (navegador) | PASSOU: a geração com e sem quadros igual, A × B igual, A × C igual, D (o save duas vezes) igual; erros: nenhum |
| `ONLY=e11 bash qa/navegador.sh node qa/encarna.js <pasta>` (navegador) | 9 passam, 0 falham; sem erros de página |
| `bash qa/navegador.sh node qa/oldsave.js <base 16310aa> <este ramo>` (navegador) | o save de 20 anos da base carrega: 0 violações; +5 e +10 anos: 0; erros: nenhum |
| a impressão do mundo da metrópole (abrir, 60 s, +1 ano), base × ramo | igual: `2965b58c · d1a4e92f · b1c5e930` |

**As provas de antes, repassadas** (uma de cada vez). A lista inteira rodou **antes** dos três consertos da forma (L-872 a L-874: a altura das janelas egípcias, o lugar das meias colunas romanas, os painéis gregos). **Depois** deles rodei de novo, com os mesmos números: `lugares`, `biblioteca-praca`, `lazer-mao`, `casca`, `visual/fidelidade` (as duas), `visual/forma-deus`, `visual/monumentos-ajustes`, `visual/guarda3d`, o `guard`, a vida curta e o `catalogo.js confere 120`. **Não** rodei de novo depois deles: `palacios`, `monumental-poder`, `monumentos`, `plantas`, `lazer`, `interiores`, `portas-casos`, `civicos`, `visual/monumental`, `visual/corpo-rig`, `visual/soleira`, `visual/corpo-casa`, `visual/pe-da-escada`, `visual/interior3d` (a metrópole), `matriz`, `matriz-predios`, `escala` — o que mudou depois foi só o `forma-saber.js` (a forma da grande biblioteca), que nenhuma delas lê num mundo sem grande biblioteca; a regressão do líder confirma.

| prova | passam | falham |
|---|---|---|
| `palacios.js` | 17 | 0 |
| `monumental-poder.js` | 61 | 0 |
| `monumentos.js` | 9 | 0 |
| `plantas.js` (15 min) | 10 | 0 |
| `lugares.js` | 18 | 0 |
| `biblioteca-praca.js` | 8 | 0 |
| `lazer-mao.js` | 27 | 0 |
| `lazer.js` | 15 | 0 |
| `interiores.js` | 9 | 0 |
| `portas-casos.js cidade` | 19 | 0 |
| `civicos.js` | 33 | 0 |
| `casca.js` | 22 | 0 |
| `visual/fidelidade.js` | 8 | 0 |
| `PLANTA=0 visual/fidelidade.js` | 6 | 0 |
| `visual/forma-deus.js` (78 degraus pelo pintor e no 3D: os seis novos entre eles) | 27 | 0 |
| `visual/monumentos-ajustes.js` (c9: 78 degraus dentro dos tetos) | 12 | 0 |
| `PARTE=node visual/monumental.js` | 44 | 0 |
| `visual/guarda3d.js ..` | PASSOU (27 arquivos do 3D) | |
| `visual/corpo-rig.js` | 10 | 0 |
| `visual/soleira.js` (10 min) | 15 | 0 |
| `visual/corpo-casa.js` | 19 | 0 |
| `visual/pe-da-escada.js` | 5 | 0 |
| `visual/interior3d.js` (a metrópole) | 16 | 0 |
| `matriz.js` | 4 | 0 |
| `matriz-predios.js` (a saída numa pasta de rascunho) | 1 (12 categorias, 56 tipos, 2 lacunas — as mesmas 2 na base, medido lá) | 0 |
| `junta-inv.js confere` | «JUNTA: igual» | |

A `matriz.js` reescreve o `qa/MATRIZ.md` ao rodar, com diferenças que não são deste ramo (o preço de uma casa, as ofertas da taverna): desfiz (`git checkout`), não vai no commit.

**As sabotagens** (cada uma numa cópia do jogo, pelo `sab-run.sh` comum — as do 3D por um irmão dele que leva também o `qa/visual/` —; o roteiro: `…/scratchpad/ag/B/sab-B.py`). As 21 foram pegas:

| | o que a sabotagem desfaz | quem pegou |
|---|---|---|
| s1 | o povo nórdico sem a forma de 4 casas | `saber b1a` |
| s2 | uma só mesa de escriba na planta | `saber b3a`, `b6c`, `b6f`, `b6g`, `b7a` (o verificador: emprega 3 e a planta tem 1) e as que seguem |
| s3 | quatro mesas de leitura só | `saber b2e`, `b3a`, `b3b`, `b7a` (o verificador: os lugares do degrau) |
| s4 | o dia da grande com as 8 leituras da clássica | `saber b6b` |
| s5 | o dia dela com as 6 cópias da clássica | `saber b6c` |
| s6 | um copista só | `saber b6c`, `b6d`, `b8d` |
| s7 | a cidade pede um copista por biblioteca, qualquer que seja o degrau | `saber b6d` |
| s8 | o dia do livro sem teto | `saber b6b`, `b6d`, `b6g` |
| s9 | as regras da grande biblioteca fora do verificador | `saber b7f` (a prova ganhou este caso por causa desta sabotagem: antes, passava) |
| s10 | o 3D desenha as janelas da forma por cima das da casca (L-871) | `saber-3d v4` (a `interior3d` não pega: T-873) |
| s11 | toda biblioteca é grande (a clássica com três copistas e o dia de 16) | `saber b6d`, `b6f`, `b6g`, `b9a` |
| s12 | o alpendre clássico com sete postes (L-870) | `saber b5a` |
| s13 | os leitores fora do save | `saber b6e`, `b7c` |
| s14 | o degrau fora da escada do tipo | `saber b1b`, `b8` |
| s15 | a cidade paga qualquer degrau, sem pedra | `saber b8b` |
| s16 | o degrau pedido a uma aldeia de 15 pessoas | `saber b8a`, `b9a` |
| s17 | espelhos de meio metro na escadaria | `saber b4a`, `b5a` |
| s18 | o tanque egípcio encostado na colunata (a planta não tem onde pô-lo) | `saber b2a`, `b2e`, `b2f` |
| s19 | as janelas egípcias atrás da faixa pintada (L-873) | `saber-3d v4` |
| s20 | as meias colunas romanas diante das janelas (L-874) | `saber-3d v4` |
| s21 | os painéis gregos a 5 cm da parede (L-872) | `interior3d 2` (no save da `saber b7`) |
