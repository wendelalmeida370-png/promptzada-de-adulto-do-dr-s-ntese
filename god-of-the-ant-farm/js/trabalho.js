'use strict';
// ============================================================
//  Trabalho: the works of the body's hands (20g, D-425 to D-433).
//  A work is one entry of a table and one provider of the hands
//  (G.Interact.add), never a file of rules of its own:
//   · the target — a tree, a rock, a bush, a mine, a river's bank,
//     the shallows, a carcass, a ripe patch of a field, a stall;
//   · the tool in the hand — the body's own thing of the kind the
//     work asks (G.Inv: the bag, the hands, the back, the belt —
//     never the trade's unseen kit, D-426); without it the work
//     that cannot be done says why, the one done worse says it
//     takes longer;
//   · the cycle — the gesture of that work (a clip of
//     trabalho-clips.js, its contact on the world's) lasting the
//     world seconds of anyone of the world doing the same (D-035);
//   · the yield — by the world's own doors (Nature.fellTree, the
//     quarry's count, the mine's vein, the bank's clay, Pesca.cast,
//     the field's harvest, the carcass, the stall), in the world's
//     step (the act's op through Possess.apply), into the hands by
//     the ledger (G.Depot) with its origin (G.Origem);
//   · the material of the tool — what a stroke does against the
//     trade's own tool of the body's people (G.Itens: the stone
//     slow, the bronze, the iron quicker; D-427).
//  The people of the world doing the same are drawn with the same
//  gestures and the same tools (the clips' acts, G.Inv.held), and
//  their work is the world's as it was: nothing here runs for them.
//  The contract: JOGABILIDADE.md §9.3; the map of the causes:
//  ORIGEM.md (the works of the body).
// ============================================================
(function (G) {
  const W = G.W, I = G.Interact; if (!I || !G.Inv || !G.Itens) return;
  const Tr = G.Trabalho = {};
  const It = G.Itens, Inv = G.Inv;
  const EPS = 1e-6;
  const L = () => G.Space.TILE;
  // the world's seconds of the works of the hands — each the world's own (villagers.js, economy.js, act-oficio.js, riches.js):
  // the woodcutter's stroke and the dt × workMul it adds to the tree, the quarryman's stroke and his load at 3.8 of work, a load
  // of berries in 2.2 s, the farmer's patch in 1.5 s, the potter's clay in 5 s, the hunter's skinning at 4 of work, a try of the
  // hands in the shallows (without the fishing module: the people's old 4 to 7 s). The presence of the player gives no work free
  const WT = Tr.WT = { chop: 0.55, mine: 0.6, mineLoad: 3.8, gather: 2.2, fish: 5.5, reap: 1.5, clay: 5, skin: 4 };
  // the works: what each asks of the hand — tools: the kinds that do it, by preference, with what each does against the trade's
  // own (its share: 1 the tool of the work; less, a tool that does it worse); for the fishing, the way each gear fishes —; bare:
  // what the empty hands do (0: not done without a tool); sem: what is said of the work without its tool
  const WORKS = Tr.WORKS = {
    cortar: { nome: 'Cortar', tools: [['machado', 1]], bare: 0, sem: 'Sem machado não se derruba uma árvore: pegue um no armazém do povo.' },
    quebrar: { nome: 'Quebrar pedra', tools: [['picareta', 1], ['martelo', 0.45]], bare: 0, sem: 'Sem picareta (ou ao menos um martelo) não se quebra pedra.', pior: 'Com o martelo, a pedra demora mais que com a picareta.' },
    minerar: { nome: 'Minerar', tools: [['picareta', 1]], bare: 0, sem: 'Sem picareta não se tira minério da mina.' },
    cavar: { nome: 'Cavar', tools: [['pa', 1], ['enxada', 0.6]], bare: 0.35, sem: 'Sem pá: cavando com as mãos, demora três vezes mais.', pior: 'Com a enxada, cava-se mais devagar que com a pá.' },
    esfolar: { nome: 'Esfolar', tools: [['faca', 1]], bare: 0, sem: 'Sem faca não se tira o couro nem a carne.' },
    ceifar: { nome: 'Colher', tools: [['foice', 1]], bare: 0.5, sem: 'Sem foice: arrancando com as mãos, demora o dobro.' },
    colher: { nome: 'Colher frutas', tools: [], bare: 1 },
    pescar: { nome: 'Pescar', tools: [['rede', 'rede'], ['vara', 'linha'], ['lanca', 'arpao']], bare: 'maos' },
    vender: { nome: 'Vender', tools: [], bare: 1 },
  };
  // (the gestures of the body for each work: the clip — trabalho-clips.js —, and what the world sees it doing meanwhile, v.act)
  const GEST = Tr.GEST = {
    cortar: ['machado', 'chop'], quebrar: ['picareta', 'mine'], minerar: ['picareta', 'mine'], cavar: ['pa', 'dig'], esfolar: ['esfolar', 'skin'],
    ceifar: ['ceifar', 'harvest'], colher: ['colher-mato', 'gather'], vender: ['apregoar', 'sell'],
    linha: ['vara', 'fish'], rede: ['rede', 'fish'], arpao: ['lanca-agua', 'fish'], maos: ['maos-agua', 'fish'],
  };
  // (the vacts of these works are the body's own doings: the controller takes them back when the act ends, as the axe's)
  if (G.Avatar && G.Avatar.VACT) { for (const k in GEST) G.Avatar.VACT.add(GEST[k][1]); for (const k of ['hammer', 'rake']) G.Avatar.VACT.add(k); }
  // (the deeds of the new works, for the biography of the one the god lived: Possess.deed)
  if (G.Possess && G.Possess.DEED) Object.assign(G.Possess.DEED, { minerio: ['tirou da mina', 'carga de minério', 'cargas de minério'], argila: ['cavou', 'carga de argila', 'cargas de argila'], colheita: ['colheu', 'canteiro da roça', 'canteiros da roça'], esfolar: ['esfolou', 'bicho caçado', 'bichos caçados'], pescado: ['pescou', 'peixe', 'peixes'] });

  // ------------------------------ the tool ------------------------------
  // what a stroke of a tool does against the trade's own tool of the body's people (D-427): the material's work (G.Itens:
  // trabalho — stone 0.75, bronze 1, iron 1.2) against that of the tool the people would give the trade (G.Inv.made). The body
  // with its people's own tool works at the world's pace (D-035); a better one quicker, a worse one slower
  const refOf = (kind, v) => { const k = Inv.made(kind, v); const d = k && It.def(k); return d && d.trabalho > 0 ? d.trabalho : 1; };
  Tr.matMul = function (key, v) { const d = It.def(key); if (!d || !(d.trabalho > 0)) return 1; return d.trabalho / refOf(d.kind, v); };
  // the tool of a work for a body: the best of the work's kinds among the body's own things — its bag, in the hand, on the back,
  // at the belt (G.Inv.list) —, never the trade's unseen kit (D-426); by the kind's share × its material's (D-427), the one in
  // the hand first among equals. → { key, kind, share, mat, mul, hand, how } — or, with none: { key: null, mul: bare, how, why }
  Tr.tool = function (v, id) {
    const w = WORKS[id]; if (!w || !v) return { key: null, mul: 0, why: '' };
    let best = null; const list = Inv.list(v);
    for (let i = 0; i < w.tools.length; i++) {
      const [kind, share] = w.tools[i];
      for (const it of list) {
        if (it.d.kind !== kind || !(it.n >= 1)) continue;
        const gear = typeof share === 'string'; const mat = gear ? 1 : Tr.matMul(it.k, v); const mul = gear ? 1 : share * mat;
        const hand = it.on.includes('mao') || it.on.includes('outra');
        // (the fishing: the gear in the hand, else the first of the order; the others: the most work, the one in the hand among equals)
        const better = !best || (gear ? (hand && !best.hand) : mul > best.mul + EPS || (Math.abs(mul - best.mul) <= EPS && hand && !best.hand));
        if (better) best = { key: it.k, kind, share, mat, mul, hand, how: gear ? share : null, ord: i };
      }
      if (best && typeof share === 'string' && best.hand) break;
    }
    if (best) return best;
    return { key: null, kind: null, mul: typeof w.bare === 'number' ? w.bare : 1, how: typeof w.bare === 'string' ? w.bare : null, why: w.bare ? '' : w.sem, slow: typeof w.bare === 'number' && w.bare > 0 && w.bare < 1 ? w.sem : '' };
  };
  // (the words of a tool, for the screen and the card: «machado de bronze», and what it does against the trade's own)
  Tr.toolName = t => (t && t.key ? It.nome(t.key) : 'as mãos');
  // the tool in the hand for the work, by the inventory's door, in the world's step (the op): what the hand held goes where it
  // is put away (G.Inv.equip). → true when the tool is in the hand now
  function inHand(w, t) {
    if (!t || !t.key) return true;
    if (Inv.count(w, t.key) < 1) return false;
    const e = Inv.equipOf(w); const s = It.mao(t.key) === 'outra' ? 'outra' : 'mao';
    if (e[s] === t.key) return true;
    const r = Inv.equip(w, t.key, s); return !!(r && r.ok);
  }
  // (the same tool still the body's at the stroke: the world moves between the asking and the doing — the tool dropped, given)
  function stillTool(w, id, t, now) {
    const n = now ? now(w) : Tr.tool(w, id);
    if (t && t.key && n.key !== t.key) return { ok: false, why: n.key ? `Você trocou de ferramenta: agora é ${It.nome(n.key)}.` : `Você não tem mais ${It.nome(t.key)}.` };
    if (!n.key && !(n.mul > 0)) return { ok: false, why: n.why || WORKS[id].sem || '' };
    return { ok: true, t: n };
  }

  // ------------------------------ the helpers of the hands ------------------------------
  const face = (ctx, X, Z) => Math.atan2(Z - ctx.Z, X - ctx.X);
  const wm = v => G.Vg.workMul(v);
  const hands = v => v.age >= 10 && !(v.lost && v.lost.armL && v.lost.armR);
  const say = (txt, d) => { if (txt && G.IncUI && G.IncUI.toast) G.IncUI.toast(txt, d || 2.4); };
  const deny = r => { if (r && r.why) say(r.why); G.Audio && G.Audio.play && G.Audio.play('deny'); };
  const deed = (k, n) => G.Possess.apply(() => { G.Possess.deed(k, n); return { ok: true }; });
  const Who = (v, o) => G.cap(G.Possess.knows.call(v, o));
  const AN = k => (G.Act && G.Act.ANIM && G.Act.ANIM[k]) || { act: 'lift', dur: 1, contact: 0.6 };
  const loaded = v => !!(v.carry && v.carry.n > EPS);
  // (a point before the body, toward a thing of the world and in reach of the arms: at most a stride ahead, up metres over the ground)
  const toward = (ctx, X, Z, up, most) => { const d = Math.hypot(X - ctx.X, Z - ctx.Z), k = d > 1e-6 ? Math.min(most || 0.55, Math.max(0.3, d - 0.3)) / d : 0; const x = ctx.X + (X - ctx.X) * k, z = ctx.Z + (Z - ctx.Z) * k; return [x, G.Avatar.floorAt(x, z) + up, z]; };
  // (whose a thing is now: another one of the world at work on it — their claim and their task on it)
  const busyBy = (v, claim, id) => { if (!claim || claim === v.id) return null; const o = G.S.villagers.get(claim); return o && o.task && o.task.id === id ? o : null; };
  // the hands' load: a work's yield goes on top of the same plain good, never over another thing (L-583)
  const handsFor = (v, k) => !loaded(v) || (v.carry.k === k && !v.carry.op && !v.carry.to && !v.carry.cid);
  // (room in the arms for more of a good: the depot's, by its weight — what the arms lift —, within the load the world's
  // workers take, Vg.cap; the ledger does it, D-429)
  const roomFor = (w, k) => { const had = w.carry && w.carry.k === k ? w.carry.n : 0; return Math.max(0, Math.min(G.Vg.cap(w) - had, Math.floor(G.Depot.room('v:' + w.id, k) + EPS))); };
  // a yield born of the world into the hands, in the ledger with its cause (and its origin: G.Origem reads the code and the marks)
  function give(w, k, n, code, tag, of) {
    const c = { code, by: w.id, part: true }; if (tag) c.tag = tag; if (of) c.of = of;
    return G.Depot.make('v:' + w.id, k, n, c);
  }
  Tr.give = give;

  // ------------------------------ a stroke of a work ------------------------------
  // the act of one stroke (or one turn) of a work: the clip of the work, the world's seconds, the contact where the world does it.
  // spec: { id (the work), p (the provider), target, t (the tool asked: put in the hand at the stroke; none — the bare hands), dur,
  // contact, f (the way to face), vact, anim, reach, toolNow(w) (the tool now, when not Tr.tool), op(w, tool) → { ok, … }, then, fail }
  // The op is the world's: the tool asked again, put in the hand, then the work — or nothing, with the reason
  function stroke(spec) {
    const id = spec.id, g = GEST[spec.gest || id] || ['interact', '']; const t0 = spec.t;
    cur = { id, t: spec.target, p: spec.p, t0: G.S.clock, dur: spec.dur };
    // (the tool to the hand as the gesture begins — the world's next step, by the inventory's door: the axe is in the hands when
    // it is raised, not only when it lands; the stroke's own op asks again)
    if (t0 && t0.key) G.Possess.apply(w => (stillTool(w, id, t0, spec.toolNow).ok && inHand(w, t0) ? { ok: true } : { ok: false, why: '' }));
    const r = G.Avatar.act({ world: true, anim: spec.anim || g[0], dur: spec.dur, contact: spec.contact, face: spec.f, vact: spec.vact || g[1], reach: spec.reach || null,
      op: w => {
        const k = stillTool(w, id, t0, spec.toolNow); if (!k.ok) return k;
        if (t0 && t0.key && !inHand(w, k.t)) return { ok: false, why: loaded(w) ? 'Suas mãos estão com a carga: leve-a primeiro.' : `Não deu para pegar ${It.nome(k.t.key)}.` };
        return spec.op(w, k.t);
      },
      then: r => { last = { id, ok: true, r, t: G.S.clock }; if (spec.then) spec.then(r); },
      fail: r => { last = { id, ok: false, r, t: G.S.clock }; Tr.stop(); if (spec.fail) spec.fail(r); else deny(r); },
      done: () => { if (cur && cur.id === id) cur = null; } });
    if (r) cur.act = G.Avatar.actNow(); else cur = null;
    return r;
  }
  let cur = null, last = null; // (the work under way and the last answer: what the screen shows — only seen, never saved)
  G.worldHooks.push(() => { cur = null; last = null; chain = null; mineW = null; mineK = null; });
  // (the work under way is the body's act of it: an act cut — the body let go, another act — is no work under way)
  Tr.now = () => { if (cur && (!G.Avatar.actNow || G.Avatar.actNow() !== cur.act)) cur = null; return cur; }; Tr.last = () => last;

  // ------------------------------ holding the work: stroke after stroke ------------------------------
  // the verb of E held (20e times it, D-460): the same work again and again — the tree until it falls, the rock until the hands
  // are full, the patches of the field in reach — until it is done, cannot be done, or the body is moved by the player: each
  // stroke is the provider's own E, asked again at each (its reach, its can) — Tr.pump, the body's beat (trabalho-ui.js)
  let chain = null;
  Tr.chain = () => chain;
  Tr.hold = function (p, t, until) { chain = { p, t, until: until || null, n: 0, t0: G.S.clock }; return Tr.pump(); };
  Tr.stop = () => { chain = null; };
  Tr.pump = function () {
    const c = chain; if (!c) return false;
    const ctx = I.ctx(); if (!ctx || (G.Possess.body() !== ctx.v)) { chain = null; return false; }
    // (the player pushes the body to walk — the stick, the keys: read, never written —, or it walks: the work held is let go when
    // the stroke under way ends; the feet are the player's. A panel open waits)
    const IN = G.Avatar.input, st = G.Avatar.state();
    if ((IN && Math.abs(IN.mx || 0) + Math.abs(IN.mz || 0) > 0.2) || (st && st.speed > 0.6)) { chain = null; return false; }
    if (G.Avatar.busy()) return false;
    if (G.Modes && G.Modes.panel && G.Modes.panel()) return false;
    if (c.until && c.until(ctx)) { chain = null; return false; }
    const r = I.run({ id: c.p.id, p: c.p, t: c.t });
    if (!r || !r.ok) { chain = null; if (r && r.msg) say(r.msg); return false; }
    c.n++; return true;
  };
  // (the verb of E held for a provider: 'segurar', with the label and the end of the chain)
  const holdVerb = (label, until) => ({ k: 'segurar', label, can: (ctx, t) => ({ ok: true }), run(ctx, t) { const p = I.list.find(q => q.id === this.pid); return Tr.hold(p, t, until) ? { ok: true } : { ok: false, msg: '' }; } });

  // ------------------------------ what the screen shows ------------------------------
  // the work the body faces or is at, read only (no write, no chance): the work, the tool, how far along, what is left, what it
  // gives — each provider's own info(ctx, t). → { id, nome, tool, toolKey, mul, slow, why, pct, falta, rende, chain } or null
  Tr.info = function () {
    const ctx = I.ctx(); if (!ctx) return null;
    let p = null, t = null;
    if (Tr.now()) { p = I.list.find(q => q.id === cur.p); t = cur.t; }
    if (!p && chain) { p = chain.p; t = chain.t; }
    if (!p) { const b = G.IncUI && G.IncUI.best ? G.IncUI.best() : I.best(); if (b && b.p && b.p.work) { p = b.p; t = b.t; } }
    if (!p || !p.work || !p.info) return null;
    const o = p.info(ctx, t); if (!o) return null;
    const tl = Tr.tool(ctx.v, o.work || p.work);
    return Object.assign({ id: p.id, work: o.work || p.work, nome: WORKS[o.work || p.work].nome, tool: Tr.toolName(tl), toolKey: tl.key, mul: tl.mul, slow: tl.key ? (tl.share < 1 ? WORKS[o.work || p.work].pior || '' : '') : tl.slow || '', why: tl.why || '', busy: !!cur, chain: !!chain }, o);
  };
  // (the strokes still wanted at a counter: what is left ÷ what a stroke does)
  const strokesLeft = (left, per) => (per > EPS ? Math.max(1, Math.ceil(left / per - 1e-9)) : Infinity);
  // (a work done worse says so as it begins — once, not at every stroke of a work held: the hammer on the stone, the bare hands at
  // the bank and in the field)
  const slowSay = (id, tl) => { if (chain && chain.n > 0) return; const w = WORKS[id]; const s = tl.key ? (tl.share < 1 ? w.pior : '') : tl.slow; if (s) say(s, 2.6); };

  // ============================== the works ==============================
  // ------------------------------ a tree ------------------------------
  // felled the woodcutters' way (Nature.fellTree): each stroke the woodcutter's work of its time — dt × workMul — times what the
  // axe does, on the same counter the woodcutters fill, done by the world at the blow; then its wood taken in loads the size of
  // the arms (the depot's room, within the workers' load)
  I.add({
    id: 'arvore', prio: 3, reach: 2.4, work: 'cortar',
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
      if (tr.stage === 'log') {
        if (loaded(v) && (v.carry.k !== 'wood' || roomFor(v, 'wood') < 1)) return { ok: false, why: 'Suas mãos já estão cheias: guarde a carga no armazém.' };
        return { ok: true };
      }
      { const o = busyBy(v, tr.claim, tr.id); if (o) return { ok: false, why: `${Who(v, o)} já está cortando esta árvore.` }; }
      if (G.S.fire[W.idx(tr.x, tr.y)] > 0) return { ok: false, why: 'Está pegando fogo!' };
      const tl = Tr.tool(v, 'cortar'); if (!tl.key) return { ok: false, why: tl.why };
      if (loaded(v)) return { ok: false, why: 'Suas mãos estão com a carga: leve-a ao armazém antes de pegar o machado.' };
      return { ok: true };
    },
    run(ctx, t) {
      const tr = t.tr; const v = ctx.v; const P = G.Possess; const f = face(ctx, t.X, t.Z);
      if (!G.Nature.isChoppable(tr)) { deed('exame'); return { ok: true, card: treeCard(tr, v) }; }
      if (tr.stage === 'log') {
        // (the wood off the trunk into the arms, as the woodcutter takes his load: the empty hands go down to it, the world puts
        // the load in them — by the ledger —, and it comes up with the body)
        const g = AN('levantar');
        G.Avatar.act({ world: true, anim: 'carry', dur: g.dur, contact: g.contact, face: f, vact: g.act, reach: I.reachTo(toward(ctx, t.X, t.Z, 0.16), 0.5, 0.45),
          op: w => {
            if (!G.S.trees.has(tr.id) || tr.stage !== 'log') return { ok: false, why: 'A lenha não está mais aqui.' };
            if (!handsFor(w, 'wood')) return { ok: false, why: 'Suas mãos já estão cheias.' };
            const n = Math.min(roomFor(w, 'wood'), tr.wood);
            if (n <= 0) return { ok: false, why: 'Não cabe mais lenha nos seus braços: leve-a ao armazém.' };
            const r = give(w, 'wood', n, 'lenha'); if (!r.ok) return { ok: false, why: 'Não cabe mais lenha nos seus braços.' };
            tr.wood -= r.n; if (tr.wood <= 0) { tr.stage = 'stump'; tr.t = 0; tr.claim = 0; }
            G.Vg.emote(w, 'wood', 1.5); return { ok: true, n: r.n };
          }, then: r => say(`Você junta ${r.n} de lenha nos braços.`), fail: deny });
        return { ok: true };
      }
      const tl = Tr.tool(v, 'cortar');
      stroke({ id: 'cortar', p: 'arvore', target: t, t: tl, dur: WT.chop, contact: WT.chop * 0.62, f,
        op: (w, k) => {
          if (!G.S.trees.has(tr.id) || (tr.stage !== 'grow' && tr.stage !== 'burnt') || !G.Nature.isChoppable(tr)) return { ok: false, why: 'A árvore não está mais de pé.' };
          { const o = busyBy(w, tr.claim, tr.id); if (o) return { ok: false, why: `${Who(w, o)} já está cortando esta árvore.` }; }
          if (G.S.fire[W.idx(tr.x, tr.y)] > 0) return { ok: false, why: 'Está pegando fogo!' };
          const need = 3 * Math.max(0.5, tr.size); tr.claim = w.id; tr.chop += WT.chop * wm(w) * k.mul;
          if (tr.chop >= need) { G.Nature.fellTree(tr, w.face); P.deed('lenha'); tr.claim = 0; return { ok: true, fell: true }; }
          return { ok: true, pct: Math.min(99, Math.round(tr.chop / need * 100)) };
        },
        then: r => { G.Audio && G.Audio.at(tr.x, tr.y, 'chop'); G.FX && G.FX.chips(tr.x, tr.y, '#c9a26b'); say(r.fell ? 'Madeira! A árvore cai.' : `Golpe no tronco (${r.pct}%)`, 1.4); } });
      return { ok: true };
    },
    verbs(ctx, t) {
      const tr = t.tr; if (!G.Nature.isChoppable(tr)) return [];
      const out = [{ k: 'outra', label: 'Examinar a árvore', run(c2) { deed('exame'); return { ok: true, card: treeCard(tr, c2.v) }; } }];
      if (tr.stage === 'grow' || tr.stage === 'burnt') out.push(Object.assign(holdVerb('Cortar até cair', () => !G.S.trees.has(tr.id) || (tr.stage !== 'grow' && tr.stage !== 'burnt')), { pid: 'arvore' }));
      return out;
    },
    info(ctx, t) {
      const tr = t && t.tr; if (!tr || !G.S.trees.has(tr.id) || !G.Nature.isChoppable(tr)) return null;
      if (tr.stage === 'log') return { titulo: 'Lenha do tronco', pct: null, falta: `${Math.round(tr.wood)} de lenha no tronco`, rende: `até ${roomFor(ctx.v, 'wood')} de lenha por carga` };
      const tl = Tr.tool(ctx.v, 'cortar'); const need = 3 * Math.max(0.5, tr.size); const per = WT.chop * wm(ctx.v) * tl.mul;
      return { titulo: 'Cortando a árvore', pct: Math.min(1, tr.chop / need), falta: tl.key ? `faltam ${strokesLeft(need - tr.chop, per)} golpes` : '', rende: `≈ ${G.Nature.treeWood(tr)} de lenha` };
    },
  });
  function treeCard(tr, v) {
    const NAME = { oak: 'Carvalho', apple: 'Macieira', mulberry: 'Amoreira', olive: 'Oliveira', cacao: 'Cacaueiro', coffee: 'Cafeeiro', pepper: 'Pimenteira', birch: 'Bétula', willow: 'Salgueiro', pine: 'Pinheiro', snowpine: 'Pinheiro da neve', jungle: 'Árvore da selva', acacia: 'Acácia', baobab: 'Baobá', cactus: 'Cacto', incense: 'Árvore do incenso', palm: 'Palmeira', date: 'Tamareira', acai: 'Açaizeiro', banana: 'Bananeira' };
    const st = { grow: tr.size < 0.6 ? 'nova demais para o machado' : 'adulta', burnt: 'queimada', log: 'caída, esperando quem leve a lenha', stump: 'um toco' }[tr.stage] || tr.stage;
    const rows = [['Lenha', tr.stage === 'log' ? Math.round(tr.wood) : tr.stage === 'grow' && tr.size >= 0.6 ? '≈ ' + Math.round(G.Nature.treeWood ? G.Nature.treeWood(tr) : 4) : '—']];
    if (v && G.Nature.isChoppable(tr) && (tr.stage === 'grow' || tr.stage === 'burnt')) {
      const tl = Tr.tool(v, 'cortar'); const need = 3 * Math.max(0.5, tr.size);
      rows.push(['Com o que você tem', tl.key ? `${It.nome(tl.key)}: uns ${strokesLeft(need - tr.chop, WT.chop * wm(v) * tl.mul)} golpes` : 'sem machado, não dá']);
    }
    return { kind: 'thing', name: NAME[tr.kind] || 'Árvore', sub: st, rows };
  }

  // ------------------------------ a bush ------------------------------
  // the berries picked into the hands (the picker's 2.2 s of the world ÷ workMul for a load), or eaten on the spot (F; E when hungry)
  I.add({
    id: 'arbusto', prio: 3, reach: 2.2, work: 'colher',
    find(ctx) {
      const out = []; const S = G.S; const x0 = Math.floor(ctx.x), y0 = Math.floor(ctx.y);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const x = x0 + dx, y = y0 + dy; if (!W.inb(x, y)) continue; const o = S.objAt[W.idx(x, y)]; const b = o && S.bushes.get(o); if (b) out.push({ bu: b, X: b.x * L(), Z: b.y * L() }); }
      return out;
    },
    label(ctx, t) { return t.bu.berries >= 1 ? (ctx.v.hunger > 40 ? 'Comer frutas do arbusto' : 'Colher frutas') : 'Examinar o arbusto'; },
    can(ctx, t) { return canBush(ctx.v, t.bu, ctx.v.hunger > 40); },
    run(ctx, t) { return pickBush(ctx, t, ctx.v.hunger > 40); },
    verbs(ctx, t) {
      if (t.bu.berries < 1) return [];
      const eat = ctx.v.hunger > 40; // (the other of the two: to carry when hungry, to eat when not)
      return [{ k: 'outra', label: eat ? 'Colher para levar' : 'Comer as frutas aqui', can: c2 => canBush(c2.v, t.bu, !eat), run: c2 => pickBush(c2, t, !eat) }];
    },
    info(ctx, t) {
      const b = t && t.bu; if (!b || !G.S.bushes.has(b.id) || b.berries < 1) return null;
      return { titulo: 'Colhendo frutas', pct: cur && cur.id === 'colher' ? G.clamp((G.S.clock - cur.t0) / Math.max(0.01, cur.dur), 0, 1) : null, falta: `${Math.floor(b.berries)} frutas no arbusto`, rende: `${Math.min(roomFor(ctx.v, 'food'), Math.floor(b.berries))} de comida por carga` };
    },
  });
  function canBush(v, b, eat) {
    if (!G.S.bushes.has(b.id)) return { ok: false, why: 'Não está mais aqui.' };
    if (b.berries < 1) return { ok: true };
    { const o = busyBy(v, b.claim, b.id); if (o) return { ok: false, why: `${Who(v, o)} está colhendo aqui.` }; }
    if (!eat && loaded(v) && (!handsFor(v, 'food') || roomFor(v, 'food') < 1)) return { ok: false, why: 'Suas mãos já estão cheias.' };
    return { ok: true };
  }
  function pickBush(ctx, t, eat) {
    const b = t.bu; const v = ctx.v; const P = G.Possess; const f = face(ctx, t.X, t.Z);
    if (b.berries < 1) { deed('exame'); return { ok: true, card: { kind: 'thing', name: 'Arbusto', sub: b.burnt > 0 ? 'queimado' : 'sem frutas agora', rows: [] } }; }
    const dur = WT.gather / wm(v);
    stroke({ id: 'colher', p: 'arbusto', target: t, t: null, dur, contact: dur * 0.9, f,
      op: w => {
        if (!G.S.bushes.has(b.id) || b.berries < 1) return { ok: false, why: 'Não sobrou fruta neste arbusto.' };
        { const o = busyBy(w, b.claim, b.id); if (o) return { ok: false, why: `${Who(w, o)} está colhendo aqui.` }; }
        if (eat) { const n = Math.min(b.berries, 2); b.berries -= n; w.hunger = Math.max(0, w.hunger - 32 * n); G.Vg.emote(w, 'food', 1.5); P.deed('frutas'); return { ok: true, ate: n }; }
        if (!handsFor(w, 'food')) return { ok: false, why: 'Suas mãos já estão cheias.' };
        const n = Math.min(roomFor(w, 'food'), Math.floor(b.berries)); if (n <= 0) return { ok: false, why: 'Suas mãos já estão cheias.' };
        // (the fruit of the bush into the hands, in the ledger — its origin the fruit, by the cause and the mark: G.Origem)
        const r = give(w, 'food', n, 'fruta', { berries: 1 }); if (!r.ok) return { ok: false, why: 'Suas mãos já estão cheias.' };
        b.berries -= r.n; P.deed('frutas'); return { ok: true, n: r.n };
      }, then: r => say(r.ate ? 'Você come as frutas.' : `Você colhe ${r.n} de frutas.`) });
    return { ok: true };
  }

  // ------------------------------ a rock ------------------------------
  // broken the quarrymen's way: each stroke of the pick the quarryman's work of its time — dt × workMul —, times what the tool
  // does, counted by the body at this rock as the quarryman counts his; at his 3.8 the rock gives the load the arms can hold
  // (its stone leaves it; the last stone takes the rock away). Done by the world at the blow
  let mineW = null; // (the body's count of the work at a rock — nothing of the world, nothing saved)
  I.add({
    id: 'pedra', prio: 3, reach: 2.6, work: 'quebrar',
    find(ctx) {
      const out = []; const S = G.S; const x0 = Math.floor(ctx.x), y0 = Math.floor(ctx.y);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const x = x0 + dx, y = y0 + dy; if (!W.inb(x, y)) continue; const o = S.objAt[W.idx(x, y)]; const r = o && S.rocks.get(o); if (r) out.push({ r, X: r.x * L(), Z: r.y * L() }); }
      return out;
    },
    label() { return 'Quebrar pedra'; },
    can(ctx, t) {
      const r = t.r; const v = ctx.v; if (!G.S.rocks.has(r.id) || r.stone < 1) return { ok: false, why: 'Não sobrou pedra aqui.' };
      if (!hands(v)) return { ok: false, why: 'Você não tem força nem mãos para isso.' };
      { const o = busyBy(v, r.claim, r.id); if (o) return { ok: false, why: `${Who(v, o)} está trabalhando nesta pedra.` }; }
      const tl = Tr.tool(v, 'quebrar'); if (!tl.key) return { ok: false, why: tl.why };
      if (loaded(v)) return { ok: false, why: v.carry.k === 'stone' ? 'Suas mãos estão com as pedras: leve-as ao armazém ou a uma obra.' : 'Suas mãos estão com a carga: leve-a primeiro.' };
      return { ok: true };
    },
    run(ctx, t) {
      const r = t.r; const P = G.Possess; const f = face(ctx, t.X, t.Z); const tl = Tr.tool(ctx.v, 'quebrar'); slowSay('quebrar', tl);
      stroke({ id: 'quebrar', p: 'pedra', target: t, t: tl, dur: WT.mine, contact: WT.mine * 0.62, f, vact: tl.kind === 'martelo' ? 'hammer' : 'mine', anim: tl.kind === 'martelo' ? 'hammer' : null,
        op: (w, k) => {
          if (!G.S.rocks.has(r.id) || r.stone < 1) { mineW = null; return { ok: false, why: 'Não sobrou pedra aqui.' }; }
          { const o = busyBy(w, r.claim, r.id); if (o) return { ok: false, why: `${Who(w, o)} está trabalhando nesta pedra.` }; }
          if (loaded(w)) return { ok: false, why: 'Suas mãos já estão cheias.' };
          if (!mineW || mineW.id !== r.id || mineW.v !== w.id) mineW = { id: r.id, v: w.id, w: 0 };
          mineW.w += WT.mine * wm(w) * k.mul;
          if (mineW.w <= WT.mineLoad) return { ok: true, pct: Math.min(99, Math.round(mineW.w / WT.mineLoad * 100)) };
          // (the stroke's work past the load goes to the next; the stone the arms lift, by the ledger — the rock's last takes it)
          const n = Math.min(roomFor(w, 'stone'), r.stone); if (n < 1) return { ok: false, why: 'Suas mãos não aguentam a pedra.' };
          const g = give(w, 'stone', n, 'pedra'); if (!g.ok) return { ok: false, why: 'Suas mãos não aguentam a pedra.' };
          mineW.w -= WT.mineLoad; r.stone -= g.n; if (r.stone <= 0) { G.Nature.removeRock(r); mineW = null; }
          P.deed('pedra', g.n); return { ok: true, got: g.n };
        },
        then: res => { G.Audio && G.Audio.at(r.x, r.y, 'mine'); G.FX && G.FX.chips(r.x, r.y, '#a9a9a9'); say(res.got ? `Você solta ${res.got} ${res.got > 1 ? 'pedras' : 'pedra'} da rocha.` : `Golpe na pedra (${res.pct}%)`, 1.4); if (res.got) Tr.stop(); } });
      return { ok: true };
    },
    verbs(ctx, t) {
      const r = t.r; return [
        { k: 'outra', label: 'Examinar a pedra', run(c2) { deed('exame'); const tl = Tr.tool(c2.v, 'quebrar'); return { ok: true, card: { kind: 'thing', name: 'Rocha', sub: 'pedra para as obras', rows: [['Pedra', Math.round(r.stone)], ['Com o que você tem', tl.key ? `${It.nome(tl.key)}: uns ${strokesLeft(WT.mineLoad, WT.mine * wm(c2.v) * tl.mul)} golpes por carga` : 'sem picareta, não dá']] } }; } },
        Object.assign(holdVerb('Quebrar até encher as mãos', c2 => loaded(c2.v) || !G.S.rocks.has(r.id)), { pid: 'pedra' }),
      ];
    },
    info(ctx, t) {
      const r = t && t.r; if (!r || !G.S.rocks.has(r.id)) return null;
      const tl = Tr.tool(ctx.v, 'quebrar'); const w = mineW && mineW.id === r.id && mineW.v === ctx.v.id ? mineW.w : 0; const per = WT.mine * wm(ctx.v) * tl.mul;
      return { titulo: 'Quebrando pedra', pct: Math.min(1, w / WT.mineLoad), falta: tl.key ? `faltam ${strokesLeft(WT.mineLoad - w, per)} golpes para a carga` : '', rende: `${Math.min(roomFor(ctx.v, 'stone') || G.Vg.cap(ctx.v), Math.round(r.stone))} pedras por carga · ${Math.round(r.stone)} na rocha` };
    },
  });

  // ------------------------------ gold on the ground ------------------------------
  // (the god's Chuva de Ouro, a dragon's hoard): picked up before the others get to it — the powers' own door (Powers.takeGold)
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

  // ------------------------------ fishing ------------------------------
  // the world's own fishing (act-pesca.js): that water's fish, counted out of its ground, by the gear in the body's hand — the net
  // thrown and pulled, the rod cast and its line watched, the spear poised and thrust, or the bare hands in the shallows —, its
  // cast the world's gesture of that gear (G.Pesca.castDur), the world's dice, into the hands through the ledger ('pesca').
  // With a gear, from the bank or wading; with the hands, only wading. What bites is that water's own
  const isFishWater = (S, i) => (S.type[i] === G.T.RIVER || S.type[i] <= G.T.SEA) && !(S.ice && S.ice[i]) && !(S.dry && S.dry[i]);
  // (the way the body fishes now is the thing in its hand — the net, the rod, the spear —, the player's choice by the quick keys;
  // with none in the hand, the hands: a rod on the back does not cast itself)
  Tr.gear = function (v) {
    const tl = Tr.tool(v, 'pescar');
    return tl.key && tl.hand ? tl : { key: null, kind: null, mul: 1, how: 'maos', why: '', slow: '', hand: false };
  };
  I.add({
    id: 'peixe', prio: 3.2, reach: 1.6, here: true, work: 'pescar', // (here: always a stride straight before the body, wherever it looks)
    find(ctx) {
      const S = G.S; const wade = G.Avatar.wade(); const tl = Tr.gear(ctx.v);
      // (with a gear in the hand the water may be a stride or two before the feet — the bank of a river, the edge of the sea; a gear
      // in the bag, or the bare hands, only where the body stands in it: at the water's edge the drink and the rest come first)
      const bank = !!(tl.key && tl.hand); const reachW = bank ? (tl.how === 'linha' ? 2.4 : tl.how === 'rede' ? 2 : 1.3) : 0.7;
      if (!bank && wade < 0.12) return [];
      for (const d of bank ? [reachW, reachW * 0.6, 0.7] : [0.7]) {
        const X = ctx.X + Math.cos(ctx.yaw) * d, Z = ctx.Z + Math.sin(ctx.yaw) * d; const x = X / L(), y = Z / L();
        if (!W.inb(x, y) || !isFishWater(S, W.idx(x, y))) continue;
        return [{ X, Z, x, y, sea: S.type[W.idx(x, y)] <= G.T.SEA, d, reach: Math.max(1.6, d + 0.4) }];
      }
      return [];
    },
    label(ctx, t) { const g = Tr.gear(ctx.v, t.x, t.y); return g.how === 'rede' ? 'Lançar a rede' : g.how === 'linha' ? 'Lançar a linha' : g.how === 'arpao' ? 'Pescar com a lança' : 'Pescar com as mãos'; },
    can(ctx, t) {
      const v = ctx.v; if (!hands(v)) return { ok: false, why: 'Você não tem mãos para isso.' };
      if (v.carry && v.carry.n > 0 && !v.carry.fish) return { ok: false, why: 'Suas mãos já estão cheias.' };
      if (v.carry && v.carry.n >= 8) return { ok: false, why: 'Não cabe mais peixe nas mãos: leve ao armazém.' };
      const g = Tr.gear(v, t.x, t.y); if (g.key && v.carry && v.carry.n > 0) return { ok: false, why: 'Suas mãos estão com o peixe: leve-o ao armazém antes de pegar ' + It.nome(g.key) + '.' };
      if (G.Pesca) { const c = G.Pesca.can(v, t.x, t.y, g.how || 'maos'); if (!c.ok && !c.empty) return c; }
      return { ok: true };
    },
    run(ctx, t) {
      const v = ctx.v; const f = ctx.yaw; const tl = Tr.gear(v, t.x, t.y); const how = tl.how || 'maos';
      const splash = () => { if (G.FX3D) for (let k = 0; k < 10; k++) G.FX3D.spawn({ x: t.X + G.vrr(-0.2, 0.2), y: G.Avatar.waterAt(t.X, t.Z) + 0.05, z: t.Z + G.vrr(-0.2, 0.2), vx: G.vrr(-0.8, 0.8), vy: G.vrr(1, 2.2), vz: G.vrr(-0.8, 0.8), life: 0.7, s0: 0.07, s1: 0.03, c: [0.86, 0.94, 1], a: 0.8, sh: 1, grav: 9 }); G.Audio && G.Audio.play && G.Audio.play('splash'); };
      // (a cast of the world's time — the gear's gesture of anyone of the world, G.Pesca.castDur, with its contact: L-212 —, its
      // luck and its fish the world's, drawn by the world at the contact)
      const Pg = G.Pesca && G.Pesca.gesture(how); const dur = Pg ? G.Pesca.castDur(v, how) : WT.fish / wm(v);
      stroke({ id: 'pescar', gest: how, p: 'peixe', target: t, t: tl.key ? tl : null, toolNow: w => Tr.gear(w, t.x, t.y), dur, contact: Pg ? dur * Pg.contact / Pg.dur : dur * 0.55, f,
        op: w => {
          if (w.carry && w.carry.n > 0 && !w.carry.fish) return { ok: false, why: 'Suas mãos já estão cheias.' };
          // (the water may have frozen or gone meanwhile — the god's winter, the sea opened)
          if (!isFishWater(G.S, W.idx(t.x, t.y))) return { ok: false, why: 'A água não está mais ali.' };
          if (G.Pesca) {
            const r = G.Pesca.cast(w, t.x, t.y, { how });
            const nm = r.name ? (/a$/.test(r.name) ? 'uma ' : 'um ') + r.name : 'um peixe';
            if (!r.ok) return r.miss ? { ok: false, why: how === 'maos' ? 'Escapou entre os dedos…' : how === 'rede' ? 'A rede volta vazia.' : how === 'arpao' ? 'A lança bate na água vazia.' : 'Nada mordeu a isca.', slip: 1 } : { ok: false, why: r.other ? `Você pegou ${nm}, mas não tem mão para ele: solta de volta.` : r.why || 'Escapou…', slip: r.other ? 1 : 0 };
            G.Possess.deed(how === 'maos' ? 'pesca' : 'pescado', r.n); return { ok: true, nm, n: r.n };
          }
          // (the world's dice: the hands are slower than a line; and what bites is that water's own fish)
          if (G.R() < 0.55) return { ok: false, why: 'Escapou entre os dedos…', slip: 1 };
          const c = G.Waters ? G.Waters.catchCarry(w, t.x, t.y, 1) : { k: 'food', n: 1, fish: 'carpa' };
          if (!G.S.villagers.has(w.id)) return { ok: false, why: '' };
          const F = G.Waters && G.Waters.FISH[c.fish]; const nm = F ? (/a$/.test(F.name) ? 'uma ' : 'um ') + F.name : 'um peixe';
          if (w.carry && w.carry.n > 0 && w.carry.k !== c.k) return { ok: false, why: `Você pegou ${nm}, mas não tem mão para ele: solta de volta.` };
          const g = give(w, c.k, c.n, 'pesca', { fish: c.fish }); if (!g.ok) return { ok: false, why: 'Não cabe mais peixe nas mãos.' };
          G.Possess.deed('pesca'); return { ok: true, nm };
        },
        then: r => { splash(); say(`Você pegou ${r.n > 1 ? r.n + ' peixes: ' : ''}${r.nm}! Leve ao armazém.`, 3); },
        fail: r => { if (r.slip) splash(); deny(r); } });
      return { ok: true, msg: how === 'maos' ? (t.sea ? 'Você se abaixa e espera um peixe passar entre as pernas…' : 'Você se abaixa na água rasa, as mãos em concha…') : how === 'rede' ? 'Você junta a rede e a lança na água…' : how === 'linha' ? 'Você lança a linha e espera…' : 'Você ergue a lança e espera um peixe passar…' };
    },
    verbs(ctx, t) { return [Object.assign(holdVerb('Pescar até encher as mãos', c2 => !!(c2.v.carry && c2.v.carry.n >= Math.min(8, G.Vg.cap(c2.v)))), { pid: 'peixe' })]; },
    info(ctx, t) {
      if (!t) return null; const g = Tr.gear(ctx.v, t.x, t.y); const how = g.how || 'maos'; const G0 = G.Pesca && G.Pesca.GEAR[how];
      const st = G.Pesca ? G.Pesca.stock(t.x, t.y) : null;
      return { titulo: { maos: 'Pescando com as mãos', linha: 'Pescando com a linha', rede: 'Pescando com a rede', arpao: 'Pescando com a lança' }[how], pct: cur && cur.id === 'pescar' ? G.clamp((G.S.clock - cur.t0) / Math.max(0.01, cur.dur), 0, 1) : null, falta: st ? (st.ab < 0.2 ? 'pouco peixe nesta água' : st.ab < 0.6 ? 'peixe nesta água' : 'muito peixe nesta água') : '', rende: G0 ? `${G0.n[0]}–${G0.n[1]} peixe${G0.n[1] > 1 ? 's' : ''} por lance, se morder` : '' };
    },
  });

  // ------------------------------ a carcass ------------------------------
  // a beast killed (by the body's hand, a hunter's, the god's): skinned with the knife the hunters' way (Riches.carcass — the
  // hunter's 4 of work ÷ workMul, times what the knife does), its meat into the arms and its hide, tusks, plumes going with the load
  // (delivered to the store as the hunter's are: Riches.unload, 'caca'); a beast with nothing of a hide gives its meat the same
  const hasSpoils = a => { const s = G.Riches && G.Riches.spoilsOf ? G.Riches.spoilsOf(a) : {}; for (const k in s) return true; return false; };
  const beastName = a => { const d = G.Animals.DEF[a.kind]; return d ? (d.name || a.kind).toLowerCase() : 'bicho'; };
  I.add({
    id: 'carcaca', prio: 3.1, reach: 2.2, work: 'esfolar',
    find(ctx) { const out = []; const R = 2.4 / L(); for (const a of G.S.animals.values()) { if (!a.dead || a.held || a.skinned || !(a.meat > 0.5) || Math.abs(a.x - ctx.x) > R || Math.abs(a.y - ctx.y) > R) continue; out.push({ a, X: a.x * L(), Z: a.y * L() }); } return out; },
    label(ctx, t) { const d = G.Animals.DEF[t.a.kind]; const art = d && d.g === 'f' ? 'a' : 'o'; return hasSpoils(t.a) ? `Esfolar ${art} ${beastName(t.a)}` : `Tirar a carne d${art} ${beastName(t.a)}`; },
    can(ctx, t) {
      const a = t.a; const v = ctx.v; if (!G.S.animals.has(a.id) || a.skinned || !(a.meat > 0.5)) return { ok: false, why: 'Não sobrou nada aqui.' };
      if (!hands(v)) return { ok: false, why: 'Você não tem mãos para isso.' };
      { const o = a.claim && a.claim !== v.id ? G.S.villagers.get(a.claim) : null; if (o && o.task && o.task.id === a.id) return { ok: false, why: `${Who(v, o)} já está cuidando deste bicho.` }; }
      const tl = Tr.tool(v, 'esfolar'); if (!tl.key) return { ok: false, why: tl.why };
      if (loaded(v)) return { ok: false, why: 'Suas mãos estão com a carga: leve-a primeiro.' };
      return { ok: true };
    },
    run(ctx, t) {
      const a = t.a; const v = ctx.v; const f = face(ctx, t.X, t.Z); const tl = Tr.tool(v, 'esfolar'); const dur = WT.skin / wm(v) / Math.max(0.05, tl.mul);
      stroke({ id: 'esfolar', p: 'carcaca', target: t, t: tl, dur, contact: dur * 0.94, f, reach: I.reachTo(toward(ctx, t.X, t.Z, 0.12), 0.35, 0.45),
        op: w => {
          if (!G.S.animals.has(a.id) || a.skinned || !(a.meat > 0.5)) return { ok: false, why: 'Não sobrou nada aqui.' };
          { const o = a.claim && a.claim !== w.id ? G.S.villagers.get(a.claim) : null; if (o && o.task && o.task.id === a.id) return { ok: false, why: `${Who(w, o)} já está cuidando deste bicho.` }; }
          if (loaded(w)) return { ok: false, why: 'Suas mãos já estão cheias.' };
          // (the hunter's own numbers: up to eight of the meat, by the people's hand at the hunt; the hide and the rest along)
          const sp = hasSpoils(a) ? G.Riches.spoilsOf(a) : null; const take = Math.min(8, Math.max(1, a.meat));
          const meat = Math.max(1, Math.round(take * G.Civ.tV(w, 'hunt')));
          const tag = { meat: a.kind, from: a.kind }; if (sp) tag.extra = sp; if (a.morph) tag.morph = a.morph;
          const r = give(w, 'food', meat, 'caca', tag); if (!r.ok) return { ok: false, why: 'Suas mãos não aguentam tanta carne.' };
          a.meat -= take; if (sp) { a.skinned = true; a.flay = 1; }
          if (G.Riches.noteKill && sp) G.Riches.noteKill(w, a, G.Animals.DEF[a.kind], sp);
          if (a.meat <= 0.5) G.Animals.remove(a); else a.claim = 0;
          G.Vg.emote(w, a.morph ? 'star' : 'food', 1.6); G.Possess.deed('esfolar');
          return { ok: true, n: r.n, sp: sp ? Object.keys(sp).map(k => G.Eco.name(k)).join(', ') : '' };
        },
        then: r => { G.FX && G.FX.blood && G.FX.blood(a.x, a.y); say(`Você tira ${r.n} de carne${r.sp ? ' e ' + r.sp : ''}. Leve ao armazém.`, 3); } });
      return { ok: true };
    },
    info(ctx, t) {
      const a = t && t.a; if (!a || !G.S.animals.has(a.id)) return null; const sp = hasSpoils(a) ? G.Riches.spoilsOf(a) : null;
      return { titulo: hasSpoils(a) ? 'Esfolando' : 'Tirando a carne', pct: cur && cur.id === 'esfolar' ? G.clamp((G.S.clock - cur.t0) / Math.max(0.01, cur.dur), 0, 1) : null, falta: '', rende: `≈ ${Math.max(1, Math.round(Math.min(8, Math.max(1, a.meat)) * G.Civ.tV(ctx.v, 'hunt')))} de carne${sp ? ' · ' + Object.keys(sp).map(k => G.Eco.name(k)).join(', ') : ''}` };
    },
  });

  // ------------------------------ a ripe patch of a field ------------------------------
  // the farmer's harvest (villagers.js farm): a patch of the body's people ripe (its crop at 3), in the farmer's 1.5 s of the
  // world ÷ workMul — by the sickle, or slower by the hands —; its grain by the farmer's own sums and dice, into the hands in the
  // ledger with the grain of that field as its origin (Estates.grainOf, in the world's step; the screen reads grainFor)
  const patches = (ctx, R) => {
    const out = []; const S = G.S; const fid = G.Fac.idOfV(ctx.v);
    for (const b of S.buildings.values()) {
      if (b.type !== 'farm' || !b.built || !b.crops || b.x > ctx.x + R || b.x + 3 < ctx.x - R || b.y > ctx.y + R || b.y + 3 < ctx.y - R) continue;
      if (G.Village.facOfSet(b.set) !== fid) continue;
      for (let k = 0; k < 9; k++) { const c = b.crops[k]; if (!c || c.s !== 3) continue; const [px, py] = G.Village.cropPos(b, k); if (Math.abs(px - ctx.x) > R || Math.abs(py - ctx.y) > R) continue; out.push({ b, k, X: px * L(), Z: py * L() }); }
    }
    return out;
  };
  const grainName = b => { const g = G.Estates && G.Estates.grainFor ? G.Estates.grainFor(b) : null; return g && G.Origem && G.Origem.FOOD[g] ? G.Origem.FOOD[g].nome : 'trigo'; };
  I.add({
    id: 'campo', prio: 2.9, reach: 1.8, work: 'ceifar',
    find(ctx) { return patches(ctx, 1.6); },
    label(ctx, t) { return `Colher o ${grainName(t.b)}`; },
    can(ctx, t) {
      const b = t.b; const c = b.crops && b.crops[t.k]; const v = ctx.v; if (!G.S.buildings.has(b.id) || !c || c.s !== 3) return { ok: false, why: 'Não há o que colher aqui agora.' };
      if (!hands(v)) return { ok: false, why: 'Você não tem mãos para isso.' };
      { const o = c.c && c.c !== v.id ? G.S.villagers.get(c.c) : null; if (o && o.task && o.task.type === 'farm' && o.task.id === b.id && o.task.k === t.k) return { ok: false, why: `${Who(v, o)} está colhendo este canteiro.` }; }
      if (G.S.fire[W.idx(...G.Village.cropPos(b, t.k))] > 0) return { ok: false, why: 'Está pegando fogo!' };
      if (loaded(v) && (!handsFor(v, 'food') || roomFor(v, 'food') < 1)) return { ok: false, why: 'Suas mãos já estão cheias: leve a colheita ao armazém.' };
      return { ok: true }; // (with the arms full of sheaves the sickle waits at the belt: the hands pull the next one, slower — run)
    },
    run(ctx, t) {
      const b = t.b; const v = ctx.v; const f = face(ctx, t.X, t.Z); let tl = Tr.tool(v, 'ceifar');
      if (tl.key && loaded(v)) tl = { key: null, mul: WORKS.ceifar.bare, kind: null }; // (the arms full: the hands pull the next sheaf)
      const dur = WT.reap / wm(v) / Math.max(0.05, tl.mul); slowSay('ceifar', tl);
      stroke({ id: 'ceifar', p: 'campo', target: t, t: tl.key ? tl : null, dur, contact: dur * 0.82, f, anim: tl.key ? 'ceifar' : 'colher-mato',
        op: w => {
          const c = b.crops && b.crops[t.k]; if (!G.S.buildings.has(b.id) || !c || c.s !== 3) return { ok: false, why: 'Não há o que colher aqui agora.' };
          { const o = c.c && c.c !== w.id ? G.S.villagers.get(c.c) : null; if (o && o.task && o.task.type === 'farm' && o.task.id === b.id && o.task.k === t.k) return { ok: false, why: `${Who(w, o)} está colhendo este canteiro.` }; }
          if (!handsFor(w, 'food')) return { ok: false, why: 'Suas mãos já estão cheias.' };
          const S = G.S; const [px, py] = G.Village.cropPos(b, t.k);
          // (the farmer's own sums: each people farms its way — the river's flood, the maize —, the aqueduct's water, the world's dice)
          let yf = (3 + (S.fert[W.idx(px, py)] > 0.7 ? 1 : 0)) * G.Civ.tV(w, 'farm');
          if (G.Civ.tV(w, 'riverFarm') > 1 && G.Civ.nearRiver(px, py, 5)) yf *= G.Civ.tV(w, 'riverFarm');
          if (b.aqua) yf *= 1.2;
          const y = Math.floor(yf) + (G.R() < yf % 1 ? 1 : 0);
          c.s = 0; c.g = 0; c.c = 0;
          const grain = G.Estates ? (G.Estates.grainOf(b), b.grain) : null;
          let n = 0; if (y > 0) { const r = give(w, 'food', Math.min(y, roomFor(w, 'food') || y), 'colheita', { grain: 1 }, grain || undefined); n = r.ok ? r.n : 0; }
          if (G.Urban) G.Urban.note(px, py, 'campo', 1); // (the life of the quarter: a harvest)
          G.Possess.deed('colheita'); return { ok: true, n, left: y - n };
        },
        then: r => { G.FX && G.FX.chips(t.X / L(), t.Z / L(), '#e8c24a'); say(r.n ? `Você colhe ${r.n} de ${grainName(b)}${r.left > 0 ? ` (${r.left} ficou no chão: os braços estão cheios)` : ''}.` : 'O canteiro não deu nada.', 2); } });
      return { ok: true };
    },
    verbs(ctx, t) { return [Object.assign(holdVerb('Colher os canteiros em volta', c2 => !!(c2.v.carry && c2.v.carry.n >= Math.min(6, roomFor(c2.v, 'food') + c2.v.carry.n))), { pid: 'campo' })]; },
    info(ctx, t) {
      if (!t || !t.b) return null; const ps = patches(ctx, 3);
      return { titulo: `Colhendo o ${grainName(t.b)}`, pct: cur && cur.id === 'ceifar' ? G.clamp((G.S.clock - cur.t0) / Math.max(0.01, cur.dur), 0, 1) : null, falta: `${ps.length} canteiro${ps.length === 1 ? '' : 's'} madur${ps.length === 1 ? 'o' : 'os'} por perto`, rende: '3 a 4 por canteiro' };
    },
  });

  // ------------------------------ clay at a river's bank ------------------------------
  // the potter's clay (act-oficio.js 'cavar', economy.js clayPit): a bank of a river — dry ground beside the running water, no
  // house nor tree on it —, dug in the potter's 5 s of the world ÷ workMul (by the spade; slower by a hoe or the bare hands),
  // three of clay into the hands, in the ledger ('barreiro'), a plain load for the people's store
  const bankAt = (S, x, y) => {
    if (!W.inb(x, y)) return false; const i = W.idx(x, y);
    if (!W.walkable(i) || S.type[i] === G.T.RIVER || S.occ[i] || S.treeAt[i]) return false;
    for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (W.inb(x + ax, y + ay) && S.type[W.idx(x + ax, y + ay)] === G.T.RIVER) return true;
    return false;
  };
  I.add({
    id: 'barro', prio: 1, reach: 1.6, here: true, work: 'cavar', // (the bank is every river's edge: meant before the rest only with the spade or the hoe in the hand — pref)
    find(ctx) {
      const S = G.S; const X = ctx.X + Math.cos(ctx.yaw) * 0.6, Z = ctx.Z + Math.sin(ctx.yaw) * 0.6; const x = Math.floor(X / L()), y = Math.floor(Z / L());
      if (!bankAt(S, x, y)) return [];
      const h = Inv.held(ctx.v).mao, k = h && It.def(h) ? It.def(h).kind : null;
      return [{ X, Z, x: x + 0.5, y: y + 0.5, pref: k === 'pa' || k === 'enxada' ? 1.6 : 0 }];
    },
    label() { return 'Cavar argila na margem'; },
    can(ctx, t) {
      const v = ctx.v; if (!hands(v)) return { ok: false, why: 'Você não tem mãos para isso.' };
      if (!bankAt(G.S, Math.floor(t.x), Math.floor(t.y))) return { ok: false, why: 'Aqui não há barro.' };
      if (loaded(v) && (!handsFor(v, 'argila') || roomFor(v, 'argila') < 1)) return { ok: false, why: 'Suas mãos já estão cheias.' };
      const tl = Tr.tool(v, 'cavar'); if (tl.key && loaded(v)) return { ok: false, why: 'Suas mãos estão com a argila: leve-a ao armazém antes de pegar a pá.' };
      return { ok: true };
    },
    run(ctx, t) {
      const v = ctx.v; const f = face(ctx, t.X, t.Z); const tl = Tr.tool(v, 'cavar'); const g = AN('cavar');
      const dur = (g.dur || WT.clay) / wm(v) / Math.max(0.05, tl.mul); slowSay('cavar', tl);
      stroke({ id: 'cavar', p: 'barro', target: t, t: tl.key ? tl : null, dur, contact: dur * 0.92, f, anim: tl.kind === 'enxada' ? 'hoe' : tl.key ? 'pa' : 'cavar-maos', vact: tl.kind === 'enxada' ? 'rake' : tl.key ? 'dig' : 'gather',
        op: w => {
          if (!bankAt(G.S, Math.floor(t.x), Math.floor(t.y))) return { ok: false, why: 'Aqui não há mais barro.' };
          if (!handsFor(w, 'argila')) return { ok: false, why: 'Suas mãos já estão cheias.' };
          const n = Math.min(3, roomFor(w, 'argila')); if (n < 1) return { ok: false, why: 'Suas mãos não aguentam mais argila.' };
          const r = give(w, 'argila', n, 'barreiro'); if (!r.ok) return { ok: false, why: 'Suas mãos não aguentam mais argila.' };
          const fac = G.Fac.ofV(w); if (fac && G.Eco.made) G.Eco.made(fac, 'argila', r.n);
          if (G.Urban) G.Urban.note(t.x, t.y, 'mina', 1);
          G.Possess.deed('argila'); return { ok: true, n: r.n };
        },
        then: r => { G.FX && G.FX.chips(t.x, t.y, '#8a5a3a'); say(`Você tira ${r.n} de argila da margem. Leve ao armazém.`, 2.4); } });
      return { ok: true };
    },
    verbs(ctx, t) { return [Object.assign(holdVerb('Cavar até encher as mãos', c2 => loaded(c2.v) && roomFor(c2.v, 'argila') < 1), { pid: 'barro' })]; },
    info(ctx, t) { return { titulo: 'Cavando argila', pct: cur && cur.id === 'cavar' ? G.clamp((G.S.clock - cur.t0) / Math.max(0.01, cur.dur), 0, 1) : null, falta: '', rende: `até ${Math.min(3, roomFor(ctx.v, 'argila'))} de argila por vez` }; },
  });

  // ------------------------------ a mine ------------------------------
  // the miner's shift (economy.js runMine): at the pithead of a mine of the body's people with its vein not spent, a shift of the
  // miner's 10 s of the world (13 for the gold and the tin) ÷ his work, by the pick — the strokes the pick's —; the vein gives
  // what it gives the miner, by the same dice, into the hands in the ledger ('mina'), and the town counts it (Eco.mined)
  const mineOf = b => (b && b.ore ? (G.S.ores || []).find(q => q.id === b.ore) || null : null);
  const shiftOf = (v, o) => ((o.kind === 'ouro' || o.kind === 'estanho') ? 13 : 10) / Math.max(0.5, (v.work || 1) * G.Civ.tV(v, 'build'));
  let mineK = null; // (the body's strokes of its shift at a mine — as at a rock: nothing of the world, nothing saved)
  I.add({
    id: 'mina', prio: 3.6, reach: 2.8, work: 'minerar',
    find(ctx) {
      const out = []; const fid = G.Fac.idOfV(ctx.v);
      for (const b of G.S.buildings.values()) {
        if (!b.built || !b.ore || b.x > ctx.x + 3 || b.x + b.w < ctx.x - 3 || b.y > ctx.y + 3 || b.y + b.h < ctx.y - 3) continue;
        if (G.Village.facOfSet(b.set) !== fid) continue;
        const d = G.Vg.door(b); out.push({ b, X: d[0] * L(), Z: d[1] * L(), reach: 2.8 });
      }
      return out;
    },
    label(ctx, t) { const o = mineOf(t.b); return o && G.Eco.ORE_NAME[o.kind] ? `Minerar ${G.Eco.ORE_NAME[o.kind]}` : 'Minerar'; },
    can(ctx, t) {
      const v = ctx.v; const o = mineOf(t.b); if (!o || !(o.amt > 0)) return { ok: false, why: 'A mina se esgotou.' };
      if (!hands(v)) return { ok: false, why: 'Você não tem força nem mãos para isso.' };
      const tl = Tr.tool(v, 'minerar'); if (!tl.key) return { ok: false, why: tl.why };
      if (loaded(v)) return { ok: false, why: 'Suas mãos estão com a carga: leve-a primeiro.' };
      return { ok: true };
    },
    run(ctx, t) {
      const v = ctx.v; const b = t.b; const f = face(ctx, t.X, t.Z); const tl = Tr.tool(v, 'minerar');
      // (the shift in strokes of the pick, each the quarryman's 0.6 s of work times what the pick does; the vein's yield when the
      // strokes have done the miner's shift — his 10 s, or 13 for the gold and the tin, by his work)
      stroke({ id: 'minerar', p: 'mina', target: t, t: tl, dur: WT.mine, contact: WT.mine * 0.62, f,
        op: (w, k) => {
          const o = mineOf(b); if (!G.S.buildings.has(b.id) || !o || !(o.amt > 0)) { mineK = null; return { ok: false, why: 'A mina se esgotou.' }; }
          if (loaded(w)) return { ok: false, why: 'Suas mãos já estão cheias.' };
          if (!mineK || mineK.b !== b.id || mineK.v !== w.id) mineK = { b: b.id, v: w.id, w: 0 };
          mineK.w += WT.mine * k.mul; const need = shiftOf(w, o);
          if (mineK.w < need) return { ok: true, pct: Math.min(99, Math.round(mineK.w / need * 100)) };
          const q = Math.min(o.amt, (o.kind === 'ouro' || o.kind === 'estanho') ? 1 + (G.R() < 0.4 ? 1 : 0) : 2 + (G.R() < 0.5 ? 1 : 0));
          const kk = G.Eco.oreGood(o.kind); const m = Math.min(q, Math.floor(G.Depot.room('v:' + w.id, kk, { pack: true }) + EPS));
          if (m < 1) return { ok: false, why: 'Suas mãos não aguentam o minério.' };
          const r = G.Depot.make('v:' + w.id, kk, m, { code: 'mina', by: w.id, pack: true }); if (!r.ok) return { ok: false, why: 'Suas mãos não aguentam o minério.' };
          mineK = null; o.amt -= r.n; G.Eco.mined(w, b.id, o, r.n); G.Possess.deed('minerio');
          return { ok: true, got: r.n, k: kk };
        },
        then: r => { G.Audio && G.Audio.at(b.x + 0.5, b.y + 0.5, 'mine'); G.FX && G.FX.dust && G.FX.dust(t.X / L(), t.Z / L(), 1); say(r.got ? `Você tira ${r.got} de ${G.Eco.name(r.k)} da mina. Leve ao armazém.` : `Turno na mina (${r.pct}%)`, r.got ? 3 : 1.2); if (r.got) Tr.stop(); } });
      return { ok: true };
    },
    verbs(ctx, t) { return [Object.assign(holdVerb('Trabalhar o turno inteiro', c2 => loaded(c2.v)), { pid: 'mina' })]; },
    info(ctx, t) {
      const o = t && mineOf(t.b); if (!o) return null; const tl = Tr.tool(ctx.v, 'minerar'); const need = shiftOf(ctx.v, o);
      const w = mineK && mineK.b === t.b.id && mineK.v === ctx.v.id ? mineK.w : 0;
      return { titulo: 'Minerando', pct: Math.min(1, w / need), falta: tl.key ? `faltam ${strokesLeft(need - w, WT.mine * tl.mul)} golpes · ${Math.round(o.amt)} no veio` : `${Math.round(o.amt)} no veio`, rende: `2 a 3 de ${G.Eco.name(G.Eco.oreGood(o.kind))} por turno` };
    },
  });

  // ------------------------------ the stall: selling ------------------------------
  // the merchant's own stall (act-negocio.js: G.Biz), open, the body at its counter: the body sells by standing there — the buyers
  // the world sends (Biz.shop) haggle and pay, the coins into the house by the ledger —, and calls its goods out, the seller's
  // gesture; the screen shows the day of the stall (what is on the counter and at what price, what sold, what came in)
  const myStall = v => (G.Biz ? G.Biz.of(v) : null);
  Tr.stall = function (v) {
    const z = myStall(v); if (!z) return null; const sp = G.Biz.spots(z); if (!sp) return null;
    const d = z.day || {}; const goods = G.Biz.display ? G.Biz.display(z) : [];
    return { z, open: !!z.open, manned: G.Biz.manned(z), goods: goods.map(g => ({ k: g.k, n: Math.floor(z.inv[g.k] || 0), price: g.price })), rev: d.rev || 0, cust: d.cust || 0, sold: Object.assign({}, d.sold || {}), money: G.Biz.money(z.fac) };
  };
  I.add({
    id: 'banca', prio: 4.15, reach: 1.6, work: 'vender',
    // (at its own open stall, at the counter, with the hands free — a load in the hands is for the counter: «Pôr na banca»)
    find(ctx) { const z = myStall(ctx.v); if (!z || !z.open || loaded(ctx.v)) return []; const sp = G.Biz.spots(z); if (!sp || Math.hypot(sp.seller[0] - ctx.x, sp.seller[1] - ctx.y) > 0.6) return []; return [{ z, X: sp.seller[0] * L(), Z: sp.seller[1] * L(), pref: 1 }]; },
    label() { return 'Apregoar as mercadorias'; },
    can(ctx, t) { const z = t.z; if (!z || !z.open) return { ok: false, why: 'A banca está fechada.' }; if (!G.Biz.hours()) return { ok: false, why: 'O mercado está fechado a esta hora.' }; return { ok: true }; },
    run(ctx, t) {
      const z = t.z; const sp = G.Biz.spots(z); const f = Math.atan2(sp.dy, sp.dx);
      // (the seller's call, words of the people's own pack — Falas: the moment's numbers, never the world's chance)
      stroke({ id: 'vender', p: 'banca', target: t, t: null, dur: 1.2, contact: 0.42, f,
        op: w => { if (!z.open) return { ok: false, why: 'A banca está fechada.' }; const ks = Object.keys(z.inv).filter(k => z.inv[k] >= 1).sort(); if (ks.length && G.Falas) G.Falas.say(w, 'pregao', { k: ks[Math.floor(G.hash(w.id + G.S.day * 7 + Math.floor(G.S.clock)) * ks.length) % ks.length] }); return { ok: true, empty: !ks.length }; },
        then: r => { if (r.empty) say('A banca está vazia: compre no atacado no armazém, ou ponha o que tem.', 3); } });
      return { ok: true };
    },
    verbs(ctx, t) {
      // (F: the stall's own act of closing — the world's offer of the business, done by its own door, as any offer of the world)
      const off = () => { const os = G.Act.offers(ctx.v, ctx.x, ctx.y, 3).filter(o => o && o.id === 'negocio.fechar:' + t.z.id); return os[0] || null; };
      const A = I.list.find(q => q.id === 'atividade');
      return [{ k: 'outra', label: 'Fechar a banca', can: () => (off() ? { ok: true } : { ok: false, why: 'Agora não dá.' }), run: c2 => { const o = off(); return o && A ? A.run(c2, I.placed(c2, o)) : { ok: false, msg: 'Agora não dá.' }; } },
        Object.assign(holdVerb('Ficar na banca, apregoando', c2 => { const z = myStall(c2.v); return !z || !z.open || !G.Biz.hours(); }), { pid: 'banca' })];
    },
    info(ctx, t) {
      const s = Tr.stall(ctx.v); if (!s) return null; const M = s.money;
      const sold = Object.keys(s.sold).map(k => `${Math.round(s.sold[k])} de ${G.Eco.name(k)}`).join(', ');
      return { titulo: 'Na sua banca', pct: null, falta: s.goods.length ? s.goods.slice(0, 3).map(g => `${g.n} de ${G.Eco.name(g.k)} a ${String(g.price).replace('.', ',')}`).join(' · ') : 'a banca está vazia', rende: `hoje: ${s.cust} fregues${s.cust === 1 ? '' : 'es'}${sold ? ', vendeu ' + sold : ''}${M.troca ? '' : ` · ${String(Math.round(s.rev * 100) / 100).replace('.', ',')} ${M.plural}`}` };
    },
  });
})(window.G);
