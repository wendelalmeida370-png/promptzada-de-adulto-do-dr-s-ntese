# O roteiro — dos NPCs aos ofícios

Escrito em 19/11/2026 para não perder o fio do brainstorm: do pedido da aba de Relacionamentos (como no The Sims) até o mineiro.
**Há duas ordens diferentes, e as duas valem:**

- **a ordem dos PDFs é a do dono:** o que ele acha mais divertido de ler, na hora em que a ideia vem;
- **a ordem de fazer é a deste roteiro:** a mais lógica — a base antes da casa. Ela é a que vale para a implementação, e os
  documentos de cada ofício seguem os números de patch daqui.

## 1. O que conversamos (a linha do brainstorm)

| # | O assunto | O que ficou decidido | Onde está |
|-|-----|--------------------|-------|
| 1 | **Os NPCs e a aba de Relacionamentos** | a matriz de impacto e dificuldade de cada ideia; a aba no estilo do The Sims: o laço de fundo (o amor ou o ódio de anos), o momento (o humor de agora) e **o porquê** de cada um | [`npcs-brainstorm.md`](npcs-brainstorm.md) §2; [`patch23-as-vidas.md`](patch23-as-vidas.md) 23a |
| 2 | **Nenhuma IA dentro do jogo** | o «cérebro de IA» foi força de expressão: a inteligência dos NPCs é a das regras (a memória, os laços, as metas, os planos) e **milhares de falas contextuais** escritas por nós | [`npcs-brainstorm.md`](npcs-brainstorm.md) §3 |
| 3 | **As animações** | uma fábrica de animações (os clipes feitos por receita, as variações, as camadas) e até onde ela vai | [`npcs-brainstorm.md`](npcs-brainstorm.md) §4 |
| 4 | **As missões** | os pedidos que viram missão no diário; o quão perto das missões secundárias do The Witcher 3 dá para chegar, e os truques para isso | [`npcs-brainstorm.md`](npcs-brainstorm.md) §5 |
| 5 | **O próximo patch** | o Patch 23, «As Vidas», em duas ondas e cinco frentes; o motor de histórias que já existe (o da cegonha) vira a fonte das missões | [`patch23-as-vidas.md`](patch23-as-vidas.md) |
| 6 | **A visão dos ofícios** | profundos e ligados ao mundo, nunca minijogos soltos; mecânicas fundamentais → ofícios fundamentais → derivados; **um ofício principal e quantos o tempo deixar praticar**; a prática discreta e as técnicas (o qualitativo); a lista de todos os ofícios e condições | [`oficios.md`](oficios.md) |
| 7 | **A fundação dos ofícios** | a máquina comum a todos: a prática, as técnicas, os títulos, a coleção, os recordes, mestre e aprendiz, o mercado do corpo, o kit da recompensa | [`oficios-fundacao.md`](oficios-fundacao.md) |
| 8 | **A Pesca** | as 36 espécies, as ferramentas, o gesto com os números, os títulos; depois, a fundo: o peixe nas mãos pelo peso, **o lugar que se descobre** (nada de bandeja), **os lendários que nascem do mundo** (e não para o jogador) | [`oficio-pesca.md`](oficio-pesca.md) |
| 9 | **Os navios** | entrar em canoas, barcos e navios gigantes; o itinerário do porto; a viagem; a batalha no mar (N1 a N5) | [`navios.md`](navios.md) |
| 10 | **O remador de galé** | o galeote (a condição) e o remador livre (o ofício); **as galés na medida da gente do mundo** (a de 30 remos é a comum; a trirreme de 170, rara) | [`condicao-escravo-gale.md`](condicao-escravo-gale.md) |
| 11 | **O estivador** | o homem do porto: a carga, o porão, a turma, a noite, o contrabando | [`oficio-estivador.md`](oficio-estivador.md) |
| 12 | **A camada do ambiente** | cada ofício com a sua fotografia, o seu som, o seu tremor, a sua tela e a sua mochila — sem mentir sobre o mundo | [`oficios-fundacao.md`](oficios-fundacao.md) §2.13 |
| 13 | **O gladiador** | a escola, a arena visceral (o decepar, a decapitação), o favor da multidão, as feras, a fama nos muros | [`oficio-gladiador.md`](oficio-gladiador.md) |
| 14 | **O capataz** | mostrado como ele é — uma pessoa que faz o mal por um sistema —, que o jogador pode ser, e o mundo que responde a tudo o que ele faz | [`oficio-capataz.md`](oficio-capataz.md) |
| 15 | **O subterrâneo** | o corpo debaixo da terra (a luz, o ar, a água, o desabamento); **o tesouro é o passado de verdade do mundo**; os ofícios que ele abre | [`subterraneo.md`](subterraneo.md) |
| 16 | **O mineiro** | a mina a fundo: os minerais e os sinais, a prospecção, o golpe pela fenda, a chama que mede o ar, a escora, o garimpo, os lendários | [`oficio-mineiro.md`](oficio-mineiro.md) |

## 2. A lógica da ordem

1. **A base antes da casa.** Um ofício só entra quando a mecânica de que ele depende existe (não há remador de galé sem o
   navio por dentro, nem mineiro sem o corpo debaixo da terra).
2. **As pessoas primeiro.** Quase todo ofício vive das pessoas: o mestre que ensina, a multidão da arena, o ódio dos homens
   do capataz, o freguês, a fama. Por isso os NPCs (23 e 24) vêm antes de tudo.
3. **O molde provado num ofício curto.** A Pesca é o ciclo mais curto e mais claro (lançar, esperar, fisgar, puxar) e tem as
   bases prontas (a água e os peixes): é o melhor lugar para provar a fundação.
4. **Afinar o molde antes de copiar.** Depois da Pesca, o dono joga, e a fundação é afinada pelo que ele sentiu — antes de o
   molde ser repetido em dez troncos.
5. **Do que se tira ao que se faz, ao que se troca, ao que se manda.** Primeiro quem tira da natureza (a terra, a mata, a
   mina), depois quem transforma (a oficina), depois quem luta, rouba, navega e troca, e por último quem cuida da alma, conta
   as histórias e governa — que dependem de todo o resto.
6. **Cada patch abre uma família inteira** e chega com as suas provas — e com o teste do dono: horas sem enjoar.

## 3. A ordem de fazer

**Antes do Patch 23 — a faxina da v14:** os mundos prontos gerados de novo com a máquina livre; o vento do céu logo depois do
load (S4); T-1584 e T-1585.

| Patch | O quê | Depende de | Abre | Os planos |
|-----|------------|-----|------|-----|
| **23 — As Vidas** | a memória e os laços, **a aba de Relacionamentos**, a voz (as falas contextuais), a fábrica de animações, os pedidos que viram missão, a vida que muda | a sociedade da v14 | a base de quase todo ofício | [`patch23-as-vidas.md`](patch23-as-vidas.md) |
| **24 — O conflito** | o inimigo que age, os planos de vários passos, a mentira, o segredo e a chantagem, os grupos, mais missões, mais falas e clipes | 23 | o capataz (o delator, a faca de noite), a fuga da galé, a sombra, o contrabando | [`patch23-as-vidas.md`](patch23-as-vidas.md) §7 |
| **25 — A fundação dos ofícios e a Pesca de água doce** | a máquina comum, a camada do ambiente, o mercado do corpo, mestre e aprendiz; a Pesca do rio e do lago (P1) | 23 | todo ofício que vem depois | [`oficios-fundacao.md`](oficios-fundacao.md), [`oficio-pesca.md`](oficio-pesca.md) |
| **26 — Os barcos pequenos e a Pesca inteira** | a canoa, a jangada, o barco a remo (N1); a costa, o mergulho, a conserva e o mercado (P2 a P4) | 25 | o primeiro chão que anda (a base do navio) | [`navios.md`](navios.md), [`oficio-pesca.md`](oficio-pesca.md) |
| **27 — O acabamento e o molde afinado** | os murmúrios de voz por povo, os lábios com a fala, os sonhos; a fundação afinada pelo que o dono sentiu jogando a Pesca | 23, 25, 26 | um molde melhor para os outros dez troncos | [`patch23-as-vidas.md`](patch23-as-vidas.md) §7 |
| **28 — A terra** | a Lavoura e a Criação (a horta, o campo, as estações, o solo, os bichos de criação) | 25 | o que a maior parte do povo vive — o ofício que o corpo mais vai encarnar | [`oficios.md`](oficios.md) |
| **29 — A mata** | o caçador, o armadilheiro, o lenhador, o ervanário, o carvoeiro | 25 | a madeira, o couro, a erva e o carvão das oficinas | [`oficios.md`](oficios.md) |
| **30 — O subterrâneo e a mina** | o corpo debaixo da terra (S1, S2, S4); o mineiro (M1 a M5), o garimpeiro, o escorador, o homem do fogo, o lapidário; o soterrado | 25 | o metal e as pedras das oficinas; a base da arqueologia | [`subterraneo.md`](subterraneo.md), [`oficio-mineiro.md`](oficio-mineiro.md) |
| **31 — A oficina** | o ferreiro, o armeiro, o oleiro, o tecelão, o carpinteiro, o marceneiro; a construção pelo corpo | 28, 29, 30 (o que a terra, a mata e a mina deram) | as armas, as ferramentas e as coisas de todos os outros | [`oficios.md`](oficios.md) |
| **32 — A arena e a guerra** | o combate profundo (as zonas, as feridas, o decepar); o gladiador (A1 a A5), o guerreiro, o mercenário, o campeão | o combate da v14, 23, 24, 31 (as armas) | a luta que o mar, a sombra e a caça vão usar | [`oficio-gladiador.md`](oficio-gladiador.md) |
| **33 — A sombra** | o ladrão, o contrabandista, o espião, o assassino; o preso | 24, 32 | esconder, furtar, ouvir escondido — o que a fuga da galé, a revista do capataz e o contrabando do porto usam | [`oficios.md`](oficios.md) |
| **34 — O porto e o navio por dentro** | as plantas dos navios, o chão que anda, o itinerário do porto (N2, N3); o estivador (E1 a E5), o marinheiro; o remador livre (G1) | 26, 33 | as viagens do corpo | [`navios.md`](navios.md), [`oficio-estivador.md`](oficio-estivador.md) |
| **35 — A viagem e a batalha no mar** | os dias no mar e a batalha (N4, N5); o galeote (G2 a G5), o capataz (o comitre e o feitor, C1 a C5), o pirata, o navegador, o pescador de alto-mar | 32, 33, 34 | o mundo inteiro pelo mar | [`condicao-escravo-gale.md`](condicao-escravo-gale.md), [`oficio-capataz.md`](oficio-capataz.md) |
| **36 — O comércio** | o mercador, o caravaneiro, o taverneiro, o estalajadeiro | 25 (o mercado do corpo), os troncos que fazem as coisas, 35 (o mar) | o que liga todos os outros | [`oficios.md`](oficios.md) |
| **37 — A fé, o saber e o passado** | o sacerdote, o curandeiro, o escriba, o oráculo; **a arqueologia** (S3: o tesouro do passado de verdade), o decifrador | 30 (debaixo da terra) | as ruínas, os túmulos e as inscrições do próprio mundo | [`subterraneo.md`](subterraneo.md), [`oficios.md`](oficios.md) |
| **38 — A arte** | o bardo (as histórias do mundo), o músico, o ator, o auriga | 23 (as histórias), 36 | — | [`oficios.md`](oficios.md) |
| **39 — O poder** | jogar como quem governa, o conselheiro, o juiz | tudo o que veio antes | o topo da escada | [`oficios.md`](oficios.md) |

As condições e as passagens entram com o tronco de cada uma: o gladiador escravo e o liberto no 32, o preso no 33, o
soterrado no 30, o galeote e o escravo da mina no 35.

## 4. A ordem dos PDFs (a do dono) e onde cada um cai

| PDF (na ordem em que o dono pediu) | Entra no patch |
|---|---|
| O brainstorm dos NPCs e o Patch 23 | 23, 24 e 27 |
| Os ofícios (a visão e a lista) | 25 a 39 |
| A fundação dos ofícios | 25 |
| A Pesca | 25 e 26 (o alto-mar no 35) |
| Os navios | 26 (a N1), 34 (a N2 e a N3), 35 (a N4 e a N5) |
| O remador de galé | 34 (o remador livre) e 35 (o galeote) |
| O estivador | 34 |
| O gladiador | 32 |
| O capataz | 35 |
| O subterrâneo | 30 (a arqueologia no 37) |
| O mineiro | 30 |

**Os que ainda não têm o seu documento a fundo** (para quando o dono quiser ler, na ordem que achar mais divertida): a terra, a
mata (o caçador e o lenhador), o ferreiro, o oleiro, o ladrão e o assassino, o marinheiro e o pirata, o mercador, o
sacerdote e o curandeiro, o arqueólogo, o bardo, quem governa.

## 5. Como cada patch anda

Cada patch segue o protocolo de qualidade do `CLAUDE.md`: o plano com os números de cada frente, o contrato, as frentes em
paralelo, as provas de cada uma, a regressão completa antes de publicar e a versão no artefato para o dono jogar. **E o teste
do dono no fim de cada ofício: horas a fio, sem enjoar** — se enjoar, o ofício volta para a mesa antes do próximo tronco.
