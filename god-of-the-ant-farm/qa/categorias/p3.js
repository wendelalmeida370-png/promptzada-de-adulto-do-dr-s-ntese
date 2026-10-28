'use strict';
// A folha do P3 na matriz por prédio (qa/matriz-predios.js — os adendos 2 e 11 do pedido do Patch 2, D-089; o formato no
// comentário do qa/categorias/p4.js): a cultura e o espetáculo — o teatro, a maravilha, o monumento, a estátua de ouro e a
// biblioteca —, do lado do espaço e da forma: a forma de cada povo (G.Forma, D-093: o deus e o 3D a desenham), a planta pela
// forma (js/int-monumentos.js) com os lugares onde se assiste, se atua, se luta, se reza, se oferta e se olha do alto (o
// exemplo C do adendo), o corpo neles pelo verbo «lugar». As festas e o lazer que levam o povo a esses lugares são do P1; a
// planta da biblioteca é do P4, o copista do P2.
module.exports = {
  dono: 'P3',
  categorias: {
    cultura: {
      funcao: 'os espetáculos, os jogos e os ritos do povo, e as obras que o marcam: onde se assiste, se atua, se luta, se reza e se oferta, e de onde se olha a cidade do alto',
      quem: 'o público, os atores e o coro, os gladiadores, o escaldo; os sacerdotes e os fiéis; o povo da capital na maravilha; quem passa, no monumento e na estátua',
      sistemas: ['G.Forma', 'G.Interiors', 'G.Space', 'G.Possess'],
      atividades: [
        { id: 'assistir', o: 'assistir de um lugar da plateia: sentado nas fileiras do teatro grego e clássico, em pé no pódio da arena e do Coliseu, em volta do jardim sagrado e nas pontas do campo de pelota', essencial: true, tipos: ['teatro', 'maravilha'], usos: ['assistir'], corpo: 'lugar',
          resultado: 'o corpo num lugar de onde se vê o espetáculo, virado para ele (o povo, pelas festas do P1)', condicao: 'o teatro ou a arena de pé, com planta', feito: true, provas: ['qa/monumentos.js'] },
        { id: 'atuar', o: 'atuar: na orquestra, diante do tanque do jardim, no corredor do campo de pelota, o escaldo junto ao fogo do salão do hidromel e entre os fogos de Valhala', essencial: true, tipos: ['teatro'], usos: ['atuar'], corpo: 'lugar',
          resultado: 'o corpo no lugar de quem se apresenta, virado para o público', condicao: 'o teatro de pé, com planta', feito: true, provas: ['qa/monumentos.js'] },
        { id: 'lutar', o: 'lutar na areia da arena e do Coliseu, dois a dois junto ao alçapão do subsolo', tipos: ['teatro', 'maravilha'], usos: ['lutar'], corpo: 'lugar',
          resultado: 'o corpo na areia, diante do adversário', condicao: 'a arena ou o Coliseu de pé (romano)', feito: true, provas: ['qa/monumentos.js'] },
        { id: 'subir', o: 'subir ao alto da maravilha e olhar a cidade: o topo do Templo Mayor (a festa de Toxcatl), o terraço do zigurate, a rocha da Acrópole', tipos: ['maravilha'], usos: ['topo'], corpo: 'lugar',
          resultado: 'o corpo no alto, pelo lance da forma', condicao: 'a maravilha de pé (asteca, clássico, grego)', feito: true, provas: ['qa/monumentos.js'] },
        { id: 'rezar', o: 'rezar diante da maravilha: o olho de ouro do zigurate, a face da Grande Pirâmide, o templo da Acrópole', tipos: ['maravilha'], usos: ['rezar'], corpo: 'lugar',
          resultado: 'o corpo em reza, virado para a obra', condicao: 'a maravilha de pé (clássico, egípcio, grego)', feito: true, provas: ['qa/monumentos.js'] },
        { id: 'ofertar', o: 'fazer a oferenda: ao pé da Grande Pirâmide, sob a porta lacrada; diante da estátua de Atena na Acrópole', tipos: ['maravilha'], usos: ['ofertar'], corpo: 'lugar',
          resultado: 'o corpo no lugar da oferenda', condicao: 'a maravilha de pé (egípcio, grego)', feito: true, provas: ['qa/monumentos.js'] },
        { id: 'oficiar', o: 'oficiar diante dos santuários do Templo Mayor e acender os seus braseiros', tipos: ['maravilha'], usos: ['oficiar', 'acender'], corpo: 'lugar',
          resultado: 'o corpo diante da porta do santuário, ou junto ao braseiro', condicao: 'o Templo Mayor de pé (asteca)', feito: true, provas: ['qa/monumentos.js'] },
        { id: 'banquete', o: 'o banquete de Valhala: o assento do rei, os bancos ao longo das paredes, as mesas', tipos: ['maravilha'], pecas: ['trono', 'banco', 'mesa'], usos: ['sentar', 'audiencia', 'comer'], corpo: 'lugar',
          resultado: 'o corpo sentado no salão', condicao: 'Valhala de pé (nórdico)', feito: true, provas: ['qa/monumentos.js'] },
        { id: 'ver-monumento', o: 'ver de perto o monumento e a estátua de ouro de cada povo (a forma do deus, no 3D), e rezar ao pé deles', tipos: ['monument', 'estatua'],
          resultado: 'nenhum ainda: sem planta, o corpo vê de fora', condicao: 'o monumento ou a estátua de pé', feito: 'parcial', provas: ['qa/visual/fidelidade.js'] },
      ],
      notas: 'o teatro e a maravilha de cada povo têm planta pela forma (int-monumentos.js; D-093, D-095); o monumento e a estátua ainda não (só a forma, nas duas vistas); a biblioteca: a planta do P4 pela forma (biblioteca-praca.js), o copista do P2 — as atividades dela vão nas folhas deles. Quem leva o povo aos lugares (as festas, o lazer) é o P1.',
    },
  },
};
