# A fundação dos ofícios (Patch 25)

A máquina comum a todos os ofícios. Feita uma vez, cada ofício novo passa a ser **os seus dados e o seu gesto próprio** — a
prática, as técnicas, os títulos, a coleção, a recompensa que se vê, o mercado, o mestre e o aprendiz já vêm prontos. A visão
geral está em [`oficios.md`](oficios.md); o primeiro ofício a usar a fundação, em [`oficio-pesca.md`](oficio-pesca.md).

## 1. Como o jogador vai sentir

Você encarna uma pescadora num vilarejo. Abre o painel e vê a aba **Ofício**: «Pescadora — aprendiz», uma barra pela
metade, três técnicas aprendidas e duas de que só ouviu falar («dizem que o velho Tor pesca de noite com tocha»), a coleção
com 4 espécies de 14, o recorde da cidade (um bagre de 11 quilos, do filho do ferreiro) e uma encomenda aberta da taverna:
«10 sardinhas até a festa». Você vai, pesca, a cidade reage, a barra anda, um dia o velho Tor aceita te ensinar — e um dia,
com a peça de mestre, os pescadores do porto te chamam de mestra. Tudo isso, em cada ofício, pela mesma máquina.

## 1b. As quatro camadas (a pergunta do dono, 19/11/2026 — aprovado; o catálogo em [`pericias.md`](pericias.md))

**A pergunta:** o pirata que comanda o navio também fica sem o mapa no mar aberto, como o navegador? Então o navegador seria uma
«fundação» que gera outros ofícios? **A decisão:** separar o que hoje está misturado em quatro camadas.

| Camada | O que é | Quem está nela | Exemplos |
|---|---|---|---|
| **As bases** (as leis do mundo) | como o mundo funciona para todos; ninguém as tem, todos vivem debaixo delas | **todo mundo**: o corpo e as pessoas do mundo, de qualquer ofício | o mar sem mapa, a mata fechada, o escuro de baixo, a altura e o frio, as estações, a escalada (o corpo na parede), a fome |
| **As perícias** (o que a pessoa sabe fazer) | o saber das mãos e da cabeça, com **a prática (0–100) e as técnicas**; é o que deixa viver melhor debaixo de uma base | quem aprendeu — de qualquer ofício | navegar, escalar, rastrear, nadar, pescar, cavar, forjar, lutar (por arma), negociar, curar, comandar, ler |
| **Os ofícios** (quem a pessoa é na sociedade) | o papel: o título, a paga, o lugar, o dia de trabalho, as pessoas em volta, o ciclo, a coleção, a camada do ambiente; **cada ofício usa algumas perícias** | quem o tem (um principal e os praticados) | o navegador (navegar, ler o tempo), o pirata (navegar um pouco, abordar, comandar, intimidar), o pescador (pescar, navegar a costa) |
| **As condições** (o que se vive sem querer) | a situação que prende; também ensina perícias | quem caiu nela | o galeote (remar, aguentar), o escravo da mina (cavar), o soterrado, o perdido no mar |

**O que isso resolve:**

1. **O mapa some para todos no mar aberto** — é a lei do mar (uma base), não uma regra do navegador. O pirata, o mercador, o
   pescador, o passageiro, o náufrago: todos sem mapa.
2. **Quem sabe navegar sabe onde está** — pela perícia de navegar, venha ela de onde vier. O pirata que aprendeu as estrelas navega
   bem; o que não aprendeu se perde, **ou leva um piloto** (que diz em voz alta «estamos a dois dias do cabo», e a tela do corpo
   passa a mostrar o que o piloto disse). Isso dá valor ao navegador dentro de qualquer tripulação — e foi assim na história: o
   pirata precisava de um piloto.
3. **Nenhuma técnica repetida em dois ofícios:** «a estima» é da perícia de navegar, e vale para o navegador, o pirata e o
   pescador. A técnica aprendida num ofício serve em todos os outros que usam a mesma perícia.
4. **O ofício continua sendo o pacote** (o papel, as recompensas, a camada do ambiente, os títulos), e **os títulos pedem as
   perícias** (o capitão pirata pede navegar 40 e comandar 60) e um feito.
5. **As pessoas do mundo também têm as perícias,** pelas mesmas regras (o piloto do mundo navega pela sua prática).

**O que muda nos planos:** a prática e o caderno de técnicas (§2.2, §2.3) passam a ser **da perícia**, não do ofício; o registro
dos ofícios (§2.1) diz **quais perícias cada ofício usa**; as tabelas de técnicas de cada ofício viram as técnicas das perícias
que ele usa. **O nome:** «fundação» já quer dizer outras duas coisas no projeto (as fundações do código e esta fundação dos
ofícios); por isso «as bases» (o que o roteiro chama de mecânicas fundamentais) e «as perícias».

## 2. As peças

### 2.1 O registro dos ofícios

Cada ofício é uma entrada num registro (`G.Oficios`, nome proposto), com:
- o nome, o tronco (a família) e os derivados;
- os gestos (as mecânicas das mãos daquele ofício);
- as ferramentas e os materiais (pelo catálogo das coisas, `G.Itens`);
- **as perícias que usa** — a principal e as outras ([`pericias.md`](pericias.md)) —, com as técnicas delas;
- os títulos e o que cada um pede;
- as coleções e os recordes;
- as entradas e as saídas (as receitas, com a origem de cada coisa — o `ORIGEM.md` ganha a linha);
- os lugares, as horas e as estações em que se faz;
- os riscos;
- as lendas (as histórias que o motor de histórias pode contar);
- as falas e as missões próprias (o Patch 23).

Um derivado herda do tronco e acrescenta o que é seu.

### 2.2 A prática (das perícias: o que o corpo aprende fazendo)

- Cada pessoa tem uma prática **por perícia** (de 0 a 100), guardada nela e no save; cada ofício usa algumas perícias (§1b).
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
- **Cada técnica é de uma perícia** ([`pericias.md`](pericias.md)) e vale em todo ofício que usa a mesma perícia.
- **O caderno de técnicas** na aba (por perícia): as aprendidas, as de que se ouviu falar (por boato, de quem ensina), e o que cada uma pede.
- Algumas pedem outras antes; algumas pedem uma arte do povo (a carretilha pede a roda).

### 2.4 Os títulos e o reconhecimento

- **Aprendiz → oficial → mestre** em cada ofício.
- O título pede **as perícias** (o nível de cada uma) **e um feito**: a **peça de mestre** (o peixe raro, a espada perfeita, a colheita de um ano), julgada
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
- **Como cada ofício ganha** (o soldo, a peça, a venda, a encomenda, a parte, o achado, a renda, a recompensa, o presente), o
  posto com hora, a licença e o juntar dois ofícios: [`economia-oficios.md`](economia-oficios.md).
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

### 2.14 O que cada ofício traz às máquinas do mundo (a ideia do dono, 20/11/2026)

**As falas, as animações, as interações, o grupo e as marcas são máquinas do mundo, não dos ofícios** — servem a tudo: às pessoas,
às condições, à natureza, ao deus. **Todo patch de ofício alimenta as cinco** com o que é dele, como traz as perícias e a camada do
ambiente:

- **As falas** (a máquina da 23b): os **assuntos novos** que o ofício cria no mundo (o peixe recorde, a trilha nova, o túmulo
  violado), as falas do trabalho (dos colegas, do mestre, de quem compra), as reações curtas da hora (o «pegou!», o «os macacos
  calaram»), o que o mundo diz de quem tem o ofício, e os boatos — **toda fala aponta para um fato verdadeiro**, no jeito de quem
  fala; ≈ 150 a 250 frases-base por ofício.
- **As animações** (a fábrica da 23c): os gestos do trabalho, da espera, do perigo e da recompensa, nas pessoas do mundo e no corpo,
  pelas provas da fábrica (os pés no chão, as mãos no ponto, as cinco idades); ≈ 20 a 30 clipes por ofício.
- **As interações** (o registro `G.Interact.verb`): os verbos novos nas coisas do mundo e nas pessoas (cortar o cipó, sondar,
  dividir o saque, contar vantagem), pelas regras da interação; ≈ 8 a 15 por ofício.
- **O grupo** (a máquina dos companheiros, [`grupos.md`](grupos.md)): os papéis do ofício, as ordens e as situações que mexem no
  grupo — linhas nas portas `G.Grupo.papel`, `ordem` e `situacao`, nunca uma máquina própria.
- **As marcas** (o registro das marcas do mundo, [`marcas.md`](marcas.md)): os tipos de marca que o ofício deixa, lê ou apaga
  (a estátua, o livro, o talho na árvore, o nome da ilha, a parede dos rabiscos).

Cada documento de ofício tem a seção «As falas, as animações e as interações» com os assuntos, os exemplos e as listas.

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
