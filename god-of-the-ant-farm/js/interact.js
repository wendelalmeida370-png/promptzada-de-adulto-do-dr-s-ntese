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
  I.add = function (p) { I.list = I.list.filter(q => q.id !== p.id); I.list.push(p); I.list.sort((a, b) => b.prio - a.prio); };
  const L = () => G.Space.TILE;
  const tile = (X, Z) => [X / L(), Z / L()];
  // the body's context: who, where (metres), which way it faces
  I.ctx = function () {
    const v = G.Possess.body(); const p = G.Avatar.pos(); if (!v || !p) return null;
    return { v, X: p.X, Y: p.Y, Z: p.Z, yaw: p.yaw, x: p.X / L(), y: p.Z / L() };
  };
  // how good a target is: near, and in front of the body
  function score(ctx, X, Z, reach) {
    const dx = X - ctx.X, dz = Z - ctx.Z; const d = Math.hypot(dx, dz); if (d > reach) return -1;
    const ang = Math.abs(Math.atan2(Math.sin(Math.atan2(dz, dx) - ctx.yaw), Math.cos(Math.atan2(dz, dx) - ctx.yaw)));
    if (d > 1.1 && ang > 1.6) return -1; // (behind the back: not what one means)
    return (reach - d) / reach * 2 + (1 - ang / Math.PI);
  }
  // the best thing to do right now (what the prompt shows: "E — …")
  I.best = function () {
    const ctx = I.ctx(); if (!ctx || G.Avatar.swimming()) return null; // (the hands are swimming)
    let best = null, bs = -1;
    for (const p of I.list) {
      for (const t of p.find(ctx)) {
        const s = score(ctx, t.X, t.Z, p.reach) ; if (s < 0) continue;
        const sc = s + p.prio * 0.6 + (t.pref || 0); // (pref: a target meant more, or less, than the others in the same reach)
        if (sc > bs) { bs = sc; best = { p, t }; }
      }
    }
    if (!best) return null;
    const c = best.p.can(ctx, best.t);
    return { id: best.p.id, t: best.t, label: best.p.label(ctx, best.t), ok: c.ok, why: c.why || '', p: best.p };
  };
  // doing it: checked again at the moment of doing (the world moves between seeing and doing)
  I.run = function (choice) {
    const ctx = I.ctx(); if (!ctx || !choice || G.Avatar.busy() || G.Avatar.swimming()) return null;
    const p = choice.p || I.list.find(q => q.id === choice.id); if (!p) return null;
    const t = choice.t;
    if (score(ctx, t.X, t.Z, p.reach + 0.6) < 0) return { ok: false, msg: 'Longe demais.' };
    const c = p.can(ctx, t); if (!c.ok) return { ok: false, msg: c.why };
    const r = p.run(ctx, t) || { ok: true };
    // (the stories hear of the deed in the world's own step, as of everything the world does)
    { const sig = { id: ctx.v.id, what: p.id, x: ctx.x, y: ctx.y, set: ctx.v.set }; G.Possess.apply(() => { G.Stories && G.Stories.signal('avatarDeed', sig); return { ok: true }; }); }
    return r;
  };
  const face = (ctx, X, Z) => Math.atan2(Z - ctx.Z, X - ctx.X);
  // The hands of the body change the world as anyone's do: what an act does is asked at its contact and done by the world in
  // its own step (Avatar.act's op, through Possess.apply), and it lasts the world seconds the same work lasts for anyone of the
  // world — the woodcutter's stroke and the dt × workMul it adds to the tree, the quarryman's load of stone in 3.8 s, a load of
  // berries in 2.2 s, a meal at the store in 1.6 s, a prayer at the temple in 5 s (villagers.js), a try of the hands in the
  // shallows slower than the fisher's line (5 to 9 s for one to three fish), a lift and a setting down in the docker's own
  // gestures (G.Act.ANIM): the player's presence gives no work for free. Only the hands' own gestures — a word, a wave, a hug's
  // arms — keep the body's own seconds
  const WT = { chop: 0.55, mine: 0.6, mineLoad: 3.8, gather: 2.2, eat: 1.6, pray: 5, fish: 2.2 };
  I.WT = WT;
  // (the gestures of the hands as the world's people make them — seconds of the world, the contact where the world passes the
  // thing: C1's Act.ANIM —, for the body too: it never lifts a load faster than the docker)
  const AN = k => (G.Act && G.Act.ANIM && G.Act.ANIM[k]) || { act: 'lift', dur: 1, contact: 0.6 };
  const wm = v => G.Vg.workMul(v);
  // (the body's own count of the work at a rock, as the quarryman keeps his in his errand — nothing of the world, nothing saved)
  let mineW = null; G.worldHooks.push(() => { mineW = null; });
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
  // (the point where a load in the hands goes down: before the feet where they stand when the hands go, toward X, Z)
  const putAt = (v, X, Z) => a => { if (!a.P) { const H = G.People3D && G.People3D.look(v).held; a.P = toward(G.Avatar.pos(), X, Z, (H ? H.size[1] / 2 : 0.15) + 0.02); } return a.P; };
  // (a word the world says back to the hands: shown when the world has answered)
  const say = (txt, d) => { if (txt && G.IncUI && G.IncUI.toast) G.IncUI.toast(txt, d || 2.4); };
  const deny = r => { if (r && r.why) say(r.why); G.Audio && G.Audio.play && G.Audio.play('deny'); };
  // (a deed that only says what was done — a look, a knock: counted by the world in its step)
  const deed = (k, n) => G.Possess.apply(() => { G.Possess.deed(k, n); return { ok: true }; });

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
  // the card of a person: who they are, from the world's records only
  I.personCard = function (o, me) {
    const S = G.S; const id = G.Possess.identity(o); const L1 = G.Life ? G.Life.bioList(o).slice(-6).reverse() : [];
    const nm = x => { const p = x && G.person(x); return p ? p.name + (p.dead ? ' (†)' : '') : null; };
    const st = G.Stories ? G.Stories.of(o.id).map(s => s.title).filter(Boolean).slice(0, 3) : [];
    return {
      kind: 'person', id: o.id, name: id.name + (id.epithet ? ', ' + id.epithet : ''), sub: `${id.age} ${id.age === 1 ? 'ano' : 'anos'} · ${id.role}`,
      kin: me ? G.Possess.kin(me, o) : null, from: id.from, first: id.first, set: id.set, fac: id.fac, home: id.home,
      parents: [nm(id.mother), nm(id.father)].filter(Boolean), partner: nm(id.partner), kids: id.kids.map(nm).filter(Boolean),
      traits: id.traits, doing: G.Vg.taskText(o), bio: L1.map(e => ({ age: e.age, txt: e.txt })), stories: st, ruler: id.ruler, kills: id.kills,
      hp: Math.round(o.hp), hunger: Math.round(o.hunger), energy: Math.round(o.energy),
    };
  };
  I.add({
    id: 'pessoa', prio: 5, reach: 3.2,
    find(ctx) {
      const out = []; const S = G.S; const R = 3.6 / L();
      for (const o of S.villagers.values()) {
        if (o.id === ctx.v.id || o.inside || o.aboard || o.held || o.air || o.ug || (o.age < 2 && o.carried)) continue;
        if (Math.abs(o.x - ctx.x) > R || Math.abs(o.y - ctx.y) > R) continue;
        out.push({ o, X: o.x * L(), Z: o.y * L() });
      }
      return out;
    },
    label(ctx, t) { const k = G.Possess.kin(ctx.v, t.o); return k ? `Conversar com ${k === 'mãe' || k === 'filha' || k === 'irmã' || k === 'avó' || k === 'tia' || k === 'companheira' ? 'sua' : 'seu'} ${k}, ${t.o.name}` : `Conversar com ${t.o.name}`; },
    can(ctx, t) {
      const o = t.o; if (!G.S.villagers.has(o.id)) return { ok: false, why: 'Não está mais aqui.' };
      if (o.sleeping) return { ok: false, why: `${o.name} está dormindo.` };
      if (o.age < 2) return { ok: false, why: `${o.name} ainda é um bebê.` };
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
        G.faceTo(o, me.x - o.x, me.y - o.y);
        if (txt && (!o.task || o.task.pri <= 1)) G.Vg.setTask(o, { type: 'talk', id: me.id, pri: 0.9, wait: 5 * G.Space.TIME, kind: 'talk' });
        if (txt && G.Talk) G.Talk.say(o, txt, { dur: 4 });
        if (G.Possess.kin(me, o)) G.Vg.emote(o, 'heart', 2);
        if (G.Possess.meet(o.id)) G.Possess.deed('conversa');
        return { ok: true };
      });
      G.Avatar.act({ anim: 'talk', dur: 1.4, lock: false, face: face(ctx, t.X, t.Z) });
      return { ok: true, card: I.personCard(o, me), said: txt };
    },
  });

  // a hug: for one's own (the family, the partner) and for anyone in mourning — offered on their card, after a word.
  // The other stops and holds the body too (their talk, with the arms); a grieving one is comforted: the mourning eases
  I.canHug = function (me, o) {
    if (!me || !o || !G.S.villagers.has(o.id) || o.id === me.id) return { ok: false, why: 'Não está mais aqui.' };
    const k = G.Possess.kin(me, o); const grief = o.mourn > 0;
    if (!k && !grief) return { ok: false, why: '' };
    const label = grief && !k ? `Consolar ${o.name}` : `Abraçar ${o.name}`;
    if (o.sleeping) return { ok: false, label, why: `${o.name} está dormindo.` };
    if (o.inside || o.aboard || o.held || o.air || o.jail || o.age < 2) return { ok: false, label, why: `Não dá para abraçar ${o.name} agora.` };
    if (o.fear > 60) return { ok: false, label, why: `${o.name} está assustad${oa(o)} demais.` };
    if (o.task && o.task.pri > 1) return { ok: false, label, why: `${o.name} está ocupad${oa(o)} com algo que não pode esperar.` };
    if (G.dist(me.x, me.y, o.x, o.y) * L() > 3.8) return { ok: false, label, why: 'Longe demais.' };
    if (G.Avatar.swimming()) return { ok: false, label, why: 'Agora não dá.' };
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
        return { ok: true };
      } });
    // (what is said of it is said once the one hugged has answered: ask, for the card that asked)
    return { ok: true, ask, msg: c.grief ? `Você abraça ${o.name}, que chora no seu ombro.` : `Você abraça ${o.name}.`, said };
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

  // ============================== buildings: doors, the store, the temple ==============================
  // (the people's stores are where the world's people bring their loads and eat: every drop-off — storehouse, barn, dock,
  // harbour store, the first camp's fire — one rule for them and for the body)
  const isStore = b => !!(G.BDEF[b.type] && G.BDEF[b.type].dropoff);
  const AT = { campfire: 'junto à fogueira', doca: 'na doca', celeiro: 'no celeiro' };
  const at = b => AT[b.type] || 'no armazém';
  I.add({
    id: 'porta', prio: 4, reach: 2.6,
    find(ctx) {
      const out = []; const S = G.S;
      // (the store a crate of an unloading goes to takes it by the unloading's own act — the docker's gesture, the docker's pay —:
      // its door is that act's, not this one's)
      const wl = workLoad(ctx.v.carry); const dest = wl ? G.Possess.storeOf(wl) : null;
      for (const b of S.buildings.values()) {
        if (b.x > ctx.x + 6 || b.x + b.w < ctx.x - 6 || b.y > ctx.y + 6 || b.y + b.h < ctx.y - 6) continue;
        if (b.type === 'ruin' || b.type === 'farm' || b.type === 'horta' || b.type === 'plantacao' || b.type === 'vinhedo' || b === dest) continue;
        const d = G.Vg.door(b); out.push({ b, X: d[0] * L(), Z: d[1] * L() });
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
      const def = G.BDEF[b.type]; if (def && def.housing && b.id !== v.home) { deed('porta'); G.Avatar.act({ anim: 'interact', dur: 0.9, face: f }); return { ok: true, card: buildingCard(b, v), knock: true }; }
      deed('exame');
      return { ok: true, card: buildingCard(b, v) };
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
  // a load brought to a store: the world's own count of a delivery (villagers.js 'deliver') for the body as for anyone — a year of
  // plenty doubles the stone and the wood, what came along with the load goes in too. Done in the world's step
  function deliver(w, b) {
    const S = G.S; const c = w.carry; if (!c || !(c.n > 0)) return { ok: false, why: 'Suas mãos estão vazias.' };
    if (!S.buildings.has(b.id) || !b.built) return { ok: false, why: 'Não existe mais.' };
    const fid = G.Fac.idOfV(w); if (G.Village.facOfSet(b.set) !== fid) return { ok: false, why: 'Isto é de outro povo: o estoque daqui não é do seu.' };
    // (a load that belongs somewhere goes only there, by the depot, as the world's people take theirs (activity.js runCarga): never
    // into the people's store by mistake; what does not fit stays in the arms)
    const bound = boundOf(c);
    if (bound) {
      if (bound !== 'f:' + fid) return { ok: false, why: whyBound(bound) };
      const r = G.Depot.move('v:' + w.id, bound, c.k, c.n, { op: c.op || 0, code: 'entrega', by: w.id, part: true });
      if (!r.ok) return { ok: false, why: 'Não cabe mais nada no estoque do seu povo.' };
      G.FX && G.FX.deposit(w.x, w.y, c.k, r.n); G.Possess.deed('entrega'); return { ok: true, k: c.k, n: r.n };
    }
    const k = c.k, n = c.n * (S.blessed && (k === 'stone' || k === 'wood') ? 2 : 1);
    const add = G.Village.addStock(k, n, G.Fac.idOfV(w)); w.st[k] = (w.st[k] || 0) + c.n;
    if (add > 0) G.FX && G.FX.deposit(w.x, w.y, k, add);
    if (c.extra) G.Riches && G.Riches.unload(w, c.extra);
    G.Riches && G.Riches.delivered && G.Riches.delivered(w, c, add);
    w.carry = null; G.Possess.deed('entrega');
    return { ok: true, k, n: c.n };
  }
  // a building's card: what it is, whose it is, who lives or works there, what it holds — the world's own numbers
  function buildingCard(b, me) {
    const S = G.S; const def = G.BDEF[b.type] || {}; const set = S.settlements.get(b.set); const fac = G.Fac.get(G.Village.facOfSet(b.set));
    const res = def.housing ? [...S.villagers.values()].filter(o => o.home === b.id) : [];
    const card = { kind: 'building', id: b.id, name: G.Village.buildName(b), sub: [set ? set.name : null, fac ? fac.name : null].filter(Boolean).join(' · '), desc: G.BDESC ? G.BDESC[b.type] || '' : '', rows: [] };
    if (!b.built) { card.rows.push(['Obra', Math.round((b.progress || 0) * 100) + '%']); const miss = Object.keys(b.need || {}).filter(k => b.need[k] > 0).map(k => `${Math.ceil(b.need[k])} de ${G.Eco ? G.Eco.name(k) : k}`); if (miss.length) card.rows.push(['Faltam', miss.join(', ')]); }
    if (b.maxHp && b.hp < b.maxHp) card.rows.push(['Estrutura', Math.round(b.hp / b.maxHp * 100) + '%']);
    if (res.length) { card.rows.push(['Moram aqui', res.map(o => o.name + (o.id === me.id ? ' (você)' : '')).join(', ')]); const inside = res.filter(o => o.inside === b.id); card.rows.push(['Em casa agora', inside.length ? inside.map(o => o.name).join(', ') : 'ninguém']); }
    if (b.coin !== undefined && res.length) card.rows.push(['Moedas da família', Math.round(b.coin)]);
    if (isStore(b) && b.built) { const f = G.Fac.get(G.Village.facOfSet(b.set)); if (f) card.rows.push(['No estoque do povo', ['food', 'wood', 'stone'].map(k => `${Math.floor(f.stock[k] || 0)} de ${G.Eco ? G.Eco.name(k) : k}`).join(', ')]); }
    const work = [...S.villagers.values()].filter(o => o.task && o.task.id === b.id && o.task.type !== 'avatar').slice(0, 6);
    if (work.length) card.rows.push(['Trabalhando aqui', work.map(o => o.name).join(', ')]);
    return card;
  }
  I.buildingCard = buildingCard;
  function graveCard(b) {
    const g = (b.graves || []).slice(-12).reverse().map(id => { const p = G.person(typeof id === 'object' ? id.id : id); return p ? `${p.name} — ${G.Village.deathText(p)}` : null; }).filter(Boolean);
    return { kind: 'building', id: b.id, name: 'Cemitério', sub: 'As lápides', desc: g.length ? '' : 'Ainda não há ninguém enterrado aqui.', rows: g.map(t => ['†', t]) };
  }

  // ============================== work with the hands ==============================
  const hands = v => v.age >= 10 && !(v.lost && v.lost.armL && v.lost.armR);
  // a tree: felled the woodcutters' way (Nature.fellTree), then its wood taken in loads the size of the body (Vg.cap)
  I.add({
    id: 'arvore', prio: 3, reach: 2.4,
    find(ctx) {
      const out = []; const S = G.S; const x0 = Math.floor(ctx.x), y0 = Math.floor(ctx.y);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const x = x0 + dx, y = y0 + dy; if (!W.inb(x, y)) continue; const id = S.treeAt[W.idx(x, y)]; const t = id && S.trees.get(id); if (t && t.stage !== 'stump' && t.stage !== 'fall') out.push({ tr: t, X: t.x * L(), Z: t.y * L() }); }
      return out;
    },
    label(ctx, t) { const tr = t.tr; return tr.stage === 'log' ? 'Pegar lenha do tronco' : tr.kind === 'cactus' ? 'Examinar o cacto' : G.Nature.isChoppable(tr) ? 'Cortar a árvore' : 'Examinar a árvore'; },
    can(ctx, t) {
      const tr = t.tr; const v = ctx.v;
      if (!G.S.trees.has(tr.id)) return { ok: false, why: 'A árvore não está mais aqui.' };
      if (!G.Nature.isChoppable(tr)) return { ok: true };
      if (!hands(v)) return { ok: false, why: 'Você não tem força nem mãos para isso.' };
      if (tr.claim && tr.claim !== v.id) { const o = G.S.villagers.get(tr.claim); if (o && o.task && o.task.id === tr.id) return { ok: false, why: `${o.name} já está cortando esta árvore.` }; }
      if (v.carry && v.carry.n > 0 && (v.carry.k !== 'wood' || v.carry.n >= G.Vg.cap(v))) return { ok: false, why: 'Suas mãos já estão cheias: guarde a carga no armazém.' };
      if (G.S.fire[W.idx(tr.x, tr.y)] > 0) return { ok: false, why: 'Está pegando fogo!' };
      return { ok: true };
    },
    run(ctx, t) {
      const tr = t.tr; const v = ctx.v; const P = G.Possess; const f = face(ctx, t.X, t.Z);
      if (!G.Nature.isChoppable(tr)) { deed('exame'); return { ok: true, card: treeCard(tr) }; }
      if (tr.stage === 'log') {
        // (the wood off the trunk into the arms, as the woodcutter takes his load: the empty hands go down to it, the world puts
        // the load in them, and it comes up with the body)
        const g = AN('levantar');
        G.Avatar.act({ world: true, anim: 'carry', dur: g.dur, contact: g.contact, face: f, vact: g.act, reach: reachTo(toward(ctx, t.X, t.Z, 0.16), 0.5, 0.45),
          op: w => {
            if (!G.S.trees.has(tr.id) || tr.stage !== 'log') return { ok: false, why: 'A lenha não está mais aqui.' };
            if (w.carry && w.carry.n > 0 && w.carry.k !== 'wood') return { ok: false, why: 'Suas mãos já estão cheias.' };
            const had = w.carry && w.carry.k === 'wood' ? w.carry.n : 0; const n = Math.min(G.Vg.cap(w) - had, tr.wood);
            if (n <= 0) return { ok: false, why: 'Não cabe mais lenha nos seus braços: leve-a ao armazém.' };
            tr.wood -= n; if (tr.wood <= 0) { tr.stage = 'stump'; tr.t = 0; tr.claim = 0; }
            w.carry = { k: 'wood', n: had + n }; G.Vg.emote(w, 'wood', 1.5); return { ok: true };
          }, then: () => say('Você junta a lenha nos braços.'), fail: deny });
        return { ok: true };
      }
      // (the strokes: each one is the woodcutter's work of its time — dt × workMul — on the same counter the woodcutters fill, done
      // by the world at the blow; the tree falls when it is full)
      G.Avatar.act({ world: true, anim: 'swing', dur: WT.chop, contact: WT.chop * 0.62, face: f, vact: 'chop',
        op: w => {
          if (!G.S.trees.has(tr.id) || (tr.stage !== 'grow' && tr.stage !== 'burnt') || !G.Nature.isChoppable(tr)) return { ok: false, why: 'A árvore não está mais de pé.' };
          if (tr.claim && tr.claim !== w.id) { const o = G.S.villagers.get(tr.claim); if (o && o.task && o.task.id === tr.id) return { ok: false, why: `${o.name} já está cortando esta árvore.` }; }
          if (G.S.fire[W.idx(tr.x, tr.y)] > 0) return { ok: false, why: 'Está pegando fogo!' };
          const need = 3 * Math.max(0.5, tr.size); tr.claim = w.id; tr.chop += WT.chop * wm(w);
          if (tr.chop >= need) { G.Nature.fellTree(tr, w.face); P.deed('lenha'); tr.claim = 0; return { ok: true, fell: true }; }
          return { ok: true, pct: Math.min(99, Math.round(tr.chop / need * 100)) };
        },
        then: r => { G.Audio && G.Audio.at(tr.x, tr.y, 'chop'); G.FX && G.FX.chips(tr.x, tr.y, '#c9a26b'); say(r.fell ? 'Madeira! A árvore cai.' : `Golpe no tronco (${r.pct}%)`, 1.4); },
        fail: deny });
      return { ok: true };
    },
  });
  function treeCard(tr) {
    const NAME = { oak: 'Carvalho', apple: 'Macieira', mulberry: 'Amoreira', olive: 'Oliveira', cacao: 'Cacaueiro', coffee: 'Cafeeiro', pepper: 'Pimenteira', birch: 'Bétula', willow: 'Salgueiro', pine: 'Pinheiro', snowpine: 'Pinheiro da neve', jungle: 'Árvore da selva', acacia: 'Acácia', baobab: 'Baobá', cactus: 'Cacto', incense: 'Árvore do incenso', palm: 'Palmeira', date: 'Tamareira', acai: 'Açaizeiro', banana: 'Bananeira' };
    const st = { grow: tr.size < 0.6 ? 'nova demais para o machado' : 'adulta', burnt: 'queimada', log: 'caída, esperando quem leve a lenha', stump: 'um toco' }[tr.stage] || tr.stage;
    return { kind: 'thing', name: NAME[tr.kind] || 'Árvore', sub: st, rows: [['Lenha', tr.stage === 'log' ? Math.round(tr.wood) : tr.stage === 'grow' && tr.size >= 0.6 ? '≈ ' + Math.round(G.Nature.treeWood ? G.Nature.treeWood(tr) : 4) : '—']] };
  }
  // a bush: the berries picked; eaten on the spot when hungry, or carried home
  I.add({
    id: 'arbusto', prio: 3, reach: 2.2,
    find(ctx) {
      const out = []; const S = G.S; const x0 = Math.floor(ctx.x), y0 = Math.floor(ctx.y);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const x = x0 + dx, y = y0 + dy; if (!W.inb(x, y)) continue; const o = S.objAt[W.idx(x, y)]; const b = o && S.bushes.get(o); if (b) out.push({ bu: b, X: b.x * L(), Z: b.y * L() }); }
      return out;
    },
    label(ctx, t) { return t.bu.berries >= 1 ? (ctx.v.hunger > 40 ? 'Comer frutas do arbusto' : 'Colher frutas') : 'Examinar o arbusto'; },
    can(ctx, t) {
      const b = t.bu; const v = ctx.v; if (!G.S.bushes.has(b.id)) return { ok: false, why: 'Não está mais aqui.' };
      if (b.berries < 1) return { ok: true };
      if (b.claim && b.claim !== v.id) { const o = G.S.villagers.get(b.claim); if (o && o.task && o.task.id === b.id) return { ok: false, why: `${o.name} está colhendo aqui.` }; }
      if (v.hunger <= 40 && v.carry && v.carry.n > 0 && (v.carry.k !== 'food' || v.carry.n >= G.Vg.cap(v))) return { ok: false, why: 'Suas mãos já estão cheias.' };
      return { ok: true };
    },
    run(ctx, t) {
      const b = t.bu; const v = ctx.v; const P = G.Possess; const f = face(ctx, t.X, t.Z);
      if (b.berries < 1) { deed('exame'); return { ok: true, card: { kind: 'thing', name: 'Arbusto', sub: b.burnt > 0 ? 'queimado' : 'sem frutas agora', rows: [] } }; }
      // (the picker's time for a load — 2.2 s of the world ÷ workMul —, and the picker's load; hungry, two eaten off the bush)
      const eat = v.hunger > 40; const dur = WT.gather / wm(v);
      G.Avatar.act({ world: true, anim: 'low', dur, face: f, vact: 'gather',
        op: w => {
          if (!G.S.bushes.has(b.id) || b.berries < 1) return { ok: false, why: 'Não sobrou fruta neste arbusto.' };
          if (b.claim && b.claim !== w.id) { const o = G.S.villagers.get(b.claim); if (o && o.task && o.task.id === b.id) return { ok: false, why: `${o.name} está colhendo aqui.` }; }
          if (eat) { const n = Math.min(b.berries, 2); b.berries -= n; w.hunger = Math.max(0, w.hunger - 32 * n); G.Vg.emote(w, 'food', 1.5); P.deed('frutas'); return { ok: true, ate: n }; }
          const had = w.carry && w.carry.k === 'food' ? w.carry.n : 0; if (w.carry && w.carry.n > 0 && w.carry.k !== 'food') return { ok: false, why: 'Suas mãos já estão cheias.' };
          const n = Math.min(G.Vg.cap(w) - had, b.berries); if (n <= 0) return { ok: false, why: 'Suas mãos já estão cheias.' };
          b.berries -= n; w.carry = { k: 'food', n: had + n, berries: 1 }; P.deed('frutas'); return { ok: true, n };
        }, then: r => say(r.ate ? 'Você come as frutas.' : 'Você colhe as frutas.'), fail: deny });
      return { ok: true };
    },
  });
  // a rock: broken the quarrymen's way (its stone leaves it; the last stone takes the rock away)
  I.add({
    id: 'pedra', prio: 3, reach: 2.6,
    find(ctx) {
      const out = []; const S = G.S; const x0 = Math.floor(ctx.x), y0 = Math.floor(ctx.y);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const x = x0 + dx, y = y0 + dy; if (!W.inb(x, y)) continue; const o = S.objAt[W.idx(x, y)]; const r = o && S.rocks.get(o); if (r) out.push({ r, X: r.x * L(), Z: r.y * L() }); }
      return out;
    },
    label() { return 'Quebrar pedra'; },
    can(ctx, t) {
      const r = t.r; const v = ctx.v; if (!G.S.rocks.has(r.id) || r.stone < 1) return { ok: false, why: 'Não sobrou pedra aqui.' };
      if (!hands(v)) return { ok: false, why: 'Você não tem força nem mãos para isso.' };
      if (r.claim && r.claim !== v.id) { const o = G.S.villagers.get(r.claim); if (o && o.task && o.task.id === r.id) return { ok: false, why: `${o.name} está trabalhando nesta pedra.` }; }
      if (v.carry && v.carry.n > 0 && (v.carry.k !== 'stone' || v.carry.n >= G.Vg.cap(v))) return { ok: false, why: 'Suas mãos já estão cheias.' };
      return { ok: true };
    },
    run(ctx, t) {
      const r = t.r; const P = G.Possess; const f = face(ctx, t.X, t.Z);
      // (the strokes of the pick: each one the quarryman's work of its time — dt × workMul —, counted by the body at this rock as
      // the quarryman counts his; at his 3.8 the rock gives the load the hands can hold. Done by the world at the blow)
      G.Avatar.act({ world: true, anim: 'swing', dur: WT.mine, contact: WT.mine * 0.62, face: f, vact: 'mine',
        op: w => {
          if (!G.S.rocks.has(r.id) || r.stone < 1) { mineW = null; return { ok: false, why: 'Não sobrou pedra aqui.' }; }
          if (r.claim && r.claim !== w.id) { const o = G.S.villagers.get(r.claim); if (o && o.task && o.task.id === r.id) return { ok: false, why: `${o.name} está trabalhando nesta pedra.` }; }
          const had = w.carry && w.carry.k === 'stone' ? w.carry.n : 0; if ((w.carry && w.carry.n > 0 && w.carry.k !== 'stone') || had >= G.Vg.cap(w)) return { ok: false, why: 'Suas mãos já estão cheias.' };
          if (!mineW || mineW.id !== r.id || mineW.v !== w.id) mineW = { id: r.id, v: w.id, w: 0 };
          mineW.w += WT.mine * wm(w);
          if (mineW.w <= WT.mineLoad) return { ok: true, pct: Math.min(99, Math.round(mineW.w / WT.mineLoad * 100)) };
          mineW.w -= WT.mineLoad; const n = Math.min(G.Vg.cap(w) - had, r.stone); // (the stroke's work past the load goes to the next)
          r.stone -= n; if (r.stone <= 0) G.Nature.removeRock(r);
          w.carry = { k: 'stone', n: had + n }; P.deed('pedra', n); return { ok: true, got: n };
        },
        then: res => { G.Audio && G.Audio.at(r.x, r.y, 'mine'); G.FX && G.FX.chips(r.x, r.y, '#a9a9a9'); say(res.got ? `Você solta ${res.got} ${res.got > 1 ? 'pedras' : 'pedra'} da rocha.` : `Golpe na pedra (${res.pct}%)`, 1.4); },
        fail: deny });
      return { ok: true };
    },
  });
  // gold on the ground (the god's Chuva de Ouro, a dragon's hoard): picked up before the others get to it
  I.add({
    id: 'ouro', prio: 3.5, reach: 2.4,
    find(ctx) { const out = []; const R = 2.6 / L(); for (const q of G.Powers.goldPiles()) if (Math.abs(q.x - ctx.x) < R && Math.abs(q.y - ctx.y) < R) out.push({ q, X: q.x * L(), Z: q.y * L() }); return out; },
    label(ctx, t) { const n = Math.max(1, Math.round(t.q.n)); return `Catar ${n} ${n > 1 ? 'moedas' : 'moeda'} de ouro`; },
    can(ctx, t) {
      const v = ctx.v; if (!G.Powers.goldPiles().includes(t.q)) return { ok: false, why: 'Alguém catou primeiro.' };
      if (!hands(v)) return { ok: false, why: 'Você não tem mãos para isso.' };
      if (!G.Powers.coinage(v) && v.carry && v.carry.n > 0 && v.carry.k !== 'ouro') return { ok: false, why: 'Suas mãos já estão cheias.' };
      return { ok: true };
    },
    run(ctx, t) {
      const f = face(ctx, t.X, t.Z); const id = t.q.id;
      G.Avatar.act({ anim: 'low', dur: 1.1, face: f, contact: 0.5,
        op: w => { const r = G.Powers.takeGold(w, id); if (!r) return { ok: false, why: 'Alguém catou primeiro.' }; G.Possess.deed('ouro', r.n); return { ok: true, home: G.Powers.coinage(w) }; },
        then: r => { G.Audio && G.Audio.play && G.Audio.play('coin'); say(r.home ? 'Você cata as moedas: vão para a sua casa.' : 'Você cata o ouro: leve-o ao armazém.'); }, fail: deny });
      return { ok: true };
    },
  });
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
      // (the load set down at the works, and into them as the builders' loads go: what the works need, the rest to the stock)
      const { to, go } = walkUp(ctx, v, t.X, t.Z, 0.8); const g = AN('pousar'), goW = go * G.Space.TIME; const hands = reachTo(putAt(v, t.X, t.Z), 0.34, 0.4);
      G.Avatar.act({ world: true, anim: 'carry', dur: g.dur + goW, contact: g.contact + goW, face: f, to, toT: go, vact: g.act, reach: a => (a.tr < go ? null : hands(a)),
        op: w => {
          if (!w.carry || !(w.carry.n > 0) || !G.S.buildings.has(b.id) || b.built) return { ok: false, why: 'A obra já terminou.' };
          const n = w.carry.n, k = w.carry.k; const used = Math.min(n, b.need[k] || 0); if (used <= 0) return { ok: false, why: 'A obra não precisa disso.' };
          b.need[k] -= used; w.carry = null; if (n - used > 0) G.Village.addStock(k, n - used, G.Village.facOfSet(b.set));
          G.FX && G.FX.chips(b.x + b.w / 2, b.y + b.h / 2, k === 'wood' ? '#a67c4e' : '#9a9a9a');
          P.deed('obra'); return { ok: true }; // (one load brought, whatever it held)
        }, then: () => say('Você entrega o material aos construtores.'), fail: deny });
      return { ok: true };
    },
  });
  // what the world's activities offer the hands here (G.Act.offers — a crate on the quay, the stall, a hand to lend: C1's
  // operations): done through the door the world's people use (the same checks, the same transfer), at the contact of the same
  // gesture, in the same seconds of the world (Act.ANIM). Its words are the world's answer
  // (begun at the key — Act.begin, in the world's step: a crate of the quay is the hands' from then on, as a porter's is from
  // the moment he goes for it, by the same rule: a hand acting on it —; done at the contact — Act.commit —; let go if the
  // gesture is cut short — Act.abort. Refused at the key — another hand acting on it —, the gesture stops there, with the
  // world's words)
  const GEST = { lift: 'carry', arrange: 'carry', give: 'interact', pay: 'interact', haggle: 'talk', examine: 'interact', count: 'interact', call: 'wave', point: 'interact' };
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
    // (the work in reach, possible now, is what one means at the pile or at the door, more than a word with someone beside it —
    // unless face to face with them, a step away)
    if (o.ok !== false && (o.act === 'pegar' || o.act === 'pegarChao' || o.act === 'depositar')) t.pref = 1.6;
    return t;
  }
  I.placed = placed; // (for the tests)
  I.add({
    id: 'atividade', prio: 4.2, reach: 2.6,
    find(ctx) { if (!G.Act || !G.Act.offers) return []; return G.Act.offers(ctx.v, ctx.x, ctx.y, 2.6 / L() + 2).filter(o => o && o.at).map(o => placed(ctx, o)); },
    label(ctx, t) { return t.o.label || 'Ajudar'; },
    can(ctx, t) { return t.o.ok === false ? { ok: false, why: t.o.why || 'Agora não dá.' } : { ok: true }; },
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
    id: 'bicho', prio: 2, reach: 4,
    find(ctx) { const out = []; const R = 4.5 / L(); for (const a of G.S.animals.values()) { if (a.dead || a.held || Math.abs(a.x - ctx.x) > R || Math.abs(a.y - ctx.y) > R) continue; const d = G.Animals.DEF[a.kind]; if (!d || d.cls === 'water') continue; out.push({ a, X: a.x * L(), Z: a.y * L() }); } return out; },
    label(ctx, t) { const d = G.Animals.DEF[t.a.kind]; return `Observar ${d ? d.nameA || d.name : 'o bicho'}`; },
    can(ctx, t) { return G.S.animals.has(t.a.id) ? { ok: true } : { ok: false, why: 'Foi embora.' }; },
    run(ctx, t) {
      const a = t.a; const d = G.Animals.DEF[a.kind] || {}; deed('exame');
      const rows = []; if (a.named) rows.push(['Nome', a.named + (a.epithet ? ', ' + a.epithet : '')]); if (a.tamed || a.dom) rows.push(['', 'Animal de criação']); if (a.legend) rows.push(['', 'Uma fera lendária']); if (a.kills) rows.push(['Matou', a.kills + (a.kills > 1 ? ' pessoas' : ' pessoa')]);
      return { ok: true, card: { kind: 'thing', name: G.cap ? G.cap(d.name || a.kind) : (d.name || a.kind), sub: a.grown < 1 ? 'um filhote' : 'adulto', rows } };
    },
  });
  // water at the feet: a river or a lake is drunk from, kneeling (the breath comes back); the sea is salt
  I.add({
    id: 'agua', prio: 1.5, reach: 2.4,
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
  // a fish caught by hand, standing in the shallows (a ford, a lake's edge, the sea at the beach): the world's own catch
  // of that water — a trout in a cold river, sardines in a mild sea, a piranha's bite in the jungle's — into the hands,
  // to be taken to the store like any fisher's. It slips away as often as not
  I.add({
    id: 'peixe', prio: 3.2, reach: 1.6,
    find(ctx) {
      const w = G.Avatar.wade(); if (w < 0.12) return [];
      const X = ctx.X + Math.cos(ctx.yaw) * 0.7, Z = ctx.Z + Math.sin(ctx.yaw) * 0.7; const S = G.S, T = G.T; const x = X / L(), y = Z / L();
      if (!W.inb(x, y)) return []; const i = W.idx(x, y); const t = S.type[i];
      if (!(t === T.RIVER || t <= T.SEA) || (S.ice && S.ice[i]) || (S.dry && S.dry[i])) return [];
      return [{ X, Z, x, y, sea: t <= T.SEA }];
    },
    label() { return 'Pescar com as mãos'; },
    can(ctx, t) {
      const v = ctx.v; if (!hands(v)) return { ok: false, why: 'Você não tem mãos para isso.' };
      if (v.carry && v.carry.n > 0 && !v.carry.fish) return { ok: false, why: 'Suas mãos já estão cheias.' };
      if (v.carry && v.carry.n >= 8) return { ok: false, why: 'Não cabe mais peixe nas mãos: leve ao armazém.' };
      void t; return { ok: true };
    },
    run(ctx, t) {
      const v = ctx.v; const f = ctx.yaw;
      const splash = () => { const p = G.Avatar.pos(); if (p && G.FX3D) for (let k = 0; k < 10; k++) G.FX3D.spawn({ x: t.X + G.vrr(-0.2, 0.2), y: G.Avatar.waterAt(t.X, t.Z) + 0.05, z: t.Z + G.vrr(-0.2, 0.2), vx: G.vrr(-0.8, 0.8), vy: G.vrr(1, 2.2), vz: G.vrr(-0.8, 0.8), life: 0.7, s0: 0.07, s1: 0.03, c: [0.86, 0.94, 1], a: 0.8, sh: 1, grav: 9 }); G.Audio && G.Audio.play && G.Audio.play('splash'); };
      // (a try of the world's time — slower than the line —, its luck and its fish the world's, drawn by the world at the grab)
      const dur = WT.fish / wm(v);
      G.Avatar.act({ world: true, anim: 'low', dur, contact: dur * 0.55, face: f, vact: 'fish',
        op: w => {
          if (w.carry && w.carry.n > 0 && !w.carry.fish) return { ok: false, why: 'Suas mãos já estão cheias.' };
          // (the water may have frozen or gone meanwhile — the god's winter, the sea opened)
          { const S = G.S, i = W.idx(t.x, t.y); if (!(S.type[i] === G.T.RIVER || S.type[i] <= G.T.SEA) || (S.ice && S.ice[i]) || (S.dry && S.dry[i])) return { ok: false, why: 'A água não está mais ali.' }; }
          // (the world's own fishing, act-pesca.js: that water's fish, counted out of its ground, by the hands' way and the
          // fisher's hand — the hands are slower than a line —, the world's dice, into the hands through the ledger ('pesca');
          // another kind with no hand for it goes back to the water, and to its ground)
          if (G.Pesca) {
            const r = G.Pesca.cast(w, t.x, t.y, { how: 'maos' });
            const nm = r.name ? (/a$/.test(r.name) ? 'uma ' : 'um ') + r.name : 'um peixe';
            if (!r.ok) return r.miss ? { ok: false, why: 'Escapou entre os dedos…', slip: 1 } : { ok: false, why: r.other ? `Você pegou ${nm}, mas não tem mão para ele: solta de volta.` : r.why || 'Escapou entre os dedos…', slip: r.other ? 1 : 0 };
            G.Possess.deed('pesca'); return { ok: true, nm };
          }
          // (the world's dice: the hands are slower than a line; and what bites is that water's own fish)
          if (G.R() < 0.55) return { ok: false, why: 'Escapou entre os dedos…', slip: 1 };
          const c = G.Waters ? G.Waters.catchCarry(w, t.x, t.y, 1) : { k: 'food', n: 1, fish: 'carpa' };
          if (!G.S.villagers.has(w.id)) return { ok: false, why: '' };
          const F = G.Waters && G.Waters.FISH[c.fish]; const nm = F ? (/a$/.test(F.name) ? 'uma ' : 'um ') + F.name : 'um peixe';
          // (one load in the hands: the same catch piles up; another kind of fish has no hand left, and goes back to the water)
          if (w.carry && w.carry.n > 0 && w.carry.k !== c.k) return { ok: false, why: `Você pegou ${nm}, mas não tem mão para ele: solta de volta.` };
          if (w.carry && w.carry.n > 0) w.carry.n += c.n; else w.carry = c;
          G.Possess.deed('pesca'); return { ok: true, nm };
        },
        then: r => { splash(); say(`Você pegou ${r.nm}! Leve ao armazém.`, 3); }, fail: r => { if (r.slip) splash(); deny(r); } });
      return { ok: true, msg: t.sea ? 'Você se abaixa e espera um peixe passar entre as pernas…' : 'Você se abaixa na água rasa, as mãos em concha…' };
    },
  });
  // a tame beast near (a dog, a cat, a hen, the herd): stroked — it leans into the hand, a little heart over it
  I.add({
    id: 'carinho', prio: 2.5, reach: 2.4,
    find(ctx) { const out = []; const R = 2.6 / L(); for (const a of G.S.animals.values()) { if (a.dead || a.held || Math.abs(a.x - ctx.x) > R || Math.abs(a.y - ctx.y) > R) continue; const d = G.Animals.DEF[a.kind]; if (!d || d.cls === 'water' || d.cls === 'air' || !(a.dom || a.tamed || d.dom || d.pet)) continue; out.push({ a, X: a.x * L(), Z: a.y * L() }); } return out; },
    label(ctx, t) { const d = G.Animals.DEF[t.a.kind]; return `Fazer carinho ${d ? 'n' + (d.g === 'f' ? 'a ' : 'o ') + (d.name || '').toLowerCase() : 'no bicho'}`; },
    can(ctx, t) { return G.S.animals.has(t.a.id) ? { ok: true } : { ok: false, why: 'Foi embora.' }; },
    run(ctx, t) {
      const f = face(ctx, t.X, t.Z); const a = t.a;
      G.Avatar.act({ anim: 'low', dur: 1.6, face: f, at: [0.6, () => { if (G.FX3D) G.FX3D.spawn({ x: a.x * L(), y: (W.groundH(a.x, a.y) * G.Space.HM) + 1.2, z: a.y * L(), vx: 0, vy: 0.5, vz: 0, life: 1.2, s0: 0.25, s1: 0.4, c: [1, 0.45, 0.6], a: 0.9, fade: 1 }, true); }], contact: 0.9, op: () => { if (!G.S.animals.has(a.id)) return { ok: false, why: '' }; G.Possess.deed('carinho'); return { ok: true }; } });
      return { ok: true, msg: 'Ele se encosta na sua mão.' };
    },
  });
})(window.G);
