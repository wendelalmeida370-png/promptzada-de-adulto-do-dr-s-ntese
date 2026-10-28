// agua-solta: node qa/agua-solta.js [mundo] — a água nas mãos vive dentro do seu recado (L-300).
// O save guarda as mãos e não as tarefas: quem levava o jarro para casa, ou o balde para o fogo, abria o mundo com a água
// nas mãos e sem recado, e o afazer seguinte começava por cima dela — a colheita com água nas mãos (o L-186 do verificador,
// achado pelos poderes na metrópole de 28/10). Aqui, num mundo pronto aberto pelo menu:
//  a1 ao abrir, quem tem o jarro da casa volta ao recado da água (o gancho do life.js); em 30 s, ninguém com água nas mãos
//     fora do recado da água e do fogo (fora as tarefas de prioridade 3 ou mais) — a outra água é derramada pelo livro
//  a2 o jarro chega em casa: em 60 s cada jarro foi entregue, ou derramado pelo livro quando o mundo cortou o recado (a
//     noite, a fome), ou ainda está a caminho — nenhum some sem linha
//  a3 nenhuma colheita (gather, mariscar, pick, mel) começa com outra coisa nas mãos, em 2 minutos de mundo
//  a4 um save no meio do caminho de casa, de dia: carregado, o recado da água volta, e o jarro chega em casa (ou o mundo o
//     corta, e a água sai pelo livro)
//  e o verificador limpo (S0–S3 novos), sem erro de módulo.
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const KEY = process.argv[2] || 'metropole';
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | agua-solta ${name} | ${info}`); if (!c) fails.push(name); };
const WTASK = { water: 1, fire: 1 };
const stray = S => [...S.villagers.values()].filter(v => v.carry && v.carry.k === 'water' && v.carry.n > 1e-6 && !(v.task && (WTASK[v.task.type] || v.task.pri >= 3)));
const GATHER = { gather: 1, mariscar: 1, pick: 1, honey: 1 };
let S = M.pronto(KEY);
// (a world opened with no jar of a house in the hands — the worlds of 28/10 were saved with nobody holding water, T-183; the
// metropolis of the generation 6 at night, with eleven holding only the fire's buckets, T-237 — and a2 had no jar to look
// at: it lives until two jars are on their way home, by day, and is opened again by the menu from a save of that moment)
let made = '';
if (![...S.villagers.values()].some(v => v.carry && v.carry.k === 'water' && v.carry.jar && v.carry.n > 1e-6 && S.buildings.get(v.home))) {
  const other = [...S.villagers.values()].filter(v => v.carry && v.carry.k === 'water' && v.carry.n > 1e-6).length;
  const out = () => [...S.villagers.values()].filter(v => v.carry && v.carry.k === 'water' && v.carry.jar && v.task && v.task.type === 'water' && S.buildings.get(v.home)).length;
  let k = 0; for (; k < 12000 && !(out() >= 2 && S.time > 0.1 && S.time < 0.45); k++) M.viver(0.1);
  made = ` — o mundo pronto abriu sem jarro de casa nas mãos${other ? ` (${other} com outra água, a do fogo)` : ''}: ${Math.round(k / 10)} s de mundo até ${out()} jarros a caminho de casa, de dia, e aberto de novo pelo menu`;
  S = M.abrir(JSON.parse(G.Save.serialize()));
}
const base = new Set(QA.check().filter(q => q.sev <= 3).map(q => q.sys + '|' + q.msg));
const fresh = () => QA.check().filter(q => q.sev <= 3 && !base.has(q.sys + '|' + q.msg)).map(q => `[S${q.sev}] ${q.sys}: ${q.msg}`);
const w0 = [...S.villagers.values()].filter(v => v.carry && v.carry.k === 'water' && v.carry.n > 1e-6 && !(v.task && v.task.pri >= 3 && !WTASK[v.task.type]));
const jars = w0.filter(v => v.carry.jar && S.buildings.get(v.home)).map(v => ({ id: v.id, home: v.home, back: !!(v.task && v.task.type === 'water') }));
const ln0 = S.ledgerN || 0;
// (the door out of the hands watched: a jar delivered into its house — the house's water decays at once, so its level says
// nothing — and when, and into which house)
const inHome = new Set(), homeT = new Map(); { const was = G.Life.jarHome; G.Life.jarHome = function (v, h) { if (h && v.carry && v.carry.k === 'water') { inHome.add(v.id); homeT.set(v.id, [G.S.clock, h.id]); } return was.apply(this, arguments); }; }
// a3 watches every step: a gathering begun with another thing in the hands
const bad3 = new Set(); const look3 = () => { for (const v of S.villagers.values()) { const t = v.task; if (!t || !GATHER[t.type] || t.age > 0.15) continue; const c = v.carry; if (!c || !(c.n > 1e-6)) continue; const want = t.type === 'honey' ? 'mel' : 'food'; if (c.k !== want && !(t.type === 'pick' && c.k !== 'water' && !c.op && !c.to && !c.cid)) bad3.add(`${v.name} #${v.id}: ${t.type} com ${c.k}`); } };
for (let k = 0; k < 300; k++) { M.viver(0.1); look3(); }
const w1 = stray(S);
const poured = (S.ledger || []).filter(e => e[0] > ln0 && e[8] === 'agua').length;
ok('a1 a água solta vai para casa ou é derramada', w0.length > 0 && !w1.length, `${w0.length} abriram com água nas mãos (${jars.filter(j => j.back).length} de ${jars.length} jarros já de volta ao recado da água); em 30 s, ${w1.length} ainda com ela fora do recado${w1.length ? ': ' + w1.slice(0, 4).map(v => `${v.name} #${v.id} (${v.task ? v.task.type : 'sem afazer'})`).join(', ') : ''}; ${poured} derramada(s) pelo livro${made}`);
for (let k = 0; k < 300; k++) { M.viver(0.1); look3(); }
const home = jars.filter(j => inHome.has(j.id)); const pouredJ = jars.filter(j => !inHome.has(j.id) && (S.ledger || []).some(e => e[0] > ln0 && e[8] === 'agua' && e[9] === j.id)); const still = jars.filter(j => !inHome.has(j.id) && !pouredJ.includes(j) && (v => v && v.carry && v.carry.k === 'water')(S.villagers.get(j.id)));
const lost = jars.filter(j => !inHome.has(j.id) && !pouredJ.includes(j) && !still.includes(j));
ok('a2 o jarro chega em casa', jars.length > 0 && jars.every(j => j.back) && home.length > 0 && !lost.length, `${jars.filter(j => j.back).length} de ${jars.length} jarros de volta ao recado logo ao abrir; em 60 s, ${home.length} entregues em casa, ${pouredJ.length} derramados pelo livro (o mundo cortou o recado), ${still.length} ainda a caminho${lost.length ? `, ${lost.length} SUMIDOS sem linha` : ''}`);
for (let k = 0; k < 600; k++) { M.viver(0.1); look3(); }
ok('a3 nenhuma colheita começa por cima de outra coisa', !bad3.size, bad3.size ? [...bad3].slice(0, 4).join(' · ') : 'em 2 minutos, nenhuma');
// a4: someone on the way home with the jar, by day and far from home, saved and loaded in the middle: the errand comes
// back with the world (the water task, the jar in the hands), and then the jar gets home — or the world cuts the errand by
// its own causes (the night, hunger), and then the water is poured out in the ledger, never lost without a line. The jar
// into its house is seen at the water's door (G.Life.jarHome, as a2 sees it), not by the house's level: the house drinks
// once a second, and a jar that comes in at that step reads 0,996 at the step's end (Ameyali's, in the metropolis of the
// generation 6: home in 3,3 s, and the case said «sumiu sem linha», T-237)
const far = v => { const h = S.buildings.get(v.task.home); return h && G.dist(v.x, v.y, h.x + 0.5, h.y + 0.5) > 3; };
let walker = null; for (let k = 0; k < 6000 && !walker; k++) { M.viver(0.1); if (S.time < 0.1 || S.time > 0.45) continue; walker = [...S.villagers.values()].find(v => v.task && v.task.type === 'water' && v.task.st === 3 && v.carry && v.carry.k === 'water' && far(v)); }
if (walker) {
  const id = walker.id, hid = walker.task.home; M.salvarCarregar(); S = G.S; const ln1 = S.ledgerN || 0; const c1 = S.clock;
  const w = S.villagers.get(id); const back = !!(w && w.task && w.task.type === 'water' && w.carry && w.carry.k === 'water');
  const inHid = () => { const r = homeT.get(id); return !!r && r[0] >= c1 && r[1] === hid; };
  let got = false, cut = ''; for (let k = 0; k < 600 && !got && !cut; k++) { M.viver(0.1); const v = S.villagers.get(id); got = inHid(); if (!got && v && (!v.carry || v.carry.k !== 'water')) cut = v.task ? v.task.type : 'sem afazer'; }
  const pouredBy = (S.ledger || []).some(e => e[0] > ln1 && e[8] === 'agua' && e[9] === id);
  ok('a4 o save no meio do caminho: o recado volta, e o jarro chega em casa (ou o mundo o corta, e a água sai pelo livro)', back && (got || (cut && pouredBy)), `${walker.name} #${id}: depois do load ${back ? 'de volta ao recado da água' : 'SEM o recado'}; ${got ? `chegou em casa em ${Math.round((homeT.get(id)[0] - c1) * 10) / 10} s (a porta da água, para a casa #${hid})` : cut ? `cortado pelo mundo (${cut}), a água ${pouredBy ? 'derramada pelo livro' : 'sumiu sem linha'}` : 'não chegou em 60 s'}`);
} else ok('a4 o save no meio do caminho: o recado volta, e o jarro chega em casa (ou o mundo o corta, e a água sai pelo livro)', false, 'ninguém levou água para casa de dia, longe de casa, em 10 minutos de mundo');
const nv = fresh(); const e = M.erros(); const mods = Object.keys(e.mod);
ok('verificador', !nv.length, nv.slice(0, 3).join(' · ') || 'limpo');
ok('erros', !mods.length && !e.console.length, `módulos: ${mods.join(', ') || 'nenhum'}; console: ${e.console.slice(0, 2).join(' · ') || 'nada'}`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU: todos');
process.exit(fails.length ? 1 : 0);
