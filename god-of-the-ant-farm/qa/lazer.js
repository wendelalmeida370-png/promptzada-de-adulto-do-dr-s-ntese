// lazer: o teatro e a biblioteca num mundo pronto (act-lazer.js; o adendo 4.3), em Node, pelo qa/nodemundo.js — o mundo de
// verdade: os atores e o público pelas tarefas deles, a hora, o dinheiro das casas, o tesouro, a pesquisa do povo.
//  l1 um espetáculo inteiro: as portas abrem com os atores do teatro, eles vão ao palco, o público vem pela porta do lazer
//     (G.Teatro.visit) e paga a entrada, a peça começa na hora e acaba nos aplausos; o caixa, o cachê e a plateia contra o livro
//     e o verificador; fecha, e ninguém fica lá dentro
//  l2 um save no meio da peça, carregado duas vezes, vive o mesmo futuro
//  l3 os atores morrem no meio da peça: ela para (uns segundos sem ninguém no palco), o público vai embora, nada some
//  l4 o deus derruba o teatro no meio da peça: o espetáculo acaba ali, todos saem
//  l5 a leitura: quem vem ler à biblioteca soma à pesquisa do povo o que o livro da biblioteca diz (os leitores descansados,
//     alimentados, de mãos livres, não mercadores, os mais perto da porta primeiro, T-297)
//  l6 a saída do fim da tarde: sem a mão da prova, gente da cidade escolhe o teatro por conta própria (G.Teatro.urge, a escolha
//     da pessoa ao lado da taverna e de casa), paga, assiste e aplaude
//  e nenhum erro de módulo nem aviso no console.
//   node qa/lazer.js [mundo]    (rodar pela catraca: bash SP/onda2/catraca.sh node qa/lazer.js)
const M = require('./nodemundo.js'); const G = M.load({ qa: true, extra: ['qa/oficio-inv.js'] });
const D = G.Depot, A = G.Act, Tt = G.Teatro, Bi = G.Biblioteca, E = G.Eco, V = G.Village;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | lazer ${name} | ${info}`); if (!c) fails.push(name); };
const world = process.argv[2] || 'metropole';
// (the snapshot after the trades the world's own step deals out once the world is open — a load gives them back as they
// were saved, L-419, and the ready worlds of the generation 7 are older than the trades of the Patch 2, which the load of
// before dealt at once; the twelve seconds stay for any world, a save of before too, T-298)
M.pronto(world); M.viver(12);
const snap = G.Save.serialize();
const fresh = () => { M.reseed(4242); G.Save.apply(JSON.parse(snap)); G.Main.mode = 'game'; if (G.UI && G.UI.setSpeed) G.UI.setSpeed(0); };
const S = () => G.S;
const r2 = x => Math.round(x * 100) / 100;
const rule = QA.oficio; // (the trades' rule by its name: oficio-inv.js has more than one)
const watch = bad => rule((sys, sev, msg) => { if (sys === 'oficio' && sev <= 2 && bad.length < 6 && !bad.includes(`S${sev} ${msg}`)) bad.push(`S${sev} ${msg}`); }, S());
const liveSec = (sec, until, bad, each) => { for (let k = 0; k < sec; k++) { M.viver(1); if (each) each(); if (bad && k % 5 === 4) watch(bad); if (until && until()) return true; } return false; };
const seen = []; D.onMove.push(e => { seen.push(e); });
G.inSim++;
// the theatre of the tests: in the most peopled town of coin (else of any)
const pickT = () => { let best = null; for (const b of S().buildings.values()) { if (b.type !== 'teatro' || !b.built) continue; const sc = (Tt && E.coinage(V.facOfSet(b.set)) ? 1e6 : 0) + V.pop(b.set); if (!best || sc > best.sc) best = { b, sc }; } return best && best.b; };
const P = pickT();
if (!P) { console.log(`FALHOU | lazer mundo | ${world}: nenhum teatro`); process.exit(1); }
const town = () => S().settlements.get(P.set);
console.log(`${world}: ${V.buildName(P)} #${P.id} de ${town().name} (${(G.Fac.get(V.facOfSet(P.set)) || {}).civ}, ${V.pop(P.set)} habitantes); portas ${Tt.horas(P).abre}, peça ${Tt.horas(P).peca}`);
// (its actors: the ones the town's sharing of the trades gives it — or, the trade not given yet in this world made before it,
// two grown ones of the town taking it up, as one takes up a trade)
function actors(b) {
  liveSec(12, () => Tt.actorsOf(b).length >= 1);
  let n = Tt.actorsOf(b).length;
  for (const v of [...S().villagers.values()].sort((a, c) => a.id - c.id)) {
    if (n >= 2) break;
    if (v.set !== b.set || v.age < 18 || v.age > 55 || v.captive || v.jail || v.aboard || v.role === 'ator' || v.role === 'guerreiro' || (S().avatar && S().avatar.id === v.id)) continue;
    v.role = 'ator'; v.job = b.id; G.Vg.endTask(v); n++;
  }
  return Tt.actorsOf(b);
}
// (the afternoon before the theatre opens its preparation — at the hour its farthest actor needs to walk to the stage, L-425:
// the clock set just before it, once the actors are known)
function ready(b) { S().time = Tt.EARLY - 0.02; S().weather.rain = 0; if (S().weather.storm) S().weather.storm = 0; const cast = actors(b); S().time = Math.max(S().time, Tt.opensAt(b) - 0.01); return cast; }
// (who chooses the theatre: grown townsfolk free of weightier errands, with the entry in the house — the choice of the evening
// out, as the villagers' decide makes it: the errand of the show, of the kind 'teatro')
function audience(b, n) {
  const out = [];
  for (const v of [...S().villagers.values()].sort((a, c) => a.id - c.id)) {
    if (out.length >= n) break;
    if (v.set !== b.set || v.age < 16 || v.age > 60 || v.captive || v.jail || v.aboard || v.sleeping || v.inside || (v.task && (v.task.pri || 0) >= 1) || v.role === 'ator') continue;
    const t = Tt.visit(v, b); if (t) { t.kind = 'teatro'; out.push(v); }
  }
  return out;
}
const digest = op => JSON.stringify([op.st, op.data.fase, op.data.entradas, op.data.receita, op.data.pagos, op.data.vistos, Object.keys(op.data.plateia).sort(), Object.keys(op.data.atores).sort(), S().rng]);

// ---------------- l1 a whole show ----------------
{
  fresh(); const b = S().buildings.get(P.id); const cast = ready(b); const bad = []; seen.length = 0;
  const opened = liveSec(20, () => !!Tt.dia(b), bad); const op = Tt.dia(b);
  let strangers = 0, most = 0;
  if (op) {
    audience(b, 6); liveSec(4);
    audience(b, 4);
    liveSec(160, () => !A.live(op), bad, () => { if (!A.live(op)) return; most = Math.max(most, Object.keys(op.data.plateia).length); for (const id of Object.keys(op.data.plateia)) { const v = S().villagers.get(+id); if (v && v.set !== b.set) strangers++; } });
  }
  const paid = op ? r2(seen.filter(e => e[7] === op.id && e[5] === 'moedas' && (e[8] === 'teatro' || e[8] === 'teatro-volta')).reduce((n, e) => n + (e[8] === 'teatro' ? e[6] : -e[6]), 0)) : 0;
  const wages = op ? r2(seen.filter(e => e[7] === op.id && e[8] === 'salario').reduce((n, e) => n + e[6], 0)) : 0;
  const left = [...S().villagers.values()].filter(v => v.inside === b.id && v.task && (v.task.type === 'teatro' || v.task.type === 'atuar')).length;
  const played = op && (op.log || []).some(l => l[2] === 'peca');
  ok('l1 um-espetaculo', opened && !!op && !A.live(op) && op.st === 'ok' && played && op.data.vistos >= 1 && !strangers && !left && Math.abs(paid - op.data.receita) < 0.01 && Math.abs(wages - op.data.pagos) < 0.01 && !bad.length,
    op ? `${cast.length} atores; ${op.data.entradas} entradas, ${most} na plateia no máximo, ${op.data.vistos} viram a peça; caixa ${op.data.receita} (o livro ${paid}), cachês ${op.data.pagos} (o livro ${wages}); ${op.st} (${op.end ? op.end.why : ''}); ${left} lá dentro depois; ${bad.slice(0, 2).join(' | ') || 'verificador limpo'}` : `não abriu (${cast.length} atores)`);
}
// ---------------- l2 a save in the middle of the play, loaded twice ----------------
{
  fresh(); const b = S().buildings.get(P.id); ready(b);
  liveSec(20, () => !!Tt.dia(b)); const op = Tt.dia(b);
  if (op) { audience(b, 6); liveSec(80, () => !A.live(op) || op.data.fase === 'peca'); liveSec(8); }
  const mid = op && A.live(op) && op.data.fase === 'peca' ? G.Save.serialize() : null; const opId = op ? op.id : 0;
  const run = () => { M.reseed(4242); G.Save.apply(JSON.parse(mid)); G.Main.mode = 'game'; liveSec(40); const o = A.get(opId); return o ? digest(o) : 'sem o espetáculo'; };
  const a = mid ? run() : '', c = mid ? run() : '';
  ok('l2 save-no-meio-da-peca', !!mid && a === c, !mid ? 'a peça não chegou a começar' : a === c ? `o mesmo futuro (${a.slice(0, 120)})` : `${a} ≠ ${c}`);
}
// ---------------- l3 the actors die in the middle of the play ----------------
{
  fresh(); const b = S().buildings.get(P.id); ready(b); const bad = [];
  liveSec(20, () => !!Tt.dia(b)); const op = Tt.dia(b);
  if (op) { audience(b, 6); liveSec(80, () => !A.live(op) || op.data.fase === 'peca'); }
  const playing = !!op && A.live(op) && op.data.fase === 'peca'; const had = op ? Object.keys(op.data.plateia).length : 0;
  if (playing) for (const id of Object.keys(op.data.atores)) { const v = S().villagers.get(+id); if (v) V.kill(v, 'teste', true); }
  const stopped = playing && liveSec(40, () => !A.live(op), bad);
  const stuck = [...S().villagers.values()].filter(v => v.task && v.task.type === 'teatro' && v.task.id === b.id).length;
  ok('l3 os-atores-morrem', playing && stopped && op.st === 'int' && !stuck && !bad.length, playing ? `${had} na plateia: a peça ${op.st} (${op.end ? op.end.why : ''}), ${stuck} ainda lá; ${bad.slice(0, 2).join(' | ') || 'verificador limpo'}` : 'a peça não chegou a começar');
}
// ---------------- l4 the god pulls the theatre down in the middle of the play ----------------
{
  fresh(); const b = S().buildings.get(P.id); ready(b);
  liveSec(20, () => !!Tt.dia(b)); const op = Tt.dia(b);
  if (op) { audience(b, 6); liveSec(80, () => !A.live(op) || op.data.fase === 'peca'); }
  const playing = !!op && A.live(op); const had = op ? Object.keys(op.data.plateia).length : 0;
  if (playing) { V.destroyBuilding(b, 'teste'); liveSec(3); }
  const stuck = [...S().villagers.values()].filter(v => v.task && (v.task.type === 'teatro' || v.task.type === 'atuar') && v.task.id === b.id).length;
  ok('l4 o-teatro-cai', playing && !A.live(op) && op.st === 'int' && !stuck, playing ? `${had} na plateia: o espetáculo ${op.st} (${op.end ? op.end.why : ''}); ${stuck} ainda lá` : 'não abriu');
}
// ---------------- l5 the reading ----------------
{
  fresh(); let lib = null;
  // (a library of a people with writing — one with something still to learn first: a people that knows every art counts the
  // readings in the library's day and adds nothing to a research it no longer has, as the game says)
  const learning = f => !!(f && f.tech && (f.tech.cur || (G.Civ && G.Civ.nextTech && G.Civ.nextTech(f))));
  const libs = [...S().buildings.values()].filter(b => { if (b.type !== 'biblioteca' || !b.built) return false; const f = G.Fac.get(V.facOfSet(b.set)); return !!(f && f.tech && f.tech.known && f.tech.known.escrita); });
  lib = libs.find(b => learning(G.Fac.get(V.facOfSet(b.set)))) || libs[0] || null;
  const learns = !!lib && learning(G.Fac.get(V.facOfSet(lib.set)));
  if (!lib) ok('l5 a-leitura', true, 'nenhuma biblioteca de um povo com escrita: sem o caso');
  else {
    S().time = 0.35; const bad = []; const k0 = Bi.book(lib); const l0 = k0.lidos, p0 = k0.pts, c0 = k0.copias;
    // (the readers: free grown ones by the leisure door of one with no work to do, as the villagers' workTask gives it — the
    // errand of the kind 'work', a leisure —, with free hands, no caravan's merchant, the nearest the door first, and rested
    // and fed as one who goes out to read in the morning (the test's hand: energy 70, hunger 30), and the errand held above the
    // day's calls below 3 (the line of the D-094, as the e2 of the termas.js): a reading is the lightest errand of the world
    // (0.35), and in the branch joined with b8c072c the first four of the town by the id left it on the way — one to eat, one
    // to sleep and then to flee, one to a caravan, one to a purchase of the house —, and with 8e432b8 the four nearest the
    // door, to the house's water (1,05) and purchases (1,02): none came to read. The case is the reading counted, T-297)
    const dr = G.Vg.door(lib); const far = v => G.dist2(v.x, v.y, dr[0], dr[1]);
    const rs = []; for (const v of [...S().villagers.values()].filter(v => v.set === lib.set).sort((a, c) => far(a) - far(c) || a.id - c.id)) { if (rs.length >= 4) break; if (v.age < 16 || v.captive || v.jail || v.aboard || v.sleeping || v.inside || v.merchant || (v.carry && v.carry.n > 1e-6) || (v.task && (v.task.pri || 0) >= 1)) continue; const t = Bi.visit(v, lib); if (t) { v.energy = Math.max(v.energy, 70); v.hunger = Math.min(v.hunger, 30); t.kind = 'work'; t.leisure = true; t.pri = 2.9; rs.push(v); } }
    liveSec(60, () => rs.every(v => !(v.task && v.task.type === 'ler')), bad);
    const k = Bi.book(lib); const read = k.lidos - l0;
    const want = learns ? r2(read * Bi.READ + (k.copias - c0) * Bi.COPY) : 0;
    ok('l5 a-leitura', rs.length >= 1 && read >= 1 && Math.abs((k.pts - p0) - want) < 0.01 && !bad.length, `${rs.length} vieram ler ${n(lib)}: ${read} leituras contadas, a pesquisa do povo +${r2(k.pts - p0)} pela biblioteca${learns ? '' : ' (o povo já sabe todas as artes: nada a somar)'}; ${bad.slice(0, 2).join(' | ') || 'verificador limpo'}`);
  }
}
// ---------------- l6 the evening out, by the townsfolk's own choice ----------------
{
  fresh(); const b = S().buildings.get(P.id); const cast = ready(b); const bad = [];
  liveSec(20, () => !!Tt.dia(b), bad); const op = Tt.dia(b); const came = new Set();
  if (op) liveSec(160, () => !A.live(op), bad, () => { if (A.live(op)) for (const id of Object.keys(op.data.plateia)) came.add(+id); });
  const kinds = {}; for (const id of came) { const v = S().villagers.get(id); const k = v ? v.role : 'morto'; kinds[k] = (kinds[k] || 0) + 1; }
  ok('l6 a-saida-da-tarde', !!op && came.size >= 1 && op.data.vistos >= 1 && op.st === 'ok' && !bad.length, op ? `${cast.length} atores; ${came.size} vieram por conta própria (${JSON.stringify(kinds)}), ${op.data.entradas} entradas, ${op.data.vistos} viram a peça; caixa ${op.data.receita}; ${op.st} (${op.end ? op.end.why : ''}); ${bad.slice(0, 2).join(' | ') || 'verificador limpo'}` : 'não abriu');
}
// ---------------- l7 the actor from the far end of the town (L-425) ----------------
// (one actor only — the other's trade let go for the case —, put by the god's hand some 40 tiles from the theatre's door on
// ground the town walks, in the afternoon: the preparation opens in time for his walk, and the play is played. Called at
// 0,50, as before, he came after the cancelling at 0,63, «sem atores»)
const solo = (b, cast) => { const a = cast[0]; for (const o of cast.slice(1)) { o.role = 'coletor'; o.job = 0; G.Vg.endTask(o); } return a; };
// (a tile of the town's ground some 40 tiles from the door — the nearest to 40 —, free, that the actor reaches: by the map of
// regions, the theatre's door is reached from it too)
const farSpot = (b, v) => { const W = G.W, dr = G.Vg.door(b); let best = null, bd = Infinity; for (let y = 0; y < G.N; y++) for (let x = 0; x < G.N; x++) { const d = Math.hypot(x + 0.5 - dr[0], y + 0.5 - dr[1]); if (d < 38 || d > 44 || Math.abs(d - 40) >= bd) continue; const i = W.idx(x, y); if (!W.walkable(i) || S().occ[i] || !W.reaches(v, x + 0.5, y + 0.5)) continue; best = [x + 0.5, y + 0.5]; bd = Math.abs(d - 40); } return best; };
{
  fresh(); const b = S().buildings.get(P.id); S().time = Tt.EARLY - 0.02; S().weather.rain = 0; if (S().weather.storm) S().weather.storm = 0;
  const cast = actors(b); const a = cast.length ? solo(b, cast) : null; const sp = a ? farSpot(b, a) : null; const bad = [];
  if (a && sp) { G.Vg.endTask(a); a.x = sp[0]; a.y = sp[1]; a.path = null; a.inside = 0; a.sleeping = false; a.energy = 90; a.hunger = 20; }
  const dr = G.Vg.door(b); const far = a ? Math.round(G.dist(a.x, a.y, dr[0], dr[1])) : 0; const at = Tt.opensAt(b);
  let on = false; liveSec(200, () => { const o = Tt.dia(b); if (o && a && o.data.atores[a.id] && o.data.fase === 'peca') on = true; return !!o && !A.live(o); }, bad);
  const op = A.all().filter(o => o.def === 'espetaculo' && o.at === b.id).sort((p, q) => q.id - p.id)[0];
  ok('l7 o-ator-de-longe', !!a && !!sp && !!op && op.st === 'ok' && on && at < Tt.horas(b).prep && !bad.length, a && sp ? `${a.name}, o ator do dia, a ${far} casas da porta: o preparo abriu às ${r2(at)} (antes ${Tt.horas(b).prep}); ${on ? 'no palco na peça' : 'não chegou à peça'}; o espetáculo ${op ? op.st + ' (' + (op.end ? op.end.why : '') + ')' : 'não abriu'}; ${bad.slice(0, 2).join(' | ') || 'verificador limpo'}` : 'sem ator ou sem lugar longe');
}
// ---------------- l8 the hungry actor on the stage (L-426) ----------------
// (one actor only, on the stage when the play begins: with hunger 75 he plays it to its end — the meal of one not starving
// waits —; with hunger 90 he goes to eat, and with the stage empty the play stops: the starving still go)
function hungryActor(hunger) {
  fresh(); const b = S().buildings.get(P.id); const cast = ready(b); const a = cast.length ? solo(b, cast) : null; const bad = [];
  if (a) { a.energy = 90; a.hunger = 20; }
  liveSec(60, () => { const o = Tt.dia(b); return !!o && o.data.fase === 'peca' && !!o.data.atores[a.id]; }, bad);
  const op = Tt.dia(b); const started = !!op && op.data.fase === 'peca' && !!a && !!op.data.atores[a.id];
  if (started) a.hunger = hunger;
  // (who leaves the stage while the play is on — after the applause the stage is left anyway)
  let left = null; if (started) liveSec(60, () => { if (!left && op.data.fase === 'peca' && !op.data.atores[a.id] && a.task) left = a.task.type; return !A.live(op); }, bad);
  return { a, op, started, left, bad };
}
{
  const r = hungryActor(75);
  ok('l8 com-fome-75-termina', r.started && r.op.st === 'ok' && !r.left && !r.bad.length, r.started ? `${r.a.name}, com fome 75 no palco no começo da peça: ${r.left ? 'saiu para ' + r.left : 'ficou'}; o espetáculo ${r.op.st} (${r.op.end ? r.op.end.why : ''}), fome no fim ${Math.round(r.a.hunger)}; ${r.bad.slice(0, 2).join(' | ') || 'verificador limpo'}` : 'a peça não começou com ele no palco');
  const q = hungryActor(90);
  ok('l8 com-fome-90-sai', q.started && q.left === 'eat' && q.op.st === 'int' && !q.bad.length, q.started ? `${q.a.name}, com fome 90 no palco no começo da peça: ${q.left ? 'saiu para ' + q.left : 'ficou'}; o espetáculo ${q.op.st} (${q.op.end ? q.op.end.why : ''}); ${q.bad.slice(0, 2).join(' | ') || 'verificador limpo'}` : 'a peça não começou com ele no palco');
}
function n(b) { return 'n' + (G.gen(V.buildName(b)) === 'a' ? 'a ' : 'o ') + V.buildName(b).toLowerCase(); }
const err = M.erros(); ok('erros', !Object.keys(err.mod || {}).length && !err.console.length, JSON.stringify(err.mod) + ' ' + err.console.slice(0, 3).join(' | '));
console.log(fails.length ? `LAZER: FALHOU (${fails.join(', ')})` : 'LAZER: ok');
process.exit(fails.length ? 1 : 0);
