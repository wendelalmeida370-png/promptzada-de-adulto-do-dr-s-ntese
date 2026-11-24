'use strict';
// ============================================================
//  The words of the activities: what people say to each other
//  while they work and trade — the call for a hand under a heavy
//  crate, "the warehouse is full", the foreman's count at the
//  door, the price at a stall, the offer, the counter-offer, the
//  "too dear, another day". Each people says it its own way: its
//  greeting, its money (dracmas, denarii, debens of copper, weighed
//  silver, cacao beans), its manner — and a people without coin
//  speaks of exchange, not of price. The lines are a pack of
//  templates per people over a common one, chosen by the moment's
//  own numbers (never the world's chance: the words change nothing
//  in the world), filled only with what the speaker knows — the
//  caller gives the facts. Said through G.Talk: a bubble over the
//  head, in the god's view and over the body's eyes in the Modo
//  Encarnado — incui.js reads the same list and paints it with the
//  same hand, Talk.paint (L-211; before it, the 3D drew no words).
// ============================================================
(function (G) {
  const F = G.Falas = {};
  const E = G.Eco;
  // the money of each people: singular, plural (a people without coin trades in kind)
  F.MONEY = { grego: ['dracma', 'dracmas'], romano: ['denário', 'denários'], egipcio: ['deben de cobre', 'debens de cobre'], nordico: ['peça de prata', 'peças de prata'], asteca: ['grão de cacau', 'grãos de cacau'], classico: ['moeda', 'moedas'] };
  F.HELLO = { grego: ['Khaire!', 'Saudações, amigo.', 'Salve, estrangeiro.'], romano: ['Salve!', 'Ave, cidadão.', 'Salve, amigo.'], egipcio: ['Em hotep!', 'Que a paz esteja contigo.', 'Saudações, irmão.'], nordico: ['Heill!', 'Saudações, camarada.', 'Bom ver você.'], asteca: ['Niltze!', 'Saudações, senhor.', 'Que o dia te seja bom.'], classico: ['Bom dia!', 'Saudações.', 'Olá, amigo.'] };
  // the common pack: every key every people can say; a people's own pack replaces a key with its own lines
  F.PACK = {
    comum: {
      // the quay and the warehouse
      pedir_ajuda: ['Uma mão aqui! Esta caixa de {bem} pesa como um boi.', 'Preciso de mais um para esta caixa de {bem}.', 'Alguém me ajuda com esta? Sozinho não vai.'],
      oferecer_ajuda: ['Deixa que eu pego do outro lado.', 'Eu ajudo. No três: um, dois…', 'Segura daí que eu seguro daqui.'],
      sozinho: ['Ninguém veio. Levo o que der.', 'Vou levando aos poucos, então.'],
      passagem: ['Abram caminho! Caixa pesada passando!', 'Licença, licença — olha a caixa!'],
      armazem_cheio: ['O armazém está cheio! Não cabe nem mais um grão de {bem}.', 'Não tem mais lugar para {bem} lá dentro.'],
      conferido: ['Conferido: {got}. Tudo no armazém.', 'Contei tudo: {got}. Bate com o que veio.'],
      faltam: ['Conferido: chegou {got}; faltam {lost}.', 'Não bate: chegou {got}, faltam {lost}.'],
      paga: ['Aqui está: {preco} pela caixa.', 'Tua paga: {preco}. Bom trabalho.'],
      deve: ['O tesouro está vazio. Fica anotado: te devo {preco}.', 'Sem moeda hoje. Pago amanhã os {preco} que te devo.'],
      noite: ['Chega por hoje. Amanhã terminamos.', 'Escureceu. As caixas esperam o sol.'],
      // the stall
      pregao: ['Olha o {bem}! Bom e barato!', '{bem} aqui! Quem vai querer?', 'Chegou {bem} do bom!'],
      perguntar: ['Quanto pelo {bem}?', 'E o {bem}, quanto sai?', 'Tem {bem}?'],
      preco: ['{bem}? {preco}.', 'Para você, {preco}.', '{preco}, e é dos bons.'],
      pechinchar: ['{preco}? É muito. Dou {oferta}.', 'Faz por {oferta}?', 'Com {oferta} eu levo agora.'],
      contrapropor: ['{oferta} não dá. Fica por {contra}.', 'Meu último preço: {contra}.', 'Por {contra}, e não se fala mais nisso.'],
      aceitar: ['Fechado.', 'Combinado. É seu.', 'Está bem, leva.'],
      aceitar_contra: ['Está bem, {contra}. Fechado.', 'Vá lá: {contra}.'],
      recusar_oferta: ['Assim eu perco. Não dá.', 'Por esse preço eu nem trouxe do armazém.'],
      recusar_caro: ['Caro demais. Fica para outro dia.', 'Não vale isso. Vou ver em outra banca.', 'Com esse preço, não.'],
      sem_dinheiro: ['Não tenho com que pagar.', 'Hoje a bolsa está vazia.'],
      sem_lugar: ['Não tenho mais onde guardar a troca. Volte mais tarde.', 'Está tudo cheio: hoje não cabe mais nada.'],
      maos_cheias: ['Estou com as mãos cheias. Volto depois.', 'Agora não tenho como levar.'],
      casa_cheia: ['Lá em casa não cabe mais {bem}. Fica para outra vez.', 'Não tenho onde guardar mais {bem}.'],
      agradecer: ['Obrigado! Volte sempre.', 'Bom negócio. Até a próxima.', 'Que te faça bom proveito.'],
      escasso: ['{bem} está difícil: o armazém quase não tem.', 'Falta {bem} na cidade inteira.'],
      nao_tenho: ['Hoje não tenho {bem}.', '{bem}, só amanhã.'],
      abrir: ['Banca aberta!', 'Vamos ao trabalho.'],
      fechar: ['Fechando por hoje.', 'Chega de vender. Amanhã tem mais.'],
      // a people without coin: exchange, not price
      troca_preco: ['{bem}? Troco por {preco}.', 'Dou {bem} por {preco}.'],
      troca_pechinchar: ['{preco} é muito. Te dou {oferta}.', 'Aceita {oferta} em troca?'],
      // the tavern (act-taverna.js)
      pedir_taverna: ['Me vê {bem}!', '{bem}, por favor.', 'Hoje eu quero {bem}.'],
      servir_taverna: ['Aqui está: {bem}.', 'Saindo {bem}! Bom proveito.', '{bem}, como pediu.'],
      acabou: ['Acabou {bem}! Só amanhã.', 'Hoje não tem mais {bem}, amigo.'],
      cheia: ['Está lotado! Volte mais tarde.', 'Não cabe mais ninguém hoje.'],
      fechando: ['Vamos fechar! Todo mundo para casa.', 'Última rodada já foi. Boa noite a todos!'],
      sem_servico: ['Ninguém vem servir... vou embora.', 'Cansei de esperar.'],
      // (the keeper at the god's body's table, D-767: the menu, what ran out, the order taken, the menu let be)
      carta_taverna: ['{nome} O que vai ser hoje?', '{nome} Hoje temos {bem}. O que vai querer?', 'Boa noite! Temos {bem}. O que lhe sirvo?'],
      carta_falta: ['{bem}: acabou, sinto muito. Quer outra coisa?', 'Não tem mais {bem}. Escolha outra coisa, que eu trago.'],
      pedido_ok: ['É pra já!', 'Um momento, já trago.', '{bem}, saindo!'],
      carta_depois: ['Quando quiser, é só chamar.', 'Fico no balcão. É só chamar.'],
      // (P7, D-800 to D-810: the order kept on the table; the regulars and «o de sempre»; the brawler put out; the song asked and the coin
      // to the musician; the round for the table; the talk of the tables — what they know of the world, and the jokes of who drank)
      pedido_chegou: ['{nome}, sente-se — o seu pedido chegou.', '{nome}! O seu pedido está na mesa: sente-se.', '{nome}, deixei o seu pedido na sua mesa. Sente-se!'],
      pedido_volta: ['Esfriou e ninguém veio... volta para o balcão.', 'Não voltou: levo de volta.'],
      carta_sempre: ['{nome}! O de sempre? {bem}?', 'O de sempre, {nome}? {bem}?', 'Boa noite, {nome}! {bem}, como sempre?'],
      carta_sempre_falta: ['{nome}, hoje acabou {bem}. Quer {outro}?', 'Hoje não tem {bem}, {nome}. Que tal {outro}?'],
      servir_sempre: ['Aqui está, {nome}: o de sempre.', '{nome}! Aqui está {bem}, como sempre.', 'O de sempre, {nome}. Bom proveito.'],
      sempre_acabou: ['{nome}, {bem} acabou hoje — vai {outro}.', 'Hoje não tem {bem}, {nome}. Trago {outro}.'],
      expulsar: ['Fora daqui! Briga na minha casa, não!', 'Chega! Para a rua, e não volte hoje.', 'Aqui não se briga. Fora!'],
      gorjeta_obrigado: ['Obrigado! Que os deuses lhe paguem.', 'Valeu a moeda!', 'Obrigado, amigo!'],
      musica_sim: ['Uma canção {povo}! Lá vai.', 'Essa eu sei! Uma {povo}.', 'Uma {povo}, pois não!'],
      musica_nao: ['Não sei as canções {povo}... desculpe.', 'Das canções {povo} não sei nenhuma.'],
      rodada_mesa: ['Uma rodada para a mesa, por minha conta!', 'Taverneiro! Uma rodada para todos aqui!'],
      mesa_festa: ['Hoje tem {bem}! A cidade inteira vai estar lá.', 'Você vai às festas de hoje? {bem}! Vai ser grande.', 'Dizem que nesta {bem} vai ter de tudo.'],
      mesa_guerra: ['Essa guerra com {bem} não acaba nunca.', 'Meu primo foi para a guerra contra {bem}. Que volte inteiro.', 'Se {bem} vierem até aqui, quem segura?'],
      mesa_colheita: ['O armazém está quase vazio. Se a colheita não vier, vamos passar fome.', 'Pouca comida no celeiro... o pão vai faltar.', 'Com o armazém assim, quem não plantou vai apertar o cinto.'],
      mesa_bebida: ['Mais uma! A noite é uma criança!', 'Quem pagou esta? Eu é que não fui!', 'Eu? Bêbado? Só um pouquinho...', 'Ninguém canta como eu depois da terceira!', 'Amanhã eu trabalho dobrado. Hoje, não!'],
      // the tavern in the world that happens and its feasts (T1, D-813 to D-825): the keeper who opens to the street and bars the door;
      // the mourning's word and toast; the feast's speech and its talk; the slate; the drinking match
      abrigar_chama: ['Entrem! Depressa, todos para dentro!', 'Para dentro, rápido! Aqui eles não entram!', 'Venham! A taverna é de quem precisa!'],
      abrigar_tranca: ['Tranquem tudo! Ninguém abre essa porta!', 'Silêncio agora. E longe da porta.', 'A tranca está passada. Fiquem quietos.'],
      mesa_luto: ['Que os deuses guardem {bem}.', 'Sem {bem}... não sei o que vem agora.', 'Gente como {bem} não nasce todo dia.'],
      brinde_memoria: ['À memória de {bem}.', 'Por {bem}, que descanse em paz.'],
      festa_discurso: ['Bebam, amigos! Hoje a festa é por {bem}!', 'Ergam as canecas: {bem}! A primeira rodada é da casa!', 'Um instante de silêncio! Esta noite brindamos a {bem} — e a casa paga a primeira!'],
      mesa_festa_casa: ['Que festa! Tudo isto por {bem}.', 'Você soube? A festa de hoje é por {bem}.', 'Por {bem}, mais uma!'],
      fiado_sim: ['Fica na conta, {nome}. Mas não esqueça.', 'Pode beber, {nome}: eu anoto.', 'Por hoje vai fiado, {nome}.'],
      fiado_nao: ['Primeiro paga o que deve, {nome}.', 'Fiado não, {nome}. Pague a conta antes.'],
      fiado_paga: ['Aqui está o que eu devia. Estamos quites.', 'Toma: a conta paga.'],
      concurso_desafio: ['Quem bebe mais que eu? Quem aguenta até o fim?', 'Uma aposta: quem cair primeiro paga a vergonha!'],
      concurso_vence: ['Ninguém bebe como eu!', 'Ganhei! E ainda estou de pé!'],
      // the baths (act-servicos.js)
      banho_quente: ['Ah, a água está quente hoje!', 'Que calor bom nesta água.', 'Isto sim é descanso.'],
      banho_frio: ['Brr! A água está fria hoje.', 'Sem fogo na fornalha... água gelada.', 'Fria, mas lava do mesmo jeito.'],
      termas_cheia: ['Está cheio. Volto outra hora.', 'Não cabe mais ninguém na água.'],
      // the theatre (act-lazer.js)
      teatro_comeca: ['Silêncio! Vai começar.', 'Atenção, povo: a peça começa!', 'Que comece o espetáculo!'],
      teatro_aplausos: ['Bravo! Bravo!', 'Que peça! Valeu cada moeda.', 'Mais uma! Mais uma!'],
      teatro_cheio: ['Não cabe mais ninguém nas fileiras.', 'Lotado. Fica para amanhã.'],
      teatro_sem_peca: ['Não veio ator nenhum... hoje não tem peça.', 'Sem atores, sem espetáculo. Devolvem a entrada.'],
    },
    grego: {
      pregao: ['Olha o {bem}! Melhor que o de Corinto!', '{bem} da ágora! Quem vai querer?'],
      recusar_caro: ['Caro demais, nem em Atenas se paga isso.', 'Não vale isso. Vou ver na outra banca.'],
      agradecer: ['Khaire! Volte sempre.', 'Bom negócio, amigo.'],
      carta_taverna: ['{nome} Vinho da casa, ou outra coisa?', '{nome} Temos {bem}. O que lhe trago?'],
    },
    romano: {
      pregao: ['{bem} do fórum! Bom e barato!', 'Olha o {bem}, cidadão!'],
      contrapropor: ['{oferta}? Nem pensar. {contra}, palavra de romano.', 'Por {contra}, e o negócio é seu.'],
      paga: ['Teu salário: {preco}.', 'Aqui estão os teus {preco}.'],
      carta_taverna: ['{nome} O que deseja hoje?', '{nome} Hoje há {bem}. O que deseja?'],
    },
    egipcio: {
      pregao: ['{bem} do cais! Chegou com a cheia!', 'Olha o {bem}, irmão!'],
      conferido: ['O escriba pode anotar: {got}. Tudo certo.', 'Contado e certo: {got}.'],
    },
    nordico: {
      pedir_taverna: ['Mais {bem}, taverneiro!', 'Enche o meu corno: {bem}!'],
      fechando: ['Fora, todos! O salão fecha.', 'Chega de hidromel por hoje. Para casa!'],
      carta_taverna: ['{nome} Senta aí. O que vai ser?', '{nome} Tem {bem} no salão. O que te trago?'],
      carta_sempre: ['{nome}! O de sempre? {bem}?', 'Senta, {nome}. {bem}, como sempre?'],
      expulsar: ['Fora do meu salão! Vai brigar lá fora!', 'Chega! Para a rua, e só volta sóbrio.'],
      festa_discurso: ['Encham os cornos! Hoje bebemos a {bem}!', 'Skál! Por {bem}! A primeira é do salão!'],
      pedir_ajuda: ['Ei! Uma mão nesta caixa de {bem}, que pesa como um touro.', 'Preciso de outro braço aqui!'],
      pregao: ['{bem}! Pesado na balança, honesto no preço!', 'Olha o {bem}, trazido pelo mar!'],
      preco: ['{bem}? {preco}, pesadas na balança.', '{preco}. Pode pesar.'],
    },
    asteca: {
      pregao: ['{bem} no tianguis! Venham ver!', 'Olha o {bem}, bom de verdade!'],
      preco: ['{bem}? {preco}.', 'Custa {preco}, senhor.'],
      agradecer: ['Que os deuses te guardem. Volte.', 'Bom negócio, senhor.'],
      carta_taverna: ['{nome} O que deseja hoje?', '{nome} Hoje temos {bem}. O que lhe sirvo?'],
    },
  };
  // the people of a speaker (and so its pack, its money, its greeting)
  const civOf = v => (v && G.Fac.ofV(v) && G.Fac.ofV(v).civ) || (v && v.civ) || 'classico';
  F.hasCoin = function (fid) { const f = G.Fac.get(fid); return !!(f && E.coinage(f.id)); };
  F.money = function (civ, n) { const m = F.MONEY[civ] || F.MONEY.classico; return Math.abs(n - 1) < 0.005 ? m[0] : m[1]; };
  // a price as a people says it: "3 dracmas", "1,5 denário"
  F.price = function (civ, n) { const x = Math.round(n * 10) / 10; return `${String(x).replace('.', ',')} ${F.money(civ, x)}`; };
  // a list of goods as a sentence: "12 de comida, 4 de madeira e 2 de sal"
  F.goodsText = function (list) { const L = (list || []).map(o => `${Math.round(o.n)} de ${E.name(o.k)}`); return L.length > 1 ? L.slice(0, -1).join(', ') + ' e ' + L[L.length - 1] : L[0] || 'nada'; };
  // one line: the people's own pack first, the common one after; the variant chosen by the moment (same moment, same line)
  F.line = function (key, ctx) {
    ctx = ctx || {}; const civ = ctx.civ || civOf(ctx.v);
    const own = F.PACK[civ] && F.PACK[civ][key]; const L = own || F.PACK.comum[key]; if (!L || !L.length) return null;
    const seed = (ctx.v ? ctx.v.id * 7 : 0) + (ctx.op ? (ctx.op.id || ctx.op) * 13 : 0) + key.length * 31 + Math.floor((G.S ? G.S.day : 0) * 3) + (ctx.n || 0);
    let t = L[Math.floor(G.hash(seed) * L.length) % L.length];
    const fill = { bem: ctx.k ? E.name(ctx.k) : (ctx.bem || 'isto'), got: F.goodsText(ctx.got), lost: F.goodsText(ctx.lost), nome: ctx.nome || '', outro: ctx.outro || 'outra coisa', povo: ctx.povo || '',
      preco: ctx.preco !== undefined ? (typeof ctx.preco === 'number' ? F.price(civ, ctx.preco) : ctx.preco) : '',
      oferta: ctx.oferta !== undefined ? (typeof ctx.oferta === 'number' ? F.price(civ, ctx.oferta) : ctx.oferta) : '',
      contra: ctx.contra !== undefined ? (typeof ctx.contra === 'number' ? F.price(civ, ctx.contra) : ctx.contra) : '' };
    t = t.replace(/\{(\w+)\}/g, (m, k) => (fill[k] !== undefined ? fill[k] : m));
    return t.charAt(0).toUpperCase() + t.slice(1);
  };
  F.hello = function (v) { const L = F.HELLO[civOf(v)] || F.HELLO.classico; return L[Math.floor(G.hash(v.id * 3 + (G.S ? G.S.day : 0)) * L.length) % L.length]; };
  // said aloud (nobody hears the words of the skipped years: they are not said then)
  F.say = function (v, key, ctx) {
    if (!v || (G.Skip && G.Skip.on) || !G.Talk) return null;
    const txt = F.line(key, Object.assign({ v }, ctx || {})); if (!txt) return null;
    const b = G.Talk.say(v, txt, { dur: Math.min(5, 1.6 + txt.length / 14) });
    if (b) { b.key = key; b.op = ctx && ctx.op ? ctx.op.id || ctx.op : 0; }
    return txt;
  };
})(window.G);
