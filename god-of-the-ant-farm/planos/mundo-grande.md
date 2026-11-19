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
| **Mundo** | 1.024 | 4 km | ~4 a 5 dias | ~1,5 dia |
| **Vastidão** | 2.048 | 8 km | ~8 a 10 dias | ~3 dias |

- **A montanha de dias:** subindo em terreno fácil, o corpo ganha ≈ 0,3 m por segundo na vertical — ≈ 200 m num dia do corpo,
  com a caminhada de aproximação, os acampamentos e o ar fino. **Uma montanha de dois a quatro dias tem de 500 a 1.000 m de
  altura**, com os vales e as cristas na mesma medida. O relevo de hoje não chega lá.

## 2. A ideia que torna isso possível: o detalhe é uma conta

Um mapa de 2.048 casas tem 4 milhões de casas — 114 vezes o Titânico. Guardar e simular cada casa como hoje não cabe. O jogo já
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

## 3. A população não cresce com o mapa

O mundo grande não precisa de dez vezes mais gente: precisa de **espaço entre os povos** — a floresta que separa dois reinos, a
cordilheira que só se passa pelo passo, o mar que leva três dias. As cidades continuam do tamanho que crescerem. O custo de
simular é o da gente e dos bichos de carne e osso, não o do chão.

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
- **Antes de tudo, uma sondagem:** gerar um mapa de 1.024 e medir onde o jogo engasga — o plano do patch sai das medidas.

## 8. As provas

- a mesma semente faz o mesmo mundo grande, com ou sem quadros (`det3` num mapa grande);
- **nada se perde na passagem entre contas e carne e osso** (os bichos, as plantas, as coisas no chão);
- o save guarda só o que mudou, e carrega o mesmo mundo; um save de antes continua carregando;
- nenhuma conta por todas as casas no passo do mundo (a regra do guard);
- o passo do mundo e o desenho dentro do orçamento de tempo do PC (a prova de desempenho num mapa grande);
- todo cume, platô e vale com o seu caminho (o de quem anda e a via normal);
- e **o teste do dono: uma viagem de dias pelo mar, pela floresta e pela montanha, sem enjoar.**

## 9. Quando entra

**No Patch 29**, logo depois da terra e antes da escalada, da mata, do subterrâneo, da montanha e do mar — que dependem dele
([`roteiro.md`](roteiro.md)). As fundações dele (o detalhe como conta, o save do que mudou, a vida por importância) valem também
para os mapas pequenos, que ficam mais leves.
