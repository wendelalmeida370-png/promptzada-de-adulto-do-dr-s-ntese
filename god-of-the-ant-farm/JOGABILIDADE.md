# A base do corpo — o plano e o contrato da jogabilidade

Este documento é o contrato da grande atualização da jogabilidade (AUDIT, seção 20, D-335 a D-339). Toda parte o lê antes de
começar, e escreve só nos seus arquivos e nas marcas deixadas para ela. O protocolo de qualidade do `CLAUDE.md` (na raiz do
repositório) vale inteiro para cada parte.

## 1. O pedido e o alvo

O dono, que joga e testa pelo celular, mas cujo alvo é o PC:

> Os bonecos andam, parece que estão cagados. É ridículo. Eu quero aprimorar muito a animação — o andar dos NPCs, do
> personagem que você encarna — o meu parâmetro são jogos AAA. […] Essa atualização vai ser a base para o futuro: caçar,
> batalhar, cortar madeira, minerar, vender coisas no mercado como comerciante, trabalhar como marinheiro, como gladiador —
> o que você quiser fazer de atividade humana. Mas para isso eu preciso de uma base, e a base reside no personagem: uma base
> de movimentação bacana (hoje é tosco de travado), uma base de interação com o ambiente (hoje é bem porca; só tem um botão,
> o E), inventário, equipamento (equipar uma espada, um escudo, uma vara de pescar, um remo…), as bases do combate e das
> futuras atividades.

**O alvo de qualidade é o de um jogo AAA em terceira pessoa** — a referência é o que um jogador de PC espera hoje (o peso do
corpo, o pé que planta no chão, a resposta imediata do controle, a câmera que não briga com o jogador, o golpe que se vê
chegar). **O alvo principal é o PC** (teclado e mouse, controle de jogo, placa de vídeo de computador): nada se corta pensando
no celular. **O celular continua jogável** (o toque, a tela que se adapta): é por ele que o dono testa.

**Um corpo só.** Quem o jogador vive e as pessoas do mundo são o mesmo corpo: as mesmas poses, as mesmas ferramentas na mão,
a mesma porta do que se segura (D-336). O mundo continua a verdade e o 3D só desenha (CLAUDE.md, «O corpo encarnado»).

## 2. O que os batedores mediram (não repita o estudo: comece daqui)

### 2.1 O andar de hoje (o corpo e a animação: `js/people3d.js`, `js/body3d.js`, `arte/corpo*.py`)

Medido no próprio rig do jogo (`qa/visual/corpo-rig.js` carregado como módulo, 60 quadros por segundo, as pessoas com a mistura
de poses a 10):

1. **O passo tem teto e a cadência dispara.** A amplitude `A = clamp(0.2 + 0.45·sp, 0.34, 0.95)` (`people3d.js` ~780) para o passo
   em 0,66 m (ciclo de 1,32 m) a partir de ~1,7 m/s. Cadência medida: 1,0 m/s → 121 passos/min; 1,4 → 141; 1,75 → 163;
   2,1 → 191; 2,6 → 236; 3,0 → 272; correndo 3,2 → 309; 4,5 → 364; 6 → 411. Gente de verdade anda a ~105–120 e corre a ~160–180.
   As pessoas do jogo andam a `v.speed` (1,25–1,5 casa/s) × 4 m × 0,35 (D-015) = **1,75–2,1 m/s**, e nas estradas ×1,3–1,4
   (2,3–2,9 m/s); só trocam para a corrida acima de 3,1 m/s. Resultado: um arrastar de pés frenético de 165–260 passos/min.
2. **O quadril afunda a cada passo.** De pé a bacia fica a 0,92; andando, 0,82–0,91 (média 0,87). A trava de 8 cm da descida da
   bacia é batida em 11% dos quadros a 1,4 m/s e 28% a 1,9 m/s; a perna de trás fica travada reta e o joelho da frente dobra
   57–60° (o real: 15–20°). A bacia sobe e desce ~10 cm por passo (o real: 4–5 cm).
3. **A mistura das poses come o andar.** A mistura exponencial de cada junta (k = 1 − e^(−10·dt)) é um filtro sobre o ciclo:
   a 1,4 m/s o quadril desenhado vai de −20 a +9° (as chaves pedem −22 a +12,5°) e o joelho do balanço chega a 44° em vez de 54°;
   correndo, 62–67° em vez de ~94°. O passo (`strideOf`) e a tabela da altura da bacia foram medidos na pose sem mistura: os
   pés plantados e a bacia não batem com o que se desenha.
4. **O pé de trás dá um tranco para trás a cada passo (defeito).** No ramo «saindo» do pé (`footWant`, ~1093-1098) o pé só termina
   de sair com o peso de apoio ≲ 0,0005; o peso misturado não desce de ~0,04, e o pé fica «saindo» o balanço inteiro: no começo
   do apoio seguinte ele é puxado de volta ao lugar de onde saiu — 27 a 36 saltos para trás de mais de 3 cm por quadro em 4 s
   andando (o pior, −32 cm num quadro a 60 qps), 44 correndo. A prova de escorregar de hoje não vê (só olha o pé de apoio).
5. **Base larga, dois trilhos.** Os tornozelos pisam a 0,16–0,21 m um do outro (o real: 0,07–0,12 m): os quadris ficam a ±0,095 e
   as pernas não abrem nem fecham no quadril; a bacia quase não passa por cima do pé de apoio (±1,4 cm de lado, ±3° de giro),
   o peito contragira só ±2,2°.

E ainda: a altura do chão é uma por pessoa (no centro: nenhum pé acha o seu chão numa ladeira ou num degrau); só `swing` e
`fight` mostram ferramenta (a vara nunca aparece pescando, a faca nunca esfolando); as pessoas mudam de lugar dentro dos prédios
por salto; as esquinas dos caminhos (A* em casas de 4 m, cordas puxadas) são viradas em 0,2–0,3 s sem antecipação; ao fim de um
caminho a velocidade suavizada decai e o corpo arrasta os pés com a amplitude mínima antes de parar. As chaves do andar em si
(`GK`, ~761-768) são próximas dos dados reais de marcha. **Esqueleto**: 40 ossos em ordem fixa (pel, spine, chest, neck, head, ombros,
braços, antebraços, mãos, dedos, polegares, coxas, canelas, pés, dedos dos pés, saia, capa, e os encaixes torch, tool, carry); a
hierarquia é código (`P3.rig`), +Z frente, +Y cima, +X a esquerda do próprio corpo, Euler YXZ; dois corpos (corpoM, corpoF), escala
uniforme `h/1.75`. Corpo perto 9.804 triângulos, meio 2.560, longe 480; até 12/30/60/90 corpos inteiros nas qualidades
baixa/média/alta/ultra (teto 96 linhas na textura de ossos). Custo de CPU por corpo não cai com a distância; `P3.look` aloca um
objeto por quadro.

### 2.2 O controle do corpo de hoje (`js/avatar.js`, `js/cam3d.js`, `js/input3d.js`, `js/modes.js`)

- Passo fixo de 1/60 s com acumulador; aceleração 15, freio 19, no ar 3,5 (90% em 0,15/0,12/0,66 s); giro 10 (180° em ~0,29 s).
  **Velocidades**: andar 1,75–2,10 m/s, correr ×2,05 = 3,6–4,3 m/s (D-015 amarra o andar ao das pessoas).
- **O fôlego da corrida acaba em 5 s** (dreno 20/s; volta 16/s, ×0,6 andando) e depois o corpo **pisca entre correr e andar** (sem
  histerese). A animação de correr só começa a ×1,3 do andar; o dreno a ×1,2.
- **A pose e o rumo não são interpolados** (só a posição): a 60 Hz com quadros irregulares o corpo congela ou salta, e em telas de
  120/144 Hz anda a 60.
- **Degraus de até 0,6 m sobem num salto seco de altura**; descidas de até 0,45 m também; a câmera alivia a altura a 12/s, o corpo
  não.
- **Sobe sozinho** em qualquer borda de 0,6–2,6 m depois de encostar 0,22 s; o rumo **estala** ao subir, ao tomar um lance de escada,
  ao levar um golpe, ao sentar.
- **Colisão por eixo** (X, depois Z), sem correção de canto: o corpo para nos cantos em vez de deslizar; árvores e a fonte
  empurram a posição sem projetar a velocidade.
- **A câmera**: com o mouse parado 1,8 s ela volta a seguir as costas — segurar A ou D faz o corpo andar em círculo; ela puxa a
  inclinação de volta a 0,22 contra a escolha do jogador; a colisão a traz para dentro de uma vez, em degraus de 0,2 m, e a
  encolhe ×0,75 por quadro; **a mira travada (`C3.lock`) existe mas ninguém a usa**; o campo de visão só abre acima de 4 m/s.
- **Toda ficha, painel ou diário solta o mouse** (`Input3D.unlock()` + `clear()`): o olhar só volta com outro clique, e as teclas
  seguradas são esquecidas. **Nenhum controle de jogo** (não há `getGamepads`).
- O agachar (C segurado) é só ×0,45 da velocidade e uma pose. Nadar existe (`caps.swim`).
- **Acoplamento escondido**: `space.js` fixa `BODY_R = 0.32` e `STEP_UP = 0.6`, e `Interiors.BODY` tem r 0,32 / degrau 0,6 —
  todos os degraus das portas foram feitos para esses números: **não mude o raio nem o degrau do corpo** (quebra as portas).

### 2.3 A interação de hoje (`js/interact.js`, `js/possess.js`, `js/activity.js`, `js/incui.js`)

- Uma tecla de mundo (E). `Interact.best` dá **um alvo e um verbo** (a nota: alcance, ângulo, prioridade; desempates escritos à mão);
  a lista de provedores `I.list` (`{ id, prio, reach, find, label, can, run, … }`) já é um registro, mas de um verbo por alvo.
- Segurar E só repete o golpe (árvore, pedra) a cada 0,15 s. Destaque só em pessoas. A pista (`Interact.lead`) só aponta descargas.
- O ato do corpo: `Avatar.act({ anim, dur, contact, lock, world, op, then, fail, keep, cut, reach, vact, to, free })`; no contato,
  `Possess.apply(w => op(w))` entra na fila que o passo do mundo roda (L-139); as atividades do mundo: `Possess.apply(() =>
  Act.begin(...))` no aperto, `Act.commit` no contato, `Act.abort` no corte (L-157). O trabalho do corpo dura os segundos do mundo
  de quem faz o mesmo (D-035); só o menu pausa o mundo (D-036).
- **Guardados**: `G.Depot` com lugares `f:` povo, `h:` casa, `b:` prateleira, `z:` banca, `q:` cais, `s:/l:/r:/y:` porões, `v:` as
  mãos (uma carga), `p:` bolsa (só moedas), `g:` chão, `o:` obra, `c:` carroça; `D.addKind(kind, adaptador)` acrescenta lugares
  (adaptador `{ obj, get, room, take, put, list, owner, items? }`); `D.may(v, ref, modo)` diz quem pode. Livro-razão
  `[n, dia, relógio, de, para, bem, quanto, op, código, quem]`. O `interact.js` ainda escreve `w.carry` direto para a lenha, as
  frutas e a pedra (fora do depósito).
- Faltam: mochila, equipamento, mais de uma tecla de mundo, ações de segurar, pegar e largar qualquer coisa, a tela dos
  guardados, usar móveis (o registro `useRule` existe e ninguém o usa), o destaque do que se mira.

### 2.4 Os itens, o combate e o trabalho do mundo (`js/economy.js`, `js/war.js`, `js/villagers.js`…)

- Ferramentas e armas são só contagens anônimas no armazém (`ferramentas`, `armas`); não há armadura, escudo nem roupa como bem.
  A forja faz 6 por fornada (escolhe armas na guerra); o desgaste tira 1 ferramenta em 8% das unidades dos ofícios; a leva tira
  `armas` à mão (`f.stock.armas -= 1`) e devolve na baixa.
- **As armas das pessoas são abstratas**: `v.arm` ('arco' ou nada), `v.elite`, `v.unit` (lanceiro, espadachim, arqueiro,
  cavalaria, elite, milícia). O 3D escolhe a ferramenta pelo ato (`TOOL_OF`) ou pelo papel (lança para guerreiro, caçador, vigia;
  cajado para o ancião) — agora `G.Inv.kit` (D-336).
- **A luta é de sorteios**: alcance 0,85 casa, recarga 0,8–1,1 s, acerto 0,72 (`Wr.hitChance`), dano por papel × modificadores
  (`Wr.damage`, `G.Army.dmgMul`); arco de 1,1–5,2 casas. Vida 0–100 por uma porta só, `Vg.damage` (o `possess.js` a embrulha para
  anotar os golpes no corpo). Tontura (`stagT`), derrubada (`downT`), perda de braço (`v.lost`), decapitação, flechas cravadas
  (`Carnage.onHit`). Contra bichos: `G.Animals.damage`; dos bichos: a mordida (o `G.Corpo.blow` atrasa o golpe ao contato no
  corpo vivido).
- O trabalho das pessoas: cortar (`chopTask` → `G.Nature.fellTree`), pedra (`mineTask`, 3,8 s), pedreira, mina (`minejob`), pesca
  (`G.Pesca.castDur/cast`: mãos/lança/linha/rede), caça (`huntTask` + `Riches.carcass` esfolar 4 s), abate, lavoura, rebanho,
  ofícios (`G.Act` 'oficio'), obra, carga, mercado (`G.Biz`), marinheiros (sem remar: a tripulação só acelera o navio).
- **Campos novos numa pessoa**: entram no `SHAPE` (`villagers.js`); o save copia o objeto inteiro; o load passa pelo `Vg.shape` e
  pelo reparo (`repairV`); ausente e `undefined` são o mesmo (CLAUDE.md).

### 2.5 As provas (o que existe e o que quebra)

- `qa/visual/corpo-rig.js` (Node, ~25 s): os 40 estados × 8 fases dão números, nada esticado, pés no chão, o pé plantado não
  escorrega, a roupa fora da pele, ninguém nu, o nível de detalhe; os nomes dos estados estão escritos nele, e `bend()`/`cloth()`
  copiam o sombreador do `body3d.js` linha a linha — **mudou o sombreador ou os ossos, mude lá também**.
- `qa/encarna.js` (navegador, 3 h+; partes por `ONLY=`): e2 (anda > 0,7 × `caps.walk` × 140/30 a 33 ms; o `walkTo` copia a
  fórmula da velocidade e contorna pelo `st.block`), e6 (nunca em chão que não se pisa, nunca abaixo do chão, a câmera nunca no
  sólido; salto > 0,4), e10 (o menu pausa o relógio, refazer teclas, G e I, o toque anda > 2 m em 60 quadros), e11 (o 3D desenha
  sem erro de módulo; `People3D.lookFor`), e13/e15 (nomes de animação e de feitos), e9/e13/e15/e16/e18 chamam
  `G.Interact.run({ id, t })` direto, e17 (`/^Pegar /`).
- As provas do corpo em Node (`visual/corpo-casa`, `soleira`, `porta`, `pe-da-escada`, `salvo-dentro`, `obra-corpo`,
  `chao-aberto`, `termas-corpo`, `pontes`…) pedem o alvo a 0,15 m e chamam o corpo de preso depois de 25 quadros parado:
  **mais embalo pode passar do alvo** — ajuste o ajudante da prova com um T- no AUDIT, nunca a regra.
- `qa/corpo-fera.js` (Node, ~15 s): o corpo nunca dentro de um bicho; `qa/visual/maos.js` (as mãos nas cargas); `qa/matriz.js`
  (todo ato do `G.Act.ANIM` tem pose no 3D); `qa/som.js` (todo gesto e ato tem a sua linha de som, regra 54); `qa/sabe.js` (a
  tela do corpo pergunta ao `G.Possess.knows`); `qa/visual/corpo-mundo.js` (o corpo trabalha no ritmo de quem faz o mesmo; o
  mundo pausado não termina ato; o acaso do mundo só no passo).
- **Navegador**: no máximo dois na máquina inteira — rode sempre por `bash qa/navegador.sh node qa/…`; a lógica na qualidade
  `baixa`, as fotos na `media`; quadros dirigidos à mão (`G.Main.frameFor(33, true)`). **Pastas de saída**: toda prova recebe a
  sua (a sua pasta de rascunho); nunca a padrão — o `oldsave.js` sobrescreve `qa/oldsave_<semente>.json`, o `prontos.js` escreve
  `worlds/`, o `junta-inv.js` escreve o `qa/qa.js`.

## 3. As partes e as ondas

**Onda 1 — os alicerces, em paralelo:** 20a, 20b, 20c, 20d. Depois da junção e das provas, uma versão publicada para o dono testar
(o andar e o controle são o que ele mais sente). **Onda 2 — a jogabilidade, em paralelo, sobre os alicerces já juntos:** 20e, 20f,
20g. Cada parte é um agente que trabalha na sua árvore (`git worktree`), a partir do commit do contrato, e entrega commits na sua
própria branch, sem empurrar; o arquiteto junta.

### 20a — A animação das pessoas (onda 1)

**Dono de**: `js/people3d.js` (o lado das pessoas — os bichos são de outros), `js/body3d.js`, `js/bodymesh.js` e `arte/corpo*.py`
(só se precisar mudar o esqueleto ou a malha), os arquivos novos da animação (`js/anim-*.js`, na marca 20a do `index.html`), a
função `animate` do `avatar.js` e a linha que alimenta o `People3D.avatar` (D-338), `qa/visual/corpo-*.js` e as provas novas da
animação.

**Entrega:**
1. **O andar, a corrida e o resto do movimento num nível AAA**, para as pessoas e para o corpo do jogador: ficar de pé (o peso que
   troca de pé, a respiração, as variações), andar (do passeio ao passo apressado), trote, corrida, disparada, agachado, as
   cargas (cada pega), o arranque e a parada (antecipação e inércia), a virada no lugar e o giro de 180°, a curva com inclinação,
   a ladeira e o degrau (**cada pé acha o seu chão**: IK das pernas por pé, a bacia que desce o que precisa), nadar, saltar, cair,
   aterrissar, ser derrubado e levantar. **Corrija as cinco causas da seção 2.1** com números; a cadência e o comprimento do passo
   seguem a velocidade como na gente de verdade (passo que cresce com a velocidade; a troca para o trote onde a gente troca, ~2,0–
   2,3 m/s), sem teto artificial.
2. **A mistura de poses que não come o movimento**: o ciclo do andar é calculado direto da fase (sem filtro exponencial por junta);
   a transição entre estados por pesos (cruzamento), com a fase casada entre andar, trote e corrida.
3. **As camadas**: a base (locomoção ou postura), a parte de cima (o que as mãos seguram — por `pega` do catálogo: punho, duas, escudo,
   arco, vara, tocha, alça —, as cargas), a ação (um gesto inteiro ou só de cima, com o seu tempo e o seu contato) e o aditivo
   (respirar, mancar, cansaço, bebida). **A infraestrutura das ações para a onda 2**: um formato de clipe (chaves por junta no tempo
   normalizado, máscara, entrada e saída, eventos — o contato), um registro (`G.Anim3D.clip(id, def)` ou equivalente documentado),
   tocar um clipe casando o contato com o tempo do mundo (o `contact` do `G.Act.ANIM`, que hoje as pessoas ignoram), e **um guia
   escrito aqui (seção 4.6) de como a onda 2 escreve os seus clipes**. Refaça com a qualidade nova os gestos de trabalho que mais
   se veem (cortar, minerar, cavar, colher, martelar, pescar — com a vara —, esfolar — com a faca —, carregar, conversar, interagir,
   sentar, dormir, comer, rezar, acenar, lutar).
4. **As coisas no corpo**: o que a pessoa segura vem do `G.Inv.held(v)` (D-336) — tire a escolha da ferramenta do 3D (`TOOL_OF`,
   `toolK`) e pergunte ao inventário; as coisas nas mãos (pela `pega`), nas costas e no cinto (encaixes novos calculados dos ossos —
   o peito e a bacia — sem ossos novos, de preferência); a forma de cada coisa do `G.ItemArt.geo(chave, nível)`, com as formas de
   hoje (`makeTools`) como reserva enquanto a arte (20d) não chega; IK das duas mãos nas coisas de duas mãos (`G.ItemArt.grip`).
5. **As pessoas do mundo andando bem**: a esquina antecipada (olhando o caminho à frente, `v.path`, só lendo), o arranque e a
   parada, o giro com inclinação, nada de deslizar; quem muda de lugar dentro de um prédio anda até lá no desenho (ou ao menos não
   salta à vista).
6. **O corpo do jogador**: o `animate` do `avatar.js` pelo sistema novo, lendo o movimento que a parte 20b expõe (seção 4.4), com a
   pose calculada no quadro (interpolada), não no passo fixo.
7. **O custo**: o PC é o alvo (a qualidade não se corta), mas o desenho de quem está longe custa menos (atualizar o meio e o longe
   com menos frequência, nada alocado por quadro); meça antes e depois (`qa/visual/corpo-estudio.js` imprime chamadas e
   triângulos; `qa/visual/desempenho.js`).

**Provas (todas em números, não só fotos)**, em `qa/visual/corpo-rig.js` ou numa prova nova (`qa/visual/andar.js`): a cadência
dentro da faixa humana em cada velocidade (andar 0,8–2,0 m/s: ~95–135 passos/min; trote e corrida 2,5–6 m/s: ~150–185); o comprimento
do passo coerente com velocidade/cadência; o pé de apoio parado (< 2 cm por apoio); **nenhum tranco do pé no balanço** (nenhum
salto > 3 cm/quadro fora da trajetória); a bacia (média ≥ 0,97 da altura de pé ao andar; oscilação vertical 3–6 cm); o joelho na
batida do calcanhar < 10° e o pico do balanço 55–70° andando, 85–115° correndo; a largura do passo 5–13 cm; a cabeça mais estável
que a bacia; nenhuma junta com velocidade absurda numa transição; os pés no chão numa ladeira e num degrau. **Fotos e tiras para o
dono** (antes e depois, de lado e de frente, andar, trote, corrida, a carga, um gesto de trabalho; um GIF animado se puder), pelas
ferramentas que existem (`corpo-filme.js` + `arte/corpo_filme.py`, `corpo-estudio.js`, `corpo-fotos.js`, `compara.py`).
Mantenha verdes: `corpo-rig.js`, `guarda3d.js`, `ONLY=e11 node qa/encarna.js`, `maos.js`, `matriz.js`, `som.js` (gesto novo = linha
de som), `roupa.js`, `pontes.js`, `dupla.js`, `corpo-fera.js`.

### 20b — O movimento do corpo (onda 1)

**Dono de**: `js/avatar.js` (tudo, menos a função `animate` e a linha do `People3D.avatar` — da 20a), `js/cam3d.js`,
`js/input3d.js`, `js/modes.js` (o controle, o tempo do corpo), o `space.js` só no que o controle usa (sem mudar `BODY_R` nem
`STEP_UP`), os controles de toque do `js/incui.js` (`.ih-touch`, o bastão) e a marca 20b do `css/style.css`.

**Entrega:**
1. **Um controle de terceira pessoa que responde como um AAA**: andar, trote e disparada (analógico no bastão e no controle de jogo;
   no teclado, o andar e o correr pensados para o PC), aceleração e freio com peso mas sem atraso, o giro do corpo para a direção
   pedida (rápido parado, suave em velocidade; o giro de 180° com a sua pose — a 20a a desenha), **o andar de lado** quando a mira
   está travada ou mirando (o rumo do corpo separado do rumo do passo), o salto e a queda com a sensação certa.
2. **Sem trancos**: o rumo e a posição interpolados entre os passos fixos (o quadro vê um corpo contínuo em 60, 120 ou 144 Hz);
   **o degrau alisado** (a altura desenhada do corpo e a câmera sobem e descem o degrau numa curva curta, sem mudar onde os pés
   pisam no mundo); **nada de estalos de rumo** (ao subir, ao tomar um lance, ao levar um golpe, ao sentar: o corpo gira).
3. **A colisão que desliza**: correção de canto (o corpo contorna a quina em vez de parar), a velocidade projetada nas árvores e
   nos postes, nada de ficar preso; **subir uma borda só quando o jogador pede** (o salto junto dela), não ao encostar.
4. **O fôlego**: o trote não cansa (ou quase), a disparada cansa e acaba devagar, com histerese (sem piscar); o agachar de verdade
   (alternar), mais baixo e silencioso; **a esquiva** (um passo ou um rolar curto, com custo de fôlego e tempo de recuperação — a
   parte do movimento; a invulnerabilidade é da onda 2).
5. **A câmera de um AAA**: segue sem brigar (nada de andar em círculo ao segurar A ou D; a inclinação do jogador fica), a colisão
   suave (sem degraus de 0,2 m, sem encolher aos solavancos), a troca de ombro, o campo de visão na disparada, **a mira travada**
   (uma porta para a onda 2 escolher o alvo: `G.Cam3D.lockOn(alvo)` / `unlock()`, e o corpo andando de lado em volta dele), o modo
   de mira por cima do ombro (para o arco da onda 2).
6. **As teclas**: o registro de ações do contrato (D-339) com **os botões do mouse ligáveis** (`mouse0`, `mouse1`, `mouse2`; a roda),
   **o controle de jogo** (a API Gamepad, o mapa padrão: bastão esquerdo anda, direito olha, zonas mortas e curva de resposta, cada
   botão uma ação), **o toque** (o bastão com zona morta e o limiar da corrida; os botões de ação que aparecem conforme o
   contexto — a 20c põe o da mochila, a onda 2 os do golpe e da defesa —, todos pelo registro), **o mouse que não se solta** sem
   necessidade (ao fechar um painel o olhar volta sem outro clique, quando o navegador deixa), nenhuma tecla presa ao perder o
   foco. Deixe definidas, para a onda 2, as ações `outra` (F, o segundo verbo), `atacar` (mouse0), `defender` (mouse2), `esquivar`,
   `travar`, `guardar` (guardar/sacar a arma) — com teclas padrão que não brigam com nada (atenção: no navegador, Ctrl+W fecha a aba).
7. **O que a animação lê** (seção 4.4) e **a porta das ações com movimento** para a onda 2 (seção 4.5).
8. **O ritmo do mundo no corpo (D-015)**: as pessoas andam a 1,75–2,9 m/s no desenho por causa do 0,35 do tempo do corpo — rápido
   para um andar natural. Meça e **proponha** (uma decisão D- com números: o tempo do corpo, a duração do dia, o trabalho em segundos
   do mundo, as provas que mudam), sem mudar sozinho se o custo for alto; o andar da 20a precisa ficar bom em qualquer caso.

**Provas**: o que existe continua verde (encarna e2, e6, e10, e13, e14 e as provas do corpo em Node da seção 2.5 — ajustes nos
ajudantes das provas, quando o embalo novo é a causa, com o seu T- e a razão), e as novas: o corpo nunca preso numa quina (uma
volta pelas ruas de uma cidade pronta sem parar), o degrau sem salto de altura desenhada, o rumo sem estalo (nenhuma variação de
rumo maior que o giro permite num quadro), o fôlego sem piscar, a câmera sem andar em círculo, o controle de jogo e o toque
(eventos sintéticos), a esquiva, a mira travada; o tempo de resposta (do aperto à primeira mudança de velocidade).

### 20c — O inventário e o equipamento (onda 1)

**Dono de**: `js/itens.js` (o catálogo: completar — materiais, medidas, nomes, as conversões dos bens), `js/inventario.js` (o
`G.Inv` inteiro), `js/inv-ui.js` (a tela da mochila e a barra de atalhos), as marcas 20c (`index.html`, `css/style.css`), as provas
novas do inventário.

**Entrega:**
1. **A mochila**: o lugar `'m:<id>'` do `G.Depot` (`D.addKind('m', …)`), com a capacidade pelo peso (e o que a força e a idade
   deixam), quem pode tirar e pôr (`D.may`), o livro-razão em tudo; as coisas da mochila contam onde o jogo conta os bens de uma
   pessoa (veja `D.total`).
2. **O equipamento**: `v.equip` (`mao`, `outra`, `costas`, `cinto`, `cabeca`, `corpo`, `atalhos`), equipar, guardar (sacar e embainhar:
   da mão para as costas ou o cinto e de volta), as coisas de duas mãos, a carga nas mãos (`v.carry`) que tira as coisas das mãos;
   **a invariante**: o que está equipado está na mochila.
3. **As portas do mundo** (para o corpo, pelo `Possess.apply`, e para quem mais precisar): dar, tirar, largar no chão (`S.loose`, pelo
   `D.drop` do `activity.js`), pegar do chão, guardar numa casa, **trocar um bem do armazém por uma coisa** (`ferramentas` → um machado
   do melhor material que o povo sabe fazer, só o povo da pessoa, no livro) e a volta; **a morte** (`G.Inv.onDeath`: as coisas de
   verdade vão para o chão onde a pessoa caiu ou para a casa — decida e escreva a razão).
4. **O kit e as coisas de verdade**: o `G.Inv.kit` mais rico e fiel ao mundo (o arqueiro com o arco, `v.arm`; o soldado de cada
   unidade, `v.unit`; o pescador com a vara; o escudo de quem o mundo diz que luta com um) — **puro, e sem mudar nenhum resultado do
   mundo** (a luta das pessoas continua a de hoje; a onda 2 decide o que as coisas mudam). **Decida (D-) de onde vêm as coisas de
   quem o jogador encarna**: a recomendação do arquiteto — as ferramentas do ofício são da pessoa, e na primeira vez que alguém
   precisa delas como coisas (o corpo vivido) elas se tornam coisas uma vez só, no livro (código `kit`), nunca duas para a mesma
   pessoa; as outras vêm do armazém, do mercado, do chão.
5. **A tela** (`G.InvUI`): um inventário de jogo de PC à altura do resto da interface (o estilo das fichas do corpo — `css/style.css`,
   `incui.js`): a mochila em grade com as figuras (`G.ItemArt.icon`, com um sinal de reserva enquanto a arte não chega), o peso e o
   limite, o boneco com os lugares do corpo, a ficha de cada coisa (o nome, o material, o peso, para que serve), arrastar e soltar
   no PC, tocar e escolher no celular, a tecla I (`inventario`), Esc fecha; **a barra de atalhos** (1 a 5, `rapido1`…`rapido5`, e no
   celular tocável) em `.ih-hotbar`; abre como painel (`G.Modes.setPanel`), fecha com os outros (`G.IncUI.closers`); **o que a tela
   mostra pergunta ao `G.Possess.knows`** quando for o caso (regra 56). Abrir a mochila não pausa o mundo (como as fichas: D-036),
   mas segura o corpo.
6. **O save**: os campos no molde (já estão: `mochila`, `equip`), o reparo de um campo danificado (números, chaves desconhecidas,
   tamanho), um save antigo sem eles, o `QA.canonMore` para a ida e volta.

**Provas**: `qa/inventario.js` (Node: pegar uma ferramenta no armazém, equipar, guardar, largar, pegar do chão, carga nas mãos com
espada na mão, salvar e carregar no meio, a morte com coisas, um save danificado, um save antigo, o kit e as coisas de verdade, a
capacidade), `qa/inventario-inv.js` (o verificador: contagens finitas e ≥ 0, o equipado na mochila, a capacidade, nenhuma chave
desconhecida, o livro bate) juntado por `node qa/junta-inv.js`, as regras do guard (127–134), e uma prova da tela no navegador
(abrir, arrastar, equipar pelo mouse e pelo toque, a barra de atalhos). Mantenha verdes: `atividades`, `moedas`, `casa`, `sabe`,
`oldsave`, `corrupt`, `corpo-mundo`.

### 20d — A arte dos itens (onda 1)

**Dono de**: `js/itemarte.js` (o `G.ItemArt`), os arquivos gerados das formas e das figuras (por exemplo `js/itemmesh.js`,
`js/itemicons.js`, na marca 20d do `index.html`), o caminho que os gera (`arte/itens*.py` — o Blender do `bpy`, como os bichos e as
malhas `mesh-*.js` —, ou código), a linha nova do `arte/LICENCAS.md`, as provas da arte dos itens.

**Entrega:**
1. **A forma 3D de cada tipo do catálogo** (`G.Itens.KINDS`) **em cada material** (a pedra, o bronze, o ferro, a madeira: o material
   se vê), em três níveis de detalhe, no quadro do D-337 (a origem no punho, +Y para a ponta que trabalha, +Z o fio ou a face),
   na direção de arte do jogo (`arte/BIBLIA.md`: a luz e o traço do resto), com orçamento de triângulos (diga qual); `G.ItemArt.geo`.
2. **As pegas**: `G.ItemArt.grip(chave)` (`main` na origem; `off` onde a outra mão pega, nas coisas de duas mãos) e onde a coisa
   fica guardada nas costas e no cinto (uma sugestão de encaixe por coisa, que a 20a usa).
3. **As figuras** para a tela do inventário: `G.ItemArt.icon(chave)`, uma imagem por chave (os materiais diferentes), fundo
   transparente, o mesmo estilo e a mesma luz em todas, num tamanho que fique nítido numa tela de PC e no celular; embutidas
   (`data:`), nada baixado em tempo de jogo (`arte/LICENCAS.md`).
4. **O custo**: o tamanho dos arquivos novos e os triângulos de cada nível, medidos.

**Provas**: `qa/visual/itens-arte.js` (Node: toda chave do catálogo tem forma nos três níveis dentro do orçamento, normais e números
finitos, a caixa de cada forma no quadro do D-337 — o cabo saindo da origem para +Y —, a pega da outra mão dentro da forma, toda
chave tem figura); uma folha de fotos (todas as coisas, de dois lados, e as figuras) para o dono; `guarda3d.js` verde.

## 4. As portas (o contrato entre as partes)

### 4.1 O catálogo — `G.Itens` (`js/itens.js`, puro, regra 112)
- `G.Itens.KINDS` (os tipos), `G.Itens.MATS` (os materiais), `G.Itens.SLOTS`, `G.Itens.SLOT_NOME`.
- `G.Itens.def(chave)` → a descrição inteira (congelada) de uma coisa ou de um bem, ou `null`: `{ id, kind, mat, nome, plural, tipo,
  maos, slots, pega, peso, bem, vale, tags, mats, tech, dano, alcance, coisa }`.
- `G.Itens.parse(chave)` → `[tipo, material]`; `G.Itens.key(tipo, material)`; `G.Itens.isThing(chave)`; `G.Itens.nome(chave, n)`;
  `G.Itens.has(chave, tag)`; `G.Itens.withTag(tag)`; `G.Itens.fits(chave, lugar)`.
- A 20c completa (pode acrescentar campos e funções; não renomeia nem tira os de cima).

### 4.2 O que a pessoa leva e segura — `G.Inv` (`js/inventario.js`, do mundo, regra 111)
- `G.Inv.held(v)` → `{ mao, outra, costas, cinto, cabeca, corpo, real }` (chaves ou `null`): as coisas da pessoa quando ela tem alguma,
  senão o kit. **A única pergunta** do 3D, do combate e dos ofícios sobre o que alguém segura.
- `G.Inv.kit(v)` → o mesmo formato, derivado do ofício e do ato (puro); `G.Inv.ACT_TOOL` (o ato → a ferramenta).
- `G.Inv.onDeath(v, causa)` — chamada pela morte (`activity.js`).
- A 20c acrescenta (e documenta aqui): a mochila (`bag`, `cap`, `room`…), equipar e guardar, dar, tirar, largar, pegar, as conversões
  dos bens, os atalhos — as que mudam o mundo só no passo do mundo (o corpo pede pelo `Possess.apply`).
- Os dados: `v.mochila` `{ chave: n }`; `v.equip` `{ mao, outra, costas, cinto, cabeca, corpo, atalhos: [5] }` — no `SHAPE`.

### 4.3 A forma de cada coisa — `G.ItemArt` (`js/itemarte.js`, só se vê)
- `G.ItemArt.ready`; `G.ItemArt.geo(chave, nível)` → `THREE.BufferGeometry` (com as cores) no quadro do D-337, ou `null`;
  `G.ItemArt.grip(chave)` → `{ main: [x, y, z], off: [x, y, z] | null }`; `G.ItemArt.icon(chave)` → um `data:` URL ou `null`.
- A 20d pode acrescentar (`stow(chave, lugar)` — o encaixe sugerido nas costas e no cinto —, o material, os níveis) e documenta aqui.
- (20a lê:) `geo(chave, nível)` nos três níveis do corpo (sem forma, as formas antigas do `people3d.js`); `grip(chave).off` para a
  outra mão nas coisas de duas mãos (sem ela, um ponto por tipo); `stow(chave, 'costas' | 'cinto')` → `{ p: [x, y, z], y: [x, y, z],
  z: [x, y, z] }`, em metros do corpo: `p` onde fica o punho, `y` para onde vai o cabo, `z` a frente da coisa — nas costas, no quadro
  do peito; no cinto, no da bacia (sem ele, um encaixe por tipo).

### 4.4 O movimento que a animação lê (a 20b expõe, a 20a lê)
O estado do corpo (`b`, o do `avatar.js`) ganha, escritos só pelo controle: `gait` ('parado' | 'andar' | 'trote' | 'disparada' |
'agachado'), `accX`/`accZ` (a aceleração do passo, m/s²), `turnV` (a velocidade do giro, rad/s), `strafe` (o rumo do corpo separado
do passo: mira travada, mirando), `aimYaw` (para onde o corpo olha ou mira), `crouch`, `dodge` (a esquiva em curso: fase e rumo),
e o rumo interpolado do quadro. `G.Avatar.motion()` devolve uma cópia de leitura disso tudo (a posição e o rumo interpolados, a
velocidade, o chão, o modo de andar, o ato). A 20a lê com defesa (se um campo não existe, o sistema funciona sem ele).
(20a lê, a cada quadro desenhado, na função `frameDrive` do `avatar.js`: `yaw`, `speed`, `accX`/`accZ`, `turnV` e `gait` — o trote e
a disparada fazem a corrida, o andar abaixo de 2,6 m/s fica andar —; sem eles, o rumo e a velocidade do próprio corpo. O `strafe`, o
`aimYaw`, o `crouch` e o `dodge` ainda não mudam a pose: o andar de lado e a esquiva têm a pose da onda 2.)

### 4.5 As ações com movimento (a 20b faz a porta, a onda 2 usa)
O `Avatar.act` ganha: o empurrão do próprio gesto (`drive`: uma curva de velocidade no rumo do corpo — o avanço de um golpe, o
rolar da esquiva), quanto o corpo ainda anda durante o ato (`moveScale`), as janelas em que o ato pode ser cortado por outro
(`cancelAt`), o giro permitido durante o ato, e o ato que vira para o alvo travado. Documente a forma final aqui.

### 4.6 Os clipes (a 20a faz e documenta aqui o guia para a onda 2)
Um **clipe** é um gesto do corpo em chaves no tempo dele (0 a 1): o machado descendo, a picareta, a vara lançada. Mora no
`js/anim-clips.js` (`G.Anim3D`, só se vê: regra 113) e é tocado pelo animador (`js/anim-body.js`) na camada das ações, por cima
da base (o corpo parado nos pés que o clipe pede, ou a passada de quem anda).

**O registro.** `G.Anim3D.clip(id, def)` — uma vez por id (um segundo com o mesmo id é recusado e contado em `G.Anim3D.clipErr`,
que as provas leem). Um arquivo que carrega antes do `anim-clips.js` põe na fila: `(G.ANIM_CLIPS = G.ANIM_CLIPS || []).push([id,
def])`; depois dele, o `push` registra na hora. Ninguém escreve o `G.Anim3D.CLIPS` à mão (regra 116). Para um ato do mundo
(`v.act`) ou do corpo (`a.vact`) mostrar o clipe, o clipe diz os seus atos (`acts: ['golpe']`) — um ato que outro clipe já mostra é
recusado e contado —; os clipes da 20a estão na tabela `CLIP_OF` do `anim-clips.js` (a regra 116 confere que cada um existe).

**O formato** (`def`):
- `keys: { junta: [[u, valor], …] }` — as chaves de cada junta, `u` de 0 a 1, interpoladas por Catmull-Rom (as chaves não precisam
  ser igualmente espaçadas). Os ângulos em **graus** (`deg: false` para radianos); `bob`, `crouch`, `shift`, `grip`, `gripL`,
  `offW`, `tool`, `holdW`, `lie` são números (metros ou pesos). As juntas: `shLp`/`shRp` (o ombro para a frente é **negativo**),
  `shLr`/`shRr` (abrir o braço: + no esquerdo, − no direito), `shLy`/`shRy`, `elL`/`elR` (dobrar o cotovelo, +), `wrist`/`wristL`
  (+ a coisa desce ao longo do antebraço), `lean` (curvar o tronco, +), `twist` (+ para a esquerda do corpo), `sway`, `neck`,
  `lookY`, `crouch` (fração da altura da bacia), `bob`, `shift`, `pelY`/`pelR`/`pelP`, `hipL`/`hipR` (a coxa para a frente é
  **negativa**), `knL`/`knR` (+ dobra), `anL`/`anR` (+ ponta para baixo), `grip`/`gripL` (fechar a mão), `offW` (a outra mão na
  coisa de duas mãos, 0–1), `tool` (1: a coisa da mão em uso).
- `dur` (segundos de uma volta, quando ninguém dá o tempo), `loop` (padrão `true`; `false` para um gesto de uma vez, que segura as
  pontas).
- `mask` — que juntas o clipe move: `'full'` (padrão), `'upper'` (braços, cabeça, tronco: a pessoa pode andar por baixo), `'arms'`,
  `'armR'`, `'armL'`, `'head'`, ou uma lista de juntas. As outras são da base.
- `in` / `out` — os segundos para entrar e sair (0,22 / 0,28); a troca é amortecida pelo animador (nada salta num quadro).
- `feet` — `'plant'` (padrão: os pés ficam onde pisam), `'free'` (o clipe move os pés: ajoelhar, agachar); `stance: [meia
  largura, o pé esquerdo à frente, o direito]` em metros — os pés dão os passos até lá e ficam.
- `base` — a postura de baixo (`'idle'`, `'sit'` para comer sentado…).
- `item: { hand: 'mao', two: true }` — o clipe usa a coisa da mão que o `G.Inv.held` diz (nunca escolhe a ferramenta); `two`: a
  outra mão vai ao cabo (`G.ItemArt.grip(chave).off`, pela IK de dois ossos), na medida do `offW`.
- `events: { contact: u }` — o momento em que o gesto bate (o machado na madeira). Outros eventos podem ser acrescentados (0–1).
- `period` — para as pessoas do mundo: os segundos do mundo entre um golpe e o próximo (o relógio `v.actT`).

**O contato no tempo do mundo** (regra 117). Uma pessoa do mundo: o clipe anda no relógio do golpe dela —
`G.Anim3D.loopTime(c, v.actT, c.period)` põe o `contact` do clipe no instante em que o mundo conta o golpe (`t = period, 2·period…`).
O corpo do jogador: o tempo do ato (`a.t / a.dur`) é torcido por `G.Anim3D.warpTime(c, k, a.contact / a.dur)` para que o contato do
clipe caia no contato do ato (`G.Act.ANIM`: `dur`, `contact`). Nunca um relógio próprio do desenho. O som do golpe é do mundo
(`G.Audio.GESTO`, regra 54) e cai no mesmo instante.

**Ver um clipe.** Numa tira, sem navegador: `node qa/visual/corpo-filme.js ID 0 8 5 /tmp/x.bin` e
`python3 arte/corpo_filme.py /tmp/x.bin saida.png 1.2 200` (o ângulo de 1,2 rad mostra o corpo de três quartos). No jogo, o modo
desenvolvedor dá o ato ao corpo. As provas: `node qa/visual/andar.js` (o contato no golpe do mundo e no ato do corpo; os clipes sem
erro de registro; nada arremessado na troca), `node qa/visual/maos.js` (a coisa na mão e a outra mão no cabo), `node qa/matriz.js`
(todo gesto com pose).

**Um exemplo completo** — o golpe de cima de uma maça, a duas mãos, que acerta aos 60%:
```js
(G.ANIM_CLIPS = G.ANIM_CLIPS || []).push(['golpe-alto', {
  dur: 1.1, loop: false, mask: 'upper', in: 0.12, out: 0.25, item: { hand: 'mao', two: true }, events: { contact: 0.6 }, acts: ['golpe-alto'],
  keys: {
    shRp: [[0, -40], [0.4, -160], [0.6, -60], [1, -40]], elR: [[0, 50], [0.4, 110], [0.6, 15], [1, 50]],
    wrist: [[0, 20], [0.4, -40], [0.6, 70], [1, 20]], lean: [[0, 5], [0.4, -6], [0.6, 22], [1, 5]],
    twist: [[0, 0], [0.4, -20], [0.6, 12], [1, 0]], offW: [[0, 1], [1, 1]], grip: [[0, 1], [1, 1]], tool: [[0, 1], [1, 1]],
  } }]);
// o ato «golpe-alto» (v.act de uma pessoa do mundo, o vact do ato do corpo — Avatar.act, D-338) mostra este clipe; o contact
// do G.Act.ANIM desse ato em 0,6 da dur, para o golpe bater quando o mundo diz.
```

### 4.7 As teclas — `G.Input3D` (D-339)
- A tabela `G.Input3D.ACTIONS` (`[nome, rótulo, teclas]`): o contrato já pôs `inventario` (I) e `rapido1`…`rapido5` (1 a 5).
- `G.Input3D.def(nome, rótulo, teclas)` (um módulo traz a sua ação), `on(nome, f)` (o aperto; `f` → true toma a ação),
  `onUp(nome, f)` (o soltar), `fire(nome)`, `press(nome, on)` (o botão da tela), `down[nome]` (segurando agora).
- A 20b acrescenta os botões do mouse, o controle de jogo e os botões de toque por contexto, e documenta aqui.

### 4.8 A tela do corpo — `G.IncUI` e `G.Modes`
- `G.IncUI.hud()`, `G.IncUI.root()`; o lugar da barra de atalhos `.ih-hotbar` (da 20c); `G.IncUI.closers` (cada painel novo põe o seu
  fecho; `closeAll` os chama); `G.Modes.setPanel(nome)` marca um painel aberto (o corpo para de andar; o menu, só ele, pausa o
  mundo — D-036).

## 5. Os donos de cada arquivo e as marcas

| Arquivo | Dono | Os outros |
|---|---|---|
| `js/people3d.js` (pessoas), `js/body3d.js`, `js/bodymesh.js`, `arte/corpo*.py`, `js/anim-*.js` | 20a | só leem |
| `js/avatar.js` | 20b | a 20a só na função `animate` e na linha do `People3D.avatar` |
| `js/cam3d.js`, `js/input3d.js`, `js/modes.js` | 20b | a 20c só se inscreve por `Input3D.on` / `setPanel` |
| `js/incui.js` | 20b (o toque, `.ih-touch`) | a 20c só em `.ih-hotbar` e pelos `closers`; nada mais |
| `js/itens.js`, `js/inventario.js`, `js/inv-ui.js` | 20c | só leem |
| `js/itemarte.js` e os gerados da arte dos itens | 20d | só leem |
| `js/space.js` | 20b (o que o controle usa) | ninguém muda `BODY_R` nem `STEP_UP` |
| `js/activity.js`, `js/villagers.js`, `js/possess.js`, `js/interact.js` | (onda 2) | onda 1 não mexe, a não ser o mínimo, dito no relatório |
| `index.html`, `css/style.css`, `qa/guard.js`, `qa/AUDIT.md`, `qa/README.md` | todos | **cada parte escreve só logo abaixo da sua marca** (`20a`…`20g`) |
| `qa/qa.js` | (gerado) | rode `node qa/junta-inv.js` depois de mudar um `*-inv.js`; o arquiteto o gera de novo ao juntar |
| `CLAUDE.md` | o arquiteto | as partes **não** o editam: proponham as linhas no relatório final |
| `worlds/` | o arquiteto | ninguém gera mundos prontos na onda (o arquiteto gera depois da junção) |

## 6. Os números

| Parte | Bugs (L-) | Decisões (D-) | Limites de prova (T-) | Regras do guard |
|---|---|---|---|---|
| contrato | — | 335–339 | — | 111–112 |
| 20a a animação | 1100–1139 | 340–354 | 1360–1379 | 113–119 |
| 20b o movimento | 1140–1179 | 355–369 | 1380–1399 | 120–126 |
| 20c o inventário | 1180–1219 | 370–384 | 1400–1419 | 127–134 |
| 20d a arte dos itens | 1220–1239 | 385–394 | 1420–1429 | 135–137 |
| 20e a interação | 1240–1279 | 395–409 | 1430–1449 | 138–144 |
| 20f o combate | 1280–1319 | 410–424 | 1450–1469 | 145–151 |
| 20g os ofícios | 1320–1359 | 425–439 | 1470–1489 | 152–158 |

## 7. Como cada parte trabalha

1. **A árvore**: a sua árvore de trabalho pode ter nascido da branch padrão (`main`), que não tem o jogo. Antes de tudo:
   `git reset --hard <o commit do contrato>` (o número vem no pedido). Trabalhe e faça commits na sua branch; não empurre; não
   mexa em outras branches.
2. **O protocolo** do `CLAUDE.md` vale inteiro: invariante, cenário (com os casos ruins: save no meio, a pessoa morre no meio, o deus
   interfere, o mapa muda), regra do guard quando a regra se lê no código, entrada no AUDIT para cada bug, causa e não sintoma, nada
   de `try/catch` que esconde erro, nada de prova pulada ou afrouxada. **Antes de cada commit**: `node qa/guard.js` e
   `node qa/soak.js 103 continente 128 4 normal 5 1 1`, e as provas da sua área (seção 3).
3. **A máquina é dividida** (quatro partes ao mesmo tempo, 4 núcleos): rode o navegador só pela fila (`bash qa/navegador.sh …`),
   cada prova com a sua pasta de saída (na sua pasta de rascunho), não rode a regressão inteira (`regress.sh`) nem gere mundos
   prontos — o arquiteto faz isso depois da junção. Medidas de tempo com a máquina ocupada valem pouco: diga quando medir.
4. **Fora da sua área**: se precisar mudar um arquivo de outra parte, faça o mínimo, num trecho bem delimitado, e diga no relatório
   (o arquivo, as linhas, a razão). Se o contrato estiver errado ou faltar uma porta, escolha a solução mais simples que respeite
   o espírito dele e diga no relatório; documente as portas que você criou na seção 4.
5. **O texto**: o que o jogador lê em português; os comentários do código em inglês, curtos, dizendo o porquê, como os vizinhos;
   uma linha por ideia.
6. **O relatório final** (em português simples, para o arquiteto juntar): o que foi feito e como se sente na mão; os arquivos; as
   provas rodadas e o resultado de cada uma (as que falharam também, com a causa); os IDs do AUDIT e as regras do guard; **as linhas
   que você propõe para o `CLAUDE.md`** (quando rodar cada prova nova); o que ficou aberto; as fotos e tiras (o caminho de cada uma).

## 8. A onda 2 (o que vem depois, para a onda 1 deixar o chão pronto)

- **20e — a interação**: o registro de verbos por alvo (vários verbos, cada um com a sua tecla: E, F, segurar E), o destaque do alvo
  mirado (qualquer coisa, não só pessoas) e a dica presa nele, trocar de alvo, pegar e largar qualquer coisa, os guardados (a tela de
  troca entre a mochila e uma casa, uma prateleira, uma banca), os móveis (o `useRule`), dar uma coisa a alguém, pegar uma ferramenta
  no armazém do povo. Usa: o `G.Inv` (20c), as teclas (20b), as poses de pegar, largar, dar, abrir (20a).
- **20f — o combate**: o golpe leve e o pesado de cada arma (o punho, a faca, a espada, o machado, a clava, a lança, a coisa de duas
  mãos), a defesa com escudo ou arma, o aparo, a esquiva com invulnerabilidade, o fôlego, a reação ao golpe, a mira travada, o arco
  (mirar, puxar, soltar; a flecha que voa e acerta pelo corpo; as flechas da mochila), o golpe que acerta pelo corpo no contato (as
  cápsulas das pessoas e dos bichos, `G.Corpo`), o dano pelas portas (`Vg.damage`, `G.Animals.damage`), o crime de bater em gente do
  próprio povo, quem luta contra o corpo no mundo (o duelo); as lutas das pessoas entre si mantêm os resultados do mundo de hoje,
  desenhadas com os golpes novos. Usa: os clipes (20a), as ações com movimento e a mira travada (20b), as armas e o escudo (20c).
- **20g — os ofícios**: o arcabouço das atividades do corpo (a ferramenta certa, o alvo, o ciclo, o rendimento pelas portas do mundo:
  cortar com machado, minerar com picareta, pescar com vara, rede ou lança, caçar e esfolar, colher, vender numa banca), as pessoas
  do mundo desenhadas fazendo o mesmo com os mesmos clipes e as mesmas ferramentas, sem mudar os resultados do mundo de hoje.
  Usa: tudo da onda 1 e os verbos da 20e.
