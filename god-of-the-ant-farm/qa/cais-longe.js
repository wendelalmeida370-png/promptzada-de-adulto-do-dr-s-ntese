// cais-longe: node qa/cais-longe.js [mundo] — a viagem só leva quem chega a pé ao cais, e ninguém embarca de longe (L-346).
// A expedição juntava a tripulação pela distância ao cais (55 casas em linha reta), sem perguntar ao mapa: na metrópole de antes
// de 28/10, Solveig, de Birka, entrou na tripulação de uma viagem do cais de Ribe, numa outra ilha do mesmo povo; o caminho até
// o cais falhou («o mapa diz não»), e depois de 40 s o embarque a pôs a bordo assim mesmo, de 50 casas e através do mar; a
// viagem a deixou na praia de Ribe, aonde ela não chega a pé de casa (o S3 do agua-solta). Aqui, num mundo pronto:
//  k1 a pessoa mais aventureira do povo, numa ilhota perto do cais (a líder certa de uma viagem «só»): a viagem sai sem ela,
//     e toda a tripulação chega a pé ao cais
//  k2 alguém da tripulação levado a uma ilhota no meio da preparação (como um plano de antes deixou): sai da tripulação na
//     hora, e nunca embarca; quem embarca está no cais (a 8 casas, no máximo, e no chão dele)
//  k3 a líder levada a uma ilhota: a viagem não sai
//  k4 o mesmo do k2 salvo e carregado no meio: carregado, sai da tripulação
//  e o verificador limpo (S0–S3 novos), sem erro de módulo.
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | cais-longe ${name} | ${info}`); if (!c) fails.push(name); };
const KEY = process.argv[2] || 'metropole';
let S = M.pronto(KEY); const W = G.W, N = G.N, X = G.Expe, Nv = G.Naval, Vg = G.Vg;
const base = new Set(QA.check().filter(q => q.sev <= 3).map(q => q.sys + '|' + q.msg));
const fresh = () => QA.check().filter(q => q.sev <= 3 && !base.has(q.sys + '|' + q.msg)).map(q => `[S${q.sev}] ${q.sys}: ${q.msg}`);
// (a dock of a people, and an islet near its mooring: walkable ground from which the quay is not reached)
const findPick = () => {
  const S = G.S;
  for (const d of [...S.buildings.values()].filter(b => b.type === 'doca' && b.built).sort((a, b) => a.id - b.id)) {
    const di = Nv.dockInfo(d); if (!di.moor) continue; const set = S.settlements.get(d.set); const f = set && G.Fac.get(set.fac); if (!f) continue;
    let isl = null, bd = 1e9;
    for (let i = 0; i < N * N; i++) { if (!W.walkable(i) || S.occ[i]) continue; const x = (i % N) + 0.5, y = ((i / N) | 0) + 0.5; const dd = G.dist(x, y, di.moor[0], di.moor[1]); if (dd > 40 || dd < 8 || dd >= bd) continue; if (W.canWalk(x, y, di.moor[0], di.moor[1], true)) continue; bd = dd; isl = [x, y]; }
    if (isl) return { d, di, set, f, isl, bd };
  }
  return null;
};
const fit = (v, f) => v && !v.captive && !v.aboard && !v.held && !v.air && !v.ug && v.hp >= 55 && !(v.preg > 0) && !v.rebel && v.age >= 20 && v.age <= 50 && G.Fac.idOfV(v) === f.id && v.id !== f.leader && !(S.avatar && S.avatar.id === v.id) && !X.memberOf(v.id);
const moved = new Set(); const toIslet = (v, isl) => { Vg.endTask(v); v.inside = 0; v.x = isl[0]; v.y = isl[1]; v.path = null; moved.add(v.id); };
const goal = p => ({ k: 'terra', w: 1, why: 'terra', txt: '', x: p.di.moor[0] + 12, y: p.di.moor[1] });
// (a medium voyage of more than five builds an explorer when none lies idle at the quay — 22 of wood, and 4 kept —: in the
// metropole of 28/10 Hedeby had 17, and the voyage put the wood aside and did not sail. The case is who walks to the quay,
// not the timber: the test's hand gives the people the wood for the hull, through the depot, T-217)
const media = p => { const need = Nv.SHIP.explorador.cost + 6 - (p.f.stock.wood || 0); if (need > 0) G.Depot.make('f:' + p.f.id, 'wood', need, { code: 'teste', part: true }); return X.launch(p.f, goal(p), 'media', {}); };
const reachAll = e => e.crew.map(id => G.S.villagers.get(id)).filter(Boolean).every(v => v.aboard || W.reaches(v, e.port[0], e.port[1]));
let p = findPick();
if (!p) ok('k1 a mais aventureira, numa ilhota perto do cais: a viagem sai sem ela', false, 'nenhuma doca com uma ilhota perto do cais neste mundo');
else {
  // k1 — the most adventurous of the people, on an islet near the quay
  const me = [...S.villagers.values()].filter(v => fit(v, p.f) && !v.partner && !(v.kids || []).length).sort((a, b) => a.id - b.id)[0];
  if (!me) ok('k1 a mais aventureira, numa ilhota perto do cais: a viagem sai sem ela', false, 'ninguém livre no povo');
  else {
    me.traits = ['Curioso', 'Corajoso']; me.courage = 1; me.voyages = 6; toIslet(me, p.isl);
    const e = X.launch(p.f, goal(p), 'so', {});
    ok('k1 a mais aventureira, numa ilhota perto do cais: a viagem sai sem ela', !!e && !e.crew.includes(me.id) && reachAll(e),
      `${me.name} numa ilhota a ${p.bd.toFixed(0)} casas do cais de ${p.set.name}: ${e ? `a viagem «só» de ${e.leaderName} (${e.crew.length} na tripulação), ${e.crew.includes(me.id) ? 'COM ela' : 'sem ela'}; todos chegam a pé ao cais: ${reachAll(e)}` : 'nenhuma viagem saiu (ninguém mais no cais)'}`);
  }
  // k2 — one of the crew taken to the islet in the middle of the gathering; and nobody boards from far
  {
    S = M.pronto(KEY); moved.clear(); p = findPick() || p; // (each case in a world of its own: the voyages before spent its wood and its crews)
    const e = media(p);
    const v = e && e.crew.map(id => S.villagers.get(id)).find(q => q && q.id !== e.leader && !q.aboard);
    if (!e || !v) ok('k2 alguém da tripulação levado a uma ilhota: sai da tripulação e não embarca; quem embarca está no cais', false, !e ? 'a viagem «média» não saiu' : 'a viagem não tem tripulação além da líder');
    else {
      toIslet(v, p.isl); const far = []; const ob = Nv.board;
      Nv.board = function (q, s) { if (e.crew.includes(q.id) || q.id === v.id) { const d = G.dist(q.x, q.y, e.port[0], e.port[1]); if (d > 8 || !W.reaches(q, e.port[0], e.port[1])) far.push(`${q.name} a ${d.toFixed(1)}`); } return ob.apply(this, arguments); };
      let n = 0, out = false; try { while (n++ < 4000 && !(out && X.get(e.id) && !['prep', 'reunir', 'embarque'].includes(e.st))) { G.debug.step(0.1); if (!out && !e.crew.includes(v.id)) out = n; if (n > 50 && !out) break; } } finally { Nv.board = ob; }
      const boarded = !!v.aboard;
      ok('k2 alguém da tripulação levado a uma ilhota: sai da tripulação e não embarca; quem embarca está no cais', !!out && out <= 50 && !boarded && !far.length,
        `${v.name}, da tripulação de ${e.name}, numa ilhota: ${out ? 'fora da tripulação em ' + (out / 10).toFixed(1) + ' s' : 'AINDA na tripulação'}${boarded ? ', e EMBARCOU' : ''}; a viagem em «${e.st}»; embarcados de longe: ${far.length ? far.join(', ') : 'nenhum'}`);
    }
  }
  // k3 — the leader taken to the islet: the voyage does not sail
  {
    S = M.pronto(KEY); moved.clear(); p = findPick() || p; // (each case in a world of its own: the voyages before spent its wood and its crews)
    const e = media(p); const lead = e && S.villagers.get(e.leader);
    if (!e || !lead) ok('k3 a líder levada a uma ilhota: a viagem não sai', false, 'a viagem «média» não saiu');
    else { toIslet(lead, p.isl); for (let k = 0; k < 30 && e.st !== 'fim'; k++) G.debug.step(0.1);
      ok('k3 a líder levada a uma ilhota: a viagem não sai', e.st === 'fim' && e.status === 'cancelada', `${lead.name}, à frente de ${e.name}, numa ilhota: ${e.st === 'fim' ? 'a viagem ' + e.status : 'a viagem segue em «' + e.st + '»'}`); }
  }
  // k4 — the same as k2, saved and loaded in the middle
  {
    S = M.pronto(KEY); moved.clear(); p = findPick() || p; // (each case in a world of its own: the voyages before spent its wood and its crews)
    const e = media(p);
    const v = e && e.crew.map(id => S.villagers.get(id)).find(q => q && q.id !== e.leader && !q.aboard);
    if (!e || !v) ok('k4 o mesmo, salvo e carregado no meio: carregado, sai da tripulação', false, !e ? 'a viagem «média» não saiu' : 'sem tripulação além da líder');
    else {
      toIslet(v, p.isl); const eid = e.id, vid = v.id; M.salvarCarregar(); S = G.S;
      let n = 0; const e1 = () => X.get(eid); while (n++ < 50 && e1() && e1().crew.includes(vid)) G.debug.step(0.1);
      ok('k4 o mesmo, salvo e carregado no meio: carregado, sai da tripulação', !!e1() && !e1().crew.includes(vid), `carregado: ${e1() ? (e1().crew.includes(vid) ? 'AINDA na tripulação' : 'fora da tripulação em ' + (n / 10).toFixed(1) + ' s') : 'a viagem sumiu no load'}`);
    }
  }
}
// (the test's own islanders back home before the checker: the islet was the test's doing)
for (const id of moved) { const v = G.S.villagers.get(id); if (!v) continue; const set = G.S.settlements.get(v.set); const h = G.S.buildings.get(v.home); const d = h ? Vg.door(h) : set ? [set.cx, set.cy] : null; if (d && W.walkableXY(d[0], d[1])) { Vg.endTask(v); v.x = d[0]; v.y = d[1]; v.path = null; v._pfN = 0; v._stray = 0; } }
const nv = fresh(); const er = M.erros(); const mods = Object.keys(er.mod);
ok('verificador', !nv.length, nv.slice(0, 3).join(' · ') || 'limpo');
ok('erros', !mods.length && !er.console.length, `módulos: ${mods.join(', ') || 'nenhum'}; console: ${er.console.slice(0, 2).join(' · ') || 'nada'}`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU: todos');
process.exit(fails.length ? 1 : 0);
