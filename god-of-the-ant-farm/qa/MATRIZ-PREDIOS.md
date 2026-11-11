# A matriz por prédio

Gerada por `node qa/matriz-predios.js` em 2026-11-11 — do código e das folhas `qa/categorias/pN.js` (o formato está no `p4.js`); nunca editada à mão. Resultado da regressão: `/tmp/claude-0/-home-user-promptzada-de-adulto-do-dr-s-ntese/9e17ed97-a1b5-5d1c-a5da-c23519ea4f04/scratchpad/reg19`. A geometria dos mundos prontos: `geometria-metropole.json`.

| Categoria | Tipos | Estado | Essenciais feitas | Falhas geométricas | Folhas |
|---|---|---|---|---|---|
| Moradias | 6 | **validada** | 6/6 | 0 | P1 |
| Religião e memória | 2 | **validada** | 3/3 | 0 | P1 |
| Armazéns e celeiros | 3 | **validada** | 3/3 | 0 | P2 |
| Comércio | 3 | **validada** | 3/3 | 0 | P2 |
| Ofícios | 9 | **validada** | 1/1 | 0 | P2 |
| Serviços e convívio | 2 | **validada** | 2/2 | 0 | P2 |
| Campo e criação | 10 | **funcional** | 3/3 | 0 | P2 |
| Extração e pesca | 2 | **validada** | 3/3 | 0 | P2 |
| Governo, justiça e guarda | 5 | **validada** | 3/3 | 0 | P2 |
| Palácios | 4 | **parcial** | 0/1 | 0 | P2 |
| Cultura e espetáculo | 5 | **validada** | 4/4 | 0 | P2, P3 |
| Obras abertas da cidade | 5 | **parcial** | 3/4 | 0 | P1, P2, P4 |

## Moradias — validada

**Função:** onde a família mora: dorme, ceia, cozinha, nina, cuida dos pequenos, fica de cama e de luto; a casa com dono, herdeiro e aluguel · **Quem:** os moradores (a família); um hóspede, no chão

**Sistemas:** G.Lar, G.Casa, G.Depot, G.Interiors, G.Possess

| Tipo | Planta | Peças nas plantas de amostra | Usos | Geometria |
|---|---|---|---|---|
| hut (Cabana) | 27 famílias, 6 de 6 povos armados | arca, banco, banco-cama, braseiro, cama-casal, cesto, cesto-pendurado, esteira, esteira-casal, fogao, fogareiro, jarros, lar, mesa, mesa-baixa, prateleira-parede | acesso, aquecer, comer, cozinhar, deitar, guardar, sentar | amostra: 0 falhas, 0 escolhas; mundos: 35 plantas, 0 falhas |
| house (Casa) | 55 famílias, 4 de 6 povos armados | arca, bancada, banco, banco-cama, braseiro, cama-casal, cesto, cesto-pendurado, esteira, esteira-casal, fogao, forno, jarros, lar, mesa, nicho, prateleira-parede | acesso, aquecer, assar, comer, cozinhar, deitar, guardar, sentar, trabalhar | amostra: 0 falhas, 4 escolhas; mundos: 131 plantas, 0 falhas |
| sobrado (Sobrado) | 56 famílias, 6 de 6 povos armados | arca, bancada, banco, banco-cama, braseiro, cama-casal, cesto, cesto-pendurado, esteira, esteira-casal, fogao, forno, jarros, lar, mesa, mesa-baixa, nicho, prateleira-parede | acesso, aquecer, assar, comer, cozinhar, deitar, guardar, sentar, trabalhar | amostra: 0 falhas, 10 escolhas; mundos: 36 plantas, 0 falhas |
| insula (Ínsula) | 60 famílias, 6 de 6 povos armados | arca, bancada, banco, banco-cama, braseiro, cama-casal, cesto, cesto-pendurado, esteira, esteira-casal, fogao, forno, jarros, lar, mesa, mesa-baixa, nicho, prateleira-parede | acesso, aquecer, assar, comer, cozinhar, deitar, guardar, sentar, trabalhar | amostra: 0 falhas, 17 escolhas; mundos: 1 plantas, 0 falhas |
| quarteirao (Quarteirão) | 16 famílias, 6 de 6 povos armados | arca, banco-cama, braseiro, cama-casal, cesto, esteira, esteira-casal, fogao, forno, jarros, lar | acesso, aquecer, assar, cozinhar, deitar, guardar | amostra: 0 falhas, 16 escolhas |
| barraco (Barraco) | 2 famílias, 6 de 6 povos armados | arca, banco-cama, braseiro, cesto, esteira, jarros | acesso, aquecer, deitar, guardar | amostra: 0 falhas, 0 escolhas |

| Atividade | Essencial | Quem faz | Feita | No código | Provas |
|---|---|---|---|---|---|
| dormir na cama da casa, cada um na sua hora (`dormir`) | sim | P1 | sim | sim | qa/lar.js ✓, qa/lar-puro.js ✓ |
| comer à mesa o que a despensa da casa tem (a ceia de hoje, quente, ou fria) (`cear`) | sim | P1 | sim | sim | qa/lar.js ✓ |
| cozinhar a ceia da casa no fogo (`cozinhar`) | sim | P1 | sim | sim | qa/lar.js ✓ |
| a noite em casa acordado: conversar, descansar junto ao fogo, esperar quem está fora (`noite`) | sim | P1 | sim | sim | qa/lar.js ✓ |
| o doente e o ferido de cama em casa (`acamado`) | sim | P1 | sim | sim | qa/lar.js ✓ |
| ninar o bebê junto ao fogo; o bebê muda de colo onde está, nunca pela cidade (`ninar`) | sim | P1 | sim | sim | qa/lar.js ✓, qa/lar-puro.js ✓ |
| o viúvo nas primeiras horas do luto em casa, junto ao fogo (`luto`) |  | P1 | sim | sim | qa/lar.js ✓ |
| de dia, um velho da casa cuida dos pequenos em casa (`cuidar`) |  | P1 | sim | sim | qa/lar.js ✓, qa/lar-puro.js ✓ |
| abrigar-se da tempestade em casa (`abrigo`) |  | P1 | sim | sim | qa/lar.js ✓ |
| ter casa: comprar a vazia do povo, alugar a de um dono, encomendar uma nova; o dono, o herdeiro, a ruína (`casa`) |  | P1 | sim | sim | qa/casa.js ✓ |

**Notas:** o cartão da casa no Modo Deus diz onde está cada morador e por quê (G.Lar.roster, D-072); as casas não têm cadeira nem banco nas plantas de hoje: quem se senta, senta junto ao fogo, à mesa ou no chão (o repartidor do P4); o berço (o uso cuidar) espera a subida do In.VERSION; a cozinha não gasta lenha (a casa não tem a cadeia da lenha); o «cuidar» acontece nos mundos prontos desde o D-098 (da casa cheia saem os moços primeiro): o l14 acha na metrópole uma velha de verdade (Cassandra, 63) cuidando de dois pequenos, que a esperam quando ela sai por pouco (L-235); a cidade, de 12 anos, ainda não tem velhos; conversar com quem está dentro, do lado do corpo, é do P4; a casa que a cidade amplia por cima da família continua sendo a casa dela durante a obra (G.Village.livable, L-371: dorme, ceia, a água, a noite em família, o dia das casas, com a planta da casa antiga) — o corpo ainda não entra nela (o Space, do P4) e o desenho da casa antiga com os andaimes em volta é do P3

## Religião e memória — validada

**Função:** onde o povo reza e o sacerdote oficia; onde os mortos são enterrados · **Quem:** os fiéis, o sacerdote; quem enterra os seus

**Sistemas:** G.Lar, G.Village, G.Interiors, G.Fest

| Tipo | Planta | Peças nas plantas de amostra | Usos | Geometria |
|---|---|---|---|---|
| temple (Templo) | 13 famílias, 6 de 6 povos armados | altar, banco-fieis, cofre, esteira-oracao, idolo, jarros, lampadario, solido | acender, acesso, guardar, ofertar, oficiar, rezar, sentar | amostra: 0 falhas, 0 escolhas; mundos: 5 plantas, 0 falhas |
| cemetery (Cemitério) | sem planta | — | — | — |

| Atividade | Essencial | Quem faz | Feita | No código | Provas |
|---|---|---|---|---|---|
| rezar dentro do templo, num lugar de rezar da planta (as esteiras, os bancos); cheio, nas fileiras de fora (`rezar`) | sim | P1 | sim | sim | qa/lar.js ✓ |
| o sacerdote conduz a reza do altar (`oficiar`) | sim | P1 | sim | sim | qa/lar.js ✓ |
| as festas do calendário: a procissão, o banquete, o rito diante do templo (`festa`) |  | P1 | sim | sim | qa/lar.js ✓ |
| deixar uma oferenda no altar (`ofertar`) |  | P2 | parcial | sim | — |
| enterrar os mortos no cemitério e visitar o túmulo (`enterrar`) | sim | P1 | sim | sim | qa/memoria.js ✓ |

**Notas:** a oferenda no fim da reza entra na integração com o ramo do P2 (G.Templo.ofertar); o cemitério não tem planta (o corpo pisa as covas como o mundo as tem); o enterro é do village.js (Village.bury) e o luto em casa, do G.Lar

## Armazéns e celeiros — validada

**Função:** onde o povo guarda o que junta e de onde tira o que come: o estoque do povo, com lugar contado, pelo livro; no porto, o armazém das caixas que chegam · **Quem:** quem entrega e quem busca (coletores, lenhadores, mineiros, pescadores, construtores); no porto, os estivadores (estivador)

**Sistemas:** G.Depot, G.Act, G.Porto, G.Village

| Tipo | Planta | Peças nas plantas de amostra | Usos | Geometria |
|---|---|---|---|---|
| storehouse (Armazém) | 23 famílias, 6 de 6 povos armados | baia, mesa-conferencia, mesa-escriba, pipas, prateleira | conferir, entregar, escrever, guardar | amostra: 0 falhas, 0 escolhas; mundos: 27 plantas, 0 falhas |
| celeiro (Celeiro) | 17 famílias, 6 de 6 povos armados | baia, mesa-conferencia, mesa-escriba, tulha | conferir, entregar, escrever, guardar | amostra: 0 falhas, 0 escolhas; mundos: 5 plantas, 0 falhas |
| armazem (Armazém do Porto) | 23 famílias, 6 de 6 povos armados | baia, estrado, mesa-conferencia, mesa-escriba, pipas, prateleira | conferir, entregar, escrever, guardar | amostra: 0 falhas, 0 escolhas; mundos: 5 plantas, 0 falhas |

| Atividade | Essencial | Quem faz | Feita | No código | Provas |
|---|---|---|---|---|---|
| entregar a carga comum no armazém do povo (`guardar`) | sim | P2 | sim | sim | qa/carga-comum.js ✓ |
| buscar comida no armazém e comer (`comer`) | sim | P2 | sim | sim | qa/fome.js ✓ |
| levar as caixas do cais ao armazém do porto, caixa por caixa — a pesada, a dois (`descarregar`) | sim | P2 | sim | sim | qa/porto.js ✓ |
| o mais velho dos estivadores confere a carga na porta do armazém (`conferir`) |  | P2 | sim | sim | qa/porto.js ✓ |
| conferir e guardar nos móveis da planta (a mesa de conferência, as baias, as tulhas) (`mesa`) |  | P2 | não | sim | — |

**Notas:** o estoque do povo é um número por povo (com o lugar dos armazéns), não o que está em cada móvel: a mesa de conferência e as baias da planta ainda não são usadas pelo mundo (o capataz confere na porta)

## Comércio — validada

**Função:** onde se compra e se vende: as bancas dos mercadores, a feira, o mercado clandestino · **Quem:** os mercadores (mercador), os feirantes (feirante), os contrabandistas (contrabandista); os fregueses das casas

**Sistemas:** G.Biz, G.Compras, G.Depot, G.Act, G.Eco

| Tipo | Planta | Peças nas plantas de amostra | Usos | Geometria |
|---|---|---|---|---|
| mercado (Mercado) | 20 famílias, 6 de 6 povos armados | baia, banca, banquinha, prateleira, solido | comprar, guardar, vender | amostra: 0 falhas, 0 escolhas; mundos: 12 plantas, 0 falhas |
| feira (Feira) | 6 famílias, 6 de 6 povos armados | banca, fonte | beber, comprar, vender | amostra: 0 falhas, 6 escolhas; mundos: 10 plantas, 0 falhas |
| mercado_negro (Mercado Clandestino) | sem planta | — | — | — |

| Atividade | Essencial | Quem faz | Feita | No código | Provas |
|---|---|---|---|---|---|
| o mercador abre a banca, compra no atacado do armazém, arruma, vende e fecha o dia (`banca`) | sim | P2 | sim | sim | qa/negocio.js ✓ |
| o freguês pergunta, pechincha, compra e leva para casa (`comprar`) | sim | P2 | sim | sim | qa/negocio.js ✓, qa/compras.js ✓ |
| a casa que precisa manda um dos seus às compras (`compras-da-casa`) | sim | P2 | sim | sim | qa/compras.js ✓ |
| a fila da banca: oito lugares, e o nono vai embora (`fila`) |  | P2 | sim | sim | qa/filas.js ✓, qa/negocio.js ✓ |
| o feirante cuida das bancas da feira (`feira`) |  | P2 | sim | sim | qa/feira.js ✓ |
| o contrabandista leva do armazém às escondidas para vender (`contrabando`) |  | P2 | parcial | sim | qa/contrabando.js ✓ |

**Notas:** a feira e o mercado clandestino passam pelo livro e têm prova do mundo pronto: a feira a qa/feira.js (o armazém às bancas, a compra ao tesouro, a feira que fecha ao meio-dia, a morte e o save com a mercadoria a caminho); o mercado clandestino a qa/contrabando.js (o roubo, a compra sem imposto, a vigia, a morte e o save com o roubado), com o roubo da noite esperando a L-386; ainda não são as bancas próprias do act-negocio.js, e o mercado clandestino não tem planta

## Ofícios — validada

**Função:** onde as matérias do povo viram coisas: o barro em tijolo e pote, a lã em tecido, o minério em ferramenta e arma, o ouro em joia, a carne e o couro · **Quem:** os oleiros, tecelões, ferreiros, ourives e açougueiros (oleiro, tecelao, ferreiro, ourives, acougueiro); a seda, a salga e as pérolas (sericultor, salgador, mergulhador)

**Sistemas:** G.Oficio, G.Act, G.Depot, G.Estates

| Tipo | Planta | Peças nas plantas de amostra | Usos | Geometria |
|---|---|---|---|---|
| workshop (Oficina) | 15 famílias, 6 de 6 povos armados | balcao, bancada, cepo, prateleira | comprar, cortar, guardar, trabalhar, vender | amostra: 0 falhas, 0 escolhas; mundos: 5 plantas, 0 falhas |
| forja (Forja) | 11 famílias, 6 de 6 povos armados | balcao, bancada, bigorna, forja-fogo, prateleira, tina | comprar, forjar, guardar, martelar, temperar, trabalhar, vender | amostra: 0 falhas, 0 escolhas; mundos: 5 plantas, 0 falhas |
| tecelagem (Tecelagem) | 11 famílias, 6 de 6 povos armados | balcao, secador, tear | comprar, guardar, tecer, vender | amostra: 0 falhas, 0 escolhas; mundos: 7 plantas, 0 falhas |
| olaria (Olaria) | 12 famílias, 6 de 6 povos armados | balcao, bancada, eira, forno-olaria, pilha-tijolos, roda-oleiro, secador, tanque-barro | amassar, comprar, cozer, guardar, moldar, tornear, trabalhar, vender | amostra: 0 falhas, 0 escolhas; mundos: 15 plantas, 0 falhas |
| ourives (Ourivesaria) | 9 famílias, 6 de 6 povos armados | bancada-ourives, cofre, fornalha | fundir, guardar, lavrar | amostra: 0 falhas, 0 escolhas; mundos: 4 plantas, 0 falhas |
| acougue (Açougue) | 9 famílias, 6 de 6 povos armados | cepo, ganchos | cortar, pendurar | amostra: 0 falhas, 0 escolhas; mundos: 13 plantas, 0 falhas |
| sericultura (Casa da Seda) | sem planta | — | — | — |
| salga (Salga) | sem planta | — | — | — |
| perolaria (Casa dos Mergulhadores) | sem planta | — | — | — |

| Atividade | Essencial | Quem faz | Feita | No código | Provas |
|---|---|---|---|---|---|
| a fornada inteira, por etapas: buscar a matéria, fazer cada unidade no lugar da planta, o fogo, o fim que fecha as contas (`fornada`) | sim | P2 | sim | sim | qa/olaria.js ✓, qa/olaria-mao.js ✓, qa/oficinas-mao.js ✓ |
| a olaria faz o tijolo que as obras da cidade esperam (`tijolo-da-obra`) |  | P2 | sim | sim | qa/olaria.js ✓, qa/obra.js ✓ |
| o açougueiro abate um bicho do curral e guarda a carne e o couro (`acougue`) |  | P2 | parcial | sim | — |
| a seda, a salga e as pérolas (`casas-de-oficio`) |  | P2 | parcial | sim | — |

**Notas:** a olaria, a tecelagem, a forja e a ourivesaria passaram ao motor das fornadas (G.Oficio, act-oficio.js); o açougue, a seda, a salga e as pérolas ainda são as tarefas antigas (estates.js, economy.js), sem as etapas no lugar da planta; a oficina comum (workshop) não tem ofício próprio; amassar e moldar (o barro) esperam os lugares da planta da olaria nova (P4)

## Serviços e convívio — validada

**Função:** onde a cidade se encontra e se cuida: a taverna (beber, comer, conversar) e os banhos (a água quente, a limpeza) · **Quem:** o taverneiro e o foguista (taverneiro, foguista); os fregueses e os banhistas

**Sistemas:** G.Taverna, G.Termas, G.Act, G.Depot, G.Interiors

| Tipo | Planta | Peças nas plantas de amostra | Usos | Geometria |
|---|---|---|---|---|
| taverna (Taverna) | 22 famílias, 6 de 6 povos armados | balcao, banco, braseiro, cuba, fogao, mesa, mesa-terreiro, pipas, talha | acesso, aquecer, comer, comprar, cozinhar, guardar, mexer, sentar, vender | amostra: 0 falhas, 0 escolhas; mundos: 8 plantas, 0 falhas |
| banhos (Banhos) | 9 famílias, 6 de 6 povos armados | banco, cabide, fornalha-banho, piscina, solido, tina-banho | acesso, alimentar, banhar, despir, entrar, sentar | amostra: 0 falhas, 0 escolhas; mundos: 4 plantas, 0 falhas |

| Atividade | Essencial | Quem faz | Feita | No código | Provas |
|---|---|---|---|---|---|
| o dia da taverna: o taverneiro abre, atende e serve; o freguês pede, paga, senta e consome (`taverna`) | sim | P2 | sim | sim | qa/taverna-mao.js ✓, qa/taverna.js ✓ |
| o taverneiro compra no armazém o que falta na prateleira (e a cuba, a fornada da cerveja) (`abastecer`) |  | P2 | sim | sim | qa/taverna-mao.js ✓ |
| o dia dos banhos: o banhista paga, tira a roupa, entra na água com lugar, banha e sai; o foguista mantém a fornalha (`banho`) | sim | P2 | sim | sim | qa/termas-mao.js ✓, qa/termas.js ✓ |

**Notas:** a taverna e os banhos têm a prova de mão (vila de mentira) e a do mundo pronto (qa/taverna.js, qa/termas.js: a noite e o dia inteiros, o save no meio, quem cuida morrendo, o deus que derruba); o terreiro da taverna nova (P4: a mesa-terreiro, as pipas, a talha) usa os mesmos usos

## Campo e criação — funcional

**Função:** onde o povo planta e cria: as fazendas, os pomares, as plantações, os vinhedos, os apiários, as salinas, as hortas, os currais e os estábulos · **Quem:** os agricultores, os lavradores, os fruticultores, os vinhateiros, os apicultores, os salineiros, os pastores e os cavalariços

**Sistemas:** G.Estates, G.Eco, G.Urban, G.Depot

| Tipo | Planta | Peças nas plantas de amostra | Usos | Geometria |
|---|---|---|---|---|
| farm (Fazenda) | sem planta | — | — | — |
| pomar (Pomar) | sem planta | — | — | — |
| plantacao (Plantação) | sem planta | — | — | — |
| vinhedo (Vinhedo) | sem planta | — | — | — |
| apiario (Apiário) | sem planta | — | — | — |
| salina (Salina) | sem planta | — | — | — |
| horta (Horta) | sem planta | — | — | — |
| curral (Curral) | sem planta | — | — | — |
| estabulo (Estábulo) | sem planta | — | — | — |
| cercado (Cercado) | sem planta | — | — | — |

| Atividade | Essencial | Quem faz | Feita | No código | Provas |
|---|---|---|---|---|---|
| plantar, cuidar e colher a fazenda (`plantar`) | sim | P2 | sim | sim | qa/campo.js ✓ |
| o pomar, a plantação, o vinhedo, o apiário e a salina: cuidar, colher, prensar, defumar, rastelar (`propriedades`) | sim | P2 | sim | sim | qa/campo.js ✓ |
| levar o rebanho ao pasto, dar feno, tosquiar, ordenhar, escovar (`rebanho`) | sim | P2 | sim | sim | qa/rebanho.js ✗ |
| a horta da casa (`horta`) |  | P2 | parcial | sim | — |

**Notas:** o campo não tem planta (o corpo pisa o chão como o mundo o tem); a roça e as propriedades têm a prova do mundo pronto qa/campo.js (o ciclo, a morte com a colheita nas mãos, o save, o fogo, o deus que derruba; o pomar, a plantação, a prensa pelo livro, a tina segura por quem não está nela — L-383, L-384 —, o apiário), e o curral a qa/rebanho.js (o pasto, o feno, a tosquia e a ordenha, o save e a morte no pasto); a salina não está nos mundos da prova; a colheita nasce nas mãos fora do livro, como a coleta, e o livro a vê da mão ao armazém; o cercado não tem atividade (só cerca)

## Extração e pesca — validada

**Função:** onde se tira da terra e do mar: a mina e o cais · **Quem:** os mineiros (mineiro); os pescadores e os estivadores do cais

**Sistemas:** G.Porto, G.Pesca, G.Fishers, G.Depot, G.Act

| Tipo | Planta | Peças nas plantas de amostra | Usos | Geometria |
|---|---|---|---|---|
| mina (Mina) | sem planta | — | — | — |
| doca (Doca) | sem planta | — | — | — |

| Atividade | Essencial | Quem faz | Feita | No código | Provas |
|---|---|---|---|---|---|
| trabalhar na mina: a pedra, o minério, o ouro (`minerar`) | sim | P2 | sim | sim | qa/mina.js ✓ |
| sair ao mar com o barco e pescar no pesqueiro contado (`pescar`) | sim | P2 | sim | sim | qa/pesca.js ✓, qa/porto.js ✓ |
| o navio e o barco desembarcam no cais: as caixas nascem com nome e dono (`desembarcar`) | sim | P2 | sim | sim | qa/porto.js ✓ |

**Notas:** a mina e o cais não têm planta; a mina tem a prova do mundo pronto (qa/mina.js: o turno na galeria e no salto, a morte e o save na face, as mãos ocupadas, o fim do veio, a galeria que o deus derruba — L-381)

## Governo, justiça e guarda — validada

**Função:** onde a cidade se governa, se cobra, se guarda e se pune: a administração, a coletoria, a cadeia, o quartel, a torre · **Quem:** os escribas, os coletores de impostos, o carcereiro e a vigia (escriba, cobrador, carcereiro, vigia); os soldados

**Sistemas:** G.Crime, G.Eco, G.Act, G.Depot, G.Justice

| Tipo | Planta | Peças nas plantas de amostra | Usos | Geometria |
|---|---|---|---|---|
| administracao (Administração) | sem planta | — | — | — |
| coletoria (Coletoria) | sem planta | — | — | — |
| cadeia (Cadeia) | 6 famílias, 6 de 6 povos armados | balde, banco, chaves, mesa-escriba, palha | acesso, deitar, escrever, pegar, sentar | amostra: 0 falhas, 0 escolhas; mundos: 2 plantas, 0 falhas |
| quartel (Quartel) | 8 famílias, 6 de 6 povos armados | arca, armeiro, banco, catre, manequim, mesa, mesa-escriba | acesso, armar, comer, deitar, escrever, guardar, sentar, treinar | amostra: 0 falhas, 0 escolhas; mundos: 5 plantas, 0 falhas |
| torre (Torre de Vigia) | sem planta | — | — | — |

| Atividade | Essencial | Quem faz | Feita | No código | Provas |
|---|---|---|---|---|---|
| escrever os registros da administração (`escrever`) | sim | P2 | sim | sim | qa/termas-mao.js ✓ |
| cobrar o imposto de porta em porta e levá-lo ao tesouro; cunhar moedas (`imposto`) | sim | P2 | sim | sim | qa/termas-mao.js ✓ |
| o ladrão preso cumpre a pena na cela; o carcereiro guarda e dá de comer (`cela`) | sim | P2 | sim | sim | qa/civicos.js ✓ |
| os soldados treinam diante do quartel (`treinar`) |  | P2 | sim | sim | qa/termas-mao.js ✓ |
| a ronda da noite e a vigia na torre (`vigiar`) |  | P2 | parcial | sim | qa/contrabando.js ✓ |

**Notas:** a prova dos serviços públicos pelo corpo está no qa/termas-mao.js (o mesmo módulo: act-servicos.js); a torre não tem planta

## Palácios — parcial

**Função:** onde o governante mora e recebe: a casa do chefe e os palácios · **Quem:** o governante e a família dele; quem vem em audiência

**Sistemas:** G.Court, G.Interiors

| Tipo | Planta | Peças nas plantas de amostra | Usos | Geometria |
|---|---|---|---|---|
| paco (Casa do Chefe) | 12 famílias, 6 de 6 povos armados | arca, banco, braseiro, fogao, lampadario, lar, mesa, trono | acesso, aquecer, audiencia, comer, cozinhar, guardar, sentar | amostra: 0 falhas, 0 escolhas |
| palacio (Palácio) | 10 famílias, 6 de 6 povos armados | arca, armeiro, banco, cama-casal, fogao, fonte, forno, jarros, lampadario, lar, mesa, trono | acesso, armar, assar, audiencia, beber, comer, cozinhar, deitar, guardar, sentar | amostra: 0 falhas, 0 escolhas; mundos: 1 plantas, 0 falhas |
| grande_palacio (Grande Palácio) | 10 famílias, 6 de 6 povos armados | arca, armeiro, banco, cama, cama-casal, fogao, fonte, forno, jarros, lampadario, mesa, pipas, trono | acesso, armar, assar, audiencia, beber, comer, cozinhar, deitar, guardar, sentar | amostra: 0 falhas, 0 escolhas |
| palacio_colossal (Palácio Colossal) | 10 famílias, 6 de 6 povos armados | arca, armeiro, banco, cama-casal, fogao, fonte, forno, jarros, lampadario, mesa, pipas, trono | acesso, armar, assar, audiencia, beber, comer, cozinhar, deitar, guardar, sentar | amostra: 0 falhas, 0 escolhas |

| Atividade | Essencial | Quem faz | Feita | No código | Provas |
|---|---|---|---|---|---|
| o governante e a família moram ali (`morar`) | sim | P2 | parcial | sim | qa/civicos.js ✓ |
| o governante recebe em audiência no trono (`audiencia`) |  | C | sim | sim | qa/escala.js ✗ |

**Notas:** a audiência (D-124, da Arquitetura Monumental): quem governa senta no trono e a cidade entra pelos lugares da planta — o voto e o pão continuam na praça; o «morar» é parcial: o palácio pronto fica marcado como o de quem o mandou erguer (v.palace), mas nenhuma família o tem como casa: o governante e os seus continuam morando na casa deles

## Cultura e espetáculo — validada

**Função:** os espetáculos, os jogos e os ritos do povo, e as obras que o marcam: onde se assiste, se atua, se luta, se reza e se oferta, e de onde se olha a cidade do alto · **Quem:** o público, os atores e o coro, os gladiadores, o escaldo; os sacerdotes e os fiéis; o povo da capital na maravilha; quem passa, no monumento e na estátua

**Sistemas:** G.Forma, G.Interiors, G.Space, G.Possess

| Tipo | Planta | Peças nas plantas de amostra | Usos | Geometria |
|---|---|---|---|---|
| teatro (Teatro) | 1 famílias, 6 de 6 povos armados | banco, cena, lar, luta, solido | acesso, assistir, atuar, cozinhar, lutar, sentar | amostra: 0 falhas, 0 escolhas; mundos: 5 plantas, 0 falhas |
| biblioteca (Biblioteca) | 1 famílias, 6 de 6 povos armados | banco, estante, mesa-escriba, mesa-leitura | acesso, escrever, guardar, ler, sentar | amostra: 0 falhas, 0 escolhas; mundos: 3 plantas, 0 falhas |
| maravilha (Maravilha) | 1 famílias, 6 de 6 povos armados | banco, lar, mesa, solido, trono | acender, acesso, assistir, atuar, audiencia, comer, cozinhar, lutar, ofertar, oficiar, rezar, sentar, topo | amostra: 0 falhas, 0 escolhas |
| monument (Monumento) | 1 famílias, 6 de 6 povos armados | solido | ofertar, rezar | amostra: 0 falhas, 0 escolhas; mundos: 4 plantas, 0 falhas |
| estatua (Estátua de Ouro) | sem planta | — | — | — |

| Atividade | Essencial | Quem faz | Feita | No código | Provas |
|---|---|---|---|---|---|
| o espetáculo do dia: os atores se preparam, as portas abrem, o público paga, assiste e aplaude; os atores recebem (`espetaculo`) | sim | P2 | sim | sim | qa/lazer-mao.js ✓ |
| o ator sobe ao palco (o romano luta de mentira na arena) (`atuar`) |  | P2 | sim | sim | qa/lazer-mao.js ✓ |
| ler um rolo na biblioteca; o copista copia na mesa do escriba (`ler`) | sim | P2 | sim | sim | qa/lazer-mao.js ✓ |
| assistir de um lugar da plateia: sentado nas fileiras do teatro grego e clássico, em pé no pódio da arena e do Coliseu, em volta do jardim sagrado e nas pontas do campo de pelota (`assistir`) | sim | P3 | sim | sim | qa/monumentos.js ✓ |
| o lugar de quem atua (o ato de atuar, a peça do dia, é o «atuar» do P2): na orquestra, diante do tanque do jardim, no corredor do campo de pelota, o escaldo junto ao fogo do salão do hidromel e entre os fogos de Valhala (`palco`) | sim | P3 | sim | sim | qa/monumentos.js ✓ |
| lutar na areia da arena e do Coliseu, dois a dois junto ao alçapão do subsolo (`lutar`) |  | P3 | sim | sim | qa/monumentos.js ✓ |
| subir ao alto da maravilha e olhar a cidade: o topo do Templo Mayor (a festa de Toxcatl), o terraço do zigurate, a rocha da Acrópole (`subir`) |  | P3 | sim | sim | qa/monumentos.js ✓ |
| rezar diante da maravilha: o olho de ouro do zigurate, a face da Grande Pirâmide, o templo da Acrópole (`rezar`) |  | P3 | sim | sim | qa/monumentos.js ✓ |
| fazer a oferenda: ao pé da Grande Pirâmide, sob a porta lacrada; diante da estátua de Atena na Acrópole (`ofertar`) |  | P3 | sim | sim | qa/monumentos.js ✓ |
| oficiar diante dos santuários do Templo Mayor e acender os seus braseiros (`oficiar`) |  | P3 | sim | sim | qa/monumentos.js ✓ |
| o banquete de Valhala: o assento do rei, os bancos ao longo das paredes, as mesas (`banquete`) |  | P3 | sim | sim | qa/monumentos.js ✓ |
| subir ao degrau de cima do monumento de cada povo — os degraus da base partidos em dois pela frente, cada um um passo do corpo (D-097) —, rezar diante do pedestal e ofertar ao pé dele; no nórdico, diante das pedras rúnicas, no gramado (`monumento`) |  | P3 | sim | sim | qa/monumentos.js ✓ |
| ver de perto a estátua de ouro de cada povo (a forma do deus, no 3D) (`ver-estatua`) |  | P3 | sim | sim | qa/visual/fidelidade.js ✓ |

**Notas:** o espetáculo e a leitura são do P2 (act-lazer.js); os lugares de assistir, atuar e ler vêm das plantas do teatro e da biblioteca (P3/P4) · o teatro, a maravilha e o monumento de cada povo têm planta pela forma (int-monumentos.js; D-093, D-095, D-096, D-097); a estátua de ouro é só vista (D-097); o palácio, o paço e os banhos têm planta pela forma (int-monumentos.js, a decisão do líder de 29/10: o salão do trono e o aposento com a cama, o assento do chefe com o fogo e os bancos, nos banhos onde se despe, a água e a fornalha — o lago egípcio aberto —; qa/palacios.js), com os móveis do P4; as atividades deles — a audiência, os banhos do P2 — vão nas folhas de quem os anima; o mercado de cada povo e o celeiro egípcio e o asteca, abertos, também (a fase E: as bancas, as baias e as tulhas do P4 onde a forma as tem — qa/palacios.js, a parte 7; vender, comprar e guardar vão nas folhas de quem os anima); o grande palácio e o colossal ficam com as plantas do P4; a biblioteca: a planta do P4 pela forma (biblioteca-praca.js), o copista do P2 — as atividades dela vão nas folhas deles. Quem leva o povo aos lugares (as festas, o lazer) é o P1.

## Obras abertas da cidade — parcial

**Função:** os lugares abertos e as obras de todos: onde o povo se junta e conversa, tira água, acende o primeiro fogo; o que sobra de um prédio caído · **Quem:** todos os moradores da cidade

**Sistemas:** G.Life, G.Village, G.Possess, G.Space

| Tipo | Planta | Peças nas plantas de amostra | Usos | Geometria |
|---|---|---|---|---|
| praca (Praça) | 1 famílias, 6 de 6 povos armados | banco, fonte, solido, tribuna | acesso, beber, conversar, falar, ouvir, sentar | amostra: 0 falhas, 6 escolhas; mundos: 14 plantas, 0 falhas |
| well (Poço) | sem planta | — | — | — |
| aqueduto (Aqueduto) | sem planta | — | — | — |
| campfire (Fogueira) | sem planta | — | — | — |
| ruin (Ruínas) | sem planta | — | — | — |

| Atividade | Essencial | Quem faz | Feita | No código | Provas |
|---|---|---|---|---|---|
| buscar água no poço para a casa, na fila (`agua`) | sim | P1 | sim | sim | qa/agua-solta.js ✗ |
| o corpo do deus fala ao povo de cima da pedra da praça (`falar`) |  | P2 | sim | sim | qa/lazer-mao.js ✓ |
| o balde do poço contra o fogo (`fogo`) | sim | P4 | sim | sim | qa/cidade-obras.js ✓ |
| juntar-se na praça: conversar, ouvir quem fala, a festa (`juntar`) | sim | P2 | não | sim | qa/biblioteca-praca.js ✓ |
| entregar a carga na fogueira da aldeia que ainda não tem armazém (`entregar`) | sim | P4 | sim | sim | qa/cidade-obras.js ✓ |
| o corpo anda e pisa onde a obra deixa: a praça, a borda do poço, os escombros da ruína (`pisar`) |  | P4 | parcial | sim | qa/encarna.js ✓ |
| o corpo bebe no poço (hoje só no rio) (`beber-poco`) |  | P4 | não | sim | — |

**Notas:** buscar água no poço é do P1 (a folha p1.js, com a prova qa/agua-solta.js); a praça tem planta desde a fase E (P4, int-civicos.js) e, desde a D-093, pela forma de cada povo (G.Forma: o deus e o 3D desenham a forma; a planta põe a fonte, os bancos e a pedra de falar onde a forma os tem — nos rostros de Roma, quem fala no topo, um piso pelo lance dos degraus —, os sólidos da forma como chão onde não se pisa, os lugares de ouvir e de conversar no chão livre; qa/biblioteca-praca.js); o «juntar» espera o lado do P2 (quem vem à praça toma esses lugares); a ruína não tem planta (o corpo pisa a casa como o mundo a tem); o aqueduto não tem atividade própria: só leva água

## Lacunas

- palacio/morar: não feita
- cidade/juntar: não feita
