// taverna-mao: o dia de uma taverna numa vila de mentira, montada à mão — só o código do jogo (nodemundo M.load), sem gerar
// mundo: um segundo. O caminhar fica de fora (cada um já está diante da taverna: os passos de verdade são os do qa/taverna.js);
// o resto é o do jogo — as máquinas das tarefas, o G.Depot e o livro-razão, o relógio do mundo (G.Act.update). Um povo grego
// de moeda: o taverneiro compra no armazém (comida e vinho, pagando da casa dele), a taverna abre na hora, os fregueses vêm
// pela vontade e pelo dinheiro da casa (quem não pode pagar não vem), sentam, pedem, são servidos um a um, pagam à casa do
// dono, comem e bebem, saem; a falta («acabou»); a casa cheia; o fechamento na hora, com todos para fora; o caixa do dia
// contra o livro-razão; o dia que atravessa o save com gente à mesa (o gancho devolve cada um ao seu lugar); um povo sem moeda
// (o armazém dá, ninguém paga); e a cuba: a cerveja como fornada do G.Oficio, do grão que o taverneiro comprou. E um save de antes
// do «gasto» (o livro do dia dizia «custo», o nome que é do que a casa custou, L-236): o gancho aceita o nome velho.
//   node qa/taverna-mao.js
const M = require('./nodemundo.js'); const G = M.load({ qa: true, extra: ['qa/oficio-inv.js'] });
const D = G.Depot, A = G.Act, T = G.Taverna, E = G.Eco, O = G.Oficio;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | taverna-mao ${name} | ${info}`); if (!c) fails.push(name); };
// (the walk, stubbed: a walk is a step to where it goes — the door is the front of the building, the way always open)
G.W.reaches = () => true; G.W.walkable = () => true; G.W.walkableXY = () => true; G.Vg.planDoor = null;
G.Vg.door = b => [b.x + b.w - 0.5, b.y + b.h + 0.05]; G.Village.frontTile = b => [b.x + b.w - 0.5, b.y + b.h - 0.5];
G.Vg.gotoB = (v, b) => { v._go = G.Village.frontTile(b); return true; };
// (what is only seen — the particles, the bubbles — wants the map: nothing of it here)
G.FX = new Proxy({}, { get: () => () => undefined }); G.Talk = new Proxy({}, { get: () => () => undefined });
const H = { setTask: (v, t) => { t.age = 0; v.task = t; v.actT = 0; return t; }, end: v => G.Vg.endTask(v), move: v => { if (v._go) { v.x = v._go[0]; v.y = v._go[1]; v._go = null; } return true; }, goto: (v, x, y) => { v._go = [x, y]; return true; } };
function world(civ, coinOn) {
  const f = { id: 1, name: 'Povo de teste', alive: true, civ, stock: { food: 120, wood: 30, moedas: 40, vinho: 10, mel: 10 }, tech: { known: coinOn ? { moeda: 1 } : {} }, rel: {} };
  const set = { id: 2, name: 'Vila', fac: 1, cx: 10, cy: 10, tier: 2 };
  const tv = { id: 3, type: 'taverna', x: 8, y: 8, w: 2, h: 2, built: true, progress: 1, set: 2, inv: {}, need: { wood: 0, stone: 0 }, incoming: {}, hp: 130, maxHp: 130, ip: null, style: civ };
  const store = { id: 4, type: 'storehouse', x: 12, y: 8, w: 2, h: 2, built: true, progress: 1, set: 2, inv: {}, need: { wood: 0, stone: 0 }, incoming: {}, hp: 140, maxHp: 140, ip: null };
  const S = G.S = { day: 3, clock: 600, time: 0.2, nextId: 100, rng: 4242, buildings: new Map([[3, tv], [4, store]]), villagers: new Map(), factions: new Map([[1, f]]), settlements: new Map([[2, set]]), ships: [], acts: [], ledger: [], ledgerN: 0, loose: [], weather: { rain: 0, storm: 0, drought: 0 }, stats: { foodProduced: 0, woodProduced: 0, stoneProduced: 0 }, history: [], dead: new Map(), milestones: {} };
  let id = 10;
  const person = (name, coins, o) => {
    const h = { id: id++, type: 'house', x: 14, y: 12, w: 1, h: 1, built: true, progress: 1, set: 2, inv: {}, coin: coins, pantry: 0, res: 1, need: { wood: 0, stone: 0 }, incoming: {}, hp: 110, maxHp: 110, ip: null };
    S.buildings.set(h.id, h);
    const v = Object.assign({ id: id++, name, set: 2, age: 30, hp: 100, carry: null, purse: 0, home: h.id, job: 0, role: 'coletor', traits: [], x: 9.5, y: 10.3, st: {}, diary: [], hunger: 20, energy: 80, mourn: 0, task: null, actT: 0, inside: 0, drinks: 0 }, o || {});
    S.villagers.set(v.id, v); return v;
  };
  for (const h of G.worldHooks) h();
  E.ensure(f);
  return { S, f, set, tv, person };
}
G.inSim++;
// (the trades' and the tavern's rules of the checker, alone — the rest of QA.check wants a whole world — every second)
const rule = QA.oficio; const bad = []; // (the trades' rule by its name: oficio-inv.js has more than one)
const sec = (n, people) => { for (let k = 0; k < n; k++) { G.S.clock += 1; G.S.time = (G.S.time + 1 / G.DAY_LEN) % 1; for (const v of people) { if (!v.task) continue; v.task.age += 1; v.actT += 1; G.Eco.run(v, v.task, 1, H); } A.update(1); rule((sys, sev, msg) => { if (sys === 'oficio') bad.push(`S${sev} ${msg}`); }, G.S); } };
const lines = (code) => G.S.ledger.filter(e => e[8] === code);
// ---------------- a day in a people of coin
{
  const { S, f, tv, person } = world('grego', true);
  const k = person('Taverneiro', 6, { job: 3, role: 'taverneiro' }); const kh = S.buildings.get(k.home);
  const c = [person('Ana', 3), person('Bia', 3), person('Caio', 3, { hunger: 70 })]; const poor = person('Pobre', 0.1);
  const all = [k, ...c, poor];
  // before its hour, shut; at its hour with an empty shelf, still shut: its keeper buys first
  G.S.time = 0.50; sec(2, all); ok('fechada-antes', !T.dia(tv), `S.time ${G.S.time.toFixed(2)}: ${T.dia(tv) ? 'aberta' : 'fechada'}`);
  G.S.time = 0.56; sec(2, all); ok('sem-estoque-nao-abre', !T.dia(tv), 'a prateleira vazia: não abriu');
  const k0 = kh.coin, t0 = f.stock.moedas;
  for (let r = 0; r < 2; r++) { E.jobTask(k, H); for (let s = 0; s < 6 && k.task; s++) sec(1, all); }
  ok('compra-no-armazem', D.get('b:3', 'food') >= 6 && D.get('b:3', 'vinho') >= 1 && kh.coin < k0 && f.stock.moedas > t0, `prateleira: ${D.get('b:3', 'food')} de comida, ${D.get('b:3', 'vinho')} de vinho; casa do taverneiro ${k0} → ${kh.coin}; tesouro ${t0} → ${f.stock.moedas}`);
  sec(2, all); const op = T.dia(tv);
  ok('abre', !!op && op.st === 'on', op ? `o dia #${op.id} aberto às ${Math.floor(G.S.time * 24)}h` : 'não abriu');
  // the customers: by their own wish (here, asked), those who can pay
  const tasks = c.map(v => T.visitTask(v, H)); const tp = T.visitTask(poor, H);
  ok('quem-pode-vem', tasks.every(t => t && t.type === 'tavern') && !tp, `${tasks.filter(Boolean).length} fregueses a caminho; quem não pode pagar: ${tp ? 'veio' : 'não veio'}`);
  sec(1, all);
  ok('sentam-e-pedem', c.every(v => op.data.mesa[v.id] && v.inside === tv.id) && op.data.fila.length === 3, `à mesa ${Object.keys(op.data.mesa).length}, na fila ${op.data.fila.length}`);
  const homes0 = c.map(v => S.buildings.get(v.home).coin), kh1 = kh.coin;
  // the keeper serves, one by one
  for (let r = 0; r < 6 && (op.data.fila.length || c.some(v => v.task && v.task.st === 3)); r++) { if (!k.task || k.task.type !== 'atender') E.jobTask(k, H); sec(3, all); }
  ok('servidos', op.data.servidos >= 3, `${op.data.servidos} servidos, receita ${op.data.receita}`);
  ok('a-casa-do-dono-recebe', Math.abs((kh.coin - kh1) - op.data.receita) < 0.01, `casa do taverneiro +${Math.round((kh.coin - kh1) * 100) / 100}, receita do dia ${op.data.receita}`);
  ok('quem-pediu-pagou', c.every((v, i) => S.buildings.get(v.home).coin < homes0[i]), c.map((v, i) => `${v.name} ${homes0[i]} → ${S.buildings.get(v.home).coin}`).join(', '));
  ok('o-faminto-comeu', c[2].hunger < 70, `fome de Caio 70 → ${c[2].hunger}`);
  sec(8, all);
  const paid = lines('taverna').filter(e => e[5] === 'moedas').reduce((n, e) => n + e[6], 0);
  ok('caixa-e-livro', Math.abs(paid - op.data.receita) < 0.01, `caixa ${op.data.receita}, pagamentos no livro ${Math.round(paid * 100) / 100}`);
  ok('nada-sem-pagar', lines('taverna').filter(e => e[5] !== 'moedas').length === lines('taverna').filter(e => e[5] === 'moedas').length, `${lines('taverna').filter(e => e[5] !== 'moedas').length} servidos, ${lines('taverna').filter(e => e[5] === 'moedas').length} pagamentos`);
  // the closing hour: everyone out, the day ended
  G.S.time = 0.86; for (const v of c) if (!v.task) T.visitTask(v, H); sec(1, all);
  const inside = () => c.filter(v => v.inside === tv.id).length;
  const before = Object.keys(op.data.mesa).length; G.S.time = 0.881; sec(2, all);
  ok('fecha-na-hora', before >= 2 && !A.live(op) && inside() === 0 && !Object.keys(op.data.mesa).length && c.every(v => !v.task || v.task.type !== 'tavern'), `${before} à mesa antes de fechar; depois: dia ${op.st}, ${inside()} dentro`);
  ok('nao-reabre', (() => { G.S.time = 0.6; sec(1, all); return !T.dia(tv); })(), 'o dia acabado não abre de novo no mesmo dia');
}
// ---------------- a full tavern; what is not there; the day across a save
{
  const { S, tv, person } = world('grego', true);
  const k = person('Taverneiro', 6, { job: 3, role: 'taverneiro' });
  D.make('b:3', 'food', 2, { code: 'teste' }); G.S.time = 0.6; A.update(1); const op = T.dia(tv);
  const crowd = []; for (let i = 0; i < T.SEATS; i++) { const v = person('F' + i, 3); T.visitTask(v, H); crowd.push(v); }
  sec(1, [k, ...crowd]);
  const late = person('Atrasado', 3); const tl = T.visitTask(late, H);
  ok('cheia', Object.keys(op.data.mesa).length === T.SEATS && !tl, `${Object.keys(op.data.mesa).length} à mesa de ${T.SEATS}; mais um: ${tl ? 'veio' : 'não veio'}`);
  // two meals for eight: the rest hear «it's finished» and go
  for (let r = 0; r < 10 && op.data.fila.length; r++) { if (!k.task || k.task.type !== 'atender') E.jobTask(k, H); sec(3, [k, ...crowd]); }
  ok('acabou', op.data.faltas >= 1 && op.data.servidos === 2, `${op.data.servidos} servidos, ${op.data.faltas} faltas`);
  // the save: tasks are not saved; the hook seats again who was at a table
  const sit = person('Sentado', 3); T.visitTask(sit, H); sec(1, [sit]); const was = !!op.data.mesa[sit.id];
  for (const v of S.villagers.values()) { v.task = null; } const hook = G.saveHooks.find(h => /taverna/.test(String(h.load)) && /mesa/.test(String(h.load)));
  hook.load({});
  ok('save-devolve-a-mesa', was && sit.task && sit.task.type === 'tavern' && sit.task.op === op.id && sit.task.st === 2 && sit.inside === tv.id, `${sit.name}: ${sit.task ? sit.task.type + ' st ' + sit.task.st : 'sem tarefa'}, dentro ${sit.inside === tv.id}`);
  // (the save says who sits at a table: one called away a moment before it — the tables keep them until their next look — is
  // not sat down again, and the one still there is; at the next look the table lets go of who left — L-435)
  {
    const gone = person('Chamado', 3); T.visitTask(gone, H); sec(1, [gone]); const was2 = !!op.data.mesa[gone.id];
    G.Vg.setTask(gone, { type: 'idle', pri: 3, wait: 10 }); const held = !!op.data.mesa[gone.id];
    const sv = {}; hook.save(sv); for (const v of S.villagers.values()) v.task = null; hook.load(sv);
    const back = !!gone.task && gone.task.type === 'tavern'; const stays = !!sit.task && sit.task.type === 'tavern' && sit.inside === tv.id;
    sec(1, [k, sit]); const let_go = !op.data.mesa[gone.id];
    ok('save-so-quem-estava', was2 && held && !back && gone.inside !== tv.id && stays && let_go, `${gone.name} à mesa ${was2 ? 'sim' : 'NÃO'}, chamado um momento antes do save (ainda na mesa: ${held ? 'sim' : 'NÃO'}); depois do gancho: ${back ? 'DE VOLTA À MESA' : 'fora'}; ${sit.name} ${stays ? 'à mesa' : 'FORA DA MESA'}; um segundo depois a mesa ${let_go ? 'o soltou' : 'AINDA O TEM'}`);
  }
  // a day saved before its book said «gasto»: what the keeper paid was «custo» there — the load takes the old word, and the
  // checker sees the day's book whole (every second after it)
  op.data.custo = 1.5; delete op.data.gasto; hook.load({}); sec(1, [k, sit]);
  ok('save-de-antes-do-gasto', op.data.gasto === 1.5 && !('custo' in op.data), `o livro do dia depois do load: gasto ${op.data.gasto}, custo ${op.data.custo === undefined ? '(nenhum)' : op.data.custo}`);
}
// ---------------- who lost both arms: given to drink by the keeper's hand, paid the same; never served at a counter alone (D-152, L-693)
{
  const { S, tv, person } = world('grego', true);
  const k = person('Taverneiro', 6, { job: 3, role: 'taverneiro' }); const kh = S.buildings.get(k.home);
  const dora = person('Dora', 3, { lost: { armL: 1, armR: 1 } }); const dh = S.buildings.get(dora.home);
  G.S.time = 0.6; for (let r = 0; r < 2; r++) { E.jobTask(k, H); for (let s = 0; s < 6 && k.task; s++) sec(1, [k, dora]); }
  sec(2, [k, dora]); const op = T.dia(tv);
  const t = T.visitTask(dora, H); sec(1, [k, dora]);
  const sat = !!(op && op.data.mesa[dora.id]); const d0 = dh.coin, k0 = kh.coin, shelf0 = op ? D.get('b:3', 'vinho') : 0;
  let held = 0, kept = 0;
  for (let r = 0; r < 6 && op && (op.data.fila.length || (dora.task && dora.task.st === 4)); r++) { if (!k.task || k.task.type !== 'atender') E.jobTask(k, H); for (let s = 0; s < 3; s++) { sec(1, [k, dora]); if (dora.carry) held++; if (k.carry && k.carry.n > 1e-6) kept++; } }
  const drunkLine = lines('bebida').filter(e => String(e[7]) === String(dora.id) || e.includes(dora.id)).length;
  ok('sem-bracos-servida', !!t && sat && op.data.servidos >= 1 && (dora.drinks || 0) >= 1 && !held && !kept && !dora.carry && dh.coin < d0 && kh.coin > k0 && D.get('b:3', 'vinho') < shelf0 && drunkLine >= 1,
    `Dora (força ${D.strength(dora)}) ${t ? 'veio' : 'NÃO veio'}, ${sat ? 'sentou' : 'não sentou'}; servidos ${op ? op.data.servidos : 0}; bebeu ${dora.drinks || 0} rodada(s) pela mão do taverneiro, as mãos dela ${held ? 'SEGURARAM o copo' : 'sem nada'}${kept ? ', o copo FICOU na mão do taverneiro' : ''}; casa dela ${d0} → ${dh.coin}, a do dono ${k0} → ${kh.coin}; vinho na prateleira ${shelf0} → ${D.get('b:3', 'vinho')}; no livro ${drunkLine} «bebida» dela`);
  // the keeper away: she is not served at the counter by herself — she waits, and leaves unserved (the others serve themselves)
  for (let s = 0; s < 80 && dora.task; s++) sec(1, [k, dora]);
  G.S.time = 0.62; const op2 = T.dia(tv); k.task = null; const n0 = op2 ? op2.data.servidos : 0; const r0 = op2 ? op2.data.recusas : 0;
  dora.drinks = 0; const t2 = op2 ? T.visitTask(dora, H) : null; let held2 = 0;
  for (let s = 0; s < 60 && dora.task; s++) { sec(1, [dora]); if (dora.carry) held2++; }
  ok('sem-bracos-balcao', !!t2 && !held2 && op2.data.servidos === n0 && op2.data.recusas === r0 + 1 && !dora.task && !(dora.drinks > 0),
    `o taverneiro fora: Dora ${t2 ? 'sentou' : 'não veio'}, ${op2 && op2.data.servidos === n0 ? 'não se serviu no balcão' : 'SERVIU-SE sozinha'}, ${op2 && op2.data.recusas === r0 + 1 ? 'esperou e saiu sem serviço' : 'recusas ' + (op2 ? op2.data.recusas - r0 : '?')}`);
}
// ---------------- a people without coin: the store gives, nobody pays
{
  const { S, f, tv, person } = world('egipcio', false);
  const k = person('Taverneiro', 0, { job: 3, role: 'taverneiro' }); const v = person('Nefer', 0);
  G.S.time = 0.6; E.jobTask(k, H); for (let s = 0; s < 6 && k.task; s++) sec(1, [k]);
  sec(2, [k]); const op = T.dia(tv);
  const t = T.visitTask(v, H); sec(1, [k, v]); for (let r = 0; r < 4 && op && op.data.fila.length; r++) { if (!k.task || k.task.type !== 'atender') E.jobTask(k, H); sec(3, [k, v]); }
  ok('sem-moeda', !!op && !!t && op.data.servidos >= 1 && op.data.receita === 0 && !lines('taverna').some(e => e[5] === 'moedas'), `aberta ${!!op}, servidos ${op ? op.data.servidos : 0}, receita ${op ? op.data.receita : '-'}`);
  void f; void S;
}
// ---------------- the vat: the beer as a batch of the trades' engine, from the grain on the shelf
{
  const { S, f, tv, person } = world('egipcio', true);
  const k = person('Taverneiro', 6, { job: 3, role: 'taverneiro' });
  D.make('b:3', 'food', 8, { code: 'teste' }); G.S.time = 0.9; // (shut: the keeper's hands for the vat)
  const t = O.task(k, tv, f, H); const op = O.batches(tv)[0];
  ok('cuba-comeca', !!op && op.data.p === 'cerveja', op ? `fornada de ${op.data.p}, etapa ${O.stage(op).id}` : 'nenhuma');
  for (let s = 0; s < 4 && op && O.stage(op) && O.stage(op).kind !== 'espera'; s++) { if (!k.task) O.task(k, tv, f, H); sec(5, [k]); }
  ok('cuba-fermenta', !!op && O.stage(op) && O.stage(op).id === 'fermentar', op ? `etapa ${O.stage(op) ? O.stage(op).id : '(fim)'}, mosto ${op.data.massa}` : '-');
  sec(102, [k]); for (let s = 0; s < 4 && A.live(op); s++) { if (!k.task) O.task(k, tv, f, H); sec(4, [k]); }
  ok('cuba-enche', !A.live(op) && D.get('b:3', 'cerveja') === 3 && D.get('b:3', 'food') === 6, `cerveja na prateleira ${D.get('b:3', 'cerveja')}, comida ${D.get('b:3', 'food')}; fornada ${op.st}`);
  ok('cerveja-fica', !k.carry, 'a cerveja fica na prateleira da taverna (não vai ao armazém)');
  void t; void S;
}
// ---------------- the checker sees a table lie (L-435): an old name at a table written by the hand of the proof, and the
// tavern's look that lets go taken out — within 3 s nothing, after them the S2; with the look back it is let go at once, and a
// new old name is let go before anything is said (the cases' own checker apart: what it says of the tables)
{
  const { tv, person } = world('grego', true);
  person('Taverneiro', 6, { job: 3, role: 'taverneiro' });
  D.make('b:3', 'food', 2, { code: 'teste' }); G.S.time = 0.6; A.update(1); const op = T.dia(tv);
  const liars = []; const look = () => rule((sys, sev, msg) => { if (sys === 'oficio' && /L-435/.test(msg)) liars.push(`S${sev} ${msg}`); }, G.S);
  const quiet = n => { for (let k = 0; k < n; k++) { G.S.clock += 1; G.S.time = (G.S.time + 1 / G.DAY_LEN) % 1; A.update(1); look(); } };
  const tick0 = A.DEFS.taverna.tick; A.DEFS.taverna.tick = () => { };
  const o1 = person('Fora da Mesa', 3); if (op) op.data.mesa[o1.id] = { t: G.S.clock, r: 0, want: 'drink', st: 2 };
  look(); quiet(3); const early = liars.length; quiet(1); const said = liars.slice();
  A.DEFS.taverna.tick = tick0; quiet(1); const gone = !!op && !op.data.mesa[o1.id];
  liars.length = 0; const o2 = person('Outro Fora da Mesa', 3); if (op) op.data.mesa[o2.id] = { t: G.S.clock, r: 0, want: 'drink', st: 2 };
  look(); quiet(6); const let_go = !!op && !op.data.mesa[o2.id];
  ok('verificador-mesa-velha', !!op && !early && said.length === 1 && /à mesa há 4 s/.test(said[0]) && gone && let_go && !liars.length, op ? `sem o olhar da taverna: em 3 s ${early ? `JÁ ACUSOU (${early})` : 'nada'}, aos 4 s ${said.length ? said.join(' | ') : 'NADA'}; com o olhar de volta: ${gone ? 'solto' : 'AINDA À MESA'}, um nome velho de novo ${let_go ? 'solto' : 'AINDA À MESA'}, ${liars.length ? 'ACUSOU: ' + liars[0] : 'nada acusado'}` : 'a taverna não abriu');
}
ok('verificador', !bad.length, bad.slice(0, 4).join(' | ') || 'limpo em todos os segundos');
const err = M.erros(); ok('erros', !Object.keys(err.mod || {}).length && !err.console.length, JSON.stringify(err.mod) + ' ' + err.console.slice(0, 3).join(' | '));
console.log(fails.length ? `TAVERNA-MAO: FALHOU (${fails.join(', ')})` : 'TAVERNA-MAO: ok');
process.exit(fails.length ? 1 : 0);
