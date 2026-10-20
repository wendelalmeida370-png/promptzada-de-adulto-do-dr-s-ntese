// porto: um dia no porto provocado de propósito (C1) — a descarga como operação do mundo, no mundo pronto «metrópole».
//   node qa/porto.js [mundo] [cidade]      (em Node, pelo qa/nodemundo.js)
// p1 um navio chega com carga real (o porão esvazia, as caixas nascem no cais com nome e dono); p2 o manifesto, a origem, o
// pátio e o destino; p3 a equipe descarrega até o fim, o estoque recebe o que veio, cada caixa paga a quem a carregou, o
// chefe confere; p4 a caixa pesada vai a dois (uma carga no livro, duas pessoas debaixo dela); p5 o armazém cheio: espera,
// para, nada some, e volta quando há lugar; p6 a noite para a descarga e a manhã a retoma; p7 save no meio de uma caixa,
// carregado duas vezes: o mesmo futuro, nada aplicado duas vezes; p8 o corpo do deus assume a caixa de um estivador e a
// guarda pelas mesmas portas (a paga vai para a casa dele), e devolvido a IA continua; p9 chamado no meio: a caixa fica no
// chão e outro a leva; p10 fogo no cais: o que queima é perdido com a causa, e as contas fecham; p11 a pesca de um barco;
// p12 o cais que a cidade não alcança (um muro sem portão entre ele e o armazém): ninguém fica preso tentando, a carga não
// some; e o verificador limpo, sem erro de módulo, durante e depois.
const M = require('./nodemundo.js');
const world = process.argv[2] || 'metropole', townName = process.argv[3] || '';
const G = M.load({ qa: true, extra: ['js/space.js', 'js/possess.js', 'qa/atividades-inv.js'] });
const fails = []; const mid = []; // (what the checker saw in the middle of a case: the case fails, even if the end looks clean)
const ok = (name, c, info) => { const m = mid.splice(0); const pass = c && !m.length; console.log(`${pass ? 'PASSOU' : 'FALHOU'} | porto ${name} | ${info}${m.length ? ' — o verificador, no meio do caso: ' + m.slice(0, 2).join(' · ') : ''}`); if (!pass) fails.push(name); };
// (the checker: the activities' own rules and the world's numbers stop the scenario; what it finds in other systems on the
// way — a war broke out, a band lost a man — is told at the end, for their owners, and does not hide a fault of ours)
const others = new Map();
const bad = () => QA.check().filter(q => q.sev <= 2).filter(q => { if (q.sys === 'act' || q.sys === 'nan') return true; others.set(q.msg, (others.get(q.msg) || 0) + 1); return false; });
M.pronto(world); M.viver(2);
G.inSim++; // (what the test does stands for the world's step: the god's hand)
const D = G.Depot, A = G.Act, P = G.Porto, E = G.Eco;
let S = G.S;
// the town: a quay, a harbour warehouse, stevedores (the biggest such town, or the one named)
const porters = s => [...S.villagers.values()].filter(v => v.set === s.id && v.role === 'estivador').length;
const towns = [...S.settlements.values()].filter(s => [...S.buildings.values()].some(b => b.set === s.id && b.type === 'doca' && b.built) && [...S.buildings.values()].some(b => b.set === s.id && b.type === 'armazem' && b.built));
let set = townName ? towns.find(s => s.name === townName) : towns.sort((a, b) => porters(b) - porters(a))[0];
if (!set) { console.log('FALHOU | porto | nenhuma cidade com cais e armazém do porto'); process.exit(1); }
let dock = [...S.buildings.values()].find(b => b.set === set.id && b.type === 'doca' && b.built);
let fac = G.Fac.get(set.fac);
const ids = { set: set.id, dock: dock.id, fac: fac.id };
const refresh = () => { S = G.S; set = S.settlements.get(ids.set); dock = S.buildings.get(ids.dock); fac = G.Fac.get(ids.fac); }; // (after a load: new objects)
console.log(`(${set.name}, ${fac.civ}: ${G.Village.pop(set.id)} habitantes, ${porters(set)} estivadores; moeda: ${E.coinage(fac.id) ? 'sim' : 'não'})`);
// a clean quay to start (what was on it goes to the store as it would: through the unloading under way, finished by hand)
const clearQuay = () => {
  for (const op of A.all()) if (op.def === 'descarga' && op.at === dock.id && A.live(op)) A.end(op, 'cancel', 'teste');
  for (const c of (dock.crates || []).slice()) D.move('q:' + dock.id, 'f:' + fac.id, c.k, c.n, { code: 'teste', part: true });
  dock.crates = [];
  for (const v of S.villagers.values()) if (v.carry && v.carry.op && !A.live(A.get(v.carry.op))) v.carry.op = 0;
};
const day = t => { S.time = t; }; // (the test sets the hour of the day)
const ship = () => S.ships.find(s => s.kind === 'mercante') || S.ships[0];
const live = (sec, until) => { for (let k = 0; k < sec; k++) { M.viver(1); if (until && until()) return true; } return false; };
// (the unloading's own working time: a night, a danger in the town, a store with no room pause it — the world's reasons —,
// and a case waits them out, up to three times that in the world's time; a fixed time of the world assumed a calm day: in
// the course of the world with the second of the activities a second, the town of the quay was in danger and then dark
// in the middle of p8 — T-d)
const work = (op, sec, until) => { let on = 0; for (let k = 0; k < sec * 3 && on < sec; k++) { M.viver(1); if (A.live(op) && op.st === 'on') on++; if (until && until()) return true; } return false; };
const land = (k, n) => { clearQuay(); day(0.15); const sh = ship(); sh.goods = { k, n }; G.Harbor.land(dock, sh.goods, sh); return P.opAt(dock); };
const carrierOf = op => [...S.villagers.values()].find(v => v.carry && v.carry.op === op.id && v.carry.n > 0) || null;
const book = (op, code) => D.ledger().filter(e => e[7] === op.id && (!code || e[8] === code));
const r2 = x => Math.round(x * 100) / 100;
const nm = id => (S.villagers.get(id) || {}).name || '#' + id;
const watch = () => { const bb = bad(); if (bb.length) { console.log('   verificador no meio:', bb.slice(0, 2).map(q => q.msg).join(' · ')); for (const q of bb) if (!mid.includes(q.msg)) mid.push(q.msg); return true; } return false; };
// (a case that fails tells where things are: the operation, the crates, what lies on the ground, the quay's people)
function tell(name, o) {
  const qs = G.Fishers.crateSpot(dock); const L = (S.loose || []).filter(x => x.op === o.id);
  const hands = [...S.villagers.values()].filter(v => v.set === set.id && (v.role === 'estivador' || v.role === 'pescador' || (v.task && v.task.op === o.id) || (v.carry && v.carry.op === o.id)));
  console.log(`   (${name}: ${A.STATES[o.st]}${o.wait ? ' ' + o.wait : ''}; caixas ${(dock.crates || []).map(c => `${c.id}:${c.k}${c.n}${c.op === o.id ? '' : '/op' + c.op}${c.by ? '@' + nm(c.by) : ''}`).join(' ') || '-'}; no chão ${L.map(x => `${x.id}:${x.k}${x.n}(${x.x},${x.y})${x.by ? '@' + nm(x.by) : ''}`).join(' ') || '-'}; ponto das caixas ${qs.map(q => q.toFixed(1))}`);
  if (!hands.some(v => A.able(v))) console.log(`     nenhum estivador nem pescador capaz em ${set.name} (${hands.length} no todo)`);
  for (const v of hands) console.log(`     ${v.name} ${v.role} ${v.task ? v.task.type + '.' + v.task.st + (v.task.op ? ' op' + v.task.op : '') + (v.task.rt ? ' rt' + v.task.rt : '') : '-'} em ${v.x.toFixed(1)},${v.y.toFixed(1)} (a ${G.dist(v.x, v.y, qs[0], qs[1]).toFixed(1)} das caixas; alcança ${G.W.reaches(v, qs[0], qs[1])})${v.carry ? ' leva ' + v.carry.k + v.carry.n + (v.carry.op ? ' op' + v.carry.op : '') : ''}${v._pfN ? ' buscas falhas ' + v._pfN : ''}`);
  console.log(`     registro: ${JSON.stringify((o.log || []).slice(-10))}`);
};

// ---------------- p1/p2: a ship comes in with real cargo
clearQuay(); day(0.15);
const sh = ship(); const ships0 = S.ships.length;
fac.stock.sal = Math.min(fac.stock.sal || 0, 10); const sal0 = fac.stock.sal;
sh.goods = { k: 'sal', n: 14 };
const left = G.Harbor.land(dock, sh.goods, sh);
const op = P.opAt(dock);
const crates = (dock.crates || []).filter(c => op && c.op === op.id);
ok('p1 o navio chega', !!op && !sh.goods && crates.length === 4 && crates.every(c => Number.isInteger(c.id) && c.k === 'sal') && Math.abs(crates.reduce((a, c) => a + c.n, 0) - 14) < 1e-6 && !left && S.ships.length === ships0,
  op ? `o porão esvaziou; ${crates.length} caixas de sal no cais (${crates.map(c => c.n).join(', ')}), cada uma com nome e com a descarga #${op.id}` : 'nenhuma descarga');
ok('p2 o manifesto', !!op && op.goods.sal === 14 && op.from === 's:' + sh.id && op.stage === 'q:' + dock.id && op.to === 'f:' + fac.id && op.taken.sal === 14 && !bad().length,
  op ? `manifesto ${JSON.stringify(op.goods)}, da ${op.from} pelo ${op.stage} para ${op.to}; saiu do porão ${op.taken.sal}; ${A.STATES[op.st]}` : '-');

// ---------------- p3: the team unloads it to the end
{
  const seen = new Set();
  const done = live(400, () => { for (const v of S.villagers.values()) if (v.carry && v.carry.op === op.id) seen.add(v.id); if (watch()) return true; return !A.live(op); });
  const deps = book(op, 'depositar'), pays = book(op, 'paga');
  const paid = Object.values(op.data.paid || {}).reduce((a, b) => a + b, 0);
  // (each pay: from the people's treasury to the house — or the purse — of one who carried a crate of it)
  const payOk = pays.every(e => e[3] === 'f:' + fac.id && e[5] === 'moedas' && seen.has(e[9]) && (e[4] === 'h:' + (S.villagers.get(e[9]) || {}).home || e[4] === 'p:' + e[9]));
  const inBook = r2(pays.reduce((a, e) => a + e[6], 0));
  ok('p3 a equipe descarrega', done && op.st === 'ok' && op.done.sal === 14 && fac.stock.sal >= sal0 + 14 - 1e-6 && seen.size >= 1 && deps.length >= 4 && (E.coinage(fac.id) ? pays.length >= 4 && payOk && Math.abs(inBook - paid) < 0.02 : true) && !bad().length,
    `${A.STATES[op.st]} (${op.end && op.end.why}); ${seen.size} carregador(es), ${deps.length} entregas no armazém; o estoque de sal ${sal0} → ${Math.round(fac.stock.sal)}; paga ${r2(paid)} ${E.coinage(fac.id) ? 'moedas do tesouro às casas dos carregadores' : 'em ração'} (${pays.length} pagamentos, ${inBook} no livro-razão${payOk ? '' : ', ALGUM PARA QUEM NÃO CARREGOU'}); conferido por ${op.data.counter ? nm(op.data.counter) : '—'}`);
}
// ---------------- p4: a heavy crate takes two (one load in the ledger, two under it)
{
  const op4 = land('stone', 8); let pair = null; let twice = false;
  const done = live(400, () => { for (const v of S.villagers.values()) { const p = A.pair(v); if (p && !pair) pair = p; if (v.carry && v.carry.op === op4.id && v.task && v.task.type === 'ajudar') twice = true; } if (watch()) return true; return !A.live(op4); });
  // (what arrived is what the unloading took — the 8 of the test's ship, and whatever else came ashore into it meanwhile: a
  // merchant ship home with its return cargo lands it into the unloading under way)
  const want4 = op4.taken.stone || 0;
  ok('p4 a caixa pesada vai a dois', done && op4.st === 'ok' && want4 >= 8 && Math.abs(op4.done.stone - want4) < 1e-6 && !!pair && !twice && !bad().length, pair ? `${nm(pair.lead)} na frente e ${nm(pair.help)} atrás, uma caixa de pedra só (no livro, nas mãos de quem vai na frente); chegou ${op4.done.stone} de ${want4}${want4 > 8 ? ' (as 8 do teste e ' + r2(want4 - 8) + ' que outro navio desembarcou na mesma descarga)' : ''}` : `ninguém levou a dois (caixas de 4 pedras = ${D.weight('stone', 4)} de peso; um adulto aguenta ${D.strength([...S.villagers.values()].find(v => v.set === set.id && v.role === 'estivador'))}) — chegou ${op4.done.stone} de ${want4}`);
}
// ---------------- p5: the warehouse fills while a crate is on its way: the porter waits at the door with it, nobody lifts
// another, the unloading stops, nothing is lost; with room again, on to the end
{
  // (coral: a good nobody in town takes out of the store while the test runs — the warehouse stays full)
  // (the store's room is asked every second: it grows when the town builds — the test keeps it full of coral all along)
  const cap = () => G.Village.cap(fac.id);
  const op5 = land('coral', 14); fac.stock.coral = Math.min(fac.stock.coral || 0, cap() - 40);
  live(120, () => !!carrierOf(op5) || watch());
  fac.stock.coral = cap(); // (the store is full now: others filled it)
  let stopped = false; const waited = new Set();
  live(300, () => { fac.stock.coral = Math.max(fac.stock.coral, cap()); for (const v of S.villagers.values()) if (v.task && v.task.op === op5.id && v.task.st === 4) waited.add(v.id); if (op5.st === 'wait' && op5.wait === 'cheio') stopped = true; return (stopped && !carrierOf(op5)) || watch(); });
  const kept = r2(P.custody(op5) + (op5.done.coral || 0)); const atDoor = (S.loose || []).filter(o => o.op === op5.id).length;
  const quiet = live(15, () => { fac.stock.coral = Math.max(fac.stock.coral, cap()); return book(op5, 'pegar').some(e => e[2] > S.clock - 1 && op5.st === 'wait'); });
  D.use('f:' + fac.id, 'coral', 30, { code: 'teste' }); // (room again: some went away in a caravan)
  const done = work(op5, 400, () => watch() || !A.live(op5));
  ok('p5 o armazém cheio', stopped && waited.size >= 1 && Math.abs(kept - 14) < 1e-6 && !quiet && done && op5.st === 'ok' && op5.done.coral === 14 && !(op5.lost && op5.lost.coral) && !bad().length,
    `${waited.size} carregador(es) esperaram na porta com a caixa; a descarga ${stopped ? 'parou (armazém cheio)' : 'NÃO parou'}, ${atDoor} caixa(s) postas no chão junto da porta, nada sumiu (${kept} de 14 sob guarda ou entregue); ninguém pegou caixa parado; com lugar de novo: ${A.STATES[op5.st]}, chegou ${op5.done.coral} de 14 (coral)`);
}
// ---------------- p6: night stops the unloading; the morning takes it up again
{
  const op6 = land('sal', 14); fac.stock.sal = Math.min(fac.stock.sal, 20);
  live(4); day(0.74); // (dusk falls: the crates still on the quay wait for the sun)
  live(2); const paused = op6.st === 'wait' && op6.wait === 'noite'; const t0 = S.clock;
  live(40); const night = book(op6, 'pegar').filter(e => e[2] > t0 + 0.5);
  day(0.06); // (the morning)
  const done = live(500, () => watch() || !A.live(op6));
  ok('p6 a noite', paused && !night.length && done && op6.st === 'ok' && op6.done.sal === 14 && !bad().length,
    `${paused ? 'ao escurecer a descarga parou' : 'NÃO parou ao escurecer (' + A.STATES[op6.st] + ')'}; caixas levantadas de noite: ${night.length}; de manhã ${A.STATES[op6.st]}, chegou ${op6.done.sal} de 14`);
}
// ---------------- p7: a save in the middle of a crate, loaded twice: the same future, nothing applied twice
{
  const op7 = land('sal', 14); fac.stock.sal = Math.min(fac.stock.sal, 20);
  live(120, () => !!carrierOf(op7) || watch());
  const who = carrierOf(op7); const cid = who && who.carry.cid;
  const str = G.Save.serialize();
  const run = () => { if (G.UI && G.UI.select) G.UI.select(null); G.Save.apply(JSON.parse(str)); G.Main.mode = 'game'; refresh(); live(40); const o = A.get(op7.id); return { canon: JSON.stringify(QA.canon()), done: o ? o.done.sal || 0 : -1, keys: o ? (o.keys || []).length : -1, n: S.ledgerN }; };
  const a = run(), b = run();
  const o7 = A.get(op7.id);
  const done = work(o7, 400, () => watch() || !A.live(o7));
  const dupe = (() => { const s = new Set(); for (const e of o7.keys || []) { if (s.has(e[0])) return e[0]; s.add(e[0]); } return null; })();
  ok('p7 save no meio, carregado duas vezes', !!who && a.canon === b.canon && a.done === b.done && a.n === b.n && !dupe && done && o7.st === 'ok' && o7.done.sal === 14 && !bad().length,
    `${who ? `${who.name} com a caixa ${cid} nas mãos na hora do save` : 'ninguém carregava'}; as duas vidas depois do load ${a.canon === b.canon ? 'iguais' : 'DIFERENTES'} (chegou ${a.done} e ${b.done}, livro ${a.n} e ${b.n}); nenhum passo aplicado duas vezes${dupe ? ' — MENOS ' + dupe : ''}; no fim ${A.STATES[o7.st]}, chegou ${o7.done.sal} de 14`);
}
// a porter on the way with a crate of this unloading, caught in the middle of the walk (looked at every tenth of a second):
// away from the store's door (a crate set down there goes in) and from the quay (there it goes back on the pile)
function midway(op, sec) {
  const dest = P.destOf(op); const [fx, fy] = G.Village.frontTile(dest); const qs = G.Fishers.crateSpot(dock);
  // (the unloading's working time, as in work())
  for (let k = 0, on = 0; k < sec * 30 && on < sec * 10; k++) {
    M.viver(0.1); if (A.live(op) && op.st === 'on') on++;
    const v = carrierOf(op);
    if (v && v.task && v.task.type === 'descarga' && v.task.st === 2 && G.dist(v.x, v.y, fx, fy) > 1.7 && G.dist(v.x, v.y, qs[0], qs[1]) > 1.2) return v;
    if (watch()) break;
  }
  return null;
}
// where a crate went when its porter let go of it: the ledger says (the ground, back on the quay, into the store)
const fateOf = (op, v, n0) => { const e = D.ledger().filter(q => q[7] === op.id && q[9] === v.id && q[3] === 'v:' + v.id && q[0] > n0).pop(); return e ? { code: e[8], to: e[4] } : null; };
// ---------------- p8: the god's body takes over a stevedore's crate, by the same doors; given back, the person goes on
{
  const op8 = land('sal', 14); fac.stock.sal = Math.min(fac.stock.sal, 20);
  const dest = P.destOf(op8); const [fx, fy] = G.Village.frontTile(dest); const qs = G.Fishers.crateSpot(dock);
  const pv = midway(op8, 150); let info = '', fine = false;
  if (pv) {
    const payee = pv.home && D.exists('h:' + pv.home) ? 'h:' + pv.home : 'p:' + pv.id; const m0 = D.get(payee, 'moedas'); const k0 = pv.carry.k, n0 = pv.carry.n;
    const L0 = S.ledgerN;
    const tk = G.Possess.take(pv); M.viver(0.2);
    const role = A.role(pv); const kept = !!(pv.carry && pv.carry.op === op8.id); const fate = kept ? null : fateOf(op8, pv, L0);
    // (the body's hands: the crate if it kept it; if it set it down, it lifts it again — from the ground, or from the pile
    // on the quay; and if the crate went into the store, the next one from the quay)
    let r1 = { ok: true };
    let more = false;
    if (!kept) {
      let o = A.offers(pv, pv.x, pv.y, 2).find(q => q.act === 'pegarChao' && q.op === op8.id);
      // (at the quay: a crate nobody is lifting — the others may have all of them in hand for a moment; then another ship's
      // crate, set down right by the body, is the first free one)
      const atQuay = () => { pv.x = qs[0]; pv.y = qs[1]; return A.offers(pv, pv.x, pv.y, 2).find(q => q.act === 'pegar' && q.op === op8.id && q.ok !== false); };
      if (!o) { for (let k = 0; k < 50 && !o; k++) { M.viver(0.1); o = atQuay(); } }
      if (!o) { const s2 = ship(); s2.goods = { k: 'sal', n: 4 }; G.Harbor.land(dock, s2.goods, s2); more = true; o = atQuay(); }
      r1 = o ? A.perform(pv, o) : { ok: false, why: 'nada a pegar' };
    }
    pv.x = fx; pv.y = fy; M.viver(0.2);
    const od = A.offers(pv, pv.x, pv.y, 2).find(q => q.act === 'depositar' && q.op === op8.id);
    const r2_ = od ? A.perform(pv, od) : { ok: false, why: 'sem oferta de guardar' };
    const pay = book(op8, 'paga').filter(e => e[9] === pv.id && e[0] > L0); const m1 = D.get(payee, 'moedas'); const got = r2(pay.reduce((a, e) => a + e[6], 0));
    const owed = r2((op8.data.owed || {})[pv.id] || 0); // (an empty treasury owes it, and pays when it has coin)
    // (given back in the working hours, rested and fed — the test's hand: what comes next is the work, not the night or a meal)
    day(0.2); pv.energy = Math.max(pv.energy, 70); pv.hunger = Math.min(pv.hunger, 30);
    G.Possess.release('deus'); M.viver(0.2); const after = A.role(pv);
    const did = []; const goes = live(60, () => { const ty = pv.task ? pv.task.type : '-'; if (did[did.length - 1] !== ty) did.push(ty); return !!(pv.task && (pv.task.type === 'descarga' || pv.task.op === op8.id)) || !A.live(op8); });
    const done = work(op8, 400, () => watch() || !A.live(op8));
    fine = tk.ok && !!role && role.op === op8.id && r1.ok && r2_.ok && (!E.coinage(fac.id) || (pay.length >= 1 && pay.every(e => e[4] === payee) && m1 - m0 > got - 0.01) || owed > 0) && goes && done && op8.st === 'ok' && op8.done.sal === (more ? 18 : 14) && !bad().length;
    const where = kept ? 'ficou nas mãos' : !fate ? 'sumiu' : fate.code === 'pousou' ? 'foi ao chão e o corpo a levantou' : fate.code === 'devolveu' ? (more ? 'voltou ao monte do cais e outro a levou; o corpo pegou a caixa de um navio que chegou' : 'voltou ao monte do cais e o corpo a pegou lá') : fate.code === 'depositar' ? 'entrou no armazém (estava na porta) e o corpo pegou a seguinte no cais' : fate.code;
    info = `${pv.name} levava ${n0} de ${E.name(k0)}; o deus tomou o corpo (${tk.ok ? 'ok' : tk.why}), o papel ficou (${role ? role.role : 'nenhum'}), a caixa ${where} (${r1.ok ? r1.msg || 'ok' : r1.why}); guardou no armazém pela mesma porta (${r2_.ok ? r2_.msg : r2_.why}); paga ${pay.length ? got + ' para ' + pay[0][4] : owed > 0 ? 'devida (o tesouro estava sem moeda: ' + r2(owed) + ' anotados)' : 'nenhuma'}; devolvido: ${after ? 'papel ' + after.role : 'sem papel'}, ${goes ? 'voltou às caixas' : 'NÃO voltou (fez: ' + did.join(' → ') + ')'}; no fim ${A.STATES[op8.st]}, chegou ${op8.done.sal} de ${more ? 18 : 14}`;
  } else info = 'ninguém carregou uma caixa';
  ok('p8 o corpo assume a caixa', fine, info);
}
// ---------------- p9: called away in the middle: the crate is set down where the porter is, and another hand takes it on
{
  const op9 = land('sal', 14); fac.stock.sal = Math.min(fac.stock.sal, 20);
  const pv = midway(op9, 150); let info = '', fine = false;
  if (pv) {
    const k0 = pv.carry.k, n0 = pv.carry.n, cid = pv.carry.cid; const L0 = S.ledgerN;
    G.Vg.give(pv, { type: 'idle', pri: 3, wait: 8 }); // (someone calls: a word in the street)
    const fate = fateOf(op9, pv, L0);
    const ref = fate && (fate.code === 'pousou' ? fate.to : fate.code === 'devolveu' ? 'q:' + dock.id : null);
    // (from the ground: a 'pegar' from that thing; back on the quay: the same crate lifted again, so it is gone from the pile)
    const back = ref && ref[0] === 'q' && (dock.crates || []).some(c => c.id === cid);
    const took = () => {
      if (ref && ref[0] === 'g') return book(op9, 'pegar').find(e => e[0] > L0 && e[3] === ref) || null;
      if (back && !(dock.crates || []).some(c => c.id === cid)) return book(op9, 'pegar').filter(e => e[0] > L0 && e[3] === ref).pop() || null;
      return null;
    };
    const done = work(op9, 400, () => watch() || (!!took() && !A.live(op9)));
    const t = took();
    const ins = fate && fate.code === 'depositar';
    fine = !!fate && (ins || !!t) && done && op9.st === 'ok' && op9.done.sal === 14 && !bad().length;
    const where = !fate ? 'NÃO ficou em lugar nenhum' : fate.code === 'pousou' ? `ficou no chão onde estava (${fate.to})` : fate.code === 'devolveu' ? 'voltou ao monte do cais (estava perto)' : ins ? 'entrou no armazém (estava na porta)' : fate.code;
    info = `${pv.name} foi chamad${pv.g === 'f' ? 'a' : 'o'} com ${n0} de ${E.name(k0)} (caixa ${cid}) nas mãos: a caixa ${where}; ${ins ? 'nada a levar' : t ? `${nm(t[9])} a levou` : 'ninguém a levou'}; no fim ${A.STATES[op9.st]}, chegou ${op9.done.sal} de 14`;
  } else info = 'ninguém carregou uma caixa';
  ok('p9 chamado no meio', fine, info);
}
// ---------------- p11: the catch of a boat comes up as an unloading of its own
{
  clearQuay(); day(0.2); refresh();
  fac.stock.food = Math.min(fac.stock.food || 0, G.Village.cap(fac.id) - 60);
  // (the boats go out in the morning and come back heavy in the afternoon: the catch comes up on its own)
  let boat = null;
  live(330, () => { const o = P.opAt(dock); if (o && o.why === 'pesca' && (dock.crates || []).some(c => c.op === o.id)) { boat = S.ships.find(s => s.kind === 'pesca' && s.dock === dock.id && (o.data.boats || []).includes(s.id)) || null; return true; } return watch(); });
  const natural = !!boat;
  // (no boat came back in time: one moored with a hold full, as after a morning at sea)
  if (!boat) { boat = S.ships.find(s => s.kind === 'pesca' && s.dock === dock.id && s.st === 'idle' && !G.Naval.aboardOf(s).length) || null; if (boat) { boat.cargo = 12; boat.catchKind = boat.catchKind || 'sardinha'; boat.t = 5; boat.landed = 0; live(3); } }
  let info = 'nenhum barco de pesca neste cais', fine = false;
  if (boat) {
    const op11 = P.opAt(dock); const born = (dock.crates || []).filter(c => op11 && c.op === op11.id);
    const fishy = born.some(c => c.fish);
    const done = op11 ? work(op11, 400, () => watch() || !A.live(op11)) : false;
    const got = op11 ? Object.values(op11.done || {}).reduce((a, b) => a + b, 0) : 0, came = op11 ? Object.values(op11.goods || {}).reduce((a, b) => a + b, 0) : 0;
    const bb = bad();
    // (the catch is an unloading of its own — or joins the one under way at the quay, a ship's: one quay, one unloading)
    fine = !!op11 && (op11.data.boats || []).includes(boat.id) && born.length >= 1 && fishy && done && op11.st === 'ok' && Math.abs(got - came) < 0.01 && !boat.cargo && !bb.length;
    if (!fine && op11) console.log(`   (p11: por quê ${op11.why}, barcos ${JSON.stringify(op11.data.boats || [])} (o nosso ${boat.id}), ${born.length} caixas, com peixe ${fishy}, fim ${done} ${op11.st}, chegou ${got} de ${came}, porão ${boat.cargo}, verificador ${bb.map(q => q.msg).slice(0, 2).join(' · ')})`);
    info = op11 ? `${natural ? 'um barco voltou do mar' : 'um barco atracado com o porão cheio'}: desembarcou ${came} (${Object.keys(op11.goods).map(k => E.name(k)).join(', ')}) em ${born.length} caixa(s) com o peixe de que vieram; ${A.STATES[op11.st]}, chegou ${got} de ${came} ao armazém; o porão do barco ${boat.cargo ? 'ainda tem ' + boat.cargo : 'vazio'}` : 'o barco não desembarcou nada';
  }
  ok('p11 a pesca de um barco', fine, info);
}
// (the cases of the bad days start from the ready world again: what the days before brought to the town — a raid that
// took its porters, a band at the gates, the nights — is another story, and would decide them instead)
const fresh = () => { M.pronto(world); M.viver(2); G.inSim = Math.max(G.inSim || 0, 1); refresh(); };
// ---------------- p12: a quay cut off in the middle (a wall with no gate between it and the store): no one stuck trying,
// nothing lost; the next ship's cargo goes up by the way there is; with the way open again, the crates come up
{
  fresh();
  const op12 = land('sal', 8); fac.stock.sal = Math.min(fac.stock.sal, 20);
  // (the cut: walls all round the quay, two steps out, as a town wall with no gate would — then the map of regions knows)
  const ring = [];
  for (let y = dock.y - 2; y <= dock.y + dock.h + 1; y++) for (let x = dock.x - 2; x <= dock.x + dock.w + 1; x++) {
    if (x >= dock.x - 1 && x <= dock.x + dock.w && y >= dock.y - 1 && y <= dock.y + dock.h) continue;
    if (!G.W.inb(x, y)) continue; const i = G.W.idx(x + 0.5, y + 0.5);
    if (!S.wall[i] && G.W.walkable(i)) { ring.push(i); S.wall[i] = 1; S.wallFac[i] = fac.id; S.wallHp[i] = 400; }
  }
  G.W.touchWalk();
  const dest = P.destOf(op12); const cut = !P.access(dock, dest);
  const tries = new Set();
  live(30, () => { for (const v of S.villagers.values()) if (v.task && v.task.type === 'descarga' && v.task.op === op12.id && !v.carry && v.task.age < 1) tries.add(v.task); return watch(); });
  const paused = op12.st === 'wait' && op12.wait === 'semacesso'; const tries0 = tries.size;
  live(20, () => { for (const v of S.villagers.values()) if (v.task && v.task.type === 'descarga' && v.task.op === op12.id && !v.carry && v.task.age < 1) tries.add(v.task); return watch(); });
  const later = tries.size - tries0;
  // (a second ship while the quay is cut off)
  const sh12 = ship(); const st0 = fac.stock.sal || 0; const n0 = (dock.crates || []).length; sh12.goods = { k: 'sal', n: 6 }; G.Harbor.land(dock, sh12.goods, sh12);
  const straight = r2((fac.stock.sal || 0) - st0); const n1 = (dock.crates || []).length;
  const kept = r2(P.custody(op12) + (op12.done.sal || 0));
  for (const i of ring) { S.wall[i] = 0; S.wallFac[i] = 0; delete S.wallHp[i]; } G.W.touchWalk();
  const done = work(op12, 400, () => watch() || !A.live(op12));
  if (!done || op12.st !== 'ok') tell('p12', op12);
  ok('p12 o cais sem caminho', cut && paused && !later && n1 === n0 && straight >= 6 - 1e-6 && Math.abs(kept - 14) < 1e-6 && done && op12.st === 'ok' && op12.done.sal === 14 && !bad().length,
    `${cut ? 'o caminho do cais ao armazém foi cortado' : 'o caminho NÃO foi cortado'}; a descarga ${paused ? 'parou (sem caminho)' : 'NÃO parou (' + A.STATES[op12.st] + (op12.wait ? ' ' + op12.wait : '') + ')'}; ${later ? later + ' tentativa(s) de ir às caixas depois de parada' : 'ninguém ficou tentando chegar lá'}; o navio seguinte: ${n1 === n0 ? 'nenhuma caixa no cais isolado' : (n1 - n0) + ' caixa(s) no cais isolado'}, ${straight} de 6 direto ao armazém; nada sumiu (${kept} de 14); aberto o caminho: ${A.STATES[op12.st]}, chegou ${op12.done.sal} de 14`);
}
// ---------------- p10: fire on the quay: what burns is lost, with its cause; the books close
{
  fresh();
  const op10 = land('sal', 14); fac.stock.sal = Math.min(fac.stock.sal, 20);
  const i = G.W.idx(dock.x + 1, dock.y + 1); const lit = G.Nature.ignite(i, 0.95);
  live(8, () => watch());
  for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const x = dock.x + 1 + dx, y = dock.y + 1 + dy; if (G.W.inb(x, y)) G.Nature.extinguish(G.W.idx(x, y), 2); }
  const done = work(op10, 400, () => watch() || !A.live(op10));
  if (!done) tell('p10', op10);
  const burnt = book(op10, 'fogo'); const lost = (op10.lost || {}).sal || 0; const got = (op10.done || {}).sal || 0;
  ok('p10 fogo no cais', lit && burnt.length >= 1 && lost > 0 && Math.abs(got + lost - 14) < 0.01 && done && !bad().length,
    `${lit ? 'o cais pegou fogo' : 'o fogo NÃO pegou'}; ${burnt.length} caixa(s) queimadas (${r2(lost)} de sal perdidos, cada um com a causa no livro-razão: fogo); chegou ${r2(got)}; ${r2(got)} + ${r2(lost)} = 14: as contas fecham; ${A.STATES[op10.st]} (${op10.end && op10.end.why})`);
}
const e = M.erros();
if (others.size) console.log(`   (o verificador, em outros sistemas, durante o cenário: ${[...others.keys()].slice(0, 6).join(' · ')}${others.size > 6 ? ` · e mais ${others.size - 6}` : ''})`);
ok('limpo', M.limpo() && !bad().length, M.limpo() ? 'sem erro de módulo nem aviso no console' : JSON.stringify(e.mod) + ' ' + e.console.slice(0, 4).join(' | '));
console.log(fails.length ? `PORTO: FALHOU (${fails.join(', ')})` : 'PORTO: ok');
process.exit(fails.length ? 1 : 0);
