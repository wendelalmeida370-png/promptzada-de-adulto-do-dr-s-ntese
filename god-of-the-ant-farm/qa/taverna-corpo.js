// taverna-corpo: o corpo do deus à mesa da taverna (P7 — D-767 a D-769), em Node, pelo qa/nodemundo.js, no mundo pronto (a
// metrópole), à noite, com as tavernas abertas: o pedido de ponta a ponta e os casos ruins.
//  c1 senta pelo verbo «lugar» num assento da taverna (o banquinho, o banco, a cadeira) e o taverneiro vem à mesa: anda até lá, fica
//     de pé ao lado do corpo, diz a palavra da casa, e o cardápio se abre com o que a casa tem agora — as bebidas do povo, os pratos
//     da cozinha pelo que são feitos, o preço da casa ou «não há» —, e as moedas que o corpo sabe que tem
//  c2 o prato pedido de ponta a ponta: pelas mãos do corpo (G.Possess.apply → T.order), o taverneiro volta ao balcão, enche o prato
//     da prateleira para as mãos dele pelo livro, da parte pedida da comida (o arroz, o peixe: 20h), traz o prato na mão (o kit: o
//     prato, nunca uma carga nos braços), entrega à mesa e recebe ali, uma vez; o prato na mesa diante do corpo (atmos.js); os
//     bocados pelas mãos (T.bite): a fome cai pelo que se comeu, da origem da comida, e o prato acaba; os gestos da mesa existem e o
//     corpo sentado os faz sentado
//  c3 a bebida: a caneca na mão do corpo, os goles (três), o efeito da bebida no último, a caneca deixada na mesa
//  c4 o corpo levanta antes de chegar o pedido: o pedido fica (D-800) — o taverneiro o deixa no lugar guardado e chama; senta, paga
//  c5 sem dinheiro: o cardápio diz por quê, e o pedido é recusado; o deus tira da prateleira o que foi pedido: «acabou», e o
//     taverneiro volta à mesa com o cardápio de novo
//  c6 o taverneiro morre no meio do pedido: chamado de novo; ninguém vem — o corpo vai ao balcão e se serve da prateleira, pago
//  c7 um save no meio do pedido: o pedido volta, buscado de novo, servido e pago uma vez só
//  c8 o mundo sem o corpo: nenhuma entrada do corpo nas mesas, e o mesmo mundo dos fregueses — e o verificador limpo em tudo
//  (o pedido que fica e a taverna viva, D-800 a D-810; o c4 é o de antes, agora com o pedido que fica)
//  c9 o corpo sai da taverna com o pedido a caminho: deixado na mesa, quente e depois frio; volta, senta, recebe, paga uma vez
//  c10 fora tempo demais: o taverneiro leva o pedido frio de volta à prateleira, nada pago, nada some
//  c11 um save com o pedido na mesa: volta na mesa, no lugar guardado; senta e paga uma vez
//  c12 a carta só com o que existe: três tavernas de povos e terras diferentes, cada linha pela prateleira e pela origem
//  c13 os fregueses de sempre: a memória da casa no fechamento; o corpo freguês — «o de sempre» pelo nome —, e o de sempre que acabou
//  c14 pagar uma rodada para a mesa: todos servidos, o corpo paga cada caneca, os laços e a fama
//  c15 pedir uma música (a canção do povo do corpo, ou «não sei»), a gorjeta ao músico, e o jogo de ossinhos com a aposta pelo lance
//   node qa/taverna-corpo.js [mundo]          (≈ 5 min; ONLY=c1,c2 para algumas)
const M = require('./nodemundo.js'); const G = M.load({ qa: true, extra: ['js/space.js', 'js/people3d.js', 'js/anim-gait.js', 'js/anim-clips.js', 'js/anim-body.js', 'js/possess.js', 'js/interact.js', 'js/avatar.js', 'js/interacao-clips.js', 'js/cardapio-ui.js', 'qa/oficio-inv.js', 'qa/taverna-vida-inv.js'] });
const D = G.Depot, A = G.Act, T = G.Taverna, In = G.Interiors, Po = G.Possess, I = G.Interact;
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null; const on = k => !ONLY || ONLY.includes(k);
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | taverna-corpo ${name} | ${info}`); if (!c) fails.push(name); };
const world = process.argv[2] || 'metropole';
const clock = () => { const c = process.cpuUsage(); return (c.user + c.system) / 1e6; }; const c0 = clock();
const S = () => G.S; const TL = G.Space.TILE; const RDT = 1 / 30;
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
// (the body's frame — the world in its seconds, the body's controller each frame; fast: the world a tenth of a second a frame)
const frame = () => { G.debug.step(RDT * G.Space.TIME); G.Avatar.frame(RDT); };
const fast = () => { G.debug.step(0.1); G.Avatar.frame(RDT); };
const until = (f, sec) => { const t0 = S().clock; while (!f() && S().clock - t0 < sec) fast(); return f(); };
// (the night of the proof with no feast of a tavern — T1's, D-818: its dish, its round and its bards are the taverna-vida's v12, not the body's
// — T-1884)
const calm = () => { const w = S().weather; w.rain = 0; if (w.storm) w.storm = 0; if (!(S().divinePeace > G.DAY_LEN * 0.5)) god(() => G.Politics.divinePeace()); for (const s of S().settlements.values()) { if (s.alarmT > 0) s.alarmT = 0; } god(() => { G.mod('tf.olha', S().clock + 1e9); for (const b of S().buildings.values()) if (b.type === 'taverna' && b.festa) delete b.festa; }); };
// (the ledger as it is written: [n, day, clock, from, to, good, n, op, code, by])
const seen = []; D.onMove.push(e => { seen.push({ t: e[2], from: e[3], to: e[4], k: e[5], n: e[6], op: e[7], c: e[8], by: e[9] }); });
const bad = []; const watch = () => { for (const q of QA.check().filter(q => q.sev <= 2 && (q.sys === 'taverna' || q.sys === 'oficio' || q.sys === 'int' || q.sys === 'lar'))) { const m = `S${q.sev} ${q.sys}: ${q.msg}`; if (bad.length < 8 && !bad.includes(m)) bad.push(m); } };
const SEATK = { banquinho: 1, banco: 1, cadeira: 1 };

// ---------------- the evening: the taverns open (the day lived as it comes) ----------------
M.pronto(world); calm();
while (S().time < 0.6) { calm(); M.viver(1); }
const taverns = () => [...S().buildings.values()].filter(b => b.type === 'taverna' && b.built && In.has(b) && T.dia(b) && T.aberta(b));
const SNAP = G.Save.serialize();
const fresh = () => { seen.length = 0; if (Po.body()) Po.release('deus'); G.Avatar.detach(); M.reseed(4242); G.Save.apply(JSON.parse(SNAP)); G.Main.mode = 'game'; if (G.UI && G.UI.setSpeed) G.UI.setSpeed(0); calm(); };
// (the body: a grown one of the tavern's people, awake and free, with coin for a few rounds — the keeper never)
function bodyFor(b) {
  const fid = G.Village.facOfSet(b.set); const kp = T.keeperOf(b);
  const L = [...S().villagers.values()].filter(o => o !== kp && o.age >= 18 && o.age < 55 && !o.sleeping && !o.inside && G.Fac.idOfV(o) === fid && Po.can(o).ok && D.get(G.Eco.coinRef(o), 'moedas') >= 2 && D.strength(o) > 0)
    .sort((a, c) => G.dist(a.x, a.y, b.x, b.y) - G.dist(c.x, c.y, b.x, b.y) || a.id - c.id);
  return L[0] || null;
}
// (into the tavern at a free seat by the verb 'lugar' — the step to where one gets onto it, the world marking it: Possess.use)
function seatIn(b, v, pick) {
  const p = G.Space.planNow(b); if (!p || !p.entrance) return { why: 'sem planta' };
  const lv = p.entryLv || 0; const ex = p.entrance.x, ez = p.entrance.z;
  // (a seat at a table first — the place to eat, 'comer': the plate goes on the table before it; pick: a seat of the case's own)
  const pls = In.freeNear(b, lv, ex, ez, 40, ['sentar', 'comer']).filter(q => SEATK[q.it.kind] && In.walkIn(b, q) < Infinity && (!pick || pick(q))).sort((a, c) => (a.use === 'comer' ? 0 : 1) - (c.use === 'comer' ? 0 : 1));
  if (!pls.length) return { why: 'nenhum assento livre' };
  const pl = pls[0]; pl.at = In.standFor(b, pl, pl.x, pl.z);
  if (!Po.is(v)) { G.Vg.endTask(v); v.path = null; if (!Po.take(v).ok) return { why: 'não encarnou' }; } else G.Avatar.detach();
  v.inside = b.id; v.x = b.x + pl.at[0] / TL; v.y = b.y + pl.at[1] / TL; Po.setLevel(pl.lv); G.Avatar.attach(v, 0); for (let k = 0; k < 4; k++) frame();
  const st = G.Avatar.state(); let best = null;
  for (let k = 0; k < 60 && !(best && best.id === 'lugar'); k++) { const ya = Math.atan2(b.y * TL + pl.z - st.Z, b.x * TL + pl.x - st.X); G.Avatar.input.camYaw = ya; st.yaw = ya; best = I.best(); frame(); }
  if (!(best && best.id === 'lugar')) return { why: `o E oferece ${best ? '«' + best.label + '»' : 'nada'}`, pl };
  I.run(best); for (let k = 0; k < 150 && !(G.Avatar.seatNow() && G.Avatar.seatNow().k >= 1); k++) frame();
  const u = Po.useOf(); return { ok: !!u && u.b === b.id, pl, kind: pl.it.kind, label: best.label, it: u ? u.it : null, q: u ? u.q : -1 };
}
// (up from the seat — the player walks —, and out of the house: the god's hand puts the body at the door's point outside)
function standUp() { G.Avatar.input.mz = 1; frame(); G.Avatar.input.mz = 0; for (let k = 0; k < 20; k++) frame(); }
function outOfHouse(b, v) { standUp(); G.Avatar.detach(); god(() => { const dr = G.Vg.door(b); v.inside = 0; v.x = dr[0]; v.y = dr[1]; }); G.Avatar.attach(v, 0); for (let k = 0; k < 6; k++) frame(); }
// (a tavern of the snapshot where all of it can happen: a plan with seats and a counter, a keeper at the counter, a body)
let PICK = null;
for (const b of taverns()) { const kp = T.keeperOf(b); if (!kp || !T.atHand(b)) continue; const v = bodyFor(b); if (!v) continue; const sl = In.slots(b, 'comprar'); if (!sl.length) continue; PICK = { b: b.id, v: v.id }; break; }
if (!PICK) { ok('o retrato', false, 'nenhuma taverna aberta com taverneiro, balcão e um corpo com moedas'); process.exit(1); }
const B = () => S().buildings.get(PICK.b); const OP = () => T.dia(B());
const mine = () => { const v = Po.body(); const op = OP(); return v && op ? op.data.mesa[v.id] : null; };
// (seated and the menu open: the common start of the cases)
function toMenu() {
  const v = S().villagers.get(PICK.v); const r = seatIn(B(), v); if (!r.ok) return Object.assign({ fail: true }, r);
  const got = until(() => { const s = T.corpo(Po.body()); return s && s.cv === 'carta'; }, 90);
  return Object.assign(r, { got, s: T.carta(Po.body()) });
}
const order = (pred) => { const v = Po.body(); const s = T.carta(v); const it = s && s.items.find(x => x.ok && pred(x)); if (!it) return { it: null }; const ask = Po.apply(w => T.order(w, s.op, it.k, it.of)); until(() => !!ask.res, 2); return { it, r: ask.res }; };
const bite = () => { const ask = Po.apply(w => T.bite(w)); until(() => !!ask.res, 2); return ask.res; };
// (the rounds sold to the body: the goods' leg of the deal into its hands — the coins' leg is the same deal, both or neither, D.swap; the
// house's coins are its family's too, and the family at the tables pays from them as well)
const paidBy = (v, op, t0) => seen.filter(e => e.t >= t0 && e.k !== 'moedas' && e.c === 'taverna' && e.op === op && e.to === 'v:' + v.id).length;

// ---------------- c1 the keeper to the table, the menu ----------------
if (on('c1') || on('c2')) {
  fresh(); bad.length = 0; const t0 = S().clock;
  const kp = T.keeperOf(B()); const r = toMenu(); const v = Po.body(); const s = r.s;
  if (r.fail) ok('c1 o corpo senta à mesa', false, r.why || 'não sentou');
  else {
    const m = mine(); const kpl = In.placeOf(kp), bpl = In.placeOf(v);
    const near = kpl && bpl ? Math.hypot(kpl.x - bpl.x, kpl.z - bpl.z) : 9;
    const drinks = s ? s.items.filter(x => x.sort === 'beber') : [], dishes = s ? s.items.filter(x => x.sort === 'comer') : [];
    const prov = I.list.find(p => p.id === 'taverna'); const tg = prov && prov.find(I.ctx())[0];
    ok('c1 senta pelo verbo «lugar» num assento da taverna', r.ok && SEATK[r.kind] && G.Avatar.state().loco === 'seat', `«${r.label}» num ${r.kind}; o mundo: ${Po.useOf() ? Po.useOf().use : '-'}`);
    ok('c1 o taverneiro vem à mesa, de pé ao lado do corpo, e abre o cardápio', r.got && !!m && m.srv === kp.id && kp.task && kp.task.type === 'atender' && kp.task.st === 11 && near < 1.7 && !!m.ola,
      `${kp.name} a ${near.toFixed(2)} m do corpo, em ${kp.task ? kp.task.type + ':' + kp.task.st : '-'}, em ${(S().clock - t0).toFixed(1)} s do mundo: «${m ? m.ola : ''}»`);
    const lk = T.look(B()); const f = G.Fac.get(G.Village.facOfSet(B().set));
    ok('c1 o cardápio: as bebidas do povo e os pratos da cozinha pelo que são feitos, com o preço da casa e o que cada um é', drinks.length >= 1 && dishes.length >= 1 && s.items.every(x => x.p > 0 && x.nome && x.desc) && dishes.every(x => !x.ok || x.of) && !!tg && prov.label(I.ctx(), tg) === 'Ver o cardápio',
      `${s.items.map(x => `${x.nome} — ${x.desc} (${x.ok ? s.price(x.p) + ', ' + x.n : 'não há'})`).join('; ')}; o E diz «${tg ? prov.label(I.ctx(), tg) : '-'}»`);
    ok('c1 a cara do cardápio: o povo do prédio, e o porte e as posses da casa', lk.tema === (B().style || f.civ) && ['lousa', 'quadro', 'carta'].includes(lk.porte) && (lk.porte === 'lousa') === (lk.pts === 0), `${lk.tema} / ${lk.porte} (${lk.pts} ponto(s)${lk.why ? ': ' + lk.why : ''})`);
  }
  // ---------------- c2 a plate, from the order to the last mouthful ----------------
  if (!r.fail && on('c2')) {
    const op = OP().id; const t1 = S().clock; const h0 = v.hunger = 70; const coin0 = D.get(G.Eco.coinRef(v), 'moedas');
    const { it, r: res } = order(x => x.sort === 'comer');
    const m = mine(); let plateInHand = '', crate = false;
    // (the keeper back to the counter, the plate filled from the shelf into his hands — of the part asked —, brought in his hand)
    until(() => { const t = kp.task; if (t && t.type === 'atender' && t.st === 13 && kp.carry) { plateInHand = G.Inv.held(kp).mao || ''; crate = !(G.Inv.roundOf(kp) > 0); } return mine() && mine().cv === 'servido'; }, 120);
    const fill = seen.find(e => e.t >= t1 && e.c === 'taverna-caneca' && e.op === op && e.to === 'v:' + kp.id && e.k === 'food');
    const parts = G.Origem.parts('v:' + v.id, 'food'); const want = Array.isArray(it.of) ? it.of : [it.of];
    const paid = paidBy(v, op, t1); const coin1 = D.get(G.Eco.coinRef(v), 'moedas');
    const W = G.Atmos.within(B()); const onTable = W.mesa.find(q => q.id === v.id);
    ok('c2 o pedido pelas mãos do corpo: o taverneiro busca, enche da prateleira a parte pedida e traz o prato na mão', !!res && res.ok && m && !!fill && /^prato\./.test(plateInHand) && !crate && v.carry && v.carry.k === 'food' && Object.keys(parts).every(p => want.includes(p)),
      `«${it.nome}» (${want.join('+')}): ${res ? res.msg || res.why : '-'}; enchido ${fill ? fill.n : 0} pelo livro; na mão dele: ${plateInHand || 'nada'}${crate ? ' (uma carga nos braços)' : ''}; nas mãos do corpo: ${v.carry ? v.carry.k + ' ' + JSON.stringify(parts) : 'nada'}`);
    // (the coins' leg of the same deal — the same instant, from the body's house to the keeper's: the house's coins are the family's
    // too, and a coin thrown to a musician of the family moves them in the same while, T-1824)
    const goods = seen.find(e => e.t >= t1 && e.c === 'taverna' && e.op === op && e.k !== 'moedas' && e.to === 'v:' + v.id);
    const coinLeg = goods ? seen.filter(e => e.t === goods.t && e.c === 'taverna' && e.op === op && e.k === 'moedas' && e.from === G.Eco.coinRef(v)).reduce((a, e) => a + e.n, 0) : 0;
    ok('c2 entregue e pago à mesa, uma vez; o prato na mesa diante do corpo', paid === 1 && Math.abs(coinLeg - T.PRICE.food) < 1e-6 && !!onTable && !!onTable.prato,
      `pago ${paid}× (${coinLeg.toFixed(2)} das moedas da casa ao taverneiro; a bolsa ${coin0.toFixed(2)} → ${coin1.toFixed(2)}); na mesa: ${onTable ? JSON.stringify({ prato: onTable.prato, cup: onTable.cup }) : 'nada'}`);
    // (the mouthfuls: the gesture of the table seated, the world at its contact)
    const A3 = G.Anim3D; const clips = !!(A3.CLIPS['mesa-comer'] && A3.CLIPS['mesa-comer~m'] && A3.CLIPS['mesa-beber'] && A3.CLIP_OF.dine === 'mesa-comer');
    const prov = I.list.find(p => p.id === 'taverna'); const tg = prov.find(I.ctx())[0]; const lb = tg ? prov.label(I.ctx(), tg) : '';
    let anim = ''; G.Avatar.act({ anim: 'mesa-comer', dur: 2.8, contact: 1.3, vact: 'dine', free: true }); for (let k = 0; k < 10; k++) frame(); anim = G.Avatar.state().anim; const vact = v.act; for (let k = 0; k < 90 && G.Avatar.busy(); k++) frame();
    let n = 0, last = null; while (v.carry && v.carry.k === 'food' && n < 8) { last = bite(); n++; }
    const deed = (S().avatar.deeds || {}).refeicao || 0; const used = seen.filter(e => e.t >= t1 && e.c === 'refeicao' && e.from === 'v:' + v.id).reduce((a, e) => a + e.n, 0);
    ok('c2 os bocados: sentado, o gesto da mesa; a fome cai pelo que se comeu, e o prato acaba', clips && anim === 'mesa-comer' && vact === 'dine' && G.Avatar.state().loco === 'seat' && n === T.BITES && last && last.last && !v.carry && Math.abs(used - 1) < 1e-6 && h0 - v.hunger > 30 && h0 - v.hunger <= 35 + 1e-6 && mine().cv === 'entre' && deed >= 1 && /^Comer /.test(lb),
      `o E: «${lb}»; o gesto: ${anim} (${vact}); ${n} bocados; comido ${used.toFixed(2)} pelo livro; a fome ${h0} → ${v.hunger.toFixed(1)} (35 pelo prato, menos o que a fome cresceu enquanto se comia); ${mine() ? mine().cv : '-'}`);
    watch(); ok('c2 o verificador limpo', !bad.length, bad.join(' | ') || 'nada');
  }
}

// ---------------- c3 a drink: the cup in the hand, the sips ----------------
if (on('c3')) {
  fresh(); bad.length = 0; const r = toMenu(); const v = Po.body();
  if (r.fail || !r.got) ok('c3 a bebida', false, r.why || 'o cardápio não abriu');
  else {
    const op = OP().id; const t1 = S().clock; const d0 = v.drinks || 0;
    const { it, r: res } = order(x => x.sort === 'beber'); until(() => mine() && mine().cv === 'servido', 120);
    const cup = G.Inv.held(v).mao || ''; let n = 0, last = null; while (v.carry && v.carry.op === op && n < 6) { last = bite(); n++; }
    // (the cup left on the table: the day's record of the vessels left — d.sujo, what the drawing reads since P5, T-1886)
    const q = (OP().data.sujo || []).find(x => x.who === v.id && x.k !== 'food');
    ok('c3 a caneca na mão, três goles, o efeito no último, a caneca deixada na mesa', !!res && res.ok && /^caneca\./.test(cup) && n === T.SIPS && last && last.last && (v.drinks || 0) === d0 + 1 && mine().r === 1 && !!q,
      `«${it ? it.nome : '-'}»: na mão ${cup || 'nada'}; ${n} goles; bebidas ${d0} → ${v.drinks || 0}; na mesa: ${q ? q.k : 'nada'}`);
    watch(); ok('c3 o verificador limpo', !bad.length, bad.join(' | ') || 'nada');
  }
}

// ---------------- c4 up from the seat before the order comes: the order stays (D-800) ----------------
if (on('c4')) {
  fresh(); bad.length = 0; const r = toMenu(); const v = Po.body(); const kp = T.keeperOf(B());
  if (r.fail || !r.got) ok('c4 levanta antes', false, r.why || 'o cardápio não abriu');
  else {
    const op = OP().id; const t1 = S().clock; const { it } = order(x => x.sort === 'beber'); const seat = [r.it, r.q];
    until(() => kp.task && kp.task.type === 'atender' && kp.task.st === 13 && !!kp.carry, 90); const had = !!kp.carry;
    // (the seat kept for the body: up from it, it is not freed for anyone else — the count of the free seats is the same, and the
    // body's own probe still has it)
    const fc0 = In.freeCount(B(), ['sentar', 'comer']); standUp(); const up = mine() && mine().cv === 'pedido' && !Po.useOf();
    const fc1 = In.freeCount(B(), ['sentar', 'comer']); const mineStill = In.freeNear(B(), r.pl.lv, r.pl.x, r.pl.z, 0.6, ['sentar', 'comer']).some(q => q.item === seat[0] && q.q === seat[1]);
    const notOther = fc1 <= fc0 && mineStill; const kept = true;
    const set = until(() => mine() && mine().cv === 'mesa', 60); const m = mine(); const s = T.corpo(v);
    const onT = T.mesas(B()).find(q => q.estado === 'pedido' && q.who === v.id);
    const line = seen.filter(e => e.t >= t1 && e.c === 'taverna-mesa' && e.from === 'v:' + kp.id && e.to === 't:' + op).length;
    ok('c4 o corpo levanta antes de o pedido chegar: o pedido fica — o taverneiro o deixa no lugar dele, guardado, e chama', had && up && set && !!onT && onT.it === seat[0] && onT.q === seat[1] && line === 1 && paidBy(v, op, t1) === 0 && notOther && kept && /sente-se/i.test((s && s.chegou) || ''),
      `${it ? it.nome : '-'}: em pé com o pedido ${up ? 'a caminho' : 'DESFEITO'}; na mesa ${onT ? `no lugar ${onT.it}#${onT.q}${onT.quente ? ', quente' : ''}` : 'nada'} (${line} linha do livro para a mesa); o lugar ${notOther ? 'guardado' : 'DADO A OUTRO'}; pago ${paidBy(v, op, t1)}×; «${s ? s.chegou : ''}»`);
    // (sat down again at its seat: handed over and paid there, once — and eaten, drunk)
    const r2 = seatIn(B(), v, q => q.item === seat[0] && q.q === seat[1]); until(() => mine() && mine().cv === 'servido', 10);
    const paid = paidBy(v, op, t1); let n = 0, last = null; while (v.carry && v.carry.op === op && n < 8) { last = bite(); n++; }
    ok('c4 senta de novo no lugar guardado: recebe o pedido, paga ali uma vez, e bebe', !!r2.ok && paid === 1 && !!last && last.last && !T.mesas(B()).some(q => q.estado === 'pedido'),
      `sentou ${r2.ok ? 'no lugar guardado' : 'NÃO: ' + (r2.why || '')}; pago ${paid}×; ${n} goles`);
    watch(); ok('c4 o verificador limpo', !bad.length, bad.join(' | ') || 'nada');
  }
}

// ---------------- c5 no coin; the god's hand on the shelf ----------------
if (on('c5')) {
  fresh(); bad.length = 0; const r = toMenu(); const v = Po.body(); const kp = T.keeperOf(B());
  if (r.fail || !r.got) ok('c5 sem dinheiro', false, r.why || 'o cardápio não abriu');
  else {
    const op = OP(); const ref = G.Eco.coinRef(v); const keep = D.get(ref, 'moedas'); const f = 'f:' + G.Fac.idOfV(v);
    god(() => D.move(ref, f, 'moedas', keep, { code: 'teste' })); // (the test's hand: the coins to the treasury)
    const s = T.carta(v); const it = s.items.find(x => x.ok); const ask = Po.apply(w => T.order(w, s.op, it.k, it.of)); until(() => !!ask.res, 2);
    ok('c5 sem dinheiro: o pedido recusado, e o porquê', !!ask.res && !ask.res.ok && /Falta dinheiro/.test(ask.res.why) && mine().cv === 'carta', `«${ask.res ? ask.res.why : '-'}»`);
    god(() => D.move(f, ref, 'moedas', keep, { code: 'teste' }));
    // (the order, and the god's hand takes the shelf's whole of it before he fills: «acabou», back at the table with the menu again)
    const { it: it2, r: res } = order(x => x.sort === 'comer'); const t1 = S().clock;
    until(() => kp.task && kp.task.type === 'atender' && kp.task.st === 12, 60);
    god(() => { const b = B(); const n = D.get('b:' + b.id, 'food'); if (n > 0) D.use('b:' + b.id, 'food', n, { code: 'teste' }); });
    const again = until(() => mine() && mine().cv === 'carta' && mine().ck >= 2, 90); const s2 = T.carta(v);
    const dish = s2 ? s2.items.filter(x => x.sort === 'comer') : [];
    ok('c5 o deus tira da prateleira o que foi pedido: «acabou», e o cardápio de novo com «não há»', !!res && res.ok && again && /acabou|Não tem/i.test(mine().ola) && dish.length && dish.every(x => !x.ok) && paidBy(v, op.id, t1) === 0,
      `${it2 ? it2.nome : '-'}: de volta ${again ? 'sim' : 'não'} — «${mine() ? mine().ola : ''}»; os pratos: ${dish.map(x => x.nome + (x.ok ? '' : ' (não há)')).join(', ')}`);
    watch(); ok('c5 o verificador limpo', !bad.length, bad.join(' | ') || 'nada');
  }
}

// ---------------- c6 the keeper dead in the middle; the counter ----------------
if (on('c6')) {
  fresh(); bad.length = 0; const r = toMenu(); const v = Po.body(); const kp = T.keeperOf(B());
  if (r.fail || !r.got) ok('c6 o taverneiro morto', false, r.why || 'o cardápio não abriu');
  else {
    const op = OP(); order(x => x.sort === 'beber');
    // (with the order still his to bring — filling it, or on the way —: the serving got quicker since, and «12 or more» caught him handing it
    // over, T-1887)
    const hit = until(() => kp.task && kp.task.type === 'atender' && (kp.task.st === 12 || kp.task.st === 13) && mine() && mine().cv === 'pedido', 60); if (!hit) console.log(`   (c6: o taverneiro nunca pegou o pedido: ${kp.task ? kp.task.type + ':' + kp.task.st : '-'}, a entrada ${mine() ? mine().cv : '-'})`);
    // (the test's hand, as taverna-vida v3: the keeper dies with the cup in his hands — a town of this world may have no jail, T-1820)
    god(() => G.Village.kill(kp, 'teste', true));
    until(() => mine() && (mine().so > 0 || mine().cv === 'servido'), 40); const m = mine();
    // (the order called again: nobody comes and the body is sent to the counter — or the one the house has now at the counter, the keeper
    // the trades gave it at once or one of its staff, brings it — T3's house, T-1887)
    const other = !!m && m.cv === 'servido' && T.keeperOf(B()) && T.keeperOf(B()).id !== kp.id;
    ok('c6 o taverneiro morre no meio: o pedido chamado de novo, e ninguém vem — o corpo é mandado ao balcão', !!m && !S().villagers.has(kp.id) && ((!m.srv && m.so > 0) || other), `${kp.name} ${S().villagers.has(kp.id) ? 'vivo' : 'morto'}; a entrada: ${m ? m.cv + ' srv ' + m.srv + ' so ' + m.so : 'nada'}${other ? ` — servido por ${T.keeperOf(B()).name}, o taverneiro de agora` : ''}`);
    if (other) { ok('c6 no balcão, o corpo se serve da prateleira e paga', true, 'o novo taverneiro serviu: o balcão não foi preciso'); watch(); ok('c6 o verificador limpo', !bad.length, bad.join(' | ') || 'nada'); }
    else {
    // (up and to the counter: the buyer's place)
    const c = T.corpo(v).counter; G.Avatar.input.mz = 1; frame(); G.Avatar.input.mz = 0; for (let k = 0; k < 20; k++) frame();
    G.Avatar.detach(); god(() => { v.x = c[0]; v.y = c[1]; }); G.Avatar.attach(v, 0); for (let k = 0; k < 6; k++) frame();
    const s0 = T.corpo(v); const prov = I.list.find(p => p.id === 'taverna'); const tg = s0 ? prov.find(I.ctx()).find(q => q.bal) : null;
    const ask = Po.apply(w => T.counter(w, op.id)); until(() => !!ask.res, 2); const t1 = S().clock;
    const { it, r: res } = order(x => x.sort === 'beber'); const paid = paidBy(v, op.id, t1);
    ok('c6 no balcão, o corpo se serve da prateleira e paga', !!tg && prov.label(I.ctx(), tg) === 'Servir-se no balcão' && !!ask.res && ask.res.ok && !!res && res.ok && v.carry && v.carry.op === op.id && paid === 1,
      `o E: «${tg ? prov.label(I.ctx(), tg) : '-'}»; ${it ? it.nome : '-'}: ${res ? res.msg || res.why : '-'}; pago ${paid}×`);
    watch(); ok('c6 o verificador limpo', !bad.length, bad.join(' | ') || 'nada');
    }
  }
}

// ---------------- c7 a save in the middle of the order ----------------
if (on('c7')) {
  fresh(); bad.length = 0; const r = toMenu(); let v = Po.body(); const kpId = T.keeperOf(B()).id;
  if (r.fail || !r.got) ok('c7 o save no meio', false, r.why || 'o cardápio não abriu');
  else {
    const op = OP().id; const t1 = S().clock; const { it } = order(x => x.sort === 'beber');
    until(() => { const k = S().villagers.get(kpId); return k.task && k.task.type === 'atender' && k.task.st === 13; }, 90);
    M.salvarCarregar(); v = Po.body(); if (v) { G.Avatar.attach(v, 0); for (let k = 0; k < 6; k++) frame(); }
    const m0 = mine(); const was = m0 ? m0.cv : '-';
    const got = until(() => mine() && mine().cv === 'servido', 150);
    const paid = paidBy(v, op, t1); if (paid !== 1) console.log(JSON.stringify(seen.filter(e => e.t >= t1 && e.op === op && (e.to === 'v:' + v.id || e.from === 'v:' + v.id || e.c === 'taverna-caneca' || e.c === 'taverna-volta'))));
    ok('c7 um save no meio do pedido: ele volta, é buscado de novo e servido, pago uma vez', !!v && was === 'pedido' && got && paid === 1 && v.carry && v.carry.op === op,
      `depois do load: ${was}; servido ${got ? 'sim' : 'não'}; pago ${paid}×; ${it ? it.nome : '-'}`);
    watch(); ok('c7 o verificador limpo', !bad.length, bad.join(' | ') || 'nada');
  }
}

// ---------------- c9 out of the house and back: the order waits on the table ----------------
if (on('c9')) {
  fresh(); bad.length = 0; const r = toMenu(); let v = Po.body(); const kp = T.keeperOf(B());
  if (r.fail || !r.got) ok('c9 sai e volta', false, r.why || 'o cardápio não abriu');
  else {
    const op = OP().id; const t1 = S().clock; const { it } = order(x => x.sort === 'comer'); const seat = [r.it, r.q];
    until(() => kp.task && kp.task.type === 'atender' && kp.task.st === 12, 60); outOfHouse(B(), v);
    const set = until(() => mine() && mine().cv === 'mesa', 60); const hot0 = (T.mesas(B()).find(q => q.estado === 'pedido') || {}).quente;
    // (a while out: the plate cools on the table, the steam gone — still there)
    const t2 = S().clock; while (S().clock - t2 < T.QUENTE + 2) fast(); const q2 = T.mesas(B()).find(q => q.estado === 'pedido');
    ok('c9 o corpo sai da taverna: o pedido espera na mesa, quente e depois frio', set && hot0 === true && !!q2 && q2.quente === false && mine() && mine().fora > 0,
      `${it ? it.nome : '-'}: na mesa ${set ? 'sim' : 'não'}, quente ao chegar ${hot0}, depois ${q2 ? (q2.quente ? 'quente' : 'frio') : 'SUMIU'}; fora desde ${mine() ? mine().fora : '-'}`);
    const r2 = seatIn(B(), v, q => q.item === seat[0] && q.q === seat[1]); until(() => mine() && mine().cv === 'servido', 10);
    const paid = paidBy(v, op, t1); let n = 0; while (v.carry && v.carry.op === op && n < 8) { bite(); n++; }
    ok('c9 volta e senta: o prato frio nas mãos, pago uma vez, comido', !!r2.ok && paid === 1 && n === T.BITES && !!mine() && mine().frio === 1, `sentou ${r2.ok ? 'sim' : r2.why}; pago ${paid}×; ${n} bocados; ${mine() && mine().frio ? 'frio' : 'quente'}`);
    watch(); ok('c9 o verificador limpo', !bad.length, bad.join(' | ') || 'nada');
  }
}

// ---------------- c10 out too long: the keeper takes it back, nothing paid, nothing lost ----------------
if (on('c10')) {
  fresh(); bad.length = 0; const r = toMenu(); const v = Po.body(); const kp = T.keeperOf(B());
  if (r.fail || !r.got) ok('c10 esfria e volta', false, r.why || 'o cardápio não abriu');
  else {
    const op = OP().id; const t1 = S().clock; const { it } = order(x => x.sort === 'comer'); const shelf = 'b:' + B().id;
    until(() => kp.task && kp.task.type === 'atender' && kp.task.st === 12, 60); outOfHouse(B(), v);
    until(() => mine() && mine().cv === 'mesa', 60); const f0 = D.get(shelf, 'food');
    const back = until(() => !mine() && !T.mesas(B()).some(q => q.estado === 'pedido') && !(kp.carry && kp.carry.op === op), T.FORA + 60);
    // (the plate of the body's order: from the table to the keeper's hands, and from them to the shelf — the rounds the keeper takes back from
    // other tables the same moment are not this order's, T-1885)
    const upE = seen.filter(e => e.t >= t1 && e.c === 'taverna-mesa-volta' && e.from === 't:' + op); const up = upE.length; const tUp = up ? upE[0].t : Infinity;
    const shelfBack = seen.filter(e => e.t >= tUp && e.c === 'taverna-volta' && e.to === shelf && e.k === 'food' && e.from === 'v:' + kp.id).slice(0, 1).reduce((a, e) => a + e.n, 0);
    const tally = OP() ? (OP().data.atos || {})['pedido-volta'] || {} : {};
    ok('c10 sem o corpo, o pedido esfria e o taverneiro o leva de volta à prateleira: nada pago, nada some', back && up === 1 && Math.abs(shelfBack - 1) < 1e-6 && paidBy(v, op, t1) === 0 && tally.esfriou === 1,
      `${it ? it.nome : '-'}: de volta ${back ? 'sim' : 'não'} (da mesa às mãos ${up}×, das mãos à prateleira ${shelfBack}); pago ${paidBy(v, op, t1)}×; a prateleira ${f0} → ${D.get(shelf, 'food')}`);
    watch(); ok('c10 o verificador limpo', !bad.length, bad.join(' | ') || 'nada');
  }
}

// ---------------- c11 a save with the order on the table ----------------
if (on('c11')) {
  fresh(); bad.length = 0; const r = toMenu(); let v = Po.body(); const kpId = T.keeperOf(B()).id;
  if (r.fail || !r.got) ok('c11 o save com o pedido na mesa', false, r.why || 'o cardápio não abriu');
  else {
    const op = OP().id; const t1 = S().clock; order(x => x.sort === 'beber'); const seat = [r.it, r.q];
    until(() => { const k = S().villagers.get(kpId); return k.task && k.task.type === 'atender' && k.task.st === 12; }, 60); standUp();
    until(() => mine() && mine().cv === 'mesa', 60); const n0 = D.get('t:' + op, OP().data.na[0] ? OP().data.na[0].k : 'cerveja');
    M.salvarCarregar(); v = Po.body(); if (v) { G.Avatar.attach(v, 0); for (let k = 0; k < 6; k++) frame(); }
    const m = mine(); const was = m ? m.cv : '-'; const n1 = OP() && OP().data.na[0] ? D.get('t:' + op, OP().data.na[0].k) : 0;
    const r2 = v ? seatIn(B(), v, q => q.item === seat[0] && q.q === seat[1]) : { why: 'sem corpo' }; until(() => mine() && mine().cv === 'servido', 10);
    ok('c11 um save com o pedido na mesa: ele volta na mesa, no lugar guardado; senta e paga uma vez', was === 'mesa' && n1 > 0 && Math.abs(n1 - n0) < 1e-6 && !!r2.ok && paidBy(v, op, t1) === 1,
      `depois do load: ${was}, na mesa ${n1} (antes ${n0}); sentou ${r2.ok ? 'sim' : r2.why}; pago ${paidBy(v, op, t1)}×`);
    watch(); ok('c11 o verificador limpo', !bad.length, bad.join(' | ') || 'nada');
  }
}

// ---------------- c12 the menu is what the house has (D-803) ----------------
if (on('c12')) {
  fresh(); bad.length = 0;
  // (three taverns of different peoples and lands — else of different towns —: each menu by its own shelf and its own people's origin)
  const all = taverns(); const by = new Map(); for (const b of all) { const civ = (G.Fac.get(G.Village.facOfSet(b.set)) || {}).civ; if (!by.has(civ)) by.set(civ, b); }
  let three = [...by.values()]; if (three.length < 3) for (const b of all) if (!three.includes(b) && three.length < 3 && !three.some(x => x.set === b.set)) three.push(b);
  const bads = [], said = [], sigs = new Set();
  for (const b of three.slice(0, 3)) {
    const ref = 'b:' + b.id; const fid = G.Village.facOfSet(b.set); const f = G.Fac.get(fid); const L = T.cartaOf(b); const own = G.Tavern.DRINK[f.civ] || G.Tavern.DRINK.classico;
    for (const x of L) {
      if (x.sort === 'beber') { const n = Math.floor(D.free(ref, x.k) / T.DOSE[x.k] + 1e-6); if (x.n !== n) bads.push(`${b.id} ${x.k}: ${x.n} na carta, ${n} na prateleira`); if (n < 1 && x.k !== own.k) bads.push(`${b.id} ${x.k}: na carta sem ter`); if (x.k === 'cerveja' && /cerveja de (\S+)/.test(x.desc)) { const g = /cerveja de (\S+)/.exec(x.desc)[1]; if (!G.Origem.CEREAL.some(c => G.Origem.FOOD[c].nome === g)) bads.push(`${b.id} a cerveja de ${g}: não é cereal`); if (!b.malte || !Object.keys(b.malte).some(k => G.Origem.FOOD[k] && G.Origem.FOOD[k].nome === g)) bads.push(`${b.id} a cerveja de ${g} sem o grão da cuba`); } }
      else if (x.ok) { const parts = [].concat(x.of); const n = Math.floor(G.Origem.free(ref, 'food', parts) + 1e-6); if (n !== x.n) bads.push(`${b.id} ${x.nome}: ${x.n} na carta, ${n} da parte na prateleira`);
        const t = parts[0]; const day = G.Origem.madeBy(fid, t, T.FRESCO); const want = T.descFood(b, t); if (x.desc !== want) bads.push(`${b.id} ${x.nome}: «${x.desc}» ≠ «${want}»`);
        if (/do povo/.test(x.desc) && !(day > 0) && !(day < 0 && T.meansOf(fid, t))) bads.push(`${b.id} ${x.nome}: «do povo» sem o povo ter feito nem ter com que fazer`); if (/de fora/.test(x.desc) && day !== 0) bads.push(`${b.id} ${x.nome}: «de fora» com o povo tendo feito`); }
    }
    const sig = L.map(x => x.id + ':' + (x.ok ? x.n : 0)).join(','); sigs.add(sig);
    said.push(`${f.civ} #${b.id}: ${L.map(x => `${x.nome}${x.ok ? '' : ' (não há)'} — ${x.desc}`).join('; ')}`);
  }
  ok('c12 a carta só com o que existe: em três tavernas de povos e terras diferentes, cada linha bate com a prateleira e com a origem, e as cartas são diferentes', three.length >= 3 && !bads.length && sigs.size === Math.min(3, three.length),
    `${said.join(' | ')}${bads.length ? ' — FALHOU: ' + bads.slice(0, 6).join(' | ') : ''}`);
}

// ---------------- c13 the regulars and «o de sempre» (D-804) ----------------
if (on('c13')) {
  fresh(); bad.length = 0;
  // (the house's memory written at the closing from the day's book: everyone who sat tonight, one night more, and what they had)
  while (Object.keys(OP().data.ped || {}).length < 3 && S().time < 0.8) { calm(); M.viver(0.5); }
  const b0 = B(); const op0 = OP(); const sat = Object.keys(op0.data.ped || {}).map(Number); const before = new Map(sat.map(id => [id, (T.freg(b0, { id }) || [0, 0])[1]]));
  god(() => T.close(op0, 'teste'));
  const wrote = sat.filter(id => S().villagers.has(id)).every(id => { const e = T.freg(b0, { id }); return e && e[1] === before.get(id) + 1 && e[2] === S().day; });
  ok('c13 a taverna lembra quem veio: a noite de cada um que sentou, no fechamento', sat.length > 0 && wrote && Array.isArray(b0.freg), `${sat.length} que sentaram hoje; a memória da casa: ${(b0.freg || []).length} fregueses`);
  // (the body's person a regular — four nights, the house's drink asked —: the menu opens with «o de sempre»; out of it, said so)
  fresh(); const v0 = S().villagers.get(PICK.v); const k = T.drinkOn(B()) || 'cerveja';
  god(() => { const b = B(); b.freg = (b.freg || []).filter(e => e[0] !== v0.id); b.freg.push([v0.id, 4, S().day - 1, { [k]: 3 }]); });
  const r = toMenu(); const v = Po.body(); const s = r.s; const m = mine();
  ok('c13 o corpo freguês de sempre: o taverneiro o chama pelo nome e abre o cardápio com «o de sempre»', !r.fail && r.got && !!s && !!s.sempre && s.sempre.key === k && new RegExp(v.name).test(m.ola) && /sempre/i.test(m.ola) && m.sempre === k,
    `«${m ? m.ola : ''}» (o de sempre: ${s && s.sempre ? s.sempre.nome : '-'})`);
  // (the shelf out of it — the god's hand —: the menu again, said by name that it ran out, and another thing offered)
  if (!r.fail && r.got) {
    Po.apply(w => T.dismiss(w, s.op)); for (let i = 0; i < 4; i++) fast(); const ref = 'b:' + B().id; const n = D.get(ref, k); god(() => { if (n > 0) D.move(ref, 'f:' + G.Village.facOfSet(B().set), k, n, { code: 'teste' }); });
    Po.apply(w => T.call(w, s.op)); const again = until(() => mine() && mine().cv === 'carta' && mine().ck >= 2, 60);
    ok('c13 o de sempre acabou: dito pelo nome, e outra coisa oferecida', again && /acabou|não tem/i.test(mine().ola) && new RegExp(v.name).test(mine().ola) && !mine().sempre, `«${mine() ? mine().ola : ''}»`);
  }
  watch(); ok('c13 o verificador limpo', !bad.length, bad.join(' | ') || 'nada');
}

// ---------------- c14 a round for the table (D-808) ----------------
// (a table with two or more of the world at it between rounds: lived from the snapshot until there is one, the body sits at it)
// (of every tavern open: the first with such a table, its keeper at hand and a body of its people — the cases' tavern for these two)
const tableWith = b => { const op = T.dia(b); if (!op || !T.atHand(b)) return 0; const by = new Map(); for (const id of Object.keys(op.data.mesa)) { const m = op.data.mesa[id]; const o = S().villagers.get(+id); if (!m.g || m.body || !o || !o.task || o.task.type !== 'tavern' || o.task.st < 2) continue; by.set(m.g, (by.get(m.g) || 0) + 1); } for (const [k, n] of by) if (n >= 2 && In.freeNear(b, 0, 0, 0, 999, ['sentar', 'comer']).some(q => In.groupOf(b, q.item) === k)) return k; return 0; };
if (on('c14') || on('c15')) {
  fresh(); bad.length = 0; let g = 0; const t0 = S().clock; const PICK0 = PICK;
  while (!g && S().clock - t0 < 60) { calm(); M.viver(0.5); for (const b of taverns()) { const k = tableWith(b); const w = k && bodyFor(b); if (k && w) { g = k; PICK = { b: b.id, v: w.id }; break; } } }
  const v = S().villagers.get(PICK.v); const r = g ? seatIn(B(), v, q => In.groupOf(B(), q.item) === g) : { why: 'nenhuma mesa com gente' };
  if (!r.ok) ok('c14 a rodada', false, r.why || 'não sentou');
  else {
    // (the entry made at the tavern's next second of the world)
    const op = OP().id; until(() => mine() && mine().seat, 5); const vb = T.verbos(v); const t1 = S().clock; const fama0 = JSON.stringify(v.fama || []);
    const quem = vb.rodada.ok ? vb.rodada.quem.map(o => o.id) : []; const ask = Po.apply(w => T.rodada(w, op)); until(() => !!ask.res, 2);
    until(() => quem.every(id => !OP().data.mesa[id] || !OP().data.mesa[id].paga), 90);
    const ref = G.Eco.coinRef(v); const paidFor = seen.filter(e => e.t >= t1 && e.c === 'taverna' && e.k === 'moedas' && e.from === ref && e.op === op).length;
    const served = quem.filter(id => seen.some(e => e.t >= t1 && e.c === 'taverna' && e.k !== 'moedas' && e.to === 'v:' + id)).length;
    const ties = quem.filter(id => { const o = S().villagers.get(id); const L = G.Lacos && o ? G.Lacos.sente(o, v) : null; return L && L.afeto > 0; }).length;
    ok('c14 pagar uma rodada para a mesa: o taverneiro serve a todos da mesa, o corpo paga cada caneca, e os laços e a fama sobem', !!ask.res && ask.res.ok && quem.length >= 1 && served === quem.length && paidFor >= quem.length && ties >= 1 && JSON.stringify(v.fama || []) !== fama0,
      `«${ask.res ? ask.res.msg || ask.res.why : '-'}»${ask.res && ask.res.ok ? '' : ` (a entrada: ${JSON.stringify(mine() && { cv: mine().cv, seat: mine().seat, corpo: mine().corpo })}; o lugar: ${JSON.stringify(Po.useOf())}; dentro de #${v.inside}, a taverna #${PICK.b})`}: ${served} de ${quem.length} servidos, ${paidFor} canecas pagas pelo corpo; ${ties} com afeto pelo corpo; a fama ${JSON.stringify(v.fama || [])}`);
    watch(); ok('c14 o verificador limpo', !bad.length, bad.join(' | ') || 'nada');
    // ---------------- c15 a song asked, a coin to the musician, the game of bones ----------------
    if (on('c15')) {
      // (a moment for the round to be drunk and someone of the night to be one to play: the song is asked of who plays)
      bad.length = 0; { const t9 = S().clock; while (S().clock - t9 < 40 && !(T.verbos(v) && T.verbos(v).musica.ok && Object.keys(OP().data.mesa).some(id => +id !== v.id && OP().data.mesa[id].g === mine().g && OP().data.mesa[id].st >= 2 && OP().data.mesa[id].st <= 5))) fast(); }
      const vb2 = T.verbos(v); const mu = vb2.musica.ok ? vb2.musica.mu : null; const t2 = S().clock;
      const ask2 = mu ? Po.apply(w => T.musica(w, op)) : null; if (ask2) until(() => !!ask2.res, 2);
      const sabe = mu && ask2.res && ask2.res.ok && !ask2.res.nao; const coin = seen.filter(e => e.t >= t2 && e.c === 'musica' && e.k === 'moedas' && e.from === G.Eco.coinRef(v)).length;
      const playsIt = sabe ? until(() => T.cancao(B()) === G.Fac.civOfV(v), 40) : true;
      ok('c15 pedir uma música: a moeda ao músico e a canção do povo do corpo — ou ele diz que não sabe, e não leva a moeda', !!mu && !!ask2.res && ask2.res.ok && (sabe ? coin === 1 && playsIt : coin === 0),
        `${mu ? mu.name : 'ninguém toca'}: «${ask2 && ask2.res ? ask2.res.msg || ask2.res.why : '-'}»; ${coin} moeda(s) pelo livro; tocando ${T.cancao(B()) || '-'}`);
      if (mu) { const ask3 = Po.apply(w => T.gorjeta(w, mu.id)); until(() => !!ask3.res, 2); const tip = seen.filter(e => e.t >= t2 && e.c === 'gorjeta' && e.from === G.Eco.coinRef(v) && e.to === G.Eco.coinRef(mu)).length;
        ok('c15 dar gorjeta ao músico: de bolsa em bolsa, pelo livro', !!ask3.res && ask3.res.ok && tip === 1, `«${ask3.res ? ask3.res.msg || ask3.res.why : '-'}»`); }
      // (the game of bones at the body's table — the test's hand starts one between two of the table, as the índole would —: in, a
      // throw, the stake from the loser to the winner at once; the same throw from the same moment, the same bones)
      const d = OP().data; const me = d.mesa[v.id]; const two = Object.keys(d.mesa).map(Number).filter(id => id !== v.id && d.mesa[id].g === me.g && d.mesa[id].st >= 2 && d.mesa[id].st <= 5).slice(0, 2); // (at the table: waiting, drinking or between rounds)
      if (two.length >= 1 && G.Origem.matOK(G.Fac.idOfV(v), 'osso')) {
        god(() => { (d.jogo || (d.jogo = {}))[me.g] = { t0: S().clock, ate: S().clock + 30, quem: two.slice(), n: 0 }; });
        const a1 = Po.apply(w => T.jogar(w, op)); until(() => !!a1.res, 2); const snap = G.Save.serialize(); const t3 = S().clock;
        const dbg = JSON.stringify({ jogo: d.jogo && d.jogo[me.g], two, ms: two.map(id => OP().data.mesa[id] && [OP().data.mesa[id].st, OP().data.mesa[id].g]), me: [mine().g, mine().seat, me.g] });
        const a2 = Po.apply(w => T.jogar(w, op)); until(() => !!a2.res, 2); const res = a2.res;
        const bet = seen.filter(e => e.t >= t3 && e.c === 'aposta' && e.k === 'moedas'); const right = !res || !res.ok ? false : res.win > 0 ? bet.every(e => e.to === G.Eco.coinRef(v)) : res.win < 0 ? bet.every(e => e.from === G.Eco.coinRef(v)) : !bet.length;
        G.Save.apply(JSON.parse(snap)); G.Avatar.attach(Po.body(), 0); const a3 = Po.apply(w => T.jogar(w, op)); until(() => !!a3.res, 2);
        ok('c15 entrar no jogo de ossinhos: uma aposta pequena pelo livro, o resultado pelo lance (o mesmo lance, os mesmos ossos)', !!a1.res && a1.res.entrou && !!res && res.ok && right && !!a3.res && a3.res.a === res.a && a3.res.b === res.b,
          `«${a1.res ? a1.res.msg : '-'}» «${res ? res.msg || res.why : '-'}» ${res && res.ok ? '' : dbg}; ${bet.length} linha(s) da aposta; de novo do mesmo instante: ${a3.res ? a3.res.a + ' contra ' + a3.res.b : '-'}`);
      } else ok('c15 o jogo de ossinhos', true, `${two.length ? 'o povo nunca teve osso' : 'ninguém mais à mesa'} — a parte não se aplica`);
      watch(); ok('c15 o verificador limpo', !bad.length, bad.join(' | ') || 'nada');
    }
  }
  PICK = PICK0;
}

// ---------------- c8 the world without the body ----------------
if (on('c8')) {
  // (a fifth of the evening from the snapshot, twice: the days of the taverns — the rounds, who sits at the tables —, the same)
  const days = () => [...S().buildings.values()].filter(b => b.type === 'taverna' && T.dia(b)).sort((a, c) => a.id - c.id);
  fresh(); bad.length = 0; const run = () => { const out = []; for (let k = 0; k < 60; k++) { calm(); M.viver(0.5); if (k % 10 === 9) watch(); } for (const b of days()) { const op = T.dia(b); out.push(b.id + ':' + op.data.servidos + ':' + Object.keys(op.data.mesa).sort().join(',')); } return out.join('|'); };
  const a = run(); const corpo = days().some(b => Object.values(T.dia(b).data.mesa).some(m => m.corpo)); fresh(); const b2 = run();
  watch(); ok('c8 o mundo sem o corpo: nenhuma entrada do corpo, e o mesmo mundo duas vezes', !corpo && a.length > 0 && a === b2 && !bad.length, `${a.length} caracteres do dia das tavernas; ${a === b2 ? 'iguais' : 'diferentes'}${bad.length ? '; ' + bad.join(' | ') : ''}`);
}

const e = M.erros(); ok('sem erros', !Object.keys(e.mod).length && !e.console.length, JSON.stringify(e).slice(0, 300));
console.log(`(${(clock() - c0).toFixed(0)} s)`);
console.log(fails.length ? `FALHOU: ${fails.length}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
