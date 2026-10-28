'use strict';
// A folha do P1 na matriz por prédio (qa/matriz-predios.js, do P4 — o formato está no comentário do p4.js): as moradias e a
// religião. O estado de cada categoria o gerador calcula do código e das provas; aqui só o que o P1 faz, o que usa e onde se
// prova (e o que ainda falta, nas notas).
module.exports = {
  dono: 'P1',
  categorias: {
    moradia: {
      funcao: 'onde a família mora: dorme, ceia, cozinha, nina, cuida dos pequenos, fica de cama e de luto; a casa com dono, herdeiro e aluguel',
      quem: 'os moradores (a família); um hóspede, no chão',
      sistemas: ['G.Lar', 'G.Casa', 'G.Depot', 'G.Interiors', 'G.Possess'],
      atividades: [
        { id: 'dormir', o: 'dormir na cama da casa, cada um na sua hora', essencial: true, pecas: ['esteira', 'cama-casal'], usos: ['deitar'], tarefa: 'sleep', corpo: 'cama', resultado: 'a energia volta; quem dorme fica deitado no lugar da planta — na cama, ou no chão o hóspede (L-228)', condicao: 'à noite, na hora de deitar de cada um (G.Lar.clock: as crianças antes, os adultos espalhados)', feito: true, provas: ['qa/lar.js', 'qa/lar-puro.js'] },
        { id: 'cear', o: 'comer à mesa o que a despensa da casa tem (a ceia de hoje, quente, ou fria)', essencial: true, pecas: ['mesa'], usos: ['comer'], tarefa: 'lar', ato: 'lar/comer', corpo: 'atividade', recursos: ['food'], resultado: 'a fome cai; a despensa desce pelo livro-razão (ceia, refeição)', condicao: 'em casa, com comida na despensa', feito: true, provas: ['qa/lar.js'] },
        { id: 'cozinhar', o: 'cozinhar a ceia da casa no fogo', essencial: true, pecas: ['lar'], usos: ['cozinhar'], tarefa: 'lar', ato: 'lar/cozinhar', corpo: 'atividade', resultado: 'a ceia de hoje fica pronta (h.ceia): quem ceia come quente', condicao: 'de tarde e no começo da noite, com comida na despensa, alguém de 14 anos ou mais', feito: true, provas: ['qa/lar.js'] },
        { id: 'noite', o: 'a noite em casa acordado: conversar, descansar junto ao fogo, esperar quem está fora', essencial: true, usos: ['aquecer'], tarefa: 'lar', resultado: 'ninguém vaga pela rua de noite sem afazer (L-225)', condicao: 'depois de escurecer, antes da própria hora de deitar', feito: true, provas: ['qa/lar.js'] },
        { id: 'acamado', o: 'o doente e o ferido de cama em casa', essencial: true, usos: ['deitar'], tarefa: 'lar', recursos: ['food'], resultado: 'sara — o ferido três vezes mais depressa, como dormindo —, comendo da despensa', condicao: 'a febre, ou menos de 40 de vida fora de uma luta (L-227)', feito: true, provas: ['qa/lar.js'] },
        { id: 'ninar', o: 'ninar o bebê junto ao fogo; o bebê muda de colo onde está, nunca pela cidade', essencial: true, usos: ['aquecer'], tarefa: 'lar', ato: 'lar/pegarBebe', corpo: 'atividade', resultado: 'o bebê no colo de quem o carrega, em casa; o corpo o pega no colo e o dá a alguém da casa (D-074)', condicao: 'um bebê da casa ao alcance', feito: true, provas: ['qa/lar.js', 'qa/lar-puro.js'] },
        { id: 'luto', o: 'o viúvo nas primeiras horas do luto em casa, junto ao fogo', usos: ['aquecer'], tarefa: 'lar', resultado: 'a primeira metade do dia de luto em casa; o enterro vem antes', condicao: 'de dia, quem perdeu o companheiro', feito: true, provas: ['qa/lar.js'] },
        { id: 'cuidar', o: 'de dia, um velho da casa cuida dos pequenos em casa', usos: ['aquecer'], tarefa: 'lar', resultado: 'a casa não fica vazia de dia: as crianças de 3 a 6 ficam com ele em vez de ir atrás da mãe', condicao: 'de dia, alguém de 62 anos ou mais numa casa com crianças pequenas', feito: true, provas: ['qa/lar.js', 'qa/lar-puro.js'] },
        { id: 'abrigo', o: 'abrigar-se da tempestade em casa', tarefa: 'shelter', resultado: 'ninguém fica na chuva forte com casa', condicao: 'a tempestade', feito: true, provas: ['qa/lar.js'] },
        { id: 'casa', o: 'ter casa: comprar a vazia do povo, alugar a de um dono, encomendar uma nova; o dono, o herdeiro, a ruína', ato: 'casa/encomendar', corpo: 'atividade', recursos: ['moedas'], resultado: 'a família tem onde morar; a herança passa com a morte do dono (L-304)', condicao: 'a família sem teto, num barraco, na casa cheia ou de outros', feito: true, provas: ['qa/casa.js'] },
      ],
      notas: 'o cartão da casa no Modo Deus diz onde está cada morador e por quê (G.Lar.roster, D-072); as casas não têm cadeira nem banco nas plantas de hoje: quem se senta, senta junto ao fogo, à mesa ou no chão (o repartidor do P4); o berço (o uso cuidar) espera a subida do In.VERSION; a cozinha não gasta lenha (a casa não tem a cadeia da lenha); o «cuidar» acontece nos mundos prontos desde o D-098 (da casa cheia saem os moços primeiro): o l14 acha na metrópole uma velha de verdade (Cassandra, 63) cuidando de dois pequenos, que a esperam quando ela sai por pouco (L-235); a cidade, de 12 anos, ainda não tem velhos; conversar com quem está dentro, do lado do corpo, é do P4',
    },
    // (an open work of the town, the P4's sheet: the water of the well, the house's errand)
    cidade: {
      atividades: [
        { id: 'agua', o: 'buscar água no poço para a casa, na fila', essencial: true, tipos: ['well'], tarefa: 'water', resultado: 'a casa tem água (h.water); o jarro chega em casa pela mão de quem o leva, ou sai derramado pelo livro (L-300)', condicao: 'um poço da cidade, a fila com lugar', feito: true, provas: ['qa/agua-solta.js'] },
      ],
    },
    religiao: {
      funcao: 'onde o povo reza e o sacerdote oficia; onde os mortos são enterrados',
      quem: 'os fiéis, o sacerdote; quem enterra os seus',
      sistemas: ['G.Lar', 'G.Village', 'G.Interiors', 'G.Fest'],
      atividades: [
        { id: 'rezar', o: 'rezar dentro do templo, num lugar de rezar da planta (as esteiras, os bancos); cheio, nas fileiras de fora', essencial: true, tipos: ['temple'], pecas: ['esteira-oracao'], usos: ['rezar'], tarefa: 'pray', corpo: 'porta', resultado: 'a fé do povo e a devoção de quem reza sobem', condicao: 'de dia, quem é devoto ou tem medo; o templo com lugar livre (L-224)', feito: true, provas: ['qa/lar.js'] },
        { id: 'oficiar', o: 'o sacerdote conduz a reza do altar', essencial: true, tipos: ['temple'], pecas: ['altar'], usos: ['oficiar'], tarefa: 'pray', resultado: 'a reza do sacerdote rende mais fé', condicao: 'o sacerdote da cidade, o altar livre', feito: true, provas: ['qa/lar.js'] },
        { id: 'festa', o: 'as festas do calendário: a procissão, o banquete, o rito diante do templo', tipos: ['temple'], tarefa: 'fest', recursos: ['food'], resultado: 'o banquete sai do estoque pelo livro-razão; a festa atravessa o save (L-222, L-223)', condicao: 'o dia da festa de cada povo; de noite, as crianças pequenas que dormem ficam na cama (L-233)', feito: true, provas: ['qa/lar.js'] },
        { id: 'ofertar', o: 'deixar uma oferenda no altar', tipos: ['temple'], usos: ['ofertar'], dono: 'P2', resultado: 'o que a casa tem de sobra vai à prateleira do templo, pelo livro', condicao: 'no fim da reza, de quem tem sobra (G.Templo.ofertar)', feito: 'parcial', provas: [] },
        { id: 'enterrar', o: 'enterrar os mortos no cemitério e visitar o túmulo', essencial: true, tipos: ['cemetery'], tarefa: 'funeral', resultado: 'a cova aberta (doze por cemitério; o mais velho vira ossuário); o luto da família', condicao: 'uma morte na cidade com cemitério', feito: true, provas: ['qa/memoria.js'] },
      ],
      notas: 'a oferenda no fim da reza entra na integração com o ramo do P2 (G.Templo.ofertar); o cemitério não tem planta (o corpo pisa as covas como o mundo as tem); o enterro é do village.js (Village.bury) e o luto em casa, do G.Lar',
    },
  },
};
