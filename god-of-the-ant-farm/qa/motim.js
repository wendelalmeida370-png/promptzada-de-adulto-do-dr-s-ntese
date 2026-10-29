// motim: a revolta atravessa um save (L-190) — provocada de propósito.   node qa/motim.js [mundo pronto]
// O save guardava o motim, mas não o que cada um fazia nele (as tarefas das pessoas não vão no save), e o load o apagava:
// a rua ficava calma de repente, sem desfecho nenhum — e a ida e volta acusava (QA.roundTrip, riots).
// m1 save/load na concentração; m2 na marcha; m3 na fúria, com a guarda na praça; m4 o líder morre no meio, e o save vem
// logo depois; m5 um save antigo (o motim sem as tarefas guardadas) carrega como antes: a rua calma; m6 uma guerra convoca o
// povo no meio do motim: os amotinados ficam na praça (L-366); e o verificador limpo.
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const world = process.argv[2] || 'cidade';
const fails = []; const mid = []; // (what the checker saw in the middle of a case: the case fails, even if the end looks clean)
const ok = (name, c, info) => { const m = mid.splice(0); const pass = c && !m.length; console.log(`${pass ? 'PASSOU' : 'FALHOU'} | motim ${name} | ${info}${m.length ? ' — o verificador, no meio do caso: ' + m.slice(0, 2).join(' · ') : ''}`); if (!pass) fails.push(name); };
const watch = () => { for (const q of QA.check()) { const t = `[S${q.sev}] ${q.sys}: ${q.msg}`; if (q.sev <= 2 && !mid.includes(t)) mid.push(t); } };
const live = (sec, until) => { for (let k = 1; k <= sec * 10; k++) { M.viver(0.1); if (k % 30 === 0) watch(); if (until && until()) { watch(); return true; } } watch(); return false; };
const finish = () => { const e = M.erros(); const mods = Object.keys(e.mod); console.log(`${mods.length || e.console.length ? 'FALHOU' : 'PASSOU'} | motim erros | módulos: ${mods.join(', ') || 'nenhum'}; console: ${e.console.slice(0, 3).join(' · ') || 'nada'}`); if (mods.length || e.console.length) fails.push('erros'); console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU: todos'); process.exit(fails.length ? 1 : 0); };
M.pronto(world); let S = G.S; M.viver(2);

const P = G.Politics;
// the towns where a riot can rise: a ruler, twenty people, a people at peace (a riot does not rise under a threat of war);
// the guard is the town's warriors within reach of the square (m3 needs them)
const warriors = s => [...G.S.villagers.values()].filter(v => v.role === 'guerreiro' && !v.captive && G.Fac.idOfV(v) === s.fac && G.dist(v.x, v.y, s.cx, s.cy) < 40).length;
const towns = () => [...G.S.settlements.values()].filter(s => { const f = G.Fac.get(s.fac); return f && f.alive && P.ruler(f) && G.Village.pop(s.id) >= 20 && !(G.War.threat && G.War.threat(s.id)); });
if (!towns().length) { console.log('FALHOU | motim | precondição: nenhuma cidade de 20 com governante e em paz'); process.exit(1); }
const riot = id => (G.S.riots || []).find(R => R.id === id);
const inIt = R => R.ids.map(i => G.S.villagers.get(i)).filter(v => v && v.task && v.task.type === 'riot' && v.task.r === R.id).length;
const guarding = R => R.guards.map(i => G.S.villagers.get(i)).filter(v => v && v.task && v.task.type === 'riotguard' && v.task.r === R.id).length;
// a riot of a town's people, everyone free and willing joining (boost), in the first town that takes one (a town just risen,
// or with its people in the cells, does not); hard: a cruel ruler sends the guard, in a town that has one
const rise = (hard) => {
  const list = towns().filter(s => !hard || warriors(s) > 0).sort((a, b) => (hard ? Math.min(3, warriors(b)) - Math.min(3, warriors(a)) : 0) || G.Village.pop(b.id) - G.Village.pop(a.id));
  const pe0 = P.leaderPe;
  for (const set of list) {
    const f = G.Fac.get(set.fac); if (hard) P.leaderPe = q => q.id === f.id ? Object.assign({}, pe0(q), { cru: 0.95 }) : pe0(q);
    const R = G.Riots.start(f, set, 'impostos', { boost: 1 });
    if (R) return { R, where: `${set.name}, ${G.Village.pop(set.id)} habitantes, ${warriors(set)} guerreiros`, undo: () => { P.leaderPe = pe0; } };
    P.leaderPe = pe0;
  }
  rise.why = hard && !list.length ? 'nenhuma cidade com guerreiros por perto neste mundo: a guarda não vem' : `nenhuma das ${list.length} cidades aceitou um motim agora`;
  return { R: null, undo: () => { } };
};
// to the end: the riot is gone from the list, and nobody is left in it or guarding it
const toEnd = id => { live(200, () => !riot(id)); const stale = [...G.S.villagers.values()].filter(v => v.task && (v.task.type === 'riot' || v.task.type === 'riotguard') && v.task.r === id).length; return { over: !riot(id), stale }; };
// (each case in the ready world just opened: the cases one after another held the same crowd in the square, case after case, and
// nobody ate in between — the world gives a town time after a riot, a risen town takes none (Riots.start) —; with the
// generation-6 metropolis two of Argos were dying of hunger in m6, the town's store full, and the checker said so, T-236)
const fresh = () => { M.pronto(world); S = G.S; M.viver(2); };
const lastLog = () => (G.S.history.slice(-6).map(e => e.t || e.txt || '').filter(t => /motim|multidão|praça/i.test(t)).pop() || '').slice(0, 120);

// ---------------- m1 the save in the rally ----------------
{
  const { R, where, undo } = rise(false);
  if (!R) ok('m1 a concentração atravessa o save', false, 'precondição: ' + rise.why);
  else {
    live(3); const n0 = inIt(R), ph = R.phase;
    const trip = QA.roundTrip(); S = G.S; const R1 = riot(R.id);
    ok('m1 a concentração atravessa o save', !trip.diff.length && !!R1 && R1.phase === ph && inIt(R1) === n0, `${where}: ${n0} na praça (${ph}); o save: ${trip.diff.length ? trip.diff.slice(0, 2).join(' | ') : 'igual'}; depois do load: ${R1 ? `${R1.phase}, ${inIt(R1)} na praça` : 'o motim sumiu'}`);
    const e = toEnd(R.id);
    ok('m1 o desfecho', e.over && !e.stale, `${e.over ? 'acabou' : 'não acabou em 200 s'}; ${e.stale} ainda com a tarefa do motim; «${lastLog()}»`);
  }
  undo();
}

// ---------------- m2 the save in the march ----------------
{
  fresh();
  const { R, where, undo } = rise(false);
  if (!R) ok('m2 a marcha atravessa o save', false, 'precondição: ' + rise.why);
  else {
    // (a moment into the march: in the generation-6 metropolis Argos marched 2,7 tiles to its storehouse, in 2,2 s, and the save
    // two seconds after the rally fell in the rage, T-236)
    live(40, () => R.phase !== 'rally'); live(1); const n0 = inIt(R), g0 = guarding(R), ph = R.phase;
    const trip = QA.roundTrip(); S = G.S; const R1 = riot(R.id);
    ok('m2 a marcha atravessa o save', ph === 'march' && !trip.diff.length && !!R1 && R1.phase === ph && inIt(R1) === n0 && guarding(R1) === g0, `${where}: ${n0} marchando (${ph}), ${g0} guardas; o save: ${trip.diff.length ? trip.diff.slice(0, 2).join(' | ') : 'igual'}; depois do load: ${R1 ? `${R1.phase}, ${inIt(R1)} marchando, ${guarding(R1)} guardas` : 'o motim sumiu'}`);
    const e = toEnd(R.id);
    ok('m2 o desfecho', e.over && !e.stale, `${e.over ? 'acabou' : 'não acabou em 200 s'}; ${e.stale} ainda com a tarefa do motim; «${lastLog()}»`);
  }
  undo();
}

// ---------------- m3 the save in the rage, the guard in the square ----------------
{
  fresh();
  const { R, where, undo } = rise(true);
  if (!R) ok('m3 a fúria e a guarda atravessam o save', false, 'precondição: ' + rise.why);
  else {
    live(80, () => R.phase === 'rage'); live(3); const n0 = inIt(R), g0 = guarding(R), ph = R.phase;
    const trip = QA.roundTrip(); S = G.S; const R1 = riot(R.id);
    ok('m3 a fúria e a guarda atravessam o save', ph === 'rage' && g0 > 0 && !trip.diff.length && !!R1 && R1.phase === ph && inIt(R1) === n0 && guarding(R1) === g0, `${where}: ${n0} na fúria (${ph}, resposta ${R.resp}), ${g0} guardas; o save: ${trip.diff.length ? trip.diff.slice(0, 2).join(' | ') : 'igual'}; depois do load: ${R1 ? `${R1.phase}, ${inIt(R1)} na fúria, ${guarding(R1)} guardas` : 'o motim sumiu'}`);
    const e = toEnd(R.id);
    ok('m3 o desfecho', e.over && !e.stale, `${e.over ? 'acabou' : 'não acabou em 200 s'}; ${e.stale} ainda com a tarefa do motim; «${lastLog()}»`);
  }
  undo();
}

// ---------------- m4 the leader dies in the middle, and the save comes right after ----------------
{
  fresh();
  const { R, where, undo } = rise(false);
  if (!R) ok('m4 o líder morre no meio', false, 'precondição: ' + rise.why);
  else {
    live(4); const lead = G.S.villagers.get(R.lead); if (lead) G.Village.kill(lead, 'teste'); live(1);
    const n0 = inIt(R); const trip = QA.roundTrip(); S = G.S; const R1 = riot(R.id);
    const n1 = R1 ? inIt(R1) : 0;
    const e = R1 ? toEnd(R.id) : { over: true, stale: 0 };
    ok('m4 o líder morre no meio', !!lead && !trip.diff.length && !!R1 && n1 === n0 && e.over && !e.stale, `${where}: líder ${lead ? lead.name + ' morto' : 'nenhum'}; ${n0} seguem; o save: ${trip.diff.length ? trip.diff.slice(0, 2).join(' | ') : 'igual'}; ${R1 ? `depois do load o motim seguiu com ${n1}` : 'o motim sumiu no load'}; ${e.over ? 'acabou' : 'não acabou'}, ${e.stale} presos na tarefa`);
  }
  undo();
}

// ---------------- m5 an old save: the riot without the tasks kept quiets the street, as it always did ----------------
{
  fresh();
  const { R, where, undo } = rise(false);
  if (!R) ok('m5 o save antigo', false, 'precondição: ' + rise.why);
  else {
    live(3); const o = JSON.parse(G.Save.serialize()); for (const q of o.riots || []) { delete q.held; delete q.guard; }
    G.Save.apply(o); S = G.S; live(2);
    const stale = [...G.S.villagers.values()].filter(v => v.task && (v.task.type === 'riot' || v.task.type === 'riotguard')).length;
    ok('m5 o save antigo', !(G.S.riots || []).length && !stale, `${where}: ${(G.S.riots || []).length} motins depois do load; ${stale} pessoas com tarefa de motim`);
  }
  undo();
}

// ---------------- m6 a levy in the middle of the riot: the crowd stays in the square (L-366) ----------------
// (the ruler's levy took twenty of the forty rioters of Tenochtitlan to a war of conquest, and the riot, its square empty, was
// told as crushed by the guard. Here the town in a riot is called to its defence — a war by the test's hand)
{
  fresh();
  const { R, where, undo } = rise(false);
  if (!R) ok('m6 a convocação no meio do motim: a multidão fica na praça', false, 'precondição: ' + rise.why);
  else {
    live(3); const f = G.Fac.get(R.fac), set = G.S.settlements.get(R.set);
    const foe = G.Fac.all().filter(q => q.alive && q.id !== f.id).sort((a, b) => a.id - b.id)[0];
    const n0 = inIt(R); let A = null;
    if (foe) { G.Wars.ensure(f, foe); const w = G.Wars.warOf(f.id, foe.id); A = w && G.Wars.mobilize(w, f, 'defesa', set); }
    const n1 = inIt(R); const took = A ? A.members.filter(id => R.ids.includes(id)).length : 0;
    const e = toEnd(R.id);
    ok('m6 a convocação no meio do motim: a multidão fica na praça', !!A && n1 === n0 && !took && e.over && !e.stale, `${where}: ${A ? `${A.name} convocou ${A.members.length}` : `NENHUMA convocação (${foe ? 'a levada não saiu' : 'nenhum outro povo'})`}; no motim ${n0} → ${n1}, ${took} amotinado(s) levado(s); ${e.over ? 'o motim acabou' : 'não acabou em 200 s'}, ${e.stale} ainda com a tarefa do motim`);
  }
  undo();
}
finish();
