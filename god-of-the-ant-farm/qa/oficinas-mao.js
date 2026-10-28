// oficinas-mao: a tecelagem, a forja e a ourivesaria no motor dos ofícios (G.Oficio), numa vila de mentira montada à mão — só
// o código do jogo (nodemundo M.load), sem gerar mundo: um segundo. O caminhar fica de fora (cada um já está diante de onde
// vai); o resto é o do jogo — as máquinas das tarefas, o G.Depot e o livro-razão, o relógio do mundo (G.Act.update), o
// verificador dos ofícios em cada segundo. Os tecelões buscam a lã no armazém, fiam e tecem; o ferreiro busca o minério e a
// lenha, esquenta a forja e forja o que o reino pede (economy.js forgeOut); o ourives funde o ouro no cadinho e lavra; o que
// fica pronto vai ao armazém com o salário de quem leva; as ferramentas do povo se gastam de vez em quando, pelo livro; sem lã
// não começa fornada de tecido; uma tarefa perdida no meio (o save, uma chamada) não desfaz nem repete unidade; e o corpo do
// deus tece uma unidade pela oferta, no lugar do tecelão.
//   node qa/oficinas-mao.js
const M = require('./nodemundo.js'); const G = M.load({ qa: true, extra: ['qa/oficio-inv.js'] });
const D = G.Depot, A = G.Act, O = G.Oficio, E = G.Eco;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | oficinas-mao ${name} | ${info}`); if (!c) fails.push(name); };
// (the walk, stubbed: a walk is a step to where it goes — the door is the front of the building, the way always open)
G.W.reaches = () => true; G.W.walkable = () => true; G.W.walkableXY = () => true; G.Vg.planDoor = null;
G.Vg.door = b => [b.x + b.w - 0.5, b.y + b.h + 0.05]; G.Village.frontTile = b => [b.x + b.w - 0.5, b.y + b.h - 0.5];
G.Vg.gotoB = (v, b) => { v._go = G.Village.frontTile(b); return true; };
G.FX = new Proxy({}, { get: () => () => undefined }); G.Talk = new Proxy({}, { get: () => () => undefined });
const H = { setTask: (v, t) => { t.age = 0; if (t.st === undefined) t.st = 0; v.task = t; v.actT = 0; return t; }, end: v => G.Vg.endTask(v), move: v => { if (v._go) { v.x = v._go[0]; v.y = v._go[1]; v._go = null; } return true; }, goto: (v, x, y) => { v._go = [x, y]; return true; } };
G.Vg.H = H;
function world(stock) {
  const f = { id: 1, name: 'Pólis de teste', alive: true, civ: 'grego', stock: Object.assign({ food: 100, wood: 30, moedas: 60, la: 30, minerio: 20, ouro: 6, ferramentas: 10, armas: 0 }, stock || {}), tech: { known: { moeda: 1 } }, rel: {} };
  const set = { id: 2, name: 'Vila', fac: 1, cx: 10, cy: 10, tier: 2 };
  const B = (id, type, x, y) => ({ id, type, x, y, w: 2, h: 2, built: true, progress: 1, set: 2, inv: {}, need: { wood: 0, stone: 0 }, incoming: {}, hp: 140, maxHp: 140, ip: null, style: 'grego' });
  const S = G.S = { day: 3, clock: 600, time: 0.3, nextId: 100, rng: 777, buildings: new Map([[3, B(3, 'tecelagem', 8, 8)], [4, B(4, 'storehouse', 12, 8)], [5, B(5, 'forja', 4, 8)], [6, B(6, 'ourives', 8, 4)]]), villagers: new Map(), factions: new Map([[1, f]]), settlements: new Map([[2, set]]), ships: [], acts: [], ledger: [], ledgerN: 0, loose: [], weather: { rain: 0, storm: 0, drought: 0 }, stats: { foodProduced: 0, woodProduced: 0, stoneProduced: 0 }, history: [], dead: new Map(), milestones: {} };
  let id = 10;
  const person = (name, o) => {
    const h = { id: id++, type: 'house', x: 14, y: 12, w: 1, h: 1, built: true, progress: 1, set: 2, inv: {}, coin: 2, pantry: 5, res: 1, need: { wood: 0, stone: 0 }, incoming: {}, hp: 110, maxHp: 110, ip: null };
    S.buildings.set(h.id, h);
    const v = Object.assign({ id: id++, name, set: 2, age: 30, hp: 100, carry: null, purse: 0, home: h.id, job: 0, role: 'coletor', traits: [], x: 9.5, y: 10.3, st: {}, diary: [], hunger: 20, energy: 80, mourn: 0, task: null, actT: 0, inside: 0, work: 1 }, o || {});
    S.villagers.set(v.id, v); return v;
  };
  for (const h of G.worldHooks) h();
  E.ensure(f);
  return { S, f, set, person, tec: S.buildings.get(3), forja: S.buildings.get(5), our: S.buildings.get(6) };
}
G.inSim++;
const rule = QA.more[QA.more.length - 1]; const bad = [];
// (each second: whoever is free asks for the next thing of their trade; every task runs; the world's clock; the checker)
const sec = (n, people) => { for (let k = 0; k < n; k++) { G.S.clock += 1; G.S.time = 0.3 + ((G.S.clock / G.DAY_LEN) % 1) * 0.3; for (const v of people) { if (!v.task) E.jobTask(v, H); if (!v.task) continue; v.task.age += 1; v.actT += 1; E.run(v, v.task, 1, H); } A.update(1); rule((sys, sev, msg) => { if (sys === 'oficio') bad.push(`S${sev} ${msg}`); }, G.S); } };
const lines = code => G.S.ledger.filter(e => e[8] === code);
const sum = (L, k) => Math.round(L.filter(e => !k || e[5] === k).reduce((n, e) => n + e[6], 0) * 100) / 100;
// ---------------- a day of the three workshops
{
  const { S, f, person, tec, forja, our } = world();
  const t1 = person('Aracne', { job: 3, role: 'tecelao' }), t2 = person('Penélope', { job: 3, role: 'tecelao' });
  const fe = person('Hefesto', { job: 5, role: 'ferreiro' }), ou = person('Dédalo', { job: 6, role: 'ourives' });
  const all = [t1, t2, fe, ou];
  const la0 = f.stock.la, mi0 = f.stock.minerio, ouro0 = f.stock.ouro, w0 = f.stock.wood, wantF = E.forgeOut(f);
  sec(1, all);
  const btec = O.batches(tec)[0], bfor = O.batches(forja)[0], bour = O.batches(our)[0];
  ok('comecam', !!btec && !!bfor && !!bour && btec.data.p === 'tecido' && bfor.data.p === wantF && bour.data.p === 'joias', `tecelagem: ${btec ? btec.data.p : '-'}; forja: ${bfor ? bfor.data.p : '-'} (o reino pede ${wantF}); ourivesaria: ${bour ? bour.data.p : '-'}`);
  let stages = new Set(); for (let k = 0; k < 160 && (A.live(btec) || A.live(bfor) || A.live(bour)); k++) { sec(1, all); for (const op of [btec, bfor, bour]) { const s = A.live(op) && O.stage(op); if (s) stages.add(op.data.of + ':' + s.id); } }
  ok('etapas', ['tecelagem:fiar', 'tecelagem:tecer', 'forja:acender', 'forja:forjar', 'ourives:fundir', 'ourives:lavrar'].every(x => stages.has(x)), [...stages].join(', '));
  ok('fornadas-prontas', btec.st === 'ok' && bfor.st === 'ok' && bour.st === 'ok' && btec.data.feitos === 6 && bfor.data.feitos === 6 && bour.data.feitos === 2, `tecido ${btec.data.feitos} (${btec.st}), ${bfor.data.p} ${bfor.data.feitos} (${bfor.st}), joias ${bour.data.feitos} (${bour.st})`);
  // (what left the store of each input left it by the ledger, fetched for a batch — and the next batches have begun meanwhile)
  const took = k => sum(S.ledger.filter(e => e[3] === 'f:1' && e[8] === 'buscar'), k);
  ok('insumos', [['la', la0], ['minerio', mi0], ['ouro', ouro0]].every(([k, n0]) => n0 - f.stock[k] >= (k === 'la' ? 12 : k === 'ouro' ? 2 : 6) && Math.abs((n0 - f.stock[k]) - took(k)) < 0.01), `lã ${la0} → ${f.stock.la} (buscada ${took('la')}), minério ${mi0} → ${f.stock.minerio} (${took('minerio')}), ouro ${ouro0} → ${f.stock.ouro} (${took('ouro')})`);
  ok('lenha-do-fogo', bfor.data.lenha === 2 && bour.data.lenha === 1 && f.stock.wood <= w0 - 3, `a forja queimou ${bfor.data.lenha}, o cadinho ${bour.data.lenha}; armazém ${w0} → ${f.stock.wood}`);
  // the goods to the store, with the wage of who takes them
  const st0 = { tecido: f.stock.tecido || 0, joias: f.stock.joias || 0, [wantF]: f.stock[wantF] || 0 };
  for (let k = 0; k < 40 && (D.get('b:3', 'tecido') + D.get('b:5', wantF) + D.get('b:6', 'joias') > 0.5 || all.some(v => v.carry)); k++) sec(1, all);
  ok('ao-armazem', f.stock.tecido >= st0.tecido + 6 - 0.01 && f.stock.joias >= st0.joias + 2 - 0.01 && f.stock[wantF] >= st0[wantF] + 6 - 0.01, `tecido +${Math.round((f.stock.tecido - st0.tecido) * 100) / 100}, joias +${Math.round((f.stock.joias - st0.joias) * 100) / 100}, ${wantF} +${Math.round((f.stock[wantF] - st0[wantF]) * 100) / 100}`);
  ok('salario', lines('salario').length >= 3 && lines('recolher').length >= 3, `${lines('recolher').length} cargas recolhidas, ${lines('salario').length} salários (${sum(lines('salario'))} moedas)`);
  ok('desgaste-pelo-livro', lines('desgaste').every(e => e[3] === 'f:1' && e[5] === 'ferramentas') && (f.stock.ferramentas || 0) + sum(lines('desgaste')) === 10 + (wantF === 'ferramentas' ? 6 : 0), `${lines('desgaste').length} ferramentas gastas no trabalho (o armazém tem ${f.stock.ferramentas})`);
  void S;
}
// ---------------- no wool, no cloth; an errand lost in the middle; the body at the loom
{
  const { S, f, person, tec } = world({ la: 0 });
  const t1 = person('Aracne', { job: 3, role: 'tecelao' });
  sec(3, [t1]);
  ok('sem-la', !O.batches(tec).length, 'sem lã no armazém nem na prateleira: nenhuma fornada de tecido');
  f.stock.la = 12; sec(1, [t1]); const op = O.batches(tec)[0];
  for (let k = 0; k < 40 && op && A.live(op) && O.stage(op).id !== 'tecer'; k++) sec(1, [t1]);
  // (the errand lost: a save, a call away — the batch keeps where it is, the next errand takes up the next unit)
  const q0 = op.data.q; t1.task = null; sec(1, [t1]);
  ok('tarefa-perdida', A.live(op) && op.data.q >= q0 && (op.data.fio || 0) >= 0 && !bad.some(m => /não fecham/.test(m)), `unidades ${q0} → ${op.data.q}, fio ${op.data.fio}`);
  // the god's body takes the weaver's place for a unit: the same door, the same unit
  S.avatar = { id: t1.id, deeds: {} }; t1.task = null; const at = G.Vg.door(tec); t1.x = at[0]; t1.y = at[1];
  const o = A.offers(t1, t1.x, t1.y, 2.5).find(x => x.def === 'oficio' && x.act === 'unidade' && x.op === op.id);
  const q1 = op.data.q, f1 = op.data.feitos; const r = o ? A.perform(t1, o) : { ok: false, why: 'sem oferta' };
  ok('corpo-tece', !!o && r.ok && op.data.q === q1 + 1 && (O.stage(op) ? op.data.feitos >= f1 : true), `${o ? o.label : 'sem oferta'} → ${r.ok ? r.msg : r.why}; feitos ${f1} → ${op.data.feitos}`);
  S.avatar = null;
}
ok('verificador', !bad.length, bad.slice(0, 4).join(' | ') || 'limpo em todos os segundos');
// ---------------- the ceiling of the trades (D-090): once, over all of them, by the largest remainder
{
  const { S, f, set, person } = world();
  for (let i = 0; i < 9; i++) person('P' + i); // (ten grown hands with the one of each house: the ceiling 38% is 3)
  const A0 = 10;
  const ask = () => ({ oleiro: 2, ourives: 1, taverneiro: 1, mercador: 1, pescador: 4, pastor: 1 });
  const got = E.share(ask(), set, f, A0);
  // (6 hands asked under the ceiling of 3: first one hand for each kind of place, in the fixed order — the tavern, the
  // market, the pottery —, and the ceiling is full; the fishermen bring food: outside; the shepherd stays, even over the
  // ceiling, as always)
  ok('teto-um-por-tipo', got.taverneiro === 1 && got.mercador === 1 && got.oleiro === 1 && got.ourives === 0 && got.pescador === 4 && got.pastor >= 1, `pedem ${JSON.stringify(ask())}, o teto ${Math.floor(A0 * 0.38)}: ${JSON.stringify(got)}`);
  // (a bigger town: the ceiling of 7 holds one of each of the 5 kinds, and the 2 left go by the largest remainder of what
  // each still asks — the pottery 3 more and the mine 1 more, 4 in all, f = 0.5: the pottery 1 by the floor, then the
  // remainders of 0.5 by name, the mine first)
  const big = E.share({ oleiro: 4, mineiro: 2, taverneiro: 1, mercador: 1, ourives: 1 }, set, f, 20);
  ok('teto-maior-resto', big.oleiro === 2 && big.mineiro === 2 && big.taverneiro === 1 && big.mercador === 1 && big.ourives === 1, `o teto ${Math.floor(20 * 0.38)}: ${JSON.stringify(big)}`);
  const pop = G.Village.pop(set.id); f.stock.food = pop * 1.5 - 1; // (a hungry town: the ceiling 18% — one hand)
  const hun = E.share({ oleiro: 2, ourives: 1, mercador: 1, pescador: 4 }, set, f, A0);
  ok('teto-com-fome', hun.oleiro + hun.ourives + hun.mercador === 1 && hun.pescador === 4, `com fome (${f.stock.food} de comida para ${pop}): ${JSON.stringify(hun)}`);
  const few = E.share({ oleiro: 1, ourives: 1 }, set, f, 100);
  ok('teto-folgado', few.oleiro === 1 && few.ourives === 1, `sob o teto, nada muda: ${JSON.stringify(few)}`);
  void S;
}
const err = M.erros(); ok('erros', !Object.keys(err.mod || {}).length && !err.console.length, JSON.stringify(err.mod) + ' ' + err.console.slice(0, 3).join(' | '));
console.log(fails.length ? `OFICINAS-MAO: FALHOU (${fails.join(', ')})` : 'OFICINAS-MAO: ok');
process.exit(fails.length ? 1 : 0);
