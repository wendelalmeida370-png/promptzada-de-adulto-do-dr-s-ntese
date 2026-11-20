# A comida e a cozinha — a base dos ofícios da comida (proposta, 20/11/2026)

A pergunta do dono: o jogo tem um sistema de culinária — pratos, ingredientes comuns e raros, combinações — que sustente os ofícios
da cozinha? Se não tem, que seja criado, muito bem feito e completo. **A resposta curta:** o jogo já tem **a metade de baixo** (a
comida tem origem, e a despensa de cada casa sabe de que é feita); falta **a metade de cima** (os ingredientes finos, o preparo, as
receitas, a qualidade, a mesa). Esta é a proposta. Os números são para começar.

## 1. A máxima e a fantasia

Cozinhar tem de ser tão bom que poderia ser um jogo sozinho — o mercado de manhã com o peixe que ainda brilha, a cebola e o alho na
panela de barro, o fogo que se aviva com o sopro, o pão que doura no forno e o cheiro que sai pela rua, o tempero acertado na prova, o
prato posto na mesa da família — e o rosto do velho que prova o caldo e diz que é igual ao da mãe dele, que morreu há quarenta anos.
**A comida é uma das coisas mais humanas do mundo:** junta a família, recebe o hóspede, mostra o rico, consola o triste, celebra a
festa, alimenta o exército — e, na mão errada, mata o rei.

## 2. O que já existe no jogo (a metade de baixo)

- **A comida tem origem** (`G.Origem`, `js/origem.js`): o estoque de comida de cada lugar (o armazém do povo, a casa, o navio, a banca)
  sabe **de que é feito** — trigo, cevada, arroz, milho, sorgo, peixe, marisco, carne, leite, ovos, legumes da horta, fruta, mel,
  azeite —, e essas partes andam sozinhas com toda mudança do livro. **A despensa de cada casa já é uma lista de ingredientes.**
- **As fontes:** o campo e a fazenda (o grão de cada campo), a horta, o pomar, a pesca (o pesqueiro contado), a criação (a ordenha, os
  ovos, o abate), a caça, a coleta (o mel), o azeite, a salga, o comércio, o saque.
- **As receitas que pedem partes:** a cerveja só de cereal (a cuba), o prato de peixe só de peixe (a taverna nomeia o prato pela origem:
  «um prato de peixe», «uma sopa de legumes», «uma tigela de coalhada»).
- **A casa e a mesa:** toda casa tem o seu núcleo — o fogo e o lugar onde a família come junta (a mesa, o banco, a esteira, o fogo de
  chão), a despensa pelo livro, o relógio de cada um com as horas de comer, a fome e a fome que emagrece.
- **As riquezas** (o mel, a cera, o cacau…) e o comércio que traz de longe.

**O que falta:** os ingredientes finos (a carne de qual bicho, o peixe de qual espécie, a cebola, o sal, o tempero), **o preparo** (o
fogo, a panela, o forno, as técnicas), **as receitas** (as de cada povo e as combinações), **a qualidade do prato**, **o que a comida
faz** além de matar a fome, e **a mesa** como lugar de gente.

## 3. A comida é uma base (e a cozinha é a perícia)

Nas quatro camadas ([`pericias.md`](pericias.md)): **a comida é uma base** — uma lei do mundo para todos: tudo o que se come veio de
algum lugar, estraga com o tempo, tem estação, mata a fome e faz mais coisas no corpo. **As perícias** são Cozinhar, Panificar,
Fermentar, Conservar e Abater; **os ofícios** usam essas perícias (o cozinheiro, o padeiro, o açougueiro, o taverneiro, o salgador…).

## 4. Os ingredientes

Cada ingrediente tem: **a origem** (de onde vem, pelo livro), **a estação** (o calendário), **o frescor** (quanto dura), **a
raridade**, **o sustento** (quanto mata a fome), **o sabor** e **o valor**.

| Família | Os ingredientes | De onde vem |
|---|---|---|
| **Os grãos** | trigo, cevada, arroz, milho, sorgo (já existem); **a farinha** de cada um | o campo; **o moinho** (a farinha) |
| **O pão e a massa** | o pão de cada grão, a broa, a tortilha (milho), o bolo de cevada | **o forno** do padeiro ou da casa |
| **A carne** | **de qual bicho**: boi, porco, carneiro, cabra, ave, e **a caça** (cervo, javali, lebre…) — o bicho de onde veio já é sabido na fonte | o abate, a caça (a espécie do mundo) |
| **O peixe e o marisco** | **de qual espécie** (as 36 da [`oficio-pesca.md`](oficio-pesca.md)), o polvo, a ostra, o caranguejo | a pesca |
| **O leite e o que se faz dele** | o leite de vaca, cabra, ovelha, égua; **a coalhada, o queijo, a manteiga** | a ordenha; **a queijaria** |
| **Os ovos** | de galinha, de pato, **das aves dos penhascos** | o galinheiro, os penhascos |
| **A horta** | lentilha, fava, grão-de-bico, cebola, alho, alho-poró, repolho, pepino; **feijão, abóbora, pimenta, tomate** (das terras dos astecas) | a horta |
| **As frutas** | figo, uva, tâmara, maçã, pera, romã, azeitona, as frutas da selva | o pomar, a coleta |
| **O doce e a gordura** | o mel, **o azeite**, a banha | as colmeias, o lagar, o abate |
| **O sal** | **o sal da salina** (a costa) e **o sal-gema** (a mina) | **a salina, a mina** — o sal tem fonte, como tudo |
| **As ervas e os temperos** | coentro, hortelã, louro, cominho, endro, mostarda; **o garum** (do peixe) | a horta, a mata, a pesca |
| **As especiarias de longe** | a pimenta, a canela, o açafrão — **as de outro mar** | **o comércio** (a rota do navegador) |
| **As bebidas da cozinha** | o vinho, **o vinagre**, a cerveja, o leite | a cuba, o lagar, a ordenha |
| **Os da terra de cada povo** | **o cacau, a baunilha, os gafanhotos** (astecas); o peixe seco do norte; a tâmara do Egito | a terra do povo, o comércio |
| **Os da mata** | os cogumelos, as raízes, o palmito, as castanhas | a coleta ([`oficio-mateiro.md`](oficio-mateiro.md)) |

**A raridade:** comum (o grão, a cebola), **da estação** (o figo no verão), **da terra** (o que só uma região dá), **de longe** (a
especiaria do comércio), **raro** (o cogumelo da mata funda, o mel da abelha da selva), **lendário** (o peixe lendário, o vinho do barril
do século).

**O frescor (quanto dura):** o peixe, um dia; a carne e o leite, dois; o pão, três; a fruta, alguns; o queijo e a carne salgada, uma
estação ou mais; o grão, o ano; o sal e o mel, para sempre. **Conservar** (salgar, defumar, secar, a salmoura, o mel, o azeite, o
vinagre, o queijo) estica o frescor — e é o que faz o inverno possível (o calendário).

## 5. O preparo (as técnicas e os utensílios)

| Técnica | O que faz | Pede |
|---|---|---|
| **Cortar, limpar, escamar** | prepara a carne, o peixe, a horta | a faca (da forja) |
| **Moer** | o grão vira farinha; o tempero vira pó | a mó, o pilão |
| **Amassar** | a farinha e a água viram massa | a gamela, as mãos |
| **Assar** | o pão, a carne, o peixe | **o forno** (de barro, de pedra), o espeto, a brasa |
| **Cozer** | o caldo, o mingau, a sopa, o cozido | **a panela** (do oleiro), a água, o fogo |
| **Fritar** | o peixe pequeno, o bolinho | o azeite ou a banha, a frigideira |
| **Grelhar** | a carne e o peixe na brasa | a grelha (da forja) |
| **Temperar** | o sal, as ervas, o garum, o vinagre, o mel | os temperos |
| **Fermentar** | a cerveja, o pulque, a massa do pão, o garum | a cuba, o tempo |
| **Coalhar** | o leite vira coalhada e queijo | o coalho, o pano, a forma |
| **Salgar, defumar, secar** | conservar | o sal, a fumaça, o sol, o vento |
| **Rechear e enrolar** | o tamal, a folha recheada | a folha, a massa |

**O fogo é tudo:** forte, médio, brasa — a lenha (pelo livro) e o sopro; o fogo forte demais queima, o fraco demais não cozinha.

## 6. As receitas

### 6.1 As receitas de cada povo (a cozinha de cada cultura)

| Povo | O de todo dia | O da festa |
|---|---|---|
| **Egito** | o pão e a cerveja, a cebola, a lentilha, o peixe seco do rio | o ganso assado, o pão de mel, a tâmara |
| **Gregos** | o bolo de cevada, a azeitona, o queijo, o peixe com azeite, o figo | o peixe grande assado, o vinho com mel |
| **Romanos** | **o mingau de grão** (o prato do povo), o pão, o garum em tudo | o banquete deitado: o porco recheado, o arganaz no mel, o peixe raro |
| **Norte** | o cozido, o peixe seco, a coalhada azeda, o pão escuro | o porco assado inteiro, o hidromel |
| **Astecas** | **a tortilha e o tamal**, o feijão, a abóbora, a pimenta, o atole (o mingau de milho) | **o cacau batido** (a bebida dos nobres), o peru, os gafanhotos tostados |

As receitas de um povo se aprendem em casa, com um mestre, num livro — e **as de outro povo, com um viajante** (uma descoberta).

### 6.2 A combinação livre (o cozinheiro inventa)

Além das receitas prontas, **o cozinheiro combina** dentro de **um molde de prato** — o caldo, o assado, o grelhado, o pão, o mingau,
o recheado, o doce, a conserva:

- **cada molde tem papéis:** a base (o grão, o caldo), o principal (a carne, o peixe, o legume), a gordura (o azeite, a banha), o
  tempero (o sal, a erva, o garum), o líquido (a água, o vinho, o leite);
- **o prato ganha o nome do que leva** («caldo de cavala com alho-poró e endro») e **é avaliado pelas regras** (o §7);
- **as combinações que funcionam** (o salgado com o gordo, o doce com o azedo, o peixe com a erva verde) dão prato bom; as que não
  funcionam, prato estranho — **e se descobrem fazendo**: o caderno de receitas guarda as achadas.

## 7. A qualidade do prato (de onde ela vem)

| O que pesa | Como |
|---|---|
| **O frescor** | o peixe de hoje e o de ontem |
| **A perícia** | Cozinhar (e Panificar, Fermentar) de quem fez |
| **O fogo e o ponto** | o tempo certo no fogo certo — o gesto (§9) |
| **A combinação** | os sabores que casam |
| **O tempero** | o sal certo (provar e acertar) |
| **O utensílio** | a panela boa, o forno de pedra |
| **A raridade** | o ingrediente raro sobe o prato (e o preço) |

**A qualidade aparece em palavras** («um caldo raso», «um bom caldo», «um caldo que lembra o da mãe»), nunca em estrelas na tela.

## 8. O que a comida faz (com causa, sem mágica)

- **Mata a fome** (o sustento) — o mingau mata pouco e barato; o assado, muito e caro.
- **Esquenta e refresca:** o caldo quente no inverno ajuda contra o frio (o frio do mundo); a fruta e a água no calor.
- **Dá fôlego e descanso:** a refeição boa repõe mais o cansaço do que o pão duro.
- **Mexe no humor:** o prato bom levanta o humor do dia; **o prato preferido de alguém** (cada pessoa tem o seu — o da infância, o do
  povo dela, o da mãe) levanta muito, e **cozinhar o prato preferido de alguém** é um gesto que fica nos laços.
- **Adoece:** a comida estragada, o peixe velho, a água ruim — a doença do mundo; a dieta só de pão duro no mar longo.
- **Marca o corpo com causa:** a fome emagrece (já existe); a fartura de anos engorda o rico.
- **Junta as pessoas:** comer junto faz laço (a mesa da família, o banquete, a mesa da taverna).

## 9. O gesto (cozinhar com as mãos)

1. **Escolher no mercado:** o peixe de olho brilhante, a fruta madura, o preço do dia.
2. **Preparar:** cortar, limpar, moer, amassar — no ritmo.
3. **O fogo:** pôr a lenha, soprar a brasa, afastar ou chegar a panela — **o fogo lido pela chama e pelo borbulhar**.
4. **A ordem das coisas:** a cebola antes da carne, o peixe no fim.
5. **Provar e acertar:** a colher, a prova — **o personagem diz o que sente** («falta sal», «a erva sumiu») pela perícia; quem sabe mais
   sente mais.
6. **O ponto:** tirar na hora — o pão dourado, o peixe que solta da espinha, o caldo que encorpou; **o ponto se vê** (a cor, o vapor, a
   casca).
7. **Servir:** a tigela, o prato, a mesa; **no banquete, o arranjo**.
8. **A cozinha cheia** (a taverna à noite, o palácio no banquete): várias panelas ao mesmo tempo, cada uma no seu ponto.

## 10. A mesa (a comida como lugar de gente)

| Mesa | O que acontece |
|---|---|
| **A da família** | a refeição no núcleo da casa (que já existe), **quem cozinha em cada casa** (um papel da família), o pobre que come mingau, o rico que come assado |
| **A do hóspede** | receber é honra (no norte, o hóspede é sagrado); o prato bom ao visitante |
| **A da taverna** | o prato do dia ([`oficio-taverneiro.md`](oficio-taverneiro.md)) |
| **A da rua** | o vendedor de comida (o balcão de pedra que dá para a rua) |
| **A do banquete** | quem governa mostra o poder pela mesa: os pratos raros, a ordem dos lugares, **o provador** — e o veneno |
| **A da festa** | a comida da festa de cada estação, a do casamento, a do funeral |
| **A do navio, do exército, da expedição** | a ração: o pão duro, a carne salgada, a comida seca — e o cozinheiro de bordo que faz milagre com pouco |
| **A da cela** | o que se dá ao preso |

**As pessoas do mundo comem pelas mesmas regras:** cada casa faz a sua refeição com o que a despensa tem, pela mão de quem cozinha
nela; o mesmo prato para o corpo e para elas.

## 11. A camada do ambiente

| A fotografia | O som | O tremor | A tela | A mochila |
|---|---|---|---|---|
| perto da panela: o vapor, a cor que muda, a casca que doura, o fogo debaixo; a mesa posta | **o chiado**, o borbulhar, a faca na tábua, o fogo que estala, a mesa que conversa | nenhum | **o ponto se lê na panela** (a cor, o vapor, o borbulhar); o caderno de receitas; nada de barras | a vista do cozinheiro: a faca, os temperos, o que está na despensa e quanto ainda dura |

## 12. Os ofícios que a cozinha abre

| Ofício | O que faz | Perícias |
|---|---|---|
| **cozinheiro** | a cozinha da casa rica, da taverna, do palácio (o mestre-cuca) | Cozinhar |
| **padeiro** | o forno, o pão da cidade | Panificar |
| **moleiro** | o moinho, a farinha | Panificar |
| **açougueiro** | o abate e o corte, a carne de cada bicho | Abater |
| **queijeiro** | o leite que vira queijo | Conservar |
| **salgador e defumador** | a carne e o peixe que duram | Conservar |
| **doceiro** | o mel, a fruta, o bolo da festa | Cozinhar |
| **vendedor de comida** | o balcão da rua | Cozinhar, Negociar |
| **cozinheiro de bordo** e **do exército** | a ração que vira comida | Cozinhar, Conservar |
| **banqueteiro** | o grande banquete | Cozinhar, Comandar |
| **provador** | prova a comida de quem governa (e o veneno) | Cozinhar, Ervas |
| **envenenador** (a sombra) | o veneno no prato | Ervas, Furtividade |
| **especieiro** | o comércio dos temperos de longe | Negociar, Avaliar |
| **taverneiro** | o prato do dia e a bebida ([`oficio-taverneiro.md`](oficio-taverneiro.md)) | Hospitalidade, Cozinhar, Fermentar |

## 13. As lendas (nascem do mundo)

| Lenda | O que é |
|---|---|
| **O banquete do século** | o banquete de verdade que a cidade lembra por gerações (a memória da cidade) |
| **A receita perdida dos antigos** | o prato de um povo antigo, achado numa inscrição ([`passado.md`](passado.md)) |
| **O prato do rei** | o prato preferido de alguém que governou, guardado pelo cozinheiro do palácio |
| **O peixe lendário à mesa** | o peixe lendário da pesca, cozinhado — a noite que todos contam |
| **O sabor da infância** | o prato da mãe de alguém, refeito — o laço mais forte que a cozinha faz |

## 14. As regras (nada vem do nada)

1. **Todo ingrediente vem de uma fonte, pelo livro** — a carne do bicho abatido ou caçado, o peixe pescado, o sal da salina ou da mina,
   a especiaria do comércio; **o prato gasta o que a receita pede** (a origem das coisas já faz isso para a cerveja e o prato de peixe).
2. **O que estraga, estraga** pelo tempo e pelo lugar; conservar estica.
3. **A estação manda** no que há (o calendário).
4. **A qualidade sai das causas** (o frescor, a perícia, o fogo, a combinação), nunca de um dado escondido.
5. **As pessoas do mundo cozinham pelas mesmas regras**, e a refeição de cada casa é feita uma vez por refeição (o custo é pequeno).
6. **A comida não é mágica:** esquenta, sustenta, alegra, adoece — nunca dá poderes.

## 15. As fases e as provas

| Fase | O quê |
|---|---|
| Co1 — Os ingredientes | a carne de cada bicho, o peixe de cada espécie, a horta, as frutas, **o sal com a sua fonte**, os temperos, as especiarias de longe; a estação e o frescor |
| Co2 — O preparo e as receitas | as técnicas, os utensílios, o fogo; as receitas de cada povo; a combinação livre nos moldes; o caderno de receitas |
| Co3 — A qualidade e o que a comida faz | a qualidade pelas causas; o calor, o fôlego, o humor, a doença; **o prato preferido de cada pessoa** |
| Co4 — A mesa | a refeição da família por quem cozinha nela, o hóspede, o banquete, a rua, o navio, o exército, a festa |
| Co5 — Os ofícios e as lendas | o cozinheiro, o padeiro, o moleiro, o açougueiro, o queijeiro, o provador; as lendas |

**As provas:** todo prato gasta ingredientes que vieram de uma fonte (a origem das coisas cobra); nada estragado é servido como bom;
a estação muda o que há; a qualidade sai das causas; a refeição das pessoas do mundo pelas mesmas regras; o medidor da economia e da
fome dentro das faixas (a comida mais rica não pode deixar o mundo com fome); os casos ruins (o save com a panela no fogo, o fogo da
cozinha que pega na casa, o cozinheiro que morre no meio do banquete, a comida envenenada); e **o teste do dono: horas na cozinha, sem
enjoar.**

## 16. Quando entra

**A base (Co1 a Co4) com o taverneiro, no Patch 27** — o taverneiro é o primeiro cozinheiro do jogo, e a taverna já é a base; os
ofícios da cozinha (o padeiro, o moleiro, o açougueiro, o queijeiro) com a terra e a criação (Patch 28), de onde vêm os
ingredientes; o provador e o envenenador com o poder e a sombra ([`roteiro.md`](roteiro.md)). O Patch 27 pode virar dois, se crescer.
