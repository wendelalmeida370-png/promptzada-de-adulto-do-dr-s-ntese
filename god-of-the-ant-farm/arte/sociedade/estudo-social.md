# Estudo — o pilar 2: a inteligência social (a Revolução dos NPCs)

Batedor do arquiteto. Só leitura do repositório; as medições ficam em `exp/` nesta pasta (os scripts `medir.js`, `prontos.js`,
`orcamento.js`, `casais.js` e as saídas — §8). O jogo lido: `/home/user/promptzada-de-adulto-do-dr-s-ntese/god-of-the-ant-farm`
(as referências `arquivo:linha` são dessa pasta; as linhas são as do ramo de hoje, 17/11). Medido com a máquina carregada (load 10–15
em 4 núcleos): os milissegundos valem como proporção, os bytes valem como estão.

**O resumo em dez pontos** (o detalhe nas seções):
1. Já há muito «social» no jogo, mas **espalhado em onze memórias** (§1.3) e **sem laço entre pessoas**: ninguém lembra de quem
   conversou com quem; a conversa e a corte vão ao **mais perto**; o casal nasce de **uma** conversa (62%).
2. A personalidade de hoje são 11 traços nomeados + coragem + a «persona» dos governantes — **e duas delas leem o povo** (`civ`): a coragem
   e a crueldade/agressividade (§4.2, §7.4).
3. O embrião da memória coletiva existe: os **fatos com proveniência e quem os sabe** (`S.saga`, `stories.js`) e o **boato que viaja com
   portador e confiança** (`G.Know`, do mar). A proposta junta-se a eles em vez de fazer um décimo segundo.
4. A proposta: seis eixos de índole + três valores (do `G.hash` do id, metade herdados, ancorados nos traços de hoje), **laços
   dirigidos, esparsos e com teto** (4 números; os dez sentimentos são leituras), **marcas** (quem fez o quê, com saliência), **fama por
   comunidade**, **boatos com parte por cidade e portadores reais**.
5. **O nível de detalhe é por agregação e por importância, nunca pela câmera** (o `det3` proíbe): a multidão sabe por parte da cidade,
   amostrada pelo `G.hash`; quem importa guarda por nome.
6. Custo medido: ~550 B por pessoa (+12,6% no save da metrópole; o arredondar de hoje devolve 99 KB); a passada do dia 1,2 ms o mundo
   inteiro; a escolha com laços **mais barata** que a de hoje (14 contra 69 µs).
7. O casal de hoje se forma aos 17 anos (mediana) — **a fase 1 muda os nascimentos**; o medidor `sociedade-eco` antes de tudo.
8. Quatro fases entregáveis (+ uma fase 0 de portas): índole e laços → memória, fama e o crime entre pessoas → boatos e memória coletiva
   → o corpo social (e a adoção).
9. As portas: um dono para cada estrutura (`soc-indole`, `soc-lacos`, `soc-fama`, `soc-boatos`), os eventos por uma porta só
   (`G.Lacos.ato`, como o `G.Urban.note`), as leituras puras; **o casal ganha uma porta** (`G.Vg.pair`: hoje sete arquivos escrevem
   `partner`); e uma regra do guard **«nenhuma decisão lê a aparência nem o povo»**, com a invariante estatística no medidor.
10. O corpo: os verbos sociais entram pelo registro `G.Interact.verb('pessoa', …)` que já existe; **doze verbos pedem um menu da pessoa**
    (o registro só tem três teclas por alvo) — uma decisão de tela com a 20e.

**Uma escala a lembrar o tempo todo:** um dia do mundo é um ano de vida (`world.js:13`, `G.DAY_LEN = 200` s; a idade cresce
`dt / DAY_LEN`, `villagers.js:479`). Uma pessoa vive ~60 dias do mundo. «Guardar rancor por anos» é guardar por alguns dias do
mundo; «uma amizade de uma vida» dura dezenas de dias. Todo relógio social deste estudo está em dias do mundo.

---

## 1. O que já existe (o inventário social)

### 1.1 A pessoa (`js/villagers.js`, o molde `SHAPE`, `:37`)
Toda pessoa vai inteira no save (`save.js:82` — `Object.assign({}, v)`, menos `path`, `task`, `emo` e as marcas do desenho): **um campo
novo numa pessoa entra no save sozinho, e paga bytes em toda pessoa.**

| Campo | O que é | Quem escreve | Quem lê | Save |
|---|---|---|---|---|
| `traits` | 1–2 de 11 traços nomeados (Corajoso, Medroso, Trabalhador, Preguiçoso, Curioso, Sociável, Devoto, Cético, Romântico, Glutão, Resistente; `:12`). Sorteados no nascimento pelo `G.R`, 40% de herdar um de cada pai (`rollTraits`, `:21`) | `Vg.create` (e o `save.js` conserta) | 35 arquivos (o `decide`, o crime, a política, o medo…) | sim |
| `courage` | 0–1, `G.R` + traço **+ `civ.traits.courage` (o povo)** (`:80`) | `create`, `life.js`, `miracles`, `powers`, `story-lib`, `story-riches`, `wars` | 29 arquivos | sim |
| `pe` | a «persona» dos governantes: `agg`, `cru`, `pie`, `amb` (`politics.js:83`). Do `G.hash(id)` + traços **+ `G.CIVS[civ].persona` (o povo)** + o temperamento do mundo; **escrita na primeira leitura** (`:99`) | `P.persona`, `P.bump` | política, polity, justiça (a postura no cadafalso), segredos, expedições | sim (29–39 B/pessoa: já está em 32% das pessoas da cidade, 57% da metrópole, 77% dos 500 anos) |
| `emo` | o balão do instante (`{k, t}`) | `villagers`, `village` | o desenho | não |
| `fear` | 0–100, cai devagar (`:505`) | 15 arquivos (milagres, guerra, cerco, inverno, justiça…) | 23 | sim |
| `fury` | fúria de guerra | `powers`, `war` | 8 | sim |
| `devotion` | fé, 0–100 | 21 arquivos | 24 | sim |
| `mourn` | o luto, em segundos (cai com o tempo; `:503`) | `village.js:2286` (par, pais, filhos, irmãos pela mãe), `act-lazer`, `beyond`, `expeditions`, `fates`, `interact` (o consolo do corpo) | 12 | sim |
| `partner` / `widow` / `mother` / `father` / `kids` | o parentesco | `villagers.js:1717` (a corte), `village.js` (morte, nascimento), `politics.js:949,1038` (casamentos reais), `fates.js:148` (Amor Divino), `events.js:326`, `main.js:29` (o começo) | 29 | sim |
| `courtCD` | a espera entre cortes | `villagers.js` | — | sim (31 B/pessoa!) |
| `hero`, `ep` (apelido), `reigned`, `ord`, `kills`, `prophet`, `chosen`, `vet` | fama e feitos | `war.js`, `miracles.js`, `politics.js`, `combate.js`, `animals.js`… | o cartão, a política, as histórias | sim |
| `bio` | **a biografia**: até 18 entradas `[dia, código, args…]` (`life.js:25`), as menores saem primeiro (`MINOR`); códigos `born`, `couple`, `child`, `lost`, `war`, `kill`, `hero`, `captive`, `trade`, `story`, `told`, `note` (texto livre, 41 chamadas)… | `life.js` (`L.bio`), `village.js`, `beyond.js` | o cartão, a história do velho à fogueira (`firstPerson`), o `Possess.knows.how` | sim — **o maior campo: 243 B/pessoa na cidade, 391 na metrópole, 512 nos 500 anos** |
| `diary` | o diário de uma vida: até 30 notas de texto livre `{kind: goal/promise/found/rumor/memory/option, txt, day}` (`activity.js:822`, `A.note`) — já tem «promessa» | `activity.js` e os `act-*.js` | o Diário de Vida do corpo (`diario-ui.js`) | sim (103–157 B/pessoa) |
| `ken` | quem a pessoa conheceu de frente **nas mãos do deus** (`p`, 40 ids) e os bairros onde esteve (`q`, 16) | só o `possess.js` (regra 55), pelo `Po.meet` / `Po.dealt` (`possess.js:426,440`) — **só quando o corpo encontra alguém** | só o `G.Possess.knows` (as telas); «nada do mundo decide por ele» (`:508`) | sim |
| `saw` / `seen` | `saw`: a testemunha de um crime (`{crime, day}`, `crime.js:158`); `seen`: vários usos (o deus visto, o fantasma…) | `crime.js`, `story-lib` / 10 arquivos | o crime | sim |
| `thefts`, `hunt`, `jail`, `jailUntil`, `caught` | o ladrão e o guarda | só o `crime.js` | o crime | sim |
| `rebel`, `revolt`, `coup`, `rioted` | a revolta do instante | `politics`, `polity`, `war`, `riots` | — | zerados no save (`save.js:85`) |
| `grp`, `elite` | o estado (povo, artesãos, nobreza…) e a casa mercante | `polity.js:192`, `trade.js`… | a política | sim |
| `secret` | a ordem secreta de que é membro | `secrets.js`, `beyond.js` | 4 | sim |
| `news` | notícias que um portador leva para casa (o mar) | `seaknow.js`, `fishers`, `urban`… | `G.Know` | sim |
| `st` | contas da vida (madeira, comida, pedra, obras) | 50+ | — | sim |

### 1.2 Os sistemas que já são «sociais»
- **A corte e o casal** (`villagers.js:732-742`, `:1696-1725`): `courtTarget` é **o solteiro do outro sexo mais perto** (mesma cidade,
  17–55, idade a até 16 anos, não parente); depois de **uma** conversa de 4 s, vira casal com 62% de chance (85% se um é Romântico).
  Não há memória: ninguém se conhecia antes, e o mesmo par não guarda nada se a corte falha. É o único caminho comum para o casal
  (os outros: os casamentos reais da `politics.js`, o Amor Divino do `fates.js`). **O casal decide a população:** só engravida quem tem
  par na mesma cidade (`tryConceive`, `villagers.js:2050`).
- **A conversa** (`socialTarget`, `:743`): **o mais perto** num raio de 12 casas; o outro para e responde (`'talk'`, 4 s); balão
  «chat». Nada fica. `relativeTarget` (`:752`): a visita a um parente, sorteado. As escolhas do tempo livre (`decide`, `:805-833`)
  pesam um pouco pelos traços (Sociável ×2 na conversa, Romântico na corte, Devoto na reza, Curioso no passeio).
- **Os encontros reais medidos** (`exp/medir.js`, passo normal): na metrópole (944 pessoas) **~490 conversas, cortes e visitas por
  dia do mundo** e ~370 pares novos — meia conversa por pessoa por ano de vida. Nos 500 anos (1067 pessoas), 550 por dia. A vida
  social de hoje é rala: a maior parte do tempo livre vai a trabalho, festa, reza, casa.
- **A taverna** (`act-taverna.js:360-393`): música e **brigas aleatórias entre dois bêbados da mesma mesa** (`G.R() < dt*0.006`),
  2 de dano por golpe, sem memória (o mapa `brawls` é do módulo, zerado no load: `:362`, `:618`). Ninguém faz amigo na mesa.
- **O crime** (`crime.js`): o ladrão tem motivo (`desperate`, `:94`: fome, rua, o hábito, a pobreza entre os ricos; os traços pesam);
  **testemunhas** — quem está acordado a 5 casas vê e guarda `o.saw` (`:155-162`); **a denúncia** — a testemunha conta ao primeiro
  guarda que cruza a 6 casas (`:436-449`), **sempre, sem pesar nada** (o amigo do ladrão denuncia igual); o guarda caça (`hunt`) até
  seis dias (`PRESC`); prisão, cela, fuga. Entre as pessoas do mundo, **só o furto**: a agressão e o homicídio só existem para o golpe do
  corpo (`Cr.assault`, `:173`, D-418). As brigas da taverna não são crime.
- **A política** (`polity.js`): os estados (povo, artesãos, nobreza, mercadores, sacerdotes, militares) com satisfação, pressão,
  pedido e líder (`recount`, `:177`); a satisfação vem dos impostos, da fome, da guerra, **da persona do governante** (`target`, `:157`);
  a revolta escolhe os revoltosos **pelo sorteio + coragem + agressividade** (`Po.uprising`, `:506-530`) — ninguém se junta por ódio
  ao governante ou por amizade ao líder; `set.loyalty` é a lealdade da cidade (26 escritas em 10 arquivos).
- **A justiça** (`justice.js:231` `stance`): a postura de quem assiste a uma execução lê o parentesco (chora), o estado, a lealdade, a
  persona (`cru`, `pie`) e um `G.hash` — é o primeiro lugar onde «o que eu sinto por quem vai morrer» cabe direto.
- **O luto** (`village.js:2283-2292`): o par fica viúvo (`widow`, 1,5 dia de luto), os pais, os filhos e os irmãos pela mãe 0,8 dia; a
  família perto vai ao enterro. Amigos não choram ninguém.
- **Órfãos e adoção:** não há. A criança mora com a mãe ou o pai vivo na cidade (`village.js:2084-2090`); sem os dois, fica onde
  estava. Nos mundos prontos: **61 órfãos de 199 crianças no «mundial»** (guerra), 10 nos 100 anos, 8 na mega (`exp/prontos.txt`).
- **Os apelidos e as lendas:** `P.epithet` (os governantes), `v.hero` (`war.js`: inimigos derrubados), o `lore.js` (o livro do mundo:
  mitos, lendas de heróis e monstros), as histórias.

### 1.3 As memórias e os boatos que já existem (são **onze**, cada um no seu canto)
1. **A biografia** `v.bio` (`life.js:26`) — os fatos de uma vida; contada às crianças em primeira pessoa (`life.js` `firstPerson`).
2. **O diário** `v.diary` (`activity.js:822`) — texto livre, com «promessa» e «rumor» como espécies.
3. **Os fatos e quem os sabe** — `S.saga` (`stories.js:47`): `facts` (o que aconteceu: quem, a quem, onde, como, de qual fato veio — a
   proveniência) e `know[pid] = [[fato, como, dia]]` (até 12 por pessoa; `como` ∈ `viu`, `soube`, `ouviu`, `boato`; `:102-110`). **É o
   embrião da memória coletiva**, mas só se espalha em três casos: a família de um morto (`:212`), a família de um cativo (`:220`), as
   crianças de um conto (`:251`). Os fatos vivem 30 dias se nenhuma história os prende (`prune`, `:690`). Comentário do autor (`:103`):
   «Later: 'acredita', 'suspeita', 'mente', 'engano' — and secrets».
4. **O que cada povo sabe do mundo** — `G.Know` (`seaknow.js:1-20`, `:190-225`): boatos com **origem, confiança, quem ouviu e uma
   afirmação que pode estar errada** (ouro de tolo, baleia tida por monstro); **portadores** (navio, pessoa) levam as notícias até casa
   (`K.note`, `K.bring`, `K.share`). **É o modelo pronto do boato que viaja** — só que do mar e por povo.
5. **A conversa da cidade** — `S.secrets.rumors` (`secrets.js:329-367`): texto, `heat` que esfria 15% ao dia, verdadeiro ou inventado;
   o calor chega ao governante e abre um inquérito; a fofoca **acusa «os estranhos»** (`:362`: o velho, a curandeira, a mulher sozinha
   de mais de 40, **quem é de outro povo** — `v.civ !== f.civ`). Ver §6.4.
6. **O registro do corpo** `v.ken` (`possess.js:510-531`) — só o que o deus viveu.
7. **A notícia do corpo** — a faixa «NOTÍCIA» do Modo Encarnado (`incui.js:212-233`) **é a crônica do deus** (`G.Village.log`) filtrada
   por `Possess.knows.hears` (`possess.js:650`): se a pessoa sabe o nome da cidade, ouve — **na mesma hora, de qualquer distância**.
8. **O crime** — `S.crimes` (60) e `o.saw`.
9. **A vida do bairro** — `G.Urban` (`d.vida`, `d.tags`, `d.hist`, o luto por bairro `U.mourn`, `urban.js:711`; a memória da cidade
   morta `S.urbPast`, `:845`).
10. **O humor dos estados** `f.grp` e a lealdade `set.loyalty`.
11. **A crônica e o livro** — `S.history`, `G.Lore`; os mortos `S.dead` com a biografia (1,6 MB nos 500 anos), esquecidos em 80 anos
    (`V.forget`).

### 1.4 O corpo do jogador hoje
- O provedor `pessoa` (`interact.js:325`): **E = Conversar** (o outro para, responde uma linha de `line()` — `interact.js:280`: pelo
  parentesco, a fome, a doença, o luto, uma história, a guerra —, e dá o cartão `personCard`, que mostra só o que o corpo sabe);
  **F = Dar** (a mochila; `ord: 5`); **E segurado = Abraçar / Consolar** (`I.canHug`: só a família e quem está de luto; consolar
  encurta o luto); **F = Desafiar** (o duelo, `combate-ui.js:274`, registrado pelo `G.Interact.verb`).
- Os feitos do corpo: `S.avatar.deeds` (`possess.js:421`, `DEED` em `:667`: abraço, consolo, dança, conversa, dádiva…), contados à
  biografia no fim (`'god'`).
- O golpe do corpo num dos seus é crime (`G.Crime.assault`), visto e caçado como um furto.

---

## 2. Os números (medidos em Node, máquina carregada: load 10–15 em 4 núcleos — os milissegundos valem como proporção)

| Mundo | Pessoas | Adultos | Save total | Pessoas no save | B/pessoa | Mortos no save | Passo (ms) | Parte das pessoas | µs/pessoa/passo |
|---|---|---|---|---|---|---|---|---|---|
| cidade (dia 17) | 138 | 43 | 1,17 MB | 207 KB | 1 535 | 0,4 KB | 45 | 35% | 115 |
| metrópole (dia 68) | 944 | 506 | 4,09 MB | 1,66 MB | 1 799 | 148 KB | 165 | 54% | 93 |
| 500 anos (dia 501) | 1 067 | 797 | 6,22 MB | 2,09 MB | 2 006 | 1,63 MB | 166 | 72% | 112 |

- Os campos que mais pesam numa pessoa: `bio` (243 → 391 → 512 B), `diary` (103–157), `_wd` (57), `st` (50–55), `pe` (29–39), `courtCD`
  (31), `traits` (28–29), `courage` (28). Os números com 15 casas decimais (`walkPh`, `think`, `scan`, `speed`) custam ~27 B cada:
  arredondar no save economiza mais do que o pilar social vai gastar (ver §4.6).
- Acima de 3 MB o save vai comprimido (`save.js:50`, `BIG`); a metrópole e os mundos de séculos já vão.
- **A população pelas décadas** (`exp/prontos.txt`, do `popHist` dos mundos prontos, sem simular): as cidades crescem até o teto da
  terra e ficam ~1 000–1 100 pessoas por séculos (500 anos: 55 → 802 → 1 041 → … 1 067; 1 000 anos: 1 064 → 1 090 → 965). Mil anos:
  15 441 nascimentos, 14 532 mortes, **7 141 casais** (~2,2 filhos por casal). No «mundial», a guerra derruba de 739 a 451.
- **O casal hoje** (`exp/casais.js` → `casais.txt`, dos mundos prontos): **a idade do primeiro casal é 17 anos na mediana (p10 16, p90
  22–25)** — quase todos se casam no primeiro ano em que podem (`canCourt`: 17), porque basta uma conversa com o solteiro mais perto;
  diferença de idade mediana 2,3–2,9 anos (p90 ~10); 98–99% dos casais da mesma cidade; adultos de 30–62 que nunca tiveram par: 5–10%
  (38 de 256 na metrópole, 48 de 500 nos 500 anos); viúvos sozinhos: 23–61. **É o número que a fase 1 mexe**: uma corte com história
  empurra o primeiro casal para mais tarde, e cada ano a menos da janela fértil (17–46, até 6 filhos, 1,5 dia entre partos —
  `villagers.js:2053-2058`) são menos filhos. Nos mundos velhos a terra segura a população (o teto `capPop`, `:2061`); nos primeiros 60
  anos de um mundo, o crescimento é mais lento — a calibragem é aí.
- **Os mundos prontos** (`worlds/lista.js`): cidade 138 (N 128), metrópole 944, mega 720, mundial 451 (9 povos, 22 cidades),
  100 anos 881, 500 anos 1 067, 1 000 anos 964. **O teto prático é ~1 100 pessoas vivas e ~1 700 mortos lembrados.**

---

## 3. Como uma pessoa decide hoje, e onde a índole e os laços entram

### 3.1 O laço de cada pessoa (`villagers.js:2335-2366`)
A cada passo: `needs` (fome, cansaço, doença, luto, medo, gravidez, velhice — `:473`); a cada 0,3–0,45 s `emergency` (fogo, feras,
inimigos, pânico — `:599`); a cada 1,4–3 s, ou sem tarefa, **`decide`** (`:758`); depois a tarefa corre (`runTask`). O corpo do deus não
decide (`Possess.live`). Prioridades: `pri ≥ 3` não é interrompida pelo `decide` (`:761`); 5 = fuga/fogo; a cela 5,3; o furto 2,05; a
refeição de fome 2,5; o sono 1,2–1,5; o trabalho 1; o lazer 0,3–0,6.

### 3.2 O `decide` é uma IA de utilidade com opções fixas (`:768-851`)
`opt(pontuação, prioridade, tipo)`; ganha a maior pontuação; a tarefa atual só cai se a nova tiver prioridade maior. As opções do tempo
livre usam `G.R()` como ruído e **os traços como multiplicadores** (Sociável na conversa e na taverna, Romântico na corte, Devoto na reza,
Curioso no passeio). Os serviços entram por um molde de fato, não por um registro: cada um tem a sua linha no `decide` — `G.Termas.urge`
(`:824`), `G.Biblioteca.urge`, `G.Praca.urge`, `G.Teatro.urge`, `G.Compras.urge`, `G.Stories.urge` (uma história pede um pouco do tempo
livre, `:813`), `G.Lar.urge` — e o `start` (`:854`) chama o `go` / `task` do módulo.

**Não há porta de ganchos para as pessoas** como os bichos têm (`A.lifeHooks`, `A.senseHooks`, `G.Mente.option`). O que já serve de
gancho: `G.Possess.ask` dentro do `setTask` (`:182`), `G.Crime.keeps` (`:180`), `A.hooks` das atividades (`activity.js:490`: `possess`,
`diary`, `canon`, `tick`, `gone`, `leg`) e os `urge`/`go` de cada serviço.

### 3.3 Onde a índole e os laços entram — por portas, sem bifurcar os módulos
A proposta: **duas portas novas no `villagers.js`, e o resto pelas portas que já existem.**
1. **O peso da índole numa escolha** — `G.Vg.weigh(kind, v)` (um registro: cada módulo social registra um multiplicador por tipo de
   escolha; o `decide` multiplica a pontuação de `social`, `court`, `visit`, `tavern`, `pray`, `explore`, `rest`, `praca`, `teatro`,
   `banho`, `ler`, `work` pelo produto dos registrados). Não muda o **número** de sorteios do `G.R` (o mesmo `G.R()` por opção, só o
   peso muda), então um mundo só se separa do de hoje quando uma escolha de fato muda.
2. **Com quem** — os alvos (`socialTarget`, `courtTarget`, `relativeTarget`, `:732-757`) passam a perguntar a uma porta pura
   `G.Lacos.alvo(v, tipo, candidatos)`: o mais perto continua valendo, mas um amigo a 10 casas ganha de um estranho a 3; quem se
   odeia não se procura. Medido (`exp/orcamento.js`): a busca por cidade com o peso dos laços custa **14 µs** por escolha — **menos** que
   a de hoje (69 µs: percorre o mundo todo).
3. **Uma vontade nova** (a amizade que chama para a taverna, o filho que visita a mãe velha, a reconciliação) entra como os serviços:
   uma opção registrada `G.Vg.want(nome, { urge(v, cur), pri, go(v, H) })` — o mesmo molde do `G.Mente.option` dos bichos e dos `urge`
   de hoje, sem uma linha nova no `decide` para cada uma. Ordem fixa de registro (o determinismo), e cada `urge` puro.

### 3.4 As decisões que a índole e os laços mudam primeiro (o efeito mais visível por linha de código)
| Decisão | Onde está | O que muda | O que se vê |
|---|---|---|---|
| **Com quem se conversa e onde se passa a tarde** | `socialTarget` `:743`, as opções `:806-833` | o extrovertido sai, o introvertido fica em casa ou lê; amigos se procuram; taverna de amigos | grupos fixos à mesa, rodas na praça, o solitário |
| **Quem corteja quem e quem casa** | `courtTarget` `:732`, o casal `:1712-1725` | a corte vai a quem a pessoa já conhece e gosta (`atração`, `afeto`); o «sim» pesa os dois lados | romances que se veem crescer; rejeições; ciúme |
| **Quem denuncia** | a testemunha conta ao guarda, `crime.js:436` | o amigo e o parente do ladrão calam (com a sua honestidade); o inimigo corre ao guarda; o medroso cala diante do valentão | o crime sem castigo, a vingança pela denúncia |
| **Quem briga** | a briga da taverna `act-taverna.js:384` (sorteio entre bêbados) | briga quem tem rancor, pouca amabilidade, muito neuroticismo; a discussão vem antes e pode parar ali | discussões, brigas com causa, rivais |
| **Quem se junta à revolta** | `Po.uprising` `polity.js:510` (`G.R < 0.25 + coragem·0,35 + agg·0,2`) | quem odeia o governante, quem é amigo do líder, quem perdeu alguém para ele | a revolta tem rostos e motivos |
| **Quem ajuda** | não existe | quem vê alguém ferido, faminto ou carregando demais e tem amabilidade ajuda; o ajudado lembra | gratidão, o estranho que vira amigo |
| **Quem adota** | não existe | o órfão vai para quem o conhece e quer (avó, padrinho, vizinho que o alimentava) | a criança acolhida |
| **Quem chora no cadafalso** | `justice.js:231` `stance` (parente, estado, persona) | o amigo chora, o inimigo aplaude, quem ouviu que o condenado era bom vaia | a praça dividida pelos laços |
| **De quem o ladrão rouba** | `victimFor` `crime.js:122` | nunca do amigo; antes do inimigo e do rico odiado | o roubo com motivo |
| **Quem vinga** | a história `vinganca` `story-lib.js:275` (só parentesco) | o amigo íntimo também jura; o filho que odiava o pai não | vinganças de amigos |

---

## 4. A proposta — o modelo de dados e as suas portas

### 4.1 A família de arquivos (como a `fauna-*.js` dos bichos: um dono para cada coisa)
O nome `G.Social` / `social.js` **já é dos sem-teto** (os barracos, `social.js:1-12`) — não usar. Proposta, no molde `fauna-mente` →
`G.Mente`, `fauna-luta` → `G.Luta`:

| Arquivo | Porta | É dono de (só ele escreve) | Puro? |
|---|---|---|---|
| `js/soc-indole.js` | `G.Indole` | `v.indole` (a índole) | as leituras sim; escreve só no nascimento e no load |
| `js/soc-lacos.js` | `G.Lacos` | `v.lacos` (os laços), `v.marcas` (a memória de quem fez o quê) | as leituras sim |
| `js/soc-fama.js` | `G.Fama` | `v.fama` (a reputação por comunidade), `set.memoria`, `f.memoria` (a memória da cidade e do povo) | as leituras sim |
| `js/soc-boatos.js` | `G.Boatos` | `S.boatos` (os boatos), `v.sabe` (quem sabe de qual, quando importa) | as leituras sim |
| `js/soc-vida.js` | `G.Convivio` | nada próprio: os laços que surgem sozinhos (a mesa da taverna, a discussão, a ajuda, a adoção, a corte nova) — chama as portas acima e as do mundo (`setTask`, `G.Crime`, `G.Depot`) | não (é do mundo) |
| `js/soc-verbos.js` | `G.SocVerbos` | os verbos do corpo numa pessoa (pelo `G.Interact.verb('pessoa', …)`) | as mãos; o efeito pelo `Possess.apply` |
| `js/soc-clips.js` (do pilar das animações) | — | os gestos novos pelo `G.ANIM_CLIPS` | só se vê |
| `qa/sociedade-inv.js` (+ `junta-inv.js`), `qa/sociedade.js` (os cenários), `qa/sociedade-eco.js` (o medidor) | — | — | — |

Carregados depois do `villagers.js`, `crime.js`, `polity.js`, `stories.js` (para registrar nos ganchos deles) e antes do 3D.

### 4.2 A índole — `G.Indole` (a fase 1)
- **Os eixos** (0–99, inteiros): os cinco grandes e mais um — **`ext`** extroversão (o introvertido embaixo), **`ama`** amabilidade
  (empatia, generosidade; o agressivo embaixo), **`con`** conscienciosidade (o trabalhador, o autocontrole; o impulsivo embaixo),
  **`neu`** instabilidade (o nervoso, o explosivo, o medroso em cima), **`abe`** abertura (o curioso, quem aceita o estranho), **`hon`**
  honestidade-humildade (do HEXACO: quem não rouba, não trai, não se gaba — o eixo que o crime, a traição e a ambição mais pedem).
  **Os valores** (lentos, também 0–99): **`amb`** ambição (poder, riqueza, status), **`fe`** devoção/tradição, **`lea`** lealdade (aos
  seus: família, amigos, povo).
- **As facetas que o dono pediu são leituras puras**, não campos: empatia = `ama` com `neu` baixo; agressividade = `100 − ama` com `neu`
  e a coragem; generosidade = `ama` e `hon`; impulsividade = `neu` e `100 − con`; desconfiança = `100 − ama`, `neu`, `100 − abe`;
  ambição = `amb`. `G.Indole.faceta(v, 'agressivo')` → 0..1.
- **De onde vem** (o determinismo e os saves de antes): **nunca do acaso do mundo** — tirar do `G.R` no nascimento desloca o acaso de todo
  mundo novo. Do **`G.hash` do id** (como a personalidade dos bichos, `fauna-mente.js:126` `Me.trait`, e a persona de hoje,
  `politics.js:86`) e, para quem nasce depois da fase 1, **metade herdada**: `eixo = 0,45 · média(pai, mãe) + 0,55 · hash(id, eixo)`
  (a herdabilidade da personalidade é ~0,4–0,5), gravado em `v.indole` no `Vg.create` (`villagers.js:74`). **Ancorado nos traços de hoje**
  (a pessoa continua a mesma): Sociável +ext, Romântico +ext +ama, Trabalhador +con, Preguiçoso −con, Curioso +abe, Medroso +neu,
  Corajoso −neu, Devoto +fe, Cético −fe, Glutão −con. Num save de antes (sem `indole`): calculado no load pela mesma conta sem os pais
  (hash + traços) — a mesma pessoa tem a mesma índole em toda carga. Gravado (~24 B/pessoa medidos) para a herança valer depois que
  os pais são esquecidos (`V.forget`, 80 anos).
- **Nunca da aparência nem do povo**: nem `skin`, `hair`, o rosto, o corpo, nem `civ`. Hoje há três pontos do jogo que o arquiteto
  precisa decidir (§6.4): a coragem tem `+ civ.traits.courage` (`villagers.js:80`; os nórdicos +0,15); a persona tem
  `+ G.CIVS[civ].persona` (`politics.js:89`; `civs.js:21,43,66,89,111` — os astecas `cru` +0,1, os nórdicos `agg` +0,1); a fofoca acusa
  quem é de outro povo (`secrets.js:362`). Proposta: a persona (`agg`, `cru`, `pie`, `amb`) passa a ser **lida da índole** (`agg` de
  `100−ama`, `neu` e a coragem; `cru` de `100−ama` e `100−hon`; `pie` de `fe`; `amb` de `amb`) e o viés do povo vai para **a
  instituição** (a lei e o regime: o `G.Powers.lawPe`, `politics.js:102`, já faz isso para a lei) — a cultura muda o que o regime faz,
  não quem a pessoa é. **Isso muda o equilíbrio dos governantes** (guerra, crueldade, sacrifício): uma fase própria, medida.
- **O temperamento e o humor:** o temperamento é `ext` e `neu`. O humor é **uma leitura pura** (`G.Indole.humor(v)` → −1..1): a fome, o
  cansaço, a doença, o luto, o medo, a bebida (`v.drunk`), as marcas recentes (§4.4), o tempo, pesados pelo `neu`. Nada guardado (um
  humor guardado seria mais um campo em mil pessoas e mais uma coisa para o load conferir). O humor pesa nas escolhas (quem discute,
  quem aceita um convite) e é o que a animação lê para a postura.
- **A índole muda devagar** (fase 2): a guerra, a perda de um filho, um casamento longo e bom, a prisão. Só o `soc-indole.js` escreve,
  por eventos (`G.Indole.vive(v, 'guerra')`), com teto de mudança por evento e por vida.

### 4.3 Os laços — `G.Lacos` (a fase 1)
- **O dado:** `v.lacos = [[id, afeto, confiança, respeito, atração, dia, bits], …]` — inteiros −100..100 (a atração 0..100), `dia` o
  último contato, `bits` (conheceram-se de frente, colegas de ofício, vizinhos…). **Dirigido**: cada um guarda o que sente pelo outro (a
  paixão não correspondida existe). **Esparso e com teto**: 16 para um adulto, 8 para uma criança; cheio, sai o laço mais fraco que não
  é de família nem tem marca viva. **A família é implícita**: o que um filho sente pela mãe por ser filho (`G.Lacos.base(v, o)`, puro, do
  parentesco que o mundo já guarda) não ocupa lugar; o laço gravado é só o que a vida mudou disso — o pai que bateu, a filha querida.
- **Os sentimentos que o dono listou são leituras desses quatro números e das marcas** (`G.Lacos.sente(v, o)` →
  `{ afeto, confianca, respeito, atracao, rotulos }`): **amizade** (afeto ≥ 30 e confiança ≥ 20), **amor** (atração ≥ 40 e afeto ≥ 40),
  **paixão** (atração alta, afeto ainda pouco), **ódio** (afeto ≤ −50), **rivalidade** (afeto < 0, respeito ≥ 20, e disputam algo: o
  mesmo ofício, a mesma pessoa, o mesmo posto), **admiração** (respeito ≥ 50), **respeito**, **confiança**, **inveja** (afeto baixo,
  respeito alto, o outro acima em riqueza, ofício ou fama — e `amb` alta, `hon` baixa), **ressentimento** (uma marca de ofensa viva),
  **indiferença** (nenhum laço). Guardar dez números por par custaria o dobro e não diria mais.
- **Como evolui — só por eventos**, pela porta única `G.Lacos.ato(a, b, tipo, o)` (só dentro do passo do mundo, `G.inSim`, como o
  `G.Urban.note`): `conversa`, `mesa` (beberam juntos), `trabalho` (o mesmo posto, fechado no dia), `ajuda`, `dadiva`, `consolo`,
  `elogio`, `insulto`, `discussao`, `briga`, `agressao`, `furto`, `traicao`, `salvou`, `denunciou`, `matou-meu`, `promessa-cumprida`,
  `promessa-quebrada`, `casamento`, `separacao`. Cada tipo tem a sua tabela (quanto muda cada eixo, dos dois lados), **pesada pela índole
  de quem sente** (o amável perdoa mais depressa, o nervoso guarda) e pela **compatibilidade** (`G.Indole.par(a, b)`: extrovertidos se dão,
  valores parecidos aproximam — puro, do `indole`). **O tempo esfria**: na volta do dia da cidade (`G.mod`, como `social.js:48` — uma cidade
  por passo, a vez de cada uma no save), cada eixo volta um pouco para a base (o afeto de um conhecido some em ~15 dias sem contato; a
  confiança mais devagar; o ódio sustentado por uma marca não cai abaixo dela). Custo medido: **1,2 ms a metrópole inteira**, uma vez por
  dia do mundo.
- **As consequências** (§3.4): o alvo da conversa e da corte, o «sim» da corte, a denúncia, a briga, a revolta, a vingança, a ajuda, a
  postura no cadafalso, a vítima do ladrão, **o luto do amigo** (`village.js:2288` passa a pôr luto curto em quem tinha afeto alto pelo
  morto), a fala com o corpo.

### 4.4 A memória de quem fez o quê — as marcas (`v.marcas`, do `G.Lacos`; a fase 2)
- `v.marcas = [[tipo, quem, dia, peso, extra], …]`, até **8**, a de menor peso sai. Tipos: `salvou`, `ajudou`, `deu`, `consolou`,
  `humilhou`, `insultou`, `bateu`, `roubou`, `traiu`, `matou` (alguém meu: `extra` = o morto), `denunciou`, `prometeu` (`extra` = o quê,
  até quando), `deve` (`extra` = quanto: a dívida em moedas é um movimento do `G.Depot` — a marca é só a lembrança dela), `ensinou`.
- **A saliência esquece pela índole**: a meia-vida de uma humilhação é curta no amável e longa no nervoso de pouca amabilidade — «guardar
  rancor por anos» é uma marca de peso alto que dura dezenas de dias do mundo. O peso segura o laço (o ódio não esfria enquanto a marca
  vive) e **decide**: a reciprocidade (quem foi ajudado ajuda), a vingança (a `vinganca` da `story-lib` passa a ler a marca `matou`, não só
  o parentesco), a denúncia (quem foi roubado e sabe por quem), a recusa (não se empresta a quem não pagou), a fala com o corpo.
- **Não duplica a biografia** (`v.bio`, os fatos de uma vida contados ao mundo) **nem o diário** (`v.diary`, o texto do corpo): a marca é
  a memória **de relação** — curta, com ids, e que decide. A biografia ganha a linha quando a marca é grande («salvou a minha vida»).

### 4.5 A reputação e a memória coletiva — `G.Fama` (a fase 2)
- **Por pessoa e por comunidade**: `v.fama = [[comunidade, renome, estima, rótulos], …]` (até 4: a cidade de casa, o povo, e as cidades
  aonde a fama chegou pelos boatos). `renome` 0..100 (quantos ali sabem quem é), `estima` −100..100, `rótulos` em bits (herói, salvador,
  generoso, curandeiro, valente; assassino, ladrão, traidor, covarde, cruel, abusador). **Sai dos boatos** (§4.6) — a fama numa cidade é
  o que se diz ali, verdadeiro ou não — e da posição (governante, herói de guerra: o `hero`, `ep`, `kills` de hoje). Leitura pura:
  `G.Fama.de(v, set)`; e a recepção de um estranho: `G.Fama.recebe(o, v)` — `o` sabe da fama de `v`? (a amostra do §4.6) e o que acha
  (a estima, pesada pela índole de `o`: o desconfiado pesa o ruim).
- **A memória da cidade e do povo**: `set.memoria` e `f.memoria` (até 12 lembranças cada: `[tipo, sujeito, dia, peso, fato]` — o herói do
  cerco, o assassino temido, o nobre odiado, o grande incêndio, a fome, a peste), feitas dos boatos que chegaram a quase todos, do
  `S.saga.facts` (a verdade) e do que já existe (o luto do bairro `U.mourn`; a vida do bairro `d.tags`; o `S.urbPast`). Uma lembrança de
  peso alto não esfria: morto o sujeito, passa ao **livro do mundo** (`G.Lore`, as lendas — já existe). Consequências: o medo coletivo
  (um assassinato sem castigo: menos gente na rua à noite, menos taverna, a confiança em estranhos cai — pesa no `G.Lacos.base` de quem
  não se conhece), o ódio ao governante (a satisfação dos estados, `polity.js:157` `target`, ganha um termo do `f.memoria`), a lenda.

### 4.6 Os boatos — `G.Boatos` (a fase 3)
- **O dado do mundo** (`S.boatos`, até ~120, os frios saem): `{ id, k (tipo), a (de quem se fala), b (a quem), fato (o id em
  `S.saga.facts` ou em `S.crimes`: a verdade fica no mundo, a regra de ouro do `stories.js:22-24`), d (nasceu), o (quem contou primeiro),
  at: { cidade: [parte que sabe 0..1, fidelidade 0..1, versão] }, port: [quem o leva para outro lugar] }`.
- **A fonte dos boatos é o observador que já existe**: o mundo já chama `G.Stories.signal(tipo, dados)` em mais de 40 momentos (morte,
  captura, roubo — `robbery` —, testemunha, sentença, motim, revolta, conspiração, caça às bruxas, palácio, naufrágio, primeiro contato…),
  e o `stories.js` faz deles **fatos** com proveniência e testemunhas (`f.w`, `f.kn`). Mas o observador tem **um tratador por tipo**
  (`St.observe = (k, fn) => { OBS[k] = fn; }`, `stories.js:145` — um segundo apaga o primeiro). Proposta mínima no `stories.js`: uma lista de
  ouvintes dos fatos oferecidos (`St.listen(fn)`, chamada no fim do `offer`, `:153`), por onde o `G.Boatos` recebe cada fato com as suas
  testemunhas — sem um segundo observador, e o boato aponta para o fato (a verdade).
- **Quem sabe — o nível de detalhe por agregação** (a ideia que faz caber mil pessoas): **quem importa sabe por nome** — a testemunha
  (`viu`), a família do sujeito e da vítima (`soube`), quem ouviu do corpo ou falou com ele, os portadores — em `v.sabe` (até 6 ids,
  como o `know` do `stories.js`, que guarda 12); **a multidão sabe por parte**: `G.Boatos.sabe(v, r)` = está em `v.sabe`, ou
  `G.hash(v.id · K + r.id) < parte(cidade de v) · (0,5 + 0,5 · ext)`. Pura, determinística, sem um byte por pessoa — o molde da
  «sorte do dia» da freguesia (`lot`: o `G.hash` da pessoa e do dia, D-200; o guard já cobra que seja hash, regra 69).
- **A circulação**: dentro da cidade, uma vez por dia (a volta do dia da cidade), a parte cresce como um contágio
  (`parte += r · parte · (1 − parte)`, com `r` da vida do bairro — a taverna, a troca, a praça: `G.Urban` `d.vida` — e da saliência do
  tipo; um assassinato corre mais que um furto) e depois se esquece. **Entre cidades, por portadores reais**: o mercador da caravana
  (`trade.js`), a tripulação que pisa o cais (`G.Naval.crewHome`), quem se muda, o soldado que volta, o emissário — o molde do `G.Know`
  do mar (`seaknow.js:190` `K.note`, `K.bring`): o portador leva os boatos fortes de onde sai e os semeia onde chega. O dia da cidade e a
  chegada do portador acontecem iguais no salto e no passo.
- **A confiabilidade e a distorção**: cada passagem (de pessoa a pessoa, de cidade a cidade) baixa a fidelidade; abaixo de limiares, a
  versão muda **por regras com causa**, escolhidas pelo `G.hash(boato, cidade)`: o exagero (agressão → morte; um ferido → três), o motivo
  inventado, **o culpado trocado — por alguém que a cidade já tem por suspeito pelo que fez** (a fama de ladrão, uma inimizade conhecida),
  **nunca pela aparência nem pelo povo**. A verdade não muda (o fato), e um boato pode ser **desmentido** (a testemunha fala, o
  julgamento acontece: a versão volta à verdade e quem o espalhou perde confiança).
- **As consequências**: a fama (§4.5) segue o que se diz em cada cidade; o medo, o ódio, a revolta (o calor do `secrets.js` vira um caso
  deste: a fase 3 junta os dois); o guarda que ouve procura (com o prazo de hoje, `PRESC`); a família que ouve jura (o `St.learn` com
  `boato`).
- **O corpo**: a faixa «NOTÍCIA» (`incui.js:212`) deixa de ser a crônica do deus filtrada e passa a ser **o que se diz em volta**: o
  boato chega ao corpo quando a pessoa vivida sabe dele (pelo nome ou pela parte da cidade), na versão dali — «Dizem que…». Conversar
  (o E) com quem sabe conta um boato (a pessoa vivida passa a sabê-lo por nome). A crônica do deus continua a verdade.

### 4.7 As portas — quem escreve o quê (as regras do guard propostas)
(Os nomes foram conferidos para as regras de texto do guard não acharem o que não é delas: `.indole`, `.lacos`, `.marcas`, `.fama`,
`.sabe`, `.tutor`, `.memoria` não existem hoje em nenhum `js/*.js`; `.pz` e `.memo` existem — `justice.js:396` `c.pz`, `people3d.js:2129`
`s.pz`, `mira3d.js:161` `s.memo` — e por isso não servem.)
- **«a índole é do soc-indole.js»**: `v.indole` só ele escreve (no `Vg.create`, por `G.Indole.nasce(v, mãe, pai)`, e no load pelo conserto
  dele num `G.saveHooks`). Como as regras 96/97 dos bichos (`guard.js:864-875`).
- **«os laços e as marcas são do soc-lacos.js»**: `v.lacos`, `v.marcas` só ele; o mundo avisa pelo `G.Lacos.ato` (só dentro do passo:
  fora dele não faz nada e conta, como o `Possess.meet`, `possess.js:426`).
- **«a fama e a memória da cidade são do soc-fama.js»**: `v.fama`, `set.memoria`, `f.memoria`.
- **«o boato é do soc-boatos.js»**: `S.boatos`, `v.sabe`; e **a faixa de notícia do corpo pergunta ao `G.Boatos`** (como a regra 56
  cobra o `knows`).
- **«as leituras sociais são puras»**: `sente`, `base`, `par`, `humor`, `faceta`, `de`, `recebe`, `sabe`, `alvo` não escrevem nem tiram
  do acaso (o molde da regra 51 do `G.Atmos`); o que só se vê (o 3D, a tela) só chama essas.
- **«nenhuma decisão lê a aparência»** (o pedido do dono): nos `soc-*.js` e nas funções de decisão moral listadas (o `desperate` e o
  `victimFor` do crime; o `uprising` e o `standing` da polity; o `stance` da justiça; a `gossip` dos segredos; os alvos e o «sim» da
  corte), nenhuma linha lê `.skin`, `.hair`, `.kidCloth`, `.robe`, os campos do corpo e do rosto que o pilar dos personagens criar (a lista
  dele, num `G.Look.FIELDS` que o guard importa), nem `.civ` / `CIVS[` (o nome e a língua, sim: `G.Civ.personName`, as falas). Uma regra de
  texto como as outras: acha o corpo da função pelo nome e procura os campos. **O guard não prova a ausência de correlação** (uma
  escolha que lê `v.role` herda o que o ofício herda do povo); por isso também **uma invariante estatística no medidor** (§5.3): nenhum
  povo mais «criminoso», «cruel» ou «odiado» que outro à mesma condição (fome, rua, guerra).
- **«o casal tem uma porta»**: hoje sete arquivos escrevem `partner` (§1.1). Proposta: `G.Vg.pair(a, b, como)` / `unpair(v, como)` no
  `villagers.js` (a biografia, a estatística, o laço `casamento`), e o guard só deixa escrever `.partner` ali. É o que dá ao casamento
  proposto pelo corpo, à separação e à traição um lugar só.

### 4.8 Os laços que surgem sozinhos (os ciclos, `soc-vida.js`, cada um com a sua causa no mundo)
1. **A mesa da taverna → a amizade**: quem bebe à mesma mesa (`op.data.mesa`, `act-taverna.js`) ganha `mesa` uns com os outros, uma vez
   por noite (fechado quando a pessoa sai). Amigos chamam amigos para a taverna (um `want`).
2. **A discussão → a briga → a agressão**: entre dois com afeto negativo (ou bêbados de pouca amabilidade), a discussão (o ato `argue`,
   as falas); com raiva alta, a briga (a de hoje, agora com causa); o golpe que fere grave ou mata é crime de verdade —
   `G.Crime.assault` (`crime.js:173`) passa a valer **entre as pessoas do mundo** (hoje é só do corpo), com as testemunhas e a caça de hoje.
3. **A amizade que vira rivalidade**: dois amigos que disputam a mesma pessoa, o mesmo posto (o `tradeLog`) ou a mesma herança.
4. **O amor → a corte → o casamento** (pela porta do casal): a atração nasce do encontro e da compatibilidade; a corte vai a quem se
   conhece; o «sim» é dos dois. **A traição**: um casado com atração alta por outro (e `hon`, `lea` baixas) pode ter um caso; visto, é
   boato (§4.6), marca `traiu` no par, e pode acabar no `unpair`.
5. **O trabalho perdido → a dificuldade**: quem o repartidor tira do ofício (`village.js` `took`) e fica sem posto, ou sem casa (o
   `social.js`), ganha humor baixo; a família ajuda, o amigo empresta (`deve`), ou a pessoa vira o ladrão do `desperate`.
6. **A criança e o bicho**: o cão da casa (`pets.js`) — um laço com o bicho (o `G.Lacos.ato` aceita um bicho como `b`, teto de 1–2),
   lido pelo `pets.js` e pelas brincadeiras.
7. **Ajudar um estranho → o respeito**: quem passa por alguém ferido, faminto ou caído com carga e tem `ama` alta ajuda (leva ao
   curandeiro, dá comida pelo `G.Depot`); o ajudado ganha a marca `ajudou`; a testemunha conta — fama de bom.
8. **O assassinato → o medo → a investigação → a denúncia**: o homicídio (do 2) nasce como o furto (testemunhas, `o.saw`, o guarda), e
   agora o boato, o medo da cidade, a denúncia pesada pelos laços, a família que jura (`vinganca`).
9. **O nobre que cobra demais → o ódio → a revolta**: o imposto alto, o confisco, a execução injusta viram boatos e `f.memoria`; o ódio ao
   governante (o afeto da multidão, por amostra) pesa na satisfação (`polity.js:157`) e em quem se levanta (`Po.uprising`).
10. **O guerreiro que salva a cidade → a lenda**: a defesa que vence (`war.js`, `siege.js`), o salvamento visto → o boato heroico corre, a
    fama sobe, o `set.memoria` guarda; morto, vai ao `G.Lore`.
11. **O órfão → o vínculo → a adoção**: a criança sem pai nem mãe vivo na cidade ganha laço com quem cuida dela (a avó, a vizinha que a
    alimenta, o padrinho) e o dia da cidade a dá a quem tem o maior afeto e casa (fase 4: precisa de uma porta de tutela, `v.tutor`, que o
    `assignHousing`, o `familyOf`, o `canSend`, o `kin` das histórias e o `Possess.kin` passem a ler — a parte mais espalhada do pilar).
12. **O velho nos últimos dias com a família**: a velhice alta (`villagers.js:510`) faz os filhos visitarem mais (a `visit` pesa o afeto e
    a idade), e a família à porta (o `familyTask` da `life.js`) chama quem tem laço.
13. **A família na guerra**: o luto, o medo, a marca `matou` contra o povo inimigo (um rancor coletivo no `f.memoria`) — que o `St.warLean`
    e a política já leem.

### 4.9 O corpo do jogador — os verbos sociais (fase 4)
- **Pelo registro** `G.Interact.verb('pessoa', { id, k, label, can, run, ord })` (`interact.js`, D-395; a regra 141 cobra), num arquivo
  próprio (`soc-verbos.js`), cada `run` pedindo o efeito ao mundo pelo `G.Possess.apply` (o golpe e o crime já fazem assim) e contando o
  feito (`Possess.deed`, `DEED` em `possess.js:667`).
- **Os verbos**: Cumprimentar (aceno), Conversar (o E de hoje — e agora conta um boato que a pessoa sabe, e a fala lê o laço, a fama e a
  memória: «Você me ajudou no inverno…»), Elogiar, Abraçar (o de hoje, liberado pelo afeto além da família e do luto), Beijar (atração
  e afeto dos dois lados; visto, e um deles casado → boato de traição), Discutir, Insultar, Ameaçar, Convidar para beber (na taverna: os
  dois vão, o corpo paga a rodada pelo `G.Depot`, a mesa dá `mesa`), Pedir ajuda (uma mão num trabalho ou numa carga: aceita pelo afeto,
  a `ama` e as dívidas; nasce `deve`), Dar presente (o «Dar» de hoje ganha o efeito no afeto pelo valor e pelo desejo), Pedir em
  casamento (`G.Vg.pair`), Reconciliar (precisa de uma marca de ofensa; um presente ajuda), Desafiar (o duelo de hoje), Adotar (4b).
- **As reações**: `G.SocVerbos.reage(o, corpo, verbo)` → `{ aceita, fala, ato, efeito }`, pura, da índole de `o`, do laço, das marcas, da
  fama da pessoa vivida na cidade de `o`, do humor e de quem está olhando (o insulto diante dos amigos dele dói mais; um amigo do corpo,
  perto, o defende — um `want` de defender). **Os efeitos no passo do mundo**: `G.Lacos.ato`, `G.Boatos` (o que a testemunha conta),
  `G.Crime` (a ameaça, o golpe), `G.Depot` (a rodada, o presente). As falas pelo molde do `act-falas.js` (por povo, escolhidas pelo
  `G.hash` do momento — as palavras não mudam o mundo).
- **Um problema de tela a decidir** (§7): o registro tem três teclas por alvo (`usar` E, `outra` F, `segurar` E segurado; o resto vai a
  `offer().more`). Doze verbos sociais pedem **um menu da pessoa** (o cartão do E com os verbos de agora, por número ou toque) ou uma roda
  no F segurado — uma extensão do `interact.js` / `incui.js` (dono: a 20e), pequena e dita.

### 4.10 As alternativas que pesei (e por que a proposta escolheu)
| Questão | Alternativa | Custo / problema | Escolha |
|---|---|---|---|
| De onde vem a índole | sortear pelo `G.R` no nascimento | desloca o acaso de todo mundo novo; os saves de antes não têm | **`G.hash` do id + metade herdada, gravado**; nos saves de antes, calculado no load |
| Onde mora a herança | recalcular pelos pais | os pais são esquecidos em 80 anos (`V.forget`) e a conta vira recursiva | **gravar `indole`** (24 B) |
| Os laços | matriz densa por cidade | N² (148² = 22 mil por cidade; o mundo de mil: ~1 milhão), no save | **listas esparsas dirigidas com teto** |
| Os sentimentos | dez números por par | o dobro dos bytes, e números que se contradizem | **4 eixos + marcas; os dez sentimentos são leituras** |
| A opinião | soma de modificadores com prazo (à moda do CK3) | cada modificador é uma entrada no save; sem teto, cresce | **eixos que esfriam + marcas com saliência (o porquê)** |
| O humor | um número guardado | mais um campo em mil pessoas e no load | **leitura pura** |
| Quem sabe de um boato | uma lista por pessoa | mil pessoas × centenas de boatos | **parte por cidade + `G.hash` + quem importa por nome** |
| A fama | calculada na hora pelos que sabem | varrer a cidade a cada encontro | **guardada por comunidade (4), refeita pelo dia dos boatos** |
| O nível de detalhe | pela câmera | o mundo muda pelo olhar (o `det3` proíbe) | **por agregação e por importância** |
| A fonte dos fatos | um segundo observador | o `St.observe` só aceita um por tipo | **uma lista de ouvintes no `offer` do `stories.js`** |
| Onde mora o social | dentro do `stories.js` (que já tem fatos e saber) | o motor de histórias é narrativa; o social é simulação que decide | **arquivos próprios; as histórias leem o social** (a `vinganca`, a salência dos arquétipos) |
| O casal | continuar com sete escritores | a traição, a separação e o casamento do corpo sem lugar | **a porta `G.Vg.pair` / `unpair`** |

### 4.11 O esboço das portas (assinaturas, para o arquiteto conferir)
```
G.Indole.nasce(v, mae, pai)        // só no Vg.create: v.indole = [ext, ama, con, neu, abe, hon, amb, fe, lea]
G.Indole.de(v) → {ext, ama, …}     // puro; num save de antes, o load já gravou
G.Indole.faceta(v, 'agressivo'|'empatico'|'generoso'|'impulsivo'|'desconfiado'|'ambicioso') → 0..1   // puro
G.Indole.humor(v) → -1..1          // puro: necessidades, luto, medo, bebida, marcas recentes, tempo × neu
G.Indole.par(a, b) → -1..1         // puro: a compatibilidade
G.Indole.vive(v, evento)           // fase 2: a vida muda a índole (só no passo)

G.Lacos.ato(a, b, tipo, o?)        // a porta única dos eventos (só no passo: G.inSim); muda os dois lados pela tabela do tipo
G.Lacos.sente(v, o) → {afeto, confianca, respeito, atracao, rotulos: ['amizade', 'rivalidade', …]}   // puro (base + gravado + marcas)
G.Lacos.base(v, o) → {…}           // puro: o que o parentesco, a casa e o ofício dão
G.Lacos.alvo(v, 'conversa'|'corte'|'visita'|'ajuda'|'briga', candidatos) → pessoa | null   // puro
G.Lacos.de(v, rotulo) → [ids]      // puro: os amigos, os inimigos, quem ama
G.Lacos.marca(a, tipo, quem, peso, extra)   // fase 2 (só no passo)
G.Lacos.lembra(v, quem?) → [marcas]         // puro

G.Fama.de(v, comunidade) → {renome, estima, rotulos}   // puro
G.Fama.recebe(o, v) → {sabe, estima}                   // puro: como o estranho o recebe
G.Fama.memoria(set | f) → [lembranças]                  // puro

G.Boatos.nasce(fato, testemunhas)  // pelo St.listen (só no passo)
G.Boatos.sabe(v, r) → false | 'viu'|'soube'|'ouviu'|'boato'   // puro: v.sabe ou a amostra G.hash < parte
G.Boatos.versao(r, set) → {k, a, b, exagero, culpado}  // puro: o que se diz ali
G.Boatos.leva(portador, de, para)  // o portador chega (só no passo)
G.Boatos.doCorpo(v) → [linhas]     // puro: a faixa de notícia do corpo

G.Vg.weigh(kind, fn(v) → mult)     // registro (ordem fixa)
G.Vg.want(nome, {urge(v, cur), pri, go(v, H)})   // registro (ordem fixa)
G.Vg.pair(a, b, como) / G.Vg.unpair(v, como)    // a porta do casal
St.listen(fn(fato))                // stories.js: os ouvintes dos fatos
```

### 4.12 As invariantes (`qa/sociedade-inv.js`, o sistema «sociedade»)
- S1: `indole` de toda pessoa: 9 inteiros 0–99 (S1 se falta numa pessoa depois do load).
- S1: laços — no máximo 16 (adulto) / 8 (criança); ninguém com laço consigo; ids de pessoas vivas (os mortos saem na passada do dia: S3
  se um morto ficou mais de dois dias); inteiros nos limites; nenhum laço gravado igual à base da família (S4: desperdício).
- S2: marcas — no máximo 8; tipo conhecido; `quem` existe (vivo ou no `S.dead`); dia ≤ hoje.
- S2: fama — no máximo 4 comunidades; comunidade existe (cidade ou povo vivo, ou lembrado no `S.urbPast`).
- S1: boatos — no máximo ~120; o fato existe em `S.saga.facts` ou `S.crimes`, ou o boato é de um fato podado e diz isso; a parte de cada
  cidade entre 0 e 1; os portadores vivos; `v.sabe` só de boatos vivos, no máximo 6.
- S2: o casal — `partner` recíproco, mesmo pela porta (já existe no `QA.check`: as famílias); a fase 0 acrescenta «nenhum `partner`
  escrito fora do `G.Vg.pair`» como regra do guard.
- S3 (o medidor, não o verificador): a taxa de crime, de crueldade e de ódio por povo à mesma condição dentro de uma faixa.

---

## 5. O save, o custo e o nível de detalhe

### 5.1 O save — formato, saves de antes, tamanho
- **Na pessoa** (vão sozinhos, `save.js:82`): `indole` (6 + 3 inteiros), `lacos` (listas de inteiros), `marcas`, `fama`, `sabe`. Nada de
  texto livre (o `bio` `note` e o `diary` já custam 400–650 B por pessoa em texto: o social não repete esse erro — guarda ids e códigos,
  e a fala é feita na hora).
- **No mundo**: `S.boatos` por um `G.saveHooks` do `soc-boatos.js` (os portadores e as partes por cidade, arredondados); `set.memoria` e
  `f.memoria` vão com as cidades e os povos (já salvos inteiros, `save.js:106,108`); a vez do dia social pelo `G.mod('soc.day')` (L-694).
- **Os saves de antes**: sem `indole`, a índole é calculada no load (hash + traços, sem os pais); sem `lacos`/`marcas`/`fama`/`sabe`, vazio —
  a sociedade começa sem memória e a constrói (a família implícita já dá o esqueleto: ninguém acorda sem conhecer a mãe). **O conserto no
  load** (um `G.saveHooks` de cada arquivo, como o `mendKen`, `possess.js:657`): tetos, inteiros nos limites, ids que não existem mais
  (vivos ou no `S.dead`) saem, laço consigo mesmo sai. Um save danificado carrega limpo (`qa/corrupt.js`); um save velho, sem erro
  (`qa/oldsave.js`).
- **O tamanho** (medido com o protótipo, `exp/orcamento.js`, metrópole): índole 24 B; 16 laços 352 B; 6 marcas 141 B; ~550 B por pessoa →
  **+517 KB (+12,6%) no save da metrópole** (4,09 MB hoje), ~+590 KB nos 500 anos (6,2 MB). Os boatos (120 × ~150 B) ~18 KB. Uma
  economia de graça para pagar parte: **arredondar no save os números de hoje que guardam 15 casas** (`walkPh`, `think`, `scan`, `speed`,
  `courage`, `fx`, `fy`, `courtCD`, `work`…) — medido: **−99 KB** na metrópole, sem mudar nada que o mundo decida (conferir um a um com o
  `det3`: alguns entram em contas do mundo).

### 5.2 O custo por passo (o orçamento)
| O quê | Quando | Custo medido / estimado (metrópole, 944) |
|---|---|---|
| A índole de todos | no load / no nascimento | 1,5 ms todos de uma vez; zero por passo |
| Uma pergunta «o que v sente por o» | a cada leitura | 0,64 µs (busca em ≤ 16) |
| O alvo da conversa com laços (por cidade) | a cada escolha social | 14 µs (o de hoje, que varre o mundo: 69 µs) |
| A passada do dia (esfriar, cortar) | uma cidade por passo, uma vez por dia do mundo | 1,2 ms o mundo inteiro por dia |
| Um evento (`G.Lacos.ato`) | ~500–1 500 por dia do mundo | < 2 µs cada |
| Os boatos (contágio e portadores) | uma vez por dia por cidade | 120 boatos × 20 cidades ≈ 2 400 contas/dia |
- **O teto proposto**: o pilar social não passa de **2% do passo** (hoje as pessoas são 54–72% de 165 ms; 2% ≈ 3 ms por passo na
  metrópole carregada, ≈ 3 µs por pessoa por passo). Pelo desenho por eventos e pelo dia, fica muito abaixo. **O perigo de custo é outro:
  laços que façam a escolha varrer pessoas** (todos os amigos de todos a cada `decide`) e qualquer O(N²) — o verificador e o medidor medem.
- **Os números por pessoa** (o orçamento): laços 16 (adulto) / 8 (criança) + a família implícita; marcas 8; `sabe` 6; fama 4
  comunidades; boatos vivos no mundo 120; `set.memoria` / `f.memoria` 12; bytes por pessoa ≤ 600 a mais.

### 5.3 O nível de detalhe da simulação — o que o determinismo permite
- **Por câmera: não.** «Cheio perto da câmera do deus, grosso longe» muda o mundo pelo olhar, e o `det3.js` exige o mesmo mundo com e sem
  quadros (câmera, cinema, som, painéis — `qa/README.md:56`). A câmera só escolhe **o que se vê e se ouve** (as falas, os gestos, os balões,
  pelo `G.VR`).
- **Por agregação: sim** — é o coração da proposta: a multidão sabe e sente **por parte da cidade**, amostrada pelo `G.hash(pessoa,
  coisa)`; quem importa guarda **por nome** (os laços, as marcas, o `sabe`). Uma pergunta de uma pessoa qualquer («ela ouviu falar do
  assassinato?», «o que ela acha do governante?») tem resposta determinística sem um byte guardado.
- **Por importância, dita pelo estado do mundo: sim** — o corpo (`S.avatar`, no save), quem tem laço com ele, o governante, os heróis,
  os personagens de uma história ativa (`G.Stories.of`) podem ter mais (um teto de laços maior, a fala detalhada); nunca pelo que a câmera
  olha.
- **Pelo modo do mundo: com cuidado.** O salto já tem o seu (`villagers.js:2334` — quem dorme vive meio passo; `:946` — as crianças ficam
  paradas 60% das vezes). Os encontros que fazem laços **por proximidade de passo** seriam mais raros no salto do que no passo — o mesmo
  mundo daria laços diferentes. Por isso **os laços nascem de causas que o salto e o passo vivem iguais**: o fim do afazer (a conversa
  que acabou, a mesa da taverna fechada pela operação, o turno do ofício contado no dia), nunca de «estavam perto neste quadro». O teste C
  do `qa/invariancia.js` («as pessoas depois de dois dias longe») ganha os laços e os boatos.

---

## 6. O plano em fases (cada uma uma fundação entregável)

| Fase | O que entra | Muda o equilíbrio? | As provas que guardam |
|---|---|---|---|
| **0 — o chão** (pequena) | `G.Vg.pair` / `unpair` (a porta do casal: os sete escritores de `partner` passam por ela, sem mudar o que fazem); `G.Vg.weigh` e `G.Vg.want` (os registros, vazios); arredondar no save os números de 15 casas; o medidor `qa/sociedade-eco.js` (antes de tudo, para ter a linha de base) | **não** (as portas novas não mudam escolha nenhuma; o arredondar, conferido pelo `det3`) | `guard.js` (as regras novas), `det3`, `oldsave`, `corrupt`, a vida curta |
| **1 — a índole e os laços** | `soc-indole.js` (`indole`, herança, os saves de antes, `faceta`, `humor`, `par`), `soc-lacos.js` (`lacos`, `ato`, `sente`, `base`, `alvo`, a passada do dia); os primeiros consumidores: o alvo da conversa e da visita, o peso do tempo livre (`weigh`), a mesa da taverna, a corte por quem se conhece e o «sim» dos dois lados, o luto do amigo, a postura no cadafalso | **sim — a corte muda o casal, e o casal faz os filhos**: calibrar para que os casais por ano e os nascimentos fiquem na faixa de hoje | o medidor (a população, os nascimentos, os casais, a idade do primeiro casal, os viúvos que casam de novo, por 40 anos, 10 sementes); `oficio-eco.js`; `fome.js`; os mundos prontos gerados de novo e o `mundos.js`; a regressão inteira com a linha de base nova |
| **2 — a memória e a reputação** | as marcas (quem fez o quê, a saliência pela índole, as promessas e as dívidas pelo `G.Depot`); a denúncia pesada pelos laços; a vítima do ladrão; a discussão → a briga → **a agressão e o homicídio entre pessoas do mundo** (`G.Crime.assault` aberto ao mundo); a ajuda ao estranho; `soc-fama.js` (a fama da cidade de casa, `set.memoria`); a vingança lendo a marca; a índole que a vida muda; a persona dos governantes lida da índole (sem o povo) | **sim — o crime** (mais agressões, homicídios, prisões, execuções) **e os governantes** | o medidor (crimes por mil pessoas-ano, presos, executados, vinganças, por povo à mesma condição: a invariante «nenhum povo mais criminoso»); `qa/combate.js` c12 (as lutas do mundo sem corpo: uma briga nova é uma luta do mundo); `ladrao-bairro.js`; `portao-guerra.js`, `oficio-eco.js` (as armas) |
| **3 — os boatos e a memória coletiva** | `soc-boatos.js` (a verdade nos fatos do `stories.js` e no `S.crimes`; a parte por cidade; os portadores — o mercador, a tripulação, o migrante, o soldado; a distorção com causa; o desmentido); a fama que atravessa cidades; `f.memoria`, as lendas ao `G.Lore`; o ódio ao governante na satisfação dos estados; a revolta com rostos (`Po.uprising` pelos laços); o calor dos `secrets.js` passa a ser um boato; a faixa «NOTÍCIA» do corpo pelos boatos | **sim — a política** (revoltas, golpes, inquéritos) | o medidor (revoluções, golpes, motins, inquéritos por povo-ano); `qa/vira.js`; `story-*` pela `textlint`; `sabe.js` (o que o corpo sabe) |
| **4 — o corpo social** | `soc-verbos.js` (os doze verbos pelo registro, as reações, as falas); o menu da pessoa (com a 20e); o convite à taverna com a rodada paga; o pedido de casamento pela porta do casal; a reconciliação; **4b — a adoção** (a tutela `v.tutor` e os seus leitores) | pouco (só onde o corpo age); a adoção sim (a casa das crianças) | `interacao.js`, `sabe.js`, `combate.js` (a ameaça e a briga com o corpo), `casa-cheia.js` (a casa do adotado), `encarna` |

Cada fase chega, como manda o protocolo (CLAUDE.md, «Protocolo de qualidade»), com: **a invariante** (`qa/sociedade-inv.js`, juntada pelo
`junta-inv.js`: os tetos; os ids vivos ou lembrados; os inteiros nos limites; ninguém com laço consigo; a família implícita nunca gravada
igual à base; o boato com fato que existe ou existia; a parte de uma cidade entre 0 e 1; o `sabe` só de boatos vivos); **o cenário**
(`qa/sociedade.js`, cada parte num mundo seu, com os casos ruins do §6.2); **as regras do guard** (§4.7); **a linha no `G.Audio.ATO`**
para cada ato novo (regra 54); **a linha no `ORIGEM.md`** para o que custa coisas (a rodada, o presente, a dívida).

### 6.1 O medidor do equilíbrio (`qa/sociedade-eco.js`, no molde do `oficio-eco.js`: um medidor, não uma prova)
Dez mundos de 40 anos (o salto, sem navegador), antes e depois de cada fase: a população e a pirâmide; nascimentos, casais novos, idade
do primeiro casal, viúvos que casam de novo, filhos por casal; mortes por causa; **furtos, agressões, homicídios, presos, executados por
mil pessoas-ano**; revoluções, golpes, motins; órfãos e adotados; laços por pessoa (média, p90), amigos, inimigos; boatos vivos, a parte
média, quantos atravessaram cidades; **por povo** (a mesma conta para cada povo, na mesma fome e na mesma guerra — a regra do dono
medida); o tamanho do save por pessoa e o tempo do passo. A linha de base é a fase 0.

### 6.2 Os cenários dos casos ruins (`qa/sociedade.js`)
- **O save no meio**: uma corte entre dois que já se gostam, uma discussão, um boato meio espalhado, um portador na estrada → save →
  load → o mesmo futuro (o `det3` de um save carregado duas vezes).
- **A pessoa morre no meio**: o amigo morre com o laço cheio (o laço sai na passada, a marca de luto fica, o luto do amigo); o sujeito de
  um boato morre (o boato continua, vira memória da cidade); o portador morre na estrada (os boatos dele morrem com ele, como as notícias
  do navio que afunda, `seaknow.js:8`).
- **O deus interfere**: o Amor Divino (`fates.js:148`) une dois que se odiavam (pela porta do casal; os laços dizem o que sentem); a mão
  do deus leva alguém (o `held`); um milagre ou uma desgraça vista (a marca `salvou` não é de ninguém: o deus não é pessoa — os
  sentimentos pelo deus continuam a `devotion` e o `fear` de hoje).
- **A cidade muda de povo** (revolta, conquista, paz que devolve — o `homecoming`): os laços ficam (as pessoas são as mesmas), a fama
  da cidade velha vira a de outra comunidade, o `f.memoria` do conquistador ganha a conquista; nenhum laço aponta para alguém de outro mundo.
- **A guerra**: o soldado que mata o irmão de alguém do outro povo (a marca `matou` de um povo inimigo), o cativo que faz amigos no
  cativeiro, o veterano que volta (a índole muda), o boato de uma derrota que chega antes do exército.
- **O corpo**: o corpo insulta, bate, beija, pede em casamento, adota; deixa o corpo no meio de um convite (o fim do corpo devolve o
  afazer, como o duelo, `combate.js` `onRelease`).
- **O mundo de séculos**: os 500 anos abertos e vividos 10 anos — os tetos seguram, o save não cresce além do orçamento.

---

## 7. As fronteiras com os outros dois pilares, os riscos e as perguntas

### 7.1 O pilar das animações pousa o que o social decide (e nunca escreve o mundo)
O social emite, **no passo do mundo**, só o que o mundo já usa para os gestos: o `v.act` (lido pelo `G.Anim3D.stateOf` e pelo
`G.Audio.ATO`), a tarefa com o seu tipo e um **tom** na tarefa (`t.tom`), o balão `v.emo` (`Vg.emote`), a fala (`G.Talk.say`) e o par
(`t.id`: com quem). Proposta da lista (o que existe já no `G.Audio.ATO`: `chat`, `cheer`, `boo`, `weep`, `mourn`, `joy`, `dance`, `hug`,
`talk`, `fight`, `shove`, `shout`, `swear`, `cower`, `kneel`, `sad`, `scream`, `stagger`):
| Situação social | `t.type` | `v.act` | `t.tom` / o par |
|---|---|---|---|
| conversa | `social` / `talk` | `talk`, `chat` | `amigavel`, `formal`, `intimo`, `fofoca`, `consolo` — `t.id` |
| corte, namoro | `court` / `talk` | `talk` → `flirt` (novo) | `timido`, `ousado`; rejeição: `sad` |
| beijo, abraço | `talk` (`hug`, `kiss` novo) | `hug`, `kiss` (novo) | `t.id` |
| discussão | `argue` (novo) | `argue` (novo), `shout`, `swear` | `irritado`, `ofendido` — o outro `argue` também |
| insulto, ameaça | `argue` | `insult` (novo), `threat` (novo) | quem recebe: `cower`, `shove`, `argue` |
| briga | a de hoje (`fight` na taverna) | `fight`, `shove` | — |
| beber juntos | `tavern` | o da mesa (`sentar`, o brinde `toast` novo) | `t.with` |
| luto do amigo, choro | `lar` / `funeral` | `mourn`, `weep` | — |
| ajudar | `ajudar` (novo) | `help` (novo: amparar, carregar junto) | `t.id` |
| a criança e o bicho | `play` | `pet` (novo) | `t.beast` |
| o pai que repreende | `ralhar` (novo) | `scold` (novo); a criança: `sad` | `t.id` |
| a multidão que vaia / aplaude | as de hoje (`justice.js`) | `boo`, `cheer` | — |
O 3D lê **o ato, o tom e o humor** (`G.Indole.humor`, pura) — e escolhe o clipe; nunca escreve, nem sorteia pelo `G.R`. Gesto novo:
um clipe pelo `G.ANIM_CLIPS` com os seus `acts` (JOGABILIDADE §4.6) e a sua linha no `G.Audio.GESTO`/`ATO` (regra 54; o `qa/som.js` s1
cobra). **O que a animação pode ler da índole** (para andar e gesticular diferente: o extrovertido gesticula, o nervoso se mexe, o velho
anda devagar — esse já é dela): `G.Indole.faceta` e `humor`, puros.

### 7.2 O pilar dos personagens é dono da aparência — e o social nunca a lê
- A aparência (o rosto, o corpo, a pele, o cabelo, a roupa) é do pilar dos personagens; hoje a pele e o cabelo vêm da paleta do povo
  (`villagers.js:96-97`) — a aparência carrega o povo, e por isso nenhuma decisão pode ler nem uma nem outro.
- **A atração** (o romance) é o ponto delicado: na vida real há atração física; aqui ela **nasce do convívio e da compatibilidade de
  índole** (`G.Indole.par`), nunca da aparência. Se um dia o arquiteto quiser um gosto individual, ele precisa ser **individual e
  sorteado pelo id** (um gosto de cada um, sem padrão por povo, pele ou corpo) — e o medidor confere que nenhum povo é preterido.
- **A identidade persistente** (o item 4 do pedido) é dos dois pilares: o rosto é o mesmo pela vida (personagens: do id, envelhecendo);
  o nome, o ofício, a origem, a família, a biografia, a índole, os laços e a fama são deste pilar e do mundo de hoje — o cartão da pessoa
  (`interact.js:306` `personCard`) passa a mostrar a índole em palavras (como `P.personaWords`), os amigos e os inimigos que o corpo
  sabe, e a fama ali. «Reconhecer a pessoa depois de muitos dias» = o rosto dela + o cartão que lembra o que vocês viveram.

### 7.3 Os riscos
- **O equilíbrio** (o maior): o casal faz a população (§1.2) — uma corte mais exigente derruba os nascimentos; o crime entre pessoas
  (fase 2) e a revolta pelos laços (fase 3) mudam a política. Cada fase com o medidor antes e depois, e a calibragem dita no AUDIT.
- **O determinismo**: nada do social tira do `G.R` fora de onde o mundo já tirava (a índole e a amostra pelo `G.hash`); a ordem dos
  registros (`weigh`, `want`) fixa; os mapas de módulo zerados num `G.worldHooks` (o `brawls` da taverna é o exemplo do que não fazer
  com o novo: some no load — `act-taverna.js:362`); o dia social pelo `G.mod`. **Toda fase que muda escolhas muda os mundos**: os mundos
  prontos gerados de novo e a linha de base explicada.
- **O tamanho do save**: +12% na metrópole com os tetos propostos; acima deles, o save comprimido cresce e o celular sofre — os tetos são
  regra do verificador.
- **O desempenho**: o perigo não é o laço nem o boato (medidos baratos), é uma escolha nova que varra pessoas a cada `decide`; o alvo por
  cidade (o roster) resolve, e o medidor mede o passo.
- **O texto**: as falas e as crônicas novas pelo `textlint` (a soak com `TEXTLINT=1`), sem dizer o que não aconteceu (a regra de ouro
  das histórias: o boato diz «dizem que», a crônica do deus diz a verdade).
- **Os onze lugares de memória** (§1.3): a fase 3 precisa **juntar** (o calor dos segredos vira boato; o `know` das histórias vira o
  `sabe` de quem importa; a faixa de notícia passa pelos boatos), não acrescentar um décimo segundo.

### 7.4 As perguntas para o arquiteto
1. **O povo na pessoa**: tirar o `civ.traits.courage` da coragem (`villagers.js:80`) e o `CIVS[civ].persona` da persona
   (`politics.js:89`) e levar o viés do povo para o regime? Muda os governantes de todos os mundos. E a fofoca que acusa o estrangeiro
   (`secrets.js:362`): fica como **preconceito de quem acusa** (pesado pela desconfiança dele, sem efeito na verdade) ou sai?
2. **A atração**: só do convívio e da índole (a proposta), ou um gosto individual pelo id?
3. **O casal e a população**: o dono aceita menos casais (mais solteiros, casamentos mais tardios e com história) se a população cair
  um pouco, ou a calibragem tem de manter os números de hoje?
4. **O crime entre pessoas** (fase 2): abrir o `G.Crime.assault` ao mundo (agressões e homicídios sem o corpo) — o dono quer que a cidade
  tenha assassinatos que ninguém mandou acontecer?
5. **Os doze verbos**: um menu da pessoa (o cartão com os verbos de agora) ou uma roda no F segurado? Quem faz (a 20e é dona do
  `interact.js`/`incui.js`)?
6. **A adoção** exige uma porta de tutela lida em muitos lugares (a casa, a família que viaja, o parentesco das histórias, o corpo):
  fase própria (4b) ou dentro da fase 1 (o órfão é visível já: 31% das crianças do «mundial»)?
7. **A faixa «NOTÍCIA» do corpo**: passar a ser só o que a pessoa vivida ouviu (com atraso e distorção) — o dono aceita deixar de saber
  na hora o que acontece longe quando está encarnado?
8. **O nome dos arquivos**: `soc-*.js` (`G.Indole`, `G.Lacos`, `G.Fama`, `G.Boatos`, `G.Convivio`, `G.SocVerbos`), no molde da `fauna-*`?

---

## 8. Os arquivos das medições (nesta pasta)
- `exp/medir.js` — o save por pessoa, o custo do passo das pessoas, os encontros por dia (`node exp/medir.js metropole 60`).
- `exp/prontos.js` — a população pelas décadas, os casais, os órfãos, sem simular (`prontos.txt`).
- `exp/orcamento.js` — o protótipo de bancada da índole, dos laços e das marcas na metrópole (`orcamento.json`).
- `exp/casais.js` — o casal de hoje: idade do primeiro casal, diferença de idade, quem nunca casou (`casais.txt`).
- As saídas: `cidade.json`, `metropole.json`, `anos500.json`, `prontos.txt`, `orcamento.json`, `casais.txt`.
- Todas rodam com `node exp/<arquivo>.js`, só leem o jogo (o `qa/nodemundo.js` e os `worlds/`), não escrevem nada no repositório.
