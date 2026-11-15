# Bloco S — o que se ouve (BV-5), pronto para o líder colar

Ramo: `worktree-agent-a9ef0e62c04445430`, sobre o `61dc62b`. Números usados: L-740, L-741; T-720 a T-728; D-166 a D-169;
regras do guard 53 e 54. Arquivos novos: `js/audio-src.js`, `qa/som.js`, `qa/som-inv.js`. Mexidos: `js/audio.js`, `index.html`
(uma linha `<script src="js/audio-src.js">`, logo depois da do `audio.js`), `qa/audiorun.js`.

**As regras novas do verificador estão em `qa/som-inv.js`** (o sistema `som`, severidade 3), no formato dos outros `*-inv.js`:
o `qa/junta-inv.js` do líder as copia para o `qa.js`. A prova já as carrega (`M.load({ extra: ['qa/som-inv.js'] })`) e o caso
s14 mostra que cada uma acusa o que deve.

**O `js/audio-src.js` precisa entrar na lista `LOOK` do `qa/guard.js`** (a regra 3: «o que só se vê ou se ouve»), ao lado do
`audio.js`. Hoje o guard passa com ele fora da lista (ele não sorteia nada), mas as regras 13, 17 e 50 só o cobrem dentro dela.

---

## 1. Linhas do `qa/AUDIT.md`

| L-740 | bug (consertado nos Bairros Vivos, no «o que se ouve»; achado na auditoria do `audio.js`) | **Um fogo em qualquer lugar do mundo estalava no ambiente.** O estalo do fogo (`A.update`) contava as casas em chamas do mundo inteiro (`for (const i of G.Nature.fireSet) fires++`, até doze): uma floresta queimando na outra ponta do mapa estalava para quem olhava uma praia calma — um som de lugar sem fonte perto do ouvido, o contrário do princípio do patch. **Conserto** (`js/audio.js`, `analyse`): o estalo conta só o que queima dentro do alcance do ouvido (`scape.fires`: as casas em chamas a até 1,3 ouvido), e fica a 40% dentro de casa, como o resto da rua. **Prova:** `qa/som.js` s12 — o ouvido a duas casas de uma árvore, uma árvore em chamas a 62 casas (pela porta do jogo, `G.Nature.ignite`): 0 estalos; a árvore ao lado em chamas: 1. **Sabotagem** (g1, contar todo fogo do mundo): o s12 acusa. |
| L-741 | suspeita de bug (ABERTO, fora do escopo do «o que se ouve»; achado montando a prova do ouvido do corpo, só em Node — não conferido no navegador) | **Tomar o corpo de quem está dentro de casa deixa o corpo na porta.** O `G.Possess.take` (`js/possess.js`) acha o lugar de quem está dentro pela planta, põe `v.inside` e `S.avatar.lv` (a linha «taken where they are in it»), e logo depois chama `G.Vg.setTask(v, mark())`; o `setTask` chama `Vg.endTask(v)` sem `stay` — a tarefa já foi encerrada pelo `endTask({ stay })` de antes, então cai no ramo «sem tarefa» (`villagers.js`, `if (!t) { … if (v.inside && … !(o && o.stay === v.inside)) leave(v); … }`) e o corpo sai à porta com `v.inside = 0` (o `S.avatar.lv` fica com o piso). Em Node, de 13 pessoas em casa na «cidade» (hora 0,90), nenhuma ficou dentro depois do `take`. **Como reproduzir:** `M.load({ qa: true, extra: ['js/space.js', 'js/possess.js'] }); M.pronto('cidade')`, o salto até 0,9, e para alguém com `v.inside === v.home`: `G.Possess.take(v)` → `v.inside` é 0 e `S.avatar.lv` não é nulo. **A conferir no navegador** (o `avatar.js` e o `Po.update` não rodam em Node e podem repor o corpo no cômodo; o e18 do `encarna.js` entra pela porta, não toma alguém já dentro). Não consertei: é do corpo encarnado. Para o som, a consequência é só de prova (T-726). |
| T-720 | limite de teste (dito no `qa/som.js`) | **Em Node nada toca: a prova do som é a prova da decisão.** O Node não tem áudio. O `qa/som.js` lê a cena (`G.Audio.scene`, pura): que fonte soaria, de quem, com que ganho, de que lado, com que abafado; e roda o tocador do `audio.js` contra um contexto de áudio de mentira (`FakeAC`: todo nó aceita tudo, conta os nós feitos) para provar que ele não muda o mundo, não tira do acaso do mundo e só toca o que tem fonte (s9, s12). O que a máquina **não** prova: como soa — o timbre de cada som da biblioteca, se o martelo «parece» martelo, se o volume está bom. O `qa/audiorun.js` (navegador, WebAudio de verdade) prova que toca sem erro e grava cada som de lugar com o dono; ouvir é do dono do projeto. |
| T-721 | limite de teste (dito no `qa/som.js`, s7) | **O fundo do bairro é provado na «cidade» com leitura contada pela mão da prova.** Os mundos prontos desta árvore são de antes da vida do bairro (não têm `d.vida`: ela se enche no primeiro dia). O s7 vive dois dias antes de olhar o peso (s7b) e seis antes da curva do hábito (s7a); a curva usa a chave `saber` (a «cidade» não tem biblioteca: o hábito parte de zero exato) contada pela porta `G.Urban.note` dentro do passo, uma vez e meia a marca de um bairro letrado por dia — a regra é a mesma para as dez vidas (`A.habito`). O cais «de verdade» (carga real cruzando o cais por dias) fica provado só pelas fontes (s3) e pela conta do peso (s7b, numa vida que a cidade tem: o campo). Com os mundos da geração 20 (que nascem com a vida), dá para trocar a chave por `cais` num bairro de porto. |
| T-722 | limite de teste (dito no `qa/som.js`, s7) | **O dia do mundo e o dia dos bairros de uma cidade não viram no mesmo passo.** A primeira versão do s7a contava dias inteiros do mundo (`M.saltar(1)`): houve dias sem nenhum fechamento do bairro e dias com dois (o `G.Urban` fecha uma cidade por passo depois da virada, no ritmo lento do salto), e a curva do hábito saía com degraus dobrados («0,64 → 0,64 → 0,507», «0,4 → 0,253»). A prova passou a viver, pelo salto do jogo, até o bairro sob o ouvido ter fechado exatamente um dia a mais (`q.dias`). Nenhuma regra do jogo mudou. |
| T-723 | limite de teste (dito no `qa/som.js`, s4) | **O ferreiro quase não martela: a prova o leva à bigorna pela regra do ofício.** Na metrópole pronta, uma fornada da forja é uma por dia (seis unidades de 4 s), e o ferreiro come, busca, espera o fogo: em 400 s de mundo vivido sem provocação, o primeiro martelo saiu aos 290 s. O s4 dá minério e lenha ao armazém de cada povo (pelo livro, `D.make … 'teste'`) e, a cada segundo, se o ferreiro não está numa tarefa do ofício nem em nada de prioridade ≥ 1,5, pede a ele a próxima coisa da fornada pela regra do próprio ofício (`G.Oficio.task`) — até ele martelar (teto: 260 s). O som não depende disso: é a mesma linha para qualquer ferreiro que martele. |
| T-724 | limite de teste (o mesmo do T-281, dito no `qa/som.js`, s6) | **Ninguém se banha na metrópole pronta num dia inteiro; o banhista da prova vai segurado.** As quatro termas abertas da metrópole tiveram 0 entradas no dia olhado (os serviços vazios das cidades pequenas: T-377, T-378). O s6 manda quatro moradores pela porta do lazer (`G.Termas.visit`) com a tarefa segurada acima dos chamados do dia (`pri 2,9`, `kind 'work'`), como o `qa/termas.js` faz: dada nua (0,4), o trabalho da manhã, o teatro e a reza levaram cada banhista no caminho. |
| T-725 | limite de teste (dito no `qa/som.js`, s1c) | **«Todo ato visto tem linha» cobre os atos que o dia da metrópole mostrou.** A tabela dos gestos (`A.GESTO`) é conferida inteira contra o `G.Act.ANIM` (s1a) — nenhum gesto escapa. Os atos de fora dos gestos (`A.ATO`: a colheita, a dança da festa, o choro, o motim…) não têm uma lista no código para conferir contra: a prova olha todo `v.act` de toda pessoa a cada segundo vivido (mais de 5 000 olhadas) e falha se algum não tem linha; um ato que só aparece numa cena rara (uma execução, um culto) tem linha na tabela (91 atos), mas só é provado quando acontece. Um ato novo sem linha não soa — e a prova o acusa no primeiro mundo em que aparecer. |
| T-726 | limite de teste (dito no `qa/som.js`, s13) | **O ouvido do corpo é provado em Node com o modo e o olho de mentira, e só ao ar livre.** O `G.Modes` e o `G.Cam3D` são do 3D e não carregam em Node: o s13 põe no lugar deles um `G.Modes.god()` que diz «há um corpo» e um `G.Cam3D.yaw` que a prova vira, toma um corpo de verdade (`G.Possess.take`) e confere que o ouvido (`A.ear()`) está onde o corpo está, vai com ele, vira com o olho e volta a ser o do deus quando o corpo é devolvido. «Dentro de casa» com o corpo não dá em Node (L-741: o corpo tomado dentro sai à porta); a regra das paredes fica provada com o ouvido dado (s2c: a rua ouvida de dentro, a casa ouvida da rua) e nas cenas da forja, da taverna e das termas (s4, s5, s6: o mesmo som da rua e de dentro). No navegador, o `audiorun.js` rodou só no Modo Deus; o `encarna.js` não foi rodado por este agente (a máquina estava cheia) — a parte e11 («o 3D desenha sem erro de módulo») cobre erro de página no Modo Encarnado e deve rodar na regressão. |
| T-727 | limite de teste (dito no `qa/som.js`) | **Um caso só (`ONLY=s7b`) roda até onde precisa.** O dia da metrópole (s3, s4, s6, s5 e a noite) e os dois mundos da «cidade» (s7, s9) custam minutos; `ONLY=s5` pula direto para a hora da taverna, `ONLY=s7c` não abre o segundo mundo. Com `ONLY`, os casos de contagem (s1c: atos olhados; s10: cenas e fontes olhadas) não exigem o mínimo — a contagem inteira só existe na prova inteira. |
| T-728 | limite de teste (consertado; achado rodando o `audiorun.js` por 60 s) | **O `audiorun.js` quebrava no décimo tique: lia o salvamento automático como JSON.** Aos 50 s a prova salva o mundo e confere `JSON.parse(localStorage.getItem('gotaf-save-v1'))`; o salvamento automático é escrito comprimido (`gz1:…`, quando o empacotamento termina) — «Unexpected token 'g'», e a prova morria sem dizer nada do som (com 40 s, oito tiques, não chegava lá). A linha já era assim no `61dc62b`. Passou a conferir que o salvamento está lá ou a caminho (`localStorage` ou `G.Save.pending`). Nenhuma regra do jogo mudou. |
| D-166 | decisão (do agente S, nos Bairros Vivos: o que se ouve) | **Um sistema de som só, em duas metades: uma decide, a outra toca — e todo som de lugar tem dono.** O `audio.js` era mono, com o volume pela posição na tela do deus e um punhado de fontes reais (o martelo do primeiro ferreiro à vista, os cães e as galinhas, a multidão, os lutadores). Fica um sistema só: (1) **A cena** (`js/audio-src.js`, novo, puro): `G.Audio.scene(ouvido)` devolve o que soaria agora — a lista das fontes (a mais forte primeiro, até 24, das quais até 6 bichos), o fundo do bairro, a gente em volta, a música do chão. Cada fonte diz de quem é (`de: { v, op, b }` uma pessoa, a operação e o prédio dela; `{ b, op }` um prédio com a operação viva; `{ navio }`; `{ bicho }`), o som (`s`, um nome da biblioteca), o ganho, o lado (`pan`), o abafado (`muf`) e quando soa (`q`: no contato do gesto, enquanto dura, ou ao acaso do ouvido para a voz de um bicho). (2) **A tabela gesto→som** (`A.GESTO`): uma linha para cada gesto do `G.Act.ANIM` — 41 com som, 14 com um silêncio dito de propósito (`por`: «quem espera está parado», «a plateia assiste calada: soa quem está no palco»…); o gesto de uma pessoa sai do ato que o mundo mostra (`v.act`) e, onde vários gestos têm o mesmo ato, da tarefa, da etapa da fornada e da carga nos braços (`A.gestoDe`). Os atos de fora dos gestos (a colheita, a dança da festa, o choro, o motim) têm a tabela deles (`A.ATO`); os golpes que o mundo já toca na hora (o machado, a picareta, o martelo da obra, a espada: `G.Audio.at` no passo) são silêncio dito («o mundo toca o golpe»), para não soarem duas vezes. (3) **O ouvido** (`A.ear`): no Modo Encarnado é o corpo — onde ele está, virado como o olho (`G.Cam3D.yaw`), fechado no prédio em que o mundo o tem; no Modo Deus é o meio da tela, com a direita da tela e o alcance do que a tela mostra, e do alto ouve menos. O ganho cai com a distância até o silêncio (`A.EAR`: 12 casas para um som comum, mais para a bigorna, menos para a moeda); uma parede entre a fonte e o ouvido deixa 35% e abafa (um filtro passa-baixas), duas deixam 12%; o céu aberto (a praça, as fileiras do teatro, uma ruína) não é parede. (4) **O tocador** (`audio.js`): olha a cena quatro vezes por segundo e toca cada fonte no relógio dela, com `StereoPanner` e filtro; o `G.Audio.at` (os golpes do mundo) passou a ouvir pelo mesmo ouvido; com o mundo parado (pausa, um painel aberto) os gestos não soam; dentro de casa a rua inteira (o mar, o vento, a chuva, os pássaros) fica a 40%. Os sons de lugar seguem o botão «ambiente». **O que não muda:** os sons de interface, dos poderes e das histórias. **Regras:** a cena não escreve nada e não sorteia nada (nem do acaso do mundo, nem do outro); o tocador só sorteia do `G.VR`. **No verificador** (`qa/som-inv.js`, sistema `som`): a cena do meio de cada cidade (as doze maiores) tem toda fonte com dono vivo e números de verdade, o fundo sem peso onde não há mãos, e a tabela cobre todo gesto. **Provas:** `qa/som.js` s1 a s6, s9 a s14; `qa/audiorun.js`. |
| D-167 | decisão (do agente S, nos Bairros Vivos) | **O fundo do bairro é o hábito vezes as mãos de agora — e é feito das vozes longe do próprio trabalho.** Para cada vida do bairro (`cais`, `pesca`, `troca`, `oficio`, `mina`, `campo`, `armas`, `fe`, `saber`, `noite`), o peso do fundo é: o **hábito** (`A.habito`: a média lenta `d.vida` do `G.Urban` contra a marca que faz o perfil — um bairro que tem de carga por dia o que faz um «porto movimentado» tem hábito 1), vezes as **mãos de agora** (quantas pessoas do bairro estão nesse trabalho neste instante — pela operação delas, pela tarefa, pelo gesto —: duas fazem a presença inteira), vezes a **chuva** (que encobre o que está longe: até a metade). Sem mãos o peso é zero, qualquer que seja o hábito e o nome do bairro: **porto vazio não soa a porto**, de noite e em dia sem navio; e sem hábito (um bairro onde aquilo nunca acontece) uma descarga isolada soa só pelas fontes dela, de perto. O fundo não tem som próprio: o tocador manda, de vez em quando, a voz de um trabalhador de verdade do bairro que está longe demais para se distinguir (`fundo.de`: os três mais perto de cada vida), baixa, abafada e do lado dele — quanto maior o peso, mais vezes. A mistura de quem ouve anda devagar (`A.blend`, constante de 4 s): atravessar de um bairro a outro não corta o som. O hábito muda um quinto por dia (a média do `G.Urban`): um cais que para leva dias para deixar de ter fundo quando há mãos, e o perfil sai pela paciência de sempre. **Sem fundo de propósito:** `crime` (o perigo de um bairro não tem som: soam a briga e o grito, que são fontes), rico, pobre e vazio (a gente em volta já diz: o murmúrio é de quem está acordado na rua ao alcance do ouvido). **Provas:** `qa/som.js` s7a, s7b, s7c, s3b. |
| D-168 | decisão (do agente S, nos Bairros Vivos) | **A música tira a escala e o timbre do povo do chão e da época das artes dele; nenhuma trilha por bairro.** A música do mundo era uma pentatônica maior para todos. Agora (`A.musicOf(povo, artes)`, puro): cada povo tem o seu modo, a sua tônica e o seu instrumento — grego: dórico antigo (0 1 3 5 7 8 10), lira; nórdico: menor com bordão, uma palheta lenta e grave; egípcio: hijaz (0 1 4 5 7 8 10), harpa; asteca: pentatônica sem semitons, flauta com sopro; romano: lídio, tíbia —, e cada época usa mais notas dele: **antes do bronze** três notas, sopro e tambor (todo povo de pedra canta com a voz e a flauta de osso, mas cada um nas suas três notas); **com o bronze** cinco notas no instrumento do povo; **com o ferro** o modo inteiro, com o instrumento dobrado. A música que toca é a do povo dono do chão onde o ouvido está (`A.musicAt`: o bairro → a cidade → o povo); a mesma em todos os bairros de uma cidade; no ermo e no mar, a escala comum de antes. O alaúde da taverna (`tocar`) toca a escala do povo de quem toca — a música que vem de alguém vem daquela fonte. As músicas das cenas das histórias (`A.mood`) não mudaram. **Provas:** `qa/som.js` s8a (5 povos × 3 épocas: todas diferentes, sempre iguais para o mesmo povo e época), s8b (no chão de cada povo a dele, a mesma em todos os bairros), s5c (a escala do alaúde). |
| D-169 | decisão (do agente S, nos Bairros Vivos: o que NÃO entrou, dito para não fingir) | **Sem causa na simulação, sem som.** (1) **Voz sem palavras:** não há idioma nem fala gravada; quem fala, regateia, apregoa, conta história, reza ou chora soa com uma voz sintetizada sem palavras, no tom da própria pessoa (o sexo, a idade e a identidade dão a altura: `tom`) — o mesmo vizinho tem sempre a mesma voz. Não há timbre de murmúrio por povo. (2) **Sem passos:** andar e correr são silêncio dito («é dos pés, não de um gesto»); o corpo do jogador já tinha os sons dele (a queda, a água). (3) **Sem músico de praça, sem carroça que range, sem patrão gritando:** nenhum existe na simulação; a única música que vem de alguém é a de quem toca na taverna e a dança da festa (as palmas de quem dança). (4) **A taverna só canta com alguém cantando** (o gesto `tocar` de quem o mundo pôs a tocar, `b._music`); cheia sem ninguém tocando, só o burburinho; vazia, nada. (5) **O teatro:** soa quem está no palco (a fala, o choque das armas do jogo); a plateia assiste calada — não há aplauso porque o mundo não tem o gesto. (6) **As termas:** a água soa de quem se banha; a fornalha só ronca acesa. (7) **Quem se esgueira, espreita ou se esconde não soa** — o ladrão não se anuncia. |

## 2. Linhas do `qa/README.md` (tabela «Os testes»)

| `som.js` | `[ONLY=s3,s7b] node som.js [mundo]` (≈ 6 min com a máquina cheia; em Node) | O que se ouve (Bairros Vivos, D-166 a D-169): a decisão do som (`G.Audio.scene`, pura), lida no mundo pronto «metrópole» vivido pelo passo do jogo, e num segundo mundo («cidade») a mesma vida com e sem o som. s1 a tabela: todo gesto de `G.Act.ANIM` tem linha (um som da biblioteca ou um silêncio dito), nenhuma linha de gesto que não existe, um gesto registrado agora aparece como sem linha, o gesto de um ato sai da tarefa, da carga e do apetrecho (sentado em casa, nas termas, no teatro: três gestos; 31 perguntas à regra), e todo ato visto numa pessoa no dia tem linha; s2 o ouvido: a mesma fonte à direita e à esquerda (o ouvido vira, o lado troca), a distância derruba o ganho até o silêncio, uma parede abafa (a rua de dentro de casa, a casa da rua), duas abafam mais, a praça é céu aberto; s3 o cais: com a descarga viva as fontes são os estivadores da operação, cada um onde está, e de noite o cais não soa (nem fontes, nem fundo); s4 a forja: o martelo é do ferreiro, da fornada e do prédio — abafado da rua, limpo de dentro —, e a forja sem ninguém martelando não soa (o ferreiro vai à bigorna pela regra do ofício, T-723); s5 a taverna: o burburinho é do prédio e do dia, mais forte com mais gente, nenhum na vazia, e o alaúde só soa de quem toca, na escala do povo dele; s6 as termas: a água soa de quem se banha, a fornalha só ronca acesa (o banhista vai segurado, T-724); s7 o fundo do bairro: o hábito segue a vida contada devagar (um quinto por dia, para cima e para baixo), o peso é o hábito vezes as mãos de agora (sem mãos, zero), a chuva encobre, e a mistura de quem ouve anda devagar; s8 a música: cada povo a sua escala e o seu timbre, cada época a sua, sempre igual, a mesma em todos os bairros de uma cidade, a comum no ermo; s9 o som não muda o mundo: 420 passos com a cena para três ouvidos a cada passo, o tocador ligado (um contexto de áudio de mentira, T-720) e um save no meio, contra a mesma vida sem nada disso — a mesma impressão do mundo e o mesmo acaso, nenhum sorteio do acaso do mundo, tudo o que o tocador tocou com dono vivo (as vozes do fundo do bairro também, e só onde o bairro tem peso), nada com o mundo parado, a cena largada no load, e o código da cena sem sorteio, sem escrita e sem porta do mundo; s10 toda fonte de toda cena tem dono (uma pessoa acordada num ato e no lugar dela, um prédio com a operação viva, um navio que anda, um bicho vivo); s11 o mesmo mundo e o mesmo ouvido dão a mesma cena; s12 o fogo só estala perto do ouvido (L-740), e os golpes que o mundo toca na hora (`G.Audio.at`) são ouvidos pelo mesmo ouvido — o lado, a distância, as paredes; s13 o ouvido é o corpo (T-726); s14 as regras do som no verificador (`som-inv.js`) limpas no mundo e acusando cada defeito posto. `ONLY=s7b` roda uma parte só (T-727). Fim: `SOM: ok`. Fase `fundacao` da regressão. |

E a linha do `audiorun.js` passa a ser:

| `audiorun.js` | `node audiorun.js semente segundos` (`MUNDO=metropole`: um mundo pronto, o olho do deus sobre a maior cidade) | O jogo em tempo real com som, música, ambiente, cinema e poderes, no navegador (WebAudio de verdade). Grava cada som de lugar que toca e de quem ele vem (`G.Audio.gravar` → `G.Audio.tocou`): cada linha diz a cena que o ouvido tem (o modo, o alcance, as fontes por tipo, o bairro, o fundo, a música) e quantos sons de lugar tocaram; no fim, os sons de lugar por nome, quantos tiveram lado, quantos saíram abafados, quantos do fundo do bairro — e as fontes sem dono vivo (falha). |

## 3. Entrada do `qa/regress.sh`

Na fase `fundacao`, junto das provas dos Bairros Vivos (a linha do `vida-bairro`): `(F som som.js) &` — ela abre dois mundos e
vive um dia da metrópole: ≈ 6 min com a máquina livre (≈ 12 min com ela cheia); pode ir sozinha num `( … ) &` próprio.
O `audiorun.js` não entra na regressão (tempo real, navegador): é para rodar à mão antes de publicar
(`MUNDO=metropole bash qa/navegador.sh node qa/audiorun.js 7 60`).

Linhas novas esperadas na linha de base: as 34 linhas `PASSOU | som …` (s1a, s1b, s1d, s2a, s2b, s2c, s8a, s8b, s3a, s4a, s4b,
s6a, s6b, s5a, s5b, s5c, s3b, s11, s14, s1c, s10, verificador, s7c, s7b, s7a, s9a, s9b, s9d, s9c, s12b, s12, s13, s10b,
sem-erros) e a linha final `SOM: ok`.

## 4. Regras novas do `qa/guard.js`

**Regra 53 — «a cena de som só lê»** (D-166): o `js/audio-src.js` decide o que soa e mais nada — não sorteia (nem do acaso
do mundo, nem do `G.VR`: a mesma cena para o mesmo mundo), não escreve em pessoa, prédio, operação, bairro, navio ou bicho,
e não abre porta nenhuma do mundo. O padrão (o mesmo do `qa/som.js` s9c, linha a linha, sem os comentários):

```js
// 53. "a cena de som só lê" (D-166)
src['audio-src.js'].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/\bG\.(R\(\)|rr\(|ri\(|pick\(|chance\(|shuffle\(|VR\(\)|vrr\(|vri\(|vpick\(|vchance\(|vshuffle\()/.test(c) || /Math\.random/.test(c)) fails.push(`som: audio-src.js:${k + 1} a cena de som sorteia (a cena é função do mundo e do ouvido; quem sorteia é o tocador, audio.js, do G.VR): ${l.trim().slice(0, 110)}`);
  if (/Urban\.(note|noteB|mourn|remember)\s*\(/.test(c) || /\b(Depot|D)\.(move|make|use|swap|store)\s*\(/.test(c) || /\bAct\.(start|end|join|leave|begin|commit|abort|pause|resume)\s*\(/.test(c) || /\b(setTask|endTask|Vg\.give)\s*\(/.test(c)) fails.push(`som: audio-src.js:${k + 1} a cena de som abre uma porta do mundo: ${l.trim().slice(0, 110)}`);
  if (/\b(v|b|op|q|s|a|set|f|S|G\.S|t)\.[A-Za-z_$][\w$]*(\[[^\]]*\])?\s*(=(?!=)|\+=|-=|\*=|\+\+|--)/.test(c)) fails.push(`som: audio-src.js:${k + 1} a cena de som escreve no mundo (v, b, op, q, s, a, set, f, S, t são as coisas do mundo neste arquivo; os objetos da cena chamam-se o, h, L): ${l.trim().slice(0, 110)}`);
});
```

**Regra 54 — «todo gesto tem a sua linha de som»** (D-166): todo gesto registrado no código — uma chave do `A.ANIM = { … }`
do `activity.js`, um `A.addAnim('nome', …)`, um `A.ANIM.nome = {` — tem uma linha com o mesmo nome na tabela `A.GESTO` do
`audio-src.js` (um som, ou `still('…')`: o silêncio dito). O padrão:

```js
// 54. "todo gesto tem a sua linha de som" (D-166)
{ const gestos = new Set(); const all = files.map(f => src[f].join('\n')).join('\n');
  for (const m of all.matchAll(/\baddAnim\('([A-Za-z]\w*)'/g)) gestos.add(m[1]);
  for (const m of all.matchAll(/\bA\.ANIM\.([A-Za-z]\w*)\s*=\s*\{/g)) gestos.add(m[1]);
  const tab = /A\.ANIM = \{([\s\S]*?)\n  \};/.exec(src['activity.js'].join('\n')); if (tab) for (const m of tab[1].matchAll(/^\s{4}([A-Za-z]\w*):\s*\{/gm)) gestos.add(m[1]);
  const som = /A\.GESTO = \{([\s\S]*?)\n  \};/.exec(src['audio-src.js'].join('\n')); const linhas = new Set(); if (som) for (const m of som[1].matchAll(/^\s{4}([A-Za-z]\w*):/gm)) linhas.add(m[1]);
  for (const g of gestos) if (!linhas.has(g)) fails.push(`som: o gesto «${g}» não tem linha na tabela gesto→som (A.GESTO, audio-src.js): um som da biblioteca, ou still('…') — o silêncio dito de propósito`);
}
```

(Rodei os dois padrões fora do `guard.js` — que não é meu para editar —, num arquivo que lê o `js/` como ele lê: no código de
hoje, «55 gestos lidos do código, 55 linhas na tabela» e nenhuma falha; na cópia da sabotagem t1 a regra 54 diz «o gesto
«forjar» não tem linha»; nas cópias n1 e n2 a regra 53 diz «a cena de som sorteia» e «a cena de som escreve no mundo». A
prova `qa/som.js` faz as duas contas em Node: s1a e s9c.)

## 5. Frases para o `CLAUDE.md` (nas fundações, depois de «A cidade — `G.Urban`»)

- **O que se ouve — `G.Audio.scene`** (`js/audio-src.js`, D-166 a D-169): o som é um sistema só em duas metades — a cena decide (pura: não escreve, não sorteia, a mesma para o mesmo mundo e o mesmo ouvido; o `guard.js` cobra, regra 53) e o `audio.js` toca. **Todo som de lugar tem dono**: uma pessoa num gesto, um prédio com a operação viva, um navio que anda, um bicho — nunca um enfeite. **Gesto novo chega com a sua linha na tabela gesto→som** (`G.Audio.GESTO`: um som da biblioteca do `audio.js`, ou `still('…')`, o silêncio dito de propósito; regra 54; o `qa/som.js` s1 cobra), e um ato novo de fora dos gestos (`v.act = '…'`) com a sua em `G.Audio.ATO`; o golpe que o mundo já toca na hora (`G.Audio.at` no passo) é silêncio dito, para não soar duas vezes. O ouvido é o corpo no Modo Encarnado e o meio da tela no Modo Deus (`G.Audio.ear`); a distância, o lado e as paredes saem de `G.Audio.hear`. O fundo do bairro é o hábito (a média lenta do `G.Urban`) vezes as mãos no trabalho agora — sem mãos, silêncio (`porto vazio não soa a porto`); a música tira a escala e o timbre do povo do chão e da época das artes dele (`G.Audio.musicOf`), nunca uma trilha por bairro. O `qa/som.js` prova em Node (onde nada toca: T-720); o `qa/audiorun.js` grava, no navegador, cada som de lugar e de quem ele vem.

E no item 3 do protocolo («Antes de cada commit»), depois de «Mexeu nas atividades…»: «Mexeu no som (`audio.js`,
`audio-src.js`), num gesto (`A.addAnim`) ou num ato novo de pessoa? Também `node qa/som.js` (`ONLY=s1,s2,s8` em segundos; a
prova inteira antes da versão).»

## 6. Resultados e o que ficou aberto

### O que rodei (tudo neste ramo, com a máquina cheia — carga de 15 a 25 em 4 núcleos)

- `node qa/som.js`: **34 passam, 0 falham** — `SOM: ok (364 s)`.
- `node qa/guard.js`: `PASSOU (151 arquivos)` (com o `audio-src.js` ainda fora da lista `LOOK`).
- `node qa/soak.js 103 continente 128 4 normal 5 1 1`: 5 anos, 0 violações, `erros: nenhum`.
- `node qa/det3.js 77 arquipelago 96 3 2`: `PASSOU` (sem quadros × com quadros, câmera, cinema e som: igual; o save carregado
  duas vezes: igual).
- `node qa/rngtrace.js 5`: 38 lugares, `erros: nenhum`; do acaso do mundo fora do passo, uma linha só e que não é do som
  (`nature.js:150 Nat.addCloud [poder]`, um ato do deus); do som, só `VISUAL dentro do mundo: audio.js nz` (o acaso do que só
  se ouve usado num golpe que o mundo toca: é o que deve ser).
- `MUNDO=metropole node qa/audiorun.js 7 60` (navegador, WebAudio de verdade, Modo Deus): `erros: nenhum`, verificador sem
  violação; `sons de lugar: 17 tocados (bark 7, sail 7, chant 3); com lado 13 … fontes sem dono: nenhuma`. O mundo pronto abre
  à meia-noite e a máquina dava poucos quadros (267 em 50 s): a rodada prova que o caminho de verdade toca sem erro, não a
  riqueza do dia — isso é a prova em Node.
- O custo da cena: 2,5 a 4,4 ms por olhada na «metrópole» e na «guerra mundial» de dia (com a máquina cheia) — 1 a 2% de um
  núcleo às 4 olhadas por segundo do tocador. A fase de desempenho da regressão não foi rodada (não era para rodar).
- Não rodei: a regressão inteira, o `prontos.js`, o `encarna.js`, o `qa/visual/*` (não mexi no 3D).

### As sabotagens (37; cada uma numa cópia nova do jogo, pelo `sab-run.sh`; o roteiro: `scratchpad/ag/S/sab-som.py`)

| nome | o que desfaz | quem acusou |
|---|---|---|
| t1 | um gesto sem linha (tira a do `forjar`) | s1a, s1b, verificador (`som-inv.js`) |
| t2 | uma linha com som fora da biblioteca | s1a, verificador |
| t3 | um silêncio sem motivo dito | s1a, verificador |
| t4 | um ato do mundo sem linha (a colheita) | s1c |
| c6 | quem está sentado em qualquer lugar soa a banho | s1d |
| d1 | nenhum lado | s2a |
| d2 | a direita e a esquerda do corpo trocadas | s2a |
| d3 | a distância não tira nada | s2b |
| w1 | nenhuma parede abafa | s2c |
| w2 | o céu aberto (a praça) é parede | s2c |
| k1 | a fonte fora do lugar de quem a faz | s3a, s10 |
| c4 | a forja com fornada toca a bigorna sem ninguém martelando | s4b, s3b |
| c2 | a taverna vazia murmura | s5b |
| c3 | o alaúde soa de quem só está sentado | s5c |
| m4 | o alaúde toca a escala comum, seja quem for | s5c |
| c5 | a fornalha das termas ronca apagada | s6a, s6b |
| c1 | o fundo do bairro soa sem mãos | s7b |
| f3 | a chuva não encobre | s7b |
| f1 | o hábito aos saltos (tudo no dia em que conta, nada no outro) | s7a |
| f2 | a mistura de quem ouve aos saltos | s7c |
| m1 | uma escala para todos os povos | s8a |
| m2 | a época não muda nada | s8a, s8b |
| m3 | uma trilha por bairro | s8b |
| n1 | a cena sorteia do acaso do mundo | s9a, s9b, s9c |
| n2 | a cena escreve numa pessoa | s9a, s9c |
| n3 | o tocador sorteia do acaso do mundo | s9a, s9b |
| n4 | a cena do mundo de antes fica depois do load | s9d |
| p1 | o tocador toca um som de ninguém | s9d |
| p2 | o mundo parado continua tocando os gestos | s9d |
| b1 | o fundo do bairro fala sem peso (sem hábito, sem mãos) | s9d |
| s1 | o mesmo mundo e o mesmo ouvido dão duas cenas | s11 |
| g1 | qualquer fogo do mundo estala (o L-740 desfeito) | s12 |
| a1 | o golpe do mundo sem lado nem parede | s12b |
| a2 | o golpe do mundo ouvido de qualquer distância | s12b |
| e1 | o ouvido nunca é o do corpo | s13 |
| e2 | o ouvido não vira com o olho | s13 |
| e3 | o ouvido fica onde o corpo foi tomado | s13 |

(A c6 passou sem ninguém acusar na primeira vez — na hora da prova ninguém estava sentado na cidade das termas —: virou o caso
s1d, que pergunta à regra sem depender de quem está sentado. Depois do último commit do código rodei as 37 de novo, cada uma
só com o caso dela (`ONLY`): todas acusadas, com os casos da tabela acima.)

### O que ficou aberto

1. **Ninguém ouviu.** São 42 sons novos sintetizados (o esforço de quem levanta, a caixa que pousa, a bigorna, o tear, a roda
   do oleiro, o barro, a água, o alaúde, a voz sem palavras, o pregão, o canto da reza, as palmas da dança, os bichos do
   curral…) e nenhum foi escutado por gente: os volumes e os timbres precisam do ouvido do dono. Cada um é uma linha
   (`audio.js`, a biblioteca; `audio-src.js`, o volume `v` e o alcance `alc` de cada gesto) — acertar é mexer num número.
2. **O Modo Encarnado no navegador não foi rodado por mim** (T-726): o ouvido do corpo está provado em Node com o modo e o
   olho de mentira (s13). A parte e11 do `encarna.js` e uma rodada à mão no corpo (andar pela cidade de dia, entrar na taverna
   à noite) ficam para a regressão e para o dono.
3. **L-741 (suspeita):** o corpo tomado dentro de casa sai à porta — a conferir no navegador; não é do som.
4. **O fundo do bairro com carga de verdade por dias** (T-721) fica para os mundos da geração 20: trocar a chave do s7a por
   `cais` num bairro de porto.
5. **Os golpes que o mundo toca dentro de um prédio** (uma briga de taverna) saem na posição da pessoa, que o mundo guarda à
   porta (L-217): da rua, a briga soa sem o abafado da parede. Os gestos não têm esse limite (a fonte sabe em que prédio está).
6. **O relógio de quatro olhadas por segundo:** um gesto cujo contato cai entre duas olhadas toca na olhada seguinte (até
   0,35 s depois); nas velocidades altas (8×, 16×) muitos gestos cabem entre duas olhadas e o intervalo mínimo por som segura o
   ritmo. Não há prova do instante exato do som — só de que ele toca, e de quem.
7. **O que não entrou de propósito** (D-169): passos, carroça, músico de praça, aplauso, timbre de murmúrio por povo, idioma.
8. **A `qa/MATRIZ.md`** (o `qa/matriz.js`) não lista o som de cada gesto: dá para acrescentar uma coluna lida do
   `G.Audio.GESTO` — não fiz (o arquivo é gerado e o gerador não é deste bloco).
9. **Os sons que já existiam e não são de lugar** (interface, poderes, histórias, a trompa da guerra) não mudaram; os de
   bichos selvagens que o ambiente tocava pela paisagem (pássaros, grilos, gaivotas, corujas, sapos, pela floresta, a costa e a
   noite à volta do ouvido) continuam sendo da paisagem, não de um bicho — os de curral e de rua passaram a ser de um bicho
   de verdade (`G.Audio.BICHO`). Unificar os dois é um passo seguinte, se o dono quiser «cada pio de um pássaro que existe».
