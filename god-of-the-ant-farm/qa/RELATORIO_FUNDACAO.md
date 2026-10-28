# A Fundação de Gameplay e os Interiores Vivos — relatório de entrega (v37)

> **Rascunho:** as seções 4 (os testes) e 8 (o desempenho) entram com a regressão completa.

> Escrito para quem não programa. **Provado** quer dizer que há uma prova que roda de verdade e o resultado está anotado
> aqui. **Parcial** quer dizer que funciona em parte, e o texto diz qual parte. **Não feito** está dito como não feito.
> O desenho técnico e o plano estão em `FUNDACAO.md`; cada defeito, limite de teste e decisão, em `AUDIT.md`.

## 1. O pedido

O dono pediu, em 19/10, três coisas:
- **a Fundação de Gameplay:** atividades reutilizáveis, completas e com causa (um trabalho feito de verdade, do começo ao
  fim, que mexe no mundo);
- **os Interiores Vivos:** prédios com dentro, coerentes, variados, funcionais e persistentes;
- **o adendo:** uma realidade só, em três níveis de resolução (o salto no tempo, o passo normal e o corpo encarnado), com
  testes de invariância causal.

Foram 220 commits desde a v36 (`3da99be`), com três especialistas (C1 atividades e economia, C2 interiores, C3 o corpo, o
3D e a interface) e o líder integrando etapa por etapa, com uma prévia publicada a cada etapa.

## 2. O que mudou para quem joga

**Os prédios têm dentro.** São 26 tipos com planta: o barraco, a cabana, a casa, o sobrado, a ínsula, o quarteirão, o
depósito, o armazém, o celeiro, o mercado, a oficina, a forja, a tecelagem, a olaria, o açougue, o ourives, a taverna,
o templo, o quartel, a cadeia, os banhos, o paço, os três palácios e a feira.
- Cada prédio tem a sua planta: cômodos, móveis, escadas, portas e janelas, e às vezes jirau, sótão, terraço, porão ou
  esteios.
- A planta segue o povo, o clima, o lote e o tamanho da família. Onde a arquitetura permite, cada combinação tem pelo menos
  cinco famílias de planta (D-047, D-056).
- A mesma casa é sempre a mesma: a planta sai do registro do prédio (`b.ip`), que vai no save. Ela não muda ao entrar,
  nem ao trocar de vista.
- **No Modo Deus**, «Ver a planta», no painel do prédio, mostra o dentro andar por andar (D-039).
- **No Modo Encarnado**, entra-se pela porta e anda-se lá dentro. O telhado se corta, o olho fica dentro do cômodo, as
  paredes seguram o corpo, as portas abrem pelo que o mundo diz, e dorme-se na cama.
- **A casa guarda o que os móveis comportam** (D-059). O que não cabe fica no chão da casa: nada pago vai parar no
  estoque do povo.

**O trabalho é de verdade.** Cada coisa que muda de lugar passa por um livro-razão, com o motivo, e nada se perde por
falta de espaço (o que não cabe fica onde estava).
- **A descarga no cais:** o manifesto, a equipe, a paga, a conferência e as interrupções. A caixa pesada vai a dois.
- **O negócio:** a banca mostra o estoque real. Há o atacado pago, a pechincha, o fechamento do dia e a troca onde não há
  moeda. A fila tem oito lugares (D-057).
- **A família:** as compras chegam em casa. A casa tem dono e herdeiro (D-051), e a família junta moedas para uma casa
  nova.
- **A pesca é contada:** cada água tem o seu peixe, e acaba.
- Também: o saque, a carga comum nas mãos e as falas da atividade nos cinco povos (`G.Falas`, sem inteligência
  artificial).

**O corpo encarnado não tem vantagem.**
- Corta, pesca e carrega no mesmo ritmo de uma pessoa do mundo. Antes cortava árvore 2,25× mais depressa e pescava 3×
  (L-139, L-212, D-035).
- Com o menu aberto, o mundo e o corpo param juntos (D-036).
- As ações têm fases: aproximar, tocar, o mundo fazer, o resultado, voltar.
- As coisas aparecem na mão com a sua forma. As falas e os textinhos do mundo aparecem sobre os olhos do corpo (L-211).
- **O Diário de Vida** mostra a vida de uma pessoa (§39). Um objetivo, como a casa nova, pode ser deixado de lado pelas
  mãos do corpo (D-061).

**Uma realidade só.** O que acontece no salto, no passo normal e com o corpo encarnado tem a mesma causa e acontece uma
vez só. Os testes A a F do adendo provam isso: a loja nos três níveis, uma operação atravessando o salto, o passo, o corpo
e um save, o tempo que passou, o prédio e o interior, a conservação e a repetição, e o mesmo cenário com e sem câmera e
corpo (`qa/invariancia.sh`).

## 3. As fundações novas (para quem mexe no código)

| Peça | Arquivo | O que garante |
|---|---|---|
| `G.Depot` | `js/activity.js` | Quem guarda coisas: o povo (`f:`), a casa (`h:`), a prateleira (`b:`), a banca (`z:`), o cais (`q:`), o navio (`s:`), as mãos (`v:`), o bolso (`p:`), o chão (`g:`). Toda escrita é atômica e entra no livro-razão com a causa. |
| `G.Act` | `js/activity.js` | As operações de vários passos (`S.acts`): a descarga, o negócio, a pesca, a casa. O progresso é confirmado no contato e cortado com `abort`. Os gestos (`G.Act.ANIM`, 23) têm pose no 3D. |
| `G.Biz`, `G.Compras`, `G.Casa`, `G.Pesca`, `G.Falas` | `js/act-*.js` | O negócio, as compras da família, a casa com dono e herdeiro, o pesqueiro contado, as falas por povo e era. |
| `G.Interiors` | `js/interiors.js`, `js/int-*.js` | A planta, função pura do registro do prédio (sem acaso nenhum), com as receitas, o catálogo e o validador. Liga duas portas: a das pessoas (`G.Vg.planDoor`) e a dos guardados (`G.Depot.stores`). |
| `G.Space` | `js/space.js` | Onde o corpo pisa e onde a porta de um prédio pode ficar (`entryFits`): degraus que os pés sobem, a porta diante da rua do mundo, nunca diante de um bolsão (L-207 a L-209, L-216). |
| `G.Possess.apply` | `js/possess.js` | O que o corpo pede passa pelas mãos dele, no passo do mundo (regra 24). |

As regras novas do vigia do código (`qa/guard.js`):
- 12: o livro-razão;
- 13: a operação é do mundo;
- 14: a carga tem dono;
- 15: a planta é do registro;
- 16: a planta não tem acaso;
- 17: o desenho não reforma;
- 18 e 19: um dono por lista;
- 21: o verificador confere os sistemas novos;
- 22: as portas dos interiores;
- 23: o mundo só pergunta ao espaço se a entrada cabe;
- 24: o diário só pede.

As invariantes de cada sistema estão no seu arquivo (`qa/*-inv.js`) e entram no verificador pelo `qa/junta-inv.js`.

## 4. Os testes executados

‹a regressão completa: preencher com o resumo da pasta da regressão — as fases, quantas provas, quantas passaram, as
diferenças para a linha de base e o que cada uma quer dizer›

## 5. Os defeitos achados e corrigidos

Foram **86 defeitos** (L-132 a L-219), **65 limites de teste** (T) e **31 decisões** (D). Cada defeito foi reproduzido
antes do conserto, e a prova que falhava passa depois. Por família:

- **A planta e as portas** (L-132 a L-135, L-145 a L-149, L-153 a L-156, L-166 a L-168, L-182, L-192 a L-197, L-206 a
  L-209, L-216, L-217). Janelas cortadas pelo jirau, o chão lido fora da escada, a porta da casa semienterrada, templos e
  palácios sem lugar para o altar ou a escada. Portas diante de um bolsão de chão ou com um lance que os pés não sobem,
  e quem está dentro de um prédio posto, para o mapa, no lado errado.
- **O corpo e o 3D** (L-139, L-151, L-157 a L-163, L-172, L-175 a L-177, L-178 a L-180, L-183, L-188, L-205, L-210 a
  L-213). O corpo mais rápido que o mundo, o estivador que não se completava, o cão que ganhava da porta, o olho que
  saía de casa, o verificador que acusava de fome o corpo parado na soleira, degraus cortados pelo chão, o cais dentro da terra, gestos sem pose, as falas que o 3D não mostrava.
- **A economia e o livro** (L-136 a L-138, L-141 a L-144, L-152, L-173, L-174, L-181, L-184, L-186, L-198 a L-203,
  L-214, L-218). O mercador sem moeda que levava de graça, a compra que sumia ou ia para o armazém do povo, as moedas
  mexidas à mão, o fiado que virava presente, a tripulação morrendo de fome no cais, `try/catch` mudos que escondiam erros.
- **Defeitos antigos que as provas novas acharam** (L-140, L-164, L-165, L-169 a L-171, L-185, L-187, L-189 a
  L-191, L-215, L-219). A obra deixada no último milésimo, o povo com comida e sem armazém que não comia, o exército que
  voltava para casa encerrado no load, o motim que sumia no save, o cais com água só na diagonal, as famílias do modo
  desenvolvedor com filhos nascidos antes da hora.
- **O que os mundos novos acharam no fechamento** (L-300 a L-306, L-308, L-310 a L-316, L-320 a L-326, L-330, L-332,
  L-340 a L-349). Gerando de novo os mundos prontos e rodando as provas neles apareceram:
  - a água nas mãos fora do seu recado (L-300);
  - a crônica que contava de novo a primeira represa dos castores (L-301);
  - a flecha do Amor Divino que sumia sem uma palavra (L-302);
  - a cena da manhã que quebrava sem lugar livre diante da casa (L-303);
  - a ruína que guardava o dono morto (L-304);
  - moedas que nasciam num povo sem moeda (L-305);
  - quem estava onde o deus mudou o chão (L-306);
  - o corpo dentro do pilar de um portão (L-308);
  - prédios e a Grande Pirâmide fora do lote no 3D (L-310, L-311);
  - três da casa: o aluguel que a família podia pagar, a obra paga sem a vez dos materiais, a troca da terra cara que
    nunca acontecia (L-312 a L-314).
  - o calceteiro que escolhia a rua de outra ilha e tentava de novo a cada 12 s, sem fim (L-322, achado pela regressão
    final: com o conserto, o mundo de teste constrói mais).
  - mais dois da casa: o aluguel que ia a um parente da família, e a família de aluguel que se dizia «na casa de outros»
    (L-315, L-316);
  - a caixa pesada largada pela ajudante no meio do caminho, e a ajudante que parava na esquina (L-330, L-332);
  - a soleira e a porta: os degraus num portão ou no lote de outro prédio, o pé medido no chão errado, o «E» que dava o
    peixe na soleira dentro d'água (L-323 a L-326);
  - o corpo encarnado que acordava antes de uma pessoa do mundo no mesmo estado (L-341);
  - os muros: o portão do plano sobre um muro de pé (L-340), o muro que corria dentro do muro da cidade vizinha e fechava
    casas num bolsão (L-342), o muro que fechava um prédio da própria cidade — a forja de Hedeby — (L-344) e o prédio
    construído colado num portão, dos dois lados (L-348);
  - os caminhos: o caminho longo que a busca exata não achava no orçamento, e a comerciante que não voltava de uma
    caravana (L-343); a viagem que levava quem não chegava a pé ao cais e o embarcava de longe, através do mar (L-346);
    quem buscava o caminho de um prédio aonde o mapa dizia que não se chega, e a carga levada ao armazém do outro lado da
    água (L-349);
  - a crônica com duas festas iguais no mesmo ano, que não se distinguiam (L-347).

  Quase todos esses foram achados pelo verificador no fim de uma prova: alguém preso num lugar aonde não se chega, ou
  falhando o caminho seguidas vezes. O conserto de cada um foi na causa — o mapa de regiões perguntado onde não era —, não
  no verificador.

  O mais sério foi o **L-320**. Desde um conserto desta mesma versão (L-215), uma função de mesmo nome tomou o lugar de
  outra, e as 162 frases do roteiro das histórias (a sentença lida, o chamado da família, a herança) deixaram de ser
  escritas: cada uma rodava a vez inteira da história, fora de hora. Ele foi achado por uma cena que quebrava ao começar
  (L-321), e agora uma regra do `guard.js` impede o nome repetido.
- **O que a regressão achou com os mundos finais** (L-350 a L-353, L-358, L-360, L-364 a L-370). Rodando a regressão
  inteira com os mundos gerados de novo, mais treze apareceram:
  - o barraco que vira cabana ficava com a planta de barraco até o dia seguinte (L-350);
  - a semente de uma história guardava o protagonista morto (L-351);
  - quem tinha o caminho cortado no meio o refazia só até perto do fim, e parava longe de aonde ia (L-352);
  - a execução salva entre o último golpe e a conta perdia a conta: a crônica, a lealdade da cidade, o Livro do Mundo
    (L-353);
  - a obra morria aos 70 s da tarefa inteira, e não de cada ida ao armazém (L-358);
  - o lance de degraus de uma porta era medido no chão desenhado, e não no chão dos pés (L-360);
  - o calceteiro numa ilhota escolhia um trecho de rua em diagonal através da água, e tentava a cada passo (L-364);
  - a árvore que o castor roía ficava marcada no toco quando um lenhador a derrubava, e nenhum castor a pegava nunca mais
    (L-365);
  - a guerra convocava os amotinados no meio do motim, e o motim era contado como esmagado pela guarda (L-366);
  - a tripulação espantada do cais por um bicho nunca era chamada de volta, e o embarque esperava os dois primeiros da
    fila mesmo longe: a grande viagem de Públio saiu com 1 dos 26 e se perdeu (L-367);
  - a cidade que a água cortou da sua fogueira e da sua doca nunca acendia outra do lado das casas: uma criança de
    Tenochtitlan morreu de fome em casa, no caos do deus (L-368);
  - um golfinho nadava para dentro do fundo seco do mar que o deus abriu (L-369);
  - a «Grande Coalizão» contra um império podia ser os quatro povos grandes contra um povo de oito pessoas (L-370).

  As outras falhas daquela rodada eram limites das provas diante dos mundos novos — a madeira do casco que faltava para
  a viagem, a árvore da prova que o lenhador levava, a água pequena demais para ver o peixe minguar —, e estão no AUDIT
  (T-189 a T-220).

## 6. O que fica parcial, ou não foi feito

- **O tesouro do povo ainda é escrito à mão** em alguns lugares fora do livro-razão: a cunhagem, o tributo do cerco, o
  tributo da paz e outros nomeados pelo `qa/moedas.js` (T-063, aberto). **O estoque do povo** muda fora do livro em dois
  pontos da economia velha (T-120, aberto). As moedas da casa e do bolso, e tudo o que as atividades novas mexem, já
  passam pelo livro.
- **O cenário industrial ou futurista** do pedido está **bloqueado pela ontologia** do jogo: só existem os cinco povos
  antigos e dez técnicas. Os testes de universalidade usam os contrastes que existem: moeda contra troca, porto contra
  interior, aldeia contra metrópole, rio, mar e deserto, os cinco povos.
- **Os prédios sem planta** — a maravilha (o Coliseu), o teatro, o monumento, a estátua e os outros 26 tipos sem dentro —
  continuam só por fora. Por fora, no corpo encarnado, vários não são a mesma construção do Modo Deus: o Coliseu é uma
  pirâmide de caixas, a Grande Pirâmide é um cone de oito lados e os templos são um casarão. Isso é o **Patch 2**, já em
  andamento (§9).
- **A vida dentro das casas** ainda não é contada pela casa: quem dorme, quem come à mesa, quem saiu para trabalhar e por
  quê. Isso também é do Patch 2.
- **As compras da família** (L-331 e L-345, abertos). Só quem não tem ofício vai às compras, e a vontade de comprar abre
  antes de qualquer banca abrir; uma tentativa sem ninguém para vender põe a casa em meio dia de espera. Num dia da
  metrópole de antes, 104 tentativas e 19 casas que compraram. O conserto pensado muda a economia da casa, e vai com o
  Patch 2, junto das oficinas cheias (D-090).
- **Duas regras para decidir no Patch 2:** se um ato em curso (a caixa que alguém foi buscar) segura as mãos contra uma
  ida de fora, como a caverna; e se a execução espera quem leva uma compra para casa, como a festa já espera.
- **Não medido:** o desempenho numa placa de vídeo de verdade e num celular.

## 7. O fechamento: o reinício e o navegador novo

Em 28/10, com a regressão no meio, o contêiner reiniciou sozinho. Perderam-se os arquivos de trabalho: os mundos prontos
que estavam sendo gerados, os resultados da regressão e as notas. Tudo o que estava no commit estava salvo.
- **O navegador das provas mudou.** O Chromium 1194 deu lugar ao Chrome 153 (Playwright 1.63).
- **Com o mesmo código e a mesma semente, saiu outro mundo.** O mundo pronto de 100 anos tinha 994 almas e agora tem
  196. Uma prova do mar e uma da guerra também mudaram de resultado.
- **A causa (T-123).** As contas do `Math` (seno, cosseno, exponencial, logaritmo, potência…) não dão os mesmos bits de
  um motor de JavaScript para outro. O `qa/motor.js` mostra 18 de 20 funções diferentes entre o Node e o Chrome 153.
- **No mesmo navegador, o mundo continua o mesmo.** O salto de verdade em fatias, com alguém perguntando a cada 2 s, sem
  ninguém perguntar e em passos seguidos, dá o mesmo acaso e a mesma marca do mundo, em quatro versões do código.
- **Os mundos prontos vão no save, como dado.** O jogador recebe exatamente os mesmos, em qualquer navegador.
- **A regressão agora anota o navegador no resumo.** Uma troca dele aparece entre as diferenças.

As duas provas que mudaram foram olhadas uma a uma. Nenhuma era defeito do jogo; eram limites das provas:
- **O mar, caso 1 (T-124).** A prova dizia «um governante cauteloso», mas não o punha. O governante do mundo novo tem
  ambição 0,98 e funda colônia por glória, como o jogo manda. Agora a prova põe o governante cauteloso que diz.
- **A guerra, caso 7 (T-125).** A guerra do mundo novo acaba pela conquista: o povo que perde deixa de existir, e não
  há tratado. A paz agora é provocada de propósito numa prova nova (`qa/paz.js`), que confere o tratado, os soldados de
  volta e os presos trocados. Passa nas sementes 11, 7 e 13.

A semente do mundo da guerra mundial também mudou. Com o navegador novo, a 3507 não fazia mais a guerra vir sozinha. A
receita do «mundial» agora espera a guerra vir sozinha, ou até só restarem quatro povos grandes, e então o jogo a começa
enquanto ainda acha dois lados (D-091). Antes, a espera era de 80 anos fixos, e com as cidades crescendo mais (os
construtores soltos, L-322) um império engolia os outros nesse tempo. Com o código final, a 3510, a primeira semente da
lista, fez a guerra vir sozinha no ano 47: a Guerra da Fome.

## 8. Desempenho medido

‹preencher com a prova de desempenho (sozinha na máquina) e a do Modo Encarnado›

## 9. O próximo passo: o Patch 2 («Living Buildings»)

O Patch 2 já começou, com quatro especialistas:
- **P1, a vida nas casas:** a família de verdade dentro de casa, a ausência com causa, dormir na cama, comer à mesa.
- **P2, o trabalho e os serviços:** a olaria de ponta a ponta, com o tijolo que a obra consome; a taverna com dono,
  atendente e freguês; as termas.
- **P3, a mesma construção nas duas vistas:** o Coliseu, as pirâmides, a Acrópole, os templos de cada povo, com uma
  definição só da forma e uma prova que mede as duas vistas.
- **P4, o espaço:** portas, escadas e porões validados, o corpo dentro dos prédios e a matriz de cobertura de todas as
  categorias de prédio.

O pedido está em `qa/patch2/PEDIDO.md` e a carta da equipe, em `qa/patch2/ESTUDIO.md`.
