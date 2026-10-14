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
        const sc = s + p.prio * 0.6;
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
    G.Stories && G.Stories.signal('avatarDeed', { id: ctx.v.id, what: p.id, x: ctx.x, y: ctx.y, set: ctx.v.set });
    return r;
  };
  const face = (ctx, X, Z) => Math.atan2(Z - ctx.Z, X - ctx.X);

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
      // (the other turns to the one speaking, and answers: a line over their head, in both views)
      G.faceTo(o, me.x - o.x, me.y - o.y);
      // (and stops a moment to talk, as the world's people stop for each other — the day's work too, as for a courtship; not
      // a meal, sleep, the watch or anything urgent. The moments here are the body's seconds, in the world's slower time of
      // the body: G.Space.TIME)
      if (txt && (!o.task || o.task.pri <= 1)) G.Vg.setTask(o, { type: 'talk', id: me.id, pri: 0.9, wait: 5 * G.Space.TIME, kind: 'talk' });
      if (txt && G.Talk) G.Talk.say(o, txt, { dur: 4 });
      const k = G.Possess.kin(me, o); if (k) G.Vg.emote(o, 'heart', 2);
      if (G.Possess.meet(o.id)) G.Possess.deed('conversa');
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
    // (a moment's hug outweighs a meal or a nap that can wait three seconds — the world's needs take over at 1.2 — never a fire)
    G.Vg.setTask(o, { type: 'talk', id: me.id, pri: 1.25, wait: 4.2 * G.Space.TIME, hug: 1 });
    // (both hold on while both are there: called away by the world — a festival, a fire — or gone, the arms let go, nothing counts)
    const holds = () => G.S.villagers.has(o.id) && !!o.task && !!o.task.hug && o.task.id === me.id;
    G.Avatar.act({ anim: 'hug', dur: 2.6, face: f, to, toT: 0.8, keep: holds, at: [1, () => { G.Vg.emote(o, 'heart', 2); G.Vg.emote(me, 'heart', 2); }], done: () => {
      if (!holds()) return;
      const grief = o.mourn > 0; if (grief) o.mourn = Math.max(0, o.mourn - G.DAY_LEN * 0.35);
      G.Vg.endTask(o); // (and they go back to their day)
      G.Possess.deed(grief ? 'consolo' : 'abraco');
    } });
    G.Stories && G.Stories.signal('avatarDeed', { id: me.id, what: 'abraco', x: ctx.x, y: ctx.y, set: me.set });
    const k = c.kin; const said = c.grief ? (o.age < 14 ? 'Eu sinto tanta falta…' : 'Obrigad' + oa(o) + '. Eu precisava disso.') : k === 'mãe' || k === 'pai' ? `Ah, ${me.name}…` : k === 'filho' || k === 'filha' ? (o.age < 10 ? 'Mais forte!' : 'Eu também te amo.') : k === 'companheiro' || k === 'companheira' ? 'Fica mais um pouco.' : 'Que saudade!';
    G.Talk && G.Talk.say(o, said, { dur: 3 });
    return { ok: true, msg: c.grief ? `Você abraça ${o.name}, que chora no seu ombro.` : `Você abraça ${o.name}.`, said };
  };
  // the dance: whoever is free near the body joins it a while (the children, the merry, the family first)
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
      for (const b of S.buildings.values()) {
        if (b.x > ctx.x + 6 || b.x + b.w < ctx.x - 6 || b.y > ctx.y + 6 || b.y + b.h < ctx.y - 6) continue;
        if (b.type === 'ruin' || b.type === 'farm' || b.type === 'horta' || b.type === 'plantacao' || b.type === 'vinhedo') continue;
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
        if (G.Village.facOfSet(b.set) !== G.Fac.idOfV(v)) return { ok: false, why: 'Isto é de outro povo: o estoque daqui não é do seu.' };
        if (!(v.carry && v.carry.n > 0) && v.hunger > 25 && (G.Fac.stockV(v).food || 0) < 1) return { ok: false, why: 'O estoque do seu povo está sem comida.' };
      }
      return { ok: true };
    },
    run(ctx, t) {
      const b = t.b; const S = G.S; const v = ctx.v; const P = G.Possess;
      const f = face(ctx, t.X, t.Z);
      if (!b.built) { P.deed('exame'); return { ok: true, card: buildingCard(b, v) }; }
      if (b.id === v.home && v.energy < 85) {
        // (to bed at home: the body goes in through its own door, and the world's sleep gives the strength back)
        G.Avatar.act({ anim: 'interact', dur: 0.8, face: f, done: () => { if (P.is(v) && P.sleep(v)) { v.inside = b.id; P.deed('sono'); } } });
        return { ok: true, msg: 'Você entra em casa e se deita.', sleep: true };
      }
      if (isStore(b)) {
        const stk = G.Fac.stockV(v);
        if (v.carry && v.carry.n > 0) {
          const k = v.carry.k, n = v.carry.n;
          G.Avatar.act({ anim: 'carry', dur: 0.9, face: f, done: () => {
            if (!v.carry) return;
            const add = G.Village.addStock(k, n, G.Fac.idOfV(v)); v.st[k] = (v.st[k] || 0) + n;
            if (add > 0) G.FX && G.FX.deposit(v.x, v.y, k, add);
            G.Riches && G.Riches.delivered && G.Riches.delivered(v, v.carry, add);
            v.carry = null; P.deed('entrega');
          } });
          return { ok: true, msg: `Você guarda ${n} de ${G.Eco ? G.Eco.name(k) : k} ${at(b)}.` };
        }
        if (v.hunger > 25 && stk.food >= 1) {
          G.Avatar.act({ anim: 'sit', dur: 2.2, face: f, done: () => { const s2 = G.Fac.stockV(v); const got = Math.min(v.hunger > 80 ? 2 : 1, Math.floor(s2.food)); if (got <= 0) return; s2.food -= got; v.hunger = Math.max(0, v.hunger - 58 * got); G.Vg.emote(v, 'food', 1.5); P.deed('refeicao'); } });
          return { ok: true, msg: `Você come ${at(b)}, do estoque do seu povo.` };
        }
        return { ok: true, card: buildingCard(b, v) };
      }
      if (b.type === 'temple') {
        G.Avatar.act({ anim: 'pray', dur: 3.2, face: f, done: () => { v.devotion = Math.min(100, (v.devotion || 0) + 6); G.Vg.emote(v, 'pray', 2); P.deed('reza'); } });
        return { ok: true, msg: 'Você se ajoelha e reza.' };
      }
      if (b.type === 'cemetery') { P.deed('exame'); return { ok: true, card: graveCard(b) }; }
      const def = G.BDEF[b.type]; if (def && def.housing && b.id !== v.home) { P.deed('porta'); G.Avatar.act({ anim: 'interact', dur: 0.9, face: f }); return { ok: true, card: buildingCard(b, v), knock: true }; }
      P.deed('exame');
      return { ok: true, card: buildingCard(b, v) };
    },
  });
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
      if (!G.Nature.isChoppable(tr)) { P.deed('exame'); return { ok: true, card: treeCard(tr) }; }
      if (tr.stage === 'log') {
        G.Avatar.act({ anim: 'low', dur: 1.4, face: f, done: () => { if (!G.S.trees.has(tr.id) || tr.stage !== 'log') return; const room = G.Vg.cap(v) - (v.carry && v.carry.k === 'wood' ? v.carry.n : 0); const n = Math.min(room, tr.wood); if (n <= 0) return; tr.wood -= n; if (tr.wood <= 0) { tr.stage = 'stump'; tr.t = 0; tr.claim = 0; } v.carry = { k: 'wood', n: (v.carry && v.carry.k === 'wood' ? v.carry.n : 0) + n }; G.Vg.emote(v, 'wood', 1.5); } });
        return { ok: true, msg: 'Você junta a lenha nos braços.' };
      }
      // (the strokes: each one is work on the same counter the woodcutters fill; the tree falls when it is full)
      const need = 3 * Math.max(0.5, tr.size); const per = 0.9 * (v.work || 1);
      tr.claim = v.id; v.act = 'chop';
      G.Avatar.act({ anim: 'swing', dur: 1.15, face: f, at: [0.62, () => { G.Audio && G.Audio.at(tr.x, tr.y, 'chop'); G.FX && G.FX.chips(tr.x, tr.y, '#c9a26b'); }], done: () => {
        v.act = ''; if (!G.S.trees.has(tr.id) || !G.Nature.isChoppable(tr) || tr.stage === 'log') { tr.claim = 0; return; }
        tr.chop += per;
        if (tr.chop >= need) { G.Nature.fellTree(tr, v.face); P.deed('lenha'); tr.claim = 0; }
      } });
      return { ok: true, msg: tr.chop + per >= need ? 'Madeira! A árvore cai.' : `Golpe no tronco (${Math.min(100, Math.round((tr.chop + per) / need * 100))}%)` };
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
      if (b.berries < 1) { P.deed('exame'); return { ok: true, card: { kind: 'thing', name: 'Arbusto', sub: b.burnt > 0 ? 'queimado' : 'sem frutas agora', rows: [] } }; }
      const eat = v.hunger > 40;
      G.Avatar.act({ anim: 'low', dur: 1.8, face: f, done: () => {
        if (!G.S.bushes.has(b.id) || b.berries < 1) return;
        if (eat) { const n = Math.min(b.berries, 2); b.berries -= n; v.hunger = Math.max(0, v.hunger - 32 * n); G.Vg.emote(v, 'food', 1.5); }
        else { const room = G.Vg.cap(v) - (v.carry && v.carry.k === 'food' ? v.carry.n : 0); const n = Math.min(room, b.berries); if (n <= 0) return; b.berries -= n; v.carry = { k: 'food', n: (v.carry && v.carry.k === 'food' ? v.carry.n : 0) + n, berries: 1 }; }
        P.deed('frutas');
      } });
      return { ok: true, msg: eat ? 'Você come as frutas.' : 'Você colhe as frutas.' };
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
      const r = t.r; const v = ctx.v; const P = G.Possess; const f = face(ctx, t.X, t.Z);
      v.act = 'mine';
      G.Avatar.act({ anim: 'swing', dur: 2.6, face: f, at: [0.6, () => { G.Audio && G.Audio.at(r.x, r.y, 'mine'); G.FX && G.FX.chips(r.x, r.y, '#a9a9a9'); }], done: () => {
        v.act = ''; if (!G.S.rocks.has(r.id) || r.stone < 1) return;
        const room = G.Vg.cap(v) - (v.carry && v.carry.k === 'stone' ? v.carry.n : 0); const n = Math.min(room, r.stone, 2); if (n <= 0) return;
        r.stone -= n; if (r.stone <= 0) G.Nature.removeRock(r);
        v.carry = { k: 'stone', n: (v.carry && v.carry.k === 'stone' ? v.carry.n : 0) + n }; P.deed('pedra', n);
      } });
      return { ok: true, msg: 'Você golpeia a pedra.' };
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
      const v = ctx.v; const f = face(ctx, t.X, t.Z); const id = t.q.id;
      G.Avatar.act({ anim: 'low', dur: 1.1, face: f, at: [0.5, () => { G.Audio && G.Audio.play && G.Audio.play('coin'); }], done: () => { const r = G.Powers.takeGold(v, id); if (r) G.Possess.deed('ouro', r.n); } });
      return { ok: true, msg: G.Powers.coinage(v) ? 'Você cata as moedas: vão para a sua casa.' : 'Você cata o ouro: leve-o ao armazém.' };
    },
  });
  // a building going up: what one carries goes into it, as the builders' loads do (Vg's build: need, then the stock)
  I.add({
    id: 'obra', prio: 4.5, reach: 3.4,
    find(ctx) {
      const v = ctx.v; if (!v.carry || !(v.carry.n > 0) || v.carry.k === 'food') return [];
      const out = []; for (const b of G.S.buildings.values()) { if (b.built || !b.need || !(b.need[v.carry.k] > 0)) continue; if (b.x > ctx.x + 5 || b.x + b.w < ctx.x - 5 || b.y > ctx.y + 5 || b.y + b.h < ctx.y - 5) continue; const cx = G.clamp(ctx.x, b.x, b.x + b.w), cy = G.clamp(ctx.y, b.y, b.y + b.h); out.push({ b, X: cx * L(), Z: cy * L() }); }
      return out;
    },
    label(ctx, t) { return `Levar ${G.Eco ? G.Eco.name(ctx.v.carry.k) : ctx.v.carry.k} para a obra: ${G.Village.buildName(t.b).toLowerCase()}`; },
    can(ctx, t) { const b = t.b; const v = ctx.v; if (!G.S.buildings.has(b.id) || b.built) return { ok: false, why: 'A obra já terminou.' }; if (G.Village.facOfSet(b.set) !== G.Fac.idOfV(v)) return { ok: false, why: 'Esta obra é de outro povo.' }; return v.carry && b.need[v.carry.k] > 0 ? { ok: true } : { ok: false, why: 'A obra não precisa disso.' }; },
    run(ctx, t) {
      const b = t.b; const v = ctx.v; const P = G.Possess; const f = face(ctx, t.X, t.Z);
      G.Avatar.act({ anim: 'carry', dur: 1.1, face: f, done: () => {
        if (!v.carry || !G.S.buildings.has(b.id) || b.built) return;
        const n = v.carry.n, k = v.carry.k; const used = Math.min(n, b.need[k] || 0); b.need[k] -= used;
        v.carry = null; if (n - used > 0) G.Village.addStock(k, n - used, G.Village.facOfSet(b.set));
        G.FX && G.FX.chips(b.x + b.w / 2, b.y + b.h / 2, k === 'wood' ? '#a67c4e' : '#9a9a9a');
        P.deed('obra'); // (one load brought, whatever it held)
      } });
      return { ok: true, msg: 'Você entrega o material aos construtores.' };
    },
  });
  // a beast: looked at (what the world knows of it)
  I.add({
    id: 'bicho', prio: 2, reach: 4,
    find(ctx) { const out = []; const R = 4.5 / L(); for (const a of G.S.animals.values()) { if (a.dead || a.held || Math.abs(a.x - ctx.x) > R || Math.abs(a.y - ctx.y) > R) continue; const d = G.Animals.DEF[a.kind]; if (!d || d.cls === 'water') continue; out.push({ a, X: a.x * L(), Z: a.y * L() }); } return out; },
    label(ctx, t) { const d = G.Animals.DEF[t.a.kind]; return `Observar ${d ? d.nameA || d.name : 'o bicho'}`; },
    can(ctx, t) { return G.S.animals.has(t.a.id) ? { ok: true } : { ok: false, why: 'Foi embora.' }; },
    run(ctx, t) {
      const a = t.a; const d = G.Animals.DEF[a.kind] || {}; G.Possess.deed('exame');
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
        done: () => { G.Avatar.rest(); G.Possess.deed('agua'); } });
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
      G.Avatar.act({ anim: 'low', dur: 2.6, face: f, at: [1.4, splash], done: () => {
        if (!G.S.villagers.has(v.id) || (v.carry && v.carry.n > 0 && !v.carry.fish)) return;
        // (the water may have frozen or gone meanwhile — the god's winter, the sea opened)
        { const S = G.S, i = W.idx(t.x, t.y); if (!(S.type[i] === G.T.RIVER || S.type[i] <= G.T.SEA) || (S.ice && S.ice[i]) || (S.dry && S.dry[i])) { G.IncUI && G.IncUI.toast && G.IncUI.toast('A água não está mais ali.', 2); return; } }
        // (the world's dice: the hands are slower than a line; and what bites is that water's own fish)
        if (G.R() < 0.55) { G.IncUI && G.IncUI.toast && G.IncUI.toast('Escapou entre os dedos…', 2); return; }
        const c = G.Waters ? G.Waters.catchCarry(v, t.x, t.y, 1) : { k: 'food', n: 1, fish: 'carpa' };
        if (!G.S.villagers.has(v.id)) return;
        const F = G.Waters && G.Waters.FISH[c.fish]; const nm = F ? (/a$/.test(F.name) ? 'uma ' : 'um ') + F.name : 'um peixe';
        // (one load in the hands: the same catch piles up; another kind of fish has no hand left, and goes back to the water)
        if (v.carry && v.carry.n > 0 && v.carry.k !== c.k) { G.IncUI && G.IncUI.toast && G.IncUI.toast(`Você pegou ${nm}, mas não tem mão para ele: solta de volta.`, 3); return; }
        if (v.carry && v.carry.n > 0) v.carry.n += c.n; else v.carry = c;
        G.Possess.deed('pesca');
        G.IncUI && G.IncUI.toast && G.IncUI.toast(`Você pegou ${nm}! Leve ao armazém.`, 3);
      } });
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
      G.Avatar.act({ anim: 'low', dur: 1.6, face: f, at: [0.6, () => { if (G.FX3D) G.FX3D.spawn({ x: a.x * L(), y: (W.groundH(a.x, a.y) * G.Space.HM) + 1.2, z: a.y * L(), vx: 0, vy: 0.5, vz: 0, life: 1.2, s0: 0.25, s1: 0.4, c: [1, 0.45, 0.6], a: 0.9, fade: 1 }, true); }], done: () => G.Possess.deed('carinho') });
      return { ok: true, msg: 'Ele se encosta na sua mão.' };
    },
  });
})(window.G);
