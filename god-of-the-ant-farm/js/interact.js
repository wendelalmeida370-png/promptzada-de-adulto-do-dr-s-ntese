'use strict';
// ============================================================
//  Interact: what the body can do with what is in front of it.
//  One registry: each provider looks around the body for the
//  things it knows (a person, a door, a tree, a bush, a rock, a
//  building going up, a grave, a beast), says what can be done
//  ("Conversar com Aelia", "Cortar lenha"), and checks before
//  doing it — in reach, still there, possible, allowed (a tree
//  someone else is felling is theirs; a house is somebody's).
//  What it does is the world's own doing, by the world's own
//  rules: the tree felled is the tree of S.trees, by the same
//  felling the woodcutters use; the wood goes to the people's
//  stock by Village.addStock; the berries leave the bush; a
//  meal leaves the storehouse; the talk is a line said over the
//  other's head (seen in the god's view too). The chain is
//  always: input → action → world → consequence → seen in both
//  views. The deeds are counted for the biography and the
//  chronicle (Possess.deed) and signalled to the stories.
//  A future verb is a new provider: G.Interact.add({ … }).
// ============================================================
(function (G) {
  const W = G.W;
  const I = G.Interact = { list: [] };
  const oa = v => (v.g === 'f' ? 'a' : 'o');
  // add({ id, prio, reach (metres), find(ctx) → [target…], label(ctx, t), can(ctx, t) → {ok, why}, run(ctx, t) → result })
  //   (and door: a door's; opens: a door that opens, the plan's; passing: an animal going by; here: a target where the body is,
  //   with no place of its own; urgent: what wins at a door all the same — I.best)
  I.add = function (p) { I.list = I.list.filter(q => q.id !== p.id); I.list.push(p); I.list.sort((a, b) => b.prio - a.prio); };
  const L = () => G.Space.TILE;
  const tile = (X, Z) => [X / L(), Z / L()];
  // the body's context: who, where (metres), which way it faces
  I.ctx = function () {
    const v = G.Possess.body(); const p = G.Avatar.pos(); if (!v || !p) return null;
    return { v, X: p.X, Y: p.Y, Z: p.Z, yaw: p.yaw, x: p.X / L(), y: p.Z / L() };
  };
  // how good a target is: near, and in front of the body (aim: how far, and how far round from where the body faces)
  const aim = (ctx, X, Z) => { const dx = X - ctx.X, dz = Z - ctx.Z; return { d: Math.hypot(dx, dz), ang: Math.abs(Math.atan2(Math.sin(Math.atan2(dz, dx) - ctx.yaw), Math.cos(Math.atan2(dz, dx) - ctx.yaw))) }; };
  function score(ctx, X, Z, reach) {
    const { d, ang } = aim(ctx, X, Z); if (d > reach) return -1;
    if (d > 1.1 && ang > 1.6) return -1; // (behind the back: not what one means)
    return (reach - d) / reach * 2 + (1 - ang / Math.PI);
  }
  // the best thing to do right now (what the prompt shows: "E — …")
  I.AHEAD = 0.05; // (radians: how much more before the body an animal must be than a door to be what one means there)
  I.FACE = Math.PI / 4; // (radians: a door this far round from where the body looks, or less, is the door it faces — L-326)
  I.ROOM_PREF = -1; // (how much less one in the body's room is meant than the room's own things in the same reach — the seat, the bed: D-918)
  // every target in reach and how good it is ({ ctx, all: [{ p, t, sc }] }, in the providers' order — the order I.best breaks
  // its ties by): one look round the body, read by I.best and by the list of the others one may switch to (I.candidates)
  I.scan = function () {
    const ctx = I.ctx(); if (!ctx || G.Avatar.swimming()) return null; // (the hands are swimming)
    const all = [];
    for (const p of I.list) {
      for (const t of p.find(ctx)) {
        // (t.reach: a target reached from farther than its kind — the door of a house from its doorstep)
        const s = score(ctx, t.X, t.Z, t.reach || p.reach); if (s < 0) continue;
        all.push({ p, t, sc: s + p.prio * 0.6 + (t.pref || 0) }); // (pref: a target meant more, or less, than the others in the same reach)
      }
    }
    return { ctx, all };
  };
  I.best = function (sn) {
    sn = sn || I.scan(); if (!sn) return null; const ctx = sn.ctx;
    let best = null, bs = -1, door = null, ds = -1, pass = null, ps = -1, open = null, os = -1, faced = null, fs = -1, seat = null, ss = -1, meal = null, ms = -1, other = null, xs = -1, bed = null;
    {
      for (const c of sn.all) {
        const { p, t, sc } = c;
        if (sc > bs) { bs = sc; best = c; }
        if (p.id === 'lugar' && sc + (t.pl.use === 'comer' ? 10 : 0) > ss) { ss = sc + (t.pl.use === 'comer' ? 10 : 0); seat = c; } // (a place at a table first)
        if (p.id === 'atividade' && t.o && /^lar\.comer:/.test(t.o.id || '') && sc > ms) { ms = sc; meal = c; } // (the meal of the house)
        if (p.id === 'cama') bed = c;
        if (p.door && sc > ds) { ds = sc; door = c; }
        if (p.passing && sc > ps) { ps = sc; pass = c; }
        if (p.opens && sc > os) { os = sc; open = c; }
        if (!t.here && !p.here && sc > fs && aim(ctx, t.X, t.Z).ang <= I.FACE) { fs = sc; faced = c; }
        if (!t.here && !p.here && !p.door && sc > xs && aim(ctx, t.X, t.Z).ang <= I.FACE) { xs = sc; other = c; } // (and the faced that is not a door's)
      }
    }
    if (!best) return null;
    // (at the table of its own house the body sits first — «Sentar à mesa», always —, and eats there once seated, when there is
    // what to eat: the meal of the house the world offers at the table gives way to the place at it while the body stands, hungry
    // or not — D-104: the body of the god lives the house, not only the hunger)
    if (seat && best.p.id === 'atividade' && best.t.o && /^lar\.comer:/.test(best.t.o.id || '')) best = seat;
    // (and seated at it, the meal of the house — when there is what to eat and the hunger for it — before the house's cooking: the
    // meal's point is the house's first place at the table — as often as not the body's own seat, no way round from it —, and the
    // brazier beside it, 0.65 m round to the side, won it: seated and hungry at the table of the house#13413 of the generation-15
    // metropole, «Cozinhar a ceia da casa» — L-625, D-104)
    else if (meal && best !== meal && meal.t.o.ok !== false && best.p.id === 'atividade' && best.t.o && /^lar\.cozinhar:/.test(best.t.o.id || '') && G.Avatar.seated() && (G.Possess.useOf() || {}).use === 'comer') best = meal;
    // (and the body's own bed, faced, before the house's cooking: the fire by the bed's foot — nearer than the bed's middle, and
    // the offer's reach the longer — won it from the body turned to its bed: beside the couple's mat of the house of the
    // metropole whose core D-196 laid by the beds, «Cozinhar a ceia da casa», and never lay down by E — L-892); and before the
    // stairs, by the same rule: the foot of the ladder by the couple's mat of the sobrado#14091 of the generation-21 metropole —
    // at 0.47 m and 60° round, the mat's middle at 1.33 m and straight ahead — won it, «Subir pela escada de mão» (L-778)
    if (bed && best !== bed && (best.p.id === 'escada' || (best.p.id === 'atividade' && best.t.o && /^lar\.cozinhar:/.test(best.t.o.id || '')))) { const a = aim(ctx, bed.t.X, bed.t.Z); if (a.ang <= I.FACE && a.ang < aim(ctx, best.t.X, best.t.Z).ang) best = bed; }
    // (and standing at a table, its place faced before a bed or the house's cooking beside it — «Sentar à mesa», always, D-104 —:
    // the bench-bed by the table of the Norse house, its kind weighing more, won the body standing at its place and turned to it
    // — the place at 0° and 0.75 m, the bed at 33° and 1.13 m —: «Deitar na cama», at the sobrado#2924 of the generation-20
    // metropole, and it never sat; at the hut#11026 the fire under its feet, at 93°: «Cozinhar a ceia da casa». By the rule of
    // L-892 the other way round: of the two, the one the body faces, and faces more — L-754); and before the stairs, as the bed
    // is (L-778): the foot of the ladder by the table of the house#10778 of the generation-25 metropole won it from Thyra
    // standing at her place and turned to it, «Subir pela escada de mão» (L-815)
    if (seat && seat.t.pl.use === 'comer' && best !== seat && !G.Avatar.seated() && (best.p.id === 'cama' || best.p.id === 'escada' || (best.p.id === 'atividade' && best.t.o && /^lar\.cozinhar:/.test(best.t.o.id || '')))) { const a = aim(ctx, seat.t.X, seat.t.Z); if (a.ang <= I.FACE && a.ang < aim(ctx, best.t.X, best.t.Z).ang) best = seat; }
    // (an offer of the world with no place of its own, where the body stands — the meal on the floor of a house with no table,
    // seat nor hearth —: what the body faces in reach is meant before it. Its point was the body's own, its bearing the noise of
    // two positions a hair apart: by the mat of the house#35280 of the metrópole of the generation 11 the body facing its bed
    // heard «Comer em casa, da despensa», and never lay down by E — L-467)
    if (best.t.here && faced) best = faced;
    // (at a door it is the door one means, not an animal going by — unless the body faces the animal more than the door, by more
    // than a few degrees, and the animal is the nearer: then the animal. In line with the door, the door)
    if (door && pass && (best === door || best === pass)) { const a = aim(ctx, pass.t.X, pass.t.Z), b = aim(ctx, door.t.X, door.t.Z); best = a.d < b.d && a.ang + I.AHEAD < b.ang ? pass : door; }
    // (and out of doors, facing the door of a plan in reach — within I.FACE of where the body looks —, that door over anything
    // else about it that is not a door's, by the same rule: a tree, a stone, someone in line with it; and the water one stands
    // in, which has no place of its own to be faced more than a door (here) — on the doorstep of the sobrado#13586, in a canal,
    // «Pescar com as mãos», always a stride straight ahead, won over «Bater à porta»: L-326. Save the urgent (nothing the hands
    // do today), and what is meant more than a door: the work in reach at its pile or at the door it goes in by (pref); indoors,
    // the house's own things — its bed, its stairs — as they were)
    else if (open && !best.p.door && !best.p.urgent && !(best.t.pref > 0) && !G.Avatar.indoors()) {
      const a = aim(ctx, best.t.X, best.t.Z), b = aim(ctx, open.t.X, open.t.Z);
      if (b.ang <= I.FACE && !(!best.p.here && a.d < b.d && a.ang + I.AHEAD < b.ang)) {
        // (the water's, with no place of its own, gives way to the door — but by the same rule what the body faces does not: an
        // animal a stride before the body, nearer and more in front than the door, is the animal. On the doorstep in a canal of the
        // house#15649 of the generation-16 metropole, the pig at 0° and 0.70 m, the door at 40° and 1.89 m, the fish a stride ahead
        // won the score and the door won the fish: «Fechar a porta» — against the rule of the porta 3)
        const f = (best.p.here || best.t.here) && other ? aim(ctx, other.t.X, other.t.Z) : null;
        best = f && f.d < b.d && f.ang + I.AHEAD < b.ang ? other : open;
      }
    }
    // (standing, someone of the body's room gives way to the room's own thing the body faces, and faces more — the free seat of a table
    // where people sit, the bed, the counter, the chest, the door: the person's reach (3.2 m, the seat's 2.2) gave the one beside a free
    // seat more for the same distance than ROOM_PREF takes off; walking up to the free seats of the tables with people of the evening
    // metropole, the seat faced and in reach, the E was someone of the room beside it at 48 points of 297: «Conversar com a agricultora
    // nórdica», 48° round — L-2181, D-918, the acoes a8)
    if (best.t.room && !G.Avatar.seated()) {
      const pa = aim(ctx, best.t.X, best.t.Z).ang; let th = null;
      for (const q of sn.all) { if (q.p.id === 'pessoa' || q.p.here || q.t.here) continue; const a = aim(ctx, q.t.X, q.t.Z).ang; if (a <= I.FACE && a < pa && (!th || q.sc > th.sc)) th = q; }
      if (th) best = th;
    }
    // (on the doorstep of a building that is no house — its own offer's point is under the feet there, G.Vg.door: «Examinar taverna», a
    // meal at the store, a prayer —, its plan's door faced in reach, shut or locked, before that offer: open it, or knock. Both are doors
    // to the rule above, and the offer under the feet won by its nearness: the owner at the tavern's door was offered a look at it — T-2061,
    // L-2178. Save the offer meant more there: the load set down at the store, pref)
    if (best.p.id === 'porta' && !(best.t.pref > 0) && G.Interiors && G.Interiors.doorState) {
      let pd = null; for (const q of sn.all) if (q.p.id === 'portaPlanta' && q.t.b === best.t.b && !q.t.dentro && (!pd || q.sc > pd.sc)) pd = q;
      const st = pd ? G.Interiors.doorState(pd.t.b, pd.t.d.id) : null;
      if (st && (st.state === 'fechada' || st.state === 'trancada') && aim(ctx, pd.t.X, pd.t.Z).ang <= I.FACE) best = pd;
    }
    const c = best.p.can(ctx, best.t);
    return { id: best.p.id, t: best.t, label: best.p.label(ctx, best.t), ok: c.ok, why: c.why || '', p: best.p };
  };
  // doing it: checked again at the moment of doing (the world moves between seeing and doing)
  I.run = function (choice) {
    const ctx = I.ctx(); if (!ctx || !choice || G.Avatar.busy() || G.Avatar.swimming()) return null;
    const p = choice.p || I.list.find(q => q.id === choice.id); if (!p) return null;
    const t = choice.t;
    if (score(ctx, t.X, t.Z, (t.reach || p.reach) + 0.6) < 0) return { ok: false, msg: 'Longe demais.' };
    const c = p.can(ctx, t); if (!c.ok) return { ok: false, msg: c.why };
    const r = p.run(ctx, t) || { ok: true };
    // (the stories hear of the deed in the world's own step, as of everything the world does)
    { const sig = { id: ctx.v.id, what: p.id, x: ctx.x, y: ctx.y, set: ctx.v.set }; G.Possess.apply(() => { G.Stories && G.Stories.signal('avatarDeed', sig); return { ok: true }; }); }
    return r;
  };
  // ------------------------------ the verbs of a target (the second wave's contract, D-460) ------------------------------
  // A provider may give more than one thing to do with what the body faces: verbs(ctx, t) → [{ k, label, can, run }] — k the key
  // that does it: 'outra' (F) or 'segurar' (E held; 20e times it); the E itself ('usar') is always the provider's own label / can /
  // run. Which target is meant stays I.best's, with all its rules; the verbs are that target's. label: text or (ctx, t) → text; can:
  // (ctx, t) → { ok, why } (none: always); run: (ctx, t) → { ok, msg, card } as a provider's run
  I.VERB_KEYS = ['usar', 'outra', 'segurar'];
  // (20e, D-395: a verb another file brings to a provider it does not own — the fight's «Desafiar» on a person —, by the
  // provider's id; and its order: of several verbs on one key, the first that can be done now has the key, the first of all
  // when none can — by ord (0 when not said), then as they came; the verbs that lost their key are the card's: offer().more)
  const EXTRA = new Map();
  I.verb = function (id, x) {
    if (!id || !x || (x.k !== 'outra' && x.k !== 'segurar') || typeof x.run !== 'function') return false;
    const L = EXTRA.get(id) || []; const i = x.id ? L.findIndex(q => q.id === x.id) : -1; if (i >= 0) L[i] = x; else L.push(x); EXTRA.set(id, L); return true;
  };
  I.unverb = (id, vid) => { const L = EXTRA.get(id); if (!L) return false; const n = L.length; EXTRA.set(id, L.filter(q => q.id !== vid)); return EXTRA.get(id).length < n; };
  const verbList = (ctx, b) => {
    if (!b || !b.p) return []; const own = typeof b.p.verbs === 'function' ? b.p.verbs(ctx, b.t) || [] : [];
    return own.concat(EXTRA.get(b.p.id) || []).filter(x => x && (x.k === 'outra' || x.k === 'segurar') && typeof x.run === 'function')
      .map((x, i) => [x, i]).sort((a, c) => (a[0].ord || 0) - (c[0].ord || 0) || a[1] - c[1]).map(e => e[0]);
  };
  const vlabel = (x, ctx, t) => (typeof x.label === 'function' ? x.label(ctx, t) : String(x.label || ''));
  // (the verbs of a target, one a key: { keys: Map(k → { x, k, id, label, ok, why }), more: [the others] }; a verb with no words is
  // no verb now — a provider says one only where it means something)
  function chooseVerbs(ctx, b) {
    const keys = new Map(), more = [];
    for (const x of verbList(ctx, b)) {
      const label = vlabel(x, ctx, b.t); if (!label) continue;
      const c = x.can ? x.can(ctx, b.t) || { ok: false } : { ok: true }; const e = { x, k: x.k, id: x.id || '', label, ok: !!c.ok, why: c.why || '' };
      const cur = keys.get(x.k); if (!cur) keys.set(x.k, e); else if (!cur.ok && e.ok) { more.push(cur); keys.set(x.k, e); } else more.push(e);
    }
    return { keys, more };
  }
  // what can be done with the target the body faces now: { id, t, p, verbs: [{ k, label, ok, why }] (the E first, one a key), more:
  // [{ k, id, label, ok, why }] (the verbs that lost their key: the card shows them) }, or null
  I.offer = function (b) {
    const ctx = I.ctx(); if (!ctx) return null; b = b || I.best(); if (!b) return null;
    const verbs = [{ k: 'usar', label: b.label, ok: b.ok, why: b.why }]; const ch = chooseVerbs(ctx, b);
    for (const k of ['outra', 'segurar']) { const e = ch.keys.get(k); if (e) verbs.push({ k, id: e.id, label: e.label, ok: e.ok, why: e.why }); }
    return { id: b.id, t: b.t, p: b.p, verbs, more: ch.more.map(e => ({ k: e.k, id: e.id, label: e.label, ok: e.ok, why: e.why })) };
  };
  // every verb of a target, in the order a list shows them (the wave 4 I, D-916): the E first, then the provider's and the registry's
  // by their ord — each { k, id, label, ok, why, sub }: sub a short line under it (where a game comes from, D-920: the can's own word,
  // else the verb's sub — text or (ctx, t) → text); all: the verbs with no words now too (label '', never ok, with the can's why — the
  // slot a list keeps, greyed, so what cannot be done now is seen, with why). Only read: the bar of the table and the list of actions
  I.verbsOf = function (b, all, id) {
    const ctx = I.ctx(); if (!ctx || !b || !b.p) return [];
    // (id: that one verb only — a verb that borrows another's words and can, the person's dice from the table's: D-922)
    const out = id === undefined ? [{ k: 'usar', id: '', label: b.label || '', ok: !!b.ok, why: b.why || '', sub: '' }] : [];
    for (const x of verbList(ctx, b)) {
      if (id !== undefined && (x.id || '') !== id) continue;
      const label = vlabel(x, ctx, b.t); if (!label && !all) continue;
      const c = x.can ? x.can(ctx, b.t) || { ok: false } : { ok: true };
      const sub = c.sub || (typeof x.sub === 'function' ? x.sub(ctx, b.t) : x.sub) || '';
      out.push({ k: x.k, id: x.id || '', label, ok: !!c.ok && !!label, why: c.why || '', sub: String(sub || '') });
    }
    return out;
  };
  // the target of one provider about the body now, as a choice (I.run and I.runVerb take it), whatever the body faces — the table it
  // sits at, for the bar of the table (D-916): the most meant of that provider in the look, null where it has none in reach. Only read
  I.here = function (id, sn) {
    let ctx = sn ? sn.ctx : null, best = null;
    if (sn) { for (const c of sn.all) if (c.p.id === id && (!best || c.sc > best.sc)) best = c; }
    else {
      // (with no look given, only that provider's: the bar asks a few times a second, and a whole look of every provider is the screen's)
      ctx = I.ctx(); const p = I.list.find(q => q.id === id); if (!ctx || !p || G.Avatar.swimming()) return null;
      for (const t of p.find(ctx)) { const s = score(ctx, t.X, t.Z, t.reach || p.reach); if (s >= 0 && (!best || s + (t.pref || 0) > best.sc)) best = { p, t, sc: s + (t.pref || 0) }; }
    }
    if (!best) return null; const k = best.p.can(ctx, best.t);
    return { id: best.p.id, t: best.t, label: best.p.label(ctx, best.t), ok: !!k.ok, why: k.why || '', p: best.p };
  };
  // doing verb k of the target the body faces (or of the choice given) — checked again at the moment of doing, as I.run; vid: one
  // verb by its id (a card's button: one that lost its key)
  I.runVerb = function (k, choice, vid) {
    if (!k || k === 'usar') return I.run(choice || I.best());
    // (the gesture of what the body just did — the talk that opened the person's card — gives way to the verb asked, where it may be
    // cut: a button of the card pressed in the talk's second and a half did nothing, unsaid — L-1713; an act with cut windows waits
    // for them, as the body's other acts)
    const ctx = I.ctx(); if (!ctx || G.Avatar.swimming()) return null;
    if (G.Avatar.busy()) { if (!G.Avatar.cuttable()) return null; G.Avatar.cancelAct(); }
    const b = choice || I.best(); if (!b) return null;
    const ch = chooseVerbs(ctx, b); const e = vid ? [...ch.keys.values(), ...ch.more].find(q => q.id === vid && q.k === k) : ch.keys.get(k); if (!e) return null;
    if (score(ctx, b.t.X, b.t.Z, (b.t.reach || b.p.reach) + 0.6) < 0) return { ok: false, msg: 'Longe demais.' };
    if (!e.ok) return { ok: false, msg: e.why };
    const r = e.x.run(ctx, b.t) || { ok: true };
    { const sig = { id: ctx.v.id, what: b.p.id + ':' + k, x: ctx.x, y: ctx.y, set: ctx.v.set }; G.Possess.apply(() => { G.Stories && G.Stories.signal('avatarDeed', sig); return { ok: true }; }); }
    return r;
  };
  // ------------------------------ the others in reach (20e, D-396) ------------------------------
  // A target's own name across looks (each look finds the targets anew): the provider and the thing of the world it is — for the
  // screen to keep the one shown (firm, D-398) and the one the player switched to. And the thing itself, whoever offers it: a tame
  // beast is one thing for «Observar» and «Fazer carinho», one person for every verb of a person
  const ref = t => (t.a ? 'a' + t.a.id : t.o && t.o.id !== undefined && G.S.villagers.get(t.o.id) === t.o ? 'v' + t.o.id : t.o ? 'o' + (t.o.id || t.o.act + ':' + (t.o.cid || t.o.op || 0))
    : t.tr ? 't' + t.tr.id : t.bu ? 'u' + t.bu.id : t.r ? 'r' + t.r.id : t.q ? 'q' + t.q.id : t.d && t.b ? 'd' + t.b.id + '/' + t.d.id : t.pl && t.b ? 'l' + t.b.id + '/' + t.pl.item + '/' + t.pl.q
    : t.it && t.b ? 'c' + t.b.id + '/' + (t.it.id !== undefined ? t.it.id : t.it.kind) : t.s ? 's' + t.s.id + (t.up ? 'u' : 'd') : t.g ? 'g' + t.g : t.b ? 'b' + t.b.id : t.i !== undefined ? 'w' + t.i : 'h');
  I.keyOf = c => (c && c.t ? (c.id || (c.p && c.p.id) || '') + ':' + ref(c.t) : '');
  I.thingOf = c => (c && c.t ? ref(c.t) : '');
  // the targets in reach one may switch to: I.best's first, then the others — one a thing, the most meant of its providers —, in the
  // order of where they are before the body, from its left to its right (a wheel or a cross goes along it as the eye does). Each
  // { id, t, p, label, ok, why, key, ang (radians: + to the right of where the body faces), d (metres) }. At most I.CANDS
  I.CANDS = 8; // (6 before the wave 4 I: a tavern's table seats six or more, each of them someone to switch to — D-918)
  I.candidates = function (sn) {
    sn = sn || I.scan(); if (!sn) return []; const b = I.best(sn); if (!b) return []; const ctx = sn.ctx;
    const by = new Map(); by.set(ref(b.t), { p: b.p, t: b.t, sc: Infinity });
    for (const c of sn.all) { const k = ref(c.t); const o = by.get(k); if (!o || c.sc > o.sc) by.set(k, c); }
    const out = [];
    for (const [k, c] of by) {
      const first = c.sc === Infinity; const cc = first ? { ok: b.ok, why: b.why } : c.p.can(ctx, c.t);
      const dx = c.t.X - ctx.X, dz = c.t.Z - ctx.Z; const ang = Math.atan2(Math.sin(Math.atan2(dz, dx) - ctx.yaw), Math.cos(Math.atan2(dz, dx) - ctx.yaw));
      out.push({ id: c.p.id, t: c.t, p: c.p, label: first ? b.label : c.p.label(ctx, c.t), ok: !!cc.ok, why: cc.why || '', key: I.keyOf(c), thing: k, ang, d: Math.hypot(dx, dz), first, sc: c.sc });
    }
    // (the most meant ones, the first always among them; then laid out from left to right — what has no place of its own, the water
    // underfoot, after them all)
    const keep = out.sort((x, y) => (y.first ? 1 : 0) - (x.first ? 1 : 0) || y.sc - x.sc).slice(0, I.CANDS);
    return keep.sort((x, y) => ((x.t.here || x.p.here) ? 1 : 0) - ((y.t.here || y.p.here) ? 1 : 0) || x.ang - y.ang || (x.key < y.key ? -1 : 1));
  };
  // a candidate as I.run and I.runVerb take it — the choice the screen made — checked again at the doing (its provider's can)
  I.asChoice = function (c) {
    const ctx = I.ctx(); if (!ctx || !c || !c.p) return null; const k = c.p.can(ctx, c.t);
    return { id: c.p.id, t: c.t, label: c.p.label(ctx, c.t), ok: !!k.ok, why: k.why || '', p: c.p };
  };
  const face = (ctx, X, Z) => Math.atan2(Z - ctx.Z, X - ctx.X);
  // The hands of the body change the world as anyone's do: what an act does is asked at its contact and done by the world in
  // its own step (Avatar.act's op, through Possess.apply), and it lasts the world seconds the same work lasts for anyone of the
  // world — a meal at the store in 1.6 s, a prayer at the temple in 5 s (villagers.js), a lift and a setting down in the docker's
  // own gestures (G.Act.ANIM): the player's presence gives no work for free. Only the hands' own gestures — a word, a wave, a
  // hug's arms — keep the body's own seconds. (The work of the hands — the axe, the pick, the berries, the fish — and its
  // seconds are the trades', G.Trabalho: trabalho.js, D-461)
  const WT = { eat: 1.6, pray: 5 };
  I.WT = WT;
  // (the gestures of the hands as the world's people make them — seconds of the world, the contact where the world passes the
  // thing: C1's Act.ANIM —, for the body too: it never lifts a load faster than the docker)
  const AN = k => (G.Act && G.Act.ANIM && G.Act.ANIM[k]) || { act: 'lift', dur: 1, contact: 0.6 };
  // the hands' way to a point of the world through an act (only seen): reaching it in the body's own half second, holding there
  // until the world has answered, coming back after — with the load the world put in them, or without the one it took; on a
  // refusal, back as they were. P: the point (metres), or a function of the act giving it
  const reachTo = (P, wid, back) => a => {
    const dt = a.rwT === undefined ? 0 : Math.max(0, a.tr - a.rwT); a.rwT = a.tr; if (a.rs === undefined) a.rs = a.tr;
    // (the hands get there just before the contact: the world's contact is a while away in the body's own seconds)
    const up = G.clamp(((a.world ? a.contact / G.Space.TIME : a.contact) - a.rs) * 0.85, 0.25, 1.2);
    a.rw = G.clamp((a.rw || 0) + (a.res ? -dt / (a.res.ok ? back || 0.45 : 0.35) : dt / up), 0, 1);
    const p = typeof P === 'function' ? P(a) : P; return { X: p[0], Y: p[1], Z: p[2], w: a.rw, wid: wid || 0.32 };
  };
  I.reachTo = reachTo;
  // (the ground under a point of the world, metres)
  const gY = (X, Z) => G.Avatar.floorAt(X, Z);
  // (a point before the body, toward a thing of the world and in reach of the arms: at most a stride ahead, up metres over the ground)
  const toward = (ctx, X, Z, up, most) => { const d = Math.hypot(X - ctx.X, Z - ctx.Z), k = d > 1e-6 ? Math.min(most || 0.55, Math.max(0.3, d - 0.3)) / d : 0; const x = ctx.X + (X - ctx.X) * k, z = ctx.Z + (Z - ctx.Z) * k; return [x, gY(x, z) + up, z]; };
  // (a step or two up to a thing before the hands go to it: where the feet stop — near metres short of it — and how long the walk
  // takes, in the body's own seconds; none when it is in reach)
  const walkUp = (ctx, v, X, Z, near) => {
    const d = Math.hypot(X - ctx.X, Z - ctx.Z); if (d <= near + 0.25) return { to: null, go: 0 };
    const f = Math.atan2(Z - ctx.Z, X - ctx.X); return { to: [X - Math.cos(f) * near, Z - Math.sin(f) * near], go: G.clamp((d - near) / (G.Possess.caps(v).walk * 1.1), 0.25, 1.6) };
  };
  // (20e: the step or two up first, then the gesture in an act of its own — a gesture of one go, a clip that runs from its own start,
  // never one begun half through by the walk: the walk's act ends, and its end begins the next; none when it is in reach)
  const stepUp = (ctx, v, X, Z, near, next) => {
    const { to, go } = walkUp(ctx, v, X, Z, near); if (!go) return next();
    G.Avatar.act({ anim: 'interact', dur: go, to, toT: go, face: Math.atan2(Z - ctx.Z, X - ctx.X), done: () => next() }); return { ok: true };
  };
  // (the point where a load in the hands goes down: before the feet where they stand when the hands go, toward X, Z)
  const putAt = (v, X, Z) => a => { if (!a.P) { const H = G.People3D && G.People3D.look(v).held; a.P = toward(G.Avatar.pos(), X, Z, (H ? H.size[1] / 2 : 0.15) + 0.02); } return a.P; };
  // (a word the world says back to the hands: shown when the world has answered)
  const say = (txt, d) => { if (txt && G.IncUI && G.IncUI.toast) G.IncUI.toast(txt, d || 2.4); };
  const deny = r => { if (r && r.why) say(r.why); G.Audio && G.Audio.play && G.Audio.play('deny'); };
  // (a deed that only says what was done — a look, a knock: counted by the world in its step)
  const deed = (k, n) => G.Possess.apply(() => { G.Possess.deed(k, n); return { ok: true }; });
  // (someone, in the words of the body: the name when it knows them, else what is seen of them — «o ferreiro» —; Who: at the
  // head of a sentence. The one door of a name on the body's screens: Possess.knows, D-172)
  const who = (v, o) => G.Possess.knows.call(v, o);
  const Who = (v, o) => G.cap(who(v, o));

  // ============================== people ==============================
  // what someone says when spoken to: from what is true of them now (their errand, their body, their family, their past)
  function line(me, o) {
    const S = G.S; const P = G.Possess; const k = P.kin(o, me); const T = G.Vg.taskText(o) || '';
    const ab = o.age < 14;
    if (o.sleeping) return null;
    if (o.fear > 60) return ab ? 'Estou com medo…' : 'Agora não! Você não viu o que está acontecendo?';
    if (k === 'mãe' || k === 'pai') return [`${me.name}! Já comeu hoje?`, `Aí está ${me.g === 'f' ? 'a minha menina' : 'o meu menino'}.`, `Não some assim, ${me.name}.`][(o.id + S.day) % 3];
    if (k === 'filho' || k === 'filha') return o.age < 10 ? (me.g === 'f' ? 'Mãe! Brinca comigo?' : 'Pai! Brinca comigo?') : `${me.g === 'f' ? 'Mãe' : 'Pai'}, estou ${T.charAt(0).toLowerCase() + T.slice(1)}.`;
    if (k === 'companheiro' || k === 'companheira') return [`Você parece diferente hoje, ${me.name}.`, 'Volta cedo pra casa.', 'Que bom te ver.'][(o.id + S.day) % 3];
    if (o.hunger >= 90) return 'Estou morrendo de fome. O armazém tem comida?';
    if (o.sick > 0) return 'Não chegue perto… estou doente.';
    if (o.mourn > 0) { const lost = (o.bio || []).slice().reverse().find(e => e[1] === 'lost'); const p = lost && G.person(lost[2]); return p ? `Ainda não acredito que ${p.name} se foi.` : 'Perdi alguém… me deixa.'; }
    const st = G.Stories ? G.Stories.of(o.id).find(s => s.protag === o.id) : null;
    if (st && st.title && (o.id + S.day) % 2 === 0) return `Tenho uma coisa a resolver: ${st.title.charAt(0).toLowerCase() + st.title.slice(1)}.`;
    const fac = G.Fac.ofV(o); const war = fac && G.Fac.enemiesOf(fac.id)[0];
    if (war && (o.id + S.day) % 3 === 0) return `Dizem que a guerra contra ${war.name} vai piorar.`;
    if (k) return `Oi, ${me.name}.`;
    if (T) return `${T}.`;
    return ab ? 'Oi!' : 'Bom dia.';
  }
  I.line = line;
  // the card of a person: who they are, from the world's records — as much of them as the one who reads it knows (Possess.knows,
  // D-172). Of the blood and of the house, everything; of someone known by name — or just spoken to (told: they said who they
  // are) —, the name, the trade, the town, what they are at, their fame, and of their family those the reader knows too; of a
  // stranger, what the eyes see. With no reader (me: null) it is the god's: everything
  const AGES = [[2, 'de colo'], [12, 'criança'], [16, 'bem jovem'], [30, 'jovem'], [50, 'de meia-idade'], [62, 'já de idade'], [1e9, 'de muita idade']];
  const seenDoing = o => (o.sleeping ? 'Dormindo' : o.carry && o.carry.n > 0 ? `Carregando ${G.Eco ? G.Eco.name(o.carry.k) : o.carry.k}` : o.moving ? 'Andando' : 'Parad' + oa(o));
  I.personCard = function (o, me, told) {
    const S = G.S; const K = G.Possess.knows; const id = G.Possess.identity(o);
    const how = K.how(me, o); const lvl = Math.max(how.n, told ? 1 : 0);
    const nm = x => { const p = x && G.person(x); return p && K.person(me, p) ? p.name + (p.dead ? ' (†)' : '') : null; };
    const base = { kind: 'person', id: o.id, knows: lvl, kin: me ? G.Possess.kin(me, o) : null, hp: Math.round(o.hp), hunger: Math.round(o.hunger), energy: Math.round(o.energy) };
    if (!lvl) return Object.assign(base, { name: G.cap(K.looks(o, me).um), sub: AGES.find(a => o.age < a[0])[1], from: null, first: false, set: null, fac: null, home: null, parents: [], partner: null, kids: [], traits: [], doing: seenDoing(o), bio: [], stories: [], ruler: false, kills: 0, why: '' });
    const all = lvl >= 2; const L1 = all && G.Life ? G.Life.bioList(o).slice(-6).reverse() : [];
    // (the stories they lead — what they would say they have to settle; the ones others weave around them only the god reads)
    const st = all && G.Stories ? G.Stories.of(o.id).filter(s => !me || s.protag === o.id).map(s => s.title).filter(Boolean).slice(0, 3) : [];
    const town = S.settlements.get(o.set); const kt = !me || (town && K.town(me, town));
    return Object.assign(base, {
      name: id.name + (id.epithet ? ', ' + id.epithet : ''), sub: `${id.age} ${id.age === 1 ? 'ano' : 'anos'} · ${id.role}`,
      from: all ? id.from : null, first: id.first, set: kt ? id.set : null, fac: kt ? id.fac : null, home: id.home,
      parents: [nm(id.mother), nm(id.father)].filter(Boolean), partner: nm(id.partner), kids: id.kids.map(nm).filter(Boolean),
      traits: all ? id.traits : [], doing: doingOf(me, o), bio: L1.map(e => ({ age: e.age, txt: e.txt })), stories: st, ruler: id.ruler, kills: id.kills,
      why: all || !me ? '' : K.WHY[how.why] || 'de conversa',
    });
  };
  I.add({
    id: 'pessoa', prio: 5, reach: 3.2,
    find(ctx) {
      const out = []; const S = G.S; const R = 3.6 / L();
      // (and those in the body's own room — the same building, the same storey, settled at the place the share-out gives them: never
      // one walking in or out by the door, nor asleep —, where they are in it (In.posOf: the world keeps the door's point in o.x, o.y).
      // Inside the tavern nobody at all was a person to the body: «Está bem difícil de interagir com as pessoas» — L-2170. The room's
      // own things the body is in reach of are meant a little before them — the seat, the bed, the chest, the table it sits at: pref)
      const ind = ctx.v.inside > 0 && G.Avatar.indoors ? G.Avatar.indoors() : null; const In = G.Interiors;
      for (const o of S.villagers.values()) {
        if (o.id === ctx.v.id || o.aboard || o.held || o.air || o.ug || (o.age < 2 && o.carried)) continue;
        if (o.inside) {
          if (!ind || !ind.b || o.inside !== ind.b.id || o.sleeping || o.age < 2 || !In || !In.posOf || (In.passage && In.passage(o))) continue; // (a baby in the room is no one to turn to: it is in someone's arms or its crib)
          const p = In.posOf(o); if (!p || p[2] !== ind.lv || Math.abs(p[0] - ctx.x) > R || Math.abs(p[1] - ctx.y) > R) continue;
          out.push({ o, X: p[0] * L(), Z: p[1] * L(), room: ind.b.id, pref: I.ROOM_PREF }); continue;
        }
        if (Math.abs(o.x - ctx.x) > R || Math.abs(o.y - ctx.y) > R) continue;
        out.push({ o, X: o.x * L(), Z: o.y * L() });
      }
      return out;
    },
    // (the other by their name when the body knows them, else by what is seen of them: Possess.knows)
    label(ctx, t) { const k = G.Possess.kin(ctx.v, t.o); return k ? `Conversar com ${k === 'mãe' || k === 'filha' || k === 'irmã' || k === 'avó' || k === 'tia' || k === 'companheira' ? 'sua' : 'seu'} ${k}, ${t.o.name}` : `Conversar com ${who(ctx.v, t.o)}`; },
    can(ctx, t) {
      const o = t.o; if (!G.S.villagers.has(o.id)) return { ok: false, why: 'Não está mais aqui.' };
      if (o.sleeping) return { ok: false, why: `${Who(ctx.v, o)} está dormindo.` };
      if (o.age < 2) return { ok: false, why: `${Who(ctx.v, o)} ainda é um bebê.` };
      return { ok: true };
    },
    run(ctx, t) {
      const o = t.o; const me = ctx.v;
      const txt = line(me, o);
      // (the other turns to the one speaking, and answers: a line over their head, in both views — and stops a moment to talk,
      // as the world's people stop for each other — the day's work too, as for a courtship; not a meal, sleep, the watch or
      // anything urgent. The moments here are the body's seconds, in the world's slower time of the body: G.Space.TIME. All of
      // it done by the world in its step)
      G.Possess.apply(() => {
        if (!G.S.villagers.has(o.id)) return { ok: false, why: '' };
        // (one in the body's room answers from their place, no errand given: an errand indoors walks one out by the door first — L-2171)
        const room = o.inside > 0; if (!room) G.faceTo(o, me.x - o.x, me.y - o.y);
        if (txt && !room && (!o.task || o.task.pri <= 1)) G.Vg.setTask(o, { type: 'talk', id: me.id, pri: 0.9, wait: 5 * G.Space.TIME, kind: 'talk' });
        if (txt && G.Talk) G.Talk.say(o, txt, { dur: 4 });
        if (G.Possess.kin(me, o)) G.Vg.emote(o, 'heart', 2);
        if (G.Possess.meet(o.id)) G.Possess.deed('conversa');
        return { ok: true };
      });
      G.Avatar.act({ anim: 'talk', dur: 1.4, lock: false, face: face(ctx, t.X, t.Z) });
      // (spoken to, they say who they are: the card with their name — what else the body knows of them, by what it knew)
      return { ok: true, card: I.personCard(o, me, true), said: txt };
    },
    // (20e: F gives them something of one's bag — the screen of what is kept, with them on the other side —; E held, a hug for
    // one's own and for anyone in mourning. ord 5: a verb another part brings for F — the fight's challenge — has the key first,
    // and the giving goes to the card)
    verbs(ctx, t) {
      // (the giving only with something in the bag to give: an empty bag puts no verb on the F)
      const o = t.o, me = ctx.v; const out = [{ id: 'dar', k: 'outra', ord: 5, label: G.Inv && G.Inv.list(me).length ? `Dar algo ${G.Possess.knows.ao(me, o)}` : '', can: () => I.canGive(me, o), run: () => ({ ok: true, panel: { kind: 'dar', id: o.id } }) }];
      const h = I.canHug(me, o); if (h.label) out.push({ id: 'abraco', k: 'segurar', label: h.label, can: () => { const c = I.canHug(me, o); return { ok: c.ok, why: c.why }; }, run: () => I.hug(o) });
      return out;
    },
  });
  // ------------------------------ 22b: the body's social verbs on a person (D-628) ------------------------------
  // (each verb of G.SocVerbos on the person — the card's buttons, its number keys, the touch —: the body's gesture now, the world's
  // doing in its step — the other's answer, said once it is done —; and the gift given warms the one who took it)
  if (G.SocVerbos) {
    G.SocVerbos.VERBS.forEach((id, i) => { const d = G.SocVerbos.def(id);
      I.verb('pessoa', { id: 'soc-' + id, k: 'outra', ord: 20 + i, label: (ctx, t) => d.label(ctx.v, t.o), can: (ctx, t) => d.can(ctx.v, t.o),
        run(ctx, t) {
          const me = ctx.v, o = t.o; const c = d.can(me, o); if (!c.ok) return { ok: false, msg: c.why || 'Agora não dá.' };
          if (G.Avatar.busy()) G.Avatar.cancelAct();
          G.Avatar.act({ anim: d.anim || 'talk', dur: d.dur || 1.4, lock: false, face: face(ctx, o.x * L(), o.y * L()) });
          const ask = G.Possess.apply(w => { if (!G.S.villagers.has(o.id)) return { ok: false, why: '' }; G.Possess.meet(o.id); return G.SocVerbos.faz(id, w, o, G.Space.TIME); });
          // (what is said of it is the world's answer, read when it has come)
          return { ok: true, ask, get msg() { return (ask.res && (ask.res.say || ask.res.why)) || '…'; } };
        } }); });
    Object.assign(G.Possess.DEED, G.SocVerbos.DEEDS);
    const gave0 = G.Possess.gave;
    G.Possess.gave = function (o) { const r = gave0.apply(this, arguments); const me = G.Possess.body(); if (r && me && o && me !== o && G.Lacos) G.Lacos.ato(me, o, 'dadiva'); return r; };
  }
  // (may the body give someone a thing now: there, awake, old enough to hold it, beside it — and something of its own to give)
  // (where one is to the body's hands, in tiles: in the body's room, at their place — In.posOf, D-917)
  const posOf = o => (G.Interiors && G.Interiors.posOf ? G.Interiors.posOf(o) : [o.x, o.y, 0]);
  I.canGive = function (me, o) {
    if (!me || !o || !G.S.villagers.has(o.id) || o.id === me.id) return { ok: false, why: 'Não está mais aqui.' };
    if (o.sleeping) return { ok: false, why: `${Who(me, o)} está dormindo.` };
    if (o.age < 2) return { ok: false, why: `${Who(me, o)} ainda é um bebê.` };
    // (one in the body's own room is given to as anyone, where they sit — L-2170)
    if ((o.inside && o.inside !== me.inside) || o.aboard || o.held || o.air || o.jail) return { ok: false, why: `Agora não dá para dar nada ${G.Possess.knows.ao(me, o)}.` };
    { const p = posOf(o); if (G.dist(me.x, me.y, p[0], p[1]) * L() > 3.8) return { ok: false, why: 'Longe demais.' }; }
    if (!G.Inv || !G.Inv.list(me).length) return { ok: false, why: 'Você não tem nada na mochila para dar.' };
    return { ok: true };
  };
  // a thing of the bag given to someone, in the world's step (the screen asks it by the body's hands, Possess.apply): the giving
  // is the inventory's (G.Inv.give: their room, the reach, the ledger's «dar»); the two have met face to face (Possess.meet), the
  // other turns to the body and thanks it. → G.Inv.give's answer, with the thanks said
  I.give = function (w, o, key, n) {
    if (!w || !o || !G.Inv) return { ok: false, why: 'Não há a quem dar.' };
    const r = G.Inv.give(w, o, key, n); if (!r.ok) return r;
    G.Possess.gave(o); // (the two have met; the deed counted: possess.js)
    G.faceTo(o, w.x - o.x, w.y - o.y); const k = G.Possess.kin(w, o); const nm = G.Itens.nome(G.Itens.canon(key) || key, r.n);
    const said = o.age < 12 ? 'É pra mim? Obrigad' + oa(o) + '!' : k ? `Obrigad${oa(o)}, ${w.name}.` : G.Itens.isThing(G.Itens.canon(key)) ? `${G.cap(nm)}? Que generosidade!` : 'Obrigad' + oa(o) + '.';
    G.Talk && G.Talk.say(o, said, { dur: 3 }); G.Vg.emote(o, 'heart', 1.5);
    return Object.assign({}, r, { said, k: G.Itens.canon(key) });
  };

  // a hug: for one's own (the family, the partner) and for anyone in mourning — offered on their card, after a word.
  // The other stops and holds the body too (their talk, with the arms); a grieving one is comforted: the mourning eases
  I.canHug = function (me, o) {
    if (!me || !o || !G.S.villagers.has(o.id) || o.id === me.id) return { ok: false, why: 'Não está mais aqui.' };
    const k = G.Possess.kin(me, o); const grief = o.mourn > 0;
    // (and one fond of the body: the hug of a friend — what the other feels, G.Lacos; 22b D-629)
    const fond = !k && !grief && !!(G.Lacos && (G.Lacos.sente(o, me) || { afeto: 0 }).afeto >= 40);
    if (!k && !grief && !fond) return { ok: false, why: '' };
    const label = grief && !k ? `Consolar ${who(me, o)}` : `Abraçar ${who(me, o)}`;
    if (o.sleeping) return { ok: false, label, why: `${Who(me, o)} está dormindo.` };
    // (one in the body's room stays at their place: the hug is an errand of the two on their feet, and an errand indoors walks one out
    // by the door — L-2171)
    if (o.inside && o.inside === me.inside) return { ok: false, label, why: `Aqui dentro, cada um no seu lugar: não dá para abraçar ${who(me, o)} agora.` };
    if (o.inside || o.aboard || o.held || o.air || o.jail || o.age < 2) return { ok: false, label, why: `Não dá para abraçar ${who(me, o)} agora.` };
    if (o.fear > 60) return { ok: false, label, why: `${Who(me, o)} está assustad${oa(o)} demais.` };
    if (o.task && o.task.pri > 1) return { ok: false, label, why: `${Who(me, o)} está ocupad${oa(o)} com algo que não pode esperar.` };
    if (G.dist(me.x, me.y, o.x, o.y) * L() > 3.8) return { ok: false, label, why: 'Longe demais.' };
    if (G.Avatar && G.Avatar.swimming()) return { ok: false, label, why: 'Agora não dá.' }; // (a question of the screen, asked in Node too — qa/sabe.js —, where the 3D body is not loaded: T-1237)
    return { ok: true, label, kin: k, grief };
  };
  I.hug = function (o) {
    const ctx = I.ctx(); if (!ctx) return { ok: false, msg: 'Agora não dá.' };
    const me = ctx.v; const c = I.canHug(me, o); if (!c.ok) return { ok: false, msg: c.why || 'Agora não dá.' };
    if (G.Avatar.busy()) G.Avatar.cancelAct(); // (the word just said, or sitting: the arms are free for this)
    const X = o.x * L(), Z = o.y * L(); const f = face(ctx, X, Z); const d = Math.hypot(X - ctx.X, Z - ctx.Z);
    // (the body steps up to arm's length; the other turns to it and holds it)
    const to = d > 0.62 ? [X - Math.cos(f) * 0.55, Z - Math.sin(f) * 0.55] : null;
    // (a moment's hug outweighs a meal or a nap that can wait three seconds — the world's needs take over at 1.2 — never a fire;
    // and the one hugged answers — asked of the world now, done in its step)
    const k = c.kin; const said = c.grief ? (o.age < 14 ? 'Eu sinto tanta falta…' : 'Obrigad' + oa(o) + '. Eu precisava disso.') : k === 'mãe' || k === 'pai' ? `Ah, ${me.name}…` : k === 'filho' || k === 'filha' ? (o.age < 10 ? 'Mais forte!' : 'Eu também te amo.') : k === 'companheiro' || k === 'companheira' ? 'Fica mais um pouco.' : 'Que saudade!';
    const sig = { id: me.id, what: 'abraco', x: ctx.x, y: ctx.y, set: me.set };
    const ask = G.Possess.apply(() => { if (!G.S.villagers.has(o.id)) return { ok: false, why: '' }; G.Vg.setTask(o, { type: 'talk', id: me.id, pri: 1.25, wait: 4.2 * G.Space.TIME, hug: 1 }); G.Stories && G.Stories.signal('avatarDeed', sig); G.Talk && G.Talk.say(o, said, { dur: 3 }); return { ok: !!(o.task && o.task.hug) }; });
    // (both hold on while both are there: called away by the world — a festival, a fire — or gone, the arms let go, nothing counts)
    const holds = () => G.S.villagers.has(o.id) && !!o.task && !!o.task.hug && o.task.id === me.id;
    G.Avatar.act({ anim: 'hug', dur: 2.6, face: f, to, toT: 0.8, keep: () => !ask.res || (ask.res.ok && holds()), contact: 2.6,
      at: [1, () => G.Possess.apply(() => { if (holds()) { G.Vg.emote(o, 'heart', 2); G.Vg.emote(me, 'heart', 2); } return { ok: true }; })],
      op: () => {
        if (!holds()) return { ok: false, why: '' };
        const grief = o.mourn > 0; if (grief) o.mourn = Math.max(0, o.mourn - G.DAY_LEN * 0.35);
        G.Vg.endTask(o); // (and they go back to their day)
        G.Possess.deed(grief ? 'consolo' : 'abraco');
        if (G.Lacos) G.Lacos.ato(me, o, 'abraco'); // (and it stays in what the two feel — 22b D-629)
        return { ok: true };
      } });
    // (what is said of it is said once the one hugged has answered: ask, for the card that asked)
    return { ok: true, ask, msg: c.grief ? `Você abraça ${who(me, o)}, que chora no seu ombro.` : `Você abraça ${who(me, o)}.`, said };
  };
  // the dance: whoever is free near the body joins it a while (the children, the merry, the family first) — the world's doing, asked
  // of it in its step (Possess.apply)
  I.danceJoin = function () {
    const ctx = I.ctx(); if (!ctx) return 0; const me = ctx.v; const R = 9 / L(); const out = [];
    for (const o of G.S.villagers.values()) {
      if (o.id === me.id || o.sleeping || o.inside || o.aboard || o.held || o.air || o.jail || o.ug || o.age < 3 || o.fear > 40 || o.hunger >= 90 || o.sick > 0) continue;
      if (Math.abs(o.x - ctx.x) > R || Math.abs(o.y - ctx.y) > R || (o.task && o.task.pri > 0.6)) continue;
      const k = G.Possess.kin(me, o); const merry = o.age < 14 || (o.traits || []).includes('Sociável') || o.id % 3 === 0;
      if (!k && !merry) continue;
      out.push([o, (k ? 2 : 0) + (o.age < 14 ? 1 : 0) - G.dist(o.x, o.y, ctx.x, ctx.y) * 0.1]);
    }
    out.sort((a, b) => b[1] - a[1]); let n = 0;
    for (const [o] of out.slice(0, 6)) { G.Vg.setTask(o, { type: 'talk', id: me.id, pri: 0.8, wait: (6 + (o.id % 4)) * G.Space.TIME, dance: 1 }); if (o.task && o.task.dance) { G.Vg.emote(o, 'happy', 1.5); n++; } }
    return n;
  };

  // ============================== the doors and the beds of a building's plan (G.Interiors) ==============================
  // (a door of the plan as the world has it — Interiors.doorState: shut, open, locked, blocked by a fire —; turned by the hands
  // as anyone turns it, the world doing it in its step — Interiors.useDoor, the keys only for who lives or works there)
  const own = (v, b) => v.home === b.id || v.job === b.id;
  // (the body within a building's walls — by the side of the wall its feet are on: the plan's shell; the doorstep is out —, not only by the
  // world's record, v.inside: the bar of a door is on the inside, and whoever is within lifts it — D-910, L-2160)
  const within = (v, b) => { const ins = G.Space.indoor(v.x * L(), v.y * L(), G.Possess.level(), b.id); return !!(ins && ins.b === b && ins.shell); };
  // (the door the street goes in by is reached from its doorstep — Interiors' entrance.out, where the world's people stand to go
  // in, up to two metres out —: the body steps up to it before the hands go to it)
  I.add({
    id: 'portaPlanta', prio: 4.6, reach: 1.8, door: true, opens: true, // (opens: a door that opens and shuts — the plan's)
    find(ctx) {
      const out = []; const S = G.S; const seen = new Set(); const ind = G.Avatar.indoors();
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const x = Math.floor(ctx.x) + dx, y = Math.floor(ctx.y) + dy; if (!G.W.inb(x, y)) continue; const id = S.occ[G.W.idx(x, y)]; if (!id || seen.has(id)) continue; seen.add(id);
        const b = S.buildings.get(id); const p = b && G.Space.plan(b); if (!p) continue;
        // (the storey the body is on there: its own indoors, the entrance's from the street)
        const lv = ind && ind.b === b ? ind.lv : p.entryLv || 0;
        const e = !(ind && ind.b === b) && p.entrance && p.entrance.out ? p.entrance : null;
        for (const d of p.doors) {
          if (d.kind === 'vao') continue; const w = p.walls[d.wall]; if (!w || w.lv !== lv) continue; const len = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1;
          // (dentro: the body within its walls, on this side of the door — D-910)
          const t = { b, p, d, lv, dentro: !!(ind && ind.b === b), X: b.x * L() + w.a[0] + (w.b[0] - w.a[0]) * d.at / len, Z: b.y * L() + w.a[1] + (w.b[1] - w.a[1]) * d.at / len };
          if (e && e.door === d.id) t.reach = Math.max(1.8, Math.hypot(b.x * L() + e.out[0] - t.X, b.y * L() + e.out[1] - t.Z) + 0.35);
          out.push(t);
        }
      }
      return out;
    },
    label(ctx, t) {
      const st = G.Interiors.doorState(t.b, t.d.id); const s2 = st ? st.state : 'fechada';
      // (locked, seen from inside: the bar is on this side — lifted and opened, and what that means said, D-910; from outside: one's own
      // key, or a knock — a bar is never lifted from the street)
      if (s2 === 'trancada') { const bar = G.Interiors.barOf(t.b, t.d.id); if (t.dentro) return bar ? bar.label : own(ctx.v, t.b) ? 'Destrancar e abrir a porta' : 'Tirar a tranca e abrir a porta'; return own(ctx.v, t.b) && !bar ? 'Destrancar e abrir a porta' : 'Bater à porta'; }
      return s2 === 'aberta' ? 'Fechar a porta' : s2 === 'bloqueada' ? 'A porta está bloqueada' : s2 === 'arrombada' ? 'A porta foi arrombada' : 'Abrir a porta';
    },
    can(ctx, t) {
      if (!G.S.buildings.has(t.b.id)) return { ok: false, why: 'Não existe mais.' };
      const st = G.Interiors.doorState(t.b, t.d.id); if (!st) return { ok: false, why: '' };
      if (st.state === 'bloqueada') return { ok: false, why: st.by === 'fogo' ? 'O fogo tomou a porta!' : 'A porta está bloqueada.' };
      if (st.state === 'arrombada') return { ok: false, why: 'A porta foi arrombada: está aberta e não fecha até ser consertada.' }; // (T1, D-812)
      return { ok: true };
    },
    run(ctx, t) {
      const b = t.b, d = t.d, v = ctx.v; const f = face(ctx, t.X, t.Z); const st = G.Interiors.doorState(b, d.id).state;
      const { to, go } = walkUp(ctx, v, t.X, t.Z, 0.7); const goW = go * G.Space.TIME; // (a step up to it, from its doorstep)
      // (a locked door from outside — someone else's, or barred from inside —: a knock — the house hears it, and whoever is in answers:
      // knock. From inside the bar is on this side, whoever's house it is: unlocked, lifted and opened — D-910, L-2160)
      const bar = st === 'trancada' ? G.Interiors.barOf(b, d.id) : null;
      if (st === 'trancada' && !t.dentro && (!own(v, b) || bar)) return knock(ctx, t);
      const want = st === 'aberta' ? 'fechar' : 'abrir';
      G.Avatar.act({ world: true, anim: 'interact', dur: 0.5 + goW, contact: 0.25 + goW, face: f, to, toT: go,
        op: w => {
          if (!G.S.buildings.has(b.id)) return { ok: false, why: 'Não existe mais.' };
          if (want === 'abrir' && G.Interiors.doorState(b, d.id).state === 'trancada') { const u = G.Interiors.useDoor(b, d.id, 'destrancar', w, within(w, b)); if (!u.ok) return u; }
          return G.Interiors.useDoor(b, d.id, want, w);
        },
        then: () => { G.Audio && G.Audio.at && G.Audio.at(b.x + b.w / 2, b.y + b.h / 2, want === 'abrir' ? 'door' : 'doorShut'); if (bar && bar.msg && t.dentro) say(bar.msg, 4.2); }, fail: deny });
      return { ok: true };
    },
    // (20e: F — one's own door locked or unlocked with one's key; someone else's shut door knocked at before going in)
    verbs(ctx, t) {
      const st = (G.Interiors.doorState(t.b, t.d.id) || {}).state; if (!st || st === 'bloqueada' || st === 'arrombada') return [];
      if (own(ctx.v, t.b)) return [{ id: 'chave', k: 'outra', label: st === 'trancada' ? 'Destrancar a porta' : 'Trancar a porta', run: (c2, t2) => keyDoor(c2, t2, st === 'trancada' ? 'destrancar' : 'trancar') }];
      // (the door of one's own people's store: its things, by the screen of what is kept; one knocks only at a home's)
      const fid = G.Fac.idOfV(ctx.v); if (t.b.built && isStore(t.b) && G.Village.facOfSet(t.b.set) === fid) return [{ id: 'armazem', k: 'outra', label: `Abrir o ${t.b.type === 'celeiro' ? 'celeiro' : 'armazém'}`, run: () => ({ ok: true, panel: { kind: 'guardados', ref: 'f:' + fid, b: t.b.id } }) }];
      return st === 'fechada' && !t.dentro && (G.BDEF[t.b.type] || {}).housing ? [{ id: 'bater', k: 'outra', label: 'Bater à porta', run: knock }] : []; // (one knocks from the street, never from inside)
    },
  });
  // (one's key in one's own door, in the world's step — Interiors.useDoor: only who lives or works there has it; an open door
  // locked is shut first, by the same hand)
  function keyDoor(ctx, t, act) {
    const b = t.b, d = t.d; const { to, go } = walkUp(ctx, ctx.v, t.X, t.Z, 0.7); const goW = go * G.Space.TIME;
    G.Avatar.act({ world: true, anim: 'interact', dur: 0.6 + goW, contact: 0.35 + goW, face: face(ctx, t.X, t.Z), to, toT: go,
      op: w => { if (!G.S.buildings.has(b.id)) return { ok: false, why: 'Não existe mais.' }; const u = G.Interiors.useDoor(b, d.id, act, w, within(w, b)); if (u.ok) G.Possess.deed('porta'); return u.ok ? { ok: true, act } : { ok: false, why: G.cap(u.why || 'Não dá.') + '.' }; },
      then: r => { G.Audio && G.Audio.at && G.Audio.at(b.x + b.w / 2, b.y + b.h / 2, 'doorShut'); say(r.act === 'trancar' ? 'Você tranca a porta.' : 'Você destranca a porta.'); }, fail: deny });
    return { ok: true };
  }
  // a knock at a door of someone else's (20e, D-399): the hand knocks — a step up to the door first —, and at the knock the world
  // answers in its step (I.knocked): whoever of the house is in and awake turns to the door and says so; a shut door is opened to
  // whom they know — the knock's door, by their own hand (Interiors.useDoor) —, a locked one stays locked
  function knock(ctx, t) {
    const b = t.b, d = t.d; const f = face(ctx, t.X, t.Z);
    return stepUp(ctx, ctx.v, t.X, t.Z, 0.7, () => {
      G.Avatar.act({ anim: 'bater', dur: 1.15, contact: 0.55, face: f, at: [0.42, () => G.Audio && G.Audio.play && G.Audio.play('knock')],
        op: w => I.knocked(w, b, d), then: r => say(r.msg, 3.4), fail: deny });
      return { ok: true };
    });
  }
  I.knocked = function (w, b, d) {
    if (!G.S.buildings.has(b.id)) return { ok: false, why: 'Não existe mais.' };
    const st = G.Interiors.doorState(b, d.id); if (!st || st.state === 'bloqueada') return { ok: false, why: 'A porta está bloqueada.' };
    G.Possess.deed('porta');
    const inside = [...G.S.villagers.values()].filter(o => o.id !== w.id && o.inside === b.id && (o.home === b.id || o.job === b.id) && o.age >= 6).sort((x, y) => x.id - y.id);
    const up = inside.filter(o => !o.sleeping && !(o.fear > 60));
    if (!inside.length) return { ok: true, msg: 'Você bate à porta. Ninguém abre.', none: 1 };
    if (!up.length) return { ok: true, msg: 'Você bate à porta. Ninguém responde: devem estar dormindo.', asleep: 1 };
    const o = up[0]; const knows = !!G.Possess.kin(o, w) || G.Possess.knows.person(o, w) > 0;
    const X = b.x + b.w / 2, Y = b.y + b.h / 2; G.faceTo(o, X - o.x, Y - o.y);
    if (st.state === 'trancada' || !knows) {
      const line = st.state === 'trancada' ? (knows ? `Agora não, ${w.name}.` : 'Quem é? A casa está fechada.') : 'Quem é?';
      G.Talk && G.Talk.say(o, line, { dur: 3 });
      if (st.state !== 'trancada') { const u = G.Interiors.useDoor(b, d.id, 'abrir', o); if (u.ok) return { ok: true, msg: `Você bate à porta. ${Who(w, o)} abre: «${line}»`, opened: 1, by: o.id }; }
      return { ok: true, msg: `Você bate à porta. De dentro, ${who(w, o)}: «${line}»`, by: o.id };
    }
    const u = G.Interiors.useDoor(b, d.id, 'abrir', o); const line = `Entre, ${w.name}!`; G.Talk && G.Talk.say(o, line, { dur: 3 }); G.Vg.emote(o, 'happy', 1.4);
    return { ok: true, msg: u.ok ? `Você bate à porta. ${Who(w, o)} abre: «${line}»` : `Você bate à porta. ${Who(w, o)}: «${line}»`, opened: u.ok ? 1 : 0, by: o.id };
  };
  // the stairs of the plan: up from the foot of a flight, down from its landing (the hatch opened over it, by hand) — moving in
  // the house, the body's own place: nothing of the world to ask
  I.add({
    id: 'escada', prio: 4.4, reach: 1.7,
    find(ctx) {
      const ind = G.Avatar.indoors(); if (!ind) return []; const out = [];
      const at = (s, t) => { const r = s.r, dx = s.dir[0], dz = s.dir[1]; const len = dx ? r[2] - r[0] : r[3] - r[1]; const m = dx ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2; const u = dx ? (dx > 0 ? r[0] : r[2]) + dx * len * t : m, w = dz ? (dz > 0 ? r[1] : r[3]) + dz * len * t : m; return [ind.b.x * L() + u, ind.b.y * L() + w]; };
      for (const s of G.Avatar.ups()) { const p = at(s, 0.1); out.push({ s, up: true, X: p[0], Z: p[1] }); }
      for (const s of G.Avatar.downs()) { const p = at(s, 0.9); out.push({ s, up: false, X: p[0], Z: p[1] }); }
      return out;
    },
    // (by the flight's class, D-086)
    label(ctx, t) { const c = t.s.cls || (t.s.kind === 'escada-de-mao' ? 'mao' : 'escada'); const w = c === 'mao' ? 'pela escada de mão' : c === 'ingreme' ? 'a escada íngreme' : c === 'degraus' ? 'os degraus' : 'a escada'; return (t.up ? 'Subir ' : 'Descer ') + w; },
    can() { return { ok: true }; },
    run(ctx, t) { return (t.up ? G.Avatar.up(t.s.id) : G.Avatar.down(t.s.id)) ? { ok: true } : { ok: false, msg: 'Daqui não dá.' }; },
  });
  // the body's own bed in the house it is in: to sleep in it, as the house's people sleep (the world's sleep, in its step)
  I.add({
    id: 'cama', prio: 4.8, reach: 1.9,
    find(ctx) {
      const ind = G.Avatar.indoors(); if (!ind || !G.Interiors.bedOf) return [];
      const bd = G.Interiors.bedOf(ctx.v); if (!bd || bd.b !== ind.b || bd.item.lv !== ind.lv) return [];
      return [{ b: bd.b, it: bd.item, sp: bd.spot, X: bd.b.x * L() + bd.item.x, Z: bd.b.y * L() + bd.item.z }];
    },
    label(ctx, t) { return `Deitar ${t.it.kind === 'esteira' || t.it.kind === 'esteira-casal' ? 'na esteira' : 'na cama'} e dormir`; },
    can(ctx) { return ctx.v.energy >= 85 ? { ok: false, why: 'Você não está com sono.' } : { ok: true }; },
    run(ctx, t) {
      const b = t.b, P = G.Possess; const f = face(ctx, t.X, t.Z);
      G.Avatar.act({ anim: 'interact', dur: 0.7, face: f, contact: 0.5,
        op: w => { if (!G.S.buildings.has(b.id) || w.home !== b.id || w.inside !== b.id || !P.sleep(w)) return { ok: false, why: 'Agora não dá para dormir.' }; P.deed('sono'); return { ok: true }; },
        fail: deny }); // (asleep, the body is laid in its bed by its controller: the world has it sleeping)
      return { ok: true };
    },
  });
  // a place of a building's plan where the body can be — on a bench, at the table, by the fire, on a row of seats, on the stone
  // one speaks from, where one stops to listen or to talk, at the reading table —: the usable and free ones in reach
  // (Interiors.freeNear: the share-out's own test, the body left out — never a place someone holds), one a piece, its nearest
  // place; a step or two to where one gets onto it, by the feet's own rules (blocked on the way, it is not taken: «chegue mais
  // perto»), turned as the place is, held until the player walks (Avatar.seatAt). The world marks it in its step (Possess.use —
  // S.avatar.use, the place the share-out gives the body; on an open ground, the body is in it while it holds it). What a use
  // does in the world is its owner's: I.useRule(use, { label(ctx, pl), can(ctx, pl) → { ok, why }, op(w, b, pl) → { ok, why,
  // msg } }) — done in the world's step at the take —; a use with no rule is taken only where being there is all there is to
  // it (PURE). The body's own bed is the verb 'cama' (the world's sleep); while it holds a place, the hands work there seated —
  // the world's offers, the eating at the table (Avatar.act)
  const USE_RULES = new Map();
  I.useRule = function (use, r) { if (r && typeof r === 'object') USE_RULES.set(use, r); else USE_RULES.delete(use); };
  I.useRuleOf = use => USE_RULES.get(use) || null; // (for the proofs: the rule of a use, read)
  I.PURE = new Set(['sentar', 'comer', 'aquecer', 'assistir', 'falar', 'ouvir', 'conversar', 'ler']);
  const pieceNm = pl => ((G.Interiors.ITEMS[pl.it.kind] || {}).name || 'lugar').toLowerCase();
  const em = pl => { const n = pieceNm(pl); return (G.gen(n) === 'a' ? 'na ' : 'no ') + n; };
  const PLACE_TXT = { sentar: pl => `Sentar ${em(pl)}`, comer: () => 'Sentar à mesa', aquecer: pl => `Sentar junto ${G.gen(pieceNm(pl)) === 'a' ? 'à' : 'ao'} ${pieceNm(pl)}`, assistir: () => 'Sentar para assistir', falar: pl => `Subir ${em(pl)}`, ouvir: () => 'Parar para ouvir', conversar: () => 'Parar para conversar', ler: () => 'Sentar para ler' };
  I.add({
    id: 'lugar', prio: 4.1, reach: 2.2,
    find(ctx) {
      const ind = G.Avatar.indoors(); if (!ind || !G.Interiors.freeNear || G.Avatar.seatNow()) return [];
      const B = ind.b, L0 = L(); const out = []; const seen = new Set();
      for (const pl of G.Interiors.freeNear(B, ind.lv, ctx.X - B.x * L0, ctx.Z - B.y * L0, 2.4)) {
        if (seen.has(pl.item) || !(USE_RULES.has(pl.use) || I.PURE.has(pl.use))) continue; seen.add(pl.item);
        { const r = USE_RULES.get(pl.use); if (r && r.show && !r.show(ctx, B, pl)) continue; } // (20e: a use offered only where it is the body's: a bed of its house)
        out.push({ b: B, pl, X: B.x * L0 + pl.x, Z: B.y * L0 + pl.z, pref: -0.3 });
      }
      return out;
    },
    label(ctx, t) { const r = USE_RULES.get(t.pl.use); return (r && r.label && r.label(ctx, t.pl)) || (PLACE_TXT[t.pl.use] || (() => 'Ficar aqui'))(t.pl); },
    can(ctx, t) { const r = USE_RULES.get(t.pl.use); return (r && r.can && r.can(ctx, t.pl)) || { ok: true }; },
    run(ctx, t) {
      const v = ctx.v, B = t.b, pl = t.pl, L0 = L(); const rule = USE_RULES.get(pl.use);
      // (where one gets onto it from here: a point the body's whole rim stands on, the nearest — Interiors.standFor)
      pl.at = G.Interiors.standFor(B, pl, ctx.X - B.x * L0, ctx.Z - B.y * L0);
      const at = [B.x * L0 + pl.at[0], B.y * L0 + pl.at[1]]; const d = Math.hypot(at[0] - ctx.X, at[1] - ctx.Z);
      const go = d > 0.08 ? G.clamp(d / (G.Possess.caps(v).walk * 1.1), 0.25, 1.6) : 0; const key = G.Interiors.keyOf(B);
      G.Avatar.act({ anim: 'interact', dur: go + 0.3, contact: go + 0.2, face: face(ctx, t.X, t.Z), to: go ? at : null, toT: go,
        // (taken where the feet got to — before the place, a stride at most: the world moved them, or the way was blocked —, if it
        // is still free and still the plan's; the rule's can asked again with the world's body)
        op: w => {
          const b = G.S.buildings.get(B.id); if (!b || G.Interiors.keyOf(b) !== key) return { ok: false, why: 'Esse lugar não existe mais.' };
          if (Math.hypot(w.x * L0 - at[0], w.y * L0 - at[1]) > 0.6) return { ok: false, why: 'Chegue mais perto.' };
          const p = G.Interiors.freeFor(b, pl.item, pl.q, pl.at[0], pl.at[1]); if (!p) return { ok: false, why: 'Alguém já está nesse lugar.' };
          if (rule && rule.can) { const c = rule.can({ v: w }, p); if (c && !c.ok) return c; }
          if (!G.Possess.use(w, b, p)) return { ok: false, why: 'Daqui não dá.' };
          const r = rule && rule.op ? rule.op(w, b, p) : null; if (r && !r.ok) { G.Possess.unuse(w); return r; }
          return { ok: true, pl: p, msg: (r && r.msg) || '' };
        },
        // (20e: seated in the use's own pose where the rule has one — the hands to the fire, the scroll held — only drawn: the
        // world's place is the plan's; and then what the hands do there, the rule's act)
        then: r => { G.Avatar.seatAt(B, Object.assign({}, r.pl, { at: pl.at }, rule && rule.st ? { st: rule.st } : {})); say(r.msg); if (rule && rule.act) rule.act(ctx, B, r.pl); }, fail: deny });
      return { ok: true };
    },
  });
  // ------------------------------ the uses of the furniture (20e, D-403) ------------------------------
  // Sitting, lying down, eating at the table, warming oneself at the fire, reading, praying: each use of a place with its words,
  // where it is offered (show), what may stop it (can), what the world does at the take (op, in its step), the pose the body is
  // drawn in there (st: a clip of interacao-clips.js, only seen — the world's place keeps the plan's state) and what the hands do
  // once there (act). Sitting and eating keep the plain place (PURE): the meal at the table is the house's own offer once seated
  // (L-625). The body rests at every one of them by the place its hands hold (Vg.resting: D-243)
  const inTemple = b => !!b && (b.type === 'temple' || /templo|santuario/.test(b.type));
  I.useRule('aquecer', { label: () => 'Aquecer-se junto ao fogo', st: 'aquecer',
    op: w => { const c = G.Atmos && G.Atmos.cold ? G.Atmos.cold(w.x, w.y) : 0; return { ok: true, msg: c > 0.25 ? 'O calor do fogo espanta o frio dos ossos.' : 'Você se senta junto ao fogo e estende as mãos.' }; } });
  I.useRule('ler', { label: (ctx, pl) => (pl && pl.b && /biblioteca/.test(pl.b.type) ? 'Sentar para ler um rolo' : 'Sentar para ler'), st: 'ler',
    op: (w, b) => ({ ok: true, msg: /biblioteca/.test(b.type) ? 'Você desenrola um rolo e lê.' : 'Você se senta para ler.' }) });
  // (a bed of one's own house that is not one's own: lain on a while, to rest — one's own bed is the sleep's, 'cama'; another
  // family's, never)
  I.useRule('deitar', { label: () => 'Deitar e descansar', st: 'sleep',
    show: (ctx, B, pl) => { const bd = G.Interiors.bedOf ? G.Interiors.bedOf(ctx.v) : null; return B.id === ctx.v.home && !(bd && bd.b === B && bd.item === pl.it); },
    can: (ctx, pl) => (pl && pl.b && pl.b.id !== ctx.v.home ? { ok: false, why: 'Essa cama é de outra família.' } : { ok: true }),
    op: (w, b) => (b.id !== w.home ? { ok: false, why: 'Essa cama é de outra família.' } : { ok: true, msg: 'Você se deita um pouco.' }) });
  // (kneeling at a temple's place: the prayer of the faithful there — the five seconds of the world anyone prays them in, and
  // what they give the god, as the prayer before the temple's door —; getting up leaves it unsaid)
  I.useRule('rezar', { label: () => 'Ajoelhar e rezar', st: 'pray',
    act: (ctx, B) => {
      if (!inTemple(B)) return;
      G.Avatar.act({ world: true, anim: 'pray', dur: (I.WT && I.WT.pray) || 5, free: true, vact: 'pray',
        op: w => {
          if (!G.S.buildings.has(B.id) || !B.built) return { ok: false, why: 'O templo não está mais aqui.' };
          const gain = 0.8 * (0.5 + (w.devotion || 0) / 60); G.S.faith = Math.min(999, G.S.faith + gain); w.devotion = Math.min(100, (w.devotion || 0) + 1.2);
          G.FX && G.FX.faithText && G.FX.faithText(w.x, w.y, gain); G.Vg.emote(w, 'pray', 2); G.Possess.deed('reza'); return { ok: true };
        }, then: () => say('Você termina a sua reza.'), fail: deny });
    } });
  // ============================== the things kept and the things lying about (20e) ==============================
  // (a thing in words: «o machado de ferro», «a faca de bronze», «20 flechas», «3 de madeira»)
  const thingTxt = (k, n) => { const It = G.Itens; const d = It.def(k); if (!d) return String(k); const nm = It.nome(k, n);
    if (!d.coisa) return `${Math.round((n || 1) * 100) / 100} de ${nm}`; return (n || 1) > 1.5 ? `${Math.round(n)} ${nm}` : `${G.gen(nm) === 'a' ? 'a' : 'o'} ${nm}`; };
  I.thingTxt = thingTxt;
  // a thing's card: what the catalog says of it — what it is, its weight, what it is good for, what it is made of (only read)
  function thingCard(k, n) {
    const It = G.Itens; const d = It.def(k); if (!d) return { kind: 'thing', name: String(k), sub: '', rows: [] };
    const rows = [['Peso', `${String(Math.round(d.peso * (n > 1 ? n : 1) * 100) / 100).replace('.', ',')} kg`]];
    const u = It.usos ? It.usos(k) : []; if (u.length && d.coisa) rows.push(['Serve para', u.join(', ')]);
    const fb = It.feitoDe ? It.feitoDe(k) : null; if (d.coisa && fb && fb.length) rows.push(['Feito de', fb.map(x => `${Math.round(x.n * 100) / 100} de ${G.Eco.name(x.k)}`).join(' e ')]);
    return { kind: 'thing', name: G.cap(It.nome(k, n)), sub: d.coisa ? (It.TIPO_NOME[d.tipo] || d.tipo) : 'bem', desc: d.desc || '', rows };
  }
  I.thingCard = thingCard;
  // what lies on the ground in reach — a thing someone let fall or set down, the things of one who died away from home
  // (G.Inv.near: never a crate of a work, which is the work's offer) —: picked up into the bag (G.Inv.pick, its room and its
  // reach, the ledger's «apanhou»), in the hands' own stoop; E held picks it and takes it in its hand; F looks at it. Where the 3D
  // draws it, the hands go (People3D.lying: the same thing, by its name)
  I.add({
    id: 'chao', prio: 2.9, reach: 2.2, // (just under the things of work — the tree, the rock, the bush: where both are in reach, the one faced and nearer is meant; a dead neighbour's hoe at the foot of the tree never took the stroke from it)
    find(ctx) {
      if (!G.Inv || !G.Inv.near) return [];
      const out = []; const S = G.S; const P3 = G.People3D; const lying = P3 && P3.lying ? P3.lying : [];
      for (const q of G.Inv.near(ctx.v, 2.8 / L())) {
        const o = (S.loose || []).find(x => x.id === q.g); if (!o) continue; const e = lying.find(x => x[4] === o.id && x[5] === 0);
        const X = e ? e[0] : o.x * L(), Z = e ? e[2] : o.y * L(); const a = aim(ctx, X, Z);
        // (what lies on the ground is meant when it is before the body — never one beside or behind it; one under the very feet,
        // whose bearing means nothing, only when nothing before the body is: L-1242)
        if (a.d > 0.35 && a.ang > 1.2) continue;
        out.push({ g: o.id, k: o.k, n: o.n, X, Z, Y: e ? e[1] : undefined, pref: a.d <= 0.35 ? -1.2 : 0 });
      }
      return out;
    },
    label(ctx, t) { return `Pegar ${thingTxt(t.k, t.n)}`; },
    can(ctx, t) { return canPick(ctx.v, t); },
    run(ctx, t) { return pickUp(ctx, t, false); },
    verbs(ctx, t) {
      const out = [{ id: 'exame', k: 'outra', label: `Examinar ${thingTxt(t.k, t.n)}`, run: () => { deed('exame'); return { ok: true, card: thingCard(t.k, t.n) }; } }];
      if (G.Itens.isThing(t.k) && G.Itens.mao(t.k)) out.push({ id: 'segurar', k: 'segurar', label: `Pegar e segurar ${thingTxt(t.k, 1)}`, can: (c2, t2) => canPick(c2.v, t2), run: (c2, t2) => pickUp(c2, t2, true) });
      return out;
    },
  });
  // (may the hands take it: still there — another may have taken it first —, hands for it, a thing a bag holds, and room)
  function canPick(v, t) {
    const o = (G.S.loose || []).find(x => x.id === t.g); if (!o || !(o.n > 0)) return { ok: false, why: 'Alguém pegou primeiro.' };
    if (v.age < 2 || (v.lost && v.lost.armL && v.lost.armR)) return { ok: false, why: 'Você não tem mãos para isso.' }; // (the work's own hands() goes with the work: 20g)
    if (!G.Itens.def(o.k) || o.k === 'water' || o.k === 'moedas') return { ok: false, why: 'Isso não vai na mochila.' };
    const room = G.Inv.room(v, o.k); return room >= (G.Itens.isThing(o.k) ? 1 : 1e-4) ? { ok: true } : { ok: false, why: 'A mochila está cheia.' };
  }
  // (the stoop: a step up to it, the hand down to where it lies, the world taking it in its step; and, held, into the hand)
  function pickUp(ctx, t, hold) {
    const v = ctx.v; const g = t.g; const f = face(ctx, t.X, t.Z);
    const Y = Number.isFinite(t.Y) ? t.Y : gY(t.X, t.Z) + 0.1;
    return stepUp(ctx, v, t.X, t.Z, 0.55, () => { G.Avatar.act({ anim: 'apanhar', dur: 1.0, contact: 0.5, face: f, reach: reachTo([t.X, Y, t.Z], 0.4, 0.4),
      op: w => {
        const r = G.Inv.pick(w, g); if (!r.ok) return r.why === 'Não está mais aí.' ? { ok: false, why: 'Alguém pegou primeiro.' } : r;
        G.Possess.deed('apanhou', 1);
        if (hold && G.Itens.isThing(r.k) && G.Itens.mao(r.k)) { const e = G.Inv.equip(w, r.k); r.held = !!e.ok; }
        return r;
      },
      then: r => say(`Você pega ${thingTxt(r.k, r.n)}${r.held ? ' e segura na mão' : ''}.`), fail: deny });
    return { ok: true }; });
  }
  // the furniture that keeps a house's, a building's, a stall's or the people's things (G.Depot.stores: the chest, the jars, the
  // shelves, the counter of a stall, the bins of the store), indoors where the body is: opened — the screen of what is kept, the
  // bag on one side and that holder on the other (guardados-ui.js) —, by who may take from it or put in it (G.Depot.may)
  const ABRE = new Set(['arca', 'jarros', 'cesto', 'cesto-pendurado', 'pipas', 'tulha', 'cuba', 'tanque-barro', 'baia', 'armeiro']);
  const theNm = n => { const w = String(n).toLowerCase(); const f = w.split(' ')[0]; return (/s$/.test(f) ? (/as$/.test(f) ? 'as ' : 'os ') : G.gen(f) === 'a' ? 'a ' : 'o ') + w; };
  // (the holder a piece keeps the things of: the house's own, a building's shelf or a stall's sales furniture, the people's store)
  I.holderOf = function (B, it) {
    const D = G.Depot; if (!B || !it || !it.store || !D) return null; const dep = it.store.dep;
    if (dep === 'casa') return D.exists('h:' + B.id) ? 'h:' + B.id : null;
    if (dep === 'povo') { const fid = G.Village.facOfSet(B.set); return fid && D.exists('f:' + fid) ? 'f:' + fid : null; }
    const st = ((D.stores && D.stores(B)) || []).find(m => m.id === it.id);
    if (st && st.sale !== null && st.sale !== undefined) { const z = (G.S.biz || []).find(q => q.b === B.id && q.slot === st.sale && q.st !== 'fim'); return z && D.exists('z:' + z.id) ? 'z:' + z.id : null; }
    return D.exists('b:' + B.id) ? 'b:' + B.id : null;
  };
  I.add({
    id: 'guardados', prio: 3, reach: 1.9,
    find(ctx) {
      const ind = G.Avatar.indoors(); if (!ind || !ind.p || !ind.p.items) return [];
      const B = ind.b, L0 = L(); const out = [];
      for (const it of ind.p.items) {
        if (!it.store || it.lv !== ind.lv) continue; const X = B.x * L0 + it.x, Z = B.y * L0 + it.z; if (Math.hypot(X - ctx.X, Z - ctx.Z) > 2.6) continue;
        const ref = I.holderOf(B, it); if (ref) out.push({ b: B, it, ref, X, Z, pref: -0.3 });
      }
      return out;
    },
    label(ctx, t) { const n = (G.Interiors.ITEMS[t.it.kind] || {}).name || 'guardados'; return `${ABRE.has(t.it.kind) ? 'Abrir' : 'Ver'} ${theNm(n)}`; },
    can(ctx, t) {
      if (!G.S.buildings.has(t.b.id) || !G.Depot.exists(t.ref)) return { ok: false, why: 'Não existe mais.' };
      const a = G.Depot.may(ctx.v, t.ref, 'take'), b = G.Depot.may(ctx.v, t.ref, 'put');
      return a.ok || b.ok ? { ok: true } : { ok: false, why: a.why || b.why || 'Não é seu.' };
    },
    run(ctx, t) {
      G.Avatar.act({ anim: ABRE.has(t.it.kind) ? 'abrir' : 'interact', dur: 0.8, face: face(ctx, t.X, t.Z) });
      return { ok: true, panel: { kind: 'guardados', ref: t.ref, b: t.b.id, it: t.it.id } };
    },
  });
  // the hands' doors between the bag and a holder, for the screen of what is kept (guardados-ui.js asks them by the body's hands,
  // G.Possess.apply: done in the world's step): taking — from the people's store a thing is made of its goods (G.Inv.make, what the
  // store has: 20h), from anywhere else as it is (G.Inv.take, by G.Depot.may) — and keeping — into the people's store a thing
  // goes back as its goods (G.Inv.unmake), elsewhere as it is (G.Inv.put; a house keeps on its floor what its furniture cannot,
  // D-059). → the inventory's answer
  I.fetch = function (w, ref, key, n) {
    if (!w || !G.Inv || typeof ref !== 'string') return { ok: false, why: 'Agora não dá.' };
    const k = G.Itens.canon(key); if (!k) return { ok: false, why: 'Isso não se leva.' };
    const d = G.Itens.def(k); const r = ref[0] === 'f' && d && d.coisa ? G.Inv.make(w, d.kind, d.mat, n) : G.Inv.take(w, ref, k, n);
    if (r.ok) G.Possess.deed('guardou', 1); return Object.assign({ k: r.k || k }, r);
  };
  I.stash = function (w, ref, key, n) {
    if (!w || !G.Inv || typeof ref !== 'string') return { ok: false, why: 'Agora não dá.' };
    const k = G.Itens.canon(key); if (!k) return { ok: false, why: 'Isso não se guarda.' };
    const r = ref[0] === 'f' && G.Itens.isThing(k) ? G.Inv.unmake(w, k, n) : G.Inv.put(w, ref, k, n);
    if (r.ok) G.Possess.deed('guardou', 1); return Object.assign({ k }, r);
  };
  // ============================== buildings: doors, the store, the temple ==============================
  // (the people's stores are where the world's people bring their loads and eat: every drop-off — storehouse, barn, dock,
  // harbour store, the first camp's fire — one rule for them and for the body)
  const isStore = b => !!(G.BDEF[b.type] && G.BDEF[b.type].dropoff);
  const AT = { campfire: 'junto à fogueira', doca: 'na doca', celeiro: 'no celeiro' };
  const at = b => AT[b.type] || 'no armazém';
  I.add({
    id: 'porta', prio: 4, reach: 2.6, door: true,
    find(ctx) {
      const out = []; const S = G.S;
      // (the store a crate of an unloading goes to takes it by the unloading's own act — the docker's gesture, the docker's pay —:
      // its door is that act's, not this one's)
      const wl = workLoad(ctx.v.carry); const dest = wl ? G.Possess.storeOf(wl) : null;
      for (const b of S.buildings.values()) {
        if (b.x > ctx.x + 6 || b.x + b.w < ctx.x - 6 || b.y > ctx.y + 6 || b.y + b.h < ctx.y - 6) continue;
        if (b.type === 'ruin' || b.type === 'farm' || b.type === 'horta' || b.type === 'plantacao' || b.type === 'vinhedo' || b === dest) continue;
        // (a home with a plan is its plan's: its door opened and knocked by portaPlanta, its bed inside; any other building keeps
        // what is done before it — a load set down at the store, a meal, a prayer, a look —, a step back from its door, where its
        // plan's door is opened; a load set down at the store means more than opening it)
        const def = G.BDEF[b.type]; if (def && def.housing && G.Space.plan && G.Space.plan(b)) continue;
        const d = G.Vg.door(b); const t = { b, X: d[0] * L(), Z: d[1] * L() };
        if (b.built && isStore(b) && ctx.v.carry && ctx.v.carry.n > 0 && G.Space.planMade && G.Space.planMade(b)) t.pref = 1.6;
        out.push(t);
      }
      return out;
    },
    label(ctx, t) {
      const b = t.b; const v = ctx.v; const nm = G.Village.buildName(b).toLowerCase();
      if (!b.built) return `Examinar a obra: ${nm}`;
      if (b.id === v.home) return v.energy < 85 ? 'Entrar em casa e dormir' : 'Entrar em casa';
      if (isStore(b)) return v.carry && v.carry.n > 0 ? `Guardar ${G.Eco ? G.Eco.name(v.carry.k) : v.carry.k} ${at(b)}` : v.hunger > 25 ? `Comer ${at(b)}` : `Examinar ${nm}`;
      if (b.type === 'temple') return 'Rezar no templo';
      if (b.type === 'cemetery') return 'Ler as lápides';
      const def = G.BDEF[b.type]; if (def && def.housing) return `Bater à porta d${G.gen(nm) === 'a' ? 'a' : 'o'} ${nm}`;
      return `Examinar ${nm}`;
    },
    can(ctx, t) {
      const b = t.b; const S = G.S; const v = ctx.v;
      if (!S.buildings.has(b.id)) return { ok: false, why: 'Não existe mais.' };
      if (b.built && isStore(b)) {
        const fid = G.Fac.idOfV(v); if (G.Village.facOfSet(b.set) !== fid) return { ok: false, why: 'Isto é de outro povo: o estoque daqui não é do seu.' };
        if (v.carry && v.carry.n > 0) { const wl = workLoad(v.carry); if (wl) return { ok: false, why: whyWork(wl) }; const bd = boundOf(v.carry); if (bd && bd !== 'f:' + fid) return { ok: false, why: whyBound(bd) }; }
        else if (v.hunger > 25 && (G.Fac.stockV(v).food || 0) < 1) return { ok: false, why: 'O estoque do seu povo está sem comida.' };
      }
      return { ok: true };
    },
    run(ctx, t) {
      const b = t.b; const v = ctx.v; const P = G.Possess;
      const f = face(ctx, t.X, t.Z);
      if (!b.built) { deed('exame'); return { ok: true, card: buildingCard(b, v) }; }
      if (b.id === v.home && v.energy < 85) {
        // (to bed at home: the body goes in through its own door, and the world's sleep gives the strength back — laid down by
        // the world in its step)
        G.Avatar.act({ anim: 'interact', dur: 0.8, face: f, contact: 0.6,
          op: w => { if (!G.S.buildings.has(b.id) || w.home !== b.id || !P.sleep(w)) return { ok: false, why: 'Agora não dá para dormir.' }; w.inside = b.id; P.deed('sono'); return { ok: true }; },
          then: () => say('Você entra em casa e se deita.'), fail: deny });
        return { ok: true, sleep: true };
      }
      if (isStore(b)) {
        const stk = G.Fac.stockV(v);
        if (v.carry && v.carry.n > 0) {
          // (the load set down at the door — a step up to it first —, and into the people's stock as anyone's: the world's delivery,
          // in the docker's gesture of setting down)
          const D = G.Vg.door(b); const DX = D[0] * L(), DZ = D[1] * L(); const { to, go } = walkUp(ctx, v, DX, DZ, 0.9); const g = AN('pousar'), goW = go * G.Space.TIME;
          const hands = reachTo(putAt(v, DX, DZ), 0.34, 0.4);
          G.Avatar.act({ world: true, anim: 'carry', dur: g.dur + goW, contact: g.contact + goW, face: f, to, toT: go, vact: g.act, reach: a => (a.tr < go ? null : hands(a)),
            op: w => deliver(w, b), then: r => say(`Você guarda ${r.n} de ${G.Eco ? G.Eco.name(r.k) : r.k} ${at(b)}.`), fail: deny });
          return { ok: true };
        }
        if (v.hunger > 25 && stk.food >= 1) {
          // (a meal at the store: the time anyone of the world eats there, and the same share of the stock; getting up leaves it)
          G.Avatar.act({ world: true, anim: 'sit', dur: WT.eat, face: f, free: true, vact: 'eat',
            op: w => {
              const s2 = (G.Army && G.Army.larder(w)) || G.Fac.stockV(w); const got = Math.min(w.hunger > 80 ? 2 : 1, Math.floor(s2.food));
              if (got <= 0) return { ok: false, why: 'O estoque do seu povo está sem comida.' };
              s2.food -= got; w.hunger = Math.max(0, w.hunger - 58 * got); G.Vg.emote(w, 'food', 1.5); P.deed('refeicao'); return { ok: true };
            }, then: () => say(`Você come ${at(b)}, do estoque do seu povo.`), fail: deny });
          return { ok: true, msg: `Você se senta para comer ${at(b)}.` };
        }
        return { ok: true, card: buildingCard(b, v) };
      }
      if (b.type === 'temple') {
        // (a prayer: the faithful's five seconds of the world before the temple, and what they give the god — the faith, the
        // devotion; getting up leaves it unsaid)
        G.Avatar.act({ world: true, anim: 'pray', dur: WT.pray, face: f, free: true, vact: 'pray',
          op: w => {
            if (!G.S.buildings.has(b.id) || !b.built) return { ok: false, why: 'O templo não está mais aqui.' };
            const gain = 0.8 * (0.5 + (w.devotion || 0) / 60); G.S.faith = Math.min(999, G.S.faith + gain); w.devotion = Math.min(100, (w.devotion || 0) + 1.2);
            G.FX && G.FX.faithText && G.FX.faithText(w.x, w.y, gain); G.Vg.emote(w, 'pray', 2); P.deed('reza'); return { ok: true };
          }, then: () => say('Você termina a sua reza.'), fail: deny });
        return { ok: true, msg: 'Você se ajoelha e reza.' };
      }
      if (b.type === 'cemetery') { deed('exame'); return { ok: true, card: graveCard(b) }; }
      const def = G.BDEF[b.type]; if (def && def.housing && b.id !== v.home) { deed('porta'); G.Avatar.act({ anim: 'bater', dur: 1.15, face: f }); return { ok: true, card: buildingCard(b, v), knock: true }; }
      deed('exame');
      return { ok: true, card: buildingCard(b, v) };
    },
    // (20e: F — the people's store opened: the tools and the weapons it can make, what one gives back, what it keeps, by the screen
    // of what is kept (guardados-ui.js); one's own house without a plan, its things; anything else, a look at it)
    verbs(ctx, t) {
      const b = t.b, v = ctx.v; if (!b.built) return [];
      if (isStore(b) && G.Village.facOfSet(b.set) === G.Fac.idOfV(v)) return [{ id: 'armazem', k: 'outra', label: `Abrir ${b.type === 'campfire' ? 'as provisões do povo' : 'o ' + (b.type === 'celeiro' ? 'celeiro' : 'armazém')}`, run: () => ({ ok: true, panel: { kind: 'guardados', ref: 'f:' + G.Fac.idOfV(v), b: b.id } }) }];
      if (b.id === v.home && G.Depot && G.Depot.exists('h:' + b.id)) return [{ id: 'casa', k: 'outra', label: 'Ver os guardados da casa', run: () => ({ ok: true, panel: { kind: 'guardados', ref: 'h:' + b.id, b: b.id } }) }];
      if (b.type === 'temple') return [{ id: 'exame', k: 'outra', label: `Examinar ${G.Village.buildName(b).toLowerCase()}`, run: () => { deed('exame'); return { ok: true, card: buildingCard(b, v) }; } }];
      return [];
    },
  });
  // (where a load belongs, if anywhere — as activity.js resumeCarry reads it: an operation's crate goes to the operation's
  // destination, or back to its source; a purchase to where it was bought for; a load of nobody's is just a load. 'op': an
  // operation's, with no place of its own)
  function boundOf(c) {
    if (!c || !G.Act || !G.Depot) return null; const op = c.op ? G.Act.get(c.op) : null;
    if (op && G.Act.live(op)) return op.to && G.Depot.exists(op.to) ? op.to : op.from && G.Depot.exists(op.from) ? op.from : 'op';
    return c.to && G.Depot.exists(c.to) ? c.to : null;
  }
  const whyBound = bd => { if (bd === 'op') return 'Esta carga é de um trabalho em andamento: leve-a aonde ele pede.'; const pl = G.Act.placeOf(bd); return `Esta carga tem destino: ${pl ? G.Village.buildName(pl).toLowerCase() : 'outro lugar'}.`; };
  // (a load of a work under way that the work takes in by its own act — a crate of an unloading, set down in its store with the
  // docker's pay: activity.js's def acts.depositar —: the work's, never a plain store's)
  function workLoad(c) { if (!c || !(c.n > 0) || !c.op || !G.Act) return null; const op = G.Act.get(c.op); const def = op && G.Act.live(op) ? G.Act.DEFS[op.def] : null; return def && def.acts && def.acts.depositar ? op : null; }
  I.workLoad = workLoad;
  const whyWork = op => { const dest = op.def === 'descarga' ? G.Possess.storeOf(op) : null; const nm = G.Act.DEFS[op.def].name || 'Trabalho'; return `Esta carga é d${G.gen(nm) === 'a' ? 'a' : 'o'} ${nm.toLowerCase()}: ${dest ? 'leve-a ' + G.Possess.toB(dest) : 'leve-a aonde ela pede'}.`; };
  // a load brought to a store: the world's one door of a delivery for the body as for anyone (villagers.js Vg.deliver) — a load
  // that belongs somewhere only there, what does not fit left in the arms; a plain one into the people's store through the depot,
  // in the ledger, a year of plenty doubling the stone and the wood, what came along with the load in too. Done in the world's
  // step. (It counted a plain load in the store by its own hand — Village.addStock, the hands emptied by hand —: no line in the
  // ledger, and in the corpo-mundo the body's delivery was told from a neighbour's, in the same seconds, only by the stock)
  function deliver(w, b) {
    const r = G.Vg.deliver(w, b); if (r.ok) G.Possess.deed('entrega');
    return r;
  }
  // a building's card: what it is, whose it is, who lives or works there, what it holds — the world's own numbers, as much of
  // them as the one who reads it knows (Possess.knows, D-172): the town and its people by their names when they can name them;
  // who lives there by name when they know them, the others counted; who is at home now, and the family's coins, only of
  // their own house — walls are not seen through, and a pot of coins is the house's own —; the people's stock only of their
  // own people's store; who works there now, in sight, by name or by what is seen of them. With no reader (a reader who is no
  // one of the world): the god's, everything
  function buildingCard(b, me) {
    const S = G.S; const K = G.Possess.knows; const def = G.BDEF[b.type] || {}; const set = S.settlements.get(b.set); const fac = G.Fac.get(G.Village.facOfSet(b.set));
    if (!me || !me.id) me = null; const mine = K.house(me, b); const kt = !!set && !!K.town(me, set);
    const res = G.Village.bedsOf(b) > 0 ? [...S.villagers.values()].filter(o => o.home === b.id) : []; // (a house, or the seat: D-205)
    const card = { kind: 'building', id: b.id, name: G.Village.buildName(b), sub: kt ? [set.name, fac ? fac.name : null].filter(Boolean).join(' · ') : '', desc: G.BDESC ? G.BDESC[b.type] || '' : '', rows: [] };
    if (!b.built) { card.rows.push(['Obra', Math.round((b.progress || 0) * 100) + '%']); const miss = Object.keys(b.need || {}).filter(k => b.need[k] > 0).map(k => `${Math.ceil(b.need[k])} de ${G.Eco ? G.Eco.name(k) : k}`); if (miss.length) card.rows.push(['Faltam', miss.join(', ')]); }
    if (b.maxHp && b.hp < b.maxHp) card.rows.push(['Estrutura', Math.round(b.hp / b.maxHp * 100) + '%']);
    if (res.length) {
      const known = res.filter(o => K.person(me, o)), n = res.length - known.length;
      const names = known.map(o => o.name + (me && o.id === me.id ? ' (você)' : ''));
      card.rows.push(['Moram aqui', names.length ? names.join(', ') + (n ? ` e mais ${n} que você não conhece` : '') : n === 1 ? 'uma pessoa que você não conhece' : `${n} pessoas que você não conhece`]);
      if (mine) { const inside = res.filter(o => o.inside === b.id); card.rows.push(['Em casa agora', inside.length ? inside.map(o => o.name).join(', ') : 'ninguém']); }
    }
    // (the seat where who rules lives: said by name by who can name the ruler — the fame of one's own people, Possess.knows —,
    // else as what it is: where the one who rules lives is the town's talk, D-208)
    { const lord = G.Casa && G.Casa.lordOf ? G.Casa.lordOf(b) : null;
      if (lord && lord.home === b.id) card.rows.push(['Casa de quem governa', K.person(me, lord) ? lord.name + (me && lord.id === me.id ? ' (você)' : '') : kt ? `quem governa ${set.name}` : 'quem governa aqui']); }
    // (the household's coins — the house's, and the seat's, which keeps as a house (V.bedsOf, D-205) —, read as the depot reads
    // them: none put in yet is none. The palace of Ramsés in the metrópole of the generation 21 had never had a coin put in it,
    // and its own household saw no line of coins in its card, as no house shows: L-788)
    if (res.length && K.house(me, b) && (b.coin !== undefined || G.Village.bedsOf(b) > 0)) card.rows.push(['Moedas da família', Math.round(b.coin || 0)]);
    if (isStore(b) && b.built && K.stock(me, b)) { const f = G.Fac.get(G.Village.facOfSet(b.set)); if (f) card.rows.push(['No estoque do povo', ['food', 'wood', 'stone'].map(k => `${Math.floor(f.stock[k] || 0)} de ${G.Eco ? G.Eco.name(k) : k}`).join(', ')]); }
    const work = [...S.villagers.values()].filter(o => o.task && o.task.id === b.id && o.task.type !== 'avatar').slice(0, 6);
    if (work.length) card.rows.push(['Trabalhando aqui', work.map(o => K.name(me, o)).join(', ')]);
    return card;
  }
  I.buildingCard = buildingCard;
  function graveCard(b) {
    const g = (b.graves || []).slice(-12).reverse().map(id => { const p = G.person(typeof id === 'object' ? id.id : id); return p ? `${p.name} — ${G.Village.deathText(p)}` : null; }).filter(Boolean);
    return { kind: 'building', id: b.id, name: 'Cemitério', sub: 'As lápides', desc: g.length ? '' : 'Ainda não há ninguém enterrado aqui.', rows: g.map(t => ['†', t]) };
  }

  // (the work with the hands — a tree, a bush, a rock, the gold on the ground, the fish of the shallows — is the trades': the
  // providers live in trabalho.js, G.Trabalho, registered by I.add — D-461)

  // a building going up: what one carries goes into it, as the builders' loads do (Vg's build: need, then the stock)
  I.add({
    id: 'obra', prio: 4.5, reach: 3.4,
    find(ctx) {
      const v = ctx.v; if (!v.carry || !(v.carry.n > 0) || v.carry.k === 'food' || boundOf(v.carry)) return []; // (a load that belongs somewhere is not the builders')
      const out = []; for (const b of G.S.buildings.values()) { if (b.built || !b.need || !(b.need[v.carry.k] > 0)) continue; if (b.x > ctx.x + 5 || b.x + b.w < ctx.x - 5 || b.y > ctx.y + 5 || b.y + b.h < ctx.y - 5) continue; const cx = G.clamp(ctx.x, b.x, b.x + b.w), cy = G.clamp(ctx.y, b.y, b.y + b.h); out.push({ b, X: cx * L(), Z: cy * L() }); }
      return out;
    },
    label(ctx, t) { return `Levar ${G.Eco ? G.Eco.name(ctx.v.carry.k) : ctx.v.carry.k} para a obra: ${G.Village.buildName(t.b).toLowerCase()}`; },
    can(ctx, t) { const b = t.b; const v = ctx.v; if (!G.S.buildings.has(b.id) || b.built) return { ok: false, why: 'A obra já terminou.' }; if (G.Village.facOfSet(b.set) !== G.Fac.idOfV(v)) return { ok: false, why: 'Esta obra é de outro povo.' }; return v.carry && b.need[v.carry.k] > 0 ? { ok: true } : { ok: false, why: 'A obra não precisa disso.' }; },
    run(ctx, t) {
      const b = t.b; const v = ctx.v; const P = G.Possess; const f = face(ctx, t.X, t.Z);
      // (the load set down at the works, and into them as the builders' loads go — by the ledger, into the work's holder ('o:',
      // L-246): what the works need, the rest to the stock)
      const { to, go } = walkUp(ctx, v, t.X, t.Z, 0.8); const g = AN('pousar'), goW = go * G.Space.TIME; const hands = reachTo(putAt(v, t.X, t.Z), 0.34, 0.4);
      G.Avatar.act({ world: true, anim: 'carry', dur: g.dur + goW, contact: g.contact + goW, face: f, to, toT: go, vact: g.act, reach: a => (a.tr < go ? null : hands(a)),
        op: w => {
          if (!w.carry || !(w.carry.n > 0) || !G.S.buildings.has(b.id) || b.built) return { ok: false, why: 'A obra já terminou.' };
          const n = w.carry.n, k = w.carry.k; const used = Math.min(n, b.need[k] || 0); if (used <= 0) return { ok: false, why: 'A obra não precisa disso.' };
          const r = G.Depot.move('v:' + w.id, 'o:' + b.id, k, used, { code: 'obra', by: w.id }); if (!r.ok) return { ok: false, why: 'A obra não precisa disso.' };
          if (w.carry) G.Vg.toStore(w, G.Village.facOfSet(b.set), 'sobra-obra');
          G.FX && G.FX.chips(b.x + b.w / 2, b.y + b.h / 2, k === 'wood' ? '#a67c4e' : '#9a9a9a');
          P.deed('obra'); return { ok: true }; // (one load brought, whatever it held)
        }, then: () => say('Você entrega o material aos construtores.'), fail: deny });
      return { ok: true };
    },
    // (20e: F — the works looked at: what they still need)
    verbs(ctx, t) { return [{ id: 'exame', k: 'outra', label: 'Examinar a obra', run: () => { deed('exame'); return { ok: true, card: buildingCard(t.b, ctx.v) }; } }]; },
  });
  // what the world's activities offer the hands here (G.Act.offers — a crate on the quay, the stall, a hand to lend: C1's
  // operations): done through the door the world's people use (the same checks, the same transfer), at the contact of the same
  // gesture, in the same seconds of the world (Act.ANIM). Its words are the world's answer
  // (begun at the key — Act.begin, in the world's step: a crate of the quay is the hands' from then on, as a porter's is from
  // the moment he goes for it, by the same rule: a hand acting on it —; done at the contact — Act.commit —; let go if the
  // gesture is cut short — Act.abort. Refused at the key — another hand acting on it —, the gesture stops there, with the
  // world's words)
  const GEST = { lift: 'carry', arrange: 'carry', give: 'interact', pay: 'interact', haggle: 'talk', examine: 'interact', count: 'interact', call: 'wave', point: 'interact',
    // (the household's gestures at its places — at the table, on a seat, at the fire, with a child in the arms: Anim3D's states)
    eat: 'eat', sit: 'sit', cook: 'cook', rock: 'rock' };
  I.GEST = GEST; // (for the coverage matrix, qa/matriz.js: the body's pose of each act — only read)
  // (where an offer is, for the reach and for the hands: a crate of a quay where the 3D draws it — the pile reached from any of
  // its sides, by its crate nearest the body; the hands to the very crate the world offers —; a crate set down in its store at
  // the door the store's people go in by; a crate put on the ground at the feet — what one means least, when the store is in
  // reach. The world's offers are asked a stride wider than the arms: which of them is in reach is asked of where it is)
  function placed(ctx, o) {
    const t = { o, X: o.at[0] * L(), Z: o.at[1] * L() }; const P3 = G.People3D;
    if (o.cid && typeof o.ref === 'string' && o.ref.slice(0, 2) === 'q:' && P3 && P3.lyingOf) {
      let nb = null, nd = 1e9;
      for (const e of P3.lyingOf(+o.ref.slice(2))) { if (e[4] === o.cid) t.hand = [e[0], e[1], e[2]]; const d = (e[0] - ctx.X) ** 2 + (e[2] - ctx.Z) ** 2; if (d < nd) { nd = d; nb = e; } }
      if (nb) { t.X = nb[0]; t.Z = nb[2]; }
    } else if (o.act === 'depositar' && o.def === 'descarga') { const dest = G.Possess.storeOf(G.Act.get(o.op)); if (dest) { const d = G.Vg.door(dest); t.X = d[0] * L(); t.Z = d[1] * L(); } }
    else if (o.act === 'pousar') t.pref = -3;
    // (an offer where the body stands, with no place of its own: a stride straight before it, wherever it looks — as the fish in
    // the shallows —, and what the body faces in reach meant before it, I.best: L-467)
    else if (o.here) { t.here = 1; t.X = ctx.X + Math.cos(ctx.yaw) * 0.7; t.Z = ctx.Z + Math.sin(ctx.yaw) * 0.7; }
    // (the work in reach, possible now, is what one means at the pile or at the door, more than a word with someone beside it —
    // unless face to face with them, a step away)
    if (o.ok !== false && (o.act === 'pegar' || o.act === 'pegarChao' || o.act === 'depositar')) t.pref = 1.6;
    return t;
  }
  I.placed = placed; // (for the tests)
  // the words of an offer of the world, for the body: where they name the one the act is done with (the offer's own cust, to,
  // baby — the world writes its offers for anyone), a name the body cannot say gives way to what is seen of them
  // («de o ferreiro» is «do ferreiro»: the words joined as the language joins them)
  const JOIN = { 'de o': 'do', 'de a': 'da', 'em o': 'no', 'em a': 'na', 'por o': 'pelo', 'por a': 'pela', 'a o': 'ao', 'a a': 'à' };
  function veil(v, txt, ids) {
    if (!txt) return txt; let did = false;
    for (const id of ids) { const p = id ? G.S.villagers.get(id) : null; if (p && txt.includes(p.name) && !G.Possess.knows.person(v, p)) { const head = txt.startsWith(p.name); txt = txt.split(p.name).join(who(v, p)); if (head) txt = G.cap(txt); did = true; } }
    return did ? txt.replace(/(^|[\s(«“])(de|em|por|a) (o|a) (?=\S)/g, (m, a, b, c) => a + JOIN[b + ' ' + c] + ' ') : txt;
  }
  const said = (v, o, txt) => veil(v, txt, [o.cust, o.to, o.baby]);
  I.said = said;
  // (what someone is at, as the world words it — their errand may name who it is with: the one spoken to, the keeper of the
  // stall —, for a body that may not know them)
  const doingOf = (me, o) => { const t = o.task; const txt = G.Vg.taskText(o); if (!me || !t) return txt; const z = t.biz && G.Biz ? G.Biz.get(t.biz) : null; return veil(me, txt, [t.id, t.who, t.to, t.cust, z ? z.owner : 0]); };
  I.add({
    id: 'atividade', prio: 4.2, reach: 2.6,
    find(ctx) { if (!G.Act || !G.Act.offers) return []; return G.Act.offers(ctx.v, ctx.x, ctx.y, 2.6 / L() + 2).filter(o => o && o.at).map(o => placed(ctx, o)); },
    // (an offer that names who it is done with — «Servir Aelia» — says them as the body can: Possess.knows)
    label(ctx, t) { return said(ctx.v, t.o, t.o.label) || 'Ajudar'; },
    can(ctx, t) { return t.o.ok === false ? { ok: false, why: said(ctx.v, t.o, t.o.why) || 'Agora não dá.' } : { ok: true }; },
    run(ctx, t) {
      const o = t.o; const v = ctx.v; const g = AN(o.anim); const gx = t.hand ? t.hand[0] : t.X, gz = t.hand ? t.hand[2] : t.Z; const f = face(ctx, gx, gz);
      const { to, go } = walkUp(ctx, v, gx, gz, 0.7); const goW = go * G.Space.TIME; const hand = g.act === 'lift' || g.act === 'arrange';
      // (where the hands go: with a load, down before the feet; empty, to the thing — on the ground, or on the counter)
      // (the thing drawn there when there is one — the crate offered, where the 3D draws it; or the crate of the quay the world
      // hands out next: People3D.nearLoad)
      const hands = reachTo(a => { if (!a.P) { const P3 = G.People3D; const H = P3 && P3.look(v).held; const src = !H && t.hand ? t.hand : !H && P3 && P3.nearLoad ? P3.nearLoad(gx, gz, 0.9) : null; a.P = H ? putAt(v, gx, gz)(a) : src || toward(G.Avatar.pos(), gx, gz, g.act === 'arrange' ? 0.9 : 0.2); } return a.P; }, 0.36, 0.45);
      const pre = G.Possess.apply(w => G.Act.begin(w, o));
      const free = () => G.Possess.apply(() => { const r = pre.res; if (r && r.ok) G.Act.abort(r.h, 'cortado'); return { ok: true }; }); // (once done or refused, nothing to let go)
      G.Avatar.act({ world: true, anim: GEST[g.act] || 'interact', dur: Math.max(g.dur, g.contact + 0.2) + goW, contact: g.contact + goW, face: f, to, toT: go, vact: g.act,
        reach: hand ? a => (a.tr < go ? null : hands(a)) : null,
        keep: () => { const r = pre.res; if (!r || r.ok) return true; if (!r.dropped) deny(r); return false; },
        op: () => { const r = pre.res; return r && r.ok ? G.Act.commit(r.h) : r || { ok: false, why: '' }; },
        cut: free, then: r => say(r.msg), fail: r => { free(); deny(r); } });
      return { ok: true };
    },
  });
  // the lead to the world's work near the body (what the HUD shows of it: a quiet line, a mark over the place, an arrow at the
  // edge when the place is out of sight), only read from the world: an unloading under way of the body's own people, by day, a
  // stone's throw away and where its feet reach (Possess.workable: asked of the map in the world's step) — its crates where
  // the 3D draws them on the quay, or one lying where it fell —; with a crate of it in the hands, the door of the store the
  // unloading's overseer chose for it (Porto.destOf), when the feet reach it, by night too. No unloading, no crates, no store,
  // no way there: no lead.
  // (X, Z: the body, metres; keep: the work shown now, kept a few metres farther, so that the line does not blink at the edge)
  I.LEAD = 25;
  I.lead = function (v, X, Z, keep) {
    const A = G.Act, P = G.Porto; if (!v || !A || !P || !A.able(v)) return null;
    const S = G.S, TL = L(), P3 = G.People3D; if (X === undefined) { X = v.x * TL; Z = v.y * TL; }
    const gY = (x, y) => W.groundH(x, y) * G.Space.HM;
    const c = v.carry;
    if (c && c.n > 0) {
      const op = c.op ? A.get(c.op) : null; if (!op || !A.live(op) || op.def !== 'descarga') return null;
      const dest = G.Possess.storeOf(op); if (!dest || !G.Possess.destOK(op.id)) return null; const d = G.Vg.door(dest);
      return { step: 'levar', op: op.id, b: dest.id, X: d[0] * TL, Y: gY(d[0], d[1]) + 2.4, Z: d[1] * TL, d: Math.hypot(d[0] * TL - X, d[1] * TL - Z), txt: `Levar ${G.Possess.toB(dest)}` };
    }
    if (G.isNight()) return null;
    let best = null;
    const take = (op, at, txt, b) => { const d = Math.hypot(at[0] - X, at[2] - Z); if (d <= (keep === op.id ? I.LEAD + 5 : I.LEAD) && (!best || d < best.d)) best = { step: 'pegar', op: op.id, b, X: at[0], Y: at[1], Z: at[2], d, txt }; };
    for (const op of A.all()) {
      if (op.def !== 'descarga' || !A.live(op) || op.st !== 'on' || !G.Possess.workable(op.id)) continue;
      const dock = S.buildings.get(op.at); const mine = dock && dock.crates ? dock.crates.filter(q => q.op === op.id) : [];
      if (mine.length) {
        // (the pile: the middle of its crates as drawn, over the highest; not drawn, over the world's spot for them)
        const ids = new Set(mine.map(q => q.id)); const L3 = P3 && P3.lyingOf ? P3.lyingOf(dock.id).filter(e => ids.has(e[4])) : [];
        let at = null;
        if (L3.length) { let x = 0, y = -1e9, z = 0; for (const e of L3) { x += e[0]; y = Math.max(y, e[1]); z += e[2]; } at = [x / L3.length, y + 1.1, z / L3.length]; }
        else { const sp = P3 && P3.crateSpot ? P3.crateSpot(dock) : null; if (sp) at = [sp[0] * TL, gY(sp[0], sp[1]) + 1.4, sp[1] * TL]; }
        if (at) take(op, at, `Descarga no cais: caixas de ${G.Possess.cargo(op)} esperando`, dock.id);
      }
      // (a crate of it set down on the ground — by a porter called away, or by the god's body)
      for (const o of S.loose || []) if (o.op === op.id) take(op, [o.x * TL, gY(o.x, o.y) + 1, o.y * TL], `Descarga: uma caixa de ${o.fish ? 'peixe' : G.Eco.name(o.k)} no chão, esperando`, 0);
    }
    return best;
  };
  // a beast: looked at (what the world knows of it)
  I.add({
    id: 'bicho', prio: 2, reach: 4, passing: true,
    find(ctx) { const out = []; const R = 4.5 / L(); for (const a of G.S.animals.values()) { if (a.dead || a.held || Math.abs(a.x - ctx.x) > R || Math.abs(a.y - ctx.y) > R) continue; const d = G.Animals.DEF[a.kind]; if (!d || d.cls === 'water') continue; out.push({ a, X: a.x * L(), Z: a.y * L() }); } return out; },
    label(ctx, t) { const d = G.Animals.DEF[t.a.kind]; return `Observar ${d ? d.nameA || d.name : 'o bicho'}`; },
    can(ctx, t) { return G.S.animals.has(t.a.id) ? { ok: true } : { ok: false, why: 'Foi embora.' }; },
    run(ctx, t) { deed('exame'); return { ok: true, card: beastCard(t.a) }; },
  });
  // (a beast's card: what the world knows of it — only read)
  function beastCard(a) {
    const d = G.Animals.DEF[a.kind] || {};
    const rows = []; if (a.named) rows.push(['Nome', a.named + (a.epithet ? ', ' + a.epithet : '')]); if (a.tamed || a.dom) rows.push(['', 'Animal de criação']); if (a.legend) rows.push(['', 'Uma fera lendária']); if (a.kills) rows.push(['Matou', a.kills + (a.kills > 1 ? ' pessoas' : ' pessoa')]);
    return { kind: 'thing', name: G.cap ? G.cap(d.name || a.kind) : (d.name || a.kind), sub: a.grown < 1 ? 'um filhote' : 'adulto', rows };
  }
  // water at the feet: a river or a lake is drunk from, kneeling (the breath comes back); the sea is salt
  I.add({
    id: 'agua', prio: 1.5, reach: 2.4, here: true, // (here: where the body is — the water it stands in, the edge nearest it —, no place of its own)
    find(ctx) {
      const S = G.S; const T = G.T; const out = []; const x0 = Math.floor(ctx.x), y0 = Math.floor(ctx.y);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const x = x0 + dx, y = y0 + dy; if (!W.inb(x, y)) continue; const i = W.idx(x, y); const t = S.type[i];
        // (where the hands reach it: the edge of that water nearest the body)
        if ((t === T.RIVER || t <= T.SEA) && !(S.dry && S.dry[i]) && !(S.ice && S.ice[i]) && !S.road[i]) out.push({ i, sea: t <= T.SEA, X: G.clamp(ctx.X, x * L() + 0.2, (x + 1) * L() - 0.2), Z: G.clamp(ctx.Z, y * L() + 0.2, (y + 1) * L() - 0.2) }); }
      return out;
    },
    label(ctx, t) { return t.sea ? 'Provar a água do mar' : 'Beber água'; },
    can(ctx, t) { return t.sea ? { ok: false, why: 'A água do mar é salgada.' } : { ok: true }; },
    run(ctx, t) {
      const f = face(ctx, t.X, t.Z);
      G.Avatar.act({ anim: 'low', dur: 2, face: f, at: [0.8, () => { const p = G.Avatar.pos(); if (p && G.FX3D) for (let k = 0; k < 6; k++) G.FX3D.spawn({ x: p.X + Math.cos(f) * 0.6, y: p.Y + 0.1, z: p.Z + Math.sin(f) * 0.6, vx: G.vrr(-0.4, 0.4), vy: G.vrr(0.6, 1.4), vz: G.vrr(-0.4, 0.4), life: 0.6, s0: 0.06, s1: 0.03, c: [0.85, 0.93, 0.98], a: 0.8, sh: 1, grav: 8 }); }],
        // (the world counts the drink at the mouth — the contact —; the breath comes back with it)
        contact: 1.2, op: () => { G.Possess.deed('agua'); return { ok: true }; }, then: () => G.Avatar.rest() });
      return { ok: true, msg: 'Você bebe da água fresca.' };
    },
  });
  // a tame beast near (a dog, a cat, a hen, the herd): stroked — it leans into the hand, a little heart over it
  I.add({
    id: 'carinho', prio: 2.5, reach: 2.4, passing: true,
    find(ctx) { const out = []; const R = 2.6 / L(); for (const a of G.S.animals.values()) { if (a.dead || a.held || Math.abs(a.x - ctx.x) > R || Math.abs(a.y - ctx.y) > R) continue; const d = G.Animals.DEF[a.kind]; if (!d || d.cls === 'water' || d.cls === 'air' || !(a.dom || a.tamed || d.dom || d.pet)) continue; out.push({ a, X: a.x * L(), Z: a.y * L() }); } return out; },
    label(ctx, t) { const d = G.Animals.DEF[t.a.kind]; return `Fazer carinho ${d ? 'n' + (d.g === 'f' ? 'a ' : 'o ') + (d.name || '').toLowerCase() : 'no bicho'}`; },
    can(ctx, t) { return G.S.animals.has(t.a.id) ? { ok: true } : { ok: false, why: 'Foi embora.' }; },
    run(ctx, t) {
      const f = face(ctx, t.X, t.Z); const a = t.a;
      G.Avatar.act({ anim: 'low', dur: 1.6, face: f, at: [0.6, () => { if (G.FX3D) G.FX3D.spawn({ x: a.x * L(), y: (W.groundH(a.x, a.y) * G.Space.HM) + 1.2, z: a.y * L(), vx: 0, vy: 0.5, vz: 0, life: 1.2, s0: 0.25, s1: 0.4, c: [1, 0.45, 0.6], a: 0.9, fade: 1 }, true); }], contact: 0.9, op: () => { if (!G.S.animals.has(a.id)) return { ok: false, why: '' }; G.Possess.deed('carinho'); return { ok: true }; } });
      return { ok: true, msg: 'Ele se encosta na sua mão.' };
    },
    // (20e: F — a look at it, the beast's card; the same beast is one target, whoever offers it: I.candidates)
    verbs(ctx, t) { const d = G.Animals.DEF[t.a.kind]; return [{ id: 'exame', k: 'outra', label: `Observar ${d ? d.nameA || d.name : 'o bicho'}`, run: () => { deed('exame'); return { ok: true, card: beastCard(t.a) }; } }]; },
  });
})(window.G);
