# God of the Ant Farm — como trabalhar neste projeto

O jogo está em `god-of-the-ant-farm/` (HTML + JavaScript puro, sem build: abra `index.html`). As ferramentas de teste estão em `god-of-the-ant-farm/qa/` (leia `qa/README.md`). O histórico de bugs, reformas e decisões está em `qa/AUDIT.md`; o relatório da estabilização, em `qa/RELATORIO.md`.

O dono do projeto fala português e não é programador: responda em português, explique em linguagem simples, dê notícias curtas do andamento. O objetivo dele é que o jogo cresça muito sem acumular bugs — **o protocolo abaixo não é opcional**.

## Protocolo de qualidade (vale para toda mudança, grande ou pequena)

1. **Toda feature nova chega com o seu verificador e o seu cenário.**
   - Uma *invariante* em `qa/qa.js` (`QA.check`): uma regra que precisa ser sempre verdade no mundo enquanto a feature existe (ex.: "ninguém a bordo de navio que não existe", "o mapa de alcance bate com o chão"). Severidade S0 (corrompe) a S4 (detalhe).
   - Um *cenário* (um arquivo em `qa/`, rodado por `ev.js` ou próprio) que provoca a feature de propósito, inclusive nos casos ruins: save/load no meio, a pessoa morre no meio, o deus interfere, o mapa muda.
   - Se a feature tem uma regra que se lê no código (ex.: "só tal função escreve tal campo"), uma regra nova em `qa/guard.js`.
2. **Antes de cada versão publicada, a regressão completa:** `bash god-of-the-ant-farm/qa/regress.sh` (≈ 1 h 15 min). Ela compara o resultado com `qa/linha-de-base.txt`; toda linha `NOVO:` precisa ser explicada (bug novo → corrigir; mudança esperada → atualizar a linha de base e dizer por quê no commit). Erro de página, aviso no console ou erro de módulo (`G.modErr`) é sempre falha. Fases já rodadas na mesma pasta podem ser puladas (`SKIP="mar guerra" bash qa/regress.sh pasta`; as fases: mar, guerra, vida, estado, tela, cidade, perf); a prova de desempenho roda sozinha no fim, porque com a máquina ocupada os tempos não valem nada — se a máquina estiver ocupada (gerando mundos prontos, por exemplo), rode com `SKIP="perf"` e depois, com ela livre, só o desempenho na mesma pasta.
3. **Antes de cada commit:** `node god-of-the-ant-farm/qa/guard.js` (um segundo) e uma vida curta com o verificador (`node qa/soak.js 103 continente 128 4 normal 5 1 1`).
4. **Bug achado = entrada no `qa/AUDIT.md`** (L-xxx bug, T-xxx limite de teste, D-xxx decisão de design), com a causa e a correção. Antes de corrigir, reproduza; depois, mostre que a prova que falhava passa.
5. Corrija a causa, não o sintoma. Nada de esconder um erro com `try/catch`, pular uma prova ou afrouxar uma invariante para ficar verde.

## As fundações (não contornar)

Três famílias inteiras de bugs foram eliminadas reconstruindo a base. Código novo precisa usar estas portas:

- **Aonde se chega a pé — `W.reachIds()` / `W.canWalk` / `W.reaches` / `W.reachesTown` / `W.townReaches` / `W.townsLinked`** (`js/world.js`). Para saber se alguém alcança um lugar, pergunte ao mapa de regiões, não a "mesma ilha". **Quem muda o chão avisa:** prédio que aparece/some/vira ruína, muro, portão, ponte → `W.touchWalk()`; terreno → `S.typeVer++` (+ `W.invalidateLand()`). O `guard.js` cobra isso.
- **Quem está a bordo — `G.Naval.board(v, navio)` / `G.Naval.unboard(v, lugar, manterTarefa)`** (`js/naval.js`). `v.aboard` é a única verdade; `s.crew` é só a lista do navio. Nunca escreva `v.aboard` à mão. Para saber quem está num navio: `G.Naval.aboardOf(s)`.
- **Um acaso por sistema** (`js/util.js`):
  - o **mundo** sorteia com `G.R()`, `G.rr`, `G.ri`, `G.pick`, `G.chance` — semeado pela semente do mundo, guardado em `S.rng` e no save;
  - o que **só se vê ou se ouve** (desenho, partículas, céu, câmera, cinema, música, interface) usa `G.VR()`, `G.vrr`, `G.vri`, `G.vpick`, `G.vchance`;
  - **nunca** `Math.random` (o `guard.js` cobra).
  - Desenho e interface **não mudam o mundo**: não gravam campos que a simulação lê, não disparam reconstruções de listas da simulação (se uma consulta pode vir de fora do passo do mundo, teste `G.inSim`).
  - **Estado de módulo começa de novo a cada mundo:** relógio, contador, lista ou cache guardado num módulo (`let tAlgo = 0` etc.) precisa ser zerado num `G.worldHooks.push(() => { ... })` — que roda ao criar um mundo e ao carregar um save. Identidades novas vêm de `G.S.nextId++`.
  - Resultado: a mesma semente faz o mesmo mundo, com ou sem gente olhando, e o mesmo save carregado duas vezes vive o mesmo futuro. `qa/det3.js` prova isso; `qa/detloc.js` aponta o passo e a linha exatos onde duas vidas que deveriam ser iguais se separam; `qa/rngtrace.js` mostra quem sorteia de qual acaso.
  - Para reproduzir um bug: o modo desenvolvedor (F2 → Tempo → "Mundo novo de teste") mostra a semente do mundo, recria o mesmo mundo e aceita uma semente para o próximo.

- **A cidade — `G.Urban`** (`js/urban.js`): células de 6×6 casas, valor da terra, núcleos e bairros (os bairros vivem em `set.urb` e vão no save; o retrato do dia, `G.Urban.peek`, não). Prédio novo numa cidade pergunta a `G.Urban` onde vai e se pode ser alto; um módulo novo registra o peso e o nome do seu prédio com `G.Urban.addWeight / addName / addBirth / addNear`. As moedas de uma família ficam na casa (`h.coin`): quem rouba, quem paga a rodada, quem compra a casa da terra cara mexe nelas de verdade (e uma casa derrubada para uma obra passa as moedas ao bolso do mais velho). Uma metrópole refaz o centro em quarteirões só por `G.Village.blockSite`: terra de ínsula, derrubando apenas casas baixas, sobrados, hortas e campos da própria cidade — nunca um prédio público, nunca as duas últimas fazendas — e trazendo mais camas do que tira.
- **Quem está preso — `v.jail`** (`js/crime.js`): é a única verdade, e só o `crime.js` põe e tira alguém da cadeia (o `guard.js` cobra). Toda tarefa dada a um preso passa por `G.Crime.keeps` (dentro de `setTask`): um afazer comum devolve a cela; só um tumulto (prioridade ≥ 5: fogo, pânico, um navio) o tira de lá — e isso é fuga. Barraco só o `social.js` levanta.

- **Uma pessoa tem sempre o mesmo molde — `G.Vg.shape`** (`js/villagers.js`): toda pessoa nasce (`Vg.create`) e é carregada (`save.js`) com as mesmas chaves na mesma ordem (a lista `SHAPE`). Isso deixou cada passo ~⅓ mais rápido. Campo novo numa pessoa entra na lista `SHAPE`; os bichos fazem o mesmo no molde de `A.spawn`. Nunca dependa de uma chave "existir ou não" (`'x' in v`): ausente e `undefined` são a mesma coisa.
- **O salto vive em dois ritmos — `G.Main.skipStep`** (`js/main.js`): o rápido (pessoas, lutas, exércitos, navios, fogo) em meios passos, o lento (bichos, plantas, planejamento, política, economia) num passo inteiro no meio deles. Durante o salto, contagens repetidas (`G.Fac.pop`, `G.Village.pop`, `G.Fac.has`, `G.Village.cap`, `Vg.hasWell`) valem por uma parte do passo (`G.perPart`); um laço que espera uma contagem mudar dentro do mesmo passo não pode existir.
- **A memória dos mortos — `G.Village.forget` / `cemeteryFor` / `bury`** (`js/village.js`): o registro esquece estranhos depois de 80 anos (governantes, heróis, quem tem apelido e os pais e avós de quem está vivo ficam); só `Village.bury` abre cova (doze por cemitério; o `guard.js` cobra); o cemitério mais velho é reaproveitado (ossuário).
- **Mundos prontos — `worlds/`** (gerados por `qa/prontos.js`, abertos por `js/ready.js`): só se geram com o salto do próprio jogo, nunca editados à mão. Depois de uma mudança que altera o save ou o mundo, gere de novo (`node qa/prontos.js tipo`) e rode `qa/mundos.js`.

## Outras regras do código

- Cada módulo roda isolado (`G.tryRun`): um que quebra não derruba os outros, mas conta em `G.modErr` — e isso é falha nos testes.
- Saves: tudo que precisa sobreviver a um save entra em `js/save.js` ou num `G.saveHooks`. Um save antigo precisa continuar carregando (`qa/oldsave.js`); um save danificado é recusado limpo ou carregado sem erro (`qa/corrupt.js`).
- O estilo do código: comentários curtos que dizem o porquê, nomes como os vizinhos, uma linha por ideia.

## Versões, commits e publicação

- Desenvolva no branch indicado pela sessão; commit e push só depois do protocolo acima.
- O dono acompanha o jogo pelo artefato publicado (claude.ai); publique a nova versão nos marcos, depois da regressão.
