'use strict';
// ============================================================
//  Os ofícios (G.Oficio): o trabalho de um prédio de trabalho de
//  ponta a ponta, como uma operação do mundo. Uma fornada é uma
//  operação (G.Act, 'oficio'): a olaria que faz doze tijolos tem a
//  argila separada na prateleira, o barro amassado, os tijolos crus
//  secando, os do forno, o fogo aceso ou apagado, os contados e os
//  quebrados — tudo no G.S, no save e no livro-razão. A tarefa de
//  alguém é só a mão que faz a próxima unidade: um save, a morte do
//  oleiro, o corpo do deus no lugar dele não desfazem nem repetem
//  nada (D-076, D-078); o que espera — a secagem ao sol, o forno que
//  esfria — espera pelo relógio do mundo, sem ninguém. Cada ofício
//  declara as suas etapas (G.Oficio.def): o ponto de uso da planta,
//  o gesto, os segundos de cada unidade (os mesmos para quem mora no
//  mundo e para o corpo: o gesto de G.Act.ANIM), o que entra, o que
//  sai, o combustível, por que para; um motor só as faz.
//  A olaria (o exemplo D): tijolo cozido onde gregos e romanos o
//  fazem, adobe secado ao sol no Nilo e nos lagos dos astecas (D-075:
//  a obra os consome, village.js), potes para as casas em todo povo.
// ============================================================
(function (G) {
  const A = G.Act, D = G.Depot, E = G.Eco, W = G.W; if (!A || !D || !E) return;
  const O = G.Oficio = { DEFS: {} };
  const EPS = 1e-6;
  const r2 = x => Math.round(x * 100) / 100;
  const live = A.live;
  const S_ = () => G.S;
  const AN = A.ANIM;

  // ------------------------------ the gestures of the trades ------------------------------
  // (on acts the 3D already poses — people3d.js: dig, fill, craft, pottery, lift, feed — so that the people and the god's
  // body show the same thing; the seconds of a gesture are the seconds of a unit of the work, for both: D-078)
  A.addAnim('cavar', { act: 'dig', dur: 5, contact: 4.6, hands: 2 });
  A.addAnim('amassar', { act: 'fill', dur: 4, contact: 3.6, hands: 2 });
  A.addAnim('moldar', { act: 'craft', dur: 3, contact: 2.6, hands: 2 });
  A.addAnim('tornear', { act: 'pottery', dur: 4, contact: 3.6, hands: 2 });
  A.addAnim('enfornar', { act: 'lift', dur: 1.6, contact: 1.2, hands: 2 });
  A.addAnim('desenfornar', { act: 'lift', dur: 1.6, contact: 1.2, hands: 2 });
  A.addAnim('alimentarFogo', { act: 'feed', dur: 2, contact: 1.6, hands: 2 });
  A.addAnim('fiar', { act: 'craft', dur: 3, contact: 2.6, hands: 2 });
  A.addAnim('tecer', { act: 'weave', dur: 4, contact: 3.6, hands: 2 });
  A.addAnim('forjar', { act: 'forge', dur: 4, contact: 3.2, hands: 2 });
  A.addAnim('lavrar', { act: 'craft', dur: 5, contact: 4.4, hands: 2 });

  // ------------------------------ the trades ------------------------------
  // a trade: the building it works in, the role that works it, what it can make (its recipes) and what it makes next
  // (pick: what the town lacks). A recipe: the good, the batch, the input brought to the shelf, its stages. A stage:
  //   busca  — the input brought to the building's shelf and set aside for the batch (dug, fetched from the store, picked up)
  //   mao    — hand work, one unit at a time at a point of the plan (use): from the shelf's input or a pool of the batch
  //            (from), take of it, give into the next pool (to) or make the good on the shelf (make), some breaking (brk)
  //   espera — the world's clock: the sun dries (sun: by day, not in the rain), the kiln cools
  //   fogo   — the kiln burns on the wood it is fed (burn seconds a load), until it has burnt long enough (fire)
  // (kiln: the stages that hold the kiln — one batch in it at a time)
  O.def = function (id, spec) { O.DEFS[id] = Object.assign({ id }, spec); return O.DEFS[id]; };
  const STAGE_TXT = { amassar: 'Amassando o barro', moldar: 'Moldando tijolos', tornear: 'Torneando potes na roda', enfornar: 'Pondo no forno', tirar: 'Tirando do forno e contando', empilhar: 'Contando e empilhando os adobes', macerar: 'Pondo o grão de molho na cuba', encher: 'Enchendo os jarros da cuba', fiar: 'Fiando a lã', tecer: 'Tecendo no tear', forjar: 'Martelando na forja', lavrar: 'Lavrando o ouro' };
  const STAGE_DO = { amassar: 'Amassar o barro', moldar: 'Moldar tijolos', tornear: 'Tornear um pote', enfornar: 'Pôr no forno', tirar: 'Tirar do forno e contar', empilhar: 'Contar e empilhar os adobes', macerar: 'Pôr o grão de molho na cuba', encher: 'Encher os jarros da cuba', fiar: 'Fiar a lã', tecer: 'Tecer no tear', forjar: 'Martelar na forja', lavrar: 'Lavrar o ouro' };
  O.STAGE_TXT = STAGE_TXT; O.STAGE_DO = STAGE_DO;
  O.def('olaria', {
    b: 'olaria', role: 'oleiro', name: 'Olaria',
    rx: {
      tijolo: { k: 'tijolo', n: 12, in: 'argila', pit: 1, name: 'tijolos', one: 'tijolo', feito: 'Saíram do forno', st: [
        { id: 'argila', kind: 'busca', n: 6, name: 'juntando argila' },
        { id: 'amassar', kind: 'mao', anim: 'amassar', use: 'amassar', pose: 'low', take: 1, to: 'massa', give: 1, name: 'amassando o barro' },
        { id: 'moldar', kind: 'mao', anim: 'moldar', use: 'moldar', pose: 'low', from: 'massa', take: 1, to: 'cru', give: 2, name: 'moldando' },
        { id: 'secar', kind: 'espera', wait: 60, sun: 1, name: 'secando ao sol' },
        { id: 'enfornar', kind: 'mao', anim: 'enfornar', use: 'cozer', from: 'cru', take: 4, to: 'forno', kiln: 1, name: 'enfornando' },
        { id: 'queimar', kind: 'fogo', fire: 60, fuel: 4, burn: 16, kiln: 1, name: 'no fogo' },
        { id: 'esfriar', kind: 'espera', wait: 30, kiln: 1, name: 'esfriando no forno' },
        { id: 'tirar', kind: 'mao', anim: 'desenfornar', use: 'cozer', from: 'forno', take: 4, make: 1, brk: 0.05, kiln: 1, name: 'tirando do forno' },
      ] },
      adobe: { k: 'adobe', n: 12, in: 'argila', pit: 1, name: 'adobes', one: 'adobe', feito: 'Secaram ao sol e foram contados', st: [
        { id: 'argila', kind: 'busca', n: 6, name: 'juntando argila' },
        { id: 'amassar', kind: 'mao', anim: 'amassar', use: 'amassar', pose: 'low', take: 1, to: 'massa', give: 1, name: 'amassando o barro' },
        { id: 'moldar', kind: 'mao', anim: 'moldar', use: 'moldar', pose: 'low', from: 'massa', take: 1, to: 'cru', give: 2, name: 'moldando' },
        { id: 'secar', kind: 'espera', wait: 100, sun: 1, name: 'secando ao sol' },
        { id: 'empilhar', kind: 'mao', anim: 'empilhar', use: 'moldar', from: 'cru', take: 4, make: 1, brk: 0.04, name: 'contando os adobes' },
      ] },
      ceramica: { k: 'ceramica', n: 8, in: 'argila', pit: 1, name: 'potes', one: 'pote', feito: 'Tiramos do forno', st: [
        { id: 'argila', kind: 'busca', n: 8, name: 'juntando argila' },
        { id: 'tornear', kind: 'mao', anim: 'tornear', use: 'tornear', take: 1, to: 'cru', give: 1, name: 'torneando' },
        { id: 'secar', kind: 'espera', wait: 40, sun: 1, name: 'secando' },
        { id: 'enfornar', kind: 'mao', anim: 'enfornar', use: 'cozer', from: 'cru', take: 4, to: 'forno', kiln: 1, name: 'enfornando' },
        { id: 'queimar', kind: 'fogo', fire: 40, fuel: 2, burn: 16, kiln: 1, name: 'no fogo' },
        { id: 'esfriar', kind: 'espera', wait: 20, kiln: 1, name: 'esfriando no forno' },
        { id: 'tirar', kind: 'mao', anim: 'desenfornar', use: 'cozer', from: 'forno', take: 4, make: 1, brk: 0.08, kiln: 1, name: 'tirando do forno' },
      ] },
    },
    // what this pottery makes next: the bricks the town's works wait for (and a few for the next ones), then the pots its
    // houses lack (counted from the store and from what the batches under way will give; nothing by chance)
    pick(b, f) {
      const S = S_(); const set = S.settlements.get(b.set); if (!set) return null;
      const brick = E.brickOf(f.id);
      if (brick) {
        const have = D.free('f:' + f.id, brick) + shelfOf(set, brick) + coming(set, brick);
        if (G.Village.brickWant(set, brick) > have + EPS) return brick;
        if (have < 6 && sites(set) > 0) return brick;
      }
      const pots = D.free('f:' + f.id, 'ceramica') + shelfOf(set, 'ceramica') + coming(set, 'ceramica');
      if (pots < Math.max(6, G.Village.pop(set.id) * 0.3)) return 'ceramica';
      return null;
    },
  });
  // ------------------------------ the loom, the forge, the goldsmith's bench ------------------------------
  // (the crafts of economy.js, on the same engine: what a unit takes and gives is the old recipe's — two of wool for a piece
  // of cloth, two of ore for two pieces of iron, an ounce of gold for a jewel —, the forge and the crucible lit with the
  // people's wood, and the people's tools wearing now and then as they are used: wear, the chance a unit takes one)
  O.def('tecelagem', {
    b: 'tecelagem', role: 'tecelao', name: 'Tecelagem',
    rx: {
      tecido: { k: 'tecido', n: 6, in: 'la', wear: 0.08, name: 'peças de tecido', one: 'peça de tecido', g: 'f', feito: 'Tecemos', st: [
        { id: 'la', kind: 'busca', n: 12, name: 'juntando lã' },
        { id: 'fiar', kind: 'mao', anim: 'fiar', use: 'tecer', take: 2, to: 'fio', give: 2, name: 'fiando a lã' },
        { id: 'tecer', kind: 'mao', anim: 'tecer', use: 'tecer', from: 'fio', take: 2, give: 1, make: 1, brk: 0, name: 'tecendo' },
      ] },
    },
    // (cloth while there is wool for it: the store's, or what lies on the loom's shelf)
    pick(b, f) { return inputFor(b, f, 'la', 12) ? 'tecido' : null; },
  });
  const forged = (k, name, one) => ({ k, n: 6, in: 'minerio', wear: 0.08, name, one, g: 'f', feito: 'Forjamos', st: [
    { id: 'minerio', kind: 'busca', n: 6, name: 'juntando minério' },
    { id: 'acender', kind: 'fogo', fire: 16, fuel: 2, burn: 8, kiln: 1, name: 'esquentando a forja' },
    { id: 'forjar', kind: 'mao', anim: 'forjar', use: 'forjar', take: 2, give: 2, make: 1, brk: 0, kiln: 1, name: 'forjando' },
  ] });
  O.def('forja', {
    b: 'forja', role: 'ferreiro', name: 'Forja',
    rx: { armas: forged('armas', 'armas', 'arma'), ferramentas: forged('ferramentas', 'ferramentas', 'ferramenta') },
    // (what the realm needs most: weapons in war, tools in peace — economy.js forgeOut —, while there is ore)
    pick(b, f) { return inputFor(b, f, 'minerio', 6) ? (E.forgeOut ? E.forgeOut(f) : 'ferramentas') : null; },
  });
  O.def('ourives', {
    b: 'ourives', role: 'ourives', name: 'Ourivesaria',
    rx: {
      joias: { k: 'joias', n: 2, in: 'ouro', wear: 0.08, name: 'joias', one: 'joia', g: 'f', feito: 'Lavramos', st: [
        { id: 'ouro', kind: 'busca', n: 2, name: 'juntando ouro' },
        { id: 'fundir', kind: 'fogo', fire: 8, fuel: 1, burn: 8, kiln: 1, name: 'o ouro no cadinho' },
        { id: 'lavrar', kind: 'mao', anim: 'lavrar', use: 'lavrar', take: 1, give: 1, make: 1, brk: 0, name: 'lavrando' },
      ] },
    },
    pick(b, f) { return inputFor(b, f, 'ouro', 2) ? 'joias' : null; },
  });
  // (a batch of a trade begins only with its input somewhere to be had: the store's, or free on the building's shelf)
  function inputFor(b, f, k, n) { return D.free('f:' + f.id, k) + D.free('b:' + b.id, k) >= n - EPS; }
  // (what of a good lies on the shelves of the town's workshops that make it, and what its batches under way will still give)
  function shelfOf(set, k) { let n = 0; for (const id in O.DEFS) { const t = O.DEFS[id]; let makes = false; for (const p in t.rx) if (t.rx[p].k === k) makes = true; if (makes) for (const b of E.byType(set.id, t.b)) n += D.get('b:' + b.id, k); } return n; }
  function coming(set, k) { let n = 0; for (const op of A.all()) if (op.def === 'oficio' && live(op) && op.set === set.id && rxOf(op) && rxOf(op).k === k) n += Math.max(0, op.data.n - op.data.feitos - op.data.quebrados); return n; }
  function sites(set) { let n = 0; for (const o of S_().buildings.values()) if (o.set === set.id && !o.built && o.type !== 'ruin') n++; return n; }
  // a batch of this good under way in the town (the works that wait for brick wait for it: village.js, the destroca)
  O.making = (set, k) => { const id = set && (set.id || set); for (const op of A.all()) if (op.def === 'oficio' && live(op) && op.set === id && rxOf(op) && rxOf(op).k === k) return true; return false; };

  // ------------------------------ reading ------------------------------
  const tradeOf = b => { if (!b) return null; for (const id in O.DEFS) if (O.DEFS[id].b === b.type) return O.DEFS[id]; return null; };
  O.has = (b, role) => { const t = tradeOf(b); return !!t && (!role || t.role === role); };
  O.trade = tradeOf;
  const rxOf = op => { const t = op && O.DEFS[op.data.of]; return t ? t.rx[op.data.p] || null : null; };
  const stageOf = op => { const R = rxOf(op); return R ? R.st[op.data.s] || null : null; };
  O.rx = rxOf; O.stage = stageOf;
  // the batches of a building, the oldest first (the operations live in S.acts: their order is their birth)
  O.batches = function (b) { const id = b && (b.id || b); const out = []; for (const op of A.all()) if (op.def === 'oficio' && live(op) && op.at === id) out.push(op); return out; };
  // the batch in the kiln (one at a time: a stage that holds it)
  function kilnOf(b) { for (const op of O.batches(b)) { const s = stageOf(op); if (s && s.kiln) return op; } return null; }
  O.kilnOf = kilnOf;
  // (a hand stage's pool: the batch's input set aside on the shelf, or one of its own pools)
  const poolOf = (op, s) => (s.from ? op.data[s.from] || 0 : op.data.got || 0);
  // (the pools a recipe's hand stages fill — the clay worked, the bricks drying, the yarn spun —, read from its stages)
  const POOLS = new Map();
  function poolsOf(R) { let L = POOLS.get(R); if (!L) { L = []; for (const s of R.st) if (s.kind === 'mao' && !s.make && s.to && !L.includes(s.to)) L.push(s.to); POOLS.set(R, L); } return L; }
  O.poolsOf = poolsOf;
  const poolsZero = R => { const o = {}; for (const p of poolsOf(R)) o[p] = 0; return o; };
  // what the building shows of its batches — for the panel, the god's view and the 3D (only read)
  O.show = function (b) {
    const out = { cru: 0, forno: 0, fogo: false, secando: false, massa: 0 };
    for (const op of O.batches(b)) { const d = op.data; const s = stageOf(op); out.cru += d.cru || 0; out.forno += d.forno || 0; out.massa += d.massa || 0; if (s && s.kind === 'fogo' && d.calor > 0) out.fogo = true; if (s && s.kind === 'espera' && s.sun) out.secando = true; }
    return out;
  };

  // ------------------------------ a batch begins and ends ------------------------------
  // (one batch of a product at a time in a building, and a second one only once the first no longer needs hands: in the
  // sun or in the kiln — two at most; in the world's step only)
  function canStart(b, p) {
    const L = O.batches(b); if (L.length >= 2) return false;
    for (const op of L) { if (op.data.p === p) return false; const s = stageOf(op); if (s && (s.kind === 'busca' || s.kind === 'mao') && !s.kiln) return false; }
    // (and room on the shelf for the clay a batch begins with: a shelf full of the last one's goods waits for the store)
    const R = tradeOf(b).rx[p]; return !!R && D.room('b:' + b.id, R.in) >= Math.min(4, R.st[0].n);
  }
  O.canStart = canStart;
  O.start = function (b, p, by) {
    const t = tradeOf(b); const R = t && t.rx[p]; if (!R || !G.inSim || !canStart(b, p)) return null;
    const fac = G.Village.facOfSet(b.set);
    const op = A.start('oficio', { at: b.id, set: b.set, fac, to: 'b:' + b.id, why: p, by: by ? by.id : 0, x: b.x + b.w / 2, y: b.y + b.h / 2,
      data: Object.assign({ of: t.id, p, n: R.n, s: 0, t: 0, got: 0, massa: 0, cru: 0, forno: 0 }, poolsZero(R), { calor: 0, fogo: 0, lenha: 0, feitos: 0, quebrados: 0, usado: 0, perdido: 0, q: 0 }) });
    if (op) A.log(op, 'fornada', p, R.n);
    return op;
  };
  // the next stage; past the last, the batch is counted and done. Into the kiln only when it is free — one batch in it at a
  // time: the next one waits at its door, its stage done, until the kiln is let go. Nothing kept them out: the pots out of the
  // sun went into the kiln, the bricks came out of the sun with the pots still burning, and the kiln, the older batch's by
  // kilnOf, took the bricks in over them (L-436)
  function next(op) {
    const R = rxOf(op); const d = op.data;
    const s0 = R.st[d.s], s1 = R.st[d.s + 1];
    if (s1 && s1.kiln && !(s0 && s0.kiln)) { const b = S_().buildings.get(op.at); const k = b ? kilnOf(b) : null; if (k && k !== op) { if (op.st !== 'wait' || op.wait !== 'forno') A.pause(op, 'forno'); return; } }
    d.s++; d.t = 0;
    if (op.st === 'wait') A.resume(op);
    if (d.s >= R.st.length) return finish(op);
    A.log(op, 'etapa', R.st[d.s].id);
  }
  function finish(op) {
    const S = S_(); const R = rxOf(op); const d = op.data; const b = S.buildings.get(op.at);
    setRsv(op, b, 0);
    A.end(op, 'ok', `${d.feitos} ${R.name}${d.quebrados ? `, ${d.quebrados} quebrados` : ''}`);
    for (const id in op.roles || {}) {
      const v = S.villagers.get(+id); if (!v || !(op.roles[id].n >= 2)) continue;
      A.note(v, 'memory', `${R.feito || 'Ficaram prontos'} ${d.feitos} ${R.name}${d.quebrados ? ` (${d.quebrados} ${d.quebrados > 1 ? 'quebraram' : 'quebrou'})` : ''}${b ? ' n' + (G.gen(G.Village.buildName(b)) === 'a' ? 'a ' : 'o ') + G.Village.buildName(b).toLowerCase() : ''}.`);
    }
  }
  // (what a batch still held when it was cut short — the clay worked, the bricks drying or in the kiln — is lost with it,
  // and said: the clay set aside on the shelf is let go, still there, free for another batch)
  function cut(op, st, why) {
    const S = S_(); const d = op.data; const b = S.buildings.get(op.at);
    const R0 = rxOf(op); let lost = 0; for (const p of R0 ? poolsOf(R0) : ['massa', 'cru', 'forno']) { lost += d[p] || 0; d[p] = 0; } d.perdido = r2(lost); d.calor = 0;
    if (b) setRsv(op, b, 0); d.got = 0;
    A.end(op, st, why);
  }
  O.cut = (op, why) => { if (op && live(op) && G.inSim) cut(op, 'int', why || 'interrompida'); };
  // the reservation of the batch's input on the shelf: exactly what it set aside and has not used
  function setRsv(op, b, n) {
    const R = rxOf(op); if (!R || !b) return;
    if (n !== undefined) op.data.got = Math.max(0, r2(n));
    D.unreserve(op.id, 'b:' + b.id, R.in);
    if (op.data.got > EPS) { if (!D.reserve('b:' + b.id, R.in, op.data.got, op.id)) { op.data.got = r2(Math.max(0, Math.min(op.data.got, D.free('b:' + b.id, R.in, op.id)))); if (op.data.got > EPS) D.reserve('b:' + b.id, R.in, op.data.got, op.id); } }
  }

  // ------------------------------ one unit of hand work (the people's and the god's body's) ------------------------------
  // the same door for everyone: the stage as the batch has it now, its pool, the room on the shelf, the kiln — and then
  // the transfer in the ledger, with the key of the unit (the same unit twice does nothing). → { ok, n, msg | why }
  function canUnit(op, v) {
    const S = S_(); if (!op || !live(op)) return { ok: false, why: 'A fornada acabou.' };
    const b = S.buildings.get(op.at); const R = rxOf(op); const s = stageOf(op);
    if (!b || !R || !s) return { ok: false, why: 'A fornada acabou.' };
    if (s.kind !== 'mao') return { ok: false, why: s.kind === 'espera' ? `A fornada está ${s.name}.` : s.kind === 'fogo' ? 'A fornada está no fogo.' : `Ainda falta ${E.name(R.in)} para esta fornada.` };
    if (s.kiln) { const k = kilnOf(b); if (k && k !== op) return { ok: false, why: 'O forno está ocupado com outra fornada.' }; }
    if (poolOf(op, s) < EPS) return { ok: false, why: 'Esta etapa terminou.' };
    if (s.make && D.room('b:' + b.id, R.k) < 1 - EPS) return { ok: false, why: 'A prateleira está cheia: leve o que está pronto ao armazém primeiro.' };
    if (v && !A.able(v) && !A.isBody(v)) return { ok: false, why: 'Agora não dá.' };
    return { ok: true, b, R, s };
  }
  O.canUnit = canUnit;
  function unit(op, v) {
    const c = canUnit(op, v); if (!c.ok) return c;
    const { b, R, s } = c; const d = op.data; const key = 'of:' + op.id + ':' + d.s + ':' + d.q;
    let taken = Math.min(s.take, poolOf(op, s));
    if (s.make) taken = Math.min(taken, Math.floor(D.room('b:' + b.id, R.k) + EPS));
    if (!(taken > EPS)) return { ok: false, why: 'Esta etapa terminou.' };
    if (!s.from) {
      // (the input set aside on the shelf, used: in the ledger, with the batch)
      const r = D.use('b:' + b.id, R.in, taken, { op: op.id, code: s.id, by: v.id, key, mine: true });
      if (!r.ok) return { ok: false, why: r.why === 'não há' || r.why === 'não há tanto' ? `Sumiu ${E.name(R.in)} separado para esta fornada.` : r.why };
      taken = r.n; d.usado = r2(d.usado + taken); setRsv(op, b, d.got - taken);
    } else d[s.from] = r2(d[s.from] - taken);
    d.q++;
    const out = r2(taken * (s.give || s.take) / s.take);
    let msg = '';
    if (s.make) {
      // the goods counted: each one sound or broken by the world's chance (in the world's step), the sound ones on the shelf
      let broke = 0; if (s.brk > 0) for (let k = 0; k < Math.round(out); k++) if (G.R() < s.brk) broke++;
      const good = r2(out - broke);
      if (good > EPS) { const r = D.make('b:' + b.id, R.k, good, { op: op.id, code: 'fornada', by: v.id, key: key + ':m' }); if (r.ok) d.feitos = r2(d.feitos + r.n); }
      d.quebrados = r2(d.quebrados + broke);
      const gm = R.g === 'f' ? 'a' : 'o';
      msg = `${Math.round(good)} ${Math.round(good) === 1 ? R.one || R.name : R.name} pront${gm}${Math.round(good) === 1 ? '' : 's'}${broke ? `, ${broke} quebrad${gm}${broke > 1 ? 's' : ''}` : ''}.`;
    } else { d[s.to] = r2((d[s.to] || 0) + out); msg = ({ amassar: 'Você amassa o barro.', moldar: `Você molda ${Math.round(out)} tijolos.`, tornear: 'Você torneia um pote.', enfornar: `Você põe ${Math.round(out)} no forno.`, fiar: 'Você fia a lã.', macerar: 'Você põe o grão de molho.' })[s.id] || 'Feito.'; }
    // (the people's tools wear as they are used: now and then a unit takes one of the store — in the ledger)
    if (R.wear && G.R() < R.wear) { const fr = 'f:' + op.fac; if (D.free(fr, 'ferramentas') >= 1 - EPS) D.use(fr, 'ferramentas', 1, { op: op.id, code: 'desgaste', by: v.id, key: key + ':w' }); }
    const me = op.roles && op.roles[v.id]; if (me) me.n = (me.n || 0) + 1;
    op.upd = S_().clock;
    // (the stage's pool emptied: the next stage, at once — the people's next unit and the body's offer see it)
    if (poolOf(op, s) < EPS) next(op);
    return { ok: true, n: out, msg };
  }
  O.unit = (op, v) => (G.inSim ? unit(op, v) : { ok: false, why: '' });

  // the batch's input brought in: onto the shelf and set aside for it (a load of the batch, or a plain load of it)
  function bring(op, v, how) {
    const S = S_(); const b = S.buildings.get(op.at); const R = rxOf(op); const c = v.carry;
    if (!b || !R || !c || c.k !== R.in || !(c.n > EPS)) return { ok: false, why: `Você não está com ${E.name(R ? R.in : 'argila')}.` };
    const s = stageOf(op);
    const r = D.move('v:' + v.id, 'b:' + b.id, R.in, c.n, { op: c.op === op.id ? op.id : 0, code: how || 'entrega', by: v.id, part: true });
    if (!r.ok) return { ok: false, why: r.why === 'não cabe' ? `Não cabe mais nada n${G.gen(G.Village.buildName(b)) === 'a' ? 'a' : 'o'} ${G.Village.buildName(b).toLowerCase()}.` : r.why };
    // (set aside for the batch what it asks, no more: what is over lies free on the shelf, for the next one)
    if (s && s.kind === 'busca') { setRsv(op, b, Math.min(s.n, op.data.got + r.n)); if (op.data.got + EPS >= s.n) next(op); }
    return { ok: true, n: r.n, msg: `Você deixa ${Math.round(r.n)} de ${E.name(R.in)}${where(b)}.` };
  }
  // wood into the kiln: one load's worth of fire — in the ledger, burnt with the batch
  function feed(op, v) {
    const s = stageOf(op); const c = v.carry; const d = op.data;
    if (!s || s.kind !== 'fogo') return { ok: false, why: 'O forno não está aceso para esta fornada.' };
    if (!c || c.k !== 'wood' || !(c.n > EPS)) return { ok: false, why: 'Você não está com lenha.' };
    if (d.calor > s.burn * 2 - EPS) return { ok: false, why: 'O forno já está cheio de lenha: espere arder.' };
    const r = D.use('v:' + v.id, 'wood', 1, { op: c.op === op.id ? op.id : 0, code: 'lenha', by: v.id, part: true, key: 'of:' + op.id + ':lenha:' + d.lenha });
    if (!r.ok) return { ok: false, why: r.why };
    d.lenha = r2(d.lenha + r.n); d.calor = r2(d.calor + s.burn * r.n); op.upd = S_().clock;
    if (op.st === 'wait') A.resume(op);
    return { ok: true, n: r.n, msg: 'Você põe lenha no forno. O fogo pega.' };
  }

  // ------------------------------ the overseer (once a second of the world) ------------------------------
  const PAUSE = { chuva: 'a chuva', noite: 'a noite', argila: 'a falta de argila', insumo: 'a falta do que se trabalha', lenha: 'a falta de lenha', forno: 'o forno ocupado' };
  O.PAUSE = PAUSE;
  function tick(op, step) {
    const S = S_(); const b = S.buildings.get(op.at); const R = rxOf(op); const d = op.data;
    // (the building gone, ruined, no longer its people's: the batch ends there, what it held lost with it)
    if (!R) return A.end(op, 'cancel', 'sem receita');
    if (!b || b.type !== O.DEFS[d.of].b || !b.built) return cut(op, 'int', !b ? 'a olaria sumiu' : 'a olaria caiu');
    if (G.Village.facOfSet(b.set) !== op.fac) return cut(op, 'int', 'a olaria mudou de dono');
    const s = stageOf(op); let why = '';
    if (s.kind === 'busca') {
      // (what of the input already lies free on the shelf is set aside at once)
      const free = D.free('b:' + b.id, R.in, op.id) - d.got;
      if (free > EPS && d.got < s.n - EPS) setRsv(op, b, Math.min(s.n, d.got + free));
      if (d.got + EPS >= s.n) return next(op);
      const f = G.Fac.get(op.fac);
      if (R.shelf) why = 'insumo'; // (it waits for its shelf: nobody fetches for it)
      else if (!(f && D.free('f:' + f.id, R.in) >= 1) && !inFlight(op) && !(R.pit && pitOf(b))) why = R.in === 'argila' ? 'argila' : 'insumo';
    } else if (s.kind === 'espera') {
      if (s.sun && S.weather && S.weather.rain > 0.5) why = 'chuva';
      else if (s.sun && G.isNight()) why = 'noite';
      else { d.t = r2(Math.min(s.wait, d.t + step)); if (d.t + EPS >= s.wait) return next(op); } // (dry, and the kiln busy: it waits there, dry)
    } else if (s.kind === 'fogo') {
      if (d.calor > EPS) { const h = Math.min(step, d.calor); d.calor = r2(d.calor - h); d.fogo = r2(d.fogo + h); }
      if (d.fogo + EPS >= s.fire) { d.calor = 0; return next(op); }
      const f = G.Fac.get(op.fac); if (d.calor < EPS && !inFlight(op) && !(f && D.free('f:' + f.id, 'wood') >= 1)) why = 'lenha';
    } else if (s.kind === 'mao') {
      if (s.kiln) { const k = kilnOf(b); if (k && k !== op) why = 'forno'; }
      // (the clay set aside that someone took — a save from before, the god's hand: the stage has nothing left to work)
      if (!s.from && d.got > EPS && D.get('b:' + b.id, R.in) + EPS < d.got) setRsv(op, b, D.get('b:' + b.id, R.in));
      if (poolOf(op, s) < EPS) return next(op);
    }
    if (why) { if (op.st !== 'wait' || op.wait !== why) A.pause(op, why); } else if (op.st === 'wait') A.resume(op);
    // a batch nobody has touched in two days — its workshop with nobody working in it, nothing of it in anyone's hands —
    // is let go (a batch waiting on the rain or the wood, with its workers there, waits)
    if (S.clock - (op.upd || 0) > G.DAY_LEN * 2 && !inFlight(op)) { let hands = false; for (const v of S.villagers.values()) if (v.job === op.at) { hands = true; break; } if (!hands) cut(op, 'cancel', 'abandonada'); }
  }
  // (where the clay is dug for a building: the river's bank by it — the same all day, as economy.js chooses it)
  const pits = new Map(); G.worldHooks.push(() => pits.clear());
  function pitOf(b) { const S = S_(); const k = b.id; const e = pits.get(k); if (e && e[0] === S.day && e[2] === (S.typeVer || 0)) return e[1]; const p = E.clayPit(null, b); pits.set(k, [S.day, p, S.typeVer || 0]); if (pits.size > 400) pits.clear(); return p; }
  // the loads of the batch on their way to it (in hands, or on the ground where a carrier fell)
  function inFlight(op) {
    const S = S_(); let n = 0;
    for (const id in op.roles || {}) { const v = S.villagers.get(+id); if (v && v.carry && v.carry.op === op.id) n += v.carry.n; }
    for (const o of S.loose || []) if (o.op === op.id) n += o.n;
    return n;
  }
  // what the batch's hands are bringing of its input (the clay on its way: so that two do not go for the same)
  function bringing(op) {
    const S = S_(); const R = rxOf(op); let n = 0;
    for (const id in op.roles || {}) { const v = S.villagers.get(+id); const t = v && v.task; if (!t || t.type !== 'oficio' || t.op !== op.id) continue; if (v.carry && v.carry.op === op.id && v.carry.k === R.in) n += v.carry.n; else if (t.do === 'cavar' || t.do === 'buscar') n += t.n || 3; }
    for (const o of S.loose || []) if (o.op === op.id && o.k === R.in) n += o.n;
    return n;
  }

  // ------------------------------ the hands of the world's people ------------------------------
  // the next thing for a worker of this building: a load of a batch carried on; the next unit of a batch; a new batch when
  // the town needs one; the goods on the shelf to the store
  O.task = function (v, b, f, H) {
    const S = S_(); const t = tradeOf(b); if (!t || !b.built || b.type === 'ruin') return null;
    // (a load of one of its batches in the hands — clay for the shelf, wood for the kiln: on with it)
    if (v.carry && v.carry.op) { const op = A.get(v.carry.op); if (op && live(op) && op.def === 'oficio') { const k = resume(op, v, H); if (k) return k; } }
    if (v.carry && v.carry.n > EPS) return null; // (hands full of something else: the old errands take it where it goes)
    // (what a trade makes for its own counter — the tavern's beer — stays on its shelf; the rest goes to the store)
    const ready = t.keep ? null : goodsOn(b);
    // (a load's worth to the store — sooner when the shelf is nearly full: the next batch needs the room)
    if (ready && (ready.n >= 4 || D.room('b:' + b.id, ready.k) < 4)) return haul(v, b, f, ready, H);
    for (const op of O.batches(b)) { const k = step(op, v, b, f, H); if (k) return k; }
    const p = G.inSim ? t.pick(b, f) : null;
    if (p && canStart(b, p)) { const op = O.start(b, p, v); if (op) { const k = step(op, v, b, f, H); if (k) return k; } }
    if (ready) return haul(v, b, f, ready, H);
    return null;
  };
  // the products on the shelf (what the trade makes), the most first
  function goodsOn(b) {
    const t = tradeOf(b); let best = null;
    for (const p in t.rx) { const k = t.rx[p].k; const n = D.free('b:' + b.id, k); if (n >= 1 - EPS && (!best || n > best.n)) best = { k, n }; }
    return best;
  }
  function haul(v, b, f, g, H) { return H.setTask(v, { type: 'oficio', do: 'levar', b: b.id, k: g.k, pri: 1, st: 0, op: 0 }); }
  // the next step of a batch for this hand: a unit of hand work, the input to fetch, the wood the kiln wants
  function step(op, v, b, f, H) {
    const s = stageOf(op); const R = rxOf(op); const d = op.data; if (!s) return null;
    if (s.kind === 'mao') {
      if (!canUnit(op, v).ok) return null;
      A.join(op, v, tradeOf(b).role);
      return H.setTask(v, { type: 'oficio', do: 'mao', op: op.id, b: b.id, s: d.s, use: s.use, pose: s.pose, pri: 1, st: 0, n: 0 });
    }
    if (s.kind === 'busca') {
      const want = s.n - d.got - bringing(op); if (want < 0.5) return null;
      // a load of the batch lying where a carrier fell, picked up first
      const S = S_(); for (const o of S.loose || []) if (o.op === op.id && o.k === R.in && G.W.reaches(v, o.x, o.y)) { A.join(op, v, tradeOf(b).role); return H.setTask(v, { type: 'oficio', do: 'chao', op: op.id, b: b.id, g: o.id, n: o.n, pri: 1, st: 0 }); }
      const n = Math.min(Math.ceil(want), Math.floor(D.room('v:' + v.id, R.in, { op: op.id }) + EPS));
      if (n < 1) return null;
      // (a trade that works only what is already on its shelf — the tavern's vat, from the grain its keeper bought — fetches
      // nothing: the batch waits for the shelf)
      if (R.shelf) return null;
      if (D.free('f:' + f.id, R.in) >= 1) { A.join(op, v, tradeOf(b).role); return H.setTask(v, { type: 'oficio', do: 'buscar', op: op.id, b: b.id, k: R.in, n: Math.min(n, Math.floor(D.free('f:' + f.id, R.in))), pri: 1, st: 0 }); }
      // (clay is dug at the river's bank; what else a batch takes comes from the store, or waits)
      const pit = R.pit ? E.clayPit(v, b) : null; if (!pit) return null;
      A.join(op, v, tradeOf(b).role);
      return H.setTask(v, { type: 'oficio', do: 'cavar', op: op.id, b: b.id, x: pit[0], y: pit[1], n: Math.min(3, n), pri: 1, st: 0 });
    }
    if (s.kind === 'fogo') {
      // (the wood still wanted to finish the burning, less what the kiln holds and what is on its way)
      const left = Math.ceil((s.fire - d.fogo - d.calor) / s.burn - inFlight(op) - EPS);
      if (left < 1 || d.calor > s.burn) return null;
      const n = Math.min(left, Math.floor(D.free('f:' + f.id, 'wood')), Math.floor(D.room('v:' + v.id, 'wood', { op: op.id }) + EPS));
      if (n < 1) return null;
      A.join(op, v, tradeOf(b).role);
      return H.setTask(v, { type: 'oficio', do: 'lenha', op: op.id, b: b.id, n, pri: 1, st: 0 });
    }
    return null;
  }
  // a load of the batch in the hands after its errand was lost (a save, a call away): on to the building
  function resume(op, v, H) {
    const R = rxOf(op); const c = v.carry; if (!R || !c || c.op !== op.id) return null;
    const S = S_(); const b = S.buildings.get(op.at); if (!b) return null;
    if (c.k === R.in) return H.setTask(v, { type: 'oficio', do: 'buscar', op: op.id, b: b.id, k: c.k, n: c.n, pri: 1, st: 2 });
    if (c.k === 'wood') return H.setTask(v, { type: 'oficio', do: 'lenha', op: op.id, b: b.id, n: c.n, pri: 1, st: 2 });
    return null;
  }
  // (a path that ends short is walked again from where it ended, a few times; only then is the place out of reach)
  function walkTo(v, t, key, x, y, dt, H) {
    if (t.wk !== key) { t.wk = key; if (!H.goto(v, x, y, false) && !H.goto(v, x, y, true, G.N * G.N)) { t.wk = null; return -1; } }
    if (H.move(v, dt)) { t.wk = null; if (G.dist(v.x, v.y, x, y) < 1.5) { t.rt = 0; return 1; } t.rt = (t.rt || 0) + 1; return t.rt > 3 ? -1 : 0; }
    return 0;
  }
  function walkB(v, t, b, dt, H) {
    const key = 'b' + b.id;
    if (t.wk !== key) { t.wk = key; if (!G.Vg.gotoB(v, b, 0.2)) { t.wk = null; return -1; } }
    if (H.move(v, dt)) { t.wk = null; const [fx, fy] = G.Village.frontTile(b); if (G.dist(v.x, v.y, fx, fy) < 2.2 || G.dist(v.x, v.y, b.x + b.w / 2, b.y + b.h / 2) < Math.max(b.w, b.h)) { t.rt = 0; return 1; } t.rt = (t.rt || 0) + 1; return t.rt > 3 ? -1 : 0; }
    return 0;
  }
  const faceB = (v, b) => { const [cx, cy] = G.Village.center(b); G.faceTo(v, cx - v.x, cy - v.y); };
  function runOficio(v, t, dt, H) {
    const S = S_(); const b = S.buildings.get(t.b);
    if (!b || !b.built || b.type === 'ruin' || !tradeOf(b)) return H.end(v);
    const op = t.op ? A.get(t.op) : null;
    if (t.op && (!op || !live(op))) { if (v.carry && v.carry.op === t.op) v.carry.op = 0; return H.end(v); }
    switch (t.do) {
      case 'mao': {
        // (at the work's point inside: the person is in the building — the world keeps them at its door, L-217; the interiors
        // put them at a free point of the stage's use, t.use, In.places — and any end of the errand puts them out at the door)
        if (t.st === 0) { const r = walkB(v, t, b, dt, H); if (r < 0) return H.end(v); if (r > 0) { t.st = 1; v.actT = 0; const dr = G.Vg.door(b); v.x = dr[0]; v.y = dr[1]; v.inside = b.id; } return; }
        const s = stageOf(op); if (!s || s.kind !== 'mao' || op.data.s !== t.s) return H.end(v);
        const g = AN[s.anim]; v.act = g.act; faceB(v, b);
        if (v.actT < g.dur) return;
        const r = unit(op, v); if (!r.ok) return H.end(v);
        v.actT = 0; t.n++;
        // (three units an errand, as a craft always was; the next errand takes up where this one stopped)
        if (t.n >= 3 || op.data.s !== t.s || !canUnit(op, v).ok) return H.end(v);
        return;
      }
      case 'cavar': {
        if (t.st === 0) { const r = walkTo(v, t, 'pit', t.x, t.y, dt, H); if (r < 0) return H.end(v); if (r > 0) { t.st = 1; v.actT = 0; } return; }
        if (t.st === 1) {
          v.act = AN.cavar.act; G.faceTo(v, t.x - v.x, t.y - v.y);
          if (G.R() < dt * 1.5) G.FX && G.FX.chips(t.x, t.y, '#8a5a3a');
          if (v.actT < AN.cavar.dur) return;
          // (the bank's clay, born of the world into the hands — marked for this batch's shelf)
          const n = Math.min(t.n || 3, Math.floor(D.room('v:' + v.id, 'argila', { op: op.id, to: 'b:' + b.id }) + EPS));
          const r = n >= 1 ? D.make('v:' + v.id, 'argila', n, { op: op.id, code: 'barreiro', by: v.id, to: 'b:' + b.id }) : { ok: false };
          if (!r.ok) return H.end(v);
          const f = G.Fac.ofV(v); if (f) E.made(f, 'argila', r.n);
          t.st = 2; t.wk = null; return;
        }
        return carryIn(v, t, b, op, dt, H);
      }
      case 'buscar': {
        if (t.st === 0) { const d = G.Village.nearestDropoff(v.x, v.y, v.set); if (!d) return H.end(v); const r = walkB(v, t, d, dt, H); if (r < 0) return H.end(v); if (r > 0) { t.st = 1; v.actT = 0; } return; }
        if (t.st === 1) {
          v.act = AN.levantar.act; if (v.actT < AN.levantar.contact) return;
          const f = G.Fac.ofV(v); if (!f) return H.end(v);
          const n = Math.min(t.n, Math.floor(D.free('f:' + f.id, t.k)), Math.floor(D.room('v:' + v.id, t.k, { op: op.id, to: 'b:' + b.id }) + EPS));
          if (n < 1) return H.end(v);
          const r = D.move('f:' + f.id, 'v:' + v.id, t.k, n, { op: op.id, code: 'buscar', by: v.id, to: 'b:' + b.id }); if (!r.ok) return H.end(v);
          t.st = 2; t.wk = null; return;
        }
        return carryIn(v, t, b, op, dt, H);
      }
      case 'chao': {
        const o = (S.loose || []).find(x => x.id === t.g && x.op === op.id);
        if (t.st === 0) { if (!o) return H.end(v); const r = walkTo(v, t, 'g', o.x, o.y, dt, H); if (r < 0) return H.end(v); if (r > 0) { t.st = 1; v.actT = 0; } return; }
        if (t.st === 1) {
          v.act = AN.levantar.act; if (v.actT < AN.levantar.contact) return;
          if (!o) return H.end(v);
          const r = D.move('g:' + o.id, 'v:' + v.id, o.k, Math.min(o.n, Math.floor(D.room('v:' + v.id, o.k, { op: op.id }) + EPS)), { op: op.id, code: 'pegar', by: v.id, to: 'b:' + b.id });
          if (!r.ok) return H.end(v); t.st = 2; t.wk = null; return;
        }
        return carryIn(v, t, b, op, dt, H);
      }
      case 'lenha': {
        if (t.st === 0) { const d = G.Village.nearestDropoff(v.x, v.y, v.set); if (!d) return H.end(v); const r = walkB(v, t, d, dt, H); if (r < 0) return H.end(v); if (r > 0) { t.st = 1; v.actT = 0; } return; }
        if (t.st === 1) {
          v.act = AN.levantar.act; if (v.actT < AN.levantar.contact) return;
          const f = G.Fac.ofV(v); if (!f) return H.end(v);
          const n = Math.min(t.n, Math.floor(D.free('f:' + f.id, 'wood')), Math.floor(D.room('v:' + v.id, 'wood', { op: op.id, to: 'b:' + b.id }) + EPS));
          if (n < 1) return H.end(v);
          const r = D.move('f:' + f.id, 'v:' + v.id, 'wood', n, { op: op.id, code: 'buscar', by: v.id, to: 'b:' + b.id }); if (!r.ok) return H.end(v);
          t.st = 2; t.wk = null; return;
        }
        if (t.st === 2) { if (!v.carry || v.carry.op !== op.id) return H.end(v); const r = walkB(v, t, b, dt, H); if (r < 0) return holdWood(v, op, H); if (r > 0) { t.st = 3; v.actT = 0; } return; }
        // at the kiln: a load of wood at a time, as the fire takes it (what is left over goes back to the store)
        const s = stageOf(op);
        if (!s || s.kind !== 'fogo') return holdWood(v, op, H);
        v.act = AN.alimentarFogo.act; faceB(v, b);
        if (v.actT < AN.alimentarFogo.dur) return;
        if (op.data.calor > s.burn * 2 - EPS) return; // (the kiln is full: wait for it to burn down)
        const r = feed(op, v); if (!r.ok) return holdWood(v, op, H);
        v.actT = 0; G.FX && G.FX.sparkle && G.FX.sparkle(v.x, v.y);
        if (!v.carry) return H.end(v);
        return;
      }
      case 'levar': {
        if (t.st === 0) { const r = walkB(v, t, b, dt, H); if (r < 0) return H.end(v); if (r > 0) { t.st = 1; v.actT = 0; } return; }
        v.act = AN.levantar.act; faceB(v, b); if (v.actT < AN.levantar.contact) return;
        const f = G.Fac.ofV(v); if (!f) return H.end(v);
        const r = pickUp(v, b, f, t.k); if (!r.ok) return H.end(v);
        return H.setTask(v, { type: 'carga', to: 'f:' + f.id, pri: 1, st: 0 });
      }
    }
    return H.end(v);
  }
  // the input carried in: to the building, onto its shelf, set aside for the batch
  function carryIn(v, t, b, op, dt, H) {
    if (!v.carry || v.carry.op !== op.id) return H.end(v);
    if (t.st === 2) { const r = walkB(v, t, b, dt, H); if (r < 0) return H.end(v); if (r > 0) { t.st = 3; v.actT = 0; } return; }
    v.act = AN.pousar.act; faceB(v, b); if (v.actT < AN.pousar.contact) return;
    const r = bring(op, v, 'entrega');
    if (r.ok) G.FX && G.FX.deposit(v.x, v.y, 'argila', r.n);
    // (what the shelf has no room for is no longer the batch's: a plain load, which the next errand takes to the store)
    if (v.carry && v.carry.op === op.id) unmark(v);
    return H.end(v);
  }
  const unmark = v => { const c = v.carry; if (c) { c.op = 0; c.to = null; } };
  // wood the kiln no longer wants (it finished, the batch ended): back to the people's store, a plain load
  function holdWood(v, op, H) {
    if (v.carry && v.carry.op === op.id) unmark(v);
    return H.end(v);
  }
  // the products of the shelf into the hands, for the people's store: the worker's wage at the pickup, as it always was
  // (E.pay: the state pays for what a worker brings in, in the ledger)
  function pickUp(v, b, f, k) {
    const n = Math.min(Math.floor(D.free('b:' + b.id, k) + EPS), Math.floor(D.room('v:' + v.id, k, { to: 'f:' + f.id }) + EPS));
    if (n < 1) return { ok: false, why: D.free('b:' + b.id, k) < 1 ? 'Não há o que levar.' : 'Suas mãos estão ocupadas.' };
    const r = D.move('b:' + b.id, 'v:' + v.id, k, n, { code: 'recolher', by: v.id, to: 'f:' + f.id });
    if (!r.ok) return r;
    const w = E.pay(v, k, r.n);
    return { ok: true, n: r.n, w };
  }

  // ------------------------------ the definition (and the god's body at the trade) ------------------------------
  const words = op => { const R = rxOf(op); return R ? R.name : 'peças'; };
  const where = b => (b ? ' n' + (G.gen(G.Village.buildName(b)) === 'a' ? 'a ' : 'o ') + G.Village.buildName(b).toLowerCase() : '');
  // (who may work a trade's batches with the body's own hands: a grown body of the building's people, free to)
  const mayWork = (v, b) => !!(v && b && v.age >= 14 && G.Village.facOfSet(b.set) === G.Fac.idOfV(v) && !v.captive);
  A.def('oficio', {
    name: 'Ofício', conserve: false, many: false,
    purpose: 'Fazer uma fornada num prédio de trabalho — a olaria (juntar argila, amassar, moldar ou tornear, secar, queimar com lenha, contar), a tecelagem (fiar e tecer a lã), a forja (esquentar e forjar o minério), a ourivesaria (fundir e lavrar o ouro) — e levar o que ficou pronto ao armazém do povo, com o salário de quem leva.',
    needs: 'uma oficina do ofício na cidade (a olaria: perto de um rio, de onde vem a argila), o que ela trabalha no armazém, e alguém dela para trabalhar',
    title(op) { const S = S_(); const b = S.buildings.get(op.at); const s = stageOf(op); return `Fornada de ${op.data.n} ${words(op)}${where(b)}${s ? ` (${op.st === 'wait' ? 'parada por ' + (PAUSE[op.wait] || op.wait) : s.name})` : ''}`; },
    avail(c, v, set) {
      const S = S_(); for (const id in O.DEFS) for (const b of E.byType(set.id, O.DEFS[id].b)) { if (O.DEFS[id].own) continue; const L = O.batches(b); if (!L.length) continue; const op = L[0]; const s = stageOf(op); return { ok: !!s && s.kind === 'mao' && op.st === 'on', why: op.st === 'wait' ? `parada por ${PAUSE[op.wait] || op.wait}` : s ? s.name : '', txt: `Há uma fornada de ${words(op)} n${G.gen(G.Village.buildName(b)) === 'a' ? 'a' : 'o'} ${G.Village.buildName(b).toLowerCase()} de ${set.name}`, known: G.dist(v.x, v.y, b.x, b.y) < 30 }; }
      return null;
    },
    tick,
    resume(op, v, H) { return resume(op, v, H); },
    text(v, t, op) {
      const R = rxOf(op); const s = stageOf(op);
      switch (t.do) {
        case 'mao': return (s && STAGE_TXT[s.id]) || 'Trabalhando na fornada';
        case 'cavar': return t.st < 1 ? 'Indo tirar argila na beira do rio' : t.st === 1 ? 'Cavando argila' : 'Levando argila para a olaria';
        case 'buscar': { const b = S_().buildings.get(t.b); return t.st < 2 ? `Buscando ${E.name(t.k || (R && R.in) || 'argila')} no armazém` : `Levando ${E.name(t.k || (R && R.in) || 'argila')} para ${b ? G.Village.buildName(b).toLowerCase() : 'o trabalho'}`; }
        case 'chao': { const b = S_().buildings.get(t.b); const k = E.name((R && R.in) || 'argila'); return t.st < 2 ? `Indo pegar ${k} caído no chão` : `Levando ${k} para ${b ? G.Village.buildName(b).toLowerCase() : 'o trabalho'}`; }
        case 'lenha': return t.st < 2 ? 'Buscando lenha para o forno' : t.st === 2 ? 'Levando lenha para o forno' : 'Pondo lenha no forno';
      }
      return R ? `Fazendo ${R.name}` : null;
    },
    onEnd(op) { if (op.data && op.st !== 'ok' && op.data.perdido > EPS) A.log(op, 'perdido', op.data.perdido); },
    // what the god's body can do here: the same units, at the same pace (the gesture), by the same door
    offers(v, x, y, r) {
      const S = S_(); const out = [];
      for (const b of S.buildings.values()) {
        const tr = tradeOf(b); if (!tr || !b.built || b.type === 'ruin') continue;
        const at = G.Vg.door(b); if (G.dist(x, y, at[0], at[1]) > r + 1.5 || !mayWork(v, b)) continue;
        if (tr.own && v.job !== b.id) continue; // (a trade that is its keeper's business: only its own hands work it)
        const c = v.carry; const hasLoad = c && c.n > EPS;
        for (const op of O.batches(b)) {
          const s = stageOf(op); const R = rxOf(op); if (!s) continue;
          if (s.kind === 'mao' && !hasLoad) { const k = canUnit(op, v); out.push({ id: 'oficio.unidade:' + op.id, act: 'unidade', op: op.id, s: op.data.s, label: `${STAGE_DO[s.id] || s.name} (fornada de ${words(op)})`, at, anim: s.anim, hands: 2, ok: k.ok, why: k.why || '' }); }
          if (s.kind === 'busca' && hasLoad && c.k === R.in) out.push({ id: 'oficio.argila:' + op.id, act: 'argila', op: op.id, label: `Deixar ${Math.round(c.n)} de ${E.name(R.in)} para a fornada de ${words(op)}`, at, anim: 'pousar', hands: 2 });
          if (s.kind === 'fogo' && hasLoad && c.k === 'wood') out.push({ id: 'oficio.lenha:' + op.id, act: 'lenha', op: op.id, label: 'Pôr lenha no forno', at, anim: 'alimentarFogo', hands: 2, ok: op.data.calor < s.burn * 2 - EPS, why: 'O forno já está cheio de lenha: espere arder.' });
        }
        // the shelf's goods, for its workers: to the store, with the wage
        if (!hasLoad && v.job === b.id) { const g = goodsOn(b); if (g) out.push({ id: 'oficio.levar:' + b.id, act: 'levar', b: b.id, k: g.k, label: `Levar ${E.name(g.k)} ao armazém`, at, ref: 'b:' + b.id, anim: 'levantar', hands: 2 }); }
        // a new batch, for its workers, when the town needs one
        if (!hasLoad && v.job === b.id && G.Fac.ofV(v)) { const f = G.Fac.ofV(v); const p = tradeOf(b).pick(b, f); if (p && canStart(b, p)) out.push({ id: 'oficio.comecar:' + b.id + ':' + p, act: 'comecar', b: b.id, p, label: `Começar uma fornada de ${tradeOf(b).rx[p].name}`, at, anim: 'apontar', hands: 0 }); }
      }
      return out;
    },
    acts: {
      unidade: {
        deed: 'trabalho',
        can(v, o) { const op = A.get(o.op); if (!op || op.data.s !== o.s) return { ok: false, why: 'A fornada já está em outra etapa.' }; return canUnit(op, v); },
        begin(v, o) { const op = A.get(o.op); A.join(op, v, v.job === op.at ? tradeOf(S_().buildings.get(op.at)).role : 'ajudante'); return { ok: true }; },
        run(v, o) { const op = A.get(o.op); return unit(op, v); },
      },
      argila: {
        deed: 'entrega',
        can(v, o) { const op = A.get(o.op); const s = stageOf(op); if (!op || !live(op) || !s || s.kind !== 'busca') return { ok: false, why: 'A fornada não precisa mais disso.' }; return v.carry && v.carry.k === rxOf(op).in ? { ok: true } : { ok: false, why: `Você não está com ${E.name(rxOf(op).in)}.` }; },
        run(v, o) { const op = A.get(o.op); A.join(op, v, 'ajudante'); return bring(op, v, 'entrega'); },
      },
      lenha: {
        deed: 'trabalho',
        can(v, o) { const op = A.get(o.op); const s = stageOf(op); if (!op || !live(op) || !s || s.kind !== 'fogo') return { ok: false, why: 'O forno não está aceso para esta fornada.' }; if (!v.carry || v.carry.k !== 'wood') return { ok: false, why: 'Você não está com lenha.' }; return op.data.calor < s.burn * 2 - EPS ? { ok: true } : { ok: false, why: 'O forno já está cheio de lenha: espere arder.' }; },
        run(v, o) { const op = A.get(o.op); A.join(op, v, 'ajudante'); return feed(op, v); },
      },
      levar: {
        deed: 'carga',
        can(v, o) { const b = S_().buildings.get(o.b); if (!b || v.job !== b.id) return { ok: false, why: 'Só quem trabalha aqui leva o que se faz aqui.' }; if (v.carry && v.carry.n > EPS) return { ok: false, why: 'Suas mãos já estão cheias.' }; return D.free('b:' + b.id, o.k) >= 1 ? { ok: true } : { ok: false, why: 'Não há o que levar.' }; },
        run(v, o) { const S = S_(); const b = S.buildings.get(o.b); const f = G.Fac.ofV(v); const r = pickUp(v, b, f, o.k); return r.ok ? { ok: true, n: r.n, msg: `Você pega ${r.n} de ${E.name(o.k)} para o armazém${r.w ? ` e recebe ${G.Falas ? G.Falas.price(f.civ || 'classico', r.w) : r.w} de salário` : ''}.` } : r; },
      },
      comecar: {
        can(v, o) { const b = S_().buildings.get(o.b); if (!b || v.job !== b.id) return { ok: false, why: 'Só quem trabalha aqui começa uma fornada.' }; return canStart(b, o.p) ? { ok: true } : { ok: false, why: 'Já há uma fornada que ainda pede mãos.' }; },
        run(v, o) { const b = S_().buildings.get(o.b); const op = O.start(b, o.p, v); if (!op) return { ok: false, why: 'Não deu para começar.' }; A.join(op, v, tradeOf(b).role); return { ok: true, msg: `Você começa uma fornada de ${tradeOf(b).rx[o.p].name}.` }; },
      },
    },
  });

  // ------------------------------ the task machines and the words of this file ------------------------------
  const oldRun = E.run;
  E.run = function (v, t, dt, H) { if (t.type === 'oficio') { runOficio(v, t, dt, H); return true; } return oldRun(v, t, dt, H); };
  const oldText = E.taskText;
  E.taskText = function (v, t) {
    if (t.type === 'oficio' && t.do === 'levar') { const k = t.k ? E.name(t.k) : 'a produção'; const b = G.S.buildings.get(t.b); return t.st < 1 ? `Indo pegar ${k} ${b ? where(b).trim() : 'na oficina'}` : `Pegando ${k} para o armazém`; }
    return oldText(v, t);
  };
  // the building's panel: its batches, what is on its shelf
  const oldHTML = E.buildingHTML;
  E.buildingHTML = function (b, plink, esc) {
    let h = oldHTML(b, plink, esc);
    if (tradeOf(b) && b.built && b.type !== 'ruin') {
      const L = O.batches(b);
      const lines = L.map(op => { const s = stageOf(op); const d = op.data; const pct = s && s.kind === 'espera' ? ` ${Math.round(d.t / s.wait * 100)}%` : s && s.kind === 'fogo' ? ` ${Math.round(d.fogo / s.fire * 100)}%` : ''; return `${esc(words(op))}: ${op.st === 'wait' ? 'parada por ' + esc(PAUSE[op.wait] || op.wait) : esc(s ? s.name : '')}${pct}${d.feitos ? ` · ${Math.round(d.feitos)} contados` : ''}`; });
      h += `<div class="doing">${lines.length ? 'Fornadas: ' + lines.join(' · ') : 'Nenhuma fornada agora.'}</div>`;
    }
    return h;
  };
  A.hooks.canon.push(['oficio', () => A.all().filter(op => op.def === 'oficio' && live(op)).map(op => [op.id, op.at, op.data.p, op.data.s, r2(op.data.got), r2(op.data.massa), r2(op.data.cru), r2(op.data.forno), r2(op.data.feitos), r2(op.data.quebrados)])]);

  // (a workshop that falls: what was on its shelf is lost with it, in the ledger — the village's own door now, V.keptGone, for
  // every building that leaves the world, L-245, L-377)
})(window.G);
