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
      const pools = O.poolsOf ? O.poolsOf(R) : ['massa', 'cru', 'forno'];
      for (const k of ['got', 'calor', 'fogo', 'lenha', 'feitos', 'quebrados', 'usado'].concat(pools)) if (!fin(d[k]) || d[k] < -EPS) add('oficio', 1, `${nm}: ${k} = ${d[k]}`);
      // the books of the transformation close: the input used, in finished pieces, is what is in the pools and what was counted
      const f = {}; let last = null;
      // (the finished pieces each unit of a pool or of the input becomes: a stage that makes them, give/take of what it takes;
      // a stage before it, its own give/take of what the next one makes of its pool)
      for (let i = R.st.length - 1; i >= 0; i--) { const st = R.st[i]; if (st.kind !== 'mao') continue; const k = (st.make ? 1 : (f[st.to] || 0)) * (st.give || st.take) / st.take; if (st.make) last = st; if (st.from) f[st.from] = k; else f.in = k; }
      if (last && f.in) {
        const inP = (d.usado || 0) * f.in; let have = (d.feitos || 0) + (d.quebrados || 0);
        for (const p of pools) if (f[p]) have += (d[p] || 0) * f[p];
        if (Math.abs(inP - have) > 0.01) add('oficio', 1, `${nm}: as contas de ${R.name} não fecham — o que se usou de ${R.in} dá ${Math.round(inP * 100) / 100}, há ${Math.round(have * 100) / 100} (${pools.join(', ')}, prontos, quebrados)`);
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
    // the day of a tavern (G.Taverna): one at a time, at a tavern standing; its people at the tables are alive; its till is
    // the ledger's payments of it, and in a people of coin nothing was served without one
    if (G.Taverna) {
      const days = new Map();
      for (const op of (s.acts || []).filter(o => o.def === 'taverna' && LIVE[o.st])) {
        const nm = `dia da taverna #${op.id}`; const d = op.data || {}; const b = s.buildings.get(op.at);
        if (days.has(op.at)) add('oficio', 2, `taverna #${op.at}: dois dias abertos (#${days.get(op.at)} e #${op.id})`); days.set(op.at, op.id);
        if (!b || b.type !== 'taverna' || !b.built) { add('oficio', 2, `${nm}: a taverna ${op.at} ${!b ? 'não existe' : 'não está de pé'} e o dia segue`); continue; }
        for (const k of ['servidos', 'receita', 'custo', 'faltas', 'recusas']) if (!fin(d[k]) || d[k] < -EPS) add('oficio', 1, `${nm}: ${k} = ${d[k]}`);
        for (const id in d.mesa || {}) if (!s.villagers.has(+id)) add('oficio', 2, `${nm}: #${id} à mesa não existe`);
        for (const id of d.fila || []) if (!(d.mesa || {})[id]) add('oficio', 3, `${nm}: #${id} na fila sem estar à mesa`);
        const led = s.ledger || [];
        if (led.length && (led[0][1] < op.born || (led[0][1] === op.born && led[0][2] <= op.t0))) {
          let paid = 0, goods = 0, coins = 0; for (const e of led) { if (e[7] !== op.id || e[8] !== 'taverna') continue; if (e[5] === 'moedas') { paid += e[6]; coins++; } else goods++; }
          if (Math.abs(paid - (d.receita || 0)) > 0.01) add('oficio', 2, `${nm}: o caixa diz ${d.receita}, os pagamentos do livro-razão ${Math.round(paid * 100) / 100}`);
          if (G.Eco.coinage(op.fac) && goods !== coins) add('oficio', 2, `${nm}: ${goods} servidos e ${coins} pagamentos num povo de moeda`);
        }
      }
      // nobody kept inside a tavern by a day that is over
      for (const v of s.villagers.values()) {
        const t = v.task; if (!t || t.type !== 'tavern' || !(t.st >= 1) || !v.inside) continue;
        const op = (s.acts || []).find(o => o.id === t.op); if (!op || !LIVE[op.st]) add('oficio', 3, `${v.name} #${v.id}: dentro da taverna #${t.id} num dia que acabou`);
      }
    }
    // the day of the baths (G.Termas): one at a time, at baths standing; its bathers alive; the fire within what the furnace
    // holds; the entries the ledger's payments of it, and the wood burnt the ledger's logs of it
    if (G.Termas) {
      const days = new Map();
      for (const op of (s.acts || []).filter(o => o.def === 'termas' && LIVE[o.st])) {
        const nm = `dia dos banhos #${op.id}`; const d = op.data || {}; const b = s.buildings.get(op.at);
        if (days.has(op.at)) add('oficio', 2, `banhos #${op.at}: dois dias abertos (#${days.get(op.at)} e #${op.id})`); days.set(op.at, op.id);
        if (!b || b.type !== 'banhos' || !b.built) { add('oficio', 2, `${nm}: os banhos ${op.at} ${!b ? 'não existem' : 'não estão de pé'} e o dia segue`); continue; }
        for (const k of ['entradas', 'receita', 'lenha', 'calor', 'quentes', 'frios']) if (!fin(d[k]) || d[k] < -EPS) add('oficio', 1, `${nm}: ${k} = ${d[k]}`);
        if (d.calor > 2 * G.Termas.BURN + EPS) add('oficio', 2, `${nm}: ${d.calor} s de fogo, mais que a fornalha leva (${2 * G.Termas.BURN})`);
        for (const id in d.banho || {}) if (!s.villagers.has(+id)) add('oficio', 2, `${nm}: #${id} nos banhos não existe`);
        const led = s.ledger || [];
        if (led.length && (led[0][1] < op.born || (led[0][1] === op.born && led[0][2] <= op.t0))) {
          // (the entries less the entries given back to one who found no place in the water)
          let paid = 0, logs = 0; for (const e of led) { if (e[7] !== op.id) continue; if (e[8] === 'termas' && e[5] === 'moedas') paid += e[6]; if (e[8] === 'termas-volta' && e[5] === 'moedas') paid -= e[6]; if (e[8] === 'fornalha' && e[5] === 'wood') logs += e[6]; }
          if (Math.abs(paid - (d.receita || 0)) > 0.01) add('oficio', 2, `${nm}: o caixa diz ${d.receita}, as entradas do livro-razão ${Math.round(paid * 100) / 100}`);
          if (Math.abs(logs - (d.lenha || 0)) > 0.01) add('oficio', 2, `${nm}: ${d.lenha} de lenha queimada, o livro-razão diz ${Math.round(logs * 100) / 100}`);
        }
      }
      for (const v of s.villagers.values()) {
        const t = v.task; if (!t || t.type !== 'termas' || !(t.st >= 1) || !v.inside) continue;
        const op = (s.acts || []).find(o => o.id === t.op); if (!op || !LIVE[op.st]) add('oficio', 3, `${v.name} #${v.id}: dentro dos banhos #${t.id} num dia que acabou`);
      }
    }
    // the show of a theatre (G.Teatro): one at a time, at a theatre standing; its audience and its actors alive; the entries the
    // ledger's payments less the ones given back, the actors' pay the ledger's; nobody kept in a show that is over
    if (G.Teatro) {
      const shows = new Map();
      for (const op of (s.acts || []).filter(o => o.def === 'espetaculo' && LIVE[o.st])) {
        const nm = `espetáculo #${op.id}`; const d = op.data || {}; const b = s.buildings.get(op.at);
        if (shows.has(op.at)) add('oficio', 2, `teatro #${op.at}: dois espetáculos vivos (#${shows.get(op.at)} e #${op.id})`); shows.set(op.at, op.id);
        if (!b || b.type !== 'teatro' || !b.built) { add('oficio', 2, `${nm}: o teatro ${op.at} ${!b ? 'não existe' : 'não está de pé'} e o espetáculo segue`); continue; }
        for (const k of ['entradas', 'receita', 'voltas', 'pagos']) if (!fin(d[k]) || d[k] < -EPS) add('oficio', 1, `${nm}: ${k} = ${d[k]}`);
        if (!{ portas: 1, peca: 1, fim: 1 }[d.fase]) add('oficio', 1, `${nm}: fase ${d.fase}`);
        for (const id in d.plateia || {}) if (!s.villagers.has(+id)) add('oficio', 2, `${nm}: #${id} na plateia não existe`);
        for (const id in d.atores || {}) if (!s.villagers.has(+id)) add('oficio', 2, `${nm}: #${id} no palco não existe`);
        const led = s.ledger || [];
        if (led.length && (led[0][1] < op.born || (led[0][1] === op.born && led[0][2] <= op.t0))) {
          let paid = 0, wages = 0; for (const e of led) { if (e[7] !== op.id || e[5] !== 'moedas') continue; if (e[8] === 'teatro') paid += e[6]; if (e[8] === 'teatro-volta') paid -= e[6]; if (e[8] === 'salario') wages += e[6]; }
          if (Math.abs(paid - (d.receita || 0)) > 0.01) add('oficio', 2, `${nm}: o caixa diz ${d.receita}, as entradas do livro-razão ${Math.round(paid * 100) / 100}`);
          if (Math.abs(wages - (d.pagos || 0)) > 0.01) add('oficio', 2, `${nm}: pagou ${d.pagos} aos atores, o livro-razão diz ${Math.round(wages * 100) / 100}`);
        }
      }
      for (const v of s.villagers.values()) {
        const t = v.task; if (!t || (t.type !== 'teatro' && t.type !== 'atuar') || !(t.st >= 1) || !v.inside) continue;
        const op = (s.acts || []).find(o => o.id === t.op); if (!op || !LIVE[op.st]) add('oficio', 3, `${v.name} #${v.id}: dentro do teatro #${t.id} num espetáculo que acabou`);
      }
    }
    // the library's day (G.Biblioteca): no more readings and copies than a day of it counts; its readers alive
    if (G.Biblioteca) {
      for (const b of s.buildings.values()) {
        const k = b.livros; if (b.type !== 'biblioteca' || !k) continue;
        if (!fin(k.lidos) || k.lidos < 0 || k.lidos > G.Biblioteca.MAX || !fin(k.copias) || k.copias < 0 || k.copias > G.Biblioteca.MAX - 2) add('oficio', 2, `biblioteca #${b.id}: ${k.lidos} leituras e ${k.copias} cópias num dia (o dia conta ${G.Biblioteca.MAX} e ${G.Biblioteca.MAX - 2})`);
        for (const id in k.quem || {}) if (!s.villagers.has(+id)) add('oficio', 2, `biblioteca #${b.id}: #${id} lendo não existe`);
      }
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
    // the works, a holder of the depot ('o', L-246): what a work still needs is within its bill (nothing it got vanished
    // from it, nothing was born in it); what it waits for on the way is what its builders carry for it; what it got is what
    // the ledger brought it — from the checker's first look at it —, and a work that ends ends with no material left unwritten
    if (G.Village.delivered && G.Depot && G.Depot.exists) {
      // (a builder lent to a scene keeps the errand to be given back, with its load on the way: G.Scene.prevTask)
      const carried = new Map();
      for (const v of s.villagers.values()) {
        const t = v.task && v.task.type === 'scene' && G.Scene && G.Scene.prevTask ? G.Scene.prevTask(v) : v.task;
        if (t && t.type === 'build' && t.counted && t.mat) { const key = t.id + '|' + t.mat; carried.set(key, (carried.get(key) || 0) + (t.cn || 0)); }
      }
      const live = new Set();
      for (const b of s.buildings.values()) {
        if (b.built || !b.need || b.type === 'ruin') continue;
        live.add(b.id); const nm = `obra ${b.type}#${b.id}`; const bill = G.Village.bill(b);
        for (const k in b.need) {
          const n = b.need[k];
          if (!fin(n) || n < -EPS) { add('oficio', 1, `${nm}: pede ${n} de ${k}`); continue; }
          if (n > (bill[k] || 0) + EPS) add('oficio', 2, `${nm}: pede ${n} de ${k}, mais que a conta dela (${bill[k] || 0}) — material que sumiu da obra`);
        }
        for (const k in b.incoming || {}) {
          const n = b.incoming[k], c = carried.get(b.id + '|' + k) || 0;
          if (!fin(n) || n < -EPS) add('oficio', 1, `${nm}: ${n} de ${k} a caminho`);
          else if (Math.abs(n - c) > 0.01) add('oficio', 2, `${nm}: espera ${n} de ${k} a caminho, os construtores trazem ${c}`);
        }
        const got = G.Village.delivered(b); let e = sites.get(b.id);
        if (!e) { sites.set(b.id, { base: got, flow: {} }); continue; }
        for (const k of new Set(Object.keys(got).concat(Object.keys(e.base), Object.keys(e.flow)))) {
          const want = (e.base[k] || 0) + (e.flow[k] || 0), has = got[k] || 0;
          if (Math.abs(want - has) > 0.01) { add('oficio', 2, `${nm}: tem ${has} de ${k}, o livro-razão diz ${Math.round(want * 100) / 100} — mudou à mão`); e.base[k] = has - (e.flow[k] || 0); }
        }
      }
      for (const [id, e] of sites) {
        if (live.has(id)) continue;
        for (const k of new Set(Object.keys(e.base).concat(Object.keys(e.flow)))) { const left = (e.base[k] || 0) + (e.flow[k] || 0); if (Math.abs(left) > 0.01) add('oficio', 2, `a obra #${id} acabou com ${Math.round(left * 100) / 100} de ${k} sem linha no livro-razão`); }
        sites.delete(id);
      }
    }
  });
  // (what the ledger moves in and out of each work, from the checker's first look at it; a work first met by a line is met
  // with what it had before that line)
  const sites = new Map();
  if (G.Depot) G.Depot.onMove.push(e => {
    for (const [ref, sg] of [[e[3], -1], [e[4], 1]]) {
      if (typeof ref !== 'string' || ref[0] !== 'o' || ref[1] !== ':') continue;
      const id = +ref.slice(2); let x = sites.get(id);
      if (!x) { const b = G.S.buildings.get(id); const got = b && G.Village.delivered ? G.Village.delivered(b) : {}; got[e[5]] = (got[e[5]] || 0) - sg * e[6]; x = { base: got, flow: {} }; sites.set(id, x); }
      x.flow[e[5]] = (x.flow[e[5]] || 0) + sg * e[6];
    }
  });
  if (G.worldHooks) G.worldHooks.push(() => sites.clear());
})();
