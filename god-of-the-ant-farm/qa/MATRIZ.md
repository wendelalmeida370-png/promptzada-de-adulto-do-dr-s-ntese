# Matriz de cobertura das atividades

Gerada por `node qa/matriz.js` a partir do código (as definições `G.Act.DEFS`, os gestos `G.Act.ANIM`, as tarefas que os passos dão às pessoas, as poses do 3D, os efeitos e sons), com as ofertas colhidas de verdade nos mundos prontos «cidade» e «metrópole». Não se edita à mão: muda o código, roda de novo.

**Incoerências (falham a prova):** (a) oferta ou passo com gesto fora de `G.Act.ANIM`: **0**; (b) ato de `G.Act.ANIM` sem pose no 3D: **0**.

**Lacunas (listadas, não falham):** (c) gestos que ninguém usa: **7**; (d) atos sem oferta e sem passo de NPC: **0**; (e) ações sem retorno audiovisual nenhum: **4**, e passos cujo retorno só a vista do deus mostra: **0**.

Uma lacuna é uma lacuna: o que está aqui sem animação, sem pose ou sem retorno não está pronto.

## Ações do corpo (as definições e os verbos que as alcançam)

| Ação | Objeto | Interação lógica | Animação (gesto → ato → pose do corpo / das pessoas) | Retorno audiovisual | Início | Cancelamento | Estado final esperado |
|---|---|---|---|---|---|---|---|
| descarga.pegar (carga) — colhida: cidade, metropole | mãos, cais | reserva no início; feita no contato do gesto; o mesmo pelas pessoas: descarga | levantar → lift → corpo carry / pessoas carry | as palavras ao jogador (1) | pode, salvo: A descarga acabou. · A descarga está parada (…). · A caixa não está mais no cais. · Outro carregador pegou esta caixa. | cortado: desfaz o que o início reservou (abort) · na hora do contato o mundo pergunta de novo (can) | livro-razão: pegar — «Você levanta …caixa de ….» |
| descarga.pegarChao (carga) — oferta no código, não colhida | mãos, chão | feita no contato do gesto; o mesmo pelas pessoas: descarga | levantar → lift → corpo carry / pessoas carry | as palavras ao jogador (1) | pode, salvo: Não está mais aí. · Suas mãos já estão cheias. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | livro-razão: pegar — «Você levanta a caixa de ….» |
| descarga.depositar (entrega) — colhida: cidade, metropole | mãos, casa, bolsa, armazém do povo | feita no contato do gesto; o mesmo pelas pessoas: descarga, ajudar | pousar → lift → corpo carry / pessoas carry | as palavras ao jogador (4) | pode, salvo: A descarga acabou. · Você não está com uma caixa desta descarga. · O armazém está cheio. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | livro-razão: depositar, paga — «Você guarda … de … no armazém${got ?» |
| descarga.pousar — colhida: cidade, metropole | mãos, cais, casa, bolsa, armazém do povo | feita no contato do gesto; o mesmo pelas pessoas: descarga, ajudar | pousar → lift → corpo carry / pessoas carry | as palavras ao jogador (1) | pode, salvo: Não há o que pôr no chão. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | livro-razão: depositar, devolveu, caiu, pousou, paga — «Você põe a caixa no chão.» |
| negocio.atacado (compra) — colhida: cidade (não pode: A banca está cheia: venda antes de comprar mais.), metropole (não pode: A banca está cheia: venda antes de comprar mais.) | banca, armazém do povo, mãos | feita no contato do gesto; o mesmo pelas pessoas: atacado | examinar → examine → corpo interact / pessoas interact | as palavras ao jogador (1) | pode, salvo: A banca não é sua. · Suas mãos já estão cheias. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) · O povo não existe mais. · Falta dinheiro para o atacado. · O armazém não fia mais: primeiro pague o que deve. | livro-razão: atacado, fiado — «Você compra … de … no atacado…. Agora é levar à banca.» |
| negocio.abrir — colhida: cidade, metropole | — | feita no contato do gesto | apontar → point → corpo interact / pessoas talk | fala abrir (balão, nas duas vistas); as palavras ao jogador (1) | pode, salvo: O mercado está fechado a esta hora. · A banca não é sua. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | sem lançamento no livro — «Você abre a banca.» |
| negocio.fechar — colhida: cidade | — | feita no contato do gesto | apontar → point → corpo interact / pessoas talk | fala fechar (balão, nas duas vistas); as palavras ao jogador (1) | pode, salvo: A banca não é sua. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | sem lançamento no livro — «Você fecha a banca por hoje.» |
| negocio.porNaBanca (trabalho) — oferta no código, não colhida | mãos, banca | feita no contato do gesto | porNaBanca → arrange → corpo carry / pessoas gesto das mãos | as palavras ao jogador (1) | pode, salvo: A banca não é sua. · Suas mãos estão vazias. · Não cabe mais disso na banca. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | livro-razão: expor — «Você arruma … de … na banca.» |
| negocio.tirarDaBanca — colhida: cidade, metropole | mãos, banca | feita no contato do gesto; o mesmo pelas pessoas: devolver | tirarDaBanca → arrange → corpo carry / pessoas gesto das mãos | as palavras ao jogador (1) | pode, salvo: A banca não é sua. · Suas mãos já estão cheias. · Não há mais disso na banca. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | livro-razão: recolher — «Você recolhe … de ….» |
| negocio.precoMais — colhida: cidade, metropole | — | feita no contato do gesto | apontar → point → corpo interact / pessoas talk | as palavras ao jogador (1) | pode, salvo: A banca não é sua. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | sem lançamento no livro — «… agora sai por ….» |
| negocio.precoMenos — colhida: cidade, metropole | — | feita no contato do gesto | apontar → point → corpo interact / pessoas talk | as palavras ao jogador (1) | pode, salvo: A banca não é sua. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | sem lançamento no livro — «… agora sai por ….» |
| negocio.comprar (compra) — colhida: cidade, metropole | casa, mãos, banca | feita no contato do gesto; o mesmo pelas pessoas: compra | pagar → pay → corpo interact / pessoas interact | fala sem_lugar (balão, nas duas vistas), fala sem_dinheiro (balão, nas duas vistas), fala agradecer (balão, nas duas vistas); as palavras ao jogador (1) | pode, salvo: Não há ninguém na banca. · Acabou. · Suas mãos já estão cheias. · Sem casa para onde levar. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) · Você não tem com que trocar. | livro-razão: venda — «Você compra … de … por ….» |
| negocio.pechinchar — colhida: cidade, metropole | casa, mãos, banca | feita no contato do gesto; o mesmo pelas pessoas: compra | pechinchar → haggle → corpo talk / pessoas talk | fala pechinchar (balão, nas duas vistas), fala troca_pechinchar (balão, nas duas vistas), fala aceitar (balão, nas duas vistas), fala recusar_oferta (balão, nas duas vistas), fala contrapropor (balão, nas duas vistas), fala sem_lugar (balão, nas duas vistas) (+2); as palavras ao jogador (2) | pode, salvo: Não há ninguém na banca. · Acabou. · Suas mãos já estão cheias. · Sem casa para onde levar. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) · Você não tem com que trocar. | livro-razão: venda — «O vendedor pede ….» |
| negocio.aceitarContra (compra) — colhida: cidade, metropole | casa, mãos, banca | feita no contato do gesto; o mesmo pelas pessoas: compra | pagar → pay → corpo interact / pessoas interact | fala aceitar_contra (balão, nas duas vistas), fala sem_lugar (balão, nas duas vistas), fala sem_dinheiro (balão, nas duas vistas), fala agradecer (balão, nas duas vistas); as palavras ao jogador (1) | pode, salvo: A proposta não vale mais. · Não há ninguém na banca. · Acabou. · Suas mãos já estão cheias. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) · Você não tem com que trocar. | livro-razão: venda — «Você compra … de … por ….» |
| pesca (nenhum ato) | — | — | — | — | — | — | a definição não tem atos nem ofertas: o corpo, pelo verbo «peixe»; as pessoas, pelo passo «fish» |
| casa.encomendar (casa) — colhida: cidade, metropole | casa, bolsa, armazém do povo | feita no contato do gesto; o mesmo pelas pessoas: (decisão) | pagar → pay → corpo interact / pessoas interact | as palavras ao jogador (3) | pode, salvo: A família tem onde morar. · A casa da família já está sendo levantada. · Falta dinheiro: uma casa custa uns … moedas e a família tem …. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) · A família tem onde morar. · A casa da família já está sendo levantada. · A família deixou a casa nova para depois. | livro-razão: mudança, obra-casa — «Você aluga … … (… moedas ao ano): a família muda hoje.» |
| verbo «atividade» ((as ofertas)) | — | pela porta do mundo (Possess.apply), no contato do gesto | o gesto da oferta, pela tabela Interact.GEST (o mundo vê o ato do gesto) | palavras ao jogador, som deny e palavras, na recusa | — | cortado antes do contato: nada acontece | o que a oferta faz (as linhas acima) |
| verbo «peixe» (pesca) | mãos | pela porta do mundo (Possess.apply), no contato do gesto | low (o mundo vê fish) | som splash, partícula 3D spawn, palavras ao jogador, som deny e palavras, na recusa | Você não tem mãos para isso. · Suas mãos já estão cheias. · Não cabe mais peixe nas mãos: leve ao armazém. | cortado antes do contato: nada acontece | livro-razão: pesca |

## Passos das pessoas do mundo

| Passo (tarefa) | Atividade | Objeto | Interação lógica | Animação (gesto → ato → pose) | Retorno audiovisual | Início (quem dá) | Cancelamento | Estado final esperado |
|---|---|---|---|---|---|---|---|---|
| carga (runCarga, js/activity.js) | comum | casa, armazém do povo, mãos | a tarefa da pessoa, passo a passo | pousar → lift → carry | texto deposit (nas duas vistas) | runShop (economy.js), A.resumeCarry (activity.js), runAtacado (act-negocio.js), runDevolver (act-negocio.js), runCompra (act-negocio.js) | 6 saídas (fim da tarefa) | livro-razão: sem-destino, compra-em-casa, entrega |
| descarga (runDescarga, js/act-porto.js) | descarga | mãos, chão, cais, casa, bolsa, armazém do povo | a tarefa da pessoa, passo a passo | esperar → wait → idle; levantar → lift → carry; pousar → lift → carry | texto deposit (nas duas vistas), fala pedir_ajuda (balão, nas duas vistas), fala sozinho (balão, nas duas vistas), fala armazem_cheio (balão, nas duas vistas) | P.work (act-porto.js), resume (act-porto.js) | larga: sem armazém · larga: sem caminho · larga: cheio · para a operação: cheio · 11 saídas (fim da tarefa) | livro-razão: pegar, depositar, devolveu, caiu, pousou, paga |
| ajudar (runAjudar, js/act-porto.js) | descarga | mãos, cais, casa, bolsa, armazém do povo | a tarefa da pessoa, passo a passo | esperar → wait → idle; carregarDois → carry2 → carry | — | pairUp (act-porto.js) | larga: sem ajuda · 5 saídas (fim da tarefa) | livro-razão: depositar, devolveu, caiu, pousou, paga |
| conferir (runConferir, js/act-porto.js) | descarga | — | a tarefa da pessoa, passo a passo | contar → count → interact | fala faltam (balão, nas duas vistas), fala conferido (balão, nas duas vistas) | tick (act-porto.js) | 4 saídas (fim da tarefa) | — |
| atacado (runAtacado, js/act-negocio.js) | negocio | banca, armazém do povo, mãos | a tarefa da pessoa, passo a passo | examinar → examine → interact | — | B.task (act-negocio.js) | 5 saídas (fim da tarefa) | livro-razão: atacado, fiado; depois: carga |
| banca (runBanca, js/act-negocio.js) | negocio | — | a tarefa da pessoa, passo a passo | vender → sell → talk | fala abrir (balão, nas duas vistas), fala pregao (balão, nas duas vistas) | B.task (act-negocio.js) | 6 saídas (fim da tarefa) | — |
| compra (runCompra, js/act-negocio.js) | negocio | mãos, casa, banca | a tarefa da pessoa, passo a passo | esperar → wait → idle; pagar → pay → interact; pechinchar → haggle → talk | fala nao_tenho (balão, nas duas vistas), fala perguntar (balão, nas duas vistas), fala preco (balão, nas duas vistas), fala troca_preco (balão, nas duas vistas), fala pechinchar (balão, nas duas vistas), fala troca_pechinchar (balão, nas duas vistas) (+12) | B.shop (act-negocio.js) | 15 saídas (fim da tarefa) | livro-razão: venda; depois: carga |
| devolver (runDevolver, js/act-negocio.js) | negocio | mãos, armazém do povo | a tarefa da pessoa, passo a passo | tirarDaBanca → arrange → gesto das mãos | — | B.task (act-negocio.js) | 5 saídas (fim da tarefa) | livro-razão: troca; depois: carga |
| fish (case fish, js/villagers.js) | pesca | — | a tarefa da pessoa, passo a passo | «fish» → interact | partícula splash (vista do deus), sinal fish | fishTask (villagers.js) | 3 saídas (fim da tarefa) | — |
| (decisão) (A.hooks.tick, js/act-casa.js) | casa | casa, bolsa, armazém do povo | decisão, sem tarefa nem corpo que se veja | nenhuma: não há gesto | — | o passo do mundo, uma vez por dia (act-casa.js) | — | livro-razão: aluguel, venda-casa, obra-devolvida, mudança, obra-casa |

## Os gestos (G.Act.ANIM) e as poses do 3D

| Gesto | Ato | Duração (s do mundo) | Contato | Mãos | Pessoas paradas | Com carga | Andando | Gesto das mãos | Corpo do jogador | Quem usa |
|---|---|---|---|---|---|---|---|---|---|---|
| levantar | lift | 1 | 0.6 | 2 | carry | carry | walk | sim | carry | oferta descarga.pegar, oferta descarga.pegarChao, passo descarga |
| pousar | lift | 0.8 | 0.5 | 2 | carry | carry | walk | sim | carry | oferta descarga.depositar, oferta descarga.pousar, passo carga, passo descarga |
| empilhar | lift | 1.1 | 0.7 | 2 | carry | carry | walk | sim | carry | — |
| carregar | (carregar) | 0 | 0 | 2 | carry | carry | carryWalk | — | carry | — |
| carregarPesado | (carregar) | 0 | 0 | 2 (pesado) | carry | carry | carryWalk | — | carry | — |
| carregarDois | carry2 | 0 | 0 | 2 (em dupla) | carry | carry | carryWalk | a caixa de quem conduz, entre os dois (G.Act.pair → People3D) | interact | passo ajudar |
| porNaBanca | arrange | 1.2 | 0.8 | 2 | idle | carry | walk | sim | carry | oferta negocio.porNaBanca |
| tirarDaBanca | arrange | 0.9 | 0.5 | 2 | idle | carry | walk | sim | carry | oferta negocio.tirarDaBanca, passo devolver |
| entregar | give | 0.8 | 0.5 | 1 | idle | carry | walk | sim | interact | — |
| receberMoedas | pay | 0.8 | 0.5 | 1 | interact | interact | walk | — | interact | — |
| pagar | pay | 0.8 | 0.5 | 1 | interact | interact | walk | — | interact | oferta negocio.comprar, oferta negocio.aceitarContra, oferta casa.encomendar, passo compra |
| pechinchar | haggle | 2.2 | 1.6 | 0 | talk | talk | walk | — | talk | oferta negocio.pechinchar, passo compra |
| examinar | examine | 1.6 | 1.2 | 1 | interact | interact | walk | — | interact | oferta negocio.atacado, passo atacado |
| contar | count | 2.4 | 2 | 1 | interact | interact | walk | — | interact | passo conferir |
| chamarAjuda | call | 1.2 | 0.6 | 0 | talk | talk | walk | — | wave | — |
| apontar | point | 1 | 0.5 | 1 | talk | talk | walk | — | interact | oferta negocio.abrir, oferta negocio.fechar, oferta negocio.precoMais, oferta negocio.precoMenos |
| esperar | wait | 0 | 0 | 0 | idle | idle | walk | — | interact | passo descarga, passo ajudar, passo compra |
| vender | sell | 0 | 0 | 0 | talk | talk | walk | — | interact | passo banca |
| comprar | buy | 0 | 0 | 0 | talk | talk | walk | — | interact | — |
| pescarMaos | fish | 2.2 | 1.2 | 2 | interact | interact | walk | — | interact | passo fish (o lance, pelo jeito do povo: G.Pesca.castDur), verbo peixe (o lance das mãos: G.Pesca.castDur) |
| pescarArpao | fish | 5 | 4.6 | 2 | interact | interact | walk | — | interact | passo fish (o lance, pelo jeito do povo: G.Pesca.castDur) |
| pescarLinha | fish | 6.5 | 6 | 2 | interact | interact | walk | — | interact | passo fish (o lance, pelo jeito do povo: G.Pesca.castDur) |
| pescarRede | fish | 7.5 | 6.8 | 2 | interact | interact | walk | — | interact | passo fish (o lance, pelo jeito do povo: G.Pesca.castDur) |

## As ofertas colhidas nos mundos prontos

| Mundo | Oferta | Gesto | Mãos | Vezes | Onde | Pode? | Exemplo |
|---|---|---|---|---|---|---|---|
| cidade | casa.encomendar | pagar | 1 | 340 | dono na banca · dono no armazém · comprador diante da banca · comprador com contraproposta · no cais · com a caixa nas mãos · com a caixa, na porta do armazém · a caixa no chão · família sem casa, no armazém · na beira da água | sim | Pedir ao povo uma casa para a família |
| cidade | descarga.depositar | pousar | 1 | 75 | com a caixa, na porta do armazém | sim | Guardar a caixa de comida na fogueira |
| cidade | descarga.pegar | levantar | 1 | 666 | no cais · a caixa no chão | sim | Pegar a caixa de comida (4) |
| cidade | descarga.pousar | pousar | 1 | 150 | com a caixa nas mãos · com a caixa, na porta do armazém | sim | Pôr a caixa no chão |
| cidade | negocio.abrir | apontar | 0 | 37 | dono na banca · dono no armazém | sim | Abrir a banca |
| cidade | negocio.aceitarContra | pagar | 1 | 25 | comprador com contraproposta | sim | Aceitar 10,2 de comida |
| cidade | negocio.atacado | examinar | 2 | 100 | dono na banca · dono no armazém · no cais · a caixa no chão | não: A banca está cheia: venda antes de comprar mais. | Comprar no atacado para a banca |
| cidade | negocio.comprar | pagar | 1 | 200 | comprador diante da banca · comprador com contraproposta | sim | Comprar 1 de bacalhau por 11 de comida |
| cidade | negocio.fechar | apontar | 0 | 12 | com a caixa, na porta do armazém | sim | Fechar a banca |
| cidade | negocio.pechinchar | pechinchar | 0 | 200 | comprador diante da banca · comprador com contraproposta | sim | Oferecer 9,4 de comida por 1 de bacalhau |
| cidade | negocio.precoMais | apontar | 0 | 196 | dono na banca · dono no armazém · com a caixa, na porta do armazém | sim | Subir o preço de bacalhau (2.75) |
| cidade | negocio.precoMenos | apontar | 0 | 196 | dono na banca · dono no armazém · com a caixa, na porta do armazém | sim | Baixar o preço de bacalhau (2.75) |
| cidade | negocio.tirarDaBanca | tirarDaBanca | 2 | 148 | dono na banca · dono no armazém | sim | Tirar bacalhau da banca |
| metropole | casa.encomendar | pagar | 1 | 229 | dono na banca · dono no armazém · no cais · com a caixa nas mãos · com a caixa, na porta do armazém · a caixa no chão · família sem casa, no armazém · na beira da água | sim | Pagar uma casa para a família (uns 17 moedas) |
| metropole | descarga.depositar | pousar | 1 | 25 | com a caixa, na porta do armazém | sim | Guardar a caixa de comida no armazém |
| metropole | descarga.pegar | levantar | 1 | 222 | no cais · a caixa no chão | sim | Pegar a caixa de comida (4) |
| metropole | descarga.pousar | pousar | 1 | 50 | com a caixa nas mãos · com a caixa, na porta do armazém | sim | Pôr a caixa no chão |
| metropole | negocio.abrir | apontar | 0 | 33 | dono na banca · dono no armazém | sim | Abrir a banca |
| metropole | negocio.aceitarContra | pagar | 1 | 25 | comprador com contraproposta | sim | Aceitar 1,27 grãos de cacau |
| metropole | negocio.atacado | examinar | 2 | 33 | dono na banca · dono no armazém | não: A banca está cheia: venda antes de comprar mais. | Comprar no atacado para a banca |
| metropole | negocio.comprar | pagar | 1 | 150 | comprador diante da banca · comprador com contraproposta | sim | Comprar 1 de cerâmica por 1,38 grãos de cacau |
| metropole | negocio.pechinchar | pechinchar | 0 | 150 | comprador diante da banca · comprador com contraproposta | sim | Oferecer 1,17 grãos de cacau por 1 de cerâmica |
| metropole | negocio.precoMais | apontar | 0 | 99 | dono na banca · dono no armazém | sim | Subir o preço de cerâmica (1.38) |
| metropole | negocio.precoMenos | apontar | 0 | 99 | dono na banca · dono no armazém | sim | Baixar o preço de cerâmica (1.38) |
| metropole | negocio.tirarDaBanca | tirarDaBanca | 2 | 99 | dono na banca · dono no armazém | sim | Tirar cerâmica da banca |

## Incoerências e lacunas

### (a) Oferta ou passo com gesto fora de G.Act.ANIM (falha) — 0

Nenhuma.

### (b) Ato de G.Act.ANIM sem pose no 3D (falha) — 0

Nenhuma.

### (c) Gestos de G.Act.ANIM que ninguém usa — 7

- empilhar (lift, 1.1 s)
- carregar (carregar, 0 s)
- carregarPesado (carregar, 0 s)
- entregar (give, 0.8 s)
- receberMoedas (pay, 0.8 s)
- chamarAjuda (call, 1.2 s)
- comprar (buy, 0 s)

### (d) Atos de uma definição sem oferta e sem passo de NPC — 0

Nenhuma.

### (e) Ações sem retorno audiovisual nenhum — 4

- o passo «ajudar» (descarga, js/act-porto.js)
- o passo «atacado» (negocio, js/act-negocio.js)
- o passo «devolver» (negocio, js/act-negocio.js)
- o passo «(decisão)» (casa, js/act-casa.js)

### (e, no 3D) Passos cujo retorno só a vista do deus mostra — as partículas de G.FX (as falas de G.Talk e os textos de G.FX o 3D do Modo Encarnado também desenha: incui.js, L-211) — 0

Nenhuma.

