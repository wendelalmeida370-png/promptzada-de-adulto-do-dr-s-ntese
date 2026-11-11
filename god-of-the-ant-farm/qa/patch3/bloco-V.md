# Bloco V — BV-4 «o que se vê» (agente V, Bairros Vivos)

Branch `worktree-agent-a13e508c730875b03`, a partir de `61dc62b`. Números usados: decisões **D-162 a D-165**, limites de teste
**T-700 a T-703**, regras do guard **51 e 52**. Nenhum bug do jogo (L-) foi aberto: os L-720 a L-739 ficam livres.

Tudo aqui está pronto para colar. O que cada seção afirma foi rodado; o resultado de cada prova e de cada sabotagem está na
seção 7.

---

## 1. Linhas para o `qa/AUDIT.md`

```
| D-162 | decisão (do agente V, nos Bairros Vivos — BV-4) | **A roupa diz quem a pessoa é entre os seus, o que o povo sabe fazer, o frio e a bebida.** A roupa do 3D (`people3d.js`, `outfitOf`) lia o ofício, a idade, o povo e as moedas da casa. Agora lê também, por uma pergunta só ao mundo — `G.Atmos.dress(v)` (`js/atmos.js`), um registro pequeno cujo código entra na assinatura do cache da roupa (`sig`, `D.code`) —: **(1) o grupo** (`v.grp`, do `polity.js`), dentro do traje de cada povo: a nobreza, o manto de tinta funda com barra tecida e broche (o romano, a toga branca de barra púrpura; no Nilo a peruca, o colar largo e o ouro), o pano do corpo puxado para a mesma tinta; os mercadores, a capa de tinta viva, a correia da bolsa atravessada no peito e a barra tecida; os artesãos, a manga arregaçada e o cinto largo do trabalho; os militares e os sacerdotes seguem vestidos pelo ofício (o elmo, a túnica do culto); o povo, a túnica lisa, sem barra tecida (a não ser em casa abastada). O manto, que antes vinha das moedas da casa, vem do grupo. Um em doze (8 %, pelo id: `G.Atmos.odd`) veste-se fora da sua condição — o nobre de túnica lisa, o lavrador de capa colorida — e segue assim. **(2) A época e a técnica.** Auditoria: não existe arte de tecer nem de tingir entre as dez do jogo (`G.TECH`: roda, escrita, navegação, arco, bronze, alvenaria, moeda, engenharia, filosofia, ferro); existem o tear (`tecelagem`), a casa da seda (`sericultura`), os bens `tecido`, `la`, `seda`, `peles`, `joias`, e o bronze e o ferro. Decisão: um povo **tece** quando tem um tear de pé numa cidade sua ou pano no armazém (`f.stock.tecido ≥ 1`) — perguntado uma vez por dia —; sem isso veste couro e lã crua (as cores do velo e do couro, sem tinta e sem barra, o manto de couro). Como não há arte de tingir, o pano tecido é o pano tingido. **Seda** só onde a casa tem seda (`h.inv.seda`), ou o povo tem (casa da seda ou seda no armazém) e a casa é rica (casa mercante, mais de 40 moedas, ou o governante): um pano mais claro e fino, com fio de ouro. **Metais:** antes do bronze, fivela de osso e nenhum elmo de metal (gorro de couro no norte, cabeça nua nos outros); com bronze, bronze; com ferro, o elmo de ferro (o grego segue de bronze) e o broche de ferro dos militares. Joias na casa (`joias`, `perolas`) dão o ouro e a prata; peles na casa (`peles`, `pele_rara`), a gola de pele da capa. **(3) O frio.** Auditoria: não há estações; há o mapa de temperatura da terra (`S.temp`), o Inverno Súbito do deus (`S.winters`), a noite, a chuva e a tempestade. `G.Atmos.cold(x, y)`: 2 (de rachar) na terra da neve e sob o Inverno Súbito, 1 na terra fria, e mais um degrau de noite ou com chuva numa terra fresca. Só em quem está na rua (`!v.inside && !v.aboard`): manto por cima do que veste (de couro onde o povo não tece), peito e braços cobertos, pernas enroladas, pés calçados; de rachar, capuz (gorro no norte). Dentro de casa, tira. **(4) A bebedeira.** `G.Atmos.drunk(v)` lê a marca do mundo (`v.drunk`, das rodadas da taverna e do vinho dos poços): no 3D o corpo cambaleia (`Anim.stagger`: o tronco de um lado ao outro, o quadril atrás, o joelho que cede, a cabeça pendendo, os braços abertos, o rumo torto ao andar) e o rosto fica corado — só a pose: os pés ficam onde o mundo os tem (desvio 0 medido). A vista do deus já cambaleava os bêbados (`Court.sway`). **Regras:** toda escolha da roupa é pelo id da pessoa (`G.hash`), nunca um sorteio; a mesma pessoa veste-se sempre igual; nada é escrito no mundo; a ferramenta na mão segue a do gesto real (não mexi). De longe, a figura simples tem a cor do que a pessoa veste por cima (`P3.farCol`): uma rua de nobres e uma do povo leem-se de longe. **A vista do deus** (`art.js`, `Art.rank`, a mesma fonte): o manto do nobre na tinta do 3D com o fecho de ouro, a faixa viva do mercador, uma risca da mesma tinta de longe; no frio, o manto, e de rachar o capuz. O que a vista do deus não mostra: a época (cru ou tecido), a seda e os metais. Prova: `qa/roupa.js` (r1 a r9 e a página limpa: 10 passam, 0 falham) e quinze sabotagens, cada uma acusada. |
| D-163 | decisão (do agente V, nos Bairros Vivos — BV-4) | **Em volta de um prédio só há o que ele tem.** O que o 3D põe em volta de uma casa (`props3d.js`) saía do id da casa: lenha em quase toda casa do norte, um barril em sete de dez, o banco e o varal por sorte do id. Agora sai de uma pergunta ao mundo, `G.Atmos.about(b)` (só lê): **a lenha** só na casa onde mora um lenhador — auditoria: uma casa não guarda lenha no mundo (a madeira é do armazém do povo), então a pilha de lenha é a do ofício de quem mora ali, e o telheiro de lenha das casas do norte fica vazio nas outras —; **um barril** à porta por bebida ou óleo que a casa tem de verdade (`h.inv`: vinho, mel, cerveja, pulque, azeite, óleo); **o banco e o varal** só na casa onde mora alguém (os panos do varal pela gente da casa); **as coisas de um ofício** só onde mora quem o tem; **casa vazia, nada**. Na olaria, os potes secando são os crus que ela tem (`G.Oficio.show(b).cru`); na taverna, os barris do que ela tem para servir; no mercado, na feira e no mercado negro, um cesto por bem na prateleira; no cais, as redes de quem tem barco de pesca ali e os rolos de corda só no cais que trabalha (um navio dele, ou o bairro «porto movimentado» ou «pesqueiro», `G.Urban.is`). O id só diz onde cada coisa fica e de que tamanho é: a mesma casa mantém a cara. O que há em volta entra na assinatura do quadro (`B3.sig`, `G.Atmos.sig`): tirado do mundo, some do desenho — mas só onde o desenho tem lugar para coisas (`Props3D.yardOf`: o prédio desenhado pelo kit, sempre; o desenhado pela planta, só se o último quadro achou uma faixa livre no lote): o quadro de uma casa sem quintal não é refeito pelo que ela não tem onde mostrar. Prova: `qa/atmosfera.js` a4 e seis sabotagens. |
| D-164 | decisão (do agente V, nos Bairros Vivos — BV-4) | **Fumaça só com fogo de verdade; janela acesa só com gente acordada dentro.** Antes: no 3D a forja, a olaria, a oficina e a taverna fumavam sempre e as casas pela hora do dia; na vista do deus os fornos e os banhos sempre e as casas por sorteio; a janela acendia onde morava alguém (a vista do deus) ou em toda vidraça (o 3D), e a luz da porta pelo tipo do prédio. Agora as duas vistas fazem a mesma pergunta ao `G.Atmos` (só lê): **`fire(b)`** — a fogueira da cidade; uma fornada com lenha ardendo no forno (uma operação viva do `G.Oficio` na etapa do fogo, com `calor > 0`); a forja quente, o ferro na bigorna (a etapa de mão que segue o fogo, com alguém acordado dentro); a fornalha dos banhos acesa (`G.Termas.quente`); a taverna aberta (`G.Taverna.aberta`); a casa com alguém acordado cozinhando a ceia (a tarefa `lar` em casa, `what: 'cozinhar'`) ou junto ao fogo (metade da fumaça). **Prédio parado não fuma**, e na noite do Fogo Novo (`G.Fest.darkB`) nada fuma nem acende. **`lit(b)`** — a janela só com alguém acordado dentro (`v.inside === b.id && !v.sleeping`). No 3D: a fumaça pelo `F3.smokeRate` (da chaminé onde o desenho tem uma, senão pelo telhado; a dos banhos, branca de vapor); a luz da porta pelo `F3.doorLit`; a lanterna da taverna só com ela aberta; e cada vidraça leva a marca da sua casa (um atributo `aDark` por ponto na geometria dos vidros de cada pedaço do mapa, que o `B3.paneStep` acerta quatro vezes por segundo — nada é desenhado de novo quando uma casa dorme ou acorda). Na vista do deus: `R.smokeOf`, `R.windowLit`, e o clarão do forno só com fogo. Prova: `qa/atmosfera.js` a1, a2, a3, a8 e as regras do verificador (`qa/atmos-inv.js`, a9). |
| D-165 | decisão (do agente V, nos Bairros Vivos — BV-4) | **O desgaste de um prédio são os seus anos, a água e o cuidado.** O musgo, a barriga do telhado e as tábuas trocadas de uma casa do 3D saíam do id. Agora saem de `G.Atmos.wear(b)` (só lê), em degraus: **os anos** (`S.day − b.born`: novo, alguns anos, uma geração, velho, antigo — 2, 8, 20, 45), **a umidade** (2 com água encostada na parede e o chão a menos de 0,9 acima dela — alaga —, 1 com água a duas casas, 0 seco) e **o cuidado** (0, descuidado: o bairro «em decadência», «vazio» ou «pobre», a terra mais barata, a casa onde ninguém mora, o barraco; 2, bem cuidado: o bairro «nobre», a terra cara, a casa mercante; 1 o resto — pelo `G.Urban.at` / `is` e pelo valor da terra do retrato do dia, só lidos). No 3D os dois números do kit que já diziam a idade e a umidade (`K.hv(3)`, `K.hv(4)`) passam a ser três quartos do mundo e um quarto do id (cada casa ainda um pouco a sua), e a sujeira dos anos escurece a parede até 12 % (nenhuma numa parede nova, pouca numa bem cuidada, a maior onde ninguém cuida); o quadro é refeito quando um degrau é cruzado (`B3.sig`). **Um prédio cujo nascimento o mundo não sabe** (um save de antes de os nascimentos serem guardados, um prédio feito pela mão de uma prova) não tem desgaste (`wear` devolve `null`): é desenhado como sempre foi, pelo id. Os monumentos desenhados pela forma seguem como eram (a geometria deles é do agente E). Na vista do deus, o mínimo: um véu de abandono sobre o prédio velho e descuidado. **A fidelidade entre as duas vistas** (`qa/visual/fidelidade.js`, «a cor por dentro», T-254) mede prédios sem nascimento e segue passando (294 tipos e povos, nenhum subiu dez pontos). Medido à parte, numa cópia, com todo prédio posto num estado de desgaste (oito tipos, seis povos): novo e cuidado, nenhum dos 48 sobe dez pontos — a casa nova é a que o deus desenha —; com uma geração e cuidado médio, 2 de 48 (hut/clássico 31 → 52 %, barraco/grego 54 → 68 %); antigo e largado, 29 de 48 — a casa velha e abandonada difere do desenho do deus de propósito. Prova: `qa/atmosfera.js` a5 e seis sabotagens. |
| T-700 | limite de teste (do agente V, nos Bairros Vivos — BV-4) | **A `atmosfera` a2 depende de achar, na espera, cada fogo aceso.** O caso espera até quatro minutos de mundo (dois para a forja) por uma fornada ardendo, uma forja quente com o ferreiro nela, uma taverna aberta, a fornalha dos banhos acesa e uma casa com gente junto ao fogo, e apaga cada um pela mão da prova. Num mundo sem forja trabalhando nessa espera, o par da forja não é provocado e a prova diz («nenhuma quente com o ferreiro nela nesta espera»); os outros pares são exigidos. Na metrópole a forja foi achada em todas as rodadas. |
| T-701 | limite de teste (do agente V, nos Bairros Vivos — BV-4) | **A `atmosfera` a4 dá o barril da casa a uma casa que tenha lugar para ele.** O barril à porta só é desenhado onde o quintal da casa tem lugar; a prova procura uma casa habitada, sem bebida, em que uma jarra de vinho posta à mão faz o barril aparecer, e a tira de novo. Num mundo em que nenhuma casa tenha esse lugar a prova diz («nenhuma casa com lugar para um barril à porta») e não falha por isso; a regra geral (barril só com bebida) é conferida em todas as casas. Na metrópole a casa foi achada em todas as rodadas. |
| T-702 | limite de teste (do agente V, nos Bairros Vivos — BV-4) | **O cuidado de um prédio pode diferir logo depois de um load.** O valor da terra vem do retrato do dia da cidade (`G.Urban.peek`), que é derivado e não vai no save: depois de um load ele só existe de novo na primeira virada do dia de cada cidade. Até lá o cuidado lê só o bairro, a casa mercante e a casa vazia. Na `atmosfera` a7 o fogo, a janela, o que há em volta, os anos e a umidade são exigidos iguais antes e depois do save; o cuidado é contado e dito (95 a 97 prédios diferentes na metrópole, conforme a rodada), não exigido. Só o desenho muda, e só até a virada do dia. |
| T-703 | limite de teste (do agente V, nos Bairros Vivos — BV-4) | **A casa e a taverna desenhadas pela planta ocupam o lote inteiro: nada em volta, como antes.** As coisas em volta (`props3d.js`) ficam na faixa entre a parede e a beira do lote; um prédio desenhado pela planta (`B3.shellOf`) enche o lote, e na base já era assim (1 ou 2 coisas ao todo nas cerca de 200 casas da metrópole; nenhuma taverna com barris). A `atmosfera` a4 desenha as casas e a taverna pelo kit (a mão da prova no `B3.shellOf`, devolvida depois), que é o desenho de onde não há planta, e diz quantas coisas há com a planta; e confere que a casa de planta sem quintal não tem o quadro refeito pelo que não mostra. A regra (só o que a casa tem) vale nos dois desenhos; o que falta é lugar para as coisas — ver «o que ficou aberto». |
```

## 2. Linhas para o `qa/README.md`

```
| `roupa.js` | `[ONLY=r1,r4] node roupa.js [mundo]` | A roupa e o porte lidos do mundo (D-162), em Node com o three.js e os arquivos do 3D (como o `visual/tres-node.js`), na metrópole: o grupo — a mesma pessoa nobre, mercadora, artesã e do povo, em cada povo, de perto e de longe (r1); duas pessoas do mesmo ofício, grupo e povo não se vestem igual, quem se veste fora da condição segue assim, a mesma pessoa duas vezes é a mesma (r2); a época — com e sem tear, com e sem pano, a seda só onde o povo tem e a casa é rica, o elmo do metal que o povo forja (r3); o frio — o Inverno Súbito sobre quem está na rua, e dentro de casa tira (r4); a bebedeira — cambaleia no 3D sem sair de onde o mundo o tem (r5); só desenha — o mundo igual até o último número (r6); o save no meio (r7); a vista do deus lê o mesmo grupo e pinta a mesma tinta (r8); as regras do verificador limpas e acusando a mentira (r9). ≈ 4 min. Cobre `people3d.js` (a roupa, o cambalear), `atmos.js` (`dress`, `cold`, `drunk`) e `art.js` (`Art.rank`). |
| `atmosfera.js` | `[ONLY=a1,a3] node atmosfera.js [mundo]` | A atmosfera pela atividade (D-163, D-164, D-165), em Node com o three.js e os arquivos do 3D, na metrópole: a fumaça — um dia olhado 61 vezes, cada telhado que fuma (no 3D e na vista do deus) com a sua causa contada dos registros do mundo, e cada fogo de verdade fumando (a1); cada fogo apagado pela mão da prova para de fumar e volta (a2); a janela — cada vidraça do 3D, a luz da porta e a janela do deus só com gente acordada dentro, e o shader lê a marca (a3); os objetos — em volta de cada casa só o que ela tem; tirado à mão, some (a4); o desgaste — os anos, a água, o cuidado do bairro (a5); só desenha (a6); o save no meio (a7); a noite do Fogo Novo (a8); as regras do verificador limpas ao longo de uma noite e acusando a mentira (a9). ≈ 8 min. Cobre `atmos.js`, `fx3d.js` (a fumaça, a luz da porta), `build3d.js` (as vidraças, o desgaste, a assinatura do quadro), `props3d.js`, `things3d.js` (a lanterna da taverna) e `render.js` (`R.smokeOf`, `R.windowLit`). |
| `atmos-inv.js` | (invariantes; carregado pelas duas provas acima com `extra: ['qa/atmos-inv.js']`) | As regras do verificador de «o que se vê» (sistema `atmos`): telhado fumando sem fogo, fogo sem fumaça, a fumaça de outro fogo (S2); janela acesa sem ninguém acordado dentro, e apagada com gente acordada (S2); casa vazia com coisas em volta, lenha sem lenhador (S3); a roupa que não diz o grupo do mundo, o agasalho do frio dentro de casa, o bêbado que não cambaleia e quem cambaleia sem ter bebido (S3). A causa é contada de novo dos campos do mundo, nunca pelo próprio `G.Atmos`. Para entrar no `qa.js`: `node qa/junta-inv.js` (o líder). |
```

## 3. Entradas para o `qa/regress.sh`

Fase **«fundacao»**, no grupo das provas do 3D em Node (a linha que começa com `(F corpo-mundo visual/corpo-mundo.js; …`):

```
F roupa roupa.js; F atmosfera atmosfera.js;
```

As duas abrem a metrópole (`worlds/`), levam ≈ 4 e ≈ 8 minutos sozinhas e saem com código 1 se um caso falha. Não mudam o
mundo pronto nem o save: a linha de base ganha só as linhas delas.

## 4. Regras novas do `qa/guard.js`

Primeiro, o `atmos.js` entra na lista do que só se vê (`LOOK`), ao lado de `'int-planta.js'`:

```js
  'props3d.js', 'body3d.js', 'bodymesh.js', 'post3d.js', 'int-planta.js', 'atmos.js'];
```

Depois, as duas regras, antes da linha `if (fails.length) { console.log(fails.join('\n')); …`. Rodei o guard com elas coladas
numa cópia: passa na minha árvore (151 arquivos) e acusa as sabotagens g10 (a roupa por sorteio) e g2 (a assinatura sem o
código do mundo).

```js
// 51. "o G.Atmos só lê, sem acaso nenhum" (Bairros Vivos, BV-4 — D-162 a D-165): o js/atmos.js é a fonte única do que a vista
// do deus e o 3D mostram do que acontece (o fogo sob a fumaça, a luz atrás da janela, o que há em volta de um prédio, o
// desgaste, o que a roupa lê do mundo). Por isso, fora dos comentários: não tira de acaso nenhum (G.R, rr, ri, pick, chance;
// G.VR e os seus; Math.random) — a mesma pergunta ao mesmo mundo tem a mesma resposta —; não escreve campo nenhum de pessoa,
// prédio, povo, cidade, operação ou do estado (v., b., f., s., h., q., op., set., S. seguidos de uma atribuição); e não abre
// porta nenhuma que muda o mundo (G.Depot.move/make/use…, G.Act.start/end…, setTask, Vg.give, Urban.note)
{ const f = 'atmos.js'; if (!src[f]) fails.push('atmos: js/atmos.js não existe — a regra 51 não acha a fonte do que se vê');
  else src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
    if (/\bG\.(R\(\)|rr\(|ri\(|pick\(|chance\(|shuffle\(|VR\(\)|vrr\(|vri\(|vpick\(|vchance\(|vshuffle\()|Math\.random/.test(c)) fails.push(`atmos: ${f}:${k + 1} o G.Atmos tira de um acaso (a resposta tem de ser a mesma para o mesmo mundo): ${l.trim().slice(0, 110)}`);
    if (/\b(v|b|f|s|h|q|op|set|S|G\.S)\.[A-Za-z_]+(\[[^\]]*\])?(\.[A-Za-z_]+)*\s*(=(?!=)|\+=|-=|\+\+|--)/.test(c)) fails.push(`atmos: ${f}:${k + 1} o G.Atmos escreve no mundo (ele só lê): ${l.trim().slice(0, 110)}`);
    if (WORLD_WRITE.test(c) || /\b(setTask|Vg\.give|Urban\.(note|noteB|mourn|remember)|Naval\.(board|unboard)|touchWalk)\s*\(/.test(c)) fails.push(`atmos: ${f}:${k + 1} o G.Atmos abre uma porta que muda o mundo: ${l.trim().slice(0, 110)}`); }); }
// 52. "o que se vê tem causa" (D-162, D-163, D-164): (1) a fumaça de um telhado e a luz de uma janela só saem perguntando ao
// G.Atmos — no 3D pelo F3.smokeRate (G.Atmos.fire) e pelo F3.doorLit (G.Atmos.lit), os vidros pelo paneSet do build3d.js
// (At.lit), na vista do deus pelo R.smokeOf (G.Atmos.fire) e pelo R.windowLit (G.Atmos.lit) —, e os laços que soltam a fumaça
// e acendem a janela passam por essas portas: uma tabela por tipo de prédio fazia a forja parada fumar e a casa dormindo
// brilhar; (2) o que há em volta de um prédio vem do G.Atmos.about (props3d.js: aboutOf) — a lenha só com `A.wood`; (3) a
// roupa é escolhida pelo id da pessoa: do começo do outfitOf ao fim dele, o people3d.js não tira de acaso nenhum, e o que
// ela lê do mundo vem do G.Atmos.dress (P3.dressOf), que entra na assinatura do cache (D.code)
{ const need = (f, rx, what) => { if (!(src[f] || []).some(l => rx.test(l.replace(/(^|\s)\/\/\s.*$/, '')))) fails.push(`o que se vê: ${f} sem ${what} — a regra 52 não acha a pergunta ao G.Atmos`); };
  const body = (f, start, end) => { const L = src[f] || []; const a = L.findIndex(l => start.test(l)); if (a < 0) return null; let b = L.findIndex((l, k) => k > a && end.test(l)); if (b < 0) b = L.length; return L.slice(a, b + 1).map(l => l.replace(/(^|\s)\/\/\s.*$/, '')); };
  const within = (f, start, end, rx, what) => { const B = body(f, start, end); if (!B) fails.push(`o que se vê: ${f} sem ${what} — a regra 52 não acha a porta`); else if (!B.some(l => rx.test(l))) fails.push(`o que se vê: ${f}: ${what} não pergunta ao G.Atmos (${rx.source.slice(0, 40)})`); };
  within('fx3d.js', /F3\.smokeRate = function/, /^  \};/, /G\.Atmos\.fire\(b\)/, 'F3.smokeRate');
  need('fx3d.js', /F3\.doorLit = b => .*G\.Atmos\.lit\(b\)/, 'F3.doorLit com G.Atmos.lit');
  need('fx3d.js', /const rate = F3\.smokeRate\(b, /, 'o laço da fumaça pelo F3.smokeRate');
  need('fx3d.js', /if \(nightK > 0\.05 && b\.built && F3\.doorLit\(b\)\)/, 'a luz da porta pelo F3.doorLit');
  need('render.js', /R\.smokeOf = b => .*G\.Atmos\.fire\(b\)/, 'R.smokeOf com G.Atmos.fire');
  need('render.js', /R\.windowLit = b => .*G\.Atmos\.lit\(b\)/, 'R.windowLit com G.Atmos.lit');
  need('render.js', /const fr = R\.smokeOf\(b\); if \(!fr\) continue;/, 'o laço das chaminés pelo R.smokeOf');
  need('render.js', /if \(nightF > 0\.15 && R\.windowLit\(b\) && spr\.win\.length\)/, 'as janelas da noite pelo R.windowLit');
  within('build3d.js', /function paneSet\(rec\)/, /^  \}/, /At\.lit\(b\)/, 'paneSet (os vidros)');
  need('build3d.js', /G\.Atmos\.sig\(b, /, 'a assinatura do quadro com G.Atmos.sig');
  need('props3d.js', /const aboutOf = K => \(G\.Atmos && G\.Atmos\.about \? G\.Atmos\.about\(K\.b\)/, 'aboutOf com G.Atmos.about');
  need('props3d.js', /if \(A\.wood\) \{/, 'a lenha só com A.wood');
  (src['props3d.js'] || []).forEach((l, k) => { if (/Build3D\.roles\(/.test(l.replace(/(^|\s)\/\/\s.*$/, ''))) fails.push(`o que se vê: props3d.js:${k + 1} lê os ofícios da casa fora do G.Atmos.about: ${l.trim().slice(0, 110)}`); });
  const O = body('people3d.js', /^  function outfitOf\(v, L, fac\) \{/, /^  \}/);
  if (!O) fails.push('o que se vê: people3d.js sem a função outfitOf — a regra 52 não acha a roupa');
  else { O.forEach(l => { if (/\bG\.(R\(\)|rr\(|ri\(|pick\(|chance\(|VR\(\)|vrr\(|vri\(|vpick\(|vchance\()|Math\.random/.test(l)) fails.push(`o que se vê: people3d.js: a roupa (outfitOf) tira de um acaso — a escolha é pelo id da pessoa (G.hash): ${l.trim().slice(0, 110)}`); });
    if (!O.some(l => /const D = P3\.dressOf\(v\)/.test(l))) fails.push('o que se vê: people3d.js: a roupa (outfitOf) não pergunta ao G.Atmos.dress (P3.dressOf)');
    if (!O.some(l => /const sig = `.*\$\{D\.code\}`/.test(l))) fails.push('o que se vê: people3d.js: a assinatura da roupa (sig) sem o código do que ela lê do mundo (D.code)'); }
  need('art.js', /const D = At\.dress\(v\)/, 'Art.rank com G.Atmos.dress'); }
```

## 5. Frase para o `CLAUDE.md` («As fundações»)

```
- **O que se vê tem causa — `G.Atmos`** (`js/atmos.js`, D-162 a D-165): a vista do deus e o 3D fazem as mesmas perguntas a uma fonte só, que só lê o mundo e não tira de acaso nenhum (o `guard.js` cobra, regra 51). **A fumaça** só com fogo de verdade embaixo — `G.Atmos.fire(b)`: a fornada ardendo, a forja quente com alguém nela, a fornalha dos banhos, a taverna aberta, a casa com gente acordada junto ao fogo; prédio parado não fuma —; **a janela** só com gente acordada dentro (`G.Atmos.lit(b)`); **o que há em volta de um prédio** só o que ele tem (`G.Atmos.about(b)`: a lenha do lenhador que mora ali, o barril da bebida que a casa guarda, os potes que a olaria tem secando; casa vazia, nada); **o desgaste**, os anos, a água e o cuidado do bairro (`G.Atmos.wear(b)`); **a roupa** lê o grupo da pessoa, o que o povo sabe fazer (tear, seda, bronze, ferro), o frio da rua e a bebida (`G.Atmos.dress(v)`, `cold`, `drunk`), e é escolhida pelo id da pessoa (`G.hash`), nunca por sorteio — o código do que ela lê entra na assinatura do cache (`D.code`). Um desenho novo que mostre atividade pergunta ao `G.Atmos` (a regra 52 cobra as portas: `F3.smokeRate`, `F3.doorLit`, `R.smokeOf`, `R.windowLit`, `aboutOf`, `P3.dressOf`); uma causa nova entra no `atmos.js` e nas regras do `qa/atmos-inv.js`. Provas: `qa/roupa.js`, `qa/atmosfera.js`.
```

E, na regra 3 do protocolo («Mudou o 3D do Modo Encarnado? Também …»), acrescentar: «mexeu na roupa, na fumaça, nas janelas
ou no que há em volta dos prédios? Também `node qa/roupa.js` e `node qa/atmosfera.js`».

## 6. Arquivo novo em `js/` e o `index.html`

`js/atmos.js` (o `G.Atmos`) é novo. A linha dele no `index.html` entrou logo depois da do `js/act-lar.js`:

```html
  <script src="js/atmos.js"></script>
```

Fica antes do `js/lib/three.min.js`: roda no Node (`qa/nodemundo.js`) com o mundo, sem o 3D.

## 7. As provas e as sabotagens (o que rodei)

### As duas provas novas, no código final

| Prova | Como roda | Resultado |
|---|---|---|
| `qa/roupa.js` | `cd qa && node roupa.js` (metrópole) | **10 passam, 0 falham** (r1 a r9 e «sem erro de módulo nem aviso no console») |
| `qa/atmosfera.js` | `cd qa && node atmosfera.js` (metrópole) | **10 passam, 0 falham** (a1 a a9 e «sem erro de módulo nem aviso no console») |

Os casos ruins pedidos pelo protocolo: o save no meio (r7, a7); o deus interfere (r4, o Inverno Súbito; a8, a noite do Fogo
Novo); a pessoa some no meio (a4: a família tirada da casa pela mão da prova; a2 e a3: quem estava acordado dorme); o
mundo muda (r3: o tear derrubado, o pano que acaba, o dia que vira; a5: os anos, o bairro que decai); só desenha (r6, a6: o
canônico, o save, cada pessoa e prédio, as operações e o acaso do mundo iguais).

### As sabotagens: 43, cada uma acusada

Cada uma desfaz uma parte numa cópia do jogo (`ag/V/sab-V.py`, pelo `bv/sab-run.sh`) e roda só o caso que deve acusá-la.

| Sabotagem | O que desfaz | Quem acusou |
|---|---|---|
| g1 | a roupa não lê o grupo | r1 |
| g2 | a assinatura do cache sem o código do mundo | r1 e r3 (e a regra 52 do guard) |
| g3 | todo povo tece, com tear ou sem | r3 |
| g4 | seda para toda casa de um povo que a tem | r3 |
| g5 | o elmo de ferro seja o que for que o povo forja | r3 |
| g6 | ninguém sente o frio | r4 |
| g7 | o manto do frio fica dentro de casa | r4 e r9 (a regra do verificador) |
| g8 | o bêbado anda reto no 3D | r5 |
| g9 | o cambalear move a pessoa no mundo | r5 |
| g10 | uma escolha da roupa por sorteio | r2 (e a regra 52 do guard) |
| g11 | a roupa deixa uma marca na pessoa | r6 |
| g12 | a vista do deus não lê o grupo | r8 |
| g13 | a vista do deus pinta o nobre numa tinta só sua | r8 |
| g14 | ninguém se veste fora da sua condição | r2 |
| x5 | o que o povo sabe fazer nunca é perguntado de novo | r3 |
| f1 | o 3D fuma pelo tipo do prédio | a1 |
| f2 | a vista do deus fuma pelo tipo do prédio | a1 |
| f3 | o forno fuma enquanto tem fornada, ardendo ou não | a2 |
| f4 | a forja quente sem ninguém nela | a2 |
| f5 | a taverna fuma aberta ou fechada | a1 e a9 |
| f6 | os banhos soltam vapor com a fornalha fria | a2 |
| f7 | a casa fuma com a gente dormindo | a2 |
| w1 | a janela acesa por quem está dentro, acordado ou não | a3 e a9 |
| w2 | as vidraças do 3D todas acesas, como antes | a3 |
| w3 | a luz da porta pelo tipo do prédio | a3 (e a regra 52 do guard) |
| w4 | a janela do deus acesa onde mora alguém | a3 |
| w5 | o shader do vidro não lê a marca | a3 |
| o1 | lenha em toda casa | a4 (e a regra 52 do guard) |
| o2 | banco e varal em casa vazia | a4 e a9 |
| o3 | o quadro não é refeito quando muda o que há em volta | a4 |
| o4 | os barris da taverna seja o que for que ela tem | a4 |
| o5 | o quadro da casa sem quintal refeito pelo que ela não mostra | a4 |
| o6 | nenhum quadro tem lugar para coisas | a4 |
| d1 | o desgaste do 3D pelo id, como antes | a5 |
| d2 | o cuidado surdo ao bairro | a5 |
| d3 | a casa vazia tão cuidada quanto as outras | a5 |
| d4 | a umidade por nada | a5 |
| d5 | o prédio sem nascimento gasto como um de dez anos | a5 |
| d6 | a sujeira dos anos também na parede nova | a5 |
| x1 | o `G.Atmos` deixa uma marca no prédio perguntado | a6 (e a regra 51 do guard) |
| x2 | o Fogo Novo não apaga as lareiras | a8 |
| x3 | o censo de quem está onde guardado de um instante para o outro | a9 |
| x4 | o índice dos fogos guardado de um instante para o outro | a9 |

Três sabotagens escaparam na primeira vez e a prova foi apertada até acusar: x5 (a r3 ganhou o dia que vira sem ninguém
avisar o `G.Atmos`), o5 (a a4 ganhou a casa de planta sem quintal) e d6 (a a5 ganhou a casa nova de um bairro comum). A f7 a
a9 não acusa, e está certo: no mundo vivo ninguém dorme com a tarefa da noite em casa — só a mão da prova faz isso (a2).
As g, o, d e a x5 rodaram no código final; as f, w e x1 a x4 rodaram antes dos dois últimos acertos (o quintal na assinatura
do quadro e o prédio sem nascimento), que não tocam as linhas que elas desfazem.

### As provas que já existiam

| Prova | Resultado |
|---|---|
| `node qa/guard.js` | PASSOU (151 arquivos) |
| o guard com as regras 51 e 52 coladas (numa cópia) | PASSOU (151 arquivos); acusa g2, g10, o1, w3 (regra 52) e x1 (regra 51) |
| `node qa/visual/guarda3d.js .` | PASSOU (27 arquivos do 3D; avisos 0) |
| `node qa/visual/corpo-rig.js` | TUDO PASSOU (10 passam) |
| `ONLY=e11 node qa/encarna.js SAIDA` (navegador) | TUDO PASSOU (9 passam; sem erros de página) |
| `node qa/visual/forma-deus.js` | PASSOU (26 passam, 0 falham) |
| `node qa/visual/fidelidade.js` | PASSOU (7 passam, 0 falham; «a cor por dentro»: 294 tipos e povos, nenhum subiu dez pontos) |
| `PARTE=node node qa/visual/monumental.js` | TUDO PASSOU (44 passam) |
| `node qa/visual/carga-mundo.js` | TUDO PASSOU (8 passam) |
| `node qa/visual/geo3d.js . metropole` (navegador) | 674 prédios, 0 problemas, erros nenhum |
| `node soak.js 103 continente 128 4 normal 5 1 1` | 5 anos, violações 0, erros nenhum |
| `node qa/det3.js 77 arquipelago 96 3 2` | PASSOU (a geração, A × B, A × C e D iguais) |

Não rodei, como manda o COMUM.md: `qa/regress.sh`, `qa/prontos.js` e a prova de desempenho.

### O custo (medido na metrópole: 632 prédios, 704 pessoas)

- Fazer o quadro de perto de um pedaço do mapa (`geo3d`, no navegador): 36,7 ms na base, 33,3 ms agora.
- `B3.sig` de todos os pedaços do mapa: 10,6 ms na base, 10,0 ms agora. A roupa de todos: 15,0 ms na base, 9,7 ms agora.
- O censo e os fogos de um instante do mundo (uma vez por instante, para todas as perguntas): 0,7 ms no pior caso.
  `fire` + `lit` de todos os prédios com o censo feito: 0,28 ms; `dress` + `drunk` de todas as pessoas: 0,44 ms; `Art.rank`
  de todas: 0,36 ms.

São medidas soltas em Node, com a máquina dividida — não a prova de desempenho.

## 8. O que ficou aberto

1. **Nos mundos prontos quase nenhuma casa mostra as coisas em volta** (T-703). A casa desenhada pela planta enche o lote, e
   a lenha, o barril, o banco e o varal não têm onde ficar — já era assim na base. A regra nova (só o que a casa tem) vale e
   está provada no desenho de kit; para as coisas aparecerem nas casas de planta é preciso lugar fora do lote (a rua), que é
   do espaço do corpo e da geometria dos prédios (K, E, líder). Reproduzir: `ONLY=a4 node qa/atmosfera.js` → «com planta, N
   coisas ao todo». O cais, o mercado e a olaria mostram as suas.
2. **A oficina (`workshop`) nunca mais fuma.** Ela não tem fogo nenhum no mundo (não tem operação: só dá um bônus ao povo),
   e o desenho dela tem chaminé. Pela regra «prédio parado não fuma» fica fria sempre. Decidir (líder, M): dar a ela um
   fogo de verdade na simulação, ou aceitar. Reproduzir: a a1 lista `workshop` só entre os sem fogo (305 olhadas, 0 com fogo).
3. **Um povo que vive de pano comprado troca de roupa de um dia para o outro.** «Tece» é ter tear de pé ou pano no armazém
   (`f.stock.tecido ≥ 1`), perguntado uma vez por dia: um povo sem tear cujo armazém oscila em torno de um pano aparece um
   dia de tecido, no outro de couro. Na metrópole (ano 58) os astecas não têm tear nem pano e andam de couro e lã crua; os
   romanos têm um pano só. Para não oscilar seria preciso guardar um estado no mundo (um campo no povo, no save) — decisão
   do líder.
4. **O cuidado depois de um load** (T-702): até a primeira virada do dia de cada cidade o valor da terra não existe, e cerca
   de 96 prédios da metrópole são desenhados com outro cuidado. Só o desenho.
5. **A casa velha e abandonada difere do desenho do deus de propósito** (D-165): a vista do deus só ganhou um véu de
   abandono. Os números estão na D-165 (2 de 48 tipos e povos acima de dez pontos com desgaste médio; 29 de 48 no pior
   estado). Decidir se a vista do deus deve mostrar mais desgaste, ou o 3D menos.
6. **Os monumentos desenhados pela forma não têm desgaste** — a geometria deles é do agente E; o `wornBy` os deixa de fora.
7. **Na vista do deus ficou o mínimo:** o grupo, o frio, a fumaça, a janela e o véu de abandono. A época (cru ou tecido), a
   seda, os metais e as coisas em volta dos prédios só aparecem no 3D.
8. **`B3.roles` (`build3d.js`) ficou sem uso** — o `props3d.js` passou a ler os ofícios da casa pelo `G.Atmos.about`. Não a
   apaguei: o `build3d.js` é também do agente E.
9. **O aspecto não foi revisto a olho.** Tudo foi conferido por números (em Node) e pelo e11 no navegador (desenha sem erro);
   não tirei fotos do manto, do capuz, do cambalear nem das janelas acesas e apagadas à noite. Vale uma olhada antes de
   publicar.
10. **O 3D do corpo do jogador não cambaleia** (o cambalear é só dos outros, `pl ? 0`), e quem está sentado num lugar de
    dentro (a taverna) não cambaleia: só de pé e andando.
