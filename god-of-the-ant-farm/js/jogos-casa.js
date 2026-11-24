'use strict';
// ============================================================
//  Os jogos da casa (a quarta onda da taverna, frente J — D-930 a
//  D-939): de onde vem o jogo de quem joga. Nada vem do nada
//  (D-440): os dados do copo e os baralhos das Tabuletas são coisas
//  de verdade (G.Itens: `dados`, `baralho`), contadas no livro.
//   - A casa tem os seus (JC.casa): na prateleira da taverna (o
//     lugar 'b:'), quantos o degrau dela guarda — os dados, um jogo
//     por mesa que joga ao mesmo tempo (G.JogoDados.SETS); os
//     baralhos, dois por partida, um de cada lado (G.Cartas.SETS) —,
//     feitos pelo taverneiro do material que o povo tem
//     (G.JogoDados.faz, G.Cartas.faz). O que some — queima, o deus
//     tira, se perde — faz falta até a casa fazer outro.
//   - O empréstimo à mesa (JC.empresta / JC.devolve, D-932): uma
//     partida leva um jogo livre — o da casa ou o de quem joga —, que
//     sai de onde estava para a mesa (o lugar 'n:' do livro, «na
//     mesa») e volta no fim, de qualquer fim; o que fica numa mesa
//     sem partida a ronda de cada segundo devolve.
//   - Esperar (D-933): com os jogos da casa todos na mesa, ninguém
//     começa outra partida com eles; a tela diz com quem estão
//     (JC.ondeEstao, JC.semJogo).
//   - O aluguel (JC.aluguel, D-934): quem chama o jogo e não é
//     freguês da casa nesta noite paga a mesa ao taverneiro.
//   - O seu próprio jogo (JC.proprio, D-935): na mochila — o corpo
//     do deus, só o que leva —, ou em casa (os do mundo); com ele,
//     joga-se sem esperar nem alugar, e quem é dono o leva ao sair.
//   - Comprar (JC.comprar, D-936): o taverneiro vende o jogo que
//     sobra, ou faz um por dia do material da casa; o armazém do povo
//     dá os de madeira (G.Inv.make). Quem é muito de jogo e acha os da
//     casa todos na mesa compra o seu (JC.querComprar).
//  Puro onde só lê; as portas que mudam o mundo só no passo do mundo
//  (G.inSim). Só este arquivo escreve o registro dos jogos na mesa
//  (S.jogosMesa) e o lugar 'n:' (a regra 455); nenhum sorteio (460).
// ============================================================
(function (G) {
  const D = G.Depot, A = G.Act, It = G.Itens; if (!D || !A || !It) return;
  const JC = G.JogosCasa = {};
  const S_ = () => G.S; const EPS = 1e-6;
  const r1 = x => Math.round(x * 10) / 10, r2 = x => Math.round(x * 100) / 100;
  const T = () => G.Taverna, E = () => G.Eco;

  // ------------------------------ os números (D-931, D-934, D-936) ------------------------------
  JC.ALUGUEL = 0.1;                           // (o aluguel de um jogo da casa por partida: um terço de uma caneca)
  JC.PRECO = { dados: 0.4, baralho: 0.8 };    // (o jogo que o taverneiro vende: o trabalho e o material)
  JC.VENDE_DIA = 1;                           // (os que o taverneiro faz para vender, por dia e por tipo)
  JC.COMPRA = 0.66;                           // (a vontade de jogo acima da qual quem acha os da casa todos na mesa compra o seu)
  JC.FOLGA = 4;                               // (… se o preço não passa de um quarto do que ele tem)
  // os dois tipos: os dados do copo (um jogo por partida) e o baralho das Tabuletas (um de cada lado)
  const TIPO = JC.TIPOS = Object.freeze({
    dados: Object.freeze({ kind: 'dados', jogo: 'dados', um: 'jogo de dados', uns: 'jogos de dados', seu: 'os seus dados', casa: 'dados da casa' }),
    baralho: Object.freeze({ kind: 'baralho', jogo: 'cartas', um: 'baralho', uns: 'baralhos', seu: 'o seu baralho', casa: 'baralho da casa' }),
  });
  // (as chaves de cada tipo, a melhor primeiro: o osso antes da madeira; a cera, o barro e o papiro antes do amate e da madeira)
  const KEYS = {}; for (const t of Object.keys(TIPO)) KEYS[t] = It.KINDS[t] ? It.KINDS[t].mats.slice().reverse().map(m => It.keyOf(t, m)) : [];
  JC.keys = t => (KEYS[t] || []).slice();
  const tipoOf = k => { const d = k ? It.def(k) : null; return d && TIPO[d.kind] ? d.kind : null; };
  JC.tipoOf = tipoOf;
  // quantos a casa guarda, pelo degrau dela (os números de cada jogo: G.JogoDados.SETS, G.Cartas.SETS)
  JC.guarda = function (b, tipo) { const L = tipo === 'dados' ? G.JogoDados && G.JogoDados.SETS : G.Cartas && G.Cartas.SETS; return b && L ? L[b.esc] || L.taberna || 1 : 0; };
  const coin = b => !!b && E().coinage(G.Village.facOfSet(b.set));
  const money = (b, n) => (G.Falas ? G.Falas.price((G.Fac.get(G.Village.facOfSet(b.set)) || {}).civ || 'classico', n) : String(n));
  JC.money = money;
  const NUM = ['nenhum', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez'];

  // ------------------------------ o registro: os jogos na mesa (S.jogosMesa, no save) ------------------------------
  // n: os jogos fora do lugar deles, pelo id — { id, jogo (a partida: a operação dos dados, a partida das Tabuletas; 0: solto numa mesa,
  // à espera de lugar na prateleira), tipo, b (a taverna), g (a mesa), k, n (1 na mesa), ref (para onde volta: a prateleira, a mochila, a
  // casa), dono (de quem é: 0 a casa), lar (a casa do dono), quem (quem joga com ele), lado (o lado da partida das Tabuletas), civ (o povo
  // das tabuletas de um baralho), t, aluguel, pagou }; venda: o que o taverneiro fez para vender hoje — { d, n: { 'b:tipo': n } }
  const reg = () => { const S = S_(); if (!S.jogosMesa || typeof S.jogosMesa !== 'object') S.jogosMesa = { n: {}, venda: { d: -1, n: {} } }; return S.jogosMesa; };
  const recs = () => { const s = S_() && S_().jogosMesa; if (!s) return []; return Object.keys(s.n).map(k => s.n[k]).sort((a, c) => a.id - c.id); };
  JC.mesa = id => { const s = S_() && S_().jogosMesa; return (s && s.n[id]) || null; };
  JC.todos = () => recs();
  JC.doJogo = jogo => recs().filter(r => r.jogo && r.jogo === jogo);
  // o lugar do livro de um jogo na mesa: uma coisa só, a do registro
  D.addKind('n', {
    obj: id => JC.mesa(id),
    get: (o, k) => (o.k === k ? o.n : 0),
    room: (o, k) => (o.k === k ? Math.max(0, 1 - o.n) : 0),
    take: (o, k, n) => { o.n = Math.max(0, Math.round((o.n - n) * 1e4) / 1e4); },
    put: (o, rec) => { o.n = Math.round((o.n + rec.n) * 1e4) / 1e4; },
    list: o => (o.n > EPS ? { [o.k]: o.n } : {}),
    owner: o => { const b = S_().buildings.get(o.b); return { fac: b ? G.Village.facOfSet(b.set) : 0, bld: o.b, who: o.dono || 0 }; },
    all: () => recs(),
  });

  // ------------------------------ o que a casa tem (puro) ------------------------------
  // os jogos de um tipo de uma taverna: na prateleira, numa mesa com partida, soltos numa mesa (a casa os pode emprestar dali) →
  // { guarda, total, livres, prateleira, naMesa: [registros], soltos: [registros], por: { chave: n } }
  JC.casa = function (b, tipo) {
    const out = { guarda: JC.guarda(b, tipo), total: 0, livres: 0, prateleira: 0, naMesa: [], soltos: [], por: {} }; if (!b || !TIPO[tipo]) return out;
    const ref = 'b:' + b.id;
    for (const k of KEYS[tipo]) { const n = Math.floor(D.get(ref, k) + EPS); if (n > 0) { out.por[k] = n; out.prateleira += n; } }
    for (const r of recs()) { if (r.ref !== ref || tipoOf(r.k) !== tipo || !(r.n > EPS)) continue; out.por[r.k] = (out.por[r.k] || 0) + 1; if (r.jogo) out.naMesa.push(r); else out.soltos.push(r); }
    out.livres = out.prateleira + out.soltos.length; out.total = out.livres + out.naMesa.length; return out;
  };
  // um jogo livre da casa (ja: as fontes já escolhidas para a mesma partida, que não contam de novo) → { de, ref, k, dono: 0, lar: 0,
  // daCasa: 1 } | null. «de» é onde ele está agora; «ref», para onde volta
  JC.daCasa = function (b, tipo, ja) {
    if (!b || !TIPO[tipo]) return null; const ref = 'b:' + b.id; const took = {}; const solto = new Set();
    for (const s of ja || []) if (s && s.daCasa && s.ref === ref) { if (s.de === ref) took[s.k] = (took[s.k] || 0) + 1; else solto.add(s.de); }
    for (const k of KEYS[tipo]) if (Math.floor(D.free(ref, k) + EPS) - (took[k] || 0) >= 1) return { de: ref, ref, k, dono: 0, lar: 0, daCasa: 1 };
    for (const r of recs()) if (!r.jogo && r.ref === ref && tipoOf(r.k) === tipo && r.n > EPS && !solto.has('n:' + r.id)) return { de: 'n:' + r.id, ref, k: r.k, dono: 0, lar: 0, daCasa: 1 };
    return null;
  };
  // o jogo de uma pessoa: o que leva na mochila; ou — quem é do mundo — o da sua casa, na cidade da taverna (o da família, como as moedas
  // dela: E.coinRef). O corpo do deus só o que leva (D-426) → { de, ref, k, dono, lar, daCasa: 0 } | null
  JC.proprio = function (v, tipo, b) {
    if (!v || !TIPO[tipo] || !G.Inv) return null;
    for (const k of KEYS[tipo]) if (G.Inv.count(v, k) >= 1) return { de: 'm:' + v.id, ref: 'm:' + v.id, k, dono: v.id, lar: v.home || 0, daCasa: 0 };
    if (A.isBody(v)) return null; const h = E().homeOf(v); if (!h || (b && h.set !== b.set)) return null;
    const ref = 'h:' + h.id; for (const k of KEYS[tipo]) if (Math.floor(D.free(ref, k) + EPS) >= 1) return { de: ref, ref, k, dono: v.id, lar: h.id, daCasa: 0 };
    return null;
  };
  // o jogo para um lugar à mesa: o de quem joga, senão um livre da casa
  JC.fonte = (b, tipo, v, ja) => JC.proprio(v, tipo, b) || JC.daCasa(b, tipo, ja);

  // ------------------------------ o aluguel (D-934; puro) ------------------------------
  // quem paga a mesa: quem chama o jogo e pega um da casa, a não ser que seja freguês da casa nesta noite (bebeu ou comeu: a casa empresta
  // a quem consome), da família do taverneiro, ou o freguês de sempre em quem ele confia — ou ele é generoso (a índole). Num povo sem moeda,
  // nada. O corpo como taverneiro não decide pela índole (o dia nunca decide pela família do corpo): cobra de quem não consome → { n, por }
  // (o freguês da noite: serviu-se de bebida ou de comida nesta noite — o livro do dia da casa, d.ped, P7 D-804 —, espera a sua rodada na
  // fila do balcão, ou tem a rodada da casa nas mãos)
  const servido = (b, v) => {
    const op = T() && T().dia ? T().dia(b) : null; const d = op && op.data; if (!d) return false;
    const P = d.ped ? d.ped[v.id] : null; if (P && Object.keys(P).some(k => P[k] > 0)) return true;
    return (Array.isArray(d.fila) && d.fila.includes(v.id)) || !!(v.carry && v.carry.op === op.id && v.carry.n > EPS);
  };
  const confia = (k, v) => { const s = G.Lacos && G.Lacos.sente ? G.Lacos.sente(k, v) : null; return (!!s && s.confianca >= ((T() && T().FIADO_CONF) || 10)) || (!!G.Indole && !!G.Indole.faceta && G.Indole.faceta(k, 'generoso') >= 0.55); };
  JC.aluguel = function (b, v) {
    if (!b || !v || !coin(b)) return { n: 0, por: 'sem moeda' };
    const k = T() && T().keeperOf ? T().keeperOf(b) : null;
    if (k && (k === v || E().coinRef(k) === E().coinRef(v))) return { n: 0, por: 'da casa' };
    if (servido(b, v)) return { n: 0, por: 'freguês da noite' };
    if (k && !A.isBody(k) && T().sempre && T().sempre(b, v) && confia(k, v)) return { n: 0, por: 'freguês de sempre' };
    return { n: JC.ALUGUEL, por: '' };
  };
  // (para onde vai: as moedas do taverneiro — a casa dele, ou a bolsa —; sem taverneiro, o tesouro do povo)
  const payee = b => { const k = T() && T().keeperOf ? T().keeperOf(b) : null; return k ? E().coinRef(k) : 'f:' + G.Village.facOfSet(b.set); };
  // o aluguel pago, pelo livro («aluguel-jogo»), das moedas de quem chama às do taverneiro → { ok, n, why }
  JC.cobra = function (b, v, ids, n) {
    if (!G.inSim || !b || !v) return { ok: false, n: 0, why: '' }; if (!(n > EPS)) return { ok: true, n: 0 };
    const from = E().coinRef(v), to = payee(b); if (from === to) return { ok: true, n: 0 };
    if (D.get(from, 'moedas') + EPS < n) return { ok: false, n: 0, why: `Falta dinheiro para o aluguel (${money(b, n)}).` };
    const r = D.move(from, to, 'moedas', n, { code: 'aluguel-jogo', by: v.id }); if (!r.ok) return { ok: false, n: 0, why: 'Não deu para pagar o aluguel.' };
    const L = (ids || []).map(id => JC.mesa(id)).filter(Boolean); const per = r2(r.n / Math.max(1, L.length)); for (const q of L) { q.aluguel = per; q.pagou = v.id; }
    return { ok: true, n: r.n };
  };

  // ------------------------------ o empréstimo à mesa (D-932; no passo do mundo) ------------------------------
  // um jogo vai para a mesa de uma partida: de onde está (s.de) para o lugar 'n:' do livro («jogo-mesa»); volta para s.ref no fim.
  // o: { b, jogo, tipo, g, s (a fonte: JC.fonte), quem, lado, civ } → o registro, ou null
  JC.empresta = function (o) {
    if (!G.inSim || !o || !o.b || !o.s || !TIPO[o.tipo]) return null; const S = S_(); const st = reg(); const s = o.s; const id = S.nextId++;
    const rec = { id, jogo: o.jogo, tipo: o.tipo, b: o.b.id, g: String(o.g), k: s.k, n: 0, ref: s.ref, dono: s.dono || 0, lar: s.lar || 0, quem: o.quem || 0, lado: o.lado === undefined ? -1 : o.lado, civ: o.civ || null, t: r1(S.clock), aluguel: 0, pagou: 0 };
    st.n[id] = rec;
    const r = D.move(s.de, 'n:' + id, s.k, 1, { code: 'jogo-mesa', by: o.quem || 0 });
    if (!r.ok) { delete st.n[id]; return null; }
    // (o da casa que estava solto numa mesa: o registro de lá acaba — a coisa está no novo)
    if (s.de[0] === 'n') { const old = JC.mesa(+s.de.slice(2)); if (old && !(old.n > EPS)) delete st.n[old.id]; }
    return rec;
  };
  // um jogo volta da mesa: para onde voltaria («jogo-volta»: a prateleira da casa, a mochila ou a casa do dono); o dono que se foi — morto
  // —, à casa dele, como as coisas dos mortos («herdado», D-375); a casa que perdeu a prateleira, perde o jogo («ruina»: queimou com ela);
  // o da casa que não cabe na prateleira fica solto na mesa (a casa o empresta dali, e a ronda tenta de novo); o de alguém que não cabe em
  // lugar nenhum fica com a casa («esquecido»)
  JC.devolve = function (id, why) {
    if (!G.inSim) return false; const st = reg(); const rec = st.n[id]; if (!rec) return false; const S = S_(); const ref = 'n:' + rec.id;
    if (!(rec.n > EPS)) { delete st.n[id]; return true; }
    const shelf = 'b:' + rec.b; const tries = [[rec.ref, 'jogo-volta']];
    if (rec.dono) { if (rec.lar) tries.push(['h:' + rec.lar, S.villagers.has(rec.dono) ? 'jogo-volta' : 'herdado']); tries.push([shelf, 'esquecido']); }
    for (const [to, code] of tries) { if (!(rec.n > EPS)) break; if (!D.exists(to)) continue; if (to[0] === 'm' && !S.villagers.has(rec.dono)) continue;
      D.move(ref, to, rec.k, rec.n, { code, by: rec.dono || 0, floor: to[0] === 'h' }); }
    if (rec.n > EPS) {
      // (a prateleira de pé e cheia: solto na mesa, da casa)
      if (D.exists(shelf)) { rec.jogo = 0; rec.ref = shelf; rec.dono = 0; rec.lar = 0; rec.quem = 0; rec.lado = -1; return true; }
      const b = S.buildings.get(rec.b); D.use(ref, rec.k, rec.n, { code: b && b.type === 'ruin' ? 'ruina' : 'perdido', by: rec.dono || 0, mine: true });
    }
    delete st.n[id]; void why; return true;
  };
  // (a partida de um jogo na mesa ainda viva: a operação dos dados; a partida das Tabuletas)
  function vivo(rec) {
    if (!rec.jogo) return false;
    if (rec.tipo === 'dados') { const op = A.get(rec.jogo); return !!op && op.def === 'jogo-dados' && A.live(op); }
    const j = G.Cartas && G.Cartas.jogo ? G.Cartas.jogo(rec.jogo) : null; return !!j && j.fase === 'jogo';
  }
  JC.vivo = rec => !!rec && vivo(rec);
  // a ronda de cada segundo (no salto também): o jogo numa mesa sem partida volta; o solto, à prateleira quando ela tiver lugar
  A.hooks.tick.push(function () {
    const s = S_() && S_().jogosMesa; if (!s) return;
    for (const r of recs()) { if (r.jogo && vivo(r)) continue; if (!r.jogo) { const shelf = 'b:' + r.b; if (D.exists(shelf) && D.room(shelf, r.k) + EPS < r.n) continue; } JC.devolve(r.id, 'ronda'); }
  });
  // (o dono de um jogo na mesa que sai de vez — morre, é levado —: a partida dele percebe pela sua própria regra; o registro guarda a casa)

  // ------------------------------ o que a tela diz (puro: o que a pessoa vivida sabe — G.Possess.knows) ------------------------------
  // (o nome como o corpo o diz — G.Possess.knows: «Orm», ou «o ferreiro» —, e com o «de»: de Orm, do ferreiro, da tecelã)
  const nome = (v, o) => { if (!o) return 'alguém'; const K = G.Possess && G.Possess.knows; return v && K && K.call ? K.call(v, o) : o.name; };
  const nomeDe = (v, o) => { const n = nome(v, o); return /^[oa] /.test(n) ? 'd' + n : 'de ' + n; };
  const lista = L => (L.length > 1 ? L.slice(0, -1).join(', ') + ' e ' + L[L.length - 1] : L[0] || '');
  // (quem joga uma partida: os dados — quem ainda está nela primeiro —, as Tabuletas — os dois lados)
  function jogadores(rec) {
    if (rec.tipo === 'dados') { const op = A.get(rec.jogo); return op && op.data ? op.data.quem.filter(id => !op.data.fora[id]).concat(op.data.quem.filter(id => op.data.fora[id])) : []; }
    const j = G.Cartas && G.Cartas.jogo ? G.Cartas.jogo(rec.jogo) : null; return j ? j.quem.slice() : [];
  }
  // (os da casa que estão em partidas, numa frase sem o ponto: «o jogo de dados da casa está na mesa de Orm», «os dois baralhos da casa
  // estão na mesa de Orm e de Thyra», «os dois jogos de dados da casa estão na mesa de Orm e na de Thyra»; com um livre, «o outro …»)
  function naMesaFrase(v, c, t, outros) {
    const S = S_(); const by = new Map(); for (const r of c.naMesa) { if (!by.has(r.jogo)) by.set(r.jogo, []); by.get(r.jogo).push(r); }
    const mesas = [...by.values()]; const quem = rs => jogadores(rs[0]).map(id => S.villagers.get(id)).filter(Boolean);
    const onde = mesas.length === 1 ? `na mesa ${lista(quem(mesas[0]).slice(0, 3).map(o => nomeDe(v, o)))}` : lista(mesas.map((rs, i) => `${i ? 'na' : 'na mesa'} ${nomeDe(v, quem(rs)[0])}`));
    const n = c.naMesa.length;
    return `${n === 1 ? `${outros ? 'o outro' : 'o'} ${t.um} da casa está` : `${outros ? 'os outros' : 'os'} ${NUM[n] || n} ${t.uns} da casa estão`} ${onde}`;
  }
  // onde estão os jogos da casa de um tipo, numa frase: «Os dois baralhos da casa estão na mesa de Orm e de Thyra.»
  JC.ondeEstao = function (v, b, tipo) {
    const t = TIPO[tipo]; if (!t || !b) return ''; const c = JC.casa(b, tipo);
    if (!c.total) return `A casa não tem ${t.um}.`;
    const livre = c.livres === 1 ? `um ${t.um} da casa está livre` : `${NUM[c.livres] || c.livres} ${t.uns} da casa estão livres`;
    if (!c.naMesa.length) return G.cap(livre) + '.';
    const fr = naMesaFrase(v, c, t, c.livres > 0); return G.cap(c.livres ? `${livre}; ${fr}` : fr) + '.';
  };
  // o porquê de não haver jogo para a partida (need: quantos ela pede — o baralho, um de cada lado), e o que se pode fazer: «Os dois
  // baralhos da casa estão na mesa de Orm e de Thyra: espere um voltar, ou compre o seu (0,8 denário).» — '' quando há
  JC.semJogo = function (v, b, tipo, need) {
    const t = TIPO[tipo]; if (!t || !b) return ''; const c = JC.casa(b, tipo); const n = need || 1; if (c.livres >= n) return '';
    const pc = v ? JC.podeComprar(v, tipo, b) : { ok: false }; const buy = pc.ok ? `compre o seu${pc.preco ? ` (${money(b, pc.preco)})` : ''}` : '';
    if (!c.total) return `A casa ainda não tem ${t.um}${buy ? `: ${buy} do taverneiro` : ''}.`;
    const ele = c.naMesa.length === 1 ? 'ele' : 'um'; const fr = c.naMesa.length ? naMesaFrase(v, c, t, c.livres > 0) : '';
    if (c.livres) return `Só ${c.livres === 1 ? `um ${t.um} da casa está livre` : `${NUM[c.livres]} ${t.uns} da casa estão livres`}, e a partida pede ${NUM[n]} (cada lado joga com o seu)${fr ? `; ${fr}` : ''}: espere ${ele} voltar${buy ? `, ou ${buy}` : ''}.`;
    return `${G.cap(fr)}: espere ${ele} voltar${buy ? `, ou ${buy}` : ''}.`;
  };
  // de onde vem o jogo de uma partida, para a tela: «dados da casa, emprestados», «os seus dados», «os dados de Orm»; e o aluguel pago
  // (sem ele, «semAluguel», a tela que diz o aluguel da partida inteira ao lado — o pano das Tabuletas, o título do copo —: L-2190)
  JC.fonteDe = function (rec, v, semAluguel) {
    if (!rec) return ''; const t = TIPO[rec.tipo] || TIPO.dados; const S = S_();
    if (!rec.dono) return `${t.casa}, emprestado${rec.tipo === 'dados' ? 's' : ''}${!semAluguel && rec.aluguel > EPS ? ` (aluguel ${money(S.buildings.get(rec.b) || { set: 0 }, rec.aluguel)})` : ''}`;
    if (v && rec.dono === v.id) return t.seu;
    const o = S.villagers.get(rec.dono); return `${rec.tipo === 'dados' ? 'os dados' : 'o baralho'} ${nomeDe(v, o)}`;
  };

  // ------------------------------ comprar um jogo (D-936) ------------------------------
  // (a taverna onde a pessoa está, de pé ou à mesa; o dia dela vivo)
  const tavernOf = v => { const b = v && v.inside ? S_().buildings.get(v.inside) : null; return b && b.type === 'taverna' && b.built ? b : null; };
  const maker = tipo => (tipo === 'dados' ? G.JogoDados : G.Cartas);
  const venda = (b, tipo) => { const st = reg(); const S = S_(); if (!st.venda || st.venda.d !== S.day) return 0; return st.venda.n[b.id + ':' + tipo] || 0; };
  // o que o taverneiro vende agora (puro): o que sobra na prateleira além do que a casa guarda, senão um que ele faz hoje do material da
  // casa (um por dia); o preço → { ok, why, k, preco, de: 'sobra' | 'faz' }
  JC.podeComprar = function (v, tipo, b) {
    b = b || tavernOf(v); const t = TIPO[tipo]; if (!b || !t) return { ok: false, why: 'Só na taverna.' };
    const k0 = T() && T().keeperOf ? T().keeperOf(b) : null; if (!k0) return { ok: false, why: 'A taverna não tem taverneiro.' };
    if (k0 === v) return { ok: false, why: 'Você é o taverneiro: os jogos da casa já são seus.' };
    if (!(T().atHand && T().atHand(b))) return { ok: false, why: `${G.cap(nome(v, k0))} não está aqui para vender.` };
    if (!T().dia(b)) return { ok: false, why: 'A taverna está fechada.' };
    const c = JC.casa(b, tipo); const preco = coin(b) ? JC.PRECO[tipo] : 0; let k = null, de = null;
    if (c.total > c.guarda) for (const kk of KEYS[tipo]) if (Math.floor(D.free('b:' + b.id, kk) + EPS) >= 1) { k = kk; de = 'sobra'; break; }
    if (!k) {
      if (venda(b, tipo) >= JC.VENDE_DIA) return { ok: false, why: `O taverneiro já vendeu hoje o ${t.um} que fez; amanhã faz outro.` };
      const M = maker(tipo); k = M && M.qual ? M.qual(b) : null; if (!k) return { ok: false, why: `A casa não tem com que fazer um ${t.um} agora.` }; de = 'faz';
    }
    if (preco > EPS && D.get(E().coinRef(v), 'moedas') + EPS < preco) return { ok: false, why: `Falta dinheiro: um ${t.um} custa ${money(b, preco)}.`, k, preco, de };
    return { ok: true, why: '', k, preco, de };
  };
  // a compra (no passo do mundo): o taverneiro faz o jogo, se for o caso (o material da casa, pelo livro: G.JogoDados.faz / G.Cartas.faz),
  // e o vende — a coisa da prateleira para quem compra (a mochila do corpo; a casa de quem é do mundo, ou a mochila de quem não tem casa)
  // e as moedas para as dele, as duas pernas juntas («venda-jogo») → { ok, why, k, msg }
  JC.comprar = function (v, tipo, b) {
    if (!G.inSim || !v || !TIPO[tipo]) return { ok: false, why: '' }; b = b || tavernOf(v);
    const p = JC.podeComprar(v, tipo, b); if (!p.ok) return p; const S = S_(); const k0 = T().keeperOf(b); const shelf = 'b:' + b.id;
    let k = p.k;
    if (p.de === 'faz') { k = maker(tipo).faz(b, k0); if (!k) return { ok: false, why: `A casa não tem com que fazer um ${TIPO[tipo].um} agora.` };
      const st = reg(); if (!st.venda || st.venda.d !== S.day) st.venda = { d: S.day, n: {} }; st.venda.n[b.id + ':' + tipo] = (st.venda.n[b.id + ':' + tipo] || 0) + 1; }
    const h = A.isBody(v) ? null : E().homeOf(v); const to = h && h.set === b.set ? 'h:' + h.id : 'm:' + v.id;
    const c = { code: 'venda-jogo', by: v.id, floor: to[0] === 'h' };
    const r = p.preco > EPS ? D.swap([shelf, to, k, 1], [E().coinRef(v), E().coinRef(k0), 'moedas', p.preco], c) : D.move(shelf, to, k, 1, c);
    if (!r.ok) return { ok: false, why: r.why === 'não cabe' ? 'A mochila está cheia.' : 'Não deu.' }; // (o que foi feito fica na prateleira: um que sobra)
    return { ok: true, k, n: 1, msg: `Você compra um ${It.nome(k)}${p.preco ? ` por ${money(b, p.preco)}` : ''}.` };
  };
  // quem é do mundo e muito de jogo, à mesa sem jogo livre da casa, compra o seu (puro): adulto, a vontade (gana) acima de JC.COMPRA, sem
  // um seu, o taverneiro vendendo e o preço não passando de um quarto do que ele tem
  JC.querComprar = function (v, b, tipo, gana) {
    if (!v || !b || A.isBody(v) || v.age < 16 || !(gana >= JC.COMPRA) || JC.proprio(v, tipo, b)) return false;
    const p = JC.podeComprar(v, tipo, b); if (!p.ok) return false;
    return !(p.preco > EPS) || D.get(E().coinRef(v), 'moedas') + EPS >= p.preco * JC.FOLGA;
  };

  // ------------------------------ o material dos baralhos da casa (a compra do taverneiro, D-931) ------------------------------
  // o que a casa precisa do armazém para fazer o baralho que lhe falta, no primeiro material do seu povo que ele tem — o barro da olaria, a
  // cera das colmeias —, quando a prateleira não tem e o armazém tem: o act-taverna.js o compra com o resto (restockPick), antes de abrir
  JC.falta = function (b, f) {
    const out = []; if (!b || !f || !G.Origem) return out; const c = JC.casa(b, 'baralho'); if (c.total >= c.guarda) return out;
    for (const m of It.dePovo('baralho', f.civ) || ['madeira']) {
      if (!G.Origem.matOK(f.id, m)) continue;
      for (const o of It.feitoDe(It.keyOf('baralho', m)) || []) if (o.k !== 'wood' && D.free('b:' + b.id, o.k) + EPS < o.n && D.free('f:' + f.id, o.k) >= 1) out.push({ k: o.k, n: 1 });
      break; // (o primeiro que o povo tem: o jeito dele)
    }
    return out;
  };

  // ------------------------------ o save ------------------------------
  // os jogos na mesa vão inteiros (números e textos); um registro danificado sem coisa de verdade é largado; um save de antes não tem nada
  const fin = x => typeof x === 'number' && isFinite(x);
  (G.saveHooks = G.saveHooks || []).push({
    save(out) { const s = S_().jogosMesa; if (s && (Object.keys(s.n).length || (s.venda && s.venda.d >= 0))) out.jogosMesa = JSON.parse(JSON.stringify(s)); },
    load(o) {
      const S = S_(); const x = o && o.jogosMesa; if (!x || typeof x !== 'object') { delete S.jogosMesa; return; }
      const out = { n: {}, venda: { d: -1, n: {} } };
      for (const k of Object.keys(x.n || {})) { const r = x.n[k]; if (!r || !fin(r.id) || !fin(r.b) || !tipoOf(r.k) || !(fin(r.n) && r.n > EPS) || typeof r.ref !== 'string') continue;
        out.n[r.id] = { id: r.id, jogo: fin(r.jogo) ? r.jogo : 0, tipo: tipoOf(r.k), b: r.b, g: String(r.g || ''), k: r.k, n: Math.min(1, r.n), ref: r.ref, dono: fin(r.dono) ? r.dono : 0, lar: fin(r.lar) ? r.lar : 0, quem: fin(r.quem) ? r.quem : 0, lado: fin(r.lado) ? r.lado : -1, civ: typeof r.civ === 'string' ? r.civ : null, t: fin(r.t) ? r.t : 0, aluguel: fin(r.aluguel) ? r.aluguel : 0, pagou: fin(r.pagou) ? r.pagou : 0 }; }
      if (x.venda && fin(x.venda.d) && x.venda.n && typeof x.venda.n === 'object') { out.venda.d = x.venda.d; for (const q of Object.keys(x.venda.n)) if (fin(x.venda.n[q])) out.venda.n[q] = x.venda.n[q]; }
      S.jogosMesa = out;
    },
  });
  // (o registro mora no G.S: um mundo novo começa sem ele, um save o traz)
})(window.G);
