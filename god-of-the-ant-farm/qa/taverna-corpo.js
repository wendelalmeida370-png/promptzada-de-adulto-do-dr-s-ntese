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
//  c4 o corpo levanta antes de chegar o pedido: desfeito, nada pago, a caneca das mãos do taverneiro de volta à prateleira
//  c5 sem dinheiro: o cardápio diz por quê, e o pedido é recusado; o deus tira da prateleira o que foi pedido: «acabou», e o
//     taverneiro volta à mesa com o cardápio de novo
//  c6 o taverneiro morre no meio do pedido: chamado de novo; ninguém vem — o corpo vai ao balcão e se serve da prateleira, pago
//  c7 um save no meio do pedido: o pedido volta, buscado de novo, servido e pago uma vez só
//  c8 o mundo sem o corpo: nenhuma entrada do corpo nas mesas, e o mesmo mundo dos fregueses — e o verificador limpo em tudo
//   node qa/taverna-corpo.js [mundo]          (≈ 1–2 min; ONLY=c1,c2 para algumas)
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
const calm = () => { const w = S().weather; w.rain = 0; if (w.storm) w.storm = 0; if (!(S().divinePeace > G.DAY_LEN * 0.5)) god(() => G.Politics.divinePeace()); for (const s of S().settlements.values()) { if (s.alarmT > 0) s.alarmT = 0; } };
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
function seatIn(b, v) {
  const p = G.Space.planNow(b); if (!p || !p.entrance) return { why: 'sem planta' };
  const lv = p.entryLv || 0; const ex = p.entrance.x, ez = p.entrance.z;
  // (a seat at a table first — the place to eat, 'comer': the plate goes on the table before it)
  const pls = In.freeNear(b, lv, ex, ez, 40, ['sentar', 'comer']).filter(q => SEATK[q.it.kind] && In.walkIn(b, q) < Infinity).sort((a, c) => (a.use === 'comer' ? 0 : 1) - (c.use === 'comer' ? 0 : 1));
  if (!pls.length) return { why: 'nenhum assento livre' };
  const pl = pls[0]; pl.at = In.standFor(b, pl, pl.x, pl.z);
  G.Vg.endTask(v); v.path = null; if (!Po.take(v).ok) return { why: 'não encarnou' };
  v.inside = b.id; v.x = b.x + pl.at[0] / TL; v.y = b.y + pl.at[1] / TL; Po.setLevel(pl.lv); G.Avatar.attach(v, 0); for (let k = 0; k < 4; k++) frame();
  const st = G.Avatar.state(); let best = null;
  for (let k = 0; k < 60 && !(best && best.id === 'lugar'); k++) { const ya = Math.atan2(b.y * TL + pl.z - st.Z, b.x * TL + pl.x - st.X); G.Avatar.input.camYaw = ya; st.yaw = ya; best = I.best(); frame(); }
  if (!(best && best.id === 'lugar')) return { why: `o E oferece ${best ? '«' + best.label + '»' : 'nada'}`, pl };
  I.run(best); for (let k = 0; k < 150 && !(G.Avatar.seatNow() && G.Avatar.seatNow().k >= 1); k++) frame();
  const u = Po.useOf(); return { ok: !!u && u.b === b.id, pl, kind: pl.it.kind, label: best.label };
}
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
    ok('c2 entregue e pago à mesa, uma vez; o prato na mesa diante do corpo', paid === 1 && Math.abs(coin0 - coin1 - T.PRICE.food) < 1e-6 && !!onTable && !!onTable.prato,
      `pago ${paid}× (${(coin0 - coin1).toFixed(2)}); na mesa: ${onTable ? JSON.stringify({ prato: onTable.prato, cup: onTable.cup }) : 'nada'}`);
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
    const W = G.Atmos.within(B()); const q = W.mesa.find(x => x.id === v.id);
    ok('c3 a caneca na mão, três goles, o efeito no último, a caneca deixada na mesa', !!res && res.ok && /^caneca\./.test(cup) && n === T.SIPS && last && last.last && (v.drinks || 0) === d0 + 1 && mine().r === 1 && !!q && !!q.cup,
      `«${it ? it.nome : '-'}»: na mão ${cup || 'nada'}; ${n} goles; bebidas ${d0} → ${v.drinks || 0}; na mesa: ${q ? q.cup : 'nada'}`);
    watch(); ok('c3 o verificador limpo', !bad.length, bad.join(' | ') || 'nada');
  }
}

// ---------------- c4 up from the seat before the order comes ----------------
if (on('c4')) {
  fresh(); bad.length = 0; const r = toMenu(); const v = Po.body(); const kp = T.keeperOf(B());
  if (r.fail || !r.got) ok('c4 levanta antes', false, r.why || 'o cardápio não abriu');
  else {
    const op = OP().id; const t1 = S().clock; const { it } = order(x => x.sort === 'beber');
    until(() => kp.task && kp.task.type === 'atender' && kp.task.st === 13 && !!kp.carry, 90); const had = !!kp.carry;
    // (up: the player walks)
    G.Avatar.input.mz = 1; frame(); G.Avatar.input.mz = 0; for (let k = 0; k < 20; k++) frame();
    const gone = until(() => !mine() && !(kp.carry && kp.carry.op === op), 60);
    const back = seen.filter(e => e.t >= t1 && e.c === 'taverna-volta' && e.from === 'v:' + kp.id).length;
    ok('c4 o corpo levanta antes de o pedido chegar: desfeito, nada pago, a caneca de volta à prateleira', had && gone && paidBy(v, op, t1) === 0 && back >= 1 && !v.carry,
      `${it ? it.nome : '-'}: nas mãos dele ${had ? 'sim' : 'não'}; a entrada ${mine() ? 'ainda' : 'desfeita'}; pago ${paidBy(v, op, t1)}×; de volta à prateleira ${back}×`);
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
    until(() => kp.task && kp.task.type === 'atender' && kp.task.st >= 12, 60);
    // (the test's hand, as taverna-vida v3: the keeper dies with the cup in his hands — a town of this world may have no jail, T-1820)
    god(() => G.Village.kill(kp, 'teste', true));
    until(() => mine() && mine().so > 0, 40); const m = mine();
    ok('c6 o taverneiro morre no meio: o pedido chamado de novo, e ninguém vem — o corpo é mandado ao balcão', !!m && !m.srv && m.so > 0 && !S().villagers.has(kp.id), `${kp.name} ${S().villagers.has(kp.id) ? 'vivo' : 'morto'}; a entrada: ${m ? m.cv + ' srv ' + m.srv + ' so ' + m.so : 'nada'}`);
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
