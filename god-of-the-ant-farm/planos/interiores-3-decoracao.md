# A decoração por uso e por ofício — o manual de uma onda (os interiores 3, F7; D-1010 a D-1015, L-2250 a L-2261)

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
  mostra (a do taverneiro), ou `null` — sem dono, o prédio é do meio (`c.rico` 1): o valor da terra não é a bolsa de ninguém (L-2251,
  L-2258). Várias regras do mesmo uso valem na ordem em que chegaram. Um campo que nenhuma regra declarou é
  recusado e contado (`G.Atmos.withinErr`; o verificador acusa). A chamada devolve a função que tira a regra (para as provas).
- **O construtor** (`G.Dentro3D.builder(uso, fn)`): `fn(ctx, K)`; `ctx.b`, `ctx.p` (a planta), `ctx.W` (o within), `ctx.look` (o desenho
  dos móveis), `ctx.near` (o corpo perto: tudo; longe, só as luzes e o pano), `ctx.S` (as superfícies das peças: os tampos e as
  prateleiras dos modelos), `ctx.put(k, x, y, z, ry, o)`, `ctx.wallFree` / `ctx.wallTake` (a parede tem dono, D-747). Um uso sem
  construtor onde mora uma família (a sede de quem governa) é construído como casa; quem quer a casa e mais chama `K.casa(ctx, K)`.
- **O kit** (`K`, o `G.Dentro3D.KIT`): `pack` (uma fileira numa prateleira ou num tampo), `scatter` (em volta de um tampo, cada coisa no
  ponto livre mais perto do seu), `beside` / `near` / `byWall` (no chão ao lado de uma peça, ou encostado numa parede perto dela),
  `pendura` (nas cavilhas das paredes perto de umas peças, ou nas vigas; cada item com os seus campos em `o`), `hangFood`, `riscos` (as
  marcas dos anos nas paredes por uma conta do mundo que a regra do uso diz — o carvão das rodadas da taverna; os dias de quem está na
  cela, as marcas do quartel, numa onda —: `K.riscos(ctx, n, { perto, lv, y0, dy, kinds, tag, why })`), `wallSpots` / `ringSpots` /
  `onWall` (os pontos das paredes para uma luz acima das cabeças — o `ringSpots` na face do anel da cabana redonda, que a planta guarda como
  casca e não como parede —, e uma coisa que sai da parede num deles: o ocote), `runs` (os trechos livres das paredes entre
  duas alturas), `ceilAt`, `floorFree`, `frame`, `lvOf`, `cellAt`, `hv`; as louças, os vasos e os pratos de cada povo (`cupOf`, `vesselOf`,
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
  riscos dos dias do preso, as marcas do quartel) saem deles e das contas do mundo, nunca de um número inventado. O cuidado é o de quem
  mora em volta — o perfil do bairro, a bandeira da casa mercante, o barraco, a casa vazia —, todo no save (D-1015): **nenhuma leitura de
  uma onda pergunta ao retrato do dia da cidade** (`G.Urban.peek`, `valueAt`, o valor da terra), que é derivado, não vai no save e só
  volta no dia de cada cidade — o que a vista mostrava mudava com um save (L-2261).

## 5. A coisa nova (o modelo)

- Uma linha na `TABLE` do `arte/blender/deco.py` (o tamanho, a função que a desenha, como pousa) e a forma num `arte/blender/deco_*.py`;
  `VENV/bin/python arte/blender/deco.py coisa` (só ela; `--prev SAIDA.png coisa` mostra antes de gravar). As partes pelo que cada uma é
  feita (o vocabulário `PARTS`), a tinta de cada parte no `paintOf` do `js/dentro3d.js`. O orçamento: `G.DECO.budget`.
- **A sua causa no verificador**: uma linha no `CAUSA` do `qa/dentro-inv.js` que lê o within de novo (a regra 296 do guard cobra).
- Nenhum modelo traz louça, comida ou panela que o mundo não serviu (L-1880): isso é da decoração, com a causa.

## 6. A luz de cada povo (D-1012, L-2252) e a lâmpada nova de uma onda

A luz é uma regra do mundo, não um enfeite. Como cada povo se ilumina está numa tabela só, o `G.Atmos.LUZ` (`js/atmos.js`), tirada do
levantamento D (§1.4, §19.2):

| Povo | A lamparina (`k`) e o que queima | A vela | O resto |
|---|---|---|---|
| romano | a lucerna de barro (`lamparina`) com azeite — de bronze na casa rica, onde o povo teve o bronze | sim | a lanterna de chifre junto à porta da casa rica, onde há chifre |
| grego | o lychnos de barro (`lamparina`) com azeite | não | o braseiro portátil de barro na noite fria |
| egípcio | a lamparina aberta de barro do Nilo (`lamparina-pires`), com sal no óleo onde há sal | não | — |
| asteca | **nenhuma lamparina de óleo** | não | a tocha de ocote (madeira) no suporte de barro na parede; o braseiro de barro da casa rica, com o copal |
| nórdico | a lamparina de pedra-sabão (`lamparina-pedra`) com o óleo da foca e da baleia, senão o azeite do comércio | só na casa rica | — |
| clássico | a lamparina de pedra de pé alto (`lamparina-pe`) com o azeite | não | o braseiro na noite fria |

- **O que o within diz** — `W.luz`: `k` (a lamparina do povo, ou nada), `oleo`, `luz` (a luz dela no `G.Luz3D.LAMPS`: `lamparina`,
  `lamparina-foca`, `lamparina-sal`), `sal`, `cera`, `mat`, `tocha`, `braseira`, `lanterna` (cada um com o porquê), `acesa`, `de` (o que se
  queima é da casa ou do armazém do povo), `noite` (o que a conta da noite do uso guarda: `v` a vela, `a` a lamparina), e o porquê em
  palavras (os bens pelo nome, `G.Atmos.COMB_NOME`). Só com o que há para queimar (a casa, senão o armazém do povo; a conta da
  noite da taverna) e do material que o povo teve; acesa só com alguém acordado dentro no escuro. **As palavras só dizem o que a
  assinatura carrega** (o que arde e onde se guarda, o quarto da vela e da lamparina, o que a conta guarda, acesa ou não — apagada é
  «ninguém acordado dentro no escuro», nunca o porquê de agora): quantos estão acordados é o campo `awake`, não o texto — o desenho
  guardado enquanto a assinatura é a mesma nunca diz o que era verdade quando foi feito (L-2253). Campo novo que o porquê diga entra na
  assinatura.
- **Onde cada luz fica** (`G.Dentro3D`): a lamparina nas mesas com gente da taverna e no balcão, na mesa da família, na bancada; na casa
  sem mesa (o banco de comer do romano, do grego, do nórdico) ou com a mesa cheia, no seu suporte na parede junto de onde a família come —
  na cabana redonda, na face do anel (`K.ringSpots`) —;
  o salão da taverna nas paredes (uma luz a cada 18 m², quatro no máximo: a lamparina no suporte, ou o ocote); o ocote na parede (ou no anel) junto de
  onde a família senta; o braseiro no chão ao lado; a lanterna pendurada numa cavilha junto da porta.
- **A luz de cada coisa acesa** é a linha dela no `G.Luz3D.LAMPS` (`js/luz3d.js`): a força, o alcance, a cor, o tremor, o tamanho da
  chama (`chama`) e a chama que o 3D desenha (`kind`: a da vela, a da lamparina, a da tocha, a do braseiro). O `dentro3d.js` não escreve
  cor de chama nenhuma (a regra 503); o `fx3d.js` desenha cada chama de dentro no tamanho da sua fonte, com a cor e o tremor dela (a
  regra 506), e o volume da luz de dentro se assa de novo quando qualquer coisa de uma fonte muda — o lugar, a força, o alcance, a cor, o
  tremor (a regra 505).
- **A peça de luz da planta** (o lampadário de cada povo) acende só com alguém acordado e com o que o seu povo queima nela
  (`G.Atmos.luzPeca`: o óleo do candelabro e do suporte de papiro, a vela do poste do norte, as brasas da coluna do lago; a regra 504).

**Uma onda que traz uma lâmpada nova** (o candelabro do palácio, a lucerna pendurada, o poço de luz do templo):

1. O modelo: uma linha na `TABLE` do `arte/blender/deco.py` com a âncora `chama` (`M.anchor('chama', …)`) e as partes do vocabulário
   (`lampada` pinta-se pelo `lmat` da coisa: barro, bronze, ferro, pedra, pedra-sabão; `castical`, `cera`, `chifre`, `brasa`), e a sua
   família no `DECO` do `arte/blender/pacotes.py` (a luz de todo interior é a «comum»; a de um ofício só, a família do ofício): o `deco.py`
   a escreve no pacote da família, em 16 bits, e o `--confere` diz que os arquivos são o que ele faz.
2. A luz dela: uma linha no `G.Luz3D.LAMPS` (sem `peca`), com `forca`, `raio`, `cor`, `tremor`, `chama` (o tamanho da chama: o
   `fx3d.js` a desenha assim), `kind` e, se o óleo acaba, `oleo: 1`.
3. A causa: o campo da regra do uso no within (`G.Atmos.withinRule`) — o que ela queima, pelo livro, com o porquê —, e o construtor a põe
   com `lit`, `lmat` e `luz` (a chave da linha do `LAMPS`) na coisa; a luz sai sozinha pelo `G.Dentro3D.fontes`.
4. A sua linha no `CAUSA` do `qa/dentro-inv.js` (a regra 296) e a parte da onda na prova, com a luz acesa e apagada, o combustível tirado
   pela mão do deus e o save no meio.
5. Uma peça de luz da planta nova (um lampadário de outro jeito): a linha no `LAMPS` com `peca: 1`, o seu `chama` e o seu `kind`, e o
   combustível do seu povo no `PECA` do `G.Atmos.luzPeca`.

## 7. As provas

- A parte da onda no `qa/dentro.js` (ou a prova da onda) com o cenário e os casos ruins: o save no meio (o mesmo plano antes e depois),
  a pessoa que morre no meio, a mão do deus que muda o estoque, o prédio que cai (a ruína não tem dentro).
- `ONLY=d1,d7,d16,d17,d18,d19 node qa/dentro.js` (puro; o verificador limpo e de olhos abertos; a regra, o construtor e o ofício com os
  casos ruins; a luz de cada povo; o pano com dono; o desgaste e a riqueza iguais num load, com o mundo vivido) e `node qa/dentro-igual.js PASTA` contra uma cópia do jogo de antes (`git archive` da
  ponta numa pasta): o within, as coisas, as luzes e o enchimento de todo prédio dos três mundos prontos iguais — e, com `MUDA=campo,…`,
  iguais fora do que a onda diz que muda (`SEMPORQUE=1` compara as coisas sem as palavras do porquê: o que muda de lugar ou de forma).
- `ONLY=l1,l2,l3 node qa/luz.js` quando a onda acende alguma coisa (a l3 cobra a causa de cada fonte, o lampadário com o que queimar).
- As regras do guard: 290 a 299 e 410 a 413 (o within e o dentro3d.js), 500 (toda regra e todo construtor, em qualquer arquivo, só leem e
  só desenham: a regra lê o livro pelo `c` — `c.D`, `c.O`, `c.ler` —, o construtor só o `W`), 501 (o enchimento das peças é o do livro),
  502 (o pano tem dono), 503 (a luz de cada povo: o `G.Atmos.LUZ`, o `G.Luz3D.LAMPS`, cada modelo na `TABLE`), 504 (o lampadário com o que
  o seu povo queima), 505 (o volume segue toda fonte), 506 (a chama de dentro do tamanho da peça) e 507 (o cuidado e a riqueza não leem o
  retrato do dia da cidade).
