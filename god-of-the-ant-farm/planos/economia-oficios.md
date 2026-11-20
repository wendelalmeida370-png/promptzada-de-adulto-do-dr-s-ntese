# A economia dos ofícios — como o dinheiro chega (proposta, 20/11/2026)

A pergunta do dono: tem ofício com salário (o guarda, o estivador) e ofício sem salário (o caçador de tesouros, o saqueador). Como
uma pessoa ganha a vida — e como junta um ofício que paga todo dia com outro que pode pagar muito, ou nada? Esta é a proposta. Os
números são para começar e se acertam medindo.

## 1. O que já existe no jogo

- **O povo paga por peça:** quem produz para o armazém do povo recebe do tesouro uma parte do preço do que trouxe (`G.Eco.pay`, o
  código «salario»), na panela da casa; sem moedas no tesouro, a pessoa fica sem receber (`v.unpaid`).
- **O soldo** do marinheiro, por viagem (`harbor.js`, «soldo»); **o salário** de quem trabalha nas termas e na taverna; **a paga** do
  porto por carga (`act-porto.js`, «paga»).
- **O aluguel** (`G.Casa.lease`), **o imposto** pela forma de governo (`G.Eco.taxRate`), **a renda da terra**, **a cunhagem**.
- **As moedas são de verdade e passam pelo livro:** a panela da casa (`h.coin`) ou o bolso de quem não tem casa; ninguém recebe o que
  o pagador não tem.

**A base está pronta:** o que falta é dar a cada ofício o seu jeito de ganhar, e ao corpo a escolha de como juntar os seus.

## 2. Os nove jeitos de ganhar

| Jeito | Como é | Quem paga | Quando | O risco |
|---|---|---|---|---|
| **O soldo** (o salário fixo) | um tanto por dia de posto cumprido | o povo (o tesouro) ou um patrão (a casa mercante, o dono da mina, o lanista) | **no fim do dia** | quase nenhum — e um teto baixo |
| **A paga por peça** | um tanto por carga, por cesto, por peça entregue | o patrão, ou o povo pelo armazém (o que já existe) | na entrega | o corpo cansa; o dia ruim rende pouco |
| **A venda** | o que se faz ou se colhe, vendido pelo preço do dia | quem compra (a banca, o mercado, a taverna) | quando se vende | o preço que cai; o que estraga |
| **A encomenda** | o pedido com prazo e preço combinado | quem pediu | na entrega | o prazo |
| **A parte** | uma fração do que o grupo ganhou | o grupo (a tripulação, o barco, a mina, a expedição) | no fim da empreitada | se não render, não há parte |
| **O achado e o saque** | o tesouro, o butim, o resgate | ninguém (ou a vítima) | quando acontece | **a vida, a lei, voltar sem nada** |
| **A renda** | o que é seu trabalha por você: a casa alugada, o barco, a mina, a escola de gladiadores | quem usa | todo dia | o que é seu pode se perder |
| **A recompensa** | a cabeça da fera que come gente, o fugitivo, o pirata, o resgate de alguém | quem a ofereceu (o povo, uma família) | no fim | a caçada |
| **O presente e a oferenda** | a moeda jogada ao bardo, o presente do admirador, a oferenda ao templo | quem quer dar | quando querem | depende da fama |

**A forma da coisa:** quanto mais seguro, menor o teto; quanto maior o teto, maior o risco. O soldo põe comida na mesa todo dia; o
tesouro pode comprar uma casa rica — ou matar.

## 3. Cada ofício e o seu jeito

| Ofício | O jeito principal | Os outros | Quem paga |
|---|---|---|---|
| **o guarda, o soldado** | soldo | a recompensa (o fugitivo, a fera); o saque (na guerra) | o povo |
| **o estivador** | paga por carga (ou o dia da turma) | o «favor» do contrabando | o mercador, o capataz da estiva |
| **o navegador** | soldo por viagem (o mais alto da tripulação) | a parte numa descoberta; o périplo vendido | o dono do navio, quem governa |
| **o pescador** | venda | a parte (no barco de outro); a encomenda | o mercado, a taverna |
| **o mineiro** | paga por cesto | a parte (na mina de um dono); o achado (a pedra preciosa — o quinto é de quem governa) | o dono da mina, o povo |
| **o gladiador** | o voluntário: soldo por luta e o prêmio da vitória; o escravo: nada | os presentes; a fama que vira contrato | o lanista, quem paga os jogos |
| **o capataz** | soldo | a corrupção (a ração vendida, o suborno) | o dono do navio ou da mina |
| **o mateiro** | a paga da expedição (contratado) | a venda do que a mata dá; a carta da mata; a recompensa | quem contrata, o mercado |
| **o arqueólogo** | a paga do patrocinador | a venda ou a doação do achado | o palácio, o templo, a biblioteca |
| **o caçador de tesouros** | o achado | o patrocínio; a recompensa da família | — |
| **o saqueador de túmulos** | o achado (pelo receptador) | — | o receptador (paga pouco) |
| **o pirata** | a parte do saque | o resgate; o soldo de corsário | — |
| **o remador de galé** | o galeote: nada; o remador livre: soldo | — | o dono da galé |

## 4. Juntar dois ofícios (o que o dono perguntou)

O jogo já tem a regra: **um ofício principal e quantos o tempo deixar praticar**. A economia dá o peso a ela:

1. **O tempo é o que se divide.** O ofício de soldo tem **um posto com hora** (o turno do guarda, a chamada da manhã do estivador).
   Cumprir o posto paga; faltar não paga, e o patrão lembra (o laço com quem paga cai; três faltas, e o posto vai para outro).
2. **Os outros ofícios vivem no tempo que sobra:** a noite, o dia de folga, a festa, a estação morta. O guarda de dia, caçador de
   tesouros à noite. O pescador no verão, carregador no inverno, quando o mar fecha.
3. **A licença:** para uma expedição de dias, pede-se licença ao patrão (uma conversa: o laço, a fama, o que se oferece em troca) —
   ou larga-se o posto e se arrisca a não tê-lo na volta.
4. **As duas vidas se tocam:** o guarda que é pego saqueando um túmulo perde o posto e ganha a cela; o estivador que contrabandeia
   arrisca a turma. **O que se faz num ofício pesa no outro**, pela fama e pela lei.
5. **A passagem:** quem começa praticando um ofício de risco e ganha nele pode trocar de principal — largar o soldo pelo achado (a
   virada de vida, do Patch 23), ou o contrário, quando a família precisa.

## 5. As regras (nada vem do nada)

1. **Todo pagamento passa pelo livro**, de quem paga para quem recebe, com a causa (`G.Depot`).
2. **Ninguém paga o que não tem:** o tesouro vazio não paga o guarda; o mercador falido não paga a turma. **Quem não recebe se
   queixa** — a greve da turma, o motim do soldado sem soldo, o capataz que rouba a ração (o que já existe em parte: `v.unpaid`).
3. **O dinheiro vai para a panela da casa** (ou para o bolso de quem não tem casa) — e **a família come dela**. O soldo do corpo põe
   comida na mesa da família dele; a aventura que não rende deixa a família com fome. **A família é a razão do dinheiro.**
4. **Os preços reagem** (o mercado do corpo, [`oficios-fundacao.md`](oficios-fundacao.md) §2.8): dez pescadores barateiam o peixe; a
   fome o encarece.
5. **O nível conta:** a perícia e o título sobem o soldo e o preço (o mestre ganha mais que o aprendiz; o capitão pirata leva duas
   partes); é uma das recompensas da progressão.
6. **O imposto e a parte de quem governa:** o soldo já vem do tesouro; a venda paga a parte da praça; o achado paga o quinto.
   Esconder do imposto é crime.
7. **As pessoas do mundo ganham pelas mesmas regras** — e a índole decide quem junta um soldo com um ofício escuro (o guarda que
   contrabandeia, pela ganância).
8. **As estações mudam o trabalho** (o calendário): o mar fechado no inverno, a colheita do outono, a montanha da primavera — há
   ofícios de estação, e quem vive deles precisa de outro na estação morta.

## 6. Para onde o dinheiro vai (o que dá sentido a ganhar)

A comida e a despensa da família, o aluguel ou a compra da casa (e a casa rica), as ferramentas e o barco, a taverna e os banhos, o
imposto, o presente para quem se ama, o resgate de alguém, a licença de uma mina, a escola do filho, o dote, a fiança — e **o que se
perde**: o roubo, o fogo, a dívida, a ferramenta que quebra.

## 7. A tela

Na aba do Ofício, por ofício: **como ele paga** (o soldo, a peça, a venda, a parte), **o que rendeu** (o dia, a estação), **o posto e
a hora** (do ofício de soldo); na casa, **a panela da família** (o que entra, o que sai). Sem números pulando na tela: as moedas são
coisas que se veem na mão e na casa.

## 8. As provas (quando for feito)

Todo pagamento tem pagador e causa no livro; ninguém recebe de um tesouro vazio; o posto não cumprido não paga; a família come da
panela da casa; o mundo sem o corpo é o mesmo (as pessoas do mundo ganham pelas mesmas regras); o medidor da economia (`oficio-eco`,
`sociedade-eco`) dentro das faixas; os casos ruins (o patrão que morre devendo, o tesouro que esvazia na guerra, o save no meio do
mês, a licença negada).

## 9. Quando entra

A máquina (os nove jeitos, o posto e a hora, a licença) com a fundação dos ofícios (Patch 25); **cada ofício traz o seu jeito de
ganhar** no seu patch ([`roteiro.md`](roteiro.md)).
