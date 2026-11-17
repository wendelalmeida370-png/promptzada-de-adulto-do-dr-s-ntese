// vida3d: the life that is seen, proven in a ready world (22c, SOCIEDADE.md §4; D-590 to D-604). In Node, by qa/visual/tres-node.js
// (the game's 3D files, only their geometry), the ready world «cidade» (or the one named):
//   v1  every cause gives its porte and its pose: the proof's hand puts a person of the world in the case (the cold of the map,
//       the noon of a hot land, the rain, the sickness, the wound, the leg lost, the child to come, the grief, the fear, the fury,
//       the years, the childhood, the tiredness, the standing) — the reader (G.Vida3D.porteOf) gives its cause, and the animator
//       (G.Anim3D.drive) the pose of it (the channels of the cause, standing and walking, a difference over a threshold);
//   v2  and the opposite: without the cause, nothing of it — nobody shivers in the heat nor fans in the cold, a person in health
//       carries nothing; and the porte never comes from the look nor the people (two people alike but for the skin, the hair and
//       the people: the same porte);
//   v3  the errand as a pose (TASK_OF) and the act over the stride: the children's chase runs, the prisoner led walks with the
//       hands joined, the fight with a beast stands on guard, the grave's mourner bows;
//   v4  the bad cases, the frame going on through each: save and load in the middle (the view keeps nothing in the save; the
//       porte read again is the same), the person dies in the middle, the god's hand takes one of two who talk, the map changes
//       under someone drawn;
//   v5  the same world lived with the 3D drawing and without it gives the same save, byte for byte (and the world's chance untouched).
//   node qa/vida3d.js [cidade|metropole|…]     ONLY=v1,v3 for some parts
const path = require('path');
const T = require(path.join(__dirname, 'visual', 'tres-node.js'));
const { G, M } = T.load();
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null; const on = k => !ONLY || ONLY.has(k);
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | vida3d ${name} | ${info}`); if (!c) fails.push(name); };
const key = process.argv[2] || 'cidade';
M.pronto(key); M.viver(2);
const A = G.Anim3D, V3 = G.Vida3D, P3 = G.People3D; let S = G.S; const TL = G.Space.TILE;
const DAY = G.DAY_LEN || 200;
const r2 = x => Math.round(x * 100) / 100;
// (a grown person of the world in the open, awake, in health — the proof's subject; the proof's hand puts them in each case)
const adult = () => [...S.villagers.values()].find(v => v.age >= 25 && v.age < 45 && !v.inside && !v.aboard && !v.sleeping && !v.sick && !v.preg && !(v.mourn > 0) && !v.captive && v.g === 'm');
const blank = v => { v.age = 30; v.energy = 90; v.sick = 0; v.wound = null; v.hp = 100; v.lost = null; v.preg = 0; v.mourn = 0; v.fear = 0; v.fury = 0; v.emo = null; v.grp = 'povo'; v.inside = 0; v.sleeping = false; v.traits = v.traits.filter(t => t !== 'Corajoso' && t !== 'Medroso' && t !== 'Sociável'); };
// (the place of a person made mild, cold or hot by the proof's hand on a copy of the map: the map's warmth, the hour, the sky)
const mild = v => { S.temp[G.W.idx(v.x, v.y)] = 128; S.time = 0.35; S.weather.rain = 0; S.weather.storm = -1; };
// the animator on its own, the porte given: standing (idle) or walking at 1.3 m/s, a second and a half; the pose at the end
const LOOK = P3.look(adult() || [...S.villagers.values()][0]);
function poseOf(porte, st, extra) {
  const a = A.memory(), pose = A.POSE0(), L = Object.assign({}, LOOK, { plant: [{ on: 0 }, { on: 0 }], held: null, carry: false, reach: null, pair: null, gnd: null }); const I = {};
  let z = 0; const sp = st === 'walk' ? 1.3 : 0;
  for (let i = 0; i < 90; i++) { z += sp / 60; Object.assign(I, { st, t: i / 60, sp, yaw: Math.PI / 2, yawV: 0, acc: 0, X: 0, Z: z, ground: 0, s: 1, run: 0, walk: sp ? 1 : 0, over: null, overK: undefined, clipK: undefined, drunk: 0, tired: porte ? porte.cansado || 0 : 0, id: 11, porte, clock: i / 60, lefty: false }, extra || {}); A.drive(a, I, pose, L, 1 / 60); }
  return pose;
}
const diff = (p, q, js) => Math.max(...js.map(j => Math.abs((p[j] || 0) - (q[j] || 0))));
const ZERO = Object.fromEntries(V3.PORTE.map(k => [k, 0]));

if (on('v1') || on('v2')) {
  const v = adult(); blank(v); mild(v);
  const base = V3.porteOf(v, {}); const baseAny = base.any;
  // each case: the proof's hand, the cause the reader must give, the channels the pose must move (standing; walking: the gait's)
  const CASES = [
    ['frio', () => { S.temp[G.W.idx(v.x, v.y)] = 30; }, ['elL', 'elR', 'shLr', 'shRr', 'neck'], ['elL', 'elR', 'shLp', 'shRp']],
    ['calor', () => { S.temp[G.W.idx(v.x, v.y)] = 250; S.time = 0.36; }, ['shLr', 'shRr', 'neck'], ['shLr', 'shRr']],
    ['chuva', () => { S.weather.rain = 0.9; }, ['neck', 'elL', 'elR'], ['neck', 'elL']],
    ['doente', () => { v.sick = DAY * 0.5; }, ['elR', 'shRp', 'lean'], ['lean']],
    ['ferido', () => { v.wound = { d: S.day, sev: 'grave', bt: 0 }; }, ['elL', 'shLp'], ['elL']],
    ['manca', () => { v.lost = { leg: true }; }, ['tilt'], ['tilt']],
    ['gravida', () => { v.g = 'f'; v.preg = DAY * 0.15; }, ['elR', 'lean'], ['lean']],
    ['luto', () => { v.mourn = DAY * 0.3; }, ['neck', 'elL', 'elR'], ['neck']],
    ['medo', () => { v.fear = 95; }, ['elL', 'elR', 'shLp'], ['elL', 'elR']],
    ['furia', () => { v.fury = 30; }, ['grip', 'gripL', 'elL'], ['grip']],
    ['velho', () => { v.age = 79; }, ['lean', 'neck', 'elL'], ['lean', 'elL']],
    ['crianca', () => { v.age = 5; }, ['neck', 'shLr'], ['neck']],
    ['cansado', () => { v.energy = 8; }, ['lean', 'neck'], ['lean', 'neck']],
    ['nobre', () => { v.grp = 'nobreza'; }, ['shLp', 'elL'], ['neck']],
  ];
  const still0 = poseOf(ZERO, 'idle'), walk0 = poseOf(ZERO, 'walk');
  const res = [], bad = [];
  for (const [k, hand, chS, chW] of CASES) {
    blank(v); mild(v); v.g = 'm'; hand(); const p = V3.porteOf(v, {});
    const f = Math.abs(p[k]); const ps = poseOf(p, 'idle'), pw = poseOf(p, 'walk');
    const dS = diff(ps, still0, chS), dW = diff(pw, walk0, chW);
    // (the opposite: the other causes stay out — the cold gives no heat, the heat no cold, the sickness no fear…)
    const others = V3.PORTE.filter(q => q !== k && q !== 'confia' && q !== 'expans' && Math.abs(p[q]) > 0.05 && !(k === 'gravida' && q === 'crianca'));
    res.push(`${k} ${r2(f)} → parado ${r2(dS)} rad, andando ${r2(dW)} rad${others.length ? ' (e ' + others.join(', ') + ')' : ''}`);
    if (!(f >= 0.3 && dS > 0.08 && dW > 0.04 && !others.length)) bad.push(k);
  }
  blank(v); mild(v);
  if (on('v1')) ok('v1 cada causa dá o seu porte e a sua pose', !bad.length, (bad.length ? 'SEM POSE OU MISTURADO: ' + bad.join(', ') + ' · ' : '') + res.join(' · '));
  if (on('v2')) {
    // (nobody shivers in the heat, nobody fans in the cold; a person in health in a mild place carries nothing)
    S.temp[G.W.idx(v.x, v.y)] = 250; S.time = 0.36; const hot = V3.porteOf(v, {});
    const hotPose = poseOf(hot, 'idle'); const trem = [0, 1, 2, 3].map(i => poseOf(hot, 'idle', { clock: 2 + i * 0.013 }).twist); const shiver = Math.max(...trem) - Math.min(...trem);
    S.temp[G.W.idx(v.x, v.y)] = 30; const cold = V3.porteOf(v, {});
    S.time = 0.9; S.temp[G.W.idx(v.x, v.y)] = 250; const hotNight = V3.porteOf(v, {});
    blank(v); mild(v); const calm = V3.porteOf(v, {});
    // (the look and the people never decide the porte: the same person with another skin, hair and people)
    const twin = Object.assign({}, v, { skin: '#3a2416', hair: '#e8d8a0', civ: v.civ === 'asteca' ? 'nordico' : 'asteca', _civ: 'egipcio', kidCloth: '#ff0000' });
    const a1 = JSON.stringify(V3.porteOf(v, {})), a2 = JSON.stringify(V3.porteOf(twin, {}));
    ok('v2 e o contrário: sem a causa, nada dela', hot.frio === 0 && hot.calor > 0.5 && shiver < 0.005 && cold.calor === 0 && cold.frio > 0.5 && hotNight.calor === 0 && !calm.any && a1 === a2 && !baseAny,
      `no calor do meio-dia: frio ${hot.frio}, calor ${r2(hot.calor)}, tremor ${r2(shiver * 1000)} mrad · no frio: calor ${cold.calor}, frio ${r2(cold.frio)} · a terra quente de noite: calor ${hotNight.calor} · a pessoa sã num lugar ameno: ${calm.any ? 'COM PORTE' : 'nada'} · outra pele, outro cabelo, outro povo: ${a1 === a2 ? 'o mesmo porte' : 'OUTRO PORTE'}`);
  }
}

if (on('v3')) {
  const kids = [...S.villagers.values()].filter(v => v.age >= 4 && v.age < 11 && !v.aboard);
  const k = kids[0], o = kids[1]; let chase = '—';
  if (k && o) { k.sleeping = false; k.inside = 0; G.Vg.setTask(k, { type: 'play', pri: 0.1, kind: 'play' }); k.task.st = 2; k.task.chase = o.id; k.task.rt = 0; chase = A.stateOf(k, 1.4); }
  const p = adult(); const keepAct = p.act; p.act = 'bound'; const boundWalk = V3.overOf(p, A.stateOf(p, 1.3)), boundStill = A.stateOf(p, 0); p.act = 'talk'; const talkWalk = V3.overOf(p, 'walk'); p.act = keepAct;
  const f = [...S.villagers.values()].find(v => v !== p && v.age >= 20 && !v.inside && !v.sleeping); const keepT = f.task;
  f.task = { type: 'fight', id: 0, pri: 4 }; f.act = ''; const fight = V3.taskState(f, { inv: { mao: null } }), fightArmed = V3.taskState(f, { inv: { mao: 'lanca.ferro' } }), fightSt = A.stateOf(f, 0);
  f.task = { type: 'funeral', id: 0, pri: 1.1 }; const fun = A.stateOf(f, 0); f.task = keepT;
  ok('v3 a tarefa como pose e o ato por cima de quem anda', (!k || chase === 'run') && boundWalk === 'bound-andar' && boundStill === 'bound' && talkWalk === 'talk' && fight === 'cb-guarda-punho' && fightArmed === 'cb-guarda-arma' && /^cb-guarda-/.test(fightSt) && fun === 'mourn',
    `a criança que persegue outra: «${chase}» · o preso andando: por cima «${boundWalk}», parado «${boundStill}» · quem fala andando: «${talkWalk}» · a luta com a fera entre dois golpes: «${fight}», com a lança «${fightArmed}», a dela «${fightSt}» · junto da cova: «${fun}»`);
}

if (on('v4')) {
  // the frame going on through the bad cases (the eye at a town's centre; the beasts set aside in this copy — nothing is saved)
  let best = null; for (const set of S.settlements.values()) if (!best || G.Village.pop(set.id) > G.Village.pop(best.id)) best = set;
  const focus = { X: best.cx * TL, Z: best.cy * TL }; const frames = n => { for (let k = 0; k < n; k++) P3.update(1 / 60, focus); };
  const errs = []; const tryF = (what, f) => { try { f(); } catch (e) { errs.push(what + ': ' + e.message); } };
  tryF('o quadro', () => frames(30));
  const drawn = () => P3.walkers.map(w => w[7]);
  // (save and load in the middle: the porte read again from the world is the porte of before; the view's memory starts again)
  // (the save keeps the world's numbers to their places — the ages to a thousandth, the places to a hundredth —: the porte read from
  // them again is the same to a hundredth)
  const ids = drawn().slice(0, 12); const before = ids.map(id => V3.porteOf(S.villagers.get(id), {}));
  const s0 = G.Save.serialize(); G.Save.apply(JSON.parse(s0)); S = G.S;
  const after = ids.map(id => (S.villagers.get(id) ? V3.porteOf(S.villagers.get(id), {}) : null));
  const same = before.every((b, i) => after[i] && V3.PORTE.every(k => Math.abs(b[k] - after[i][k]) < 0.01) && b.any === after[i].any); const memo = ids.filter(id => P3.visOf(id)).length;
  tryF('o quadro depois do load', () => frames(30));
  // (the person dies in the middle — gone from the world between two frames)
  const dead = drawn()[0]; tryF('a morte', () => { const v = S.villagers.get(dead); if (v) G.Village.kill(v, 'god', true); frames(20); });
  const ghost = !!P3.visOf(dead);
  // (two who talk; the god's hand takes one: the other has nobody to look at, and goes on)
  const pair = [...S.villagers.values()].filter(v => !v.inside && !v.sleeping && v.age > 16 && drawn().includes(v.id)).slice(0, 2); let alone = '—';
  if (pair.length === 2) { const [a, b] = pair; G.Vg.setTask(a, { type: 'talk', id: b.id, pri: 0.9, wait: 5, kind: 'talk' }); frames(10); b.held = 1; tryF('a mão do deus', () => frames(20)); alone = V3.partnerOf(a) === b ? 'olha o vazio sem erro' : 'sem par'; b.held = 0; }
  // (the map changes under someone drawn: the ground raised under their feet)
  const w = S.villagers.get(drawn()[1]); if (w) tryF('o chão que muda', () => { const Vn = Math.round(Math.sqrt(S.H.length)); const i = (w.y | 0) * Vn + (w.x | 0); S.H[i] += 0.4; S.H[i + 1] += 0.4; S.typeVer = (S.typeVer || 0) + 1; if (G.W.invalidateLand) G.W.invalidateLand(); frames(20); });
  const chk = P3.check();
  ok('v4 os casos ruins: o save no meio, a morte no meio, a mão do deus, o chão que muda', !errs.length && same && memo === 0 && !ghost && !chk.length && !Object.keys(G.modErr || {}).length,
    `${errs.length ? 'ERROS: ' + errs.join('; ') + ' · ' : ''}o porte de ${ids.length} pessoas depois do load: ${same ? 'o mesmo' : 'OUTRO'} · a memória da vista depois do load: ${memo} guardadas · quem morreu: ${ghost ? 'AINDA DESENHADO' : 'saiu da vista'} · a mão do deus: ${alone} · o verificador do desenho: ${chk.length ? chk.join('; ') : 'limpo'}`);
}

if (on('v5')) {
  // the same world, the same save, lived 30 s: once with the 3D drawing it every step (the reader, the animator, the frame), once
  // without — the two saves byte for byte, and the world's chance where the world left it
  const s0 = G.Save.serialize(); const live = draw => {
    G.Save.apply(JSON.parse(s0)); S = G.S; M.reseed(7);
    let best = null; for (const set of S.settlements.values()) if (!best || G.Village.pop(set.id) > G.Village.pop(best.id)) best = set; const focus = { X: best.cx * TL, Z: best.cy * TL };
    for (let k = 0; k < 300; k++) { G.debug.step(0.1); if (draw) { P3.update(0.1, focus); for (const v of S.villagers.values()) { V3.porteOf(v); V3.overOf(v, 'walk'); } } }
    return { save: G.Save.serialize(), rng: JSON.stringify(S.rng) };
  };
  const a = live(true), b = live(false);
  ok('v5 o mesmo mundo com e sem o desenho dá o mesmo save', a.save === b.save && a.rng === b.rng, `30 s vividos: o save ${a.save === b.save ? 'igual byte a byte' : 'DIFERENTE'} (${a.save.length} caracteres), o acaso do mundo ${a.rng === b.rng ? 'o mesmo' : 'OUTRO'}`);
}

if (on('v6') || on('v7')) {
  // the face: each cause on its channels (the living face, pose.face — G.Rosto's names), and the opposite
  const RO = G.Rosto, X = RO.IDX; const P = k => Object.assign(Object.fromEntries(V3.PORTE.map(q => [q, 0])), k);
  const faceOf = (pz, extra) => { const pose = A.POSE0(); pose.blink = 1; const I = Object.assign({ id: 9, clock: 3.1, drunk: 0, humor: 0 }, extra || {}); const m = {}, a = { pz, oc: null };
    for (let i = 0; i < 40; i++) A.faceMix(m, I, pose, A.MOOD.calm, a, 1 / 30); return pose.face; };
  const calm = faceOf(P({})); const CASES = [['frio', P({ frio: 1 }), ['press', 'pale']], ['calor', P({ calor: 1 }), ['sweat', 'squint']], ['luto', P({ luto: 1 }), ['browSad', 'cry']], ['medo', P({ medo: 1 }), ['wide', 'browUp', 'pale']],
    ['furia', P({ furia: 1 }), ['browIn', 'press']], ['doente', P({ doente: 1 }), ['pale', 'browSad']], ['ferido', P({ ferido: 1 }), ['pain']], ['cansado', P({ cansado: 1 }), ['sweat', 'browSad']]];
  const res = [], bad = [];
  for (const [n, pz, chs] of CASES) { const f = faceOf(pz); const d = Math.min(...chs.map(c => f[X[c]] - calm[X[c]])); res.push(`${n}: ${chs.map(c => c + ' ' + r2(f[X[c]])).join(', ')}`); if (!(d > 0.15)) bad.push(n); }
  // (the opposite: the cold does not sweat, the heat is not pale, the calm one has no tears; the speech moves the mouth through its shapes)
  const cold = faceOf(P({ frio: 1 })), hot = faceOf(P({ calor: 1 }));
  const talkShapes = new Set(); { const pose = A.POSE0(); pose.blink = 1; pose.talk = 0.7; const m = {}, a = { pz: null }; for (let i = 0; i < 90; i++) { const I = { id: 9, clock: i / 30, drunk: 0, humor: 0 }; A.faceMix(m, I, pose, A.MOOD.calm, a, 1 / 30); const f = pose.face; talkShapes.add([f[X.jaw] > 0.4 ? 'a' : '', f[X.pucker] > 0.3 ? 'o' : '', f[X.press] > 0.3 ? 'm' : '', f[X.stretch] > 0.3 ? 'e' : ''].join('')); } }
  const neat = Array.from(calm).every((x, i) => Math.abs(x - RO.REST[i]) < 0.2 || i === X.smile);
  if (on('v6')) ok('v6 o rosto vivo: cada causa nos seus canais, e o contrário; a fala pelos seus visemas', !bad.length && cold[X.sweat] < 0.05 && hot[X.pale] < 0.05 && calm[X.cry] < 0.01 && neat && talkShapes.size >= 3,
    (bad.length ? 'SEM CANAL: ' + bad.join(', ') + ' · ' : '') + res.join(' · ') + ` · o frio sem suor (${r2(cold[X.sweat])}), o calor sem palidez (${r2(hot[X.pale])}), a calma sem lágrima (${r2(calm[X.cry])}) · a fala: ${talkShapes.size} formas da boca (${[...talkShapes].join(' ')})`);
}

if (on('v7')) {
  // the variety, measured (the study's 3.13): a plaza of the metropole — the eye at its busiest one, the people drawn whole there at
  // Alta (60) — for 120 s of the world: (a) no two people in the same gesture (a clip or the little thing over the top; the stride is
  // said apart) and the same phase (±0.1 s) for more than 2 s; (b) no
  // little thing over 35% of a person's own, over ten minutes of their world clock, and never the same one twice in a row; (c) at
  // least 25 gestures and stances seen
  M.pronto('metropole'); S = G.S; let lived = 0; for (; lived < 240; lived += 20) { let sl = 0; for (const v of S.villagers.values()) if (v.sleeping) sl++; if (sl / S.villagers.size < 0.25) break; M.viver(20); }
  let pz = null, best = 0; for (const b of S.buildings.values()) { if (b.type !== 'praca' || !b.built) continue; let k = 0; for (const v of S.villagers.values()) if (!v.inside && (v.x - b.x) ** 2 + (v.y - b.y) ** 2 < 100) k++; if (k > best) { best = k; pz = b; } }
  let set = null; for (const s of S.settlements.values()) if (!set || G.Village.pop(s.id) > G.Village.pop(set.id)) set = s;
  const fx = pz ? pz.x + 1 : set.cx, fy = pz ? pz.y + 1 : set.cy; const focus = { X: fx * TL, Z: fy * TL };
  const rq = G.Realm.Q; G.Realm.Q = () => Object.assign({}, rq ? rq() : {}, { view: 640, npcs: 60, lod: 1 }); P3.clear();
  const run = new Map(); let worst = 0, worstPair = '', worstLoco = 0, locoPair = ''; const seen = new Set(); const DT = 0.1; let drawnMax = 0;
  // (each one's gesture and where they are on it, in seconds, and its period: the phase of a loop taken round its cycle — two on the
  // same gesture one cycle apart are in step —, a gesture of one go and a stance's own clock along it)
  const fr = x => x - Math.floor(x);
  const keyOf = (id, s) => { const a = s.an; if (a.over && a.ow > 0.5) return a.oc ? ['+' + a.over.id, (a.ocU || 0) * a.over.dur, 0] : ['+' + a.over.id, fr(a.ok || 0) * a.over.dur, a.over.dur];
    const C = A.CLIPS[s.st]; if (C) { const v = S.villagers.get(id); const k = v ? P3.clipClock(v, s.st) : undefined; return [s.st, fr(k !== undefined ? k : a.ck || 0) * C.dur, C.dur]; }
    if (A.LOCO[s.st]) { const per = 1 / Math.max(0.1, G.Gait.freq(a.sp || 1, 1, a.rw || 0)); return [s.st, fr(a.ph || 0) * per, per]; } return [s.st, s.t, 0]; };
  const apart = (p, q) => { const d = Math.abs(p[1] - q[1]); return p[2] > 0 ? Math.min(d % p[2], p[2] - d % p[2]) : d; };
  for (let i = 0; i < 120 / DT; i++) {
    M.viver(DT); P3.update(DT, focus); const ids = P3.walkers.map(w => w[7]).slice(0, 60); drawnMax = Math.max(drawnMax, ids.length);
    const K = ids.map(id => { const s = P3.visOf(id); return s ? keyOf(id, s) : null; }); for (const k of K) if (k) seen.add(k[0]);
    const now = new Set();
    for (let a = 0; a < ids.length; a++) for (let b = a + 1; b < ids.length; b++) { const p = K[a], q = K[b]; if (!p || !q || p[0] !== q[0] || apart(p, q) > 0.1) continue;
      const key = ids[a] + ':' + ids[b]; now.add(key); const r = (run.get(key) || 0) + DT; run.set(key, r);
      // (the strides apart: thirty running in a chase cannot all be out of step — a stride of 0.7 s holds three or four ±0.1 s apart —,
      // and the feet keep the stride's phase; said, not judged: T-1612)
      if (A.LOCO[p[0]]) { if (r > worstLoco) { worstLoco = r; locoPair = `#${ids[a]} e #${ids[b]} em «${p[0]}»`; } } else if (r > worst) { worst = r; worstPair = `#${ids[a]} e #${ids[b]} em «${p[0]}»`; } }
    for (const key of run.keys()) if (!now.has(key)) run.delete(key);
  }
  G.Realm.Q = rq;
  // (b) the little things over ten minutes of each one's clock, in their context of now
  let topShare = 0, topWho = '', twice = 0, people = 0; const ocSeen = new Set();
  for (const v of [...S.villagers.values()].filter(v => !v.inside && !v.aboard).slice(0, 60)) { const ctx = V3.ctxOf(v, V3.porteOf(v, {}), null, {}); const cnt = {}; let tot = 0, last = null, lastN = -9;
    for (let t = 0; t < 600; t += 0.25) { const o = A.ocioAt(v.id, S.clock + t, ctx, 0); if (!o) continue; if (o.n === lastN) continue; lastN = o.n; cnt[o.k] = (cnt[o.k] || 0) + 1; tot++; ocSeen.add(o.k); if (o.k === last) twice++; last = o.k; }
    if (tot >= 10) { people++; for (const k in cnt) { const sh = cnt[k] / tot; if (sh > topShare) { topShare = sh; topWho = `#${v.id}: «${k}» ${cnt[k]} de ${tot}`; } } } }
  ok('v7 a variedade: uma praça da metrópole por 120 s', worst <= 2 && topShare <= 0.35 && !twice && seen.size >= 25,
    `${drawnMax} desenhadas; o par mais tempo no mesmo gesto e na mesma fase: ${r2(worst)} s${worstPair ? ' (' + worstPair + ')' : ''} (na mesma passada, dito e não julgado: ${r2(worstLoco)} s${locoPair ? ', ' + locoPair : ''}) · a micro-ação mais repetida de uma pessoa em 10 min: ${Math.round(topShare * 100)}% (${topWho}), ${people} pessoas, ${ocSeen.size} micro-ações diferentes; repetidas em seguida: ${twice} · ${seen.size} gestos e estados vistos: ${[...seen].slice(0, 40).join(', ')}`);
}

const E = M.erros(); ok('sem-erros', !Object.keys(E.mod || {}).length && !E.console.length, `módulos ${JSON.stringify(E.mod || {})}; console ${E.console.slice(0, 3).join(' | ') || 'limpo'}`);
console.log(fails.length ? `VIDA3D: ${fails.length} falha(s): ${fails.join(', ')}` : 'VIDA3D: ok');
process.exit(fails.length ? 1 : 0);
