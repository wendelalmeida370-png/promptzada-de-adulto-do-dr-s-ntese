# O estivador — o documento completo (o homem do porto)

**A máxima:** a vida do porto tem de ser tão boa que poderia ser um jogo sozinho — o dia carregando navios, a noite na
taverna, os dados, as brigas, o contrabando que chama baixinho. Usa a fundação dos ofícios
([`oficios-fundacao.md`](oficios-fundacao.md)) e **depende da vida a bordo e do porto** ([`navios.md`](navios.md): o porão
por dentro, a prancha que balança, o itinerário dos navios). Os números são propostas para começar.

## 1. A fantasia

Ainda escuro, o cais cheio de homens esperando. O capataz da estiva olha a fila e chama pelo nome — você entra, o seu vizinho
fica. Um mercante chegou do sul na maré da noite: ânforas de vinho, sacos de trigo, fardos de pano, um bloco de mármore para o
templo. Você sobe a prancha que balança com o navio, a ânfora no ombro, o olho no pé. A turma canta para acertar o passo; o
guindaste de roda range com quatro homens andando dentro dele. Ao meio-dia uma ânfora escorrega da mão de um novato e se
espatifa — vinho no cais inteiro, o capataz grita. No fim da tarde, as moedas contadas na mão. De noite, a taverna do porto: a
história de um marinheiro de terras que você nunca viu, os dados, uma briga com a turma rival. Na saída, um homem que você não
conhece pergunta se amanhã você pode «não contar» uma caixa.

## 2. O que já existe no jogo

- **O ofício `estivador`** (as pessoas do mundo já o fazem).
- **A descarga** (`js/act-porto.js`): uma operação do mundo — as caixas com nome, o cais, o porão, quem carrega o quê, pelo
  livro (`G.Depot`).
- **O mercante e a tripulação** (`js/harbor.js`), **a taverna** (`js/act-taverna.js`), **o furto e o contrabandista**
  (`js/crime.js`), **os boatos** que chegam com os navios (`G.Boatos`: quem vem de longe traz notícia).
- **O porto que se vê:** o perfil «porto movimentado» do bairro (`G.Urban`), o som do cais com gente trabalhando.

## 3. A chamada da manhã (a turma)

- Antes do sol, quem quer trabalho espera no cais; **o capataz da estiva escolhe** pela fama de cada um, pelo laço, pela força
  e pela turma (o mundo decide no passo; o corpo não é escolhido por ser o corpo).
- **A turma** é uma família: os mesmos homens todo dia, o líder, o novato, o velho de costas ruins, o fanfarrão. Há turmas
  rivais, e as brigas entre elas.
- **Sem navio, sem trabalho:** a tábua dos navios do porto ([`navios.md`](navios.md), N3) diz quando chega o próximo —
  saber disso antes dos outros é vantagem.

## 4. O gesto

1. **Carregar:** cada carga tem o seu jeito e o seu peso.

| Carga | Peso | O jeito | O risco |
|---|---|---|---|
| Saco de trigo | ~30 kg | no ombro | as costas |
| Ânfora de vinho ou de azeite | ~25 kg cheia | no ombro, em pé, devagar | **quebra**: o vinho no chão é perda e grito |
| Fardo de pano | ~40 kg | nas costas, com a corda | o equilíbrio |
| Barril | ~80 kg | **rolar** pela prancha (uma técnica) | escapar ladeira abaixo |
| Caixa | 20–60 kg | a dois | o vizinho que larga antes |
| Bloco de mármore, a estátua | toneladas | **o guindaste** | o cabo que parte |
| Bicho (o boi, o cavalo) | — | puxar pela rampa | o coice, o bicho que se joga na água |

2. **A prancha:** a ponte entre o cais e o navio **balança com o navio** (a onda, o vento, a carga que muda de lugar). Andar com
   peso pede equilíbrio: inclinar contra o balanço, esperar a onda passar. Errar é a carga na água, ou você na água.
3. **Arrumar o porão** (o quebra-cabeça): a carga tem lugar — as ânforas em pé na areia, o pesado embaixo e no meio, o frágil
   em cima. **Um porão torto faz o navio adernar** (pende para um lado) e navegar mal, e o capitão sabe quem arrumou.
4. **O guindaste de roda:** a máquina dos grandes — homens andando dentro de uma roda que enrola o cabo; o ritmo da roda, o
   gancho no lugar certo, a carga que gira no ar.
5. **A contagem:** o escriba conta o que entra e o que sai pelo livro. Errar a conta é perder o dia; **«não contar» uma caixa**
   é o caminho do contrabando.
6. **O canto de trabalho:** a turma canta para andar no mesmo passo; quem puxa o canto acerta o ritmo de todos (menos cansaço,
   menos queda) — uma técnica, e um título.

## 5. A recompensa que se vê e se ouve

O ranger da prancha, o baque dos sacos, o gemido do cabo do guindaste, o canto da turma, a ânfora que se espatifa, a carga
pousada no lugar certo no porão, a moeda na mão no fim do dia (o som das moedas contadas), o navio arrumado que sai do porto
reto no mar, a gritaria dos dados.

## 6. A noite do porto

- **A taverna do porto:** beber com a turma; as histórias e os boatos que os marinheiros trazem de longe (o porto é onde o
  mundo chega primeiro).
- **Os dados:** um jogo de verdade, com moedas de verdade — um pouco de sorte (o acaso do mundo) e um pouco de cabeça (quando
  apostar, quando parar); trapacear é possível, e ser pego é briga.
- **As brigas:** com a turma rival, com o marinheiro bêbado; a briga é a do mundo (para no primeiro sangue), e a fama sai dela.
- **A casa de prazer** (o lupanar dos portos antigos): um lugar do porto, com as suas pessoas e as suas consequências — as
  moedas, a fama, o ciúme de quem tem par, uma briga na porta. Sem cenas explícitas.
- **Os ladrões do cais, os contrabandistas, o recrutador do navio:** a noite oferece os outros caminhos.

## 7. O ciclo

- **O dia:** a chamada, a carga, a descarga, a hora do almoço no cais, o pagamento.
- **A noite:** a taverna, os dados, a briga, a casa de prazer — ou ir para casa, para a família.
- **A semana:** os navios que chegam e partem (a tábua do porto); os dias de muito trabalho e os de nenhum.
- **As estações:** no inverno a navegação para — o porto fica quieto, o dinheiro acaba, a fome aperta: a greve, o contrabando
  ou um ofício de inverno.
- **O longo prazo:** a força, o nome no cais, a turma própria, o capataz, o dono da estiva.

## 8. A progressão

**A prática** (a força e o equilíbrio):

| Faixa | O que abre |
|---|---|
| Carregador (0–20) | sacos e caixas; a prancha com cuidado |
| Estivador (20–40) | as ânforas sem quebrar; mais peso no ombro |
| Firme (40–60) | o barril rolado; a prancha no balanço; o corpo mais forte |
| Forte (60–85) | o fardo grande sozinho; **ler a carga** (o peso e o que tem dentro, pelo jeito e pelo som) |
| Mestre do cais (85–100) | arrumar o porão inteiro de olho; o guindaste sem medo |

**As técnicas:**

| Técnica | O que faz | Com quem |
|---|---|---|
| O jeito de levantar | poupa as costas (a ferida das costas demora a vir) | o velho da turma |
| A alavanca | mover o que não se ergue | descoberta |
| Rolar o barril | o barril pela prancha | a turma |
| O nó de carga | a carga amarrada não cai do guindaste | um marinheiro |
| O equilíbrio da prancha | a prancha no balanço | descoberta (cair duas vezes na água) |
| Arrumar o porão | o navio sai reto; o capitão paga mais | o capataz |
| O guindaste | trabalhar na roda e no gancho | a turma do guindaste |
| Ler a carga | o peso e o que tem dentro: o vinho bom, a caixa que pesa demais para ser trigo | descoberta |
| O canto de trabalho | puxar o ritmo da turma | o velho, ou o voga de uma galé |
| A conta | conferir o escriba (e não ser enganado) | o escriba, ou a escrita |
| A briga do cais | os golpes sujos | a turma rival (apanhando) |
| Os dados | ler o jogo — e trapacear | um jogador da taverna |

**Os títulos:**

| Título | O que pede | O que dá |
|---|---|---|
| **Carregador** | entrar numa turma | o pagamento por carga |
| **Estivador** | prática 30; um mês de chamadas; nenhuma ânfora quebrada na semana | a vaga certa na chamada; o pagamento melhor |
| **Chefe de turma** | prática 55; o respeito da turma (os laços); ter puxado o canto | escolher a turma; um quinto a mais |
| **Capataz da estiva** | prática 70; a confiança dos mercadores (o porão bem arrumado, nada sumido) | a chamada da manhã é sua: escolher quem trabalha |
| **Dono da estiva** | as moedas para pagar uma turma; o contrato com um mercador | contratar, ganhar de cada carga — e ser odiado ou amado pela turma |

## 9. O mundo

- **A economia:** o pagamento por carga sai do mercador, pelo livro; mais navios, mais trabalho; o cobrador do porto (a taxa); o
  preço do que vem de longe na cidade.
- **Os laços:** a turma (a família de trabalho), a turma rival, o mercador que confia, a moça da taverna, o contrabandista, o
  capataz.
- **O contrabando** (o caminho da sombra, Patch 32): a caixa que não se conta, a ânfora que some, o guarda que se compra — e o
  vigia que desconfia.
- **Os acidentes:** as costas, o pé esmagado, a queda na água, o cabo que parte.
- **A greve:** a turma para o porto — o mercador paga mais, ou chama os soldados (uma história do mundo).
- **Os acontecimentos:** o navio da peste (a quarentena, o boato), o clandestino achado numa caixa (escondê-lo ou entregá-lo), a
  estátua do deus para o templo (a procissão do cais), a carga que ninguém reclama, a caixa que pesa demais.

## 10. As passagens

O chefe de turma, o capataz, o dono da estiva; o **contrabandista** (a sombra); o **marinheiro** (subir no navio de vez); o
**mercador** (de dono da estiva a dono de carga); o ladrão do cais; o brigador de taverna que vira **gladiador**.

## 11. Do que depende, as fases e as provas

**Depende de:** a vida a bordo e o porto ([`navios.md`](navios.md): o porão por dentro na N2, a tábua dos navios na N3); a
fundação dos ofícios (a prática, as técnicas, os títulos, o kit, o mercado); o Patch 23 (os laços, as falas, as missões, a vida
noturna); o Patch 24 (os segredos do contrabando); o combate (as brigas); a descarga e a taverna (já existem).

| Fase | O quê |
|---|---|
| E1 — A carga | carregar, a prancha, o pagamento; a chamada da manhã |
| E2 — O porão | arrumar o porão, o navio que aderna; o guindaste |
| E3 — A turma | os laços, o canto, as turmas rivais, os títulos |
| E4 — A noite | a taverna do porto, os dados, as brigas, a casa de prazer |
| E5 — A sombra | o contrabando, a greve, os acontecimentos |

**As provas:** toda carga sai do navio e entra no armazém pelo livro, nada some sem quem a tirou; a ânfora quebrada é uma perda de
verdade (de quem?); o porão torto faz o navio adernar no mundo; os dados tiram do acaso do mundo e pagam com moedas reais; o mundo
sem o corpo é o mesmo (os estivadores do mundo carregam pelas mesmas regras); os casos ruins (o save no meio da descarga, o navio
que zarpa com a carga pela metade, a briga no meio do pagamento); e **o teste do dono: um dia inteiro de porto, sem enjoar.**
