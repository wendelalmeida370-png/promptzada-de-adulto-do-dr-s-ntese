// cadafalso: node qa/cadafalso.js [mundo] — a execução salva no instante entre o último golpe e o passo seguinte (L-353).
// O die() do último condenado o põe em e.done, e o finish() — a crônica, a lealdade da cidade, a nota do Livro do Mundo, o
// sinal «executed» das histórias, o «sanguinário» — só vem no killStep do passo seguinte; o load do justice.js tirava a
// execução sem condenado nenhum e perdia tudo isso (achado pelo P2, lendo o justice.js, na regressão final da v37).
//  c1 o mundo vivo: o passo seguinte conta a execução (a linha da crônica) e a encerra
//  c2 o mesmo instante salvo e carregado: carregado, a execução foi contada uma vez, como no mundo vivo, e encerrada
//  e o verificador limpo (S0–S3 novos), sem erro de módulo.
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | cadafalso ${name} | ${info}`); if (!c) fails.push(name); };
const KEY = process.argv[2] || 'metropole';
let base = null;
const fresh = () => QA.check().filter(q => q.sev <= 3 && !base.has(q.sys + '|' + q.msg)).map(q => `[S${q.sev}] ${q.sys}: ${q.msg}`);
// (a people with a ruler, its capital and its scaffold free; one of its grown people, free, sentenced for the case — soon —,
// and the world lived until the last blow: the condemned dead, the sentence not yet told)
const upTo = () => {
  M.pronto(KEY); const S = G.S; base = new Set(QA.check().filter(q => q.sev <= 3).map(q => q.sys + '|' + q.msg));
  const f = G.Fac.all().filter(q => q.alive && G.Politics.ruler(q) && G.Fac.capitalOf(q.id) && !(q.exec && q.exec.j)).sort((a, b) => a.id - b.id)[0];
  if (!f) return null; const set = G.Fac.capitalOf(f.id);
  const v = [...S.villagers.values()].filter(o => o.set === set.id && o.age >= 20 && !o.captive && !o.jail && !o.aboard && !o.inside && !(o.task && o.task.j) && o.id !== f.leader && !(S.avatar && S.avatar.id === o.id)).sort((a, b) => a.id - b.id)[0];
  if (!v || !G.Justice.sentence(f, [v], 'por teste', { soon: true, quiet: true })) return null;
  const e = S.execs[S.execs.length - 1]; const name = v.name;
  let n = 0; while (n++ < 8000 && S.execs.includes(e) && !(e.done || []).includes(v.id)) G.debug.step(0.1);
  return { f, set, e, name, n, window: S.execs.includes(e) && e.phase === 'kill' && (e.done || []).includes(v.id) };
};
const told = (set, name) => G.S.history.filter(h => h.txt && h.txt.includes(`Em ${set.name},`) && h.txt.includes(name) && /por ordem de/.test(h.txt)).length;
const a = upTo();
if (!a) ok('c1 o mundo vivo: o passo seguinte conta a execução e a encerra', false, 'nenhum povo com governante e cadafalso livre, ou ninguém para o caso');
else {
  const { set, e, name, n } = a; const t0 = told(set, name); a.loyal0 = set.loyalty;
  G.debug.step(0.1); a.loyal1 = set.loyalty;
  ok('c1 o mundo vivo: o passo seguinte conta a execução e a encerra', a.window && t0 === 0 && told(set, name) === 1 && e.phase !== 'kill', `${name} em ${set.name}, ${(n / 10).toFixed(0)} s até o último golpe (a execução ${a.window ? 'ainda sem a conta' : 'FORA do instante'}): um passo depois, ${told(set, name)} linha(s) na crônica, a execução em «${e.phase}»`);
}
const b = upTo();
if (!b) ok('c2 o mesmo instante salvo e carregado: a execução contada uma vez e encerrada', false, 'nenhum povo com governante e cadafalso livre, ou ninguém para o caso');
else {
  const { set, e, name } = b; const id = e.id; const loyal0 = set.loyalty;
  M.salvarCarregar(); const S = G.S; const set1 = S.settlements.get(set.id);
  const still = (S.execs || []).some(q => q.id === id); const n1 = told(set1, name);
  G.debug.step(0.1); const n2 = told(set1, name);
  // (the same world as c1 to the same instant: the town's loyalty as the living world's step left it)
  const same = !a || Math.abs(set1.loyalty - a.loyal1) < 1e-9;
  ok('c2 o mesmo instante salvo e carregado: a execução contada uma vez e encerrada', b.window && n1 === 1 && n2 === 1 && !still && same, `${name} em ${set.name}, salvo ${b.window ? 'no instante entre o último golpe e a conta' : 'FORA do instante'}: carregado, ${n1} linha(s) na crônica (um passo depois, ${n2}); a execução ${still ? 'AINDA na lista' : 'encerrada'}; a lealdade da cidade ${r2(loyal0)} → ${r2(set1.loyalty)}${a ? ` (no mundo vivo, ${r2(a.loyal0)} → ${r2(a.loyal1)})` : ''}`);
}
function r2(x) { return Math.round(x * 100) / 100; }
const nv = fresh(); const er = M.erros(); const mods = Object.keys(er.mod);
ok('verificador', !nv.length, nv.slice(0, 3).join(' · ') || 'limpo');
ok('erros', !mods.length && !er.console.length, `módulos: ${mods.join(', ') || 'nenhum'}; console: ${er.console.slice(0, 2).join(' · ') || 'nada'}`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU: todos');
process.exit(fails.length ? 1 : 0);
