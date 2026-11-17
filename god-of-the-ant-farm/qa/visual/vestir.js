// vestir: what is worn and stowed on the body, against the body that moves — in Node, by the game's own rig and the skin bent
// on the CPU as the shader bends it (qa/visual/corpo-rig.js), in every state of the animator (20a, D-349 to D-353):
//   · the helmet and the cuirass drawn, each in its bone's frame, the size of the body (a child's, an elder's alike)
//   · the head inside the helmet and the trunk inside the cuirass in every pose (the trunk goes with the chest under it)
//   · the hips and the thighs under the cuirass' wall when the body bends, sits, crouches, runs
//   · the leather cuirass' tabs turned out of the thighs' way
//   · the beards inside the helmets (the hair, under a helmet, is not drawn: qa/visual/maos.js checks the outfit)
//   · the things at the belt — the sword, the axe, the hammer, the knife, the sickle, the club — out of the thighs
//   node qa/visual/vestir.js        (≈ 1 min; run by qa/visual/maos.js too, its part «vestir»)
const path = require('path'), fs = require('fs'), vm = require('vm');
const L0 = require('./corpo-rig.js'); const { G, THREE, P3, B3, A, bend, MESH, LOOK } = L0;
const run = f => vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', '..', f), 'utf8'), { filename: f });
run('js/itens.js'); run('js/itemforma.js'); run('js/itemarte.js');
const IA = G.ItemArt, BN = G.BODYMESH.bones, B = P3.B, It = G.Itens;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | vestir ${name} | ${info}`); if (!c) fails.push(name); };
{ const r0 = P3.rig; P3.rig = function (...a) { return (P3.lastR = r0.apply(this, a)); }; } // (the rig's last bones, for the measures)
const V = new THREE.Vector3(), M4 = new THREE.Matrix4();
const iHead = BN.indexOf('head'), iNeck = BN.indexOf('neck'), iChest = BN.indexOf('chest'); const HC = G.ItemForma.head.HC;
const LEG = new Set(['pel', 'spine', 'thL', 'thR', 'hpHL', 'hpHR'].map(n => BN.indexOf(n)));
const NONE = { mao: null, outra: null, costas: null, cinto: null, cabeca: null, corpo: null, real: true };
const MATS = k => It.KINDS[k].mats.map(m => k + '.' + m);

// ------------------------------ the measures ------------------------------
// (world points into a frame — the bone's, its size taken out: the 1.75 m body's units)
function toLocal(F, P, keep) { M4.copy(F).invert(); const out = []; for (let i = 0; i < P.length; i += 3) { if (keep && !keep(i / 3)) continue; V.set(P[i], P[i + 1], P[i + 2]).applyMatrix4(M4); out.push([V.x, V.y, V.z]); } return out; }
// the helmet's inner radius by direction round its centre; the cuirass' by height and angle round its axis
const hbin = d => { const th = Math.atan2(d[0], d[2]), ph = Math.acos(Math.max(-1, Math.min(1, d[1]))); return Math.floor((th + Math.PI) / 0.12) * 100 + Math.floor(ph / 0.12); };
const tkey = (y, a) => Math.floor(y / 0.02) * 1000 + Math.floor((a + Math.PI) / 0.14), abin = a => Math.floor((a + Math.PI) / 0.14);
const memo = new Map(); const once = (k, f) => { if (!memo.has(k)) memo.set(k, f()); return memo.get(k); };
const helmMin = key => once('h' + key, () => { const b = IA.raw(key, 0); const m = new Map(); for (let i = 0; i < b.pos.length; i += 3) { const d = [b.pos[i] - HC[0], b.pos[i + 1] - HC[1], b.pos[i + 2] - HC[2]]; const r = Math.hypot(...d); const k = hbin(d.map(x => x / r)); m.set(k, Math.min(m.get(k) || 9, r)); } return m; });
const cuirMin = key => once('c' + key, () => { const b = IA.raw(key, 0); const m = new Map(); for (let i = 0; i < b.pos.length; i += 3) { const r = Math.hypot(b.pos[i], b.pos[i + 2]); const k = tkey(b.pos[i + 1], Math.atan2(b.pos[i], b.pos[i + 2])); m.set(k, Math.min(m.get(k) || 9, r)); } return m; });
// (the cuirass' lower wall: at each angle its lowest point and the radii near it — a leg point there above that point is through it)
const cuirWall = key => once('w' + key, () => { const b = IA.raw(key, 0); const W = new Map();
  for (let i = 0; i < b.pos.length; i += 3) { const k = abin(Math.atan2(b.pos[i], b.pos[i + 2])); const w = W.get(k) || { y: 9, r0: 9, r1: 0 }; w.y = Math.min(w.y, b.pos[i + 1]); W.set(k, w); }
  for (let i = 0; i < b.pos.length; i += 3) { const w = W.get(abin(Math.atan2(b.pos[i], b.pos[i + 2]))); if (b.pos[i + 1] > w.y + 0.06) continue; const r = Math.hypot(b.pos[i], b.pos[i + 2]); w.r0 = Math.min(w.r0, r); w.r1 = Math.max(w.r1, r); } return W; });
// the deepest a set of points goes past the helmet's inner face (> 0: through it), and past the cuirass'
function helmPast(hm, pts, yMin) { let w = -9; for (const p of pts) { if (p[1] < yMin) continue; const d = [p[0] - HC[0], p[1] - HC[1], p[2] - HC[2]]; const r = Math.hypot(...d); const h = hm.get(hbin(d.map(x => x / r))); if (h !== undefined) w = Math.max(w, r - h); } return w; }
function cuirPast(cm, pts) { let w = -9; for (const p of pts) { if (p[1] < -0.03 || p[1] > 0.5) continue; const c = cm.get(tkey(p[1], Math.atan2(p[0], p[2]))); if (c !== undefined) w = Math.max(w, Math.hypot(p[0], p[2]) - c); } return w; }
function wallPast(W, pts) { let w = -9; for (const p of pts) { const r = Math.hypot(p[0], p[2]); const q = W.get(abin(Math.atan2(p[0], p[2]))); if (!q || r < q.r0 - 0.005 || r > q.r1 + 0.005) continue; w = Math.max(w, p[1] - q.y); } return w; }
// (the thigh's skin radius by its length and angle round its bone; how deep a point is in it)
function thighIn(P, body, k, R) {
  const hip = new THREE.Vector3().setFromMatrixPosition(R[B.thL + k]), knee = new THREE.Vector3().setFromMatrixPosition(R[B.snL + k]); const u = knee.clone().sub(hip); const len = u.length(); u.normalize();
  const ez = new THREE.Vector3(0, 0, 1).applyMatrix4(new THREE.Matrix4().extractRotation(R[B.pel])); ez.addScaledVector(u, -ez.dot(u)).normalize(); const ex = new THREE.Vector3().crossVectors(u, ez);
  const map = new Map(); const ib = [BN.indexOf(k ? 'thR' : 'thL'), BN.indexOf(k ? 'hpHR' : 'hpHL')]; const p = new THREE.Vector3();
  const loc = q => { const d = q.clone().sub(hip); const t = d.dot(u); return [t, Math.hypot(d.dot(ex), d.dot(ez)), Math.atan2(d.dot(ex), d.dot(ez))]; };
  for (let i = 0; i < body.n; i++) { if (!ib.includes(body.bi[i * 4])) continue; p.set(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]); const [t, r, a] = loc(p); if (t < 0 || t > len - 0.03) continue; const key = Math.floor(t / 0.03) * 100 + Math.floor((a + Math.PI) / 0.3); map.set(key, Math.max(map.get(key) || 0, r)); }
  return q => { const [t, r, a] = loc(q); if (t < 0 || t > len - 0.03) return -9; const m = map.get(Math.floor(t / 0.03) * 100 + Math.floor((a + Math.PI) / 0.3)); return m === undefined ? -9 : m - r; };
}
function itemWorld(key, F, start, count) { const b = IA.raw(key, 0); const out = []; for (let i = 0; i < b.pos.length; i += 3) { V.set(b.pos[i], b.pos[i + 1], b.pos[i + 2]).applyMatrix4(F); out.push(V.clone()); } return out; }
// a body in a state for a while, its frames given to `see` (the look, the pose, the bones, the bent skin of its body)
function live(st, sp, o, frames, see) {
  const L = Object.assign({}, LOOK, { fem: !!o.fem, plant: [{ on: 0 }, { on: 0 }], s: o.s || 1, inv: Object.assign({}, NONE, o.inv) }); L.cuir = P3.cuirOf(L.inv.corpo); if (o.headK) L.headK = o.headK;
  const an = A.memory(), pose = A.POSE0(), I = {}; let z = 0; const body = MESH[o.fem ? 'corpoF' : 'corpoM'];
  for (let f = 0; f < frames; f++) { z += sp / 60; L.ground = st === 'sleep' || st === 'swim' ? undefined : 0;
    Object.assign(I, { st, t: f / 60, sp, yaw: Math.PI / 2, yawV: 0, acc: 0, X: 0, Z: z, ground: L.ground, s: L.s, run: st === 'run' ? 1 : 0, walk: 0, over: null, clipK: undefined, drunk: 0, tired: 0, id: 7 });
    A.drive(an, I, pose, L, 1 / 60); if (f < 60 || f % 5) continue;
    P3.toolsReset(); B3.begin(); P3.body(0, 0, 0, z, Math.PI / 2, pose, L, null); B3.end(); see({ L, pose, R: P3.lastR, body, P: () => bend(body, 0) });
  }
}
const STATES = A.STATES.filter(s => !['swim', 'tread', 'drown', 'jump', 'fall', 'climb', 'crumple', 'knocked', 'turn'].includes(s));
const SPEED = st => (st === 'walk' || st === 'carryWalk' || st === 'sneak' || st === 'wade' ? 1.4 : st === 'run' ? 4 : 0);
const cm = x => (x * 100).toFixed(1);

// ------------------------------ 1. drawn, in the bone's frame, the body's size ------------------------------
{ const bad = []; const say = [];
  live('idle', 0, { inv: { cabeca: 'elmo.bronze', corpo: 'couraca.couro', outra: 'escudo.madeira', costas: 'lanca.bronze', cinto: 'espada.bronze' } }, 66, ({ R }) => {
    const t = P3.tools().map(x => x[0]); for (const k of ['elmo.bronze', 'couraca.couro', 'escudo.madeira', 'lanca.bronze', 'espada.bronze']) if (!t.includes(k)) bad.push(`${k} não desenhado`);
    const h = new THREE.Vector3().setFromMatrixPosition(P3.RX.cabeca), hb = new THREE.Vector3().setFromMatrixPosition(R[B.head]); if (h.distanceTo(hb) > 1e-6) bad.push('o elmo fora do osso da cabeça');
    const c = new THREE.Vector3().setFromMatrixPosition(P3.RX.corpo), cb = new THREE.Vector3().setFromMatrixPosition(R[B.chest]); if (c.distanceTo(cb) > 1e-6) bad.push('a couraça fora do osso do peito');
    if (!say.length) say.push(`desenhados ${t.filter((k, i) => t.indexOf(k) === i).join(', ')} (a couraça de couro em ${t.filter(k => k === 'couraca.couro').length} peças: o corpo e as abas)`); });
  // (a child and an elder: the helmet's size is the head's, the cuirass' the chest's — the same fit as the grown body's)
  for (const [nm, s, hk] of [['adulto', 1, 1], ['velho', 0.96, 1], ['criança', 0.6, 1.2]]) {
    let wh = -9, wc = -9; live('walk', 1.2, { s, headK: hk, inv: { cabeca: 'elmo.ferro', corpo: 'couraca.bronze' } }, 100, ({ body, P }) => { const Q = P();
      wh = Math.max(wh, helmPast(helmMin('elmo.ferro'), toLocal(P3.RX.cabeca, Q, i => (body.bi[i * 4] === iHead || body.bi[i * 4] === iNeck) && body.zone[i] === 0), 0.06));
      wc = Math.max(wc, cuirPast(cuirMin('couraca.bronze'), toLocal(P3.RX.corpo, Q, i => body.bi[i * 4] <= iChest && body.zone[i] === 0))); });
    if (wh > 0 || wc > 0) bad.push(`${nm}: a cabeça ${cm(wh)} cm, o tronco ${cm(wc)} cm além da face de dentro`); say.push(`${nm} (altura ×${s}, cabeça ×${hk}): a cabeça a ${cm(-wh)} cm do elmo, o tronco a ${cm(-wc)} cm da couraça`); }
  ok('o elmo e a couraça desenhados no osso deles, na altura do corpo (a criança e o velho também)', !bad.length, bad.length ? bad.join(' · ') : say.join(' · ')); }

// ------------------------------ 2. the head and the trunk inside, in every pose ------------------------------
{ const res = { cab: [-9, ''], tro: [-9, ''], wall: [-9, ''] }; const bad = [];
  for (const fem of [false, true]) for (const st of STATES) {
    const hk = MATS('elmo')[(STATES.indexOf(st) + (fem ? 1 : 0)) % 3], ck = MATS('couraca')[(STATES.indexOf(st) + (fem ? 2 : 0)) % 3];
    live(st, SPEED(st), { fem, inv: { cabeca: hk, corpo: ck } }, 96, ({ body, P }) => { const Q = P();
      const h = helmPast(helmMin(hk), toLocal(P3.RX.cabeca, Q, i => (body.bi[i * 4] === iHead || body.bi[i * 4] === iNeck) && body.zone[i] === 0), 0.06); if (h > res.cab[0]) res.cab = [h, `${fem ? 'F' : 'M'} ${st} ${hk}`];
      const c = cuirPast(cuirMin(ck), toLocal(P3.RX.corpo, Q, i => body.bi[i * 4] <= iChest && body.zone[i] === 0)); if (c > res.tro[0]) res.tro = [c, `${fem ? 'F' : 'M'} ${st} ${ck}`];
      if (ck !== 'couraca.couro') { const w = wallPast(cuirWall(ck), toLocal(P3.RX.corpo, Q, i => body.zone[i] === 0 && LEG.has(body.bi[i * 4]))); if (w > res.wall[0]) res.wall = [w, `${fem ? 'F' : 'M'} ${st} ${ck}`]; } }); }
  if (res.cab[0] > 0) bad.push(`a cabeça ${cm(res.cab[0])} cm além do elmo (${res.cab[1]})`);
  if (res.tro[0] > 0) bad.push(`o tronco ${cm(res.tro[0])} cm além da couraça (${res.tro[1]})`);
  if (res.wall[0] > 0.004) bad.push(`o quadril ou a coxa ${cm(res.wall[0])} cm acima da borda da couraça (${res.wall[1]})`);
  ok(`o elmo e a couraça fora da pele em todas as poses (${STATES.length} estados × os dois corpos × os materiais: a cabeça dentro do elmo, o tronco dentro da couraça, o quadril e a coxa debaixo da borda dela)`, !bad.length,
    bad.length ? bad.join(' · ') : `a cabeça no máximo a ${cm(-res.cab[0])} cm do elmo (${res.cab[1]}), o tronco a ${cm(-res.tro[0])} cm da couraça (${res.tro[1]}), a perna ${cm(-res.wall[0])} cm debaixo da borda (${res.wall[1]})`); }

// ------------------------------ 3. the leather's tabs out of the thighs ------------------------------
{ let worst = [-9, '']; const deep = new Set(['harvest', 'mine', 'skin', 'rise', 'rest', 'eatg', 'rockg', 'low', ...['ato-condenado', 'ato-esconder', 'ato-chorar-joelhos', 'ato-implorar', 'ato-propor', 'ato-enforcado'].flatMap(k => [k, k + '~m'])]); let deepW = [-9, '']; // (22c: on the knees, crouched hiding — deep as the harvest)
  for (const fem of [false, true]) for (const st of STATES) live(st, SPEED(st), { fem, inv: { corpo: 'couraca.couro' } }, 96, ({ body, P, R }) => { const Q = P(); const T = P3.tabsOf('couraca.couro', 0); if (!T) return;
    const fns = [thighIn(Q, body, 0, R), thighIn(Q, body, 1, R)]; let w = -9;
    for (const tb of T.tabs) { tb.m.getMatrixAt(0, M4); const g = tb.m.geometry, Pp = g.attributes.position.array, Ix = g.index.array;
      for (let i = g.drawRange.start; i < g.drawRange.start + g.drawRange.count; i += 2) { const v = Ix[i] * 3; V.set(Pp[v], Pp[v + 1], Pp[v + 2]).applyMatrix4(M4); for (const fn of fns) w = Math.max(w, fn(V)); } }
    const tag = `${fem ? 'F' : 'M'} ${st}`; if (process.env.V && w > 0.003) console.log('  aba', tag, cm(w)); if (deep.has(st)) { if (w > deepW[0]) deepW = [w, tag]; } else if (w > worst[0]) worst = [w, tag]; });
  // (the body folded deep — kneeling, sitting on the ground, getting up, the deep stoop of the harvest and the pick —, the thighs
  // folded up against the trunk: the tabs caught between them, shown and not judged — T-1368)
  ok('as abas da couraça de couro viradas para fora das coxas (em pé, andando, correndo, sentado no banco, trabalhando)', worst[0] <= 0.003, `a aba mais funda ${cm(worst[0])} cm na coxa (${worst[1]}); com o corpo dobrado fundo (ajoelhado, sentado no chão, levantando, agachado na colheita e na picareta) até ${cm(deepW[0])} cm (${deepW[1]}: T-1368)`); }

// ------------------------------ 4. the beards inside the helmets ------------------------------
{ const bad = []; const say = [];
  for (const hk of MATS('elmo')) live('idle', 0, { inv: { cabeca: hk } }, 61, () => { for (const bd of ['barba', 'curta', 'bigode']) { const w = helmPast(helmMin(hk), toLocal(P3.RX.cabeca, bend(MESH[bd], 0)), -0.3); if (w > 0) bad.push(`${hk} ${bd}: ${cm(w)} cm além`); else say.push(`${hk} ${bd} ${w < -1 ? '—' : cm(-w)}`); } });
  ok('as barbas dentro dos elmos (o cabelo debaixo do elmo não é desenhado: maos.js)', !bad.length, bad.length ? bad.join(' · ') : say.join(' · ')); }

// ------------------------------ 5. the things at the belt out of the thighs ------------------------------
{ let worst = [-9, '']; const keys = ['espada.bronze', 'espada.ferro', 'machado.pedra', 'machado.bronze', 'machado.ferro', 'martelo.bronze', 'martelo.ferro', 'faca.bronze', 'faca.ferro', 'foice.bronze', 'clava.madeira'].filter(k => It.def(k) && It.fits(k, 'cinto'));
  for (const key of keys) for (const fem of [false, true]) for (const [st, sp] of [['walk', 1.4], ['walk', 2], ['run', 4], ['run', 6], ['sit', 0], ['chop', 0], ['harvest', 0], ['mine', 0], ['sneak', 1.2]])
    live(st, sp, { fem, inv: { cinto: key } }, 90, ({ body, P, R }) => { if (!P3.RX.kC) return; const Q = P(); const fns = [thighIn(Q, body, 0, R), thighIn(Q, body, 1, R)]; let w = -9;
      for (const q of itemWorld(key, P3.RX.cinto)) for (const fn of fns) w = Math.max(w, fn(q)); if (w > worst[0]) worst = [w, `${key} ${fem ? 'F' : 'M'} ${st} ${sp}`]; });
  ok(`as coisas do cinto fora das coxas (${keys.length} coisas × andando, correndo, sentado, trabalhando × os dois corpos)`, worst[0] <= 0.003, `a mais funda ${cm(worst[0])} cm na coxa (${worst[1]}; a medida por faixas da coxa tem uns 3 mm de folga)`); }

console.log(fails.length ? `FALHAS: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
