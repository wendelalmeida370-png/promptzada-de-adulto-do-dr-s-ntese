// oficio-inv: the checker's rules for the trades (P2) — the batches of a workshop (G.Oficio: the pottery's bricks, adobes and
// pots), the brick of the works (D-075). Loaded after qa/qa.js (QA.more); copied into qa.js by qa/junta-inv.js. It reads the
// world's fields directly: a fault in the trades' own code is not hidden by the code it checks.
(function () {
  if (!window.QA || !QA.more) return;
  const fin = x => typeof x === 'number' && isFinite(x);
  const EPS = 1e-4;
  QA.more.push(function (add, s) {
    const O = G.Oficio; if (!O || !G.Act) return;
    const LIVE = { plan: 1, rsv: 1, on: 1, wait: 1 };
    const ops = (s.acts || []).filter(op => op.def === 'oficio' && LIVE[op.st]);
    const per = new Map();
    for (const op of ops) {
      const nm = `fornada #${op.id}`; const d = op.data || {};
      const t = O.DEFS[d.of]; const R = t && t.rx[d.p];
      if (!R) { add('oficio', 1, `${nm}: receita desconhecida (${d.of}/${d.p})`); continue; }
      if (!Number.isInteger(d.s) || d.s < 0 || d.s >= R.st.length) add('oficio', 1, `${nm}: etapa ${d.s} fora da receita de ${R.name}`);
      for (const k of ['got', 'massa', 'cru', 'forno', 'calor', 'fogo', 'lenha', 'feitos', 'quebrados', 'usado']) if (!fin(d[k]) || d[k] < -EPS) add('oficio', 1, `${nm}: ${k} = ${d[k]}`);
      // the books of the transformation close: the input used, in finished pieces, is what is in the pools and what was counted
      const f = {}; let last = null;
      for (let i = R.st.length - 1; i >= 0; i--) { const st = R.st[i]; if (st.kind !== 'mao') continue; if (st.make) { f[st.from] = 1; last = st; continue; } const out = st.to; const k = (f[out] || 0) * (st.give || st.take) / st.take; if (st.from) f[st.from] = k; else f.in = k; }
      if (last && f.in) {
        const inP = (d.usado || 0) * f.in; let have = (d.feitos || 0) + (d.quebrados || 0);
        for (const p of ['massa', 'cru', 'forno']) if (f[p]) have += (d[p] || 0) * f[p];
        if (Math.abs(inP - have) > 0.01) add('oficio', 1, `${nm}: as contas de ${R.name} não fecham — a argila usada dá ${Math.round(inP * 100) / 100}, há ${Math.round(have * 100) / 100} (barro, crus, no forno, contados, quebrados)`);
      }
      // its place: the building of its trade, standing, of its people
      const b = s.buildings.get(op.at);
      if (!b || b.type !== t.b || !b.built) add('oficio', 2, `${nm}: o lugar ${op.at} ${!b ? 'não existe' : b.type === 'ruin' ? 'é ruína' : 'não é ' + t.b} e a fornada segue`);
      else {
        // what it set aside on the shelf is there, and set aside
        const rsv = (op.rsv || []).filter(r => r[0] === 'b:' + b.id && r[1] === R.in).reduce((n, r) => n + r[2], 0);
        if (Math.abs(rsv - (d.got || 0)) > 0.01) add('oficio', 2, `${nm}: separou ${d.got} de ${R.in}, a reserva diz ${rsv}`);
        const has = (b.inv && b.inv[R.in]) || 0; if ((d.got || 0) > has + 0.01) add('oficio', 2, `${nm}: separou ${d.got} de ${R.in}, a prateleira tem ${has}`);
      }
      const L = per.get(op.at) || []; L.push(op); per.set(op.at, L);
      // what it counted is in the ledger, with it (when the ledger still covers its life)
      const led = s.ledger || [];
      if (led.length && (led[0][1] < op.born || (led[0][1] === op.born && led[0][2] <= op.t0))) {
        let made = 0; for (const e of led) if (e[7] === op.id && e[8] === 'fornada') made += e[6];
        if (Math.abs(made - (d.feitos || 0)) > 0.01) add('oficio', 2, `${nm}: contou ${d.feitos} ${R.name}, o livro-razão diz ${Math.round(made * 100) / 100}`);
      }
    }
    // a building: two batches at most, one of each product, one in the kiln
    for (const [id, L] of per) {
      if (L.length > 2) add('oficio', 2, `prédio #${id}: ${L.length} fornadas vivas`);
      const ps = new Set(); for (const op of L) { if (ps.has(op.data.p)) add('oficio', 2, `prédio #${id}: duas fornadas de ${op.data.p}`); ps.add(op.data.p); }
      const kiln = L.filter(op => { const st = O.stage(op); return st && st.kiln; }); if (kiln.length > 1) add('oficio', 2, `prédio #${id}: ${kiln.length} fornadas no forno ao mesmo tempo`);
    }
    // the brick of a work: what the foundation took of the stone, and no more
    for (const b of s.buildings.values()) {
      if (!b.brick || b.built || b.type === 'ruin') continue;
      const k = b.brick.k; const def = G.BDEF[b.type];
      if (!fin(b.brick.n) || b.brick.n < -EPS) { add('oficio', 1, `${b.type}#${b.id}: tijolo da obra ${b.brick.n}`); continue; }
      if (!b.need || (b.need[k] || 0) > b.brick.n + EPS) add('oficio', 2, `${b.type}#${b.id}: a obra pede ${b.need ? b.need[k] : '?'} de ${k}, trocou ${b.brick.n}`);
      if (b.need && (b.need.stone || 0) < -EPS) add('oficio', 1, `${b.type}#${b.id}: a obra pede pedra negativa (${b.need.stone})`);
      if (def && G.Village.bill) { let a = 0, z = 0; const bill = G.Village.bill(b); for (const q in bill) a += bill[q] || 0; for (const q in def.cost) z += def.cost[q] || 0; if (Math.abs(a - z) > EPS) add('oficio', 2, `${b.type}#${b.id}: a conta da obra (${a}) não é a do tipo (${z})`); }
    }
  });
})();
