'use strict';
// ============================================================
//  What each people knows of the world. Nobody holds the map: an island
//  can be unknown to Argos and old news in Hrafn, an iron vein can sit in
//  the rock for a thousand years with no one aware of it. A people learns
//  what its own saw AND came home to tell: a ship's crew carries its news
//  until it lands at home — if it sinks with all hands, the news sinks too.
//
//    regions   the landmasses, as the sea separates them (islands, islets,
//              continents), with what is really on them: ore, forest,
//              fertile ground, beasts, a natural harbour.
//    states    per people and region: 0 desconhecida · 1 boato · 2 avistada
//              · 3 explorada · 4 mapeada · 5 habitada.
//    rumours   born from someone and something (a fisherman blown off by a
//              storm, a merchant's tale, a survivor, a piece of a painted
//              hull on the beach), with a confidence, the peoples that heard
//              them, and a claim that may be wrong (fool's gold, a whale
//              taken for a monster). The truth stays in the world.
//    carriers  ships and people hold the news they gathered until they are
//              home: G.Know.note / G.Know.bring.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  const K = G.Know = {};
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);
  const UNK = 0, RUM = 1, SIG = 2, EXP = 3, MAP = 4, SET = 5;
  K.ST = ['desconhecida', 'boato', 'avistada', 'explorada', 'mapeada', 'habitada'];
  K.UNK = UNK; K.RUM = RUM; K.SIG = SIG; K.EXP = EXP; K.MAP = MAP; K.SET = SET;
  const CELL = 8; // the sea is remembered in squares of 8×8 tiles
  K.CELL = CELL;
  let regs = null, comp = null, regKey = null, regVer = -1, byKey = new Map();
  G.mapHooks.push(n => { N = n; regs = null; comp = null; });
  const DAY = () => G.DAY_LEN;

  // ------------------------------ the regions ------------------------------
  function build() {
    const S = G.S; const n = N * N;
    comp = new Int32Array(n).fill(-1); regs = []; byKey = new Map(); regKey = S; regVer = S.typeVer || 0;
    const all = [];
    for (let i = 0; i < n; i++) {
      if (comp[i] >= 0 || S.type[i] <= T.SEA) continue;
      const r = { idx: regs.length, key: i, n: 0, sx: 0, sy: 0, x0: N, y0: N, x1: 0, y1: 0, coast: [], nc: 0, fert: 0, trees: 0, rocky: 0, river: 0, temp: 0 };
      const st = [i]; comp[i] = r.idx; all.length = 0;
      while (st.length) {
        const a = st.pop(); const x = a % N, y = (a / N) | 0;
        r.n++; r.sx += x; r.sy += y; if (x < r.x0) r.x0 = x; if (x > r.x1) r.x1 = x; if (y < r.y0) r.y0 = y; if (y > r.y1) r.y1 = y;
        if (S.fert) r.fert += S.fert[a]; if (S.treeAt[a]) r.trees++; const ty = S.type[a]; if (ty === T.ROCKY) r.rocky++; else if (ty === T.RIVER) r.river++;
        if (S.temp) r.temp += S.temp[a];
        let coast = false;
        if (x > 0) { const j = a - 1; if (S.type[j] <= T.SEA) coast = true; else if (comp[j] < 0) { comp[j] = r.idx; st.push(j); } }
        if (x < N - 1) { const j = a + 1; if (S.type[j] <= T.SEA) coast = true; else if (comp[j] < 0) { comp[j] = r.idx; st.push(j); } }
        if (y > 0) { const j = a - N; if (S.type[j] <= T.SEA) coast = true; else if (comp[j] < 0) { comp[j] = r.idx; st.push(j); } }
        if (y < N - 1) { const j = a + N; if (S.type[j] <= T.SEA) coast = true; else if (comp[j] < 0) { comp[j] = r.idx; st.push(j); } }
        if (coast && S.type[a] !== T.RIVER) { r.nc++; all.push(a); }
      }
      r.cx = r.sx / r.n + 0.5; r.cy = r.sy / r.n + 0.5; r.fert /= r.n; r.temp = r.temp / r.n / 255;
      // the coast, sampled evenly around the shore (by the angle from the middle)
      if (all.length) {
        const ang = a => Math.atan2(((a / N) | 0) - r.cy, (a % N) - r.cx);
        all.sort((p, q) => ang(p) - ang(q));
        const k = Math.min(40, all.length); for (let j = 0; j < k; j++) r.coast.push(all[Math.floor(j * all.length / k)]);
      }
      r.kind = r.n >= Math.max(1500, n * 0.12) ? 'continente' : r.n >= 80 ? 'ilha' : r.n >= 12 ? 'ilhota' : 'rochedo';
      regs.push(r); byKey.set(r.key, r);
    }
    // what is really there (the world's truth, which nobody reads directly)
    for (const r of regs) { r.ores = []; }
    for (const o of S.ores || []) { const c = comp[W.idx(o.x, o.y)]; if (c >= 0) regs[c].ores.push(o.id); }
  }
  function ensure() { const S = G.S; if (!regs || regKey !== S || regVer !== (S.typeVer || 0) || comp.length !== N * N) build(); }
  K.regions = () => { ensure(); return regs; };
  K.at = function (x, y) { ensure(); if (!W.inb(x, y)) return null; const c = comp[W.idx(x, y)]; return c >= 0 ? regs[c] : null; };
  // the region a saved key refers to (the map may have moved under it: a volcano, an earthquake)
  K.reg = function (key) { ensure(); const r = byKey.get(+key); if (r) return r; key = +key; if (key >= 0 && key < N * N && comp[key] >= 0) return regs[comp[key]]; return null; };
  K.compAt = i => { ensure(); return comp[i]; };
  K.big = r => r && r.kind !== 'rochedo';
  // the nearest coast tile of a region to a point
  K.coastNear = function (r, x, y) { let best = null, bd = 1e9; for (const i of r.coast) { const d = G.dist2(i % N + 0.5, ((i / N) | 0) + 0.5, x, y); if (d < bd) { bd = d; best = i; } } return best === null ? null : [best % N + 0.5, ((best / N) | 0) + 0.5]; };
  K.distTo = function (r, x, y) { const p = K.coastNear(r, x, y); return p ? G.dist(p[0], p[1], x, y) : 1e9; };
  // a sheltered cove: coast with land around three sides and a way out to open sea
  K.harbor = function (r) {
    if (r._harbor !== undefined && r._hDay === G.S.day) return r._harbor;
    const S = G.S; let best = null, bs = -1e9;
    for (const i of r.coast) {
      const x = i % N, y = (i / N) | 0; let wet = 0;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const xx = x + dx, yy = y + dy; if (W.inb(xx, yy) && S.type[yy * N + xx] <= T.SEA) wet++; }
      if (!W.walkable(i)) continue;
      const sc = -Math.abs(wet - 9) + (S.type[i] === T.SAND ? 1.5 : 0) + G.hash(i) * 0.5;
      if (sc > bs) { bs = sc; best = [x + 0.5, y + 0.5]; }
    }
    r._harbor = best; r._hDay = G.S.day; return best;
  };
  // the screen's compass (the god looks down at an angle: "up" is north)
  K.dir = function (dx, dy) {
    const sx = dx - dy, sy = (dx + dy) / 2; if (Math.abs(sx) + Math.abs(sy) < 0.01) return 'aqui';
    const a = Math.atan2(-sy, sx); const k = Math.round(a / (Math.PI / 4)) & 7;
    return ['leste', 'nordeste', 'norte', 'noroeste', 'oeste', 'sudoeste', 'sul', 'sudeste'][k];
  };
  K.dirA = (dx, dy) => Math.atan2(-(dx + dy) / 2, dx - dy); // (screen angle, for the taboos: "nobody sails west")
  K.aDir = a => ['leste', 'nordeste', 'norte', 'noroeste', 'oeste', 'sudoeste', 'sul', 'sudeste'][Math.round(a / (Math.PI / 4)) & 7];

  // ------------------------------ names ------------------------------
  const FEMN = /^(Ilha|Ilhota|Terra|Costa|Praia|Baía|Enseada|Pedra|Rocha|Ponta|Nova)/;
  K.de = n => (FEMN.test(n) ? 'da ' : /^(Rochedo|Recife|Penedo|Cabo|Estreito|Mar|Porto)/.test(n) ? 'do ' : 'de ') + n;
  K.na = n => (FEMN.test(n) ? 'na ' : /^(Rochedo|Recife|Penedo|Cabo|Estreito|Mar|Porto)/.test(n) ? 'no ' : 'em ') + n;
  K.a = n => (FEMN.test(n) ? 'a ' : /^(Rochedo|Recife|Penedo|Cabo|Estreito|Mar|Porto)/.test(n) ? 'o ' : '') + n;
  const used = () => G.S.know && (G.S.know._names || (G.S.know._names = []));
  // the word for an island in the explorers' own tongue (and what it means)
  const TONGUE = {
    nordico: { negra: 'Svartey', branca: 'Hvítey', verde: 'Grœney', focas: 'Selsey', ouro: 'Gullsey', baleias: 'Hvalsey', aves: 'Fuglsey', pedra: 'Steinsey' },
    grego: { negra: 'Melaina', branca: 'Leukê', verde: 'Chlôra', ouro: 'Chrysê', aves: 'Ornithê', focas: 'Phôkaia' },
    romano: { negra: 'Insula Nigra', branca: 'Insula Alba', verde: 'Insula Viridis', ouro: 'Insula Aurea', focas: 'Insula Phocarum' },
  };
  K.nameFor = function (r, fid, ctx) {
    ctx = ctx || {}; const S = G.S; const f = G.Fac.get(fid) || {};
    const isl = r.kind === 'continente' ? 'Terra' : r.kind === 'ilhota' ? 'Ilhota' : 'Ilha';
    const cands = [];
    const ores = r.ores.map(id => (S.ores || []).find(o => o.id === id)).filter(Boolean);
    const kinds = ctx.beasts || [];
    if (ctx.ore === 'ferro' || ores.some(o => o.kind === 'ferro')) cands.push(['negra', `${isl} Negra`, 3]);
    if (ctx.ore === 'ouro' || ores.some(o => o.kind === 'ouro')) cands.push(['ouro', `${isl} Dourada`, 3]);
    if (kinds.includes('seal') || kinds.includes('walrus')) cands.push(['focas', `${isl} das Focas`, 2]);
    if (kinds.includes('penguin')) cands.push(['aves', `${isl} dos Pinguins`, 2]);
    if (kinds.includes('turtle')) cands.push(['tartarugas', `${isl} das Tartarugas`, 2]);
    if (kinds.includes('whale')) cands.push(['baleias', `${isl} das Baleias`, 1.4]);
    if (kinds.includes('gull') || kinds.includes('parrot') || kinds.includes('toucan')) cands.push(['aves', `${isl} dos Pássaros`, 1]);
    if (r.temp < 0.2) cands.push(['branca', `${isl} Branca`, 2]);
    if (r.trees > r.n * 0.25) cands.push(['verde', `${isl} Verde`, 1.5]);
    if (r.fert > 0.62 && r.kind !== 'ilhota') cands.push(['boa', r.kind === 'continente' ? 'Terra Boa' : `${isl} Boa`, 1]);
    if (r.rocky > r.n * 0.3) cands.push(['pedra', r.kind === 'ilhota' ? 'Rochedo Pelado' : `${isl} de Pedra`, 1.2]);
    if (ctx.storm) cands.push(['tormenta', `${isl} da Tormenta`, 2.5]);
    if (ctx.dawn) cands.push(['aurora', `${isl} da Aurora`, 1.6]);
    if (ctx.wreck) cands.push(['naufragio', `${isl} do Naufrágio`, 2.5]);
    if (ctx.lost) cands.push(['perdidos', `${isl} dos Perdidos`, 3]);
    if (ctx.who) cands.push(['nome', `${isl} de ${ctx.who}`, ctx.proud ? 2.6 : 1.1]);
    if (ctx.ruler) cands.push(['rei', `${isl} de ${ctx.ruler}`, ctx.royal ? 2.4 : 0.6]);
    if (r.kind === 'continente') cands.push(['grande', 'Terra Grande', 1.5]);
    cands.push(['nova', 'Terra Nova', 0.4]);
    const taken = new Set(used() || []);
    const sc = c => c[2] + G.hash(r.key * 7 + c[1].length) * 0.6;
    cands.sort((a, b) => sc(b) - sc(a));
    for (const [k, nm] of cands) {
      if (taken.has(nm)) continue;
      const tg = TONGUE[f.civ] && TONGUE[f.civ][k];
      return { name: nm, native: tg && !taken.has(tg) ? tg : null };
    }
    let k = 2; while (taken.has(`${isl} Nova ${k}`)) k++;
    return { name: k === 2 ? `${isl} Nova` : `${isl} Nova ${k}`, native: null };
  };
  // the name the god reads (the first people to give one)
  K.name = function (r) { if (!r) return 'uma terra sem nome'; const S = G.S; const nm = S.know && S.know._rn && S.know._rn[r.key]; if (nm) return nm.n; const s = [...S.settlements.values()].find(o => K.at(o.cx, o.cy) === r); return s ? (r.kind === 'continente' ? 'a terra de ' + s.name : 'a ilha de ' + s.name) : r.kind === 'continente' ? 'uma terra grande' : r.kind === 'ilhota' ? 'uma ilhota' : 'uma ilha'; };
  K.named = r => !!(r && G.S.know && G.S.know._rn && G.S.know._rn[r.key]);
  K.giveName = function (r, fid, ctx) {
    const S = G.S; const KN = store(); if (!r || (KN._rn[r.key])) return KN._rn[r && r.key] || null;
    const nm = K.nameFor(r, fid, ctx); KN._rn[r.key] = { n: nm.name, nat: nm.native, by: fid, who: ctx && ctx.whoId || 0, d: S.day };
    used().push(nm.name); if (nm.native) used().push(nm.native);
    return KN._rn[r.key];
  };

  // ------------------------------ the store ------------------------------
  function store() { const S = G.S; return S.know || (S.know = { _rn: {}, _names: [] }); }
  function of(fid) { const KN = store(); return KN[fid] || (KN[fid] = { r: {}, o: {}, f: {}, w: {}, sp: {}, c: {}, n: 0 }); }
  K.of = of;
  K.state = (fid, r) => { if (!r) return UNK; const e = of(fid).r[r.key]; return e ? e.s : UNK; };
  K.knowsOre = (fid, id) => { const e = of(fid).o[id]; return e ? e.s : 0; };
  K.knowsFac = (fid, other) => !!of(fid).f[other];
  K.counts = function (fid) {
    const c = { conhecidas: 0, boatos: 0, desconhecidas: 0, total: 0, mar: 0 };
    for (const r of K.regions()) { if (!K.big(r)) continue; c.total++; const s = K.state(fid, r); if (s >= SIG) c.conhecidas++; else if (s === RUM) c.boatos++; else c.desconhecidas++; }
    c.mar = Object.keys(of(fid).c).length; return c;
  };
  // raise what a people knows of a region (it never forgets on its own: forgetting is for legends)
  K.raise = function (fid, r, st, o) {
    if (!r || !fid) return false; o = o || {}; const S = G.S; const e = of(fid).r[r.key] || (of(fid).r[r.key] = { s: UNK, d: S.day });
    const before = e.s;
    if (st <= e.s && !(o.q && o.q > (e.q || 0))) return false;
    if (st > e.s) { e.s = st; e.d = S.day; e.via = o.via || e.via || ''; if (o.by) e.by = o.by; }
    if (o.q) e.q = Math.max(e.q || 0, o.q);
    if (st >= EXP && !K.named(r) && K.big(r)) K.giveName(r, fid, o.ctx);
    // who else lives there: whoever explores it sees their towns
    if (before < SIG && st >= SIG) of(fid).n++;
    G.Stories && st >= SIG && before < SIG && G.Stories.signal('newIsland', { fac: fid, key: r.key, st, via: o.via, by: o.by || 0, x: r.cx, y: r.cy });
    return st > before;
  };
  K.learnOre = function (fid, o, claim, via) { const e = of(fid).o[o.id]; const s = claim === o.kind ? 2 : 1; if (e && e.s >= s) return false; of(fid).o[o.id] = { s, claim: claim || o.kind, d: G.S.day, via: via || '' }; return true; };
  K.learnSp = function (fid, kind) { const e = of(fid).sp; if (e[kind]) return false; e[kind] = G.S.day; return true; };
  K.cell = (x, y) => Math.floor(y / CELL) * Math.ceil(N / CELL) + Math.floor(x / CELL);

  // ------------------------------ news on the way home ------------------------------
  // a carrier (a ship, a person) holds what it saw until it gets home
  K.note = function (c, item) {
    const nw = c.news || (c.news = []);
    if (item.k === 'c') { const cs = c.cells || (c.cells = []); if (!cs.includes(item.c)) { cs.push(item.c); if (cs.length > 900) cs.shift(); } return; }
    const same = nw.find(q => q.k === item.k && q.id === item.id);
    if (same) { if ((item.s || 0) > (same.s || 0)) Object.assign(same, item); return false; }
    nw.push(item); if (nw.length > 60) nw.shift(); return true;
  };
  K.has = (c, k, id) => !!(c && c.news && c.news.some(q => q.k === k && q.id === id));
  // all the news a carrier holds becomes the people's (returns what was new)
  K.bring = function (c, fid, o) {
    o = o || {}; const S = G.S; const out = { regions: [], ores: [], facs: [], sp: [], wrecks: [], rumors: [] };
    if (!c || !fid) return out;
    const me = of(fid);
    for (const k of c.cells || []) me.c[k] = 1;
    c.cells = [];
    for (const it of c.news || []) {
      if (it.k === 'r') { const r = K.reg(it.id); if (r && K.raise(fid, r, it.s, { via: it.via || o.via, by: it.by, q: it.q, ctx: it.ctx })) out.regions.push({ r, s: it.s }); }
      else if (it.k === 'o') { const ore = (S.ores || []).find(q => q.id === it.id); if (ore && K.learnOre(fid, ore, it.claim, it.via)) out.ores.push({ ore, claim: it.claim }); }
      else if (it.k === 'f') { const f = G.Fac.get(it.id); if (f && f.alive && f.id !== fid && !me.f[f.id]) { me.f[f.id] = { d: S.day, set: it.set || 0, via: it.via || '' }; out.facs.push({ f, set: it.set }); } }
      else if (it.k === 'sp') { if (K.learnSp(fid, it.id)) out.sp.push(it.id); }
      else if (it.k === 'w') { if (!me.w[it.id]) { me.w[it.id] = S.day; out.wrecks.push(it.id); } }
      else if (it.k === 'rm') { const rm = K.rumorById(it.id); if (rm && K.hear(rm, fid, it.conf || rm.conf * 0.8, it.via)) out.rumors.push(rm); }
    }
    c.news = [];
    // peoples seen from the sea: the two now know of each other (a ship that came within sight was seen too)
    for (const q of out.facs) { const f = G.Fac.get(fid); if (f && q.f && G.Fac.rel(f.id, q.f.id) && !G.Fac.rel(f.id, q.f.id).met) G.Politics.meet(f, q.f, { quiet: !!o.quietMeet, via: 'mar' }); of(q.f.id).f[fid] = of(q.f.id).f[fid] || { d: S.day, via: 'avistados' }; }
    return out;
  };
  // two peoples meet (by land, by sea, by an envoy): each tells the other where it lives
  K.met = function (a, b) {
    const S = G.S; of(a).f[b] = of(a).f[b] || { d: S.day, via: 'contato' }; of(b).f[a] = of(b).f[a] || { d: S.day, via: 'contato' };
    for (const [x, y] of [[a, b], [b, a]]) { const c = G.Fac.capitalOf(y); const r = c && K.at(c.cx, c.cy); if (r && K.state(x, r) < RUM) K.raise(x, r, RUM, { via: 'contado pelos emissários' }); }
  };
  // the news a person carries off a sinking ship
  K.share = function (from, to) { for (const it of from.news || []) K.note(to, Object.assign({}, it)); for (const c of from.cells || []) K.note(to, { k: 'c', c }); };

  // ------------------------------ what a ship's crew sees ------------------------------
  // (called every few seconds for every ship with people aboard; cheap: regions are few)
  K.look = function (s, R, cb) {
    const S = G.S; ensure(); const fid = s.fac; if (!fid) return;
    K.note(s, { k: 'c', c: K.cell(s.x, s.y) });
    for (const r of regs) {
      if (!K.big(r)) continue;
      if (Math.abs(r.cx - s.x) > (r.x1 - r.x0) / 2 + R + 2 || Math.abs(r.cy - s.y) > (r.y1 - r.y0) / 2 + R + 2) continue;
      const st = K.state(fid, r); if (st >= SIG) continue;
      if (K.has(s, 'r', r.key)) continue;
      const d = K.distTo(r, s.x, s.y); if (d > R) continue;
      K.note(s, { k: 'r', id: r.key, s: SIG, via: s.exp ? 'expedição' : s.kind === 'pesca' ? 'pescadores' : 'navio', by: s.skipper || 0, d: S.day });
      cb && cb('land', r, d);
    }
    // towns of other peoples, seen from the water (and the people on the shore see the ship)
    for (const set of S.settlements.values()) {
      if (set.fac === fid) continue; const d = G.dist(s.x, s.y, set.cx, set.cy); if (d > R + (set.radius || 8)) continue;
      const of2 = G.Fac.get(set.fac); if (!of2 || !of2.alive) continue;
      const r0 = G.Fac.rel(fid, of2.id); if (r0 && r0.met) continue;
      if (!K.has(s, 'f', of2.id)) { K.note(s, { k: 'f', id: of2.id, set: set.id, via: s.exp ? 'expedição' : 'navio' }); cb && cb('town', set, d); }
      // on the shore: a sail nobody knows
      const seen = of(of2.id); const sk = 'saw' + fid;
      if (!seen[sk]) { seen[sk] = S.day; const f = G.Fac.get(fid); K.rumor({ kind: 'povo', fac: fid, x: s.x, y: s.y, conf: 0.6, claim: `um barco estranho${f && G.CIVS[f.civ] ? ', ' + SAIL[f.civ] : ''}, passou ao largo de ${set.name}`, origin: { what: 'avistado', set: set.id, fac: of2.id }, first: of2.id, quiet: true }); }
    }
  };
  const SAIL = { nordico: 'de vela listrada de vermelho e proa de dragão', grego: 'preto, com um olho pintado na proa', romano: 'de vela vermelha', egipcio: 'alto, de papiro e vela branca', asteca: 'uma canoa comprida cheia de remadores', classico: 'de vela clara' };
  K.SAIL = SAIL;

  // ------------------------------ rumours ------------------------------
  // o: { kind ('terra'|'ferro'|'ouro'|'povo'|'monstro'|'pesqueiro'|'naufragio'), key (region), x, y,
  //      claim (the words that travel), truth ({ok, what}), conf 0..1, origin {who, what, set, fac}, first (people) }
  K.rumor = function (o) {
    const S = G.S; const L = S.rumors || (S.rumors = []);
    // the same tale twice is one tale, told more surely
    const same = L.find(q => !q.dead && q.kind === o.kind && (o.key !== undefined && q.key === o.key) && (q.fac || 0) === (o.fac || 0));
    if (same) { if (o.first && !same.by[o.first]) K.hear(same, o.first, o.conf || 0.5, 'contado'); else if (o.first) same.by[o.first].conf = Math.min(0.95, same.by[o.first].conf + 0.15); return same; }
    const rm = { id: S.nextId++, kind: o.kind, key: o.key === undefined ? null : o.key, x: o.x, y: o.y, fac: o.fac || 0, claim: o.claim || '', truth: o.truth || { ok: true }, conf: o.conf || 0.5, origin: Object.assign({ day: S.day }, o.origin || {}), by: {}, told: 0, d: S.day };
    if (rm.origin.who) { const v = G.person(rm.origin.who); if (v) rm.origin.name = v.name; }
    L.push(rm); if (L.length > 160) L.splice(0, L.length - 160);
    if (o.first) K.hear(rm, o.first, rm.conf, rm.origin.what);
    if (!o.quiet) { const x = o.lx !== undefined ? o.lx : o.x, y = o.ly !== undefined ? o.ly : o.y; if (o.text) log(o.text, 'scroll', x, y); }
    G.Stories && G.Stories.signal('rumor', { id: rm.id, kind: rm.kind, fac: o.first || 0, who: rm.origin.who || 0, x: o.x, y: o.y });
    return rm;
  };
  K.rumorById = id => (G.S.rumors || []).find(q => q.id === id) || null;
  // a people hears a tale (and believes it this much)
  K.hear = function (rm, fid, conf, via) {
    if (!rm || !fid) return false; const e = rm.by[fid];
    if (e) { if (conf > e.conf) e.conf = conf; return false; }
    rm.by[fid] = { d: G.S.day, conf: G.clamp(conf, 0.05, 0.95), via: via || '' }; rm.told++;
    // a tale about land is the first thing anyone knows of it
    const r = rm.key !== null ? K.reg(rm.key) : null; if (r) K.raise(fid, r, RUM, { via: 'boato' });
    return true;
  };
  K.rumorsOf = function (fid, kind) { const out = []; for (const rm of G.S.rumors || []) if (!rm.dead && rm.by[fid] && (!kind || rm.kind === kind)) out.push(rm); return out.sort((a, b) => b.by[fid].conf - a.by[fid].conf); };
  K.belief = (rm, fid) => (rm && rm.by[fid] ? rm.by[fid].conf : 0);
  // an expedition went and saw: the tale is confirmed or exposed (for the people who learn it)
  K.settle = function (rm, fid, ok, txt) { if (!rm) return; const e = rm.by[fid]; if (e) { e.conf = ok ? 0.98 : 0.02; e.end = G.S.day; e.ok = ok; } if (txt) rm.verdict = txt; if (ok === false && Object.values(rm.by).every(q => q.end)) rm.dead = true; };
  // tales travel with the merchants and the envoys — and grow on the way
  const GROW = { ferro: 'ouro', terra: 'terra rica', pesqueiro: 'cardumes sem fim' };
  function spread(dDays) {
    const S = G.S; const L = S.rumors || []; const facs = G.Fac.all();
    for (const rm of L) {
      if (rm.dead) continue;
      for (const fid in rm.by) {
        const e = rm.by[fid]; if (e.end) continue;
        // unconfirmed, a tale fades (unless it keeps being told)
        e.conf = Math.max(0.05, e.conf - dDays * 0.012);
        for (const o of facs) {
          if (o.id === +fid || rm.by[o.id]) continue;
          const r = G.Fac.rel(+fid, o.id); if (!r || !r.met || r.st === 'guerra') continue;
          const p = dDays * (0.04 + Math.min(0.3, (r.trade || 0) * 0.02)) * e.conf;
          if (G.R() < p) {
            K.hear(rm, o.id, e.conf * G.rr(0.55, 0.85), 'mercadores');
            // the tale grows in the telling: dark rock becomes gold, a beach becomes a rich land
            if (G.R() < 0.2 && GROW[rm.kind] && !rm.grown) { rm.grown = 1; rm.claimB = rm.claim; rm.claim = rm.claim + (rm.kind === 'ferro' ? ' — e dizem que tem ouro também' : rm.kind === 'terra' ? ' — dizem que lá a terra dá duas colheitas' : ''); }
          }
        }
      }
    }
  }

  // ------------------------------ what the peoples always knew ------------------------------
  function home(dDays) {
    const S = G.S;
    // the islands we live on are known; those across a narrow channel are seen from the beach
    for (const set of S.settlements.values()) {
      const f = G.Fac.get(set.fac); if (!f || !f.alive) continue; const r = K.at(set.cx, set.cy); if (!r) continue;
      if (K.state(f.id, r) < SET) K.raise(f.id, r, SET, { via: 'lar' });
      if (set._kv !== S.day) {
        set._kv = S.day;
        for (const o of K.regions()) { if (o === r || !K.big(o) || K.state(f.id, o) >= SIG) continue; if (K.distTo(o, set.cx, set.cy) < (set.radius || 8) + 9) K.raise(f.id, o, SIG, { via: 'da praia' }); }
        // the rock around a town is known to its quarrymen and hunters
        for (const ore of S.ores || []) if (!K.knowsOre(f.id, ore.id) && G.dist(ore.x, ore.y, set.cx, set.cy) < 22 && K.at(ore.x, ore.y) === r) K.learnOre(f.id, ore, ore.kind, 'local');
      }
    }
    // people out in the wild come across a vein (they are home by nightfall: local knowledge spreads)
    let n = 0;
    for (const v of S.villagers.values()) {
      if (++n > 400) break; if (v.aboard || v.inside || v.age < 14 || G.R() > 0.15 * dDays * 20) continue;
      const fid = G.Fac.idOfV(v); if (!fid) continue;
      for (const ore of S.ores || []) { if (G.dist2(ore.x, ore.y, v.x, v.y) > 49 || K.knowsOre(fid, ore.id)) continue; if (v.task && v.task.type === 'expl') { const ex = G.Expe && G.Expe.ofV(v); if (ex) { G.Expe.found(ex, v, ore); continue; } } if (K.at(ore.x, ore.y) === K.at(v.x, v.y) && G.Fac.settlementsOf(fid).some(s => K.at(s.cx, s.cy) === K.at(ore.x, ore.y))) K.learnOre(fid, ore, ore.kind, 'caçadores'); }
    }
  }
  // the beasts of home are no news to anyone
  K.seedSpecies = function (fid) {
    const S = G.S; const sets = G.Fac.settlementsOf(fid); if (!sets.length) return;
    const rs = new Set(sets.map(s => K.at(s.cx, s.cy)).filter(Boolean));
    for (const a of S.animals.values()) { if (a.dead) continue; const r = K.at(a.x, a.y); if ((r && rs.has(r)) || sets.some(s => G.dist2(s.cx, s.cy, a.x, a.y) < 900)) K.learnSp(fid, a.kind); }
  };
  // a fresh world (or an old save that never had this): what each people already knew
  K.init = function () {
    const S = G.S; store(); ensure();
    for (const f of G.Fac.all()) {
      const e = of(f.id); if (e._init) continue; e._init = S.day;
      K.seedSpecies(f.id);
      for (const o of G.Fac.all()) { const r = G.Fac.rel(f.id, o.id); if (r && r.met) e.f[o.id] = { d: r.met, via: 'antigo' }; }
    }
    home(0.01);
  };

  // ------------------------------ update ------------------------------
  let tHome = 0, tSpread = 0, tLook = 0;
  G.worldHooks.push(() => { K.reset(); }); // (a new world, or a save loaded: it starts over)
  K.reset = function () { regs = null; tHome = 0; tSpread = 5; tLook = 0; };
  K.update = function (dt) {
    const S = G.S; if (!S.know || !S.know._init) { K.init(); S.know._init = S.day + 1; }
    tHome -= dt; tSpread -= dt; tLook -= dt;
    if (tHome <= 0) { tHome = DAY() * 0.05; home(0.05); for (const f of G.Fac.all()) if (!of(f.id)._init) { of(f.id)._init = S.day; K.seedSpecies(f.id); } }
    if (tSpread <= 0) { tSpread = DAY() * 0.25; spread(0.25); }
    if (tLook <= 0) {
      tLook = 1.5;
      const clear = S.weather.storm > 0 ? 0.45 : S.weather.rain > 0.4 ? 0.7 : 1; const night = G.isNight() ? 0.55 : 1;
      for (const s of S.ships) {
        if (!s.crew || !s.crew.length || s.st === 'idle' || s.st === 'build') continue;
        const R = (s.kind === 'pesca' || s.kind === 'canoa' ? 6 : 9) * clear * night * (s.lookout || 1);
        K.look(s, R, (what, o, d) => G.Expe && G.Expe.onSight(s, what, o, d));
      }
    }
  };

  // ------------------------------ save ------------------------------
  (G.saveHooks = G.saveHooks || []).push({
    save(out) { out.know = G.S.know || null; out.rumors = G.S.rumors || []; },
    load(o) { G.S.know = o.know || null; G.S.rumors = o.rumors || []; K.reset(); },
  });
})(window.G);
