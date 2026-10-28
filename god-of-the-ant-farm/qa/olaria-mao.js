// olaria-mao: a fornada de ponta a ponta numa olaria de mentira, montada à mão — só o código do jogo (nodemundo M.load), sem
// gerar mundo nenhum: um segundo. Um povo grego, uma vila, a olaria, uma pessoa que faz cada unidade pela mesma porta do corpo
// (G.Oficio.unit, os atos da definição 'oficio') e o relógio do mundo (G.Act.update): a argila separada, amassar, moldar, a
// chuva e a noite que param a secagem, enfornar, a lenha que o fogo come, esfriar, contar (os quebrados pelo acaso do mundo),
// o livro-razão da fornada, a reserva solta, levar ao armazém com o salário; o verificador dos ofícios (qa/oficio-inv.js) em
// cada segundo, e acusando as contas que não fecham; e a troca com chave desfeita e tentada de novo (L-240), inteira ou nada.
// As provas no mundo de verdade (o save no meio da queima, o oleiro que morre, o deus, o corpo) são as do qa/olaria.js.
//   node qa/olaria-mao.js
const path = require('path');
const M = require('./nodemundo.js'); const G = M.load({ qa: true, extra: ['qa/oficio-inv.js'] });
const D = G.Depot, A = G.Act, O = G.Oficio, E = G.Eco;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | olaria-mao ${name} | ${info}`); if (!c) fails.push(name); };
// (the world by hand: what the depot, the operations and the trade read of it)
function world() {
  const f = { id: 1, name: 'Pólis de teste', alive: true, civ: 'grego', stock: { food: 70, wood: 30, moedas: 40, argila: 0 }, tech: { known: { moeda: 1 } }, rel: {} };
  const set = { id: 2, name: 'Argos', fac: 1, cx: 10, cy: 10, tier: 2 };
  const ol = { id: 3, type: 'olaria', x: 8, y: 8, w: 2, h: 2, built: true, progress: 1, set: 2, inv: {}, need: { wood: 0, stone: 0 }, incoming: {}, hp: 130, maxHp: 130, ip: null, style: 'grego' };
  const v = { id: 4, name: 'Teseu', set: 2, age: 30, hp: 100, carry: null, purse: 0, home: 0, job: 3, role: 'oleiro', traits: [], x: 9, y: 10.2, st: {}, diary: [] };
  G.S = { day: 3, clock: 600, time: 0.3, nextId: 100, rng: 12345, buildings: new Map([[3, ol]]), villagers: new Map([[4, v]]), factions: new Map([[1, f]]), settlements: new Map([[2, set]]), ships: [], acts: [], ledger: [], ledgerN: 0, loose: [], weather: { rain: 0, storm: 0, drought: 0 }, stats: { foodProduced: 0, woodProduced: 0, stoneProduced: 0 }, history: [], dead: new Map() };
  for (const h of G.worldHooks) h();
  E.ensure(f);
  return { f, set, ol, v };
}
G.inSim++;
// ---------------- the deal undone and tried again (L-240)
{
  const { f } = world();
  const a = { id: 5, name: 'a', set: 2, age: 30, hp: 100, carry: { k: 'food', n: 10 }, purse: 0, home: 0 }, b = { id: 6, name: 'b', set: 2, age: 30, hp: 100, carry: { k: 'food', n: 5 }, purse: 0, home: 0 };
  G.S.villagers.set(5, a); G.S.villagers.set(6, b);
  // (the store has room for 10 of food: the first leg fills it, the second does not fit, and the deal is undone)
  const deal = () => D.swap(['v:5', 'f:1', 'food', 10], ['v:6', 'f:1', 'food', 5], { code: 'teste', key: 'troca-1' });
  const r1 = deal(), r2 = deal();
  const whole = !r1.ok && ((r2.ok && !a.carry && !b.carry) || (!r2.ok && a.carry && a.carry.n === 10 && b.carry && b.carry.n === 5 && f.stock.food === 70));
  ok('l240', whole, `1ª ${r1.ok ? 'feita' : 'desfeita'}, 2ª ${r2.ok ? 'feita' : 'desfeita'}: armazém ${f.stock.food}, mãos ${a.carry ? a.carry.n : 0} e ${b.carry ? b.carry.n : 0}`);
}
// ---------------- a batch of fired bricks, every stage
const { f, ol, v } = world();
const rule = QA.oficio; const bad = []; // (the trades' rule by its name: oficio-inv.js has more than one)
const inv = () => rule((sys, sev, msg) => { if (sys === 'oficio') bad.push(`S${sev} ${msg}`); }, G.S);
const sec = n => { for (let k = 0; k < n; k++) { G.S.clock += 1; G.S.time = (G.S.time + 1 / G.DAY_LEN) % 1; A.update(1); inv(); } };
const codes = op => { const c = {}; for (const e of G.S.ledger) if (e[7] === op.id) c[e[8]] = Math.round(((c[e[8]] || 0) + e[6]) * 100) / 100; return c; };
const op = O.start(ol, 'tijolo', v);
ok('comeca', !!op && op.data.s === 0, op ? `fornada #${op.id}, etapa ${O.stage(op).id}` : 'não começou');
for (let k = 0; k < 2; k++) { D.make('v:4', 'argila', 3, { op: op.id, code: 'barreiro', by: 4, to: 'b:3' }); A.DEFS.oficio.acts.argila.run(v, { op: op.id }); }
ok('argila', O.stage(op).id === 'amassar' && op.data.got === 6 && D.reserved('b:3', 'argila') === 6, `etapa ${O.stage(op).id}, separada ${op.data.got}, reservada ${D.reserved('b:3', 'argila')}`);
let units = 0; for (let k = 0; k < 20 && O.stage(op).kind === 'mao' && !O.stage(op).kiln; k++) { if (!O.unit(op, v).ok) break; units++; }
ok('maos', O.stage(op).id === 'secar' && op.data.cru === 12 && op.data.usado === 6 && units === 12, `etapa ${O.stage(op).id}, crus ${op.data.cru}, argila usada ${op.data.usado}, ${units} unidades`);
const late = A.DEFS.oficio.acts.unidade.can(v, { op: op.id, s: 1 });
ok('etapa-passada', !late.ok, late.why || '');
G.S.time = 0.1; G.S.weather.rain = 0.8; sec(30);
ok('chuva', op.st === 'wait' && op.wait === 'chuva' && op.data.t === 0, `estado ${op.st} (${op.wait}), secou ${op.data.t} s`);
G.S.time = 0.7; G.S.weather.rain = 0; sec(20); const t0 = op.data.t; sec(30);
ok('noite', op.st === 'wait' && op.wait === 'noite' && op.data.t === t0, `estado ${op.st} (${op.wait}), secou ${op.data.t} s`);
G.S.time = 0.1; sec(62);
ok('sol', O.stage(op).id === 'enfornar', `etapa ${O.stage(op).id}`);
for (let k = 0; k < 5 && O.stage(op).id === 'enfornar'; k++) O.unit(op, v);
ok('enfornar', O.stage(op).id === 'queimar' && op.data.forno === 12, `etapa ${O.stage(op).id}, no forno ${op.data.forno}`);
sec(5);
ok('sem-lenha-espera', O.stage(op).id === 'queimar' && op.data.fogo === 0, `fogo ${op.data.fogo} s com o forno sem lenha`);
D.move('f:1', 'v:4', 'wood', 4, { op: op.id, code: 'buscar', by: 4, to: 'b:3' });
let fed = 0; for (let k = 0; k < 6 && fed < 4; k++) { if (!A.DEFS.oficio.acts.lenha.can(v, { op: op.id }).ok) { sec(16); continue; } A.DEFS.oficio.acts.lenha.run(v, { op: op.id }); fed++; sec(16); }
ok('lenha', fed === 4 && op.data.lenha === 4 && !v.carry, `lenha posta ${op.data.lenha}, fogo ${op.data.fogo} s`);
sec(40);
ok('queimou', O.stage(op) && O.stage(op).id === 'tirar', `etapa ${O.stage(op) ? O.stage(op).id : '(fim)'}, fogo ${op.data.fogo} s`);
for (let k = 0; k < 5 && A.live(op); k++) O.unit(op, v);
ok('contados', !A.live(op) && op.st === 'ok' && op.data.feitos + op.data.quebrados === 12 && D.get('b:3', 'tijolo') === op.data.feitos, `${op.data.feitos} tijolos e ${op.data.quebrados} quebrados; na prateleira ${D.get('b:3', 'tijolo')}`);
const c = codes(op);
ok('livro', c.barreiro === 6 && c.amassar === 6 && c.lenha === 4 && c.fornada === op.data.feitos, JSON.stringify(c));
ok('reserva', D.reserved('b:3', 'argila') === 0, `reservada ${D.reserved('b:3', 'argila')}`);
const w0 = f.stock.moedas; const r = A.DEFS.oficio.acts.levar.run(v, { b: 3, k: 'tijolo' });
ok('levar', r.ok && v.carry && v.carry.k === 'tijolo' && v.carry.to === 'f:1' && f.stock.moedas < w0, `${r.msg || r.why} (tesouro ${w0} → ${f.stock.moedas})`);
ok('verificador', !bad.length, bad.slice(0, 4).join(' | ') || 'limpo em todos os segundos');
// (and the checker says so when the books do not close: a pot from nowhere in a batch)
const op3 = O.start(ol, 'ceramica', v); op3.data.cru = 3; const n0 = bad.length; inv();
ok('verificador-acusa', bad.length > n0 && /não fecham/.test(bad[bad.length - 1]), bad[bad.length - 1] || 'nada acusado');
const err = M.erros(); ok('erros', !Object.keys(err.mod || {}).length && !err.console.length, JSON.stringify(err.mod) + ' ' + err.console.slice(0, 3).join(' | '));
console.log(fails.length ? `OLARIA-MAO: FALHOU (${fails.join(', ')})` : 'OLARIA-MAO: ok');
process.exit(fails.length ? 1 : 0);
void path;
