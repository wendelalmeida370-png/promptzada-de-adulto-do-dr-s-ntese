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
//     da pessoa ao lado da taverna e de casa), paga, assiste e aplaude — num dos três primeiros dias (o que a chama da plateia
//     depois é do mundo: uma história, T-404)
//  (e l7 a l11, mais abaixo; l12 o ator chamado, a caminho do palco e no preparo, não é levado por um afazer de fora — a mina
//  da caverna —, L-503; l13 a festa da cidade nas horas do espetáculo: o teatro não o abre naquele dia, e a festa que o deus
//  começa com a peça em cena a encerra ali, todos livres para a festa, D-130). Nos casos do teatro a tarde é calma: o tempo, a
//  cidade em paz (a paz divina do jogo) e sem a festa do dia, pela mão da prova (T-404); o público chamado pela mão vem quando as
//  portas abrem, os mais perto primeiro, e fica.
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
// (the afternoon of a show calm, as its weather: the town at peace — the god's peace over the world, the game's own power,
// G.Politics.divinePeace: the wars in truce, the bands gone home, no war declared for two days and a half, and the alarm of an
// attack over with them —, and its feast of the day kept for another day by the god's hand — festivals.js, the plan of the
// day, as the feira.js and the lar.js keep it: a day of the world is a year, and the feast calls the whole town, 3,2, the rows
// of a play too —. In the courses of other dice — the plans on the salts of the T-436 — Mênfis was attacked at 0,51 and the
// far actor of the l7, a mother, ran to the cave of the town (caves.js, refuge) and then fought; and its Bela Festa do Vale,
// at 0,62, in the play's time, took the audience of the l1 on its way in, T-404)
const calm = b => { const w = S().weather; w.rain = 0; if (w.storm) w.storm = 0; G.Politics.divinePeace(); for (const s of S().settlements.values()) if (s.alarmT > 0) s.alarmT = 0; const st = S().settlements.get(b.set); if (st) st.festPlan = { day: S().day, key: null, done: true }; };
// (the afternoon before the theatre opens its preparation — at the hour its farthest actor needs to walk to the stage, L-425:
// the clock set just before it, once the actors are known)
function ready(b) { S().time = Tt.EARLY - 0.02; calm(b); const cast = actors(b); S().time = Math.max(S().time, Tt.opensAt(b) - 0.01); return cast; }
// (the audience called when the doors open: Tt.visit takes nobody while the actors make ready behind closed doors — called in
// the preparation, the hand's audience of the l1 to the l4 never came, and the l1 hung on one who came by his own choice; on
// the dice of the T-436 a story called him from the rows (a saga, 1,02) four seconds into the play, «0 viram a peça», T-404)
function atDoors(b, op, bad) { liveSec(60, () => !A.live(op) || op.data.fase !== 'preparo', bad); const n = audience(b, 6).length; liveSec(4, null, bad); return n + audience(b, 4).length; }
// (who chooses the theatre: grown townsfolk free of weightier errands, with the entry in the house — the choice of the evening
// out, as the villagers' decide makes it: the errand of the show, of the kind 'teatro' —, the nearest its door first, set down
// by the door by the god's hand once the show takes them (the doors open), the errand held above the day's calls below 3 — the
// line of the D-094, as the readers of the l5 and the l9: the case is the show. Called at the doors of the generation-13
// metropolis from where they were, the hand's audience came from all over Mênfis — the nearest free ones 23 to 30 tiles away
// —: one in time, the others on their way still when the late door shut at 0,63; and a story took one from the rows, a saga of
// 1,02, T-404)
function audience(b, n) {
  const dr = G.Vg.door(b); const far = v => G.dist2(v.x, v.y, dr[0], dr[1]); const out = [];
  for (const v of [...S().villagers.values()].sort((a, c) => far(a) - far(c) || a.id - c.id)) {
    if (out.length >= n) break;
    if (v.set !== b.set || v.age < 16 || v.age > 60 || v.captive || v.jail || v.aboard || v.ug || v.sleeping || v.inside || (v.task && (v.task.pri || 0) >= 1) || v.role === 'ator') continue;
    const t = Tt.visit(v, b); if (t) { v.x = dr[0]; v.y = dr[1]; v.path = null; t.kind = 'teatro'; t.pri = 2.9; out.push(v); }
  }
  return out;
}
// (the company's other actors held from the stage by the hand of the proof while a case of its own cast is on: the town keeps
// two actors for each theatre and names new ones when a case takes its cast away — dead, sent to eat —, and one of them on his
// way to the stage took it six seconds later, and the play went on: in the branch with the quay's dockers of L-428, both l3
// and l8. A weightier errand a while, on the way or on the stage — the stage lets go of who left it, at its next look: T-303)
const holdOthers = (b, keep) => { for (const o of S().villagers.values()) if (o.role === 'ator' && o.job === b.id && !keep.includes(o.id) && o.task && o.task.type === 'atuar') G.Vg.give(o, { type: 'idle', pri: 3, wait: 10 }); };
// (the beasts that come at people kept away by the god's hand while a case of one person is on, round the places of the
// case — the stage, the way of the one watched —: the beasts of prey and the ones that turn on whoever hunts them, a rhino,
// an elephant, a boar. In the generation 11's Mênfis Kamose and Nefertari hunted rhinos and an elephant by the theatre and
// the library, and the angry beasts sent the actor of the l8 running from the stage ('flee', 5) before his hunger took him
// to eat. The case is the stage and the reading, not the hunt, as the rebanho.js keeps the beasts of prey from the pen
// (T-302), T-356)
const calmBeasts = (...at) => { for (const a of [...S().animals.values()]) { if (a.dead || a.dom || a.tamed) continue; const sp = G.Animals.DEF[a.kind]; if (!sp || !(G.Animals.predator(a.kind) || sp.defend || sp.bold > 0 || a.kind === 'boar' || G.Animals.threat(a))) continue; if (at.some(p => G.dist2(a.x, a.y, p[0], p[1]) < 40 * 40)) G.Animals.remove(a); } };
const digest = op => JSON.stringify([op.st, op.data.fase, op.data.entradas, op.data.receita, op.data.pagos, op.data.vistos, Object.keys(op.data.plateia).sort(), Object.keys(op.data.atores).sort(), S().rng]);

// ---------------- l1 a whole show ----------------
{
  fresh(); const b = S().buildings.get(P.id); const cast = ready(b); const bad = []; seen.length = 0;
  const opened = liveSec(20, () => !!Tt.dia(b), bad); const op = Tt.dia(b);
  let strangers = 0, most = 0;
  if (op) {
    atDoors(b, op, bad);
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
  if (op) { atDoors(b, op); liveSec(80, () => !A.live(op) || op.data.fase === 'peca'); liveSec(8); }
  const mid = op && A.live(op) && op.data.fase === 'peca' ? G.Save.serialize() : null; const opId = op ? op.id : 0;
  const run = () => { M.reseed(4242); G.Save.apply(JSON.parse(mid)); G.Main.mode = 'game'; liveSec(40); const o = A.get(opId); return o ? digest(o) : 'sem o espetáculo'; };
  const a = mid ? run() : '', c = mid ? run() : '';
  ok('l2 save-no-meio-da-peca', !!mid && a === c, !mid ? 'a peça não chegou a começar' : a === c ? `o mesmo futuro (${a.slice(0, 120)})` : `${a} ≠ ${c}`);
}
// ---------------- l3 the actors die in the middle of the play ----------------
{
  fresh(); const b = S().buildings.get(P.id); ready(b); const bad = [];
  liveSec(20, () => !!Tt.dia(b)); const op = Tt.dia(b);
  if (op) { atDoors(b, op); liveSec(80, () => !A.live(op) || op.data.fase === 'peca'); }
  const playing = !!op && A.live(op) && op.data.fase === 'peca'; const had = op ? Object.keys(op.data.plateia).length : 0;
  if (playing) { for (const id of Object.keys(op.data.atores)) { const v = S().villagers.get(+id); if (v) V.kill(v, 'teste', true); } holdOthers(b, []); }
  const stopped = playing && liveSec(40, () => !A.live(op), bad, () => holdOthers(b, []));
  const stuck = [...S().villagers.values()].filter(v => v.task && v.task.type === 'teatro' && v.task.id === b.id).length;
  ok('l3 os-atores-morrem', playing && stopped && op.st === 'int' && !stuck && !bad.length, playing ? `${had} na plateia: a peça ${op.st} (${op.end ? op.end.why : ''}), ${stuck} ainda lá; ${bad.slice(0, 2).join(' | ') || 'verificador limpo'}` : 'a peça não chegou a começar');
}
// ---------------- l4 the god pulls the theatre down in the middle of the play ----------------
{
  fresh(); const b = S().buildings.get(P.id); ready(b);
  liveSec(20, () => !!Tt.dia(b)); const op = Tt.dia(b);
  if (op) { atDoors(b, op); liveSec(80, () => !A.live(op) || op.data.fase === 'peca'); }
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
// (the day sought, three at most — each the next afternoon of the world, its weather and its peace kept by the hand as ready()
// keeps them —: the choice of the evening out is the townsfolk's, and what calls them from the rows after it is the world's.
// On the dice of the T-436 the one fisherman who came was called from the rows by a story (a saga, 1,02) four seconds into
// the play, «0 viram a peça»: the case is a day when one who came of his own choice sees the play to its end, T-404)
{
  fresh(); const b = S().buildings.get(P.id); const cast = ready(b); const bad = []; const days = [];
  let op = null, came = new Set();
  for (let k = 0; k < 3; k++) {
    if (k) { const d0 = S().day; liveSec(G.DAY_LEN, () => S().day > d0 && S().time >= Tt.EARLY - 0.02, bad); ready(b); }
    liveSec(20, () => !!Tt.dia(b), bad); op = Tt.dia(b); came = new Set();
    if (op) liveSec(160, () => !A.live(op), bad, () => { if (A.live(op)) for (const id of Object.keys(op.data.plateia)) came.add(+id); });
    days.push(op ? `${came.size} vieram, ${op.data.vistos} viram (${op.st})` : 'não abriu');
    if (op && came.size >= 1 && op.data.vistos >= 1 && op.st === 'ok') break;
  }
  const kinds = {}; for (const id of came) { const v = S().villagers.get(id); const k = v ? v.role : 'morto'; kinds[k] = (kinds[k] || 0) + 1; }
  const when = days.length > 1 ? ` — no ${days.length}º dia (antes: ${days.slice(0, -1).join('; ')})` : '';
  ok('l6 a-saida-da-tarde', !!op && came.size >= 1 && op.data.vistos >= 1 && op.st === 'ok' && !bad.length, op ? `${cast.length} atores; ${came.size} vieram por conta própria (${JSON.stringify(kinds)}), ${op.data.entradas} entradas, ${op.data.vistos} viram a peça; caixa ${op.data.receita}; ${op.st} (${op.end ? op.end.why : ''})${when}${days.length === 3 && !(came.size >= 1 && op.data.vistos >= 1) ? ' — em três dias, ninguém que veio por conta própria viu a peça até o fim' : ''}; ${bad.slice(0, 2).join(' | ') || 'verificador limpo'}` : `não abriu (${days.join('; ')})`);
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
  fresh(); const b = S().buildings.get(P.id); S().time = Tt.EARLY - 0.02; calm(b);
  const cast = actors(b);
  // (the clock set again once the actors are known, as ready() does: the theatre of the generation-13 metropole is Mênfis', whose
  // ceiling of the trades gives it no actor (D-090), and the twelve seconds actors() waits for the town's own ate the walk the
  // preparation gives the far one — called at 0,45, Ankhesen came to the door at 0,635, after the cancelling at 0,63, T-392 —;
  // the town at peace and without its feast through the walk, as the weather: calm(), T-404)
  S().time = Tt.EARLY - 0.02; calm(b);
  const a = cast.length ? solo(b, cast) : null; const sp = a ? farSpot(b, a) : null; const bad = [];
  if (a && sp) { G.Vg.endTask(a); a.x = sp[0]; a.y = sp[1]; a.path = null; a.inside = 0; a.sleeping = false; a.energy = 90; a.hunger = 20; }
  // (and his house's water in the jar — the chores of the house done before he set out, as the obra-longe.js does —: the
  // house's water (1,05, until 0,55) takes whoever of the house has nothing weightier, and the call to the stage is not given
  // over an errand above 1 — in the generation 11's Mênfis Tauret, put down far from the door, went for it at the first step
  // and spent the preparation carrying the jar home, «não chegou à peça», T-356)
  if (a && sp) { const h = S().buildings.get(a.home); if (h) h.water = 1; }
  const dr = G.Vg.door(b); const far = a ? Math.round(G.dist(a.x, a.y, dr[0], dr[1])) : 0; const at = Tt.opensAt(b);
  // (the case's own show, kept when it opens, and its end waited for: Tt.dia gives only a show alive, and the wait for its end
  // on it never ended — the case lived its 200 s and took the theatre's newest show, which in the tip a39483e, the case begun
  // later, was the next day's preparation, «on», T-310)
  let on = false, op = null; if (a) calmBeasts([a.x, a.y], dr);
  // (and his trade held by the god's hand, as the l8 holds its actor's: the board of Mênfis deals the actor made by the case off
  // the theatre every few seconds of her walk — the case is the far actor's walk, T-392)
  const keepTrade = () => { if (a && (a.role !== 'ator' || a.job !== b.id)) { a.role = 'ator'; a.job = b.id; } };
  // (her walk to the stage is the game's: the actor called is in the leg of the show, and an errand from outside waits — with
  // the calm afternoon of the T-404 the cave of Mênfis took her on her way to its mine (1,25), and the show was called off «sem
  // atores» at 0,63; the proof held her walk by its hand until the L-503 was mended)
  liveSec(200, () => { const o = Tt.dia(b); if (o && !op) op = o; if (o && a && o.data.atores[a.id] && o.data.fase === 'peca') on = true; return !!op && !A.live(op); }, bad, () => { keepTrade(); if (a) calmBeasts([a.x, a.y], dr); });
  ok('l7 o-ator-de-longe', !!a && !!sp && !!op && op.st === 'ok' && on && at < Tt.horas(b).prep && !bad.length, a && sp ? `${a.name}, o ator do dia, a ${far} casas da porta: o preparo abriu às ${r2(at)} (antes ${Tt.horas(b).prep}); ${on ? 'no palco na peça' : 'não chegou à peça'}; o espetáculo ${op ? op.st + ' (' + (op.end ? op.end.why : '') + ')' : 'não abriu'}; ${bad.slice(0, 2).join(' | ') || 'verificador limpo'}` : 'sem ator ou sem lugar longe');
}
// ---------------- l8 the hungry actor on the stage (L-426) ----------------
// (one actor only, on the stage when the play begins: with hunger 75 he plays it to its end — the meal of one not starving
// waits —; with hunger 90 he goes to eat, and with the stage empty the play stops: the starving still go)
function hungryActor(hunger) {
  fresh(); const b = S().buildings.get(P.id); const cast = ready(b); const a = cast.length ? solo(b, cast) : null; const bad = [];
  if (a) { a.energy = 90; a.hunger = 20; }
  const keep = a ? [a.id] : []; holdOthers(b, keep); const dr = G.Vg.door(b);
  // (and his trade kept by the god's hand for the case, as actors() gave it: a town whose ceiling of the trades leaves its
  // theatre no actor — D-090: the generation-12 metropole's only theatre is Mênfis's, of 24 grown ones, whose nine hands go
  // to the first nine kinds of workplaces — deals the one the case keeps to the fishing at its next pass, at 0,46, before the
  // play: the case is the hungry actor on the stage, not the board, T-377)
  const hold = () => { holdOthers(b, keep); if (a) { calmBeasts([a.x, a.y], dr); if (a.role !== 'ator' || a.job !== b.id) { a.role = 'ator'; a.job = b.id; } } }; hold();
  liveSec(60, () => { const o = Tt.dia(b); return !!o && o.data.fase === 'peca' && !!o.data.atores[a.id]; }, bad, hold);
  const op = Tt.dia(b); const started = !!op && op.data.fase === 'peca' && !!a && !!op.data.atores[a.id];
  if (started) a.hunger = hunger;
  // (who leaves the stage while the play is on — after the applause the stage is left anyway)
  let left = null; if (started) liveSec(60, () => { if (!left && op.data.fase === 'peca' && !op.data.atores[a.id] && a.task) left = a.task.type; return !A.live(op); }, bad, hold);
  return { a, op, started, left, bad };
}
{
  const r = hungryActor(75);
  ok('l8 com-fome-75-termina', r.started && r.op.st === 'ok' && !r.left && !r.bad.length, r.started ? `${r.a.name}, com fome 75 no palco no começo da peça: ${r.left ? 'saiu para ' + r.left : 'ficou'}; o espetáculo ${r.op.st} (${r.op.end ? r.op.end.why : ''}), fome no fim ${Math.round(r.a.hunger)}; ${r.bad.slice(0, 2).join(' | ') || 'verificador limpo'}` : 'a peça não começou com ele no palco');
  const q = hungryActor(90);
  ok('l8 com-fome-90-sai', q.started && q.left === 'eat' && q.op.st === 'int' && !q.bad.length, q.started ? `${q.a.name}, com fome 90 no palco no começo da peça: ${q.left ? 'saiu para ' + q.left : 'ficou'}; o espetáculo ${q.op.st} (${q.op.end ? q.op.end.why : ''}); ${q.bad.slice(0, 2).join(' | ') || 'verificador limpo'}` : 'a peça não começou com ele no palco');
}
// ---------------- l9 the reader the evening takes home (L-435) ----------------
// (an elder whose bed time comes before the library shuts — at 0,72 —, set down by its door a little before it, reads: the
// world takes her from the reading by its own calls — the family at the door, the bed — and she goes home to sleep. Asleep in
// her house, the library's book no longer has her, and the round trip through the save puts nobody out of bed. Khufu of the
// mundial, an elder, slept in his ínsula and woke from the load reading in the library: its book kept everyone who ever left
// the reading by another door, and the load sat them all down again)
const writers = () => [...S().buildings.values()].filter(b => { if (b.type !== 'biblioteca' || !b.built) return false; const f = G.Fac.get(V.facOfSet(b.set)); return !!(f && f.tech && f.tech.known && f.tech.known.escrita); });
const free = v => !(v.captive || v.jail || v.aboard || v.sleeping || v.merchant || (v.carry && v.carry.n > 1e-6) || A.isBody(v) || !V.livable(S().buildings.get(v.home)));
// (and her house hers through the evening: a family in need of a house — a tenant, a house too full, a couple in others'
// full house (G.Casa.need) — moves when the day of its town comes, and the town's housing (village.js, assignHousing) moves a
// grown one with no partner out of a crowded house, and one with a partner to the partner's: one of a family with where to
// live, whom the housing leaves where she is. Menkaure of the generation 11's Mênfis rented her sobrado ('aluga'): the day of
// Mênfis came at 0,74, on her way to bed, and her family took a house of its own; she slept in the sobrado, where her bed
// had taken her — her house no more —, and the case waited for her in the new one until the morning, T-356)
const settled = v => { const h = S().buildings.get(v.home); const cap = h && G.BDEF[h.type] ? G.BDEF[h.type].housing || 0 : 0; let n = 0; for (const o of S().villagers.values()) if (o.set === v.set && o.home === v.home && !o.captive) n++; const p = v.partner && S().villagers.get(v.partner); return n <= cap && !(p && p.set === v.set && p.home && p.home !== v.home) && !(G.Casa && G.Casa.need(v)); };
{
  fresh(); let pick = null;
  for (const lib of writers()) {
    const dr = G.Vg.door(lib);
    for (const v of [...S().villagers.values()].sort((a, c) => a.id - c.id)) if (v.set === lib.set && v.age >= 62 && free(v) && settled(v) && G.Lar.clock(v).bed < 0.712 && G.W.reaches(v, dr[0], dr[1])) { pick = { lib, v }; break; }
    if (pick) break;
  }
  if (!pick) ok('l9 a-leitora-vai-dormir', true, 'nenhum ancião de um povo com escrita que durma antes de a biblioteca fechar: sem o caso');
  else {
    const { lib, v } = pick; const dr = G.Vg.door(lib); const bed = G.Lar.clock(v).bed;
    S().time = bed - 0.04; S().weather.rain = 0; if (S().weather.storm) S().weather.storm = 0;
    G.Vg.endTask(v); v.x = dr[0]; v.y = dr[1]; v.path = null; v.inside = 0; v.energy = 70; v.hunger = 20;
    const t = Bi.visit(v, lib); let read = false; const calls = []; const bad = [];
    const home = () => !!v.task && v.task.type === 'sleep' && v.task.st >= 2 && v.sleeping && v.inside === v.home;
    // (a tenth of a second at a time: the reading may last a moment only — the family at the door took Citlali a second in)
    calmBeasts([v.x, v.y], dr);
    for (let k = 0; k < 1600 && !home(); k++) { M.viver(0.1); if (k % 10 === 9) calmBeasts([v.x, v.y], dr); if (k % 50 === 49) watch(bad); const tt = v.task; if (tt && tt.type === 'ler' && tt.st >= 1) read = true; else if (read && tt && !calls.includes(tt.type)) calls.push(tt.type); }
    const asleep = home(); const kept = !!Bi.book(lib).quem[v.id];
    const r = asleep ? QA.roundTrip() : { diff: ['ela não chegou a dormir em casa'] };
    const w = S().villagers.get(v.id); const after = w && w.task ? `${w.task.type}/${w.task.st}` : 'sem tarefa';
    const back = !!w && !!w.task && w.task.type === 'sleep' && w.sleeping && w.inside === w.home;
    ok('l9 a-leitora-vai-dormir', !!t && read && asleep && !kept && !r.diff.length && back && !bad.length, `${bad.length ? bad.slice(0, 2).join(' | ') + '; ' : ''}${v.name}, ${Math.floor(v.age)} anos, dorme às ${r2(bed)}: ${read ? 'leu' : 'NÃO LEU'} ${n(lib)}, o mundo a chamou (${calls.join(', ') || '-'}) e ela ${asleep ? 'dorme em casa' : 'NÃO DORME EM CASA'}; no livro da biblioteca: ${kept ? 'AINDA' : 'não'}; a ida e volta: ${r.diff.length ? r.diff.join(' | ').slice(0, 300) : 'igual'}; depois do load: ${after}${w && w.inside === lib.id ? ' NA BIBLIOTECA' : back ? ' em casa' : ''}`);
  }
}
// ---------------- l10 the spectator, the actor and the reader called away a moment before the save (L-435) ----------------
// (the rows, the stage and the library's book let go of who left by another door at their next look, within the second; a
// save in that second sat them down again: the spectator taken by the bed of her hour, the actor by a call that cannot wait,
// the reader by the bed. After the load none of them is back where they had left, the others are, the lists let go of them at
// their next look, as the world without the save does, and the house's and the operations' parts of the round trip are the
// same. The jobs of the town are not settled first, as QA.roundTrip does: the case is the moment of the call)
const part = c => JSON.stringify(c.more.filter(([k]) => k === 'lar' || k === 'acts'));
const across = () => { const a = QA.canon(); G.Save.apply(JSON.parse(G.Save.serialize())); G.Main.mode = 'game'; return part(a) === part(QA.canon()); };
const backTo = (w, ty) => !!w && !!w.task && w.task.type === ty;
{
  fresh(); const b = S().buildings.get(P.id); ready(b); const bad = [];
  liveSec(20, () => !!Tt.dia(b), bad); const op = Tt.dia(b);
  // (two seated and an actor on the stage, both waited for: with the fixes of the fechamento (L-455, L-456) the metropolis
  // had six seated in the doors and Senusret still on his way to the stage — the case read the stage empty, T-333)
  const rows = () => (op && A.live(op) ? Object.keys(op.data.plateia).map(id => S().villagers.get(+id)).filter(v => v && backTo(v, 'teatro') && v.task.st >= 1 && v.home) : []);
  const stage = () => (op && A.live(op) ? Object.keys(op.data.atores).map(id => S().villagers.get(+id)).filter(v => v && backTo(v, 'atuar') && v.task.st >= 1) : []);
  if (op) { liveSec(60, () => !A.live(op) || op.data.fase !== 'preparo', bad); audience(b, 6); liveSec(4, null, bad); audience(b, 4); liveSec(60, () => !A.live(op) || (rows().length >= 2 && stage().length >= 1), bad); }
  const inRow = rows(), onSt = stage();
  const gone = inRow[0], actor = onSt[0];
  if (!gone || !actor || inRow.length < 2) ok('l10 chamados-antes-do-save', false, `sem a plateia (${inRow.length} sentados) e o ator no palco (${onSt.length}) do caso: ${op ? op.data.fase : 'o teatro não abriu'}`);
  else {
    const stay = inRow[1];
    G.Vg.setTask(gone, { type: 'sleep', pri: 1.5, kind: 'sleep', stay: gone.home }); G.Vg.setTask(actor, { type: 'idle', pri: 3, wait: 10 });
    const held = !!op.data.plateia[gone.id] && !!op.data.atores[actor.id];
    const same = across(); const o2 = A.get(op.id); const tLoad = S().clock;
    const g2 = S().villagers.get(gone.id), c2 = S().villagers.get(actor.id), s2 = S().villagers.get(stay.id);
    const gBack = backTo(g2, 'teatro') || g2.inside === b.id, cBack = backTo(c2, 'atuar') || c2.inside === b.id;
    const out = !gBack && !cBack; const kept = backTo(s2, 'teatro') && s2.inside === b.id;
    // (the lists let go of the old places at their next look — the calls of the case are not saved, as no errand is: free
    // after the load, the two may choose the show again, by the theatre's own door — an evening out, the actor's day —, and a
    // place taken after the load is a new one; with the code of 3654493 Sitamun was on the stage again a second after the load,
    // by her own work, T-333)
    liveSec(2, null, bad); const old = m => !!m && !(m.t > tLoad + 0.05); // (the place's time is kept to a tenth of a second)
    const let_go = !!o2 && !old(o2.data.plateia[gone.id]) && !old(o2.data.atores[actor.id]);
    const again = [o2 && o2.data.plateia[gone.id] && gone.name, o2 && o2.data.atores[actor.id] && actor.name].filter(Boolean);
    ok('l10 chamados-antes-do-save', held && same && out && kept && let_go && !bad.length, `${gone.name} (na plateia) à cama e ${actor.name} (no palco) por um chamado que não espera, um momento antes do save — ainda nas listas: ${held ? 'sim' : 'NÃO'}; depois do load: ${gBack ? `${gone.name} DE VOLTA À PLATEIA` : `${gone.name} fora`}, ${cBack ? `${actor.name} DE VOLTA AO PALCO` : `${actor.name} fora`}, ${stay.name} ${kept ? 'na plateia' : 'FORA DA PLATEIA'}; dois segundos depois as listas ${let_go ? `soltaram os lugares de antes${again.length ? ` (${again.join(' e ')} de novo lá, por escolha depois do load)` : ''}` : 'AINDA TÊM OS LUGARES DE ANTES'}; a casa e as operações na ida e volta: ${same ? 'iguais' : 'DIFERENTES'}; ${bad.slice(0, 2).join(' | ') || 'verificador limpo'}`);
  }
}
{
  fresh(); const lib = writers()[0]; let rd = null;
  if (lib) {
    S().time = 0.4; const dr = G.Vg.door(lib);
    for (const v of [...S().villagers.values()].sort((a, c) => G.dist2(a.x, a.y, dr[0], dr[1]) - G.dist2(c.x, c.y, dr[0], dr[1]) || a.id - c.id)) if (v.set === lib.set && v.age >= 16 && free(v) && !v.inside && !(v.task && (v.task.pri || 0) >= 1) && G.W.reaches(v, dr[0], dr[1])) { rd = v; break; }
  }
  if (!rd) ok('l11 leitor-chamado-antes-do-save', true, 'nenhuma biblioteca de um povo com escrita, com um leitor livre: sem o caso');
  else {
    G.Vg.endTask(rd); const dr = G.Vg.door(lib); rd.x = dr[0]; rd.y = dr[1]; rd.path = null; rd.energy = 70; rd.hunger = 20;
    const t = Bi.visit(rd, lib); if (t) { t.kind = 'work'; t.leisure = true; t.pri = 2.9; } // (held above the day's calls, as l5)
    liveSec(20, () => backTo(rd, 'ler') && rd.task.st >= 1);
    const reading = backTo(rd, 'ler') && rd.task.st >= 1;
    if (reading) G.Vg.setTask(rd, { type: 'sleep', pri: 1.5, kind: 'sleep', stay: rd.home });
    const held = reading && !!Bi.book(lib).quem[rd.id];
    const same = reading && across(); const w = S().villagers.get(rd.id);
    const out = !backTo(w, 'ler') && w.inside !== lib.id;
    liveSec(2); const let_go = !Bi.book(S().buildings.get(lib.id)).quem[rd.id];
    ok('l11 leitor-chamado-antes-do-save', reading && held && same && out && let_go, `${rd.name} lendo ${n(lib)}: ${reading ? 'sim' : 'NÃO'}; à cama um momento antes do save (ainda no livro: ${held ? 'sim' : 'NÃO'}); depois do load ${out ? 'fora da biblioteca' : 'DE VOLTA À LEITURA'}; dois segundos depois o livro ${let_go ? 'o soltou' : 'AINDA O TEM'}; a casa e as operações na ida e volta: ${same ? 'iguais' : 'DIFERENTES'}`);
  }
}
// ---------------- l12 the actor called is not taken from the show by an errand from outside (L-503) ----------------
// (the cave's mine — 1,25, by the cave's own door, G.Caves.give, as its plan gives it — offered to the actor of the day on her
// way to the stage: she goes on; put by the god's hand at the door, on the stage behind the shut doors the hands' rule says her
// busy (Vg.busy, Vg.handsBusy: D-094); and the play is played with her. Before the L-503 the mine took her on her way, and the
// show was called off «sem atores»)
{
  fresh(); const b = S().buildings.get(P.id); const cast = ready(b); const bad = [];
  liveSec(20, () => !!Tt.dia(b), bad); const op = Tt.dia(b);
  const walking = v => !!v && !!op && S().villagers.has(v.id) && !!v.task && v.task.type === 'atuar' && v.task.op === op.id && v.task.st === 0 && !v.inside;
  let a = null; if (op) liveSec(20, () => !!(a = cast.find(walking)), bad);
  const cv = G.Caves.all().filter(c => c.mouths.length).sort((x, y) => x.id - y.id)[0];
  let took = null, kept = false, busy = null, on = false, txt = op ? 'nenhum ator a caminho do palco' : 'o espetáculo não abriu';
  if (a && cv) {
    took = G.Caves.give(a, 'mine', cv, -1, { stay: 12, pri: 1.25 }); kept = walking(a);
    txt = `${a.name} a caminho do palco: a mina da ${cv.name} ${took ? 'A LEVOU' : 'não a levou'}${kept ? ', segue para o palco' : ` (${a.task ? a.task.type : 'sem afazer'})`}`;
    if (kept) { const dr = G.Vg.door(b); a.x = dr[0]; a.y = dr[1]; a.path = null; liveSec(10, () => !A.live(op) || !!op.data.atores[a.id], bad); }
    if (kept && A.live(op) && op.data.atores[a.id] && op.data.fase === 'preparo') { busy = G.Vg.busy(a, { type: 'caverna', kind: 'mine', pri: 1.25 }) && !!G.Vg.handsBusy(a); txt += `; no palco de portas fechadas: ${busy ? 'ocupada para um afazer de fora' : 'LIVRE para um afazer de fora'}`; }
    else if (kept) txt += `; no palco de portas fechadas: ${A.live(op) && op.data.atores[a.id] ? 'as portas já abertas' : 'não chegou'}`;
    if (kept) { liveSec(150, () => { if (A.live(op) && op.data.atores[a.id] && op.data.fase === 'peca') on = true; return !A.live(op); }, bad, () => calmBeasts([a.x, a.y])); txt += `; ${on ? 'no palco na peça' : 'não chegou à peça'}, o espetáculo ${op.st}${op.end ? ' (' + op.end.why + ')' : ''}`; }
  }
  ok('l12 o-ator-chamado-nao-e-levado (L-503)', !!a && !!cv && took === false && kept && busy === true && on && op.st === 'ok' && !bad.length, `${txt}; ${bad.slice(0, 2).join(' | ') || 'verificador limpo'}`);
}
// ---------------- l13 the town's feast and the show (D-130) ----------------
// (a) the feast of its people that falls in the show's hours, the town's plan of the day by the god's hand: the theatre opens no
// show that day, past the doors' hour — kept for another day —; one of the morning, held before the doors, leaves the show its
// day. (b) a feast begun by the god's hand with the play under way: the show ends there — closed as cut, nobody in it with its
// errand, its rows and its stage empty — and its actors and its audience are free for the feast, which takes whom it takes
// (D-126); the checker clean
{
  const feasts = st => { const f = G.Fac.get(st.fac); return f ? G.Fest.of(f.civ).filter(k => !G.Fest.DEF[k].trigger) : []; };
  const span = k => [G.Fest.DEF[k].at, G.Fest.DEF[k].at + G.Fest.DEF[k].dur * 1.15];
  const bad = []; const notes = []; let good = true; const fail = m => { good = false; notes.push(m.toUpperCase()); };
  // (a) in the show's hours
  fresh(); let b = S().buildings.get(P.id); ready(b); let st = S().settlements.get(b.set); const h = Tt.horas(b);
  const kIn = feasts(st).find(k => span(k)[0] < h.fecha && span(k)[1] > h.abre), kAm = feasts(st).find(k => span(k)[1] <= h.abre);
  if (!kIn) notes.push(`(a) o povo de ${st.name} não tem festa nas horas do espetáculo`);
  else {
    st.festPlan = { day: S().day, key: kIn, done: false };
    let opened = false; liveSec(Math.ceil((h.abre - S().time) * G.DAY_LEN) + 4, () => (opened = !!Tt.dia(b)), bad);
    if (opened) fail(`(a) ${G.Fest.DEF[kIn].name} às ${G.Fest.DEF[kIn].at} no dia: o espetáculo abriu`);
    else notes.push(`(a) ${G.Fest.DEF[kIn].name} às ${G.Fest.DEF[kIn].at} no dia: nenhum espetáculo até as portas (${r2(S().time)})`);
  }
  if (!kAm) notes.push(`(a) o povo de ${st.name} não tem festa de manhã`);
  else {
    fresh(); b = S().buildings.get(P.id); ready(b); st = S().settlements.get(b.set);
    st.festPlan = { day: S().day, key: kAm, done: true }; st.festDone = Object.assign({}, st.festDone, { [kAm]: S().day });
    const opened = liveSec(20, () => !!Tt.dia(b), bad);
    if (!opened) fail(`(a) ${G.Fest.DEF[kAm].name} de manhã (até ${r2(span(kAm)[1])}): o espetáculo não abriu à tarde`);
    else notes.push(`(a) ${G.Fest.DEF[kAm].name} de manhã: o espetáculo abriu à tarde`);
  }
  // (b) a feast begun with the play under way
  fresh(); b = S().buildings.get(P.id); ready(b); st = S().settlements.get(b.set);
  liveSec(20, () => !!Tt.dia(b), bad); const op = Tt.dia(b);
  if (op) { atDoors(b, op, bad); liveSec(80, () => !A.live(op) || op.data.fase === 'peca', bad); }
  if (!op || !A.live(op) || op.data.fase !== 'peca') fail(`(b) a peça não chegou a começar (${op ? op.st + ' ' + op.data.fase : 'sem espetáculo'})`);
  else {
    const people = Object.keys(op.data.plateia).concat(Object.keys(op.data.atores)).map(Number);
    let fe = null, key = ''; for (const k of feasts(st)) { fe = G.Fest.start(st, k); if (fe) { key = k; break; } }
    if (!fe) fail(`(b) nenhuma festa de ${st.name} começou pela mão do deus`);
    else {
      const hanging = [...S().villagers.values()].filter(v => v.task && (v.task.type === 'teatro' || v.task.type === 'atuar') && v.task.op === op.id).length;
      const held = people.filter(id => { const v = S().villagers.get(id); return v && G.Vg.handsBusy(v); }).length;
      const went = people.filter(id => fe.parts.includes(id)).length;
      if (A.live(op) || op.st !== 'int' || !op.end || op.end.why !== 'a festa') fail(`(b) o espetáculo ${A.live(op) ? 'SEGUE (' + op.data.fase + ')' : op.st + ' (' + (op.end ? op.end.why : '') + ')'} com ${G.Fest.DEF[key].name} começada`);
      if (hanging || Object.keys(op.data.plateia).length || Object.keys(op.data.atores).length) fail(`(b) ${hanging} ainda com o afazer do espetáculo, ${Object.keys(op.data.plateia).length} na plateia e ${Object.keys(op.data.atores).length} no palco`);
      if (held) fail(`(b) ${held} dos ${people.length} da peça presos a ela (mãos ocupadas)`);
      liveSec(5, null, bad);
      notes.push(`(b) ${G.Fest.DEF[key].name} pela mão do deus com a peça em cena (${people.length} na peça): o espetáculo ${op.st} (${op.end ? op.end.why : ''}), ninguém com o afazer dele, ${went} dos ${people.length} na festa, que leva ${fe.parts.length}`);
    }
  }
  ok('l13 a-festa-e-a-peca (D-130)', good && !bad.length, `${notes.join(' · ')}; ${bad.slice(0, 2).join(' | ') || 'verificador limpo'}`);
}
function n(b) { return 'n' + (G.gen(V.buildName(b)) === 'a' ? 'a ' : 'o ') + V.buildName(b).toLowerCase(); }
const err = M.erros(); ok('erros', !Object.keys(err.mod || {}).length && !err.console.length, JSON.stringify(err.mod) + ' ' + err.console.slice(0, 3).join(' | '));
console.log(fails.length ? `LAZER: FALHOU (${fails.join(', ')})` : 'LAZER: ok');
process.exit(fails.length ? 1 : 0);
