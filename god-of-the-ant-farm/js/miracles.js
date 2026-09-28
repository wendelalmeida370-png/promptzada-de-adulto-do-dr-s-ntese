'use strict';
// ============================================================
//  Miracles: the god's newer ways of meddling.
//  Terra (raise & sink land, forests, stone, volcanoes),
//  Mar (shoals, winds, storms, tidal waves, the kraken),
//  Palavra (prophecies, commandments, inspiration, signs,
//  visions), golden ages, curses, chosen heroes, divine walls.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W, SEA = G.SEA;
  G.mapHooks.push(n => { N = n; });
  const P = G.Powers;
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);
  const oa = v => (v && v.g === 'f' ? 'a' : 'o');
  const DAY = () => G.DAY_LEN;

  // state that lives in the save (volcanoes, lava, prophecies, the sky) and transient wonders
  function M() {
    const S = G.S;
    if (!S.mir) S.mir = { volcanoes: [], lava: {}, waves: [], storms: [], krakens: [], prophecies: [], sky: null, bombs: [] };
    return S.mir;
  }
  P.M = M;

  // mythic names for volcanoes, sea monsters, ages
  const SYL1 = ['Ka', 'Tor', 'Vul', 'Ash', 'Mor', 'Zer', 'Ul', 'Hek', 'Ety', 'Ra', 'Om', 'Tha', 'Ske', 'Gri', 'Na', 'Bel', 'Ixa', 'Fen', 'Dra', 'Sor'];
  const SYL2 = ['gar', 'nak', 'ros', 'tra', 'ven', 'dor', 'kan', 'mir', 'thos', 'un', 'lax', 'rim', 'goth', 'zel', 'as', 'teph', 'vor', 'quen'];
  G.mythName = function () { return G.pick(SYL1) + (G.R() < 0.35 ? G.pick(['a', 'o', 'e', 'i']) : '') + G.pick(SYL2); };

  // ------------------------------ targets ------------------------------
  function setAt(x, y, r) {
    let best = null, bd = (r || 14) * (r || 14);
    for (const s of G.S.settlements.values()) { const d = G.dist2(x, y, s.cx, s.cy); if (d < bd) { bd = d; best = s; } }
    return best;
  }
  function facAt(x, y) {
    const fid = G.Fac.ownerAt(x, y); const f = fid ? G.Fac.get(fid) : null;
    if (f && f.alive !== false) return f;
    const s = setAt(x, y, 16); return s ? G.Fac.get(s.fac) : null;
  }
  P.setAt = setAt; P.facAt = facAt;
  const peopleOf = fid => { const out = []; for (const v of G.S.villagers.values()) if (!v.captive && G.Fac.idOfV(v) === fid) out.push(v); return out; };
  const water = i => G.S.type[i] <= T.SEA;
  function nearestWater(x, y, R) {
    const cx = Math.floor(x), cy = Math.floor(y);
    for (let r = 0; r <= R; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      const nx = cx + dx, ny = cy + dy; if (W.inb(nx, ny) && water(ny * N + nx)) return [nx + 0.5, ny + 0.5];
    }
    return null;
  }
  function nearestCoast(x, y, R) {
    let best = null, bd = R * R;
    const cx = Math.floor(x), cy = Math.floor(y);
    for (let ty = Math.max(0, cy - R); ty <= Math.min(N - 1, cy + R); ty++) for (let tx = Math.max(0, cx - R); tx <= Math.min(N - 1, cx + R); tx++) {
      const i = ty * N + tx; if (G.S.type[i] < T.SAND) continue;
      const d = G.dist2(tx + 0.5, ty + 0.5, x, y); if (d < bd) { bd = d; best = [tx + 0.5, ty + 0.5]; }
    }
    return best;
  }
  function hurtShip(s, dmg, why) { s.hp -= dmg; s.hurt = 0.3; if (s.hp <= 0 && G.S.ships.includes(s)) { G.Naval.sink(s, null, why || 'god'); return true; } return false; }

  // ------------------------------ checks & choices ------------------------------
  P.check = function (p, x, y) {
    const S = G.S; const i = W.idx(x, y); const id = p.id; const m = M();
    if (p.water && !water(i)) { P.why = 'Este poder precisa ser lançado sobre o mar.'; return false; }
    if (p.target === 'fac') {
      const f = facAt(x, y); if (!f) { P.why = 'Toque as terras de um povo.'; return false; }
      if (id === 'golden' && f.golden > 0) { P.why = `${f.name} já vive uma era de ouro.`; return false; }
      if (id === 'curse' && f.curse > 0) { P.why = `${f.name} já carrega uma maldição.`; return false; }
      if (id === 'inspire' && f.tech && !Object.keys(G.TECH).some(t => !f.tech.known[t])) { P.why = `${f.name} já conhece todos os segredos.`; return false; }
    }
    if (p.target === 'set') {
      const s = setAt(x, y, 12); if (!s) { P.why = 'Toque uma cidade ou vila.'; return false; }
      if (id === 'divwall') { const w = G.Siege && G.Siege.wallOf(s.id); if (w && w.done) { P.why = `${s.name} já tem muralhas.`; return false; } if (G.Village.pop(s.id) < 6) { P.why = 'Pequena demais para muralhas.'; return false; } }
      if (id === 'prophecy' && m.prophecies.some(q => q.st === 'aberta' && q.set === s.id)) { P.why = `Já pesa uma profecia sobre ${s.name}.`; return false; }
    }
    switch (id) {
      case 'raise': if (x < 3 || y < 3 || x > N - 3 || y > N - 3) { P.why = 'Perto demais da borda do mundo.'; return false; } break;
      case 'sink': if (!W.isLand(i) && S.type[i] !== T.RIVER) { P.why = 'Não há terra aqui para afundar.'; return false; } if (x < 2 || y < 2 || x > N - 2 || y > N - 2) { P.why = 'Perto demais da borda do mundo.'; return false; } break;
      case 'forest': case 'vein': if (!W.isLand(i)) { P.why = 'Precisa ser em terra firme.'; return false; } break;
      case 'volcano':
        if (!W.isLand(i)) { P.why = 'O vulcão precisa nascer em terra firme.'; return false; }
        if (x < 6 || y < 6 || x > N - 6 || y > N - 6) { P.why = 'Perto demais da borda do mundo.'; return false; }
        if (m.volcanoes.some(v => G.dist(v.x, v.y, x, y) < 9)) { P.why = 'Já existe um vulcão aqui perto.'; return false; }
        break;
      case 'wind': if (!S.ships.some(s => G.dist(s.x, s.y, x, y) < p.r)) { P.why = 'Não há navios aqui para receber o vento.'; return false; } break;
      case 'tsunami': if (!nearestCoast(x, y, 24)) { P.why = 'Não há costa perto o bastante para a onda.'; return false; } break;
      case 'kraken': if (m.krakens.length >= 2) { P.why = 'O mar já tem monstros demais.'; return false; } break;
      case 'sign': if (m.sky && m.sky.t > 0) { P.why = 'O céu ainda mostra o último sinal.'; return false; } break;
      case 'hero': { const v = P.targetAt(x, y, 1.3); if (!v || v.captive || v.age < 16 || v.age > 60) { P.why = 'Toque um adulto livre (16 a 60 anos).'; return false; } if (v.chosen) { P.why = `${v.name} já é ${v.g === 'f' ? 'a escolhida' : 'o escolhido'}.`; return false; } break; }
      case 'vision': { const v = P.targetAt(x, y, 1.3); if (!v) { P.why = 'Toque um adulto para enviar a visão.'; return false; } if (v.prophet) { P.why = `${v.name} já é ${v.g === 'f' ? 'profetisa' : 'profeta'}.`; return false; } break; }
    }
    return true;
  };

  const LAWS = {
    paz: { name: 'Não matarás', desc: 'Menos guerras, nada de massacres nem sacrifícios; os líderes ficam brandos.', mods: { war: 0.85 }, pe: { agg: -0.35, cru: -0.4 } },
    multiplicai: { name: 'Crescei e multiplicai-vos', desc: 'Muito mais nascimentos e um pouco mais de colheita.', mods: { growth: 1.6, farm: 1.1 } },
    trabalho: { name: 'Trabalharás sem descanso', desc: 'Obras, colheitas, pesca e caça rendem bem mais.', mods: { build: 1.3, farm: 1.15, fish: 1.15, hunt: 1.15 } },
    honra: { name: 'Honrarás teu deus', desc: 'Rezam sem parar: a fé que você recebe deste povo cresce muito.', mods: { faith: 1.6 }, pe: { pie: 0.3 } },
    saber: { name: 'Buscarás o saber', desc: 'Sábios e escribas são venerados: pesquisa bem mais rápida.', mods: { research: 1.5 } },
    guerra: { name: 'Guerra santa', desc: 'Guerreiros mais fortes e líderes sedentos de conquista.', mods: { war: 1.2 }, pe: { agg: 0.35, amb: 0.15 } },
  };
  P.LAWS = LAWS;
  const GOLD = { farm: 1.3, build: 1.3, growth: 1.3, faith: 1.2, trade: 1.3, fish: 1.2, hunt: 1.2 };
  const CURSE = { farm: 0.55, growth: 0.45, fish: 0.6, hunt: 0.6, build: 0.8, faith: 0.75 };
  // multiplier a people's law, golden age or curse puts on a trait
  P.traitMod = function (f, k) {
    let m = 1;
    if (f.law && LAWS[f.law] && LAWS[f.law].mods[k]) m *= LAWS[f.law].mods[k];
    if (f.golden > 0 && GOLD[k]) m *= GOLD[k];
    if (f.curse > 0 && CURSE[k]) m *= CURSE[k];
    return m;
  };
  P.lawPe = function (f, pe) {
    const L = f && f.law && LAWS[f.law]; if (!L || !L.pe) return pe;
    const o = Object.assign({}, pe); for (const k in L.pe) o[k] = G.clamp(o[k] + L.pe[k], 0, 1); return o;
  };

  const SIGNS = {
    cometa: { name: 'Cometa', desc: 'Um presságio de mudança. Líderes ousados veem vitória; os devotos, um chamado.' },
    eclipse: { name: 'Eclipse', desc: 'O sol some ao meio-dia. Medo e fé — exércitos hesitam, tiranos tremem.' },
    aurora: { name: 'Aurora', desc: 'Cortinas de luz no céu noturno. Alegria, lealdade e paz de espírito.' },
    estrelas: { name: 'Chuva de Estrelas', desc: 'Mil estrelas cadentes. Os sábios passam a noite contando — e aprendendo.' },
  };
  const PROPH = {
    queda: { name: 'A Queda', desc: 'Anuncie que a cidade cairá em cinco dias — conquistada, abandonada ou destruída.', days: 5 },
    grandeza: { name: 'A Grandeza', desc: 'Anuncie que a cidade crescerá de categoria em oito dias.', days: 8 },
    morte: { name: 'A Morte do Governante', desc: 'Anuncie que quem governa não viverá mais quatro dias.', days: 4 },
    sangue: { name: 'O Sangue', desc: 'Anuncie que o povo estará em guerra em quatro dias.', days: 4 },
    paz: { name: 'A Paz', desc: 'Anuncie que a guerra deste povo acabará em quatro dias.', days: 4 },
  };
  P.options = function (id, x, y) {
    if (id === 'commandment') { const f = facAt(x, y); return Object.keys(LAWS).map(k => ({ k, name: LAWS[k].name, desc: LAWS[k].desc, on: f && f.law === k })).filter(o => !o.on); }
    if (id === 'inspire') { const f = facAt(x, y); if (!f || !f.tech) return []; return Object.keys(G.TECH).filter(t => !f.tech.known[t]).map(t => ({ k: t, name: G.TECH[t].name, desc: G.TECH[t].desc })); }
    if (id === 'sign') return Object.keys(SIGNS).map(k => ({ k, name: SIGNS[k].name, desc: SIGNS[k].desc }));
    if (id === 'prophecy') {
      const s = setAt(x, y, 12); if (!s) return [];
      const f = G.Fac.get(s.fac); const war = f && G.Fac.enemiesOf(f.id).length > 0; const ruler = f && G.Politics.ruler(f);
      return Object.keys(PROPH).filter(k => (k !== 'morte' || ruler) && (k !== 'sangue' || !war) && (k !== 'paz' || war) && (k !== 'grandeza' || (s.tier || 0) < 4))
        .map(k => ({ k, name: PROPH[k].name, desc: PROPH[k].desc }));
    }
    return [];
  };
  P.optionsTitle = function (id, x, y) {
    const f = facAt(x, y), s = setAt(x, y, 12);
    if (id === 'commandment') return f ? `Que lei ${f.name} deve seguir?` : 'Que lei?';
    if (id === 'inspire') return f ? `Que segredo revelar a ${f.name}?` : 'Que segredo?';
    if (id === 'sign') return 'Que sinal mostrar no céu?';
    if (id === 'prophecy') return s ? `O que anunciar sobre ${s.name}?` : 'O que anunciar?';
    return '';
  };

  // ============================== TERRA ==============================
  // reshape the land: dir +1 raises (islands, hills, cones), -1 drowns
  function reshape(x, y, r, dir, o) {
    o = o || {};
    const S = G.S; const V = N + 1; const m = M();
    const R = Math.ceil(r + 3);
    const x0 = Math.max(0, Math.floor(x - R)), y0 = Math.max(0, Math.floor(y - R));
    const x1 = Math.min(N - 1, Math.ceil(x + R)), y1 = Math.min(N - 1, Math.ceil(y + R));
    const seed = Math.floor(G.R() * 9999);
    const rough = (tx, ty) => (G.hash(tx * 131 + ty * 71 + seed) - 0.5) * 0.9;
    const changed = new Set(), raisedLand = new Set(), doomed = new Set();
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      if (tx < 1 || ty < 1 || tx > N - 2 || ty > N - 2) continue;
      if (G.dist(tx + 0.5, ty + 0.5, x, y) + rough(tx, ty) >= r) continue;
      const i = ty * N + tx; const t = S.type[i];
      if (dir > 0) {
        if (t <= T.SEA) { S.type[i] = T.GRASS; S.fert[i] = G.clamp(0.42 + G.R() * 0.28 + (o.fert || 0), 0, 1); changed.add(i); }
        else if (t >= T.SAND) raisedLand.add(i);
      } else if (t >= T.RIVER) { S.type[i] = T.SEA; changed.add(i); doomed.add(i); }
    }
    // vertex heights
    for (let vy = y0; vy <= y1 + 1; vy++) for (let vx = x0; vx <= x1 + 1; vx++) {
      const d = G.dist(vx, vy, x, y); if (d > r + 1.2) continue;
      const f = G.clamp(1 - d / (r + 1.2), 0, 1); const k = vy * V + vx;
      if (dir > 0) {
        let h = S.H[k] > SEA ? S.H[k] + (o.hill === undefined ? 0.8 : o.hill) * f * f : SEA + 0.25 + (o.peak || 1.2) * Math.pow(f, 1.3);
        if (o.cone) h = Math.max(h, SEA + 0.3 + o.cone * Math.pow(f, 1.5));
        if (o.cone && d < 0.9) h -= 0.9; // the crater
        S.H[k] = Math.max(S.H[k], h);
      } else S.H[k] = Math.min(S.H[k], SEA - 0.25 - 1.1 * f);
    }
    // water meets land exactly at sea level
    for (let vy = y0; vy <= y1 + 1; vy++) for (let vx = x0; vx <= x1 + 1; vx++) {
      let tw = false, tl = false;
      for (let dy = -1; dy <= 0; dy++) for (let dx = -1; dx <= 0; dx++) { const tx = vx + dx, ty = vy + dy; if (!W.inb(tx, ty)) { tw = true; continue; } if (S.type[ty * N + tx] <= T.RIVER) tw = true; else tl = true; }
      const k = vy * V + vx;
      if (tw && tl) S.H[k] = SEA; else if (tw) S.H[k] = Math.min(S.H[k], SEA - 0.08); else S.H[k] = Math.max(S.H[k], SEA + 0.06);
    }
    // beaches, highlands, shallows
    const nearWater = (tx, ty) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = tx + dx, ny = ty + dy; if (!W.inb(nx, ny) || S.type[ny * N + nx] <= T.SEA) return true; } return false; };
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      const i = ty * N + tx; const t = S.type[i];
      if (t === T.RIVER) continue;
      if (t >= T.SAND) {
        const touched = changed.has(i) || raisedLand.has(i);
        const nw = nearWater(tx, ty);
        if (!touched && t !== T.SAND && !nw) continue;
        const th = W.tileH(i);
        let nt = t;
        if (o.rocky && G.dist(tx + 0.5, ty + 0.5, x, y) < r * 0.75) nt = T.ROCKY;
        else if (th > SEA + 3.6) nt = T.ROCKY;
        else if (nw && th < SEA + 0.75) nt = T.SAND;
        else if (t === T.SAND || changed.has(i)) nt = S.fert[i] > 0.62 ? T.MEADOW : T.GRASS;
        if (nt !== t) { S.type[i] = nt; if (nt === T.SAND) S.fert[i] *= 0.3; }
      } else {
        let near = false;
        for (let dy = -2; dy <= 2 && !near; dy++) for (let dx = -2; dx <= 2; dx++) { const nx = tx + dx, ny = ty + dy; if (W.inb(nx, ny) && S.type[ny * N + nx] >= T.RIVER) { near = true; break; } }
        S.type[i] = near || W.tileH(i) > SEA - 0.9 ? T.SEA : T.DEEP;
      }
    }
    // whatever stood on drowned ground
    const hitB = new Set(); let lost = 0;
    for (const i of doomed) {
      if (S.occ[i]) hitB.add(S.occ[i]);
      const tid = S.treeAt[i]; if (tid) { const tr = S.trees.get(tid); if (tr) G.Nature.removeTree(tr); }
      const oid = S.objAt[i]; if (oid) { const b = S.bushes.get(oid); if (b) G.Nature.removeBush(b); const rk = S.rocks.get(oid); if (rk) G.Nature.removeRock(rk); }
      S.road[i] = 0;
      if (S.wall[i]) { if (S.wall[i] === 3) for (const a of S.aqueducts) if (a.tiles.some(q => q[1] * N + q[0] === i)) a.dead = true; S.wall[i] = 0; S.wallFac[i] = 0; delete S.wallHp[i]; }
      S.wear[i] = 0; S.burnt[i] = 0; S.scar[i] = 0; S.bloom[i] = 0; S.fire[i] = 0; S.wet[i] = 1;
      delete m.lava[i];
    }
    for (const bid of hitB) {
      const b = S.buildings.get(bid); if (!b) continue;
      if (b.type !== 'ruin' && b.type !== 'cemetery' && b.hp > 0) { G.Village.destroyBuilding(b, 'sea'); lost++; }
      if (S.buildings.has(b.id)) G.Village.removeBuilding(b);
    }
    if (doomed.size) {
      for (const a of S.animals.values()) { if (a.dead || !doomed.has(W.idx(a.x, a.y))) continue; const p = W.nearestLand(a.x, a.y, 8); if (p) { a.x = p[0]; a.y = p[1]; a.tx = a.x; a.ty = a.y; } else G.Animals.kill(a, null); }
      for (const rt of S.routes) if (rt.tiles.some(i => doomed.has(i))) rt.dead = true;
      G.Nature.rebuildFire();
    }
    // ships stranded on new land drift to the nearest water; courses get re-plotted
    if (changed.size && dir > 0) {
      for (const s of [...S.ships]) {
        const i = W.idx(s.x, s.y);
        if (!water(i)) { const p = nearestWater(s.x, s.y, 7); if (!p) { G.Naval.sink(s, null, 'god'); continue; } s.x = p[0]; s.y = p[1]; }
        if (s.path && s.path.slice(s.pi).some(q => changed.has(W.idx(q[0], q[1])))) { const last = s.path[s.path.length - 1]; const np = G.Naval.seaPath(s.x, s.y, last[0], last[1]); if (np) { s.path = np; s.pi = 0; } else { s.path = null; s.pi = 0; } }
      }
      S.fish = S.fish.filter(f => water(W.idx(f.x, f.y)));
    }
    for (const b of S.buildings.values()) if (b.type === 'doca' && G.dist(b.x, b.y, x, y) < R + 6) b._dockV = -1;
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) G.Nature.markDirty(ty * N + tx);
    S.typeVer = (S.typeVer || 0) + 1;
    W.invalidateLand(); G.Naval && G.Naval.invalidate && G.Naval.invalidate();
    G.Save.computeDistances();
    G.Render && G.Render.reshape && G.Render.reshape(x, y, R + 2);
    G.Fac.updateTerritory();
    return { changed: changed.size, lost };
  }
  P.reshape = reshape;

  function landFX(x, y, r, dir) {
    for (let k = 0; k < 50; k++) { const a = G.rr(0, 6.28), d = Math.sqrt(G.R()) * r; const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d; G.FX && G.FX.spawn({ x: px, y: py, z: G.rr(0, 6), vz: G.rr(10, 40), vx: G.rr(-0.4, 0.4), vy: G.rr(-0.4, 0.4), drag: 0.5, life: G.rr(1.2, 2.6), s0: G.rr(4, 7), s1: G.rr(10, 18), c: dir > 0 ? G.pick(['rgba(150,120,90,0.45)', 'rgba(120,100,80,0.4)']) : G.pick(['rgba(220,240,255,0.55)', 'rgba(170,215,240,0.5)']), k: 2 }); }
    for (let k = 0; k < 30; k++) G.FX && G.FX.spawn({ x: x + G.rr(-r, r), y: y + G.rr(-r, r), h: SEA, z: 0, vz: G.rr(60, 200), vx: G.rr(-1.5, 1.5), vy: G.rr(-1.5, 1.5), g: 300, life: G.rr(0.8, 1.6), s0: 1.8, s1: 0.8, c: dir > 0 ? '#6e5a44' : 'rgba(220,240,255,0.9)', k: dir > 0 ? 6 : 0 });
    G.FX && G.FX.ring(x, y, 0.3, r + 2, 1.3, dir > 0 ? 'rgba(190,150,100,0.8)' : 'rgba(150,210,255,0.85)', 3, true);
  }

  P.raise = function (x, y) {
    const S = G.S; const wasWater = water(W.idx(x, y));
    const before = W.landAt ? W.landAt(x, y) : null;
    const res = reshape(x, y, 2.6, +1, { peak: 1.3, hill: 0.9 });
    G.Render && G.Render.shake(0.8); G.Audio && G.Audio.play('quake');
    landFX(x, y, 2.6, 1);
    if (!wasWater) for (let k = 0; k < 3; k++) { const a = G.R() * 6.28, d = G.rr(0.5, 2); const rx = Math.floor(x + Math.cos(a) * d) + 0.5, ry = Math.floor(y + Math.sin(a) * d) + 0.5; const i = W.idx(rx, ry); if (W.inb(rx, ry) && W.isLand(i) && !S.occ[i] && !S.objAt[i] && !S.treeAt[i]) G.Nature.addRock(rx, ry, 20); }
    P.witness(x, y, 14, 6, 10);
    const where = G.Village.nearSettlementName(x, y);
    if (wasWater && res.changed) {
      log(`${where ? 'Perto de ' + where + ', uma' : 'Uma'} nova terra ergueu-se do fundo do mar.`, 'mountain', x, y);
      G.Lore && G.Lore.note('raise', { x, y, where, before });
    } else log(`A terra inchou e virou colina${where ? ' perto de ' + where : ''}.`, 'mountain', x, y);
  };
  P.sink = function (x, y) {
    const S = G.S; const set = setAt(x, y, 5);
    const popBefore = set ? G.Village.pop(set.id) : 0;
    const res = reshape(x, y, 2.6, -1);
    G.Render && G.Render.shake(1.1); G.Audio && G.Audio.play('quake'); G.Audio && G.Audio.play('rainStart');
    landFX(x, y, 2.6, -1);
    (S.panic = S.panic || []).push({ x, y, r: 6, t: 3, why: 'panic' });
    P.witness(x, y, 15, -4, 24);
    const where = G.Village.nearSettlementName(x, y);
    log(`O chão afundou${where ? ' em ' + where : ''} e o mar tomou o lugar${res.lost ? ` — ${res.lost} ${res.lost > 1 ? 'construções foram engolidas' : 'construção foi engolida'}` : ''}.`, 'wave', x, y);
    G.Lore && G.Lore.note('sink', { x, y, where, lost: res.lost, set: set ? set.id : 0, name: set ? set.name : '', pop: popBefore });
  };
  P.forest = function (x, y) {
    const S = G.S; const r = 4; let n = 0;
    for (let ty = Math.floor(y - r); ty <= y + r; ty++) for (let tx = Math.floor(x - r); tx <= x + r; tx++) {
      if (!W.inb(tx, ty)) continue; const d = G.dist(tx + 0.5, ty + 0.5, x, y); if (d > r) continue;
      const i = ty * N + tx; const t = S.type[i];
      if (t < T.SAND || S.occ[i] || S.objAt[i] || S.treeAt[i] || S.road[i] || S.wall[i] || S.wear[i] > 30) { if (S.treeAt[i]) { const tr = S.trees.get(S.treeAt[i]); if (tr && tr.stage === 'grow') tr.size = tr.maxSize; } continue; }
      S.bloom[i] = Math.max(S.bloom[i], DAY() * 0.8); G.Nature.markDirty(i);
      if (t === T.SAND) { if (G.R() < 0.25) { G.Nature.addTree(tx + 0.5, ty + 0.5, 'palm', 0.85); n++; } continue; }
      if (G.R() < (t === T.ROCKY ? 0.35 : 0.62) * (1 - d / r * 0.3)) {
        const tr = G.Nature.addTree(tx + 0.5 + G.rr(-0.2, 0.2), ty + 0.5 + G.rr(-0.2, 0.2), t === T.ROCKY || G.R() < 0.4 ? 'pine' : 'oak', 0.9 + G.R() * 0.3);
        if (tr) { tr.size = 0.7 + G.R() * 0.3; n++; }
      } else if (G.R() < 0.22) G.Nature.addBush(tx + 0.5, ty + 0.5);
    }
    for (let k = 0; k < 2 + (G.R() < 0.5 ? 1 : 0); k++) { const a = G.R() * 6.28; const px = x + Math.cos(a) * 2, py = y + Math.sin(a) * 2; if (W.inb(px, py) && W.isLand(W.idx(px, py))) G.Animals.spawn('deer', px, py); }
    G.FX && G.FX.growth(x, y, r);
    G.Audio && G.Audio.play('magic');
    P.witness(x, y, 12, 8, 0);
    const where = G.Village.nearSettlementName(x, y);
    log(`Uma floresta sagrada brotou${where ? ' perto de ' + where : ''} em uma única manhã${n > 20 ? ': ' + n + ' árvores' : ''}.`, 'food', x, y);
    G.Lore && G.Lore.note('forest', { x, y, where });
  };
  P.vein = function (x, y) {
    const S = G.S; const r = 2.2; let rocks = 0;
    for (let ty = Math.floor(y - r); ty <= y + r; ty++) for (let tx = Math.floor(x - r); tx <= x + r; tx++) {
      if (!W.inb(tx, ty)) continue; const d = G.dist(tx + 0.5, ty + 0.5, x, y); if (d > r) continue;
      const i = ty * N + tx; if (!W.isLand(i)) continue;
      if (S.type[i] !== T.SAND || d < r * 0.6) { S.type[i] = T.ROCKY; G.Nature.markDirty(i); }
      if (!S.occ[i] && !S.objAt[i] && !S.treeAt[i] && !S.road[i] && !S.wall[i] && G.R() < 0.45) { const rk = G.Nature.addRock(tx + 0.5, ty + 0.5, Math.round(G.rr(35, 60))); if (rk) rocks++; }
      if (G.R() < 0.4) G.FX && G.FX.dust(tx + 0.5, ty + 0.5, 3);
    }
    G.Render && G.Render.invalidateTerrain(x, y, r + 2); G.Render && G.Render.shake(0.5);
    G.Audio && G.Audio.play('quake');
    G.FX && G.FX.ring(x, y, 0.3, r + 1, 1, 'rgba(200,190,170,0.85)', 2.5, true);
    P.witness(x, y, 12, 6, 6);
    const where = G.Village.nearSettlementName(x, y);
    log(`A terra se abriu${where ? ' perto de ' + where : ''} e revelou um veio de pedra${rocks ? ` (${rocks} rochedos)` : ''}.`, 'stone', x, y);
  };

  // ---------------- volcano ----------------
  P.volcano = function (x, y) {
    const S = G.S; const m = M();
    x = Math.floor(x) + 0.5; y = Math.floor(y) + 0.5;
    reshape(x, y, 3.6, +1, { cone: 11, hill: 3, rocky: true, fert: 0.1 });
    for (let ty = Math.floor(y - 2); ty <= y + 2; ty++) for (let tx = Math.floor(x - 2); tx <= x + 2; tx++) if (W.inb(tx, ty) && G.dist(tx + 0.5, ty + 0.5, x, y) < 1.8) { S.scar[ty * N + tx] = DAY() * 30; G.Nature.markDirty(ty * N + tx); }
    // the new mountain crushes what stood on its slopes
    for (const b of [...S.buildings.values()]) { const [cx, cy] = G.Village.center(b); if (G.dist(cx, cy, x, y) < 2.2 && b.hp > 0) G.Village.damageBuilding(b, 9999, 'lava'); }
    for (const v of [...S.villagers.values()]) { const d = G.dist(v.x, v.y, x, y); if (d < 1.6) G.Vg.damage(v, 400, 'lava', true); else if (d < 4 && !v.inside) G.Vg.fleeFrom(v, x, y, 8, 'panic'); }
    const name = G.mythName();
    m.volcanoes.push({ id: S.nextId++, x, y, name, t: 0, erupt: 55, flows: [], bombT: 1, flowT: 0.5, born: S.day, sleep: 0, kills: 0, lost: 0 });
    G.Render && G.Render.shake(1.6); G.Audio && G.Audio.play('boom'); G.Audio && G.Audio.play('quake');
    G.FX && G.FX.meteorImpact(x, y, 2, false);
    (S.panic = S.panic || []).push({ x, y, r: 10, t: 8, why: 'panic' });
    P.witness(x, y, 20, -6, 40);
    const where = G.Village.nearSettlementName(x, y);
    log(`Um vulcão rasgou a terra${where ? ' perto de ' + where : ''}. Chamaram-no de ${name}, a Montanha de Fogo.`, 'fire', x, y);
    G.Lore && G.Lore.note('volcano', { x, y, name, where });
  };
  function lavaAt(i, t) {
    const S = G.S; const m = M(); if (!W.isLand(i)) return false;
    m.lava[i] = Math.max(m.lava[i] || 0, t);
    G.Nature.ignite(i, 1);
    const tid = S.treeAt[i]; if (tid) { const tr = S.trees.get(tid); if (tr) G.Nature.removeTree(tr); }
    const oid = S.objAt[i]; if (oid) { const b = S.bushes.get(oid); if (b) G.Nature.removeBush(b); }
    const bid = S.occ[i]; if (bid) { const b = S.buildings.get(bid); if (b && b.hp > 0) G.Village.damageBuilding(b, 9999, 'lava'); }
    S.road[i] = 0; S.wear[i] = 0;
    return true;
  }
  function updateVolcano(vo, dt) {
    const S = G.S; const m = M();
    vo.t += dt;
    const active = vo.erupt > 0;
    if (active) {
      vo.erupt -= dt;
      const h = W.groundH(vo.x, vo.y);
      // smoke and embers
      if (G.FX) {
        for (let k = 0; k < Math.ceil(dt * 18); k++) G.FX.spawn({ x: vo.x + G.rr(-0.3, 0.3), y: vo.y + G.rr(-0.3, 0.3), h, z: G.rr(0, 8), vz: G.rr(25, 55), vx: G.rr(-0.25, 0.25) + Math.cos(S.weather.windA) * 0.2, vy: G.rr(-0.25, 0.25) + Math.sin(S.weather.windA) * 0.2, drag: 0.15, life: G.rr(4, 8), s0: G.rr(6, 10), s1: G.rr(26, 44), c: G.pick(['rgba(58,50,48,0.55)', 'rgba(80,70,66,0.5)', 'rgba(40,34,32,0.6)']), k: 2 });
        for (let k = 0; k < Math.ceil(dt * 10); k++) G.FX.spawn({ x: vo.x, y: vo.y, h, z: G.rr(2, 8), vz: G.rr(60, 160), vx: G.rr(-1, 1), vy: G.rr(-1, 1), g: 160, life: G.rr(0.8, 1.8), s0: G.rr(1.4, 2.4), s1: 0.3, c: G.pick(['#ffdd88', '#ff9944', '#ff6622']), k: 4, layer: 1 });
        if (G.R() < dt * 2) G.FX.glowAt(vo.x, vo.y, 0.9, 'fire', 150);
      }
      if (G.R() < dt * 0.7) G.Render && G.Render.shake(0.25);
      // lava bombs
      vo.bombT -= dt;
      if (vo.bombT <= 0) {
        vo.bombT = G.rr(0.35, 1.1);
        const a = G.R() * 6.28, d = G.rr(2.5, 9);
        const tx = vo.x + Math.cos(a) * d, ty = vo.y + Math.sin(a) * d;
        if (W.inb(tx, ty)) m.bombs.push({ x0: vo.x, y0: vo.y, h0: h, x: tx, y: ty, t: 0, T: G.rr(1.2, 2), vo: vo.id });
      }
      // rivers of lava crawl downhill
      vo.flowT -= dt;
      if (vo.flowT <= 0 && vo.flows.length < 6) { vo.flowT = G.rr(5, 9); vo.flows.push({ x: Math.floor(vo.x), y: Math.floor(vo.y), n: Math.floor(G.rr(9, 16)), cd: 0 }); }
      (S.panic = S.panic || []); if (!S.panic.some(p => p.vo === vo.id)) S.panic.push({ x: vo.x, y: vo.y, r: 7, t: 3, why: 'panic', vo: vo.id });
      if (vo.erupt <= 0) { vo.sleep = 0; log(`${vo.name} adormeceu. As cinzas ${vo.kills ? 'cobrem ' + vo.kills + (vo.kills > 1 ? ' mortos' : ' morto') + ' — e ' : ''}vão tornar a terra fértil.`, 'fire', vo.x, vo.y); G.Lore && G.Lore.note('volcanoSleep', { name: vo.name, kills: vo.kills, lost: vo.lost }); }
    } else {
      // asleep: a thin plume; sometimes it wakes again
      vo.sleep += dt;
      if (G.FX && G.R() < dt * 2.5) G.FX.spawn({ x: vo.x, y: vo.y, h: W.groundH(vo.x, vo.y), z: 4, vz: G.rr(12, 22), vx: Math.cos(S.weather.windA) * 0.3, vy: Math.sin(S.weather.windA) * 0.3, drag: 0.1, life: G.rr(4, 7), s0: 4, s1: 16, c: 'rgba(120,112,108,0.35)', k: 2 });
      if (vo.sleep > DAY() * 5 && G.R() < dt / (DAY() * 6)) {
        vo.erupt = 30; vo.flows = []; vo.flowT = 0.5;
        log(`${vo.name} despertou de novo! Fogo e cinzas caem do céu.`, 'fire', vo.x, vo.y);
        G.Audio && G.Audio.play('boom'); G.Render && G.Render.shake(1);
        P.witness(vo.x, vo.y, 18, 0, 30);
        G.Lore && G.Lore.note('volcanoWake', { name: vo.name });
      }
    }
    for (let k = vo.flows.length - 1; k >= 0; k--) {
      const fl = vo.flows[k]; fl.cd -= dt; if (fl.cd > 0) continue; fl.cd = G.rr(0.5, 0.9);
      const i = fl.y * N + fl.x;
      lavaAt(i, DAY() * 0.35);
      if (--fl.n <= 0) { vo.flows.splice(k, 1); continue; }
      let best = null, bh = W.tileH(i) + 0.3;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
        const nx = fl.x + dx, ny = fl.y + dy; if (!W.inb(nx, ny)) continue; const j = ny * N + nx;
        const hh = W.tileH(j) + G.R() * 0.35 + (m.lava[j] ? 0.25 : 0);
        if (hh < bh) { bh = hh; best = [nx, ny, j]; }
      }
      if (!best) { vo.flows.splice(k, 1); continue; }
      if (!W.isLand(best[2])) { // hissing steam where lava meets water
        for (let q = 0; q < 14; q++) G.FX && G.FX.spawn({ x: best[0] + 0.5 + G.rr(-0.4, 0.4), y: best[1] + 0.5 + G.rr(-0.4, 0.4), h: SEA, z: 0, vz: G.rr(15, 40), drag: 0.3, life: G.rr(1.5, 3), s0: 5, s1: 14, c: 'rgba(235,240,245,0.55)', k: 2 });
        vo.flows.splice(k, 1); continue;
      }
      fl.x = best[0]; fl.y = best[1];
    }
  }
  function updateLava(dt) {
    const S = G.S; const m = M();
    let any = false;
    for (const k in m.lava) {
      any = true;
      m.lava[k] -= dt;
      if (m.lava[k] <= 0) { const i = +k; delete m.lava[k]; S.scar[i] = Math.max(S.scar[i], DAY() * 5); S.fert[i] = Math.min(1, S.fert[i] + 0.3); G.Nature.markDirty(i); }
    }
    if (!any) return;
    for (const v of [...S.villagers.values()]) {
      if (v.inside || v.air || v.aboard) continue;
      const i = W.idx(v.x, v.y); if (!m.lava[i]) continue;
      G.Vg.damage(v, 60 * dt, 'lava', true);
      if (!S.villagers.has(v.id)) { const vo = m.volcanoes.find(q => G.dist(q.x, q.y, v.x, v.y) < 20); if (vo) vo.kills++; }
      else if (!v.held) G.Vg.fleeFrom(v, v.x + G.rr(-1, 1), v.y + G.rr(-1, 1), 4, 'panic');
    }
    for (const a of S.animals.values()) if (!a.dead && m.lava[W.idx(a.x, a.y)]) G.Animals.damage(a, 50 * dt, null);
  }
  function updateBombs(dt) {
    const S = G.S; const m = M();
    for (let k = m.bombs.length - 1; k >= 0; k--) {
      const b = m.bombs[k]; b.t += dt; if (b.t < b.T) continue;
      m.bombs.splice(k, 1);
      const i = W.idx(b.x, b.y);
      if (!W.isLand(i)) { G.FX && G.FX.splash(b.x, b.y, 0.8); continue; }
      const vo = m.volcanoes.find(q => q.id === b.vo);
      G.FX && G.FX.spawn({ x: b.x, y: b.y, z: 1, vz: 20, life: 1.2, s0: 6, s1: 14, c: 'rgba(60,50,46,0.5)', k: 2 });
      for (let q = 0; q < 8; q++) G.FX && G.FX.spawn({ x: b.x, y: b.y, z: 2, vx: G.rr(-1.2, 1.2), vy: G.rr(-1.2, 1.2), vz: G.rr(40, 110), g: 260, life: G.rr(0.5, 1), s0: 1.6, s1: 0.3, c: G.pick(['#ffcf6a', '#ff7a2a']), k: 4, layer: 1 });
      G.Audio && G.Audio.at(b.x, b.y, 'hit');
      G.Nature.ignite(i, 0.9);
      if (G.R() < 0.35) lavaAt(i, DAY() * 0.15);
      const bid = S.occ[i]; if (bid) { const B = S.buildings.get(bid); if (B && B.hp > 0) { const wasUp = B.type !== 'ruin'; G.Village.damageBuilding(B, 45, 'lava'); if (vo && wasUp && B.type === 'ruin') vo.lost++; } }
      for (const v of [...S.villagers.values()]) { if (v.inside || v.aboard) continue; const d = G.dist(v.x, v.y, b.x, b.y); if (d < 0.9) { G.Vg.damage(v, 70 * (1 - d), 'lava', true); if (!S.villagers.has(v.id) && vo) vo.kills++; } }
    }
  }

  // ============================== MAR ==============================
  P.shoal = function (x, y) {
    G.Naval.addShoal(x, y, 60);
    for (let k = 0; k < 20; k++) G.FX && G.FX.spawn({ x: x + G.rr(-1.5, 1.5), y: y + G.rr(-1.5, 1.5), h: SEA, z: 0, vz: G.rr(30, 70), g: 180, life: G.rr(0.6, 1.2), s0: 1.2, s1: 0.8, c: G.pick(['#cfe8f0', '#9fd0e0', '#ffffff']), k: 0 });
    G.FX && G.FX.ring(x, y, 0.2, 2.5, 1.1, 'rgba(160,220,255,0.9)', 2, true);
    G.Audio && G.Audio.play('magic');
    P.witness(x, y, 12, 5, 0);
    const where = G.Village.nearSettlementName(x, y);
    log(`Um cardume imenso apareceu${where ? ' no mar de ' + where : ' no mar'}.`, 'boat', x, y);
  };
  P.wind = function (x, y) {
    const S = G.S; const facs = new Set(); let n = 0;
    for (const s of S.ships) if (G.dist(s.x, s.y, x, y) < 9) { s.wind = 1.8; s.windT = DAY() * 2; facs.add(s.fac); n++; }
    for (let k = 0; k < 40; k++) { const a = S.weather.windA; G.FX && G.FX.spawn({ x: x + G.rr(-6, 6), y: y + G.rr(-6, 6), h: SEA, z: G.rr(6, 20), vx: Math.cos(a) * 5, vy: Math.sin(a) * 5, life: G.rr(0.8, 1.6), s0: 1, s1: 0.4, c: 'rgba(255,255,255,0.7)', k: 11 }); }
    G.FX && G.FX.ring(x, y, 0.5, 9, 1.2, 'rgba(230,245,255,0.8)', 2, true);
    G.Audio && G.Audio.play('magic');
    P.witness(x, y, 12, 5, 0);
    const names = [...facs].map(f => (G.Fac.get(f) || {}).name).filter(Boolean);
    log(`Ventos divinos enfunaram as velas de ${n} ${n > 1 ? 'navios' : 'navio'}${names.length ? ' de ' + names.join(' e ') : ''}.`, 'ship', x, y);
  };
  P.seastorm = function (x, y) {
    const S = G.S; const m = M();
    m.storms.push({ x, y, r: 6, t: 34, max: 34, bolt: 1 });
    for (let k = 0; k < 3; k++) G.Nature.addCloud(x + G.rr(-3, 3), y + G.rr(-3, 3), 4, 34, 'divine');
    G.Audio && G.Audio.play('rainStart'); G.Audio && G.Audio.play('thunderFar');
    P.witness(x, y, 14, -2, 14);
    const where = G.Village.nearSettlementName(x, y);
    log(`Uma tempestade furiosa desabou sobre o mar${where ? ' de ' + where : ''}.`, 'storm', x, y);
  };
  function updateStorms(dt) {
    const S = G.S; const m = M();
    for (let k = m.storms.length - 1; k >= 0; k--) {
      const st = m.storms[k]; st.t -= dt;
      if (st.t <= 0) { m.storms.splice(k, 1); continue; }
      for (const s of [...S.ships]) {
        const d = G.dist(s.x, s.y, st.x, st.y); if (d > st.r) continue;
        s.stormT = 1;
        if (hurtShip(s, dt * (s.kind === 'pesca' ? 7 : 4.5) * (1 - d / st.r * 0.5), 'storm')) continue;
      }
      st.bolt -= dt;
      if (st.bolt <= 0) {
        st.bolt = G.rr(1, 2.6);
        const a = G.R() * 6.28, d = Math.sqrt(G.R()) * st.r; const bx = st.x + Math.cos(a) * d, by = st.y + Math.sin(a) * d;
        if (W.inb(bx, by) && water(W.idx(bx, by))) { P.strike(bx, by, true); for (const s of [...S.ships]) if (G.dist(s.x, s.y, bx, by) < 1.4) hurtShip(s, 30, 'storm'); }
      }
      if (G.FX) for (let q = 0; q < Math.ceil(dt * 20); q++) { const a = G.R() * 6.28, d = Math.sqrt(G.R()) * st.r; const px = st.x + Math.cos(a) * d, py = st.y + Math.sin(a) * d; if (W.inb(px, py) && water(W.idx(px, py))) G.FX.spawn({ x: px, y: py, h: SEA, z: 0, vz: G.rr(30, 80), vx: G.rr(-1, 1), vy: G.rr(-1, 1), g: 200, life: G.rr(0.5, 1), s0: 1.6, s1: 0.6, c: 'rgba(230,245,255,0.85)', k: 0 }); }
    }
    for (const s of S.ships) if (s.stormT > 0) { s.stormT -= dt; s.wind = s.windT > 0 ? 1.8 * 0.5 : 0.5; if (s.stormT <= 0) s.wind = s.windT > 0 ? 1.8 : 1; }
  }

  // ---------------- tidal wave ----------------
  P.tsunami = function (x, y) {
    const m = M();
    const c = nearestCoast(x, y, 24); if (!c) return;
    const d = G.dist(x, y, c[0], c[1]) || 1; const dx = (c[0] - x) / d, dy = (c[1] - y) / d;
    m.waves.push({ x, y, dx, dy, d: 0, coast: d, max: d + 6, w: 7, hit: {}, killed: 0, lost: 0, where: G.Village.nearSettlementName(c[0], c[1]) });
    G.Audio && G.Audio.play('quake'); G.Render && G.Render.shake(0.6);
    G.FX && G.FX.ring(x, y, 0.5, 5, 1.2, 'rgba(160,220,255,0.9)', 3, true);
    P.witness(c[0], c[1], 18, 0, 20);
  };
  function updateWaves(dt) {
    const S = G.S; const m = M();
    for (let k = m.waves.length - 1; k >= 0; k--) {
      const wv = m.waves[k]; const inland = wv.d - wv.coast;
      wv.d += dt * (inland > 0 ? 2.6 : 4);
      const px = -wv.dy, py = wv.dx;
      const force = G.clamp(1 - Math.max(0, inland) / 6.5, 0.15, 1);
      for (let s = -wv.w; s <= wv.w; s += 0.5) {
        const fx = wv.x + wv.dx * wv.d + px * s, fy = wv.y + wv.dy * wv.d + py * s;
        if (!W.inb(fx, fy)) continue;
        const i = W.idx(fx, fy); if (wv.hit[i]) continue; wv.hit[i] = 1;
        const edge = 1 - Math.abs(s) / (wv.w + 1);
        if (water(i) || S.type[i] === T.RIVER) {
          for (const sh of [...S.ships]) if (G.dist(sh.x, sh.y, fx, fy) < 1.2) hurtShip(sh, 90 * edge, 'god');
          if (G.FX && G.R() < 0.5) G.FX.spawn({ x: fx, y: fy, h: SEA, z: 2, vz: G.rr(40, 110), vx: wv.dx * 2, vy: wv.dy * 2, g: 220, life: G.rr(0.6, 1.2), s0: 2, s1: 1, c: 'rgba(235,248,255,0.9)', k: 0 });
          continue;
        }
        if (inland > 6) continue;
        const f = force * edge;
        S.wet[i] = 1; if (S.fire[i] > 0) S.fire[i] = 0;
        const bid = S.occ[i];
        if (bid) { const b = S.buildings.get(bid); if (b && b.hp > 0 && b.type !== 'ruin') { const up = b.type; G.Village.damageBuilding(b, 110 * f, 'wave'); if (up !== 'ruin' && (b.type === 'ruin' || !S.buildings.has(b.id))) wv.lost++; } if (b && b.crops) for (const c of b.crops) c.g = Math.min(c.g, 0.1); }
        const tid = S.treeAt[i]; if (tid && G.R() < 0.6 * f) { const tr = S.trees.get(tid); if (tr && tr.stage === 'grow' && tr.size > 0.3) G.Nature.fellTree(tr, wv.dx + wv.dy > 0 ? 1 : -1); }
        const oid = S.objAt[i]; if (oid) { const bu = S.bushes.get(oid); if (bu) bu.berries = 0; }
        G.Nature.markDirty(i);
        if (G.FX && G.R() < 0.7) G.FX.spawn({ x: fx, y: fy, z: 4, vz: G.rr(50, 130), vx: wv.dx * 3, vy: wv.dy * 3, g: 240, life: G.rr(0.6, 1.3), s0: 2.2, s1: 1, c: G.pick(['rgba(235,248,255,0.9)', 'rgba(170,215,235,0.85)']), k: 0 });
      }
      // people in the way are swept inland
      for (const v of [...S.villagers.values()]) {
        if (v.inside || v.air || v.held || v.aboard) continue;
        const rx = v.x - wv.x, ry = v.y - wv.y; const along = rx * wv.dx + ry * wv.dy, side = rx * px + ry * py;
        if (Math.abs(side) > wv.w || along > wv.d || along < wv.d - 1.2 || v._wave === wv) continue;
        v._wave = wv;
        const f = force * (1 - Math.abs(side) / (wv.w + 1));
        const onWater = water(W.idx(v.x, v.y));
        G.Vg.damage(v, (onWater ? 55 : 22 + 40 * f) * G.rr(0.7, 1.2), 'wave', true);
        if (!S.villagers.has(v.id)) { wv.killed++; continue; }
        G.Vg.endTask(v); v.air = true; v.z = 1; v.vz = 120 + 80 * f; v.vx = wv.dx * (1.5 + 2 * f); v.vy = wv.dy * (1.5 + 2 * f); v.fear = Math.min(100, v.fear + 35);
      }
      if (wv.d >= wv.max) {
        m.waves.splice(k, 1);
        G.Render && G.Render.invalidateTerrain(wv.x + wv.dx * wv.coast, wv.y + wv.dy * wv.coast, wv.w + 6);
        const parts = []; if (wv.killed) parts.push(`${wv.killed} ${wv.killed > 1 ? 'mortos' : 'morto'}`); if (wv.lost) parts.push(`${wv.lost} ${wv.lost > 1 ? 'construções destruídas' : 'construção destruída'}`);
        log(`Um maremoto varreu a costa${wv.where ? ' de ' + wv.where : ''}${parts.length ? ': ' + parts.join(', ') : ''}.`, 'wave', wv.x + wv.dx * wv.coast, wv.y + wv.dy * wv.coast);
        G.Lore && G.Lore.note('tsunami', { where: wv.where, killed: wv.killed, lost: wv.lost });
        continue;
      }
      if (G.R() < dt * 3) G.Audio && G.Audio.at(wv.x + wv.dx * wv.d, wv.y + wv.dy * wv.d, 'splash');
    }
  }

  // ---------------- the kraken ----------------
  P.kraken = function (x, y) {
    const S = G.S; const m = M();
    const name = G.mythName();
    m.krakens.push({ id: S.nextId++, x, y, name, st: 'rise', t: 0, life: 75, idle: 0, target: 0, eaten: 0, hp: 260, path: null, pi: 0, face: 1, repath: 0 });
    for (let k = 0; k < 60; k++) G.FX && G.FX.spawn({ x: x + G.rr(-1, 1), y: y + G.rr(-1, 1), h: SEA, z: 0, vz: G.rr(40, 160), vx: G.rr(-1, 1), vy: G.rr(-1, 1), g: 260, life: G.rr(0.8, 1.6), s0: 2, s1: 1, c: G.pick(['rgba(220,240,255,0.9)', 'rgba(120,180,210,0.8)']), k: 0 });
    G.FX && G.FX.ring(x, y, 0.3, 4, 1.4, 'rgba(120,80,160,0.85)', 3, true);
    G.Audio && G.Audio.play('boom'); G.Audio && G.Audio.at(x, y, 'howl', true, 0.6);
    G.Render && G.Render.shake(0.6);
    P.witness(x, y, 16, -3, 25);
    log(`Das profundezas ergueu-se ${name}, o Kraken. Os marinheiros rezam.`, 'naval', x, y);
    G.Lore && G.Lore.note('kraken', { name, where: G.Village.nearSettlementName(x, y) });
  };
  function updateKrakens(dt) {
    const S = G.S; const m = M();
    for (let k = m.krakens.length - 1; k >= 0; k--) {
      const kr = m.krakens[k]; kr.t += dt; kr.life -= dt;
      if (kr.st === 'rise') { if (kr.t > 2) { kr.st = 'hunt'; kr.t = 0; } continue; }
      if (kr.st === 'dive') { if (kr.t > 2.2) { m.krakens.splice(k, 1); } continue; }
      if (kr.hp <= 0) {
        kr.st = 'dive'; kr.t = 0; kr.dead = true;
        const f = G.Fac.get(kr.slayer); log(`${kr.name}, o Kraken, foi morto${f ? ' pela frota de ' + f.name : ''}! Seu corpo afundou no mar.`, 'naval', kr.x, kr.y);
        G.Lore && G.Lore.note('krakenSlain', { name: kr.name, fac: kr.slayer || 0 });
        continue;
      }
      if (kr.life <= 0 || kr.idle > 22 || kr.eaten >= 4) {
        kr.st = 'dive'; kr.t = 0;
        log(`${kr.name} voltou às profundezas${kr.eaten ? ', levando ' + kr.eaten + (kr.eaten > 1 ? ' navios' : ' navio') : ''}.`, 'naval', kr.x, kr.y);
        continue;
      }
      // warships fight back
      for (const s of S.ships) {
        if (s.kind !== 'guerra' || G.dist(s.x, s.y, kr.x, kr.y) > 3.5) continue;
        s.cd = (s.cd || 0) - dt;
        if (s.cd <= 0) { s.cd = 1.4; kr.hp -= G.rr(6, 11) * G.Civ.t(s.fac, 'naval'); kr.slayer = s.fac; G.FX && G.FX.arrow(s.x, s.y, kr.x, kr.y); }
      }
      if (kr.st === 'grab') {
        const s = S.ships.find(q => q.id === kr.target);
        if (!s) { kr.st = 'hunt'; kr.t = 0; continue; }
        s.x = kr.x + Math.cos(kr.t * 3) * 0.2; s.y = kr.y + 0.4; s.path = null;
        if (G.R() < dt * 6) G.FX && G.FX.splash(s.x, s.y, 0.6);
        if (kr.t > 2.6) { kr.eaten++; kr.st = 'hunt'; kr.t = 0; G.Naval.sink(s, null, 'god'); G.Render && G.Render.shake(0.3); }
        continue;
      }
      // hunt the nearest ship on the same sea
      let best = null, bd = 18 * 18;
      for (const s of S.ships) { const d = G.dist2(s.x, s.y, kr.x, kr.y); if (d < bd) { bd = d; best = s; } }
      // swimmers are eaten too
      for (const v of [...S.villagers.values()]) if (!v.aboard && !v.air && G.dist2(v.x, v.y, kr.x, kr.y) < 1.2 && water(W.idx(v.x, v.y))) G.Vg.damage(v, 999, 'kraken', true);
      if (!best) { kr.idle += dt; continue; }
      kr.idle = 0;
      if (bd < 1.1) { kr.st = 'grab'; kr.t = 0; kr.target = best.id; G.Audio && G.Audio.at(kr.x, kr.y, 'collapse', true); continue; }
      kr.repath -= dt;
      if (kr.repath <= 0 || !kr.path) { kr.repath = 1.5; kr.path = G.Naval.seaPath(kr.x, kr.y, best.x, best.y); kr.pi = 0; if (!kr.path) kr.idle += 2; }
      if (kr.path && kr.pi < kr.path.length) {
        const p = kr.path[kr.pi]; const dx = p[0] - kr.x, dy = p[1] - kr.y; const d = Math.hypot(dx, dy); const sp = 2.4 * dt;
        if (d <= sp) { kr.x = p[0]; kr.y = p[1]; kr.pi++; } else { kr.x += dx / d * sp; kr.y += dy / d * sp; }
        if (Math.abs(dx - dy) > 0.02) kr.face = dx - dy > 0 ? 1 : -1;
        if (G.R() < dt * 4) G.FX && G.FX.wake(kr.x, kr.y);
      }
    }
  }

  // ============================== PALAVRA ==============================
  P.prophecy = function (x, y, kind) {
    const S = G.S; const m = M(); const s = setAt(x, y, 12); if (!s || !PROPH[kind]) return;
    const f = G.Fac.get(s.fac); const ruler = f && G.Politics.ruler(f);
    const days = PROPH[kind].days;
    const nextTier = G.City.TIERS[Math.min(4, (s.tier || 0) + 1)];
    const TXT = {
      queda: `“${s.name} cairá antes do ${days}º amanhecer.”`,
      grandeza: `“${s.name} será ${G.gen(nextTier) === 'a' ? 'uma' : 'um'} ${nextTier.toLowerCase()} antes do ${days}º amanhecer.”`,
      morte: ruler ? `“${ruler.name} não verá o ${days}º amanhecer.”` : '',
      sangue: `“O sangue de ${f ? f.name : s.name} correrá antes do ${days}º amanhecer.”`,
      paz: `“A guerra de ${f ? f.name : s.name} terminará antes do ${days}º amanhecer.”`,
    };
    const q = { id: S.nextId++, kind, set: s.id, setName: s.name, fac: s.fac, facName: f ? f.name : '', ruler: ruler ? ruler.id : 0, rulerName: ruler ? ruler.name : '', tier0: s.tier || 0, until: S.day + days, day: S.day, text: TXT[kind], st: 'aberta' };
    m.prophecies.push(q);
    for (const v of S.villagers.values()) if (v.set === s.id) { v.devotion = Math.min(100, v.devotion + 6); if (kind === 'queda' || kind === 'morte') v.fear = Math.min(100, v.fear + 12); }
    if (kind === 'queda') s.loyalty = Math.max(0, s.loyalty - 12);
    if (kind === 'sangue' && ruler) G.Politics.bump(ruler, 'agg', 0.08);
    if (kind === 'paz' && ruler) G.Politics.bump(ruler, 'agg', -0.1);
    G.FX && G.FX.blessing(s.cx, s.cy); G.FX && G.FX.ring(s.cx, s.cy, 0.5, 8, 1.6, 'rgba(255,225,150,0.85)', 2, true);
    G.Audio && G.Audio.play('milestone');
    P.witness(s.cx, s.cy, 12, 5, 4);
    log(`Uma voz do céu falou a ${s.name}: ${q.text}`, 'prophecy', s.cx, s.cy);
    G.Lore && G.Lore.note('prophecy', q);
  };
  function checkProphecies() {
    const S = G.S; const m = M();
    for (const q of m.prophecies) {
      if (q.st !== 'aberta') continue;
      const s = S.settlements.get(q.set); const f = G.Fac.get(q.fac);
      let done = false;
      if (q.kind === 'queda') done = !s || s.fac !== q.fac;
      else if (q.kind === 'grandeza') done = !!s && (s.tier || 0) > q.tier0;
      else if (q.kind === 'morte') done = !S.villagers.has(q.ruler);
      else if (q.kind === 'sangue') done = !!f && f.alive !== false && G.Fac.enemiesOf(f.id).length > 0;
      else if (q.kind === 'paz') done = !f || G.Fac.enemiesOf(f.id).length === 0;
      if (done) {
        q.st = 'cumprida'; q.doneDay = S.day;
        S.faith = Math.min(999, S.faith + 45);
        for (const v of S.villagers.values()) if (G.Fac.idOfV(v) === q.fac || v.set === q.set) { v.devotion = Math.min(100, v.devotion + 15); if (!v.inside && !v.sleeping) G.Vg.emote(v, 'awe', 3); }
        const c = s || G.Fac.capitalOf(q.fac);
        log(`A profecia se cumpriu: ${q.text} Ninguém mais duvida dos céus.`, 'prophecy', c ? c.cx : undefined, c ? c.cy : undefined);
        G.UI && G.UI.notice('Uma profecia se cumpriu. +45 de fé.', 'faith');
        G.Lore && G.Lore.note('prophecyDone', q);
      } else if (S.day > q.until) {
        q.st = 'falhou';
        for (const v of S.villagers.values()) if (G.Fac.idOfV(v) === q.fac) v.devotion = Math.max(0, v.devotion - (v.traits.includes('Cético') ? 14 : 7));
        log(`A profecia sobre ${q.setName} não se cumpriu. Os céticos riem nas praças.`, 'prophecy', s ? s.cx : undefined, s ? s.cy : undefined);
        G.Lore && G.Lore.note('prophecyFail', q);
      }
    }
    if (m.prophecies.length > 40) m.prophecies = m.prophecies.filter(q => q.st === 'aberta').concat(m.prophecies.filter(q => q.st !== 'aberta').slice(-30));
  }

  P.commandment = function (x, y, law) {
    const S = G.S; const f = facAt(x, y); if (!f || !LAWS[law]) return;
    f.law = law; f.lawDay = S.day; f.lawBroken = 0;
    for (const v of peopleOf(f.id)) { v.devotion = Math.min(100, v.devotion + 8); if (!v.inside && !v.sleeping && G.R() < 0.5) G.Vg.emote(v, 'awe', 3); }
    const cap = G.Fac.capitalOf(f.id);
    if (cap) { G.FX && G.FX.anoint(cap.cx, cap.cy); G.FX && G.FX.ring(cap.cx, cap.cy, 0.5, 10, 1.8, 'rgba(255,225,150,0.85)', 2.5, true); }
    G.Audio && G.Audio.play('milestone');
    const c = G.CIVS[f.civ]; const who = c ? c.chronicler : 'os anciãos';
    log(`Você falou a ${f.name}: “${LAWS[law].name}.” ${G.cap(who)} gravaram a lei em pedra.`, 'prophecy', cap ? cap.cx : undefined, cap ? cap.cy : undefined);
    G.Lore && G.Lore.note('law', { fac: f.id, law, name: LAWS[law].name });
  };
  P.inspire = function (x, y, tech) {
    const f = facAt(x, y); if (!f || !G.TECH[tech]) return;
    G.Civ.learn(f, tech, 'divina');
    const cap = G.Fac.capitalOf(f.id);
    if (cap) { G.FX && G.FX.blessing(cap.cx, cap.cy); G.FX && G.FX.ring(cap.cx, cap.cy, 0.5, 7, 1.4, 'rgba(170,210,255,0.9)', 2, true); }
    G.Audio && G.Audio.play('magic');
    for (const v of peopleOf(f.id)) v.devotion = Math.min(100, v.devotion + 4);
  };
  P.sign = function (x, y, kind) {
    const S = G.S; const m = M(); if (!SIGNS[kind]) return;
    const dur = kind === 'eclipse' ? 22 : kind === 'aurora' ? 30 : 26;
    m.sky = { kind, t: dur, max: dur, seed: G.R() };
    G.Audio && G.Audio.play(kind === 'eclipse' ? 'thunderFar' : 'milestone');
    const omen = [];
    for (const f of G.Fac.all()) {
      const pe = G.Politics.leaderPe(f); const ppl = peopleOf(f.id); const cap = G.Fac.capitalOf(f.id);
      const c = G.CIVS[f.civ]; const who = c ? c.chronicler : 'os anciãos';
      if (kind === 'cometa') {
        for (const v of ppl) { v.devotion = Math.min(100, v.devotion + 4); v.fear = Math.min(100, v.fear + 6); }
        if (pe.agg > 0.62) {
          let target = null, lo = 1e9; for (const o of G.Fac.all()) { if (o.id === f.id) continue; const rr = G.Fac.rel(f.id, o.id); if (!rr || !rr.met || rr.st === 'guerra') continue; if (rr.op < lo) { lo = rr.op; target = o; } }
          if (target && lo < 25 && !(S.divinePeace > 0)) { omen.push(`os videntes de ${f.name} viram no cometa um presságio de vitória sobre ${target.name}`); G.Politics.declareWar(f, target, 'presságio'); continue; }
          omen.push(`os videntes de ${f.name} viram no cometa uma espada`);
        } else if (pe.pie > 0.6) { for (const v of ppl) v.devotion = Math.min(100, v.devotion + 8); omen.push(`${f.name} passou a noite em oração`); }
      } else if (kind === 'eclipse') {
        for (const v of ppl) { v.fear = Math.min(100, v.fear + 22); v.devotion = Math.min(100, v.devotion + 8); if (!v.inside && !v.sleeping && G.R() < 0.4) G.Vg.emote(v, 'fear', 3); }
        for (const b of [...G.War.bands.values()]) if (b.fac === f.id && G.R() < 0.6) { G.War.disband(b); omen.push(`o exército de ${f.name} largou as armas e voltou para casa`); break; }
        if (f.gov === 'tirania') { for (const s of G.Fac.settlementsOf(f.id)) s.loyalty = Math.max(0, s.loyalty - 15); omen.push(`em ${f.name} sussurram que o céu julgou o tirano`); }
        if (f.civ === 'asteca') omen.push(`os sacerdotes de ${f.name} dizem que o sol tem fome`);
        if (f.civ === 'nordico') omen.push(`em ${f.name} juram ter visto o lobo engolir o sol`);
        if (f.civ === 'egipcio') omen.push(`em ${f.name} dizem que a serpente atacou o barco do sol`);
      } else if (kind === 'aurora') {
        for (const v of ppl) { v.fear = Math.max(0, v.fear - 18); v.devotion = Math.min(100, v.devotion + 6); }
        for (const s of G.Fac.settlementsOf(f.id)) s.loyalty = Math.min(100, s.loyalty + 10);
      } else if (kind === 'estrelas') {
        for (const v of ppl) v.devotion = Math.min(100, v.devotion + 3);
        if (f.tech && f.tech.cur) { f.tech.pts += G.Civ.techCost(f, f.tech.cur) * 0.25; }
        if (G.Civ.has(f.id, 'escrita')) omen.push(`os escribas de ${f.name} mapearam as estrelas`);
      }
      if (cap && G.R() < 0.5) G.FX && G.FX.faithText && G.FX.faithText(cap.cx, cap.cy, 1);
    }
    const TXT = { cometa: 'Um cometa cruzou o céu de ponta a ponta', eclipse: 'O sol escureceu ao meio-dia', aurora: 'Cortinas de luz dançaram no céu', estrelas: 'Choveram estrelas a noite inteira' };
    log(`${TXT[kind]}.${omen.length ? ' ' + G.cap(omen.slice(0, 3).join('; ')) + '.' : ''}`, 'eye');
    G.Lore && G.Lore.note('sign', { kind, omen });
    P.witness(N / 2, N / 2, N * 2, 3, kind === 'eclipse' ? 12 : 2);
  };
  P.vision = function (x, y) {
    const S = G.S; const v = P.targetAt(x, y, 1.3); if (!v) return;
    v.prophet = true; v.devotion = 100; v.fear = 0;
    const pe = G.Politics.persona(v); pe.pie = 1;
    const f = G.Fac.ofV(v);
    if (!v.ep || v.ep === 'breve' || v.ep === 'velho') v.ep = 'profeta';
    G.FX && G.FX.anoint(v.x, v.y); G.Audio && G.Audio.play('milestone');
    P.witness(v.x, v.y, 10, 10, 2);
    let extra = '';
    if (f) {
      const unmet = G.Fac.all().filter(o => o.id !== f.id && G.Fac.rel(f.id, o.id) && !G.Fac.rel(f.id, o.id).met);
      if (unmet.length && G.R() < 0.7) { const o = G.pick(unmet); G.Politics.meet(f, o); extra = ` Na visão, viu um povo distante: ${o.name}.`; }
      else if (f.tech && f.tech.cur) { f.tech.pts += G.Civ.techCost(f, f.tech.cur) * 0.4; const tn = G.TECH[f.tech.cur].name; extra = ` Na visão, entreviu os segredos ${tn.startsWith('A ') ? 'da' : tn.startsWith('O ') ? 'do' : 'de'} ${tn.replace(/^(A|O) /, '').toLowerCase()}.`; }
    }
    log(`${v.name} caiu em transe e acordou ${v.g === 'f' ? 'profetisa' : 'profeta'}.${extra}`, 'prophecy', v.x, v.y);
    G.Lore && G.Lore.note('vision', { id: v.id, name: v.name, g: v.g, fac: f ? f.id : 0 });
  };
  function preach() {
    const S = G.S;
    for (const p of S.villagers.values()) {
      if (!p.prophet || p.inside || p.sleeping || p.age < 12) continue;
      let n = 0;
      for (const v of S.villagers.values()) {
        if (v === p || v.inside || G.dist2(v.x, v.y, p.x, p.y) > 25) continue;
        v.devotion = Math.min(100, v.devotion + (v.traits.includes('Cético') ? 0.5 : 1.6)); n++;
        if (G.R() < 0.08) G.Vg.emote(v, 'awe', 2);
      }
      if (n >= 3 && G.R() < 0.15) G.Vg.emote(p, 'awe', 2.5);
    }
  }

  // ============================== DÁDIVAS / IRA / DESTINO ==============================
  P.golden = function (x, y) {
    const S = G.S; const f = facAt(x, y); if (!f) return;
    f.golden = DAY() * 3; f.goldenN = (f.goldenN || 0) + 1;
    for (const s of G.Fac.settlementsOf(f.id)) { s.loyalty = Math.min(100, s.loyalty + 15); G.FX && G.FX.blessing(s.cx, s.cy); G.FX && G.FX.ring(s.cx, s.cy, 0.5, 7, 1.8, 'rgba(255,215,110,0.9)', 2.5, true); }
    for (const v of peopleOf(f.id)) { v.devotion = Math.min(100, v.devotion + 8); v.fear = Math.max(0, v.fear - 10); }
    G.FX && (G.FX.flash = 0.35); G.FX && (G.FX.flashColor = '255,228,150');
    G.Audio && G.Audio.play('milestone');
    const cap = G.Fac.capitalOf(f.id);
    log(`Começou a Era de Ouro de ${f.name}. Os celeiros transbordam, as obras voam, os sábios não dormem.`, 'star', cap ? cap.cx : undefined, cap ? cap.cy : undefined);
    G.Lore && G.Lore.note('golden', { fac: f.id });
  };
  P.curse = function (x, y) {
    const S = G.S; const f = facAt(x, y); if (!f) return;
    f.curse = DAY() * 2;
    for (const s of G.Fac.settlementsOf(f.id)) { s.loyalty = Math.max(0, s.loyalty - 8); G.FX && G.FX.discord(s.cx, s.cy); }
    for (const v of peopleOf(f.id)) { v.fear = Math.min(100, v.fear + 15); v.devotion = Math.min(100, v.devotion + 3); if (!v.inside && !v.sleeping && G.R() < 0.3) G.Vg.emote(v, 'fear', 3); }
    G.Audio && G.Audio.play('plague');
    const cap = G.Fac.capitalOf(f.id);
    log(`Uma maldição caiu sobre ${f.name}. O trigo murcha, os ventres secam, os peixes fogem.`, 'sick', cap ? cap.cx : undefined, cap ? cap.cy : undefined);
    G.Lore && G.Lore.note('curse', { fac: f.id });
  };
  P.hero = function (x, y) {
    const S = G.S; const v = P.targetAt(x, y, 1.3); if (!v) return;
    v.chosen = true; v.hero = true; v.courage = 1; v.hp = 100; v.fear = 0; v.sick = 0;
    const f = G.Fac.ofV(v);
    if (v.age >= 16 && v.age <= 55 && v.role !== 'guerreiro' && f && f.leader !== v.id) { v.role = 'guerreiro'; G.Vg.endTask(v); }
    if (f && f.leader === v.id) G.Politics.earn(f, v, 'escolhido', true); else v.ep = 'escolhido';
    G.FX && G.FX.anoint(v.x, v.y); G.FX && G.FX.fury(v.x, v.y, 1.5);
    G.Audio && G.Audio.play('horn');
    P.witness(v.x, v.y, 12, 10, 6);
    log(`Os céus escolheram ${v.name}${f ? ', de ' + f.name : ''}, como seu campeão. De hoje em diante chamam-n${oa(v)} de ${v.name}, ${G.Politics.epithet(v)}.`, 'war', v.x, v.y);
    G.Lore && G.Lore.note('hero', { id: v.id, name: v.name, g: v.g, fac: f ? f.id : 0 });
  };
  P.divwall = function (x, y) {
    const S = G.S; const s = setAt(x, y, 12); if (!s) return;
    const p = P.byId('divwall');
    const w = G.Siege.raiseWalls(s, 'pedra', true);
    if (!w || !w.done) { S.faith = Math.min(999, S.faith + p.cost); G.UI && G.UI.notice('As muralhas não encontraram onde se erguer. A fé foi devolvida.', 'wall'); return; }
    for (const i of w.tiles) if (G.R() < 0.4) G.FX && G.FX.dust((i % N) + 0.5, ((i / N) | 0) + 0.5, 2);
    G.FX && G.FX.ring(s.cx, s.cy, 0.5, 10, 1.6, 'rgba(220,210,190,0.9)', 3, true);
    G.Render && G.Render.shake(0.7); G.Audio && G.Audio.play('quake');
    P.witness(s.cx, s.cy, 14, 9, 8);
    log(`Numa só noite, muralhas de pedra ergueram-se do chão ao redor de ${s.name}.`, 'wall', s.cx, s.cy);
    G.Lore && G.Lore.note('divwall', { set: s.id, name: s.name, fac: s.fac });
  };

  // ------------------------------ ticking ------------------------------
  let tFac = 0, tPro = 0, tPreach = 0;
  function facTick(dt) {
    const S = G.S;
    for (const f of G.Fac.all()) {
      if (f.golden > 0) {
        f.golden -= dt;
        for (const s of G.Fac.settlementsOf(f.id)) s.loyalty = Math.min(100, s.loyalty + 0.6);
        if (f.golden <= 0) { f.golden = 0; const cap = G.Fac.capitalOf(f.id); log(`A Era de Ouro de ${f.name} chegou ao fim. Os velhos vão falar dela para sempre.`, 'star', cap ? cap.cx : undefined, cap ? cap.cy : undefined); G.Lore && G.Lore.note('goldenEnd', { fac: f.id }); }
      }
      if (f.curse > 0) {
        f.curse -= dt;
        for (const s of G.Fac.settlementsOf(f.id)) s.loyalty = Math.max(0, s.loyalty - 0.5);
        if (G.R() < 0.25) { const ppl = peopleOf(f.id); if (ppl.length) { const v = G.pick(ppl); if (!(v.immune > 0) && !(v.sick > 0)) v.sick = DAY() * G.rr(0.25, 0.5); } }
        if (f.curse <= 0) { f.curse = 0; const cap = G.Fac.capitalOf(f.id); log(`A maldição sobre ${f.name} se dissipou.`, 'heal', cap ? cap.cx : undefined, cap ? cap.cy : undefined); }
      }
      if (f.law === 'paz') {
        const war = G.Fac.enemiesOf(f.id).length > 0;
        if (war && !f.lawBroken) {
          f.lawBroken = 1;
          for (const v of peopleOf(f.id)) v.devotion = Math.max(0, v.devotion - 10);
          const cap = G.Fac.capitalOf(f.id);
          log(`${f.name} pegou em armas, apesar do mandamento “Não matarás”. Os devotos choram o pecado.`, 'prophecy', cap ? cap.cx : undefined, cap ? cap.cy : undefined);
          G.Lore && G.Lore.note('sin', { fac: f.id });
        } else if (!war) f.lawBroken = 0;
      }
    }
  }
  P.updateMiracles = function (dt) {
    const S = G.S; const m = M();
    tFac += dt; if (tFac >= 5) { facTick(tFac); tFac = 0; }
    tPro += dt; if (tPro >= 2) { tPro = 0; checkProphecies(); }
    tPreach += dt; if (tPreach >= 4) { tPreach = 0; preach(); }
    for (const s of S.ships) if (s.windT > 0) {
      s.windT -= dt;
      if (s.windT <= 0) { s.windT = 0; if (!(s.stormT > 0)) s.wind = 1; }
      else if (s.moving && G.FX && G.R() < dt * 2) G.FX.spawn({ x: s.x, y: s.y, h: G.SEA, z: 14, vx: Math.cos(S.weather.windA) * 3, vy: Math.sin(S.weather.windA) * 3, life: 0.8, s0: 0.9, s1: 0.3, c: 'rgba(255,255,255,0.7)', k: 11 });
    }
    for (const vo of m.volcanoes) updateVolcano(vo, dt);
    updateBombs(dt);
    updateLava(dt);
    if (m.storms.length) updateStorms(dt);
    if (m.waves.length) updateWaves(dt);
    if (m.krakens.length) updateKrakens(dt);
    if (m.sky) { m.sky.t -= dt; if (m.sky.t <= -2) m.sky = null; }
  };
  P.resetMiracles = function () { tFac = 0; tPro = 0; tPreach = 0; };

  // ------------------------------ drawing ------------------------------
  function tileQuad(ctx, proj, x, y) {
    const a = proj(x, y, W.vh(x, y)), b = proj(x + 1, y, W.vh(x + 1, y)), c = proj(x + 1, y + 1, W.vh(x + 1, y + 1)), d = proj(x, y + 1, W.vh(x, y + 1));
    ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath();
  }
  // glowing lava on the ground (drawn before the lighting pass)
  P.drawGround = function (ctx, proj, t) {
    const S = G.S; const m = S.mir; if (!m) return;
    let any = false; for (const k in m.lava) { any = true; break; }
    if (!any) return;
    for (const k in m.lava) {
      const i = +k, x = i % N, y = (i / N) | 0; const life = m.lava[k];
      const hot = G.clamp(life / 40, 0, 1);
      ctx.beginPath(); tileQuad(ctx, proj, x, y);
      ctx.fillStyle = `rgb(${Math.round(90 + 165 * hot)},${Math.round(30 + 90 * hot * (0.8 + 0.2 * Math.sin(t * 3 + i)))},${Math.round(20 + 20 * hot)})`;
      ctx.fill();
    }
  };
  // lava and craters keep glowing at night
  P.drawGlow = function (ctx, proj, t, nightF) {
    const S = G.S; const m = S.mir; if (!m) return;
    for (const k in m.lava) {
      const i = +k, x = i % N, y = (i / N) | 0; const hot = G.clamp(m.lava[k] / 40, 0, 1);
      ctx.globalAlpha = (0.25 + 0.55 * nightF) * hot;
      ctx.fillStyle = '#ff7a2a'; ctx.beginPath(); tileQuad(ctx, proj, x, y); ctx.fill();
    }
    for (const vo of m.volcanoes) if (vo.erupt > 0) {
      const p = proj(vo.x, vo.y, W.groundH(vo.x, vo.y));
      ctx.globalAlpha = 0.35 + 0.5 * nightF; const r = 26 + 6 * Math.sin(t * 5);
      ctx.drawImage(G.Art.glow('fire'), p[0] - r * 2, p[1] - r * 2, r * 4, r * 4);
    }
    ctx.globalAlpha = 1;
  };
  // monsters, waves and bombs (world space, above the entities)
  P.drawWorld = function (ctx, proj, t) {
    const S = G.S; const m = S.mir; if (!m) return;
    // lava bombs
    for (const b of m.bombs) {
      const f = b.t / b.T; const x = b.x0 + (b.x - b.x0) * f, y = b.y0 + (b.y - b.y0) * f;
      const h = b.h0 + (W.groundH(b.x, b.y) - b.h0) * f; const z = Math.sin(f * Math.PI) * 60;
      const p = proj(x, y, h);
      ctx.fillStyle = '#ffb347'; ctx.beginPath(); ctx.arc(p[0], p[1] - z, 2.2, 0, 6.29); ctx.fill();
      ctx.fillStyle = 'rgba(255,90,30,0.5)'; ctx.beginPath(); ctx.arc(p[0], p[1] - z, 4, 0, 6.29); ctx.fill();
    }
    // the tidal wave: a curling wall of water
    for (const wv of m.waves) {
      const px = -wv.dy, py = wv.dx; const pts = [], back = [];
      for (let s = -wv.w; s <= wv.w + 0.01; s += 0.5) {
        const fx = wv.x + wv.dx * wv.d + px * s, fy = wv.y + wv.dy * wv.d + py * s;
        const bx = fx - wv.dx * 1.6, by = fy - wv.dy * 1.6;
        const edge = 1 - Math.abs(s) / (wv.w + 1);
        const inland = wv.d - wv.coast;
        const hgt = (inland > 0 ? Math.max(0.2, 1 - inland / 6) : 1) * (1.6 + edge * 2.2);
        const gh = W.inb(fx, fy) ? W.groundH(fx, fy) : SEA; const bh = W.inb(bx, by) ? W.groundH(bx, by) : SEA;
        pts.push(proj(fx, fy, Math.max(gh, SEA) + hgt * (0.9 + 0.1 * Math.sin(t * 6 + s))));
        back.push(proj(bx, by, Math.max(bh, SEA) + 0.1));
      }
      ctx.beginPath(); ctx.moveTo(back[0][0], back[0][1]);
      for (const p of back) ctx.lineTo(p[0], p[1]);
      for (let q = pts.length - 1; q >= 0; q--) ctx.lineTo(pts[q][0], pts[q][1]);
      ctx.closePath(); ctx.fillStyle = 'rgba(70,150,190,0.75)'; ctx.fill();
      ctx.beginPath(); for (let q = 0; q < pts.length; q++) { if (q === 0) ctx.moveTo(pts[q][0], pts[q][1]); else ctx.lineTo(pts[q][0], pts[q][1]); }
      ctx.strokeStyle = 'rgba(240,250,255,0.95)'; ctx.lineWidth = 2.6; ctx.stroke();
      ctx.strokeStyle = 'rgba(200,235,250,0.6)'; ctx.lineWidth = 1.2; ctx.beginPath(); for (let q = 0; q < pts.length; q++) { const p = pts[q]; if (q === 0) ctx.moveTo(p[0], p[1] + 3); else ctx.lineTo(p[0], p[1] + 3); } ctx.stroke();
    }
    // the kraken
    for (const kr of m.krakens) {
      const p = proj(kr.x, kr.y, SEA);
      const rise = kr.st === 'rise' ? G.clamp(kr.t / 2, 0, 1) : kr.st === 'dive' ? G.clamp(1 - kr.t / 2.2, 0, 1) : 1;
      if (rise <= 0) continue;
      ctx.save(); ctx.translate(p[0], p[1]);
      // dark water under it
      ctx.fillStyle = 'rgba(20,20,45,0.35)'; ctx.beginPath(); ctx.ellipse(0, 0, 30 * rise, 14 * rise, 0, 0, 6.29); ctx.fill();
      // tentacles
      const grab = kr.st === 'grab';
      for (let q = 0; q < 7; q++) {
        const a = q / 7 * Math.PI * 2 + t * 0.4;
        const len = (grab ? 26 : 20 + 8 * Math.sin(t * 2 + q)) * rise;
        const bx = Math.cos(a) * 9, by = Math.sin(a) * 4;
        const tx = Math.cos(a) * len, ty = Math.sin(a) * len * 0.5 - (grab ? 10 + 8 * Math.sin(t * 5 + q) : 6 + 6 * Math.sin(t * 3 + q * 1.7));
        const cx = (bx + tx) / 2 + Math.sin(t * 3 + q) * 6, cy = (by + ty) / 2 - 14 * rise;
        ctx.strokeStyle = '#4a2a5c'; ctx.lineWidth = 4.2 * rise; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(cx, cy, tx, ty); ctx.stroke();
        ctx.strokeStyle = '#8a5aa0'; ctx.lineWidth = 1.4 * rise;
        ctx.beginPath(); ctx.moveTo(bx, by - 1); ctx.quadraticCurveTo(cx, cy - 1, tx, ty - 1); ctx.stroke();
      }
      // head
      const hy = -10 * rise;
      ctx.fillStyle = '#3c2250'; ctx.beginPath(); ctx.ellipse(0, hy, 11 * rise, 13 * rise, 0, Math.PI, 0); ctx.lineTo(11 * rise, hy + 4); ctx.lineTo(-11 * rise, hy + 4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#5e3a74'; ctx.beginPath(); ctx.ellipse(-3 * rise, hy - 6 * rise, 4 * rise, 5 * rise, -0.4, 0, 6.29); ctx.fill();
      ctx.fillStyle = '#ffd24a'; for (const ex of [-4.5, 4.5]) { ctx.beginPath(); ctx.ellipse(ex * rise, hy + 0.5, 2.2 * rise, 1.6 * rise, 0, 0, 6.29); ctx.fill(); }
      ctx.fillStyle = '#1a1020'; for (const ex of [-4.5, 4.5]) { ctx.beginPath(); ctx.ellipse(ex * rise, hy + 0.5, 0.6 * rise, 1.4 * rise, 0, 0, 6.29); ctx.fill(); }
      // foam ring
      ctx.strokeStyle = `rgba(235,248,255,${0.6 * rise})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(0, 2, 16 * rise + Math.sin(t * 4) * 1.5, 6 * rise, 0, 0, 6.29); ctx.stroke();
      if (kr.hp < 260) { ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(-12, hy - 20, 24, 3); ctx.fillStyle = '#c05ae0'; ctx.fillRect(-12, hy - 20, 24 * Math.max(0, kr.hp) / 260, 3); }
      ctx.restore();
    }
  };
  // omens in the sky (screen space)
  P.drawSky = function (ctx, w, h, t, dpr) {
    const m = G.S && G.S.mir; if (!m || !m.sky) return;
    const sk = m.sky; const life = sk.max - sk.t; const fade = G.clamp(Math.min(life / 2.5, (sk.t + 2) / 3), 0, 1);
    if (fade <= 0) return;
    ctx.save();
    if (sk.kind === 'eclipse') {
      ctx.fillStyle = `rgba(8,8,24,${0.62 * fade})`; ctx.fillRect(0, 0, w, h);
      const cx = w * 0.36, cy = h * 0.2, r = Math.min(w, h) * 0.065;
      const g = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 2.6); g.addColorStop(0, `rgba(255,245,210,${0.9 * fade})`); g.addColorStop(0.3, `rgba(255,220,150,${0.35 * fade})`); g.addColorStop(1, 'rgba(255,220,150,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r * 2.6, 0, 6.29); ctx.fill();
      ctx.fillStyle = `rgba(6,6,12,${fade})`; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.29); ctx.fill();
    } else if (sk.kind === 'cometa') {
      const f = life / sk.max; const cx = w * (0.08 + f * 0.62), cy = h * (0.12 + f * 0.1);
      const len = Math.min(w, h) * 0.55;
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createLinearGradient(cx, cy, cx - len, cy - len * 0.25); g.addColorStop(0, `rgba(255,250,230,${0.95 * fade})`); g.addColorStop(0.2, `rgba(170,210,255,${0.45 * fade})`); g.addColorStop(1, 'rgba(120,170,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx, cy - 5 * dpr); ctx.lineTo(cx - len, cy - len * 0.25 - 30 * dpr); ctx.lineTo(cx - len, cy - len * 0.25 + 30 * dpr); ctx.lineTo(cx, cy + 5 * dpr); ctx.closePath(); ctx.fill();
      ctx.fillStyle = `rgba(255,255,245,${fade})`; ctx.beginPath(); ctx.arc(cx, cy, 5 * dpr, 0, 6.29); ctx.fill();
      ctx.fillStyle = `rgba(200,225,255,${0.4 * fade})`; ctx.beginPath(); ctx.arc(cx, cy, 13 * dpr, 0, 6.29); ctx.fill();
    } else if (sk.kind === 'aurora') {
      // curtains of light: thin vertical strokes hanging from wavy ribbons
      ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = 3 * dpr;
      for (let b = 0; b < 3; b++) {
        const col = ['90,255,170', '120,210,255', '210,130,255'][b];
        const base = h * (0.1 + b * 0.06), len = h * (0.16 - b * 0.03);
        for (let x = 0; x <= w; x += 5 * dpr) {
          const y0 = base + Math.sin(x * 0.0035 + t * (0.5 + b * 0.2) + b * 2) * h * 0.05;
          const a = (0.5 + 0.5 * Math.sin(x * 0.02 + t * 1.3 + b)) * 0.22 * fade;
          const g = ctx.createLinearGradient(0, y0, 0, y0 + len); g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(0.3, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
          ctx.strokeStyle = g; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + len); ctx.stroke();
        }
      }
    } else if (sk.kind === 'estrelas') {
      ctx.fillStyle = `rgba(10,14,40,${0.25 * fade})`; ctx.fillRect(0, 0, w, h * 0.5);
      ctx.strokeStyle = `rgba(255,250,220,${0.85 * fade})`; ctx.lineWidth = 1.3 * dpr; ctx.beginPath();
      for (let k = 0; k < 18; k++) {
        const ph = ((t * (0.6 + G.hash(k * 5) * 0.8) + G.hash(k * 3 + 1)) % 1);
        const sx = w * G.hash(k * 7 + 2) + ph * w * 0.25, sy = h * 0.05 + h * 0.3 * G.hash(k * 11) + ph * h * 0.12;
        ctx.moveTo(sx, sy); ctx.lineTo(sx - 30 * dpr * (1 - ph), sy - 14 * dpr * (1 - ph));
      }
      ctx.stroke();
    }
    ctx.restore();
  };

  // ------------------------------ save ------------------------------
  G.saveHooks = G.saveHooks || [];
  G.saveHooks.push({
    save(out, r) {
      const m = G.S.mir; if (!m) return;
      const lava = {}; for (const k in m.lava) lava[k] = Math.round(m.lava[k]);
      out.mir = { volcanoes: m.volcanoes.map(v => Object.assign({}, v, { flows: [] })), lava, prophecies: m.prophecies, sky: m.sky };
    },
    load(o) {
      const m = M();
      if (o.mir) { m.volcanoes = o.mir.volcanoes || []; m.lava = o.mir.lava || {}; m.prophecies = o.mir.prophecies || []; m.sky = o.mir.sky || null; }
      for (const s of G.S.ships) { if (s.windT > 0) s.wind = 1.8; else s.wind = 1; s.stormT = 0; }
    },
  });
})(window.G);
