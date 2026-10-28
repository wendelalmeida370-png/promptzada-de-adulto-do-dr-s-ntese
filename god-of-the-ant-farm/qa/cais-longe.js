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
//  k5 um susto no cais no meio da reunião (um bicho na beira d'água: todos fogem): a tripulação volta ao cais, e a viagem sai
//     com ela inteira (L-367: a grande viagem de Públio, no mar 8, saiu com um de vinte e seis)
//  k6 os dois primeiros da fila do embarque longe do cais: quem está no cais embarca assim mesmo (L-367)
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
  // k5 — a fright on the quay in the middle of the gathering: the crew runs, comes back, and sails whole
  {
    S = M.pronto(KEY); moved.clear(); p = findPick() || p;
    const e = media(p); const K5 = 'k5 um susto no cais: a tripulação foge, volta, e a viagem sai com ela inteira';
    let n = 0; while (e && n++ < 4000 && X.get(e.id) && e.st === 'prep') G.debug.step(0.1);
    if (!e || !X.get(e.id) || e.st !== 'reunir') ok(K5, false, !e ? 'a viagem «média» não saiu' : `a viagem não chegou à reunião no cais (${X.get(e.id) ? e.st : 'sumiu'})`);
    else {
      // (the fright, as the emergency gives it: everyone on the quay runs from a beast at the water's edge — the test's hand)
      const crew0 = e.crew.slice(); for (const id of crew0) { const v = S.villagers.get(id); if (v && !v.aboard) G.Vg.fleeFrom(v, e.port[0], e.port[1], 7, 'wolf'); }
      const fled = crew0.filter(id => { const v = S.villagers.get(id); return v && v.task && v.task.type === 'flee'; }).length;
      let m = 0; while (m++ < 2400 && X.get(e.id) && ['reunir', 'embarque'].includes(e.st)) G.debug.step(0.1);
      const sailed = !!X.get(e.id) && !['prep', 'reunir', 'embarque', 'fim'].includes(e.st);
      const live0 = crew0.map(id => S.villagers.get(id)).filter(Boolean); const behind = live0.filter(v => !v.aboard);
      ok(K5, fled > 0 && sailed && !behind.length, `${e.name}: ${crew0.length} na reunião do cais, ${fled} fugiram do susto; ${sailed ? 'a viagem saiu (' + e.st + ')' : 'a viagem NÃO saiu (' + (X.get(e.id) ? e.st : 'sumiu') + ')'}: ${live0.length - behind.length} a bordo, ${behind.length ? behind.length + ' deixados em terra (' + behind.slice(0, 3).map(v => v.name + ': ' + (v.task ? v.task.type : 'nada')).join(', ') + ')' : 'ninguém deixado'}`);
    }
  }
  // k6 — the first two of the boarding line away from the quay (a long errand of their own: the test's hand holds them a dozen
  // steps up the quay's own ground): the ones on the quay board all the same
  {
    S = M.pronto(KEY); moved.clear(); p = findPick() || p;
    const e = media(p); const K6 = 'k6 os dois primeiros da fila longe do cais: quem está no cais embarca assim mesmo';
    let n = 0; while (e && n++ < 4000 && X.get(e.id) && e.st !== 'embarque' && e.st !== 'fim') G.debug.step(0.1);
    const held = e ? e.crew.map(id => S.villagers.get(id)).filter(v => v && !v.aboard && v.id !== e.leader).slice(0, 2) : [];
    let far = null; if (e) for (let r = 10; r <= 14 && !far; r++) for (let k = 0; k < 24 && !far; k++) { const x = Math.floor(e.port[0] + Math.cos(k / 24 * 6.283) * r) + 0.5, y = Math.floor(e.port[1] + Math.sin(k / 24 * 6.283) * r) + 0.5; if (W.inb(x, y) && W.walkableXY(x, y) && W.canWalk(e.port[0], e.port[1], x, y, false)) far = [x, y]; }
    if (!e || e.st !== 'embarque' || held.length < 2 || !far) ok(K6, false, !e ? 'a viagem «média» não saiu' : e.st !== 'embarque' ? `a viagem não chegou ao embarque (${e.st})` : held.length < 2 ? 'menos de dois na fila' : 'nenhum chão a dez passos do cais');
    else {
      const others = e.crew.filter(id => !held.some(h => h.id === id)).map(id => S.villagers.get(id)).filter(Boolean);
      const atQuay = others.filter(v => !v.aboard && G.dist(v.x, v.y, e.port[0], e.port[1]) <= 3.5).length, a0 = others.filter(v => v.aboard).length;
      let k = 0; while (k++ < 100 && X.get(e.id) && e.st === 'embarque') { for (const h of held) { h.x = far[0]; h.y = far[1]; h.path = null; } G.debug.step(0.1); }
      const a1 = others.filter(v => v.aboard).length;
      ok(K6, a1 - a0 >= Math.min(4, atQuay), `${held.map(h => h.name).join(' e ')}, os primeiros da fila, a ${G.dist(far[0], far[1], e.port[0], e.port[1]).toFixed(0)} casas do cais; dos outros, ${atQuay} no cais: em 10 s, ${a1 - a0} embarcaram`);
      for (const h of held) h.path = null;
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
