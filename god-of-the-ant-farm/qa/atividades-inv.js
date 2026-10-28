// atividades-inv: the checker's rules for the activities (C1) — the holders, the operations, the ledger, the businesses.
// Loaded after qa/qa.js (QA.more / QA.canonMore); the leader moves it into QA.check when the activities reach integracao.
// It reads the world's fields directly (the same ones G.Depot reads): a fault in the activities' own code is not hidden
// by the code it checks.
(function () {
  if (!window.QA || !QA.more) return;
  const fin = x => typeof x === 'number' && isFinite(x);
  const EPS = 1e-4;
  QA.more.push(function (add, s) {
    if (!G.Act || !G.Depot) return;
    const ops = s.acts || [];
    const LIVE = { plan: 1, rsv: 1, on: 1, wait: 1 }; const ST = { plan: 1, rsv: 1, on: 1, wait: 1, ok: 1, int: 1, cancel: 1, fail: 1 };
    const byId = new Map(); for (const op of ops) byId.set(op.id, op);
    // ---- no holder with a negative or non-number amount
    const neg = (where, k, n) => { if (!fin(n)) add('act', 1, `${where}: ${k} = ${n}`); else if (n < -EPS) add('act', 1, `${where}: ${k} negativo (${n})`); };
    for (const f of s.factions.values()) for (const k in f.stock) neg(`estoque de ${f.name}`, k, f.stock[k]);
    for (const b of s.buildings.values()) {
      if (b.inv) for (const k in b.inv) neg(`${b.type}#${b.id}`, k, b.inv[k]);
      if (b.pantry !== undefined) neg(`${b.type}#${b.id}`, 'despensa', b.pantry);
      if (b.crates) { for (const c of b.crates) { if (!c || !Number.isInteger(c.id)) { add('act', 2, `${b.type}#${b.id}: caixa sem nome no cais`); break; } if (c.op && !(byId.has(c.op) && LIVE[byId.get(c.op).st])) add('act', 2, `${b.type}#${b.id}: caixa ${c.id} de uma operação que acabou (${c.op})`); } }
    }
    for (const v of s.villagers.values()) if (v.carry) { if (!fin(v.carry.n)) add('act', 1, `${v.name} #${v.id}: carga ${v.carry.n}`); else if (v.carry.n < -EPS) add('act', 1, `${v.name} #${v.id}: carga negativa`); }
    for (const x of s.loose || []) if (!fin(x.n) || x.n <= 0 || !fin(x.x) || !fin(x.y)) add('act', 1, `coisa no chão #${x.id} inválida`);
    // ---- the operations
    const ids = new Set();
    for (const op of ops) {
      const nm = `operação ${op.def}#${op.id}`;
      if (ids.has(op.id)) add('act', 1, `${nm}: id repetido`); ids.add(op.id);
      if (!ST[op.st]) add('act', 1, `${nm}: estado inválido ${op.st}`);
      if (!LIVE[op.st]) continue;
      if (!G.Act.DEFS[op.def]) add('act', 1, `${nm}: definição desconhecida`);
      for (const k of ['goods', 'done', 'lost', 'moved']) for (const g in op[k] || {}) if (!fin(op[k][g]) || op[k][g] < -EPS) add('act', 1, `${nm}: ${k}.${g} = ${op[k][g]}`);
      // a key applied twice (the same step twice)
      const seen = new Set(); for (const e of op.keys || []) { if (seen.has(e[0])) { add('act', 1, `${nm}: o passo ${e[0]} aplicado duas vezes`); break; } seen.add(e[0]); }
      // the people: alive, free, not at sea, not in a cell (unless the god's body: it keeps its role)
      for (const id in op.roles || {}) {
        const v = s.villagers.get(+id);
        if (!v) { add('act', 2, `${nm}: participante #${id} não existe (morto?) e continua com papel`); continue; }
        if (!op.roles[id].body && (v.captive || v.jail)) add('act', 2, `${nm}: ${v.name} #${v.id} ${v.captive ? 'cativo' : 'preso'} com papel`);
      }
      // its place
      if (op.at && !s.buildings.has(op.at)) add('act', 2, `${nm}: o lugar ${op.at} não existe e a operação segue`);
      // conservation, good by good: what left the source = what arrived + what was lost with a cause + what is in hands or on the ground, marked with it
      if (G.Act.DEFS[op.def] && G.Act.DEFS[op.def].conserve) {
        const inHands = {}; for (const v of s.villagers.values()) if (v.carry && v.carry.op === op.id && fin(v.carry.n)) inHands[v.carry.k] = (inHands[v.carry.k] || 0) + v.carry.n;
        for (const x of s.loose || []) if (x.op === op.id) inHands[x.k] = (inHands[x.k] || 0) + x.n;
        for (const b of s.buildings.values()) if (b.crates) for (const c of b.crates) if (c.op === op.id && fin(c.n)) inHands[c.k] = (inHands[c.k] || 0) + c.n;
        const taken = op.taken || {};
        for (const k of new Set(Object.keys(taken).concat(Object.keys(op.done || {}), Object.keys(inHands)))) {
          const a = taken[k] || 0, b = (op.done || {})[k] || 0, c = (op.lost || {})[k] || 0, d = inHands[k] || 0, back = (op.back || {})[k] || 0;
          if (Math.abs(a - (b + c + d + back)) > 0.01) add('act', 1, `${nm}: ${k} não fecha — saiu ${a}, chegou ${b}, perdido ${c}, sob a guarda dela (mãos, chão, cais) ${d}, devolvido ${back}`);
        }
      }
      // reservations within what the holder has
      for (const r of op.rsv || []) if (!Array.isArray(r) || typeof r[0] !== 'string' || !fin(r[2]) || r[2] < 0) add('act', 1, `${nm}: reserva inválida`);
    }
    // the reservations of all the operations together never more than what is there
    const R = new Map(); for (const op of ops) if (LIVE[op.st]) for (const r of op.rsv || []) { const key = r[0] + '|' + r[1]; R.set(key, (R.get(key) || 0) + r[2]); }
    for (const [key, n] of R) { const [ref, k] = key.split('|'); const has = G.Depot.get(ref, k); if (n > has + 0.01) add('act', 2, `reservas de ${k} em ${ref}: ${n} para ${has}`); }
    // a load marked with an operation that is gone (two seconds after its end: the hands let go at the next step)
    for (const v of s.villagers.values()) if (v.carry && v.carry.op) { const op = byId.get(v.carry.op); if (!op) add('act', 2, `${v.name} #${v.id}: carrega ${v.carry.k} de uma operação que não existe (${v.carry.op})`); }
    // ---- the ledger
    const L = s.ledger || []; for (let i = 1; i < L.length; i++) if (!(L[i][0] > L[i - 1][0])) { add('act', 2, `livro-razão fora de ordem em ${L[i][0]}`); break; }
    for (const e of L.slice(-200)) if (!fin(e[6]) || e[6] <= 0) { add('act', 2, `livro-razão: lançamento ${e[0]} com quantidade ${e[6]}`); break; }
    // ---- writes from outside the world's step (a frame, a panel): the activities never do that
    if (G.Act.outside) add('act', 1, `${G.Act.outside} operação(ões) criada(s) fora do passo do mundo`);
    // ---- the businesses
    if (G.Biz && G.Biz.audit) G.Biz.audit(add, s);
    // ---- the houses' coins, and their shopping: one of a house out for it at a time
    const out = new Map();
    for (const b of s.buildings.values()) if (b.coin !== undefined) neg(`${b.type}#${b.id}`, 'moedas', b.coin);
    for (const v of s.villagers.values()) if (v.task && v.task.casa) { out.set(v.task.casa, (out.get(v.task.casa) || 0) + 1); if (v.home !== v.task.casa) add('act', 4, `${v.name} #${v.id} faz compras para uma casa que não é mais a sua (${v.task.casa}): mudou no caminho`); }
    for (const [h, n] of out) if (n > 1) add('act', 3, `casa #${h}: ${n} pessoas fazendo as compras dela ao mesmo tempo`);
    // ---- a marked load (an operation's crate, a purchase on its way home, goods for a stall) never leaves the hands
    // without a line in the ledger: what was in them at the last look = what is in them now + what the ledger moved out
    // (the guard's rule 20, read in the world instead of in the code)
    const now = new Map();
    for (const v of s.villagers.values()) { const c = v.carry; if (c && fin(c.n) && c.n > EPS && (c.op || c.to || c.cid)) now.set(v.id, { k: c.k, n: c.n, name: v.name }); }
    if (marked && markedS === s) for (const [id, p] of marked) {
      const c = now.get(id); const left = c && c.k === p.k ? c.n : (() => { const v = s.villagers.get(id); return v && v.carry && v.carry.k === p.k && fin(v.carry.n) ? v.carry.n : 0; })();
      const went = (movedOut.get(id + '|' + p.k) || 0);
      if (p.n - left - went > 0.01) { const v = s.villagers.get(id); add('act', 1, `${p.name} #${id}: ${Math.round((p.n - left - went) * 100) / 100} de ${p.k} de uma carga marcada sumiram sem lançamento no livro (${v ? `agora ${v.task ? v.task.type : 'sem tarefa'}, nas mãos ${v.carry ? v.carry.n + ' de ' + v.carry.k : 'nada'}` : 'a pessoa saiu do mundo'})`); }
    }
    marked = now; markedS = s; movedOut.clear();
    // ---- L-186: the hands are never filled over what they hold — a gathering (berries, fruit, honey, the flats' shellfish)
    // starts with the hands free or holding the same plain good —; and by day a child's load goes to its place before
    // play (the night's sleep cut the errand that took it there): a free child awake with a load, in no errand that carries
    // it and with a store in reach, for more than 30 s of the day
    const r2 = x => Math.round(x * 100) / 100; const day = s === G.S && G.isNight ? !G.isNight() : false; const kidNow = new Map();
    for (const v of s.villagers.values()) {
      const c = v.carry; const t = v.task; if (!c || !fin(c.n) || c.n <= EPS) continue;
      if (t && (t.type === 'gather' || t.type === 'mariscar' || t.type === 'pick' || t.type === 'honey')) {
        const tr = t.type === 'pick' && s.trees.get(t.id); const K = tr && G.Flora && G.Flora.KIND[tr.kind];
        const want = t.type === 'honey' ? 'mel' : (K && K.good) || 'food';
        if (c.k !== want || c.op || c.to || c.cid) add('act', 3, `${v.name} #${v.id}: ${t.type} com ${r2(c.n)} de ${c.k} nas mãos — a colheita escreveria por cima do que elas levam (L-186)`);
      }
      if (!day || !(v.age >= 2 && v.age < 16) || c.k === 'water' || v.captive || v.jail || v.aboard || v.ug || v.held || v.air || v.sleeping || (s.avatar && s.avatar.id === v.id)) continue;
      if ((t && (t.pri >= 1 || t.type === 'deliver' || t.type === 'carga')) || v._noStore > s.clock) continue;
      const p = kidMarkS === s && kidMark.get(v.id); const since = p && p.k === c.k ? p.since : s.clock; kidNow.set(v.id, { k: c.k, since });
      if (s.clock - since > 30) add('act', 3, `${v.name} #${v.id}, ${Math.floor(v.age)} anos: ${r2(c.n)} de ${c.k} nas mãos há ${Math.round(s.clock - since)} s, de dia, ${t ? 'em ' + t.type : 'sem afazer'} — a carga não foi ao seu lugar (L-186)`);
    }
    kidMark = kidNow; kidMarkS = s;
    // ---- L-300: the water in the hands lives inside its errand (the house's jar, the bucket for a fire; a scene only lends
    // the person for a moment): out of it for more than 5 s of the world, it was left in the hands — the next work begins
    // over it (the body the player lives is the player's hands)
    const waterNow = new Map();
    for (const v of s.villagers.values()) {
      const c = v.carry; const t = v.task; if (!c || c.k !== 'water' || !fin(c.n) || c.n <= EPS || (s.avatar && s.avatar.id === v.id)) continue;
      if (t && (t.type === 'water' || t.type === 'fire' || t.type === 'scene')) continue;
      const since = waterMarkS === s && waterMark.has(v.id) ? waterMark.get(v.id) : s.clock; waterNow.set(v.id, since);
      if (s.clock - since > 5) add('act', 3, `${v.name} #${v.id}: ${r2(c.n)} de água nas mãos há ${Math.round(s.clock - since)} s, ${t ? 'em ' + t.type : 'sem afazer'} — fora do recado da água e do fogo (L-300)`);
    }
    waterMark = waterNow; waterMarkS = s;
    // ---- L-200: the two under a heavy crate walk a crate's length apart (G.Porto.PAIR_GAP: the steps of the one who
    // leads draw the helper after him); twice that apart, the crate between them reaches no pair of hands
    const gap = G.Porto && G.Porto.PAIR_GAP;
    if (gap) for (const v of s.villagers.values()) {
      const h = v.carry && v.carry.pair && s.villagers.get(v.carry.pair); const t = h && h.task;
      if (!t || t.type !== 'ajudar' || t.st !== 2 || t.lead !== v.id) continue;
      const d = Math.hypot(h.x - v.x, h.y - v.y); if (d > gap * 2) add('act', 3, `${v.name} #${v.id} e ${h.name} #${h.id} sob uma caixa pesada a ${r2(d)} casa um do outro, e a dupla anda a ${gap} (L-200)`);
    }
    // ---- a family's purchase never ends in a people's store (D-059): what was paid goes home — on the floor, where the
    // furniture is full —, so the line of a purchase put away ('compra-em-casa') always goes into a house
    for (const e of toStore.splice(0)) { const v = s.villagers.get(+String(e[3]).slice(2)); add('act', 2, `a compra de ${v ? v.name + ' #' + v.id : e[3]} (${e[6]} de ${e[5]}) acabou no estoque do povo ${e[4]}, não em casa (livro ${e[0]})`); }
    // ---- the houses (act-casa.js): an owner is a living person (or the people: 0); a house ordered by a family names it,
    // and once built the family has moved in (the order is cleared); a let house has an owner, and what is owed is a number
    if (G.Casa) for (const b of s.buildings.values()) {
      if (b.dono && !s.villagers.has(b.dono)) add('act', 3, `${b.type}#${b.id}: o dono #${b.dono} não existe mais (a herança não passou)`);
      if (b.encomenda) {
        if (!Array.isArray(b.encomenda.fam) || !fin(b.encomenda.paid)) add('act', 2, `${b.type}#${b.id}: encomenda sem família ou sem preço`);
        else if (b.built) add('act', 3, `${b.type}#${b.id}: pronta e a família da encomenda não mudou`);
      }
      if (b.aluga) {
        if (!b.dono) add('act', 3, `${b.type}#${b.id}: alugada e sem dono`);
        if (!fin(b.aluga.deve) || b.aluga.deve < -EPS || !fin(b.aluga.pago)) add('act', 1, `${b.type}#${b.id}: aluguel ${JSON.stringify(b.aluga)}`);
      }
      if (b.poupa && (!fin(b.poupa.alvo) || !(b.poupa.alvo > 0))) add('act', 2, `${b.type}#${b.id}: poupança sem alvo (${JSON.stringify(b.poupa)})`);
      // (a family that let the new house go, for now, does not save for it those days — D-061)
      if (b.poupa && G.Casa.gaveUp) { const sv = s.villagers.get(b.poupa.by); if (sv && G.Casa.gaveUp(sv)) add('act', 3, `${b.type}#${b.id}: a família de ${sv.name} #${sv.id} deixou a casa nova para depois e continua juntando para ela`); }
    }
    // ---- the fishing grounds (act-pesca.js): what a ground holds is a number, never below nothing, never fished in the
    // future, and only where there is water
    if (G.Pesca && s.pesca) for (const id in s.pesca) {
      const g = s.pesca[id];
      if (!Array.isArray(g) || !fin(g[0]) || !fin(g[1]) || g[0] < -EPS) { add('act', 1, `pesqueiro ${id}: ${JSON.stringify(g)}`); continue; }
      if (g[1] > s.clock + 1) add('act', 2, `pesqueiro ${id}: pescado no futuro (${g[1]} > ${Math.round(s.clock)})`);
      if (!(G.Pesca.cap(+id) > 0)) add('act', 3, `pesqueiro ${id}: pescado numa quadra sem água`);
    }
    // ---- hunger with food (L-164, L-165): a town whose people die of hunger with food in their people's stock and no store
    // anywhere to eat it from; someone dying of hunger with food in reach — the people's store, the house's pantry, plain
    // food in the hands —, free (not a captive, in a cell, condemned, at sea, in a cave), not on the way to eat nor running
    // from a danger nor in a fight (a beast, a brawl, a battle), in a calm town (no fight at it nor an army coming —
    // G.War.threat —, no fire burning in it). Held by an errand of any weight, it is still a death with food in reach;
    // with no errand at all, only if the last choice gave none (v.think set by a decision that found nothing) — one whose
    // errand just ended chooses the next at the coming step. (Dying: hunger at the top and under 40 of life.)
    {
      // (the body the player lives is not the world's to feed: it eats when the player says — the world does not even wake it,
      // L-171 —, and starving in it is the player's choice, not a fault of the world: L-177)
      const body = s.avatar ? s.avatar.id : 0;
      const dying = v => v.hunger >= 99.9 && v.hp < 40 && v.age >= 2 && v.id !== body;
      const dyingIn = new Map();
      for (const v of s.villagers.values()) if (dying(v) && !v.captive && !v.aboard && !v.ug) dyingIn.set(v.set, (dyingIn.get(v.set) || 0) + 1);
      for (const [sid, n] of dyingIn) {
        const set = s.settlements.get(sid); const f = set && s.factions.get(set.fac);
        if (f && f.stock.food >= 1 && !G.Village.nearestDropoff(set.cx, set.cy, sid)) add('fome', 1, `${set.name}: ${n} morrendo de fome com ${Math.floor(f.stock.food)} de comida no estoque de ${f.name} e nenhum armazém onde comer`);
      }
      for (const v of s.villagers.values()) {
        if (!dying(v) || v.captive || v.jail || v.aboard || v.ug || v.held || v.air) continue;
        const t = v.task; if (t && (t.type === 'eat' || t.type === 'forage' || t.type === 'flee' || t.type === 'condemned' || t.type === 'escorted' || t.type === 'fire' || t.type === 'fight' || t.type === 'combat')) continue;
        if (!t && !(v.think > 0.5)) continue; // (between two errands: the choice comes at the next step)
        const set = s.settlements.get(v.set); if (!set || G.War.threat(v.set) || (G.Vg.alarms && (G.Vg.alarms.get(v.set) || []).length)) continue;
        const where = [];
        const st = G.Fac.stockV(v); const d = st && st.food >= 1 ? G.Village.nearestDropoff(v.x, v.y, v.set) : null;
        if (d) { const ft = G.Village.frontTile(d); if (G.W.reaches(v, ft[0], ft[1])) where.push(`o armazém (${Math.floor(st.food)} no estoque)`); }
        const h = v.home && s.buildings.get(v.home);
        if (h && h.built && (h.pantry || 0) >= 1) { const ft = G.Village.frontTile(h); if (G.W.reaches(v, ft[0], ft[1])) where.push(`a despensa da casa (${Math.floor(h.pantry)})`); }
        const c = v.carry; if (c && c.k === 'food' && c.n >= 1 && !c.op && !c.to && !c.cid) where.push(`${Math.floor(c.n)} nas mãos`);
        if (where.length) add('fome', 2, `${v.name} #${v.id} (${set.name}) morre de fome com comida ao alcance: ${where.join(', ')}; ${t ? 'tarefa ' + t.type : 'sem tarefa'}, vida ${Math.round(v.hp)}`, v.id);
      }
    }
    // ---- the lines (life.js): a line's places are where people can stand in a line — on the ground of its front place (its
    // region of the map), dry, not before another building's door nor on a merchant at his counter, a step from the one
    // before —, no more of them than it asks; read from the world's fields (the ground, the doors), on a line whose ground
    // has not changed since its places were drawn (a line draws them again at its next step, life.js)
    if (G.Life && G.Life.queues && G.Vg && G.Vg.door) {
      const T = G.T; const wet = i => (s.type[i] <= T.SEA || s.type[i] === T.RIVER) && !s.road[i] && !(s.dry && s.dry[i]);
      for (const q of G.Life.queues()) {
        if (!q.fresh || !q.slots || !q.slots.length) continue;
        const nm = `a fila ${q.key}`; const [x0, y0] = q.slots[0];
        if (q.slots.length > q.places) add('fila', 2, `${nm}: ${q.slots.length} lugares, mais que os ${q.places} dela`);
        const near = []; for (const b of s.buildings.values()) if (b.id !== q.own && b.blocks && b.type !== 'ruin' && Math.abs(b.x + b.w / 2 - x0) < q.places + 4 && Math.abs(b.y + b.h / 2 - y0) < q.places + 4) { const d = G.Vg.door(b); if (d) near.push([b, d]); }
        for (let k = 1; k < q.slots.length; k++) {
          const [x, y] = q.slots[k]; const [px, py] = q.slots[k - 1]; const where = `${nm}, lugar ${k + 1} (${Math.round(x * 10) / 10}, ${Math.round(y * 10) / 10})`;
          if (!G.W.walkableXY(x, y)) { add('fila', 3, `${where}: onde não se pisa`); break; }
          if (wet(G.W.idx(x, y))) { add('fila', 3, `${where}: na água`); break; }
          if (!G.W.canWalk(x0, y0, x, y, false)) { add('fila', 3, `${where}: fora do chão do balcão (outra região)`); break; }
          const dr = near.find(([, d]) => Math.hypot(d[0] - x, d[1] - y) < 0.8 - 0.08); if (dr) { add('fila', 3, `${where}: diante da porta de ${dr[0].type}#${dr[0].id}`); break; }
          if (q.avoid.some(p => Math.hypot(p[0] - x, p[1] - y) < (p[2] || 0.5) - 0.08)) { add('fila', 3, `${where}: em cima de um vendedor`); break; }
          if (Math.hypot(x - px, y - py) > 0.6 + 0.15) { add('fila', 3, `${where}: longe do lugar de antes (${Math.round(Math.hypot(x - px, y - py) * 100) / 100})`); break; }
        }
      }
    }
  });
  // (the ledger's lines out of hands since the last look, and the purchases that ended in a people's store, for the rules
  // above; a new world, or a save loaded, starts over)
  let marked = null, markedS = null; const movedOut = new Map(); const toStore = []; let kidMark = new Map(), kidMarkS = null, waterMark = new Map(), waterMarkS = null;
  if (G.Depot) G.Depot.onMove.push(e => {
    if (typeof e[3] === 'string' && e[3][0] === 'v' && e[3][1] === ':') { const key = e[3].slice(2) + '|' + e[5]; movedOut.set(key, (movedOut.get(key) || 0) + e[6]); }
    if (e[8] === 'compra-em-casa' && typeof e[4] === 'string' && e[4][0] === 'f') { toStore.push(e); if (toStore.length > 50) toStore.shift(); }
  });
  if (G.worldHooks) G.worldHooks.push(() => { marked = null; markedS = null; movedOut.clear(); toStore.length = 0; kidMark = new Map(); kidMarkS = null; waterMark = new Map(); waterMarkS = null; });
  QA.canonMore.push(['acts', () => (G.Act ? G.Act.canon() : null)]);
  QA.canonMore.push(['pesca', () => (G.S && G.S.pesca ? Object.keys(G.S.pesca).sort((a, b) => a - b).map(id => [+id, G.S.pesca[id][0], G.S.pesca[id][1]]) : null)]);
  QA.canonMore.push(['casas', () => (G.S ? [...G.S.buildings.values()].filter(b => b.dono || b.encomenda || b.aluga || b.poupa).sort((a, b) => a.id - b.id).map(b => [b.id, b.dono || 0, b.encomenda ? b.encomenda.fam.join('.') + ':' + (b.encomenda.paid || 0) : '', b.aluga ? b.aluga.pago + ':' + b.aluga.deve : '', b.poupa ? b.poupa.by + ':' + b.poupa.alvo : '']) : null)]);
})();
