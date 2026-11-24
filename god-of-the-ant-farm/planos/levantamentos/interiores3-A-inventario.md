# Interiores 3 — o inventário dos prédios (agente A)

Pesquisa só de leitura: nada no repositório mudou. Os números saem do próprio jogo, em Node (`qa/nodemundo.js`), sobre o
código de hoje (commit `79fdb25`, depois do piloto da taverna):

- **as plantas de verdade**: todos os prédios de pé, com planta, da metrópole e da megalópole prontas (353 + 651 plantas, feitas
  pelo `In.plan`);
- **as amostras**: cada tipo com planta × os 6 povos × cada degrau que o povo pode erguer, 2 ids cada (528 plantas, `In.make`);
- **a contagem**: os prédios por tipo, povo e degrau nos mundos `cidade`, `metropole` e `mega`;
- **quem entra**: um dia inteiro de cada mundo (metrópole, dia 57; mega, dia 118), olhando de 2 em 2 s quem está dentro de quê,
  em que tarefa, em que lugar da planta;
- **o corpo entrando**: o script de entrada da frente P4 (`entra-degrau.js`), apontado para o código de hoje — o corpo anda da rua
  até a porta, de frente e pelo pé da escada, em 2 prédios de cada tipo;
- **a decoração e a luz de agora**: o `G.Dentro3D.plan` e as fontes do `G.Luz3D.sources` (refeitas em Node) em cada prédio da mega.

Os scripts e as saídas estão em `…/scratchpad/interiores3/A-dados/` (§7).

**A nota (0 a 10):** **10 é a taverna nova** aprovada pelo dono (o padrão do `planos/interiores-2.md` §5.1: espaço para
respirar, zonas e corredor de 1 m, móveis modelados de cada povo, decoração com causa, luz com fonte, gente usando o lugar e entrando
pela porta, 3 variantes ou mais por povo e tamanho). **0** é prédio sem interior. **«aberto»** é chão sem dentro, onde nota de
interior não se aplica (campo, praça, poço). A base é a auditoria do `interiores-2.md` §1–2 (as notas do agente A), corrigida pelo que
o piloto já espalhou para todos (§0).

---

## 0. O que o piloto já deu a todos os interiores

Isto não precisa ser refeito prédio a prédio:

- **A luz com fonte** (P1, `js/luz3d.js`): o volume de luz assado de toda planta aberta, o escuro de verdade, a janela sem vidro de
  cada povo, os materiais de dentro, o fogo que não vaza pela parede, o olho que se acostuma. As fontes, porém, só existem onde há
  peça de fogo ou lampadário (§5.6).
- **Os móveis modelados** (P2, `js/movel3d.js`): 29 tipos de peça têm modelo do Blender para os seis povos, e valem em todo prédio
  que usa a peça, quando o tamanho dela cabe no do modelo: cama, cama de casal, esteiras, arca, jarros, talha, banco, mesa, lar,
  fogão, lampadário, cuba, pipas, barril e as peças da taverna. Valem também a escada de madeira aberta (D-713, `build3d.js` `inStair`) e as folhas de porta de cada povo.
- **A câmera e a tela** (P4): a quarta parede, a «Vista da sala», a lente, a tela pelo lugar, o corpo contra os móveis pelo
  contorno e o olho fora da cabeça no terreiro (L-1860).
- **As pessoas no desenho** (P6): andam pela planta (`In.pathIn`), fazem o gesto por cima do lugar (`G.Vida3D.atPlace`), tiram o
  chapéu dentro de casa e seguram o bebê no colo.
- **A decoração** (P5): a porta `G.Atmos.within(b)` é de todos, mas as causas além da bebida, da comida e dos bens da casa são só da
  taverna (§5.5).
- **A entrada pela porta** (P7, `G.Vg.enter`): o mundo espera a caminhada só nas casas, na taverna e no templo (§5.10).

---

## 1. A tabela (uma linha por tipo)

**Como ler.**
- **Freq.** é a média de prédios por metrópole (as 5 cidades de nível 4 ou mais: Argos da metrópole; Tenochtitlan, Argos, Hedeby e
  Mênfis da mega), seguida do total em cada mundo (cidade / metrópole / mega).
- **Lote:** n casas de 4 m.
- **Áreas** são do cômodo principal.
- **Peças** são a média por planta, dos prédios de verdade.

| Cat. | Tipo | Para que serve · quem | Povos · degraus (lote) | Forma · planta (família, arquivo) | Hoje: cômodos e peças | Quem entra (mundo · corpo) | Andares | Nota | Freq. |
|---|---|---|---|---|---|---|---|---|---|
| Mor | `hut` Cabana | a casa da família pequena (4 camas): dormir, ceia, fogo, ninar (`G.Lar`) | todos · n1 (4 m) | sem forma (a casca é a da planta) · `int-familias.js` `home()`, 27 famílias | o lar de 5–12 m² (mediana 10,4; pé-direito 2,6); esteiras, arca, jarros, cestos, banco ou esteira de comer, fogareiro ou fogo de chão; 5,7 peças | a família (`placeRule('casa')`, `Vg.enter`) · entra: na sua casa dorme, na dos outros bate | 1–3 (jirau de gatinhas, terraço, porão; escada de mão) | 3 | 3,0 · 34/79/1 |
| Mor | `house` Casa | a casa da família (6 camas) | todos · n1 | sem forma · `home()`, 55 famílias | lar de 4,7–11,9 m² (mediana 9,5; pé-direito 2,5; 41% ocupado); esteiras e camas, braseiro, banco ou esteira de comer, mesa com bancos, arca, nicho, cestos pendurados, jarros, o fogo do povo (fogão, lar ou forno); 7,7 peças; 0,4 porta de dentro | família · corpo | 2–3 (jirau, terraço, andar, porão) | 3 | 15,6 · 6/108/217 |
| Mor | `house` n2 Casa rica (domus) | o degrau da família rica (`G.Casa.rich`, D-177) | todos · n2 (8 m) | sem forma · `domus.patio` (`int-familias.js`, pelo `sizedType` do `int-civicos.js`) | lar de 10 m², vestíbulo, 3 quartos, pátio; camas, mesa com bancos, bancos, arcas; 5 portas de dentro | a família rica · corpo | 1 | 2,5 | 0 · 0/0/2 |
| Mor | `sobrado` Sobrado | 9 camas | todos · n1 | `home()`, 56 famílias | lar de 8,1 m² e quartos em cima; 8,9 peças (2,4 esteiras de casal) | família · corpo | 2–4 (escada e escada de mão) | 3 | 4,4 · 9/28/74 |
| Mor | `insula` Ínsula | 14 camas (a romana tem 4 pavimentos, a nórdica 2) | todos · n1 | `home()`, 60 famílias | lar de 10,1 m², um ou dois quartos por andar; 11,3 peças (4,2 esteiras de casal) | família · corpo | 3–5 | 2,5 | 8,0 · 0/2/84 |
| Mor | `quarteirao` Quarteirão | 40 camas em volta de um pátio | todos · n2 | `int-quadras.js` `block()`, 16 famílias | alas de 16–20 m² (3–4 por andar) e o pátio; 36,6 peças (11 esteiras de casal, 7,8 braseiros); 10,8 portas de dentro | família · corpo | 3–5 (3,8 escadas) | 2,5 | 2,0 · 0/0/10 |
| Mor | `barraco` Barraco | quem não tem casa (o `raise` do `social.js`; 3 camas) | todos · n1 | `home()`, 2 famílias | um cômodo de 8,5–10,5 m², pé-direito 2,1; esteiras, braseiro, banco de comer, prateleira | os sem-teto · corpo | 1 | 2 | 0 · 0/0/0 |
| Rel | `temple` Templo | rezar e oficiar (`G.Lar.prayIn`; o sacerdote); as festas | todos · santuário n2, templo n4, grande n6, monumental n8 | `forma.templo` (`forma.js`; os degraus 4, 6 e 8 no `forma-poder.js`) · `int-civicos.js` `formTempleFurnish`, `int-palacio.js` `templeByForm` (e 12 famílias de salão antigas) | a nave de 8–23 / 23–71 / 74–169 / 164–297 m² (pé-direito de 3 a 12 m); peristilo, pórtico, terreiro, plataforma; a hipostila egípcia. Ídolo, altar, cofre, 1–2 lampadários, de 4 a 86 bancos dos fiéis ou até 164 esteiras de oração | fiéis e sacerdote (`placeRule('templo')`, `In.hold` + `Vg.enter`) · entra (o asteca para na porta: #5113) | 1 | 2,5 | 1,8 · 4/8/7 |
| Rel | `cemetery` Cemitério | as covas (`Village.bury`) | — | sem forma · sem planta | chão aberto | quem enterra e quem visita | — | aberto | 2,4 · 0/12/29 |
| Arm | `storehouse` Armazém | o estoque do povo (guarda 150; ponto de entrega) | todos · n2 | sem forma · `int-trabalho.js` `work()`, 23 famílias | nave ou salão de 13–55 m² (mediana 17; pé-direito 3,2); 4,9 baias (enchem com o estoque total do povo), prateleira, pipas, mesa de conferência, mesa do escriba; 3,7 portas de dentro (vãos) | ninguém trabalha dentro (entrega-se na porta); à noite, a reunião secreta (`secrets.js` «o porão do armazém») · corpo | 1–2 | 2 | 3,4 · 4/31/33 |
| Arm | `celeiro` Celeiro | o grão (as tulhas) | todos · n2 | `forma.celeiro` só no egípcio (as cúpulas) e no asteca (os potes), aberto; nos outros, o salão do `work()`, 16 famílias | salão de 46–61 m², 5% ocupado; 3–4 tulhas (enchem com o estoque), mesa de conferência | ninguém (o conclave à noite) · corpo | 1–2 | 2,5 | 1,4 · 4/6/6 |
| Arm | `armazem` Armazém do Porto | as caixas do cais (estivadores, 3) | todos · n2 | sem forma · `work()`, 23 famílias | celas e naves de 13–55 m²; 3 baias, 2 estrados de carga, mesa de conferência | ninguém dentro no dia medido · corpo | 1–2 | 2 | 0,6 · 0/5/11 |
| Com | `mercado` Mercado | as bancas dos mercadores (`G.Biz`, 3) | todos · n2 (o «coberto» n4 nenhum povo ergue) | `forma.mercado` (`forma.js` `marketF`) · `int-monumentos.js` `marketForm` (e 19 famílias de salão) | chão aberto de 54 m²: 4,9 bancas (vazias), 2 baias, 14 sólidos da forma | os mercadores vendem **diante da porta**, não nas bancas (`act-negocio.js` `spots`, com `B.spotOf = null`) · o corpo entra pela entrada da forma | 1 | 2,5 | 1,4 · 4/16/20 |
| Com | `feira` Feira | os feirantes (4); a feira da manhã | todos · n3 (12 m) | sem forma · `int-palacio.js`, 6 famílias (ruas, bordas ou praça × chão ou toldos) | 10–14 bancas (enchem com o `b.inv` da feira), fonte | os feirantes ficam nos lugares do desenho do deus (`cityart.js` `STALLS`, via `G.Eco.stallSpot`), não nas bancas da planta · pisa | 1 | 2,5 | 1,0 · 3/11/14 |
| Com | `mercado_negro` Mercado Clandestino | contrabandistas (2) | n1 | forma (`shack`) · sem planta | — | — | — | 0 | 0,6 · 0/10/12 |
| Ofí | `workshop` Oficina | a técnica (+15% de trabalho, as casas de pedra); não tem ofício | todos · n2 | sem forma · `work()`, 15 famílias | salão de 20–49 m² (mediana 39), 8% ocupado: 2 bancadas, prateleira, cepo | ninguém (só o conclave: «o fundo da oficina») · corpo | 1–2 | 1 | 1,0 · 4/6/4 |
| Ofí | `forja` Forja | o ferreiro (2): armas e ferramentas (`G.Oficio`; regra 161) | quem tem metal · n2 | sem forma · `work()`, 11 famílias | salão de 35 m², 7% ocupado: forja, bigorna, tina, bancada, prateleira (às vezes balcão) | o ferreiro nas etapas «mão» (`act-oficio.js` `runOficio`, posto na porta); o fogo só na fornada · corpo (`trabalho.js`) | 1–2 | 2 | 0,6 · 0/7/15 |
| Ofí | `tecelagem` Tecelagem | tecelões (3): lã em pano | os povos com lã (nos mundos: nórdico, grego, romano) · n2 | sem forma · `work()`, 11 famílias | salão de 31 m², 9% ocupado: 3 teares, secador | o tecelão, **sentado no ar** ao tear · corpo | 1–2 | 2 | 0,6 · 0/7/12 |
| Ofí | `olaria` Olaria | oleiros (2): tijolo, adobe, cerâmica | perto de rio · n2 | sem forma · `yardWork` (o mundo só escolhe a `w-terreiro.terreo`) | terreiro aberto e um telheiro de 6,6 m²: 2 rodas, forno, 2 secadores, eira, tanque, pilha de tijolos | o oleiro (torneia sentado no ar, coze, molda) · corpo | 1 | 2 | 0,8 · 4/12/17 |
| Ofí | `ourives` Ourivesaria | o ourives (1): ouro em joia | onde há ouro · n1 | sem forma · `work()`, 9 famílias | salão de 6,6 m²: bancada de ourives, cofre (vazio), fornalha | o ourives (`G.Oficio`); ninguém no dia medido · corpo | 1–2 | 1,5 | 1,0 · 0/11/18 |
| Ofí | `acougue` Açougue | o açougueiro (1): o abate do curral, a carne, o couro (`estates.js`) | pop ≥ 16 · n1 | sem forma · `work()`, 9 famílias | salão de 6,7 m²: cepo, ganchos | ninguém dentro (as tarefas antigas) · corpo | 1–2 | 1,5 | 1,0 · 4/12/16 |
| Ofí | `sericultura` Casa da Seda | sericultor (2) | n2 | forma (`silk`) · sem planta | — | — | — | 0 | 0,2 · 0/0/4 |
| Ofí | `salga` Salga | salgador (1) | n2 | forma · sem planta | — | — | — | 0 | 0,6 · 0/5/5 |
| Ofí | `perolaria` Casa dos Mergulhadores | mergulhador (2); as pérolas (`waters.js`) | n1 | forma (a clássica) · sem planta | — | — | — | 0 | 0 · 0/3/1 |
| Ser | `taverna` Taverna | **a referência** | todos · taberna n2, taverna n3, hospedaria n4 (8/12/16 m) | sem forma · `int-trabalho.js` `tavernBuild` (`taberna.salao`) e `estalagem.andar` | salão de 45–51 / 76–83 / 116–170 m² até o telhado; o bar encostado, as mesas com banquinhos, o fogo de cada povo, o estrado do músico, a escada aberta, a adega, quartos; 22,5 peças, 96% modeladas | freguês, taverneiro, cozinheiro, cervejeiro, músico (mega: 23 dentro em média, 18 numa só) · o corpo senta, pede, joga | 2–3 | **10** | 1,6 · 3/7/21 |
| Ser | `banhos` Banhos, Termas, Grandes termas | banhistas e o foguista (`G.Termas`) | todos · banhos n2; termas n5 e grandes termas n7 só no romano, no grego e no clássico | `forma.banhos` de cada povo (o lago sagrado egípcio, o temazcal, a sauna); `forma-termas.js` · `int-monumentos.js` `bathsSplit`, `int-termas.js` | **n2:** vestiário, frio e quente de 6–14 m² (o nórdico e o asteca são um cômodo de 6–8 m²); 1–2 piscinas, fornalha, cabide, banco. **Termas:** 8–10 salas, 3–9 piscinas, 6–12 cabides | muito usado (mega: 39 dentro em média; 22 de uma vez no lago egípcio); quem entra é posto na porta (`act-servicos.js` `goIn`) · corpo | 1 | 2 (termas 3) | 1,2 · 0/5/19 |
| Cam | `farm`, `pomar`, `plantacao`, `vinhedo`, `apiario`, `salina`, `horta`, `cercado` | os campos e as criações | — | sem forma · sem planta | o chão como o mundo o tem | os do ofício | — | aberto | `horta` 13; `farm` 3,2; os outros ≤ 1 |
| Cam | `curral` Curral | o rebanho (pastor, 2) | n3 | forma (`fold`) · sem planta | aberto | pastor | — | aberto | 1,4 · 4/16/19 |
| Cam | `estabulo` Estábulo | cavalariço (2); nunca do asteca | n3 | forma (`stable`) · sem planta | — | — | — | 0 | 0,4 · 0/1/5 |
| Ext | `mina` Mina | mineiros (4): o minério nasce só da mina | n1 | forma (a clássica) · sem planta | — | «dentro» sem planta (`economy.js` `minejob`) ou nas galerias (`G.Caves.mineShift`) | — | 0 | 2,4 · 0/36/21 |
| Ext | `doca` Doca | pescadores (12), o cais e o estaleiro (`fishers.js`), a descarga (`G.Porto`) | n2 | sem forma e sem planta (uma casinha de tábuas pintada) | — | — | — | 0 | 0,6 · 3/12/12 |
| Gov | `administracao` Administração | escribas (2) | n2 (o paço municipal n4 nenhum povo ergue) | forma · sem planta | — | o escriba escreve **na porta** (`act-servicos.js` `offers`) | — | 0 | 0,8 · 0/4/9 |
| Gov | `coletoria` Coletoria | cobradores (3), o tesouro, a cunhagem | n1 | forma (`taxes`) · sem planta | — | trabalham na porta | — | 0 | 1,2 · 1/7/20 |
| Gov | `cadeia` Cadeia | o preso (`crime.js` `cela`, `v.jail`) e o carcereiro (1) | todos · n2 | sem forma · `int-civicos.js` `W.add('cadeia')`, 6 famílias | 4–6 celas (palha, balde, grade); corredor ou guarda de 12–16 m² (mesa do escriba, chaves, banco) | o preso, posto na porta (`crime.js:35`, `:337`) · corpo | 1–2 | 2,5 | 0,2 · 0/1/5 |
| Gov | `quartel` Quartel | os guerreiros (força e proteção) | todos · n2 | sem forma · `W.add('quartel')`, 8 famílias | salão de 12–52 m²: 6 catres, 2 armeiros (vazios), 2 postes de treino, mesa, banco, mesa do escriba, arca | **ninguém dentro** (treinam diante dele) · corpo | 1–2 | 2 | 0,8 · 0/4/3 |
| Gov | `torre` Torre de Vigia | o vigia, as flechas | n1 | forma · sem planta | — | o vigia «dentro» sem planta (`economy.js` `runGuard`) | — | 0 | 1,8 · 0/18/43 |
| Pal | `paco` Casa do Chefe | a sede (`G.Court.seatOf`, `G.Casa.reign`), a audiência (`court.js`) | todos · n2 (o «Paço» n3 nenhum povo ergue) | `forma.paco` · `int-monumentos.js` `pacoFurnish` (e 11 famílias de salão) | **um cômodo só**: a sala do trono de 19–27 m², com o trono, 3–5 bancos, 2 lampadários, o lar ou o braseiro, **a cama de casal**, a arca, a mesa | quem governa dorme ali; a audiência (posto na porta, `court.js:427`) · corpo | 1 | 2 | 0,2 · 1/0/1 |
| Pal | `palacio` Palácio | a sede; a audiência | todos · antigo n3, palácio n6 (12/24 m) | forma (`forma.js`; o n6 no `forma-poder.js`) · `int-palacio.js` `palace()` (9 famílias) e `palaceByForm` | **n6:** a sala do trono de 14 × 9,4 m (131,6 m², pé-direito 9,4, 3% ocupada), 2 guardas, conselho, cozinha, escritório, pátio com fonte, aposentos em cima; 43 peças em 475 m² | a família de quem governa dorme (72% das olhadas na mega); a audiência no trono; nenhum guarda dentro · corpo | 1–2 | 1,5 | 0,6 · 0/0/3 |
| Pal | `grande_palacio` Grande Palácio | a sede | todos · antigo n4, n8 (16/32 m) | idem | **n8:** a mesma sala do trono de 131,6 m², mais audiência, banquete, escritórios e 5 aposentos em cima; 63 peças em 939 m² | a família; a audiência · corpo | 1–2 | 1 | 0,2 · 0/1/0 |
| Pal | `palacio_colossal` Palácio Colossal | a sede | todos · antigo n5, n10 (20/40 m) | idem | **n10:** a mesma sala do trono, mais tesouro, estudo, escadaria; 1.350–1.520 m² | — (nunca nos mundos) | 1–2 | 1 | 0 · 0/0/0 |
| Cul | `teatro` Teatro | o espetáculo (`act-lazer.js`: plateia, atores) | todos · antigo n3, n6, grande n8, monumental n10 (12–40 m) | forma (`forma.js`, `forma-espetaculo.js`) · `int-monumentos.js` `forma.teatro` | **grego, clássico, romano:** a cávea, a cena, camarins e bastidores vazios (cabides, bancos). **Egípcio:** o jardim sagrado aberto. **Asteca:** o campo de pelota. **Nórdico:** um salão de 44–429 m² com o lar, bancos e mesas | plateia e atores (mega: 34 em média, 57 num só), postos na porta (`goIn`) · o corpo entra | 1–2 | 3 | 1,0 · 0/1/5 |
| Cul | `biblioteca` Biblioteca | ler e copiar (`G.Biblioteca`) | todos · n2, grande n4 | `forma.salao`; a grande no `forma-saber.js` · `int-civicos.js` `libraryFurnish`; a grande no `int-saber.js` `byRisk` | salão de 20–23 m² (pé-direito 4,6): 3 estantes **vazias** (o prédio não guarda rolos: o `b.livros` só conta os lidos do dia), 3 mesas de leitura, mesa do escriba, banco. **Grande:** acervo, leitura, escritório, pátio, 10 estantes, 8 mesas | leitores e copistas (mega: 34 em média), **sentados no ar**, postos na porta · o corpo entra (a egípcia #11483 e a asteca #8444 param na porta) | 1 | 2,5 (grande 3) | 0,8 · 1/3/18 |
| Cul | `maravilha` Maravilha | a obra do povo: o Coliseu, a Grande Pirâmide, o Templo Mayor, a Acrópole, Valhala, o zigurate | todos · antiga n3, n10, colossal n13 (12–52 m) | forma · `int-monumentos.js` `forma.maravilha` | esplanadas; a arena e a cávea, o subsolo e o camarote (romano); a câmara e o corredor (egípcio); o salão de Valhala, de 429–764 m² (nórdico); só marcas, fileiras e sólidos | assistir, lutar, subir, rezar, ofertar, oficiar, banquete (`placeRule('maravilha')`); ninguém no dia medido · o corpo entra | 1–3 | 3 | 0,8 · 0/4/4 |
| Cul | `monument` Monumento | rezar e ofertar ao pé | todos · n2, grande n4 | forma · `int-monumentos.js` | a plataforma aberta, as marcas | quem passa · corpo | 1 | aberto | 0,8 · 0/5/3 |
| Cul | `estatua` Estátua de Ouro | só para ser vista | n1 | forma · sem planta | — | — | — | aberto | 0,6 · 0/2/3 |
| Cid | `praca` Praça | juntar-se, ouvir, conversar, beber (`G.Praca`) | todos · n2 | forma · `int-civicos.js` `square` / `squareOf` (1 família) | chão aberto de 61 m²: fonte, bancos, a pedra de falar, as marcas; os rostros romanos são um piso | o povo, à tarde · corpo | 1–2 | aberto | 1,8 · 4/17/23 |
| Cid | `well`, `aqueduto`, `campfire`, `ruin` | poço, cisterna, fogueira, ruína | — | formas (poço, aqueduto) · sem planta | — | — | — | aberto | ≈ 1 cada |

---

## 2. Cada tipo contra o padrão da taverna

**Legenda:** ✓ tem · ~ tem em parte · ✗ não tem · — não se aplica.

**De onde vêm os números das colunas:**
- **Modelados:** a parte das peças da planta cujo tipo tem modelo do Blender.
- **Coisas:** a média de coisas da decoração por prédio na mega (`G.Dentro3D.plan`).
- **Gente:** a média de pessoas dentro ao longo do dia (mega; nos tipos ausentes da mega, metrópole).
- **Iguais:** pares do mesmo mundo, povo e lote com o arranjo de móveis idêntico (na medida de 25 cm).

| Tipo | Espaço | Zonas | Modelados | Coisas (causa) | Luz com fonte | Gente usando | Entra pela porta (mundo) | Variedade (iguais) |
|---|---|---|---|---|---|---|---|---|
| taverna | ✓ | ✓ | 96% | 33,9 | ✓ | ✓ 23 | ✓ | ✓ (1/31) |
| casa, cabana, sobrado | ✗ (9–10 m², por decisão) | ~ (o núcleo: o fogo e a mesa, D-196) | 51–62% | 4,4–4,7 | ✓ | ✓ (a família: 88, 44…) | ✓ | ✓ (1/7290) |
| ínsula, quarteirão | ✗ | ~ | 63–69% | 5,1–6,8 | ✓ | ✓ 82 / 41 | ✓ | ✓ |
| casa rica | ~ | ✗ (sem átrio nem triclínio) | ~ | ≈ casa | ✓ | ✓ | ✓ | ✗ (1 família) |
| templo | ~ | ~ (a forma) | 5% | **0** | ~ (lampadário e altar, com alguém acordado) | ✓ 3 | ✓ | ✗ (1 por povo e degrau) |
| armazém, do porto | ~ | ~ | 0–2% | 0,8–1,0 (a teia) | ✗ | ✗ (só o conclave) | — | ✓ |
| celeiro | ~ | ✗ | 0% | 0,7 | ✗ | ✗ | — | ✗ (3/4) |
| mercado | aberto | ~ (a forma) | 0% | 0,1 | ✗ | ✗ (na porta) | — | ✗ (52/65) |
| feira | aberto | ✓ (ruas, bordas, praça) | 0% | 0 | ✗ | ~ (nos lugares do deus) | — | ✓ |
| oficina | ✗ (galpão a 8%) | ✗ | 2% | 1,5 | ✗ | ✗ | — | ✓ |
| forja | ✗ (7%) | ~ | 2% | 2,2 (teia, vela) | ~ (só na fornada) | ~ 0,7 | ✗ (posto na porta) | ✓ |
| tecelagem, olaria | ✗ / terreiro | ~ | 0–3% | 1,2–1,8 | ~ (o forno na fornada) | ~ (sentado no ar) | ✗ | ✓ |
| ourives, açougue | ✗ (6,6 m²) | ✗ | 0–1% | 1,1–1,4 (a teia) | ~ | ✗ | ✗ | ✓ |
| banhos | ✗ n2 / ✓ termas | ✓ (a fila das salas) | 28% | 0,7 | ~ (a fornalha quente) | ✓ 39 | ✗ (`goIn`) | ✗ (1 por povo) |
| cadeia | ~ | ✓ (celas, guarda) | 7% | 0,8 | ✗ | ~ (o preso) | ✗ | ~ |
| quartel | ✗ (galpão) | ~ | 21% | 1,3 | ✗ | ✗ | — | ✓ |
| paço | ✗ (um cômodo com a cama) | ✗ | 87% (o trono é caixa) | 10,0 | ✓ | ✓ (dormir, audiência) | ✗ (audiência posta na porta) | ✗ |
| palácios (3 tipos) | ✗ (a sala do trono de 131,6 m² a 3%) | ~ | 75–80% (o trono e o armeiro são caixas) | 10,7 (os da casa e uma tapeçaria) | ✓ | ~ (dormir, audiência; sem corte nem guarda) | ✗ | ✗ |
| biblioteca | ~ | ~ (na grande) | 22% | 0,6 (a teia) | ✗ (lampadário em 1 de cada 10) | ✓ 34 (sentados no ar) | ✗ | ✗ |
| teatro, maravilha | aberto, pela forma | ✓ (a forma) | 89–95% (do pouco que há) | 0,3–0,5 | ✗ | ✓ 34 / ✗ | ✗ | ✗ |
| praça, monumento | aberto | ✓ | — | 0–0,1 | — | ✓ / — | — | ✗ (praça 81/84) |

---

## 3. Por categoria

**Moradias** (casa, cabana, sobrado, ínsula, quarteirão, barraco; e a casa rica, degrau da casa).

*Hoje.*
- São de longe o que o jogador mais vê: 15,6 casas, 8 ínsulas e 4,4 sobrados por metrópole; 576 das 1.004 plantas da metrópole e
  da mega somadas.
- São também o tipo mais bem servido depois da taverna:
  - a gramática `home()` (`int-familias.js`) faz 27 a 60 famílias por tipo (organização do térreo × os pavimentos de cada povo:
    jirau, terraço, quarto no teto, semienterrada, sobre esteios, porão), com as camas, o fogo e o jeito de comer de cada povo
    (`In.TRAD`: o banco-cama nórdico, a esteira de comer egípcia e asteca, o forno egípcio, o fogão grego e romano);
  - a variedade é a melhor do jogo (1 par igual em 7.290);
  - o `G.Lar` dá a vida (dormir, ceia, cozinhar, a noite acordada, ninar, luto, cuidar, abrigo), com a entrada pela porta e o
    repartidor;
  - o `Dentro3D.house` põe o básico com causa: a comida no núcleo, a louça, os potes, o saco de grão, a lenha, as réstias, o pano na
    arca, o tapete do rico, a lamparina.

*O que falta.*
- A escala é a da decisão 14 (4 × 4 m, um lar de ≈ 10 m²).
- Metade das peças ainda é caixa, justamente o núcleo: a mesa com bancos, o banco e a esteira de comer, o braseiro, os cestos, o
  nicho, a prateleira, o fogareiro e o fogo de chão.
- **A esteira deitada ainda é parede**: o código `LOW` não é passável (`interiors.js:1399` `PASS`), e as esteiras cobrem de um quarto
  a um terço do chão.
- Os andares de cima são jiraus de gatinhas ou terraços, com escada de mão (317 das 353 escadas do tipo `house`).
- A riqueza só aparece na cama, no tapete e na tapeçaria.
- A casa é sobretudo dormitório: na mega, 75% das olhadas dentro de casa são de sono.
- Entre as moradias, o quarteirão (`int-quadras.js`) é o de mais portas de dentro (10,8) e o mais denso (36 peças).
- O barraco não aparece em nenhum mundo pronto.
- A casa rica (`domus.patio`) é uma família só, com o lar de 10 m² e três quartos, sem átrio, tablino nem triclínio, e só 2 existem
  nos mundos.

**Religião e memória** (templo, cemitério).

*Hoje.*
- O templo existe em 4 degraus (8 a 32 m), todos pela forma de cada povo: a cela grega, clássica e romana; o salão nórdico; a
  hipostila egípcia; a plataforma asteca.
- A planta (`formTempleFurnish`, `templeByForm`) põe o ídolo, o altar, o cofre, 1–2 lampadários e as fileiras: os bancos dos fiéis
  ou as esteiras de oração, que chegam a 164 no monumental egípcio.
- É usado de verdade: o sacerdote oficia, os fiéis rezam, e os dois entram pela porta (`In.hold` + `Vg.enter`).
- O lampadário (modelo) e o altar acendem com alguém acordado.

*O que falta.*
- 95% das peças são caixas: o ídolo, o altar, os bancos dos fiéis, as esteiras, o cofre.
- Não há nenhuma coisa de decoração: 0 por templo na mega. O cofre também fica vazio, porque a oferenda vai para o estoque do povo
  (`act-servicos.js` «oferenda»).
- A arquitetura é uma só por povo e degrau.
- O templo asteca para o corpo na porta (D-737, #5113 de hoje).
- O cemitério é chão aberto.

**Armazéns e celeiros** (armazém, celeiro, armazém do porto).

*Hoje.*
- São comuns (3,4 armazéns por metrópole).
- Saem do `work()` do `int-trabalho.js` com 16 a 23 famílias (salão, frente, corredor de celas, pátio, três naves × galeria, porão,
  esteios, sobrado): é variedade de verdade.
- As baias e as tulhas mostram quanto estão cheias, mas pela parte do estoque **total** do povo (`fillOf` `dep: 'povo'`), em sacos
  genéricos.

*O que falta.*
- Ninguém trabalha dentro: a entrega comum é na porta, e a mesa de conferência não é usada pelo mundo (a nota da matriz). As únicas
  pessoas lá dentro num dia inteiro são a reunião da sociedade secreta à noite (`secrets.js:110`, «o porão do armazém»).
- Nenhuma fonte de luz, porque não há fogo nem mesa do núcleo.
- Decoração: só a teia.
- Nenhuma peça modelada (a pipa sim).
- O celeiro egípcio e o asteca, pela forma, são chão aberto com as tulhas.

**Comércio** (mercado, feira, mercado clandestino).

*Hoje.*
- O mercado é pela forma de cada povo: um chão aberto de 54 m² com 5 bancas, 2 baias e 14 sólidos (os postes e os toldos).
- A feira é aberta, com 6 famílias (ruas, bordas ou praça × chão ou toldos), e as bancas enchem com os bens dela (`b.inv`).

*O que falta.*
- **As bancas da planta do mercado nunca são usadas**: o `act-negocio.js` põe as bancas do `G.Biz` diante da porta («a market hall:
  the stalls stand along its front», `spots`), porque o `B.spotOf` ficou `null` à espera de que «as pessoas andem dentro de uma
  planta». Por isso as bancas mostram 0 de mercadoria.
- A feira põe os feirantes nos lugares do desenho do deus (`cityart.js:417` `STALLS`), não nas bancas da planta.
- O mercado é quase sempre igual (52 de 65 pares).
- O modelo de banca do Blender (`arte/blender/banca.py`) é o do desenho de fora da feira e do mercado (`build3d.js` `stalls`); as
  bancas da planta são a caixa `banca` do `FURN`.
- O mercado clandestino não tem planta.

**Ofícios** (oficina, forja, tecelagem, olaria, ourivesaria, açougue; e as três sem planta: seda, salga, pérolas).

*Hoje.*
- Têm boa variedade de casca (9 a 15 famílias do `work()`; a olaria pelo terreiro), e o motor das fornadas (`G.Oficio`) põe o mestre
  no lugar da etapa: forjar, martelar, temperar; tornear, cozer, moldar, amassar; tecer; lavrar, fundir.
- O fogo da forja e do forno acende só na fornada (`G.Atmos.fire`, `fires()`).
- O corpo trabalha nas bancas (`trabalho.js`).

*O que falta.*
- **São os piores interiores do jogo:**
  - a oficina comum não tem ofício nenhum (um galpão de 39 m² a 8%, onde só entra o conclave);
  - a forja tem 35 m² a 7%;
  - a ourivesaria e o açougue têm 6,6 m², com 2–3 peças;
  - o açougue ainda é das tarefas antigas (`estates.js`) e ninguém entra.
- Quase tudo é caixa (0–3% modelado): a forja, a bigorna, o tear, a roda, o forno da olaria, a bancada, os ganchos.
- **O tecelão, o oleiro, o ourives e o copista sentam no ar** (§5.3).
- O enchimento das prateleiras e bancadas é a parte genérica do `b.inv` (o minério da forja numa bancada a 88%).
- Nenhuma ferramenta, peça feita ou matéria tem forma na decoração.
- Fora da fornada, a forja fica escura.
- A seda, a salga e as pérolas só têm a forma de fora.

**Serviços** (taverna, banhos).

*Hoje.*
- A taverna é a referência.
- Os banhos são o serviço mais cheio depois dela (39 dentro em média na mega).
- Os banhos pequenos (n2) são a forma de cada povo: o frigidário e o caldário clássicos em três salas de 6–14 m², o lago sagrado
  egípcio aberto, o temazcal asteca e a sauna nórdica em um cômodo de 6–8 m².
- As termas (n5) e as grandes termas (n7), só do romano, do grego e do clássico, têm a fila de salas de verdade (`int-termas.js`):
  8–10 salas, 3–9 piscinas, a palestra.

*O que falta.*
- Quase tudo é caixa: piscina, cabide, fornalha, tina.
- Nenhuma decoração.
- A luz é só a fornalha quente.
- Quem entra é posto na porta (`goIn`).
- A arquitetura é uma por povo e degrau.
- O lago sagrado egípcio, aberto, recebeu 22 de uma vez; os banhos clássicos de 8 m põem a mesma freguesia em salas de 6–14 m².

**Campo e criação** (fazenda, pomar, plantação, vinhedo, apiário, salina, horta, curral, estábulo, cercado).
- Todos são chão sem planta, e assim devem ficar, menos o **estábulo**: um prédio de 12 m com o cavalariço, só com a forma de fora,
  que a hospedaria do roteiro do taverneiro vai querer.
- O curral tem forma e é aberto.

**Extração e pesca** (mina, doca).
- A mina é a boca na encosta (forma) e as galerias na caverna (`G.Caves.mineShift`): é outro plano (`planos/subterraneo.md`,
  Patch 31).
- **A doca não tem forma nem planta** (a casinha de tábuas é pintura), e o «estaleiro» é uma tarefa nela (`fishers.js`), não um tipo.
- O roteiro (estivador, fiscal, alfândega, N3) precisa dela por dentro.

**Governo, justiça e guarda** (administração, coletoria, cadeia, quartel, torre).

*Hoje.*
- A cadeia lê-se como cadeia: celas com grade, palha e balde, o corredor ou a guarda com as chaves. O preso é posto na cela pela
  porta.

*O que falta.*
- O quartel é um galpão de 6 catres, 2 armeiros **vazios** (o enchimento é o `b.inv` do quartel, vazio nos mundos: as armas são do
  estoque do povo) e 2 postes,
  onde **ninguém entra**: o treino é diante dele (`act-servicos.js` «publico.treinar»).
- A administração, a coletoria e a torre não têm planta: o escriba e o cobrador trabalham na porta, e o vigia fica «dentro» sem
  lugar.
- O paço municipal (n4) é um degrau que nenhum povo pode erguer (§5.9).

**Palácios** (casa do chefe, palácio, grande palácio, palácio colossal).

*Hoje.*
- O maior fracasso diante do que o dono espera (o `interiores-2.md` §6 o põe primeiro), e o motor já tem quase tudo:
  - a sede é a casa de quem governa (`G.Casa.reign`), que dorme lá;
  - a audiência é no trono (`court.js`, `placeRule` `palacio` e `paco`);
  - 75–87% das peças já são modelos (camas, arcas, bancos, mesas, lampadários);
  - a decoração da casa vale lá (10–11 coisas e uma tapeçaria do povo que tece);
  - a luz é o lar e os lampadários.

*O que falta.*
- **O paço é um cômodo só**, com a cama de casal na sala do trono.
- **Os três palácios grandes têm a mesma sala do trono**, de 14 × 9,4 m, com pé-direito de 9,4 m e 3% do chão ocupado
  (`palaceByForm`), em 475 m² (n6), 939 m² (n8) e 1.350–1.520 m² (n10).
- O trono e o armeiro são caixas.
- Não há corte, guardas dentro, banquete servido nem estandartes: os modelos existem, mas só a festa da taverna os usa.
- A arquitetura é uma por povo e degrau.
- O «Paço» n3 é um degrau morto.
- Os palácios são um por capital: o jogador vê pouco, mas o dono olha.

**Cultura e espetáculo** (teatro, biblioteca, maravilha, monumento, estátua).

*Hoje.*
- São formas lindas, onde a planta só põe o que se usa (as fileiras, as marcas, os sólidos), e o corpo entra.
- O teatro e a biblioteca enchem na mega (34 pessoas em média cada).

*O que falta.*
- Os camarins e os bastidores do teatro são salas vazias.
- O salão nórdico (o teatro e Valhala: 44 a 764 m², com o lar, os bancos e as mesas) é o interior desta categoria que mais se parece
  com uma taverna — e está cru.
- A biblioteca tem as estantes vazias porque **o acervo não existe como coisa no mundo**: o `b.livros` são contas do dia; a estante
  mostra o `b.inv`, que está vazio. Os leitores sentam no ar.
- O monumento e a estátua são para olhar de fora.

**Obras abertas da cidade** (praça, poço, aqueduto, fogueira, ruína).
- Todas são chão aberto.
- A praça tem a planta da forma de cada povo (fonte, bancos, a pedra de falar, as marcas) e é sempre igual (81 de 84 pares) —
  aceitável, por ser praça.
- **Defeito visto:** a decoração põe um tapete no chão da praça, do mercado e do celeiro (0,1–0,2 por prédio na mega). O `cloth()`
  do `dentro3d.js:688` só pergunta «não é taverna»: a terra rica de um povo que tece basta.

---

## 4. Os números de cada categoria (para o plano)

| Categoria | Tipos com planta / sem planta | Prédios por metrópole | Plantas reais (metro + mega) | Nota média |
|---|---|---|---|---|
| Moradias | 6 / 0 | ≈ 33 | 576 | 2,5–3 |
| Religião | 1 / 1 | 1,8 templos | 13 | 2,5 |
| Armazéns | 3 / 0 | ≈ 5,4 | 86 | 2–2,5 |
| Comércio | 2 / 1 | ≈ 3 | 60 | 2,5 |
| Ofícios | 6 / 3 | ≈ 5,8 | 128 | 1–2 |
| Serviços | 2 / 0 | ≈ 2,8 | 49 | 10 (taverna), 2–3 |
| Campo | 0 / 10 | — | — | aberto (estábulo 0) |
| Extração | 0 / 2 | ≈ 3 | — | 0 |
| Governo | 2 / 3 | ≈ 4,8 | 12 | 0–2,5 |
| Palácios | 4 / 0 | 1 por capital | 5 | 1–2 |
| Cultura | 4 / 1 | ≈ 4 | 35 | 2,5–3 |
| Cidade | 1 / 4 | ≈ 4,6 | 40 | aberto |

---

## 5. As lacunas que atravessam todos

### 5.1 A escala, nos dois sentidos

**Pequenos demais:**
- as lojas e os banhos pequenos: a ourivesaria e o açougue com 6,6–6,7 m², o telheiro da olaria com 6,6 m², os banhos n2 com
  6–14 m²;
- as casas, mas essas por decisão (a 14).

**Galpões vazios:**
- a oficina (39 m² a 8%), a forja (35 m² a 7%), a tecelagem (31 m² a 9%), o celeiro (46–61 m² a 5%), o quartel (até 52 m²);
- a sala do trono dos três palácios grandes, a mesma de 131,6 m² a 3%, com pé-direito de 9,4 m.

Só a taverna tem um padrão de área por degrau (`int-trabalho.js` `TMIN`: 30/60/110 m²) e um corredor de 1 m (`AISLE`, `P.zones`).
Nenhum outro programa tem zonas nem corredor: o `work()`, o `home()` e o `formHall` ainda encaixam por «encostar» (o `P.place` com o
`touch`).

### 5.2 Os móveis por povo

O catálogo tem 97 peças (`In.ITEMS`). 29 têm modelo do Blender (`movelmesh.js`: 218 modelos, mais 3 partes: ânfora, chaminé, folha
de porta). O modelo só entra quando o tamanho da peça cabe nele (`G.Movel3D.FIT`: de 0,78 a 1,28 em cada eixo); fora disso, a caixa.
As outras 68 não têm modelo: **63 são peças desenhadas como caixas** pelo `FURN` do `build3d.js:3728` (77 receitas) ou pela forma,
e 5 são marcas sem desenho (`cena`, `luta`, `marca`, `fileira`, `solido`).

**Quanto de cada tipo é modelado:**

| Faixa | Tipos |
|---|---|
| quase tudo | taverna 96% |
| a maior parte | paço 87%, palácios 75–80% |
| mais ou menos metade | casas 51–69% |
| pouco | banhos 28%, biblioteca 22%, quartel 21% |
| quase nada | cadeia 7%, templo 5%, oficinas 0–3%, mercado, feira, celeiro e armazéns 0% |

**As peças-símbolo de cada tipo ainda são caixas:**
- o trono, o ídolo e o altar;
- o tear, a bigorna, a forja e a roda de oleiro;
- a estante, a tulha, a baia e a banca;
- a piscina, o armeiro e o catre.

### 5.3 Sentado no ar

O lugar onde se senta para trabalhar ou comer não fica sobre peça nenhuma:
- `ler` na mesa de leitura;
- `escrever` na mesa do escriba (biblioteca, armazéns, quartel, palácios, cadeia);
- `tecer` no tear, `tornear` na roda, `lavrar` na bancada do ourives;
- `comer` na `mesa` (palácios, paço, quartel, o salão nórdico, Valhala).

O estado é `sit` ou `eat` (`In.USE_ST`), e o `ON_GROUND` só baixa para o chão as peças `chao` (`interiors.js:1945`, `2273`,
`2511`). A taverna resolveu isso com o banquinho e a cadeira (o lugar `sentar` sobre a peça); falta o mesmo em toda estação de
trabalho e mesa.

### 5.4 A esteira ainda é parede

Toda peça `low` vira `C.LOW` na grade (`interiors.js:1286`), e o andar só aceita chão, porta e alçapão (`PASS`, `:1399`). Um banco
ou um catre barrar a passagem é natural; o defeito são as peças rasas, que barram o corpo e as pessoas como se fossem parede:
- a esteira (6 cm) e a esteira de casal;
- a esteira de comer (5 cm) e a esteira de oração (3 cm);
- a palha da cela (10 cm);
- a eira da olaria (5 cm).

O `interiores-2.md` (§2.1) já apontava isso, e nada mudou fora da taverna, que trocou as esteiras por bancos.

### 5.5 As causas da decoração

**O que já existe.** O `G.Atmos.within` (`atmos.js:437`) é geral. O desenho (`dentro3d.js:250` `build`) tem só duas receitas,
`tavern()` e `house()` (esta para todo prédio com camas: casas e sedes), mais o tapete, a lamparina e a teia para os outros.

**Na mega, por prédio:**

| Tipo | Coisas por prédio |
|---|---|
| taverna | 33,9 |
| palácio, paço | 10–11 |
| casas | 4–7 |
| forja | 2,2 |
| os outros | 0–1,5, quase só a teia |
| templo, feira, monumento | 0 |

**As causas que faltam:**
- as ferramentas e as peças do ofício (o ferro na bigorna, os potes secando, o pano no tear, as joias, a carne nos ganchos);
- a mercadoria do armazém pelo que ele guarda, não pela parte do total do povo;
- as armas no armeiro;
- os rolos da biblioteca, que pedem um acervo como coisa: o papiro, o pergaminho, as tabuletas, com a origem — nada vem do nada;
- as oferendas no altar, que vão para o estoque do povo e o cofre mostra 0;
- a corte: os estandartes, que já existem para a festa da taverna;
- o banho: os panos, os óleos, a lenha da fornalha.

**Os modelos.** As 96 coisas da decoração (`decomesh.js`) são quase todas de mesa e taverna: comida, bebida, louça, rabiscos, jogos,
festa.

### 5.6 As fontes de luz

As fontes com causa são:
- o fogo das peças `fire` (`FIRE_K`, `luz3d.js:56`), só quando o `G.Atmos.fire` diz:
  - a fornada, a forja com gente;
  - a fornalha dos banhos quente;
  - a taverna aberta;
  - o fogo de quem está acordado numa casa ou numa sede;
- o lampadário e o altar com alguém acordado (`LAMPS`, `:60`);
- a lamparina e a vela da decoração, só sobre uma mesa do núcleo (`CORE`: `mesa-casa`, `mesa`, `mesa-baixa`, `esteira-comer`,
  `mesa-terreiro`, `bancada`; `dentro3d.js:602`).

**Ficam sem luz nenhuma à noite:**
- o armazém, o celeiro, o armazém do porto, o mercado;
- a cadeia e a biblioteca (o lampadário só em 1 de 10);
- a tecelagem e o açougue, que não têm fogo nenhum; a ourivesaria fora da fornada;
- os camarins do teatro.

**À meia-noite em que os mundos abrem**, na mega, só as casas, os palácios e uma ou outra taverna têm luz acesa.

### 5.7 As portas entre cômodos

O motor faz portas, vãos, arcos e grades (`P.door`); as folhas modeladas de cada povo e o `In.doorState` (abrir para quem passa)
valem para todos.

**Portas de dentro por planta:**

| Tipo | Portas de dentro |
|---|---|
| casas | 0,3–0,7 (um cômodo e um jirau) |
| oficinas | 1 |
| armazéns | 3,7 (quase todas vãos) |
| templo | 4,6 |
| cadeia | 6,2 (grades) |
| palácios | 8–36 |
| quarteirão | 10,8 |

A falta não é de porta: é de cômodo com função entre elas. Por exemplo, o sobrado da oficina e do armazém é um «sobrado» sem
programa (`roomsFor`/`loftFloor`).

### 5.8 As escadas e os andares de cima

- A escada de madeira aberta (D-713) vale para todo `escada`.
- A **escada de mão** continua um par de toras (`build3d.js:3636`) e é 317 das 353 escadas das casas (o tipo `house`).
- Os andares de cima são:
  - nas casas: o jirau de 1,2 m, de gatinhas (1,80 m livres debaixo dele no nórdico), e o terraço;
  - nas oficinas e nos armazéns: a «galeria» e o «sobrado» vazios;
  - nos palácios grandes: os aposentos.
- Templo, banhos, biblioteca, mercado e feira são de um piso só.

### 5.9 Prédios sem interior e degraus mortos

**25 dos 56 tipos não têm planta.** Desses, os que têm teto e gente:
- a doca (sem forma nem planta), a mina (as galerias são outro plano), a administração, a coletoria, a torre;
- o mercado clandestino, o estábulo, a casa da seda, a salga, a casa dos mergulhadores.

**Três tipos que o roteiro pede não existem:** a alfândega, a escola de gladiadores e o estaleiro (este é uma tarefa na doca).

**Três degraus da escada não têm quem os erga.** Nenhum povo tem forma nem planta desse tamanho, e o `Es.can` (`escala.js:65`) diz
que não:
- o mercado coberto n4 (`escala.js:50`);
- o paço municipal n4 (`:51`);
- o «Paço» n3 da casa do chefe (`:42`).

### 5.10 A vida dentro e a entrada pela porta

**Quem entra num dia inteiro:**
- muita gente: casas, taverna, banhos, biblioteca, teatro;
- alguma: palácio (sono e audiência), templo;
- pouca: olaria, tecelagem, forja;
- só o conclave à noite: armazém, celeiro, oficina;
- **ninguém**: quartel, açougue, ourivesaria, mercado, feira, cadeia (sem presos nesse dia), maravilha.

**A entrada.** O mundo espera a caminhada da porta ao lugar (`Vg.enter`, `t.inW`) só nas casas, na taverna e no templo. Nos outros
prédios a pessoa é posta na porta e marcada «dentro» de uma vez:
- `act-lazer.js:48` e `act-servicos.js:394` (`goIn`);
- `act-oficio.js:466`, `court.js:427`, `crime.js:35`, `crime.js:337`.

O desenho da P6 a mostra andando, mas o mundo não espera. A saída andando (`WALK_OUT`, `villagers.js:348`) já cobre os banhos, a
leitura, o teatro e a reza.

**Os lugares que o mundo não usa:**
- as bancas do mercado e da feira;
- a mesa de conferência dos armazéns;
- os catres e os postes do quartel;
- a oficina comum inteira.

### 5.11 A riqueza e a diversidade

- O `G.Atmos.rich` é de agora e geral: as casas pelas moedas e pela bandeira, a sede sempre rica, os outros pelo valor da terra.
  Mas só a taverna o lê na planta (`rec.q`).
- Fora da taverna, a riqueza só muda a cama, o tapete, a tapeçaria e a mesa «rica» do romano.
- Por arquitetura:
  - uma só por povo e degrau: o templo, o paço, os palácios, os banhos, a biblioteca, o teatro, a maravilha, o mercado, a praça e
    o celeiro egípcio e asteca;
  - variadas por família: as casas, as oficinas e os armazéns.

### 5.12 O corpo entrando

O script da P4 rodou no código de hoje, em 2 prédios de cada tipo, na metrópole e na mega.
- **Entra andando em todos que têm porta**, pelo pé da escada.
- **De frente falha** onde a escada desce de lado (D-737): oficina, quartel, tecelagem, celeiro nórdico, armazém do porto, tavernas
  nórdica, grega e egípcia, quarteirão nórdico, maravilha egípcia.
- **Param o corpo na porta, sem borda:**
  - o templo asteca (#5113, metrópole);
  - as bibliotecas egípcia (#11483, metrópole) e asteca (#8444, mega).
- Pelo pé da escada falha só o teatro asteca (#14615); de frente ele entra.
- **Nos chãos abertos sem porta** (praça e feira) o corpo pisa, e só fica «dentro» enquanto segura um lugar
  (`Possess.use` / `openOn`, `possess.js:281–290`). O mercado e o monumento, abertos para o céu, têm uma entrada, e o corpo entra por
  ela.

### 5.13 O custo de desempenho

**Fazer as plantas (Node, a frio).**
- Por planta:
  - casas: 3–8 ms de mediana (a ínsula 30, até 326);
  - oficinas e armazéns: 1–6 ms;
  - a taverna nova: **50–60 ms** (até 285 nas amostras);
  - o templo monumental 148 ms, o teatro monumental 112, a maravilha colossal 318.
- No mundo inteiro: a metrópole leva 3,6 s para as 353 plantas, a mega 10,2 s para as 651; as 21 tavernas da mega são 1,1 s disso.
- **O mundo precisa da planta de todo prédio com gente dentro.** A tabela dos lugares (`tableOf`, `interiors.js:2050`) é feita pelo
  `In.plan`, uma vez por registro (até `In.SHELLS` = 6.000). Uma gramática de casa tão cara quanto a da taverna (≈ 55 ms), nas ≈ 380
  moradias de pé da mega, daria ≈ 20 s de plantas no primeiro dia depois de um load: no passo do mundo, não pelo `In.pump` do desenho.

**No 3D.**
- Abre no máximo **3 interiores**, a até 8 m do corpo (`build3d.js:5049`: `OPEN_R`, `OPEN_MAX`).
- O atlas da luz tem 3 vagas de 64 × 32 × 64 voxels (`luz3d.js`). O voxel é de 0,5 m até um lote de 32 m e cresce com ele (`vs`,
  `luz3d.js:120`): 0,625 m no palácio colossal e no teatro monumental de 40 m, 0,875 m na maravilha colossal de 52 m; na altura,
  um trigésimo segundo do prédio (a sala do trono de 9,4 m, com o telhado).
- A decoração guarda 64 prédios (`dentro3d.js`, `memo`).
- Os móveis vão por instâncias, o que já é barato.

---

## 6. Para a ordem (só os fatos que pesam)

- **O que o jogador mais vê:**
  - as moradias (≈ 33 por metrópole);
  - os armazéns (≈ 5,4);
  - as oficinas e as lojas (≈ 5,8);
  - o governo (≈ 4,8, mas 3 deles sem planta);
  - os templos (1,8), as tavernas (1,6), as praças (1,8).
  - Os palácios são um por capital, mas são o que o dono mais cobra.
- **O que já tem a vida e falta o espaço e a cara:** os banhos, a biblioteca, o teatro, o templo, a casa, o palácio. Nesses, o
  trabalho é de planta, móveis e decoração.
- **O que tem o espaço e falta a vida:**
  - o quartel e a oficina (ninguém entra);
  - o mercado e a feira (o mundo usa outros lugares);
  - os armazéns (a entrega na porta);
  - o açougue e a ourivesaria.
  - Nesses, o trabalho é também de mundo: uma razão para entrar e o lugar usado, com prova de mundo igual.
- **Os pré-requisitos que servem a todos:**
  - o assento nas estações de trabalho (§5.3);
  - a esteira e a palha andáveis (§5.4);
  - as causas novas no `within` e as receitas do `Dentro3D` por tipo (§5.5);
  - o acervo da biblioteca como coisa (§5.5);
  - a entrada pela porta (`Vg.enter`) nos `goIn` (§5.10);
  - o orçamento da gramática, se ela ficar tão cara quanto a da taverna (§5.13).

---

## 7. Os dados e como medir de novo

Pasta: `/tmp/claude-0/-home-user-promptzada-de-adulto-do-dr-s-ntese/474a40dc-2376-5786-aa24-770c3a52b5eb/scratchpad/interiores3/A-dados/`.

| Arquivo | O que faz | Saída |
|---|---|---|
| `tipos.js` | o `G.BDEF`, a escada, o `In.TYPES`, as formas | `tipos.json` |
| `conta.js` | os prédios por tipo, povo, degrau e cidade nos três mundos | `conta.json`, `freq.txt` |
| `plantas.js` | todas as plantas de verdade e as amostras | `plantas.json` |
| `resumo.js real\|sample` | junta as plantas por tipo | `resumo-real.txt`, `resumo-amostra.txt` |
| `catalogo.js` | as 97 peças, quem usa cada uma e quais têm modelo | `catalogo.txt` |
| `dentro.js mundo 1` | um dia de quem entra em quê | `dentro-metropole.json`, `dentro-mega.txt` |
| `entra-degrau.js` | o corpo entrando (o script da P4, sobre o código de hoje) | `A-entra-metropole.txt`, `A-entra-mega.txt` |
| `deco.js` | a decoração e as luzes de agora por tipo, na mega | `deco-mega.txt` |
| `node qa/matriz-predios.js <saída>` | a matriz por categoria, gerada fora do repositório | `matriz.md` |
