'use strict';
// ============================================================
//  As Tabuletas (G.Cartas; a quarta onda da taverna, T5 — D-860
//  a D-869): o jogo de cartas de cada povo. Não há papel nesses
//  mundos: as «cartas» são tabuletas pintadas — de madeira, de
//  barro, de cera, de amate, de papiro —, e o jogo se chama assim.
//  Este arquivo é puro (regra 390): as tabuletas de cada povo (os
//  deuses, as criaturas, os heróis e os presságios das mitologias
//  de verdade), a regra e a inteligência de quem joga — uma
//  função do estado da partida, sem o mundo, sem acaso nenhum: o
//  embaralhar, a compra do monte e toda escolha de quem joga
//  saem do G.hash da partida, da rodada e de quem joga (D-669).
//  Quem joga no mundo, a aposta pelo livro, o baralho de verdade
//  e o que se vê à mesa são do cartas-mesa.js; o desenho, do
//  cartas-arte.js; a tela, do cartas-ui.js.
//
//  A regra (D-860), para quem nunca jogou:
//   Cada um tem as 20 tabuletas do seu povo, embaralhadas, e cinco
//   na mão. A partida tem sete rodadas, e cada rodada vale uma
//   oferenda que cresce: 1, 1, 2, 2, 3, 3, 4. Em cada rodada os
//   dois escolhem uma tabuleta e a põem virada; viram juntos. A de
//   maior força leva a oferenda; no empate a oferenda fica no
//   altar e se soma à da rodada seguinte. Mas cada tabuleta tem o
//   seu poder, que é o do mito: Thor golpeia, Zeus fulmina a mais
//   forte, Loki troca as forças, Odin vê o que o outro vai jogar,
//   Poseidon traz a maré que dobra a rodada, Anúbis pesa e não
//   deixa perder, Quetzalcóatl renasce e volta à mão. Quem tiver
//   mais glória depois da sétima rodada ganha. Uma vez por
//   partida, no começo de uma rodada, cada um pode dobrar a
//   aposta: o outro aceita, ou desiste e perde o que estava no
//   pote. A decisão é quando gastar os deuses: cedo, para abrir
//   vantagem, ou guardados para as rodadas grandes — sabendo que
//   o outro também os guarda.
// ============================================================
(function (G) {
  const C = G.Cartas = G.Cartas || {};
  C.VERSAO = 1;
  C.NOME = 'Tabuletas'; // (o nome do jogo: tábuas pintadas — não há papel nesses mundos)
  C.POVOS = Object.freeze(['romano', 'grego', 'egipcio', 'nordico', 'asteca', 'classico']);
  C.RAR = Object.freeze(['comum', 'incomum', 'rara', 'lendaria', 'unica']);
  C.RAR_NOME = Object.freeze({ comum: 'Comum', incomum: 'Incomum', rara: 'Rara', lendaria: 'Lendária', unica: 'Única' });
  C.TIPO_NOME = Object.freeze({ deus: 'Deus', criatura: 'Criatura', heroi: 'Herói', pressagio: 'Presságio' });
  C.OF = Object.freeze([1, 1, 2, 2, 3, 3, 4]); // (a oferenda de cada uma das sete rodadas)
  C.RODADAS = C.OF.length;
  C.MAO = 5; // (as tabuletas na mão no começo)

  // ------------------------------ os poderes ------------------------------
  // cada tabuleta tem um poder (ou nenhum), com o seu número (n). A ordem de uma rodada: a égide cala o poder da outra; os presságios
  // e as maldições da rodada de antes; os bônus de cada uma (a fúria, a legião, o bando, a grandeza, o sacrifício); os golpes e o
  // raio, ao mesmo tempo; a trapaça troca as forças; a maior vence — a pesagem não deixa perder, a justiça vence os empates —; a
  // maré dobra a oferenda; e depois, de quem não foi calado, o que fica para a partida (renascer, comprar, furtar, devorar, ver)
  C.PODER = Object.freeze({
    golpe: { nome: 'Golpe', txt: n => `a outra perde ${n}.` },
    raio: { nome: 'Raio', txt: () => 'se a outra for mais forte, ela perde 4.' },
    troca: { nome: 'Trapaça', txt: () => 'as duas forças trocam de lado.' },
    egide: { nome: 'Égide', txt: () => 'o poder da outra não vale.' },
    visao: { nome: 'Visão', txt: () => 'na próxima rodada o outro mostra primeiro.' },
    mare: { nome: 'Maré', txt: () => 'esta rodada vale o dobro.' },
    pesagem: { nome: 'Pesagem', txt: () => 'se esta perder, a rodada empata.' },
    renasce: { nome: 'Renasce', txt: () => 'se não vencer, volta para a mão.' },
    furia: { nome: 'Fúria', txt: n => `+${n} se você perdeu a rodada anterior.` },
    legiao: { nome: 'Legião', txt: n => `+${n} por rodada que você já venceu (até ${3 * n}).` },
    bando: { nome: 'Bando', txt: n => `+${n} se houver outro herói na sua mão.` },
    alto: { nome: 'Grandeza', txt: n => `+${n} nas rodadas que valem 3 ou mais.` },
    sacrificio: { nome: 'Sacrifício', txt: () => 'descarta a mais fraca da sua mão e soma a força dela.' },
    compra: { nome: 'Mensageiro', txt: n => (n > 1 ? `compre ${n} tabuletas.` : 'compre uma tabuleta.') },
    colhe: { nome: 'Colheita', txt: n => (n > 1 ? `se vencer, compre ${n}.` : 'se vencer, compre uma.') },
    furto: { nome: 'Furto', txt: () => 'se vencer, tome a melhor tabuleta da mão do outro.' },
    devora: { nome: 'Devora', txt: () => 'se vencer, o outro descarta a melhor da mão.' },
    presagio: { nome: 'Presságio', txt: n => `a sua próxima tabuleta tem +${n}.` },
    maldicao: { nome: 'Maldição', txt: n => `a próxima tabuleta do outro perde ${n}.` },
    firme: { nome: 'Firme', txt: () => 'não perde força por golpe, raio nem maldição.' },
    juiz: { nome: 'Justiça', txt: () => 'vence os empates.' },
    oferenda: { nome: 'Oferenda', txt: n => `se vencer, +${n} de glória.` },
  });
  // (o quanto um poder vale para quem pesa uma tabuleta: a inteligência guarda as de mais valor para as rodadas grandes)
  const VALE = { golpe: 0.8, raio: 2.2, troca: 3.2, egide: 1.6, visao: 1.4, mare: 1.2, pesagem: 1.4, renasce: 1.8, furia: 0.9, legiao: 1, bando: 0.8, alto: 1, sacrificio: 1, compra: 1.1, colhe: 0.7, furto: 1.6, devora: 1.4, presagio: 1.6, maldicao: 1.4, firme: 0.4, juiz: 0.6, oferenda: 1.1, '': 0 };

  // ------------------------------ as tabuletas de cada povo ------------------------------
  // [chave, nome, tipo, raridade, força, poder, n, o mito numa frase]. Todo povo tem as mesmas peças: uma única (o deus maior), três
  // lendárias, quatro raras, seis incomuns e seis comuns; e os mesmos papéis — o deus que decide, o trapaceiro, quem protege, quem
  // vê, quem dobra a rodada, quem devora ou furta, quem renasce, os heróis, os mensageiros, os presságios —, cada um com o seu mito
  // e com o jeito do povo (a fúria do norte, os heróis gregos, a pesagem do Egito, o sacrifício asteca, a legião romana, os titãs).
  // O povo clássico (o que não é dos cinco) joga com os Titãs e as forças de antes dos deuses: Cronos, Gaia, Prometeu, Atlas (D-861)
  const ROWS = {
    nordico: [
      ['odin', 'Odin', 'deus', 'unica', 9, 'visao', 0, 'O Pai de Todos deu um olho no poço de Mímir para ver tudo o que há.'],
      ['thor', 'Thor', 'deus', 'lendaria', 7, 'golpe', 2, 'O martelo Mjölnir volta sempre à mão de quem o lança, com o trovão.'],
      ['fenrir', 'Fenrir', 'criatura', 'lendaria', 6, 'devora', 0, 'O lobo acorrentado pelos deuses, que há de engolir o sol.'],
      ['loki', 'Loki', 'deus', 'lendaria', 1, 'troca', 0, 'O deus das artimanhas muda de forma e de lado quando lhe convém.'],
      ['heimdall', 'Heimdall', 'deus', 'rara', 5, 'egide', 0, 'O vigia da ponte do arco-íris ouve a lã crescer no lombo das ovelhas.'],
      ['freyja', 'Freyja', 'deus', 'rara', 5, 'renasce', 0, 'A senhora de Fólkvangr recebe metade dos que caem na batalha.'],
      ['jormungandr', 'Jörmungandr', 'criatura', 'rara', 5, 'alto', 3, 'A serpente do mundo abraça a terra e morde a própria cauda.'],
      ['ragnarok', 'Ragnarök', 'pressagio', 'rara', 5, 'mare', 0, 'O crepúsculo dos deuses: o lobo solto, a serpente na praia, o fogo.'],
      ['tyr', 'Tyr', 'deus', 'incomum', 5, 'firme', 0, 'Pôs a mão na boca de Fenrir para que os deuses o prendessem.'],
      ['valquiria', 'Valquíria', 'heroi', 'incomum', 4, 'colhe', 1, 'Escolhe os mortos no campo e os leva ao salão do Valhala.'],
      ['berserker', 'Berserker', 'heroi', 'incomum', 3, 'furia', 3, 'Vestido de urso, luta sem escudo, sem dor e sem medo.'],
      ['sleipnir', 'Sleipnir', 'criatura', 'incomum', 4, 'compra', 1, 'O cavalo de oito patas de Odin corre por cima do mar e do ar.'],
      ['corvos', 'Hugin e Munin', 'criatura', 'incomum', 2, 'compra', 2, 'Pensamento e Memória voam o mundo e voltam ao ombro de Odin.'],
      ['yggdrasil', 'Yggdrasil', 'pressagio', 'incomum', 2, 'pesagem', 0, 'O freixo do mundo segura os nove mundos nos seus galhos.'],
      ['jotunn', 'Jötunn', 'criatura', 'comum', 6, '', 0, 'Os gigantes do gelo, filhos de Ymir, descem das montanhas.'],
      ['einherjar', 'Einherjar', 'heroi', 'comum', 4, 'bando', 1, 'Os guerreiros do Valhala lutam o dia todo e banqueteiam a noite.'],
      ['escudeira', 'Escudeira', 'heroi', 'comum', 3, 'firme', 0, 'A donzela do escudo segura a parede de tábuas na linha.'],
      ['draugr', 'Draugr', 'criatura', 'comum', 2, 'renasce', 0, 'O morto que não fica no túmulo e volta para guardar o seu ouro.'],
      ['runas', 'As Runas', 'pressagio', 'comum', 0, 'presagio', 3, 'Lançadas sobre o pano branco, dizem o que vem.'],
      ['fimbulvetr', 'Fimbulvetr', 'pressagio', 'comum', 1, 'maldicao', 2, 'O grande inverno: três anos de neve, sem verão no meio.'],
    ],
    grego: [
      ['zeus', 'Zeus', 'deus', 'unica', 9, 'raio', 0, 'O rei do Olimpo lança o raio que os Ciclopes forjaram para ele.'],
      ['poseidon', 'Poseidon', 'deus', 'lendaria', 6, 'mare', 0, 'Com o tridente, o senhor do mar levanta as ondas e sacode a terra.'],
      ['hades', 'Hades', 'deus', 'lendaria', 6, 'furto', 0, 'O senhor dos mortos guarda tudo o que desce ao seu reino.'],
      ['hermes', 'Hermes', 'deus', 'lendaria', 1, 'troca', 0, 'O mensageiro de sandálias aladas roubou o gado de Apolo no dia em que nasceu.'],
      ['atena', 'Atena', 'deus', 'rara', 5, 'egide', 0, 'A deusa da sabedoria leva a égide com a cabeça da Medusa.'],
      ['apolo', 'Apolo', 'deus', 'rara', 5, 'visao', 0, 'O deus da lira e do sol fala pela boca da Pítia, em Delfos.'],
      ['ares', 'Ares', 'deus', 'rara', 4, 'furia', 3, 'O deus da guerra se alegra com o barulho das lanças.'],
      ['medusa', 'Medusa', 'criatura', 'rara', 4, 'golpe', 3, 'Quem olha nos olhos da górgona vira pedra.'],
      ['heracles', 'Héracles', 'heroi', 'incomum', 5, 'bando', 2, 'O filho de Zeus fez os doze trabalhos e venceu a morte.'],
      ['perseu', 'Perseu', 'heroi', 'incomum', 4, 'bando', 2, 'Cortou a cabeça da Medusa olhando o reflexo no escudo.'],
      ['aquiles', 'Aquiles', 'heroi', 'incomum', 4, 'firme', 0, 'Mergulhado no Estige, nenhuma arma o fere — menos no calcanhar.'],
      ['minotauro', 'Minotauro', 'criatura', 'incomum', 5, '', 0, 'O homem com cabeça de touro espera no meio do labirinto.'],
      ['odisseu', 'Odisseu', 'heroi', 'incomum', 3, 'compra', 2, 'O rei de muitos ardis levou dez anos para voltar para casa.'],
      ['cerbero', 'Cérbero', 'criatura', 'incomum', 4, 'pesagem', 0, 'O cão de três cabeças não deixa ninguém sair do Hades.'],
      ['hoplita', 'Hoplita', 'heroi', 'comum', 4, 'bando', 1, 'Escudo com escudo, a falange anda como um muro de bronze.'],
      ['ciclope', 'Ciclope', 'criatura', 'comum', 5, '', 0, 'O gigante de um olho só guarda o seu rebanho na caverna.'],
      ['hidra', 'Hidra', 'criatura', 'comum', 2, 'renasce', 0, 'Corte uma cabeça e nascem duas no lugar.'],
      ['pegaso', 'Pégaso', 'criatura', 'comum', 3, 'compra', 1, 'O cavalo alado nasceu do sangue da Medusa.'],
      ['delfos', 'Oráculo de Delfos', 'pressagio', 'comum', 0, 'presagio', 3, 'Sobre a trípode, a Pítia diz o que os deuses querem.'],
      ['pandora', 'A Caixa de Pandora', 'pressagio', 'comum', 1, 'maldicao', 2, 'Aberta, soltou os males do mundo; no fundo ficou a esperança.'],
    ],
    egipcio: [
      ['ra', 'Rá', 'deus', 'unica', 8, 'alto', 2, 'O sol atravessa o céu de dia na sua barca e o mundo dos mortos à noite.'],
      ['horus', 'Hórus', 'deus', 'lendaria', 7, 'golpe', 2, 'O falcão vingou o pai e o seu olho é a lua e o sol.'],
      ['osiris', 'Osíris', 'deus', 'lendaria', 6, 'renasce', 0, 'Morto pelo irmão e trazido de volta por Ísis, reina sobre os mortos.'],
      ['seth', 'Seth', 'deus', 'lendaria', 1, 'troca', 0, 'O senhor do deserto e da tempestade enganou Osíris com um cofre.'],
      ['isis', 'Ísis', 'deus', 'rara', 5, 'egide', 0, 'A grande maga abre as asas sobre quem ela protege.'],
      ['anubis', 'Anúbis', 'deus', 'rara', 5, 'pesagem', 0, 'O chacal pesa o coração de cada morto contra a pena de Maat.'],
      ['thoth', 'Thoth', 'deus', 'rara', 4, 'visao', 0, 'O íbis inventou a escrita e anota a sentença de cada coração.'],
      ['ammit', 'Ammit', 'criatura', 'rara', 5, 'devora', 0, 'A devoradora come o coração que pesou mais que a pena.'],
      ['sekhmet', 'Sekhmet', 'deus', 'incomum', 5, 'furia', 3, 'A leoa de Rá quase devorou a humanidade inteira.'],
      ['bastet', 'Bastet', 'deus', 'incomum', 4, 'firme', 0, 'A gata guarda a casa, o fogo e as crianças.'],
      ['esfinge', 'Esfinge', 'criatura', 'incomum', 5, 'juiz', 0, 'Leão com cabeça de rei, vigia o planalto desde antes da memória.'],
      ['bennu', 'Bennu', 'criatura', 'incomum', 3, 'renasce', 0, 'A ave do sol, a fênix, renasce em Heliópolis a cada aurora.'],
      ['nilo', 'A Cheia do Nilo', 'pressagio', 'incomum', 3, 'mare', 0, 'Hapi traz a água e o lodo negro que dão o trigo.'],
      ['sobek', 'Sobek', 'deus', 'incomum', 6, '', 0, 'O crocodilo do rio é forte como a correnteza.'],
      ['escriba', 'O Escriba', 'heroi', 'comum', 2, 'compra', 2, 'De pernas cruzadas, o escriba conta o trigo e as palavras.'],
      ['medjay', 'Medjay', 'heroi', 'comum', 4, 'bando', 1, 'Os arqueiros do deserto guardam as tumbas dos reis.'],
      ['carro', 'Carro de Guerra', 'heroi', 'comum', 5, '', 0, 'Dois cavalos e um arqueiro: o carro passa como o vento.'],
      ['uraeus', 'Uraeus', 'criatura', 'comum', 3, 'golpe', 1, 'A naja na testa do faraó cospe fogo nos inimigos.'],
      ['khepri', 'O Escaravelho', 'pressagio', 'comum', 0, 'presagio', 3, 'Khepri rola o sol pelo céu como a bola de barro.'],
      ['apofis', 'Apófis', 'pressagio', 'comum', 1, 'maldicao', 2, 'A serpente do caos ataca a barca do sol toda noite.'],
    ],
    asteca: [
      ['quetzalcoatl', 'Quetzalcóatl', 'deus', 'unica', 8, 'renasce', 0, 'A serpente emplumada partiu pelo mar e prometeu voltar.'],
      ['huitzilopochtli', 'Huitzilopochtli', 'deus', 'lendaria', 7, 'oferenda', 1, 'O beija-flor da esquerda, sol e guerra, nasceu armado da mãe.'],
      ['tlaloc', 'Tláloc', 'deus', 'lendaria', 6, 'mare', 0, 'O senhor da chuva guarda a água nos quatro jarros do céu.'],
      ['tezcatlipoca', 'Tezcatlipoca', 'deus', 'lendaria', 1, 'troca', 0, 'O Espelho Fumegante vê o coração de cada um e o vira do avesso.'],
      ['coatlicue', 'Coatlicue', 'deus', 'rara', 5, 'egide', 0, 'A mãe da terra veste a saia de serpentes.'],
      ['tonatiuh', 'Tonatiuh', 'deus', 'rara', 5, 'visao', 0, 'O Quinto Sol olha o mundo do centro da pedra.'],
      ['mictlantecuhtli', 'Mictlantecuhtli', 'deus', 'rara', 5, 'devora', 0, 'O senhor do Mictlan, de ossos à mostra, guarda os mortos.'],
      ['xipe', 'Xipe Tótec', 'deus', 'rara', 4, 'sacrificio', 0, 'O senhor da primavera troca de pele como a semente.'],
      ['aguia', 'Guerreiro-Águia', 'heroi', 'incomum', 4, 'bando', 2, 'O soldado do sol, com o bico da águia no elmo.'],
      ['jaguar', 'Guerreiro-Jaguar', 'heroi', 'incomum', 4, 'bando', 2, 'O soldado da noite veste a pele do jaguar.'],
      ['xochiquetzal', 'Xochiquétzal', 'deus', 'incomum', 3, 'compra', 2, 'A senhora das flores, da beleza e dos ofícios.'],
      ['ahuizotl', 'Ahuízotl', 'criatura', 'incomum', 4, 'golpe', 2, 'O cão da água, com a mão no rabo, puxa os pescadores para o fundo.'],
      ['cipactli', 'Cipactli', 'criatura', 'incomum', 6, '', 0, 'O crocodilo de antes do mundo: do seu corpo os deuses fizeram a terra.'],
      ['chalchiuhtlicue', 'Chalchiuhtlicue', 'deus', 'incomum', 4, 'pesagem', 0, 'A da saia de jade guarda os lagos e os rios.'],
      ['xiuhcoatl', 'Xiuhcóatl', 'criatura', 'comum', 5, 'golpe', 1, 'A serpente de fogo, a arma do sol.'],
      ['macuahuitl', 'Guerreiro', 'heroi', 'comum', 4, 'bando', 1, 'O macuahuitl de obsidiana corta como o vento frio.'],
      ['xolotl', 'Xólotl', 'deus', 'comum', 2, 'renasce', 0, 'O cão que leva as almas ao Mictlan, gêmeo da serpente emplumada.'],
      ['sacerdote', 'O Sacerdote', 'heroi', 'comum', 2, 'sacrificio', 0, 'No alto do templo, o coração é dado ao sol.'],
      ['fogonovo', 'O Fogo Novo', 'pressagio', 'comum', 0, 'presagio', 3, 'A cada 52 anos, o fogo nasce de novo no peito de um cativo.'],
      ['eclipse', 'O Eclipse', 'pressagio', 'comum', 1, 'maldicao', 2, 'O sol comido no meio do dia: os tzitzimime descem do céu.'],
    ],
    romano: [
      ['jupiter', 'Júpiter', 'deus', 'unica', 9, 'raio', 0, 'Júpiter Ótimo Máximo reina do Capitólio, com a águia e o raio.'],
      ['marte', 'Marte', 'deus', 'lendaria', 6, 'legiao', 1, 'O pai de Rômulo marcha à frente das legiões.'],
      ['netuno', 'Netuno', 'deus', 'lendaria', 6, 'mare', 0, 'O senhor dos mares e dos cavalos, com o tridente e o golfinho.'],
      ['jano', 'Jano', 'deus', 'lendaria', 1, 'troca', 0, 'O deus das duas faces olha para o que foi e para o que vem.'],
      ['minerva', 'Minerva', 'deus', 'rara', 5, 'egide', 0, 'A deusa das artes e da guerra justa, com a coruja.'],
      ['plutao', 'Plutão', 'deus', 'rara', 5, 'furto', 0, 'O senhor das riquezas que estão debaixo da terra.'],
      ['vulcano', 'Vulcano', 'deus', 'rara', 5, 'golpe', 2, 'O ferreiro dos deuses bate o raio na bigorna, debaixo do Etna.'],
      ['lupa', 'A Loba', 'criatura', 'rara', 4, 'renasce', 0, 'A loba deu de mamar a Rômulo e Remo na beira do Tibre.'],
      ['romulo', 'Rômulo', 'heroi', 'incomum', 4, 'bando', 2, 'Arou o sulco da cidade e foi o primeiro rei.'],
      ['remo', 'Remo', 'heroi', 'incomum', 4, 'bando', 2, 'O gêmeo pulou o muro do irmão e pagou com a vida.'],
      ['venus', 'Vênus', 'deus', 'incomum', 3, 'compra', 2, 'A mãe de Eneias, o amor e a beleza.'],
      ['vesta', 'Vesta', 'deus', 'incomum', 3, 'pesagem', 0, 'O fogo dela nunca se apaga: as vestais o guardam.'],
      ['augure', 'O Áugure', 'heroi', 'incomum', 2, 'visao', 0, 'Pelo voo dos pássaros, o sacerdote lê a vontade dos deuses.'],
      ['gladiador', 'Gladiador', 'heroi', 'incomum', 5, 'furia', 2, 'Na arena, a multidão grita o nome de quem cai e se levanta.'],
      ['legionario', 'Legionário', 'heroi', 'comum', 4, 'legiao', 1, 'Escudo, gládio e vinte milhas por dia.'],
      ['pretoriano', 'Pretoriano', 'heroi', 'comum', 5, '', 0, 'A guarda do palácio não sai do lado do césar.'],
      ['fauno', 'Fauno', 'criatura', 'comum', 2, 'renasce', 0, 'O espírito do mato toca a flauta e foge para o bosque.'],
      ['gansos', 'Os Gansos do Capitólio', 'criatura', 'comum', 2, 'compra', 1, 'Os gansos de Juno acordaram a guarda na noite dos gauleses.'],
      ['triunfo', 'O Triunfo', 'pressagio', 'comum', 0, 'presagio', 3, 'O general vencedor sobe ao Capitólio com a coroa de louro.'],
      ['idos', 'Os Idos de Março', 'pressagio', 'comum', 1, 'maldicao', 2, '«Cuidado com os idos de março», disse o adivinho.'],
    ],
    classico: [
      ['cronos', 'Cronos', 'deus', 'unica', 9, 'devora', 0, 'O titã do tempo engoliu os próprios filhos, com medo de um deles.'],
      ['tifao', 'Tifão', 'criatura', 'lendaria', 7, 'golpe', 2, 'O pai dos monstros, com cem cabeças de serpente, quis o céu.'],
      ['gaia', 'Gaia', 'deus', 'lendaria', 6, 'renasce', 0, 'A Terra, mãe de tudo: o que cai nela volta a nascer.'],
      ['prometeu', 'Prometeu', 'deus', 'lendaria', 1, 'troca', 0, 'Enganou Zeus no sacrifício e roubou o fogo para os homens.'],
      ['nix', 'Nix', 'deus', 'rara', 5, 'egide', 0, 'A Noite, que até o rei dos deuses teme.'],
      ['helio', 'Hélio', 'deus', 'rara', 5, 'visao', 0, 'O sol no seu carro de fogo vê tudo o que acontece embaixo.'],
      ['oceano', 'Oceano', 'deus', 'rara', 5, 'mare', 0, 'O rio que dá a volta ao mundo, pai de todos os rios.'],
      ['atlas', 'Atlas', 'deus', 'rara', 5, 'firme', 0, 'O titã segura o céu nos ombros, no fim do mundo.'],
      ['temis', 'Têmis', 'deus', 'incomum', 4, 'juiz', 0, 'A titã da lei e da ordem, com a balança e a espada.'],
      ['mnemosine', 'Mnemósine', 'deus', 'incomum', 2, 'compra', 2, 'A Memória, mãe das nove Musas.'],
      ['quimera', 'Quimera', 'criatura', 'incomum', 5, 'furia', 3, 'Leão na frente, cabra no meio, serpente atrás, e fogo na boca.'],
      ['equidna', 'Equidna', 'criatura', 'incomum', 3, 'colhe', 1, 'Metade ninfa, metade serpente: a mãe dos monstros.'],
      ['hecatonquiro', 'Hecatonquiro', 'criatura', 'incomum', 6, '', 0, 'O de cem braços e cinquenta cabeças, guarda do Tártaro.'],
      ['selene', 'Selene', 'deus', 'incomum', 3, 'pesagem', 0, 'A Lua conduz a sua carruagem de prata pela noite.'],
      ['gigante', 'Gigante', 'criatura', 'comum', 5, '', 0, 'Os filhos da Terra, de pernas de serpente, atiram montanhas.'],
      ['curetes', 'Curetes', 'heroi', 'comum', 3, 'bando', 1, 'Batiam as lanças nos escudos para Cronos não ouvir o choro de Zeus.'],
      ['ninfa', 'Ninfa', 'criatura', 'comum', 2, 'renasce', 0, 'O espírito da fonte e da árvore vive o quanto elas viverem.'],
      ['hesperides', 'As Hespérides', 'criatura', 'comum', 2, 'compra', 1, 'As filhas da tarde guardam as maçãs de ouro.'],
      ['eos', 'Eos', 'pressagio', 'comum', 0, 'presagio', 3, 'A Aurora de dedos cor-de-rosa abre as portas do dia.'],
      ['erebo', 'Érebo', 'pressagio', 'comum', 1, 'maldicao', 2, 'A Escuridão de baixo do mundo, por onde passam os mortos.'],
    ],
  };
  const DECKS = {}; const BY = Object.create(null);
  for (const povo of C.POVOS) {
    DECKS[povo] = Object.freeze(ROWS[povo].map(r => {
      const [k, nome, tipo, rar, f, p, n, mito] = r; const P = C.PODER[p];
      const c = Object.freeze({ id: povo + '.' + k, povo, k, nome, tipo, rar, f, p, n, mito, pnome: P ? P.nome : '', txt: P ? P.txt(n) : '' });
      BY[c.id] = c; return c;
    }));
  }
  C.DECKS = Object.freeze(DECKS);
  C.card = id => BY[id] || null;
  C.all = () => Object.keys(BY).map(k => BY[k]);
  C.valeDe = c => (c ? c.f + (VALE[c.p] || 0) * (c.n > 1 && (c.p === 'golpe' || c.p === 'alto' || c.p === 'furia') ? 1 + (c.n - 2) * 0.35 : 1) : 0);

  // ------------------------------ o acaso da partida: só o G.hash (D-669) ------------------------------
  const H = (a, b, c) => G.hash((Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663) ^ Math.imul(c | 0, 83492791)) | 0);
  C.hash = H;
  function baralha(L, seed) { const a = L.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(H(seed, i, 7177) * (i + 1)) % (i + 1); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  C.baralha = baralha;

  // ------------------------------ a partida ------------------------------
  // o estado (puro, números e textos: vai no save como está): o monte, a mão e o descarte de cada lado, a glória, a rodada, a oferenda
  // que ficou no altar (altar), quem mostra primeiro (vis), a tabuleta de cada lado nesta rodada (lance), o que ficou pendente de uma
  // rodada para a outra (o presságio, a maldição, quem perdeu), a aposta e quantas vezes ela dobrou (x), o pedido de dobrar (dobra), e
  // a história de cada rodada (o que a tela mostra)
  C.nova = function (o) {
    const seed = o.seed | 0; const civ = [o.civ[0], o.civ[1]].map(c => (DECKS[c] ? c : 'classico'));
    const p = [0, 1].map(i => { const d = baralha(DECKS[civ[i]].map(c => c.id), Math.imul(seed, 31) + i * 977 + 5); return { monte: d.slice(C.MAO), mao: d.slice(0, C.MAO), desc: [], gl: 0, bonus: 0, mal: 0, perdeu: 0, venc: 0 }; });
    return { v: C.VERSAO, id: o.id | 0, seed, civ, quem: [o.quem ? o.quem[0] | 0 : 0, o.quem ? o.quem[1] | 0 : 0], r: 0, comprou: 0, altar: 0, vis: -1, lance: [null, null], p, x: 1, aposta: +o.aposta || 0, dobrou: [0, 0], dobra: null, hist: [], fim: null };
  };
  const other = s => 1 - s;
  C.outro = other;
  // (a rodada abre: cada um compra uma tabuleta do monte — da segunda rodada em diante, uma vez)
  C.abre = function (s) { if (s.fim || s.comprou === s.r + 1) return s; if (s.r > 0) for (const q of s.p) if (q.monte.length) q.mao.push(q.monte.shift()); s.comprou = s.r + 1; return s; };
  // quem ainda tem que escolher nesta rodada (o lado que é visto escolhe antes), ou -1
  C.vez = function (s) { if (s.fim || s.dobra) return -1; if (s.vis >= 0 && !s.lance[s.vis]) return s.vis; for (const i of [0, 1]) if (!s.lance[i]) return i; return -1; };
  C.pode = (s, side, id) => !s.fim && !s.dobra && !s.lance[side] && s.p[side].mao.includes(id) && (s.vis < 0 || s.vis === side || !!s.lance[s.vis]);
  C.joga = function (s, side, id) { if (!C.pode(s, side, id)) return false; s.lance[side] = id; return true; };
  // (o que um lado sabe da tabuleta do outro nesta rodada: só a do lado que mostra primeiro, já posta)
  C.vista = (s, side) => (s.vis === other(side) && s.lance[other(side)] ? s.lance[other(side)] : null);

  // o duelo de duas tabuletas (o miolo da rodada, puro e sem montar nada): a força final de cada uma, quem vence (0, 1, ou -1 no empate),
  // a maré, quem foi calado; ctx de cada lado: { perdeu, venc, heroi (outro herói na mão), fraca (a força da mais fraca da mão, −1: nenhuma),
  // bonus, mal }; of: a oferenda desta rodada, sem o pote (a grandeza a lê)
  const R = { fa: 0, fb: 0, w: -1, mult: 1, silA: false, silB: false, da: 0, db: 0, ta: 0, tb: 0, trocou: false, pesa: -1, juiz: -1 };
  function bonusDe(p, n, x, of) {
    if (p === 'furia') return x.perdeu ? n : 0;
    if (p === 'legiao') return Math.min(3, x.venc) * n;
    if (p === 'bando') return x.heroi ? n : 0;
    if (p === 'alto') return of >= 3 ? n : 0;
    if (p === 'sacrificio') return x.fraca > 0 ? x.fraca : 0;
    return 0;
  }
  function duelo(ca, cb, A, B, of) {
    const ea = ca.p === 'egide', eb = cb.p === 'egide';
    R.silA = eb; R.silB = ea; // (as duas com égide: as duas caladas)
    const PA = R.silA ? '' : ca.p, PB = R.silB ? '' : cb.p;
    let fa = ca.f + (A.bonus || 0), fb = cb.f + (B.bonus || 0);
    if (A.mal && PA !== 'firme') fa -= A.mal; if (B.mal && PB !== 'firme') fb -= B.mal;
    const ba = bonusDe(PA, ca.n, A, of), bb = bonusDe(PB, cb.n, B, of); fa += ba; fb += bb; R.ta = ba; R.tb = bb;
    let da = 0, db = 0;
    if (PA === 'golpe' && PB !== 'firme') db += ca.n; if (PB === 'golpe' && PA !== 'firme') da += cb.n;
    if (PA === 'raio' && PB !== 'firme' && fb > fa) db += 4; if (PB === 'raio' && PA !== 'firme' && fa > fb) da += 4;
    fa = Math.max(0, fa - da); fb = Math.max(0, fb - db); R.da = da; R.db = db;
    R.trocou = (PA === 'troca') !== (PB === 'troca'); if (R.trocou) { const t = fa; fa = fb; fb = t; }
    let w = fa > fb ? 0 : fb > fa ? 1 : -1; R.pesa = -1; R.juiz = -1;
    if (w === 1 && PA === 'pesagem') { w = -1; R.pesa = 0; } else if (w === 0 && PB === 'pesagem') { w = -1; R.pesa = 1; }
    if (w === -1) { const ja = PA === 'juiz', jb = PB === 'juiz'; if (ja && !jb) { w = 0; R.juiz = 0; } else if (jb && !ja) { w = 1; R.juiz = 1; } }
    R.fa = fa; R.fb = fb; R.w = w; R.mult = PA === 'mare' || PB === 'mare' ? 2 : 1;
    return R;
  }
  C.duelo = (ca, cb, A, B, of) => Object.assign({}, duelo(ca, cb, A, B, of));
  // (o contexto de um lado para o duelo: o que a mão tem além da tabuleta jogada)
  function ctxDe(q, id) {
    let heroi = false, fraca = -1; let k = -1;
    for (let i = 0; i < q.mao.length; i++) { const x = q.mao[i]; if (x === id && k < 0) { k = i; continue; } const c = BY[x]; if (!c) continue; if (c.tipo === 'heroi') heroi = true; if (fraca < 0 || c.f < fraca) fraca = c.f; }
    return { perdeu: q.perdeu, venc: q.venc, heroi, fraca, bonus: q.bonus, mal: q.mal };
  }
  // (a melhor da mão — a de maior força; no empate a primeira pela chave —, e a mais fraca, sem a jogada)
  const melhor = L => { let b = -1; for (let i = 0; i < L.length; i++) { const c = BY[L[i]]; const o = b >= 0 ? BY[L[b]] : null; if (!o || c.f > o.f || (c.f === o.f && c.id < o.id)) b = i; } return b; };
  const fracaIdx = (L, id) => { let b = -1; for (let i = 0; i < L.length; i++) { if (L[i] === id) continue; const c = BY[L[i]]; const o = b >= 0 ? BY[L[b]] : null; if (!o || c.f < o.f || (c.f === o.f && c.id < o.id)) b = i; } return b; };
  const restaOf = s => { let n = s.altar; for (let r = s.r; r < C.RODADAS; r++) n += C.OF[r]; return n; };

  // a rodada se resolve (as duas tabuletas postas): quem vence, a glória, o que fica para a próxima; devolve o registro da rodada — as
  // tabuletas, as forças, quem venceu, o que ganhou, e os eventos na ordem em que a tela os mostra (ev: [{ k, lado, … }])
  C.resolve = function (s) {
    if (s.fim || !s.lance[0] || !s.lance[1]) return null;
    const ida = s.lance[0], idb = s.lance[1]; const ca = BY[ida], cb = BY[idb]; const A = s.p[0], B = s.p[1];
    const xa = ctxDe(A, ida), xb = ctxDe(B, idb); const of = C.OF[s.r];
    const d = Object.assign({}, duelo(ca, cb, xa, xb, of)); const ev = [];
    const PA = d.silA ? '' : ca.p, PB = d.silB ? '' : cb.p; const P = [PA, PB], CC = [ca, cb];
    if (d.silA) ev.push({ k: 'egide', lado: 1 }); if (d.silB) ev.push({ k: 'egide', lado: 0 });
    for (const i of [0, 1]) { const q = s.p[i]; if (q.bonus) ev.push({ k: 'presagio', lado: i, n: q.bonus }); if (q.mal && P[i] !== 'firme') ev.push({ k: 'maldicao', lado: i, n: q.mal }); }
    // (o sacrifício: a mais fraca da mão vai para o descarte)
    for (const i of [0, 1]) if (P[i] === 'sacrificio') { const q = s.p[i]; const j = fracaIdx(q.mao, s.lance[i]); if (j >= 0) { const x = q.mao.splice(j, 1)[0]; q.desc.push(x); ev.push({ k: 'sacrificio', lado: i, c: x, n: BY[x].f }); } }
    if (d.ta && P[0] !== 'sacrificio') ev.push({ k: P[0], lado: 0, n: d.ta }); if (d.tb && P[1] !== 'sacrificio') ev.push({ k: P[1], lado: 1, n: d.tb });
    if (d.db) ev.push({ k: P[0] === 'raio' ? 'raio' : 'golpe', lado: 0, n: d.db }); if (d.da) ev.push({ k: P[1] === 'raio' ? 'raio' : 'golpe', lado: 1, n: d.da });
    for (const i of [0, 1]) if (P[i] === 'firme' && (P[1 - i] === 'golpe' || P[1 - i] === 'raio' || s.p[i].mal)) ev.push({ k: 'firme', lado: i });
    if (d.trocou) ev.push({ k: 'troca', lado: PA === 'troca' ? 0 : 1 });
    if (d.pesa >= 0) ev.push({ k: 'pesagem', lado: d.pesa }); if (d.juiz >= 0) ev.push({ k: 'juiz', lado: d.juiz });
    if (d.mult > 1) ev.push({ k: 'mare', lado: PA === 'mare' ? 0 : 1 });
    const vale = (of + s.altar) * d.mult; let ganho = 0;
    if (d.w >= 0) { const q = s.p[d.w]; ganho = vale + (P[d.w] === 'oferenda' ? CC[d.w].n : 0); q.gl += ganho; q.venc++; s.altar = 0; if (P[d.w] === 'oferenda') ev.push({ k: 'oferenda', lado: d.w, n: CC[d.w].n }); }
    else s.altar = vale;
    for (const i of [0, 1]) s.p[i].perdeu = d.w === other(i) ? 1 : 0;
    // (as tabuletas jogadas: ao descarte — a que renasce sem ter vencido, de volta à mão)
    for (const i of [0, 1]) { const q = s.p[i]; const id = s.lance[i]; const j = q.mao.indexOf(id); if (j >= 0) q.mao.splice(j, 1); if (P[i] === 'renasce' && d.w !== i) { q.mao.push(id); ev.push({ k: 'renasce', lado: i, c: id }); } else q.desc.push(id); q.bonus = 0; q.mal = 0; }
    // (o que fica para a partida, de quem não foi calado)
    let vis = -1;
    for (const i of [0, 1]) {
      const q = s.p[i], o = s.p[other(i)], c = CC[i], p = P[i];
      if (p === 'compra' || (p === 'colhe' && d.w === i)) { let n = 0; for (let k = 0; k < c.n && q.monte.length; k++) { q.mao.push(q.monte.shift()); n++; } if (n) ev.push({ k: p, lado: i, n }); }
      if (p === 'furto' && d.w === i && o.mao.length) { const j = melhor(o.mao); const x = o.mao.splice(j, 1)[0]; q.mao.push(x); ev.push({ k: 'furto', lado: i, c: x }); }
      if (p === 'devora' && d.w === i && o.mao.length) { const j = melhor(o.mao); const x = o.mao.splice(j, 1)[0]; o.desc.push(x); ev.push({ k: 'devora', lado: i, c: x }); }
      if (p === 'visao') { vis = vis === -1 ? other(i) : -2; ev.push({ k: 'visao', lado: i }); }
      if (p === 'presagio') { q.bonus = c.n; ev.push({ k: 'presagio-vem', lado: i, n: c.n }); }
      if (p === 'maldicao') { o.mal = c.n; ev.push({ k: 'maldicao-vem', lado: i, n: c.n }); }
    }
    const rec = { r: s.r, c: [ida, idb], f: [d.fa, d.fb], w: d.w, of, vale, ganho, altar: s.altar, mult: d.mult, ev, gl: [A.gl, B.gl] };
    s.hist.push(rec); s.lance = [null, null]; s.vis = vis >= 0 ? vis : -1; s.r++;
    // (o fim: a sétima rodada; ou quem não pode mais ser alcançado; ou as duas mãos vazias, sem monte)
    const lead = Math.abs(A.gl - B.gl), resta = restaOf(s) * 2 + 2;
    const vazio = (!A.mao.length && !A.monte.length) || (!B.mao.length && !B.monte.length);
    if (s.r >= C.RODADAS || lead > resta || vazio) s.fim = { w: A.gl > B.gl ? 0 : B.gl > A.gl ? 1 : -1, por: 'gloria' };
    return rec;
  };

  // ------------------------------ dobrar a aposta ------------------------------
  // uma vez por partida cada um, no começo de uma rodada (antes de qualquer tabuleta posta), com aposta: o outro aceita — a aposta dobra
  // —, ou desiste e perde o que estava no pote
  C.podeDobrar = (s, side) => !s.fim && !s.dobra && s.aposta > 0 && !s.dobrou[side] && !s.lance[0] && !s.lance[1] && s.r < C.RODADAS - 0;
  C.dobra = function (s, side) { if (!C.podeDobrar(s, side)) return false; s.dobra = { de: side, r: s.r }; s.dobrou[side] = 1; return true; };
  C.responde = function (s, side, aceita) {
    if (!s.dobra || s.dobra.de === side || s.fim) return false;
    const de = s.dobra.de; s.dobra = null;
    if (aceita) { s.x *= 2; s.hist.push({ r: s.r, dobra: de, aceita: 1 }); return true; }
    s.fim = { w: de, por: 'recusa' }; s.hist.push({ r: s.r, dobra: de, aceita: 0 }); return true;
  };
  C.desiste = function (s, side) { if (s.fim) return false; s.fim = { w: other(side), por: 'desiste' }; return true; };
  // (o quanto cada um tem no pote: a aposta vezes quantas vezes dobrou)
  C.potePor = s => s.aposta * s.x;

  // ------------------------------ a tabuleta da manga (a trapaça, D-866) ------------------------------
  // quem trapaceia troca a tabuleta que ia jogar pela melhor que ainda está no seu monte (a que «estava na manga»): a jogada volta ao
  // monte, no lugar que o hash da partida diz. Quem decide se tenta, e quem percebe, é o mundo (cartas-mesa.js); aqui, só a troca
  C.manga = function (s, side) {
    const q = s.p[side]; const id = s.lance[side]; if (s.fim || !id || !q.monte.length) return null;
    const j = melhor(q.monte); const x = q.monte.splice(j, 1)[0]; const i = q.mao.indexOf(id); if (i < 0) { q.monte.splice(j, 0, x); return null; }
    q.mao[i] = x; const at = Math.floor(H(s.seed, s.r * 7 + side, 991) * (q.monte.length + 1)) % (q.monte.length + 1); q.monte.splice(at, 0, id); s.lance[side] = x;
    return { de: id, por: x };
  };

  // ------------------------------ quem joga (a inteligência, D-864) ------------------------------
  // a escolha de uma tabuleta: cada uma da mão pesada contra o que o outro pode jogar — o que ele tem na mão e no monte, que quem joga
  // não vê: as tabuletas do povo dele menos as que já foram para o descarte (o que se sabe, nunca o que se espia) —, pela glória que a
  // rodada daria ou tiraria, menos o que a tabuleta valeria guardada para as rodadas que faltam; a índole pesa: o ousado gasta os deuses
  // cedo e arrisca, o cauto guarda (ind: { ousado: 0..1 }). Sem sorteio: o empate das contas, e um pouco de humor, pelo hash da partida,
  // da rodada e do lado. Contra a tabuleta já mostrada (a visão), a conta é exata
  const desconhecidas = (s, side) => { const o = s.p[other(side)]; return o.mao.concat(o.monte); };
  function ctxOutro(s, side, pool) { const o = s.p[other(side)]; let her = 0; for (const x of pool) if (BY[x].tipo === 'heroi') her++; return { perdeu: o.perdeu, venc: o.venc, heroi: pool.length ? her / pool.length * Math.max(0, o.mao.length - 1) >= 0.5 : false, fraca: 1, bonus: o.bonus, mal: o.mal }; }
  C.ia = function (s, side, ind) {
    const q = s.p[side]; if (!q.mao.length) return null;
    const vista = C.vista(s, side); const pool = vista ? [vista] : desconhecidas(s, side); const of = C.OF[s.r] || 1;
    const xo = ctxOutro(s, side, pool); const ous = ind && Number.isFinite(ind.ousado) ? ind.ousado : 0.5;
    const resta = C.RODADAS - 1 - s.r; const tot = restaOf(s); const lead = q.gl - s.p[other(side)].gl;
    // (o que uma glória vale agora: mais quando a partida está perto, menos quando já está decidida)
    const aperto = 1 / (1 + Math.max(0, Math.abs(lead) - tot * 0.5) * 0.4);
    let best = null, bs = -1e9;
    for (let i = 0; i < q.mao.length; i++) {
      const id = q.mao[i]; if (i > 0 && q.mao.indexOf(id) < i) continue; const c = BY[id]; const xa = ctxDe(q, id);
      let sum = 0, min = 1e9;
      for (const ox of pool) { const oc = BY[ox]; const d = side === 0 ? duelo(c, oc, xa, xo, of) : duelo(oc, c, xo, xa, of); const w = side === 0 ? d.w : d.w < 0 ? -1 : 1 - d.w;
        const vale = (of + s.altar) * d.mult; let g = w === 0 ? vale + (c.p === 'oferenda' && !(side === 0 ? d.silA : d.silB) ? c.n : 0) : w === 1 ? -vale : 0;
        // (o que fica para a partida: renascer quando perde, a carta que se compra, a que se tira do outro, o presságio, a visão)
        const sil = side === 0 ? d.silA : d.silB;
        if (!sil) { if (c.p === 'renasce' && w !== 0) g += C.valeDe(c) * 0.32 * (resta / 6); if (c.p === 'compra') g += 0.45 * c.n * (resta / 6); if (c.p === 'colhe' && w === 0) g += 0.45 * c.n * (resta / 6);
          if ((c.p === 'furto' || c.p === 'devora') && w === 0) g += 0.9 * (resta / 6); if (c.p === 'presagio' && resta > 0) g += c.n * 0.42; if (c.p === 'maldicao' && resta > 0) g += c.n * 0.4; if (c.p === 'visao' && resta > 0) g += 0.8; }
        sum += g; if (g < min) min = g; }
      const mean = sum / pool.length; const ev = vista ? mean : mean * 0.8 + min * 0.2;
      // (guardada, a tabuleta valeria nas rodadas que faltam: o cauto pesa isso mais; nas últimas rodadas, nada se guarda)
      const guarda = resta > 0 ? C.valeDe(c) * 0.13 * Math.min(1, resta / 4) * (1.25 - ous * 0.7) * (C.OF[Math.min(C.RODADAS - 1, s.r + 1)] / Math.max(1, of)) : 0;
      const humor = (H(s.seed, s.r * 13 + side * 101, i * 7 + c.f) - 0.5) * 0.5;
      const sc = ev * aperto - guarda + humor;
      if (sc > bs) { bs = sc; best = id; }
    }
    return best;
  };
  // a chance de vencer a partida, como um lado a vê (para dobrar e aceitar): a glória à frente contra o que ainda vale, e a força da mão
  C.chance = function (s, side) {
    const q = s.p[side], o = s.p[other(side)]; const tot = Math.max(1, restaOf(s)); const lead = q.gl - o.gl;
    const mine = q.mao.reduce((a, x) => a + C.valeDe(BY[x]), 0) / Math.max(1, q.mao.length); const pool = desconhecidas(s, side); const theirs = pool.reduce((a, x) => a + C.valeDe(BY[x]), 0) / Math.max(1, pool.length);
    const z = lead / (tot * 0.45 + 1) + (mine - theirs) * 0.22 * Math.min(1, (C.RODADAS - s.r) / 4); return 1 / (1 + Math.exp(-z * 1.3));
  };
  // (dobra quem se vê com quatro chances em cinco — o ousado, com um pouco menos, e mais vezes: o hash da rodada e do lado —; aceita quem
  // ainda tem uma chance em seis — o ousado, com menos ainda —: recusar perde o que está no pote, aceitar arrisca o dobro)
  const ousa = ind => (ind && Number.isFinite(ind.ousado) ? ind.ousado : 0.5);
  C.iaDobra = (s, side, ind) => C.podeDobrar(s, side) && s.r >= 2 && C.chance(s, side) > 0.8 - 0.1 * ousa(ind) && H(s.seed, s.r * 5 + side, 3301) < 0.35 + 0.5 * ousa(ind);
  C.iaAceita = (s, side, ind) => C.chance(s, side) > 0.17 - 0.09 * ousa(ind);

  // ------------------------------ uma partida inteira entre duas inteligências (as provas e o mundo sem corpo) ------------------------------
  C.simula = function (o) {
    const s = C.nova(o); const ind = o.ind || [{ ousado: 0.5 }, { ousado: 0.5 }]; let guard = 0;
    while (!s.fim && guard++ < 40) {
      C.abre(s);
      if (o.dobrar) for (const i of [0, 1]) if (!s.dobra && C.iaDobra(s, i, ind[i])) { C.dobra(s, i); C.responde(s, other(i), C.iaAceita(s, other(i), ind[other(i)])); }
      if (s.fim) break;
      for (let k = 0; k < 2; k++) { const i = C.vez(s); if (i < 0) break; C.joga(s, i, C.ia(s, i, ind[i])); }
      if (!C.resolve(s)) break;
    }
    return s;
  };

  // (a tabela é lida, nunca escrita)
  Object.freeze(ROWS);
})(window.G);
