// lugares: o repartidor dos lugares de dentro (Interiors.places, D-085) provado em Node, sem mundo: prédios e pessoas
// montados à mão sobre o código do jogo (M.load) — quem está dentro de um prédio com planta tem um lugar dele, e cada lugar
// é de uma pessoa (a regra 29 do guard: só o interiors.js reparte):
//   1. a casa à noite: o casal na cama de casal, lado a lado; os filhos nas suas camas; todos deitados ao comprido da peça,
//      a cabeça na cabeceira (L-284); nenhum ponto de duas pessoas
//   2. a casa cheia: quem sobra dorme no chão, deitado num canto livre — nunca de pé, nunca sobre um móvel, nunca dois no
//      mesmo chão (o L-228 do P1)
//   3. de dia: quem chega em casa senta; os outros ao fogo; um lugar cada um; quem sobra de pé, cada um no seu chão
//   4. a regra da casa (In.placeRule) e a das camas (In.bedRule), como o P1 as registra: comer à mesa, cozinhar ao fogo (o
//      desejo mais urgente primeiro: pri), o bebê no colo da mãe (with), o par na cama de casal, o hóspede no chão por escolha
//   5. o trabalho: cada oficial no ponto do uso que a tarefa diz (t.use, t.item); o terceiro sem torno, de pé; a taverna — o
//      taverneiro no balcão, os fregueses nos assentos, o resto de pé
//   6. a cadeia: um preso por cela, sentado na palha; dormindo, deitado nela
//   7. o corpo: o lugar que as mãos tomaram (S.avatar.use) é dele; ninguém o recebe, nem o ponto onde ele está de pé
//   8. o mesmo mundo, a mesma resposta: duas vezes, dentro e fora do passo; o lugar livre (In.freePlace); a altura da raiz
//      (In.rootY): deitado no colchão, sentado com os pés no chão
//   9. o caminho da porta ao lugar: os metros (In.walkIn, guardados com os lugares) e os pontos (In.pathIn), pelo lance
//  10. os lugares do corpo (o verbo 'lugar', fase C): acordado, nenhum lugar que a regra dê (só as mãos tomam um, L-286);
//      dormindo, a própria cama; os livres em volta de um ponto (In.freeNear: nunca o de alguém, o mais perto primeiro; sobe-se
//      de onde o corpo inteiro fica, In.standFor); na hora de tomar, livre (In.freeFor); tomado, dele e de mais ninguém
//   node qa/lugares.js
const M = require('./nodemundo.js');
const G = M.load({});
const In = G.Interiors;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | lugares ${name} | ${info}`); if (!c) fails.push(name); };
// (a world of nothing but the buildings and the people put in it here)
G.S = { villagers: new Map(), buildings: new Map(), dead: new Map(), settlements: new Map(), clock: 100, day: 3, time: 0.9, avatar: null, nextId: 1000, history: [], fire: new Float32Array(G.N * G.N) };
let nid = 1;
const ctx = { k: 'ae', cl: 't', fl: 0, d: 1, w: 2, e: 3 };
const rec = (type, c, f, s) => ({ v: 3, f, r: 0, t: type, u: In.TYPES[type].use, s: s || 'S', o: 0, c, e: ctx.e, k: ctx.k, cl: ctx.cl, fl: ctx.fl, d: ctx.d, w: ctx.w, pw: 0, h: [], m: 0, fx: [], dr: {}, hh: 0, nm: 0, vz: 0, ab: 0 });
const building = (type, c, f, x, y, s) => { const def = G.BDEF[type]; const b = { id: nid++, type, x, y, w: def.w, h: def.h, built: true, blocks: true, hp: 100, maxHp: 100, set: 0 }; b.ip = rec(type, c, f, s); G.S.buildings.set(b.id, b); return b; };
const person = (o) => { const v = Object.assign({ id: nid++, name: 'P' + nid, g: 'm', age: 30, home: 0, inside: 0, sleeping: false, partner: 0, task: null, job: 0, jail: 0, sick: 0, x: 0, y: 0 }, o); G.S.villagers.set(v.id, v); return v; };
const reset = () => { G.S.villagers.clear(); G.S.avatar = null; G.S.clock += 1; In.placeRule('casa', null); In.placeRule('taverna', null); In.bedRule(null); };
// (the first family of a type and people whose plan has what the case needs)
// (a family of the type and people whose plan, on the building's own id — the id given, as each case's building takes the
// next —, has what the case needs: the families tried in their order, the ids of a few buildings each)
const famWith = (type, c, need, side) => { for (let k = 0; k < 12; k++) for (const f of In.TYPES[type].fams) { const b = { id: nid + k * 7, type, x: 5, y: 5, w: G.BDEF[type].w, h: G.BDEF[type].h }; const p = In.make(b, rec(type, c, f, side)); if (p.ok && p.fam === f && need(p)) { nid += k * 7; return f; } } return null; };
// the checks every case makes of its answer: one person a point, every place a place
const BN = In.ITEMS;
function sound(b, P, tag) {
  const out = []; const p = In.plan(b); const pts = [...P.by.entries()];
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const [ia, a] = pts[i], [ib, c] = pts[j]; if (a.lv !== c.lv) continue;
    if (a.it && c.it && a.item === c.item && a.q === c.q) out.push(`${tag}: #${ia} e #${ib} no mesmo ponto (${a.item}:${a.q})`);
    else if (Math.hypot(a.x - c.x, a.z - c.z) < 0.3 && !(a.it && c.it && a.item === c.item)) out.push(`${tag}: #${ia} e #${ib} a ${Math.hypot(a.x - c.x, a.z - c.z).toFixed(2)} m`);
  }
  for (const [id, pl] of pts) {
    if (pl.it) { const sp = pl.it.spots[pl.q]; if (!sp || sp.use !== pl.use) out.push(`${tag}: #${id} num ponto que não é da peça`); }
    else if (pl.use === 'de-pe' && !In.standsAt(p, pl.lv, pl.x, pl.z, 0.25)) out.push(`${tag}: #${id} de pé onde não se fica`);
    else if (pl.use === 'chao') { const L = In.table(b).lie.find(f => Math.abs(f.x - pl.x) < 1e-6 && Math.abs(f.z - pl.z) < 1e-6); if (!L) out.push(`${tag}: #${id} deitado fora de um chão livre`); }
  }
  return out;
}
const lying = pl => pl && (pl.st === 'sleep' || pl.st === 'sick') && pl.pose === 'deitado';

// ---------------------------------------------------------------- 1. the house at night
{
  reset();
  const f = famWith('house', 'grego', p => p.items.some(i => i.kind === 'cama-casal') && p.cap.places >= 6);
  const b = building('house', 'grego', f, 10, 10, 'S');
  const dad = person({ g: 'm', age: 40, home: b.id, inside: b.id, sleeping: true }), mom = person({ g: 'f', age: 38, home: b.id, inside: b.id, sleeping: true });
  dad.partner = mom.id; mom.partner = dad.id;
  const kids = [12, 9, 6, 3].map(a => person({ age: a, home: b.id, inside: b.id, sleeping: true }));
  const P = In.places(b); const bad = sound(b, P, 'noite');
  const dp = P.by.get(dad.id), mp = P.by.get(mom.id);
  const couple = !!(dp && mp && dp.it && mp.it && dp.item === mp.item && In.ITEMS[dp.it.kind].places === 2);
  const allLie = [dad, mom, ...kids].every(v => lying(P.by.get(v.id)));
  // (along the piece: the one lying faces its foot — the piece's front — or, turned against the wall, along it)
  const along = pl => { const it = pl.it; const fa = [Math.sin(it.ry), Math.cos(it.ry)], fp = [Math.sin(pl.ry), Math.cos(pl.ry)]; const turned = it.w > it.d + 1e-6; const dot = fa[0] * fp[0] + fa[1] * fp[1]; return turned ? Math.abs(dot) < 0.05 : dot > 0.95; };
  const wrong = [dad, mom, ...kids].map(v => P.by.get(v.id)).filter(pl => pl && pl.it && !along(pl));
  ok('1 a casa à noite', !bad.length && couple && allLie && !wrong.length, `${f}: ${P.by.size} de 6 com lugar; o casal ${couple ? 'na mesma cama de casal' : 'SEPARADO'}; todos deitados: ${allLie}; ${wrong.length} virados contra a peça; ${bad.slice(0, 3).join(' · ') || 'um ponto por pessoa'}`);
}
// ---------------------------------------------------------------- 2. the house too full: the floor, lying
{
  reset();
  const f = famWith('hut', 'grego', p => p.cap.places >= 3 && p.cap.places <= 4);
  const b = building('hut', 'grego', f, 20, 10, 'S'); const places = In.plan(b).cap.places;
  const ppl = []; for (let k = 0; k < places + 3; k++) ppl.push(person({ age: 20 + k, home: b.id, inside: b.id, sleeping: true }));
  const P = In.places(b); const bad = sound(b, P, 'cheia');
  const onFloor = ppl.map(v => P.by.get(v.id)).filter(pl => pl && pl.use === 'chao');
  const standing = ppl.map(v => P.by.get(v.id)).filter(pl => pl && pl.pose !== 'deitado');
  const R = onFloor.map(pl => In.table(b).lie.find(q => Math.abs(q.x - pl.x) < 1e-6 && Math.abs(q.z - pl.z) < 1e-6)).filter(Boolean);
  let overlap = 0; for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) if (R[i].lv === R[j].lv && In.ov(R[i].R, R[j].R)) overlap++;
  ok('2 a casa cheia: o chão, deitado', !bad.length && !standing.length && !overlap, `${f}: ${places} camas, ${ppl.length} pessoas: ${ppl.length - onFloor.length} nas camas, ${onFloor.length} no chão deitadas (sem lugar: ${ppl.filter(v => !P.by.has(v.id)).length}); de pé: ${standing.length}; chãos sobrepostos: ${overlap}; ${bad.slice(0, 2).join(' · ') || 'um ponto por pessoa'}`);
}
// ---------------------------------------------------------------- 3. by day, no rule: seats, the fire, the floor
{
  reset();
  const f = famWith('house', 'romano', p => p.items.some(i => i.kind === 'mesa') && p.items.some(i => i.fire), 'E');
  const b = building('house', 'romano', f, 30, 10, 'E');
  const home = person({ age: 33, home: b.id, inside: b.id, task: { type: 'goHome' } });
  const rest = [1, 2, 3, 4, 5, 6, 7].map(k => person({ age: 20 + k, home: b.id, inside: b.id, task: { type: 'rest' } }));
  const P = In.places(b); const bad = sound(b, P, 'dia');
  const hp = P.by.get(home.id); const seated = hp && (hp.use === 'sentar' || hp.use === 'comer');
  const all = [home, ...rest].every(v => P.by.has(v.id));
  ok('3 de dia: assento, fogo, chão', !bad.length && seated && all, `${f}: quem chega em casa ${seated ? 'senta (' + hp.use + ')' : 'NÃO senta'}; os outros: ${rest.map(v => (P.by.get(v.id) || {}).use || '—').join(', ')}; ${bad.slice(0, 2).join(' · ') || 'um ponto por pessoa'}`);
}
// ---------------------------------------------------------------- 4. the household's rules (as P1 registers them)
{
  reset();
  // (a house with a double bed, a seat one sits at and a fire one cooks at: of the peoples, the first that has one)
  const okAt = (p, i, uses) => i.spots.some(sp => uses.includes(sp.use) && !sp.on && In.fitStand(p, i.lv, sp.x, sp.z, i.r));
  let c4 = null, f = null; for (const c of ['grego', 'romano', 'egipcio', 'classico', 'asteca']) { f = famWith('house', c, p => p.items.some(i => i.kind === 'cama-casal') && p.items.some(i => okAt(p, i, ['comer', 'sentar'])) && p.items.some(i => i.fire && okAt(p, i, ['cozinhar', 'assar'])), 'N'); if (f) { c4 = c; break; } }
  const b = building('house', c4 || 'grego', f, 40, 10, 'N');
  const mom = person({ g: 'f', age: 30, home: b.id, inside: b.id }), baby = person({ age: 1, home: b.id, inside: b.id }), dad = person({ age: 32, home: b.id, inside: b.id });
  const cook = person({ g: 'f', age: 50, home: b.id, inside: b.id }), eaters = [1, 2, 3, 4].map(k => person({ age: 10 + k, home: b.id, inside: b.id }));
  mom.partner = dad.id; dad.partner = mom.id;
  const WANT = new Map([[mom.id, { use: ['sentar', 'comer'], st: 'rock' }], [baby.id, { with: mom.id }], [cook.id, { use: ['cozinhar', 'assar', 'aquecer'], st: 'cook', pri: 2 }], [dad.id, { use: ['comer', 'sentar'], st: 'eat' }]]);
  for (const v of eaters) WANT.set(v.id, { use: ['comer', 'sentar'], st: 'eat' });
  In.placeRule('casa', (bb, v) => WANT.get(v.id) || null);
  let P = In.places(b); const bad = sound(b, P, 'regra');
  const bp = In.placeOf(baby); const withOk = P.with.get(baby.id) === mom.id && bp && P.by.get(mom.id) && bp.x === P.by.get(mom.id).x;
  const cp = P.by.get(cook.id); const cooking = cp && cp.it && cp.it.fire && cp.st === 'cook';
  const mp = P.by.get(mom.id); const rock = mp && (mp.it ? mp.st === 'rock' : mp.st === 'rockg'); // (on a seat, or on the ground where there is none)
  if (process.env.VERB) { const T = In.table(b); console.log('  pontos:', T.spots.map(e => `${e.it.kind}.${e.use}${e.ok ? '' : '(não)'} ${e.x},${e.z}`).join(' | ')); for (const [id, pl] of P.by) console.log('  #' + id, pl.use, pl.it ? pl.it.kind : '', pl.x, pl.z, pl.st); }
  const atTable = [dad, ...eaters].map(v => P.by.get(v.id)).filter(pl => pl && pl.use === 'comer').length;
  const floorEat = [dad, ...eaters].map(v => P.by.get(v.id)).filter(pl => pl && pl.use === 'de-pe');
  const sitting = floorEat.every(pl => pl.st === 'eatg');
  ok('4a a regra da casa', !bad.length && withOk && cooking && rock && sitting, `${c4}/${f}: o bebê no colo da mãe: ${withOk}; a avó ao fogo (${cp ? (cp.it ? cp.it.kind : cp.use) + ', ' + cp.st : '—'}); a mãe ninando: ${rock}; ${atTable} à mesa, ${floorEat.length} sem lugar à mesa sentados no chão: ${sitting}; ${bad.slice(0, 2).join(' · ') || 'um ponto por pessoa'}`);
  // (the beds by the household's rule: the order, the pair, the child with its mother, the guest on the floor by choice)
  reset();
  const m2 = person({ g: 'f', age: 30, home: b.id, inside: b.id, sleeping: true }), d2 = person({ age: 31, home: b.id, inside: b.id, sleeping: true }), k2 = person({ age: 1, home: b.id, inside: b.id, sleeping: true }), g2 = person({ age: 44, home: 0, inside: b.id, sleeping: true });
  In.bedRule((bb, ppl) => ({ order: [m2.id, d2.id, k2.id, g2.id].filter(id => ppl.some(v => v.id === id)), pair: new Map([[m2.id, d2.id], [d2.id, m2.id]]), with: new Map([[k2.id, m2.id]]), crib: new Set([k2.id]), floor: new Set([g2.id]) }));
  P = In.places(b); const bad2 = sound(b, P, 'camas');
  const pm = P.by.get(m2.id), pd = P.by.get(d2.id), pg = P.by.get(g2.id);
  const pairOk = !!(pm && pd && pm.it && pd.it && pm.item === pd.item && In.ITEMS[pm.it.kind].places === 2);
  const babyOk = P.with.get(k2.id) === m2.id; // (no cradle in this plan: the child with its mother)
  const guestOk = pg && pg.use === 'chao' && lying(pg);
  ok('4b a regra das camas', !bad2.length && pairOk && babyOk && guestOk, `o par na cama de casal: ${pairOk}; o bebê (sem berço) com a mãe: ${babyOk}; o hóspede no chão, deitado: ${guestOk}; ${bad2.slice(0, 2).join(' · ') || 'um ponto por pessoa'}`);
}
// ---------------------------------------------------------------- 5. work: the trade's places by the task; the tavern
{
  reset();
  const f = famWith('olaria', 'grego', p => p.items.filter(i => i.kind === 'roda-oleiro').length >= 2);
  const b = building('olaria', 'grego', f, 50, 10, 'S');
  // (t.st is the task's step — a number, 2 or 3 inside —, never the 3D's state; t.pose is, where the gesture is not the use's)
  const ws = [1, 2, 3].map(k => person({ age: 25 + k, inside: b.id, job: b.id, task: { type: 'oficio', b: b.id, use: 'tornear', st: 2 } }));
  const kiln = person({ age: 40, inside: b.id, job: b.id, task: { type: 'oficio', b: b.id, use: 'cozer', st: 3, pose: 'low' } });
  const P = In.places(b); const bad = sound(b, P, 'olaria');
  const at = ws.map(v => P.by.get(v.id)); const wheels = at.filter(pl => pl && pl.use === 'tornear').map(pl => pl.item);
  const kp = P.by.get(kiln.id); const sts = at.filter(pl => pl && pl.use === 'tornear').map(pl => pl.st);
  // (the third, with no wheel free: at another station of the trade — the bench where the clay is worked — or standing)
  const third = at.find(pl => pl && pl.use !== 'tornear');
  ok('5a os ofícios pelo uso da tarefa', !bad.length && new Set(wheels).size === 2 && wheels.length === 2 && third && (third.use === 'de-pe' || (third.it && third.it.job)) && kp && kp.use === 'cozer' && kp.st === 'low' && sts.every(x => typeof x === 'string'), `${f}: tornos ${wheels.join(', ')} (dois oficiais, cada um no seu, no estado ${sts.join(', ')} — o passo da tarefa não é estado); o terceiro ${third ? third.use + (third.it ? ' em ' + third.it.kind : '') : '—'}; o forno ${kp ? kp.it.kind : '—'} (t.pose ${kp ? kp.st : '—'}); ${bad.slice(0, 2).join(' · ') || 'um ponto por pessoa'}`);
  // (and the piece the task names: t.item)
  reset();
  const wheel2 = In.plan(b).items.filter(i => i.kind === 'roda-oleiro')[1].id;
  const w1 = person({ age: 30, inside: b.id, job: b.id, task: { type: 'oficio', b: b.id, use: 'tornear', item: wheel2 } });
  const P2 = In.places(b); ok('5b a peça que a tarefa nomeia', (P2.by.get(w1.id) || {}).item === wheel2, `t.item ${wheel2} → ${(P2.by.get(w1.id) || {}).item}`);
  reset();
  const ft = famWith('taverna', 'romano', p => p.items.some(i => i.kind === 'balcao') && p.items.filter(i => i.kind === 'mesa').length >= 2);
  const bt = building('taverna', 'romano', ft, 60, 10, 'S');
  const keeper = person({ age: 45, inside: bt.id, job: bt.id, task: { type: 'tavern', id: bt.id } });
  const clients = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(k => person({ age: 20 + k, inside: bt.id, task: { type: 'tavern', id: bt.id, st: 1 } }));
  const P3 = In.places(bt); const bad3 = sound(bt, P3, 'taverna');
  const kp2 = P3.by.get(keeper.id); const seats = clients.map(v => P3.by.get(v.id)).filter(pl => pl && (pl.use === 'sentar' || pl.use === 'comer')).length;
  ok('5c a taverna', !bad3.length && kp2 && kp2.it && kp2.it.job && clients.every(v => P3.by.has(v.id)), `${ft}: o taverneiro em ${kp2 && kp2.it ? kp2.it.kind + ' (' + kp2.use + ')' : '—'}; ${seats} fregueses sentados, ${clients.length - seats} de pé; ${bad3.slice(0, 2).join(' · ') || 'um ponto por pessoa'}`);
}
// ---------------------------------------------------------------- 6. the jail
{
  reset();
  const f = famWith('cadeia', 'romano', p => p.rooms.filter(m => m.fn === 'cela').length >= 4);
  const b = building('cadeia', 'romano', f, 70, 10, 'S');
  const ps = [1, 2, 3, 4].map(k => person({ age: 20 + k, inside: b.id, jail: b.id, sleeping: k === 4 }));
  const P = In.places(b); const bad = sound(b, P, 'cadeia'); const cs = In.cells(b);
  const cells = ps.map(v => { const pl = P.by.get(v.id); return pl ? cs.findIndex(c => c.bed === pl.item) : -1; });
  const sat = ps.slice(0, 3).every(v => (P.by.get(v.id) || {}).st === 'rest'), slept = lying(P.by.get(ps[3].id));
  ok('6 a cadeia', !bad.length && new Set(cells).size === 4 && !cells.includes(-1) && sat && slept, `${f}: celas ${cells.join(', ')} (um preso em cada); acordados sentados na palha: ${sat}; o que dorme, deitado: ${slept}`);
}
// ---------------------------------------------------------------- 7. the body's place
{
  reset();
  const f = famWith('taverna', 'romano', p => p.items.filter(i => i.spots.some(s => s.use === 'sentar')).length >= 2);
  const b = building('taverna', 'romano', f, 80, 10, 'S');
  const T = In.table(b); const seat = T.byUse.get('sentar')[0];
  const me = person({ age: 30, inside: b.id, x: b.x + 1, y: b.y + 1 });
  G.S.avatar = { id: me.id, lv: 0, use: { b: b.id, it: seat.it.id, q: seat.q, use: 'sentar', st: 'sit', key: In.keyOf(b) } };
  const others = [1, 2, 3, 4, 5, 6, 7, 8].map(k => person({ age: 20 + k, inside: b.id, task: { type: 'tavern', id: b.id } }));
  const P = In.places(b); const bad = sound(b, P, 'corpo');
  const mine = P.by.get(me.id); const stolen = others.some(v => { const pl = P.by.get(v.id); return pl && pl.item === seat.it.id && pl.q === seat.q; });
  // (standing in the house without a place: where the body stands is nobody's — the floor half a metre round it, of a piece's
  // places the one under its feet: it never puts off who sits beside it, L-286)
  G.S.avatar.use = null; G.S.clock += 1;
  const P2 = In.places(b); const X = (me.x - b.x) * 4, Z = (me.y - b.y) * 4;
  const near = others.filter(v => { const pl = P2.by.get(v.id); return pl && pl.lv === 0 && Math.hypot(pl.x - X, pl.z - Z) < (pl.it ? 0.25 : 0.5); });
  ok('7 o lugar do corpo', !bad.length && mine && mine.item === seat.it.id && !stolen && !near.length, `o corpo no ${seat.it.kind} que as mãos tomaram: ${!!mine && mine.item === seat.it.id}; alguém no lugar dele: ${stolen}; de pé, alguém sobre o ponto onde ele está: ${near.length}`);
}
// ---------------------------------------------------------------- 8. the same world, the same answer; freePlace; rootY
{
  reset();
  const f = famWith('house', 'nordico', p => p.cap.places >= 6 && p.items.some(i => i.spots.some(q => q.use === 'sentar' || q.use === 'comer')), 'W');
  const b = building('house', 'nordico', f, 90, 10, 'W');
  for (let k = 0; k < 6; k++) person({ age: 10 + k * 7, home: b.id, inside: b.id, sleeping: k % 2 === 0, task: k % 3 === 0 ? { type: 'goHome' } : null });
  const key = P => JSON.stringify([...P.by.entries()].map(([id, pl]) => [id, pl.item, pl.q, pl.x, pl.z, pl.st]));
  const a = key(In.places(b)); G.S.clock += 1; const c = key(In.places(b));
  G.inSim++; const d = key(In.places(b)); G.inSim--;
  ok('8a a mesma resposta', a === c && c === d, `fora do passo duas vezes e dentro do passo: ${a === c && c === d ? 'iguais' : 'DIFERENTES'}`);
  // (freePlace: what one more would have — never a point taken, null when there is none): a house whose seats are free while
  // its people sleep, then filled one by one by who comes home
  reset();
  const fs = famWith('house', 'romano', p => p.items.filter(i => i.spots.some(q => (q.use === 'sentar' || q.use === 'comer') && !q.on && In.fitStand(p, i.lv, q.x, q.z, i.r))).length >= 1, 'S');
  const bs = building('house', 'romano', fs, 95, 10, 'S');
  // (as many asleep as the house has beds, up to four: one more, lying on the floor by the table, would keep its seat — rightly)
  for (let k = 0; k < Math.min(4, In.plan(bs).cap.places); k++) person({ age: 20 + k, home: bs.id, inside: bs.id, sleeping: true });
  const seats = In.table(bs).spots.filter(e => e.ok && (e.use === 'sentar' || e.use === 'comer')).length;
  const fp = In.freePlace(bs, ['sentar', 'comer']); const P = In.places(bs);
  const takenNow = fp && [...P.by.values()].some(pl => pl.it && pl.item === fp.item && pl.q === fp.q);
  let n = 0; while (In.freePlace(bs, ['sentar', 'comer']) && n < 40) { person({ age: 30, home: bs.id, inside: bs.id, task: { type: 'goHome' } }); G.S.clock += 1; n++; }
  const P2 = In.places(bs); const seated = [...P2.by.values()].filter(pl => pl.use === 'sentar' || pl.use === 'comer').length;
  ok('8b o lugar livre', fp && !takenNow && seated === n && n >= 1, `${fs}: ${seats} assentos; um a mais senta em ${fp ? fp.it.kind : '—'} (ocupado: ${!!takenNow}); ${n} chegaram até não haver lugar, ${seated} sentados`);
  // (the root: lying on the mattress; seated, the feet on the floor and the hips on the seat)
  const bed = { kind: 'cama' }, bench = { kind: 'banco' }, mat = { kind: 'esteira' };
  const y1 = In.rootY(bed, { on: 1 }, 'sleep'), y2 = In.rootY(bench, { on: 1 }, 'sit'), y3 = In.rootY(mat, { on: 1 }, 'sleep'), y4 = In.rootY(bed, { on: 0 }, 'idle');
  ok('8c a altura da raiz', y1 === 0.5 && y2 === 0 && Math.abs(y3 - 0.06) < 1e-9 && y4 === 0, `deitado na cama ${y1} m (o colchão), sentado no banco ${y2} m (os pés no chão, a bacia a ${In.SIT_H} m), na esteira ${y3} m, de pé ${y4} m`);
}
// ---------------------------------------------------------------- 9. the way from the door to the place
{
  reset();
  const f = famWith('house', 'grego', p => p.levels.length >= 2 && p.items.some(i => i.lv >= 1 && i.places > 0) && p.items.some(i => i.lv === 0 && i.spots.some(q => (q.use === 'sentar' || q.use === 'comer' || q.use === 'cozinhar') && !q.on && In.fitStand(p, i.lv, q.x, q.z, i.r))), 'S');
  const b = building('house', 'grego', f, 100, 10, 'S');
  // (sleepers until one sleeps on a storey that is not the door's — the beds go out in the household's order)
  const pln = In.plan(b); const e = pln.entrance; const lvIn = e.lv || 0;
  const ups = [1, 2, 3, 4, 5, 6].map(k => person({ age: 20 + k, home: b.id, inside: b.id, sleeping: true })), down = person({ age: 31, home: b.id, inside: b.id, task: { type: 'goHome' } });
  const P = In.places(b); const up = ups.find(v => { const q = P.by.get(v.id); return q && q.lv !== lvIn; }) || ups[0]; const pu = P.by.get(up.id), pd = P.by.get(down.id);
  const wu = In.walkIn(b, pu), wd = In.walkIn(b, pd); const ru = In.pathIn(b, pu), rd = In.pathIn(b, pd);
  const shape = r => r && r.pts.length >= 2 && Math.hypot(r.pts[0][0] - e.x, r.pts[0][1] - e.z) < 1e-6;
  const ends = (r, pl) => r && Math.hypot(r.pts[r.pts.length - 1][0] - pl.x, r.pts[r.pts.length - 1][1] - pl.z) < 1e-6 && r.pts[r.pts.length - 1][2] === pl.lv;
  const storeys = ru ? new Set(ru.pts.map(q => q[2])).size : 0;
  ok('9 o caminho da porta ao lugar', pu && pd && pu.lv !== lvIn && wu > wd && wu < Infinity && shape(ru) && shape(rd) && ends(ru, pu) && ends(rd, pd) && storeys >= 2 && Math.abs(ru.len - wu) < 1.5, `${f}: à cama no piso ${pu ? pu.lv : '—'}, ${wu.toFixed(1)} m pelo walkIn e ${ru ? ru.len : '—'} m pelo pathIn (${ru ? ru.pts.length : 0} pontos, ${storeys} pisos); ao ${pd ? pd.use : '—'} embaixo, ${wd.toFixed(1)} m`);
}
// ---------------------------------------------------------------- 10. the body's places (the verb 'lugar', phase C)
{
  // (a: awake and standing, the body is at no place the rules give — only its hands take one, L-286 —, and its point is
  // nobody's; asleep in its own house, in its own bed — In.bedOf, where its controller lays it)
  reset();
  const f = famWith('house', 'romano', p => p.cap.places >= 4 && p.items.filter(i => i.spots.some(q => q.use === 'sentar' || q.use === 'comer')).length >= 1, 'S');
  const b = building('house', 'romano', f, 110, 10, 'S');
  const me = person({ age: 30, home: b.id, inside: b.id, x: b.x + 1, y: b.y + 1 }); G.S.avatar = { id: me.id, lv: 0, use: null };
  const back = [1, 2].map(k => person({ age: 20 + k, home: b.id, inside: b.id, task: { type: 'goHome' } }));
  const P = In.places(b); const mine = P.by.get(me.id); const sat = back.filter(v => P.by.get(v.id)).length;
  me.sleeping = true; for (const v of back) v.sleeping = true; G.S.clock += 1;
  const P2 = In.places(b); const bd = In.bedOf(me); const inBed = P2.by.get(me.id);
  ok('10a o corpo acordado não tem lugar que a regra dê; dormindo, a própria cama', !mine && sat === 2 && bd && inBed && inBed.item === bd.item.id && !sound(b, P2, 'corpo dormindo').length, `${f}: acordado, o corpo num lugar da regra: ${mine ? mine.use + ' em ' + mine.item : 'nenhum'} (os outros ${sat} de 2 nos seus); dormindo, na cama da casa (In.bedOf): ${!!(inBed && bd && inBed.item === bd.item.id)}`);
}
{
  // (b: the places free for the body about a point — In.freeNear —: never one someone holds, nor one a stride from where
  // someone is (the share-out's own test), the nearest first, each usable; where one gets onto a place on a piece, a point of
  // the piece where a body stands. The body at the way in, where its point is no place's)
  reset();
  const f = famWith('taverna', 'romano', p => p.items.filter(i => i.spots.some(s => s.use === 'sentar')).length >= 2);
  const b = building('taverna', 'romano', f, 120, 10, 'S'); const p = In.plan(b); const T = In.table(b);
  const seat = T.byUse.get('sentar')[0]; const en = T.entry;
  const me = person({ age: 30, inside: b.id, x: b.x + en.x / 4, y: b.y + en.z / 4 }); G.S.avatar = { id: me.id, lv: en.lv, use: null };
  const others = [1, 2, 3, 4, 5].map(k => person({ age: 20 + k, inside: b.id, task: { type: 'tavern', id: b.id } }));
  const P = In.places(b); const held = [...P.by.entries()].filter(([id]) => id !== me.id).map(([, pl]) => pl);
  const near = In.freeNear(b, 0, seat.x, seat.z, 9);
  const clash = near.filter(pl => held.some(h => h.lv === pl.lv && ((h.it && h.item === pl.item && h.q === pl.q) || (Math.hypot(h.x - pl.x, h.z - pl.z) < 0.5 && !(pl.on && h.it && h.item === pl.item)))));
  const order = near.every((pl, k) => !k || near[k - 1].d <= pl.d + 1e-9);
  // (where one gets onto each: a point the body's whole rim stands on — In.standFor, BODY.r)
  const atBad = near.filter(pl => { const at = In.standFor(b, pl, seat.x, seat.z); return !at || !In.standsAt(p, pl.lv, at[0], at[1], In.BODY.r); });
  ok('10b os lugares livres do corpo (In.freeNear)', near.length >= 1 && !clash.length && order && !atBad.length && others.every(v => P.by.get(v.id)), `${f}: ${near.length} livres em 9 m (de ${T.spots.filter(e => e.ok).length} lugares, ${held.length} ocupados); sobre alguém: ${clash.length}; em ordem: ${order}; subir de onde não se fica: ${atBad.length}`);
  // (c: freeFor, asked again at the take: a place someone holds is not free; one nobody holds is; placeFor, the body's own
  // held one, whatever is round it; and once taken — S.avatar.use —, the place is the body's, and nobody else's)
  const h0 = held.find(h => h.it); const fr = near[0];
  const no = h0 ? In.freeFor(b, h0.item, h0.q) : null, yes = fr ? In.freeFor(b, fr.item, fr.q) : null, own = fr ? In.placeFor(b, fr.item, fr.q) : null;
  G.S.avatar.use = fr ? { b: b.id, it: fr.item, q: fr.q, use: fr.use, st: fr.st, key: In.keyOf(b) } : null; G.S.clock += 1;
  const P3 = In.places(b); const got = P3.by.get(me.id); const twice = [...P3.by.entries()].some(([id, pl]) => id !== me.id && pl.item === fr.item && pl.q === fr.q);
  ok('10c o lugar tomado: livre na hora de tomar, do corpo depois (In.freeFor, In.placeFor)', h0 && !no && yes && own && got && got.item === fr.item && got.q === fr.q && !twice && !sound(b, P3, 'corpo sentado').length, `o de outro livre: ${!!no}; o livre: ${!!yes}; o do corpo: ${!!own}; tomado, é dele: ${!!(got && got.item === fr.item)}; outro no mesmo: ${twice}`);
}
console.log(Object.keys(G.modErr).length ? `FALHOU: erro de módulo ${JSON.stringify(G.modErr)}` : '');
console.log(fails.length ? `FALHOU: ${fails.length} (${fails.join(', ')})` : 'PASSOU');
process.exit(fails.length || Object.keys(G.modErr).length ? 1 : 0);
