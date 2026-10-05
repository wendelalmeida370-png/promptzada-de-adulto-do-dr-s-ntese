'use strict';
// ============================================================
//  Life: the small hours of a town. Families at their door at
//  dusk, old people telling the children what really happened,
//  children learning their parents' trade, lines at the well and
//  at the stalls, the call to work at dawn, rows of the faithful
//  — and the living biography that remembers all of it.
//  Everything here takes the place of something people already
//  did (going home, playing, praying), so the day keeps its shape.
// ============================================================
(function (G) {
  const L = G.Life = {};
  let N = G.N; const W = G.W;
  G.mapHooks.push(n => { N = n; });
  const TAU = Math.PI * 2;
  const DAY = () => G.DAY_LEN;
  const oa = v => (v.g === 'f' ? 'a' : 'o');
  const person = id => (id ? G.person(id) : null);
  const nm = id => { const p = person(id); return p ? p.name : 'alguém'; };
  const trade = r => ((G.ROLE[r] || [r])[0] || r).toLowerCase();
  const trim = (s, n) => (s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s);

  // ============================== the living biography ==============================
  // entries are [day, code, ...args]; ids, names and short words only
  const BIO_MAX = 18;
  const MINOR = { story: 1, told: 1, trade: 1, war: 1, moved: 1, fest: 1, appr: 1, elder: 1 };
  L.bio = function (v, code, ...args) {
    if (!v || !G.S || v.dead) return;
    const e = [G.S.day, code, ...args];
    const list = v.bio || (v.bio = []);
    // a trade taken and dropped within a year or two: only the last one counts
    if (code === 'trade') { let k = list.length - 1; while (k >= 0 && list[k][1] !== 'trade') k--; if (k >= 0 && G.S.day - list[k][0] < 2) { list.splice(k, 1); } }
    const last = list[list.length - 1];
    if (last && last[1] === code && last[2] === e[2] && last[3] === e[3]) return;
    if ((code === 'story' || code === 'told') && list.filter(q => q[1] === code).length >= 3) return;
    if (code === 'fest' && args[1] !== 'win' && list.some(q => q[1] === 'fest' && q[2] === args[0] && q[3] === args[1])) return;
    list.push(e);
    if (list.length > BIO_MAX) { let k = list.findIndex((q, i) => i > 0 && MINOR[q[1]]); if (k < 0) k = 1; list.splice(k, 1); }
  };
  const LIMB = { armL: 'o braço esquerdo', armR: 'o braço direito', leg: 'uma perna' };
  const LIMB1 = { armL: 'meu braço esquerdo', armR: 'meu braço direito', leg: 'minha perna' };
  const REL = { partner: v => (v.g === 'f' ? 'a companheira' : 'o companheiro'), mother: () => 'a mãe', father: () => 'o pai', child: v => (v.g === 'f' ? 'a filha' : 'o filho') };
  // [third person, first person, takes 'em' (nas Panateneias)]
  const FEST = { win: ['Venceu', 'Venci', 0], bearer: ['Carregou as coisas sagradas', 'Carreguei as coisas sagradas', 1], victim: ['Foi escolhid{o} para morrer', null, 1], athlete: ['Competiu', 'Competi', 1], gladiator: ['Lutou na arena', 'Lutei na arena', 1], actor: ['Atuou', 'Atuei', 1], leader: ['Conduziu', 'Conduzi', 0], chained: ['Desfilou acorrentad{o}', 'Desfilei acorrentad{o}', 1] };
  const em = s => s.replace(/^(os|as|o|a) /, (m, a) => 'n' + a + ' ');
  const festPhrase = (v, a, b, first) => { const F = FEST[b] || ['Participou', 'Participei', 1]; const verb = F[first ? 1 : 0]; if (!verb) return null; return `${verb.replace('{o}', oa(v))} ${F[2] ? em(a) : a}`; };
  // one line of a life, in the third person
  L.bioLine = function (v, e) {
    const [d, code, a, b, c] = e; const o = oa(v);
    switch (code) {
      case 'born': { const m = a && nm(a), f = b && nm(b); return `Nasceu em ${c || 'algum lugar'}${m || f ? `, filh${o} de ${[m, f].filter(Boolean).join(' e ')}` : ''}.`; }
      case 'awoke': return `Despertou ao redor da primeira fogueira de ${a}.`;
      case 'arrived': return `Chegou a ${a}.`;
      case 'appr': return `Começou a aprender o ofício de ${trade(a)} com ${b === v.mother ? 'a mãe' : b === v.father ? 'o pai' : nm(b)}.`;
      case 'learned': return `Aprendeu de verdade o ofício de ${trade(a)}.`;
      case 'trade': return `Tornou-se ${(G.ROLE[a] || [a, a])[v.g === 'f' ? 1 : 0].toLowerCase()}${b ? ' — o ofício que aprendeu criança' : ''}.`;
      case 'elder': return `Deixou o trabalho pesado: agora é ${v.g === 'f' ? 'uma anciã' : 'um ancião'}.`;
      case 'couple': return `Uniu-se a ${nm(a)}.`;
      case 'child': { const k = person(a); return `Nasceu ${k && k.g === 'f' ? 'sua filha' : 'seu filho'}, ${nm(a)}.`; }
      case 'lost': { const p = person(a); return `Perdeu ${p ? REL[b](p) : 'alguém'}, ${nm(a)}.`; }
      case 'war': return `Partiu para a guerra contra ${a}${b ? `, rumo a ${b}` : ''}.`;
      case 'defend': return `Pegou em armas para defender ${a} de ${b}.`;
      case 'kill': return `Derrubou seu primeiro inimigo, ${a}.`;
      case 'hero': return `Ganhou fama: já eram ${a} inimigos derrubados.`;
      case 'limb': return `Perdeu ${LIMB[a] || 'um membro'} em combate${b ? ' perto de ' + b : ''}.`;
      case 'wounded': return `Foi ferid${o} em combate${a ? ' perto de ' + a : ''} e sobreviveu.`;
      case 'captive': return `Foi capturad${o} por ${a}.`;
      case 'freed': return `Voltou a ser livre.`;
      case 'ruler': return `Passou a governar ${a}.`;
      case 'fest': return festPhrase(v, a, b, false) + '.';
      case 'story': return `Ouviu ${nm(a)} contar: “${b}”`;
      case 'told': return `Contou às crianças: “${a}”`;
      case 'moved': return `Mudou-se para ${a}.`;
      case 'plague': return `Adoeceu com o fedor dos mortos${a ? ' de ' + a : ''}.`;
      case 'note': return a;
    }
    return '';
  };
  // the same memory told by an old person, in the first person
  function firstPerson(v, e) {
    const [, code, a, b] = e; const o = oa(v);
    switch (code) {
      case 'war': return `Parti para a guerra contra ${a}${b ? ', rumo a ' + b : ''}`;
      case 'defend': return `Peguei em armas para defender ${a} de ${b}`;
      case 'limb': return `Perdi ${LIMB1[a] || 'um pedaço de mim'} lutando${b ? ' perto de ' + b : ''}`;
      case 'wounded': return `Fui ferid${o} na batalha${a ? ' perto de ' + a : ''} e voltei para contar`;
      case 'kill': return `Derrubei meu primeiro inimigo, ${a}`;
      case 'hero': return `Derrubei ${a} inimigos, e cantaram meu nome`;
      case 'captive': return `Fui capturad${o} por ${a}`;
      case 'freed': return `Fui cativ${o}, e voltei a ser livre`;
      case 'awoke': return `Acordei junto à primeira fogueira de ${a}, quando não havia nada aqui`;
      case 'arrived': return `Cheguei a ${a} sem nada`;
      case 'fest': return festPhrase(v, a, b, true);
      case 'lost': { const p = person(a); return p && b === 'partner' ? `Perdi ${REL.partner(p)}, ${p.name}` : null; }
      case 'ruler': return `Governei ${a}`;
      case 'note': return b || null;
    }
    return null;
  }
  L.bioList = function (v) { return (v.bio || []).map(e => ({ d: e[0], age: Math.max(0, Math.floor(e[0] - (v.born || 0))), txt: L.bioLine(v, e) })).filter(e => e.txt); };
  L.onCreate = function (v) {
    const S = G.S; const set = S.settlements.get(v.set); const sn = set ? set.name : '';
    if ((v.mother || v.father) && !(S.day <= 1 && v.age >= 1)) {
      L.bio(v, 'born', v.mother || 0, v.father || 0, sn);
      for (const id of [v.mother, v.father]) { const p = S.villagers.get(id); if (p) L.bio(p, 'child', v.id); }
    } else if (S.day <= 1) L.bio(v, 'awoke', sn);
    else L.bio(v, 'arrived', sn);
  };
  // the dead: grief for those who are left
  L.onDeath = function (v) {
    const S = G.S;
    const p = S.villagers.get(v.partner); if (p) L.bio(p, 'lost', v.id, 'partner');
    for (const id of [v.mother, v.father]) { const q = S.villagers.get(id); if (q) L.bio(q, 'lost', v.id, 'child'); }
    for (const id of v.kids || []) { const k = S.villagers.get(id); if (k && k.age >= 3) L.bio(k, 'lost', v.id, v.g === 'f' ? 'mother' : 'father'); }
  };
  L.onRole = function (v, prev) {
    const r = v.role; if (!r || r === prev) return;
    if (r === 'anciao') return L.bio(v, 'elder');
    if (r === 'crianca' || r === 'bebe' || r === 'cativo') return;
    L.bio(v, 'trade', r, v.skill === r ? 1 : 0);
  };

  // ============================== lines ==============================
  // a line is an ordered list of people in front of a spot, bending around what is in the way
  const Q = new Map();
  const GAP = 0.6;
  function lineSlots(q) {
    const s = [[q.x, q.y]]; let x = q.x, y = q.y, a = Math.atan2(q.dy, q.dx);
    for (let k = 1; k < 9; k++) {
      let ok = false;
      for (const da of [0, 0.5, -0.5, 1, -1, 1.5, -1.5]) { const nx = x + Math.cos(a + da) * GAP, ny = y + Math.sin(a + da) * GAP; if (W.inb(nx, ny) && W.walkableXY(nx, ny)) { x = nx; y = ny; a += da * 0.5; ok = true; break; } }
      if (!ok) break;
      s.push([x + (G.hash(k * 7 + q.x) - 0.5) * 0.1, y + (G.hash(k * 13 + q.y) - 0.5) * 0.1]);
    }
    return s;
  }
  L.queueLen = key => { const q = Q.get(key); return q ? q.ids.length : 0; };
  L.queueFull = key => { const q = Q.get(key); return !!q && q.ids.length >= (q.slots ? q.slots.length : 8); };
  L.leaveQueue = function (v) {
    const key = v._q; if (!key) return; v._q = null;
    const q = Q.get(key); if (!q) return;
    const k = q.ids.indexOf(v.id); if (k >= 0) q.ids.splice(k, 1);
    if (!q.ids.length) Q.delete(key);
  };
  // stand in line; true once this person is at the front, on the spot
  L.inLine = function (v, t, key, fx, fy, dx, dy, dt, H) {
    let q = Q.get(key);
    if (!q) { const d = Math.hypot(dx, dy) || 1; Q.set(key, q = { ids: [], x: fx, y: fy, dx: dx / d, dy: dy / d }); q.slots = lineSlots(q); }
    if (v._q !== key) { L.leaveQueue(v); q.ids.push(v.id); v._q = key; t.qk = -1; }
    const k = Math.min(q.ids.indexOf(v.id), q.slots.length - 1);
    const [sx, sy] = q.slots[k];
    if (t.qk !== k) { t.qk = k; t.qpath = G.dist(v.x, v.y, sx, sy) > 1.6 && !W.losClear(v.x, v.y, sx, sy) ? !!H.goto(v, sx, sy, false) : false; }
    const d = G.dist(v.x, v.y, sx, sy);
    if (t.qpath && !H.arrived(v)) { H.move(v, dt, 0.9); v.act = ''; return false; }
    if (d > 0.08) { // the last steps, or shuffling forward
      const st = Math.min(d, v.speed * 0.8 * dt);
      v.x += (sx - v.x) / d * st; v.y += (sy - v.y) / d * st; v.moving = true; v.walkPh += st * 8.5; v.path = null;
      if (Math.abs(sx - v.x) + Math.abs(sy - v.y) > 0.01) G.faceTo(v, sx - v.x, sy - v.y);
      v.act = ''; return false;
    }
    v.moving = false;
    G.faceTo(v, q.x - v.x - (k ? 0 : q.dx * 0.3), q.y - v.y - (k ? 0 : q.dy * 0.3));
    if (k > 0) { v.act = 'wait'; t.waited = (t.waited || 0) + dt; return false; }
    return true;
  };
  function pruneQueues() {
    const S = G.S;
    for (const [key, q] of Q) { q.ids = q.ids.filter(id => { const v = S.villagers.get(id); return v && v._q === key; }); if (!q.ids.length) Q.delete(key); }
  }
  L.queues = () => [...Q.entries()].map(([key, q]) => ({ key, n: q.ids.length, x: q.x, y: q.y, ids: q.ids.slice() }));

  // ============================== water for the house ==============================
  // a house drinks its jar in about a day; someone goes to the well, waits in line and brings it back
  L.homeWater = h => (h && h.water !== undefined ? h.water : 1);
  L.dirtMul = function (v) { const h = G.S.buildings.get(v.home); return h && L.homeWater(h) < 0.15 ? 1.6 : 1; };
  function waterSource(v) {
    const S = G.S; let best = null, bd = 22 * 22;
    for (const b of S.buildings.values()) {
      if (b.type !== 'well' || !b.built || b.set !== v.set) continue;
      const d = G.dist2(v.x, v.y, b.x + 0.5, b.y + 0.5);
      if (d < bd && !L.queueFull('well:' + b.id)) { bd = d; best = b; }
    }
    // the line starts on open ground beside the well, never on it
    if (best) { const [fx, fy] = G.Vg.door(best); const [cx, cy] = G.Village.center(best); return { well: best, x: fx, y: fy, dx: fx - cx, dy: fy - cy }; }
    // no well: the river bank
    const x0 = Math.floor(v.x), y0 = Math.floor(v.y);
    for (let r = 1; r <= 14; r++) for (let k = 0; k < 8 * r; k++) {
      const a = k / (8 * r) * TAU; const x = Math.floor(x0 + Math.cos(a) * r), y = Math.floor(y0 + Math.sin(a) * r);
      if (!W.inb(x, y) || G.S.type[y * N + x] !== G.T.RIVER) continue;
      for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + ax, ny = y + ay; if (W.inb(nx, ny) && W.walkable(ny * N + nx)) return { x: nx + 0.5 - ax * 0.3, y: ny + 0.5 - ay * 0.3, river: true }; }
    }
    return null;
  }
  function runWater(v, t, dt, H) {
    const S = G.S; const h = S.buildings.get(t.home); if (!h || !h.built) return H.end(v);
    if (t.st === 0) {
      const src = waterSource(v); if (!src) { h.waterTry = S.clock; return H.end(v); }
      t.src = src; t.st = src.well ? 1 : 5;
      if (t.st === 5 && !H.goto(v, src.x, src.y, false)) return H.end(v);
      return;
    }
    if (t.st === 1) { // the line at the well
      const w = S.buildings.get(t.src.well.id); if (!w) return H.end(v);
      if (G.dist(v.x, v.y, t.src.x, t.src.y) > 5 && !v._q) { if (!t.walk) { if (!H.goto(v, t.src.x + t.src.dx * 1.5, t.src.y + t.src.dy * 1.5, false)) { if (!G.Vg.gotoB(v, w)) return H.end(v); } t.walk = true; } if (!H.move(v, dt)) return; }
      if (!L.inLine(v, t, 'well:' + w.id, t.src.x, t.src.y, t.src.dx, t.src.dy, dt, H)) { if (t.waited > 40) { L.leaveQueue(v); return H.end(v); } return; }
      t.st = 2; v.actT = 0; G.faceTo(v, w.x - v.x, w.y - v.y);
      return;
    }
    if (t.st === 5) { if (!H.move(v, dt)) return; t.st = 2; v.actT = 0; return; }
    if (t.st === 2) { // draw the water
      v.act = 'fill';
      if (G.R() < dt * 1.5) G.FX && G.FX.splash(v.x + 0.2, v.y - 0.2, 0.2);
      if (v.actT < (v._q && L.queueLen(v._q) > 1 ? 1.1 : 1.8)) return;
      L.leaveQueue(v); v.carry = { k: 'water', n: 1, jar: 1 }; v.act = '';
      if (!G.Vg.gotoB(v, h)) { v.carry = null; return H.end(v); }
      t.st = 3; return;
    }
    if (t.st === 3) { if (!H.move(v, dt, 0.9)) return; h.water = 1; v.carry = null; G.Vg.emote(v, 'happy', 1); H.end(v); }
  }

  // ============================== family evenings ==============================
  // the household sits together at its own door at dusk, around a small fire
  const fams = new Map();
  function famKey(v) {
    const S = G.S;
    if (v.age < 16) { const m = S.villagers.get(v.mother); if (m && m.home === v.home && m.age >= 16) return famKey(m); const f = S.villagers.get(v.father); if (f && f.home === v.home && f.age >= 16) return famKey(f); return 0; }
    return v.partner ? Math.min(v.id, v.partner) : v.id;
  }
  L.fams = () => [...fams.values()];
  function family(v) {
    const S = G.S; const h = S.buildings.get(v.home); if (!h || !h.built || h.type === 'ruin') return null;
    const key = famKey(v); if (!key) return null;
    let f = fams.get(key);
    if (!f) {
      const door = G.Vg.door(h); const [cx, cy] = G.Village.center(h);
      let dx = door[0] - cx, dy = door[1] - cy; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      // families sharing a big house spread along its front
      const off = (G.hash(key) - 0.5) * Math.min(1.6, (h.w + h.h) * 0.3);
      let x = door[0] + dx * 0.9 - dy * off, y = door[1] + dy * 0.9 + dx * off;
      if (!W.walkableXY(x, y)) { x = door[0] + dx * 0.5; y = door[1] + dy * 0.5; }
      if (!W.walkableXY(x, y)) { x = door[0]; y = door[1]; }
      f = { key, home: h.id, x, y, a0: Math.atan2(dy, dx), members: new Map(), t: 0, fire: 0 };
      fams.set(key, f);
    }
    return f;
  }
  L.familyTask = function (v, H) {
    if (v.captive || v.age < 3) return null;
    const S = G.S;
    // only a real household: someone else of the family lives there too
    const key = famKey(v); if (!key) return null;
    let n = 0; for (const id of [v.partner, v.mother, v.father, ...(v.kids || [])]) { const o = S.villagers.get(id); if (o && o.home === v.home && o.age >= 3) n++; }
    if (!n) return null;
    const f = family(v); if (!f) return null;
    return H.setTask(v, { type: 'family', fk: f.key, pri: 0.5, st: 0 });
  };
  function seatOf(f, v) {
    let k = f.members.get(v.id);
    if (k === undefined) { const used = new Set(f.members.values()); k = 0; while (used.has(k)) k++; f.members.set(v.id, k); }
    const a = f.a0 + Math.PI * 0.5 + (k % 6) * (TAU / 6) + (k >= 6 ? 0.5 : 0);
    const r = 0.62 + (k >= 6 ? 0.35 : 0);
    let x = f.x + Math.cos(a) * r, y = f.y + Math.sin(a) * r;
    if (!W.walkableXY(x, y)) { x = f.x + Math.cos(a) * 0.3; y = f.y + Math.sin(a) * 0.3; }
    return [x, y];
  }
  function runFamily(v, t, dt, H) {
    const S = G.S; const f = fams.get(t.fk);
    if (!f || !S.buildings.get(f.home)) return H.end(v);
    const h = S.buildings.get(f.home);
    const late = S.time > 0.79 || (S.time < 0.55 && S.time > 0.05);
    if (late || t.age > 34) { f.members.delete(v.id); return H.end(v); }
    const kid = v.age < 12;
    if (kid && t.st === 2 && S.time > 0.72 && ![...f.members.keys()].some(id => { const o = S.villagers.get(id); return o && o.age >= 16; })) { f.members.delete(v.id); return H.end(v); }
    if (t.st === 0) {
      const [sx, sy] = seatOf(f, v);
      t.sx = sx; t.sy = sy;
      if (G.dist(v.x, v.y, sx, sy) > 0.3 && !H.goto(v, sx, sy, false)) { f.members.delete(v.id); return H.end(v); }
      t.st = 1; return;
    }
    if (t.st === 1) {
      if (!H.move(v, dt)) return;
      t.st = 2; v.actT = 0; t.dur = G.rr(10, 18);
      // whoever gets home first is welcomed with a hug
      const p = S.villagers.get(v.partner);
      if (p && p.task && p.task.type === 'family' && p.task.st === 2 && !p.task.hug && G.dist(p.x, p.y, v.x, v.y) < 1.6) { t.hug = 1.5; p.task.hug = 1.5; G.faceTo(v, p.x - v.x, p.y - v.y); G.faceAs(p, v, true); G.Vg.emote(v, 'heart', 1.4); }
      if (kid) { const m = S.villagers.get(v.mother) || S.villagers.get(v.father); if (m && m.task && m.task.type === 'family' && m.task.st === 2 && !m.task.lift && v.age < 8 && G.R() < 0.6) { m.task.lift = v.id; m.task.liftT = 2.4; t.lifted = m.id; } }
      return;
    }
    // at the door
    f.t = S.clock; t.dur -= dt;
    if (t.hug > 0) { t.hug -= dt; v.act = 'hug'; return; }
    if (t.lifted) { // up in a parent's arms
      const p = S.villagers.get(t.lifted);
      if (!p || !p.task || p.task.lift !== v.id) { t.lifted = 0; t.perch = false; v.z = 0; v.x = t.sx; v.y = t.sy; return; }
      t.perch = true; v.x = p.x + p.face * 0.08; v.y = p.y + 0.02; G.faceAs(v, p, true);
      v.z = 7 + Math.abs(Math.sin((2.4 - p.task.liftT) * 4.2)) * 7; v.act = 'joy'; v.moving = false;
      if (G.R() < dt * 1.2) G.Vg.emote(v, 'happy', 1);
      return;
    }
    if (t.lift) {
      t.liftT -= dt; v.act = 'lift';
      if (t.liftT <= 0) { const k = S.villagers.get(t.lift); t.lift = 0; if (k && k.task && k.task.lifted === v.id) { k.task.lifted = 0; k.task.perch = false; k.z = 0; k.x = k.task.sx; k.y = k.task.sy; } }
      return;
    }
    if (kid && v.age >= 3 && (t.play || G.R() < dt * 0.08)) { // round and round the fire
      t.play = (t.play || 0) + dt;
      const a = (S.clock * 1.6 + v.id) % TAU, r = 1.15;
      const tx = f.x + Math.cos(a) * r, ty = f.y + Math.sin(a) * r;
      if (W.walkableXY(tx, ty)) { const d = G.dist(v.x, v.y, tx, ty); const st = Math.min(d, v.speed * 1.1 * dt); if (d > 0.01) { v.x += (tx - v.x) / d * st; v.y += (ty - v.y) / d * st; G.faceTo(v, tx - v.x, ty - v.y); } v.moving = true; v.walkPh += st * 9; v.act = 'run'; }
      if (t.play > 5) { t.play = 0; const [sx, sy] = seatOf(f, v); t.sx = sx; t.sy = sy; H.goto(v, sx, sy, false); t.st = 1; }
      return;
    }
    v.moving = false;
    G.faceTo(v, f.x - v.x, f.y - v.y);
    // supper from the family pantry
    if (v.hunger > 40 && (h.pantry || 0) >= 1 && !t.ate) { h.pantry -= 1; v.hunger = Math.max(0, v.hunger - 55); t.ate = 2.2; }
    if (t.ate > 0) { t.ate -= dt; v.act = 'eat'; return; }
    v.act = t.talk > 0 ? 'sittalk' : 'sit';
    if (t.talk > 0) t.talk -= dt; else if (G.R() < dt * 0.3) t.talk = G.rr(1.5, 3);
    if (G.R() < dt * 0.05) G.Vg.emote(v, G.R() < 0.4 ? 'heart' : G.R() < 0.6 ? 'happy' : 'chat', 1.3);
    // now and then a parent throws the little one up in the air
    if (!kid && !t.lift && G.R() < dt * 0.05) {
      for (const id of v.kids || []) { const k = S.villagers.get(id); if (k && k.age >= 2 && k.age < 7 && k.task && k.task.type === 'family' && k.task.fk === t.fk && k.task.st === 2 && !k.task.lifted && !k.task.play) { t.lift = k.id; t.liftT = 2.4; k.task.lifted = v.id; break; } }
    }
    if (t.dur <= 0 && S.time < 0.6) { f.members.delete(v.id); H.end(v); }
  }

  // ============================== the old tell stories ==============================
  const tales = new Map(); // settlement id -> session
  L.tales = () => [...tales.values()];
  const TALE_IC = { sea: 2, cave: 2, war: 3, battle: 3, massacre: 3, siege: 3, meteor: 4, bolt: 3, wave: 4, mountain: 4, settle: 3, campfire: 3, crown: 2, tyrant: 3, split: 3, peace: 2, wonder: 3, monument: 2, temple: 2, era: 2, city: 2, plague: 3, fire: 2, prophecy: 3, lore: 3, sacrifice: 3, free: 3, general: 2, naval: 3, fest: 1, wolf: 2, storm: 2, heart: 1 };
  const MOOD = { sea: 'awe', cave: 'awe', war: 'fear', battle: 'fear', massacre: 'fear', siege: 'fear', meteor: 'awe', bolt: 'awe', wave: 'fear', mountain: 'awe', plague: 'sad', fire: 'fear', sacrifice: 'fear', wolf: 'fear', prophecy: 'awe', lore: 'awe', wonder: 'awe', heart: 'heart', fest: 'happy', peace: 'happy', free: 'happy' };
  function pickTale(elder, set) {
    const S = G.S; const cands = [];
    for (const e of elder.bio || []) { const s = firstPerson(elder, e); if (s) cands.push({ w: 4, txt: s, mood: e[1] === 'lost' ? 'sad' : e[1] === 'awoke' || e[1] === 'fest' ? 'awe' : 'fear', own: true }); }
    const f = G.Fac.get(set.fac);
    for (const e of S.history) {
      if (e.d > S.day - 2) continue;
      const w = TALE_IC[e.ic]; if (!w) continue;
      if (e.x !== undefined && G.dist(e.x, e.y, set.cx, set.cy) > 45 && !(f && e.txt.includes(f.name))) continue;
      cands.push({ w: w * (1 + Math.min(3, (S.day - e.d) / 20)), txt: e.txt, mood: MOOD[e.ic] || 'awe', d: e.d, x: e.x, y: e.y, ic: e.ic });
    }
    const lo = S.lore;
    if (lo && lo.legends) for (const l of lo.legends) cands.push({ w: 3, txt: `${l.title}: ${l.text[0]}`, mood: 'awe', d: l.day });
    if (lo && lo.myth && lo.myth.length && G.R() < 0.3) cands.push({ w: 2, txt: lo.myth.join(' '), mood: 'awe' });
    if (G.Caves) for (const c of G.Caves.talesFor(set)) cands.push(c);
    if (G.Stories && G.Stories.talesFor) for (const c of G.Stories.talesFor(set)) cands.push(c);
    if (!cands.length) return null;
    let tot = 0; for (const c of cands) tot += c.w;
    let r = G.R() * tot; for (const c of cands) { r -= c.w; if (r <= 0) return c; }
    return cands[cands.length - 1];
  }
  function startTale(set) {
    const S = G.S;
    const cf = S.buildings.get(set.campfire) || [...S.buildings.values()].find(b => b.set === set.id && b.type === 'praca' && b.built);
    const [cx, cy] = cf ? G.Village.center(cf) : [set.cx, set.cy];
    let elder = null, bd = 1e9;
    for (const v of S.villagers.values()) {
      if (v.set !== set.id || v.age < 55 || v.captive || v.inside || v.sleeping || v.held || v.air || v.hp < 30) continue;
      if (v.task && v.task.pri >= 1) continue;
      const d = G.dist2(v.x, v.y, cx, cy); if (d < bd && d < 30 * 30) { bd = d; elder = v; }
    }
    if (!elder) return null;
    const kids = [];
    for (const v of S.villagers.values()) {
      if (v.set !== set.id || v.age < 4 || v.age >= 16 || v.captive || v.inside || v.sleeping || v.held || v.air) continue;
      if (v.task && v.task.pri >= 0.6 && v.task.type !== 'family') continue;
      const d = G.dist2(v.x, v.y, cx, cy); if (d < 22 * 22) kids.push([d, v]);
    }
    if (kids.length < 2) return null;
    kids.sort((a, b) => a[0] - b[0]);
    const tale = pickTale(elder, set); if (!tale) return null;
    // the elder on one side of the fire, the children on the other
    const a0 = G.R() * TAU; const R0 = cf && cf.type === 'campfire' ? 1.15 : 0.9;
    const spot = (a, r) => { for (let k = 0; k < 6; k++) { const x = cx + Math.cos(a) * (r + k * 0.2), y = cy + Math.sin(a) * (r + k * 0.2); if (W.walkableXY(x, y)) return [x, y]; } return null; };
    const es = spot(a0, R0); if (!es) return null;
    const s = { set: set.id, elder: elder.id, x: cx, y: cy, ex: es[0], ey: es[1], tale, t0: S.clock, dur: G.rr(11, 15), kids: [], day: S.day };
    tales.set(set.id, s);
    G.Vg.setTask(elder, { type: 'tell', set: set.id, pri: 0.9, st: 0, kind: 'tell' });
    const list = kids.slice(0, 7).map(k => k[1]);
    // a grown-up or two sit down with them
    for (const v of S.villagers.values()) { if (list.length >= 9) break; if (v.set === set.id && v.age >= 16 && v !== elder && !v.captive && !v.inside && !v.sleeping && v.task && v.task.pri < 0.6 && v.task.type !== 'family' && G.dist2(v.x, v.y, cx, cy) < 64 && G.R() < 0.35) list.push(v); }
    list.forEach((v, k) => {
      const n = list.length; const a = a0 + Math.PI + (k - (n - 1) / 2) * (1.9 / Math.max(1, n - 1)) * (n > 1 ? 1 : 0);
      const p = spot(a, R0 + (v.age >= 16 ? 0.55 : 0.1) + (k % 2) * 0.22); if (!p) return;
      s.kids.push(v.id);
      G.Vg.setTask(v, { type: 'listen', set: set.id, x: p[0], y: p[1], pri: 0.95, st: 0, kind: 'listen' });
    });
    G.Life.bio(elder, 'told', trim(tale.txt, 90));
    G.Stories && G.Stories.signal('tale', { teller: elder.id, kids: s.kids.filter(id => { const k = S.villagers.get(id); return k && k.age < 16; }), tale });
    return s;
  }
  function runTell(v, t, dt, H) {
    const S = G.S; const s = tales.get(t.set); if (!s || s.elder !== v.id) return H.end(v);
    if (t.st === 0) { if (!H.goto(v, s.ex, s.ey, false)) { tales.delete(t.set); return H.end(v); } t.st = 1; return; }
    if (t.st === 1) { if (!H.move(v, dt, 0.8)) return; t.st = 2; v.actT = 0; s.begin = S.clock; return; }
    v.moving = false; v.act = 'story'; G.faceTo(v, s.x - v.x, s.y - v.y);
    if (G.R() < dt * 0.25) G.Vg.emote(v, s.tale.mood === 'fear' ? 'angry' : s.tale.mood === 'heart' ? 'heart' : 'chat', 1.4);
    if (S.clock - s.begin > s.dur || S.time > 0.8) { tales.delete(t.set); H.end(v); }
  }
  function runListen(v, t, dt, H) {
    const S = G.S; const s = tales.get(t.set); if (!s) return H.end(v);
    if (t.st === 0) { if (!H.goto(v, t.x, t.y, false)) return H.end(v); t.st = 1; return; }
    if (t.st === 1) { if (!H.move(v, dt, v.age < 16 ? 1.1 : 1)) return; t.st = 2; v.actT = 0; return; }
    v.moving = false; v.act = 'listen';
    const e = S.villagers.get(s.elder); if (e) G.faceTo(v, e.x - v.x, e.y - v.y);
    if (s.begin && G.R() < dt * 0.12) G.Vg.emote(v, s.tale.mood === 'fear' ? 'fear' : s.tale.mood, 1.3);
    if (!t.heard && s.begin && S.clock - s.begin > 4) {
      t.heard = true;
      if (v.age < 16) {
        L.bio(v, 'story', s.elder, trim(s.tale.txt, 90));
        if (s.tale.mood === 'awe') v.devotion = Math.min(100, v.devotion + 1);
        if (s.tale.mood === 'fear' && s.tale.own) v.courage = Math.min(1, v.courage + 0.01);
      }
    }
  }

  // ============================== apprentices ==============================
  // from nine years on, children go with a parent to work, and copy what they do
  const TEACH = { agricultor: 1, lenhador: 1, coletor: 1, mineiro: 1, construtor: 1, sacerdote: 1, guerreiro: 1, pastor: 1, cavalarico: 1, ferreiro: 1, tecelao: 1, oleiro: 1, ourives: 1, acougueiro: 1, mercador: 1, feirante: 1, taverneiro: 1, escriba: 1, cacador: 1 };
  const WORKING = { chop: 1, gather: 1, mine: 1, farm: 1, build: 1, fish: 1, quarry: 1, herd: 1, fodder: 1, penwork: 1, craft: 1, dig: 1, desk: 1, sell: 1, stay: 1, serve: 1, pray: 1, drill: 1, guard: 1, pave: 1, tend: 1, forage: 1, mint: 1, patrol: 1, deliver: 1, haul: 1, fetch: 1 };
  const LEARN_AT = 0.8;
  function master(v) {
    const S = G.S;
    const ps = [S.villagers.get(v.g === 'f' ? v.mother : v.father), S.villagers.get(v.g === 'f' ? v.father : v.mother)];
    for (const p of ps) {
      if (!p || p.captive || p.set !== v.set || p.inside || p.aboard || !TEACH[p.role] || !p.task || !WORKING[p.task.type]) continue;
      if (G.dist2(p.x, p.y, v.x, v.y) > 26 * 26) continue;
      return p;
    }
    return null;
  }
  L.apprenticeTask = function (v, H) {
    if (v.age < 9 || v.age >= 16 || v.captive) return null;
    const m = master(v); if (!m) return null;
    if (!(v.learn && v.learn[m.role])) L.bio(v, 'appr', m.role, m.id);
    return H.setTask(v, { type: 'appr', id: m.id, pri: 0.25, dur: G.rr(18, 30), kind: 'appr' });
  };
  function runAppr(v, t, dt, H) {
    const S = G.S; const m = S.villagers.get(t.id);
    t.dur -= dt;
    if (!m || m.inside || m.sleeping || m.aboard || t.dur <= 0 || !m.task) return H.end(v);
    if (!WORKING[m.task.type]) { t.idle = (t.idle || 0) + dt; if (t.idle > 6) return H.end(v); } else t.idle = 0;
    const side = (G.hash(v.id) < 0.5 ? 1 : -1);
    const tx = m.x + side * 0.55, ty = m.y - side * 0.2;
    const d = G.dist(v.x, v.y, tx, ty);
    if (d > 1.1) {
      t.rt = (t.rt || 0) - dt;
      if (d < 4 && W.losClear(v.x, v.y, tx, ty)) { const st = Math.min(d, v.speed * 1.05 * dt); v.x += (tx - v.x) / d * st; v.y += (ty - v.y) / d * st; v.moving = true; v.walkPh += st * 8.5; v.path = null; if (Math.abs(tx - v.x) + Math.abs(ty - v.y) > 0.01) G.faceTo(v, tx - v.x, ty - v.y); v.act = ''; return; }
      if (t.rt <= 0 || H.arrived(v)) { t.rt = 1.1; if (!H.goto(v, tx, ty, false)) return H.end(v); }
      H.move(v, dt, 1.05); v.act = ''; return;
    }
    v.path = null; v.moving = false;
    // copy what the master does, a beat behind
    if (m.act && !m.moving) {
      v.act = m.act === 'fight' ? 'drill' : m.act; v.actT = Math.max(0, m.actT - 0.18); G.faceAs(v, m);
      v.learn = v.learn || {};
      const before = v.learn[m.role] || 0; v.learn[m.role] = before + dt * 4 / DAY();
      if (before < LEARN_AT && v.learn[m.role] >= LEARN_AT) { v.skill = m.role; L.bio(v, 'learned', m.role); G.Vg.emote(v, 'happy', 2); G.Vg.emote(m, 'heart', 2); }
      if (G.R() < dt * 0.06) G.Vg.emote(m, G.R() < 0.5 ? 'chat' : 'happy', 1.2);
      if (G.R() < dt * 0.05) G.Vg.emote(v, 'question', 1.1);
    } else { v.act = ''; G.faceTo(v, m.x - v.x, m.y - v.y); }
  }
  // the most practised trade, if any
  L.learned = function (v) {
    if (v.skill) return v.skill;
    let best = null, bv = 0.3; for (const k in v.learn || {}) if (v.learn[k] > bv) { bv = v.learn[k]; best = k; }
    return best;
  };

  // ============================== rows of the faithful, ranks of soldiers ==============================
  const rows = new Map(); // building id -> Map(slot -> villager id)
  L.rowSpot = function (b, v, cols, gap, first) {
    const S = G.S; let m = rows.get(b.id); if (!m) rows.set(b.id, m = new Map());
    for (const [k, id] of m) { const o = S.villagers.get(id); if (!o || !o.task || o.task.row !== b.id) m.delete(k); }
    let k = 0; while (m.has(k)) k++;
    if (k > cols * 4) return null;
    m.set(k, v.id);
    const [fx, fy] = G.Village.frontTile(b); const [cx, cy] = G.Village.center(b);
    let dx = fx - cx, dy = fy - cy; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const row = Math.floor(k / cols), col = k % cols;
    const x = fx + dx * (first + row * gap) + -dy * (col - (cols - 1) / 2) * gap, y = fy + dy * (first + row * gap) + dx * (col - (cols - 1) / 2) * gap;
    if (!W.walkableXY(x, y)) { m.delete(k); return null; }
    return [x, y, k, dx, dy];
  };
  L.rowRelease = function (v) { const t = v.task; if (!t || !t.row) return; const m = rows.get(t.row); if (m) for (const [k, id] of m) if (id === v.id) m.delete(k); };

  // ============================== the call to work ==============================
  const CALL = { romano: 'horn', grego: 'horn', nordico: 'horn', egipcio: 'drum', asteca: 'drum' };
  let lastCall = -1;
  function workCall() {
    const S = G.S;
    for (const set of S.settlements.values()) {
      if (G.Village.pop(set.id) < 20) continue;
      const place = [...S.buildings.values()].find(b => b.set === set.id && b.built && (b.type === 'praca' || b.type === 'temple')) || S.buildings.get(set.campfire);
      if (!place) continue;
      let who = null;
      for (const v of S.villagers.values()) { if (v.set !== set.id || v.captive || v.inside || v.sleeping || v.age < 16) continue; if (v.role === 'sacerdote' || (v.role === 'anciao' && !who)) { who = v; if (v.role === 'sacerdote') break; } }
      if (!who || (who.task && who.task.pri >= 1.5)) continue;
      const f = G.Fac.get(set.fac);
      G.Vg.setTask(who, { type: 'callwork', id: place.id, pri: 1.5, st: 0, sound: CALL[f && f.civ] || 'horn', kind: 'callwork' });
    }
  }
  function runCallWork(v, t, dt, H) {
    const b = G.S.buildings.get(t.id); if (!b) return H.end(v);
    if (t.st === 0) { if (!G.Vg.gotoB(v, b)) return H.end(v); t.st = 1; return; }
    if (t.st === 1) { if (!H.move(v, dt, 1.1)) { if (t.age > 25) H.end(v); return; } t.st = 2; v.actT = 0; return; }
    v.act = 'call'; v.moving = false;
    if (!t.blew && v.actT > 0.4) { t.blew = true; G.Audio && G.Audio.at(v.x, v.y, t.sound, true); G.FX && G.FX.ring(v.x, v.y, 0.2, 3, 1.6, 'rgba(255,240,200,0.5)', 1.2); }
    if (v.actT > 3.5) H.end(v);
  }

  // ============================== bookkeeping ==============================
  let tMgr = 0, tQ = 0;
  L.update = function (dt) {
    const S = G.S; if (!S) return;
    tMgr -= dt; tQ -= dt;
    if (tQ <= 0) { tQ = 3; pruneQueues(); for (const [k, f] of fams) { for (const id of f.members.keys()) { const v = S.villagers.get(id); if (!v || !v.task || v.task.type !== 'family' || v.task.fk !== k) f.members.delete(id); } if (!f.members.size && S.clock - f.t > 4) fams.delete(k); } }
    if (tMgr > 0) return;
    tMgr = 1;
    const t = S.time;
    // dawn: the call to work
    if (t > 0.07 && t < 0.12 && lastCall !== S.day) { lastCall = S.day; workCall(); }
    // houses run out of water; someone goes to fetch it in the morning
    const houses = new Map();
    for (const v of S.villagers.values()) if (v.home && !v.captive) { let l = houses.get(v.home); if (!l) houses.set(v.home, l = []); l.push(v); }
    for (const [hid, list] of houses) {
      const h = S.buildings.get(hid); if (!h || !h.built) continue;
      h.water = Math.max(0, L.homeWater(h) - 1 / (DAY() * 1.15));
      if (h.water > 0.35 || t < 0.06 || t > 0.55 || (h.waterTry && S.clock - h.waterTry < DAY() * 0.3)) continue;
      if (list.some(v => v.task && v.task.type === 'water')) continue;
      let best = null, bs = -1;
      for (const v of list) {
        if (v.age < 10 || v.age >= 70 || v.inside || v.sleeping || v.aboard || v.held || v.hp < 40) continue;
        if (v.task && v.task.pri >= 1.05) continue;
        const s = (v.task ? 1 - v.task.pri : 2) + (v.age < 16 ? 0.6 : 0) + G.R();
        if (s > bs) { bs = s; best = v; }
      }
      if (best && G.R() < 0.35) { h.waterTry = S.clock; G.Vg.setTask(best, { type: 'water', home: hid, pri: 1.05, st: 0, kind: 'water' }); }
    }
    // dusk: an old person gathers the children around the fire
    if (t > 0.6 && t < 0.68) for (const set of S.settlements.values()) {
      if (tales.has(set.id)) continue;
      if (set.taleDay === S.day) continue;
      if (G.R() > 0.4) continue;
      set.taleDay = S.day;
      startTale(set);
    }
    for (const [k, s] of tales) if (S.clock - s.t0 > s.dur + 40 || !S.villagers.has(s.elder)) tales.delete(k);
  };

  // ============================== tasks ==============================
  L.run = function (v, t, dt, H) {
    switch (t.type) {
      case 'water': runWater(v, t, dt, H); return true;
      case 'family': runFamily(v, t, dt, H); return true;
      case 'tell': runTell(v, t, dt, H); return true;
      case 'listen': runListen(v, t, dt, H); return true;
      case 'appr': runAppr(v, t, dt, H); return true;
      case 'callwork': runCallWork(v, t, dt, H); return true;
    }
    return false;
  };
  L.onEndTask = function (v) {
    if (v._q) L.leaveQueue(v);
    const t = v.task; if (!t) return;
    if (t.row) L.rowRelease(v);
    if (t.type === 'family') { const f = fams.get(t.fk); if (f) f.members.delete(v.id); if (t.lifted || t.perch) v.z = 0; }
  };
  L.taskText = function (v, t) {
    const S = G.S;
    switch (t.type) {
      case 'water': return t.st === 2 ? (t.src && t.src.river ? 'Enchendo o jarro no rio' : 'Tirando água do poço') : t.st === 3 ? 'Levando água para casa' : v._q && t.qk > 0 ? `Na fila do poço (${t.qk + 1}º)` : 'Indo buscar água';
      case 'family': return t.lift ? 'Brincando com o filho no colo' : t.lifted ? 'Voando nos braços da família' : t.st < 2 ? 'Voltando para a família' : v.act === 'eat' ? 'Jantando com a família' : 'Fim de tarde com a família, na porta de casa';
      case 'tell': { const s = tales.get(t.set); return s ? `Contando às crianças: “${trim(s.tale.txt, 110)}”` : 'Contando histórias'; }
      case 'listen': { const s = tales.get(t.set); return s ? `Ouvindo ${nm(s.elder)} contar: “${trim(s.tale.txt, 100)}”` : 'Ouvindo uma história'; }
      case 'appr': { const m = S.villagers.get(t.id); if (!m) return 'Aprendendo um ofício'; const who = m.id === v.mother ? 'a mãe' : m.id === v.father ? 'o pai' : m.name; return `Aprendendo o ofício de ${trade(m.role)} com ${who}`; }
      case 'callwork': return t.sound === 'drum' ? 'Batendo o tambor que chama ao trabalho' : 'Tocando a trompa que chama ao trabalho';
    }
    return null;
  };
  L.reset = function () { Q.clear(); fams.clear(); tales.clear(); rows.clear(); lastCall = -1; };
  (G.saveHooks = G.saveHooks || []).push({ save() { }, load() { L.reset(); } });
})(window.G);
