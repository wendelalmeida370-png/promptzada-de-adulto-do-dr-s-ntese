# Arquitetura Monumental — Etapa 1: o diagnóstico da escala

> Medido em 4/11/2026, no código do fechamento do Patch 2 (`9f9f316`) e nos mundos prontos da geração 13 (metrópole,
> megalópole, guerra mundial, mil anos). As sondas estão no scratchpad do líder (`sondas/bdef.js`, `sondas/mon/medir.js`,
> `sondas/mon/cidades.js`); os números abaixo saíram delas, não de estimativa.

## Em uma frase

Os prédios do jogo foram desenhados na **escala do ícone da visão do deus** — cada tipo ocupa de 1 a 5 casas do mapa, e cada
casa tem 4 m —, mas as pessoas, as portas, os móveis e os degraus estão em **escala real**. Por isso uma pessoa de 1,75 m diante
do «Coliseu» está diante de um prédio de 11,6 m com uma arena de 4 m. Não é a textura nem o modelo 3D: é a **pegada fixa por
tipo**, a **forma única por tipo e povo** e o **planejador que nunca pede terreno grande**.

## As medidas de hoje

| Prédio | Lote | Altura | O maior espaço de dentro | Lugares |
|---|---|---|---|---|
| «Coliseu» (a maravilha romana) | 12 × 12 m (raio 5,8 m) | 13,8 m, 3 andares de 24 arcos | a arena: **4 m de diâmetro** | — |
| Anfiteatro romano (o teatro) | 12 × 12 m (raio 5,4 m) | 8,6 m, 2 andares | o pódio 6 × 6 m; a arena 3,8 m | — |
| Teatro grego | 12 × 12 m | 3 m | a cávea inteira 11,8 m | 87 espectadores |
| Grande Pirâmide (maravilha egípcia) | 12 × 12 m; a pirâmide 10,4 m de base | 24,3 m — **78° de inclinação** (a de Gizé tem 52°): uma agulha | a esplanada 12 × 1,2 m | — |
| Templo Mayor (maravilha asteca) | 12 × 12 m; 11,6 m de base | ~12 m e os dois santuários | — | — |
| Salão nórdico (maravilha nórdica) | 12 × 12 m | 14,9 m | o salão 10,9 × 6,1 m, 3,3 m de pé-direito | 13 |
| Palácio (egípcio / nórdico) | 12 × 12 m | 10,5 / 12,9 m | o trono 9,7 × 3,8 m (5,9 m) / 7,6 × 5,7 m (2,9 m) | 6 / 5 |
| Casa do Chefe (o paço) | 8 × 8 m | 8–10 m | o trono 5,2 × 4,2 m | 7 |
| Grande Palácio / Palácio Colossal | 16 × 16 m / 20 × 20 m | — | (pátios de 1,95 e 2,45 casas) | — |
| Templo grego / romano | 8 × 8 m | 10,9 / 11,8 m | a nave 3,2 × 3,2 m / o pórtico 5,4 × 2,6 m | 6 |
| Templo egípcio / asteca / nórdico | 8 × 8 m | 11,8 / 14,1 / 16,4 m | a nave 5,5 × 4,1 / 2,8 × 2,9 / 4,1 × 4,1 m | 0 / 0 / 6 |
| Taverna (todos os povos) | 8 × 8 m | 1–2 andares | o salão 6,0–6,9 × 3,6–3,7 m, 2,7–3 m de pé-direito | — |
| Banhos, biblioteca, administração, mercado | 8 × 8 m | 4–10 m | 3–7 m de lado | — |
| Cabana, casa, sobrado, ínsula | 4 × 4 m | 1 a 4 pisos | cômodos de 3,4 × 3,4 m, 2,2–2,8 m de pé-direito | — |

As cidades têm terra: Mênfis, a maior da megalópole (322 pessoas), ocupa 56 × 50 casas (224 × 200 m) e os 112 prédios dela
cobrem só 330 casas — 12% da área. Óstia (270): 56 × 58 casas, 211 cobertas. O mapa tem 128 a 192 casas de lado (512–768 m).

## As causas técnicas

1. **A pegada é uma tabela fixa por tipo** (`G.BDEF`, `js/village.js`, `city.js`, `court.js`, `economy.js`…): `w × h` de 1 a 5
   casas, e a casa tem 4 m (`TILE = 4` em `space.js`, `interiors.js`, `forma.js`). Todo templo tem 8 m, todo teatro 12 m, todo
   palácio 12 m, toda maravilha 12 m — no povoado de 15 pessoas e na capital de 322. O prédio guarda a sua pegada (`b.w`, `b.h`),
   mas ela é sempre a do tipo.
2. **A forma é uma só por tipo e povo** (`G.Forma.of(type, style)`, `forma.js`): guardada num memo por `tipo:povo`, com o lado
   `L = BDEF[type].w × 4`. Não existe «templo pequeno» e «templo grande» do mesmo povo: a arquitetura não sabe tamanho.
3. **As formas nasceram do desenho à mão da visão do deus** (`arch.js`): as medidas da forma são as do desenho (x e y em casas a
   partir do meio do lote, × 4 m; a altura em pixels do desenho ÷ 3,04 m). O desenho foi feito para ser lido como ícone de 2 a 3
   casas — daí a arena de 4 m, a pirâmide-agulha, a nave de 3 m. A visão do deus desenha cada tipo com o seu desenho à mão
   (`A.building`, um «sprite» por tipo e povo, do tamanho do tipo), e a prova `qa/visual/fidelidade.js` segura o desenho e a
   forma iguais.
4. **O lote é sempre quadrado**: todos os 56 tipos têm `w = h`, e a forma e a planta só conhecem um lado (`toLoc(s, L, u, v)`,
   `Fo.toLot(s, L, u, v)`). Funciona — um anfiteatro oval, um templo comprido ou um palácio com alas cabem num lote quadrado com
   pátio, praça ou recinto sagrado em volta —, mas é um limite a respeitar.
5. **O planejador não pede terreno grande** (`V.findSite`, `village.js`): procura num raio em volta do centro (`G.Urban.radius`;
   Mênfis: 37 casas), cai para a borda (raio + 6) e, no fim, pode derrubar até 4 prédios pequenos (no máximo 12 camas) para uma
   obra cívica. Nada reserva terra para um monumento, e nada liga o tamanho do prédio ao tamanho da cidade: a única «escala» que
   existe é a escada dos palácios (palácio 3 → grande palácio 4 → colossal 5 casas), três tipos diferentes.
6. **A lotação vem dos lugares da planta** (`In.places`, D-085) — isso está certo e fica: um prédio maior com mais lugares
   comporta mais gente sem regra nova. Mas as plantas pequenas dão 6 lugares no templo, 87 no teatro grego, 13 no salão nórdico;
   a taverna cabe numa mesa e meia.

## Os 17 pontos do pedido, um a um

1. **Dimensões no mundo**: 4 a 20 m de lado (tabela acima); as públicas e monumentais, 8 a 20 m.
2. **Pegadas e limites**: `BDEF.w/h`, fixos por tipo, quadrados; o maior é o Palácio Colossal, 5 × 5 casas (20 m).
3. **Altura total**: vem do desenho do deus (px ÷ 3,04): templos 11–16 m, teatros 3–11 m, maravilhas 12–24 m, palácios 10–13 m.
4. **Pavimentos**: casas de 1 a 4; os monumentos quase sempre um piso só, de 3 a 6,4 m (o anfiteatro romano, três níveis: o
   chão, a arena e a galeria).
5. **Salas internas**: naves de 3 × 3 a 5,5 × 4 m; salões do trono de 5 × 4 a 10 × 4 m; salão da taverna de 6–7 × 3,7 m.
6. **Pé-direito**: casas 2,2–2,8 m; naves 3,5–6,4 m; tronos 2,9–5,9 m. Nenhum espaço passa de 6,5 m.
7. **Corredores**: quase não existem; os prédios grandes são uma sala, ou pátio e sala.
8. **Portas, escadas, passagens**: a regra do corpo é real e fica — o corpo tem 1,75 m e 0,32 m de raio
   (`In.BODY`); nenhuma passagem abaixo de 1,75 m (`DOOR_MIN`); degraus de no máximo 0,30 m. As portas medem 0,8–1,3 m ×
   1,8–5,6 m. Não há portas monumentais nem escadarias largas.
9. **Móveis × pessoas × arquitetura**: os móveis e o corpo estão em metros reais e combinam entre si; o que destoa é a
   arquitetura pequena em volta deles.
10. **Capacidade de ocupação**: pelos lugares da planta (ponto 6 das causas); pequena porque as plantas são pequenas.
11. **Templates procedurais**: as plantas são receitas (famílias) que se ajustam ao lote (`int-*.js`); os monumentos leem a
    forma (`int-monumentos.js`, D-093). Elas crescem se o lote crescer — com custo: a grade de dentro tem casinhas de 0,25 m
    (`In.CS`), e um lote de 48 m tem 36.864 por piso, contra 2.304 num de 12 m.
12. **Regras de tamanho máximo**: a tabela `BDEF`; o raio de busca do planejador; o limite de derrubar 4 prédios.
13. **Tamanho × riqueza, população, importância**: nenhuma relação, salvo a escada dos três palácios.
14. **Limites artificiais**: a forma memorizada por tipo e povo; o desenho à mão no tamanho do tipo; o lote quadrado.
15. **Escala externa × interna**: coerentes entre si (a planta lê a forma, D-093) — o problema é que as duas são pequenas.
16. **A câmera em terceira pessoa** (`cam3d.js`): 4,8 m atrás (de 1,4 a 11 m), campo de visão de 58°, olhar de −60° a +69°.
    Ela se aproxima quando há parede entre ela e o corpo — num cômodo de 3,4 m, encosta o tempo todo. Diante de uma fachada de
    20 m a 10 m de distância, é preciso olhar para cima ~45° para ver o topo.
17. **Perspectiva, enquadramento, recorte**: no 3D, o prédio perto é desenhado inteiro até 35 m × o nível de detalhe, por
    pedaços do mapa (chunks), e de longe vira a silhueta das massas da forma (`Fo.mass`) — a escala se mantém. Na visão do deus,
    cada prédio entra na ordem de desenho pelo seu canto da frente: com prédios de 12 casas, uma pessoa ao lado pode ser
    desenhada atrás dele. O 3D enxerga de 200 a 900 m conforme a qualidade.

## O que já está certo e fica

- **A escala humana**: o corpo, as portas, os degraus, os móveis — reais e coerentes (`In.BODY`, D-088).
- **Uma definição só**: a forma é o que se vê, a planta lê a forma, o 3D desenha pela forma (D-080, D-093). É o caminho para
  o pedido 10 («as duas perspectivas devem derivar da mesma estrutura»).
- **A lotação pelos lugares da planta** (D-085): cresce sozinha com plantas maiores.
- **A terra das cidades**: 12% coberta nas maiores — há onde pôr monumentos.
- **A silhueta de longe** (`Fo.mass`): o LOD que não muda o tamanho percebido.

## O que prédios grandes vão mexer (os riscos)

- **O desenho do deus**: hoje é à mão, por tipo; um prédio de tamanho variável precisa ser desenhado **da própria forma**. E a
  ordem de desenho (o canto da frente) erra com prédios grandes.
- **O custo das plantas**: 16 vezes mais casinhas num lote de 48 m; o orçamento de tempo de uma planta precisa ser medido.
- **O 3D**: mais triângulos por prédio; um prédio que atravessa vários pedaços do mapa.
- **O planejador**: terreno plano e livre para 10 a 16 casas de lado; os muros e os portões (L-491).
- **A economia**: custo e tempo de obra proporcionais ao tamanho, para o monumento ser um feito da cidade, não um enfeite.
- **Os saves**: os prédios guardam a sua pegada (`b.w`, `b.h`) — os de antes continuam do tamanho que tinham, nada se refaz ao
  carregar.
- **A fidelidade**: a prova que segura o desenho do deus e a forma iguais precisa cobrir os tamanhos novos.

## A terra para os monumentos (medida no começo da Etapa 2)

Um monumento grande precisa de um lote livre do seu tamanho. Medido nos mundos prontos (`sondas/mon/quadrado.js`: o maior
quadrado seco, sem prédio e sem muro):

| Mundo | O maior quadrado livre do mapa inteiro | Perto das maiores cidades (até 30 casas do centro) |
|---|---|---|
| Metrópole (cidades de ~58 pessoas) | 13 casas (10 sem degrau do relevo) | Roma 13, Argos 12, Óstia 12, Tebas 11, Mênfis 9 |
| Megalópole (cidades de 100 a 322) | 11 casas (7 sem degrau do relevo) | **Mênfis (322) 4, Óstia (270) 4, Hedeby 4, Alba Longa 4**, Argos 10, Tebas 9 |

Três coisas tomam a terra: **os campos e as casas** das cidades maduras (em volta de Mênfis e de Óstia não sobra um quadrado
de 5 casas), **a água** (as cidades nascem na costa e nos rios) e **os degraus do relevo** (`S.cliff`: o chão sobe em degraus
de 1,5 m a cada poucas casas). Por isso:
- **a cidade vai precisar abrir espaço** para o seu monumento — mudar campos de lugar e realojar famílias de casas baixas, com
  regras (nunca as últimas fazendas, nunca um prédio público, mais camas construídas do que derrubadas), como ela já faz para
  a ínsula do centro (`G.Village.blockSite`);
- **o relevo vira pódio**: o lote de um monumento pode ter degraus do chão por baixo; a forma assenta numa plataforma (o pódio,
  o terraço) que cobre o desnível, e a escadaria leva a ela — como os templos e as pirâmides de verdade;
- **a escada de tamanhos cabe no mundo**: a maravilha com 10 casas (40 m) e a colossal com 13 (52 m), não 12 e 16.
