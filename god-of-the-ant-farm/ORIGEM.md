# O mapa das causas — de onde vem cada coisa

> **Nada vem do nada** (a regra do dono, D-440): toda coisa feita gasta o que a receita dela pede, e esse material veio de uma
> fonte de verdade do povo — produzido, minerado, colhido, pescado, caçado, comprado, saqueado —, sempre pelo livro (`G.Depot`).
> **A arte só permite; o material torna possível.**

Este é o mapa da parte 20h: para cada bem da economia e cada coisa do catálogo, **a fonte no mundo**, **a receita** (o que gasta, o
que faz, onde, quem, com que arte) e **quem usa**. No fim, **os buracos**: o que ainda vem do nada, só da arte ou do material
errado — os que esta parte fechou e os que ficaram, cada um com o plano.

Quem faz um sistema novo que produz alguma coisa começa pela última seção («Para quem faz um sistema novo»).

---

## 1. A porta: `G.Origem` (`js/origem.js`)

Três bens são guardados **por partes**, e as partes de um lugar sempre somam o que ele tem:

| Bem | As partes |
|---|---|
| `food` (a comida) | `trigo`, `cevada`, `arroz`, `milho`, `sorgo` (o cereal de cada campo), `peixe`, `marisco`, `carne`, `leite`, `ovos`, `horta`, `fruta`, `mel`, `azeite`, `provisao` (o que os fundadores trouxeram), `?` (origem desconhecida) |
| `ferramentas`, `armas` | `bronze`, `ferro` (o metal da forja), `pedra` (de um save de antes), `?` |

- **Onde ficam**: `S.orig.p[lugar][bem] = { parte: n }` (no save). `lugar` é o do `G.Depot` (`f:` armazém, `h:` casa, `b:` prateleira,
  `v:` mãos, `m:` mochila, `q:` cais, `s:` porão, `c:` carroça, `g:` chão, `z:` banca…).
- **Como andam**: toda mudança pelo `G.Depot` (`move`, `make`, `use`, `drop`, e o `store` e o `swap` por cima deles) leva as suas
  partes. Uma receita pede as partes que quer (`c.of`: a cerveja, `G.Origem.CEREAL`); sem pedido, sai pela **regra fixa**, sem acaso
  (`O.RULE`): o desconhecido primeiro, **o que estraga primeiro** (o peixe, o marisco, a carne, o leite, os ovos, a horta, a fruta…, o
  cereal por último); nas ferramentas e nas armas, **a melhor primeiro** (o ferro, o bronze, a pedra) — a leva, o ladrão, o desgaste.
- **O que nasce** (`D.make`) diz o que é: `of: 'peixe'`, ou o código do livro (`pesca`, `ordenha`, `ovos`, `abate`, `caca`,
  `sacrificio`, `horta`, `fruta`), ou as marcas da carga (`meat`, `fish`, `shell`, `grain: 'cevada'`, `berries`, `basket`).
- **O que o mundo ainda move à mão** (fora do depósito) passa as partes por `O.carried(de, para, bem, n)` logo depois da mão, e o
  que chega à mão de uma fonte verdadeira por `O.came(para, bem, n, parte | partes)`; `G.Village.addStock(bem, n, povo, parte)` tem
  agora o 4.º argumento. A leva: `O.levy(f)` / `O.unlevy(f, v)` (o metal da arma vai com o soldado, `v._levy`).
- **O que aparece sem parte conhecida** vira `?` e é **contado com a causa** (`O.unknown()`, `O.unknownWhy()`): nunca escondido.
- **Para perguntar**: `O.parts(lugar, bem)`, `O.amount(lugar, bem, de)`, `O.free(lugar, bem, de, op)`, `O.next(lugar, bem)` (o que sai
  agora), `O.most`. De fora do passo do mundo, uma cópia que não escreve nada.
- **O que cada povo teve** (`S.orig.had[povo][material] = dia`): `couro`, `cobre`, `estanho`, `minerio`, `ouro`, `bronze`, `ferro` —
  marcado quando o bem entra num lugar do povo (o armazém, uma casa, as mãos, uma mochila), de uma fonte ou de outro povo. Uma coisa
  **feita** não marca: quem a faz já tinha o material (o verificador pergunta ao livro). `O.had(povo, m)`, `O.matOK(povo, m, artes)`
  (madeira, pedra, vime, corda sempre; couro e ouro tidos; bronze e ferro com a arte **e** o metal tido), `O.forged(povo, m)` (a arte
  e o metal: o que a luta, o anzol e a roupa perguntam).

## 2. Os metais

| Bem | Fonte no mundo | Receita | Quem usa |
|---|---|---|---|
| `minerio` (minério de ferro) | jazida de ferro (`S.ores`, `ferro`: terras altas e rocha); veio de ferro de uma caverna | a **mina** (`mina`, `mineiro`), no livro `mina`; o planejador só a abre para quem sabe **o ferro** | a forja (ferro) |
| `cobre` | jazida de cobre — **nova** — nas colinas e no chão rochoso, a mais comum (`E.genBronze`, ~1 por 1100 casas); veio de cobre da caverna | a mina, `mina`; o planejador a abre para quem sabe **o bronze** | a forja (bronze); o comércio de terra (`trade.js`) |
| `estanho` | jazida de estanho — **nova**, rara — no granito do alto e no cascalho da beira de um rio (~1 por 4500 casas); veio de estanho da caverna | a mina (sai devagar, como o ouro), `mina`; para quem sabe o bronze | a liga do bronze (1 por fornada); o comércio — **o que se compra de fora** |
| `ouro` | jazida de ouro (montanha, deserto, rio da selva); veio e tesouro de caverna; o presente de uma cidade (`citygifts`) | a mina, `mina` | o ourives (joias), a coletoria (moedas), a estátua de ouro; a porta para coisas de ouro está pronta (`O.matOK('ouro')`) |
| `armas`, `ferramentas` **de bronze** | — | a **forja** (`forja`, `ferreiro`, arte **bronze**): busca 6 de cobre → **liga**: 1 de estanho do armazém ao cadinho, pelo livro (`liga`) → fogo (2 de lenha) → forjar 2 → 2; `of: 'bronze'` | a leva (`army.js`, `wars.js`), o desgaste dos ofícios, o ladrão, a mochila do corpo (`Inv.make`) |
| `armas`, `ferramentas` **de ferro** | — | a **forja** (arte **ferro**): busca 6 de minério de ferro → fogo (**3 de lenha**: o ferro pede mais calor) → forjar 2 → 2; `of: 'ferro'` | as mesmas |
| (sem metal) | — | **nada**: a forja fica parada («a falta de estanho»); o planejador nem a levanta sem um metal que o povo trabalhe (`E.metalNear`); a fornada de um save de antes (do minério) continua como de ferro para o povo que sabe o ferro e, para o que não sabe, acaba no passo do mundo, com o minério na prateleira (L-1366) | — |

- **O combustível** (decidido, D-441): a **lenha do armazém** (`wood`), a mesma do forno da olaria — o carvão é lenha queimada sem ar,
  e a forja o faz da lenha do povo; o ferro gasta mais.
- **A mina pela necessidade** (D-441): o planejador abre a mina de um metal que o povo trabalha, e só **enquanto ele precisa**: com
  30 de cobre (ou 12 de estanho) no armazém, nenhuma mina nova desse metal (`E.oreEnough`); com o dobro, as minas abertas não pedem
  mineiros e eles vão para outro trabalho, até a forja ou uma caravana baixar o monte — o pão primeiro. O ferro e o ouro seguem como
  eram (o ouro sempre se cava: vira joias e moedas).
- **O ferro das jazidas e o ouro** de um mundo ficam onde sempre estiveram: o cobre e o estanho têm o seu próprio dado da semente.
- **Um save de antes** ganha no load, pela semente, as jazidas que não conhecia (`S.oresV`), uma vez (D-446).
- **A luta**: o golpe do bronze (+10%) e do ferro (+10%) e o espadachim pedem **a arte e o metal tido** (`O.forged`), como o anzol
  da vara (`act-pesca.js`) e o metal da roupa (`atmos.js`). Um povo do bronze que nunca teve cobre e estanho luta de pedra (D-443).

## 3. A comida e o que se faz dela

| Parte da comida | Fonte no mundo | Quem a põe | Onde a regra a pede |
|---|---|---|---|
| `trigo`, `cevada`, `arroz`, `milho`, `sorgo` | o campo (`farm`) e o grão da terra dele (`G.Estates.grainOf`: cevada no norte, arroz no molhado, milho do asteca, sorgo na savana) | a colheita (`villagers.js`, `G.Origem.came(…, b.grain)`) | **a cerveja** (`act-taverna.js`, só cereal); o taverneiro compra grão para a cuba |
| `peixe` | o rio, o lago, o mar (os cardumes do `waters.js`) | a pesca da margem e do barco (`pesca`, as marcas `fish`), o barco que volta (`waters.js`, `naval.js`), o bacalhau e o atum comidos | **o prato de peixe** da taverna (só com peixe na prateleira); a salga → bacalhau |
| `marisco` | as poças da maré, a beira | a cata (`shell`), o camarão comido | — |
| `carne` | a caça, o abate do curral, a baleia, o sacrifício | `meat`, `abate`, `caca`, `sacrificio`; a carne-seca comida | a salga → carne-seca |
| `leite`, `ovos` | o rebanho (vaca, cabra; o peru, as galinhas da casa) | `ordenha`, `ovos`; o queijo comido | — |
| `horta` | a horta da casa (`urban.js`) | `horta` | — |
| `fruta` | o pomar, o arbusto do mato, a tâmara | as marcas `basket`, `berries` | — |
| `mel`, `azeite` | a colmeia, a oliveira (as reservas comidas na fome) | `riches.js` | — |
| `provisao` | o que os fundadores trouxeram (o armazém de um povo que nasce) | `G.Fac.create` | — |

- **Comer tira de qualquer parte, como antes** (pela regra: o que estraga primeiro). As somas, a fome e os mortos de fome não mudam
  pela divisão: ela é a contabilidade da mesma comida.
- **A cerveja** (D-444): a cuba (`vat`, `in: 'food'`, `of: CEREAL`) só começa com cereal na prateleira e só gasta cereal; o
  taverneiro compra o grão quando a cuba vai precisar. **A vila de pescadores sem campo não faz cerveja.**
- **O pulque** é o aguamiel do maguey (o agave); o mundo ainda **não tem o maguey**: a receita pede `aguamiel`, e o povo do pulque,
  sem ele, faz **a cerveja do seu milho** (`tavern.js`: `asteca: { k: 'pulque', alt: 'cerveja' }`). O agaval é o plano (§6).
- **O prato** da taverna é do que se come: `T.dish(b)` — «um prato de peixe», «tortilhas de milho», «um caldo de cevada»…
- **A dádiva** (22b, D-587): a refeição que um bondoso dá a quem passa fome sai da despensa da casa dele, pelo livro (`G.Depot.use`,
  código `dadiva`), e é comida ali — nada nasce. O empréstimo entre amigos (D-588) é moeda de uma casa a outra (`emprestimo`, e a
  volta, `divida`): a dívida é a lembrança dele (a marca `deve`), não uma moeda a mais.
- **A salga** (D-445) busca no armazém só carne ou peixe (`of: ['carne', 'peixe']`) e faz carne-seca da carne, bacalhau do peixe —
  nunca do grão.

## 4. Os outros bens

| Bem | Fonte no mundo | Receita / quem faz | Quem usa |
|---|---|---|---|
| `wood` (madeira) | as árvores derrubadas (`G.Nature.fellTree`), a madeira que o mar traz; o ano de fartura do deus (o dobro) | o lenhador | as obras, o fogo dos fornos e da forja, os navios, as coisas de madeira, o cabo das de pedra; **o vime e a corda** (as fibras: as varas finas e a entrecasca) |
| `stone` (pedra) | a pedreira, as rochas, o fragmento do meteoro | o mineiro da pedreira | as obras, as coisas de pedra |
| `water` | o poço, o rio | — (não se guarda) | beber, cozinhar, os banhos |
| `la` (lã) | a ovelha do curral | a tosquia (`tosquia`) | a tecelagem |
| `tecido` | — | a **tecelagem**: 2 de lã → 1 | as casas, o mercado, a feira, o comércio, a roupa (`G.Atmos.dress`) |
| `couro` | o abate (`abate`, no gancho do açougue) e a caça (o couro do bicho: `caca`) | — | as casas, o mercado, a feira; **o elmo e a couraça de couro** |
| `peles`, `pele_rara`, `couro_exotico`, `marfim`, `chifre`, `plumas`, `oleo` | a caça (o que o bicho dá: `animals.js` `goods`), a baleia | `caca` | o comércio de luxo, as casas ricas |
| `argila` | a beira do rio (o barreiro) | a olaria cava (`barreiro`) | a olaria |
| `tijolo`, `adobe`, `ceramica` | — | a **olaria**: argila + lenha no forno | as obras (tijolo, adobe), as casas e o mercado (cerâmica) |
| `joias` | — | o **ourives**: 1 de ouro → 1 | as casas ricas, o mercado, o comércio |
| `moedas` | — | a **coletoria**: 1 de ouro → 6 (`cunhagem`) | tudo o que se paga |
| `mel`, `cera` | o apiário, a colmeia do mato | o apicultor | a taverna do nórdico (hidromel), a comida da fome |
| `seda` | o bicho-da-seda na folha de amoreira | a casa da seda | o comércio, a roupa |
| `vinho`, `azeite`, `tamaras`, `cacau`, `cafe`, `especiarias`, `incenso` | o vinhedo, o olival, o pomar, a plantação — só onde crescem e de quem os conhece | os ofícios do campo (`estates.js`) | a taverna (vinho), as casas ricas, o comércio |
| `sal` | a salina; **o sal-gema da caverna** (era comida: L-1360) | o salineiro; quem cava a caverna | a salga |
| `carne_seca`, `bacalhau` | — | a **salga**: 1 de sal + 4 de carne (ou de peixe) → 2 | a comida da fome (a reserva) |
| `queijo` | o leite (40% da ordenha) | a ordenha | a comida da fome |
| `atum`, `camarao` | o cardume (o peixe que vale mais) | a pesca | a comida da fome, o comércio |
| `perolas`, `coral` | os recifes | o mergulhador | o luxo |
| `cerveja`, `pulque` | — | a cuba da taverna (§3) | a taverna |
| `guano` | os morcegos da caverna | quem o recolhe | o adubo dos campos |

## 5. As coisas do catálogo (`G.Itens`) — o que cada uma é feita

O que cada coisa gasta para ser feita, e o que ela devolve ao armazém, é **o material dela** (`G.Itens.feitoDe(chave)`, D-442):

| Material | É feito de | Quando o povo pode |
|---|---|---|
| **bronze**, **ferro** | uma das **ferramentas** (machado, picareta, pá, enxada, foice, martelo, faca, vara, rede, remo; os grilhões de ferro: ½) ou das **armas** (espada, lança, flecha — 20 a cada uma —, escudo, elmo, couraça) **daquele metal** do armazém (`of: 'bronze'`) | a arte do metal **e** o metal tido |
| **pedra** | a pedra e a madeira do armazém (o machado: ½ + ½; a lança: ¼ de pedra e ¾ de madeira; a faca: ¼ de pedra…) | sempre |
| **madeira** | a madeira (a pá, a enxada, a clava, o arco, o escudo de madeira, o remo: 1; a vara: ½; o cajado: ½; a tocha: ¼; o balde: ½; a muleta: ½; a caneca talhada: 0,1; o prato torneado: 0,15; o jogo de dados de madeira, os oito dadinhos talhados: 0,05 — T4, D-852) | sempre (o arco, com a arte do arco; a vara, com o anzol de bronze: o bronze tido) |
| **vime**, **corda** | as fibras da madeira (o cesto: 0,2; a rede: 1; a funda: ¼; a bola de vime: 0,1; os grilhões de corda: 0,1) | sempre |
| **couro** | o couro do armazém (o elmo: 1; a couraça: 3; a bola de couro: 0,15); os instrumentos (P7, D-764), o couro e a madeira (a lira: 0,1 de couro — a caixa coberta e as cordas de tripa — e 0,3 de madeira; o tambor: 0,3 de couro e 0,6 de madeira) | **só quem teve couro** (caçou ou abateu: o couro e a tripa são do mesmo bicho) |
| **barro** (22c, D-612) | a **cerâmica** do armazém (a caneca de barro: ¼; o prato de barro: 0,3) | **só quem teve a cerâmica** da olaria (`O.MAT_OF.ceramica`: entrou no povo — feita, comprada, saqueada; e a que está no armazém, a cada olhada do passo) |
| ouro | (a porta pronta: o ouro do armazém; o catálogo ainda não tem coisa de ouro) | quem teve ouro |
| **osso** (P7, D-805) | nada do armazém: os **ossinhos** da taverna são os ossos do tornozelo da carcaça (`G.Itens.feitoDe` → nada; o armazém não os dá); os **dados de osso** do jogo de copo também (T4, D-852) | **só quem teve osso**: a carne feita de um abate, de uma caça ou de um sacrifício marca o osso (`D.make` da comida com a parte `carne`); e quem teve couro, que veio de uma carcaça |
| **lã** (P7, D-805) | o **tecido** do armazém (o pano de limpar a mesa: 0,05) | **só quem teve pano tecido** (`O.MAT_OF.tecido`: o tear o fez, ou entrou no povo) |
| **palha** (P7, D-805) | nada do armazém: o feixe de palha é dos talos secos que todo povo corta para os telhados e as camas | sempre (`O.PLAIN`) |

- **O armazém dá o que a divisão dele tem** (`G.Inv.offer` / `Inv.make`): o melhor material de que o armazém tem com que fazer a coisa
  — nunca «o melhor que o povo sabe». **A coisa que volta** (`Inv.unmake`, a casa esvaziada, o que alguém achou no chão) volta ao
  seu bem e à sua parte: um machado de bronze, uma ferramenta de bronze; um de pedra, a sua pedra e a sua madeira.
- **As coisas do dia** (22c, D-612): a **caneca** de quem bebe ou brinda (o ato), os **grilhões** de quem é levado amarrado (o
  ato `bound`), a **bola** da criança que brinca (numa casa em duas), a **muleta** de quem perdeu a perna (`v.lost`) — todas pelo
  kit, no melhor material que o povo teve: a caneca de barro onde houve cerâmica, os grilhões de ferro onde o povo forja o ferro,
  a bola de couro onde houve couro; senão a madeira, a corda e o vime de sempre. Nenhuma é arma. A caneca e os grilhões são **do
  lugar** (a casa onde se bebe, quem leva o preso), não da pessoa: passam também a quem tem coisas de verdade — o corpo do deus —,
  no mesmo material (`PLACE_TOOL`, L-1778); a ferramenta do ofício, não (D-426).
- **O prato da taverna** (P7, D-768): o prato que o taverneiro leva à mesa (a comida de uma rodada nas mãos dele, `G.Inv.roundOf`)
  é a coisa do catálogo `prato`, pelo kit, no material que o povo teve — o barro da cerâmica da olaria, senão a madeira torneada —,
  como a caneca; nunca entra no armazém como coisa. A comida que vai nele é a da prateleira da taverna, da parte que o corpo pediu
  (`of`: o arroz, o peixe — a origem da comida, 20h), e o corpo a come pelo livro (`T.bite`, «refeicao»): o que foi comido sai das
  mãos dele com as suas partes.
- **Os ossinhos e o pano da taverna** (P7, D-805): quem joga à mesa (o ato `jogo-ossos`) tem nas mãos os **ossinhos** — os ossos do
  tornozelo de um carneiro —, pelo kit, e só onde o povo teve osso (a carcaça de um abate, de uma caça, de um sacrifício: sem osso,
  nenhum jogo de ossinhos na taverna); quem limpa a mesa (o ato `limpar-mesa`) tem o **pano**: de lã onde o povo teve pano tecido,
  senão um feixe de palha. São **do lugar** (`PLACE_TOOL`), como a caneca; o armazém não dá nenhum dos dois do nada — o osso e a
  palha não são de nada que ele guarda (`Inv.offer` recusa a coisa feita de nada).
- **Os dados do jogo de copo** (T4, D-852): o jogo de dados (`dados`, oito dadinhos de um a seis) é uma **coisa de verdade** — na
  prateleira da taverna (`b:`) ou na mochila de quem a traz (`m:`) —, e só se joga onde há uma (`G.JogoDados.setFor`). Os da casa, o
  taverneiro os faz uma vez, no dia em que a casa tem menos do que guarda (um jogo por degrau: a taberna 1, a taverna 2, a hospedaria
  3): **de osso** onde o povo teve osso (`G.Origem.matOK(fid, 'osso')` — a carcaça de um abate, de uma caça, de um sacrifício; nada do
  armazém, como os ossinhos; `D.make` com o código `dados`), **senão de madeira**, da lenha da prateleira da casa (`D.use` de 0,05 de
  madeira, depois o `D.make` dos dados de madeira; sem lenha, nenhum jogo, e a casa tenta de novo um minuto do mundo depois). O corpo
  pode trazer os seus: o armazém do povo dá **dados de madeira** pela madeira dele (`Inv.offer`: 0,05); os de osso, o armazém não dá
  (o osso não é de nada que ele guarda). O kit põe na mão de quem joga **os dados de verdade da mesa** (`G.JogoDados.dadosDe`), nunca
  uns de arte do povo. As **moedas** do jogo andam pelo livro, da bolsa de cada um ao pote (`j:`, `dados-aposta`) e do pote ao vencedor
  (`dados-premio`) ou de volta a quem pôs (`dados-volta`); o prêmio do torneio da noite de festa sai de quem o dá (`torneio-premio`) e vai
  ao campeão (`torneio-campeao`). O copo em que se sacode é o da casa, só desenhado: de couro onde o povo teve o couro, de barro onde
  teve a cerâmica, senão de madeira torneada.
- **A cerveja diz o grão de que foi feita** (P7, D-802): o lote da cuba guarda as partes do grão que tomou (`op.data.de`: o `D.use` da
  origem diz as partes que saíram, `r.parts`), e a taverna guarda o grão da cerveja da sua prateleira (`b.malte`: cada lote feito põe
  o seu grão, cada caneca que sai leva a sua parte; a cerveja que veio do armazém é de grão não sabido) — a carta diz «cerveja de
  cevada da casa» só pelo grão de verdade.
- **O que o povo fez de cada comida** (P7, D-803; `O.madeBy`): a última vez que o povo fez cada parte da comida pelas mãos dele —
  a pesca, a lavoura, o abate e a caça, o leite, os ovos, a horta, a fruta (um `D.make` da comida com a sua parte num lugar do
  povo; nunca o que chegou de fora por uma mão: `O.carried`, `O.came`) —, em `S.orig.mk`, no save. A carta da taverna diz «arroz das
  lavouras do povo» só onde o povo o fez, «que veio de fora» onde o registro cobre os dias e o povo não o fez, e, num save de antes
  (o registro ainda curto), pelos meios que o povo tem agora (as fazendas daquele grão, os pescadores, os currais) ou só o que é.
- **O pedido do corpo na mesa** (P7, D-800, D-801): o lugar `'t:'` do livro é a mesa de um dia da taverna — o pedido do corpo deixado
  no lugar dele (`taverna-mesa`, das mãos do taverneiro), o resto de um prato deixado (`sobra-mesa`) —; daí às mãos do corpo,
  pago ali (`taverna`), de volta à prateleira quando esfria sem dono (`taverna-mesa-volta`, `taverna-volta`), ou o resto à lavagem
  (`sobra`); no fechamento, o pedido volta à prateleira e o resto vai fora. Nada some sem a sua linha.
- **O instrumento do músico da noite** (P7, D-764): quem sobe ao estrado da taverna e toca (o ato `play`) tem nas mãos o
  instrumento do seu povo, pelo kit (`ACT_TOOL.play`): o **tambor** (o huehuetl, o tronco escavado com o couro na boca) do asteca, a
  **lira** (os braços e a travessa de madeira, a caixa coberta de couro, as cordas de tripa) dos outros — do couro e da tripa do
  bicho que o povo teve (o material `couro`, `O.matOK`) e da madeira; um povo que nunca caçou nem abateu não tem instrumento, e o
  músico canta. Nenhum é arma, e nenhum entra no armazém como coisa: o que custa é o couro e a madeira (`G.Itens.feitoDe`). O corpo do
  deus, que tem coisas de verdade, toca o que tiver na mochila (o instrumento não está no `PLACE_TOOL`).
- **O kit** (o que o 3D desenha de cada um, `G.Inv.kit`, puro) e **as coisas do ofício que viram de verdade** (`Inv.realize`) usam o
  melhor material **que o povo teve** (`O.matOK`). Um povo do bronze que nunca teve cobre e estanho desenha os guerreiros de lança de
  pedra e escudo de madeira; sem couro nem metal, sem elmo. O tido é para sempre: a lança de bronze do guerreiro não vira de pedra
  quando o armazém se esvazia (D-442).

## 5b. O trabalho das mãos do corpo (20g, `js/trabalho.js`, `G.Trabalho`)

O corpo que o jogador vive trabalha **pelas mesmas fontes** que as pessoas do mundo, no mesmo tempo do mundo (D-035), com **uma
coisa dele na mão** (a mochila — nunca o kit do ofício que não tem, D-426); o material da ferramenta conta contra a que o povo daria
ao ofício (D-427). Tudo entra nas mãos **pelo livro** (`G.Depot.make` em `v:`), com o código da causa — e a comida com a sua parte:

| Trabalho | A fonte no mundo | O que pede | O código (a parte) |
|---|---|---|---|
| Cortar a árvore, pegar a lenha do tronco | a árvore de `S.trees` (o mesmo contador do lenhador: `tr.chop`; cai pelo `G.Nature.fellTree`), a lenha do tronco (`tr.wood`) | **um machado** (sem ele, não) | `lenha` |
| Quebrar pedra | a rocha de `S.rocks` (a pedra sai dela; a última leva a rocha) | **a picareta**; o martelo, mais devagar; sem nada, não | `pedra` |
| Minerar | o veio da mina do povo (`S.ores`: `o.amt`), o turno do mineiro (`economy.js` `runMine`), a cidade conta (`G.Eco.mined`) | **a picareta** (sem ela, não) | `mina` (o bem do veio: `G.Eco.oreGood`) |
| Cavar argila | a margem de um rio (o chão seco ao lado da água que corre, sem casa nem árvore: o barreiro do oleiro, `economy.js` `clayPit`) | a pá; a enxada, mais devagar; as mãos, três vezes mais | `barreiro` |
| Colher frutas | as frutas do arbusto (`b.berries`) | as mãos | `fruta` (parte `fruta`) |
| Colher o campo | o canteiro maduro de uma fazenda do povo (`b.crops[k].s === 3`), a conta e o sorteio do lavrador (`villagers.js` `farm`) | a foice; as mãos, o dobro | `colheita` (a parte: o grão daquele campo, `Estates.grainOf`) |
| Pescar | o peixe contado daquela água (`G.Pesca.cast`: o pesqueiro, o acaso do mundo) | a coisa na mão diz o jeito: **a rede**, **a vara** (a linha), **a lança** (o arpão), ou as mãos (só com os pés na água) | `pesca` (parte `peixe`) |
| Esfolar | o bicho morto (`a.dead`, `a.meat`), as contas do caçador (`riches.js` `carcass`: até 8 de carne pela mão do povo na caça; o couro, as presas, as plumas do bicho) | **a faca** (sem ela, não) | `caca` (parte `carne`); o couro vai junto na carga e entra no armazém como o do caçador (`Riches.unload`, `caca` — o buraco M, igual) |
| Vender | a banca do mercador (`G.Biz`): o que está no balcão foi comprado no atacado ou posto pelas mãos | a banca aberta, na hora do mercado | a venda é da banca (`G.Biz`: as moedas pelo livro) |

**O que não muda no mundo**: as pessoas do mundo trabalham como antes (o mesmo tempo, as mesmas contas, as mesmas mãos à mão —
`Vg.fillHands`); só o desenho delas mostra a ferramenta e o gesto do ofício. Uma ferramenta que se gaste com o uso não foi feita nesta
parte (o desgaste do mundo continua o dos ofícios, `economy.js`).

## 6. Os buracos

### Fechados nesta parte (20h)

| | O que era | Como ficou |
|---|---|---|
| 1 | O bronze sem cobre nem estanho no mundo; a forja do povo do bronze comia **minério de ferro** | as jazidas de cobre e estanho (D-441); o bronze de cobre com a liga do estanho; o ferro só com a arte do ferro |
| 2 | O veio de cobre e de estanho da caverna dava **minério de ferro** (L-1363) | dá cobre, dá estanho |
| 3 | `ferramentas` e `armas` sem material | as partes do metal (`G.Origem`), da forja à leva |
| 4 | O armazém dava a coisa «do melhor material que o povo sabe» | dá o que a divisão tem; a coisa volta ao seu material |
| 5 | O kit desenhava elmo de couro sem couro e bronze sem metal | o material que o povo teve |
| 6 | A cerveja e o pulque de **qualquer comida** (de peixe numa vila de pescadores) | a cerveja só de cereal; o pulque só do aguamiel |
| 7 | A salga fazia carne-seca de **grão** | só carne ou peixe; o peixe vira bacalhau |
| 8 | O sal-gema da caverna era **comida** (L-1360) | é sal |
| 9 | O golpe do bronze e do ferro, o espadachim, o anzol e o metal da roupa pela **arte só** | a arte e o metal tido (`O.forged`, D-443) |
| 10 | A mina derrubada (o meteoro, o fogo, a guerra) deixava a jazida tomada **para sempre** (L-1361) | a jazida fica livre de novo |
| 11 | «Um prato de comida» de qualquer coisa | o prato é do que se come (o de peixe, só com peixe) |
| 12 | O couro da caça entrava no armazém sem linha do livro (L-1364) | pelo livro (`caca`) |
| 13 | A comida que os bandidos da caverna roubam e a que os guerreiros recuperam perdia a origem | leva as suas partes (`b.lootOf`) e volta com elas |
| 14 | O macaco que tira comida das mãos de um carregador não a tirava da conta da carga (L-1365) | a perda entra na conta da operação |

### Abertos, com o plano (o arquiteto decide)

| | O buraco | O plano |
|---|---|---|
| A | **O guerreiro de ofício já nasce armado**: `v._armed = role === 'guerreiro'` — a arma dele nunca saiu do armazém (só a leva tira) | o guerreiro toma uma arma do armazém quando vira guerreiro (pela porta da leva, `O.levy`), e a devolve quando deixa o ofício; sem arma, luta como a milícia — com a 20f |
| B | **O estanho vai do armazém ao cadinho sem mãos** (a etapa `liga`, pelo livro) | uma segunda «busca» no motor dos ofícios (`act-oficio.js`): o estanho carregado como o cobre |
| C | **O maguey não existe**: o pulque nunca é feito | o agaval: uma cultura da plantação (`estates.js`, a árvore `cactus` do chão seco, conhecida do asteca), o aguamiel como bem, a planta no 3D (`build3d.js` `EFAR.cactus`) |
| D | **O vime e a corda** vêm da madeira (as fibras) | a fibra própria: o junco e o salgueiro da beira d'água que o `fauna-meio.js` conhece, colhidos pelo coletor (`fibra`), e a corda também da lã e do couro cru |
| E | **O feno** do curral sai da comida do armazém de qualquer parte (peixe para as ovelhas) | o feno só das partes do campo (cereal, horta, fruta), ou um bem `feno` do capim cortado |
| F | **A veia de gemas** da caverna dá **joias** prontas (sem ourives) | um bem bruto `gemas`, lavrado pelo ourives |
| G | **O povo liberto** (`war.js`: comida = 10 por pessoa) e o povo novo de um evento (`events.js`) nascem com comida que não saiu de ninguém (`provisao`) | a parte do armazém da cidade de onde saem (`O.carried`) |
| H | **O ano de fartura** dobra a madeira e a pedra da entrega (o milagre do deus); o modo desenvolvedor (`rich`) | a causa é o deus e o desenvolvedor: fica dito, não é buraco do mundo |
| I | **O comércio por mar** (`naval.js` `RES`) leva só comida, madeira e pedra; o cobre e o estanho só vão por terra | o cobre e o estanho nas cargas dos mercantes, ou na rota dos luxos (`trade.loadShip`) |
| J | **A expedição** do povo do bronze ainda procura ferro (`expeditions.js` 144) | procurar o cobre e o estanho que faltam |
| K | **A refeição em casa** (`act-lar.js`) não diz o prato | o prato pela parte da despensa, como a taverna |
| L | **O save de antes**: a divisão nasce de um palpite (o que o povo trouxe de casa nos últimos dias, `f.foodSrc`; o metal pela arte, como o mundo de antes forjava) | fica: um save de antes não sabe mais do que isso (D-447) |
| M | **O couro da caça** e o resto dos despojos vão ao armazém sem passar pelas mãos (`Riches.unload`) | a carga do caçador com o couro, como a carne |

### Onde entraria o aço

O **aço** é o ferro com o carbono do carvão: entraria como um material novo do catálogo (`aco`, `ord` 3, no `It.MATS`, com a sua forma
no `itemforma.js` — a regra 137 cobra), uma arte depois do ferro (`aco` no `G.TECH`, depois de `ferro` nas ordens de cada povo), uma
parte nova das ferramentas e das armas (`O.METAL.aco`), e uma receita da forja: o minério de ferro com **mais lenha** (o carvão) e uma
etapa de têmpera — `forged(k, 'aco', …)`, escolhida pelo `E.forgeMetal` antes do ferro. Nada disso foi construído (o pedido).

## 7. Para quem faz um sistema novo

1. **Diga de onde vem cada coisa que ele faz** e **o que ele gasta**, numa linha deste mapa.
2. Faça pelo livro: `G.Depot.make` com o código da causa (e `of:` quando o bem é guardado por partes); gaste com `G.Depot.use` (com
   `of:` quando a receita só serve com certas partes).
3. **Nada à mão** num armazém: se for inevitável (um módulo antigo), `G.Origem.carried` / `G.Origem.came` logo ali, e o 4.º
   argumento do `addStock` para a comida.
4. Um material novo: a fonte dele no mundo, a parte dele no `O.KEPT` (ou o bem dele), e a pergunta `O.matOK`; nunca a arte sozinha.
5. Rode `node qa/origem.js` e confira o `O.unknownWhy()`: comida de origem desconhecida nova é um buraco.
