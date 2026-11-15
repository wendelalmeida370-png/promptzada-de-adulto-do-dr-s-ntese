# Urbanismo — auditoria, diagnóstico e plano

## 1. O que já existe (e vai ser aproveitado)

| Sistema | Arquivo | O que faz hoje |
|---|---|---|
| Crescimento e degraus | `city.js` | Acampamento → Aldeia → Vila → Cidade → Metrópole → Megalópole por população + prédios (cidade ≥ 30 pessoas, metrópole ≥ 50, megalópole ≥ 140). Casas sobem para sobrado, ínsula, quarteirão. |
| Escolha de terreno | `village.js` `findSite/search` | Todo prédio procura lugar num disco em volta do **centro único** do povoado; cada tipo tem uma "distância ideal" do centro. Raio máximo: 17 + 3 × degrau (32 casas para uma megalópole). |
| Plano de ruas | `city.js` `streetPlan` | Duas ruas que se cruzam na fogueira (grade para gregos e romanos), uma viela de cada porta até a rua mais perto; terra batida, depois calçada. Estradas e pontes entre cidades; carroças nas rotas. |
| Moradia | `village.js` `assignHousing` | Capacidade por casa (cabana 4, casa 6, sobrado 9, ínsula 14, quarteirão 40); casais e filhos juntos; adultos saem de casa cheia; quem sobra fica sem casa. |
| Economia | `economy.js`, `estates.js`, `trade.js` | Cadeias de produção, oficinas, feira, mercado, taverna, coletoria, salários (moedas guardadas na casa: `h.coin`), impostos, mercado negro, mercadores que enriquecem e viram elite. |
| Porto | `fishers.js`, `naval.js` | Doca, cais, pescadores de verdade, caixotes, redes, estaleiro, navios mercantes e de guerra. |
| Sociedade | `polity.js` | Regimes e ordem econômica; grupos sociais (nobreza, mercadores, sacerdotes, militares, artesãos, povo) com membros reais (`v.grp`), riqueza, líder, demandas e raiva. |
| Vida cotidiana | `life.js`, `court.js`, `festivals.js` | Famílias na porta ao entardecer, filas no poço e nas barracas, aprendizes, a taverna à noite com música, festas por cultura. |
| Justiça | `justice.js`, `riots.js`, `secrets.js` | Prisão à espera da sentença (um lugar perto do centro, sem prédio), execuções públicas, motins, sociedades secretas, testemunhas. |
| Narrativa | `stories.js` + `story-*.js` | Sinais, sementes, diretor com saliência e anti-fadiga. |

## 2. Por que as cidades parecem compactas (diagnóstico)

Medido num mundo grande (192 × 192, 5 povos, 60 anos — seção 6): a maior cidade tinha **98 pessoas em 17 casas** (7 sobrados, 4 ínsulas, 6 casas), num retângulo de 40 × 32 casas do mapa, com só 22 % do chão construído. O resto do "tamanho" eram campos, minas, torres e armazéns. Uma metrópole com 78 pessoas tinha **8 casas**.

1. **A cidade cresce para cima cedo demais.** O planejador sempre pede a casa mais alta que o estoque paga (ínsula para 14, quarteirão para 40). Poucos prédios abrigam todo mundo: a cidade vira meia dúzia de torres no meio dos campos, sem tecido urbano.
2. **Um centro só.** Todo prédio é posto por distância à fogueira; a cidade cresce em anel em volta de um ponto, nunca a partir do porto, do mercado, do templo ou da estrada.
3. **Um teto de raio.** O lugar de um prédio é procurado num disco de no máximo 32 casas, e o território (`s.radius`) para em 33.
4. **Sem bairros, sem valor da terra.** As funções se misturam por acaso. Nada distingue o lugar caro do barato, o nobre do popular, o de oficinas do do porto.
5. **Ruas sem hierarquia.** Sempre a mesma cruz (ou grade) saindo do centro; a estrada que chega não vira rua principal.
6. **Muralha só para cidade pequena.** A muralha é um retângulo de no máximo 30 casas; uma cidade maior simplesmente fica sem muralha.
7. **Escala de gente.** Cada habitante é uma pessoa simulada (com casa, família, ofício, memória). O mapa 192 aguenta cerca de 1.100 pessoas no total; uma megalópole tem centenas — não dez mil. Uma cidade grande precisa ficar grande pelo **jeito de ocupar o chão** (casas baixas com quintal na borda, oficinas, armazéns, praças, hortas, bairros, vários centros), não por gente inventada.

## 3. A arquitetura nova

Um módulo novo, `js/urban.js` (`G.Urban`), por cima do que já existe — o planejador da vila, as ruas, a economia e a política continuam os mesmos, e o novo módulo só muda **onde** cada coisa vai e **o que a cidade faz do seu chão**:

- **Células urbanas** (6 × 6 casas do mapa), relidas uma vez por dia de cada cidade: o que está em cada uma (casas e quem mora nelas, oficinas, porto, templo, quartel, comércio, campos), a altura e a água, o risco de cheia, o calçamento, a muralha. Nada disso é salvo: é lido do mundo.
- **Valor da terra** de cada célula, calculado de fatores reais: perto do palácio, do templo e da praça vale mais; alto e seco, junto à água, vale mais; ao lado da forja, do curtume, do açougue e dos currais vale menos; dentro da muralha, mais; na borda da cidade, menos.
- **Núcleos**: o velho fogo, cada praça e mercado, o porto, o templo, o palácio, o quartel, os portões e as estradas que chegam. Cada núcleo junta um anel de casas em volta; a cidade cresce de todos ao mesmo tempo.
- **Cada prédio procura o lugar ao qual pertence**: a casa, um anel ainda crescendo em volta de algum núcleo, sem oficina embaixo da janela; a oficina, junto das outras oficinas e da água, em terra barata; o mercado, o cruzamento por onde mais gente passa, longe de outro mercado; a taverna, o porto e o mercado; o armazém e a salga, o cais; o palácio e o templo, o alto; o mercado clandestino, a borda barata perto do porto. (Aldeias e vilas pequenas continuam como antes.)
- **Alto só onde a terra é cara**: o planejador pede a casa mais alta que pode pagar, mas se o lugar escolhido é barato, a mesma família faz uma casa baixa (com quintal). Sobrado só em terra média, ínsula e quarteirão só no coração caro da cidade — e a reforma de casas velhas em prédios altos também.
- **Hortas de quintal** na borda arejada da cidade: a família cava, cuida ao voltar para casa no fim do dia (ou cedo, antes do trabalho) e colhe — a comida vai para a despensa da casa. Quando a cidade adensa em volta, o quintal some.
- **Bairros que emergem**: cada célula toma a vocação do que tem (centro antigo, comércio, nobre, popular, ofícios, porto, militar, sagrado, campos), suavizada pelas vizinhas; o centro antigo são as células mais velhas em volta do fogo; células da mesma vocação que se tocam formam um bairro. Só uma cidade tem bairros (uma vila só tem os seus campos com nome). Cada bairro **persiste**: tem nome próprio na cidade (do lugar, do ofício, do povo — Rua dos Ferreiros, Cerâmico, Tianguis, Subura, Colina dos Nobres, Bairro do Porto, Chinampas…), ano de nascimento e uma história: cresce, muda de vocação (depois de vários dias seguidos), esvazia, é engolido por um vizinho ou deixa de existir — e o que vale contar vai para a crônica, sem repetir (um aviso por cidade a cada três anos).
- **Avenidas**: do velho fogo até cada núcleo, contornando as casas pelo caminho que o povo já gasta; são abertas e calçadas antes das ruas de dentro.
- **Muralha da cidade velha**: uma cidade larga demais para uma muralha só cerca o seu centro; os bairros novos ficam do lado de fora.
- **Ver a cidade**: o nome de cada bairro no mapa (clique para abrir o painel do bairro: vocação, gente, riqueza, valor da terra, trabalho, idade, história, "ir até lá"); o prédio diz em que bairro está; a tecla **V** pinta o chão de cada bairro com a cor da vocação, e de novo **V** mostra o valor da terra.
- **Salvo**: os bairros vivem em cada povoado (`set.urb`), com nome, idade e história; uma cidade conquistada guarda os nomes dos seus bairros.

## 4. Etapas

**A. O espaço** (`js/urban.js`): células, valor da terra, núcleos, lugar de cada prédio, alto só onde a terra é cara, hortas de quintal, bairros com nome e história, avenidas, muralha da cidade velha, nomes no mapa, painel do bairro, visão da cidade (V).

**B. O porto** (`js/harbor.js`): o que o navio mercante traz desce em caixas no cais (e o que ele leva de volta também); os **estivadores** carregam caixa por caixa para o **armazém do porto** — e só então a mercadoria entra no estoque da cidade. Quem é chamado para outra coisa no meio do caminho devolve a caixa ao cais (antes ela sumia — L-060). Cada doca de uma cidade portuária ganha o seu armazém, que vira também o depósito mais perto para os pescadores e para quem abastece o mercado. (A feira, o mercado e a compra com moedas já existiam e são de verdade: o feirante busca no armazém, o freguês paga da casa dele.)

**C. A taverna** (`js/tavern.js`, junto com o que já havia em `court.js`: música, o caminho torto de volta para casa, as brigas): cada povo bebe o seu — vinho para gregos e romanos (das vinhas), hidromel para os nórdicos (do mel), **cerveja** para egípcios e povos sem nome, **pulque** para os astecas; cerveja e pulque são feitos ali mesmo pelo taverneiro, do grão da cidade (primeiro de tudo quando a prateleira está vazia). A primeira caneca vem com a refeição; cada rodada a mais sai das moedas da casa de quem bebe e vai para a casa do taverneiro (sem taverneiro, para o tesouro); luto, companhia e um temperamento sociável pedem mais uma; quem bebe três ou mais acorda de ressaca, cansado. Ir à taverna é uma escolha de verdade ao entardecer para quem tem uma perto, e a noite na taverna avança pelas primeiras horas do escuro — antes, quase ninguém escolhia ir e quem ia era mandado dormir antes de beber (num mundo de 50 anos: 0 doses servidas; agora, dezenas).

**D. Quem tem teto** (`js/social.js`): todo adulto sem casa tem o **motivo** guardado — a casa pegou fogo, caiu num terremoto, foi destruída na guerra, foi derrubada para uma obra, ou a cidade simplesmente não tem lugar. Quem passa duas noites na rua levanta um **barraco** de tábuas na terra mais barata da borda (perto do rio, do cais, de outros barracos) — e um bairro de barracos pode nascer ali; uma tentativa interrompida (uma festa, a noite) é retomada no mesmo dia. O barraco não conta como casa para o planejador, que continua construindo; quando uma casa de verdade tem lugar, a família se muda, e o barraco vazio cai; a família que juntou moedas transforma o barraco numa cabana. O painel da pessoa diz há quanto tempo ela está sem casa e por quê, e a biografia guarda o barraco e a saída dele. **A terra cara vai para quem pode pagar**: uma vez por dia, a família rica que mora em terra barata compra a casa de uma família simples em terra cara (do mesmo tamanho), com as moedas, a despensa, os bens e a casa de comércio indo junto com cada família — é assim que o bairro nobre se forma onde a terra vale.

**E. Crime e justiça** (`js/crime.js`): o ladrão tem motivo — fome com o bolso vazio, noites na rua, ou um primeiro roubo que deu certo. Ao anoitecer ou à noite ele vai até a porta de uma casa com moedas e leva parte delas (as moedas saem de verdade da casa e vão para o bolso dele). Quem estava acordado perto **viu** — e só sabe o que viu; a família descobre de manhã. Uma testemunha que cruza um guarda conta; o guarda **não sabe onde o ladrão está**: procura na casa dele, onde foi visto, em volta, e desiste se não acha. O ladrão que vê o guarda chegando pode fugir. Preso, vai amarrado até a **cadeia** (celas contadas, carcereiro), onde fica o tempo que a **lei do seu povo** manda (tirania: três anos; reinos e templos: dois; repúblicas e democracias: um, com devolução; tribos: só a devolução, decidida pelos anciãos); as moedas voltam para a casa roubada. Cadeia sem carcereiro de guarda à noite pode perder um preso corajoso. A cidade com cadeia, com roubos ou grande mantém um ofício novo, o **vigia**: de dia uma volta pelas praças, à noite a **ronda** com tocha pelos bairros; é a ele (ou a um soldado) que a testemunha conta. O carcereiro que vê um roubo também prende. Uma cidade com roubos (ou grande) constrói a sua cadeia. **Preso fica preso**: `v.jail` é a única verdade, e toda tarefa dada a um preso passa pela cadeia primeiro — uma petição, uma festa, uma despedida no cais não abrem a cela; só um tumulto de verdade (fogo, pânico, um navio) — e isso conta como fuga. A biografia guarda a prisão, a pena e a fuga.

**F. Integração**: painel da cidade, sobreposições, histórias no motor narrativo, desempenho, os testes, avaliação visual — e o que ficou para depois (abaixo).

### O que ainda não foi feito (próximas rodadas)

- Leis próprias de cada cidade (toque de recolher, proibição de barracos, vigias por bairro) e o vigia separando brigas de taverna.
- Histórias do motor narrativo nascidas desses fatos (o roubo e a prisão, a família que perde a casa no fogo, o filho do barraco que vira mercador): hoje eles vão para a crônica e para a biografia (que os velhos contam às crianças), mas ainda não abrem uma história própria no painel Histórias.
- Mercados de rua com barracas por bairro, trabalhadores do porto com horário de navio, e a noite da cidade com mais ofícios (lampião, vigia de portão).
- Cidades maiores em gente: hoje o limite é de quem é simulado de verdade (seção 2, item 7).
- O modo Encarnado (viver como uma pessoa) vai usar as mesmas portas: a casa e as moedas da família, o bairro, a taverna, a cela — nada aqui é cenário falso.

## 5. Protocolo

Cada etapa chega com invariantes no verificador (`qa/qa.js`), cenários em `qa/`, regra no `qa/guard.js` quando der, e passa pela regressão completa antes de ser publicada.

## 6. Medições

O que está pronto e foi medido (mundos de teste, com o verificador ligado):

| Prova | O que mostra | Resultado |
|---|---|---|
| `qa/urb1.js 41 128 90` (um mundo abençoado até a primeira metrópole, ~50 anos, nada provocado) | bairros com vocação, nomes únicos e salvos, terra mais cara no centro e no bairro nobre, vários núcleos, avenidas calçadas antes, mais camas por quadra no centro que na borda; hortas colhidas, tavernas servindo, carga do porto pelo armazém, roubos respondidos, ricos em terra mais cara | ver `qa/linha-de-base.txt` (linhas "cidade") |
| `qa/urb2.js 7` (e 23, 41) | provocado de propósito: a carga no cais, a taverna e a sua bebida, as hortas, o incêndio que leva ao barraco e de volta a uma casa, o roubo visto pelo vigia, a prisão, a cela atravessando um save, a soltura | 7 de 7 em cada semente |
| `qa/AUDIT.md` L-060 a L-068, D-007, D-008, T-013 a T-015 | o que a reforma achou de errado (antigo e novo) e como foi corrigido | — |

