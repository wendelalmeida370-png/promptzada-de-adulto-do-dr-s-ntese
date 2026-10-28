// volta: o exército a caminho de casa atravessa um save (L-185) — provocado de propósito.   node qa/volta.js [semente]
// O save não guarda os bandos (war.js) nem as tarefas: ao carregar, o wars.js refaz em campo os exércitos onde os soldados
// estão. Os que estavam voltando para casa — e os que já não tinham guerra, alvo ou três de pé — eram dados por encerrados
// ali mesmo: o save perdia a volta (o QA.roundTrip acusava em armies), a chegada (a marca de veterano, o abraço da família)
// e as armas que o arsenal emprestou (o bando que as devolve ao se desfazer não existia mais).
// v1 a retirada: depois do load o bando volta com o mesmo número, alguém morre no caminho, o exército termina em casa e as
//    armas voltam ao arsenal; v2 os dois que sobraram de um exército em campo voltam para casa; v3 a paz com o exército em
//    campo; v4 o mesmo save carregado duas vezes vive o mesmo futuro; e o verificador limpo do começo ao fim.
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const seed = +(process.argv[2] || 7);
const fails = []; const mid = []; // (what the checker saw in the middle of a case: the case fails, even if the end looks clean)
const ok = (name, c, info) => { const m = mid.splice(0); const pass = c && !m.length; console.log(`${pass ? 'PASSOU' : 'FALHOU'} | volta ${name} | ${info}${m.length ? ' — o verificador, no meio do caso: ' + m.slice(0, 2).join(' · ') : ''}`); if (!pass) fails.push(name); };
const watch = () => { for (const q of QA.check()) { const t = `[S${q.sev}] ${q.sys}: ${q.msg}`; if (q.sev <= 2 && !mid.includes(t)) mid.push(t); } };
const live = (sec, until) => { for (let k = 1; k <= sec * 10; k++) { M.viver(0.1); if (k % 50 === 0) watch(); if (until && until()) { watch(); return true; } } watch(); return false; };
const finish = () => { const e = M.erros(); const mods = Object.keys(e.mod); console.log(`${mods.length || e.console.length ? 'FALHOU' : 'PASSOU'} | volta erros | módulos: ${mods.join(', ') || 'nenhum'}; console: ${e.console.slice(0, 3).join(' · ') || 'nada'}`); if (mods.length || e.console.length) fails.push('erros'); console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU: todos'); process.exit(fails.length ? 1 : 0); };
let S = M.novo({ seed, type: 'continente', size: 170, tribes: 2, temper: 'pacifico', relevo: 'suave' });

// two kingdoms of some hundreds, kept at peace while they grow (as the guerra10 save case), with food and an armoury
const dw = G.Politics.declareWar; G.Politics.declareWar = () => { };
while (S.day < 6) M.viver(10);
G.Politics.declareWar = dw;
const [A, B] = G.Fac.all().sort((a, b) => G.Fac.pop(b.id) - G.Fac.pop(a.id)).slice(0, 2);
const grow = (f, want) => { const sets = G.Fac.settlementsOf(f.id); let k = 0; while (G.Fac.pop(f.id) < want && k++ < 9000) { const s = sets[k % sets.length]; const a = G.R() * 6.283, r = G.R() * (s.radius || 6); const p = G.W.nearestLand(s.cx + Math.cos(a) * r, s.cy + Math.sin(a) * r, 5); if (!p) continue; G.Vg.create({ set: s.id, x: p[0], y: p[1], age: 17 + G.R() * 38 }); } f.stock.food = Math.max(f.stock.food, want * 7); f.stock.armas = (f.stock.armas || 0) + Math.round(want * 0.15); };
grow(A, 300); grow(B, 250); G.Fac.updateTerritory();
G.Politics.declareWar(A, B, 'ambicao');
console.log(`(${A.name} ${G.Fac.pop(A.id)} contra ${B.name} ${G.Fac.pop(B.id)}, dia ${S.day})`);
live(5);

const Wz = () => G.Wars; const Wr = () => G.War;
const FIELD = ['marcha', 'acampado', 'batalha', 'cerco', 'assalto', 'guerrilha', 'reunir'];
// an army of A raised against B's capital, and marched until it is out in the field (its band alive, past the muster)
const raise = () => {
  const w = Wz().warOf(A.id, B.id); const tg = G.Fac.capitalOf(B.id);
  const a = w && tg && Wz().mobilize(w, G.Fac.get(A.id), 'campanha', tg, {});
  if (!a) { raise.why = !w ? 'sem guerra' : !tg ? 'sem capital do inimigo' : `${A.name} não convocou ninguém (${G.Fac.pop(A.id)} almas)`; return null; }
  const out = () => a.band && Wr().bands.has(a.band) && FIELD.includes(a.phase) && a.phase !== 'reunir';
  live(G.DAY_LEN * 1.2, () => a.done || out());
  if (!out()) raise.why = a.done ? `o exército convocado se desfez (${a.phase}, ${a.members.length} de ${a.n0 || '?'})` : `o exército ficou em ${a.phase}`;
  return out() ? a : null;
};
// the jobs settled before a save: a town grown all at once still moves three people a round, for many rounds, and the round
// trip settles only thirty — what the load's own round moves is the town settling, not the save losing (T-092)
const settle = () => { const key = () => { let t = ''; for (const v of G.S.villagers.values()) t += v.role || ''; return t; }; let prev = key(); for (let k = 0; k < 400; k++) { G.Village.forceUpdate(); const now = key(); if (now === prev) return k; prev = now; } return 400; };
const armyNow = id => Wz().army(id);
const P = id => G.S.villagers.get(id);
// who of a list still holds the host's arms (the unit, the borrowed bow, the armoury's weapon)
const armed = ids => ids.map(P).filter(v => v && !v.captive && (v.unit || v._levy || v._bow));

// ---------------- v0 the control: a host breaks and walks home, no save (how the live world ends it) ----------------
let a = raise();
if (!a) { ok('v0 a volta sem save', false, 'precondição: nenhum exército chegou a campo — ' + raise.why); finish(); }
{
  const id = a.id, fac = a.fac;
  const b = Wr().bands.get(a.band); b.st = 'retorno'; b.t = 0; b.retreat = true;
  live(3); a = armyNow(id); const roster = a.members.slice();
  live(G.DAY_LEN * 1.5, () => a.done);
  const back = roster.map(P).filter(v => v && !v.captive), still = armed(roster); const vets = back.filter(v => v._vetWar === a.war).length;
  ok('v0 a volta sem save', a.done && !still.length, `encerrado ${a.done ? `no dia ${a.home || '?'}` : 'não'}; ${back.length} de volta; ${still.length} ainda com as armas do exército; arsenal de ${G.Fac.get(fac).name} ${G.Fac.get(fac).stock.armas || 0}; veteranos marcados ${vets} de ${back.length}`);
}

// ---------------- v1 the rout: a host breaks and walks home; the save comes on the road ----------------
let str1 = '';
a = raise();
if (!a) { ok('v1 a retirada', false, 'precondição: nenhum exército chegou a campo — ' + raise.why); finish(); }
{
  const id = a.id, band = a.band, fac = a.fac;
  const b = Wr().bands.get(band); b.st = 'retorno'; b.t = 0; b.retreat = true; // (as army.js breaks a host)
  live(3);
  a = armyNow(id);
  const roster = a.members.slice(); const levies = roster.filter(i => { const v = P(i); return v && v._levy && v.role !== 'guerreiro'; });
  const ph = a.phase, arm0 = G.Fac.get(fac).stock.armas || 0;
  str1 = G.Save.serialize(); // (for v4: the same save, an army on the road home in it)
  if (process.env.DUMP) require('fs').writeFileSync(process.env.DUMP, JSON.stringify({ save: str1, army: id }));
  settle(); const trip = QA.roundTrip(); S = G.S;
  a = armyNow(id); const b1 = a && Wr().bands.get(a.band);
  const walking = b1 ? b1.members.filter(i => { const v = P(i); return v && v.task && v.task.type === 'band' && v.task.band === b1.id; }).length : 0;
  ok('v1 a retirada atravessa o save', !trip.diff.length && a && !a.done && b1 && a.band === band && b1.st === 'retorno' && walking === roster.filter(P).length,
    `fase ${ph}, ${roster.length} soldados (${levies.length} com arma do arsenal); o save: ${trip.diff.length ? trip.diff.slice(0, 2).join(' | ') : 'igual'}; depois do load: ${!a ? 'sumiu' : a.done ? 'encerrado' : `ativo, bando ${b1 ? `${b1.id} (era ${band}) ${b1.st}, ${walking} a caminho` : 'nenhum'}`}`);
  // one of them dies on the road (the band, the army and the end go on without him)
  const dead = b1 && b1.members.map(P).find(v => v && !v.task.flag); if (dead) G.Village.kill(dead, 'teste');
  live(G.DAY_LEN * 1.5, () => a.done);
  const back = roster.map(P).filter(v => v && !v.captive), still = armed(roster);
  const f = G.Fac.get(fac); const vets = back.filter(v => v._vetWar === a.war).length;
  ok('v1 em casa', a.done && !!a.home && !still.length && !Wr().bands.has(band),
    `encerrado ${a.done ? `no dia ${a.home || '?'}` : 'não'}; ${back.length} de volta${dead ? ', 1 morto no caminho' : ''}; ${still.length} ainda com as armas do exército; arsenal ${arm0} → ${f.stock.armas || 0}; veteranos marcados ${vets} de ${back.length}`);
}

// ---------------- v2 the two left of an army in the field ----------------
a = raise();
if (!a) ok('v2 os dois que sobraram', false, 'precondição: nenhum exército chegou a campo — ' + raise.why);
else {
  const id = a.id, band = a.band;
  // all but two leave it (the others ran: a desertion)
  const keep = a.members.slice(0, 2); for (const i of a.members.slice(2)) { const v = P(i); if (v && v.task && v.task.type === 'band') G.Vg.endTask(v); }
  live(2);
  a = armyNow(id); const n = a.members.length, ph = a.phase;
  settle(); const trip = QA.roundTrip(); S = G.S;
  a = armyNow(id); const b1 = a && Wr().bands.get(a.band);
  ok('v2 os dois que sobraram atravessam o save', !trip.diff.length && a && !a.done && !!b1 && b1.st === 'retorno',
    `${n} de pé (${ph}); o save: ${trip.diff.length ? trip.diff.slice(0, 2).join(' | ') : 'igual'}; depois do load: ${!a ? 'sumiu' : a.done ? 'encerrado' : `ativo, bando ${b1 ? b1.id + ' ' + b1.st + ' com ' + b1.members.length : 'nenhum'}`}`);
  live(G.DAY_LEN * 1.5, () => a.done);
  const still = armed(keep);
  ok('v2 em casa', a.done && !still.length && !Wr().bands.has(band), `encerrado ${a.done ? 'sim' : 'não'}; ${still.length} ainda com as armas do exército`);
}

// ---------------- v3 the peace, with the army in the field (the war is over: it walks home) ----------------
// (three hosts have marched and come back by now: the realm gets new hands to levy)
grow(G.Fac.get(A.id), G.Fac.pop(A.id) + 150); live(10);
// (and the realm at rest when it levies — nobody is called out of a fight or a flight (Wars.canServe): with the final code, seed
// 7, the war of Casa de Amon came to the gates of Tenochtitlan at night, 112 of its grown-ups fighting, 149 running and 23
// hidden, and the fourth levy found nobody. The fight over, the war may be over too: then it is declared again, by the test's
// hand, as at the start — T-240)
const astir = () => [...G.S.villagers.values()].filter(v => G.Fac.idOfV(v) === A.id && v.task && (v.task.type === 'combat' || v.task.type === 'flee' || v.task.type === 'hide')).length;
const stir3 = astir(); live(G.DAY_LEN * 1.5, () => astir() < 10);
const again3 = !Wz().warOf(A.id, B.id) && G.Fac.get(A.id).alive && G.Fac.get(B.id).alive;
if (again3) { G.Politics.declareWar(G.Fac.get(A.id), G.Fac.get(B.id), 'ambicao'); live(5); }
if (stir3 >= 10) console.log(`(antes da quarta convocação, ${stir3} de ${A.name} lutando, fugindo ou escondidos; depois de esperar, ${astir()}${again3 ? `; a guerra tinha acabado, e ${A.name} a declarou de novo` : ''})`);
a = raise();
if (!a) ok('v3 a paz no caminho', false, 'precondição: nenhum exército chegou a campo — ' + raise.why);
else {
  const id = a.id, band = a.band, war = a.war;
  // the peace as diplomacy makes it (politics.js answerPeace): the truce, then the wars and the bands hear of it
  const r = G.Fac.rel(A.id, B.id); r.st = 'tregua'; r.truce = G.DAY_LEN * 3; r.since = S.day;
  G.Wars.onPeace(A, B, 'sem vencedores', null); G.War.onPeace(A, B);
  live(2);
  a = armyNow(id); const w = Wz().state().wars.find(x => x.id === war); const ph = a.phase; const roster = a.members.slice();
  settle(); const trip = QA.roundTrip(); S = G.S;
  a = armyNow(id); const b1 = a && Wr().bands.get(a.band);
  ok('v3 a paz no caminho atravessa o save', !!w.end && !trip.diff.length && a && !a.done && !!b1 && b1.st === 'retorno',
    `guerra ${w.end ? 'encerrada no dia ' + w.end : 'não encerrou'}; exército ${ph} com ${roster.length}; o save: ${trip.diff.length ? trip.diff.slice(0, 2).join(' | ') : 'igual'}; depois do load: ${!a ? 'sumiu' : a.done ? 'encerrado' : `ativo, bando ${b1 ? b1.id + ' ' + b1.st : 'nenhum'}`}`);
  live(G.DAY_LEN * 1.5, () => a.done);
  const still = armed(roster); const back = roster.map(P).filter(v => v && !v.captive); const vets = back.filter(v => v._vetWar === war).length;
  ok('v3 em casa', a.done && !still.length && !Wr().bands.has(band), `encerrado ${a.done ? 'sim' : 'não'}; ${still.length} ainda com as armas do exército; veteranos marcados ${vets} de ${back.length}`);
}

// ---------------- v4 the same save loaded twice lives the same future (v1's, an army on the road home in it) ----------------
{
  const run = () => { G.Save.apply(JSON.parse(str1)); for (let k = 0; k < 600; k++) M.viver(0.1); return QA.canon(); };
  const c1 = run(), c2 = run(); const d = QA.diff(c1, c2);
  ok('v4 o mesmo futuro', !d.length, d.length ? d.slice(0, 2).join(' | ') : '60 s depois de dois loads do save da retirada do v1, o mesmo mundo');
}
finish();
