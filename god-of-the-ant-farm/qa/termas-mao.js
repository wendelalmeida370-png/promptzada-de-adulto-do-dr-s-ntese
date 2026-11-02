// termas-mao: o dia dos banhos numa vila de mentira, montada à mão — só o código do jogo (nodemundo M.load), sem gerar mundo:
// um segundo. O caminhar fica de fora (cada um já está diante de onde vai: os passos de verdade são os do qa/termas.js); o resto
// é o do jogo — as máquinas das tarefas, o G.Depot e o livro-razão, o relógio do mundo (G.Act.update). Um povo romano de moeda:
// os banhos abrem na hora (sem foguista, com a água fria), o foguista busca lenha no armazém do povo (só o que sobra além da
// reserva) e alimenta a fornalha (a água esquenta), quem pode pagar a entrada vem pela vontade dele (quem não pode, não vem),
// paga ao tesouro, tira a roupa, entra na água, banha-se, veste-se e sai; o banho quente tira mais da doença que o frio; a casa
// cheia; o fechamento na hora, com todos para fora e o fogo apagado; o caixa do dia contra o livro; o dia que atravessa o save
// com gente na água; a espera nos cabides por um lugar na água (o repartidor dos interiores), com a entrada de volta quando
// ele não vaga; um povo sem moeda (ninguém paga); o corpo do deus que entra, se banha e sai pelas ofertas; e a oferenda do
// templo, da despensa da casa à prateleira do templo, com o sacerdote que come dela na manhã seguinte; e os serviços públicos
// pelo corpo: cobrar o imposto de uma casa e entregar o saco ao tesouro, cunhar moedas, escrever os registros, treinar.
//   node qa/termas-mao.js
const M = require('./nodemundo.js'); const G = M.load({ qa: true, extra: ['qa/oficio-inv.js'] });
const D = G.Depot, A = G.Act, Te = G.Termas, E = G.Eco;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | termas-mao ${name} | ${info}`); if (!c) fails.push(name); };
// (the walk, stubbed: a walk is a step to where it goes — the door is the front of the building, the way always open)
G.W.reaches = () => true; G.W.walkable = () => true; G.W.walkableXY = () => true; G.Vg.planDoor = null;
G.Vg.door = b => [b.x + b.w - 0.5, b.y + b.h + 0.05]; G.Village.frontTile = b => [b.x + b.w - 0.5, b.y + b.h - 0.5];
G.Vg.gotoB = (v, b) => { v._go = G.Village.frontTile(b); return true; };
// (what is only seen — the particles, the bubbles — wants the map: nothing of it here)
G.FX = new Proxy({}, { get: () => () => undefined }); G.Talk = new Proxy({}, { get: () => () => undefined });
const H = { setTask: (v, t) => { t.age = 0; if (t.st === undefined) t.st = 0; v.task = t; v.actT = 0; return t; }, end: v => G.Vg.endTask(v), move: v => { if (v._go) { v.x = v._go[0]; v.y = v._go[1]; v._go = null; } return true; }, goto: (v, x, y) => { v._go = [x, y]; return true; } };
G.Vg.H = H;
function world(civ, coinOn, wood) {
  const f = { id: 1, name: 'Povo de teste', alive: true, civ, stock: { food: 120, wood: wood === undefined ? 30 : wood, moedas: 40 }, tech: { known: coinOn ? { moeda: 1 } : {} }, rel: {} };
  const set = { id: 2, name: 'Vila', fac: 1, cx: 10, cy: 10, tier: 3 };
  const ba = { id: 3, type: 'banhos', x: 8, y: 8, w: 2, h: 2, built: true, progress: 1, set: 2, inv: {}, need: { wood: 0, stone: 0 }, incoming: {}, hp: 240, maxHp: 240, ip: null, style: civ };
  const store = { id: 4, type: 'storehouse', x: 12, y: 8, w: 2, h: 2, built: true, progress: 1, set: 2, inv: {}, need: { wood: 0, stone: 0 }, incoming: {}, hp: 140, maxHp: 140, ip: null };
  const tp = { id: 5, type: 'temple', x: 4, y: 8, w: 2, h: 2, built: true, progress: 1, set: 2, inv: {}, need: { wood: 0, stone: 0 }, incoming: {}, hp: 200, maxHp: 200, ip: null };
  const S = G.S = { day: 3, clock: 600, time: 0.2, nextId: 100, rng: 4242, buildings: new Map([[3, ba], [4, store], [5, tp]]), villagers: new Map(), factions: new Map([[1, f]]), settlements: new Map([[2, set]]), ships: [], acts: [], ledger: [], ledgerN: 0, loose: [], weather: { rain: 0, storm: 0, drought: 0 }, stats: { foodProduced: 0, woodProduced: 0, stoneProduced: 0 }, history: [], dead: new Map(), milestones: {} };
  let id = 10;
  const person = (name, coins, o) => {
    const h = { id: id++, type: 'house', x: 14, y: 12, w: 1, h: 1, built: true, progress: 1, set: 2, inv: {}, coin: coins, pantry: 10, res: 1, need: { wood: 0, stone: 0 }, incoming: {}, hp: 110, maxHp: 110, ip: null };
    S.buildings.set(h.id, h);
    const v = Object.assign({ id: id++, name, set: 2, age: 30, hp: 100, carry: null, purse: 0, home: h.id, job: 0, role: 'coletor', traits: [], x: 9.5, y: 10.3, st: {}, diary: [], hunger: 20, energy: 50, mourn: 0, sick: 0, task: null, actT: 0, inside: 0 }, o || {});
    S.villagers.set(v.id, v); return v;
  };
  for (const h of G.worldHooks) h();
  E.ensure(f);
  return { S, f, set, ba, tp, person };
}
G.inSim++;
// (the trades' and the services' rules of the checker, alone — the rest of QA.check wants a whole world — every second)
const rule = QA.oficio; const bad = []; // (the trades' rule by its name: oficio-inv.js has more than one)
const sec = (n, people) => { for (let k = 0; k < n; k++) { G.S.clock += 1; G.S.time = (G.S.time + 1 / G.DAY_LEN) % 1; for (const v of people) { if (!v.task) continue; v.task.age += 1; v.actT += 1; G.Eco.run(v, v.task, 1, H); } A.update(1); rule((sys, sev, msg) => { if (sys === 'oficio') bad.push(`S${sev} ${msg}`); }, G.S); } };
const lines = code => G.S.ledger.filter(e => e[8] === code);
const r2 = x => Math.round(x * 100) / 100;
// ---------------- a day in a people of coin
{
  const { S, f, ba, person } = world('romano', true);
  const k = person('Foguista', 2, { job: 3, role: 'foguista' });
  const c = [person('Ana', 3), person('Bia', 3, { sick: 60 }), person('Caio', 3)]; const poor = person('Pobre', 0.05);
  const all = [k, ...c, poor];
  G.S.time = 0.2; sec(2, all); ok('fechada-antes', !Te.dia(ba), `S.time ${G.S.time.toFixed(2)}: ${Te.dia(ba) ? 'abertos' : 'fechados'}`);
  G.S.time = 0.26; sec(1, all); const op = Te.dia(ba);
  ok('abre-fria', !!op && op.st === 'on' && op.data.calor === 0, op ? `o dia #${op.id} aberto, a água ${op.data.calor > 0 ? 'quente' : 'fria'}` : 'não abriu');
  // the stoker: wood from the store (beyond what it keeps for its works), into the baths, into the furnace
  const w0 = f.stock.wood;
  E.jobTask(k, H); const t1 = k.task && k.task.type; for (let s = 0; s < 6 && k.task; s++) sec(1, [k]);
  ok('foguista-busca-lenha', t1 === 'lenhaTermas' && D.get('b:3', 'wood') === 3 && f.stock.wood === w0 - 3, `tarefa ${t1}; lenha junto à fornalha ${D.get('b:3', 'wood')}; armazém ${w0} → ${f.stock.wood}`);
  E.jobTask(k, H); const t2 = k.task && k.task.type; for (let s = 0; s < 8 && k.task; s++) sec(1, [k]);
  ok('a-agua-esquenta', t2 === 'fornalha' && op.data.lenha === 2 && op.data.calor > 80 && D.get('b:3', 'wood') === 1, `tarefa ${t2}; ${op.data.lenha} achas queimando, ${op.data.calor} s de fogo; sobra ${D.get('b:3', 'wood')}`);
  ok('livro-da-lenha', lines('fornalha').length === 2 && lines('termas').some(e => e[5] === 'wood' && e[3] === 'f:1'), `${lines('fornalha').length} linhas 'fornalha', ${lines('termas').filter(e => e[5] === 'wood').length} de lenha do armazém`);
  // the bathers: by their own wish (here, asked), those who can pay
  const tasks = c.map(v => Te.visit(v, ba, H)); const tp = Te.visit(poor, ba, H);
  ok('quem-pode-vem', tasks.every(t => t && t.type === 'termas') && !tp, `${tasks.filter(Boolean).length} a caminho; quem não pode pagar: ${tp ? 'veio' : 'não veio'}`);
  const homes0 = c.map(v => S.buildings.get(v.home).coin), t0 = f.stock.moedas;
  sec(1, all);
  ok('entram-e-pagam', c.every(v => op.data.banho[v.id] && v.inside === ba.id) && r2(f.stock.moedas - t0) === r2(Te.FEE * 3) && c.every((v, i) => r2(homes0[i] - S.buildings.get(v.home).coin) === Te.FEE), `lá dentro ${Object.keys(op.data.banho).length}; tesouro +${r2(f.stock.moedas - t0)}; casas ${c.map((v, i) => `${homes0[i]} → ${S.buildings.get(v.home).coin}`).join(', ')}`);
  sec(3, all);
  ok('na-agua', c.every(v => v.task && v.task.st === 2 && v.task.use === 'banhar'), c.map(v => `${v.name} st ${v.task ? v.task.st : '-'} ${v.task ? v.task.use : ''}`).join(', '));
  const e0 = c.map(v => v.energy);
  sec(36, all);
  ok('banho-quente', c[1].sick <= 40 + 1 && c[1].sick < 60 && op.data.quentes >= 3 && c.every((v, i) => v.energy > e0[i]), `doença de Bia 60 → ${r2(c[1].sick)}; quentes ${op.data.quentes}, frios ${op.data.frios}; energia ${e0.join('/')} → ${c.map(v => r2(v.energy)).join('/')}`);
  sec(4, all);
  ok('saem', c.every(v => !v.task && !v.inside) && !Object.keys(op.data.banho).length, `tarefas ${c.map(v => v.task ? v.task.type : '-').join(',')}; dentro ${c.filter(v => v.inside).length}`);
  const paid = lines('termas').filter(e => e[5] === 'moedas').reduce((n, e) => n + e[6], 0);
  ok('caixa-e-livro', Math.abs(paid - op.data.receita) < 0.01 && op.data.entradas === 3, `caixa ${op.data.receita}, entradas no livro ${r2(paid)}; ${op.data.entradas} banhos`);
  // the closing hour: everyone out, the fire out
  for (const v of c) Te.visit(v, ba, H); sec(1, all); const before = Object.keys(op.data.banho).length;
  G.S.time = 0.7; sec(2, all);
  ok('fecha-na-hora', before === 3 && !A.live(op) && op.data.calor === 0 && c.every(v => !v.inside && (!v.task || v.task.type !== 'termas')), `${before} lá dentro antes de fechar; depois: dia ${op.st}, fogo ${op.data.calor}, ${c.filter(v => v.inside).length} dentro`);
  ok('nao-reabre', (() => { G.S.time = 0.5; sec(1, all); return !Te.dia(ba); })(), 'o dia acabado não abre de novo no mesmo dia');
}
// ---------------- no wood to spare: the water stays cold, the bath is worth less; a full house; the day across a save
{
  const { S, ba, person } = world('romano', true, 8);
  const k = person('Foguista', 2, { job: 3, role: 'foguista' });
  G.S.time = 0.3; sec(1, [k]); const op = Te.dia(ba);
  E.jobTask(k, H); const t1 = k.task ? k.task.type : null;
  const v = person('Doente', 3, { sick: 60 }); Te.visit(v, ba, H); sec(40, [k, v]);
  ok('fria-sem-lenha', op.data.calor === 0 && op.data.frios === 1 && v.sick > 40 && v.sick < 60, `o foguista: ${t1 || 'nada a fazer'} (o armazém só tem a reserva); fogo ${op.data.calor}; frios ${op.data.frios}; doença 60 → ${r2(v.sick)}`);
  const crowd = []; for (let i = 0; i < Te.CAP; i++) { const p = person('B' + i, 3); Te.visit(p, ba, H); crowd.push(p); }
  sec(1, crowd);
  const late = person('Atrasado', 3); const tl = Te.visit(late, ba, H);
  ok('cheia', Object.keys(op.data.banho).length === Te.CAP && !tl, `${Object.keys(op.data.banho).length} lá dentro de ${Te.CAP}; mais um: ${tl ? 'veio' : 'não veio'}`);
  sec(3, crowd); const inWater = crowd.filter(p => p.task && p.task.st === 2).length;
  for (const p of S.villagers.values()) p.task = null;
  const hook = G.saveHooks.find(h => /termas/.test(String(h.load)) && /banho/.test(String(h.load))); hook.load({});
  ok('save-devolve-a-agua', inWater === Te.CAP && crowd.every(p => p.task && p.task.type === 'termas' && p.task.op === op.id && p.task.st === 2 && p.task.use === 'banhar' && p.inside === ba.id), `${inWater} na água antes; depois do gancho: ${crowd.filter(p => p.task && p.task.st === 2).length} de volta na água`);
}
// ---------------- a place in the water, by the interiors' allotter (In.freePlace, P4: each one inside holds the place of
// their use — who is at the pegs holds a peg, not a place in the water): two come in for one place; the second, undressed,
// waits at the pegs; half a minute with none, dressed again, the entry back (in the ledger) and out; with a place, in
{
  const { S, f, ba, person } = world('romano', true);
  const In = G.Interiors; const t0 = In.table, f0 = In.freePlace; let room = 1;
  const inW = () => { const op = Te.dia(ba); return op ? Object.values(op.data.banho).filter(m => m.st === 2).length : 0; };
  In.table = () => ({}); In.freePlace = (b, use) => (use === 'banhar' ? (inW() < room ? {} : null) : {});
  G.S.time = 0.3; A.update(1); const op = Te.dia(ba);
  const a = person('Ana', 3), c = person('Caio', 3); const hc = S.buildings.get(c.home);
  const ta = Te.visit(a, ba, H), tc = Te.visit(c, ba, H); sec(3, [a, c]);
  if (op.data.banho[a.id]) op.data.banho[a.id].dur = 200; // (Ana stays in the water)
  const waiting = !!(c.task && c.task.type === 'termas' && c.task.st === 1 && op.data.banho[c.id]);
  const coin1 = hc.coin; sec(Te.WAIT + 2, [a, c]);
  const back = lines('termas-volta').filter(e => e[9] === c.id);
  ok('espera-nos-cabides', !!ta && !!tc && inW() === 1 && waiting && !op.data.banho[c.id] && !(c.task && c.task.type === 'termas') && r2(hc.coin - coin1) === Te.FEE && back.length === 1 && op.data.voltas === 1 && r2(op.data.receita) === Te.FEE && !bad.length, `um lugar na água: Ana nela, Caio ${waiting ? 'esperando nos cabides' : 'não esperou'}; depois de ${Te.WAIT} s: ${op.data.banho[c.id] ? 'ainda lá' : 'foi embora'}, a entrada de volta ${r2(hc.coin - coin1)} (${back.length} linha 'termas-volta'), caixa ${op.data.receita}, voltas ${op.data.voltas}; ${bad.slice(0, 2).join(' | ') || 'verificador limpo'}`);
  room = 2; const b2 = person('Bia', 3); Te.visit(b2, ba, H); sec(4, [a, b2]);
  ok('lugar-vago-entra', inW() === 2 && b2.task && b2.task.st === 2, `dois lugares: ${inW()} na água, Bia ${b2.task && b2.task.st === 2 ? 'na água' : 'fora dela'}`);
  In.table = t0; In.freePlace = f0; void f;
}
// ---------------- a people without coin: nobody pays
{
  const { S, f, ba, person } = world('nordico', false);
  G.S.time = 0.3; A.update(1); const op = Te.dia(ba);
  const v = person('Sigrid', 0); const t = Te.visit(v, ba, H); sec(40, [v]);
  ok('sem-moeda', !!op && !!t && op.data.entradas === 1 && op.data.receita === 0 && !lines('termas').some(e => e[5] === 'moedas'), `abertos ${!!op}, entradas ${op ? op.data.entradas : 0}, receita ${op ? op.data.receita : '-'}`);
  void f; void S;
}
// ---------------- the god's body at the baths: in, the bath, out — by the offers
{
  const { S, f, ba, person } = world('romano', true);
  const k = person('Foguista', 2, { job: 3, role: 'foguista' }); D.make('b:3', 'wood', 2, { code: 'teste' });
  G.S.time = 0.3; A.update(1); const op = Te.dia(ba);
  const me = person('Corpo', 3); S.avatar = { id: me.id, deeds: {} }; const at = G.Vg.door(ba); me.x = at[0]; me.y = at[1];
  const offer = act => A.offers(me, me.x, me.y, 2.5).find(o => o.def === 'termas' && o.act === act);
  const t0 = f.stock.moedas; const r1 = offer('entrar') ? A.perform(me, offer('entrar')) : { ok: false, why: 'sem oferta' };
  const kf = A.offers(k, at[0], at[1], 2.5).find(o => o.def === 'termas' && o.act === 'alimentar'); S.avatar = { id: k.id, deeds: {} }; const rf = kf ? A.perform(k, kf) : { ok: false };
  S.avatar = { id: me.id, deeds: {} };
  const r2b = offer('banhar') ? A.perform(me, offer('banhar')) : { ok: false, why: 'sem oferta' }; const m = op.data.banho[me.id];
  const r3 = offer('sair') ? A.perform(me, offer('sair')) : { ok: false, why: 'sem oferta' };
  ok('corpo', r1.ok && rf.ok && r2b.ok && r3.ok && !op.data.banho[me.id] && r2(f.stock.moedas - t0) === Te.FEE && op.data.quentes === 1, `entrar ${r1.ok ? r1.msg : r1.why} · fornalha ${rf.ok ? rf.msg : rf.why} · banho ${r2b.ok ? r2b.msg : r2b.why} (${m ? 'contado' : '-'}) · sair ${r3.ok ? r3.msg : r3.why}`);
  S.avatar = null;
}
// ---------------- the temple's offering, and the priest who eats of it the next morning
{
  const { S, f, tp, person } = world('romano', true);
  const v = person('Devota', 1); const pr = person('Sacerdote', 1, { role: 'sacerdote', hunger: 60 }); const h = S.buildings.get(v.home);
  const p0 = h.pantry; const r = G.Templo.ofertar(v, tp, 'food', 9);
  ok('oferenda', r.ok && h.pantry === p0 - 9 && D.get('b:5', 'food') === 9 && lines('oferenda').length === 1, `${r.ok ? r.n : r.why}; despensa ${p0} → ${h.pantry}; prateleira do templo ${D.get('b:5', 'food')}`);
  const st0 = f.stock.food; S.day++; A.update(1);
  ok('o-sacerdote-come', pr.hunger === 25 && lines('sustento').length === 1 && D.get('b:5', 'food') === 6 && f.stock.food === st0 + 2, `fome do sacerdote 60 → ${pr.hunger}; prateleira ${D.get('b:5', 'food')}; armazém ${st0} → ${f.stock.food}`);
  A.update(1); ok('uma-vez-por-dia', lines('sustento').length === 1, `${lines('sustento').length} refeição(ões) no dia`);
}
// ---------------- the public trades by the god's body: the collector's round and the mint, the scribe, the drill
{
  const { S, f, person } = world('romano', true);
  f.gov = 'reino'; f.stock.ouro = 2;
  const B = (id, type, x, y) => ({ id, type, x, y, w: 1, h: 1, built: true, progress: 1, set: 2, inv: {}, need: { wood: 0, stone: 0 }, incoming: {}, hp: 200, maxHp: 200, ip: null });
  S.buildings.set(6, B(6, 'coletoria', 2, 2)); S.buildings.set(7, B(7, 'administracao', 2, 5)); S.buildings.set(8, B(8, 'quartel', 5, 2));
  const payer = person('Pagante', 10); const ph = S.buildings.get(payer.home);
  const me = person('Coletor', 1, { job: 6, role: 'cobrador' }); S.avatar = { id: me.id, deeds: {} };
  const offer = (x, y, act) => A.offers(me, x, y, 2.5).find(o => o.def === 'publico' && o.act === act);
  const pd = G.Vg.door(ph); const oc = offer(pd[0], pd[1], 'cobrar'); const due = oc ? +((ph.coin * E.taxRate(f)).toFixed(2)) : 0;
  const rc = oc ? A.perform(me, oc) : { ok: false, why: 'sem oferta' };
  const again = offer(pd[0], pd[1], 'cobrar');
  const cd = G.Vg.door(S.buildings.get(6)); const t0 = f.stock.moedas; const oe = offer(cd[0], cd[1], 'entregar'); const re = oe ? A.perform(me, oe) : { ok: false, why: 'sem oferta' };
  ok('corpo-cobra', rc.ok && re.ok && !me.carry && r2(10 - ph.coin) === due && r2(f.stock.moedas - t0) === due && again && again.ok === false && lines('imposto').length === 2, `cobrou ${rc.ok ? rc.msg : rc.why}; de novo: ${again ? again.why : '-'}; entregou ${re.ok ? re.msg : re.why}; tesouro +${r2(f.stock.moedas - t0)}`);
  const m0 = f.stock.moedas; const ou = offer(cd[0], cd[1], 'cunhar'); const rm = ou ? A.perform(me, ou) : { ok: false, why: 'sem oferta' };
  ok('corpo-cunha', rm.ok && f.stock.ouro === 1 && r2(f.stock.moedas - m0) === 6 && lines('cunhagem').length === 2, `${rm.ok ? rm.msg : rm.why}; ouro 2 → ${f.stock.ouro}; moedas +${r2(f.stock.moedas - m0)}`);
  const sc = person('Escriba', 1, { job: 7, role: 'escriba' }); S.avatar = { id: sc.id, deeds: {} };
  const ad = G.Vg.door(S.buildings.get(7)); const ow = A.offers(sc, ad[0], ad[1], 2.5).find(o => o.def === 'publico' && o.act === 'escrever'); const rw = ow ? A.perform(sc, ow) : { ok: false, why: 'sem oferta' };
  const qd = G.Vg.door(S.buildings.get(8)); const otr = A.offers(sc, qd[0], qd[1], 2.5).find(o => o.def === 'publico' && o.act === 'treinar'); const rt = otr ? A.perform(sc, otr) : { ok: false, why: 'sem oferta' };
  // (the deeds of the body are counted by the possession, which Node does not load: the world's part is what is checked here)
  ok('corpo-escreve-e-treina', rw.ok && f._scribes === S.clock && rt.ok && (sc.diary || []).some(e => /Treinei/.test(e.txt)), `escrever: ${rw.ok ? rw.msg : rw.why} (a ordem dos escribas marcada: ${f._scribes === S.clock}); treinar: ${rt.ok ? rt.msg : rt.why}`);
  S.avatar = null;
}
ok('verificador', !bad.length, bad.slice(0, 4).join(' | ') || 'limpo em todos os segundos');
// (and the checker sees a till that lies)
{
  const { ba, person } = world('romano', true); D.make('b:3', 'wood', 1, { code: 'teste' }); G.S.time = 0.3; A.update(1); const op = Te.dia(ba); const v = person('X', 3); Te.visit(v, ba, H); sec(1, [v]); // (a line before the day: the ledger covers it)
  op.data.receita += 1; const seen = []; rule((sys, sev, msg) => { if (sys === 'oficio') seen.push(msg); }, G.S); op.data.receita -= 1;
  ok('verificador-acusa', seen.some(m => /caixa diz/.test(m)), seen[0] || 'não viu');
}
const err = M.erros(); ok('erros', !Object.keys(err.mod || {}).length && !err.console.length, JSON.stringify(err.mod) + ' ' + err.console.slice(0, 3).join(' | '));
console.log(fails.length ? `TERMAS-MAO: FALHOU (${fails.join(', ')})` : 'TERMAS-MAO: ok');
process.exit(fails.length ? 1 : 0);
