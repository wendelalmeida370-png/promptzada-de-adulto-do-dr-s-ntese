'use strict';
// ============================================================
//  Stories in the world: what each person has seen with their own eyes, how far things really are,
//  what lies along a road, and the words for the hour, the weather, the ground and each people's ways.
//  (So a story never wishes for a sea that is at the door, nor sends a pilgrim to the cave next door.)
// ============================================================
(function (G) {
  const St = G.Stories;
  const W = G.W, T = G.T;

  // ============================== what a person has seen ==============================
  // a bit for each kind of wonder; set when someone passes close to one (a few people each tick)
  const SEEN = St.SEEN = { mar: 1, pico: 2, lago: 4, cachoeira: 8, caverna: 16, maravilha: 32, neve: 64, deserto: 128, selva: 256 };
  let order = [], at = 0, wonders = [], wondersT = -1e9;
  function refreshWonders() {
    const S = G.S; wonders = [];
    for (const b of S.buildings.values()) if (b.type === 'maravilha' && b.built) { const c = G.Village.center(b); wonders.push([c[0], c[1]]); }
    wondersT = S.clock;
  }
  function see(v) {
    const S = G.S; let m = v.seen || 0; const x = v.x | 0, y = v.y | 0;
    if (!(m & SEEN.mar)) {
      search: for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const xx = x + dx, yy = y + dy; if (W.inb(xx, yy) && S.type[yy * G.N + xx] <= T.SEA) { m |= SEEN.mar; break search; } }
    }
    const rel = S.relief;
    if (rel) {
      if (!(m & SEEN.pico)) for (const p of rel.peaks || []) if (G.dist2(p.x, p.y, v.x, v.y) < 49) { m |= SEEN.pico; break; }
      if (!(m & SEEN.lago)) for (const l of rel.lakes || []) { const r = 3 + Math.sqrt(l.n || 4) * 0.6; if (G.dist2(l.x, l.y, v.x, v.y) < r * r) { m |= SEEN.lago; break; } }
      if (!(m & SEEN.cachoeira)) for (const f of rel.falls || []) if (G.dist2(f.tx, f.ty, v.x, v.y) < 20) { m |= SEEN.cachoeira; break; }
    }
    if (!(m & SEEN.caverna) && G.Caves) for (const cv of G.Caves.all()) { for (const mo of cv.mouths || []) if (G.dist2(mo.x, mo.y, v.x, v.y) < 10) { m |= SEEN.caverna; break; } if (m & SEEN.caverna) break; }
    if (!(m & SEEN.maravilha)) for (const w of wonders) if (G.dist2(w[0], w[1], v.x, v.y) < 40) { m |= SEEN.maravilha; break; }
    const b = G.Biome ? G.Biome.at(x, y) : 0;
    if (b === 1) m |= SEEN.neve; else if (b === 6) m |= SEEN.deserto; else if (b === 4) m |= SEEN.selva;
    v.seen = m;
  }
  St.see = see;
  St.lookAround = function (n) {
    const S = G.S; if (S.clock - wondersT > 30) refreshWonders();
    if (at >= order.length) { order = [...S.villagers.keys()]; at = 0; }
    for (let k = 0; k < n && at < order.length; k++, at++) { const v = S.villagers.get(order[at]); if (v && !v.inside && !v.ug && !v.aboard) see(v); }
  };
  St.hasSeen = (v, kind) => !!(v && SEEN[kind] && (v.seen || 0) & SEEN[kind]);

  // ============================== how far things are ==============================
  St.far = () => Math.max(24, G.N * 0.26); // a dream is further than a long walk
  St.pilgrimFar = () => Math.max(16, G.N * 0.17); // a pilgrimage is a road, not a stroll
  // the nearest open sea from a point (ring by ring), within R
  St.nearestSea = function (x, y, R) {
    const S = G.S; const N = G.N; x |= 0; y |= 0;
    for (let r = 0; r <= R; r++) {
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const xx = x + dx, yy = y + dy; if (!W.inb(xx, yy)) continue;
        if (S.type[yy * N + xx] <= T.SEA) return [xx + 0.5, yy + 0.5, r];
      }
    }
    return null;
  };
  // where someone from this town would first stand at the sea: the nearest shore one can walk to
  St.coastFor = function (set) {
    const sea = St.nearestSea(set.cx, set.cy, G.N); if (!sea) return null;
    const land = W.nearestLand(sea[0], sea[1], 4); if (!land || !W.sameLand(set.cx, set.cy, land[0], land[1])) return null;
    return { x: land[0], y: land[1], d: G.dist(set.cx, set.cy, land[0], land[1]) };
  };
  // the nearest feature of a kind to a point (for "they already live by a lake")
  St.featureNear = function (kind, x, y) {
    const S = G.S; const rel = S.relief || {}; let best = 1e9;
    const chk = (px, py) => { const d = G.dist(px, py, x, y); if (d < best) best = d; };
    if (kind === 'mar') { const s = St.nearestSea(x, y, 40); return s ? s[2] : 1e9; }
    if (kind === 'pico') for (const p of rel.peaks || []) chk(p.x, p.y);
    if (kind === 'lago') for (const l of rel.lakes || []) chk(l.x, l.y);
    if (kind === 'cachoeira') for (const f of rel.falls || []) chk(f.tx, f.ty);
    if (kind === 'caverna' && G.Caves) for (const cv of G.Caves.all()) for (const m of cv.mouths || []) chk(m.x, m.y);
    return best;
  };
  // the direction from one point to another, as people say it (north is the cold top of the map)
  const DIRS = ['ao norte', 'a nordeste', 'a leste', 'a sudeste', 'ao sul', 'a sudoeste', 'a oeste', 'a noroeste'];
  St.dir = function (fx, fy, tx, ty) {
    const du = (tx - ty) - (fx - fy), dw = (tx + ty) - (fx + fy);
    const a = Math.atan2(du, -dw); // 0 = north (up), clockwise
    return DIRS[((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8];
  };
  // a named landmark between two points (not at either end): "além da Agulha da Harpa"
  St.between = function (ax, ay, bx, by) {
    if (!G.Relief || !G.Relief.places) return null;
    const L = G.dist(ax, ay, bx, by); if (L < 12) return null;
    let best = null, bs = 1e9;
    for (const p of G.Relief.places()) {
      const t = ((p.x - ax) * (bx - ax) + (p.y - ay) * (by - ay)) / (L * L); if (t < 0.2 || t > 0.8) continue;
      const qx = ax + (bx - ax) * t, qy = ay + (by - ay) * t; const off = G.dist(p.x, p.y, qx, qy);
      if (off < 7 && off < bs) { bs = off; best = p; }
    }
    return best;
  };

  // ============================== words ==============================
  St.timeWord = function () {
    const t = G.S.time;
    return t < 0.02 || t > 0.8 ? 'noite' : t < 0.12 ? 'amanhecer' : t < 0.3 ? 'manha' : t < 0.45 ? 'meiodia' : t < 0.62 ? 'tarde' : 'entardecer';
  };
  St.weatherWord = function () {
    const w = G.S.weather || {};
    if (w.storm > 0 && w.rain > 0.3) return 'tempestade';
    if (w.rain > 0.25) return 'chuva';
    return 'limpo';
  };
  St.biomeAt = (x, y) => (G.Biome ? (G.BIOMES[G.Biome.at(x | 0, y | 0)] || G.BIOMES[0]).id : 'temperado');
  St.cold = (x, y) => { const b = St.biomeAt(x, y); return b === 'neve' || b === 'taiga'; };
  // a peak with snow on top: high enough, or in the cold north (not every hill keeps snow all year)
  St.snowy = p => !!(p && p.kind === 'pico' && ((parseInt(String(p.alt || '').replace(/\D/g, ''), 10) || 0) >= 1800 || St.cold(p.x, p.y)));

  // ============================== each people's ways ==============================
  // what a pilgrim carries, and how they pray for the dead when they get there
  St.OFFER = {
    grego: ['um jarro de mel e azeite', 'um bolo de mel e um ramo de oliveira'], romano: ['incenso e uma lamparina de barro', 'vinho, sal e um punhado de incenso'],
    egipcio: ['pão e cerveja', 'pão, cerveja e um amuleto de faiança'], nordico: ['um chifre de hidromel', 'hidromel e um anel de ferro'],
    asteca: ['flores amarelas e copal', 'copal, cacau e flores de cempasúchil'], '': ['flores do campo', 'um punhado de grãos e uma vela'],
  };
  St.RITE = {
    grego: ['derramou o mel e o azeite na pedra, pedindo a Hermes que guiasse {L} até o outro lado', 'pendurou o ramo de oliveira na entrada e chamou {L} três vezes pelo nome'],
    romano: ['queimou o incenso à luz da lamparina, pedindo aos Manes que recebessem {L}', 'derramou o vinho e o sal no chão, recitando o nome de {L} para que não se perdesse'],
    egipcio: ['deixou o pão e a cerveja na pedra, pedindo que o coração de {L} fosse leve na balança de Maat', 'deixou as oferendas, pedindo a Osíris que abrisse os campos de juncos para {L}'],
    nordico: ['derramou o hidromel na terra, pedindo que {L} tivesse lugar à mesa dos que já partiram', 'enterrou o anel de ferro na terra, dizendo o nome de {L} ao vento'],
    asteca: ['acendeu o copal entre as flores amarelas, para que {L} achasse o caminho', 'deixou o cacau e as flores, pedindo que {L} atravessasse os nove rios'],
    '': ['deixou as oferendas e rezou por {L} até a vela se apagar', 'ficou de joelhos, rezando por {L} até o sol mudar de lugar'],
  };
  St.civOf = v => (v && v.civ) || '';
  St.pick = (arr, k) => arr[Math.floor(St.mix(k) * arr.length)];

  // ============================== on the road ==============================
  // as someone walks a story's road, the world around them gives the chapters of the way:
  // a pass, a lake, a waterfall, another people's town, a ford, a new land, the weather — at most a few
  St.roadWatch = function (story, v, t) {
    // (three beats on the way there, one on the way back, and never the same thing twice in a story)
    const S = G.S; const seen = t.road || (t.road = []); if (seen.length >= (t.leg ? 1 : 3)) return null;
    const used = story.data.rk || (story.data.rk = []);
    const has = k => seen.includes(k) || used.includes(k);
    const add = (k, vars) => { seen.push(k); used.push(k); return Object.assign({ K: k }, vars); };
    // named places close by
    if (G.Relief && G.Relief.places) for (const p of G.Relief.places()) {
      if (G.dist2(p.x, p.y, v.x, v.y) > 30 || has('pl' + p.name)) continue;
      if (story.place && (p.name === story.place.name || 'o ' + p.name === story.place.name || 'a ' + p.name === story.place.name)) continue;
      if (G.dist(p.x, p.y, t.x, t.y) < 6) continue; // the goal itself, or right by it
      if (seen.some(k => k.startsWith('pl'))) continue; // one named place per road is enough
      seen.push('pl' + p.name); used.push('pl' + p.name); return { K: 'lugar', KIND: p.kind, NAME: p.name, ALT: p.alt || '', SNOW: St.snowy(p) };
    }
    // another people's town
    for (const s of S.settlements.values()) {
      if (s.id === v.set || has('set')) continue;
      // (not the town they are going to, nor the one they come home to)
      if (G.dist(s.cx, s.cy, t.x, t.y) < 9 || (t.hx !== undefined && G.dist(s.cx, s.cy, t.hx, t.hy) < 9)) continue;
      if (G.dist(s.cx, s.cy, v.x, v.y) < (s.radius || 6) + 3) { const own = s.fac !== G.Fac.idOfV(v); return add('set', { TOWN: s.name, OTHER: own ? (G.Fac.get(s.fac) || {}).name || '' : '', WAR: own && G.Fac.atWar(s.fac, G.Fac.idOfV(v)) }); }
    }
    // a ford
    const i = W.idx(v.x | 0, v.y | 0);
    if (!has('vau') && S.type[i] === T.RIVER && !S.deep[i]) return add('vau', {});
    // a new land under the feet
    const b = St.biomeAt(v.x, v.y);
    if (!has('bioma') && t.homeBiome && b !== t.homeBiome) { const B = G.BIOMES.find(x => x.id === b); return add('bioma', { BIOME: b, TO: B ? B.to : '' }); }
    // the weather on the road
    const w = St.weatherWord();
    if (!has('tempo') && (w === 'chuva' || w === 'tempestade')) return add('tempo', { W: w, COLD: St.cold(v.x, v.y) });
    return null;
  };

  // ============================== the camp fire ==============================
  // travellers sleep by a small fire when the night catches them on the road
  G.renderHooks = G.renderHooks || { ground: [], ents: [] };
  const camps = [];
  St.camps = camps;
  function drawCamp(ctx, o, sx, sy, t, nightF, fx) {
    ctx.fillStyle = 'rgba(60,48,36,0.55)'; ctx.beginPath(); ctx.ellipse(sx, sy, 4.2, 2.1, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#6b6258'; for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; ctx.beginPath(); ctx.ellipse(sx + Math.cos(a) * 3.2, sy + Math.sin(a) * 1.6, 0.9, 0.6, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = '#5a3c22'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(sx - 2, sy + 0.6); ctx.lineTo(sx + 2, sy - 0.6); ctx.moveTo(sx - 2, sy - 0.6); ctx.lineTo(sx + 2, sy + 0.6); ctx.stroke();
    const f = 0.55 + 0.12 * Math.sin(t * 9 + o.k);
    fx.fire(sx, sy - 1.5, f); fx.light(sx, sy - 5, 46 + Math.sin(t * 11 + o.k) * 3, 'fire', 0.85);
  }
  G.renderHooks.ents.push(function (add) {
    camps.length = 0;
    const S = G.S; if (!S || !S.saga) return;
    for (const s of S.saga.stories) {
      if (s.st !== 'ativa') continue; const v = S.villagers.get(s.protag); const tk = v && v.task;
      if (!tk || tk.type !== 'saga' || tk.st !== 4 || tk.cx === undefined) continue;
      const e = tk._e || (tk._e = { t: 13, k: v.id % 7, fn: drawCamp });
      add(tk.cx + tk.cy - 0.1, e, tk.cx, tk.cy); camps.push([tk.cx, tk.cy]);
    }
  });
})(window.G);
