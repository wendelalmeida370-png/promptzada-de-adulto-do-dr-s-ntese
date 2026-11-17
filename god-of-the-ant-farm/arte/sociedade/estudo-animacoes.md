# Estudo — Pilar 3: animações, rotinas e reatividade ao mundo

(Batedor do arquiteto, 17/11. Só estudo e proposta: nada foi mudado no repositório.
Todas as referências são `arquivo:linha` no `god-of-the-ant-farm/` da pasta principal. Os scripts de medida estão em
`scratchpad/sociedade/anim-exp/`.)

## 0. Resumo (para quem lê só isto)
- **O animador é bom e barato** (4 µs/corpo; camadas, clipes no relógio do mundo, passada de gente de verdade); o que falta é
  **o que ele recebe**: o 3D só lê `v.act`, o sono, a carga e o movimento. A tarefa (~140 tipos), a idade, o cansaço, a doença, a
  ferida, os membros perdidos, a gravidez, o luto, o medo, o frio e os traços **não chegam à pose**.
- **Medido num dia da metrópole**: 75% do tempo uma pessoa vista está «andando», «parada» ou «dormindo»; ~70% não têm ato num instante;
  as crianças (39% da gente) brincam e perseguem umas às outras no mundo e aparecem só andando; 11,5% estão cansadas e o aditivo do
  cansaço recebe 0 (`people3d.js:1783`); ~35 atos do mundo (o aplauso, a vaia, o motim, o grito, o posto do guarda…) caem em
  `idle`; quem anda perde o ato (o preso levado anda de mãos soltas).
- **O rosto já existe** (11 canais pintados no *shader*, 19 humores), mas só a emoção de 2,5 s do balão o move.
- **O caro não é animar, é a multidão**: 320 cápsulas paradas custam ~11 ms/quadro em Node porque o retrato de cada uma é
  refeito todo quadro; 90 corpos animados custam ~2,6 ms. Numa metrópole cabem 450–680 pessoas no raio do corpo inteiro, o 3D
  anima 60–90.
- **A proposta**: um leitor do mundo (`js/vida3d.js`) que dá ao animador puro um **porte** (aditivos por causa), um **ócio**
  (micro-ações com tiques por pessoa), um **olhar** (para os outros, não só para o jogador), um **rosto** (canais nomeados), a
  **tarefa como estado**, o **ato por cima de quem anda**, e os clipes **a dois** e **de grupo** postos pelo mundo — centenas de
  gestos por combinação (poses-chave + geradores + variante pelo `G.hash`), nunca por sorteio (regra 113).
- Plano em 7 fases (3.14); contratos com o social (5.1) e os personagens (5.2); a divisão dos arquivos (5.3); riscos (6);
  perguntas (7).

## 0.1 Andamento
- [x] 1. O sistema de animação hoje
- [x] 2. O que o mundo já dá a ler
- [x] 3. A proposta
- [x] 4. As provas
- [x] 5. As fronteiras com os outros dois pilares
- [x] 6. Os riscos · 7. As perguntas

Os scripts (`/tmp/claude-0/-home-user-promptzada-de-adulto-do-dr-s-ntese/474a40dc-2376-5786-aa24-770c3a52b5eb/scratchpad/sociedade/anim-exp/`):
`custo.js` (o preço do animador), `multidao.js` (quantos à vista e o quadro das pessoas), `look.js` (o retrato),
`lacunas.js` (a tarefa contra a pose, um dia; saídas `lacunas-metropole.txt`, `lacunas-mega.txt`), `atos.js`/`atos2.js` (todo ato
contra a pose; saída `atos.txt`), `clipes.js` (os clipes e a memória), `porte.js`/`porte2.js` (o protótipo do aditivo de postura).

## 1. O sistema de animação hoje

### 1.1 As peças e o caminho de um quadro
Um quadro de uma pessoa do mundo, perto da câmera (`P3.update`, `people3d.js:1690-1840`):

1. **Quem entra**: todos os `S.villagers` fora de navio, de caverna e de colo, até `RC = view·0,55` (`people3d.js:1703-1711`);
   ordenados pela distância; os `q.npcs` mais perto (12/30/60/90 por qualidade, `realm3d.js:41-44`; teto `MAX = 96`,
   `people3d.js:23`) até `R = view·0,22` viram **corpo inteiro**; o resto até `MAXC = 320` vira **multidão** (cápsula, cabeça,
   cabelo e duas pernas que balançam — «nenhuma animação própria além do balanço do passo», `people3d.js:1814-1831`).
2. **Onde e para onde**: `Anim.track` (`anim-body.js:189`) desenha o lugar do mundo com a esquina arredondada, o arranque e a
   parada; `Anim.face` (`anim-body.js:262`) dá o rumo (o `v.fx/fy` do mundo quando parado — quem conversa olha o outro).
3. **O estado**: `Anim.stateOf(v, sp)` (`people3d.js:880-891`), embrulhado pelo `combate-clips.js:136-149`. A ordem: nadar →
   dormir → andar/correr/carregar/espreitar (pela velocidade desenhada) → caído (`downT`) → o **clipe do ato** (`CLIP_OF[v.act]`,
   `anim-clips.js:268`) → a **tabela velha** `ACT[v.act]` (`people3d.js:863-876`, ~90 atos → 30 posturas) → carga → `idle`.
   O embrulho do combate acrescenta o tranco (`v.stagT`), a guarda (eventos do `G.Combate`), o derrubado (`downT`) e o golpe da
   arma da mão no relógio do golpe do mundo (`cb-mundo-<classe>-<i>`).
   **Só lê `v.act`, `v.sleeping`, `v.carry`, `v.task.type === 'swim'`, `downT`, `stagT`.** Não lê a tarefa (`v.task.type`), a
   idade, a fome, o cansaço, a doença, a ferida, o tempo, o frio, a emoção (só o rosto lê a emoção, ver 1.3).
4. **O retrato** `lookFill(s.L, v)` (`people3d.js:493-533`): a altura pela idade e pelo sexo (`L.s`), a força (`L.str`, criança
   0,35 … velho 0,6), a roupa (`outfitOf`, pelo `G.Atmos.dress`), o que segura (`G.Inv.heldFor`), a tocha, **a bebida**
   (`L.drunk = G.Atmos.drunk(v)`), **o humor do rosto** (`L.mood = MOOD[v.mourn>0 ? 'sad' : v.emo.k]`, `people3d.js:531`).
5. **A saudação**: quem o corpo cumprimenta (`P3.greet`, `people3d.js:1879`) acena de volta — `wave` inteiro parado, ou
   **por cima** (`I.over = 'wave'`) andando (`people3d.js:1767`). É o único uso hoje da camada `over` nas pessoas do mundo.
6. **O animador** `Anim.drive(memória, I, pose, L, dt)` (`anim-body.js:110-173`), um só para todos e para o corpo do jogador:
   - **base**: a passada (`G.Gait.pose`, `anim-gait.js:201-256`, pura: cadência e passo de gente de verdade, fase casada
     andar↔trote↔corrida, Froude pela altura — a criança anda como adulto ao mesmo número de Froude) **ou** uma postura da
     tabela velha `ST` (`people3d.js:786-853`: `idle` com a troca de peso e a respiração, `sit`, `rest`, `pray`, `mourn`,
     `hug`, `dance`, `sleep`, `swim`, `knocked`…: 49 estados ao todo, funções de `t` escritas à mão);
   - **as mãos**: `Anim.hold` (`people3d.js:930-958`) — o peso da carga contra a força (`L.str`) curva o tronco e dobra os
     joelhos, por pega (peito, baixo, costas, ombro, cabeça, lado), e o alcance de um ponto (`reachDepth`);
   - **a ação**: um clipe sobre a base (`playClip`, máscara `full`/`upper`/`arms`/`armR`/`head`), no relógio do mundo
     (`clipClock` → `Anim.loopTime(c, v.actT, c.period)`, `people3d.js:1688`; regra 117);
   - **por cima** (`over`): um clipe que entra e sai pelos seus tempos (`anim-body.js:150-155`);
   - **o aditivo**: só dois — a bebida (`Anim.stagger`, `people3d.js:903-915`, só nos estados de `WEAVE` = idle, walk,
     carryWalk, carry, talk, turn, wave, interact; mais o rumo que serpenteia, `Anim.weave`) e o cansaço
     (`I.tired`: `lean += 0,06·k`, `neck += 0,1·k`, e na passada `arms·(1−0,45k)`, `anim-body.js:57,158`). **O cansaço nunca é
     dado às pessoas do mundo: `I.tired = 0` em `people3d.js:1783`.**
   - **a troca de estado** por inércia (a diferença decaindo em 0,22–0,4 s, quíntica; `anim-body.js:159-166`), nunca um
     filtro sobre o ciclo; **os pés** plantados dão passos quando o corpo sai de cima deles (`feetStanding`, `anim-body.js:75`).
7. **O olhar e a piscada**: `P3.lookFor` (`people3d.js:1882`) vira a cabeça para o corpo do jogador a menos de 6 m, à frente,
   nos estados idle/talk/carry/interact/walk; os olhos vão antes (`gazeX`); `blinkAt(t, id)` (`people3d.js:1839`) pisca a cada
   3,4–4,6 s, cada um no seu compasso (`id % 13`, `id % 5`). **Ninguém olha para ninguém além do corpo do jogador.**
8. **O rig** `P3.rig` (`people3d.js:1374`): da pose às 40 matrizes dos ossos, com IK dos pés no chão de cada um (`L.gnd`) e das
   mãos (a outra mão no cabo). No nível 2 (longe) os pés não são plantados (`people3d.js:1388`).
9. **A pele** `Body3D.put` (`body3d.js:480-500`): uma linha de textura por pessoa (os ossos + 43 texels: rosto, humor, cortes
   e cores da roupa, o pano); um *draw call* por malha para a multidão inteira.

### 1.2 Os clipes: como são escritos
- Chaves por junta em graus, no tempo próprio 0..1, Catmull-Rom não uniforme amostrado uma vez em 128 pontos
  (`anim-clips.js:43-88`): tocar um clipe custa uma consulta por junta. Máscara, `in`/`out`, `feet` (`plant`/`free`), `stance`,
  `item` (a coisa vem do `G.Inv.held`, nunca do clipe), `events.contact`, `period`, `base`, `acts`, `takes`.
- **15 no `anim-clips.js`** (chop, mine, dig, hoe, hammer, harvest, fish, reel, skin, talk, interact, wave, pray, eat, fight),
  **6 no `interacao-clips.js`** (apanhar, bater, abrir, aquecer, ler, dar), **12 no `trabalho-clips.js`** (machado, picareta,
  ceifar, vara, rede, lanca-agua, maos-agua, esfolar, colher-mato, pa, cavar-maos, apregoar) e **os golpes, guardas, arco e
  tranco do `combate-clips.js`**, gerados por código a partir de poses-guarda (`keysOf`, `combate-clips.js:23-28`; o golpe do
  mundo tem uma variante por espera, `cb-mundo-<classe>-<i>`). Este último é **o modelo do que a revolução precisa**: clipes
  feitos de poses e regras, não teclados um a um.
- **Duas tabelas convivem**: as posturas velhas (`ST`, funções de seno) e os clipes novos; o `Anim.pose` velho foi embrulhado
  para servir os dois (`anim-clips.js:280-281`). Há poses só na tabela velha, que o mundo pede e nunca ganharam clipe: `mourn`
  (encolhido, as mãos no rosto), `hug`, `dance`, `rock`, `cook`, `strum`, `bound`, `throw`, `sneak`.

### 1.3 O esqueleto (rig) e o rosto
- **40 ossos** em ordem fixa (`G.BODYMESH.bones`, `bodymesh.js`): pel, spine, chest, neck, head, shL/shR (+ ajudantes shHL/shHR),
  faL/faR (+ elHL/elHR), hdL/hdR, **fgL/fgR e tbL/tbR (os dedos em bloco e o polegar)**, thL/thR (+ hpHL/hpHR), snL/snR
  (+ knHL/knHR), ftL/ftR, toeL/toeR, skF/skB/skL/skR (a saia), clk1/clk2 (a capa), e os encaixes torch, tool, carry. Dois corpos
  (corpoM, corpoF; 9.804 triângulos perto, 2.560 meio, 480 longe), escala uniforme `h/1,75`.
- **Nenhum osso no rosto, nenhum *blend shape***. O rosto é **pintado no *shader*** (`b3face`, `body3d.js:230-262`) a partir de
  11 números por pessoa: texel 0 (`closed` a piscada, `gx`/`gy` o olhar, `mouth` a boca aberta), texel 1 (`smile` −1..1, `up` as
  sobrancelhas, `angry`, `blush`), texel 40 (`sad`, `wide`, `squint`). A boca abre-se na pintura (os dentes aparecem no riso),
  as sobrancelhas sobem, descem e se juntam, as pálpebras caem; **a cabeça não muda de forma** (o queixo não desce, a bochecha
  não sobe).
- **O humor já existe**: `MOOD` (`people3d.js:556-563`) com 19 rostos (calm, chat, food, fish, wood, star, happy, joy, heart, sad,
  angry, fear, fire, awe, question, sick, zzz, pray, drunk), alisados em ~⅓ s (`easeMood`, `people3d.js:565`). A fala mexe a
  boca (`pose.talk`, o canal do clipe `talk`, `anim-clips.js:223`). **O que falta é quem diga o humor**: hoje só `v.emo.k` (o
  balão sobre a cabeça, quando há), `v.mourn` e a bebida.

### 1.4 Os níveis de detalhe da animação
- **Corpo**: `lodAt` (`people3d.js:1910-1911`) dá 0 até 12 m, 1 até 26 m, 2 além (±1 m de histerese) — **muda só a malha e as
  coisas** (e os pés soltos no nível 2). **O animador roda inteiro em todo corpo inteiro, todo quadro, a qualquer distância**
  (até 198 m no ultra). Não há taxa de atualização menor para o meio e o longe.
- **Multidão** (até 320): sem animador, só `sin(t·7 + id)` nas pernas de quem anda (`people3d.js:1818`); fica de pé, sem gesto,
  sem rosto. Quem trabalha, reza, dorme na rua ou chora ali é uma cápsula de pé.

### 1.5 Medido em Node (máquina ocupada: os números valem pela proporção)
Pelos carregadores do próprio jogo (`qa/visual/corpo-rig.js`, `qa/visual/tres-node.js`):

| Medida | Resultado |
|---|---|
| `Anim.drive` (90 corpos, estados variados, 1 em 5 bêbado, 1 em 7 com aceno por cima) | **4,0 µs/corpo** (0,36 ms/quadro) |
| + `P3.rig` (40 matrizes, IK) | 14,4 µs/corpo |
| + `Body3D.put` (a linha da textura) | **29 µs/corpo** → 90 corpos = **2,6 ms/quadro** |
| `P3.update` só das pessoas, mundo `mega` no centro de Hedeby, ultra (90 inteiros + 320 multidão) | **14,5 ms/quadro** |
| o mesmo com 1 só corpo inteiro (a multidão sozinha) | **11 ms/quadro** |
| `P3.look(v)` feito de novo (o que a multidão faz por figura por quadro, `people3d.js:1818`) | 14,7 µs/pessoa → 4,7 ms para 320 |
| `Anim3D.stateOf` (320 pessoas) | 0,12 ms |
| a pose | 56 canais, 39 amortecidos na troca de estado |

**Conclusão de custo**: o animador é barato (4 µs); o caro é o rig e a pele (25 µs) e, sobretudo, **a multidão refaz o retrato
inteiro de cada figura a cada quadro** — 320 figuras que não se mexem custam mais CPU do que 90 corpos animados. A revolução
precisa primeiro desse dinheiro de volta (o retrato guardado por id, como os corpos inteiros já fazem com `lookFill(s.L, v)`).

### 1.6 Quantos estão à vista (mundos prontos, depois de 20 s vividos, de manhã)
| Mundo (centro) | pessoas | no raio inteiro (alta / ultra) | teto | no raio da multidão |
|---|---|---|---|---|
| `metropole` (Tenochtitlan) | 944 | **450 / 682** | 60 / 90 | 937 (teto 320) |
| `mega` (Hedeby) | 722 | **361 / 495** | 60 / 90 | 716 (teto 320) |

O teto de corpos inteiros é o que manda: numa metrópole cabem **5 a 8 vezes mais pessoas** no raio do corpo inteiro do que o 3D
anima. Os mais perto ganham; os outros viram cápsula. A revolução vale para os ~60–90 mais perto **e** precisa de uma multidão que
ao menos troque de postura (sentado, ajoelhado, deitado, braços erguidos), ou a praça cheia que comemora é um bosque de cápsulas.

## 2. O que o mundo já dá a ler

### 2.1 A medida: um dia inteiro da metrópole, tarefa por tarefa (`anim-exp/lacunas.js`)
Uma amostra a cada 5 s de mundo durante 200 s (um dia: `G.DAY_LEN = 200`, `world.js:13`), 37.096 pessoa-amostras, perguntando
a cada pessoa a tarefa (`v.task.type`), o ato (`v.act`) e a pose que o 3D lhe dá (`Anim3D.stateOf`):

- **Os estados do 3D no dia**: andar 40,9% · dormir 19,0% · parado (`idle`) 15,3% · sentado 6,7% · andar carregando 6,6% ·
  falar 3,2% · todo o resto (os 30 gestos de trabalho, rezar, dançar, comer, lutar, chorar, abraçar…) **8,3%**. Três quartos
  do tempo uma pessoa vista é «andar», «parado» ou «dormir».
- **~70% das pessoas não têm ato nenhum** num instante (`v.act` vazio: 674 de 944 na metrópole, 497 de 722 na mega, de manhã): a pose sai só do movimento. **A tarefa é a fonte
  de sentido que o 3D não lê**: ~140 tipos (`setTask(v, { type: … })` em 333 lugares do código).
- **As condições do corpo, em pessoa-amostras**: crianças 38,8% · cansados (`energy < 25`) **11,5%** · com emoção no balão (`emo`)
  6,1% · de luto (`mourn`) 4,4% · velhos (≥ 62) 4,1% · doentes 3,6% · sem um braço (`lost.armL/R`) 2,2% · famintos (> 75) 1,9% ·
  grávidas 1,5% · bêbados 0,1%. (A metrópole é temperada: frio 0%, chuva 0% nesse dia.)

As tarefas que mais se veem e o que o 3D mostra delas (o resto está em `anim-exp/lacunas-metropole.txt`):

| Tarefa (tempo do dia) | O mundo diz | O 3D mostra |
|---|---|---|
| `play` — crianças (**15,9%**) | brincam perto de casa ou na praça (`G.Praca.playAt`); 40% das vezes **perseguem outra criança** (`t.chase`, `t.st = 2`, `villagers.js:1807-1826`) e ficam felizes | andar 81%, parado 19%; nenhum ato. A perseguição anda (o `I.walk = 1` força o andar, `people3d.js:1783`) |
| `follow` — o pequeno atrás da mãe (4,4%) | segue a mãe a 1,8 casa (`villagers.js:1827`) | andar / parado |
| `(sem tarefa)` (7,0%) | — | parado 84% |
| `family` (3,9%) | a família à porta ao entardecer (`G.Life.familyTask`) | sentado 57% (`sittalk`), andar 31% |
| `fest` (3,4%) | a festa: comer, dançar, conversar | andar 30%, parado 28%, comer 13%, falar 11%, dançar 11% |
| `guard` (1,3%), `ronda` (0,5%), `patrol` (1,2%) | a guarda de posto, a ronda da noite (`G.Crime.rondaPoints`), a patrulha | o ato `guard` **não tem pose**: parado 68% / andar |
| `fight` (0,3%) | a briga | **parado 72%** (a tarefa sem ato) |
| `assembly` (0,5%) | o povo reunido no fórum (`Po.forum`) | parado 61% |
| `funeral` (0,2%) | junto ao túmulo, `act = 'mourn'`, `emo sad` (`villagers.js:1861-1870`) | andar 65%, `mourn` 29% |
| `praca` (0,8%), `social` (0,4%), `talk` | a conversa da praça, a visita, o namoro (`court`: o coração, o casal que se forma, `villagers.js:1696-1730`) | `talk` — o mesmo gesto para a conversa, a corte, o regateio e o sermão |
| `tavern` (0,6%) | sentado, bebendo (`drink`), o alaúde (`play`) | sentado 29%; **`drink` vira `talk`**; o alaúde `strum` |
| `water` (1,8%) | buscar água no poço (`life.js`), `fill`, `wait` | andar/carregar; `fill` → `low` (agachado) |

### 2.2 Os atos que o mundo dá e o 3D não mostra (`anim-exp/atos.js`, `atos2.js`)
Dos ~150 atos que a vista do deus desenha (`art.js`) ou o som conhece (`G.Audio.ATO`), **~35 atos de gente caem em `idle` no 3D**
— a vista do deus (2D) tem um vocabulário mais rico que o 3D:
- **de cena e de multidão** (scripts que já existem): `cheer` (o povo aplaude no cadafalso, `justice.js`, 7 vezes), `boo` (vaia,
  `justice.js`, `riots.js`), `riot` (o motim, `riots.js` 17 vezes, `story-politics.js`), `scream`, `writhe` (o condenado),
  `struggle` e `shove` (`story-cadafalso.js`, `story-secrets.js`), `hide`, `reach`, `torchfwd`, `unmask`, `rite`, `act` (o ator);
- **de ofício e de posto**: `guard`, `herd`, `crank`, `press`, `pull`, `smoke`, `groom`, `lantern`, `look`, `lurk`, `wait`,
  `hangd` (o enforcado), `follow`;
- **convertidos com perda**: `cower` → `mourn`, `weepk` (chorar de joelhos) → `pray`, `beg` → `pray`, `sick` → `mourn`,
  `joy` → `dance`, `shout`/`question`/`haggle`/`sell`/`serve`/`drink`/`drill` → `talk` (uma mesma mão que fala), `story` → `sit`.

**E quem anda perde o ato**: `Anim.stateOf` decide pela velocidade antes de olhar o ato (`people3d.js:883`). O preso levado à
cadeia tem `act = 'bound'` (`crime.js:327`), mas **andando é desenhado andando, de mãos soltas** — só parado aparece amarrado.
O mesmo para quem grita andando, quem arrasta um morto (`drag`), quem leva a tocha à frente. A camada `over` (por cima, só o
tronco) existe e só a saudação a usa.

### 2.3 As fontes de cada «por que alguém pareceria diferente»

| Fonte | Onde está | Quem lê hoje no 3D |
|---|---|---|
| a tarefa `v.task.type` (~140 tipos) e o seu passo (`t.st`, `t.chase`, `t.id`) | `villagers.js` e os módulos (`setTask`, 333 chamadas) | só `swim` (`people3d.js:881`) |
| o ato `v.act`, o relógio `v.actT` | o mundo; `G.Act.ANIM` (`activity.js:722-756`) | `stateOf`, `clipClock` |
| a idade `v.age` | sempre | altura, força, cabelo grisalho; **não a postura nem a passada** (o mundo já anda mais devagar: criança ×0,8, velho ×0,72, doente ×0,75, sem perna ×0,6, carga ×0,9 — `villagers.js:405-406`) |
| o sexo `v.g` | sempre | o corpo F/M, a altura |
| a fome `v.hunger`, a energia `v.energy` (0–100) | `villagers.js` `needs` (o ritmo do dia: `G.pace`) | **ninguém** (o aditivo `tired` existe e recebe 0) |
| o descanso `G.Vg.resting(v)` (D-240) | `villagers.js` | ninguém |
| doente `v.sick`, grávida `v.preg` | `life.js` | ninguém (só o ato `sick` → `mourn`) |
| ferido `v.wound = { d, sev: 'leve'/'grave' }`, `v.hp`, `v.hurt` | `wars.js:707`, `combate.js` | ninguém (o golpe tem o tranco `stagT`) |
| membros perdidos `v.lost = { armL, armR, leg }` | `carnage.js:99` | **ninguém** (a vista do deus desenha a muleta e o braço que falta, `art.js:856,894`) |
| a emoção do instante `v.emo = { k, t }` (2,5 s) | `G.Vg.emote` (`villagers.js:200`), ~200 chamadas: medo 44, alegria 39, raiva 27, amor 19, tristeza 18, fome 15, espanto 12… | **o rosto** (`MOOD`) e o balão |
| o luto `v.mourn`, o medo `v.fear` (0–100), a fúria `v.fury`, a fé `v.devotion`, a coragem `v.courage` | `villagers.js`, `powers.js`, `beyond.js` | o rosto lê só `mourn` |
| a bebida `v.drunk` (até quando) | `act-taverna.js`; `G.Atmos.drunk(v)` 0,45–1 (`atmos.js:255`) | `Anim.stagger` + `weave` (só fora dos prédios) |
| os traços `v.traits` (11: Corajoso, Medroso, Trabalhador, Preguiçoso, Curioso, Sociável, Devoto, Cético, Romântico, Glutão, Resistente — `villagers.js:12`) | `rollTraits` | ninguém |
| o grupo social `v.grp` (povo, artesãos, mercadores, militares, sacerdotes, nobreza) | `polity.js` | a roupa (`G.Atmos.dress`) |
| o frio do lugar `G.Atmos.cold(x, y)` 0/1/2 (o mapa `S.temp`, o inverno do deus, a noite, a chuva de terra fresca) | `atmos.js:202` | a roupa (capa, capuz) |
| o calor | **não existe porta** (há `S.temp` e o sol do `G.Ceu.sun`) | — |
| a chuva, a tempestade `S.weather.{rain, storm, windA, windS}` | `world.js:59`, `events.js:169`; o abrigo (`'shelter'`, `villagers.js:804,932`) | o vento no pano (`Ce.wind`) |
| o chão molhado `S.wet` | `ceu.js:216-224` | o arco-íris |
| a hora, a noite `G.isNight()`, o sol e a lua `G.Ceu.sun/moon` | `ceu.js` | a tocha (`torchOf`) |
| quem está com quem: o par de uma conversa (`t.id`, `v.fx/fy`), a caixa a dois (`G.Act.pair`), o cão com a criança (`a.kid`, `pets.js:90-92`), a mãe (`follow`) | o mundo | o rumo (`face`), a caixa a dois |
| a cena (`G.Scene`, as histórias `story-*.js`, a justiça, a festa com os papéis `chained`/`soldier`, `festivals.js:564-607`) | `scene.js`, `festivals.js` | os atos que a cena dá |

### 2.4 Os exemplos do dono: o que já tem causa e só falta a pose

| Exemplo do dono | A causa no mundo | Falta |
|---|---|---|
| **Frio: tremer, esfregar as mãos, encolher os ombros** | `G.Atmos.cold(x, y)` 1–2 (`atmos.js:202`) | só a pose (aditivo + micro-ações). O clipe `aquecer` (as mãos ao fogo, `interacao-clips.js`) já existe para o corpo |
| **Calor: abanar, suar, procurar sombra** | `S.temp` alto + sol alto (`G.Ceu.sun`) — falta a **porta pura** `G.Atmos.heat(x, y)`; «procurar sombra» é decisão (pilar social / o `decide`) | a porta do calor (no `atmos.js`, pura), a pose, o brilho do suor (o *shader* da pele: personagens) |
| **Crianças brincando, correndo** | `play` + `t.chase` (`villagers.js:1807-1826`) | ler a tarefa: correr na perseguição (o `I.walk` forçado), saltitar, girar |
| **Crianças com animais (cão)** | `pets.js:90-92` (`a.kid`, «Brincando com …») | o 3D ler o par cão↔criança (um mapa da vista), a pose (agachar, afagar, correr junto) |
| **Brincar de bola** | **não existe** | uma brincadeira nova no mundo (a bola é coisa: de onde vem — couro, bexiga; ver 3.6) |
| **Pais repreendendo crianças** | **não existe** | sinal novo do pilar social (a travessura e a bronca) |
| **Idosos caminhando mais devagar** | o mundo já anda a ×0,72 (`villagers.js:406`) | a postura do velho (curvado, passo curto, base larga, braços quietos; a bengala é coisa) |
| **Trabalhadores cansados, esforço, suor** | `v.energy`, `G.Vg.resting`, o trabalho (`kind: 'work'`), o peso da carga (`Anim.hold` já curva) | dar o `tired` às pessoas (`people3d.js:1783`); o arquejo; o suor (personagens) |
| **Bêbados cambaleando ao sair da taverna** | `G.Atmos.drunk(v)` | **já existe** (`Anim.stagger`, `weave`); falta a variação (o soluço, apoiar-se na parede, cair sentado) |
| **Descansar, contemplar a natureza, conversar** | `rest`, `wander`, `G.Vg.resting`, `restAtDoor`, `praca`, `social`, `talk` | contemplar (olhar o horizonte, sentar-se na pedra); a conversa com variedade (ouvir ≠ falar; rir; gesticular conforme o traço) |
| **Prisioneiros algemados nos transportes** | `levado` + `act = 'bound'` (`crime.js:307,327`); a festa do triunfo (`chained`, `festivals.js:564`) | o ato por cima da passada (2.2); as algemas (coisa: ferro) |
| **Guardas patrulhando** | `guard`, `ronda`, `patrol` | a pose de posto (a lança em pé, o olhar que varre); o passo da ronda |
| **Comerciantes negociando** | `sell`, `banca`, `pechinchar`, `apregoar` (o clipe do pregão existe para o corpo) | o pregão nas pessoas do mundo; regatear ≠ falar |
| **Soldados treinando** | `drill` / `trainDay` (`fight` 46%) | já usa o golpe do combate; falta a ordem do instrutor e a forma em fila |
| **Chorar, lamentar mortes** | `mourn`, `funeral`, `weep`, `weepk` | o choro de joelhos (`weepk` → `pray` hoje); o abraço de consolo |
| **Comemorar** | `celebrate` (`dance`), `joy`, `cheer` (`justice.js`), a festa | `cheer` sem pose; o brinde; a multidão que ergue os braços |
| **Reagir a acontecimentos** | `emo` (2,5 s de rosto); `fear`, `fury`, `G.Vg.dread` (as feras), o fogo (`fire`), o pânico | o susto (o corpo, não só o rosto), recuar, apontar, cobrir a cabeça |
| **Beijar, abraçar, brindar, discutir, brigar, xingar, ameaçar, propor casamento, adotar** | `court` (o casal nasce sem gesto, `villagers.js:1712-1722`); `embrace` só em cenas | **sinais novos do pilar social** (ver 5.1): o par, o tipo, o desfecho |
| **Admirar um herói, respeito a um líder, medo de um criminoso, revolta contra impostos** | `v.hero`, o governante, `G.Crime`, `riot`, `taxes` (`knock`) | a reação de quem vê (olhar, curvar-se, recuar, cerrar os punhos): sinal do pilar social (a reputação de quem passa) |

Outro mundo pronto (`mega`, Hedeby, o mesmo dia medido): os mesmos números (andar 40%, parado 17%, dormir 16%; `play` 15,7%),
e **20% das pessoas doentes** (uma epidemia) — invisíveis no 3D, a não ser pelo passo ×0,75 do mundo.

## 3. A proposta

### 3.1 Os princípios (do código, não inventados)
1. **O mundo diz, o 3D posa.** Toda pose tem uma causa que se lê no mundo na hora de desenhar; a vista nunca inventa um estado
   (ninguém chora sem luto, ninguém treme sem frio). O que o mundo ainda não diz vira **pedido ao pilar social** (seção 5), não
   um sorteio da vista.
2. **A animação continua uma conta** (regra 113, `qa/guard.js:965`): os `js/anim-*.js` só recebem o quadro (`I`, `L`, `dt`) e
   não leem o mundo nem tiram acaso nenhum — **nem o `G.VR`**. Logo: **quem lê o mundo é um leitor** fora do `anim-*` (hoje o
   `lookFill` do `people3d.js`; proposto, um arquivo novo `js/vida3d.js`), que monta números no `L` e no `I`; e **a variedade vem
   do `G.hash(id, …)`** — a mesma pessoa tem sempre os mesmos tiques, o que também serve à identidade persistente que o dono pede.
3. **Camadas, não estados.** A pose de uma pessoa é a soma de: a base (passada ou postura) → a ação (o clipe do ato ou da tarefa)
   → **o porte** (aditivo contínuo do corpo e do estado) → **o ócio** (micro-ações de quem está à toa) → o gesto por cima (o tronco
   de quem anda) → **o olhar** → **o rosto**. O animador de hoje já tem quatro dessas camadas (base, ação, por cima, aditivo);
   faltam o porte inteiro, o ócio, o olhar para os outros e o rosto vivo.
4. **Centenas por combinação, não por teclado.** Poucas dezenas de **poses-chave** com nome + **geradores** (vai-e-volta, alterna,
   tremor, ciclo) + **modificadores** (amplitude, tempo, lado, porte) → centenas de gestos distintos, como o `combate-clips.js` já
   faz com as guardas (`keysOf`, `combate-clips.js:23-28`: 84 clipes gerados de poucas poses).
5. **Barato pela distância**: o detalhe inteiro perto; o meio e o longe atualizados em menos quadros; a multidão com posturas.

### 3.2 A arquitetura (os arquivos e o caminho de um quadro)

```
 o mundo (G.S, os pilares)            o leitor (só se vê; lê o mundo)          o animador puro (js/anim-*.js; regra 113)
 ───────────────────────────          ─────────────────────────────           ─────────────────────────────────────────
 v.task, v.act, v.actT,       ──▶  js/vida3d.js  G.Vida3D.read(v, L)   ──▶  Anim.drive(a, I, pose, L, dt)
 v.age, energy, hunger, sick,       · L.porte  (≈16 números 0..1)              base  → G.Gait.pose(…, o: porte da passada)
 preg, wound, lost, mourn,          · L.ctx    (as vontades do ócio)            ação  → clipe do ato OU da tarefa (TASK_OF)
 fear, fury, drunk, traits,         · L.alvo   (para onde olhar)                porte → Anim.porte(out, L.porte, fase)   [novo]
 Atmos.cold/heat, weather,          · L.duo    (o par e o papel)                ócio  → Anim.ocio(a, I, out)              [novo]
 G.Social.* (o pilar 2)             · L.cena   (o papel na cena, o foco)        por cima → o ato do tronco andando        [ampliado]
                                    · L.sente  (o rosto de fundo)               olhar → Anim.look(a, I, out)              [novo]
                                    guardado por pessoa, refeito ~2×/s        rosto → Anim.rosto(a, I, L.face)          [novo]
                                    ou quando a assinatura muda               ──▶ P3.rig → Body3D.put (os 11+ canais do rosto)
```

Os arquivos novos (todos «só se vê», na lista do guard; os `anim-*` sob a regra 113):

| Arquivo | O que é | Puro? |
|---|---|---|
| `js/vida3d.js` | **o leitor**: do mundo para números — `L.porte`, `L.ctx`, `L.alvo`, `L.duo`, `L.cena`, `L.sente`; e a tabela **tarefa → estado** (`TASK_OF`: `play` → `brincar`, `guard`/`ronda` → `posto`, `fight` sem ato → `briga`, `assembly` → `ouvir`…) | lê o mundo, não escreve (a lista do que só se vê) |
| `js/anim-porte.js` | os aditivos e as opções da passada a partir de `L.porte` | sim (regra 113) |
| `js/anim-ocio.js` | o agendador das micro-ações (pelo `I.id` e pelo relógio do mundo que o leitor passa em `I.clock`) | sim |
| `js/anim-gestos.js` | a gramática: o atlas de poses-chave, os geradores, o espelho (canhoto), a variante de cada pessoa | sim |
| `js/anim-rosto.js` | o vetor do rosto (o fundo do humor + a emoção do instante + o canal do gesto + o porte + a piscada + a fala) | sim |
| `js/anim-duo.js` | os clipes a dois (dois papéis, a distância, o contato) e o encaixe dos dois corpos | sim |
| `js/vida-clips.js`, `js/social-clips.js` | **os dados**: os clipes do dia a dia e das interações (pela fila `G.ANIM_CLIPS`, com `acts`) | sim (como o `trabalho-clips.js`) |

No `people3d.js`, **três linhas** mudam (o resto fica com os personagens): a chamada do leitor no laço (`people3d.js:1768`), o
`I.tired`/`I.porte`/`I.clock` (`people3d.js:1783`) e o `stateOf` que consulta a tarefa e passa o ato por cima de quem anda
(`people3d.js:880-891`). O `P3.lookFor` (`people3d.js:1882`) passa a ser um caso do `Anim.look`.

### 3.3 O porte: os aditivos do corpo e do estado
Um vetor de ~16 números por pessoa (0..1), feito pelo leitor, guardado e alisado (~0,5 s); o animador soma, por fator, uma
pequena tabela de canais (radianos e frações) e, onde o fator mexe no passo, as opções do `G.Gait.pose` (que já aceita `o.arms` e
`o.lean`, `anim-gait.js:201,248-250`):

| Fator (`L.porte`) | Causa no mundo | O corpo (aditivo) | A passada (`o` do Gait) |
|---|---|---|---|
| `velho` | `(age − 55) / 25` | tronco +0,1…0,25, pescoço +0,1, ombros para dentro, cotovelos +0,25, mãos atrás das costas às vezes | braços ×0,6, passo mais curto e cadência ×1,1 (o arrastar), base +2 cm |
| `crianca` | `age < 12` | cabeça erguida, braços soltos, o saltito (`bob` ×1,3) | (o Froude já faz) |
| `cansado` | `energy < 35`, o trabalho do dia (`kind: 'work'`) | tronco, pescoço, braços pendentes, **a respiração funda e rápida** (`breath`) | `I.tired` (já existe, recebe 0 hoje) |
| `frio` | `G.Atmos.cold(x, y)` 1–2 | ombros encolhidos (`shLy/shRy`), braços junto ao corpo ou cruzados, **tremor** 9–11 Hz de ±1,5° no tronco e nos ombros, o queixo que bate (`face.jaw`) | braços ×0,4, passo curto e rápido |
| `calor` | **`G.Atmos.heat(x, y)` (porta nova, pura)**: `S.temp`, o sol (`G.Ceu.sun`), a sombra (`Ce` já tem a sombra dos morros) | ombros caídos, braços afastados, cabeça baixa ao sol | — |
| `chuva` | `S.weather.rain > 0,3` ao ar livre | cabeça baixa, ombros encolhidos, a mão sobre a cabeça (ócio) | passo apressado (se o mundo apressa) |
| `doente` | `v.sick` | curvado, a mão no peito ou no ventre (ócio: tossir) | braços ×0,7 |
| `dor` / `manca` (lado) | `v.wound` (`d` recente, `sev`), `v.hp`, `v.hurt` | o braço ferido junto ao corpo; careta (`face.pain`) | **a manqueira**: a bacia cai no apoio do lado bom, o passo do lado ferido curto (fase da passada) |
| `perna` | `v.lost.leg` | o corpo sobre a muleta (a muleta é coisa, a perna é malha: pilar dos personagens) | o passo de três apoios |
| `gravida` | `v.preg` (o tempo dela) | tronco para trás (−0,08), mão nas costas ou na barriga, base larga | o balanço (`pelR` ×1,5) |
| `bebado` | `G.Atmos.drunk(v)` | (já existe: `Anim.stagger`, `Anim.weave`) + o soluço, o apoio na parede | — |
| `luto` | `v.mourn` | cabeça baixa, ombros caídos, mãos juntas | braços ×0,5 |
| `medo` | `v.fear > 40`, `G.Vg.dread` | encolhido, mãos junto ao peito, **o olhar que varre** | passo rápido e curto |
| `furia` | `v.fury > 0` | peito aberto, punhos cerrados (`grip` 1), queixo baixo | passo pesado |
| `confianca`, `expansivo`, `agressivo` | **o temperamento do pilar social** (ou, até ele chegar, os traços: Corajoso/Medroso, Sociável) | confiante: peito aberto, queixo erguido; tímido: cabeça baixa, braços junto, olhar desviado; expansivo: gestos maiores e mais frequentes | amplitude dos braços |
| `nobre` | `v.grp` nobreza/sacerdotes | ereto, mãos atrás das costas, passo lento | braços ×0,5 |

**Medido** (`anim-exp/porte.js`, `porte2.js`: um aditivo somado **depois** do `Anim.drive`, numa caminhada de 0,9 e 1,4 m/s):
os aditivos do tronco e dos braços (o frio, o cansaço) **não mexem o pé de apoio** (0,3–0,8 cm, como sem nada) e nenhum pé entra
no chão — o rig planta os pés pela passada; **os aditivos das pernas** (o velho com os joelhos +0,14) levam o deslize a
**1,3–1,8 cm** (o limite da prova de hoje é 2 cm) e baixam a bacia de 0,894 para 0,867. Logo: **o tronco, os braços e a cabeça
são aditivo livre; as pernas e o passo entram pela passada** (as opções do `G.Gait.pose`, com a amplitude refeita pela mesma regra
do pé parado), nunca somadas por cima.

### 3.4 O ócio: as micro-ações de quem está à toa
Quem está parado, sentado, encostado ou esperando (as bases `idle`, `sit`, `rest`, `wait`, `talk` de quem ouve) faz, de tempos em
tempos, uma micro-ação **por cima** (máscara `head`, `arms` ou `upper`, 1–4 s). O agendador é puro (regra 113): a hora da próxima
sai do `G.hash(id, n)` (6–14 s entre uma e outra, cada pessoa no seu compasso), a escolha pesa o contexto (`L.ctx`) e **os tiques
de cada um** (3 micro-ações favoritas por `G.hash(id)`, peso ×3 — a mesma pessoa se coça sempre do mesmo jeito), nunca duas
iguais seguidas, cada uma com o seu descanso. O relógio é o do mundo (`I.clock = S.clock`, passado pelo leitor), para que o som
(se a micro-ação soa) pergunte à mesma função e caia na mesma hora (regras 53, 117).

| Micro-ação | Quando pesa | Máscara |
|---|---|---|
| olhar em volta, olhar o céu, olhar o chão | sempre; o céu na chuva e ao entardecer | head |
| trocar o peso de perna, cruzar os braços, mãos na cintura, mãos atrás das costas | sempre (o temperamento escolhe) | upper / legs-livres |
| coçar a cabeça, a nuca, o braço; ajeitar o cinto, a roupa, o cabelo | sempre | arms |
| espreguiçar, bocejar | cansado; de manhã | upper + `face.jaw` |
| esfregar as mãos, soprar nas mãos, abraçar-se, bater os pés | frio | arms / full |
| abanar-se com a mão (ou o leque, se a mão tem um), enxugar a testa | calor; cansado do trabalho | armR |
| tossir, levar a mão ao peito | doente | upper |
| suspirar, enxugar os olhos | luto | head + arms |
| arquejar, mãos nos joelhos | depois de correr ou do trabalho pesado | full |
| tamborilar, bater o pé, olhar para a porta | esperar (`wait`, a fila, a banca) | arms |
| afagar a barriga | grávida | arms |
| soluçar, procurar apoio | bêbado | upper |
| apontar, acenar a quem passa, inclinar a cabeça a quem passa | alguém conhecido ou notável perto (pilar social) | armR / head |

Com ~30 micro-ações × 3 variantes de amplitude e tempo × o lado (canhoto) × o porte por baixo, a mesma praça não se repete.

### 3.5 A ação: os atos que faltam e a tarefa que o 3D não lê
- **A tarefa vira estado** quando o ato não diz nada (`TASK_OF` no leitor): `play` → brincar (correr na perseguição — o `t.chase`;
  saltitar, girar, esconder-se), `follow` → a mão dada à mãe (o par), `guard`/`ronda` → o posto (a lança em pé, o olhar que varre),
  `patrol` → o passo da ronda, `fight` sem ato → a briga de punhos, `assembly`/`listen` → ouvir o orador (o foco), `funeral` → o
  passo lento até o túmulo, `water` → o balde, `shelter` → correr com a mão na cabeça.
- **Os ~35 atos sem pose** (2.2): `cheer`, `boo`, `riot`, `scream`, `writhe`, `struggle`, `shove`, `hide`, `reach`, `torchfwd`,
  `unmask`, `rite`, `guard`, `herd`, `crank`, `press`, `pull`, `smoke`, `groom`, `lantern`, `look`, `lurk`, `wait`, `hangd`, `act`;
  e os convertidos com perda: `cower`, `weepk`, `beg`, `sick`, `joy`, `shout`, `question`, `drink`, `serve`, `sell`, `story`.
- **O ato por cima de quem anda**: quando a pessoa anda e o ato tem um clipe de máscara `upper` (ou uma postura de braços), ele vai
  como `over` sobre a passada — o preso andando com as mãos amarradas (`bound`), quem leva a tocha à frente, quem grita andando,
  quem arrasta o morto. É uma linha no `stateOf` e usa a camada que a saudação já usa (`anim-body.js:150-155`).

### 3.6 A dois e em grupo
**A dois** (`js/anim-duo.js`): um clipe a dois tem dois papéis (`a`, `b`), a distância e o rumo de um para o outro, o contato
(o abraço fecha aos 40%), e o relógio do mundo de quem começa (`v.actT`). **O lugar é do mundo**: o pilar social põe os dois a
`dist` um do outro, virados (`G.faceTo`, `v.fx/fy`) — como a caixa a dois já faz (`G.Act.pair` e `P3.pairs`,
`people3d.js:1732-1750`): o 3D só encaixa os últimos ~15 cm e leva as mãos ao outro corpo pela IK das mãos do rig. Longe demais
(o mundo os deixou a 1,5 m), cada um faz o seu papel sozinho (um aceno, a conversa). Os do pedido: cumprimentar (aceno, aperto,
reverência — **pelo povo e pela posição**: o romano aperta o antebraço, o egípcio se curva, o servo baixa a cabeça ao nobre),
conversar (falar ≠ ouvir; rir; discordar), discutir, xingar, ameaçar, empurrar, brigar (o combate existe), abraçar, beijar,
consolar (a mão no ombro, o choro no ombro), brindar, dar e receber (existe `dar`), pedir, propor (de joelhos), a bronca do
adulto na criança (o dedo em riste, a criança de cabeça baixa), pegar no colo, a mão dada, adotar (a criança tomada pela mão).

**Em grupo**: a cena (a festa, o cadafalso, o motim, o enterro, o fórum, a brincadeira) é do mundo — quem está nela, o papel, **o
foco** (o túmulo, o orador, o condenado, a fogueira). O 3D dá a cada um o clipe do papel, **a fase pelo `G.hash(id)`** (ninguém em
uníssono), a cabeça para o foco (o `Anim.look`), e a intensidade pelo temperamento. Roda de luto, multidão que aplaude e vaia,
crianças em roda ou no pega-pega, soldados em fila no treino.

### 3.7 O olhar
Hoje só o corpo do jogador é olhado (`P3.lookFor`). O leitor escolhe **um alvo** por pessoa (`L.alvo`, um ponto): o outro da
conversa, o foco da cena, quem passa e é notável para ela (**a reputação: pilar social** — o herói, o governante, o criminoso
conhecido, o amigo), a fera perto (`G.Vg.dread`), o fogo, o cão, o corpo do jogador; sem alvo, o olhar vagueia (sacadas pelo
`G.hash`). O animador vira os olhos primeiro, a cabeça depois, o tronco se for longe — o que já se faz para o jogador. É barato
e é o que mais faz uma rua parecer viva: as pessoas se olham.

### 3.8 O rosto (a porta para o pilar dos personagens)
Hoje são 11 números pintados pelo *shader* (`body3d.js:489-492`). Proposta: **o animador escreve, todo quadro, `L.face`** com
canais **nomeados**, em faixas fixas, e o corpo (do pilar dos personagens) desenha como quiser — *shader*, ossos do rosto ou
*blend shapes*:

| Canal | Faixa | De onde vem (a mistura do `Anim.rosto`) |
|---|---|---|
| `blink` | 0 aberto … 1 fechado | a piscada (`blinkAt`; mais rápida no medo, mais lenta no cansaço), o sono |
| `gazeX`, `gazeY` | −0,45…0,45 / −0,3…0,3 | o `Anim.look` |
| `jaw` | 0…1 | a fala (`talk`, por *visemas* simples), o riso, o grito, o bocejo, o queixo que bate de frio |
| `smile` | −1…1 | o humor de fundo (`L.sente`, pilar social) + a emoção do instante (`v.emo`) |
| `browUp`, `browIn`, `browSad` | 0…1 | surpresa e medo; raiva; tristeza |
| `wide`, `squint` | 0…1 | medo, espanto; riso, desconfiança, sol forte |
| `blush` | 0…1 | amor, vergonha, bebida, calor |
| `pain` | 0…1 | ferida, esforço (o golpe de machado, a carga pesada) |
| `sneer` | 0…1 | desprezo, nojo (xingar, a vaia) |
| `cry` | 0…1 | as lágrimas (o brilho do olho, o rosto molhado) |
| `sweat` | 0…1 | calor, esforço, febre — o brilho da pele |
| `pale` | 0…1 | doença, medo extremo |

Os 11 de hoje cabem nisso (`closed` = `blink`, `mouth` = `jaw`, `up` = `browUp`, `angry` = `browIn`, `sad` = `browSad`).
**Um clipe pode chavear o rosto** (máscara `face`; o `talk` já chaveia `talk`, `anim-clips.js:223`): o riso do brinde, a careta
do golpe, o grito do xingamento. Canal desconhecido é ignorado; canal que o corpo não desenha não quebra nada.

### 3.9 As coisas nas mãos
- **A coisa que é coisa vem do mundo** (D-440, «nada vem do nada»): a caneca, a bola, a vassoura, os grilhões, a bengala, a muleta,
  o leque — se a pessoa a tem, é pelo `G.Inv.held(v)` / `G.ItemArt` (regras 114, 136; o kit pelo material que o povo tem,
  `O.matOK`). O clipe diz `item: { hand: 'mao' }`; **sem a coisa, faz o gesto de mãos vazias** (abanar-se com a mão, as mãos
  juntas do preso). A vista nunca põe na mão uma coisa que o mundo não tem.
- **O que pede o mundo** (pilar social / o mundo): a **bola** (uma coisa do catálogo, de couro ou de bexiga, com origem — o abate,
  o curtume — na casa da criança; até lá, o pega-pega que o mundo já tem), **os grilhões** (do armazém da cadeia, postos pelo
  `crime.js` na mochila do preso, ferro do povo; até lá, as mãos juntas à frente), **a caneca** da taverna (a cerâmica da olaria;
  o `drink` com a caneca do `G.Inv`), **a muleta e a bengala** (madeira; o leitor as pede ao inventário de quem tem `lost.leg` ou
  é velho), o **leque** (folha, plumas: só os povos que o têm).
- O gesto com a coisa de outro (o brinde: as duas canecas se tocam) é do `anim-duo` (o contato na hora do mundo).

### 3.10 O som
Cada ato novo do mundo tem a sua linha no `G.Audio.ATO` (e cada gesto do `G.Act.ANIM`, no `GESTO`; regra 54, `qa/som.js` s1) —
muitos já têm (`cheer`, `boo`, `riot`, `scream`, `mourn`, `weep`, `chat`; `audio-src.js:90-130`); os novos do pilar social
(`abracar`, `beijar`, `brindar`, `xingar`, `bronca`…) chegam com a sua. **As micro-ações não são atos do mundo**: as que soam (a
tosse do doente, o espirro, o dente que bate, o bocejo, o suspiro, o soluço do bêbado) são decididas pela **mesma função pura**
do ócio (o `id` e o relógio do mundo), que a cena do som pergunta — o som e a pose na mesma hora, sem o som ler o que o 3D guardou.

### 3.11 O custo e os níveis de detalhe
| Nível | Distância | O que roda | Custo estimado (µs/corpo, medido + proposto) |
|---|---|---|---|
| perto | ≤ 12 m | tudo: porte, ócio, olhar, rosto, IK das mãos no outro, a dois | ~35 (hoje 29) |
| meio | 12–26 m | porte, ação, olhar da cabeça; ócio só as grandes; rosto a ½ |  ~30 |
| longe | 26 m – `R` | a pose refeita **a cada 2º ou 3º quadro** (escalonado pelo id), sem ócio nem rosto, pés soltos (já) | ~10 (amortizado) |
| multidão | `R` – `RC` | **6–8 posturas** (de pé, sentado, ajoelhado, deitado, braços erguidos, mãos no rosto, carregando) escolhidas pelo `TASK_OF`/ato, e **o retrato guardado por id** (hoje refeito todo quadro, 4,7 ms) | ~5 |

Orçamento proposto (alta, centro da metrópole, 60 inteiros + 320 multidão): **≤ 4 ms de CPU por quadro para as pessoas** (hoje,
em Node, ~14 ms, dos quais ~11 ms são a multidão). A primeira fase paga a revolução: guardar o retrato da multidão e atualizar o
longe a ½ libera mais do que todo o porte, o ócio e o rosto custam. Memória: as tabelas dos clipes custam 7,8 KB cada
(`anim-exp/clipes.js`: 153 clipes hoje, 1,2 MB); 500 clipes ≈ 4 MB — aceitável no PC; se preciso, amostrar os do ócio a 64 pontos
ou na primeira vez que tocam. A memória da vista por pessoa cresce ~200 B.

### 3.12 Como escrever e provar (no estilo da casa)
1. **Uma pose-chave tem nome** (`Anim.POSES.bracosCruzados = { shLp: …, elL: …, … }`, em graus, no `anim-gestos.js`).
2. **Um gesto é um gerador sobre poses** — `vaiVolta(base, pico, { dur, pico: 0.4, segura: 0.3 })`, `alterna(A, B, { ritmo })`,
   `tremor(canais, hz, amp)`, `ciclo([A, B, C])` — que devolve o `def` de sempre (`keys`, `mask`, `in`, `out`, `events`, `acts`) e
   entra pela fila `G.ANIM_CLIPS` (regra 116). O espelho (`Anim.mirror(def)`) faz o canhoto.
3. **A variante de cada pessoa** (tempo ±12%, amplitude ±15%, lado, a fase) sai do `G.hash(id, k)` dentro do animador.
4. **Ver**: a tira (`qa/visual/corpo-filme.js ID …` + `arte/corpo_filme.py`), e uma **folha de gestos** nova para o dono (todas as
   micro-ações e interações, de três quartos, um quadro cada).
5. **Provar**: a seção 4.

### 3.13 A variedade sem repetição (e como se mede)
- Por pessoa: os tiques (3 favoritas), o lado, o tempo e a amplitude, o porte (idade, temperamento) — fixos pelo id: reconhecível.
- Por instante: a fase pelo id (ninguém em uníssono), o intervalo do ócio pelo id, nunca a mesma micro-ação duas vezes seguidas.
- Por contexto: os pesos do `L.ctx`.
- **A medida** (prova nova): numa praça de 60 pessoas por 120 s, (a) nenhum par de pessoas no mesmo clipe e na mesma fase (±0,1 s)
  por mais de 2 s; (b) nenhuma micro-ação passa de 35% das de uma pessoa em 10 min; (c) quantos clipes distintos se viram (a
  meta: ≥ 25 numa praça de dia).

### 3.14 O plano por fases
| Fase | O que entrega | Precisa de | Prova que mostra |
|---|---|---|---|
| **0 — o chão** (sem gesto novo) | o retrato da multidão guardado; o longe a ½; o `I.tired` dado; o ato por cima de quem anda (o preso amarrado andando); a tabela tarefa → estado (`TASK_OF`); o `Anim.look` geral | nada de fora | o custo cai; «andar+parado+dormir» cai de 75% (medida da 2.1) |
| **1 — o porte** | velho, criança, cansado, frio, doente, ferido/manca, grávida, luto, medo, fúria, nobre; a porta `G.Atmos.heat` | as opções do `G.Gait` | porte por causa (4.2); o pé parado |
| **2 — o ócio, o olhar, o rosto vivo** | ~30 micro-ações, os tiques, o olhar entre pessoas, o `L.face` misturado | a porta do rosto (personagens) | a variedade (3.13) |
| **3 — os atos que faltam** | os ~35 atos de 2.2 com pose; os convertidos com perda refeitos (`weepk`, `cower`, `drink`…) | — | `qa/matriz.js` (nenhum ato em `idle`) |
| **4 — a dois** | cumprimentar, conversar variado, abraçar, beijar, consolar, brindar, discutir, xingar, empurrar, bronca, propor, mão dada | **o contrato do pilar social** (5.1) | a prova dos pares (4.2) |
| **5 — o grupo e as crianças** | o pega-pega, a roda, o cão, a bola (com a coisa), a multidão que aplaude/vaia/chora; as posturas da multidão | as cenas do mundo; a bola (coisa) | a cena (4.2) |
| **6 — o acabamento** | as linhas de som das micro-ações, a folha de gestos para o dono, os ajustes de pose por povo | — | `som.js`, as fotos |

## 4. As provas

### 4.1 O que existe (e continua verde)
| Prova | O que prova hoje | Para a revolução |
|---|---|---|
| `qa/visual/andar.js` (~20 s) | a cadência, o passo, o pé de apoio parado (< 2 cm), nada arremessado na troca, a ladeira, o degrau, o contato do clipe no golpe do mundo, 60 = 144 qps | **o modelo** da prova do porte (as opções da passada não podem quebrar nada disso) |
| `qa/visual/corpo-rig.js` (1 s) | todo estado do `Anim.STATES` dá números, os pés no chão, as mãos na ponta dos braços, nada esticado | passa a cobrir os clipes novos sozinha (ela percorre os estados) |
| `qa/visual/maos.js` | as palmas na coisa, a coisa fora do tronco e acima do chão | as coisas novas (caneca, bola, grilhões, muleta) |
| `qa/matriz.js` | todo ato do `G.Act.ANIM` tem pose no 3D (falha) | **ampliar**: todo ato que o mundo dá (`v.act = '…'` de qualquer arquivo) tem pose ≠ `idle` (a lista de 2.2 sai de lá) |
| `qa/som.js` s1 | todo gesto tem som ou silêncio dito | cobre os atos novos; acrescentar as micro-ações que soam |
| `qa/visual/bichos-gestos.js` | todo gesto de cada família posado em três momentos: números, ossos do mesmo tamanho, diferente de de-pé, nada debaixo do chão; **dois corpos** (a mordida no pescoço) dentro da tolerância; as folhas para o dono | **o modelo** da prova das pessoas: a mesma forma, para os gestos e os pares |
| `qa/visual/guarda3d.js`, `ONLY=e11 node qa/encarna.js` | o 3D só desenha; desenha sem erro de módulo | continuam |
| `node qa/guard.js` regras 113–117 | a animação é conta; o clipe nasce pelo registro; o contato na hora do mundo | e as regras novas (4.3) |

### 4.2 As provas novas
1. **`qa/visual/gestos-vida.js`** (Node, segundos; no molde do `bichos-gestos.js`): todo clipe registrado, em três momentos e
   nos dois corpos (M e F) e em três idades (criança, adulto, velho):
   - números (nenhum NaN), ossos do mesmo tamanho, nenhum osso arremessado entre quadros (< 22 rad/s, como o `andar.js`);
   - **nada debaixo do chão** (as solas e as mãos), a não ser os de deitar e ajoelhar de propósito, assentados no chão;
   - **nada atravessa o corpo**: as mãos fora do tronco e da cabeça (cápsulas do rig, com tolerância), os braços não cruzam o peito
     por dentro, a coisa da mão fora do corpo;
   - os pés plantados não deslizam (< 2 cm) nos clipes de `feet: 'plant'`;
   - **o contato na hora do mundo**: com `v.actT` no golpe, o evento `contact` do clipe cai no mesmo quadro (o que o `andar.js`
     faz para o machado, para todo clipe que tem `period` e para todo par);
   - o espelho (canhoto) dá o mesmo gesto do outro lado.
2. **Os pares** (no mesmo arquivo): para cada clipe a dois, os dois corpos à distância do clipe, virados um para o outro; no contato,
   a mão de quem abraça a menos de 5 cm das costas do outro (o ponto do rig), os troncos a ≥ 4 cm um do outro (nenhum atravessa o
   outro); longe demais, cada um no seu papel sozinho.
3. **`qa/vida3d.js`** (Node, num mundo pronto; **a causa → a pose**): para cada fator do porte e cada contexto do ócio, uma pessoa
   do mundo posta no caso pela mão da prova (o frio pelo inverno do deus, a ferida, o luto, a bebida, a gravidez, a velhice, o
   cansaço, a chuva) e conferido que o leitor dá o fator e o animador a pose (a diferença da pose de base acima de um limiar nos
   canais do fator); **e o contrário**: sem a causa, nada do fator (ninguém treme no calor). Com os casos ruins do protocolo:
   save e load no meio (o leitor refaz tudo do mundo, nada vai no save), a pessoa morre no meio (nada fica pendurado na memória da
   vista), o deus interfere (a mão do deus pega quem abraça: o outro volta ao papel sozinho), o mapa muda.
4. **A vista não muda o mundo** (dentro da `qa/vida3d.js`): o mesmo mundo vivido 60 s com o 3D a desenhar e sem desenhar dá o
   **mesmo save** (o `qa/det3.js` mostra o caminho; a impressão do mundo igual) — o leitor e o animador não escrevem nada nem
   tiram do acaso do mundo.
5. **A variedade** (3.13): na praça da metrópole, 60 pessoas, 120 s.
6. **O orçamento** (`qa/visual/desempenho.js` e uma medida em Node como a `anim-exp/multidao.js`): o quadro das pessoas no centro da
   metrópole e da mega (alta e ultra) abaixo do teto combinado; cada fase mede antes e depois, com a máquina livre (T-…).
7. **A medida de 2.1 como prova de progresso** (`anim-exp/lacunas.js` vira `qa/vida-dia.js`): a parte do dia em «andar + parado +
   dormir» e as tarefas que caem em `idle` — um número que a revolução baixa e a regressão guarda na linha de base.

### 4.3 As regras novas do guard (propostas)
- **«o leitor da vida só lê»**: o `js/vida3d.js` não escreve nada no mundo (como a regra 51 do `atmos.js`) e não tira acaso.
- **«a tarefa tem pose»**: toda tarefa de `setTask(v, { type })` está no `TASK_OF` ou dita de propósito como «a pose é a do
  movimento» (como o silêncio dito do som, `still('…')`).
- **«o porte vem do leitor»**: os `anim-*.js` leem o porte só do `L.porte` / `I` (já coberto pela regra 113).
- **«o rosto é um canal com nome»**: só o `anim-rosto.js` escreve o `L.face`; o `body3d.js` lê só canais da lista.
- **«a coisa do gesto é do inventário»**: nenhum clipe nem leitor desenha uma coisa que o `G.Inv.held` não deu (amplia a 114).

## 5. As fronteiras com os outros dois pilares

### 5.1 O contrato com o pilar social (o que ele emite, o que a animação posa)
**Os estados de longa duração** (por pessoa, no `SHAPE`, que o pilar social escreve; a animação só lê, pelo leitor):

| O que | Forma proposta | A animação usa para |
|---|---|---|
| o temperamento | eixos 0..1: `extroversao`, `confianca` (timidez no 0), `agressividade`, `impulsividade`, `empatia`; fixos (ou que mudam devagar) | o porte (peito, queixo, amplitude), a frequência do ócio, o olhar (o tímido desvia), o tempo dos gestos |
| o humor de fundo | `{ valencia −1..1, ativacao 0..1 }` ou uma palavra com intensidade (`alegre`, `triste`, `irritado`, `ansioso`, `envergonhado`, `orgulhoso`, `apaixonado`) e até quando | o rosto de fundo (`L.sente`), o porte (ombros, passo) |
| a emoção do instante | **a de hoje**: `v.emo = { k, t }` (`G.Vg.emote`, `villagers.js:200`) — manter, e acrescentar `surpresa`, `nojo`, `vergonha`, `dor` | o rosto do instante, um sobressalto do corpo |
| o que a pessoa acha de quem passa | uma pergunta pura: `G.Social.regard(v, o)` → `admira`, `respeita`, `teme`, `odeia`, `ama`, `amigo`, `desconfia`, `indiferente` (e a força) | o olhar (`L.alvo`), o cumprimento, a reverência, o desviar, o cuspir, o recuar |
| quem é notável na rua | `G.Social.notable(x, y, r)` → as pessoas de fama (o herói, o governante, o criminoso conhecido) perto | o olhar das pessoas, os murmúrios, a multidão que se vira |

**Os atos** (instantâneos, pelo `v.act` e `v.actT` de sempre; o outro pelo `t.id` da tarefa e o rosto virado `v.fx/fy`; o
papel em `t.papel = 'a' | 'b'` e a força em `t.forca 0..1`), cada um com a sua linha no `G.Audio.ATO`:

| Família | Atos propostos (nome do ato) | Papel do outro |
|---|---|---|
| encontro | `cumprimentar` (o jeito pelo povo e pela posição), `apresentar`, `despedir` | responder |
| conversa | `falar`, `ouvir`, `rir`, `concordar`, `discordar`, `contar` (a história), `fofocar` (cochichar), `perguntar` | ouvir / falar |
| afeto | `abracar`, `beijar`, `consolar`, `mao-dada`, `colo` (pegar a criança), `afagar` (o cão, a criança) | ser abraçado… |
| conflito | `discutir`, `xingar`, `ameacar` (o punho, o dedo), `empurrar`, `cuspir`, `brigar` (o combate de punhos), `separar` (quem aparta) | a mesma família |
| família | `bronca` (o adulto) / `ouvir-bronca` (a criança de cabeça baixa), `castigo`, `chamar` (a mãe que chama o filho) | — |
| roda e festa | `brindar`, `beber`, `cantar`, `dancar-par`, `aplaudir` (= `cheer`), `vaiar` (= `boo`) | — |
| pedido | `pedir`, `oferecer`, `dar`/`receber` (existe), `propor` (casamento, de joelhos), `aceitar`, `recusar`, `implorar` (= `beg`) | a resposta |
| respeito | `reverenciar` (curvar-se, ajoelhar ao senhor), `saudar` (o soldado ao chefe), `benzer` (o sacerdote) | — |
| sozinho | `chorar` (de pé, de joelhos: `weepk`), `lamentar`, `suspirar`, `contemplar`, `comemorar` (o punho no ar), `assustar` (o sobressalto) | — |
| crime | `furtar` (existe `steal`/`sneak`), `fugir`, `render-se`, `ser-preso` (`bound`, `levado`: existe), `algemar` (o guarda) | o par |

**As cenas** (de grupo): o pilar social (ou o mundo: `G.Scene`, as festas, a justiça) diz **quem está, o papel, o foco** (um ponto
ou uma pessoa) e o momento (`fase`) — o 3D dá a cada um o clipe do papel e olha o foco. Ex.: `luto` (o túmulo; os de perto
abraçados, os de longe de cabeça baixa), `aplauso` (o herói), `vaia`/`motim` (o cobrador de impostos), `roda` (as crianças),
`brincadeira` (o pega-pega: quem pega e quem foge; a bola, quando houver a coisa).

**As testemunhas**: quem viu um acontecimento (o pilar social sabe, pela memória) dá a reação do corpo nos segundos seguintes —
o susto, o virar-se, o apontar, o cobrir a boca. Hoje o crime já marca `o.saw` (`crime.js:158,181`); o contrato pede a forma geral:
`v.viu = { k: 'crime'|'morte'|'heroi'|'briga'…, de: id, x, y, t }` por alguns segundos.

**Regra para o pilar social**: o mundo põe os dois corpos de um ato a dois no lugar e virados (a distância do clipe, ±0,3 m), e
segura os dois no ato pelo tempo do clipe — a vista nunca move uma pessoa para fazer caber um abraço.

### 5.2 O contrato com o pilar dos personagens (as malhas e o rosto)
| O que | Quem | A porta |
|---|---|---|
| o esqueleto (40 ossos, a ordem, o bind) | personagens | se mudar, a animação é avisada: os clipes chaveiam **juntas da pose**, não ossos — um osso novo (o queixo, as pálpebras, os dedos separados) precisa da sua junta nova na pose (`POSE0`) e do seu canal no `CH` (`anim-body.js:40`) |
| as malhas por biotipo (gordo, magro, alto, baixo, grávida, criança, velho, sem perna) | personagens | a animação lê do `L` as medidas que mudam a pose: `L.s` (a altura), **`L.larg`** (a largura dos ombros e do quadril: os braços que não atravessam um corpo largo), `L.barriga` (a grávida, o gordo: as mãos que não entram), `L.perna` (a que falta) — o rig e a prova de nada atravessar usam as mesmas medidas |
| o rosto | personagens desenham; a animação escreve | **os canais nomeados de 3.8** em `L.face`, todo quadro; o personagem diz quais desenha (`B3.FACE_CH`), os outros são ignorados; os 11 de hoje mantidos com os nomes novos |
| a pele que sua, empalidece, chora, cora | personagens (o *shader*) | canais `sweat`, `pale`, `cry`, `blush` no `L.face` |
| as coisas no corpo | inventário / arte dos itens (já existem) | `G.Inv.held`, `G.ItemArt` |

### 5.3 Os donos dos arquivos (para três agentes ao mesmo tempo)
O `people3d.js` (2.395 linhas) e o `body3d.js` são hoje um arquivo só para o corpo, a roupa, a animação e os bichos. Proposta, no
molde do `JOGABILIDADE.md` §5 (cada parte escreve só abaixo da sua marca no `index.html`, `qa/guard.js`, `qa/AUDIT.md`):

| Arquivo | Dono | Os outros |
|---|---|---|
| `js/vida3d.js`, `js/anim-porte.js`, `anim-ocio.js`, `anim-gestos.js`, `anim-rosto.js`, `anim-duo.js`, `js/vida-clips.js`, `js/social-clips.js`, `js/anim-body.js`, `anim-clips.js`, `anim-gait.js` | **animação** | só leem |
| no `people3d.js`: `Anim.stateOf`, o `ACT`, o `ST`, `P3.lookFor`, o trecho do laço que monta o `I` (`people3d.js:1760-1790`), a multidão (`1814-1831`) | **animação** | — |
| no `people3d.js`: o `lookFill` (o retrato), `outfitOf` (a roupa), `MOOD`/`easeMood`/`faceOf` (passam a ler o `L.face`), `P3.rig`, `P3.body` | **personagens** | a animação pede medidas novas no `L` |
| `js/body3d.js`, `js/bodymesh.js`, `arte/corpo*.py` | **personagens** | a animação só lê `B3.FACE_CH` |
| os arquivos novos do social (`G.Social`), os atos e as tarefas novas em `villagers.js` / `life.js` / `crime.js` | **social** | a animação só lê |
| `js/audio-src.js` (as linhas `ATO`/`GESTO` novas) | quem cria o ato (social) ou o gesto (animação), cada um só a sua linha | — |
| `qa/matriz.js`, `qa/som.js` | o arquiteto junta | cada pilar diz as linhas |

**O primeiro passo que destrava o paralelo**: separar do `people3d.js`, antes de os três começarem, as funções da animação
(`stateOf`, `ACT`, `ST`, `stagger`, `hold`, `lookFor`, o trecho do `I`) para um `js/anim-pessoas.js`, sem mudar comportamento
(as provas de hoje verdes, a impressão do desenho igual). Assim o `people3d.js` fica do pilar dos personagens e o conflito de
*merge* desaparece. Os números do AUDIT, as decisões e as regras do guard: uma faixa por pilar, como a tabela do §6.

## 6. Os riscos
1. **O teto dos corpos inteiros**: a revolução só se vê nos 60–90 mais perto; numa praça cheia a maioria é multidão. Sem as
   posturas da multidão (fase 5) e sem pagar o custo dela (fase 0), a praça continua de cápsulas.
2. **O ato a dois depende do lugar do mundo**: se o pilar social não puser os dois na distância e no rumo, o abraço vira dois
   braços no ar. A prova dos pares precisa de pessoas do mundo, não só do estúdio.
3. **A regra 113 corta o atalho do acaso**: a variedade tem de vir do `G.hash`; uma proposta de «sortear a micro-ação» é recusada
   pelo guard (e com razão: a mesma pessoa, a mesma vida, de qualquer olho).
4. **As pernas**: aditivo nas pernas desliza o pé (medido: 1,3–1,8 cm contra 2 cm de limite) — o porte das pernas tem de ir pela
   passada, o que é trabalho no `anim-gait.js` com a prova do `andar.js` inteira.
5. **O rosto pintado**: sem osso do queixo, o grito e o riso são pintura na boca; o pilar dos personagens decide se vale um osso
   (o queixo, as pálpebras) — e então a animação ganha canais de pose novos.
6. **A memória dos clipes**: 500 clipes × 7,8 KB ≈ 4 MB, ok; se a gramática gerar milhares de variantes como clipes, não: a
   variante tem de ser aplicada na hora (tempo, amplitude, espelho), não registrada.
7. **A sincronia**: geradores com a mesma fase fazem o «estádio» (todos juntos); a fase pelo id é obrigatória e medida.
8. **O som**: micro-ação que soa sem a função pura comum dá som sem gesto (ou o contrário).

## 7. As perguntas para o arquiteto
1. O leitor (`js/vida3d.js`) pode ler a tarefa e as necessidades de cada pessoa a cada quadro (só leitura)? (Proponho: sim,
   guardado por pessoa a ~2×/s, na lista do que só se vê, com a regra «só lê».)
2. A **porta do calor** (`G.Atmos.heat`) entra no `atmos.js` (a fonte das causas do que se vê) pelo pilar das animações?
3. Os **canais do rosto**: o pilar dos personagens fica com *shader* (como hoje), ou ganha ossos do rosto? A lista de 3.8 serve aos
   dois?
4. **A bola, os grilhões, a caneca, a muleta**: entram no catálogo (`G.Itens`) e na origem (`G.Origem`) por quem? (Proponho: o
   pilar social, porque são as coisas das brincadeiras, da justiça e da taverna — a animação só as segura.)
5. **O teto de corpos inteiros** (90 no ultra): subir para 128 ou 160 no PC depois da fase 0, ou dar à multidão o animador
   barato (só a base e as posturas)?
6. **Quem escreve o `G.Audio.ATO`** dos atos sociais novos: o pilar social (quem cria o ato)?
7. **A separação do `people3d.js`** antes de começar (5.3): faz o arquiteto, ou o pilar das animações num primeiro commit sem
   mudança de comportamento?
8. **As pessoas dentro dos prédios** (183–780 das 944 da metrópole, conforme a hora): os lugares da planta (`In.places`, `pl.st`)
   dão o estado; o ócio e o rosto valem lá dentro também (a taverna, os banhos, a casa) — confirmar que o leitor lê o lugar.



