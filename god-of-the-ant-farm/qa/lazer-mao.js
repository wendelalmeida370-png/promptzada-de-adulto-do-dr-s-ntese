// lazer-mao: o teatro, a biblioteca e a praça (act-lazer.js; o adendo 4.3) numa vila de mentira montada à mão — só o código do
// jogo (nodemundo M.load), sem gerar mundo: um segundo. O caminhar fica de fora (cada um já está diante de onde vai); o resto é
// o do jogo — as máquinas das tarefas, o G.Depot e o livro-razão, o relógio do mundo (G.Act.update), o verificador dos ofícios.
// Um povo romano de moeda: sem ator, o teatro não abre; com os atores, eles se preparam de portas fechadas (chamados ao palco), as portas abrem na hora,
// quem pode pagar a entrada vem (quem não pode, não vem), paga ao tesouro, senta, a peça começa na hora com ator no palco,
// dura o que dura e acaba nos aplausos (mais devoto, a cidade mais leal), os atores recebem do tesouro, todos saem; o dia sem
// ator no palco: sem peça, e a entrada de volta pelo livro; o espetáculo que atravessa o save com gente nas fileiras; o corpo
// do deus que assiste, e o corpo ator que sobe ao palco; a saída do fim da tarde (G.Teatro.urge: quem pode pagar quer ir, quem
// está nas fileiras fica; o pobre, a criança e quem chega com a peça já longe, não); o palco vazio no meio da peça (ela para
// ali, sem aplauso nem cachê); a biblioteca — a leitura que soma à pesquisa do povo, até o teto do
// dia, o povo sem escrita que não lê, o copista na mesa do escriba —; e o corpo que fala ao povo na praça, uma vez por dia.
//   node qa/lazer-mao.js
const M = require('./nodemundo.js'); const G = M.load({ qa: true, extra: ['qa/oficio-inv.js'] });
const D = G.Depot, A = G.Act, Tt = G.Teatro, Bi = G.Biblioteca, E = G.Eco;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | lazer-mao ${name} | ${info}`); if (!c) fails.push(name); };
// (the walk, stubbed: a walk is a step to where it goes — the door is the front of the building, the way always open)
G.W.reaches = () => true; G.W.walkable = () => true; G.W.walkableXY = () => true; G.Vg.planDoor = null;
G.Vg.door = b => [b.x + b.w - 0.5, b.y + b.h + 0.05]; G.Village.frontTile = b => [b.x + b.w - 0.5, b.y + b.h - 0.5];
G.Vg.gotoB = (v, b) => { v._go = G.Village.frontTile(b); return true; };
G.FX = new Proxy({}, { get: () => () => undefined }); G.Talk = new Proxy({}, { get: () => () => undefined });
const H = { setTask: (v, t) => { t.age = 0; if (t.st === undefined) t.st = 0; v.task = t; v.actT = 0; return t; }, end: v => G.Vg.endTask(v), move: v => { if (v._go) { v.x = v._go[0]; v.y = v._go[1]; v._go = null; } return true; }, goto: (v, x, y) => { v._go = [x, y]; return true; } };
G.Vg.H = H;
// (Vg.give, as the world's own: the task, through setTask)
G.Vg.give = (v, t) => { if (v.task && (v.task.pri || 0) >= 2) return false; H.setTask(v, t); return true; };
function world(civ, coinOn, writing) {
  const f = { id: 1, name: 'Povo de teste', alive: true, civ, stock: { food: 200, wood: 30, moedas: 40 }, tech: { known: Object.assign(coinOn ? { moeda: 1 } : {}, writing ? { escrita: 1 } : {}), cur: 'filosofia', pts: 0 }, rel: {}, eco: null };
  const set = { id: 2, name: 'Vila', fac: 1, cx: 10, cy: 10, tier: 3, loyalty: 60 };
  const B = (id, type, x, y) => ({ id, type, x, y, w: 2, h: 2, built: true, progress: 1, set: 2, inv: {}, need: { wood: 0, stone: 0 }, incoming: {}, hp: 240, maxHp: 240, ip: null, style: civ });
  const S = G.S = { day: 3, clock: 600, time: 0.4, nextId: 100, rng: 4242, buildings: new Map([[3, B(3, 'teatro', 8, 8)], [4, B(4, 'biblioteca', 12, 8)], [5, B(5, 'praca', 4, 8)], [6, B(6, 'storehouse', 4, 4)]]), villagers: new Map(), factions: new Map([[1, f]]), settlements: new Map([[2, set]]), ships: [], acts: [], ledger: [], ledgerN: 0, loose: [], weather: { rain: 0, storm: 0, drought: 0 }, stats: { foodProduced: 0, woodProduced: 0, stoneProduced: 0 }, history: [], dead: new Map(), milestones: {} };
  let id = 10;
  const person = (name, coins, o) => {
    const h = { id: id++, type: 'house', x: 14, y: 12, w: 1, h: 1, built: true, progress: 1, set: 2, inv: {}, coin: coins, pantry: 10, res: 1, need: { wood: 0, stone: 0 }, incoming: {}, hp: 110, maxHp: 110, ip: null };
    S.buildings.set(h.id, h);
    const v = Object.assign({ id: id++, name, set: 2, age: 30, hp: 100, carry: null, purse: 0, home: h.id, job: 0, role: 'coletor', traits: [], x: 9.5, y: 10.3, st: {}, diary: [], hunger: 20, energy: 60, mourn: 0, sick: 0, devotion: 20, task: null, actT: 0, inside: 0 }, o || {});
    S.villagers.set(v.id, v); return v;
  };
  for (const h of G.worldHooks) h();
  E.ensure(f);
  return { S, f, set, te: S.buildings.get(3), bi: S.buildings.get(4), pr: S.buildings.get(5), person };
}
G.inSim++;
const rule = QA.more[QA.more.length - 1]; const bad = [];
const sec = (n, people) => { for (let k = 0; k < n; k++) { G.S.clock += 1; G.S.time = (G.S.time + 1 / G.DAY_LEN) % 1; for (const v of people) { if (!v.task) continue; v.task.age += 1; v.actT += 1; G.Eco.run(v, v.task, 1, H); } A.update(1); rule((sys, sev, msg) => { if (sys === 'oficio') bad.push(`S${sev} ${msg}`); }, G.S); } };
const lines = (code, op) => G.S.ledger.filter(e => e[8] === code && (!op || e[7] === op));
const r2 = x => Math.round(x * 100) / 100;
const sum = L => r2(L.reduce((n, e) => n + e[6], 0));
// ---------------- a show in a people of coin
{
  const { S, f, set, te, person } = world('romano', true, true);
  G.S.time = Tt.horas(te).prep + 0.005; sec(2, []);
  ok('sem-ator-nao-abre', !Tt.dia(te), `sem atores às ${G.S.time.toFixed(2)}: ${Tt.dia(te) ? 'abriu' : 'não abriu'}`);
  const a1 = person('Ator Um', 1, { job: 3, role: 'ator' }), a2 = person('Atriz Dois', 1, { job: 3, role: 'ator', g: 'f' });
  sec(1, [a1, a2]); const op = Tt.dia(te);
  ok('abre-com-ator', !!op && op.data.fase === 'preparo' && !Tt.aberto(te), op ? `o espetáculo #${op.id}: ${op.data.fase === 'preparo' ? 'os atores se preparam' : 'fase ' + op.data.fase}, as portas ${Tt.aberto(te) ? 'ABERTAS' : 'fechadas'}` : 'não abriu');
  sec(3, [a1, a2]);
  ok('atores-ao-palco', op && Object.keys(op.data.atores).length === 2 && a1.task && a1.task.type === 'atuar' && a1.inside === te.id, `no palco: ${op ? Object.keys(op.data.atores).length : 0}; ${a1.name}: ${a1.task ? a1.task.type : '-'}`);
  // (the doors still shut while they make ready: nobody of the public comes in; at the hour, they open)
  const early = person('Cedo', 3); const te0 = Tt.visit(early, te, H);
  while (G.S.time < Tt.horas(te).abre) sec(1, [a1, a2]);
  sec(1, [a1, a2]);
  ok('portas-na-hora', !te0 && op.data.fase === 'portas' && Tt.aberto(te), `antes das ${Tt.horas(te).abre}: ${te0 ? 'ALGUÉM ENTROU' : 'ninguém entra'}; às ${G.S.time.toFixed(3)}: fase ${op.data.fase}, as portas ${Tt.aberto(te) ? 'abertas' : 'FECHADAS'}`);
  const c = [person('Ana', 3), person('Bia', 3), person('Caio', 3)]; const poor = person('Pobre', 0.05);
  const t0 = f.stock.moedas; const tasks = c.map(v => Tt.visit(v, te, H)); const tp = Tt.visit(poor, te, H);
  sec(2, [a1, a2, ...c]);
  ok('plateia-paga', tasks.every(Boolean) && !tp && Object.keys(op.data.plateia).length === 3 && r2(f.stock.moedas - t0) === r2(3 * Tt.FEE) && sum(lines('teatro', op.id)) === r2(3 * Tt.FEE) && op.data.receita === r2(3 * Tt.FEE), `3 na plateia, o pobre ${tp ? 'veio' : 'não veio'}; tesouro +${r2(f.stock.moedas - t0)}; caixa ${op.data.receita}`);
  while (G.S.time < Tt.horas(te).peca) sec(1, [a1, a2, ...c]);
  sec(1, [a1, a2, ...c]);
  ok('peca-comeca', op.data.fase === 'peca' && Object.values(op.data.plateia).every(m => m.st === 2), `fase ${op.data.fase} às ${G.S.time.toFixed(3)}`);
  const dev0 = c.map(v => v.devotion); const loy0 = set.loyalty; const h1 = S.buildings.get(a1.home).coin;
  sec(Tt.PLAY + 1, [a1, a2, ...c]);
  ok('aplausos', op.data.fase === 'fim' && op.data.vistos === 3 && c.every((v, i) => r2(v.devotion - dev0[i]) === 0.5) && set.loyalty > loy0 && c.every(v => (v.diary || []).some(e => /espetáculo/.test(e.txt))), `vistos ${op.data.vistos}; devoção +${r2(c[0].devotion - dev0[0])}; lealdade ${loy0} → ${r2(set.loyalty)}`);
  ok('atores-recebem', r2(S.buildings.get(a1.home).coin - h1) === Tt.WAGE && op.data.pagos === r2(2 * Tt.WAGE) && sum(lines('salario', op.id)) === r2(2 * Tt.WAGE), `cachê de ${a1.name} +${r2(S.buildings.get(a1.home).coin - h1)}; pagos ${op.data.pagos}`);
  sec(5, [a1, a2, ...c]);
  ok('fecha', !A.live(op) && op.st === 'ok' && [a1, a2, ...c].every(v => !v.task || (v.task.type !== 'teatro' && v.task.type !== 'atuar')), `o espetáculo ${op.st} (${op.end ? op.end.why : ''})`);
  // ---- the next day: the actors kept away (a feast): no one on the stage — no play, the entries back
  G.S.day++; G.S.time = Tt.horas(te).abre - 0.01; for (const v of [a1, a2]) H.setTask(v, { type: 'fest', pri: 3.2 });
  sec(4, []); const op2 = Tt.dia(te);
  const c2 = [person('Dora', 3), person('Eli', 3)]; for (const v of c2) Tt.visit(v, te, H); sec(2, c2);
  const paid2 = op2 ? op2.data.receita : 0;
  while (G.S.time < Tt.horas(te).peca + Tt.WAITS + 0.01) sec(1, c2);
  ok('sem-ator-devolve', !!op2 && paid2 === r2(2 * Tt.FEE) && !A.live(op2) && op2.st === 'int' && op2.data.voltas === 2 && op2.data.receita === 0 && sum(lines('teatro-volta', op2.id)) === r2(2 * Tt.FEE), op2 ? `pagaram ${paid2}; o espetáculo ${op2.st} (${op2.end ? op2.end.why : ''}); voltas ${op2.data.voltas}, caixa ${op2.data.receita}` : 'não abriu');
  for (const v of [a1, a2]) G.Vg.endTask(v);
  // ---- a third day: the show across a save, with people in the rows
  G.S.day++; G.S.time = Tt.horas(te).abre - 0.01; sec(2, [a1, a2]); const op3 = Tt.dia(te); sec(3, [a1, a2]);
  const c3 = [person('Fábio', 3), person('Gaia', 3)]; for (const v of c3) Tt.visit(v, te, H); sec(2, [a1, a2, ...c3]);
  for (const v of S.villagers.values()) v.task = null;
  const hook = G.saveHooks.find(h => /espetaculo/.test(String(h.load)) && /plateia/.test(String(h.load))); hook.load({});
  ok('save-devolve-a-plateia', !!op3 && c3.every(v => v.task && v.task.type === 'teatro' && v.task.op === op3.id && v.inside === te.id) && [a1, a2].every(v => v.task && v.task.type === 'atuar'), `depois do gancho: na plateia ${c3.filter(v => v.task && v.task.type === 'teatro').length} de 2, no palco ${[a1, a2].filter(v => v.task && v.task.type === 'atuar').length} de 2`);
  // ---- the god's body: in the audience; and the body that is an actor, on the stage
  const me = person('Corpo', 3); S.avatar = { id: me.id, deeds: {} }; const at = G.Vg.door(te); me.x = at[0]; me.y = at[1];
  const offer = (v, act) => A.offers(v, v.x, v.y, 2.5).find(o => o.def === 'espetaculo' && o.act === act);
  const r1 = offer(me, 'assistir') ? A.perform(me, offer(me, 'assistir')) : { ok: false, why: 'sem oferta' };
  const seat = !!op3.data.plateia[me.id];
  const r3 = offer(me, 'sair') ? A.perform(me, offer(me, 'sair')) : { ok: false, why: 'sem oferta' };
  S.avatar = { id: a1.id, deeds: {} }; a1.task = null; a1.x = at[0]; a1.y = at[1]; delete op3.data.atores[a1.id];
  const ra = offer(a1, 'atuar') ? A.perform(a1, offer(a1, 'atuar')) : { ok: false, why: 'sem oferta' };
  ok('corpo', r1.ok && seat && r3.ok && !op3.data.plateia[me.id] && ra.ok && !!op3.data.atores[a1.id], `assistir ${r1.ok ? r1.msg : r1.why} · sair ${r3.ok ? r3.msg : r3.why} · atuar ${ra.ok ? ra.msg : ra.why}`);
  S.avatar = null; a1.task = null; delete op3.data.atores[a1.id]; sec(1, [a1, a2, ...c3]);
  // ---- the evening out (the choice of decide): the doors open, who can pay wants to go; one in the rows stays; the poor, a
  // child, nobody once the play is gone too far
  const hugo = person('Hugo', 3), pobre = person('Sem Moeda', 0.05), kid = person('Menino', 3, { age: 10 });
  const u1 = Tt.urge(hugo, null), tg = Tt.go(hugo, H), u2 = Tt.urge(hugo, hugo.task);
  ok('saida-da-tarde', u1 > 0 && !!tg && tg.type === 'teatro' && u2 === 1 && Tt.urge(pobre, null) === 0 && Tt.urge(kid, null) === 0, `às ${G.S.time.toFixed(3)}: Hugo quer ${r2(u1)} e vai (${tg ? tg.type : '-'}), na fila ${u2}; o pobre ${Tt.urge(pobre, null)}, a criança ${Tt.urge(kid, null)}`);
  const all3 = [a1, a2, ...c3, hugo];
  while (G.S.time < Tt.horas(te).peca + (Tt.LATE + 1) / G.DAY_LEN) sec(1, all3);
  const tarde = person('Atrasado', 3);
  ok('tarde-demais', op3.data.fase === 'peca' && Tt.urge(tarde, null) === 0 && !Tt.go(tarde, H), `fase ${op3.data.fase} às ${G.S.time.toFixed(3)}: quem chega agora ${Tt.urge(tarde, null)}`);
  // ---- the stage empty in the middle of the play: no end, no applause — it stopped there
  for (const v of [a1, a2]) G.Vg.endTask(v);
  sec(Tt.STOP + 2, all3);
  ok('palco-vazio', !A.live(op3) && op3.st === 'int' && /parou/.test(op3.end.why) && op3.data.vistos === 0 && !op3.data.pagos, `o espetáculo ${op3.st} (${op3.end ? op3.end.why : ''}); vistos ${op3.data.vistos}, cachês ${op3.data.pagos}`);
}
// ---------------- the library: reading, the day's ceiling, a people without writing, the copyist
{
  const { S, f, bi, person } = world('grego', true, true);
  G.S.time = 0.4; const r0 = f.tech.pts;
  const v = person('Leitor', 1); const t = Bi.visit(v, bi, H); sec(40, [v]);
  ok('ler', !!t && r2(f.tech.pts - r0) === Bi.READ && Bi.book(bi).lidos === 1 && (v.diary || []).some(e => /rolo/.test(e.txt)) && !v.task, `leitura: a pesquisa +${r2(f.tech.pts - r0)}; lidos ${Bi.book(bi).lidos}`);
  // (in batches the tables hold, each in the library's hours)
  const rs = []; for (let i = 0; i < Bi.MAX + 2; i++) { G.S.time = Math.min(G.S.time, 0.4); const p = person('L' + i, 1); Bi.visit(p, bi, H); rs.push(p); if (rs.length >= Bi.CAP - 1) { sec(40, rs); rs.length = 0; G.S.time = 0.4; } }
  sec(40, rs); G.S.time = 0.4;
  ok('teto-do-dia', Bi.book(bi).lidos === Bi.MAX && r2(f.tech.pts - r0) === r2(Bi.MAX * Bi.READ), `${Bi.MAX + 3} leituras: contadas ${Bi.book(bi).lidos}, a pesquisa +${r2(f.tech.pts - r0)}`);
  const cp = person('Copista', 1, { job: 4, role: 'copista' }); const p0 = f.tech.pts;
  E.jobTask(cp, H); const tc = cp.task && cp.task.type; sec(40, [cp]);
  ok('copista', tc === 'copiar' && r2(f.tech.pts - p0) === Bi.COPY && Bi.book(bi).copias === 1, `tarefa ${tc}; a pesquisa +${r2(f.tech.pts - p0)}`);
  G.S.time = 0.8; const late = person('Tarde', 1); ok('fechada-a-noite', !Bi.visit(late, bi, H), 'às 0,8: ninguém começa a ler');
  void S;
}
{
  const { bi, person } = world('nordico', false, false);
  G.S.time = 0.4; const v = person('Sigrid', 0); ok('sem-escrita', !Bi.visit(v, bi, H), 'um povo sem a escrita: ninguém lê');
}
// ---------------- the plaza: the body speaks to the people, once a day
{
  const { S, set, pr, person } = world('grego', true, true);
  const [cx, cy] = G.Village.center(pr); const ears = []; for (let i = 0; i < 5; i++) ears.push(person('Ouvinte' + i, 1, { x: cx + i * 0.5, y: cy }));
  const me = person('Orador', 1, { x: cx, y: cy + 2 }); S.avatar = { id: me.id, deeds: {} }; const at = G.Vg.door(pr); me.x = at[0]; me.y = at[1];
  const offer = act => A.offers(me, me.x, me.y, 2.5).find(o => o.def === 'leitura' && o.act === act);
  const loy0 = set.loyalty; const r1 = offer('falar') ? A.perform(me, offer('falar')) : { ok: false, why: 'sem oferta' };
  const again = offer('falar');
  ok('falar-ao-povo', r1.ok && r1.n === 5 && set.loyalty > loy0 && again && again.ok === false, `${r1.ok ? r1.msg : r1.why}; lealdade ${loy0} → ${r2(set.loyalty)}; de novo: ${again ? again.why : '-'}`);
  S.avatar = null; void ears;
}
ok('verificador', !bad.length, bad.length ? bad.slice(0, 3).join(' | ') : 'limpo em todos os segundos');
const err = M.erros(); ok('erros', !Object.keys(err.mod || {}).length && !err.console.length, JSON.stringify(err.mod) + ' ' + err.console.slice(0, 3).join(' | '));
console.log(fails.length ? `LAZER-MAO: FALHOU (${fails.join(', ')})` : 'LAZER-MAO: ok');
process.exit(fails.length ? 1 : 0);
