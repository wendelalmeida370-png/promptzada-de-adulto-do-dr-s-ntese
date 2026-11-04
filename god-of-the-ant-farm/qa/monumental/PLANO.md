# Arquitetura Monumental — o plano de execução

> Em uma frase: cada prédio passa a ter um **tamanho escolhido pela cidade que o constrói** — um degrau de uma escada de
> tamanhos por tipo, conforme a gente, a riqueza, a técnica e a terra que ela tem —, e a forma, a planta, o 3D e o desenho do
> deus saem **desse mesmo tamanho**. O santuário da aldeia continua pequeno; o Coliseu da capital passa a ter 48 m e uma arena
> de verdade. O diagnóstico está em `DIAGNOSTICO.md`; o pedido, em `PEDIDO.md`.

## 0. A ordem dos patches e as três decisões

**Primeiro a Arquitetura Monumental, depois os Bairros Vivos** (D-105). O tamanho dos prédios muda o desenho das cidades, os
bairros, os muros, a lotação da taverna e de onde saem a fumaça, as luzes e os sons — tudo o que os Bairros Vivos leem. Feito
nesta ordem, o bairro nasce sobre a arquitetura final, e os mundos prontos se refazem uma vez por mudança grande, não duas. Os
dois defeitos que o fechamento do Patch 2 deixou para «o próximo» vêm para este, porque são de arquitetura: **o teatro grego**
(L-494) e **os portões que não deixam passar** (L-491: prédios maiores encostam mais nos muros).

As três perguntas do fechamento do Patch 2, que o dono deixou para o líder decidir «o que for mais legal para o jogo»:
- **D-102 — a taverna e o teatro das cidades pequenas**: o teto dos ofícios (D-090) guarda uma pessoa para cada serviço
  aberto (a taverna, o teatro, o cais com carga) **quando a comida da cidade está garantida** (o celeiro com reserva); com
  fome, a comida vem antes. Uma taverna grande sem taverneiro seria um monumento vazio.
- **D-103 — a ronda da noite fica no posto**: o vigia em ronda não larga a vigia para ir à assembleia do palácio; a
  assembleia chama quem está de folga. A ronda é o que segura o ladrão e o contrabandista (L-405).
- **D-104 — sentar à própria mesa sem fome**: na própria casa, o E oferece **sentar** sempre, e **comer** quando há o que
  comer. Sentar à mesa é estar em casa, não só matar a fome.

## 1. A arquitetura da solução (o contrato — decidido pelo líder antes de distribuir)

1. **A escala — `G.Escala`** (`js/escala.js`, novo, pequeno e puro). Para cada tipo, uma **escada de degraus**: `{ id, nome,
   n (o lado do lote em casas de 4 m), req (o que a cidade precisa ter: nível, gente, a técnica do povo, pedra), custo e obra
   (multiplicadores) }`. Perguntas: `Es.choose(set, type)` — os degraus que a cidade justifica e pode pagar, do maior para o
   menor; `Es.of(b)` — o degrau de um prédio; `Es.bill(type, esc)` — o custo e o trabalho. Não escreve no mundo e não sorteia:
   a mesma cidade escolhe o mesmo degrau.
2. **O prédio guarda o seu degrau**: `b.esc` e o lote `b.w = b.h = n`. Só o `village.js` escreve (na fundação e na
   ampliação; uma regra nova do `guard.js`). O save leva o prédio inteiro: nada novo no save. Um prédio de antes, sem `b.esc`,
   é do degrau do tamanho que tem — **nada se refaz ao carregar** (pedido 13).
3. **O planejador experimenta os degraus**: `V.findSite(set, type, reach, n)` procura o lote do tamanho do degrau; a cidade
   tenta o maior que justifica e, sem terra para ele, o seguinte. A capital apertada ergue um templo menor que o da capital
   folgada: a escala sai do mundo, não de uma tabela.
4. **A forma sabe o tamanho**: `G.Forma.of(type, style, n)`. As formas de hoje são o degrau do tamanho clássico de cada tipo
   (o santuário de 2 casas, a taverna de 2) e ficam como estão — as mesmas plantas, os mesmos desenhos, os mesmos saves.
   Os degraus novos são geradores novos, em arquivos próprios (`js/forma-espetaculo.js`, `js/forma-poder.js`), registrados por
   `Fo.def`. Todos puros como o `forma.js` (a regra 36 vale para eles).
5. **Uma definição para as duas vistas**: um degrau novo é desenhado pelo deus **a partir da própria forma**
   (`Arch.formSprite`, um pintor das peças da forma na projeção do deus), não por um desenho à mão; o 3D a constrói
   (`formInto`), e a planta a lê. O que o deus vê, o corpo pisa.
6. **A planta lê a forma no tamanho do prédio**: o lote da planta já é `b.w × 4`; os monumentos pedem `Fo.of(t, c, b.w)`.
7. **A ampliação**: uma cidade que cresceu pode ampliar o seu monumento no lugar — o mesmo prédio, o mesmo nome, a mesma
   história, um fato novo no registro («ampliado no ano 34») — quando há terra livre em volta e pedra para a obra. É assim que
   um mundo de antes ganha monumentos grandes sem que nada seja refeito à força, e que os prédios têm «reformas e ampliações
   ao longo do tempo» (pedido 4).
8. **As regras do corpo valem em qualquer tamanho** (`In.BODY`, D-088): degrau de até 0,30 m (uma escadaria grande tem os
   degraus que a altura pede), porta de pelo menos 2,2 m nos prédios públicos (o portal monumental de 4 a 8 m com a porta de
   gente dentro dele), parapeito de 0,9 m onde a queda passa de 1 m, assentos de 0,40–0,45 m, colunas com passagem de 1 m.
   Crescer o prédio nunca cresce o degrau.

## 2. A escada de tamanhos (a primeira proposta — os números finais saem das medidas)

| Tipo | Degraus (lado do lote) | Quem justifica o maior |
|---|---|---|
| Maravilha (o Coliseu, a Grande Pirâmide, o Templo Mayor, o salão nórdico…) | **maravilha 12 casas (48 m)** · colossal 16 (64 m); os de 3 casas, só os que já existem | a capital de um povo grande |
| Teatro (e o anfiteatro romano) | teatro 6 (24 m) · grande teatro 9 (36 m) · monumental 12 (48 m) | a cidade grande com escrita |
| Palácio · Grande Palácio · Palácio Colossal | 6 (24 m) · 9 (36 m) · 12 (48 m) | a sede do governo, pelo tamanho do reino |
| Casa do Chefe | 2 (8 m) · 3 (12 m) | a vila que já governa outras |
| Templo | santuário 2 (8 m) · templo 4 (16 m) · grande templo 6 (24 m) · santuário monumental 9 (36 m) | a cidade sagrada, a capital |
| Taverna | taberna 2 (8 m) · taverna 3 (12 m) · hospedaria 4 (16 m, dois pisos e pátio) | o porto, o mercado, a capital |
| Casa | a casa de 1 (4 m) continua; a **casa rica** (domus) 2 (8 m, com átrio) para a família rica | a riqueza da família |
| Banhos, biblioteca, mercado, administração, quartel, monumento | o de hoje (2) · o grande (4 a 8) | conforme o tipo — se o tempo couber (pedido 7.7), senão dito no relatório |

O custo e o tempo da obra crescem com o volume: um monumento é um feito de anos da cidade, não um enfeite.

## 3. As etapas (o pedido 15) e o que cada uma entrega

- **Etapa 1 — Diagnóstico**: feito (`DIAGNOSTICO.md`).
- **Etapa 2 — Fundação de escala** (o líder): `G.Escala`, `b.esc`, o planejador com o tamanho, `Fo.of(type, style, n)` e os
  40 lugares que pedem a forma passando `b.w`, as regras novas do `guard.js`, as invariantes, a ferramenta do modo
  desenvolvedor para fundar um prédio de um degrau escolhido, e o esqueleto das provas. Sem mudar nada que se veja.
- **A fatia vertical — o Coliseu de ponta a ponta**, antes de espalhar: o degrau, a forma (arcadas em vários andares, arena
  oval, arquibancadas, entradas e escadas para cada nível, o subsolo), o desenho do deus pela forma, a planta (a arena que se
  anda, os assentos, os corredores), o 3D, a cidade que o ergue, a prova A e as fotos em terceira pessoa. Só depois de ela
  passar o resto se espalha — o pedido «validar a qualidade antes de expandir».
- **Etapas 3 e 4 — fora e dentro**: os degraus grandes de cada tipo prioritário, forma e planta juntas (o mesmo especialista
  faz as duas: a planta lê a forma).
- **Etapa 5 — navegação**: o corpo e as pessoas do mundo entrando, subindo, sentando; a câmera nos espaços grandes.
- **Etapa 6 — simulação**: a escolha do degrau, o terreno, o custo, a ampliação, a lotação chamando gente para encher os
  prédios grandes (a plateia, os fiéis, a freguesia, a audiência do palácio), D-102 e D-103.
- **Etapa 7 — desempenho**: o 3D (instâncias, a silhueta de longe, os pedaços do mapa), o custo das plantas grandes, o desenho
  do deus.
- **Etapa 8 — validação**: as provas A a I, a regressão completa, os mundos prontos de novo, as fotos, o relatório.

## 4. Os agentes (cinco, e por quê)

O trabalho se divide em domínios que mexem em arquivos diferentes, depois do contrato. Cinco especialistas, cada um dono dos
seus arquivos, trabalhando em paralelo na sua cópia do projeto (worktree), e o líder integrando aos poucos:

| Quem | O domínio | Os arquivos |
|---|---|---|
| **M1 — espetáculo e maravilhas** | o Coliseu e os anfiteatros, os teatros, as pirâmides egípcia e asteca, as maravilhas dos outros povos, os monumentos; forma **e** planta; o teatro grego (L-494) | `js/forma-espetaculo.js` (novo), `js/int-monumentos.js`, `qa/monumentos.js`, as provas A, C, E |
| **M2 — poder, fé e convívio** | os palácios e a casa do chefe, os templos (do santuário ao santuário monumental), a taverna e a hospedaria, a casa rica; forma **e** planta | `js/forma-poder.js` (novo), `js/int-palacio.js`, `js/int-civicos.js`, `js/int-familias.js`, as provas B, D, F, G |
| **V — a visão do deus** | o pintor das peças da forma na projeção do deus; a ordem de desenho dos prédios grandes; a fidelidade | `js/arch.js`, `js/render.js`, `qa/visual/fidelidade.js` |
| **C — a cidade e a simulação** | a escolha do degrau, o terreno, o custo, a ampliação, a lotação nas atividades, D-102, D-103, os portões (L-491) | `js/village.js` (além do contrato), `js/urban.js`, `js/economy.js`, `js/court.js`, `js/siege.js`, as atividades que chamam gente, `qa/escala.js` |
| **E — o 3D, o corpo e a câmera** | o 3D dos prédios grandes, a câmera nos espaços grandes, o corpo nas escadarias, D-104, o desempenho, as fotos | `js/build3d.js`, `js/realm3d.js`, `js/cam3d.js`, `js/avatar.js`, `js/interact.js`, `qa/visual/monumental.js` |

**Por que cinco e não menos:** a forma e a planta de um tipo andam juntas (um só dono por família de prédios, para não haver
ida e volta), mas as famílias são muitas — 6 povos × os tipos prioritários —, e dividi-las em duas (o espetáculo e o poder)
corta o tempo pela metade sem dois mexerem no mesmo arquivo. O desenho do deus, a cidade e o 3D são domínios inteiros e
independentes. **Por que não mais:** a câmera, o corpo e o desempenho do 3D são do mesmo arquivo e do mesmo especialista; os
testes ficam com quem faz cada parte, e o líder junta.

**Economia de tokens:** cada especialista recebe um briefing fechado — o contrato (este plano), os seus arquivos, as regras
do projeto que o tocam, as provas que precisa passar — e não lê o repositório inteiro. As decisões de arquitetura ficam com o
líder (uma pergunta ao líder em vez de uma investigação paralela). O líder junta os ramos em blocos, cada bloco com a vigia
do código e a vida curta, e roda a regressão completa uma vez, no fim, com os mundos prontos refeitos uma vez.

## 5. O que roda em paralelo e o que espera

- O contrato (Etapa 2) vem antes de tudo — é ele que deixa os cinco trabalharem sem se pisar.
- Depois dele, os cinco começam juntos. A primeira entrega de cada um é a sua parte do **Coliseu** (M1 a forma e a planta;
  V o pintor das peças que o Coliseu usa; C o degrau, o terreno e a obra; E o 3D, a câmera e as fotos; M2 começa pelos
  palácios, que não dependem do Coliseu).
- O líder junta a fatia vertical, olha as fotos, mede o desempenho — e só então cada um espalha para os outros tipos.
- V depende das formas para pintá-las, mas começa pelas peças que já existem (o tambor de arcos, a cávea, a pirâmide, o bloco),
  conferindo o pintor contra as formas de hoje.

## 6. Como evitar conflito

- Um arquivo, um dono (a tabela acima). As formas novas em arquivos novos; o `forma.js` só recebe do líder o `Fo.of(n)` e o
  `Fo.def` público.
- O `village.js`: o líder põe o contrato antes; depois é do C.
- As provas: cada especialista escreve as suas; o `qa/regress.sh`, o `qa/README.md`, o `AUDIT.md` e o `CLAUDE.md` são do líder
  (cada especialista entrega o seu bloco de texto).

## 7. Os testes de aceitação (o pedido 16) como provas

| Teste | A prova | O que mede |
|---|---|---|
| **A — Coliseu** | `qa/monumental.js` A e `qa/visual/monumental.js` | lote ≥ 48 m; altura ≥ 20 m; ≥ 3 andares de arcadas; arena ≥ 20 × 12 m; ≥ 600 assentos; de cada entrada se chega a cada assento e à arena; a planta, a forma e o desenho do deus do mesmo tamanho; as fotos de fora e de dentro |
| **B — Palácio** | `monumental.js` B | a área do palácio imperial ≥ 30 vezes a da casa; salão do trono ≥ 16 × 10 m e ≥ 10 m de pé-direito; ≥ 2 pátios; escadaria; lugares para guardas, funcionários e visitantes |
| **C — Pirâmides** | `monumental.js` C | a egípcia lisa com 50–54° e ≥ 40 m de base; a asteca em ≥ 4 terraços, com a escadaria e os dois santuários; as massas das duas diferentes |
| **D — Templo** | `monumental.js` D | o santuário monumental com ≥ 9 vezes a área do santuário da aldeia; a nave ≥ 10 × 16 m e ≥ 8 m de altura; ≥ 40 lugares de rezar |
| **E — Teatro** | `monumental.js` E | palco ≥ 12 m; ≥ 300 assentos em vários níveis; bastidores; corredores |
| **F — Taverna** | `monumental.js` F | a hospedaria com salão ≥ 10 × 8 m, ≥ 8 mesas, cozinha, depósito, balcão; ≥ 20 fregueses sentados ao mesmo tempo |
| **G — Casas** | `monumental.js` G | a cabana e a casa continuam de 4 × 4 m; a casa rica tem ≥ 8 × 8 m |
| **H — Culturas** | `monumental.js` H | cada tipo grande em pelo menos três povos, com formas diferentes |
| **I — Experiência** | `qa/visual/monumental.js` e o `encarna` | o corpo entra pela porta, anda, sobe, senta; a câmera com folga (a distância livre) dentro dos espaços grandes; o topo da fachada no quadro olhando para cima; as fotos no relatório |

E, como em toda feature (o protocolo):
- **invariantes** (`QA.check`): o lote, a forma e a planta do mesmo tamanho (S1); o degrau é um da escada do tipo (S2); a
  lotação da planta não abaixo do mínimo do degrau (S3);
- **o cenário** (`qa/escala.js`): a aldeia escolhe o pequeno e a capital o grande; sem terra, o degrau de baixo; o save no meio
  da obra; o deus derruba no meio; a cidade que encolhe; a ampliação com o mesmo prédio, a mesma história e os mesmos
  moradores; um save de antes carregando igual; a mesma semente, o mesmo mundo;
- **regras novas do `guard.js`**: o degrau e o lote só o `village.js` escreve; as formas novas são puras; o deus desenha um
  degrau novo só pela forma.

## 8. O desempenho (o pedido 11)

- O quadro do Modo Encarnado na metrópole (a medida do e8): hoje 10,9 ms na mediana — **no máximo 13 ms** com um monumento à
  vista.
- Uma planta de 48 m feita em Node: medida e com teto (alvo: 400 ms na primeira vez; depois, do cache).
- O 3D: as peças repetidas (arcos, assentos, colunas) em instâncias; de longe, a silhueta das massas (`Fo.mass`), no mesmo
  tamanho.
- O desenho do deus: o «sprite» do prédio grande feito uma vez e guardado, como os de hoje.

## 9. O que fica de fora (dito agora, para não fingir)

- Lotes retangulares: o lote continua quadrado (um anfiteatro oval, um templo comprido ou um palácio de alas cabem num lote
  quadrado com praça, pátio ou recinto sagrado em volta).
- Os 56 tipos não ganham todos um degrau grande neste patch: os prioritários (pedido 7.1–7.6 e as casas) entram inteiros; os
  outros (7.7) entram se o tempo couber, e a matriz por prédio diz quais.
- Cobertura retrátil do Coliseu (o velário): entra se a forma couber no orçamento de triângulos.
