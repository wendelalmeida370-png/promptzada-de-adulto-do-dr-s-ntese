# A sociedade — o plano e o contrato da Revolução dos NPCs

Este documento é o contrato da grande atualização das pessoas: o rosto e o corpo, o cérebro social e a vida que se vê (AUDIT,
seção 22, D-541 a D-549). Toda parte o lê antes de começar e escreve só nos seus arquivos e nas marcas deixadas para ela. O protocolo
de qualidade do `CLAUDE.md` vale inteiro, e as duas regras do dono também: **«Nada vem do nada»** (D-440) e **«a aparência nunca
decide»** — fenótipo, pele, rosto, corpo e povo nunca pesam em moral, inteligência, crime ou ofício.

## 1. O pedido e o alvo

O pedido do dono, palavra por palavra, está em `arte/sociedade/pedido.md`. Em uma frase: **andar por uma cidade e sentir que cada
pessoa tem uma vida própria** — reconhecer rostos depois de muitos dias, ver amizades, discussões, romances, crianças brincando, velhos
conversando, e uma sociedade que lembra a própria história, com boatos que correm, se distorcem e mudam como os estranhos nos recebem.

O alvo de arte continua o da `arte/BIBLIA.md`: **o low-poly estilizado com acabamento profissional**, não o rosto fotorrealista. A
prancha do ChatGPT que o dono mandou é inspiração de variedade e de vida, não o desenho a copiar.

## 2. O que os batedores mediram (comece daqui; não repita o estudo)

Os três estudos estão em `arte/sociedade/` (`estudo-personagens.md`, `estudo-social.md`, `estudo-animacoes.md`), com os experimentos
na pasta de rascunho que cada um cita. O essencial:

- **Personagens.** Toda a gente tem a mesma cabeça: dois corpos (homem e mulher) da mesma argila; varia só a cor, oito penteados, três
  barbas e a roupa. O rosto é pintura no shader sobre uma malha decimada sem osso nenhum: o olho de 1,6 cm, a sobrancelha de 7 mm e o
  lábio de 8 mm somem a 1–3 px na distância de sempre — é o «pequeno e duro» da foto do dono. O braço e a perna perdidos e a gravidez,
  que o mundo tem, não se veem no 3D. **O desenho da multidão (uma chamada por malha, uma linha de textura por pessoa) aceita alvos de
  forma por pessoa sem chamada nova**, e os alvos saem da argila de hoje em segundos. Um genoma puro (28 genes diploides, 56
  caracteres) não muda um bit do mundo.
- **Sociedade.** Já há muito social, espalhado em **onze memórias** (a biografia, o diário, os fatos e quem os sabe do `stories.js`,
  o boato do mar do `G.Know`, a conversa da cidade dos segredos, o `ken`, a faixa NOTÍCIA, o crime e as testemunhas, a vida do bairro,
  os estados e a lealdade, a crônica), mas **ninguém guarda laço com ninguém**: a conversa vai ao mais perto, o casal nasce de uma
  conversa (62%) aos 17 anos na mediana, a testemunha denuncia sempre, a briga da taverna é sorteada entre bêbados, a revolta escolhe
  pelo sorteio. **Duas personalidades leem o povo** (a coragem e a persona dos governantes) e a fofoca dos segredos acusa o
  estrangeiro — contra a regra do dono. Há 61 órfãos em 199 crianças no «mundial», e ninguém adota. Medido: a metrópole tem 944
  pessoas, 1,8 KB por pessoa no save; o modelo proposto custa ~550 B por pessoa (+12,6% no save) e 1,2 ms por dia do mundo, e a escolha
  com laços é mais barata que a de hoje. **O casal decide a população**: a fase que muda a corte muda os nascimentos.
- **Animações.** O animador é bom e barato (4 µs por corpo; 29 com a pele), mas o `Anim3D.stateOf` só lê o ato, o sono, a carga e o
  movimento: 75% do dia de uma pessoa aparece andando, parada ou dormindo, ~35 atos que o mundo dá caem em «parado», o cansaço chega
  sempre zero, as crianças da perseguição aparecem andando, o preso levado anda de mãos soltas. **O caro é a multidão** (as 320
  cápsulas refazem o retrato a cada quadro: ~11 ms), não a animação. Postura somada no tronco e nos braços não desliza o pé; nas
  pernas, sim — o porte das pernas entra pela passada (`G.Gait`).

## 3. A arquitetura (D-541 a D-549)

### 3.1 Três pilares, duas ondas (D-541)
- **22a — os personagens** (o corpo, o rosto, a diversidade, a identidade que se vê), **22b — a sociedade** (a índole, os laços, a
  memória, a fama, os boatos, a vida que surge sozinha, os verbos sociais do corpo), **22c — a vida que se vê** (o leitor do mundo, o
  porte, o ócio, o olhar, o rosto vivo, os atos que faltam, os gestos a dois e em grupo, a multidão).
- **Onda 1** (este contrato): 22a fases 1–4 (o genoma; a cabeça nova; a identidade e a idade; o corpo) e o lado do desenho dos canais do
  rosto; 22b fases 0–2 (o chão; a índole e os laços; a memória, a fama e o crime entre pessoas); 22c fases 0–3 (o chão; o porte; o ócio,
  o olhar e o rosto vivo; os atos que faltam). **Onda 2** (depois da junção da onda 1, continuando os mesmos agentes): 22a a criança de
  pernas curtas com a animação, a vista do deus e o retrato; 22b os boatos e a memória coletiva, os verbos sociais do corpo e a adoção;
  22c os gestos a dois, o grupo, as crianças e a multidão, e as coisas dos gestos (a bola, os grilhões, a caneca, a muleta — com origem).
- Cada fase é uma fundação entregável: um commit que diz «22x fase N pronta» deixa o arquiteto juntar no meio do caminho.

### 3.2 A identidade: duas fontes, que nunca se cruzam (D-542)
- **O que se vê** é do **genoma** (`v.genoma`, `G.Genoma` em `js/genoma.js`, puro, da 22a): nasce no passo do mundo por uma conta
  pura — o id, a semente do mundo, os genomas dos pais e, para quem nasce sem pais, o povo e a terra onde ele começou — **sem tirar nada
  do `G.R`** (o mundo fica byte a byte o mesmo); diploide; com um hash de 32 bits próprio (o `G.hash` só dá 100 mil valores). A forma que
  se desenha é o `G.Feicao.of(v)` (`js/feicao.js`, só se vê): o genoma + a idade + o que o mundo faz no corpo (a gravidez, o membro
  perdido, a fome, o trabalho pesado). **A cor da pele que se desenha vem do genoma** (a escolha B' do estudo); o `v.skin` / `v.hair` de
  hoje continuam nascendo como hoje e viram só a semente da cor de quem nasceu antes do genoma.
- **Quem a pessoa é** é da **índole** (`v.indole`, `G.Indole` em `js/soc-indole.js`, da 22b): seis eixos (ext, ama, con, neu, abe, hon)
  e três valores (amb, fe, lea), inteiros 0–99, do `G.hash` do id, **metade herdada dos pais**, ancorada nos traços de hoje (a pessoa
  continua a mesma) — nunca do `G.R`, **nunca da aparência nem do povo**.
- **A coragem e a persona dos governantes deixam de ler o povo**: o viés da cultura vai para a instituição (a lei e o regime fazem
  diferente; a pessoa é ela). Muda os governantes de todos os mundos: a 22b mede antes e depois. **O preconceito existe como atitude de
  quem o tem** (a desconfiança da índole, as marcas de quem sofreu nas mãos de um povo em guerra), nunca como verdade sobre o acusado.
- **A regra do dono no código** (regra 194 do guard; a 22b a estende às funções de decisão que ela tocar): nenhum arquivo social lê
  `.skin`, `.hair`, `.kidCloth`, `.genoma`, `G.Genoma`, `G.Feicao`, nem o povo (`.civ`, `CIVS[`) para decidir; o nome e a língua da pessoa
  continuam do povo pelo `G.Civ`. E no medidor, a invariante estatística: nenhum povo mais «criminoso», «cruel» ou «odiado» que outro
  na mesma condição.

### 3.3 O rosto: canais com nome (D-543)
- **`G.Rosto`** (`js/rosto.js`, puro, deste contrato) é a lista dos canais do rosto que a animação escreve e o desenho lê — o
  vocabulário entre os dois pilares, como o `G.Gestos` dos bichos. Cada canal tem nome, faixa e repouso.
- **Quem escreve**: a 22c, a cada quadro, em `pose.face` (um `Float32Array(G.Rosto.CH.length)` na pose de cada pessoa), misturando o
  humor de fundo, a emoção do instante (`v.emo`), o gesto, o porte, a piscada, o olhar e a fala. **Quem lê**: a 22a, no `Body3D.put`,
  e decide como cada canal se vê (alvos de forma, os ossos novos do queixo e das pálpebras, a pintura). Canal que o corpo não desenha não
  quebra nada; canal fora da lista não existe (regra 196).
- Enquanto a cabeça nova não chega, a 22c mantém o caminho de hoje (os 11 números pintados) lendo do `pose.face`; a 22a passa a ler o
  `pose.face` direto quando a cabeça nova entra.
- **O olho estilizado** (decisão de arte): abertura ≈ 1,4× e íris ≈ 1,15× da proporção real, cílio escuro, sobrancelha de contraste
  (9–12 mm), pálpebras e boca com geometria. A BÍBLIA §12 é atualizada pela 22a com as fotos.

### 3.4 O vocabulário dos atos sociais (D-544)
- **`G.SocAtos`** (`js/soc-atos.js`, puro, deste contrato): cada ato social que o mundo pode dar a uma pessoa (`v.act`), com a sua
  família (encontro, conversa, afeto, conflito, família, festa, pedido, respeito, sozinho, crime), se é a dois (`duo`) e os papéis, a
  distância do par e a duração de referência. Os atos que o mundo já dá (`talk`, `chat`, `hug`, `weep`, `mourn`, `cheer`, `boo`, `shove`,
  `shout`, `swear`, `cower`, `kneel`, `fight`) estão nele com o mesmo nome.
- **O social só dá atos do vocabulário** (regra 195); **a animação dá a todo ato do vocabulário uma pose** — no mínimo a da sua
  família, refinada por clipe próprio —; **o som**: todo ato do vocabulário tem a sua linha no `G.Audio.ATO` (regra 54), posta por
  quem cria o ato.
- **O lugar de um ato a dois é do mundo**: a 22b põe os dois corpos à distância do ato e virados um para o outro, e os segura pelo
  tempo dele; a vista nunca move uma pessoa para caber um abraço. O par vai no `t.id` da tarefa, o papel em `t.papel` (`'a'`/`'b'`).

### 3.5 As leituras sociais que o desenho pode fazer (D-545)
- Portas puras, que nunca escrevem nem tiram acaso: `G.Indole.de(v)` (a índole ou `null`), `G.Indole.faceta(v, nome)` (0..1),
  `G.Indole.humor(v)` (−1..1), `G.Lacos.sente(v, o)` (o que v sente por o, ou `null`), `G.Fama.notavel(x, y, r)` (quem de fama está
  perto). **Este contrato as deixa com respostas neutras** (os arquivos `soc-indole.js`, `soc-lacos.js`, `soc-fama.js`): a 22c programa
  contra elas desde já (com os traços de hoje como reserva), a 22b as enche.
- **O desenho só chama as leituras** (regra 196): nenhum arquivo do que só se vê chama uma porta que muda a sociedade
  (`G.Lacos.ato`, `G.Lacos.marca`, `G.Indole.vive`, `G.Boatos.*` que escrevem, `G.Vg.pair` / `unpair`).

### 3.6 O nível de detalhe (D-546)
- **A sociedade nunca pelo olhar**: o `det3` exige o mesmo mundo com e sem quadros. O social poupa **por agregação** (a multidão sabe
  e sente por parte da cidade, amostrada pelo `G.hash(pessoa, coisa)`, sem um byte por pessoa) e **por importância dita pelo mundo** (o
  corpo, quem tem laço com ele, o governante, os heróis, os personagens de uma história). Os laços nascem de causas que o salto e o
  passo vivem iguais (o fim de um afazer, a mesa fechada pela operação, o dia), nunca de «estavam perto neste quadro».
- **O desenho pela distância, sim**: perto tudo (o porte, o ócio, o olhar, o rosto inteiro); no meio sem as micro-ações pequenas; longe
  a pose refeita a cada dois ou três quadros; a multidão com poucas posturas e o retrato guardado.

### 3.7 O equilíbrio (D-547)
- **O medidor primeiro** (`qa/sociedade-eco.js`, da 22b, no molde do `oficio-eco.js`): mundos de 40 anos pelo salto — a população e a
  pirâmide, nascimentos, casais, a idade do primeiro casal, viúvos que casam de novo, mortes por causa, furtos, agressões, homicídios,
  presos e executados por mil pessoas-ano, revoltas, golpes, órfãos, laços por pessoa, o save por pessoa e o tempo do passo — **por povo**.
  A linha de base é a fase 0.
- **A população fica na faixa de hoje** (o dono não pediu menos gente): a corte com história vem com **o casamento arranjado pela
  família** para quem não acha par (a história de quase todo povo antigo), calibrado para que a população aos 40 anos, os nascimentos e
  os casais por ano fiquem a ±10% da linha de base.
- **O crime entre pessoas do mundo abre** (o dono pediu: a discussão que vira agressão, o assassinato que desencadeia investigação) —
  raro e com causa, numa faixa que a 22b mede e diz no AUDIT.

### 3.8 Nada vem do nada, também nas pessoas (D-548)
- A coisa na mão de um gesto vem do mundo (`G.Inv.held`, regras 114, 136): **sem a coisa, o gesto é de mãos vazias** (abanar-se com a
  mão, as mãos juntas do preso). A bola, os grilhões, a caneca e a muleta entram no catálogo com origem na onda 2.
- A marca da vida no corpo tem causa no mundo e é sutil: a fome emagrece, o trabalho pesado dá músculo, a idade curva. **Nada de «o rico
  é gordo»** (caricatura de classe): o corpo é do genoma, a vida só desloca um pouco.
- Deficiência só onde o mundo tem a causa (`v.lost`); a manqueira é da animação, o coto é da malha.

### 3.9 As decisões já tomadas (D-549; as perguntas dos batedores)
- O genoma é diploide (o «puxou ao avô»); o campo é `v.genoma` (o `.gen` já é de outras coisas no jogo).
- MakeHuman só como referência de proporções; nenhum dado de fora entra (as licenças continuam: tudo feito por código).
- As partes cortam do `people3d.js` o que é delas no primeiro commit, sem mudar o comportamento (as provas de hoje iguais): a 22a o
  retrato e a roupa (`lookFill`, `outfitOf`, `IRIS`, `HAIRS`, `P3.body` → `js/look3d.js`); a 22c a atuação (`stateOf`, `ACT`, `ST`,
  `stagger`, `hold`, `lookFor`, `MOOD`, `easeMood`, `blinkAt`, `faceOf`, o trecho que monta o `I`, a multidão → `js/anim-pessoas.js` /
  `js/anim-rosto.js`). Os dois trechos são longe um do outro; o laço do quadro e o `P3.rig` ficam da 22c, e a 22a só acrescenta os
  ossos novos ao fim.
- A faixa NOTÍCIA do corpo passa a ser o que a pessoa vivida ouviu (com atraso e versão) — na onda 2, com os boatos.
- Os verbos sociais do corpo (onda 2) vão no cartão da pessoa (o E já o abre), com teclas de número e toque, pelo registro
  `G.Interact.verb('pessoa', …)`; o E, o F e o E segurado continuam os três primeiros.
- A câmera de conversa (o rosto a ≈ 1,2 m) e o retrato no painel do deus: onda 2.

## 4. As partes

### 22a — Os personagens
**Onda 1**, nesta ordem (as fases do `estudo-personagens.md` §8):
1. **O corte**: `js/look3d.js` com o retrato e a roupa tirados do `people3d.js`, sem mudar nada (as provas do corpo iguais).
2. **O genoma** (`js/genoma.js`, puro; `G.Genoma.child`, `founder`; o nascimento pela porta `G.Vg.born` deste contrato; o registro dos
   mortos, o cadáver e quem volta copiam; o load preenche os saves de antes em ordem de nascimento, com o pigmento tirado do `v.skin` /
   `v.hair` salvos) e o `G.Feicao` (`js/feicao.js`): a cor e a altura no 3D.
3. **A cabeça nova**: a gaiola com anéis nos olhos e na boca, a UV, as pálpebras de verdade, a boca por dentro, o olho estilizado, a
   luz da pele; os ossos `jaw` e das pálpebras ao fim da lista; o `bodymesh` v2. **Uma folha de cinco rostos cedo**, para o arquiteto
   mostrar ao dono antes de gerar todos os alvos.
4. **A identidade e a idade**: os alvos de identidade (≈ 20) e de idade (≈ 6) pela projeção na argila, levados ao cabelo, à barba e aos
   chapéus; a textura de máscaras (rugas, sardas, sobrancelha); penteados novos (crespo, cacheado, ondulado, entradas).
5. **O corpo**: alto, baixo, gordo, magro, musculoso, ombros; a gestante; os cotos; o pano que não deixa o corpo largo passar.
6. **Os canais do rosto no desenho**: o `Body3D.put` lê o `pose.face` (§3.3) e o mostra pelos alvos e ossos.
*Dono de*: `js/genoma.js`, `js/feicao.js`, `js/look3d.js` (novos), `js/body3d.js`, `js/bodymesh.js` (gerado), `arte/corpo*.py`,
`arte/rosto*.py` (novos), a parte das pessoas do `art.js` (onda 2). Mínimo e dito: o registro dos mortos (`village.js`), o cadáver
(`carnage.js`), quem volta (`beyond.js`), os ossos novos no `P3.rig`.
**Provas**: `qa/genoma.js` (g1–g7 do estudo, com o g6 «ninguém decide pela aparência»: o mesmo mundo com os genomas trocados por um
constante dá o mesmo hash), `qa/visual/rostos.js` (Node: a pálpebra fechada cobre o globo, a boca em repouso fecha, a mandíbula não
atravessa o pescoço, cabelo e chapéu sem a cabeça passar, o pano sem o corpo passar, o coto fechado), `qa/visual/rostos-fotos.js`
(navegador, pela fila: o alinhamento por idade, sexo, povo e corpo; a mesma pessoa aos 5, 15, 25, 45 e 70; o retrato de família; o
custo), `qa/feicao-inv.js`; as do corpo de hoje (`corpo-rig`, `roupa`, `andar`, `maos`, `guarda3d`, `ONLY=e11` do `encarna`).

### 22b — A sociedade
**Onda 1**, nesta ordem (as fases do `estudo-social.md` §6):
0. **O chão**: a porta do casal `G.Vg.pair` / `unpair` (os sete escritores de `partner` passam por ela, sem mudar o que fazem); os
   registros `G.Vg.weigh` e `G.Vg.want` (vazios); o medidor `qa/sociedade-eco.js` e a linha de base; o `St.listen` do `stories.js`.
1. **A índole e os laços** (`soc-indole.js`, `soc-lacos.js`): a índole com a herança e os saves de antes; os laços dirigidos, esparsos e
   com teto, pela porta única `G.Lacos.ato`, esfriando pelo dia da cidade; os primeiros consumidores — o alvo da conversa e da visita, o
   peso do tempo livre, a mesa da taverna, a corte por quem se conhece com o «sim» dos dois e o casamento arranjado, o luto do amigo, a
   postura no cadafalso; a coragem sem o povo. A calibragem da população (§3.7).
2. **A memória e a fama**: as marcas (quem fez o quê, a saliência pela índole, a promessa e a dívida pelo `G.Depot`); a denúncia pesada
   pelos laços; a vítima do ladrão; a discussão → a briga → a agressão e o homicídio entre pessoas do mundo (o `G.Crime.assault` aberto
   ao mundo, com as testemunhas e a caça de hoje); a ajuda ao estranho; a fama da cidade de casa e a memória da cidade
   (`soc-fama.js`); a vingança lendo a marca; a persona dos governantes lida da índole, sem o povo.
*Dono de*: `js/soc-*.js` (os atos do vocabulário: acrescentar um ato novo é dele, com a linha do som), `qa/sociedade*.js`. Mínimo e
dito: as linhas de decisão do `villagers.js`, `crime.js`, `polity.js`, `justice.js`, `act-taverna.js`, `village.js`, `politics.js`,
`secrets.js`, `stories.js` que passam a perguntar às portas sociais.
**Provas**: `qa/sociedade.js` (os cenários do estudo §6.2: o save no meio de uma corte e de uma discussão, a pessoa que morre com laços,
o deus que une dois que se odiavam, a cidade que muda de povo, a guerra, o mundo de séculos), `qa/sociedade-inv.js` (os tetos, os ids
vivos ou lembrados, os inteiros nos limites, ninguém com laço consigo), o medidor antes e depois de cada fase (dez sementes no fim; cinco
nas idas e voltas), e as provas do mundo que a fase toca: `det3`, `oldsave`, `corrupt`, `invariancia.sh` (o teste C ganha os laços),
`oficio-eco`, `fome`, `ladrao-bairro`, `combate.js` c12, `vira`, `casa-cheia`, `mundos.js` com os mundos prontos gerados de novo.

### 22c — A vida que se vê
**Onda 1**, nesta ordem (as fases do `estudo-animacoes.md` §3.14):
0. **O chão** (sem gesto novo): o corte do `people3d.js` (§3.9); o retrato da multidão guardado e o longe a cada dois quadros; o
   `I.tired` de verdade; o ato por cima de quem anda (o preso amarrado andando); a tabela tarefa → estado (`TASK_OF`); o olhar geral.
1. **O porte**: o leitor `js/vida3d.js` (só lê o mundo, refeito ~2 vezes por segundo por pessoa) e os aditivos do corpo (velho,
   criança, cansado, frio, calor — a porta pura `G.Atmos.heat` no `atmos.js` —, chuva, doente, ferido e manco, grávida, bêbado, luto,
   medo, fúria, o temperamento, a nobreza); as pernas e o passo pela passada (`G.Gait`), nunca somados por cima.
2. **O ócio, o olhar e o rosto vivo**: ~30 micro-ações com os tiques de cada um pelo `G.hash`, o olhar entre as pessoas, o `pose.face`
   misturado (§3.3).
3. **Os atos que faltam**: os ~35 atos do mundo sem pose e os convertidos com perda; a pose da família para todo ato do vocabulário.
*Dono de*: `js/vida3d.js`, `js/anim-*.js` (os de hoje e os novos), `js/anim-pessoas.js`, `js/vida-clips.js`, `js/social-clips.js`, o
laço do quadro e o `P3.rig` do `people3d.js`, a porta `G.Atmos.heat`, as linhas de som das micro-ações que soam.
**Provas**: `qa/visual/gestos-vida.js` (no molde do `bichos-gestos.js`: números, ossos do mesmo tamanho, nada debaixo do chão, nada
atravessa o corpo, o pé parado, o contato na hora do mundo, o espelho), `qa/vida3d.js` (a causa → a pose, e o contrário; o save no meio,
a pessoa que morre, o deus que interfere; o mesmo save com e sem desenho), a variedade medida (uma praça de 60 pessoas por 120 s), o
orçamento (≤ 4 ms por quadro para as pessoas no centro da metrópole), a medida do dia (`qa/vida-dia.js`); as de hoje (`andar`,
`corpo-rig`, `maos`, `matriz`, `som` s1, `guarda3d`, `ONLY=e11` do `encarna`, `movimento`).

## 5. Os donos de cada arquivo e as marcas

| Arquivo | Dono | Os outros |
|---|---|---|
| `js/rosto.js`, `js/soc-atos.js` (o vocabulário) | o contrato | a 22c pede um canal novo ao arquiteto; a 22b acrescenta atos ao vocabulário, com a linha do som |
| `js/genoma.js`, `js/feicao.js`, `js/look3d.js`, `js/body3d.js`, `js/bodymesh.js`, `arte/corpo*.py`, `arte/rosto*.py` | 22a | só leem (a sociedade, nunca o genoma) |
| `js/soc-*.js` (fora o vocabulário), `qa/sociedade*.js` | 22b | o desenho só as leituras (§3.5) |
| `js/vida3d.js`, `js/anim-*.js`, `js/vida-clips.js`, `js/social-clips.js` | 22c | — |
| `js/people3d.js` | o retrato e a roupa: 22a (para o `look3d.js`); o laço do quadro, a atuação, a multidão e o `P3.rig`: 22c | os ossos novos do rosto ao fim do `P3.rig`: 22a, mínimo e dito |
| `js/villagers.js` | 22b (as decisões, a porta do casal) | o `SHAPE` e a porta `G.Vg.born` já estão aqui (o contrato); a 22a não mexe |
| `js/atmos.js` | — | a 22c acrescenta `G.Atmos.heat`, pura (regra 51) |
| `js/audio-src.js` | — | cada parte só as suas linhas: a 22b os atos, a 22c as micro-ações que soam |
| `js/save.js`, `js/village.js`, `js/carnage.js`, `js/beyond.js` | — | o conserto do load por um `G.saveHooks` no próprio arquivo de cada parte; o resto, uma linha dita |
| `index.html`, `css/style.css`, `qa/guard.js`, `qa/AUDIT.md`, `qa/README.md` | todos | **cada parte só abaixo da sua marca** (`22a`, `22b`, `22c`) |
| `qa/qa.js`, `CLAUDE.md`, `worlds/`, `arte/BIBLIA.md` | o arquiteto | proponha as linhas; os mundos prontos são gerados de novo na junção |

## 6. Os números

| Parte | Bugs (L-) | Decisões (D-) | Limites de prova (T-) | Regras do guard |
|---|---|---|---|---|
| contrato | — | 541–549 | — | 194–196 |
| 22a os personagens | 1670–1709 | 550–564 | 1575–1589 | 197–203 |
| 22b a sociedade | 1710–1769 | 565–589 | 1590–1609 | 204–212 |
| 22c a vida que se vê | 1770–1809 | 590–604 | 1610–1624 | 213–219 |

## 7. Como cada parte trabalha

1. **A árvore**: `git reset --hard <o commit deste contrato>` (o número vem no pedido); commits na sua branch; não empurre.
2. **O protocolo** do `CLAUDE.md` inteiro: invariante (o seu `*-inv.js`, juntado pelo `qa/junta-inv.js`), cenário com os casos ruins,
   regra do guard para o que se lê no código, cada bug no AUDIT, a causa e não o sintoma. **O que só se vê prova que não mexe no mundo**
   (o save igual byte a byte antes e depois de desenhar; o `det3`); **o que muda o mundo** passa pelo medidor e pelos mundos prontos.
3. **As fotos** (22a, 22c): as provas de fotos pela fila do navegador, antes e depois, na Média e na Alta; o dono julga pelo que vê.
4. **A máquina é dividida e recicla a cada hora e meia, mais ou menos** (o contêiner reinicia; o que roda em segundo plano morre sem
   avisar): **commit de cada passo que passar**, provas curtas (as partes por `ONLY=`), o que se mediu guardado num arquivo da pasta de
   rascunho. O navegador só pela fila (`bash qa/navegador.sh …`); uma prova longa vai desligada do terminal (`setsid nohup …`).
5. **Fora da sua área**: o mínimo, num trecho bem delimitado, dito no relatório. Se o contrato estiver errado ou faltar uma porta, a
   solução mais simples que respeite o espírito dele, documentada aqui.
6. **O texto**: o que o jogador lê em português; os comentários do código em inglês curto, dizendo o porquê, como os vizinhos.
7. **O relatório final** (em português simples): o que foi feito e como fica na tela; os arquivos; as provas e o resultado de cada uma;
   o custo medido; os IDs do AUDIT e as regras do guard; as linhas propostas para o `CLAUDE.md`; o que ficou aberto (e o que é da onda
   2); as fotos antes e depois (o caminho de cada uma).
