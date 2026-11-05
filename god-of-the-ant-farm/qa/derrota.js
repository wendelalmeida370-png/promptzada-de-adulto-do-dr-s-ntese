// derrota: a batalha de campo provocada de propósito, e o lado que perde foge — poucos lutam até o último (T-093).
//   node qa/derrota.js [semente]
// O caso 6 do guerra10 («medium») julga a derrota numa batalha que a guerra encontra sozinha; com a economia da v37 a
// guerra determinística daquele mundo termina por desgaste antes de os exércitos se encontrarem, e o caso ficava sem
// batalha para julgar. Aqui o reino A levanta um exército contra a capital do B, o B levanta a guarda dela, e eles se
// encontram. d1 a batalha acontece; d2 ninguém luta até o último homem (nenhum lado de 10 ou mais com 90% de mortos);
// d3 quem perde foge, se rende ou deixa o campo; d4 os exércitos terminam (o que sobrou volta para casa) e o
// verificador fica limpo do começo ao fim.
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const seed = +(process.argv[2] || 11);
const fails = []; const mid = [];
const ok = (name, c, info) => { const m = mid.splice(0); const pass = c && !m.length; console.log(`${pass ? 'PASSOU' : 'FALHOU'} | derrota ${name} | ${info}${m.length ? ' — o verificador, no meio do caso: ' + m.slice(0, 2).join(' · ') : ''}`); if (!pass) fails.push(name); };
const watch = () => { for (const q of QA.check()) { const t = `[S${q.sev}] ${q.sys}: ${q.msg}`; if (q.sev <= 2 && !mid.includes(t)) mid.push(t); } };
const live = (sec, until) => { for (let k = 1; k <= sec * 10; k++) { M.viver(0.1); if (k % 50 === 0) watch(); if (until && until()) { watch(); return true; } } watch(); return false; };
let S = M.novo({ seed, type: 'continente', size: 170, tribes: 2, temper: 'pacifico', relevo: 'suave' });
// two kingdoms of some hundreds, kept at peace while they grow (as the guerra10 medium case), with food and an armoury
const dw = G.Politics.declareWar; G.Politics.declareWar = () => { };
while (S.day < 6) M.viver(10);
G.Politics.declareWar = dw;
const [A, B] = G.Fac.all().sort((a, b) => G.Fac.pop(b.id) - G.Fac.pop(a.id)).slice(0, 2);
const grow = (f, want) => { const sets = G.Fac.settlementsOf(f.id); let k = 0; while (G.Fac.pop(f.id) < want && k++ < 9000) { const s = sets[k % sets.length]; const a = G.R() * 6.283, r = G.R() * (s.radius || 6); const p = G.W.nearestLand(s.cx + Math.cos(a) * r, s.cy + Math.sin(a) * r, 5); if (!p) continue; G.Vg.create({ set: s.id, x: p[0], y: p[1], age: 17 + G.R() * 38 }); } f.stock.food = Math.max(f.stock.food, want * 7); f.stock.armas = (f.stock.armas || 0) + Math.round(want * 0.15); };
grow(A, 320); grow(B, 260); G.Fac.updateTerritory();
G.Politics.declareWar(A, B, 'ambicao'); live(5);
const Wz = G.Wars; const w = Wz.warOf(A.id, B.id); const tg = G.Fac.capitalOf(B.id);
const host = w && tg && Wz.mobilize(w, G.Fac.get(A.id), 'campanha', tg, {});
const guard = w && tg && Wz.mobilize(w, G.Fac.get(B.id), 'defesa', tg, {});
console.log(`(${A.name} ${G.Fac.pop(A.id)} contra ${B.name} ${G.Fac.pop(B.id)}; exército ${host ? host.members.length : '-'} contra a guarda de ${tg ? tg.name : '-'} ${guard ? guard.members.length : '-'})`);
if (!host || !guard) { ok('d1 a batalha', false, `precondição: ${!host ? A.name + ' não convocou' : B.name + ' não convocou a guarda'}`); process.exit(1); }
// the field battle: a closed record out of the towns (an assault on a town is judged by the conquest) with both sides of ten or more
const field = () => Wz.state().battles.filter(b => !b.naval && !b.town && !b.open && Object.keys(b.sides).length >= 2 && Object.values(b.sides).every(s => s.n >= 10) && Object.keys(b.sides).map(Number).includes(A.id) && Object.keys(b.sides).map(Number).includes(B.id));
live(G.DAY_LEN * 2.5, () => field().length > 0);
const bts = field(); const bt = bts[0];
const sides = bt ? Object.entries(bt.sides).map(([k, s]) => `${(G.Fac.get(+k) || {}).name}: ${s.n}, ${s.dead} mortos, ${s.captured} pegos, ${s.fled} fugiram`).join(' · ') : '';
ok('d1 a batalha', !!bt, bt ? `${bt.name}, vencedor ${(G.Fac.get(bt.winner) || { name: 'ninguém' }).name} — ${sides}` : 'os exércitos não se encontraram em 2,5 dias');
if (bt) {
  const last = Object.values(bt.sides).filter(s => s.n >= 10 && s.dead >= s.n * 0.9);
  ok('d2 ninguém até o último homem', !last.length, last.length ? `${last.length} lado(s) com 90% de mortos` : 'nenhum lado lutou até o fim');
  // the side that lost (with no winner, both): someone of it fled or was taken, or its bands left the field (on the road
  // home, or gone) — a retreat is a defeat too, as the guerra10 counts it
  const left = s => s.bands.every(id => { const o = G.War.bands.get(id); return !o || o.st === 'retorno'; });
  const losers = Object.entries(bt.sides).filter(([k]) => +k !== bt.winner);
  const how = ([k, s]) => s.fled > 0 || s.captured > 0 ? `${(G.Fac.get(+k) || {}).name}: ${s.fled} fugiram, ${s.captured} pegos` : left(s) ? `${(G.Fac.get(+k) || {}).name}: deixou o campo` : '';
  const rout = losers.length > 0 && losers.every(how);
  ok('d3 quem perde foge, se rende ou deixa o campo', rout, rout ? losers.map(how).join(' · ') : `${losers.filter(x => !how(x)).map(([k]) => (G.Fac.get(+k) || {}).name).join(', ')} perdeu e ficou no campo sem fuga nem rendição`);
}
// the armies end: what is left goes home (a war of exhaustion, a peace, or the road home)
live(G.DAY_LEN * 2, () => host.done && guard.done);
ok('d4 os exércitos terminam', host.done && guard.done, `exército ${host.done ? 'encerrado' : host.phase}, guarda ${guard.done ? 'encerrada' : guard.phase}`);
const e = M.erros(); const mods = Object.keys(e.mod);
ok('erros', !mods.length && !e.console.length, `módulos: ${mods.join(', ') || 'nenhum'}; console: ${e.console.slice(0, 2).join(' · ') || 'nada'}`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU: todos');
process.exit(fails.length ? 1 : 0);
