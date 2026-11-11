'use strict';
// A folha do P2 na matriz por prédio (qa/matriz-predios.js, do P4 — o formato está no comentário do p4.js): o trabalho e os
// serviços — armazéns, comércio, ofícios, serviços e convívio, campo e criação, extração e pesca, governo, palácios — e, nas
// categorias de outras folhas, o que o P2 faz nelas (o espetáculo e a leitura, na cultura; falar ao povo, na praça). O
// estado de cada categoria o gerador calcula do código e das provas; aqui só o que se faz, o que usa e onde se prova — e o
// que ainda falta, nas notas.
module.exports = {
  dono: 'P2',
  categorias: {
    armazem: {
      funcao: 'onde o povo guarda o que junta e de onde tira o que come: o estoque do povo, com lugar contado, pelo livro; no porto, o armazém das caixas que chegam',
      quem: 'quem entrega e quem busca (coletores, lenhadores, mineiros, pescadores, construtores); no porto, os estivadores (estivador)',
      sistemas: ['G.Depot', 'G.Act', 'G.Porto', 'G.Village'],
      atividades: [
        { id: 'guardar', o: 'entregar a carga comum no armazém do povo', essencial: true, tarefa: 'deliver', recursos: ['food', 'wood', 'stone'], resultado: 'o estoque do povo cresce pelo livro (f:)', condicao: 'uma carga comum nas mãos e um armazém que se alcança, com lugar', feito: true, provas: ['qa/carga-comum.js'] },
        { id: 'comer', o: 'buscar comida no armazém e comer', essencial: true, tarefa: 'eat', recursos: ['food'], resultado: 'a comida sai do estoque pelo livro e a fome baixa', condicao: 'fome e comida num armazém que se alcança', feito: true, provas: ['qa/fome.js'] },
        { id: 'descarregar', o: 'levar as caixas do cais ao armazém do porto, caixa por caixa — a pesada, a dois', essencial: true, tipos: ['armazem'], tarefa: 'descarga', ato: 'descarga/depositar', corpo: 'atividade', recursos: ['sal', 'food', 'stone'], resultado: 'a carga do navio e do barco entra no estoque do povo; quem carregou recebe por caixa (num povo de moeda)', condicao: 'caixas de uma descarga no cais, de dia, com lugar no armazém e caminho até ele', feito: true, provas: ['qa/porto.js'] },
        { id: 'conferir', o: 'o mais velho dos estivadores confere a carga na porta do armazém', tipos: ['armazem'], tarefa: 'conferir', resultado: 'a descarga fecha as contas: o que chegou e o que faltou', condicao: 'a última caixa entregue', feito: true, provas: ['qa/porto.js'] },
        { id: 'mesa', o: 'conferir e guardar nos móveis da planta (a mesa de conferência, as baias, as tulhas)', usos: ['conferir', 'guardar'], feito: false, provas: [] },
      ],
      notas: 'o estoque do povo é um número por povo (com o lugar dos armazéns), não o que está em cada móvel: a mesa de conferência e as baias da planta ainda não são usadas pelo mundo (o capataz confere na porta)',
    },
    comercio: {
      funcao: 'onde se compra e se vende: as bancas dos mercadores, a feira, o mercado clandestino',
      quem: 'os mercadores (mercador), os feirantes (feirante), os contrabandistas (contrabandista); os fregueses das casas',
      sistemas: ['G.Biz', 'G.Compras', 'G.Depot', 'G.Act', 'G.Eco'],
      atividades: [
        { id: 'banca', o: 'o mercador abre a banca, compra no atacado do armazém, arruma, vende e fecha o dia', essencial: true, tipos: ['mercado'], tarefa: 'banca', ato: 'negocio/abrir', corpo: 'atividade', usos: ['vender'], recursos: ['moedas', 'tecido', 'ceramica', 'couro', 'joias', 'food'], resultado: 'as mercadorias do povo passam às bancas pelo atacado pago; o livro do dia fecha com a margem', condicao: 'um mercador com banca, nas horas do mercado', feito: true, provas: ['qa/negocio.js'] },
        { id: 'comprar', o: 'o freguês pergunta, pechincha, compra e leva para casa', essencial: true, tipos: ['mercado', 'feira'], tarefa: 'compra', ato: 'negocio/comprar', corpo: 'atividade', usos: ['comprar'], recursos: ['moedas'], resultado: 'a compra sai da banca para as mãos e as moedas da casa para a do vendedor, no mesmo instante; chega em casa', condicao: 'a banca aberta, a casa com com que pagar', feito: true, provas: ['qa/negocio.js', 'qa/compras.js'] },
        { id: 'compras-da-casa', o: 'a casa que precisa manda um dos seus às compras', essencial: true, tipos: ['mercado', 'feira'], tarefa: 'shop', recursos: ['moedas'], resultado: 'o que a casa gasta (tecido, cerâmica, couro, joias, comida da despensa) volta à casa, pago', condicao: 'a casa faltando algo, com moeda (ou troca), nas horas do mercado', feito: true, provas: ['qa/compras.js'] },
        { id: 'fila', o: 'a fila da banca: oito lugares, e o nono vai embora', tipos: ['mercado'], resultado: 'ninguém se amontoa: a fila acha os seus lugares', condicao: 'a banca com freguês esperando', feito: true, provas: ['qa/filas.js', 'qa/negocio.js'] },
        { id: 'feira', o: 'o feirante cuida das bancas da feira', tipos: ['feira'], tarefa: 'sell', resultado: 'o feirante traz do armazém às bancas pelo livro (\'feira\'); a feira vende o que tem nelas, e as moedas vão ao tesouro do povo', condicao: 'as horas da feira (de manhã até o meio-dia)', feito: true, provas: ['qa/feira.js'] },
        { id: 'contrabando', o: 'o contrabandista leva do armazém às escondidas para vender', tipos: ['mercado_negro'], tarefa: 'steal', resultado: 'a mercadoria sai do armazém pelo livro (\'contrabando\', marcada para o mercado) e aparece na prateleira; quem compra paga ao contrabandista, sem imposto', condicao: 'a cidade pouco leal ou o imposto alto; o roubo é de noite (L-386, aberta)', feito: 'parcial', provas: ['qa/contrabando.js'] },
      ],
      notas: 'a feira e o mercado clandestino passam pelo livro e têm prova do mundo pronto: a feira a qa/feira.js (o armazém às bancas, a compra ao tesouro, a feira que fecha ao meio-dia, a morte e o save com a mercadoria a caminho); o mercado clandestino a qa/contrabando.js (o roubo, a compra sem imposto, a vigia, a morte e o save com o roubado), com o roubo da noite esperando a L-386; ainda não são as bancas próprias do act-negocio.js, e o mercado clandestino não tem planta',
    },
    oficio: {
      funcao: 'onde as matérias do povo viram coisas: o barro em tijolo e pote, a lã em tecido, o minério em ferramenta e arma, o ouro em joia, a carne e o couro',
      quem: 'os oleiros, tecelões, ferreiros, ourives e açougueiros (oleiro, tecelao, ferreiro, ourives, acougueiro); a seda, a salga e as pérolas (sericultor, salgador, mergulhador)',
      sistemas: ['G.Oficio', 'G.Act', 'G.Depot', 'G.Estates'],
      atividades: [
        { id: 'fornada', o: 'a fornada inteira, por etapas: buscar a matéria, fazer cada unidade no lugar da planta, o fogo, o fim que fecha as contas', essencial: true, tipos: ['olaria', 'tecelagem', 'forja', 'ourives'], tarefa: 'oficio', ato: 'oficio/unidade', corpo: 'atividade', usos: ['tornear', 'cozer', 'tecer', 'forjar', 'lavrar'], recursos: ['argila', 'tijolo', 'adobe', 'ceramica', 'la', 'tecido', 'minerio', 'ferramentas', 'armas', 'ouro', 'joias', 'wood'], resultado: 'o que se fez vai ao armazém pelo livro; o desgaste das ferramentas, o salário de quem trabalhou', condicao: 'a matéria no armazém ou na prateleira, as mãos do ofício', feito: true, provas: ['qa/olaria.js', 'qa/olaria-mao.js', 'qa/oficinas-mao.js'] },
        { id: 'tijolo-da-obra', o: 'a olaria faz o tijolo que as obras da cidade esperam', tipos: ['olaria'], tarefa: 'oficio', recursos: ['tijolo', 'adobe'], resultado: 'a obra recebe o tijolo pelo livro', condicao: 'um povo que constrói de tijolo, com obra esperando', feito: true, provas: ['qa/olaria.js', 'qa/obra.js'] },
        { id: 'acougue', o: 'o açougueiro abate um bicho do curral e guarda a carne e o couro', tipos: ['acougue'], tarefa: 'slaughter', recursos: ['food', 'couro'], resultado: 'a carne e o couro do bicho', condicao: 'um curral com mais que o rebanho de cria', feito: 'parcial', provas: [] },
        { id: 'casas-de-oficio', o: 'a seda, a salga e as pérolas', tipos: ['sericultura', 'salga', 'perolaria'], tarefa: 'estate', resultado: 'a seda, o peixe salgado, as pérolas', condicao: 'as matérias de cada um', feito: 'parcial', provas: [] },
      ],
      notas: 'a olaria, a tecelagem, a forja e a ourivesaria passaram ao motor das fornadas (G.Oficio, act-oficio.js); o açougue, a seda, a salga e as pérolas ainda são as tarefas antigas (estates.js, economy.js), sem as etapas no lugar da planta; a oficina comum (workshop) não tem ofício próprio; amassar e moldar (o barro) esperam os lugares da planta da olaria nova (P4)',
    },
    servico: {
      funcao: 'onde a cidade se encontra e se cuida: a taverna (beber, comer, conversar) e os banhos (a água quente, a limpeza)',
      quem: 'o taverneiro e o foguista (taverneiro, foguista); os fregueses e os banhistas',
      sistemas: ['G.Taverna', 'G.Termas', 'G.Act', 'G.Depot', 'G.Interiors'],
      atividades: [
        { id: 'taverna', o: 'o dia da taverna: o taverneiro abre, atende e serve; o freguês pede, paga, senta e consome', essencial: true, tipos: ['taverna'], tarefa: 'tavern', ato: 'taverna/servir', corpo: 'atividade', usos: ['sentar', 'comer', 'vender'], recursos: ['moedas', 'cerveja', 'vinho', 'food'], resultado: 'a bebida e a comida saem da prateleira pelo livro; a paga vai ao caixa do dia; quem bebeu fica mais leal e menos triste', condicao: 'o taverneiro na taverna, no fim da tarde, com o que servir e lugar para sentar', feito: true, provas: ['qa/taverna-mao.js', 'qa/taverna.js'] },
        { id: 'abastecer', o: 'o taverneiro compra no armazém o que falta na prateleira (e a cuba, a fornada da cerveja)', tipos: ['taverna'], tarefa: 'abastecer', recursos: ['moedas', 'cerveja', 'grao'], resultado: 'a prateleira cheia pelo livro', condicao: 'a prateleira baixa, o armazém com o que vender', feito: true, provas: ['qa/taverna-mao.js'] },
        { id: 'banho', o: 'o dia dos banhos: o banhista paga, tira a roupa, entra na água com lugar, banha e sai; o foguista mantém a fornalha', essencial: true, tipos: ['banhos'], tarefa: 'termas', ato: 'termas/banhar', corpo: 'atividade', usos: ['despir', 'banhar', 'alimentar'], recursos: ['moedas', 'wood'], resultado: 'a doença cede, o banhista limpo; a lenha queima pelo livro; sem lugar na água, espera nos cabides e recebe a entrada de volta', condicao: 'os banhos abertos, a água quente, a entrada', feito: true, provas: ['qa/termas-mao.js', 'qa/termas.js', 'qa/termas-grandes.js'] },
      ],
      notas: 'a taverna e os banhos têm a prova de mão (vila de mentira) e a do mundo pronto (qa/taverna.js, qa/termas.js: a noite e o dia inteiros, o save no meio, quem cuida morrendo, o deus que derruba); as termas de 5 e de 7 casas dos povos da terma (T-784, D-183: forma-termas.js, int-termas.js) vivem o mesmo dia nas suas piscinas — cada banhista na mais vazia, D-184 — (qa/termas-grandes.js, qa/visual/termas-3d.js, qa/visual/termas-corpo.js); o terreiro da taverna nova (P4: a mesa-terreiro, as pipas, a talha) usa os mesmos usos',
    },
    campo: {
      funcao: 'onde o povo planta e cria: as fazendas, os pomares, as plantações, os vinhedos, os apiários, as salinas, as hortas, os currais e os estábulos',
      quem: 'os agricultores, os lavradores, os fruticultores, os vinhateiros, os apicultores, os salineiros, os pastores e os cavalariços',
      sistemas: ['G.Estates', 'G.Eco', 'G.Urban', 'G.Depot'],
      atividades: [
        { id: 'plantar', o: 'plantar, cuidar e colher a fazenda', essencial: true, tipos: ['farm'], tarefa: 'farm', recursos: ['food'], resultado: 'a colheita vai ao armazém pelo livro (\'entrega\'); do canteiro às mãos ela nasce como a coleta', condicao: 'uma fazenda do povo', feito: true, provas: ['qa/campo.js'] },
        { id: 'propriedades', o: 'o pomar, a plantação, o vinhedo, o apiário e a salina: cuidar, colher, prensar, defumar, rastelar', essencial: true, tipos: ['pomar', 'plantacao', 'vinhedo', 'apiario', 'salina'], tarefa: 'estate', recursos: ['food', 'vinho', 'mel', 'sal'], resultado: 'o que cada propriedade dá vai ao armazém pelo livro; o que se prensa nasce na prateleira (\'prensa\') e vai dali ao armazém', condicao: 'as mãos do ofício de cada uma', feito: true, provas: ['qa/campo.js'] },
        { id: 'rebanho', o: 'levar o rebanho ao pasto, dar feno, tosquiar, ordenhar, escovar', essencial: true, tipos: ['curral', 'estabulo'], tarefa: 'herd', recursos: ['la', 'food'], resultado: 'o rebanho alimentado; a lã, o leite, os ovos pelo livro até o armazém; o feno sai do armazém só o que o rebanho come', condicao: 'um curral com bichos', feito: true, provas: ['qa/rebanho.js'] },
        { id: 'horta', o: 'a horta da casa', tipos: ['horta'], tarefa: 'garden', resultado: 'a despensa da casa', condicao: 'uma horta da casa', feito: 'parcial', provas: [] },
      ],
      notas: 'o campo não tem planta (o corpo pisa o chão como o mundo o tem); a roça e as propriedades têm a prova do mundo pronto qa/campo.js (o ciclo, a morte com a colheita nas mãos, o save, o fogo, o deus que derruba; o pomar, a plantação, a prensa pelo livro, a tina segura por quem não está nela — L-383, L-384 —, o apiário), e o curral a qa/rebanho.js (o pasto, o feno, a tosquia e a ordenha, o save e a morte no pasto); a salina não está nos mundos da prova; a colheita nasce nas mãos fora do livro, como a coleta, e o livro a vê da mão ao armazém; o cercado não tem atividade (só cerca)',
    },
    extracao: {
      funcao: 'onde se tira da terra e do mar: a mina e o cais',
      quem: 'os mineiros (mineiro); os pescadores e os estivadores do cais',
      sistemas: ['G.Porto', 'G.Pesca', 'G.Fishers', 'G.Depot', 'G.Act'],
      atividades: [
        { id: 'minerar', o: 'trabalhar na mina: a pedra, o minério, o ouro', essencial: true, tipos: ['mina'], tarefa: 'minejob', recursos: ['stone', 'minerio', 'ouro'], resultado: 'o veio diminui do que sai da mina, e só isso o povo conta e paga; o minério vai ao armazém pelo livro (\'mina\', \'entrega\')', condicao: 'um veio com o que tirar', feito: true, provas: ['qa/mina.js'] },
        { id: 'pescar', o: 'sair ao mar com o barco e pescar no pesqueiro contado', essencial: true, tipos: ['doca'], tarefa: 'fish', recursos: ['food'], resultado: 'o peixe sai do pesqueiro daquela água pelo livro e volta ao cais em caixas', condicao: 'um barco, um pesqueiro com peixe', feito: true, provas: ['qa/pesca.js', 'qa/porto.js'] },
        { id: 'desembarcar', o: 'o navio e o barco desembarcam no cais: as caixas nascem com nome e dono', essencial: true, tipos: ['doca'], ato: 'descarga/pegar', corpo: 'atividade', recursos: ['sal', 'food'], resultado: 'a carga do porão em caixas no cais, numa descarga do povo', condicao: 'um navio ou barco atracado', feito: true, provas: ['qa/porto.js'] },
      ],
      notas: 'a mina e o cais não têm planta; a mina tem a prova do mundo pronto (qa/mina.js: o turno na galeria e no salto, a morte e o save na face, as mãos ocupadas, o fim do veio, a galeria que o deus derruba — L-381)',
    },
    governo: {
      funcao: 'onde a cidade se governa, se cobra, se guarda e se pune: a administração, a coletoria, a cadeia, o quartel, a torre',
      quem: 'os escribas, os coletores de impostos, o carcereiro e a vigia (escriba, cobrador, carcereiro, vigia); os soldados',
      sistemas: ['G.Crime', 'G.Eco', 'G.Act', 'G.Depot', 'G.Justice'],
      atividades: [
        { id: 'escrever', o: 'escrever os registros da administração', essencial: true, tipos: ['administracao'], tarefa: 'desk', ato: 'publico/escrever', corpo: 'atividade', resultado: 'os registros da cidade', condicao: 'o escriba no seu lugar', feito: true, provas: ['qa/termas-mao.js'] },
        { id: 'imposto', o: 'cobrar o imposto de porta em porta e levá-lo ao tesouro; cunhar moedas', essencial: true, tipos: ['coletoria'], tarefa: 'taxes', ato: 'publico/cobrar', corpo: 'atividade', recursos: ['moedas', 'ouro'], resultado: 'as moedas das casas ao tesouro pelo livro; o ouro em moedas', condicao: 'um povo de moeda, o coletor', feito: true, provas: ['qa/termas-mao.js'] },
        { id: 'cela', o: 'o ladrão preso cumpre a pena na cela; o carcereiro guarda e dá de comer', essencial: true, tipos: ['cadeia'], tarefa: 'cela', usos: ['deitar', 'sentar'], recursos: ['food'], resultado: 'o preso fica na cadeia o tempo da pena e come do estoque do povo', condicao: 'um roubo visto, um guarda que o prende, uma cela livre', feito: true, provas: ['qa/civicos.js'] },
        { id: 'treinar', o: 'os soldados treinam diante do quartel', tipos: ['quartel'], tarefa: 'drill', ato: 'publico/treinar', corpo: 'atividade', usos: ['treinar'], resultado: 'os soldados prontos', condicao: 'o quartel da cidade', feito: true, provas: ['qa/termas-mao.js'] },
        { id: 'vigiar', o: 'a ronda da noite e a vigia na torre', tipos: ['torre'], tarefa: 'patrol', resultado: 'quem rouba de noite é visto: o soldado de guarda flagra o contrabandista com a mercadoria roubada (de volta ao armazém, \'apreendido\'; a multa, \'multa\')', condicao: 'a noite', feito: 'parcial', provas: ['qa/contrabando.js'] },
      ],
      notas: 'a prova dos serviços públicos pelo corpo está no qa/termas-mao.js (o mesmo módulo: act-servicos.js); a torre não tem planta',
    },
    palacio: {
      funcao: 'onde o governante mora e recebe: a casa do chefe e os palácios',
      quem: 'o governante e a família dele; quem vem em audiência',
      sistemas: ['G.Court', 'G.Interiors'],
      atividades: [
        { id: 'morar', o: 'o governante e a família moram ali', essencial: true, resultado: 'a casa do governante', condicao: 'um governante', feito: 'parcial', provas: ['qa/civicos.js'] },
        { id: 'audiencia', o: 'o governante recebe em audiência no trono', usos: ['audiencia'], tarefa: 'assembly', dono: 'C', resultado: 'quem governa no trono e a cidade nos lugares da planta, até a audiência acabar', condicao: 'o melhor palácio do povo (o paço também) pronto na capital, com planta (G.Court.audPalace); na resposta à petição, na coroação e na chegada de um emissário (D-124)', feito: true, provas: ['qa/escala.js'] },
      ],
      notas: 'a audiência (D-124, da Arquitetura Monumental): quem governa senta no trono e a cidade entra pelos lugares da planta — o voto e o pão continuam na praça; o «morar» é parcial: o palácio pronto fica marcado como o de quem o mandou erguer (v.palace), mas nenhuma família o tem como casa: o governante e os seus continuam morando na casa deles',
    },
    cultura: {
      atividades: [
        { id: 'espetaculo', o: 'o espetáculo do dia: os atores se preparam, as portas abrem, o público paga, assiste e aplaude; os atores recebem', essencial: true, tipos: ['teatro'], dono: 'P2', tarefa: 'teatro', ato: 'espetaculo/assistir', corpo: 'atividade', recursos: ['moedas'], resultado: 'a entrada vai ao tesouro e o cachê às casas dos atores, pelo livro; quem viu fica mais devoto e a cidade mais leal; sem ator, a entrada volta', condicao: 'um teatro com atores, no fim da tarde', feito: true, provas: ['qa/lazer-mao.js'] },
        { id: 'atuar', o: 'o ator sobe ao palco (o romano luta de mentira na arena)', tipos: ['teatro'], dono: 'P2', tarefa: 'atuar', ato: 'espetaculo/atuar', corpo: 'atividade', resultado: 'há peça', condicao: 'o espetáculo do dia', feito: true, provas: ['qa/lazer-mao.js'] },
        { id: 'ler', o: 'ler um rolo na biblioteca; o copista copia na mesa do escriba', essencial: true, tipos: ['biblioteca'], dono: 'P2', tarefa: 'ler', ato: 'leitura/ler', corpo: 'atividade', resultado: 'a pesquisa do povo avança um pouco, até o teto do dia da biblioteca', condicao: 'um povo que conhece a escrita, nas horas da biblioteca', feito: true, provas: ['qa/lazer-mao.js'] },
      ],
      notas: 'o espetáculo e a leitura são do P2 (act-lazer.js); os lugares de assistir, atuar e ler vêm das plantas do teatro e da biblioteca (P3/P4)',
    },
    cidade: {
      atividades: [
        { id: 'falar', o: 'o corpo do deus fala ao povo de cima da pedra da praça', tipos: ['praca'], dono: 'P2', ato: 'leitura/falar', corpo: 'atividade', resultado: 'quem está na praça ouve, e a cidade fica um pouco mais leal — uma vez por dia', condicao: 'a praça da cidade', feito: true, provas: ['qa/lazer-mao.js'] },
      ],
    },
  },
};
