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
//   v11 the child of short legs: each child's look carries G.Feicao's proportions, the rig poses the bones by them (D-639, D-614).
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
// (a grown man the proof can set at rest: blank() clears the sickness, the mourning, the feelings, the house and the sleep — the
// ready worlds made with the society (22b) have most of their grown men mourning a friend, and «none in mourning» found nobody: T-1598)
const adult = () => [...S.villagers.values()].find(v => v.age >= 25 && v.age < 45 && !v.aboard && !v.captive && !v.jail && v.g === 'm');
// (the subject of each cause's porte — v1, v2 — of a middling temperament too: who one is is a cause of the porte — the bold and the
// shy, confia; the open, expans — and blank() cannot make anyone middling (the índole is soc-indole.js's, rule 204). The cidade made
// again for the tavern (96a5e48) gave as the first grown man one shy to the bone (confia −0,97): «the healthy one in a mild place»
// showed the porte of his shyness, and the shyness bent the neck and the back against the child's and the pregnancy's own, T-2042)
const middling = v => { const p = V3.porteOf(v, {}); return Math.abs(p.confia) <= 0.3 && Math.abs(p.expans - 0.5) <= 0.25; };
const calmAdult = () => [...S.villagers.values()].find(v => v.age >= 25 && v.age < 45 && !v.aboard && !v.captive && !v.jail && v.g === 'm' && middling(v)) || adult();
const blank = v => { v.age = 30; v.energy = 90; v.sick = 0; v.wound = null; v.hp = 100; v.lost = null; v.preg = 0; v.mourn = 0; v.fear = 0; v.fury = 0; v.emo = null; v.grp = 'povo'; v.inside = 0; v.sleeping = false; v.traits = v.traits.filter(t => t !== 'Corajoso' && t !== 'Medroso' && t !== 'Sociável'); };
// (the place of a person made mild, cold or hot by the proof's hand on a copy of the map: the map's warmth, the hour, the sky)
const mild = v => { S.temp[G.W.idx(v.x, v.y)] = 128; S.time = 0.35; S.weather.rain = 0; S.weather.storm = -1; };
// the animator on its own, the porte given: standing (idle) or walking at 1.3 m/s, a second and a half; the pose at the end
const LOOK = P3.look(calmAdult() || [...S.villagers.values()][0]);
function poseOf(porte, st, extra) {
  const a = A.memory(), pose = A.POSE0(), L = Object.assign({}, LOOK, { plant: [{ on: 0 }, { on: 0 }], held: null, carry: false, reach: null, pair: null, gnd: null }); const I = {};
  let z = 0; const sp = st === 'walk' ? 1.3 : 0;
  for (let i = 0; i < 90; i++) { z += sp / 60; Object.assign(I, { st, t: i / 60, sp, yaw: Math.PI / 2, yawV: 0, acc: 0, X: 0, Z: z, ground: 0, s: 1, run: 0, walk: sp ? 1 : 0, over: null, overK: undefined, clipK: undefined, drunk: 0, tired: porte ? porte.cansado || 0 : 0, id: 11, porte, clock: i / 60, lefty: false }, extra || {}); A.drive(a, I, pose, L, 1 / 60); }
  return pose;
}
const diff = (p, q, js) => Math.max(...js.map(j => Math.abs((p[j] || 0) - (q[j] || 0))));
// (walking, the largest change over the last second — a stride and more —, frame against frame of the same phase: what a cause
// gives only over one leg's stance — the limp's lean over the bad leg — was measured at the last frame alone, nothing when that
// leg was in its swing there: the side of the limp is the person's own, T-1599)
function walkDiff(porte, js) {
  const run = pt => { const a = A.memory(), pose = A.POSE0(), L = Object.assign({}, LOOK, { plant: [{ on: 0 }, { on: 0 }], held: null, carry: false, reach: null, pair: null, gnd: null }); const I = {}, out = []; let z = 0;
    for (let i = 0; i < 90; i++) { z += 1.3 / 60; Object.assign(I, { st: 'walk', t: i / 60, sp: 1.3, yaw: Math.PI / 2, yawV: 0, acc: 0, X: 0, Z: z, ground: 0, s: 1, run: 0, walk: 1, over: null, overK: undefined, clipK: undefined, drunk: 0, tired: pt ? pt.cansado || 0 : 0, id: 11, porte: pt, clock: i / 60, lefty: false }); A.drive(a, I, pose, L, 1 / 60); if (i >= 30) out.push(Object.assign({}, pose)); }
    return out; };
  const P = run(porte), Z0 = run(ZERO_W()); let m = 0; for (let i = 0; i < P.length; i++) m = Math.max(m, diff(P[i], Z0[i], js)); return m;
}
const ZERO = Object.fromEntries(V3.PORTE.map(k => [k, 0]));
const ZERO_W = () => ZERO;

if (on('v1') || on('v2')) {
  // (the warmth of the map the proof's hand changes is a copy's: the save does not keep the map's warmth — it is made again from the map
  // at the load —, and the one the hand left mild was the subject's own at the v4, after the load «another porte», T-2042)
  const temp0 = S.temp; S.temp = temp0.slice();
  const v = calmAdult(); blank(v); mild(v);
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
    const dS = diff(ps, still0, chS), dW = Math.max(diff(pw, walk0, chW), walkDiff(p, chW));
    // (the opposite: the other causes stay out — the cold gives no heat, the heat no cold, the sickness no fear…)
    const others = V3.PORTE.filter(q => q !== k && q !== 'confia' && q !== 'expans' && Math.abs(p[q]) > 0.05 && !(k === 'gravida' && q === 'crianca'));
    res.push(`${k} ${r2(f)} → parado ${r2(dS)} rad, andando ${r2(dW)} rad${others.length ? ' (e ' + others.join(', ') + ')' : ''}`);
    if (!(f >= 0.3 && dS > 0.08 && dW > 0.04 && !others.length)) bad.push(k);
  }
  blank(v); mild(v);
  // (the limp is over the leg that is lost — the one the stump is drawn on and the crutch takes the place of, by the id: L-1775)
  for (const id of [v.id, v.id + 1]) { const w = Object.assign({}, v, { id, lost: { leg: true } }); const sd = Math.sign(V3.porteOf(w, {}).manca), Fe = G.Feicao && G.Feicao.of(w);
    const stump = Fe ? (Fe.w[G.Feicao.IDX.cotoPernaD] > 0.5 ? 1 : Fe.w[G.Feicao.IDX.cotoPernaE] > 0.5 ? -1 : 0) : (id % 2 ? 1 : -1), crutch = G.Inv && G.Inv.crutchSide ? (G.Inv.crutchSide(w) === 'mao' ? 1 : -1) : stump;
    if (sd !== stump || crutch !== stump) bad.push(`manca do lado ${sd}, o coto do ${stump}, a muleta do ${crutch} (#${id})`); }
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
  S.temp = temp0;
}

if (on('v3')) {
  const kids = [...S.villagers.values()].filter(v => v.age >= 4 && v.age < 11 && !v.aboard);
  const k = kids[0], o = kids[1]; let chase = '—';
  if (k && o) { k.sleeping = false; k.inside = 0; G.Vg.setTask(k, { type: 'play', pri: 0.1, kind: 'play' }); k.task.st = 2; k.task.chase = o.id; k.task.rt = 0; chase = A.stateOf(k, 1.4); }
  // (the prisoner led is awake — asleep, the state is the sleep's —: the v3 passed only after the v1's hand had woken its subject, T-2042)
  const p = adult(); const keepAct = p.act, keepZz = p.sleeping; p.sleeping = false; p.act = 'bound'; const boundWalk = V3.overOf(p, A.stateOf(p, 1.3)), boundStill = A.stateOf(p, 0); p.act = 'talk'; const talkWalk = V3.overOf(p, 'walk'); p.act = keepAct; p.sleeping = keepZz;
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

if (on('v8')) {
  // two in one gesture (D-605): the world puts two at the act's distance, facing (G.Convivio.place) and holds them in it (the task of
  // each names the other); the view gives each their part and takes their hands to the other in the act's window — and never moves
  // anyone. Far apart, each one alone; the god's hand on one, a death and a save in the middle: no error, and the other goes on alone
  M.pronto(key); S = G.S; M.viver(2); S.time = 0.4; S.animals = new Map(); // (by day, the beasts set aside in this copy: nobody flees)
  const errs = []; const tryF = (what, f) => { try { f(); } catch (e) { errs.push(what + ': ' + e.message); } };
  const awake = v => v && !v.inside && !v.sleeping && !v.aboard && !v.captive && !v.jail && v.age >= 18 && v.age < 60 && !v.held;
  const twoOf = (not) => { const L = [...S.villagers.values()].filter(v => awake(v) && !(not || []).includes(v.id)); for (const a of L) for (const b of L) if (a !== b && a.set === b.set && Math.hypot(a.x - b.x, a.y - b.y) < 6) return [a, b]; return [L[0], L[1]]; };
  // (what is proven is the view: the proof's hand holds the two for the act's length above the day's work and the meal — the society
  // holds them at 0,95, in free time, and by day in the metrópole made with the society the potter and the builder went back to work
  // (1), a hungry one to eat (2,5), and the other wandered off: T-1619)
  const HOLD = 3;
  const begin = (a, b, act) => { for (const v of [a, b]) { v.hunger = Math.min(v.hunger || 0, 10); v.energy = Math.max(v.energy || 0, 90); } G.Convivio.place(a, b, act); const d = G.SocAtos.of(act); const rv = d.rev || act;
    // (both held by the society's own 'duo' for the act's length — st 2: each one past the walk to the other, as the one who begins is
    // when the society holds the other)
    G.Vg.setTask(a, { type: 'duo', id: b.id, act, papel: 'a', pri: HOLD, wait: d.dur, kind: 'duo', st: 2 }); G.Vg.setTask(b, { type: 'duo', id: a.id, act: rv, papel: 'b', pri: HOLD, wait: d.dur, kind: 'duo', st: 2 }); };
  const live = (a, n) => { for (let k = 0; k < n; k++) { G.debug.step(0.1); P3.update(0.1, { X: a.x * TL, Z: a.y * TL }); } };
  // (where each palm is against where it goes: the frame's rig of the person again, from the view's memory of them)
  const handErr = id => { const s = P3.visOf(id); if (!s || !s.L || !s.L.duo || !(s.L.duo.w > 0.999)) return null; const R = P3.rig(s.X, s.Y, s.Z, s.yaw, s.pose, s.L); const pm = P3.palms(R); let e = 0;
    for (let q = 0; q < 2; q++) if (s.L.duo.on[q]) e = Math.max(e, Math.hypot(pm[q].x - s.L.duo.T[q][0], pm[q].y - s.L.duo.T[q][1], pm[q].z - s.L.duo.T[q][2])); return e; };
  const out = [];
  // (1) the embrace, in place: each their part, the hands on the other's back within 5 cm in the middle of the act; the world's places
  // the same after the frames as before them
  let [a, b] = twoOf(); P3.clear(); live(a, 3); begin(a, b, 'hug'); const xy0 = [a.x, a.y, b.x, b.y].join();
  let stA = '', stB = '', eA = null, eB = null; tryF('o abraço', () => { live(a, 15); const sa = P3.visOf(a.id), sb = P3.visOf(b.id); stA = sa ? sa.st : '?'; stB = sb ? sb.st : '?'; eA = handErr(a.id); eB = handErr(b.id); });
  const still = [a.x, a.y, b.x, b.y].join() === xy0;
  const hugOk = stA === 'duo-abraco' && stB === 'duo-abraco-b' && eA !== null && eB !== null && eA < 0.05 && eB < 0.05 && still;
  out.push(`o abraço: ${stA} e ${stB}, as mãos a ${eA === null ? '—' : r2(eA * 100)} e ${eB === null ? '—' : r2(eB * 100)} cm de onde vão, os lugares do mundo ${still ? 'os mesmos' : 'MUDADOS'}`);
  // (2) the world left them far apart (2 m more): each one alone — the act's own gesture, no hands on the other
  live(a, 30); [a, b] = twoOf(); begin(a, b, 'hug'); b.x += (b.x - a.x) > 0 ? 0.5 : -0.5; let farA = '', farHands = true;
  tryF('longe', () => { live(a, 10); const sa = P3.visOf(a.id); farA = sa ? sa.st : '?'; farHands = !!(sa && sa.L && sa.L.duo); });
  const farOk = farA !== 'duo-abraco' && !farHands; out.push(`longe: ${farA}, ${farHands ? 'AS MÃOS NO OUTRO' : 'sozinho'}`);
  // (3) the god's hand takes one in the middle of the embrace: the other alone, no error
  live(a, 30); [a, b] = twoOf(); begin(a, b, 'hug'); live(a, 8); b.held = 1; let godA = '';
  tryF('a mão do deus', () => { live(a, 6); const sa = P3.visOf(a.id); godA = sa ? sa.st + (sa.L && sa.L.duo ? ' COM AS MÃOS' : '') : '?'; }); b.held = 0;
  const godOk = !/duo-abraco|MÃOS/.test(godA); out.push(`a mão do deus num dos dois: o outro em «${godA}»`);
  // (4) one of the two dies in the middle of the kiss: the other alone, no error
  live(a, 30); [a, b] = twoOf(); begin(a, b, 'kiss'); live(a, 8); let deadA = '';
  tryF('a morte no meio', () => { G.Village.kill(b, 'god', true); live(a, 6); const sa = P3.visOf(a.id); deadA = sa ? sa.st + (sa.L && sa.L.duo ? ' COM AS MÃOS' : '') : '?'; });
  const deadOk = !/duo-beijo|MÃOS/.test(deadA); out.push(`a morte de um no meio do beijo: o outro em «${deadA}»`);
  // (5) a save and a load in the middle of the hand in hand: the frame goes on, no error (the tasks are not saved: after the load
  // each one is again what the world makes of them)
  live(a, 30); [a, b] = twoOf([b.id]); begin(a, b, 'handhold'); live(a, 8);
  tryF('o save no meio', () => { const s0 = G.Save.serialize(); G.Save.apply(JSON.parse(s0)); S = G.S; const a2 = S.villagers.get(a.id) || [...S.villagers.values()][0]; live(a2, 10); });
  // (6) the greeting by the people and the standing
  const g = (civ, grp, ogrp) => A.greetOf({ civ, grp, ogrp, captive: false, ocaptive: false });
  const gr = [['romano', g('romano', 'povo', 'povo'), 'antebraco'], ['egípcio', g('egipcio', 'povo', 'povo'), 'reverencia'], ['nórdico', g('nordico', 'povo', 'povo'), 'aperto'],
    ['o povo ao nobre', g('romano', 'povo', 'nobreza'), 'baixa'], ['o nobre ao povo', g('egipcio', 'nobreza', 'povo'), 'nobre']];
  const grOk = gr.every(x => x[1] === x[2]); out.push('o cumprimento: ' + gr.map(x => `${x[0]} ${x[1]}`).join(', '));
  const chk = P3.check();
  ok('v8 a dois: cada um o seu papel, as mãos no outro, o lugar do mundo; longe, sozinho; a mão do deus, a morte e o save no meio', !errs.length && hugOk && farOk && godOk && deadOk && grOk && !chk.length && !Object.keys(G.modErr || {}).length,
    (errs.length ? 'ERROS: ' + errs.join('; ') + ' · ' : '') + out.join(' · ') + (chk.length ? ' · VERIFICADOR: ' + chk.slice(0, 3).join('; ') : ''));
}

if (on('v9')) {
  // the scenes (D-607, D-608): the world's — who is in each, the act of each, the focus —; the reader finds the focus and, where the
  // world gives all the same act, the part by who each one is; the heads turn to the focus; the far crowd keeps the posture
  M.pronto(key); S = G.S; M.viver(2); S.time = 0.4; S.animals = S.animals || new Map();
  const errs = []; const tryF = (what, f) => { try { f(); } catch (e) { errs.push(what + ': ' + e.message); } };
  const out = []; let okAll = true; const say = (c, t) => { out.push(t + (c ? '' : ' ✗')); if (!c) okAll = false; };
  const awake = v => v && !v.inside && !v.sleeping && !v.aboard && !v.captive && !v.jail && !v.held;
  const grown = [...S.villagers.values()].filter(v => awake(v) && v.age >= 18 && v.age < 60); const pick = i => grown[i % grown.length];
  out.push(`${grown.length} crescidos acordados`);
  // (1) the funeral: six round a grave, the world's act (mourn), the kin among them; the reader's part by kin and heart, the focus the
  // grave, every head toward it after a few frames, no two in step
  const cem = [...S.buildings.values()].find(b => b.type === 'cemetery') || [...S.buildings.values()][0]; const ring = grown.slice(0, 6);
  ring.forEach((v, i) => { const a = i / ring.length * Math.PI * 2; v.x = cem.x + Math.cos(a) * 2.2; v.y = cem.y + Math.sin(a) * 2.2; v.path = null; v.moving = false; G.Vg.setTask(v, { type: 'funeral', id: cem.id, pri: 1.1, kind: 'funeral', st: 2 }); v.act = 'mourn'; v.mourn = i < 2 ? DAY * 0.3 : 0; G.faceTo(v, cem.x - v.x, cem.y - v.y); });
  const parts = ring.map(v => A.stateOf(v, 0, P3.look(v))); const kin = parts.slice(0, 2), others = parts.slice(2);
  say(kin.every(p => p === 'mourn' || p === 'ato-chorar-joelhos') && new Set(others).size >= 1 && others.every(p => p === 'mourn' || p === 'ato-luto-roda'), `o enterro: os parentes ${kin.join(', ')}; os outros ${others.join(', ')}`);
  let looks = []; tryF('o enterro desenhado', () => { for (let k = 0; k < 40; k++) { for (const v of ring) { v.act = 'mourn'; v.moving = false; } P3.update(0.1, { X: cem.x * TL, Z: cem.y * TL }); }
    looks = ring.map(v => { const s = P3.visOf(v.id); if (!s || !s.sc) return null; const want = V3.lookFar(s.yaw, s.X, s.Z, s.sc); return [s.sc.k, Math.abs((s.pose.lookY || 0) - want)]; }); });
  say(looks.length && looks.every(l => l && l[0] === 'luto' && l[1] < 0.1), `as cabeças para o túmulo: ${looks.map(l => (l ? l[0] + ' ' + r2(l[1]) : '—')).join(', ')}`);
  // (2) the crowd at the scaffold: the world's watchers with their stances; the focus the scaffold
  const ex = { id: 987654, x: cem.x + 6, y: cem.y }; S.execs = (S.execs || []).concat([ex]); const w = pick(7); G.Vg.setTask(w, { type: 'justice', role: 'watch', j: ex.id, x: w.x, y: w.y, pri: 1.95, st: 2, kind: 'justice', stance: 'boo' });
  const sw = V3.scene(w, null, {}); say(sw.k === 'cadafalso' && Math.abs(sw.X - ex.x * TL) < 1e-6 && Math.abs(sw.Z - ex.y * TL) < 1e-6, `o cadafalso: ${sw.k} no ${r2(sw.X)}, ${r2(sw.Z)}`);
  for (const [act, want] of [['cheer', 3], ['boo', 3], ['weep', 4]]) { w.act = act; const p = P3.crowdPose(w, P3.look(w)); say(p === want, `a multidão de longe em «${act}»: postura ${p}`); }
  S.execs = S.execs.filter(e => e !== ex); G.Vg.endTask(w);
  // (3) the game of tag: the chaser's focus the one chased
  const kids = [...S.villagers.values()].filter(v => awake(v) && v.age >= 5 && v.age < 12); if (kids.length >= 2) { const [c1, c2] = kids; G.Vg.setTask(c1, { type: 'play', st: 2, chase: c2.id, pri: 0.5, kind: 'play' }); const sc = V3.scene(c1, null, {});
    say(sc.k === 'pega' && Math.abs(sc.X - c2.x * TL) < 1e-6, `o pega-pega: ${sc.k}, o foco em quem foge`); G.Vg.endTask(c1); } else out.push('o pega-pega: sem crianças neste mundo');
  // (4) the child and the house's dog: the world has the dog with the child (pets.js: the dog's kid); the child kneels to it
  const dog = [...S.animals.values()].find(a => a.kind === 'cao' && !a.dead && a.home); const kid = kids[2] || kids[0];
  if (dog && kid) { kid.home = dog.home; kid.x = dog.x + 0.3; kid.y = dog.y; kid.moving = false; kid.path = null; G.Vg.setTask(kid, { type: 'play', st: 2, pri: 0.5, kind: 'play' }); kid.act = ''; dog.kid = kid.id;
    const st = A.stateOf(kid, 0, P3.look(kid)), sc = V3.scene(kid, null, {}); say(st === 'crianca-cao' && sc.k === 'cao' && sc.dog === dog.id, `a criança e o cão da casa: ${st}, o foco no cão ${sc.dog === dog.id ? 'certo' : 'ERRADO'}`);
    dog.kid = 0; const st2 = A.stateOf(kid, 0, P3.look(kid)); say(st2 !== 'crianca-cao', `o cão com outra coisa: a criança em «${st2}»`); } else out.push('a criança e o cão: sem cão de casa neste mundo');
  // (5) the drill: the act's own gesture on the world's clock
  const sold = pick(8); sold.act = 'drill'; G.Vg.setTask(sold, { type: 'drill', pri: 1 }); sold.act = 'drill'; const sd = A.stateOf(sold, 0, P3.look(sold)); say(sd === 'ato-treino', `o treino: ${sd}`);
  // (6) the postures of the far crowd from the fine body's state: seated, kneeling, lying
  const q = pick(9); for (const [act, want] of [['eat', 1], ['pray', 2], ['', 0]]) { G.Vg.endTask(q); q.act = act; q.sleeping = false; const p = P3.crowdPose(q, P3.look(q)); say(p === want, `de longe em «${act || 'parado'}»: postura ${p}`); }
  q.sleeping = true; say(P3.crowdPose(q, P3.look(q)) === 5, 'de longe dormindo: deitado'); q.sleeping = false;
  tryF('a multidão desenhada', () => { for (let k = 0; k < 10; k++) P3.update(0.1, { X: cem.x * TL, Z: cem.y * TL }); });
  const chk = P3.check();
  ok('v9 as cenas: o foco do mundo, o papel de cada um, as cabeças para o foco, a criança e o cão, o treino, as posturas da multidão', !errs.length && okAll && !chk.length && !Object.keys(G.modErr || {}).length,
    (errs.length ? 'ERROS: ' + errs.join('; ') + ' · ' : '') + out.join(' · ') + (chk.length ? ' · VERIFICADOR: ' + chk.slice(0, 3).join('; ') : ''));
}

if (on('v10')) {
  // the little things that sound (D-610): the cough of one sick, standing near the ear, at the moment the 3D draws that little thing —
  // the scene of the sound has it, on its moment, the same micro-action the view plays; the teeth of one in the cold; nothing for
  // one well and warm. And the body the player lives carries itself too (D-609): the porte, the little things, the living face
  M.pronto(key); S = G.S; M.viver(2); S.time = 0.4; S.animals = new Map();
  const errs = []; const tryF = (what, f) => { try { f(); } catch (e) { errs.push(what + ': ' + e.message); } };
  const out = []; let okAll = true; const say = (c, t) => { out.push(t + (c ? '' : ' ✗')); if (!c) okAll = false; };
  const v = adult(); blank(v); mild(v); v.sick = DAY * 0.5; v.act = ''; v.moving = false; G.Vg.setTask(v, { type: 'idle', pri: 0.1 }); v.act = '';
  const ctx = V3.ctxOf(v, V3.porteOf(v, {}), null, {}); let t0 = -1; for (let t = S.clock; t < S.clock + 600; t += 0.25) { const o = A.ocioAt(v.id, t, ctx, 0); if (o && o.k.replace(/~m$/, '') === 'oc-tossir' && o.u > 0.31 && o.u < 0.4) { t0 = t; break; } }
  say(t0 >= 0, `a tosse de quem está doente: ${t0 >= 0 ? 'aos ' + r2(t0 - S.clock) + ' s' : 'NUNCA em 10 min'}`);
  if (t0 >= 0) { S.clock = t0; let src = null, drawn = '';
    tryF('a cena do som', () => { P3.clear(); for (let k = 0; k < 3; k++) P3.update(1 / 60, { X: v.x * TL, Z: v.y * TL }); const sv = P3.visOf(v.id); drawn = sv && sv.an && sv.an.oc ? sv.an.oc : '';
      const sc = G.Audio.scene(G.Audio.earOf({ x: v.x + 0.5, y: v.y, r: 12 })); src = sc ? sc.fontes.find(f => f.de && f.de.v === v.id && f.tipo === 'ocio') : null; });
    say(!!src && src.s === 'cough' && src.q === 'contato' && Math.abs(src.fase - src.contato) < 0.25 && drawn.replace(/~m$/, '') === 'oc-tossir', `a cena do som: ${src ? src.s + ' no ' + src.fase + ' (o momento ' + src.contato + ')' : 'NADA'}, o desenho em «${drawn}»`); }
  // (the cold: the teeth; one well and warm: nothing)
  v.sick = 0; S.temp[G.W.idx(v.x, v.y)] = 20; let cold = null; tryF('o frio', () => { const sc = G.Audio.scene(G.Audio.earOf({ x: v.x + 0.5, y: v.y, r: 12 })); cold = sc ? sc.fontes.find(f => f.de && f.de.v === v.id && f.tipo === 'ocio') : null; });
  say(!cold || cold.s === 'teeth' || A.OCIO[cold.ato] !== undefined, `no frio: ${cold ? cold.s : 'nada agora'}`);
  mild(v); P3.clear(); let warm = []; tryF('o sossego', () => { // (the view's memory of before let go: the scene reads the view's own context where it draws someone)
 for (let t = 0; t < 30; t += 1.3) { S.clock += 1.3; const sc = G.Audio.scene(G.Audio.earOf({ x: v.x + 0.5, y: v.y, r: 12 })); const f = sc ? sc.fontes.find(q => q.de && q.de.v === v.id && q.tipo === 'ocio') : null; if (f) warm.push(f.s); } });
  say(!warm.includes('cough') && !warm.includes('teeth') && !warm.includes('sneeze'), `quem está bem e no ameno: ${warm.length ? warm.join(', ') : 'nenhum som'} em 30 s`);
  // (the body the player lives: the porte of its life — old and cold —, a little thing when left standing, the living face)
  let bodyOk = false, bodyInfo = '';
  tryF('o corpo do jogador', () => { const w = adult(); blank(w); w.age = 78; S.temp[G.W.idx(w.x, w.y)] = 20;
    // (the body's controller as avatar.js hands it to the frame each frame — its place, its pose, its look, its drive —: here by hand,
    // standing; the frame's part is what is proved: the reader's porte and the living face on it)
    const X = w.x * TL, Z = w.y * TL, Y = G.W.groundH(w.x, w.y) * G.Space.HM;
    P3.avatar = { id: w.id, X, Y, Z, yaw: 0, pose: A.POSE0(), look: Object.assign(P3.look(w), { plant: null }), ground: true, drive: { st: 'idle', t: 0, sp: 0, yaw: 0, yawV: 0, acc: 0, run: 0, walk: 0, clipK: undefined, over: null, overK: undefined } };
    P3.clear(); for (let k = 0; k < 90; k++) { P3.avatar.drive.t += 0.1; P3.update(0.1, { X, Z }); }
    const av = P3.avatar; P3.avatar = null; const pz = av && av.drive && av.drive.porte; bodyOk = !!(pz && pz.velho > 0.5 && av.pose && av.pose.face);
    bodyInfo = av ? `o porte ${pz ? 'velho ' + r2(pz.velho) + ', frio ' + r2(pz.frio) : 'NENHUM'}, o rosto ${av.pose && av.pose.face ? 'vivo' : 'parado'}` : 'sem corpo desenhado (sem o 3D do corpo neste teste)'; });
  say(bodyOk, 'o corpo do jogador: ' + bodyInfo);
  ok('v10 o som das coisinhas na hora do desenho; o corpo do jogador com porte e rosto', !errs.length && okAll, (errs.length ? 'ERROS: ' + errs.join('; ') + ' · ' : '') + out.join(' · '));
}

if (on('v11')) {
  // the child of short legs in the world (D-639, D-614): each child's look carries the proportions of G.Feicao (the head, the leg, the
  // arm, the trunk of their age), the rig poses the bones by them; a grown one's are 1; and the world's children walk in the frame
  M.pronto(key); S = G.S; M.viver(1); const out = []; const bad = []; let n = 0;
  const kids = [...S.villagers.values()].filter(v => v.age < 15 && !v.aboard).sort((a, b) => a.age - b.age);
  for (const v of kids.concat([adult()])) { const L = P3.look(v), Fe = G.Feicao && G.Feicao.of(v); if (!Fe) continue; n++; const p = Fe.prop;
    if (L.legK !== p.perna || L.armK !== p.braco || L.trunkK !== p.tronco || L.headK !== p.cabeca) bad.push(`#${v.id} (${Math.floor(v.age)} anos): o retrato ${[L.legK, L.armK, L.trunkK, L.headK].map(r2).join('/')} e a forma ${[p.perna, p.braco, p.tronco, p.cabeca].map(r2).join('/')}`);
    L.ground = 0; L.plant = [{ on: 0 }, { on: 0 }]; P3.rig(0, 0, 0, 0, A.POSE0(), L); const k = P3.propK(); if (k.LK !== (L.legK || 1) || k.AK !== (L.armK || 1) || k.TK !== (L.trunkK || 1)) bad.push(`#${v.id}: o rig com ${JSON.stringify(k)}`);
    if (v.age >= 15 && (k.LK !== 1 || k.AK !== 1 || k.TK !== 1)) bad.push(`#${v.id} crescido com ${JSON.stringify(k)}`); }
  const young = kids[0]; if (young) out.push(`a mais nova (${Math.floor(young.age)} anos): a perna ${r2(P3.look(young).legK)}, o braço ${r2(P3.look(young).armK)}, o tronco ${r2(P3.look(young).trunkK)}, a cabeça ${r2(P3.look(young).headK)}`);
  const errs = []; try { for (let k = 0; k < 20; k++) P3.update(0.1, { X: (young || adult()).x * TL, Z: (young || adult()).y * TL }); } catch (e) { errs.push(e.message); }
  const chk = P3.check();
  ok('v11 a criança de pernas curtas: a forma no retrato, o rig pelos números dela', n > 3 && !bad.length && !errs.length && !chk.length, `${n} pessoas (${kids.length} crianças) · ${out.join(' · ')}${bad.length ? ' · ' + bad.slice(0, 4).join(' | ') : ''}${errs.length ? ' · ERROS: ' + errs.join('; ') : ''}${chk.length ? ' · VERIFICADOR: ' + chk.slice(0, 3).join('; ') : ''}`);
}

const E = M.erros(); ok('sem-erros', !Object.keys(E.mod || {}).length && !E.console.length, `módulos ${JSON.stringify(E.mod || {})}; console ${E.console.slice(0, 3).join(' | ') || 'limpo'}`);
console.log(fails.length ? `VIDA3D: ${fails.length} falha(s): ${fails.join(', ')}` : 'VIDA3D: ok');
process.exit(fails.length ? 1 : 0);
