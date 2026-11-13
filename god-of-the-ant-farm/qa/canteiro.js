// canteiro: a carroça da obra grande (Bairros Vivos, o agente M, 2ª rodada; T-760, D-215), em Node, num mundo pronto. A obra
// grande longe dos armazéns quase não andava: os construtores levam quatro de cada vez, e a 35 casas do armazém cada um fazia
// uma viagem por dia — um teatro de 24 m, com o armazém cheio, recebia um quinto do que recebia a 14 casas. O canteiro da obra já
// existia (o lugar 'o:' do depósito: o que chegou e ainda não foi assentado, L-246); faltava quem levasse de longe: a carroça
// de bois do povo que sabe a roda (city.js, Ci.workCart), vinte de cada vez, duas a caminho no máximo, pelo livro nas duas pontas.
//   c1  a obra longe recebe pela carroça: as cargas pelo livro (f: → c: → o:), nada some nem nasce, duas a caminho no máximo,
//       vinte por carga; e contra o mesmo mundo sem carroça (o controle da própria prova), pelo menos o dobro em dois anos
//   c2  a obra perto dos armazéns não tem carroça; o povo sem a roda não tem carroça; sem a vez, nenhuma carroça nova
//   c3  a obra fica pronta com a carroça a caminho: a carga volta ao armazém do povo, pelo livro
//   c4  o deus derruba a obra com a carroça a caminho: a carga volta; o que estava no canteiro volta (siteBack)
//   c5  o save com a carroça a caminho: a mesma carroça, a mesma carga, e o mesmo futuro duas vezes
//   c6  a cidade tomada com a carroça a caminho: a carga volta ao povo que a mandou, nunca ao armazém do vencedor
//   c7  o fogo leva a madeira da obra com a carroça a caminho (D-219): a obra fica, a carroça segue e entrega; o cerco a
//       derruba: a carga volta, e nenhuma carroça vai à ruína
//   c8  a pedra que a carroça deixa no armazém (L-783): com o chão só, nenhuma carroça; leva o que passa dele; a madeira não
//       tem chão; duas a caminho no máximo; a estrada do povo que morre não leva a carroça da obra
//   c9  a obra que já não espera o que a carroça traz: a carga volta para casa na carroça, pelo livro
//   c10 o que a carroça traz conta para quem iria buscar (Vg.coming = as mãos + as carroças): ninguém busca no armazém
//   c11 as últimas pedras são da obra grande (L-786, D-233; o palácio de Tenochtitlan da semente 41, seis anos em 98% e em
//       100% à espera de 5 e depois de 1 de pedra): o que a obra com a vez ainda espera, quando é uma carga de carroça ou
//       menos, fica para ela no armazém do povo — as portas (V.lastStone, V.stoneFor), a carroça leva a última carga abaixo
//       do chão, e, vivido, o povo sem a roda: as casas em obra junto do armazém não tocam nas pedras dela e os construtores
//       dela as levam nas mãos; o mesmo sem a regra (o controle da própria prova); o save; a obra que perde a vez
//   node qa/canteiro.js [mundo]        (ONLY=c1,c3 só esses; VERB=1 conta mais)
'use strict';
process.chdir(__dirname);
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['qa/degraus-inv.js', 'qa/canteiro-inv.js', 'qa/aterro-inv.js'] });
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null; const VERB = !!process.env.VERB; const MUNDO = process.argv[2] || process.env.MUNDO || 'mega';
const hr = process.hrtime.bigint(); const ms = () => Number((process.hrtime.bigint() - hr) / 1000000n);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | canteiro ${name} | ${info}`); if (!c) fails.push(name); return c; };
const sim = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
function run(id, fn) { if (ONLY && !ONLY.includes(id)) return; try { fn(); } catch (e) { ok(id, false, 'exceção: ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join(' / ') : e)); } }
let S, V, Es, D, Ci, W, N;
const pega = () => { S = G.S; V = G.Village; Es = G.Escala; D = G.Depot; Ci = G.City; W = G.W; N = G.N; return S; };
const lado = b => (b ? `${b.type}#${b.id} ${b.w}×${b.h} em ${b.x},${b.y}` : 'nada');
function checa() {
  const out = []; for (const q of QA.check()) if (q.sev <= 2) out.push(`S${q.sev} ${q.sys}: ${q.msg.slice(0, 150)}`);
  const e = M.erros(); const errs = Object.keys(e.mod).length + e.console.length;
  return { ok: !out.length && !errs, txt: out.length ? out.slice(0, 3).join(' · ') : errs ? 'erros: ' + JSON.stringify(e).slice(0, 240) : 'verificador limpo' };
}
const aoArmazem = (set, x, y) => { let d = 1e9; for (const o of V.dropoffs(set.id)) { const [ox, oy] = V.frontTile(o); d = Math.min(d, G.dist(x, y, ox, oy)); } return d; };
const alimenta = set => { const f = G.Fac.get(set.fac); const want = Math.min(V.cap(f.id) * 0.97, Math.max(G.Fac.pop(f.id) * 14, 80)); if ((f.stock.food || 0) < want) D.make('f:' + f.id, 'food', want - (f.stock.food || 0), { code: 'teste' }); };
// (the people's store with what the work is made of, by the god's hand: the proofs of the road are not the proofs of the quarry)
const abastece = (set, b) => sim(() => { const f = G.Fac.get(set.fac); const o = S.buildings.get(b.id); if (!o || o.built || !o.need) return; for (const m in o.need) { const quer = Math.min(V.cap(f.id) * 0.9, Math.max(60, o.need[m] || 0)); if ((f.stock[m] || 0) < quer) D.make('f:' + f.id, m, quer - (f.stock[m] || 0), { code: 'teste' }); } });
function comVez(set) {
  alimenta(set);
  for (let k = 0; k < 30 && V.housingInfo(set.id).homeless > 0; k++) { if (!sim(() => V.handFound(set, 'hut', 1, { built: true, R: 40 }))) break; M.viver(3); }
  M.viver(4); return set.vez === 1;
}
// (the biggest capital of the world, its people knowing the wheel — by the game's own door of the arts where it does not yet —,
// and a great work of it founded by the god's hand the asked distance from its stores: the free dry ground the town walks to
// whose middle lies nearest that distance)
function arma(dist, o) {
  M.pronto(MUNDO); pega(); o = o || {};
  const caps = [...new Set(G.Fac.all().filter(f => f.alive).map(f => G.Fac.capitalOf(f.id)).filter(Boolean))].sort((a, c) => V.pop(c.id) - V.pop(a.id) || a.id - c.id);
  // (o.irma: the biggest capital whose people has another town of fifteen or more — a sister with builders of its own)
  const irmaDe = c => [...S.settlements.values()].filter(s => s.fac === c.fac && s !== c && V.pop(s.id) >= 15).sort((a, q) => V.pop(q.id) - V.pop(a.id) || a.id - q.id)[0] || null;
  const set = o.irma ? caps.find(c => irmaDe(c)) : caps[0]; if (!set) return null;
  const f = G.Fac.get(set.fac); const n = 6;
  if (o.semRoda) { delete f.tech.known.roda; const ap = G.Civ.learn; G.Civ.learn = function (q, t) { return t === 'roda' && q && q.id === f.id ? false : ap.apply(this, arguments); }; } else if (!G.Civ.has(f.id, 'roda')) sim(() => G.Civ.learn(f, 'roda'));
  // (the town's own great works going up taken off by the god's hand first — an enlargement given up, V.ungrow; a work begun
  // taken from its lot, the site's goods home —: the planner marks the first that waits for stone, in the order they were
  // founded (V.greatWork, set.gw), and the carts go to the marked one. The megalópole of the generation 20 had Hedeby's theatre
  // of 8 going up with none of its 272 of stone: the 200 the carts took out of the store in the c1 went to it, and the case's
  // own work, founded after it, never had a cart — «0 entraram no canteiro», «nenhuma carroça saiu», T-1057)
  sim(() => { for (let gw, k = 0; k < 9 && (gw = V.greatWork(set, { siteTypes: { teatro: 1 } })); k++) { if (gw.amp) V.ungrow(gw); else { V.siteBack(gw, 'obra-derrubada'); V.removeBuilding(gw); } } });
  let best = null;
  for (let y = 3; y + n <= N - 3; y++) for (let x = 3; x + n <= N - 3; x++) {
    const d = aoArmazem(set, x + n / 2, y + n / 2); const e = Math.abs(d - dist); if (e > (o.tol || 4) || (best && e >= best[2])) continue; let livre = true;
    for (let ty = y - 1; ty <= y + n && livre; ty++) for (let tx = x - 1; tx <= x + n; tx++) { const i = ty * N + tx; if (S.type[i] < G.T.SAND || S.type[i] === G.T.RIVER || S.occ[i] || S.wall[i] || S.road[i] >= 3 || S.cliff[i]) { livre = false; break; } }
    if (livre && W.slope(x, y, n, n) <= V.PODIUM && W.reachesTownXY(x + n / 2, y - 0.5, set)) best = [x, y, e];
  }
  if (!best) { if (VERB) console.log(`  (arma: nenhum chão livre a ${dist} ± 4 casas de um armazém de ${set.name})`); return null; }
  // (the rocks of the lot taken away by the god's hand: a rock of the lot is broken into the work — D-121 —, and would feed it)
  sim(() => { for (let ty = best[1] - 1; ty <= best[1] + n; ty++) for (let tx = best[0] - 1; tx <= best[0] + n; tx++) { const rk = S.rocks.get(S.objAt[ty * N + tx]); if (rk) G.Nature.removeRock(rk); } });
  const b = sim(() => V.handFound(set, 'teatro', 6, { x: best[0] + 3, y: best[1] + 3, R: 0 })); if (!b) { if (VERB) console.log(`  (arma: a mão do deus não fundou em ${best})`); return null; }
  const [fx, fy] = V.frontTile(b); const vez = comVez(set); abastece(set, b);
  return { set, f, b, vez, longe: Math.round(aoArmazem(set, fx, fy)), irma: o.irma ? irmaDe(set) : null };
}
// (the ledger's lines of the road and of the work, heard as they are written)
function escuta(b) { const L = []; const fn = e => { if (/^c:/.test(String(e[3])) || /^c:/.test(String(e[4])) || e[4] === 'o:' + b.id || e[3] === 'o:' + b.id) L.push(e.slice()); }; D.onMove.push(fn); return { L, fim: () => { const k = D.onMove.indexOf(fn); if (k >= 0) D.onMove.splice(k, 1); } }; }
const soma = (L, f) => L.filter(f).reduce((a, e) => a + e[6], 0);
const daObra = b => (S.carts || []).filter(c => c.obra === b.id);
const naEstrada = b => daObra(b).reduce((a, c) => { const q = c.back ? c.ret : c.goods; return a + (q ? q.n || 0 : 0); }, 0);
// (seasons of fifty seconds by the jump, the town fed and the store kept full; what is watched at each second of them)
function estacoes(set, b, n, olha) {
  G.Skip.on = true; G.FX.off = true; W.pathGreed = 1.3;
  try { for (let k = 0; k < n; k++) { alimenta(set); abastece(set, b); for (let q = 0; q < 50; q++) { G.Main.skipStep(1); if (olha) olha(); } } } finally { G.Skip.on = false; G.FX.off = false; W.pathGreed = W.PATH_EXACT; }
}
// (lived until a cart of the work is on its way with a load, a few tiles out: → the cart, or null)
function ateCarroca(set, b) { for (let k = 0; k < 400; k++) { if (k % 20 === 0) { alimenta(set); abastece(set, b); } M.viver(0.5); const c = daObra(b).find(q => !q.back && q.goods && q.goods.n > 0 && q.k >= 3); if (c) return c; } return null; }

// ------------------------------ c1: a obra longe recebe pela carroça ------------------------------
run('c1', () => {
  // (the control first: the same world, the same work, no cart — the rule's distance out of reach)
  M.pronto(MUNDO); pega(); const far0 = Ci.WORK_FAR; Ci.WORK_FAR = 1e9; let a = null, sem = 0, semCarro = 0;
  try {
    a = arma(35); if (!ok('c1a a obra longe', !!a && a.vez && a.longe >= 28, a ? `${MUNDO}, ${a.set.name} (${V.pop(a.set.id)} pessoas), a roda sabida: ${lado(a.b)} a ${a.longe} casas de um armazém, a vez ${a.set.vez}; a conta ${JSON.stringify(V.bill(a.b))}` : 'sem chão a 35 casas de um armazém')) return;
    const E = escuta(a.b); estacoes(a.set, a.b, 8, () => { semCarro = Math.max(semCarro, daObra(a.b).length); }); E.fim(); sem = soma(E.L, e => e[4] === 'o:' + a.b.id);
  } finally { Ci.WORK_FAR = far0; }
  a = arma(35); const { set, f, b } = a; const E = escuta(b); const estrada0 = naEstrada(b); let maxCam = 0, maxCarga = 0, viu = 0;
  estacoes(set, b, 8, () => { const cs = daObra(b); if (cs.length) viu++; maxCam = Math.max(maxCam, cs.filter(c => !c.back).length); for (const c of cs) { const q = c.back ? c.ret : c.goods; if (q) maxCarga = Math.max(maxCarga, q.n || 0); } });
  E.fim(); const o = S.buildings.get(b.id);
  const saiu = soma(E.L, e => e[3] === 'f:' + f.id && /^c:/.test(String(e[4])) && e[8] === 'carroca-obra'), chegou = soma(E.L, e => /^c:/.test(String(e[3])) && e[4] === 'o:' + b.id && e[8] === 'obra-carroca'), voltou = soma(E.L, e => /^c:/.test(String(e[3])) && e[4] === 'f:' + f.id && e[8] === 'carroca-volta');
  const com = soma(E.L, e => e[4] === 'o:' + b.id), maos = soma(E.L, e => /^v:/.test(String(e[3])) && e[4] === 'o:' + b.id);
  ok('c1b a carroça leva, pelo livro', saiu > 0 && chegou > 0 && viu > 0, `em dois anos: ${saiu.toFixed(0)} saíram do armazém do povo na carroça («carroca-obra»), ${chegou.toFixed(0)} entraram no canteiro da obra («obra-carroca»), ${voltou.toFixed(0)} voltaram ao armazém; das mãos dos construtores, ${maos.toFixed(0)}; a obra ${o ? (o.built ? 'pronta' : Math.round((o.progress || 0) * 100) + '%') : 'SUMIU'}`);
  ok('c1c nada some nem nasce', Math.abs(estrada0 + saiu - chegou - voltou - naEstrada(b)) < 1e-3, `o que já ia na estrada (${estrada0.toFixed(2)}) + o que saiu (${saiu.toFixed(2)}) = o que chegou (${chegou.toFixed(2)}) + o que voltou (${voltou.toFixed(2)}) + o que está na estrada (${naEstrada(b).toFixed(2)})`);
  ok('c1d duas a caminho no máximo, vinte por carga', maxCam >= 1 && maxCam <= Ci.WORK_CARTS && maxCarga <= Ci.WORK_LOAD + 1e-6, `a caminho da obra, no máximo ${maxCam} de uma vez (a regra: ${Ci.WORK_CARTS}); a maior carga ${maxCarga} (a regra: ${Ci.WORK_LOAD})`);
  ok('c1e contra o mesmo mundo sem carroça', semCarro === 0 && com >= sem * 2 && com >= sem + 40, `a ${a.longe} casas do armazém, em dois anos, com o armazém cheio: sem carroça entraram ${sem.toFixed(0)} na obra; com ela, ${com.toFixed(0)}`);
  // (what the carts have on the road counts as coming for who would fetch it — Ci.carted, the builders' own count: nobody walks to
  // the store for it, and no cart reaches the work with what it no longer waits for)
  ok('c1g ninguém busca o que a carroça traz', voltou === 0 && chegou > 0, `das ${chegou.toFixed(0)} que as carroças levaram, ${voltou.toFixed(0)} voltaram por a obra já não esperar`);
  const c = checa(); ok('c1f verificador', c.ok, c.txt);
});

// ------------------------------ c2: quem não tem carroça ------------------------------
run('c2', () => {
  // (the free ground nearest the stores — where the town has none within the rule's distance, the rule's distance is the proof's
  // to move just past it, and back: what is proved is that the work within it gets no cart, and the same work past it does)
  M.pronto(MUNDO); pega(); const far0 = Ci.WORK_FAR; let a = null, viu = 0, com = 0, regra = far0;
  try {
    Ci.WORK_FAR = 1e9; a = arma(0, { tol: 99 }); if (!ok('c2a a obra perto', !!a && a.vez, a ? `${lado(a.b)} a ${a.longe} casas de um armazém de ${a.set.name}, o chão livre mais perto` : 'sem chão')) return;
    regra = Math.max(far0, a.longe + 1); Ci.WORK_FAR = regra; estacoes(a.set, a.b, 4, () => { viu = Math.max(viu, daObra(a.b).length); });
    Ci.WORK_FAR = a.longe - 2; estacoes(a.set, a.b, 2, () => { com = Math.max(com, daObra(a.b).length); });
  } finally { Ci.WORK_FAR = far0; }
  ok('c2b perto, nenhuma carroça', viu === 0 && com > 0, `a ${a.longe} casas do armazém, com a regra em ${regra}: num ano, carroças da obra: ${viu}; a mesma obra com a regra em ${a.longe - 2}: ${com}`);
  a = arma(35, { semRoda: true }); if (!ok('c2c o povo sem a roda', !!a && a.vez && !G.Civ.has(a.f.id, 'roda'), a ? `${a.f.name} sem a roda (a mão da prova na porta das artes): ${lado(a.b)} a ${a.longe} casas` : 'sem chão')) return;
  viu = 0; const E = escuta(a.b); estacoes(a.set, a.b, 4, () => { viu = Math.max(viu, daObra(a.b).length); }); E.fim();
  ok('c2d sem a roda, nenhuma carroça', viu === 0 && soma(E.L, e => e[8] === 'carroca-obra' && e[3] === 'f:' + a.f.id) === 0, `num ano, carroças da obra: ${viu}; cargas do armazém do povo postas numa carroça de obra: ${soma(E.L, e => e[8] === 'carroca-obra' && e[3] === 'f:' + a.f.id)}; das mãos dos construtores entraram ${soma(E.L, e => e[4] === 'o:' + a.b.id).toFixed(0)}`);
  // (and with no turn — a grown one with no home, at the planner's look —, no new cart)
  a = arma(35); const { set, b } = a; const c0 = ateCarroca(set, b);
  const sem = [...S.villagers.values()].filter(v => v.set === set.id && !v.captive && v.age >= 20 && v.home && !(S.avatar && S.avatar.id === v.id)).sort((x, y) => x.id - y.id)[0];
  sim(() => { const h = S.buildings.get(sem.home); sem.home = 0; if (h) h.res = Math.max(0, (h.res || 1) - 1); V.vez(set); });
  const antes = new Set(daObra(b).map(c => c.id)); set.cartT = 0; const nova = sim(() => Ci.workCart(set));
  ok('c2e sem a vez, nenhuma carroça nova', !!c0 && set.vez === 0 && !nova && daObra(b).every(c => antes.has(c.id)), `${sem.name} sem casa: a vez ${set.vez}; a carroça nova: ${nova ? '#' + nova.id : 'nenhuma'} (${antes.size} já a caminho seguem)`);
  const c = checa(); ok('c2f verificador', c.ok, c.txt);
});

// ------------------------------ c3: a obra fica pronta com a carroça a caminho ------------------------------
run('c3', () => {
  const a = arma(35); if (!ok('c3a a obra longe', !!a && a.vez, a ? `${lado(a.b)} a ${a.longe} casas` : 'sem chão')) return;
  const { set, f, b } = a; const c = ateCarroca(set, b); if (!ok('c3b uma carroça a caminho', !!c, c ? `a carroça #${c.id} com ${c.goods.n} de ${c.goods.k}, no ponto ${c.k} de ${c.pts.length} do caminho; a caminho da obra pelas carroças: ${Ci.carted(b, c.goods.k)}` : 'nenhuma carroça saiu em 200 s')) return;
  const k = c.goods.k, n = c.goods.n, antes = f.stock[k] || 0; const E = escuta(b);
  sim(() => V.completeBuilding(b)); M.viver(2); E.fim();
  const volta = soma(E.L, e => e[3] === 'c:' + c.id && e[4] === 'f:' + f.id && e[8] === 'carroca-volta');
  ok('c3c a carga volta ao povo, pelo livro', b.built && !daObra(b).length && Math.abs(volta - n) < 1e-6 && (f.stock[k] || 0) >= antes + n - 1e-6, `a obra pronta pela mão da prova: a carroça #${c.id} saiu da estrada, ${volta} de ${k} de volta ao armazém («carroca-volta»): ${antes.toFixed(0)} → ${(f.stock[k] || 0).toFixed(0)}`);
  const q = checa(); ok('c3d verificador', q.ok, q.txt);
});

// ------------------------------ c4: o deus derruba a obra ------------------------------
run('c4', () => {
  const a = arma(35); if (!ok('c4a a obra longe', !!a && a.vez, a ? `${lado(a.b)} a ${a.longe} casas` : 'sem chão')) return;
  const { set, f, b } = a; const c = ateCarroca(set, b); if (!ok('c4b uma carroça a caminho', !!c, c ? `a carroça #${c.id} com ${c.goods.n} de ${c.goods.k}` : 'nenhuma carroça saiu em 200 s')) return;
  const k = c.goods.k, n = c.goods.n; const noCanteiro = Object.values(V.delivered(b)).reduce((x, y) => x + y, 0); const E = escuta(b);
  sim(() => { V.siteBack(b, 'obra-derrubada'); V.removeBuilding(b); }); M.viver(2); E.fim();
  const volta = soma(E.L, e => e[3] === 'c:' + c.id && e[4] === 'f:' + f.id && e[8] === 'carroca-volta'), doCanteiro = soma(E.L, e => e[3] === 'o:' + b.id);
  ok('c4c a carga e o canteiro voltam', !S.buildings.get(b.id) && !daObra(b).length && Math.abs(volta - n) < 1e-6 && Math.abs(doCanteiro - noCanteiro) < 1e-3, `a obra derrubada: ${volta} de ${k} da carroça de volta ao armazém; do canteiro, ${doCanteiro.toFixed(0)} de ${noCanteiro.toFixed(0)} que lá estavam, pelo livro`);
  const q = checa(); ok('c4d verificador', q.ok, q.txt);
});

// ------------------------------ c7: o fogo leva a obra ------------------------------
run('c7', () => {
  const a = arma(35); if (!ok('c7a a obra longe', !!a && a.vez, a ? `${lado(a.b)} a ${a.longe} casas` : 'sem chão')) return;
  const { set, f, b } = a; const c = ateCarroca(set, b); if (!ok('c7b uma carroça a caminho', !!c, c ? `a carroça #${c.id} com ${c.goods.n} de ${c.goods.k}` : 'nenhuma carroça saiu em 200 s')) return;
  const k = c.goods.k, n = c.goods.n; let E = escuta(b); const tinha = Object.assign({}, V.delivered(b));
  // (the fire has the timber of a great work going up, and the work stays — D-219: its cart goes on, and what it brings is laid)
  sim(() => V.damageBuilding(b, 99999, 'fire')); M.viver(2); const o = S.buildings.get(b.id); const noFogo = soma(E.L, e => e[3] === 'o:' + b.id && e[5] === 'wood' && e[8] === 'fogo');
  const volta = soma(E.L, e => e[3] === 'c:' + c.id && e[8] === 'carroca-volta');
  ok('c7c o fogo leva a madeira, a obra fica e a carroça segue', !!o && o.type === b.type && !o.built && !(V.delivered(o).wood > 0) && Math.abs(noFogo - (tinha.wood || 0)) < 1e-6 && daObra(b).some(q => q.id === c.id) && volta === 0,
    `o fogo na obra em curso: ${o ? (o.type === 'ruin' ? 'RUÍNA' : 'de pé, em obra') : 'TIRADA DO MAPA'}; a madeira do canteiro (${tinha.wood || 0}) saiu pelo livro («fogo»: ${noFogo}); a carroça #${c.id} ${daObra(b).some(q => q.id === c.id) ? 'segue na estrada' : 'SAIU da estrada'}, ${volta} de volta ao armazém`);
  for (let y = 0; y < 2; y++) { alimenta(set); abastece(set, b); M.viver(50); }
  E.fim(); const chegou = soma(E.L, e => e[4] === 'o:' + b.id && e[8] === 'obra-carroca');
  ok('c7d as carroças continuam a servir a obra queimada', chegou >= n - 1e-6, `meio ano depois: ${chegou} chegou ao canteiro pelas carroças (a carga que ia a caminho: ${n} de ${k})`);
  const q = checa(); ok('c7e verificador', q.ok, q.txt);
  // (what does take it to the ground — the siege's stones —, with a cart on the way: the load goes home, no cart to the ruin)
  const c2 = daObra(b).find(w => !w.back && w.goods) || ateCarroca(set, b);
  if (!ok('c7f outra carroça a caminho', !!c2 && !!c2.goods, c2 && c2.goods ? `a carroça #${c2.id} com ${c2.goods.n} de ${c2.goods.k}` : 'nenhuma carroça saiu em 200 s')) return;
  const n2 = c2.goods.n, k2 = c2.goods.k; E = escuta(b);
  sim(() => V.damageBuilding(S.buildings.get(b.id), 99999, 'siege')); M.viver(2); const o2 = S.buildings.get(b.id);
  const volta2 = soma(E.L, e => e[3] === 'c:' + c2.id && e[4] === 'f:' + f.id && e[8] === 'carroca-volta');
  for (let y = 0; y < 2; y++) { alimenta(set); M.viver(50); } E.fim();
  ok('c7g o cerco derruba: a carga volta, nenhuma carroça para a ruína', (!o2 || o2.type === 'ruin') && Math.abs(volta2 - n2) < 1e-6 && !daObra(b).length, `a obra derrubada pelo cerco (${o2 ? o2.type : 'tirada do mapa'}): ${volta2} de ${k2} de volta ao armazém, pelo livro (a carga: ${n2}); meio ano depois, carroças para a ruína: ${daObra(b).length}`);
  const q2 = checa(); ok('c7h verificador', q2.ok, q2.txt);
});

// ------------------------------ c5: o save com a carroça a caminho ------------------------------
run('c5', () => {
  const a = arma(35); if (!ok('c5a a obra longe', !!a && a.vez, a ? `${lado(a.b)} a ${a.longe} casas` : 'sem chão')) return;
  const { set, b } = a; const c = ateCarroca(set, b); if (!ok('c5b uma carroça a caminho', !!c, c ? `a carroça #${c.id} com ${c.goods.n} de ${c.goods.k}` : 'nenhuma carroça saiu em 200 s')) return;
  const foto = () => JSON.stringify(daObra(S.buildings.get(b.id) || b).map(q => [q.id, q.k, +q.x.toFixed(2), +q.y.toFixed(2), q.back, q.goods, q.ret]));
  const f0 = foto(), vem0 = Ci.carted(b, c.goods.k), need0 = JSON.stringify(b.need); const save = G.Save.serialize();
  const vive = () => { G.Save.apply(JSON.parse(save)); pega(); M.reseed(99); const o = S.buildings.get(b.id); const antes = [foto(), Ci.carted(o, c.goods.k), JSON.stringify(o.need)]; const E = escuta(o); for (let k = 0; k < 12; k++) { alimenta(S.settlements.get(set.id)); M.viver(5); } E.fim(); return { antes, chegou: soma(E.L, e => e[4] === 'o:' + o.id && e[8] === 'obra-carroca'), fim: [foto(), JSON.stringify(S.buildings.get(b.id).need), QA.canon ? JSON.stringify(QA.canon()).length : 0] }; };
  const v1 = vive(), v2 = vive();
  ok('c5c a mesma carroça depois do save', v1.antes[0] === f0 && v1.antes[1] === vem0 && v1.antes[2] === need0, v1.antes[0] === f0 ? `a carroça #${c.id} no mesmo ponto, com a mesma carga; a caminho da obra pelas carroças ${vem0} → ${v1.antes[1]}; o que a obra espera ${need0} → ${v1.antes[2]}` : `MUDOU: ${v1.antes[0].slice(0, 160)} contra ${f0.slice(0, 160)}`);
  ok('c5d chega, e o mesmo futuro duas vezes', v1.chegou > 0 && JSON.stringify(v1.fim) === JSON.stringify(v2.fim), `um minuto depois do save: ${v1.chegou} entraram no canteiro pela carroça; as duas vidas do mesmo save ${JSON.stringify(v1.fim) === JSON.stringify(v2.fim) ? 'iguais' : 'DIFERENTES'}`);
  const q = checa(); ok('c5e verificador', q.ok, q.txt);
});

// ------------------------------ c6: a cidade tomada com a carroça a caminho ------------------------------
run('c6', () => {
  const a = arma(35); if (!ok('c6a a obra longe', !!a && a.vez, a ? `${lado(a.b)} a ${a.longe} casas` : 'sem chão')) return;
  const { set, f, b } = a; const c = ateCarroca(set, b); if (!ok('c6b uma carroça a caminho', !!c, c ? `a carroça #${c.id} com ${c.goods.n} de ${c.goods.k}` : 'nenhuma carroça saiu em 200 s')) return;
  const outro = G.Fac.all().filter(q => q.alive && q.id !== f.id).sort((x, y) => G.Fac.pop(y.id) - G.Fac.pop(x.id) || x.id - y.id)[0];
  const k = c.goods.k, n = c.goods.n, meu = f.stock[k] || 0, dele = outro.stock[k] || 0; const E = escuta(b);
  sim(() => G.War.conquer(set, { fac: outro.id, loot: { food: 0, wood: 0, stone: 0 }, members: [], captives: [], campaign: null })); M.viver(2); E.fim();
  const volta = soma(E.L, e => e[3] === 'c:' + c.id && e[4] === 'f:' + f.id), aoVencedor = soma(E.L, e => e[3] === 'c:' + c.id && e[4] === 'f:' + outro.id), perdida = soma(E.L, e => e[3] === 'c:' + c.id && e[8] === 'carroca-perdida');
  ok('c6c a carga volta a quem a mandou', set.fac === outro.id && !daObra(b).length && aoVencedor === 0 && Math.abs(volta + perdida - n) < 1e-6, `${set.name} tomada por ${outro.name}: a carroça #${c.id} saiu da estrada; ${volta} de ${k} ao armazém de ${f.name}${perdida ? `, ${perdida} perdidos com o povo (sem armazém)` : ''}; ao do vencedor, ${aoVencedor}`);
  for (let y = 0; y < 4; y++) { alimenta(set); M.viver(50); }
  const novas = daObra(b).filter(q => q.fac !== set.fac);
  ok('c6d um ano depois', !novas.length, `carroças do povo de antes para a obra que perdeu: ${novas.length}; da cidade agora: ${daObra(b).length}`);
  const q = checa(); ok('c6e verificador', q.ok, q.txt);
});

// ------------------------------ c8: a pedra que a carroça deixa no armazém (L-783) ------------------------------
// (the door itself, asked by the proof with the store counted by its hand: the people's store is one for all its towns, and the
// cart leaves in it a well's and a house's worth of stone — WORK_FLOOR —; the timber has no floor. And the work's cart has no
// road of its own: a road of the people that dies takes its own carts off, never the work's)
run('c8', () => {
  M.pronto(MUNDO); pega(); const far0 = Ci.WORK_FAR; let a = null;
  try { Ci.WORK_FAR = 1e9; a = arma(35); } finally { Ci.WORK_FAR = far0; }
  if (!ok('c8a a obra longe, nenhuma carroça ainda', !!a && a.vez && !daObra(a.b).length && (a.b.need.stone || 0) >= 30, a ? `${lado(a.b)} a ${a.longe} casas, a vez ${a.set.vez}; espera ${JSON.stringify(a.b.need)}` : 'sem chão')) return;
  const { set, f, b } = a; const FL = Ci.WORK_FLOOR;
  // (the store with stone alone, counted: nothing else the work waits for in it)
  const so = n => sim(() => { for (const m in b.need) if ((f.stock[m] || 0) > 0) D.use('f:' + f.id, m, f.stock[m], { code: 'teste', mine: true }); if (n > 0) D.make('f:' + f.id, 'stone', n, { code: 'teste' }); });
  const pede = () => sim(() => Ci.workCart(set));
  so(FL); const c0 = pede(); const fica0 = f.stock.stone || 0;
  ok('c8b só o chão do armazém: nenhuma carroça', !c0 && !daObra(b).length && Math.abs(fica0 - FL) < 1e-6, `${FL} de pedra no armazém do povo (a regra: a carroça deixa ${FL}): a carroça ${c0 ? '#' + c0.id + ' SAIU com ' + JSON.stringify(c0.goods) : 'não saiu'}; no armazém ${fica0}`);
  so(FL + 7); const c1 = pede(); const fica1 = f.stock.stone || 0;
  ok('c8c leva o que passa do chão', !!c1 && !!c1.goods && c1.goods.k === 'stone' && Math.abs(c1.goods.n - 7) < 1e-6 && Math.abs(fica1 - FL) < 1e-6, `${FL + 7} de pedra no armazém: a carroça ${c1 ? '#' + c1.id + ' leva ' + JSON.stringify(c1.goods) : 'NÃO saiu'}; ficam ${fica1}`);
  // (the timber: no floor — what the work waits for of it goes whole, twenty at a time)
  const mad = (b.need.wood || 0) >= 5; let c2 = null, fica2 = -1;
  if (mad) { sim(() => { D.make('f:' + f.id, 'wood', 5, { code: 'teste' }); }); c2 = pede(); fica2 = f.stock.wood || 0; }
  ok('c8d a madeira não tem chão', !mad || (!!c2 && !!c2.goods && c2.goods.k === 'wood' && Math.abs(c2.goods.n - 5) < 1e-6 && fica2 < 1e-6), mad ? `5 de madeira no armazém (e ${FL} de pedra): a carroça ${c2 ? '#' + c2.id + ' leva ' + JSON.stringify(c2.goods) : 'NÃO saiu'}; ficam ${fica2} de madeira` : 'a obra não espera madeira: sem caso');
  // (two on the way at most: the store full again, the door asked until it gives none — and the store back to its floor)
  so(FL + 80); let mais = 0; for (let k = 0; k < 4; k++) if (pede()) mais++; const indo = daObra(b).filter(q => !q.back).length; so(FL);
  ok('c8g duas a caminho no máximo', indo === Ci.WORK_CARTS && mais === Ci.WORK_CARTS - (mad ? 2 : 1), `o armazém cheio de novo e a porta pedida quatro vezes: ${mais} carroça(s) a mais saíram; a caminho da obra ${indo} (a regra: ${Ci.WORK_CARTS})`);
  // (a road of the people dies — by the proof's hand on the road's own mark, as city.js sets it when a town of it is gone)
  const r = (S.routes || []).find(q => !q.dead); const antes = daObra(b).map(q => q.id).join(',');
  if (r) { const daRota = S.carts.filter(q => q.route === r.id).length; r.dead = true; for (let k = 0; k < 30 && S.routes.includes(r); k++) M.viver(0.5);
    ok('c8e a estrada que morre não leva a carroça da obra', daObra(b).map(q => q.id).join(',') === antes && antes.length > 0 && !S.routes.includes(r) && !S.carts.some(q => q.route === r.id), `a estrada #${r.id} morta (tinha ${daRota} carroças dela): as da obra antes [${antes}], depois [${daObra(b).map(q => q.id).join(',')}]; carroças da estrada morta ainda no mundo: ${S.carts.filter(q => q.route === r.id).length}`);
  } else console.log('  (c8e: o mundo não tem estrada nenhuma; sem caso)');
  const q = checa(); ok('c8f verificador', q.ok, q.txt);
});

// ------------------------------ c9: a obra já não espera o que a carroça traz ------------------------------
// (the work given, by the god's hand, all it waited for of what a cart has on the road: the cart goes, the site takes nothing
// of it, and the load comes home on the cart, by the ledger)
run('c9', () => {
  const a = arma(35); if (!ok('c9a a obra longe', !!a && a.vez, a ? `${lado(a.b)} a ${a.longe} casas` : 'sem chão')) return;
  const { set, f, b } = a; const c = ateCarroca(set, b); if (!ok('c9b uma carroça a caminho', !!c, c ? `a carroça #${c.id} com ${c.goods.n} de ${c.goods.k}` : 'nenhuma carroça saiu em 200 s')) return;
  const k = c.goods.k, n = c.goods.n; const E = escuta(b);
  for (let q = 0; q < 4; q++) sim(() => { const m = b.need[k] || 0; if (m > 0) { D.make('f:' + f.id, k, m, { code: 'teste' }); D.move('f:' + f.id, 'o:' + b.id, k, m, { code: 'teste' }); } });
  const espera = b.need[k] || 0; let seg = 0;
  for (; seg < 600 && S.carts.some(q => q.id === c.id); seg++) { if (seg % 40 === 0) alimenta(set); M.viver(0.5); }
  E.fim(); const o = S.buildings.get(b.id);
  const chegou = soma(E.L, e => e[3] === 'c:' + c.id && e[4] === 'o:' + b.id), volta = soma(E.L, e => e[3] === 'c:' + c.id && e[4] === 'f:' + f.id && e[8] === 'carroca-volta');
  ok('c9c a carga que a obra já não espera volta na carroça', espera === 0 && !!o && !S.carts.some(q => q.id === c.id) && chegou === 0 && Math.abs(volta - n) < 1e-6, `dado à obra todo o ${k} que esperava (espera agora ${espera}): a carroça #${c.id} foi e voltou em ${(seg / 2).toFixed(0)} s; entraram no canteiro por ela ${chegou}; de volta ao armazém do povo («carroca-volta») ${volta} de ${n}`);
  const q = checa(); ok('c9d verificador', q.ok, q.txt);
});

// ------------------------------ c10: o que a carroça traz conta para quem iria buscar ------------------------------
// (the builders' own count of what is coming to a work — Vg.coming — is their hands' loads and the carts': with the site given
// all it waits for but what is on the road, nobody takes a load of it from the store)
run('c10', () => {
  const a = arma(35); if (!ok('c10a a obra longe', !!a && a.vez, a ? `${lado(a.b)} a ${a.longe} casas` : 'sem chão')) return;
  const { set, f, b } = a; const c = ateCarroca(set, b); if (!ok('c10b uma carroça a caminho', !!c, c ? `a carroça #${c.id} com ${c.goods.n} de ${c.goods.k}` : 'nenhuma carroça saiu em 200 s')) return;
  const k = c.goods.k; const vem = G.Vg.coming(b, k), maos = b.incoming[k] || 0, car = Ci.carted(b, k);
  ok('c10c a conta de quem iria buscar', car >= c.goods.n - 1e-9 && Math.abs(vem - maos - car) < 1e-9, `de ${k}, a caminho da obra: ${maos} nas mãos dos construtores (b.incoming) + ${car} nas carroças (Ci.carted) = ${vem} para quem iria buscar (Vg.coming)`);
  // (the site given what nobody is bringing; then, until the carts arrive, no new load of the builders for this work)
  const resto = m => (b.need[m] || 0) - G.Vg.coming(b, m);
  for (let q = 0; q < 4; q++) sim(() => { for (const m in b.need) { const n = (b.need[m] || 0) - (b.incoming[m] || 0) - Ci.carted(b, m); if (n > 1e-9) { D.make('f:' + f.id, m, n, { code: 'teste' }); D.move('f:' + f.id, 'o:' + b.id, m, n, { code: 'teste' }); } } });
  const so = Object.keys(b.need).every(m => resto(m) <= 1e-6); abastece(set, b);
  // (a builder whose task is cut on the way — the night, a call, the scene — is counted out and may still bring his load, and
  // another takes one in his place: the builders' own count has a hand's load of slack, carts or no carts — four: the load of
  // the one counted out comes in, and the one taken in his place is still counted. The fault this case is for is the cart's
  // load fetched again: what is coming to the work, hands and carts, more than a load of the hands past what it waits for. In
  // the megalópole of the generation 20 the slack came whole — one load of 4 of wood taken from the store, the excess 4,0 —,
  // and the case asked for less than a hand's load, «o maior excesso: 4.0», T-1061)
  const MAO = 4; const inc = Object.assign({}, b.incoming); let novas = 0, seg = 0, demais = 0; const quais = {};
  for (; seg < 120 && daObra(b).some(q => !q.back); seg++) {
    M.viver(0.5);
    for (const m in b.incoming) { const x = b.incoming[m] || 0; if (x > (inc[m] || 0) + 1e-9) { novas += x - (inc[m] || 0); quais[m] = (quais[m] || 0) + x - (inc[m] || 0); } inc[m] = x; }
    for (const m in b.need) demais = Math.max(demais, G.Vg.coming(b, m) - (b.need[m] || 0));
  }
  ok('c10d ninguém busca o que a carroça traz', so && demais <= MAO + 1e-9, `dado à obra tudo menos o que vem a caminho: em ${(seg / 2).toFixed(0)} s, até as carroças chegarem, o que vinha a caminho (as mãos e as carroças) nunca passou do que a obra esperava em mais de uma carga das mãos (${MAO}) (o maior excesso: ${Math.max(0, demais).toFixed(1)}; a carga da carroça: ${c.goods ? c.goods.n : 20}); cargas dos construtores tiradas do armazém nesse tempo: ${novas}${novas ? ' ' + JSON.stringify(quais) : ''}`);
  const q = checa(); ok('c10e verificador', q.ok, q.txt);
});

// ------------------------------ c11: as últimas pedras são da obra grande (L-786, D-233) ------------------------------
run('c11', () => {
  // (the far work a few stones short — all else it waits for put in its site by the god's hand, by the ledger —, the store
  // with its stone counted, and houses going up beside the store that wait for stone too)
  const monta = o => {
    // (no cart while the case is set up: the proof sends its own)
    const far0 = G.City.WORK_FAR; let a = null; try { G.City.WORK_FAR = 1e9; a = arma(35, o); } finally { G.City.WORK_FAR = far0; }
    if (!a || !a.vez) return null; const { set, f, b } = a;
    // (the houses going up: beside the town's own stores — or, o.irma, in a sister town of its people, with builders of its own)
    const onde = a.irma || set;
    a.casas = []; for (let k = 0; k < 3; k++) { const h = sim(() => V.handFound(onde, 'house', Es.n0('house'), { R: 12 })); if (h) a.casas.push(h); }
    // (n of stone still to come to it, past what its builders already carry)
    a.falta = n => sim(() => { const w = S.buildings.get(b.id); for (const m in w.need) { const q = Math.floor((w.need[m] || 0) - (m === 'stone' ? n + ((w.incoming && w.incoming.stone) || 0) : 0)); if (q > 0) { D.make('f:' + f.id, m, q, { code: 'teste' }); D.move('f:' + f.id, 'o:' + b.id, m, q, { code: 'teste' }); } } });
    a.so = n => sim(() => { if ((f.stock.stone || 0) > 0) D.use('f:' + f.id, 'stone', f.stock.stone, { code: 'teste', mine: true }); if (n > 0) D.make('f:' + f.id, 'stone', n, { code: 'teste' }); });
    return a;
  };
  let a = monta();
  if (!ok('c11a a obra longe com a vez e casas em obra junto do armazém', !!a && a.casas.length >= 1 && a.casas.every(h => !h.built && (h.need.stone || 0) >= 2), a ? `${lado(a.b)} a ${a.longe} casas do armazém; ${a.casas.length} casas em obra, cada uma à espera de ${a.casas.map(h => h.need.stone).join(', ')} de pedra` : 'sem chão ou sem a vez')) return;
  { const { set, f, b, casas } = a; const h = casas[0]; const FL = Ci.WORK_FLOOR, LAST = V.LAST;
    // (the doors: more than a load to come — nothing kept from the houses, D-174; a load or less — the work's own)
    a.so(12); const muito = [V.keeps(set), V.lastStone(set), V.stoneFor(h), V.stoneFor(b)];
    a.falta(5); const k5 = V.keeps(set); const u5 = V.lastStone(set); const p12 = [V.stoneFor(h), V.stoneFor(b)]; a.so(5); const p5 = [V.stoneFor(h), V.stoneFor(b)]; a.so(3); const p3 = [V.stoneFor(h), V.stoneFor(b)];
    ok('c11b as portas', muito[0] > LAST && muito[1] === 0 && muito[2] === 12 && muito[3] === 12 && Math.abs(k5 - 5) < 1e-6 && Math.abs(u5 - 5) < 1e-6 && Math.abs(p12[0] - 7) < 1e-6 && p12[1] === 12 && p5[0] === 0 && p5[1] === 5 && p3[0] === 0 && p3[1] === 3,
      `à espera de ${Math.round(muito[0])} de pedra (mais que uma carga de ${LAST}): nada guardado (${muito[1]}), a casa pode levar ${muito[2]} dos 12 do armazém; à espera de ${k5}: as últimas ${u5} são dela — com 12 no armazém a casa pode levar ${p12[0]} e a obra ${p12[1]}; com 5, ${p5[0]} e ${p5[1]}; com 3, ${p3[0]} e ${p3[1]}`);
    // (the cart: the last load has no floor; the people knows the wheel)
    a.so(5); const antes = daObra(b).length; const c = sim(() => Ci.workCart(set)); const fica = f.stock.stone || 0;
    ok('c11c a carroça leva a última carga abaixo do chão', antes === 0 && !!c && !!c.goods && c.goods.k === 'stone' && Math.abs(c.goods.n - 5) < 1e-6 && fica < 1e-6 && FL > 5 && V.lastStone(set) === 0,
      `5 de pedra no armazém (o chão da carroça: ${FL}): a carroça ${c ? '#' + c.id + ' leva ' + JSON.stringify(c.goods) : 'NÃO saiu'}; ficam ${fica}; com a carga na estrada, guardado no armazém ${V.lastStone(set)}`);
    const q = checa(); ok('c11d verificador', q.ok, q.txt);
  }
  // (lived, the people without the wheel: every load of stone a builder takes from the store, heard at the ledger with the
  // work it is for; a take for another work that leaves the store below the last stones of the great work is a breach)
  const vive = (semRegra, T) => {
    const m = monta({ semRoda: true, irma: true }); if (!m || !m.casas.length || !m.irma) return null; const { set, f, b } = m; const f0 = V.stoneFor, l0 = V.lastStone;
    if (semRegra) { V.stoneFor = w => G.Fac.free(w.set, 'stone'); }
    m.falta(5); m.so(0);
    // (a quarter of a minute with no stone at all in the store: the sister town gives its houses their builders)
    for (let t = 0; t < 15; t++) { sim(() => { const s = G.Fac.get(f.id).stock.stone || 0; if (s > 0) D.use('f:' + f.id, 'stone', s, { code: 'teste', mine: true }); }); M.viver(1); alimenta(S.settlements.get(set.id)); }
    let quebras = 0, dasCasas = 0, daObraN = 0, salvo = -1; const ini = V.delivered(S.buildings.get(b.id)).stone || 0;
    // (the people's stone comes in a trickle, as it did to Tenochtitlan: a stone every three seconds, never more than five in
    // the store — what its quarrymen bring past that is taken away by the proof's hand)
    const goteja = t => sim(() => { const s = G.Fac.get(f.id).stock.stone || 0; if (s > 5 + 1e-9) D.use('f:' + f.id, 'stone', s - 5, { code: 'teste', mine: true }); else if (s < 5 && t % 3 === 0) D.make('f:' + f.id, 'stone', 1, { code: 'teste' }); });
    const fn = e => {
      if (e[5] !== 'stone' || e[8] !== 'obra' || e[3] !== 'f:' + f.id) return; const v = S.villagers.get(+String(e[4]).slice(2)); const w = v && v.task && v.task.type === 'build' ? v.task.id : 0;
      if (w === b.id) { daObraN += e[6]; return; } dasCasas += e[6];
      if ((G.Fac.get(f.id).stock.stone || 0) < l0(S.settlements.get(set.id)) - 1e-6) quebras++;
    };
    D.onMove.push(fn);
    try {
      let t = 0; for (; t < T; t++) {
        goteja(t); M.viver(1); alimenta(S.settlements.get(set.id));
        if (!semRegra && salvo < 0 && t === 40) { D.onMove.splice(D.onMove.indexOf(fn), 1); M.salvarCarregar(); pega(); D.onMove.push(fn); salvo = t; }
        const w = S.buildings.get(b.id); if (!w || w.built || !((w.need.stone || 0) > 1e-6)) break;
      }
      const w = S.buildings.get(b.id); const q = checa();
      return { irma: m.irma.name, t, quebras, dasCasas, daObraN, chegou: w ? (V.delivered(w).stone || 0) - ini : -1, falta: w && !w.built ? w.need.stone || 0 : 0, pronta: !!w && w.built, salvo, q, nome: f.name };
    } finally { V.stoneFor = f0; const k = D.onMove.indexOf(fn); if (k >= 0) D.onMove.splice(k, 1); }
  };
  const T = +(process.env.C11_T || 700); const com = vive(false, T);
  if (!ok('c11e vivido, sem a roda: as casas não tocam nas últimas pedras e a obra as recebe', !!com && com.quebras === 0 && com.falta < 1e-6 && com.chegou >= 5 - 1e-6 && com.q.ok,
    com ? `a pedra do povo chegando uma a uma (nunca mais de 5 no armazém), a obra de ${com.nome} à espera de 5, as casas em obra de uma cidade-irmã à espera de 12: em ${com.t} s a obra recebeu ${com.chegou} (nas mãos dos construtores dela: ${com.daObraN}), falta ${com.falta}${com.pronta ? ', e ficou pronta' : ''}; as casas levaram ${com.dasCasas} sem nunca deixar o armazém abaixo do que é da obra (${com.quebras} quebras); o save aos ${com.salvo} s; ${com.q.txt}` : 'sem chão ou sem a vez')) return;
  const sem = vive(true, Math.max(T, com.t + 60));
  ok('c11f o mesmo sem a regra (o controle): as casas levam a pedra da obra', !!sem && sem.quebras > 0, sem ? `em ${sem.t} s: ${sem.quebras} vez(es) uma casa levou a pedra que era da obra (${sem.dasCasas} de pedra para as casas antes de a obra ter as suas); a obra recebeu ${sem.chegou}, falta ${sem.falta}` : 'sem chão');
  // (the work that loses its turn keeps nothing: read off the world, nothing stored)
  a = monta(); if (a) { const { set, b } = a; a.falta(5); a.so(9); const h = a.casas[0]; const tinha = [V.lastStone(set), V.stoneFor(h)]; set.vez = 0; const sv = [V.lastStone(set), V.stoneFor(h)]; set.vez = 1;
    sim(() => V.damageBuilding(b, 99999, 'meteor')); const caiu = [V.lastStone(set), V.stoneFor(h)];
    ok('c11g a obra que perde a vez, ou cai, não guarda nada', tinha[0] === 5 && tinha[1] === 4 && sv[0] === 0 && sv[1] === 9 && caiu[0] === 0 && caiu[1] === 9, `com a vez: ${tinha[0]} guardadas, a casa pode levar ${tinha[1]} das 9; sem a vez: ${sv[0]} e ${sv[1]}; a obra derrubada pelo deus: ${caiu[0]} e ${caiu[1]}`); }
});

console.log(fails.length ? `CANTEIRO: FALHOU (${fails.join(', ')})` : `CANTEIRO: ok (${ms()} ms)`);
process.exit(fails.length ? 1 : 0);
