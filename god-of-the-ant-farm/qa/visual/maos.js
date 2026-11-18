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
G.W = G.W || {}; G.Render = { nightness: () => night }; G.Art = { CLOTH: {}, icon: () => null }; G.Fac = { ofV: v => (v._fac ? { civ: v._fac, id: 1, leader: 0 } : null), idOfV: v => (v._fac ? 1 : null), hex: () => '#884422' }; // (idOfV: the kit asks for the people of each one — 20h)
try { run('js/civs.js'); } catch (e) { } // (the peoples' colours, for the clothes)
run('js/bodymesh.js'); run('js/body3d.js'); run('js/people3d.js');
// (20a: what the hands hold is the inventory's — G.Inv.held, D-336 —, and the body's animation is in the anim-*.js after people3d.js)
run('js/itens.js');
// (20c: the inventory is a module of the world — as it loads it hangs on the Depot's doors and the acts' hooks; here, with no world,
// those are bare shelves that answer nothing: what the hands hold, G.Inv.held, asks none of them — T-1367)
G.Depot = G.Depot || { addKind() { }, onMove: [], may: () => ({ ok: false }), move: () => 0, weight: () => 0, parse: r => String(r).split(':') };
G.Act = G.Act || { hooks: { tick: [], possess: [] } }; G.Eco = G.Eco || { name: k => k };
run('js/inventario.js'); { const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'); const a = html.indexOf('<!-- 22a: os personagens — os arquivos do 3D'), b = html.indexOf('<!-- 22c:', a); for (const m of html.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)) if (/^js\/(anim-|vida|social-clips|duo-clips|grupo-clips|rosto)/.test(m[1]) || (a >= 0 && b > a && m.index > a && m.index < b)) run(m[1]); } // (the body's files in the page's order: the animation and the life that is seen, 22c; the look and the clothes, 22a)
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
  let liftY = []; for (let k = 0; k < 20; k++) { const L = L0(); P3.reachOf(s, v, L, 0, 0, 0, dt); const pose = Object.assign(A.POSE0(), A.hold(A.pose('carry', k * dt, 0), L, 'carry', k * dt, 0)); pose.holdW = 1; L.plant = [{ on: 0 }, { on: 0 }]; const R = P3.rig(0, 0, 0, Math.PI / 2, pose, L); liftY.push(+R[B.carry].elements[13].toFixed(2)); if (k === 6) v.act = ''; } // (G.Act.ANIM.carregar.act: walking with it)
  v.act = 'lift'; let put = []; for (let k = 0; k < 20; k++) { const L = L0(); P3.reachOf(s, v, L, 0, 0, 0, dt); put.push(L.reach ? +L.reach.w.toFixed(2) : 0); } // (G.Act.ANIM.pousar.act: the same gesture, with the load in the hands)
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
  // (the spear in the hand is the inventory's kit — G.Inv.held, a key with its material, 'lanca.pedra' —: the Greek warrior's (the
  // Norse one carries an axe), in the hand without a load, stowed on the back under one — T-1367)
  const isSpear = k => !!k && G.Itens.parse(k)[0] === 'lanca';
  const Ls = P3.look(person({ role: 'guerreiro', civ: 'grego', carry: { k: 'sal', n: 2 } })), spear = isSpear(Ls.inv.mao) || !isSpear(Ls.inv.costas), spear0 = isSpear(P3.look(person({ role: 'guerreiro', civ: 'grego' })).inv.mao);
  const Lw = P3.look(person({ act: 'chop', carry: { k: 'wood', n: 2 } }));
  let down = null; if (Lw.held) { Lw.ground = 0; Lw.plant = [{ on: 0 }, { on: 0 }]; const pose = Object.assign(A.POSE0(), A.hold(A.pose('swing', 0.3, 0), Lw, 'swing', 0.3, 0)); const R = P3.rig(0, 0, 0, Math.PI / 2, pose, Lw); down = R[B.carry].elements[13] - Lw.held.size[1] / 2; }
  ok('de noite, a caixa de duas mãos tira a tocha (o balde numa mão, não); a carga no ombro guarda a lança; trabalhando, a carga espera no chão ao lado', torch0 && !torch2 && torch1 && spear0 && !spear && Lw.held && Lw.held.grip === 'chao' && Math.abs(down) < 0.02,
    `tocha: sem carga ${torch0}, com a caixa ${torch2}, com o balde ${torch1} · lança: ${spear0} → ${spear} · cortando lenha: ${Lw.held ? Lw.held.grip : '-'} com o fundo a ${down === null ? '-' : down.toFixed(3)} m do chão`); }

// ------------------------------ 22c: the things of daily life (D-612) ------------------------------
// (the cup at the lips, the bonds on both wrists, the crutch from under the arm to where the lost leg's foot stands, the ball clear
// of the thigh — each thing given in the hand as the inventory would (L.inv), driven by the game's animator in the gesture that
// holds it; and each one drawn: the bonds in two pieces, one on each wrist)
if (!G.ItemArt) { run('js/itemforma.js'); run('js/itemarte.js'); }
{ const IA = G.ItemArt; const bad = [], info = [];
  const INV0 = { mao: null, outra: null, costas: null, cinto: null, cabeca: null, corpo: null, real: false };
  // (a body driven by the animator in a state, 60 frames a second, walking at sp along +Z; each frame measured)
  function drive(st, o, each) {
    const L = Object.assign(P3.look(person({ age: o.age || 30 })), { plant: [{ on: 0 }, { on: 0 }], ground: 0, gnd: null, held: null, carry: false, reach: null, pair: null, lod: 0, inv: Object.assign({}, INV0, o.inv) });
    const mem = A.memory(), pose = A.POSE0(), I = {}; const dt = 1 / 60; let z = 0;
    for (let i = 0; i < Math.round((o.T || 2.6) / dt); i++) {
      const t = i * dt; z += (o.sp || 0) * dt; const C = A.CLIPS[st];
      Object.assign(I, { st, t, sp: o.sp || 0, yaw: Math.PI / 2, yawV: 0, acc: 0, X: 0, Z: z, ground: 0, s: L.s, run: 0, walk: o.sp ? 1 : 0, over: o.over || null, overK: o.over ? (t % 2) / 2 : undefined, clipK: C ? (C.loop ? (t / C.dur) % 1 : Math.min(1, t / C.dur)) : undefined, drunk: 0, tired: 0, id: 7, porte: null, clock: t });
      A.drive(mem, I, pose, L, dt); const R = P3.rig(0, 0, z, Math.PI / 2, pose, L); each(R, pose, L, t);
    }
  }
  const at = (F, p) => V(p[0], p[1], p[2]).applyMatrix4(F);
  // the cup: at the belly upright; at the sip its rim's near side at the lips, tipped toward the face (the drink, ato-beber)
  for (const key of ['caneca.madeira', 'caneca.barro']) { const m = IA.marks(key); let near = 9, tilt = 0, upright = 1, tipped = false;
    drive('ato-beber', { inv: { mao: key } }, (R, pose, L, t) => { if (!pose.tool) return; const F = R[B.tool]; const hi = R[B.head].clone().invert(); const up = V(F.elements[4], F.elements[5], F.elements[6]).normalize();
      const rim = at(F, m.boca).applyMatrix4(hi), upH = up.clone().transformDirection(hi); const toF = V(0, 0, -1); const inR = toF.sub(upH.clone().multiplyScalar(-upH.z)).normalize(); const lip = rim.add(inR.multiplyScalar(0.042));
      const d = lip.distanceTo(V(0, 0.075, 0.11)); if (d < near) { near = d; tilt = Math.acos(Math.max(-1, Math.min(1, upH.y))) * 180 / Math.PI; tipped = upH.z < -0.15; }
      if (t < 0.2 || t > 2.3) upright = Math.min(upright, up.y); });
    if (near > 0.035) bad.push(`${key}: a borda a ${(near * 100).toFixed(1)} cm dos lábios no gole`); // (3 cm short: the cape over the shoulder, T-1622) if (!(tilt > 30 && tilt < 85) || !tipped) bad.push(`${key}: no gole inclinada ${tilt.toFixed(0)}° (${tipped ? 'para o rosto' : 'não para o rosto'})`);
    if (upright < 0.9) bad.push(`${key}: segurada na barriga deitada (o eixo para cima ${upright.toFixed(2)})`);
    info.push(`${key.split('.')[1]}: a borda a ${(near * 100).toFixed(1)} cm dos lábios, ${tilt.toFixed(0)}°`); }
  // the bonds: the other palm on its place, each ring round its wrist — standing (the posture), walking (the clip over the stride)
  for (const [st, sp, over] of [['bound', 0, null], ['walk', 1.1, 'bound-andar']]) for (const key of ['grilhoes.corda', 'grilhoes.ferro']) { let wr = 0, wl = 0, lp = 0, n = 0;
    const C = G.ItemForma.cuffs, off = IA.grip(key).off;
    drive(st, { sp, over, T: 2, inv: { mao: key } }, (R, pose, L, t) => { if (t < 0.6) return; n++;
      // (the right ring in the right fist's frame, the left in the left's — as the drawing puts them: G.People3D's RX.alg)
      const rR = at(R[B.tool], C.WR), wR = V().setFromMatrixPosition(R[B.hdR]); wr = Math.max(wr, rR.distanceTo(wR));
      const FL = new THREE.Matrix4().copy(R[B.hdL]).multiply(new THREE.Matrix4().makeTranslation(-0.027, -0.076, 0)).multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2 + (pose.tool ? pose.wristL || 0 : 0))).multiply(new THREE.Matrix4().makeTranslation(-0.051, 0, 0));
      const rL = at(FL, C.WL), wL = V().setFromMatrixPosition(R[B.hdL]); wl = Math.max(wl, rL.distanceTo(wL)); lp = Math.max(lp, at(R[B.tool], off).distanceTo(P3.palms(R)[0])); });
    if (!n || wr > 0.03 || wl > 0.03 || lp > 0.015) bad.push(`${key} ${over || st}: a argola direita a ${(wr * 100).toFixed(1)} cm do pulso, a esquerda a ${(wl * 100).toFixed(1)}, a outra palma a ${(lp * 100).toFixed(1)} cm do lugar dela`);
    else info.push(`${key.split('.')[1]} ${over || st}: argolas a ${(Math.max(wr, wl) * 100).toFixed(1)} cm dos pulsos`); }
  // the crutch: under that armpit, the palm on it, its foot on the ground where the lost leg's foot stands — never under it, swung low
  for (const [side, sp] of [['mao', 0], ['mao', 1.1], ['outra', 1.1]]) { let pad = [9, 0], palm = 0, low = 9, high = 0, kY = [9, 0], ok = 0, n = 0, slip = 0; let last = null;
    drive(sp ? 'walk' : 'idle', { sp, T: 3, inv: { [side]: 'muleta.madeira' } }, (R, pose, L, t) => { if (t < 0.5) return; n++; const CR = P3.CR; if (!CR.ok) return; ok++;
      const sh = V().setFromMatrixPosition(R[CR.k ? B.shR : B.shL]); const dp = CR.A.distanceTo(sh); pad = [Math.min(pad[0], dp), Math.max(pad[1], dp)];
      palm = Math.max(palm, P3.palms(R)[CR.k].distanceTo(CR.G)); low = Math.min(low, CR.T.y); high = Math.max(high, CR.T.y); kY = [Math.min(kY[0], CR.kY), Math.max(kY[1], CR.kY)];
      // (a foot of the crutch down — under a centimetre — keeps its place, as a foot planted does)
      if (CR.T.y < 0.01 && last && last.y < 0.01) slip = Math.max(slip, Math.hypot(CR.T.x - last.x, CR.T.z - last.z) * (sp ? 1 : 0)); last = { x: CR.T.x, y: CR.T.y, z: CR.T.z }; });
    const want = side === 'mao' ? 1 : 0;
    if (ok < n || P3.CR.k !== want) bad.push(`muleta na ${side}: ${ok} de ${n} quadros com ela, do lado ${P3.CR.k}`);
    if (pad[0] < 0.1 || pad[1] > 0.2) bad.push(`muleta na ${side}: a almofada a ${(pad[0] * 100).toFixed(0)}–${(pad[1] * 100).toFixed(0)} cm do ombro`);
    if (palm > 0.012) bad.push(`muleta na ${side}: a palma a ${(palm * 100).toFixed(1)} cm dela`); if (low < -0.005 || high > 0.08) bad.push(`muleta na ${side}: o pé dela de ${(low * 100).toFixed(1)} a ${(high * 100).toFixed(1)} cm do chão`);
    if (kY[0] < 0.9 || kY[1] > 1.1) bad.push(`muleta na ${side}: esticada de ${kY[0].toFixed(2)} a ${kY[1].toFixed(2)}`); if (slip > 0.012) bad.push(`muleta na ${side}: o pé dela escorrega ${(slip * 100).toFixed(1)} cm num quadro`);
    if (!bad.some(b => b.startsWith('muleta na ' + side))) info.push(`muleta ${side}${sp ? ' andando' : ''}: a palma a ${(palm * 100).toFixed(1)} cm, o pé de ${(low * 100).toFixed(1)} a ${(high * 100).toFixed(1)} cm`); }
  // the ball: carried by a child walking, clear of the thigh, above the ground
  { let worst = 9, low = 9; const r = 0.072; const c0 = IA.marks('bola.couro').centro;
    drive('walk', { sp: 0.9, T: 2, age: 8, inv: { mao: 'bola.couro' } }, (R, pose, L, t) => { if (t < 0.5) return; const c = at(R[B.tool], c0); const th = V().setFromMatrixPosition(R[B.thR]), kn = V().setFromMatrixPosition(R[B.snR]);
      const ax = kn.clone().sub(th); const u = Math.max(0, Math.min(1, c.clone().sub(th).dot(ax) / ax.lengthSq())); worst = Math.min(worst, c.distanceTo(th.clone().add(ax.multiplyScalar(u)))); low = Math.min(low, c.y - r * L.s); });
    if (worst < r * 0.75 + 0.07 || low < 0) bad.push(`a bola a ${(worst * 100).toFixed(1)} cm do eixo da coxa, o fundo a ${(low * 100).toFixed(1)} cm do chão`); else info.push(`a bola a ${(worst * 100).toFixed(0)} cm da coxa`); }
  // and drawn: each thing in the frame of the hand that holds it — the bonds in two pieces
  { const v = person({ act: 'bound' }); const L = P3.look(v); L.inv = Object.assign({}, INV0, { mao: 'grilhoes.ferro' }); L.ground = 0; L.plant = [{ on: 0 }, { on: 0 }];
    const pose = Object.assign(A.POSE0(), A.pose('bound', 0, 0)); P3.toolsReset(); G.Body3D.begin(); P3.body(0, 0, 0, 0, Math.PI / 2, pose, L, null); G.Body3D.end();
    const drawn = P3.tools().filter(x => x[0] === 'grilhoes.ferro'); if (drawn.length !== 2) bad.push(`os grilhões desenhados em ${drawn.length} pedaço(s), não em dois`); }
  ok('as coisas do dia (22c): a caneca nos lábios, os grilhões nos dois pulsos, a muleta debaixo do braço até o chão, a bola longe da coxa', !bad.length, bad.length ? bad.slice(0, 6).join(' · ') : info.join(' · ')); }

// ------------------------------ 20a: what is worn — the helmet, the cuirass — and the hair under the helmet ------------------------------
// (the warrior's helmet is the inventory's kit, G.Inv.held(v).cabeca: drawn in its shape on the head, the hat and the hair of the
// outfit giving way to it; a cuirass the outfit's yoked garments give way to — D-349, D-350. Then the worn and the stowed things
// against the body that moves, in every pose, by the game's own rig and the skin bent on the CPU: qa/visual/vestir.js)
if (!G.ItemArt) { run('js/itemforma.js'); run('js/itemarte.js'); } // (the things' shapes, as the game has them: the helmet has no shape of old)
{ const w = person({ role: 'guerreiro', civ: 'grego' }), L = P3.look(w); const head = L.inv.cabeca, bad = [];
  if (!head || G.Itens.parse(head)[0] !== 'elmo') bad.push(`o guerreiro sem elmo do kit (${head})`);
  const out = L.out || {}; if (out.hatM || out.hairM) bad.push(`com o elmo, o chapéu «${out.hatM}» e o cabelo «${out.hairM}» desenhados`);
  const bare = P3.look(person({ role: 'agricultor', civ: 'grego' })); if (bare.inv.cabeca || !bare.out || !bare.out.hairM) bad.push('sem elmo, sem cabelo');
  const pose = A.POSE0(); L.ground = 0; L.plant = [{ on: 0 }, { on: 0 }]; P3.toolsReset(); G.Body3D.begin(); P3.body(0, 0, 0, 0, Math.PI / 2, pose, L, null); G.Body3D.end();
  const drawn = P3.tools().map(x => x[0]); if (head && !drawn.includes(head)) bad.push(`o elmo ${head} não desenhado (${drawn.join(', ')})`);
  ok('o elmo do kit desenhado na cabeça do guerreiro, sem o chapéu e o cabelo da roupa por baixo (sem elmo, o cabelo de sempre)', !bad.length, bad.length ? bad.join(' · ') : `${w.civ}: ${head} desenhado; a roupa sem chapéu e sem cabelo; o agricultor de cabelo «${bare.out.hairM}»`);}
{ const r = require('child_process').spawnSync(process.execPath, [path.join(__dirname, 'vestir.js')], { encoding: 'utf8', timeout: 900000 });
  const lines = String(r.stdout || '').split('\n').filter(l => /^(PASSOU|FALHOU) \| vestir /.test(l));
  for (const l of lines) { const m = l.match(/^(PASSOU|FALHOU) \| vestir (.*?) \| (.*)$/); if (m) ok('vestir: ' + m[2], m[1] === 'PASSOU', m[3]); }
  if (!lines.length || r.status !== 0 && !lines.some(l => l.startsWith('FALHOU'))) ok('vestir: a prova das coisas vestidas rodou', false, (r.stderr || r.error || '').toString().slice(0, 300)); }

console.log(fails.length ? `FALHAS: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
