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
  });
  QA.canonMore.push(['acts', () => (G.Act ? G.Act.canon() : null)]);
})();
