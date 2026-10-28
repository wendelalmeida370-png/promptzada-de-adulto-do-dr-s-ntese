// cena-lugar: node qa/cena-lugar.js — a cena da manhã de quem viu a noite não quebra quando não acha lugar (L-303).
// «O Que Viu na Noite» (tt-manha) põe a testemunha diante da porta de casa, num lugar livre (Sn.spot), e o parente ao lado
// dela; quando a frente da casa não tinha lugar livre, o lugar era nulo e a cena quebrava ao pôr o parente ao lado
// (at[0]) — «scene tt-manha TypeError» no console, achado gerando o mundo pronto mundial (semente 3511, 28/10). Aqui a
// cena roda com o lugar sempre nulo (a frente da casa tomada) e com a gente de um mundo pronto:
//  c1 a cena anda até o fim, sem erro, com o parente e sem ele
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | cena-lugar ${name} | ${info}`); if (!c) fails.push(name); };
const S = M.pronto('cidade');
const Sn = G.Scene; const d = Sn.defs['tt-manha'];
const p = [...S.villagers.values()].sort((a, b) => a.id - b.id).find(v => v.age >= 16 && S.buildings.get(v.home) && S.buildings.get(v.home).built);
const k = [...S.villagers.values()].sort((a, b) => a.id - b.id).find(v => v !== p && v.age > 10);
// (the scene's hands, as the scene system gives them: the roles, the taking, the walks; the rest — the camera, the
// captions, the poses, the lines — changes nothing here)
const play = withK => {
  const ctx = { story: () => ({ id: 1, data: {} }), v: r => (r === 'p' ? p : r === 'k' && withK ? k : null), take: () => true, walk: () => ({ walk: 1 }), say: () => ({ say: 1 }) };
  const c = new Proxy(ctx, { get: (o, key) => (key in o ? o[key] : () => ({})) });
  const was = Sn.spot; Sn.spot = () => null; let err = null, n = 0;
  try { const g = d.gen(c); for (let r = g.next(); !r.done && n < 400; r = g.next(1)) n++; } catch (e) { err = e; } finally { Sn.spot = was; }
  return { err, n };
};
const a = play(true), b = play(false);
ok('c1 sem lugar diante da casa, a cena anda até o fim', !a.err && !b.err && a.n > 2 && b.n > 2, `com o parente: ${a.err ? 'quebrou: ' + a.err.message : a.n + ' passos'}; sem o parente: ${b.err ? 'quebrou: ' + b.err.message : b.n + ' passos'}`);
const e = M.erros(); const mods = Object.keys(e.mod);
ok('erros', !mods.length && !e.console.length, `módulos: ${mods.join(', ') || 'nenhum'}; console: ${e.console.slice(0, 2).join(' · ') || 'nada'}`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU: todos');
process.exit(fails.length ? 1 : 0);
