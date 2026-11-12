'use strict';
// ============================================================
//  Possess: one body of the world, lent to the player. The god
//  does not make a hero: the person stays who they are — the
//  same id, name, age, trade, family, home, people, health,
//  memories, stories. Only the will that moves the body changes
//  hands. The truth of it is one record, S.avatar (only this
//  file writes it), and one task, { type: 'avatar', pri: 100 }
//  (only this file gives it). While it lasts:
//    · the body's needs go on — hunger, tiredness, age, sickness,
//      wounds: a mortal stays mortal (villagers.js runs needs);
//    · the person's own deciding stops — no emergency, no
//      decide, no runTask (villagers.js asks Possess.live);
//    · orders from the world are of two kinds (setTask asks here):
//      a request (the call to arms, a fire to put out, a feast)
//      does not take the body — it becomes a call the player
//      sees and may answer or not; a force of the world (prison,
//      captivity, the sea, a ship) takes the body back: the
//      incarnation ends and the person's life goes on;
//    · death is death: it is recorded like any other, and the
//      player goes back to being a god (no one is restored).
//  Giving the body back leaves no hanging reference: the task
//  goes, the path goes, and the person decides from where they
//  stand on the next step (qa.js 'avatar' checks all of it).
//  What kind of body it is (a mortal human now; something
//  extraordinary, or the god's own avatar, later) is a kind with
//  capabilities — the controller asks what the body can do,
//  never "is it a human?".
// ============================================================
(function (G) {
  const W = G.W;
  const Po = G.Possess = { onEnd: [], onLog: [] };
  // the kinds of incarnation: what the body of each can do (the future ones are only named, not made)
  const KINDS = {
    humano: { label: 'Humano mortal', mortal: true, swim: true, climb: false, glide: false, dive: false },
    // extraordinario: { … }, avatarDivino: { … } — capacidades acima do humano (D-018: reservado, não implementado)
  };
  Po.KINDS = KINDS;
  let cur = null; // (the body's villager object, for the cause of a death the loop finds late; cleared with the world)
  G.worldHooks.push(() => { cur = null; });

  Po.id = () => (G.S && G.S.avatar ? G.S.avatar.id : 0);
  Po.on = () => !!(G.S && G.S.avatar);
  Po.body = () => { const id = Po.id(); return id ? G.S.villagers.get(id) || null : null; };
  Po.is = v => !!(v && G.S && G.S.avatar && G.S.avatar.id === v.id);

  // ------------------------------ who can be lived ------------------------------
  const oa = v => (v.g === 'f' ? 'a' : 'o');
  // (water: only a save opens a body in the water — it was swimming when the game was saved, and swims on; one does not
  // step into a body in the middle of the sea)
  Po.can = function (v, water, via) {
    const S = G.S;
    if (!v || !S || !S.villagers.has(v.id)) return { ok: false, why: 'Esta pessoa não está mais entre os vivos.' };
    if (v.age < 6) return { ok: false, why: `${v.name} é pequen${oa(v)} demais para andar por aí sozinh${oa(v)}.` };
    if (v.held) return { ok: false, why: `${v.name} está nas suas mãos.` };
    if (v.air) return { ok: false, why: `${v.name} está voando pelos ares.` };
    if (v.aboard) return { ok: false, why: `${v.name} está a bordo de um navio — o mar em 3D ainda não existe.` };
    if (v.ug) return { ok: false, why: `${v.name} está dentro de uma caverna — as cavernas em 3D ainda não existem.` };
    if (v.jail) return { ok: false, why: `${v.name} está pres${oa(v)}.` };
    if (v.captive) return { ok: false, why: `${v.name} é cativ${oa(v)}: o corpo pertence a quem ${v.g === 'f' ? 'a' : 'o'} prendeu (a fuga será uma aventura futura).` };
    const t = v.task;
    if (t && (t.type === 'scene')) return { ok: false, why: `${v.name} está no meio de uma cena da história.` };
    if (t && (t.type === 'condemned' || t.type === 'escorted' || t.type === 'swim' || t.type === 'cela')) return { ok: false, why: `${v.name} não está em condições agora.` };
    // (on a doorstep — the plan's own ground, that the world's map has blocked — one stands: L-162)
    if (!v.inside) { const s = G.Space.surface(v.x * G.Space.TILE, v.y * G.Space.TILE); if (!s.walk && !(water && s.kind === 'deep' && KINDS.humano.swim) && !onPlan(v, via ? { via } : null)) return { ok: false, why: `${v.name} não está em chão firme.` }; }
    return { ok: true };
  };
  // what the body can do, from the person (age, a lost leg, sickness, tiredness) and the kind of incarnation
  Po.caps = function (v) {
    const a = G.S.avatar; const K = KINDS[(a && a.kind) || 'humano'] || KINDS.humano;
    const leg = !!(v.lost && v.lost.leg), kid = v.age < 12, old = v.age >= 62, very = v.age >= 75;
    // walking: the world's own pace for this person, in metres per second of the body's time (G.Space.TIME)
    const walk = (v.speed || 1.35) * G.Space.TILE * G.Space.TIME * (kid ? 0.85 : old ? 0.78 : 1) * (leg ? 0.6 : 1) * (v.sick > 0 ? 0.8 : 1);
    return {
      walk, run: !leg && !very ? (kid ? 1.75 : old ? 1.45 : 2.05) : 1, jump: !leg && !very ? (kid ? 0.55 : old ? 0.4 : 0.85) : 0,
      stamina: kid ? 70 : old ? 55 : 100, swim: K.swim, climb: K.climb, glide: K.glide, dive: K.dive, mortal: K.mortal,
    };
  };

  // ------------------------------ taking and giving back ------------------------------
  Po.take = function (v, kind) {
    const S = G.S; const c = Po.can(v); if (!c.ok) return c;
    if (S.avatar) Po.release('troca');
    // (someone indoors in a building whose plan is made is taken where they are in it — at the place the world gives them there,
    // Interiors.placeOf, read as they are before the errand ends and the will changes hands —, on their feet in the room: the
    // errand's end lets one inside out at the door first)
    const inB = v.inside > 0 ? v.inside : 0; const B0 = inB ? S.buildings.get(inB) : null;
    const pl0 = B0 && G.Space.planNow && G.Space.planNow(B0) && G.Interiors.placeOf ? G.Interiors.placeOf(v) : null;
    // (the errand stops where it is — the load in the hands stays in them: it is the same person, and what they were doing goes
    // on with the player's hands (keepLoad: C1's endTask leaves the carry where it is); stay: the building one is in)
    G.Vg.endTask(v, { keepLoad: true, stay: inB });
    v.sleeping = false; v.path = null; v.act = ''; v.actT = 0; v.moving = false; v.z = 0;
    S.avatar = { id: v.id, kind: KINDS[kind] ? kind : 'humano', since: S.day, t0: S.clock, x0: +v.x.toFixed(2), y0: +v.y.toFixed(2), asks: [], deeds: {}, seen: [], met: [], lv: null, via: 0, use: null };
    // (where it stands: the place itself, standing there; on a piece — a bed, a seat —, beside it, where one stands to get onto
    // it; else a little inside the way in; with no floor for the feet in any of them, out at the door, as waking does)
    if (pl0 && pl0.b === B0) {
      const p = G.Space.plan(B0); const TL = G.Space.TILE; const tries = []; const sp0 = pl0.it ? pl0.it.spots[pl0.q] : null;
      if (!(sp0 && sp0.on)) tries.push([pl0.x, pl0.z]);
      if (pl0.it && G.Interiors.fitStand) for (const sp of pl0.it.spots) if (!sp.on) { const f = G.Interiors.fitStand(p, pl0.it.lv, sp.x, sp.z, pl0.it.r); if (f) tries.push(f); }
      if (p.entrance) tries.push([p.entrance.x + (p.lot.w / 2 - p.entrance.x) * 0.15, p.entrance.z + (p.lot.w / 2 - p.entrance.z) * 0.15]);
      let at = null; for (const [x, z] of tries) { const ins = G.Space.indoor(B0.x * TL + x, B0.y * TL + z, pl0.lv, B0.id); if (ins && ins.walk && ins.shell) { at = [x, z, ins.lv]; break; } }
      if (at) { v.inside = B0.id; v.x = B0.x + at[0] / TL; v.y = B0.y + at[1] / TL; S.avatar.lv = at[2]; }
      else if (v.inside) { const d = G.Vg.door(B0); v.x = d[0]; v.y = d[1]; v.inside = 0; }
    }
    G.Vg.setTask(v, mark());
    S.avatar.via = viaOf(v, S.avatar); // (taken indoors, or at a door: by that building)
    cur = v;
    return { ok: true };
  };
  // the body goes back to its own life: every reason ends here ('deus' the player chose; 'forca' the world took it;
  // 'troca' another body; 'morte' is died())
  Po.release = function (why, detail, keepTask) {
    const S = G.S; const a = S.avatar; if (!a) return null;
    const v = S.villagers.get(a.id);
    S.avatar = null; cur = null; drop();
    if (v) {
      if (!keepTask && v.task && v.task.type === 'avatar') { v.task = null; }
      if (!keepTask) { v.path = null; v.act = ''; v.sleeping = false; }
      v.think = 0; v.scan = 0; v.moving = false; v.carried = false;
      record(v, a, why);
    }
    for (const f of Po.onEnd) f(why, v, detail, a);
    return v;
  };
  function died(rec, cause, a, beast) {
    const S = G.S; if (!a) return;
    S.avatar = null; cur = null; drop();
    record(rec, a, 'morte', cause, beast);
    for (const f of Po.onEnd) f('morte', rec, cause, a);
  }
  // what the time in the body leaves in the world: a line of the biography, a line of the chronicle
  function record(v, a, why, cause, beast) {
    const S = G.S; const days = Math.max(0, S.day - a.since); const dd = summary(a.deeds);
    if (why !== 'morte') G.Life && G.Life.bio(v, 'god', days, dd);
    else if (v.bio) { v.bio.push([S.day, 'god', days, dd, 1]); }
    const set = S.settlements.get(v.set);
    if (why === 'morte') {
      // (the death is already in the chronicle when the world tells of it: that line says it happened in the god's body)
      // (the text the world told it with: the beast by its name where the world knew it — the record of the dead keeps no beast,
      // and «uma fera» found no line of «um rinoceronte»: the death told twice, L-698)
      const dt = G.Village.deathText({ ...v, cause, lastBeast: beast !== undefined ? beast : v.lastBeast }); const H = S.history; let told = false;
      for (let k = H.length - 1, m = 0; k >= 0 && m < 12; k--, m++) { const e = H[k]; if (e.d !== S.day) break; if (e.txt.includes(v.name) && e.txt.includes(dt)) { e.txt = e.txt.replace(/\.$/, '') + ' — com o deus vivendo em seu corpo.'; told = true; break; } }
      if (!told) G.Village.log(`${v.name}${set ? ' de ' + set.name : ''} ${dt} — com o deus vivendo em seu corpo.`, 'skull', v.x, v.y);
    }
    else if (days >= 1 || Object.keys(a.deeds).length >= 3) G.Village.log(`${v.name}${set ? ' de ' + set.name : ''} viveu ${days >= 1 ? days + (days > 1 ? ' dias' : ' dia') : 'um tempo'} guiad${oa(v)} pelo deus.`, 'eye', v.x, v.y);
    G.Stories && G.Stories.signal('avatarEnd', { id: v.id, set: v.set, why, days, deeds: Object.assign({}, a.deeds), x: v.x, y: v.y });
  }
  // the deeds counted (kind → how many), as the short words a biography keeps
  // (every kind of deed, in the order of DEED — the people met first; none dropped: the biography tells what was done)
  function summary(d) { return Object.keys(DEED).filter(k => d[k] > 0).map(k => k + ':' + Math.round(d[k])).join('|'); }
  Po.summary = summary;

  // ------------------------------ orders from the world ------------------------------
  // (setTask asks here before an order reaches the body: null lets it through, a task is what the body keeps doing)
  const FORCE = { jail: 'a justiça', cela: 'a justiça', condemned: 'a justiça', escorted: 'o cativeiro', aboard: 'o mar', embark: 'o mar' };
  Po.FORCE = FORCE;
  Po.ask = function (v, t) {
    if (!t || t.type === 'avatar') return null;
    // (the world found the body in the water and would have it swim for the shore: a body that swims swims on its own —
    // the player swims, or drowns; one that cannot is taken back, as before)
    if (t.type === 'swim') { if (Po.caps(v).swim && v.task && v.task.type === 'avatar') { v.task.afloat = 1; return v.task; } Po.release('forca', 'swim'); return null; }
    if (FORCE[t.type]) { Po.release('forca', t.type); return null; }
    call(v, t);
    // (someone may have ended the body's task just before giving the order — a fire in the house: the body stays the player's)
    if (!v.task || v.task.type !== 'avatar') v.task = mark();
    return v.task;
  };
  const mark = () => ({ type: 'avatar', pri: 100, st: 0, age: 0, afloat: 0 });
  // a call: what the world asked of the body, kept for the player (the base of duties and their breaking, later)
  const CALL = {
    muster: 'Seu povo te chama às armas.', band: 'Seu povo te chama às armas.', army: 'O exército te espera.', defend: 'A vila está sendo atacada — pegue em armas!',
    fire: 'Fogo! Todos correm para apagar.', flee: 'Gritam para você fugir!', panic: 'O pânico tomou as ruas.', riot: 'A multidão te chama para o motim.', riotguard: 'A guarda te chama.',
    fest: 'Há festa na praça.', assembly: 'Chamam todos para a assembleia.', migrate: 'Seu povo vai partir em migração.', refugio: 'Chamam todos para o refúgio.', pray: 'Hora de rezar no templo.',
    dragao: 'Chamam todos para enfrentar o dragão!', sair: 'O mar vai voltar! Saia do fundo do mar!', hide: 'Mandam você se esconder.', saga: 'Uma história te chama.',
  };
  // (the store an unloading takes its crates to, as its overseer chose it — Porto.destOf —, while it is a store: pulled down a
  // moment ago, a ruin is no store, until the overseer chooses again)
  Po.storeOf = op => { const b = op && G.Porto ? G.Porto.destOf(op) : null; return b && G.BDEF[b.type] && G.BDEF[b.type].dropoff ? b : null; };
  // (the words of a cargo: what the crates of an unloading on its quay hold — the fish of a catch is fish —, the most first)
  Po.cargo = function (op) {
    const E = G.Eco; const dock = op && G.S.buildings.get(op.at); const n = {};
    for (const q of (dock && dock.crates) || []) if (q.op === op.id) { const w = q.fish ? 'peixe' : E.name(q.k); n[w] = (n[w] || 0) + 1; }
    let ks = Object.keys(n).sort((a, b) => n[b] - n[a] || (a < b ? -1 : 1));
    if (!ks.length && op) ks = Object.keys(op.goods || {}).filter(k => op.goods[k] > 1e-6).sort().map(k => E.name(k));
    return ks.slice(0, 2).join(' e ') || 'carga';
  };
  // (to a building, in words: "ao armazém do porto", "à praça")
  Po.toB = b => { const nm = G.Village.buildName(b); return (G.gen(nm) === 'a' ? 'à ' : 'ao ') + nm.toLowerCase(); };
  // (a call that says what it is from the world: the unloading — the crates its quay has, the store they go to)
  CALL.descarga = (v, t) => { const op = G.Act && G.Act.get(t.op); const dest = Po.storeOf(op); return op ? `O cais precisa de braços: há caixas de ${Po.cargo(op)} para levar ${dest ? Po.toB(dest) : 'ao armazém'}.` : null; };
  function call(v, t) {
    const S = G.S; const a = S.avatar; if (!a) return;
    const c = CALL[t.type]; const txt = typeof c === 'function' ? c(v, t) : c || (() => { const tt = G.Vg.taskText(Object.assign({}, v, { task: t, held: false, air: false })); return tt ? 'Esperam que você: ' + tt.charAt(0).toLowerCase() + tt.slice(1) + '.' : null; })();
    if (!txt) return;
    const q = a.asks.find(o => o.type === t.type);
    if (q) { q.t = S.clock; q.n++; return; }
    a.asks.push({ type: t.type, txt, t: S.clock, t0: S.clock, n: 1 });
    if (a.asks.length > 6) a.asks.shift();
  }
  Po.calls = () => (G.S.avatar ? G.S.avatar.asks.slice() : []);
  // the body in the water by the player's will — swimming, or wading where the world does not walk (the sea's shallows, a
  // deep river): the world leaves it there, it does not pull it out (the body swims, or drowns). The mark is on the
  // body's task, and only this file writes it (the controller tells it where the body is)
  Po.afloat = v => !!(v && v.task && v.task.type === 'avatar' && v.task.afloat);
  Po.setAfloat = function (on) { const v = Po.body(); if (!v || !v.task || v.task.type !== 'avatar') return; v.task.afloat = on ? 1 : 0; };

  // ------------------------------ the body's hands on the world ------------------------------
  // What the player's hands do to the world is asked from the frame (the input: a key, a click) and done by the world in its
  // own step — inside G.inSim, by the world's rules and with the world's chance —, like what anyone of the world does: Po.apply
  // keeps the asking, Po.update does it and keeps the answer ({ ok, why, … }) for the act that asked to read. A body given back
  // drops what it had asked and the world had not yet done: it never happened (nothing of it goes in a save either)
  let queue = []; G.worldHooks.push(() => { queue = []; });
  Po.apply = function (fn) { const it = { fn, res: null, id: Po.id() }; if (!it.id) it.res = { ok: false, why: '', dropped: 1 }; else queue.push(it); return it; };
  const drop = () => { for (const it of queue) it.res = { ok: false, why: '', dropped: 1 }; queue = []; };
  Po.pending = () => queue.length; // (for the tests)
  Po.queued = () => queue.map(it => it.id); // (for the verifier: whose hands asked what is waiting for the world's step)

  // ------------------------------ the body's own step ------------------------------
  // (villagers.js calls this instead of emergency/decide/runTask: the will is the player's)
  Po.live = function (v, dt) {
    // (a task ended by someone else without another given: the body is still the player's)
    if (!v.task) v.task = mark();
    // (asleep, it wakes as anyone of the world in its state would — by day, its strength back: villagers.js runSleep —, never in
    // the night however rested, and never for hunger: the world does not wake the body, L-171 — L-341)
    if (v.sleeping && !G.isNight() && v.energy >= 96) Po.wake(v);
    reach(v); duty(v);
    void dt;
  };
  // the storey of a building the body is on, indoors (undefined outdoors): the body's record, with its place (v.x, v.y) —
  // written by its controller as it walks, saved with it
  Po.level = () => { const a = G.S.avatar; return a && Number.isFinite(a.lv) ? a.lv : undefined; };
  Po.setLevel = lv => { const a = G.S.avatar; if (a) a.lv = Number.isFinite(lv) ? lv : null; };
  // (the body is in the rooms of a building whose plan is made — within its walls, or on its doorstep going in or out —, or not)
  function indoorOK(v, a) {
    const B = G.S.buildings.get(v.inside); if (!B || !G.Space.planNow || !G.Space.planNow(B)) return false;
    const ins = G.Space.indoor(v.x * G.Space.TILE, v.y * G.Space.TILE, a && Number.isFinite(a.lv) ? a.lv : undefined, B.id);
    return !!(ins && ins.b === B && (ins.shell || ins.walk));
  }
  Po.indoorOK = v => indoorOK(v, G.S.avatar);
  // where a plan lets the body stand — the one rule of the world's step, of the push of the stuck (villagers.js) and of the
  // verifier: indoors, indoorOK; not indoors, on the plan's own ground that the world's map has blocked (the building's lot),
  // where the plan walks: the doorstep before an outer door, the steps up a house on stilts — and, for a step, a room of the
  // building it came in by (a.via: walked in from its door, before the world has the body indoors — the body's word for it
  // goes in the world's next step: L-162). Walls that rose round the body are no room it came into: the world takes it out as
  // anyone (L-175). The plan made now if it is not yet (Space.planNow), never the frame's queue: the world's step is the same
  // with or without anyone looking
  // (on an open ground of storeys come into by its way in — the arena and the podium of the amphitheatre over its substructure —,
  // the storey the body stands on, kept with it (Avatar: Possess.setLevel); asked on the ground's own storey, the body on the arena
  // stood in the stone under it, and the push of the stuck took it out of the building in a second — L-550)
  function planAt(v, a) {
    const S = G.S; if (!W.inb(v.x, v.y)) return null; const B = S.buildings.get(S.occ[W.idx(v.x, v.y)]);
    if (!B || !G.Space.planNow || !G.Space.planNow(B)) return null;
    const lv = a && a.via === B.id && Number.isFinite(a.lv) ? a.lv : undefined;
    const ins = G.Space.indoor(v.x * G.Space.TILE, v.y * G.Space.TILE, lv, B.id); return ins && ins.b === B && ins.walk ? ins : null;
  }
  function onPlan(v, a) {
    if (!v) return false; if (v.inside) return indoorOK(v, a);
    const ins = planAt(v, a); return !!ins && (!ins.shell || !!(a && a.via === ins.b.id));
  }
  // the building the body is by, at the end of each step of the world: indoors, the one the world has it in; at its doorstep,
  // on its steps, in the opening of its outer door; or still in a room of the one it came in by. The only way into a room is
  // its door (L-175)
  function viaOf(v, a) {
    if (v.inside) return v.inside;
    const ins = planAt(v, a); if (!ins) return 0; const id = ins.b.id;
    if (!ins.shell) return id; // (the doorstep, the steps)
    const d = ins.door >= 0 && ins.p.doors[ins.door]; if (d && d.outer) return id; // (in its outer door's opening)
    return a && a.via === id ? id : 0; // (a room walked into from its door; walls that rose round it: none)
  }
  Po.cameBy = id => { const a = G.S.avatar; return !!a && a.via === id; };
  // the place of a building's plan the body's hands took — on a bench, in a bed, at the wheel (Interact's verb, done in the
  // world's step) —: only this file writes it; Interiors.places gives it to the body and to no one else (D-085). Let go when
  // the body leaves the building, or the plan it was taken in is no longer the building's (a renovation, a ruin)
  // (the open ground of a square, of a fair — a shell with no walls — has no door to come in by: the body walks on it as anyone
  // of the town, and the world has it there, inside, only while it holds a place of it — taken here, let go with the place)
  Po.use = function (v, b, pl) {
    const a = G.S.avatar; if (!a || !Po.is(v) || !b || !pl || !pl.it || !G.Interiors.keyOf) return false;
    if (v.inside !== b.id) { if (v.inside || !openOn(v, b)) return false; v.inside = b.id; a.lv = pl.lv; }
    a.use = { b: b.id, it: pl.item, q: pl.q, use: pl.use, st: pl.st || '', key: G.Interiors.keyOf(b), t0: G.S.clock }; return true;
  };
  Po.unuse = function (v) {
    const a = G.S.avatar; if (!a) return; const u = a.use; a.use = null;
    const w = v || G.S.villagers.get(a.id); const B = u && G.S.buildings.get(u.b);
    if (w && B && w.inside === B.id && openShell(B)) w.inside = 0; // (on an open ground, still on the storey it stood up on: L-550)
  };
  const openShell = B => { const p = G.Space.planNow ? G.Space.planNow(B) : null; return !!(p && p.shell && p.shell.kind === 'aberta'); };
  const openOn = (v, B) => { if (!openShell(B)) return false; const ins = planAt(v, G.S.avatar); return !!(ins && ins.b === B && ins.shell); };
  Po.openShell = openShell; // (for the controller: an open ground is entered by a place of it, never by walking on it)
  Po.useOf = () => { const a = G.S.avatar; return a && a.use ? a.use : null; };
  const useHolds = (v, a) => { const u = a.use; const B = u && G.S.buildings.get(u.b); return !!(B && v.inside === u.b && G.Interiors.keyOf && G.Interiors.keyOf(B) === u.key); };
  Po.onPlan = v => { const a = G.S.avatar; return !!(v && a && a.id === v.id) && onPlan(v, a); };
  // the unloadings the body could lend a hand to, as the world gives its own porters theirs (Porto.claim): of the body's own
  // people, with crates of it — on the quay or on the ground — where its feet reach (the map of regions, asked here in the
  // world's step), and whether they are near (for the lead); with a crate of one in the hands, whether the feet reach the door
  // of its store. Kept for the frame (the lead, Interact.lead) to read: the frame never asks the map
  let work = new Map(), destOK = new Set(); G.worldHooks.push(() => { work = new Map(); destOK = new Set(); });
  Po.workable = id => { const w = work.get(id); return !!(w && w.near); };
  Po.destOK = id => destOK.has(id);
  function reach(v) {
    const S = G.S; const wk = new Map(), dk = new Set(); work = wk; destOK = dk; if (!G.Act || !G.Porto || !G.Fishers) return;
    const fid = G.Fac.idOfV(v);
    for (const o of G.Act.all()) {
      if (o.def !== 'descarga' || !G.Act.live(o) || o.fac !== fid) continue;
      const d = S.buildings.get(o.at); let r = false, nr = false; const at = (x, y) => { if (nr || !G.W.reaches(v, x, y)) return; r = true; if (G.dist(x, y, v.x, v.y) < 12) nr = true; };
      if (d && d.type === 'doca' && d.crates && d.crates.some(c => c.op === o.id)) { const p = G.Fishers.crateSpot(d); at(p[0], p[1]); }
      for (const g of S.loose || []) if (g.op === o.id) at(g.x, g.y);
      if (r) wk.set(o.id, { reach: r, near: nr });
    }
    const c = v.carry; const op = c && c.n > 0 && c.op ? G.Act.get(c.op) : null; const st = op && G.Act.live(op) ? Po.storeOf(op) : null;
    if (st) { const dr = G.Vg.door(st); if (G.W.reaches(v, dr[0], dr[1])) dk.add(op.id); }
  }
  // the trade's call: a docker lived by the god — or a fisherman of a quay — is called to the crates of an unloading under way
  // as the world sends its own (harbor.js jobTask: the town's quays, by day, a warehouse to work for; the fisherman, his own
  // quay's), since the body never goes through the world's choosing of a task. The call stays while there is that work and the
  // hands are free, and goes when it is done, at night, or while the body carries one of its crates. Only the call: the will is
  // the player's (no crate is kept for the body, nobody is put in the team)
  function duty(v) {
    const S = G.S; const a = S.avatar; if (!a || !G.Act || !G.Porto) return;
    let op = null;
    const w = v.job && S.buildings.get(v.job);
    const mine = v.role === 'estivador' ? !!(w && w.built && w.type === 'armazem') : v.role === 'pescador' && !!(w && w.type === 'doca');
    if (mine && !G.isNight() && G.Act.able(v) && !(v.carry && v.carry.n > 0)) {
      for (const o of G.Act.all()) {
        if (o.def !== 'descarga' || !G.Act.live(o) || o.st !== 'on' || !work.has(o.id) || (v.role === 'estivador' ? o.set !== v.set : o.at !== v.job)) continue;
        const d = S.buildings.get(o.at); if (d && d.type === 'doca' && d.crates && d.crates.some(c => c.op === o.id)) { op = o; break; }
      }
    }
    const k = a.asks.findIndex(q => q.type === 'descarga');
    if (!op) { if (k >= 0) a.asks.splice(k, 1); return; }
    const txt = CALL.descarga(v, { op: op.id }); if (!txt) return;
    if (k >= 0) { a.asks[k].t = S.clock; a.asks[k].txt = txt; } else call(v, { type: 'descarga', op: op.id });
  }
  Po.sleep = function (v) { if (!Po.is(v) || v.sleeping) return false; v.sleeping = true; v.act = ''; v.moving = false; return true; };
  // waking: out of bed, and out of the house by its door if it slept at home
  Po.wake = function (v) { if (!v || !v.sleeping) return; v.sleeping = false; if (v.inside && !indoorOK(v, G.S.avatar)) { const b = G.S.buildings.get(v.inside); if (b) { const d = G.Vg.door(b); v.x = d[0]; v.y = d[1]; } v.inside = 0; Po.setLevel(null); } };
  // the world's step for the incarnation: is the body still the player's?
  Po.update = function (dt) {
    const S = G.S; const a = S.avatar; if (!a) return;
    const v = S.villagers.get(a.id);
    if (!v) { const rec = S.dead.get(a.id); died(rec || cur || { id: a.id, name: '?', x: a.x0, y: a.y0, g: 'm' }, rec ? rec.cause : 'unknown', a); return; }
    cur = v;
    // (something of the world took the body without asking: it goes with it)
    if (v.aboard) { Po.release('forca', 'aboard', true); return; }
    if (v.jail || v.captive) { Po.release('forca', v.jail ? 'jail' : 'escorted', true); return; }
    if (v.held || v.air || v.ug) { Po.release('forca', v.held ? 'held' : v.air ? 'air' : 'ug', true); return; }
    if (!v.task) v.task = mark();
    else if (v.task.type !== 'avatar') { Po.release('forca', v.task.type, true); return; }
    // (indoors: in the rooms of a building whose plan is made, where its plan lets one be — its storey kept with the body —, or
    // asleep in one's own bed; anything else that put the body indoors lets it out at the door)
    if (v.inside && !(v.sleeping && v.inside === v.home) && !indoorOK(v, a)) { const b = S.buildings.get(v.inside); if (b) { const d = G.Vg.door(b); v.x = d[0]; v.y = d[1]; } v.inside = 0; a.lv = null; }
    if (!v.inside && a.lv !== null && a.lv !== undefined && !onPlan(v, a)) a.lv = null; // (out, and off any plan: no storey)
    if (a.use && !useHolds(v, a)) Po.unuse(v); // (out of the building, or its plan made over: the place let go)
    // (on an open ground with no place of it — a game loaded there whose place is gone —: out on the town's ground)
    if (v.inside && !a.use && !v.sleeping) { const B = S.buildings.get(v.inside); if (B && openShell(B)) v.inside = 0; } // (its storey kept: L-550)
    for (let k = a.asks.length - 1; k >= 0; k--) if (S.clock - a.asks[k].t > 90) a.asks.splice(k, 1);
    // (what the hands asked since the last step: done now, in the world's own step, in the order asked — each sees the world
    // the one before left; one asked by a body no longer lived is dropped. Each is answered "not done" until it is done: one
    // that breaks — counted in G.modErr, as any module's error — leaves the rest answered, never a body waiting forever)
    if (queue.length) { const q = queue; queue = []; for (const it of q) it.res = { ok: false, why: '', dropped: 1 }; for (const it of q) { if (it.cancel || it.id !== a.id || S.avatar !== a || !S.villagers.has(v.id)) continue; it.res = it.fn(v) || { ok: true }; } }
    if (S.avatar === a && S.villagers.has(v.id)) { a.via = viaOf(v, a); remember(v); } // (the building the body is by, as the step leaves it; and where it is, kept as the person's own)
    void dt;
  };
  // the death of the body (Village.kill is the only door out of the world: the incarnation follows it at once)
  const kill0 = G.Village.kill;
  G.Village.kill = function (v, cause, byGod) {
    const a = G.S && G.S.avatar; const was = !!(a && v && a.id === v.id);
    const r = kill0.apply(this, arguments);
    if (was && G.S.avatar === a && !G.S.villagers.has(v.id)) died(G.S.dead.get(v.id) || v, cause, a, v.lastBeast);
    return r;
  };
  // what the body witnessed: the chronicle's lines told near it, while it was lived
  const log0 = G.Village.log;
  G.Village.log = function (text, icon, x, y) {
    const S = G.S; const n0 = S ? S.logN : 0;
    const r = log0.apply(this, arguments);
    const a = S && S.avatar; if (!a || S.logN === n0) return r;
    const e = S.history[S.history.length - 1];
    const v = S.villagers.get(a.id);
    if (e && v && Number.isFinite(e.x) && G.dist(e.x, e.y, v.x, v.y) < 30) { a.seen.push({ n: e.n, d: e.d, txt: e.txt }); if (a.seen.length > 20) a.seen.shift(); }
    if (e) for (const f of Po.onLog) f(e, v);
    return r;
  };
  // a deed done in the body (the interactions count them; the biography and the chronicle get them at the end)
  Po.deed = function (kind, n) { const a = G.S.avatar; if (!a) return; a.deeds[kind] = (a.deeds[kind] || 0) + (n === undefined ? 1 : n); };
  // someone met face to face — a word, a sale, a hand lent —, in the world's step: the two remember each other (v.ken, kept
  // with the person: what the screens say of the other from then on — Possess.knows), and one of the place tells where one
  // is, the quarter and the town, as anyone asked would. True the first time in this time in the body (the deed counted).
  // Asked from outside the world's step — a screen — it does nothing: what a person knows is the world's (G.inSim)
  Po.meet = function (id) {
    const S = G.S; const a = S.avatar; if (!a || !id || id === a.id || !G.inSim || !Array.isArray(a.met)) return false;
    const v = S.villagers.get(a.id), o = S.villagers.get(id);
    if (v && o) {
      notePerson(v, o.id); notePerson(o, v.id);
      const q = quarterAt(v.x, v.y); const set = q ? S.settlements.get(q.set) : null;
      if (q && !q.whole && K.district(o, q)) notePlace(v, q.id, 1);
      if (set && K.town(o, set)) notePlace(v, -set.id, 1);
    }
    if (a.met.includes(id)) return false; a.met.push(id); if (a.met.length > 60) a.met.shift(); return true;
  };
  // an act of the world done by the body's hands with someone, face to face — a sale at a stall with who keeps it, a cup
  // served to who asked, a cup asked of who serves, a child handed over (activity.js, where the act is done: Act.commit) —:
  // the two have met
  Po.dealt = function (o) {
    if (!o || !G.S.avatar) return;
    if (o.cust) Po.meet(o.cust); if (o.to) Po.meet(o.to);
    if (o.biz && G.Biz && (o.act === 'comprar' || o.act === 'pechinchar' || o.act === 'aceitarContra')) { const z = G.Biz.get(o.biz); if (z && z.owner) Po.meet(z.owner); }
    if (o.def === 'taverna' && o.act === 'pedir' && G.Taverna && G.Act) { const op = G.Act.get(o.op); const b = op ? G.S.buildings.get(op.at) : null; const k = b ? G.Taverna.keeperOf(b) : null; if (k) Po.meet(k.id); }
  };

  // ------------------------------ who I am, where I am, what is around me ------------------------------
  // (the doors a future adventure asks at: an identity, a place, the stories, the people known, what was seen, the duties)
  const KIN = (me, o) => {
    if (!me || !o) return null; const f = o.g === 'f';
    if (me.mother === o.id || me.father === o.id) return f ? 'mãe' : 'pai';
    if (o.mother === me.id || o.father === me.id) return f ? 'filha' : 'filho';
    if (me.partner === o.id) return f ? 'companheira' : 'companheiro';
    if ((me.mother && me.mother === o.mother) || (me.father && me.father === o.father)) return f ? 'irmã' : 'irmão';
    const gp = [me.mother, me.father].map(id => G.person(id)).filter(Boolean);
    if (gp.some(p => p.mother === o.id || p.father === o.id)) return f ? 'avó' : 'avô';
    if ((o.mother && gp.some(p => p.mother === o.mother && p.id !== o.id) ) || (o.father && gp.some(p => p.father === o.father && p.id !== o.id))) return f ? 'tia' : 'tio';
    return null;
  };
  Po.kin = KIN;
  Po.identity = function (v) {
    const S = G.S; if (!v) return null;
    const born = (v.bio || []).find(e => e[1] === 'born'); const awoke = (v.bio || []).find(e => e[1] === 'awoke');
    const set = S.settlements.get(v.set); const fac = G.Fac.ofV(v); const home = S.buildings.get(v.home);
    return {
      id: v.id, name: v.name, epithet: v.ep && G.Politics ? G.Politics.epithet(v) : '', g: v.g, age: Math.floor(v.age), role: G.roleName(v), traits: v.traits.slice(),
      from: born ? born[4] || null : awoke ? awoke[2] : null, first: !!awoke,
      mother: v.mother || 0, father: v.father || 0, partner: v.partner || 0, kids: (v.kids || []).slice(),
      set: set ? set.name : null, fac: fac ? fac.name : null, civ: fac ? fac.civ : null, home: home ? G.Village.buildName(home) : null,
      ruler: !!(fac && fac.leader === v.id), kills: v.kills || 0, hero: !!v.hero, lost: v.lost || null,
    };
  };
  Po.where = function (v) {
    const S = G.S; if (!v) return null;
    let set = null, sd = 1e9; for (const s of S.settlements.values()) { const d = G.dist(s.cx, s.cy, v.x, v.y); if (d < sd) { sd = d; set = s; } }
    const i = W.idx(v.x, v.y); const dist = G.Urban && G.Urban.districtAt ? G.Urban.districtAt(v.x, v.y) : null;
    const T = G.T; const t = S.type[i];
    const ground = S.road[i] ? (S.type[i] === T.RIVER ? 'ponte' : 'estrada') : t === T.RIVER ? 'rio' : t <= T.SEA && !(S.dry && S.dry[i]) ? 'mar' : t === T.SAND ? 'areia' : S.treeAt[i] ? 'bosque' : S.cliff[i] ? 'penhasco' : 'campo';
    const town = set && sd < 6 + Math.sqrt(G.Village.pop(set.id)) * 1.2 ? set : null;
    // (the place as the world has it — the god's truth; what the person can tell of it is Possess.knows.where)
    return { x: +v.x.toFixed(2), y: +v.y.toFixed(2), tile: i, town: town ? town.name : null, near: set ? set.name : null, nearD: Math.round(sd), setId: set ? set.id : 0, district: dist ? dist.name : null, biome: G.Biome && G.Biome.nameAt ? G.Biome.nameAt(v.x, v.y) : null, ground, h: +W.groundH(v.x, v.y).toFixed(2) };
  };
  Po.context = function () {
    const S = G.S; const a = S.avatar; const v = Po.body(); if (!a || !v) return null;
    const around = []; for (const o of S.villagers.values()) if (o.id !== v.id && !o.inside && G.dist2(o.x, o.y, v.x, v.y) < 100) around.push(o.id);
    // (the stories the person knows they are in: their own — the ones they lead. The one who is sought, mourned or plotted
    // against in someone else's does not read it here: D-172)
    const stories = G.Stories ? G.Stories.of(v.id).filter(s => s.protag === v.id).map(s => ({ id: s.id, title: s.title, type: s.type, protag: true })) : [];
    return {
      who: Po.identity(v), where: K.where(v), kind: a.kind, caps: Po.caps(v),
      stories, knows: { family: [v.mother, v.father, v.partner, ...(v.kids || [])].filter(Boolean), met: a.met.slice(), people: v.ken ? v.ken.p.slice() : [], places: v.ken ? v.ken.q.map(e => e.slice()) : [] },
      witnessed: a.seen.slice(), goals: a.asks.map(q => ({ type: q.type, txt: q.txt })), around, deeds: Object.assign({}, a.deeds), since: a.since,
    };
  };

  // ------------------------------ what the character knows ------------------------------
  // The screens of the body say only what the person lived could say (Bairros Vivos; D-170 to D-172): the name of a quarter
  // they live or work in, were in before or were told of; the name of someone of their blood, house, street or trade, of the
  // fame of their people, or met face to face; the coins and the stores of their own house and of no other. All of it read
  // from the life the world already keeps — the family, the home, the trade, the biography, what the peoples know of one
  // another — and from one small record of what the person lived in the god's hands, v.ken: p, whom they met (ids, the
  // newest last); q, the quarters and the towns their feet were in ([key, the day they first were, 1 once someone of the
  // place said its name] — a quarter by its id, a town by minus its id). Only this file writes it, in the world's step
  // (Po.meet, remember), and nothing of the world decides by it: it is what a screen asks before it says a name. Asked with
  // no one, every door answers as the god: everything. Every door here only reads.
  const K = Po.knows = { P_MAX: 40, Q_MAX: 16, NEAR: 6, SMALL: 2 }; // (people and places kept; a neighbour's door, in tiles; the rank up to which a town is small — the vila)
  const god = v => !v || !v.id;
  const kenOf = v => v.ken || (v.ken = { p: [], q: [] });
  const midOf = b => [b.x + (b.w || 1) / 2, b.y + (b.h || 1) / 2];
  const quarterAt = (x, y) => (G.Urban && G.Urban.at && W.inb(x, y) ? G.Urban.at(x, y) : null);
  const quarterOf = b => (b ? quarterAt(...midOf(b)) : null);
  K.keyOf = q => (q.whole ? -q.set : q.id);
  function notePerson(v, id) { const k = kenOf(v); if (k.p.includes(id)) return; k.p.push(id); if (k.p.length > K.P_MAX) k.p.shift(); }
  function notePlace(v, key, told) {
    const k = kenOf(v); let e = null; for (const x of k.q) if (x[0] === key) { e = x; break; }
    if (!e) { e = [key, G.S.day, 0]; k.q.push(e); if (k.q.length > K.Q_MAX) k.q.shift(); }
    if (told) e[2] = 1;
  }
  // where the body's feet are, and where its house and its work stand, kept as the person's own — each step of the world lived
  // (one knows where one lives and works: told; a quarter lived in stays known after the family moves; the feet in a quarter
  // of a city are in that city)
  function remember(v) {
    const S = G.S; const here = quarterAt(v.x, v.y); if (here) { notePlace(v, K.keyOf(here), 0); if (!here.whole) notePlace(v, -here.set, 0); }
    for (const id of [v.home, v.job]) { const q = id ? quarterOf(S.buildings.get(id)) : null; if (q) notePlace(v, K.keyOf(q), 1); }
  }
  // (a place of the record: 2 — its name was said by one of it; 1 — the feet were there on a day before today; 0 — not known)
  const beenIn = (v, key) => { const k = v.ken; if (k) for (const e of k.q) if (e[0] === key) return e[2] ? 2 : e[1] < G.S.day ? 1 : 0; return 0; };
  // (two peoples that have met — read from the record, never asked of G.Fac.rel, which makes the record of a relation that
  // is not there yet: a screen would write the world)
  const facMet = (a, b) => { if (!a || !b) return false; if (a === b) return true; const A = G.Fac.get(a); const r = A && A.rel ? A.rel[b] : null; return !!(r && r.met); };
  // a town, by its name: one's own, one's people's, one the feet were in before or a local named, one lived in (the
  // biography), or one of a people one's own has met (heard of) — '' when the person cannot name it, else how they can
  K.town = function (v, set) {
    if (god(v)) return 'deus'; if (!set) return '';
    if (v.set === set.id) return 'mora';
    const fid = G.Fac.idOfV(v); if (fid && fid === set.fac) return 'povo';
    const b = beenIn(v, -set.id); if (b) return b === 2 ? 'contaram' : 'esteve';
    if ((v.bio || []).some(e => (e[1] === 'born' && e[4] === set.name) || ((e[1] === 'arrived' || e[1] === 'moved' || e[1] === 'awoke') && e[2] === set.name))) return 'viveu';
    return facMet(fid, set.fac) ? 'ouviu' : '';
  };
  // a quarter, by its name (D-171): in a small town of one's own, all of it; in a city of one's own, the quarter one lives in,
  // the one one works in, its old heart — where everyone goes —, and the ones the family lives or works in (told of at home);
  // anywhere, one the feet were in on a day before today, or one a local named. A town's whole ground is the town
  K.district = function (v, q) {
    if (god(v)) return 'deus'; if (!q) return '';
    const S = G.S; const set = S.settlements.get(q.set); if (!set) return '';
    if (q.whole) return K.town(v, set);
    if (v.set === set.id) {
      if ((set.tier || 0) <= K.SMALL) return 'povoado';
      const at = id => { const b = id ? S.buildings.get(id) : null; return !!b && quarterOf(b) === q; };
      if (at(v.home)) return 'mora'; if (at(v.job)) return 'trabalha';
      if (q.k === 'centro') return 'centro';
      for (const id of [v.mother, v.father, v.partner].concat(v.kids || [])) { const p = id ? S.villagers.get(id) : null; if (p && p.set === set.id && (at(p.home) || at(p.job))) return 'família'; }
    }
    const b = beenIn(v, q.id); return b === 2 ? 'contaram' : b === 1 ? 'esteve' : '';
  };
  // a person (D-172): 2 — of the blood and of the house: everything of them; 1 — by name: of the same trade's roof, of the
  // same street, of one's own life (the biography: who one joined, lost, learned from), met face to face, of the fame of
  // one's people (who rules it, its heroes, who has a byname), of one's own small town; 0 — a stranger: what the eyes see
  const BIO_WHO = { couple: 2, child: 2, lost: 2, appr: 3, story: 2 };
  const lived = (v, o) => (v.bio || []).some(e => BIO_WHO[e[1]] && e[BIO_WHO[e[1]]] === o.id);
  K.how = function (v, o) {
    if (god(v)) return { n: 2, why: 'deus' }; if (!o) return { n: 0, why: '' };
    if (v.id === o.id) return { n: 2, why: 'eu' };
    if (KIN(v, o) || KIN(o, v) || (v.widow && v.widow === o.id) || (o.widow && o.widow === v.id)) return { n: 2, why: 'família' };
    if (v.home && v.home === o.home) return { n: 2, why: 'casa' };
    if (v.job && v.job === o.job) return { n: 1, why: 'ofício' };
    const S = G.S; const hv = v.home ? S.buildings.get(v.home) : null, ho = o.home ? S.buildings.get(o.home) : null;
    if (hv && ho && v.set === o.set && G.dist(...midOf(hv), ...midOf(ho)) <= K.NEAR) return { n: 1, why: 'vizinhança' };
    if (lived(v, o) || lived(o, v)) return { n: 1, why: 'vida' };
    if (v.ken && v.ken.p.includes(o.id)) return { n: 1, why: 'encontro' };
    const fv = G.Fac.idOfV(v), F = fv ? G.Fac.get(fv) : null;
    if (fv && fv === G.Fac.idOfV(o) && ((F && F.leader === o.id) || o.hero || o.ep)) return { n: 1, why: 'fama' };
    const set = v.set && v.set === o.set ? S.settlements.get(v.set) : null;
    if (set && (set.tier || 0) <= K.SMALL) return { n: 1, why: 'povoado' };
    return { n: 0, why: '' };
  };
  K.person = (v, o) => K.how(v, o).n;
  K.WHY = { família: 'da família', casa: 'da sua casa', ofício: 'do mesmo ofício', vizinhança: 'da vizinhança', vida: 'da sua vida', encontro: 'de conversa', fama: 'pela fama', povoado: 'do povoado' };
  // what the eyes see of someone: the trade by the clothes, the age, the sex, the people by its looks — never the name
  K.looks = function (o, v) {
    const f = o.g === 'f'; let w = o.age < 2 ? 'bebê' : o.age < 12 ? (f ? 'menina' : 'menino') : o.age < 16 ? (f ? 'moça' : 'rapaz') : G.roleName(o).toLowerCase();
    // (of another people: by theirs, when the two have met — «um mercador egípcio» —, else a foreigner)
    if (!god(v)) {
      const fv = G.Fac.idOfV(v), fo = G.Fac.idOfV(o);
      if (fv && fo && fv !== fo) { const C = G.CIVS[G.Fac.civOfV(o)], F = G.Fac.get(fo); w += !facMet(fv, fo) ? (f ? ' estrangeira' : ' estrangeiro') : C && C.id !== G.Fac.civOfV(v) ? ' ' + C.sing[f ? 1 : 0].toLowerCase() : F ? ' de ' + F.name : ''; }
    }
    return { w, um: (f ? 'uma ' : 'um ') + w, o: (f ? 'a ' : 'o ') + w };
  };
  // how the person says another: alone — over a head, at the top of a card — and within a sentence
  K.name = (v, o) => (K.person(v, o) ? o.name : G.cap(K.looks(o, v).um));
  K.call = (v, o) => (K.person(v, o) ? o.name : K.looks(o, v).o);
  // the coins and the stores of a house: one's own, and no other (what a stall shows — its goods, its prices — is the stall's
  // to show: G.Act.offers); the stock of a people: one's own people's
  K.house = (v, b) => god(v) || (!!b && !!v.home && v.home === b.id && G.S.buildings.get(b.id) === b);
  K.stock = (v, b) => god(v) || (!!b && G.Fac.idOfV(v) === G.Village.facOfSet(b.set));
  // what is seen of a quarter by someone who cannot name it: what happens there (its profiles, the life of the quarter —
  // G.Urban), what is built there (its vocation), what stands around the feet — «ruas de oficinas, cheiro de forno»
  const SEEN_TAG = { porto: 'cais cheio de caixas e de carga', pesqueiro: 'redes e peixe à beira da água', mercado: 'bancas e fregueses', oficinas: 'ruas de oficinas, cheiro de forno', minas: 'poeira de pedra e minério', campo: 'lavouras em volta', quartel: 'soldados em treino', sagrado: 'gente rezando', letrado: 'gente de rolos e letras', boemio: 'tavernas cheias', termal: 'gente indo e vindo dos banhos', perigoso: 'ruas onde é melhor andar atento', nobre: 'casas grandes e ricas', pobre: 'casas pobres', vazio: 'casas vazias', decadencia: 'ruas que já viram dias melhores' };
  const SEEN_KIND = { centro: 'o coração antigo de uma cidade', mercantil: 'ruas de comércio', nobre: 'casas grandes de pedra', popular: 'ruas de casas simples', artesao: 'ruas de oficinas', porto: 'um cais', militar: 'um quartel e seus muros', templo: 'ruas em volta de um templo', agrario: 'campos cultivados' };
  const SEEN_STILL = { porto: 'um cais parado', artesao: 'oficinas frias', mercantil: 'bancas sem fregueses', militar: 'um quartel quieto', templo: 'um templo quieto', agrario: 'campos parados' };
  const SEEN_TOWN = ['um acampamento', 'uma aldeia', 'uma vila', 'uma cidade', 'uma cidade grande', 'uma cidade imensa'];
  // (the profile that is the vocation's own doing: with it said, the vocation need not be)
  const SEEN_OWN = { porto: ['porto', 'pesqueiro'], artesao: ['oficinas', 'minas'], mercantil: ['mercado'], militar: ['quartel'], templo: ['sagrado'], agrario: ['campo'], nobre: ['nobre'], popular: ['pobre'] };
  // (what stands within a few strides, the most telling first)
  const SEEN_B = [['doca', 'um cais'], ['salga', 'peixe secando ao sol'], ['forja', 'uma forja'], ['olaria', 'um forno de oleiro'], ['tecelagem', 'teares'], ['mina', 'uma mina'], ['quartel', 'um quartel'], ['temple', 'um templo'], ['maravilha', 'um templo imenso'], ['mercado', 'bancas'], ['feira', 'bancas'], ['taverna', 'uma taverna'], ['palacio', 'um palácio'], ['paco', 'um paço'], ['curral', 'currais'], ['vinhedo', 'vinhas'], ['pomar', 'pomares'], ['plantacao', 'roças'], ['farm', 'roças'], ['armazem', 'armazéns'], ['campfire', 'uma fogueira']];
  K.AROUND = 7;
  function around(x, y) {
    const has = {}; for (const b of G.S.buildings.values()) if (b.built && b.x <= x + K.AROUND && b.x + (b.w || 1) >= x - K.AROUND && b.y <= y + K.AROUND && b.y + (b.h || 1) >= y - K.AROUND) has[b.type] = 1;
    const out = []; for (const [t, w] of SEEN_B) if (has[t] && !out.includes(w)) out.push(w); return out;
  }
  K.seen = function (q, x, y) {
    if (!q) return ''; const tags = q.tags || [];
    const said = tags.filter(id => SEEN_TAG[id]).map(id => SEEN_TAG[id]);
    const near = x === undefined ? [] : around(x, y);
    if (q.whole) { const set = G.S.settlements.get(q.set); const more = said.concat(near).slice(0, 2); return SEEN_TOWN[Math.min(5, (set && set.tier) || 0)] + (more.length ? ': ' + more.join(', ') : ''); }
    const head = tags.includes('parado') && SEEN_STILL[q.k] ? SEEN_STILL[q.k] : (SEEN_OWN[q.k] || []).some(id => tags.includes(id)) ? null : SEEN_KIND[q.k] || 'ruas de uma cidade';
    const out = (head ? [head] : []).concat(said); if (out.length < 2) for (const w of near) { if (out.length >= 2) break; if (!out.some(s => s.includes(w.replace(/^uma? /, '')))) out.push(w); }
    return out.slice(0, 2).join(', ');
  };
  // where one is, as the person can say it — the line of the screen (txt): the quarter and the town by their names when they
  // know them, else what is seen there; the names they cannot say are not in it (district, town, near: null)
  const GROUND = { estrada: 'Na estrada', ponte: 'Na ponte', bosque: 'No bosque', mar: 'No mar', rio: 'Na água' };
  K.where = function (v) {
    const w = Po.where(v); if (!w) return null; const S = G.S;
    const q = quarterAt(v.x, v.y); const dq = q && !q.whole ? q : null;
    // (the town one is in: the one whose ground this is — a quarter's, a town's whole —, else the nearest when within it; two
    // towns side by side, the ground says which)
    const near = w.setId ? S.settlements.get(w.setId) : null; const set = (q && S.settlements.get(q.set)) || (w.town ? near : null);
    const kt = set ? K.town(v, set) : '', tn = set && kt ? set.name : null, nn = near && K.town(v, near) ? near.name : null;
    let kd = '', seen = '', txt;
    if (dq) { kd = K.district(v, dq); if (!kd) seen = K.seen(dq, v.x, v.y); txt = kd ? dq.name + (tn ? ', ' + tn : '') : G.cap(seen) + (tn ? ' — ' + tn : ''); }
    else if (set) { if (!tn) seen = K.seen(q && q.whole ? q : { whole: 1, set: set.id }, v.x, v.y); txt = tn || G.cap(seen); }
    else if (near) txt = `${GROUND[w.ground] || 'No campo'}, ${w.nearD > 2 ? w.nearD * 4 + ' m de ' : 'perto de '}${nn || 'um povoado'}`;
    else txt = 'Terras selvagens';
    return Object.assign(w, { district: kd && dq ? dq.name : null, town: tn, near: nn, txt, seen, knows: { district: kd, town: kt } });
  };
  // a line of the chronicle told far from the body: it reaches the ears when it is of no place, or of a town the person can
  // name — their own, their people's, one of a people theirs has met; the rest is beyond what they could have heard
  K.hears = function (v, e) {
    if (god(v) || !e || !Number.isFinite(e.x)) return true;
    let set = null, sd = 1e9; for (const s of G.S.settlements.values()) { const d = G.dist(s.cx, s.cy, e.x, e.y); if (d < sd) { sd = d; set = s; } }
    return !set || !!K.town(v, set);
  };
  // (a record that came back from a save: only what it can hold — a damaged one is mended, never trusted)
  function mendKen(v) {
    const k = v.ken; if (k === undefined) return; if (!k || typeof k !== 'object') { v.ken = undefined; return; }
    const p = [], q = []; const top = Number.isFinite(G.S.nextId) ? G.S.nextId : Infinity;
    if (Array.isArray(k.p)) for (const id of k.p) if (Number.isInteger(id) && id > 0 && id < top && id !== v.id && !p.includes(id)) p.push(id);
    if (Array.isArray(k.q)) for (const e of k.q) if (Array.isArray(e) && Number.isInteger(e[0]) && e[0] !== 0 && Number.isFinite(e[1]) && !q.some(x => x[0] === e[0])) q.push([e[0], Math.min(e[1], G.S.day), e[2] ? 1 : 0]);
    v.ken = { p: p.slice(-K.P_MAX), q: q.slice(-K.Q_MAX) };
  }

  // ------------------------------ words ------------------------------
  const tt0 = G.Vg.taskText;
  G.Vg.taskText = function (v) { return v.task && v.task.type === 'avatar' ? (v.sleeping ? 'Dormindo — guiad' + oa(v) + ' pelo deus' : 'Vivid' + oa(v) + ' pelo deus (Modo Encarnado)') : tt0(v); };
  const DEED = { abraco: ['deu', 'abraço', 'abraços'], consolo: ['consolou', 'pessoa de luto', 'pessoas de luto'], danca: ['dançou', 'vez', 'vezes'], pesca: ['pescou com as mãos', 'peixe', 'peixes'], escalada: ['escalou', 'pedra ou barranco', 'pedras e barrancos'], ouro: ['catou', 'moeda de ouro do chão', 'moedas de ouro do chão'], carinho: ['fez carinho em', 'bicho', 'bichos'], agua: ['bebeu água de', 'rio', 'rios'], aceno: ['acenou', 'vez', 'vezes'], conversa: ['conversou com', 'pessoa', 'pessoas'], lenha: ['cortou', 'árvore', 'árvores'], pedra: ['quebrou', 'pedra', 'pedras'], frutas: ['colheu', 'punhado de frutas', 'punhados de frutas'], entrega: ['levou ao armazém', 'carga', 'cargas'], refeicao: ['fez', 'refeição', 'refeições'], sono: ['dormiu', 'noite', 'noites'], exame: ['examinou', 'coisa', 'coisas'], porta: ['bateu em', 'porta', 'portas'], reza: ['rezou', 'vez no templo', 'vezes no templo'], obra: ['levou às obras', 'carga de material', 'cargas de material'], cozinha: ['cozinhou', 'ceia da casa', 'ceias da casa'] };
  Po.DEED = DEED;
  if (G.Life) {
    const bl0 = G.Life.bioLine;
    G.Life.bioLine = function (v, e) {
      if (e[1] !== 'god') return bl0(v, e);
      const days = e[2] || 0; const parts = String(e[3] || '').split('|').filter(Boolean).map(p => { const [k, n] = p.split(':'); const D = DEED[k]; return D ? `${D[0]} ${n} ${+n === 1 ? D[1] : D[2]}` : null; }).filter(Boolean);
      const head = e[4] ? `Morreu com o deus vivendo em seu corpo` : `Viveu ${days >= 1 ? days + (days > 1 ? ' dias' : ' dia') : 'um tempo'} guiad${oa(v)} pelo deus`;
      return head + (parts.length ? ': ' + parts.join(', ') : '') + '.';
    };
  }

  // ------------------------------ save ------------------------------
  const num = (x, d) => (Number.isFinite(x) ? x : d);
  G.saveHooks.push({
    save(out) {
      const a = G.S.avatar; if (!a) return;
      out.avatar = { id: a.id, kind: a.kind, since: a.since, t0: a.t0, x0: a.x0, y0: a.y0, asks: a.asks.slice(-6), deeds: Object.assign({}, a.deeds), seen: a.seen.slice(-20), met: a.met.slice(-60), lv: Number.isFinite(a.lv) ? a.lv : null, via: a.via || 0, use: a.use ? Object.assign({}, a.use) : null };
      // (the body in a room of a building's plan: where it is in it — the save lets everyone else out at the door)
      const v = G.S.villagers.get(a.id); if (v && v.inside && indoorOK(v, a)) out.avatar.in = { b: v.inside, x: +v.x.toFixed(4), y: +v.y.toFixed(4), sleeping: v.sleeping ? 1 : 0 };
    },
    load(o) {
      const S = G.S; S.avatar = null; cur = null;
      for (const p of S.villagers.values()) mendKen(p); // (what each one knows came back with them: the person's own, in the person)
      const a = o.avatar; if (!a || typeof a !== 'object') return;
      const v = S.villagers.get(a.id);
      // (a body that is gone, or in no state to be lived, is not taken back: the save simply opens in the god's eyes — one saved
      // a step into a room of the building it came in by stands there: L-175)
      const via = Number.isFinite(a.via) && S.buildings.has(a.via) ? a.via : 0;
      if (!v || !Po.can(v, true, via).ok) return;
      const deeds = {}; if (a.deeds && typeof a.deeds === 'object') for (const k in a.deeds) if (DEED[k] && Number.isFinite(a.deeds[k])) deeds[k] = a.deeds[k];
      S.avatar = {
        id: v.id, kind: KINDS[a.kind] ? a.kind : 'humano', since: num(a.since, S.day), t0: num(a.t0, S.clock), x0: num(a.x0, v.x), y0: num(a.y0, v.y),
        asks: Array.isArray(a.asks) ? a.asks.filter(q => q && typeof q.txt === 'string').map(q => ({ type: String(q.type), txt: q.txt, t: num(q.t, S.clock), t0: num(q.t0, S.clock), n: num(q.n, 1) })) : [],
        deeds, seen: Array.isArray(a.seen) ? a.seen.filter(e => e && typeof e.txt === 'string') : [], met: Array.isArray(a.met) ? a.met.filter(Number.isFinite) : [],
        lv: Number.isFinite(a.lv) ? a.lv : null, via, use: null,
      };
      // (saved in a room of a building's plan: back in it, where it was — the world's step checks it stands where the plan lets it)
      { const I = a.in, B = I && Number.isFinite(I.b) && S.buildings.get(I.b);
        if (B && G.Interiors && G.Interiors.has(B) && Number.isFinite(I.x) && Number.isFinite(I.y) && Number.isFinite(S.avatar.lv) && Math.abs(I.x - (B.x + B.w / 2)) < B.w && Math.abs(I.y - (B.y + B.h / 2)) < B.h) { v.inside = B.id; v.x = I.x; v.y = I.y; }
        else { v.inside = 0; S.avatar.lv = null; } }
      // (the place its hands held, held again — while it is in that building and the plan is the same; else let go, on its feet)
      { const u = a.use; if (u && typeof u === 'object' && Number.isFinite(u.b) && typeof u.it === 'string' && Number.isFinite(u.q) && typeof u.use === 'string' && typeof u.key === 'string') { S.avatar.use = { b: u.b, it: u.it, q: u.q, use: u.use, st: typeof u.st === 'string' ? u.st : '', key: u.key, t0: num(u.t0, S.clock) }; if (!useHolds(v, S.avatar)) S.avatar.use = null; } }
      // (saved asleep — in a room of a building's plan, its own house or another the world's step lets it lie in, or out in the
      // street, «Dormir aqui» —: asleep again where it lay, as anyone of the world sleeps on through a save (D-073); it wakes by
      // its own rule, Po.live. A body the save let out at the door of a building whose rooms it was not in stands there. It woke
      // in the load anywhere but in its own bed, L-399 — the P1's l13 and l19 of qa/lar.js)
      v.task = mark(); v.sleeping = a.in ? !!(a.in.sleeping && v.inside) : !!v.sleeping; v.path = null; S.avatar.via = viaOf(v, S.avatar);
      if (!v.inside && !W.walkableXY(v.x, v.y) && !onPlan(v, S.avatar)) v.task.afloat = 1; // (saved swimming: it swims on — on a doorstep it stands)
      cur = v;
    },
  });
})(window.G);
