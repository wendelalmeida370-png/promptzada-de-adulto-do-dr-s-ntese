# Os interiores 3 — o contrato das fundações (a Fase 0 e a Fase 1)

O plano para o dono está em [`interiores-3.md`](interiores-3.md) (aprovado em 24/11/2026). Este é o contrato da equipe para as
fundações: as frentes, quem é dono de cada arquivo, as portas novas, os números reservados, as provas e como se junta. A Fase 2 (os
prédios grandes) e as ondas A a I terão cada uma o seu contrato, no mesmo molde.

**Leia antes de começar:** o `CLAUDE.md` da raiz inteiro (o protocolo e as fundações valem para cada linha); o plano, §4 (o padrão da
taverna), §5 (a casa pronta para o ofício), §6 (as fundações) e §12 (o apêndice técnico, com os arquivos e as linhas); e o levantamento
da sua parte, em `planos/levantamentos/`: o **A** (o inventário dos 56 tipos, as notas e as medidas de hoje), o **B** (o que cada ofício
pede a cada prédio — a lista dos postos), o **C** (o padrão da taverna como receita: §3 as fundações em detalhe, §4 os riscos) e o
**D** (as referências históricas de cada prédio e povo). As sondas que mediram o A estão em `qa/sonda/` (só leem o jogo).

**O padrão** (o dono, 24/11/2026): «a taverna atualmente é nota 10, mas ela em breve vai ser nota 7 — eu quero que ela seja o mínimo».
As fundações não mudam o que se vê (a Fase 0) ou mudam o mundo uma vez só (a Fase 1); o que elas dão é a ferramenta para cada prédio
chegar acima da taverna. **A taverna sai igual** de toda mudança no motor, e o mundo sem o corpo é o mesmo, a não ser onde a frente diz
que muda e prova por quê.

**E o lembrete do dono** (24/11/2026): «sempre a regra do nada vem do nada, e tudo com muita qualidade, dando suporte e infraestrutura
para os próximos ofícios». Toda coisa que uma fundação mostra, gasta ou faz vem de uma fonte de verdade do povo, pelo livro (um material
sem fonte no mundo é um erro, não um detalhe — D-440); e cada porta nova é feita para os ofícios que vêm plugarem a jogabilidade sem
mexer no arquivo de outro.

## 1. As frentes

| Fase | Frente | O que entrega |
|---|---|---|
| 0 | **K — o motor da planta** | F13 a versão da planta por tipo (o catálogo refeito só do tipo que mudou); F1 o kit da taverna no motor (o corredor, as zonas, os grupos de mesa, as reservas, as escolhas pelo id) com a taverna igual byte a byte; F6 a riqueza de agora para qualquer tipo (`In.wealthRule`) |
| 0 | **O — os postos de ofício e a prova padrão** | D-971: a porta pura dos postos de ofício de cada prédio, a lista do B por tipo e degrau, a prova que cobra a lista e o verificador (cada posto alcançado a pé da porta, o assento sobre a peça); F16 a prova padrão por tipo (`qa/padrao.js`); as sondas do antes (as medidas e as fotos de cada tipo, para o dono ver o antes e o depois de cada onda) |
| 0 | **L — a decoração em módulos e a luz de cada povo** | F7 o `within` e o desenho de dentro por uso (`G.Atmos.withinRule`, `G.Dentro3D.builder`), as leituras de verdade (o que a peça guarda pelo livro, as ferramentas pelo kit, o desgaste pelos anos), o defeito do `cloth()`; a luz de cada povo (o ocote e o braseiro do asteca, o óleo de peixe na pedra-sabão do nórdico, o sal no óleo do egípcio, a lanterna de chifre do romano…), com a causa |
| 0 | **X — as bibliotecas de modelos em pacotes** | F8 a biblioteca dos móveis e a da decoração em pacotes por família, carregados quando são precisos (como o `G.Ground3D.hiWant`), com os números em 16 bits e as partes de um modelo numa malha; o espaço para as ondas crescerem |
| 0 | **M — a barra do lugar e o tempo que se demora** | F14 a barra do lugar para qualquer prédio (a «Mesa» da taverna vira um caso), e o «responder do lugar» em todo prédio; F15 o `G.linger` aberto a outras causas (a audiência, o banquete, o rito) |
| 1 | **Q — o mundo pela porta** | F5 a entrada e a saída pela porta em todo afazer (ninguém mais aparece dentro); F4 a porta de dentro que abre para quem passa; o degrau da porta (D-737) |
| 1 | **S — o assento e a esteira** (depois da K) | F2 o assento de verdade em todo lugar sentado (ninguém sentado no ar); F3 a esteira, a palha e a eira que se pisam |
| 1 | **V — as fibras** | D-979: o linho do egípcio e o algodão do asteca como lavouras do mundo, a tecelagem com eles, a roupa, a vela e o pano da casa pelo material que o povo tem |

**A ordem de juntar** (o supervisor): K → O → L → X → M; depois Q → S → V. Os mundos prontos são gerados de novo **uma vez**, pelo
supervisor, depois das frentes da Fase 1, com uma só medida da economia e da sociedade.

## 2. Quem é dono de cada arquivo

Cada frente só muda os seus arquivos (e, num arquivo dividido, só a parte dita). **Um arquivo de outra frente, só pelo supervisor**:
peça no relatório o que precisa.

| Frente | Arquivos |
|---|---|
| K | `js/interiors.js` (o `KIT`, o `In.VERSION` e a versão por tipo, o `planKey`, o `In.addProbed`, o `In.migrate`, o gancho do save, o `In.tavernStep` e a riqueza — **não** o `fillOf`, o repartidor de lugares, o `doorState`, o `passage`, as células nem o `USE_ST`), `js/int-trabalho.js`, `js/int-catalogo.js` (gerado), `qa/catalogo.js`, `qa/taverna-padrao.js`, `qa/plantas.js`, `qa/motor-plantas.js` |
| O | `js/int-postos.js` (novo), `qa/postos*.js` (novos), `qa/padrao.js` (novo), `qa/sonda/` e `qa/visual/sonda-fotos.js` (novo), e nas provas `qa/olho-dentro.js`, `qa/dentro-gente.js` e `qa/visual/moveis.js` só o que abre as listas da taverna a outros tipos |
| L | `js/atmos.js` (o `within`; **não** o `dress`, que é da V), `js/dentro3d.js` (tudo, menos o carregador das malhas da decoração, que é da X), `js/luz3d.js`, `js/fx3d.js` (só as chamas de dentro), no `js/interiors.js` só o `fillOf`, as linhas novas da `TABLE` do `arte/blender/deco.py` (os modelos novos da luz), `qa/dentro*.js`, `qa/luz*.js` |
| X | `arte/blender/moveis.py` e `arte/blender/deco.py` (o que escreve os arquivos; **não** as linhas da `TABLE`), `js/movelmesh*.js` e `js/decomesh*.js` (gerados), `js/movel3d.js`, no `js/dentro3d.js` só o carregador das malhas, `qa/visual/malhas.js`, `qa/visual/moveis.js` (o carregar dos pacotes) |
| M | `js/acoes-ui.js`, `js/interact.js` (o `I.here`, o `I.best` e o provedor `pessoa`), `js/soc-verbos.js` (o responder do lugar), no `js/world.js` só o `G.linger`, `qa/acoes.js`, `qa/visual/acoes-fotos.js`, `qa/dia.js` (a parte c) |
| Q | `js/villagers.js` (o `enter`, o `leave`, o `WALK_OUT`), os lugares que põem alguém dentro à mão (`js/act-lazer.js`, `js/act-servicos.js`, `js/act-oficio.js`, `js/court.js`, `js/crime.js`, `js/economy.js`, `js/city.js`, `js/war.js`, `js/taverna-contexto.js`: só essas linhas e o que a porta pedir), no `js/interiors.js` só o `doorState`, o `passage`, o `doorRule` e a entrada (`pathIn`), no `js/build3d.js` só as folhas das portas, no `js/people3d.js` só o caminho pelas portas de dentro, no `js/space.js` só o degrau da porta (D-737) |
| S | no `js/interiors.js` as células, o `USE_ST`, o `PASS` / `NEAR` / `openCode`, o `lieRects`, o `In.walk` e o validador; `js/int-moveis.js`, `js/int-familias.js` e as receitas que põem um lugar sentado; `js/avatar.js` (o pé sobre a esteira); `qa/interiores-inv.js`; `qa/casa-dentro.js`; o catálogo dos tipos que mudar |
| V | `js/economy.js` (a lavoura e a tecelagem), `js/estates.js` (os campos), `js/origem.js` e o `ORIGEM.md`, `js/itens.js` (se a roupa ganhar o material), no `js/atmos.js` só o `dress`, `js/look3d.js` (a cor do pano), `qa/origem*.js`, `qa/roupa.js` |

**Os de todos** (o supervisor junta): o `qa/AUDIT.md` (cada frente escreve **só na sua subseção** da seção 24), o `qa/guard.js` (cada
frente acrescenta regras **com os seus números**, no fim do arquivo; muda uma regra antiga só a que é da sua parte, dizendo qual), o
`index.html` (a frente põe a linha do seu arquivo novo), o `CLAUDE.md` (**ninguém mexe**: cada frente escreve no relatório as linhas que
propõe, e o supervisor as põe). Um arquivo que nenhuma linha acima dá a ninguém, só pelo supervisor.

## 3. As portas novas

- **A versão por tipo** (K): `In.VERSION_T[tipo]` (o número da gramática de cada tipo); `In.versionOf(tipo)`. A chave da planta, o
  catálogo, o save (`intG`) e a migração passam a ler a versão do tipo. Uma última subida global migra os saves de antes.
- **O kit** (K): `P.zones` (com o corredor, `aisle`), `P.groups` (os grupos de mesa, o assento sobre a peça), as reservas (`alt`) e os
  eixos (`frame`, `axes`) no `KIT` do `interiors.js`, documentados no próprio kit; a taverna os usa como qualquer receita.
- **A riqueza** (K): `In.wealthRule(uso, fn)` → o degrau de riqueza de agora de um tipo, que o registro guarda (`rec.q`) e só o
  `interiors.js` escreve, na virada do dia (a regra 273 vale para todos).
- **Os postos** (O): `In.postos(b)` → `[{ id, papel, oficio, faz, lv, x, z, room, item, senta }]`, puro, da planta (as peças, os
  cômodos, as marcas); um tipo acrescenta os seus por `In.postoRule(tipo, fn)`. A lista do que cada prédio precisa ter é dado das
  provas (`qa/postos-lista.js`), tirada do levantamento B.
- **A prova padrão** (O): `node qa/padrao.js <tipo>` → cada critério do padrão (o plano, §4.3) com passou ou não e o número; a taverna
  passa em todos.
- **A decoração por uso** (L): `G.Atmos.withinRule(uso, fn)` e `G.Dentro3D.builder(uso, fn)`; o `within(b)` de hoje é a soma das
  regras registradas, e sai igual para a taverna e a casa.
- **A luz de cada povo** (L): a lamparina, a tocha e o braseiro de cada povo, com o combustível que o povo tem, pelo `G.Atmos` e pelo
  `G.Luz3D.LAMPS`; nunca um material que o povo não teve.
- **Os pacotes** (X): `G.Movel3D.want(familia)` e o pacote que chega em segundo plano (até chegar, o `FURN` de hoje desenha); o mesmo
  para a decoração; nenhum pacote pelo `index.html`.
- **A barra do lugar** (M): `G.AcoesUI.bar(provedor, ordem)`; a «Mesa» da taverna é uma barra registrada, igual à de hoje.
- **A demora** (M): o `G.linger` com as causas de qualquer módulo que a regra nova deixar, sempre puras e só com o corpo.
- **A porta** (Q): ninguém escreve `v.inside` à mão fora das portas (uma regra do guard); a porta de dentro tem estado (`In.doorState`
  para toda porta da planta).
- **O assento** (S): todo lugar sentado sobre uma peça de sentar (a regra 271 para todos).
- **As fibras** (V): os bens novos (o linho, o algodão), as suas fontes e o pano pelas suas partes (`G.Origem`).

## 4. Os números reservados

Cada frente usa **só os seus números**, para os ramos juntarem sem trombar.

| Frente | Regras do `guard.js` | Decisões | Defeitos | Limites de prova |
|---|---|---|---|---|
| supervisor | — | D-980 a D-989 | — | — |
| K | 480 a 489 | D-990 a D-999 | L-2230 a L-2239 | T-2130 a T-2139 |
| O | 490 a 499 | D-1000 a D-1009 | L-2240 a L-2249 | T-2140 a T-2149 |
| L | 500 a 509 | D-1010 a D-1019 | L-2250 a L-2259 | T-2150 a T-2159 |
| X | 510 a 519 | D-1020 a D-1029 | L-2260 a L-2269 | T-2160 a T-2169 |
| M | 520 a 529 | D-1030 a D-1039 | L-2270 a L-2279 | T-2170 a T-2179 |
| Q | 530 a 539 | D-1040 a D-1049 | L-2280 a L-2289 | T-2180 a T-2189 |
| S | 540 a 549 | D-1050 a D-1059 | L-2290 a L-2299 | T-2190 a T-2199 |
| V | 550 a 559 | D-1060 a D-1069 | L-2300 a L-2309 | T-2200 a T-2209 |
| B (a bolsa do corpo, o pedido do dono de 25/11) | 650 a 659 | D-1160 a D-1169 | L-2400 a L-2409 | T-2300 a T-2309 |
| W (a moeda de cada povo, do material certo; Fase 1) | 660 a 669 | D-1170 a D-1179 | L-2410 a L-2419 | T-2310 a T-2319 |

A subseção de cada frente no `qa/AUDIT.md`: `### I-2 — K (o motor da planta)`, e assim por diante, no fim da seção 24.

## 5. O protocolo de cada frente

1. **O ramo.** Comece trazendo o seu ramo ao ponto do supervisor (`git merge --ff-only ccr-2992e811-765u63`). Trabalhe em commits
   pequenos, com as linhas de autoria do projeto; **nunca faça push** nem junte com outro ramo. No fim, o relatório: o que fez, os
   números, o que não deu, o que precisa de outra frente, **as linhas que propõe para o `CLAUDE.md`** e as fotos (se houver).
2. **Antes de cada commit:** `node qa/guard.js` e a vida curta `node qa/soak.js 103 continente 128 4 normal 5 1 1`, e as provas
   rápidas da sua parte (as do `CLAUDE.md` para os arquivos que mexeu, e as do §6).
3. **D-666:** nada de regressão completa nem de prova longa «por garantia»; as longas, só as que a sua mudança pede, uma de cada vez,
   com `nice -n 10`. A máquina é dividida (4 núcleos, sem placa de vídeo): o navegador **só pela fila** (`bash qa/navegador.sh …`).
4. **Toda coisa nova com o seu verificador e o seu cenário** (o protocolo do `CLAUDE.md`), com os casos ruins: o save no meio, a pessoa
   que morre no meio, a mão do deus, o prédio que cai; uma regra no guard onde a regra se lê no código.
5. **Todo defeito achado** é uma entrada na sua subseção do `qa/AUDIT.md`, com a causa e a correção; **reproduza antes de consertar**, e
   mostre que a prova que falhava passa. Corrija a causa, não o sintoma: nada de `try/catch` que esconde, de prova pulada, de invariante
   afrouxada.
6. **O que só se vê só se vê:** nenhum arquivo de desenho escreve no mundo nem tira do acaso do mundo; as escolhas pelo `G.hash` do id,
   nunca sorteio (a regra magna, D-651); nenhuma memória do desenho depende de quando ele olhou.
7. **A taverna sai igual** de toda mudança no motor: a `qa/taverna-padrao.js` e, onde a frente mexe na planta, a comparação das plantas
   de todas as tavernas dos mundos prontos antes e depois.
8. **A Fase 1 muda o mundo:** a frente diz o que muda e por quê, e prova o resto igual (o `qa/det3.js`, a parte do `qa/invariancia.sh`
   que cobre a sua mudança); **não gere os mundos prontos** — é do supervisor, uma vez, depois de juntar as três.

## 6. As provas de cada frente (além das do `CLAUDE.md` para os arquivos que mexeu)

- **K:** `qa/taverna-padrao.js`, `qa/plantas.js`, `node qa/catalogo.js confere 30`, `qa/motor-plantas.js`, `qa/lugares.js`,
  `qa/interiores.js`, `qa/oldsave.js` com o `qa/oldsave_7.json`, `qa/corrupt.js`; **novo:** subir a versão de um tipo refaz só as
  plantas e o catálogo dele (os outros iguais byte a byte); a taverna igual; o save de antes abre.
- **O:** `qa/postos.js` (a lista do B por tipo e degrau: o que há e o que falta — a lista de trabalho de cada onda; a taverna sem falta
  nenhuma), o verificador dos postos no `qa/junta-inv.js`, `qa/padrao.js taverna` (passa em tudo) e `qa/padrao.js` dos outros tipos
  (as notas de hoje, a linha de base de cada onda), as fotos da sonda de dois tipos pela fila.
- **L:** `qa/dentro.js` (sem o d9), `ONLY=l1,l2,l3 node qa/luz.js`, `qa/visual/interior3d.js`, `qa/visual/malhas.js`, `qa/atmosfera.js`;
  **novo:** o `within` de antes igual para a taverna e para a casa, a luz de cada povo com o seu combustível, nenhum tapete sem causa.
- **X:** `qa/visual/malhas.js`, `qa/visual/moveis.js`, `qa/visual/interior3d.js`, `qa/dentro.js` (d1 a d4), `ONLY=e11 node qa/encarna.js`;
  **novo:** cada modelo com os mesmos triângulos e a mesma caixa de antes (na tolerância dos 16 bits), cada pacote no seu orçamento, o
  desenho sem pacote cai nas caixas de hoje e se refaz quando o pacote chega.
- **M:** `qa/acoes.js` (a1, a2), `ONLY=c node qa/dia.js`, `ONLY=n2 node qa/noite-mesa.js`, `bash qa/navegador.sh node
  qa/visual/acoes-fotos.js PASTA`; **novo:** uma barra de um prédio que não é a taverna, de ponta a ponta, e uma causa de demora nova
  (com o corpo, só ele; sem o corpo, o mundo igual).
- **Q:** `qa/porta-dentro.js`, `qa/taverna-vida.js`, `ONLY=d1,d3 node qa/dentro-gente.js`, `qa/visual/porta.js`, `qa/portas-casos.js`,
  `ONLY=a node qa/freguesia.js`, `ONLY=a,h node qa/praca.js`, `qa/ladrao-bairro.js`, `qa/det3.js`; **novo:** ninguém aparece dentro
  (cada entrada pela porta, em todo afazer que põe alguém dentro), a porta de dentro abre para quem passa e fecha depois, o preso entra
  pela porta da cela.
- **S:** `qa/plantas.js`, `qa/interiores.js` e `qa/interiores-inv.js`, `qa/lugares.js`, `node qa/casa-dentro.js 2` (21 min) só se mexer
  na gramática das casas, `qa/visual/corpo-casa.js`, `qa/visual/soleira.js`, `ONLY=m1,m3,m4,m6,m9 node qa/movimento.js`; **novo:**
  ninguém sentado no ar (o verificador), a esteira que se pisa, o catálogo refeito só dos tipos que mudaram.
- **V:** `qa/origem.js` (as partes rápidas), `qa/roupa.js`, `qa/inventario.js`, e três dos mundos de 40 anos do `qa/oficio-eco.js`;
  **novo:** o egípcio veste linho, o asteca algodão, o povo sem a lavoura não tem o pano dela, a vela do navio do pano que o povo tem.
