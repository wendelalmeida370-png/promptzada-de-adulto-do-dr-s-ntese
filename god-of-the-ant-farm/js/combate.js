'use strict';
// ============================================================
//  Combate: the fight of the body the god lives (20f, D-410 to
//  D-424). The hands ask from the frame (combate-ui.js: a key,
//  a button, the bow drawn) and the world does it in its own
//  step, through Possess.apply, like everything the body does:
//    · a blow lands at its contact, by the bodies — the people
//      by their capsules, the beasts by their footprints
//      (G.Corpo) — inside the arc the weapon sweeps from where
//      the body stands, as far as the arm and the weapon reach;
//    · the hurt goes by the world's doors (Vg.damage, Animals.
//      damage), from the weapon's measure and its material (the
//      catalog's dano), less the helmet's and the cuirass's
//      share (protecao) and the shield's (bloqueio);
//    · the one struck answers as the world answers: a jolt, a
//      stagger, thrown down by a heavy blow; fights back or runs
//      (War.react), and a blow at one of one's own people is a
//      crime seen by whoever is near (G.Crime.assault);
//    · a duel is the fight that is no crime: asked with F on a
//      person, taken or refused by who they are, to yielding;
//    · an arrow flies (S.combate.fl, the Depot's holder 'a:'):
//      it leaves the bag, flies by its speed and the weight of
//      it, strikes by the bodies, and falls where it falls;
//    · what reaches the body passes the guard first (Cb.shield,
//      asked by possess.js before the world deals it): the
//      dodge's window lets nothing in, the guard raised in time
//      turns the blow aside (the parry), the guard held takes
//      the shield's or the weapon's share of it.
//  The people's fights among themselves are the world's (war.js,
//  army.js — the same draws, the same results): only the one who
//  fights the body fights on the body's clock (Cb.bodyTime).
//  No drawing here; what the frame shows of it it reads (events).
// ============================================================
(function (G) {
  const Cb = G.Combate = {};
  const It = G.Itens, W = G.W;
  const TILE = 4; // (metres a tile: the world's own — G.Corpo.TILE)
  const D2R = Math.PI / 180;
  const r2 = x => Math.round(x * 100) / 100, r3 = x => Math.round(x * 1000) / 1000, r4 = x => Math.round(x * 1e4) / 1e4;
  const wrap = a => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };
  const fid = v => G.Fac.idOfV(v);
  const alive = o => !!(o && G.S.villagers.has(o.id));
  Cb.TILE = TILE;

  // ------------------------------ the weapons ------------------------------
  // the way each kind of thing is fought with (the fist, the knife, the sword, the axe, the club, the spear, a thing of two
  // hands): a thing with no edge nor weight to it — a basket, a rod — is the fist's
  const CLASS_OF = { faca: 'faca', foice: 'faca', espada: 'espada', machado: 'machado', clava: 'clava', martelo: 'clava', cajado: 'clava', lanca: 'lanca', picareta: 'duas', pa: 'duas', enxada: 'duas', remo: 'duas' };
  Cb.CLASSES = ['punho', 'faca', 'espada', 'machado', 'clava', 'lanca', 'duas'];
  Cb.CLASS_NOME = { punho: 'os punhos', faca: 'a faca', espada: 'a espada', machado: 'o machado', clava: 'a clava', lanca: 'a lança', duas: 'a arma de duas mãos' };
  Cb.classOf = function (key) { const d = key && It.def(key); if (!d || !d.coisa || !(d.dano > 0) || d.tipo === 'arco') return 'punho'; return CLASS_OF[d.kind] || (d.maos >= 2 ? 'duas' : 'clava'); };
  // (the fist: what bare hands do — a third of a club, at arm's length)
  const FIST = { dano: 4, alcance: 0.3 };
  // the blows of each way of fighting (seconds of the body; hit: the share of the time at which it lands; arc: degrees swept;
  // r: how much of the weapon's reach; dmg: times the weapon's measure; fol: the breath it takes; zone: where it lands — the
  // head (the helmet) or the trunk (the cuirass); drive: the push of the gesture ([u, m/s]); cut: from where in its time it may
  // be cut by the next; stag: the jolt it gives (seconds of the body); down: it throws down; clip: its gesture)
  // Light ones in a row (l), and the heavy one charged by holding (p: its charge, up to CHARGE seconds, multiplies it — it starts
  // wound up: the charge was its windup, seen while the key was held)
  const M = (o) => Object.freeze(Object.assign({ r: 1, zone: 'corpo', stag: 0.35, down: 0, push: 0.18, cut: 0.6, combo: 0.45 }, o));
  const dr = (a, b, c) => [[0, 0], [a, b], [c, b * 0.4], [Math.min(0.95, c + 0.15), 0], [1, 0]];
  const MOVES = Cb.MOVES = {
    punho: { l: [M({ dur: 0.4, hit: 0.42, arc: 50, dmg: 1, fol: 5, drive: dr(0.25, 1.4, 0.5), clip: 'cb-punho-1' }), M({ dur: 0.44, hit: 0.42, arc: 50, dmg: 1.1, fol: 6, drive: dr(0.25, 1.5, 0.5), clip: 'cb-punho-2' }), M({ dur: 0.56, hit: 0.46, arc: 90, dmg: 1.35, fol: 8, zone: 'cabeca', stag: 0.5, drive: dr(0.3, 1.2, 0.55), clip: 'cb-punho-3' })],
      p: M({ dur: 0.62, hit: 0.3, arc: 80, dmg: 2.2, fol: 15, zone: 'cabeca', stag: 0.7, down: 1, push: 0.45, drive: dr(0.18, 2.8, 0.36), cut: 0.7, clip: 'cb-punho-p' }) },
    faca: { l: [M({ dur: 0.36, hit: 0.42, arc: 80, dmg: 1, fol: 5, drive: dr(0.25, 1.6, 0.5), clip: 'cb-faca-1' }), M({ dur: 0.38, hit: 0.44, arc: 80, dmg: 1, fol: 5, drive: dr(0.25, 1.6, 0.5), clip: 'cb-faca-2' }), M({ dur: 0.48, hit: 0.46, arc: 30, dmg: 1.45, fol: 7, stag: 0.4, drive: dr(0.3, 2.2, 0.55), clip: 'cb-faca-3' })],
      p: M({ dur: 0.6, hit: 0.3, arc: 30, dmg: 2.4, fol: 14, zone: 'cabeca', stag: 0.6, drive: dr(0.18, 2.6, 0.36), cut: 0.7, clip: 'cb-faca-p' }) },
    espada: { l: [M({ dur: 0.6, hit: 0.42, arc: 120, dmg: 1, fol: 9, drive: dr(0.25, 2.2, 0.5), clip: 'cb-espada-1' }), M({ dur: 0.6, hit: 0.42, arc: 120, dmg: 1, fol: 9, drive: dr(0.25, 2.2, 0.5), clip: 'cb-espada-2' }), M({ dur: 0.7, hit: 0.46, arc: 30, r: 1.15, dmg: 1.3, fol: 11, stag: 0.45, drive: dr(0.3, 3, 0.55), clip: 'cb-espada-3' })],
      p: M({ dur: 0.8, hit: 0.3, arc: 60, dmg: 2.3, fol: 20, zone: 'cabeca', stag: 0.8, down: 1, push: 0.4, drive: dr(0.18, 3, 0.38), cut: 0.72, clip: 'cb-espada-p' }) },
    machado: { l: [M({ dur: 0.72, hit: 0.46, arc: 100, dmg: 1, fol: 12, zone: 'cabeca', stag: 0.45, drive: dr(0.3, 2, 0.55), clip: 'cb-machado-1' }), M({ dur: 0.78, hit: 0.46, arc: 120, dmg: 1.15, fol: 13, stag: 0.5, drive: dr(0.3, 2, 0.55), clip: 'cb-machado-2' })],
      p: M({ dur: 0.9, hit: 0.32, arc: 50, dmg: 2.4, fol: 24, zone: 'cabeca', stag: 0.9, down: 1, push: 0.5, drive: dr(0.2, 2.8, 0.4), cut: 0.75, clip: 'cb-machado-p' }) },
    clava: { l: [M({ dur: 0.7, hit: 0.46, arc: 100, dmg: 1, fol: 11, zone: 'cabeca', stag: 0.5, push: 0.25, drive: dr(0.3, 2, 0.55), clip: 'cb-machado-1' }), M({ dur: 0.8, hit: 0.46, arc: 120, dmg: 1.2, fol: 13, stag: 0.55, push: 0.25, drive: dr(0.3, 2, 0.55), clip: 'cb-machado-2' })],
      p: M({ dur: 0.9, hit: 0.32, arc: 50, dmg: 2.5, fol: 24, zone: 'cabeca', stag: 1, down: 1, push: 0.6, drive: dr(0.2, 2.8, 0.4), cut: 0.75, clip: 'cb-machado-p' }) },
    lanca: { l: [M({ dur: 0.62, hit: 0.45, arc: 20, dmg: 1, fol: 10, drive: dr(0.3, 2.4, 0.55), clip: 'cb-lanca-1' }), M({ dur: 0.66, hit: 0.45, arc: 20, dmg: 1.05, fol: 10, drive: dr(0.3, 2.4, 0.55), clip: 'cb-lanca-2' })],
      p: M({ dur: 0.85, hit: 0.32, arc: 18, r: 1.1, dmg: 2.2, fol: 22, stag: 0.8, down: 1, push: 0.45, drive: [[0, 0], [0.16, 5.2], [0.34, 3.4], [0.5, 0], [1, 0]], cut: 0.72, clip: 'cb-lanca-p' }) },
    duas: { l: [M({ dur: 0.9, hit: 0.5, arc: 130, dmg: 1, fol: 15, zone: 'cabeca', stag: 0.55, push: 0.25, drive: dr(0.3, 1.8, 0.6), clip: 'cb-duas-1' }), M({ dur: 0.95, hit: 0.5, arc: 140, dmg: 1.15, fol: 16, stag: 0.6, push: 0.3, drive: dr(0.3, 1.8, 0.6), clip: 'cb-duas-2' })],
      p: M({ dur: 1, hit: 0.34, arc: 70, dmg: 2.4, fol: 28, zone: 'cabeca', stag: 1, down: 1, push: 0.6, drive: dr(0.22, 2.6, 0.42), cut: 0.75, clip: 'cb-duas-p' }) },
  };
  Cb.ARM = 0.5; // (metres from the body's middle to where a fist lands: the shoulder and the arm)
  Cb.CHARGE = 0.9; // (seconds of the body the heavy blow charges at most; its charge is 0..1)
  Cb.HOLD = 0.2; // (seconds the key is held before a light blow becomes the heavy one charging)
  Cb.chargeMul = k => 0.75 + 0.5 * G.clamp(k || 0, 0, 1);
  // (the strength of a body behind a blow: the young and the old weaker, a lost arm, a fever)
  const strength = v => (v.age < 14 ? 0.45 : v.age < 16 ? 0.7 : v.age >= 70 ? 0.6 : v.age >= 62 ? 0.75 : 1) * (v.lost && (v.lost.armL || v.lost.armR) ? 0.6 : 1) * (v.sick > 0 ? 0.8 : 1);
  Cb.strength = strength;
  // what a person fights with now, from what they hold (G.Inv.held: their things, or their trade's kit): { key, cls, dano,
  // alcance, ritmo, mat, two, bow (the bow in a hand), shield (in the other hand), cabeca, corpo (what they wear) }. Pure
  Cb.weapon = function (v) {
    const h = G.Inv.held(v); const cls = Cb.classOf(h.mao); const d = cls !== 'punho' ? It.def(h.mao) : null;
    const isBow = k => !!(k && It.def(k) && It.def(k).kind === 'arco');
    const shield = h.outra && It.def(h.outra) && It.def(h.outra).tipo === 'escudo' ? h.outra : null;
    return { key: d ? d.id : null, cls, dano: d ? d.dano : FIST.dano, alcance: d ? d.alcance : FIST.alcance, ritmo: d ? d.ritmo || 1 : 0.5, mat: d ? d.mat : null,
      two: !!(d && d.maos >= 2), bow: isBow(h.outra) ? h.outra : isBow(h.mao) ? h.mao : null, shield, cabeca: h.cabeca, corpo: h.corpo };
  };
  Cb.move = (cls, i) => { const T = MOVES[cls] || MOVES.punho; return i < 0 ? T.p : T.l[Math.max(0, i) % T.l.length]; };
  Cb.chain = cls => (MOVES[cls] || MOVES.punho).l.length;
  Cb.reachOf = (w, mv) => Cb.ARM + w.alcance * (mv.r || 1); // (metres)
  // the measure of a blow before what the one struck wears and holds: the weapon's (its material in it), the blow's, the charge
  Cb.dealt = (v, w, mv, k) => w.dano * mv.dmg * (mv === (MOVES[w.cls] || MOVES.punho).p ? Cb.chargeMul(k) : 1) * strength(v);
  // how much what one wears keeps of a blow at a zone: the piece at that zone, and a little of the other (0..0.7)
  Cb.armour = function (held, zone) {
    const p = k => (k ? It.def(k).protecao || 0 : 0);
    const a = zone === 'cabeca' ? p(held.cabeca) + p(held.corpo) * 0.25 : p(held.corpo) + p(held.cabeca) * 0.25;
    return G.clamp(a, 0, 0.7);
  };
  // how much of a blow a guard takes: the shield's measure (its material in it), or the weapon held across — the bare arms little
  const WGUARD = { punho: 0.2, faca: 0.25, espada: 0.45, machado: 0.35, clava: 0.35, lanca: 0.4, duas: 0.4 };
  Cb.guardOf = function (w) { if (w.shield) return It.def(w.shield).bloqueio || 0.5; const m = w.mat && It.MATS[w.mat]; return G.clamp((WGUARD[w.cls] || 0.2) * (m ? m.bloqueio : 1), 0, 0.85); };

  // ------------------------------ the bodies ------------------------------
  // a person's capsule: upright on their place, of the radius of a body (metres) and as tall as they stand (the young smaller)
  const sizeOf = o => (o.age >= 16 ? 1 : o.age < 2 ? 0.45 : 0.45 + 0.55 * (o.age - 2) / 14);
  Cb.capsule = o => ({ x: o.x, y: o.y, r: 0.3 * Math.max(0.6, sizeOf(o)), h: 1.75 * sizeOf(o) });
  const reachable = o => !(o.inside || o.aboard || o.held || o.air || o.ug || (o.task && o.task.type === 'swim'));
  // what a blow from v, facing yaw, reaches: [{ o (person) | a (beast), d (metres to its skin), ang }], the nearest first — the
  // people by their capsules, the beasts by their footprints (G.Corpo), inside the arc the blow sweeps, nothing through a wall
  Cb.targets = function (v, yaw, reach, arc) {
    const S = G.S; const out = []; const half = arc * D2R / 2; const Rt = (reach + 2.5) / TILE;
    const see = (x, y, r) => { const dx = (x - v.x) * TILE, dy = (y - v.y) * TILE; const d = Math.hypot(dx, dy); if (d - r > reach) return null; const ang = Math.abs(wrap(Math.atan2(dy, dx) - yaw)); const pad = d > r ? Math.asin(Math.min(1, r / d)) : Math.PI; if (ang > half + pad) return null; return { d: Math.max(0, d - r), ang }; };
    // (everyone near, by where they are this instant — not the beasts' grid of a quarter of a second: T-1350)
    const near = fn => { for (const o of S.villagers.values()) if (Math.abs(o.x - v.x) <= Rt && Math.abs(o.y - v.y) <= Rt) fn(o); };
    near(o => { if (o === v || o.id === v.id || !alive(o) || !reachable(o)) return; const c = Cb.capsule(o); const s = see(c.x, c.y, c.r); if (s && W.losClear(v.x, v.y, o.x, o.y)) out.push({ o, d: s.d, ang: s.ang }); });
    if (G.Corpo) for (const a of S.animals.values()) {
      if (Math.abs(a.x - v.x) > Rt + 1 || Math.abs(a.y - v.y) > Rt + 1 || a.dead || a.held || a.air || (a.z || 0) > 0.6) continue; const f = G.Corpo.foot(a); if (!f) continue;
      const q = G.Corpo.near(f, v.x, v.y); const s = see(q[0], q[1], f[4] * TILE); if (s && W.losClear(v.x, v.y, a.x, a.y)) out.push({ a, d: s.d, ang: s.ang });
    }
    return out.sort((p, q) => p.d - q.d || p.ang - q.ang || (p.o ? p.o.id : p.a.id) - (q.o ? q.o.id : q.a.id));
  };

  // ------------------------------ the record (S.combate: the duel, the arrows in the air, the brawls) ------------------------------
  const st = () => G.S.combate || (G.S.combate = { duel: null, fl: [], br: [] });
  Cb.state = () => G.S.combate || null;
  // what the frame hears of the world's answers (only the moment: never saved) — the blows given and taken, the guard's work
  let events = [], evN = 0, guard = null, lastRaise = -1e9, riposte = null;
  G.worldHooks.push(() => { events = []; evN = 0; guard = null; lastRaise = -1e9; riposte = null; stats = fresh(); });
  const fresh = () => ({ strikes: 0, hits: 0, beasts: 0, blocked: 0, parried: 0, dodged: 0, guarded: 0, shots: 0, arrowsHit: 0, arrowsFell: 0, crimes: 0, duels: 0, refused: 0, outside: 0 });
  let stats = fresh();
  Cb.stats = () => Object.assign({}, stats);
  const note = (kind, o) => { evN++; events.push(Object.assign({ n: evN, t: G.S.clock, kind }, o)); if (events.length > 24) events.shift(); };
  Cb.events = () => events;
  Cb.bodyTime = () => (G.Possess && G.Possess.time ? G.Possess.time() : 1); // (world seconds a second of the body lasts)
  const isBody = o => !!(o && G.S.avatar && G.S.avatar.id === o.id && G.S.villagers.has(o.id));
  Cb.isBody = isBody;
  // (the doors that change the world, only in its step: asked from outside — a screen — they are refused, and counted)
  const inStep = () => { if (G.inSim > 0) return true; stats.outside++; return false; };
  const NO = { ok: false, why: 'Agora não.' };

  // ------------------------------ a blow of the body (in the world's step) ------------------------------
  // v strikes with blow i of its way of fighting (-1: the heavy one, k its charge), facing yaw (radians, the body's: the
  // controller's at the contact). By the world's truth of what v holds now, not what the hands thought. → { ok, hits: [{ id,
  // beast, amt, killed, blocked, guard, down }], miss, cls }
  Cb.strike = function (v, sp) {
    if (!inStep()) return NO;
    if (!alive(v) || v.downT > G.S.clock || v.captive || v.jail) return { ok: false, why: '' };
    const w = Cb.weapon(v); const i = sp && Number.isFinite(sp.i) ? sp.i : 0; const mv = Cb.move(w.cls, i);
    const yaw = sp && Number.isFinite(sp.yaw) ? sp.yaw : Math.atan2(v.fy || 0, v.fx || 1);
    G.faceTo(v, Math.cos(yaw), Math.sin(yaw));
    const reach = Cb.reachOf(w, mv); let T = Cb.targets(v, yaw, reach, mv.arc);
    // (a thrust stops at the first body; a sweep goes on through two more)
    T = T.slice(0, mv.arc <= 40 ? 1 : 3);
    stats.strikes++;
    const base = Cb.dealt(v, w, mv, sp && sp.k);
    const hits = [];
    for (const t of T) {
      if (t.a) { const r = maul(v, t.a, base); hits.push(r); continue; }
      const k = riposte && riposte.id === t.o.id && G.S.clock <= riposte.until ? 1.5 : 1; if (k > 1) riposte = null;
      hits.push(wound(v, t.o, base * k, mv, w, yaw));
    }
    if (!hits.length) G.Audio && G.Audio.at(v.x, v.y, 'swish');
    note('golpe', { by: v.id, cls: w.cls, i, hits: hits.length, x: r3(v.x), y: r3(v.y), yaw: r3(yaw) });
    return { ok: true, hits, miss: !hits.length, cls: w.cls };
  };
  // a blow on a beast: the world's door, as a spear's
  function maul(v, a, amt) {
    const S = G.S; const hp0 = a.hp; amt = r2(amt);
    G.Animals.damage(a, amt, v); stats.beasts++; stats.hits++;
    G.Audio && G.Audio.at(a.x, a.y, 'hit');
    const killed = !!a.dead;
    note('acerto', { by: v.id, beast: 1, id: a.id, kind: a.kind, amt, killed: killed ? 1 : 0, x: r3(a.x), y: r3(a.y) });
    void S; void hp0;
    return { id: a.id, beast: 1, amt, killed };
  }
  // a blow on a person: what they hold and wear takes its share — a shield they raise against it (the world's chance: one in a
  // fight facing the blow), the helmet or the cuirass at the zone —, the world's door deals the rest; then the jolt, the throw,
  // the answer, the crime
  const FIGHTING = { combat: 1, band: 1, army: 1, riotguard: 1, defend: 1, muster: 1 };
  function wound(v, o, amt, mv, w, yaw, how) {
    const S = G.S; const h = G.Inv.held(o); const ow = Cb.weapon(o);
    const duel = Cb.dueling(v, o);
    let blocked = 0;
    // (one fighting, awake, on their feet, facing the one who strikes: the guard may come up — a shield often, a blade now and
    // then; a heavy blow beats it half the time)
    const facing = Math.cos(Math.atan2(v.y - o.y, v.x - o.x) - Math.atan2(o.fy || 0, o.fx || 1)) > 0.34;
    const fights = !!(o.task && FIGHTING[o.task.type]) || o.role === 'guerreiro' || duel;
    if (fights && facing && !o.sleeping && !(o.downT > S.clock) && !(o.stagT > S.clock) && !isBody(o)) {
      const ch = (ow.shield ? 0.4 : ow.cls !== 'punho' ? 0.15 : 0) * (mv && mv.down ? 0.5 : 1) * (how === 'arrow' && !ow.shield ? 0 : 1);
      if (ch > 0 && G.R() < ch) { blocked = Cb.guardOf(ow); amt *= 1 - blocked; stats.blocked++; G.Carnage && G.Carnage.onParry(v, o); }
    }
    const zone = mv ? mv.zone : 'corpo';
    amt = r2(amt * (1 - Cb.armour(h, zone)));
    // (a duel is fought to the yielding: the blow that would take one past it takes them only to it)
    if (duel) amt = Math.min(amt, Math.max(0, o.hp - Cb.YIELD + 0.5));
    const cause = how === 'arrow' ? 'arrow' : G.Fac.atWar(fid(v), fid(o)) ? 'war' : 'coup';
    if (amt > 0) G.Vg.damage(o, amt, cause, false, v.id);
    const killed = !alive(o);
    stats.hits++;
    if (!killed) {
      o.hurt = 0.3;
      if (amt > 0) G.FX && G.FX.blood(o.x, o.y);
      G.Audio && G.Audio.at(o.x, o.y, blocked ? 'clang' : 'hit');
      // the jolt: pushed back along the blow, a moment unsteady (seconds of the body, on the world's clock); a heavy blow throws
      // down one who did not block it
      const T = Cb.bodyTime(); const ux = Math.cos(yaw), uy = Math.sin(yaw);
      const push = (mv ? mv.push : 0.15) * (blocked ? 0.4 : 1) / TILE; const nx = o.x + ux * push, ny = o.y + uy * push; if (W.walkableXY(nx, ny)) { o.x = nx; o.y = ny; }
      o.stagT = Math.max(o.stagT || 0, S.clock + (mv ? mv.stag : 0.3) * (blocked ? 0.5 : 1) * T);
      const down = !!(mv && mv.down && !blocked && (amt >= 18 || o.hp < 45));
      if (down) o.downT = Math.max(o.downT || 0, S.clock + 1.4 * T);
      if (o.task && o.task.cd !== undefined) o.task.cd = Math.max(o.task.cd, (mv ? mv.stag : 0.3) * T); // (a jolted one strikes back later)
      answer(o, v, duel);
    } else {
      v.kills = (v.kills || 0) + 1; G.Audio && G.Audio.at(o.x, o.y, 'hit');
      // (a death at peace is told — the world's own words for it say nothing of a violent death, and a murder is no battle)
      if (cause === 'coup') { const set = S.settlements.get(o.set); G.Village.log(`${o.name}${set ? ' de ' + set.name : ''} foi ${o.g === 'f' ? 'morta' : 'morto'} por ${v.name}${how === 'arrow' ? ', com uma flecha' : ''}.`, 'skull', o.x, o.y); }
    }
    // (a blow at one's own people, outside a duel: a crime, seen by whoever is near)
    if (!duel && fid(v) === fid(o) && G.Crime && G.Crime.assault) { G.Crime.assault(v, o, killed); stats.crimes++; }
    note('acerto', { by: v.id, id: o.id, amt, killed: killed ? 1 : 0, blocked: blocked ? r2(blocked) : 0, arrow: how === 'arrow' ? 1 : 0, x: r3(o.x), y: r3(o.y) });
    if (duel && !killed && o.hp <= Cb.YIELD + 0.6) endDuel(o.id, 'rendeu');
    return { id: o.id, amt, killed, blocked: blocked ? r2(blocked) : 0, down: !killed && o.downT > S.clock ? 1 : 0 };
  }
  Cb.wound = (v, o, amt, mv, how) => (inStep() ? wound(v, o, amt, mv || null, Cb.weapon(v), Math.atan2(o.y - v.y, o.x - v.x), how) : NO);
  // the world's answer of one struck: the duel's own; at war, the war's (War.react: fight or flee); one of one's own, or a
  // stranger at peace — the brave stand and fight back (a brawl, kept), the others run
  function answer(o, v, duel) {
    if (duel || isBody(o)) return;
    if (G.Fac.atWar(fid(v), fid(o)) || (o.task && FIGHTING[o.task.type])) { G.War.react(o, v); return; }
    const brave = o.age >= 15 && o.age < 62 && o.hp > 35 && !o.captive && (o.role === 'guerreiro' || (G.Crime && G.Crime.law(o)) || o.courage > 0.55 || (o.traits || []).includes('Corajoso'));
    if (brave) { if (!(o.task && o.task.type === 'combat' && o.task.id === v.id)) { G.Vg.setTask(o, { type: 'combat', id: v.id, pri: 4.2, def: true, any: true, kind: 'combat', brawl: 1 }); const B = st().br; if (!B.some(q => q.id === o.id)) B.push({ id: o.id, foe: v.id, t: r2(G.S.clock) }); } }
    else G.Vg.fleeFrom(o, v.x, v.y, 7, 'war');
  }

  // ------------------------------ the guard of the body ------------------------------
  // (raised and let down by the hands, in the world's step: the moment it went up is the parry's)
  Cb.PARRY = 0.22; // (seconds of the body after the guard goes up in which a blow is turned aside)
  Cb.SPAM = 0.6; // (seconds of the body between two raisings for the second to parry: no parry from a guard flicked up and down)
  Cb.guard = function (v, on) {
    if (!inStep()) return NO;
    if (!isBody(v)) return { ok: false, why: '' };
    const S = G.S; const T = Cb.bodyTime();
    if (on) { if (!guard) { guard = { id: v.id, t0: S.clock, parry: S.clock - lastRaise >= Cb.SPAM * T }; lastRaise = S.clock; } }
    else guard = null;
    return { ok: true };
  };
  Cb.guarding = () => (guard ? { id: guard.id, t0: guard.t0, parry: guard.parry } : null);
  // the dodge's window in which nothing lands (D-363's dodges, by the share of their time): the roll, the step aside, the step back
  Cb.IFRAME = { rolar: [0.06, 0.62], passo: [0.04, 0.58], recuo: [0.04, 0.52] };
  const BLOCKABLE = { war: 1, arrow: 1, beast: 1, wolf: 1, boar: 1, massacre: 1, coup: 1, riot: 1, brawl: 1 };
  // what of a blow reaches the body — asked by possess.js before the world deals it (Vg.damage): the dodge in its window lets
  // nothing in; the guard raised in time against the blow turns it aside (the one who struck jolted, open to a riposte); the guard
  // held takes the shield's or the weapon's share (arrows only the shield) — what the breath pays for is the frame's. And a duel
  // is fought to the yielding. Returns what is left (0: nothing)
  Cb.shield = function (v, amt, cause, by) {
    if (!(amt > 0) || !isBody(v) || !BLOCKABLE[cause]) return amt;
    const S = G.S; const T = Cb.bodyTime();
    const src = srcOf(v, cause, by);
    const dg = G.Avatar && G.Avatar.dodging ? G.Avatar.dodging() : null; const win = dg && Cb.IFRAME[dg.kind];
    if (win && dg.u >= win[0] && dg.u <= win[1]) { stats.dodged++; note('esquiva', { amt: r2(amt), cause, from: src ? src.id : 0 }); return 0; }
    if (guard && guard.id === v.id && src) {
      const yaw = G.Avatar && G.Avatar.state && G.Avatar.state() ? G.Avatar.state().yaw : Math.atan2(v.fy || 0, v.fx || 1);
      const w = Cb.weapon(v); const half = (w.shield ? 85 : 70) * D2R;
      const off = Math.abs(wrap(Math.atan2(src.y - v.y, src.x - v.x) - yaw));
      if (off <= half && (cause !== 'arrow' || w.shield)) {
        if (guard.parry && S.clock - guard.t0 <= Cb.PARRY * T && cause !== 'arrow' && !src.giant) { // (a giant's charge is no blade to turn aside)
          stats.parried++; parried(v, src);
          note('aparo', { amt: r2(amt), cause, from: src.id, beast: src.beast ? 1 : 0, x: r3(src.x), y: r3(src.y) });
          return 0;
        }
        const g = Cb.guardOf(w) * (src.giant ? 0.5 : 1); const left = r2(amt * (1 - g));
        stats.guarded++; G.Audio && G.Audio.at(v.x, v.y, w.shield || w.cls !== 'punho' ? 'clang' : 'thud');
        note('bloqueio', { amt: r2(amt), left, share: r2(g), cost: r2(amt * (w.shield ? 0.55 : 0.85) + 2), cause, from: src.id, giant: src.giant ? 1 : 0, x: r3((v.x + src.x) / 2), y: r3((v.y + src.y) / 2) });
        amt = left;
      }
    }
    const d = st().duel; if (d && d.a === v.id && src && src.id === d.o && !src.beast) { amt = Math.min(amt, Math.max(0, v.hp - Cb.YIELD + 0.5)); if (v.hp - amt <= Cb.YIELD + 0.6) endDuel(v.id, 'rendeu'); }
    return amt;
  };
  // (where a blow at the body came from: the one who struck, the beast that bit)
  function srcOf(v, cause, by) {
    const S = G.S;
    if ((cause === 'beast' || cause === 'wolf' || cause === 'boar') && v.lastBeastId) { const a = S.animals.get(v.lastBeastId); if (a) return { x: a.x, y: a.y, id: a.id, beast: 1, giant: G.Corpo && G.Corpo.GIANT.has(a.kind) }; }
    if (by) { const o = S.villagers.get(by); if (o) return { x: o.x, y: o.y, id: o.id, beast: 0, o }; }
    return null;
  }
  // a parry: the one who struck is thrown off — jolted, their next blow later — and open to the riposte
  function parried(v, src) {
    const S = G.S; const T = Cb.bodyTime();
    G.Audio && G.Audio.at(v.x, v.y, 'clang', true);
    if (src.o) { const o = src.o; o.stagT = Math.max(o.stagT || 0, S.clock + 1.1 * T); if (o.task && o.task.cd !== undefined) o.task.cd = Math.max(o.task.cd, 1.1 * T); riposte = { id: o.id, until: S.clock + 1.3 * T }; }
  }

  // ------------------------------ the one who fights the body fights on its clock, by its body ------------------------------
  // (how near one must come to strike o: the body the god lives by the bodies — the striker's weapon from its shoulder to the skin of
  // the body (tiles) —; anyone else at the world's own distance d0, as always: the same comparison, the same world — D-331's rule
  // for the beasts, now for the people)
  Cb.reach = function (v, o, d0) { if (!isBody(o) || !v) return d0; const w = Cb.weapon(v); return Math.max(0.2, (Cb.reachOf(w, Cb.move(w.cls, 0)) + Cb.capsule(o).r * 0.6) / TILE); };
  // ------------------------------ the one who fights the body fights on its clock ------------------------------
  // (war.js sets the next blow's wait just before each blow, by its own draw: the same draw, the wait put in the body's seconds
  // when the foe is the body — a duel at three times the body's pace was no fight. Nobody else's fight changes)
  if (G.War && G.War.strike) { const strike0 = G.War.strike; G.War.strike = function (v, o, t) { if (t && t.cd !== undefined && isBody(o)) t.cd *= Cb.bodyTime(); return strike0.apply(this, arguments); }; }
  if (G.Siege && G.Siege.shoot) { const shoot0 = G.Siege.shoot; G.Siege.shoot = function (v, o, t) { if (t && t.cd !== undefined && isBody(o)) t.cd *= Cb.bodyTime(); return shoot0.apply(this, arguments); }; }

  // ------------------------------ the duel ------------------------------
  Cb.YIELD = 25; // (the life at which one yields a duel)
  Cb.dueling = (v, o) => { const d = G.S && G.S.combate && G.S.combate.duel; return !!(d && v && o && ((d.a === v.id && d.o === o.id) || (d.a === o.id && d.o === v.id))); };
  Cb.duel = () => { const d = G.S && G.S.combate && G.S.combate.duel; return d ? Object.assign({}, d) : null; };
  // would o fight the body in a duel: who they are — the warrior and the brave take it, the timid, the old, the young, the sick,
  // the one at an errand that cannot wait refuse — and a little of their mood of the day (their id and the day: no chance drawn).
  // → { ok, why, say }
  Cb.wouldDuel = function (v, o) {
    const S = G.S;
    if (!alive(o) || !reachable(o)) return { ok: false, why: 'Não está mais aqui.' };
    if (S.combate && S.combate.duel) return { ok: false, why: 'Já há um duelo.' };
    if (o.sleeping) return { ok: false, why: 'Está dormindo.' };
    if (G.Fac.atWar(fid(v), fid(o))) return { ok: false, why: 'Os povos de vocês estão em guerra: isso não é duelo.' };
    if (o.age < 16) return { ok: false, why: 'Uma criança não duela.', say: 'Eu? Não!' };
    if (o.captive || o.jail) return { ok: false, why: 'Não pode lutar agora.' };
    if (o.age >= 62 || o.sick > 0 || o.hp < 60 || (o.lost && (o.lost.armL || o.lost.armR))) return { ok: false, why: 'Recusou: não está em condições.', say: 'Não estou em condições de lutar.' };
    if ((o.task && (o.task.pri || 0) >= 3) || G.Vg.handsBusy(o)) return { ok: false, why: 'Está ocupado com algo que não espera.', say: 'Agora não posso.' };
    const tr = o.traits || [];
    let s = (o.courage || 0) + (o.role === 'guerreiro' ? 0.4 : o.role === 'cacador' || o.role === 'vigia' ? 0.2 : 0) + (tr.includes('Corajoso') ? 0.25 : 0) - (tr.includes('Covarde') ? 0.45 : 0)
      + Math.min(0.2, (o.kills || 0) * 0.05) + (G.hash(o.id * 31 + v.id * 7 + S.day) - 0.5) * 0.3;
    if (G.Possess.kin && G.Possess.kin(v, o)) s -= 0.3; // (one's own kin take it less: it is a game between them)
    if (s >= 0.72) return { ok: true, say: o.role === 'guerreiro' ? 'Aceito. Em guarda!' : 'Está bem — até um de nós se render.' };
    return { ok: false, why: 'Recusou o desafio.', say: s > 0.45 ? 'Hoje não.' : 'Não vou lutar com você.' };
  };
  // the challenge, in the world's step: taken — the other comes at the body to the yielding, and nobody else steps in (war.js's
  // dueling) — or refused, in their own words
  Cb.challenge = function (v, o) {
    if (!inStep()) return NO;
    if (!isBody(v)) return { ok: false, why: '' };
    const r = Cb.wouldDuel(v, o); const S = G.S;
    G.faceTo(o, v.x - o.x, v.y - o.y);
    if (r.say && G.Talk) G.Talk.say(o, r.say, { dur: 3.5 });
    if (!r.ok) { stats.refused++; if (alive(o)) G.Vg.emote(o, 'fear', 1.6); note('recusa', { id: o.id }); return { ok: false, why: r.why }; }
    st().duel = { a: v.id, o: o.id, t0: r2(S.clock), x: r2(o.x), y: r2(o.y) };
    fightBody(o, v);
    G.Vg.emote(o, 'angry', 2);
    stats.duels++; note('duelo', { id: o.id });
    return { ok: true };
  };
  function fightBody(o, v) { G.Vg.setTask(o, { type: 'combat', id: v.id, pri: 4.6, def: true, any: true, kind: 'combat', duel: 1 }); }
  // the end of a duel: the one who yielded, or the duel let go (gone, too far, the body given back); the other leaves the fight,
  // and both remember it
  Cb.DUEL_FAR = 10; // (tiles: a duel whose two are farther apart than this is over)
  function endDuel(loserId, how) {
    const S = G.S; const d = S.combate && S.combate.duel; if (!d) return;
    S.combate.duel = null;
    const a = S.villagers.get(d.a), o = S.villagers.get(d.o);
    if (o && o.task && o.task.type === 'combat' && o.task.duel) G.Vg.endTask(o);
    const won = how === 'rendeu' ? (loserId === d.o ? a : o) : null, lost = how === 'rendeu' ? (loserId === d.o ? o : a) : null;
    if (won && lost) {
      G.Vg.emote(won, 'joy', 2.5); G.Vg.emote(lost, 'sad', 2.5);
      if (G.Talk && o) G.Talk.say(o, lost === o ? 'Eu me rendo!' : 'Você se rendeu. Bela luta.', { dur: 3 });
      if (G.Life) { G.Life.bio(won, 'note', `Venceu ${lost.name} num duelo.`, 'Venci um duelo, e o outro se rendeu'); G.Life.bio(lost, 'note', `Rendeu-se a ${won.name} num duelo.`, null); }
      if (lost === a || won === a) G.Possess.deed && G.Possess.deed('duelo');
    }
    note('fim', { how, won: won ? won.id : 0, lost: lost ? lost.id : 0 });
  }
  Cb.endDuel = (loserId, how) => { if (inStep()) endDuel(loserId, how || 'largou'); };

  // ------------------------------ the arrows in the air (the Depot's holder 'a:') ------------------------------
  // An arrow loosed is one of the shooter's, out of the bag into the air ('flecha', the ledger), flying by its speed and its
  // fall; it strikes the first body it meets — and stays in it ('flecha-cravada') — or falls where it falls, to be picked up
  // ('flecha-caiu'). Its path in metres (X east, Y up, Z south: the 3D's) and metres a second of the body
  const fl = () => st().fl;
  G.Depot.addKind('a', {
    obj: id => (G.S && G.S.combate ? G.S.combate.fl.find(f => f.id === id) : null) || null,
    get: (f, k) => (f.k === k ? f.n : 0),
    room: f => (f.n > 0 ? 0 : 1),
    take: (f, k, n) => { f.n = r4(f.n - n); return { k, n }; },
    put: (f, rec) => { f.k = rec.k; f.n = r4((f.n || 0) + rec.n); },
    list: f => (f.n > 0 ? { [f.k]: f.n } : {}),
    owner: f => ({ fac: f.fac || 0, who: f.by }),
    all: () => (G.S && G.S.combate ? G.S.combate.fl : []),
  });
  Cb.SPEED = 46; // (metres a second of the body, a bow fully drawn: half drawn, two thirds of it)
  Cb.GRAV = 9.8; Cb.FLY = 4; // (the fall; and the seconds an arrow flies at most)
  // the best arrow a person has in their bag (the iron first), or null
  Cb.arrowOf = function (v) { for (const m of ['ferro', 'bronze', 'pedra']) { const k = It.keyOf('flecha', m); if (G.Inv.count(v, k) >= 1) return k; } return null; };
  Cb.arrows = v => ['ferro', 'bronze', 'pedra'].reduce((n, m) => n + G.Inv.count(v, It.keyOf('flecha', m)), 0);
  // the shot, in the world's step: from (metres) along dir (a unit vector), the draw k (0..1)
  Cb.shoot = function (v, sp) {
    if (!inStep()) return NO;
    if (!alive(v) || !sp || !Array.isArray(sp.from) || !Array.isArray(sp.dir)) return { ok: false, why: '' };
    const w = Cb.weapon(v); if (!w.bow) return { ok: false, why: 'Sem arco na mão.' };
    const key = Cb.arrowOf(v); if (!key) return { ok: false, why: 'Sem flechas na mochila.' };
    const S = G.S; const k = G.clamp(sp.k || 0, 0, 1); const n = Math.hypot(sp.dir[0], sp.dir[1], sp.dir[2]) || 1; const s = Cb.SPEED * (0.55 + 0.45 * k);
    const f = { id: S.nextId++, by: v.id, fac: fid(v), k: key, n: 0, bow: w.bow, kk: r3(k), X: r3(sp.from[0]), Y: r3(sp.from[1]), Z: r3(sp.from[2]), vx: r3(sp.dir[0] / n * s), vy: r3(sp.dir[1] / n * s), vz: r3(sp.dir[2] / n * s), t: 0 };
    fl().push(f);
    const r = G.Depot.move('m:' + v.id, 'a:' + f.id, key, 1, { code: 'flecha', by: v.id });
    if (!r.ok) { fl().splice(fl().indexOf(f), 1); return { ok: false, why: 'Sem flechas na mochila.' }; }
    stats.shots++; G.Audio && G.Audio.at(v.x, v.y, 'arrow');
    note('tiro', { by: v.id, id: f.id, k: f.kk });
    return { ok: true, id: f.id, key };
  };
  // the arrows' flight, a world's step of dt (seconds of the world: the body's are dt / bodyTime)
  const HM = () => (G.Possess && G.Possess.hm ? G.Possess.hm() : 1.5); // (metres a unit of the world's height: the flight over the ground)
  function groundM(X, Z) { const x = X / TILE, y = Z / TILE; return W.inb(x, y) ? W.groundH(x, y) * HM() : 0; }
  function flyStep(dt) {
    const L = fl(); if (!L.length) return;
    const S = G.S; const h = dt / Math.max(0.05, Cb.bodyTime());
    for (let i = L.length - 1; i >= 0; i--) {
      const f = L[i]; if (!(f.n > 0)) { L.splice(i, 1); continue; }
      const v = S.villagers.get(f.by) || null;
      // (who is near this step's flight — everyone where they are this instant)
      const sp = Math.hypot(f.vx, f.vy, f.vz) * h / TILE + 1.5, fx = f.X / TILE, fz = f.Z / TILE;
      NEAR.p.length = 0; NEAR.a.length = 0;
      for (const o of S.villagers.values()) if (Math.abs(o.x - fx) <= sp && Math.abs(o.y - fz) <= sp) NEAR.p.push(o);
      if (G.Corpo) for (const a of S.animals.values()) if (Math.abs(a.x - fx) <= sp + 1 && Math.abs(a.y - fz) <= sp + 1) NEAR.a.push(a);
      let left = h; let done = false;
      while (left > 1e-6 && !done) {
        const dt2 = Math.min(left, 0.3 / Math.max(1, Math.hypot(f.vx, f.vy, f.vz))); left -= dt2;
        const X0 = f.X, Y0 = f.Y, Z0 = f.Z;
        f.vy -= Cb.GRAV * dt2; f.X += f.vx * dt2; f.Y += f.vy * dt2; f.Z += f.vz * dt2; f.t += dt2;
        const hit = arrowHit(f, X0, Y0, Z0, v);
        if (hit) { done = true; arrowIn(f, hit, v); break; }
        const x = f.X / TILE, y = f.Z / TILE;
        if (!W.inb(x, y)) { done = true; arrowDown(f, X0, Z0); break; }
        if (f.Y <= groundM(f.X, f.Z) || solidAt(x, y, f.Y) || f.t > Cb.FLY) { done = true; arrowDown(f, X0, Z0); break; }
      }
      if (!done) { f.X = r3(f.X); f.Y = r3(f.Y); f.Z = r3(f.Z); f.vx = r3(f.vx); f.vy = r3(f.vy); f.vz = r3(f.vz); f.t = r3(f.t); }
    }
  }
  const NEAR = { p: [], a: [] };
  // (a wall, a building that blocks, the trunk of a tree: an arrow meeting them stops there)
  function solidAt(x, y, Y) {
    const S = G.S; const i = W.idx(x, y); const gy = W.groundH(x, y) * HM();
    if (S.wall[i] && Y < gy + 3.2) return true;
    const o = S.occ[i]; const b = o && S.buildings.get(o); if (b && b.blocks && Y < gy + 4) return true;
    return !!(S.treeAt && S.treeAt[i] && Y < gy + 2.5 && Math.hypot(x - (Math.floor(x) + 0.5), y - (Math.floor(y) + 0.5)) < 0.12);
  }
  // the first body the segment from (X0, Y0, Z0) to the arrow meets: a person's capsule, a beast's footprint
  function arrowHit(f, X0, Y0, Z0, shooter) {
    const S = G.S; let best = null, bt = 2;
    const seg = (ax, az, r, y0, y1, o, beast) => {
      // (the segment against an upright capsule: nearest approach on the ground plane, the height there)
      const dx = f.X - X0, dz = f.Z - Z0; const L2 = dx * dx + dz * dz; let t = L2 > 1e-9 ? ((ax - X0) * dx + (az - Z0) * dz) / L2 : 0; t = G.clamp(t, 0, 1);
      const px = X0 + dx * t, pz = Z0 + dz * t; if (Math.hypot(px - ax, pz - az) > r) return;
      const py = Y0 + (f.Y - Y0) * t; if (py < y0 - 0.05 || py > y1) return;
      if (t < bt) { bt = t; best = { o: beast ? null : o, a: beast ? o : null, Y: py, y0, y1 }; }
    };
    const x = f.X / TILE, y = f.Z / TILE;
    for (const o of NEAR.p) {
      if (!alive(o) || !reachable(o) || (shooter && o.id === shooter.id && f.t < 0.25)) continue;
      const c = Cb.capsule(o); const g = W.groundH(o.x, o.y) * HM(); seg(o.x * TILE, o.y * TILE, c.r, g, g + c.h, o, false);
    }
    for (const a of NEAR.a) {
      if (a.dead || a.held || a.air) continue; const fp = G.Corpo.foot(a); if (!fp) continue; const d = G.Corpo.DIM[a.kind]; const hh = (d ? d[3] : 1) * G.Corpo.scaleOf(a);
      const q = G.Corpo.near(fp, x, y); const g = W.groundH(a.x, a.y) * HM(); seg(q[0] * TILE, q[1] * TILE, fp[4] * TILE, g, g + hh, a, true);
    }
    return best;
  }
  // an arrow in a body: the bow's measure, the arrow's metal, the draw — less what the one struck wears and raises
  Cb.arrowDealt = (f, v) => { const b = It.def(f.bow) || It.def('arco'); const a = It.def(f.k); const m = a && It.MATS[a.mat]; return (b.dano || 9) * (m ? m.dano : 1) * (0.45 + 1.05 * (f.kk || 0)) * (v ? strength(v) : 1); };
  function arrowIn(f, hit, v) {
    const S = G.S; const amt = Cb.arrowDealt(f, v);
    const by = v || { id: f.by, x: f.X / TILE, y: f.Z / TILE, age: 30, fx: f.vx, fy: f.vz };
    if (hit.a) { if (v) maul(v, hit.a, amt); else G.Animals.damage(hit.a, r2(amt)); }
    else if (hit.o) {
      const o = hit.o; const head = hit.Y > hit.y0 + (hit.y1 - hit.y0) * 0.82;
      const mv = { zone: head ? 'cabeca' : 'corpo', stag: 0.4, push: 0.05, down: 0 };
      if (isBody(o)) G.Vg.damage(o, r2(amt * (head ? 1.4 : 1)), 'arrow', false, f.by);
      else if (v) wound(v, o, amt * (head ? 1.4 : 1), mv, Cb.weapon(v), Math.atan2(f.vz, f.vx), 'arrow');
      else G.Vg.damage(o, r2(amt), 'arrow', false, f.by);
    }
    stats.arrowsHit++;
    G.Depot.use('a:' + f.id, f.k, f.n, { code: 'flecha-cravada', by: f.by });
    note('flecha', { id: f.id, at: hit.a ? 'bicho' : 'pessoa', x: r3(f.X / TILE), y: r3(f.Z / TILE) });
    const L = fl(); const i = L.indexOf(f); if (i >= 0) L.splice(i, 1);
    void by; void S;
  }
  // an arrow down: where it fell, on ground one walks — else the last ground it flew over —, to be picked up
  function arrowDown(f, X0, Z0) {
    let x = f.X / TILE, y = f.Z / TILE;
    if (!W.inb(x, y) || !W.walkableXY(x, y)) { x = X0 / TILE; y = Z0 / TILE; }
    if (!W.inb(x, y) || !W.walkableXY(x, y)) { const p = W.nearestLand ? W.nearestLand(x, y, 3) : null; if (p) { x = p[0]; y = p[1]; } }
    const r = W.inb(x, y) && W.walkableXY(x, y) ? G.Depot.drop('a:' + f.id, f.k, f.n, x, y, { code: 'flecha-caiu', by: f.by, fac: 0 }) : { ok: false };
    if (!r.ok && f.n > 0) G.Depot.use('a:' + f.id, f.k, f.n, { code: 'flecha-perdida', by: f.by });
    stats.arrowsFell++;
    note('flecha', { id: f.id, at: 'chao', g: r.g || 0, x: r3(x), y: r3(y) });
    const L = fl(); const i = L.indexOf(f); if (i >= 0) L.splice(i, 1);
  }
  // (every arrow in the air down where it is — the body given back, a save opened with no body to fly them for)
  function allDown() { for (const f of fl().slice()) arrowDown(f, f.X, f.Z); }
  Cb.flights = () => (G.S && G.S.combate ? G.S.combate.fl : []);
  // (once a second of the world, with no body lived: nothing of the body's fight is left hanging — the arrows down, the duel over;
  // a body that the load did not take back, a body given back by a door that did not say it)
  G.Act.hooks.tick.push(() => { const c = G.S.combate; if (!c || G.S.avatar || (!c.fl.length && !c.duel)) return; allDown(); if (c.duel) endDuel(0, 'largou'); });

  // ------------------------------ the world's step for the fight of the body ------------------------------
  // (Possess.update, every step while a body is lived): the arrows fly; the duel and the brawls are kept to — over when one
  // yields, leaves, is too far; a brawler hurt runs
  Cb.step = function (v, dt) {
    const S = G.S; if (!S.combate) return;
    flyStep(dt);
    const d = S.combate.duel;
    if (d) {
      const a = S.villagers.get(d.a), o = S.villagers.get(d.o);
      if (!a || !o || !isBody(a)) endDuel(0, 'largou');
      else if (G.dist(a.x, a.y, o.x, o.y) > Cb.DUEL_FAR || o.inside || a.inside) endDuel(0, 'largou');
      else if (!(o.task && o.task.type === 'combat' && o.task.id === a.id)) fightBody(o, a); // (the fight's errand wears out — t.age — while the duel lasts)
    }
    const B = S.combate.br;
    for (let i = B.length - 1; i >= 0; i--) {
      const q = B[i]; const o = S.villagers.get(q.id), f = S.villagers.get(q.foe);
      const on = o && o.task && o.task.type === 'combat' && o.task.id === q.foe && o.task.brawl;
      if (!o || !f || !on) { B.splice(i, 1); continue; }
      if (o.hp < 35 || G.dist(o.x, o.y, f.x, f.y) > 9) { G.Vg.endTask(o); G.Vg.fleeFrom(o, f.x, f.y, 7, 'war'); B.splice(i, 1); }
    }
  };
  // the body given back — dead, taken, or the god gone home: its guard down, its arrows down where they are, its duel over
  Cb.onRelease = function () {
    guard = null; riposte = null;
    if (!G.S || !G.S.combate) return;
    G.inSim++; try { allDown(); const d = G.S.combate.duel; if (d) endDuel(0, 'largou'); } finally { G.inSim--; }
  };

  // ------------------------------ the save ------------------------------
  // (the record goes as it is; what lived on errands — the duel's fight, the brawls — is given back to them by setTask: a save
  // forgets everyone's errand, and a fight that would go on in the living world goes on — CLAUDE.md, «Saves»)
  G.saveHooks.push({
    save(out) { const c = G.S.combate; if (c) out.combate = { duel: c.duel ? Object.assign({}, c.duel) : null, fl: c.fl.map(f => Object.assign({}, f)), br: c.br.map(q => Object.assign({}, q)) }; },
    load(o) {
      const S = G.S; const c = o && o.combate;
      if (!c || typeof c !== 'object') { delete S.combate; return; }
      const num = x => typeof x === 'number' && isFinite(x);
      const d = c.duel && num(c.duel.a) && num(c.duel.o) ? { a: c.duel.a, o: c.duel.o, t0: num(c.duel.t0) ? c.duel.t0 : S.clock, x: num(c.duel.x) ? c.duel.x : 0, y: num(c.duel.y) ? c.duel.y : 0 } : null;
      const F = Array.isArray(c.fl) ? c.fl.filter(f => f && num(f.id) && typeof f.k === 'string' && It.THINGS.has(f.k) && num(f.n) && f.n > 0 && ['X', 'Y', 'Z', 'vx', 'vy', 'vz', 't'].every(k => num(f[k]))) : [];
      const Br = Array.isArray(c.br) ? c.br.filter(q => q && num(q.id) && num(q.foe)) : [];
      S.combate = { duel: d, fl: F, br: Br };
      // (the errands back: the duelist to the body, the brawlers to whom they fought)
      const dv = d && S.villagers.get(d.o), da = d && S.villagers.get(d.a);
      if (d && (!dv || !da)) S.combate.duel = null; else if (d) dv.task = { type: 'combat', id: d.a, pri: 4.6, def: true, any: true, kind: 'combat', duel: 1, age: 0, st: 0 };
      S.combate.br = Br.filter(q => { const b = S.villagers.get(q.id), f = S.villagers.get(q.foe); if (!b || !f) return false; b.task = { type: 'combat', id: q.foe, pri: 4.2, def: true, any: true, kind: 'combat', brawl: 1, age: 0, st: 0 }; return true; });
      // (arrows in the air with no body to fly them for — a save of one: the body comes back by possess.js's own hook, later —
      // down where they are; and a duel with no body to fight)
      const body = o.avatar && typeof o.avatar === 'object' ? o.avatar.id : 0;
      if (S.combate.duel && S.combate.duel.a !== body) S.combate.duel = null;
      if (!body && S.combate.fl.length) allDown();
    },
  });
})(window.G);
