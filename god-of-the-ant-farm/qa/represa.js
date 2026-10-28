// represa: node qa/represa.js [mundo] — a primeira represa dos castores é contada uma vez só na crônica, com ou sem save
// no meio (L-301). A marca «a primeira represa já foi contada» (S.damSeen) não ia no save: aberto o mundo, a próxima árvore
// roída para uma represa contava a primeira represa de novo, no mesmo dia e lugar — o verificador acusava a linha repetida.
//  r1 um mundo pronto aberto com represa de pé: as árvores roídas depois não contam a primeira represa de novo
//  r2 um save e um load no meio, e mais árvores roídas: a crônica não ganha a linha
//  e o verificador limpo (S0–S3 novos), sem erro de módulo
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const KEY = process.argv[2] || 'metropole';
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | represa ${name} | ${info}`); if (!c) fails.push(name); };
const LINE = /Os castores derrubaram as árvores da margem/;
const told = () => G.S.history.filter(h => LINE.test(h.txt)).length;
const gnawed = () => (G.S.dams || []).reduce((a, d) => a + (d.trees || 0), 0);
M.pronto(KEY);
const base = new Set(QA.check().filter(q => q.sev <= 3).map(q => q.sys + '|' + q.msg));
const fresh = () => QA.check().filter(q => q.sev <= 3 && !base.has(q.sys + '|' + q.msg)).map(q => `[S${q.sev}] ${q.sys}: ${q.msg}`);
const t0 = told(), g0 = gnawed(), dams = (G.S.dams || []).filter(d => d.trees > 0).length;
// (until the beavers fell two more trees for their dams, or ten minutes of the world)
const live = (n, sec) => { const g = gnawed(); for (let k = 0; k < sec * 10 && gnawed() < g + n; k++) M.viver(0.1); return gnawed() - g; };
const a = live(1, 600);
ok('r1 aberto o mundo, a primeira represa não é contada de novo', dams > 0 && a > 0 && told() === t0, `${dams} represa(s) de pé ao abrir, contada(s) ${t0}× na crônica; ${a} árvore(s) roída(s) depois: ${told()}×`);
M.salvarCarregar(); const t1 = told();
const b = live(1, 600);
ok('r2 um save no meio: a crônica não ganha a linha', b > 0 && told() === t1, `${b} árvore(s) roída(s) depois do load: ${told()}× (antes do load ${t1}×)`);
const nv = fresh(); const e = M.erros(); const mods = Object.keys(e.mod);
ok('verificador', !nv.length, nv.slice(0, 3).join(' · ') || 'limpo');
ok('erros', !mods.length && !e.console.length, `módulos: ${mods.join(', ') || 'nenhum'}; console: ${e.console.slice(0, 2).join(' · ') || 'nada'}`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU: todos');
process.exit(fails.length ? 1 : 0);
