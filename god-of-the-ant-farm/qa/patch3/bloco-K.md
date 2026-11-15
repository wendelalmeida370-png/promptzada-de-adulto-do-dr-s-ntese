# Bloco do agente K — BV-6, «a tela que respeita o que o personagem sabe»

Ramo: `worktree-agent-a878e9323a48527c3` (base `61dc62b`). Tudo abaixo está pronto para colar; os números são os reservados ao K
(L-760 a L-779, T-740 a T-759, D-170 a D-173, regras 55 e 56 do guard). Usados: L-760, L-761; T-740 a T-744; D-170 a D-173.

**Atenção ao juntar:**
- **O save muda** (pouco): a pessoa ganha a chave `ken`. **Onde, exatamente:** `js/villagers.js`, **no fim da lista `SHAPE`**
  — a linha `'ken',` (com duas linhas de comentário em cima), logo depois de `'bathDay', 'trainDay', 'showDay', 'readDay',
  'speakDay',` e antes do `];`. É o mesmo lugar onde o líder pôs o `roofLost` (ce191ac): **vai conflitar ali; ficam as duas
  linhas, a ordem não importa.** **Não mexi no `js/save.js`:** a pessoa vai inteira para o save (o `serialize` copia todas as
  chaves), e o conserto de um registro danificado ao abrir é do gancho de save do próprio `possess.js` (`mendKen`, no `load`).
  A chave só existe em quem o deus viveu e em quem ele conheceu vivendo alguém; nos outros é `undefined` e nem vai para o
  save. Save antigo abre (o `sabe.js` s3 abre o `qa/oldsave_7.json` e a porta responde). **Peço ao líder rodar o
  `qa/oldsave.js` com uma pasta antiga**, como a regra manda: eu não tinha uma pasta do jogo antigo para rodá-lo.
- **Mexi em três arquivos fora das telas**, uma linha cada: `js/villagers.js` (a chave `ken` na `SHAPE`), `js/activity.js`
  (`A.commit`: depois do feito do corpo, `G.Possess.dealt(oferta)`) e `js/urban.js` (`U.valueAt`: fora do passo do mundo responde
  pelo retrato que a cidade tem e não faz outro — L-760, num commit só dele). Se algum conflitar, o conserto é a linha.
- Uma tecla nova no Modo Encarnado: **H** (a ação `tela`, «Mostrar / esconder a tela»), no `js/input3d.js`; uma regra no
  `css/style.css` (`#inc-root.hud-off …`).
- Não criei arquivo em `js/`; o `index.html` não mudou. Os mundos prontos não precisam ser gerados de novo por causa disto (o
  registro só nasce com o corpo; o `valueAt` não muda no passo do mundo).

## 0. A auditoria (o que a tela do corpo mostrava, e que memória a pessoa já tinha)

**O que cada tela mostrava (tudo, de todos):**
- A HUD (`incui.js`): o lugar — o nome do bairro de qualquer chão (`Urban.districtAt`) junto com a cidade do meio mais perto; as
  notícias — toda linha da crônica do mundo, de qualquer lugar; «E — Conversar com *nome*»; o letreiro com o nome de quem o corpo
  encara; quem sou, a hora, a bússola, os chamados, a linha do trabalho perto (do próprio corpo: ficam).
- A ficha da pessoa (`interact.js` `personCard` → `incui.js` `card`): de qualquer um com quem se fale, o nome, a idade, de onde é,
  os pais, o par e os filhos pelo nome, a casa, o jeito, as histórias em andamento e as seis últimas memórias.
- O cartão do prédio (`buildingCard`): a cidade e o povo; «Moram aqui» (todos pelo nome); «Em casa agora»; **«Moedas da família»
  de qualquer casa**; «No estoque do povo» de qualquer povo; «Trabalhando aqui» pelo nome.
- Os avisos e os abraços («*nome* está dormindo», «*nome* já está cortando esta árvore», «Consolar *nome*»); as ofertas do
  mundo que nomeiam alguém («Servir *nome*»).
- O Diário de Vida (`diario-ui.js` ← `G.Act.diary`) já era só o da pessoa (a própria casa, a própria banca, a biografia, os
  boatos do povo): não mudou. «Quem sou eu»: o lugar (o da HUD) e a própria vida.

**A memória que o mundo já guardava de cada um** (e que a porta agora lê): o sangue (`mother`, `father`, `partner`, `kids`,
`widow`), a casa (`home`), o ofício (`job`), a biografia (`bio`, até 18 linhas: o nascimento com o lugar, a chegada, a mudança de
cidade, a união, os filhos, as perdas, o mestre, quem contou histórias), as notas das atividades (`diary`), quem governa e a fama
(`f.leader`, `hero`, `ep`), o que os povos sabem uns dos outros (`f.rel[…].met`, `G.Know`), o que cada um sabe de cada fato
(`Stories.know`). O `v.moves` só guarda o texto («comprou uma casa e se mudou»), sem o lugar; o `S.avatar.met` e o `.seen` são
da encarnação e acabam com ela. **Faltava** só: «falei com esta pessoa» e «estive neste bairro», **na pessoa** → o `v.ken`.

## 1. Linhas do AUDIT

| D-170 | decisão (do K, BV-6: de onde vem o que o personagem sabe) | A tela do corpo era onisciente: dizia o nome de qualquer bairro, de qualquer pessoa e as moedas de qualquer casa. Agora pergunta a **uma porta só, de leitura, `G.Possess.knows`** (`js/possess.js`): `district(v, q)`, `town(v, set)`, `person(v, o)` / `how(v, o)`, `house(v, b)`, `stock(v, b)`, `name` / `call` / `looks` (como o personagem diz o outro), `seen(q)` (o que se vê de um bairro), `where(v)` (a linha do lugar) e `hears(v, e)` (a notícia que chega aos ouvidos). **Nenhum sistema paralelo de memória:** a porta lê a vida que o mundo já guarda — o sangue (`Po.kin`), a casa (`v.home`), o ofício (`v.job`), a rua (as casas a até 6 casas de distância), a biografia (`v.bio`: com quem se uniu, quem perdeu, com quem aprendeu, quem contou histórias; onde nasceu, chegou, mudou), quem governa e quem tem fama (`f.leader`, `v.hero`, `v.ep`), o que os povos sabem uns dos outros (`f.rel[…].met`). O que o mundo não guardava — «falei com esta pessoa», «estive neste bairro» — ganhou **um registro mínimo na pessoa, `v.ken`**: `p`, quem conheceu de frente (ids, até 40); `q`, os bairros e as cidades onde os pés estiveram (até 16: `[chave, o dia da primeira vez, 1 quando alguém do lugar disse o nome]`; um bairro pelo id, uma cidade por menos o id). Só o `possess.js` escreve, só dentro do passo do mundo (`Po.meet`, `Po.dealt`, o `remember` do `Po.update`); pedido de fora do passo (uma tela), o `Po.meet` não faz nada (`G.inSim`). Vai no save com a pessoa (está na `SHAPE`); um registro danificado é consertado ao abrir (`mendKen`). **O que a pessoa viveu antes de o deus vivê-la vem do que o mundo guardou; o que vive com o deus fica com ela** — e os dois lados de um encontro se lembram. Sem ninguém (o Modo Deus) toda porta responde tudo: o deus sabe, e o Modo Deus não mudou (os painéis dele não passam por aqui). Fica aberto, dito: «morou» num bairro antes da primeira vez que o deus viveu a pessoa não é sabido (o mundo não guarda as casas de antes; precisaria de uma linha onde `v.home` muda, no `social.js` e no `act-casa.js`); e os encontros entre duas pessoas do mundo, sem o corpo, não são anotados (a rua, o ofício, a casa e o povoado pequeno fazem as vezes). Prova: `qa/sabe.js` (32 linhas) e `qa/sabe-tela.js` (8 linhas); as regras do verificador: `qa/sabe-inv.js`; 32 sabotagens, 31 acusadas pelo caso esperado e uma não (T-742) — a tabela está no bloco do K. |
| D-171 | decisão (do K, BV-6: o bairro e a cidade) | **Um bairro, pelo nome:** num povoado pequeno (até vila, rank ≤ 2) em que se mora, tudo — os campos com nome também; numa cidade (rank ≥ 3) em que se mora, o bairro da casa, o do ofício, o coração antigo (`k: 'centro'`: todo mundo vai lá) e os da família de sangue e do par (ouviu falar em casa); em qualquer lugar, o bairro onde os pés estiveram **num dia antes de hoje** («esteve lá»), ou cujo nome **alguém do lugar disse** (um encontro ali com quem o conhece) — na primeira vez num bairro a tela diz o que se vê, e não o nome. **Uma cidade, pelo nome:** a em que mora, as do seu povo, uma onde esteve antes ou que um morador nomeou, uma em que viveu (a biografia) ou a de um povo que o seu já encontrou (ouviu falar); senão, «uma vila», «um acampamento». **O que se vê** (`K.seen`) sai da vida real do bairro: primeiro os perfis (`d.tags`, D-153: «cais cheio de caixas e de carga», «ruas de oficinas, cheiro de forno», «tavernas cheias», «casas vazias»…; o perfil «parado» diz «um cais parado», «oficinas frias»), depois a vocação construída («ruas de comércio», «campos cultivados», «casas grandes de pedra»), depois o que está de pé a poucos passos (uma forja, um cais, bancas) — duas coisas no máximo. A linha do lugar da HUD e a ficha «Quem sou eu» dizem isso; a cidade da linha é a **do chão** onde se pisa (L-761). **As notícias** que chegam de longe só chegam de onde o personagem poderia ter ouvido (uma cidade que sabe nomear, ou sem lugar); as de perto (o que presencia) como antes. Prova: `sabe.js` b1–b6, v1–v3; sabotagens s1, s2, s5, s6, s9, s16, s20, s23, s29, s30. |
| D-172 | decisão (do K, BV-6: a pessoa e a casa) | **Três graus** (`K.person`): **2, íntimo** — a família de sangue (pais, filhos, par, irmãos, avós, tios e os recíprocos), o viúvo e quem mora na mesma casa: a ficha inteira, como antes (as memórias, o jeito, de onde é, as histórias); **1, de nome** — o mesmo teto de ofício, a rua, a própria vida (a biografia), quem encontrou de frente (uma conversa, uma compra na banca, um copo servido ou pedido — `Po.meet` / `Po.dealt`, pela porta do mundo `G.Act.commit`), a fama do seu povo (quem governa, os heróis, quem tem apelido) e, num povoado pequeno, todo mundo: o nome, o ofício, a cidade, o que está fazendo, os feitos públicos, e da família dele só quem o leitor também conhece — **não** as memórias, o jeito nem de onde é; a ficha diz de onde o conhece («da vizinhança», «do mesmo ofício», «de conversa», «pela fama», «do povoado»); **0, estranho** — o que se vê: o ofício pela roupa, a idade em palavras, o povo pelo jeito quando os dois povos se conhecem («um mercador egípcio»), senão «estrangeiro». O estranho não tem nome no letreiro sobre a cabeça, no «E — Conversar com o ferreiro», nos avisos («A ferreira está dormindo.», «O lenhador já está cortando esta árvore.»), nos abraços, nas ofertas do mundo que nomeiam alguém («Servir o agricultor», «Dar o bebê ao agricultor» — as palavras se juntam como a língua junta), no que outro está fazendo («Indo comprar joias na banca da mercadora»), no cartão das casas («Moram aqui: 3 pessoas que você não conhece»). Falar com alguém é conhecê-lo: a ficha que abre depois do E já tem o nome (ele disse quem é), e os dois se lembram. **A casa:** as moedas e «quem está em casa agora» só da própria casa (`K.house`); o estoque do povo só no armazém do próprio povo (`K.stock`); a banca continua mostrando os preços (as ofertas do mundo), nunca o pote. O diário já era só do que a pessoa sabe (a própria casa, a própria banca). **As histórias:** no «Quem sou eu» e na ficha de alguém só aparecem as que a pessoa conduz (o que ela diz que tem a resolver); a história que outro tece em volta dela — o juramento de vingança de que é o alvo — só o deus lê. As lápides continuam dizendo o nome: está escrito na pedra. Prova: `sabe.js` p1–p7, c1, g1, t1; `sabe-tela.js` k2, k3; sabotagens s3, s4, s7, s8, s9b, s10–s13, s18, s19, s22, s24, s25, s26, s31, s32. |
| D-173 | decisão (do K, BV-6: a tela desligada) | Não havia modo sem tela. Agora a tecla **H** (a ação `tela`, que se troca no menu como as outras) e uma caixa no menu de pausa («Mostrar a tela») **guardam a tela**: somem quem sou, o lugar e a hora, a bússola, as notícias, os chamados, a linha e a marca do trabalho, o «E — …», a mira, as dicas das teclas, os botões do canto, o letreiro e a marca sobre a pessoa olhada, e a faixa de entrada. **Ficam**, porque sem eles o jogo quebra ou porque são do mundo: os balões do que as pessoas dizem, as respostas do mundo às mãos (uma recusa precisa ser ouvida), o aviso de como acordar, os botões de toque, o escuro de quem se afoga; as fichas, o menu, a morte e a volta ao deus abrem como sempre, e o E continua fazendo o que as mãos alcançam. A escolha fica guardada no navegador (como as teclas) e vale para o próximo corpo. É o «teste 1» do pedido (reconhecer o lugar sem a tela): a máquina prova que a tela some e o jogo segue; o reconhecimento é do que se vê e do que se ouve (V e S). Prova: `sabe-tela.js` k4 (e a foto `sabe-tela-desligada.png`); sabotagem s28. |
| L-760 | bug (consertado, K; achado pela prova «as telas não escrevem») | **Com o Diário de Vida aberto logo depois de abrir um save, o mundo vivia outro futuro.** O gancho do diário da casa (`act-casa.js`: «Uma casa para a família: juntadas 12 de 30 moedas») pede o preço de uma casa, `K.price` → `G.Urban.valueAt` → `sim(set)`, que, sem retrato da cidade, **fazia um e o guardava** (`derive`). Num mundo recém-carregado as cidades recebem o retrato de volta uma por passo (`U.update`): com o retrato feito pela tela, a ronda acabava um passo antes, e a conta do dia de «de quem é cada chão» (`cellOwner`) era tirada no instante da tela. Reproduzido: 120 passos da metrópole a partir do mesmo save, com e sem a leitura do diário do corpo entre os passos — estado canônico `5c34ec5a` × `d6ea1573`, e o acaso do mundo diferente. Correção (a regra da fundação: «se uma consulta pode vir de fora do passo do mundo, teste `G.inSim`»): `U.valueAt`, pedido de fora do passo, responde pelo retrato que a cidade tem e não faz nenhum (sem retrato, o valor neutro de sempre, 30 — por até dois segundos depois de um load o diário pode dizer o preço com a terra neutra). No passo do mundo nada muda. Prova: `sabe.js` w1 (o mesmo mundo com e sem «quadros»: idêntico); sabotagem s21 (o conserto desfeito: w1 falha com outro futuro). |
| L-761 | bug (consertado, K; visto na foto da prova) | **A linha do lugar dizia a cidade vizinha.** `Possess.where` dá a cidade pelo meio mais perto; a HUD juntava o bairro (do chão) com essa cidade: num bairro de Tenochtitlan mais perto do meio de Birka, «Bairro dos Guerreiros-Águia, Birka» — e a faixa de entrada «Cuetlachtli · 56 anos · Agricultor · Birka», de alguém de Tenochtitlan. Correção: a linha (`K.where`) diz a cidade **do chão** em que se pisa (a do bairro, ou a do todo da cidade); só fora de qualquer chão de cidade vale a mais perto. O `Possess.where` (a verdade do mundo, para o deus e para uma aventura futura) ficou como era. Prova: `sabe.js` b6 («Campos do Norte, Argos», mais perto do meio de Lavínio); sabotagem s30 («Campos do Norte, Lavínio»). |
| T-740 | limite de teste (aberto, K) | Os mundos prontos da geração 19 são de antes da vida do bairro (nenhum bairro tem perfil): neles o que se vê de um bairro sai da vocação e do que está em volta. O `sabe.js` b5 provoca o perfil pela porta do mundo (`G.Urban.note`, dias de fornadas, o relógio levado ao fim da noite pela mão do teste) para provar que a descrição segue a vida. Com os mundos da geração 20, vale olhar as linhas do b1 de novo. |
| T-741 | limite de teste (aberto, K) | O `sabe-tela.js` roda o 3D por software: 8 minutos com a máquina ocupada. As regras da porta estão todas no `sabe.js` (Node, 1,5 minuto); no navegador fica só o que aparece escrito e a tela desligada. |
| T-742 | limite de teste (aberto, K) | A porta lê se dois povos se encontraram direto do registro (`f.rel[id]`), porque o `G.Fac.rel` **cria** o registro que falta — uma tela escreveria o mundo. A sabotagem (trocar a leitura pelo `G.Fac.rel`, s14) **não é acusada**: o mundo cria as relações de todos os pares quando nasce (3 povos, 6 registros no instante zero), e a tela não acha par sem registro para criar. A regra fica pela leitura do código; o `sabe.js` v2 conta as relações antes e depois das perguntas (0 criadas), e acusaria num mundo com um povo novo ainda sem relações. |
| T-743 | limite de teste (aberto, K; fora do escopo: de quem cuida da banca) | O `negocio.js` n7 («sem dinheiro») **falha na base** (`61dc62b`, sem nada meu) com a mesma linha do meu ramo: «Creonte, com a casa sem moedas: "—" (falas: perguntar, recusar_caro; a compra parou em st 2 fala 9; agora sem tarefa; a casa com 0.98 moedas; a banca atendida)» — 19 passam, 1 falha, nos dois. Na linha de base ele passa. Como reproduzir: `node qa/negocio.js` (5 minutos) num checkout do `61dc62b`. Parece que a casa «sem moedas» do caso ficou com 0,98 (um troco) e o freguês diz «caro» em vez de «sem dinheiro»; não mexi. |
| T-744 | limite de teste (aberto, K; fora do escopo: de quem cuida das casas) | O `lar.js` l16 e l16b (D-098, «da casa cheia saem os moços primeiro») **falham na base** (`61dc62b`) com o mesmo texto do meu ramo, palavra por palavra: l16 — «FALHA (verificador) sem gente para a prova do verificador em Tenochtitlan (nenhum solteiro de 18 a 35, nem fora nem na casa)»; os dois — «o verificador no meio: S3 lar: Frida #23655: dorme ao relento a 4 casas da porta de hut#19668, a casa onde mora — L-371» (e a Frida #25577, a 2 casas). Na linha de base os dois passam. No meu ramo o `lar.js` inteiro dá 24 passam e esses 2 falham; na base a rodada foi cortada pela reinicialização da máquina depois do l16b (14 passam, os mesmos 2 falham). Como reproduzir: `node qa/lar.js` (10 minutos) num checkout do `61dc62b`. Não mexi. |

## 2. Linhas do README (tabela das provas)

| `sabe.js` | `[ONLY=b1,p2] node sabe.js [mundo]` | A tela que respeita o que o personagem sabe (BV-6; D-170 a D-172), em Node, com o `possess.js`, o `interact.js` e o `diario-ui.js`: o bairro desconhecido dito pelo que se vê e sabido no dia seguinte ou por um morador (b1–b3), o bairro da casa, do ofício, da família e o coração, e onde morou (b4), a descrição que segue a vida do bairro (b5), a cidade do chão (b6, L-761); a vila de um bairro só e os povos que nunca se viram (v1), as notícias (v2), a vila do mundo pronto (v3); o estranho sem nome, o nome depois da conversa e da compra, a família inteira, a morte de quem se conhece, a oferta que nomeia, a história de que se é o alvo (p1–p7); as moedas só da própria casa (c1); o deus sabe tudo (g1); trocar de corpo (t1); save no meio, registro danificado, save antigo (s1–s3); as telas não escrevem no mundo (w1, L-760); o bairro some, a casa some, o corpo morre (x1). 1,5 minuto. |
| `sabe-tela.js` | `[ONLY=k4] node sabe-tela.js [pasta das fotos] [mundo]` | O mesmo, escrito na tela, no navegador (3D por software, 8 minutos): a linha do lugar (k1), o letreiro e o «E — …» diante de um estranho e depois da conversa (k2), as fichas e os cartões (k3), a tela desligada pela tecla H e ligada pelo menu, com o jogo seguindo (k4, D-173), os quadros com o mundo parado (k5). Fotos: `sabe-bairro-desconhecido.png`, `sabe-tela-desligada.png`. |
| `sabe-inv.js` | (carregado pelas provas: `extra: ['qa/sabe-inv.js']`) | As regras «sabe» do verificador: o registro `v.ken` de cada pessoa é um registro, pequeno, de ids do mundo, sem repetir e sem a própria pessoa (S1–S3); cada lugar com o dia (nunca um dia que não chegou) e a marca 0 ou 1 (S2); um encontro é de dois (S3). E a seção «sabe» do estado canônico (o save não perde o registro; uma tela que o escreve aparece). |

E na frase do protocolo do `CLAUDE.md` («Mexeu nas atividades, na economia, nos interiores ou no corpo? Também…»): `sabe` (e, no
navegador, `sabe-tela`) cobrem `possess.js` (a porta `knows`), `interact.js` (os cartões e os nomes), `incui.js`, `diario-ui.js`,
`input3d.js` e `modes.js` (a tecla H).

## 3. Entradas do `regress.sh`

- Na fase **fundacao** (as provas em Node), junto do `tempo-livre`: `F sabe sabe.js;`
- Na fase **encarnado** (o navegador), depois do `encarna.js`:
  `(timeout 3600 node sabe-tela.js "$OUT/sabe-fotos" > "$OUT/sabe-tela.txt" 2>&1);`
- O `qa/sabe-inv.js` entra na lista do `qa/junta-inv.js`, para ir para dentro do `qa.js`. Com ele lá, a seção «sabe» entra no
  estado canônico: nas provas que comparam o mundo com e sem um corpo vivido, o registro do corpo é uma diferença esperada.

## 4. Regras novas para o `guard.js`

**55. «o que o personagem sabe é dele»:** o registro `v.ken` só o `possess.js` escreve (os outros perguntam ao `G.Possess.knows`).
```js
// 55. "o que o personagem sabe": o registro do que a pessoa viveu nas mãos do deus (v.ken) só o possess.js escreve — pelo
// Po.meet / Po.dealt e pelo passo do corpo —; os outros perguntam ao G.Possess.knows (D-170)
const KEN_WRITE = /\.ken\s*=(?!=)|\.ken\.(p|q)\s*=(?!=)|\.ken\.(p|q)\.(push|unshift|splice|shift|pop|sort|reverse)\(/;
const KEN_FILES = ['possess.js'];
// (no laço das linhas)
if (KEN_WRITE.test(line) && !KEN_FILES.includes(f)) fails.push(`sabe: ${f}:${k + 1} escreve o registro do que a pessoa sabe (.ken) fora de possess.js: ${line.trim().slice(0, 110)}`);
```
**56. «a tela do corpo pergunta à porta»:** nos arquivos da tela do corpo (`incui.js`, `interact.js`, `diario-ui.js`), as moedas de
uma casa (`.coin`) e o nome de um bairro (`.district`, `districtAt`, `Urban.at`) só se leem numa linha que pergunta à porta
(`knows.` ou o atalho `K.`); e o encontro (`Possess.meet`) só se pede de dentro de um `Possess.apply` (o passo do mundo) ou do
`activity.js` (o `A.commit`).
```js
// 56. "a tela do corpo pergunta à porta" (D-171, D-172): nas telas do corpo, as moedas de uma casa e o nome de um bairro só
// saem numa linha que pergunta ao G.Possess.knows; e um encontro só se pede ao mundo (Possess.apply) ou no feito (activity.js)
const BODY_SCREEN = ['incui.js', 'interact.js', 'diario-ui.js'];
const ASKS = /\bknows\.|\bK\.(house|stock|person|name|call|town|district|where|how)\(/;
// (a linha, ou uma das 8 antes dela, abre um G.Possess.apply( — o encontro do interact.js fica 6 linhas depois dele)
const inApply = (f, k) => { for (let j = k; j >= Math.max(0, k - 8); j--) if (/\bPossess\.apply\(/.test(src[f][j])) return true; return false; };
// (no laço das linhas)
if (BODY_SCREEN.includes(f) && /\.coin\b|\.district\b|districtAt\(|Urban\.at\(/.test(line) && !ASKS.test(line) && !/^\s*\/\//.test(line)) fails.push(`sabe: ${f}:${k + 1} a tela do corpo lê moedas ou um bairro sem perguntar ao G.Possess.knows: ${line.trim().slice(0, 110)}`);
if (/\bPossess\.meet\(/.test(line) && !['possess.js', 'activity.js'].includes(f) && !inApply(f, k)) fails.push(`sabe: ${f}:${k + 1} pede um encontro fora do passo do mundo (G.Possess.apply): ${line.trim().slice(0, 110)}`);
```
As duas foram conferidas com um guard de bolso (o mesmo código, num arquivo à parte, no rascunho do K): **passam no ramo** e, na
base `61dc62b`, **acusam as três linhas oniscientes de antes** (`incui.js:179`, a linha do lugar; `incui.js:344`, o «Onde» da
ficha; `interact.js:556`, as moedas da família).

## 5. Frases para o `CLAUDE.md` (em «As fundações»)

- **O que o personagem sabe — `G.Possess.knows`** (`js/possess.js`, D-170 a D-172): a tela do corpo só diz o que a pessoa vivida
  poderia saber, e pergunta a uma porta só, de leitura — `district(v, q)`, `town(v, set)`, `person(v, o)` (0 estranho, 1 de nome,
  2 íntimo), `house(v, b)`, `stock(v, b)`, `name` / `call` (o nome, ou o que se vê: «um ferreiro»), `where(v)` (a linha do
  lugar), `hears(v, e)` (a notícia). Sem ninguém, o deus: tudo. A porta lê a vida que o mundo já guarda (a família, a casa, o
  ofício, a rua, a biografia, os povos que se encontraram) e o registro `v.ken` (quem a pessoa conheceu de frente, os bairros
  onde esteve) — que só o `possess.js` escreve, dentro do passo do mundo (`Po.meet`, `Po.dealt`; o `guard.js` cobra, regra 55).
  Tela nova do corpo que mostre um nome de pessoa ou de bairro, moedas ou guardados pergunta à porta (regra 56); sistema novo em
  que o corpo trata com alguém de frente põe a pessoa na oferta (`cust`, `to`, `biz`) e o `G.Act.commit` faz o encontro. Nenhuma
  porta de leitura cria nada: para saber se dois povos se encontraram, leia `f.rel[id]` — o `G.Fac.rel` **cria** a relação que
  falta. A tela se guarda com a tecla H (`G.IncUI.setHud`, D-173). `qa/sabe.js` e `qa/sabe-tela.js` provam.
- (na frase do acaso, «Desenho e interface não mudam o mundo») …`G.Urban.valueAt`, pedido de fora do passo, responde pelo
  retrato que a cidade tem e não faz outro (L-760).

## 6. As sabotagens (cada uma numa cópia nova do jogo; a prova rodada lá)

| sabotagem | o que desfaz | caso que acusa | o que a prova disse |
|---|---|---|---|
| s1 | todo bairro é sabido | b1 (e todos os b) | «ninguém com três bairros desconhecidos» |
| s2 | o bairro é sabido no instante em que se pisa | b1, b2 | a tela diz «Chinampas do Norte Nova, Tenochtitlan» de primeira |
| s3 | o encontro não deixa registro | p2 | «Conversar com a construtora» depois da conversa |
| s4 | só o corpo se lembra do encontro | p2 e o verificador (S3 «sabe») | «Atzi também o conhece ()» |
| s5 | quem é do bairro não diz o nome | b3 | depois de falar com a de lá, ainda «Ruas de comércio…» |
| s6 | qualquer um diz o nome do bairro | b3 | quem é de fora já fez a tela dizer «Tianguis» |
| s7 | o estranho tem nome | p1 | letreiro «Atzi», «Conversar com Atzi» |
| s8 | a família não é conhecida | p4 | «15 parentes… (todos inteiros: false)» |
| s9 | na vila os campos não são de todos | v3 | «5 que não sabem os campos» |
| s9b | na vila nem todos se conhecem | v3 | «4 de 182 pares que não se conhecem» |
| s10 | o cartão mostra as moedas de qualquer casa | c1 | «Moedas da família: 7777» na casa alheia |
| s11 | toda casa é a própria (`K.house`) | c1 | «Em casa agora: ninguém · Moedas da família: 7777» |
| s12 | o cartão nomeia os estranhos da casa | c1 | «Moram aqui: Mazatl» |
| s13 | o estoque de outro povo aparece | c1 | «de outro povo SIM» |
| s14 | perguntar pelos povos pelo `G.Fac.rel` | **não acusada** (T-742) | — |
| s15 | o encontro pedido por uma tela é escrito | w1 | «registros iguais: false» |
| s16 | o lugar onde os pés estiveram não é guardado | b2, b4 | no dia seguinte ainda a descrição; «no registro null» |
| s17 | o registro danificado volta como veio | s2 | «o registro do que sabe não é um registro» (3 pessoas) |
| s18 | o feito com alguém não é encontro (`A.commit`) | p3 | depois da compra, «Um mercador» |
| s19 | a ficha de quem acabou de conhecer conta a vida | p2 | «memórias na ficha 6» |
| s20 | toda notícia chega aos ouvidos | v2 | «de Mênfis (povo nunca visto) OUVE» |
| s21 | o L-760 desfeito | w1 | com as telas, outro estado e outro acaso |
| s22 | a oferta guarda o nome do estranho | p6 | «Servir Cuauhtémoc (bebida)» |
| s23 | toda cidade é sabida | v1 | o forasteiro lê «Argos» |
| s24 | quem se conheceu é da encarnação, não da pessoa | t1 | de volta ao primeiro corpo, «Uma fruticultora» |
| s25 | «em casa agora» de qualquer casa | c1 | «Em casa agora: ninguém» na casa alheia |
| s29 | o que se vê ignora a vida do bairro | b5 | depois das fornadas, sem «cheiro de forno» |
| s30 | o L-761 desfeito | b6 | «Campos do Norte, Lavínio» |
| s31 | as histórias que outros tecem aparecem na ficha do alvo | p7 | «na ficha "Quem sou eu" APARECE» (o juramento de Quinto contra Tito) |
| s32 | o que outro está fazendo diz o nome do terceiro | p3 | na ficha: «Indo comprar joias na banca de Tezcatl» |
| s26 | (tela) o letreiro diz o nome do estranho | `sabe-tela` k2 | antes da conversa, letreiro «Tochtli» |
| s27 | (tela) a linha do lugar diz a verdade do mundo | `sabe-tela` k1 | a tela diz «Bairro dos Guerreiros-Águia» |
| s28 | (tela) a tecla não guarda nada | `sabe-tela` k4 | «H: 1 painéis» (devia ser 0) |

Trinta e duas sabotagens: trinta e uma acusadas pelo caso esperado, uma não (s14, T-742). O roteiro delas e o que roda cada uma
numa cópia nova do jogo estão no rascunho da sessão, em `ag/K/` (`sab-sabe.py`, `sab.sh`, `sab-todas.sh`; as saídas em `ag/K/sab/`).

## 7. O que foi conferido rodando (no ramo, com a máquina ocupada pelos outros agentes)

- `node qa/guard.js` — PASSOU (150 arquivos), depois de cada mudança.
- `node qa/soak.js 103 continente 128 4 normal 5 1 1` — 5 anos, nenhuma violação, nenhum erro (duas vezes: antes do primeiro
  commit e no fim).
- `node qa/sabe.js` — 32 linhas, todas passam (1,5 a 3 minutos).
- `node qa/sabe-tela.js` — 8 linhas, todas passam (8 minutos), nenhum erro de página nem de console; as fotos
  `sabe-bairro-desconhecido.png` (a linha «Um quartel e seus muros, bancas — Tenochtitlan») e `sabe-tela-desligada.png`.
- `node qa/det3.js 77 arquipelago 96 3 2` — PASSOU (a geração, A × B, A × C e D iguais).
- `node qa/visual/guarda3d.js ..` — PASSOU (27 arquivos do 3D, 0 avisos).
- As provas vizinhas das mãos do corpo: `taverna-mao.js` (29 passam), `maos.js` (15 passam), `negocio.js` (19 passam, 1 falha: o
  n7, igual na base — T-743).
- `ONLY=e9,e10,e15 node qa/encarna.js` — 32 passam, 0 falham («TUDO PASSOU», 45 minutos com a máquina cheia): as mãos, a
  conversa e a ficha, a interface, os braços e o coração. Rodou no código do segundo commit mais as palavras juntas e a cidade
  no registro; a última mudança (as histórias alheias fora do «Quem sou eu») veio depois e está coberta pelo `sabe.js` p7 e
  pela última rodada do `sabe-tela.js`.
- `node qa/invariancia.js` — 6 passam, 0 falham («INVARIÂNCIA: ok»), no código final.
- `node qa/vida-bairro.js` — 11 passam, 0 falham («TUDO PASSOU»), no código final (o `urban.js` mexido).
- `node qa/visual/corpo-rig.js` — 10 passam, 0 falham; `ONLY=e11 node qa/encarna.js` — 9 passam, 0 falham (o 3D desenha sem
  erro de módulo), no código final.
- `node qa/lar.js` (o corpo entrega o bebê: o feito com alguém, `A.commit` → `Po.dealt`) — 24 passam, 2 falham (l16 e l16b),
  **iguais na base** (T-744).
- O guard de bolso com as regras 55 e 56 — passa no ramo, acusa três linhas na base.
- **Não rodei** (por regra ou por tempo): `regress.sh`, `prontos.js`, a prova de desempenho; `oldsave.js` (precisa de uma pasta
  do jogo antigo); `casa-deus.js`, `urb2.js`, `visual/diario.js`, `visual/baloes.js`, e as outras partes do `encarna.js`
  (rodei a e9, a e10, a e11 e a e15). A máquina reiniciou no fim (provas demais ao mesmo tempo): a única rodada cortada foi a
  do `lar.js` **na cópia da base**, já depois dos dois casos que interessavam; nada do ramo ficou por rodar de novo.

## 8. O que ficou aberto

1. **«Morou» antes de o deus viver a pessoa** não é sabido: o mundo não guarda as casas de antes (`v.moves` só tem o texto). Para
   fechar: uma linha onde a casa muda (`social.js`, `act-casa.js` `move`) anotando o bairro que se deixa — fora do meu escopo.
2. **Os encontros entre duas pessoas do mundo**, sem o corpo, não são anotados (o freguês e o mercador, os dois numa conversa):
   a rua, o ofício, a casa, a biografia e o povoado pequeno fazem as vezes. Quem o deus vive pela primeira vez numa cidade
   grande conhece, de nome, a família, a casa, os vizinhos, os do ofício e os famosos — o resto são estranhos.
3. **A tela desligada esconde também os chamados do mundo** (a guerra, o fogo, a festa): foi de propósito (o lugar tem de dizer
   por si), mas se o dono preferir os chamados ficam — é uma linha a menos no `css/style.css`.
4. **As lápides** continuam dizendo o nome e a morte de qualquer um (está escrito na pedra); e **as notícias** que chegam são as
   linhas da crônica do mundo, com os nomes que ela diz — ouvir um nome não é conhecer o rosto (a pessoa continua estranha).
5. Um estranho de **outro povo da mesma civilização** é dito «um lenhador de Pólis de Argos» (sem o artigo do nome do povo).
6. O painel do deus não mostra «o que esta pessoa sabe» (o `v.ken`): a porta está pronta para isso, não fiz a tela.
7. Com os mundos da geração 20 (com a vida do bairro), olhar de novo as linhas do `sabe.js` b1 e as fotos do `sabe-tela.js`: as
   descrições passam a sair dos perfis de verdade (T-740).
8. `qa/oldsave.js` com uma pasta antiga (o líder); e dois defeitos que já estão na base e não são meus: o `negocio.js` n7
   (T-743) e o `lar.js` l16 e l16b (T-744).
