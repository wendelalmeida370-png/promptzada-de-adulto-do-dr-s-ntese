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
//   c7  o fogo leva a obra com a carroça a caminho: a carga volta, e nenhuma carroça vai à ruína
//   node qa/canteiro.js [mundo]        (ONLY=c1,c3 só esses; VERB=1 conta mais)
'use strict';
process.chdir(__dirname);
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['qa/degraus-inv.js', 'qa/canteiro-inv.js'] });
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
  const set = [...new Set(G.Fac.all().filter(f => f.alive).map(f => G.Fac.capitalOf(f.id)).filter(Boolean))].sort((a, c) => V.pop(c.id) - V.pop(a.id) || a.id - c.id)[0];
  const f = G.Fac.get(set.fac); const n = 6;
  if (o.semRoda) { delete f.tech.known.roda; const ap = G.Civ.learn; G.Civ.learn = function (q, t) { return t === 'roda' && q && q.id === f.id ? false : ap.apply(this, arguments); }; } else if (!G.Civ.has(f.id, 'roda')) sim(() => G.Civ.learn(f, 'roda'));
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
  return { set, f, b, vez, longe: Math.round(aoArmazem(set, fx, fy)) };
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
  const k = c.goods.k, n = c.goods.n; const E = escuta(b);
  sim(() => V.damageBuilding(b, 99999, 'fire')); M.viver(2); E.fim(); const o = S.buildings.get(b.id);
  const volta = soma(E.L, e => e[3] === 'c:' + c.id && e[4] === 'f:' + f.id && e[8] === 'carroca-volta');
  ok('c7c a carga volta', (!o || o.type === 'ruin' || o.built) && !daObra(b).length && Math.abs(volta - n) < 1e-6, `a obra queimada (${o ? o.type : 'tirada do mapa'}): a carroça #${c.id} saiu da estrada, ${volta} de ${k} de volta ao armazém, pelo livro`);
  for (let y = 0; y < 2; y++) { alimenta(set); M.viver(50); }
  ok('c7d nenhuma carroça para a ruína', !daObra(b).length, `meio ano depois, carroças para a obra queimada: ${daObra(b).length}`);
  const q = checa(); ok('c7e verificador', q.ok, q.txt);
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

console.log(fails.length ? `CANTEIRO: FALHOU (${fails.join(', ')})` : `CANTEIRO: ok (${ms()} ms)`);
process.exit(fails.length ? 1 : 0);
