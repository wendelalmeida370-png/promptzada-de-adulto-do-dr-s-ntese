# A Fundação de Gameplay e os Interiores Vivos (v37): o diagnóstico e o plano

> O resultado, para quem não programa: `RELATORIO_FUNDACAO.md`.

O pedido do dono (19/10) tem dois pilares e um adendo:
- **a Fundação de Gameplay:** atividades reutilizáveis, completas e causais;
- **os Interiores Vivos:** prédios com dentro, coerentes, variados, funcionais e persistentes;
- **o adendo:** uma realidade só, em três níveis de resolução, com testes de invariância causal.

Este arquivo junta a auditoria dos três especialistas (C1 atividades e economia, C2 interiores, C3 o corpo, o 3D e a
interface) num diagnóstico só e no plano. O que for sendo feito entra aqui, separado em: provado rodando / sem prova /
parcial / só projetado / bloqueado.

## 1. A arquitetura encontrada

O jogo é HTML + JavaScript puro, sem build, com o three.js r170 local, aberto por `file://`.
- **O Modo Deus** desenha em 2D (`render.js`, `arch.js`); **o Modo Encarnado** desenha em 3D (`realm3d.js`,
  `build3d.js`, `people3d.js`…), e o 3D só desenha o que `G.S` diz.
- **A simulação** é uma lista de módulos rodando em ordem (`main.js`: `MODS`), cada um isolado (`G.tryRun`).
- **O acaso** é um por sistema: o mundo usa `G.R`, o que só se vê usa `G.VR`.
- **O save** é o `G.S` mais os `G.saveHooks`.
- **As travas** são o `qa/guard.js` (regras lidas do código), o `qa/qa.js` (`QA.check`: invariantes de S0 a S4), os
  cenários e a regressão (`qa/regress.sh`).

O que serve de base para os dois pilares, reaproveitado e não reinventado:

| Já existe | Onde | Como entra |
|---|---|---|
| Estoque do povo, casas com moedas e despensa, prateleiras, cais com caixas, porão dos navios, carga nas mãos | `economy.js`, `urban.js`, `social.js`, `harbor.js`, `naval.js`, `villagers.js` | vira o **depósito único** (`G.Depot`, C1), com os mesmos campos: nenhum estoque migra |
| As tarefas das pessoas e seus executores | `villagers.js` (`setTask`, `Vg.give`, `H`) | passam a ser **a mão** que executa uma operação persistente (`G.Act`, C1) |
| O registro de interações do corpo | `interact.js` (`G.Interact.add`) | continua; os efeitos passam pelas operações (C3 + C1) |
| A posse, os chamados, as forças do mundo | `possess.js`, `modes.js` | a posse assume a atividade que já existe (C3 + C1) |
| A biografia, a crônica, as histórias | `life.js`, `stories.js` | são as evidências e o diário de vida (C1 dados, C3 tela) |
| O ciclo de vida dos prédios, o lote, o valor da terra | `village.js`, `urban.js` | onde a planta nasce, muda e vira ruína (C2) |
| O rig, as poses, a pilha de materiais | `people3d.js`, `body3d.js`, `tex3d.js` | recebem a IK de braço, as coisas na mão e as receitas de ação (C3) |

## 2. O diagnóstico

**Ausente:**
- interior nenhum, nem nos dados nem no 3D, e portanto nenhum móvel funcional;
- operações persistentes: a tarefa não vai no save;
- livro-razão, reservas e transferências atômicas;
- perfil de capacidades do mundo, falas de atividade e diário;
- carregar a dois e animações de ação em fases.

**Existe, mas incompatível com a fundação:**
- **A carga e a decoração:** a carga desenhada na mão é uma caixa genérica para ~45 bens; a banca mostra fruta
  sorteada, e não o estoque; caixas e sacos decorativos parecem mercadoria e não são.
- **As portas:** são três, que não batem entre si (`Vg.door`, `V.door`, `frontTile`) nem com a do 3D.
- **A casca do 3D:** o tamanho vem do tipo, não do que a casa abriga.
- **O dormir:** quem "dorme em casa" aparece deitado na rua no 3D.

**Defeitos achados na auditoria** (cada um vira uma entrada L-xxx no `AUDIT.md`, com a reprodução, quando corrigido):
- **O corpo encarnado trabalha mais rápido que um morador**, por segundo do mundo: árvore 2,25×, pedra ~2×,
  frutas ~3,5×. Os efeitos rodam fora do passo do mundo (até um `G.R()` do peixe) e acontecem com o mundo parado (o menu
  aberto). Fere o adendo: a presença do jogador dá recurso de graça.
- **Encarnar um estivador com uma caixa** faz a caixa voltar sozinha ao cais.
- **`addStock` destrói o que não cabe;** "o destino cheio" não pode destruir bens.
- **O mercador sem moeda leva o atacado de graça;** a compra paga some se o caminho falha; depois de um load, a compra
  vai para o armazém do povo.
- **A carga some na morte de quem a leva;** a carroça some com a carga.
- **`R.stallGoods` grava `b._sg` a partir do desenho**, ou seja, o desenho escreve num prédio.
- **A pesca da margem não tem limite** (o pedido proíbe captura ilimitada).

**A conta honesta das pegadas (C2).** Todo lar é um lote de 4×4 m, menos o quarteirão. O que cabe em cada um:
- barraco e cabana cabem num cômodo;
- a casa de 6 moradores **não** cabe num cômodo só: precisa de jirau no telhado, de terraço onde o telhado é plano, ou
  de piso semienterrado (a *Grubenhaus* do norte);
- o sobrado precisa de 2 pisos;
- a ínsula, de 3 ou 4.

A casca do 3D passa a vir da planta, dentro do mesmo lote: nenhum lote, rua ou save muda. É a "migração consciente" do
pedido.

**O limite da ontologia.** O mundo tem cinco povos antigos (grego, nórdico, egípcio, asteca, romano) e dez técnicas.
Não há era industrial nem futurista. Os testes de universalidade usam os contrastes que existem de verdade:
- moeda contra troca;
- porto contra interior;
- aldeia contra metrópole;
- rio contra mar contra deserto;
- os cinco povos e as técnicas.

O cenário industrial ou futurista do pedido fica **bloqueado pela ontologia atual**: não será fingido.

## 3. A invariância causal (o adendo)

O projeto já garante a base: a simulação roda igual em todo o mapa, com ou sem câmera perto. `qa/det3.js` prova que a
mesma semente faz o mesmo mundo com ou sem gente olhando; `qa/detloc.js` acha o passo em que duas vidas se separam.

Os três níveis já correspondem a:
- **o salto no tempo** (`G.Main.skipStep`: o rápido em meios passos, o lento num passo inteiro): o nível agregado;
- **o passo normal**: o nível individualizado;
- **o Modo Encarnado** (o mundo no passo da pessoa, D-015): o nível incorporado.

Onde a causalidade pode quebrar hoje, pela auditoria:
- a tarefa, que não vai no save;
- as filas;
- a posse, que larga a tarefa;
- os efeitos do corpo fora do passo;
- o desenho que escreve no prédio.

A fundação nova fecha esses buracos:
- **a operação é a verdade, a tarefa é a mão:** o supervisor redistribui as operações depois de um load, de uma posse
  ou de um salto;
- **o corpo pede, e o mundo faz no passo**, pelas mesmas operações de um NPC, no mesmo ritmo;
- **um livro-razão** guarda a causa de cada movimento, com uma chave que impede aplicar duas vezes;
- **a apresentação nunca vai à frente:** a caixa na mão é a da operação, a banca mostra o estoque e a porta aberta é a
  porta do mundo.

| Teste do adendo | Dono | Onde |
|---|---|---|
| A. a loja agregada contra a individualizada e a incorporada | C1 | `qa/invariancia.js` |
| B. uma operação atravessando o salto, o passo, o corpo e um save | C1 | `qa/invariancia.js` |
| C. os NPCs e o tempo que passou | C1 | `qa/invariancia.js` |
| D. o prédio e o interior atravessando tudo | C2 | `qa/interiores*.js` |
| E. a conservação e a idempotência | C1 | `qa/atividades.js`, `qa/invariancia.js` |
| F. o mesmo cenário com e sem câmera, com e sem corpo | C1, com o líder (`det3.js`/`detloc.js` com as atividades ligadas) | `qa/invariancia.js` |
| §5 no 3D: a apresentação nunca à frente | C3 | partes novas do `qa/encarna.js` |

## 4. O desenho

**Os contratos completos** estão nas auditorias (`SP/fund/auditoria-c1.md` §0, `auditoria-c2.md` §0, `auditoria-c3.md`
§5–§7); aqui fica o essencial.

**`G.Depot` (C1): quem guarda coisas.** É uma referência em texto: `f:` povo, `h:` casa, `b:` prateleira, `z:` banca,
`q:` cais, `s:` navio, `v:` mãos, `p:` bolso, `g:` chão.
- Leitura: `get`, `free`, `room`, `list`, `owner`, `may`, `slots`, `form`, `weight` e `hands`.
- Escrita, sempre atômica e no livro-razão com a causa: `move`, `make`, `use`, `reserve` e `unreserve`.
- Nada some por falta de espaço: o que não cabe fica onde estava.
- Os móveis de C2 dão capacidade e lugar, nunca um segundo estoque.

**`G.Act` (C1): as atividades.**
- As definições declaram as 15 coisas do pedido §9.
- As operações vivem em `S.acts`, com estado, participantes, reservas, progresso confirmado, pagamento e histórico.
- `Act.caps(set)` é o perfil de capacidades do lugar.
- O corpo e o NPC usam as mesmas `begin`, `commit` e `perform`, chamadas dentro do passo.
- Na posse, `Act.possessed` e `endTask(v, {keepLoad: true})`.
- Por cima: `G.Biz` (o negócio) e `G.Falas` (as falas, em pacotes por povo e era, sem LLM).

**`G.Interiors` (C2): a planta.**
- A planta é função pura do id do prédio e de um registro pequeno nele (`b.ip`, que vai no save com o prédio). O
  gerador sorteia só pela semente do id (`G.mulberry32`), nunca pelo acaso do mundo.
- A forma: casca (com telhado, base e anexos), pavimentos (com tipo: jirau, sótão, terraço, porão, esteios), paredes,
  vãos, portas, cômodos, escadas e móveis com pontos de uso.
- O estado que muda (portas, ocupação) fica à parte, em `G.Interiors.state(b)`, mudado por uma operação só
  (`useDoor`).
- A porta do mundo: `G.Interiors.door(b)`.
- Pelo menos cinco famílias estruturais por combinação válida, com catálogo e testes.
- A validação recusa a planta que não cabe, não conecta ou bloqueia a passagem.

**O 3D e o corpo (C3).**
- Lê a planta por um adaptador só (`G.Space.plan`) e desenha o interior, com o telhado em corte e a câmera dentro.
- Colide com as paredes de dentro e abre as portas pelo estado do mundo.
- As coisas na mão vêm da carga autoritativa, por um catálogo universal de formas por bem, povo e era, com a IK de
  braço e o peso na pose.
- As ações têm fases: aproximar, contato, efeito pedido ao mundo, resultado, volta.
- Há balões de fala, sons de manuseio e de passos, a interface contextual (com os modos manual, assistido e delegado) e
  o diário.

**As travas novas:**

| Regra | O que diz | Dono |
|---|---|---|
| 12. o livro-razão | os campos de estoque só se escrevem nos adaptadores do `G.Depot` | C1 |
| 13. a operação é do mundo | o que só se vê não chama as escritas | C1 |
| 14. a carga tem dono | caixa nova no cais nasce com `id` e `op` | C1 |
| 15. só `interiors.js` escreve `.ip` | | C2 |
| 16. interiores sem acaso | | C2 |
| 17. o desenho não chama as escritas dos interiores | | C2 |

As invariantes de cada sistema entram primeiro pelo `QA.more` (o arquivo de prova do dono) e depois dentro do
`QA.check`, quando o sistema chega ao `integracao`.

## 5. O plano

| Etapa | O quê | C1 | C2 | C3 | Prévia |
|---|---|---|---|---|---|
| 1 | Fundações | `G.Depot`, `G.Act`, save, migração, os embrulhos (`endTask`, a morte, o pós-load), `atividades.js`, a simulação em Node | `b.ip`, os ganchos no ciclo do prédio, `Interiors.door`, o esqueleto da API, o harness em Node | as coisas na mão (formas, IK, peso), as ações em fases, o corpo sem vantagem (a fila no passo), a posse que assume | sim |
| 2 | Interiores básicos | `Depot.slots` com os móveis, a capacidade pelos móveis, o balcão ligado à banca | o motor (receitas, grade, validação, assinatura), os lares (barraco → quarteirão, com ≥ 5 famílias onde cabem), o armazém, o mercado e a feira, as oficinas, a planta no Modo Deus, a vida do prédio, o teste D | o interior no 3D, o telhado em corte, a câmera dentro, a colisão, as portas, dormir na cama, os móveis e os NPCs de dentro | sim |
| 3 | O corte vertical: o negócio e o porto | a descarga no cais (manifesto, equipe, paga, conferência, interrupções, a dois), o negócio (atacado pago, exposição, pechincha, fechamento do dia, troca onde não há moeda), a compra que chega em casa, as falas dos cinco povos, a caravana no depósito, os testes A, B, C, E e F | os espaços do negócio e da logística como pontos de verdade, com as provas de alcance | as caixas reais no cais, o estivador e o corpo pelas mesmas fases, a banca com o estoque real, a pechincha com gestos e balões, a interface com o diário e o fechamento | sim |
| 4 | Mais atividades | pesca (com limite), moradia, promessas | — | as animações delas | sim |
| 5 | Mais prédios | — | taverna, templo, quartel, cadeia, banhos, palácio… | o desenho deles | — |
| 6–7 | Universalidade e validação integrada | os contrastes possíveis da ontologia, a regressão completa | | | v37 |

Ao fim de cada etapa, o líder:
1. integra no `integracao` e passa a porta de integração (`guard.js`, `guarda3d.js`, `corpo-rig.js`, a parte e11 do
   encarna e a vida curta), mais as provas da etapa;
2. publica uma prévia no link de prévias;
3. só depois da regressão completa, publica a versão no link de sempre.
