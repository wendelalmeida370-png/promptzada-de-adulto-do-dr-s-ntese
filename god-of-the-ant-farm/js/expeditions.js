'use strict';
// ============================================================
//  Expeditions: why a people looks past the horizon, and what happens
//  to the ones who go.
//
//  There is never a timer. A people explores because something pushes:
//    economy   no iron, no gold, no timber, no room, no fish left near home
//    politics  an ambitious ruler, prestige, a rival who is already out there
//    culture   a seafaring people, a curious one — or one that fears the sea
//    stories   a rumour (a fisherman blown off by a storm, a merchant's tale,
//              a plank of a strange hull on the beach), an old taboo
//    persons   an adventurer, a merchant who smells profit, someone looking
//              for a husband lost at sea
//  ...and a people changes with its history: saved by the sea in a famine it
//  turns to the sea; three ships that never came back from the west make
//  "nobody sails west" a law for generations.
//
//  The expedition is an entity with real people: a leader, a sponsor, a
//  crew (sailors, soldiers, a cartographer, a naturalist, workers), ships
//  (built for it on the slip, or a canoe), provisions carried crate by crate
//  to the quay. It is prepared, the families say goodbye, it sails; the sea
//  happens to it (a library of events that look at where it is, the weather,
//  the beasts, the ship, the crew); it sights land, approaches, finds a safe
//  beach, lands, explores, maps, names; it meets people or nobody; it comes
//  home — and only then does its people know. If everyone dies, nobody knows.
//  Shipwrecks leave castaways, rafts, wrecks, rumours. Colonies are founded
//  only where a people knows the land and has a reason to go.
// ============================================================
(function (G) {
  const Nv = G.Naval, K = G.Know; if (!Nv || !K) return;
  let N = G.N; G.mapHooks.push(n => { N = n; });
  const W = G.W, T = G.T;
  const X = G.Expe = {};
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);
  const DAY = () => G.DAY_LEN;
  const TAU = Math.PI * 2;
  const P = id => (id && G.S.villagers.get(id)) || null;
  const PD = id => (id ? G.person(id) : null);
  const F = id => G.Fac.get(id);
  const ship = id => G.S.ships.find(o => o.id === id) || null;
  const pick = a => a[Math.floor(G.R() * a.length)];
  const cap1 = t => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);
  const oa = v => (v && v.g === 'f' ? 'a' : 'o');
  const clamp = G.clamp;
  const FOOD = 2; // meals a day
  const exps = () => G.S.exps || (G.S.exps = []);
  X.list = exps;
  X.get = id => exps().find(e => e.id === id) || null;
  X.CAP = { canoa: 3, jangada: 5, pesca: 5, explorador: 14, mercante: 10, guerra: 16, transporte: 22 };
  const LIVE = { prep: 1, reunir: 1, embarque: 1, partida: 1, viagem: 1, aproximacao: 1, desembarque: 1, exploracao: 1, contato: 1, reembarque: 1, volta: 1, chegada: 1, fundacao: 1 };
  X.live = e => !!LIVE[e.st];
  X.active = fid => exps().filter(e => X.live(e) && (!fid || e.fac === fid));
  // "d" + a name: "da Aurora", "do barco Gaivota", "de Leif e o Mar"
  const ofN = n => (!n ? 'de um barco' : /^(a|o|as|os) /.test(n) ? n.replace(/^(a|o|as|os) /, (m, x) => 'd' + x + ' ') : /^(A|O|As|Os) /.test(n) ? n.replace(/^(A|O|As|Os) /, (m, x) => 'd' + x.toLowerCase() + ' ') : 'de ' + n);
  X.ofN = ofN;
  const DIRS = { leste: 'ao Leste', nordeste: 'ao Nordeste', norte: 'ao Norte', noroeste: 'ao Noroeste', oeste: 'ao Oeste', sudoeste: 'ao Sudoeste', sul: 'ao Sul', sudeste: 'ao Sudeste' };

  // ====================================================================================
  //  A PEOPLE AND THE SEA
  // ====================================================================================
  // maritime affinity, curiosity, expansionism, risk tolerance: born of the culture, made by history
  // the love of the sea: what the culture brings, and — more — where the people lives
  // (an island people turns to the water whatever its gods; a people of the steppe needs a reason)
  function baseAff(f) {
    const t = (k, d) => G.Civ.t(f.id, k, d === undefined ? 1 : d);
    const cap = G.Fac.capitalOf(f.id); const r = cap && K.at(cap.cx, cap.cy);
    const island = !!r && r.kind !== 'continente'; const coastal = !!(cap && G.City && G.City.coastal(cap));
    const seaWorld = G.S.mapType === 'mar' || G.S.mapType === 'arquipelago';
    const h = G.hash(f.id * 131 + 1) - 0.5;
    return clamp(0.25 + (t('naval') - 1) * 0.55 + (t('fish') - 1) * 0.3 + (t('colonize') - 1) * 0.2 + (island || (seaWorld && coastal) ? (seaWorld ? 0.3 : 0.2) : 0) + (coastal ? 0.08 : -0.15) + h * 0.12, 0.03, 0.98);
  }
  X.baseAff = baseAff;
  X.prof = function (f) {
    if (f.sea) {
      // (worlds saved before the sea had its say: the place counts now)
      if (!f.sea.v) { f.sea.v = 2; f.sea.aff = Math.max(f.sea.aff, baseAff(f) * 0.9); }
      return f.sea;
    }
    const t = (k, d) => G.Civ.t(f.id, k, d === undefined ? 1 : d);
    const pe = G.Politics.leaderPe(f); const h = k => G.hash(f.id * 131 + k) - 0.5;
    f.sea = {
      v: 2, aff: baseAff(f),
      cur: clamp(0.3 + (t('research') - 1) * 0.8 + h(2) * 0.2, 0.05, 0.95),
      exp: clamp(0.22 + (t('expansion') - 1) * 0.8 + (t('colonize') - 1) * 0.4 + pe.amb * 0.15 + h(3) * 0.15, 0.03, 0.95),
      risk: clamp(0.35 + G.Civ.t(f.id, 'courage', 0) + pe.agg * 0.15 + h(4) * 0.16, 0.05, 0.95),
      trad: 0, lost: 0, won: 0, n: 0, taboo: null, era: null, last: -99, saved: 0, d: G.S.day,
    };
    return f.sea;
  };
  // the present ruler colours it all: a bold one dares, a cautious one waits
  function eff(f) {
    const p = X.prof(f); const pe = G.Politics.leaderPe(f); const ru = G.Politics.ruler(f);
    const curious = ru && (ru.traits || []).includes('Curioso') ? 0.12 : 0;
    return { aff: p.aff, cur: clamp(p.cur * 0.75 + curious + (pe.amb - 0.5) * 0.15, 0, 1), exp: clamp(p.exp * 0.6 + pe.amb * 0.4, 0, 1), risk: clamp(p.risk * 0.65 + pe.agg * 0.25 + (ru && ru.courage > 0.6 ? 0.1 : 0), 0, 1), p, pe };
  }
  // history leaves its mark: X.mark(f, 'achou' | 'perdeu' | 'salvo' | 'vitoria' | 'derrota' | 'colonia')
  X.mark = function (f, k, o) {
    const p = X.prof(f); o = o || {};
    if (k === 'achou') { p.aff = clamp(p.aff + 0.04, 0, 0.98); p.cur = clamp(p.cur + 0.03, 0, 0.98); p.trad++; p.won++; }
    if (k === 'voltou') { p.aff = clamp(p.aff + 0.015, 0, 0.98); p.trad += 0.5; }
    if (k === 'perdeu') { p.risk = clamp(p.risk - 0.06, 0.03, 1); p.aff = clamp(p.aff - 0.04, 0.02, 1); p.lost++; (p.lostDirs || (p.lostDirs = [])).push({ d: G.S.day, a: o.a }); taboo(f, o); }
    if (k === 'salvo') { p.aff = clamp(p.aff + 0.08, 0, 0.98); p.saved++; }
    if (k === 'vitoria') { p.trad += 2; p.aff = clamp(p.aff + 0.03, 0, 0.98); }
    if (k === 'derrota') { p.aff = clamp(p.aff - 0.02, 0.02, 1); }
    if (k === 'colonia') { p.exp = clamp(p.exp + 0.04, 0, 0.98); }
    era(f);
  };
  // three ships lost the same way: "nobody sails west" — for generations
  function taboo(f, o) {
    const p = X.prof(f); if (o.a === undefined) return;
    const same = (p.lostDirs || []).filter(q => G.S.day - q.d < 40 && q.a !== undefined && Math.abs(Math.atan2(Math.sin(q.a - o.a), Math.cos(q.a - o.a))) < 0.8);
    if (same.length < 2 || (p.taboo && p.taboo.until > G.S.day)) return;
    const dir = K.aDir(o.a); const cap = G.Fac.capitalOf(f.id);
    p.taboo = { a: o.a, dir, until: G.S.day + Math.round(G.rr(35, 75)), d: G.S.day, n: same.length };
    log(`Em ${cap ? cap.name : f.name}, ninguém mais navega para ${dir === 'oeste' || dir === 'leste' || dir === 'norte' || dir === 'sul' ? 'o ' + dir : 'o ' + dir}: ${same.length} expedições foram para lá e não voltaram. As mães usam o ${dir} para assustar as crianças.`, 'scroll', cap ? cap.cx : undefined, cap ? cap.cy : undefined);
    G.Lore && G.Lore.note && G.Lore.note('taboo', { fac: f.id, dir });
    G.Stories && G.Stories.signal('seaTaboo', { fac: f.id, dir });
  }
  function era(f) {
    const p = X.prof(f); const last = exps().filter(e => e.fac === f.id && e.end && G.S.day - e.end < 30).slice(-4);
    const good = last.filter(e => e.status === 'voltou' && (e.disc || []).length).length, bad = last.filter(e => e.status === 'perdida' || e.status === 'naufragada').length;
    const nu = good >= 2 && good > bad ? 'expansao' : bad >= 2 && bad > good ? 'recolhimento' : p.era;
    if (nu && nu !== p.era) {
      p.era = nu; p.eraD = G.S.day; const cap = G.Fac.capitalOf(f.id);
      log(nu === 'expansao' ? `Começa para ${f.name} uma era de navegações: os estaleiros não param, e cada criança de ${cap ? cap.name : 'lá'} quer ser marinheiro.` : `${f.name} dá as costas ao mar. Depois de tantos que não voltaram, os barcos só vão até onde ainda se vê a praia.`, 'ship', cap ? cap.cx : undefined, cap ? cap.cy : undefined);
    }
  }

  // ====================================================================================
  //  WHAT PUSHES
  // ====================================================================================
  function ownRegions(fid) { const s = new Set(); for (const set of G.Fac.settlementsOf(fid)) { const r = K.at(set.cx, set.cy); if (r) s.add(r); } return s; }
  X.ownRegions = ownRegions;
  function knownOre(fid, kind, own) {
    for (const o of G.S.ores || []) { if (o.kind !== kind || o.amt <= 0) continue; const k = K.knowsOre(fid, o.id); if (!k) continue; const r = K.at(o.x, o.y); if (!own || own.has(r)) return o; }
    return null;
  }
  X.pressure = function (f) {
    const S = G.S; const pop = G.Fac.pop(f.id); const st = f.stock; const own = ownRegions(f.id);
    const p = { ferro: 0, ouro: 0, terra: 0, comida: 0, madeira: 0, pesca: 0, rival: 0, gloria: 0 };
    const has = t => G.Civ.has(f.id, t);
    if ((has('bronze') || has('ferro')) && !knownOre(f.id, 'ferro', own) && (st.minerio || 0) < 6) p.ferro = 0.42 + (has('ferro') ? 0.18 : 0) + (G.Fac.enemiesOf(f.id).length ? 0.2 : 0) + (pop > 80 ? 0.1 : 0);
    if (has('moeda') && !knownOre(f.id, 'ouro', own)) p.ouro = 0.22 + G.Politics.leaderPe(f).amb * 0.2;
    let land = 0; for (const r of own) land += r.n;
    const dens = pop / Math.max(20, land * 0.06);
    p.terra = clamp((dens - 0.55) * 0.9, 0, 0.9) + (G.Fac.settlementsOf(f.id).some(s => (s.fails || 0) >= 4) ? 0.25 : 0);
    p.comida = st.food < pop * 1.2 ? 0.55 : st.food < pop * 2 ? 0.2 : 0;
    let trees = 0; for (const r of own) trees += r.trees; if (trees < pop * 0.8 && st.wood < 40) p.madeira = 0.4;
    // the near waters fished out: the boats come back light
    let spots = 0, worn = 0; for (const b of S.buildings.values()) if (b.type === 'doca' && b.spots && G.Village.facOfSet(b.set) === f.id) for (const o of b.spots) { spots++; if ((o.p || 0) > 3) worn++; }
    if (spots >= 3 && worn / spots > 0.5) p.pesca = 0.35;
    // a rival is already out there
    if (exps().some(e => e.fac !== f.id && G.S.day - e.day0 < 12 && G.Fac.rel(f.id, e.fac) && G.Fac.rel(f.id, e.fac).met)) p.rival = 0.3;
    p.gloria = Math.max(0, G.Politics.leaderPe(f).amb - 0.55) * 0.8;
    return p;
  };

  // ====================================================================================
  //  WHERE TO GO, AND WHY
  // ====================================================================================
  function home(f) { const docks = Nv.docksOf(f.id).filter(d => { const i = Nv.dockInfo(d); return i.moor && Nv.openSea(i.moor[0], i.moor[1]); }); return docks; }
  function compOf(d) { const i = Nv.dockInfo(d); return Nv.compAt(i.moor[0], i.moor[1]); }
  function reachRegion(r, comp) { for (const i of r.coast) { const x = i % N, y = (i / N) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (W.inb(nx, ny) && G.S.type[ny * N + nx] <= T.SEA && Nv.compAt(nx, ny) === comp) return true; } } return false; }
  // how much of the sea in a direction this people has never seen
  function unknownToward(f, a, x0, y0, R) {
    const me = K.of(f.id); let u = 0, n = 0;
    for (let d = 8; d < R; d += 8) { const x = x0 + Math.cos(a) * d, y = y0 + Math.sin(a) * d; if (!W.inb(x, y)) break; n++; if (!me.c[K.cell(x, y)]) u++; }
    return n ? u / n : 0;
  }
  // the screen angle of a world direction, and back (taboos are about where the god sees west)
  const angW = (dx, dy) => Math.atan2(dy, dx);
  function tabooHit(f, wx, wy) { const p = X.prof(f); if (!p.taboo || p.taboo.until < G.S.day) return false; const a = K.dirA(wx, wy); return Math.abs(Math.atan2(Math.sin(a - p.taboo.a), Math.cos(a - p.taboo.a))) < 0.8; }
  function candidates(f, docks, pr, ef) {
    const S = G.S; const out = []; const comp = compOf(docks[0]); const di = Nv.dockInfo(docks[0]); const hx = di.moor[0], hy = di.moor[1];
    const own = ownRegions(f.id);
    // 1. the tales this people believes, not yet gone after
    for (const rm of K.rumorsOf(f.id)) {
      const e = rm.by[f.id]; if (e.end || e.went) continue;
      const r = rm.key !== null ? K.reg(rm.key) : null; if (r && (own.has(r) || !reachRegion(r, comp))) continue;
      const w = e.conf * ({ ferro: 0.5 + pr.ferro * 1.6, ouro: 0.45 + pr.ouro * 1.3 + ef.pe.amb * 0.3, terra: 0.35 + pr.terra * 1.4 + ef.cur * 0.3, pesqueiro: 0.3 + pr.pesca * 1.5, povo: 0.25 + ef.cur * 0.4 + G.Civ.t(f.id, 'trade', 1) * 0.15, monstro: ef.cur * 0.3 + ef.risk * 0.3, naufragio: 0.1 }[rm.kind] || 0.2);
      const x = r ? r.cx : rm.x, y = r ? r.cy : rm.y; if (x === undefined) continue;
      out.push({ k: 'boato', w, rumor: rm.id, key: r ? r.key : null, x, y, why: rm.kind, txt: rm.claim });
    }
    // 2. land seen from our own beaches, never walked on
    for (const r of K.regions()) {
      if (!K.big(r) || own.has(r)) continue; const s = K.state(f.id, r);
      if (s !== K.SIG && s !== K.RUM) continue; if (!reachRegion(r, comp)) continue;
      const d = K.distTo(r, hx, hy); if (d > 160) continue;
      const w = (0.25 + ef.cur * 0.5 + pr.terra * 0.6 + pr.ferro * 0.4) * (s === K.SIG ? 1 : 0.7) * clamp(1.4 - d / 120, 0.3, 1.2);
      out.push({ k: 'explorar', w, key: r.key, x: r.cx, y: r.cy, why: pr.ferro > 0.4 ? 'ferro' : pr.terra > 0.3 ? 'terra' : 'curiosidade', txt: '' });
    }
    // 3. the horizon itself: wherever the sea is unknown
    const unk = K.counts(f.id).desconhecidas;
    if (unk > 0 || G.R() < 0.3) {
      let best = null, bs = -1;
      for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + G.rr(-0.2, 0.2); const u = unknownToward(f, a, hx, hy, 90); if (u > bs) { bs = u; best = a; } }
      if (best !== null && bs > 0.3) {
        const drive = Math.max(pr.ferro * 0.8, pr.ouro * 0.6, pr.terra * 0.8, pr.madeira * 0.6, pr.pesca * 0.7, pr.rival, pr.gloria);
        const w = (ef.cur * 0.45 + drive * 0.7) * bs;
        out.push({ k: 'horizonte', w, a: best, x: hx + Math.cos(best) * 60, y: hy + Math.sin(best) * 60, why: drive > ef.cur * 0.5 ? (pr.ferro >= Math.max(pr.terra, pr.ouro) && pr.ferro > 0 ? 'ferro' : pr.terra >= pr.ouro && pr.terra > 0 ? 'terra' : pr.ouro > 0 ? 'ouro' : pr.rival ? 'rival' : 'gloria') : 'curiosidade', txt: '' });
      }
    }
    // 4. someone lost at sea, whose family will not stop looking
    for (const e of exps()) {
      if (e.fac !== f.id || !e.presumed || e.searched || G.S.day - e.presumed > 30) continue;
      out.push({ k: 'busca', w: 0.45, x: e.lastX || hx, y: e.lastY || hy, a: e.a, why: 'busca', of: e.id, txt: '' });
    }
    // taboos turn the bow away (unless the ruler dares)
    for (const c of out) if (tabooHit(f, c.x - hx, c.y - hy)) c.w *= ef.risk > 0.75 ? 0.6 : 0.08;
    return out.filter(c => c.w > 0.05).sort((a, b) => b.w - a.w);
  }

  // ====================================================================================
  //  WHO GOES
  // ====================================================================================
  const BUSY = { band: 1, muster: 1, combat: 1, embark: 1, aboard: 1, jail: 1, condemned: 1, scene: 1, envoy: 1, trade: 1, escape: 1, flee: 1, swim: 1, expl: 1, naufrago: 1, cais: 1, army: 1, siege: 1, riot: 1 };
  function free(v, f, o) {
    o = o || {};
    if (!v || v.captive || v.aboard || v.held || v.air || v.ug || v.hp < 55 || v.preg > 0 || v.rebel) return false;
    if (v.age < (o.minAge || 17) || v.age > (o.maxAge || 56)) return false;
    if (G.Fac.idOfV(v) !== f.id || v.id === f.leader) return false;
    if (v.task && (BUSY[v.task.type] || v.task.pri >= 3.2)) return false;
    if (X.memberOf(v.id)) return false;
    if (v.expCD && G.S.day - v.expCD < 3) return false;
    return true;
  }
  function pool(f, x, y, R, o) { const out = []; for (const v of G.S.villagers.values()) if (free(v, f, o) && G.dist2(v.x, v.y, x, y) < R * R) out.push(v); return out; }
  const adventurous = v => ((v.traits || []).includes('Curioso') ? 0.35 : 0) + ((v.traits || []).includes('Corajoso') ? 0.25 : 0) + v.courage * 0.4 - ((v.traits || []).includes('Medroso') ? 0.4 : 0) + (v.voyages || 0) * 0.15 - (v.partner && (v.kids || []).length ? 0.15 : 0);
  // the person of means who pays for a voyage, hoping it pays back
  function patron(f, x, y) {
    let best = null, bs = 0;
    for (const v of G.S.villagers.values()) {
      if (v.captive || v.age < 25 || v.age > 70 || G.Fac.idOfV(v) !== f.id || v.id === f.leader || G.dist2(v.x, v.y, x, y) > 60 * 60) continue;
      const coin = G.Eco ? G.Eco.purse(v) : 0;
      const sc = coin * 0.08 + (v.role === 'mercador' ? 3 : 0) + ((v.traits || []).includes('Curioso') ? 1 : 0) + (v.role === 'pescador' ? Math.min(2, (v.fishXp || 0) / 40) : 0) + G.R();
      if (sc > bs) { bs = sc; best = v; }
    }
    return bs > 2.2 ? best : null;
  }
  function roleOf(v, e) { const r = e.roles; if (v.id === e.leader) return 'líder'; if (r.cart === v.id) return 'cartógraf' + oa(v); if (r.nat === v.id) return 'naturalista'; if ((r.sold || []).includes(v.id)) return v.g === 'f' ? 'guerreira' : 'soldado'; if ((r.col || []).includes(v.id)) return 'colon' + oa(v); if ((r.work || []).includes(v.id)) return v.g === 'f' ? 'trabalhadora' : 'trabalhador'; return v.g === 'f' ? 'marinheira' : 'marinheiro'; }
  X.roleOf = roleOf;

  // ------------------------------ the name a voyage is remembered by ------------------------------
  function nameOf(e, f, lead, dirw) {
    const L = lead ? lead.name : 'alguém'; const cap = G.Fac.capitalOf(f.id); const ru = G.Politics.ruler(f);
    const D = DIRS[dirw] || 'ao Mar';
    if (e.kind === 'colonia') return pick([`Os Colonos de ${e.fromName}`, `A Fundação de ${e.colName || 'Nova ' + (cap ? cap.name : f.name)}`]);
    if (e.kind === 'busca') return `Em Busca d${e.ofName ? 'e ' + e.ofName : 'os Perdidos'}`;
    if (e.scale === 'so') return pick([`O Horizonte de ${L}`, `${L} e o Mar`, `A Canoa de ${L}`]);
    if (e.scale === 'media') return pick([`A Viagem de ${L}`, `A Expedição de ${L} ${D}`, `As Redes de ${L}`]);
    return pick([`A Grande Expedição ${D}`, `A Expedição Real ${D}`, ru ? `As Velas de ${ru.name}` : `As Velas de ${cap ? cap.name : f.name}`, `A Frota de ${L}`]);
  }

  // ====================================================================================
  //  THE PLAN: a people decides (low frequency, never on a clock alone)
  // ====================================================================================
  // why a people is not at sea right now (no dice rolled: the panel and the tests read it)
  X.why = function (f) {
    const S = G.S; if (!f.alive) return { gate: 'morto' };
    if (!G.Civ.has(f.id, 'navegacao')) return { gate: 'sem navegação' };
    const all = Nv.docksOf(f.id); const docks = home(f); if (!docks.length) return { gate: all.length ? 'porto sem saída para o mar aberto' : 'sem porto' };
    const ef = eff(f); const p = ef.p; const pop = G.Fac.pop(f.id); if (pop < 12) return { gate: 'gente de menos' };
    const act = X.active(f.id).filter(e => e.kind !== 'colonia'); if (act.length >= ((pop > 160 && ef.aff > 0.5) || (pop > 60 && ef.aff > 0.7) ? 2 : 1)) return { gate: 'já há uma viagem no mar' };
    const pr = X.pressure(f); const cs = candidates(f, docks, pr, ef);
    const c = cs[0]; const will = c ? c.w * (0.35 + ef.aff * 0.9) * (0.55 + ef.risk * 0.6) * (p.era === 'recolhimento' ? 0.35 : 1) : 0;
    return { gate: !cs.length ? 'nenhum motivo' : S.day - (p.last || -99) < 2 ? 'descansando da última' : '', aff: ef.aff, risk: ef.risk, cur: ef.cur, n: cs.length, top: c ? c.k + ':' + c.why + ':' + c.w.toFixed(2) : '', will: +will.toFixed(3), p: Math.min(0.7, will * 0.9), last: p.last };
  };
  X.consider = function (f, force) {
    const S = G.S; if (!f.alive || !G.Civ.has(f.id, 'navegacao')) return null;
    const docks = home(f); if (!docks.length) return null;
    const ef = eff(f); const p = ef.p; const pop = G.Fac.pop(f.id);
    if (pop < 12) return null;
    const act = X.active(f.id).filter(e => e.kind !== 'colonia');
    // (a people of the sea keeps more than one voyage out at a time)
    if (act.length >= ((pop > 160 && ef.aff > 0.5) || (pop > 60 && ef.aff > 0.7) ? 2 : 1)) return null;
    // the sea must be calm enough to think of it (no famine at sea, no war fleet at the door)
    const enemyShips = S.ships.some(o => o.kind === 'guerra' && G.Fac.atWar(f.id, o.fac) && docks.some(d => G.dist(o.x, o.y, d.x, d.y) < 30));
    if (enemyShips && !force) return null;
    const cool = (G.rr(2, 6) / (0.3 + ef.aff * 1.4)) * (p.era === 'recolhimento' ? 2.5 : p.era === 'expansao' ? 0.6 : 1);
    if (!force && S.day - (p.last || -99) < cool) return null;
    const pr = X.pressure(f);
    const cs = candidates(f, docks, pr, ef); if (!cs.length) return null;
    const c = cs[0];
    // the will to go: the pull of the reason, the people's love of the sea, the courage to risk it
    const will = c.w * (0.35 + ef.aff * 0.9) * (0.55 + ef.risk * 0.6) * (p.era === 'recolhimento' ? 0.35 : 1);
    if (!force && G.R() > clamp(will * 0.9, 0, 0.7)) return null;
    // the scale: the state for great reasons, a merchant for profit, an adventurer for the horizon
    const big = pop >= 45 && f.stock.wood >= 70 && f.stock.food >= pop * 2.2 && (c.w > 0.55 || pr.ferro > 0.45 || pr.terra > 0.45 || pr.gloria > 0.2) && (ef.exp > 0.45 || ef.pe.amb > 0.6);
    const pat = patron(f, Nv.dockInfo(docks[0]).moor[0], Nv.dockInfo(docks[0]).moor[1]);
    let scale = force && force.scale ? force.scale : big && G.R() < 0.75 ? 'grande' : pat && G.R() < 0.7 ? 'media' : 'so';
    if (c.k === 'busca') scale = pat ? 'media' : 'so';
    return X.launch(f, c, scale, { patron: pat, pr, ef, force });
  };

  // ------------------------------ the expedition is born ------------------------------
  X.launch = function (f, c, scale, o) {
    const S = G.S; o = o || {}; const docks = home(f); if (!docks.length) return null;
    const dock = docks.sort((a, b) => G.dist(a.x, a.y, c.x, c.y) - G.dist(b.x, b.y, c.x, c.y))[0];
    const di = Nv.dockInfo(dock); const from = S.settlements.get(dock.set); if (!from || !di.moor) return null;
    const cands = pool(f, di.moor[0], di.moor[1], 55);
    if (!cands.length) return null;
    const e = { id: S.nextId++, fac: f.id, civ: f.civ, kind: c.k === 'busca' ? 'busca' : 'exploracao', scale, st: 'prep', t: 0, day0: S.day, from: from.id, fromName: from.name, dock: dock.id, port: di.quay ? di.quay.slice() : di.moor.slice(), moor: di.moor.slice(),
      obj: { k: c.k, why: c.why, rumor: c.rumor || 0, key: c.key === undefined ? null : c.key, x: c.x, y: c.y, a: c.a, txt: c.txt || '' }, crew: [], roles: { sold: [], work: [], col: [] }, ships: [], flag: 0,
      prov: 0, provT: 0, morale: 70, disc: [], log: [], lost: [], deadN: 0, track: [], ev: {}, legs: 0, news: [], status: 'ativa', sponsorKind: '' };
    const dirw = K.dir(c.x - di.moor[0], c.y - di.moor[1]); e.dirw = dirw; e.a = K.dirA(c.x - di.moor[0], c.y - di.moor[1]);
    // the leader: the most adventurous soul at hand (a veteran of the sea first)
    cands.sort((a, b) => adventurous(b) - adventurous(a));
    let lead = null, sponsor = null;
    if (scale === 'so') { lead = cands[0]; sponsor = lead; e.sponsorKind = 'proprio'; }
    else if (scale === 'media') { sponsor = o.patron || cands[0]; lead = (sponsor && free(sponsor, f, { maxAge: 60 }) && adventurous(sponsor) > 0.3) ? sponsor : cands[0]; e.sponsorKind = sponsor && sponsor.role === 'mercador' ? 'mercador' : sponsor && sponsor.role === 'pescador' ? 'mestre' : 'patrono'; }
    else { sponsor = G.Politics.ruler(f); lead = cands.find(v => (v.voyages || 0) > 0) || cands.find(v => v.role === 'guerreiro' && v.age > 25) || cands[0]; e.sponsorKind = 'governante'; }
    if (!lead) return null;
    e.leader = lead.id; e.sponsor = sponsor ? sponsor.id : 0; e.leaderName = lead.name; e.sponsorName = sponsor ? sponsor.name : f.name;
    if (c.k === 'busca') { const lostE = X.get(c.of); if (lostE) { lostE.searched = S.day; e.of = lostE.id; e.ofName = lostE.leaderName; } }
    // the crew: who fits, by the scale
    const take = (list, n, filt) => { const got = []; for (const v of list) { if (got.length >= n) break; if (v.id === lead.id || e.crew.includes(v.id) || (filt && !filt(v))) continue; got.push(v); e.crew.push(v.id); } return got; };
    e.crew.push(lead.id);
    if (scale === 'so') {
      // alone — or with the one friend who will not let them go alone
      if (G.R() < 0.5) { const fr = cands.find(v => v.id !== lead.id && (lead.friends ? lead.friends.includes(v.id) : false)) || (G.R() < 0.5 ? cands[1] : null); if (fr) e.crew.push(fr.id); }
      e.ships.push({ kind: 'canoa', want: 1 });
    } else if (scale === 'media') {
      const n = clamp(Math.round(3 + G.R() * 6 + (o.pr ? o.pr.ferro * 3 : 0)), 3, 9);
      take(cands.filter(v => v.role === 'pescador').concat(cands), n);
      e.ships.push({ kind: e.crew.length > 5 ? 'explorador' : 'pesca', want: 1 });
    } else {
      const pop = G.Fac.pop(f.id); const n = clamp(Math.round(14 + pop * 0.09 + (o.ef ? o.ef.exp * 10 : 0)), 14, 70);
      const nShips = clamp(Math.ceil(n / 14), 2, 5);
      // a cartographer (a scribe, a curious elder), a naturalist (a priest, someone who knows the beasts)
      const cart = pool(f, di.moor[0], di.moor[1], 60, { maxAge: 66 }).filter(v => !e.crew.includes(v.id)).sort((a, b) => ((b.role === 'escriba') * 3 + (b.traits || []).includes('Curioso') * 2 + b.age / 40) - ((a.role === 'escriba') * 3 + (a.traits || []).includes('Curioso') * 2 + a.age / 40))[0];
      if (cart) { e.roles.cart = cart.id; e.crew.push(cart.id); }
      const nat = pool(f, di.moor[0], di.moor[1], 60, { maxAge: 64 }).filter(v => !e.crew.includes(v.id)).sort((a, b) => ((b.role === 'sacerdote') * 2 + (b.role === 'cacador') * 2 + (b.traits || []).includes('Curioso') * 2) - ((a.role === 'sacerdote') * 2 + (a.role === 'cacador') * 2 + (a.traits || []).includes('Curioso') * 2))[0];
      if (nat) { e.roles.nat = nat.id; e.crew.push(nat.id); }
      const sold = take(cands.filter(v => v.role === 'guerreiro'), Math.round(n * 0.2)); e.roles.sold = sold.map(v => v.id);
      const work = take(cands.filter(v => v.role === 'construtor' || v.role === 'lenhador'), Math.round(n * 0.1)); e.roles.work = work.map(v => v.id);
      take(cands.filter(v => v.role === 'pescador').concat(cands), n - e.crew.length);
      e.ships.push({ kind: 'explorador', want: 1 }); for (let k = 1; k < nShips; k++) e.ships.push({ kind: k === nShips - 1 && e.roles.sold.length > 6 ? 'transporte' : 'explorador', want: 1 });
    }
    if (e.crew.length < (scale === 'grande' ? 8 : 1)) return null;
    // the ships: the idle ones of the port that fit, the rest built on the slip
    const S0 = S.ships; const slots = [];
    const idle = kind => S0.find(q => q.fac === f.id && q.kind === kind && q.st === 'idle' && !q.exp && !q.fleet && !slots.includes(q.id) && (q.kind !== 'pesca' || !Nv.aboardOf(q).length) && G.dist(q.x, q.y, di.moor[0], di.moor[1]) < 12);
    for (const want of e.ships) {
      // (a small voyage borrows a fishing boat lying idle at the quay rather than wait for a canoe to be built)
      // (never the village's only fishing boat: someone has to keep fishing while they are away)
      let s = idle(want.kind) || (want.kind === 'canoa' && S0.filter(q => q.fac === f.id && q.kind === 'pesca' && !q.exp).length >= 2 ? idle('pesca') : null);
      if (!s) {
        const cost = Nv.SHIP[want.kind].cost;
        if (f.stock.wood < cost + 4) {
          // the timber is not there: the people puts wood aside for the hull (the woodcutters work for it), and tries again later
          if (want === e.ships[0]) { const p = X.prof(f); p.saveWood = { need: cost + 6, until: S.day + 3 }; return null; }
          continue;
        }
        s = Nv.spawn(want.kind, f, dock, { build: 1 }); if (!s) continue;
      }
      s.exp = e.id; s.prevSt = s.st === 'build' ? 'build' : 'idle'; slots.push(s.id);
    }
    if (!slots.length) return null;
    e.ships = slots; e.flag = slots[0];
    // provisions for the whole voyage, and some over: carried to the quay crate by crate
    const range = scale === 'so' ? G.rr(30, 48) : scale === 'media' ? G.rr(45, 75) : G.rr(60, 130);
    e.range = range; const days = (range * 2 / 1.5 + (scale === 'grande' ? 110 : 70)) / DAY();
    e.dur = days; e.provT = Math.ceil(e.crew.length * FOOD * days * (scale === 'grande' ? 1.7 : 1.4)) + 2;
    const name0 = nameOf(e, f, lead, dirw); e.name = name0;
    S.exps = exps(); S.exps.push(e); if (S.exps.length > 90) S.exps.splice(0, S.exps.length - 90);
    X.prof(f).last = S.day; X.prof(f).n++;
    if (c.rumor) { const rm = K.rumorById(c.rumor); if (rm && rm.by[f.id]) rm.by[f.id].went = e.id; }
    for (const id of e.crew) { const v = P(id); if (v) { v.voyages = (v.voyages || 0); G.Life && G.Life.bio(v, 'voyage', e.name, id === e.leader ? 1 : 0); } }
    // why, in words: the chronicle tells the reason (the god sees the cause)
    const why = whyTxt(e, f, lead, sponsor);
    chapter(e, 'O chamado', why, 'ship', scale !== 'so' || !!c.rumor);
    G.Stories && G.Stories.signal('expPlanned', { exp: e.id, fac: f.id, leader: e.leader, sponsor: e.sponsor, scale, ids: e.crew.slice(), x: di.moor[0], y: di.moor[1] });
    // the crew goes to the quay; a few carry the provisions down
    let k = 0; for (const id of e.crew) { const v = P(id); if (!v) continue; G.Vg.endTask(v); G.Vg.setTask(v, { type: 'cais', exp: e.id, k: k, job: k > 0 && k <= Math.min(4, Math.ceil(e.provT / 8)) ? 'load' : 'wait', pri: 3.25, st: 0 }); k++; }
    return e;
  };
  const WHY = {
    ferro: (f, c) => `${f.name} não tem ferro: as forjas esfriam${c ? ', e o que se conta é ' + c : ''}`,
    ouro: (f, c) => `dizem que há ouro além do mar${c ? ' — ' + c : ''}`,
    terra: (f) => `a terra de ${f.name} ficou pequena para tanta gente`,
    pesqueiro: () => `os pesqueiros de perto já não enchem os barcos`,
    povo: (f, c) => `contam de um povo além do mar${c ? ': ' + c : ''}`,
    monstro: (f, c) => `os pescadores juram ter visto um monstro${c ? ': ' + c : ''}`,
    curiosidade: () => `ninguém sabe o que há além do horizonte`,
    rival: () => `os vizinhos já mandam navios para longe`,
    gloria: () => `o governante quer o nome gravado no que for descoberto`,
    busca: () => `alguém que se ama não voltou do mar`,
  };
  function whyTxt(e, f, lead, sp) {
    const o = e.obj; const rm = o.rumor ? K.rumorById(o.rumor) : null; const claim = rm ? rm.claim : '';
    const reason = (WHY[o.why] || WHY.curiosidade)(f, claim);
    const r = o.key !== null ? K.reg(o.key) : null; const where = r && K.named(r) ? K.a(K.name(r)) : `o ${e.dirw}`;
    const L = lead.name;
    if (e.scale === 'so') return `${L}, de ${e.fromName}, vai sozinh${oa(lead)}${e.crew.length > 1 ? ' — ou quase: ' + (P(e.crew[1]) || {}).name + ' não deixou' : ''} numa canoa para ${where}: ${reason}.`;
    if (e.scale === 'media') return `${sp && sp.id !== lead.id ? `${sp.name}${sp.role === 'mercador' ? ', mercador' + (sp.g === 'f' ? 'a' : '') + ',' : ''} paga a viagem e ${L} comanda` : `${L} junta ${e.crew.length - 1} companheiros e um barco`}: rumo ${/^(a|o) /.test(where) ? where.replace(/^a /, 'à ').replace(/^o /, 'ao ') : 'a ' + where}, porque ${reason}.`;
    return `${sp ? G.Politics.title(F(e.fac), sp) + ' ' + sp.name : F(e.fac).name} manda ${e.ships.length} navios e ${e.crew.length} pessoas para ${where}, sob ${L}: ${reason}.`;
  }
  // the expedition's book: chapters (the story of the voyage, as it happens)
  function chapter(e, h, txt, ic, chron, o) {
    o = o || {}; const S = G.S; e.log.push({ d: S.day, t: +S.time.toFixed(2), h, txt, ic: ic || 'ship' });
    if (e.log.length > 40) e.log.splice(1, 1);
    if (chron) { const s = ship(e.flag); const x = o.x !== undefined ? o.x : s ? s.x : e.moor[0], y = o.y !== undefined ? o.y : s ? s.y : e.moor[1]; log(txt, ic || 'ship', x, y); }
    G.Stories && G.Stories.signal('expChapter', { exp: e.id, h, txt, k: o.k || '', x: o.x, y: o.y });
  }
  X.chapter = chapter;

  // ====================================================================================
  //  WHO IS IN IT
  // ====================================================================================
  let members = new Map(), memDay = -1, memT = -1;
  function refreshMembers() { const S = G.S; if (memT === S.clock) return; memT = S.clock; members = new Map(); for (const e of exps()) if (X.live(e)) for (const id of e.crew) members.set(id, e); }
  X.memberOf = id => { refreshMembers(); return members.get(id) || null; };
  X.ofV = v => (v ? X.memberOf(v.id) : null);
  const alive = e => e.crew.map(P).filter(Boolean);
  const aboardE = e => alive(e).filter(v => v.aboard && e.ships.includes(v.aboard));
  const ashoreE = e => alive(e).filter(v => !v.aboard);
  X.alive = alive;
  // the leader dies: someone else takes the tiller
  function ensureLeader(e) {
    if (P(e.leader)) return true;
    const v = alive(e).sort((a, b) => adventurous(b) + b.age / 80 - adventurous(a) - a.age / 80)[0];
    if (!v) return false;
    const old = PD(e.leader); e.leader = v.id; e.leaderName2 = v.name;
    chapter(e, 'Um novo comando', `${old ? old.name : 'O líder'} está morto. ${v.name} assume o comando d${e.name.startsWith('A ') || e.name.startsWith('As ') ? 'a ' + e.name.replace(/^(A|As) /, '') : 'a expedição'}.`, 'skull');
    return true;
  }

  // ====================================================================================
  //  THE EXPEDITION, twice a second
  // ====================================================================================
  function tick(e, dt) {
    const S = G.S; const f = F(e.fac); e.t += dt;
    if (!f || !f.alive) return finish(e, 'cancelada', 'Não há mais para onde voltar.');
    // the dead leave the roll (and are counted)
    e.crew = e.crew.filter(id => { if (P(id)) return true; if (!e.lost.includes(id)) { e.lost.push(id); e.deadN++; } return false; });
    const crew = alive(e);
    if (G.isNight()) for (const v of crew) if (v.aboard || (v.task && v.task.type === 'expl' && v.act === 'lie')) v.energy = Math.min(100, v.energy + 1.1);
    const ships = e.ships.map(ship).filter(Boolean); e.ships = ships.map(s => s.id);
    if (!ships.some(s => s.id === e.flag) && ships.length) { e.flag = ships[0].id; }
    const flag = ship(e.flag);
    // every hull gone: whoever lives is a castaway now (on a beach, or still swimming)
    if (!ships.length && !['prep', 'reunir', 'embarque', 'fim'].includes(e.st) && e.kind !== 'colonia' || (!ships.length && e.kind === 'colonia' && e.st !== 'fundacao' && !['prep', 'reunir', 'embarque', 'fim'].includes(e.st))) {
      for (const v of crew) { if (v.task && (v.task.type === 'expl' || v.task.type === 'contato')) G.Vg.endTask(v); if (!v.wrecked) v.wrecked = { ship: e.flag, name: e.name, d: G.S.day, fac: e.fac, exp: e.id, x: v.x, y: v.y }; v.wrecked.exp = e.id; K.share(e, v); }
      e.status = crew.length ? 'naufragada' : 'perdida'; e.truthEnd = G.S.day; e.st = 'fim'; e.end = G.S.day;
      chapter(e, 'Sem navio', crew.length ? `Não há mais navio. ${crew.map(v => v.name).slice(0, 3).join(', ')}${crew.length > 3 ? ' e os outros' : ''} estão por conta do mar e da sorte.` : `Do que foi ${e.name}, não sobrou ninguém.`, 'skull', false);
      return;
    }
    // nobody left: the sea keeps the story (the people at home will wait, and then they will know)
    if (!crew.length) { if (['prep', 'reunir', 'embarque'].includes(e.st)) finish(e, 'cancelada', `Não sobrou ninguém para ${e.name}.`); else lostAll(e); return; }
    if (!ensureLeader(e) && e.st !== 'prep') { lostAll(e); return; }
    if (flag && Nv.atSea(flag)) { if (!e.track.length || G.dist2(e.track[e.track.length - 1][0], e.track[e.track.length - 1][1], flag.x, flag.y) > 9) { e.track.push([+flag.x.toFixed(1), +flag.y.toFixed(1)]); if (e.track.length > 160) e.track.splice(1, 1); } e.lastX = flag.x; e.lastY = flag.y; }
    switch (e.st) {
      case 'prep': prepTick(e, f, crew, ships); break;
      case 'reunir': gatherTick(e, f, crew, ships); break;
      case 'embarque': embarkTick(e, f, crew, ships); break;
      case 'partida': departTick(e, f, crew, ships); break;
      case 'viagem': sailTick(e, f, crew, ships, dt); break;
      case 'aproximacao': approachTick(e, f, crew, ships); break;
      case 'desembarque': landTick(e, f, crew, ships); break;
      case 'exploracao': case 'contato': exploreTick(e, f, crew, ships, dt); break;
      case 'reembarque': reboardTick(e, f, crew, ships); break;
      case 'volta': backTick(e, f, crew, ships, dt); break;
      case 'chegada': arriveTick(e, f, crew, ships); break;
      case 'fundacao': settleTick(e, f, crew, ships); break;
    }
  }
  // ------------------------------ preparing: ships on the slip, crates to the quay ------------------------------
  function prepTick(e, f, crew, ships) {
    const S = G.S;
    // the reasons can vanish before the sails go up
    const why = abort(e, f, crew); if (why) return finish(e, 'cancelada', why);
    const ready = ships.length && ships.every(s => s.st !== 'build');
    const loaded = e.prov >= e.provT || e.t > DAY() * 0.45;
    if (ready && loaded) {
      // whatever was not carried down is loaded at the last moment (if the stores have it)
      const miss = Math.max(0, e.provT - e.prov); const got = Math.min(miss, Math.max(0, Math.floor(f.stock.food - G.Fac.pop(f.id) * 0.8))); f.stock.food -= got; e.prov += got; e.prov0 = e.prov;
      if (e.prov < e.crew.length * FOOD * e.dur * 0.6) return finish(e, 'cancelada', `Não havia comida para tanta gente no mar: ${e.name} não saiu do porto.`);
      e.st = 'reunir'; e.t = 0;
      for (const s of ships) s.st = 'prep';
    }
    if (e.t > DAY() * 1.2) finish(e, 'cancelada', `${e.name} nunca ficou pronta: os navios não saíram do estaleiro.`);
  }
  function abort(e, f, crew) {
    const S = G.S; const pop = G.Fac.pop(f.id);
    if (!P(e.leader) && e.scale !== 'grande') return `${e.leaderName} morreu antes de zarpar. ${e.name} morreu com ${oa(PD(e.leader))}.`;
    if (e.scale === 'media' && e.sponsor && !P(e.sponsor) && e.sponsor !== e.leader) return `${e.sponsorName}, que pagava a viagem, morreu. Sem dinheiro, ${e.name} não sai.`;
    if (f.stock.food < pop * 0.5 && e.scale === 'grande') return `A fome chegou a ${e.fromName}: a comida das caixas voltou para o celeiro, e ${e.name} foi adiada.`;
    // a war breaks out while the crates are being loaded: the ruler decides once
    if (G.Fac.enemiesOf(f.id).length && e.scale !== 'so' && !e.warOk) { e.warOk = 1; if (G.R() < (e.scale === 'grande' ? 0.6 : 0.35)) return `A guerra chegou primeiro: a gente d${e.name.startsWith('A') ? 'a ' + e.name.replace(/^(A|As) /, '') : 'a expedição'} foi chamada para outra coisa.`; }
    if (crew.length < Math.max(1, e.scale === 'grande' ? 6 : 1)) return `Não sobrou tripulação para ${e.name}.`;
    return null;
  }
  // ------------------------------ on the quay: the crew gathers, the families come ------------------------------
  function gatherTick(e, f, crew, ships) {
    const S = G.S;
    const there = crew.filter(v => G.dist(v.x, v.y, e.port[0], e.port[1]) < 6).length;
    // the families come down to the water to see them go (once)
    if (!e.bye) {
      e.bye = 1; let n = 0;
      for (const v of crew) {
        const kin = G.Stories ? G.Stories.kin(v).filter(k => !k.captive && k.age >= 4 && !X.memberOf(k.id) && !(k.task && k.task.pri >= 3) && G.dist(k.x, k.y, e.port[0], e.port[1]) < 50) : [];
        for (const k of kin.slice(0, e.scale === 'grande' ? 1 : 2)) { if (n > 24) break; G.Vg.endTask(k); G.Vg.setTask(k, { type: 'adeus', exp: e.id, of: v.id, pri: 2.4, st: 0, k: n }); n++; }
      }
      // a royal voyage: the ruler comes down too, and a banner goes up on the quay
      if (e.scale === 'grande') { const ru = G.Politics.ruler(f); if (ru && !ru.captive && G.dist(ru.x, ru.y, e.port[0], e.port[1]) < 70 && !(ru.task && ru.task.pri >= 3)) { G.Vg.endTask(ru); G.Vg.setTask(ru, { type: 'adeus', exp: e.id, of: e.leader, pri: 2.4, st: 0, k: n, ruler: 1 }); } e.banner = 1; }
      chapter(e, 'O cais', e.scale === 'grande' ? `No cais de ${e.fromName}, ${crew.length} pessoas esperam a ordem de embarcar. As famílias vieram; há bandeiras, choro, e um sacerdote que abençoa os cascos.` : e.scale === 'media' ? `${crew.length} pessoas no cais de ${e.fromName}, e quem ficou veio dizer adeus.` : `De manhã cedo, ${P(e.leader).name} desce para o cais de ${e.fromName}${n ? ', e quem gosta del' + (P(e.leader).g === 'f' ? 'a' : 'e') + ' vem junto' : ' sozinh' + oa(P(e.leader))}.`, 'ship', e.scale === 'grande');
    }
    if ((there >= crew.length * 0.85 && e.t > 8) || e.t > 70) { e.st = 'embarque'; e.t = 0; e.bq = 0; }
  }
  // ------------------------------ aboard, one by one ------------------------------
  function berth(e, v, ships) {
    if (e.berth && e.berth[v.id] && ships.some(s => s.id === e.berth[v.id])) return ship(e.berth[v.id]);
    e.berth = e.berth || {}; const load = s => Object.values(e.berth).filter(id => id === s.id).length;
    // the leader, the cartographer and the naturalist on the flagship; the soldiers in the transport
    let best = null, bs = -1e9;
    for (const s of ships) { const cap = X.CAP[s.kind] || 8; const l = load(s); if (l >= cap) continue; const sc = (s.id === e.flag && (v.id === e.leader || v.id === e.roles.cart || v.id === e.roles.nat) ? 50 : 0) + (s.kind === 'transporte' && (e.roles.sold || []).includes(v.id) ? 20 : 0) - l / cap * 10; if (sc > bs) { bs = sc; best = s; } }
    if (best) e.berth[v.id] = best.id; return best;
  }
  function embarkTick(e, f, crew, ships) {
    e.bq -= 0.5; if (e.bq > 0) return;
    const left = crew.filter(v => !v.aboard);
    if (left.length) {
      // two at a time step down the plank (the ones still on their way are waited for, a while)
      // (someone saying goodbye in a scene of their own is waited for: the ship does not leave in the middle of an embrace)
      const inScene = v => !!(G.Scene && G.Scene.actorScene(v));
      for (const v of left.filter(q => !inScene(q)).slice(0, 2)) {
        if (G.dist(v.x, v.y, e.port[0], e.port[1]) > 3.5 && e.t < 40) continue;
        const s = berth(e, v, ships); if (!s) continue;
        G.Vg.endTask(v); v.aboard = s.id; v.task = { type: 'aboard', ship: s.id, pri: 9, st: 0, age: 0 }; if (!s.crew.includes(v.id)) s.crew.push(v.id); v.gear = null;
        G.FX && G.FX.splash(s.x, s.y, 0.2);
      }
      e.bq = 0.6; if (e.t < 45 || (left.some(inScene) && e.t < 90)) return;
      // whoever never came stays behind
      for (const v of crew.filter(q => !q.aboard)) { G.Vg.endTask(v); e.crew = e.crew.filter(id => id !== v.id); }
    }
    if (!aboardE(e).length) return finish(e, 'cancelada', `Ninguém embarcou: ${e.name} ficou no cais.`);
    e.st = 'partida'; e.t = 0;
    const f2 = F(e.fac); const lead = P(e.leader);
    for (const s of ships) s.st = 'out';
    plot(e, ships);
    e.dayOut = G.S.day; e.due = G.S.day + e.dur * 2 + 0.6;
    const withL = []; if (e.ships.length > 1) withL.push(`${e.ships.length} navios`); if (e.scale !== 'so') withL.push(`${aboardE(e).length} pessoas a bordo`);
    chapter(e, 'A partida', `${lead ? lead.name : 'A expedição'} partiu de ${e.fromName} rumo ${DIRS[e.dirw] ? 'ao ' + e.dirw : 'ao mar'}${withL.length ? ', com ' + withL.join(' e ') : ''}. Leva comida para ${(n => n <= 1 ? 'um dia' : n + ' dias')(Math.round(e.prov / Math.max(1, aboardE(e).length * FOOD)))}.`, 'ship', true);
    G.Stories && G.Stories.signal('expDeparted', { exp: e.id, fac: e.fac, leader: e.leader, ids: e.crew.slice(), x: e.moor[0], y: e.moor[1] });
    G.UI && G.UI.viewFac === e.fac && G.UI.notice(`${e.name} zarpou de ${e.fromName}.`, 'ship');
    void f2;
  }
  // the course: a coast to reach, or a heading into the unknown
  function plot(e, ships) {
    const flag = ship(e.flag); if (!flag) return false;
    let tx = null, ty = null;
    const r = e.obj.key !== null ? K.reg(e.obj.key) : null;
    if (r) { const c = K.coastNear(r, flag.x, flag.y); if (c) { const w = Nv._nearestWater(c[0], c[1], 4); if (w) { tx = w[0]; ty = w[1]; } } }
    if (tx === null) {
      const a = e.obj.a !== undefined ? e.obj.a : Math.atan2(e.obj.y - flag.y, e.obj.x - flag.x);
      for (let k = 0; k < 10 && tx === null; k++) { const d = e.range * (1 - k * 0.07), aa = a + (k % 2 ? 1 : -1) * k * 0.08; const x = flag.x + Math.cos(aa) * d, y = flag.y + Math.sin(aa) * d; const w = W.inb(x, y) ? Nv._nearestWater(clamp(x, 2, N - 3), clamp(y, 2, N - 3), 3) : null; if (w && Nv.compAt(w[0], w[1]) === Nv.compAt(flag.x, flag.y)) { tx = w[0]; ty = w[1]; } }
    }
    if (tx === null) return false;
    e.tgt = [tx, ty];
    if (!Nv._sailTo(flag, tx, ty)) return false;
    for (const s of ships) if (s !== flag) follow(s, flag, ships.indexOf(s));
    return true;
  }
  function follow(s, flag, k) {
    const dx = flag.path && flag.path[flag.pi] ? flag.path[flag.pi][0] - flag.x : 1, dy = flag.path && flag.path[flag.pi] ? flag.path[flag.pi][1] - flag.y : 0; const d = Math.hypot(dx, dy) || 1;
    const bx = flag.x - dx / d * 2.4 * k + (-dy / d) * (k % 2 ? 1.6 : -1.6), by = flag.y - dy / d * 2.4 * k + (dx / d) * (k % 2 ? 1.6 : -1.6);
    const w = Nv._nearestWater(bx, by, 2) || [flag.x, flag.y]; Nv._sailTo(s, w[0], w[1]);
  }
  function departTick(e, f, crew, ships) { if (e.t > 6) { e.st = 'viagem'; e.t = 0; e.sea0 = G.S.clock; } }
  // ------------------------------ at sea ------------------------------
  function sailTick(e, f, crew, ships, dt) {
    const S = G.S; const flag = ship(e.flag); if (!flag) return;
    // provisions: what is left decides how far the bow can still point
    const ab = aboardE(e).length || 1; const left = e.prov / (ab * FOOD);
    const homeD = G.dist(flag.x, flag.y, e.moor[0], e.moor[1]); const backDays = (homeD / 1.4) / DAY();
    if (left < backDays * 1.25 + 0.05 && !e.turned) { e.turned = 'provisões'; chapter(e, 'Meia-volta', `Com a comida contada, ${P(e.leader).name} manda dar meia-volta: não dá para ir mais longe e ainda voltar.`, 'ship'); return goHome(e, ships); }
    // the sea happens
    e.evT = (e.evT || G.rr(10, 18)) - 0.5; if (e.evT <= 0) { e.evT = G.rr(12, 22); voyageEvent(e, f, ships); if (!X.live(e) || e.st !== 'viagem') return; }
    // the course reached: a coast to approach, or (out of luck) another leg
    if (!flag.path || flag.pi >= flag.path.length) {
      const r = e.obj.key !== null ? K.reg(e.obj.key) : null;
      if (r && K.distTo(r, flag.x, flag.y) < 9) return startApproach(e, r);
      // nothing found where the tale said: a leg sideways, then home
      e.legs++;
      const near = landNear(e, flag, e.roles.cart ? 24 : 18); if (near) return startApproach(e, near);
      if (e.legs > (e.scale === 'grande' ? 4 : e.scale === 'media' ? 3 : 2)) { e.turned = e.turned || 'nada'; chapter(e, 'Mar vazio', `${pick(['Dias de água e céu', 'Nada no horizonte, dia após dia', 'Só mar'])}: ${P(e.leader).name} manda voltar.`, 'ship'); return goHome(e, ships); }
      const a = Math.atan2((e.tgt ? e.tgt[1] : flag.y) - e.moor[1], (e.tgt ? e.tgt[0] : flag.x) - e.moor[0]) + (G.R() < 0.5 ? 1 : -1) * G.rr(0.6, 1.2);
      e.obj.a = a; e.range = e.range * 0.6; e.obj.key = null; if (!plot(e, ships)) return goHome(e, ships);
    }
    // the others keep station on the flagship
    if ((e.flw = (e.flw || 0) - 0.5) <= 0) { e.flw = 2; for (const s of ships) if (s !== flag && G.dist(s.x, s.y, flag.x, flag.y) > 3.5) follow(s, flag, ships.indexOf(s)); }
  }
  function landNear(e, flag, R) {
    let best = null, bd = R;
    for (const r of K.regions()) { if (!K.big(r) || ownRegions(e.fac).has(r) || (e.visited || []).includes(r.key)) continue; if (K.state(e.fac, r) >= K.EXP && !e.obj.revisit) continue; const d = K.distTo(r, flag.x, flag.y); if (d < bd && reachRegion(r, Nv.compAt(flag.x, flag.y))) { bd = d; best = r; } }
    return best;
  }
  // land sighted (called by the lookout's eye: G.Know.look)
  X.onSight = function (s, what, o, d) {
    if (!s.exp) return; const e = X.get(s.exp); if (!e || e.st !== 'viagem' || s.id !== e.flag) return;
    if (what === 'land') {
      if (e.seen && e.seen.includes(o.key)) return; (e.seen = e.seen || []).push(o.key);
      const lead = P(e.leader); const who = alive(e).filter(v => v.aboard === s.id)[1] || lead;
      const fx = G.FX; fx && fx.floater && fx.floater(s.x, s.y - 0.5, 'Terra à vista!', '#f4e6b8', 2.4);
      chapter(e, 'Terra à vista', `${who ? who.name : 'O vigia'} viu primeiro: ${o.kind === 'continente' ? 'uma costa sem fim' : o.kind === 'ilhota' ? 'uma ilhota' : 'uma ilha'} a ${K.dir(o.cx - s.x, o.cy - s.y)}${G.isNight() ? ', recortada contra as estrelas' : G.S.time < 0.15 ? ', ao amanhecer' : ''}.`, 'eye', false);
      G.Stories && G.Stories.signal('landSighted', { exp: e.id, fac: e.fac, key: o.key, who: who ? who.id : 0, x: s.x, y: s.y });
      if (G.S.time < 0.15) e.dawn = o.key;
      // the sea is the goal: go and see (unless it is home, or already known well)
      if (!ownRegions(e.fac).has(o) && (K.state(e.fac, o) < K.EXP || e.obj.key === o.key)) { if (e.obj.key === null || e.obj.key === o.key || G.R() < 0.6) startApproach(e, o); }
    } else if (what === 'town') {
      const set = o; if ((e.towns || (e.towns = [])).includes(set.id)) return; e.towns.push(set.id);
      chapter(e, 'Fumaça na costa', `Fumaça subindo da costa, telhados, barcos puxados na areia: ${set.name}. Gente que ninguém d${F(e.fac).name.startsWith('Clã') ? 'o ' : 'e '}${F(e.fac).name} conhece.`, 'eye', false);
    }
  };
  function startApproach(e, r) {
    const flag = ship(e.flag); if (!flag) return;
    // a safe place to land: a sheltered cove if there is one, a beach near where we are if not
    const hb = K.harbor(r); const fake = { cx: hb ? hb[0] : r.cx, cy: hb ? hb[1] : r.cy };
    let l = Nv.landing(fake, Nv.compAt(flag.x, flag.y));
    if (!l || K.at(l.land[0], l.land[1]) !== r) { const c = K.coastNear(r, flag.x, flag.y); if (c) l = Nv.landing({ cx: c[0], cy: c[1] }, Nv.compAt(flag.x, flag.y)); }
    if (!l || K.at(l.land[0], l.land[1]) !== r) return;
    e.dest = r.key; e.landAt = l.land; e.waterAt = l.water;
    if (!Nv._sailTo(flag, l.water[0], l.water[1])) return;
    for (const s of e.ships.map(ship).filter(Boolean)) if (s !== flag) { const w = Nv._nearestWater(l.water[0] + G.rr(-2, 2), l.water[1] + G.rr(-2, 2), 2) || l.water; Nv._sailTo(s, w[0], w[1]); }
    e.st = 'aproximacao'; e.t = 0;
  }
  function approachTick(e, f, crew, ships) {
    const flag = ship(e.flag); if (!flag) return;
    if (!flag.path || flag.pi >= flag.path.length || e.t > 90) {
      const r = K.reg(e.dest); if (!r) { e.st = 'viagem'; return; }
      e.st = 'desembarque'; e.t = 0; e.dq = 0; e.landed = []; e.landDay = G.S.day;
      const first = !exps().some(o => o !== e && (o.visited || []).includes(r.key) && o.fac === e.fac) && K.state(e.fac, r) < K.EXP;
      (e.visited = e.visited || []).push(r.key);
      const L = P(e.leader); const where = K.named(r) ? K.name(r) : 'uma terra que não tem nome';
      chapter(e, first ? 'Os primeiros passos' : 'Em terra', e.scale === 'so' ? `${L.name} puxou a canoa para a areia ${e.dawn === r.key ? 'com o sol nascendo, ' : ''}${K.named(r) ? K.na(where) : 'numa terra que não tem nome'}${first ? `: ninguém de ${e.fromName} tinha pisado ali` : ''}.` : `${ships.length > 1 ? 'Os navios lançaram âncora' : 'Ancoraram'} ${e.dawn === r.key ? 'com o sol nascendo ' : ''}diante de ${where}. ${L.name} ${first ? `foi ${L.g === 'f' ? 'a primeira' : 'o primeiro'} a pisar na areia` : 'desceu à praia'}.`, 'ship', first && e.scale !== 'so', { x: e.landAt[0], y: e.landAt[1] });
    }
  }
  // ------------------------------ ashore ------------------------------
  function landTick(e, f, crew, ships) {
    e.dq -= 0.5; if (e.dq > 0) return;
    const r = K.reg(e.dest); if (!r) { e.st = 'reembarque'; return; }
    // who goes ashore: everyone on a small voyage; on a great one, the ship-keepers stay aboard
    const keep = new Set(); if (e.scale === 'grande') for (const s of ships) { const ab = Nv.aboardOf(s).filter(v => v.id !== e.leader && v.id !== e.roles.cart && v.id !== e.roles.nat); for (const v of ab.slice(0, 2)) keep.add(v.id); }
    const wait = crew.filter(v => v.aboard && !keep.has(v.id));
    if (wait.length) {
      for (const v of wait.slice(0, 2)) {
        const s = ship(v.aboard); v.aboard = 0; v.task = null; v.path = null;
        const p = W.randomNear(e.landAt[0], e.landAt[1], 1.4) || e.landAt; v.x = p[0]; v.y = p[1];
        G.Vg.setTask(v, { type: 'expl', exp: e.id, pri: 3.3, st: 'walk', n: 0, wp: null });
        e.landed.push(v.id);
        if (v.id === e.leader) G.Life && G.Life.bio(v, 'discovered', (K.named(r) ? K.na(K.name(r)) : 'numa terra nova'), K.state(e.fac, r) < K.EXP ? 'onde ninguém do seu povo tinha estado' : '');
        void s;
      }
      e.dq = 0.7; return;
    }
    e.st = 'exploracao'; e.t = 0; e.exT = (e.scale === 'grande' ? 110 : e.scale === 'media' ? 80 : 55) * clamp(Math.sqrt(r.n) / 22, 0.6, 1.6);
    if (e.kind === 'colonia') { e.st = 'fundacao'; e.t = 0; }
  }
  // a waypoint inside the new land (a walkable tile of the same region, reachable from the beach)
  function waypoint(e, r, v) {
    const S = G.S; const lx = e.landAt[0], ly = e.landAt[1]; const R = clamp(5 + Math.sqrt(r.n) * 0.45, 5, 22);
    for (let k = 0; k < 16; k++) {
      const a = G.R() * TAU, d = G.rr(3, R); const x = Math.floor(lx + Math.cos(a) * d) + 0.5, y = Math.floor(ly + Math.sin(a) * d) + 0.5;
      if (!W.inb(x, y) || K.at(x, y) !== r || !W.walkableXY(x, y)) continue;
      void S; return [x, y];
    }
    return null;
  }
  X.waypoint = waypoint;
  function exploreTick(e, f, crew, ships, dt) {
    const S = G.S; const r = K.reg(e.dest); if (!r) { e.st = 'reembarque'; return; }
    const ash = ashoreE(e); const ld = P(e.leader);
    // what the eyes take in: beasts never seen at home, the lie of the land
    if ((e.seeT = (e.seeT || 0) - 0.5) <= 0) {
      e.seeT = 2.5;
      const cart = P(e.roles.cart); const nat = P(e.roles.nat);
      e.exProg = (e.exProg || 0) + ash.length * 0.4 * (cart && !cart.aboard ? 1.6 : 1);
      for (const ore of r.ores.map(id => (S.ores || []).find(o => o.id === id)).filter(Boolean)) { if ((e.ores || []).includes(ore.id)) continue; const v = ash.find(q => G.dist2(q.x, q.y, ore.x, ore.y) < 64); if (v) X.found(e, v, ore); }
      for (const a of S.animals.values()) {
        if (a.dead || K.at(a.x, a.y) !== r) continue;
        let near = false; for (const v of ash) if (G.dist2(v.x, v.y, a.x, a.y) < 81) { near = true; break; }
        if (!near) continue;
        if (!K.of(e.fac).sp[a.kind] && !(e.sp || []).includes(a.kind)) {
          (e.sp = e.sp || []).push(a.kind); const D = G.Animals && G.Animals.DEF[a.kind]; const nm = D ? D.name.toLowerCase() : a.kind;
          noteAll(e, { k: 'sp', id: a.kind });
          e.disc.push({ k: 'sp', id: a.kind, d: S.day, txt: nm });
          // the first two get their page; the rest go in the list at the end
          if (e.sp.length <= 2) { chapter(e, 'Um bicho nunca visto', `${nat && !nat.aboard ? nat.name + ', ' + (nat.g === 'f' ? 'a naturalista' : 'o naturalista') + ', desenhou' : pick(['Viram de perto', 'Seguiram com os olhos'])} ${D && D.g === 'f' ? 'uma' : 'um'} ${nm}${nat && !nat.aboard ? ' num pedaço de couro, com as medidas e as cores' : ''}. Ninguém em ${e.fromName} acreditaria.`, 'paw'); G.Stories && G.Stories.signal('newSpecies', { exp: e.id, fac: e.fac, kind: a.kind, x: a.x, y: a.y }); }
          else (e.spMore = e.spMore || []).push(nm);
        }
      }
      // other peoples living on this land: the first meeting
      if (e.st === 'exploracao' && !e.contactDone) for (const set of S.settlements.values()) {
        if (set.fac === e.fac || K.at(set.cx, set.cy) !== r) continue; const of2 = F(set.fac); if (!of2 || !of2.alive) continue;
        const near = ash.some(v => G.dist(v.x, v.y, set.cx, set.cy) < (set.radius || 8) + 14); if (!near && G.dist(e.landAt[0], e.landAt[1], set.cx, set.cy) > (set.radius || 8) + 22) continue;
        const rel = G.Fac.rel(e.fac, of2.id);
        if (rel && rel.met) { if (!e.visitDone) { e.visitDone = 1; chapter(e, 'Gente conhecida', `Em ${set.name} vive ${of2.name}, que ${F(e.fac).name} já conhece. ${rel.st === 'guerra' ? 'Estamos em guerra: ninguém se aproxima.' : 'Trocaram notícias e um pouco de comida.'}`, 'eye'); if (rel.st !== 'guerra') e.prov += 6; } continue; }
        startContact(e, set); break;
      }
      // a castaway on the beach: one of ours
      for (const c of G.S.castaways || []) { if (c.fac !== e.fac || c.key !== r.key || c.found) continue; if (ash.some(v => G.dist(v.x, v.y, c.x, c.y) < 10)) rescue(e, c); }
    }
    if (e.st === 'contato') return contactTick(e, f, ash);
    // the time ashore runs out (or the food, or the will)
    const ab = crew.length || 1; const left = e.prov / (ab * FOOD); const homeD = G.dist(e.landAt[0], e.landAt[1], e.moor[0], e.moor[1]); const backDays = (homeD / 1.4) / DAY();
    if (e.t > e.exT || left < backDays * 1.3 + 0.05 || (G.isNight() && e.t > e.exT * 0.7)) {
      finishLand(e, r);
      e.st = 'reembarque'; e.t = 0; e.dq = 0;
      for (const v of ash) if (v.task && v.task.type === 'expl') { v.task.st = 'back'; v.task.go = 0; }
    }
    void ld; void dt;
  }
  // what the expedition knows about this land, written down (and in every head)
  function finishLand(e, r) {
    if ((e.mapped || []).includes(r.key)) return; (e.mapped = e.mapped || []).push(r.key);
    const cart = P(e.roles.cart); const S = G.S;
    const enough = (e.exProg || 0) > clamp(Math.sqrt(r.n) * 2, 6, 40);
    const st = enough && cart ? K.MAP : K.EXP; const q = clamp((e.exProg || 0) / Math.max(10, Math.sqrt(r.n) * 3), 0.2, 1) * (cart ? 1 : 0.6);
    const lead = P(e.leader); const ru = G.Politics.ruler(F(e.fac));
    const ctx = { who: lead ? lead.name : '', whoId: e.leader, proud: lead && G.Politics.persona(lead).amb > 0.6, ruler: ru ? ru.name : '', royal: e.scale === 'grande', ore: (e.ores || [])[0] && ((S.ores || []).find(o => o.id === e.ores[0]) || {}).kind, beasts: e.sp || [], storm: e.storm, dawn: e.dawn === r.key, wreck: e.wrecked };
    const first = !K.named(r);
    const nm = K.giveName(r, e.fac, ctx);
    for (const v of alive(e)) K.note(v, { k: 'r', id: r.key, s: v.id === e.roles.cart ? st : K.EXP, q: v.id === e.roles.cart ? q : q * 0.6, via: 'expedição', by: e.leader, ctx });
    e.disc.push({ k: 'r', id: r.key, d: S.day, txt: nm ? nm.n : K.name(r), st });
    if (e.spMore && e.spMore.length) { const L = e.spMore; chapter(e, 'Bichos sem conta', `E mais: ${L.slice(0, 5).join(', ')}${L.length > 5 ? ` e outros ${L.length - 5}` : ''}. ${P(e.roles.nat) ? 'A naturalista não tinha mais couro para desenhar.'.replace('A naturalista', P(e.roles.nat).g === 'f' ? 'A naturalista' : 'O naturalista') : 'Ninguém vai acreditar em metade.'}`, 'paw'); e.spMore = []; }
    if (first && nm) chapter(e, 'O nome', `${lead ? lead.name : 'Eles'} ${nm.nat ? `chamou aquela terra de ${nm.nat} — ${K.a(nm.n)}` : `deu nome àquela terra: ${nm.n}`}${cart && st === K.MAP ? `. ${cart.name} desenhou a costa inteira, enseada por enseada` : ''}.`, 'map', e.scale !== 'so', { x: r.cx, y: r.cy });
    // a good place to live? (weighed now, decided at home)
    e.site = siteFor(r, e.fac) || e.site;
  }
  // a castaway found by an expedition joins it (and the mystery of a lost ship is solved)
  function rescue(e, c) {
    c.found = e.id; const S = G.S; let n = 0;
    for (const id of c.ids) { const v = P(id); if (!v || v.aboard) continue; n++; G.Vg.endTask(v); v.wrecked = null; if (!e.crew.includes(id)) e.crew.push(id); G.Vg.setTask(v, { type: 'expl', exp: e.id, pri: 3.3, st: 'back', n: 9 }); }
    if (n) chapter(e, 'Um sobrevivente', `Na praia, ${n > 1 ? n + ' pessoas magras' : 'uma pessoa magra'} acenando: ${c.ids.map(PD).filter(Boolean).map(v => v.name).join(' e ')}, náufragos d${c.title ? c.title.replace(/^(a|o) /, (m, x) => x + ' ') : 'e um barco perdido'}, há ${Math.max(1, Math.round(S.day - c.d))} ${S.day - c.d >= 2 ? 'anos' : 'ano'} naquela ilha.`, 'heart', true, { x: c.x, y: c.y });
  }
  // ------------------------------ the first meeting ------------------------------
  function startContact(e, set) {
    const S = G.S; const ash = ashoreE(e); const lead = P(e.leader); if (!lead || lead.aboard) return;
    e.contactDone = 1; e.st = 'contato'; e.ct = { set: set.id, fac: set.fac, t: 0, ph: 0 };
    // the meeting place: between the beach and the first houses
    const mx = G.lerp(set.cx, e.landAt[0], 0.45), my = G.lerp(set.cy, e.landAt[1], 0.45); const mp = W.nearestLand(mx, my, 4) || [set.cx, set.cy];
    e.ct.x = mp[0]; e.ct.y = mp[1];
    // the party walks up; the natives come out to see
    const party = [lead].concat(ash.filter(v => v !== lead).slice(0, e.scale === 'grande' ? 7 : 3));
    e.ct.party = party.map(v => v.id);
    party.forEach((v, k) => { if (v.task && v.task.type === 'expl') { v.task.st = 'meet'; v.task.go = 0; v.task.k = k; } });
    const nat = [...S.villagers.values()].filter(o => o.set === set.id && !o.captive && o.age >= 16 && o.age < 66 && !o.aboard && !(o.task && o.task.pri >= 3)).sort((a, b) => (b.role === 'guerreiro') - (a.role === 'guerreiro') || b.courage - a.courage).slice(0, e.scale === 'grande' ? 8 : 5);
    const ruler = G.Politics.ruler(F(set.fac)); if (ruler && ruler.set === set.id && !nat.includes(ruler) && !ruler.captive && !(ruler.task && ruler.task.pri >= 3) && e.scale === 'grande') nat.unshift(ruler);
    e.ct.nat = nat.map(v => v.id);
    nat.forEach((v, k) => { G.Vg.endTask(v); G.Vg.setTask(v, { type: 'contato', exp: e.id, k, pri: 3.1, st: 0 }); });
    chapter(e, 'Os outros', `Perto de ${set.name}, gente saiu das casas para ver quem descia da praia. ${nat.length ? `${nat.length} vieram ao encontro` : 'Ninguém se aproximou'}; ${lead.name} foi na frente${party.length > 1 ? ', com ' + (party.length - 1) + ' atrás' : ''}.`, 'eye', false);
  }
  function contactTick(e, f, ash) {
    const S = G.S; const c = e.ct; c.t += 0.5; const set = S.settlements.get(c.set); const B = F(c.fac); const lead = P(e.leader);
    if (!set || !B || !lead) { e.st = 'exploracao'; return; }
    const party = c.party.map(P).filter(v => v && !v.aboard); const nat = c.nat.map(P).filter(Boolean);
    const met = party.some(v => nat.some(n => G.dist(v.x, v.y, n.x, n.y) < 4)) || c.t > 40;
    if (!c.out && met) {
      c.out = outcome(e, f, B, party, nat); c.t0 = c.t;
      applyContact(e, f, B, set, party, nat, c.out);
    }
    if (c.out && c.t - c.t0 > 14) {
      for (const v of nat) if (v.task && v.task.type === 'contato' && v.task.exp === e.id) G.Vg.endTask(v);
      for (const v of party) if (v.task && v.task.type === 'expl') { v.task.st = c.out === 'violencia' || c.out === 'fuga' ? 'back' : 'walk'; v.task.go = 0; v.act = ''; }
      e.st = 'exploracao'; if (c.out === 'violencia' || c.out === 'fuga' || c.out === 'medo') e.t = Math.max(e.t, e.exT - 5);
    }
  }
  // how the first meeting goes is decided by who is there, not by a die alone
  function outcome(e, A, B, party, nat) {
    const lead = P(e.leader); const pa = G.Politics.persona(lead); const pb = G.Politics.leaderPe(B);
    const temper = G.Scene ? G.Scene.temper(lead) : 'firme';
    const armed = (e.roles.sold || []).filter(id => party.some(v => v.id === id)).length;
    const W = {
      observacao: 0.6 + (temper === 'medroso' ? 1.2 : 0) + (nat.length > party.length * 2 ? 0.5 : 0),
      troca: (1 - pa.agg) * (1 - pb.agg) * 2.4 * G.Civ.t(A.id, 'trade', 1),
      diplomacia: (1 - pb.agg) * (e.scale === 'grande' ? 1.4 : 0.5) * (temper === 'firme' || temper === 'devoto' ? 1.3 : 1),
      medo: nat.length < 3 || armed > nat.length ? 0.9 : 0.15,
      violencia: Math.max(pa.agg, pb.agg) * (armed ? 1.4 : 0.6) * (0.5 + Math.max(pa.cru, pb.cru)) * (temper === 'bravo' ? 1.4 : 1) * (G.Civ.t(A.id, 'raid', 1) > 1.2 ? 1.5 : 1),
      fuga: pb.agg * (1 - pa.agg) * 0.7 * (armed ? 0.3 : 1),
      amizade: (1 - pb.agg) * (1 - pb.cru) * 0.9,
    };
    let tot = 0; for (const k in W) tot += W[k]; let r = G.R() * tot;
    for (const k in W) { r -= W[k]; if (r <= 0) return k; }
    return 'observacao';
  }
  const OUT_TXT = {
    observacao: (L, B, s) => `Ficaram se olhando de longe, os de ${s} e os que vieram do mar, até o sol baixar. Ninguém deu o primeiro passo. ${L} mandou voltar para os barcos.`,
    troca: (L, B, s) => `${L} estendeu um presente — ${pick(['um colar de contas', 'uma faca de bronze', 'um pano tingido', 'um cesto de peixe seco'])}. Do outro lado veio ${pick(['uma cabaça de frutas', 'uma pele curtida', 'um punhado de sal', 'uma pedra polida'])}. Ninguém entendia a língua do outro; todo mundo entendeu o gesto.`,
    diplomacia: (L, B, s) => `Os de ${s} levaram ${L} até a casa de quem manda. Comeram juntos, falaram por sinais, e ${L} prometeu voltar com presentes.`,
    medo: (L, B, s) => `Quando viram as armas, os de ${s} correram para as casas e trancaram as portas. Só as crianças espiavam pelas frestas.`,
    violencia: (L, B, s) => `Alguém gritou, uma lança voou — e de repente era uma luta na areia. ${L} recuou para a praia com os seus, contando os feridos.`,
    fuga: (L, B, s) => `Os de ${s} vieram com lanças e caras pintadas. ${L} não esperou para saber o que queriam: correram todos para os barcos.`,
    amizade: (L, B, s, n) => `Os de ${s} receberam ${L} como hóspede. ${n ? `${n}, de lá, quis vir junto para conhecer o outro lado do mar.` : 'Houve festa à noite, em volta do fogo.'}`,
  };
  function applyContact(e, A, B, set, party, nat, out) {
    const S = G.S; const lead = P(e.leader); const c = e.ct;
    // poses: gifts, words, spears
    const pose = { observacao: ['look', 'look'], troca: ['gift', 'gift'], diplomacia: ['talk', 'talk'], medo: ['point', 'cower'], violencia: ['brandish', 'shout'], fuga: ['run', 'brandish'], amizade: ['wave', 'wave'] }[out];
    for (const v of party) { v.act = pose[0]; if (v.task) v.task.pose = pose[0]; }
    for (const v of nat) { v.act = pose[1]; if (v.task) v.task.pose = pose[1]; }
    let guest = null, captive = null;
    if (out === 'violencia') {
      // a real fight: blood on both sides
      const hit = (a, b) => { if (!a || !b) return; a.act = 'fight'; G.faceTo(a, b.x - a.x, b.y - a.y); G.Vg.damage(b, G.rr(18, 45), 'war'); };
      for (let k = 0; k < Math.min(party.length, nat.length); k++) { hit(party[k], nat[k]); if (G.R() < 0.7) hit(nat[k], party[k]); }
      const rel = G.Fac.rel(A.id, B.id); if (rel) rel.grudge = (rel.grudge || 0) + 15;
      if (G.R() < 0.35 && party.length > 1) { captive = party[party.length - 1]; }
    }
    if (out === 'amizade' && nat.length && G.R() < 0.5) { const g = nat.find(v => v.age < 40 && v.id !== (B.leader || 0) && (v.traits || []).includes('Curioso')) || (G.R() < 0.4 ? nat[nat.length - 1] : null); if (g) guest = g; }
    if (captive && !captive.aboard) {
      e.crew = e.crew.filter(id => id !== captive.id); G.Vg.endTask(captive); G.War.enslave(captive, A.id, e.from);
      captive.set = set.id; chapter(e, 'Levad' + oa(captive), `${captive.name} ficou para trás, preso pelos de ${set.name}.`, 'chain');
    }
    if (guest) { G.Vg.endTask(guest); guest.guestOf = { fac: A.id, exp: e.id, from: B.id }; e.crew.push(guest.id); e.guests = (e.guests || []).concat(guest.id); G.Vg.setTask(guest, { type: 'expl', exp: e.id, pri: 3.3, st: 'walk', n: 0 }); }
    // sickness carried from the ship
    if (alive(e).some(v => v.sick > 0) && G.R() < 0.6) { for (const v of nat.slice(0, 3)) v.sick = Math.max(v.sick || 0, DAY() * 0.25); e.plague = 1; }
    // knowledge: the natives know now (they were there); the explorers' people will know when they get home
    K.of(B.id).f[A.id] = K.of(B.id).f[A.id] || { d: S.day, via: 'primeiro contato' };
    K.rumor({ kind: 'povo', fac: A.id, x: e.landAt[0], y: e.landAt[1], conf: 0.9, claim: `estrangeiros chegaram pelo mar a ${set.name}`, origin: { what: 'contato', set: set.id, fac: B.id }, first: B.id, quiet: true });
    noteAll(e, { k: 'f', id: B.id, set: set.id, via: 'primeiro contato' });
    const op = { observacao: 0, troca: 18, diplomacia: 22, medo: -8, violencia: -35, fuga: -12, amizade: 28 }[out];
    e.contact = { fac: B.id, set: set.id, out, op, d: S.day, plague: !!e.plague, guest: guest ? guest.id : 0, captive: captive ? captive.id : 0 };
    // techniques seen: a better boat, a way of working bronze (learned for real only by those who come home)
    const tB = B.tech && B.tech.known; const tA = A.tech && A.tech.known;
    if (tA && tB && (out === 'troca' || out === 'diplomacia' || out === 'amizade')) { const novel = Object.keys(tB).filter(k => tB[k] && !tA[k]); if (novel.length) e.contact.tech = pick(novel); }
    const txt = (OUT_TXT[out] || OUT_TXT.observacao)(lead ? lead.name : 'O líder', B.name, set.name, guest ? guest.name : '');
    chapter(e, 'Primeiro contato', `Primeiro contato entre ${A.name} e ${B.name}, ${K.na(K.named(K.at(set.cx, set.cy)) ? K.name(K.at(set.cx, set.cy)) : 'na terra de ' + set.name)}. ${txt}`, out === 'violencia' ? 'sword' : 'eye', true, { x: c.x, y: c.y, k: 'contato' });
    for (const v of party) G.Life && G.Life.bio(v, 'contact', B.name, set.name);
    G.Stories && G.Stories.signal('firstContact', { exp: e.id, a: A.id, b: B.id, set: set.id, out, who: e.leader, ids: party.map(v => v.id), nat: nat.map(v => v.id), x: c.x, y: c.y });
  }
  // the natives' side of it: walk out, stand, react
  function runContato(v, t, dt, H) {
    const e = X.get(t.exp); if (!e || !e.ct || e.st !== 'contato') { v.act = ''; return H.end(v); }
    const c = e.ct; const k = t.k || 0;
    if (t.st === 0) { const a = Math.atan2(e.landAt[1] - c.y, e.landAt[0] - c.x) + Math.PI + (k - 3) * 0.35; const p = W.nearestLand(c.x + Math.cos(a) * 1.8, c.y + Math.sin(a) * 1.8, 2) || [c.x, c.y]; if (!H.goto(v, p[0], p[1], true, N * N)) return H.end(v); t.st = 1; return; }
    if (t.st === 1) { if (H.move(v, dt, c.out === 'fuga' || c.out === 'violencia' ? 1.2 : 0.9)) t.st = 2; return; }
    v.moving = false; const lead = P(e.leader); if (lead) G.faceTo(v, lead.x - v.x, lead.y - v.y);
    v.act = t.pose || (c.out ? '' : 'look');
    if (c.out === 'medo' && t.st === 2) { t.st = 3; const home = G.S.settlements.get(v.set); if (home) H.goto(v, home.cx, home.cy, true); }
    if (t.st === 3) { v.act = 'run'; H.move(v, dt, 1.4); }
    if (t.age > 70) H.end(v);
  }

  // ------------------------------ back aboard ------------------------------
  function reboardTick(e, f, crew, ships) {
    e.dq -= 0.5; if (e.dq > 0) return;
    const ash = [...new Set(crew.filter(v => !v.aboard))];
    // whoever ashore lost the errand (a feast with the strangers, a meal, a fright) is called back down to the boats
    for (const v of ash) if (!v.captive && !(v.task && (v.task.type === 'expl' || v.task.pri >= 6)) && !(G.Scene && G.Scene.actorScene(v))) { G.Vg.endTask(v); G.Vg.setTask(v, { type: 'expl', exp: e.id, pri: 3.3, st: 'back', n: 0 }); }
    const at = ash.filter(v => G.dist(v.x, v.y, e.landAt[0], e.landAt[1]) < 2.4);
    for (const v of at.slice(0, 2)) { const s = berth(e, v, ships); if (!s) continue; G.Vg.endTask(v); v.aboard = s.id; v.task = { type: 'aboard', ship: s.id, pri: 9, st: 0, age: 0 }; if (!s.crew.includes(v.id)) s.crew.push(v.id); }
    e.dq = 0.6;
    // the ones who never make it back to the beach (lost in the woods, taken, dead) are left
    // (the ones still walking back down to the beach are waited for a while longer)
    if (ash.length && (e.t < 80 || (e.t < 170 && ash.some(v => v.task && v.task.type === 'expl' && !v.captive)))) return;
    for (const v of ash) { if (v.task && v.task.type === 'expl') G.Vg.endTask(v); e.crew = e.crew.filter(id => id !== v.id); if (!(e.left = e.left || []).includes(v.id)) e.left.push(v.id); v.wrecked = { ship: e.flag, name: e.name, d: G.S.day, fac: e.fac, exp: e.id, x: v.x, y: v.y, left: 1 }; chapter(e, 'Deixad' + oa(v), `${v.name} não voltou para a praia a tempo. Os navios partiram sem el${v.g === 'f' ? 'a' : 'e'}.`, 'skull'); }
    // more to see, or home
    const left = e.prov / (Math.max(1, crew.length) * FOOD); const homeD = G.dist(e.landAt[0], e.landAt[1], e.moor[0], e.moor[1]);
    if (e.kind !== 'colonia' && e.scale === 'grande' && left > (homeD / 1.4 / DAY()) * 2.2 + 0.3 && (e.visited || []).length < 3) {
      const flag = ship(e.flag); const nx = flag && landNear(e, flag, 40);
      if (nx) { e.st = 'viagem'; e.t = 0; e.contactDone = 0; e.visitDone = 0; e.obj.key = nx.key; plot(e, ships); return; }
    }
    goHome(e, ships);
  }
  function goHome(e, ships) {
    e.st = 'volta'; e.t = 0;
    const d = G.S.buildings.get(e.dock); const di = d && d.type === 'doca' ? Nv.dockInfo(d) : null;
    // the home port, or any port of the people (the old one may be gone)
    let to = di && di.moor ? di.moor : null;
    if (!to) { const f = F(e.fac); const alt = f ? Nv.docksOf(f.id).map(b => Nv.dockInfo(b)).find(i => i.moor) : null; to = alt ? alt.moor : null; }
    if (!to) to = e.moor;
    e.homeTo = to;
    for (const s of ships) { const w = s.id === e.flag ? to : (Nv._nearestWater(to[0] + G.rr(-2, 2), to[1] + G.rr(-2, 2), 2) || to); if (!Nv._sailTo(s, w[0], w[1])) Nv._sailTo(s, to[0], to[1]); }
  }
  function backTick(e, f, crew, ships, dt) {
    const flag = ship(e.flag); if (!flag) return;
    e.evT = (e.evT || G.rr(12, 20)) - 0.5; if (e.evT <= 0) { e.evT = G.rr(14, 24); voyageEvent(e, f, ships, true); if (!X.live(e) || e.st !== 'volta') return; }
    if ((e.flw = (e.flw || 0) - 0.5) <= 0) { e.flw = 2.5; for (const s of ships) if (s !== flag && (!s.path || s.pi >= s.path.length) && G.dist(s.x, s.y, e.homeTo[0], e.homeTo[1]) > 3) Nv._sailTo(s, e.homeTo[0], e.homeTo[1]); }
    if (!flag.path || flag.pi >= flag.path.length) {
      if (G.dist(flag.x, flag.y, e.homeTo[0], e.homeTo[1]) > 3) { if (!Nv._sailTo(flag, e.homeTo[0], e.homeTo[1])) { e.homeTo = e.moor; Nv._sailTo(flag, e.moor[0], e.moor[1]); } return; }
      e.st = 'chegada'; e.t = 0; e.dq = 0; arrive(e, f);
    }
    void crew; void dt;
  }
  // ------------------------------ home: what they bring ------------------------------
  function arrive(e, f) {
    const S = G.S; const lead = P(e.leader); const back = alive(e); const lostN = e.lost.length;
    const leftN = (e.left || []).filter(id => P(id) && !back.some(b => b.id === id)).length;
    // the knowledge comes ashore with them
    const out = { regions: [], ores: [], facs: [], sp: [], wrecks: [], rumors: [] };
    const merge = o => { for (const k in out) out[k] = out[k].concat(o[k] || []); };
    for (const s of e.ships.map(ship).filter(Boolean)) merge(K.bring(s, e.fac, { quietMeet: true }));
    for (const v of back) merge(K.bring(v, e.fac, { quietMeet: true }));
    merge(K.bring(e, e.fac, { quietMeet: true }));
    // the first meeting, told at home: now both peoples know of each other
    if (e.contact) { const B = F(e.contact.fac); const r = B && G.Fac.rel(f.id, B.id); if (r && !r.met) G.Politics.meet(f, B, { quiet: true, op: e.contact.op, via: 'expedição' }); else if (r) r.op = clamp(r.op + e.contact.op * 0.5, -100, 100); if (e.contact.tech && G.Civ.learn && !G.Civ.has(f.id, e.contact.tech)) { G.Civ.learn(f, e.contact.tech, 'contato'); e.learned = e.contact.tech; } }
    // the tale that sent them, settled for good or for ill
    if (e.obj.rumor) { const rm = K.rumorById(e.obj.rumor); if (rm) { const r = rm.key !== null ? K.reg(rm.key) : null; const saw = r && (e.visited || []).includes(r.key); if (saw) { const ok = rm.truth.ok !== false; K.settle(rm, f.id, ok, ok ? 'confirmado' : rm.truth.what === 'ferro' ? 'não era ouro: era ferro' : 'era pirita, ouro de tolo'); e.verdict = rm.truth; } } }
    e.end = S.day; e.status = 'voltou'; e.st = 'chegada';
    const found = e.disc.filter(d => d.k === 'r').map(d => d.txt);
    const ores = out.ores.map(o => o.claim === o.ore.kind ? (o.claim === 'ouro' ? 'ouro' : 'ferro') : 'pedras que pareciam ouro (era ferro)');
    const bits = [];
    if (found.length) bits.push(`${found.length > 1 ? 'terras novas' : 'uma terra nova'}: ${found.map(n => K.a(n)).join(', ')}`);
    if (ores.length) bits.push(`a notícia de ${[...new Set(ores)].join(' e ')}`);
    if (e.verdict && e.verdict.ok === false && !ores.length) bits.push(e.verdict.what === 'pirita' ? 'a verdade sobre o ouro do boato: era pirita, ouro de tolo' : 'a verdade sobre o boato: não era o que contavam');
    if (out.sp.length) bits.push(`${out.sp.length} ${out.sp.length > 1 ? 'bichos' : 'bicho'} que ninguém conhecia`);
    if (e.contact) bits.push(`notícias de um povo: ${F(e.contact.fac) ? F(e.contact.fac).name : 'gente estranha'}`);
    if (e.learned) bits.push(`um saber novo (${e.learned})`);
    const days = Math.max(1, Math.round((S.day - (e.dayOut || e.day0)) * 10) / 10);
    const txt = `${e.scale === 'so' && lead ? `${lead.name} voltou a ${e.fromName}` : `${e.name} voltou a ${e.fromName}${lead ? ` com ${lead.name} no comando` : ''}`}${lostN ? `, sem ${lostN} dos que partiram` : ''}${leftN ? `${lostN ? ' e' : ','} com ${leftN} deixad${leftN > 1 ? 'os' : 'o'} para trás do outro lado do mar` : ''}. ${bits.length ? 'Trouxe ' + bits.join('; ') + '.' : 'Não trouxe nada além de histórias do mar.'}${e.presumed ? ' Já ninguém esperava.' : ''}`;
    chapter(e, 'A volta', txt, found.length || ores.length ? 'star' : 'ship', true);
    X.mark(f, found.length || ores.length || e.contact ? 'achou' : 'voltou');
    for (const v of back) { v.voyages = (v.voyages || 0) + 1; v.expCD = S.day; G.Life && G.Life.bio(v, 'seaHome', `${days >= 2 ? Math.round(days) + ' anos' : 'um ano'} no mar${found.length ? ', com notícias de ' + found[0] : ''}`); }
    if (lead && (found.length || ores.length)) lead.fame = (lead.fame || 0) + 2 + found.length;
    G.Lore && G.Lore.note && G.Lore.note('expedition', { fac: f.id, name: e.name, leader: e.leader, found: found.slice(0, 3), lost: lostN });
    G.Stories && G.Stories.signal('expHome', { exp: e.id, fac: f.id, leader: e.leader, ids: back.map(v => v.id), found: found.length, ores: ores.length, contact: !!e.contact, lost: lostN, presumed: !!e.presumed, x: e.moor[0], y: e.moor[1] });
    // a guest from beyond the sea comes to live here
    for (const id of e.guests || []) { const g = P(id); if (g) { const hm = S.settlements.get(e.from); if (hm) { g.set = hm.id; g.home = 0; g.guestOf = Object.assign(g.guestOf || {}, { d: S.day }); log(`${g.name}, de ${F(g.guestOf.from) ? F(g.guestOf.from).name : 'além-mar'}, veio com ${e.name} e ficou em ${hm.name}. As crianças seguem el${g.g === 'f' ? 'a' : 'e'} pela rua.`, 'heart', hm.cx, hm.cy); } } }
  }
  function arriveTick(e, f, crew, ships) {
    e.dq -= 0.5; if (e.dq > 0) return;
    const ab = crew.filter(v => v.aboard);
    for (const v of ab.slice(0, 2)) {
      const s = ship(v.aboard); v.aboard = 0; v.task = null; v.path = null; const q = W.randomNear(e.port[0], e.port[1], 1.4) || e.port; v.x = q[0]; v.y = q[1];
      // home: the families run down to the quay
      const kin = G.Stories ? G.Stories.kin(v).filter(k => !k.captive && G.dist(k.x, k.y, v.x, v.y) < 40 && !(k.task && k.task.pri >= 3)) : [];
      if (kin.length) { const k = kin[0]; G.Vg.emote(k, 'heart', 3); G.Vg.emote(v, 'heart', 3); }
      void s;
    }
    e.dq = 0.6; if (ab.length > 2) return;
    // the ships go back to the port's work
    for (const s of ships) { s.exp = 0; s.st = 'idle'; s.t = 0; s.crew = s.kind === 'pesca' ? [] : []; if (s.kind === 'canoa' || s.kind === 'jangada') Nv._remove(s); }
    e.st = 'fim'; e.end = e.end || G.S.day;
  }
  // ------------------------------ the end of it ------------------------------
  function finish(e, status, txt, o) {
    o = o || {}; const S = G.S; e.status = status; e.end = S.day; e.st = 'fim';
    if (txt) chapter(e, status === 'cancelada' ? 'Fim' : 'O fim', txt, status === 'perdida' ? 'skull' : 'ship', !!o.chron || status !== 'cancelada' || e.scale === 'grande');
    // whoever was waiting on the quay goes home; the provisions go back to the stores
    for (const id of e.crew) { const v = P(id); if (!v) continue; if (v.task && (v.task.type === 'cais' || v.task.type === 'expl') && v.task.exp === e.id) G.Vg.endTask(v); if (v.aboard && e.ships.includes(v.aboard)) { const s = ship(v.aboard); if (s && !Nv.atSea(s)) { v.aboard = 0; v.task = null; const q = W.randomNear(e.port[0], e.port[1], 1.4) || e.port; v.x = q[0]; v.y = q[1]; } } }
    const f = F(e.fac); if (status === 'cancelada' && f && e.prov > 0) { G.Village.addStock('food', Math.floor(e.prov), f.id); e.prov = 0; }
    for (const s of e.ships.map(ship).filter(Boolean)) { if (!Nv.atSea(s) || status === 'cancelada') { s.exp = 0; if (s.st === 'prep') s.st = 'idle'; if (s.kind === 'pesca') s.crew = []; } }
  }
  // all hands lost: only the sea knows (home learns that they never came back, later)
  function lostAll(e) {
    const S = G.S; if (e.status === 'perdida' || e.status === 'naufragada') return;
    const castaways = (S.castaways || []).some(c => c.exp === e.id && c.ids.some(P));
    e.status = castaways ? 'naufragada' : 'perdida'; e.truthEnd = S.day; e.st = 'fim'; e.end = S.day;
    for (const s of e.ships.map(ship).filter(Boolean)) { s.exp = 0; if (!Nv.aboardOf(s).length) { s.ghost = 1; s.st = 'deriva'; s.driftT = DAY() * G.rr(0.6, 1.5); } }
    // the god sees it; the people do not (yet)
    chapter(e, castaways ? 'O naufrágio' : 'O silêncio', castaways ? `Do que foi ${e.name}, só restam náufragos numa praia distante.` : `De ${e.name}, não sobrou ninguém. Em ${e.fromName}, ainda olham para o mar.`, 'skull', false);
    G.Stories && G.Stories.signal('expLostTruth', { exp: e.id, fac: e.fac });
  }
  // home's side of it: they are late; then they are late for too long
  function overdue() {
    const S = G.S;
    for (const e of exps()) {
      if (e.presumed || e.status === 'voltou' || e.status === 'cancelada' || e.status === 'colonia' || !e.due || S.day < e.due) continue;
      if (e.status === 'ativa' && X.live(e) && (e.st === 'volta' || e.st === 'chegada')) continue;
      e.presumed = S.day; const f = F(e.fac); if (!f) continue;
      const kin = new Set(); for (const id of e.crew.concat(e.lost)) { const v = PD(id); if (v && G.Stories) for (const k of G.Stories.kin(v)) kin.add(k); }
      for (const k of kin) if (S.villagers.has(k.id)) { k.mourn = Math.max(k.mourn || 0, DAY() * 0.3); }
      log(`${e.name} não voltou. Em ${e.fromName}, ${e.scale === 'so' ? `a família de ${e.leaderName} acende uma lamparina na janela que dá para o mar` : `as famílias de ${e.crew.length + e.lost.length} marinheiros já usam luto`}.`, 'skull', e.moor[0], e.moor[1]);
      if (X.live(e)) chapter(e, 'Dados como perdidos', `Em casa, já falam de ${e.name} como dos mortos.`, 'skull');
      X.mark(f, 'perdeu', { a: e.a });
      G.Lore && G.Lore.note && G.Lore.note('lostExp', { fac: f.id, name: e.name, dir: e.dirw });
      G.Stories && G.Stories.signal('expLost', { exp: e.id, fac: f.id, leader: e.leader, ids: e.crew.concat(e.lost), x: e.moor[0], y: e.moor[1] });
    }
  }

  // ====================================================================================
  //  THE SEA HAPPENS: a library of events (each looks at where, when, who, with what)
  // ====================================================================================
  function ctxOf(e, f, flag) {
    const S = G.S; const i = W.idx(flag.x, flag.y); const temp = S.temp ? S.temp[i] / 255 : 0.5;
    const near = k => { let n = 0; for (const a of S.animals.values()) if (!a.dead && a.kind === k && G.dist2(a.x, a.y, flag.x, flag.y) < 324) n++; return n; };
    const ab = aboardE(e); const days = (S.clock - (e.sea0 || S.clock)) / DAY();
    let land = null, ld = 44; for (const r of K.regions()) { if (!K.big(r) || K.state(e.fac, r) >= K.EXP) continue; const d = K.distTo(r, flag.x, flag.y); if (d < ld) { ld = d; land = r; } }
    let wreck = null; for (const w of S.wrecks || []) if (G.dist2(w.x, w.y, flag.x, flag.y) < 100 && !(e.wrecksSeen || []).includes(w.id)) wreck = w;
    const reef = G.Sea && G.Sea.floor && (() => { for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const x = Math.floor(flag.x) + dx, y = Math.floor(flag.y) + dy; if (W.inb(x, y) && G.Sea.floor[y * N + x] === G.Sea.F.REEF) return true; } return false; })();
    const ship2 = S.ships.find(o => o.fac !== e.fac && !o.ghost && G.dist2(o.x, o.y, flag.x, flag.y) < 196);
    const ghost = S.ships.find(o => o.ghost && G.dist2(o.x, o.y, flag.x, flag.y) < 144);
    return { S, f, flag, ab, n: ab.length, days, deep: S.type[i] === T.DEEP, cold: temp < 0.25, warm: temp > 0.62, storm: S.weather.storm > 0, night: G.isNight(), dawn: S.time < 0.12, prov: e.prov / Math.max(1, ab.length * FOOD), morale: e.morale, whales: near('whale'), dolphins: near('dolphin'), orcas: near('orca'), sharks: near('shark'), seals: near('seal'), land, ld, wreck, reef, ship2, ghost, small: Nv.small(flag), lead: P(e.leader), sick: ab.filter(v => v.sick > 0).length, glow: G.Sea && G.Sea.glowing && G.Sea.glowing(), back: e.st === 'volta' };
  }
  const someone = (c, not) => { const l = c.ab.filter(v => v.id !== (not || 0)); return l.length ? pick(l) : null; };
  const EV = [
    { id: 'tempestade', w: c => (c.storm ? 4 : 0), run(e, c) {
      const sev = G.rr(0.5, 1.2) * (c.small ? 1.8 : 1);
      for (const s of e.ships.map(ship).filter(Boolean)) { s.hp -= G.rr(6, 22) * sev; s.sail = Math.max(0, (s.sail === undefined ? 100 : s.sail) - G.rr(10, 45) * sev); if (!c.small && G.R() < 0.12 * sev) s.mast = 0; s.hurt = 0.5; }
      const lostP = Math.round(e.prov * G.rr(0.08, 0.3)); e.prov -= lostP; e.morale -= 10; e.storm = 1;
      let over = null; if (G.R() < 0.18 * sev && c.n > 1) { over = someone(c, e.leader); if (over) { over.aboard = 0; G.Village.kill(over, 'drown', false); } }
      const div = G.R() < 0.3; if (div) { const flag = c.flag; const wa = c.S.weather.windA || G.R() * TAU; const w = Nv._nearestWater(clamp(flag.x + Math.cos(wa) * 20, 2, N - 3), clamp(flag.y + Math.sin(wa) * 20, 2, N - 3), 4); if (w && Nv._sailTo(flag, w[0], w[1])) { e.legs = Math.max(0, e.legs - 1); } }
      const flagS = ship(e.flag); const mast = flagS && flagS.mast === 0;
      return ['A tempestade', `${pick(['O céu fechou de repente', 'Ondas da altura de casas', 'Uma noite inteira de vento e água'])}. ${lostP ? `As ondas levaram ${lostP > 6 ? 'boa parte' : 'um pouco'} da comida. ` : ''}${mast ? 'O mastro partiu como um graveto. ' : ''}${over ? `${over.name} foi arrancad${oa(over)} do convés e o mar não devolveu. ` : ''}${div ? 'Quando o vento parou, ninguém sabia mais onde estava.' : 'De manhã, ainda estavam inteiros.'}`, over ? 'skull' : 'storm', !!over || mast];
    } },
    { id: 'calmaria', w: c => (!c.storm && !c.cold ? 0.9 : 0.2), run(e, c) { for (const s of e.ships.map(ship).filter(Boolean)) { s.wind = 0.15; s.windT = 18; } e.morale -= 6; return ['Calmaria', `O vento morreu. ${pick(['As velas penduradas como roupa no varal', 'O mar liso como um espelho'])}; ${c.n > 1 ? 'a tripulação rema, reza e conta a comida' : (c.lead ? c.lead.name : 'Sozinho') + ' rema até as mãos sangrarem'}.`, 'ship']; } },
    { id: 'corrente', w: c => (c.deep ? 0.6 : 0.3), run(e, c) { const good = G.R() < 0.6; for (const s of e.ships.map(ship).filter(Boolean)) { s.wind = good ? 1.5 : 0.6; s.windT = 25; } e.morale += good ? 4 : -3; return [good ? 'A corrente boa' : 'A corrente contrária', good ? 'Uma corrente quente pega o casco e leva o barco depressa, como se o mar quisesse mostrar alguma coisa.' : 'Uma corrente teimosa empurra para trás: um dia inteiro de remo para não sair do lugar.', 'wave']; } },
    { id: 'neblina', w: c => (c.cold ? 1.4 : c.dawn ? 0.9 : 0.3), run(e, c) { for (const s of e.ships.map(ship).filter(Boolean)) { s.lookout = 0.35; s.lookT = 30; } const lost = G.R() < 0.3; if (lost) e.legs++; return ['Neblina', `Uma neblina tão grossa que não se via a proa${lost ? '. Quando abriu, estavam fora do rumo' : '. Navegaram pelo som das ondas'}.`, 'eye']; } },
    { id: 'doenca', w: c => (c.days > 0.25 && c.n > 2 ? 0.5 + c.n * 0.03 : 0), run(e, c) { const v = someone(c); if (!v) return null; v.sick = Math.max(v.sick || 0, DAY() * G.rr(0.15, 0.35)); const nat = P(e.roles.nat); return ['A febre', `${v.name} amanheceu com febre e manchas no corpo. ${nat && nat.id !== v.id && nat.aboard ? nat.name + ' faz o que sabe com ervas e água do mar.' : 'Ninguém a bordo sabe o que fazer.'}`, 'sick']; } },
    { id: 'sede', w: c => (c.days > 0.5 && !c.cold ? 0.45 : 0), run(e, c) { e.morale -= 9; e.prov -= Math.min(e.prov * 0.1, 4); return ['A água acabando', 'A água dos barris ficou verde. Racionam o que resta, um gole de manhã e outro à noite, e todo mundo olha para as nuvens.', 'water']; } },
    { id: 'fome', w: c => (c.prov < 0.6 ? 2 : 0), run(e, c) { e.morale -= 14; return ['Fome', `${pick(['Comem o couro das sandálias', 'Pescam com anzóis de osso para enganar a fome', 'Contam os biscoitos um por um'])}. ${c.lead ? c.lead.name : 'O líder'} divide a última ração em partes iguais.`, 'food']; } },
    { id: 'motim', w: c => (c.morale < 32 && c.n >= 4 ? 2.4 : 0), run(e, c) {
      const L = c.lead; if (!L) return null; const ring = someone(c, L.id); if (!ring) return null;
      const lp = G.Politics.persona(L); const hold = L.courage + lp.agg * 0.5 + (L.voyages || 0) * 0.15 + G.rr(-0.3, 0.3);
      for (const v of c.ab) G.Life && G.Life.bio(v, 'mutiny', Nv.title(c.flag));
      if (hold > 0.85) { e.morale += 18; return ['O motim', `${ring.name} juntou os descontentes e exigiu a volta. ${L.name} subiu no barril de água e falou até eles baixarem os olhos. O barco segue em frente.`, 'shout', true]; }
      if (hold > 0.45 || !c.back) { e.morale += 8; e.turned = 'motim'; goHome(e, e.ships.map(ship).filter(Boolean)); return ['O motim', `${ring.name} e os outros cercaram ${L.name} no convés: “Para casa, ou para o fundo.” ${L.name} cedeu. As proas viram para casa.`, 'shout', true]; }
      L.aboard = 0; G.Village.kill(L, 'drown', false); e.morale += 12; e.turned = 'motim'; goHome(e, e.ships.map(ship).filter(Boolean));
      return ['O motim', `De madrugada, ${ring.name} e mais três jogaram ${L.name} ao mar. Ninguém viu nada, todos juram. ${ring.name} manda voltar.`, 'skull', true];
    } },
    { id: 'briga', w: c => (c.n >= 3 && c.morale < 60 ? 0.6 : 0), run(e, c) { const a = someone(c), b = a && someone(c, a.id); if (!a || !b) return null; const hurt = G.R() < 0.5; if (hurt) G.Vg.damage(b, G.rr(10, 25), 'war'); return ['A briga', `${a.name} e ${b.name} rolaram no convés por causa de ${pick(['um pedaço de peixe', 'um jogo de ossinhos', 'uma palavra sobre a mãe de alguém', 'quem ficava com a vigia'])}${hurt ? `. ${b.name} ficou com a cabeça aberta` : '; no fim, dividiram a mesma manta'}.`, 'sword']; } },
    { id: 'baleias', w: c => (c.whales ? 2.4 : c.deep ? 0.25 : 0), run(e, c) {
      e.morale += 8; const nordic = e.civ === 'nordico';
      if (c.small && G.R() < 0.06) { const s = c.flag; s.hp -= s.maxHp * 0.7; return ['A baleia', `Uma baleia subiu debaixo da canoa. Por um instante, o mundo inteiro virou água.`, 'wave', true]; }
      if (nordic && !c.small && G.R() < 0.4) { e.prov += 14; return ['A caça', `Arpões e cordas: os homens do norte caçaram uma baleia jovem. Comeram gordura até passar mal, e cantaram.`, 'food']; }
      return ['As baleias', `${c.whales > 1 ? 'Um grupo de baleias' : 'Uma baleia'} nadou ao lado do barco a manhã inteira, soprando colunas de água. ${pick(['Ninguém falou nada', 'Uma criança da tripulação chorou de emoção', 'O mais velho disse que eram os mortos do mar, vindo ver quem passava'])}.`, 'wave'];
    } },
    { id: 'golfinhos', w: c => (c.dolphins ? 1.6 : c.warm ? 0.3 : 0), run(e) { e.morale += 10; return ['Os golfinhos', 'Golfinhos brincaram na proa a tarde toda. Os marinheiros juraram que era sinal de boa viagem.', 'wave']; } },
    { id: 'predador', w: c => (c.orcas || c.sharks ? 1.4 : 0), run(e, c) { e.morale -= 6; const k = c.orcas ? 'orcas' : 'tubarões'; return ['As barbatanas', `${k === 'orcas' ? 'Orcas, pretas e brancas, rondaram o casco' : 'Barbatanas cortando a água em volta do barco'}. Ninguém pôs a mão para fora a noite inteira.`, 'paw']; } },
    { id: 'cardume', w: c => (c.S.fish.some(sh => G.dist2(sh.x, sh.y, c.flag.x, c.flag.y) < 100) ? 1.6 : 0.2), run(e) { const n = Math.round(G.rr(4, 12)); e.prov += n; e.morale += 4; return ['O cardume', `A água ferveu de peixe prateado. Encheram ${n > 8 ? 'os cestos' : 'um cesto'} só de puxar a rede.`, 'fish']; } },
    // the signs of land a sailor knows how to read, from near to far
    { id: 'nuvem', w: c => (c.land && c.ld >= 14 && c.ld < 44 && !c.back && !c.night && !c.storm ? 1.5 : 0), run(e, c) { const r = c.land; if (e.st === 'viagem' && r && (e.obj.key === null || G.R() < 0.5)) { e.obj.key = r.key; plot(e, e.ships.map(ship).filter(Boolean)); } return ['A nuvem parada', `Uma nuvem não se mexe no horizonte, a ${K.dir(r.cx - c.flag.x, r.cy - c.flag.y)}, enquanto todas as outras correm. ${c.lead ? c.lead.name : 'O líder'} conhece o sinal: debaixo de nuvem parada tem terra.`, 'eye']; } },
    { id: 'galhos', w: c => (c.land && c.ld >= 10 && c.ld < 36 && !c.back ? 1.2 : 0), run(e, c) { const r = c.land; if (e.st === 'viagem' && r && (e.obj.key === null || G.R() < 0.5)) { e.obj.key = r.key; plot(e, e.ships.map(ship).filter(Boolean)); } return ['Galhos verdes', `Um galho com as folhas ainda verdes passou boiando, vindo de ${K.dir(r.cx - c.flag.x, r.cy - c.flag.y)}. Árvore não nasce no mar: ${c.lead ? c.lead.name : 'o líder'} manda subir a corrente.`, 'eye']; } },
    { id: 'aves', w: c => (c.land && c.ld < 22 && !c.back ? 2.2 : 0), run(e, c) { const r = c.land; if (e.st === 'viagem' && r && (e.obj.key === null || G.R() < 0.5)) { e.obj.key = r.key; plot(e, e.ships.map(ship).filter(Boolean)); } return ['Pássaros de terra', `Pássaros que não são do mar passaram voando para ${K.dir(r.cx - c.flag.x, r.cy - c.flag.y)}. Terra perto. ${c.lead ? c.lead.name : 'O líder'} manda seguir as aves.`, 'eye']; } },
    { id: 'recife', w: c => (c.reef ? 1.1 : 0), run(e, c) { const s = c.flag; const d = G.rr(8, 26) * (c.small ? 0.8 : 1); s.hp -= d; s.hurt = 0.5; if (s.hp <= s.maxHp * 0.25) s.flood = Math.max(s.flood || 0, 40); return ['O recife', `Um estalo no fundo: o casco raspou num recife de coral. ${s.hp < s.maxHp * 0.4 ? 'A água entra; todo mundo tira água com as mãos.' : 'Passaram, com o coração na boca.'}`, 'wave', s.hp < s.maxHp * 0.4]; } },
    { id: 'navio', w: c => (c.ship2 ? 2.2 : 0), run(e, c) {
      const o = c.ship2; const B = F(o.fac); if (!B) return null; const met = G.Fac.rel(e.fac, B.id) && G.Fac.rel(e.fac, B.id).met;
      if (!met) for (const v of c.ab) K.note(v, { k: 'f', id: B.id, via: 'navio no mar' });
      const war = G.Fac.atWar(e.fac, B.id);
      if (war) { goHome(e, e.ships.map(ship).filter(Boolean)); return ['Velas inimigas', `${cap1(Nv.title(o))}, de ${B.name}, apareceu no horizonte. Estamos em guerra: ${c.lead ? c.lead.name : 'o líder'} manda fugir.`, 'sword']; }
      return ['Uma vela estranha', met ? `Cruzaram com ${Nv.title(o)}, de ${B.name}. Acenaram de longe.` : `Uma vela ${K.SAIL[o.civ] ? K.SAIL[o.civ].replace(/^de /, 'de ') : 'desconhecida'} cruzou o horizonte: gente de outro povo, que ninguém d${F(e.fac).name.startsWith('Clã') ? 'o' : 'e'} ${F(e.fac).name} conhece.`, 'eye', !met];
    } },
    { id: 'destrocos', w: c => (c.wreck ? 3 : 0), run(e, c) {
      const w = c.wreck; (e.wrecksSeen = e.wrecksSeen || []).push(w.id); for (const v of c.ab) K.note(v, { k: 'w', id: w.id });
      for (const s of e.ships.map(ship).filter(Boolean)) s.hp = Math.min(s.maxHp, s.hp + 8);
      const mine = w.fac === e.fac; const lostE = w.exp && X.get(w.exp);
      if (mine && lostE && lostE.presumed) { e.solved = lostE.id; return ['O casco', `Era ${w.title}, que saiu de ${lostE.fromName} com ${lostE.leaderName} e nunca voltou. O casco no fundo, as tábuas cobertas de cracas. Agora se sabe.`, 'skull', true]; }
      return ['Destroços', `${cap1(w.title)}${w.fac && F(w.fac) ? ', de ' + F(w.fac).name : ''}, ${w.shallow ? 'com o mastro ainda de fora d’água' : 'no fundo, visível na água clara'}. Tiraram tábuas boas para remendar o casco.`, 'wave'];
    } },
    { id: 'fantasma', w: c => (c.ghost ? 3 : 0), run(e, c) {
      const o = c.ghost; o.ghost = 0; const lostE = o.exp0 && X.get(o.exp0);
      if (o.fac === e.fac || !F(o.fac)) { o.exp = e.id; o.fac = e.fac; o.st = 'out'; o.dock = e.dock; e.ships.push(o.id); return ['O barco vazio', `${cap1(Nv.title(o))} boiava sozinho, sem ninguém a bordo${lostE ? ` — era d${lostE.name.startsWith('A') ? 'a ' + lostE.name.slice(2) : 'a expedição de ' + lostE.leaderName}` : ''}. Amarraram e levaram junto.`, 'eye', true]; }
      return ['O barco vazio', `${cap1(Nv.title(o))}, de ${F(o.fac).name}, à deriva e vazio. Ninguém quis subir a bordo.`, 'eye'];
    } },
    { id: 'monstro', w: c => (c.night && (c.whales || c.orcas) ? 1.4 : c.night && c.deep ? 0.2 : 0), run(e, c) { K.rumor({ kind: 'monstro', key: null, x: c.flag.x, y: c.flag.y, fac: 0, conf: 0.6, claim: `um monstro do tamanho de uma ilha nas águas ${DIRS[e.dirw] ? 'do ' + e.dirw : 'longe'}`, truth: { ok: false, what: c.whales ? 'baleia' : 'orca' }, origin: { who: c.lead ? c.lead.id : 0, what: 'expedição', fac: e.fac }, quiet: true }); for (const v of c.ab) K.note(v, { k: 'rm', id: (G.S.rumors || []).slice(-1)[0].id, conf: 0.6 }); return ['O monstro', 'De noite, uma coisa enorme passou debaixo do casco, soprando como um fole. De manhã, metade da tripulação jurava ter visto olhos do tamanho de escudos.', 'paw']; } },
    { id: 'brilho', w: c => (c.glow ? 2 : 0), run(e) { e.morale += 12; return ['O mar de luz', 'À noite o mar acendeu: cada remada deixava um rastro de luz azul. Ninguém dormiu.', 'star']; } },
    { id: 'gelo', w: c => (c.cold && c.deep ? 0.8 : 0), run(e, c) { const s = c.flag; if (G.R() < 0.3) { s.hp -= 15; s.hurt = 0.4; } return ['O gelo', 'Placas de gelo boiando, brancas e azuis, rangendo contra o casco. O frio entra nos ossos.', 'snow']; } },
    { id: 'estrelas', w: c => (c.night && !c.storm ? 0.5 : 0), run(e, c) { const v = c.lead; if (v) v.navXp = (v.navXp || 0) + 1; return ['As estrelas', `${v ? v.name : 'O mais velho'} ensina os mais novos a achar o caminho pelas estrelas. ${pick(['Uma delas, que pisca vermelha, eles chamam de olho do mar', 'Desenham no ar um peixe, um remo, uma mulher que chora'])}.`, 'star']; } },
    { id: 'canto', w: c => (c.n >= 3 && c.morale < 70 ? 0.5 : 0), run(e) { e.morale += 6; return ['A canção', `À noite, alguém começou ${pick(['a canção das redes', 'um canto de remar', 'uma música de casa'])}, e no fim todos cantavam.`, 'heart']; } },
  ];
  X.EVENTS = EV;
  function voyageEvent(e, f, ships, back) {
    const flag = ship(e.flag); if (!flag) return;
    if (G.dist(flag.x, flag.y, e.moor[0], e.moor[1]) < 10) return;
    const c = ctxOf(e, f, flag); let tot = 0; const ws = [];
    for (const ev of EV) { if ((e.ev[ev.id] || 0) > G.S.clock) { ws.push(0); continue; } const w = Math.max(0, ev.w(c, e) || 0); ws.push(w); tot += w; }
    if (tot <= 0 || G.R() < 0.35) return;
    let r = G.R() * tot; let ev = null; for (let k = 0; k < EV.length; k++) { r -= ws[k]; if (r <= 0) { ev = EV[k]; break; } }
    if (!ev) return;
    e.ev[ev.id] = G.S.clock + DAY() * 0.25;
    const out = ev.run(e, c); if (!out) return;
    e.morale = clamp(e.morale, 0, 100);
    chapter(e, out[0], out[1], out[2], !!out[3] && e.scale !== 'so');
    void back; void ships;
  }

  // ====================================================================================
  //  THE SHIPS OF AN EXPEDITION
  // ====================================================================================
  function shipRun(s, dt) {
    const e = s.exp && X.get(s.exp);
    if (s.windT > 0) { s.windT -= dt; if (s.windT <= 0) s.wind = 1; }
    if (s.lookT > 0) { s.lookT -= dt; if (s.lookT <= 0) s.lookout = 1; }
    if (!e || !X.live(e)) {
      // an empty hull adrift: the wind takes it until it breaks on a coast (or someone finds it)
      if (s.ghost && s.st === 'deriva') { s.driftT -= dt; const wa = G.S.weather.windA || 0; const nx = s.x + Math.cos(wa) * dt * 0.25, ny = s.y + Math.sin(wa) * dt * 0.25; if (W.inb(nx, ny) && G.S.type[W.idx(nx, ny)] <= T.SEA) { s.x = nx; s.y = ny; } else { Nv.sink(s, null, 'reef'); return; } if (s.driftT <= 0) Nv.sink(s, null, 'flood'); return; }
      if (s.st === 'prep' || s.st === 'idle') { s.exp = 0; s.st = 'idle'; if (s.kind === 'canoa' && !Nv.aboardOf(s).length) Nv._remove(s); return; }
      // the voyage is over for this hull: back to its port
      const h = Nv._home(s); if (h && h.moor && s.st !== 'casa') { if (Nv._sailTo(s, h.moor[0], h.moor[1])) s.st = 'casa'; else { s.st = 'idle'; } }
      if (s.st === 'casa' && Nv._move(s, dt)) { s.st = 'idle'; s.exp = 0; for (const v of Nv.aboardOf(s)) { v.aboard = 0; v.task = null; const q = W.nearestLand(s.x, s.y, 6); if (q) { v.x = q[0]; v.y = q[1]; } } }
      return;
    }
    if (s.st === 'prep' || s.st === 'idle') return;
    // run from enemy warships
    if (Nv.atSea(s) && (s.flee = (s.flee || 0) - dt) <= 0) { s.flee = 2; const en = Nv._threat(s, 7); if (en && e.st !== 'volta') { chapter(e, 'Perseguidos', `${cap1(Nv.title(en))} veio atrás. ${P(e.leader) ? P(e.leader).name : 'O líder'} manda fugir para casa.`, 'sword'); goHome(e, e.ships.map(ship).filter(Boolean)); } }
    Nv._move(s, dt);
  }
  X.shipRun = shipRun;
  for (const k of ['explorador', 'canoa']) Nv.RUN[k] = shipRun;
  const fishRun = Nv.RUN.pesca || Nv.RUN0.pesca; Nv.RUN.pesca = (s, dt) => (s.exp || s.ghost ? shipRun(s, dt) : fishRun(s, dt));
  const trRun = Nv.RUN.transporte || Nv.RUN0.transporte; Nv.RUN.transporte = (s, dt) => (s.exp || s.ghost ? shipRun(s, dt) : trRun(s, dt));
  const merRun = Nv.RUN.mercante || Nv.RUN0.mercante; Nv.RUN.mercante = (s, dt) => (s.exp || s.ghost ? shipRun(s, dt) : merRun(s, dt));
  const warRun = Nv.RUN.guerra || Nv.RUN0.guerra; Nv.RUN.guerra = (s, dt) => (s.exp ? shipRun(s, dt) : warRun(s, dt));
  // the news a whole expedition holds goes into every head (whoever comes home tells it)
  function noteAll(e, it) { for (const v of alive(e)) K.note(v, Object.assign({}, it)); }
  // an explorer stumbles on a vein (called by G.Know)
  X.found = function (e, v, ore) {
    if ((e.ores || []).includes(ore.id)) return; (e.ores = e.ores || []).push(ore.id);
    const nat = P(e.roles.nat); const expert = (nat && !nat.aboard) || v.role === 'mineiro' || v.role === 'ferreiro';
    const claim = ore.kind === 'ouro' || expert || G.R() < 0.7 ? ore.kind : 'ouro';
    noteAll(e, { k: 'o', id: ore.id, claim, via: 'expedição' });
    e.disc.push({ k: 'o', id: ore.id, d: G.S.day, txt: claim });
    const more = (e.ores || []).length > 1;
    const txt = more ? `${v.name} achou mais ${claim === 'ouro' ? 'pedras brilhantes' : 'pedra de ferro'} ${pick(['na encosta', 'perto do riacho', 'numa ravina', 'debaixo das raízes de uma árvore caída'])}.` : ore.kind === 'ferro' ? (claim === 'ferro' ? `${v.name} quebrou uma pedra escura com o machado: por dentro, vermelha de ferrugem. Ferro — muito ferro.` : `${v.name} achou pedras que brilham ao sol. Todos gritaram “ouro!”`) : `${v.name} levantou da água do riacho uma pedrinha amarela que não enferruja. Ouro.`;
    chapter(e, ore.kind === 'ouro' ? 'Ouro' : 'A pedra escura', txt, 'star', e.scale !== 'so' && !more, { x: ore.x, y: ore.y });
    G.Stories && G.Stories.signal('newResource', { exp: e.id, fac: e.fac, ore: ore.id, kind: ore.kind, claim, who: v.id, x: ore.x, y: ore.y });
  };

  // ====================================================================================
  //  THE PEOPLE'S SIDE OF IT (tasks)
  // ====================================================================================
  function walkTo(v, t, key, x, y, dt, H, sp) {
    if (t.wk !== key) { t.wk = key; if (!H.goto(v, x, y, false, N * N) && !H.goto(v, x, y, true, N * N)) { t.wk = null; return -1; } }
    if (H.move(v, dt, sp || 1)) { t.wk = null; return 1; }
    return 0;
  }
  // on the quay before a voyage: carry the crates, wait by the ship, look at the sea
  function runCais(v, t, dt, H) {
    const e = X.get(t.exp); if (!e || (e.st !== 'prep' && e.st !== 'reunir' && e.st !== 'embarque')) { v.gear = null; return H.end(v); }
    const spot = () => { const k = t.k || 0; const a = k * 2.39996, r = 0.6 + Math.sqrt(k) * 0.45; const p = [e.port[0] + Math.cos(a) * r, e.port[1] + Math.sin(a) * r]; return W.walkableXY(p[0], p[1]) ? p : e.port; };
    if (t.job === 'load' && e.st === 'prep' && e.prov < e.provT) {
      const f = F(e.fac);
      if (t.st === 0) { const d = G.Village.nearestDropoff(v.x, v.y, v.set); if (!d || !f || f.stock.food < 4) { t.job = 'wait'; t.st = 0; return; } const ft = G.Village.frontTile(d); const r = walkTo(v, t, 'st' + d.id, ft[0], ft[1], dt, H); if (r < 0) { t.job = 'wait'; return; } if (r > 0) { t.st = 1; v.actT = 0; } return; }
      if (t.st === 1) { v.act = 'lift'; if (v.actT < 1) return; v.act = ''; const n = Math.min(4, Math.floor(f.stock.food)); f.stock.food -= n; t.n = n; v.gear = 'caixa'; t.st = 2; return; }
      if (t.st === 2) { const p = spot(); const r = walkTo(v, t, 'q', p[0], p[1], dt, H); if (r < 0) { e.prov += t.n || 0; v.gear = null; t.st = 0; return; } if (r > 0) { v.gear = null; e.prov += t.n || 0; t.n = 0; e.crates = (e.crates || 0) + 1; t.st = 0; } return; }
      return;
    }
    if (t.st < 10) { const p = spot(); const r = walkTo(v, t, 'w', p[0], p[1], dt, H); if (r < 0) { t.st = 10; return; } if (r > 0) { t.st = 10; v.actT = 0; } return; }
    v.moving = false; const k = (t.k || 0) % 5;
    v.act = k === 0 ? 'look' : k === 1 ? 'sit' : k === 2 ? 'talk' : k === 3 ? 'haul' : 'wait';
    if (k === 0) G.faceTo(v, e.moor[0] - v.x, e.moor[1] - v.y);
  }
  // the ones who stay: down to the water, a wave until the sails are small
  function runAdeus(v, t, dt, H) {
    const e = X.get(t.exp); if (!e) return H.end(v);
    if (t.st === 0) { const k = t.k || 0; const a = k * 2.1 + 1, r = 1.6 + (k % 4) * 0.5; const p = W.nearestLand(e.port[0] + Math.cos(a) * r, e.port[1] + Math.sin(a) * r, 2) || e.port; t.p = p; const r2 = walkTo(v, t, 'q', p[0], p[1], dt, H); if (r2 < 0) return H.end(v); if (r2 > 0) { t.st = 1; v.actT = 0; } return; }
    v.moving = false; const of = P(t.of);
    if (e.st === 'partida' || e.st === 'viagem') { const s = ship(e.flag); if (s) G.faceTo(v, s.x - v.x, s.y - v.y); v.act = 'wave'; t.w = (t.w || 0) + dt; if (t.w > 12) { v.act = (v.age < 12 || G.R() < 0.3) ? 'weep' : ''; if (t.w > 16) H.end(v); } return; }
    if (e.st === 'fim') return H.end(v);
    // before they go: a last word, an embrace
    if (of && !of.aboard && G.dist(of.x, of.y, v.x, v.y) < 2.5) { v.act = t.ruler ? 'point' : 'embrace'; G.faceTo(v, of.x - v.x, of.y - v.y); }
    else v.act = t.ruler ? 'look' : 'wait';
    if (t.age > 200) H.end(v);
  }
  // exploring a new land: waypoints, looking, drawing, camping
  function runExpl(v, t, dt, H) {
    const e = X.get(t.exp); if (!e || !X.live(e)) { v.act = ''; return H.end(v); }
    const r = K.reg(e.dest);
    if (t.st === 'meet' && e.ct) {
      const k = t.k || 0; const a = Math.atan2(e.landAt[1] - e.ct.y, e.landAt[0] - e.ct.x) + (k - 2) * 0.4; const p = W.nearestLand(e.ct.x + Math.cos(a) * 1.5, e.ct.y + Math.sin(a) * 1.5, 2) || [e.ct.x, e.ct.y];
      if (!t.go) { t.go = 1; if (!H.goto(v, p[0], p[1], true, N * N)) { t.st = 'walk'; return; } }
      if (H.move(v, dt, 0.85)) { v.moving = false; v.act = t.pose || 'look'; const n = e.ct.nat && P(e.ct.nat[0]); if (n) G.faceTo(v, n.x - v.x, n.y - v.y); }
      return;
    }
    if (t.st === 'back' || e.st === 'reembarque' || e.st === 'volta') {
      if (!t.go) { t.go = 1; if (!H.goto(v, e.landAt[0], e.landAt[1], false, N * N) && !H.goto(v, e.landAt[0], e.landAt[1], true, N * N)) { t.st = 'stuck'; return; } }
      if (H.move(v, dt, 1.05) || G.dist(v.x, v.y, e.landAt[0], e.landAt[1]) < 1.6) { v.moving = false; v.act = 'wait'; }
      return;
    }
    if (!r) return;
    // the night: the camp on the beach, the fire, a watch
    if (G.isNight()) {
      if (t.st !== 'camp') { t.st = 'camp'; t.go = 0; }
      if (!t.go) { t.go = 1; const k = (v.id % 9); const p = W.nearestLand(e.landAt[0] + Math.cos(k) * 1.5, e.landAt[1] + Math.sin(k) * 1.5, 2) || e.landAt; t.cp = p; if (!H.goto(v, p[0], p[1], true, N * N)) { t.go = 2; } }
      if (t.go === 2 || H.move(v, dt)) { v.moving = false; v.act = v.id % 3 === 0 ? 'sit' : v.id === e.leader ? 'sittalk' : 'lie'; t.go = 2; }
      return;
    }
    if (t.st === 'camp') { t.st = 'walk'; t.wp = null; t.go = 0; }
    if (t.st === 'walk') {
      if (!t.wp) { t.wp = waypoint(e, r, v); t.go = 0; if (!t.wp) { t.st = 'look'; v.actT = 0; return; } }
      if (!t.go) { t.go = 1; if (!H.goto(v, t.wp[0], t.wp[1], false, 9000)) { t.wp = null; t.fail = (t.fail || 0) + 1; if (t.fail > 3) t.st = 'look'; return; } }
      if (H.move(v, dt, 0.95)) { t.st = 'look'; v.actT = 0; t.n++; e.exProg = (e.exProg || 0) + 1; }
      return;
    }
    if (t.st === 'look') {
      v.moving = false;
      v.act = v.id === e.roles.cart ? 'write' : v.id === e.roles.nat ? 'kneel' : v.id === e.leader ? 'point' : 'look';
      if (v.actT > G.rr(3, 6)) { v.act = ''; t.st = 'walk'; t.wp = null; }
    }
  }
  X.run = function (v, t, dt, H) {
    switch (t.type) {
      case 'cais': runCais(v, t, dt, H); return true;
      case 'adeus': runAdeus(v, t, dt, H); return true;
      case 'expl': runExpl(v, t, dt, H); return true;
      case 'contato': runContato(v, t, dt, H); return true;
      case 'naufrago': runNaufrago(v, t, dt, H); return true;
    }
    return false;
  };
  const oldRun = Nv.run; Nv.run = (v, t, dt, H) => X.run(v, t, dt, H) || oldRun(v, t, dt, H);
  X.taskText = function (v, t) {
    const e = t.exp && X.get(t.exp);
    switch (t.type) {
      case 'cais': return t.job === 'load' && e && e.st === 'prep' ? (v.gear === 'caixa' ? 'Levando uma caixa de provisões para o cais' : 'Buscando provisões no armazém') : `No cais, esperando para embarcar${e ? ' n' + (e.name.startsWith('A ') || e.name.startsWith('As ') ? 'a ' + e.name.replace(/^(A|As) /, '') : 'a expedição') : ''}`;
      case 'adeus': return e && (e.st === 'partida' || e.st === 'viagem') ? 'Acenando para os barcos que partem' : 'No cais, despedindo-se de quem vai para o mar';
      case 'expl': return t.st === 'camp' ? 'Acampado numa praia desconhecida' : t.st === 'back' ? 'Voltando para os barcos' : t.st === 'meet' ? 'Frente a frente com um povo desconhecido' : v.id === (e && e.roles.cart) && t.st === 'look' ? 'Desenhando o mapa da costa' : v.id === (e && e.roles.nat) && t.st === 'look' ? 'Estudando plantas e bichos nunca vistos' : 'Explorando uma terra nova';
      case 'contato': return 'Olhando os estrangeiros que vieram do mar';
      case 'naufrago': return t.st === 'raft' ? 'Construindo uma jangada para voltar para casa' : t.st === 'food' ? 'Procurando comida numa ilha deserta' : t.st === 'native' ? 'Náufrago, indo pedir ajuda a um povo desconhecido' : 'Náufrago, olhando o mar à espera de uma vela';
    }
    return null;
  };
  const oldText = Nv.taskText; Nv.taskText = (v, t) => X.taskText(v, t) || oldText(v, t);
  X.aboardText = function (v, s) {
    const e = s.exp && X.get(s.exp); if (!e) return null;
    const r = e.dest !== undefined ? K.reg(e.dest) : null;
    return ({ partida: `Partindo n${e.name.startsWith('A ') || e.name.startsWith('As ') ? 'a ' + e.name.replace(/^(A|As) /, '') : 'a expedição'}`, viagem: 'No mar, rumo ao desconhecido', aproximacao: `Aproximando-se de ${r && K.named(r) ? K.name(r) : 'uma costa desconhecida'}`, desembarque: 'Esperando a vez de descer à praia', exploracao: 'Guardando o navio enquanto os outros exploram', contato: 'Guardando o navio enquanto os outros exploram', reembarque: 'Esperando os companheiros voltarem da praia', volta: 'Voltando para casa com notícias', chegada: 'Chegando em casa', embarque: 'A bordo, esperando a partida', fundacao: 'Chegando à terra da nova colônia' })[e.st] || null;
  };

  // ====================================================================================
  //  CASTAWAYS
  // ====================================================================================
  // the sea threw them on a beach: home is near, or a foreign town, or nobody at all
  function castaways() {
    const S = G.S; const L = S.castaways || (S.castaways = []);
    for (const v of S.villagers.values()) {
      if (!v.wrecked || v.aboard || (v.task && (v.task.type === 'swim' || v.task.type === 'naufrago' || v.task.type === 'scene'))) continue;
      const i = W.idx(v.x, v.y); if (S.type[i] <= T.SEA) continue;
      const r = K.at(v.x, v.y); const fid = v.wrecked.fac;
      if (G.S.day - v.wrecked.d > 40) { v.wrecked = null; continue; }
      // home ground: walk home, and tell it there
      const homes = r ? G.Fac.settlementsOf(fid).filter(s => K.at(s.cx, s.cy) === r) : [];
      if (homes.length) { const h = homes.sort((a, b) => G.dist(a.cx, a.cy, v.x, v.y) - G.dist(b.cx, b.cy, v.x, v.y))[0]; if (G.dist(h.cx, h.cy, v.x, v.y) < (h.radius || 8) + 4) survivorHome(v, r); else G.Vg.setTask(v, { type: 'naufrago', st: 'home', set: h.id, pri: 3.4 }); continue; }
      const town = r && [...S.settlements.values()].find(s => K.at(s.cx, s.cy) === r && s.fac !== fid);
      if (town) { G.Vg.setTask(v, { type: 'naufrago', st: 'native', set: town.id, pri: 3.4 }); G.Stories && G.Stories.signal('castaway', { v: v.id, camp: 0, exp: v.wrecked.exp || 0, fac: fid, ship: v.wrecked.name || '', x: v.x, y: v.y }); continue; }
      // a beach where nobody lives: a camp of the shipwrecked
      let c = L.find(q => q.key === (r ? r.key : -1) && q.fac === fid && !q.done);
      if (!c) { c = { id: S.nextId++, key: r ? r.key : -1, fac: fid, ids: [], x: +v.x.toFixed(1), y: +v.y.toFixed(1), d: S.day, raft: 0, ship: v.wrecked.ship, title: v.wrecked.name, exp: v.wrecked.exp || 0 }; L.push(c); if (L.length > 40) L.shift(); log(`${v.name} se arrastou para fora d'água numa praia ${r && K.named(r) ? K.de(K.name(r)) : 'que ninguém conhece'}: náufrag${oa(v)} ${ofN(v.wrecked.name)}.`, 'skull', v.x, v.y); G.Stories && G.Stories.signal('castaway', { v: v.id, camp: c.id, fac: fid, exp: c.exp, x: v.x, y: v.y }); G.Life && G.Life.bio(v, 'castaway', r && K.named(r) ? K.na(K.name(r)) : 'numa ilha deserta', ''); }
      if (!c.ids.includes(v.id)) { c.ids.push(v.id); G.Stories && G.Stories.signal('castaway', { v: v.id, camp: c.id, exp: c.exp || 0, fac: fid, ship: v.wrecked.name || '', x: v.x, y: v.y }); }
      G.Vg.setTask(v, { type: 'naufrago', st: 'camp', camp: c.id, pri: 3.4 });
    }
    // the camps: alive? a raft? a hamlet?
    for (const c of L) {
      if (c.done) continue; c.ids = c.ids.filter(id => { const v = P(id); return v && !v.aboard && v.wrecked; });
      if (!c.ids.length) { c.done = S.day; continue; }
      const r = K.reg(c.key); const trees = r ? r.trees : 0;
      // stuck for good, with no way home: they make a home of it
      if (S.day - c.d > 2.2 && c.raft < 1 && (!trees || !homeWater(c))) {
        const adults = c.ids.map(P).filter(v => v && v.age >= 16);
        if (adults.length >= 2 && adults.some(v => v.g === 'f') && adults.some(v => v.g === 'm')) {
          const ns = G.Village.addSettlement(G.Village.newSettlementName(c.fac), c.x, c.y, c.fac);
          for (const v of c.ids.map(P).filter(Boolean)) { G.Vg.endTask(v); v.set = ns.id; v.home = 0; v.wrecked = null; }
          c.done = S.day; log(`Os náufragos ${ofN(c.title || 'o barco')} desistiram de esperar: fizeram casas de galhos e chamaram aquilo de ${ns.name}. Uma aldeia nascida de um naufrágio.`, 'settle', c.x, c.y);
        }
      }
    }
  }
  function homeWater(c) {
    const f = F(c.fac); if (!f) return null; const comp = Nv.compAt(...(Nv._nearestWater(c.x, c.y, 6) || [c.x, c.y]));
    let best = null, bd = 1e9; for (const s of G.Fac.settlementsOf(f.id)) { const l = Nv.landing(s, comp); if (!l) continue; const d = G.dist(c.x, c.y, s.cx, s.cy); if (d < bd) { bd = d; best = { set: s, l }; } }
    return best;
  }
  function runNaufrago(v, t, dt, H) {
    const S = G.S;
    if (t.st === 'home') {
      const set = S.settlements.get(t.set); if (!set) return H.end(v);
      if (!t.go) { t.go = 1; if (!H.goto(v, set.cx, set.cy, true, N * N)) return H.end(v); }
      if (H.move(v, dt, 0.9) || G.dist(v.x, v.y, set.cx, set.cy) < (set.radius || 6)) { H.end(v); if (v.wrecked) survivorHome(v, K.at(v.x, v.y)); }
      return;
    }
    if (t.st === 'native') {
      const set = S.settlements.get(t.set); if (!set) return H.end(v);
      if (!t.go) { t.go = 1; if (!H.goto(v, set.cx, set.cy, true, N * N)) { t.st = 'camp'; return; } }
      if (H.move(v, dt, 0.8) || G.dist(v.x, v.y, set.cx, set.cy) < (set.radius || 6)) { H.end(v); strangerAt(v, set); }
      return;
    }
    const c = (S.castaways || []).find(q => q.id === t.camp); if (!c || c.done) { return H.end(v); }
    v.energy = Math.max(v.energy, 30);
    // hunger first: berries in the scrub, a line from the rocks
    if (v.hunger > 70 && t.st !== 'food') { t.st = 'food'; t.go = 0; v.actT = 0; }
    if (t.st === 'food') {
      if (!t.go) { t.go = 1; let best = null, bd = 144; for (const b of S.bushes.values()) { if ((b.berries || 0) < 1 || K.at(b.x, b.y) !== K.reg(c.key)) continue; const d = G.dist2(b.x, b.y, v.x, v.y); if (d < bd) { bd = d; best = b; } } t.bush = best ? best.id : 0; const p = best ? [best.x, best.y] : W.nearestLand(c.x, c.y, 2) || [c.x, c.y]; if (!H.goto(v, p[0], p[1], true, 6000)) t.go = 2; v.actT = 0; }
      if (t.go === 2 || H.move(v, dt, 0.9)) {
        t.go = 2; v.moving = false; const b = t.bush && S.bushes.get(t.bush);
        v.act = b ? 'pick' : 'fish';
        if (v.actT > (b ? 4 : 9)) { if (b && b.berries > 0) b.berries--; v.hunger = Math.max(0, v.hunger - (b ? 45 : 30)); t.st = 'camp'; t.go = 0; v.act = ''; }
      }
      return;
    }
    // a raft, if there is wood and a way home over the water
    if (t.st === 'camp' && !G.isNight() && c.raft < 1 && (K.reg(c.key) || {}).trees > 4 && G.R() < dt * 0.4 && homeWater(c)) { t.st = 'raft'; t.go = 0; }
    if (t.st === 'raft') {
      if (!t.go) { t.go = 1; let best = null, bd = 400; for (const tr of S.trees.values()) { if (K.at(tr.x, tr.y) !== K.reg(c.key)) continue; const d = G.dist2(tr.x, tr.y, c.x, c.y); if (d < bd) { bd = d; best = tr; } } t.tree = best ? best.id : 0; if (!best || !H.goto(v, best.x, best.y, true, 6000)) { t.st = 'camp'; t.go = 0; return; } }
      if (H.move(v, dt) || t.go === 2) { t.go = 2; v.moving = false; v.act = 'chop'; c.raft += dt / (DAY() * 0.35) / Math.max(1, Math.sqrt(c.ids.length)); if (c.raft >= 1) launchRaft(c); if (v.actT > 25) { t.st = 'camp'; t.go = 0; v.act = ''; } }
      return;
    }
    // the camp: a fire at night, eyes on the horizon by day
    if (!t.go) { t.go = 1; const k = v.id % 5; const p = W.nearestLand(c.x + Math.cos(k) * 0.9, c.y + Math.sin(k) * 0.9, 2) || [c.x, c.y]; if (!H.goto(v, p[0], p[1], true, 4000)) t.go = 2; }
    if (t.go === 2 || H.move(v, dt)) { t.go = 2; v.moving = false; v.act = G.isNight() ? (v.id % 2 ? 'lie' : 'sit') : (v.id % 3 === 0 ? 'look' : 'sit'); }
  }
  function launchRaft(c) {
    const S = G.S; const hw = homeWater(c); if (!hw) return;
    const w = Nv._nearestWater(c.x, c.y, 5); if (!w) return;
    const f = F(c.fac); if (!f) return;
    const s = { id: S.nextId++, kind: 'jangada', fac: f.id, civ: f.civ || null, dock: 0, x: w[0], y: w[1], path: null, pi: 0, st: 'out', t: 0, hp: Nv.SHIP.jangada.hp, maxHp: Nv.SHIP.jangada.hp, face: 1, crew: [], cd: 0, born: S.day, sail: 60, mast: 1, flood: 0, raft: c.id, to: hw.l.water, land: hw.l.land, toSet: hw.set.id, name: '' };
    S.ships.push(s);
    for (const id of c.ids) { const v = P(id); if (!v) continue; G.Vg.endTask(v); v.aboard = s.id; v.task = { type: 'aboard', ship: s.id, pri: 9, st: 0, age: 0 }; s.crew.push(v.id); }
    if (!Nv._sailTo(s, s.to[0], s.to[1])) { Nv._remove(s); return; }
    c.done = S.day; c.rafted = s.id;
    log(`${c.ids.map(PD).filter(Boolean).map(v => v.name).join(' e ')} amarraram troncos com cipó e se lançaram ao mar numa jangada, rumo a ${hw.set.name}.`, 'ship', s.x, s.y);
  }
  function runRaft(s, dt) {
    if (s.st === 'out') { if (Nv._move(s, dt)) { s.st = 'land'; } return; }
    if (s.st === 'land') {
      for (const v of Nv.aboardOf(s)) { v.aboard = 0; v.task = null; const p = W.randomNear(s.land[0], s.land[1], 1.2) || s.land; v.x = p[0]; v.y = p[1]; }
      Nv._remove(s);
    }
  }
  Nv.RUN.jangada = runRaft;
  // a stranger washes up in a foreign town: taken in, or taken
  function strangerAt(v, set) {
    const S = G.S; const B = F(set.fac); const A = F(v.wrecked ? v.wrecked.fac : G.Fac.idOfV(v)); if (!B || !A) return;
    const pb = G.Politics.leaderPe(B); const kind = pb.cru > 0.55 || G.Fac.atWar(A.id, B.id) ? 'cativo' : 'hospede';
    K.of(B.id).f[A.id] = K.of(B.id).f[A.id] || { d: S.day, via: 'náufrago' };
    K.rumor({ kind: 'povo', fac: A.id, x: set.cx, y: set.cy, conf: 0.95, claim: `${v.name}, um náufrago, fala de uma terra chamada ${G.Fac.capitalOf(A.id) ? G.Fac.capitalOf(A.id).name : A.name}`, origin: { what: 'naufrago', who: v.id, set: set.id, fac: B.id }, first: B.id, quiet: true });
    if (kind === 'cativo') { G.War.enslave(v, A.id, v.set); v.set = set.id; log(`${v.name}, náufrag${oa(v)} de ${A.name}, chegou cambaleando a ${set.name}. Os de lá ${G.Fac.atWar(A.id, B.id) ? 'reconheceram as cores do inimigo' : 'nunca tinham visto ninguém como el' + (v.g === 'f' ? 'a' : 'e')}: puseram cordas nos pulsos del${v.g === 'f' ? 'a' : 'e'}.`, 'chain', set.cx, set.cy); }
    else { v.set = set.id; v.home = 0; v.guestOf = { fac: B.id, from: A.id, d: S.day, wreck: 1 }; log(`${v.name}, náufrag${oa(v)} de ${A.name}, chegou a ${set.name} mais mort${oa(v)} que viv${oa(v)}. Deram água, comida e um canto perto do fogo. Ninguém entende o que el${v.g === 'f' ? 'a' : 'e'} fala — ainda.`, 'heart', set.cx, set.cy); }
    if (!G.Fac.rel(A.id, B.id) || !G.Fac.rel(A.id, B.id).met) G.Stories && G.Stories.signal('firstContact', { a: A.id, b: B.id, set: set.id, out: kind === 'cativo' ? 'captura' : 'naufrago', who: v.id, ids: [v.id], nat: [], x: set.cx, y: set.cy });
    v.wrecked = null;
  }
  // home after the sea: the survivor tells it
  function survivorHome(v, r) {
    const S = G.S; const w = v.wrecked; v.wrecked = null; const f = F(G.Fac.idOfV(v)); if (!f) return;
    const out = K.bring(v, f.id, { quietMeet: true });
    const e = w.exp && X.get(w.exp);
    const days = S.day - w.d;
    const news = out.regions.length ? ` Contou de ${out.regions.map(q => K.named(q.r) ? K.name(q.r) : 'uma terra nova').join(' e ')}.` : '';
    // (home always hears of it: the stories decide whether it was a miracle or only a wet walk up the beach)
    G.Stories && G.Stories.signal('survivorHome', { v: v.id, exp: w.exp || 0, fac: f.id, days, presumed: e && e.presumed ? 1 : 0, x: v.x, y: v.y });
    if (days > 0.5 || (e && e.presumed)) {
      const others = e ? e.crew.concat(e.lost).filter(id => id !== v.id && P(id) && (P(id).wrecked || (e.survivors || []).includes(id))).length : 0;
      if (e) (e.survivors = e.survivors || []).push(v.id);
      log(`${v.name} voltou${e ? (others || (e.survivors || []).length > 1 ? ` — ${v.g === 'f' ? 'uma' : 'um'} dos que se salvaram ${ofN(e.name)}` : ` — ${v.g === 'f' ? 'a única' : 'o único'} ${ofN(e.name)} que se salvou`) : ` do naufrágio ${ofN(w.name)}`}${days > 1 ? `, depois de ${Math.round(days)} anos dado como mort${oa(v)}` : ''}.${news}`, 'heart', v.x, v.y);
    }
    G.Life && G.Life.bio(v, 'wrecked', w.name);
    if (e && e.status !== 'voltou' && !alive(e).some(o => o.aboard)) { e.survivor = v.id; if (!e.presumed) e.presumed = S.day; }
    void r;
  }
  // a ship goes down (called by Nv.sink)
  X.onSink = function (s, why, by, lost, swimmers) {
    const e = s.exp && X.get(s.exp); if (!e) return;
    for (const v of swimmers) { K.share(e, v); v.wrecked.exp = e.id; v.wrecked.name = Nv.title(s); }
    e.wrecked = 1;
    chapter(e, 'O naufrágio', `${cap1(Nv.title(s))} afundou${why === 'storm' ? ' na tempestade' : why === 'reef' ? ' num recife' : why === 'flood' ? ', com o casco aberto' : by ? ', atacad' + (Nv.fem(s) ? 'a' : 'o') + ' por ' + (F(by.fac) || {}).name : ''}. ${lost ? `${lost} se ${lost > 1 ? 'afogaram' : 'afogou'}` : ''}${swimmers.length ? `${lost ? '; ' : ''}${swimmers.length} ${swimmers.length > 1 ? 'nadam' : 'nada'} para a vida` : ''}.`, 'skull', e.scale !== 'so');
  };
  // a fishing boat's news landing: a sighting can stir a people (called by Nv.arrived)
  X.newsHome = function (s, out) { if (!out) return; for (const q of out.regions || []) if (q.s >= K.SIG) { const f = F(s.fac); if (f && G.R() < 0.4) X.prof(f).last = Math.min(X.prof(f).last, G.S.day - 1); } };

  // ====================================================================================
  //  COLONIES: only where a people knows the land, and has a reason to go
  // ====================================================================================
  function siteFor(r, fid) {
    const S = G.S; if (!r || r.kind === 'rochedo' || r.n < 40) return null;
    let best = null, bs = -1e9;
    for (let k = 0; k < 120; k++) {
      const x = G.ri(r.x0, r.x1), y = G.ri(r.y0, r.y1); if (!W.inb(x, y)) continue; const i = y * N + x;
      if (K.compAt(i) !== r.idx || (S.type[i] !== T.GRASS && S.type[i] !== T.MEADOW) || S.occ[i] || S.objAt[i]) continue;
      let md = 1e9; for (const o of S.settlements.values()) md = Math.min(md, G.dist(x, y, o.cx, o.cy)); if (md < 14) continue;
      let water = 0, trees = 0; for (let dy = -6; dy <= 6; dy += 2) for (let dx = -6; dx <= 6; dx += 2) { const xx = x + dx, yy = y + dy; if (!W.inb(xx, yy)) continue; const j = yy * N + xx; if (S.type[j] <= T.RIVER) water++; if (S.treeAt[j]) trees++; }
      const ore = (r.ores || []).map(id => (S.ores || []).find(o => o.id === id)).filter(o => o && K.knowsOre(fid, o.id)).reduce((m, o) => Math.max(m, 12 - G.dist(o.x, o.y, x, y) * 0.3), 0);
      const foes = [...S.settlements.values()].filter(o => o.fac !== fid && K.at(o.cx, o.cy) === r).length;
      const sc = S.fert[i] * 5 + Math.min(water, 8) * 0.5 + Math.min(trees, 12) * 0.25 + ore * 0.4 - foes * 3 - (md < 20 ? 2 : 0) + G.R();
      if (sc > bs) { bs = sc; best = { x: x + 0.5, y: y + 0.5, sc: +sc.toFixed(1), water, trees, ore: ore > 0, key: r.key }; }
    }
    return best;
  }
  X.siteFor = siteFor;
  X.colonyPlan = function (f, force) {
    const S = G.S; if (!f.alive || !G.Civ.has(f.id, 'navegacao')) return null;
    const docks = home(f); if (!docks.length) return null;
    if (X.active(f.id).some(e => e.kind === 'colonia')) return null;
    const ef = eff(f); const p = ef.p; const pop = G.Fac.pop(f.id); if (pop < 30 && !force) return null;
    if (!force && S.day - (p.lastCol || -99) < G.rr(6, 14) / (0.5 + ef.exp)) return null;
    const pr = X.pressure(f); const own = ownRegions(f.id); const comp = compOf(docks[0]);
    // the reasons for a colony: no room, ore over the water, a port against an enemy, fertile land
    let best = null, bs = 0;
    for (const r of K.regions()) {
      if (!K.big(r) || own.has(r) || K.state(f.id, r) < K.EXP || !reachRegion(r, comp)) continue;
      const site = siteFor(r, f.id); if (!site) continue;
      const ironHere = r.ores.some(id => { const o = (S.ores || []).find(q => q.id === id); return o && o.kind === 'ferro' && K.knowsOre(f.id, o.id); });
      const goldHere = r.ores.some(id => { const o = (S.ores || []).find(q => q.id === id); return o && o.kind === 'ouro' && K.knowsOre(f.id, o.id); });
      const enemyNear = G.Fac.enemiesOf(f.id).some(en => G.Fac.settlementsOf(en.id).some(s => K.distTo(r, s.cx, s.cy) < 30));
      const motive = ironHere && pr.ferro > 0.3 ? 'ferro' : goldHere && pr.ouro > 0.15 ? 'ouro' : pr.terra > 0.25 ? 'terra' : enemyNear ? 'porto' : site.sc > 6 && ef.exp > 0.55 ? 'expansao' : null;
      if (!motive) continue;
      const w = ({ ferro: 1 + pr.ferro, ouro: 0.8 + pr.ouro, terra: 0.7 + pr.terra * 1.5, porto: 0.6, expansao: 0.4 + ef.exp * 0.5 }[motive]) * (site.sc / 8) * (0.5 + ef.exp);
      if (w > bs) { bs = w; best = { r, site, motive }; }
    }
    if (!best) return null;
    if (!force && G.R() > clamp(bs * 0.5, 0, 0.6)) return null;
    // the cost: food, timber, tools, a ship, and people (who will be missed)
    const n = clamp(Math.round(pop * 0.12 + 6), 8, 26);
    if (f.stock.food < pop * 1.5 + n * 6 || f.stock.wood < 40) return null;
    return X.colony(f, best, n, docks);
  };
  X.colony = function (f, best, n, docks) {
    const S = G.S; const dock = docks[0]; const di = Nv.dockInfo(dock); const from = S.settlements.get(dock.set); if (!from) return null;
    const members = [...S.villagers.values()].filter(v => v.set === from.id && free(v, f, { minAge: 2, maxAge: 50 }) || (v.set === from.id && v.age < 16 && v.age >= 2 && !v.captive && !v.aboard));
    const crew = [];
    // families first: couples with their small children
    for (const m of members.filter(v => v.g === 'f' && v.partner && v.age >= 17).sort(() => G.R() - 0.5)) {
      if (crew.length >= n) break; const p = P(m.partner); if (!p || !members.includes(p) || crew.includes(p)) continue;
      crew.push(m, p); for (const k of members) if ((k.mother === m.id || k.father === p.id) && k.age < 16 && crew.length < n + 4) crew.push(k);
    }
    for (const v of members.filter(v => !v.partner && v.age >= 17 && v.age < 40)) { if (crew.length >= n) break; if (!crew.includes(v)) crew.push(v); }
    if (crew.filter(v => v.age >= 16).length < 5) return null;
    const lead = crew.filter(v => v.age >= 22).sort((a, b) => G.Politics.persona(b).amb + b.courage - G.Politics.persona(a).amb - a.courage)[0];
    const cap = G.Fac.capitalOf(f.id); const colName = G.R() < 0.55 && cap ? 'Nova ' + cap.name : null;
    const e = { id: S.nextId++, fac: f.id, civ: f.civ, kind: 'colonia', scale: 'grande', st: 'prep', t: 0, day0: S.day, from: from.id, fromName: from.name, dock: dock.id, port: (di.quay || di.moor).slice(), moor: di.moor.slice(),
      obj: { k: 'colonia', why: best.motive, key: best.r.key, x: best.site.x, y: best.site.y, rumor: 0 }, crew: crew.map(v => v.id), roles: { sold: [], work: [], col: crew.map(v => v.id) }, ships: [], flag: 0, prov: 0, provT: 0, morale: 75, disc: [], log: [], lost: [], deadN: 0, track: [], ev: {}, legs: 0, news: [], status: 'ativa',
      leader: lead.id, leaderName: lead.name, sponsor: f.leader || 0, sponsorName: (G.Politics.ruler(f) || {}).name || f.name, sponsorKind: 'governante', site: best.site, colName, motive: best.motive, dest: best.r.key };
    const nT = Math.ceil(crew.length / X.CAP.transporte);
    for (let k = 0; k < nT; k++) { let s = S.ships.find(q => q.fac === f.id && q.kind === 'transporte' && q.st === 'idle' && !q.exp && !q.fleet); if (!s) s = Nv.spawn('transporte', f, dock, { build: 1 }); if (!s) break; s.exp = e.id; e.ships.push(s.id); }
    if (!e.ships.length) return null;
    e.flag = e.ships[0];
    const r = best.r; const days = (G.dist(di.moor[0], di.moor[1], r.cx, r.cy) * 1.3 / 1.5 + 40) / DAY();
    e.dur = days; e.provT = Math.ceil(crew.length * FOOD * days * 1.5) + crew.length * 4; e.range = G.dist(di.moor[0], di.moor[1], r.cx, r.cy) + 20;
    e.dirw = K.dir(r.cx - di.moor[0], r.cy - di.moor[1]); e.a = K.dirA(r.cx - di.moor[0], r.cy - di.moor[1]);
    f.stock.wood -= 20; // tools, nails, the first frames of the houses
    e.name = nameOf(e, f, lead, e.dirw);
    S.exps = exps(); S.exps.push(e);
    X.prof(f).lastCol = S.day;
    const WHYC = { ferro: `por causa do ferro ${K.na(K.name(r))}`, ouro: `atrás do ouro ${K.na(K.name(r))}`, terra: `porque em ${from.name} já não cabe tanta gente`, porto: 'para ter um porto perto do inimigo', expansao: `porque ${K.name(r)} é boa terra e ninguém mora lá` };
    chapter(e, 'Os colonos', `${crew.length} pessoas de ${from.name} vão fundar ${colName || 'uma colônia'} ${K.na(K.name(r))}, ${WHYC[best.motive] || ''}. Levam sementes, ferramentas e o que cabe nos braços.`, 'settle', true);
    let k = 0; for (const v of crew) { G.Vg.endTask(v); G.Vg.setTask(v, { type: 'cais', exp: e.id, k, job: k > 0 && k <= 3 ? 'load' : 'wait', pri: 3.25, st: 0 }); k++; }
    G.Stories && G.Stories.signal('expPlanned', { exp: e.id, fac: f.id, leader: e.leader, colony: 1, ids: e.crew.slice(), x: di.moor[0], y: di.moor[1] });
    // the colony sails straight to the known shore
    e.obj.a = e.a;
    return e;
  };
  function settleTick(e, f, crew, ships) {
    const S = G.S; if (e.founded) return;
    const r = K.reg(e.dest); const site = e.site && siteFor(r, f.id) && G.dist(e.site.x, e.site.y, e.landAt[0], e.landAt[1]) < 40 ? e.site : siteFor(r, f.id) || { x: e.landAt[0], y: e.landAt[1] };
    const name = e.colName && ![...S.settlements.values()].some(s => s.name === e.colName) ? e.colName : G.Village.newSettlementName(f.id);
    const ns = G.Village.addSettlement(name, site.x, site.y, f.id);
    ns.colony = { metro: e.from, fac: f.id, d: S.day, exp: e.id, motive: e.motive, autonomy: 0, idt: 0 };
    (S.colonies = S.colonies || []).push({ set: ns.id, name, fac: f.id, metro: e.from, d: S.day, exp: e.id, motive: e.motive, st: 'fragil' });
    for (const v of ashoreE(e)) { G.Vg.endTask(v); v.set = ns.id; v.home = 0; G.Vg.setTask(v, { type: 'migrate', pri: 1.6, kind: 'migrate' }); G.Life && G.Life.bio(v, 'colonist', name); }
    e.founded = ns.id; e.colony = ns.id;
    chapter(e, 'A fundação', `Os colonos de ${e.fromName} fincaram as primeiras estacas ${K.na(K.name(r))}: nasceu ${name}${e.motive === 'ferro' ? ', com o ferro a poucos passos' : ''}. É pouca gente, muito longe de casa.`, 'settle', true, { x: site.x, y: site.y });
    G.Village.milestone('colony', 'Colônia além-mar', `${name} nasceu do outro lado da água.`, 'ship');
    G.Lore && G.Lore.note('colony', { fac: f.id, name });
    G.Stories && G.Stories.signal('colonyFounded', { exp: e.id, set: ns.id, fac: f.id, leader: e.leader, ids: e.crew.slice(), x: site.x, y: site.y });
    X.mark(f, 'colonia');
    K.raise(f.id, r, K.SET, { via: 'colônia' });
    // the ships go home with the ones who came only to sail
    e.status = 'colonia'; e.end = S.day;
    goHome(e, ships);
    for (const s of ships) { s.exp = 0; s.st = 'casa'; }
    e.st = 'fim';
  }
  // the colonies' lives: fragile at first, then they thrive, fail, or go their own way
  function colonies() {
    const S = G.S;
    for (const c of S.colonies || []) {
      if (c.st === 'fracassou' || c.st === 'independente') continue;
      const set = S.settlements.get(c.set); const pop = set ? G.Village.pop(set.id) : 0;
      if (!set || pop === 0) { c.st = 'fracassou'; c.end = S.day; log(`${c.name} não existe mais. A colônia que ${F(c.fac) ? F(c.fac).name : 'um povo'} fundou além-mar ${S.day - c.d < 6 ? 'não passou do primeiro inverno' : 'morreu aos poucos'}.`, 'skull', set ? set.cx : undefined, set ? set.cy : undefined); G.Stories && G.Stories.signal('colonyFailed', { set: c.set, fac: c.fac }); const f = F(c.fac); if (f) X.prof(f).exp = clamp(X.prof(f).exp - 0.05, 0, 1); continue; }
      if (set.fac !== c.fac) { const nf = F(set.fac); if (nf && !nf.conqueredFrom && set.origFac !== set.fac) { c.st = 'independente'; c.end = S.day; log(`${c.name}, a colônia, não obedece mais a ${F(c.fac) ? F(c.fac).name : 'ninguém'}: agora é ${nf.name}.`, 'crown', set.cx, set.cy); } else { c.st = 'perdida'; } continue; }
      if (c.st === 'fragil' && pop >= 20) { c.st = 'firme'; log(`${c.name} vingou: a colônia já tem ${pop} pessoas, roças, e crianças que nunca viram ${S.settlements.get(c.metro) ? S.settlements.get(c.metro).name : 'a metrópole'}.`, 'settle', set.cx, set.cy); }
      // distance and time loosen the bond (the politics of secession read it)
      const met = S.settlements.get(c.metro); const d = met ? G.dist(met.cx, met.cy, set.cx, set.cy) : 80;
      set.colony = set.colony || { metro: c.metro, fac: c.fac, d: c.d };
      set.colony.autonomy = clamp((S.day - c.d) * 0.012 + d / 400 + (pop > 40 ? 0.15 : 0), 0, 1);
    }
  }
  // the old seaborne colonizing of the villages goes through here: knowledge first
  Nv.colonize = function (set, fac) {
    const S = G.S; if (!G.Civ.has(fac.id, 'navegacao')) return false;
    const e = X.colonyPlan(fac, true); if (e) return true;
    // nowhere known to go: the crowded town dreams of the horizon instead
    const p = X.prof(fac); p.last = Math.min(p.last, S.day - 2); return false;
  };

  // ====================================================================================
  //  PROVISIONS (the expedition's crates, not the granary at home)
  // ====================================================================================
  if (G.Wars) {
    const oldProv = G.Wars.provision;
    G.Wars.provision = function (v) {
      const e = X.memberOf(v.id);
      if (e && (v.aboard || (v.task && (v.task.type === 'expl' || v.task.type === 'contato')))) { if (e.prov >= 1) { e.prov -= 1; return true; } e.hungry = G.S.clock; return false; }
      if (v.wrecked || (v.task && v.task.type === 'naufrago')) return false;
      return oldProv(v);
    };
  }

  // ====================================================================================
  //  UPDATE
  // ====================================================================================
  let tTick = 0, tPlan = 0, tSlow = 0, planI = 0;
  X.reset = function () { tTick = 0; tPlan = 3; tSlow = 5; members = new Map(); memT = -1; };
  X.update = function (dt) {
    const S = G.S; tTick -= dt; tPlan -= dt; tSlow -= dt;
    if (tTick <= 0) { tTick = 0.5; memT = -1; for (const e of exps()) if (X.live(e)) { try { tick(e, 0.5); } catch (err) { console.error('expedition', e.id, err); e.st = 'fim'; e.status = 'cancelada'; } } }
    if (tPlan <= 0) {
      // one people at a time, a few times a day
      tPlan = DAY() * 0.06; const fs = G.Fac.all(); if (fs.length) { const f = fs[planI++ % fs.length]; X.consider(f); X.colonyPlan(f); }
    }
    if (tSlow <= 0) { tSlow = 3; castaways(); overdue(); colonies(); savedBySea(); }
    if ((tLife -= dt) <= 0) { tLife = DAY() * 0.5; for (const f of G.Fac.all()) seaLife(f); }
  };
  let tLife = 0;
  // a people that fishes, builds boats and sees sails come and go grows fond of the sea (slowly);
  // one that turns its back on it forgets (slowly too) — over a few generations, not a season
  function seaLife(f) {
    if (!f.alive) return; const p = X.prof(f); const S = G.S;
    const docks = Nv.docksOf(f.id).length; const boats = S.ships.filter(s => s.fac === f.id && !s.ghost).length;
    const sets = G.Fac.settlementsOf(f.id); const coast = sets.filter(s => G.City && G.City.coastal(s)).length;
    const base = baseAff(f);
    const target = clamp(base + Math.min(0.12, docks * 0.04) + Math.min(0.1, boats * 0.015) + (sets.length ? coast / sets.length * 0.06 : 0) + Math.min(0.08, (p.trad || 0) * 0.02) - Math.min(0.2, (p.lostDirs || []).filter(q => S.day - q.d < 25).length * 0.05), 0.03, 0.98);
    p.aff = clamp(p.aff + (target - p.aff) * 0.05, 0.02, 0.98);
  }
  // a famine the fishing boats saw a people through: they will look at the sea differently
  function savedBySea() {
    const S = G.S;
    for (const f of G.Fac.all()) {
      const p = X.prof(f); const pop = G.Fac.pop(f.id); const fishNow = Object.values(f.catch || {}).reduce((a, b) => a + b, 0);
      if (f.stock.food < pop * 0.9 && !p.hT) { p.hT = S.day; p.fish0 = fishNow; }
      else if (p.hT && f.stock.food > pop * 2.5) {
        if (fishNow - (p.fish0 || 0) > pop * 1.2 && S.day - p.hT > 0.5 && !p.savedLog) { p.savedLog = S.day; X.mark(f, 'salvo'); const cap = G.Fac.capitalOf(f.id); log(`Na fome, foi o mar que alimentou ${f.name}: os barcos voltavam cheios quando os celeiros estavam vazios. Desde então, o povo olha para a água com outros olhos.`, 'fish', cap ? cap.cx : undefined, cap ? cap.cy : undefined); }
        p.hT = 0;
      }
    }
  }

  // ====================================================================================
  //  DRAWN: the quay before a voyage, the camp on a strange beach
  // ====================================================================================
  G.renderHooks = G.renderHooks || { ground: [], ents: [] };
  const E1 = new Map();
  G.renderHooks.ents.push(function (add, view, zoom) {
    if (zoom < 0.45) return;
    for (const e of exps()) {
      if (!X.live(e)) continue;
      if ((e.st === 'prep' || e.st === 'reunir' || e.st === 'embarque') && e.port) {
        let q = E1.get('q' + e.id); if (!q) E1.set('q' + e.id, q = { e, fn: drawQuay }); add(e.port[0] + e.port[1] + 0.1, q, e.port[0] + 0.6, e.port[1] - 0.6);
      }
      if ((e.st === 'exploracao' || e.st === 'contato' || e.st === 'reembarque') && e.landAt && (G.isNight() || e.t > 20)) {
        let c = E1.get('c' + e.id); if (!c) E1.set('c' + e.id, c = { e, fn: drawCamp }); add(e.landAt[0] + e.landAt[1] + 0.2, c, e.landAt[0] + 0.4, e.landAt[1] - 0.3);
      }
    }
    for (const c of G.S.castaways || []) { if (c.done) continue; let k = E1.get('n' + c.id); if (!k) E1.set('n' + c.id, k = { c, fn: drawCastaway }); add(c.x + c.y + 0.1, k, c.x, c.y); }
    if (E1.size > 400) E1.clear();
  });
  function drawQuay(c, o, sx, sy, t) {
    const e = o.e; const n = Math.min(12, Math.round(e.prov / 4));
    for (let k = 0; k < n; k++) { const col = k % 4, row = Math.floor(k / 4); const x = sx - 5 + col * 2.8 + row * 1.2, y = sy - row * 2.4; c.fillStyle = k % 3 ? '#8a6a44' : '#7a5a34'; c.fillRect(x - 1.3, y - 2.2, 2.6, 2.2); c.fillStyle = '#5a3a20'; c.fillRect(x - 1.3, y - 1.2, 2.6, 0.35); }
    // barrels of water
    for (let k = 0; k < Math.min(3, Math.ceil(n / 4)); k++) { const x = sx + 7 + k * 2.4, y = sy + 1; c.fillStyle = '#6a4a2c'; c.beginPath(); c.ellipse(x, y - 1.6, 1.2, 1.7, 0, 0, TAU); c.fill(); c.strokeStyle = '#3a2a1a'; c.lineWidth = 0.3; c.beginPath(); c.moveTo(x - 1.2, y - 2.2); c.lineTo(x + 1.2, y - 2.2); c.moveTo(x - 1.2, y - 1); c.lineTo(x + 1.2, y - 1); c.stroke(); }
    // a royal voyage: the banner on the quay
    if (e.banner) { const fc = G.Fac.hex(e.fac); c.strokeStyle = '#5a3a20'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(sx - 8, sy + 1); c.lineTo(sx - 8, sy - 16); c.stroke(); const wv = Math.sin(t * 3 + e.id) * 0.8; c.fillStyle = fc; c.beginPath(); c.moveTo(sx - 8, sy - 16); c.quadraticCurveTo(sx - 4, sy - 16.5 + wv, sx - 0.5, sy - 15.4); c.lineTo(sx - 0.5, sy - 10.6); c.quadraticCurveTo(sx - 4, sy - 11.4 + wv, sx - 8, sy - 11); c.fill(); c.fillStyle = '#e8c24a'; c.beginPath(); c.arc(sx - 4.4, sy - 13.4 + wv * 0.5, 1.1, 0, TAU); c.fill(); }
  }
  function drawCamp(c, o, sx, sy, t, nightF, fx) {
    const e = o.e; const fc = G.Fac.hex(e.fac);
    const n = e.scale === 'grande' ? 3 : e.scale === 'media' ? 2 : 1;
    for (let k = 0; k < n; k++) { const x = sx - 8 + k * 9, y = sy + (k % 2) * 3; c.fillStyle = '#e0d4b4'; c.beginPath(); c.moveTo(x - 5, y); c.lineTo(x, y - 6.5); c.lineTo(x + 5, y); c.closePath(); c.fill(); c.fillStyle = '#c4b896'; c.beginPath(); c.moveTo(x, y - 6.5); c.lineTo(x + 5, y); c.lineTo(x + 2, y + 1); c.closePath(); c.fill(); c.fillStyle = fc; c.fillRect(x - 0.3, y - 9, 0.6, 2.6); c.fillRect(x + 0.3, y - 9, 2, 1.2); }
    c.fillStyle = '#2a2220'; c.beginPath(); c.ellipse(sx + 4, sy + 6, 2.6, 1.3, 0, 0, TAU); c.fill();
    if (fx && (G.isNight() || nightF > 0.2)) { fx.fire(sx + 4, sy + 4.5, 0.45 + 0.08 * Math.sin(t * 7 + e.id)); fx.light(sx + 4, sy + 2, 26, 'warm', 0.25 + nightF * 0.2); }
  }
  function drawCastaway(c, o, sx, sy, t, nightF, fx) {
    // a lean-to of branches, a signal pole with a rag, a fire
    c.strokeStyle = '#6a4a2c'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(sx - 6, sy); c.lineTo(sx - 2, sy - 6); c.lineTo(sx + 2, sy); c.stroke();
    c.fillStyle = 'rgba(80,110,50,0.8)'; c.beginPath(); c.moveTo(sx - 6.4, sy); c.lineTo(sx - 2, sy - 6.4); c.lineTo(sx + 2.4, sy); c.closePath(); c.fill();
    c.strokeStyle = '#5a3a20'; c.beginPath(); c.moveTo(sx + 7, sy + 1); c.lineTo(sx + 7, sy - 13); c.stroke();
    c.fillStyle = '#e8e0cc'; const wv = Math.sin(t * 4 + o.c.id) * 0.8; c.beginPath(); c.moveTo(sx + 7, sy - 13); c.lineTo(sx + 11, sy - 12.4 + wv); c.lineTo(sx + 7, sy - 10.8); c.fill();
    if (o.c.raft > 0) { const k = Math.min(5, Math.ceil(o.c.raft * 5)); for (let q = 0; q < k; q++) { c.fillStyle = q % 2 ? '#7a5a34' : '#8a6a3c'; c.fillRect(sx - 5, sy + 3 + q * 0.7, 9, 0.7); } }
    if (fx && G.isNight()) { fx.fire(sx + 2, sy + 4, 0.35 + 0.06 * Math.sin(t * 7)); fx.light(sx + 2, sy + 2, 20, 'warm', 0.25); }
  }

  // ====================================================================================
  //  SAVE: by ids; the people's tasks are given back from the expedition's state
  // ====================================================================================
  (G.saveHooks = G.saveHooks || []).push({
    save(out) { out.exps = (G.S.exps || []).map(e => Object.assign({}, e, { berth: e.berth || {} })); out.castaways = G.S.castaways || []; out.colonies = G.S.colonies || []; },
    load(o) {
      const S = G.S; S.exps = o.exps || []; S.castaways = o.castaways || []; S.colonies = o.colonies || []; X.reset();
      for (const e of S.exps) {
        if (!X.live(e)) continue;
        // the people ashore get back to what they were doing (the ones aboard are still aboard)
        for (const id of e.crew) {
          const v = P(id); if (!v || v.aboard) continue;
          if (e.st === 'prep' || e.st === 'reunir' || e.st === 'embarque') G.Vg.setTask(v, { type: 'cais', exp: e.id, k: e.crew.indexOf(id), job: 'wait', pri: 3.25, st: 0 });
          else if (e.st === 'exploracao' || e.st === 'contato' || e.st === 'desembarque') G.Vg.setTask(v, { type: 'expl', exp: e.id, pri: 3.3, st: 'walk', n: 0 });
          else if (e.st === 'reembarque') G.Vg.setTask(v, { type: 'expl', exp: e.id, pri: 3.3, st: 'back', n: 0 });
        }
        if (e.st === 'contato') e.st = 'exploracao';
        // the ships pick their course up again
        const flag = ship(e.flag);
        if (flag) {
          if (e.st === 'viagem') { if (!plot(e, e.ships.map(ship).filter(Boolean))) goHome(e, e.ships.map(ship).filter(Boolean)); }
          else if (e.st === 'volta') goHome(e, e.ships.map(ship).filter(Boolean));
          else if (e.st === 'aproximacao' && e.waterAt) Nv._sailTo(flag, e.waterAt[0], e.waterAt[1]);
        }
      }
      for (const c of S.castaways) { if (c.done) continue; for (const id of c.ids) { const v = P(id); if (v && !v.aboard) G.Vg.setTask(v, { type: 'naufrago', st: 'camp', camp: c.id, pri: 3.4 }); } }
      for (const s of S.ships) if (s.kind === 'jangada' && s.to && s.st === 'out') Nv._sailTo(s, s.to[0], s.to[1]);
    },
  });
})(window.G);
