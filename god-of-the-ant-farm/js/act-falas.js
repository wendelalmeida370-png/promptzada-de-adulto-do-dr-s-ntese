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
//  caller gives the facts. Said through G.Talk: the bubble shows
//  over the head in the god's view, and the 3D shows the same list.
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
      agradecer: ['Obrigado! Volte sempre.', 'Bom negócio. Até a próxima.', 'Que te faça bom proveito.'],
      escasso: ['{bem} está difícil: o armazém quase não tem.', 'Falta {bem} na cidade inteira.'],
      nao_tenho: ['Hoje não tenho {bem}.', '{bem}, só amanhã.'],
      abrir: ['Banca aberta!', 'Vamos ao trabalho.'],
      fechar: ['Fechando por hoje.', 'Chega de vender. Amanhã tem mais.'],
      // a people without coin: exchange, not price
      troca_preco: ['{bem}? Troco por {preco}.', 'Dou {bem} por {preco}.'],
      troca_pechinchar: ['{preco} é muito. Te dou {oferta}.', 'Aceita {oferta} em troca?'],
    },
    grego: {
      pregao: ['Olha o {bem}! Melhor que o de Corinto!', '{bem} da ágora! Quem vai querer?'],
      recusar_caro: ['Caro demais, nem em Atenas se paga isso.', 'Não vale isso. Vou ver na outra banca.'],
      agradecer: ['Khaire! Volte sempre.', 'Bom negócio, amigo.'],
    },
    romano: {
      pregao: ['{bem} do fórum! Bom e barato!', 'Olha o {bem}, cidadão!'],
      contrapropor: ['{oferta}? Nem pensar. {contra}, palavra de romano.', 'Por {contra}, e o negócio é seu.'],
      paga: ['Teu salário: {preco}.', 'Aqui estão os teus {preco}.'],
    },
    egipcio: {
      pregao: ['{bem} do cais! Chegou com a cheia!', 'Olha o {bem}, irmão!'],
      conferido: ['O escriba pode anotar: {got}. Tudo certo.', 'Contado e certo: {got}.'],
    },
    nordico: {
      pedir_ajuda: ['Ei! Uma mão nesta caixa de {bem}, que pesa como um touro.', 'Preciso de outro braço aqui!'],
      pregao: ['{bem}! Pesado na balança, honesto no preço!', 'Olha o {bem}, trazido pelo mar!'],
      preco: ['{bem}? {preco}, pesadas na balança.', '{preco}. Pode pesar.'],
    },
    asteca: {
      pregao: ['{bem} no tianguis! Venham ver!', 'Olha o {bem}, bom de verdade!'],
      preco: ['{bem}? {preco}.', 'Custa {preco}, senhor.'],
      agradecer: ['Que os deuses te guardem. Volte.', 'Bom negócio, senhor.'],
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
    const fill = { bem: ctx.k ? E.name(ctx.k) : (ctx.bem || 'isto'), got: F.goodsText(ctx.got), lost: F.goodsText(ctx.lost), nome: ctx.nome || '',
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
