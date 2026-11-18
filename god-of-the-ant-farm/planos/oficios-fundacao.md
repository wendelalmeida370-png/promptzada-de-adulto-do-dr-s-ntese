# A fundação dos ofícios (Patch 26, parte 1)

A máquina comum a todos os ofícios. Feita uma vez, cada ofício novo passa a ser **os seus dados e o seu gesto próprio** — a
prática, as técnicas, os títulos, a coleção, a recompensa que se vê, o mercado, o mestre e o aprendiz já vêm prontos. A visão
geral está em [`oficios.md`](oficios.md); o primeiro ofício a usar a fundação, em [`oficio-pesca.md`](oficio-pesca.md).

## 1. Como o jogador vai sentir

Você encarna uma pescadora num vilarejo. Abre o painel e vê a aba **Ofício**: «Pescadora — aprendiz», uma barra pela
metade, três técnicas aprendidas e duas de que só ouviu falar («dizem que o velho Tor pesca de noite com tocha»), a coleção
com 4 espécies de 14, o recorde da cidade (um bagre de 11 quilos, do filho do ferreiro) e uma encomenda aberta da taverna:
«10 sardinhas até a festa». Você vai, pesca, a cidade reage, a barra anda, um dia o velho Tor aceita te ensinar — e um dia,
com a peça de mestre, os pescadores do porto te chamam de mestra. Tudo isso, em cada ofício, pela mesma máquina.

## 2. As peças

### 2.1 O registro dos ofícios

Cada ofício é uma entrada num registro (`G.Oficios`, nome proposto), com:
- o nome, o tronco (a família) e os derivados;
- os gestos (as mecânicas das mãos daquele ofício);
- as ferramentas e os materiais (pelo catálogo das coisas, `G.Itens`);
- as técnicas (o caderno do ofício);
- os títulos e o que cada um pede;
- as coleções e os recordes;
- as entradas e as saídas (as receitas, com a origem de cada coisa — o `ORIGEM.md` ganha a linha);
- os lugares, as horas e as estações em que se faz;
- os riscos;
- as lendas (as histórias que o motor de histórias pode contar);
- as falas e as missões próprias (o Patch 23).

Um derivado herda do tronco e acrescenta o que é seu.

### 2.2 A prática (o que o corpo aprende fazendo)

- Cada pessoa tem uma prática por ofício (de 0 a 100), guardada nela e no save.
- **Sobe só fazendo,** e cada vez mais devagar: o primeiro peixe ensina muito, o milésimo pouco. Fazer bem ensina mais que
  fazer mal; fazer o difícil, mais que o fácil.
- **Não cai** com o tempo (o jogo não pune quem varia de ofício).
- **O que ela faz:** alarga as janelas do gesto (o momento de fisgar, de temperar o ferro), aguenta mais (a linha, o calor),
  deixa mais rápido, melhora a qualidade do que sai, e **abre a leitura** — o pescador experiente vê as sombras dos peixes, o
  ferreiro lê a cor do ferro.
- **Como aparece:** em palavras e numa barra na aba do Ofício, nunca em números pulando na tela. As faixas: **aprendiz** (até
  20), **iniciado** (até 40), **oficial** (até 60), **perito** (até 85), **grande perito** (acima).
- **As pessoas do mundo também têm prática,** que sobe pelo trabalho delas no passo do mundo: o mundo tem mestres de verdade,
  rivais de verdade e aprendizes de verdade.

### 2.3 As técnicas (o que mais diverte)

- Cada técnica é **um verbo novo**: «a isca viva», «o nó firme», «a têmpera na água fria», «a enxertia»; muda o que se pode
  fazer, e não só um número.
- **Três jeitos de aprender:**
  - **com um mestre** — alguém do mundo que a sabe (a técnica é dele, guardada nele) e que aceita ensinar, pelo laço, por
    moedas ou por um favor (o Patch 23);
  - **num livro** — na biblioteca, para quem sabe ler (a escrita do povo);
  - **descobrindo** — fazendo uma coisa numa condição (a primeira pesca de noite com tocha mostra os peixes subindo à luz): o
    momento da descoberta é comemorado.
- **O caderno de técnicas** na aba: as aprendidas, as de que se ouviu falar (por boato, de quem ensina), e o que cada uma pede.
- Algumas pedem outras antes; algumas pedem uma arte do povo (a carretilha pede a roda).

### 2.4 Os títulos e o reconhecimento

- **Aprendiz → oficial → mestre** em cada ofício.
- O título pede a prática **e um feito**: a **peça de mestre** (o peixe raro, a espada perfeita, a colheita de um ano), julgada
  por quem já é mestre ou pela confraria do ofício na cidade.
- **O que o título dá:** um preço melhor, as encomendas dos ricos, os aprendizes, a voz na assembleia, a fama; as pessoas
  tratam diferente (as falas e os laços do Patch 23).
- Acima de mestre, **a lenda:** quem fez o feito lendário do ofício (o peixe lendário, a lâmina lendária) entra na memória do
  povo.

### 2.5 Mestre e aprendiz (uma mecânica fundamental nova)

- **Aprender:** o corpo pede a um mestre do mundo que o ensine. O mestre aceita ou não, pela índole, pelo laço, pelo que o
  corpo oferece. A lição é **um gesto guiado:** o mestre mostra (a animação dele), o corpo repete, o mestre corrige (as
  falas); em algumas lições a técnica fica, noutras a prática sobe.
- **Ensinar:** o mestre que é o corpo toma aprendizes do mundo (um filho, um órfão, um vizinho): eles ganham prática
  trabalhando com ele, ajudam no ofício, viram laços, e um dia viram mestres — e falam de quem os ensinou.

### 2.6 A coleção e os recordes

- **A coleção de cada ofício:** as espécies pescadas, as peças forjadas, as variedades colhidas — o que falta aparece em
  silhueta.
- **Os recordes:** os do corpo e **os da cidade**, que são de pessoas reais do mundo (o recorde do bagre é do filho do
  ferreiro); bater um recorde da cidade vira boato e fala.
- **No mundo:** a tábua dos recordes na taverna do porto, a peça de mestre exposta na oficina.

### 2.7 O kit da recompensa (a parte gostosa, comum a todos)

O mesmo kit serve a todos os ofícios, em **três tempos**:
1. **A antecipação:** o sinal que se espera (a boia que treme, o ferro que muda de cor), o som que começa baixo.
2. **O clímax:** o momento certo — a câmera que chega e enquadra, o som que sobe, **o instante** (o mundo inteiro desacelera
   por meio segundo, como quando o deus muda a velocidade — nunca só o desenho, para o mundo e a vista seguirem iguais), o
   controle que vibra.
3. **A recompensa:** **o cartão da coisa** (a figura dela pelo 3D, o nome, o tamanho, o peso ou a qualidade, a raridade, se é
   recorde, onde e quando), a reação das pessoas em volta (as falas curtas e as animações do Patch 23: «que peixão!», a criança
   que corre para ver), e o que fica — a linha no Diário de Vida, a notícia que corre a cidade.

**A raridade** tem quatro graus — comum, incomum, rara, lendária —, e cada grau tem o seu sinal (a cor do cartão, o som, um
instante mais longo). **A medida:** o kit acontece no que importa e não em tudo (cada peixe pequeno não para o mundo); quem
decide é o tamanho do momento.

### 2.8 O mercado do corpo (outra mecânica fundamental nova)

- **Comprar e vender com preço que reage:** o preço de cada coisa em cada cidade sai do que a cidade tem e do que ela precisa
  (a fome encarece o peixe; dez pescadores o barateiam); pelo livro, com moedas reais.
- **A banca própria:** o corpo pode ter a sua banca (as bancas já existem) ou a sua oficina.
- **As encomendas:** as pessoas e os lugares pedem ao corpo (a taverna quer sardinhas para a festa, o templo quer o peixe do
  sacrifício, o rico quer a lagosta do banquete) — pequenos pedidos com prazo e pagamento.
- **O freguês fiel e a concorrência:** quem compra sempre de você vira um laço; o rival baixa o preço.

### 2.9 A aba do Ofício no painel

Ao lado do Diário de Vida e da aba de Relacionamentos:
- o ofício principal e os praticados, cada um com a barra da prática e o título;
- o caderno de técnicas;
- as ferramentas que o corpo tem e as que faltam;
- a coleção e os recordes;
- **o próximo passo** («para ser mestre: a peça de mestre e o aceite da confraria do porto»);
- as encomendas abertas;
- o mestre e os aprendizes.

### 2.10 O dia do ofício

Todo ofício tem o mesmo esqueleto de dia — **preparar, ir, fazer, voltar, vender ou guardar, consertar, descansar** — e o
personagem sugere o plano pelo que sabe («a maré enche de madrugada», «o ferro chega amanhã»). As horas do dia, o cansaço e as
estações são o limite natural.

### 2.11 O principal, os praticados e as passagens

- **Um principal** (a identidade, o título, o dia de trabalho; o repartidor de ofícios nunca o troca, L-473) e **quantos o
  tempo deixar praticar** (a prática de cada um cresce separada).
- **Trocar de principal** é possível; às vezes é a própria história (as viradas do Patch 23).
- **As condições** (o escravo de galé, o preso, o órfão) usam a mesma máquina: têm o seu gesto, a sua prática e as suas
  **saídas** (fugir, ser libertado, cumprir a pena, ser adotado), que levam a outro ofício.

### 2.12 A ligação com o Patch 23

As falas falam do ofício («pegou algo hoje?»), os laços nascem dele (o colega, o mestre, o rival, o freguês), as missões
nascem dele (a encomenda, o concurso da festa, a lenda que se caça), e a aba de Relacionamentos mostra o porquê («meu mestre
de pesca»).

### 2.13 A camada do ambiente (a presença de cada ofício — a ideia do dono, 18/11/2026)

Cada ofício tem **o seu jeito de se ver, de se ouvir e de se sentir** — a fotografia, o som, o tremor, a tela e a mochila —, para
que viver no porto não pareça viver na forja. Com uma condição: **o que se vê tem causa** (a regra do `G.Atmos`), então a camada
do ambiente escolhe **como mostrar** o mundo, nunca muda o que o mundo é.

- **A fotografia** — a câmera e as lentes de cada gesto: por cima do ombro na luta do peixe; baixa e larga no banco da galé, com os
  remos em fila; perto e de lado na prancha do estivador. **A luz é a do mundo** (só o céu diz a luz, regras 188 e 189): o porão é
  escuro porque é porão, a madrugada do pescador tem névoa porque a manhã tem névoa, a forja brilha porque há fogo. Nenhum filtro
  por ofício que minta sobre a hora ou o tempo; a profundidade de campo e o enquadramento, sim.
- **O som** — o fundo já vem do mundo (o porto soa a porto quando há mãos trabalhando, `G.Audio.scene`); **a música do ofício é
  um arranjo dentro da música do povo** (a escala e o timbre continuam os do povo e da época, `G.Audio.musicOf` — a regra de
  «nunca uma trilha por bairro» fica): o ritmo da flauta e dos remos na galé, o canto de trabalho no cais, o silêncio e a água na
  pesca, a música que sobe no clímax.
- **O tremor e a vibração** — de coisas que aconteceram: o choque do abalroamento, o barril que cai, a linha que parte, a ânfora
  que se espatifa; o balanço do convés é o do navio de verdade. Com a opção de diminuir ou desligar o tremor (para quem enjoa).
- **A tela (o HUD do gesto)** — só enquanto se faz o gesto, pequena e, sempre que der, dentro do mundo: a vara que enverga e a
  marca da tensão na pesca; a flauta e a marca do tempo do remo na galé; o peso e o equilíbrio da carga na prancha. Some com a
  tecla H, como o resto da tela, e só mostra o que o personagem sabe.
- **A mochila** — **uma mochila só** (o lugar `m:` do livro, pelo peso), com **a vista do ofício**: uma aba que mostra e arruma as
  coisas daquele ofício (os anzóis, as linhas e as iscas do pescador; nada de extra para quem não precisa) e **os recipientes como
  coisas** (o cesto de pesca guarda o peixe com a sua própria capacidade). Assim quem tem vários ofícios não tem várias mochilas.

| Ofício | A fotografia | O som | O tremor | A tela | A mochila |
|---|---|---|---|---|---|
| **A pesca** | o ombro na luta, o plano aberto da margem na espera | a água, as aves, a linha que zumbe; a música calma que sobe na luta | a linha que parte, o salto do peixe | a tensão, a mordida nomeada (com a prática) | a caixa do pescador; o cesto |
| **A galé** | baixa e larga no banco, a fila dos remos; o escuro do porão | a flauta, as vozes do chefe dos remos, o remo na água, o chicote | o choque do abalroamento, a onda que entra | o tempo do remo, o fôlego, o ânimo | quase nada: o galeote não tem mochila (o esconderijo) |
| **O estivador** | perto e de lado na prancha, alta no porão | o canto da turma, o ranger da prancha, o guindaste, o cais | a carga que cai, a prancha que balança | o peso e o equilíbrio da carga | a vista do carregador (o que se leva nos braços) |

## 3. As regras (o contrato da fundação)

- **O mundo decide no passo do mundo:** a prática que sobe, a técnica aprendida, o título dado, a venda — no passo, pelo `G.R`
  quando houver sorteio; o kit da recompensa só se vê e se ouve (o `G.VR`, o `G.hash`), e o instante desacelera o mundo
  inteiro, nunca só o desenho.
- **Nada vem do nada:** a ferramenta, a isca, o material e o pagamento pelo livro (`G.Depot`), com a origem.
- **O mundo sem o corpo é o mesmo:** as pessoas do mundo fazem o ofício pelos mesmos gestos e ganham prática pela mesma regra.
- **O corpo só sabe o que viveu:** a aba mostra o que o personagem sabe (as técnicas de que ouviu falar, os recordes que
  conhece).
- **Quem escreve cada coisa:** a prática, as técnicas e os títulos só o arquivo da fundação (uma regra do guard), pela porta
  única dele; campo novo numa pessoa entra no molde (`SHAPE`) e no save; um save de antes abre com tudo em zero.
- **A aparência e o povo nunca decidem** quem ensina, quem aprende ou quem ganha o título; o povo dá as artes e as técnicas
  que existem naquela terra.

## 4. As provas

- **As invariantes:** a prática só sobe pelo fazer; nenhuma técnica sem a fonte (o mestre, o livro, a descoberta registrada);
  nenhum título sem a prática e o feito; nenhuma coisa no cartão que não exista no mundo; o preço não cria nem some moedas.
- **Os cenários, com os casos ruins:** o save no meio de uma lição; o mestre morre no meio; o aprendiz foge; o deus mexe no
  mundo no meio da peça de mestre; a encomenda cujo freguês morre; o mercado sem freguês.
- **As regras do guard:** quem escreve a prática, as técnicas e os títulos; o kit da recompensa sem acaso do mundo; o instante
  pela porta da velocidade do mundo.
- **O mundo igual** com ou sem quadros (`det3`) e com ou sem o corpo fazendo o ofício (como o t13 do trabalho).
- **As medidas:** a variedade por hora de jogo em cada ofício (um piso), o custo do kit na tela.

## 5. As frentes do patch

| Frente | O quê |
|---|---|
| 26a — A máquina | o registro, a prática, as técnicas, os títulos, a coleção e os recordes, a aba do Ofício |
| 26b — O gosto e o mercado | o kit da recompensa e o mercado do corpo (o preço, a banca, as encomendas) |
| 26c — Mestre e aprendiz | aprender e ensinar, e a prática das pessoas do mundo |
| 26d — A Pesca | o primeiro ofício inteiro, sobre as três (o plano em [`oficio-pesca.md`](oficio-pesca.md)) |

A 26a vem primeiro (as outras leem dela); a 26b e a 26c podem andar juntas; a 26d começa pelo gesto (que não depende das
outras) e se liga a elas quando chegarem.

## 6. Pronto quando

Um ofício novo entra **só com os seus dados e o seu gesto** e ganha sozinho a prática, as técnicas, os títulos, a coleção, a
recompensa que se vê, o mercado, o mestre e o aprendiz, e a aba do Ofício — e a Pesca, o primeiro, passa no teste do dono:
uma hora só pescando, sem enjoar.
