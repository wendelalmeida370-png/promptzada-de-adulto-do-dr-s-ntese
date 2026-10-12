'use strict';
// ============================================================
//  The space of the city. A town is not a ring around its fire:
//  it grows from many places at once — the old hearth, the port,
//  the market where the streets cross, the temple, the palace,
//  the road that comes in from the next town — and what it builds
//  there makes its quarters. Here: the urban cells (what stands
//  on each patch of ground and what that ground is worth), the
//  cores the town grows from, and the quarters that emerge from
//  the cells, each with a name, a birth and a history.
//  Nothing is drawn on the town from outside: the cells are read
//  from its buildings and from the people who live in them.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  const C = 6; let NC = Math.ceil(N / C);
  G.mapHooks.push(n => { N = n; NC = Math.ceil(n / C); });
  const U = G.Urban = {}; U.C = C;
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);

  // ------------------------------ what a quarter can be ------------------------------
  U.KINDS = {
    centro: { name: 'Centro antigo', col: '#e8c26a', what: 'o coração antigo da cidade' },
    mercantil: { name: 'Comércio', col: '#e8903a', what: 'um bairro de comércio' },
    nobre: { name: 'Nobre', col: '#b26ad8', what: 'um bairro nobre' },
    popular: { name: 'Popular', col: '#c8b48a', what: 'um bairro popular' },
    artesao: { name: 'Ofícios', col: '#c8603a', what: 'um bairro de oficinas' },
    porto: { name: 'Porto', col: '#3a8ad8', what: 'um bairro do porto' },
    militar: { name: 'Militar', col: '#b03a3a', what: 'um bairro militar' },
    templo: { name: 'Sagrado', col: '#f0e2a2', what: 'um bairro do templo' },
    agrario: { name: 'Campos', col: '#7aa84a', what: 'um cinturão de campos' },
  };
  // what each building says about the ground it stands on
  const BW = {
    campfire: { centro: 2 }, praca: { centro: 4 }, well: { centro: 0.4 },
    mercado: { mercantil: 7 }, feira: { mercantil: 7 }, taverna: { mercantil: 3 }, coletoria: { mercantil: 1.5, nobre: 1 }, mercado_negro: { mercantil: 1.5 }, ourives: { mercantil: 1.5, artesao: 1.5 },
    palacio: { nobre: 9 }, paco: { nobre: 7 }, grande_palacio: { nobre: 11 }, palacio_colossal: { nobre: 13 }, administracao: { nobre: 4, centro: 1 }, biblioteca: { centro: 2, nobre: 1 }, teatro: { centro: 3 }, banhos: { centro: 2, nobre: 1 },
    temple: { templo: 7 }, monument: { templo: 3 }, maravilha: { templo: 11 }, estatua: { templo: 2 }, cemetery: { templo: 2 },
    workshop: { artesao: 4 }, forja: { artesao: 6 }, tecelagem: { artesao: 5 }, olaria: { artesao: 5 }, acougue: { artesao: 3 }, mina: { artesao: 2 },
    doca: { porto: 9 }, salga: { porto: 5 }, armazem: { porto: 5 },
    quartel: { militar: 7 }, torre: { militar: 1.2 }, estabulo: { militar: 4 }, cercado: { militar: 1 },
    farm: { agrario: 4 }, horta: { popular: 0.2 }, curral: { agrario: 3.5 }, pomar: { agrario: 4 }, plantacao: { agrario: 4 }, vinhedo: { agrario: 4 }, apiario: { agrario: 2 }, salina: { agrario: 2, porto: 1 }, sericultura: { agrario: 1.5, artesao: 1 },
  };
  const CRAFT = { forja: 1, olaria: 1, tecelagem: 1, acougue: 1, workshop: 1, ourives: 1 };
  U.HOMES = { hut: 1, house: 1, sobrado: 1.3, insula: 1.6, quarteirao: 3 };
  // the noise, the smoke and the smell that push the well-off away
  const NUIS = { forja: 1, olaria: 0.8, acougue: 1, curral: 0.8, estabulo: 0.6, mina: 0.7, salga: 0.9, tecelagem: 0.3, cemetery: 0.5, mercado_negro: 0.5, quartel: 0.3 };
  // and what draws them
  const PREST = { praca: 1, mercado: 0.5, palacio: 1.4, paco: 1.2, grande_palacio: 1.6, palacio_colossal: 1.8, temple: 1, teatro: 0.8, banhos: 0.8, biblioteca: 0.7, maravilha: 1.4, monument: 0.6, estatua: 0.6, administracao: 0.6 };
  // the cores a town grows from
  const CORE = { campfire: 'lar', praca: 'praca', mercado: 'mercado', feira: 'mercado', doca: 'porto', temple: 'templo', maravilha: 'templo', palacio: 'poder', paco: 'poder', grande_palacio: 'poder', palacio_colossal: 'poder', administracao: 'poder', quartel: 'armas' };
  U.CORE_NAMES = { lar: 'o velho fogo', praca: 'a praça', mercado: 'o mercado', porto: 'o porto', templo: 'o templo', poder: 'o palácio', armas: 'o quartel', estrada: 'a estrada', portao: 'o portão' };

  // ------------------------------ the snapshot of each town (rebuilt once a day, in the simulation) ------------------------------
  // (derived from the world, never saved: a loaded world rebuilds it on its first day)
  const snap = new Map();
  G.worldHooks.push(() => { snap.clear(); lastDay = -1; cur = 0; townsDay = -1; });
  let lastDay = -1, cur = 0;
  U.peek = setId => snap.get(setId) || null; // (for what only looks: the panels, the labels)
  U.cellOf = (x, y) => Math.floor(y / C) * NC + Math.floor(x / C);
  U.cellXY = c => [(c % NC) * C, Math.floor(c / NC) * C];
  const cellCenter = c => [(c % NC) * C + C / 2, Math.floor(c / NC) * C + C / 2];
  // where two towns touch, a patch of ground goes to the one with more of its buildings there (the same answer for both, all day)
  let townsDay = -1; const cellTowns = new Map();
  function cellOwner(c, sid) {
    const S = G.S;
    if (townsDay !== S.day) {
      townsDay = S.day; cellTowns.clear();
      for (const b of S.buildings.values()) { if (!b.set || b.type === 'ruin') continue; const [bx, by] = G.Village.center(b); const k = U.cellOf(bx, by); let m = cellTowns.get(k); if (!m) { m = new Map(); cellTowns.set(k, m); } m.set(b.set, (m.get(b.set) || 0) + b.w * b.h); }
    }
    const m = cellTowns.get(c); if (!m || m.size < 2) return sid;
    let best = sid, bt = m.get(sid) || 0;
    for (const [id, t] of m) if (t > bt || (t === bt && id < best)) { best = id; bt = t; }
    return best;
  }

  // who lives in each house
  function households() {
    const H = new Map();
    for (const v of G.S.villagers.values()) {
      if (!v.home || v.captive || v.age < 16) continue;
      let h = H.get(v.home); if (!h) { h = { n: 0, nob: 0, mer: 0, art: 0, fish: 0, sac: 0, mil: 0 }; H.set(v.home, h); }
      h.n++; const g = v.grp;
      if (g === 'nobreza') h.nob++; else if (g === 'mercadores') h.mer++; else if (g === 'artesaos') h.art++; else if (g === 'sacerdotes') h.sac++; else if (g === 'militares') h.mil++;
      if (v.role === 'pescador') h.fish++;
    }
    return H;
  }
  // the standing of a household: the grand house, the merchant's, the craftsman's, the fisher's, the plain people's
  U.houseClass = function (b, h) {
    if (!h || !h.n) return 'vazia';
    if (b.elite || h.nob || (b.coin || 0) >= 40) return 'rica';
    if (h.mer * 2 >= h.n) return 'mercador';
    if (h.art * 2 >= h.n) return 'artesao';
    if (h.fish * 2 >= h.n) return 'pescador';
    return 'povo';
  };
  const HOUSEW = { rica: { nobre: 1.8 }, mercador: { mercantil: 1, nobre: 0.4 }, artesao: { artesao: 0.6, popular: 0.6 }, pescador: { porto: 0.7, popular: 0.5 }, povo: { popular: 1.2 }, vazia: { popular: 0.6 } };

  function build(set, bs, H) {
    const S = G.S; const cells = new Map();
    const cell = c => { let o = cells.get(c); if (!o) { o = { c, n: 0, tiles: 0, born: 0, w: {}, homes: 0, beds: 0, res: 0, rich: 0, poor: 0, nuis: 0, prest: 0, coin: 0, types: {} }; cells.set(c, o); } return o; };
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const b of bs) {
      const [bx, by] = G.Village.center(b); const o = cell(U.cellOf(bx, by));
      o.n++; o.tiles += b.w * b.h; o.born += b.born || 0; o.types[b.type] = (o.types[b.type] || 0) + 1;
      x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.w); y1 = Math.max(y1, b.y + b.h);
      const def = G.BDEF[b.type] || {};
      if (!b.built && !b.upgradeFrom) continue; // (a site says what is coming, not yet what is there)
      if (def.housing) {
        const h = H.get(b.id); const k = U.houseClass(b, h); const hw = U.HOMES[b.type] || 1;
        for (const q in HOUSEW[k]) o.w[q] = (o.w[q] || 0) + HOUSEW[k][q] * hw;
        o.homes++; o.beds += def.housing; o.res += h ? h.n : 0; o.coin += b.coin || 0;
        if (k === 'rica') o.rich++; else if (k === 'povo' || k === 'pescador') o.poor++;
      } else { const w = BW[b.type]; if (w) for (const q in w) o.w[q] = (o.w[q] || 0) + w[q]; }
      if (NUIS[b.type]) o.nuis += NUIS[b.type];
      if (PREST[b.type]) o.prest += PREST[b.type];
    }
    for (const c of [...cells.keys()]) if (cellOwner(c, set.id) !== set.id) cells.delete(c);
    // the ground itself: height, water, flood, paving
    const fac = G.Fac.get(set.fac); const wall = G.Siege && G.Siege.wallOf(set.id);
    let hs = 0, hn = 0;
    for (const o of cells.values()) {
      const [cx, cy] = U.cellXY(o.c); let h = 0, n = 0, sea = 0, river = 0, low = 0, paved = 0;
      for (let y = cy; y < cy + C; y++) for (let x = cx; x < cx + C; x++) {
        if (!W.inb(x, y)) continue; const i = y * N + x; const t = S.type[i];
        if (t <= T.SEA) { sea++; continue; }
        if (t === T.RIVER) { river++; continue; }
        const th = W.tileH(i); h += th; n++; if (S.road[i] >= 2) paved++;
      }
      o.h = n ? h / n : 0; o.land = n; o.sea = sea; o.river = river; o.paved = n ? paved / n : 0;
      // ground by a river that sits barely above it floods
      if (river && n) { let wl = 0, k = 0; for (let y = cy; y < cy + C; y++) for (let x = cx; x < cx + C; x++) { if (!W.inb(x, y)) continue; const i = y * N + x; if (S.type[i] === T.RIVER) { wl += S.wl[i]; k++; } } low = k && o.h - wl / k < 0.9 ? 1 : 0; }
      o.flood = low;
      o.walled = !!(wall && wall.done && wall.box && cx + C / 2 >= wall.box[0] && cx + C / 2 <= wall.box[2] && cy + C / 2 >= wall.box[1] && cy + C / 2 <= wall.box[3]);
      if (n) { hs += o.h * n; hn += n; }
    }
    const hCity = hn ? hs / hn : 0;
    const R = Math.max(6, set.radius || 8);
    // what the land is worth: near the palace, the temple and the square, high and dry, by the water,
    // away from the forge, the tannery and the pens; the edge of town is worth less than its heart
    for (const o of cells.values()) {
      let prest = o.prest, nuis = o.nuis;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nb = cells.get(o.c + dx + dy * NC); if (nb && Math.abs((o.c % NC) - (nb.c % NC)) <= 1) { prest += nb.prest * 0.5; nuis += nb.nuis * 0.5; } }
      const [mx, my] = cellCenter(o.c); const dc = G.dist(mx, my, set.cx, set.cy);
      const water = o.sea || o.river ? 1 : 0;
      o.value = Math.round(G.clamp(45 + prest * 6 - nuis * 8 + G.clamp((o.h - hCity) * 5, -10, 14) + water * 6 - o.flood * 12 + o.paved * 16 + (o.walled ? 6 : 0) - G.clamp(dc / R, 0, 1.6) * 18, 0, 100));
      o.prestN = prest; o.nuisN = nuis; o.dc = dc;
      o.age = o.n ? S.day - o.born / o.n : 0;
    }
    // the cores: the old fire, each market and square, the port, the temple, the palace, the barracks,
    // the gates in the wall and the roads that come in from other towns
    const cores = [];
    const cf = S.buildings.get(set.campfire);
    cores.push({ k: 'lar', x: cf ? cf.x + 0.5 : set.cx, y: cf ? cf.y + 0.5 : set.cy, id: cf ? cf.id : 0 });
    for (const b of bs) { const k = CORE[b.type]; if (!k || k === 'lar' || !b.built) continue; const [x, y] = G.Village.center(b); cores.push({ k, x, y, id: b.id }); }
    if (wall && wall.done) for (const i of wall.gates) cores.push({ k: 'portao', x: (i % N) + 0.5, y: ((i / N) | 0) + 0.5, id: 0 });
    const reach = Math.max(8, R * 0.85);
    for (const r of S.routes) {
      if (!r.ok || (r.a !== set.id && r.b !== set.id) || !r.tiles.length) continue;
      const list = r.a === set.id ? r.tiles : r.tiles.slice().reverse();
      for (const i of list) { const x = (i % N) + 0.5, y = ((i / N) | 0) + 0.5; if (G.dist(x, y, set.cx, set.cy) >= reach) { if (!cores.some(c => c.k === 'estrada' && G.dist(c.x, c.y, x, y) < 6)) cores.push({ k: 'estrada', x, y, id: r.id }); break; } }
    }
    // how many homes each core has gathered around it (the town grows a ring around each)
    for (const c of cores) c.homes = 0;
    for (const b of bs) {
      if (!G.BDEF[b.type] || !G.BDEF[b.type].housing) continue;
      const [x, y] = G.Village.center(b); let best = null, bd = 1e9;
      for (const c of cores) { const d = G.dist2(x, y, c.x, c.y); if (d < bd) { bd = d; best = c; } }
      if (best) best.homes++;
    }
    const craft = []; for (const b of bs) if (CRAFT[b.type]) craft.push([b.x + b.w / 2, b.y + b.h / 2]);
    return { day: S.day, set: set.id, cells, cores, craft, hCity, R, box: [x0, y0, x1, y1], civ: fac ? fac.civ : null };
  }

  // ------------------------------ the quarters ------------------------------
  // each cell takes the vocation of what stands in it, softened by its neighbours'; the oldest cells around
  // the hearth are the old town; cells of one vocation that touch make one quarter
  function vocations(set, sn) {
    const S = G.S; const out = new Map(); const { cells } = sn;
    const nbs = c => [c - 1, c + 1, c - NC, c + NC].filter(q => q >= 0 && Math.abs((q % NC) - (c % NC)) <= 1);
    for (const o of cells.values()) {
      if (!o.n) continue;
      const w = Object.assign({}, o.w);
      for (const q of nbs(o.c)) { const nb = cells.get(q); if (nb) for (const k in nb.w) w[k] = (w[k] || 0) + nb.w[k] * 0.3; }
      // (the old town is the hearth and its oldest cells, below; a square elsewhere makes the quarter it stands in, not a second old town)
      let best = null, bw = 0; for (const k in w) if (k !== 'centro' && (w[k] > bw + 1e-9 || (Math.abs(w[k] - bw) <= 1e-9 && best && k < best))) { bw = w[k]; best = k; }
      if (!best && w.centro) { best = 'popular'; bw = w.centro; }
      if (best && bw >= 1) out.set(o.c, best);
    }
    // the old town: the hearth's cell and the oldest cells around it (more of them in a bigger town)
    const lar = sn.cores[0]; const c0 = U.cellOf(lar.x, lar.y);
    if (out.has(c0) || cells.has(c0)) {
      out.set(c0, 'centro');
      const ages = [...cells.values()].filter(o => o.n).map(o => o.age).sort((a, b) => b - a);
      const old = ages[Math.floor(ages.length * 0.35)] || 0;
      const max = 1 + Math.floor((set.tier || 0) * 1.2);
      const seen = new Set([c0]); let q = [c0], n = 1;
      while (q.length && n < max) {
        const nx = [];
        for (const c of q) for (const d of nbs(c)) {
          if (seen.has(d) || n >= max) continue; seen.add(d);
          const o = cells.get(d); const k = out.get(d);
          if (!o || !k || o.age < old || k === 'agrario' || k === 'porto' || k === 'militar' || k === 'templo') continue;
          out.set(d, 'centro'); n++; nx.push(d);
        }
        q = nx;
      }
    }
    return out;
  }
  const MIN = { centro: 1, porto: 1, templo: 1, militar: 2, nobre: 2, mercantil: 1, artesao: 2, popular: 2, agrario: 2 };
  // (and how much of what makes it: a dock, a temple, a market, a few workshops, a street of houses)
  const SUB = { porto: 8, templo: 6, militar: 6, nobre: 5, mercantil: 6, artesao: 7, popular: 6, agrario: 8, informal: 4 };
  function clusters(set, voc, sn) {
    const nbs = c => [c - 1, c + 1, c - NC, c + NC].filter(q => q >= 0 && Math.abs((q % NC) - (c % NC)) <= 1);
    const seen = new Set(); const out = [];
    const cellsSorted = [...voc.keys()].sort((a, b) => a - b);
    for (const c of cellsSorted) {
      if (seen.has(c)) continue; const k = voc.get(c);
      const cl = { k, cells: [] }; const q = [c]; seen.add(c);
      while (q.length) { const x = q.pop(); cl.cells.push(x); for (const d of nbs(x)) if (!seen.has(d) && voc.get(d) === k) { seen.add(d); q.push(d); } }
      cl.cells.sort((a, b) => a - b); out.push(cl);
    }
    // a vila has no quarters yet, only its fields have a name; a city has room for every kind of quarter
    const t = set.tier || 0;
    const has = cl => { let n = 0; for (const c of cl.cells) { const o = sn.cells.get(c); if (o) n += o.w[cl.k] || 0; } return n; };
    const ok = cl => cl.cells.length >= (MIN[cl.k] || 2) && (cl.k === 'centro' || has(cl) >= (SUB[cl.k] || 4)) && (t >= 3 || cl.k === 'agrario');
    // the too small join the neighbour they touch most (in a city only, and never the fields: houses do not become a field)
    const good = out.filter(ok), small = t >= 3 ? out.filter(cl => !ok(cl)) : [];
    const owner = new Map(); for (const cl of good) for (const c of cl.cells) owner.set(c, cl);
    for (const cl of small) {
      const touch = new Map();
      for (const c of cl.cells) for (const d of nbs(c)) { const o = owner.get(d); if (o && o.k !== 'agrario') touch.set(o, (touch.get(o) || 0) + 1); }
      let best = null, bn = 0; for (const [o, n] of touch) if (n > bn || (n === bn && best && o.cells[0] < best.cells[0])) { bn = n; best = o; }
      if (best) { for (const c of cl.cells) { best.cells.push(c); owner.set(c, best); } best.cells.sort((a, b) => a - b); }
    }
    return good;
  }
  // the quarters of a town, with what lives in them now
  U.districtsOf = set => ((set && set.urb && set.urb.d) || []).filter(d => d.cells.length);
  U.allDistrictsOf = set => (set && set.urb && set.urb.d) || [];
  U.districtAt = function (x, y) {
    const c = U.cellOf(x, y);
    for (const s of G.S.settlements.values()) for (const d of U.districtsOf(s)) if (d.cells.includes(c)) return d;
    return null;
  };
  U.byId = function (id) { for (const s of G.S.settlements.values()) for (const d of U.districtsOf(s)) if (d.id === id) return d; return null; };

  // (later modules add kinds of their own: what a building weighs, how such a quarter is named, how its birth is told)
  const NAMEX = {};
  U.addWeight = (type, w) => { BW[type] = w; };
  U.addName = (k, fn) => { NAMEX[k] = fn; MIN[k] = MIN[k] || 1; };
  U.addBirth = (k, fn) => { BIRTH[k] = fn; };
  U.addNear = (type, cores, d) => { NEAR[type] = cores; NEARD[type] = d; };
  // ------------------------------ names ------------------------------
  const DIRS = ['Norte', 'Leste', 'Sul', 'Oeste'];
  const dirOf = (set, x, y) => { const dx = x - set.cx, dy = y - set.cy; return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'Leste' : 'Oeste') : (dy > 0 ? 'Sul' : 'Norte'); };
  const TRADE = { forja: ['Rua dos Ferreiros', 'a'], tecelagem: ['Bairro dos Tecelões', 'o'], olaria: ['Vila dos Oleiros', 'a'], ourives: ['Rua dos Ourives', 'a'], acougue: ['Rua dos Açougueiros', 'a'], mina: ['Vila dos Mineiros', 'a'], workshop: ['Bairro dos Ofícios', 'o'] };
  function nameFor(set, sn, cl, d) {
    const S = G.S; const civ = sn.civ; const cells = cl.cells.map(c => sn.cells.get(c)).filter(Boolean);
    let x = 0, y = 0, h = 0, sea = 0, river = 0; const types = {};
    for (const o of cells) { const [mx, my] = cellCenter(o.c); x += mx; y += my; h += o.h; sea += o.sea; river += o.river; for (const t in o.types) types[t] = (types[t] || 0) + o.types[t]; }
    const n = Math.max(1, cells.length); x /= n; y /= n; h /= n;
    const high = h - sn.hCity > 1.2, low = h - sn.hCity < -0.8;
    const dir = dirOf(set, x, y);
    const has = t => (types[t] || 0) > 0;
    const used = new Set((set.urb.names || []).map(q => q.toLowerCase()));
    const sameKind = U.districtsOf(set).filter(q => q.k === cl.k && q !== d).length;
    let c = null; // [name, article]
    switch (cl.k) {
      case 'centro':
        c = civ === 'grego' && high ? ['Acrópole', 'a'] : civ === 'romano' && has('praca') ? ['Fórum', 'o'] : civ === 'asteca' && has('temple') ? ['Recinto Sagrado', 'o'] : civ === 'nordico' ? ['Burgo Velho', 'o'] : ['Cidade Velha', 'a']; break;
      case 'mercantil':
        c = civ === 'asteca' ? ['Tianguis', 'o'] : civ === 'grego' && has('praca') ? ['Ágora', 'a'] : has('feira') && !has('mercado') ? ['Bairro da Feira', 'o'] : sameKind ? ['Mercado Novo', 'o'] : has('mercado') ? ['Mercado Velho', 'o'] : ['Bairro dos Mercadores', 'o']; break;
      case 'nobre':
        c = high ? (civ === 'romano' ? ['Monte Palatino', 'o'] : ['Colina dos Nobres', 'a']) : has('palacio') || has('paco') || has('grande_palacio') || has('palacio_colossal') ? ['Bairro do Palácio', 'o'] : civ === 'nordico' ? ['Bairro dos Jarls', 'o'] : civ === 'egipcio' ? ['Bairro dos Escribas', 'o'] : civ === 'asteca' ? ['Bairro dos Pipiltin', 'o'] : ['Bairro dos Jardins', 'o']; break;
      case 'popular':
        c = low && river ? ['Várzea', 'a'] : low ? ['Baixada', 'a'] : civ === 'romano' && !sameKind ? ['Subura', 'a'] : civ === 'asteca' ? ['Calpulli do ' + dir, 'o'] : S.day - (set.founded || 0) > 20 && sn.cells.size > 14 && cells.every(o => o.age < 10) ? ['Vila Nova', 'a'] : ['Bairro do ' + dir, 'o']; break;
      case 'artesao': {
        let best = null, bn = 0; for (const t in TRADE) if ((types[t] || 0) > bn) { bn = types[t]; best = t; }
        c = civ === 'grego' && best === 'olaria' ? ['Cerâmico', 'o'] : best ? TRADE[best].slice() : ['Bairro dos Ofícios', 'o']; break;
      }
      case 'porto':
        c = sea ? (civ === 'nordico' ? ['Cais dos Barcos', 'o'] : sameKind ? ['Porto Novo', 'o'] : ['Bairro do Porto', 'o']) : ['Cais do Rio', 'o']; break;
      case 'militar':
        c = civ === 'romano' ? ['Campo de Marte', 'o'] : civ === 'asteca' ? ['Bairro dos Guerreiros-Águia', 'o'] : civ === 'nordico' ? ['Bairro dos Guerreiros', 'o'] : ['Bairro da Guarnição', 'o']; break;
      case 'templo':
        c = civ === 'asteca' ? ['Recinto Sagrado', 'o'] : civ === 'egipcio' ? ['Cidade do Templo', 'a'] : civ === 'nordico' ? ['Bosque Sagrado', 'o'] : high ? ['Colina do Templo', 'a'] : ['Bairro do Templo', 'o']; break;
      case 'agrario': {
        const homes = cells.reduce((n, o) => n + o.homes, 0);
        c = civ === 'asteca' && (river || sea) ? ['Chinampas do ' + dir, 'as'] : civ === 'egipcio' && river ? ['Várzea do Rio', 'a'] : (types.vinhedo || 0) > (types.farm || 0) ? ['Vinhas do ' + dir, 'as'] : (types.pomar || 0) > (types.farm || 0) ? ['Pomares do ' + dir, 'os'] : homes >= 3 ? ['Hortas do ' + dir, 'as'] : ['Campos do ' + dir, 'os']; break;
      }
    }
    if (!c && NAMEX[cl.k]) c = NAMEX[cl.k](set, { civ, high, low, river, sea, dir, has });
    if (!c) c = ['Bairro do ' + dir, 'o'];
    let [nm, g] = c;
    // no two quarters of a town share a name (not even with one that is gone: the old name stays in the old stories)
    if (used.has(nm.toLowerCase())) {
      const cand = [nm + ' do ' + dir].concat(DIRS.map(q => nm + ' do ' + q)).concat([nm + (g === 'a' || g === 'as' ? ' Nova' : ' Novo'), nm + ' de Baixo', nm + ' de Cima']);
      let pick = cand.find(q => !used.has(q.toLowerCase()) && !/ do (Norte|Sul|Leste|Oeste) do /.test(q));
      if (!pick) { let k = 2; while (used.has((nm + ' ' + k).toLowerCase())) k++; pick = nm + ' ' + k; }
      nm = pick;
    }
    return { name: nm, g, x, y };
  }
  U.article = d => (d.g === 'as' ? 'as' : d.g === 'os' ? 'os' : d.g);
  U.theName = d => U.article(d) + ' ' + d.name;
  U.ofName = d => ({ a: 'da', o: 'do', as: 'das', os: 'dos' })[d.g] + ' ' + d.name;
  U.inName = d => ({ a: 'na', o: 'no', as: 'nas', os: 'nos' })[d.g] + ' ' + d.name;

  // ------------------------------ a day in the life of the quarters ------------------------------
  const BIRTH = {
    centro: (s, d) => `O coração antigo de ${s.name} já tem nome: ${U.theName(d)}.`,
    mercantil: (s, d) => `Barracas, balanças e mercadores fizeram um bairro em ${s.name}: ${U.theName(d)}.`,
    nobre: (s, d) => `As casas ricas de ${s.name} formam agora um bairro só delas: ${U.theName(d)}.`,
    popular: (s, d) => `${s.name} cresceu para o ${dirOf(s, d.x, d.y).toLowerCase()}: um bairro de gente simples, ${U.theName(d)}.`,
    artesao: (s, d) => `As oficinas de ${s.name} se juntaram num bairro: ${U.theName(d)}. Fumaça, martelo e aprendizes.`,
    porto: (s, d) => `Em volta do cais de ${s.name} cresceu um bairro do mar: ${U.theName(d)}.`,
    militar: (s, d) => `Em volta do quartel de ${s.name} nasceu ${U.theName(d)}: soldados, cavalos e ferreiros de armas.`,
    templo: (s, d) => `Em volta do templo de ${s.name} se formou ${U.theName(d)}.`,
    agrario: (s, d) => `Os campos em volta de ${s.name} já têm nome: ${U.theName(d)}.`,
  };
  const hist = (d, txt) => { (d.hist || (d.hist = [])).push([G.S.day, txt]); if (d.hist.length > 14) d.hist.splice(1, 1); };
  function newsOK(set) { const u = set.urb; if ((set.tier || 0) < 3) return false; if (G.S.day - (u.news === undefined ? -99 : u.news) < 3) return false; u.news = G.S.day; return true; }
  function updateDistricts(set, sn) {
    const S = G.S; const u = set.urb || (set.urb = { d: [], names: [] });
    if (!u.names) u.names = [];
    const voc = vocations(set, sn); const cls = (set.tier || 0) >= 2 ? clusters(set, voc, sn) : [];
    // each quarter of yesterday takes the cluster of today it overlaps most
    const pairs = [];
    for (const d of u.d) { const mine = new Set(d.cells.length ? d.cells : d.was || []); cls.forEach((cl, j) => { let n = 0; for (const c of cl.cells) if (mine.has(c)) n++; if (n) pairs.push([n, d, j]); }); }
    pairs.sort((a, b) => b[0] - a[0] || a[1].id - b[1].id || a[2] - b[2]);
    const takenD = new Set(), takenC = new Set();
    for (const [, d, j] of pairs) { if (takenD.has(d) || takenC.has(j)) continue; takenD.add(d); takenC.add(j); const cl = cls[j]; d.cells = cl.cells; d.gone = 0; d.was = null;
      if (cl.k !== d.k) { if (d.pend === cl.k) d.pn = (d.pn || 0) + 1; else { d.pend = cl.k; d.pn = 1; } if (d.pn >= 4) changeKind(set, d, cl.k, sn, cl); }
      else { d.pend = null; d.pn = 0; } }
    // quarters that lost all their ground fade away (a fire, a war, a town that shrank)
    for (const d of u.d) if (!takenD.has(d)) { d.gone = (d.gone || 0) + 1; if (d.cells.length) { d.was = d.cells; d.cells = []; } }
    for (const d of u.d.filter(q => q.gone >= 6)) {
      // swallowed by a neighbour (its ground is now another quarter's), or emptied (nothing left on its ground)
      const by = new Map(); let res = 0;
      const lost = d.was || d.cells;
      for (const c of lost) { const o = sn.cells.get(c); if (o) res += o.res; for (const q of u.d) if (q !== d && q.gone === 0 && q.cells.includes(c)) by.set(q, (by.get(q) || 0) + 1); }
      let big = null, bn = 0; for (const [q, n] of by) if (n > bn) { bn = n; big = q; }
      const notable = S.day - d.born >= 6 && (set.tier || 0) >= 3;
      if (big && bn * 2 >= lost.length) { hist(big, `Engoliu ${U.theName(d)}, que tinha nascido no ano ${d.born}.`); if (notable && newsOK(set)) log(`${G.cap(U.theName(big))} cresceu e engoliu ${U.theName(d)}: em ${set.name}, já ninguém sabe onde um acaba e o outro começa.`, 'city', d.x, d.y); }
      else if (notable && res <= 2 && newsOK(set)) log(`${G.cap(U.theName(d))} de ${set.name} deixou de existir: onde havia casas e gente, sobrou pouca coisa.`, 'city', d.x, d.y);
      u.d.splice(u.d.indexOf(d), 1);
    }
    // the clusters nobody claimed are new quarters
    cls.forEach((cl, j) => {
      if (takenC.has(j)) return;
      const d = { id: S.nextId++, set: set.id, k: cl.k, cells: cl.cells, born: S.day, since: S.day, gone: 0, pend: null, pn: 0, peak: 0, hist: [] };
      Object.assign(d, nameFor(set, sn, cl, d)); u.names.push(d.name);
      hist(d, `Nasceu ${KDESC(d.k)}.`);
      u.d.push(d);
      if (newsOK(set)) log(BIRTH[d.k](set, d), 'city', d.x, d.y);
    });
    // what lives in each quarter today
    for (const d of u.d) {
      let res = 0, homes = 0, beds = 0, coin = 0, value = 0, n = 0, rich = 0, poor = 0, x = 0, y = 0, work = 0;
      for (const c of d.cells) { const o = sn.cells.get(c); if (!o) continue; res += o.res; homes += o.homes; beds += o.beds; coin += o.coin; value += o.value; rich += o.rich; poor += o.poor; n++; const [mx, my] = cellCenter(c); x += mx; y += my; for (const t in o.types) if (G.BDEF[t] && G.BDEF[t].jobs) work += o.types[t]; }
      if (n) { d.x = Math.round(x / n * 10) / 10; d.y = Math.round(y / n * 10) / 10; }
      const st = { res, homes, beds, coin: homes ? coin / homes : 0, value: n ? value / n : 0, rich, poor, work };
      Object.defineProperty(d, '_st', { value: st, writable: true, configurable: true, enumerable: false });
      if (res > (d.peak || 0)) d.peak = res;
      // a quarter that loses half its people is noticed once
      if (d.peak >= 10 && res <= d.peak * 0.5 && !d.emptied) { d.emptied = S.day; hist(d, 'Esvaziou: metade da gente foi embora ou morreu.'); if (newsOK(set)) log(`${G.cap(U.theName(d))}, em ${set.name}, esvaziou: as casas estão fechadas e as ruas, quietas.`, 'city', d.x, d.y); }
      else if (d.emptied && res >= d.peak * 0.8) { d.emptied = 0; hist(d, 'A gente voltou: o bairro encheu de novo.'); }
    }
  }
  const KDESC = k => U.KINDS[k].what;
  function changeKind(set, d, k, sn, cl) {
    const from = d.k; d.k = k; d.since = G.S.day; d.pend = null; d.pn = 0;
    const old = d.name;
    // (a young quarter takes a name for what it became; one with years on it keeps the old name, as cities do)
    if (G.S.day - d.born < 15 && sn && cl) { const nn = nameFor(set, sn, cl, d); d.name = nn.name; d.g = nn.g; set.urb.names.push(nn.name); }
    hist(d, `Mudou de vocação: era ${KDESC(from)}, virou ${KDESC(k)}${d.name !== old ? `, e passou a se chamar ${d.name}` : ''}.`);
    if (G.S.day - d.born >= 8 && newsOK(set)) log(`${old}, em ${set.name}, mudou: era ${KDESC(from)} e virou ${KDESC(k)}${d.name !== old ? ` — agora é ${U.theName(d)}` : ''}.`, 'city', d.x, d.y);
  }

  // ------------------------------ the place of each new building ------------------------------
  // (used by the town planner: a score that replaces "so far from the hearth" with "so far from where it belongs")
  const HOMEC = { lar: 1, praca: 0.9, mercado: 0.8, porto: 0.75, poder: 0.6, templo: 0.6, armas: 0.4, estrada: 0.45, portao: 0.4 };
  const NEAR = {
    taverna: ['porto', 'mercado', 'estrada', 'praca'], armazem: ['porto'], storehouse: ['porto', 'mercado', 'lar'], celeiro: ['porto', 'mercado', 'lar'], salga: ['porto'],
    coletoria: ['mercado', 'poder', 'praca'], administracao: ['poder', 'praca', 'lar'], estabulo: ['armas', 'estrada', 'portao'], quartel: ['portao', 'estrada'],
    monument: ['templo', 'praca'], estatua: ['templo', 'praca', 'poder'], biblioteca: ['poder', 'praca', 'templo'], teatro: ['praca', 'mercado'], banhos: ['praca', 'mercado'],
  };
  const NEARD = { taverna: 2.6, armazem: 3.4, storehouse: 3.2, celeiro: 3.6, salga: 3, coletoria: 3, administracao: 3.5, estabulo: 4, quartel: 5, monument: 3, estatua: 2.5, biblioteca: 4, teatro: 5, banhos: 4 };
  const FIELD = { farm: 1, curral: 1, pomar: 1, plantacao: 1, vinhedo: 1, apiario: 1, sericultura: 1 };
  const GRAND = { palacio: 1, paco: 1, grande_palacio: 1, palacio_colossal: 1, temple: 1, maravilha: 1 };
  // the snapshot the planner uses (built today in the simulation, or right now if the town has none yet)
  function sim(set) { let sn = snap.get(set.id); if (!sn) { sn = build(set, townBuildings(set.id), households()); snap.set(set.id, sn); } return sn; }
  U.siteScore = function (set, type, def, x, y, fx, fy, d, ideal) {
    const sn = sim(set); const c = sn.cells.get(U.cellOf(fx, fy));
    const value = c ? c.value : Math.max(0, 40 - d), nuis = c ? c.nuisN : 0, dens = c ? c.tiles / (C * C) : 0;
    const R = Math.max(8, sn.R);
    const near = (ks, dd) => { let bd = 1e9; for (const q of sn.cores) if (ks.includes(q.k)) bd = Math.min(bd, G.dist(fx, fy, q.x, q.y)); return bd < 1e8 ? -Math.abs(bd - dd) * 1.2 : null; };
    if (def.housing) {
      // the ring each core has gathered: a home goes where a ring is still growing
      let best = -1e9;
      for (const q of sn.cores) {
        const w = HOMEC[q.k] || 0.5; const dq = G.dist(fx, fy, q.x, q.y);
        const ring = 2.4 + Math.sqrt(q.homes + 1) * (q.k === 'lar' ? 1.25 : 1.05) * (1 + G.clamp(dq / R - 0.5, 0, 0.6));
        const s = -Math.abs(dq - ring) * 1.2 + (w - 1) * 4;
        if (s > best) best = s;
      }
      // tall houses where land is dear, huts where it is cheap; nobody wants the forge under the window;
      // the old town is dense, the edge of town has room between the houses
      const tall = type === 'sobrado' || type === 'insula' || type === 'quarteirao';
      const want = G.clamp(0.62 - d / R * 0.4, 0.18, 0.62);
      return best + (tall ? value * 0.05 : -value * 0.02) - nuis * (tall ? 1.4 : 0.6) - Math.max(0, dens - want) * 9 - (d > R ? (d - R) * 2 : 0);
    }
    if (type === 'mercado' || type === 'feira') {
      // a market wants the crossing where most feet pass, and no other market next door
      let other = 1e9; for (const q of sn.cores) if (q.k === 'mercado') other = Math.min(other, G.dist(fx, fy, q.x, q.y));
      const cross = U.crossNear(set, fx, fy);
      return -Math.abs(d - ideal) * (other < 1e8 ? 0.25 : 0.9) + cross * 2.2 - (other < 9 ? (9 - other) * 1.5 : 0) + value * 0.02;
    }
    if (NEAR[type]) { const s = near(NEAR[type], NEARD[type]); if (s !== null) return s - (type === 'taverna' ? 0 : -Math.abs(d - ideal) * 0.25) + (type === 'quartel' ? 0 : value * 0.01); }
    if (CRAFT[type]) {
      // workshops gather where the other workshops are (and the water is), on cheap land away from the grand houses
      let bd = 1e9; for (const [cx, cy] of sn.craft) bd = Math.min(bd, G.dist(fx, fy, cx, cy));
      const river = c && (c.river || c.sea) ? 1.5 : 0;
      return (bd < 1e8 ? -Math.abs(bd - 2.6) * 0.9 : 0) - Math.abs(d - ideal) * (bd < 1e8 ? 0.35 : 1.2) - (c ? c.prestN : 0) * 1.5 - value * 0.02 + river;
    }
    if (GRAND[type]) return -Math.abs(d - ideal) * 1.2 + (c ? G.clamp((c.h - sn.hCity) * 1.2, -2, 4) : 0) - nuis * 2 + value * 0.02;
    if (FIELD[type]) return -Math.abs(d - ideal) * 1.2 - (c && c.homes ? value * 0.04 : 0);
    if (type === 'mercado_negro') return -Math.abs(d - Math.max(ideal, R * 0.8)) * 1.0 - value * 0.04 + (near(['porto'], 3) || 0) * 0.3;
    return -Math.abs(d - ideal) * 1.2;
  };
  // tall where the land is dear: a city builds up in its heart and low at its edge, where a family
  // gets a house with a yard for the same stone (the planner asked for the tallest it can afford)
  const DEAR = { quarteirao: 62, insula: 52, sobrado: 40 };
  const LOWER = { quarteirao: 'insula', insula: 'sobrado', sobrado: 'house' };
  U.valueAt = function (set, x, y) { const sn = sim(set); const c = sn.cells.get(U.cellOf(x, y)); return c ? c.value : 30; };
  U.homeFor = function (set, type, pos) {
    if (!DEAR[type] || (set.tier || 0) < 2) return type;
    const def = G.BDEF[type]; const v = U.valueAt(set, pos[0] + def.w / 2, pos[1] + def.h / 2);
    let t = type; while (DEAR[t] && v < DEAR[t]) t = LOWER[t];
    return t;
  };
  U.dearEnough = (set, b, to) => !DEAR[to] || (set.tier || 0) < 2 || U.valueAt(set, b.x + b.w / 2, b.y + b.h / 2) >= DEAR[to];
  // how far a town looks for room: grows with its people, further in a real city
  U.radius = function (set, def, pop) {
    const t = set.tier || 0; const big = def.w >= 3 ? 2 : 0;
    if (t < 3) return Math.min(17 + t * 3 + big, Math.round(6 + Math.sqrt(pop + 1) * 1.5 + big));
    return Math.min(19 + t * 4 + big, Math.round(6 + Math.sqrt(pop + 1) * 1.75 + big));
  };
  // a crossing of streets near (x, y), weighted by the feet that pass there
  U.crossNear = function (set, x, y) {
    const sn = snap.get(set.id); const X = sn && sn.cross; if (!X || !X.length) return 0;
    let best = 0; for (const [i, w] of X) { const d = G.dist(x, y, (i % N) + 0.5, ((i / N) | 0) + 0.5); if (d < 3.5) best = Math.max(best, w * (1 - d / 3.5)); }
    return best;
  };
  function crossings(set) {
    const S = G.S; const p = G.City && G.City.streetPlan(set); if (!p) return [];
    const out = [];
    for (const i of p) {
      const x = i % N; let n = 0;
      if (x > 0 && p.has(i - 1)) n++; if (x < N - 1 && p.has(i + 1)) n++; if (p.has(i - N)) n++; if (p.has(i + N)) n++;
      if (n >= 3) out.push([i, G.clamp(0.4 + (S.wear[i] || 0) / 40, 0.4, 1.6)]);
    }
    out.sort((a, b) => b[1] - a[1] || a[0] - b[0]);
    return out.slice(0, 40);
  }

  // ------------------------------ the avenues ------------------------------
  // the cores the planner and the streets grow from (today's snapshot)
  U.cores = set => sim(set).cores;
  // the way from the hearth to a core, around the houses: the shortest walk over open ground, preferring
  // the streets already there and the paths people already wear (a small A* over the town's box)
  U.avenue = function (set, ax, ay, bx, by, free) {
    const S = G.S; const m = 6;
    const X0 = Math.max(1, Math.floor(Math.min(ax, bx)) - m), Y0 = Math.max(1, Math.floor(Math.min(ay, by)) - m);
    const X1 = Math.min(N - 2, Math.floor(Math.max(ax, bx)) + m), Y1 = Math.min(N - 2, Math.floor(Math.max(ay, by)) + m);
    const w = X1 - X0 + 1, h = Y1 - Y0 + 1; if (w * h > 9000) return null;
    const sx = G.clamp(Math.floor(ax), X0, X1) - X0, sy = G.clamp(Math.floor(ay), Y0, Y1) - Y0, tx = G.clamp(Math.floor(bx), X0, X1) - X0, ty = G.clamp(Math.floor(by), Y0, Y1) - Y0;
    const ok = k => { const i = (Y0 + ((k / w) | 0)) * N + X0 + (k % w); const t = S.type[i]; if (t < T.RIVER) return false; if (t === T.RIVER && S.road[i] < 3) return false; return free(i); };
    const cost = k => { const i = (Y0 + ((k / w) | 0)) * N + X0 + (k % w); return S.road[i] ? 0.55 : 1 - Math.min(0.3, (S.wear[i] || 0) / 80); };
    const g = new Float32Array(w * h).fill(1e9), from = new Int32Array(w * h).fill(-1);
    const heap = []; const push = (f, k) => { heap.push([f, k]); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] < heap[i][0] || (heap[p][0] === heap[i][0] && heap[p][1] <= heap[i][1])) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = i * 2 + 1, r = l + 1; let s = i; const lt = (a, b) => heap[a][0] < heap[b][0] || (heap[a][0] === heap[b][0] && heap[a][1] < heap[b][1]); if (l < heap.length && lt(l, s)) s = l; if (r < heap.length && lt(r, s)) s = r; if (s === i) break; [heap[s], heap[i]] = [heap[i], heap[s]]; i = s; } } return top; };
    const s0 = sy * w + sx, t0 = ty * w + tx; g[s0] = 0; push(Math.abs(tx - sx) + Math.abs(ty - sy), s0);
    let found = false, n = 0;
    while (heap.length && n++ < 20000) {
      const [, k] = pop(); if (k === t0) { found = true; break; }
      const kx = k % w, ky = (k / w) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = kx + dx, ny = ky + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const q = ny * w + nx; if (q !== t0 && !ok(q)) continue;
        const ng = g[k] + cost(q) + (from[k] >= 0 && (k - from[k]) !== (q - k) ? 0.35 : 0); // (straight streets: a turn costs a little)
        if (ng < g[q] - 1e-6) { g[q] = ng; from[q] = k; push(ng + Math.abs(tx - nx) + Math.abs(ty - ny), q); }
      }
    }
    if (!found) return null;
    const out = []; for (let k = t0; k >= 0; k = from[k]) out.push((Y0 + ((k / w) | 0)) * N + X0 + (k % w));
    return out.length > 1 ? out : null;
  };
  // the avenues of a town: the way from its hearth to each core (traced again only when its cores change, or every few days)
  U.avenues = function (set, cx, cy, free) {
    const S = G.S; const cores = U.cores(set).filter(q => q.k !== 'lar');
    const key = cx + ',' + cy + ':' + cores.map(q => q.k + (q.id || 0)).join(',');
    const c = set._av;
    if (c && c.key === key && S.day - c.day < 6) return c.tiles;
    const tiles = [];
    for (const q of cores) { const [ex, ey] = U.coreDoor(q); const path = U.avenue(set, cx + 0.5, cy + 0.5, ex, ey, free); if (path) for (const i of path) tiles.push(i); }
    // (a cache of the simulation, not part of the save: kept out of JSON)
    Object.defineProperty(set, '_av', { value: { key, day: S.day, tiles }, writable: true, configurable: true, enumerable: false });
    return tiles;
  };
  // where an avenue ends at a core: the door of its building, or the point itself
  U.coreDoor = function (q) { const b = q.id && G.S.buildings.get(q.id); if (b && b.type !== 'praca' && b.type !== 'feira') return G.Vg.door(b); return [q.x, q.y]; };

  // ------------------------------ the gardens of the edge of town ------------------------------
  // where a town has room between its houses, a family digs a garden by the door: cabbages, beans, herbs.
  // They tend it at the end of the day and eat what it gives; when the town thickens around it, the yard is lost.
  Object.assign(G.BDEF, { horta: { name: 'Horta', w: 1, h: 1, cost: {}, work: 4, blocks: false, hp: 30, field: 1 } });
  G.BDESC.horta = 'A horta do quintal: couves, feijão, ervas. A família cuida dela no fim do dia e come o que ela dá.';
  const GARDENABLE = { hut: 1, house: 1, sobrado: 1 };
  const oldDestroy = G.Village.destroyBuilding;
  G.Village.destroyBuilding = function (b, cause) { if (b && b.type === 'horta') return G.Village.removeBuilding(b); return oldDestroy(b, cause); };
  function gardens(set, sn, bs) {
    const S = G.S; const list = bs.filter(b => b.type === 'horta'); const byHome = new Map();
    // the yards the town has kept, and the ones it lost
    for (const b of list) {
      const h = S.buildings.get(b.home); const o = sn.cells.get(U.cellOf(b.x + 0.5, b.y + 0.5));
      const i = b.y * N + b.x;
      if (!h || h.type === 'ruin' || !G.BDEF[h.type].housing || h.set !== set.id || S.wall[i] || (o && o.tiles / (C * C) > 0.55) || byHome.has(b.home)) { G.Village.removeBuilding(b); continue; }
      byHome.set(b.home, b.id);
      // a garden tended in the last day and a half grows; one left alone goes to weeds
      const fert = S.fert[i] || 0.4; const dry = S.weather.drought > 0 ? 0.4 : 1;
      const tended = S.clock - (b.tend === undefined ? -1e9 : b.tend) < G.DAY_LEN * 1.5;
      b.g = G.clamp((b.g || 0) + (tended ? 0.34 * (0.5 + fert) * dry : -0.1), 0, 1);
      b.v = b.g < 0.15 ? 0 : b.g < 0.5 ? 1 : b.g < 1 ? 2 : 3;
    }
    sn.gardens = byHome;
    if ((set.tier || 0) < 2) return;
    // new yards: a house at the airy edge of town, with grown-ups at home and good ground by its side
    const H = households(); let made = 0;
    // (the edge of town: as far out as the houses go, not the edge of the land it claims)
    let far = 0; for (const h of bs) if (GARDENABLE[h.type] || (G.BDEF[h.type] && G.BDEF[h.type].housing)) far = Math.max(far, G.dist(h.x + 0.5, h.y + 0.5, set.cx, set.cy));
    for (const h of bs) {
      if (made >= 2) break;
      if (!GARDENABLE[h.type] || !h.built || byHome.has(h.id)) continue;
      const hh = H.get(h.id); if (!hh || !hh.n) continue;
      const o = sn.cells.get(U.cellOf(h.x + 0.5, h.y + 0.5)); if (!o || o.tiles / (C * C) > 0.32) continue;
      if (G.dist(h.x + 0.5, h.y + 0.5, set.cx, set.cy) < far * 0.45) continue;
      let best = null, bf = 0.12;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
        const x = h.x + dx, y = h.y + dy; if (!W.inb(x, y) || x < 2 || y < 2 || x >= N - 2 || y >= N - 2) continue;
        const i = y * N + x; const t = S.type[i];
        if ((t !== T.GRASS && t !== T.MEADOW) || S.occ[i] || S.objAt[i] || S.treeAt[i] || S.road[i] || S.wall[i] || S.fire[i] > 0 || (G.City && G.City.onStreet(set, i))) continue;
        if (W.slope(x, y, 1, 1) > 1) continue;
        // (never closing the way: the tile must keep a walkable neighbour besides the house)
        let open = 0; for (const [ex, ey] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const j = (y + ey) * N + x + ex; const ob = S.occ[j] && S.buildings.get(S.occ[j]); if (W.walkable(j) && !(ob && ob.blocks)) open++; }
        if (open < 2) continue;
        if (S.fert[i] > bf) { bf = S.fert[i]; best = [x, y]; }
      }
      if (!best) continue;
      const b = G.Village.addBuilding('horta', best[0], best[1], set.id, true);
      b.home = h.id; b.g = 0; b.v = 0; b.tend = S.clock; byHome.set(h.id, b.id); made++;
    }
  }
  // at the end of the day, someone of the house goes to the garden: to weed and water, or to pick what is ripe
  U.gardenTask = function (v, H) {
    if (!v.home || v.age < 12 || v.captive) return null;
    const S = G.S; const sn = snap.get(v.set); const gid = sn && sn.gardens && sn.gardens.get(v.home);
    const b = gid && S.buildings.get(gid); if (!b || b.type !== 'horta' || b.home !== v.home) return null;
    if (!((b.g || 0) >= 1 || S.clock - (b.tend === undefined ? -1e9 : b.tend) > G.DAY_LEN * 0.45)) return null;
    return H.setTask(v, { type: 'horta', id: b.id, pri: 0.45, st: 0 });
  };
  U.gardenDue = function (v) { const S = G.S; const sn = snap.get(v.set); const gid = sn && sn.gardens && sn.gardens.get(v.home); const b = gid && S.buildings.get(gid); return !!(b && b.type === 'horta' && ((b.g || 0) >= 1 || S.clock - (b.tend === undefined ? -1e9 : b.tend) > G.DAY_LEN * 0.45)); };
  U.run = function (v, t, dt, H) {
    if (t.type !== 'horta') return false;
    const S = G.S; const b = S.buildings.get(t.id);
    if (!b || b.type !== 'horta') { H.end(v); return true; }
    const x = b.x + 0.5, y = b.y + 0.5;
    if (t.st === 0) { if (!H.goto(v, x + G.rr(-0.22, 0.22), y + G.rr(-0.22, 0.22), false, 4000)) { H.end(v); return true; } t.st = 1; t.walk = 0; return true; }
    if (t.st === 1) { t.walk += dt; if (H.move(v, dt)) { t.st = 2; v.actT = 0; t.ripe = (b.g || 0) >= 1; } else if (t.walk > 60) H.end(v); return true; }
    G.faceTo(v, x - v.x, y - v.y);
    v.act = t.ripe ? 'harvest' : (v.actT % 6 < 3 ? 'dig' : 'plant');
    if (v.actT > (t.ripe ? 7 : 10)) {
      if (t.ripe && (b.g || 0) >= 1) {
        const h = S.buildings.get(b.home); const n = 3 + Math.round((S.fert[b.y * N + b.x] || 0.5) * 2);
        if (h) h.pantry = (h.pantry || 0) + n;
        b.g = 0.05; b.v = 0; b.picked = (b.picked || 0) + 1; b.yield = (b.yield || 0) + n;
        G.FX && G.FX.chips(x, y, '#6aa84a'); G.Vg.emote(v, 'happy', 1.4);
      }
      b.tend = S.clock; H.end(v);
    }
    return true;
  };
  U.taskText = (v, t) => (t.type === 'horta' ? (t.ripe ? 'Colhendo a horta do quintal' : 'Cuidando da horta do quintal') : null);
  // the garden on the ground: dug earth in rows, then sprouts, leaves, and the ripe heads
  G.renderHooks = G.renderHooks || { ground: [], ents: [] };
  G.renderHooks.ground.push(function (ctx, proj, view, t, nightF, diamond) {
    const S = G.S;
    for (const b of S.buildings.values()) {
      if (b.type !== 'horta') continue;
      const p = proj(b.x + 0.5, b.y + 0.5, W.hAt(b.x + 0.5, b.y + 0.5)); if (p[0] < view[0] - 30 || p[0] > view[2] + 30 || p[1] < view[1] - 30 || p[1] > view[3] + 30) continue;
      ctx.fillStyle = S.burnt[b.y * N + b.x] > 0 ? '#4a3e34' : '#7a5a3a'; diamond(b.x + 0.08, b.y + 0.08, b.x + 0.92, b.y + 0.92, 0.02); ctx.fill();
      ctx.strokeStyle = 'rgba(60,40,22,0.55)'; ctx.lineWidth = 0.5; ctx.beginPath();
      for (let r = 1; r < 4; r++) { const a = proj(b.x + 0.14, b.y + r / 4, W.hAt(b.x + 0.14, b.y + r / 4) + 0.02), c = proj(b.x + 0.86, b.y + r / 4, W.hAt(b.x + 0.86, b.y + r / 4) + 0.02); ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]); }
      ctx.stroke();
      const g = b.g || 0; if (g < 0.12) continue;
      const sz = 0.5 + Math.min(1, g) * 1.3;
      for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) {
        const px = b.x + 0.22 + q * 0.28, py = b.y + 0.24 + r * 0.26; const pp = proj(px, py, W.hAt(px, py) + 0.04);
        const k = (r * 3 + q + b.id) % 3;
        ctx.fillStyle = g >= 1 ? (k === 0 ? '#8ac850' : k === 1 ? '#c8503a' : '#6aa84a') : k === 1 ? '#5a9a3a' : '#78b84a';
        ctx.beginPath(); ctx.ellipse(pp[0], pp[1] - sz * 0.6, sz * 1.2, sz * 0.75, 0, 0, Math.PI * 2); ctx.fill();
      }
    }
  });

  // ------------------------------ update ------------------------------
  function townBuildings(setId) { const list = []; for (const b of G.S.buildings.values()) if (b.set === setId && b.type !== 'ruin') list.push(b); return list; }
  U.update = function () {
    const S = G.S; if (!S) return;
    if (S.day !== lastDay) { lastDay = S.day; cur = 0; }
    // one town per step, until every town had its day
    const sets = [...S.settlements.values()].sort((a, b) => a.id - b.id);
    while (cur < sets.length) {
      const set = sets[cur++];
      const old = snap.get(set.id); if (old && old.day === S.day) continue;
      const H = households();
      const sn = build(set, townBuildings(set.id), H);
      snap.set(set.id, sn);
      sn.cross = (set.tier || 0) >= 2 ? crossings(set) : [];
      gardens(set, sn, townBuildings(set.id));
      if ((set.tier || 0) >= 2 || (set.urb && set.urb.d.length)) updateDistricts(set, sn);
      break;
    }
    for (const id of [...snap.keys()]) if (!S.settlements.has(id)) snap.delete(id);
  };

  // ------------------------------ for the eyes ------------------------------
  U.stats = d => d._st || null;
  U.kindName = k => (U.KINDS[k] || {}).name || k;
  // a quarter selected in the inspector
  U.owns = o => !!(o && (o.urbD || o.urbS));
  U.select = d => { if (!d) return null; return { urbD: d.id, set: d.set, x: d.x, y: d.y, id: -d.id }; };
  U.selectCity = s => (s ? { urbS: s.id, set: s.id, x: s.cx, y: s.cy, id: -s.id - 1e6 } : null);
  // the whole town at a glance: its quarters, its people, its roofs, its streets at night
  function cityHTML(o, esc) {
    const S = G.S; const s = S.settlements.get(o.urbS); if (!s) { G.UI.select(null); return ''; }
    const f = G.Fac.get(s.fac); const sn = snap.get(s.id);
    const vs = [...S.villagers.values()].filter(v => v.set === s.id && !v.captive);
    const B = [...S.buildings.values()].filter(b => b.set === s.id);
    const n = t => B.filter(b => b.type === t && b.built).length;
    const ds = U.districtsOf(s).slice().sort((a, b) => ((b._st || {}).res || 0) - ((a._st || {}).res || 0));
    const homeless = vs.filter(v => v.age >= 16 && !v.home);
    const why = {}; for (const v of homeless) { const w = G.Social ? G.Social.whyText(v) || 'sem lugar' : 'sem lugar'; why[w] = (why[w] || 0) + 1; }
    const shack = vs.filter(v => v.home && (S.buildings.get(v.home) || {}).type === 'barraco').length;
    const crimes = (S.crimes || []).filter(c => c.set === s.id && S.day - c.day <= 10);
    const jailed = vs.filter(v => v.jail).length; const watch = vs.filter(v => v.role === 'vigia').length;
    let coin = 0, homes = 0; for (const b of B) if (G.BDEF[b.type] && G.BDEF[b.type].housing && b.built) { homes++; coin += b.coin || 0; }
    const val = sn ? [...sn.cells.values()].filter(c => c.n) : []; const avgV = val.length ? val.reduce((a, c) => a + c.value, 0) / val.length : 0;
    const crates = B.filter(b => b.type === 'doca').reduce((a, b) => a + (b.crates || []).length, 0);
    const yards = B.filter(b => b.type === 'horta'); const picks = yards.reduce((a, b) => a + (b.picked || 0), 0);
    const served = B.filter(b => b.type === 'taverna').reduce((a, b) => a + (b.served || 0), 0);
    const rows = [
      ['Gente', `${vs.length} pessoas em ${homes} casas${n('barraco') ? ` e ${n('barraco')} barracos` : ''}`],
      ['Riqueza', homes ? `${Math.round(coin / homes)} moedas por casa, em média` : '—'],
      ['Terra', val.length ? `vale ${Math.round(avgV)} de 100 em média (V no teclado mostra o mapa)` : '—'],
      ['Sem teto', homeless.length ? `${homeless.length}: ${Object.entries(why).map(([w, k]) => `${k} — ${w}`).join('; ')}` : 'ninguém dorme na rua'],
      ['Barracos', shack ? `${shack} pessoas moram em barracos` : 'nenhum'],
      ['Quintais', yards.length ? `${yards.length} horta${yards.length > 1 ? 's' : ''} nas casas da borda${picks ? `, ${picks} colheita${picks > 1 ? 's' : ''} até agora` : ''}` : 'nenhuma horta'],
      ['Porto', n('doca') ? `${n('doca')} doca${n('doca') > 1 ? 's' : ''}, ${n('armazem')} armazé${n('armazem') === 1 ? 'm' : 'ns'}${crates ? `, ${crates} caixas esperando no cais` : ''}` : 'sem porto'],
      ['Noite', `${n('taverna')} taverna${n('taverna') === 1 ? '' : 's'}${G.Tavern && f ? ` (bebe-se ${G.Tavern.NAME[(G.Tavern.DRINK[f.civ || 'classico'] || G.Tavern.DRINK.classico).k][0]})` : ''}${served ? `, ${served} ${served === 1 ? 'dose servida' : 'doses servidas'}` : ''}`],
      ['Ordem', `${crimes.length ? `${crimes.length} roubo${crimes.length > 1 ? 's' : ''} nos últimos anos (${crimes.filter(c => c.st !== 'aberto').length} resolvidos)` : 'nenhum roubo recente'}${n('cadeia') ? ` · cadeia com ${jailed} preso${jailed === 1 ? '' : 's'}` : ''}${watch ? ` · ${watch} vigia${watch > 1 ? 's' : ''} na ronda da noite` : ''}`],
    ];
    return `<div class="insp-head"><div class="insp-title"><h3>${esc(s.name)}</h3><div class="sub">${esc(G.City.tierName(s))}${f ? ' · ' + esc(f.name) : ''}${f && G.Fac.capitalOf(f.id) === s ? ' · capital' : ''}</div></div><button class="x" data-act="close">✕</button></div>
      <div class="food-chain">${rows.map(([a, b]) => `<div><span>${a}</span>${esc(b)}</div>`).join('')}</div>
      ${ds.length ? `<div class="family"><div>Bairros (${ds.length}):</div><div>${ds.map(d => `<a data-act="urb" data-id="${d.id}" style="border-bottom:1px solid ${(U.KINDS[d.k] || {}).col}">${esc(d.name)}</a> <span class="muted">${esc(U.kindName(d.k).toLowerCase())}, ${(d._st || {}).res || 0}</span>`).join(' · ')}</div></div>` : `<div class="meta">${(s.tier || 0) >= 3 ? 'Os bairros ainda estão se formando.' : 'Ainda não é cidade: os bairros nascem quando ela for.'}</div>`}
      <div class="btns"><button data-act="urbgo">Ir até lá</button></div>`;
  }
  U.inspectorHTML = function (o, esc) {
    if (o.urbS) return cityHTML(o, esc);
    const S = G.S; const d = U.byId(o.urbD); const set = d && S.settlements.get(d.set);
    if (!d || !set) { G.UI.select(null); return ''; }
    const st = d._st || {}; const K = U.KINDS[d.k];
    const pend = d.pend && d.pend !== d.k ? `<div class="meta">Mudando: está virando ${esc(KDESC(d.pend))}.</div>` : '';
    const wealth = st.coin >= 30 ? 'rico' : st.coin >= 10 ? 'remediado' : st.homes ? 'pobre' : '—';
    const age = S.day - d.born;
    const rows = [
      ['Vocação', `<b style="color:${K.col}">${esc(K.name)}</b> — ${esc(K.what)}`],
      ['Gente', `${st.res || 0} moradores em ${st.homes || 0} casas${st.beds ? ` (${st.beds} camas)` : ''}${d.peak > (st.res || 0) ? ` · já foram ${d.peak}` : ''}`],
      ['Riqueza', `${wealth}${st.homes ? ` · ${Math.round(st.coin)} moedas por casa` : ''}${st.rich ? ` · ${st.rich} casas ricas` : ''}${st.poor ? ` · ${st.poor} casas pobres` : ''}`],
      ['Terra', `vale ${Math.round(st.value || 0)} de 100`],
      ['Trabalho', st.work ? `${st.work} oficinas, lojas ou serviços` : 'quase só moradia'],
      ['Idade', `nasceu no ano ${d.born} (${age} ${age === 1 ? 'ano' : 'anos'})`],
    ];
    return `<div class="insp-head"><div class="insp-title"><h3>${esc(G.cap(d.name))}</h3><div class="sub">bairro de ${esc(set.name)} · ${esc(G.City.tierName(set).toLowerCase())}</div></div><button class="x" data-act="close">✕</button></div>
      <div class="food-chain">${rows.map(([a, b]) => `<div><span>${a}</span>${b}</div>`).join('')}</div>${pend}
      ${d.hist && d.hist.length ? `<div class="family"><div>História:</div><div>${d.hist.slice().reverse().map(([day, t]) => `<div class="muted">ano ${day} · ${esc(t)}</div>`).join('')}</div></div>` : ''}
      <div class="btns"><button data-act="urbgo">Ir até lá</button></div>`;
  };
})(window.G);
