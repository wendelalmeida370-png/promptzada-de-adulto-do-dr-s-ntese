# A decoração por uso e por ofício — o manual de uma onda (os interiores 3, F7; D-1010 a D-1013)

Para quem vai pôr a decoração de um prédio — a forja, o templo, o palácio, a cadeia — numa onda dos interiores 3. A regra magna do
dono (D-651): **a decoração tem causa, nunca sorteio** — e nada vem do nada (D-440): o que se vê dentro de um prédio está lá porque o
mundo o tem, e cada coisa diz o porquê. A taverna é o modelo: tudo o que ela mostra entra pelas mesmas portas abaixo.

## 1. As duas metades

- **O que o prédio mostra e por quê** — `G.Atmos.within(b)` (`js/atmos.js`): puro (lê o mundo, não escreve nada, não tira de acaso
  nenhum), um registro por prédio e instante. É **o núcleo** (o que todo prédio tem: a bebida do livro, a comida pelas suas partes, os
  bens da casa, a louça de quem mora, a panela do fogo que cozinha, a lenha, as lamparinas, o pano, a teia dos anos) **mais as regras do
  uso** do prédio — o uso da planta (`G.Interiors.TYPES[tipo].use`: `taverna`, `casa`, `forja`, `templo`, `palacio`…), dito por
  `G.Atmos.usoOf(b)`.
- **Onde cada coisa fica** — `G.Dentro3D.plan(b, p)` (`js/dentro3d.js`): só desenha (não escreve no mundo, não lê o livro nem o armazém por
  conta própria: só o `W` do within), e cada escolha entre jeitos verdadeiros é do `G.hash` do id (`K.hv`). É **o construtor do uso** e,
  depois dele, as camadas de todo prédio (o pano, as lamparinas, as teias).

## 2. Uma onda acrescenta um prédio (num arquivo seu, sem mexer nos dos outros)

Um arquivo da onda, `js/dentro-<uso>.js`, posto no `index.html` **depois do `js/dentro3d.js`**:

```js
(function (G) {
  const NONE = Object.freeze([]);
  // 1) o que o prédio tem e por quê: os campos que o uso diz (puro) — c é o que o núcleo já leu do prédio
  G.Atmos.withinRule('forja', (b, c) => {
    const o = c.ler.oficio(b);                        // quem trabalha, as ferramentas do kit, a fornada, o que foi feito
    return { bigorna: o.obra.length ? Object.freeze({ k: o.obra[0].k, why: o.obra[0].why }) : null };
  }, { campos: { bigorna: null } });                  // o campo novo, com o valor vazio que todo outro prédio diz
  // 2) onde cada coisa fica: o construtor do uso (ctx do prédio, K o kit)
  G.Dentro3D.builder('forja', (ctx, K) => {
    const { W, p } = ctx; if (!W.bigorna) return;
    const bench = ctx.S.find(s => s.k === 'tampo' && s.it.kind === 'bancada');
    if (bench) K.pack(ctx, bench.it, bench, [{ k: 'lingote', key: 'lingote', why: W.bigorna.why }], { room: bench.room });
  });
})(window.G);
```

- **A regra** (`G.Atmos.withinRule(uso, fn, o)`): `fn(b, c)` devolve os campos do uso. `c` traz o que o núcleo leu — `civ`, `f`,
  `fid`, `known`, `rico`, `home`, `ref` (o lugar do prédio no livro: `'h:'` da casa ou `'b:'`), `barro`, `metal`, `couro`, `weave`, `fire`,
  `conta`, `wear`, `why` (os porquês: acrescente os seus) — e `c.ler`, as portas das leituras de verdade (§4). Campo novo vem em
  `o.campos` com o seu valor vazio: **todo within tem todo campo** (nenhum leitor pergunta se existe). `o.conta(b)`: a conta do que o
  prédio queima pelo livro esta noite (`{ vela, azeite, lenha }`, como o `T.luz` da taverna). `o.dono(b)`: a casa cuja riqueza o prédio
  mostra (a do taverneiro), ou `null`. Várias regras do mesmo uso valem na ordem em que chegaram. Um campo que nenhuma regra declarou é
  recusado e contado (`G.Atmos.withinErr`; o verificador acusa). A chamada devolve a função que tira a regra (para as provas).
- **O construtor** (`G.Dentro3D.builder(uso, fn)`): `fn(ctx, K)`; `ctx.b`, `ctx.p` (a planta), `ctx.W` (o within), `ctx.look` (o desenho
  dos móveis), `ctx.near` (o corpo perto: tudo; longe, só as luzes e o pano), `ctx.S` (as superfícies das peças: os tampos e as
  prateleiras dos modelos), `ctx.put(k, x, y, z, ry, o)`, `ctx.wallFree` / `ctx.wallTake` (a parede tem dono, D-747). Um uso sem
  construtor onde mora uma família (a sede de quem governa) é construído como casa; quem quer a casa e mais chama `K.casa(ctx, K)`.
- **O kit** (`K`, o `G.Dentro3D.KIT`): `pack` (uma fileira numa prateleira ou num tampo), `scatter` (em volta de um tampo, cada coisa no
  ponto livre mais perto do seu), `beside` / `near` / `byWall` (no chão ao lado de uma peça, ou encostado numa parede perto dela),
  `pendura` (nas cavilhas das paredes perto de umas peças, ou nas vigas), `hangFood`, `runs` (os trechos livres das paredes entre duas
  alturas), `ceilAt`, `floorFree`, `frame`, `lvOf`, `cellAt`, `hv`; as louças, os vasos e os pratos de cada povo (`cupOf`, `vesselOf`,
  `vesselName`, `dishOf`); os construtores da taverna e da casa (`K.taverna`, `K.casa`).

## 3. Por ofício: o que um ofício mostra onde quer que trabalhe

O escriba escreve no palácio, no armazém e no quartel; o cozinheiro cozinha na taverna e no palácio. O que um ofício mostra no seu posto
é uma regra do ofício, não do prédio:

```js
G.Atmos.oficioRule('ferreiro', (b, q, c) => ({ ferramentas: [c.ler.coisa('martelo', c.fid)].filter(Boolean) }));
G.Dentro3D.oficio('ferreiro', (ctx, K, q) => { K.pendura(ctx, q.ferramentas.map(k => ({ k: 'ferramenta', key: k, why: q.why })), ctx.p.items.filter(it => it.fire)); });
```

- `G.Atmos.oficioRule(oficio, fn)`: para cada pessoa cujo ofício tem regra e cujo posto é o prédio (`v.job`) — ou que mora nele e guarda
  o ofício (`v.roleBack || v.role`) —, `fn(b, q, c)` diz o que o posto dela mostra; o within ganha `W.oficios` (`[{ v, oficio, aqui, …os
  campos da regra }]`, na ordem dos ids). O campo só entra no vocabulário quando a primeira regra de ofício chega.
- `G.Dentro3D.oficio(oficio, fn)`: `fn(ctx, K, q)` põe as coisas de uma entrada; roda depois do construtor do uso.

## 4. As leituras de verdade (`c.ler`, também `G.Atmos.guardado`, `G.Atmos.oficio`)

- **O que cada peça guarda, pelo livro** — `c.ler.guardado(b)`: `[{ it, kind, dep, cap, bens: { bem: n }, n }]`, uma linha por peça de
  guardar da planta (e `it: 0`, o monte no chão): a casa e a prateleira do prédio pelo `G.Depot.slots` (a mesma divisão em que o depósito
  conta o espaço); a banca de um negócio pelo seu lugar `'z:'`; a baia, a tulha e a prateleira do povo pela parte do armazém do povo que o
  prédio guarda (`G.Depot.share`), repartida nas peças pela regra do depósito. O enchimento das peças desenhadas pelas caixas
  (`In.state(b).items[id].fill`) é essa mesma leitura (L-2250).
- **O ofício** — `c.ler.oficio(b)`: `{ quem: [{ v, oficio, aqui, kit: [{ k, tipo, mat, onde }], usa }], obra: [{ op, p, k, mat, etapa,
  feitos, n, why }], feito: [{ k, n, partes, why }] }` — quem trabalha ou mora lá com as coisas do seu ofício pelo kit (`G.Inv.trade`: no
  material que o povo tem, pelo `G.Origem.matOK` / `forged`), se está lá agora e o que a mão usa agora; a fornada em curso pela sua etapa
  (`G.Oficio`); o que a prateleira do prédio guarda do que ele faz, com as partes da origem (`G.Origem.parts`: o ferro, o bronze, a pedra).
- **Uma coisa no material do povo** — `c.ler.coisa(tipo, fid)`: a chave `tipo.material` no melhor material que o povo tem (`G.Inv.madeBy`),
  ou `null` (o povo nunca teve o material: nada vem do nada).
- **Os anos** — `c.wear` (`G.Atmos.wear`: os anos, a umidade, o cuidado) e `G.Atmos.years(b)`: as marcas dos anos de um prédio (a teia, os
  riscos dos dias do preso, as marcas do quartel) saem deles e das contas do mundo, nunca de um número inventado.

## 5. A coisa nova (o modelo)

- Uma linha na `TABLE` do `arte/blender/deco.py` (o tamanho, a função que a desenha, como pousa) e a forma num `arte/blender/deco_*.py`;
  `VENV/bin/python arte/blender/deco.py coisa` (só ela; `--prev SAIDA.png coisa` mostra antes de gravar). As partes pelo que cada uma é
  feita (o vocabulário `PARTS`), a tinta de cada parte no `paintOf` do `js/dentro3d.js`. O orçamento: `G.DECO.budget`.
- **A sua causa no verificador**: uma linha no `CAUSA` do `qa/dentro-inv.js` que lê o within de novo (a regra 296 do guard cobra).
- Nenhum modelo traz louça, comida ou panela que o mundo não serviu (L-1880): isso é da decoração, com a causa.

## 6. As provas

- A parte da onda no `qa/dentro.js` (ou a prova da onda) com o cenário e os casos ruins: o save no meio (o mesmo plano antes e depois),
  a pessoa que morre no meio, a mão do deus que muda o estoque, o prédio que cai (a ruína não tem dentro).
- `ONLY=d1,d7,d16 node qa/dentro.js` (puro; o verificador limpo e de olhos abertos; a regra, o construtor e o ofício com os casos ruins)
  e `node qa/dentro-igual.js PASTA` contra uma cópia do jogo de antes (`git archive` da ponta numa pasta): o within, as coisas, as luzes e
  o enchimento de todo prédio dos três mundos prontos iguais — e, com `MUDA=campo,…`, iguais fora do que a onda diz que muda.
- As regras do guard: 290 a 299 e 410 a 413 (o within e o dentro3d.js) e 500 (toda regra e todo construtor, em qualquer arquivo, só leem e
  só desenham: a regra lê o livro pelo `c` — `c.D`, `c.O`, `c.ler` —, o construtor só o `W`).
