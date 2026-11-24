# Interiores 3 — as referências históricas, prédio por prédio e povo por povo

Pesquisa de apoio ao plano dos interiores de todos os prédios (depois do piloto da taverna). Nenhum arquivo do jogo foi
mudado. Organização: primeiro os povos e as regras do mundo (§0–§1); depois cada prédio (§2–§17) e, dentro dele, os seis
povos na ordem romano, grego, egípcio, asteca, nórdico e clássico. Cada povo traz sete linhas:

- **Cômodos** — os espaços e como se encadeiam.
- **Coisas** — os móveis e os objetos que marcam.
- **Materiais e cores.**
- **Luz** — janelas, lamparinas, braseiros, fogo.
- **Sons e cheiros.**
- **Quem e o quê** — quem fica lá dentro e o que faz.
- **De boca aberta** — dois ou três detalhes para o jogador parar ao entrar.

E, quando pesa, uma oitava: **No mundo do jogo** — a causa material pela regra «nada vem do nada» e o que falta no mundo.

As fontes vêm entre parênteses, curtas (autor antigo e passagem, ou o sítio e quem o escavou). O que não consegui confirmar
está marcado **(a conferir)**. Os números de tamanho servem de escala: o lote do jogo é de 4 m por casa (`TILE = 4`).

---

## 0. Os nomes que o jogo dá a cada prédio (js/civs.js, `bnames`) e os lotes (js/escala.js)

| tipo | romano | grego | egípcio | asteca | nórdico | clássico |
|---|---|---|---|---|---|---|
| `palacio` | Palácio | Palácio | Palácio do Faraó | Palácio do Tlatoani | Salão do Jarl | Palácio |
| `paco` | Casa do Chefe (degrau 2: Paço) | idem | idem | idem | idem | idem |
| `temple` | Templo | Templo | Templo de Pilonos | Pirâmide | Templo de Madeira | Templo |
| `house` / `sobrado` / `insula` | Domus / Domus Grande / Ínsula | Casa / Casa de Pátio / Casa Grande | Casa / Casa de Dois Andares / Casa de Nobres | Casa / Casa de Adobe / Casa dos Pochteca | Casa Longa / Casa Longa Grande / Salão de Família | Casa / Sobrado / Ínsula |
| `quartel` | Castro | Ginásio Militar | Quartel do Faraó | Casa dos Guerreiros | Salão dos Guerreiros | Quartel |
| `banhos` | Termas | Banhos | Lago Sagrado | Temazcal | Sauna | Banhos |
| `teatro` | Arena | Teatro | Jardim Sagrado | Campo de Pelota | Salão do Hidromel | Teatro |
| `biblioteca` | Biblioteca | Academia | Casa da Vida | Calmécac | Casa dos Escaldos | Biblioteca |
| `mercado` | Macelo | Empório | Mercado do Rio | Mercado | Feira | Mercado |
| `celeiro` | Hórreo | Celeiro | Celeiro Real | Celeiro | Silo | Celeiro |
| `doca` | Porto | Porto | Cais | Embarcadouro | Estaleiro | Doca |
| `maravilha` | Coliseu | Acrópole | Grande Pirâmide | Templo Mayor | Salão de Valhala | (zigurate) |

**Os lotes (lado):** a Casa do Chefe 8 m e o Paço 12 m; o Palácio 24 m; o Grande Palácio 32 m; o Palácio Colossal 40 m; o
templo 8 / 16 / 24 / 32 m; os banhos 8 m, as termas 20 m, as grandes termas 28 m; a biblioteca 8 / 16 m; o mercado 8 / 16 m;
a administração 8 / 16 m; o teatro 24 / 32 / 40 m; a cadeia 8 m; o quartel 8 m; a taverna 8 / 12 / 16 m. **Para a escala:** a
sala do trono de Domiciano (30,5 × 38,7 m) só cabe no Colossal; o mégaron de Pilos (≈ 13 × 11 m) cabe folgado no Palácio; o
salão do chefe de Borg (83 m) não cabe em lote nenhum — o Salão do Jarl de 24 m tem o tamanho de uma casa longa de chefe comum
(as de Trelleborg têm 29 m).

**Os que o jogo ainda não tem por dentro** (o diagnóstico do `planos/interiores-2.md` §2.1): a doca não tem planta; a
alfândega e a escola de gladiadores nem existem como tipo; a mina, a administração e a coletoria são só a forma de fora; não
existe padaria como tipo (o pão é da casa, da taverna e da cozinha do palácio). **O asteca nunca ganha estábulo** (o
`economy.js` pula `fac.civ === 'asteca'` — certo: não havia cavalo na América), e o curral dele só tem perus (`E.HERDS`).

---

## 1. Os seis povos e as regras do mundo

### 1.1 O que é o «clássico» no código

- **É o povo das «Tribos sem nome».** Na tela de mundo novo há «Históricas» (cada povo com a sua cultura) e «Tribos sem
  nome — o modo clássico» (`js/ui.js` 918: «Tribos sem nome, como no começo de tudo: sem culturas históricas, sem traços
  especiais»). No `js/main.js` 61, `opts.classic` dá a cada povo `civ = null`; o prédio guarda `style = null`
  (`js/village.js` 101) e todas as tabelas caem em `'classico'`. É também o estilo de reserva de toda tabela de povo do jogo.
- **O que o deus e o 3D desenham dele** (`js/arch.js` `PAL.classico`, `js/forma.js`, `js/build3d.js`):
  - paredes creme (`#efe2c4`) com **o vigamento de madeira à vista** — os postes dos cantos, uma viga em cada andar e sob o
    beiral (`arch.js` 1149: «the timber frame»);
  - **telhado de duas águas íngreme** (inclinação 0,9) de telha de barro vermelha, em três cores nas casas;
  - **a chaminé** de pedra nas casas e no sobrado;
  - o templo de colunata (`templeGR('classico')`: «o do grego, como o deus o desenha agora»);
  - o palácio e o paço de pórtico; **a maravilha é um zigurate** de quatro andares com a escada na frente e o olho de ouro no
    alto (`forma.js` 361);
  - o monumento é **o obelisco** com o olho de ouro;
  - a torre de vigia é de madeira, como a nórdica;
  - o mercado tem toldos vermelho, azul e amarelo;
  - a administração tem seis colunas e a bandeira azul.
- **O que ele tem por dentro hoje:**
  - **o chão:** lajes no prédio nobre, lajota de barro no médio, terra no pobre (`build3d.js` 3320);
  - **as paredes:** a barra marrom (`DADO.classico`: 0,7 m, `[138,104,72]`) e o friso ocre;
  - **a madeira** marrom média (`movel3d.js` `WOOD`);
  - **o fogo:** a lareira «chaminé» (como o nórdico) e o lar da casa;
  - **os móveis:** quase todos os modelos são os do romano (`arte/blender/moveis_tabela.py`: banquinho, mesas, cadeira
    «cátedra», balcão, cama «lectus»). **O clássico não tem identidade própria por dentro.**
- **O resto do povo:**
  - bebe **cerveja** (`tavern.js` `DRINK.classico`);
  - escreve e pinta as tabuletas **no barro**, depois na madeira (`itens.js` `baralho.povo.classico`);
  - os mitos dele são **os Titãs** e os primordiais: Cronos, Gaia, Prometeu, Nix, Tifão, Atlas, Mnemósine (`cartas.js` 196);
  - a música é a pentatônica maior; o cumprimento é pelo antebraço; a moeda é «moeda»;
  - a festa dele é a da Colheita;
  - o túmulo dele, numa caverna, tem **«ossos pintados de ocre, colares e as suas ferramentas»** (`caves.js` 805);
  - o rebanho é de ovelha e vaca.

### 1.2 A âncora que proponho para o clássico: «a aurora das cidades»

O que o código já deu ao clássico tem um lugar na história: **o Neolítico da Anatólia e a Idade do Bronze do Egeu e da
Mesopotâmia** (de ≈ 7000 a ≈ 1200 a.C.). Cada traço casa com um sítio de verdade:

- **O zigurate** é o de Ur e de Babilônia.
- **As tabuinhas de barro** são o cuneiforme de Mari, Ebla, Hattusa, Ugarit e Nínive, e o Linear B de Pilos e Cnossos.
- **A parede com vigas de madeira à vista** é a construção das paredes minoicas, micênicas e hititas: pedra ou tijolo cru
  amarrados por vigas.
- **A telha de barro** é a «Casa das Telhas» de Lerna, c. 2500 a.C. (Caskey).
- **A chaminé:** a sala molhada 7 do palácio de Mari tem a base de um cano de fumaça (Mari, Missão Arqueológica Francesa).
- **A cerveja** é a dos sumérios, bebida de canudo de uma jarra comum.
- **Os Titãs** vêm dos mitos de sucessão do Oriente Próximo: o Cronos de Hesíodo tem par no Kumarbi hurrita-hitita.
- **O olho de ouro** do zigurate e do obelisco é o «Templo dos Olhos» de Tell Brak, com milhares de ídolos de olhos (Met
  Museum, c. 3700–3500 a.C.).
- **Os ossos pintados de ocre** são os enterros de Çatal Höyük, debaixo das plataformas da casa.

**Por que vale a pena:** o clássico ganha uma cara própria — os afrescos, o lar redondo do mégaron, os píthoi gigantes, os
arquivos de tabuinhas, o trono de gesso, os chifres de consagração e o machado duplo —, sem colidir com o grego, que fica no
grego das pólis dos séculos V e IV, nem com o romano. **Fica para o dono decidir;** abaixo, cada entrada do clássico usa esta
âncora: Mari, Ebla, Ur, Nínive, Hattusa, Cnossos, Pilos, Tera (Akrotiri), Lerna, Çatal Höyük e Kanesh.

### 1.3 O que existe nesses mundos (o que a decoração pode mostrar)

**Os bens que o jogo tem** (`ORIGEM.md` §2–§4):
- **a terra e a pedra:** a madeira, a pedra, a argila, a cerâmica, o tijolo, o adobe, o sal;
- **os metais:** o cobre, o estanho, o minério de ferro e o ouro; as armas e as ferramentas de bronze ou ferro (da forja), as
  joias (do ouro, pelo ourives), as moedas (pela coletoria);
- **o pano e a pele:** a lã e o tecido (só da lã), o couro, as peles e a pele rara, o couro exótico, a seda;
- **o que vem dos bichos:** o marfim, o chifre, as plumas, o óleo de baleia, o mel e a cera;
- **o que vem do campo:** o vinho, o azeite, as tâmaras, o cacau, as especiarias, o incenso;
- **o que vem do mar:** as pérolas e o coral;
- **para escrever:** o papiro (o junco da água doce) e o amate (a casca batida da figueira).

**Os combustíveis da luz:**
- o que o `atmos.js` já lê: **o azeite, o óleo e a cera**;
- a lamparina é de barro, de bronze ou de pedra (`atmos.js` 513).

**Não existem** (e por isso nada do que se segue pode aparecer sem uma fonte nova no mundo):
- **o papel** — só o papiro do egípcio (o junco da água doce: `O.junco`) e o amate do asteca;
- **a pólvora** (`saber.md`: o teto é a beira da pólvora);
- **o vidro na janela** — só com o vidro soprado, saber da era V (`interiores-2.md` §4 decisão 1);
- **a prata, o chumbo, o linho, o algodão**;
- **as pedras finas:** a obsidiana, o jade, a turquesa, o âmbar, o lápis-lazúli;
- **o mármore como bem próprio** (é «pedra»);
- **a cal, o betume, o natrão, os pigmentos minerais** — a ocre e o carvão aparecem só nas pinturas das cavernas;
- **o maguey** (o `ORIGEM.md` §6 C).

**O material de escrever de cada povo**, na ordem que o jogo já usa (`itens.js` `baralho.povo`):
- egípcio: papiro, madeira;
- asteca: amate, madeira;
- romano: cera e madeira;
- grego: barro (os óstracos e as pínakes), madeira;
- nórdico: madeira (as varetas rúnicas);
- clássico: barro (as tabuinhas), madeira.

**Isso muda a biblioteca romana e a grega:** na história elas eram de rolos de papiro importados do Egito; aqui não podem ser.
O §11 diz o que fica no lugar: as tabuinhas de cera em blocos, as folhas de madeira de Vindolanda, as placas de bronze das leis
e, com o saber V, o pergaminho do couro.

**Os buracos que estes interiores encontram** (para o arquiteto; nada disso existe hoje):

| | O que falta | Quem precisa | Fonte possível no mundo |
|---|---|---|---|
| 1 | **o linho** | o egípcio (toda a roupa, as velas dos barcos, os panos do templo: a lã era impura no templo, Heródoto II.81) | o campo de linho na beira do rio, como o junco |
| 2 | **o algodão** e **a fibra do maguey** (ixtle) | o asteca (as mantas, que eram moeda — o *quachtli* —, as couraças acolchoadas, os panos) | a plantação do chão quente; o agaval do `ORIGEM.md` §6 C |
| 3 | **a lã do próprio povo** | o egípcio e o asteca: o rebanho deles no jogo não tem ovelha (`E.HERDS`), e a tecelagem só nasce com ovelha ou lã comprada (`economy.js` 205); sem pano comprado, o `G.Atmos` diz que o povo não tece e não há tapete nem tapeçaria | os buracos 1 e 2 resolvem |
| 4 | **a cal** | o reboco branco brilhante de todos (o asteca polia o reboco até parecer prata) | a pedra queimada no forno da olaria |
| 5 | **os pigmentos** | os afrescos: a ocre vermelha e amarela (terra), o preto do carvão, o branco da cal, o azul egípcio (cobre e areia), o verde da malaquita (cobre), o vermelho da cochonilha (asteca), a púrpura (o caramujo, saber III) | a ocre e o carvão já se tiram nas cavernas; o azul pelo cobre que o povo teve |
| 6 | **o betume** | o chão molhado de Mari e de Ur, a calafetação | a nascente de betume — uma jazida rara |
| 7 | **a obsidiana** | o asteca (as lâminas, os espelhos, os gumes da *macuahuitl*) | uma jazida da rocha vulcânica, como o cobre |
| 8 | **a prata e o chumbo** | o nórdico (a moeda dele é «peça de prata»), os canos romanos, a mina do Láurio | uma jazida, como o ouro |
| 9 | **o ocote** (a lasca de pinho resinoso) | **o asteca não usava lamparina de óleo:** a luz era a tocha de ocote e o braseiro | é madeira: só falta a regra do `atmos.js` para o asteca |
| 10 | **o natrão** | o egípcio (lavar-se, o «sabão», o embalsamamento) | o sal das lagoas do deserto: uma variante do sal |

### 1.4 A assinatura de cada povo por dentro (o resumo para a arte)

**Romano.**
- **O chão:** o mosaico de tésseras nas casas ricas, preto e branco ou de cores; o *opus sectile* (placas de pedra colorida
  recortadas); a lajota e o *opus signinum* (argamassa de caco de telha, vermelha, com tésseras brancas) nas médias.
- **As paredes:** a fresco nos quatro estilos de Pompeia, em painéis vermelhos, amarelos e pretos com arquiteturas fingidas,
  paisagens, cenas de mito e a barra pintada imitando mármore. O vermelho comum é ocre queimada; o «vermelho pompeiano» de
  cinábrio era caríssimo (Plínio XXXIII).
- **O teto:** de caixotões de madeira, ou de estuque em abóbada.
- **Os móveis:** a cama-leito com cabeceiras de bronze (*fulcra*), a mesa de três pés (*delphica*), a mesa de pedra do átrio
  (*cartibulum*), a cadeira de espaldar (*cathedra*), o banquinho (*sella*), os armários (*armaria*) e as arcas.
- **A luz:** a lucerna de barro com desenho no disco, a de bronze pendurada, o candelabro alto de bronze, a lanterna de folhas
  de chifre (*laterna cornea* — e o jogo tem chifre).
- **Os cheiros:** o garo (o molho de peixe), o vinho, o azeite, o incenso do larário, a fumaça de lenha.
- **Os sons:** a água do implúvio e da fonte, o latim, os sininhos de bronze pendurados (*tintinnabula*).

**Grego.**
- **As paredes:** o reboco caiado, com a barra de baixo vermelha ou pintada imitando blocos de pedra (o «estilo de alvenaria»).
- **O chão:** de argamassa vermelha ou de mosaico de seixos — os de Pela, com tiras de chumbo nos contornos.
- **Os móveis:** o *klismos* (a cadeira de pernas curvas), a *klinê* (o leito de banquete), a *trapeza* (a mesinha baixa de três
  pés que se guarda debaixo do leito), a arca, o banquinho dobrável.
- **A cerâmica pintada** é a decoração: as figuras negras e vermelhas da cratera, do *kylix*, da hídria e do lécito.
- **O tear de pesos** fica no pátio ou na sala.
- **A luz:** a lamparina de barro (*lychnos*) e o braseiro portátil de barro.
- **Os cheiros:** o azeite, o vinho, o tomilho, o peixe, o incenso.
- **Os sons:** a lira e o *aulos* (a flauta dupla), a espada do tear batendo a trama, os pesos do tear tocando uns nos outros.

**Egípcio.**
- **As paredes:** o tijolo de barro cru rebocado de lama e branqueado, pintado. Na casa rica: os frisos de lótus e de
  *kheker*, a barra colorida embaixo. No palácio: os pântanos com patos no chão e os tetos de espirais e rosetas (Malkata,
  Amarna). No templo: o teto azul de estrelas amarelas e os abutres de asas abertas sobre o corredor do meio.
- **As colunas:** de madeira ou de pedra, com capitel de papiro ou de lótus pintado de verde, azul e vermelho.
- **Os móveis:** baixos; as cadeiras de pés de leão; os banquinhos dobráveis de pés de pato; a cama inclinada para os pés, com
  estribo e o **apoio de cabeça** (de madeira ou de marfim, com o deus Bes, que guarda o sono); as arcas de tampa abaulada; a
  esteira de junco.
- **A faiança azul-esverdeada:** as contas, as taças de lótus, os azulejos.
- **A luz:** pouca janela, alta e gradeada (contra o sol); a lamparina de barro com óleo e sal (Heródoto II.62, a festa das
  lâmpadas de Saís).
- **Os cheiros:** o incenso e a mirra, o *kyphi* (o perfume de queimar), o lótus, a cerveja, o pão, a lama do rio.
- **Os sons:** o sistro (o chocalho de Hathor), a harpa, as palmas no compasso, os gansos e os macacos da casa.

**Asteca.**
- **As paredes:** o adobe e a pedra vulcânica vermelha (*tezontle*) nas casas nobres, rebocados de cal e polidos — o branco
  que um batedor de Cortés tomou por prata em Cempoala (Díaz, cap. 45) —, com faixas pintadas de vermelho e de azul e os frisos.
- **Os assentos:** quase não há cadeira. Só o *icpalli*, o assento de junco de espaldar alto dos senhores, coberto de pele de
  onça. Para todos, a esteira (*petate*), que se enrola de dia.
- **Os móveis:** as arcas de junco trançado (*petlacalli*), os biombos de junco, os bancos baixos de madeira, o braseiro com
  copal.
- **Na cozinha:** as três pedras do fogo (*tenamaztli*) com o *comal* de barro, e o *metate* de pedra.
- **Os panos:** de algodão e de plumas, e o jogo tem plumas.
- **A luz:** a tocha de ocote e o braseiro; não há lamparina.
- **Os cheiros:** o copal, a pimenta torrada (a fumaça que faz tossir), o cacau, a tortilha no comal, as flores (os nobres
  andavam com um ramo para cheirar), a água dos canais.
- **Os sons:** o *teponaztli* (o tambor de fenda) e o *huehuetl* (o tambor de pé), o búzio, os chocalhos, as ocarinas, o
  náuatle e, antes de amanhecer, a pedra do *metate* moendo.

**Nórdico.**
- **A casa:** madeira de carvalho e de pinho, de tábuas verticais ou de pau-a-pique, ou de turfa (na Islândia), com o chão de
  terra batida.
- **Os bancos:** largos, de terra contida por tábuas, ao longo das paredes, para sentar e dormir.
- **O fogo:** o comprido no meio (*langeldr*); a fumaça sai pelos buracos do telhado, e não há chaminé.
- **A madeira entalhada** no estilo de bichos entrelaçados (Borre, Jelling, Mammen): os postes, os assentos, as portas.
- **Nas paredes:** a tapeçaria de lã nas festas (a de Oseberg, com a procissão de carroças), os escudos pendurados, as peles.
- **A luz:** o fogo, mais as lamparinas de pedra-sabão ou de ferro com óleo de peixe e de foca; a vela de cera é rara.
- **Os cheiros:** a fumaça (tudo cheira a fumaça), o peixe seco, o hidromel, o couro, o gado — o curral é a outra ponta da
  casa, e o calor dos bichos aquece —, a lã molhada, o alcatrão.
- **Os sons:** o fogo estalando, o pente do tear, o gado ruminando atrás da divisória, a lira, as peças do *hnefatafl* no
  tabuleiro, a chuva na turfa.

**Clássico (a aurora das cidades).**
- **As paredes:** o tijolo cru sobre o soco de pedra, com as vigas de madeira à vista; o reboco de cal pintado a fresco — os
  golfinhos, os lírios, os grifos, as procissões, o salto do touro.
- **O chão:** de gesso pintado em quadriculado (o de Pilos, com o polvo diante do trono).
- **O fogo:** o lar redondo e baixo no meio do mégaron, pintado de espirais e de chamas.
- **Os depósitos:** os píthoi da altura de um homem, com cordões em relevo.
- **Os sinais:** os chifres de consagração e o machado duplo.
- **Os assentos:** os bancos de gesso ao longo das paredes e o trono de gesso.
- **A escrita e o selo:** as tabuinhas de barro nas cestas com etiquetas de barro, os selos cilíndricos rolados no barro.
- **A luz:** as lamparinas de pedra de pé alto (minoicas), os braseiros, o lar.
- **Os cheiros:** a cerveja, o pão do forno de barro (*tannur*), o azeite, o cedro.
- **Os sons:** a lira (a lira de Ur com cabeça de touro; o tocador de lira do afresco de Pilos), o sistro, os tamboris.

---

## 2. O palácio — a sede de quem governa

Os quatro degraus da sede (`paco`, `palacio`, `grande_palacio`, `palacio_colossal`) pedem os mesmos cômodos em tamanhos
diferentes. Para cada povo vem primeiro a planta e o encadeamento, depois os oito espaços: **o trono e a audiência, o conselho,
o banquete, os aposentos, a administração e os escribas, o tesouro e os arquivos, a cozinha, os guardas.** No fim do capítulo
está **a Casa do Chefe** (o degrau pequeno) de cada povo.

### Romano — a Domus Flavia e a Domus Augustana no Palatino (Domiciano, 92 d.C.) e a Domus Aurea de Nero

- **Cômodos — a planta:**
  - **o lado público** (Domus Flavia) gira em volta de um grande peristilo, com uma fonte octogonal em labirinto no meio;
  - **num lado do peristilo:** a **Aula Regia**, que é a sala do trono e da audiência (≈ 30,5 × 38,7 m); com ela, a
    **basílica**, onde o imperador julgava sentado na abside, e o **larário** do palácio;
  - **no lado oposto:** a **cenatio**, o salão de banquete, com duas ninfeias de fontes ovais vistas pelas janelas;
  - **o lado privado** (Domus Augustana) gira em volta de peristilos próprios em dois níveis: um jardim afundado com tanque e
    ilha, e um «estádio» (um jardim em forma de circo).
- **O trono e a audiência:**
  - nas paredes, nichos com edículas de colunas, com **estátuas colossais de basalto verde** (≈ 3,5 m; um Hércules e um Baco
    achados em 1724, hoje em Parma);
  - o chão de *opus sectile*: o pórfiro vermelho, a serpentina verde, o amarelo antigo, o pavonazzetto roxo e branco;
  - o trono numa abside rasa no fundo, sobre um tribunal elevado (Univ. de Chicago / Coarelli);
  - a cada manhã, a *salutatio*: os clientes em fila desde a porta, e o *nomenclator*, o escravo que soprava ao senhor o nome de
    cada um.
- **O conselho:**
  - o *consilium principis* (os amigos e os juristas) reunia-se numa sala do palácio, com cadeiras e uma mesa;
  - o modelo da sala de deliberar é **a Cúria Júlia**: dois lances de degraus baixos ao longo das paredes compridas, para as
    cadeiras dos senadores; no fundo, o estrado dos que presidem, com as cadeiras curuis de pés cruzados; a estátua e o altar da
    Vitória; o chão de *opus sectile*; as portas de bronze.
- **O banquete:**
  - **o arranjo:** o *triclinium*, três leitos inclinados em volta de uma mesa baixa, três convivas em cada um, recostados no
    cotovelo esquerdo; o lugar de honra é o «consular»; o mosaico do chão é liso em U, onde ficam os leitos, e rico no meio;
  - **num palácio**, dezenas de triclínios no mesmo salão, as fontes à vista e pétalas de rosa no chão;
  - **a comida:** os arganazes no mel com papoula (Petrônio) e o garo.
- **Os aposentos:**
  - o *cubiculum*: a cama numa alcova ou sobre um estrado, as paredes pintadas;
  - na casa de Augusto, a «Sala das Máscaras», com máscaras de teatro pintadas, e o refúgio no alto que ele chamava de
    «Siracusa» (Suetônio, *Augusto* 72);
  - as coisas: os espelhos de bronze, os cofrinhos de marfim, os frascos de unguento, o banho particular (*balneum*).
- **A administração e os escribas:**
  - a chancelaria dos libertos: *a rationibus* (as contas), *ab epistulis* (as cartas), *a libellis* (as petições);
  - os *notarii*, que taquigrafavam;
  - o anel de sinete, para selar.
  - *No jogo, sem papiro:* as **tabuinhas de cera** em blocos de duas a dez placas, presas por cordões; as **folhas de madeira
    escritas a tinta**, dobradas em sanfona (como as cartas de Vindolanda); e as **leis em placas de bronze** pregadas nas paredes
    — no incêndio do Capitólio de 69 d.C. arderam três mil delas (Suetônio, *Vespasiano* 8).
- **O tesouro e os arquivos:**
  - o tesouro do Estado (*aerarium*) ficava **dentro do pódio do Templo de Saturno**;
  - o arquivo, no Tabulário;
  - em casa, a **arca de ferro** — madeira cintada e cravejada, presa ao chão do átrio (a Casa dos Vettii tinha duas);
  - as moedas em sacos selados.
- **A cozinha:**
  - **o fogo:** o fogão de alvenaria em bancada, com grelhas e trempes de ferro; o forno de pão;
  - **os panos de bronze:** os caldeirões; a *authepsa*, a chaleira de bronze que esquentava a água do vinho;
  - **as despensas:** as jarras de barro furadas para engordar arganazes (*gliraria*); as ânforas de garo e de vinho encostadas
    na parede;
  - **a gente:** o provador (*praegustator*).
- **Os guardas:**
  - a coorte pretoriana de serviço no palácio: dentro de Roma, sem armadura, de toga (a *cohors togata*), com a espada por
    baixo (o *New Pauly* diz que era roupa civil com as armas do lado);
  - a guarda germânica do corpo (*Germani corporis custodes*);
  - a senha do dia (*tessera*), que o imperador dava;
  - os porteiros escravos (*ostiarii*) e os lictores com os feixes.
- **Materiais e cores:**
  - os mármores coloridos: o vermelho do pórfiro, o verde da serpentina, o amarelo antigo;
  - o bronze dourado das portas e dos leitos;
  - os afrescos de fundo vermelho e preto;
  - os tetos de caixotões dourados;
  - o marfim nos móveis.
- **Luz:**
  - de dia, as janelas altas da Aula Regia, que o mármore polido devolve;
  - à noite, os candelabros de bronze de 1,5 m e as lucernas penduradas em cachos (*lychnuchi pensiles*);
  - na Domus Aurea, a sala octogonal com o óculo no alto.
- **Sons e cheiros:**
  - **os sons:** a água das ninfeias; o murmúrio contido da *salutatio*; o nomenclador soprando nomes; a lira e a flauta no
    banquete;
  - **os cheiros:** a rosa, o nardo, o açafrão, o incenso, o garo da cozinha.
- **Quem e o quê:**
  - o imperador; os clientes da manhã; os senadores;
  - os libertos secretários; os camareiros (*cubicularii*);
  - os pretorianos;
  - os cozinheiros; os músicos e os dançarinos do banquete;
  - os meninos escravos que servem o vinho.
- **De boca aberta:**
  1. As colossais de basalto verde nos nichos, quase do dobro de um homem.
  2. O salão de banquete de Nero, **redondo, que girava dia e noite como o céu**, e os tetos de painéis de marfim que se abriam
     para chover flores, com canos para borrifar perfume (Suetônio, *Nero* 31).
  3. Os pórticos de Domiciano **forrados de fengita**, uma pedra que espelhava, para ele ver quem vinha atrás (Suetônio,
     *Domiciano* 14).
- **No mundo do jogo:**
  - **o que já tem causa:** o bronze pela forja (cobre e estanho), o ouro pelo ouro tido, o marfim (`marfim`), a cera das
    tabuinhas (`cera`), o perfume pelas `especiarias` e o `incenso`;
  - **o que é só pedra:** as pedras de cor são «pedra» (a cor é do desenho);
  - **o buraco:** o cinábrio, que não existe (o vermelho é de ocre).

### Grego — o palácio de Aigai (Filipe II, c. 340 a.C.), a sala de Homero e, na pólis, o Pritaneu e a Tolo

- **Cômodos — a planta:**
  - **Aigai**, o maior prédio da Grécia clássica (refeito e aberto em 2024), gira em volta de um peristilo de colunas dóricas
    que chegam a ≈ 7,5 m;
  - **a entrada:** um propileu monumental, com um andar de cima;
  - **em volta do pátio:** os salões de banquete (*andrones*) de vários tamanhos, de chão de mosaico, e um santuário de
    Héracles Pátroos (Ephorate de Imathia; *Archaeology* 2024).
  - **Na pólis, quem governa não mora num palácio:**
    - o **Pritaneu** guarda o lar comum (*koinê hestia*), cujo fogo nunca apaga — o colono levava dele o fogo da cidade nova —,
      e ali comiam à custa da cidade os hóspedes e os homenageados;
    - na **Tolo** de Atenas, um prédio redondo, os prítanes de turno comiam juntos e um terço deles dormia ali (Aristóteles,
      *Constituição de Atenas* 44).
- **O trono e a audiência:**
  - o rei ou o tirano recebia num grande *andron*;
  - o trono (*thronos*) de madeira com marfim e ouro, o escabelo;
  - em Aigai, o túmulo de Eurídice guarda **um trono de mármore pintado**, com Hades e Perséfone numa quadriga e grifos.
- **O conselho:**
  - o **bouleutérion**: as fileiras de assento em degraus, em retângulo ou em ferradura, em volta do lugar de quem fala;
  - os altares de Zeus Boulaios e de Héstia Boulaia;
  - para sortear os juízes, o **kleroterion** — uma laje com fileiras de fendas para as fichas de bronze de cada cidadão e um
    tubo por onde caíam dados brancos e pretos.
- **O banquete:**
  - **o arranjo:** o *simpósio* no *andron* — a porta fora do meio, para caber mais um leito; os leitos (*klinai*) sobre a
    borda elevada de ≈ 0,9 m que corre nas paredes (sete na Casa das Muitas Cores, em Olinto); o chão de argamassa vermelha ou de
    mosaico de seixos (Universidade de Michigan, Projeto Olinto);
  - **o vinho e os vasos:** a **cratera** no meio, onde se mistura o vinho com água; os *kylikes*; as grinaldas;
  - **a gente:** o *simposiarca* decide a mistura; a tocadora de *aulos*;
  - **o jogo:** o **cótabo**, atirar a borra da taça num alvo de bronze.
- **Os aposentos:**
  - o *thalamos*;
  - os cômodos das mulheres no andar de cima, que não eram uma prisão: o trabalho delas ficava em volta do pátio;
  - as arcas; os espelhos de bronze de cabo em figura; os frascos de perfume (*alabastra*).
- **A administração e os escribas:**
  - o secretário do conselho (*grammateus*);
  - os decretos em estelas de pedra na ágora;
  - os **óstracos**, os cacos de barro do voto de ostracismo — **o material grego do jogo é o barro**;
  - o arquivo do Estado no **Metroon** da ágora.
- **O tesouro e os arquivos:**
  - os **tesouros** (*thesauroi*) de Delfos e de Olímpia, casinhas em forma de templo cheias de oferendas;
  - o *opistódomo* do Partenon, onde ficava o tesouro da Liga;
  - os inventários dos tesoureiros de Atena gravados em pedra: as coroas de ouro, as adagas persas, as taças.
- **A cozinha:**
  - os fogareiros portáteis de barro e os suportes de panela (achados na ágora de Atenas);
  - a panela (*chytra*);
  - o cozinheiro (*mageiros*) contratado para a festa;
  - em Olinto, a cozinha com o **cano de fumaça** (*kapnodokê*) e, ao lado, o banho com a banheira de barro.
- **Os guardas:**
  - os lanceiros do tirano (*doryphoroi*);
  - na Macedônia, os sete guarda-costas (*somatophylakes*) e os **pajens reais**, meninos nobres que dormiam à porta do quarto
    do rei e o guardavam à noite (Arriano IV.13).
- **Materiais e cores:**
  - o reboco branco com a barra vermelha;
  - o estuque pintado imitando blocos de pedra;
  - os mosaicos de seixos brancos e pretos (com o vermelho e o amarelo de seixos de cor);
  - o bronze; a madeira de cipreste das portas.
- **Luz:**
  - o pátio é a lanterna da casa: os salões abrem para ele;
  - à noite, as lamparinas de barro em suportes altos de bronze (*lychnouchoi*) e o braseiro.
- **Sons e cheiros:**
  - **os sons:** a lira, o *aulos* e os cantos de mesa (*skolia*);
  - **os cheiros:** o vinho com mel, o incenso, as grinaldas de murta e de rosa; o peixe assado.
- **Quem e o quê:**
  - o rei e a rainha (Macedônia), ou os prítanes (a pólis);
  - os companheiros (*hetairoi*); os pajens;
  - os embaixadores;
  - os escravos do banquete; os músicos.
- **De boca aberta:**
  1. Os mosaicos de seixos de Pela: a caça ao leão, com as tiras de chumbo desenhando os músculos, e a caça ao veado assinada
     **«Gnosis fez»**.
  2. **O fogo de Héstia que não apaga nunca**, no Pritaneu.
  3. O trono de mármore pintado de Aigai.
- **No mundo do jogo:**
  - **o que já tem causa:** os seixos e a pedra (sempre); o bronze (pela forja); os óstracos (a cerâmica quebrada da olaria);
  - **o buraco:** o chumbo dos contornos do mosaico, que não existe — o contorno sai em seixo escuro.

### Egípcio — o palácio de Malkata (Amenhotep III), o Grande Palácio de Amarna (Akhenaton), o de Merneptah em Mênfis

- **Cômodos — a planta:**
  - **a construção:** o tijolo cru, com pedra só nas soleiras, nos batentes e nas bases das colunas; colunas de madeira
    rebocadas e pintadas;
  - **o caminho até o trono:** do pátio à **sala hipostila** (de muitas colunas), dela à **sala do trono**, com o estrado no
    fundo; atrás, o apartamento do rei — o quarto, com a cama num nicho elevado, e o banheiro;
  - **em volta:** o *harém* (as suítes das mulheres reais), os pátios, os jardins com tanque;
  - **em Amarna, a Janela das Aparições:** um balcão entre o palácio de cerimônia e a residência, ligados por uma ponte sobre a
    Estrada Real.
- **O trono e a audiência:**
  - **o estrado** se sobe por uma rampa, e **o chão e os degraus são pintados com sírios e núbios amarrados**: a cada passo até
    o trono, o rei pisa nos inimigos (Malkata; Met Museum);
  - **o trono:** o de Tutancâmon, de madeira folhada a ouro, com os raios do Áton;
  - **o escabelo:** pintado com os Nove Arcos, os inimigos;
  - **acima:** o dossel com o friso de serpentes (*uraei*);
  - **a corte:** prosterna-se e «beija o chão»; dos lados do rei, os leques de plumas de avestruz nos cabos compridos.
- **O conselho:**
  - a sala do vizir, como a pinta o túmulo de Rekhmire: o vizir numa cadeira sobre um estrado baixo;
  - diante dele, **os quarenta rolos de couro da lei** abertos sobre esteiras (o texto dos «Deveres do Vizir»);
  - os funcionários em filas; os mensageiros; os peticionários chamados pela ordem de chegada.
- **O banquete:**
  - o túmulo de Nebamon: homens e mulheres em cadeiras e banquinhos;
  - **o cone de cera perfumada** sobre as perucas: em Amarna acharam-se cones de verdade, de cera, em enterros;
  - as flores de lótus na mão; as jarras de vinho enfeitadas de grinaldas;
  - a música: a harpa, a flauta dupla, o alaúde; as dançarinas;
  - os criados oferecendo colares de flores.
- **Os aposentos:**
  - a cama inclinada para os pés, com estribo, pés de leão e o **apoio de cabeça** com o deus Bes;
  - as arcas de roupa e de perucas;
  - as caixinhas de pintura dos olhos (os tubos de *kohl*, as paletas), os espelhos de bronze;
  - o banheiro: a laje de pedra onde se derrama a água, a parede contra os respingos, o ralo para um jarro;
  - Heródoto (II.95) conta que, contra os mosquitos, **os pescadores dormiam debaixo das próprias redes**.
- **A administração e os escribas:**
  - **os escribas:** de pernas cruzadas, a saia esticada servindo de mesa; a paleta com as duas pastilhas de tinta, a preta e a
    vermelha; os juncos, a vasilha de água;
  - **as coisas de escrever:** os rolos de **papiro**; as tábuas de escrever rebocadas;
  - **o patrono:** a estatueta do babuíno de Thot sobre a mesa do escriba;
  - **em Amarna, o «Lugar das Cartas do Faraó»:** ali se acharam centenas de **tabuinhas de barro em cuneiforme** — a
    correspondência estrangeira do Egito era de barro.
- **O tesouro e os arquivos:**
  - a «Casa Branca» (*per-hedj*), o tesouro;
  - o ouro pesado em *debens*, na balança;
  - **o selo de barro** em cada porta e em cada arca: o cordão e o torrão carimbado;
  - em Malkata, **milhares de etiquetas de jarra escritas a tinta** («vinho do Rio do Oeste, ano 30»), as provisões da festa
    jubilar do rei.
- **A cozinha:**
  - a padaria e a cervejaria do palácio (as maquetes do túmulo de Meketré): as fôrmas de pão aquecidas na brasa, a massa da
    cerveja em jarras;
  - o açougue do boi; os patos assando.
- **Os guardas:**
  - os **medjay** (a guarda núbia);
  - os escudeiros do rei; os **sherden** de Ramsés II, com o capacete de chifres;
  - o «porta-leque à direita do rei», um título alto;
  - os porteiros.
- **Materiais e cores:**
  - o reboco branco;
  - os pântanos pintados no chão;
  - os tetos de espirais e rosetas, com bucrânios e patos (Malkata);
  - as colunas verdes e vermelhas;
  - **a faiança** azul-esverdeada e o ouro;
  - em Medinet Habu, **ladrilhos de faiança com os inimigos estrangeiros** em cores vidradas.
- **Luz:**
  - as janelas altas com grades de pedra deixam cair fachos oblíquos;
  - à noite, as lamparinas de óleo e sal;
  - quase nenhum braseiro (o calor).
- **Sons e cheiros:**
  - **os sons:** o sistro; a harpa; o canto;
  - **os cheiros:** o *kyphi* e a mirra; o lótus; a cerveja; o ar úmido do tanque do jardim; os leques mexendo o ar.
- **Quem e o quê:**
  - o faraó; a rainha e as mulheres reais;
  - o vizir; os escribas;
  - os porta-leques; os anões da corte (estimados);
  - os embaixadores trazendo tributo: os de Keftiu, que são os cretenses, com os seus vasos; os núbios com girafas (o túmulo de
    Rekhmire);
  - os criados.
- **De boca aberta:**
  1. **O chão pintado de Amarna:** o tanque com peixes, os patos levantando voo do papiro, os bezerros saltando (o Museu do
     Cairo; Petrie).
  2. **O caminho do trono pintado de inimigos amarrados**, que o rei pisa.
  3. **A Janela das Aparições**, de onde o rei atira colares de ouro a quem ele honra.
- **No mundo do jogo:**
  - **o que já tem causa:** o papiro (o egípcio tem); o couro dos rolos da lei; as plumas dos leques; o marfim; o ouro;
  - **o buraco:** **o linho e a faiança não existem** — a faiança pede areia, natrão e cobre.

### Asteca — o palácio de Moctezuma II («as casas novas») e o de Axayácatl, em Tenochtitlan; o de Nezahualcóyotl em Texcoco

- **Cômodos — a planta:**
  - **a construção:** o *tecpan*, um conjunto de pátios e salas sobre uma plataforma; os pátios com fontes e jardins;
  - **o desenho de um códice** (o Códice Mendoza, fólio 69r): o senhor no trono, no alto, e o conselho dos juízes embaixo;
  - **as casas do palácio:**
    - os depósitos;
    - **o arsenal**, cheio de dardos, escudos e espadas de lâminas de pedra (Díaz descreve duas casas de armas);
    - **a Casa das Aves** e a das feras;
    - **a casa dos anões e dos corcundas** (Cortés, 2.ª carta);
    - o jardim das ervas que curam.
- **O trono e a audiência:**
  - **o assento:** o *icpalli*, de junco, de espaldar alto, coberto de pele de onça, sobre um estrado, com **um biombo** à frente;
  - **quem entra:** descalço e de manta grosseira — até os grandes senhores trocavam a roupa rica por uma pobre —, de olhos
    baixos e com três mesuras: «Senhor, meu senhor, meu grande senhor»;
  - **quem sai:** de costas, sem virar (Díaz, cap. 91); ninguém olha o rosto dele.
- **O conselho:**
  - o *tlatocan*, o grande conselho: os quatro grandes senhores e a *Cihuacoatl* (o segundo do reino);
  - o conselho da guerra;
  - o tribunal: os juízes sentados em esteiras, ouvindo as partes, e um pintor anotando o caso.
- **O banquete — a refeição de Moctezuma** (Díaz, cap. 91):
  - **os pratos:** trinta por refeição, com **braseirinhos de barro por baixo** para não esfriarem; mais de trezentos pratos
    para ele e mais de mil para a guarda;
  - **o biombo:** de madeira dourada, posto diante dele para ninguém o ver comer;
  - **as mãos:** quatro mulheres lhe davam água em cuias e toalhas;
  - **o fim:** os tubos pintados e dourados de tabaco com liquidâmbar; o chocolate espumado em taças de ouro e os anões e os
    acrobatas (o que repetem os livros que contam Díaz) **(a conferir no texto)**.
- **Os aposentos:**
  - os tetos de cedro e de outras madeiras cheirosas, bem lavradas (Díaz);
  - as esteiras e as mantas;
  - as arcas de junco (*petlacalli*);
  - as tapeçarias de plumas;
  - os espelhos de pirita e de obsidiana (*tezcatl*);
  - Moctezuma banhava-se todo dia (Díaz).
- **A administração e os escribas:**
  - os **pintores-escribas** (*tlacuiloque*), com pincéis, sobre o **amate** dobrado em sanfona e coberto de gesso;
  - os mordomos do tributo (*calpixque*), com o bastão e o leque;
  - **as listas do tributo** (a parte do Códice Mendoza): as cargas de mantas, os trajes de guerreiro de plumas, o cacau aos
    milhares, o ouro em pó, o copal, a borracha.
- **O tesouro e os arquivos:**
  - **o *petlacalco***, uma sala do palácio onde um mordomo guardava o milho da cidade e fazia as contas (um texto do séc. XVI
    sobre o palácio, na coleção digital da Universidade de Utah);
  - **o tesouro de Axayácatl:** os espanhóis acharam, nos aposentos que lhes deram, uma porta tapada de reboco fresco; atrás
    dela, o ouro, as joias, as plumas (Díaz).
- **A cozinha:**
  - as mulheres moendo milho no *metate* desde antes do amanhecer;
  - as centenas de tortilhas no comal;
  - os perus;
  - o peixe fresco da costa, que **chegava por corredores em revezamento** (Durán) **(a conferir)**.
- **Os guardas:**
  - os guerreiros águia e onça;
  - os senhores que serviam no palácio, nas salas ao lado dele, que também entravam descalços (Díaz).
- **Materiais e cores:**
  - o reboco de cal polido, de um branco que brilha;
  - a pedra vermelha (*tezontle*);
  - os frisos pintados de vermelho, azul e ocre;
  - as vigas de cedro e de cipreste;
  - as plumas verdes do quetzal e as azuis;
  - o ouro;
  - as peles de onça.
- **Luz:**
  - os pátios claros e as salas na meia-luz;
  - à noite, as tochas de ocote e os braseiros;
  - nos aposentos do rei, no frio, **uma brasa de casca de árvore que não fazia fumaça e cheirava bem** (Díaz, cap. 91).
- **Sons e cheiros:**
  - **os sons:** as aves da Casa das Aves; o búzio e o tambor que marcam as horas;
  - **os cheiros:** as flores, o copal, o cacau, a fumaça do tabaco com liquidâmbar, a água do lago.
- **Quem e o quê:**
  - o *huey tlatoani*;
  - a *Cihuacoatl*, os senhores do conselho, os juízes, os pintores;
  - os mordomos;
  - os guerreiros;
  - as mulheres da cozinha;
  - os cuidadores das aves — **trezentos** (Cortés);
  - os anões e os bufões.
- **De boca aberta:**
  1. **A Casa das Aves:** tanques de água doce e salgada para as aves de cada água, trezentos homens só para elas (Cortés, 2.ª
     carta).
  2. **O biombo de ouro** diante do rei que come, e os trinta pratos quentes nos seus braseirinhos.
  3. **O reboco que brilha como prata.**
- **No mundo do jogo:**
  - **o que já tem causa:** as plumas (`plumas`), o ouro, o cacau, as peles, o amate; o copal pode ser o `incenso` do jogo;
  - **o buraco:** o algodão, o jade (*chalchihuitl*), a obsidiana e a pirita não existem.

### Nórdico — o salão do rei e do jarl: Lejre, Uppsala, Borg (nas Lofoten), Tissø

- **Cômodos — a planta:**
  - **o salão:** quase todo é um salão só, de paredes arqueadas como um casco de barco (o feitio de Trelleborg), com as portas
    nas pontas ou no lado;
  - **o lugar de honra:** o banco alto no meio de uma parede comprida;
  - **a casa do rei é um sítio, não um prédio:** à volta, a casa do fogo (*eldhús*), o aposento das mulheres (*skemma*, ou
    *dyngja*), os depósitos, a forja, a casa de banho e, em Uppåkra e em Tissø, **uma casa de culto à parte, cercada**;
  - **os tamanhos:** o salão de Lejre, que a tradição liga ao Heorot do *Beowulf*, tem ≈ 48 m; o de Borg, 83 m, é uma casa de
    cinco cômodos.
- **O trono e a audiência:**
  - **o assento:** o **assento alto** (*öndvegi*), entre os **dois postes do assento alto** (*öndvegissúlur*), entalhados — com
    Thor, conta a tradição;
  - **os bancos:** em frente, o segundo assento de honra, do hóspede; ao longo dos bancos, os homens do jarl pela ordem da honra;
  - **o que se faz ali:** o jarl dá os anéis; o herdeiro, no banquete do funeral, só sobe ao assento do pai depois de beber o copo
    da promessa (*bragarfull*).
- **O conselho:**
  - a assembleia (*thing*) é ao ar livre: a **Pedra da Lei**, onde o recitador da lei dizia de cor um terço da lei a cada ano;
  - as **barracas de turfa**, cobertas de pano nas duas semanas da reunião;
  - as cordas em varas de aveleira (*vébönd*), que marcavam o lugar sagrado do tribunal;
  - no salão, o jarl ouvia os seus.
- **O banquete:**
  - **as mesas:** tábuas sobre cavaletes, postas diante dos bancos para comer e tiradas depois;
  - **para beber:** os **chifres**, que não se põem em pé, por isso se bebem até o fim; as taças de madeira; para os ricos, os
    copos de vidro em funil vindos do Reno (Birka);
  - **quem serve:** a dona da casa serve o primeiro chifre (a Wealhtheow do *Beowulf*; a mulher com o chifre das pedras pintadas
    de Gotland);
  - **o que se faz:** os juramentos de façanha sobre o copo; o escaldo; o *hnefatafl*; o duelo de insultos (*senna*);
  - **a comida:** a carne cozida no caldeirão ou no buraco de pedras quentes (*seyðir*).
- **Os aposentos:**
  - **a cama fechada** (*lokrekkja*), um armário de dormir só do dono e da dona; os outros dormem nos bancos (Hurstwic);
  - **as camas de Oseberg**, com cabeças de bicho nos pés;
  - os edredons de penugem;
  - a arca com fechadura e cintas de ferro;
  - a *skemma*, onde a dona trabalha e dorme.
- **A administração e os escribas:**
  - não há escriba nem arquivo: **a lei é memória**;
  - o administrador do sítio (*bryti*); o mestre das runas;
  - as varetas rúnicas de madeira (as de Hedeby: um nome, um recado, uma conta).
- **O tesouro e os arquivos:**
  - as arcas trancadas;
  - os anéis de braço;
  - a prata cortada (*hacksilver*), pesada na balança de dobrar;
  - os tesouros enterrados: o de Spillings, em Gotland — ≈ 67 kg de prata —, estava **debaixo do chão de uma casinha anexa**.
- **A cozinha:**
  - a casa do fogo: o buraco do fogo; o caldeirão pendurado na corrente da viga; as panelas de pedra-sabão;
  - a pedra de assar pão; as tinas de *skyr*;
  - **a carne defumando no alto, na fumaça do telhado**.
- **Os guardas:**
  - a *hirð* e os *húskarlar*, que dormem no salão, nos bancos, junto das armas penduradas;
  - o porteiro: no *Beowulf*, os guerreiros **deixam as lanças e os escudos à porta** do salão.
- **Materiais e cores:**
  - a madeira escura de fumaça;
  - os postes entalhados de bichos entrelaçados, pintados de vermelho, preto e amarelo (havia tinta nas peças de Oseberg);
  - as tapeçarias de lã vermelha e azul;
  - os escudos pintados;
  - as peles;
  - o bronze dourado e a prata.
- **Luz:**
  - o fogo comprido, que é a luz e o calor;
  - os buracos de fumaça no alto; as portas abertas de dia;
  - as lamparinas de pedra-sabão com óleo;
  - **as pontas do salão no escuro** — há dias em que a fumaça não deixa ver de uma ponta à outra (Hurstwic).
- **Sons e cheiros:**
  - **os sons:** o fogo; a lira; as risadas; **os cães debaixo dos bancos roendo ossos**; o vento no telhado;
  - **os cheiros:** a fumaça, a carne, a cerveja e o hidromel, a lã molhada.
- **Quem e o quê:**
  - o jarl;
  - a dona, com **as chaves na cintura** (o sinal de quem manda na casa);
  - a *hirð*; o escaldo; os hóspedes;
  - os escravos (*thralls*) servindo;
  - os cães.
- **De boca aberta:**
  1. **O fogo comprido do tamanho de um barco**, no meio de um salão de cinquenta metros.
  2. **Os postes do assento alto:** o primeiro colono da Islândia, Ingólfr, os atirou ao mar e fez a casa onde eles deram à
     praia (o *Livro da Colonização*).
  3. **As figurinhas de folha de ouro** (*guldgubbar*), do tamanho de uma unha, achadas nas valas e nos buracos dos postes do
     salão e da casa de culto (Uppåkra; Borg).
- **No mundo do jogo:**
  - **o que já tem causa:** a madeira, as peles, o tecido (o nórdico tem ovelha), o ouro das figurinhas, **o chifre dos chifres
    de beber** (`chifre`), o óleo das lamparinas (`oleo`);
  - **o buraco:** a prata e o vidro não existem (os copos de funil só pelo comércio ou pelo saber).

### Clássico — Mari (séc. XVIII a.C.), Pilos (séc. XIII a.C.), Cnossos, Ebla

- **Cômodos — a planta:**
  - **Mari:** ≈ 300 cômodos em dois hectares e meio.
    - **O pátio 106:** na parede sul, ao lado da porta das salas do trono, o afresco da **Investidura**: a deusa Ishtar dá ao rei
      a vara e o anel, entre **palmeiras que eram as do próprio pátio** (o Louvre; a Missão Francesa).
    - **A sala do pódio** e a sala do trono.
  - **Pilos — o caminho do mégaron:**
    - o propileu, o pátio, o pórtico, o vestíbulo;
    - **o mégaron** (≈ 13 × 11 m): no meio, o **lar redondo de 4 m** de diâmetro, de barro rebocado e pintado de espirais e
      chamas, com **quatro colunas** em volta segurando uma galeria ou o lanternim;
    - **o trono** encostado na parede direita, com um canal no chão ao lado, para as libações (Univ. de Cincinnati).
  - **Pilos — os outros cômodos:**
    - o **arquivo** junto da entrada;
    - a **despensa das 2.853 taças** de pé (*kylikes*);
    - os **depósitos de azeite**, com os píthoi engastados em bancos de barro;
    - o salão da rainha, com o seu lar;
    - o banheiro com a banheira de barro.
- **O trono e a audiência:**
  - **Pilos:**
    - o chão pintado em quadrados — em cada um, o mesmo padrão do vestíbulo, **menos o polvo pintado diante do trono**;
    - nas paredes, **leões e grifos** de cada lado do trono e o **tocador de lira**;
    - o rei (*wanax*) ao lado do fogo.
  - **Cnossos:**
    - uma sala pequena (≈ 6 × 4 m), **o trono de gesso** na parede norte;
    - bancos de gesso nos três lados; grifos pintados;
    - a «bacia lustral», um poço de degraus para a água de purificar;
    - na antessala, uma fileira de vasos de alabastro em forma de pão (Evans).
- **O conselho:**
  - nos bancos de gesso do mesmo salão (Cnossos);
  - entre os hititas, a assembleia do *panku*;
  - em Mari, o rei recebia no grande pátio da palmeira, diante das salas do trono **(a conferir)**.
- **O banquete:**
  - **em Mari:** a «mesa do rei» de cada dia anotada em tabuinhas — o pão, a carne, a cerveja, as tâmaras (Sasson);
  - **em Pilos:** as tabuinhas do banquete contam os bois e os carneiros, e **as taças aos milhares** são para brindar todos de
    uma vez;
  - **as tabuinhas Ta de Pilos:** o inventário dos móveis de uma cerimônia — mesas de pedra com incrustações, cadeiras com
    figuras de marfim nos espaldares, escabelos incrustados de homens e cavalos; e a trípode «de feitio cretense, com as pernas
    queimadas», a tabuinha que confirmou a decifração do Linear B.
- **Os aposentos:**
  - **em Cnossos, o «mégaron da rainha»:** o **afresco dos golfinhos**; ao lado, o banheiro com a banheira de barro e uma
    privada com escoamento de água;
  - **em Mari:** salas molhadas com o chão coberto de **betume**, e na sala 7 duas bacias de barro sobre a mesma base, uma
    privada de agachar e **a base de um cano de fumaça** (a Missão Francesa).
- **A administração e os escribas:**
  - **os arquivos:**
    - **Pilos:** o arquivo à entrada, com as tabuinhas em cestas de vime etiquetadas com etiquetas de barro, e os escribas
      conhecidos pela letra («a mão 1»);
    - **Mari:** ≈ 25.000 tabuinhas, as cartas dos reis;
    - **Ebla:** as tabuinhas em **prateleiras de madeira**, de pé, inclinadas para trás, a frente para fora, para se ler o
      começo de cada uma de relance, arrumadas por assunto (Matthiae, 1974–75);
  - **os selos:** os cilindros de pedra rolados no barro.
- **O tesouro e os arquivos:**
  - as portas dos depósitos fechadas com **o selo de barro**;
  - as tabuinhas que pesam o ouro e os vasos.
- **A cozinha:**
  - em Mari, as cozinhas com fornos e, numa salinha ao lado, **48 fôrmas de barro para bolos e pães**, com desenhos geométricos,
    de bichos e de gente (a Missão Francesa);
  - o forno de barro (*tannur*) onde o pão chato se cola à parede de dentro;
  - a cerveja na jarra comum.
- **Os guardas:**
  - entre os hititas, os **MEŠEDI**, a guarda do corpo do rei, que vigiava o portão e o pátio de lança (o «Protocolo da Guarda
    Real»);
  - em Pilos, os «seguidores» do rei (*e-qe-ta*), os oficiais de carro.
- **Materiais e cores:**
  - o gesso pintado e o reboco de cal;
  - os afrescos com o azul, o vermelho de ocre, o amarelo e o preto;
  - **o alabastro e o gesso translúcido** das soleiras e dos bancos de Cnossos;
  - as vigas de cedro e de cipreste;
  - o bronze; o marfim.
- **Luz:**
  - em Pilos, o lanternim sobre o lar das quatro colunas;
  - **em Cnossos, os poços de luz:** furos abertos do teto ao chão, que levam o dia aos cômodos de dentro;
  - as lamparinas de pedra de pé alto;
  - à noite, o lar.
- **Sons e cheiros:**
  - **os sons:** a lira; o sistro minoico;
  - **os cheiros:** **o azeite perfumado** — Pilos tinha a sua indústria: as tabuinhas Fr contam o azeite com sálvia, com rosa,
    com junça; o cedro; o pão; a cerveja.
- **Quem e o quê:**
  - o *wanax* (o rei) e o *lawagetas* (o chefe do povo);
  - os seguidores;
  - os escribas;
  - as tecelãs e as moedoras das tabuinhas, contadas em grupos;
  - os sacerdotes e as sacerdotisas;
  - o tocador de lira.
- **De boca aberta:**
  1. **O polvo pintado no chão diante do trono.**
  2. **A estátua da deusa do vaso que jorra** (Mari): a água subia por um canal dentro da pedra e saía do vaso nas mãos dela.
  3. **O poço de luz** de Cnossos e o trono de gesso entre os grifos.
- **No mundo do jogo:**
  - **o que já tem causa:** o barro das tabuinhas; a pedra (o gesso e o alabastro são «pedra»); o bronze; o marfim; o azeite;
  - **o buraco:** o betume e os pigmentos não existem.

### A Casa do Chefe (o degrau de 8 m) e o Paço (12 m), povo por povo

- **Romano — a Régia, a casa dos reis no Fórum:**
  - **a planta:** uma casa de três cômodos ao lado do templo de Vesta, que passou ao sumo pontífice;
  - **o que guardava:** os **escudos sagrados de Marte** (*ancilia*) e **as lanças de Marte**, que tremiam sozinhas quando vinha
    desgraça — os sacerdotes anotavam (Aulo Gélio IV.6);
  - **para o jogo:** o chefe romano recebe no átrio da sua *domus* (§6), sentado na cadeira do *tablinum*.
- **Grego — o mégaron de Homero:**
  - **o salão:** o lar no meio; a coluna onde se encosta o aedo; os assentos (*thronoi*) com escabelo;
  - **as armas:** as lanças no porta-lanças junto da coluna; as armas penduradas, enegrecidas pela fumaça do teto (*Odisseia*
    XIX);
  - **o arco:** guardado no depósito de dentro;
  - **de boca aberta:** Telêmaco, no palácio de Menelau, fica mudo diante do brilho do bronze, do ouro, do âmbar, da prata e do
    marfim, «como a corte de Zeus» (*Odisseia* IV.71).
- **Egípcio — a casa do nomarca ou do vizir:**
  - a vila de Nakht em Amarna: a sala central de quatro colunas com **o estrado do senhor**; as salas de receber na frente; os
    quartos atrás (Ricke).
- **Asteca — o *tecpan* do bairro (*calpulli*):**
  - a casa do chefe do *calpulli*, com a sala de reunião dos velhos e o depósito das coisas do bairro;
  - ao lado, o templo do bairro e a casa dos moços (*telpochcalli*).
- **Nórdico — o salão do *goði*, o chefe que é também sacerdote:**
  - **Hofstaðir**, na Islândia: um salão grande que servia de templo e de assembleia;
  - **de boca aberta:** **pelo menos 23 crânios de boi**, mortos com um golpe entre os olhos, ficaram anos **pendurados nas
    paredes de fora** — o desgaste é maior na frente que atrás (Lucas e McGovern, 2007).
- **Clássico — a Casa das Telhas de Lerna (c. 2500 a.C.):**
  - **a planta:** uma casa de corredor de dois andares (≈ 12 × 25 m), com os corredores laterais e as escadas;
  - **o telhado:** de telha de barro, com telhas de xisto no beiral;
  - **de boca aberta:** **as impressões de selo** de barro achadas aos montes num cômodo — as marcas de quem fechava os vasos e
    as arcas do chefe (Caskey; Heath).

---

## 3. A prisão (a `cadeia`: corredor, celas, pátio; 8 m)

**Um aviso que vale para todos:** na Antiguidade a prisão quase nunca era a pena. Era o lugar de **esperar** — o julgamento, a
execução, o resgate, a dívida paga — ou de **trabalhar à força**. A pena era a multa, o açoite, o exílio, a escravidão ou a
morte. Por isso o interior certo é **o da espera e do trabalho**, não o de uma penitenciária.

### Romano — o Cárcere e o Tullianum (no Fórum, sob o Capitólio); o *ergastulum* das fazendas

- **Cômodos:**
  - **o *carcer*:** uma sala de cima, trapezoidal, de blocos de tufo, com **um buraco redondo no chão**;
  - **o *Tullianum*:** embaixo, uma câmara redonda de abóbada baixa, a ≈ 6,5 m sob a rua, que nasceu como **cisterna de uma
    fonte**;
  - **fora:** as **escadas Gemônias**, por onde se arrastavam os corpos;
  - **no campo, o *ergastulum*:** o porão onde os escravos castigados dormiam acorrentados, «com janelas estreitas, tão altas
    que não se alcançam com a mão» (Columela I.6.3).
- **Coisas:**
  - as correntes (*catenae*), os grilhões dos pés (*compedes*), a argola do pescoço;
  - o **cepo de madeira com furos** para os pés (*nervus*);
  - a corda do carrasco;
  - na custódia militar, **uma corrente só que prende o preso ao soldado** — «a mesma corrente liga o guarda e o preso» (Sêneca,
    *Cartas* 5.7).
- **Materiais e cores:**
  - a pedra cinza-esverdeada do tufo, úmida, com a crosta da água;
  - o chão de pedra molhada.
- **Luz:**
  - nenhuma no Tullianum, a não ser o disco do buraco;
  - a tocha de quem desce.
- **Sons e cheiros:**
  - a água pingando da fonte;
  - Salústio: «doze pés debaixo da terra, cercado de paredes, fechado por uma abóbada de pedra; o abandono, o escuro e o fedor o
    fazem horrível de ver» (*Catilina* 55);
  - em cima, o barulho do Fórum.
- **Quem e o quê:**
  - os *tresviri capitales* (os magistrados das prisões e das execuções); o carrasco (*carnifex*); o guarda;
  - os que esperam a morte:
    - os conspiradores de Catilina, estrangulados ali em 63 a.C.;
    - o rei Jugurta;
    - Vercingetórix, guardado seis anos para o triunfo.
- **De boca aberta:**
  1. **O buraco no chão por onde o condenado era descido.**
  2. **A corrente que liga o preso ao soldado.**
  3. **A fila de escravos acorrentados uns aos outros** saindo do *ergastulum* para a lavoura ao amanhecer.

### Grego — o *desmotérion* de Atenas e as pedreiras de Siracusa

- **Cômodos:**
  - o candidato mais citado para o cárcere de Atenas, junto da ágora, é o **«Prédio de Poros»** (a identificação é incerta):
    - um corredor comprido;
    - oito salas, cinco de um lado e três do outro, que seriam as celas;
    - numa sala da ponta, um grande jarro de água (Topostext; Pleiades);
  - o pátio;
  - a sala onde Sócrates se banha antes de beber o veneno (*Fédon* 116a).
- **Coisas:**
  - **o cepo** (*xylon*), as cadeias dos pés;
  - o catre;
  - o jarro d'água;
  - **o almofariz** onde o servo do carcereiro moía a cicuta, e a taça.
- **Materiais e cores:**
  - a pedra porosa (*poros*), amarelada;
  - o reboco branco gasto;
  - o chão de terra batida.
- **Luz:**
  - as frestas e a porta para o pátio;
  - a lamparina de barro dos visitantes.
- **Sons e cheiros:**
  - os amigos esperando à porta desde o amanhecer, até o carcereiro abrir (*Fédon* 59d);
  - o choro das mulheres;
  - o cheiro da água parada e da palha.
- **Quem e o quê:**
  - **os Onze** (*hoi hendeka*), os magistrados que cuidam do cárcere e das execuções;
  - o carcereiro, um escravo público;
  - os presos:
    - os devedores do Estado;
    - os que não pagam a multa;
    - os condenados à morte;
  - os parentes que trazem a comida.
- **De boca aberta:**
  1. **Sócrates, solto das cadeias, esfrega a perna e diz como o prazer vem colado à dor** (*Fédon* 60b).
  2. **As pedreiras de Siracusa** (Tucídides VII.87): os atenienses presos ao ar livre no fundo da pedreira, setenta dias, o sol
     de dia e o frio de noite, com uma cótila de água e duas de grão por dia, os mortos empilhados entre os vivos; e a «Orelha de
     Dionísio», a gruta de eco por onde, diz a lenda, o tirano ouvia os presos.
  3. **Hegesístrato preso no cepo cintado de ferro corta o próprio pé para fugir** (Heródoto IX.37).

### Egípcio — a «Grande Prisão» (*khenret wer*) de Tebas e a fortaleza de Tjaru

- **Cômodos** (o papiro Brooklyn 35.1446):
  - um **cartório** para registrar os condenados;
  - uma **sala de julgamento**;
  - as **celas** de quem espera o julgamento ou a pena;
  - o **lugar de cumprir as penas**;
  - em volta, o pátio e os campos e oficinas do trabalho forçado.
- **Coisas:**
  - **os registros em papiro:** o nome, a falta, «o que foi feito»;
  - **as algemas de madeira**: uma tábua com dobradiça que prende os dois pulsos, às vezes em forma de peixe ou de bicho, como as
    dos cativos dos relevos **(a conferir)**;
  - o bastão das surras («cem golpes e cinco feridas abertas», a fórmula das sentenças);
  - as cordas.
- **Materiais e cores:**
  - o tijolo cru rebocado de lama, sem pintura;
  - as janelas pequenas e altas;
  - o pátio de terra.
- **Luz:** o pátio ofuscante e as celas escuras.
- **Sons e cheiros:**
  - o chamado da lista;
  - o estalo do bastão;
  - o barro e o suor.
- **Quem e o quê:**
  - o chefe da prisão, os escribas, os medjay;
  - os presos:
    - os **fugitivos da corveia** (o trabalho devido ao Estado);
    - os ladrões de túmulos, interrogados «com o bastão», nas mãos e nos pés (os papiros Abbott e Amherst).
- **De boca aberta:**
  1. **As famílias dos fugitivos da corveia ficavam detidas na Grande Prisão até eles voltarem** (o papiro Brooklyn;
     Hayes) **(a conferir o pormenor)**.
  2. **A confissão dos ladrões do túmulo de um rei** lida em voz alta: «abrimos os caixões… achamos a múmia do deus» (o papiro
     Amherst).
  3. **O nariz cortado e o exílio em Tjaru**, a fortaleza da fronteira, para o funcionário corrupto (o decreto de Horemheb).

### Asteca — o *cuauhcalli* (a «casa de madeira») e a casa dos cativos

- **Cômodos:**
  - **o *cuauhcalli*:** uma casa escura com jaulas de troncos grossos para os condenados à morte, que comem pouco (o glifo do
    Códice Florentino mostra a jaula de madeira; Durán fala de jaulas e câmaras de madeira para escravos e castigados);
  - **o *teilpiloyan*** («onde se prende a gente»): o cárcere das faltas pequenas e dos devedores — o nome está em Sahagún
    **(a conferir)**;
  - **os cativos da guerra** não iam para a jaula: moravam na casa do bairro (*calpulco*) do guerreiro que os pegou, até a festa
    do sacrifício.
- **Coisas:**
  - a jaula de troncos amarrados;
  - **a coleira de madeira com argolas atrás**, por onde passa uma vara, para o escravo não fugir pelo meio da gente nem por
    passagens estreitas;
  - as cordas de fibra;
  - as esteiras.
- **Materiais e cores:**
  - a madeira escura dos troncos;
  - o adobe;
  - o chão de terra.
- **Luz:** quase nenhuma — a casa é feita para o escuro.
- **Sons e cheiros:**
  - o lago perto;
  - a fumaça de ocote do guarda;
  - nas casas dos cativos, o tambor dos ensaios da festa.
- **Quem e o quê:**
  - os guardas;
  - os condenados (o adúltero, o ladrão grande, o bêbado contumaz plebeu);
  - **os cativos de guerra (*malli*)**, vestidos e alimentados, mostrados ao bairro;
  - os escravos postos à venda.
- **De boca aberta:**
  1. **A jaula de troncos dentro de uma casa sem luz.**
  2. **O cativo chama o seu captor de «pai» e é chamado de «filho amado»**, e o captor não come da carne do seu cativo
     (Sahagún, livro II).
  3. **A coleira com a vara atravessada.**

### Nórdico — não há prisão: há o ferro, o resgate e o exílio

- **Cômodos:**
  - nenhum prédio de prisão;
  - **o cativo fica num canto do salão, no depósito ou na casa dos escravos (*thralls*)**, com os pés presos;
  - os mercados de gente (Dublin, Hedeby) usam a tenda e o barco.
- **Coisas:**
  - **os grilhões de ferro e a argola do pescoço** — achados raros, porque o ferro era caro e **o mais comum era a corda, que
    não dura** (Historiska Museet, Estocolmo);
  - o tronco de prender os pés aparece nas leis medievais da Noruega e da Islândia **(a conferir)**.
- **Materiais e cores:** a madeira escura, a turfa, o ferro preto.
- **Luz:** o fogo do salão do outro lado da divisória.
- **Sons e cheiros:**
  - **os sons:** o gado e a conversa do salão;
  - **os cheiros:** a fumaça e o esterco.
- **Quem e o quê:**
  - os cativos de saque, à espera do resgate ou da venda;
  - os escravos por nascimento, por dívida ou por crime (o Museu Nacional da Dinamarca);
  - **o fora da lei:**
    - o fora da lei pleno, o «homem da floresta» (*skógarmaðr*), que qualquer um pode matar e ninguém pode abrigar;
    - o menor, que tinha três anos para sair da terra.
- **De boca aberta:**
  1. **A sentença que não tem paredes:** o homem fora da lei vivendo sozinho no mato.
  2. **O resgate:** o arcebispo de Cantuária, preso pelos dinamarqueses em 1012, recusou que pagassem por ele e foi morto num
     banquete **a golpes de ossos de boi** (a *Crônica Anglo-Saxã*).
  3. **A argola de ferro no pescoço**, presa a uma corrente no poste da casa.
- **No mundo do jogo:** a cadeia nórdica é a **casa dos ferros** — um depósito de madeira com um poste e as correntes —, não
  um corredor de celas.

### Clássico — a casa da guarda e o poço

- **Cômodos:**
  - **nenhuma prisão de pedra foi achada** na Mesopotâmia antiga: a detenção servia para cobrar (a dívida, o trabalho que se
    deve), e a palavra mais comum é «guarda» (*ennuĝ*) (J. N. Reid, 2017);
  - o lugar é **uma sala junto do portão do palácio**, com o guarda, ou **o poço** — a cisterna seca para onde se desce o preso
    por cordas; o Tullianum romano também nasceu cisterna.
- **Coisas:**
  - os grilhões de cobre ou de bronze;
  - **o cepo do pescoço** (a canga de madeira dos cativos dos relevos assírios);
  - **a mó de moer** — o preso trabalhava moendo o grão;
  - a tabuinha da dívida.
- **Materiais e cores:**
  - o tijolo cru;
  - o fundo do poço de lama;
  - a madeira da canga.
- **Luz:** o quadrado do céu no alto do poço.
- **Sons e cheiros:**
  - a mó de pedra raspando, que nunca para;
  - a lama.
- **Quem e o quê:**
  - o guarda;
  - os presos:
    - os devedores;
    - os fugitivos do trabalho;
    - os cativos de guerra.
- **De boca aberta:**
  1. **A rede do deus:** na Estela dos Abutres (Lagash, c. 2450 a.C.) os inimigos estão presos numa grande rede que o deus
     Ningirsu segura.
  2. **Descido por cordas na cisterna**, onde não havia água, só lama, e o preso afundava (*Jeremias* 38.6).
  3. **O preso cego girando a mó na casa da prisão** (*Juízes* 16.21).

---

## 4. O porto: o cais, a doca, a alfândega, o armazém e o estaleiro

A doca do jogo não tem planta, e a alfândega não existe como tipo. Aqui vai o conjunto do porto de cada povo, com o armazém
(`storehouse`) e o estaleiro, que é **a doca do nórdico** (`bnames.doca = 'Estaleiro'`). O celeiro de grão vem no §9.

### Romano — Óstia e Porto; o Empório de Roma; os *horrea*

- **Cômodos:**
  - **o cais:** de pedra, com **os blocos de amarração de travertino furados**, com os degraus e as rampas;
  - **a *statio* da alfândega:** os cobradores (*portitores*) abrem os fardos e cobram a *quadragesima* (2,5% na Gália);
  - **a Praça das Corporações** de Óstia: um pórtico duplo em volta de um jardim, com **as salinhas** (*stationes*) **das
    corporações** — os armadores (*navicularii*) e os negociantes de cada porto do império —, cada uma com o seu mosaico no chão
    (Parque Arqueológico de Óstia);
  - **os *horrea*** (os armazéns): salas em volta de um pátio, em dois andares, de paredes grossas, com **janelas em fresta** e,
    nos de grão, **o chão suspenso sobre pilaretes** para ventilar; na porta dos *Horrea Epagathiana*, o portal de tijolo com
    colunas e frontão e os encaixes das trancas;
  - **a sala dos medidores do grão** (*mensores frumentarii*);
  - em Roma, **o Empório** junto do Tibre, com o pórtico Emiliano (de ≈ 487 m) e, atrás, **o monte das ânforas** (o Testaccio).
- **Coisas:**
  - **as ânforas:** as de azeite e as de vinho, deitadas em espinha de peixe ou de pé na areia; os dólios;
  - **os pesos e as medidas:** as balanças (a *statera*, de braço e peso corrido); os pesos de pedra e de bronze; **o módio de
    bronze** (a medida do grão) e a régua de rasar (*rutellum*);
  - **a carga:** os sacos;
  - **o guindaste de roda:** a «grande roda», onde homens andam por dentro (Vitrúvio X.2);
  - **o navio:** as âncoras; a carranca do cisne na popa dos navios.
- **Materiais e cores:**
  - o tijolo (*opus testaceum*) e o tufo em rede;
  - o travertino branco;
  - a madeira alcatroada;
  - o vermelho das telhas.
- **Luz:**
  - o sol do cais;
  - dentro dos *horrea*, o escuro cortado pelas frestas — não se acende fogo perto do grão.
- **Sons e cheiros:**
  - **os sons:** as gaivotas; o latim, o grego e o púnico; o ranger do guindaste; o canto dos carregadores em compasso;
  - **os cheiros:** o pó do trigo, a borra do vinho, o garo, o piche, o mar.
- **Quem e o quê:**
  - os armadores e os negociantes;
  - os medidores do grão;
  - **os carregadores de sacos** (*saccarii*), em fila pela prancha;
  - **os mergulhadores** (*urinatores*), uma corporação que tirava a carga caída no fundo do porto;
  - os guardas dos armazéns (*horrearii*);
  - os cobradores.
- **Estaleiro:**
  - os *navalia*, os galpões das galeras;
  - o casco montado tábua a tábua, com os encaixes de espiga (*mortise and tenon*);
  - o piche e o calafate.
- **De boca aberta:**
  1. **Os mosaicos das corporações:** os navios, o farol, os peixes, as ânforas, **o elefante da corporação de Sabratha** — o
     império inteiro no chão de uma praça.
  2. **O monte Testaccio:** um morro feito só de cacos de ânforas de azeite (dezenas de milhões), em terraços, com cal por cima
     contra o cheiro.
  3. **Os navios de Nemi** (de Calígula): o casco forrado de chumbo, os chãos de mosaico, as argolas de bronze com cabeças de
     leão.
- **No mundo do jogo:**
  - **o que já tem causa:** o vinho, o azeite e o grão (os bens); o bronze do módio;
  - **o buraco:** o chumbo não existe — o selo de chumbo dos fardos vira **o selo de barro**.

### Grego — o Pireu

- **Cômodos:**
  - **os três portos:**
    - o Cântaro, o do comércio, com o **empório** e os seus cinco pórticos — um deles **o Pórtico Longo**; outro, o mercado da
      farinha (*Alphitopolis*), que há quem diga ser o mesmo;
    - Zea e Muníquia, os da guerra.
  - **os galpões de trirremes** (*neosoikoi*): as inscrições do séc. IV a.C. contam 196 em Zea, 82 em Muníquia e 94 no Cântaro;
    cada um uma rampa comprida (≈ 40 × 6 m) de rocha que desce à água, coberta por um telhado, com colunas entre os vãos, aberta
    para o mar (o Zea Harbour Project);
  - **o arsenal de Fílon** (*skeuothêkê*, séc. IV a.C.): um salão comprido de três naves com colunatas, onde cada navio tem a
    sua prateleira e o seu armário (a inscrição IG II² 1668 dá as medidas);
  - **o *Deigma*:** o salão das amostras — o mercador mostra ali um punhado do que tem no porão, e os banqueiros sentam às suas
    mesas (*trapezai*).
- **Coisas:**
  - **o navio:** as trirremes em seco nos galpões, de proa para o mar; os 170 remos de cada uma; as velas e o cordame
    enrolados nas prateleiras do arsenal;
  - **os olhos de mármore das proas** (*ophthalmoi*), achados em Zea; o esporão de bronze;
  - **a carga:** as ânforas do trigo e do vinho; as balanças;
  - **o dinheiro:** **as mesas dos banqueiros**, com os pratos de moedas.
- **Materiais e cores:**
  - a pedra do Pireu, amarelada;
  - a madeira de pinho e de abeto;
  - o piche preto dos cascos;
  - os olhos pintados.
- **Luz:** os galpões compridos na penumbra, claros só no fim que dá para a água.
- **Sons e cheiros:**
  - **os sons:** as enxós e os martelos; o mercador gritando a carga;
  - **os cheiros:** o piche, o cânhamo, o mar, a farinha.
- **Quem e o quê:**
  - os mercadores e os donos de navio;
  - os banqueiros;
  - **os cobradores da *pentekostê*** (o imposto de 2% de tudo o que entra e sai, arrendado a quem o cobrava; Andócides I.133);
  - os inspetores do empório;
  - os carpinteiros navais; os trierarcas; os remadores.
- **A lei do grão:** dois terços do trigo descarregado no Pireu tinham de subir à cidade.
- **De boca aberta:**
  1. **A fileira de galpões, cada um com uma trirreme dormindo dentro**, as proas viradas para a água.
  2. **Os olhos de mármore** que davam vista à proa.
  3. **O *Deigma*:** um salão cheio de punhados de trigo, de lã, de vinho em taças — o porto inteiro em amostra.

### Egípcio — o cais de Tebas e de Karnak, Perunefer (Mênfis), Elefantina, a foz (Tônis e Náucratis)

- **Cômodos:**
  - **os cais:**
    - o de pedra, com degraus até a água;
    - **o cais em T de Karnak**, com a rampa e a avenida de esfinges;
  - **as lojas de tijolo de abóbada comprida** (os depósitos do Ramesseum, dezenas de galerias lado a lado);
  - **o escritório dos escribas** à porta;
  - **na foz, a alfândega:** o decreto de Nectanebo I (380 a.C.), achado em Náucratis e no fundo do mar em Tônis-Heracleion,
    manda dar **ao templo de Neit um décimo do ouro, da prata, da madeira, da madeira lavrada e de tudo o que vem do «mar dos
    gregos»** (Goddio; Lichtheim);
  - **no sul, a fronteira do rio:** a estela de Semna (Senusret III) proíbe todo núbio de descer o rio, de barco ou por terra,
    a não ser para comerciar em Iken.
- **Coisas:**
  - **os barcos:** os de feixes de papiro; os de carga de madeira, com a cabine e o remo de leme;
  - **a balança** de pesar o ouro em anéis;
  - **a carga:** os sacos de grão; **as jarras com a etiqueta escrita a tinta**; os rolos de papiro das listas;
  - **o nilômetro:** a escada de pedra com as marcas da altura das cheias (Elefantina).
- **Materiais e cores:**
  - o tijolo cru; o calcário e o arenito;
  - a madeira de acácia, de sicômoro e **o cedro vindo do Líbano**;
  - as velas brancas.
- **Luz:**
  - o sol duro;
  - a sombra dos toldos de folha de palmeira;
  - o escuro fresco das abóbadas.
- **Sons e cheiros:**
  - **os sons:** o canto dos barqueiros; o bastão do capataz;
  - **os cheiros:** a lama do rio, o peixe, o papiro, o pó do grão.
- **Quem e o quê:**
  - os escribas do tesouro e do celeiro, contando cada saco;
  - o «chefe dos barcos»; os carregadores;
  - os mercadores sírios: no túmulo de Kenamon, **navios sírios descarregam em Tebas e mulheres egípcias vendem em barracas no
    próprio cais**.
- **Estaleiro:**
  - os carpinteiros do túmulo de Ti (Sacará), com enxós, serras e arcos de pua;
  - o barco de Quéops: **43 m de cedro, 1.224 peças costuradas com cordas**, sem um prego;
  - a base naval de Perunefer, em Mênfis.
- **De boca aberta:**
  1. **O nilômetro**, a escada que mede a fartura do ano.
  2. **A barca de Hatshepsut levando dois obeliscos** de uma vez, puxada por fileiras de barcos de remo (o relevo de Deir
     el-Bahari).
  3. **O mercado no cais** com os navios estrangeiros de proa alta.
- **No mundo do jogo:**
  - **o que já tem causa:** o papiro, o grão, o ouro;
  - **o buraco:** o linho das velas não existe (a vela seria de lã: só por compra).

### Asteca — o embarcadouro: os canais de Tenochtitlan e de Tlatelolco

- **Cômodos:**
  - **os desembarques:** de degraus, na beira dos canais, junto dos mercados e dos bairros;
  - **as calçadas:** as que ligam a ilha à terra, com **pontes de madeira que se tiram** à noite e na guerra;
  - **os depósitos do tributo** (*calpixcalli*);
  - **a casa dos juízes do mercado**, junto do desembarque de Tlatelolco;
  - **não há alfândega:** o que entra é o tributo dos mordomos e a taxa do mercado.
- **Coisas:**
  - **as canoas:** escavadas num tronco só, de fundo chato, levadas a vara e a remo;
  - **os carregadores** (*tlamemeh*): a **correia de testa** (*mecapalli*) e a carga nas costas — não há roda nem bicho de
    carga;
  - **a carga:**
    - as cestas e as esteiras;
    - **o cacau contado por oito mil grãos** (o *xiquipilli*); a carga inteira, três *xiquipilli*;
    - **as mantas de algodão (*quachtli*) em fardos de vinte**, que eram moeda.
  - **não se pesa nada:** «vendem tudo por conta e por medida; até agora não se viu vender coisa alguma por peso» (Cortés, 2.ª
    carta).
- **Materiais e cores:**
  - a madeira, o junco, o adobe;
  - a pedra vermelha;
  - o reboco branco;
  - a água verde do lago.
- **Luz:**
  - o brilho do lago;
  - a sombra dos toldos de esteira.
- **Sons e cheiros:**
  - **os sons:** a vara batendo na água; os gritos; as aves aquáticas;
  - **os cheiros:** o lago — as algas, e **o *tecuitlatl***, a espirulina que se colhia com redes finas e se secava em bolos —,
    o peixe, o mercado.
- **Quem e o quê:**
  - os canoeiros; os carregadores;
  - **os mercadores de longa distância (*pochteca*)**;
  - os mordomos do tributo;
  - os pescadores, os salineiros.
- **Estaleiro:** a canoa nasce de um tronco só, escavado com fogo e enxó.
- **De boca aberta:**
  1. **As pontes das calçadas que se tiram**, e a cidade vira ilha de novo.
  2. **Um mercado sem balança.**
  3. **Os bolos verdes de espirulina secando ao sol** na beira do lago.
- **No mundo do jogo:**
  - **o que já tem causa:** o cacau;
  - **o buraco:** o algodão das mantas não existe.

### Nórdico — o *naust* (a casa dos barcos), o estaleiro; os cais de Hedeby e de Birka

- **Cômodos:**
  - **o *naust*:** um galpão comprido e estreito, de paredes de pedra e de turfa em três lados, aberto ou com portão no lado do
    mar, com o chão descendo à praia;
  - **os tamanhos e os números:**
    - mais de 800 fundações de *naust* registradas na Noruega, a maioria dos anos 200 a 800;
    - quase sempre de mais de 20 m, os «monumentais» de 25 a 39 m por dentro;
    - **o de Stend, perto de Bergen, com 32 m e duas lareiras dentro** (*sciencenorway*; Universidade de Tromsø);
  - **o estaleiro:** a praia aberta, com os cepos da quilha e a rampa;
  - **o cais de Hedeby:** píeres de estacas que avançam na baía, alargados de fase em fase desde c. 865, que **eram também o
    chão do mercado** (Kalmring).
- **Coisas:**
  - **o navio:** o barco em cima dos roletes; os remos em fila na parede; **a vela de lã** enrolada;
  - **o cordame de couro de morsa** — o melhor, diz Ohthere ao rei Alfredo;
  - **o alcatrão:** os barris do alcatrão de pinho, fervido em covas;
  - **a obra:** os cestos de rebites de ferro; os machados, as verrumas;
  - as âncoras de ferro.
- **Materiais e cores:**
  - o carvalho rachado em tábuas (pela fibra, não serrado);
  - o pinho;
  - o alcatrão negro;
  - o ferro dos rebites;
  - a turfa;
  - a lã vermelha e branca da vela, em xadrez.
- **Luz:**
  - o lado do mar claro e o fundo escuro;
  - as lareiras;
  - o reflexo da água no casco.
- **Sons e cheiros:**
  - **os sons:** as ondas; **o martelo batendo o rebite sobre a arruela** (o «clinch» do costado); o machado;
  - **os cheiros:** o alcatrão quente; o mar; o peixe; a lã molhada.
- **Quem e o quê:**
  - os carpinteiros de navio (*skipasmiðir*) e o **mestre da proa**, que talha a roda de proa;
  - a tripulação no inverno; o jarl;
  - os mercadores.
- **A alfândega:**
  - **a taxa do rei** nos lugares de mercado sob a paz real;
  - na Islândia, **as «taxas da terra»** (*landaurar*) que todo islandês pagava ao chegar à Noruega.
- **De boca aberta:**
  1. **Um navio longo dormindo no *naust* como uma baleia na gruta**, com as lareiras acesas no inverno.
  2. **A vela de lã**: meses de trabalho de várias tecelãs para um só barco **(a conferir a conta)**.
  3. **O mercado em cima do mar**, nas tábuas dos píeres de Hedeby.
- **No mundo do jogo:**
  - **o que já tem causa:** a madeira, o ferro (pela forja), a lã e o couro; **a morsa existe no jogo como bicho**, e o couro
    dela é couro;
  - **o buraco:** o alcatrão pede uma regra da madeira de pinho.

### Clássico — o *kārum* (a palavra quer dizer «o cais»), Ugarit, Kommos e o navio de Uluburun (c. 1300 a.C.)

- **Cômodos:**
  - **o *kārum*:**
    - o bairro dos mercadores junto do rio, em Ur e Sipar, e as colônias de comércio, como **Kanesh**, na Anatólia;
    - nele, **a casa do *kārum***, o escritório da associação dos mercadores, onde se pagavam as taxas e se julgavam as brigas;
  - **o «Prédio P» de Kommos**, em Creta (c. 1400 a.C.): seis galerias compridas abertas para o mar, que se leem como galpões de
    navio;
  - **os depósitos de jarras** de Ugarit.
- **Coisas:**
  - **os lingotes de cobre «couro de boi»** (≈ 25 kg cada) e os de estanho;
  - as **jarras cananeias** (com resina, vinho e azeite);
  - **as âncoras de pedra furada**;
  - **a balança e os pesos:** a balança de pratos com **pesos em forma de bicho** (o pato mesopotâmico; em Uluburun, uma esfinge e
    uma vaca);
  - **as tabuinhas:** as de Kanesh, em **envelopes de barro** selados;
  - **a tábua de escrever de Uluburun:** madeira com dobradiças de marfim, para a cera.
- **Materiais e cores:**
  - o tijolo cru e a pedra;
  - o cedro;
  - o cobre esverdeado dos lingotes;
  - a resina dourada.
- **Luz:**
  - o cais aberto;
  - o escuro dos depósitos.
- **Sons e cheiros:**
  - **os sons:** os jumentos das caravanas (Kanesh: o estanho e o tecido de Assur vinham em lombo de jumento); o mar;
  - **os cheiros:** **a resina de terebinto** (Uluburun levava uma tonelada); o cedro.
- **Quem e o quê:**
  - os mercadores (*tamkārum*);
  - os escribas;
  - os mestres de navio; os tropeiros;
  - o conselho do *kārum*.
- **De boca aberta:**
  1. **Os lingotes «couro de boi» empilhados como tijolos.**
  2. **As âncoras de pedra deixadas como oferenda no templo do porto** (Ugarit, Biblos).
  3. **As cartas de Kanesh**: ≈ 23 mil tabuinhas, cada carta dentro do seu envelope de barro com o selo do remetente.
- **No mundo do jogo:**
  - **o que já tem causa:** o cobre e o estanho (têm jazida); o marfim; o barro;
  - **o buraco:** a resina não existe (o `incenso` pode ser ela).

---

## 5. O templo (o santuário de 8 m, o templo de 16, o grande de 24, o monumental de 32)

**Uma regra comum a quase todos:** o templo é **a casa do deus**, não a sala dos fiéis. O povo fica no pátio, no pórtico, diante
do altar de fora; dentro, só o sacerdote e a imagem. Quanto mais para dentro, **menos gente, menos luz, mais sagrado.**

### Romano — o templo de pódio (a Maison Carrée, o de Portuno), o de Vesta, o Panteão

- **Cômodos:**
  - **o pódio** alto, com a escada só na frente;
  - **o pórtico fundo** (*pronaos*), de colunas;
  - **a *cella*:** uma sala só, com a imagem sobre uma base no fundo;
  - **o altar fica fora**, diante da escada — o sacrifício é na rua;
  - **o tesouro dentro do pódio** (o de Saturno guardava o *aerarium*);
  - **o guardião** (*aedituus*) morava no templo;
  - **o de Vesta é redondo**, com o fogo no meio e, no fundo, a despensa sagrada (*penus*) onde ficava o Paládio, que nenhum
    homem via.
- **Coisas:**
  - **a imagem:** de bronze ou de mármore, às vezes de madeira com o rosto e as mãos de marfim;
  - **o culto:** os candelabros; **a caixinha do incenso** (*acerra*); a pátera das libações; a faca do sacrifício;
  - **nas paredes**, as oferendas e os despojos pendurados: escudos, armas, coroas;
  - **o *lectisternium*:** em certas festas, as imagens dos deuses reclinadas em leitos, diante de mesas postas;
  - **o fígado de bronze de Piacenza** (etrusco), o mapa do céu num fígado, para o harúspice ler as entranhas.
- **Materiais e cores:**
  - o mármore branco, o travertino;
  - a imagem pintada e dourada;
  - o chão de mármores de cor;
  - o teto de caixotões.
- **Luz:**
  - a *cella* sem janela, clara só pela grande porta aberta;
  - as lamparinas;
  - **no Panteão, o óculo de 9 m:** o disco de sol anda pelos caixotões ao longo do dia, e a chuva cai lá dentro e escorre pelos
    furos do chão.
- **Sons e cheiros:**
  - **os sons:** **o flautista toca durante o sacrifício para cobrir qualquer som de mau agouro** (Plínio XXVIII.11); o
    sacerdote reza de cabeça coberta pela toga; o mugido do boi;
  - **os cheiros:** o incenso, a gordura queimada, o vinho derramado, as flores.
- **Quem e o quê:**
  - os pontífices; os flâmines (com o barrete de ponta); as seis vestais;
  - o harúspice;
  - o guardião;
  - os fiéis fazendo o voto e pendurando a oferenda.
- **De boca aberta:**
  1. **O fogo de Vesta que não pode apagar:** se apagava, a vestal era açoitada, e o fogo se reacendia pelo atrito ou pelo sol,
     com espelhos côncavos (Plutarco, *Numa* 9).
  2. **O óculo do Panteão**, com a chuva caindo no chão do templo.
  3. **As paredes cobertas de escudos e de armas** tomadas ao inimigo.
- **No mundo do jogo:** o marfim, o bronze, o ouro e o incenso já têm causa.

### Grego — o *naos* (o Partenon, o templo de Zeus em Olímpia, o Erecteu)

- **Cômodos:**
  - **o peristilo** em volta;
  - **o *pronaos***, depois **a *cella*** com a imagem, e **o *opistódomo*** atrás, um cômodo fechado (o tesouro);
  - **o templo olha para o leste:** ao amanhecer, com as portas abertas, o sol bate na imagem;
  - **o altar fica fora.**
- **Coisas:**
  - **a imagem de ouro e marfim:** a Atena Partenos, de ≈ 11,5 m, sobre uma alma de madeira; diante dela, **um tanque raso de
    água** que umedecia o marfim e refletia a luz; em Olímpia, diante do Zeus, **um tanque de azeite** contra as rachaduras
    (Pausânias V.11.10);
  - **as oferendas:** as trípodes de bronze, os escudos, as estatuetas, as coroas de ouro, **listadas nos inventários em pedra**.
- **Materiais e cores:**
  - o mármore pintado: **os templos eram coloridos**, com o azul, o vermelho e o ouro nos frisos e nos capitéis;
  - o ouro e o marfim da imagem;
  - o teto de caixotões com estrelas.
- **Luz:**
  - a *cella* escura, clara pela porta e pelo brilho do tanque;
  - **a lâmpada eterna de Atena Pólias**, no Erecteu.
- **Sons e cheiros:**
  - **os sons:** os hinos; o *aulos*; **o grito ritual das mulheres** (*ololygê*) no instante do golpe; **o boi «consente»**:
    joga-se água na cabeça dele para ele baixá-la (Plutarco);
  - **os cheiros:** o incenso, o osso da coxa embrulhado em gordura queimando para o deus, a cevada atirada, as flores.
- **Quem e o quê:**
  - a sacerdotisa ou o sacerdote;
  - o guardião do templo (*neokoros*);
  - os peregrinos com as oferendas.
- **De boca aberta:**
  1. **A lâmpada de ouro de Calímaco** no Erecteu: enchida de azeite **uma vez por ano**, com uma mecha que não queima e **uma
     palmeira de bronze em cima que leva a fumaça embora** (Pausânias I.26.6–7).
  2. **A deusa de 11 m de ouro e marfim** refletida no tanque d'água.
  3. **A serpente sagrada da Acrópole, alimentada com bolo de mel**; quando o bolo ficou sem comer, os atenienses souberam que a
     deusa tinha deixado a cidade aos persas (Heródoto VIII.41).

### Egípcio — o templo de pilonos (Karnak, Lúxor, Edfu)

- **Cômodos** (o caminho do sol para a noite):
  - **o pilone**;
  - **o pátio aberto**, onde o povo entra em dia de festa;
  - **a sala hipostila** (a de Karnak, de 134 colunas, as do meio de ≈ 21 m);
  - **a sala das oferendas**;
  - **o santuário**, com **o naos de granito** (a caixa de pedra da imagem) e **o andor da barca** do deus;
  - **as capelas** dos lados e **as criptas** escondidas nas paredes (Dendera);
  - **o lago sagrado**, **a Casa da Vida** e as casas dos sacerdotes.
  - **A cada sala o chão sobe e o teto desce**, e a luz diminui até o escuro do santuário.
- **Coisas:**
  - o naos fechado com **o selo de barro e a tranca**;
  - **a imagem** de ouro, vestida;
  - **a barca** de madeira dourada, com o véu;
  - **o culto:** as mesas de oferenda, os incensários de braço, os vasos de libação;
  - **o sistro** e o colar *menat* das cantoras.
- **Materiais e cores:**
  - o arenito e o granito;
  - **as colunas pintadas** de papiro (verde, azul, vermelho, amarelo);
  - **o teto azul de estrelas** e **os abutres de asas abertas pintados no teto ao longo do corredor do meio**;
  - o ouro da imagem.
- **Luz:**
  - **na hipostila, a luz entra só pelas grades de pedra do clerestório**, em fachos que a fumaça do incenso deixa ver;
  - o santuário no escuro, aceso pela lamparina e pela tocha do sacerdote.
- **Sons e cheiros:**
  - **os sons:** o sistro; o canto do sacerdote-leitor com o rolo; as harpas; o silêncio do santuário;
  - **os cheiros:** o incenso (a resina de manhã, o *kyphi* à noite), o natrão, o óleo, o lótus.
- **Quem e o quê:**
  - **os sacerdotes «puros»** (*wab*): **raspam o corpo inteiro a cada dois dias, banham-se duas vezes de dia e duas de noite, só
    vestem linho e sandália de papiro** (Heródoto II.37);
  - o sacerdote-leitor;
  - as cantoras de Amon;
  - a Divina Adoradora.
- **De boca aberta — o ritual da manhã:**
  1. O sacerdote quebra o selo de barro do naos, «abre as portas do céu», acorda o deus com um hino, incensa, unge, veste e
     alimenta a imagem; e **sai de costas, varrendo com uma vassoura as próprias pegadas**.
  2. **A floresta de colunas de 21 m** na meia-luz dos fachos.
  3. **A barca dourada do deus** no seu andor, pronta para a procissão.
- **No mundo do jogo:**
  - **o que já tem causa:** o papiro e o ouro; o incenso;
  - **o buraco:** o linho do vestido do deus não existe — vestir o deus de lã seria impuro (Heródoto II.81).

### Asteca — a pirâmide (o Templo Mayor)

- **Cômodos:**
  - a pirâmide de degraus, com **a escada dupla**;
  - **no alto, dois santuários lado a lado:** o de Huitzilopochtli (o vermelho) e o de Tláloc (de faixas azuis e brancas);
  - diante de cada um, **a pedra do sacrifício** (*techcatl*) e, no de Tláloc, **o *chacmool***, a figura deitada com a vasilha
    na barriga;
  - **no recinto:** o *tzompantli* (a estante dos crânios), o templo redondo do vento, as casas das águias e das onças;
  - **no jogo**, o santuário do alto tem 2,76 × 2,88 m por dentro (`forma.js`).
- **Coisas:**
  - **as imagens:** a de Huitzilopochtli era grande, de cara larga e olhos terríveis, **coberta de pedras, de ouro e de pérolas e
    cingida de cobras de ouro**, com o arco e as flechas;
  - **os braseiros** de copal diante dela (Díaz, cap. 92);
  - **o grande tambor de pele de serpente**, que se ouvia a duas léguas;
  - **os búzios**;
  - os incensários de cabo comprido (*tlemaitl*).
- **Materiais e cores:**
  - o reboco de cal pintado: o vermelho, o azul, o branco;
  - as cabeças de serpente de pedra no pé da escada;
  - as plumas e o ouro da imagem;
  - **as paredes e o chão do santuário pretos do sangue seco** (Díaz).
- **Luz:**
  - o santuário escuro, aceso pelos braseiros;
  - na plataforma, **os fogos que os sacerdotes vigiavam dia e noite**.
- **Sons e cheiros:**
  - **os sons:** o tambor, os búzios, as flautas, os cantos;
  - **os cheiros:** **o copal**, a borracha queimada (oferenda), as flores amarelas (o *cempasúchil*) — e Díaz diz que o
    santuário fedia mais do que qualquer matadouro de Castela.
- **Quem e o quê:**
  - **os sacerdotes** (*tlamacazque*): o corpo pintado de preto, **o cabelo comprido nunca cortado nem lavado**, emaranhado de
    sangue, as orelhas retalhadas da penitência;
  - os noviços; os guerreiros; os cativos; o povo embaixo, na praça.
- **De boca aberta:**
  1. **A imagem coberta de ouro e de pedras, cingida de serpentes de ouro.**
  2. **O tambor de pele de serpente** que treme no peito.
  3. **O sol nascendo exatamente entre os dois santuários** no equinócio — a orientação do Templo Mayor **(a conferir a data
     exata)**.
- **No mundo do jogo:**
  - **o que já tem causa:** as plumas, o ouro, as pérolas, o copal (`incenso`);
  - **o buraco:** a borracha não existe.

### Nórdico — o *hof*, a casa de culto (Uppsala, Hofstaðir, Uppåkra) e o altar de pedras (*hörgr*)

- **Cômodos:**
  - **o salão-templo** do *goði*;
  - **a casa de culto à parte:**
    - em Uppåkra, ≈ 13 m de comprimento e muito alta, de **valas de parede fundas e pares de postes do telhado**, onde se
      acharam um copo de metal com faixas de ouro, uma tigela de vidro e as figurinhas de folha de ouro (Universidade de Lund);
    - em Tissø, a casa de culto fica num cercado ao lado do salão;
  - **fora:** o bosque e a fonte.
- **Coisas:**
  - **as imagens:** Adão de Bremen (IV.26–27) descreve Uppsala — **um templo «todo ornado de ouro»**, com **Thor no meio,
    Wodan armado de um lado e Fricco do outro**, e **uma corrente de ouro pendurada nas empenas, em volta do templo**;
  - **o altar:** na saga de Eyrbyggja (cap. 4), **o anel de vinte onças sobre o altar**, que o *goði* usava nas assembleias e
    sobre o qual se jurava; **a tigela do sangue** (*hlautbolli*) e **o ramo de aspergir** (*hlautteinn*);
  - **as imagens no estrado** (*stalli*).
- **Materiais e cores:**
  - a madeira entalhada e pintada;
  - o ouro das figurinhas e da corrente;
  - o sangue nas paredes.
- **Luz:**
  - **os fogos no meio, sob os caldeirões**;
  - o brilho do ouro no escuro.
- **Sons e cheiros:**
  - **os sons:** os caldeirões fervendo; os brindes; o chifre passado de mão em mão;
  - **os cheiros:** o sangue, a carne cozida, a fumaça, o hidromel.
- **Quem e o quê:**
  - o *goði* e a *gyðja*;
  - os homens do distrito, no banquete do sacrifício (*blót*).
- **De boca aberta:**
  1. **No *blót*, o sangue dos cavalos era aspergido nos altares, nas paredes de dentro e de fora e no povo**; a carne fervia em
     caldeirões sobre os fogos no meio do templo, e os copos passavam sobre o fogo — o de Odin, o de Njörðr, o de Freyr
     (Snorri, *Saga de Hákon, o Bom* 14).
  2. **Os crânios de boi pendurados por fora** (Hofstaðir).
  3. **A corrente de ouro** em volta do telhado de Uppsala.
- **No mundo do jogo:**
  - **o que já tem causa:** o ouro, a madeira, o sangue do abate;
  - **o buraco:** o vidro não existe.

### Clássico — o templo mesopotâmico, o santuário minoico e o templo do lar dos primeiros gregos

- **Cômodos:**
  - **a *cella*** com a imagem num pódio, num nicho da parede curta;
  - **na frente**, as mesas de oferenda e as bacias de libação;
  - **nos templos de Creta, o santuário pequeno** com o banco alto no fundo, onde ficam as imagens e os machados duplos (o
    Santuário dos Machados Duplos, em Cnossos);
  - **o templo do lar** (Dreros, Creta, séc. VIII a.C.): uma sala com **o lar no meio**, o banco do fundo com as estatuetas de
    bronze e **uma caixa-altar cheia de chifres de cabra** — a ponte entre o mégaron e o templo de colunas que o jogo desenha por
    fora **(a conferir o detalhe dos chifres)**.
- **Coisas:**
  - **a imagem:** de madeira coberta de ouro, **com os olhos de pedra incrustados**, vestida com roupas de rosetas de ouro
    costuradas;
  - **as estátuas de quem reza** (o tesouro de Tell Asmar, no Templo Quadrado de Abu): de pé, de mãos juntas no peito, **com
    olhos enormes de concha e de pedra preta**, postas no templo para rezar pelo dono para sempre;
  - **o Templo dos Olhos** de Tell Brak: **milhares de idolinhos de alabastro**, só um corpo e dois olhos (Met Museum; British
    Museum);
  - **os sinais de Creta:** os chifres de consagração; os machados duplos em bases de degraus;
  - **as estatuetas** da «Senhora das Serpentes», que estavam nas caixas do chão (os Repositórios do Templo, em Cnossos).
- **Materiais e cores:**
  - o tijolo cru rebocado;
  - o ouro da imagem;
  - o alabastro dos idolinhos;
  - o vermelho da ocre nos chifres e no chão.
- **Luz:**
  - a *cella* no escuro, aceso pelas lamparinas;
  - **uma cortina diante da imagem**.
- **Sons e cheiros:**
  - **os sons:** a harpa e a lira; o tamborim; o canto dos sacerdotes;
  - **os cheiros:** o incenso de cedro e de cipreste, a cerveja e o pão das oferendas.
- **Quem e o quê:**
  - os sacerdotes; as sacerdotisas;
  - os músicos;
  - os que trazem as oferendas.
- **De boca aberta:**
  1. **As refeições do deus:** nas tabuinhas de Uruk, **quatro por dia** — o pão, a cerveja, a carne, as frutas —, e **a cortina
     corrida diante da imagem enquanto o deus come** **(a conferir a cortina)**.
  2. **As fileiras de estátuas de olhos arregalados** encarando a imagem para sempre.
  3. **A imagem nova que precisa «abrir a boca»:** o rito da lavagem da boca (*mīs pî*) a faz viva, comer e cheirar.
- **No mundo do jogo:**
  - **o que já tem causa:** o ouro; o chifre e o osso, pelo abate e pela caça;
  - **o buraco:** o alabastro é pedra, mas a concha e a pedra preta dos olhos não existem.

---

## 6. A casa do povo e a casa rica

O jogo tem a cabana (`hut`), a casa (`house`), o sobrado, a ínsula e o quarteirão; a casa rica é a `house` do degrau maior
(`K.rich`). **A casa do povo é pequena (4 × 4 m) e fica pequena** (`interiores-2.md` decisão 14): o que muda é que ela fica
andável, arrumada e com causa.

### Romano — a *domus* (pequena e grande) e a *insula*

- **A casa do povo:**
  - **a pequena *domus* de Pompeia:**
    - o corredor da entrada (*fauces*);
    - **o átrio coberto** (sem o buraco no telhado);
    - um quarto (*cubiculum*);
    - o canto da cozinha, com o fogão de alvenaria;
    - **o larário pintado na parede da cozinha**: as duas serpentes, o Gênio da casa, os Lares dançando;
    - a horta no fundo.
  - **a loja-casa** (*taberna*): o balcão para a rua e, em cima, **o jirau** (*pergula*), onde a família dorme.
  - **na *insula*, o andar alto** (*cenaculum*):
    - um ou dois cômodos;
    - **nenhuma cozinha** (o braseiro, e o fogo que vem dele);
    - **nenhuma água** (a fonte da rua);
    - **nenhuma privada** (o urinol e o jarro da escada);
    - as venezianas de madeira.
- **A casa rica** (Vitrúvio VI; a Casa do Fauno, a dos Vettii, a do Poeta Trágico):
  - **o mosaico do cão na entrada** (*cave canem*);
  - **o átrio:** **o implúvio**, a bacia de mármore que recebe a chuva do buraco do telhado (*compluvium*); a mesa de pedra; **a
    arca de ferro**; o larário em forma de templo;
  - **nas alas do átrio, os armários com as máscaras de cera dos antepassados** (*imagines*), com o nome e os cargos de cada um,
    e as linhas pintadas da árvore da família (Políbio VI.53; Plínio XXXV.6);
  - **o *tablinum*:** a sala do senhor, com a vista atravessando até o peristilo;
  - **os quartos e o triclínio**;
  - **o peristilo:** o jardim de colunas com as fontes e as estatuetas, e **os *oscilla*** — discos e máscaras de mármore
    pendurados entre as colunas, que giram ao vento;
  - **a cozinha:** com **a latrina ao lado**;
  - o banho particular;
  - os quartos dos escravos;
  - o andar de cima.
- **Materiais e cores:**
  - os afrescos;
  - os mosaicos (o da Batalha de Alexandre, na Casa do Fauno, tem mais de um milhão de pedrinhas);
  - o mármore do implúvio;
  - o bronze das lucernas;
  - a madeira dos armários.
- **Luz:**
  - **a coluna de sol do *compluvium*** caindo no implúvio, com a água tremendo no teto;
  - o peristilo claro;
  - os quartos escuros;
  - as lucernas e os candelabros.
- **Sons e cheiros:**
  - **os sons:** a água do implúvio; a fonte; os pássaros do jardim; a rua do outro lado da porta;
  - **os cheiros:** o garo, a fumaça, as rosas e as violetas — **e a latrina junto da cozinha**;
  - **na *insula*:** o barulho das carroças, que só podiam rodar em Roma à noite — «aqui o doente morre da insônia» (Juvenal
    III).
- **Quem e o quê:**
  - o pai da família e a dona;
  - os filhos; os escravos; os libertos;
  - **os clientes que fazem fila no átrio ao amanhecer**.
- **De boca aberta:**
  1. **As máscaras de cera dos antepassados** nos armários do átrio.
  2. **O sol do *compluvium* na água do implúvio.**
  3. **Os *oscilla*** girando entre as colunas do jardim.
- **No mundo do jogo:**
  - **o que já tem causa:** a cera das máscaras (`cera`); a pedra; o bronze;
  - **uma ponte:** o *lararium* pede uma imagem, que pode ser de barro (a olaria).

### Grego — a casa de pátio (*oikos*): Olinto, Delos, Atenas

- **A casa do povo:**
  - virada para dentro: **uma porta só para a rua** e janelinhas altas;
  - **o pátio** (*aulê*), com o poço ou a cisterna e **o altar de Zeus Herkeios**, o deus do cercado;
  - **o pórtico** (*pastas*) num lado do pátio;
  - **a sala do fogo** (*oikos*), com o cano de fumaça;
  - o depósito com os píthoi;
  - o quarto;
  - **o tear de pesos** no pátio ou no pórtico.
- **A casa rica:**
  - a «**Casa da Boa Fortuna**» de Olinto, com **mosaicos de seixos que escrevem no chão «Boa Fortuna» e «Afrodite é bela»** e
    um Dioniso num carro de panteras;
  - **o *andron***, com a antessala;
  - **o banho** com a banheira de barro;
  - **o andar de cima** das mulheres e dos quartos;
  - **em Delos, o pátio de colunas** sobre a cisterna e os mosaicos: Dioniso montado numa pantera, na Casa das Máscaras;
  - **na porta, a herma**, o pilar com a cabeça de Hermes, que guarda a entrada.
- **Materiais e cores:**
  - o tijolo cru sobre o soco de pedra;
  - o reboco branco com a barra vermelha;
  - o chão de argamassa ou de seixos;
  - a telha de barro.
- **Luz:**
  - o pátio é a janela da casa;
  - à noite, as lamparinas e o braseiro.
- **Sons e cheiros:**
  - **os sons:** **os pesos do tear batendo**; as galinhas; a roldana do poço;
  - **os cheiros:** o azeite, a fumaça, o pão, o peixe.
- **Quem e o quê:**
  - o senhor da casa (*kyrios*);
  - **a mulher, que guarda as despensas e as chaves**;
  - os filhos; os escravos;
  - o *pedagogo*, o escravo que leva o menino à escola.
- **De boca aberta:**
  1. **As palavras escritas em seixos no chão.**
  2. **O tear de pesos** com a peça em meio caminho.
  3. **A herma da porta.**
- **No mundo do jogo:**
  - **o que já tem causa:** os pesos do tear (o barro da olaria); a lã;
  - **o buraco:** o mosaico de seixos é pedra, mas o chumbo dos contornos não existe.

### Egípcio — Deir el-Medina (a vila dos trabalhadores dos túmulos) e as casas de Amarna

- **A casa do povo** (Deir el-Medina, ≈ 70 m², em fileira; Bruyère):
  - **a primeira sala:** com **um estrado de tijolo com degraus**, pintado com Bes e Taweret (o *lit clos*: um altar da casa ou
    a cama do parto);
  - **a segunda sala, a principal:**
    - **uma coluna** (um tronco de palmeira) que segura o teto;
    - **o divã de tijolo**;
    - **os nichos com os bustos dos antepassados** («o espírito excelente de Ra»);
  - os quartos dos lados;
  - **atrás, a cozinha a céu aberto:** coberta de junco e de folhas de palmeira, com o forno de pão, as mós e os jarros, e uma
    adega cavada embaixo;
  - **a escada para o telhado**, onde se dorme no verão e se secam as tâmaras.
- **A casa rica** (Amarna; Ricke):
  - o vestíbulo de colunas;
  - **a sala central** quadrada, de duas ou quatro colunas, com **os estrados de tijolo** ao longo das paredes e **o estrado do
    senhor**;
  - **o banheiro:** a laje de pedra, a parede contra os respingos;
  - **a privada de pedra**, com a fenda sobre um pote de areia;
  - **o quarto com o nicho da cama**;
  - os cômodos das mulheres;
  - **o jardim com o tanque**;
  - **a capela da casa**, com a estela da família real;
  - **os silos de colmeia no pátio**;
  - o poço; o estábulo e os criados;
  - **no telhado, o capta-vento**, a boca que pega a brisa do norte e a manda para dentro (as «casas da alma» de barro e a
    pintura da casa de Nebamon).
- **Materiais e cores:**
  - o tijolo cru rebocado e caiado;
  - a barra colorida;
  - **os frisos de lótus**;
  - as colunas pintadas de vermelho;
  - as esteiras de junco;
  - as caixas de madeira pintada.
- **Luz:**
  - **pouca janela, alta e gradeada**;
  - o fresco escuro de dentro e o branco do pátio;
  - as lamparinas de óleo e sal.
- **Sons e cheiros:**
  - **os sons:** as mós de manhã; os gansos; o macaco de estimação;
  - **os cheiros:** o pão, a cerveja, o lótus, a lama, a fumaça do forno.
- **Quem e o quê:**
  - **o escriba ou o artesão** do túmulo do rei e a sua família;
  - em Amarna, o funcionário, os criados, o porteiro.
- **De boca aberta:**
  1. **O estrado pintado com Bes**, o anão que dança e afasta o mal.
  2. **Os bustos dos antepassados** nos nichos, recebendo flores.
  3. **O capta-vento** soprando o ar fresco na sala.
- **No mundo do jogo:**
  - **o que já tem causa:** o barro, a madeira, o grão;
  - **o buraco:** a areia da privada é chão; a pintura pede os pigmentos (o buraco 5).

### Asteca — o *calli* do povo, a casa do nobre e a casa do mercador (*pochteca*)

- **A casa do povo:**
  - **a construção:** de adobe ou de pau-a-pique sobre uma base de pedra; o telhado de palha de duas águas, ou plano;
  - **o conjunto:** um ou dois cômodos em volta do **pátio da família estendida**;
  - **o coração da casa é o fogo de três pedras** (*tenamaztli*), com o *comal* em cima — não se pula por cima dele;
  - **o *metate* de pedra**, onde a mulher mói o milho horas por dia;
  - **as esteiras**, enroladas de dia;
  - **o altar da casa:** as figurinhas de barro dos deuses, o incensário, as flores e as tortilhas de oferenda;
  - **no pátio:** **o celeiro *cuezcomatl*** (um jarrão de barro e palha sobre uma base de pedra, com um chapéu de palha);
  - os perus; os cãezinhos;
  - nas chinampas, a casa de junco rebocada de lama.
- **A casa rica:**
  - de pedra e cal, pintada, **em volta de pátios com jardins**;
  - os cômodos de cada família;
  - os depósitos;
  - a capela;
  - **o banho de vapor** (*temazcal*);
  - as esteiras finas e os assentos *icpalli*;
  - **os panos de plumas**.
- **A casa do mercador (*pochteca*)** — o jogo tem a «Casa dos Pochteca»:
  - **pobre por fora e cheia por dentro**;
  - **o mercador chegava de noite, de canoa, e escondia a carga**, e andava de roupa simples para não atrair a inveja dos nobres
    (Sahagún, livro IX).
- **Materiais e cores:**
  - o adobe;
  - o reboco branco;
  - a palha dourada do telhado;
  - **as esteiras de junco amarelas**;
  - o barro vermelho e laranja das panelas — **a louça laranja com desenhos pretos** dos astecas;
  - as plumas.
- **Luz:**
  - a porta, e quase nenhuma janela;
  - o fogo das três pedras;
  - as tochas de ocote.
- **Sons e cheiros:**
  - **os sons:** **o *metate* antes do amanhecer** e **o tapa-tapa das mãos batendo a tortilha**; o peru;
  - **os cheiros:** o milho cozido, a fumaça da pimenta, o copal, as flores.
- **Quem e o quê:**
  - a família estendida;
  - **as mulheres moendo e tecendo no tear de cintura**;
  - os homens indo para a chinampa;
  - as crianças: **o Códice Mendoza mostra o menino desobediente castigado sobre a fumaça da pimenta queimando** (fólio 60r).
- **De boca aberta:**
  1. **O fogo de três pedras** no meio da casa.
  2. **O cordão do umbigo da menina enterrado debaixo do fogo, para ela ficar na casa, e o do menino levado ao campo de
     batalha** (Sahagún, livro VI).
  3. **A casa do mercador**, modesta na porta e com um tesouro de plumas e de cacau no fundo.
- **No mundo do jogo:**
  - **o que já tem causa:** o barro (a olaria); o milho; o peru; as plumas;
  - **o buraco:** o algodão do tear de cintura não existe; o copal é o `incenso`.

### Nórdico — a casa longa (*Casa Longa*, *Casa Longa Grande*, *Salão de Família*)

- **A casa do povo** (15 a 30 m):
  - **a porta no lado**, perto de uma ponta, com o alpendre;
  - **o corredor de atravessar**;
  - **numa ponta, o curral:** as baias dos bois separadas por tábuas ou por lajes (na Islândia), atrás de uma divisória — **o
    calor dos bichos aquece a casa**;
  - **na outra, a sala:**
    - **o fogo comprido** no meio;
    - **os bancos largos** de terra contida por tábuas, para sentar e dormir;
    - **o tear junto da porta**, onde há luz;
    - **o depósito** (*búr*): os barris de *skyr* e de soro (*sýra*), o peixe seco pendurado;
    - a mó de girar;
  - os buracos de fumaça; nas casas de turfa, as paredes forradas de tábuas;
  - **a cama fechada dos donos**; os outros nos bancos, com peles.
- **A casa rica** (o sítio do chefe):
  - o salão com os postes entalhados e o assento alto;
  - **as tapeçarias**;
  - **a sala de estar à parte** (*stofa*);
  - **o aposento das mulheres** (*skemma*);
  - a casa de banho; a forja; o *naust*;
  - **as coisas de fora:** os copos de vidro, as espadas francas na parede, a prata, os chifres de beber com bocal de metal, as
    camas entalhadas, **as peças de jogo de vidro e de osso**.
- **Ao lado — a casa cavada** (*grubenhaus*):
  - meio enterrada no chão;
  - nela as mulheres teciam: **o ar úmido amacia o fio**;
  - os pesos do tear ficam em fileira no chão, onde o tear caiu.
- **Materiais e cores:**
  - a madeira escura;
  - a turfa verde do telhado;
  - os entalhes de bichos;
  - a lã tingida;
  - as peles de foca e de urso;
  - o ferro negro das panelas.
- **Luz:**
  - o fogo e as lamparinas de pedra-sabão;
  - a porta aberta;
  - **os buracos de fumaça, que de dia deixam cair fachos**.
- **Sons e cheiros:**
  - **os sons:** **as vacas ruminando do outro lado da parede**; o fogo; o pente do tear; o cão; a chuva na turfa;
  - **os cheiros:** a fumaça, o esterco, o leite azedo, o peixe seco, a lã.
- **Quem e o quê:**
  - o lavrador (*bóndi*);
  - **a dona** (*húsfreyja*) com as chaves;
  - os filhos; os criados; os escravos; os velhos.
- **De boca aberta:**
  1. **O gado respirando do outro lado da divisória.**
  2. **Os fachos de luz** dos buracos do telhado atravessando a fumaça.
  3. **A cama fechada** com a porta de tábuas entalhadas.
- **No mundo do jogo:**
  - **o que já tem causa:** a madeira; as peles; a lã; o leite; o peixe;
  - **o buraco:** o vidro não existe (as peças de jogo serão de osso ou de madeira).

### Clássico — Çatal Höyük, a casa de pátio de Ur e a Casa do Oeste de Akrotiri

- **A casa do povo** (Çatal Höyük, c. 7000 a.C.):
  - **a entrada é pelo telhado**, por uma escada de mão, junto do forno e do fogo, na parede sul, para a fumaça subir pela
    mesma boca;
  - **as plataformas** na parede norte e na leste, **com os mortos enterrados debaixo delas**;
  - **os crânios de touro rebocados**, com os chifres para fora, nas paredes e nas plataformas, pintados de ocre vermelha;
  - **as paredes brancas**, rebocadas de novo a cada mês ou estação e polidas para refletir a pouca luz;
  - as pinturas: os abutres, a caça ao touro vermelho gigante (Hodder; UCL).
- **A casa de pátio de Ur** (Woolley):
  - o pátio aberto, de tijolo, com um ralo;
  - a sala dos hóspedes;
  - a cozinha;
  - **a escada para a galeria de madeira** em volta do pátio;
  - **a capela no fundo**, com o altar e **o jazigo da família debaixo do chão**.
- **A casa rica** (a Casa do Oeste de Akrotiri, em Tera, c. 1600 a.C.):
  - **o andar de cima de janelas grandes**;
  - **a sala do afresco da Frota** — os navios em procissão entre as cidades — e dos **pescadores nus com as fieiras de peixes**;
  - os depósitos de píthoi embaixo;
  - **a privada com o cano para o esgoto da rua**;
  - na Xeste 3, **as moças colhendo açafrão**.
- **Materiais e cores:**
  - o tijolo cru;
  - o reboco de cal pintado;
  - **o vermelho de ocre**;
  - as vigas de madeira à vista;
  - em Akrotiri, a pedra lavrada da frente e as escadas de pedra.
- **Luz:**
  - **em Çatal Höyük, só a boca do telhado** — o branco polido das paredes é o que a espalha;
  - em Akrotiri, a luz das janelas grandes do andar de cima.
- **Sons e cheiros:**
  - **os sons:** **os passos no telhado** (a rua de Çatal Höyük é por cima das casas); a mó;
  - **os cheiros:** a fumaça, o reboco fresco, o pão.
- **Quem e o quê:**
  - a família estendida;
  - **os vivos dormindo sobre os mortos**.
- **De boca aberta:**
  1. **Descer para casa por uma escada, do telhado.**
  2. **Os chifres de touro saindo da parede.**
  3. **A sala dos navios pintados** de Akrotiri.
- **No mundo do jogo:**
  - **um conflito:** o morto debaixo da plataforma bate de frente com a regra do jogo — **só `Village.bury` abre cova** —; fica
    só **a ocre**, não o enterro;
  - **o que já tem causa:** o chifre e o osso, pelo abate;
  - **o buraco:** o reboco pede a cal.

---

## 7. As oficinas: a forja, a olaria, a tecelagem, a padaria

No jogo: `forja` (8 m), `olaria` (8 m), `tecelagem` (8 m), `ourives`, `acougue` e a `workshop` (a oficina das ferramentas).
**Não há padaria:** o pão sai do forno da casa, da taverna e da cozinha do palácio — a padaria vale para essas cozinhas.

### 7.1 A forja

- **Romano** — a oficina do ferreiro (*faber ferrarius*):
  - **cômodos:** a loja aberta para a rua e, no fundo, a forja de alvenaria à altura da cintura;
  - **coisas:**
    - o fole de couro, com **o menino que o puxa atrás de um anteparo** que o protege do calor (as lápides de ferreiros, como a
      de Aquileia, mostram a forja, a bigorna e as tenazes);
    - a bigorna sobre um cepo;
    - a tina de temperar;
    - as ferramentas penduradas na parede;
    - o altarzinho de Vulcano;
  - **materiais e cores:** o carvão, o ferro rubro, a parede negra de fuligem;
  - **luz:** a oficina é mantida escura de propósito, **para o ferreiro ler a cor do ferro quente**;
  - **sons e cheiros:** o martelo que canta, o chiado da têmpera; o carvão, o ferro, o enxofre;
  - **quem:** o mestre, os aprendizes, o menino do fole;
  - **de boca aberta:**
    1. **O tesouro de pregos de Inchtuthil**, a fortaleza abandonada na Escócia: ≈ 875 mil pregos de ferro enterrados para o
       inimigo não os levar.
    2. **O menino atrás do anteparo**, puxando o fole.
- **Grego** — a fundição de bronze (*chalkeion*) — a Taça da Fundição de Berlim, c. 490 a.C.:
  - **coisas:**
    - **o forno alto de cuba**, com um homem sentado atrás no fole e outro atiçando;
    - **uma estátua de guerreiro sendo montada de partes fundidas**, e outra sendo polida;
    - **na parede:** as ferramentas, as plaquinhas de oferenda e modelos de pés e de mãos pendurados;
  - **materiais e cores:** o bronze dourado e cru; o barro dos moldes; o carvão;
  - **luz:** o forno;
  - **sons e cheiros:** o fole, o martelo, o bronze derretido;
  - **quem:** o mestre, os fundidores, os escravos;
  - **de boca aberta:**
    1. **Uma estátua maior que um homem, montada em pedaços como um quebra-cabeça.**
    2. **O rapaz do fole sentado atrás do forno**, meio escondido pelo calor.
    3. **Em Atenas, o templo de Hefesto** sobre o bairro dos ferreiros.
- **Egípcio** — a oficina do túmulo de Rekhmire (séc. XV a.C.):
  - **coisas:**
    - **os foles de pé:** dois sacos de couro de cada lado do fogo; o homem pisa um e puxa a corda do outro, num passo que parece
      dança;
    - **o cadinho**, tirado do fogo com duas varas que fazem de tenaz;
    - **os moldes de barro** onde se fundem as placas de bronze **das portas do templo de Amon** (Met Museum; Davies);
    - no Reino Antigo, antes do fole, **grupos de homens soprando o fogo por canudos** de ponta de barro (o túmulo de Mereruka);
  - **quem:**
    - **o escriba pesa o ouro na entrada e as joias na saída** — nada some;
    - **os joalheiros anões** dos túmulos do Reino Antigo;
  - **de boca aberta:** **os homens dançando sobre os foles**; **o metal pesado duas vezes**.
- **Asteca** — não havia ferro. A casa do metal é **a do ourives** (*teocuitlahuaque*) e da fundição de cobre, e ao lado fica a
  **lasca da obsidiana**:
  - **coisas:**
    - **a cera perdida:** o modelo de cera sobre um miolo de barro e carvão, coberto de barro, e o ouro derramado no lugar da
      cera;
    - **o fogo soprado por tubos de cana**, sem fole — o Códice Florentino, livro IX;
    - os guizos de ouro e de cobre; os machados e as agulhas de cobre;
    - **o lascador de obsidiana**, que tira lâminas compridas como navalhas de um núcleo, só apertando;
  - **sons e cheiros:** o sopro dos tubos; o estalo da obsidiana; o carvão;
  - **de boca aberta:**
    1. **A peça de ouro saindo do molde de barro quebrado.**
    2. **A lâmina de obsidiana mais afiada que o aço.**
  - **no mundo do jogo:** a arma asteca de verdade é **a espada de madeira de gumes de obsidiana** (*macuahuitl*) e **o dardo de
    propulsor** (*atlatl*); a forja de bronze e de ferro do jogo não é asteca — e a obsidiana é o buraco 7.
- **Nórdico** — a forja do sítio, longe da casa por causa do fogo:
  - **coisas:**
    - o fogão baixo de pedra e barro; **o fole duplo de couro e madeira**;
    - **a pedra que protege o fole do fogo**: a de Snaptun (c. 1000), de pedra-sabão, tem **o rosto de Loki com os lábios
      costurados**, e o bico do fole entra por um furo debaixo da boca (Moesgård);
    - a bigorna num cepo;
    - **a arca de ferramentas de Mästermyr** (Gotland): tenazes, martelos, bigornas, limas, serras, fechaduras — o kit inteiro
      de um ferreiro;
    - **o ferro do pântano** (o minério tirado da turfa), torrado e reduzido no forno baixo, e a lupa batida para expulsar a
      escória;
    - as espadas de ferro trançado e soldado;
  - **sons e cheiros:** o martelo, o fole chiando; o carvão, a escória;
  - **de boca aberta:**
    1. **O rosto de Loki no fole.**
    2. **A lenda de Völundr**, o ferreiro aleijado que fez asas e fugiu (a pedra pintada de Ardre).
  - **no mundo do jogo:** o ferro do nórdico, na história, vinha do pântano; o jogo o tira da jazida de rocha.
- **Clássico** — a fundição de bronze da Idade do Bronze:
  - **coisas:**
    - os cadinhos;
    - **os moldes de pedra em duas metades** para machados e pontas;
    - os bicos de barro do fole (*tuyères*);
    - **o fole de pote**: um pote de barro coberto de couro, que se bomba com as mãos ou com os pés;
    - **os lingotes «couro de boi»** partidos em pedaços;
    - o cesto de bronze velho para refundir;
  - **de boca aberta:** **as tabuinhas Jn de Pilos** — a lista dos ferreiros de bronze do reino, cada um com o bronze que o
    palácio lhe deu, e **os que estão «sem bronze»**. É o «nada vem do nada» escrito no barro há 3.200 anos.

### 7.2 A olaria

- **Romano** — a *figlina*:
  - **coisas:**
    - a roda de pé;
    - as prateleiras de secar;
    - **o forno de tiragem** (a câmara do fogo embaixo de um chão furado);
    - **os moldes da *terra sigillata*** (a louça vermelha brilhante, de figuras em relevo) e **o carimbo com o nome do oleiro**
      no fundo de cada tigela;
    - os moldes de lucerna;
  - **sons e cheiros:** o chute da roda; o barro molhado; a fumaça;
  - **de boca aberta:** **as listas das fornadas de La Graufesenque**, riscadas num prato antes de queimar: o nome dos oleiros e
    dezenas de milhares de peças numa fornada só (Marichal).
- **Grego** — o *kerameus* do Cerâmico de Atenas e de Corinto:
  - **coisas:**
    - a roda girada à mão por um aprendiz, enquanto o mestre levanta o vaso;
    - os pintores de pincel;
    - **o forno com o fogueiro e o olho de espiar**;
    - **a máscara contra o mau-olhado** sobre o forno;
  - **cores:**
    - o vermelho da argila e o preto, que também é barro: **a cozedura de três fases, que tira e devolve o ar ao forno, faz o
      negro brilhante**;
    - **as plaquinhas votivas de Penteskouphia** (Corinto) mostram os oleiros cavando o barro e alimentando o forno;
  - **de boca aberta:**
    1. **A hídria Caputi**: uma oficina de pintores, com **uma mulher pintando um vaso** e Atena coroando os artesãos.
    2. **A canção do forno** (o epigrama homérico «O Forno»), que **amaldiçoa os demônios que quebram as panelas** — o
       Quebrador, o Estalador.
- **Egípcio:**
  - **coisas:**
    - a roda girada à mão (a de pé só tarde);
    - **dois barros:** o escuro do lodo do Nilo e o claro da marga;
    - os fornos redondos;
    - **as fôrmas de pão e os potes de cerveja aos milhares**;
  - **quem:** o oleiro — «coberto de terra, revira o barro mais que um porco» (a «Sátira dos Ofícios»);
  - **de boca aberta:** **o deus Khnum moldando o homem na roda de oleiro.**
- **Asteca** — **sem roda**:
  - **coisas:**
    - o pote levantado em cordões e em moldes;
    - **a louça laranja com desenhos pretos finos**;
    - **os *comales*** grandes;
    - **os incensários de cabo comprido** que acabam em cabeça de serpente;
    - as figurinhas de molde;
  - **o fogo:** a queima em fogueira e em cova;
  - **de boca aberta:** **Moctezuma comia em louça de Cholula** (Díaz), a policromada fina vinda de fora.
- **Nórdico** — quase não havia louça:
  - **coisas:**
    - **as panelas de pedra-sabão**, talhadas na pedreira — **a parede da pedreira guarda o negativo das tigelas** que dela se
      tiraram;
    - os potes grosseiros feitos à mão;
    - os jarros pretos com folha de estanho vindos do Reno (Birka, Hedeby);
    - os pesos de tear;
  - **no mundo do jogo:** a olaria nórdica é **o torno da pedra-sabão** e o pote feito à mão.
- **Clássico:**
  - **coisas:**
    - **a louça de Kamares** (Creta): taças de parede fina como casca de ovo, pintadas de branco, vermelho e laranja sobre o
      preto;
    - **a roda rápida**, já na Mesopotâmia de 3000 a.C.;
    - **os píthoi levantados em anéis**, com os cordões em relevo;
    - os fornos;
  - **de boca aberta:**
    1. **A taça de Kamares, mais fina que uma unha.**
    2. **As tigelas de borda chanfrada de Uruk**, feitas aos milhares em moldes, iguais, para dar a ração.

### 7.3 A tecelagem

- **Romano:**
  - **coisas:**
    - o tear vertical de duas traves e o tear de pesos;
    - os cestos de lã;
    - **a lavanderia** (*fullonica*: a de Estéfano, em Pompeia):
      - as tinas onde os pisoeiros pisam o pano;
      - **a urina recolhida em potes nas esquinas** — o imposto de Vespasiano;
      - **a prensa de rosca**;
      - as armações de branquear com enxofre;
    - **o tintureiro** com as tinas de garança e de pastel;
  - **sons e cheiros:** o pente do tear; o canto; o cheiro de lanolina, de urina e de enxofre;
  - **de boca aberta:**
    1. **«Lanam fecit»** — «fiou a lã» —, o maior elogio escrito na lápide de uma romana.
    2. **Os homens pisando pano em tinas de urina.**
- **Grego:**
  - **coisas:**
    - **o tear de pesos** (*histos*) encostado na parede;
    - os pesos de barro em pirâmide, com a marca de quem os fez;
    - a espada do tear;
    - o fuso e a roca;
    - **o *epinetron***, a telha de barro que a mulher põe na coxa para preparar a lã, pintada com cenas de casamento;
  - **quem:** as mulheres no pátio;
  - **de boca aberta:**
    1. **Penélope desfazendo à noite** o que teceu de dia.
    2. **O peplo de Atena**, tecido de novo pelas moças da cidade para a festa das Panateneias.
- **Egípcio** — **o linho**:
  - **coisas:**
    - o linho posto de molho, batido e penteado;
    - **a fiandeira com dois fusos ao mesmo tempo** (Beni Hassan);
    - **o tear horizontal de chão**, estacado na terra, com duas mulheres agachadas (Reino Médio);
    - o tear vertical (Reino Novo);
  - **de boca aberta:** **o «linho real», tão fino que é transparente.**
  - **no mundo do jogo:** **o linho é o buraco 1.** Sem ele, a tecelagem egípcia não é egípcia — e o egípcio nem tem ovelha.
- **Asteca:**
  - **coisas:**
    - **o tear de cintura**: uma ponta amarrada num poste, a outra numa correia em volta das ancas — **a tecelã se inclina para
      trás para esticar o fio**;
    - **os fusos de barro girando numa tigelinha**;
    - **a fibra:** o algodão branco e o pardo (*coyoichcatl*) para os nobres, **a fibra de maguey para o povo** — a roupa era a
      do lugar de cada um (Durán);
    - **o fio de pelo de coelho**;
    - as plumas tecidas dentro do pano;
  - **de boca aberta:** **o Códice Mendoza mostra a menina aprendendo com a mãe:** aos 13 anos ela mói o milho e faz a
    tortilha, aos 14 tece (fólio 60r).
  - **no mundo do jogo:** **o algodão e o maguey são o buraco 2.**
- **Nórdico:**
  - **coisas:**
    - o tear de pesos encostado na parede **da casa cavada**;
    - **os pesos de barro em fileira**;
    - a espada de tecer de osso de baleia;
    - **a tábua de alisar de osso de baleia com duas cabeças de dragão** (dos túmulos de mulheres ricas da Noruega);
    - **o tear de tabuinhas para as fitas**: o de Oseberg ainda tinha as tabuinhas no lugar;
  - **de boca aberta:**
    1. **O pano de lã (*vaðmál*) era dinheiro na Islândia**, medido em varas.
    2. **A vela de um navio**: o trabalho de anos de tecelãs **(a conferir a conta)**.
- **Clássico:**
  - **coisas:**
    - o tear de pesos (em Akrotiri, salas com muitos pesos de tear no chão);
    - **as tabuinhas de Cnossos que contam as tecelãs e as fiandeiras em grupos, com os filhos delas**;
    - os panos de cada tipo;
  - **de boca aberta:** **a púrpura do caramujo do mar**, já tingida em Creta c. 1800 a.C. (Koufonisi).
  - **no mundo do jogo:** a púrpura pede o saber III e o caramujo (`saber.md`).

### 7.4 A padaria (a cozinha do pão)

- **Romano** — o *pistrinum*, padaria e moinho juntos:
  - **coisas:**
    - **as mós de lava em forma de ampulheta** (o cone de baixo e o funil de cima), giradas por burros de olhos vendados ou por
      escravos;
    - **a amassadeira** de pás girada por um cavalo (o túmulo de Eurísaces, em Roma);
    - **o forno de cúpula** com a boca e o cano;
    - **o pão redondo partido em oito, com o carimbo do padeiro** (em Herculano achou-se o selo «de Céler, escravo de Q. Grânio
      Vero»);
  - **sons e cheiros:** a mó raspando sem parar; o farelo, o pão, o burro;
  - **de boca aberta:**
    1. **Os 81 pães carbonizados** no forno da padaria de Modesto, em Pompeia.
    2. **Os esqueletos dos burros** na estrebaria ao lado das mós, na Casa dos Castos Amantes.
- **Grego:**
  - **coisas:**
    - o bolo de cevada (*maza*) e o pão de trigo (*artos*);
    - **o forno portátil de barro** (*kribanos*);
    - **a mó de alavanca de Olinto**, uma invenção grega;
  - **de boca aberta:** **quatro mulheres amassando o pão no compasso de um flautista** (a terracota da Beócia, Louvre CA 804).
- **Egípcio:**
  - **coisas:**
    - **as fôrmas cônicas de barro** (*bedja*) esquentadas na brasa;
    - **a massa pisada com os pés** em tinas;
    - **as mulheres de joelhos nas mós de sela**;
  - **ao lado, a cervejaria:** **a cerveja se faz do pão meio assado**, esfarelado e posto de molho (as maquetes de Meketré);
  - **de boca aberta:**
    1. **A areia da mó no pão**, que gastava os dentes das múmias.
    2. **Dezenas de nomes de pão.**
- **Asteca** — não há padaria, há **a casa do *comal***:
  - **coisas:**
    - o milho cozido com cal (o *nixtamal*);
    - o *metate* e a mão de pedra;
    - **a tortilha no *comal* sobre as três pedras**;
    - os tamales cozidos no vapor;
    - no mercado, as vendedoras de tortilha;
  - **de boca aberta:** **o tapa-tapa das mãos batendo a massa** antes de amanhecer.
  - **no mundo do jogo:** a cal do *nixtamal* é o buraco 4.
- **Nórdico:**
  - **coisas:**
    - **o pão chato na pedra de assar** de pedra-sabão, ou na frigideira de ferro;
    - **a mó de girar à mão**;
    - a cevada, o centeio, a aveia;
  - **de boca aberta:** **a canção da mó Grotti** (*Grottasöngr*): duas gigantas moem ouro e paz para o rei Fródi, e depois,
    cansadas, moem um exército.
- **Clássico:**
  - **coisas:**
    - **o forno de barro (*tannur*)**, onde o pão chato se cola na parede de dentro;
    - as mós de sela;
    - **o pão da cerveja** (*bappir*) do hino a Ninkasi;
    - **as 48 fôrmas de bolo de Mari**;
  - **de boca aberta:** **as listas de rações** — tanto de pão, tanto de cerveja por trabalhador e por dia.

---

## 8. O mercado (o macelo, o empório, o mercado do rio, o *tianguis*, a feira; 8 / 16 m)

- **Romano — o *macellum*:**
  - **cômodos:**
    - o pátio cercado de lojas;
    - **no meio, o *tholos***, um pavilhão redondo de colunas com uma bacia de água, onde se limpava o peixe — no ralo do de
      Pompeia acharam-se escamas;
    - no fundo, a capela do culto do imperador;
    - em Roma, **os Mercados de Trajano**, lojas em andares no semicírculo, de portas de travertino com o encaixe das tábuas de
      fechar;
  - **coisas:**
    - os balcões de pedra; os ganchos da carne; as balanças;
    - **a *mensa ponderaria*:** a mesa de pedra com as cavidades das medidas oficiais, no fórum, onde se conferia o volume
      (Pompeia);
  - **luz:** o pátio aberto e o pavilhão em sombra;
  - **sons e cheiros:** os pregoeiros, o peixe batendo no mármore; o peixe, a carne, o garo, as flores;
  - **quem:** os açougueiros, os peixeiros; **os edis**, que conferem os pesos; as compradoras e os escravos de recados;
  - **de boca aberta:** **a mesa das medidas do povo**; **o peixe vivo no tanque**; a rua de lojas em três andares.
- **Grego — a ágora e o empório:**
  - **cômodos:** o pórtico comprido (a *stoa*), com as lojas atrás; as bancas de vime (*skênai*) armadas na praça; **os «círculos»
    (*kykloi*)** onde se vende cada coisa — o peixe, o queijo, os escravos;
  - **coisas:**
    - **as medidas oficiais de bronze e de barro carimbadas «do povo»** (ΔΗΜΟΣΙΟΝ), achadas na ágora de Atenas;
    - as mesas dos cambistas;
    - as balanças;
  - **quem:** **os fiscais do mercado** (*agoranomoi*) e **os das medidas** (*metronomoi*); os peixeiros, os cambistas;
  - **sons e cheiros:** o peixe, o azeite, o figo, o couro;
  - **de boca aberta:**
    1. **O sino do peixe:** em Iasos, um citaredo tocava quando soou o sino que abria a venda do peixe; todos correram, menos um
       homem — ele era surdo (Estrabão XIV.2.21).
    2. **A medida «do povo»** carimbada.
- **Egípcio — o Mercado do Rio:**
  - **cômodos:** sem prédio — as barracas no cais e na beira do rio, à sombra de toldos;
  - **coisas:** os cestos de peixe, as jarras de unguento, o pão, a cerveja, os colares, as sandálias;
  - **a troca:** **sem moeda — tudo é trocado contando em *debens* de cobre** (o preço de um caixão, de um boi, de uma cabra nas
    contas de Deir el-Medina);
  - **quem:** os vendedores e as vendedoras; os marinheiros que descem para comprar;
  - **de boca aberta:** **o babuíno de coleira que agarra o ladrão pela perna** — o mercado do túmulo de Niankhkhnum e
    Khnumhotep, em Sacará.
- **Asteca — o *tianguis* de Tlatelolco** (Cortés, 2.ª carta; Díaz, cap. 92):
  - **o tamanho:** uma praça cercada de pórticos, com **sessenta mil pessoas por dia** (Cortés); uma estimativa moderna dá de 20 a
    25 mil;
  - **as ruas:** **cada coisa tem a sua rua:**
    - a das ervas e a dos boticários;
    - a dos barbeiros;
    - a das casas de comer;
    - a do algodão, a das plumas e a do ouro;
    - a das peles de onça, a da louça;
    - a do sal, a da cal;
    - **a dos escravos de coleira**;
  - **os juízes:** **numa casa do mercado sentam dez ou doze juízes** que julgam ali mesmo, e os fiscais andam conferindo as
    medidas;
  - **o dinheiro:**
    - **o grão de cacau**, a manta de algodão, **o machadinho de cobre**;
    - **os canudos de pena cheios de pó de ouro**;
    - **o cacau falso:** o grão esvaziado e cheio de terra (Sahagún);
  - **sons e cheiros:** o vozerio que se ouvia a uma légua (Díaz); as flores, a pimenta, o copal, a comida;
  - **de boca aberta:**
    1. **Os juízes julgando no meio da feira.**
    2. **Nenhuma balança: tudo por conta e por medida.**
    3. **O pó de ouro dentro da pena.**
- **Nórdico — a feira** (Birka, Hedeby, Kaupang):
  - **cômodos:** as barracas e as tendas; os píeres; as oficinas em volta;
  - **coisas:**
    - **a balança de dobrar na sua caixinha de bronze**, com os pesos (o octaedro de bronze, o redondo achatado);
    - **a prata cortada (*hacksilver*)**, testada com um talho de faca — **as marcas de faca** nas moedas;
    - as moedas árabes; as peles; o marfim de morsa; o âmbar; as contas; o pano frísio;
    - **o pentieiro**, que faz pentes de chifre de rena e de veado na hora;
  - **quem:** os mercadores de fora; o oficial do rei (a paz do mercado); os escravos à venda;
  - **de boca aberta:** **a balança de bolso do mercador**; **a prata picada pelo peso**; **o pente nascendo de um chifre**.
  - **no mundo do jogo:** a prata não existe (buraco 8); o âmbar e o vidro das contas também não.
- **Clássico — o mercado da porta e do cais (Kanesh, Ur):**
  - **cômodos:** a praça diante da porta da cidade e o *kārum* do rio; as casas dos mercadores com os arquivos;
  - **coisas:**
    - **os pesos de hematita em forma de pato**, a balança de pratos;
    - **os anéis de prata** (dinheiro de pesar);
    - **o grão como moeda**;
    - as cartas em envelopes de barro;
  - **de boca aberta:** **os preços escritos na lei** — as leis de Eshnunna dizem quantos litros de cevada valem um siclo de prata,
    e quanto custa o aluguel de um barco; **o pato de pedra que pesa**.
  - **no mundo do jogo:** a prata é o buraco 8 — o anel de cobre pode fazer o papel.

## 9. O celeiro (o hórreo, o celeiro real, o silo; 8 m)

- **Romano — o *horreum*:**
  - **coisas:**
    - **o chão suspenso sobre pilaretes ou sobre muretas**, para o ar correr embaixo;
    - as paredes grossas com contrafortes, contra o empuxo do grão;
    - as frestas de ventilar;
    - as plataformas de carga;
    - **as paredes rebocadas com a borra do azeite** (*amurca*) contra o caruncho (Columela I.6; Varrão I.57);
  - **o tamanho:** o *Horrea Galbana*, em Roma, tinha ≈ 140 salas só no térreo;
  - **quem:** os medidores (*mensores*), com **o módio e a régua de rasar** — **o mosaico da sala dos medidores de Óstia** os
    mostra medindo, um enchendo, um rasando, um contando;
  - **sons e cheiros:** a pá raspando, **a contagem em voz alta**; o pó do grão, o rato;
  - **de boca aberta:** **o mosaico dos medidores**; **o grão de Roma distribuído com fichas** (as *tesserae frumentariae*) no
    Pórtico de Minúcio.
- **Grego — o celeiro:**
  - **coisas:** o grão em píthoi enterrados até o pescoço, nos depósitos; a eira de bater do lado de fora;
  - **quem:** **os guardas do grão** (*sitophylakes*), que vigiam o preço;
  - **de boca aberta:** **os silos sagrados de Elêusis**, que recebiam **as primícias da cevada e do trigo de todos os atenienses e
    aliados** (o decreto IG I³ 78).
- **Egípcio — o Celeiro Real:**
  - **coisas:**
    - **o pátio com fileiras de silos de tijolo em cúpula**, enchidos por cima, por escadas, e esvaziados por uma portinha no pé;
    - **os escribas na porta e no telhado contando cada saco**;
    - as abóbadas do Ramesseum;
  - **de boca aberta:** **a maquete do celeiro de Meketré** (Met Museum) — os escribas sentados escrevendo, os carregadores subindo
    a escada com os sacos, o grão em montes nas tulhas; e **o gato da casa**, guarda do grão.
- **Asteca — o celeiro e o *petlacalco*:**
  - **coisas:**
    - **o *cuezcomatl***: o jarrão de barro e palha sobre a base de pedra, com o chapéu de palha;
    - o depósito real do milho, do feijão, da chia e **do amaranto** (*huauhtli*), com o mordomo e as contas;
  - **de boca aberta:** **a imagem do deus feita de massa de amaranto com mel** (*tzoalli*), comida pelo povo na festa (Sahagún).
  - **no mundo do jogo:** o milho já tem causa; o amaranto e a chia não existem.
- **Nórdico — o silo:**
  - **coisas:**
    - **o depósito sobre quatro postes**, alto contra os ratos (comum na Idade do Ferro);
    - as arcas de grão;
    - **o *búr*** com os barris de *skyr*, de manteiga e de **soro azedo** (*sýra*), onde se conserva a carne;
    - **o peixe seco nas armações de secar**, meses ao vento;
  - **de boca aberta:** **as armações cheias de bacalhau secando**; **as chaves da dona**.
  - **no mundo do jogo:** o bacalhau existe no jogo (a salga).
- **Clássico — os depósitos de Cnossos e de Pilos:**
  - **coisas:**
    - **as galerias do oeste de Cnossos**: ≈ 18 corredores estreitos com **fileiras de píthoi maiores que um homem**, de cordões em
      relevo, e **caixas fundas escondidas no chão** (*kaselles*);
    - em Pilos, os píthoi do azeite engastados em bancos de barro;
    - **as portas fechadas com o selo de barro**;
  - **de boca aberta:** **o corredor dos píthoi gigantes** na meia-luz.

## 10. O quartel (o castro, o ginásio militar, o quartel do faraó, a casa dos guerreiros, o salão dos guerreiros; 8 m)

- **Romano — o castro** (a fortaleza da legião):
  - **cômodos:**
    - **o quartel-general** (*principia*): o pátio com os depósitos de armas em volta e a basílica com o tribunal; no fundo do
      meio, **a capela das insígnias, com a águia**, e **embaixo dela o cofre-forte** com as economias dos soldados e o
      dinheiro do soldo;
    - **as casernas:** o prédio comprido de dez quartos (*contubernia*), **cada um com duas salas — a da frente para as armas, a
      de trás para dormir oito homens** —; a casa do centurião na ponta;
    - os fornos no pé da muralha;
    - **a latrina coletiva com o canal de água corrente**;
    - o hospital; os celeiros; a oficina;
  - **coisas:** os beliches; os ganchos das armas; **as tabuinhas de madeira** das escalas de serviço;
  - **sons e cheiros:** a trombeta das vigílias; a ordem-unida; o couro, o óleo, a fumaça, a latrina;
  - **de boca aberta:**
    1. **A águia na sua capela e o cofre embaixo.**
    2. **A latrina de banco corrido, com a esponja no pau** (*tersorium*; Housesteads).
    3. **A carta de Vindolanda:** «mandei-te meias, dois pares de sandálias e duas cuecas»; e **o convite de aniversário de uma
       mulher de oficial para outra** — tudo em folhas de madeira escritas a tinta.
- **Grego — o ginásio militar** (o ginásio, a palestra; e em Esparta, a mesa comum):
  - **cômodos:**
    - **o pátio de areia** para a luta;
    - **a sala de despir** (*apodyterion*);
    - **a sala do azeite** (*elaiothesion*), onde se unta o corpo;
    - **a sala do pó** (*konisterion*), onde se polvilha o corpo untado;
    - **a sala do saco** (*korykeion*), com um saco de areia, de farinha ou de figos para socar;
    - **o lavatório** de bacias de água fria;
    - **a sala dos efebos**, de bancos;
    - **a pista coberta** (*xystos*) para correr no inverno;
  - **um aviso:** **o hoplita guardava as armas em casa** — a pólis não tinha caserna;
  - **sons e cheiros:** o baque da luta; o mestre de luta com a vara bifurcada; o azeite, o pó, o suor;
  - **de boca aberta:**
    1. **A sala do pó.**
    2. **O saco de figos para socar.**
    3. **O caldo negro de Esparta** (de sangue de porco e vinagre) na mesa comum de quinze homens.
- **Egípcio — o quartel do faraó** (o acampamento de Kadesh, nos relevos de Ramsés II; as casernas de Amarna):
  - **cômodos:**
    - **o acampamento retangular cercado de escudos postos de pé, como uma muralha**;
    - **a tenda do rei** no meio;
    - os carros estacionados em fileira, os cavalos desatrelados;
    - os soldados comendo; os burros descarregados;
    - **um soldado sendo surrado**;
  - **coisas:**
    - os arcos e as flechas às centenas;
    - os escudos de couro;
    - a espada curva (*khopesh*);
    - **o escriba anotando as armas que entrega**;
  - **de boca aberta:** **o leão de estimação do faraó** deitado no acampamento (os relevos de Kadesh); **a muralha de escudos**.
- **Asteca — a Casa dos Guerreiros** (a Casa das Águias, junto do Templo Mayor; a casa dos moços):
  - **cômodos e coisas:**
    - **os bancos de pedra com relevos pintados de guerreiros em procissão** indo a uma bola de capim espetada de espinhos
      sangrentos (*zacatapayolli*);
    - **às portas, os guerreiros-águia de barro em tamanho natural**, pintados e com plumas, e as figuras de Mictlantecuhtli
      (INAH; Museo del Templo Mayor);
    - **o arsenal:** os escudos, as espadas de gume de obsidiana, os dardos, **a couraça de algodão acolchoada**;
    - **na casa dos moços** (*telpochcalli*): os rapazes dormem, varrem, buscam lenha, treinam e, ao anoitecer, vão dançar na
      **casa do canto** (*cuicacalli*);
  - **de boca aberta:**
    1. **O guerreiro-águia de barro guardando a porta.**
    2. **O traje e o penteado pelo número de cativos:** o veterano de quatro cativos usa o cabelo amarrado em coluna
       (*temillotl*) (o Códice Mendoza).
  - **no mundo do jogo:** o algodão da couraça e a obsidiana das armas são buracos (2, 7).
- **Nórdico — o salão dos guerreiros** (Trelleborg, c. 980; a *hirð*):
  - **cômodos:**
    - **o forte redondo de Trelleborg**: a muralha em círculo perfeito, quatro portas, quatro quarteirões, **quatro casas
      compridas de ≈ 29 m em quadrado em cada um**, de paredes arqueadas;
    - dentro de cada casa: o fogo comprido e os bancos;
  - **coisas:** **as armas penduradas sobre o lugar de dormir de cada homem**; os escudos na parede;
  - **de boca aberta:**
    1. **O círculo perfeito, medido a corda.**
    2. **A lei dos jomsvíquingues da saga:** nenhum homem foge de quem tem armas iguais; o saque é de todos; nenhuma mulher no forte.
- **Clássico — o «palácio de revista» assírio** (o Forte de Salmanasar, em Nimrud) e os carros de guerra de Cnossos:
  - **cômodos:**
    - os pátios enormes para passar em revista os carros e os cavalos;
    - **os depósitos do tributo e do saque**;
    - a sala do trono com a base do trono esculpida;
  - **coisas:** **as tabuinhas dos carros de Cnossos**: as rodas, as caixas, «um par de rodas cintadas de bronze, que não
    servem»;
  - **de boca aberta:** **o depósito dos marfins de Nimrud** — milhares de placas de marfim lavrado de móveis, amontoadas nos
    depósitos do forte.

---

## 11. A biblioteca, a escola e a academia (Biblioteca, Academia, Casa da Vida, Calmécac, Casa dos Escaldos; 8 / 16 m)

- **Romano — a biblioteca e a escola:**
  - **cômodos — a biblioteca:**
    - **a Biblioteca Úlpia**: duas salas, a grega e a latina, uma diante da outra, **com a Coluna de Trajano entre elas**; nas
      paredes, os nichos com armários de madeira de portas numeradas; uma estátua no nicho do meio; uma galeria em cima;
    - **a de Celso, em Éfeso:** os nichos em três níveis e **uma parede dupla, com um vão entre as duas, contra a umidade**
      (≈ 12 mil rolos); **o túmulo do fundador numa cripta embaixo**;
    - **a Vila dos Papiros**, em Herculano: uma sala pequena com os armários no meio e nas paredes, ≈ 1.800 rolos carbonizados;
  - **a regra da casa:** «nenhum livro sai, porque juramos; aberta da primeira à sexta hora» (a inscrição da biblioteca de
    Panteno, na ágora de Atenas);
  - **a luz:** Vitrúvio (VI.4) manda **virar a biblioteca para o nascente**, pela luz da manhã e contra a umidade e as traças;
  - **cômodos — a escola:**
    - **a escola é um pórtico do fórum** com uma cortina, os meninos em bancos com a tabuinha de cera nos joelhos;
    - o mestre com a palmatória (*ferula*);
    - o ábaco de pedrinhas (*calculi*);
  - **de boca aberta:**
    1. **O afresco da escola no fórum** (as Propriedades de Júlia Félix, em Pompeia): **um menino seguro nas costas de outro,
       levando a vara**.
    2. **O mestre que grita antes do galo cantar** (Marcial IX.68).
    3. **A parede dupla** de Celso.
  - **no mundo do jogo, sem papiro:**
    - os armários guardam **blocos de tabuinhas de cera**, **folhas de madeira dobradas em sanfona** escritas a tinta, **as placas
      de bronze das leis**;
    - **o pergaminho** chega com o saber V (o couro).
- **Grego — a Academia:**
  - **cômodos:**
    - **o bosque de Academo**, com as oliveiras, o ginásio e **a êxedra** (o banco em meia-lua onde o mestre ensina);
    - **o Liceu**, com o passeio coberto (*peripatos*), onde se ensina andando;
    - **o Pórtico Pintado** (*Stoa Poikile*), onde Zenão ensinava, **sob as pinturas da batalha de Maratona**;
    - a biblioteca de Pérgamo, com **a estátua de Atena de 3,5 m**, as prateleiras nos nichos e a sala de ler de bancos;
  - **a escola das letras** (a taça de Duris, em Berlim):
    - o mestre de lira com o menino; outro mestre corrigindo a tabuinha;
    - **o pedagogo**, o escravo, sentado vigiando;
    - **na parede, penduradas:** as liras, o cesto, o estojo de rolos, as taças;
  - **de boca aberta:**
    1. **O mosaico da Academia** (Torre Annunziata): sete filósofos sob uma árvore, **um relógio de sol numa coluna**, uma esfera
       ou uma caixa de desenhos no chão.
    2. **A geometria na areia:** **o quadro de pó** (*abax*) onde se riscam as figuras — Arquimedes, morto enquanto riscava os
       seus círculos.
  - **no mundo do jogo:** o material grego é **o barro** (o óstraco: o caco que serve de caderno) e a cera.
- **Egípcio — a Casa da Vida** (*per ankh*) e a escola dos escribas:
  - **cômodos:**
    - **a Casa da Vida:** o lugar dos textos sagrados, da medicina e da magia; **em Amarna, tijolos carimbados «Casa da Vida»**;
    - **a Casa dos Livros de Edfu:** uma salinha na hipostila com **o catálogo dos livros gravado nas paredes** e os nichos dos
      rolos (UCL; Yale);
  - **coisas:**
    - **os rolos de papiro** em jarras e em arcas etiquetadas;
    - a paleta, os juncos;
    - **a tinta preta de fuligem e goma, e a vermelha dos títulos e das correções**;
    - a vasilha de água;
    - **os óstracos de calcário** dos alunos, com as correções do mestre em vermelho;
    - as tábuas de escrever;
  - **quem:** os sacerdotes-leitores, os copistas, os médicos, os meninos da escola;
  - **de boca aberta:**
    1. **O catálogo gravado na parede.**
    2. **«O ouvido do menino está nas costas: ele escuta quando apanha»** (os papiros escolares).
    3. **O escriba de pernas cruzadas** com o junco atrás da orelha.
- **Asteca — o Calmécac:**
  - **o que é:** a escola dos sacerdotes e dos nobres, junto do templo;
  - **a vida:**
    - **os moços levantam à meia-noite** para oferecer copal;
    - **sangram-se com espinhos de maguey**, que ficam espetados na bola de capim (o *zacatapayolli* dos relevos da Casa das
      Águias);
    - banham-se na água fria de noite; jejuam;
  - **o estudo:** os cantos (*cuicatl*); o calendário; **os códices**; os astros; a história; a lei; **a fala bonita dos velhos**
    (*huehuetlahtolli*);
  - **a casa dos livros** (*amoxcalli*): **os códices dobrados em sanfona**, de amate ou de couro de veado coberto de gesso,
    pintados;
  - **de boca aberta:**
    1. **O códice aberto em sanfona de ponta a ponta de uma mesa comprida.**
    2. **«A tinta preta e a tinta vermelha»** (*in tlilli in tlapalli*) quer dizer **o saber** em náuatle.
    3. **O búzio da meia-noite** acordando a casa.
  - **no mundo do jogo:**
    - **o que já tem causa:** o amate; o couro;
    - **o buraco:** o maguey dos espinhos (o buraco 2).
- **Nórdico — a Casa dos Escaldos:**
  - **o que é:** não há livro: a escola é o salão e a criação na casa de outro (*fóstr*);
  - **o estudo:** o escaldo decora os nomes poéticos (as *kenningar*);
  - **a escrita:** as runas talhadas em pau e em osso — o alfabeto de 16 runas;
  - **cômodos:** o assento do mestre-escaldo; os bancos de quem ouve; a lira; o chifre;
  - **de boca aberta:**
    1. **Egil compõe numa noite «O Resgate da Cabeça»** (*Höfuðlausn*) e salva a vida diante do rei Erik Machado-de-Sangue (a
       *Saga de Egil*).
    2. **O hidromel da poesia**, que Odin roubou voando como águia.
    3. **A vareta rúnica** passada de mão em mão.
- **Clássico — a «casa das tabuinhas»** (*edubba*), o arquivo e a biblioteca de tabuinhas:
  - **cômodos:**
    - **a Casa F de Nippur** (c. 1750 a.C.): uma casa pequena; **a sala onde estava a maior parte das tabuinhas tem 3 × 5 m**, e
      metade delas são exercícios de principiante (Robson; ISAC);
    - **o arquivo de Ebla:** **as prateleiras de madeira** com as tabuinhas de pé, inclinadas para trás, a frente para fora, para
      se ler o começo de cada uma de relance;
    - **a biblioteca de Assurbanipal** em Nínive (≈ 30 mil tabuinhas e cacos);
  - **coisas:**
    - **as tabuinhas lenticulares**, com o modelo do mestre de um lado e a cópia do aluno do outro;
    - o estilete de junco de ponta triangular;
    - o barro molhado — **a tabuinha velha amolece e volta a ser barro** **(a conferir)**;
  - **quem:** o «pai da escola» (*ummia*) e o «irmão mais velho», o monitor;
  - **de boca aberta:**
    1. **O menino da escola conta o dia** (o texto «Os Dias de Escola»): «o porteiro me bateu, o encarregado do sumério me bateu».
    2. **A maldição do colofão:** «quem levar esta tabuinha, que os deuses apaguem o seu nome».
    3. **As tabuinhas inclinadas de Ebla**, que só se salvaram porque o palácio pegou fogo e as cozeu.

## 12. Os banhos (os banhos de 8 m, as termas de 20 m, as grandes termas de 28 m)

- **Romano — as Termas:**
  - **cômodos** (o caminho):
    - **a palestra** (o pátio de exercício);
    - **a sala de despir** (*apodyterium*), com os nichos para a roupa, os bancos e **o escravo que vigia a roupa**;
    - **a fria** (*frigidarium*), com a piscina fria;
    - **a morna** (*tepidarium*);
    - **a quente** (*caldarium*): a piscina quente (*alveus*) e, na abside, **o *labrum***, a bacia de água fresca num pé;
    - **a de suar a seco** (*laconicum*);
    - as latrinas;
  - **o calor:**
    - **o hipocausto:** o chão sobre pilhas de tijolos, e o ar quente da fornalha passando por baixo e subindo pelas paredes em
      tijolos ocos (*tubuli*);
    - **o chão tão quente que se anda de tamanco de madeira**;
    - **a fornalha** (*praefurnium*) com o foguista;
  - **coisas:** **o raspador curvo** (*strigilis*) e o frasco de azeite;
  - **cores:** os mármores; **os mosaicos do mar** (Netuno, tritões, golfinhos); as abóbadas pintadas de azul;
  - **luz:**
    - as termas do Império tinham janelas enormes, e Sêneca zomba do banho escuro de Cipião (*Cartas* 86) — no jogo, janelas
      abertas, sem vidro;
    - à noite, as lucernas;
  - **sons e cheiros** (Sêneca, *Cartas* 56, que morava em cima de um banho):
    - **os sons:** o gemido de quem levanta pesos; o tapa das mãos do massagista; o jogador de bola contando os pontos; **o
      depilador gritando fino para chamar freguês**; o vendedor de salsicha e o de doces; **o eco**;
    - **os cheiros:** a fumaça de lenha, o azeite perfumado, o suor;
  - **de boca aberta:** **o chão que queima o pé**; **a lista do barulho de Sêneca**; **o *labrum* de água fria no meio do vapor**.
- **Grego — os banhos** (*balaneion*):
  - **cômodos:**
    - **a sala redonda (*tholos*) com as banheiras de assento** em roda, como pétalas; o banhista senta e **o banheiro derrama a
      água por cima — ninguém se mergulha**;
    - em Olímpia, as banheiras de assento numa sala retangular e uma piscina;
    - **na Sicília (Gela), os primeiros hipocaustos** da Grécia;
    - no ginásio, **o *louterion***, a bacia de pé para lavar;
  - **quem:** o banheiro (*balaneus*), figura da comédia;
  - **de boca aberta:** **a roda de banheiras de barro**; **a água quente derramada da jarra sobre a cabeça**.
- **Egípcio — o Lago Sagrado:**
  - **o lago:** o do templo, de pedra, com escadas (o de Karnak tem ≈ 120 × 77 m), onde **os sacerdotes se purificam duas vezes de
    dia e duas de noite** (Heródoto II.37);
  - **os gansos de Amon** nadam no lago sagrado;
  - **a «Casa da Manhã»**, onde o rei se purifica antes de entrar no templo;
  - **na casa:** o banheiro da laje de pedra, com o criado derramando a água;
  - **tarde:** em Taposíris Magna, um banho de sala redonda grega com **um aquecimento egípcio próprio, de paredes quentes**;
  - **de boca aberta:**
    1. **Os sacerdotes descendo as escadas do lago à noite, com tochas.**
    2. **Os gansos sagrados.**
  - **no mundo do jogo:** o natrão de lavar não existe (o buraco 10).
- **Asteca — o *temazcal*:**
  - **cômodos:** **a cúpula baixa** de adobe ou de pedra — entra-se de gatinhas —, com **a fornalha** (*xictli*) encostada na
    parede de fora, esquentando as pedras da parede de dentro;
  - **coisas:**
    - **a água atirada na parede quente** faz o vapor;
    - **os feixes de ervas** com que a curandeira bate no corpo;
    - as esteiras;
  - **quem:** a curandeira e parteira; **a mulher depois do parto**; a deusa dos banhos, a «avó» (*Temazcalteci*);
  - **luz:** o escuro e o brilho da parede quente;
  - **sons e cheiros:** o chiado do vapor; as ervas, a fumaça, a pedra molhada;
  - **de boca aberta:** **entrar de gatinhas no escuro e o vapor explodir da parede**; **o feixe de ervas na pele**.
- **Nórdico — a sauna** (a casa de banho, *baðstofa*):
  - **cômodos:**
    - a casa de banho com **as pedras aquecidas no fogo** e a água jogada nelas para o vapor;
    - os bancos em alturas diferentes;
    - fora, o riacho ou a neve;
    - **na Islândia, as fontes quentes**: o poço de Snorri em Reykholt — **uma bacia de pedra de ≈ 4 m**, cheia por um cano de uma
      fonte quente, **com uma passagem subterrânea até a casa**;
  - **de boca aberta:**
    1. **O banho quente ao ar livre na neve.**
    2. **Sábado em nórdico antigo é «o dia de lavar»** (*laugardagr*) — e um cronista inglês do séc. XIII reclamava que os
       dinamarqueses se penteavam todo dia, tomavam banho todo sábado e assim seduziam as mulheres **(a conferir o cronista)**.
- **Clássico — a bacia lustral e a banheira pintada:**
  - **coisas:**
    - **a bacia lustral** dos palácios de Creta (um poço de degraus forrado de gesso, para a água da purificação);
    - **a banheira de barro de Pilos**, com um degrau para entrar e **pintada por dentro**, e as jarras de água ao lado;
    - **os canos de barro de Cnossos**, cônicos, encaixados uns nos outros;
    - **em Mari, as salas molhadas de chão de betume**, com as bacias de barro;
  - **de boca aberta:** **a banheira de Pilos é onde a *Odisseia* põe o banho de Telêmaco, dado pela princesa Policasta** (III.464).

## 13. O teatro e o anfiteatro (Arena, Teatro, Jardim Sagrado, Campo de Pelota, Salão do Hidromel; 24 / 32 / 40 m)

- **Romano — a Arena** (o anfiteatro; o Coliseu é a maravilha):
  - **cômodos:**
    - **a arquibancada pela classe:** o pódio dos senadores e o camarote do imperador (*pulvinar*); os cavaleiros; a plebe;
      **as mulheres lá em cima** (a lei de Augusto);
    - **a areia** (*harena*);
    - **o subterrâneo** (*hypogeum*): dois andares de corredores, as jaulas, **dezenas de elevadores de madeira de contrapeso e
      cabrestante, e os alçapões**;
    - **o toldo** (*velarium*), manobrado por marinheiros da frota;
    - as saídas (*vomitoria*); os corredores debaixo dos assentos;
  - **sons e cheiros:**
    - **os sons:** a multidão; **o leão rugindo debaixo do chão**; **o órgão de água** (*hydraulis*) e as trompas (o mosaico de
      Zliten);
    - **os cheiros:** **a chuva de água com açafrão** (*sparsiones*), a areia, os bichos;
  - **luz:** a sombra do toldo e o escuro do subterrâneo, de lucernas;
  - **de boca aberta:**
    1. **A fera subindo do chão pelo elevador.**
    2. **A chuva perfumada de açafrão.**
    3. **No teatro romano, a cortina desce para um fosso no começo e sobe do chão no fim** (o *aulaeum*).
- **Grego — o teatro:**
  - **cômodos:**
    - a arquibancada (*koilon*);
    - **a orquestra redonda** com **o altar de Dioniso** (*thymelê*) no meio;
    - a *skênê* com três portas;
    - **a primeira fila de tronos de mármore** com os nomes dos sacerdotes, e o do sacerdote de Dioniso no meio;
  - **coisas:**
    - as máscaras;
    - **a plataforma de rodas** (*ekkyklêma*), que traz o «dentro» para fora;
    - **o guindaste** (*mêchanê*) que desce o deus;
    - os bilhetes de bronze;
    - o público traz almofada e comida;
  - **sons e cheiros:** o coro; o *aulos*; os figos e o vinho;
  - **de boca aberta:**
    1. **O deus descendo pelo guindaste.**
    2. **O trono de mármore com o nome do sacerdote.**
    3. **A acústica de Epidauro:** uma moeda que cai na orquestra ouve-se lá em cima, diz a fama **(a conferir)**.
- **Egípcio — o Jardim Sagrado:**
  - **cômodos:**
    - **o jardim do templo** com o tanque em T, os sicômoros e as pérseas, os canteiros;
    - **as festas:** a de Opet (a barca do deus levada de Karnak a Lúxor, com músicos, **dançarinas acrobatas** que se dobram
      para trás e tambores núbios);
    - **os Mistérios de Osíris em Abidos**, a morte e a volta do deus encenadas com a barca (a estela de Ikhernofret);
  - **de boca aberta:**
    1. **As acrobatas dobradas em arco** na procissão.
    2. **O drama de Osíris** encenado.
- **Asteca — o Campo de Pelota** (*tlachtli*):
  - **cômodos:**
    - **a quadra em forma de I**, de paredes inclinadas rebocadas;
    - **os anéis de pedra** no alto de cada parede;
    - os templozinhos nas pontas;
    - o *tzompantli* perto;
  - **coisas:**
    - **a bola de borracha maciça e pesada** (*olli*), batida com as ancas;
    - as proteções de couro;
    - **as apostas:** as mantas, o ouro, os escravos;
  - **sons e cheiros:** **o baque da bola no reboco**; a multidão; o tambor;
  - **de boca aberta:** **a bola que passa pelo anel — tão rara que o jogador podia tomar as mantas de quem assistia** (Durán).
  - **no mundo do jogo:** **a borracha não existe** — um buraco a abrir (a árvore da borracha da selva).
- **Nórdico — o Salão do Hidromel:**
  - **o lugar:** o palco é o salão: **o escaldo recita diante do assento alto** e recebe um anel de ouro;
  - **o que se faz:** o duelo de insultos; os jogos de tabuleiro;
  - **fora:** **as lutas de cavalos** (*hestavíg*) e a luta *glíma*;
  - **de boca aberta:** **o anel de ouro tirado do braço do jarl** e dado ao poeta.
- **Clássico — o teatro em meia-lua** (o `halfBowl` do jogo) e o pátio do touro:
  - **cômodos:** **as «áreas teatrais» de Cnossos e de Festo** — degraus largos de pedra no canto de um pátio calçado, para algumas
    centenas, com a passarela elevada das procissões;
  - **o espetáculo:** **o salto do touro** no pátio central (o afresco do Toureiro);
  - **de boca aberta:**
    1. **O moço dando a cambalhota sobre o lombo do touro.**
    2. **«O chão de dança que Dédalo fez para Ariadne em Cnossos»** (*Ilíada* XVIII.590).

---

## 14. A mina (no jogo, só a forma de fora: o morro, a boca escorada, os trilhos, o carrinho)

- **Romano** (Las Médulas, Rio Tinto, Dolaucothi; Plínio XXXIII.70–78):
  - **a obra:** as galerias, as colunas de rocha deixadas, as escoras de madeira, **os nichos das lucernas a cada poucos passos**;
  - **o fogo:** **o fogo na rocha e a água (ou o vinagre) jogada para rachá-la**;
  - **as ferramentas:** as picaretas, as cunhas, o malho; os cestos de esparto;
  - **a água:** **as rodas de tirar água em série**, uma acima da outra, para secar o fundo (Rio Tinto);
  - **quem:** os escravos e **os condenados «às minas»** (*damnatio ad metalla*); segundo Plínio, os mineiros passavam meses sem
    ver o dia;
  - **de boca aberta:** **a «ruína dos montes»**: as galerias cavadas no morro e depois inundadas de uma vez com a água das
    represas, até o morro inteiro desabar (Las Médulas).
- **Grego** (o Láurio):
  - **a obra:** as galerias estreitas, algumas de rastejar, e os poços fundos;
  - **quem:** os escravos alugados — **Nícias tinha mil escravos alugados para as minas** (Xenofonte, *Rendas* IV.14);
  - **a lavagem do minério:** as lavanderias, com as cisternas e as mesas de lavar em caracol;
  - **o turno:** medido pelo azeite da lamparina **(a conferir)**;
  - **de boca aberta:** **a prata do Láurio pagou a frota que venceu em Salamina** (Heródoto VII.144);
  - **no mundo do jogo:** a prata não existe — a mina grega do jogo é de cobre, de ferro ou de ouro.
- **Egípcio:**
  - **as minas de ouro do deserto do leste e da Núbia** (Agatárquides, em Diodoro III.12–14): **os trabalhadores acorrentados**;
    as lamparinas presas na testa **(a conferir)**; os meninos tirando o minério; **os velhos e as mulheres moendo nas mós**; a
    lavagem em tábuas inclinadas — e **os grilhões de ferro achados na mina de Ghozza** confirmam o relato;
  - **o turquesa de Serabit el-Khadim** (Sinai), com o templo de Hathor, «Senhora da Turquesa»;
  - o cobre de Timna;
  - **de boca aberta:**
    1. **O Mapa de Turim** (c. 1150 a.C.), **o mapa geológico mais antigo**: os morros do ouro pintados de rosa e de preto, as
       casas dos mineiros, o poço, o templo.
    2. **Nas minas de turquesa nasceu o alfabeto** — as inscrições protossinaíticas dos mineiros.
- **Asteca:**
  - **as minas de obsidiana** da Serra das Navalhas (Pachuca): os poços, as galerias, **a obsidiana verde-dourada**;
  - **o ouro** não se cavava: catava-se nos rios — o ouro é *teocuitlatl*, «o excremento dos deuses»;
  - **no mundo do jogo:** a mina asteca de metal de rocha não é asteca; a de obsidiana é o buraco 7.
- **Nórdico:**
  - **não havia mina de ferro: o ferro vinha do pântano** — o minério tirado do fundo da turfa e do lago, torrado e reduzido;
  - as **pedreiras de pedra-sabão**, com as cicatrizes das tigelas na parede;
  - **as pedras de amolar de Eidsborg**, vendidas até Hedeby;
  - **no mundo do jogo:** o ferro do pântano é uma jazida nova possível (o pântano já existe no mundo).
- **Clássico** (as minas de cobre de Timna e de Feinan; Chipre, que deu nome ao cobre):
  - os poços com degraus cavados na rocha;
  - os martelos de pedra;
  - **os fornos com os bicos do fole** e os montes de escória;
  - **de boca aberta:** **a carta de reclamação mais antiga do mundo** (Ur, c. 1750 a.C.): Nanni escreve a Ea-nasir que o cobre
    que ele mandou não presta e que o mensageiro foi maltratado.

## 15. A fazenda (no jogo, o campo, o pomar, o vinhedo, a plantação, o curral)

- **Romano — a *villa rustica*** (a Villa Regina em Boscoreale; Catão, *Agricultura*):
  - **cômodos:**
    - **o pátio com os dólios enterrados até o pescoço** (os dezoito da Villa Regina, para o vinho);
    - **a prensa de alavanca** (*torcularium*), com a viga e o tanque de pisar;
    - a eira; o celeiro; o estábulo;
    - a cozinha com o larário;
    - os quartos dos escravos;
  - **quem:** o capataz (*vilicus*) e a capataz (*vilica*); o cão acorrentado;
  - **de boca aberta:** **o campo de bocas de dólios no chão do pátio**; **a pisa das uvas cantando**.
- **Grego:**
  - **cômodos:**
    - a casa de fazenda **com a torre** (as torres da Ática; a casa de Vari);
    - **a eira redonda calçada**, com os bois pisando o grão em roda;
    - o lagar de azeite; os píthoi;
  - **de boca aberta:** **as colmeias de barro da casa de Vari**; o calendário do campo de Hesíodo (*Os Trabalhos e os Dias*).
- **Egípcio:**
  - **cômodos:**
    - a casa do senhor **com o jardim e o tanque de peixes e de patos** (a pintura de Nebamon);
    - o celeiro;
    - **o *shaduf***, a vara de balde que tira a água do canal;
  - **o trabalho:** o grão pisado por bois e por burros; as mulheres jogando o grão para o vento;
  - **de boca aberta:**
    1. **A contagem do gado** (a maquete de Meketré): o senhor na varanda, os escribas escrevendo, os vaqueiros passando com os
       bois.
    2. **Os «esticadores de corda»** medindo o campo com a corda de nós (o túmulo de Menna).
- **Asteca — a *chinampa*:**
  - **cômodos:**
    - a casa de junco e de barro sobre o canteiro;
    - a canoa amarrada;
    - **os salgueiros** (*ahuejote*) que seguram a beira;
    - o celeiro; os perus; o cão;
  - **o trabalho:**
    - **o lodo tirado do canal** para adubar;
    - **as mudas criadas em cubos de lodo** cortados a faca e transplantados;
  - **de boca aberta:** **os canteiros na água, com a canoa no lugar da carroça**; **os cubos de lodo com as mudas**; **as
    chinampas de flores de Xochimilco**.
- **Nórdico:**
  - **cômodos:**
    - a casa longa com o curral;
    - **o campo de feno da casa**, cercado por um muro de turfa;
    - o pasto de fora;
    - **a cabana de verão** (*sel*), no alto, onde as mulheres faziam a manteiga e o queijo;
    - os anexos: a forja, a casa de banho, o depósito, o *naust*;
  - **de boca aberta:** **o gado passando o inverno dentro da casa**; **a cabana do verão no morro**.
- **Clássico** (a Mesopotâmia):
  - **coisas:**
    - **o arado com o funil de semear** (o arado-semeadeira dos selos babilônicos);
    - **o trenó de debulhar com dentes de pedra lascada** (*tribulum*);
    - **os palmares de tâmara**;
    - os canais;
  - **de boca aberta:** **os homens subindo nas palmeiras para polinizar à mão**; **as «Instruções do Lavrador»**, o manual
    sumério do campo.

## 16. A escola de gladiadores (não existe no jogo; o modelo é romano)

- **Romano — o *ludus*** (o *Ludus Magnus* junto do Coliseu; o quartel dos gladiadores de Pompeia):
  - **cômodos:**
    - **a pequena arena de treino** no meio, com arquibancadas;
    - **as celas em volta**, em dois ou três andares;
    - o arsenal; a enfermaria; a cozinha;
    - **o túnel até o Coliseu**, que os textos citam e a escavação ainda não confirmou;
    - **em Pompeia:** o pórtico quadrado atrás do teatro grande, transformado em quartel depois do terremoto de 62;
  - **coisas:**
    - **o poste de treino** (*palus*);
    - **a espada de madeira** (*rudis*), que também é **o prêmio da liberdade**;
    - **os elmos de relevo e as caneleiras de bronze**, muitos com a marca NER (os neronianos de Cápua);
    - **o cepo dos presos** numa sala do lado oeste;
  - **quem:**
    - o dono da escola (*lanista*); os treinadores (*doctores*);
    - **o médico** — Galeno começou como médico dos gladiadores de Pérgamo;
    - os gladiadores;
  - **a comida:** **os «comedores de cevada»** (*hordearii*), de cevada e de fava; e **a bebida de cinza de plantas** depois da
    luta, que o estudo do cemitério de Éfeso sugere (Lösch et al., 2014, com cautela);
  - **sons e cheiros:** o estalo das espadas de pau; os gritos dos treinadores; o suor, o azeite, o couro, a papa de cevada;
  - **de boca aberta:**
    1. **O juramento do gladiador:** «ser queimado, amarrado, surrado e morto pela espada» (Petrônio, *Satíricon* 117).
    2. **O grafite de Pompeia:** «Celado, o trácio, suspiro das moças».
    3. **Os elmos de parada com relevos**, pendurados na parede da cela.
- **Os outros povos** (o que faz as vezes):
  - **grego — a palestra do pancrácio e do pugilato:** as tiras de couro das mãos; o «Pugilista em repouso» de bronze, de orelhas
    estouradas e nariz quebrado;
  - **egípcio — a luta e o pau:** no túmulo 15 de Beni Hassan, **perto de duzentos pares de lutadores em sequência**, como um
    filme;
  - **asteca — a pedra redonda** (*temalacatl*): o cativo amarrado por uma corda à pedra, com uma espada de plumas no lugar das
    lâminas, contra os guerreiros águia e onça armados de verdade;
  - **nórdico — o duelo da ilha** (*hólmganga*):
    - num manto de cinco varas estacado no chão, dentro de um quadrado de varas de aveleira;
    - três escudos para cada um;
    - **quem pisa fora do manto «fugiu»** (a *Saga de Kormák*);
  - **clássico — o salto do touro e os «Meninos Pugilistas» de Akrotiri**, cada um com uma luva só.

## 17. O estábulo (o asteca nunca ganha estábulo no jogo — certo)

- **Romano:**
  - **coisas:** as baias com **as manjedouras de alvenaria**; o ralo; o palheiro em cima; o mulo e o cavalo;
  - **quem:** os cavalariços (*agasones*);
  - **os cavalos do circo:** as cocheiras das facções — os vermelhos, os brancos, os verdes, os azuis —, com os cavalos famosos
    de nome nas inscrições e nos mosaicos;
  - **a estrada:** as estalagens do correio do Estado, com as suas cocheiras.
- **Grego** (Xenofonte, *A Equitação* IV):
  - o chão da baia **inclinado, de pedras**, e o pátio de escovar **calçado de pedras redondas, para o casco endurecer**;
  - a manjedoura onde o cavalariço a veja;
  - o cavalo é luxo de rico (os cavaleiros, *hippeis*).
- **Egípcio — os estábulos de Ramsés II em Pi-Ramessés** (Qantir):
  - **seis fileiras de prédios para 460 a 480 cavalos**;
  - **as pedras de amarrar furadas**, com **uma bacia de pedra junto de cada uma**;
  - **o chão inclinado** para o escoamento;
  - ao lado, **as oficinas de carros de guerra** e o pátio de treinar os cavalos (Pusch; CIPEG);
  - **de boca aberta:** **o corredor de quatrocentos e tantos cavalos amarrados em fila.**
- **Nórdico:**
  - **as baias na ponta da casa longa**, separadas por lajes de pedra em pé (Islândia, Stöng);
  - **as lutas de cavalos**;
  - **o cavalo sagrado:** Freyfaxi, o cavalo consagrado a Freyr, que ninguém podia montar — a *Saga de Hrafnkel* começa por ele.
- **Clássico:**
  - **o manual de Kikkuli** (Hattusa, c. 1350 a.C.), escrito em tabuinhas de barro: **sete meses de treino dos cavalos de carro**,
    dia por dia;
  - **as tabuinhas de Cnossos** que contam os carros e as rodas.

---

## 18. O vocabulário que falta — as peças de cada povo (para o Blender e para as plantas)

**Já modeladas** (`arte/blender/moveis_tabela.py`, sobretudo para a taverna e a casa):
- os assentos: o banquinho, o banco;
- a cadeira: a cátedra, o *klismos*, a egípcia, a nórdica, o *icpalli*;
- as mesas, o balcão, as prateleiras;
- as ânforas e as talhas (o píthos, o *zir*, a *olla*); o barril, a cuba, as pipas;
- os fogos: o *focus*, a chaminé, a *eschara*, o forno de colmeia, o *tlecuilli*, o fogo comprido;
- o estrado do músico, o lampadário;
- as camas: a de solteiro e a de casal;
- a arca (o *petlacalli*); a esteira;
- a folha da porta.

**O clássico usa as do romano em quase tudo**, menos a chaminé e a folha da porta. Abaixo, **o que as fontes pedem e ainda
não existe**, povo por povo.

- **Romano:**
  - o leito de banquete com cabeceiras de bronze (*fulcra*);
  - a mesa de pedra do átrio (*cartibulum*);
  - a arca de ferro presa ao chão;
  - o armário (*armarium*) com portas;
  - o larário em edícula; o *labrum*;
  - o porta-lucernas de pendurar; a lanterna de chifre;
  - a cadeira curul de pés cruzados; o banco de honra para dois (*bisellium*);
  - o dólio; a estante de ânforas;
  - a mó em ampulheta; a prensa de alavanca;
  - o *oscillum*.
- **Grego:**
  - a *klinê* e a *trapeza* (a mesinha que entra debaixo dela);
  - o banquinho dobrável (*diphros okladias*); o trono com escabelo;
  - a arca (*kibôtos*);
  - o *louterion*;
  - a cratera; o píthos enterrado;
  - o tear de pesos (*histos*); o *epinetron*;
  - o fogareiro de barro; o altar do pátio; a herma.
- **Egípcio:**
  - a cama com estribo e o apoio de cabeça;
  - o banquinho dobrável de cabeças de pato; a cadeira de pés de leão;
  - a arca de tampa abaulada;
  - a mesa de oferenda; o suporte de jarra;
  - o naos de pedra; o andor da barca;
  - o divã de tijolo; o estrado do senhor;
  - o *lit clos*;
  - o silo de cúpula;
  - o tear de chão;
  - a laje do banho; a privada de pedra;
  - o capta-vento.
- **Asteca:**
  - o *icpalli*; a esteira (*petate*) estendida e enrolada; a arca de junco (*petlacalli*);
  - o biombo de junco e o de madeira dourada;
  - o braseiro de copal; o incensário de cabo;
  - as três pedras com o *comal*; o *metate*;
  - o tambor *huehuetl* e o *teponaztli*;
  - o *cuezcomatl*; o tear de cintura;
  - a cúpula do *temazcal*;
  - a pedra do sacrifício e o *chacmool* (só no templo).
- **Nórdico:**
  - o assento alto com os dois postes entalhados;
  - os bancos largos de terra e tábua;
  - a cama fechada (*lokrekkja*);
  - a mesa de cavaletes;
  - a arca com fechadura;
  - o tear de pesos;
  - a mó de girar;
  - a corrente do caldeirão;
  - a lamparina de pedra-sabão;
  - a cama de cabeças de bicho;
  - o tabuleiro de *hnefatafl*;
  - a armação de secar peixe;
  - o fole e a pedra do fole.
- **Clássico:**
  - o trono de gesso e os bancos de gesso das paredes;
  - **o lar redondo pintado** com as quatro colunas;
  - o píthos de cordões;
  - os chifres de consagração; a base do machado duplo;
  - **as prateleiras de tabuinhas inclinadas** (Ebla) e as cestas etiquetadas;
  - a lamparina de pedra de pé alto;
  - a banheira de barro pintada;
  - o forno *tannur*;
  - a mó de sela;
  - o tear de pesos;
  - a balança com os pesos de pato.

## 19. O que isto pede ao mundo e às regras do jogo (para o arquiteto)

1. **As fibras e as tintas** (§1.3, buracos 1–5): sem o linho, o egípcio não tem roupa, vela nem véu do deus que sejam
   egípcios; sem o algodão e o maguey, o asteca não tem manta, couraça nem tear de cintura. E os dois povos não têm ovelha: hoje
   o `G.Atmos` diz que eles não tecem, e por isso não lhes dá tapete nem tapeçaria. É o maior buraco destes interiores.
2. **A luz de cada povo** é uma regra do `atmos.js`, não um enfeite:
   - **o asteca não tem lamparina de óleo:** a tocha de ocote (madeira) e o braseiro;
   - **o nórdico** queima o óleo de peixe e de foca (`oleo`) em lamparina de pedra-sabão;
   - **o egípcio** põe sal no óleo (`sal`);
   - **o romano** tem a lanterna de chifre (`chifre`).
3. **A escrita sem papel** (§11): a biblioteca romana e a grega não podem ser de papiro. Ficam as tabuinhas de cera, as folhas
   de madeira, o óstraco de barro, as placas de bronze e, com o saber V, o pergaminho.
4. **Os metais que não são do povo:**
   - **o asteca** trabalhava o ouro e o cobre em cera perdida, com o fogo soprado por canudos, e as armas eram de obsidiana;
   - **o nórdico** tirava o ferro do pântano;
   - **o grego** cavava prata.
   - Três jazidas novas possíveis: a obsidiana, o ferro do pântano e a prata.
5. **O que bate de frente com as regras:**
   - **o morto debaixo do chão** (Çatal Höyük, Ur): só `Village.bury` abre cova — fica a ocre, não o enterro;
   - **o sangue nas paredes** (o Templo Mayor, o *blót*): tem causa só onde o mundo faz o sacrifício (`sacrificio` já marca o
     osso e a carne);
   - **o vidro:** nenhum, até o saber V.
6. **O tamanho:**
   - a Aula Regia de Domiciano (30,5 × 38,7 m) só cabe no Palácio Colossal (40 m);
   - o mégaron de Pilos (13 × 11 m) cabe no Palácio (24 m) com o vestíbulo e o pórtico;
   - a sala do trono de Cnossos (≈ 6 × 4 m) cabe na Casa do Chefe;
   - o salão do jarl de 24 m é uma casa longa de Trelleborg;
   - a cela do santuário asteca do alto é de 2,76 × 2,88 m — mais um nicho que uma sala.
7. **O que já casa sem mudar nada:**
   - o chifre de beber nórdico (`chifre`);
   - as plumas dos leques egípcios e dos panos astecas (`plumas`);
   - o marfim romano, grego e clássico (`marfim`);
   - a cera das máscaras dos antepassados e das tabuinhas (`cera`);
   - o barro das tabuinhas clássicas e dos óstracos gregos;
   - o papiro egípcio e o amate asteca;
   - o couro dos rolos da lei do vizir e dos códices astecas;
   - o incenso e o copal (`incenso`);
   - o azeite romano e grego;
   - o ouro das figurinhas nórdicas;
   - o cobre e o estanho dos lingotes clássicos.

## 20. As fontes principais (as citadas no texto, em poucas palavras)

- **Os autores antigos:**
  - Vitrúvio, *Da Arquitetura* VI e X;
  - Plínio, *História Natural* XXVIII e XXXIII–XXXV;
  - Sêneca, *Cartas* 5, 56 e 86;
  - Suetônio, *Augusto*, *Nero*, *Vespasiano*, *Domiciano*;
  - Salústio, *Catilina* 55;
  - Columela I.6; Varrão I.57; Catão, *Agricultura*;
  - Juvenal III; Marcial IX.68; Petrônio 117; Políbio VI.53; Aulo Gélio IV.6;
  - Homero, *Ilíada* XVIII e *Odisseia* III, IV e XIX;
  - Heródoto II.37, II.62, II.81, II.95, VII.144, VIII.41 e IX.37;
  - Tucídides VII.87; Platão, *Fédon*; Xenofonte, *Rendas* e *A Equitação*; Aristóteles, *Constituição de Atenas* 44;
  - Pausânias I.26 e V.11; Estrabão XIV.2.21; Plutarco, *Numa*; Arriano IV.13; Andócides I.133;
  - Diodoro III.12–14 (Agatárquides).
- **As fontes astecas:**
  - Hernán Cortés, 2.ª carta;
  - Bernal Díaz del Castillo, *História Verdadeira*, caps. 45, 91–93;
  - Sahagún, *Códice Florentino* (livros II, VI, VIII, IX, XI);
  - Diego Durán;
  - o *Códice Mendoza* (fólios 60r, 64, 69r).
- **As fontes nórdicas:**
  - Adão de Bremen IV.26–27;
  - Snorri, *Heimskringla* (*Saga de Hákon, o Bom* 14) e a *Edda* (*Grottasöngr*);
  - as sagas de Egil, de Eyrbyggja, de Hrafnkel, de Kormák e dos jomsvíquingues;
  - o *Livro da Colonização*;
  - o *Beowulf*;
  - a *Crônica Anglo-Saxã* (1012);
  - o relato de Ohthere ao rei Alfredo.
- **As fontes do Oriente Próximo e do Egito:**
  - o papiro Brooklyn 35.1446; os papiros Abbott e Amherst; o decreto de Horemheb; o decreto de Nectanebo I (Náucratis e
    Tônis-Heracleion);
  - a estela de Semna; a estela de Ikhernofret;
  - *Jeremias* 38 e *Juízes* 16;
  - as leis de Eshnunna; «Os Dias de Escola» (*Edubba* A); as «Instruções do Lavrador»; o hino a Ninkasi;
  - o manual de Kikkuli;
  - a carta a Ea-nasir;
  - as tabuinhas de Pilos (Ta, Jn, Fr) e as de Cnossos;
  - a Estela dos Abutres.
- **As escavações e os estudos:**
  - **Itália:** o Parque Arqueológico de Óstia; Coarelli (o Palatino); o *Ludus Magnus* e o quartel dos gladiadores de Pompeia;
    Marichal (La Graufesenque);
  - **Grécia:** a Escola Americana (a ágora de Atenas, o Prédio de Poros); o Zea Harbour Project; a Universidade de Michigan
    (Olinto); a Universidade de Cincinnati (Pilos: Blegen, Egan); Evans (Cnossos); Caskey (Lerna); o Eforato de Imathia
    (Aigai);
  - **Egito:** Davies e o Met Museum (Rekhmire, Meketré, Malkata); Petrie, Ricke e o Amarna Project (Amarna); Bruyère (Deir
    el-Medina); Goddio e von Bomhard (Tônis); Pusch e o CIPEG (Qantir); Hayes (o papiro Brooklyn);
  - **México:** o INAH e o Museo del Templo Mayor (a Casa das Águias); o projeto dos glifos astecas (Wired Humanities, o
    *cuauhcalli*);
  - **Escandinávia:** Lucas e McGovern 2007 (Hofstaðir); a Universidade de Lund (Uppåkra); o Museu Viking de Lofotr (Borg);
    Kalmring (Hedeby); a Universidade de Tromsø e o *sciencenorway* (os *naust*); o Historiska Museet e o Museu Nacional da
    Dinamarca (os escravos); Moesgård (a pedra de Snaptun); Hurstwic (a casa longa);
  - **Oriente Próximo:** a Missão Francesa em Mari (o Ministério da Cultura da França, o Louvre); Matthiae (Ebla); Robson e o ISAC
    de Chicago (Nippur, a Casa F); J. N. Reid 2017 (as prisões mesopotâmicas); Woolley (Ur); Hodder e a UCL (Çatal Höyük); o Met
    Museum e o British Museum (Tell Brak);
  - **Gladiadores:** Lösch et al. 2014, na *PLOS ONE* (os gladiadores de Éfeso).
