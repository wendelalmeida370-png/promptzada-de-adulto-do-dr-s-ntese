// degraus: os degraus grandes nascem sozinhos (Bairros Vivos, o agente M; D-174, D-175, D-176), em Node. O que se media antes
// (qa/patch3/bloco-M.md): nos mundos prontos da geração 19 a obra grande ficava décadas sem pedra — o palácio de Tenochtitlan
// 21 anos sem nenhuma das 210, o teatro de Roma 21, o palácio de Argos 25 —, e com uma obra grande de cada vez nada maior
// começava; nenhum prédio de antes achava onde crescer; a maravilha era o último desejo da capital. As provas:
//   g1  a pedra da obra grande (D-174): a marca do planejador (set.gw, com a vez), o que ela guarda (V.keeps, V.stoneKept), o que
//       sobra para o calçamento e as carroças (V.stoneSpare), nenhuma casa de pé melhorada; com um adulto sem casa a vez acaba e
//       a pedra volta a ser de todos
//   g2  os braços (D-174): o construtor sem nada para assentar quebra a pedra que as obras esperam; a turma da obra grande
//       (V.GANG dos adultos) e a pedreira do povo nas outras cidades (V.GANG_Q)
//   g3  a obra anda no salto: em 3 anos a obra grande recebe a sua pedra pelo livro; custa e demora o do degrau (G.Escala.bill,
//       V.workOf); o save no meio (o mesmo prédio, a mesma marca, o mesmo futuro duas vezes)
//   g4  sem pedra: o povo sem renda nem estoque não pede o degrau grande; a obra em curso, sem pedra nem rocha, espera sem ser
//       largada — e anda quando a pedra chega
//   g5  o degrau erguido de novo (D-175): sem espaço em volta, o degrau maior nasce noutro lugar e o antigo fica; do maior para o
//       menor; uma obra grande de cada vez; cada degrau uma vez; nunca outra maravilha; uma vila não
//   g6  a maravilha do campo guardado vem antes de qualquer outra obra grande (D-176)
//   g7  a guerra no meio: a cidade tomada com a obra grande em curso — a obra e a marca passam ao novo povo, nada preso
//   g8  o mundo crescido pelo salto, do zero (duas sementes): uma capital ergue sozinha um degrau grande, e nenhuma vila
//   node qa/degraus.js            (ONLY=g1,g5 só esses; VERB=1 conta mais; MUNDO=mega outro mundo pronto para g1–g7)
'use strict';
process.chdir(__dirname);
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['qa/degraus-inv.js'] });
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
function capitalCom(type, stepId, quer, perto) {
  const n = Es.steps(type).find(q => q.id === stepId || q.n === stepId).n; const cands = [];
  for (const set of capitais()) {
    if ((quer && !quer(set)) || emObra(set).length || V.pop(set.id) < 30) continue;
    set._noSite = {}; const p = sim(() => V.findSite(set, type, undefined, n)); set._noSite = {};
    if (p && !p.demolish) cands.push([aoArmazem(set, p[0] + n / 2, p[1] + n / 2), set, p]);
  }
  cands.sort((a, c) => a[0] - c[0] || a[1].id - c[1].id);
  for (const [d, set, p] of cands) { if (perto && d > perto) break; const b = sim(() => V.handFound(set, type, stepId, { x: p[0] + Math.floor(n / 2), y: p[1] + Math.floor(n / 2), R: 0 })); if (b) return { set, b, posta: 1, longe: Math.round(d) }; }
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
  for (let k = 0; k < 4; k++) { alimenta(set); M.viver(50); }
  E1.fim(); const fora = E1.linhas.filter(e => e[3] === 'f:' + f.id && ['calcamento', 'carroca', 'carroca-troca'].includes(e[8])).reduce((a, e) => a + e[6], 0); const ups = [...S.buildings.values()].filter(o => o.set === set.id && o.upgradeFrom && !o.built && !ups0.has(o.id));
  const o = S.buildings.get(b.id);
  ok('g1d um ano vivido', !!o && fora === 0 && !ups.length, `pedra do povo no calçamento e nas carroças: ${fora}; casas de pé postas em obra de melhoria: ${ups.length}; a obra ${o ? (o.built ? 'pronta' : 'espera ' + Math.round(o.need.stone || 0) + ' de pedra') : 'SUMIU'}, a vez ${set.vez}`);
  // (a grown one with no home: the turn ends at the planner's next look, and the stone is everyone's again)
  const sem = [...S.villagers.values()].filter(v => v.set === set.id && !v.captive && v.age >= 20 && v.home && !(S.avatar && S.avatar.id === v.id)).sort((a, c) => a.id - c.id)[0];
  if (sem && o && !o.built) {
    sim(() => { const h = S.buildings.get(sem.home); sem.home = 0; if (h) h.res = Math.max(0, (h.res || 1) - 1); V.vez(set); });
    ok('g1e sem casa, sem vez', set.vez === 0 && V.keeps(set) === 0 && Math.abs(V.stoneSpare(f.id) - (f.stock.stone || 0)) < 1e-6, `${sem.name} sem casa, ao olhar do planejador: a vez ${set.vez}, a obra guarda ${V.keeps(set)}, sobra toda a pedra do povo (${(f.stock.stone || 0).toFixed(0)})`);
  } else ok('g1e sem casa, sem vez', false, 'a premissa não se armou (ninguém com casa, ou a obra pronta)');
  const c = checa(); ok('g1f verificador', c.ok, c.txt);
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
  // (the people's quarry: another town of the same people, with rock about it, keeps a gang at the quarry while the work waits)
  const irmas = [...S.settlements.values()].filter(s => s.fac === set.fac && s !== set && adultos(s) >= 6).sort((a, c) => adultos(c) - adultos(a) || a.id - c.id);
  if (irmas.length) {
    const s2 = irmas[0]; if (rochasPerto(s2) < 4) rochas(s2, 8);
    // (the people's granaries full, as the rule asks — the repartidor's own «fed» —; the most at the quarry in a minute of looks)
    let m = 0, cheio = true; const farto = () => (f.stock.food || 0) > Math.max(50, G.Fac.pop(f.id) * 7);
    const quebram = new Set();
    for (let k = 0; k < 44; k++) { alimenta(set); if (k % 3 === 0) semMaterial(set); cheio = cheio && farto(); M.viver(5); m = Math.max(m, oficio(s2, 'construtor')); for (const v of S.villagers.values()) if (v.set === s2.id && v.role === 'construtor' && v.task && (v.task.type === 'mine' || v.task.type === 'quarry')) quebram.add(v.id); }
    const A2 = adultos(s2), g = Math.ceil(A2 * V.GANG_Q);
    if (!cheio) console.log(`  (g2e: os celeiros do povo não enchem neste mundo — ${Math.round(f.stock.food || 0)} de comida para ${G.Fac.pop(f.id)} pessoas, o armazém cabe ${Math.round(V.cap(f.id))} —: a pedreira do povo só se junta com fartura; sem caso)`);
    else ok('g2e a pedreira do povo', V.stoneKept(f.id) > 0 && V.quarries(s2) && m >= g && quebram.size >= 1, `${s2.name}, do mesmo povo, ${A2} adultos: até ${m} construtores (a turma de 1/12: ${g}), ${quebram.size} deles quebraram pedra em 220 s, enquanto a obra de ${set.name} guarda ${V.stoneKept(f.id).toFixed(0)} de pedra`);
  } else console.log('  (g2e: o povo da capital não tem outra cidade com gente; a pedreira do povo fica sem caso neste mundo)');
  const c = checa(); ok('g2f verificador', c.ok, c.txt);
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
  estacoes(set.id, 4);
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
  const E3 = escuta(); const w3 = S.buildings.get(b.id); const jaTinha = w3 && !w3.built ? (V.bill(w3).stone || 0) - (w3.need.stone || 0) : 0;
  const diz = () => { const w = S.buildings.get(b.id); const ff = G.Fac.get(s3.fac); if (VERB) console.log(`  (g3: ano ${S.day}: pedra do povo ${Math.round(ff.stock.stone || 0)}, renda ${Math.round(V.stoneIncome(ff.id))}, a vez ${s3.vez}, gw ${s3.gw}, sem casa ${V.housingInfo(s3.id).homeless}, comida ${Math.round(ff.stock.food)}/${G.Fac.pop(ff.id)} pessoas, rochas perto ${rochasPerto(s3)}, construtores ${oficio(s3, 'construtor')}, mineiros ${oficio(s3, 'mineiro')}; a obra ${w ? w.type + ' ' + JSON.stringify(w.need) + ' ' + Math.round(w.progress * 100) + '% unreach ' + (w.unreach || 0) : 'sumiu'}; outras obras: ${[...S.buildings.values()].filter(q => q.set === s3.id && !q.built && q.type !== 'ruin' && q.id !== b.id).map(q => q.type + ':' + Math.round(q.need.stone || 0)).join(' ')})`); };
  diz(); for (let y = 0; y < 2; y++) { estacoes(s3.id, 4); diz(); }
  // (what it got, by its own bill: what the step costs in stone — less the brick that took its place, V.bill — less what it still
  // waits for; and by the ledger, line by line. A brick that never comes goes back to stone on the way: L-540)
  E3.fim(); const o = S.buildings.get(b.id); const livro = naObra(E3.linhas, b.id); const recebeu = o && o.type !== 'ruin' ? (V.bill(o).stone || 0) - (o.built ? 0 : o.need.stone || 0) - jaTinha : 0;
  ok('g3e três anos de salto', !!o && o.type !== 'ruin' && (o.built || recebeu >= 30), `${s3.name}: a obra ${o ? (o.type === 'ruin' ? 'DESTRUÍDA' : o.built ? 'ficou pronta' : `recebeu ${recebeu.toFixed(0)} de pedra (espera ${Math.round(o.need.stone || 0)}; ${Math.round(o.progress * 100)}%)`) : 'SUMIU'}; a vez ${s3.vez}`);
  ok('g3f pelo livro', !!o && Math.abs(livro - recebeu) < 1e-3 && livro > 0, `a pedra que entrou na obra pelo livro: ${livro.toFixed(0)}; o que a conta dela diz que recebeu: ${recebeu.toFixed(0)}`);
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
    // (the town's other works finished by the god's hand, the town fed and housed again: the stone given has one work to go to)
    sim(() => { for (const q of [...S.buildings.values()]) if (q.set === set.id && !q.built && q.type !== 'ruin' && q.id !== b.id) V.completeBuilding(q); });
    // (two years by the jump, the town fed each season: a house a family pays for in the meantime comes first — L-313 —, a fire
    // takes the builders a day; then the stone goes to the work)
    comVez(set); pedra(set, 150); const E5 = escuta(); estacoes(set.id, 8);
    const o2 = S.buildings.get(b.id); const com = naObra(E5.linhas, b.id); E5.fim();
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
  for (const s of capitais()) {
    const L = Es.choose(s, 'temple').filter(st => st.n > Es.n0('temple')); if (!L.length) continue;
    const acha = st => { s._noSite = {}; const p = sim(() => V.findSite(s, 'temple', undefined, st.n) || (V.opens('temple', st) ? V.openSite(s, 'temple', st) : null)); s._noSite = {}; return !!p; };
    const livre = L.find(acha); if (livre) cands.push([s, livre, livre !== L[0] ? 0 : 1]);
  }
  cands.sort((a, c) => a[2] - c[2]);
  for (const [s, livre] of cands) { const b = cercado(s, 'temple', 'santuario'); if (!b) continue; set = s; b0 = b; alvo = livre; break; }
  if (!ok('g5a o santuário sem espaço em volta', !!set, set ? `${set.name} (${V.pop(set.id)} pessoas, nível ${set.tier}) justifica ${Es.choose(set, 'temple').map(st => st.id + '/' + st.n).join(' > ')}; ${lado(b0)} com poços dos lados` : 'nenhuma capital justifica um templo maior com lote livre')) return;
  const fac = G.Fac.get(set.fac); civicas(set); rico(set, 120); pedra(set, 100);
  const cresce = Es.choose(set, 'temple').filter(st => st.n > b0.w).every(st => !V.growLot(set, b0, st));
  const hi = marca(); const templos0 = [...S.buildings.values()].filter(o => o.set === set.id && o.type === 'temple').length;
  // (the town's other temples, standing, would be the ones to grow: the proof's is the biggest only if none is bigger — else it
  // takes them away, by the game's door)
  sim(() => { for (const o of [...S.buildings.values()]) if (o.set === set.id && o.type === 'temple' && o.id !== b0.id) V.removeBuilding(o); });
  const nb = sim(() => V.grow(set, fac, V.counts(set.id)));
  const velho = S.buildings.get(b0.id); const fora = nb && (nb.x + nb.w <= b0.x || nb.x >= b0.x + b0.w || nb.y + nb.h <= b0.y || nb.y >= b0.y + b0.h);
  ok('g5b erguido de novo, noutro lugar', cresce && !!nb && nb.id !== b0.id && nb.type === 'temple' && nb.w === alvo.n && !nb.built && fora && !!velho && velho.built && velho.w === 2 && !velho.amp,
    `em volta ${cresce ? 'não há lote para crescer' : 'HAVIA lote'} (${templos0} templos antes); V.grow: ${lado(nb)}${nb ? ', em obra' : ''}; o antigo ${velho ? lado(velho) + (velho.built ? ', de pé' : ', EM OBRA') : 'SUMIU'}`);
  if (!nb) return;
  const B = Es.bill('temple', alvo); const soma = o => Object.values(o || {}).reduce((a, x) => a + (x || 0), 0);
  ok('g5c o maior degrau que acha terra, com a conta dele', nb.esc === alvo.id && soma(V.bill(nb)) === soma(B.cost) && V.workOf(nb) === B.work, `o degrau ${nb.esc} (${nb.w * 4} m): a conta ${JSON.stringify(V.bill(nb))}, o trabalho ${V.workOf(nb)}`);
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
run('g5m', () => {
  // (never a second wonder: a people's wonder standing with no room round it, in a town that would justify the colossal one — the
  // proof holds the town's rank and its head count, as M.semMoeda holds the door of the arts)
  abre(); let set = null, w = null;
  for (const s of capitais()) { const st = Es.steps('maravilha').find(q => q.n === 13); if (!st || !Es.can('maravilha', G.Civ.idOfFac(s.fac) || 'classico', 13)) continue; const b = sim(() => V.handFound(s, 'maravilha', 'maravilha', { R: 60, built: true })); if (b) { set = s; w = b; break; } }
  if (!ok('g5m a maravilha de pé', !!set, set ? `${set.name}: ${lado(w)}` : 'nenhuma capital com lote de 10 e povo que saiba a colossal')) return;
  const fac = G.Fac.get(set.fac); const pop0 = V.pop; const t0 = set.tier;
  V.pop = id => (id === set.id ? 320 : pop0(id)); set.tier = 5;
  try {
    const quer = Es.choose(set, 'maravilha')[0]; civicas(set); rico(set, 400); pedra(set, 300);
    sim(() => { let n = 0; for (const [x, y] of [[w.x - 1, w.y], [w.x + w.w, w.y + w.h - 1], [w.x, w.y - 1], [w.x + w.w - 1, w.y + w.h]]) if (!S.occ[y * G.N + x] && S.type[y * G.N + x] >= G.T.SAND && V.addBuilding('well', x, y, set.id, true)) n++; return n; });
    const antes = [...S.buildings.values()].filter(o => o.type === 'maravilha').length; set._noSite = {};
    const r = sim(() => V.grow(set, fac, V.counts(set.id))); const depois = [...S.buildings.values()].filter(o => o.type === 'maravilha').length;
    ok('g5n nunca outra maravilha', quer.n === 13 && depois === antes && (!r || r.type !== 'maravilha'), `${set.name} justificaria ${quer.id}/${quer.n}; sem espaço em volta da de 10, V.grow: ${r ? lado(r) : 'nada'}; maravilhas no mundo: ${antes} → ${depois}`);
  } finally { V.pop = pop0; set.tier = t0; }
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
  abre(); const { guarda } = require('./guarda-lib.js'); const g = guarda(G) || guarda(G, { provoca: 1 });
  const set = g && S.settlements.get(g.set); const r0 = set && V.reserva(set);
  if (!ok('g6a o campo guardado', !!r0, r0 ? `${set.name} guarda ${r0.n}×${r0.n} para ${r0.type} (${g.provocado ? 'o chão aplainado pela prova' : 'a terra como estava'})` : 'nenhuma capital guardou um campo')) return;
  if (r0.type !== 'maravilha') { console.log(`  (g6: o campo é de ${r0.type}; a regra é da maravilha — sem caso neste mundo)`); return; }
  const fac = G.Fac.get(set.fac);
  // (what the planner asks of a capital to wish its wonder — city.js —: the arts, the people, the stone; and a town that still
  // wishes its baths, so that the wonder would wait behind them)
  sim(() => { for (const t of ['alvenaria', 'engenharia']) if (!G.Civ.has(fac.id, t)) G.Civ.learn(fac, t); fac._wonder = 0; });
  sim(() => { for (const o of [...S.buildings.values()]) if (o.set === set.id && (o.type === 'banhos' || o.type === 'maravilha')) V.removeBuilding(o); });
  sim(() => { for (const o of [...S.buildings.values()]) if (o.type === 'maravilha' && V.facOfSet(o.set) === fac.id) V.removeBuilding(o); });
  civicas(set); rico(set, 150); pedra(set, 200); comVez(set);
  const ids = new Set(S.buildings.keys()); let mar = null;
  // (the people's stone income as the ledger counts it — f.pedra —, held high by the proof at each look: only the wish is at stake)
  // (and its timber: the planner opens no new work with less than a third of its wood in store)
  for (let k = 0; k < 40 && !mar; k++) { alimenta(set); rico(set, 150); if ((fac.stock.wood || 0) < 60) D.make('f:' + fac.id, 'wood', 90, { code: 'teste' }); civicasMenos(set, 'maravilha'); M.viver(4); mar = [...S.buildings.values()].find(o => o.set === set.id && o.type === 'maravilha' && !ids.has(o.id)) || null; }
  if (VERB && !mar) {
    const r = V.reserva(set); const N = G.N, T = G.T; const why = [];
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
// (the civic works of the town that are not the one awaited, finished by the god's hand: one great civic work at a time)
function civicasMenos(set, menos) { sim(() => { for (const o of [...S.buildings.values()]) if (o.set === set.id && !o.built && o.type !== 'ruin' && o.type !== menos && pub(o.type)) V.completeBuilding(o); }); }

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
  ok('g8a uma capital ergue sozinha um degrau grande', prontas.some(q => q.n >= 4), `em ${SEMENTES.length} mundos do zero, ${ANOS} anos de salto, sem a mão do deus: ${todas.length} degraus grandes fundados, ${prontas.length} de pé (${prontas.map(q => q.type + ' de ' + q.n * 4 + ' m').join(', ') || 'nenhum'})`);
  ok('g8b nenhuma vila', todas.every(q => q.tier >= 2) && todas.filter(q => q.n >= 6).every(q => q.tier >= 3), `o nível da cidade ao fundar: ${todas.map(q => q.type + '/' + q.n + ' nível ' + q.tier).join(', ') || '—'} (um degrau grande só numa vila ou mais; de 6 casas para cima, só numa cidade)`);
  ok('g8c verificador e erros', res.every(r => r.c.ok), res.map(r => `semente ${r.seed}: ${r.c.txt}`).join(' · '));
});

console.log(fails.length ? `DEGRAUS: FALHOU (${fails.join(', ')})` : `DEGRAUS: ok (${ms()} ms)`);
process.exit(fails.length ? 1 : 0);
