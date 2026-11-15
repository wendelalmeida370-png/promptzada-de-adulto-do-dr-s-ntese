'use strict';
// ============================================================
//  Mente: the brain of the beasts (D-276, D-290 to D-296). What a
//  beast does when nothing has it — no fear, no prey in its jaws,
//  no fight — is the best of the options the modules register
//  here, by their scores: the brain's own (sleep, rest, the care
//  of the body and of the others, the herd, the mother and the
//  young, the heat and the courting, the rank, the territory), the
//  world's around (G.Meio: the water, the shade, the mud, the
//  shelter, the people), the hunt and the fight's (G.Luta).
//  An option (the registration is stable — the others code to it):
//    G.Mente.option(nome, {
//      who(a, sp)        — may this beast have it at all? (cheap)
//      score(a, sp, S)   — 0..1: how much it wants it now (1 urgent)
//      start(a, sp, S)   — takes it up: sets a.state = nome (and its
//                          targets, a.t); false: it could not
//      step(a, dt, sp, S)— the state, each step while it lasts
//                          (true while in it); with busy / hunting
//                          / up as in G.Animals.behave
//      passive: true     — a state where the body stays (asleep,
//                          lying, grooming): no step needed; the
//                          fear, the hunt and the fire are still
//                          looked at, and the idle clock runs it
//    })
//  An option with a step that is not busy is «mindful»: the beast
//  in it still looks round for danger and a meal before its step.
//  None above Mente.FLOOR: the old ways of animals.js (graze,
//  wander, follow the leader). Asked only when a beast's idle time
//  runs out — never each step; the option chosen last has a small
//  bonus (Mente.KEEP: a beast does not flip from one to another).
//  The mind (a.mind, numbers only, saved by Mente.pack): st stamina,
//  en energy, f fear, g anger, rk rank, sx sex, mom mother — and the
//  brain's own (see fresh()). The personality is a function of the
//  id (Mente.trait), never drawn nor saved. World module: chance
//  only from G.R, the same seed the same life.
// ============================================================
(function (G) {
  const Me = G.Mente = {};
  const A = G.Animals, W = G.W;
  const SP = A.DEF, GR = G.Gestos.GROUPS;
  Me.FLOOR = 0.25;
  Me.KEEP = 0.08;
  Me.list = []; Me.OPT = {};
  Me.option = function (name, def) {
    def.name = name;
    if (Me.OPT[name]) Me.list.splice(Me.list.indexOf(Me.OPT[name]), 1);
    Me.OPT[name] = def; Me.list.push(def);
    if (def.step) A.behave(name, def.step, Object.assign({ mindful: !def.busy }, def));
    if (def.passive) A.passive(name);
  };
  const set = l => new Set(l);
  const CAT = set(GR.cat), CANID = set(GR.canid), RUM = set(GR.ruminant), MAMMAL = set(GR.mammal);
  // the kinds led by their females (the old matriarch of the elephants, the queen of the hyenas' clan)
  const MATRI = set(['elephant', 'hyena']);
  // who eats whom (the threats of a kind, as sets)
  const EAT = {}; for (const k in A.eatenBy) EAT[k] = set(A.eatenBy[k]);
  Me.eats = (pred, prey) => !!(EAT[prey] && EAT[prey].has(pred));
  const r2 = x => Math.round(x * 100) / 100, r1 = x => Math.round(x * 10) / 10;
  const clamp01 = x => (x < 0 ? 0 : x > 1 ? 1 : x);
  const today = () => G.S.day + G.S.time;
  // the tallies of what happened (for the proofs and the inspector; diagnostics, not the world: a new world, a load, from zero)
  Me.tally = {};
  Me.count = (k, n) => { Me.tally[k] = (Me.tally[k] || 0) + (n || 1); };
  // (the females in heat now, an index the males look in: refilled from the minds within half a second of a load)
  const HEATS = new Map(), NONE = new Set();
  const heatAdd = a => { let l = HEATS.get(a.kind); if (!l) HEATS.set(a.kind, l = new Set()); l.add(a.id); };
  G.worldHooks.push(() => { Me.tally = {}; cA = null; cT = -1; HEATS.clear(); });

  // ------------------------------ the mind ------------------------------
  // who has a mind: the wild beasts of the ground and of the shore (the kept, the town's, the sky's and the sea's have none)
  Me.has = (a, sp) => !!sp && (sp.cls === 'land' || sp.cls === 'amph') && !sp.dom && !sp.town && !a.dom && !a.summoned && !a.raid;
  const sx0 = a => (G.hash(a.id * 7 + 3) < 0.5 ? 0 : 1);
  // the sex: the mind's, or the rule the views use for a beast with none (nothing ever flips)
  Me.sex = a => (a.mind ? a.mind.sx : sx0(a));
  // a.mind, the stable names (read by the views and the world around): st stamina 0..1 (1 fresh), en energy 0..1 (1 rested),
  // f fear 0..1, g anger 0..1, rk rank in its group 0..1 (1 the top), sx sex (0 female, 1 male), mom the mother's id (0 none);
  // the brain's own: wn the wins less the losses of its contests (−6..6), so the want of its own (0..1), es the seconds of heat
  // left, pg the seconds of the pregnancy left, pa the male (her suitor in heat, the father once pregnant), wo the female a male
  // courts, cw the one it means to challenge, fa its father, mk the clock of its last mark on the territory, pl the places it
  // remembers ([kind 1 rest/den, 2 a kill, 3 danger; x; y; the day]), ki the ones it remembers ([kind 1 enemy, 2 the one that beat
  // it, 3 its mate; id; the day]); lo the option it took last (in this life only: not saved)
  function fresh(a) {
    return { st: 1, en: r2(0.6 + 0.4 * G.hash(a.id * 5 + 1)), f: 0, g: 0, rk: 0.5, sx: sx0(a), mom: 0, wn: 0, so: 0, es: 0, pg: 0, pa: 0, wo: 0, cw: 0, fa: 0, mk: 0, pl: null, ki: null, lo: 0, vg: 0.85 + 0.3 * Me.trait(a, 'v') };
  }
  Me.m = a => a.mind || (a.mind = fresh(a));
  // the mind as the save keeps it: what is not its default, rounded (thousands of beasts are saved)
  const DEF0 = { st: 1, en: 1, f: 0, g: 0, rk: 0.5, mom: 0, wn: 0, so: 0, es: 0, pg: 0, pa: 0, wo: 0, cw: 0, fa: 0, mk: 0 };
  const IDS = { mom: 1, pa: 1, wo: 1, cw: 1, fa: 1 }, SECS = { es: 1, pg: 1, mk: 1 };
  Me.pack = function (a) {
    const m = a.mind; if (!m) return undefined; const o = {};
    for (const k in DEF0) { const v = m[k]; if (!Number.isFinite(v)) continue; const q = IDS[k] ? v : SECS[k] ? Math.round(v) : r2(v); if (q !== DEF0[k]) o[k] = q; }
    if (m.sx !== sx0(a)) o.sx = m.sx;
    if (m.pl && m.pl.length) o.pl = m.pl.map(p => [p[0], r1(p[1]), r1(p[2]), r2(p[3])]);
    if (m.ki && m.ki.length) o.ki = m.ki.map(p => [p[0], p[1], r2(p[2])]);
    return o;
  };
  // the mind back from the save (whole, every field), in place — a damaged one is a fresh one; an older save, none: made later
  const okPlace = p => Array.isArray(p) && p.length === 4 && p.every(Number.isFinite);
  const okKin = p => Array.isArray(p) && p.length === 3 && p.every(Number.isFinite);
  Me.unpack = function (a) {
    const p = a.mind; if (!p || typeof p !== 'object') { a.mind = null; return; }
    const m = fresh(a); m.en = 1;
    for (const k in DEF0) if (Number.isFinite(p[k])) m[k] = p[k];
    for (const k of ['st', 'en', 'f', 'g', 'rk', 'so']) m[k] = clamp01(m[k]);
    m.wn = Math.max(-6, Math.min(6, Math.round(m.wn))); for (const k of ['es', 'pg', 'mk']) m[k] = Math.max(0, m[k]);
    if (p.sx === 0 || p.sx === 1) m.sx = p.sx;
    m.pl = Array.isArray(p.pl) ? p.pl.filter(okPlace).slice(0, 3) : null; if (m.pl && !m.pl.length) m.pl = null;
    m.ki = Array.isArray(p.ki) ? p.ki.filter(okKin).slice(0, 3) : null; if (m.ki && !m.ki.length) m.ki = null;
    a.mind = m;
  };

  // ------------------------------ the personality ------------------------------
  // five traits, each the kind's own plus the one's (from its id: the same beast is the same through every save, nothing kept):
  // b bold, c curious, s sociable, g aggressive, v vigilant
  const TK = { b: 0, c: 1, s: 2, g: 3, v: 4 }; const BASE = {};
  function baseOf(k) {
    const sp = SP[k]; const pred = A.predator(k); const herd = sp.herd ? sp.herd[1] : 1;
    const b = sp.apex ? 0.78 : pred ? 0.6 : sp.defend ? 0.6 : Math.min(0.7, 0.28 + (sp.bold || 0));
    const c = k === 'monkey' ? 0.8 : CANID.has(k) ? 0.6 : CAT.has(k) ? 0.5 : pred ? 0.45 : 0.35;
    const s = sp.pride || sp.pack ? 0.85 : Math.min(1, 0.15 + herd / 9);
    const g = k === 'hippo' ? 0.85 : k === 'rhino' || k === 'boar' || k === 'buffalo' ? 0.65 : sp.apex ? 0.6 : sp.defend ? 0.5 : pred ? 0.45 : 0.25;
    const v = pred ? 0.35 : Math.min(0.95, 0.3 + (sp.fear || 2) / 8);
    return [b, c, s, g, v];
  }
  Me.trait = function (a, k) {
    const b = BASE[a.kind] || (BASE[a.kind] = baseOf(a.kind)); const i = TK[k];
    let v = b[i] + (G.hash(a.id * 97 + i * 131 + 17) - 0.5) * 0.5;
    if (a.grown < 1) { if (k === 'c') v += 0.2; else if (k === 'b') v -= 0.15; }
    return clamp01(v);
  };

  // ------------------------------ the day of each kind ------------------------------
  // d by day, n by night, c at dawn and dusk (and asleep at midday and at the dead of night), a whenever it is tired
  const CYC = {};
  for (const k of ['hyena', 'leopard', 'fennec', 'fox', 'hippo', 'beaver', 'frog', 'viper', 'tapir', 'boar', 'sloth']) CYC[k] = 'n';
  for (const k of ['lion', 'tiger', 'jaguar', 'snowleopard', 'wolf', 'bear', 'deer', 'moose', 'rabbit', 'hare', 'capybara', 'otter', 'rhino', 'arcticfox']) CYC[k] = 'c';
  for (const k of ['croc', 'python', 'anaconda', 'elephant', 'polarbear', 'muskox', 'seal', 'walrus']) CYC[k] = 'a';
  Me.cycle = k => CYC[k] || 'd';
  // how much this is the hour to sleep, for its kind (0..1)
  Me.sleepTime = function (k) {
    const t = G.S.time; const c = Me.cycle(k);
    const night = G.isNight(), dawn = t >= 0.02 && t < 0.14, dusk = t > 0.62 && t <= 0.73;
    if (c === 'd') return night ? 1 : dawn || dusk ? 0.15 : t > 0.36 && t < 0.46 ? 0.25 : 0.04; // (a nap at noon)
    if (c === 'n') return night ? 0 : dawn || dusk ? 0.1 : 0.95;
    if (c === 'c') return dawn || dusk ? 0 : night ? (t > 0.84 || t < 0.02 ? 0.75 : 0.45) : t > 0.22 && t < 0.56 ? 0.8 : 0.4;
    return 0.35;
  };
  Me.phase = function () { const t = G.S.time; return G.isNight() ? 'noite' : t < 0.14 ? 'aurora' : t > 0.62 ? 'crepúsculo' : 'dia'; };
  const hungry = (a, sp) => a.hunger > (sp.diet === 'carn' || sp.diet === 'scav' ? 0.42 : 0.3);
  Me.hungry = hungry;

  // ------------------------------ the gesture, asked of the one door ------------------------------
  // only what the kind can do (the door would refuse and count the rest, D-276): the brain and the fight ask here (rule 99)
  Me.gesto = function (a, n, d, o, v) { const g = G.Gestos; if (!g || !g.can(a.kind, n)) return false; return A.gesture(a, n, d, o, v); };
  // the first of these the kind can do: the name given, or null
  Me.gesto1 = function (a, ns, d, o, v) { for (let i = 0; i < ns.length; i++) if (Me.gesto(a, ns[i], d, o, v)) return ns[i]; return null; };
  // the voice a kind calls its own with
  const CALL = { wolf: ['howl'], hyena: ['howl', 'call'], elephant: ['trumpet', 'call'], lion: ['roar', 'call'], deer: ['call'], gnu: ['call', 'snort'], zebra: ['call', 'snort'] };
  Me.call = a => Me.gesto1(a, CALL[a.kind] || ['call']);

  // ------------------------------ the group, the kin, the mother ------------------------------
  // the group of a beast: its leader's id (a leader leads itself)
  const head = a => a.leader || a.id;
  Me.kin = (a, o) => o.kind === a.kind && head(o) === head(a);
  Me.mother = a => { const m = a.mind; if (!m || !m.mom) return null; const mo = G.S.animals.get(m.mom); return mo && !mo.dead ? mo : null; };
  // free to answer another: idle, or in a state where the body stays, or grazing, or walking about
  Me.free = o => !o.dead && !o.held && !o.caught && !(o.angry > 0) && (o.state === 'idle' || A.isPassive(o.state) || o.state === 'graze' || o.state === 'wander') && !(o.down > 0);
  // what is round a beast now (once a decision: the options share it): its kin, the nearest of them, its mother, its young, a
  // young one to play with, a grown one of its kind from another group, the nearest beast that eats it
  let cA = null, cT = -1;
  const C = { kin: 0, kinS: 0, near: null, nd: 0, mom: null, young: null, yn: 0, peer: null, foe: null, fd: 0, pred: null, pd: 0 };
  Me.ctx = function (a) {
    const S = G.S; if (cA === a && cT === S.clock) return C;
    cA = a; cT = S.clock;
    C.kin = 0; C.kinS = 0; C.near = null; C.mom = null; C.young = null; C.yn = 0; C.peer = null; C.foe = null; C.pred = null;
    let nd = 65, fd = 65, pd = 65; const m = a.mind; const H = head(a); const eat = EAT[a.kind];
    A.near(a.x, a.y, 8, o => {
      if (o === a || o.dead || o.held) return;
      const d = G.dist2(a.x, a.y, o.x, o.y); if (d > 64) return;
      if (o.kind === a.kind) {
        if (head(o) === H) { C.kin++; if (o.state === 'sleep') C.kinS++; if (d < nd) { nd = d; C.near = o; } }
        else if (o.grown >= 1 && d < fd) { fd = d; C.foe = o; }
        if (m && o.id === m.mom) C.mom = o;
        if (o.mind && o.mind.mom === a.id) { C.yn++; if (!C.young) C.young = o; }
        if (o.grown < 0.8 && a.grown < 0.8 && !C.peer && !o.caught) C.peer = o;
      } else if (eat && eat.has(o.kind) && d < pd && !o.tamed) { pd = d; C.pred = o; }
    });
    C.nd = Math.sqrt(nd); C.fd = Math.sqrt(fd); C.pd = Math.sqrt(pd);
    return C;
  };

  // ------------------------------ the decision ------------------------------
  Me.decide = function (a, dt, sp, S) {
    const m = Me.has(a, sp) ? Me.m(a) : a.mind; const was = a.state;
    let best = null, bs = Me.FLOOR, bi = -1;
    for (let i = 0; i < Me.list.length; i++) {
      const o = Me.list[i]; if (o.who && !o.who(a, sp)) continue;
      let s = o.score(a, sp, S); if (!(s > 0)) continue;
      if (m && m.lo === i + 1) s += Me.KEEP; // (what it was doing it goes on doing, unless something else wants it more)
      if (s > bs) { bs = s; best = o; bi = i; }
    }
    const ok = !!best && best.start(a, sp, S) !== false;
    cA = null;
    if (m) m.lo = ok ? bi + 1 : 0;
    if (!ok && A.isPassive(a.state)) a.state = 'idle';
    // (awake again: a yawn, a stretch, a shake of the body — when what it does now has no gesture of its own)
    if (was === 'sleep' && a.state !== 'sleep' && !a.gest && G.R() < 0.6) Me.gesto1(a, G.R() < 0.5 ? ['stretch', 'yawn', 'shake'] : ['yawn', 'shake']);
    return ok;
  };

  // ------------------------------ fear, anger and memory ------------------------------
  // a spent effort (a chase that failed): the energy it cost
  Me.tire = function (a, x) { const m = a.mind; if (m) m.en = Math.max(0, m.en - x); };
  Me.fright = function (a, lv) { if (!Me.has(a, SP[a.kind])) return; const m = Me.m(a); if (lv > m.f) m.f = clamp01(lv); };
  Me.anger = function (a, lv, by) { if (!Me.has(a, SP[a.kind])) return; const m = Me.m(a); if (lv > m.g) m.g = clamp01(lv); if (by && by.id) Me.meet(a, 1, by.id); };
  // a place to remember (k: 1 a place to rest, 2 a kill, 3 danger): the old one near it moves there, else the oldest goes
  Me.place = function (a, k, x, y) {
    if (!Me.has(a, SP[a.kind])) return; const m = Me.m(a); const l = m.pl || (m.pl = []); const d = today();
    for (const p of l) if (p[0] === k && G.dist(p[1], p[2], x, y) < 3) { p[1] = x; p[2] = y; p[3] = d; return; }
    if (l.length >= 3) { let o = 0; for (let i = 1; i < l.length; i++) if (l[i][3] < l[o][3]) o = i; l.splice(o, 1); }
    l.push([k, x, y, d]);
  };
  // one to remember (k: 1 an enemy, 2 the one that beat it, 3 its mate)
  Me.meet = function (a, k, id) {
    if (!Me.has(a, SP[a.kind]) || !id) return; const m = Me.m(a); const l = m.ki || (m.ki = []); const d = today();
    for (const p of l) if (p[1] === id) { p[0] = k; p[2] = d; return; }
    if (l.length >= 3) { let o = 0; for (let i = 1; i < l.length; i++) if (l[i][2] < l[o][2]) o = i; l.splice(o, 1); }
    l.push([k, id, d]);
  };
  Me.recall1 = function (a, k) { const m = a.mind; if (!m || !m.pl) return null; let b = null; for (const p of m.pl) if (p[0] === k && (!b || p[3] > b[3])) b = p; return b; };
  Me.knows = function (a, id, k) { const m = a.mind; if (!m || !m.ki) return 0; for (const p of m.ki) if (p[1] === id && (!k || p[0] === k)) return p[0]; return 0; };
  // a place it remembers as danger, near (x, y)
  Me.danger = function (a, x, y) { const m = a.mind; if (!m || !m.pl) return false; for (const p of m.pl) if (p[0] === 3 && G.dist(p[1], p[2], x, y) < 4) return true; return false; };
  // the memory forgets: places after four days, the others after six or when they are gone from the world
  function forget(m) {
    const d = today();
    if (m.pl) { m.pl = m.pl.filter(p => d - p[3] < 4); if (!m.pl.length) m.pl = null; }
    if (m.ki) { m.ki = m.ki.filter(p => d - p[2] < 6 && !!A.find(p[1])); if (!m.ki.length) m.ki = null; }
  }

  // ------------------------------ the alarm ------------------------------
  // a beast that saw danger says so — the snort, the bark, the stotting leap, the trumpet —, and who hears it (its own kind fully,
  // another that the same danger eats a little less, the rest only lift their heads) runs, stands or looks: the door the world
  // around calls too (G.Meio: a bird's alarm, the scent on the wind). src: the danger (a beast, a person), or null: from (x, y).
  // Who runs here does not call the alarm again (heard): one ring, no chain across the map. Gives how many ran
  Me.alarm = function (x, y, kind, lv, src) {
    if (!(lv > 0)) return 0; lv = Math.min(1, lv); const r = 4 + 8 * lv; let n = 0;
    const sk = src && src.kind; const person = !!src && !sk;
    A.near(x, y, r, b => {
      if (b === src || b.dead || b.held || b.air || b.caught || b.tamed || b.legend) return;
      const sp = SP[b.kind]; if (!Me.has(b, sp) || A.isBusy(b.state) || b.angry > 0) return;
      const d = G.dist(x, y, b.x, b.y); if (d > r) return;
      // (is it its danger too? its own kind's alarm says so; for another kind, if the danger eats it too — or a person, for one
      // that fears people)
      const prey = sk ? Me.eats(sk, b.kind) : person ? sp.fear > 0 : true;
      let l = lv * (b.kind === kind ? 1 : prey ? 0.75 : 0.25) * (1 - d / (r * 1.6)); if (l < 0.08) return;
      Me.fright(b, l);
      if (l >= 0.3 && prey) { if (G.Luta && G.Luta.react(b, src || { x, y }, l, true)) n++; }
      else Me.gesto1(b, ['alert', 'listen', 'stare'], undefined, src && src.id ? src.id : 0);
    });
    return n;
  };

  // ------------------------------ strength ------------------------------
  // how strong a beast is among its own (the rank, the rut, the territory): the body, the prime of its life, its temper, its
  // wins and its wounds; the male of most kinds, the female of the kinds she leads
  Me.power = function (a) {
    const sp = SP[a.kind]; const m = a.mind; const f = (a.age || 0) / (sp.life * (a.lifeMul || 1));
    const prime = MATRI.has(a.kind) ? (f < 0.15 ? 0.4 : 0.6 + 0.5 * Math.min(1, f)) : f < 0.12 ? 0.35 : f < 0.25 ? 0.75 : f < 0.7 ? 1 : f < 0.85 ? 0.8 : 0.55;
    let p = sp.size * sp.size * a.grown * a.grown * (0.4 + 0.6 * a.hp / a.maxHp) * prime * (0.75 + 0.5 * Me.trait(a, 'g')) * (a.big || 1);
    if (MATRI.has(a.kind) ? Me.sex(a) === 0 : Me.sex(a) === 1) p *= 1.35;
    if (m) p *= 1 + 0.12 * (m.wn || 0);
    const w = a.wnd; if (w) p *= 1 - 0.4 * Math.min(1, (w.l || 0) + (w.j || 0) * 0.5);
    return p;
  };

  // ------------------------------ the needs, twice a second ------------------------------
  // the body's clocks: the energy (spent awake, more running; back asleep), the breath (spent in a sprint, back at rest), the fear
  // and the anger that fade, the heat and the pregnancy, the milk; and now and then (every ten seconds or so) the social round
  const EN_AWAKE = 1 / 230, EN_SLEEP = 1 / 45, EN_REST = 1 / 600;
  const RESTFUL = { rest: 1, suckle: 1, nurse: 1, hide: 1, heat: 1, social: 1, groom: 1, watch: 0, wait: 1, digest: 1 };
  // the states of the sprint, and how hard (the holder's grip and the clash of a contest spend breath too)
  const SPRINT = Me.SPRINT = { chase: 1, flee: 1, pounce: 1.4, strike: 1.2, lunge: 0.4, hold: 0.35, contest: 0.5, stand: 0.15 };
  const sprinting = a => (a.state === 'chase' && a.carc ? 0 : SPRINT[a.state] || 0);
  Me.sprinting = sprinting;
  A.lifeHooks.push(function (a, sp, dt, S) {
    if (!Me.has(a, sp)) return true;
    const m = a.mind || (a.mind = fresh(a));
    const st = a.state; const sw = a.caught ? 1.2 : sprinting(a);
    if (st === 'sleep') m.en = Math.min(1, m.en + dt * EN_SLEEP);
    else if (RESTFUL[st]) m.en = Math.min(1, m.en + dt * EN_REST);
    else m.en = Math.max(0, m.en - dt * EN_AWAKE * (sw ? 1 + 2 * sw : a.moving ? 1.25 : 1));
    const P = G.Luta ? G.Luta.prof(a.kind) : null; const E = P ? P.e : 20, R = P ? P.r : 25;
    if (sw) m.st = Math.max(0, m.st - dt * sw / E); else if (m.st < 1) m.st = Math.min(1, m.st + dt / R * (a.moving ? 0.5 : 1));
    if (m.f > 0) m.f = Math.max(0, m.f - dt * 0.035);
    if (m.g > 0) m.g = Math.max(0, m.g - dt * 0.025);
    // the heat passes; a pregnancy goes to its term (the birth itself is the breeding round's, animals.js)
    if (m.es > 0) {
      heatAdd(a); m.es = Math.max(0, m.es - dt);
      if (m.es === 0 && m.pg === 0) {
        // (the heat over, and her male alive and within reach: they met where nobody saw — in the canopy, under the water, in the
        // night —; the young is his. A heat with no male of her kind near passes: D-293)
        const s = m.pa && S.animals.get(m.pa);
        if (s && !s.dead && s.mind && (!s.mind.wo || s.mind.wo === a.id)) { m.pg = Me.gest_s(a.kind); if (s.mind.wo === a.id) s.mind.wo = 0; Me.count('acasala'); Me.count('acasala:' + a.kind); Me.count('acasala-longe'); }
        else { m.pa = 0; Me.count('cio-perdido'); Me.count('cio-perdido:' + a.kind); }
      }
    }
    if (m.pg > 0) m.pg = Math.max(0, m.pg - dt);
    // the milk: a young at its mother's side drinks, she gives
    if (st === 'suckle') { const mo = Me.mother(a); if (mo && G.dist(a.x, a.y, mo.x, mo.y) < 1.9) { a.hunger = Math.max(0, a.hunger - dt * 0.06); mo.hunger = Math.min(1, mo.hunger + dt * 0.012); } }
    if (S.clock >= a.sk) { a.sk = S.clock + 9 + G.hash(a.id * 3 + 11) * 6; social(a, sp, S, m); }
    return !a.dead;
  });
  // the senses of the mind: the asleep notice late, the sentinel early, the frightened sooner; the hidden fawn is hard to see;
  // and each by its own vigilance
  A.senseHooks.push(function (a, o) {
    const st = a.state; let k = st === 'sleep' ? 0.45 : st === 'watch' ? 1.6 : RESTFUL[st] ? 0.85 : 1;
    const m = a.mind; if (m) { if (m.f > 0.35) k *= 1.2; k *= m.vg; }
    if (o && o.state === 'hide') k *= 0.35;
    if (m && m.ki && o && o.id && Me.knows(a, o.id, 1)) k *= 1.4; // (the one that hurt it, or its own: it knows that one)
    return k;
  });
  // ---- a hunter with nothing near goes back to where it killed before (the crossing, the waterhole)
  Me.option('range', {
    who: (a, sp) => brain(a, sp) && A.predator(a.kind) && sp.diet !== 'scav' && a.grown >= 1 && !a.mig && !!a.mind && !!a.mind.pl,
    score(a, sp) { if (!hungry(a, sp) || a.rest > 0) return 0; const p = Me.recall1(a, 2); if (!p) return 0; const d = G.dist(a.x, a.y, p[1], p[2]); return d > 6 && d < 30 ? 0.3 + 0.2 * a.hunger : 0; },
    start(a) { const p = Me.recall1(a, 2); if (!p || !A.walkOK(a, p[1], p[2])) return false; a.tx = p[1]; a.ty = p[2]; a.state = 'wander'; a.seek = true; Me.gesto1(a, ['scent', 'sniff']); Me.count('volta-ao-lugar'); return true; },
  });
  // ---- a beast where one of its own died to a hunter not long ago moves off, uneasy
  Me.option('shun', {
    who: (a, sp) => brain(a, sp) && !A.predator(a.kind) && !!a.mind && !!a.mind.pl,
    score(a) { const p = Me.recall1(a, 3); if (!p || G.dist(a.x, a.y, p[1], p[2]) > 4) return 0; return 0.28 + 0.2 * Me.trait(a, 'v'); },
    start(a) { const p = Me.recall1(a, 3); if (!p) return false; const q = A.fleeTarget(a, p[1], p[2], 6); if (!q) return false; a.tx = q[0]; a.ty = q[1]; a.state = 'wander'; Me.gesto1(a, ['alert', 'scent', 'listen']); Me.count('evita-o-lugar'); return true; },
  });

  // ------------------------------ the social round ------------------------------
  // (each beast every ten seconds or so, from its own clock: never all at once)
  const PRIDE = set(['lion', 'wolf', 'hyena']); // (the young males leave the group they were born in)
  const LONE = k => SP[k] && SP[k].herd && SP[k].herd[1] === 1; // (and the young of a lone kind go their own way)
  function social(a, sp, S, m) {
    forget(m);
    // the mother: still in the world? (an orphan forgets her)
    if (m.mom) { const mo = A.find(m.mom); if (!mo || mo.dead) { m.mom = 0; Me.count('orfao'); } }
    if (m.wo && !S.animals.get(m.wo)) m.wo = 0;
    if (m.cw && !S.animals.get(m.cw)) m.cw = 0;
    // a male a female waits for, in the canopy, under the water, about its round: he goes to her (the idle choice would come to a
    // crocodile lying in wait or a monkey in its tree seldom, and the heat would pass)
    if (m.wo && m.sx === 1 && a.state !== 'court' && URGE[a.state] && !hungry(a, sp)) { const f = wooed(a); if (f) Me.OPT.court.start(a, sp, S); }
    // a group whose head is gone: the strongest left takes the lead
    if (a.leader) { const L = S.animals.get(a.leader) || A.find(a.leader); if (!L || L.dead) succession(a, a.leader, S); }
    else if (sp.herd && sp.herd[1] >= 2 && a.grown >= 1) lead(a, sp, S);
    // growing up: the young male of a pride leaves it; the young of a lone kind goes its own way
    // (only the young of the world: the grown ones a world began with stay where they are)
    if (a.leader && a.grown >= 0.92 && !a.mig && m.mom && a.age < SP[a.kind].life * 0.3) {
      const solo = LONE(a.kind) && m.mom === a.leader;
      const leaves = solo || (PRIDE.has(a.kind) && Me.sex(a) === 1 && G.R() < 0.3) || (a.kind === 'elephant' && Me.sex(a) === 1 && G.R() < 0.2);
      if (leaves) disperse(a, sp, solo);
    }
    // the nomads of a pride's kind find each other: two males are a coalition
    if (!a.leader && PRIDE.has(a.kind) && Me.sex(a) === 1 && a.grown >= 1 && !groupOf(a)) {
      let o = null; A.near(a.x, a.y, 8, q => { if (!o && q !== a && q.kind === a.kind && !q.dead && !q.leader && q.grown >= 1 && Me.sex(q) === 1 && !groupOf(q)) o = q; });
      if (o) { const top = Me.power(o) >= Me.power(a) ? o : a, low = top === a ? o : a; low.leader = top.id; low.hx = top.hx; low.hy = top.hy; Me.count('coalizao'); }
    }
  }
  // does anyone follow it? (a leader's own group)
  function groupOf(a) { let n = 0; A.near(a.x, a.y, 14, o => { if (o !== a && !o.dead && o.leader === a.id) { n++; return false; } }); return n > 0; }
  // the head of the group is dead: of those that followed it, the strongest leads now
  function succession(a, old, S) {
    const left = []; A.near(a.x, a.y, 20, o => { if (!o.dead && o.kind === a.kind && o.leader === old) left.push(o); });
    if (!left.length) { a.leader = 0; return; }
    let top = left[0], tp = Me.power(top);
    for (let i = 1; i < left.length; i++) { const p = Me.power(left[i]); if (p > tp || (p === tp && left[i].id < top.id)) { top = left[i]; tp = p; } }
    top.leader = 0; for (const o of left) if (o !== top) o.leader = top.id;
    if (top.mind) top.mind.rk = 1;
    Me.count('sucessao'); Me.count('sucessao:' + a.kind);
    if (left.length >= 3 && G.Luta) {
      const n = G.Luta.nm(top);
      if (a.kind === 'elephant') G.Luta.say('matriarca', `A velha matriarca de uma manada de elefantes morreu${G.Luta.where(top.x, top.y)}. Agora é outra fêmea, a mais forte das que ficaram, quem conduz as outras ${left.length - 1} até a água.`, top.x, top.y, 'deer');
      else if (a.kind === 'lion' || a.kind === 'wolf') G.Luta.say('sucessao:' + a.kind, `${a.kind === 'lion' ? 'O bando de leões' : 'A alcateia'}${G.Luta.where(top.x, top.y)} perdeu quem ${a.kind === 'lion' ? 'o' : 'a'} guiava. ${G.cap(n.art)} ${n.n} tomou o lugar de líder.`, top.x, top.y);
    }
  }
  // the leader's round: who is above whom among its own (the rank), and the one who will dispute its place
  function lead(a, sp, S) {
    const g = A.packOf(a); if (!g.length) return;
    g.push(a); const pw = new Map(); for (const o of g) pw.set(o, Me.power(o));
    g.sort((p, q) => pw.get(q) - pw.get(p) || p.id - q.id);
    for (let i = 0; i < g.length; i++) { const o = g[i]; if (o.mind) o.mind.rk = g.length > 1 ? r2(1 - i / (g.length - 1)) : 1; }
    // the strongest that is not the leader disputes the lead; now and then two side by side in the order dispute theirs
    const top = g[0];
    if (top !== a && top.grown >= 1 && pw.get(top) > pw.get(a) * 1.08 && top.mind && !top.mind.cw && G.R() < 0.6) top.mind.cw = a.id;
    else if (g.length >= 3 && G.R() < 0.25) {
      const i = G.ri(1, g.length - 2); const hi = g[i], lo = g[i + 1];
      if (lo.grown >= 1 && hi.grown >= 1 && Me.sex(lo) === Me.sex(hi) && pw.get(hi) < pw.get(lo) * 1.2 && lo.mind && !lo.mind.cw) lo.mind.cw = hi.id;
    }
  }
  // a habitat far off where a beast that leaves goes to live (null: none found)
  function range(a, d0, d1) {
    const sp = SP[a.kind];
    for (let k = 0; k < 14; k++) {
      const ang = G.R() * 6.28, d = G.rr(d0, d1); const x = a.x + Math.cos(ang) * d, y = a.y + Math.sin(ang) * d;
      if (!W.inb(x, y) || !A.walkOK(a, x, y) || !A.habitat(sp, W.idx(x, y))) continue;
      if (sp.cls === 'land' && !W.canWalk(a.x, a.y, x, y)) continue;
      return [x, y];
    }
    return null;
  }
  function disperse(a, sp, solo) {
    const p = range(a, solo ? 10 : 16, solo ? 20 : 28); if (!p) return;
    a.leader = 0; a.hx = p[0]; a.hy = p[1]; a.mig = true; if (a.mind) a.mind.rk = 0.5;
    Me.count('dispersao'); Me.count('dispersao:' + a.kind);
  }
  Me.disperse = (a, solo) => disperse(a, SP[a.kind], solo);
  Me.range = range;

  // ------------------------------ the options of the brain ------------------------------
  const brain = (a, sp) => Me.has(a, sp) && !a.legend;
  // ---- asleep (with its own: a herd sleeps together near its leader, and one of them keeps watch)
  Me.option('sleep', {
    passive: true, who: brain,
    score(a, sp) {
      const m = Me.m(a); if (m.f > 0.45 || m.es > 0) return 0;
      const pw = Me.sleepTime(a.kind); if (pw <= 0) return m.en < 0.12 ? 0.5 : 0;
      let s = (1 - m.en) * pw * 1.6 + pw * 0.25 + (m.en < 0.15 ? 0.45 : 0);
      if (hungry(a, sp)) s *= A.predator(a.kind) ? 0.45 : 0.6;
      if (a.grown < 1) s *= 1.15;
      return s;
    },
    start(a, sp, S) {
      const L = a.leader && S.animals.get(a.leader);
      // (to its own first: a herd sleeps by its leader — the old ways follow it only now and then, and the two zebras of a herd
      // whose lead had passed to another stood awake all night twelve steps from it, L-1007)
      if (L && !L.dead && G.dist(a.x, a.y, L.x, L.y) > 4.5 && !a.mig) { const q = A.pickNear({ x: L.x, y: L.y, kind: a.kind }, 2.5); if (!q) return false; a.tx = q[0]; a.ty = q[1]; a.state = 'wander'; a.seek = true; return true; }
      // (a hunter without a herd goes back to the place it slept before — its den — if it is not far)
      if (!L && A.predator(a.kind) && !a.mig) { const den = Me.recall1(a, 1); if (den && G.dist(a.x, a.y, den[1], den[2]) > 3 && G.dist(a.x, a.y, den[1], den[2]) < 16 && A.walkOK(a, den[1], den[2])) { a.tx = den[1]; a.ty = den[2]; a.state = 'wander'; a.seek = true; return true; } }
      const c = Me.ctx(a);
      if (c.kinS >= 2 && sp.herd[1] >= 4 && sentinel(a, S)) { a.state = 'watch'; a.t = G.rr(8, 14); a.bt = S.clock; Me.gesto1(a, ['alert', 'listen', 'scent']); Me.count('sentinela'); return true; }
      a.state = 'sleep'; a.t = G.rr(10, 22); Me.gesto(a, 'sleep', 0);
      if (A.predator(a.kind) && !a.leader) Me.place(a, 1, a.x, a.y);
      return true;
    },
  });
  // the sentinel of a herd asleep: the one that lies down when none of its own keeps watch — not the one that just did (the
  // watch goes round)
  function sentinel(a, S) {
    if (a.grown < 1 || (a.state === 'watch') || S.clock - (a.bt || -99) < 30 && a.bq === 9) return false;
    const H = head(a); let w = false; A.near(a.x, a.y, 8, o => { if (!w && o !== a && !o.dead && o.kind === a.kind && head(o) === H && o.state === 'watch') w = true; });
    if (w) return false; a.bq = 9; return true;
  }
  Me.option('watch', { passive: true, who: () => false, score: () => 0, start: () => false });
  // ---- lying down: the cats spend their days so; the ruminants chew the cud; the tired after a run get their breath back
  Me.option('rest', {
    passive: true, who: brain,
    score(a, sp) {
      const m = Me.m(a); if (m.f > 0.3 || hungry(a, sp)) return 0;
      let s = (1 - m.en) * 0.45 + (m.st < 0.5 ? (0.5 - m.st) * 0.7 : 0);
      if (CAT.has(a.kind) && !G.isNight()) s += 0.24;
      if (RUM.has(a.kind) && a.hunger < 0.2) s += 0.2;
      return s;
    },
    start(a) { a.state = 'rest'; a.t = G.rr(6, 14); Me.gesto1(a, RUM.has(a.kind) && a.hunger < 0.25 ? ['ruminate', 'lie'] : ['lie'], 0); return true; },
  });
  // ---- the care of the body: grooming, a scratch, a shake, a roll in the dust, a yawn, a stretch, the nose to the ground or the wind
  const COMFORT = [['groom', 3], ['scratch', 2], ['shake', 1.5], ['roll', 1], ['dustbath', 1], ['yawn', 1], ['stretch', 1], ['sniff', 2], ['scent', 1.5], ['listen', 1], ['preen', 2]];
  function pickOf(a, list) {
    let tot = 0; for (const [n, w] of list) if (G.Gestos.can(a.kind, n)) tot += w; if (!tot) return null;
    let r = G.R() * tot; for (const [n, w] of list) if (G.Gestos.can(a.kind, n)) { r -= w; if (r <= 0) return n; }
    return null;
  }
  Me.option('groom', {
    passive: true, who: brain,
    score(a, sp) { const m = Me.m(a); if (m.f > 0.2 || m.en < 0.25 || hungry(a, sp)) return 0; return 0.12 + G.R() * 0.2; },
    start(a) { const n = pickOf(a, COMFORT); if (!n) return false; a.state = 'groom'; a.t = (G.Gestos.DEF[n].d || 4) + 0.4; Me.gesto(a, n); return true; },
  });
  // ---- with its own: licking another, the muzzle to the other's neck (the mother and her young, the pride at rest)
  Me.option('social', {
    passive: true, who: (a, sp) => brain(a, sp) && !!(sp.pride || sp.pack || (sp.herd && sp.herd[1] >= 2)),
    score(a, sp) {
      const m = Me.m(a); if (m.f > 0.2 || hungry(a, sp)) return 0; const c = Me.ctx(a); if (!c.near || c.nd > 2.6) return 0;
      return 0.14 + 0.22 * Me.trait(a, 's') + (c.near === c.mom || c.near === c.young ? 0.1 : 0);
    },
    start(a) {
      const c = Me.ctx(a); const o = c.near; if (!o || !Me.free(o)) return false;
      const n = Me.gesto1(a, ['allogroom', 'nuzzle'], 0, o.id); if (!n) return false;
      a.state = 'social'; a.t = G.Gestos.DEF[n].d + 0.6; G.faceTo(a, o.x - a.x, o.y - a.y);
      if (o.state !== 'sleep') { o.state = 'social'; o.t = a.t; Me.gesto1(o, [n, 'nuzzle'], 0, a.id); G.faceTo(o, a.x - o.x, a.y - o.y); }
      return true;
    },
  });
  // ---- alone, far from its own: it calls and goes to find them
  Me.option('seek', {
    who: (a, sp) => brain(a, sp) && sp.herd && sp.herd[1] >= 2 && !a.mig,
    score(a, sp) {
      const m = Me.m(a); const c = Me.ctx(a); if (c.kin > 0) { m.so = Math.max(0, m.so - 0.4); return 0; }
      m.so = Math.min(1, m.so + 0.03 + 0.1 * Me.trait(a, 's')); return m.so < 0.5 || hungry(a, sp) ? 0 : 0.3 + m.so * 0.35;
    },
    start(a, sp, S) {
      const L = (a.leader && S.animals.get(a.leader)) || Me.mother(a); if (!L || L.dead || L === a || G.dist(a.x, a.y, L.x, L.y) < 6) return false;
      const x = L.x + G.rr(-1.2, 1.2), y = L.y + G.rr(-1.2, 1.2); a.tx = A.walkOK(a, x, y) ? x : L.x; a.ty = A.walkOK(a, x, y) ? y : L.y;
      a.state = 'wander'; a.seek = true; Me.call(a); Me.m(a).so = 0.2;
      return true;
    },
  });

  // ------------------------------ the mother and the young ------------------------------
  const WEAN = 0.65; // (a young drinks its mother's milk until it is this grown)
  const HIDERS = set(['deer', 'gazelle', 'reindeer', 'rabbit', 'hare', 'giraffe', 'tapir', 'moose', 'ibex']);
  const youngOf = (a, sp) => brain(a, sp) && a.grown < WEAN && !!(a.mind && a.mind.mom);
  // ---- at its mother's side: it follows her (the fawn of a hider lies still in the grass while she grazes not far off)
  Me.option('young', {
    who: youngOf,
    score(a) {
      const mo = Me.mother(a); if (!mo) return 0; const d = G.dist(a.x, a.y, mo.x, mo.y); if (d < 1.7) return 0;
      if (HIDERS.has(a.kind) && a.grown < 0.4 && d < 7 && (mo.state === 'graze' || mo.state === 'idle')) return 0;
      return Math.min(0.95, 0.45 + d * 0.06);
    },
    start(a) { const mo = Me.mother(a); if (!mo) return false; a.state = 'young'; a.target = mo.id; a.t = 6; a.cg = G.dist(a.x, a.y, mo.x, mo.y); a.cgT = 0; return true; },
    step(a, dt, sp, S) {
      const mo = S.animals.get(a.target); a.t -= dt;
      if (!mo || mo.dead || a.t <= 0) { a.state = 'idle'; a.t = 0.3; a.target = 0; return true; }
      const side = (G.hash(a.id) < 0.5 ? 1 : -1) * 0.55; let fx = mo.fx || mo.face || 1, fy = mo.fy || 0; const l = Math.hypot(fx, fy) || 1; fx /= l; fy /= l;
      let tx = mo.x - fx * 0.45 - fy * side, ty = mo.y - fy * 0.45 + fx * side; if (!A.walkOK(a, tx, ty)) { tx = mo.x; ty = mo.y; }
      a.tx = tx; a.ty = ty; const d = G.dist(a.x, a.y, tx, ty);
      if (d < 0.45) { a.state = 'idle'; a.t = G.rr(0.5, 1.5); a.moving = false; a.target = 0; return true; }
      // (no nearer in five seconds — she is across water, up a tree: it waits, and calls)
      a.cgT += dt; if (a.cgT >= 5) { if (a.cg - d < 0.5) { a.state = 'idle'; a.t = G.rr(3, 6); a.target = 0; a.moving = false; Me.call(a); return true; } a.cg = d; a.cgT = 0; }
      A.moveTo(a, dt, Math.max(sp.sp, mo.moving ? SP[mo.kind].sp * 1.2 : sp.sp) * (d > 4 ? 1.7 : 1.1));
      return true;
    },
  });
  // ---- the milk: the young at its mother's flank, she lets it drink
  const canNurse = mo => Me.sex(mo) === 0 && mo.grown >= 1 && !A.isBusy(mo.state) && !mo.caught && !(mo.angry > 0) && mo.state !== 'flee';
  Me.option('suckle', {
    passive: true, who: (a, sp) => youngOf(a, sp) && a.grown < 0.5 && MAMMAL.has(a.kind),
    score(a) { if (a.hunger < 0.18) return 0; const mo = Me.mother(a); if (!mo || G.dist(a.x, a.y, mo.x, mo.y) > 1.8 || !canNurse(mo)) return 0; return 0.5 + a.hunger * 0.45; },
    start(a) {
      const mo = Me.mother(a); a.state = 'suckle'; a.t = G.rr(4, 8); a.target = mo.id; Me.gesto(a, 'suckle', 0, mo.id); G.faceTo(a, mo.x - a.x, mo.y - a.y);
      if (Me.free(mo)) { mo.state = 'nurse'; mo.t = a.t + 0.5; Me.gesto(mo, 'nurse', 0, a.id); }
      Me.count('mama');
      return true;
    },
  });
  Me.option('nurse', { passive: true, who: () => false, score: () => 0, start: () => false });
  // ---- play: two young ones round and round each other, a tumble, a mock bite
  Me.option('play', {
    who: (a, sp) => brain(a, sp) && a.grown < 0.8 && G.Gestos.can(a.kind, 'play'),
    score(a) { const m = Me.m(a); if (m.f > 0.15 || a.hunger > 0.5 || m.en < 0.35 || m.st < 0.7) return 0; const c = Me.ctx(a); if (!c.peer || !Me.free(c.peer)) return 0; return 0.28 + 0.3 * Me.trait(a, 'c'); },
    start(a) {
      const o = Me.ctx(a).peer; if (!o) return false; a.state = 'play'; a.target = o.id; a.t = G.rr(4, 9); Me.gesto(a, 'play', 0, o.id);
      if (Me.free(o) && o.state !== 'sleep') { o.state = 'play'; o.target = a.id; o.t = a.t; Me.gesto(o, 'play', 0, a.id); }
      Me.count('brinca'); return true;
    },
    step(a, dt, sp, S) {
      const o = S.animals.get(a.target); a.t -= dt;
      // (play comes in bursts: it takes the breath, and the young one flops down until it has it back — two young hippos went
      // round each other for minutes on end, L-1007)
      const m = Me.m(a); m.st = Math.max(0, m.st - dt / 14);
      if (!o || o.dead || a.t <= 0 || o.caught || m.st < 0.35) { a.state = 'idle'; a.t = 1; a.target = 0; return true; }
      const ang = S.clock * 2.2 + (a.id & 1 ? 0 : Math.PI); const x = o.x + Math.cos(ang) * 0.7, y = o.y + Math.sin(ang) * 0.7;
      a.tx = A.walkOK(a, x, y) ? x : o.x; a.ty = A.walkOK(a, x, y) ? y : o.y; A.moveTo(a, dt, sp.sp * 1.4);
      return true;
    },
  });
  // ---- the hidden fawn: still in the grass while its mother grazes a little way off
  Me.option('hide', {
    passive: true, who: (a, sp) => youngOf(a, sp) && a.grown < 0.4 && HIDERS.has(a.kind),
    score(a) { const mo = Me.mother(a); if (!mo || (mo.state !== 'graze' && mo.state !== 'idle' && mo.state !== 'wander')) return 0; const d = G.dist(a.x, a.y, mo.x, mo.y); return d < 1.2 || d > 7 ? 0 : 0.42; },
    start(a) { a.state = 'hide'; a.t = G.rr(8, 16); Me.gesto(a, 'hide', 0); return true; },
  });
  // a young born (the breeding round of animals.js): its mind, its mother and its father; she licks it, it stands for the first time
  Me.born = function (kid, mo) {
    const m = kid.mind = fresh(kid); const mm = mo.mind;
    // (the sex of the young leans to the one its kind lacks among the grown — a few beasts of a kind do not die out of one sex)
    let f = 0, ml = 0; for (const o of G.S.animals.values()) if (o.kind === kid.kind && !o.dead && o.grown >= 1 && o !== kid) { if (Me.sex(o)) ml++; else f++; }
    const lean = f + ml > 0 ? 0.5 + 0.35 * (f - ml) / (f + ml) : 0.5; // (the share of males)
    m.sx = G.R() < lean ? 1 : 0; m.mom = mo.id; m.fa = mm ? mm.pa : 0; m.en = 1;
    if (mm) { mm.pa = 0; mm.pg = 0; mm.es = 0; }
    Me.gesto(kid, 'rise'); if (Me.free(mo)) { mo.state = 'nurse'; mo.t = 4; Me.gesto1(mo, ['allogroom', 'nuzzle'], 0, kid.id); }
    Me.count('nasce'); Me.count('nasce:' + kid.kind);
  };

  // ------------------------------ the heat, the courting, the mating ------------------------------
  // the gestation, in seconds of the world (a year is a day): the small ones quick, the giants long
  Me.gest_s = k => { const s = SP[k].size; return s < 0.9 ? 9 : s < 1.25 ? 26 : s < 1.6 ? 45 : 70; };
  // the young of one birth: the small ones that breed fast have litters
  Me.litter = k => (SP[k].breed >= 1.5 ? 2 : 1);
  const HEAT = 90; // (how long a heat lasts: half a day, time for a male a long way off to come)
  // can she come into heat? a grown female, not pregnant, not in heat, not with a young one still at the breast of a big kind
  Me.fertile = function (a) {
    const m = a.mind; if (!m || m.sx !== 0 || a.grown < 1 || m.es > 0 || m.pg > 0 || m.pa) return false;
    if (SP[a.kind].size >= 1.2) { const c = Me.ctx(a); if (c.young && c.young.grown < 0.5) return false; }
    return true;
  };
  // at her term: the birth is due
  Me.due = a => { const m = a.mind; return !!m && m.sx === 0 && m.pa > 0 && m.pg <= 0 && m.es <= 0; };
  Me.lose = a => { const m = a.mind; if (m) { m.pa = 0; m.pg = 0; } };
  // she comes into heat: the strongest male within reach is her suitor (in her group, or near; for a lone kind or one with few in
  // the world, the nearest anywhere she can walk to), and he knows it — and so does the next best near her: the two will settle
  // it (the rut)
  Me.heat = function (a, counts) {
    const m = Me.m(a); m.es = HEAT; m.pa = 0; heatAdd(a);
    return suitor(a, counts, true);
  };
  // her suitor still hers? (alive, and courting her or free to)
  const hers = a => { const s = a.mind && a.mind.pa && G.S.animals.get(a.mind.pa); return !!s && !s.dead && !!s.mind && (!s.mind.wo || s.mind.wo === a.id); };
  Me.recall = function (a) { if (!hers(a)) { a.mind.pa = 0; suitor(a, {}, false); } };
  function suitor(a, counts, first) {
    const m = a.mind;
    const fit = o => o !== a && !o.dead && !o.held && o.kind === a.kind && o.grown >= 1 && Me.sex(o) === 1 && !o.tamed && !o.legend && !o.dom && !(o.mind && o.mind.wo && o.mind.wo !== a.id);
    let best = null, bs = -1, next = null, ns = -1; const val = o => Me.power(o) / (1 + G.dist(a.x, a.y, o.x, o.y) * 0.06);
    const see = o => { if (!fit(o)) return; const v = val(o); if (v > bs) { next = best; ns = bs; bs = v; best = o; } else if (v > ns) { ns = v; next = o; } };
    A.near(a.x, a.y, 24, see);
    if (!best && ((counts[a.kind] || 0) <= 12 || SP[a.kind].herd[1] === 1)) for (const o of G.S.animals.values()) { if (!fit(o)) continue; if (SP[a.kind].cls === 'land' && !W.canWalk(a.x, a.y, o.x, o.y)) continue; see(o); }
    if (first) { Me.count('cio'); Me.count('cio:' + a.kind); }
    if (!best) { if (first) Me.count('cio-sem-macho'); return false; }
    m.pa = best.id; Me.m(best).wo = a.id;
    if (next && G.dist(a.x, a.y, next.x, next.y) < 12) Me.m(next).wo = a.id;
    return true;
  }
  // a free grown male: a female of his kind in heat not far, whose suitor he is or who has none now — he goes to her
  function find(a) {
    const S = G.S; let best = null, bd = 24 * 24; const l = HEATS.get(a.kind); if (!l) return null;
    for (const id of l) {
      const f = S.animals.get(id); if (!f || f.dead || !f.mind || !(f.mind.es > 0)) { l.delete(id); continue; } // (over, or gone)
      if (f.mind.pa && f.mind.pa !== a.id && hers(f)) continue;
      const d = G.dist2(a.x, a.y, f.x, f.y); if (d < bd) { bd = d; best = f; }
    }
    if (best) { best.mind.pa = a.id; a.mind.wo = best.id; }
    return best;
  }
  // ---- her: she calls, and stays near
  Me.option('heat', {
    passive: true, who: (a, sp) => brain(a, sp) && !!a.mind && a.mind.es > 0,
    score(a, sp) { return hungry(a, sp) ? 0 : 0.36; },
    start(a) { a.state = 'heat'; a.t = G.rr(4, 8); if (G.R() < 0.5) Me.call(a); Me.recall(a); return true; },
  });
  // ---- him: to her side, the courting, the mating (a rival on the way: the rut)
  const URGE = { idle: 1, wander: 1, graze: 1, lurk: 1, tree: 1, patrol: 1, seek: 1, sleep: 1, rest: 1, groom: 1, social: 1, watch: 1, heat: 0 };
  const wooed = a => { const m = a.mind; const f = m && m.wo && G.S.animals.get(m.wo); return f && !f.dead && f.mind && f.mind.es > 0 ? f : null; };
  Me.option('court', {
    who: (a, sp) => brain(a, sp) && a.grown >= 1 && !!a.mind && a.mind.sx === 1 && (a.mind.wo > 0 || (HEATS.get(a.kind) || NONE).size > 0),
    score(a, sp) { let f = wooed(a); if (!f) { a.mind.wo = 0; f = find(a); } if (!f) return 0; return 0.66 + 0.15 * Me.trait(a, 'g') - (hungry(a, sp) ? 0.25 : 0); },
    start(a) { const f = wooed(a); if (!f) return false; a.state = 'court'; a.target = f.id; a.t = 45; a.bp = 0; a.bt = 0; a.sub = 0; a.cg = G.dist(a.x, a.y, f.x, f.y); a.cgT = 0; if (a.z > 3 && !(a.perch && f.perch)) { a.z = 0; a.perch = 0; } return true; },
    step(a, dt, sp, S) {
      const f = S.animals.get(a.target); const m = Me.m(a); a.t -= dt;
      if (!f || f.dead || !f.mind || !(f.mind.es > 0) || a.t <= 0) { m.wo = 0; a.state = 'idle'; a.t = 1; a.target = 0; return true; }
      const d = G.dist(a.x, a.y, f.x, f.y);
      // the rut: another grown male of its kind beside her — they settle it
      if (a.bp === 0 && d < 4) { const rv = rival(a, f); if (rv && Me.free(rv)) { Me.contest(a, rv, 2); return true; } }
      if (d > 1.1) {
        // (no nearer after a few seconds — a river, a cliff, a town between them: he gives her up, and she calls another)
        a.cgT += dt; if (a.cgT >= 5) { if (a.cg - d < 0.6) { m.wo = 0; f.mind.pa = 0; a.state = 'idle'; a.t = 1; a.target = 0; Me.count('corte-longe'); return true; } a.cg = d; a.cgT = 0; }
        a.tx = f.x; a.ty = f.y; A.moveTo(a, dt, sp.sp * (d > 6 ? 1.5 : 1.1)); if (a.bp > 0) a.bp = 0; return true;
      }
      a.moving = false; G.faceTo(a, f.x - a.x, f.y - a.y); a.bt += dt;
      if (a.bp === 0) {
        a.bp = 1; a.bt = 0; Me.gesto1(a, ['court', 'sniff', 'nuzzle'], 0, f.id);
        if (Me.free(f) || f.state === 'heat') { f.state = 'heat'; f.t = 9; Me.gesto1(f, ['nuzzle', 'call'], undefined, a.id); }
      } else if (a.bp === 1 && a.bt > 3) {
        a.bp = 2; a.bt = 0; Me.gesto(a, 'mate', 5, f.id); if (f.state === 'heat' || Me.free(f)) { f.state = 'heat'; f.t = 6; Me.gesto(f, 'mate', 5, a.id); }
      } else if (a.bp === 2 && a.bt > 5) {
        const fm = f.mind; fm.es = 0; fm.pg = Me.gest_s(f.kind); fm.pa = a.id; m.wo = 0;
        A.near(f.x, f.y, 14, o => { if (o !== a && o.mind && o.mind.wo === f.id) o.mind.wo = 0; }); // (she is taken: the others give up)
        Me.meet(a, 3, f.id); Me.meet(f, 3, a.id); Me.count('acasala'); Me.count('acasala:' + a.kind);
        a.state = 'idle'; a.t = G.rr(1, 3); a.target = 0; a.bp = 0;
      }
      return true;
    },
  });
  function rival(a, f) { let r = null; A.near(f.x, f.y, 3.5, o => { if (!r && o !== a && o.kind === a.kind && !o.dead && o.grown >= 1 && Me.sex(o) === 1 && !o.caught && !o.held && o.mind && o.mind.wo === f.id) r = o; }); return r; }

  // ------------------------------ the contest: the rank, the rut, the territory ------------------------------
  // display → threat → the clash → one gives in. The one that began it (the owner) rules it; the other answers. why: 1 the rank in
  // its group, 2 the rut, 3 the territory (an intruder met by the one whose ground it is)
  const DISPLAY = {
    lion: ['roar', 'display', 'threat'], tiger: ['roar', 'display', 'threat'], leopard: ['threat', 'display'], jaguar: ['roar', 'threat', 'display'], snowleopard: ['threat', 'display'],
    wolf: ['threat', 'display', 'stare'], hyena: ['threat', 'display'], bear: ['rear', 'roar', 'display'], polarbear: ['rear', 'roar', 'display'],
    deer: ['bellow', 'display', 'mark'], reindeer: ['bellow', 'display'], moose: ['bellow', 'display'], bison: ['bellow', 'paw', 'display'], buffalo: ['bellow', 'paw', 'display'], gnu: ['bellow', 'paw', 'display'],
    zebra: ['snort', 'rear', 'stare'], elephant: ['trumpet', 'display'], hippo: ['yawn', 'threat', 'display'], rhino: ['snort', 'paw', 'display'], giraffe: ['stare', 'display'],
    ibex: ['rear', 'display'], muskox: ['display', 'paw'], boar: ['threat', 'paw'], croc: ['display', 'threat'],
  };
  const CLASH = { giraffe: ['neck'], zebra: ['spar', 'bite', 'kick'], elephant: ['spar', 'clash'], hippo: ['bite', 'threat'], rhino: ['clash', 'gore'], boar: ['gore', 'bite'] };
  const clashOf = a => CLASH[a.kind] || ['clash', 'spar', 'bite', 'gore'];
  Me.contest = function (a, b, why) {
    a.state = 'contest'; a.target = b.id; a.t = 30; a.bp = 0; a.bt = 0; a.bq = why || 1;
    b.state = 'contest'; b.target = a.id; b.t = 30; b.bp = 0; b.bt = 0; b.bq = 0;
    Me.anger(a, 0.5, null); Me.anger(b, 0.4, null);
    Me.count('disputa'); Me.count('disputa:' + (why === 2 ? 'cio' : why === 3 ? 'territorio' : 'posto'));
  };
  Me.option('contest', {
    // (only by the challenge the leader's round gives: the one it means to dispute, near)
    who: (a, sp) => brain(a, sp) && a.grown >= 1 && !!a.mind && a.mind.cw > 0,
    score(a, sp, S) { const o = S.animals.get(a.mind.cw); if (!o || o.dead || G.dist(a.x, a.y, o.x, o.y) > 12 || !Me.free(o)) { a.mind.cw = 0; return 0; } return hungry(a, sp) ? 0 : 0.45 + 0.3 * Me.trait(a, 'g'); },
    start(a, sp, S) { const o = S.animals.get(a.mind.cw); a.mind.cw = 0; if (!o || !Me.free(o)) return false; Me.contest(a, o, 1); return true; },
    step(a, dt, sp, S) {
      const o = S.animals.get(a.target); a.t -= dt;
      if (!o || o.dead || o.state !== 'contest' || o.target !== a.id || a.t <= 0 || a.caught) { a.state = 'idle'; a.t = 1; a.target = 0; a.bq = 0; return true; }
      const d = G.dist(a.x, a.y, o.x, o.y); G.faceTo(a, o.x - a.x, o.y - a.y);
      if (!a.bq) { // the other answers: it keeps facing, a little apart until the clash
        if (d > 2.2) { a.tx = o.x; a.ty = o.y; A.moveTo(a, dt, sp.sp); } else a.moving = false;
        return true;
      }
      a.bt += dt;
      const close = a.bp >= 3 ? 1.0 : 1.7;
      if (d > close + 0.3) { a.tx = o.x; a.ty = o.y; A.moveTo(a, dt, sp.sp * (a.bp >= 3 ? 1.3 : 0.9)); return true; }
      a.moving = false;
      const pa = Me.power(a), po = Me.power(o); const weak = pa < po ? a : o, strong = weak === a ? o : a; const ratio = Math.min(pa, po) / Math.max(pa, po, 1e-6);
      if (a.bp === 0) { a.bp = 1; a.bt = 0; Me.gesto1(a, DISPLAY[a.kind] || ['display', 'threat', 'stare'], undefined, o.id); Me.gesto1(o, DISPLAY[o.kind] || ['display', 'threat', 'stare'], undefined, a.id); return true; }
      if (a.bt < 2.4) return true;
      a.bt = 0; a.bp++;
      // one gives in? the weaker sooner, the more as it goes on (the display alone settles most)
      const give = Math.min(0.85, 0.12 + 0.6 * (1 - ratio) + 0.08 * a.bp);
      if (G.R() < give || a.bp > 6) { settle(a, strong, weak, a.bq, S); return true; }
      if (a.bp >= 3) { Me.gesto1(a, clashOf(a), undefined, o.id); Me.gesto1(o, clashOf(o), undefined, a.id); if (G.Luta) G.Luta.spar(a, o, a.bq === 3 ? 1 : 0.5); if (a.dead || o.dead) { a.state = 'idle'; a.t = 1; return true; } }
      else { Me.gesto1(a, ['threat', 'paw', 'snort', 'display'], undefined, o.id); Me.gesto1(o, ['threat', 'paw', 'snort', 'stare'], undefined, a.id); }
      return true;
    },
  });
  // the end of a contest: the loser gives in and goes; the winner stands over it. The rank, the female, the ground follow
  function settle(own, win, lose, why, S) {
    own.state = 'idle'; own.t = 1; own.target = 0; own.bq = 0;
    const o = own === win ? lose : win; if (o.state === 'contest') { o.state = 'idle'; o.t = 1; o.target = 0; }
    Me.gesto(lose, 'submit', undefined, win.id); Me.gesto1(win, ['dominate', 'roar', 'bellow', 'display'], undefined, lose.id);
    const wm = Me.m(win), lm = Me.m(lose); wm.wn = Math.min(6, wm.wn + 1); lm.wn = Math.max(-6, lm.wn - 1); Me.meet(lose, 2, win.id);
    A.flee(lose, win.x, win.y, why === 3 ? 7 : 4);
    Me.count('vence:' + (why === 2 ? 'cio' : why === 3 ? 'territorio' : 'posto'));
    if (why === 1) {
      // the challenger beat its leader: it leads now
      const L = lose.leader === 0 && win.leader === lose.id ? lose : null;
      if (L) { const g = A.packOf(L); win.leader = 0; L.leader = win.id; for (const q of g) if (q !== win) q.leader = win.id; wm.rk = 1; Me.count('posto:novo-lider'); Me.count('posto:novo-lider:' + win.kind); }
      else Me.count('posto:troca');
    } else if (why === 2) { lm.wo = 0; const f = wm.wo && S.animals.get(wm.wo); if (f && f.mind) f.mind.pa = win.id; }
    else if (why === 3) territoryWon(win, lose, S);
  }

  // ------------------------------ the territory ------------------------------
  // the ground a pride, a pack, a lone cat or a bull hippo holds: around its home (the leader's), this far; walked at its edge,
  // marked (the spray, the scrape, the rubbing on a tree, the roar at dusk, the howl at night), and held against its own kind
  const TERR = Me.TERR = { lion: 15, tiger: 18, leopard: 12, jaguar: 14, snowleopard: 15, wolf: 18, hyena: 13, bear: 15, polarbear: 16, hippo: 7, rhino: 9 };
  const MARK = { lion: ['mark', 'paw'], tiger: ['mark', 'paw'], leopard: ['mark', 'paw'], jaguar: ['mark', 'paw'], snowleopard: ['mark', 'paw'], wolf: ['mark', 'paw'], hyena: ['mark', 'paw'], bear: ['mark', 'rear'], hippo: ['mark'], rhino: ['mark', 'paw'] };
  Me.option('patrol', {
    who: (a, sp) => brain(a, sp) && !!TERR[a.kind] && a.grown >= 1 && !a.leader && !a.mig && !a.tamed,
    score(a, sp, S) {
      const m = Me.m(a); if (m.f > 0.3 || m.en < 0.4 || hungry(a, sp)) return 0; const since = S.clock - m.mk; if (since < 50) return 0;
      return 0.28 + Math.min(0.25, since / 600) + 0.15 * Me.trait(a, 'g') + ((a.kind === 'lion' || a.kind === 'wolf') && (Me.phase() === 'crepúsculo' || G.isNight()) ? 0.1 : 0);
    },
    start(a, sp) {
      const R = TERR[a.kind];
      for (let k = 0; k < 8; k++) {
        const ang = G.R() * 6.28, r = R * G.rr(0.55, 0.9); const x = a.hx + Math.cos(ang) * r, y = a.hy + Math.sin(ang) * r;
        if (!W.inb(x, y) || !A.walkOK(a, x, y) || !A.habitat(sp, W.idx(x, y))) continue;
        if (sp.cls === 'land' && !W.canWalk(a.x, a.y, x, y)) continue;
        a.state = 'patrol'; a.tx = x; a.ty = y; a.t = 40; a.bt = 0; return true;
      }
      Me.m(a).mk = G.S.clock; return false;
    },
    step(a, dt, sp, S) {
      a.t -= dt; a.bt -= dt;
      if (a.bt <= 0) { a.bt = 1.5; const o = intruder(a); if (o) { meet(a, o, S); return true; } }
      if (A.moveTo(a, dt, sp.sp) || a.t <= 0) { mark(a, S); a.state = 'idle'; a.t = G.rr(2, 4); }
      return true;
    },
  });
  function mark(a, S) {
    Me.m(a).mk = S.clock; Me.count('marca');
    const dusk = Me.phase() === 'crepúsculo' || G.isNight();
    if (a.kind === 'lion' && dusk) { Me.gesto(a, 'roar'); if (G.VR() < 0.7) G.Audio && G.Audio.at(a.x, a.y, 'roar', false, 0.5); }
    else if (a.kind === 'wolf' && G.isNight()) { Me.gesto(a, 'howl'); if (G.VR() < 0.8) G.Audio && G.Audio.at(a.x, a.y, 'howl', true); a.howl = 2; }
    else Me.gesto1(a, G.R() < 0.6 ? MARK[a.kind] || ['mark'] : (MARK[a.kind] || ['mark']).slice(1).concat(['mark']));
  }
  // a grown one of its kind from another group, on its ground
  function intruder(a) {
    const R = TERR[a.kind]; let best = null, bd = 64;
    A.near(a.x, a.y, 8, o => {
      if (o === a || o.dead || o.held || o.caught || o.kind !== a.kind || o.grown < 1 || head(o) === a.id || o.tamed || o.legend) return;
      if (G.dist(o.x, o.y, a.hx, a.hy) > R) return; const d = G.dist2(a.x, a.y, o.x, o.y); if (d < bd) { bd = d; best = o; }
    });
    return best;
  }
  // the meeting: the one whose ground it is goes at the other — a contest of the territory (the intruder in the middle of a meal,
  // a hunt or a flight is let be: it will be met again)
  function meet(a, o, S) {
    if (!Me.free(o) && o.state !== 'patrol' && o.state !== 'court') return;
    Me.contest(a, o, 3); Me.meet(a, 1, o.id); Me.meet(o, 1, a.id);
  }
  // the ground held: the intruder goes far; a nomad male that beats the pride's head takes the pride (and the cubs of the old
  // one are in danger)
  function territoryWon(win, lose, S) {
    const home = !win.leader && G.dist(win.x, win.y, win.hx, win.hy) <= (TERR[win.kind] || 10) + 4 && !win.mig;
    if (home) { const p = range(lose, 14, 22); if (p) { lose.hx = p[0]; lose.hy = p[1]; lose.mig = true; } Me.count('territorio:expulso'); return; }
    // the nomad beat the head of the ground: if a group followed the loser, it is the winner's now
    const g = A.packOf(lose); if (!g.length || lose.leader || SP[win.kind].herd[1] < 2) { const p = range(lose, 10, 18); if (p) { lose.hx = p[0]; lose.hy = p[1]; } return; }
    const L = win.leader ? S.animals.get(win.leader) || win : win; // (a coalition: its head takes the pride)
    const hx = lose.hx, hy = lose.hy;
    for (const q of g) if (q !== L) q.leader = L.id;
    if (L !== win) win.leader = L.id;
    lose.leader = 0; const p = range(lose, 16, 26); if (p) { lose.hx = p[0]; lose.hy = p[1]; lose.mig = true; }
    L.leader = 0; L.mig = false; L.hx = hx; L.hy = hy; win.hx = hx; win.hy = hy; win.mig = false;
    Me.count('tomada'); Me.count('tomada:' + win.kind);
    // the new males do not raise the old one's young
    let killed = 0;
    if (win.kind === 'lion') for (const q of g) {
      if (q.grown >= 0.45 || q.dead || (q.mind && q.mind.fa === L.id) || G.R() > 0.55) continue;
      Me.gesto1(L, ['shakekill', 'bite'], undefined, q.id); Me.gesto(q, 'throes', undefined, L.id); A.kill(q, L, 'infanticide'); killed++; Me.count('infanticidio');
    }
    if (G.Luta) { const n = G.Luta.nm(L), o = G.Luta.nm(lose); G.Luta.say('tomada:' + win.kind, `${G.cap(n.art)} ${n.n} nômade venceu ${o.art.replace(/^uma?/, o.g === 'f' ? 'a' : 'o')} ${o.n} que guardava o bando${G.Luta.where(L.x, L.y)} e tomou o seu lugar.${killed ? ` ${killed > 1 ? `Os ${killed} filhotes do antigo macho não sobreviveram` : 'Um filhote do antigo macho não sobreviveu'} à chegada dele.` : ''}`, L.x, L.y, 'wolf', win.kind === 'lion'); }
  }

  // ------------------------------ the sexes of a kind ------------------------------
  // a newcomer from far lands (the immigration of animals.js): of the sex its kind lacks here, when it lacks one
  Me.newcomer = function (a) {
    if (!Me.has(a, SP[a.kind])) return; let mm = 0, ff = 0;
    for (const o of G.S.animals.values()) if (o !== a && !o.dead && o.kind === a.kind && o.grown >= 1) { if (Me.sex(o)) mm++; else ff++; }
    const m = Me.m(a); if (!mm && ff) m.sx = 1; else if (!ff && mm) m.sx = 0;
  };
  // the kinds whose grown ones are all of one sex (the immigration brings one of the other: animals.js)
  Me.oneSex = function () {
    const f = {}, m = {}; for (const a of G.S.animals.values()) { if (a.dead || a.grown < 1 || !Me.has(a, SP[a.kind]) || a.legend || a.tamed) continue; if (Me.sex(a)) m[a.kind] = 1; else f[a.kind] = 1; }
    const out = new Set(); for (const k in f) if (!m[k]) out.add(k); for (const k in m) if (!f[k]) out.add(k); return out;
  };
  // the first beasts of a world: every kind with both sexes among its grown ones
  // (and a group that arrives together — a herd from far lands, the beasts the god calls —: half and half, the leader a male)
  Me.balance = function (list) {
    const by = {}; for (const a of list || G.S.animals.values()) { if (a.dead || a.grown < 1 || !Me.has(a, SP[a.kind])) continue; (by[a.kind] || (by[a.kind] = [])).push(a); }
    for (const k in by) {
      const l = by[k]; if (l.length < 2) continue; l.sort((p, q) => p.id - q.id);
      let m = 0; for (const a of l) if (Me.sex(a) === 1) m++;
      // the many of one sex give one in two to the other, by the order of their ids (nobody sees them yet: a world just made)
      for (let i = 0; i < l.length && Math.abs(2 * m - l.length) > 1; i++) { const a = l[i]; const s = Me.sex(a); if ((2 * m > l.length) === (s === 1)) { Me.m(a).sx = s ? 0 : 1; m += s ? -1 : 1; } }
    }
  };

  // ------------------------------ the inspector ------------------------------
  // what the beast is doing, and why — read only: the god's panel asks
  const SAYS = { sleep: 'Dormindo', watch: 'De sentinela, enquanto os outros dormem', rest: 'Descansando', groom: 'Cuidando de si', social: 'Junto dos seus', young: 'Seguindo a mãe', suckle: 'Mamando', nurse: 'Amamentando o filhote', play: 'Brincando', hide: 'Escondido no capim', heat: 'No cio', court: 'Cortejando uma fêmea', contest: 'Numa disputa', patrol: 'Patrulhando o território',
    hold: 'Segurando a presa', stand: 'Encarando um predador', trail: 'Seguindo o rastro da presa que picou', digest: 'Digerindo', wait: 'Esperando a vez na carcaça', fish: 'Pescando', stalk: 'Espreitando a presa', flank: 'Cercando a presa', pounce: 'Saltando sobre a presa' };
  Me.says = a => SAYS[a.state] || null;
  Me.why = function (a) {
    const m = a.mind; if (!m || a.dead) return '';
    const out = []; const st = a.state;
    if (st === 'sleep' || st === 'watch') out.push(Me.sleepTime(a.kind) > 0.5 ? (G.isNight() ? 'é noite' : 'é a hora de dormir da sua espécie') : 'está cansad' + (SP[a.kind].g === 'f' || m.sx === 0 ? 'a' : 'o'));
    if (st === 'contest') out.push(a.bq === 2 ? 'pela fêmea' : a.bq === 3 || (G.S.animals.get(a.target) || {}).bq === 3 ? 'pelo território' : 'pelo posto no grupo');
    if (m.f > 0.5) out.push('com medo'); if (m.g > 0.5) out.push('irritad' + (m.sx === 0 ? 'a' : 'o'));
    if (m.st < 0.25) out.push('sem fôlego'); else if (m.en < 0.2 && st !== 'sleep') out.push('exaust' + (m.sx === 0 ? 'a' : 'o'));
    if (m.es > 0) out.push('no cio'); if (m.pg > 0 || Me.due(a)) out.push('prenhe');
    const w = a.wnd; if (w) { if ((w.j || 0) > 0.4) out.push('a mandíbula ferida'); if (w.l > 0.35) out.push('mancando'); if (w.b > 0.15) out.push('sangrando'); }
    if (a.leader === 0 && m.rk >= 1 && SP[a.kind].herd && SP[a.kind].herd[1] >= 2 && groupOf(a)) out.push(MATRI.has(a.kind) && m.sx === 0 ? 'a matriarca' : 'quem guia o grupo');
    const tr = []; if (Me.trait(a, 'b') > 0.85) tr.push('ousad'); if (Me.trait(a, 'v') > 0.9) tr.push('arisc'); if (Me.trait(a, 'c') > 0.85) tr.push('curios'); if (Me.trait(a, 'g') > 0.85) tr.push('brigã');
    for (const t of tr) out.push(t === 'brigã' ? (m.sx === 0 ? 'brigona' : 'brigão') : t + (m.sx === 0 ? 'a' : 'o'));
    return out.join(' · ');
  };
})(window.G);
