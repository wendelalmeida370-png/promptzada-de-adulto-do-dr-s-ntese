// porta-dentro: a tranca é do lado de dentro (D-910, D-911; L-2160, L-2161) — em Node, pelo qa/nodemundo.js, na metrópole pronta. O dono,
// encarnado, ficou trancado dentro da taverna: ela fechou à noite com ele lá dentro, a regra da hora trancou a porta e, de dentro, as
// mãos só tinham «Bater à porta». Agora quem está dentro sempre tira a tranca e abre — o corpo e as pessoas do mundo —; de fora, uma porta
// trancada só se bate; a regra da hora não tranca com alguém dentro que não é da casa; e o taverneiro avisa o corpo no fechamento.
//  p1 o corpo dentro no fechamento: sentado à mesa até a hora, o taverneiro avisa («Vamos fechar…», a fala do mundo), o dia fecha, o
//     mundo não move o corpo, a porta fica fechada (não trancada) com ele dentro; de dentro, «Abrir a porta»: abre, e o corpo sai
//  p2 o corpo dentro na tranca da guerra: o taverneiro tranca a porta com o povo escondido; de dentro, «Tirar a tranca (N pessoas
//     escondidas aqui)» — o verbo e a tela dizem o que é —; a tranca desfeita pela porta da T1 (In.doorLift), a porta aberta, o corpo
//     sai; e o taverneiro tranca de novo depois que ele saiu, com o perigo ainda à porta
//  p3 de fora, diante da porta trancada: a da guerra e a da regra da hora (uma taverna fechada e vazia, à noite): «Bater à porta» — o
//     corpo bate, e ela fica trancada
//  p4 o save no meio, com o corpo dentro: depois do fechamento, e na tranca da guerra — volta dentro, a porta como estava, e ele sai
//  p5 uma pessoa do mundo dentro de uma casa trancada: a casa da família toda em casa, à noite, trancada; com um vizinho dentro, só
//     fechada; trancada à chave, o vizinho tira a tranca por dentro e a porta abre para quem passa; de fora, sem a chave, não; o preso
//     não abre a cadeia; o templo à noite, o mesmo
//  p6 o corpo numa casa de outra família e no templo, à noite: a porta fechada com ele dentro e, de dentro, «Abrir a porta»
//  e o verificador limpo (a regra «a tranca é do lado de dentro», qa/interiores-inv.js), nenhum erro de módulo nem aviso.
//   node qa/porta-dentro.js            (≈ 2 min)        ONLY=p1,p3 node qa/porta-dentro.js
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js', 'js/people3d.js', 'js/anim-gait.js', 'js/anim-clips.js', 'js/anim-body.js', 'js/possess.js', 'js/interact.js', 'js/avatar.js', 'js/interacao-clips.js', 'js/cardapio-ui.js', 'qa/interiores-inv.js', 'qa/taverna-vida-inv.js'] });
const T = G.Taverna, In = G.Interiors, Po = G.Possess, I = G.Interact, TC = G.TavernaContexto;
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null; const on = k => !ONLY || ONLY.includes(k);
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | porta-dentro ${name} | ${info}`); if (!c) fails.push(name); };
const clock = () => { const c = process.cpuUsage(); return (c.user + c.system) / 1e6; }; const c0 = clock();
const S = () => G.S; const TL = G.Space.TILE; const RDT = 1 / 30;
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
const frame = () => { G.debug.step(RDT * G.Space.TIME); G.Avatar.frame(RDT); };
const fast = () => { G.debug.step(0.1); G.Avatar.frame(RDT); };
const IN = G.Avatar.input; const stop = () => { IN.mx = 0; IN.mz = 0; IN.run = false; };
const said = []; G.IncUI = G.IncUI || {}; G.IncUI.toast = t => { said.push(String(t)); };
// (the world's words: the keeper's call of the closing, by its key — G.Falas, the world's speech)
const calls = []; { const f0 = G.Falas.say; G.Falas.say = function (v, key) { if (v) calls.push({ id: v.id, key, t: S().clock }); return f0.apply(this, arguments); }; }
const logs = []; { const l0 = G.Village.log; G.Village.log = function (txt) { logs.push(String(txt)); return l0.apply(this, arguments); }; }
// (the night of the proof in the god's peace, with no feast of a tavern — T1's; the war of p2 is the proof's own)
const calm = () => { const w = S().weather; w.rain = 0; if (w.storm) w.storm = 0; if (!(S().divinePeace > G.DAY_LEN * 0.5)) god(() => G.Politics.divinePeace()); for (const s of S().settlements.values()) { if (s.alarmT > 0) s.alarmT = 0; } god(() => { G.mod('tf.olha', S().clock + 1e9); for (const b of S().buildings.values()) if (b.type === 'taverna' && b.festa) delete b.festa; }); };
const bad = []; const watch = () => { for (const q of QA.check().filter(q => (q.sys === 'int' && q.sev <= 2) || (q.sys === 'taverna' && q.sev <= 2))) { const m = `S${q.sev} ${q.sys}: ${q.msg}`; if (bad.length < 8 && !bad.includes(m)) bad.push(m); } };
const SEATK = { banquinho: 1, banco: 1, cadeira: 1 };
const ds = (b, id) => god(() => In.doorState(b, id)); // (the door as the world has it now — the count of who is inside made fresh)
const dstr = s => (s ? `${s.state} (${s.by})` : '-');

M.pronto('metropole'); calm();
while (S().time < 0.6) { calm(); M.viver(1); }
const taverns = () => [...S().buildings.values()].filter(b => b.type === 'taverna' && b.built && In.has(b) && T.dia(b) && T.aberta(b));
// (the body: a grown one of the tavern's people, awake and free — never of the tavern's house)
function bodyFor(b) {
  const fid = G.Village.facOfSet(b.set); const kp = T.keeperOf(b);
  return [...S().villagers.values()].filter(o => o !== kp && o.age >= 18 && o.age < 55 && !o.sleeping && !o.inside && G.Fac.idOfV(o) === fid && Po.can(o).ok && o.home !== b.id && o.job !== b.id)
    .sort((a, c) => G.dist(a.x, a.y, b.x, b.y) - G.dist(c.x, c.y, b.x, b.y) || a.id - c.id)[0] || null;
}
// (into the tavern at a free seat by the verb 'lugar' — as the taverna-corpo's c1)
function seatIn(b, v) {
  const p = G.Space.planNow(b); if (!p || !p.entrance) return { why: 'sem planta' }; const lv = p.entryLv || 0;
  const pls = In.freeNear(b, lv, p.entrance.x, p.entrance.z, 40, ['sentar', 'comer']).filter(q => SEATK[q.it.kind] && In.walkIn(b, q) < Infinity);
  if (!pls.length) return { why: 'nenhum assento livre' };
  const pl = pls[0]; pl.at = In.standFor(b, pl, pl.x, pl.z);
  if (!Po.is(v)) { G.Vg.endTask(v); v.path = null; if (!Po.take(v).ok) return { why: 'não encarnou' }; } else G.Avatar.detach();
  v.inside = b.id; v.x = b.x + pl.at[0] / TL; v.y = b.y + pl.at[1] / TL; Po.setLevel(pl.lv); G.Avatar.attach(v, 0); for (let k = 0; k < 4; k++) frame();
  const st = G.Avatar.state(); let best = null;
  for (let k = 0; k < 60 && !(best && best.id === 'lugar'); k++) { const ya = Math.atan2(b.y * TL + pl.z - st.Z, b.x * TL + pl.x - st.X); IN.camYaw = ya; st.yaw = ya; best = I.best(); frame(); }
  if (!(best && best.id === 'lugar')) return { why: `o E oferece ${best ? '«' + best.label + '»' : 'nada'}` };
  I.run(best); for (let k = 0; k < 150 && !(G.Avatar.seatNow() && G.Avatar.seatNow().k >= 1); k++) frame();
  return { ok: !!Po.useOf() };
}
// (the body put by the god's hand at a point of a building — inside at its way in, or outside before its door, between the doorstep and
// the leaf —, facing its door; the door's target as the hands see it then)
function putAt(b, v, inside) {
  const p = G.Space.planNow(b); const e = p.entrance; if (G.Avatar.seatNow()) { IN.mz = 1; frame(); stop(); for (let k = 0; k < 20; k++) frame(); }
  const w = p.walls[p.doors[e.door].wall]; const len = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1; const dX = w.a[0] + (w.b[0] - w.a[0]) * p.doors[e.door].at / len, dZ = w.a[1] + (w.b[1] - w.a[1]) * p.doors[e.door].at / len;
  // (inside: in from the way in — the plan's entrance is the threshold, on the wall's outer face — along the line from the doorstep, to
  // the first floor of the room the feet stand on)
  let IX = e.x, IZ = e.z; if (inside) { const ux = e.x - e.out[0], uz = e.z - e.out[1], n = Math.hypot(ux, uz) || 1;
    for (const k of [0.6, 0.8, 1.0, 0.45, 1.3]) { const X = e.x + ux / n * k, Z = e.z + uz / n * k; const q = G.Space.indoor(b.x * TL + X, b.y * TL + Z, e.lv || 0, b.id); if (q && q.b === b && q.shell && q.walk) { IX = X; IZ = Z; break; } } }
  G.Avatar.detach(); god(() => { v.inside = inside ? b.id : 0; const X = inside ? IX : (e.out[0] + dX) / 2, Z = inside ? IZ : (e.out[1] + dZ) / 2; v.x = b.x + X / TL; v.y = b.y + Z / TL; v.path = null; });
  Po.setLevel(inside ? e.lv || 0 : null); G.Avatar.attach(v, 0); for (let k = 0; k < 6; k++) frame();
  return aim(b, e.door);
}
// (the door's own target among what the hands have before them — the one the player turns the wheel to, when someone or something else
// is nearer: a person at prayer, the house's «Examinar» on its doorstep —, and what the E offers first)
function aim(b, door) {
  const pp = I.list.find(q => q.id === 'portaPlanta'); const t = (pp.find(I.ctx()) || []).find(q => q.b === b && q.d.id === door);
  if (t) { const st = G.Avatar.state(); st.yaw = Math.atan2(t.Z - st.Z, t.X - st.X); IN.camYaw = st.yaw; for (let k = 0; k < 3; k++) G.Avatar.frame(RDT); }
  const best = I.best(); const r = I.candidates().find(q => q.id === 'portaPlanta' && q.t.b === b && q.t.d.id === door) || null;
  return { t, r, best, label: r ? r.label : 'nada', first: best ? (best.id === 'portaPlanta' ? best.label : `(${best.id}) ${best.label}`) : 'nada', dentro: !!(r && r.t.dentro) };
}
// (an entrance with a leaf — an opening, an arch, has none to lock)
const leafed = b => { const p = G.Space.planNow(b); return !!(p && p.entrance && p.entrance.out && p.doors[p.entrance.door] && p.doors[p.entrance.door].kind !== 'vao'); };
// (nobody passing its way in now: the door is open for whoever passes, D-766)
const passing = b => [...S().villagers.values()].some(o => o.inside === b.id && In.passage(o));
// (the E pressed: the act to its end)
function press(r) { said.length = 0; const ran = r ? I.run(r) : null; for (let k = 0; k < 240 && G.Avatar.busy(); k++) frame(); for (let k = 0; k < 4; k++) frame(); return ran; }
// (out by the door, as a player walks: from inside to the doorstep, square through the opening)
function walkOut(b) {
  const p = G.Space.planNow(b); const e = p.entrance; const st = G.Avatar.state(); const X = b.x * TL + e.out[0], Z = b.y * TL + e.out[1]; let still = 0, last = [st.X, st.Z];
  for (let q = 0; q < 360; q++) { const dx = X - st.X, dz = Z - st.Z; if (Math.hypot(dx, dz) < 0.15) break; IN.camYaw = Math.atan2(dz, dx); IN.mz = 1; frame(); if (Math.hypot(st.X - last[0], st.Z - last[1]) < 0.004) { if (++still > 30) break; } else still = 0; last = [st.X, st.Z]; }
  stop(); for (let q = 0; q < 10; q++) frame(); return Math.hypot(X - st.X, Z - st.Z);
}
// (a tavern of the snapshot with a keeper at its counter, a plan with seats, and a body for it)
let PICK = null;
for (const b of taverns()) { const kp = T.keeperOf(b); if (!kp || !T.atHand(b) || !leafed(b)) continue; const v = bodyFor(b); if (v) { PICK = { b: b.id, v: v.id }; break; } }
if (!PICK) { ok('o retrato', false, 'nenhuma taverna aberta com taverneiro e um corpo'); process.exit(1); }
const SNAP = G.Save.serialize();
const fresh = (snap) => { said.length = 0; calls.length = 0; logs.length = 0; bad.length = 0; if (Po.body()) Po.release('deus'); G.Avatar.detach(); stop(); M.reseed(4242); G.Save.apply(JSON.parse(snap || SNAP)); G.Main.mode = 'game'; if (G.UI && G.UI.setSpeed) G.UI.setSpeed(0); calm(); };
const B = () => S().buildings.get(PICK.b), V = () => S().villagers.get(PICK.v);
const DOOR = () => G.Space.planNow(B()).entrance.door;
console.log(`   (taverna#${PICK.b} de ${S().settlements.get(B().set).name}, ${B().style}; o corpo ${V().name}; o taverneiro ${T.keeperOf(B()).name})`);

// ---------------- p1 the body inside at the closing ----------------
let CLOSED = null; // (the save of the night with the body inside after the closing: p4's)
if (on('p1') || on('p3') || on('p4')) {
  fresh(); const b = B(), v = V(); const k = T.keeperOf(b); const r = seatIn(b, v);
  if (!r.ok) ok('p1 o corpo senta à mesa', false, r.why || 'não sentou');
  else {
    const sit0 = [v.x, v.y]; const h = T.horas(b); let fecha = 0; while (S().time < h.fecha + 0.006) { fast(); const op = T.dia(b); if (op && op.data.fecha && !fecha) fecha = op.data.fecha; }
    for (let i = 0; i < 300 && passing(b); i++) fast(); // (the last ones walking out by the door: open for them as they pass)
    const call = calls.find(q => q.key === 'fechando' && q.id === k.id && fecha && q.t >= fecha - 0.05);
    const promise = calls.find(q => q.key === 'carta_depois' && fecha && q.t >= fecha); // («fico no balcão» after the closing call)
    const st0 = G.Avatar.state(); const moved = G.dist(v.x, v.y, sit0[0], sit0[1]); const s1 = ds(b, DOOR()); watch();
    ok('p1 o fechamento: o taverneiro avisa o corpo, o dia fecha, o mundo não o move, e a porta fica fechada — não trancada — com ele dentro',
      !!fecha && !!call && !promise && !T.dia(b) && v.inside === b.id && !!G.Avatar.seatNow() && moved < 0.05 && G.isNight() && s1.state === 'fechada' && s1.by === 'regra',
      `o chamado às ${fecha ? (fecha - 0).toFixed(1) : '-'}: ${call ? `${k.name} disse «fechando»` : 'NINGUÉM AVISOU'}${promise ? ', e depois PROMETEU O BALCÃO' : ''}; o dia ${T.dia(b) ? 'ABERTO' : 'fechado'} às ${S().time.toFixed(3)} (noite: ${G.isNight() ? 'sim' : 'não'}); o corpo ${v.inside === b.id ? 'dentro, sentado' : 'FORA'}, ${st0.loco}, a ${moved.toFixed(3)} casa de onde sentou; a porta ${dstr(s1)}`);
    CLOSED = G.Save.serialize();
    const a = putAt(b, v, true); const can = a.r && a.r.ok; const ran = press(a.r); const s2 = ds(b, DOOR()); const far = walkOut(b); const s3 = ds(b, DOOR()); watch();
    ok('p1 de dentro, «Abrir a porta»: as mãos abrem e o corpo sai pela porta', a.dentro && a.label === 'Abrir a porta' && can && !!ran && s2.state === 'aberta' && !v.inside && far < 0.6,
      `de dentro (${a.dentro ? 'o lado de dentro da parede' : 'FORA'}): «${a.label}»; depois a porta ${dstr(s2)}; o corpo ${v.inside ? 'AINDA DENTRO' : 'na rua'}, a ${far.toFixed(2)} m da soleira; a porta ${dstr(s3)}`);
    ok('p1 o verificador', !bad.length, bad.join(' · ') || 'limpo');
  }
}

// ---------------- p2 the body inside in the war's bar ----------------
let BARRED = null; // (the save with the body inside the barred tavern: p4's)
if (on('p2') || on('p3') || on('p4')) {
  fresh(); const b = B(), v = V(); const k = T.keeperOf(b); const r = seatIn(b, v); const set = S().settlements.get(b.set); const P = G.Fac.get(set.fac);
  const Q = G.Fac.all().filter(f => f.alive && f.id !== P.id).sort((x, y) => G.Fac.pop(y.id) - G.Fac.pop(x.id))[0];
  S().divinePeace = 0; god(() => G.Politics.declareWar(Q, P, 'ambicao')); set.alarmT = 90;
  for (let i = 0; i < 2400 && !(b.tranca && TC.hiders(b).length && k.task && k.task.ks === 'esconde'); i++) { fast(); set.alarmT = Math.max(set.alarmT, 60); }
  const n0 = TC.hiders(b).length; const s1 = ds(b, DOOR()); BARRED = G.Save.serialize();
  if (!r.ok || !b.tranca) ok('p2 a tranca da guerra com o corpo dentro', false, `${r.ok ? 'sentou' : r.why}; a tranca ${b.tranca ? 'posta' : 'NÃO POSTA'} (${b.abrigo ? b.abrigo.k : 'sem escolha'})`);
  else {
    const a = putAt(b, v, true); const t0 = S().clock; const ran = press(a.r); const s2 = ds(b, DOOR()); const lifted = !b.tranca; const msg = said.find(x => /tira a tranca/.test(x)) || '';
    const chron = logs.find(x => /tirou a tranca/.test(x)) || '';
    ok('p2 de dentro, a tranca da guerra: o verbo diz quem se esconde ali, a tranca sai pela porta da T1 e a porta abre',
      s1.state === 'trancada' && a.dentro && /^Tirar a tranca \(/.test(a.label) && /escondid/.test(a.label) && !!ran && lifted && s2.state === 'aberta' && /guerra/.test(msg) && /escondid/.test(msg) && !!chron && TC.hiders(b).length === n0,
      `${n0} escondidos, a porta ${dstr(s1)} (${b.abrigo ? b.abrigo.k : '-'} por ${k.name}); de dentro: «${a.label}»; depois: a tranca ${lifted ? 'tirada' : 'AINDA LÁ'}, a porta ${dstr(s2)}; a tela: «${msg || 'NADA'}»; a crônica: «${chron || 'NADA'}»; ${TC.hiders(b).length} ainda escondidos`);
    const far = walkOut(b); let again = 0; for (let i = 0; i < 300 && !again; i++) { fast(); set.alarmT = Math.max(set.alarmT, 60); if (b.tranca && b.tranca.por === k.id && b.tranca.t > t0) again = S().clock; }
    const s3 = ds(b, DOOR()); watch();
    ok('p2 o corpo sai, e o taverneiro tranca de novo, com o perigo ainda à porta e o povo lá dentro', !v.inside && far < 0.6 && !!again && s3.state === 'trancada' && TC.hiders(b).length >= 1,
      `o corpo ${v.inside ? 'AINDA DENTRO' : 'na rua'} (a ${far.toFixed(2)} m da soleira); ${again ? `${k.name} trancou de novo ${(again - t0).toFixed(1)} s depois` : 'NINGUÉM TRANCOU DE NOVO'}; a porta ${dstr(s3)}; ${TC.hiders(b).length} escondidos`);
    // ---------------- p3 from outside, the barred door: the knock ----------------
    if (on('p3')) {
      const o = aim(b, DOOR()); const ran2 = press(o.r); const s4 = ds(b, DOOR()); watch();
      ok('p3 de fora, a porta trancada da guerra: «Bater à porta» — o corpo bate, e ela fica trancada', !o.dentro && o.label === 'Bater à porta' && !!ran2 && said.some(x => /bate à porta/.test(x)) && s4.state === 'trancada' && !v.inside,
        `de fora: «${o.label}»; «${said.join(' / ') || '-'}»; a porta ${dstr(s4)}`);
    }
    ok('p2 o verificador', !bad.length, bad.join(' · ') || 'limpo');
  }
}

// ---------------- p3 from outside, the time's lock: a tavern shut and empty at night ----------------
if (on('p3') && CLOSED) {
  fresh(CLOSED); const v = V(); const pick = [...S().buildings.values()].filter(q => q.type === 'taverna' && q.built && In.has(q) && q.id !== PICK.b && leafed(q) && !passing(q))
    .map(q => [q, ds(q, G.Space.planNow(q).entrance.door)]).find(([q, s]) => s.state === 'trancada' && s.by === 'regra' && !In.guestIn(q) && !In.barOf(q, G.Space.planNow(q).entrance.door));
  if (!pick) ok('p3 de fora, a porta trancada pela regra da hora', false, 'nenhuma taverna fechada e vazia, trancada, à noite');
  else {
    const [q, s0] = pick; const o = putAt(q, v, false); const ran = press(o.r); const s1 = ds(q, G.Space.planNow(q).entrance.door); watch();
    ok('p3 de fora, uma taverna fechada e vazia à noite (trancada pela regra da hora): «Bater à porta», e ela fica trancada', s0.state === 'trancada' && !o.dentro && o.label === 'Bater à porta' && !!ran && said.some(x => /bate à porta/.test(x)) && s1.state === 'trancada' && !v.inside,
      `taverna#${q.id}: a porta ${dstr(s0)}; de fora, diante dela: «${o.label}» (o E primeiro: «${o.first}»); «${said.join(' / ') || '-'}»; a porta ${dstr(s1)}`);
  }
}

// ---------------- p4 the save in the middle, with the body inside ----------------
if (on('p4')) {
  for (const [name, snap] of [['depois do fechamento', CLOSED], ['na tranca da guerra', BARRED]]) {
    if (!snap) { ok(`p4 o save ${name}`, false, 'sem o save do caso'); continue; }
    fresh(snap); const b = B(), v = V(); G.Avatar.attach(v, 0); for (let k = 0; k < 6; k++) frame();
    const was = v.inside === b.id; const s0 = ds(b, DOOR()); const bar0 = !!b.tranca; const n0 = TC.hiders(b).length;
    const a = putAt(b, v, true); const ran = press(a.r); const s1 = ds(b, DOOR()); const far = walkOut(b); watch();
    const want = bar0 ? /^Tirar a tranca/.test(a.label) : a.label === 'Abrir a porta';
    ok(`p4 o save ${name}: o corpo volta dentro, a porta como estava, e ele sai`, was && (bar0 ? s0.state === 'trancada' && n0 >= 1 : s0.state === 'fechada') && want && !!ran && s1.state === 'aberta' && !v.inside && far < 0.6 && !bad.length,
      `depois do load: o corpo ${was ? 'dentro' : 'FORA'}, a porta ${dstr(s0)}${bar0 ? `, a tranca e ${n0} escondidos` : ''}; de dentro: «${a.label}»; depois a porta ${dstr(s1)}, o corpo ${v.inside ? 'AINDA DENTRO' : 'na rua'}; ${bad.join(' · ') || 'verificador limpo'}`);
  }
}

// ---------------- p5 a person of the world inside a locked house ----------------
// (the doors read in the world's step — the count of who is inside made fresh —, the hands of the people by In.useDoor, as the world's
// own: night, a family all at home, nobody passing its door)
if (on('p5') || on('p6')) {
  fresh(CLOSED || SNAP); if (S().time < 0.75) { while (S().time < 0.76) { calm(); M.viver(0.5); } }
  const fam = q => [...S().villagers.values()].filter(o => o.home === q.id);
  const doorOf = q => G.Space.planNow(q).entrance.door;
  const free = (q, d0) => !(q.ip.dr && q.ip.dr[d0] !== undefined && q.ip.dr[d0] !== null); // (nobody's hand on the door today)
  const H = [...S().buildings.values()].filter(q => q.built && In.has(q) && In.TYPES[q.type] && In.TYPES[q.type].use === 'casa' && leafed(q)).sort((a, c) => a.id - c.id)
    .find(q => { const f = fam(q); return f.length >= 2 && f.every(o => o.inside === q.id && !In.passage(o) && !o.aboard && !o.jail && !o.captive && !Po.is(o)) && free(q, doorOf(q)) && !In.guestIn(q); });
  const near = (q, o) => G.dist(o.x, o.y, q.x, q.y);
  if (!H) ok('p5 uma casa de família toda em casa', false, 'nenhuma');
  else {
    const door = doorOf(H); const f = fam(H); const out = [], bad5 = [];
    const guest = [...S().villagers.values()].filter(o => o.home !== H.id && o.job !== H.id && o.age >= 18 && !o.jail && !o.captive && !o.aboard && !Po.is(o) && !o.inside).sort((a, c) => near(H, a) - near(H, c) || a.id - c.id)[0];
    const stranger = [...S().villagers.values()].filter(o => o.home !== H.id && o.job !== H.id && o !== guest && o.age >= 18 && !o.jail && !o.captive && !Po.is(o) && !o.inside).sort((a, c) => near(H, a) - near(H, c) || a.id - c.id)[0];
    const sA = ds(H, door); out.push(`a casa#${H.id}, a família toda em casa (${f.length}): ${dstr(sA)}`); if (!(sA.state === 'trancada' && sA.by === 'regra')) bad5.push('a família em casa à noite não trancou');
    god(() => { guest.inside = H.id; });
    const sB = ds(H, door); out.push(`com ${guest.name}, vizinho, dentro: ${dstr(sB)}`); if (!(sB.state === 'fechada' && sB.by === 'regra')) bad5.push('o vizinho trancado dentro pela regra');
    god(() => { guest.inside = 0; }); const sC = ds(H, door); out.push(`sem ele: ${dstr(sC)}`); if (sC.state !== 'trancada') bad5.push('a regra não voltou');
    // (locked by the key, the neighbour inside: the door opens for whoever passes — the world's people go out by it —, and he lifts the lock)
    god(() => { guest.inside = H.id; In.useDoor(H, door, 'trancar', f[0]); }); const sD = ds(H, door); out.push(`trancada à chave por ${f[0].name}: ${dstr(sD)}`); if (!(sD.state === 'trancada' && sD.by === 'pessoa')) bad5.push('a chave não trancou');
    god(() => { guest.saiT = S().clock + 2; }); const sE = ds(H, door); out.push(`${guest.name} saindo: ${dstr(sE)}`); if (!(sE.state === 'aberta' && sE.by === 'passagem')) bad5.push('a porta não abriu para quem passa'); god(() => { guest.saiT = 0; });
    const uX = god(() => In.useDoor(H, door, 'destrancar', stranger)); out.push(`${stranger.name}, de fora e sem a chave: ${uX.ok ? 'DESTRANCOU' : '«' + uX.why + '»'}`); if (uX.ok) bad5.push('de fora sem a chave destrancou');
    const uG = god(() => In.useDoor(H, door, 'destrancar', guest)); const sF = ds(H, door); out.push(`${guest.name}, de dentro: ${uG.ok ? 'tira a tranca' : '«' + uG.why + '»'}, ${dstr(sF)}`); if (!uG.ok || sF.state !== 'fechada') bad5.push('o vizinho de dentro não tirou a tranca');
    god(() => { In.useDoor(H, door, 'abrir', guest); }); const sG = ds(H, door); out.push(`e abre: ${dstr(sG)}`); if (sG.state !== 'aberta') bad5.push('não abriu');
    god(() => { delete H.ip.dr[door]; guest.inside = 0; });
    // (a prisoner does not open the jail: its bar is not his)
    const J = [...S().buildings.values()].find(q => q.type === 'cadeia' && q.built && In.has(q) && leafed(q));
    if (J) { const jd = doorOf(J); god(() => { stranger.jail = J.id; stranger.inside = J.id; }); const sJ = ds(J, jd); const uJ = god(() => In.useDoor(J, jd, 'destrancar', stranger)); out.push(`a cadeia#${J.id} à noite com ${stranger.name} preso: ${dstr(sJ)}; ele ${uJ.ok ? 'DESTRANCOU' : 'não abre («' + uJ.why + '»)'}`); if (uJ.ok || sJ.state !== 'trancada') bad5.push('o preso'); god(() => { stranger.jail = 0; stranger.inside = 0; }); }
    else out.push('(nenhuma cadeia com planta neste mundo)');
    // (the temple at night: empty, locked; with one praying in it who is not of it, shut)
    // (the rule of the door, a leaf or an arch: the metropole's temples go in by an arch — a vão, walked through whatever the rule says, D-766)
    const TP = [...S().buildings.values()].filter(q => q.built && In.has(q) && In.TYPES[q.type] && In.TYPES[q.type].use === 'templo' && G.Space.planNow(q) && G.Space.planNow(q).entrance && G.Space.planNow(q).entrance.out && !passing(q)).sort((a, c) => (leafed(c) ? 1 : 0) - (leafed(a) ? 1 : 0) || a.id - c.id).find(q => !In.guestIn(q) && free(q, doorOf(q)) && ds(q, doorOf(q)).state === 'trancada');
    if (TP) { const td = doorOf(TP); const t0 = ds(TP, td); god(() => { guest.inside = TP.id; }); const t1 = ds(TP, td); god(() => { guest.inside = 0; }); out.push(`o templo#${TP.id} à noite: vazio ${dstr(t0)}, com ${guest.name} rezando ${dstr(t1)}`); if (t0.state !== 'trancada' || t1.state !== 'fechada') bad5.push('o templo'); }
    else out.push('(nenhum templo trancado à noite)');
    watch();
    if (on('p5')) ok('p5 uma pessoa do mundo dentro de uma casa trancada: a regra não a tranca, a chave por dentro sai, a porta abre para quem passa; o preso e o templo', !bad5.length && !!TP && !bad.length, out.join(' · ') + (bad5.length ? ' — ERRADO: ' + bad5.join(', ') : '') + (bad.length ? ' — ' + bad.join(' · ') : ''));
    // ---------------- p6 the body in another family's house and in the temple, at night ----------------
    if (on('p6')) {
      const v = V(); const rows = [], bad6 = [];
      const inHouse = (q, label) => {
        if (!Po.is(v)) { god(() => { G.Vg.endTask(v); }); Po.take(v); }
        const a = putAt(q, v, true); for (let k = 0; k < 3; k++) frame(); const d0 = doorOf(q); const s0 = ds(q, d0); const arch = !leafed(q);
        // (an arch has no leaf to open: the body walks out through it, whatever the rule of the hour says of the door)
        if (arch) { const far = walkOut(q); rows.push(`${label}: um vão (${dstr(s0)}), sem folha a abrir: o corpo sai por ele (${v.inside ? 'AINDA DENTRO' : 'na rua, a ' + far.toFixed(2) + ' m da soleira'})`); if (v.inside || !(s0.state === 'fechada')) bad6.push(label); return; }
        rows.push(`${label}: ${dstr(s0)}, de dentro «${a.label}»`); if (!(s0.state === 'fechada' && a.dentro && a.label === 'Abrir a porta')) bad6.push(label);
        const ran = press(a.r); const s1 = ds(q, d0); const far = walkOut(q); rows.push(`abre (${dstr(s1)}) e sai (${v.inside ? 'AINDA DENTRO' : 'na rua, a ' + far.toFixed(2) + ' m da soleira'})`); if (!ran || s1.state !== 'aberta' || v.inside) bad6.push(label + ': não saiu');
        god(() => { if (q.ip.dr) delete q.ip.dr[d0]; });
      };
      inHouse(H, `a casa#${H.id} de outra família, toda em casa`);
      if (TP) inHouse(TP, `o templo#${TP.id}`); else rows.push('(nenhum templo)');
      watch();
      ok('p6 o corpo numa casa de outra família e no templo, à noite: a porta fechada com ele dentro e, de dentro, «Abrir a porta»', !bad6.length && !!TP && !bad.length, rows.join(' · ') + (bad6.length ? ' — ERRADO: ' + bad6.join(', ') : '') + (bad.length ? ' — ' + bad.join(' · ') : ''));
    }
  }
}

const e = M.erros(); ok('sem erros', !Object.keys(e.mod).length && !e.console.length, JSON.stringify(e).slice(0, 300));
console.log(`(${(clock() - c0).toFixed(0)} s de máquina)`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
