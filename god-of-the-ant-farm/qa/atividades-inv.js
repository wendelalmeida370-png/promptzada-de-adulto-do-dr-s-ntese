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
    // from a danger, in a calm town (no fight at it nor an army coming — G.War.threat —, no fire burning in it). Held by an
    // errand of any weight, it is still a death with food in reach. (Dying: hunger at the top and under 40 of life.)
    {
      const dying = v => v.hunger >= 99.9 && v.hp < 40 && v.age >= 2;
      const dyingIn = new Map();
      for (const v of s.villagers.values()) if (dying(v) && !v.captive && !v.aboard && !v.ug) dyingIn.set(v.set, (dyingIn.get(v.set) || 0) + 1);
      for (const [sid, n] of dyingIn) {
        const set = s.settlements.get(sid); const f = set && s.factions.get(set.fac);
        if (f && f.stock.food >= 1 && !G.Village.nearestDropoff(set.cx, set.cy, sid)) add('fome', 1, `${set.name}: ${n} morrendo de fome com ${Math.floor(f.stock.food)} de comida no estoque de ${f.name} e nenhum armazém onde comer`);
      }
      for (const v of s.villagers.values()) {
        if (!dying(v) || v.captive || v.jail || v.aboard || v.ug || v.held || v.air) continue;
        const t = v.task; if (t && (t.type === 'eat' || t.type === 'forage' || t.type === 'flee' || t.type === 'condemned' || t.type === 'escorted' || t.type === 'fire')) continue;
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
  });
  // (the ledger's lines out of hands since the last look, for the rule above; a new world, or a save loaded, starts over)
  let marked = null, markedS = null; const movedOut = new Map();
  if (G.Depot) G.Depot.onMove.push(e => { if (typeof e[3] === 'string' && e[3][0] === 'v' && e[3][1] === ':') { const key = e[3].slice(2) + '|' + e[5]; movedOut.set(key, (movedOut.get(key) || 0) + e[6]); } });
  if (G.worldHooks) G.worldHooks.push(() => { marked = null; markedS = null; movedOut.clear(); });
  QA.canonMore.push(['acts', () => (G.Act ? G.Act.canon() : null)]);
  QA.canonMore.push(['pesca', () => (G.S && G.S.pesca ? Object.keys(G.S.pesca).sort((a, b) => a - b).map(id => [+id, G.S.pesca[id][0], G.S.pesca[id][1]]) : null)]);
  QA.canonMore.push(['casas', () => (G.S ? [...G.S.buildings.values()].filter(b => b.dono || b.encomenda || b.aluga || b.poupa).sort((a, b) => a.id - b.id).map(b => [b.id, b.dono || 0, b.encomenda ? b.encomenda.fam.join('.') + ':' + (b.encomenda.paid || 0) : '', b.aluga ? b.aluga.pago + ':' + b.aluga.deve : '', b.poupa ? b.poupa.by + ':' + b.poupa.alvo : '']) : null)]);
})();
