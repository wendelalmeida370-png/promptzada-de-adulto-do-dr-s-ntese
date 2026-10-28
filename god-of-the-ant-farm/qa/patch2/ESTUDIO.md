# Patch 2 — Living Buildings: a carta da equipe

> (Os caminhos `SP/…` e `.../scratchpad/…` são da pasta de trabalho da sessão do líder; as cópias que ficam no
> repositório são estas, em `qa/patch2/`.)

O pedido do dono, na íntegra: `PEDIDO.md` (nesta pasta). O projeto: `god-of-the-ant-farm/` (leia o `CLAUDE.md` da raiz do
repositório inteiro antes de tudo — ele manda mais que esta carta). A base é a v37 («Gameplay Foundation + Living
Interiors»): `qa/FUNDACAO.md` (o desenho da v37), `qa/AUDIT.md` (L/T/D até L-219, T-122, D-063), `qa/README.md` (as provas).

> **Esta é a 2ª largada.** O contêiner reiniciou em 28/10 às 04:43 e levou tudo o que não estava no GitHub: as auditorias
> do P1, do P2 e do P4, o código da Fase B que tinha começado e as pastas de trabalho. As decisões do líder sobre as
> auditorias sobreviveram (§6) e a auditoria do P3 sobreviveu inteira (`auditoria-p3.md`). Quem já tinha auditoria
> aprovada **não refaz a Fase A do zero**: relê o código com as decisões do §6 na mão, escreve um plano curto (o §5 da
> auditoria antiga: a API, os dados, o save, as invariantes, as provas, as regras do guard pedidas) e segue para a Fase B.

## 1. A equipe e as fronteiras

Cada um é dono dos seus arquivos. Mexer no arquivo de outro: só com o combinado do dono (mensagem direta) e o líder
avisado. Arquivo de ninguém: pergunte ao líder.

| Quem | O que | Arquivos (dono) |
|---|---|---|
| **P1 — A vida nas casas** | A Parte 3 inteira (a ocupação real das casas, as rotinas da família, os móveis com função na casa, a presença e a ausência com causa); a Parte 9 do lado da casa (dormir na cama, comer à mesa, cozinhar, ninar); as festas e a devoção (quem reza, quem vai à festa, onde); o adendo 4.1 (o que o jogador faz na casa) e o 4.4/4.6 do lado das pessoas (o público, o fiel, o cortejo). | novo `js/act-lar.js` (`G.Lar`: o relógio de cada um, o lugar em casa, quem está em casa e por quê, a despensa da casa pelo `G.Depot`); `act-casa.js` (`G.Casa`), `life.js`, `festivals.js`, `pets.js`, a parte das rotinas do `villagers.js` (campo novo numa pessoa: na lista `SHAPE`, avisando o líder); provas novas `qa/lar*.js`, `qa/lar-inv.js` |
| **P2 — O trabalho e os serviços** | A Parte 4 inteira (a olaria de ponta a ponta com o tijolo, a taverna, as oficinas, o mercado, o armazém e o porto, as termas e os outros serviços); a integração econômica autoritativa (o insumo consumido, o produto contado, o pagamento, o salário, sem dobrar nada entre os níveis); os exemplos A (termas), B (taverna) e D (olaria); o adendo 4.2, 4.3 e 4.5 (o que o jogador faz no trabalho, no serviço, no quartel e na administração). | `activity.js` (o `G.Depot`: mudança avisada ao líder), `act-negocio.js`, `act-compras.js`, `act-porto.js`, `act-pesca.js`, `economy.js`, `tavern.js`, `city.js` (o lazer), `court.js` (a lógica; o bloco que desenha o paço, o grande palácio e o colossal é do P3), `crime.js` (só o `Cr.feed`, pelo livro), as linhas do tijolo no `village.js` (a troca na fundação e o reembolso do entregue); novos `js/act-oficio.js`/`act-*.js` dos ofícios; provas novas `qa/olaria*.js`, `qa/taverna*.js`, `qa/termas*.js`, `qa/oficio-inv.js` |
| **P3 — A arquitetura: a mesma construção nas duas vistas, e os monumentos** | A Parte 6 inteira: o prédio da visão de Deus e o do corpo como a mesma construção (planta, proporções, silhueta, pavimentos, colunas, arcos, telhado, portas) — o Coliseu, a Grande Pirâmide, o Templo Mayor, a Acrópole, o Salão de Valhala, os teatros e a arena, os monumentos, os templos, os palácios, e a olaria, as casas e a taverna por fora; a Parte 5 do lado do espaço (as plantas dos monumentos, dos templos e da arena: arquibancadas, bastidores, acessos entre níveis); o exemplo C do lado do espaço (onde se assiste). | `build3d.js`, `props3d.js`, `things3d.js`, `mesh-*.js`, `tex3d.js`, `realm3d.js` (só o que desenha prédios), `arch.js`, `cityart.js`, `render.js` (só o desenho dos prédios), `int-civicos.js`, `int-palacio.js`, o bloco de desenho do `court.js`; novos `js/forma.js` (`G.Forma`) e `js/int-monumentos.js`; provas novas `qa/visual/fidelidade*.js`, `qa/monumentos*.js`, `qa/forma-inv.js` |
| **P4 — O espaço: portas, escadas, porões, a navegação, o corpo dentro dos prédios, e a matriz universal** | A Parte 7 inteira (portas e soleiras, escadas, porões, a validação geométrica automática com relatório por prédio); o adendo 8 (a qualidade física das interações do corpo: alcance, orientação, colisão, cancelar, voltar ao controle); o adendo 3 do lado do espaço (o ponto de uso de cada móvel alcançável, livre, no lugar certo); os adendos 2 e 11: **a matriz de cobertura por categoria de prédio**, gerada do código, com o estado de cada categoria (não auditada, auditada, parcial, funcional, validada). | `interiors.js`, `int-familias.js`, `int-quadras.js`, `int-trabalho.js`, `int-moveis.js`, `int-planta.js`, `int-catalogo.js` (gerado), `space.js`, `avatar.js`, `interact.js`, `possess.js`, `people3d.js` (as poses — os gestos novos do P1 e do P2 pedem pose a você), `body3d.js`, `incui.js`, `input3d.js`, `cam3d.js`, `modes.js`, `diario-ui.js`, `fx3d.js`; provas `qa/plantas.js`, `qa/lances.js`, `qa/portas*.js`, `qa/visual/*` do corpo, `qa/matriz.js` e a matriz nova por prédio (`qa/matriz-predios.js` + as folhas `qa/categorias/pN.js` de cada um) |
| **O líder** | Integração, `qa/guard.js` (regras novas que vocês pedirem), `qa/qa.js` e `qa/junta-inv.js` (as invariantes de vocês entram pelos arquivos `*-inv.js` de cada um; arquivo novo de invariantes, peça para entrar no junta), `qa/regress.sh`, `save.js`, `CLAUDE.md`, `qa/AUDIT.md`, o documento do Patch 2 (`qa/PATCH2.md`: o diagnóstico, o plano e o resultado), os mundos prontos (`qa/prontos.js`, uma leva só no fim), as prévias e a publicação. | |

## 2. As regras que não se discutem (além do CLAUDE.md)

- **Nada de sistema paralelo.** A família é a do `villagers.js`/`life.js`; o trabalho é o das tarefas e do `G.Act`; os bens e
  as moedas, os do `G.Depot` (o livro-razão); a planta, a do `G.Interiors`; o corpo, o do `G.Possess`. Um interior vivo é o
  mundo de sempre olhado de perto — nunca um teatro montado para quem chega.
- **A mesma causa nos três níveis** (o salto, o passo, o corpo): um efeito no mundo tem uma causa no passo do mundo e
  acontece uma vez só. A simulação distante pode resumir, desde que guarde os fatos para a próxima ser coerente. Um mundo de
  1500 pessoas não pode ficar mais lento de jeito que se sinta: meça (`qa/salto.js`, o `perf` do `mar17.js`).
- **Quem chega não cria nada:** chegar perto, entrar, encarnar não cria morador, freguês, trabalhador, mercadoria nem
  evento; não teletransporta ninguém para casa; não reinicia uma operação.
- **Cada feature chega com a sua invariante, o seu cenário e, se a regra se lê no código, o pedido da regra do `guard.js` ao
  líder.** Conserto de defeito: reproduza antes, mostre a prova que falhava passando. Nada de afrouxar prova, de
  `try/catch` que esconde, de pular caso.
- **O que só se vê não muda o mundo** (regra 3, 13, 17): desenho, 3D, interface, partículas não escrevem no `G.S`, não tiram
  do acaso do mundo, não criam nem encerram operações, não reformam a planta.
- **Estado de módulo zera nos `G.worldHooks`; tudo o que precisa sobreviver vai no save** (um gancho `G.saveHooks` do seu
  módulo; mudança no `save.js` é do líder — peça). As tarefas não vão no save: o seu gancho guarda o que cada um fazia e
  devolve pelo `setTask`, ou se refaz no load pelo que o save tem. Save antigo continua abrindo (`qa/oldsave.js`).
- **Toda ordem a uma pessoa passa por `setTask`/`Vg.give`** (o `G.Possess.ask` e o `G.Crime.keeps` estão lá dentro).
- **Os números do AUDIT são do líder:** mande o texto (causa, conserto, prova) com o número da sua faixa (§4); eu escrevo.
  O mesmo para o `CLAUDE.md`.
- **Os nomes e os textos do jogo em português**, no tom dos vizinhos; o código no estilo da casa (comentários curtos do
  porquê, uma linha por ideia).

## 3. Como trabalhar

- Cada um trabalha na sua própria cópia do repositório (a ferramenta dá a cada agente a sua). Base: o commit do líder
  com esta carta, sobre a v37 (`87090a0`).
- **O contêiner reinicia sem aviso** (já aconteceu): commitem cada peça assim que ela passar no `guard.js` (e no
  `guarda3d.js`, se tocou o 3D). Commit pequeno, mensagem em português, sem nome de modelo. O líder pede as peças e integra.
- Antes de mandar uma peça ao líder: `node --check` dos arquivos, `node qa/guard.js`, `node qa/visual/guarda3d.js .` (se tocou
  o 3D) e as provas da sua área que a máquina deixar rodar (§5).
- Mensagens ao líder: curtas, com o que foi feito, o commit, o que passou, o que falta, a pergunta. Entre vocês, direto
  (o P1 com o P4 sobre os lugares, o P3 com o P4 sobre o motor das plantas…), com o líder avisado do que foi combinado.
- O dono não programa: os textos dele (relatório, prévia) em português simples.

## 4. As faixas de números

| Quem | Defeitos (L) | Limites de teste (T) | Decisões (D) |
|---|---|---|---|
| P1 | L-220–L-239 | T-130–T-139 | D-070–D-074 |
| P2 | L-240–L-259 | T-140–T-149 | D-075–D-079 |
| P3 | L-260–L-279 | T-150–T-159 | D-080–D-084 |
| P4 | L-280–L-299 | T-160–T-169 | D-085–D-089 |
| Líder | L-219 (usado), L-300+ | T-122 (usado), T-123–T-129, T-170+ | D-064–D-069, D-090+ |

Regras novas do `guard.js` (o líder escreve): 25–27 do P2; 28 do P3 («a forma é uma só»); 29 «um lugar, uma pessoa» (só o
`interiors.js` reparte os lugares, P4); as do P1 (a despensa só pelos adaptadores do `activity.js`; o lugar em casa só pelo
repartidor; a tarefa 'fest' só pelo `festivals.js`) recebem número quando chegarem.

## 5. A máquina (4 núcleos, 16 GB) — o que cada um pode rodar

A v37 está fechando: a geração dos 7 mundos prontos (≈ 4 h, a cadeia dos 1000 anos é a mais longa) e a regressão
completa estão rodando. Até o líder avisar:

- **Agora:** ler, escrever código, `node --check`, `node qa/guard.js`, `node qa/visual/guarda3d.js .` e scripts em Node que
  **só carregam o código** (`M.load`, sem `M.novo`/`M.pronto`: o `plantas.js`, o `catalogo.js`, plantas e prédios de mentira
  montados à mão) — **um processo seu por vez, com `nice -n 15`**.
- **1º aviso** (quando a geração acabar): mundos em Node (`M.novo`, `M.pronto`), um processo seu por vez, `nice -n 15`.
- **2º aviso** (v37 publicada): navegador (soak, encarna, visual) pela catraca do líder (`SP/onda2/catraca.sh`), um por vez.

Nunca `pkill -f`, nunca matar processo que não é seu: só pelo PID que você mesmo começou.

## 6. As decisões que já valem (da 1ª largada)

- **P1 (aprovada):** `G.Lar` no `act-lar.js`; os números L-220..L-229, T-130, D-070..D-073 foram propostos (refazer o texto).
  O `save.js` fica como está: o gancho do `act-lar.js` guarda e devolve quem estava dentro, quem dormia e a tarefa (D-073);
  se a ordem `setTask`→`endTask` atrapalhar no load, peça ao líder a mudança no `save.js`. Pedidos ao líder: a linha do
  `act-lar.js` no `index.html` (o P1 põe no branch dele); o `qa/lar-inv.js` no `junta-inv.js`; as regras do guard: (1) a
  `.pantry` só escrita pelos adaptadores do `activity.js` (com as exceções nomeadas até os donos consertarem: o `goHome` do
  `economy.js` (P2), o tributo do `court.js` (P2), os ovos do `pets.js` (P1), a horta do `urban.js` — T-130); (2) o lugar em
  casa só pelo repartidor; (3) a tarefa 'fest' só dada pelo `festivals.js`.
- **P2 (aprovada):** o `court.js` passa ao P2 (menos o bloco de desenho, do P3); o `Cr.feed` (`crime.js`) pelo livro, só
  essa função; **D-075, o tijolo: SIM**, consumido pela obra (adobe: egípcio e asteca; tijolo cozido: grego e romano; o
  nórdico nenhum), com a troca na fundação e o reembolso pelo entregue no `village.js` (o P2 pode mexer nessas linhas;
  avisar o P4); D-076..D-079 aprovados (refazer o texto); regras do guard 25–27 (o líder escreve); `qa/oficio-inv.js` no junta
  quando vier; mudança no `activity.js` avisada (L-246 aprovado).
- **P3 (aprovada — `auditoria-p3.md`):** `G.Forma` (`js/forma.js`) puro: sem `G.S`, sem acaso nenhum (variação só por
  `G.hash(b.id)`), na lista da regra 16; `ZPX = 3,04` (D-016); `formInto`, `int-monumentos.js`, `fidelidade.js`,
  `forma-inv.js` aprovados; a regra 28 «a forma é uma só» — mande o enunciado que se lê no código. O deus lê a casca pelo
  registro (`b.ip`: lado da porta, cumeeira, andares, redonda, anexo) — nunca força a planta: se um número só vem da planta,
  `want`/`pump` e o sprite de hoje até ela ficar pronta; o deus é a referência do dono, muda só o que a planta manda. Meça a
  memória do cache de sprites num mundo grande. O `B3.check` mais justo (0,3 m) só para os tipos da forma. A folha da matriz
  em `qa/categorias/p3.js`. L-a..L-j viram L-260..L-269; D-080+ para a forma única e o ZPX. Ordem: B1–B3 primeiro (o
  Coliseu é o caso do dono).
- **P4 (aprovada):** uma regra só do corpo (medir antes de corrigir, pela catraca quando houver navegador); a matriz por
  categoria (`qa/matriz-predios.js` + `qa/categorias/pN.js`); **os lugares: um repartidor só, `In.places` (P4)**, com regras
  registradas — as casas pelo P1 (`In.placeRule('casa', …)`, `In.bedRule(…)`), o trabalho pelos `t.item`/`t.use` do P2;
  regra do guard «um lugar, uma pessoa» (só o `interiors.js` reparte); o P4-6 (a porta do deus pelo lado da planta) é do P3;
  a inclinação das escadas com o P3; `S.avatar.use` ok; os mundos prontos numa leva só, no fim. Do P3 para o P4: o
  `Space.BASELESS` lido do `def.field` (pomar, apiário, salina); a extensão do motor (arquibancada com fileiras e
  escadinhas, cômodo em anel na casca redonda, base maciça sob um nível elevado, colunata como arcada abrindo num pórtico,
  a escada íngreme de templo como «escada de mão» larga); o `In.found` e o `In.migrate` dos tipos novos com planta
  (maravilha, teatro, monumento). **O `In.VERSION` é do P4: uma subida só para o Patch 2 inteiro** (o berço do P1, as
  famílias novas do templo do P3, os tipos novos).
- **Os acordos entre vocês (1ª largada):** P1↔P4: `In.places` (P4) com `In.placeRule`/`In.bedRule` (P1); `In.pathIn` (P4)
  para o passo da porta ao lugar; o berço opcional (sobe o `In.VERSION`); conversar com quem está dentro do mesmo prédio; o
  cartão da casa com `G.Lar.roster`. P1↔P3: os nomes de uso — templo `rezar`/`oficiar`/`ofertar`; trono `sentar`/`audiencia`;
  teatro e arena `assistir`/`atuar`/`lutar`; pirâmide `topo`; o `openPlace` usa o `q.st`. P1↔P2: a taverna pela tarefa
  `'tavern'` (st 0 a caminho, ≥ 1 dentro), a saída na hora de deitar do `G.Lar.clock(v).bed`, `G.Taverna.horas(b)`;
  `G.Termas.visit`; `G.Templo.ofertar`; o `goHome` pela despensa no `G.Depot`; os gestos comer, sentar, cozinhar, ninar (depois
  `G.Act.addAnim` do P2; a pose é do P4).

## 7. As fases

- **A** (a auditoria, só leitura) — feita na 1ª largada; nesta, o plano curto de quem perdeu a sua.
- **B** (a fundação de cada área: a API, os dados, o save, as invariantes, as regras) — o código puro, conferido no guard.
- **C** (as três fatias verticais do pedido: a casa com a família, a olaria com o tijolo, a taverna com freguês e
  dinheiro — cada uma com a parte de cada um; o líder junta as três numa prévia).
- **D** (as correções de arquitetura e de espaço: o Coliseu, as pirâmides, a Acrópole, os templos, as portas, as escadas,
  os porões).
- **E** (a cobertura de todas as categorias da matriz) · **F** (as regressões, a matriz validada, o relatório).

## 8. O que mandar ao líder no fim de cada fase

1. O que foi feito (os arquivos, os commits). 2. As provas que rodaram e o resultado. 3. Os textos do AUDIT da sua faixa.
4. As regras do guard e as invariantes que pediu. 5. O desenho: a API, os dados no `G.S`, o save, as invariantes, os
cenários e as regras do `guard.js` que você vai pedir. 6. O que ficou parcial, com o porquê.
