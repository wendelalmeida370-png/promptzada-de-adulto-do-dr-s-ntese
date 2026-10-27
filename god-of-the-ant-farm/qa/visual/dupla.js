// dupla: two under one heavy crate of an unloading, as the 3D draws them (L-210), and the gestures of the activities each with
// a pose of the world's people's own (L-205) — in Node, without a browser (the world of qa/nodemundo.js with the 3D's own files
// after it, qa/visual/tres-node.js: the people are drawn as the game draws them, and looked at by numbers).
//   node qa/visual/dupla.js [mundo]       (default: the ready world «metropole»)
// The proofs:
//   1. a ship lands crates of stone heavy enough for two at the busiest quay; the world lives until two carry one (G.Act.pair:
//      the one ahead with the crate in the world, the helper behind, his own errand saying so)
//   2. the two a metre apart (the god's hand, as the world keeps them — Porto.PAIR_GAP): one crate — the one ahead's —, drawn
//      once, between them at the belly, its long side along their line; the palms of each on their own end of it; the helper's
//      pose a carrier's; and the drawing changed nothing of the world
//   3. two and a half metres apart (a turn the world takes wide): nothing between them — the crate at the chest of the one
//      ahead, drawn once —, the helper's arms a carrier's, holding nothing
//   4. the helper called away (the god's hand ends his errand), even a metre apart: nothing between them
//   5. saved and loaded with the two under the crate: what is drawn after the load is what the world has (the pair, or the
//      crate at the chest), the crate never twice
//   6. every gesture of G.Act.ANIM with a pose of the people's own — paying, haggling, looking the goods over, counting,
//      waiting, the helper's — standing and, the helper's, walking (L-205)
//   and no module error
const path = require('path');
const T = require(path.join(__dirname, 'tres-node.js'));
const { G, M } = T.load();
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | dupla ${name} | ${info}`); if (!c) fails.push(name); };
const world = process.argv[2] || 'metropole';
M.pronto(world); M.viver(2);
let S = G.S; const TL = G.Space.TILE, A = G.Act, P3 = G.People3D;
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
const r2 = x => Math.round(x * 100) / 100;

// ------------------------------ 1. the crate of two ------------------------------
const porters = s => [...S.villagers.values()].filter(v => v.set === s.id && v.role === 'estivador').length;
const towns = [...S.settlements.values()].filter(s => [...S.buildings.values()].some(b => b.set === s.id && b.type === 'doca' && b.built) && [...S.buildings.values()].some(b => b.set === s.id && b.type === 'armazem' && b.built));
const set = towns.sort((a, b) => porters(b) - porters(a) || a.id - b.id)[0];
if (!set) { ok('1. uma cidade com cais e armazém do porto', false, `nenhuma em ${world}`); process.exit(1); }
const dock = [...S.buildings.values()].filter(b => b.set === set.id && b.type === 'doca' && b.built).sort((a, b) => a.id - b.id)[0];
god(() => { S.time = 0.2; const sh = S.ships.find(s => s.kind === 'mercante') || S.ships[0]; sh.goods = { k: 'stone', n: 12 }; G.Harbor.land(dock, sh.goods, sh); });
const pairNow = () => { for (const v of S.villagers.values()) { const p = A.pair(v); if (!p || p.side !== 'frente') continue; const h = S.villagers.get(p.help); const q = h && A.pair(h); if (q && q.lead === v.id) return { L: v, H: h }; } return null; };
let two = null; for (let k = 0; k < 900 && !two; k++) { M.viver(1); two = pairNow(); }
ok('1. a caixa pesada vai a dois: quem vai na frente com ela, o ajudante atrás', !!two, two ? `${set.name}: ${two.L.name} #${two.L.id} com ${two.L.carry.k} ${two.L.carry.n} (caixa ${two.L.carry.cid || '-'}), ${two.H.name} #${two.H.id} ajudando; a ${r2(Math.hypot(two.L.x - two.H.x, two.L.y - two.H.y) * TL)} m um do outro, como o mundo os tem` : `ninguém levou a dois em 15 minutos do mundo, em ${set.name}`);
if (!two) { console.log('FALHAS: 1'); process.exit(1); }
const { L, H } = two;
// (the helper set behind the one ahead, a gap apart along their line — the god's hand, in the world's step)
const dir = () => { const dx = L.x - H.x, dy = L.y - H.y, d = Math.hypot(dx, dy) || 1; return [dx / d, dy / d]; };
const behind = m => { const [ux, uy] = dir(); god(() => { H.x = L.x - ux * m / TL; H.y = L.y - uy * m / TL; }); };
// (the people drawn round the two, as the game draws them: a few frames, the eye between them)
const look = () => { const X = (L.x + H.x) / 2 * TL, Z = (L.y + H.y) / 2 * TL; for (let k = 0; k < 3; k++) P3.update(1 / 30, { X, Y: G.W.groundH(L.x, L.y) * G.Space.HM, Z }); };
const form = () => P3.held(L, (G.Fac.ofV(L) || {}).civ || 'nordico');
const crates = () => { const f = form(); const e = P3.helds().find(q => q[0] === f.form); return e ? e[1] : 0; };
const stateOf = id => { const w = P3.walkers.find(q => q[7] === id); return w ? w[4] : '—'; };
const pairOf = () => P3.pairs.find(e => e.lead === L.id) || null;
const snap = () => JSON.stringify([L.x, L.y, L.carry, L.task && L.task.type, L.task && L.task.st, H.x, H.y, H.task && H.task.type, H.task && H.task.st, S.clock, (S.ledger || []).length]);
// (where each one's palms must be: on their own end of the crate, low on its face, near its corners — as the rig is told)
function ends(e) {
  const w = e.H.size[0], h = e.H.size[1], d = e.H.size[2]; const ux = Math.cos(e.yaw), uz = Math.sin(e.yaw); const out = {};
  for (const [who, end] of [['lead', 1], ['help', -1]]) { const a = end * (w / 2 - 0.02), half = d / 2 - 0.04; out[who] = [1, -1].map(sd => [e.X + ux * a - uz * sd * half, e.Y - h * 0.2, e.Z + uz * a + ux * sd * half]); }
  return out;
}
const miss = (P, T) => Math.max(...P.map(p => Math.min(...T.map(t => Math.hypot(p[0] - t[0], p[1] - t[1], p[2] - t[2])))));

// ------------------------------ 2. a metre apart: the crate between them, in both pairs of hands ------------------------------
behind(1.0); const s0 = snap(); look(); const s1 = snap();
{ const e = pairOf(); const c2 = crates(); const T2 = e && ends(e); const ml = e && e.palms && e.palms.lead ? miss(e.palms.lead, T2.lead) : 9, mh = e && e.palms && e.palms.help ? miss(e.palms.help, T2.help) : 9;
  const gy = G.W.groundH((L.x + H.x) / 2, (L.y + H.y) / 2) * G.Space.HM; const mid = e ? Math.hypot(e.X - (L.x + H.x) / 2 * TL, e.Z - (L.y + H.y) / 2 * TL) : 9;
  const st = stateOf(H.id);
  ok('2. a um metro: uma caixa só, a de quem vai na frente, entre os dois na altura da barriga, o lado comprido na linha deles; as mãos de cada um na ponta dele; o ajudante com os braços de carregar; o desenho não mexe no mundo',
    !!e && mid < 0.02 && Math.abs(e.Y - gy - 1.08) < 0.25 && ml < 0.1 && mh < 0.1 && (st === 'carry' || st === 'carryWalk') && s0 === s1,
    e ? `entre ${L.name} e ${H.name} a ${e.gap} m: a caixa a ${r2(mid)} m do meio, ${r2(e.Y - gy)} m sobre o chão; as mãos a ${r2(ml)} m (frente) e ${r2(mh)} m (ajudante) da ponta de cada um; ${c2} caixas «${form().form}» desenhadas; o ajudante «${st}»; o mundo ${s0 === s1 ? 'igual' : 'MUDADO'}` : `nenhuma caixa entre os dois (o ajudante «${st}»)`);
  globalThis.__c2 = c2; }

// ------------------------------ 3. two and a half metres apart: the crate at the chest of the one ahead ------------------------------
behind(2.5); look();
{ const e = pairOf(); const c3 = crates(); const st = stateOf(H.id), sl = stateOf(L.id);
  ok('3. a dois metros e meio: nada entre os dois — a caixa no peito de quem vai na frente, desenhada uma vez —, o ajudante com os braços de carregar, sem caixa', !e && c3 === globalThis.__c2 && (st === 'carry' || st === 'carryWalk') && (sl === 'carry' || sl === 'carryWalk'),
    `${e ? 'UMA CAIXA ENTRE OS DOIS' : 'nada entre os dois'}; ${c3} caixas desenhadas (a um metro, ${globalThis.__c2}); quem vai na frente «${sl}», o ajudante «${st}»`); }

// ------------------------------ 4. the helper called away ------------------------------
{ const keep = H.task; god(() => G.Vg.endTask(H)); behind(1.0); look(); const e = pairOf(); const c4 = crates();
  ok('4. o ajudante chamado para outra coisa, mesmo a um metro: nada entre os dois, a caixa no peito de quem vai na frente', !e && c4 === globalThis.__c2, `${e ? 'UMA CAIXA ENTRE OS DOIS' : 'nada entre os dois'}; ${c4} caixas desenhadas; a tarefa do ajudante ${keep ? keep.type + ' → ' + (H.task ? H.task.type : 'nenhuma') : '-'}`); }

// ------------------------------ 5. saved and loaded with the two under the crate ------------------------------
{ let t2 = null; for (let k = 0; k < 900 && !t2; k++) { M.viver(1); t2 = pairNow(); }
  if (!t2) ok('5. salvo e carregado com os dois debaixo da caixa', false, 'nenhuma dupla de novo em 15 minutos do mundo');
  else {
    const id = t2.L.id; M.salvarCarregar(); S = G.S; const L2 = S.villagers.get(id); const p2 = L2 && A.pair(L2); const h2 = p2 && S.villagers.get(p2.help); const q2 = h2 && A.pair(h2);
    const X = L2.x * TL, Z = L2.y * TL; for (let k = 0; k < 3; k++) P3.update(1 / 30, { X, Y: G.W.groundH(L2.x, L2.y) * G.Space.HM, Z });
    const e = P3.pairs.find(q => q.lead === id) || null; const both = !!(p2 && q2 && q2.lead === id);
    const gap = h2 ? Math.hypot(L2.x - h2.x, L2.y - h2.y) * TL : 9;
    ok('5. salvo e carregado com os dois debaixo da caixa: o que se desenha é o que o mundo tem — a dupla, ou a caixa no peito —, nunca a caixa duas vezes', both ? (gap <= 1.2) === !!e : !e,
      `${both ? `o mundo ainda os tem em dupla, a ${r2(gap)} m` : 'o mundo desfez a dupla ao carregar (as tarefas não vão no save)'}; ${e ? 'a caixa entre os dois' : 'nada entre os dois'}`); } }

// ------------------------------ 6. the gestures of the activities, each with a pose ------------------------------
{ const A3 = G.Anim3D; const rows = [], bad = [];
  for (const k of Object.keys(A.ANIM)) { const g = A.ANIM[k]; if (!g.act) continue;
    const still = A3.stateOf({ act: g.act, carry: null }, 0), held = A3.stateOf({ act: g.act, carry: { n: 1 } }, 0), walk = A3.stateOf({ act: g.act, carry: null }, 1);
    const own = still !== 'idle' || held !== 'carry' || (P3.LIFT_ACTS.has(g.act) || P3.PUT_ACTS.has(g.act)); const walkOk = !g.pair || walk === 'carryWalk';
    rows.push(`${g.act} ${still}${g.pair ? '/' + walk : ''}`); if (!own || !walkOk) bad.push(`${k} (${g.act}): parado ${still}, com carga ${held}, andando ${walk}`); }
  ok('6. todo gesto de G.Act.ANIM com uma pose das pessoas do mundo — pagar, pechinchar, examinar, contar, esperar, o ajudante (parado e andando)', !bad.length, bad.length ? bad.join(' · ') : [...new Set(rows)].join(' · ')); }

ok('módulos', JSON.stringify(G.modErr) === '{}', JSON.stringify(G.modErr));
console.log(fails.length ? 'FALHAS: ' + fails.join(' · ') : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
