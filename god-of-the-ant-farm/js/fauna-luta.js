'use strict';
// ============================================================
//  Luta: the hunt and the fight of the beasts (D-276, D-297 to
//  D-299) — the chase with its breath (the stamina of the mind:
//  the cats' short burst, the dogs' long trot), the prey that cuts
//  aside and the hunter that overruns it, the hunter that gives up
//  when the breath fails; the way each kind brings its prey down
//  and kills it (the hold: two bodies, one placed by the other —
//  L.place is the only door); the prey that fights back (the kick,
//  the horns, the herd that stands and the herd that charges, the
//  mother); the wounds and what they cost later (a.wnd: they bleed,
//  they lame, they heal); the carcass and who takes it from whom;
//  and a few lines in the chronicle when something remarkable
//  happens. World module: chance only from G.R; what is only seen
//  or heard (the blood, the dust, the sound) from G.VR.
//  a.wnd (written only here, rule 97): b the bleeding (hp a
//  second), l the limp (0..1), z the six zones [head, neck,
//  forequarters, flank, hindquarters, legs] (0..1 each), j the jaw
//  of a hunter kicked in the face (0..1), v the venom in it (0..1),
//  w who wounded it last (an id), e 1 when it broke out of jaws,
//  h the hold it is in ([holder, kind, seconds, grip, breath]).
// ============================================================
(function (G) {
  const L = G.Luta = {};
  const A = G.Animals, W = G.W, T = G.T, Me = G.Mente;
  const SP = A.DEF, GR = G.Gestos.GROUPS;
  const set = l => new Set(l);
  const CAT = set(['lion', 'tiger', 'leopard', 'jaguar', 'snowleopard']);
  const SMALLC = set(['fox', 'arcticfox', 'fennec', 'gato']);
  const PACK = set(['wolf', 'hyena']);
  const BEAR = set(['bear', 'polarbear']);
  const KICK = set(GR.kicker);
  const HORN = set([...GR.horned, ...GR.antler, 'boar', 'elephant', 'rhino']);
  // the kinds whose grown ones stand and face a hunter, with their own around them; and those that ring their young
  const DEFEND = set(['buffalo', 'muskox', 'elephant', 'rhino', 'hippo', 'bison', 'moose', 'boar', 'walrus', 'giraffe', 'zebra']);
  const RING = set(['muskox', 'elephant', 'buffalo', 'bison']);
  const SMALLER = set(['zebra', 'giraffe', 'boar']);
  const ARMED = k => ['charge', 'kick', 'gore', 'stomp', 'swipe', 'bite'].some(g => G.Gestos.can(k, g)) && SP[k].size >= 0.85;
  const GIANT = set(['hippo', 'rhino', 'elephant', 'walrus']);
  const SWALLOW = set(['python', 'anaconda', 'viper']);
  const r2 = x => Math.round(x * 100) / 100;
  const clamp01 = x => (x < 0 ? 0 : x > 1 ? 1 : x);
  // the holds (the kind of a hold, a.wnd.h[1]) and the ways that are not holds
  const RUMP = 1, THROAT = 2, MUZZLE = 3, NAPE = 4, SKULL = 5, PIN = 6, CROC = 7, COIL = 8, PULL = 9, SHAKE = 10, HARASS = 11, VENOM = 12, BITE = 13;
  L.K = { RUMP, THROAT, MUZZLE, NAPE, SKULL, PIN, CROC, COIL, PULL, SHAKE, HARASS, VENOM, BITE };
  const KN = ['', 'lombo', 'garganta', 'focinho', 'nuca', 'crânio', 'pino', 'crocodilo', 'abraço', 'derrubada', 'sacudida', 'acosso', 'veneno', 'mordida'];
  L.kname = k => KN[k] || '';
  // the zones of a body (a.wnd.z): the head, the neck and throat, the forequarters, the flank and belly, the hindquarters, the legs.
  // A gesture's variant (gestV) on a blow or a hold is the zone it went to, plus one (1 head … 6 legs); on a fall, a stagger, a jink
  // or a kick, the side: 1 left, 2 right, 3 front, 4 back
  const HEAD = 0, NECK = 1, FORE = 2, FLANK = 3, RUMPZ = 4, LEGS = 5;
  const BLEED = [0.3, 1.0, 0.45, 0.7, 0.55, 0.35];
  const HEAL = 0.0025, HEAL_J = 0.0008;
  // the tallies (diagnostics for the proofs: a new world, a load, from zero)
  L.tally = {}; L.count = (k, n) => { L.tally[k] = (L.tally[k] || 0) + (n || 1); };
  G.worldHooks.push(() => { L.tally = {}; });

  // ------------------------------ the breath of each kind ------------------------------
  // e: seconds of a full sprint, r: seconds to get the breath back, b: the burst (× its run), ag: how quick it turns, jink: 1 cuts
  // aside, 2 doubles back
  const PROF = {};
  const prof = (ks, o) => { for (const k of ks) PROF[k] = Object.assign({ e: 20, r: 25, b: 1, ag: 0.5, jink: 0 }, o); };
  prof(['lion'], { e: 8, r: 30, b: 1.33, ag: 0.5 }); prof(['tiger'], { e: 7, r: 32, b: 1.32, ag: 0.5 }); prof(['leopard'], { e: 7, r: 28, b: 1.36, ag: 0.66 });
  prof(['jaguar'], { e: 6, r: 30, b: 1.3, ag: 0.6 }); prof(['snowleopard'], { e: 9, r: 28, b: 1.3, ag: 0.78 });
  prof(['wolf'], { e: 60, r: 40, b: 1.06, ag: 0.55 }); prof(['hyena'], { e: 50, r: 40, b: 1.05, ag: 0.45 });
  prof(['fox', 'arcticfox', 'fennec'], { e: 15, r: 20, b: 1.12, ag: 0.85 }); prof(['bear'], { e: 10, r: 35, b: 1.15, ag: 0.3 }); prof(['polarbear'], { e: 8, r: 35, b: 1.15, ag: 0.3 });
  prof(['croc'], { e: 3, r: 30, b: 1, ag: 0.3 }); prof(['python', 'anaconda', 'viper'], { e: 2.5, r: 30, b: 2.2, ag: 0.4 }); // (the snake's strike: a lash, over in a moment)
  prof(['gazelle'], { e: 22, r: 22, b: 1, ag: 0.95, jink: 1 }); prof(['rabbit', 'hare'], { e: 12, r: 18, b: 1, ag: 1, jink: 2 }); prof(['ostrich'], { e: 30, r: 25, ag: 0.7, jink: 1 });
  prof(['zebra'], { e: 30, r: 25, ag: 0.55 }); prof(['gnu'], { e: 35, r: 25, ag: 0.5 }); prof(['deer'], { e: 22, r: 22, ag: 0.75, jink: 1 }); prof(['reindeer'], { e: 40, r: 25, ag: 0.5 });
  prof(['moose'], { e: 25, r: 30, ag: 0.35 }); prof(['giraffe'], { e: 20, r: 30, ag: 0.25 }); prof(['buffalo'], { e: 15, r: 30, ag: 0.3 }); prof(['bison'], { e: 30, r: 30, ag: 0.35 });
  prof(['elephant'], { e: 20, r: 30, ag: 0.2 }); prof(['ibex'], { e: 15, r: 22, ag: 0.9, jink: 1 }); prof(['boar'], { e: 15, r: 25, ag: 0.5 }); prof(['capybara'], { e: 10, r: 20, ag: 0.5 });
  prof(['monkey'], { e: 10, r: 18, ag: 0.9, jink: 1 }); prof(['tapir'], { e: 15, r: 25, ag: 0.35 }); prof(['camel'], { e: 40, r: 30, ag: 0.3 }); prof(['muskox'], { e: 10, r: 30, ag: 0.3 });
  prof(['rhino'], { e: 15, r: 30, ag: 0.3 }); prof(['hippo'], { e: 8, r: 30, ag: 0.2 }); prof(['lizard', 'frog'], { e: 6, r: 15, ag: 0.9, jink: 1 });
  L.prof = k => PROF[k] || (PROF[k] = { e: 20, r: 25, b: 1, ag: 0.5, jink: 0 });

  // ------------------------------ the names, the place, the chronicle ------------------------------
  const FEM = { lion: 'leoa', tiger: 'tigresa', wolf: 'loba', bear: 'ursa', polarbear: 'ursa-polar' };
  // a beast as the chronicle names it: «uma leoa», «um búfalo» (n the noun, g its gender, art the indefinite article)
  L.nm = function (a) { const sp = SP[a.kind]; const f = FEM[a.kind] && Me.sex(a) === 0; const n = f ? FEM[a.kind] : sp.name.toLowerCase(); const g = f ? 'f' : sp.g; return { n, g, art: g === 'f' ? 'uma' : 'um', def: g === 'f' ? 'a' : 'o' }; };
  // where it happened, as the chronicle says it: the town, the quarter, a named place — or the river, the savanna
  L.where = function (x, y) {
    const w = G.Stories && G.Stories.where ? G.Stories.where(x, y) : null; let at = w ? w.at : '';
    if (!at || at === ' nos ermos') {
      if (!W.inb(x, y)) return '';
      const i = W.idx(x, y); if (A.waterD(i) <= 1) return G.S.type[i] === T.RIVER || A.riverNear(i) ? ' junto ao rio' : ' na beira d\'água';
      const b = G.S.biome ? G.S.biome[i] : 0; const to = (G.BIOMES[b] || {}).to || ''; at = to ? ' ' + to.replace(/^à /, 'na ').replace(/^ao /, 'no ') : '';
    }
    return at;
  };
  // a line in the chronicle — never two in a row too close, the same kind of line not again for days (the marks are the world's,
  // in the save: a load does not tell it twice, L-301). prio: something rare (a pride taken, a hunter lamed for life)
  L.say = function (key, txt, x, y, icon, prio) {
    const S = G.S; const last = G.mod('luta.log'); if (last !== undefined && S.clock - last < (prio ? 60 : 140)) return false;
    const ks = G.mod('luta.logk') || G.mod('luta.logk', {}); const kd = ks[key]; if (kd !== undefined && S.day - kd < (prio ? 2 : 4)) return false;
    ks[key] = S.day; G.mod('luta.log', Math.round(S.clock));
    G.Village.log(txt, icon || 'wolf', x, y); L.count('cronica');
    return true;
  };

  // ------------------------------ strength ------------------------------
  // the body in a struggle: its size, how grown, how hurt, how lame — and the male lion's weight
  L.strength = function (a) {
    const sp = SP[a.kind]; let s = sp.size * sp.size * (a.grown || 1) * (0.35 + 0.65 * a.hp / a.maxHp) * (a.big || 1);
    const w = a.wnd; if (w) s *= Math.max(0.2, 1 - 0.35 * Math.min(1, w.l) - 0.4 * Math.min(1, w.j || 0));
    if (a.kind === 'lion' && Me.sex(a) === 1) s *= 1.3;
    return s;
  };
  const strength = L.strength;
  // the prey's fight in it: its strength and the breath it has left
  const resist = p => strength(p) * (0.45 + 0.55 * (p.mind ? p.mind.st : 1));
  // the hunters of its group near it (with it: 1)
  L.party = function (a) { let n = 1; const H = a.leader || a.id; A.near(a.x, a.y, 10, o => { if (o !== a && !o.dead && o.kind === a.kind && (o.leader || o.id) === H && o.grown >= 0.8) n++; }); return n; };
  // those of its kind at the same prey, close
  function helpers(a, p) { let n = 0; A.near(p.x, p.y, 2.4, o => { if (o !== a && !o.dead && o.kind === a.kind && o.target === p.id && (o.state === 'chase' || o.state === 'hold')) n++; }); return n; }
  // can this hunting party take it down? (a lone lioness and a buffalo: no; four of them: yes)
  L.canTake = function (a, p, party) {
    const sa = SP[a.kind], sp = SP[p.kind]; if (sa.cls === 'water' || sa.cls === 'air') return true;
    if (GIANT.has(p.kind) && p.grown >= 0.7) return false; // (the hippo, the rhino, the elephant: only their young are prey)
    // (a grown, sound defender bigger than the hunter — the buffalo, the bison, the moose, the musk ox, the giraffe, the zebra for
    // a hyena — is not chosen at all by one alone, nor by a party that is not starving: only its young, its old, its hurt and its
    // spent are. A lion at the water with no zebra by took the hippo or the buffalo and was killed by it. The snakes and the
    // crocodile, that hold and drown, are not asked)
    if (DEFEND.has(p.kind) && p.grown >= 0.8 && sp.size > sa.size * 1.02 && !SWALLOW.has(a.kind) && a.kind !== 'croc' && L.weak(p) < 1.2 && p.hp > p.maxHp * 0.55 && !((party || 1) >= 3 && a.hunger > 0.7)) return false;
    const ps = sp.size * (p.grown < 1 ? 0.35 + 0.65 * p.grown : 1) * (p.wnd && p.wnd.l > 0.4 ? 0.85 : 1);
    const as = sa.size * (a.grown || 1) * (1 - 0.3 * Math.min(1, (a.wnd && a.wnd.j) || 0));
    // (the snake swallows what is bigger than it, the venom fells what it could never hold; the crocodile drowns what it could
    // not throw down on land)
    return ps <= as * (SWALLOW.has(a.kind) ? 1.6 : a.kind === 'croc' ? 1.3 : 1.05 + 0.4 * ((party || 1) - 1));
  };
  // how much a hunter is drawn to this one rather than another: the wounded, the old, the spent (and the young, in findPrey)
  L.weak = function (p) {
    let s = 0; const w = p.wnd; if (w) s += 1.5 * (w.l + Math.min(1, w.b));
    const sp = SP[p.kind]; if (p.age > sp.life * (p.lifeMul || 1) * 0.8) s += 1.2;
    if (p.mind && p.mind.st < 0.3) s += 1;
    return s;
  };

  // ------------------------------ the wounds ------------------------------
  const wnd = a => a.wnd || (a.wnd = { b: 0, l: 0, z: [0, 0, 0, 0, 0, 0], j: 0, v: 0, w: 0, e: 0, h: null });
  // a wound: a zone, how bad (0..1), by whom; it bleeds by the zone and the size of the body
  L.wound = function (a, z, sev, by) {
    if (a.dead || !(sev > 0)) return; const w = wnd(a); z = z | 0; if (z < 0 || z > 5) z = FLANK;
    w.z[z] = clamp01(w.z[z] + sev); w.b = Math.min(4, w.b + sev * BLEED[z] * Math.sqrt(a.maxHp / 30));
    w.l = Math.min(1, Math.max(w.z[LEGS], w.z[RUMPZ] * 0.7)); if (by && by.id) w.w = by.id;
    L.count('ferida');
  };
  // the wound back from the save, in place (a damaged one: none)
  L.unpack = function (a) {
    const p = a.wnd; if (!p || typeof p !== 'object') { a.wnd = null; return; }
    const z = Array.isArray(p.z) && p.z.length === 6 && p.z.every(Number.isFinite) ? p.z.map(clamp01) : [0, 0, 0, 0, 0, 0];
    const num = v => (Number.isFinite(v) ? v : 0);
    const h = Array.isArray(p.h) && p.h.length === 5 && p.h.every(Number.isFinite) ? p.h.slice() : null;
    a.wnd = { b: Math.max(0, Math.min(4, num(p.b))), l: clamp01(num(p.l)), z, j: clamp01(num(p.j)), v: clamp01(num(p.v)), w: num(p.w), e: num(p.e) ? 1 : 0, h };
  };
  // the wound as the save keeps it (rounded)
  L.pack = function (a) {
    const w = a.wnd; if (!w) return undefined;
    const o = { b: r2(w.b), l: r2(w.l), z: w.z.map(r2) }; if (w.j) o.j = r2(w.j); if (w.v) o.v = r2(w.v); if (w.w) o.w = w.w; if (w.e) o.e = 1;
    if (w.h) o.h = [w.h[0], w.h[1], r2(w.h[2]), r2(w.h[3]), r2(w.h[4])];
    return o;
  };
  // the life of a wound, twice a second: it bleeds (more while the venom works), the zones close over days, the limp goes with the
  // legs and the hindquarters, a jaw mends slowly; healed, gone
  A.lifeHooks.push(function (a, sp, dt, S) {
    const w = a.wnd; if (!w) return true;
    if (w.b > 0) {
      a.hp -= w.b * dt; w.b = w.v > 0 ? Math.max(0, w.b - dt * 0.004) : w.b * Math.exp(-dt / 45); if (w.b < 0.004) w.b = 0;
      if (a.hp <= 0) { diedOfWounds(a, S); return false; }
    }
    let any = w.b > 0 || !!w.h;
    for (let i = 0; i < 6; i++) if (w.z[i] > 0) { w.z[i] = Math.max(0, w.z[i] - dt * HEAL); if (w.z[i] > 0) any = true; }
    w.l = Math.min(1, Math.max(w.z[LEGS], w.z[RUMPZ] * 0.7));
    if (w.j > 0) { w.j = Math.max(0, w.j - dt * HEAL_J); if (w.j > 0) any = true; }
    if (w.v > 0) { w.v = Math.max(0, w.v - dt / 40); if (w.v > 0) any = true; }
    if (!any) a.wnd = null;
    return true;
  });
  function diedOfWounds(a, S) {
    const w = a.wnd; const by = w && w.w ? A.find(w.w) : null;
    A.kill(a, null, 'wounds'); L.count('morte-ferida'); L.count('morte-ferida:' + a.kind); if (by) L.count('morte-ferida-de:' + by.kind);
    if (w && w.e && by && SP[a.kind].size >= 1) { const n = L.nm(a), o = L.nm(by); L.say('ferida:' + a.kind, `${G.cap(n.art)} ${n.n} que tinha escapado das garras de ${o.art} ${o.n} não resistiu às feridas e caiu${L.where(a.x, a.y)}. Os carniceiros a acharam primeiro.`.replace(' a acharam', n.g === 'f' ? ' a acharam' : ' o acharam'), a.x, a.y, 'skull'); }
  }
  // the wounded walk slower, the spent run slower (the breath only counts in a sprint)
  A.speedHooks.push(function (a) {
    let k = 1; const w = a.wnd; if (w && w.l > 0) k *= 1 - 0.55 * w.l;
    const m = a.mind; if (m) { if (Me.sprinting(a) >= 1) k *= 0.5 + 0.5 * m.st; if (m.en < 0.12) k *= 0.85; }
    return k;
  });

  // ------------------------------ the side and the blow ------------------------------
  const unit = (x, y, fx) => { const l = Math.hypot(x, y); return l > 1e-6 ? [x / l, y / l] : [fx || 1, 0]; };
  // where o is, seen from a: 1 left, 2 right, 3 front, 4 back
  L.side = function (a, o) {
    const [hx, hy] = unit(a.fx || 0, a.fy || 0, a.face); const vx = o.x - a.x, vy = o.y - a.y;
    const dot = hx * vx + hy * vy, crs = hx * vy - hy * vx;
    return Math.abs(dot) >= Math.abs(crs) ? (dot >= 0 ? 3 : 4) : (crs > 0 ? 2 : 1);
  };
  // the zone a blow from o lands on a (from behind the hindquarters, from the front the head and neck, from the side the flank)
  const zoneFrom = (a, o) => { const s = L.side(a, o); return s === 4 ? (G.R() < 0.7 ? RUMPZ : LEGS) : s === 3 ? (G.R() < 0.5 ? HEAD : NECK) : (G.R() < 0.6 ? FLANK : FORE); };
  // a blow that hurts without the hurt one deciding anything (the clash of a contest, the grip of a hold)
  function hit(v, dmg, by, cause) {
    if (v.dead || !(dmg > 0)) return; v.hp -= dmg; v.hurt = 0.3;
    if (SP[v.kind].cls !== 'water' || G.VR() < 0.5) G.FX && G.FX.blood(v.x, v.y);
    if (v.hp <= 0) A.kill(v, by, cause || 'hunt');
  }
  const sound = (a, n, p) => { if (G.VR() < (p || 0.6)) G.Audio && G.Audio.at(a.x, a.y, n); };

  // ------------------------------ the hunt begins ------------------------------
  // (a stalk, a chase or an ambush on a beast: counted, its clock set; a young one hunted cries out to its mother)
  L.begin = function (a, p) {
    if (!p || !p.kind) return; L.count('caca'); L.count('caca:' + a.kind);
    a.ch = 0; a.cg = G.dist(a.x, a.y, p.x, p.y); a.cgT = 0;
    if (BEAR.has(a.kind) && a.state === 'chase') Me.gesto(a, 'charge', 0, p.id); // (the bear's rush: head low, at full tilt)
    if (p.grown < 0.8) L.cry(p, a);
  };
  // the young one hunted: its mother (and, in a herd that defends its young, the grown ones by it) comes at the hunter
  L.cry = function (p, pred) {
    const S = G.S; const mo = Me.mother(p); let came = 0;
    // (a mother that has something to fight with: the hooves, the horns, the teeth, the paw — the rabbit and the hare only run)
    const defends = o => !o.dead && !o.caught && !o.held && o.grown >= 1 && !A.isBusy(o.state) && G.dist(o.x, o.y, p.x, p.y) < 10 && ARMED(o.kind);
    if (mo && defends(mo) && strength(mo) * (0.6 + 0.8 * Me.trait(mo, 'b')) >= strength(pred) * 0.55) { L.charge(mo, pred); came++; }
    if (RING.has(p.kind) || p.kind === 'zebra' || p.kind === 'gnu') A.near(p.x, p.y, 8, o => { if (came >= 4 || o === mo || o.kind !== p.kind || !Me.kin(o, p) || !defends(o)) return; if (G.R() < 0.35 + 0.5 * Me.trait(o, 'b')) { L.charge(o, pred); came++; } });
    if (came) { L.count('defende-cria'); L.count('defende-cria:' + p.kind); pred.dfn = S.clock; pred.dfnK = p.kind; }
    return came;
  };

  // ------------------------------ the chase ------------------------------
  const maxChase = a => (PACK.has(a.kind) ? 70 : CAT.has(a.kind) ? 14 : BEAR.has(a.kind) ? 14 : SWALLOW.has(a.kind) ? 4 : 18);
  // the chase of a live beast, a step: the breath that fails, the herd test, the jink and the overrun, the contact (true: done)
  L.chase = function (a, p, dt, sp) {
    const S = G.S; const d = G.dist(a.x, a.y, p.x, p.y);
    a.ch += dt; a.cgT += dt;
    if (a.cgT >= 1) {
      a.cgT = 0; const gained = a.cg - d; a.cg = d; const m = a.mind;
      // no gaining and no wind left (or too long at it): it gives up — it cost it, and the next try waits
      if ((m && m.st < 0.2 && gained < 0.3 && !p.caught) || a.ch > maxChase(a)) { giveUp(a, p, S); return true; }
      // the dogs test the herd: one that runs worse, close by, is the one
      if (PACK.has(a.kind) && !p.caught && p.grown >= 1) { const q = weaker(a, p); if (q) { a.target = q.id; a.cg = G.dist(a.x, a.y, q.x, q.y); L.count('troca'); return true; } }
    }
    const reach = 0.55 + sp.size * 0.25;
    if (d < reach) { L.contact(a, p, dt); return true; }
    // thrown off by a jink: it runs on the way it was going a moment before it turns
    if (S.clock < a.turnT) { const [fx, fy] = unit(a.fx || 0, a.fy || 0, a.face); a.tx = a.x + fx * 2; a.ty = a.y + fy * 2; }
    else { a.tx = p.x; a.ty = p.y; }
    jink(p, a, d, dt, S);
    A.moveTo(a, dt, sp.run * L.prof(a.kind).b);
    return true;
  };
  function giveUp(a, p, S) {
    a.state = 'idle'; a.target = 0; a.onPerson = false; a.crouch = 0;
    const m = a.mind; a.rest = Math.max(a.rest || 0, 6 + 12 * (m ? 1 - m.st : 0.5)); a.t = G.rr(1, 3);
    Me.tire(a, 0.04);
    a.noPrey = { id: p.id, until: S.clock + 25 };
    Me.gesto1(a, ['pant', 'stare']); L.count('falha'); L.count('falha:' + a.kind);
  }
  // a weaker one of the same herd close to the hunter, clearly worse to run with
  function weaker(a, p) {
    const fit = q => (q.mind ? q.mind.st : 1) * (q.hp / q.maxHp) * (q.grown < 1 ? 0.6 : 1) * (q.wnd ? 1 - 0.5 * q.wnd.l : 1);
    let best = null, bv = fit(p) - 0.25;
    A.near(a.x, a.y, 3, q => { if (q === p || q.dead || q.caught || q.kind !== p.kind || q.held) return; if (G.dist(a.x, a.y, q.x, q.y) > 3) return; const v = fit(q); if (v < bv) { bv = v; best = q; } });
    return best;
  }
  // the prey's own way out: as the jaws come close, the quick ones cut aside — and the hare doubles back
  function jink(p, a, d, dt, S) {
    const P = L.prof(p.kind); if (!P.jink || p.state !== 'flee' || d > 1.7 || S.clock < (p.jk || 0) || p.caught) return;
    if (p.mind && p.mind.st < 0.1) return;
    if (G.R() >= 1 - Math.exp(-2.2 * dt)) return;
    const s = G.R() < 0.5 ? 1 : -1; const ang = (P.jink === 2 ? G.rr(2.3, 2.9) : G.rr(0.9, 1.5)) * s;
    let [fx, fy] = unit(p.tx - p.x, p.ty - p.y, p.face); const c = Math.cos(ang), sn = Math.sin(ang);
    const nx = fx * c - fy * sn, ny = fx * sn + fy * c;
    for (const r of [3, 2, 1.2]) { const x = p.x + nx * r, y = p.y + ny * r; if (A.walkOK(p, x, y) && A.lineOK(p, x, y)) { p.tx = x; p.ty = y; break; } }
    p.jk = S.clock + G.rr(0.9, 1.4);
    Me.gesto(p, 'jink', undefined, a.id, s > 0 ? 2 : 1); L.count('desvio'); L.count('desvio:' + p.kind);
    const Pa = L.prof(a.kind); if (Pa.ag < P.ag) a.turnT = S.clock + 0.2 + 0.6 * (P.ag - Pa.ag);
  }

  // ------------------------------ the takedown ------------------------------
  // how each kind brings its prey down
  function method(a, p) {
    const k = a.kind, sa = SP[k], sp = SP[p.kind]; const small = sp.size * (p.grown < 1 ? 0.6 + 0.4 * p.grown : 1) <= sa.size * 0.72;
    if (CAT.has(k)) return small ? (k === 'jaguar' ? SKULL : k === 'tiger' || k === 'snowleopard' ? NAPE : THROAT) : RUMP;
    if (PACK.has(k)) return small ? SHAKE : HARASS;
    if (SMALLC.has(k)) return SHAKE;
    if (BEAR.has(k)) return PIN;
    if (sa.constrict) return COIL;
    if (k === 'viper') return VENOM;
    if (k === 'croc') return CROC;
    return BITE;
  }
  L.method = method;
  // the jaws at it: a hold, a bite, a strike
  L.contact = function (a, p, dt) {
    const sa = SP[a.kind]; a.moving = false; G.faceTo(a, p.x - a.x, p.y - a.y);
    a.cd = (a.cd || 0) - dt; if (a.cd > 0) return; a.cd = 1.1;
    if (p.caught && p.caught !== a.id) { pile(a, p); return; }
    const k = method(a, p); const jaw = 1 - 0.5 * Math.min(1, (a.wnd && a.wnd.j) || 0);
    sound(a, 'bite', 0.7);
    switch (k) {
      case RUMP: case THROAT: case NAPE: case SKULL: case PIN: case COIL: case CROC:
        if (k === PIN && SP[p.kind].size > sa.size * 0.9 && p.hp > p.maxHp * 0.5) { swipe(a, p, jaw); return; }
        if (k === COIL) Me.gesto(a, 'strike', undefined, p.id, NECK + 1);
        if (k === PIN) swipe(a, p, jaw);
        if (!p.dead && !L.hold(a, p, k)) { hit(p, (6 + sa.hp * 0.15) * a.grown * jaw, a); if (p.dead) killed(a, p, BITE); }
        return;
      case SHAKE: {
        Me.gesto1(a, a.kind === 'fox' || a.kind === 'arcticfox' || a.kind === 'fennec' ? ['pounce', 'bite'] : ['bite'], undefined, p.id, NECK + 1);
        hit(p, (8 + sa.hp * 0.25) * a.grown * jaw, a); L.wound(p, NECK, 0.3, a);
        if (p.dead) { Me.gesto(a, 'shakekill', undefined, p.id); killed(a, p, SHAKE); }
        return;
      }
      case HARASS: {
        const z = G.R() < 0.6 ? RUMPZ : FLANK; Me.gesto(a, 'bite', undefined, p.id, z + 1);
        hit(p, (4 + sa.hp * 0.1) * a.grown * jaw, a); L.wound(p, z, G.rr(0.12, 0.26) * jaw, a);
        if (G.R() < 0.35) Me.gesto(p, 'stagger', undefined, a.id, L.side(p, a));
        if (KICK.has(p.kind) && L.side(p, a) === 4 && G.R() < 0.35) L.kick(p, a);
        if (p.dead) { killed(a, p, HARASS); return; }
        // worn down, or enough of the pack at it: pulled down
        const n = helpers(a, p); const m = p.mind;
        if (p.hp < p.maxHp * 0.5 || (m && m.st < 0.15) || (n >= 2 && G.R() < 0.3 + 0.15 * n)) { Me.gesto(p, 'fall', undefined, a.id, L.side(p, a)); L.hold(a, p, PULL); }
        return;
      }
      case VENOM: {
        Me.gesto(a, 'strike', undefined, p.id, FORE + 1); hit(p, 2 + sa.hp * 0.1, a);
        const w = wnd(p); w.v = 1; w.b = Math.min(4, w.b + 0.5 + 0.6 / Math.max(0.5, SP[p.kind].size)); w.w = a.id; L.count('picada');
        // it lets go: the venom works while the prey runs; the snake follows the trail
        if (!p.dead) { A.flee(p, a.x, a.y, 4); a.state = 'trail'; a.target = p.id; a.t = 60; a.cd = 2; }
        else killed(a, p, VENOM);
        return;
      }
      default: {
        const z = zoneFrom(p, a); Me.gesto(a, 'bite', undefined, p.id, z + 1);
        hit(p, (6 + sa.hp * 0.12 + (sa.apex ? 6 : 0)) * a.grown * jaw, a); L.wound(p, z, 0.15, a);
        if (p.dead) killed(a, p, BITE);
      }
    }
  };
  // the paw of a bear (or a big cat on a big beast): a blow that can throw it down
  function swipe(a, p, jaw) {
    const sa = SP[a.kind]; Me.gesto(a, 'swipe', undefined, p.id, FORE + 1); sound(a, 'hit', 0.6);
    hit(p, (8 + sa.hp * 0.12) * a.grown * jaw, a); L.wound(p, FLANK, 0.2, a);
    if (!p.dead && SP[p.kind].size <= sa.size * 1.1 && G.R() < 0.6 && G.S.clock - (p.dnT || -99) > 3) { p.dnT = G.S.clock; p.down = Math.max(p.down || 0, 1); Me.gesto(p, 'fall', undefined, a.id, L.side(p, a)); }
  }
  // the leap of a cat lands: on a small one, the killing hold at once; on a big one, the claws in its back
  L.pounced = function (a, p) {
    const sa = SP[a.kind]; sound(a, 'bite', 0.8); a.bite = 0.3; a.blood = Math.max(a.blood || 0, 0.5);
    hit(p, (5 + sa.hp * 0.06) * a.grown, a); L.wound(p, G.R() < 0.5 ? FLANK : RUMPZ, 0.18, a);
    if (p.dead) { killed(a, p, method(a, p)); return; }
    L.count('salto'); if (!L.hold(a, p, method(a, p))) { hit(p, (8 + sa.hp * 0.12) * a.grown, a); if (p.dead) killed(a, p, BITE); }
  };

  // ------------------------------ the hold ------------------------------
  // the grip by its kind: how well it holds (a jaw kicked in holds worse)
  const GRIPQ = { [RUMP]: 0.55, [THROAT]: 0.82, [MUZZLE]: 0.86, [NAPE]: 0.85, [SKULL]: 0.95, [PIN]: 0.75, [CROC]: 0.86, [COIL]: 0.9, [PULL]: 0.6 };
  L.hold = function (a, p, k) {
    // (a kept beast — the herd's cow, the town's hen — lives by another hand, the herds' and the town's, which never ask if it is
    // held: no hold on it, the bite is enough; L-1003)
    if (p.dead || p.held || p.air || (p.caught && p.caught !== a.id) || p.dom || SP[p.kind].dom || SP[p.kind].town) return false;
    const q = clamp01((GRIPQ[k] || 0.6) * (1 - 0.5 * Math.min(1, (a.wnd && a.wnd.j) || 0)) * (0.6 + 0.4 * (a.grown || 1)));
    const w = wnd(p); w.h = [a.id, k, 0, r2(q), 1];
    p.caught = a.id; p.down = 0; p.moving = false;
    a.state = 'hold'; a.target = p.id; a.t = 90; a.moving = false; a.crouch = 0; a.pounce = 0; a.grip = k === COIL ? 4 : 0; a.cd = 0.8; a.hk = 0; a.hd = k;
    p.angry = 0;
    if (k === CROC) a.dz = A.deepSpot(a);
    if (k === THROAT || k === MUZZLE) L.wound(p, NECK, 0.35, a); else if (k === NAPE || k === SKULL) L.wound(p, k === SKULL ? HEAD : NECK, 0.45, a);
    else if (k === CROC) { hit(p, (6 + SP[a.kind].hp * 0.06) * (a.grown || 1), a); if (!p.dead) L.wound(p, SP[p.kind].size > 1 ? HEAD : LEGS, 0.3, a); } // (the jaws close on a muzzle, a leg)
    holdGest(a, p, k, 0);
    L.place(a, p);
    L.count('agarra'); L.count('agarra:' + a.kind + ':' + KN[k]);
    if (p.grown < 0.8) L.cry(p, a);
    return true;
  };
  // the gestures of a hold: the holder's, by its kind and phase; the held one struggles, then lies in its throes
  function holdGest(a, p, k, ph) {
    const g = k === RUMP ? 'grip' : k === THROAT ? 'throat' : k === MUZZLE ? 'throat' : k === NAPE || k === SKULL ? 'nape' : k === PIN ? 'pin' : k === COIL ? 'coil' : k === CROC ? (ph === 2 ? 'deathroll' : ph === 1 ? 'drag' : 'grip') : a.kind === 'hyena' ? 'grip' : 'throat';
    const v = k === RUMP ? RUMPZ + 1 : k === MUZZLE || k === SKULL ? HEAD + 1 : k === CROC ? (SP[p.kind].size > 1 ? HEAD + 1 : LEGS + 1) : NECK + 1;
    const playing = o => o.gest && o.gestD > 0 && o.gestT < o.gestD; // (a blow, a fall, a kick still being made is let finish)
    if (!playing(a) && (a.gest !== g || a.gestO !== p.id)) { if (!Me.gesto(a, g, 0, p.id, v)) Me.gesto1(a, ['grip', 'bite'], 0, p.id, v); }
    const r = p.wnd && p.wnd.h; const weak = r && r[4] < 0.35 && k !== RUMP; const pg = weak ? 'throes' : 'struggle';
    if (!playing(p) && p.gest !== pg) Me.gesto(p, pg, weak ? 3 : 0, a.id, L.side(p, a));
  }
  // the one door that puts two bodies of a hold where they are (rule 98): the held one at the holder's jaws — across them (a
  // throat, a pin), along them (a coil, a crocodile's grip) —; a cat on the back of a running prey hangs behind its hindquarters
  L.place = function (h, p) {
    const r = p.wnd && p.wnd.h; const k = r ? r[1] : THROAT; const hs = SP[h.kind].size, ps = SP[p.kind].size;
    if (k === RUMP) {
      const [gx, gy] = unit(p.fx || 0, p.fy || 0, p.face); const d = 0.26 * (hs + ps);
      const x = p.x - gx * d, y = p.y - gy * d; if (A.walkOK(h, x, y)) { h.x = x; h.y = y; }
      G.faceTo(h, p.x - h.x, p.y - h.y); h.moving = p.moving; return;
    }
    const [fx, fy] = unit(h.fx || 0, h.fy || 0, h.face);
    const d = k === COIL ? 0.06 : k === PIN ? 0.22 * hs + 0.12 * ps : k === CROC ? 0.3 * hs + 0.22 * ps : 0.26 * hs + 0.2 * ps;
    const x = h.x + fx * d, y = h.y + fy * d;
    if (W.inb(x, y) && (k === CROC || A.walkOK(p, x, y))) { p.x = x; p.y = y; } else { p.x = h.x + fx * 0.05; p.y = h.y + fy * 0.05; }
    if (k === COIL || k === CROC) G.faceTo(p, fx, fy); else G.faceTo(p, -fy, fx);
    p.moving = false; p.tx = p.x; p.ty = p.y; p.path = null;
  };
  // the one held, each step (from heldDown): its holder still holding it — or it is loose
  L.held = function (p, dt) {
    if (p.caught) {
      const h = G.S.animals.get(p.caught); const r = p.wnd && p.wnd.h;
      if (!h || h.dead || h.held || h.air || h.state !== 'hold' || h.target !== p.id || !r || r[0] !== h.id) {
        L.release(p, 'perdeu'); if (h && h.state === 'hold' && h.target === p.id) endHold(h); // (the god's hand took the holder up: it holds nothing)
        return true;
      }
      p.hurt = 0.1; if (r[1] !== RUMP) { p.moving = false; p.walkPh += dt * 14; }
      return true;
    }
    if (p.down > 0) { p.down -= dt; p.moving = false; p.walkPh += dt * 12; if (p.down <= 0 && !p.dead) Me.gesto(p, 'rise'); return true; }
    return false;
  };
  // loose: the holder let go or lost it ('perdeu': it falls and gets up), or it broke free ('livre': up and away)
  L.release = function (p, why, from) {
    const w = p.wnd; const r = w && w.h; p.caught = 0; if (w) w.h = null;
    if (p.dead) return;
    if (why === 'livre') { if (w) w.e = 1; p.down = 0; Me.gesto(p, 'rise'); const h = from || (r && G.S.animals.get(r[0])); if (h) A.flee(p, h.x, h.y, 7); Me.fright(p, 1); }
    else { p.down = 0.6; Me.gesto(p, 'fall', undefined, r ? r[0] : 0, 3); }
  };
  // a beast dies (A.kill): what it held is let go, what held it lets go, the hunters of it and its own remember
  L.onDeath = function (a, by, cause) {
    const S = G.S;
    if (a.caught) { a.caught = 0; } if (a.wnd) a.wnd.h = null;
    A.near(a.x, a.y, 4, p => { if (p !== a && p.caught === a.id) L.release(p, 'livre', a); });
    if (by && by.kind) { L.count('morte:' + a.kind + ':' + by.kind); }
    if (cause === 'hunger' && A.predator(a.kind) && SP[a.kind].diet !== 'scav' && !SP[a.kind].town && !SP[a.kind].dom) { L.count('fome-predador'); L.count('fome-predador:' + a.kind); if (a.wnd && a.wnd.j > 0.3) { L.count('fome-mandibula'); const n = L.nm(a); L.say('fome:' + a.kind, `${G.cap(n.art)} ${n.n} de mandíbula quebrada, que já não conseguia caçar, morreu de fome${L.where(a.x, a.y)}.`, a.x, a.y, 'skull', true); } }
    // its own remember the place where one of them died to a hunter (and the hunter)
    if (by && by.kind && by !== a) A.near(a.x, a.y, 10, o => { if (o !== a && !o.dead && o.kind === a.kind && Me.kin(o, a)) { Me.place(o, 3, a.x, a.y); Me.meet(o, 1, by.id); } });
  };
  // the hold, the holder's state (busy, hunting): a step of the struggle
  function holdStep(a, dt, sp, S) {
    const p = S.animals.get(a.target);
    if (p && p.dead) { killed(a, p, a.hd || PULL); return true; }
    const r = p && p.wnd && p.wnd.h;
    if (!p || !r || r[0] !== a.id || p.caught !== a.id) { endHold(a); return true; }
    if (p.held || p.air) { L.release(p, 'perdeu'); endHold(a); return true; }
    r[2] += dt; a.t -= dt; a.moving = false;
    if (a.t <= 0) { L.release(p, 'perdeu'); endHold(a); return true; } // (a hold that will not end: let go)
    const k = r[1]; const sz = SP[p.kind].size;
    a.hk -= dt; if (a.hk <= 0) { a.hk = 0.8; a.hn = helpers(a, p); }
    const n = a.hn || 0; const P = strength(a) * (1 + 0.55 * n), R = resist(p); const ratio = R / Math.max(0.05, P);
    const q = r[3];
    if (k === RUMP) {
      // the prey runs on with the cat on its back, bucking; it is pulled down — or shakes the cat off
      const [fx, fy] = unit(p.tx - p.x, p.ty - p.y, p.face);
      if (Math.hypot(p.tx - p.x, p.ty - p.y) < 0.6) { p.tx = p.x + fx * 3; p.ty = p.y + fy * 3; }
      A.moveTo(p, dt, SP[p.kind].run * 0.3 * (p.mind ? 0.4 + 0.6 * p.mind.st : 1));
      if (KICK.has(p.kind) && G.R() < 1 - Math.exp(-dt * 0.5)) { if (L.kick(p, a)) return true; }
      else if (p.gest !== 'buck' && G.Gestos.can(p.kind, 'buck') && G.R() < 1 - Math.exp(-dt * 0.7)) Me.gesto(p, 'buck', undefined, a.id, L.side(p, a));
      if (G.R() < 1 - Math.exp(-dt * 0.35 * ratio * (1 - q))) { L.count('escapa'); L.count('escapa:' + p.kind); L.release(p, 'livre', a); endHold(a); Me.gesto(a, 'fall', undefined, p.id, 4); return true; }
      if (G.R() < 1 - Math.exp(-dt * 0.6 / Math.max(0.3, ratio))) {
        // down: the fall, and the grip moves to the throat (on the big ones, the muzzle)
        Me.gesto(p, 'fall', undefined, a.id, L.side(p, a)); sound(p, 'thud', 0.7); L.count('derruba'); L.count('derruba:' + a.kind);
        r[1] = sz >= 1.3 ? MUZZLE : THROAT; a.hd = r[1]; r[2] = 0; r[3] = r2(clamp01(GRIPQ[r[1]] * (1 - 0.5 * Math.min(1, (a.wnd && a.wnd.j) || 0))));
        L.wound(p, NECK, 0.3, a); holdGest(a, p, r[1], 0); L.place(a, p); return true;
      }
      holdGest(a, p, k, 0); L.place(a, p); return true;
    }
    if (k === CROC) {
      // the grip, the drag to the deep water, the roll, the drowning
      const ph = r[2] < 1.2 ? 0 : r[2] < 5 ? 1 : r[2] < 8.5 ? 2 : 3;
      if (ph === 1 && a.dz) { a.tx = a.dz[0]; a.ty = a.dz[1]; A.moveTo(a, dt, sp.sp * 0.8); }
      if (ph === 2) { a.roll = Math.max(a.roll || 0, 0.5); a.rd = (a.rd || 0) - dt; if (a.rd <= 0) { a.rd = 0.45; hit(p, 9 + 6 * q, a); L.wound(p, G.R() < 0.5 ? LEGS : FORE, 0.12, a); if (G.VR() < 0.6) G.FX && G.FX.splash(a.x + G.vrr(-0.4, 0.4), a.y + G.vrr(-0.4, 0.4), 0.6); } }
      else a.roll = 0;
      if (ph >= 1) r[4] = Math.max(0, r[4] - dt / (6 + 3 * sz));
      if (ph <= 1 && G.R() < 1 - Math.exp(-dt * 0.3 * ratio * (1 - q))) { L.count('escapa'); L.count('escapa:' + p.kind); L.count('escapa-croc'); L.release(p, 'livre', a); endHold(a); return true; }
      if (r[4] <= 0) { A.kill(p, a, 'hunt'); killed(a, p, CROC); return true; }
      if (r[4] < 0.6) p.hp = Math.min(p.hp, p.maxHp * (0.1 + 0.9 * r[4]));
      holdGest(a, p, k, ph >= 2 ? 2 : ph); L.place(a, p); return true;
    }
    // the killing holds: the breath goes (the throat, the coils), or the bite does it (the nape, the skull), or the pack and the
    // bear tear it; the prey fights it while it has breath
    let fall = 0;
    if (k === THROAT || k === MUZZLE) fall = dt / (4 + 5 * sz * (k === MUZZLE ? 1.2 : 1)) * (0.7 + 0.3 * q) * (1 + 0.25 * n);
    else if (k === NAPE) fall = dt / (2.5 + 3 * sz);
    else if (k === SKULL) fall = dt / (1.2 + 1.5 * sz);
    else if (k === COIL) fall = dt / (5 + 4 * sz) * (0.7 + 0.3 * q);
    r[4] = Math.max(0, r[4] - fall);
    a.cd -= dt;
    if ((k === PULL || k === PIN) && a.cd <= 0) {
      a.cd = k === PIN ? 0.9 : 0.8; const jaw = 1 - 0.5 * Math.min(1, (a.wnd && a.wnd.j) || 0);
      const dmg = (k === PIN ? 8 + sp.hp * 0.1 : 6 + sp.hp * 0.1 * (1 + 0.7 * n)) * a.grown * jaw;
      hit(p, dmg, a, 'hunt'); L.wound(p, G.R() < 0.5 ? NECK : FLANK, 0.15, a);
      if (k === PIN) Me.gesto1(a, G.R() < 0.7 ? ['maul', 'pin'] : ['swipe', 'maul'], 0, p.id, FLANK + 1);
      else if (a.kind === 'hyena') Me.gesto(a, 'tear', 0, p.id, FLANK + 1);
      if (p.dead) { killed(a, p, k); return true; }
    } else if (fall > 0) {
      if (r[4] <= 0) { A.kill(p, a, 'hunt'); killed(a, p, k); return true; }
      p.hp = Math.min(p.hp, p.maxHp * (0.08 + 0.92 * r[4]));
    }
    // the struggle: a chance to break the hold, while there is breath in it; the kickers kick
    const br = (k === SKULL || k === NAPE ? 0.12 : k === PULL ? 0.3 / (1 + n) : 0.25) * ratio * (1 - q) * (r[4] > 0.35 ? 1 : 0.15);
    if (G.R() < 1 - Math.exp(-dt * br)) { L.count('escapa'); L.count('escapa:' + p.kind); L.release(p, 'livre', a); endHold(a); Me.gesto(a, 'stagger', undefined, p.id, 3); return true; }
    if (k !== COIL && KICK.has(p.kind) && r[4] > 0.4 && G.R() < 1 - Math.exp(-dt * 0.25)) { if (L.kick(p, a)) return true; }
    holdGest(a, p, k, 0); L.place(a, p);
    return true;
  }
  // a holder that turns to something else lets go first (a person's spear, an order of another module): the prey is free
  L.drop = function (a) { if (a.state !== 'hold') return; const p = G.S.animals.get(a.target); if (p && p.caught === a.id) L.release(p, 'livre', a); endHold(a); };
  function endHold(a) { if (a.state === 'hold') a.state = 'idle'; a.target = 0; a.t = G.rr(1, 2); a.grip = 0; a.roll = 0; a.hd = 0; a.rest = Math.max(a.rest || 0, 6); }
  A.behave('hold', holdStep, { busy: true, hunting: true });

  // ------------------------------ the kill, and the meal ------------------------------
  function killed(a, p, k) {
    const S = G.S; const w = p.wnd; if (w) w.h = null; p.caught = 0;
    a.grip = 0; a.roll = 0; a.hd = 0;
    L.count('abate'); L.count('abate:' + a.kind); L.count('abate:' + a.kind + ':' + KN[k]); L.count('presa:' + p.kind);
    a.state = 'eat'; a.target = p.id; a.t = SWALLOW.has(a.kind) ? 60 : 22; a.carc = true; a.onPerson = false; a.rest = 0;
    if (k === SHAKE || k === BITE) Me.gesto(a, 'shakekill', undefined, p.id); else Me.gesto1(a, SWALLOW.has(a.kind) ? ['swallow'] : ['tear'], 0, p.id);
    Me.place(a, 2, p.x, p.y);
    if (!(p.z > 3) && SP[p.kind].cls !== 'water' && G.Carnage && G.Carnage.decal) G.Carnage.decal(p.x, p.y, G.rr(0.14, 0.22) * Math.min(2, SP[p.kind].size), 'pool');
    chronicle(a, p, k, S);
    invite(a, p);
    if (a.kind === 'lion' && G.VR() < 0.4) G.Audio && G.Audio.at(a.x, a.y, 'roar', false, 0.45);
  }
  // the meal calls: its young, and the pride or the pack near, come to eat (the cubs get their meat so)
  function invite(a, c) {
    A.near(c.x, c.y, 10, o => {
      if (o === a || o.dead || o.kind !== a.kind || A.isBusy(o.state) || o.caught || o.held) return;
      if (!(Me.kin(o, a) || (o.mind && o.mind.mom === a.id))) return; if (o.hunger < 0.15 && o.grown >= 1) return;
      o.state = 'chase'; o.target = c.id; o.carc = true; o.t = 9;
    });
  }
  // a hunter at its kill, a step (from the 'eat' state): the gesture of the meal; the snake swallows whole (true: the step is done)
  L.feeding = function (a, c, dt, sp) {
    if (SWALLOW.has(a.kind) && !c.claim && !c.morph && !c.named && !c.legend && !c.skinned && SP[c.kind].size <= sp.size * 1.4) {
      const [fx, fy] = unit(a.fx || 0, a.fy || 0, a.face); const x = a.x + fx * 0.25, y = a.y + fy * 0.25; if (A.walkOK(c, x, y)) { c.x = x; c.y = y; }
      Me.gesto(a, 'swallow', 0, c.id); a.moving = false; a.eating = 0.4;
      const bite = Math.min(c.meat, dt * (0.4 + SP[c.kind].meat * 0.05)); c.meat -= bite; a.hunger = Math.max(0, a.hunger - bite / 6);
      if (c.meat <= 0.05) {
        // swallowed: gone, and the snake lies a long while to digest it
        c.meat = 0; A.remove(c); a.state = 'digest'; a.target = 0; a.t = G.rr(60, 120); a.rest = G.rr(100, 160); a.hunger = 0; Me.gesto(a, 'bask', 0);
        L.count('engole'); L.count('engole:' + a.kind);
      }
      return true;
    }
    if (!a.gest || (a.gest !== 'tear' && a.gest !== 'shakekill')) Me.gesto1(a, ['tear', 'chew'], 0, c.id);
    return false;
  };
  A.passive('digest'); A.passive('wait');
  // a few lines in the chronicle for a hunt worth telling: a big prey brought down, a rare way of killing
  const TELL = { [THROAT]: 'a sufocou pela garganta', [MUZZLE]: 'a sufocou apertando-lhe o focinho', [NAPE]: 'a matou com uma mordida na nuca', [SKULL]: 'a matou com uma única mordida no crânio', [PIN]: 'a prendeu no chão com as patas', [CROC]: 'a arrastou para o fundo e girou com ela até afogá-la', [COIL]: 'a enrolou até ela parar de respirar', [PULL]: 'a derrubou', [HARASS]: 'a cansou e a derrubou', [VENOM]: 'a picou e a seguiu até ela cair' };
  function chronicle(a, p, k, S) {
    const sz = SP[p.kind].size; const big = sz >= 1.25 || (sz >= 1 && (CAT.has(a.kind) || PACK.has(a.kind)) && G.R() < 0.25);
    if (!big && !a.named && !((k === SKULL || k === COIL) && sz >= 0.9)) return;
    const n = L.nm(a), q = L.nm(p); const at = L.where(p.x, p.y);
    let tell = TELL[k] || 'a matou'; if (q.g !== 'f') tell = tell.replace(/\ba\b/g, 'o').replace(/\bela\b/g, 'ele').replace(/afogá-la/, 'afogá-lo');
    const nn = helpersAt(a, p);
    let txt;
    if (PACK.has(a.kind) && nn >= 1) txt = `${a.kind === 'wolf' ? 'Uma alcateia' : 'Um bando de hienas'} acossou ${q.art} ${q.n}${at}, mordendo-${q.g === 'f' ? 'a' : 'o'} nos flancos e nas ancas até ${q.g === 'f' ? 'ela' : 'ele'} cair.`;
    else if (CAT.has(a.kind) && nn >= 1 && (k === THROAT || k === MUZZLE)) txt = `${a.kind === 'lion' ? 'As leoas de um bando' : 'Dois felinos'} cercaram ${q.art} ${q.n}${at}; ${n.art === 'uma' ? 'uma delas' : 'um deles'} ${q.g === 'f' ? 'a' : 'o'} derrubou pelo lombo e ${tell}.`;
    else if (k === RUMP || k === THROAT || k === MUZZLE) txt = `${G.cap(n.art)} ${n.n} derrubou ${q.art} ${q.n}${at} e ${tell}.`;
    else txt = `${G.cap(n.art)} ${n.n} atacou ${q.art} ${q.n}${at} e ${tell}.`;
    L.say('abate:' + a.kind + ':' + p.kind, txt, p.x, p.y, 'wolf', !!a.named);
  }
  function helpersAt(a, p) { let n = 0; A.near(p.x, p.y, 3, o => { if (o !== a && !o.dead && o.kind === a.kind && (o.target === p.id)) n++; }); return n; }
  // the others of a hunt at a prey held by one of them: they bite and tear where they can reach
  function pile(a, p) {
    const sa = SP[a.kind]; const z = G.R() < 0.5 ? RUMPZ : FLANK;
    if (!Me.gesto(a, a.kind === 'hyena' ? 'tear' : 'grip', 0, p.id, z + 1)) Me.gesto(a, 'bite', undefined, p.id, z + 1);
    hit(p, (3 + sa.hp * 0.05) * a.grown, a); L.wound(p, z, 0.08, a); L.count('ajuda');
    if (p.dead) { a.state = 'eat'; a.target = p.id; a.carc = true; a.t = 22; }
  }

  // ------------------------------ the snake on the trail ------------------------------
  // the viper struck and let go: it follows the one it bit, at a distance, until it lies still
  A.behave('trail', function (a, dt, sp, S) {
    const p = S.animals.get(a.target); a.t -= dt;
    if (!p || a.t <= 0 || (p.dead && p.meat <= 0)) { a.state = 'idle'; a.target = 0; a.t = 2; a.rest = 20; return true; }
    if (p.dead) { if (G.dist(a.x, a.y, p.x, p.y) < 0.6) { a.state = 'eat'; a.t = 60; a.carc = true; return true; } a.tx = p.x; a.ty = p.y; A.moveTo(a, dt, sp.sp * 0.7); return true; }
    if (G.dist(a.x, a.y, p.x, p.y) > 2.2) { a.tx = p.x; a.ty = p.y; A.moveTo(a, dt, sp.sp * 0.6); } else a.moving = false;
    return true;
  }, { busy: true, hunting: true });

  // ------------------------------ the prey that fights back ------------------------------
  // a kick (a zebra, a giraffe, a gnu, an ostrich, a moose): it can throw a hunter off, and a hoof in the face breaks a jaw
  L.kick = function (p, a) {
    const s = L.side(p, a); Me.gesto(p, 'kick', undefined, a.id, s); sound(p, 'hit', 0.7);
    const dmg = (6 + SP[p.kind].size * 9) * (p.kind === 'giraffe' ? 1.6 : p.kind === 'ostrich' ? 1.3 : 1) * (0.6 + 0.6 * G.R()) * (p.grown || 1);
    const face = G.R() < 0.22; hit(a, dmg, p, 'fight'); L.wound(a, face ? HEAD : FORE, dmg / a.maxHp * 1.2, p); L.count('coice'); L.count('coice:' + p.kind);
    if (a.dead) { L.count('coice-mata'); return true; }
    let lame = false;
    if (face && A.predator(a.kind) && G.R() < 0.35) { const w = wnd(a); w.j = clamp01((w.j || 0) + G.rr(0.35, 0.7)); lame = w.j > 0.5; L.count('mandibula'); }
    const hard = dmg > a.maxHp * 0.12;
    if (hard) { const fall = dmg > a.maxHp * 0.2 && G.S.clock - (a.dnT || -99) > 3; Me.gesto(a, fall ? 'fall' : 'stagger', undefined, p.id, L.side(a, p)); if (fall) { a.dnT = G.S.clock; a.down = Math.max(a.down || 0, 0.8); } }
    if (lame) { const n = L.nm(a), q = L.nm(p); L.say('mandibula:' + a.kind, `Um coice de ${q.art} ${q.n} acertou ${n.art} ${n.n} em cheio na cara${L.where(a.x, a.y)}: a mandíbula quebrou. Vai custar-lhe caçar.`, a.x, a.y, 'wolf', true); }
    // thrown off: the hold is broken
    if ((dmg > a.maxHp * 0.2 || lame) && a.state === 'hold' && a.target === p.id && p.caught === a.id) { L.count('escapa'); L.count('escapa:' + p.kind); L.release(p, 'livre', a); endHold(a); return true; }
    return false;
  };
  // the angry beast at the one it charges: by its kind, the horns, the hooves, the jaws, the paw — and a big blow throws it down,
  // making it let go of what it held (a buffalo herd mobbing lions off a calf)
  const STRIKE = k => (HORN.has(k) ? ['gore', 'toss'] : KICK.has(k) ? ['kick', 'stomp'] : k === 'hippo' ? ['bite'] : BEAR.has(k) || CAT.has(k) ? ['swipe', 'bite'] : ['bite']);
  L.strike = function (a, v, dt) {
    const sa = SP[a.kind]; a.moving = false; G.faceTo(a, v.x - a.x, v.y - a.y);
    a.cd = (a.cd || 0) - dt; if (a.cd > 0) return; a.cd = 0.9 + G.R() * 0.4;
    const down = v.down > 0 || v.caught; const big = sa.size > SP[v.kind].size * 1.25;
    let g = down && G.Gestos.can(a.kind, 'stomp') ? 'stomp' : big && G.Gestos.can(a.kind, 'toss') && G.R() < 0.4 ? 'toss' : null;
    if (!g) g = Me.gesto1(a, STRIKE(a.kind), undefined, v.id) || 'bite'; else Me.gesto(a, g, undefined, v.id);
    const mul = g === 'gore' ? 1.2 : g === 'toss' ? 1.4 : g === 'stomp' ? 1.3 : g === 'kick' ? 1.1 : 1;
    // (a prey that fights back drives the hunter off — its blows wound, they are not a hunt: a third less)
    const dmg = (6 + sa.hp * 0.12 + (sa.apex ? 6 : 0)) * (a.grown || 1) * mul * (a.legend ? 2.2 : 1) * (A.predator(a.kind) ? 1 : 0.65);
    const z = zoneFrom(v, a); sound(a, g === 'gore' || g === 'toss' ? 'gore' : g === 'bite' ? 'bite' : 'hit', 0.7);
    A.damage(v, dmg, a); L.wound(v, z, Math.min(0.6, dmg / v.maxHp * 1.2), a);
    L.count('golpe'); L.count('golpe:' + a.kind + ':' + g);
    if (v.dead) { L.count('defensor-mata'); L.count('defensor-mata:' + a.kind + ':' + v.kind); return; }
    // (a big blow throws it down — not again while it is getting up: no beast is pinned by blows, L-1001)
    if (dmg > v.maxHp * 0.18 && G.S.clock - (v.dnT || -99) > 3) {
      v.dnT = G.S.clock; Me.gesto(v, 'fall', undefined, a.id, L.side(v, a)); v.down = Math.max(v.down || 0, 0.8);
      if (v.state === 'hold') { const p = G.S.animals.get(v.target); if (p && p.caught === v.id) { L.release(p, 'livre', v); L.count('resgate'); L.count('resgate:' + a.kind); } endHold(v); }
      // (the hunter thrown down and its prey let go: the defender has driven it off — it is not there to finish it. Stamping on the
      // thrown, the herds killed more hunters than the hunters killed of them: the buffalo the lions, the moose the wolves and the
      // bears, L-1007f)
      if (A.predator(v.kind) && !a.legend && !A.predator(a.kind)) a.angry = Math.min(a.angry || 0, 1.2);
      if (A.predator(v.kind) && v.dfn && G.S.clock - v.dfn < 20 && v.dfnK === a.kind) { const n = L.nm(a), o = L.nm(v); L.say('defesa:' + a.kind, `${G.cap(n.art)} ${n.n} feriu ${o.art} ${o.n} que caçava o seu filhote${L.where(v.x, v.y)}.`, v.x, v.y, 'wolf'); }
    }
  };
  // what a beast does when another hurts it (A.damage): the much stronger it runs from; a defender, a bold one, a boar turns on it;
  // the rest run. In jaws, nothing to decide. (People: the old way, in animals.js)
  L.hurtBy = function (a, by) {
    if (!by || !by.kind || !SP[by.kind] || a.dead) return false;
    if (a.caught || a.state === 'hold' || a.state === 'contest') return true;
    const sp = SP[a.kind]; Me.anger(a, 0.6, by); Me.fright(a, 0.5);
    let theirs = strength(by); A.near(by.x, by.y, 4, o => { if (o !== by && !o.dead && o.kind === by.kind && Me.kin(o, by) && o.grown >= 1) theirs += strength(o) * 0.6; });
    const mine = strength(a) * (0.6 + 0.8 * Me.trait(a, 'b'));
    // a hunter hurt by what it hunts (the horns, the hooves of a herd that fights back) breaks off unless it is far the stronger;
    // hurt by another hunter, it fights a match; the prey that defends itself turns on one it can face
    const hunter = A.predator(a.kind), prey = Me.eats(a.kind, by.kind) || !A.predator(by.kind);
    const turns = hunter ? (prey ? mine > theirs * 2 : mine >= theirs * 0.9) : (sp.defend || sp.bold > 0 || a.kind === 'boar' || DEFEND.has(a.kind)) && mine * 1.6 > theirs;
    if (turns && a.hp > a.maxHp * 0.3) { a.angry = 10; a.target = by.id; a.state = 'chase'; Me.gesto(a, 'charge', 0, by.id); return true; }
    if (hunter && prey && a.state === 'hold') return true;
    // (the prey fought back and hurt it: the test failed — this one is let be for a while, and the hunter rests)
    if (hunter && prey) { a.noPrey = { id: by.id, until: G.S.clock + 45 }; a.rest = Math.max(a.rest || 0, G.rr(10, 20)); L.count('desiste-ferido'); }
    if (A.flee(a, by.x, by.y, 6)) a.t = 3;
    return true;
  };
  // the defenders: an adult of a kind that faces hunters stands its ground if it, with its own grown ones around, is a match
  function standRatio(a, th) {
    let mine = strength(a) * (0.6 + 0.8 * Me.trait(a, 'b')), n = 0;
    A.near(a.x, a.y, 6, o => { if (n < 5 && o !== a && !o.dead && o.kind === a.kind && o.grown >= 1 && Me.kin(o, a)) { mine += strength(o) * 0.7; n++; } });
    let theirs = strength(th); A.near(th.x, th.y, 6, o => { if (o !== th && !o.dead && o.kind === th.kind && o.grown >= 1 && Me.kin(o, th)) theirs += strength(o) * 0.8; });
    return mine / Math.max(0.05, theirs);
  }
  function youngNear(a) { let y = false; A.near(a.x, a.y, 5, o => { if (!y && o !== a && !o.dead && o.kind === a.kind && o.grown < 0.7 && Me.kin(o, a)) y = true; }); return y; }
  // the middle of its herd, for a young one of a ring (the grown ones turn out round it)
  function middle(a) { let x = 0, y = 0, n = 0; A.near(a.x, a.y, 6, o => { if (o !== a && !o.dead && o.kind === a.kind && o.grown >= 1 && Me.kin(o, a)) { x += o.x; y += o.y; n++; } }); if (n < 2) return null; x /= n; y /= n; return A.walkOK(a, x, y) ? [x, y] : null; }
  const ALARM = { gazelle: ['stot', 'snort'], ibex: ['stot', 'snort'], deer: ['stot', 'snort'], reindeer: ['stot', 'snort'], gnu: ['snort', 'stot'], zebra: ['snort', 'call'], elephant: ['trumpet'], monkey: ['call'], buffalo: ['snort', 'bellow'], hippo: ['snort'] };
  // a beast that sees danger (the fear scan, or the alarm of another): it stands, it goes into the ring, it climbs, or it runs —
  // and, when it saw it itself, says so to the others (heard: it heard it, and says nothing). Gives true if it did something
  L.react = function (a, th, lv, heard) {
    const sp = SP[a.kind]; if (!sp || !th || a.caught || a.held) return false;
    const beast = !!(th.kind && SP[th.kind]); const was = a.state;
    // (a hunter asleep, lying, eating, its belly full, is watched, not run from — the zebras by the lions that have eaten —, unless
    // it is right there)
    // (the giants grown are no prey: the hunter is watched — and, near their young, driven off: the elephants at the lions)
    if (beast && GIANT.has(a.kind) && a.grown >= 0.7 && A.predator(th.kind) && !(th.target && (G.S.animals.get(th.target) || {}).kind === a.kind)) {
      if (!heard && G.dist(a.x, a.y, th.x, th.y) < 4 && youngNear(a)) { L.charge(a, th); L.count('gigante-expulsa'); return true; }
      if (!a.gest) Me.gesto1(a, ['stare', 'threat', 'display'], undefined, th.id); return true;
    }
    if (beast && !heard && L.calm(th) && G.dist(a.x, a.y, th.x, th.y) > 2.6) { if (!a.gest) Me.gesto1(a, ['stare', 'alert'], undefined, th.id); L.count('vigia'); return true; }
    // (nor one that is not on the hunt — walking its way, lying, at its own business — until it comes inside the prey's flight
    // distance, or comes at it: run from at every look of every hunter in sight, the grazers of a land of forty years spent half
    // to four fifths of their time running from wolves and lions ten tiles off, starved, and bore no young — the land emptied,
    // L-1036)
    if (beast && !heard && !L.threatens(a, th)) { if (!a.gest) Me.gesto1(a, ['alert', 'stare'], undefined, th.id); L.count('vigia-longe'); return true; }
    if (!heard) Me.fright(a, 0.6);
    // (a defender watches a hunter that is not hunting and not close: it stands only when it comes on — the musk oxen do not spend
    // their day in a ring round a bear that only passes)
    if (beast && DEFEND.has(a.kind) && a.grown >= 1 && !A.isHunting(th.state) && th.state !== 'stalk' && G.dist(a.x, a.y, th.x, th.y) > 4) { if (!a.gest) Me.gesto1(a, ['stare', 'alert'], undefined, th.id); return true; }
    // (nor is one faced that could not take it — a lone lion by a grown buffalo, D-299b —, unless it is at its young or on the hunt:
    // faced at every look, the buffalo of the l10 stood 41 s by a lion that only stood there, L-1007f)
    if (beast && DEFEND.has(a.kind) && a.grown >= 1 && A.predator(th.kind) && !A.isHunting(th.state) && th.state !== 'stalk' && !youngNear(a) && !L.canTake(th, a, L.party(th))) { if (!a.gest) Me.gesto1(a, ['stare', 'alert'], undefined, th.id); return true; }
    // (the zebra and the giraffe stand only against a hunter smaller than they are: a hyena, a wolf — from a lion, they run)
    if (beast && DEFEND.has(a.kind) && a.grown >= 1 && a.hp > a.maxHp * 0.45 && A.predator(th.kind) && !(SMALLER.has(a.kind) && (SP[th.kind].size >= SP[a.kind].size || Me.sex(a) !== 1)) && standRatio(a, th) >= 0.9) {
      stand(a, th); if (!heard && was !== 'stand') Me.alarm(a.x, a.y, a.kind, 0.35, th); return true;
    }
    if (beast && RING.has(a.kind) && a.grown < 1) { const c = middle(a); if (c) { a.tx = c[0]; a.ty = c[1]; a.state = 'flee'; a.t = 2; return true; } }
    if (sp.arbor && !(a.z > 3) && !(beast && SP[th.kind].climb === 'tree')) { const up = A.treeNear(a.x, a.y, 3.5); if (up) { A.startClimb(a, up, true); return true; } }
    const small = a.kind === 'rabbit' || a.kind === 'hare' || a.kind === 'frog' || a.kind === 'lizard';
    if (!A.flee(a, th.x, th.y, small ? 4 : 6)) return false;
    if (!heard && was !== 'flee') { Me.gesto1(a, ALARM[a.kind] || ['startle']); if (beast || (th.id && !th.kind)) Me.alarm(a.x, a.y, a.kind, 0.5 + 0.4 * Math.max(0, 1 - G.dist(a.x, a.y, th.x, th.y) / 8), th.id ? th : null); }
    return true;
  };
  // a hunter (or anything that eats it) worth running from now: on the hunt (after it or any prey — a chase is a chase), angry,
  // coming straight at it, or inside its flight distance — the prey's fear distance (six tenths of it for one that only walks its
  // way). The rest is watched (L-1036). Asked by the reaction and by the meio's options (a beast at the water does not leave it
  // for a wolf lying ten tiles off)
  const ON_HUNT = { chase: 1, stalk: 1, pounce: 1, flank: 1, lunge: 1, strike: 1, hold: 1, lurk: 1, aguada: 1, trail: 1 }; // (the ambush too: the crocodile under the surface, the cat lying in wait by the water)
  L.comingAt = function (o, a) { if (!o.moving) return false; const ux = (o.tx || o.x) - o.x, uy = (o.ty || o.y) - o.y, wx = a.x - o.x, wy = a.y - o.y; const l = Math.hypot(ux, uy) * Math.hypot(wx, wy); return l > 1e-6 && (ux * wx + uy * wy) / l > 0.8; };
  L.threatens = function (a, th) {
    if (!th || !th.kind || !SP[th.kind] || th.dead) return true; // (a person, a point: the old ways decide)
    if (th.summoned || th.raid || th.legend) return true;
    const sp = SP[a.kind]; const d = G.dist(a.x, a.y, th.x, th.y); const fear = sp.fear || 3;
    // (after it: run, at whatever distance it is noticed; after one of its herd: the herd breaks, a little past its distance;
    // after another prey, or angry at something: only near — a wolf pack running a hare down ten tiles off sent every deer of
    // the valley running, all day long)
    if (ON_HUNT[th.state] && th.target === a.id) return true;
    if (ON_HUNT[th.state] || th.angry > 0) { const p = th.target && G.S.animals.get(th.target); const herd = !!p && p.kind === a.kind && (p.leader || p.id) === (a.leader || a.id); return d < fear * (herd ? 1.6 : 1); }
    return d < fear * (L.comingAt(th, a) ? 1 : 0.6);
  };
  const CALM = { sleep: 1, rest: 1, eat: 1, digest: 1, groom: 1, social: 1, wait: 1, nurse: 1, heat: 1, suckle: 1, watch: 1, tree: 1, play: 1 };
  L.calm = th => !!CALM[th.state] || (th.hunger < 0.2 && !A.isHunting(th.state) && th.state !== 'stalk' && !(th.angry > 0));
  function stand(a, th) {
    a.state = 'stand'; a.target = th.id; a.t = G.rr(5, 9); a.moving = false; G.faceTo(a, th.x - a.x, th.y - a.y);
    Me.gesto1(a, ['display', 'paw', 'snort', 'stare'], undefined, th.id); L.count('enfrenta'); L.count('enfrenta:' + a.kind);
  }
  // facing a hunter: it watches; too close, or at one of its own, it charges
  A.behave('stand', function (a, dt, sp, S) {
    const th = S.animals.get(a.target); a.t -= dt;
    if (!th || th.dead || th.held || a.t <= 0 || G.dist(a.x, a.y, th.x, th.y) > 10) { a.state = 'idle'; a.t = 0.5; a.target = 0; return true; }
    const d = G.dist(a.x, a.y, th.x, th.y); G.faceTo(a, th.x - a.x, th.y - a.y); a.moving = false;
    const p = (th.state === 'hold' || th.state === 'chase' || th.state === 'stalk') && th.target ? S.animals.get(th.target) : null;
    const kin = p && p !== a && Me.kin(a, p) && G.dist(a.x, a.y, p.x, p.y) < 8;
    if (d < 2.2 || (kin && (th.state === 'hold' || G.R() < 1 - Math.exp(-dt * 0.8)))) { L.charge(a, th); return true; }
    if (!a.gest && G.R() < 1 - Math.exp(-dt * 0.5)) Me.gesto1(a, ['paw', 'snort', 'display', 'stare'], undefined, th.id);
    return true;
  }, { busy: true });
  // the charge: angry at it, the horns down; the ones standing with it come too; the hunter weighs whether to run
  L.charge = function (a, th) {
    if (a.dead || a.caught) return;
    a.angry = 6 + 5 * Me.trait(a, 'g'); a.target = th.id; a.state = 'chase'; a.carc = false; Me.anger(a, 0.8, th);
    if (!Me.gesto(a, 'charge', 0, th.id)) Me.gesto1(a, ['threat', 'display'], undefined, th.id);
    if (G.Gestos.can(a.kind, 'trumpet') && G.R() < 0.6) Me.gesto(a, 'trumpet');
    L.count('investida'); L.count('investida:' + a.kind);
    A.near(a.x, a.y, 6, o => { if (o !== a && o.state === 'stand' && o.target === th.id && Me.kin(o, a) && G.R() < 0.6) { o.angry = 5 + 5 * Me.trait(o, 'g'); o.target = th.id; o.state = 'chase'; o.carc = false; Me.gesto(o, 'charge', 0, th.id); } });
    L.charged(th, a);
  };
  // the hunter charged: if what comes at it (and its own) is a match for it and its own, it lets go and runs
  L.charged = function (th, by) {
    if (!th || th.dead || th.caught || !th.kind || !A.predator(th.kind)) return;
    let mine = strength(th); A.near(th.x, th.y, 4, o => { if (o !== th && !o.dead && o.kind === th.kind && Me.kin(o, th) && o.grown >= 1) mine += strength(o) * 0.8; });
    let theirs = strength(by); A.near(by.x, by.y, 5, o => { if (o !== by && !o.dead && o.kind === by.kind && o.angry > 0 && o.target === th.id) theirs += strength(o); });
    if (theirs < mine * 0.85) return;
    if (th.state === 'hold') { const p = G.S.animals.get(th.target); if (p && p.caught === th.id) { L.release(p, 'livre', th); L.count('resgate'); L.count('resgate:' + by.kind); } endHold(th); }
    th.noPrey = { id: th.target || 0, until: G.S.clock + 30 }; th.target = 0; th.rest = Math.max(th.rest || 0, 8);
    if (A.flee(th, by.x, by.y, 7)) { Me.fright(th, 0.6); L.count('afugenta'); L.count('afugenta:' + by.kind + '>' + th.kind); }
  };
  // a round of a fight between two (a contest: ritual, light; a scuffle over a kill: hard): each lands a blow, by its strength
  L.spar = function (a, b, hard) {
    const pa = strength(a), pb = strength(b); const t = pa + pb || 1;
    const sa = SP[a.kind], sb = SP[b.kind]; hard = hard || 0.5;
    if (G.R() < 0.35 + 0.5 * pa / t) { const d = (2 + sa.hp * 0.05) * hard * (0.6 + 0.8 * G.R()); hit(b, d, a, 'fight'); L.wound(b, G.R() < 0.5 ? HEAD : FORE, 0.04 + 0.1 * hard * G.R(), a); }
    if (!b.dead && G.R() < 0.35 + 0.5 * pb / t) { const d = (2 + sb.hp * 0.05) * hard * (0.6 + 0.8 * G.R()); hit(a, d, b, 'fight'); L.wound(a, G.R() < 0.5 ? HEAD : FORE, 0.04 + 0.1 * hard * G.R(), b); }
    sound(a, HORN.has(a.kind) ? 'clack' : 'bite', 0.5); L.count('luta');
  };

  // ------------------------------ the carcass, and who takes it from whom ------------------------------
  // at a carcass others are eating: if it and its own are much stronger, it drives them off; about even, a scuffle; much weaker,
  // it waits at a distance (true: go on to eat)
  L.claim = function (a, c) {
    const S = G.S; if (S.clock < (a.kc || 0)) return a.kq === 1; // (the last look holds a moment: no scan each step)
    let theirs = 0, top = null, tk = null;
    A.near(c.x, c.y, 2.2, o => { if (o === a || o.dead || o.state !== 'eat' || o.target !== c.id || Me.kin(o, a) || SP[o.kind].cls === 'air') return; const s = strength(o) * (o.kind === 'hyena' ? 1.25 : 1); theirs += s; if (!top || s > strength(top)) top = o; tk = o.kind; });
    if (!theirs) { a.kc = S.clock + 0.6; a.kq = 1; return true; }
    let mine = strength(a) * (a.kind === 'hyena' ? 1.25 : 1);
    A.near(a.x, a.y, 5, o => { if (o !== a && !o.dead && o.kind === a.kind && Me.kin(o, a) && (o.target === c.id || o.state === 'eat')) mine += strength(o) * (a.kind === 'hyena' ? 1.25 : 1); });
    const ratio = mine / theirs;
    a.kc = S.clock + 1.5; a.kq = ratio > 1.35 ? 1 : 0;
    if (ratio > 1.35) {
      Me.gesto1(a, a.kind === 'hyena' ? ['mob', 'threat'] : ['threat', 'charge', 'display'], undefined, top.id);
      A.near(c.x, c.y, 2.2, o => { if (o === a || o.dead || o.state !== 'eat' || o.target !== c.id || Me.kin(o, a) || SP[o.kind].cls === 'air') return; Me.gesto(o, 'threat', undefined, a.id); if (A.flee(o, a.x, a.y, 4)) { o.rest = Math.max(o.rest || 0, 10); o.noPrey = { id: c.id, until: S.clock + 30 }; } });
      L.count('roubo'); L.count('roubo:' + a.kind + '>' + tk);
      if (SP[c.kind].size >= 1 && tk !== a.kind && (a.kind === 'hyena' || tk === 'hyena')) {
        const n = L.nm(a), o = L.nm(top), q = L.nm(c);
        L.say('roubo:' + a.kind + '>' + tk, a.kind === 'hyena' ? `As hienas cercaram ${o.art} ${o.n} que comia ${q.art} ${q.n}${L.where(c.x, c.y)} e, aos risos, tomaram-lhe a presa.` : `${G.cap(n.art)} ${n.n} chegou à carcaça de ${q.art} ${q.n} que as hienas comiam${L.where(c.x, c.y)} e as expulsou dali.`, c.x, c.y);
      }
      return true;
    }
    if (ratio > 0.75) { L.spar(a, top, 1); L.count('briga-carcaca'); return false; }
    // too strong for it: it waits at the edge, watching
    a.state = 'wait'; a.target = c.id; a.t = G.rr(4, 8); a.moving = false; Me.gesto1(a, ['stare', 'lie'], undefined, top.id); L.count('espera');
    return false;
  };
  // a carcass a hunter of the ground is eating (the vultures wait for it to go)
  L.guarded = function (c) { let g = false; A.near(c.x, c.y, 1.8, o => { if (!g && !o.dead && o.state === 'eat' && o.target === c.id && SP[o.kind].cls !== 'air' && SP[o.kind].diet !== 'scav') g = true; }); return g; };
  // dying (the vultures circle over it before it is dead)
  L.dying = p => !p.dead && p.hp < p.maxHp * 0.3 && (!!p.caught || !!(p.wnd && p.wnd.b > 0.2));

  // ------------------------------ the bear at the river, the polar bear at the ice's edge ------------------------------
  // a hungry bear at the water stands in the shallows and swats out the fish; a polar bear waits still at the edge for a seal
  Me.option('fish', { food: true,
    who: (a, sp) => (a.kind === 'bear' || a.kind === 'polarbear') && Me.has(a, sp) && a.grown >= 1,
    score(a, sp) { if (a.hunger < 0.35) return 0; const i = W.idx(a.x, a.y); if (A.waterD(i) > 1) return 0; return 0.35 + a.hunger * 0.3; },
    start(a) { a.state = 'fish'; a.t = G.rr(10, 20); a.bt = 0; Me.gesto(a, 'fish', 0); return true; },
    step(a, dt, sp, S) {
      a.t -= dt; a.moving = false; if (a.t <= 0) { a.state = 'idle'; a.t = 1; return true; }
      a.bt -= dt; if (a.bt <= 0) { a.bt = G.rr(2, 4); if (G.R() < 0.35) { a.hunger = Math.max(0, a.hunger - 0.12); a.eating = 0.8; Me.gesto(a, 'chew'); L.count('pesca:' + a.kind); if (G.VR() < 0.5) G.FX && G.FX.splash(a.x, a.y, 0.4); } else Me.gesto(a, 'fish', 0); }
      if (a.kind === 'polarbear') { let s = null; A.near(a.x, a.y, 2.4, o => { if (!s && o.kind === 'seal' && !o.dead && !o.caught) s = o; }); if (s) { a.state = 'chase'; a.target = s.id; a.carc = false; a.t = 6; L.begin(a, s); } }
      return true;
    },
  });

  // ------------------------------ a person in sight (D-297b) ------------------------------
  // A wild hunter that sees a person reacts — never the old walk on beside them as if nobody were there. It reads the person
  // each time it looks: alone or with others, a child, armed, with fire in the night — against itself: its hunger, its wounds,
  // its age (the old and the hurt cannot catch their own prey, and a person is slow and soft: so the man-eaters were made), its
  // boldness, the dark, what people have done to it, the people it has already killed. Then it watches (low in the grass where
  // there is cover; a bear up on its hind legs), gives way, warns with its young or its kill behind it — and charges if they
  // still come —, or hunts: the stalk from cover, the rush, the takedown, the old engine with a person as the prey (stalk,
  // pounce, chase, bite; the Carnage, the man-eater's name). A.MAN: the kinds it is for.
  const MAN = A.MAN;
  // (how far it notices a person — its senses stretch or shrink it —, and how near it lets one come before it gives way)
  const SEE = { lion: 11, tiger: 9, leopard: 9, jaguar: 8, snowleopard: 10, bear: 8, polarbear: 11, wolf: 11, hyena: 10, croc: 6 };
  const GIVE = { lion: 6, tiger: 5, leopard: 6, jaguar: 5, snowleopard: 8, bear: 5, polarbear: 4, wolf: 7, hyena: 6, croc: 4 };
  const BEARS = set(['bear', 'polarbear']);
  // (how much a kind takes to people as prey, beyond its boldness: the tiger, the leopard and the polar bear are the man-eaters of
  // the stories; the wolf and the snow leopard almost never)
  const MANW = { tiger: 1.2, leopard: 1.1, polarbear: 1.2, lion: 1, croc: 1, jaguar: 0.8, hyena: 0.8, bear: 0.7, wolf: 0.5, snowleopard: 0.4 };
  const WARY_DAY = set(['wolf', 'hyena']); // (the dogs of the wild keep away from people by day; the dark is theirs)
  // the temper of every wild kind of the ground toward a person (D-297c) — not the big cats only: hunt (the reading above);
  // flight (it lifts its head and watches, then runs at its own distance — the deer, the zebra, the gazelle the most);
  // freeze (still in the grass, then the bolt at the last moment — the hare, the rabbit, the frog, the lizard); snake (it slips
  // away; the viper strikes at the foot that comes too near, the python and the anaconda only go); giant (the warning — the
  // head up, the display —, then the charge, the sooner by its young, the hippo by its water); boar (it runs, and charges when
  // cornered or by its piglets); curious (the monkeys come to look, and snatch food from the hand). The town's own and the
  // herds (dom, town) live among people as they always did: no temper
  const TEMPER = L.TEMPER = {};
  for (const k of MAN) TEMPER[k] = 'hunt';
  for (const k of ['deer', 'reindeer', 'gazelle', 'zebra', 'gnu', 'giraffe', 'ibex', 'ostrich', 'camel', 'capybara', 'tapir', 'seal', 'penguin', 'beaver', 'otter', 'fox', 'arcticfox', 'fennec']) TEMPER[k] = 'flight';
  for (const k of ['rabbit', 'hare', 'frog', 'lizard']) TEMPER[k] = 'freeze';
  for (const k of ['viper', 'python', 'anaconda']) TEMPER[k] = 'snake';
  for (const k of ['hippo', 'elephant', 'rhino', 'buffalo', 'bison', 'moose', 'muskox', 'walrus']) TEMPER[k] = 'giant';
  TEMPER.boar = 'boar'; TEMPER.monkey = 'curious';
  // (a giant's warning distance: inside it, the charge)
  const WARN_D = { hippo: 4, elephant: 5, rhino: 4.5, buffalo: 3.5, bison: 3.5, moose: 3.5, muskox: 3, walrus: 2.5 };
  // how far a kind that does not hunt people notices one: some way beyond the distance it runs at
  const notice = (a, sp) => { const t = TEMPER[a.kind]; return t === 'giant' ? WARN_D[a.kind] * 2.2 : t === 'snake' ? 3.5 : t === 'boar' ? 4.5 : t === 'curious' ? sp.fear * 2 + 2 : t === 'freeze' ? sp.fear * 2 : (sp.fear || 3) * 1.8; };
  const sightOf = (a, sp) => SEE[a.kind] || notice(a, sp);
  // (near enough that it cannot let them be: the hunter's distance of giving way, the giant's of warning, the others' of running —
  // a little beyond)
  const nearOf = (a, sp) => { const t = TEMPER[a.kind]; return t === 'hunt' ? GIVE[a.kind] || 5 : t === 'giant' ? WARN_D[a.kind] : (sp.fear || 3) * 1.3; };
  // is the person coming its way? (walking, the next step of their way toward it)
  const coming = (v, a, c) => { if (!v.moving || !v.path) return false; const p = v.path[v.pi]; if (!p) return false; const ux = p[0] - v.x, uy = p[1] - v.y, wx = a.x - v.x, wy = a.y - v.y; const l = Math.hypot(ux, uy) * Math.hypot(wx, wy); return l > 1e-6 && (ux * wx + uy * wy) / l > (c || 0.5); };
  // the watch, or a glance: a beast keeps its eyes on a person who is near or coming on — one at their work some way off gets a
  // look now and then, and it goes on grazing, resting, hunting (it has its own life to live: the herds that stood all day
  // watching people starved and bore no young, L-1007b); and a watch just over is not taken up again at once
  function watch(a, v, d, inEye, near) {
    if (inEye) return null;
    const t = TEMPER[a.kind]; const far = t === 'hunt' || t === 'giant' || t === 'boar';
    if (G.S.clock >= a.ey && (d < near || (far && coming(v, a)))) return v;
    if (!a.gest && t !== 'freeze' && G.R() < 0.12) Me.gesto1(a, ['alert', 'listen'], undefined, v.id);
    return null;
  }
  // armed: the soldier, the archer, the hunter, one of an army's band, one coming to fight it
  L.armed = v => v.role === 'guerreiro' || v.role === 'arqueiro' || v.role === 'cacador' || !!v.unit || !!(v.task && v.task.type === 'fight');
  // fire in the hand, in the night (the world's own rule, as the views draw it: the errand that asks for one — the night watch —,
  // the god's body, and one in three grown people walking. Never the flags the views write: `v.torch` is the 2D's, set at every
  // frame, and `holdTorch` a directed scene's — read here, the beasts lived another life with the screen on, L-1007e)
  L.fire = v => G.isNight() && !v.inside && !v.sleeping && !!((v.task && v.task.torch) || (G.Possess && G.Possess.body && G.Possess.body() === v) || (v.moving && v.age >= 14 && v.id % 3 === 0));
  // the reading: the want (what it would give) and the danger (what it would cost); n the grown people there (itself counted),
  // others the grown ones with it, arm the armed, fire the torches
  const RM = { n: 0, others: 0, arm: 0, fire: 0, kid: false, want: 0, danger: 0 };
  L.readMan = function (a, v) {
    const sp = SP[a.kind]; const m = a.mind; let n = 0, arm = 0, fire = 0;
    A.nearMan(v.x, v.y, 4, q => { if (q.dead || q.air || q.aboard || G.dist2(q.x, q.y, v.x, v.y) > 16) return; if (q.age >= 12) n++; if (L.armed(q)) arm++; if (L.fire(q)) fire++; });
    const kid = v.age < 12, w = a.wnd;
    const old = a.age > sp.life * (a.lifeMul || 1) * 0.75;
    const hurt = (!!w && (w.l > 0.3 || (w.j || 0) > 0.3)) || a.hp < a.maxHp * 0.5;
    const eater = (a.kills || 0) > 0;
    const hf = a.hunger > 0.45 ? (a.hunger - 0.45) / 0.55 : 0;
    let want = sp.bold * (MANW[a.kind] || 1) * (0.5 + Me.trait(a, 'b')) * 2.2 * hf;
    if (old) want *= 1.6; if (hurt) want *= 1.8; if (eater) want = want * 2 + 0.3; if (kid) want *= 1.6; if (G.isNight() && a.kind !== 'croc') want *= 1.4; else if (WARY_DAY.has(a.kind)) want *= 0.5;
    // (a sound hunter that has never killed one asks more of its hunger before it tries a person: the man-eaters are the old, the
    // hurt and the ones that have — hunting every lone person it met, the healthy hunters were the ones the towns killed, L-1007f)
    if (!old && !hurt && !eater) want -= 0.25;
    const others = n - (kid ? 0 : 1); // (the grown ones with them: a child with one grown-up by it is not alone)
    let danger = Math.max(0, others) * 0.9 + arm * 1.4 + fire * 1.6 + Math.min(3, (m && m.mh) || 0) * 0.6 + (Me.knows(a, v.id, 1) ? 1 : 0);
    if (PACK.has(a.kind) || sp.pride) danger /= Math.sqrt(L.party(a));
    RM.n = n; RM.others = others; RM.arm = arm; RM.fire = fire; RM.kid = kid; RM.want = want; RM.danger = danger;
    return RM;
  };
  // the nearest person it notices (the dark, its sleep, its mind; out of doors — a torch in the night is seen from farther)
  function manSeen(a) {
    const night = G.isNight(); const k0 = sightOf(a, SP[a.kind]); const R = k0 * A.senseBound(a) * (night ? 1.5 : 1); let v = null, vd = R * R;
    A.nearMan(a.x, a.y, R + 2, q => { if (q.dead || q.air || q.aboard || q.held || q.inside) return; const d = G.dist2(a.x, a.y, q.x, q.y); if (d >= vd) return; const k = k0 * A.senseMul(a, q) * (night && L.fire(q) ? 1.5 : 1); if (d < k * k) { vd = d; v = q; } });
    return v;
  }
  // the look at people (the look round of landAI, also while it watches — inEye): true when it acted, the person when it
  // would only watch them, null when there is nobody
  L.man = function (a, sp, inEye) {
    const S = G.S; inEye = inEye || a.state === 'eye'; // (already watching: it does not start the watch over)
    if (!TEMPER[a.kind] || a.summoned || a.raid || a.dom || a.tamed || a.legend || a.caught || a.held || a.z > 3 || a.angry > 0) return null;
    if (A.isBusy(a.state) && a.state !== 'eat' && !inEye) return null; // (running from a fire, a charge, a fight: not now)
    const v = manSeen(a); if (!v) return null;
    const d = G.dist(a.x, a.y, v.x, v.y);
    // (already walking off: it goes on — the look round goes on too, for the lion —; unless they are on it, or come on within its
    // flight distance: the deer that walked off from a hunter runs when he follows — walking off, it let him up to its flank, L-1007f)
    if (a.state === 'shy' && d > 1.6) {
      const t = TEMPER[a.kind];
      if ((t === 'flight' || t === 'freeze') && d < (sp.fear || 3) * A.senseMul(a, v) * (t === 'freeze' ? 0.8 : 1) && L.react(a, v, 1, false)) { L.count((t === 'flight' ? 'gente:foge:' : 'gente:dispara:') + a.kind); return true; }
      return null;
    }
    if (!MAN.has(a.kind)) return other(a, sp, v, d, inEye);
    const r = L.readMan(a, v);
    // the croc: from the water it strikes at whoever comes down to it (its own lurk); on the bank it slides in
    if (a.kind === 'croc') {
      if (S.type[W.idx(a.x, a.y)] > T.RIVER && d < GIVE.croc * (1 + 0.3 * r.danger)) { const p = A.deepSpot(a); if (p) { a.tx = p[0]; a.ty = p[1]; a.state = 'flee'; a.t = 4; a.target = 0; L.count('gente:recua'); L.count('gente:recua:croc'); return true; } }
      return null;
    }
    // the hunt: a person alone, with no arms and no fire — and a want for them beyond the danger (the more beyond it, the sooner
    // it commits)
    const lone = r.others <= 0 && r.arm === 0 && r.fire === 0; const over = r.want - 0.55 - r.danger;
    if (a.state !== 'eat' && a.grown >= 0.8 && lone && over > 0 && G.R() < Math.min(0.9, 0.35 + over * 1.5) && W.canWalk(a.x, a.y, v.x, v.y)) { huntMan(a, v, sp, d, r); return true; }
    // too near: it gives way — or, with its young or its kill behind it (a bear met at a few paces), it warns, and charges if
    // they still come on
    const give = (GIVE[a.kind] || 5) * (1 + 0.35 * r.danger) * (G.isNight() ? 0.75 : WARY_DAY.has(a.kind) ? 1.4 : 1) * (1.3 - 0.6 * Me.trait(a, 'b'));
    if (d < give || (BEARS.has(a.kind) && d < 3)) { // (a bear met at three paces reacts whatever its boldness: it was surprised)
      // (the wolves leave their kill to a person: the cats, the bears and the hyenas stand over theirs)
      const holds = (a.state === 'eat' && a.kind !== 'wolf') || youngNear(a) || (BEARS.has(a.kind) && d < 3);
      if (holds && r.danger < 3) { warnMan(a, v, d); return true; }
      if (a.state === 'eat' && d > give * 0.6) return true; // (at its kill, an eye up: it goes on eating)
      shy(a, v, r.danger > 2.5 || d < give * 0.45); return true;
    }
    if (a.state === 'eat') return null;
    return watch(a, v, d, inEye, give * 1.8);
  };
  // the hunt of a person: stalked from cover by the cats and the polar bear (and a pack's head), run down by the others; the
  // pack comes with its head
  function huntMan(a, v, sp, d, r) {
    const stalker = sp.stalk || a.kind === 'polarbear' || (PACK.has(a.kind) && !a.leader);
    const go = (o, dd) => { o.target = v.id; o.carc = false; o.onPerson = true; o.crouch = 0; if (stalker && dd > 3.2) { o.state = 'stalk'; o.t = 18; } else { o.state = 'chase'; o.t = 8; } };
    go(a, d);
    if (PACK.has(a.kind) || sp.pride) for (const o of A.packOf(a)) if (Me.free(o) && o.grown >= 0.8 && o.hunger > 0.3 && !o.caught && !o.held) go(o, G.dist(o.x, o.y, v.x, v.y));
    L.count('caca-gente'); L.count('caca-gente:' + a.kind);
    if (r.kid) L.count('caca-gente:crianca'); if ((a.kills || 0) > 0) L.count('caca-gente:devorador');
    const w = a.wnd; if (a.age > sp.life * (a.lifeMul || 1) * 0.75 || (w && (w.l > 0.3 || (w.j || 0) > 0.3))) L.count('caca-gente:velho-ou-ferido');
  }
  // it gives way: off at a walk, looking back (a run when the danger is great or they are right there)
  function shy(a, v, run) {
    const p = A.fleeTarget(a, v.x, v.y, run ? 8 : 6); if (!p) return false;
    a.tx = p[0]; a.ty = p[1]; a.target = 0; a.onPerson = false; a.crouch = 0; a.angry = 0;
    if (run) { a.state = 'flee'; a.t = 3; } else { a.state = 'shy'; a.t = G.rr(4, 7); }
    L.count(run ? 'gente:foge' : 'gente:recua'); L.count((run ? 'gente:foge:' : 'gente:recua:') + a.kind);
    return true;
  }
  // the warning: it faces them and shows what it is (the snarl, the roar; a bear up on its hind legs); nearer still, the charge
  function warnMan(a, v, d) {
    G.faceTo(a, v.x - a.x, v.y - a.y);
    // (a bear without its cubs, met near: the bluff — the rush that stops short; with them, or with the person on it, the real one)
    const cubs = BEARS.has(a.kind) && youngNear(a);
    if (BEARS.has(a.kind) && !cubs && d < 3.2 && d > 1.6 && a.state !== 'eat') { bluff(a, v); return; }
    // (the charge: a mother with her cubs, at once; at its kill, at one who comes right on it after the snarl — L-1007f)
    if (d < (cubs ? 3.4 : 1.6)) {
      a.angry = 2.5 + 3 * Me.trait(a, 'g'); a.target = v.id; a.state = 'chase'; a.carc = false; a.onPerson = false; Me.anger(a, 0.6, v);
      if (!Me.gesto(a, 'charge', 0, v.id)) Me.gesto1(a, ['threat', 'roar', 'display'], undefined, v.id);
      L.count('gente:investe'); L.count('gente:investe:' + a.kind);
      return;
    }
    Me.gesto1(a, BEARS.has(a.kind) ? ['rear', 'roar', 'threat'] : ['threat', 'roar', 'display'], undefined, v.id);
    L.count('gente:ameaca'); L.count('gente:ameaca:' + a.kind);
    // (the warning held a few seconds — not again and again while they stand there: then it takes its young away, or charges)
    if (a.state !== 'eat' && a.state !== 'eye') { a.state = 'eye'; a.target = v.id; a.onPerson = false; a.t = G.rr(2, 3.5); a.moving = false; }
  }
  // the watch: still, facing them — low in the grass when there is cover (the stalk's crouch, frozen), standing to look when there
  // is none (a bear on its hind legs, its nose up; a hare pressed flat; a hippo's display); it looks round as it watches (the look
  // reads the person again, and sees the lion coming), and when it has seen enough and they are still about, it moves off out of
  // their way — the walk off looks round too
  const cover = a => { const i = W.idx(a.x, a.y); return !!G.S.treeAt[i] || (G.S.veg ? G.S.veg[i] > 0.55 : false) || !!A.treeNear(a.x, a.y, 1.6); };
  L.eye = function (a, v) {
    const t = TEMPER[a.kind];
    a.state = 'eye'; a.target = v.id; a.onPerson = false; a.t = t === 'hunt' || t === 'giant' ? G.rr(4, 8) : G.rr(2, 4); a.moving = false; a.crouch = 0; G.faceTo(a, v.x - a.x, v.y - a.y);
    if (t === 'freeze') { if (!Me.gesto(a, 'hide', 0, v.id)) Me.gesto1(a, ['alert', 'stare'], undefined, v.id); }
    else if (t === 'giant') Me.gesto1(a, ['display', 'threat', 'alert', 'stare'], undefined, v.id);
    else if (t !== 'hunt') Me.gesto1(a, ['alert', 'stare', 'listen'], undefined, v.id);
    else if (cover(a) && Me.gesto(a, 'stalk', 0, v.id, 1)) a.crouch = 1;
    else if (!(BEARS.has(a.kind) && G.R() < 0.5 && Me.gesto(a, 'rear', undefined, v.id))) Me.gesto1(a, ['stare', 'scent', 'alert'], undefined, v.id);
    L.count('gente:vigia'); L.count('gente:vigia:' + a.kind);
  };
  A.behave('eye', function (a, dt, sp, S) {
    const v = S.villagers.get(a.target); a.t -= dt; a.moving = false;
    if (!v || v.dead || v.inside || v.aboard || v.air || v.held) { a.state = 'idle'; a.target = 0; a.crouch = 0; a.t = 1; return true; }
    G.faceTo(a, v.x - a.x, v.y - a.y);
    if (a.t <= 0) {
      a.crouch = 0;
      a.ey = S.clock + (TEMPER[a.kind] === 'hunt' ? G.rr(10, 15) : G.rr(20, 30));
      const dv = G.dist(a.x, a.y, v.x, v.y);
      // (the warning given and the person still there: the giant charges only one right on it — one at their work by its water
      // a few paces off is left, and it goes its way; the charge at the end of every watch was the most of the giants' deaths at
      // the town's hands, L-1007f)
      if (TEMPER[a.kind] === 'giant' && dv < WARN_D[a.kind] * 0.4 && a.grown >= 0.8) chargeMan(a, v);
      else if (TEMPER[a.kind] === 'freeze' && dv < nearOf(a, sp)) L.react(a, v, 1, false); // (still there, and near: the bolt)
      else if (dv < nearOf(a, sp)) shy(a, v, false); else { a.state = 'idle'; a.target = 0; a.t = 1; }
    }
    return true;
  }, { mindful: true });
  A.behave('shy', function (a, dt, sp) {
    a.t -= dt;
    if (A.moveTo(a, dt, sp.sp * (TEMPER[a.kind] === 'snake' ? 0.9 : 1.2)) || a.t <= 0) { a.state = 'idle'; a.t = G.rr(1, 3); }
    return true;
  }, { mindful: true });
  // the bluff: the bear rushes at them and stops short, a few paces off, up on its legs, and turns away
  function bluff(a, v) {
    a.state = 'bluff'; a.target = v.id; a.onPerson = false; a.t = 1.4; a.carc = false;
    if (!Me.gesto(a, 'charge', 0, v.id)) Me.gesto1(a, ['threat', 'roar'], undefined, v.id);
    L.count('gente:blefe'); L.count('gente:blefe:' + a.kind);
  }
  A.behave('bluff', function (a, dt, sp, S) {
    const v = S.villagers.get(a.target); a.t -= dt;
    if (!v || v.dead || v.inside || v.held || v.aboard) { a.state = 'idle'; a.target = 0; a.t = 1; return true; }
    if (G.dist(a.x, a.y, v.x, v.y) < 1.5 || a.t <= 0) { a.moving = false; G.faceTo(a, v.x - a.x, v.y - a.y); Me.gesto1(a, ['rear', 'roar', 'threat'], undefined, v.id); shy(a, v, false); return true; }
    a.tx = v.x; a.ty = v.y; A.moveTo(a, dt, sp.run); return true;
  }, { busy: true });
  // the kinds that do not hunt people: what each does at a person this near (true: it did something; the person: it watches;
  // null: nothing to do)
  function other(a, sp, v, d, inEye) {
    const t = TEMPER[a.kind]; const fear = (sp.fear || 3) * A.senseMul(a, v);
    if (t === 'flight') {
      // (one at their work some way off, unarmed and not coming its way, is watched: the grazers by a grown town ran from every
      // person in the fields at eight tiles, and starved — L-1036; the hunter, the soldier, one coming at it, at the whole distance)
      // (and where people hunted, the still one is run from too: the beast learnt what people do there — G.Meio, D-305)
      const near = fear * (coming(v, a) || L.armed(v) ? 1 : 0.6 + 0.4 * Math.min(1, G.Meio && G.Meio.learnt ? G.Meio.learnt(a.x, a.y) : 0));
      if (d < near) { if (L.react(a, v, 1, false)) { L.count('gente:foge:' + a.kind); return true; } return null; }
      return watch(a, v, d, inEye, fear * 1.3);
    }
    if (t === 'freeze') {
      // (the freeze is for one who passes by: one who comes straight at it is bolted from at its whole distance — L-1007f)
      if (d < fear * (coming(v, a, 0.93) ? 1 : 0.8)) { if (L.react(a, v, 1, false)) { L.count('gente:dispara:' + a.kind); return true; } return null; }
      return watch(a, v, d, inEye, fear * 1.3);
    }
    if (t === 'snake') {
      // (the viper: the foot that comes on it, or it cornered — the strike; the rest slip off into the grass)
      if (a.kind === 'viper' && d < 1.15 && (v.moving || !A.fleeTarget(a, v.x, v.y, 3)) && G.R() < 0.7) { snakeBite(a, v); return true; }
      if (d < 3.2) { if (d < 2) Me.gesto1(a, ['threat', 'display'], undefined, v.id); if (shy(a, v, false)) { a.t = G.rr(3, 5); return true; } }
      return null;
    }
    if (t === 'giant' || t === 'boar') {
      const young = youngNear(a); const wd = t === 'boar' ? 2.2 : WARN_D[a.kind] * (young ? 1.5 : 1);
      const water = a.kind === 'hippo' && A.waterD(W.idx(a.x, a.y)) <= 2; // (the hippo between a person and its water)
      if (d < wd) {
        // (the charge comes when they are right on it, or press on toward it, or it has its young, its water, no way out —
        // most meetings end at the warning: the person backs off, the giant goes its way, L-1007c)
        const cornered = a.kind !== 'hippo' && !A.fleeTarget(a, v.x, v.y, 5); // (the hippo's way out is its water: `water`)
        const press = d < wd * 0.6 || young || water || cornered;
        // (and it is the one right on it that is charged, or one who comes on at its calf, its water, or where it has no way out:
        // one who only walks its way, or stays at their work some paces off, is warned and watched, and it goes its way. Charged at
        // every meeting, the giants were speared by the town's brave, L-1007f)
        const on = d < wd * 0.4 || (coming(v, a) && (young || ((water || cornered) && d < wd * 0.6)));
        const go = t === 'boar' ? (cornered || young) && on : press && on && G.R() < 0.1 + 0.3 * Me.trait(a, 'g') + (young ? 0.3 : 0) + (water ? 0.15 : 0) + (cornered ? 0.3 : 0) + (d < wd * 0.4 ? 0.3 : 0);
        if (go && a.grown >= 0.8) { // (the calf runs to its mother: the grown charge)
          // (a giant with a way out and nothing to guard, the person not yet on it, mostly takes it — the hippo on land runs to its
          // water, the bull goes off at a run —: the charge is for its calf, the water it stands in, the corner, the one right on
          // it. Charging all who came near, the hippos of the rivers the towns fish were speared by the dozen, L-1007f)
          const wet = a.kind === 'hippo' && G.S.type[W.idx(a.x, a.y)] <= T.RIVER;
          if (t !== 'boar' && !young && !cornered && !wet && d >= wd * 0.4 && G.R() < 0.65) {
            const p = a.kind === 'hippo' ? A.deepSpot(a) : null;
            if (p) { a.tx = p[0]; a.ty = p[1]; a.state = 'flee'; a.t = 3; a.target = 0; L.count('gente:foge'); L.count('gente:foge:' + a.kind); return true; }
            if (shy(a, v, true)) return true;
          }
          chargeMan(a, v); return true;
        }
        if (t === 'boar') return L.react(a, v, 1, false) ? true : null;
        if (!press && d > wd * 0.6 && G.R() < 0.35) { if (shy(a, v, false)) return true; } // (it has warned; it goes its way)
        Me.gesto1(a, ['display', 'threat', 'alert'], undefined, v.id); L.count('gente:ameaca'); L.count('gente:ameaca:' + a.kind);
        if (!inEye) { L.eye(a, v); a.t = G.rr(2, 4); }
        return true;
      }
      if (t === 'boar' && d < (sp.fear || 2.2) * 1.6) return L.react(a, v, 1, false) ? true : null;
      return watch(a, v, d, inEye, wd * 1.6);
    }
    if (t === 'curious') {
      // the monkeys: they come to look, at a few paces; the bold one takes the food from the hand and is up a tree with it
      const c = Me.trait(a, 'c');
      if (d < 1.3 && v.carry && v.carry.k === 'food' && v.carry.n > 0.2 && G.R() < 0.3 + 0.4 * c && G.Depot.use('v:' + v.id, 'food', Math.min(1, v.carry.n), { code: 'macaco', by: a.id, part: true }).ok) {
        a.hunger = Math.max(0, a.hunger - 0.4); G.Vg.emote(v, 'angry', 2); Me.gesto1(a, ['threat', 'call'], undefined, v.id);
        L.count('gente:roubo-macaco'); const tr = A.treeNear(a.x, a.y, 6); if (tr) A.startClimb(a, tr, true); else shy(a, v, true);
        return true;
      }
      if (d < (L.armed(v) ? 4.5 : 2)) { if (G.R() < 0.4) Me.gesto1(a, ['threat', 'alert'], undefined, v.id); if (shy(a, v, d < 3)) { a.t = G.rr(2, 3); return true; } return null; }
      // (to look at one who carries no arms: a hunter, a soldier, is kept away from — L-1007f)
      if (d > 3.5 && c > 0.45 && !inEye && !L.armed(v) && G.R() < 0.4) {
        const k = (d - 2.6) / d; const x = a.x + (v.x - a.x) * k, y = a.y + (v.y - a.y) * k;
        if (A.walkOK(a, x, y)) { a.tx = x; a.ty = y; a.state = 'wander'; a.seek = false; L.count('gente:curioso'); return true; }
      }
      return watch(a, v, d, inEye, 4);
    }
    return null;
  }
  // the rage at a person over (a giant's charge, a mother's, the long rage of one they hurt): it goes off at a run — the hippo
  // back to its water — and does not stand about where the town's brave come to spear it (L-1007f). False: not its to do
  L.calmed = function (a, v) {
    if (!TEMPER[a.kind] || !v || v.kind || a.tamed || a.summoned || a.raid || a.legend) return false;
    let p = a.kind === 'hippo' || a.kind === 'croc' ? A.deepSpot(a) : null; if (!p) p = A.fleeTarget(a, v.x, v.y, 12); if (!p) return false;
    a.tx = p[0]; a.ty = p[1]; a.target = 0; a.onPerson = false; a.crouch = 0; a.state = 'flee'; a.t = 5; a.ey = Math.max(a.ey || 0, G.S.clock + G.rr(20, 30));
    return true;
  };
  // a giant's (or a boar's) charge at a person: a rush to drive them off — short, and over when they are gone (hurt, it is the
  // long rage of A.damage)
  function chargeMan(a, v) {
    L.charge(a, v); a.angry = 2 + 2.5 * Me.trait(a, 'g');
    L.count('gente:investe'); L.count('gente:investe:' + a.kind);
  }
  // the viper's strike at a person: the bite, the venom, the fear; and it is off into the grass
  function snakeBite(a, v) {
    G.faceTo(a, v.x - a.x, v.y - a.y); Me.gesto(a, 'strike', undefined, v.id); a.bite = 0.3;
    G.Audio && G.Audio.at(a.x, a.y, 'bite');
    v.lastBeast = a.kind; v.lastBeastId = a.id; G.Vg.damage(v, 10 + 8 * G.R(), 'beast', false); G.Vg.emote(v, 'fear', 3);
    L.count('gente:picada'); L.count('gente:picada:' + a.kind);
    if (G.S.villagers.has(v.id)) { a.target = 0; const p = A.fleeTarget(a, v.x, v.y, 4); if (p) { a.tx = p[0]; a.ty = p[1]; a.state = 'shy'; a.t = 3; } }
  }

  // ------------------------------ the god's camera ------------------------------
  // how dramatic this beast's moment is, for the cinema (read only): a hold, a leap, a chase, a stalk, a stand, a contest, a theft
  L.drama = function (a) {
    if (!a || a.dead) return null; const S = G.S; const sp = SP[a.kind]; if (!sp) return null;
    const tg = a.target && (S.animals.get(a.target) || S.villagers.get(a.target)); const n = L.nm(a); const art = n.def === 'a' ? 'A' : 'O';
    const tn = tg ? (tg.kind ? L.nm(tg) : null) : null; const tw = tn ? `${tn.art} ${tn.n}` : tg && tg.name ? tg.name : '';
    if (a.state === 'hold' && tg) { const r = tg.wnd && tg.wnd.h; const k = r ? r[1] : 0; return { score: 72, title: `${art} ${n.n} ${k === RUMP ? 'agarra' : k === CROC ? 'arrasta' : k === COIL ? 'enrola' : 'estrangula'} ${tw}`, sub: k === RUMP ? 'pendurad' + (n.g === 'f' ? 'a' : 'o') + ' no lombo da presa' : k === CROC ? 'para o fundo do rio' : k === COIL ? 'apertando a cada respiração' : 'a presa ainda se debate' }; }
    if (a.state === 'pounce') return { score: 68, title: `${art} ${n.n} salta`, sub: tw ? `sobre ${tw}` : 'o bote' };
    if (a.state === 'stand' && tg) return { score: 58, title: `${art} ${n.n} enfrenta ${tw}`, sub: HORN.has(a.kind) ? 'os chifres baixos, sem recuar' : 'sem recuar um passo' };
    if (a.angry > 0 && tg && tg.kind) return { score: 60, title: `${art} ${n.n} investe`, sub: `contra ${tw}` };
    if ((a.angry > 0 || a.state === 'bluff') && tg && !tg.kind) return { score: 64, title: `${art} ${n.n} investe`, sub: tw ? `contra ${tw}` : 'contra uma pessoa' };
    if (a.state === 'chase' && tg && !a.carc) return { score: 56, title: `${art} ${n.n} caça`, sub: tw ? `atrás de ${tw}` : 'a vida selvagem longe das cidades' };
    if (a.state === 'stalk' || a.state === 'flank') return { score: a.onPerson ? 66 : 50, title: `${art} ${n.n} espreita`, sub: tw ? `${tw}, sem saber` : 'rente ao capim' };
    if (a.state === 'eye' && tg && !tg.kind) return { score: 42, title: `${art} ${n.n} observa`, sub: tw ? `${tw}, de longe` : 'alguém, de longe' };
    if (a.state === 'contest' && tg) return { score: 46, title: `${art} ${n.n} disputa`, sub: a.bq === 2 || tg.bq === 2 ? 'uma fêmea' : a.bq === 3 || tg.bq === 3 ? 'o território' : 'o posto no grupo' };
    if (a.state === 'wait' && tg) return { score: 40, title: `${art} ${n.n} espera`, sub: 'a vez de chegar à carcaça' };
    if (a.state === 'eat' && a.carc && tg && sp.diet !== 'scav') return { score: 34, title: `${art} ${n.n} come`, sub: tw ? tw.replace(/^uma? /, 'a carcaça de ') : 'a presa' };
    return null;
  };

  // ------------------------------ a hold through a save ------------------------------
  // the save keeps the hold on the held one (a.wnd.h) and not the holder's state: on loading, the holder takes it up again where
  // it was — near, alive, free — or the hold is over
  G.saveHooks = G.saveHooks || [];
  G.saveHooks.push({
    save() { },
    load() {
      const S = G.S;
      for (const p of S.animals.values()) {
        const r = p.wnd && p.wnd.h; if (!r) continue; const h = S.animals.get(r[0]);
        if (!h || h.dead || p.dead || h.held || G.dist(h.x, h.y, p.x, p.y) > 3 || h.state === 'hold') { p.wnd.h = null; p.caught = 0; continue; }
        h.state = 'hold'; h.target = p.id; h.t = 60; h.cd = 0.8; h.hk = 0; h.hd = r[1]; if (r[1] === CROC) h.dz = A.deepSpot(h);
        p.caught = h.id; p.down = 0;
      }
    },
  });
})(window.G);
