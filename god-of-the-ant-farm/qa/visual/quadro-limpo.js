// quadro-limpo: o quadro do deus não escreve no mundo (L-563, L-588, L-597, T-487) — em Node, sem navegador.
// Num mundo pronto (a metrópole), cada coisa que o deus desenha é posta no mundo de propósito, perto de uma cidade: os mortos
// (morto há pouco, apodrecendo, ressecado, só ossos; sem cabeça, comido, flechado, do raio, arrastado; o enforcado, o
// crucificado, o queimado na estaca), as pessoas (dormindo, carregando, criança, velha, cativa, soldado, o governante, com o
// bebê no colo; uma de cada ofício), um bicho de cada espécie (os da água na água), os navios (cada tipo; um em obra, um
// alagado), as árvores em cada estágio, um prédio de cada tipo e de cada um em obra, um pegando fogo, a planta aberta de um,
// os ninhos, as represas, as carroças, o lote guardado (a guarda de prova), o subterrâneo. Um quadro do deus de cada uma nas
// quatro vistas, de perto, e a cidade de longe — de dia e de noite com chuva. O G.Save.serialize() igual antes e depois dos
// quadros (o que o mundo põe é posto antes de medir); se mudou, os campos que mudaram, pelo tipo do objeto. E o mundo não lê
// o que o quadro deixa numa pessoa para o desenho: a jura de quem vive noutro povo, antes e depois de um quadro, a mesma.
//   node qa/visual/quadro-limpo.js [mundo]       AUDIT=1  também toda escrita num objeto do mundo que o save tira (o cache
//                                                            do desenho, como o _e do morto): o campo e quantos objetos
'use strict';
const F = require('./fidelidade-lib.js');
const { guarda } = require('../guarda-lib.js');
const clock = () => Number(process.hrtime.bigint() / 1000000n);
const t0 = clock();
const { G, M } = F.load();
const world = process.argv[2] || process.env.MUNDO || 'metropole';
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | quadro-limpo ${name} | ${info}`); if (!c) fails.push(name); };
// (the terrain's outlines are the browser's Path2D: in Node, nothing)
if (!global.Path2D) global.Path2D = class { moveTo() { } lineTo() { } closePath() { } rect() { } arc() { } ellipse() { } quadraticCurveTo() { } bezierCurveTo() { } addPath() { } };
// (the god's canvas: a context that paints nothing and takes whatever is asked of it)
const noop = () => { }, grad = { addColorStop: noop };
const base = { canvas: { width: 1280, height: 800 }, globalAlpha: 1, lineWidth: 1, font: '', fillStyle: '#000', strokeStyle: '#000', globalCompositeOperation: 'source-over',
  measureText: () => ({ width: 0 }), createLinearGradient: () => grad, createRadialGradient: () => grad, createPattern: () => null, getImageData: () => ({ data: new Uint8ClampedArray(4) }), isPointInPath: () => false };
const ctx2 = new Proxy(base, { get(t, k) { return k in t ? t[k] : noop; }, set(t, k, v) { t[k] = v; return true; } });
const R = G.Render, W = G.W, cam = R.cam, S0 = () => G.S;
let S = M.pronto(world); R.init({ getContext: () => ctx2, width: 1280, height: 800, style: {} });

// ------------------------------ the world's things, put on purpose ------------------------------
const people = s => [...S.villagers.values()].filter(v => v.set === s.id);
const towns = [...S.settlements.values()].sort((a, b) => people(b).length - people(a).length || a.id - b.id);
const home = towns[0];
const free = (x, y) => W.inb(x, y) && W.isLand(W.idx(x, y)) && !S.occ[W.idx(x, y)] && !S.wall[W.idx(x, y)];
// (the spots: free land round the town's middle, one a tile and a half apart, the nearest first)
const spots = []; { const cx = Math.floor(home.cx), cy = Math.floor(home.cy); for (let r = 2; r < 40 && spots.length < 220; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
  if (Math.max(Math.abs(dx), Math.abs(dy)) !== r || (dx + dy) % 2) continue; const x = cx + dx, y = cy + dy; if (free(x, y) && spots.every(([a, b]) => Math.abs(a - x) + Math.abs(b - y) >= 2)) spots.push([x + 0.5, y + 0.5]); } }
const water = []; { const cx = Math.floor(home.cx), cy = Math.floor(home.cy); for (let r = 2; r < 60 && water.length < 30; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
  if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const x = cx + dx, y = cy + dy; if (W.inb(x, y) && W.isWater(W.idx(x, y)) && water.every(([a, b]) => Math.abs(a - x) + Math.abs(b - y) >= 2)) water.push([x + 0.5, y + 0.5]); } }
let si = 0; const spot = () => spots[si++ % spots.length];
const scenes = []; const at = (name, x, y, z) => scenes.push({ name, x, y, z: z || 2.2 });
const sim = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
// (who may be moved: the world's grown, outside, not on a ship, in the god's hand, in a cell, the body, a captive or a soldier)
const loose = () => [...S.villagers.values()].filter(v => v.age >= 16 && !v.inside && !v.aboard && !v.held && !v.jail && !v.captive && !v.unit && !(v.task && v.task.type === 'avatar')).sort((a, b) => a.id - b.id);
const put = (v, x, y) => { G.Vg.endTask && G.Vg.endTask(v); v.sleeping = false; v.x = x; v.y = y; v.path = null; v.moving = false; };
// the dead: each kind the god draws
const DAYL = G.DAY_LEN, cases = [
  ['morto há pouco', 'war', c => { c.t = DAYL * 0.2; }], ['apodrecendo', 'war', c => { c.t = DAYL * 1.0; }], ['ressecado', 'arrow', c => { c.t = DAYL * 2.4; }],
  ['só ossos', 'war', c => { c.t = DAYL * 8; }], ['sem cabeça', 'execution', c => { c.t = DAYL * 0.2; c.headless = true; }], ['comido', 'wolf', c => { c.t = DAYL * 0.3; c.eaten = 0.6; }],
  ['flechado', 'arrow', c => { c.t = DAYL * 0.2; c.arrows = 3; }], ['do raio', 'lightning', c => { c.t = DAYL * 0.2; }], ['arrastado', 'war', c => { c.t = DAYL * 0.2; c.drag = 1; }],
  ['enforcado', 'execution', c => { c.t = DAYL * 1.0; c.pose = 'hang'; c.px = c.x; c.py = c.y; c.pz = 0; c.sc = 0; }],
  ['crucificado', 'execution', c => { c.t = DAYL * 1.0; c.pose = 'cross'; c.px = c.x; c.py = c.y; c.pz = 0; c.sc = 0; }],
  ['queimado na estaca', 'execution', c => { c.t = DAYL * 0.2; c.pose = 'burnt'; c.px = c.x; c.py = c.y; c.pz = 0; c.sc = 0; c.look._cloth = '#1e1a18'; c.look.skin = '#3a2a24'; c.look.skin0 = '#3a2a24'; }],
];
const dead = []; { const vs = loose(); for (const [name, cause, f] of cases) { const v = vs.shift(); if (!v) break; const [x, y] = spot(); put(v, x, y);
  sim(() => G.Village.kill(v, cause)); const c = G.Carnage && G.Carnage.byVid(v.id); if (!c) continue; f(c); dead.push(name); at('o morto ' + name, c.x, c.y); } }
// the living: in each state the god draws them, and one of each trade
const live = []; { const vs = loose(); const take = (name, f) => { const v = vs.shift(); if (!v) return; const [x, y] = spot(); put(v, x, y); f(v); live.push(name); at('a pessoa ' + name, x, y); };
  take('dormindo', v => { v.sleeping = true; }); take('carregando', v => { v.carry = { k: 'wood', n: 2 }; });
  const roles = new Map(); for (const v of vs) if (v.role && !roles.has(v.role)) roles.set(v.role, v);
  for (const [role, v] of roles) { vs.splice(vs.indexOf(v), 1); const [x, y] = spot(); put(v, x, y); live.push(role); at('a pessoa ' + role, x, y); }
  // (those the world has in a state of their own, where they stand: the child, the old, the captive, the soldier, the ruler)
  const any = f => [...S.villagers.values()].filter(v => !v.inside && !v.aboard && f(v)).sort((a, b) => a.id - b.id)[0];
  for (const [name, f] of [['criança', v => v.age < 8], ['velha', v => v.age > 65], ['cativa', v => !!v.captive], ['soldado', v => !!v.unit], ['com o bebê no colo', v => !!v.babyOn],
    ['governante', v => [...S.factions.values()].some(fc => fc.leader === v.id)]]) { const v = any(f); if (v) { live.push(name); at('a pessoa ' + name, v.x, v.y); } } }
// the beasts: one of each kind, those of the water in the water
const beasts = []; { const D = G.Animals.DEF; let wi = 0; for (const k of Object.keys(D)) { const wet = D[k].cls === 'water' || D[k].cls === 'sea'; const p = wet ? water[wi++ % Math.max(1, water.length)] : spot(); if (!p) continue;
  const a = sim(() => G.Animals.spawn(k, p[0], p[1])); if (a) { beasts.push(k); at('o bicho ' + k, p[0], p[1]); } } }
// the ships: each kind there is, one in the yard, one sinking
const ships = []; { const kinds = new Set(); for (const s of S.ships) { const k = s.kind + '/' + (s.cls || ''); if (kinds.has(k)) continue; kinds.add(k); ships.push(k); at('o navio ' + k, s.x, s.y); }
  const [a, b] = S.ships; if (a) { a.st = 'build'; a.prog = 0.5; ships.push('em obra'); at('o navio em obra', a.x, a.y); } if (b) { b.flood = 150; ships.push('alagado'); at('o navio alagado', b.x, b.y); } }
// the trees in their stages, the rocks, the bushes, the nests, the dams, the carts
const flora = []; { const by = new Map(); for (const t of S.trees.values()) { const k = t.stage + (t.burntLog ? '/queimada' : ''); if (!by.has(k)) by.set(k, t); } for (const [k, t] of by) { flora.push(k); at('a árvore ' + k, t.x, t.y); }
  const n0 = (S.nests || [])[0], d0 = (S.dams || [])[0], c0 = S.carts[0]; if (n0) at('o ninho', n0.x, n0.y); if (d0) at('a represa', d0.x, d0.y); if (c0) at('a carroça', c0.x, c0.y); }
// the buildings: one of each type, built and under work; one on fire; one with its plan open
const types = []; { const by = new Map(); for (const b of S.buildings.values()) { const k = b.type + (b.built ? '' : ' (obra)'); if (!by.has(k)) by.set(k, b); }
  for (const [k, b] of by) { types.push(k); const [cx, cy] = G.Village.center(b); at('o prédio ' + k, cx, cy, b.w >= 4 ? 1.25 : 2.2); }
  const hot = [...S.buildings.values()].filter(b => b.built && b.set === home.id && b.type !== 'campfire').sort((a, b) => a.id - b.id)[0];
  if (hot) { S.fire[W.idx(hot.x, hot.y)] = 0.6; const [cx, cy] = G.Village.center(hot); at('o prédio pegando fogo', cx, cy); } }
// (the lot a capital keeps, by the proof's guard: a world it changes — before anything is measured)
const g = guarda(G); if (g) { const r = G.Village.reserva(S.settlements.get(g.set)); if (r) at('o lote guardado', r.x + r.n / 2, r.y + r.n / 2, 1.25); }
// (the plan open on a building that has one — the plan comes in its own frames: pumped now)
const planned = [...S.buildings.values()].filter(b => b.built && b.ip && G.Interiors.TYPES[b.type] && b.set === home.id).sort((a, b) => a.id - b.id)[0];
if (planned && G.PlanView) { const In = G.Interiors; G.UI.selected = planned; G.PlanView.id = planned.id; G.PlanView.lv = null; In.want(planned); for (let k = 0; k < 400 && !In.ready(planned); k++) In.pump(50); const [cx, cy] = G.Village.center(planned); at('a planta aberta', cx, cy); }
// (a feast in the town and a riot in the next, lived a few seconds — their people on their way, their props up —; the world
// changes, before anything is measured)
const events = []; { const fe = G.Fest && G.Fest.DEF ? Object.keys(G.Fest.DEF)[0] : null; if (fe && sim(() => G.Fest.start(home, fe))) events.push('a festa ' + fe);
  const t2 = towns[1], f2 = t2 && G.Fac.get(t2.fac); if (f2 && G.Riots && sim(() => G.Riots.start(f2, t2, 'fome'))) { events.push('o motim em ' + t2.name); at('o motim', t2.cx, t2.cy, 1.6); }
  if (events.length) { for (let k = 0; k < 50; k++) G.debug.step(0.1); at('a festa', home.cx, home.cy, 1.6); } }
// (a tree falling, at the end of its fall — after the seconds lived: the world would have laid it down —; its dust is the frame's)
{ const tf = [...S.trees.values()].filter(o => o.stage === 'grow' && o.size > 0.5).sort((a, b) => a.id - b.id)[0]; if (tf) { tf.stage = 'fall'; tf.fallT = 0.95; tf.fallDir = 1; flora.push('caindo'); at('a árvore caindo', tf.x, tf.y); } }
// (the town from afar)
at('a cidade de longe', home.cx, home.cy, 0.45);

// ------------------------------ the frames, and what they wrote ------------------------------
const look = sc => { const p = R.proj(sc.x, sc.y, W.groundH(sc.x, sc.y)); cam.follow = 0; cam.target = null; cam.x = p[0]; cam.y = p[1]; cam.zoom = cam.tz = sc.z; };
const frames = () => { let n = 0; for (const sc of scenes) { look(sc); for (let r = 0; r < 4; r++) { R.asView(r, () => { R.update(1 / 60, 0); R.frame(1 / 60); }); n++; } }
  if (S.ug && R.setUnder) { R.setUnder(1, true); look({ x: home.cx, y: home.cy, z: 1.25 }); for (let r = 0; r < 4; r++) { R.asView(r, () => { R.update(1 / 60, 0); R.frame(1 / 60); }); n++; } R.setUnder(0, true); }
  return n; };
// (the paths of what differs between two saves, by the kind of object: «villagers.*.look.skin», the number of objects)
const kinds = (a, b) => { const out = new Map(); const walk = (x, y, p) => { if (Object.is(x, y)) return; if (!x || !y || typeof x !== 'object' || typeof y !== 'object') { if (JSON.stringify(x) !== JSON.stringify(y)) { const k = p.replace(/\.\d+(?=\.|$)/g, '.*'); out.set(k, (out.get(k) || 0) + 1); } return; }
  for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) walk(x[k], y[k], p + '.' + k); }; walk(JSON.parse(a), JSON.parse(b), 'save'); return out; };
// (AUDIT: every field of an object of the world the frames wrote — the save's or not —, by the kind of object)
const ALL = () => { const out = new Map(), seen = new WeakSet();
  const walk = (o, p, d) => { if (o === null || typeof o !== 'object') { out.set(p, o); return; } if (ArrayBuffer.isView(o)) { let h = 0; const a = new Uint8Array(o.buffer, o.byteOffset, o.byteLength); for (let i = 0; i < a.length; i += 7) h = (h * 31 + a[i]) | 0; out.set(p, h); return; }
    if (seen.has(o) || d > 6) return; seen.add(o); if (o instanceof Map) { for (const [k, v] of o) walk(v, p + '.' + k, d + 1); return; } if (o instanceof Set) { out.set(p, o.size); return; }
    for (const k of Object.keys(o)) { const v = o[k]; if (typeof v !== 'function') walk(v, p + '.' + k, d + 1); } };
  walk(G.S, 'S', 0); if (G.Carnage) walk(G.Carnage.view(), 'carnage', 0); return out; };
const wrote = (A, B) => { const out = new Map(); for (const [k, v] of B) { const w = A.get(k); if (!A.has(k) || !Object.is(w, v)) { const q = k.replace(/\.\d+(?=\.|$)/g, '.*'); out.set(q, (out.get(q) || 0) + 1); } } return out; };
const fmt = m => [...m].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} (${n})`).join(', ');
// (the camera is the save's too — where the god was looking —: put back where it was before the save is read again)
const camAt = () => ({ x: cam.x, y: cam.y, zoom: cam.zoom, tz: cam.tz, follow: cam.follow, target: cam.target }), camTo = c => Object.assign(cam, c);
const pass = (name, prep) => {
  if (prep) prep(); const c0 = camAt(), s0 = G.Save.serialize(), A = process.env.AUDIT ? ALL() : null; const n = frames(); camTo(c0); const s1 = G.Save.serialize();
  const d = s0 === s1 ? null : kinds(s0, s1);
  ok('o save igual depois dos quadros: ' + name, !d, `${scenes.length} lugares, ${n} quadros nas quatro vistas — ${d ? 'MUDOU: ' + fmt(d) : 'o mesmo save, byte a byte'}`);
  if (A) { const w = wrote(A, ALL()); console.log(`  AUDIT ${name}: ${w.size ? fmt(w) : 'nenhuma escrita'}`); }
};
console.log(`${world}: ${home.name}; os mortos: ${dead.join(', ')}; as pessoas: ${live.join(', ')}; ${beasts.length} bichos; os navios: ${ships.join(', ')}; as árvores: ${flora.join(', ')}; ${types.length} prédios (tipo e obra); ${events.join(', ') || 'sem festa nem motim'}`);
pass('de dia', () => { S.time = 0.4; S.weather.rain = 0; });
pass('de noite, com chuva', () => { S.time = 0.95; S.weather.rain = 0.8; S.weather.kind = 'rain'; });
// ------------------------------ the world does not read what the frame writes ------------------------------
// (what the frame leaves on a person for the drawing — its people's colour, its people, the crown: _fc, _civ, _ruler, the
// save leaves them out — is the drawing's: a choice of the world that reads it is another with and without frames. The oath of
// one who lives among another people — G.Scene.oath, which the stories say —, at twenty states of the world's chance, before
// any frame and after one: the same words. The world opened again, nothing drawn yet)
{
  S = M.pronto(world); const civOf = v => { const s = S.settlements.get(v.set), f = s && G.Fac.get(s.fac); return f && f.civ; };
  let v = [...S.villagers.values()].filter(o => !o.captive && o.civ && civOf(o) && o.civ !== civOf(o)).sort((a, b) => a.id - b.id)[0], made = false;
  if (!v) { v = [...S.villagers.values()].filter(o => !o.captive && civOf(o)).sort((a, b) => a.id - b.id)[0]; if (v) { v.civ = ['nordico', 'asteca'].find(c => c !== civOf(v)); made = true; } } // (none: one put there)
  if (!v || !G.Scene || !G.Scene.oath) ok('o mundo não lê o que o quadro escreve', false, 'nenhuma pessoa de outro povo numa cidade, nem o G.Scene.oath');
  else {
    const r0 = S.rng, says = () => { const o = []; for (let k = 0; k < 20; k++) { S.rng = (r0 + k * 7919) | 0; o.push(G.Scene.oath(v)); } S.rng = r0; return o.join('|'); };
    const a = says(), c0 = camAt(); look({ x: v.x, y: v.y, z: 2.2 }); R.update(1 / 60, 0); R.frame(1 / 60); camTo(c0); const b = says();
    ok('o mundo não lê o que o quadro escreve', a === b, `${v.name}, do povo ${v.civ}${made ? ' (posto de propósito)' : ''}, numa cidade ${civOf(v)}: a jura dela ${a === b ? 'a mesma antes e depois de um quadro' : `OUTRA depois de um quadro (o quadro lhe deixa _civ = ${v._civ}, e o G.Scene.oath lê v._civ antes de v.civ): ${a.split('|').slice(0, 3).join(', ')} → ${b.split('|').slice(0, 3).join(', ')}`}`);
  }
}
const e = M.erros(); ok('sem erro do jogo', M.limpo(), M.limpo() ? 'nenhum erro de módulo nem aviso no console' : JSON.stringify(e.mod) + ' ' + e.console.slice(0, 3).join(' | '));
console.log(`(${((clock() - t0) / 1000).toFixed(1)} s)`);
console.log(fails.length ? `FALHOU: ${fails.length}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
