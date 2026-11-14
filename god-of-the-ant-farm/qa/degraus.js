// degraus: os degraus grandes nascem sozinhos (Bairros Vivos, o agente M; D-174, D-175, D-176), em Node. O que se media antes
// (qa/patch3/bloco-M.md): nos mundos prontos da geração 19 a obra grande ficava décadas sem pedra — o palácio de Tenochtitlan
// 21 anos sem nenhuma das 210, o teatro de Roma 21, o palácio de Argos 25 —, e com uma obra grande de cada vez nada maior
// começava; nenhum prédio de antes achava onde crescer; a maravilha era o último desejo da capital. As provas:
//   g1  a pedra da obra grande (D-174): a marca do planejador (set.gw, com a vez), o que ela guarda (V.keeps, V.stoneKept), o que
//       sobra para o calçamento e as carroças (V.stoneSpare), nenhuma casa de pé melhorada; com um adulto sem casa a vez acaba e
//       a pedra volta a ser de todos
//   g1h as casas novas das cidades-irmãs pela sobra (L-783): com a pedra guardada pela obra grande, a cabana; dada a pedra, a
//       casa de pedra que o mesmo armazém paga
//   g2  os braços (D-174): o construtor sem nada para assentar quebra a pedra que as obras esperam; a turma da obra grande
//       (V.GANG dos adultos) e a pedreira do povo nas outras cidades (V.GANG_Q)
//   g3  a obra anda no salto: em 3 anos a obra grande recebe a sua pedra pelo livro; custa e demora o do degrau (G.Escala.bill,
//       V.workOf); o save no meio (o mesmo prédio, a mesma marca, o mesmo futuro duas vezes)
//   g4  sem pedra: o povo sem renda nem estoque não pede o degrau grande; a obra em curso, sem pedra nem rocha, espera sem ser
//       largada — e anda quando a pedra chega
//   g5  o degrau erguido de novo (D-175): sem espaço em volta, o degrau maior nasce noutro lugar e o antigo fica; do maior para o
//       menor; uma obra grande de cada vez; cada degrau uma vez; nunca outra maravilha (g5m); uma vila não (g5v); e, numa
//       capital com terra de sobra (g5t), o que esperava a vez é o que o planejador ergue quando a primeira fica de pé
//   g6  a maravilha do campo guardado vem antes de qualquer outra obra grande (D-176)
//   g7  a guerra no meio: a cidade tomada com a obra grande em curso — a obra e a marca passam ao novo povo, nada preso
//   g9  a resistência do degrau (L-784): um degrau maior aguenta o que o lote dele é; ampliado, salvo, desistido; o mesmo golpe (do cerco: o fogo é da D-219)
//   g8  o mundo crescido pelo salto, do zero (duas sementes): uma capital ergue sozinha um degrau grande, e nenhuma vila
//   node qa/degraus.js            (ONLY=g1,g5 só esses; VERB=1 conta mais; MUNDO=mega outro mundo pronto para g1–g7)
'use strict';
process.chdir(__dirname);
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['qa/degraus-inv.js', 'qa/canteiro-inv.js', 'qa/aterro-inv.js'] });
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null; const VERB = !!process.env.VERB; const MUNDO = process.env.MUNDO || 'metropole';
const hr = process.hrtime.bigint(); const ms = () => Number((process.hrtime.bigint() - hr) / 1000000n);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | degraus ${name} | ${info}`); if (!c) fails.push(name); return c; };
const sim = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
function run(id, fn) { if (ONLY && !ONLY.includes(id)) return; try { fn(); } catch (e) { ok(id, false, 'exceção: ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join(' / ') : e)); } }
let S, V, Es, D;
const pega = () => { S = G.S; V = G.Village; Es = G.Escala; D = G.Depot; return S; };
const abre = w => { M.pronto(w || MUNDO); return pega(); };
// (the towns by what they are, never by name: every remade world changes sizes, names and capitals — T-477)
const capitais = () => [...new Set(G.Fac.all().filter(f => f.alive).map(f => G.Fac.capitalOf(f.id)).filter(Boolean))].sort((a, c) => V.pop(c.id) - V.pop(a.id) || a.id - c.id);
const pub = t => !!G.BDEF[t] && (!!G.BDEF[t].civic || t === 'temple' || t === 'monument');
const grande = b => !!b && b.type !== 'ruin' && pub(b.type) && (!!b.amp || b.w !== Es.n0(b.type));
const lado = b => (b ? `${b.type}#${b.id} ${b.w}×${b.h} em ${b.x},${b.y} (${b.esc || '-'})` : 'nada');
const pedra = (set, n) => D.make('f:' + set.fac, 'stone', n, { code: 'teste' });
const semPedra = set => { const f = G.Fac.get(set.fac); if ((f.stock.stone || 0) > 0) D.use('f:' + f.id, 'stone', f.stock.stone, { code: 'teste', mine: true }); };
// (the people's store with nothing a work is made of — its timber, its stone, its brick —: the builders with nothing to lay)
const semMaterial = set => { const f = G.Fac.get(set.fac); const ks = new Set(['wood', 'stone']); for (const o of S.buildings.values()) if (!o.built && o.need && V.facOfSet(o.set) === f.id) for (const k in o.need) ks.add(k); for (const k of ks) if ((f.stock[k] || 0) > 0) D.use('f:' + f.id, k, f.stock[k], { code: 'teste', mine: true }); };
const rico = (set, n) => { G.Fac.get(set.fac).pedra = [S.day, 0, n === undefined ? 100 : n]; };
const marca = () => G.S.logN || 0;
const linhas = (n0, rx) => G.S.history.filter(e => e.n > n0 && rx.test(e.txt));
const salva = () => { const k = M.salvarCarregar(); pega(); return k; };
const civicas = set => sim(() => { for (const o of [...S.buildings.values()]) if (o.set === set.id && !o.built && o.type !== 'ruin' && pub(o.type)) V.completeBuilding(o); });
const adultos = set => { let n = 0; for (const v of S.villagers.values()) if (v.set === set.id && !v.captive && v.age >= 16 && v.age < 62) n++; return n; };
const oficio = (set, r) => { let n = 0; for (const v of S.villagers.values()) if (v.set === set.id && v.role === r) n++; return n; };
function checa() {
  const out = [];
  for (const q of QA.check()) if (q.sev <= 2) out.push(`S${q.sev} ${q.sys}: ${q.msg.slice(0, 150)}`);
  const e = M.erros(); const errs = Object.keys(e.mod).length + e.console.length;
  return { ok: !out.length && !errs, txt: out.length ? out.slice(0, 3).join(' · ') : errs ? 'erros: ' + JSON.stringify(e).slice(0, 240) : 'verificador limpo' };
}
// (the town fed and housed, by the game's own doors — the god's hand fills the store and raises huts for who has no home —, so
// that its great work has its turn: D-120. The planner looks every 3.5 s)
function alimenta(set) { const f = G.Fac.get(set.fac); const want = Math.min(V.cap(f.id) * 0.97, Math.max(G.Fac.pop(f.id) * 14, 80)); if ((f.stock.food || 0) < want) D.make('f:' + f.id, 'food', want - (f.stock.food || 0), { code: 'teste' }); }
// (the jump, a season at a time — fifty seconds of the world's —, the town fed by the god's hand at each: a great work has its turn
// only while its town is fed and housed, D-120, and the proofs of the stone are not the proofs of the harvest)
function estacoes(setId, n) {
  G.Skip.on = true; G.FX.off = true; G.W.pathGreed = 1.3;
  try { for (let k = 0; k < n; k++) { const s = S.settlements.get(setId); if (s) alimenta(s); for (let q = 0; q < 50; q++) G.Main.skipStep(1); } } finally { G.Skip.on = false; G.FX.off = false; G.W.pathGreed = G.W.PATH_EXACT; }
}
function comVez(set) {
  alimenta(set);
  for (let k = 0; k < 30 && V.housingInfo(set.id).homeless > 0; k++) { if (!sim(() => V.handFound(set, 'hut', 1, { built: true, R: 40 }))) break; M.viver(3); }
  M.viver(4); return set.vez === 1;
}
// (a great work of the town under way, by the god's hand: the nearest lot of its step — the planner marks it at its next look)
const fundar = (set, type, stepId) => sim(() => V.handFound(set, type, stepId, { R: 60 }));
// (a capital with one great work going up, by the god's hand, the planner marking it at its next look: of the capitals with none
// under way, the one whose lot — the planner's own search first, the god's nearest free lot else — lies nearest a store of the
// town. A lot forty tiles from every store is another matter — a load a day: T-760 —, and the proofs of the stone are not the
// proofs of the distance. With no such capital, one whose own great work waits for stone already, as the world has it)
const emObra = set => [...S.buildings.values()].filter(o => o.set === set.id && !o.built && grande(o));
const aoArmazem = (set, x, y) => { let d = 1e9; for (const o of V.dropoffs(set.id)) { const c = V.center(o); d = Math.min(d, G.dist(x, y, c[0], c[1])); } return d; };
// (the hands: a capital of sixty or more with its lot within twenty tiles of a store, in the first ready world that has one —
// a great work is a town's hands, and a capital of forty has four builders: the proofs of the hands and of the years ask for
// a town that has them. → what capitalCom gives, with .mundo, the world left open)
const MUNDOS = [...new Set(['mega', MUNDO, 'metropole', 'mundial'])];
function capitalGrande(type, stepId) {
  for (const w of MUNDOS) { abre(w); const r = capitalCom(type, stepId, s => V.pop(s.id) >= 60, 20); if (r && r.posta && r.longe <= 20) return Object.assign(r, { mundo: w }); }
  abre(); const r = capitalCom(type, stepId); return r ? Object.assign(r, { mundo: MUNDO }) : null;
}
// (a obra no lote do próprio planejador, pela porta do planejador — o V.startProject com o degrau, onde o povo dela sabe erguê-lo
// —: a mão do deus, pedida com raio 0, lê o seu padrão de 40 (o.R || 40), e, com o lote do planejador encostado noutro prédio
// (a regra dela quer o anel livre; a do planejador, não), tomava o lote mais perto da sua própria regra — na metrópole da
// geração 20, Roma, um estábulo no anel: um lote a seis casas dali com três rochas, que pagaram 112 dos 140 de pedra do teatro
// (D-121): a obra esperava 28, menos do que o armazém tinha, e a pedra que ela guarda deixava de ser o caso. T-1010)
function capitalCom(type, stepId, quer, perto) {
  const st = Es.steps(type).find(q => q.id === stepId || q.n === stepId), n = st.n; const cands = [];
  for (const set of capitais()) {
    if ((quer && !quer(set)) || emObra(set).length || V.pop(set.id) < 30 || !Es.can(type, G.Civ.idOfFac(set.fac) || 'classico', n)) continue;
    set._noSite = {}; const p = sim(() => V.findSite(set, type, undefined, n)); set._noSite = {};
    if (p && !p.demolish) cands.push([aoArmazem(set, p[0] + n / 2, p[1] + n / 2), set, p]);
  }
  cands.sort((a, c) => a[0] - c[0] || a[1].id - c[1].id);
  for (const [d, set, p] of cands) { if (perto && d > perto) break; const b = sim(() => V.startProject(set, type, [p[0], p[1]], st)); if (b) return { set, b, posta: 1, longe: Math.round(d) }; }
  if (perto) return null;
  for (const set of capitais()) { if ((quer && !quer(set)) || emObra(set).length) continue; const b = fundar(set, type, stepId); if (b) { const c = V.center(b); return { set, b, posta: 1, longe: Math.round(aoArmazem(set, c[0], c[1])) }; } }
  for (const set of capitais()) { if (quer && !quer(set)) continue; const b = emObra(set).find(o => (o.need.stone || 0) > 0); if (b) { const c = V.center(b); return { set, b, posta: 0, longe: Math.round(aoArmazem(set, c[0], c[1])) }; } }
  return null;
}
// (the ledger's lines of stone, heard as they are written — the ledger itself keeps only its last four thousand —: { linhas, fim })
function escuta() { const linhas = []; const f = e => { if (e[5] === 'stone') linhas.push(e.slice()); }; D.onMove.push(f); return { linhas, fim: () => { const k = D.onMove.indexOf(f); if (k >= 0) D.onMove.splice(k, 1); } }; }
// (what came into a work, less what went back from it to a store or to hands — never what was built into it when it stood)
const naObra = (L, id) => L.filter(e => e[4] === 'o:' + id).reduce((a, e) => a + e[6], 0) - L.filter(e => e[3] === 'o:' + id && /^[fv]:/.test(String(e[4]))).reduce((a, e) => a + e[6], 0);
const rochasPerto = set => { let n = 0; for (const r of S.rocks.values()) if (r.stone >= 1 && G.dist(r.x, r.y, set.cx, set.cy) < 20) n++; return n; };
// (the god puts rocks on free dry ground the town walks to, about its middle: the quarry of the proofs)
function rochas(set, n, em) {
  const N = G.N, T = G.T; let put = 0; const cx = em ? em[0] : set.cx, cy = em ? em[1] : set.cy;
  for (let r = 6; r <= 18 && put < n; r++) for (let k = 0; k < r * 8 && put < n; k++) {
    const a = k / (r * 8) * Math.PI * 2; const x = Math.floor(cx + Math.cos(a) * r), y = Math.floor(cy + Math.sin(a) * r); if (x < 3 || y < 3 || x >= N - 3 || y >= N - 3) continue;
    const i = y * N + x; if (S.type[i] < T.SAND || S.type[i] === T.RIVER || S.occ[i] || S.objAt[i] || S.treeAt[i] || S.road[i] || S.wall[i] || !G.W.walkable(i) || !G.W.reachesTownXY(x + 0.5, y + 0.5, set)) continue;
    if (sim(() => G.Nature.addRock(x + 0.5, y + 0.5, 40))) put++;
  }
  return put;
}

// ------------------------------ g1: a pedra da obra grande ------------------------------
run('g1', () => {
  abre(); const r = capitalCom('teatro', 6); if (!ok('g1a a obra grande', !!r && grande(r.b) && !r.b.built, r ? `${r.set.name} (${V.pop(r.set.id)} pessoas, nível ${r.set.tier}): ${lado(r.b)}${r.posta ? ', fundada pela prova' : ', como o mundo a tem'}, a ${r.longe} casas de um armazém, a conta ${JSON.stringify(V.bill(r.b))}` : 'nenhuma capital com lote de 6 nem obra grande em curso')) return;
  const { set, b } = r; const f = G.Fac.get(set.fac); semPedra(set); pedra(set, 60);
  const vez = comVez(set); const falta = (b.need.stone || 0) - ((b.incoming && b.incoming.stone) || 0);
  ok('g1b a marca do planejador', vez && set.gw === b.id && Math.abs(V.keeps(set) - falta) < 1e-6 && falta > 0, `a vez ${set.vez}, set.gw ${set.gw} (a obra #${b.id}); V.keeps ${V.keeps(set)} = o que a obra ainda espera de pedra (${falta})`);
  // (the great work's turn with the builders — V.workPri —: as if it stood at the town's middle on three days in four of each
  // builder, GREAT_PRI nearer on the fourth; with no builder named, GREAT_PRI)
  { const c = V.center(b); const far2 = G.dist2(c[0], c[1], set.cx, set.cy); const cons = [...S.villagers.values()].filter(v => v.set === set.id && v.age >= 16).sort((x, y) => x.id - y.id).slice(0, 40);
    const dias = cons.filter(v => Math.abs(V.workPri(b, v) + V.GREAT_PRI + far2) < 1e-6).length, outros = cons.filter(v => Math.abs(V.workPri(b, v) + V.GREAT_PRI) < 1e-6).length;
    ok('g1b2 a vez alcança a obra longe', dias + outros === cons.length && dias > outros && (far2 < 1 || dias > 0) && V.workPri(b) === -V.GREAT_PRI, `a obra a ${Math.sqrt(far2).toFixed(0)} casas do meio de ${set.name}: de ${cons.length} adultos, hoje ${dias} a têm como se estivesse no meio (−${Math.round(V.GREAT_PRI + far2)}) e ${outros} só ${V.GREAT_PRI} mais perto`); }
  const kept = V.stoneKept(f.id), sobra = V.stoneSpare(f.id), tem = f.stock.stone || 0;
  ok('g1c o que sobra', kept >= falta - 1e-6 && Math.abs(sobra - Math.max(0, tem - kept)) < 1e-6 && sobra === 0, `o povo tem ${tem.toFixed(0)} de pedra, as obras grandes guardam ${kept.toFixed(0)}: sobram ${sobra.toFixed(0)} para o calçamento e as carroças`);
  // (a year lived: no paving stone, no stone out on a cart, no house that stands bettered — and the work's stone only by the ledger)
  const E1 = escuta(); const ups0 = new Set([...S.buildings.values()].filter(o => o.set === set.id && o.upgradeFrom && !o.built).map(o => o.id));
  // (and the people's other towns, L-714: the store is one — what their planners are given to better a house with, and each
  // stone extra they begin, heard at the planner's own doors; the spare read at each season)
  const irmas = [...S.settlements.values()].filter(q => q.fac === f.id && q.id !== set.id); const pedem = [], comecam = []; let sobraMax = 0;
  const up0 = G.City.upgradeHomes, sp0 = V.startProject; const irma = q => !!q && q.fac === f.id && q.id !== set.id;
  G.City.upgradeHomes = function (q, fac, c, st) { const kept = V.stoneKept(f.id), spare = V.stoneSpare(f.id); const r = up0.apply(this, arguments); if (irma(q)) pedem.push({ town: q.name, dada: st.stone || 0, kept, spare, fez: !!r }); return r; };
  V.startProject = function (q, type) { const d = G.BDEF[type]; const n = (d && d.cost && d.cost.stone) || 0; if (irma(q) && d && !d.housing && !V.ESSENTIAL[type] && !V.DEFENCE[type] && n >= 8) comecam.push({ town: q.name, type, n, kept: V.stoneKept(f.id), spare: V.stoneSpare(f.id) }); return sp0.apply(this, arguments); };
  const upsI0 = new Set([...S.buildings.values()].filter(o => irmas.some(q => q.id === o.set) && o.upgradeFrom && !o.built).map(o => o.id));
  try { for (let k = 0; k < 4; k++) { alimenta(set); M.viver(50); sobraMax = Math.max(sobraMax, V.stoneSpare(f.id)); } } finally { G.City.upgradeHomes = up0; V.startProject = sp0; }
  E1.fim(); const fora = E1.linhas.filter(e => e[3] === 'f:' + f.id && ['calcamento', 'carroca', 'carroca-troca'].includes(e[8])).reduce((a, e) => a + e[6], 0); const ups = [...S.buildings.values()].filter(o => o.set === set.id && o.upgradeFrom && !o.built && !ups0.has(o.id));
  const o = S.buildings.get(b.id);
  ok('g1d um ano vivido', !!o && fora === 0 && !ups.length, `pedra do povo no calçamento e nas carroças: ${fora}; casas de pé postas em obra de melhoria: ${ups.length}; a obra ${o ? (o.built ? 'pronta' : 'espera ' + Math.round(o.need.stone || 0) + ' de pedra') : 'SUMIU'}, a vez ${set.vez}`);
  { const guardando = pedem.filter(q => q.kept > 0), mal = guardando.filter(q => q.dada > q.spare + 1e-6), extras = comecam.filter(q => q.kept > 0 && q.n > q.spare + 1e-6);
    const upsI = [...S.buildings.values()].filter(o => irmas.some(q => q.id === o.set) && o.upgradeFrom && !o.built && !upsI0.has(o.id));
    ok('g1d2 as cidades-irmãs só gastam a sobra (L-714)', irmas.length > 0 && guardando.length > 0 && !mal.length && !extras.length && (sobraMax >= 10 || !upsI.length),
      `${irmas.length} cidades-irmãs de ${set.name} (${irmas.map(q => q.name).join(', ')}): os planejadores delas pediram ${guardando.length} vezes para melhorar uma casa com a obra guardando pedra — ${mal.length ? `${mal.length} vezes com MAIS do que a sobra (${mal[0].town}: dada ${mal[0].dada.toFixed(0)}, sobra ${mal[0].spare.toFixed(0)})` : 'sempre só com a sobra'}; extras de pedra começados acima da sobra: ${extras.length}${extras.length ? ' (' + extras.slice(0, 3).map(q => `${q.type} em ${q.town}, ${q.n} de pedra com sobra ${q.spare.toFixed(0)}`).join('; ') + ')' : ''} (de ${comecam.length} começados); casas de pé postas em melhoria: ${upsI.length} (a maior sobra do ano: ${sobraMax.toFixed(0)})`); }
  // (a grown one with no home: the turn ends at the planner's next look, and the stone is everyone's again)
  const sem = [...S.villagers.values()].filter(v => v.set === set.id && !v.captive && v.age >= 20 && v.home && !(S.avatar && S.avatar.id === v.id)).sort((a, c) => a.id - c.id)[0];
  if (sem && o && !o.built) {
    sim(() => { const h = S.buildings.get(sem.home); sem.home = 0; if (h) h.res = Math.max(0, (h.res || 1) - 1); V.vez(set); });
    ok('g1e sem casa, sem vez', set.vez === 0 && V.keeps(set) === 0 && Math.abs(V.stoneSpare(f.id) - (f.stock.stone || 0)) < 1e-6, `${sem.name} sem casa, ao olhar do planejador: a vez ${set.vez}, a obra guarda ${V.keeps(set)}, sobra toda a pedra do povo (${(f.stock.stone || 0).toFixed(0)})`);
  } else ok('g1e sem casa, sem vez', false, 'a premissa não se armou (ninguém com casa, ou a obra pronta)');
  const c = checa(); ok('g1f verificador', c.ok, c.txt);
});

// ------------------------------ g1p: o olhar do planejador (T-767) ------------------------------
// (no house that stands is bettered while the great work waits for stone — the planner's own look, V.planNow, asked again and
// again with nothing else in its way: a hut to rebuild in stone, a workshop, stone and timber in the store, every other work of
// the town finished by the proof's hand before each look. A year lived in Rome of the metropole bettered no house with the
// rule or without it — the town's works took every look —, and the rule had no proof)
run('g1p', () => {
  abre(); const r = capitalCom('teatro', 6); if (!ok('g1p a obra grande', !!r && grande(r.b) && !r.b.built, r ? `${r.set.name} (${V.pop(r.set.id)} pessoas): ${lado(r.b)}` : 'nenhuma capital com lote de 6 nem obra grande em curso')) return;
  const { set, b } = r; const f = G.Fac.get(set.fac); semPedra(set); const vez = comVez(set);
  const hut = [...S.buildings.values()].some(q => q.set === set.id && q.type === 'hut' && q.built) || !!sim(() => V.handFound(set, 'hut', 1, { built: true, R: 40 }));
  const melhorias = () => [...S.buildings.values()].filter(q => q.set === set.id && q.upgradeFrom && !q.built).length;
  // (every work of the town but the great one finished by the proof's hand before each look — the betterings under way too: the
  // planner begins no second bettering of a kind while one is going up (c.siteTypes), and Roma of the metropole of the
  // generation 21 had a hut and a house going up a step, which the hand left standing — «0 em 21 olhar(es)», T-1102 —; so a
  // bettering under way after a look was begun by that look)
  const arma = () => sim(() => { for (const q of [...S.buildings.values()]) if (q.set === set.id && !q.built && q.type !== 'ruin' && q.id !== b.id) V.completeBuilding(q); for (const m of ['stone', 'wood']) if ((f.stock[m] || 0) < 40) D.make('f:' + f.id, m, 40 - (f.stock[m] || 0), { code: 'teste' }); });
  const olha = (n, para) => { let k = 0, up = 0; for (; k < n; k++) { arma(); alimenta(set); sim(() => V.planNow(set)); up += melhorias(); if (para && up > 0) break; } return { k, up }; };
  const com = olha(20).up, guarda = V.keeps(set);
  // (all the work waits for, by the god's hand — its brick too: a bill short of brick takes stone in its place, swapBill)
  for (let k = 0; k < 4; k++) sim(() => { for (const m in b.need) { const n = b.need[m] || 0; if (n > 0) { D.make('f:' + f.id, m, n, { code: 'teste' }); D.move('f:' + f.id, 'o:' + b.id, m, n, { code: 'teste' }); } } });
  const livre = V.keeps(set) === 0; const r2 = olha(20, true); const olhares = r2.k + 1; const sem = r2.up;
  ok('g1p2 nenhuma casa melhorada enquanto a obra grande espera pedra', vez && hut && guarda > 0 && com === 0 && livre && sem >= 1,
    `${set.name}, a vez ${set.vez}, uma cabana por refazer, 40 de pedra e de madeira no armazém, nenhuma outra obra no caminho: em 20 olhares do planejador com a obra esperando ${guarda.toFixed(0)} de pedra, casas postas em melhoria: ${com}; dado à obra o que ela esperava (guarda ${livre ? 0 : 'AINDA ' + V.keeps(set)}): ${sem} em ${olhares} olhar(es)`);
  const c = checa(); ok('g1p3 verificador', c.ok, c.txt);
});

// ------------------------------ g1h: as casas novas pela sobra (L-783) ------------------------------
// (the people's store is one: the homes a sister town raises while a great work of its people keeps stone are of what the work
// leaves. The planner's own look at a sister town with families with no home — their houses taken by fire, the game's door —, every
// other work of it finished by the proof's hand before each look: with the store's stone all kept by the great work, a hut of
// timber; the work given what it waited for, the stone home the same store pays for. In the metropole 130 of 150 of stone given
// to Rome's store went into the sobrados and ínsulas of Lavínio, Cápua, Óstia and Tíbur in two years; its theatre got 8)
run('g1h', () => {
  abre(); const r = capitalCom('teatro', 6); if (!ok('g1h a obra grande', !!r && grande(r.b) && !r.b.built, r ? `${r.set.name} (${V.pop(r.set.id)} pessoas): ${lado(r.b)}` : 'nenhuma capital com lote de 6 nem obra grande em curso')) return;
  const { set, b } = r; const f = G.Fac.get(set.fac); semPedra(set); pedra(set, 60); const vez = comVez(set);
  const CASAS = { hut: 1, house: 1, sobrado: 1, insula: 1, quarteirao: 1 }; const oficina = G.Fac.has(f.id, 'workshop');
  const q = [...S.settlements.values()].filter(o => o.fac === f.id && o.id !== set.id && (o.tier || 0) >= 2 && V.pop(o.id) >= 8).sort((a, c) => V.pop(c.id) - V.pop(a.id) || a.id - c.id)[0];
  if (!ok('g1h2 uma cidade-irmã que ergue casas de pedra', !!q && vez && oficina && V.stoneKept(f.id) > 0, q ? `${q.name} (${V.pop(q.id)} pessoas, nível ${q.tier}), de ${f.name}; a vez de ${set.name} ${set.vez}, a obra guarda ${V.stoneKept(f.id).toFixed(0)} de ${(f.stock.stone || 0).toFixed(0)} de pedra do povo` : `nenhuma cidade-irmã de nível 2 de ${set.name}`)) return;
  // (every other work of the sister finished, the store with timber, and homes of it taken until its planner asks for one)
  const arma = () => sim(() => { for (const o of [...S.buildings.values()]) if (o.set === q.id && !o.built && o.type !== 'ruin' && !o.upgradeFrom) V.completeBuilding(o); if ((f.stock.wood || 0) < 60) D.make('f:' + f.id, 'wood', 60 - (f.stock.wood || 0), { code: 'teste' }); });
  // (a regra do próprio planejador: gente sem casa ou menos de duas camas de sobra, e as camas que há, com as das casas em obra,
  // a menos de três além da gente — a casa em melhoria é uma casa em obra, e as camas dela vêm: a Óstia da metrópole da geração
  // 20 tinha uma cabana sendo refeita em casa, 6 camas a caminho, e o planejador, com razão, não pedia casa nenhuma. T-1011)
  const vem = () => { const c = V.counts(q.id); let n = 0; for (const k in c.siteTypes) n += (G.BDEF[k].housing || 0) * c.siteTypes[k]; return n; };
  const pede = () => { const hi = V.housingInfo(q.id); return (hi.homeless > 0 || hi.cap - hi.pop < 2) && hi.cap + vem() < hi.pop + 3; };
  const tira = () => sim(() => { for (const h of [...S.buildings.values()].filter(o => o.set === q.id && CASAS[o.type] && o.built).sort((a, c) => c.id - a.id)) { if (pede()) break; V.damageBuilding(h, 99999, 'fire'); } });
  // (the planner's looks, the homes it founds heard at its own door: → the type of the first)
  const olha = n => { const sp0 = V.startProject; let tipo = null; V.startProject = function (s, type) { const nb = sp0.apply(this, arguments); if (nb && s === q && CASAS[type] && !tipo) tipo = type; return nb; };
    try { for (let k = 0; k < n && !tipo; k++) { arma(); alimenta(q); q._noSite = {}; sim(() => V.planNow(q)); } } finally { V.startProject = sp0; } return tipo; };
  arma(); tira(); const hi = V.housingInfo(q.id), hv = vem();
  // (what the whole store would pay for, asked of the door of the homes with the dice put back)
  const rng = S.rng; const cru = sim(() => G.City.homeType(q, f, oficina, f.stock)); S.rng = rng;
  const sobra = V.stoneSpare(f.id); const t1 = olha(12);
  ok('g1h3 com a pedra guardada, a casa nova é da sobra', pede() || !!t1 ? (cru !== 'hut' && sobra < 6 && t1 === 'hut') : false,
    `${q.name}: ${hi.homeless} sem casa, ${hi.cap} camas para ${hi.pop} (e ${hv} em obra); o povo tem ${(f.stock.stone || 0).toFixed(0)} de pedra, a obra grande guarda ${V.stoneKept(f.id).toFixed(0)}, sobram ${sobra.toFixed(0)}: pelo estoque inteiro a casa seria «${cru}»; o planejador fundou «${t1 || 'nada'}»`);
  // (the work given all it waits for, by the god's hand — its brick too —: nothing kept, and the same store pays a stone home)
  for (let k = 0; k < 4; k++) sim(() => { for (const m in b.need) { const n = b.need[m] || 0; if (n > 0) { D.make('f:' + f.id, m, n, { code: 'teste' }); D.move('f:' + f.id, 'o:' + b.id, m, n, { code: 'teste' }); } } });
  sim(() => { for (const o of [...S.buildings.values()]) if (o.set === q.id && CASAS[o.type] && !o.built && !o.upgradeFrom) V.damageBuilding(o, 99999, 'fire'); });
  if ((f.stock.stone || 0) < 60) pedra(set, 60 - (f.stock.stone || 0));
  tira(); const livre = V.stoneKept(f.id) === 0; const t2 = olha(12);
  ok('g1h4 dada a pedra à obra, a casa de pedra', livre && !!t2 && t2 !== 'hut', `a obra com o que esperava (guardado ${V.stoneKept(f.id).toFixed(0)}), ${(f.stock.stone || 0).toFixed(0)} de pedra no armazém: o planejador de ${q.name} fundou «${t2 || 'nada'}»`);
  const c = checa(); ok('g1h5 verificador', c.ok, c.txt);
});

// ------------------------------ g2: os braços ------------------------------
run('g2', () => {
  const r = capitalGrande('teatro', 6); if (!ok('g2a a obra grande', !!r, r ? `${r.mundo}, ${r.set.name} (${V.pop(r.set.id)} pessoas): ${lado(r.b)}, a ${r.longe} casas de um armazém` : 'nenhuma capital com lote de 6')) return;
  const { set, b } = r; const f = G.Fac.get(set.fac);
  // (the timber in, the stone out: what the work waits for is stone alone, and the store has none)
  sim(() => { const w = b.need.wood || 0; if (w > 0) { D.make('f:' + f.id, 'wood', w, { code: 'teste' }); D.move('f:' + f.id, 'o:' + b.id, 'wood', w, { code: 'teste' }); } });
  semPedra(set); const postas = rochasPerto(set) >= 6 ? 0 : rochas(set, 10);
  const vez = comVez(set); const A = adultos(set);
  let quebra = 0, maxQ = 0; const quem = new Set(); const faz = {}; const E2 = escuta();
  for (let k = 0; k < 60; k++) {
    // (the store with no stone, and what the works have got already laid — by the proof's hand: the builders with nothing to lay)
    if (k % 6 === 0) { alimenta(set); semMaterial(set); sim(() => { for (const o of S.buildings.values()) if (o.set === set.id && !o.built && o.type !== 'ruin') { const al = G.Vg.allowedProgress(o); if (al < 1 && o.progress < al) o.progress = al; } }); }
    M.viver(2); let q = 0;
    for (const v of S.villagers.values()) if (v.set === set.id && v.role === 'construtor') {
      const ty = v.task ? v.task.type : '-'; faz[ty] = (faz[ty] || 0) + 1;
      if (ty === 'mine' || ty === 'quarry') { q++; quem.add(v.id); }
    }
    if (q) quebra++; maxQ = Math.max(maxQ, q);
  }
  if (VERB) console.log(`  (g2: o que os construtores fazem, em 60 olhares: ${JSON.stringify(faz)}; hora ${(S.time || 0).toFixed(2)}; obras: ${[...S.buildings.values()].filter(o => o.set === set.id && !o.built && o.type !== 'ruin').map(o => o.type + o.w + ' ' + JSON.stringify(o.need) + ' ' + Math.round(o.progress * 100) + '%').join(' | ')})`);
  const cons = oficio(set, 'construtor'), turma = Math.ceil(A * V.GANG);
  ok('g2b o construtor quebra a pedra da obra', vez && quem.size >= 1 && quebra >= 3, `${set.name}: a vez ${set.vez}; ${rochasPerto(set)} rochas perto (${postas} postas pela prova); em 120 s, ${quem.size} construtores quebraram pedra (em ${quebra} de 60 olhares, até ${maxQ} de uma vez), o armazém do povo sem madeira, pedra nem tijolo`);
  ok('g2c a turma da obra', cons >= Math.min(turma, Math.max(1, Math.floor(A * 0.2))), `${A} adultos: ${cons} construtores (a turma de ${Math.round(V.GANG * 100)}%: ${turma})`);
  // (the stone they break goes straight to a work that waits for it, from the hands of who broke it, by the ledger — never round
  // by the store: what their hands gave a work, less what their hands took from the store)
  E2.fim(); const L = E2.linhas.filter(e => e[8] === 'obra' && quem.has(e[9]));
  const deram = L.filter(e => String(e[4]).startsWith('o:')).reduce((a, e) => a + e[6], 0), tiraram = L.filter(e => e[3] === 'f:' + f.id).reduce((a, e) => a + e[6], 0);
  const grandeObra = naObra(L, b.id);
  // (one by one: a builder who gave the works more stone than he took from the store brought it from the rock himself)
  const diretos = [...quem].filter(id => L.filter(e => e[9] === id && String(e[4]).startsWith('o:')).reduce((a, e) => a + e[6], 0) > L.filter(e => e[9] === id && e[3] === 'f:' + f.id).reduce((a, e) => a + e[6], 0) + 1e-6);
  ok('g2d a pedra quebrada vai direto para uma obra', diretos.length >= 1 && deram > 0, `em 120 s, com o armazém sem material: das mãos de quem quebrou pedra, ${deram.toFixed(0)} entregues às obras (${grandeObra.toFixed(0)} à obra grande), ${tiraram.toFixed(0)} tiradas do armazém; ${diretos.length} deles deram às obras mais pedra do que tiraram do armazém`);
  // (the gang is the great work's own rule: with it the town's only work under way — the others finished by the proof's hand —
  // the repartidor's count by works is two or three builders, and the town keeps the gang all the same. It looks every 4 s)
  sim(() => { for (const o of [...S.buildings.values()]) if (o.set === set.id && !o.built && o.type !== 'ruin' && o.id !== b.id) V.completeBuilding(o); });
  // (the gang is the rule of a work that waits for stone: in the mega of the generation 19 with the trade that stays, the
  // theatre of Mênfis had all its stone from the gang's own hands in the 120 s before — 88 of it — and waited only for the
  // brick the proof's hand keeps out of the store: no look «with the great work waiting», and the case read nothing. The
  // brick it still waits for goes back to stone by the game's door (V.swapBill), as the game does when no brick comes,
  // L-720: T-832)
  let tijolo = 0; sim(() => { const k = b.brick && b.brick.k; if (k && !((b.need.stone || 0) > 0)) { const n = (b.need[k] || 0) - ((b.incoming && b.incoming[k]) || 0); if (n > 0 && V.swapBill(b, k, n, 'stone', n)) tijolo = n; } });
  comVez(set); let pior = 1e9, olhares = 0, obras2 = 0, turma2 = 0, tem = 0;
  for (let k = 0; k < 9; k++) {
    alimenta(set); semMaterial(set); M.viver(5); if (k < 2) continue;
    const A2 = adultos(set), n2 = [...S.buildings.values()].filter(o => o.set === set.id && !o.built && o.type !== 'ruin').length, t2 = Math.min(Math.ceil(A2 * V.GANG), Math.max(1, Math.floor(A2 * 0.2)));
    if (!(V.keeps(set) > 0) || Math.ceil(n2 * 1.4) + 1 >= t2) continue; // (a look with the work waiting and few works: the gang's own)
    const n = oficio(set, 'construtor'); olhares++; if (n - t2 < pior) { pior = n - t2; obras2 = n2; turma2 = t2; tem = n; }
  }
  ok('g2c2 a turma é da obra grande', olhares >= 3 && pior >= 0, `as outras obras de ${set.name} prontas pela mão da prova${tijolo ? ` (e os ${Math.round(tijolo)} de tijolo que a obra ainda esperava, de volta à pedra pela porta do jogo)` : ''}: em ${olhares} olhares com a obra grande à espera e poucas obras, o pior: ${tem} construtores com ${obras2} obra(s) em curso (pela conta das obras seriam ${Math.ceil(obras2 * 1.4) + 1} no máximo; a turma: ${turma2})`);
  const c = checa(); ok('g2f verificador', c.ok, c.txt);
  // (the people's quarry: another town of the same people, with rock about it, keeps a gang at the quarry while the work waits.
  // Where the capital of the hands has no other town with people — Mênfis of the mega —, the first ready world with a capital
  // that has one, its great work founded as above, or its own that waits for stone)
  const irmas = s => [...S.settlements.values()].filter(o => o.fac === s.fac && o !== s && adultos(o) >= 6).sort((a, c) => adultos(c) - adultos(a) || a.id - c.id);
  let cap = set, mundo = r.mundo;
  if (!irmas(cap).length) { cap = null; for (const w of MUNDOS) { abre(w); const q = capitalCom('teatro', 6, s => irmas(s).length > 0); if (q) { cap = q.set; mundo = w; semPedra(cap); comVez(cap); break; } } }
  if (!cap) { console.log('  (g2e: em nenhum mundo pronto uma capital com obra grande tem outra cidade do povo com gente; a pedreira do povo fica sem caso)'); return; }
  const f2 = G.Fac.get(cap.fac), s2 = irmas(cap)[0]; if (rochasPerto(s2) < 4) rochas(s2, 8);
  // (room in the people's stores for plenty, by the god's hand: where they hold less than seven of food a head the granaries
  // are never «full», and the people's quarry never gathers — 890 for 131 people in the mega)
  for (let k = 0; k < 8 && V.cap(f2.id) * 0.95 <= G.Fac.pop(f2.id) * 7.5; k++) if (!sim(() => V.handFound(cap, 'storehouse', Es.n0('storehouse'), { built: true, R: 50 }))) break;
  // (the people's granaries full, as the rule asks — the repartidor's own «fed» —; the most at the quarry in a minute of looks)
  let m = 0, cheio = true; const farto = () => (f2.stock.food || 0) > Math.max(50, G.Fac.pop(f2.id) * 7);
  // (a builder of the gang breaks stone half of the days — by the day and the hash of each, no chance drawn —: two builders can
  // both be out of the half for a day and the next — in the mega of the generation 23 Tiye and Kamose of Karnak, 0,91 and 0,60,
  // then 0,70 and 0,50 —, the one laying a house and the other paving: the looks go on up to three days and a third, until
  // someone breaks stone, T-1138. And in the gods' peace, renewed before it lapses: on the third day an enemy fell on Karnak —
  // the muster, the fight, Tiye dead, Kamose in flight and then in bed —, the very day both were of the half)
  const quebram = new Set(); let vivo = 0; const paz = () => { if (!(S.divinePeace > G.DAY_LEN * 0.25)) sim(() => G.Politics.divinePeace()); };
  // (nor before the gang is whole: the repartidor reaches it by its memory of what the trade asks, half a day's mean — D-210 —,
  // and in the gods' peace Luxor, of the generation 21, had two of its three at 220 s)
  const turmaQ = () => Math.ceil(adultos(s2) * V.GANG_Q);
  for (let k = 0; k < 132 && !(k >= 44 && quebram.size >= 1 && m >= turmaQ()); k++) { paz(); alimenta(cap); if (k % 3 === 0) semMaterial(cap); cheio = cheio && farto(); M.viver(5); vivo += 5; m = Math.max(m, oficio(s2, 'construtor')); for (const v of S.villagers.values()) if (v.set === s2.id && v.role === 'construtor' && v.task && (v.task.type === 'mine' || v.task.type === 'quarry')) quebram.add(v.id); }
  const A2 = adultos(s2), g = Math.ceil(A2 * V.GANG_Q);
  if (!cheio) console.log(`  (g2e: os celeiros do povo não enchem neste mundo — ${Math.round(f2.stock.food || 0)} de comida para ${G.Fac.pop(f2.id)} pessoas, o armazém cabe ${Math.round(V.cap(f2.id))} —: a pedreira do povo só se junta com fartura; sem caso)`);
  else ok('g2e a pedreira do povo', V.stoneKept(f2.id) > 0 && V.quarries(s2) && m >= g && quebram.size >= 1, `${mundo}: ${s2.name}, do povo de ${cap.name}, ${A2} adultos: até ${m} construtores (a turma de 1/12: ${g}), ${quebram.size} deles quebraram pedra em ${vivo} s, enquanto a obra de ${cap.name} guarda ${V.stoneKept(f2.id).toFixed(0)} de pedra`);
  const c3 = checa(); ok('g2g verificador', c3.ok, c3.txt);
});

// ------------------------------ g3: a obra anda, custa e demora o do degrau; o save no meio ------------------------------
run('g3', () => {
  const r = capitalGrande('teatro', 6); if (!ok('g3a a obra grande', !!r, r ? `${r.mundo}, ${r.set.name} (${V.pop(r.set.id)} pessoas): ${lado(r.b)}, a ${r.longe} casas de um armazém` : 'nenhuma capital com lote de 6')) return;
  const { set, b } = r; const st = Es.of(b); const B = Es.bill(b.type, st); const conta = V.bill(b); const T0 = G.BDEF[b.type];
  // (the stone that goes into the work, heard line by line as the ledger writes it: the ledger keeps only its last lines)

  const soma = o => Object.values(o || {}).reduce((a, x) => a + (x || 0), 0);
  ok('g3b a conta e o trabalho do degrau', soma(conta) === soma(B.cost) && V.workOf(b) === B.work && B.work > T0.work && soma(B.cost) > soma(T0.cost), `${b.type} de ${b.w} casas: a conta ${JSON.stringify(conta)} (o degrau: ${JSON.stringify(B.cost)}; o tipo: ${JSON.stringify(T0.cost)}); o trabalho ${V.workOf(b)} (o degrau ${B.work}, o tipo ${T0.work})`);
  // (rock about the work's lot, by the god's hand: the quarry of its gang — the lot the god's hand found may lie far from the town's heart)
  const postas = rochas(set, 12, V.center(b)); comVez(set);
  console.log(`  (g3: a obra a ${Math.round(G.dist(V.center(b)[0], V.center(b)[1], set.cx, set.cy))} casas do meio de ${set.name}; ${postas} rochas postas em volta dela)`);
  // (the stone that goes into the work in its first year, heard line by line; what it had at its founding is its lot's rocks')
  const E1 = escuta(); const tinha0 = (V.bill(b).stone || 0) - (b.need.stone || 0);
  estacoes(set.id, 4);
  E1.fim(); const livro1 = naObra(E1.linhas, b.id); { const q = S.buildings.get(b.id); var rec1 = q && q.type !== 'ruin' ? (V.bill(q).stone || 0) - (q.built ? 0 : q.need.stone || 0) - tinha0 : 0; }
  // (the save in the middle: the same building, the same mark; the same future twice)
  const o1 = S.buildings.get(b.id); const foto = x => (x ? JSON.stringify([x.x, x.y, x.w, x.esc, x.built, +x.progress.toFixed(6), x.need, x.brick, x.troca]) : 'sumiu');
  // (the mark: the turn and the work that keeps the stone — what it keeps is its need less what is on its way in someone's hands,
  // and the hands' tasks do not cross a save: the need itself is in the picture)
  const f1 = foto(o1), m1 = JSON.stringify([set.vez, set.gw]);
  const save = G.Save.serialize(); const fp = () => { const s = JSON.stringify(QA.canon()); let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); };
  const vive = () => { G.Save.apply(JSON.parse(save)); pega(); M.reseed(99); const s2 = S.settlements.get(set.id); const a = [foto(S.buildings.get(b.id)), JSON.stringify([s2.vez, s2.gw])]; M.viver(60); return a.concat([fp()]); };
  const A = vive(), Bv = vive();
  ok('g3c o save no meio', A[0] === f1 && A[1] === m1, `depois do save: ${A[0] === f1 ? 'o mesmo prédio, a mesma conta, o mesmo andamento' : 'MUDOU: ' + A[0] + ' / antes ' + f1}; a marca ${A[1]}${A[1] === m1 ? '' : ' (antes ' + m1 + ')'}`);
  ok('g3d o mesmo save, o mesmo futuro', A[2] === Bv[2], `60 s depois de carregar, duas vezes: ${A[2]} e ${Bv[2]}`);
  const s3 = S.settlements.get(set.id);
  // (the stone that goes into the work from here on, heard line by line — a load starts the ledger's listeners anew)
  const E3 = escuta(); const w3 = S.buildings.get(b.id); const jaTinha = w3 && w3.type !== 'ruin' ? (V.bill(w3).stone || 0) - (w3.built ? 0 : w3.need.stone || 0) : 0;
  const diz = () => { const w = S.buildings.get(b.id); const ff = G.Fac.get(s3.fac); if (VERB) console.log(`  (g3: ano ${S.day}: pedra do povo ${Math.round(ff.stock.stone || 0)}, renda ${Math.round(V.stoneIncome(ff.id))}, a vez ${s3.vez}, gw ${s3.gw}, sem casa ${V.housingInfo(s3.id).homeless}, comida ${Math.round(ff.stock.food)}/${G.Fac.pop(ff.id)} pessoas, rochas perto ${rochasPerto(s3)}, construtores ${oficio(s3, 'construtor')}, mineiros ${oficio(s3, 'mineiro')}; a obra ${w ? w.type + ' ' + JSON.stringify(w.need) + ' ' + Math.round(w.progress * 100) + '% unreach ' + (w.unreach || 0) : 'sumiu'}; outras obras: ${[...S.buildings.values()].filter(q => q.set === s3.id && !q.built && q.type !== 'ruin' && q.id !== b.id).map(q => q.type + ':' + Math.round(q.need.stone || 0)).join(' ')})`); };
  diz(); for (let y = 0; y < 2; y++) { estacoes(s3.id, 4); diz(); }
  // (what it got, by its own bill: what the step costs in stone — less the brick that took its place, V.bill — less what it still
  // waits for; and by the ledger, line by line. A brick that never comes goes back to stone on the way: L-540)
  E3.fim(); const o = S.buildings.get(b.id); const livro = naObra(E3.linhas, b.id); const recebeu = o && o.type !== 'ruin' ? (V.bill(o).stone || 0) - (o.built ? 0 : o.need.stone || 0) - jaTinha : 0;
  ok('g3e três anos de salto', !!o && o.type !== 'ruin' && (o.built || rec1 + recebeu >= 30), `${s3.name}: a obra ${o ? (o.type === 'ruin' ? 'DESTRUÍDA' : o.built ? 'ficou pronta' : `recebeu ${(rec1 + recebeu).toFixed(0)} de pedra (espera ${Math.round(o.need.stone || 0)}; ${Math.round(o.progress * 100)}%)`) : 'SUMIU'}; a vez ${s3.vez}`);
  // (the first year, to the save, and the two after it: the minute each loaded life lived in between is neither's)
  ok('g3f pelo livro', !!o && Math.abs(livro1 - rec1) < 1e-3 && Math.abs(livro - recebeu) < 1e-3 && livro1 + livro > 0, `a pedra que entrou na obra pelo livro: ${livro1.toFixed(0)} no primeiro ano e ${livro.toFixed(0)} nos dois seguintes; o que a conta dela diz que recebeu: ${rec1.toFixed(0)} e ${recebeu.toFixed(0)}`);
  const c = checa(); ok('g3g verificador', c.ok, c.txt);
});

// ------------------------------ g4: sem pedra ------------------------------
run('g4', () => {
  abre(); const set0 = capitais()[0]; const f0 = G.Fac.get(set0.fac);
  // (a people with no stone in store and none coming does not ask for a bigger step: V.affords, D-120)
  semPedra(set0); rico(set0, 0);
  const degraus = Es.choose(set0, 'teatro').filter(st => st.n !== Es.n0('teatro'));
  ok('g4a sem pedra, nem pede', degraus.length > 0 && degraus.every(st => !V.affords(set0, 'teatro', st)) && !V.stoneGate(set0, 'maravilha', 80), `${set0.name}, sem pedra e sem renda: ${degraus.map(st => st.id + '/' + st.n + (V.affords(set0, 'teatro', st) ? ' PAGA' : ' não paga')).join(', ')}; a maravilha ${V.stoneGate(set0, 'maravilha', 80) ? 'PEDIDA' : 'não é pedida'}`);
  rico(set0, 100);
  ok('g4b com a renda de pedra, pede', degraus.some(st => V.affords(set0, 'teatro', st)), `com 100 de pedra ao ano: ${degraus.map(st => st.id + '/' + st.n + (V.affords(set0, 'teatro', st) ? ' paga' : ' não paga')).join(', ')}`);
  // (a great work under way with no stone in store and no rock about: it waits — never let go —, and goes on when the stone comes)
  const r = capitalCom('teatro', 6); if (!ok('g4c a obra grande', !!r, r ? `${r.set.name} (${V.pop(r.set.id)} pessoas): ${lado(r.b)}, a ${r.longe} casas de um armazém` : 'nenhuma capital com lote de 6')) return;
  const { set, b } = r; const f = G.Fac.get(set.fac); const longe = rk => G.dist(rk.x, rk.y, set.cx, set.cy) < 34;
  sim(() => { for (const rk of [...S.rocks.values()]) if (longe(rk)) G.Nature.removeRock(rk); });
  comVez(set); const p0 = b.need.stone || 0; const gente0 = V.pop(set.id);
  const tipo = b.type; const E4 = escuta();
  for (let k = 0; k < 4; k++) { semPedra(set); alimenta(set); M.viver(50); }
  const o = S.buildings.get(b.id); const sem = naObra(E4.linhas, b.id); E4.fim();
  // (a work the world itself takes — a fire, a raid — is no work let go for want of stone: said, and the case ends there)
  if (o && o.type === 'ruin') { console.log(`  (g4d: o mundo destruiu a obra no meio — ${o.origType} virou ruína —; sem caso nesta vida)`); return; }
  ok('g4d a obra espera', !!o && !o.built && o.type === tipo && V.pop(set.id) >= gente0 * 0.7, `um ano sem rocha a menos de 34 casas e o armazém esvaziado quatro vezes: a obra ${o ? 'de pé, à espera de ' + Math.round(o.need.stone || 0) + ' de pedra (recebeu ' + sem.toFixed(0) + ', da pedreira do alto)' : 'LARGADA'}; ${set.name} tinha ${gente0} pessoas, tem ${V.pop(set.id)}`);
  if (o) {
    // (the other works of its people — the town's and its sister towns', whose builders take from the same store — finished by
    // the god's hand, the town fed and housed again: the stone given has one work to go to. With the sisters' works left, Cápua,
    // Óstia and Lavínio took 76 of the 150 in the first days for what they had begun, and the theatre got 8)
    sim(() => { for (const q of [...S.buildings.values()]) if (V.facOfSet(q.set) === f.id && !q.built && q.type !== 'ruin' && q.id !== b.id) V.completeBuilding(q); });
    // (two years by the jump, the town fed each season: a house a family pays for in the meantime comes first — L-313 —, a fire
    // takes the builders a day; then the stone goes to the work)
    comVez(set); pedra(set, 150); const E5 = escuta(); estacoes(set.id, 8);
    const o2 = S.buildings.get(b.id); const com = naObra(E5.linhas, b.id); E5.fim();
    if (VERB) { const sai = {}; for (const e of E5.linhas) if (e[3] === 'f:' + f.id) { const to = String(e[4]); let k = e[8] + ' → ' + to.slice(0, 2); if (to.startsWith('v:')) { const v = S.villagers.get(+to.slice(2)); const st = v && S.settlements.get(v.set); k = e[8] + ' → mãos de ' + (st ? st.name : '?') + (v ? ' (' + v.role + ')' : ''); } sai[k] = (sai[k] || 0) + e[6]; }
      const para = {}; for (const e of E5.linhas) if (String(e[4]).startsWith('o:')) { const q = S.buildings.get(+String(e[4]).slice(2)); const st = q && S.settlements.get(q.set); const k = (q ? q.type + (q.upgradeFrom ? '(melhoria)' : '') + (q.encomenda ? '(paga)' : '') : '?') + ' de ' + (st ? st.name : '?'); para[k] = (para[k] || 0) + e[6]; }
      console.log(`  (g4e: a pedra que entrou em obras: ${Object.keys(para).sort((x, y) => para[y] - para[x]).map(k => Math.round(para[k]) + ' ' + k).join('; ')})`);
      console.log(`  (g4e: a pedra que saiu do armazém do povo em dois anos: ${Object.keys(sai).sort((x, y) => sai[y] - sai[x]).map(k => Math.round(sai[k]) + ' ' + k).join('; ')}; carroças da obra agora: ${(S.carts || []).filter(c => c.obra === b.id).length}; a roda: ${G.Civ.has(f.id, 'roda')}; a vez ${set.vez} gw ${set.gw}; no armazém ${Math.round(f.stock.stone || 0)})`); }
    if (o2 && o2.type === 'ruin') { console.log('  (g4e: o mundo destruiu a obra no meio; sem caso nesta vida)'); return; }
    ok('g4e com a pedra dada, anda', !!o2 && com >= 12 && com > sem, `150 de pedra no armazém do povo, a vez ${set.vez}: em dois anos a obra recebeu ${com.toFixed(0)} pelo livro (no ano sem pedra: ${sem.toFixed(0)})${o2 && o2.built ? ' e ficou pronta' : ''}`);
  }
  const c = checa(); ok('g4f verificador', c.ok, c.txt);
});

// ------------------------------ g5: o degrau erguido de novo ------------------------------
// (a shrine standing with a well on each side of it — public works of the town, that stay: no lot holds it and grows)
function cercado(set, type, stepId) {
  set._noSite = {}; const P = sim(() => V.findSite(set, type, undefined, 4)); set._noSite = {}; if (!P) return null;
  const b = sim(() => V.handFound(set, type, stepId, { x: P[0] + 2, y: P[1] + 2, R: 0, built: true })); if (!b) return null;
  const pts = [[b.x - 1, b.y], [b.x + b.w, b.y + b.h - 1], [b.x, b.y - 1], [b.x + b.w - 1, b.y + b.h]]; let n = 0;
  sim(() => { for (const [x, y] of pts) if (!S.occ[y * G.N + x] && S.type[y * G.N + x] >= G.T.SAND && V.addBuilding('well', x, y, set.id, true)) n++; });
  return n >= 2 ? b : null;
}
run('g5', () => {
  abre();
  // (the capital that justifies a temple of a bigger step and has a free lot of it elsewhere, the most peopled first — one
  // whose biggest step finds no land and a smaller one does, where the world has one: the ladder tried from the biggest to the
  // smallest. A step that opens its room over the town's own houses is the town's too: the proof asks the search alone)
  let set = null, b0 = null, alvo = null; const cands = [];
  const acha = (s, st) => { s._noSite = {}; const p = sim(() => V.findSite(s, 'temple', undefined, st.n) || (V.opens('temple', st) ? V.openSite(s, 'temple', st) : null)); s._noSite = {}; return !!p; };
  for (const s of capitais()) {
    const L = Es.choose(s, 'temple').filter(st => st.n > Es.n0('temple')); if (!L.length) continue;
    const livre = L.find(st => acha(s, st)); if (livre) cands.push([s, livre, livre !== L[0] ? 0 : 1]);
  }
  cands.sort((a, c) => a[2] - c[2]);
  for (const [s, livre] of cands) { const b = cercado(s, 'temple', 'santuario'); if (!b) continue; set = s; b0 = b; alvo = livre; break; }
  if (!ok('g5a o santuário sem espaço em volta', !!set, set ? `${set.name} (${V.pop(set.id)} pessoas, nível ${set.tier}) justifica ${Es.choose(set, 'temple').map(st => st.id + '/' + st.n).join(' > ')}; ${lado(b0)} com poços dos lados` : 'nenhuma capital justifica um templo maior com lote livre')) return;
  const fac = G.Fac.get(set.fac); civicas(set); rico(set, 120); pedra(set, 100);
  const cresce = Es.choose(set, 'temple').filter(st => st.n > b0.w).every(st => !V.growLot(set, b0, st));
  let hi = marca(); const templos0 = [...S.buildings.values()].filter(o => o.set === set.id && o.type === 'temple').length;
  // (the town's other temples, standing, would be the ones to grow: the proof's is the biggest only if none is bigger — else it
  // takes them away, by the game's door)
  sim(() => { for (const o of [...S.buildings.values()]) if (o.set === set.id && o.type === 'temple' && o.id !== b0.id) V.removeBuilding(o); });
  // (e as outras obras públicas da cidade que subiriam um degrau antes dele vão primeiro, como o jogo as tem: o V.grow olha os
  // prédios na ordem em que foram fundados, uma obra grande de cada vez (D-175) — na metrópole da geração 20 a Pedra do Sol de
  // 8 m de Tenochtitlan, mais velha que o santuário da prova e também sem espaço em volta, foi erguida de novo com 16 m antes do
  // templo, e a prova julgava o monumento como se fosse o templo. Cada uma que o planejador ergue antes da da prova fica pronta
  // pela mão do deus, e o degrau do templo é pedido de novo com o chão como ela o deixou. T-1012)
  // (the step asked again with the ground as the planner will find it: where a temple taken away stood, a lot the work levels
  // may hold a bigger step — D-217)
  const antes = alvo; let nb = null; const primeiro = [];
  for (let k = 0; k < 8; k++) {
    alvo = Es.choose(set, 'temple').filter(st => st.n > b0.w).find(st => acha(set, st)) || alvo;
    hi = marca(); set._noSite = {}; const q = sim(() => V.grow(set, fac, V.counts(set.id)));
    if (!q || q.type === 'temple') { nb = q; break; }
    primeiro.push(lado(q)); sim(() => V.completeBuilding(q)); civicas(set);
  }
  if (alvo !== antes) console.log(`  (g5: sem os outros templos${primeiro.length ? ' e com as obras que vieram antes de pé' : ''}, o maior degrau com terra passou de ${antes.id}/${antes.n} a ${alvo.id}/${alvo.n})`);
  const velho = S.buildings.get(b0.id); const fora = nb && (nb.x + nb.w <= b0.x || nb.x >= b0.x + b0.w || nb.y + nb.h <= b0.y || nb.y >= b0.y + b0.h);
  ok('g5b erguido de novo, noutro lugar', cresce && !!nb && nb.id !== b0.id && nb.type === 'temple' && nb.w === alvo.n && !nb.built && fora && !!velho && velho.built && velho.w === 2 && !velho.amp,
    `em volta ${cresce ? 'não há lote para crescer' : 'HAVIA lote'} (${templos0} templos antes)${primeiro.length ? `; antes dele, na ordem do jogo, ${primeiro.length === 1 ? 'a obra grande' : 'as obras grandes'} de ${set.name} que o planejador ergueu, de pé pela mão do deus: ${primeiro.join('; ')}` : ''}; V.grow: ${lado(nb)}${nb ? ', em obra' : ''}; o antigo ${velho ? lado(velho) + (velho.built ? ', de pé' : ', EM OBRA') : 'SUMIU'}`);
  if (!nb) return;
  const B = Es.bill('temple', alvo); const soma = o => Object.values(o || {}).reduce((a, x) => a + (x || 0), 0);
  // (the work of the step, and the earth its lot had to move, where the ground was levelled for it: D-217)
  const terra = nb.terra || 0;
  ok('g5c o maior degrau que acha terra, com a conta dele', nb.esc === alvo.id && soma(V.bill(nb)) === soma(B.cost) && Math.abs(V.workOf(nb) - (B.work + terra * V.EARTH)) < 1e-9 && G.W.slope(nb.x, nb.y, nb.w, nb.h) <= V.PODIUM + 1e-9,
    `o degrau ${nb.esc} (${nb.w * 4} m): a conta ${JSON.stringify(V.bill(nb))}, o trabalho ${V.workOf(nb)} (o do degrau ${B.work}${terra ? `, mais ${terra} de terra aplainada` : ''}); o relevo do lote ${(G.W.slope(nb.x, nb.y, nb.w, nb.h) * 1.5).toFixed(2)} m`);
  const L = linhas(hi, /não havia espaço para crescer/);
  ok('g5d a crônica', L.length === 1, L.length ? `«${L[0].txt}»` : 'nenhuma linha');
  // (one great work at a time: nothing more while it goes up)
  set._noSite = {}; const de_novo = sim(() => V.grow(set, fac, V.counts(set.id)));
  ok('g5e uma obra grande de cada vez', !de_novo, `com o templo novo em obra, V.grow: ${de_novo ? lado(de_novo) : 'nada'}`);
  // (it stands: the step is raised once — the old one does not ask for it again)
  sim(() => V.completeBuilding(nb)); civicas(set); set._noSite = {};
  const outra = sim(() => V.grow(set, fac, V.counts(set.id))); const iguais = [...S.buildings.values()].filter(o => o.set === set.id && o.type === 'temple' && o.w === nb.w).length;
  ok('g5f cada degrau uma vez', iguais === 1 && (!outra || outra.type !== 'temple' || outra.w > nb.w), `pronto o templo de ${nb.w * 4} m: templos desse degrau na cidade: ${iguais}; V.grow depois: ${outra ? lado(outra) : 'nada'}`);
  const c = checa(); ok('g5g verificador', c.ok, c.txt);
  salva(); const c2 = checa(); ok('g5h depois do save', c2.ok && !!S.buildings.get(nb.id) && S.buildings.get(nb.id).w === nb.w && !!S.buildings.get(b0.id), c2.txt);
});
run('g5t', () => {
  // (the two rules that hold back a town with land to spare — one great work at a time, each step once —, in the first ready
  // world with a capital that raises a step anew by itself, as the world has it: what waited while the first went up is what
  // the planner raises when it stands, and of a type no step is raised anew after a bigger one)
  let caso = null;
  busca: for (const wd of MUNDOS) { abre(wd); for (const s of capitais()) {
    const fac = G.Fac.get(s.fac); civicas(s); rico(s, 400); pedra(s, 300); s._noSite = {};
    const r1 = sim(() => V.grow(s, fac, V.counts(s.id))); if (r1 && !r1.built && !r1.amp) { caso = { set: s, fac, r1, mundo: wd }; break busca; }
  } }
  if (!caso) { console.log('  (g5t: em nenhum mundo pronto uma capital ergue sozinha um degrau de novo: sem caso)'); return; }
  const { set, fac, r1, mundo } = caso; const novas = [{ type: r1.type, w: r1.w, txt: lado(r1) }];
  set._noSite = {}; const junto = sim(() => V.grow(set, fac, V.counts(set.id)));
  let r = null; const depois = () => { civicas(set); set._noSite = {}; r = sim(() => V.grow(set, fac, V.counts(set.id))); if (r && !r.amp) novas.push({ type: r.type, w: r.w, txt: lado(r) }); return r; };
  sim(() => V.completeBuilding(r1)); const r2 = depois();
  if (!r2) console.log(`  (g5t: ${mundo}, ${set.name}: pronto ${lado(r1)}, nada mais cresceria — a regra de uma obra de cada vez não é o que segura aqui: sem caso)`);
  else ok('g5ta uma obra grande de cada vez, seja qual for', !junto, `${mundo}, ${set.name}: com ${lado(r1)} em obra, V.grow: ${junto ? lado(junto) : 'nada'}; pronta ela, V.grow: ${lado(r2)} — era o que esperava a vez`);
  for (let k = 0; k < 10 && r; k++) { const q = r; sim(() => V.completeBuilding(q)); depois(); }
  const volta = novas.filter((a, i) => novas.some((b, j) => j < i && b.type === a.type && b.w >= a.w));
  ok('g5tb cada degrau uma vez', !r && !volta.length, `erguidos de novo até a cidade não ter o que crescer: ${novas.map(q => q.txt).join('; ')}; de um mesmo tipo, depois de um degrau, outro igual ou menor: ${volta.map(q => q.txt).join('; ') || 'nenhum'}`);
  const c = checa(); ok('g5tc verificador', c.ok, c.txt);
});
run('g5m', () => {
  // (never a second wonder: a people's wonder standing with no room round it, in a town that would justify the colossal one — the
  // proof holds the town's rank and its head count, as M.semMoeda holds the door of the arts)
  abre(); const st13 = Es.steps('maravilha').find(q => q.n === 13); let set = null, w = null, lote = false, mundo = MUNDO;
  const colosso = (s, fn) => { const pop0 = V.pop, t0 = s.tier; V.pop = id => (id === s.id ? 320 : pop0(id)); s.tier = 5; try { return fn(); } finally { V.pop = pop0; s.tier = t0; } };
  const poe = s => { const b = sim(() => V.handFound(s, 'maravilha', 'maravilha', { R: 60, built: true })); if (!b) return null;
    sim(() => { for (const [x, y] of [[b.x - 1, b.y], [b.x + b.w, b.y + b.h - 1], [b.x, b.y - 1], [b.x + b.w - 1, b.y + b.h]]) if (!S.occ[y * G.N + x] && S.type[y * G.N + x] >= G.T.SAND) V.addBuilding('well', x, y, s.id, true); }); return b; };
  const lote13 = s => colosso(s, () => { s._noSite = {}; const p = sim(() => V.findSite(s, 'maravilha', undefined, 13) || (V.opens('maravilha', st13) ? V.openSite(s, 'maravilha', st13) : null)); s._noSite = {}; return !!p; });
  const sabe = s => !!st13 && Es.can('maravilha', G.Civ.idOfFac(s.fac) || 'classico', 13);
  // (the first ready world with a capital where the colossal one would find land with the wonder standing: there only the
  // rule holds it back; with none, the first capital with a lot for the wonder — no land for a second one anyway)
  // (the free dry ground of 13 × 13 tiles nearest a town — no building, wall, highway nor water on it: the land the proof hands
  // the planner where the rules find none; its relief and its streets are the rules' matter, not the proof's)
  const chao13 = s => { const N = G.N; let best = null;
    for (let y = 3; y + 13 <= N - 3; y++) for (let x = 3; x + 13 <= N - 3; x++) {
      const d = G.dist(x + 6.5, y + 6.5, s.cx, s.cy); if (d > 70 || (best && d >= best[2])) continue; let livre = true;
      for (let ty = y; ty < y + 13 && livre; ty++) for (let tx = x; tx < x + 13; tx++) { const i = ty * N + tx; if (S.type[i] < G.T.SAND || S.type[i] === G.T.RIVER || S.occ[i] || S.wall[i] || S.road[i] >= 3) { livre = false; break; } }
      if (livre) best = [x, y, d];
    }
    return best; };
  let chao = null;
  busca: for (const wd of MUNDOS) { abre(wd); for (const s of capitais()) { if (!sabe(s)) continue; const b = poe(s); if (!b) continue; if (lote13(s)) { set = s; w = b; lote = true; mundo = wd; break busca; } if (!chao && chao13(s)) chao = [wd, s.id]; sim(() => V.removeBuilding(b)); } }
  if (!set) { abre(chao ? chao[0] : undefined); if (chao) mundo = chao[0]; for (const s of capitais()) { if (!sabe(s) || (chao && s.id !== chao[1])) continue; const b = poe(s); if (b) { set = s; w = b; break; } } }
  if (!ok('g5m a maravilha de pé', !!set, set ? `${mundo}, ${set.name}: ${lado(w)}; lote para uma colossal de 13 casas: ${lote ? 'há' : 'em nenhum mundo pronto (sem terra, nada a provar da regra)'}` : 'nenhuma capital com lote de 10 e povo que saiba a colossal')) return;
  const fac = G.Fac.get(set.fac);
  colosso(set, () => {
    const quer = Es.choose(set, 'maravilha')[0]; civicas(set); rico(set, 400); pedra(set, 300);
    const conta = () => [...S.buildings.values()].filter(o => o.type === 'maravilha').length; const antes = conta(); const feitas = [];
    // (asked again and again, each work it begins finished by the proof's hand, until the town has nothing left to grow: the
    // wonder's turn comes, with no room round it — and it is never raised anew)
    for (let k = 0; k < 12; k++) { set._noSite = {}; const r = sim(() => V.grow(set, fac, V.counts(set.id))); if (!r) break; feitas.push(lado(r)); if (r.type === 'maravilha') break; sim(() => V.completeBuilding(r)); civicas(set); }
    const depois = conta();
    // (and with land for the colossal one: a free dry lot of 13 handed to the planner in its search's place — no ready world has
    // one beside a wonder that stands, T-767 —, the wonder's turn the only one left: the rule alone holds it back)
    const dado = chao13(set);
    if (!dado) console.log(`  (g5n2: nenhum chão seco e livre de 13 × 13 casas até 70 de uma capital, em nenhum mundo pronto: sem caso)`);
    else {
      const fs0 = V.findSite; V.findSite = function (s, t, reach, n) { return s === set && t === 'maravilha' && n === 13 ? [dado[0], dado[1]] : fs0.apply(this, arguments); };
      let r2 = null; try { set._noSite = {}; r2 = sim(() => V.grow(set, fac, V.counts(set.id))); } finally { V.findSite = fs0; }
      ok('g5n2 nunca outra maravilha, com terra para ela', quer.n === 13 && conta() === antes && (!r2 || r2.type !== 'maravilha'), `um chão livre de 13 × 13 em ${dado[0]},${dado[1]}, a ${Math.round(dado[2])} casas do meio, dado à busca do planejador: V.grow ${r2 ? lado(r2) : 'nada'}; maravilhas no mundo: ${antes} → ${conta()}`);
    }
    ok('g5n nunca outra maravilha', quer.n === 13 && depois === antes && feitas.length < 12,`${set.name} justificaria ${quer.id}/${quer.n}; sem espaço em volta da de 10, V.grow até não ter o que crescer: ${feitas.join('; ') || 'nada'}; maravilhas no mundo: ${antes} → ${depois}`);
  });
});
run('g5v', () => {
  // (a village does not: below a vila the planner raises no bigger step, whatever its stone)
  abre(); const vila = [...S.settlements.values()].filter(s => G.Fac.get(s.fac) && (s.tier || 0) < 2 && V.pop(s.id) >= 6).sort((a, c) => V.pop(c.id) - V.pop(a.id) || a.id - c.id)[0];
  if (!ok('g5v a vila', !!vila, vila ? `${vila.name}: nível ${vila.tier || 0}, ${V.pop(vila.id)} pessoas` : 'nenhuma aldeia neste mundo')) return;
  const fac = G.Fac.get(vila.fac); const b = cercado(vila, 'temple', 'santuario') || sim(() => V.handFound(vila, 'temple', 'santuario', { built: true, R: 30 }));
  rico(vila, 200); pedra(vila, 300); civicas(vila);
  const r = sim(() => V.grow(vila, fac, V.counts(vila.id))); const n0 = S.buildings.size; const ids = new Set(S.buildings.keys());
  for (let k = 0; k < 6; k++) { alimenta(vila); M.viver(10); }
  const novos = [...S.buildings.values()].filter(o => !ids.has(o.id) && o.set === vila.id && grande(o));
  ok('g5w uma vila não', !!b && !r && !novos.length, `${vila.name} com 300 de pedra e um santuário: V.grow ${r ? lado(r) : 'nada'}; em 60 s, obras grandes começadas: ${novos.length} (${n0} → ${S.buildings.size} prédios)`);
});

// ------------------------------ g6: a maravilha do campo guardado primeiro ------------------------------
run('g6', () => {
  // (a capital with its kept lot as the world has it; with none, one armed by the guard of the proofs — guarda-lib.js)
  // (no primeiro mundo pronto que tenha uma (MUNDOS); sem nenhuma em nenhum, a armada pela guarda das provas no mundo da prova. Na
  // metrópole da geração 20 Roma e Tenochtitlan têm a sua maravilha — de pé e em obra — e Argos, Mênfis e Hedeby largaram o
  // campo pela terra: em volta delas não sobra o chão de 16 casas com o anel e a rampa, nem para o deus aplainar — «nenhuma
  // capital guardou um campo»; a guerra mundial tem duas que guardam. T-1013)
  const { guarda } = require('./guarda-lib.js'); let g = null;
  for (const w of MUNDOS) { abre(w); g = guarda(G); if (g) { g.mundo = w; break; } }
  if (!g) { abre(); g = guarda(G, { provoca: 1 }); if (g) g.mundo = MUNDO; }
  const set = g && S.settlements.get(g.set); const r0 = set && V.reserva(set);
  if (!ok('g6a o campo guardado', !!r0, r0 ? `${g.mundo}, ${set.name} guarda ${r0.n}×${r0.n} para ${r0.type} (${g.provocado ? 'o chão aplainado pela prova' : 'a terra como estava'})` : `nenhuma capital guardou um campo (${MUNDOS.join(', ')})`)) return;
  if (r0.type !== 'maravilha') { console.log(`  (g6: o campo é de ${r0.type}; a regra é da maravilha — sem caso neste mundo)`); return; }
  const fac = G.Fac.get(set.fac);
  // (what the planner asks of a capital to wish its wonder — city.js —: the arts, the people, the stone; and a town that still
  // wishes its baths, so that the wonder would wait behind them)
  sim(() => { for (const t of ['alvenaria', 'engenharia']) if (!G.Civ.has(fac.id, t)) G.Civ.learn(fac, t); fac._wonder = 0; });
  sim(() => { for (const o of [...S.buildings.values()]) if (o.set === set.id && (o.type === 'banhos' || o.type === 'maravilha')) V.removeBuilding(o); });
  sim(() => { for (const o of [...S.buildings.values()]) if (o.type === 'maravilha' && V.facOfSet(o.set) === fac.id) V.removeBuilding(o); });
  // (the buildings there were before the town is made ready: the planner may ask the wonder in the seconds the proof's hand
  // feeds and houses the town — in the metrópole of the generation 23 Tenochtitlan founded it then, and the case, counting
  // from after, saw no new wonder, T-1139)
  const ids = new Set(S.buildings.keys()); let mar = null;
  const nova = () => [...S.buildings.values()].find(o => o.set === set.id && o.type === 'maravilha' && !ids.has(o.id)) || null;
  civicas(set); rico(set, 150); pedra(set, 200); comVez(set); mar = nova();
  // (the people's stone income as the ledger counts it — f.pedra —, held high by the proof at each look: only the wish is at stake)
  // (and its timber: the planner opens no new work with less than a third of its wood in store)
  for (let k = 0; k < 40 && !mar; k++) { alimenta(set); rico(set, 150); if ((fac.stock.wood || 0) < 60) D.make('f:' + fac.id, 'wood', 90, { code: 'teste' }); obrasMenos(set, 'maravilha'); M.viver(4); mar = nova(); }
  if (VERB && !mar) {
    const r = V.reserva(set) || r0; const N = G.N, T = G.T; const why = [];
    if (r) {
      let streets = 0;
      for (let ty = r.y - 1; ty <= r.y + r.n; ty++) for (let tx = r.x - 1; tx <= r.x + r.n; tx++) {
        const i = ty * N + tx; const inLot = tx >= r.x && tx < r.x + r.n && ty >= r.y && ty < r.y + r.n; const o = S.occ[i] ? S.buildings.get(S.occ[i]) : null;
        if (inLot) { if (S.type[i] < T.SAND) why.push('água'); if (S.wall[i]) why.push('muro'); if (S.road[i] >= 3) why.push('estrada'); if (S.fire[i] > 0) why.push('fogo'); if (o) why.push('prédio ' + o.type + (o.set === set.id ? '' : ' de outra')); if (S.road[i] || (G.City && G.City.onStreet(set, i))) streets++; }
        else { if (S.type[i] >= T.SAND && S.cliff[i]) why.push('penhasco no anel'); if (o && o.blocks) why.push('prédio no anel ' + o.type); }
      }
      why.push(`relevo ${G.W.slope(r.x, r.y, r.n, r.n).toFixed(2)} (pódio ${V.PODIUM})`, `ruas no lote ${streets}`, `religa ${streets ? V.relinks(set, r.x, r.y, r.n, null) : '-'}`, `alcança ${V.siteReached(set, r.x, r.y, { w: r.n, h: r.n })}`, `resSite ${JSON.stringify(sim(() => V.resSite(set, 'maravilha', r.n)))}`, `falhas ${set.fails}`);
    }
    console.log('  (g6, o campo: ' + [...new Set(why)].join('; ') + ')');
    const c = V.counts(set.id); console.log(`  (g6: nível ${set.tier}, capital ${G.Fac.capitalOf(fac.id) === set}, _wonder ${fac._wonder}, maravilhas do povo ${[...S.buildings.values()].filter(o => o.type === 'maravilha' && V.facOfSet(o.set) === fac.id).length}, alvenaria ${G.Civ.has(fac.id, 'alvenaria')}, engenharia ${G.Civ.has(fac.id, 'engenharia')}, civ ${fac.civ}, gente do povo ${G.Fac.pop(fac.id)}, stoneGate ${V.stoneGate(set, 'maravilha', 80)}, pedra ${Math.round(fac.stock.stone)}, renda ${V.stoneIncome(fac.id)}, obras ${JSON.stringify(c.siteTypes)}, sites ${c.sites}, reserva ${JSON.stringify(V.reserva(set))} ${JSON.stringify(set.urb && set.urb.resGone)}, guarda ${G.City.saving(set, fac)}, gente ${V.pop(set.id)})`); }
  const antes = mar ? [...S.buildings.values()].filter(o => !ids.has(o.id) && o.set === set.id && o.id < mar.id && G.BDEF[o.type] && G.BDEF[o.type].civic && o.type !== 'praca' && o.type !== 'mercado' && o.type !== 'celeiro' && o.type !== 'doca') : [];
  const noLote = mar && mar.x >= r0.x && mar.y >= r0.y && mar.x + mar.w <= r0.x + r0.n && mar.y + mar.h <= r0.y + r0.n;
  ok('g6b a maravilha primeiro, no campo guardado', !!mar && noLote && !antes.length && mar.w >= 10, mar ? `${set.name} fundou ${lado(mar)} ${noLote ? 'no campo guardado' : 'FORA do campo'}; obras cívicas que não são de viver começadas antes dela: ${antes.map(o => o.type).join(', ') || 'nenhuma'}` : `em 160 s ${set.name} não pediu a maravilha (as cívicas novas: ${[...S.buildings.values()].filter(o => !ids.has(o.id) && o.set === set.id && G.BDEF[o.type] && G.BDEF[o.type].civic).map(o => o.type).join(', ') || 'nenhuma'})`);
  const c = checa(); ok('g6c verificador', c.ok, c.txt);
});
// (the works of the town that are not the one awaited, finished by the god's hand: one great civic work at a time, and no more
// works at once than the town's builders take — V.plan, maxSites: Roma of the mundial of the generation 21, 43 people, with a
// mine, a weaving house, a forge and a house under way — four, its whole share —, planned nothing in 160 s, the wonder among
// it, T-1101)
function obrasMenos(set, menos) { sim(() => { for (const o of [...S.buildings.values()]) if (o.set === set.id && !o.built && o.type !== 'ruin' && o.type !== menos) V.completeBuilding(o); }); }

// ------------------------------ g7: a guerra no meio ------------------------------
run('g7', () => {
  abre(); const r = capitalCom('teatro', 6); if (!ok('g7a a obra grande', !!r, r ? `${r.set.name} (${V.pop(r.set.id)} pessoas): ${lado(r.b)}, a ${r.longe} casas de um armazém` : 'nenhuma capital com lote de 6')) return;
  const { set, b } = r; const velho = G.Fac.get(set.fac); pedra(set, 80); comVez(set);
  const outro = G.Fac.all().filter(f => f.alive && f.id !== velho.id).sort((a, c) => G.Fac.pop(c.id) - G.Fac.pop(a.id) || a.id - c.id)[0];
  if (!ok('g7b a marca antes', set.gw === b.id && !!outro, `${set.name} de ${velho.name}: set.gw ${set.gw}, a obra guarda ${V.keeps(set).toFixed(0)}; o outro povo: ${outro ? outro.name : 'nenhum'}`)) return;
  sim(() => G.War.conquer(set, { fac: outro.id, loot: { food: 0, wood: 0, stone: 0 }, members: [], captives: [], campaign: null }));
  const o = S.buildings.get(b.id); const kv = V.stoneKept(velho.id);
  ok('g7c a cidade tomada', set.fac === outro.id && kv === 0, `${set.name} agora é de ${G.Fac.get(set.fac).name}; o povo de antes guarda ${kv.toFixed(0)} de pedra para a obra que perdeu; a obra ${o ? (o.type === 'ruin' ? 'virou ruína' : 'continua, de ' + G.Fac.get(V.facOfSet(o.set)).name) : 'foi desfeita'}`);
  for (let y = 0; y < 1; y++) { alimenta(set); M.saltar(1); }
  const c = checa(); ok('g7d um ano depois, verificador', c.ok, c.txt);
  salva(); const c2 = checa(); ok('g7e depois do save', c2.ok, c2.txt);
});

// ------------------------------ g9: a resistência do degrau (L-784) ------------------------------
// (a step bigger than the type's own stands what its lot is: a theatre of 24 m had the strength of one of 12, and the fire took
// it as fast. Founded by the planner's door, enlarged in place, the enlargement given up, the save — and the same blow to a
// theatre of each size)
run('g9', () => {
  abre(); const set = capitais()[0]; const def = G.BDEF.teatro, n0 = Es.n0('teatro');
  const p6 = sim(() => { set._noSite = {}; return V.findSite(set, 'teatro', undefined, 6); }); const st6 = Es.steps('teatro').find(q => q.n === 6);
  const b6 = p6 && st6 ? sim(() => V.startProject(set, 'teatro', p6, st6)) : null;
  const b3 = sim(() => V.handFound(set, 'teatro', Es.steps('teatro').find(q => q.n === n0).id, { R: 60 }));
  if (!ok('g9a o teatro de cada tamanho', !!b6 && !!b3 && b6.w === 6 && b3.w === n0, `${set.name}: ${lado(b6)} e ${lado(b3)}`)) return;
  const quer = Math.round(def.hp * 36 / (n0 * n0));
  ok('g9b a resistência pelo lote', b6.maxHp === quer && b6.hp === quer && b3.maxHp === def.hp && b3.hp === def.hp && V.hpOf('teatro', 6) === quer && V.hpOf('teatro', n0) === def.hp, `o teatro de ${n0 * 4} m: ${b3.hp} (o do tipo: ${def.hp}); o de 24 m: ${b6.hp} (${def.hp} × 36 / ${n0 * n0} = ${quer})`);
  // (the same blow, a little more than the small one stands: the small falls, the big stands. The siege's stones: the fire on a
  // great work stops at what is not timber in it — D-219, qa/fogo-pedra.js —, and would not show the strength by the lot)
  sim(() => { V.damageBuilding(b3, def.hp + 1, 'siege'); V.damageBuilding(b6, def.hp + 1, 'siege'); });
  const o3 = S.buildings.get(b3.id), o6 = S.buildings.get(b6.id);
  ok('g9c o mesmo golpe', (!o3 || o3.type === 'ruin') && !!o6 && o6.type === 'teatro' && Math.abs(o6.hp - (quer - def.hp - 1)) < 1e-6, `${def.hp + 1} de dano do cerco em cada um: o de ${n0 * 4} m ${!o3 ? 'saiu do mapa' : o3.type === 'ruin' ? 'virou ruína' : 'DE PÉ'}; o de 24 m ${o6 && o6.type === 'teatro' ? 'de pé com ' + o6.hp + ' de ' + o6.maxHp : 'CAIU'}`);
  // (enlarged in place: the strength grows with the lot, what it had lost kept lost; given up: back to what it was)
  let cresceu = null;
  for (const o of [...S.buildings.values()].filter(q => q.built && q.type !== 'ruin' && pub(q.type) && q.set === set.id).sort((a, c) => a.id - c.id)) {
    for (const st of Es.steps(o.type).filter(q => q.n > o.w && !q.familia).reverse()) { const pos = sim(() => V.growLot(set, o, st)); if (pos) { cresceu = { o, st, pos }; break; } }
    if (cresceu) break;
  }
  if (cresceu) {
    const { o, st, pos } = cresceu; const d0 = G.BDEF[o.type].hp, antes = V.hpOf(o.type, o.w), w0 = o.w; sim(() => { o.hp = o.maxHp = antes; V.damageBuilding(o, 30, 'riot'); });
    sim(() => V.enlarge(o, st, pos)); const m1 = V.hpOf(o.type, st.n); const okCresce = o.w === st.n && o.maxHp === m1 && Math.abs(o.hp - (m1 - 30)) < 1e-6;
    const cresc = `${o.hp} de ${o.maxHp}`; salva(); const o2 = S.buildings.get(o.id); const okSave = !!o2 && o2.maxHp === m1 && Math.abs(o2.hp - (m1 - 30)) < 1e-6; const salvo = o2 ? `${o2.hp} de ${o2.maxHp}` : 'SUMIU';
    sim(() => V.ungrow(o2)); const okVolta = o2.w === w0 && o2.maxHp === antes && Math.abs(o2.hp - (antes - 30)) < 1e-6;
    ok('g9d ampliado, salvo, desistido', okCresce && okSave && okVolta, `${o.type} de ${w0} para ${st.n} casas (o do tipo: ${d0}), com 30 de dano: ampliado, ${cresc} (o do lote: ${m1}); depois do save ${salvo}; desistida a ampliação, ${o2.hp} de ${o2.maxHp} (o de antes: ${antes})`);
  } else console.log('  (g9d: nenhum prédio público da capital tem lote para crescer no lugar; sem caso)');
  const c = checa(); ok('g9e verificador', c.ok, c.txt);
});

// ------------------------------ g8: o mundo crescido pelo salto, do zero ------------------------------
run('g8', () => {
  const SEMENTES = (process.env.SEMENTES || '41,7').split(',').map(Number); const ANOS = +(process.env.ANOS || 90); const res = [];
  for (const seed of SEMENTES) {
    M.novo({ seed, type: 'continente', size: 128, tribes: 4 }); pega();
    // (what the planner founds and enlarges by itself, with the town it was founded in as it was then)
    const fundadas = []; const sp0 = V.startProject, en0 = V.enlarge;
    V.startProject = function (set, type, at, given) { const b = sp0.apply(this, arguments); if (b && grande(b)) fundadas.push({ id: b.id, type: b.type, n: b.w, set: b.set, tier: (S.settlements.get(b.set) || {}).tier || 0, pop: V.pop(b.set), day: S.day }); return b; };
    V.enlarge = function (b, st) { const r = en0.apply(this, arguments); if (r) fundadas.push({ id: r.id, type: r.type, n: r.w, set: r.set, tier: (S.settlements.get(r.set) || {}).tier || 0, pop: V.pop(r.set), day: S.day, amp: 1 }); return r; };
    try { M.saltar(ANOS); } finally { V.startProject = sp0; V.enlarge = en0; }
    const prontas = fundadas.filter(q => { const b = S.buildings.get(q.id); return b && b.built && b.type === q.type && b.w === q.n; });
    const c = checa();
    res.push({ seed, fundadas, prontas, c, gente: S.villagers.size, t3: [...S.settlements.values()].filter(s => (s.tier || 0) >= 3).length });
    console.log(`  semente ${seed}, ano ${S.day}: ${S.villagers.size} pessoas, ${res[res.length - 1].t3} cidades de nível 3+; degraus grandes fundados pelo planejador: ${fundadas.map(q => `${q.type}/${q.n}${q.amp ? ' (ampliado)' : ''} no ano ${q.day} (nível ${q.tier}, ${q.pop} pessoas)`).join('; ') || 'nenhum'}; de pé: ${prontas.map(q => q.type + '/' + q.n).join(', ') || 'nenhum'} (${ms()} ms)`);
  }
  const todas = res.flatMap(r => r.fundadas), prontas = res.flatMap(r => r.prontas);
  // (a step of 24 m or more standing, and a big step standing in every world: with the code of before, the same two worlds in
  // the same 90 years founded three big steps and had one standing — a temple of 16 m —, and nothing of 24 m: the block M)
  ok('g8a uma capital ergue sozinha um degrau grande', prontas.some(q => q.n >= 6) && res.every(r => r.prontas.length > 0), `em ${SEMENTES.length} mundos do zero, ${ANOS} anos de salto, sem a mão do deus: ${todas.length} degraus grandes fundados, ${prontas.length} de pé (${prontas.map(q => q.type + ' de ' + q.n * 4 + ' m').join(', ') || 'nenhum'}); pelo menos um de 24 m ou mais, e algum em cada mundo`);
  ok('g8b nenhuma vila', todas.every(q => q.tier >= 2) && todas.filter(q => q.n >= 6).every(q => q.tier >= 3), `o nível da cidade ao fundar: ${todas.map(q => q.type + '/' + q.n + ' nível ' + q.tier).join(', ') || '—'} (um degrau grande só numa vila ou mais; de 6 casas para cima, só numa cidade)`);
  ok('g8c verificador e erros', res.every(r => r.c.ok), res.map(r => `semente ${r.seed}: ${r.c.txt}`).join(' · '));
});

console.log(fails.length ? `DEGRAUS: FALHOU (${fails.join(', ')})` : `DEGRAUS: ok (${ms()} ms)`);
process.exit(fails.length ? 1 : 0);
