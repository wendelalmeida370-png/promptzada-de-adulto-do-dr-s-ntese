# O juiz — o documento completo (a verdade e a sentença)

**A máxima:** julgar tem de ser tão bom que poderia ser um jogo sozinho — o caso que chega com um morto e três versões, a testemunha
que jura e treme, a bolsa achada debaixo da cama errada, o álibi que o taverneiro confirma ou desmente, o nobre que diz «você sabe
com quem está falando?», a bolsa de moedas empurrada por baixo da mesa, a multidão gritando lá fora — e a sentença, que muda uma
vida, uma família e o que a cidade pensa de justiça. **O juiz é um detetive que, no fim, tem de decidir.** Usa o crime e a justiça
que o jogo já tem (`G.Crime`, `G.Justice`), quem governa ([`oficio-governante.md`](oficio-governante.md)), o grupo
([`grupos.md`](grupos.md)), as marcas ([`marcas.md`](marcas.md)) e a fundação dos ofícios ([`oficios-fundacao.md`](oficios-fundacao.md)).
Os números são propostas para começar.

## As bases e as perícias

**As bases** (as leis do mundo que valem para todos — [`pericias.md`](pericias.md)): a lei e a gente (o crime, a testemunha, a fama, os
boatos, os laços, a lei de cada povo e de cada regime); a origem das coisas (a multa e a devolução pelo livro); o corpo (o castigo); a
memória do mundo (a sentença que fica).

**As perícias que o ofício usa:** **Julgar** (a principal — a nova: a lei, a prova, o peso de cada coisa, a sentença justa) — e
Investigar, Ler as pessoas, Letras, Comandar (o tribunal), Negociar (a composição entre as famílias), Espetáculo (a sentença dita em
público). A prática e as técnicas são das perícias, e os títulos pedem o nível delas.

## 1. A fantasia

De manhã trazem o caso: o filho do ferreiro foi achado morto atrás da taverna, e o guarda prendeu o estivador que brigou com ele na
véspera. A mãe do morto quer a cabeça do estivador. O estivador jura que dormiu em casa. Você ouve a mulher dele (diz que sim, mas
não olha nos seus olhos), o taverneiro (diz que os dois brigaram e saíram em horas diferentes), um menino (viu «um homem de capa»
atrás da taverna — e o estivador não tem capa). O guarda traz a faca, achada no beco — de bronze bom, cara demais para um estivador.
À tarde, um homem rico manda dizer que «um julgamento rápido seria bom para todos». Você pede mais um dia. À noite, o menino lembra
que o homem de capa mancava. Na manhã seguinte, na praça cheia, você solta o estivador — e manda o guarda atrás de um homem que manca
e tem uma faca de bronze a menos. A multidão vaia. Duas semanas depois, o homem que manca é achado. A cidade passa a dizer o seu nome
de outro jeito.

## 2. A história e o nome

Os anciãos julgavam na porta da cidade; o rei julgava no palácio, e os grandes reis deixaram as suas leis gravadas em pedra; os
egípcios julgavam diante do vizir e juravam pela vida do rei — e os julgamentos dos ladrões de túmulos ficaram escritos; os
atenienses tiravam **centenas de cidadãos à sorte** para julgar, e votavam com pedrinhas em duas urnas; os romanos tinham o magistrado,
o advogado que falava pelo acusado e a lei que tratava diferente o rico e o pobre; no norte, **a assembleia dos homens livres** ouvia
o que recitava a lei de cor, e o morto podia ser pago à família (**o preço do sangue**) — ou a briga resolvida num **duelo diante de
todos**; os astecas tinham tribunais duros, e a bebedeira do moço era crime. **No jogo, o ofício chama-se juiz** — o ancião, o
magistrado, o sacerdote-juiz, o que recita a lei, conforme o povo e o regime.

## 3. O que já existe no jogo

**O crime** (`crime.js`): o furto com motivo (a fome, a noite na rua, o costume), **a testemunha que sabe só o que viu**, a casa que
acha a bolsa mais leve, o guarda que procura e prende, **a cela** com o carcereiro (`v.jail`), a devolução das moedas, a agressão e o
homicídio (`G.Crime.assault`), a fuga; **a pena pela lei do regime** (`G.Crime.sentence`: os anciãos mandam devolver; o tirano dá três
anos; a democracia, um ano «decidido diante de todos»; a teocracia, a penitência); **a justiça** (`justice.js`): a sentença de quem
governa cumprida em público, **o cadafalso do jeito de cada povo**, a multidão que aplaude, grita ou ataca o cadafalso; os boatos (o
crime nasce boato, **e o culpado pode ser trocado na boca do povo**); a fama; os laços e as marcas de quem fez o quê.

**O que falta: o julgamento.** Hoje a pena sai sozinha, pelo regime. O juiz abre o caso, ouve, pesa e decide.

## 4. O caso (a verdade existe; o juiz não a vê)

- **A verdade está no mundo:** quem fez, como, por quê — o registro do crime guarda (`S.crimes`).
- **O juiz só sabe o que chega a ele:** a acusação, o que o guarda achou, **o que cada testemunha viu** (e só isso — a regra que o jogo já
  tem), as coisas (a bolsa, a faca, o sangue, a pegada), o que se diz pela cidade (o boato, que pode ter trocado o culpado).
- **As testemunhas mentem pela índole e pelos laços:** a mulher protege o marido; o inimigo acusa; o medroso cala diante do poderoso; o
  falastrão aumenta; o honesto diz o que viu, mesmo contra o amigo.
- **O acusado tem a sua versão:** o álibi (onde estava — e quem o viu lá: o taverneiro, o vizinho, o vigia), o motivo que nega, o medo.

## 5. A audiência (o coração do ofício)

1. **Ouvir a acusação** — quem acusa e de quê.
2. **Chamar as testemunhas** — uma por vez; **perguntar**: o que viu, quando, de onde, com que luz.
3. **Confrontar:** a contradição entre duas versões, a versão que muda, o detalhe que não bate (a capa que o acusado não tem, a hora
   em que a taverna já estava fechada). **Ler as pessoas** mostra quem hesita, quem olha para o chão, quem decorou a fala.
4. **Mostrar a prova** — a faca, a bolsa — e ver a reação.
5. **Ouvir a defesa** — o acusado, a família, **o advogado** (onde o povo o tem).
6. **Mandar investigar mais** — o guarda vai à cena, procura o homem que manca, revista a casa; **ir você mesmo** ao beco, à taverna.
7. **Deliberar** — sozinho, com os outros juízes, ou **deixar o júri votar** (onde o povo julga junto).
8. **A sentença** — dita em público, pela lei, com o seu peso.

## 6. A sentença (a lei dá a moldura, o juiz decide dentro dela)

| Pena | Quando | O que pesa |
|---|---|---|
| **A devolução e a multa** | o furto, o dano, a dívida | pelo livro: a moeda volta à casa roubada |
| **O preço do sangue** | a morte, a ferida (no norte e onde a lei aceita) | a família do morto aceita a paga — **ou quer vingança** |
| **A cela** | o furto, a briga, a desordem | os anos que a lei do povo diz (o que já existe) |
| **O trabalho forçado** | os crimes maiores | **a mina, a galé** — o condenado vira galeote ou escravo da mina (as condições) |
| **O exílio** | o crime contra a cidade, o político perigoso | a pessoa vira exilada (a condição) — **e o ostracismo, o exílio pelo voto** (os gregos) |
| **O açoite em público** | o pequeno crime, a desonra | a vergonha diante de todos |
| **O cadafalso** | o homicídio, a traição, o sacrilégio | **a morte do jeito de cada povo** (o que já existe) — e a multidão que reage |
| **O duelo diante de todos** | a briga de honra (no norte) | o duelo que o jogo já tem decide — os deuses escolhem, dizem |
| **O perdão** | quando a justiça pede menos que a lei | a fama de misericordioso — ou de fraco |
| **A absolvição** | quando não há prova | a família da vítima, furiosa; o inocente, solto |

**A lei é de quem governa** (ela muda pelo regime e pelo decreto — [`oficio-governante.md`](oficio-governante.md)); **o juiz a aplica** —
e, onde a lei trata diferente o rico e o pobre, **escolhe se segue ou se desafia**.

## 7. As pressões (o que torna o ofício difícil)

| Quem pressiona | Como | O preço de ceder | O preço de resistir |
|---|---|---|---|
| **O poderoso** (o nobre, o rico, o amigo do rei) | a ameaça, o favor, «você sabe com quem está falando?» | o inocente condenado, a fama de vendido | **a vingança do poderoso**, o cargo, a vida |
| **O suborno** | a bolsa por baixo da mesa | **é crime** (pelo livro, com testemunhas) — e a fama, se descobrem | a pobreza honesta |
| **A multidão** | «Morte! Morte!» na praça | o inocente no cadafalso | a pedra na janela, o motim |
| **A família da vítima** | a dor, a vingança | a sentença dura demais | o rancor — e a vingança por conta própria |
| **Os sacerdotes** | o sacrilégio, a lei dos deuses | a justiça cega | o altar contra você |
| **Quem governa** | o réu político, a ordem velada | o juiz servo | **o juiz que condena o amigo do rei** |
| **A própria consciência** | a dúvida | — | — |

## 8. O erro (e o que ele deixa)

**O juiz pode errar** — e o mundo não esquece: o inocente que foi para o cadafalso e o verdadeiro culpado achado anos depois (a verdade
que estava no registro do crime o tempo todo); o culpado solto que mata de novo. **O erro vira memória** (dos laços, da cidade, das
marcas) e **pesa na fama** — e o inocente solto depois de anos, ou a família dele, lembra de quem o condenou.

## 9. O tribunal e o dia do juiz

- **Onde se julga:** a porta da cidade (os anciãos), o fórum e a praça mais antiga (onde o povo se junta — `Po.forum`), o palácio, o
  templo, a assembleia ao ar livre (o norte).
- **O dia:** a lista dos casos (o furto, **a dívida do fiado** da taverna, **a terra** — o marco do campo mudado de lugar, **a herança** —
  quem fica com a casa, o casamento desfeito, a briga, o morto, o sacrilégio, a traição, **a liberdade** de um cativo que diz que foi
  levado à força), as audiências, as idas à cena, as sentenças, e **o que fica escrito** (o escrivão).
- **As causas grandes:** o nobre acusado, o crime do templo, **a traição** — com quem governa olhando.

## 10. Os perigos

| Perigo | Como vem |
|---|---|
| **A vingança** | o condenado que sai da cela, a família dele, o poderoso contrariado |
| **O motim** | a multidão que não aceita a sentença (e ataca o cadafalso — o que já existe) |
| **O suborno descoberto** | o crime, a cela, a fama |
| **O erro** | o inocente morto, a memória da cidade |
| **A política** | o juiz que atrapalha quem governa — ou o conselho |

## 11. As técnicas (22, das perícias que o ofício usa)

Cada técnica é de uma perícia (o catálogo em [`pericias.md`](pericias.md)): aprendida aqui, vale em todo ofício que usa a mesma perícia.

| Técnica | Perícia | O que faz | De quem se aprende |
|---|---|---|---|
| A lei de cor | Julgar | saber o que a lei diz de cada caso, sem o livro | o que recita a lei, um juiz velho |
| O peso da prova | Julgar | a prova forte e a fraca, a dúvida que absolve | um juiz velho |
| A sentença justa | Julgar | a pena do tamanho do crime | descoberta (as sentenças que a cidade aprovou e as que vaiou) |
| A composição | Julgar | as duas famílias de acordo, sem sangue | um ancião |
| O precedente | Julgar | a sentença antiga que decide a nova | o livro das sentenças |
| A misericórdia | Julgar | o perdão que não parece fraqueza | descoberta |
| Perguntar | Investigar | a pergunta que abre a testemunha | um juiz, um guarda velho |
| A contradição | Investigar | as duas versões que não batem | descoberta |
| A cena | Investigar | ler o lugar do crime | um guarda velho, um caçador |
| O álibi | Investigar | conferir onde o acusado estava | descoberta |
| Os ossos e as feridas | Investigar | como morreu, com o quê, quando | um curandeiro |
| A revista | Investigar | o que a casa esconde | um guarda |
| Quem mente | Ler as pessoas | a testemunha que decorou a fala | descoberta |
| O medo da testemunha | Ler as pessoas | quem cala por medo de quem | descoberta |
| O réu poderoso | Ler as pessoas | o que o nobre quer de verdade | um juiz velho |
| O livro das sentenças | Letras | a sentença escrita que não se discute | um escrivão |
| A lei escrita | Letras | ler o código, o decreto, o contrato | um escriba |
| O silêncio do tribunal | Comandar | a sala que obedece | descoberta |
| A sentença na praça | Espetáculo | a palavra que a multidão aceita | um orador |
| O preço do sangue | Negociar | a paga que a família aceita | um ancião do norte |
| Recusar a bolsa | Julgar | o suborno recusado sem fazer um inimigo mortal | descoberta |
| O júri | Comandar | os jurados que ouvem antes de votar | um magistrado |

## 12. A prática da perícia principal — Julgar (o que cada faixa abre)

| Faixa | O que abre |
|---|---|
| Escrivão (0–20) | escrever as sentenças, ouvir os casos dos outros |
| Juiz da cidade (20–40) | os furtos, as dívidas, as brigas; a lei de cor |
| Juiz firme (40–60) | **o peso da prova**: a contradição aparece na leitura dos depoimentos |
| Grande juiz (60–85) | as mortes, os nobres, a traição; o precedente |
| O Justo (85–100) | a sentença que a cidade inteira aceita — e que vira lei |

## 13. Os títulos

| Título | O que pede | O que dá |
|---|---|---|
| **Escrivão do tribunal** | saber escrever; trabalhar com um juiz | a paga, os casos vistos de perto |
| **Juiz da cidade** | julgar 25; a nomeação (por quem governa, pelo conselho, pelos anciãos) | os casos pequenos da cidade |
| **Juiz do reino** | julgar 50; cem casos sem um erro provado | as causas grandes, os nobres |
| **Grande juiz** | julgar 70; **uma sentença que virou precedente** | o mais alto tribunal; os outros juízes |
| **O Justo** | julgar 85; a fama de justo em todo o povo | **o epíteto**, o nome no livro da lei |

**Em cada regime, o caminho muda:** o ancião (a tribo), o magistrado eleito por um tempo (a república), **o jurado tirado à sorte** — o
corpo pode ser jurado por um dia, como qualquer cidadão (a democracia) —, o sacerdote-juiz (a teocracia), **o que recita a lei** (o
norte), o juiz do rei (os dinásticos), o juiz do tirano (que julga o que lhe mandam julgar).

## 14. As lendas (nascem do mundo)

| Lenda | O que é |
|---|---|
| **A sentença que mudou a lei** | o caso que virou precedente e depois lei |
| **O juiz que condenou o rei** | o tribunal que julgou quem governa — uma vez numa história |
| **O inocente que voltou** | o condenado que a verdade libertou décadas depois |
| **A lei dos antigos** | o código de um povo antigo, achado numa pedra pelo arqueólogo ([`passado.md`](passado.md)) — e o debate que muda a lei de hoje |

## 15. A economia

A paga do juiz (o soldo do povo, ou as taxas do tribunal), **a multa e a devolução pelo livro**, o suborno (crime), a paga da família
no preço do sangue; o juiz honesto que fica pobre, o vendido que enriquece — e o que a cidade diz de cada um
([`economia-oficios.md`](economia-oficios.md)).

## 16. O mundo

A sentença muda a vida do condenado, da família dele, da família da vítima — **e a cidade inteira**: o juiz duro faz o ladrão ter medo
(e o povo também); o justo faz o povo confiar na lei (menos vingança por conta própria); o vendido faz o povo fazer justiça com as
próprias mãos. **O boato julga antes do juiz** (e às vezes troca o culpado). A política: o juiz que incomoda quem governa, o tribunal
que segura o tirano — ou que o serve.

## 17. Por povo

O **Egito** (o vizir, o juramento pela vida do rei, os julgamentos dos ladrões de túmulos); os **gregos** (**os jurados tirados à sorte**,
as pedrinhas nas urnas, **o ostracismo**); os **romanos** (o magistrado, **o advogado**, a lei diferente para o rico e para o pobre); o
**norte** (a assembleia, **o que recita a lei de cor**, **o preço do sangue**, **o duelo diante de todos**); os **astecas** (os tribunais
duros, a bebedeira como crime, a pena para o juiz que se vende).

## 18. A camada do ambiente

| A fotografia | O som | O tremor | A tela | A mochila |
|---|---|---|---|---|
| a sala do tribunal, a praça cheia no dia da sentença, o rosto da testemunha de perto, o beco do crime | o murmúrio do tribunal, **o silêncio antes da sentença**, a multidão, a voz que treme | o tumulto | **o caderno do caso**: o que cada um disse, as provas, as contradições marcadas por você — nunca a verdade à vista | a vista do juiz: o caderno, o livro da lei, o selo |

## 19. As falas, as animações, as interações, o grupo, as marcas e a leitura

**Os assuntos novos:** o julgamento do dia, a sentença justa ou injusta, o inocente solto, o culpado que fugiu, o juiz vendido, o nobre
absolvido, o cadafalso de amanhã.

**As falas:**
- (a testemunha) «Eu vi! Era ele, juro pelos deuses!»
- (o acusado) «Eu estava na taverna a noite toda — pergunta ao taverneiro!»
- (a mãe da vítima) «Eu quero a cabeça dele. Nada menos.»
- (o nobre) «Você sabe com quem está falando?»
- (o subornador, baixinho) «Uma bolsa dessas resolve muita coisa…»
- (a multidão) «Morte! Morte!» — (depois da absolvição) «Vendido!»
- (o guarda) «Achamos a bolsa debaixo da cama dele.»
- (o escrivão) «A sentença, juiz?»
- (o ancião) «No meu tempo, isso se resolvia com uma vaca.»
- (na taverna) «Dizem que o juiz novo não aceita bolsa. Vamos ver por quanto tempo.»

**As animações:** sentar na cadeira do juízo, a mão erguida pedindo silêncio, examinar a prova girando-a nas mãos, apontar o acusado,
ouvir com a mão no queixo, receber o juramento (a mão no altar), escrever e selar a sentença, **dizer a sentença de pé, o braço
estendido**, empurrar de volta a bolsa do suborno (ou cobri-la com a mão), os jurados pondo as pedrinhas nas urnas.

**As interações:** chamar a testemunha; perguntar; confrontar duas versões; mostrar a prova; ir à cena; mandar o guarda investigar;
consultar a lei (o livro, o que recita a lei); deliberar com os outros juízes ou com o júri; sentenciar; perdoar; aceitar ou recusar a
bolsa; levar o caso a quem governa.

**O grupo** ([`grupos.md`](grupos.md)): **o tribunal** — **os papéis**: o escrivão, o guarda do tribunal, o carcereiro, o carrasco, os
jurados, o advogado; **as ordens**: «tragam a testemunha», «silêncio», «levem-no», «revistem a casa»; **as situações**: o tumulto, o
réu poderoso, a testemunha que some, a multidão na porta.

**As marcas** ([`marcas.md`](marcas.md)): **o livro das sentenças** (as sentenças escritas que viram precedente), a lei gravada que
nasceu de um caso, **a colina do cadafalso** (o lugar que o povo evita), a pedra que devolve a honra ao inocente, o nome do juiz justo
no livro da lei.

**A leitura** ([`leitura.md`](leitura.md)): **por que a testemunha mente** (o laço com o réu, o medo de quem manda, o suborno) — o olhar que foge, a história que muda na segunda vez —, e **por que a cidade não aceitou a sentença** (o réu querido, a pena dura demais ou mole demais). O juiz experiente lê mais (a perícia Julgar); a verdade em si, ele nunca vê.

**O deus** (a vista de cima e os poderes): **o deus sabe a verdade; o juiz não** — de cima, o deus viu o crime acontecer. Nos regimes que o pedem, **o juízo de deus** (a ordália: o ferro quente, a água): **o jogador-deus decide de verdade** — a mão que sara (a Cura) ou o raio que acusa —, a cidade lê a sentença do céu, e o deus que inocenta o culpado também fica na memória do povo.

## 20. Os derivados

O **escrivão do tribunal**, o **advogado** (o que fala pelo acusado — onde o povo o tem), o **jurado** (por um dia: uma função de
cidadão), o **que recita a lei** (o norte), o **carcereiro** e o **carrasco** (da guarda), o **investigador** (o juiz que vai à cena).

## 21. As fases e as provas

| Fase | O quê |
|---|---|
| Jz1 — O caso e a prova | a verdade no registro do crime; o que cada testemunha viu; as coisas achadas; o caderno do caso |
| Jz2 — A audiência | perguntar, confrontar, mostrar a prova, a mentira pela índole e pelos laços, a defesa, investigar mais |
| Jz3 — A sentença e a lei | as penas pela lei do povo e do regime, a moldura e a escolha do juiz, as penas que levam às condições |
| Jz4 — As pressões | o poderoso, o suborno, a multidão, a família, os sacerdotes, quem governa |
| Jz5 — A justiça e a história | o erro e a memória, o precedente, o júri, a sentença em público, as lendas, as marcas |

**As provas:**
- a verdade de cada crime está no registro do mundo, e **o juiz só sabe o que os depoimentos e as provas dão** (a porta do que o
  personagem sabe);
- a testemunha diz só o que viu, e mente pela índole e pelos laços — sem sorteio solto;
- a sentença passa pelas portas que já existem (a cela, a devolução pelo livro, o cadafalso, as condições);
- o suborno é crime pelo livro, com testemunhas;
- o mundo sem o corpo é o mesmo: **os juízes do mundo julgam pelas mesmas regras**, cada um pela sua índole, dentro da lei;
- os casos ruins: o save no meio da audiência, a testemunha que morre, o acusado que foge, o juiz subornado descoberto, a multidão que
  ataca o tribunal, o deus que fulmina o condenado;
- e **o teste do dono: um dia inteiro no tribunal, sem enjoar.**

## 22. Quando entra

**Com a sombra, no Patch 34** — o ladrão, o contrabandista, o espião e o assassino fazem o crime; **o juiz fecha o círculo**, e a
investigação é a mesma perícia do guarda e do caçador de recompensas. O juiz é do domínio do poder, mas o seu jogo é o do crime
([`roteiro.md`](roteiro.md)).
