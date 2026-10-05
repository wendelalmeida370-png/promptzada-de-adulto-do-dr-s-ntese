'use strict';
// ============================================================
//  Factions: peoples/kingdoms with their own stockpile, colour,
//  banner, capital, territory and relations
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const F = G.Fac = {};

  F.COLORS = [
    { name: 'Âmbar', hex: '#e9b43c' }, { name: 'Azul', hex: '#3f7fd8' }, { name: 'Carmim', hex: '#d6413b' }, { name: 'Violeta', hex: '#9457d6' },
    { name: 'Jade', hex: '#2fae8f' }, { name: 'Laranja', hex: '#e8792e' }, { name: 'Rosa', hex: '#d6589e' }, { name: 'Marfim', hex: '#ece5d2' },
    { name: 'Oliva', hex: '#93a33c' }, { name: 'Ciano', hex: '#3ab7d8' }, { name: 'Vinho', hex: '#8e2f4f' }, { name: 'Ocre', hex: '#b88a3a' },
  ];
  F.SYMBOLS = ['sol', 'lua', 'arvore', 'onda', 'montanha', 'olho', 'estrela', 'chama', 'lobo', 'coroa'];
  F.PEOPLE_NAMES = ['Povo da Chama', 'Clã do Rio', 'Tribo do Vento', 'Clã da Pedra', 'Casa dos Pinheiros', 'Povo do Vale',
    'Clã das Marés', 'Irmandade da Aurora', 'Clã do Lobo', 'Povo do Sol', 'Gente da Névoa', 'Tribo do Trovão'];
  // grammatical gender of a people's name ("a Tribo", "o Clã")
  F.oa = f => (f && /^(Tribo|Casa|Irmandade|Gente|Pólis|Liga|Gens|República)/.test(f.name) ? 'a' : 'o');

  F.get = id => G.S.factions.get(id);
  F.all = () => [...G.S.factions.values()].filter(f => f.alive);
  F.ofSet = setId => { const s = G.S.settlements.get(setId); return s ? G.S.factions.get(s.fac) : null; };
  F.ofV = v => F.ofSet(v.set);
  F.idOfV = v => { const s = G.S.settlements.get(v.set); return s ? s.fac : 0; };
  F.stockOfSet = setId => { const f = F.ofSet(setId); return f ? f.stock : F._nullStock; };
  F.stockV = v => F.stockOfSet(v.set);
  F._nullStock = { food: 0, wood: 0, stone: 0 };
  F.hex = fid => { const f = F.get(fid); return f ? F.COLORS[f.ci % F.COLORS.length].hex : '#999999'; };
  F.settlementsOf = fid => [...G.S.settlements.values()].filter(s => s.fac === fid);
  F.captives = fid => { let n = 0; for (const v of G.S.villagers.values()) if (v.captive && F.idOfV(v) === fid) n++; return n; };
  F.pop = fid => { let n = 0; for (const v of G.S.villagers.values()) { if (v.captive) continue; const s = G.S.settlements.get(v.set); if (s && s.fac === fid) n++; } return n; };
  F.has = (fid, type) => { for (const b of G.S.buildings.values()) if (b.type === type && b.built) { const s = G.S.settlements.get(b.set); if (s && s.fac === fid) return true; } return false; };

  F.create = function (o) {
    const S = G.S;
    const used = new Set([...S.factions.values()].filter(f => f.alive).map(f => f.ci));
    let ci = o.ci;
    if (ci === undefined && o.civ) ci = G.Civ.pickColor(o.civ);
    if (ci === undefined) { ci = 0; while (used.has(ci) && ci < F.COLORS.length - 1) ci++; }
    const usedSym = new Set([...S.factions.values()].map(f => f.sym));
    let sym = o.sym; if (sym === undefined) { sym = Math.floor(G.R() * F.SYMBOLS.length); for (let k = 0; k < F.SYMBOLS.length && usedSym.has(sym); k++) sym = (sym + 1) % F.SYMBOLS.length; }
    const usedNames = new Set([...S.factions.values()].map(f => f.name));
    const f = {
      id: S.nextId++, name: o.name || (o.civ && G.Civ.peopleName(o.civ)) || F.PEOPLE_NAMES.find(n => !usedNames.has(n)) || ('Povo ' + (S.factions.size + 1)), civ: o.civ || null,
      ci, sym, stock: Object.assign({ food: 36, wood: 14, stone: 0 }, o.stock || {}),
      leader: 0, gov: 'tribo', capital: o.capital || 0, founded: S.day, parent: o.parent || 0, alive: true,
      rel: {}, st: { kills: 0, deaths: 0, conquests: 0, captives: 0, massacres: 0, battles: 0, lost: 0 },
      rulers: [], era: 0, targets: null, weariness: 0, freed: !!o.freed,
    };
    S.factions.set(f.id, f);
    G.Civ.initTech(f);
    return f;
  };
  // relation record between two factions (symmetric storage)
  F.rel = function (a, b) {
    const A = F.get(a), B = F.get(b); if (!A || !B || a === b) return null;
    let r = A.rel[b];
    if (!r) { r = { op: 0, st: 'paz', since: G.S.day, grudge: 0, friend: 0, truce: 0 }; A.rel[b] = r; B.rel[a] = r; }
    return r;
  };
  F.atWar = (a, b) => { if (!a || !b || a === b) return false; const r = F.rel(a, b); return !!r && r.st === 'guerra'; };
  F.hostile = (va, vb) => F.atWar(F.idOfV(va), F.idOfV(vb));
  F.enemiesOf = fid => F.all().filter(o => o.id !== fid && F.atWar(fid, o.id));
  F.capitalOf = fid => { const f = F.get(fid); if (!f) return null; let s = G.S.settlements.get(f.capital); if (!s || s.fac !== fid) { s = F.settlementsOf(fid).sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0] || null; f.capital = s ? s.id : 0; } return s; };

  // ------------------------------ territory ------------------------------
  F.terr = null; F.terrFac = null; F.borders = []; F.touch = {}; F.bordersVer = 0;
  // the four edges of a tile: neighbour direction, then the segment's two corners (offsets from the tile)
  const EDX = [1, -1, 0, 0], EDY = [0, 0, 1, -1], EAX = [1, 0, 1, 0], EAY = [0, 1, 1, 0], EBX = [1, 0, 0, 1], EBY = [1, 0, 1, 0];
  const nBuilt = new Map(), touchN = new Map();
  F.updateTerritory = function () {
    const S = G.S;
    if (!F.terr || F.terr.length !== N * N) { F.terr = new Int32Array(N * N); F.terrFac = new Int32Array(N * N); F._inf = new Float32Array(N * N); }
    F.terr.fill(0); F.terrFac.fill(0); F._inf.fill(0);
    nBuilt.clear(); for (const b of S.buildings.values()) if (b.built) nBuilt.set(b.set, (nBuilt.get(b.set) || 0) + 1);
    for (const s of S.settlements.values()) {
      const pop = G.Village.pop(s.id);
      const nb = nBuilt.get(s.id) || 0;
      const R = Math.min(18 + (s.tier || 0) * 3, 6 + Math.sqrt(pop) * 1.3 + nb * 0.15);
      s.radius = R;
      const x0 = Math.floor(s.cx - R), x1 = Math.ceil(s.cx + R), y0 = Math.floor(s.cy - R), y1 = Math.ceil(s.cy + R);
      for (let y = Math.max(0, y0); y <= Math.min(N - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(N - 1, x1); x++) {
        const i = y * N + x; if (S.type[i] < T.RIVER) continue;
        const dx = x + 0.5 - s.cx, dy = y + 0.5 - s.cy;
        const inf = R - Math.sqrt(dx * dx + dy * dy);
        if (inf > F._inf[i]) { F._inf[i] = inf; F.terr[i] = s.id; F.terrFac[i] = s.fac; }
      }
    }
    // border segments per faction, drawn by the renderer; F.touch counts shared edges
    const segs = {}; touchN.clear();
    const TF = F.terrFac, type = S.type;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const f = TF[y * N + x]; if (!f) continue;
      for (let k = 0; k < 4; k++) {
        const dx = EDX[k], dy = EDY[k], nx = x + dx, ny = y + dy;
        const inb = nx >= 0 && ny >= 0 && nx < N && ny < N;
        const g = inb ? TF[ny * N + nx] : 0;
        if (g === f) continue;
        if (!g && inb && type[ny * N + nx] < T.RIVER) continue; // coastline needs no border
        (segs[f] = segs[f] || []).push(x + EAX[k] - dx * 0.1, y + EAY[k] - dy * 0.1, x + EBX[k] - dx * 0.1, y + EBY[k] - dy * 0.1, g ? 1 : 0);
        if (g && f < g) { const kk = f * 67108864 + g; touchN.set(kk, (touchN.get(kk) || 0) + 1); }
      }
    }
    const touch = {}; for (const [kk, n] of touchN) touch[Math.floor(kk / 67108864) + '|' + (kk % 67108864)] = n;
    F.borders = Object.keys(segs).map(k => ({ fid: +k, s: segs[k] }));
    F.touch = touch; F.bordersVer++;
  };
  F.ownerAt = (x, y) => (F.terrFac && W.inb(x, y)) ? F.terrFac[W.idx(x, y)] : 0;

  // ------------------------------ era per people ------------------------------
  F.eraOf = function (fid) {
    const S = G.S; const has = {};
    for (const b of S.buildings.values()) if (b.built) { const s = S.settlements.get(b.set); if (s && s.fac === fid) has[b.type] = true; }
    const pop = F.pop(fid); const sets = F.settlementsOf(fid).length;
    let e = 0;
    if (has.hut || has.house) e = 1;
    if (e >= 1 && has.storehouse) e = 2;
    if (e >= 2 && has.farm) e = 3;
    if (e >= 3 && has.workshop) e = 4;
    if (e >= 4 && has.temple) e = 5;
    if (e >= 5 && has.monument && pop >= 40) e = 6;
    if (e >= 6 && sets >= 2 && pop >= 70) e = 7;
    return e;
  };

  let tTerr = 0;
  F.update = function (dt) {
    tTerr -= dt;
    if (tTerr <= 0) { tTerr = 3; F.updateTerritory(); }
    G.Politics && G.Politics.update(dt);
    G.War && G.War.update(dt);
    G.Siege && G.Siege.update(dt);
    G.Civ.update(dt);
    G.City && G.City.update(dt);
    G.Naval && G.Naval.update(dt);
    G.Eco && G.Eco.update(dt);
    G.Army && G.Army.update(dt);
    G.Fest && G.Fest.update(dt);
  };
})(window.G);
