# Bloco R — o governante mora no palácio (Bairros Vivos; fecha a T-765, a lacuna «palácio/morar» da matriz)

Ramo: `worktree-agent-a7e917cb5eff7914d` (base `b2b61f0`). Números usados: **L-930; T-930 a T-938; D-205 a D-208; regras 71 e 72**
(livres: L-931 a L-949, T-939 a T-949, D-209).
Arquivos do jogo mexidos: `js/act-casa.js` (a porta de quem mora na sede: o bloco «the house of who rules»), `js/court.js` (a sede
é casa: os aposentos, a despensa, o painel, a regra dos lugares, o save de antes), `js/village.js` (**do agente M** — as linhas
exatas na seção 9), `js/activity.js`, `js/economy.js`, `js/act-compras.js`, `js/act-lar.js`, `js/trade.js` (uma linha cada: o
mesmo predicado), `js/int-monumentos.js`, `js/int-civicos.js`, `js/int-palacio.js` (as camas das plantas), `js/interact.js` (a
ficha do prédio), `js/ui.js` (a linha «Mora no palácio» da pessoa).
Arquivos novos: `qa/morar-palacio.js`, `qa/morar-palacio-inv.js`, este bloco. Folha da matriz mexida: `qa/categorias/p2.js`
(a ficha «palacio»). **Não mexi** no `js/polity.js` (o `Po.seat` e o `Po.forum` continuam como eram: a prova confere), nem no
motor das plantas (`interiors.js`, `int-familias.js`, `int-moveis.js`), nem no `js/forma-poder.js`.
Nenhum campo novo na pessoa (`SHAPE`), no prédio ou no povo: quem mora onde é lido do mundo a cada vez. Um relógio novo no
`G.mod` (no save): `casa.corte.<povo>`, o dia em que a família de quem governa foi chamada à capital.
**O catálogo das plantas não muda** (recalculei as 36 chaves do paço e as 72 dos palácios: iguais ao arquivo; `node
qa/catalogo.js confere 120` passa) — não há commit do catálogo.
**O mundo muda** (quem mora onde, de onde saem as refeições e as moedas de quem governa): os mundos prontos precisam ser gerados
de novo, e a linha de base refeita.

## 0. O que se mediu antes de mexer (os mundos prontos da geração 19)

Roteiros em `scratchpad/ag/R/` (`mede.js` quem governa, onde mora, que palácios há; `mede2.js` as camas, o fogo e a mesa de cada
sede por povo e degrau, pela mão do deus; `mede3.js` as camas do paço por povo, lado e família).

| mundo | sedes de pé na capital | quem governa morava |
|---|---|---|
| cidade | nenhuma | — |
| metrópole | nenhuma (o palácio de 24 m de Tenochtitlan a 22%) | dois dos cinco governantes moram **noutra cidade** do povo |
| megalópole | Mênfis: a casa do chefe (8 m); Roma: o grande palácio de 32 m | Mutemwia numa ínsula de 14; Ariadne em **Delfos**, numa casa |
| guerra mundial | Hedeby: o palácio de 24 m; Argos: a casa do chefe | Ulf numa casa de Hedeby; Irene num sobrado |

- Um palácio não era prédio de morar (`BDEF.housing` não existe nele), e «morar» passa por uns quarenta lugares do código que
  leem `BDEF.housing` (o repartidor de casas, a compra, o aluguel, a troca da terra cara, os impostos, o ladrão, as hortas, as
  classes da cidade…): dar `housing` ao palácio punha estranhos dentro dele em todos; e muitos lugares escrevem em
  `'h:' + v.home` sem perguntar nada (o soldo, o segredo, a comissão do mercador): `v.home` num prédio sem depósito de casa
  perdia tudo isso em silêncio.
- **As plantas**: os palácios pela forma já tinham aposentos com cama de casal e arca, cozinha com fogo, mesa e jarros (12 a 16
  lugares de dormir; o nórdico, de salão, 4 a 6 contando os dois catres da guarda). **O paço — «a casa de quem governa», diz a
  descrição dele — não tinha cama em nenhum povo** (L-930).

## 1. O que foi feito (os itens da tarefa, na ordem)

| item | estado | prova |
|---|---|---|
| 1. Ler o que existe | feito (seção 0) | — |
| 2. O governante mora no palácio | **feito e provado**: a entrada, a troca de governante (eleição, morte, conquista; o golpe e a herança são a mesma porta: `P.crown`), a sede que cai, queima, é desfeita ou ampliada, a casa de antes, a bandeira dos mercadores, as moedas, a despensa e os guardados, o corpo do deus | `qa/morar-palacio.js` m0, m1, m3 a m7, m9, m12 a m14 |
| 3. A vida no palácio | **feito e provado** em Node (dormem, comem, acordam; o trono na audiência; `Po.seat` igual). As provas visuais: só rodei as de Node (seção 8); a fumaça da cozinha da sede fica aberta (T-931) | m2; `qa/visual/corpo-casa.js` |
| 4. A tela | **feito**: o painel da sede, a linha da pessoa, a ficha do prédio do corpo pelo que o personagem sabe (D-208). A linha da pessoa (`ui.js`) não tem prova em Node (T-937) | m11 |
| 5. A prova, as invariantes, a folha da matriz, as sabotagens | **feito**: 33 sabotagens, 32 acusadas (a 33ª, o tributo, sem prova: T-930) | seções 4 e 8 |
| 6. T-763 (a oferta da casa rica ao corpo) | **não feito** (não comecei; junto fica aberta a oferta de mudar para a sede: T-932) | — |
| além do pedido | quem governa e mora noutra cidade do povo vem para a capital (D-207) — sem isso o grande palácio de Roma da megalópole ficava vazio | m8 |

## 2. O que mudou no mundo

- **Quem mora na sede**: quem governa o povo, o par, os filhos de um ou de outro que moram com eles e não têm par (de qualquer
  idade) e os pequenos desses filhos. Entram quando a sede fica pronta (na hora), ou até dois segundos de mundo depois de uma
  coroação; saem quando outro governa (e não são da família dele), quando a sede cai, é desfeita ou entra em obra de ampliação
  (antes de ela deixar de ser casa), e voltam quando ela fica de pé de novo.
- **Nos mundos prontos da geração 19, ao abrir e viver 12 segundos** (`m0`): megalópole — Mutemwia na Casa do Nomarca de
  Mênfis; Ariadne, Creonte, Jasão, Sabina e Aulo, vindos de Delfos, no grande palácio de Roma (32 m); guerra mundial — Ulf,
  Astrid e Snorri no palácio de Hedeby (24 m), Irene na Casa do Basileu de Argos. Metrópole e cidade: nenhuma sede de pé numa
  capital (o palácio de Tenochtitlan está em obra; quando ficar pronto, a família entra).
- **A vida** (metrópole, o palácio de 24 m de Mênfis pela mão do deus, um dia e um quarto): os seis da casa dormiram nela (45 a
  120 s cada, em camas de casal), acordaram nela, fizeram 5 refeições da despensa dela pelo livro; Tiye sentou no trono na
  audiência. Na guerra mundial (2 dias): Ulf ceou à mesa do palácio, dormiu na cama de casal; Snorri num catre da guarda.
- **As moedas, a despensa e os bens** vão com a família pelo livro («mudança»), nos dois sentidos; o salário, a comissão, o
  soldo e as compras de quem mora na sede caem na sede (`'h:'`); o tributo do chefe (povos sem moeda) cai na despensa dela, e
  a corte «abstrata» só come dela quando ninguém mora ali.
- **A casa de antes** continua da família (dono), vazia ou com quem ficou; alugada pelo dia da cidade a quem precisa (D-159),
  como toda casa que o dono deixa. Quem sai da sede volta para ela se couber.
- **Uma mudança de cidade nova**: a família do governante eleito noutra cidade do povo migra para a capital (D-207).

## 3. As linhas do AUDIT (prontas para colar)

| D-205 | decisão (do agente R, nos Bairros Vivos; fecha a T-765, com as D-206 a D-208) | **A sede é a casa de quem governa.** O palácio não era prédio de morar, e «morar» passa por uns quarenta lugares que leem `BDEF.housing` (o repartidor de casas, a compra e o aluguel, a troca da terra cara, os impostos, o ladrão, as hortas, as classes da cidade): dar `housing` ao palácio punha estranhos nele em todos; e deixar `v.home` num prédio sem depósito de casa perdia o que tantos lugares escrevem em `'h:' + v.home` sem perguntar (o soldo, a comissão, o segredo). Decidido: as quatro sedes (`paco`, `palacio`, `grande_palacio`, `palacio_colossal`) têm **aposentos** (`BDEF.aposentos`, dado só pelo `court.js`: 6, 10, 14, 18), lidos por uma função só, `G.Village.bedsOf(b)` (as camas de um prédio onde uma casa mora: `housing` ou `aposentos`). Por ela: (1) a sede de pé **vale para morar** pela regra única (`V.livable`: dormir em casa, a noite em casa, a água, o abrigo da tempestade, o bebê); (2) **guarda como uma casa** no `G.Depot` (`'h:'`: a despensa, as moedas, os bens nos móveis de casa da planta dela — as arcas e os jarros, D-053 —, nunca `'b:'`): o tributo do chefe cai na despensa da sede (`court.js`), a corte «abstrata» só come dela quando ninguém mora ali, e um save de antes (o tributo em `b.inv.food`) vira a despensa ao abrir; (3) a economia e as compras de quem mora nela são as dela (`E.homeOf`, `G.Compras.list`); (4) **nenhuma porta das casas da cidade a enxerga** — todas leem `BDEF.housing`: ninguém a compra, aluga, recebe do povo, troca, tem dono, paga imposto nela nem a rouba; o repartidor de casas (`assignHousing`) guarda nela a casa que mora ali (os filhos, o par que chega), nunca a oferece a quem não tem casa, nunca a esvazia dos crescidos, e quem mora nela não sai para a casa do par; (5) a regra dos lugares da planta (`In.placeRule('palacio' / 'paco')`, `court.js`) é a da audiência e, para quem mora ali, a da casa (`G.Lar.want`): a cama da pessoa pela partilha das camas da casa (`In.bedOf`), a mesa, o fogo. As plantas: L-930. O que ficou de fora: a fumaça da cozinha (T-931), o consumo dos bens da casa (T-933). Provas: `qa/morar-palacio.js` m1, m2, m5, m9, m12, m13; as regras P1, P4, P5 e P6 do `qa/morar-palacio-inv.js`. Sabotagens s4 a s8, s11 a s15 (seção 8 do bloco R). |
| D-206 | decisão (do agente R) | **Quem mora na sede, quem entra e quem sai.** Só o `act-casa.js` põe e tira gente da sede (`G.Casa.reign`), a cada dois segundos do mundo e na hora em que uma sede fica pronta, cai (`destroyBuilding`), é desfeita (`removeBuilding`) ou entra em obra de ampliação (`V.enlarge`) — nesses três, antes, enquanto ela ainda é casa. **A sede** de um povo é a melhor de pé na capital (`G.Court.seatOf`: o colossal, o grande palácio, o palácio, a casa do chefe; entre iguais, a mais antiga). **Entra** quem governa com a casa dele (`G.Casa.court`): o par e os filhos de um ou de outro que moram com eles e não têm par — de qualquer idade; o filho casado fica com a casa que fez — e os pequenos desses filhos; sempre inteira, com a parte dela da despensa, dos bens e das moedas pelo livro («mudança», a regra de toda mudança). **Pode morar** (`G.Casa.ofCourt`) a família de quem governa e a do par — pais, irmãos, filhos —, quem é casado com um deles e os filhos deles (os netos, os sobrinhos; os dos mortos também): a rainha-mãe e os irmãos do herdeiro ficam; o par que chega e o bebê que nasce entram pelo repartidor de casas. **Sai** quem mora numa sede que não é a do governante do povo ou não é da família dele — a família de antes depois de uma eleição, um golpe ou uma morte sem herdeiro da casa; a de uma capital tomada na guerra —, para: a casa que é dela na cidade, se couber; senão uma casa vazia do povo; senão a casa da cidade com mais lugar (a regra do repartidor; o aluguel ao dono como o dia da cidade o marca, `K.lease`, D-159); senão a rua, com as moedas da parte dela no bolso do mais velho. A casa de antes continua da família (o dono não muda; vazia, é alugada pelo dia da cidade como toda casa que o dono deixa); a casa que a família tinha pago e fica pronta com ela na sede é dela e ninguém sai da sede por ela; a **bandeira dos mercadores** vai com a família para a sede e volta com ela (`trade.js`, `homeOK` pelo `V.bedsOf`: D-158). **Nunca a família do corpo do deus**, nem para dentro nem para fora (D-098, L-452): a causa fica dita (`K.seatState`: «corpo»). Nada é guardado: quem deve morar onde é lido do mundo a cada vez, igual depois de um load. Provas: `qa/morar-palacio.js` m1, m3, m4, m6, m7, m9, m12, m14; as regras P2 e P3. Sabotagens s1 a s3, s17 a s21, s26 a s28, s30. |
| D-207 | decisão (do agente R; além do pedido, dita aqui) | **Quem governa mora na capital.** Medido: dois dos cinco governantes da metrópole e dois dos quatro da megalópole moram noutra cidade do povo (a escolha e a eleição olham o povo inteiro) — o grande palácio de 32 m de Roma ficaria vazio, e Ariadne governaria de uma casa em Delfos. Decidido (`act-casa.js`, `call`): com uma sede de pé na capital, a família de quem governa noutra cidade do povo **vem para a capital** — a casa dela passa a ser a sede e cada um migra a pé (a tarefa `migrate`, como o casamento real e os fundadores) —, só quando a cidade pode mandar cada um (`G.Vg.canSend`: nunca o corpo do deus, o preso, quem está a bordo, na mão do deus, o soldado, o emissário, quem está no meio de uma operação), a família inteira, por terra (`W.reachesTown`), uma vez por dia (`G.mod('casa.corte.<povo>')`, no save). Sem poder, espera, e a causa fica dita (`K.seatState`: «ocupado», «sem caminho», «chamado»). A casa de antes, na outra cidade, continua dela. Quem deixa a sede depois fica na capital. Na megalópole da geração 19: Ariadne, Creonte, Jasão, Sabina e Aulo saem de Delfos e chegam a Roma (5 de 5 a menos de 30 casas do meio em 240 s). O que não resolve: a capital sem caminho por terra (T-935). Prova: `qa/morar-palacio.js` m8, m0. Sabotagens s22, s23. |
| D-208 | decisão (do agente R) | **Onde mora quem governa é fama da cidade.** A ficha do prédio do corpo (`interact.js`, `buildingCard`) mostra quem mora numa sede como numa casa — os nomes que quem lê sabe dizer, os outros contados — e a linha «Casa de quem governa»: pelo nome a quem pode dizê-lo (a porta `G.Possess.knows.person`: quem governa o próprio povo é conhecido pela fama), a quem não pode, o que ela é («quem governa Mênfis», ou «quem governa aqui» a quem nem a cidade sabe dizer); as moedas da sede só a quem mora nela (`K.house`). Nada novo no `possess.js`: nenhuma escrita, nenhuma porta nova. O painel do deus (`G.Casa.seatSays`, pelo `E.buildingHTML` do `court.js`): quem mora, cada um onde está e por quê, ou por que ninguém mora («está em obras», «não é a sede do governo», «mora noutra cidade do povo»…) — pedido de fora do passo, não pergunta ao mapa de alcance. A pessoa: «Mora no Palácio do Faraó» (`ui.js`). Prova: `qa/morar-palacio.js` m11. Sabotagens s24, s25. |
| L-930 | bug (consertado nos Bairros Vivos, R; achado ao medir as plantas das sedes) | **A casa de quem governa não tinha cama.** O paço — «A casa de quem governa: um pouco maior que as outras», diz a descrição dele — não tinha lugar de dormir em nenhum dos seis povos: o salão da forma (`int-monumentos.js`, `pacoFurnish`) punha o assento, o fogo, quatro bancos, a mesa e a arca, e as famílias da receita (`int-civicos.js`, `hallFurnish`) também. E o palácio nórdico pela forma, de 24 m, tinha uma cama de casal só (os de 32 e 40 m, duas). Conserto: no salão do chefe, a cama dele (de casal; de solteiro onde não cabe) encostada numa parede e a arca logo depois dos dois primeiros bancos — antes dos outros dois bancos e da mesa, que ficavam com o lugar —, e mais uma cama onde couber; nas famílias da receita, a cama num cômodo ou no salão; nos palácios pela forma (`int-palacio.js`), uma segunda cama em cada aposento onde cabe. Todas opcionais (`P.opt` + `P.place`): nenhuma planta deixa de valer, e o catálogo não muda. Depois: o paço com 2 lugares de cama nos cinco povos da metrópole (3 no nórdico; a família da forma, nos quatro lados: 1 a 3), os palácios de 24, 32 e 40 m com 15, 18 e 21 (o nórdico 3, 6 e 6, mais os dois catres da guarda). Prova: `qa/morar-palacio.js` m10 (cada sede de cada povo: cama, fogo, onde comer, onde guardar); `qa/palacios.js` e `qa/plantas.js` passam. Sabotagens s9 (a cama do chefe) e s10 (a segunda cama). |
| T-930 | limite de prova (aberto) | **O tributo na despensa da sede não tem prova de mundo.** Num povo sem moeda o cobrador leva o tributo à casa do chefe, que passou a guardar como casa (`'h:'`, D-205): a linha do destino (`court.js`, `tributeTask`) não é exercida por prova nenhuma — os mundos prontos têm todos a moeda, e montar um povo sem ela com chefia, coletoria e cobrador pedia um caso próprio. A sabotagem s31 (o destino de volta a `'b:'`) passa. O que a prova cobre do mesmo assunto: a despensa da sede vale como a de uma casa, a corte só come dela sem ninguém morando, e um save de antes vira a despensa (m13, m5g). |
| T-931 | limite (aberto) | **A cozinha da sede não fuma.** `G.Atmos.fire` só dá a fumaça da cozinha e da lareira a um prédio de `BDEF.housing` (e as regras do `atmos-inv.js`, juntadas ao `qa.js`, conferem a mesma causa); a janela acesa com gente acordada dentro vale para a sede (`G.Atmos.lit` não olha o tipo). Para fechar: a causa «cozinha/lareira» pelo `V.bedsOf` no `atmos.js` e na regra do `atmos-inv.js`, com o `qa/atmosfera.js`. |
| T-932 | limite (aberto; com a T-763) | **O corpo do deus não tem a oferta de mudar para a sede.** A família do corpo é do jogador para decidir (D-098, L-452): o mundo não a muda para a sede nem a tira dela, e a causa fica dita no painel — mas o jogador não tem a porta para fazê-lo (um ato diante da sede, como o `casa.encomendar`). Não comecei, nem a T-763. |
| T-933 | limite (aberto) | **A sede não gasta os bens da casa.** O consumo dos bens (`economy.js`, `houseTick`: o tecido, a cerâmica, as joias, o couro, e o «bem-estar» `h.well`) corre só nos prédios de `BDEF.housing`: a família da sede compra o que falta e não gasta. Deixei assim de propósito (uma linha a mais num arquivo que não é meu, com as suas provas); os impostos e o tributo não baterem à porta da sede é decisão (D-205). |
| T-934 | limite (aberto; proposta ao agente G) | **As camas da sede são repartidas como as de uma casa.** A partilha (`In.beds`, do motor das plantas) dá primeiro as camas de casal, por ordem de pavimento: o viúvo e a filha crescida dividem a cama de casal (como numa casa), e quando os aposentos acabam a família toma os catres da guarda (no palácio nórdico de 24 m: Ulf e Astrid na cama de casal, Snorri num catre). O palácio antigo de 12 m (o degrau de legado) tem uma cama de casal para a casa inteira: quem sobra dorme no chão, deitado. Proposta, no `In.beds` (`interiors.js`), depois de montar `places`: `if (!G.BDEF[b.type].housing) places.sort((a, c) => (roomFn(c) === 'aposento') - (roomFn(a) === 'aposento') || c.n - a.n || …)` — as camas dos aposentos antes das outras numa sede. |
| T-935 | limite (aberto) | **A capital sem caminho por terra, e os que ficam.** A família de quem governa noutra cidade só vem a pé (D-207): numa capital de ilha fica onde está, com a causa dita («sem caminho»), e a sede vazia. E quem deixa a sede depois de ter vindo de outra cidade fica na capital (numa casa dela, ou na rua até a cidade lhe dar uma): não volta para a casa que tinha na outra cidade, que continua dela. |
| T-936 | limite de teste (aberto, de antes; não é deste bloco) | **O `casa-mercante` k7 falha na base.** «a bandeira de Cuauhtémoc nas paredes de house#2938, onde mora Khufu: o verificador acusa […]; depois do dia da cidade SEGUE ali e está na casa de Cuauhtémoc» — palavra por palavra igual no `b2b61f0` (exportado em `scratchpad/ag/R/base/`, `ONLY=k7 node casa-mercante.js`) e no ramo; a rodada inteira no ramo: 8 passam, só o k7 falha. Não mexi. |
| T-937 | limite de prova (aberto) | **A linha «Mora no palácio» da pessoa e o painel do deus não rodam em Node.** O `ui.js` desenha num DOM que o `nodemundo` finge; a prova confere o texto do painel da sede (`G.Casa.seatSays`) e a ficha do corpo (`I.buildingCard`), não a linha de estado da pessoa. Não rodei as provas de navegador da tela (`qa/sabe-tela.js`), nem `qa/visual/interior3d.js`. |
| T-938 | limite de medida | **O efeito sobre as histórias não foi medido em vidas longas.** Rodei a vida curta (5 anos, sem sede), a fumaça dos três mundos com sede (2 anos de salto cada, verificador limpo) e o `det3`; não a regressão nem décadas de salto com sedes: uma eleição a cada 3 a 6 anos muda uma família de casa (e de cidade, D-207), e as casas da capital recebem quem deixa a sede. A regressão do líder mede. |

## 4. As linhas do README (prontas para colar)

| `morar-palacio.js` | `[ONLY=m1,m3] [MUNDO=metropole] node morar-palacio.js` (≈ 4,5 min) | Quem governa mora na sede (T-765; D-205 a D-208), em Node: os mundos prontos — as sedes de pé na capital e quem mora nelas (m0); a sede pela mão do deus — em obra ninguém entra, pronta a casa de quem governa entra na hora com o que é seu pelo livro, a casa de antes continua dela (m1); um dia e um quarto de vida — dormem nas camas dela, comem da despensa, acordam nela, `Po.seat` igual, o trono na audiência (m2); a eleição, a morte e a conquista da capital (m3); o fogo, a mão do deus e a ampliação: a família sai antes com as moedas e volta (m4); o save no meio, o mesmo futuro duas vezes, o save entre a coroação e a mudança, quem dorme na sede, um save de antes (m5); o corpo do deus (m6); o preso, o cativo, quem está na mão do deus (m7); quem governa de outra cidade vem para a capital, ou espera com a causa dita (m8); o estranho posto na sede sai, a sede de ninguém nunca é oferecida (m9); as plantas de cada sede de cada povo: cama, fogo, onde comer, onde guardar (m10); o painel e a ficha do prédio pelo que o personagem sabe (m11); a casa maior que as camas, o par que chega, a casa encomendada (m12); as moedas, as compras e a despensa — da corte sem ninguém, da família com ela (m13); a bandeira dos mercadores vai e volta (m14); o verificador acusa com a porta fechada pela mão da prova (m15). Cobre `act-casa.js` (`K.reign`, `K.court`, `K.ofCourt`, `K.seatState`), `court.js` (`Co.seatOf`, os aposentos, a despensa), `village.js` (`V.bedsOf`, `V.livable`, `assignHousing`), `activity.js` (`'h:'`), `int-monumentos.js` / `int-civicos.js` / `int-palacio.js` (as camas), `interact.js` (a ficha). |
| `morar-palacio-inv.js` | (carregado pela prova: `M.load({ qa: true, extra: ['qa/morar-palacio-inv.js'] })`) | As invariantes do bloco R, para o `junta-inv.js` juntar ao `qa.js`: P1 só se mora num prédio de morar (uma casa ou uma sede); P2 quem mora numa sede é da família de quem governa o povo dela, e a sede é a do povo; P3 quem governa um povo com sede de pé na capital mora nela, ou a causa está dita no mundo (o corpo do deus, outra cidade sem caminho, alguém que não pode partir, chamado hoje); P4 ninguém mora numa sede em obra ou caída; P5 a sede não tem dono, aluguel, encomenda nem poupança; P6 quem mora na sede não «precisa de casa». P2, P3 e P4 só acusam o que dura mais de 8 s do relógio do mundo (a porta roda a cada 2 s). O parentesco é conferido ali, por conta própria. |

## 5. As entradas do `regress.sh` (fase «fundacao», na linha dos Bairros Vivos)

```
F morar-palacio morar-palacio.js;
```

(em Node, sem navegador; ≈ 4,5 min.) E, mexendo na sede, na casa de quem governa ou nas plantas dela, no `CLAUDE.md` (protocolo, item 3): «Mexeu
na sede de quem governa (`act-casa.js` `K.reign`, `court.js`, as plantas do paço e dos palácios, `V.bedsOf`)? Também `node
qa/morar-palacio.js` (`ONLY=m1,m3,m9` em um minuto).»

## 6. As regras novas do `guard.js` (71 e 72, prontas para colar)

```js
// 71. "os aposentos da sede têm uma porta só" (D-205): as camas da sede de quem governa (BDEF.aposentos) só o js/court.js dá e
// só o js/village.js lê (V.bedsOf: as camas de um prédio onde uma casa mora); quem quer saber se um prédio vale para morar
// pergunta a V.livable, se guarda como casa, a V.bedsOf — e as portas das casas da cidade continuam lendo BDEF.housing
for (const f of files) if (f !== 'village.js' && f !== 'court.js') src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/\.aposentos\b/.test(c)) fails.push(`sede: ${f}:${k + 1} lê os aposentos da sede fora de village.js (V.bedsOf) e court.js (D-205): ${l.trim().slice(0, 110)}`); });
// 72. "quem mora na sede é do act-casa.js" (D-206): só o js/act-casa.js põe e tira gente da sede de quem governa — a porta
// G.Casa.reign (a cada dois segundos do mundo) e G.Casa.vacate (a sede que cai, é desfeita ou entra em obra) não são chamadas
// de fora dele; quem quer saber pergunta a G.Casa.seatState / lordOf / isSeat / ofCourt (só leem)
for (const f of files) if (f !== 'act-casa.js') src[f].forEach((l, k) => { const c = l.replace(/(^|\s)\/\/\s.*$/, '');
  if (/Casa\.(reign|vacate)\s*\(/.test(c)) fails.push(`sede: ${f}:${k + 1} põe ou tira gente da sede fora de act-casa.js (D-206): ${l.trim().slice(0, 110)}`); });
```

Conferidas contra o `js/` do ramo com os mesmos padrões (em `grep` e em Python): nenhuma acusação no ramo (`.aposentos` só em
`court.js` e `village.js`; `Casa.reign(` / `Casa.vacate(` em arquivo nenhum de fora); linhas plantadas em memória — `if
(G.BDEF[b.type].aposentos) continue;` no `social.js`, `G.Casa.reign();` no `polity.js`, `G.Casa.vacate(b, 'obra');` no
`village.js` — acusadas; um comentário com `BDEF.aposentos` e `G.Casa.seatState(f)` no `ui.js`, não. **Não rodei o `guard.js`
com as regras coladas** (não edito o `guard.js`).

## 7. As frases do CLAUDE.md (a fundação nova)

- **A sede é a casa de quem governa — `G.Village.bedsOf` / `G.Court.seatOf` / `G.Casa.reign`** (`js/village.js`,
  `js/court.js`, `js/act-casa.js`; D-205 a D-207): as quatro sedes (a casa do chefe, o palácio, o grande palácio, o colossal)
  têm aposentos (`BDEF.aposentos`, que só o `court.js` dá e só o `V.bedsOf` lê — o `guard.js` cobra, regra 71): a sede de pé
  vale para morar (`V.livable`) e guarda como uma casa (`'h:'` no `G.Depot`: a despensa, as moedas, os bens). **Nenhuma porta
  das casas da cidade a enxerga**: essas leem `BDEF.housing` — código novo que oferece, vende, aluga, tributa ou conta «casas»
  continua lendo `BDEF.housing`; código novo que pergunta «este prédio guarda como casa?» ou «alguém mora aqui?» pergunta ao
  `V.bedsOf` / `V.livable`. **Quem mora nela é só do `act-casa.js`** (`G.Casa.reign`, a cada dois segundos do mundo e quando
  uma sede fica pronta, cai, é desfeita ou entra em obra; regra 72): quem governa o povo, com a casa dele (`G.Casa.court`),
  na melhor sede de pé da capital (`G.Court.seatOf`); quem não é da família dele (`G.Casa.ofCourt`) sai — para a casa que
  tinha, uma casa do povo, a casa com mais lugar —, sempre com o que é seu pelo livro («mudança»); o governante de outra
  cidade do povo vem para a capital (só quem a cidade pode mandar, `G.Vg.canSend`, por terra). Nunca a família do corpo do
  deus. Nada é guardado: quem mora onde é lido do mundo. Quem muda o governante, a capital ou o povo de uma cidade não chama
  nada: a porta vê. Para perguntar: `G.Casa.isSeat(b)`, `G.Casa.lordOf(b)`, `G.Casa.seatState(f)` (com a causa dita quando
  quem governa não mora nela). `qa/morar-palacio.js` prova.

## 8. As provas e as sabotagens (o que rodei, com o código final do ramo)

**A prova nova** (de dentro de `qa/`, um `node` de cada vez): `node morar-palacio.js` — **97 passam, 0 falham** (≈ 4 min 10 s;
a rodada inteira depois dos últimos ajustes: ver a tabela das vizinhas).

**As provas vizinhas** (as duas rodadas em `scratchpad/ag/R/viz1/` e `viz2/`):

| prova | resultado |
|---|---|
| `node guard.js` | PASSOU (156 arquivos) |
| `bash navegador.sh node soak.js 103 continente 128 4 normal 5 1 1` | 5 anos, violações 0, erros: nenhum (rodada com o núcleo; a rodada final: ver abaixo) |
| `node matriz-predios.js` (saída no rascunho, não no repositório) | PASSOU: 12 categorias, 56 tipos, 4 folhas; **Palácios: funcional, 1/1 essenciais, 0 lacunas** (a lacuna «palácio/morar» fechada pelo cálculo: as peças `cama-casal` e `arca`, os usos `deitar`, `comer`, `cozinhar`, `guardar` nas plantas de amostra, a tarefa `sleep`, a prova no disco); no total, 1 lacuna (de outra categoria, de antes) |
| `node casa.js` | 24 passam, 0 falham |
| `node casa-rica.js` | 48 passam, 0 falham |
| `node casa-mercante.js` | 8 passam, **1 falha: k7 — igual na base** (T-936) |
| `node juntar.js` | 24 passam, 0 falham |
| `ONLY=e0,e7,e8,e9,e10,e22 node escala.js` | 37 passam, 0 falham (o e8: o palácio que cresce; o e22: a audiência, o voto e o pão) |
| `node sabe.js` | 32 passam, 0 falham |
| `node moedas.js` | 9 passam, 0 falham |
| `node civicos.js` | 33 passam, 0 falham |
| `node nodemundo.js metropole 2` / `mega 2` / `mundial 2` | PASSOU os três (abrir, viver, 2 anos de salto, salvar e carregar, verificador) |
| `node catalogo.js confere 120` | PASSOU (121 linhas); mais as 36 chaves do paço e as 72 dos palácios recalculadas (`catalogo.js parte … tudo paco` e `… palacio grande_palacio palacio_colossal`): iguais ao arquivo |
| `node palacios.js` | TUDO PASSOU |
| `node morar-palacio.js` (inteira, com o código final) | **97 passam, 0 falham** (206 s) |
| `node monumental-poder.js` | 61 passam, 0 falham |
| `node interiores.js` | 9 passam, 0 falham |
| `node relento.js` | 4 passam, 0 falham |
| `node lar-puro.js` | 38 passam, 0 falham |
| `node fundadores.js` | 6 passam, 0 falham |
| `node compras.js` | 19 passam, 0 falham (823 s, com a máquina ocupada) |
| `node atmosfera.js` | 10 passam, 0 falham |
| `node visual/corpo-casa.js` | 19 passam, 0 falham |
| `node lar.js`, `node plantas.js` | **em curso quando esta linha foi escrita: ver o fim desta seção** |

**As sabotagens** (`scratchpad/ag/R/sab-R.py`, cada uma numa cópia nova do jogo, `scratchpad/bv/sab-run.sh`; 33; o resumo em
`scratchpad/ag/R/sab/resumo.txt`):

| sabotagem | o que estraga | acusada por |
|---|---|---|
| s1 | quem governa nunca entra na sede da própria cidade | m0z, m1c, m1d, m1f |
| s2 | ninguém sai de uma sede | m3c, m3d, m3f, m3h, m9b, m9f |
| s3 | a família entra sem as coisas dela (sem o livro) | m1d |
| s4 | a sede não vale para morar (`V.livable`) | m1c, m1d, m1f |
| s5 | a sede não guarda como casa no depósito (`'h:'`) | m1d, m1e |
| s6 | o repartidor de casas oferece a sede a quem não tem casa | m9e (não acusava: as outras casas tinham mais lugar e a porta tirava o intruso antes do fim do caso; o caso passou a dar 60 camas à sede de ninguém e a olhar passo a passo) |
| s7 | o repartidor esvazia a sede cheia demais dos crescidos | m12b, m12d |
| s8 | quem é da sede sai para a casa do par | m12d (não acusava: o par, mais velho, era olhado primeiro e vinha para a sede; o caso passou a escolher um par olhado depois) |
| s9 | sem cama no salão do chefe | m10 |
| s10 | sem a segunda cama nos aposentos | m10 |
| s11 | a corte come a despensa da família que mora na sede | m13d |
| s12 | um save de antes guarda o tributo na prateleira | m5g |
| s13 | quem dorme na sede é posto à porta pelo save | m5f |
| s14 | a economia não vê a sede como a casa de quem mora nela | m13b |
| s15 | a casa da sede não compra nada | m13b |
| s16 | a bandeira dos mercadores não segue a família | m14b, m14d |
| s17 | a casa encomendada tira a família da sede | m12f |
| s18 | a sede cai com a família dentro | m4b |
| s19 | a sede vira obra com a família dentro | m4h |
| s20 | o deus desfaz a sede com a família dentro | m4e |
| s21 | o mundo muda a família do corpo do deus | m6c, m6f |
| s22 | quem governa de outra cidade nunca é chamado | m8d, m8e |
| s23 | a família é chamada mesmo com alguém que não pode partir | m8b |
| s24 | a ficha da sede não diz de quem é a casa | m11c, m11d, m11e |
| s25 | a ficha diz o nome de quem governa a qualquer um | m11d |
| s26 | a sede pronta não é olhada na hora | m1c, m1d |
| s27 | a porta só é perguntada quando uma sede fica pronta | m3c, m3d, m3h, m9b |
| s28 | só quem governa é «da família» | m1f |
| s29 | as regras do verificador nunca acusam (a espera sem fim) | m15b |
| s30 | quem sai da sede não volta para a casa que tinha | m3c |
| **s31** | o tributo vai para a prateleira do prédio | **nenhuma prova acusa** (T-930) |
| s32 | o verificador não vê a casa que não é casa (P1) | m15b |
| s33 | a sede pode ter dono para o verificador (P5) | m15b |

## 9. As linhas em arquivos de outros agentes (exatamente onde)

**`js/village.js` (do agente M)** — sete linhas de código em quatro lugares, nenhuma no planejador, na obra ou na terra:
1. `V.keptGone`: `const home = V.bedsOf(b) > 0;` (era `!!(G.BDEF[b.type] && G.BDEF[b.type].housing)`): o que a sede guarda é
   baixado pelo depósito de casa quando ela cai ou é largada.
2. Antes do `V.livable`: a função nova `V.bedsOf = b => { const d = b && G.BDEF[b.type]; return d ? d.housing || d.aposentos || 0 : 0; };`
   e `V.livable = b => !!b && b.type !== 'ruin' && V.bedsOf(b) > 0 && (b.built || !!b.upgradeFrom);`.
3. `V.destroyBuilding` e o abandono de uma cidade (as duas linhas iguais das moedas da casa que cai):
   `if (V.bedsOf(b) > 0 && (b.coin || 0) > 0 && G.Depot) G.Depot.use('h:' + b.id, 'moedas', …)`.
4. `assignHousing`: `const space = b => V.bedsOf(b) - b.res; const common = b => !!G.BDEF[b.type].housing;`; o `findHome` só
   oferece `common(b)`; no par, `const seated = v.home && byId.get(v.home) && !common(byId.get(v.home));` e `&& !seated` na
   condição de ir morar com o par; na saída dos crescidos da casa cheia, `if (!b.built || !common(b) || space(b) >= 0) continue;`.

**`js/trade.js` (do líder, D-158)**: `const homeOK = b => !!(b && b.built && G.Village.bedsOf(b) > 0);` (uma linha: a bandeira
segue a família para a sede e volta).
**`qa/categorias/p2.js`**: a atividade «morar» da ficha «palacio» (feita, com as peças, os usos, a tarefa e a prova) e a nota.

**Sobre a junção do ramo do G (o motor das plantas)**: as camas novas são todas opcionais (`P.opt` + `P.place`: o próprio
colocador do motor) — a cama e a arca do salão do chefe, a segunda cama dos aposentos; nenhuma é posta por coordenada
(`P.at`), nenhuma planta depende de uma peça ficar onde o corpo não cabe. Com o `P.put` mais estrito, onde a cama não couber
com o corpo ao lado ela deixa de ser posta e a planta continua valendo; o **m10** da prova dirá em que povo faltou (pede 1
lugar de cama no paço e 3 em cada palácio: o nórdico de 24 m tem exatamente 3). Se faltar no paço de algum povo, a família
dorme no chão do salão (deitada: o repartidor) — é o que acontecia com Irene em Argos antes das camas. O catálogo: as minhas
mudanças não alteram chave nenhuma na base; o líder o gera de novo de qualquer forma.

## 10. O que ficou aberto

- **T-930** o tributo na despensa da sede sem prova de mundo (a sabotagem s31 passa).
- **T-931** a cozinha da sede não fuma (`G.Atmos.fire` lê `BDEF.housing`).
- **T-932** a oferta ao corpo do deus para mudar para a sede; **T-763** (a casa rica do corpo) não começada.
- **T-933** o consumo dos bens da casa não corre na sede.
- **T-934** as camas da sede repartidas como as de uma casa (os catres da guarda, o palácio antigo com uma cama); a proposta
  ao G está na linha.
- **T-935** a capital sem caminho por terra; quem deixa a sede fica na capital.
- **T-936** o `casa-mercante` k7 falha na base (não é deste bloco).
- **T-937** a linha da pessoa no `ui.js` sem prova em Node; as provas de navegador da tela e o `visual/interior3d.js` não
  rodados.
- **T-938** o efeito sobre as histórias em vidas longas não medido (a regressão mede).
- **O golpe e a herança** não têm caso próprio com o nome: passam pela mesma porta da eleição e da morte (`P.endReign` /
  `P.crown` / `ensureLeader`), que a prova exerce (m3c, m3f); a revolução e a deposição pelos mercadores, idem.
