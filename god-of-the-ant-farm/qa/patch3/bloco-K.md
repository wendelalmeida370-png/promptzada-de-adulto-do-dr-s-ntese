# Bloco do agente K — BV-6, «a tela que respeita o que o personagem sabe»

Ramo: `worktree-agent-a878e9323a48527c3` (base `61dc62b`). Tudo abaixo está pronto para colar; os números são os reservados ao K
(L-760 a L-779, T-740 a T-759, D-170 a D-173, regras 55 e 56 do guard).

**Atenção ao juntar:**
- **O save muda** (pouco): a pessoa ganha a chave `ken` (na lista `SHAPE` do `villagers.js`); só existe em quem o deus viveu ou
  em quem ele conheceu vivendo alguém — nos outros é `undefined` e nem vai para o save. Save antigo abre (o `sabe.js` s3 abre o
  `qa/oldsave_7.json`). **Peço ao líder rodar o `qa/oldsave.js` com uma pasta antiga**, como a regra manda.
- **Mexi em três arquivos fora da tela**, uma linha cada: `js/villagers.js` (a chave `ken` na `SHAPE`), `js/activity.js`
  (`A.commit`: depois do feito do corpo, `G.Possess.dealt(oferta)`) e `js/urban.js` (`U.valueAt`: fora do passo do mundo responde
  pelo retrato que a cidade tem e não faz outro — L-760). Se algum conflitar, o conserto é a linha.
- Uma tecla nova no Modo Encarnado: **H** (a ação `tela`, «Mostrar / esconder a tela»), no `js/input3d.js`.
- Não criei arquivo em `js/`; o `index.html` não mudou.

## 1. Linhas do AUDIT

| D-170 | decisão (do K, BV-6: de onde vem o que o personagem sabe) | A tela do corpo era onisciente: dizia o nome de qualquer bairro, de qualquer pessoa e as moedas de qualquer casa. Agora pergunta a **uma porta só, de leitura, `G.Possess.knows`** (`js/possess.js`): `district(v, q)`, `town(v, set)`, `person(v, o)` / `how(v, o)`, `house(v, b)`, `stock(v, b)`, `name` / `call` / `looks` (como o personagem diz o outro), `seen(q)` (o que se vê de um bairro), `where(v)` (a linha do lugar) e `hears(v, e)` (a notícia que chega aos ouvidos). **Nenhum sistema paralelo de memória:** a porta lê a vida que o mundo já guarda — o sangue (`Po.kin`), a casa (`v.home`), o ofício (`v.job`), a rua (as casas a até 6 casas de distância), a biografia (`v.bio`: com quem se uniu, quem perdeu, com quem aprendeu, quem contou histórias; onde nasceu, chegou, mudou), quem governa e quem tem fama (`f.leader`, `v.hero`, `v.ep`), o que os povos sabem uns dos outros (`f.rel[…].met`). O que o mundo não guardava — «falei com esta pessoa», «estive neste bairro» — ganhou **um registro mínimo na pessoa, `v.ken`**: `p`, quem conheceu de frente (ids, até 40); `q`, os bairros e as cidades onde os pés estiveram (até 16: `[chave, o dia da primeira vez, 1 quando alguém do lugar disse o nome]`; um bairro pelo id, uma cidade por menos o id). Só o `possess.js` escreve, só dentro do passo do mundo (`Po.meet`, `Po.dealt`, o `remember` do `Po.update`); pedido de fora do passo (uma tela), o `Po.meet` não faz nada (`G.inSim`). Vai no save com a pessoa (está na `SHAPE`); um registro danificado é consertado ao abrir (`mendKen`). **O que a pessoa viveu antes de o deus vivê-la vem do que o mundo guardou; o que vive com o deus fica com ela** — e os dois lados de um encontro se lembram. Sem ninguém (o Modo Deus) toda porta responde tudo: o deus sabe. Fica aberto, dito: «morou» num bairro antes da primeira vez que o deus viveu a pessoa não é sabido (o mundo não guarda as casas de antes; precisaria de uma linha onde `v.home` muda, no `social.js` e no `act-casa.js`); e os encontros entre duas pessoas do mundo, sem o corpo, não são anotados (a rua, o ofício, a casa e o povoado pequeno fazem as vezes). Prova: `qa/sabe.js` (30 linhas) e `qa/sabe-tela.js`; invariantes: `qa/sabe-inv.js`. |
| D-171 | decisão (do K, BV-6: o bairro e a cidade) | **Um bairro, pelo nome:** num povoado pequeno (até vila, rank ≤ 2) em que se mora, tudo — os campos com nome também; numa cidade (rank ≥ 3) em que se mora, o bairro da casa, o do ofício, o coração antigo (`k: 'centro'`: todo mundo vai lá) e os da família de sangue e do par (ouviu falar em casa); em qualquer lugar, o bairro onde os pés estiveram **num dia antes de hoje** («esteve lá»), ou cujo nome **alguém do lugar disse** (uma conversa ali com quem o conhece) — na primeira vez num bairro a tela diz o que se vê, e não o nome. **Uma cidade, pelo nome:** a em que mora, as do seu povo, uma onde esteve antes ou que um morador nomeou, uma em que viveu (a biografia) ou a de um povo que o seu já encontrou (ouviu falar); senão, «uma vila», «um acampamento». **O que se vê** (`K.seen`) sai da vida real do bairro: primeiro os perfis (`d.tags`, D-153: «cais cheio de caixas e de carga», «ruas de oficinas, cheiro de forno», «tavernas cheias», «casas vazias»…; o perfil «parado» diz «um cais parado», «oficinas frias»), depois a vocação construída («ruas de comércio», «campos cultivados», «casas grandes de pedra»), depois o que está de pé a poucos passos (uma forja, um cais, bancas) — duas coisas no máximo. A linha do lugar da HUD e a ficha «Quem sou eu» dizem isso; a cidade da linha é a **do chão** onde se pisa (L-761). **As notícias** que chegam de longe só chegam de onde o personagem poderia ter ouvido (uma cidade que sabe nomear, ou sem lugar); as de perto (o que presencia) como antes. Prova: `sabe.js` b1–b6, v1–v3; sabotagens s1, s2, s5, s6, s9, s16, s20, s23, s29, s30. |
| D-172 | decisão (do K, BV-6: a pessoa e a casa) | **Três graus** (`K.person`): **2, íntimo** — a família de sangue (pais, filhos, par, irmãos, avós, tios e os recíprocos), o viúvo e quem mora na mesma casa: a ficha inteira, como antes (as memórias, o jeito, de onde é, as histórias); **1, de nome** — o mesmo teto de ofício, a rua, a própria vida (a biografia), quem encontrou de frente (uma conversa, uma compra na banca, um copo servido ou pedido — `Po.meet` / `Po.dealt`, pela porta do mundo `G.Act.commit`), a fama do seu povo (quem governa, os heróis, quem tem apelido) e, num povoado pequeno, todo mundo: o nome, o ofício, a cidade, o que está fazendo, os feitos públicos, e da família dele só quem o leitor também conhece — **não** as memórias, o jeito nem de onde é; a ficha diz de onde o conhece («da vizinhança», «do mesmo ofício», «de conversa», «pela fama», «do povoado»); **0, estranho** — o que se vê: o ofício pela roupa, a idade em palavras, o povo pelo jeito quando os dois povos se conhecem («um mercador egípcio»), senão «estrangeiro». O estranho não tem nome no letreiro sobre a cabeça, no «E — Conversar com o ferreiro», nos avisos («A ferreira está dormindo.», «O lenhador já está cortando esta árvore.»), nos abraços, nas ofertas do mundo que nomeiam alguém («Servir o agricultor»), no cartão das casas («Moram aqui: 3 pessoas que você não conhece»). Falar com alguém é conhecê-lo: a ficha que abre depois do E já tem o nome (ele disse quem é), e os dois se lembram. **A casa:** as moedas e «quem está em casa agora» só da própria casa (`K.house`); o estoque do povo só no armazém do próprio povo (`K.stock`); a banca continua mostrando os preços (as ofertas do mundo), nunca o pote. O diário já era só do que a pessoa sabe (a própria casa, a própria banca). Prova: `sabe.js` p1–p6, c1, g1, t1; `sabe-tela.js` k2, k3; sabotagens s3, s4, s7, s8, s9b, s10–s13, s18, s19, s22, s24, s25, s26. |
| D-173 | decisão (do K, BV-6: a tela desligada) | Não havia modo sem tela. Agora a tecla **H** (a ação `tela`, que se troca no menu como as outras) e uma caixa no menu de pausa («Mostrar a tela») **guardam a tela**: somem quem sou, o lugar e a hora, a bússola, as notícias, os chamados, a linha e a marca do trabalho, o «E — …», a mira, as dicas das teclas, os botões do canto, o letreiro e a marca sobre a pessoa olhada, e a faixa de entrada. **Ficam**, porque sem eles o jogo quebra ou porque são do mundo: os balões do que as pessoas dizem, as respostas do mundo às mãos (uma recusa precisa ser ouvida), o aviso de como acordar, os botões de toque, o escuro de quem se afoga; as fichas, o menu, a morte e a volta ao deus abrem como sempre, e o E continua fazendo o que as mãos alcançam. A escolha fica guardada no navegador (como as teclas) e vale para o próximo corpo. É o «teste 1» do pedido (reconhecer o lugar sem a tela): a máquina prova que a tela some e o jogo segue; o reconhecimento é do V e do S. Prova: `sabe-tela.js` k4 (e a foto `sabe-tela-desligada.png`); sabotagem s28. |
| L-760 | bug (consertado, K; achado pela prova «as telas não escrevem») | **Com o Diário de Vida aberto logo depois de abrir um save, o mundo vivia outro futuro.** O gancho do diário da casa (`act-casa.js`: «Uma casa para a família: juntadas 12 de 30 moedas») pede o preço de uma casa, `K.price` → `G.Urban.valueAt` → `sim(set)`, que, sem retrato da cidade, **fazia um e o guardava** (`derive`). Num mundo recém-carregado as cidades recebem o retrato de volta uma por passo (`U.update`): com o retrato feito pela tela, a ronda acabava um passo antes, e a conta do dia de «de quem é cada chão» (`cellOwner`) era tirada no instante da tela. Reproduzido: 120 passos da metrópole a partir do mesmo save, com e sem a leitura do diário do corpo entre os passos — estado canônico `5c34ec5a` × `d6ea1573`, e o acaso do mundo diferente. Correção (a regra da fundação: «se uma consulta pode vir de fora do passo do mundo, teste `G.inSim`»): `U.valueAt`, pedido de fora do passo, responde pelo retrato que a cidade tem e não faz nenhum (sem retrato, o valor neutro de sempre, 30 — por até dois segundos depois de um load o diário pode dizer o preço com a terra neutra). No passo do mundo nada muda. Prova: `sabe.js` w1 (o mesmo mundo com e sem «quadros»: idêntico); sabotagem s21 (o conserto desfeito: w1 falha). |
| L-761 | bug (consertado, K; visto na foto da prova) | **A linha do lugar dizia a cidade vizinha.** `Possess.where` dá a cidade pelo meio mais perto; a HUD juntava o bairro (do chão) com essa cidade: num bairro de Tenochtitlan mais perto do meio de Birka, «Bairro dos Guerreiros-Águia, Birka» — e a faixa de entrada «Cuetlachtli · 56 anos · Agricultor · Birka», de alguém de Tenochtitlan. Correção: a linha (`K.where`) diz a cidade **do chão** em que se pisa (a do bairro, ou a do todo da cidade); só fora de qualquer chão de cidade vale a mais perto. Prova: `sabe.js` b6; sabotagem s30. |
| T-740 | limite de teste (aberto, K) | Os mundos prontos da geração 19 são de antes da vida do bairro (nenhum bairro tem perfil): neles o que se vê de um bairro sai da vocação e do que está em volta. O `sabe.js` b5 provoca o perfil pela porta do mundo (`G.Urban.note`, dias de fornadas) para provar que a descrição segue a vida. Com os mundos da geração 20, vale olhar as linhas do b1 de novo. |
| T-741 | limite de teste (aberto, K) | O `sabe-tela.js` roda o 3D por software: 8 minutos com a máquina ocupada. As regras da porta estão todas no `sabe.js` (Node, 1,5 minuto); no navegador fica só o que aparece escrito e a tela desligada. |

(Se o `negocio.js` n7 aparecer como NOVO: ver «6. O que ficou aberto».)

## 2. Linhas do README (tabela das provas)

| `sabe.js` | `[ONLY=b1,p2] node sabe.js [mundo]` | A tela que respeita o que o personagem sabe (BV-6; D-170 a D-172), em Node, com o `possess.js`, o `interact.js` e o `diario-ui.js`: o bairro desconhecido dito pelo que se vê e sabido no dia seguinte ou por um morador (b1–b3), o bairro da casa, do ofício, da família e o coração (b4), a descrição que segue a vida do bairro (b5), a cidade do chão (b6, L-761); a vila de um bairro só e os povos que nunca se viram (v1), as notícias (v2), a vila do mundo pronto (v3); o estranho sem nome, o nome depois da conversa e da compra, a família inteira, a morte de quem se conhece, a oferta que nomeia (p1–p6); as moedas só da própria casa (c1); o deus sabe tudo (g1); trocar de corpo (t1); save no meio, registro danificado, save antigo (s1–s3); as telas não escrevem no mundo (w1, L-760); o bairro some, a casa some, o corpo morre (x1). |
| `sabe-tela.js` | `node sabe-tela.js [pasta das fotos] [mundo]` | O mesmo, escrito na tela, no navegador (3D por software, lento): a linha do lugar (k1), o letreiro e o «E — …» diante de um estranho e depois da conversa (k2), as fichas e os cartões (k3), a tela desligada pela tecla H e ligada pelo menu, com o jogo seguindo (k4, D-173), os quadros com o mundo parado (k5). Fotos: `sabe-bairro-desconhecido.png`, `sabe-tela-desligada.png`. |
| `sabe-inv.js` | (carregado pelas provas: `extra: ['qa/sabe-inv.js']`) | As regras «sabe» do verificador: o registro `v.ken` de cada pessoa é um registro, pequeno, de ids do mundo, sem repetir e sem a própria pessoa; cada lugar com o dia (nunca um dia que não chegou) e a marca 0 ou 1; um encontro é de dois. E a seção «sabe» do estado canônico (o save não perde o registro; uma tela que o escreve aparece). |

E na frase do protocolo («Mexeu nas atividades, na economia, nos interiores ou no corpo? Também…»): `sabe` e `sabe-tela` cobrem
`possess.js` (a porta `knows`), `interact.js` (os cartões e os nomes), `incui.js`, `diario-ui.js`, `input3d.js` e `modes.js` (a tecla).

## 3. Entradas do `regress.sh`

- Na fase **fundacao** (as provas em Node), junto do `tempo-livre`: `F sabe sabe.js;`
- Na fase **encarnado** (o navegador), depois do `encarna.js`:
  `(timeout 3600 node sabe-tela.js "$OUT/sabe-fotos" > "$OUT/sabe-tela.txt" 2>&1);`
- O `qa/sabe-inv.js` entra no `qa/junta-inv.js` (a lista dos `*-inv.js`), para ir para dentro do `qa.js`.

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
if (BODY_SCREEN.includes(f) && /\.coin\b|\.district\b|districtAt\(|Urban\.at\(/.test(line) && !ASKS.test(line) && !/^\s*\/\//.test(line)) fails.push(`sabe: ${f}:${k + 1} a tela do corpo lê moedas ou um bairro sem perguntar ao G.Possess.knows: ${line.trim().slice(0, 110)}`);
if (/\bPossess\.meet\(/.test(line) && !['possess.js', 'activity.js'].includes(f) && !inApply(f, k)) fails.push(`sabe: ${f}:${k + 1} pede um encontro fora do passo do mundo (G.Possess.apply): ${line.trim().slice(0, 110)}`);
// (inApply: a linha, ou uma das 8 antes dela, abre um G.Possess.apply( — o encontro do interact.js fica 6 linhas depois dele)
```
As duas foram conferidas com um guard de bolso (`ag/K/guard-k.js`, no rascunho): passam no ramo e acusam as sabotagens s10 e s27
(a 56) e uma escrita de `.ken` no `incui.js` (a 55). Ver «5. O que foi conferido».

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

## 6. O que ficou aberto

(preenchido no fim — ver abaixo)
