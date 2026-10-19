// maos: what the hands hold, tested without a browser (seconds, no WebGL): the rig of js/people3d.js and its forms loaded in
// node, as corpo-rig.js loads them.
//   node qa/visual/maos.js   → the proofs: every form made and in its budget, its size the one the table says; the load is
//                              read from the world's record (the good, its marks, the gear, the people's ways — the same for
//                              every town); in every grip the palms on the thing and the thing outside the trunk, above the
//                              ground; the weight in the pose; the reach down to a load on the ground and the lift from there;
//                              the world's people reaching, lifting and setting down as the world's acts say; the torch and the
//                              spear given up for the load; a load set down while the hands work
// (G.People3D's rig and forms are the game's own: nothing here is a copy of them)
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..');
global.window = global; global.G = {}; window.G = G;
global.localStorage = { getItem: () => null, setItem() { }, removeItem() { } };
global.atob = s => Buffer.from(s, 'base64').toString('binary');
global.performance = global.performance || { now: () => Date.now() };
const run = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
run('js/lib/three.min.js'); global.THREE = THREE;
run('js/util.js');
G.worldHooks = G.worldHooks || []; G.mapHooks = G.mapHooks || [];
let night = 0;
G.W = G.W || {}; G.Render = { nightness: () => night }; G.Art = { CLOTH: {}, icon: () => null }; G.Fac = { ofV: v => (v._fac ? { civ: v._fac, id: 1, leader: 0 } : null), hex: () => '#884422' };
try { run('js/civs.js'); } catch (e) { } // (the peoples' colours, for the clothes)
run('js/bodymesh.js'); run('js/body3d.js'); run('js/people3d.js');
const scene = new THREE.Scene();
const realm = { scene: () => scene, Q: () => ({ view: 420, npcs: 36, detail: 1 }) };
G.People3D.init(THREE, realm);
const P3 = G.People3D, A = G.Anim3D, B = P3.B;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | maos ${name} | ${info}`); if (!c) fails.push(name); };
const V = (x, y, z) => new THREE.Vector3(x, y, z);
let pid = 100;
const person = o => Object.assign({ id: pid++, age: 30, g: 'm', role: null, civ: 'nordico', skin: '#d8a888', hair: '#3a2a1a', face: 1, act: '', carry: null, gear: null, moving: false }, o);

// ------------------------------ 1. the forms ------------------------------
{ const bad = [], info = [];
  for (const k in P3.FORM) {
    const gs = P3.heldGeo(k); if (!gs || !gs.length) { bad.push(`${k}: sem malha`); continue; }
    let tris = 0; const bb = new THREE.Box3(); let nan = 0;
    for (const g of gs) { tris += (g.index ? g.index.count : g.attributes.position.count) / 3; g.computeBoundingBox(); bb.union(g.boundingBox); for (const a of g.attributes.position.array) if (!Number.isFinite(a)) nan++; }
    const sz = bb.getSize(V()); const want = P3.FORM[k].sz;
    const off = [sz.x / want[0], sz.y / want[1], sz.z / want[2]];
    if (nan) bad.push(`${k}: ${nan} números inválidos`);
    if (tris > 460) bad.push(`${k}: ${tris} triângulos (orçamento de coisa pequena: até ~400)`);
    if (off.some(f => f < 0.72 || f > 1.32)) bad.push(`${k}: tamanho ${sz.x.toFixed(2)}×${sz.y.toFixed(2)}×${sz.z.toFixed(2)} contra a tabela ${want.join('×')}`);
    // (its middle at the origin: the rig places it by its middle)
    const c = bb.getCenter(V()); if (c.length() > Math.max(...want) * 0.22) bad.push(`${k}: o meio fora da origem (${c.x.toFixed(2)}, ${c.y.toFixed(2)}, ${c.z.toFixed(2)})`);
    info.push(`${k} ${tris}`);
  }
  ok('cada forma feita, no orçamento, do tamanho da tabela e com o meio na origem', !bad.length, bad.slice(0, 5).join(' · ') || info.join(', ')); }

// ------------------------------ 2. the load is the world's record ------------------------------
{ const cases = [
    [{ carry: { k: 'wood', n: 4 } }, 'lenha', 'bracos'], [{ carry: { k: 'stone', n: 2 } }, 'pedra', 'baixo'], [{ carry: { k: 'stone', n: 4 } }, 'pedras', 'baixo'],
    [{ carry: { k: 'food', n: 3, berries: 1 } }, 'cesta', 'peito', 'tint'], [{ carry: { k: 'food', n: 2, crate: 1, fish: 'arenque', fishCol: '#a8c0d0' } }, 'caixaPeixe', 'peito', 'tint'],
    [{ carry: { k: 'sal', n: 3, crate: 1 } }, 'caixa', 'peito'], [{ carry: { k: 'water', n: 1, jar: 1 } }, 'jarro', 'cabeca'], [{ carry: { k: 'water', n: 1 } }, 'balde', 'lado'],
    [{ carry: { k: 'vinho', n: 2 }, _fac: 'grego' }, 'anfora', 'ombro'], [{ carry: { k: 'vinho', n: 2 }, _fac: 'nordico' }, 'barril', 'abraco'],
    [{ carry: { k: 'sal', n: 3 }, _fac: 'asteca' }, 'saco', 'costas'], [{ carry: { k: 'food', n: 3, basket: '#d8902a' }, _fac: 'egipcio' }, 'cesta', 'cabeca', 'tint'],
    [{ gear: 'rede' }, 'rede', 'ombro'], [{ gear: 'remo' }, 'remo', 'ombro'], [{ carry: { k: 'food', n: 4, meat: 'cervo' } }, 'carne', 'ombro'], [{ carry: { k: 'food', n: 3, hay: 1 } }, 'fardo', 'ombro', 'tint'],
    [{ carry: { k: 'food', n: 1, fish: 'truta' } }, 'peixe', 'lado', 'tint'], [{ carry: { k: 'food', n: 4, fish: 'truta' } }, 'cambada', 'lado', 'tint'], [{ carry: { k: 'moedas', n: 6 } }, 'bolsa', 'lado'],
    [{ carry: { k: 'joias', n: 1 } }, 'caixinha', 'peito'], [{ carry: { k: 'tecido', n: 2 } }, 'rolo', 'ombro', 'tint'], [{ carry: { k: 'ceramica', n: 2 } }, 'potes', 'peito'], [{ carry: { k: 'queijo', n: 2 } }, 'queijo', 'peito'],
  ];
  const bad = []; let same = true;
  for (const [o, form, grip, tint] of cases) {
    const v = person(o); const civ = o._fac || 'nordico'; const H = P3.held(v, civ);
    if (!H) { bad.push(`${JSON.stringify(o)}: nada na mão`); continue; }
    if (H.form !== form || H.grip !== grip) bad.push(`${JSON.stringify(o.carry || o.gear)} (${civ}): ${H.form}/${H.grip}, esperado ${form}/${grip}`);
    if (tint && !H.tint) bad.push(`${H.form}: sem a cor do que leva`);
    if (!(H.kg > 0) || !H.size) bad.push(`${H.form}: peso ${H.kg}`);
    if (P3.held(v, civ) !== H) same = false; // (the same load, the same thing — not made again each frame)
  }
  const none = P3.held(person({}), 'nordico') === null && P3.held(person({ carry: { k: 'wood', n: 0 } }), 'nordico') === null;
  ok('a carga é o registro do mundo: o bem, as marcas, o equipamento, o jeito do povo — e nada na mão sem carga', !bad.length && none && same, bad.slice(0, 4).join(' · ') || `${cases.length} cargas, todas certas; sem carga, nada; a mesma carga, a mesma coisa`); }

// ------------------------------ 3. in every grip: the palms on it, it outside the trunk, above the ground ------------------------------
// (the palms, the thing's own grip points, the trunk as an ellipse in its frame)
const PALM_OF = {
  peito: (w, h, d) => [[w / 2 + 0.012, -h * 0.15, 0.02], [-(w / 2 + 0.012), -h * 0.15, 0.02]], baixo: (w, h, d) => [[w / 2 + 0.012, -h * 0.3, 0], [-(w / 2 + 0.012), -h * 0.3, 0]],
  abraco: (w, h, d) => [[w * 0.33, 0.02, d * 0.4], [-w * 0.33, 0.02, d * 0.4]], bracos: (w, h) => [[0.22, -h * 0.5 - 0.01, 0.03], [-0.22, -h * 0.5 - 0.01, 0.03]],
};
function stand(H, o) {
  o = o || {}; const L = P3.look(person(Object.assign({ carry: { k: 'food', n: 1 } }, o.v || {}))); L.held = H; L.carry = true; L.ground = 0; L.plant = [{ on: 0 }, { on: 0 }]; if (o.reach) L.reach = o.reach; if (o.str) L.str = o.str;
  const st = o.st || 'carry', t = o.t === undefined ? 0.7 : o.t, sp = o.sp || 0;
  const pose = Object.assign(A.POSE0(), A.hold(A.pose(st, t, sp), L, st, t, sp)); pose.holdW = 1;
  const R = P3.rig(0, 0, 0, Math.PI / 2, pose, L);
  return { R, L, pose };
}
function measure(H, R) {
  const C = R[B.carry]; const s = 1; void s;
  const palms = P3.palms(R); const out = { d: 0, inTrunk: 0, low: 1e9, nan: 0 };
  for (const m of R) for (const e of m.elements) if (!Number.isFinite(e)) out.nan++;
  const P = (PALM_OF[H.grip] || (() => [null, null]))(H.size[0], H.size[1], H.size[2]);
  for (let q = 0; q < 2; q++) { if (!P[q] || !H.hands.includes(q ? 'R' : 'L')) continue; const g = V(P[q][0], P[q][1], P[q][2]).applyMatrix4(C); out.d = Math.max(out.d, g.distanceTo(palms[q])); }
  // (the thing's box, corners and faces, against the trunk: an ellipse 0.19 × 0.12 m from the waist to the shoulders)
  const ci = R[B.chest].clone().invert(); const [w, h, d] = H.size;
  for (const x of [-0.5, 0, 0.5]) for (const y of [-0.5, 0, 0.5]) for (const z of [-0.5, 0, 0.5]) {
    const p = V(x * w, y * h, z * d).applyMatrix4(C); out.low = Math.min(out.low, p.y);
    const l = p.clone().applyMatrix4(ci); if (l.y > 0.02 && l.y < 0.5 && (l.x / 0.19) ** 2 + (l.z / 0.12) ** 2 < 1) out.inTrunk++;
  }
  return out;
}
{ const loads = [[{ k: 'food', n: 2, crate: 1, fish: 'arenque', fishCol: '#a8c0d0' }], [{ k: 'stone', n: 2 }], [{ k: 'stone', n: 4 }], [{ k: 'food', n: 3, berries: 1 }], [{ k: 'wood', n: 4 }], [{ k: 'vinho', n: 2 }, 'nordico'], [{ k: 'joias', n: 1 }], [{ k: 'ceramica', n: 2 }], [{ k: 'queijo', n: 2 }]];
  const bad = [], info = [];
  for (const [c, civ] of loads) {
    const H = P3.held(person({ carry: c }), civ || 'nordico');
    for (const [st, t, sp] of [['carry', 0.7, 0], ['carry', 3.1, 0], ['carryWalk', 0.4, 1.3], ['carryWalk', 2.2, 1.3], ['carryWalk', 4.5, 1.3]]) {
      const { R } = stand(H, { st, t, sp }); const m = measure(H, R);
      if (m.nan) bad.push(`${H.form} ${st}: ${m.nan} números inválidos`);
      if (m.d > 0.035) bad.push(`${H.form} ${st} t=${t}: a palma a ${(m.d * 100).toFixed(1)} cm da pegada`);
      if (m.inTrunk) bad.push(`${H.form} ${st}: ${m.inTrunk} pontos dentro do tronco`);
      if (m.low < -0.02) bad.push(`${H.form} ${st}: abaixo do chão (${m.low.toFixed(2)})`);
    }
    const m0 = measure(H, stand(H).R); info.push(`${H.form}/${H.grip} ${(m0.d * 100).toFixed(1)} cm`);
  }
  ok('em cada pegada de duas mãos, parado e andando: as palmas na coisa (≤3,5 cm), a coisa fora do tronco e acima do chão', !bad.length, bad.slice(0, 5).join(' · ') || info.join(', ')); }
// (the other grips: on the shoulder the right hand on it, on the head the left hand on it and the thing over the head; hanging
// from the fist the thing under the palm; on the back the thing behind the trunk)
{ const bad = [], info = [];
  const one = (c, civ, gear) => P3.held(person(gear ? { gear } : { carry: c }), civ || 'nordico');
  { const H = one({ k: 'sal', n: 3 }); const { R } = stand(H); const pr = P3.palms(R)[1]; const C = R[B.carry]; const loc = pr.clone().applyMatrix4(C.clone().invert());
    const on = Math.abs(loc.x) < H.size[0] / 2 + 0.05 && Math.abs(loc.y) < H.size[1] / 2 + 0.05 && Math.abs(loc.z) < H.size[2] / 2 + 0.05; const sh = V(-0.235, 0.46, 0).applyMatrix4(R[B.chest]);
    if (!on) bad.push(`saco no ombro: a mão direita fora dele (${loc.x.toFixed(2)}, ${loc.y.toFixed(2)}, ${loc.z.toFixed(2)})`);
    if (C.elements[13] < sh.y) bad.push('saco no ombro: abaixo do ombro'); info.push('ombro'); }
  { const H = one({ k: 'water', n: 1, jar: 1 }); const { R } = stand(H); const head = V().setFromMatrixPosition(R[B.head]); const C = R[B.carry]; const pl = P3.palms(R)[0]; const loc = pl.clone().applyMatrix4(C.clone().invert());
    if (C.elements[13] - H.size[1] / 2 < head.y + 0.2) bad.push(`jarro na cabeça: o fundo a ${(C.elements[13] - H.size[1] / 2 - head.y).toFixed(2)} m do pescoço`);
    if (Math.hypot(loc.x, loc.z) > H.size[0] / 2 + 0.05 || Math.abs(loc.y) > H.size[1] / 2 + 0.05) bad.push('jarro na cabeça: a mão esquerda longe dele');
    if (Math.abs(C.elements[5] - 1) > 0.02) bad.push('jarro na cabeça: não está de pé'); info.push('cabeça'); }
  for (const c of [{ k: 'water', n: 1 }, { k: 'moedas', n: 4 }, { k: 'food', n: 1, fish: 'truta' }]) { const H = one(c); const { R } = stand(H, { st: 'carryWalk', t: 1.1, sp: 1.2 }); const pr = P3.palms(R)[1]; const C = R[B.carry];
    const top = V(0, H.size[1] / 2, 0).applyMatrix4(C); if (Math.hypot(pr.x - C.elements[12], pr.z - C.elements[14]) > 0.03 || pr.y < C.elements[13]) bad.push(`${H.form} pendurado: não está sob a palma`);
    if (C.elements[13] - H.size[1] / 2 < -0.02) bad.push(`${H.form} pendurado: arrasta no chão`); void top; info.push(H.form); }
  { const H = one({ k: 'sal', n: 3 }, 'asteca'); const { R } = stand(H); const loc = V().setFromMatrixPosition(R[B.carry]).applyMatrix4(R[B.chest].clone().invert());
    if (!(loc.z < -0.12)) bad.push(`nas costas: o saco não está atrás do tronco (z ${loc.z.toFixed(2)})`); info.push('costas'); }
  ok('no ombro, na cabeça, pendurado da mão e nas costas: cada coisa onde a pegada diz, a mão nela', !bad.length, bad.slice(0, 4).join(' · ') || info.join(', ')); }

// ------------------------------ 4. the weight in the pose ------------------------------
{ const light = P3.held(person({ carry: { k: 'food', n: 1, berries: 1 } }), 'nordico'), heavy = P3.held(person({ carry: { k: 'stone', n: 4 } }), 'nordico'), crate = P3.held(person({ carry: { k: 'food', n: 4, crate: 1 } }), 'nordico');
  const lean = H => stand(H).pose.lean, knee = H => stand(H).pose.knL;
  const lL = lean(light), lC = lean(crate), lH = lean(heavy); const kid = stand(crate, { str: 0.35 }).pose.lean;
  const bucket = P3.held(person({ carry: { k: 'water', n: 1 } }), 'nordico'); const sw = stand(bucket).pose.sway;
  const back = P3.held(person({ carry: { k: 'sal', n: 3 } }), 'asteca'); const lb = lean(back);
  const c1 = lL > lC && lC > lH && kid < lC && knee(heavy) > knee(light) && sw < 0 && lb > 0.1;
  ok('o peso na pose: mais pesado, mais para trás e os joelhos mais dobrados; uma criança se inclina mais com a mesma caixa; o balde inclina para o outro lado; a carga nas costas curva para a frente', c1,
    `inclinação (negativa: para trás) cesta ${lL.toFixed(2)} · caixa ${lC.toFixed(2)} · pedras ${lH.toFixed(2)} · a caixa numa criança ${kid.toFixed(2)} · joelho pedras ${knee(heavy).toFixed(2)} contra cesta ${knee(light).toFixed(2)} · balde: ${sw.toFixed(2)} · nas costas ${lb.toFixed(2)}`); }

// ------------------------------ 5. the reach down to a load on the ground, and the lift ------------------------------
{ const H = P3.held(person({ carry: { k: 'food', n: 2, crate: 1, fish: 'arenque', fishCol: '#a8c0d0' } }), 'nordico');
  const P = [0, H.size[1] / 2, 0.62]; // (a crate on the ground before the feet — the body faces +Z with yaw π/2)
  const rows = []; const bad = [];
  for (const w of [1, 0.75, 0.5, 0.25, 0]) {
    const { R, pose } = stand(H, { reach: { X: P[0], Y: P[1], Z: P[2], w } }); const m = measure(H, R); const c = V().setFromMatrixPosition(R[B.carry]);
    rows.push({ w, y: +c.y.toFixed(2), palm: +(m.d * 100).toFixed(1), crouch: +pose.crouch.toFixed(2) });
    if (m.nan) bad.push(`w=${w}: números inválidos`); if (m.d > 0.045) bad.push(`w=${w}: a palma a ${(m.d * 100).toFixed(1)} cm`); if (m.inTrunk) bad.push(`w=${w}: dentro do tronco`); if (m.low < -0.025) bad.push(`w=${w}: abaixo do chão`);
  }
  const atGround = Math.abs(rows[0].y - P[1]) < 0.03, rises = rows.every((r, i) => !i || r.y >= rows[i - 1].y - 0.005), bends = rows[0].crouch > 0.3 && rows[4].crouch < 0.1;
  ok('levantar do chão: com o alcance inteiro a caixa está no chão diante dos pés e o corpo agachado; ela sobe até o peito sem largar as mãos', !bad.length && atGround && rises && bends, bad.slice(0, 3).join(' · ') || rows.map(r => `w ${r.w}: y ${r.y} m, palma ${r.palm} cm, agachado ${r.crouch}`).join(' · '));
  // (the empty hands reaching for it, before the world puts it in them)
  const L = P3.look(person({})); L.ground = 0; L.plant = [{ on: 0 }, { on: 0 }]; L.reach = { X: P[0], Y: P[1], Z: P[2], w: 1, wid: H.size[0] };
  const pose = Object.assign(A.POSE0(), A.hold(A.pose('idle', 0.7, 0), L, 'idle', 0.7, 0)); const R = P3.rig(0, 0, 0, Math.PI / 2, pose, L); const pl = P3.palms(R);
  const dl = pl[0].distanceTo(V(P[0] + H.size[0] / 2, P[1], P[2])), dr = pl[1].distanceTo(V(P[0] - H.size[0] / 2, P[1], P[2]));
  ok('as mãos vazias alcançam a caixa no chão antes de o mundo passá-la às mãos', Math.max(dl, dr) < 0.06, `palma esquerda a ${(dl * 100).toFixed(1)} cm, direita a ${(dr * 100).toFixed(1)} cm do lado da caixa; agachado ${pose.crouch.toFixed(2)}`); }

// ------------------------------ 6. the world's people: reaching, lifting, setting down as the world's acts say ------------------------------
{ const v = person({ act: 'lift' }); const s = { yaw: Math.PI / 2, X: 0, Z: 0 }; const steps = []; const dt = 1 / 30;
  const L0 = () => { const L = P3.look(v); L.ground = 0; return L; };
  for (let k = 0; k < 24; k++) { const L = L0(); P3.reachOf(s, v, L, 0, 0, 0, dt); steps.push(['alcança', L.reach ? +L.reach.w.toFixed(2) : 0, !!L.held]); }
  v.carry = { k: 'food', n: 2, crate: 1, fish: 'arenque', fishCol: '#a8c0d0' }; // (the world's contact: the crate passes to the hands)
  let liftY = []; for (let k = 0; k < 20; k++) { const L = L0(); P3.reachOf(s, v, L, 0, 0, 0, dt); const pose = Object.assign(A.POSE0(), A.hold(A.pose('carry', k * dt, 0), L, 'carry', k * dt, 0)); pose.holdW = 1; L.plant = [{ on: 0 }, { on: 0 }]; const R = P3.rig(0, 0, 0, Math.PI / 2, pose, L); liftY.push(+R[B.carry].elements[13].toFixed(2)); if (k === 6) v.act = 'carregar'; }
  v.act = 'pousar'; let put = []; for (let k = 0; k < 20; k++) { const L = L0(); P3.reachOf(s, v, L, 0, 0, 0, dt); put.push(L.reach ? +L.reach.w.toFixed(2) : 0); }
  v.carry = null; v.act = ''; const L = L0(); P3.reachOf(s, v, L, 0, 0, 0, dt); const after = L.held === null;
  const reached = steps[steps.length - 1][1] > 0.95 && !steps.some(q => q[2]);
  const lifted = liftY[0] < 0.35 && liftY[liftY.length - 1] > 0.9 && liftY.every((y, i) => !i || y >= liftY[i - 1] - 0.01);
  const setdown = put[put.length - 1] > 0.95 && put.every((w, i) => !i || w >= put[i - 1]);
  ok('os moradores: no ato de levantar as mãos vão até a caixa (nada na mão até o mundo passar a caixa); a caixa sobe de onde as mãos estavam; no ato de pousar ela desce; tirada pelo mundo, some da mão', reached && lifted && setdown && after,
    `alcance ${steps.slice(-1)[0][1]} · a caixa subindo ${liftY.slice(0, 3).join(', ')} … ${liftY.slice(-2).join(', ')} m · pousando ${put.slice(-1)[0]} · depois: ${after ? 'mãos vazias' : 'ainda na mão'}`); }

// ------------------------------ 7. the torch and the spear given up; a load set down while the hands work ------------------------------
{ night = 1;
  const torch2 = P3.look(person({ id: 300, moving: true, carry: { k: 'food', n: 2, crate: 1 } })).torch, torch1 = P3.look(person({ id: 303, moving: true, carry: { k: 'water', n: 1 } })).torch, torch0 = P3.look(person({ id: 306, moving: true })).torch;
  night = 0;
  const spear = P3.look(person({ role: 'guerreiro', carry: { k: 'sal', n: 2 } })).tool, spear0 = P3.look(person({ role: 'guerreiro' })).tool;
  const Lw = P3.look(person({ act: 'chop', carry: { k: 'wood', n: 2 } }));
  let down = null; if (Lw.held) { Lw.ground = 0; Lw.plant = [{ on: 0 }, { on: 0 }]; const pose = Object.assign(A.POSE0(), A.hold(A.pose('swing', 0.3, 0), Lw, 'swing', 0.3, 0)); const R = P3.rig(0, 0, 0, Math.PI / 2, pose, Lw); down = R[B.carry].elements[13] - Lw.held.size[1] / 2; }
  ok('de noite, a caixa de duas mãos tira a tocha (o balde numa mão, não); a carga no ombro guarda a lança; trabalhando, a carga espera no chão ao lado', torch0 && !torch2 && torch1 && spear0 && !spear && Lw.held && Lw.held.grip === 'chao' && Math.abs(down) < 0.02,
    `tocha: sem carga ${torch0}, com a caixa ${torch2}, com o balde ${torch1} · lança: ${spear0} → ${spear} · cortando lenha: ${Lw.held ? Lw.held.grip : '-'} com o fundo a ${down === null ? '-' : down.toFixed(3)} m do chão`); }

console.log(fails.length ? `FALHAS: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
