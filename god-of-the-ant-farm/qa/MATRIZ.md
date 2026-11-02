# Matriz de cobertura das atividades

Gerada por `node qa/matriz.js` a partir do código (as definições `G.Act.DEFS`, os gestos `G.Act.ANIM`, as tarefas que os passos dão às pessoas, as poses do 3D, os efeitos e sons), com as ofertas colhidas de verdade nos mundos prontos «cidade» e «metrópole». Não se edita à mão: muda o código, roda de novo.

**Incoerências (falham a prova):** (a) oferta ou passo com gesto fora de `G.Act.ANIM`: **0**; (b) ato de `G.Act.ANIM` sem pose no 3D: **0**.

**Lacunas (listadas, não falham):** (c) gestos que ninguém usa: **6**; (d) atos sem oferta e sem passo de NPC: **0**; (e) ações sem retorno audiovisual nenhum: **13**, e passos cujo retorno só a vista do deus mostra: **1**.

Uma lacuna é uma lacuna: o que está aqui sem animação, sem pose ou sem retorno não está pronto.

## Ações do corpo (as definições e os verbos que as alcançam)

| Ação | Objeto | Interação lógica | Animação (gesto → ato → pose do corpo / das pessoas) | Retorno audiovisual | Início | Cancelamento | Estado final esperado |
|---|---|---|---|---|---|---|---|
| descarga.pegar (carga) — colhida: cidade (não pode: A descarga está parada (a noite).), metropole (não pode: A descarga está parada (a noite).) | mãos, cais | reserva no início; feita no contato do gesto; o mesmo pelas pessoas: descarga | levantar → lift → corpo carry / pessoas carry | as palavras ao jogador (1) | pode, salvo: A descarga acabou. · A descarga está parada (…). · A caixa não está mais no cais. · Outro carregador pegou esta caixa. | cortado: desfaz o que o início reservou (abort) · na hora do contato o mundo pergunta de novo (can) | livro-razão: pegar — «Você levanta …caixa de ….» |
| descarga.pegarChao (carga) — colhida: metropole | mãos, chão | feita no contato do gesto; o mesmo pelas pessoas: descarga | levantar → lift → corpo carry / pessoas carry | as palavras ao jogador (1) | pode, salvo: Não está mais aí. · Suas mãos já estão cheias. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | livro-razão: pegar — «Você levanta a caixa de ….» |
| descarga.depositar (entrega) — oferta no código, não colhida | mãos, casa, bolsa, armazém do povo | feita no contato do gesto; o mesmo pelas pessoas: descarga, ajudar | pousar → lift → corpo carry / pessoas carry | as palavras ao jogador (4) | pode, salvo: A descarga acabou. · Você não está com uma caixa desta descarga. · O armazém está cheio. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | livro-razão: depositar, paga — «Você guarda … de … no armazém${got ?» |
| descarga.pousar — oferta no código, não colhida | mãos, cais, casa, bolsa, armazém do povo | feita no contato do gesto; o mesmo pelas pessoas: descarga, ajudar | pousar → lift → corpo carry / pessoas carry | as palavras ao jogador (1) | pode, salvo: Não há o que pôr no chão. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | livro-razão: depositar, devolveu, caiu, pousou, paga — «Você põe a caixa no chão.» |
| negocio.atacado (compra) — colhida: metropole | banca, armazém do povo, mãos | feita no contato do gesto; o mesmo pelas pessoas: atacado | examinar → examine → corpo interact / pessoas interact | as palavras ao jogador (1) | pode, salvo: A banca não é sua. · Suas mãos já estão cheias. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) · O povo não existe mais. · Falta dinheiro para o atacado. · O armazém não fia mais: primeiro pague o que deve. | livro-razão: atacado, fiado — «Você compra … de … no atacado…. Agora é levar à banca.» |
| negocio.abrir — colhida: cidade, metropole | — | feita no contato do gesto | apontar → point → corpo interact / pessoas talk | fala abrir (balão, nas duas vistas); as palavras ao jogador (1) | pode, salvo: O mercado está fechado a esta hora. · A banca não é sua. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | sem lançamento no livro — «Você abre a banca.» |
| negocio.fechar — oferta no código, não colhida | — | feita no contato do gesto | apontar → point → corpo interact / pessoas talk | fala fechar (balão, nas duas vistas); as palavras ao jogador (1) | pode, salvo: A banca não é sua. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | sem lançamento no livro — «Você fecha a banca por hoje.» |
| negocio.porNaBanca (trabalho) — colhida: cidade, metropole | mãos, banca | feita no contato do gesto | porNaBanca → arrange → corpo carry / pessoas gesto das mãos | as palavras ao jogador (1) | pode, salvo: A banca não é sua. · Suas mãos estão vazias. · Não cabe mais disso na banca. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | livro-razão: expor — «Você arruma … de … na banca.» |
| negocio.tirarDaBanca — colhida: metropole | mãos, banca | feita no contato do gesto; o mesmo pelas pessoas: devolver | tirarDaBanca → arrange → corpo carry / pessoas gesto das mãos | as palavras ao jogador (1) | pode, salvo: A banca não é sua. · Suas mãos já estão cheias. · Não há mais disso na banca. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | livro-razão: recolher — «Você recolhe … de ….» |
| negocio.precoMais — colhida: metropole | — | feita no contato do gesto | apontar → point → corpo interact / pessoas talk | as palavras ao jogador (1) | pode, salvo: A banca não é sua. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | sem lançamento no livro — «… agora sai por ….» |
| negocio.precoMenos — colhida: metropole | — | feita no contato do gesto | apontar → point → corpo interact / pessoas talk | as palavras ao jogador (1) | pode, salvo: A banca não é sua. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | sem lançamento no livro — «… agora sai por ….» |
| negocio.comprar (compra) — colhida: metropole | casa, mãos, banca | feita no contato do gesto; o mesmo pelas pessoas: compra | pagar → pay → corpo interact / pessoas interact | fala sem_lugar (balão, nas duas vistas), fala sem_dinheiro (balão, nas duas vistas), fala agradecer (balão, nas duas vistas); as palavras ao jogador (1) | pode, salvo: Não há ninguém na banca. · Acabou. · Suas mãos já estão cheias. · Sem casa para onde levar. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) · Você não tem com que trocar. | livro-razão: venda — «Você compra … de … por ….» |
| negocio.pechinchar — colhida: metropole | casa, mãos, banca | feita no contato do gesto; o mesmo pelas pessoas: compra | pechinchar → haggle → corpo talk / pessoas talk | fala pechinchar (balão, nas duas vistas), fala troca_pechinchar (balão, nas duas vistas), fala aceitar (balão, nas duas vistas), fala recusar_oferta (balão, nas duas vistas), fala contrapropor (balão, nas duas vistas), fala sem_lugar (balão, nas duas vistas) (+2); as palavras ao jogador (2) | pode, salvo: Não há ninguém na banca. · Acabou. · Suas mãos já estão cheias. · Sem casa para onde levar. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) · Você não tem com que trocar. | livro-razão: venda — «O vendedor pede ….» |
| negocio.aceitarContra (compra) — colhida: metropole | casa, mãos, banca | feita no contato do gesto; o mesmo pelas pessoas: compra | pagar → pay → corpo interact / pessoas interact | fala aceitar_contra (balão, nas duas vistas), fala sem_lugar (balão, nas duas vistas), fala sem_dinheiro (balão, nas duas vistas), fala agradecer (balão, nas duas vistas); as palavras ao jogador (1) | pode, salvo: A proposta não vale mais. · Não há ninguém na banca. · Acabou. · Suas mãos já estão cheias. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) · Você não tem com que trocar. | livro-razão: venda — «Você compra … de … por ….» |
| pesca (nenhum ato) | — | — | — | — | — | — | a definição não tem atos nem ofertas: o corpo, pelo verbo «peixe»; as pessoas, pelo passo «fish» |
| casa.encomendar (casa) — colhida: cidade, metropole | casa, bolsa, armazém do povo | feita no contato do gesto; o mesmo pelas pessoas: (decisão) | pagar → pay → corpo interact / pessoas interact | as palavras ao jogador (3) | pode, salvo: A família tem onde morar. · A casa da família já está sendo levantada. · A família deixou a casa nova para depois: volta a pensar nisso no dia …. · Falta dinheiro: uma casa custa uns … moedas e a família tem …. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) · A família tem onde morar. · A casa da família já está sendo levantada. · A família deixou a casa nova para depois. | livro-razão: mudança, obra-casa — «Você aluga … … (… moedas ao ano): a família muda hoje.» |
| oficio.unidade (trabalho) — oferta no código, não colhida | prateleira do prédio, armazém do povo | reserva no início; feita no contato do gesto; o mesmo pelas pessoas: oficio | amassar → fill → corpo interact / pessoas low; moldar → craft → corpo interact / pessoas low; enfornar → lift → corpo carry / pessoas carry; desenfornar → lift → corpo carry / pessoas carry; empilhar → lift → corpo carry / pessoas carry; tornear → pottery → corpo interact / pessoas sit; fiar → craft → corpo interact / pessoas low; tecer → weave → corpo interact / pessoas sit; forjar → forge → corpo interact / pessoas swing; lavrar → craft → corpo interact / pessoas low; encher → fill → corpo interact / pessoas low | — | pode, salvo: A fornada já está em outra etapa. · A fornada acabou. · O forno está ocupado com outra fornada. · Esta etapa terminou. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) · Esta etapa terminou. · A fornada acabou. · O forno está ocupado com outra fornada. | livro-razão: fornada, desgaste |
| oficio.argila (entrega) — oferta no código, não colhida | mãos, prateleira do prédio | feita no contato do gesto; o mesmo pelas pessoas: oficio | pousar → lift → corpo carry / pessoas carry | as palavras ao jogador (1) | pode, salvo: A fornada não precisa mais disso. · Você não está com …. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) · Você não está com …. | livro-razão: entrega — «Você deixa … de …….» |
| oficio.lenha (trabalho) — oferta no código, não colhida | mãos | feita no contato do gesto; o mesmo pelas pessoas: oficio | alimentarFogo → feed → corpo interact / pessoas low | as palavras ao jogador (1) | pode, salvo: O forno não está aceso para esta fornada. · Você não está com lenha. · O forno já está cheio de lenha: espere arder. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) · O forno não está aceso para esta fornada. · Você não está com lenha. · O forno já está cheio de lenha: espere arder. | livro-razão: lenha — «Você põe lenha no forno. O fogo pega.» |
| oficio.levar (carga) — oferta no código, não colhida | prateleira do prédio, mãos, armazém do povo | feita no contato do gesto; o mesmo pelas pessoas: oficio | levantar → lift → corpo carry / pessoas carry | as palavras ao jogador (3) | pode, salvo: Só quem trabalha aqui leva o que se faz aqui. · Suas mãos já estão cheias. · Não há o que levar. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | livro-razão: recolher — «Você pega … de … para o armazém${r.w ?» |
| oficio.comecar — oferta no código, não colhida | prateleira do prédio | feita no contato do gesto | apontar → point → corpo interact / pessoas talk | as palavras ao jogador (1) | pode, salvo: Só quem trabalha aqui começa uma fornada. · Já há uma fornada que ainda pede mãos. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) · Não deu para começar. | sem lançamento no livro — «Você começa uma fornada de ….» |
| taverna.pedir — oferta no código, não colhida | — | feita no contato do gesto | apontar → point → corpo interact / pessoas talk | fala pedir_taverna (balão, nas duas vistas); as palavras ao jogador (2) | pode, salvo: A taverna fechou. · A taverna está fechada. · Você já está à mesa. · A taverna está cheia. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | sem lançamento no livro — «Você senta e pede. Agora é esperar ser servido.» |
| taverna.consumir (comer) — oferta no código, não colhida | mãos | feita no contato do gesto; o mesmo pelas pessoas: tavern | comer → eat → corpo eat / pessoas eat; beber → drink → corpo interact / pessoas talk | as palavras ao jogador (3) | pode, salvo: Você não tem nada para beber. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) · Não deu. | livro-razão: refeicao, bebida — «food» |
| taverna.sair — oferta no código, não colhida | mãos | feita no contato do gesto; o mesmo pelas pessoas: tavern | apontar → point → corpo interact / pessoas talk | as palavras ao jogador (1) | pode, salvo: Você não está à mesa. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | livro-razão: refeicao, bebida — «Você se levanta e sai.» |
| taverna.servir (trabalho) — oferta no código, não colhida | prateleira do prédio, mãos | feita no contato do gesto; o mesmo pelas pessoas: tavern, atender | servir → serve → corpo interact / pessoas talk | fala acabou (balão, nas duas vistas), fala sem_dinheiro (balão, nas duas vistas), fala servir_taverna (balão, nas duas vistas); as palavras ao jogador (2) | pode, salvo: A taverna fechou. · Não está mais à mesa. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) · Não está mais na mesa. · Está com as mãos ocupadas. · Acabou. | livro-razão: taverna — «Você serve … a …${r.p ?» |
| taverna.abrir — oferta no código, não colhida | prateleira do prédio | feita no contato do gesto | apontar → point → corpo interact / pessoas talk | as palavras ao jogador (1) | pode, salvo: A taverna não é sua. · Não é hora de abrir. · Hoje a taverna já abriu. · Não há o que servir. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) · Não deu para abrir. · dia | sem lançamento no livro — «Você abre a taverna.» |
| taverna.fechar — oferta no código, não colhida | mãos | feita no contato do gesto; o mesmo pelas pessoas: tavern | apontar → point → corpo interact / pessoas talk | fala fechando (balão, nas duas vistas); as palavras ao jogador (1) | pode, salvo: A taverna não é sua. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | livro-razão: refeicao, bebida — «Você fecha a taverna por hoje.» |
| lenhaTermas (nenhum ato) | — | — | — | — | — | — | a definição não tem atos nem ofertas: o corpo, pelo verbo (nenhum); as pessoas, pelo passo «termas», «fornalha», «lenhaTermas», «(decisão)», «(decisão)» |
| termas.entrar — oferta no código, não colhida | — | feita no contato do gesto | despir → undress → corpo interact / pessoas interact | as palavras ao jogador (1) | pode, salvo: Os banhos fecharam. · Os banhos estão fechados. · Você já está nos banhos. · Os banhos estão cheios. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | sem lançamento no livro — «Você ${p.n ?» |
| termas.banhar (banho) — oferta no código, não colhida | — | reserva no início; feita no contato do gesto | banhar → sit → corpo sit / pessoas sit | as palavras ao jogador (2) | pode, salvo: Não há lugar na água agora: espere vagar. | cortado: desfaz o que o início reservou (abort) · na hora do contato o mundo pergunta de novo (can) | sem lançamento no livro — «A água quente leva o cansaço embora.» |
| termas.sair — oferta no código, não colhida | — | feita no contato do gesto | despir → undress → corpo interact / pessoas interact | as palavras ao jogador (1) | pode, salvo: Você não está nos banhos. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | sem lançamento no livro — «Você se veste e sai dos banhos.» |
| termas.alimentar (trabalho) — oferta no código, não colhida | — | feita no contato do gesto | alimentarFogo → feed → corpo interact / pessoas low | as palavras ao jogador (1) | pode, salvo: Os banhos fecharam. · A fornalha não é sua. · A fornalha já está cheia: espere arder. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | sem lançamento no livro — «Você põe lenha na fornalha. A água vai esquentar.» |
| publico.treinar (treino) — oferta no código, não colhida | — | feita no contato do gesto | treinar → drill → corpo interact / pessoas talk | as palavras ao jogador (1) | pode, salvo: Não há quartel aqui. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | sem lançamento no livro — «Você treina com os soldados: a lança, o escudo, de novo.» |
| publico.escrever (escrita) — oferta no código, não colhida | — | feita no contato do gesto | escrever → write → corpo interact / pessoas sit | as palavras ao jogador (1) | pode, salvo: Só o escriba daqui escreve os registros. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | sem lançamento no livro — «Você anota os grãos, as gentes e os impostos. A cidade fica em ordem.» |
| publico.cunhar (trabalho) — oferta no código, não colhida | armazém do povo | feita no contato do gesto | cunhar → craft → corpo interact / pessoas low | as palavras ao jogador (1) | pode, salvo: Só o coletor daqui cunha moedas. · O povo não conhece a moeda. · Não há ouro no armazém. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) · Não deu. | livro-razão: cunhagem — «Você funde o ouro e bate seis moedas com o cunho do povo.» |
| publico.cobrar (cobranca) — oferta no código, não colhida | casa, mãos, armazém do povo | feita no contato do gesto | cobrar → knock → corpo interact / pessoas interact | as palavras ao jogador (1) | pode, salvo: Só o coletor de impostos cobra. · Esta casa já pagou há pouco. · Suas mãos estão ocupadas. · Esta casa não tem o que pagar. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | livro-razão: imposto — «A casa paga … de imposto. Agora é levar ao tesouro.» |
| publico.entregar (carga) — oferta no código, não colhida | mãos, armazém do povo | feita no contato do gesto | entregar → give → corpo interact / pessoas gesto das mãos | as palavras ao jogador (1) | pode, salvo: Você não está com o imposto. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | livro-razão: imposto — «Você entrega … ao tesouro.» |
| espetaculo.assistir (espetaculo) — oferta no código, não colhida | armazém do povo | feita no contato do gesto; o mesmo pelas pessoas: teatro | assistir → sit → corpo sit / pessoas sit | as palavras ao jogador (2) | pode, salvo: Não há espetáculo. · Você já está na plateia. · O teatro está cheio. · Falta dinheiro para a entrada. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | livro-razão: teatro — «Você ${p.n ?» |
| espetaculo.atuar (trabalho) — oferta no código, não colhida | — | feita no contato do gesto; o mesmo pelas pessoas: atuar | atuar → talk → corpo interact / pessoas talk | as palavras ao jogador (3) | pode, salvo: Não há peça agora. · Só os atores daqui sobem ao palco. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | sem lançamento no livro — «peca» |
| espetaculo.sair — oferta no código, não colhida | — | feita no contato do gesto | apontar → point → corpo interact / pessoas talk | as palavras ao jogador (1) | pode, salvo: Você não está no teatro. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | sem lançamento no livro — «Você sai do teatro.» |
| leitura.ler (leitura) — oferta no código, não colhida | — | feita no contato do gesto | ler → read → corpo interact / pessoas sit | as palavras ao jogador (2) | pode, salvo: A biblioteca está fechada. · O povo ainda não conhece a escrita. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | sem lançamento no livro — «Você lê um rolo inteiro. O que se sabe na cidade vai um pouco mais longe.» |
| leitura.copiar (trabalho) — oferta no código, não colhida | — | feita no contato do gesto | copiar → write → corpo interact / pessoas sit | as palavras ao jogador (2) | pode, salvo: Só o copista daqui copia os rolos. · A biblioteca está fechada. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | sem lançamento no livro — «Você copia um rolo, letra por letra. Mais um que não se perde.» |
| leitura.falar (fala) — colhida: cidade, metropole | — | feita no contato do gesto | falar → talk → corpo interact / pessoas talk | sinal chat; as palavras ao jogador (2) | pode, salvo: Não há praça aqui. · Você já falou ao povo hoje. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) | sem lançamento no livro — «… … para ouvir. A cidade gosta de ser ouvida.» |
| lar.comer (refeicao) — oferta no código, não colhida | casa | feita no contato do gesto; o mesmo pelas pessoas: lar | comer → eat → corpo eat / pessoas eat | sinal food; as palavras ao jogador (2) | pode, salvo: Só dentro de casa. · A despensa da casa está vazia. · Você não está com fome. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) · A despensa da casa está vazia. | livro-razão: ceia, refeicao — «Você ceia em casa: a ceia de hoje, quente.» |
| lar.cozinhar (cozinha) — oferta no código, não colhida | — | feita no contato do gesto; o mesmo pelas pessoas: lar | cozinhar → cook → corpo cook / pessoas cook | as palavras ao jogador (1) | pode, salvo: Só dentro de casa. · A ceia de hoje já está pronta. · A despensa da casa está vazia. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) · Agora não dá para cozinhar. | sem lançamento no livro — «A ceia da casa está pronta: quem chegar com fome come quente.» |
| lar.pegarBebe — colhida: cidade, metropole | — | feita no contato do gesto | levantar → lift → corpo carry / pessoas carry | as palavras ao jogador (1) | pode, salvo: O bebê não está mais aqui. · O bebê já está no seu colo. · Suas mãos estão ocupadas. · Agora você não pode pegar o bebê. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) · Agora você não pode pegar o bebê. | sem lançamento no livro — «Você pega … no colo.» |
| lar.darBebe — colhida: cidade | — | feita no contato do gesto | entregar → give → corpo interact / pessoas gesto das mãos | as palavras ao jogador (1) | pode, salvo: Você não está com o bebê. · Não há quem segure o bebê aqui. | cortado antes do contato: nada acontece · na hora do contato o mundo pergunta de novo (can) · Não há quem segure o bebê aqui. | sem lançamento no livro — «Você dá … a ….» |
| verbo «atividade» ((as ofertas)) | — | pela porta do mundo (Possess.apply), no contato do gesto | o gesto da oferta, pela tabela Interact.GEST (o mundo vê o ato do gesto) | palavras ao jogador, som deny e palavras, na recusa | — | cortado antes do contato: nada acontece | o que a oferta faz (as linhas acima) |
| verbo «peixe» (pesca) | mãos | pela porta do mundo (Possess.apply), no contato do gesto | low (o mundo vê fish) | som splash, partícula 3D spawn, palavras ao jogador, som deny e palavras, na recusa | Você não tem mãos para isso. · Suas mãos já estão cheias. · Não cabe mais peixe nas mãos: leve ao armazém. | cortado antes do contato: nada acontece | livro-razão: pesca |

## Passos das pessoas do mundo

| Passo (tarefa) | Atividade | Objeto | Interação lógica | Animação (gesto → ato → pose) | Retorno audiovisual | Início (quem dá) | Cancelamento | Estado final esperado |
|---|---|---|---|---|---|---|---|---|
| carga (runCarga, js/activity.js) | comum | casa, armazém do povo, mãos | a tarefa da pessoa, passo a passo | pousar → lift → carry | texto deposit (nas duas vistas) | runShop (economy.js), runTribute (court.js), A.resumeCarry (activity.js), runAtacado (act-negocio.js), runDevolver (act-negocio.js), runCompra (act-negocio.js), runOficio (act-oficio.js), runAbastecer (act-taverna.js), runLenha (act-servicos.js) | 6 saídas (fim da tarefa) | livro-razão: sem-destino, compra-em-casa, entrega |
| descarga (runDescarga, js/act-porto.js) | descarga | mãos, cais, casa, bolsa, armazém do povo, chão | a tarefa da pessoa, passo a passo | esperar → wait → idle; levantar → lift → carry; pousar → lift → carry | texto deposit (nas duas vistas), fala pedir_ajuda (balão, nas duas vistas), fala sozinho (balão, nas duas vistas), fala armazem_cheio (balão, nas duas vistas) | P.work (act-porto.js), resume (act-porto.js) | larga: sem ajuda · larga: sem armazém · larga: sem caminho · larga: cheio · para a operação: cheio · 12 saídas (fim da tarefa) | livro-razão: pegar, depositar, devolveu, caiu, pousou, paga |
| ajudar (runAjudar, js/act-porto.js) | descarga | mãos, cais, casa, bolsa, armazém do povo | a tarefa da pessoa, passo a passo | esperar → wait → idle; carregarDois → carry2 → carry | — | pairUp (act-porto.js) | larga: sem ajuda · 5 saídas (fim da tarefa) | livro-razão: depositar, devolveu, caiu, pousou, paga |
| conferir (runConferir, js/act-porto.js) | descarga | — | a tarefa da pessoa, passo a passo | contar → count → interact | fala faltam (balão, nas duas vistas), fala conferido (balão, nas duas vistas) | tick (act-porto.js) | 4 saídas (fim da tarefa) | — |
| atacado (runAtacado, js/act-negocio.js) | negocio | banca, armazém do povo, mãos | a tarefa da pessoa, passo a passo | examinar → examine → interact | — | B.task (act-negocio.js) | 5 saídas (fim da tarefa) | livro-razão: atacado, fiado; depois: carga |
| banca (runBanca, js/act-negocio.js) | negocio | — | a tarefa da pessoa, passo a passo | vender → sell → talk | fala abrir (balão, nas duas vistas), fala pregao (balão, nas duas vistas) | B.task (act-negocio.js) | 6 saídas (fim da tarefa) | — |
| compra (runCompra, js/act-negocio.js) | negocio | mãos, casa, banca | a tarefa da pessoa, passo a passo | esperar → wait → idle; pagar → pay → interact; pechinchar → haggle → talk | fala nao_tenho (balão, nas duas vistas), fala perguntar (balão, nas duas vistas), fala preco (balão, nas duas vistas), fala troca_preco (balão, nas duas vistas), fala pechinchar (balão, nas duas vistas), fala troca_pechinchar (balão, nas duas vistas) (+12) | B.shop (act-negocio.js) | 15 saídas (fim da tarefa) | livro-razão: venda; depois: carga |
| devolver (runDevolver, js/act-negocio.js) | negocio | mãos, armazém do povo | a tarefa da pessoa, passo a passo | tirarDaBanca → arrange → gesto das mãos | — | B.task (act-negocio.js) | 5 saídas (fim da tarefa) | livro-razão: troca; depois: carga |
| oficio (runOficio, js/act-oficio.js) | oficio | mãos, prateleira do prédio, armazém do povo, chão | a tarefa da pessoa, passo a passo | cavar → dig → swing; levantar → lift → carry; alimentarFogo → feed → low; pousar → lift → carry; amassar → fill → low; moldar → craft → low; enfornar → lift → carry; desenfornar → lift → carry; empilhar → lift → carry; tornear → pottery → sit; fiar → craft → low; tecer → weave → sit; forjar → forge → swing; lavrar → craft → low; encher → fill → low | partícula chips (vista do deus), partícula sparkle (vista do deus), texto deposit (nas duas vistas) | haul (act-oficio.js), step (act-oficio.js), resume (act-oficio.js) | 32 saídas (fim da tarefa) | livro-razão: barreiro, buscar, pegar, fornada, desgaste, entrega, lenha, recolher; depois: carga |
| tavern (runFregues, js/act-taverna.js) | taverna | mãos, prateleira do prédio | a tarefa da pessoa, passo a passo | comer → eat → eat; beber → drink → talk; tocar → play → strum; «sit» → sit; «fight» → fight | texto floater (nas duas vistas), fala cheia (balão, nas duas vistas), fala pedir_taverna (balão, nas duas vistas), fala sem_servico (balão, nas duas vistas), fala acabou (balão, nas duas vistas), fala sem_dinheiro (balão, nas duas vistas) (+3) | T.visitTask (act-taverna.js), load (act-taverna.js) | 4 saídas (fim da tarefa) | livro-razão: refeicao, bebida, taverna |
| atender (runAtender, js/act-taverna.js) | taverna | prateleira do prédio, mãos | a tarefa da pessoa, passo a passo | servir → serve → talk | fala acabou (balão, nas duas vistas), fala sem_dinheiro (balão, nas duas vistas), fala servir_taverna (balão, nas duas vistas) | callKeeper (act-taverna.js), T.task (act-taverna.js) | 4 saídas (fim da tarefa) | livro-razão: taverna |
| abastecer (runAbastecer, js/act-taverna.js) | taverna | prateleira do prédio, armazém do povo, mãos | a tarefa da pessoa, passo a passo | examinar → examine → interact | — | T.task (act-taverna.js) | 4 saídas (fim da tarefa) | livro-razão: atacado, taverna-povo; depois: carga |
| termas (runBanho, js/act-servicos.js) | lenhaTermas | armazém do povo | a tarefa da pessoa, passo a passo | despir → undress → interact; banhar → sit → sit | fala termas_cheia (balão, nas duas vistas), fala banho_quente (balão, nas duas vistas), fala banho_frio (balão, nas duas vistas), sinal sad | Te.visit (act-servicos.js), load (act-servicos.js) | 5 saídas (fim da tarefa) | livro-razão: termas, termas-volta |
| fornalha (runFornalha, js/act-servicos.js) | lenhaTermas | prateleira do prédio, mãos | a tarefa da pessoa, passo a passo | alimentarFogo → feed → low | partícula sparkle (vista do deus) | Te.task (act-servicos.js) | 4 saídas (fim da tarefa) | livro-razão: fornalha |
| lenhaTermas (runLenha, js/act-servicos.js) | lenhaTermas | prateleira do prédio, armazém do povo, mãos | a tarefa da pessoa, passo a passo | levantar → lift → carry | — | Te.task (act-servicos.js) | 5 saídas (fim da tarefa) | livro-razão: termas; depois: carga |
| teatro (runPlateia, js/act-lazer.js) | espetaculo | armazém do povo | a tarefa da pessoa, passo a passo | «sit» → sit | fala teatro_cheio (balão, nas duas vistas), sinal sad, sinal happy | Tt.visit (act-lazer.js), load (act-lazer.js) | 5 saídas (fim da tarefa) | livro-razão: teatro |
| atuar (runAtor, js/act-lazer.js) | espetaculo | — | a tarefa da pessoa, passo a passo | lutarJogo → fight → fight; atuar → talk → talk; «wait» → idle | — | callActors (act-lazer.js), Tt.task (act-lazer.js), load (act-lazer.js) | 3 saídas (fim da tarefa) | — |
| ler (runLeitor, js/act-lazer.js) | espetaculo | — | a tarefa da pessoa, passo a passo | ler → read → sit | sinal sad | Bi.visit (act-lazer.js), load (act-lazer.js) | 5 saídas (fim da tarefa) | — |
| copiar (runCopista, js/act-lazer.js) | espetaculo | — | a tarefa da pessoa, passo a passo | copiar → write → sit | — | Bi.task (act-lazer.js) | 3 saídas (fim da tarefa) | — |
| lar (runLar, js/act-lar.js) | lar | casa | a tarefa da pessoa, passo a passo | cozinhar → cook → cook; sentar → sit → sit; comer → eat → eat; ninar → rock → rock | sinal sick, sinal food, sinal heart, sinal sad, sinal question, sinal chat | give (act-lar.js) | 7 saídas (fim da tarefa) | livro-razão: ceia, refeicao |
| fish (case fish, js/villagers.js) | pesca | — | a tarefa da pessoa, passo a passo | «fish» → interact | partícula splash (vista do deus), sinal fish | fishTask (villagers.js) | 3 saídas (fim da tarefa) | — |
| pray (case pray, js/villagers.js) | lar | — | a tarefa da pessoa, passo a passo | «pray» → pray | partícula prayer (vista do deus), texto faithText (nas duas vistas) | Wr.captiveDecide (war.js), start (villagers.js), leisureTask (villagers.js), workTask (villagers.js), P.dream (fates.js) | 4 saídas (fim da tarefa) | — |
| (decisão) (A.hooks.tick, js/act-casa.js) | casa | casa, bolsa, armazém do povo | decisão, sem tarefa nem corpo que se veja | nenhuma: não há gesto | — | o passo do mundo, uma vez por dia (act-casa.js) | — | livro-razão: aluguel, venda-casa, obra-devolvida, mudança, obra-casa |
| (decisão) (A.hooks.tick, js/act-taverna.js) | taverna | prateleira do prédio | decisão, sem tarefa nem corpo que se veja | nenhuma: não há gesto | — | o passo do mundo, uma vez por dia (act-taverna.js) | — | — |
| (decisão) (A.hooks.tick, js/act-servicos.js) | lenhaTermas | prateleira do prédio | decisão, sem tarefa nem corpo que se veja | nenhuma: não há gesto | — | o passo do mundo, uma vez por dia (act-servicos.js) | — | — |
| (decisão) (A.hooks.tick, js/act-servicos.js) | lenhaTermas | prateleira do prédio, armazém do povo | decisão, sem tarefa nem corpo que se veja | nenhuma: não há gesto | — | o passo do mundo, uma vez por dia (act-servicos.js) | — | livro-razão: sustento, oferenda |
| (decisão) (A.hooks.tick, js/act-lazer.js) | espetaculo | prateleira do prédio | decisão, sem tarefa nem corpo que se veja | nenhuma: não há gesto | — | o passo do mundo, uma vez por dia (act-lazer.js) | — | — |

## Os gestos (G.Act.ANIM) e as poses do 3D

| Gesto | Ato | Duração (s do mundo) | Contato | Mãos | Pessoas paradas | Com carga | Andando | Gesto das mãos | Corpo do jogador | Quem usa |
|---|---|---|---|---|---|---|---|---|---|---|
| levantar | lift | 1 | 0.6 | 2 | carry | carry | walk | sim | carry | oferta descarga.pegar, oferta descarga.pegarChao, oferta oficio.levar, oferta lar.pegarBebe (+3) |
| pousar | lift | 0.8 | 0.5 | 2 | carry | carry | walk | sim | carry | oferta descarga.depositar, oferta descarga.pousar, oferta oficio.argila, passo carga (+2) |
| empilhar | lift | 1.1 | 0.7 | 2 | carry | carry | walk | sim | carry | oferta oficio.unidade, passo oficio |
| carregar | (carregar) | 0 | 0 | 2 | carry | carry | carryWalk | — | carry | — |
| carregarPesado | (carregar) | 0 | 0 | 2 (pesado) | carry | carry | carryWalk | — | carry | — |
| carregarDois | carry2 | 0 | 0 | 2 (em dupla) | carry | carry | carryWalk | a caixa de quem conduz, entre os dois (G.Act.pair → People3D) | interact | passo ajudar |
| porNaBanca | arrange | 1.2 | 0.8 | 2 | idle | carry | walk | sim | carry | oferta negocio.porNaBanca |
| tirarDaBanca | arrange | 0.9 | 0.5 | 2 | idle | carry | walk | sim | carry | oferta negocio.tirarDaBanca, passo devolver |
| entregar | give | 0.8 | 0.5 | 1 | idle | carry | walk | sim | interact | oferta publico.entregar, oferta lar.darBebe |
| receberMoedas | pay | 0.8 | 0.5 | 1 | interact | interact | walk | — | interact | — |
| pagar | pay | 0.8 | 0.5 | 1 | interact | interact | walk | — | interact | oferta negocio.comprar, oferta negocio.aceitarContra, oferta casa.encomendar, passo compra |
| pechinchar | haggle | 2.2 | 1.6 | 0 | talk | talk | walk | — | talk | oferta negocio.pechinchar, passo compra |
| examinar | examine | 1.6 | 1.2 | 1 | interact | interact | walk | — | interact | oferta negocio.atacado, passo atacado, passo abastecer |
| contar | count | 2.4 | 2 | 1 | interact | interact | walk | — | interact | passo conferir |
| chamarAjuda | call | 1.2 | 0.6 | 0 | talk | talk | walk | — | wave | — |
| apontar | point | 1 | 0.5 | 1 | talk | talk | walk | — | interact | oferta negocio.abrir, oferta negocio.fechar, oferta negocio.precoMais, oferta negocio.precoMenos (+6) |
| esperar | wait | 0 | 0 | 0 | idle | idle | walk | — | interact | passo descarga, passo ajudar, passo compra |
| vender | sell | 0 | 0 | 0 | talk | talk | walk | — | interact | passo banca |
| comprar | buy | 0 | 0 | 0 | talk | talk | walk | — | interact | — |
| comer | eat | 1.6 | 1.2 | 1 | eat | eat | walk | — | eat | oferta taverna.consumir, oferta lar.comer, passo tavern, passo lar |
| sentar | sit | 0 | 0 | 0 | sit | sit | walk | — | sit | passo lar |
| pescarMaos | fish | 2.2 | 1.2 | 2 | interact | interact | walk | — | interact | passo fish (o lance, pelo jeito do povo: G.Pesca.castDur), verbo peixe (o lance das mãos: G.Pesca.castDur) |
| pescarArpao | fish | 5 | 4.6 | 2 | interact | interact | walk | — | interact | passo fish (o lance, pelo jeito do povo: G.Pesca.castDur) |
| pescarLinha | fish | 6.5 | 6 | 2 | interact | interact | walk | — | interact | passo fish (o lance, pelo jeito do povo: G.Pesca.castDur) |
| pescarRede | fish | 7.5 | 6.8 | 2 | interact | interact | walk | — | interact | passo fish (o lance, pelo jeito do povo: G.Pesca.castDur) |
| cavar | dig | 5 | 4.6 | 2 | swing | swing | walk | — | interact | passo oficio |
| amassar | fill | 4 | 3.6 | 2 | low | low | walk | — | interact | oferta oficio.unidade, passo oficio |
| moldar | craft | 3 | 2.6 | 2 | low | low | walk | — | interact | oferta oficio.unidade, passo oficio |
| tornear | pottery | 4 | 3.6 | 2 | sit | sit | walk | — | interact | oferta oficio.unidade, passo oficio |
| enfornar | lift | 1.6 | 1.2 | 2 | carry | carry | walk | sim | carry | oferta oficio.unidade, passo oficio |
| desenfornar | lift | 1.6 | 1.2 | 2 | carry | carry | walk | sim | carry | oferta oficio.unidade, passo oficio |
| alimentarFogo | feed | 2 | 1.6 | 2 | low | low | walk | — | interact | oferta oficio.lenha, oferta termas.alimentar, passo oficio, passo fornalha |
| fiar | craft | 3 | 2.6 | 2 | low | low | walk | — | interact | oferta oficio.unidade, passo oficio |
| tecer | weave | 4 | 3.6 | 2 | sit | sit | walk | — | interact | oferta oficio.unidade, passo oficio |
| forjar | forge | 4 | 3.2 | 2 | swing | swing | walk | — | interact | oferta oficio.unidade, passo oficio |
| lavrar | craft | 5 | 4.4 | 2 | low | low | walk | — | interact | oferta oficio.unidade, passo oficio |
| servir | serve | 2 | 1.4 | 1 | talk | talk | walk | — | interact | oferta taverna.servir, passo atender |
| beber | drink | 6 | 5.4 | 1 | talk | talk | walk | — | interact | oferta taverna.consumir, passo tavern |
| encher | fill | 3 | 2.6 | 2 | low | low | walk | — | interact | oferta oficio.unidade, passo oficio |
| tocar | play | 4 | 3.6 | 2 | strum | strum | walk | — | interact | passo tavern |
| despir | undress | 2 | 1.5 | 2 | interact | interact | walk | — | interact | oferta termas.entrar, oferta termas.sair, passo termas |
| banhar | sit | 8 | 7.5 | 0 | sit | sit | walk | — | sit | oferta termas.banhar, passo termas |
| treinar | drill | 4 | 3.6 | 2 | talk | talk | walk | — | interact | oferta publico.treinar |
| escrever | write | 5 | 4.4 | 1 | sit | sit | walk | — | interact | oferta publico.escrever |
| cunhar | craft | 6 | 5.4 | 2 | low | low | walk | — | interact | oferta publico.cunhar |
| cobrar | knock | 1.8 | 1.6 | 1 | interact | interact | walk | — | interact | oferta publico.cobrar |
| assistir | sit | 2 | 1.2 | 0 | sit | sit | walk | — | sit | oferta espetaculo.assistir |
| atuar | talk | 6 | 5.4 | 2 | talk | talk | walk | — | interact | oferta espetaculo.atuar, passo atuar |
| lutarJogo | fight | 4 | 3.6 | 2 | fight | fight | walk | — | interact | passo atuar |
| ler | read | 4 | 3 | 1 | sit | sit | walk | — | interact | oferta leitura.ler, passo ler |
| copiar | write | 6 | 5.4 | 1 | sit | sit | walk | — | interact | oferta leitura.copiar, passo copiar |
| falar | talk | 8 | 7.2 | 2 | talk | talk | walk | — | interact | oferta leitura.falar |
| cozinhar | cook | 9 | 8.8 | 2 | cook | cook | walk | — | cook | oferta lar.cozinhar, passo lar |
| ninar | rock | 0 | 0 | 2 | rock | rock | walk | — | rock | passo lar |
| rezar | pray | 5 | 4.8 | 0 | pray | pray | walk | — | interact | — |

## As ofertas colhidas nos mundos prontos

| Mundo | Oferta | Gesto | Mãos | Vezes | Onde | Pode? | Exemplo |
|---|---|---|---|---|---|---|---|
| cidade | casa.encomendar | pagar | 1 | 76 | no cais · família sem casa, no armazém · na beira da água | sim | Pedir ao povo uma casa para a família |
| cidade | descarga.pegar | levantar | 1 | 294 | no cais | não: A descarga está parada (a noite). | Pegar a caixa de comida (4) |
| cidade | lar.darBebe | entregar | 1 | 1 | na beira da água | sim | Dar Aquiles a Penélope |
| cidade | lar.pegarBebe | levantar | 2 | 26 | família sem casa, no armazém · na beira da água | sim | Pegar Aquiles no colo |
| cidade | leitura.falar | falar | 2 | 42 | no cais · família sem casa, no armazém · na beira da água | sim | Falar ao povo |
| cidade | negocio.abrir | apontar | 0 | 25 | dono na banca | sim | Abrir a banca |
| cidade | negocio.porNaBanca | porNaBanca | 2 | 25 | dono na banca | sim | Pôr 3 de comida na banca |
| metropole | casa.encomendar | pagar | 1 | 150 | dono no armazém · no cais · família sem casa, no armazém · na beira da água | sim | Pagar uma casa para a família (uns 18 moedas) |
| metropole | descarga.pegar | levantar | 0 | 519 | no cais · família sem casa, no armazém · na beira da água | não: A descarga está parada (a noite). | Pegar o que der da caixa de pedra (pesada) |
| metropole | descarga.pegarChao | levantar | 1 | 49 | no cais | sim | Pegar a caixa de comida do chão |
| metropole | lar.pegarBebe | levantar | 2 | 1 | na beira da água | sim | Pegar Runa no colo |
| metropole | leitura.falar | falar | 2 | 10 | dono na banca · comprador diante da banca · comprador com contraproposta | sim | Falar ao povo |
| metropole | negocio.abrir | apontar | 0 | 150 | dono na banca · dono com mercadoria nas mãos · dono com a banca arrumada | sim | Abrir a banca |
| metropole | negocio.aceitarContra | pagar | 1 | 126 | comprador com contraproposta · comprador diante da banca · na beira da água | sim | Aceitar 3,33 grãos de cacau |
| metropole | negocio.atacado | examinar | 2 | 250 | dono no armazém | sim | Comprar 1 de comida no atacado para a banca (0,15 grãos de cacau) |
| metropole | negocio.comprar | pagar | 1 | 2385 | dono na banca · dono com mercadoria nas mãos · dono com a banca arrumada · comprador diante da banca · comprador com contraproposta · na beira da água | sim | Comprar 1 de cacau por 3,6 grãos de cacau |
| metropole | negocio.pechinchar | pechinchar | 0 | 2385 | dono na banca · dono com mercadoria nas mãos · dono com a banca arrumada · comprador diante da banca · comprador com contraproposta · na beira da água | sim | Oferecer 3,06 grãos de cacau por 1 de cacau |
| metropole | negocio.porNaBanca | porNaBanca | 2 | 25 | dono com mercadoria nas mãos | sim | Pôr 1 de comida na banca |
| metropole | negocio.precoMais | apontar | 0 | 600 | dono na banca · dono com mercadoria nas mãos · dono com a banca arrumada | sim | Subir o preço de cacau (3.6) |
| metropole | negocio.precoMenos | apontar | 0 | 600 | dono na banca · dono com mercadoria nas mãos · dono com a banca arrumada | sim | Baixar o preço de cacau (3.6) |
| metropole | negocio.tirarDaBanca | tirarDaBanca | 2 | 500 | dono na banca · dono com a banca arrumada | sim | Tirar cacau da banca |

## Incoerências e lacunas

### (a) Oferta ou passo com gesto fora de G.Act.ANIM (falha) — 0

Nenhuma.

### (b) Ato de G.Act.ANIM sem pose no 3D (falha) — 0

Nenhuma.

### (c) Gestos de G.Act.ANIM que ninguém usa — 6

- carregar (carregar, 0 s)
- carregarPesado (carregar, 0 s)
- receberMoedas (pay, 0.8 s)
- chamarAjuda (call, 1.2 s)
- comprar (buy, 0 s)
- rezar (pray, 5 s)

### (d) Atos de uma definição sem oferta e sem passo de NPC — 0

Nenhuma.

### (e) Ações sem retorno audiovisual nenhum — 13

- o ato do corpo oficio.unidade
- o passo «ajudar» (descarga, js/act-porto.js)
- o passo «atacado» (negocio, js/act-negocio.js)
- o passo «devolver» (negocio, js/act-negocio.js)
- o passo «abastecer» (taverna, js/act-taverna.js)
- o passo «lenhaTermas» (lenhaTermas, js/act-servicos.js)
- o passo «atuar» (espetaculo, js/act-lazer.js)
- o passo «copiar» (espetaculo, js/act-lazer.js)
- o passo «(decisão)» (casa, js/act-casa.js)
- o passo «(decisão)» (taverna, js/act-taverna.js)
- o passo «(decisão)» (lenhaTermas, js/act-servicos.js)
- o passo «(decisão)» (lenhaTermas, js/act-servicos.js)
- o passo «(decisão)» (espetaculo, js/act-lazer.js)

### (e, no 3D) Passos cujo retorno só a vista do deus mostra — as partículas de G.FX (as falas de G.Talk e os textos de G.FX o 3D do Modo Encarnado também desenha: incui.js, L-211) — 1

- o passo «fornalha» (lenhaTermas): partícula sparkle (vista do deus)

