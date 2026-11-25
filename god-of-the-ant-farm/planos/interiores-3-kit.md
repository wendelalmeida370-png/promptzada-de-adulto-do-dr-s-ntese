# O kit da planta — o manual para as frentes das ondas (os interiores 3, a frente K)

As ferramentas com que a taverna dos interiores 2.0 se armou (D-720 a D-726) ficavam fechadas dentro do `js/int-trabalho.js`. Desde
a frente K (F1, D-991) elas são do motor: toda receita as tem no `P` — a planta que se faz — como já tinha o `P.room`, o `P.place` e o
`P.door`. A taverna é a primeira receita a usá-las, e saiu **igual byte a byte** (as 70 tavernas dos sete mundos prontos e as 864
plantas das provas do catálogo dela, antes e depois). Junto vieram duas fundações: **a versão da gramática de cada tipo** (F13,
D-990), que faz uma onda refazer só o catálogo dos tipos que mexeu, e **a riqueza de agora para qualquer tipo** (F6, D-992).

Este manual diz, para cada ferramenta: o que faz, os argumentos, um exemplo e os cuidados — o que a taverna aprendeu. O código é o
`KIT` do `js/interiors.js` (os comentários de cada função dizem o mesmo, em inglês, como os vizinhos).

## 0. O que já existia (o molde de uma receita)

Uma família é `{ id, H, V, S, name, can(rec, T, tr), build(P) }` (`In.addFamilies`); um tipo é a lista das suas famílias
(`In.addTypes`). O `build` faz primeiro **a casca** — o que se vê de longe: `P.shell`, `P.roof`, `P.level`, as paredes de fora, as
portas e janelas da casca, `P.entrance` — e chama `if (P.inside()) return;`; depois faz **o dentro**: os cômodos (`P.room`,
`P.split`), as portas de dentro, as escadas (`P.stair`) e as peças (`P.place`, `P.at`, `P.niche`, `P.bench`, `P.opt`).

- **O quadro canônico:** tudo em metros do canto do lote, com a porta da rua na frente (v = L, o lado que dá para a rua) e u de um
  lado ao outro; o motor gira a planta para o lado de verdade. Nunca espelha: o espelho é escolha da receita (o `P.frame`, abaixo).
- **Os dados da tentativa** (`P.rnd`, `P.rr`, `P.pick`, `P.chance`): uma planta é tentada até doze vezes, cada vez com os seus dados.
  Na casca os dados são do prédio e da família (a casca é a mesma em toda tentativa); no dentro, de cada tentativa. **Tudo o que é
  escolha do prédio** (o tamanho de uma peça, o lado do bar, onde fica o estrado) **sai do registro e do id, nunca dos dados da
  tentativa** — senão cada tentativa escolhe outra coisa e a planta que vale não é a primeira que se pensou (a regra 270, D-722).
- **A planta é função do registro** (`b.ip`, regra 16): nada de acaso do mundo, nada de ler o mundo de hoje (o registro guarda o que
  a planta pode ler: o povo, as artes, o clima, a densidade, a riqueza de agora — `rec.q`).

## 1. As escolhas do registro — `P.axes(fn)`, `P.hashOf(k)` e `P.choose(k, lista)`

**O que faz.** `P.hashOf(k)` é o sorteio número `k` deste prédio, de 0 a 1: o `G.hash` do id e de k — o mesmo em toda tentativa, em
toda prova e em todo computador. `P.choose(k, lista)` escolhe um da lista por ele. **`P.axes(fn)`** (D-994) é a porta das escolhas
de uma receita — os seus «eixos», o molde do `tavAxes`: chama a função de escolhas da receita **sobre o registro sozinho** (o prédio,
o lote, o registro, os costumes do povo, o tipo e a família que se arma — o `In.kitOn`, com os sorteios e o quadro do kit), nunca sobre
a planta em feitio, e guarda a resposta na planta (pedida de novo, a mesma). Assim uma escolha **não consegue** ler os dados da
tentativa nem o que a planta já pôs: `K.rnd()`, `K.pick(…)` ou `K.room(…)` dentro dela quebram na hora — o erro da receita, que a
prova vê —, e ela é a mesma em toda tentativa, na casca e no dentro. **`In.axesOf(fn, o)`** faz a mesma conta sem planta, de um prédio
(o registro e o lote dele) ou de um registro solto (`{ b, L, rec, tr }`): é como uma prova (ou quem conta os arranjos de um tipo, a
prova padrão da frente O) pergunta as escolhas sem fazer a planta.

**Exemplo** (a taverna: o `tavAxes`, pedido pelo `tavernBuild`):

```js
function tavAxes(K) {                                  // K: o kit sobre o registro sozinho
  const bar = K.choose(1, ['centro', 'canto', 'rua']);  // o tipo do bar
  const stage = K.choose(3, ['frente', 'fundo']);        // onde fica o estrado do músico
  const side = K.choose(2, [1, -1]);                     // para que lado a porta desempata
  return { bar, stage, side /* … */ };
}
const X = P.axes(tavAxes);                              // no build: a casca e o dentro leem o mesmo X
In.tavAxes = o => In.axesOf(tavAxes, o);                // para as provas: as escolhas de um registro, sem planta
```

**Cuidados.**
- Cada escolha tem **o seu número**: dois números iguais em escolhas diferentes as amarram (o mesmo prédio sempre com o bar no canto
  *e* o estrado no fundo). A taverna usa 1 a 4 nas escolhas do registro; **31, 37, 41 e de 500 para cima são do empacotador dos grupos
  de mesa** (`P.groups`, §6) — uma receita que arma grupos usa outros números nas suas escolhas. Uma receita nova pode usar os mesmos
  números da taverna (é outro tipo de prédio), mas não dois iguais na mesma receita.
- **Junte as escolhas numa função só** (o molde é o `tavAxes`) e peça-a pelo `P.axes` no começo do `build`: ela devolve um objeto `X`
  que a casca e o dentro leem. Dentro dela, só o kit que ela recebe (`K.choose`, `K.hashOf`, `K.frame`, o `K.rec`, o `K.L`, o `K.tr`, o
  `K.b`): ela não vê a planta. As provas pedem essas escolhas sem fazer a planta pelo `In.axesOf(fn, prédio)` ou
  `In.axesOf(fn, { b, L, rec, tr })` (o `In.tavAxes` é isso); o `In.kitOn` sozinho dá o kit sobre um registro solto.
- A riqueza (`rec.q`) entra nas escolhas como qualquer campo do registro: o rico com as mesas redondas e a cadeira do dono.
- Três arranjos ou mais por povo e degrau, nenhum par igual (o padrão, plano §4.3): as escolhas do registro dão os arranjos; o
  `taverna-padrao` t2 mede 24 ids e acusa quando um povo e degrau tem menos de três.

## 2. O quadro com espelho — `P.frame(flip)`

**O que faz.** Uma disposição escrita uma vez — a porta à esquerda do meio, o fogo na parede da esquerda, a escada na da direita —
posta na planta como está (`flip` 0) ou espelhada de um lado para o outro (`flip` 1: u → L − u). Devolve `{ flip, U(u), R(retângulo),
F(fu) }`: o u, o retângulo e a direção da planta de um u, um retângulo e uma direção do quadro; o v fica.

**Exemplo:**

```js
const V = P.frame(X.flip);
const hall = P.room(0, 'salao', V.R(lay.hall));
P.at('lareira', 0, hall, V.R([x0, 2.0, x0 + 0.6, 3.4]), V.F(1), 0);
```

**Cuidados.** Escreva a disposição inteira no quadro (os retângulos, as direções, o lado da mão de uma peça em L — a taverna passa
`hand: X.flip ? -hand : hand`) e só converta na hora de pôr (`V.R`, `V.F`); as paredes do quadro trocam de nome no espelho (a
`esquerda` do quadro é a `direita` da planta: `tavWindows`).

## 3. As zonas — `P.zone(lv, r, o)`

**O que faz.** Guarda um retângulo do andar `lv` livre de toda peça (o `keepClear` do motor: nenhum `P.place`, `P.at` nem grupo de
mesa entra nele). Dois tipos:

- **`{ aisle: 1 }` — um caminho.** Um assento pode ter a passagem para ele ali, nunca uma peça; e um grupo de mesa encostado a ele
  conta menos que encostado a uma parede (o chão se enche das paredes para dentro). É o que o corredor (`P.aisle`) guarda, a roda do
  fogo comprido do nórdico e as saídas do taverneiro de trás do balcão.
- **`{ papel, oficio, faz }` — um posto.** O lugar onde alguém trabalha de pé, sem peça: o posto da guarda diante do trono, o chão da
  audiência, o lugar do pregoeiro. `papel` é quem (o «guarda», o «escriba», o «carcereiro»), `oficio` o ofício que o repartidor dá
  (se houver), `faz` o que se faz ali («vigiar», «anunciar»). **Vai para a planta** (`plan.zones`), para os postos de ofício da frente
  O (`In.postos`, D-971) lerem sem adivinhar.

**Exemplo:**

```js
P.zone(0, [cu - 0.4, cv - 0.4, cu + 0.4, cv + 0.4], { papel: 'guarda', faz: 'vigiar' });  // o posto, na planta
P.zone(0, [x0, z1 - 1.2, x0 + 2.0, z1], { aisle: 1 });                                    // um caminho guardado
```

**Cuidados.**
- A zona é **canônica** (o quadro da receita, não o do lote); a planta a devolve no lote (`plan.zones[i].r`), com o cômodo onde cai
  o meio dela (`room`).
- Uma zona que não é caminho nem posto (`P.zones.push({ lv, r })`, como o palácio e os monumentos fazem para o espaço diante do trono)
  continua valendo: é a medida da receita enquanto arma, e **não vai para a planta**. Só o que tem `papel` vai — a planta de hoje não
  muda (a regra 481 cobra que uma zona de caminho só se faça pelo kit).
- Uma zona de posto guarda o chão, e a regra do corpo continua (o verificador da frente O confere que o posto é alcançado a pé da porta).

## 4. O corredor de 1 m — `P.clearance`, `P.aisle` e `In.CORR`

**O que faz.** `P.aisle(lv, cômodo, início, alvos, o)` faz **uma árvore de caminhos** de um corpo de `o.w` de largura (1 m; nunca
menos, D-721), do `início` — logo para dentro da porta do cômodo — até cada alvo, e guarda os caminhos como zonas de caminho. Cada
alvo é `{ why, pts }`: os pontos de onde se usa uma peça (os lugares `comprar` do balcão, `cozinhar` do fogo, `acesso` do estrado, o
pé da escada); basta chegar a um deles (a `o.reach`, 0,35 m). Cada caminho nasce dos já guardados — o mais barato, rente às paredes e
às peças fixas, nunca atravessando o chão do meio (que fica inteiro para as mesas). `o.trunk: [u, v]` faz antes um tronco reto do
início até aquele ponto (a espinha do salão: da porta até a linha do bar). Devolve `{ ok, why, K, path }`: `why` é o primeiro alvo
a que nenhum caminho chega.

`P.clearance(lv, cômodo, longe)` é o quadriculado de 10 cm do cômodo (`K`): a cada ponto, a distância à peça, ao lance de escada ou
à parede mais perto, das peças que estão de pé agora; `longe` mede até 2 m (onde o corredor corre melhor). O `P.aisle` o faz se não
for dado — dê-o quando for usar o mesmo `K` depois (os grupos de mesa carimbam as suas peças nele). `In.CORR` são as contas do
quadriculado (`clear`, `stamp`, `flood`, `grow`, `reach`, `band`), para a receita que mede um cômodo por conta própria e para as provas.

**Exemplo** (a taverna, `tavInside`):

```js
const K = P.clearance(0, hall, true);
const start = [portaU, R0[3] - 0.6];                      // logo para dentro da porta do salão
const way = P.aisle(0, hall, start, [
  { why: 'balcão', pts: lugares(balcao, 'comprar') },
  { why: 'fogo', pts: lugares(fogo, 'cozinhar') },
  { why: 'escada', pts: [peDaEscada] },
], { K, w: 1.0, trunk: [start[0], linhaDoBar] });
if (!way.ok) { P.errs.push(`sem corredor de 1 m até ${way.why}`); return; }
```

**Cuidados** (o que a taverna aprendeu).
- **Ponha as peças fixas antes do corredor** (o bar, o fogo, o estrado, a escada) e as soltas depois (as mesas): o corredor é medido
  do que está de pé.
- **Uma árvore, não um caminho para cada alvo**: caminhos separados retalham o salão e não sobra chão para as mesas.
- **O quadriculado é de 10 cm** (T-1743): um caminho que ele mede de 1 m pode ter 0,95 entre duas peças. Até as mesas a taverna usa
  1,1 m (`TAISLE`), e entre dois grupos, 1,2 m.
- **Um corredor não se negocia**: sem caminho, a planta é recusada (e a tentativa seguinte, com outros dados, move as peças soltas);
  nunca se afina a largura para passar.
- O corredor é a medida da receita: a planta não o guarda como peça; quem anda é a grade do motor (`P.walks`, o validador). O
  `taverna-padrao` mede o corredor da planta pronta por contas suas (t1), e é assim que se prova um prédio novo.

## 5. A peça fixa e as suas reservas — `P.atAlong(tipo, lv, cômodo, r, fu, fv, o)`

**O que faz.** Põe uma peça fixa onde a disposição da receita diz (`r`, virada para `fu, fv`, no quadro `o.frame`) ou um pouco ao
longo da parede dela, onde uma porta, uma janela ou um caminho guardado toma o lugar (`o.steps`: os passos da taverna, até 1,2 m para
cada lado; `o.fixed`: só onde está), ou nos **seus outros lugares** (`o.alt`: os retângulos de reserva, cada um tentado do mesmo
jeito, em ordem — L-1841). Devolve `{ it, r }` (a peça e o retângulo do quadro onde ficou), ou `null`.

**Exemplo** (o estrado do músico, do lado de lá do fogo quando o lado de cá não cabe):

```js
const got = P.atAlong('estrado-musico', 0, hall, junto, 1, 0, { frame: V, alt: [doOutroLado] });
if (!got) { P.errs.push('sem lugar para o estrado do músico'); return; }
```

**Cuidados.** A peça desliza **ao longo da sua parede** (uma peça contra a parede do lado, `fu ≠ 0`, anda em v; contra o fundo, em u),
nunca para o meio do cômodo. Dê as reservas de uma peça que tem de existir: o estrado da taverna sem reserva faltava em 2 de cada 24
tavernas de 12 e 16 m (L-1841). A peça de um posto (a bigorna do ferreiro, a mesa do escriba, o trono) leva quem trabalha nela pelo
`o.extra` — `{ extra: { papel: 'escriba', faz: 'escrever' } }` —, onde quer que fique, no lugar dela ou numa reserva (§7).

## 6. Os grupos de mesa — `P.groups(lv, cômodo, o)`

**O que faz.** Arma grupos de uma mesa e os seus assentos pelo chão do cômodo — cada grupo onde encaixa rente às paredes, às peças
fixas e aos grupos já postos, os assentos alcançados por trás — e só guarda o grupo se o caminho (o quadriculado `o.K` do corredor, do
`o.start`) ainda chega aos alvos fixos (`o.fixed`, os do corredor) com um corpo de `2 × o.half` (1 m) e a todo grupo posto com um de
`2 × o.thalf` (1,1 m). Devolve **o empacotador**: `pack(mix, mais, peso, fino, banidos)` arma uma rodada; `reset()` tira tudo o que ele
pôs; `seats`, `groups` e `first` dizem como está.

- `o.models`: `{ nome: { t: o tipo da mesa, w, d, seats: [[tipo, du, dv, w, d]] } }` — cada assento com o meio a (du, dv) do meio da
  mesa (ao longo do lado comprido e de través, 3 cm afastado: o motor deixa 2 cm entre duas peças), virado para ela. **Todo assento é
  uma peça de sentar** (um lugar `sentar` sobre a peça, `on: 1` — a regra 271): um modelo com outro é recusado, com o erro dito
  («ninguém sentado no ar»).
- `pack(mix, mais, peso, fino, banidos)`: os tipos de `mix`, o primeiro o que mais se quer (`peso`: quanto pesa o lugar de um tipo na
  lista); `mais`: por cima dos grupos já postos (sem ele, a rodada começa do zero); `fino`: no quadriculado de 12,5 cm; `banidos`: os
  primeiros grupos (`tp|rot|u|v`) que não se põem de novo.
- `o.pre`: os grupos postos antes, à mão (o banco do nórdico ao lado do fogo comprido): `{ box, claim, pieces, acc, got }`.
- `o.cap`: os lugares em que ele para; `o.step`: o quadriculado dos meios tentados (0,25 m; a taverna de 16 m usa 0,5); `o.half` e
  `o.thalf`: a metade da largura do caminho aos alvos e às mesas (0,5 e 0,55); `o.measure`: outras medidas do empacotador, se a sala
  pedir (a margem das paredes, 0,9; o encosto entre grupos, 1,2; o espaço guardado em volta de um grupo, 0,45 — as da taverna).
- `o.papel`, `o.oficio`, `o.faz`: quem senta ali para trabalhar — o conselho, os escribas, a mesa do quartel: **os grupos vão para a
  planta** (`plan.groups`: o cômodo, o modelo, as peças, o retângulo), para os postos lerem (D-971).

**Exemplo** (a mesa do conselho de um palácio):

```js
const CONSELHO = { mesa: { t: 'mesa-taverna', w: 1.6, d: 0.8, seats: [['banco', 0, -0.605, 1.4, 0.35], ['banco', 0, 0.605, 1.4, 0.35], ['cadeira', -1.08, 0, 0.5, 0.5]] } };
const G1 = P.groups(0, sala, { models: CONSELHO, K, start, fixed: alvos, cap: 7, papel: 'conselheiro', faz: 'aconselhar' });
G1.pack(['mesa'], false, 1);
if (G1.seats < 5) P.errs.push(`só ${G1.seats} lugares no conselho`);
```

**Cuidados** (a taverna, D-722, T-1743).
- **O caminho vem antes da peça**: o grupo é carimbado no quadriculado e o caminho medido de novo antes de o motor pôr as peças —
  barato —; um grupo que fecha um caminho, e os vizinhos dele, não se tentam de novo na rodada.
- **O desempate é do prédio** (`P.hashOf` 31, 37, 41 e 500…: a origem do quadriculado, a primeira volta, a ordem dos iguais); os dados
  da tentativa só entre os iguais. Duas salas iguais em tudo armam as mesas de outro jeito.
- **O guloso erra o meio**: quando o primeiro grupo toma o meio do chão e os lugares não chegam, a taverna arma de novo sem ele
  (`reset`, `banidos`: quatro vezes, mais barato que a planta inteira de novo).
- **O tempo**: o salão de 110 m² no quadriculado de 25 cm é quatro vezes o trabalho; a meta da taverna é 400 ms por planta (o t3 do
  `taverna-padrao`). Meça o seu tipo (a frente O tem a prova padrão, `qa/padrao.js`) **em toda a varredura**: todo povo, todo
  contexto do catálogo (o frio, o úmido, as densidades, as artes) e muitos ids — a taverna passa no t3, que mede um clima só, e
  tem três plantas de 1,6 a 2,1 s na varredura do `qa/plantas.js` (a `taberna.salao` grega de 8 m que só se arma na sexta
  tentativa, T-2133). Uma planta que precisa de várias tentativas custa todas elas.
- O empacotador **não sabe o padrão**: quantos lugares o cômodo pede é da receita (a taverna: 8, 16 e 30), e o erro também.

## 7. Os postos: quem trabalha ali (para a frente O e as ondas)

O lembrete do dono (24/11/2026): «tudo com muita qualidade, dando suporte e infraestrutura para os próximos ofícios». A planta diz
onde cada um trabalha — **o kit leva o papel**, e a planta o devolve:

| Onde | Como a receita diz | O que a planta devolve |
|---|---|---|
| uma zona de pé, sem peça | `P.zone(lv, r, { papel, oficio, faz })` | `plan.zones[]`: `{ id, lv, room, r, papel, oficio, faz }` |
| um grupo de mesa | `P.groups(lv, cômodo, { …, papel, oficio, faz })` | `plan.groups[]`: `{ id, lv, room, model, items, r, papel, … }` |
| uma marca (o lugar de um uso sem peça) | `P.marks(lv, cômodo, uso, pts, { st, papel, oficio, faz })` | `plan.marks[].papel` (e `oficio`, `faz`) |
| uma peça | `P.at(…, { papel, oficio, faz })` / `P.place(…, { extra: { papel } })` / `P.atAlong(…, { extra: { papel } })` | `plan.items[].papel` (e `oficio`, `faz`) |

Só o que tem papel muda a planta: as plantas de hoje saem iguais. O `In.postos(b)` da frente O junta estes com o que ela lê das peças
(o lugar `servir` do balcão, o `cozinhar` do fogo).

## 8. A riqueza de agora — `In.wealthRule(uso, fn, o)`

**O que faz.** O degrau de riqueza que o registro de um prédio guarda (`rec.q`, de 0 a 2 — o que as plantas do tipo armam: as mesas
redondas do rico, as compridas do pobre) é **o do dono agora**, dito por uma regra do uso: `fn(b) → { up, keep, … o que leu }` (ou
`null` sem dono a ler). `up` é o degrau que a riqueza do dono alcança agora; `keep`, o degrau que ela ainda segura (uma faixa: um bolso
em volta de uma marca não vai e volta). **Só o motor escreve o degrau** (a regra 273): na virada do dia, sobe em `up`, desce só abaixo
de `keep`, uma mudança em `o.days` dias no máximo (a paciência, 20) — uma reforma do registro, com o fato `riqueza`. `In.wealthOf(b)`
lê o que a regra diz agora (com `now` e `to`, o degrau que a virada daria, sem a paciência), sem escrever nada.

**A faixa — `In.wealthBand(soma, marcas, topo)`.** A conta da taverna, para toda regra: com a soma que o dono tem agora e as duas
marcas `[m0, m1]`, `up` é o degrau do meio a partir de `m0` e o rico a partir de `m1`; `keep` segura o rico até 0,6 de `m1` e o do
meio até metade de `m0`; `topo` (a bandeira da casa mercante) é o rico, seja qual for a soma. É pura: a regra lê a soma pelas portas e
a passa à faixa. Uma regra que precise de outra faixa devolve o seu `up` e o seu `keep`.

**Exemplo** (a taverna, no `int-trabalho.js`):

```js
In.wealthRule('taverna', b => {
  const k = G.Taverna.keeperOf(b); if (!k) return null;
  const coins = G.Eco.purse(k) || 0; const h = G.Eco.homeOf(k); const elite = !!(h && h.elite);
  return Object.assign(In.wealthBand(coins, [12, 40], elite), { coins, elite });   // up: 40 → 2, 12 → 1; keep: 24 → 2, 6 → 1
}, { days: 20 });
```

**Outro exemplo** (como seria a de uma oficina, pelo mestre — o dono a ler é da receita; a de um prédio do povo, pelo tesouro):

```js
In.wealthRule('forja', b => {
  const v = mestreDe(b); if (!v) return null;                            // quem tem a oficina agora (o ofício e o posto)
  return Object.assign(In.wealthBand(G.Eco.purse(v) || 0, [10, 35]), { dono: v.id });
});
In.wealthRule('templo', b => {
  const set = G.S.settlements.get(b.set); if (!set) return null;
  return In.wealthBand(G.Depot.get('f:' + set.fac, 'moedas'), [80, 300]);   // o tesouro do povo, pelo livro
});
```

**Cuidados.**
- **Nada vem do nada** (D-440): a regra lê pelas portas de quem tem — as moedas da casa pelo livro (`G.Eco.purse`, `G.Depot`), a
  bandeira da casa mercante (`h.elite`), o tesouro do povo para a sede e o templo —, **nunca um número inventado nem um congelado na
  fundação** (o guard cobra, regra 273: a regra não escreve, não sorteia, lê ao menos uma dessas portas, e o seu `Object.assign` é
  sobre um objeto novo — a faixa ou um literal —, nunca sobre o prédio ou o registro).
- A regra roda todo dia em todo prédio do uso: leia o dono de agora (quem tem o ofício e o posto, a família que mora), nunca um id
  guardado no prédio na fundação.
- O degrau muda a planta (é uma reforma do registro): a casa não fica trocando de móveis todo dia — a faixa e a paciência são o que a
  protege. Uma regra nova mede o vai-e-volta numa vida (o `taverna-padrao` t4 é o molde: a faixa, a paciência, o save no meio, o dono
  morto).
- O que o desenho mostra da riqueza é do `G.Atmos.rich` (a decoração, a frente L); a regra da planta diz os móveis que a planta arma.

## 9. A versão da gramática de cada tipo — `In.VERSION_T` e `In.versionOf`

**O que faz.** Sobre a gramática do motor (`In.VERSION`, 6) cada tipo tem a sua (`In.VERSION_T[tipo]`, de 1 para cima; quem não está,
0). A chave da planta (`':g' + In.versionOf(tipo)`: `6`, `6.1`), o catálogo (cada tipo com a sua versão, `vers`), o save (`intG` e,
quando algum tipo tem a sua, `intGT`) e a migração (só os registros do tipo cuja gramática subiu são julgados ao abrir um save de antes)
leem a do tipo. **Subir a versão de um tipo refaz só as plantas e o catálogo dele.**

**Quando subir.** Toda mudança que muda a planta de um tipo — em qualquer parte: as peças, os cômodos, as portas, a grade, os erros —:
a receita dele, uma peça só dele, uma mudança do motor que move as plantas dele. Uma peça de vários tipos (o `int-moveis.js`) ou uma
mudança do motor muda os tipos que a usam: **a prova diz quais**, e por parte. Na dúvida, suba: a versão de um tipo custa só o catálogo
dele, e uma planta mudada sem a versão deixa no save a chave de antes apontando para outra peça (o corpo sentado, D-196) e no catálogo
linhas que o jogo lê e que não são mais as da gramática.

**Quando subir o do motor.** O `In.VERSION` só sobe se as plantas de todos os tipos mudarem; e então a tabela `In.VERSION_T` recomeça
vazia (todo tipo na gramática nova do motor; a migração julga de todo jeito todo registro de um save da gramática de antes, com ou sem
as versões dos tipos nele), o catálogo inteiro se refaz (`node qa/catalogo.js gera tudo`, ≈ 1 h com a máquina livre) e todo registro
de um save de antes é julgado ao abrir (a porta, os moradores). Depois, a versão de um tipo recomeça do 1.

**Como** (o passo a passo de uma onda):

```sh
node qa/plantas-iguais.js grava /tmp/antes.json          # antes de mexer (≈ 1,5 min nos três mundos com as provas do catálogo da taverna, o dobro com a máquina ocupada; TIPOS=… as provas do catálogo de outros tipos, TIPOS=- nenhuma; MUNDOS=… outros mundos, os sete ≈ 2,5 min)
# … a mudança …
node qa/plantas-iguais.js compara /tmp/antes.json       # os tipos cujas plantas mudaram (FALHOU com a lista)
# no js/interiors.js: In.VERSION_T = { forja: 1, … }     # cada tipo que mudou, um número acima
node qa/catalogo.js gera forja                          # o catálogo só dele (segundos a minutos; as linhas dos outros ficam)
MUDOU=forja node qa/plantas-iguais.js compara /tmp/antes.json   # PASSOU: só os ditos mudaram
node qa/catalogo.js confere forja && node qa/plantas.js
```

**Cuidados.** A versão subida **sem o catálogo** faz o jogo provar as famílias do tipo ao vivo e travar (R14): o `confere` e o
`qa/plantas.js` acusam («as linhas de forja são da gramática 6, a de agora é 6.1»). Junte as subidas de uma onda numa só por tipo. A
casa e os tipos de morar pedem também o `node qa/casa-dentro.js 2` (21 min). Os mundos prontos se geram de novo uma vez por onda (o
supervisor). `node qa/plantas-iguais.js sobe forja` é a prova da própria versão por tipo (≈ 1 min; 2 com a máquina ocupada).

## 10. Os cuidados gerais (os riscos da taverna, C §4)

- **R1, o mesmo nome em duas frentes**: o nome de uma peça, um papel, um modelo de grupo — reserve no contrato da onda.
- **R2, o mundo muda com a planta**: lugares, camas e postos mudam o mundo (quem cabe, quem trabalha). Meça antes e depois.
- **R4, o salto**: quem toma um lugar pergunta quem está dentro agora (L-1980) — o repartidor, não a receita.
- **R12, as provas**: prove a planta pronta por contas da prova, não da receita (o `taverna-padrao` mede o corredor, os lugares, o
  assento sobre a peça por conta própria); conte segundos do mundo.
- **R13, o desempenho**: cada tipo com a sua meta de tempo de planta (a taverna: 400 ms).
- **R14, o catálogo**: a versão do tipo (§9).
- **A receita não quebra onde não vale** (L-2230): o catálogo prova cada família em toda chave do tipo — todo povo, terra quente ou
  não, cada riqueza —, também onde o `can` dela a recusa (as regras dependem de cada prédio e são lidas na hora). Uma receita que lê
  o que pode não existir (a forma de um povo que não tem a forma, `G.Forma.of`; uma peça que o povo não tem) diz o porquê em
  `P.errs` e volta, nunca quebra: o erro de JavaScript vira o motivo guardado no catálogo (o celeiro pela forma guardava «Invalid
  value used as weak map key» em 24 chaves).
- **A planta não muda de tamanho** (D-663): o lote é o do degrau; o espaço é da receita.
- **Ninguém sentado no ar** (regra 271): todo lugar sentado sobre uma peça de sentar — o `P.groups` recusa outro; para um lugar fora
  dos grupos (o tear, a roda do oleiro), a frente S (F2) traz o assento.

## 11. As provas do kit

- `node qa/motor-plantas.js` — a parte 6 prova cada ferramenta com receitas de teste (as escolhas e o espelho, a zona de caminho e a
  de posto na planta, o corredor com o tronco e a recusa, a reserva, os grupos com o papel na planta, o modelo de assento no ar
  recusado), e a parte 7 a riqueza por uma regra de teste num prédio do mundo pronto «cidade» (7) e a faixa do motor contra a conta
  da taverna de antes (7b).
- `node qa/taverna-padrao.js` — a taverna, a primeira receita do kit (t1 a t3 em minutos; `N=12 ONLY=t1,t2,t3,t4,t5` antes da versão).
- `node qa/plantas-iguais.js compara ANTES.json` / `sobe TIPO` — as plantas iguais byte a byte; a versão por tipo.
- `node qa/catalogo.js confere 30` / `confere TIPO` — o catálogo em dia; a versão de cada tipo no arquivo.
- O verificador `qa/kit-inv.js` (no `qa/qa.js` pelo `qa/junta-inv.js`): o degrau de riqueza com o seu fato e só num tipo com regra; a
  versão de cada tipo; os grupos de um posto com os assentos sobre as peças.
