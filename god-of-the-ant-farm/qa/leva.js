// leva: node qa/leva.js — a segunda leva de um povo na janela da primeira (L-687). Quem foi chamado a um exército fica na
// lista dele até o exército se formar (formArmy) ou acabar, também quando um perigo lhe tomou o chamado e ele voltou ao seu
// dia («fica na lista e vai cuidar da vida», L-445). A leva escolhia pela tarefa (canServe), não pela lista: uma segunda leva
// do mesmo povo nessa janela — a campanha e a guarda de uma cidade, duas guardas, o socorro, o exército do mar — o levava de
// novo, e ele ficava em dois exércitos (S1) até o primeiro se formar. No mundo pronto «mundial»:
// l1 a campanha de um povo em guerra é chamada; um dos chamados perde o chamado (a tarefa acaba, como quando a fuga a toma) e
//    volta ao seu dia, ainda na lista; a guarda da cidade dele é chamada com toda a gente que pode ir (a segunda leva): ele
//    não vai, ninguém fica em dois exércitos, e a guarda se levanta com os outros;
// l2 o mesmo com um save no meio (entre o chamado perdido e a segunda leva): o load devolve a lista como estava, e a leva não
//    o leva;
// e o verificador limpo (S0–S2) na hora e alguns segundos de mundo depois, sem erro de módulo.
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | leva ${name} | ${info}`); if (!c) fails.push(name); };
const bad = () => QA.check().filter(q => q.sev <= 2).map(q => `[S${q.sev}] ${q.msg}`);
// (who is on the list of two live armies at once — the proof's own reading of the rolls)
const twice = () => { const seen = new Map(), out = []; for (const a of G.S.wz.armies) if (!a.done) for (const id of a.members) { if (seen.has(id)) out.push(`#${id} (${seen.get(id)} e ${a.id})`); seen.set(id, a.id); } return out; };
function scene(name, save) {
  M.pronto('mundial'); let S = G.S; const Wz = G.Wars; const P = id => G.S.villagers.get(id);
  // (a war of the world between peoples with towns linked on foot — W.townsLinked —, else one declared between two such peoples,
  // the biggest first: an army over the water goes by sea, and this is the levy on land)
  const alive = id => { const f = G.Fac.get(id); return f && f.alive ? f : null; };
  const linked = (f, o) => !!f && !!o && G.Fac.settlementsOf(f.id).some(s => G.Fac.settlementsOf(o.id).some(t => G.W.townsLinked(s, t)));
  let w = Wz.active().find(x => x.a.some(i => x.b.some(j => linked(alive(i), alive(j)))));
  if (!w) {
    const fs = G.Fac.all().filter(f => f.alive && G.Fac.capitalOf(f.id)).sort((p, q) => G.Fac.pop(q.id) - G.Fac.pop(p.id) || p.id - q.id);
    let pair = null; for (const x of fs) { for (const y of fs) if (x !== y && !G.Fac.atWar(x.id, y.id) && linked(x, y)) { pair = [x, y]; break; } if (pair) break; }
    if (pair) { G.Politics.declareWar(pair[0], pair[1], 'ambicao'); w = Wz.warOf(pair[0].id, pair[1].id); }
  }
  if (!w) return ok(name, false, 'precondição: nenhuma guerra entre povos ligados a pé');
  // the first levy: the campaign of a people at war (the one with the most adults first, in any war of the world) against the
  // nearest town of a foe its streets reach — thirty called, by the door's own size (o.n), so the granary does not decide it
  const pairs = []; for (const x of Wz.active()) for (const id of x.a.concat(x.b)) if (alive(id) && G.Fac.capitalOf(id)) pairs.push([x, alive(id)]);
  pairs.sort((p, q) => Wz.adults(q[1].id) - Wz.adults(p[1].id) || p[1].id - q[1].id || p[0].id - q[0].id);
  let A = null, a1 = null;
  for (const [x, f] of pairs) {
    const home = G.Fac.capitalOf(f.id); const foes = (x.a.includes(f.id) ? x.b : x.a).map(alive).filter(Boolean);
    const tgts = foes.flatMap(o => G.Fac.settlementsOf(o.id)).sort((p, q) => G.dist(p.cx, p.cy, home.cx, home.cy) - G.dist(q.cx, q.cy, home.cx, home.cy));
    for (const t of tgts) { a1 = Wz.mobilize(x, f, 'campanha', t, { n: 30 }); if (a1) break; }
    if (a1) { A = f; w = x; break; }
  }
  if (!a1) return ok(name, false, `precondição: nenhum povo em guerra chamou campanha (${pairs.map(p => p[1].name).join(', ')})`);
  // one of the called, near his own town (the guard of it will call him if it can), loses the call and goes back to his day
  const near = v => { const s = S.settlements.get(v.set); return s ? G.dist(v.x, v.y, s.cx, s.cy) : 1e9; };
  const ms = a1.members.map(P).filter(v => v && v.task && v.task.type === 'muster' && v.task.army === a1.id && S.settlements.get(v.set) && S.settlements.get(v.set).fac === A.id).sort((p, q) => near(p) - near(q) || p.id - q.id).map(v => v.id);
  if (!ms.length) return ok(name, false, `precondição: nenhum chamado de ${a1.name} perto da sua cidade`);
  // (o chamado cuja cidade levanta a guarda: a leva só levanta a guarda com quatro de mãos livres perto dela (wars.js, «menos que
  // isso é uma razia»), e no mundial da geração 20 o primeiro chamado da prova era de Luxor, a cidade do Clã de Hrafn na terra do
  // Nilo — com a campanha chamada, dezoito do povo a bordo e as guarnições das cidades vizinhas guardadas, sobravam menos de
  // quatro: «a guarda de Luxor (#-): NÃO SE LEVANTOU», a segunda leva que não houve. Quem perdeu o chamado numa cidade sem guarda
  // fica na lista e no seu dia, e a prova passa ao chamado seguinte de outra cidade, como o jogo levantaria a guarda dela. T-1018)
  const a1id = a1.id, wid = w.id, fid = A.id; const semGuarda = []; let mid = 0, town = 0, m = null, a1b = null, A2 = null, t2 = null, a2 = null, onRoll = false, called = false;
  for (const id of ms) {
    const v = P(id); if (!v || !v.task || v.task.type !== 'muster' || v.task.army !== a1id || semGuarda.some(q => q.id === v.set)) continue;
    G.Vg.endTask(v); G.Vg.setTask(v, { type: 'wander', pri: 1 });
    mid = id; town = v.set;
    if (save) { M.salvarCarregar(); S = G.S; }
    m = P(mid); a1b = Wz.army(a1id); const w2 = Wz.get(wid); A2 = G.Fac.get(fid); t2 = S.settlements.get(town);
    onRoll = !!a1b && !a1b.done && a1b.members.includes(mid); called = !!(m.task && m.task.type === 'muster');
    // the second levy: the guard of his town, with everyone who can go
    a2 = Wz.mobilize(w2, A2, 'defesa', t2, { n: 260 });
    if (a2) break; semGuarda.push(t2);
  }
  if (!a2) return ok(name, false, `precondição: a guarda de nenhuma cidade dos chamados de ${a1.name} se levanta (${semGuarda.map(q => q.name).join(', ')})`);
  const took = !!a2 && a2.members.includes(mid); const dup = twice();
  const b0 = bad(); M.viver(5); const b1 = bad(); const e = M.erros();
  ok(name, onRoll && !called && !!a2 && a2.members.length >= 4 && !took && !dup.length && !b0.length && !b1.length && M.limpo(),
    `${A2.name}: ${semGuarda.length ? `(a guarda de ${semGuarda.map(q => q.name).join(', ')} não se levanta — menos de quatro de mãos livres perto, depois da campanha —: quem perdeu o chamado ali fica na lista e no seu dia, e o caso é o chamado seguinte) ` : ''}${m.name} #${mid}, chamado ${a1b ? ('a ' + a1b.name).replace(/^a o /, 'ao ').replace(/^a os /, 'aos ').replace(/^a a /, 'à ').replace(/^a as /, 'às ') : 'a ?'} (#${a1id}), perdeu o chamado${save ? ' (save e load no meio)' : ''} — ${onRoll ? 'ainda na lista' : 'FORA DA LISTA'}, ${called ? 'CHAMADO DE NOVO' : 'no seu dia'}; a guarda de ${t2.name} (#${a2 ? a2.id : '-'}): ${a2 ? a2.members.length + ' chamados' : 'NÃO SE LEVANTOU'}, ${took ? m.name + ' ENTRE ELES' : m.name + ' não'}; ${dup.length ? 'em dois exércitos: ' + dup.slice(0, 3).join(', ') : 'ninguém em dois exércitos'}; ${[...b0, ...b1].slice(0, 2).join(' | ') || 'verificador limpo'}${Object.keys(e.mod).length ? '; erro de módulo: ' + Object.keys(e.mod).join(', ') : ''}`);
}
scene('l1 a segunda leva na janela da primeira: quem perdeu o chamado não vai de novo', false);
scene('l2 o mesmo com um save no meio: o load devolve a lista, e a leva não o leva', true);
console.log(fails.length ? `LEVA: ${fails.length} falha(s)` : 'LEVA: ok');
process.exit(fails.length ? 1 : 0);
