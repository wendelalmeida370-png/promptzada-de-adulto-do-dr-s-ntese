# QA — ferramentas de teste do God of the Ant Farm

Ferramentas da fase de estabilização. Nenhuma delas é carregada pelo jogo: elas abrem o `index.html` num Chromium sem tela (Playwright), fazem o mundo viver em passo fixo e verificam se ele continua fazendo sentido.

Requisitos: Node 18+ e Playwright com Chromium (`npm i playwright`). Se o Playwright estiver instalado em outro lugar, aponte para ele com `PLAYWRIGHT=/caminho/para/playwright`. Para testar outra cópia do jogo, use `GAME=file:///caminho/index.html`.

O mundo tem o seu próprio acaso, semeado pela semente do mundo e guardado no save (`G.R` e família; o que só se vê ou se ouve usa `G.VR`). Os testes congelam o relógio e semeiam `Math.random` só para escolher a semente de cada mundo: a mesma semente de teste gera o mesmo mundo, rodada após rodada, com ou sem quadros na tela, e o mesmo save carregado duas vezes vive o mesmo futuro.

**Antes de cada versão:** `bash regress.sh [pasta]` roda tudo (≈ 1 h 15 min em 4 núcleos), escreve `resumo.txt` e o compara com `linha-de-base.txt`: o que mudou aparece como `NOVO:`. **Antes de cada commit:** `node guard.js` e uma vida curta (`node soak.js 103 continente 128 4 normal 5 1 1`). O protocolo inteiro está no `CLAUDE.md` da raiz do repositório.

## O verificador

`qa.js` é injetado na página e expõe `QA`:

- `QA.run(anos)`: o mundo vive N anos (um ano = um dia do jogo = 200 s simulados, em passos de 0,1 s).
- `QA.check()`: invariantes profundos, com severidade de S0 a S4. Cobre ids, pessoas e famílias, casas e empregos, cidades, economia, povos e relações, guerras, exércitos e cativos, navios, tripulações e expedições, caminhos, bichos, histórias e cenas, crônica e números (NaN/Infinity).
- `QA.roundTrip()`: salva, carrega e compara o mundo lógico antes e depois (`QA.canon`/`QA.diff`).
- `QA.saveAudit()`: tamanho do save por seção, e valores que o JSON corromperia.

## Os testes

| Arquivo | Uso | O que faz |
|---|---|---|
| `soak.js` | `node soak.js semente tipo tamanho povos temperamento anos cada [rt] [clima] [relevo]` | Vida longa: a cada N anos roda o verificador e um save→load. `TEXTLINT=1` também revisa os textos. |
| `ev.js` | `node ev.js semente tipo tamanho povos anos arquivo.js` | O mundo vive N anos e depois roda, dentro da página, o corpo do arquivo indicado (os arquivos abaixo). |
| `chaos.js` | via `ev.js` | Um deus com fé infinita e sem plano: poderes, guerras, mortes de governantes, save/load, e o verificador depois de cada ato. |
| `genmx.js` | via `ev.js` | Matriz de geração: muitas sementes × tipos × tamanhos × climas × relevos. |
| `uismoke.js` | via `ev.js` | Abre todos os painéis num mundo vivido e procura texto quebrado (`undefined`, `NaN`, `[object`…). |
| `rendersmoke.js` | via `ev.js` (com `FRAMES=1`) | Todos os modos de câmera com quadros de verdade. |
| `saveloop.js` | via `ev.js` | save→load→save→load: o save precisa ser um ponto fixo. |
| `worldloop.js` | via `ev.js` | Memória ao trocar de mundo várias vezes (heap depois de gc). |
| `textlint.js` | via `soak.js` (`TEXTLINT=1`) | Revisão dos textos: crônica, capítulos, lendas, biografias. |
| `monkey.js` | `node monkey.js semente segundos` (`W`, `H`, `TOUCH=1`) | Teclas, cliques, arrastos, roda e botões aleatórios no jogo ao vivo. |
| `audiorun.js` | `node audiorun.js semente segundos` | O jogo em tempo real com som, música, ambiente, cinema e poderes. |
| `hand.js` | `node hand.js semente tipo tamanho povos anos arremessos` | A mão divina com o mouse de verdade: pega cativos, soldados, atores de cena, marujos, náufragos, governantes, emissários e solta no mar fundo, em outra ilha, num penhasco, dentro de um prédio. |
| `corrupt.js` | `node corrupt.js [semente]` (`CASE=regex`) | Saves danificados (cortados, vazios, com seções faltando, referências penduradas, números nulos): o "Continuar" precisa recusar limpo ou carregar um mundo que roda sem erros. |
| `extinct.js` | via `ev.js` | O fim do mundo: todos morrem; o mundo vazio precisa rodar, desenhar, abrir painéis, avançar no tempo, salvar e carregar. |
| `swim1.js` | via `ev.js` (mapa `mar`) | Gente largada em mar aberto, longe de qualquer margem: nada até a costa ou se afoga — nunca boia para sempre. |
| `reach.js` | via `ev.js` | O mapa de aonde se chega a pé contra a busca de caminho de verdade (500 pares), um anel de muro com portão fechado e aberto, um prédio tapando a brecha, uma mudança de chão que ninguém avisou (o verificador precisa acusar) e a região de cada cidade — a das suas casas (L-089). |
| `aboard.js` | via `ev.js` (mapa `mar`) | Quem está a bordo: o índice contra uma contagem simples em cada navio, embarcar, trocar de navio, descer, um naufrágio, e um embarque que ninguém anunciou (o verificador precisa acusar). |
| `guard.js` | `node guard.js` | Regras de arquitetura lidas direto do código (um segundo, sem abrir o jogo): só `Naval.board`/`unboard` escrevem `v.aboard`; quem muda muro, prédio ou bloqueio avisa o mapa de alcance. Uma exceção nova entra na lista do próprio arquivo, com o motivo. |
| `mar17.js` | `DET=1 node mar17.js caso [semente]` | As 17 provas do mar: rich, iron, temper, fisher, solo, grand, know, dead, colony, invasion, bigbattle, sink, saveexp, savewar, skip, perf. |
| `guerra10.js` | `DET=1 node guerra10.js cenário [semente]` | As 10 provas da guerra, em quatro mundos: small, medium, walls, save. |
| `det3.js` | `node det3.js semente tipo tamanho povos anos` | Determinismo: o mesmo mundo sem quadros e com quadros (câmera, cinema, som, painéis), feito de novo na mesma página, e um save carregado duas vezes. Não semeia nada: o acaso precisa vir só da semente. |
| `detloc.js` | `node detloc.js again\|frames\|load\|builds semente tipo tamanho povos passos` | Quando duas vidas que deviam ser iguais se separam: o primeiro passo diferente e quem sorteou o quê nesse passo, em cada uma (`builds` compara duas versões do jogo: `GAME_A`, `GAME_B`). |
| `rngtrace.js` | `node rngtrace.js [semente]` | Quem tira de qual acaso, com quadros de verdade: o acaso do mundo sorteado fora do passo do mundo (desenho, som, interface) é bug; o acaso do visual dentro do passo é só para conferir. |
| `urb1.js` | `node urb1.js [semente] [tamanho] [anos máx.]` | A cidade sem provocação: um mundo abençoado vive até a primeira metrópole e então se confere — bairros com vocação e nome (salvos), terra mais cara no centro e no bairro nobre, vários núcleos, avenidas calçadas primeiro, mais camas por quadra no centro; e o que os anos fizeram sozinhos: hortas colhidas, tavernas servindo, carga do porto pelo armazém, roubos respondidos, ricos em terra mais cara (12 provas). |
| `urb2.js` | `node urb2.js [semente]` | A vida da cidade provocada de propósito: caixas no cais até o armazém, a taverna e a bebida do povo, as hortas, o incêndio que leva ao barraco e de volta a uma casa, o roubo visto pelo vigia, a prisão, a cela atravessando um save e a soltura pela lei (7 provas). |
| `blessrun.js` | `node blessrun.js semente tamanho anos arquivo.js` | Um mundo abençoado (paz e fartura) vive N anos e então avalia o arquivo na página — para medir a vida das cidades a longo prazo. |
| `memoria.js` | via `ev.js` | A memória dos mortos provocada: cem anos passam para os mortos, um save no meio, cemitérios cheios velhos e novos, o limite de cemitérios da cidade, um corpo que chega a um cemitério cheio, um cemitério sem cidade (a vala comum), o raio do deus — e um ano de vida com o verificador. |
| `salto.js` | `node salto.js [semente]` | O avanço no tempo em dois ritmos provocado: 15 anos com o verificador todo ano, a mesma semente duas vezes (o mesmo mundo), um save carregado duas vezes (o mesmo futuro), parar no meio e continuar, um terremoto antes do salto, bichos fora do lugar no salto contra a tela.; e num mundo grande (a megalópole pronta) um salto «até» uma coisa para quando ela acontece (L-083). |
| `prontos.js` | `node prontos.js tipo [semente]` | Gera os mundos prontos de `worlds/` pelo salto do próprio jogo: `cidade`, `metropole`, `mega`, `mundial`, `anos` (100, 500 e 1000 anos do mesmo mundo). Em cada um: o verificador, a ida e volta pelo save e o peso de cada parte do save. Leva de um minuto a horas. |
| `mundos.js` | `node mundos.js [chave...]` | Abre cada mundo pronto pelo menu (o primeiro pelo menu principal, os outros pelo menu do jogo, com a confirmação), confere com a lista, vive um pouco com o verificador, salva e carrega, e confere que o salvamento automático coube. |
| `quarteirao.js` | `node quarteirao.js [mundo]` | O quarteirão da metrópole (L-077) no mundo pronto «megalópole» (ou outro: `node quarteirao.js metropole`): a maior cidade de nível 4 ou 5 vive anos abençoados com pedra de sobra, e cada quarteirão que o planejador põe é fiscalizado na hora — terra cara, só casas baixas, sobrados, hortas e campos da própria cidade (nunca prédio público, nunca as últimas fazendas), mais camas do que tira, os desalojados sem casa e as moedas guardadas; uma família posta de propósito onde o quarteirão vai ficar; um save no meio da obra, um desalojado morre e um raio cai na obra; o verificador todo ano; quarteirões prontos e morados. Fim: `QUARTEIRAO: ok`. |
| `vira.js` | `node vira.js` | Quando um povo muda de mãos ou acaba, no mundo pronto «guerra mundial»: o guerreiro cuja cidade muda de povo no meio de um saque sai do bando e volta para casa (L-088); morre a última alma de um povo e o povo acaba junto (L-090); o verificador fica limpo. Fase `guerra` da regressão. |
| `poderes.js` | `node poderes.js [mundo]` | Os poderes novos (v30) provocados de propósito no mundo pronto «cidade»: a Chuva de Ouro (o povo corre e cata; toda moeda contada; save no meio carregado duas vezes; quem corria morre, o raio cai num monte, o mar engole outro; povo sem moeda) e o Vinho nos Poços (bebem e dançam só nos poços da própria cidade; save no meio; morte no poço e poços derrubados; a ressaca no dia seguinte); a Ressurreição (do corpo: volta igual e casado de novo; da cova: a cova fica vazia, a viúva casada de novo fica com o novo, e passa pelo save; volta, morre de novo, volta de novo) e os Fantasmas (andam à noite, o povo vê e foge; apontam o ladrão; vão atrás de quem os matou; save no meio carregado duas vezes; o morto que volta deixa de assombrar; cemitério derrubado). Fase `poderes` da regressão, junto com o deus caótico (`chaos.js`, sementes 7 e 13). |
| `oldsave.js` | `node oldsave.js pastaVelha pastaNova semente tipo tamanho povos anosVelho anosNovo` | Um mundo vive na versão antiga, é salvo e carregado na nova, que continua com o verificador. |

Qualquer erro de página, aviso no console ou erro capturado por um módulo (`G.modErr`) conta como falha.
