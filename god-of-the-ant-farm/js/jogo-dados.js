'use strict';
// ============================================================
//  O Copo — the dice game of the tavern (wave 4, T4: D-850 to
//  D-859; the contract in planos/taverna-onda4.md, D-669).
//  The rule, for the owner: each one at the table puts the stake
//  in the pot and hides two dice under a cup (three, two at the
//  table); in turn each says how much ALL the dice on the table
//  make — never a number one already said —; the cups come up:
//  who hit the sum right on («cravou») makes each of the others
//  lose a die; nobody did, the one farthest from it loses one;
//  with no dice left one is out; the last one with dice takes
//  the pot. Who bids first the cup says, and it turns a seat a
//  round. Two to four players, a game of a minute or three, the
//  bluff in the bids and the reading of the others.
//  Everything of it is the world's (D-669): the faces of each die
//  are the G.hash of the game, the round, the player and the die;
//  the bids, the stakes, who plays, who cheats and who sees it
//  are the índole and the purse of each one, by the hash — never a
//  chance of the world nor of the view. The game is an operation
//  of the world (G.Act, 'jogo-dados'), its pot the ledger's holder
//  'j:<op>' (the stake in, the prize out — G.Depot, with the
//  cause). It is played only with real dice (the catalog's
//  `dados`, of bone or of wood): the house's — made by the keeper,
//  of the carcass's bone the people had or of the wood of the
//  shelf —, lent to the table for the game and back at its end, or
//  one's own (the J front's G.JogosCasa: the rent, the waiting, the
//  purchase — D-930 to D-939). The customers play among
//  themselves, with or without the body looking; the body asks
//  through its hands (G.Possess.apply); the screen
//  (jogo-dados-ui.js) only shows what the world decided, by the
//  reading JD.corpo. The cheat — the quick hand that turns a die
//  as the cups come up — is the dishonest one's (G.Indole), and
//  the attentive ones may see it: then the confusion (the marks,
//  the tie, the fame, a brawl). The tournament of a feast night:
//  JD.torneio(b), the champion of the night takes the prize.
// ============================================================
(function (G) {
  const A = G.Act, D = G.Depot, E = G.Eco; if (!A || !D || !E) return;
  const JD = G.JogoDados = {};
  const R = JD.R = {}; // (the rule: pure — the same numbers for the same game in every world, every machine)
  const EPS = 1e-6;
  const r1 = x => Math.round(x * 10) / 10, r2 = x => Math.round(x * 100) / 100;
  const S_ = () => G.S;
  const live = A.live;
  const T = () => G.Taverna;

  // ------------------------------ the numbers ------------------------------
  JD.DADOS = 2; JD.DADOS2 = 3;       // (the dice each one hides under the cup at the start: two — three when only two are at the table, the game as long)
  JD.dadosPara = n => (n === 2 ? JD.DADOS2 : JD.DADOS);
  JD.MAX = 4;                        // (players at a table, at most)
  JD.APOSTAS = [0.1, 0.2, 0.3, 0.5, 1]; // (the stakes one may put in, in the people's coins)
  // (the clock of a game is the world's — seconds of the world, never frames: a day is G.DAY_LEN, 200 s, and the body lives it at
  // Space.TIME, 0,27 — a second of the world is nearly four of the body's. So a game's beats are short in the world's seconds and
  // read right in the body's: the cups shaken in about two of its seconds, a customer's bid in two or three, the cups up in five)
  JD.SACODE = 0.6;                   // (the cups shaken and slammed)
  JD.PENSA = [0.35, 0.45];           // (the seconds a customer thinks before the bid: the least, and the most added — the cautious longer)
  JD.ESPERA = 18;                    // (the table waits for the body's bid this long before it gives up on it)
  JD.LONGE = 6;                      // (… and for one of the world who is away from the table a moment — the stage, a brawl)
  JD.SEGURA = 0.45;                  // (the breath before the cups come up)
  JD.REVELA = [1, 0.32];             // (the cups up: the seconds, and a share more for each one)
  JD.FIM = 1.5;                      // (the end: the pot to the winner, the words, before the table is let go)
  JD.CONVITE = 3;                    // (a game a customer calls at the body's table: the seconds to join it)
  JD.CONVITE_CORPO = 30;             // (a game the body calls: the seconds before it is let go, not begun)
  JD.OLHA = 8;                       // (a table looks for a game once in this many seconds)
  JD.P = 0.55; JD.P_TORNEIO = 0.8;   // (the share of the looks a game begins: a night, a tournament night)
  JD.GANA = 0.45; JD.ENTRA = 0.3;    // (who calls a game, who joins one: the will, by the índole and the drink)
  JD.HONESTO = 0.35;                 // (honest past this: never cheats)
  JD.FORA_CORPO = 3;                 // (the seconds the body may be off its seat before it gives the game up)
  JD.MADEIRA = ((G.Itens && G.Itens.feitoDe('dados.madeira')) || [{ n: 0.05 }])[0].n; // (the wood of a set of dice of wood: the catalog's)
  JD.SETS = { taberna: 1, taverna: 2, hospedaria: 3 }; // (the sets the house keeps, by its step)
  JD.SET_N = 8;                      // (the dice of a set: two for each one at a table of four)
  JD.KEYS = ['dados.osso', 'dados.madeira'];

  // ------------------------------ the rule (pure) ------------------------------
  // (several integers mixed into one of 24 bits — the G.hash keeps them exact below 2^24 —; then the G.hash of it: D-669)
  R.mix = function () { let h = 0x2545f491; for (let i = 0; i < arguments.length; i++) { h = Math.imul(h ^ (arguments[i] | 0), 0x9e3779b1); h ^= h >>> 15; } h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; return (h >>> 8) & 0xffffff; };
  R.h = function () { return G.hash(R.mix.apply(null, arguments)); };
  // the face of a die: the game, the round, the player, the die
  R.face = (seed, r, id, i) => Math.min(6, 1 + Math.floor(R.h(seed, r, id, i, 11) * 6));
  R.ativos = g => g.quem.filter(id => !g.fora[id] && (g.n[id] | 0) > 0);
  R.nDados = g => R.ativos(g).reduce((s, id) => s + (g.n[id] | 0), 0);
  R.faixa = g => { const N = R.nDados(g); return [N, 6 * N]; };
  R.rolar = function (g) { g.faces = {}; for (const id of R.ativos(g)) { const L = []; for (let i = 0; i < (g.n[id] | 0); i++) L.push(R.face(g.seed, g.r, id, i)); g.faces[id] = L; } return g.faces; };
  R.soma = L => (L || []).reduce((s, x) => s + x, 0);
  // the order of the bids this round: the players with dice, from the one the cup chose at the start (the hash of the game: who calls
  // it has no better seat), turned one seat a round
  R.ini = g => Math.floor(R.h(g.seed, 3) * 1000);
  R.ordem = function (g) { const L = R.ativos(g); if (!L.length) return []; const k = (g.r - 1 + R.ini(g)) % L.length; return L.slice(k).concat(L.slice(0, k)); };
  R.dito = (g, n) => g.pal.some(p => p[1] === n);
  R.livre = (g, n) => { const [a, b] = R.faixa(g); return Number.isInteger(n) && n >= a && n <= b && !R.dito(g, n); };
  R.livres = g => { const [a, b] = R.faixa(g); const o = []; for (let n = a; n <= b; n++) if (!R.dito(g, n)) o.push(n); return o; };
  // the free number nearest x — a tie toward the sum one expects
  R.perto = function (g, x, toward) { const [a, b] = R.faixa(g); const c = Math.max(a, Math.min(b, Math.round(x))); if (R.livre(g, c)) return c; const up = toward === undefined ? x >= c : toward > c;
    for (let d = 1; d <= b - a; d++) { const p = up ? [c + d, c - d] : [c - d, c + d]; for (const n of p) if (R.livre(g, n)) return n; } return c; };
  // the sum one expects, from one's own dice and what the others said: each die one does not see a 3,5 — moved toward what the
  // other's bid says of his hand by how much one reads the others (ler, 0..1: the attentive and open, sober)
  R.estima = function (g, id, tr) {
    const mine = R.soma(g.faces[id]); const N = R.nDados(g); let E = mine; const w = 0.15 + 0.6 * (tr ? tr.ler : 0.5);
    for (const j of R.ativos(g)) { if (j === id) continue; const nj = g.n[j] | 0; const base = 3.5 * nj; const p = g.pal.find(q => q[0] === j);
      if (!p) { E += base; continue; } const said = Math.max(nj, Math.min(6 * nj, p[1] - 3.5 * (N - nj))); E += base + w * (said - base); }
    return E;
  };
  // the spread of what one does not see (the dice of the others)
  R.desvio = (g, id) => Math.sqrt(Math.max(0, R.nDados(g) - (g.n[id] | 0)) * 35 / 12);
  // a customer's bid: near what one expects — the cautious right on it, the bold shifted by a bluff of his own (the hash says which
  // way) — and a number nobody said
  R.palpite = function (g, id, tr) {
    const E0 = R.estima(g, id, tr); const ous = tr ? tr.ous : 0.5; const h = R.h(g.seed, g.r, id, 77) * 2 - 1;
    const blef = h * ous * ous * R.desvio(g, id) * 1.1; return R.perto(g, E0 + blef, E0);
  };
  // the cups up: the sum, the one who hit it right on, the farthest — all of the players with dice equally far is a draw: nobody
  // loses (the round again)
  R.resolve = function (g, faces) {
    const F = faces || g.faces; const L = R.ativos(g); let total = 0; for (const id of L) total += R.soma(F[id]);
    const dist = {}; let cravou = 0, max = -1;
    for (const id of L) { const p = g.pal.find(q => q[0] === id); const d = p ? Math.abs(p[1] - total) : 999; dist[id] = d; if (d === 0) cravou = id; if (d > max) max = d; }
    // (who hit the sum right on makes each of the others lose a die; nobody did: the farthest lose one — all of them equally far, nobody)
    let queimou = cravou ? L.filter(id => id !== cravou) : L.filter(id => dist[id] === max); if (!cravou && queimou.length === L.length) queimou = [];
    return { total, cravou, dist, queimou };
  };
  // what the result does: a die less for the farthest (out with none left); the winner — who hit it, or the last one with dice
  R.aplica = function (g, res) {
    for (const id of res.queimou) { g.n[id] = Math.max(0, (g.n[id] | 0) - 1); if (!g.n[id]) g.fora[id] = 'queimou'; }
    const L = R.ativos(g); return L.length === 1 ? L[0] : L.length === 0 ? -1 : 0;
  };
  // the quick hand: the one turn of one of one's own dice, as the cups come up, that serves one's bid best — to hit the sum right
  // on, or else not to be the farthest; null when no turn serves
  R.virar = function (g, id) {
    const p = g.pal.find(q => q[0] === id); const F = g.faces[id]; if (!p || !F || !F.length) return null;
    const res0 = R.resolve(g); if (res0.cravou === id) return null; let best = null;
    for (let i = 0; i < F.length; i++) for (let f = 1; f <= 6; f++) {
      if (f === F[i]) continue; const total2 = res0.total - F[i] + f; const kind = total2 === p[1] ? 'crava' : null;
      let ok = kind;
      if (!ok && res0.queimou.includes(id)) { const F2 = Object.assign({}, g.faces, { [id]: F.map((x, k) => (k === i ? f : x)) }); const r2_ = R.resolve(g, F2); if (!r2_.queimou.includes(id) && !(r2_.cravou && r2_.cravou !== id)) ok = 'salva'; }
      if (!ok) continue; const c = { i, de: F[i], para: f, total2, kind: ok, d: Math.abs(f - F[i]) };
      if (!best || (c.kind === 'crava' && best.kind !== 'crava') || (c.kind === best.kind && c.d < best.d)) best = c;
    }
    return best;
  };
  // who sees the quick hand: each other one at the table by one's attention, the cheat's own deftness against it — by the hash
  R.pVisto = (trO, trC) => (0.12 + 0.55 * (trO ? trO.aten : 0.5)) * (1 - 0.5 * (trC ? trC.habil : 0.5));
  R.visto = (g, c, o, trO, trC) => R.h(g.seed, g.r, c, o, 991) < R.pVisto(trO, trC);
  R.risco = function (g, c, trs) { let q = 1; for (const o of R.ativos(g)) if (o !== c) q *= 1 - R.pVisto(trs[o], trs[c]); return 1 - q; };
  // a customer's will to cheat this round: dishonest, a turn that serves, the risk weighed by the caution — by the hash
  R.quer = function (g, c, tr, trs, t) {
    if (!t || !tr || tr.hon >= JD.HONESTO) return false;
    const dis = (JD.HONESTO - tr.hon) / JD.HONESTO; const gain = t.kind === 'crava' ? 1 : 0.55;
    return R.h(g.seed, g.r, c, 313) < gain * dis * (0.45 + 0.55 * tr.ous) * (1 - R.risco(g, c, trs) * (1 - tr.ous));
  };
  // a whole game, pure, for the proofs (the thousand games): players [{ id, tr }], the same steps the world takes — the bids by the
  // índole, the cheat and who sees it, the dice lost — and the winner. → { venc, rodadas, trap: [{ id, pego, kind }], hist }
  R.simula = function (seed, players, o) {
    o = o || {}; const g = { seed, r: 0, quem: players.map(p => p.id), n: {}, fora: {}, faces: {}, pal: [] }; const trs = {};
    for (const p of players) { g.n[p.id] = o.dados || JD.dadosPara(players.length); trs[p.id] = p.tr; }
    const trap = [], hist = []; let venc = 0;
    while (!venc && g.r < 60) {
      g.r++; R.rolar(g); g.pal = [];
      for (const id of R.ordem(g)) g.pal.push([id, R.palpite(g, id, trs[id])]);
      const res = R.cheat(g, trs, trap); hist.push({ r: g.r, total: res.total, cravou: res.cravou, queimou: res.queimou.slice() }); venc = R.aplica(g, res);
    }
    return { venc, rodadas: g.r, trap, hist };
  };
  // the cups up with the quick hand: the first in the bids' order who wants to cheat and has a turn that serves turns a die; seen,
  // the die is back, and one is out; unseen, it stays. → the result, with what happened (t: { id, i, de, para, kind, visto, pego })
  // (armed: the one whose hands asked for it — the body —, first; nunca: who never cheats of his own will — the body: the world never
  // decides for it)
  R.cheat = function (g, trs, log, armed, nunca) {
    let t = null;
    if (armed && !g.fora[armed]) { const x = R.virar(g, armed); if (x) t = Object.assign({ id: armed }, x); }
    if (!t) for (const id of R.ordem(g)) { if (id === armed || (nunca && nunca.has(id))) continue; const x = R.virar(g, id); if (x && R.quer(g, id, trs[id], trs, x)) { t = Object.assign({ id }, x); break; } }
    if (!t) return R.resolve(g);
    t.visto = R.ativos(g).filter(o => o !== t.id && R.visto(g, t.id, o, trs[o], trs[t.id])); t.pego = t.visto.length > 0;
    if (log) log.push({ id: t.id, pego: t.pego, kind: t.kind });
    if (t.pego) { g.fora[t.id] = 'pego'; g.n[t.id] = 0; const res = R.resolve(g); res.trap = t; return res; }
    g.faces[t.id] = g.faces[t.id].map((x, k) => (k === t.i ? t.para : x)); const res = R.resolve(g); res.trap = t; return res;
  };

  // ------------------------------ who a person is at the table (pure readings of the índole and the drink) ------------------------------
  const ax = (v, k) => (G.Indole ? G.Indole.ax(v, k) : 50) / 99;
  const fac = (v, k) => (G.Indole && G.Indole.faceta ? G.Indole.faceta(v, k) : 0.5);
  // (the drink in one, 0..1: the degree T2 reads of the blood — G.Ebrio.grau: merry, drunk, reeling, out —, one alcohol for the whole
  // world, D-830; the reeling one is all drink)
  JD.ebrio = v => (G.Ebrio && G.Ebrio.grau ? Math.min(1, G.Ebrio.grau(v) / 3) : 0);
  JD.tracos = function (v) {
    const eb = JD.ebrio(v);
    const ous = Math.max(0, Math.min(1, 0.45 * (1 - ax(v, 'neu')) + 0.3 * ax(v, 'ext') + 0.25 * (1 - ax(v, 'con')) + 0.15 * eb));
    return { ous, cau: 1 - ous,
      ler: (0.45 * ax(v, 'abe') + 0.35 * ax(v, 'con') + 0.2 * (1 - ax(v, 'neu'))) * (1 - 0.6 * eb),
      aten: (0.5 * ax(v, 'con') + 0.3 * fac(v, 'desconfiado') + 0.2 * ax(v, 'abe')) * (1 - 0.7 * eb),
      hon: ax(v, 'hon'), habil: (1 - eb) * (0.4 + 0.6 * (1 - ax(v, 'neu'))),
      gana: 0.4 * ous + 0.35 * ax(v, 'ext') + 0.25 * (1 - ax(v, 'con')) + 0.15 * eb };
  };
  // the coins one has (the house's pot, or the purse) and whether the people uses coin
  const purse = v => (v ? D.get(E.coinRef(v), 'moedas') : 0);
  const coinOf = b => !!b && E.coinage(G.Village.facOfSet(b.set));
  // (how much v likes o, −100..100: 22b's reading — 0 for one v has no tie with)
  const afeto = (v, o) => { const s = G.Lacos && G.Lacos.sente ? G.Lacos.sente(v, o) : null; return s ? s.afeto || 0 : 0; };
  // the stake one would call a game at: the bold higher, never more than a share of what one has (the bold a larger one)
  JD.apostaDe = function (v, b, tr) {
    if (!coinOf(b)) return 0; const t = tr || JD.tracos(v); const p = purse(v);
    let i = Math.min(JD.APOSTAS.length - 1, Math.floor(t.ous * 4.4)); while (i > 0 && JD.APOSTAS[i] > p * (0.12 + 0.38 * t.ous)) i--;
    return JD.APOSTAS[i] <= p + EPS ? JD.APOSTAS[i] : null;
  };
  // whether one joins a game at a stake: the will, less the share of one's coins it is (the cautious feel it more), the friends at it
  // and the night of a tournament more; with the words of the no. → { sim, por }
  JD.entra = function (v, b, s, extra) {
    const t = JD.tracos(v); const p = coinOf(b) ? purse(v) : Infinity;
    if (s > p + EPS) return { sim: false, por: 'sem dinheiro' };
    const frac = s > 0 ? s / Math.max(p, 0.01) : 0; const w = t.gana + (extra || 0) - frac * (1.7 - t.ous);
    if (w >= JD.ENTRA) return { sim: true, por: '' };
    return { sim: false, por: frac * (1.7 - t.ous) > 0.25 ? 'alto demais' : 'sem vontade' };
  };

  // ------------------------------ the dice of the house and of who plays ------------------------------
  // (the house's sets — on its shelf, on a table with a game, lying on a table — and their whereabouts: G.JogosCasa, the J front, D-931)
  const JC = () => G.JogosCasa;
  const shelf = b => 'b:' + b.id;
  JD.casa = function (b) {
    const out = { 'dados.osso': 0, 'dados.madeira': 0, usados: 0, livres: 0 }; if (!b || !JC()) return out;
    const c = JC().casa(b, 'dados'); for (const k of JD.KEYS) out[k] = c.por[k] || 0; out.usados = c.naMesa.length; out.livres = c.livres; return out;
  };
  // the set of a game (D-932): the own one of who calls it — the body's bag; a customer's bag, or his house in the town of the tavern
  // (G.JogosCasa.proprio) —, then the own one of who joins (quem, in their order), else one of the house's free (lent to the table: the
  // rent is the host's) → { de, ref, k, dono, lar, daCasa } or null
  function setFor(b, v, quem) {
    if (!JC()) return null;
    for (const p of v ? [v] : quem || []) { const o = JC().proprio(p, 'dados', b); if (o) return o; }
    return JC().daCasa(b, 'dados');
  }
  JD.setFor = (b, v, quem) => (b ? setFor(b, v, quem) : null);
  // the house's sets, made by its keeper the first time the day opens with fewer than it keeps (D-852): of the carcass's bone where
  // the people has had bone (slaughtered, hunted, offered — G.Origem: nothing of the store, as the knucklebones), else of the wood
  // on the shelf (the house's firewood, bought: what a set of wood takes comes out of it first). With neither, none — and no game.
  // (counted with the ones on the tables: a set lent is still the house's, never one to make again — D-931)
  function houseDice(b) {
    const S = S_(); const day = G.mod('jogodados.casa'); const rec = day && day.d === S.day ? day : G.mod('jogodados.casa', { d: S.day, b: {} });
    const want = JD.SETS[b.esc] || 1; const c0 = JD.casa(b); let have = c0['dados.osso'] + c0['dados.madeira']; if (have >= want) return;
    // (short of sets: a try now, and again a minute of the world later — the wood may come to the shelf)
    if (Number.isFinite(rec.b[b.id]) && S.clock - rec.b[b.id] < 60) return; rec.b[b.id] = r1(S.clock);
    const k0 = T() && T().keeperOf ? T().keeperOf(b) : null; if (!k0) return;
    while (have < want) { if (!faz(b, k0)) break; have++; }
  }
  // one set made on the shelf by the keeper's hands — the house's, and the one he sells (G.JogosCasa.comprar) → its key, or null
  function faz(b, k0) {
    const fid = G.Village.facOfSet(b.set); const arts = G.Inv && G.Inv.artsOf ? G.Inv.artsOf(k0) : null; let r = null;
    if (G.Origem && G.Origem.matOK(fid, 'osso', arts)) r = D.make(shelf(b), 'dados.osso', 1, { code: 'dados', by: k0.id });
    else if (D.free(shelf(b), 'wood') + EPS >= JD.MADEIRA && D.use(shelf(b), 'wood', JD.MADEIRA, { code: 'dados', by: k0.id }).ok) { r = D.make(shelf(b), 'dados.madeira', 1, { code: 'dados', by: k0.id }); if (!r.ok) D.make(shelf(b), 'wood', JD.MADEIRA, { code: 'desfeito', by: k0.id }); }
    return r && r.ok && r.e ? r.e[5] : null;
  }
  JD.faz = (b, k0) => (G.inSim && b && k0 ? faz(b, k0) : null);
  // (what the keeper would make now — only read: G.JogosCasa.podeComprar)
  JD.qual = function (b) {
    const k0 = b && T() && T().keeperOf ? T().keeperOf(b) : null; if (!k0) return null; const fid = G.Village.facOfSet(b.set); const arts = G.Inv && G.Inv.artsOf ? G.Inv.artsOf(k0) : null;
    return G.Origem && G.Origem.matOK(fid, 'osso', arts) ? 'dados.osso' : D.free(shelf(b), 'wood') + EPS >= JD.MADEIRA ? 'dados.madeira' : null;
  };

  // ------------------------------ the pot: the ledger's holder 'j:<op>' ------------------------------
  // (the coins of the stakes, on the table of the game, until the winner takes them — or they go back, the game let go)
  D.addKind('j', {
    obj: id => { const op = A.get(id); return op && (op.def === 'jogo-dados' || op.def === 'torneio-dados') && live(op) ? op : null; },
    get: (op, k) => (k === 'moedas' ? op.data.pote || 0 : 0),
    room: (op, k) => (k === 'moedas' ? Infinity : 0),
    take: (op, k, n) => { op.data.pote = r2((op.data.pote || 0) - n); return { k, n }; },
    put: (op, rec) => { op.data.pote = r2((op.data.pote || 0) + rec.n); },
    list: op => (op.data.pote > EPS ? { moedas: op.data.pote } : {}),
    owner: op => ({ fac: op.fac, bld: op.at }),
    all: () => A.all().filter(op => (op.def === 'jogo-dados' || op.def === 'torneio-dados') && live(op)),
  });
  const pot = op => 'j:' + op.id;

  // ------------------------------ the games of the world ------------------------------
  // (the games alive and who plays in each — asked by every customer's step: an index made once a moment of the world, and again
  // when a game changes who plays in it)
  let ix = null, ixS = null, ixT = -1; const dirty = () => { ix = null; };
  G.worldHooks.push(dirty);
  function index() { const S = S_(); if (ix && ixS === S && ixT === S.clock) return ix; ix = { games: [], by: new Map() };
    for (const op of A.all()) if (op.def === 'jogo-dados' && live(op)) { ix.games.push(op); for (const id of op.data.quem) if (!op.data.fora[id]) ix.by.set(id, op); }
    ixS = S; ixT = S.clock; return ix; }
  const games = () => index().games;
  JD.jogos = () => games().slice();
  const tavOf = op => { const b = S_().buildings.get(op.at); return b && b.type === 'taverna' && b.built ? b : null; };
  const dayOf = b => (b && T() ? T().dia(b) : null);
  const isBody = v => A.isBody(v);
  // (where one sits at a tavern's tables now — the table's group — or null: the customers by their errand, the body by its seat)
  function seatOf(v, b, top) {
    const m = top && top.data.mesa && top.data.mesa[v.id]; if (!m || !m.g) return null;
    if (m.corpo) return isBody(v) && v.inside === b.id && m.seat ? String(m.g) : null;
    if (m.body) return null;
    const t = v.task; return t && t.type === 'tavern' && t.op === top.id && t.st >= 2 ? String(m.g) : null;
  }
  // (one of the table who may be asked to play now: seated, the hands free of the house's work, awake, not in a brawl, not dancing nor
  // at the stage, grown enough, not in the bones' game of the table, not in another game)
  function free(v, b, top, g) {
    if (!v || v.age < 14 || seatOf(v, b, top) !== g) return false; const m = top.data.mesa[v.id];
    if (m.zz || m.st === 6 || m.st === 9 || m.st === 1) return false;
    if (T().brawling && T().brawling(v)) return false;
    // (one about to doze at the table — worn out, or reeling with drink (G.Ebrio: the tavern's own doze, T2) — does not start a game)
    if (v.energy < (T().SONO || 26) + 3 || (G.Ebrio && G.Ebrio.grau(v) >= 3)) return false;
    const j = top.data.jogo && top.data.jogo[g]; if (j && j.quem.includes(v.id)) return false;
    return !gameOf(v);
  }
  // the game one plays in (alive), or null
  function gameOf(v) { return v ? index().by.get(v.id) || null : null; }
  JD.gameOf = gameOf;
  // (the god's body still in the game — with dice, the game not over —: a game of the body's; and one of the body's at all, whoever left it)
  const bodyId = () => { const S = S_(); return S && S.avatar ? S.avatar.id : 0; };
  const bodyIn = d => { const me = bodyId(); return !!me && d.quem.includes(me) && !d.fora[me] && d.fase !== 'fim'; };
  const ofBody = d => { const me = bodyId(); return !!me && d.quem.includes(me); };
  // who plays with the god's body now: held at the table to the game's end — nothing of the evening takes one from it, only what cannot
  // wait (the fire, the war at the door, the panic, the keeper putting a brawler out, the faint): G.Taverna.segura, D-962. Only read
  JD.prendeCorpo = function (v) { if (!v || !bodyId() || isBody(v)) return false; const op = gameOf(v); return !!op && bodyIn(op.data); };
  // the game at a table — the table's group (the interiors') or one of its pieces —, or null
  function atTable(b, g) { const id = b && (b.id || b); const key = String(g); for (const op of games()) if (op.at === id && op.data.g === key) return op; return null; }

  // the door for who draws (T6, T7, T8; only read) — the game at a table now, or null. In T7's form (D-884): dados, the faces on the
  // table (the cups up: every die of the round as the world threw it; the cups down: as many dice, their faces unknown — 0 —, never the
  // secret ones: what the 3D shows nobody could read off it), copo (the cup of the dice is there), mat ('osso' or 'madeira'); and the
  // game's own: the phase and its clock, who plays and the dice each has (nDe), the faces of each once up (facesDe), the bids, the sum
  JD.atMesa = function (b, mesa) {
    const B = b && b.id ? b : S_().buildings.get(b); if (!B || mesa === undefined || mesa === null) return null;
    let g = mesa; if (typeof mesa === 'number' && G.Interiors && G.Interiors.groupOf && !atTable(B, g)) g = G.Interiors.groupOf(B, mesa);
    const op = atTable(B, g); if (!op) return null; const d = op.data; const up = (d.fase === 'revela' || d.fase === 'fim') && d.r > 0;
    const flat = []; if (up) { for (const id of d.quem) for (const f of (d.faces[id] || [])) flat.push(f); } else { const N = d.fase === 'convite' ? 2 : R.nDados(d); for (let i = 0; i < N; i++) flat.push(0); }
    return { dados: flat.slice(0, 6), copo: 1, mat: d.set ? d.set.k.split('.')[1] : 'osso',
      op: op.id, fase: d.fase, t: d.t, ate: d.ate, rodada: d.r, quem: d.quem.slice(), nDe: Object.assign({}, d.n), fora: Object.assign({}, d.fora),
      facesDe: up ? JSON.parse(JSON.stringify(d.faces || {})) : null, palpites: d.pal.map(p => p.slice()), total: up && d.res ? d.res.total : null,
      set: d.set ? d.set.k : null, pote: d.pote || 0, moeda: !!d.moeda, vez: d.fase === 'palpite' ? d.ordem[d.vez] || 0 : 0, venc: d.venc || 0, torneio: d.torneio || 0 };
  };
  // the act of a player (the tavern's step asks it for v.act): the quick hand at the moment of the cups, else the game — only of one
  // still with dice, while the game goes on
  // (the quick hand unseen, a moment — the slide of the hand; seen, the uproar of being caught: T8's sounds, D-890)
  JD.TRAP_T = 0.5; JD.PEGA_T = 0.8;
  JD.ato = function (v) {
    if (!v) return null; const S = S_();
    for (const op of games()) { const t = op.data.fase === 'revela' && op.data.res && op.data.res.trap; if (t && t.id === v.id) { const a = S.clock - op.data.t; if (t.pego && a < JD.PEGA_T) return 'trapaca-pega'; if (!t.pego && a < JD.TRAP_T) return 'trapaca'; } }
    const op = gameOf(v); if (!op) return null; const d = op.data; if (d.fase === 'fim' || d.fase === 'convite') return null;
    return 'jogo-dados';
  };
  JD.joga = v => !!JD.ato(v);
  // (what the body of a player does now, for the 3D's choice of a clip: the cup shaken, the bid, the waiting, the cups up, the end)
  JD.gesto = function (v) {
    const op = v && gameOf(v); if (!op) return null; const d = op.data;
    if (d.fase === 'sacode') return 'sacode'; if (d.fase === 'palpite') return d.ordem[d.vez] === v.id ? 'palpite' : 'espera'; if (d.fase === 'segura') return 'espera';
    if (d.fase === 'revela') return d.res && d.res.cravou === v.id ? 'cravou' : d.res && d.res.queimou.includes(v.id) ? 'queimou' : 'revela'; return null;
  };
  // the kit's dice (inventario.js asks it): the real set of the game one plays in — the house's or the body's own —, else null
  JD.dadosDe = v => { if (!v) return null; const op = gameOf(v) || games().find(o => o.data.res && o.data.res.trap && o.data.res.trap.id === v.id && o.data.fase === 'revela'); return op && op.data.set ? op.data.set.k : null; };

  // ------------------------------ a game begins ------------------------------
  // (a new game at a table: who calls it, the stake, the set; phase 'convite' — a lobby — or straight to the cups)
  // (the set goes to the table as the game is called — out of the house's shelf, or of the bag or the house of whose it is: the J front's
  // door, G.JogosCasa.empresta, by the ledger —, and back at its end, whatever end: close. d.set: { ref — the table's place of the ledger,
  // 'n:' —, k, n — its record —, de — where it goes back —, dono, casa — the house's —, alug — the rent paid })
  function begin(b, top, g, host, aposta, src, lobby, torneio) {
    const S = S_(); const f = G.Fac.get(G.Village.facOfSet(b.set));
    const op = A.start('jogo-dados', { at: b.id, fac: f ? f.id : 0, set: b.set, by: host.id, why: 'à mesa da taverna', data: {
      v: 1, top: top.id, g, host: host.id, quem: [host.id], n: {}, fora: {}, pago: {}, pal: [], faces: {}, ordem: [], vez: 0, r: 0,
      aposta: coinOf(b) ? aposta : 0, moeda: coinOf(b) ? 1 : 0, pote: 0, set: null, fase: 'convite', t: r1(S.clock), ate: r1(S.clock + (lobby || 0)), res: null, hist: [], venc: 0, convite: {}, torneio: torneio || 0, tally: {} } });
    op.data.seed = op.id; op.data.n[host.id] = JD.DADOS; dirty();
    const L = src && JC() ? JC().empresta({ b, jogo: op.id, tipo: 'dados', g, s: src, quem: src.dono || host.id }) : null;
    if (!L) { A.end(op, 'cancel', 'sem dados na mesa'); dirty(); return null; }
    op.data.set = { ref: 'n:' + L.id, k: L.k, n: L.id, de: L.ref, dono: L.dono, casa: src.daCasa ? 1 : 0, alug: 0 };
    return op;
  }
  // (one more at the table of a game being called)
  function join(op, v) { const d = op.data; if (d.quem.includes(v.id) || d.quem.length >= JD.MAX) return false; d.quem.push(v.id); d.n[v.id] = JD.DADOS; d.convite[v.id] = 'sim'; dirty(); return true; }
  // the stakes into the pot and the first round (who cannot pay now is let off the table's game); fewer than two: let go
  function start(op) {
    const S = S_(); const d = op.data; const b = tavOf(op); if (!b) return close(op, 'a taverna caiu');
    // (the rent of the house's set, D-934: the host's — who calls the game pays the table, unless he is the house's customer tonight —,
    // before the stakes; who cannot pay it lets the game go)
    if (d.set && d.set.casa && !d.set.alug && JC()) { const h = S.villagers.get(d.host); const al = h ? JC().aluguel(b, h) : { n: 0 };
      if (al.n > EPS) { const r = h && purse(h) + EPS >= al.n + (d.aposta || 0) ? JC().cobra(b, h, [d.set.n], al.n) : { ok: false }; if (!r.ok) { d.convite[d.host] = 'nao:sem o aluguel'; return close(op, 'sem o aluguel'); } d.set.alug = r.n; } }
    if (d.aposta > 0) for (const id of d.quem.slice()) { const v = S.villagers.get(id); const ref = v ? E.coinRef(v) : null;
      const r = ref ? D.move(ref, pot(op), 'moedas', d.aposta, { op: op.id, code: 'dados-aposta', by: id }) : { ok: false };
      if (r.ok) d.pago[id] = [ref, d.aposta]; else { d.quem.splice(d.quem.indexOf(id), 1); delete d.n[id]; d.convite[id] = 'nao:sem dinheiro'; dirty(); } }
    if (d.quem.length < 2) return close(op, 'ninguém para jogar');
    for (const id of d.quem) d.n[id] = JD.dadosPara(d.quem.length); // (two each — three when only two play)
    const P = G.Possess; for (const id of d.quem) { const v = S.villagers.get(id); if (v && isBody(v) && P && P.dealt) for (const o of d.quem) if (o !== id) P.dealt({ to: o }); }
    tally(d, 'partidas'); round(op);
  }
  function round(op) { const S = S_(); const d = op.data; d.r++; d.pal = []; d.vez = 0; d.res = null; d.trap = 0; R.rolar(d); d.ordem = R.ordem(d); phase(op, 'sacode', JD.SACODE); void S; }
  function phase(op, f, dur) { const S = S_(); op.data.fase = f; op.data.t = r1(S.clock); op.data.ate = r1(S.clock + (dur || 0)); dirty(); }
  function tally(d, k) { d.tally[k] = (d.tally[k] || 0) + 1; }
  // (the seconds a customer thinks over the bid: the cautious longer — by the hash of the round and the person)
  const think = (d, v) => JD.PENSA[0] + JD.PENSA[1] * R.h(d.seed, d.r, v.id, 41) + 0.25 * JD.tracos(v).cau;

  // the tables look for a game (once a second of the world, in the skip too): at a table of two or more who may play, once in
  // JD.OLHA seconds, by the hash of the tavern's day, the table and the moment, the one most for it — the will, the índole and the
  // drink — calls it at his stake, and the others join by theirs; with the body seated at that table, a moment to join it (JD.CONVITE).
  // Only with a set of dice free in the house
  // (the moment each table last looked, the world's — in S.mod, with the save: a load is no second look; let go each day)
  const looks = () => { const S = S_(); const L = G.mod('jogodados.olha'); return L && L.d === S.day ? L : G.mod('jogodados.olha', { d: S.day, k: {} }); };
  // (why the looks of the tables found no game — for the proofs: counted, never read by the world; again with every world)
  JD.olhares = {}; G.worldHooks.push(() => { JD.olhares = {}; });
  const why = k => { JD.olhares[k] = (JD.olhares[k] || 0) + 1; };
  A.hooks.tick.push(function () {
    const S = S_(); const Ta = T(); if (!Ta || !Ta.dia) return;
    for (const top of A.all().filter(op => op.def === 'taverna' && live(op))) {
      const b = S.buildings.get(top.at); if (!b || b.type !== 'taverna' || !b.built || !Ta.aberta(b) || top.data.fecha) continue;
      houseDice(b);
      const groups = new Map();
      for (const id of Object.keys(top.data.mesa)) { const v = S.villagers.get(+id); if (!v) continue; const g = seatOf(v, b, top); if (!g) continue; let L = groups.get(g); if (!L) groups.set(g, L = []); L.push(v); }
      const tor = torneioOf(b);
      for (const [g, L] of [...groups].sort((a, c) => (a[0] < c[0] ? -1 : a[0] > c[0] ? 1 : 0))) {
        if (L.length < 2 || atTable(b, g)) continue;
        const k = Math.floor(S.clock / JD.OLHA); const jk = looks(); const lk = top.id + ':' + g; if (jk.k[lk] === k) continue; jk.k[lk] = k; why('olhou');
        if (top.data.jogo && top.data.jogo[g]) { why('ossinhos'); continue; }
        if (R.h(top.id, R.mix(...String(g).split('').map(c => c.charCodeAt(0))), k, 5) >= (tor ? JD.P_TORNEIO : JD.P)) { why('agora-nao'); continue; }
        const cands = L.filter(v => !isBody(v) && free(v, b, top, g)).sort((a, c) => a.id - c.id); if (cands.length < 2) { why('poucos-livres'); continue; }
        const bonus = tor ? 0.12 : 0;
        let host = null, hs = JD.GANA; for (const v of cands) { const s = JD.tracos(v).gana + bonus; if (s > hs) { hs = s; host = v; } } if (!host) { why('sem-vontade'); continue; }
        const st = JD.apostaDe(host, b); if (st === null) { why('sem-dinheiro'); continue; }
        // (who joins, by his own will at that stake — asked before the game is made: no game with nobody but who called it)
        const ans = cands.filter(v => v !== host).map(v => [v, JD.entra(v, b, st, bonus + Math.max(0, Math.min(0.1, afeto(v, host) / 300)))]);
        if (!ans.some(x => x[1].sim)) { why('ninguem-quis'); continue; }
        // (the set of the game, D-932: the host's own, a joiner's own, else one of the house's free; with all the house's on other tables,
        // the keen host buys his own of the keeper — D-936 —; none: the table waits for one to come back, or does something else, D-933)
        let set = setFor(b, null, [host].concat(ans.filter(x => x[1].sim).map(x => x[0])));
        if (!set && JC() && JC().querComprar(host, b, 'dados', hs) && JC().comprar(host, 'dados', b).ok) { why('comprou'); set = setFor(b, null, [host]); }
        if (!set) { why('sem-dados'); continue; }
        // (the rent of the house's set is the host's, unless he is the house's customer tonight: who cannot pay it with the stake calls none)
        if (set.daCasa && JC() && purse(host) + EPS < JC().aluguel(b, host).n + st) { why('sem-aluguel'); continue; }
        const op = begin(b, top, g, host, st, set, 0, tor ? tor.id : 0); if (!op) { why('sem-dados'); continue; } why('comecou');
        for (const [v, a] of ans) { if (a.sim) join(op, v); else op.data.convite[v.id] = 'nao:' + a.por; }
        // (the body seated at this table, free: a moment to join the game called)
        const me = G.Possess && G.Possess.body ? G.Possess.body() : null;
        if (me && seatOf(me, b, top) === g && !gameOf(me) && op.data.quem.length < JD.MAX) { phase(op, 'convite', JD.CONVITE); if (!(G.Skip && G.Skip.on) && G.Talk) G.Talk.say(host, frase('chama', host, op.data, b), { dur: 3 }); }
        else start(op);
      }
    }
    torneios();
  });

  // ------------------------------ a game's step (once a second of the world) ------------------------------
  // (still at the table of the game: a customer by the errand, seated there — the stage and a brawl a moment away from it —; the body
  // on its seat there, or off it a moment)
  function here(op, v) {
    const S = S_(); const d = op.data; const b = tavOf(op); const top = b && dayOf(b); if (!b || !top || top.id !== d.top || !v) return 'longe';
    const m = top.data.mesa[v.id]; if (!m) return 'saiu';
    if (m.corpo) { if (isBody(v) && v.inside === b.id && m.seat && String(m.g) === d.g) { d.off && delete d.off[v.id]; return 'sim'; }
      const off = d.off || (d.off = {}); if (!off[v.id]) off[v.id] = r1(S.clock); return S.clock - off[v.id] > JD.FORA_CORPO ? 'saiu' : 'longe'; }
    if (String(m.g) !== d.g) return 'saiu'; if (m.zz) return 'dormiu';
    const t = v.task; if (!t || t.type !== 'tavern' || t.op !== top.id) return 'saiu';
    if (t.st === 6 || t.st === 9 || (T().brawling && T().brawling(v))) return 'longe';
    return 'sim';
  }
  function tick(op) {
    const S = S_(); const d = op.data; const b = tavOf(op); const top = b && dayOf(b);
    if (!b) return close(op, 'a taverna caiu');
    // (the closing called: the games end — but the god's body's, the last one the keeper waits for, D-963)
    if (!top || top.id !== d.top || !T().aberta(b) || (top.data.fecha && !bodyIn(d))) return close(op, 'a taverna fechou');
    // (the set gone from the table — the god's hand took it —: no dice, no game; D-937)
    if (d.set && d.set.n && !(D.get(d.set.ref, d.set.k) >= 1 - EPS)) return close(op, 'o jogo sumiu da mesa');
    // (who left the table, died, fell asleep over it: out of the game — the stake stays in the pot)
    for (const id of d.quem) { if (d.fora[id]) continue; const v = S.villagers.get(id); const w = v ? here(op, v) : 'saiu';
      if (w === 'saiu' || w === 'dormiu') { dirty(); if (d.fase === 'convite') { d.quem.splice(d.quem.indexOf(id), 1); delete d.n[id]; continue; } d.fora[id] = w; d.n[id] = 0; tally(d, w); } }
    // (whose the set is, gone from the table — up and away, dead —: he takes his dice with him, and the game is let go, the stakes back to
    // who put them — the dead one's to his house, with his things: D-935. In a game of the body's who leaves loses, D-964: the pot to who
    // is still in it with dice — perde)
    if (d.set && d.set.dono && (d.fora[d.set.dono] === 'saiu' || !d.quem.includes(d.set.dono))) { if (ofBody(d) && d.fase !== 'convite' && d.fase !== 'fim') perde(op, d.set.dono); return close(op, 'o dono levou os dados'); }
    // (the cheat caught: the most quarrelsome of who saw it goes for him — a brawl at the table, the tavern's own)
    if (d.briga && S.clock >= d.briga.t) { const a = S.villagers.get(d.briga.a), c = S.villagers.get(d.briga.b); delete d.briga; if (a && c && T().briga && T().briga(a, c)) tally(d, 'briga'); }
    const L = R.ativos(d);
    if (d.fase === 'convite') { if (d.quem.length < 1 || (d.quem.length < 2 && S.clock >= d.ate)) return close(op, 'ninguém para jogar'); if (S.clock >= d.ate) return hostTimeout(op); return; }
    // (the others gone from the table — up and away, asleep over it, dead —: the last one with dice takes the pot — who left lost his dice,
    // and the end and each one's fora say so, D-964)
    if (d.fase !== 'fim' && d.fase !== 'revela' && L.length < 2) { d.venc = L.length === 1 ? L[0] : -1; return finish(op, L.length === 1 ? 'sobrou' : 'vazio'); }
    if (S.clock + EPS < d.ate) return;
    if (d.fase === 'sacode') { phase(op, 'palpite', 0); d.ate = r1(S.clock + waitOf(op)); return; }
    if (d.fase === 'palpite') return bidStep(op);
    if (d.fase === 'segura') return reveal(op);
    if (d.fase === 'revela') { if (d.venc) return finish(op, d.res && d.res.cravou ? 'cravou' : 'sobrou'); return round(op); }
    if (d.fase === 'fim') return close(op, d.fim || 'acabou');
  }
  // (the body's lobby run out: begun with whoever is in, if two; a customer's lobby: begun)
  function hostTimeout(op) { const d = op.data; const S = S_(); const h = S.villagers.get(d.host); if (h && isBody(h)) return close(op, 'o corpo não começou'); return start(op); }
  // (the seconds the bidder of the turn has: a customer thinks; the body is waited for; one away a while)
  function waitOf(op) { const d = op.data; const v = S_().villagers.get(d.ordem[d.vez]); if (!v) return 0; if (isBody(v)) return JD.ESPERA; return think(d, v); }
  function bidStep(op) {
    const S = S_(); const d = op.data;
    while (d.vez < d.ordem.length && (d.fora[d.ordem[d.vez]] || !(d.n[d.ordem[d.vez]] > 0))) d.vez++;
    if (d.vez >= d.ordem.length) { phase(op, 'segura', JD.SEGURA); return; }
    const id = d.ordem[d.vez]; const v = S.villagers.get(id); if (!v) { d.fora[id] = 'saiu'; d.n[id] = 0; dirty(); return; }
    if (isBody(v)) { d.fora[id] = 'demorou'; d.n[id] = 0; tally(d, 'demorou'); dirty(); return next(op); } // (the body's time ran out: the table gave up on it)
    const w = here(op, v); if (w === 'longe') { if (S.clock - d.t < JD.LONGE) { d.ate = r1(S.clock + 1); return; } d.fora[id] = 'saiu'; d.n[id] = 0; dirty(); return next(op); }
    const n = R.palpite(d, id, JD.tracos(v)); bid(op, v, n);
  }
  function bid(op, v, n) { const d = op.data; d.pal.push([v.id, n]); say(v, frase('palpite', v, d, null, n)); next(op); }
  function next(op) { const S = S_(); const d = op.data; d.vez++; d.t = r1(S.clock);
    while (d.vez < d.ordem.length && (d.fora[d.ordem[d.vez]] || !(d.n[d.ordem[d.vez]] > 0))) d.vez++;
    if (d.vez >= d.ordem.length || R.ativos(d).length < 2) { phase(op, 'segura', JD.SEGURA); return; }
    d.ate = r1(S.clock + waitOf(op)); }
  // the cups up: the quick hand of who would cheat (the body's armed by its hands, or a customer's own will), who saw it, the sum,
  // who hit it, who burnt a die — and what the cheat seen brings (the confusion: D-856)
  function reveal(op) {
    const S = S_(); const d = op.data; const trs = {}; for (const id of R.ativos(d)) { const v = S.villagers.get(id); trs[id] = v ? JD.tracos(v) : null; }
    const armed = d.trap && d.trap.id && !d.fora[d.trap.id] ? d.trap.id : 0;
    const body = new Set(R.ativos(d).filter(id => isBody(S.villagers.get(id))));
    const res = R.cheat(d, trs, null, armed, body); dirty();
    d.res = { total: res.total, cravou: res.cravou, queimou: res.queimou.slice(), dist: res.dist, trap: res.trap ? { id: res.trap.id, i: res.trap.i, de: res.trap.de, para: res.trap.para, kind: res.trap.kind, visto: res.trap.visto.slice(), pego: res.trap.pego } : null };
    const venc = R.aplica(d, res); d.venc = venc > 0 ? venc : 0;
    d.hist.push({ r: d.r, total: res.total, cravou: res.cravou, queimou: res.queimou.slice(), faces: JSON.parse(JSON.stringify(d.faces)), pal: d.pal.map(p => p.slice()), trap: d.res.trap ? Object.assign({}, d.res.trap) : null });
    if (d.hist.length > 8) d.hist.shift();
    if (res.cravou) { tally(d, 'cravou'); say(S.villagers.get(res.cravou), frase('cravou', S.villagers.get(res.cravou), d)); }
    for (const id of res.queimou) { const v = S.villagers.get(id); if (v && !d.n[id]) say(v, frase('fora', v, d)); }
    if (d.res.trap) trapped(op, d.res.trap);
    const nAt = R.ativos(d).length + res.queimou.length; phase(op, 'revela', JD.REVELA[0] + JD.REVELA[1] * nAt + (d.res.trap && d.res.trap.pego ? JD.PEGA_T : 0));
    if (d.venc === 0 && R.ativos(d).length === 0) d.venc = -1;
  }
  // the quick hand: seen — the shout, the marks of who saw it, the tie of the table, the fame, and the most quarrelsome of who saw it
  // on him (a brawl at the table: the tavern's); unseen — only the world's own book knows (the day's tally)
  function trapped(op, t) {
    const S = S_(); const d = op.data; const c = S.villagers.get(t.id); tally(d, t.pego ? 'trapaca-pega' : 'trapaca'); if (!c) return;
    if (!t.pego) return;
    const L = G.Lacos; let fierce = null, fs = 0.5;
    for (const id of t.visto) { const o = S.villagers.get(id); if (!o) continue; if (L) { L.marca(o, 'roubou', c.id, 30); }
      if (!isBody(o)) { const a = fac(o, 'agressivo') + 0.4 * JD.ebrio(o); if (a > fs) { fs = a; fierce = o; } } }
    if (L) for (const id of d.quem) { const o = S.villagers.get(id); if (o && o !== c) L.ato(o, c, 'trapaca'); }
    if (G.Fama && G.Fama.feito) G.Fama.feito(c, 'mentiu');
    const w = S.villagers.get(t.visto[0]); if (w) say(w, frase('pego', w, d, null, 0, c));
    if (fierce) d.briga = { a: fierce.id, b: c.id, t: r1(S.clock + JD.PEGA_T) }; // (the shout first — the uproar of being caught —, the fists a moment later: tick)
    const b = tavOf(op); const set = b && S.settlements.get(b.set);
    if (set && set._jdLog !== S.day) { set._jdLog = S.day; G.Village.log(`${c.name} foi pego virando um dado no jogo de copo da taverna de ${set.name}.`, '🎲', b.x, b.y); }
  }
  // the end: the pot to the winner (and his tournament's tally), the tie of who played together; then, a moment later, let go
  function finish(op, why) {
    const S = S_(); const d = op.data; const v = d.venc > 0 ? S.villagers.get(d.venc) : null; d.fim = why;
    if (v && (d.pote || 0) > EPS) { const r = D.move(pot(op), E.coinRef(v), 'moedas', d.pote, { op: op.id, code: 'dados-premio', by: v.id }); d.ganho = r.ok ? r.n : 0; if (!r.ok) giveBack(op); }
    else if ((d.pote || 0) > EPS) giveBack(op);
    if (v) { tally(d, 'vitoria'); const tor = d.torneio && A.get(d.torneio); if (tor && live(tor)) { const P = tor.data.placar; const e = P[v.id] || (P[v.id] = [0, 0]); e[0]++; e[1] = r2(e[1] + (d.ganho || 0)); } }
    const L = G.Lacos; if (L) for (let i = 0; i < d.quem.length; i++) for (let j = i + 1; j < d.quem.length; j++) { const a = S.villagers.get(d.quem[i]), c = S.villagers.get(d.quem[j]); if (a && c) L.ato(a, c, 'jogo'); }
    phase(op, 'fim', JD.FIM);
  }
  // (in a game of the body's, the owner of the set gone from the table with it — up and away, or the body itself —: who leaves loses what he
  // put, D-964, and the game ends with the dice: the pot to who is still in it with dice — of two or more, the one with the most, the first of
  // the round's bids in a tie —, as to the last one with dice ('sobrou'); none: back to who put it, at the close)
  function perde(op, gone) {
    const S = S_(); const d = op.data; const ord = R.ordem(d); const L = R.ativos(d).filter(id => id !== gone && S.villagers.has(id));
    if (!L.length) return; L.sort((a, c) => (d.n[c] | 0) - (d.n[a] | 0) || ord.indexOf(a) - ord.indexOf(c) || a - c);
    d.venc = L[0]; finish(op, 'sobrou');
  }
  // (why the god's body's last game of dice stopped — for its screen, a moment after: the game gone from the table without a winner — the
  // tavern shut, the dice taken away, nobody to play — and who left it; only read) → { op, por: the close's why, fim, fora, t } | null
  JD.PAROU_T = 6;
  JD.parou = function (v) {
    const S = S_(); if (!v || !S) return null; let best = null;
    for (const op of A.all()) { if (op.def !== 'jogo-dados' || live(op) || !op.end || !op.data || !(op.data.quem || []).includes(v.id)) continue; if (S.clock - op.end.t > JD.PAROU_T) continue; if (!best || op.end.t > best.end.t || (op.end.t === best.end.t && op.id > best.id)) best = op; }
    return best ? { op: best.id, por: best.end.why, fim: best.data.fim || '', venc: best.data.venc || 0, fora: Object.assign({}, best.data.fora), t: best.end.t } : null;
  };
  // (the pot back to each one by what they put — the ref each paid from; one whose ref is no more, to the house's shelf)
  function giveBack(op) {
    const d = op.data; const b = S_().buildings.get(op.at);
    for (const id of Object.keys(d.pago)) { const [ref, n] = d.pago[id]; const m = Math.min(n, d.pote || 0); if (!(m > EPS)) continue;
      const to = D.exists(ref) ? ref : b ? shelf(b) : null; if (to) D.move(pot(op), to, 'moedas', m, { op: op.id, code: 'dados-volta', by: +id }); }
    if ((d.pote || 0) > EPS && b) D.move(pot(op), shelf(b), 'moedas', d.pote, { op: op.id, code: 'dados-volta', by: 0 });
  }
  // (the end, whatever end: the pot back to who paid it if no one took it, and the set back from the table to where it goes — the house's
  // shelf, its owner's bag or house: G.JogosCasa.devolve, D-932)
  function close(op, why) { if (!live(op)) return; if ((op.data.pote || 0) > EPS) giveBack(op); if (op.data.set && op.data.set.n && JC()) JC().devolve(op.data.set.n, why); A.end(op, op.data.fim ? 'ok' : 'int', why); dirty(); }
  JD.close = (op, why) => { if (op && live(op) && G.inSim) close(op, why || 'fechado'); };

  A.def('jogo-dados', {
    name: 'Jogo de dados', many: true, conserve: false,
    purpose: 'Um jogo de copo à mesa da taverna: a aposta no pote, os dados no copo, os palpites da soma; quem crava faz os outros perderem um dado, senão quem fica mais longe perde um; o último com dados leva o pote.',
    needs: 'dois ou mais à mesa de uma taverna aberta, e um jogo de dados de verdade (da casa, ou de quem joga)',
    title(op) { const d = op.data; return `Dados na mesa: ${d.fase === 'convite' ? 'chamando' : 'rodada ' + d.r}${d.moeda ? `, pote ${String(r2(d.pote || 0)).replace('.', ',')}` : ''}`; },
    tick, // (the once-a-second look of the operations — and the building gone, A.atGone: its step, JD.update, is every step of the world)
  });
  // every step of the world (main.js): each game's beat — the beats are fractions of a second of the world, finer than the operations'
  // once-a-second look; a beat whose time has not come does nothing, so a second call in the same moment is nothing
  JD.update = function () { if (!G.S) return; for (const op of games().slice()) if (live(op)) tick(op); };
  A.hooks.canon.push(['jogo-dados', () => games().map(op => [op.id, op.at, op.data.g, op.data.fase, op.data.r, op.data.quem.join(','), Object.keys(op.data.fora).sort().join(','), r2(op.data.pote || 0), op.data.pal.map(p => p.join(':')).join(',')])]);
  // (whoever dies or is taken: out of the game at once — the stake stays in the pot)
  A.hooks.gone.push(function (v) { for (const op of games().slice()) { const d = op.data; if (!d.quem.includes(v.id) || d.fora[v.id]) continue; if (d.fase === 'convite') { d.quem.splice(d.quem.indexOf(v.id), 1); delete d.n[v.id]; } else { d.fora[v.id] = 'saiu'; d.n[v.id] = 0; } dirty(); } });
  // (the ties of the table: the game played together; the cheat seen — 22b's door, L.tipo)
  if (G.Lacos && G.Lacos.tipo) { G.Lacos.tipo('jogo', { a: [3, 1, 0, 1], b: [3, 1, 0, 1], frente: 1 }); G.Lacos.tipo('trapaca', { a: [-18, -25, -4, -2], b: [-2, 0, 0, 0], frente: 1 }); }

  // ------------------------------ the words of the table (by the hash: never a chance) ------------------------------
  const UNI = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const DEZ = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta'];
  JD.extenso = n => (n < 20 ? UNI[n] : DEZ[Math.floor(n / 10)] + (n % 10 ? ' e ' + UNI[n % 10] : ''));
  const WORDS = {
    chama: ['Quem joga o copo? A aposta é {a}.', 'Dados na mesa! {a} cada um.', 'Vamos ao copo, que a noite é longa.'],
    palpite: ['{N}!', 'Digo {n}.', 'Vai dar {n}.', '{N}, aposto.', 'Hum… {n}.', '{N}, e não se fala mais nisso.'],
    cravou: ['Cravei! Um dado de cada um.', 'Em cheio! Tirem um dado.', 'Bem na conta!'],
    fora: ['Queimei os dois. Estou fora.', 'Fora. Que sorte a minha.', 'Acabaram-se os meus dados.'],
    pego: ['Trapaceiro! Eu vi esse dado virar!', 'Ei! Mexeu no dado, {c}!', 'Mão leve! Ninguém joga com ladrão.'],
  };
  function frase(k, v, d, b, n, c) {
    const L = WORDS[k]; if (!L || !v) return ''; const t = L[Math.floor(R.h(d.seed || 1, d.r || 0, v.id, k.length * 31 + (n || 0)) * L.length) % L.length];
    const ex = n ? JD.extenso(n) : ''; const a = b && d.aposta ? (G.Falas ? G.Falas.price((G.Fac.get(G.Village.facOfSet(b.set)) || {}).civ || 'classico', d.aposta) : String(d.aposta)) : 'nada';
    return t.replace('{N}', G.cap(ex)).replace('{n}', ex).replace('{a}', a).replace('{c}', c ? c.name : '');
  }
  JD.frase = frase;
  const say = (v, txt) => { if (v && txt && !(G.Skip && G.Skip.on) && G.Talk && G.Talk.say) G.Talk.say(v, txt, { dur: Math.min(5, 1.6 + txt.length / 16) }); };

  // ------------------------------ the body's doors (the hands, in the world's step: G.Possess.apply) ------------------------------
  const inStep = () => !!G.inSim;
  const NO = { ok: false, why: '' };
  // (where the body sits: the tavern, its day, the table — or why not)
  function bodyAt(v) {
    if (!v || !isBody(v) || !v.inside) return { why: 'Sente-se a uma mesa da taverna.' }; const S = S_(); const b = S.buildings.get(v.inside);
    if (!b || b.type !== 'taverna' || !b.built) return { why: 'Sente-se a uma mesa da taverna.' }; const top = dayOf(b);
    if (!top || !T().aberta(b)) return { why: 'A taverna está fechada.' }; const g = seatOf(v, b, top); if (!g) return { why: 'Sente-se a uma mesa primeiro.' };
    return { b, top, g };
  }
  // what the body can do about dice now, where it sits (only read: the verb and the screen ask it) →
  //   { k: 'chamar' | 'entrar' | 'jogo' | 'olhar' | null, ok, why, op, aposta, apostas: [...], set, fonte, aluguel, de }
  // (de: where the dice of the game come from, in words — «os seus dados», «dados da casa, emprestados»; aluguel: what the house's set
  // costs the body, who calls the game — 0 for its own, or for the house's customer of the night: G.JogosCasa, D-934)
  JD.verbo = function (v) {
    const x = bodyAt(v); if (!x.b) return { k: null, ok: false, why: x.why };
    const { b, top, g } = x; const mine = gameOf(v); if (mine) return { k: 'jogo', ok: true, op: mine.id };
    if (top.data.fecha) return { k: null, ok: false, why: 'A taverna está fechando: nenhum jogo novo.' }; // (the closing called: no game begins — D-963)
    const op = atTable(b, g);
    if (op) { const d = op.data; const L = d.set && d.set.n && JC() ? JC().mesa(d.set.n) : null; const de = L ? JC().fonteDe(L, v) : '';
      if (d.fase === 'convite' && d.host !== v.id) { const s = d.aposta; const can = d.quem.length < JD.MAX && (!d.moeda || purse(v) + EPS >= s);
        return { k: 'entrar', ok: can, why: d.quem.length >= JD.MAX ? 'A mesa já está cheia.' : can ? '' : 'Falta dinheiro para a aposta.', op: op.id, aposta: s, de }; }
      return { k: 'olhar', ok: true, op: op.id, de }; }
    if (top.data.jogo && top.data.jogo[g]) return { k: null, ok: false, why: 'A mesa joga ossinhos agora.' };
    const set = setFor(b, v);
    if (!set) return { k: 'chamar', ok: false, espera: 1, why: (JC() && JC().semJogo(v, b, 'dados')) || 'A casa não tem dados livres, e você não traz os seus.' };
    const others = Object.keys(top.data.mesa).map(id => S_().villagers.get(+id)).filter(o => o && o !== v && free(o, b, top, g));
    if (!others.length) return { k: 'chamar', ok: false, why: 'Não há ninguém à sua mesa para jogar.' };
    const al = set.daCasa && JC() ? JC().aluguel(b, v) : { n: 0, por: '' };
    const de = set.daCasa ? 'dados da casa, emprestados' : 'os seus dados';
    const ap = coinOf(b) ? JD.APOSTAS.filter(s => purse(v) + EPS >= s + al.n) : [0];
    if (!ap.length) return { k: 'chamar', ok: false, why: `Falta dinheiro: a menor aposta é ${money(b, JD.APOSTAS[0])}${al.n > EPS ? `, e o aluguel dos dados da casa ${money(b, al.n)}` : ''}.` };
    return { k: 'chamar', ok: true, why: '', apostas: ap, set, fonte: set.daCasa ? 'casa' : 'seu', aluguel: al.n, alPor: al.por, de };
  };
  // the body calls its table to the dice, at a stake: a lobby where each one of the table answers by his own will (JD.entra)
  JD.chamar = function (v, aposta) {
    if (!inStep()) return NO; const c = JD.verbo(v); if (c.k !== 'chamar' || !c.ok) return { ok: false, why: c.why || 'Agora não dá.' };
    const { b, top, g } = bodyAt(v); const s = coinOf(b) ? (c.apostas.includes(aposta) ? aposta : c.apostas[0]) : 0;
    const op = begin(b, top, g, v, s, c.set, JD.CONVITE_CORPO, torneioOf(b) ? torneioOf(b).id : 0); if (!op) return { ok: false, why: 'Os dados não chegaram à mesa.' };
    answers(op, b, top, v);
    tally(op.data, 'corpo'); return { ok: true, op: op.id, msg: `Você chama a mesa para os dados${s ? ` — ${money(b, s)} cada um` : ''} (${c.de}${c.aluguel > EPS ? `; o aluguel, ${money(b, c.aluguel)}, ao começar` : ''}).` };
  };
  // (the table's answers to the body's call, at the stake of now: each one free at the table, by his will; who liked the body, more)
  function answers(op, b, top, v) {
    const S = S_(); const d = op.data; const tor = d.torneio ? 0.12 : 0;
    for (const id of d.quem.slice()) if (id !== v.id) { d.quem.splice(d.quem.indexOf(id), 1); delete d.n[id]; } dirty();
    d.convite = {};
    const L = Object.keys(top.data.mesa).map(id => S.villagers.get(+id)).filter(o => o && o !== v && free(o, b, top, d.g)).sort((a, c) => a.id - c.id);
    for (const o of L) { const af = afeto(o, v); const a = JD.entra(o, b, d.aposta, tor + Math.max(-0.2, Math.min(0.12, af / 250)));
      d.convite[o.id] = a.sim && d.quem.length < JD.MAX ? 'sim' : a.sim ? 'nao:mesa cheia' : 'nao:' + a.por; if (a.sim) join(op, o); }
  }
  // (the stake changed in the body's lobby: the table answers again)
  JD.aposta = function (v, opId, s) {
    if (!inStep()) return NO; const op = A.get(opId); if (!op || op.def !== 'jogo-dados' || !live(op) || op.data.host !== v.id || op.data.fase !== 'convite') return { ok: false, why: 'Não há jogo sendo chamado.' };
    const b = tavOf(op); const top = b && dayOf(b); if (!b || !top) return { ok: false, why: 'A taverna fechou.' };
    const al = op.data.set && op.data.set.casa && JC() ? JC().aluguel(b, v).n : 0; // (and the rent of the house's dice, D-934)
    if (op.data.moeda && !(JD.APOSTAS.includes(s) && purse(v) + EPS >= s + al)) return { ok: false, why: al > EPS ? 'Falta dinheiro para essa aposta e o aluguel dos dados.' : 'Falta dinheiro para essa aposta.' };
    op.data.aposta = op.data.moeda ? s : 0; answers(op, b, top, v); return { ok: true, n: op.data.quem.length - 1 };
  };
  JD.comecar = function (v, opId) {
    if (!inStep()) return NO; const op = A.get(opId); if (!op || op.def !== 'jogo-dados' || !live(op) || op.data.host !== v.id || op.data.fase !== 'convite') return { ok: false, why: 'Não há jogo sendo chamado.' };
    if (op.data.quem.length < 2) return { ok: false, why: 'Ninguém aceitou jogar a essa aposta.' };
    start(op); return live(op) ? { ok: true, msg: `Os copos na mesa. Sacudam!${op.data.set && op.data.set.alug > EPS ? ` (O aluguel dos dados da casa, ${money(tavOf(op) || { set: 0 }, op.data.set.alug)}, pago ao taverneiro.)` : ''}` } : { ok: false, why: op.end && op.end.why === 'sem o aluguel' ? 'Falta dinheiro para o aluguel dos dados da casa.' : 'Ninguém pôde pagar a aposta.' };
  };
  JD.entrar = function (v, opId) {
    if (!inStep()) return NO; const c = JD.verbo(v); if (c.k !== 'entrar' || c.op !== opId) return { ok: false, why: 'Esse jogo já começou.' }; if (!c.ok) return { ok: false, why: c.why };
    const op = A.get(opId); join(op, v); tally(op.data, 'corpo'); return { ok: true, msg: 'Você entra no jogo de copo.' };
  };
  // the body's bid: its turn, a number nobody said, within the dice on the table
  JD.palpite = function (v, opId, n) {
    if (!inStep()) return NO; const op = A.get(opId); const d = op && op.def === 'jogo-dados' && live(op) ? op.data : null;
    if (!d || d.fase !== 'palpite' || d.ordem[d.vez] !== v.id) return { ok: false, why: 'Não é a sua vez.' };
    if (!R.livre(d, n)) return { ok: false, why: R.dito(d, n) ? `Alguém já disse ${n}.` : 'Esse número não dá com os dados da mesa.' };
    bid(op, v, n); return { ok: true, n };
  };
  // the body's quick hand, armed for the cups of this round (after its bid): at the cups, the one turn of one of its dice that serves
  // its bid — if any does —, with the others' eyes on the table
  JD.trapacear = function (v, opId, on) {
    if (!inStep()) return NO; const op = A.get(opId); const d = op && op.def === 'jogo-dados' && live(op) ? op.data : null;
    if (!d || d.fora[v.id] || !(d.fase === 'palpite' || d.fase === 'segura') || !d.pal.some(p => p[0] === v.id)) return { ok: false, why: 'Só depois do seu palpite, antes de os copos subirem.' };
    d.trap = on === false ? 0 : { id: v.id, quer: 1 }; return { ok: true, on: !!d.trap };
  };
  // out of the game (the stake stays in the pot) — or, the body's lobby, the call let go
  JD.sair = function (v, opId) {
    if (!inStep()) return NO; const op = A.get(opId); const d = op && op.def === 'jogo-dados' && live(op) ? op.data : null; if (!d || !d.quem.includes(v.id)) return { ok: false, why: '' };
    if (d.fase === 'convite') { if (d.host === v.id) { close(op, 'o corpo desistiu'); return { ok: true, msg: 'Deixa para outra hora.' }; } d.quem.splice(d.quem.indexOf(v.id), 1); delete d.n[v.id]; dirty(); return { ok: true, msg: 'Você sai do jogo.' }; }
    if (!d.fora[v.id]) { d.fora[v.id] = 'saiu'; d.n[v.id] = 0; tally(d, 'saiu'); dirty(); } return { ok: true, msg: d.moeda && d.pago[v.id] ? 'Você larga o jogo — a aposta fica no pote.' : 'Você larga o jogo.' };
  };
  // (the cup the dice are shaken in, as the house has it: of leather where the people has had hides, of the potter's clay where it had
  // the ware, else turned wood — G.Origem, only read)
  const cupOf = b => { const O = G.Origem; const fid = G.Village.facOfSet(b.set); return O && O.matOK(fid, 'couro') ? 'couro' : O && O.matOK(fid, 'barro') ? 'barro' : 'madeira'; };
  JD.copoDe = b => (b ? cupOf(b) : 'madeira');
  const money = (b, n) => (G.Falas ? G.Falas.price((G.Fac.get(G.Village.facOfSet(b.set)) || {}).civ || 'classico', n) : String(n));
  JD.money = (b, n) => money(b, n);

  // ------------------------------ what the body's screen reads (only read; what the body may know) ------------------------------
  // The game the body plays, or watches at its table: the phase and its clock; its own dice (only after the cups are shaken: nobody
  // else's until they come up); the others — the name as the body knows them (G.Possess.knows), the dice each has, the bid; the free
  // numbers; the pot; the last cups. → null where there is none
  JD.corpo = function (v) {
    if (!v) return null; const S = S_(); let op = gameOf(v) || (v.inside ? (() => { const x = bodyAt(v); return x.b ? atTable(x.b, x.g) : null; })() : null);
    if (!op) { for (const q of games()) if (q.data.quem.includes(v.id) && q.data.fora[v.id]) op = q; } if (!op) return null;
    const d = op.data; const b = tavOf(op); if (!b) return null; const K = G.Possess && G.Possess.knows; const me = d.quem.includes(v.id) ? v.id : 0;
    const up = d.fase === 'revela' || d.fase === 'fim'; const seen = id => up || (id === me && d.fase !== 'convite');
    const nome = id => { const o = S.villagers.get(id); return o ? (id === v.id ? 'Você' : K ? K.call(v, o) : o.name) : 'alguém'; };
    const ps = d.quem.map(id => { const p = d.pal.find(q => q[0] === id); const o = S.villagers.get(id); const tr = o && id !== v.id ? JD.tracos(o) : null;
      return { id, nome: nome(id), eu: id === v.id, n: d.n[id] | 0, fora: d.fora[id] || '', palpite: p ? p[1] : null, faces: seen(id) && d.faces[id] ? d.faces[id].slice() : null,
        olho: tr ? (tr.aten > 0.6 ? 'atento' : tr.aten > 0.35 ? 'de olho' : JD.ebrio(o) > 0.4 ? 'bêbado' : 'distraído') : '', convite: d.convite[id] || '' }; });
    const t = d.res && d.res.trap; const trap = t && (t.id === v.id || t.pego) ? Object.assign({}, t, { visto: t.visto.slice(), euVi: t.visto.includes(v.id) }) : null;
    const cw = d.convite; const asked = Object.keys(cw).map(id => ({ id: +id, nome: nome(+id), sim: cw[id] === 'sim', por: cw[id].startsWith('nao:') ? cw[id].slice(4) : '' }));
    const torn = d.torneio && A.get(d.torneio);
    return { op: op.id, b: b.id, g: d.g, fase: d.fase, t: d.t, ate: d.ate, now: S.clock, rodada: d.r, host: d.host, euHost: d.host === v.id, eu: me, jogo: me && !d.fora[me] ? 1 : 0,
      jogadores: ps, ordem: d.ordem.slice(), vez: d.fase === 'palpite' ? d.ordem[d.vez] || 0 : 0, livres: d.fase === 'palpite' ? R.livres(d) : [], faixa: R.faixa(d),
      espero: me && d.faces[me] && d.fase !== 'convite' ? r1(R.soma(d.faces[me]) + 3.5 * (R.nDados(d) - (d.n[me] | 0))) : null,
      aposta: d.aposta, moeda: !!d.moeda, pote: d.pote || 0, apostas: JD.APOSTAS.slice(), convite: asked, res: up && d.res ? { total: d.res.total, cravou: d.res.cravou, queimou: d.res.queimou.slice(), dist: Object.assign({}, d.res.dist), trap } : null,
      armado: !!(d.trap && d.trap.id === v.id), trapacaOk: !!me && !d.fora[me] && (d.fase === 'palpite' || d.fase === 'segura') && d.pal.some(p => p[0] === me),
      olhos: me ? R.ativos(d).filter(id => id !== me).length : 0, risco: me ? r2(R.risco(d, me, Object.fromEntries(R.ativos(d).map(id => [id, S.villagers.get(id) ? JD.tracos(S.villagers.get(id)) : null])))) : 0,
      venc: d.venc || 0, fim: d.fim || '', ganho: d.ganho || 0,
      // (the set on the table and where it comes from — the house's, lent; the body's own; another's —, and the rent paid: the J front, D-932)
      set: d.set ? { k: d.set.k, mat: d.set.k.split('.')[1], meus: !!d.set.dono && d.set.dono === v.id, casa: !!d.set.casa, alug: d.set.alug || 0,
        vem: d.fase === 'convite' && d.host === v.id && d.set.casa && !d.set.alug && JC() ? JC().aluguel(b, v).n : 0, // (the rent the body will pay as it begins)
        de: d.set.n && JC() && JC().mesa(d.set.n) ? JC().fonteDe(JC().mesa(d.set.n), v, 1) : d.set.casa ? 'dados da casa, emprestados' : d.set.dono === v.id ? 'os seus dados' : 'dados emprestados' } : null,
      torneio: torn ? { premio: torn.data.pote || 0, placar: Object.keys(torn.data.placar).map(id => [nome(+id), torn.data.placar[id][0]]).sort((a, c) => c[1] - a[1]).slice(0, 3) } : null,
      tema: T() && T().look ? T().look(b).tema : 'classico', copo: cupOf(b),
      price: n => money(b, n), hist: d.hist.slice(-3).map(h => ({ r: h.r, total: h.total, cravou: h.cravou ? nome(h.cravou) : '', queimou: h.queimou.map(nome) })) };
  };

  // ------------------------------ the tournament of a feast night (the door T1 calls: D-857) ------------------------------
  // JD.torneio(b, { premio, de }) — on the night of a feast the house (or who gives the feast) puts a prize: from the holder `de` (the
  // keeper's coins by default) into the tournament's own pot, by the ledger ('torneio-premio'); the games of the night at that tavern
  // count for it, and the tables are keener; at the closing, the one who won the most games tonight (then the more coins won, then
  // the first to win) takes the prize ('torneio-campeao'); nobody won, it goes back. A people with no coin plays it for the glory
  const torneioOf = b => { if (!b) return null; for (const op of A.all()) if (op.def === 'torneio-dados' && live(op) && op.at === b.id) return op; return null; };
  JD.torneioDe = b => torneioOf(b);
  JD.torneio = function (b, o) {
    if (!G.inSim || !b || b.type !== 'taverna' || !b.built) return { ok: false, why: '' }; const S = S_(); o = o || {};
    if (torneioOf(b)) return { ok: false, why: 'Já há um torneio esta noite.' };
    const top = dayOf(b); const k = T() && T().keeperOf ? T().keeperOf(b) : null;
    const op = A.start('torneio-dados', { at: b.id, fac: G.Village.facOfSet(b.set), set: b.set, by: k ? k.id : 0, why: o.motivo || 'noite de festa', data: { v: 1, b: b.id, pote: 0, placar: {}, dia: S.day, top: top ? top.id : 0, de: null } });
    const want = coinOf(b) ? Math.max(0, +o.premio || 1) : 0; const from = o.de || (k ? E.coinRef(k) : null);
    if (want > 0 && from && D.get(from, 'moedas') + EPS >= want) { const r = D.move(from, pot(op), 'moedas', want, { op: op.id, code: 'torneio-premio', by: k ? k.id : 0 }); if (r.ok) op.data.de = from; }
    return { ok: true, op: op.id, premio: op.data.pote || 0 };
  };
  function torneios() {
    const S = S_();
    for (const op of A.all()) { if (op.def !== 'torneio-dados' || !live(op)) continue; const b = S.buildings.get(op.at);
      if (b && b.built && T().aberta(b) && !(dayOf(b) && dayOf(b).data.fecha) && S.day === op.data.dia) continue;
      // (the night over: the champion)
      const P = op.data.placar; const ids = Object.keys(P).map(Number).filter(id => S.villagers.has(id)).sort((a, c) => P[c][0] - P[a][0] || P[c][1] - P[a][1] || a - c);
      const w = ids.length ? S.villagers.get(ids[0]) : null; op.data.campeao = w ? w.id : 0;
      if ((op.data.pote || 0) > EPS) { const to = w ? E.coinRef(w) : op.data.de && D.exists(op.data.de) ? op.data.de : b ? shelf(b) : null; if (to) D.move(pot(op), to, 'moedas', op.data.pote, { op: op.id, code: w ? 'torneio-campeao' : 'dados-volta', by: w ? w.id : 0 }); }
      if (w && G.Fama && G.Fama.feito) G.Fama.feito(w, 'valente');
      if (w && b) { const set = S.settlements.get(b.set); G.Village.log(`${w.name} venceu o torneio de dados da taverna${set ? ' de ' + set.name : ''}.`, '🎲', b.x, b.y); }
      A.end(op, 'ok', w ? 'campeão' : 'ninguém venceu');
    }
  }
  A.def('torneio-dados', {
    name: 'Torneio de dados', many: true, conserve: false,
    purpose: 'Numa noite de festa, o torneio de copo da taverna: o prêmio no pote, quem vencer mais jogos na noite leva.',
    needs: 'uma taverna aberta numa noite de festa',
    title(op) { return `Torneio de dados: ${Object.keys(op.data.placar).length} vencedores de partidas`; },
    tick() { },
  });

  // ------------------------------ the save ------------------------------
  // (a game is an operation: its book goes with the acts — the phase, its clock, the faces of the round, the bids, the pot; the
  // players' errands come back by the tavern's own load. A damaged one is let go, its pot back to who paid it)
  (G.saveHooks = G.saveHooks || []).push({
    save() { },
    load() {
      for (const op of A.all()) {
        if ((op.def !== 'jogo-dados' && op.def !== 'torneio-dados') || !live(op)) continue; const d = op.data;
        if (op.def === 'torneio-dados') { if (!d.placar || typeof d.placar !== 'object') d.placar = {}; continue; }
        const okd = Array.isArray(d.quem) && d.quem.every(Number.isInteger) && d.n && typeof d.n === 'object' && d.fora && typeof d.fora === 'object' && Array.isArray(d.pal) && d.pago && typeof d.pago === 'object'
          && typeof d.g === 'string' && Number.isFinite(d.t) && Number.isFinite(d.ate) && Number.isInteger(d.r) && Array.isArray(d.ordem) && d.set && typeof d.set.k === 'string';
        if (!okd) { G.inSim++; try { d.fora = d.fora || {}; d.pago = d.pago && typeof d.pago === 'object' ? d.pago : {}; close(op, 'save danificado'); } finally { G.inSim--; } continue; }
        if (!d.tally) d.tally = {}; if (!d.convite) d.convite = {}; if (!Array.isArray(d.hist)) d.hist = []; if (!d.faces) d.faces = {};
      }
    },
  });
})(window.G);
