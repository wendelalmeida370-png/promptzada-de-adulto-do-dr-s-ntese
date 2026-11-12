# Bloco do agente F — a freguesia (os banhos, a biblioteca, a praça; L-717)

> **Estado: FECHADO** (o que está dito «passa» foi rodado nesta árvore, um processo de cada vez; o que não foi feito está
> dito nos itens 0 e 6).
> Ramo `worktree-agent-a4d17534a654b4869`, sobre o `b2b61f0` (a árvore nasceu no `main` e foi avançada para a ponta do ramo
> do líder com `git merge --ff-only b2b61f0`, antes de qualquer mudança).
> Números reservados: L-910 a L-929, T-910 a T-929, D-200 a D-204; regras 69 e 70 do guard.
> **Usados:** L-910; T-910 a T-920; D-200 a D-204. **Livres:** L-911 a L-929, T-921 a T-929.
> Rascunho, medidas e sabotagens: `scratchpad/ag/F/` (`antes/`, `depois/`, `final/`, `sab/`, `sab-F.py`).
> **Arquivos mexidos:** `js/act-servicos.js`, `js/act-lazer.js`, `js/villagers.js` (4 linhas no `decide`, 2 no `start`);
> as provas `qa/freguesia.js` e `qa/freguesia-inv.js` (novas), `qa/termas-mao.js` (uma linha do caso «fecha-na-hora») e
> `qa/termas.js` (três linhas do caso e1, logo antes e depois do `bathers(b, 6, 2.9)` — longe do `ready(b)` que o líder mexeu
> no T-810) e `qa/categorias/p2.js` (a `freguesia.js` na lista de provas das atividades «banho» e «ler»; a
> `qa/MATRIZ-PREDIOS.md` não foi gerada de novo — o líder a gera com a regressão). **Não toquei** em `city.js`, `village.js`, `interiors.js`, `polity.js`, `urban.js`, nem em arquivo compartilhado.
> Nenhum arquivo novo em `js/`; o catálogo das plantas não muda.

## 0. O resumo

**Feito e rodado** (os commits do ramo: `6e27cc8`, `ab7771c`, `c433aff` e o do fecho):
- as medidas de antes (item 7), na base limpa (uma cópia do `b2b61f0` em `scratchpad/ag/F/base/`);
- a vontade do banho e a da leitura (D-200, D-201), o banho e o rolo que seguram quem entrou (D-203), o foguista no
  posto (D-204, o recado do líder do T-810), o dia que fecha com gente a caminho (L-910);
- a prova `qa/freguesia.js` e as regras `qa/freguesia-inv.js`;
- as 36 sabotagens, todas acusadas com o código final (item 9);
- as provas vizinhas no ramo e, as que falharam, na base (item 8);
- as medidas de depois (item 7): cinco dias vividos na metrópole e na mega, os mundos do zero, dez anos dos mundos
  prontos — e dez anos da metrópole na paz do deus, três histórias de cada lado.

**Não feito (dito no item 6):** a praça e o mercado ao fim da tarde (o item 4 da tarefa) — medido e desenhado, não
programado; a água da casa e a fome do foguista (as outras duas causas do T-810); as crianças nos banhos.

**Os mundos prontos:** a vontade muda a vida de toda cidade com banhos ou biblioteca — os mundos prontos de hoje abrem e
vivem (as provas rodam neles), e a geração 20 do líder já sai com a freguesia.

## 1. Linhas do AUDIT (Bairros Vivos)

| L-717 | bug (consertado nos Bairros Vivos, F) | **Ninguém ia aos banhos** *(a linha de antes fica; acrescentar:)* **Correção:** o banho e a leitura são uma vontade de cada um, escolhida entre as outras do dia (`villagers.js`, `decide`: os tipos `'banho'` e `'ler'`, ao lado da taverna e do teatro — `G.Termas.urge` / `go`, `G.Biblioteca.urge` / `go`), com causa: quem, quando, quanto, o que impede (D-200, D-201). Medido na metrópole pronta, em dias de paz: de 0 banhos em 20 dias-de-banhos para 9 a 17 por dia em Mênfis (127 pessoas; até 16 na água de uma vez), 9 a 12 em Tebas (62; até 10), 0 a 2 em Roma (38), 0 ou 1 por dia em Tenochtitlan (o Temazcal tem um lugar só na água, T-914); as leituras de 0 para 1 a 4 por dia em cada biblioteca de um povo com a escrita. No salto, o mesmo (4,4 banhos por dia e por prédio em quatro anos). Prova: `qa/freguesia.js` (23 linhas) e as regras `qa/freguesia-inv.js`. Sabotagens (36, cada uma numa cópia): a escolha sem o banho (o mundo de antes): b1 falha («1 banho em 8 dias de banhos, 3 dias de fornalha acesa vazios»); cada impedimento, cada parte de quem quer mais, a sorte do dia tirada do acaso do mundo, a entrada fora do livro, a nota do bairro, a leitura — todas acusadas (o item 9). |
| L-910 | bug (pequeno, consertado; achado pela `termas-grandes` F2 com a vontade ligada) | **O dia dos banhos que acaba no meio deixava a caminho quem já tinha saído para lá.** O `close` do dia dos banhos só encerrava a ida de quem estava lá dentro (no livro do dia); quem estava a caminho ficava com a ida até o passo seguinte, andando para um prédio fechado — ou para uma obra, quando a cidade amplia os banhos no meio do dia. Antes quase ninguém estava a caminho; com a vontade há quase sempre alguém, e a `termas-grandes` F2 lia «o dia acabou, 1 ainda lá dentro». Correção: o `close` encerra também a ida de quem está a caminho daquele dia (`act-servicos.js`), como o espetáculo faz com o seu público (L-595). Prova: `termas-grandes` F2 volta a passar; `freguesia` e5 («o dia fechado e o prédio derrubado; na hora 0 ainda com a ida»). Sabotagem s20 (sem o laço): e5 falha. |
| D-200 | decisão (F: `act-servicos.js`, `villagers.js`) | **A vontade do banho.** *Quem:* todo adulto de uma cidade com banhos, uma parte dos dias (`Te.wish`): 0,30 — 0,50 num povo da terma (o romano, o grego, o clássico: o hábito) —, mais 0,25 no ofício sujo (mineiro, ferreiro, oleiro, construtor, estivador, lenhador), mais 0,15 na casa de nobre ou de mercador, mais 0,15 para o cansado (a energia abaixo de 50); o doente que está de pé, todo dia (o banho quente tira uma parte da doença: é o efeito que o banho já tinha — nenhuma mecânica nova; o de cama com febre fica na cama). *Menos:* quem mora longe (a casa a mais de 10 casas dos banhos: a vontade cai com a distância, até um quarto dela a 40 casas) e **a água fria: a metade** (sem fogo na fornalha o banho vale menos — cura e descansa menos —, e a vontade cai com ele). *Quando:* nas horas dos banhos (0,25 a 0,70), cada um a partir da sua hora (pelo `G.hash` da pessoa, a mesma todo dia: o velho, o nobre e o doente da manhã — 0,27 a 0,43 —; quem trabalha, do começo da tarde — 0,38 a 0,46: o banho é o fim de um dia de trabalho mais curto), e só com tempo de andar até lá (1,5 s por casa), despir-se e ter meio banho antes de fechar; quem está longe sai antes da sua hora. *Quanto:* se hoje é dia de banho é a sorte do dia de cada um (`Te.lot`: o `G.hash` da pessoa e do dia, abaixo da vontade) — **nenhum sorteio do acaso do mundo, nenhum campo novo na pessoa** —, e um banho por dia (`v.bathDay`, que o banho já escrevia; vale também para o passeio: `Te.visit`). *O que impede:* a casa sem moeda para a entrada, os banhos cheios (quem está a caminho conta: `Te.room`), mais de 30 casas a andar, a fome (acima de 55), o cansaço de cama (abaixo de 25), uma carga nas mãos ou a perna de uma operação (D-094), os pequenos para cuidar, a fornalha por alimentar (D-204), uma tarefa em curso que pese tanto quanto o banho (0,4: o banho nunca corta um trabalho; começa quando a tarefa acaba); **nunca o corpo do deus**. A vontade vale 0,75 (o trabalho de um dia vale 0,55), 0,90 a do doente. **As crianças não vão** pela vontade (o `decide` é dos de 16 anos ou mais; ir com o pai ou a mãe fica aberto). |
| D-201 | decisão (F: `act-lazer.js`, `villagers.js`) | **A vontade de ler.** *Quem:* num povo com a escrita, o curioso (0,40 dos dias), a gente das letras — o sacerdote, o escriba — (0,30), a casa de nobre ou de mercador (0,25); somam; **quem não é nenhum deles não lê** (na metrópole, 9 a 38 pessoas por cidade). Menos quem mora longe (como nos banhos). *Quando:* nas horas da biblioteca (0,28 a 0,72), cada um a partir da sua hora na manhã dela (0,29 a 0,36), com tempo de andar e ler um rolo inteiro antes de fechar. *Quanto:* a sorte do dia de cada um (`Bi.lot`, sem acaso do mundo), um rolo por dia (`v.readDay`; vale para o passeio: `Bi.visit`). *O que impede:* as mesas cheias (quem vem a caminho conta), a distância, a fome, a carga, os pequenos, a fornalha por alimentar, uma tarefa de peso; nunca o corpo do deus. A leitura que passa do que a biblioteca conta no dia (8; 16 na grande) não soma à pesquisa — quem lê, lê para si. |
| D-202 | decisão (F; a chave já era do líder, D-153) | **A entrada nos banhos conta como «noite» na vida do bairro** — a chave que o `payEntry` já usava («A noite pegou: taverna, banho e espetáculo cheios»); não inventei chave. Com banhistas de verdade a conta pesa: o bairro dos banhos de Mênfis passa a ter 1,2 a 1,6 de «noite» por célula e o de Tebas 1,0 a 1,6 (o perfil «boêmio» liga a 0,3, depois de quatro dias seguidos): **os banhos sozinhos fazem um bairro «boêmio»**. Se o dono quiser o banho à parte da taverna e do teatro (um perfil «de banhos», ou só não contar o banho de dia como noite), é uma chave nova (`banho`) no `G.Urban.KEYS` e um perfil no `U.TAGS` do `urban.js` — fica proposto, não feito. A leitura já tinha a sua chave («saber», o perfil «letrado»), contada onde a leitura se fecha. |
| D-203 | decisão (F: `Te.urge`, `Bi.urge`) | **Quem entrou fica para o banho; quem sentou fica para o rolo.** A caminho, a ida vale 1 (o molde do teatro: o trabalho, a conversa e a volta para casa não a tiram; a fome e o sono, sim). Lá dentro — a entrada paga — vale 1,5: nenhuma outra vontade do dia tira alguém dos cabides ou da água (o teatro de um curioso vale até 1,05, um namoro até 1,28: na metrópole uma banhista saiu da água para o espetáculo com meio banho por tomar e a entrada paga, e outra para namorar); só quem está morrendo de fome sai, e o que o mundo impõe (o fogo, o pânico, a festa da cidade, um chamado de peso). O mesmo à mesa da biblioteca. |
| D-204 | decisão (F, a pedido do líder no T-810: `Te.onDuty`) | **O foguista não larga a fornalha por uma vontade.** Medido com a vontade ligada: os foguistas de Roma e de Mênfis saíam para se banhar pela própria vontade no meio do dia — banhos com freguesia e a fornalha sozinha. Agora, com o dia dos banhos dele aberto e o fogo sem dar até a hora de fechar (`G.Termas.onDuty(v)`: o calor da fornalha menor que os segundos que faltam), o foguista não vai ao banho, nem à biblioteca, nem ao teatro, nem à taverna (as quatro vontades perguntam: `Te.urge`, `Bi.urge`, `Tt.urge` e a linha da taverna no `decide`); com o fogo alimentado até fechar (duas achas dão o dia), é livre como qualquer um. **Não mexi** nas outras duas causas do T-810 — a água da casa dele (a tarefa «water», da mesma prioridade, que chega antes) e a fome dele: são a ordem das tarefas do foguista, não das vontades, e o líder as tratou na prova; ficam abertas (T-918). |
| T-910 | limite de teste (dito para as provas novas) | **O dia do mundo não tem um número fixo de segundos vividos.** `S.time` anda a 35 % do passo enquanto uma cena se demora (`G.Scene.lingers`, `main.js`): o primeiro dia da metrópole pronta dura 306 s de passo, não 200. Uma prova que vive «`G.DAY_LEN` segundos por dia» corta o último dia pela metade — a `freguesia` b1 leu assim «a fornalha acesa e 0 banhos» no quarto dia. Toda a `freguesia.js` acaba cada caso pelo dia e pela hora do mundo; a conta de segundos é só uma guarda. |
| T-911 | limite de teste (consertado na prova) | **O `termas-mao` «fecha-na-hora» mandava os mesmos três aos banhos pela segunda vez no dia**, para tê-los lá dentro na hora de fechar. Com um banho por dia também pelo passeio (D-200) a porta os recusa («0 lá dentro antes de fechar»). A mão da prova apaga o banho de hoje dos três antes de mandá-los de novo: o caso é o fechar. 31 de 31. |
| T-912 | limite de teste (dito) | **A metrópole pronta entra em guerra no segundo ou no terceiro dia vivido**, por uma história que um fio muda (com a regra do tempo a 1,3 s por casa a guerra chegava no dia 60; a 1,5, no 59): as quatro cidades com banhos ficam em armas (combate, fuga, esconderijo: 15 % ou mais dos adultos) e quase ninguém se banha. Os dias vividos da `freguesia` b e o salto da i são **na paz do deus** — o poder do jogo, `G.Politics.divinePeace`, mantido pela prova (`PAZ=0` deixa o mundo correr; no dia do poder a cidade festeja e os banhos têm 1 banhista) —, e a guerra é o caso e3. As medidas «de antes» e «de depois» de cinco dias (item 7) são sem a paz: nelas os dias 60 a 62 são de guerra. |
| T-913 | limite de teste (consertado na prova) | **O `termas` e1 (um dia de verdade nos banhos) escolhe o Temazcal de Tenochtitlan, que tem um lugar só na água**, e conta com que só os seis banhistas dele venham. Com a vontade, uma moradora chegou antes dos seis e tomou o lugar; os seis bateram na porta cheia («1 entrada, 0 banhos, o banho de Izel: —»; na base o caso passa: «2 entradas, 1 banho quente»). A mão da prova encerra as idas de quem não é do caso e dá-lhes o banho de hoje, para que mais ninguém venha enquanto o caso dura; os banhos com quem vem por vontade sua são a `freguesia.js`. *(As três linhas ficam logo antes e depois do `bathers(b, 6, 2.9)` do e1 — o líder mexeu no `ready(b)` do mesmo arquivo, T-810.)* |
| T-914 | limite de teste (aberto, não é deste ramo) | **O Temazcal tem um lugar só na água** (a planta do banho asteca: um só ponto de «banhar» alcançado): Tenochtitlan, com 79 a 138 pessoas, tem 1 banho por dia, 2 no máximo — o lugar ocupado, a vontade dos outros é zero (os banhos cheios). Os outros banhos pequenos: Roma 8 lugares, Mênfis e Tebas (o lago sagrado) 35. É da planta do tipo, não da freguesia. |
| T-915 | limite de teste (aberto, da cidade) | **A terma longe do meio da cidade tem menos gente.** O lote de 7 casas que a mão do deus acha junto de Argos fica a 18 casas do meio; a cidade, pela porta dela, fundou as termas a 34 (T-821). Um dia tem 200 s e uma casa leva 0,8 a 1,5 s a andar: de 30 casas para cima ninguém vai (o alcance, como o da taverna), e quem está a 20 perde a tarde. Medido na `freguesia` c, com 260 pessoas em volta do meio e os três tamanhos no mesmo lote a 18 casas: as grandes termas (120 lugares) têm 20 a 23 banhos no dia e até 18 a 22 na água de uma vez; as termas (24 lugares), 17 a 18 e 16; os banhos (8 lugares), 8 e 8 — enchem mais que os pequenos, e continuam longe de cheias: 120 lugares pedem uma cidade em que uns 100 queiram banho no mesmo dia. |
| T-916 | limite de teste (aberto, medido) | **Metade de quem tem o dia do banho perde a hora.** A vontade só começa quando a tarefa em curso acaba (o banho nunca corta um trabalho), e a janela de cada um é curta (da sua hora até não dar mais tempo: 12 a 25 s): o pescador no barco, o lavrador no meio da colheita, o soldado de guarda não acham o momento, e ao meio-dia muitos estão com fome. Medido na metrópole (um dia, 173 adultos): 70 passaram todas as portas, 24 foram; por pessoa e por dia de paz, 15 % de quem mora a até 17 casas e 8 % de quem mora mais longe; o ofício sujo 17 %, os outros 10 %. A parte dos dias de cada um (`Te.wish`) é o dobro disso. Subir a parte dos dias enche mais os banhos e tira mais braços do trabalho (cada banho custa a quem trabalha uns 30 % do dia: o caminho, os cabides, a água). |
| T-917 | limite de teste (aberto, medido — ver o item 7) | **A produção, medida, não mostra queda fora do ruído das histórias.** Nos mundos do zero de 30 anos (as sementes 41 e 7) nenhuma cidade ergue banhos nem biblioteca, e o mundo sai igual, número por número, com e sem a mudança — a vontade não toca um mundo sem o prédio. Nos mundos prontos, dez anos no salto: na metrópole a comida produzida cai 11 % e a madeira 7 % com 11 % mais gente viva no fim; na mega a comida sobe 4 %, a madeira 9 % e a pedra 23 %; as mortes de fome, 8 contra 4 numa e 1 contra 7 na outra. As duas rodadas de cada mundo vivem guerras diferentes (256 mortes contra 209; 150 contra 133): o sinal de um mundo é o contrário do outro. **Na paz do deus** (sem a guerra a afogar a conta; três histórias de cada lado, dez anos da metrópole): a comida produzida cai 3,7 % em média (as três de depois abaixo das três de antes) e a gente 2,6 %, a madeira e a pedra não caem, e **não há morte de fome em nenhuma das seis**. É o preço medido da pausa: cada banho custa a quem trabalha uns 30 % do dia, e uns 10 % dos adultos de uma cidade com banhos vão por dia — uns 3 % dos braços dessas cidades. Se o dono achar caro, a alavanca é uma só: a parte dos dias (`Te.BASE` 0,30 e `Te.HABIT` 0,50); pela metade, metade do preço e metade dos banhistas. |
| T-920 | limite de teste (aberto, achado nas medidas; não é da freguesia) | **Numa das três histórias de dez anos de paz do ramo, o verificador acaba com «S2 degraus: #20136 espera duas casas encomendadas (house#31228 e house#32409)»** — a casa rica da família (D-177: uma encomenda por dono). Não aparece nas três histórias da base nem nas outras duas do ramo, nem em nenhuma prova. O código da freguesia não toca em casas nem em encomendas; a história é outra (os dias de cada um mudaram), e o defeito parece ser um caso raro da casa rica que esta história achou. Como reproduzir, de dentro de `qa/`: `PAZ=1 SHIFT=1 node <scratchpad>/ag/F/producao.js metropole 10` (o salto de dez anos com a paz do deus mantida e um sorteio do acaso do mundo antes do primeiro passo), 2 min 30 s; o verificador no fim. Fica para quem cuida da casa rica (M). |
| T-919 | limite de teste (aberto, de antes) | **O passeio não tem a regra do tempo.** Quem vai aos banhos pela vontade só sai com tempo para meio banho antes de fechar; quem vai pelo passeio de quem está sem trabalho (`G.City.leisureTask` → `Te.visit`, a porta de antes) sai a qualquer hora: nos quatro dias vividos, 1 das 81 entradas pagou às 0,63 e o fechar a tirou da água sem banho — era do passeio. Pôr a regra do tempo no `Te.visit` vale para as duas portas, mas muda a porta que as provas de antes usam para mandar banhistas pela mão; não mexi. |
| T-918 | limite de teste (aberto, do recado do líder no T-810) | **A fornalha ainda pode ficar fria pela água da casa e pela fome do foguista.** As vontades já não o tiram do posto (D-204); a tarefa «water» da casa dele (prioridade 1,05, a mesma da fornalha, e que chega antes de manhã) e a refeição dele (1,2) continuam a vir antes do fogo. Nos quatro dias vividos desta árvore (sem as plantas novas das casas do G) a fornalha acendeu em 11 de 16 dias de banhos: Mênfis e Tebas nos quatro, Roma em dois, Tenochtitlan em um (o Temazcal abre o mundo sem foguista; Roma tem 13 de lenha no armazém e o armazém guarda 10 para as obras). Um conserto do lado do foguista seria o dia dos banhos chamar o seu foguista na abertura, como o espetáculo chama os atores (`callActors`), acima da água da casa — não feito: mexe na ordem das tarefas da casa, que o G acabou de mudar. |

## 2. Linhas do README das provas

| `freguesia.js` | `[ONLY=a,b1,c,…] [DIAS=3] [ANOS=4] [PAZ=0] node freguesia.js [metropole\|mega]` (≈ 9 min inteira; a parte `a` em 8 s) | A freguesia dos banhos e da biblioteca (L-717, D-200 a D-204), em Node. **a** a regra, sem viver: o que impede o banho (21 impedimentos, cada um zera a vontade; quem entrou fica; o foguista no posto, também para o teatro), quem quer mais, a sorte do dia (espalhada por igual, sem acaso do mundo, a mesma dentro e fora do passo), a biblioteca. **b** três dias vividos no mundo pronto, na paz do deus, sem a mão da prova em ninguém: os banhos por dia e por cidade, ninguém duas vezes no dia, a entrada pelo livro-razão, ninguém chamado dormindo, com carga ou sendo o corpo, ninguém tirado da água por outra vontade, o foguista no posto, quem mora longe vai menos, as leituras por dia, a vida do bairro, o verificador. **i** a mesma causa no salto (quatro anos). **c** os banhos, as termas e as grandes termas no mesmo lote de uma cidade de um povo da terma com 260 pessoas (trazidas pela mão da prova, T-820): as maiores enchem mais. **d** a grande biblioteca com leitores. **e** um save no meio de um banho e de uma leitura carregado duas vezes; quem morre a caminho e na água; a cidade em guerra; o povo sem moeda; o deus fecha o dia e derruba os banhos. **h** o verificador pega a mentira. |
| `freguesia-inv.js` | (carregado pela prova: `M.load({ qa: true, extra: ['qa/freguesia-inv.js'] })`; o líder o junta) | As regras do verificador (sistema `freguesia`): ninguém cativo ou preso com a ida aos banhos ou à biblioteca (S2); ninguém lê num povo sem a escrita, a idade de cada porta (S2); um banho e um rolo por dia (S3); ninguém a caminho com uma carga ou dormindo (S3). |

E na linha do `termas-mao.js` e do `termas.js`: nada muda no que provam (T-911, T-913).

## 3. Entradas do `regress.sh`

Na fase «fundacao», junto das provas dos ofícios e serviços (onde estão `termas-mao`, `termas`, `lazer`):

    F freguesia freguesia.js;

Linhas novas que a linha de base vai ganhar (todas PASSOU): `freguesia a1` a `a4`, `freguesia a o verificador…`, `b1` a `b8`, `i`, `d`, `e1`, `e2`, `c`, `e3`, `e4`, `e5`, `h`, `freguesia erros`.

## 4. Regras do `guard.js` (propostas)

- **Regra 69 — a vontade não sorteia.** No `js/act-servicos.js`, da linha `// ---… the wish for a bath (D-200)` até a `Te.go = function`, e no `js/act-lazer.js`, da linha `// ---- the wish to read (D-201)` até a `Bi.go = function`, nenhuma chamada ao acaso do mundo nem ao do que só se vê: `/\bG\.(R|rr|ri|pick|chance|shuffle|VR|vrr|vri|vpick|vchance|vshuffle)\(/`. A sorte do dia de cada um é o `G.hash` da pessoa e do dia (a `freguesia` a3 prova; as sabotagens s8 e l8 a acusam).
- **Regra 70 — o dia do banho e da leitura é de quem os dá, e ninguém manda gente a um serviço.** `\.bathDay\s*=[^=]` só no `js/act-servicos.js` e `\.readDay\s*=[^=]` só no `js/act-lazer.js` (fora o `js/save.js`); `G\.Termas\.go\(` e `G\.Biblioteca\.go\(` só no `js/villagers.js` (o `start`): quem vai aos banhos e à biblioteca vai pela escolha do dia de cada um, ou pelo passeio (`visit`) — nenhum módulo enche um serviço por fora.

## 5. Frases para o `CLAUDE.md`

Em «Os ofícios e os serviços», no fim:

> **A freguesia é uma vontade de cada um** (D-200 a D-204): quem vai aos banhos e à biblioteca vai pela sua escolha do dia (`decide`: `'banho'`, `'ler'` — `G.Termas.urge` / `go`, `G.Biblioteca.urge` / `go`), com causa: quem (`wish`), quando (`hourOf`, com tempo antes de fechar), quanto (a sorte do dia de cada um, `lot` — o `G.hash` da pessoa e do dia, nunca o acaso do mundo — e uma vez por dia: `v.bathDay`, `v.readDay`), o que impede (a moeda, a casa cheia — quem vem a caminho conta —, a distância, a fome, as mãos ocupadas; nunca o corpo do deus). Quem entrou fica para o banho (`Te.IN`); o foguista com a fornalha por alimentar não sai para o lazer (`G.Termas.onDuty`). Serviço novo com freguês segue o molde — ninguém manda gente a um serviço para enchê-lo —, e a prova vive os seus dias na paz do deus (a metrópole pronta entra em guerra no segundo dia) e acaba cada caso pelo dia e pela hora do mundo, não por uma conta de segundos (T-910). `qa/freguesia.js` prova.

No protocolo, item 3, na linha das termas: «…e, pelo lado de quem se banha e de quem lê (`act-servicos.js`, a biblioteca do `act-lazer.js`, as vontades do `decide`), `node qa/freguesia.js` (a parte `a` em 8 s: `ONLY=a`)».

## 6. O que ficou aberto

- **A praça e o mercado ao fim da tarde (o item 4 da tarefa): não feito.** O que medi (item 7): passa muita gente a 6 casas do meio da praça o dia todo (quem ouve: 6 a 25), mas parada na praça (a 3,5 casas, sem andar) há 0 a 7 pessoas ao fim da tarde — em Mênfis (112 pessoas, sete bairros), 0,2; no mercado, 0 a 1,2. O que o D-157 já deu: quem mora longe da fogueira descansa à porta de casa, quem mora perto, na fogueira; a taverna das suas ruas. O que falta é uma escolha do fim da tarde que leve à praça: o «descansar» quase nunca ganha de «ir para casa» (0,3 contra 0,55 a 0,95), então trocar só o lugar do descanso não põe gente na praça. O desenho pensado: uma escolha `'praca'` no `decide` (`G.Praca.urge` / `go` no `act-lazer.js`, a tarefa `'citylife'` que já existe) para quem mora perto de uma praça ou de um mercado (a praça das suas ruas, como a taverna), mais o sociável e o velho, e mais onde já há gente. **Por que não entrou:** é uma escolha nova no fim da tarde de toda cidade com praça (18 pessoas ou mais), que disputa com a casa, a taverna e o teatro — muda a plateia do teatro e a freguesia da taverna que outras provas contam (`lazer`, `taverna`, `lar`), e não cabia provada (com as vizinhas e a medida de antes e depois) no que restava desta rodada.
- **A fornalha fria pela água da casa e pela fome do foguista** (T-918).
- **As crianças** não vão aos banhos nem à biblioteca pela vontade.
- **A chave «noite» para os banhos** (D-202): proposta de uma chave própria, não feita.
- **O Temazcal de um lugar** (T-914) e **a terma longe** (T-915): da planta e do planejador.
- **Metade perde a hora** (T-916): a decidir pelo dono se os banhos devem encher mais à custa do trabalho.

## 7. As medidas

### Antes (a base `b2b61f0`, cinco dias vividos, ninguém mandado) — `scratchpad/ag/F/antes/`

**Metrópole** (do dia 58 ao 63; os dias 60 a 62 são de guerra): 0 banhos em 20 dias-de-banhos (Tenochtitlan, Roma, Mênfis, Tebas), 23 de lenha queimada (0,6 a 2,0 por dia e por prédio); 1 banho pedido em cinco dias (74 passeios pedidos). Bibliotecas (Argos, Tenochtitlan, Tebas): 0 leituras.
**Mega** (do dia 50 ao 55): 7 banhos em 14 dias-de-banhos (Mênfis 5, Hedeby 1, Kaupang 1), 20 de lenha (1,0 a 2,0 por dia e por prédio); 24 banhos pedidos pelo passeio, 11 aceitos. Bibliotecas: 1 leitura em cinco dias (Kaupang).
**A praça e o mercado** (a média de pessoas a 6 casas do meio / paradas a 3,5 casas, a soma dos da cidade), às 0,60, 0,65 e 0,70 do dia — metrópole: Argos praça 10,4 (3,2) · 11,3 (6,6) · 2,7 (0,2); Mênfis praça 9,5 (0,2) · 6,7 (0,2) · 3,2 (0,2), mercado 10,6 (1,2) · 8,8 (0,5) · 4,7 (0,4); Roma praça 6,8 (0,7) · 5,7 (0,6) · 3,3 (0,3); Tenochtitlan praça 15,6 (0,8) · 11,8 (0,6) · 7,2 (0,8); Tebas praça 18,0 (2,3) · 15,4 (2,1) · 5,8 (0,8). A tabela inteira, hora a hora: `antes/mede-metropole.txt`, `antes/mede-mega.txt`.
**Dez anos da metrópole no salto**: 704 → 619 pessoas; comida produzida 13 348, madeira 2 361, pedra 1 333; mortes: fome 4, doença 5, velhice 18, todas 256 (a guerra); banhos: 34 dias abertos, 3 banhos, 53 de lenha; 0 leituras.

### Depois (o ramo) — `scratchpad/ag/F/depois/`, `scratchpad/ag/F/final/`

**Metrópole, quatro dias vividos na paz do deus** (`freguesia` b, o código final): Mênfis (127 pessoas, 35 lugares) 1, 14, 9, 17 banhos por dia, até 16 na água de uma vez · Tebas (62, 35 lugares) 1, 9, 11, 12, até 10 · Roma (38, 8 lugares) 0, 2, 1, 2 · Tenochtitlan (139, 1 lugar) 1, 0, 1, 0 (o primeiro dia é o do poder do deus: a cidade festeja a paz). 81 banhos de 57 pessoas, ninguém duas vezes; lenha 2,0 e 2,5 por dia em Mênfis e Tebas, 0,5 em Roma e Tenochtitlan (antes: 0,6 a 2,0). Leituras por dia: Argos 1, 3, 4, 2 · Tenochtitlan 1, 4 · Tebas 0, 0, 1, 2 (até 4 à mesa).
**Sem a paz** (quatro dias, o mundo como vem; a guerra no dia 60; antes dos últimos acertos): Mênfis 13, 12, 1, 7 · Tebas 6, 10, 3, 6 · Roma 1, 2, 0, 3 · Tenochtitlan 1, 1, 0, 1.
**Por pessoa e por dia** (695 pessoas-dia de paz): quem mora a até 17 casas dos banhos 15 %, mais longe 8 %; o ofício sujo 17 %, os outros sãos 10 %; num povo da terma (só Roma tem banhos, com a fornalha fria em dois dos quatro dias) 6 %, nos outros 12 %.
**No salto** (`freguesia` i, quatro anos na paz): 71 banhos em 16 dias de banhos — Mênfis 10, 7, 10, 11 · Tebas 5, 5, 9, 3 · Roma 2, 3, 1, 2 · Tenochtitlan 1, 1, 1, 0; 20 leituras.
**Dez anos da metrópole no salto** (com a guerra; uma rodada, antes do último acerto): 704 → 635 pessoas; comida 12 454 (−7 %), madeira 2 662 (+13 %), pedra 1 898 (+42 %); mortes: fome 8, doença 2, velhice 15, todas 226; banhos: 43 dias abertos, 93 banhos, 40 de lenha; 23 leituras. *(Uma rodada só de cada lado, e a guerra corre diferente nas duas: as diferenças de madeira e de pedra mostram o tamanho do ruído.)*
**Cinco dias vividos, o mundo como vem** (as mesmas contas do «antes», `depois/mede-metropole.txt`, `depois/mede-mega.txt`):
- **Metrópole** (do dia 58 ao 63): **85 banhos em 20 dias-de-banhos** (antes: 0) — Mênfis 9, 6, 3, 12, 7 (7,4 por dia; até 11 na água de uma vez) · Tebas 8, 8, 8, 9, 5 (7,6 por dia; até 9) · Roma 3, 0, 1, 2, 0 · Tenochtitlan 1, 1, 0, 1, 1; a lenha: 25 (antes: 23) — 1,6 e 2,2 por dia em Mênfis e Tebas, 0,4 e 0,8 em Roma e Tenochtitlan. Leituras: Argos 4, —, 1, 1, 3 · Tenochtitlan 2, —, —, 3, — · Tebas 2, 0, 2, —, 2 (antes: 0).
- **Mega** (do dia 50 ao 55): **60 banhos em 12 dias-de-banhos** (antes: 7 em 14) — Mênfis (139 pessoas) 13, 24, 18, 0, 0 (até 17 na água de uma vez; nos dois últimos dias os banhos abrem sem lenha e sem ninguém) · Hedeby 1, 1, 1, 0, 0 (a água fria) · Kaupang 2, 0; a lenha: 12 (antes: 20). Leituras: Mênfis 6, 4, 4, 2 (até 4 à mesa) · Kaupang 3, 4, 3, 1 · Hedeby 1 (antes: 1 leitura em cinco dias).
- **A praça e o mercado** não mudaram (não mexi neles): parados na praça ao fim da tarde (0,60 a 0,70), Argos 0,6 a 2,1 · Mênfis (duas praças) 0,8 a 1,3 · Roma 0,2 a 1,4 · Tenochtitlan 0,7 a 1,9 · Tebas 1,1 a 2,6.
**Os mundos do zero** (as sementes 41 e 7, continente de 128, quatro povos, 30 anos no salto — `M.novo` e o salto do jogo): **o mesmo mundo, número por número, antes e depois** — semente 41: 123 pessoas, comida 6 151, madeira 2 345, pedra 1 308, 2 mortes de fome; semente 7: 149 pessoas, comida 7 610, madeira 2 862, pedra 668, 2 mortes de fome. Em 30 anos nenhuma cidade desses mundos passa de 43 pessoas nem ergue banhos ou biblioteca, e sem o prédio a vontade não muda nada nem tira do acaso do mundo. A medida que vale é a dos mundos prontos:
**Dez anos no salto, o mundo como vem** (a guerra corre diferente em cada rodada; uma rodada de cada lado):

| | gente | comida | madeira | pedra | mortes de fome | de doença | todas | dias de banhos | banhos | lenha dos banhos | leituras |
|---|---|---|---|---|---|---|---|---|---|---|---|
| metrópole, antes | 704 → 619 | 13 348 | 2 361 | 1 333 | 4 | 5 | 256 | 34 | 3 | 53 | 0 |
| metrópole, depois | 704 → 689 | 11 942 | 2 203 | 1 355 | 8 | 0 | 209 | 35 | 134 | 45 | 27 |
| mega, antes | 446 → 433 | 8 029 | 2 513 | 1 132 | 7 | 2 | 150 | 31 | 5 | 31 | 0 |
| mega, depois | 446 → 458 | 8 359 | 2 747 | 1 388 | 1 | 0 | 133 | 31 | 73 | 24 | 44 |

**A lenha:** os banhos queimam o mesmo ou menos (1,3 por dia de banhos na metrópole, antes 1,6; 0,8 na mega, antes 1,0) — antes para ninguém, agora para 2 a 4 banhistas por dia e por prédio no salto.
**Dez anos da metrópole no salto, na paz do deus** (o poder do jogo mantido; três histórias de cada lado — a mesma metrópole com 0, 1 e 2 sorteios do acaso do mundo antes do primeiro passo; `antes/paz-metropole-*.txt`, `depois/paz-metropole-*.txt`):

| | gente no fim | comida | madeira | pedra | mortes de fome | todas as mortes | dias de banhos | banhos | lenha dos banhos | leituras |
|---|---|---|---|---|---|---|---|---|---|---|
| antes, três histórias | 968, 975, 978 | 16 086, 15 449, 15 453 | 5 331, 5 391, 5 361 | 2 340, 2 379, 2 293 | 0, 0, 0 | 26, 27, 25 | 44, 43, 46 | 19, 12, 11 | 77, 80, 78 | 1, 1, 0 |
| depois, três histórias | 923, 952, 970 | 15 417, 14 970, 14 859 | 5 389, 5 526, 5 726 | 2 553, 2 232, 2 340 | 0, 0, 0 | 61, 31, 30 | 50, 46, 50 | 207, 236, 217 | 87, 78, 85 | 62, 62, 80 |
| a média: antes → depois | 974 → 948 (−2,6 %) | 15 663 → 15 082 (**−3,7 %**) | 5 361 → 5 547 (+3,5 %) | 2 337 → 2 375 (+1,6 %) | 0 → 0 | 26 → 41 | 44 → 49 | 14 → 220 | 78 → 83 | 0,7 → 68 |

Sem a guerra a conta aparece: **a comida produzida cai uns 4 % e a gente uns 3 % em dez anos, sem nenhuma morte de fome** — as três histórias de depois ficam abaixo das três de antes na comida (14 859 a 15 417 contra 15 449 a 16 086). A madeira e a pedra não caem. A lenha dos banhos é a mesma (1,7 por dia de banhos nos dois lados): antes para 0,3 banhistas por dia e por prédio, agora para 4,5. (As 61 mortes de uma das histórias de depois não são de fome, de doença nem de velhice — 23 destas —; não fui atrás.)

## 8. O que rodei, e o que deu

| Prova | No ramo | Na base (`b2b61f0`) |
|---|---|---|
| `node qa/guard.js` | PASSOU (156 arquivos) | — |
| `node qa/soak.js 103 continente 128 4 normal 5 1 1` (navegador; antes de cada commit) | 5 anos, nenhuma violação, erros: nenhum | — |
| `node qa/freguesia.js` (8 min 36 s) | 23 passam, 0 falham | — |
| `node qa/termas.js` | 6 passam, 0 falham (com o T-913; antes dele, 5 e 1 — a e1) | 6 passam, 0 falham |
| `node qa/termas-mao.js` | 31 passam, 0 falham (com o T-911) | — |
| `node qa/termas-grandes.js A,B,C,D` | 23 passam, 0 falham | — |
| `node qa/termas-grandes.js` (4 min) | 33 passam, 0 falham (com o L-910; antes dele, 32 e 1 — a F2) | a F2 passa |
| `node qa/lazer.js` (duas rodadas, a última com o código final) | 15 passam, 0 falham | — |
| `node qa/lazer-mao.js` | 27 passam, 0 falham | — |
| `node qa/saber.js` | 40 passam, 0 falham | — |
| `node qa/tempo-livre.js` | 6 passam, 0 falham | — |
| `node qa/atividades.js` | 14 passam, 0 falham | — |
| `node qa/taverna.js` (a linha da taverna no `decide` ganhou o foguista no posto) | 10 passam, 0 falham | — |
| `node qa/invariancia.js` — a parte do `invariancia.sh` que cobre o que mexi: os testes A, B, C, E e F do adendo (a loja no salto e no passo, a descarga por passo, salto, corpo e save, as pessoas depois de dois dias longe, o livro-razão sem nada duas vezes, com e sem quadros) | 6 passam, 0 falham | — |
| `node qa/det3.js 77 arquipelago 96 3 2` (navegador) | PASSOU (o mesmo mundo com e sem quadros; o save carregado duas vezes: igual) | — |
| `node qa/matriz-predios.js` | PASSOU (12 categorias, 56 tipos, 4 folhas) | — |
| `node qa/lar.js` (duas rodadas no ramo, iguais) | 23 passam, **3 falham** (l15, l16, l16b) | 22 passam, **4 falham** (l14, l15, l16, l16b) |

**Não rodei:** `qa/regress.sh`, `qa/prontos.js` e a prova de desempenho (proibidos nesta rodada); o resto do `invariancia.sh` (o D dos interiores — `interiores.js`, `casca.js` — e a parte e16 do encarna: não mexi em planta nem no 3D); `qa/oldsave.js` (nenhum campo novo na pessoa nem no save); `qa/som.js`, `qa/sabe.js`, `qa/roupa.js`, `qa/atmosfera.js`, as provas visuais (nenhum gesto, ato, tela, roupa ou desenho novo).

A `lar`: as três que falham no ramo falham na base (a l16 e a l16b são o T-688; a l15 — «o bebê foi para Arne, fora da casa» — falha igual na base); a l14 falha na base e passa no ramo (a história do mundo é outra).

## 9. As sabotagens (cada uma numa cópia nova do jogo; `scratchpad/ag/F/sab-F.py`, os resultados em `scratchpad/ag/F/sab/`)

**36 de 36 acusadas**, com o código final (`depois/fila-3.txt`; a primeira rodada, antes dos últimos acertos, tinha acusado as 30 de então).

| Sabotagem | O caso que a acusa |
|---|---|
| s1 a escolha de cada um sem o banho (o mundo de antes, L-717) | b1: «1 banho ao todo em 8 dias de banhos; 3 dias de fornalha acesa vazios» |
| s2 dois banhos por dia (nem a vontade nem o passeio perguntam) | a1: «já se banhou hoje 0,75; pelo passeio 1» |
| s3 a vontade não pergunta pelas mãos | a1: «uma carga nas mãos» |
| s4 o corpo do deus mandado como qualquer um | a1: «o corpo do deus» |
| s5 quem mora longe quer tanto quanto quem mora perto | a2 |
| s6 o doente e o ofício sujo como os outros | a2 |
| s7 a vontade não pergunta pela moeda | a1: «a casa sem moeda» |
| s8 a sorte do dia tirada do acaso do mundo (`G.R`) | a1 e a3: «a mesma pedida duas vezes: NÃO; o acaso do mundo ANDOU» |
| s9 quem está a caminho não conta | a1 («o último lugar é de quem já vem») e c («10 bateram na porta cheia» nos banhos de 8 lugares) |
| s10 o faminto vai aos banhos | a1: «com fome» |
| s11 sem a regra do tempo | a1: «sem tempo antes de fechar» |
| s12 sem a hora de cada um | a1: «antes da sua hora» |
| s13 a vontade vale menos que o trabalho (0,5) | a1: «a vontade 0,5» |
| s14 a caminho, a vontade não se mantém | a1: «já a caminho» |
| s15 uma tarefa de peso em curso não zera a vontade | a1 |
| s16 a entrada fora do livro-razão | b3: «1 entrada, 0 linhas, o livro 0, o caixa 0,1» |
| s17 a entrada não conta na vida do bairro | b7: «0 notas para 18 entradas» |
| s18 a água fria querida como a quente | a2 |
| s19 o povo da terma sem o hábito | a2 |
| l1 a escolha de cada um sem a leitura | b6: «0 idas pela vontade, 0 leituras» |
| l2 todos leem | a4 |
| l3 o povo sem a escrita lê | a4 |
| l4 dois rolos por dia | a4 |
| l5 o corpo do deus mandado ler | a4 |
| l6 as mesas cheias não impedem | a4 |
| l7 sem a regra do tempo do rolo | a4 |
| l8 a sorte da leitura tirada do acaso do mundo | a3 e a4 |
| h1 o verificador cego ao cativo e à carga a caminho | h |
| h2 o verificador cego a dois banhos e dois rolos | h |
| h3 o verificador cego à leitura sem a escrita | h |
| s20 o dia fechado deixa a ida de quem está a caminho (L-910) | e5: «na hora 2 ainda com a ida» |
| s21 o foguista larga a fornalha pelo banho | a1: «o foguista com a fornalha por alimentar 0,75» |
| s22 lá dentro a ida vale o que vale a caminho (D-203) | a1: «já lá dentro 1» |
| s23 o foguista vai ao teatro e à taverna (D-204) | b4, nos dias vividos: «Messalina #17275 ao teatro no dia 59 às 0,57» — a foguista de Roma, com a fornalha por alimentar |
| l9 o foguista larga a fornalha pelo rolo | a4 |
| l10 à mesa a leitura vale o que vale a caminho | a4 |
