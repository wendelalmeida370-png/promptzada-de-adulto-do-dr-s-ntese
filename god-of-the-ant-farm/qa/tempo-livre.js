// tempo-livre: o tempo livre no bairro (Bairros Vivos, D-157).   [ONLY=t1,t3] node qa/tempo-livre.js [mundo]
// Na hora livre todo mundo descansava na fogueira da praça — a de uma metrópole de sete bairros também —, e o freguês ia à
// taverna mais perto de onde estava. Agora, numa cidade de bairros, quem mora longe da fogueira descansa à porta de casa (a
// rua do bairro tem gente); e, de duas tavernas ao alcance, o freguês vai à das suas ruas (o caminho até lá e metade do
// caminho dela até em casa) — menos o marinheiro no dia da volta, que bebe onde desembarcou (a taverna do porto, D-155).
// t1 quem mora longe da fogueira descansa à porta de casa: sentado a dois passos da porta, virado para a rua, e a tela diz;
// t2 quem mora ao pé da fogueira descansa nela; e numa cidade sem bairros todos descansam na fogueira (a regra);
// t3 de duas tavernas abertas, o freguês vai à das suas ruas — a mais perto de onde ele está é a outra; sem o peso da casa
//    (T.HOME = 0) iria à outra;
// t4 quem voltou do mar hoje (qualquer que seja o ofício agora) bebe onde está: a taverna mais perto;
// e nenhum erro.
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const WORLD = process.argv[2] || 'metropole';
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const on = k => !ONLY || ONLY.includes(k);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | tempo-livre ${name} | ${info}`); if (!c) fails.push(name); };
const Vg = G.Vg, U = G.Urban, T = G.Taverna, E = G.Eco, D = G.Depot, V = G.Village, W = G.W;
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
let S = M.pronto(WORLD);
const base = new Set(QA.check().filter(q => q.sev <= 2).map(q => q.sys + '|' + q.msg));
const novas = () => QA.check().filter(q => q.sev <= 2 && !base.has(q.sys + '|' + q.msg)).map(q => `[S${q.sev}] ${q.sys}: ${q.msg}`);
const fireOf = set => set && S.buildings.get(set.campfire);
const free = v => v.age >= 18 && v.age < 60 && !v.captive && !v.jail && !v.aboard && !v.ug && !v.held && !v.air && !v.inside && v.hp > 60 && !(v.carry && v.carry.n > 1e-6) && !(v.task && (v.task.pri || 0) >= 1) && !(S.avatar && S.avatar.id === v.id) && !(G.Expe && G.Expe.memberOf(v.id));
const homeOf = v => v.home && S.buildings.get(v.home);
// a rest given as the free choice gives it, lived until the person sits (or the world calls them away) — held by the test's
// hand above the day's small calls (0,9: a purchase for home, of 0,35, took the first two before they sat), as the termas'
// bathers are: the case is where one rests, not whether the evening lets one
function rest(v) {
  god(() => { Vg.endTask(v); v.sleeping = false; v.hunger = Math.min(v.hunger, 20); v.energy = Math.max(v.energy, 80); Vg.setTask(v, { type: 'rest', pri: 0.9 }); });
  // (seated: the step of the arrival sets the errand's stage, the next one the gesture — one step more, or the look falls
  // between the two: T-924)
  for (let t = 0; t < 90; t++) { M.viver(0.5); if (!v.task || v.task.type !== 'rest') return null; if (v.task.st === 2) { const k = v.task; M.viver(0.1); return v.task === k ? k : null; } }
  return null;
}

// the biggest town of quarters with a fire
const town = [...S.settlements.values()].filter(s => G.Fac.get(s.fac) && U.districtsOf(s).length >= 2 && fireOf(s)).sort((a, b) => V.pop(b.id) - V.pop(a.id) || a.id - b.id)[0] || null;
S.time = 0.62;

// ---------------------------------------------------------------- t1
if (on('t1')) {
  const cf = fireOf(town); let done = false; const tried = [];
  for (const v of town ? [...S.villagers.values()].filter(o => o.set === town.id && free(o) && homeOf(o) && G.dist(homeOf(o).x, homeOf(o).y, cf.x, cf.y) > Vg.REST_FAR + 4 && W.reaches(o, ...Vg.door(homeOf(o)))).sort((a, b) => a.id - b.id).slice(0, 6) : []) {
    S.time = 0.62; const hm = homeOf(v); const t = rest(v); if (!t) { tried.push(`${v.name}: ${v.task ? v.task.type : 'sem tarefa'}`); continue; }
    const dr = Vg.door(hm); const dd = G.dist(v.x, v.y, dr[0], dr[1]), df = G.dist(v.x, v.y, cf.x + 0.5, cf.y + 0.5); const txt = Vg.taskText(v);
    // (facing the street: the point looked at is farther from the house than the person is)
    const out = G.dist(t.cx, t.cy, hm.x + 0.5, hm.y + 0.5) > G.dist(v.x, v.y, hm.x + 0.5, hm.y + 0.5);
    const q = U.at(hm.x, hm.y);
    ok('t1 quem mora longe da fogueira descansa à porta de casa', v.act === 'sit' && dd <= 2.6 && df > Vg.REST_FAR && t.door === hm.id && out && /porta de casa/.test(txt),
      `${v.name}, de ${town.name} (${U.districtsOf(town).length} bairros), casa em ${q && !q.whole ? q.name : 'a cidade'} a ${G.dist(hm.x, hm.y, cf.x, cf.y).toFixed(0)} casas da fogueira: sentad${v.g === 'f' ? 'a' : 'o'} a ${dd.toFixed(1)} da porta (a ${df.toFixed(0)} da fogueira), ${out ? 'virado para a rua' : 'virado para a CASA'}; «${txt}»`);
    done = true; break;
  }
  if (!done) ok('t1 quem mora longe da fogueira descansa à porta de casa', false, town ? `ninguém chegou a sentar (${tried.join('; ') || 'nenhum morador livre longe da fogueira'})` : 'nenhuma cidade de bairros com fogueira');
}

// ---------------------------------------------------------------- t2
if (on('t2')) {
  const cf = fireOf(town); let done = false; const tried = [];
  for (const v of town ? [...S.villagers.values()].filter(o => o.set === town.id && free(o) && homeOf(o) && G.dist(homeOf(o).x, homeOf(o).y, cf.x, cf.y) <= Vg.REST_FAR).sort((a, b) => a.id - b.id).slice(0, 6) : []) {
    S.time = 0.62; const t = rest(v); if (!t) { tried.push(`${v.name}: ${v.task ? v.task.type : 'sem tarefa'}`); continue; }
    const df = G.dist(v.x, v.y, cf.x + 0.5, cf.y + 0.5); const txt = Vg.taskText(v);
    ok('t2 quem mora ao pé da fogueira descansa nela', v.act === 'sit' && df <= 2.6 && !t.door && /fogueira/.test(txt), `${v.name}, casa a ${G.dist(homeOf(v).x, homeOf(v).y, cf.x, cf.y).toFixed(0)} da fogueira: sentad${v.g === 'f' ? 'a' : 'o'} a ${df.toFixed(1)} dela; «${txt}»`);
    done = true; break;
  }
  if (!done) ok('t2 quem mora ao pé da fogueira descansa nela', false, `ninguém chegou a sentar (${tried.join('; ') || 'nenhum morador livre ao pé da fogueira'})`);
  // (the rule, in a town with no quarters: the fire, wherever one lives)
  const small = [...S.settlements.values()].filter(s => G.Fac.get(s.fac) && U.districtsOf(s).length < 2 && fireOf(s)).sort((a, b) => V.pop(b.id) - V.pop(a.id) || a.id - b.id)[0] || null;
  const far = small ? [...S.villagers.values()].filter(o => o.set === small.id && homeOf(o)).sort((a, b) => G.dist(homeOf(b).x, homeOf(b).y, fireOf(small).x, fireOf(small).y) - G.dist(homeOf(a).x, homeOf(a).y, fireOf(small).x, fireOf(small).y) || a.id - b.id)[0] : null;
  ok('t2 numa cidade sem bairros todos descansam na fogueira', !!far && Vg.restAtDoor(far, small, fireOf(small)) === null && !!town && Vg.restAtDoor([...S.villagers.values()].find(o => o.set === town.id && homeOf(o) && G.dist(homeOf(o).x, homeOf(o).y, fireOf(town).x, fireOf(town).y) > Vg.REST_FAR), town, fireOf(town)) !== null,
    far ? `${small.name} (${U.districtsOf(small).length} bairro(s)): ${far.name}, a ${G.dist(homeOf(far).x, homeOf(far).y, fireOf(small).x, fireOf(small).y).toFixed(0)} da fogueira — a regra diz a fogueira; em ${town ? town.name : '—'}, a porta de casa` : 'nenhuma cidade sem bairros com fogueira e moradores');
}

// ---------------------------------------------------------------- t3, t4
if (on('t3') || on('t4')) {
  // a town with two taverns open in the evening; a resident who lives by one of them, set by the test's hand a little nearer
  // the other
  S.time = 0.64; let pick = null; const why = [];
  for (const set of [...S.settlements.values()].filter(s => G.Fac.get(s.fac) && E.byType(s.id, 'taverna').length >= 2).sort((a, b) => V.pop(b.id) - V.pop(a.id) || a.id - b.id)) {
    for (let t = 0; t < 60 && E.byType(set.id, 'taverna').filter(b => T.aberta(b)).length < 2; t++) { M.viver(1); if (S.time > 0.7) S.time = 0.64; }
    const tv = E.byType(set.id, 'taverna').filter(b => T.aberta(b)).sort((a, b) => a.id - b.id); if (tv.length < 2) { why.push(`${set.name}: ${tv.length} taverna(s) aberta(s)`); continue; }
    let best = null;
    for (const v of [...S.villagers.values()].filter(o => o.set === set.id && free(o) && homeOf(o) && E.homeOf(o)).sort((a, b) => a.id - b.id)) for (const [A, B] of [[tv[0], tv[1]], [tv[1], tv[0]]]) {
      const hm = homeOf(v); const hA = G.dist(hm.x, hm.y, A.x, A.y), hB = G.dist(hm.x, hm.y, B.x, B.y); if (!best || hA - hB > best.gap) best = { v, A, B, gap: hA - hB, hA, hB };
    }
    if (!best || best.gap < 8) { why.push(`${set.name}: ninguém mora bem mais perto de uma das duas`); continue; }
    // (a point between the two, nearer A, where the way to B and half of B's way home is still the shorter)
    const { v, A, B, hA, hB } = best; const L = G.dist(A.x, A.y, B.x, B.y); const f = Math.min(0.46, Math.max(0.2, 0.5 + (hB - hA) / (4 * L) + 0.06));
    const p = W.nearestLand(A.x + (B.x - A.x) * f, A.y + (B.y - A.y) * f, 4); if (!p) { why.push(`${set.name}: sem chão entre as duas`); continue; }
    god(() => { Vg.endTask(v); v.inside = 0; v.x = p[0]; v.y = p[1]; v.path = null; v.sleeping = false; v.energy = Math.max(v.energy, 80); v.hunger = Math.min(v.hunger, 30); const h = E.homeOf(v); if ((h.coin || 0) < 5) D.make('h:' + h.id, 'moedas', 5, { code: 'teste' }); });
    const dA = G.dist(v.x, v.y, A.x, A.y), dB = G.dist(v.x, v.y, B.x, B.y);
    if (!(dA < dB - 0.5) || dA >= 30 || dB >= 30 || !W.reaches(v, ...Vg.door(A)) || !W.reaches(v, ...Vg.door(B))) { why.push(`${set.name}: o ponto entre as duas não serve (a ${dA.toFixed(0)} e a ${dB.toFixed(0)})`); continue; }
    pick = { set, v, A, B, dA, dB, hA, hB }; break;
  }
  if (!pick) { if (on('t3')) ok('t3 de duas tavernas abertas, o freguês vai à das suas ruas', false, `sem o cenário (${why.join('; ') || 'nenhuma cidade com duas tavernas'})`); if (on('t4')) ok('t4 o marinheiro que voltou do mar hoje bebe onde está', false, 'sem o cenário'); }
  else {
    const { set, v, A, B, dA, dB, hA, hB } = pick; const choose = () => god(() => { Vg.endTask(v); const t = T.visitTask(v, Vg.H); const id = t ? t.id : 0; Vg.endTask(v); return id; });
    const nmT = b => `a taverna #${b.id}`;
    if (on('t3')) {
      const got = choose(); const h0 = T.HOME; T.HOME = 0; const plain = choose(); T.HOME = h0; const nv = novas();
      ok('t3 de duas tavernas abertas, o freguês vai à das suas ruas', got === B.id && plain === A.id && !nv.length,
        `${v.name}, de ${set.name}: está a ${dA.toFixed(0)} casas d${nmT(A)} e a ${dB.toFixed(0)} d${nmT(B)}; mora a ${hA.toFixed(0)} da primeira e a ${hB.toFixed(0)} da segunda — foi ${got === B.id ? 'à da sua rua' : got === A.id ? 'à MAIS PERTO' : 'a NENHUMA'}; sem o peso da casa iria ${plain === A.id ? 'à mais perto' : plain === B.id ? 'à da sua rua' : 'a nenhuma'}; verificador: ${nv.length ? nv.slice(0, 2).join(' | ') : 'limpo'}`);
    }
    if (on('t4')) {
      // (the test's hand makes this resident one of a crew home from the sea today: the field the homecoming writes —
      // marinheiros m2 —, whatever the trade: the leave is of who came home, not of the trade)
      const st0 = Object.assign({}, v.st); v.st.volta = S.day; const leave = G.Harbor.shoreLeave(v);
      const got = choose(); v.st.volta = S.day - 1; const next = choose(); v.st = st0;
      ok('t4 quem voltou do mar hoje bebe onde está', leave && got === A.id && next === B.id, `${v.name} (${v.role || 'sem ofício'}) de volta do mar hoje: ${got === A.id ? 'a taverna mais perto' : 'a da sua rua'}; no dia seguinte: ${next === B.id ? 'a da sua rua, como todos' : 'a mais perto'}`);
    }
  }
}

ok('nenhum erro', M.limpo(), M.limpo() ? 'nenhum erro de módulo, nenhum aviso' : JSON.stringify(M.erros()).slice(0, 300));
console.log(fails.length ? `TEMPO-LIVRE: FALHOU (${fails.length})` : 'TEMPO-LIVRE: PASSOU');
process.exit(fails.length ? 1 : 0);
