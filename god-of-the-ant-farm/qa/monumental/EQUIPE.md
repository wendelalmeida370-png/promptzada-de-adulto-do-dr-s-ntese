# Arquitetura Monumental — o briefing da equipe

> Cinco especialistas (M1, M2, V, C, E) e o líder. Cada um lê **a parte comum** e **a sua**. O plano está em `PLANO.md`,
> os números do diagnóstico em `DIAGNOSTICO.md`, o pedido do dono em `PEDIDO.md` (e as imagens `antes.png` e
> `referencia.webp`: olhe as duas — a referência é de escala e composição, não para copiar).

## Para todos

1. **Leia `CLAUDE.md`** (na raiz do repositório): as regras do projeto. O protocolo de qualidade não é opcional. Depois,
   `PLANO.md` e `DIAGNOSTICO.md` desta pasta. **Não leia o repositório inteiro**: procure com grep e leia trechos (`sed -n`);
   os arquivos grandes (`build3d.js` 336 KB, `forma.js`, `interiors.js`, `arch.js`, `render.js`) só nas partes que você mexe.
2. **O contrato (D-106) já está no código** (commits `f422ac3` e o seguinte):
   - `G.Escala` (`js/escala.js`): `Es.LADDER`, `Es.steps(type)`, `Es.choose(set, type)`, `Es.can(type, style, n)`, `Es.of(b)`,
     `Es.bill(type, step)`, `Es.billOf(b)`, `Es.n0(type)`, `Es.classic(type)`.
   - O prédio: `b.esc` (o id do degrau) e `b.w = b.h = n` (o lado do lote em casas de 4 m). Só o `village.js` escreve
     (regra 42 do guard).
   - A forma: `G.Forma.of(type, style, n)`, `Fo.has(type, style, n)`, `Fo.sizes(type, style)`, e
     `Fo.def(type, style, fn(L, n), sizes)` para registrar o gerador dos degraus novos, em `js/forma-espetaculo.js` (M1) e
     `js/forma-poder.js` (M2), já no `index.html`. **Registrar a forma de um tamanho é o que «liga» o degrau**: a cidade só
     oferece um degrau que o povo sabe erguer (`Es.can`).
   - A planta: `rec.n` e `In.nOf(rec)` (o lote no registro), `In.sizeOk(type, style, n)` (os tipos que a planta desenha sem
     forma declaram `TYPES[type].sizes`), `In.resized(b, from)` (a ampliação no lugar).
   - A cidade: `G.Village.startProject(set, type)` experimenta a escada; `G.Village.handFound(set, type, stepId, { built,
     x, y, R })` funda um degrau escolhido (provas, painel); `G.Village.workOf(b)` e `G.Escala.billOf(b)` são o trabalho e o
     custo **do prédio** (nunca `def.work` / `def.cost` do tipo).
   - O verificador: `qa/escala-inv.js` (S1: o lote, a forma e a planta do mesmo tamanho; S2: o lote é um degrau da escada).
3. **As regras do corpo valem em qualquer tamanho** (`In.BODY`, D-088): degrau de no máximo 0,30 m (uma escadaria alta tem
   os degraus que a altura pede), porta pública de pelo menos 2,2 m (um portal monumental de 4–8 m com a porta de gente dentro),
   parapeito de 0,9 m onde a queda passa de 1 m, assento de 0,40–0,45 m de altura e 0,70–0,80 m de fundo, passagem livre de
   1 m entre colunas. Crescer o prédio nunca cresce o degrau nem a porta de gente.
4. **O lote é quadrado** e o relevo pode ter degraus por baixo (o mapa sobe em degraus de 1,5 m): a forma de um degrau grande
   assenta numa plataforma — o pódio, o terraço, o crepidoma — que cobre o desnível, e a escadaria leva a ela. Até onde o pódio
   cobre (quantos metros de desnível) é combinado entre M1/M2 e C: **3 m (dois degraus do relevo)** salvo aviso.
5. **Um arquivo, um dono** (a tabela do `PLANO.md` §4). Se você precisa que outro arquivo mude, escreva o pedido exato no seu
   relatório (o quê, onde, por quê) — não mexa. `qa/AUDIT.md`, `CLAUDE.md`, `qa/README.md`, `qa/regress.sh` e
   `qa/linha-de-base.txt` são do líder: entregue os blocos de texto no relatório.
6. **Números do AUDIT** reservados para cada um (use em ordem; o que sobrar fica): M1 L-495–L-509, T-396–T-405, D-107–D-109 ·
   M2 L-510–L-524, T-406–T-415, D-110–D-112 · V L-525–L-534, T-416–T-420, D-113–D-114 · C L-535–L-549, T-421–T-430,
   D-115–D-117 · E L-550–L-559, T-431–T-435, D-118–D-119. Bug achado = linha L com a causa, a correção e a prova que falhava
   e passa; limite de prova = T; decisão = D.
7. **O mundo é determinístico** (CLAUDE.md, «Um acaso por sistema»): formas e plantas sem acaso nenhum (a planta usa os dados
   dela: `P.rr`, `P.pick`…); o desenho só `G.VR`; nunca `Math.random`; estado de módulo zera em `G.worldHooks`.
8. **Seu trabalho fica no seu worktree, no seu ramo**: commits pequenos; antes de cada um, `node qa/guard.js` e a vida curta
   (`cd qa && node soak.js 103 continente 128 4 normal 5 1 1`), mais as provas do seu domínio (as do `CLAUDE.md` e as suas
   novas). Mexeu no 3D: `node qa/visual/guarda3d.js .` e `ONLY=e11 node qa/encarna.js SAIDA`. **Não faça push.** Não gere os
   mundos prontos de novo (o líder gera uma vez no fim); para testar use os mundos prontos de hoje (`M.pronto('metropole')`,
   `'mega'`, `'mundial'`, `'anos1000'`) e a mão do deus (`handFound`), ou um mundo novo (`M.novo`).
9. **Máquina dividida** (4 núcleos, cinco especialistas): uma prova pesada de cada vez; nada de regressão completa (é do
   líder). O navegador: Playwright e Chromium já instalados (`require('playwright')`); o 3D é desenhado por software, lento —
   poucas fotos, pequenas.
10. **Pare no fim da primeira rodada** (a sua parte da fatia do Coliseu, abaixo) e entregue o relatório. O líder junta os
    ramos, olha as fotos e mede; depois manda você seguir. O relatório (a sua última mensagem), curto e factual: o que fez;
    os commits (hash e mensagem); as provas com os números (antes → depois); o bloco do AUDIT; os textos para o README e o
    regress; os pedidos a outros donos; o que ficou faltando e por quê.

## A fatia vertical: o Coliseu primeiro

O Coliseu (a maravilha romana, degrau `maravilha`, 10 casas = 40 m) é a primeira coisa a funcionar de ponta a ponta. Cada um
faz a sua parte dele na primeira rodada (M2 começa pelos palácios, que não dependem do Coliseu). O líder junta e valida —
as fotos de fora e de dentro, o desempenho, as provas — antes de alguém espalhar para os outros tipos.

## M1 — espetáculo e maravilhas

**Seus arquivos:** `js/forma-espetaculo.js`, `js/int-monumentos.js`, `qa/monumentos.js`, as provas novas `qa/monumental.js`
(as partes A, C, E e a H dos seus tipos; crie o arquivo com uma estrutura que M2 também use: uma função por teste, a linha
`PASSOU | monumental X …` / `FALHOU | …`) e o que precisar em `qa/`.

**Primeira rodada — o Coliseu (maravilha/romano, n = 10; e o colossal n = 13 se couber):**
- A forma: a fachada de três andares de arcadas e o ático (o tambor, com os arcos na proporção de gente: vãos de ~4–6 m), a
  praça em volta dentro do lote quadrado, as entradas (pelo menos 4, uma em cada eixo), a arena **oval de pelo menos
  20 × 12 m**, o pódio, a cávea em vários anéis (assentos de corpo), os corredores de entrada (vomitórios) que levam aos anéis,
  as escadas de cada nível, o subsolo (o hipogeu: corredores e jaulas, e a passagem para a arena), o velário (os mastros) se o
  orçamento couber. Altura de pelo menos 18 m. A forma de hoje (`amphi(L, o)` em `forma.js`) é o ponto de partida — leia-a,
  mas o degrau novo é seu, no seu arquivo.
- A planta (`int-monumentos.js`, a família da maravilha): a arena que se anda, cada assento um lugar de `assistir` (In.places),
  as entradas e os corredores, as escadas entre os níveis, o subsolo; **pelo menos 600 lugares**; cada assento alcançável a
  partir de uma porta; o tempo de fazer a planta medido (alvo: 400 ms em Node).
- A prova A (`qa/monumental.js`): as medidas da forma e da planta (lote, altura, níveis, arena, assentos, alcance), a forma ×
  a planta (a casca da planta segue o pé da forma), e o verificador limpo com o Coliseu de pé num mundo pronto (pela mão do
  deus em Roma).
- O teatro grego (L-494) é seu, mas na segunda rodada.

**Segunda rodada (depois do sinal do líder):** o teatro romano e os teatros dos outros povos (6, 8, 10), o teatro grego com a
L-494 (a orquestra no chão da planta, a beira das fileiras igual nas duas, as colunas do palco sólidas na planta), a Grande
Pirâmide (lisa a 51–52°, ≥ 36 m de base; o templo funerário diante dela e a calçada), o Templo Mayor (4–5 terraços, a
escadaria dupla, os dois santuários no topo, a praça cerimonial), as maravilhas grega (a acrópole e o templo sobre a rocha),
nórdica (o grande salão) e clássica, o grande monumento (n = 4), e as provas C, E, H.

## M2 — poder, fé e convívio

**Seus arquivos:** `js/forma-poder.js`, `js/int-palacio.js`, `js/int-civicos.js`, `js/int-familias.js` (só as famílias da
taverna e da casa rica), `js/int-moveis.js` (só móveis novos), `qa/palacios.js`, `qa/templo.js`, e as partes B, D, F, G e a H
dos seus tipos no `qa/monumental.js` (o arquivo é do M1: escreva as suas partes num arquivo seu, `qa/monumental-poder.js`,
com as mesmas linhas, e o líder junta).

**Primeira rodada — os palácios:** o palácio (`palacio`, n = 6) e o palácio colossal (`palacio_colossal`, n = 10) para pelo
menos três povos (o romano/grego, o egípcio, o nórdico): a fachada com pórtico e escadaria, o pátio cerimonial, o salão do
trono **de pelo menos 14 × 9 m e 9 m de pé-direito**, as alas, as salas de audiência e de trabalho, os aposentos, os lugares da
guarda e do serviço; a planta pela forma (`int-palacio.js` / a família da forma do palácio: o trono, a audiência, os lugares).
A prova B: o palácio contra a casa (a área ≥ 30 vezes, o salão do trono, os pátios, a escadaria), o verificador limpo.

**Segunda rodada:** os templos de cada povo (templo 4, grande templo 6, santuário monumental 8: o grego períptero no
crepidoma dentro do recinto sagrado, o romano no pódio, o egípcio de pilono, pátio e sala hipostila, o asteca sobre a
pirâmide de degraus, o hof nórdico), a taverna (3) e a hospedaria (4, dois pisos e pátio: salão de pelo menos 10 × 8 m,
mesas, balcão, cozinha, depósito, quartos), a casa rica (domus, 2: o átrio), o grande palácio (8), o paço (3); as provas D,
F, G.

## V — a visão do deus

**Seus arquivos:** `js/arch.js`, `js/render.js` (o desenho dos prédios e a ordem do desenho), `js/art.js` (só o necessário),
`qa/visual/fidelidade.js` e uma prova nova sua (`qa/visual/forma-deus.js`).

**Primeira rodada:**
- **O pintor da forma** (`G.Arch.formSprite` ou o nome que couber no `arch.js`): desenha as peças de uma forma
  (`bloco`, `talude`, `piramide`, `escalonada`, `tambor`, `cavea`, `arena`, `telhado`, `colunas`, `escada`, `estatua`…) na
  projeção do deus — a mesma dos desenhos à mão (x e y em casas a partir do meio do lote, a altura em metros × 3,04 px
  (`G.Forma.ZPX`)), com a paleta e a sombra do deus —, em qualquer tamanho. Confira-o contra as formas de hoje: o pintor da
  forma clássica do templo, do teatro, da maravilha… contra o desenho à mão (as silhuetas quase iguais).
- **O deus desenha o degrau novo pela forma**: um prédio cujo lote não é o clássico do tipo (`b.w !== G.Escala.n0(b.type)`)
  é desenhado pelo pintor, do tamanho dele — as chamadas do `render.js` passam o prédio (ou o tamanho) a quem desenha.
- **A ordem do desenho** dos prédios grandes: a pessoa ao lado ou atrás de um prédio de 10 casas desenhada do lado certo.
- Para testar antes da forma do M1 chegar: um gerador de teste registrado só na sua prova (`Fo.def(...)` dentro do teste,
  como o líder fez em `sondas/mon/contrato.js`).

**Segunda rodada:** todos os degraus novos que o M1 e o M2 entregarem; o minimapa e os desenhos 2D que leem o tipo; o custo de
memória dos «sprites» grandes.

## C — a cidade e a simulação

**Seus arquivos:** `js/village.js` (o planejador, além do contrato), `js/urban.js`, `js/economy.js`, `js/court.js`,
`js/siege.js`, `js/escala.js` (só os números: `req`, `k`, `n` — não a API), as atividades que chamam gente para dentro dos
prédios (`js/act-lazer.js`, `js/act-lar.js`, `js/festivals.js`, `js/act-taverna.js`: só a chamada e a lotação), e a prova nova
`qa/escala.js`.

**Primeira rodada — o terreno e a obra do Coliseu:**
- **Abrir espaço para um monumento**: hoje não há terra (o `DIAGNOSTICO.md`, «A terra para os monumentos»: perto das capitais
  maduras o maior quadrado livre tem 4 casas). Um degrau grande pode mudar campos de lugar e realojar famílias de casas baixas,
  com regras: nunca um prédio público, nunca as duas últimas fazendas, mais camas construídas do que derrubadas (como o
  `blockSite` da ínsula), um limite por degrau, a linha na crônica. O relevo sob o lote vira pódio até 3 m (item 4 comum).
- **Os palácios pela escada** (`court.js` escolhe o lugar do palácio hoje com o tamanho do tipo).
- **O custo e o tempo**: os `k` da escada para que um monumento leve anos da cidade e termine (meça numa vida de 30 anos).
- **A ampliação**: uma cidade que cresceu amplia o seu monumento no lugar (o mesmo prédio, o mesmo nome, a mesma história;
  `In.resized(b, de)` para o registro da planta; o lote cresce sobre terra livre ou aberta pelas regras acima).
- **A prova `qa/escala.js`** (o cenário do protocolo): a aldeia escolhe o pequeno e a capital o grande; sem terra, o degrau de
  baixo; abrir espaço com as regras; o save no meio da obra grande; o deus derruba no meio; a cidade que encolhe; a ampliação
  (o mesmo id, a história, os moradores); um save de antes igual; a mesma semente, a mesma escolha.

**Segunda rodada:** a lotação nas atividades (a plateia do teatro e da arena chamada pelos lugares que o prédio tem, os fiéis
do templo grande, a freguesia da hospedaria, a audiência do palácio); a D-102 (o teto dos ofícios guarda uma pessoa para cada
serviço aberto quando a comida está garantida); a D-103 (a ronda da noite fica no posto); os portões que não deixam passar
(L-491, em `siege.js`); o painel do desenvolvedor para fundar um degrau (uma seção pequena no `devmode.js`, pela
`handFound`).

## E — o 3D, o corpo e a câmera

**Seus arquivos:** `js/build3d.js`, `js/realm3d.js`, `js/cam3d.js`, `js/avatar.js`, `js/interact.js` (a D-104), e as provas
novas `qa/visual/monumental.js` (as fotos e a experiência) e uma parte nova do `qa/encarna.js` se precisar (combine com o
líder: o `encarna.js` é grande).

**Primeira rodada — o Coliseu no 3D e por dentro:**
- **O 3D das formas grandes**: as peças repetidas (arcos, assentos, colunas) sem estourar o orçamento (instâncias ou
  geometria juntada), um teto de triângulos por prédio medido, a silhueta de longe (`Fo.mass`) no mesmo tamanho, e o prédio
  que atravessa vários pedaços do mapa (chunks) sem pipocar.
- **A câmera nos espaços grandes**: de fora, ver a altura da fachada (olhar para cima, a distância — o máximo de hoje é 11 m);
  de dentro, a câmera com folga, sem bater no teto nem nas paredes de um salão alto. Meça a distância livre (`C3.cur`).
- **O corpo**: subir a escadaria longa, andar na galeria com parapeito sem cair, sentar na cávea (o verbo «lugar»).
- **As fotos** (`qa/visual/monumental.js`): o Coliseu fundado pela mão do deus em Roma — de fora (o corpo diante da fachada), da
  arena olhando as arquibancadas, de cima de um anel — para `qa/monumental/fotos/` (JPG pequeno). Enquanto a forma do M1 não
  chega, teste com um gerador de teste registrado só na sua prova.
- **O desempenho**: o quadro do Modo Encarnado na metrópole (a medida do e8) com o Coliseu à vista — alvo: mediana ≤ 13 ms.

**Segunda rodada:** os outros monumentos no 3D e nas fotos (o palácio e o salão do trono, as pirâmides, a nave do templo, o
teatro, o salão da hospedaria); a D-104 (na própria casa, o E oferece sentar sempre e comer quando há o que comer); a prova I
inteira (o corpo entra pela porta, anda, sobe, senta, em três povos).
