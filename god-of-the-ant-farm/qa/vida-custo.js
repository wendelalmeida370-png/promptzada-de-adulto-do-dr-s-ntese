// vida-custo: what the people of the 3D cost a frame (22c, SOCIEDADE.md §4: at most 4 ms a frame for the people in the
// metropole's centre at Alta). The world of qa/nodemundo.js with the game's 3D files after it (qa/visual/tres-node.js: only
// its geometry, no graphics card), the ready world lived until the town is up and about (a quarter or less asleep), the eye
// at the centre of its biggest town, a man's height up, looking along the main street (+X, the player's field of view); then
// People3D.update timed with only the people (the beasts set aside in this copy of the world — nothing is saved): the frame
// with the eye (who is behind it is not drawn: the frame the player has), the frame with no eye (everyone in reach drawn: the
// worst), and the crowd alone.
//   node qa/vida-custo.js [metropole|mega|cidade] [alta|media|ultra] [quadros]
//   → one line per measure; CUSTO=n.nn ms/quadro at the end (the frame with the eye, on the processor). The machine is shared: a
//     number only compares with another taken on the same machine with the same load (T-1610)
const path = require('path');
const T = require(path.join(__dirname, 'visual', 'tres-node.js'));
const { G, M, THREE } = T.load();
const key = process.argv[2] || 'metropole', qual = process.argv[3] || 'alta', FR = +(process.argv[4] || 240);
M.pronto(key);
const S = G.S, TL = G.Space.TILE;
// (the town awake: lived until a quarter or less sleeps — the morning of the ready world)
let lived = 0; for (; lived < 240; lived += 20) { let sl = 0; for (const v of S.villagers.values()) if (v.sleeping) sl++; if (sl / S.villagers.size < 0.25) break; M.viver(20); }
let best = null; for (const set of S.settlements.values()) if (!best || G.Village.pop(set.id) > G.Village.pop(best.id)) best = set;
const Q = { baixa: 200, media: 360, alta: 640, ultra: 900 }, NP = { baixa: 12, media: 30, alta: 60, ultra: 90 };
const rq = G.Realm.Q; const setQ = n => { G.Realm.Q = () => Object.assign({}, rq ? rq() : {}, { view: Q[qual], npcs: n, lod: 1 }); };
const focus = { X: best.cx * TL, Z: best.cy * TL };
// (the eye: the player's — 60° high, 16:9, a man's height over the ground, along +X)
const cam = new THREE.PerspectiveCamera(60, 16 / 9, 0.1, 2000); const gy = G.W.groundH(best.cx, best.cy) * G.Space.HM;
cam.position.set(focus.X - 4, gy + 2.2, focus.Z); cam.lookAt(focus.X + 10, gy + 1.2, focus.Z); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
let eye = null; const scene = new THREE.Scene();
G.People3D.init(THREE, Object.assign(Object.create(G.Realm), { scene: () => scene, renderer: () => null, camera: () => eye }));
const P3 = G.People3D; const keep = S.animals; S.animals = new Map();
// (the time of the process on the processor, not the clock on the wall: on a shared machine the wall counts the waits for a core
// too — T-1610; the wall is said beside it)
let wall = 0; const time = (n, f) => { const c0 = process.cpuUsage(), t0 = process.hrtime.bigint(); for (let k = 0; k < n; k++) f(); const c = process.cpuUsage(c0); wall = Number(process.hrtime.bigint() - t0) / 1e6 / n; return (c.user + c.system) / 1000 / n; };
const run = (n, e) => { setQ(n); eye = e; P3.clear(); for (let k = 0; k < 90; k++) P3.update(1 / 60, focus); const ms = time(FR, () => P3.update(1 / 60, focus)); return { ms, w: wall, full: P3.count, crowd: P3.crowd, culled: P3.culled }; };
const A = run(NP[qual], cam), B = run(NP[qual], null), C = run(1, cam);
S.animals = keep; G.Realm.Q = rq;
console.log(`${key} ${qual}: vivido ${lived} s, hora ${(S.time % 1).toFixed(2)}, ${best.name}`);
console.log(`com o olho: ${A.ms.toFixed(2)} ms de processador (${A.w.toFixed(2)} na parede) — inteiros ${A.full} desenhados, ${A.culled} fora do campo, multidão ${A.crowd}`);
console.log(`sem o olho (todos à vista, o pior): ${B.ms.toFixed(2)} ms (${B.w.toFixed(2)} na parede) — inteiros ${B.full}, multidão ${B.crowd}`);
console.log(`só a multidão, com o olho: ${C.ms.toFixed(2)} ms — multidão ${C.crowd}; os inteiros com o olho ${(A.ms - C.ms).toFixed(2)} ms`);
console.log(`CUSTO=${A.ms.toFixed(2)} ms/quadro (pior ${B.ms.toFixed(2)})`);
