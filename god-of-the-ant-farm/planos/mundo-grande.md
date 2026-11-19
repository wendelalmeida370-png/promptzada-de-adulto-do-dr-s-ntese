# O mundo grande — a modalidade dos mapas de dias (e as montanhas grandes)

O pedido do dono (19/11/2026): mapas maiores que o Titânico e montanhas maiores, para que **a navegação dure dias, a
exploração de uma grande floresta dure dias e a subida de uma montanha dure dias**. Uma modalidade nova — os tamanhos de hoje
ficam. É a maior mecânica fundamental do roteiro, e a base da mata ([`oficios.md`](oficios.md)), da montanha
([`montanha.md`](montanha.md)) e da viagem no mar ([`navios.md`](navios.md)). Os números são propostas para começar.

## 1. As contas (o que «dias» quer dizer no jogo)

- **Uma casa do mapa tem 4 m** (`Space.TILE`). O **Titânico** (192 casas) tem **768 m de lado**: a pé, atravessa-se
  em uns 8 minutos — menos de um dia do corpo.
- **O dia do corpo dura 12,3 minutos** (o tempo do corpo, D-015, D-365). Andando a 1,6 m/s o dia inteiro, sem parar, faz-se
  **≈ 1,2 km num dia**; com as paradas, a noite e as refeições, ≈ 0,8 km. Um navio a uns 4 m/s faz ≈ 3 km num dia.
- **A boa notícia:** como o dia é curto, **«dias de viagem» pedem quilômetros, não continentes**:

| Tamanho (proposta) | Casas | Lado | A pé, de ponta a ponta | De navio |
|---|---|---|---|---|
| Titânico (hoje) | 192 | 0,77 km | menos de um dia | minutos |
| **Continental** | 512 | 2 km | ~2 dias | ~1 dia |
| **Mundo** (o maior, decisão do dono) | 1.280 | 5,1 km | ~5 a 6 dias | ~2 a 3 dias |

**Por que 5 km é o ponto doce** (19/11/2026): é 2,7 vezes menos chão que um de 8 km (menos memória, menos tempo para gerar,
saves e mundos prontos menores) e ainda dá viagens de dias: quase uma semana a pé de ponta a ponta, dois a três dias de navio
(mais com vento contra, ou na galé a remo). 1.280 casas são dez pedaços de 128, a medida boa para o 3D por pedaços. Se o de 5 km
rodar folgado, um maior pode ser tentado depois — o motor não pode ter o tamanho escrito em lugar nenhum.

- **A montanha de dias:** subindo em terreno fácil, o corpo ganha ≈ 0,3 m por segundo na vertical — ≈ 200 m num dia do corpo,
  com a caminhada de aproximação, os acampamentos e o ar fino. **Uma montanha de dois a quatro dias tem de 500 a 1.000 m de
  altura**, com os vales e as cristas na mesma medida. O relevo de hoje não chega lá.

## 2. A ideia que torna isso possível: o detalhe é uma conta

Um mapa de 1.280 casas tem 1,6 milhão de casas — 44 vezes o Titânico. Guardar e simular cada casa como hoje não cabe. O jogo já
tem a peça que resolve: **as fontes puras** (a mata — `G.Mata` —, o relevo — `G.Geo` —, a água, o céu: a mesma conta dá o mesmo
resultado, sem guardar nada). O mundo grande vai por esse caminho:

1. **O mundo guarda o grosso e o que mudou.** O relevo grande, os rios, os biomas, as jazidas, os povos antigos nascem da semente;
   o detalhe de cada casa (a árvore, a pedra, a pega da parede, o capim) é **uma conta da semente e do lugar**, feita quando alguém
   precisa. O save guarda **só o que mudou**: a árvore cortada, a obra, a mina, a estaca cravada, a terra movida.
2. **O mundo vive por importância, nunca pelo olhar.** Onde há gente — qualquer gente: o povo, o caçador, o mercador, o corpo
   (que é uma pessoa do mundo) —, a vida é de carne e osso; **no mato longe de todos, a vida corre em contas**: a população de cada
   região (os bichos que nascem, morrem, migram, caçam), a mata que cresce. Quando alguém chega, os bichos daquela região ganham
   corpo pela conta da semente, do lugar e da hora; quando todos vão embora, voltam a ser contas, **sem perder nem ganhar nenhum**.
   **Nunca a câmera:** a mesma semente faz o mesmo mundo com ou sem quadros (o `det3` continua provando isso).
3. **O 3D por pedaços.** Só se desenha o que está perto, em detalhe; o longe vai ficando mais simples até virar a silhueta das
   montanhas no horizonte (que precisa existir: **a vista do cume é a recompensa da montanha**). Os pedaços chegam e saem conforme o
   corpo anda, sem travar.
4. **O caminho por camadas.** Procurar caminho casa por casa em quatro milhões de casas não dá: a viagem longa vai por regiões e
   estradas (o mapa de regiões que o jogo já tem, `W.reachIds`, ganha andares), e o passo a passo só perto de quem anda.
5. **O mar aberto é barato.** A água é uma conta (`G.Agua`); no mar longe da costa quase nada vive além dos navios, dos peixes em
   contas e do tempo. É ali que a navegação de dias acontece.

## 2b. É viável? (a resposta sincera)

**É viável, e é difícil.** Não é viagem: mundos grandes no navegador, com o chão chegando por pedaços, são uma técnica conhecida, e
o jogo já tem as peças certas (as fontes puras, a semente que refaz tudo, o mapa de regiões). **O que não dá é só aumentar o
número do tamanho:** hoje uns **230 lugares do código passam pelo mapa inteiro** — muitos só na criação do mundo (aceitável),
outros a cada passo ou a cada dia, e esses precisam virar locais. O passo do mundo roda num núcleo só do processador, e o
navegador dá a uma aba uns poucos gigabytes: o mundo de 5 km tem de caber em um ou dois.

## 2c. O que pode atrapalhar o jogo, e como evitar

| Risco | O que acontece | Como evitar |
|---|---|---|
| **O mundo vazio** | muito chão para pouca gente | o vazio é a floresta, a montanha e o mar que você quer atravessar; os povos ficam onde a terra é boa, e o caminho entre eles tem as suas coisas (a caça, as ruínas, os povos antigos, os bichos, o tempo) |
| **Os povos se encontram tarde** | o primeiro contato, o comércio e a guerra demoram mais; a história de cem anos fica mais calma | mais povos no mundo grande; as estradas e os portos que encurtam |
| **A notícia anda devagar** | os boatos e as memórias vão com quem viaja, e quem viaja leva dias | é o certo (a fama de alguém chega antes ou depois conforme a distância) e deixa o mundo mais rico |
| **O andar cansa** | ir a algum lugar leva dias | o ritmo da viagem (§5), **a montaria e a carroça** (uma base nova para o mundo grande), as estradas, o barco |
| **O deus vê pouco** | o mapa não cabe na tela | os níveis de zoom, o mapa do mundo, os povos marcados |
| **As provas demoram** | os mundos grandes levam horas para gerar e viver | as provas do mundo grande escolhidas, e cada sistema provado num mapa pequeno e num grande |

**As memórias e as histórias não se perdem:** a memória das pessoas, os laços, as histórias e os boatos não dependem do tamanho do
mapa — só da gente, que é a mesma.

## 2d. A preparação barata (desde já, em todo patch)

Para o mundo grande não ter de refazer o que vier antes dele:

- **nenhuma conta nova que passe pelo mapa inteiro a cada passo** (uma regra nova no `guard.js`, assim que o primeiro patch a
  precisar dela começar);
- **o detalhe novo como conta pura** (as pegas da escalada, as árvores da mata já são);
- **o que muda no chão guardado como «o que mudou»**, quando der;
- **nenhum tamanho escrito à mão:** tudo pelo `N` do mapa.

Isso também deixa os mapas de hoje mais leves.

## 3. A população cresce um bocado (decisão do dono, 19/11/2026)

O mundo grande tem **espaço entre os povos** — a floresta que separa dois reinos, a cordilheira que só se passa pelo passo, o mar
que leva três dias, os pântanos, as falésias, os lagos maiores — **e também mais gente**, sem exagero: as cidades crescem em tamanho
e em população, e há mais cidades. **Mais gente enche os nichos:** com tantos ofícios, uma cidade pequena não tem um de cada; uma
maior tem os seus mineiros, os seus pescadores, o seu navegador, o seu escriba. **O limite é o processador:** cada pessoa custa a
cada passo (o chão vazio quase não custa), então o quanto a gente cresce sai da medida no PC do dono, na sondagem do patch.

## 4. As montanhas grandes

- **O relevo novo:** as cordilheiras com centenas de metros de altura, os vales fundos, as cristas, os paredões, a neve das
  alturas, as geleiras (a modalidade «alpino», que já existe, é o ponto de partida).
- **O gerador já sabe garantir caminho:** hoje ele abre um caminho para cada platô (`G.Relief.connect`, «ways up every plateau»);
  as montanhas grandes ganham a mesma garantia para quem anda (o passo, a crista) e para quem escala (a via normal —
  [`escalada.md`](escalada.md) §10b).
- **O céu e o frio da altura:** o frio (`G.Atmos.cold`) e o ar fino com a altura; as nuvens que sobem o vale.

## 5. A viagem de dias tem de ser boa (não só longa)

Longe não basta: a viagem precisa de coisas acontecendo — o tempo que vira, o encontro, o bicho, a decisão, o acampamento, o
companheiro que conversa, a descoberta. **E o jogador escolhe o ritmo:** a viagem calma pode correr mais depressa (como dormir),
e para sozinha quando algo acontece (a tempestade, o navio no horizonte, o rastro da fera). Nada se pula: o tempo do mundo corre
igual, só mais rápido.

## 6. A modalidade

- **Os tamanhos de hoje ficam** (do Pequeno ao Titânico): o deus que quer um mundo íntimo continua tendo.
- **Os novos** (Continental, Mundo, Vastidão) entram como modalidade no menu do mundo novo, para o PC (o alvo do jogo).
- **Todo sistema funciona nos dois:** as provas de cada sistema rodam num mapa pequeno e num grande.

## 7. Os riscos (ditos de saída)

- **É o maior patch técnico do roteiro** e pode virar dois: o motor (os dados, o save do que mudou, o 3D por pedaços, o caminho
  por camadas, a vida por importância) e o mundo (o relevo grande, os biomas grandes, a modalidade no menu).
- **Toda conta do jogo que passa por todas as casas a cada passo** precisa virar local ou aos poucos — uma caça no código inteiro
  (e uma regra nova no `guard.js` para nenhuma voltar).
- **A vida em contas e a vida de carne e osso têm de concordar** (a manada que ganha corpo tem o mesmo tamanho que tinha em conta):
  é o ponto mais delicado, e tem as suas provas.
- **Os mundos prontos grandes** levam muito mais tempo para gerar pelo salto do jogo.
- **Antes de tudo, uma sondagem:** gerar um mapa de 1.280 e medir onde o jogo engasga — o plano do patch sai das medidas.

## 8. As provas

- a mesma semente faz o mesmo mundo grande, com ou sem quadros (`det3` num mapa grande);
- **nada se perde na passagem entre contas e carne e osso** (os bichos, as plantas, as coisas no chão);
- o save guarda só o que mudou, e carrega o mesmo mundo; um save de antes continua carregando;
- nenhuma conta por todas as casas no passo do mundo (a regra do guard);
- o passo do mundo e o desenho dentro do orçamento de tempo do PC (a prova de desempenho num mapa grande);
- todo cume, platô e vale com o seu caminho (o de quem anda e a via normal);
- e **o teste do dono: uma viagem de dias pelo mar, pela floresta e pela montanha, sem enjoar.**

## 9. Quando entra

**Quando o PC novo do dono chegar** (decisão do dono, 19/11/2026): é o Patch 41 do roteiro, e pode vir antes no dia em que o
dono quiser — o que ele pede já existe (as fontes puras). Até lá, cada patch faz a preparação barata (§2d). **A montanha de dias
vem logo depois dele** (Patch 42); a mata, o mar e a escalada são feitos antes, nos mapas de hoje, e ganham o seu tamanho de dias
quando o mundo grande chegar ([`roteiro.md`](roteiro.md)).

**Para o PC novo** (o jogo roda no navegador): 16 GB de memória bastam; o passo do mundo usa **um núcleo só**, então pesa mais um
processador de núcleo rápido do que um de muitos núcleos; a placa de vídeo é a do 3D (a qualidade alta, o longe com as
montanhas).
