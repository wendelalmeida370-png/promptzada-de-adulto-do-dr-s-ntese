// meio: o mundo nos bichos (D-300 a D-309) — a água e a sede, o vento e o faro, a cobertura e a luz, o calor e o frio, a chuva
// e o pelo molhado, o relevo e o refúgio, a vegetação, as pessoas, as outras espécies e o tempo — provocados de propósito, em
// Node, sobre o código do jogo (js/fauna-meio.js e as portas do animals.js). Cada caso põe os bichos onde o caso pede, longe das
// cidades, e vive o passo do jogo; os casos ruins também: o save no meio de um gole, de uma travessia, de uma lama; o deus que
// ergue a terra sobre o rio para onde um bicho ia beber; a árvore derrubada sobre quem dorme na sombra dela; a chuva e o
// inverno do deus; a seca e a tempestade; o bicho que morre no meio do que fazia.
//   m1 sede e gole: o bicho longe da água anda até a água doce, bebe, a sede cai, a água fica lembrada; nunca bebe o mar;
//   m2 a seca: só a água que dura (o fundo, o largo, os lagos) serve, e os bebedouros se juntam — menos lugares, mais gente
//      em cada um;
//   m3 a travessia: a manada que migra chega ao rio, junta-se na margem, entra de uma vez, nada e sacode a água do outro lado;
//      o crocodilo vem esperar na travessia; com um save no meio a travessia continua;
//   m4 o vento: o mesmo leão, à mesma distância, é sentido contra o vento e não a favor; a caçada inteira: a distância em que a
//      zebra foge muda com o vento;
//   m5 a cobertura e a luz: quem espreita no capim alto é notado mais tarde; o escuro pesa para quem é do dia;
//   m6 o calor: ao meio-dia os bichos da savana vão à sombra das árvores e os da lama à lama ou à água; a árvore derrubada
//      sobre quem dorme na sombra dela o põe de pé;
//   m7 a chuva do deus: o pelo molhado, e a sacudida quando a chuva passa;
//   m8 o frio e a tempestade: o inverno do deus encolhe e abriga os bichos; a tempestade junta a manada;
//   m9 as pessoas: onde se caçou, o bicho foge mais cedo; onde nunca se caçou, ele chega perto para olhar;
//   m10 a lavoura: à noite os bichos com fome comem a plantação; o povo os espanta, e o chão lembra;
//   m11 os abutres: o urubu rodando sobre a carcaça traz as hienas de longe;
//   m12 o alarme entre espécies: o macaco que foge do jaguar avisa a capivara; o pássaro que levanta voo avisa os que pastam;
//   m13 os casos ruins: o save no meio de um gole e de uma lama; o rio que o deus fez terra; o bicho que morre bebendo;
//   m14 a vida longa: anos de salto em mundos de vários tipos e sementes, as contas do que o meio fez os bichos fazerem, as
//       linhas da crônica, o verificador e os tetos da fauna;
//   m15 a mesma semente, o mesmo mundo: duas vezes o mesmo salto, as mesmas contas e os mesmos bichos.
// E em todos o verificador (S0–S2, com as regras do meio: qa/meio-inv.js), nenhum erro de módulo e nenhum gesto recusado.
//   [ONLY=m1,m3] [ANOS=12] node qa/meio.js
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['qa/meio-inv.js'] });
const fails = []; const said = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | meio ${name} | ${info}`); if (!c) fails.push(name); };
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null; const on = k => !ONLY || ONLY.includes(k);
const A = G.Animals, Mi = G.Meio, T = G.T, W = G.W;
const N = () => G.N;
const S = () => G.S;
const sim = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
const clean = () => { const v = QA.check().filter(q => q.sev <= 2); return { n: v.length, msg: v.slice(0, 3).map(q => `S${q.sev} ${q.msg}`).join('; ') }; };
const gestErr = () => A.gestErr.length;
const near = (x, y, r) => { for (const s of S().settlements.values()) if (G.dist(x, y, s.cx, s.cy) < r + (s.radius || 8)) return true; return false; };
// a remote place: far from the towns, the kind can stand there, with the test the case asks
function spot(test, minTown) {
  const n = N(); for (let y = 6; y < n - 6; y += 1) for (let x = 6; x < n - 6; x += 1) { const cx = x + 0.5, cy = y + 0.5; if (near(cx, cy, minTown || 18)) continue; if (test(cx, cy, y * n + x)) return [cx, cy]; }
  return null;
}
function clearAround(x, y, r, keep) { for (const a of [...S().animals.values()]) { if (keep && keep.has(a.id)) continue; if (G.dist(a.x, a.y, x, y) < r) A.remove(a); } }
function spawn(k, x, y, o) { return sim(() => { const a = A.spawn(k, x, y, Object.assign({ grown: 1, hunger: 0.1, t: 0, scan: 0, age: A.DEF[k].life * 0.3 }, o || {})); a.hx = x; a.hy = y; return a; }); }
const until = (sec, f, step) => { const n = Math.ceil(sec / (step || 0.5)); for (let k = 0; k < n; k++) { M.viver(step || 0.5); if (f()) return k * (step || 0.5); } return -1; };
const land = (x, y) => W.inb(x, y) && S().type[W.idx(x, y)] >= T.SAND && !S().cliff[W.idx(x, y)] && !S().occ[W.idx(x, y)];
const day = () => { S().time = 0.36; };
const calmSky = () => { const w = S().weather; w.rain = 0; w.storm = 0; w.drought = 0; S().clouds.length = 0; S().winters = []; };
const world = (seed, type, size) => { M.novo({ seed: seed || 103, type: type || 'continente', size: size || 128, tribes: 4 }); M.viver(1); calmSky(); };

// ---------------------------------------------------------------- m1 thirst
if (on('m1')) { world(); calmSky(); day();
  const p = spot((x, y, i) => land(x, y) && S().biome[i] === 5 && Mi.waterDist(x, y) >= 9 && Mi.waterDist(x, y) <= 16 && A.walkOK({ kind: 'zebra' }, x, y));
  if (!p) ok('m1 sede e gole', false, 'nenhum lugar de savana a 9–16 casas da água longe das cidades');
  else {
    clearAround(p[0], p[1], 14); const d0 = Mi.waterDist(p[0], p[1]);
    const z = spawn('zebra', p[0], p[1], { meio: { th: 0.93 } }); let atW = null, drink = false;
    const t = until(120, () => { const r = Mi.phase(z); if (z.state === 'beber' && r && r.p >= 1) { atW = atW || { x: z.x, y: z.y, wi: r.wi }; if (z.gest === 'drink') drink = true; } return z.meio.th < 0.05 || z.dead; });
    const wi = atW ? atW.wi : -1; const fresh = wi >= 0 && S().type[wi] === T.RIVER;
    const mem = z.meio.wx >= 0 && S().type[z.meio.wy * N() + z.meio.wx] === T.RIVER;
    // the sea: a thirsty beast by the shore, rivers far — it never drinks there
    const q = spot((x, y, i) => land(x, y) && Mi.waterDist(x, y) === 255 && (() => { for (let k = 0; k < 8; k++) { const xx = x + Math.cos(k) * 2, yy = y + Math.sin(k) * 2; if (W.inb(xx, yy) && S().type[W.idx(xx, yy)] <= T.SEA) return true; } return false; })(), 10);
    let sea = 'nenhuma praia longe dos rios'; let seaOk = true;
    if (q) { clearAround(q[0], q[1], 8); const g = spawn('gnu', q[0], q[1], { meio: { th: 0.95 } }); let bad = 0, tried = 0; until(40, () => { if (g.state === 'beber') tried++; const r = Mi.phase(g); if (g.state === 'beber' && r && r.p >= 1 && S().type[r.wi] !== T.RIVER) bad++; return false; }); seaOk = !bad; sea = `um gnu com sede na praia (rio fora de alcance): ${tried ? tried + ' olhadas indo beber' : 'nem tentou'}, ${bad} goles fora da água doce`; }
    const c = clean();
    ok('m1 sede e gole', t >= 0 && drink && fresh && mem && seaOk && !c.n && !gestErr(), `a zebra a ${d0} casas da água: bebeu em ${t} s (gesto «drink» ${drink ? 'visto' : 'NÃO visto'}), na água ${fresh ? 'doce' : 'ERRADA'} (${atW ? atW.x.toFixed(1) + ',' + atW.y.toFixed(1) : '—'}), a sede ${z.meio.th}, a água lembrada ${mem ? 'é rio' : 'NÃO'}; ${sea}; verificador ${c.n}${c.n ? ': ' + c.msg : ''}`);
  } }

// ---------------------------------------------------------------- m2 drought
if (on('m2')) { world(); calmSky(); const s0 = G.Save.serialize();
  const look = (dry) => { M.abrir(JSON.parse(s0)); calmSky(); if (dry) S().weather.drought = G.DAY_LEN * 2;
    // (every thirsty enough beast goes down to drink now: the same day, with and without the drought)
    for (const a of S().animals.values()) { if (!a.dead && a.meio && a.meio.th > 0.2) a.meio.th = Math.max(a.meio.th, 0.7); }
    const spots = new Map(); let goles = 0, off = 0;
    for (let k = 0; k < 240; k++) { M.viver(0.5); for (const a of S().animals.values()) { if (a.state !== 'beber' || a.dead) continue; const r = Mi.phase(a); if (!r || r.p < 1) continue; const key = Math.floor((r.wi % N()) / 8) + ',' + Math.floor(r.wi / N() / 8); if (!r.seen) { r.seen = 1; goles++; spots.set(key, (spots.get(key) || 0) + 1); if (dry && !Mi.lasting((r.wi % N()) + 0.5, Math.floor(r.wi / N()) + 0.5)) off++; } } }
    return { goles, lugares: spots.size, porLugar: goles / Math.max(1, spots.size), off }; };
  const a = look(false), b = look(true); const c = clean();
  ok('m2 a seca junta os bichos na água que dura', b.off === 0 && b.goles > 0 && b.lugares < a.lugares && b.porLugar > a.porLugar && !c.n, `sem seca: ${a.goles} idas à água em ${a.lugares} lugares (${a.porLugar.toFixed(1)} por lugar); na seca: ${b.goles} em ${b.lugares} (${b.porLugar.toFixed(1)} por lugar), ${b.off} fora da água que dura; verificador ${c.n}${c.n ? ': ' + c.msg : ''}`); }

// ---------------------------------------------------------------- m3 the crossing
function riverCross(kind) {
  const n = N(); const s = S(); const ok = (x, y) => land(x, y) && A.walkOK({ kind }, x + 0.5, y + 0.5) && !near(x, y, 12);
  for (let y = 10; y < n - 10; y++) for (let x = 10; x < n - 10; x++) {
    const i = y * n + x; if (s.type[i] !== T.RIVER) continue;
    for (const [dx, dy] of [[1, 0], [0, 1]]) {
      if (s.type[(y - dy) * n + (x - dx)] === T.RIVER) continue; // (the first water tile on the way)
      let w = 0; while (w < 5 && s.type[(y + dy * w) * n + (x + dx * w)] === T.RIVER) w++; if (w < 1 || w > 4) continue;
      let good = true; for (let k = 1; k <= 7 && good; k++) { if (!ok(x - dx * k, y - dy * k) || !ok(x + dx * (w - 1 + k), y + dy * (w - 1 + k))) good = false; for (const o of [-1, 1]) if (good && !ok(x - dx * k + dy * o, y - dy * k + dx * o)) good = false; }
      if (good && s.biome[i] !== 1) return { x: x + 0.5, y: y + 0.5, dx, dy, w };
    }
  }
  return null;
}
if (on('m3')) { world(); calmSky(); day();
  const rc = riverCross('gnu');
  if (!rc) ok('m3 a travessia', false, 'nenhum rio estreito com margens livres');
  else {
    const { x, y, dx, dy, w } = rc; clearAround(x, y, 18);
    const sx = x - dx * 7, sy = y - dy * 7, fx = x + dx * (w + 7), fy = y + dy * (w + 7);
    const L = spawn('gnu', sx, sy); const herd = [L]; for (let k = 1; k < 10; k++) herd.push(spawn('gnu', sx + dy * (k % 5 - 2) * 0.8 - dx * Math.floor(k / 5), sy + dx * (k % 5 - 2) * 0.8 - dy * Math.floor(k / 5), { leader: L.id }));
    for (const g of herd) { g.mig = true; g.hx = fx; g.hy = fy; g.state = 'idle'; g.t = 0; }
    const croc = spawn('croc', x + dy * 3, y + dx * 3, { hunger: 0.85 });
    let bunch = 0, swim = 0, wade = 0, rec = null, crossed = 0, croc0 = {}, saved = 0; const side = g => ((g.x - x) * dx + (g.y - y) * dy) > w; let loadedAt = -1; const n0 = Mi.counts().cross || 0; let recMax = 0;
    until(160, () => {
      let b = 0; for (const g of herd) { if (g.dead) continue; const r = Mi.phase(g); if (g.state === 'travessia' && r && r.p === 1) b++; if (g.gest === 'swim') swim++; if (g.gest === 'wade') wade++; }
      bunch = Math.max(bunch, b); const cs = Mi.crossings(); for (const q of cs) { rec = q; recMax = Math.max(recMax, q.crossed); } croc0[croc.state] = 1;
      // (the save in the middle: two of them in the water)
      if (!saved && herd.filter(g => !g.dead && g.state === 'travessia' && (Mi.phase(g) || {}).p === 2).length >= 2) { saved = 1; M.salvarCarregar(); for (let k = 0; k < herd.length; k++) herd[k] = A.find(herd[k].id) || herd[k]; loadedAt = S().clock; }
      crossed = herd.filter(g => !g.dead && side(g)).length; return crossed >= 9 && loadedAt > 0 && S().clock - loadedAt > 10;
    }, 0.25);
    const swam = (Mi.counts().cross || 0) - n0;
    const dead = herd.filter(g => g.dead || !S().animals.has(g.id)).length; const c = clean();
    ok('m3 a travessia', bunch >= 3 && crossed >= 6 && swam >= 6 && (swim + wade) > 0 && !!rec && saved && !c.n && !gestErr(),
      `um rio de ${w} casa(s): até ${bunch} gnus juntos na margem, ${crossed} do outro lado (${swam} travessias contadas)${dead ? `, ${dead} ficaram no rio` : ''}, gestos na água: nadando ${swim}, na água rasa ${wade}; a travessia ${rec ? `registrada (até ${recMax} atravessaram numa)` : 'NÃO registrada'}; o crocodilo passou por ${Object.keys(croc0).join('/')}; save no meio da travessia ${saved ? 'e ela continuou' : 'NÃO feito'}; verificador ${c.n}${c.n ? ': ' + c.msg : ''}`);
  } }

// ---------------------------------------------------------------- m4 wind
if (on('m4')) { world(); calmSky(); day();
  const p = spot((x, y, i) => land(x, y) && S().biome[i] === 5 && Mi.cover(x, y) === 0 && Mi.cover(x + 3, y) === 0 && Mi.cover(x + 6, y) === 0 && A.walkOK({ kind: 'lion' }, x + 3, y) && A.walkOK({ kind: 'lion' }, x + 9, y) && Mi.waterDist(x, y) > 4);
  if (!p) ok('m4 o vento', false, 'nenhum chão aberto de savana');
  else {
    const [x, y] = p; clearAround(x, y, 24); const z = spawn('zebra', x, y, { hunger: 0 }); const l = spawn('lion', x + 2.5, y, { hunger: 0.2 }); l.state = 'stalk'; l.crouch = 1; l.target = z.id;
    const W0 = S().weather; const at = a => { W0.windA = a; M.viver(0.3); l.x = x + 2.5; l.y = y; l.state = 'stalk'; l.crouch = 1; z.x = x; z.y = y; return { k: A.senseMul(z, l), seen: A.fearOf(z) === l }; };
    const up = at(Math.PI), down = at(0); // (the wind from the lion to the zebra — the lion upwind; and from the zebra to the lion)
    // the whole hunt, twice: the lion creeping in from nine tiles, the wind from it and to it — where the zebra breaks
    const hunt = (wa) => { clearAround(x, y, 24); const z2 = spawn('zebra', x, y, { hunger: 0 }); const l2 = spawn('lion', x + 12, y, { hunger: 0 }); W0.windA = wa; W0.windS = 0.3; let dd = -1;
      until(30, () => { W0.windA = wa; if (l2.state !== 'wander' && dd < 0) { l2.state = 'wander'; l2.tx = z2.x; l2.ty = z2.y; l2.t = 9; } if (dd < 0 && A.fearOf(z2) === l2) dd = G.dist(z2.x, z2.y, l2.x, l2.y); return dd >= 0 || z2.dead || G.dist(z2.x, z2.y, l2.x, l2.y) < 1; }, 0.1); return dd; };
    const hu = hunt(Math.PI), hd = hunt(0); const c = clean();
    ok('m4 o vento muda a caçada', up.k > down.k * 1.8 && up.seen && !down.seen && hu > 0 && (hd < 0 || hu > hd * 1.5) && !c.n, `o leão a 2,5 casas, espreitando: contra o vento ×${up.k.toFixed(2)} (${up.seen ? 'sentido' : 'não sentido'}), a favor ×${down.k.toFixed(2)} (${down.seen ? 'SENTIDO' : 'não sentido'}); o leão vindo a pé de 12 casas: a zebra fugiu com ele a ${hu < 0 ? 'NUNCA' : hu.toFixed(1) + ' casas'} contra o vento e a ${hd < 0 ? 'nunca (o leão chegou)' : hd.toFixed(1) + ' casas'} a favor; verificador ${c.n}`);
  } }

// ---------------------------------------------------------------- m5 cover and light
if (on('m5')) { world(); calmSky(); day();
  const p = spot((x, y, i) => land(x, y) && Mi.cover(x, y) === 0 && Mi.cover(x + 2, y) >= 0.6 && A.walkOK({ kind: 'leopard' }, x + 2, y) && A.walkOK({ kind: 'deer' }, x, y));
  if (!p) ok('m5 a cobertura e a luz', false, 'nenhum capim alto, mato ou arbusto ao lado de chão aberto');
  else {
    const [x, y] = p; clearAround(x, y, 10); const d = spawn('deer', x, y, { hunger: 0 }); const lp = spawn('leopard', x + 2, y, { hunger: 0.3 }); lp.state = 'stalk'; lp.crouch = 1;
    S().weather.windA = Math.PI / 2; S().weather.windS = 0.3; M.viver(0.05); // (the wind across the line: no scent either way)
    lp.x = x + 2; lp.y = y; lp.state = 'stalk'; const kc = A.senseMul(d, lp), cov = Mi.cover(lp.x, lp.y);
    lp.x = x - 2; lp.y = y; const open = Mi.cover(lp.x, lp.y); const ko = A.senseMul(d, lp);
    const hy = spawn('hyena', x + 1, y + 1, { hunger: 0 }); const kHd = A.senseMul(hy, d);
    S().time = 0.85; M.viver(0.05); lp.x = x - 2; lp.y = y; lp.state = 'stalk'; hy.x = x + 1; hy.y = y + 1; d.x = x; d.y = y; const kn = A.senseMul(d, lp); const kOwl = A.senseMul(hy, d) / kHd;
    S().time = 0.36; const c = clean();
    ok('m5 a cobertura e a luz', kc < ko * 0.7 && kn < ko * 0.8 && !c.n, `o leopardo espreitando a 2 casas do cervo: no mato (cobertura ${cov.toFixed(2)}) ×${kc.toFixed(2)}, no aberto (${open.toFixed(2)}) ×${ko.toFixed(2)}, no aberto à noite ×${kn.toFixed(2)} (a hiena, que vê no escuro, de noite ×${kOwl.toFixed(2)} do dia); verificador ${c.n}`);
  } }

// ---------------------------------------------------------------- m6 heat
if (on('m6')) { world(); calmSky(); S().time = 0.34;
  const p = spot((x, y, i) => land(x, y) && S().biome[i] === 5 && A.treeNear(x, y, 4, t => t.kind !== 'cactus') && Mi.waterDist(x, y) <= 7 && Mi.waterDist(x, y) >= 2 && S().temp[i] > 170);
  if (!p) ok('m6 o calor', false, 'nenhuma savana quente com árvore e água perto');
  else {
    const [x, y] = p; clearAround(x, y, 14);
    const cats = [0, 1, 2].map(k => spawn('lion', x + k * 0.6, y + 0.5, { hunger: 0.05, meio: { hot: 0.85 } })); for (const l of cats.slice(1)) l.leader = cats[0].id;
    const muds = [spawn('buffalo', x - 1, y - 1, { hunger: 0.05, meio: { hot: 0.85 } }), spawn('elephant', x - 1.5, y + 1.5, { hunger: 0.05, meio: { hot: 0.85 } }), spawn('rhino', x + 1, y - 1.5, { hunger: 0.05, meio: { hot: 0.85 } })];
    let shade = 0, cool = 0, under = null; const tree0 = {};
    until(60, () => { for (const l of cats) { const r = Mi.phase(l); if (l.state === 'sombra' && r && r.p === 1) { shade = Math.max(shade, 1); under = under || l; tree0[r.id] = 1; } } for (const b of muds) { const r = Mi.phase(b); if ((b.state === 'lama' || b.state === 'banho') && r && r.p === 1) cool++; } return under && cool > 0; });
    // the tree felled over the one asleep in its shade
    let rose = 'ninguém na sombra';
    if (under) { const r = Mi.phase(under); const t = S().trees.get(r.id); sim(() => G.Nature.fellTree(t, 1)); const w = until(4, () => under.state !== 'sombra'); rose = w >= 0 ? `de pé em ${w.toFixed(1)} s quando a árvore caiu (${under.state}${under.gest ? ', ' + under.gest : ''})` : 'FICOU deitado sob a árvore caída'; }
    const c = clean();
    ok('m6 o calor manda à sombra e à lama', !!under && cool > 0 && /de pé/.test(rose) && !c.n && !gestErr(), `ao meio-dia na savana: leões na sombra ${under ? 'sim' : 'NÃO'}, búfalo/elefante/rinoceronte na lama ou na água ${cool ? 'sim' : 'NÃO'} (${muds.map(b => b.kind + ' ' + b.state + ' lama ' + (b.meio || {}).mud).join(', ')}); o leão ${rose}; verificador ${c.n}${c.n ? ': ' + c.msg : ''}`);
  } }

// ---------------------------------------------------------------- m7 rain
if (on('m7')) { world(); calmSky(); day();
  const p = spot((x, y, i) => land(x, y) && S().biome[i] === 0 && A.walkOK({ kind: 'deer' }, x, y) && Mi.waterDist(x, y) > 5);
  if (!p) ok('m7 a chuva', false, 'nenhuma floresta temperada longe da água');
  else {
    const [x, y] = p; clearAround(x, y, 26); const d = spawn('deer', x, y, { hunger: 0 });
    // (the god's rain where the deer is, again as it walks off)
    let wet = 0, rains = 0; until(25, () => { if (!S().clouds.some(q => G.dist(q.x, q.y, d.x, d.y) < 3)) { sim(() => G.Powers.rain(d.x, d.y)); rains++; } wet = Math.max(wet, d.meio ? d.meio.wet : 0); return false; });
    S().clouds.length = 0; S().weather.rain = 0; let shook = false; const w0 = d.meio.wet;
    const t = until(25, () => { if (d.gest === 'shake') shook = true; return shook; }); const c = clean();
    ok('m7 a chuva do deus molha e o bicho se sacode', wet > 0.5 && shook && !c.n, `a chuva do deus sobre o cervo (${rains} nuvens): o pelo ${wet.toFixed(2)} molhado; a chuva passou (${w0.toFixed(2)}): ${shook ? `sacudiu-se em ${t.toFixed(1)} s, o pelo a ${d.meio.wet.toFixed(2)}` : 'NÃO se sacudiu'}; verificador ${c.n}`);
  } }

// ---------------------------------------------------------------- m8 cold and storm
if (on('m8')) { world(); calmSky(); S().time = 0.8;
  const p = spot((x, y, i) => land(x, y) && S().biome[i] === 0 && A.walkOK({ kind: 'deer' }, x, y));
  if (!p) ok('m8 o frio e a tempestade', false, 'nenhuma floresta temperada');
  else {
    const [x, y] = p; clearAround(x, y, 12); const L = spawn('deer', x, y, { hunger: 0.1 }); const herd = [L, spawn('deer', x + 0.8, y, { leader: L.id, hunger: 0.1 }), spawn('deer', x, y + 0.8, { leader: L.id, hunger: 0.1 })]; const fox = spawn('fox', x + 3, y + 2, { hunger: 0.1 });
    sim(() => G.Powers.winter(x, y)); let cold = 0; const st = {};
    until(60, () => { for (const a of herd.concat([fox])) { if (a.dead) continue; cold = Math.max(cold, a.meio ? a.meio.cold : 0); if (G.Meio.MINE[a.state] || a.gest === 'shiver') st[a.kind + ':' + (a.gest === 'shiver' ? 'shiver' : a.state)] = 1; } return false; });
    // the storm: the herd bunches, heads down
    S().winters = []; sim(() => G.Events.storm()); S().weather.rain = 0.8; const st2 = {};
    const gn = spot((x2, y2, i) => land(x2, y2) && S().biome[i] === 5 && A.walkOK({ kind: 'gnu' }, x2, y2));
    let bunch = 0; if (gn) { clearAround(gn[0], gn[1], 10); const G0 = spawn('gnu', gn[0], gn[1]); const gs = [G0]; for (let k = 1; k < 6; k++) gs.push(spawn('gnu', gn[0] + (k % 3) * 1.2, gn[1] + Math.floor(k / 3) * 1.2, { leader: G0.id }));
      until(40, () => { S().weather.rain = Math.max(S().weather.rain, 0.6); let n = 0; for (const g of gs) { if (g.dead) continue; if (G.Meio.MINE[g.state]) st2[g.state] = 1; if (g.state === 'aconchego' || g.state === 'abrigo') n++; } bunch = Math.max(bunch, n); return false; }); }
    calmSky(); const c = clean();
    ok('m8 o frio encolhe e a tempestade junta', cold > 0.55 && Object.keys(st).length > 0 && bunch >= 3 && !c.n && !gestErr(), `o inverno do deus: o frio chegou a ${cold.toFixed(2)}; o que fizeram: ${Object.keys(st).join(', ') || 'NADA'}; na tempestade, até ${bunch} gnus juntos (${Object.keys(st2).join(', ')}); verificador ${c.n}${c.n ? ': ' + c.msg : ''}`);
  } }

// ---------------------------------------------------------------- m9 people
if (on('m9')) { world(); calmSky(); day();
  const v = [...S().villagers.values()].find(q => q.age >= 18 && !q.inside && !q.captive && q.role !== 'guerreiro' && q.role !== 'cacador');
  const p = spot((x, y, i) => land(x, y) && A.walkOK({ kind: 'deer' }, x, y) && A.walkOK({ kind: 'deer' }, x + 6, y) && Mi.fearAt(x, y) === 0 && Mi.fearAt(x + 6, y) === 0 && Mi.cover(x, y) === 0, 12);
  if (!v || !p) ok('m9 as pessoas', false, `${v ? '' : 'ninguém para a prova '}${p ? '' : 'nenhum ermo'}`);
  else {
    const [x, y] = p; clearAround(x, y, 14); S().weather.windA = Math.PI / 2;
    const put = () => { v.x = x; v.y = y; v.task = null; v.inside = 0; };
    put(); const d = spawn('deer', x + 6, y, { hunger: 0 }); M.viver(0.3); put(); d.x = x + 6; d.y = y;
    const k0 = A.senseMul(d, v), f0 = !!A.fearOf(d);
    // three deer killed by people here
    for (let k = 0; k < 3; k++) { const o = spawn('deer', x + 5, y + 1); sim(() => A.kill(o, v)); }
    put(); d.x = x + 6; d.y = y; M.viver(0.3); put(); d.x = x + 6; d.y = y; const k1 = A.senseMul(d, v), f1 = !!A.fearOf(d); const fear = Mi.fearAt(x + 6, y);
    // the curious ones where nobody ever hunted
    const q = spot((x2, y2, i) => land(x2, y2) && A.walkOK({ kind: 'deer' }, x2, y2) && Mi.fearAt(x2, y2) === 0 && Mi.fearAt(x2 + 9, y2) === 0 && A.walkOK({ kind: 'deer' }, x2 + 9, y2) && G.dist(x2, y2, x, y) > 30 && Mi.cover(x2, y2) === 0, 12);
    let cur = 0, gst = false, dmin = 99, info = 'nenhum ermo para a curiosidade';
    // (the wind across: nobody smells the person first)
    if (q) { clearAround(q[0], q[1], 20); S().weather.windA = Math.PI / 2; const herd = []; for (let k = 0; k < 6; k++) herd.push(spawn(['gazelle', 'giraffe', 'camel', 'zebra', 'gazelle', 'giraffe'][k], q[0] + 9, q[1] + (k - 2.5) * 1.5, { hunger: 0.05 }));
      until(45, () => { v.x = q[0]; v.y = q[1]; v.task = null; v.inside = 0; S().weather.windA = Math.PI / 2; for (const a of herd) { if (a.state === 'curioso') { cur = Math.max(cur, 1); if (a.gest === 'curious') { gst = true; dmin = Math.min(dmin, G.dist(a.x, a.y, v.x, v.y)); } } } return gst && cur; }, 0.25);
      info = `num ermo onde ninguém caçou, ${cur ? 'um bicho chegou perto para olhar' : 'NINGUÉM chegou perto'} (gesto «curious» ${gst ? `a ${dmin.toFixed(1)} casas` : 'não visto'}; contados ${Mi.counts().curious || 0})`; }
    const c = clean();
    ok('m9 onde se caça, foge-se mais cedo; onde não, olha-se', k1 > k0 * 1.6 && !f0 && f1 && fear > 0.3 && cur && gst && !c.n, `o cervo a 6 casas de ${v.name}: antes ×${k0.toFixed(2)} (${f0 ? 'FUGIU' : 'ficou'}); depois de três cervos mortos por gente ali (o medo ${fear.toFixed(2)}): ×${k1.toFixed(2)} (${f1 ? 'fugiu' : 'NÃO FUGIU'}); ${info}; verificador ${c.n}`);
  } }

// ---------------------------------------------------------------- m10 the fields
if (on('m10')) { world(); calmSky(); M.saltar(2); calmSky();
  const farms = [...S().buildings.values()].filter(b => b.type === 'farm' && b.built && b.crops);
  S().time = 0.8; M.viver(2);
  const out = (cx, cy) => [...S().villagers.values()].filter(v => !v.inside && G.dist(v.x, v.y, cx, cy) < 12).length;
  const f = farms.filter(b => { const cx = b.x + 1.5, cy = b.y + 1.5; for (let k = 0; k < 12; k++) { const x = cx + Math.cos(k / 2) * 8, y = cy + Math.sin(k / 2) * 8; if (W.inb(x, y) && A.walkOK({ kind: 'boar' }, x, y) && A.lineOK({ kind: 'boar' }, x, y, cx, cy)) return true; } return false; }).sort((p, q) => { const sp = S().settlements.get(p.set), sq = S().settlements.get(q.set); return (out(p.x + 1.5, p.y + 1.5) - out(q.x + 1.5, q.y + 1.5)) || ((sq ? G.dist(q.x, q.y, sq.cx, sq.cy) : 0) - (sp ? G.dist(p.x, p.y, sp.cx, sp.cy) : 0)); })[0]; // (the field farthest out, nobody about it)
  if (!f) ok('m10 a lavoura', false, `nenhuma fazenda com chão em volta (${farms.length} fazendas)`);
  else {
    for (const c of f.crops) { c.s = 3; c.g = 1; }
    S().time = 0.8; M.viver(10.5); /* (the fields worth a raid are looked at every ten seconds) */ const cx = f.x + 1.5, cy = f.y + 1.5; let sp0 = null; for (let k = 0; k < 12 && !sp0; k++) { const x = cx + Math.cos(k / 2) * 8, y = cy + Math.sin(k / 2) * 8; if (W.inb(x, y) && A.walkOK({ kind: 'boar' }, x, y) && A.lineOK({ kind: 'boar' }, x, y, cx, cy)) sp0 = [x, y]; }
    // (nobody out at night on the fields: the people of the test stay home)
    const raiders = [spawn('boar', sp0[0], sp0[1], { hunger: 0.85 }), spawn('boar', sp0[0] + 0.6, sp0[1], { hunger: 0.85 }), spawn('elephant', sp0[0], sp0[1] + 0.8, { hunger: 0.85 })];
    let raid = false, ate = 0; const lastG = new Map();
    until(90, () => { if (S().time < 0.75 && S().time > 0.05) S().time = 0.8; for (const a of raiders) { const r = Mi.phase(a); if (a.state === 'lavoura' && r && r.p === 1) { raid = true; const c = f.crops[r.k]; const g = lastG.get(a.id * 16 + r.k); if (g !== undefined && c.g < g) ate += g - c.g; lastG.set(a.id * 16 + r.k, c.g); } } return raid && ate > 0.3; });
    // the farmer's answer: a person at the edge of the field
    const v = [...S().villagers.values()].find(q => q.age >= 16 && !q.captive); let scared = false; const fear0 = Mi.learnt(cx, cy); const sc0 = Mi.counts().raidScared || 0;
    if (v) { const who = raiders.find(a => a.state === 'lavoura') || raiders[0]; until(10, () => { v.x = who.x + 1.5; v.y = who.y; v.inside = 0; v.task = null; return (Mi.counts().raidScared || 0) > sc0; }, 0.25); scared = (Mi.counts().raidScared || 0) > sc0; }
    const fear1 = Mi.learnt(cx, cy); const c = clean();
    ok('m10 a lavoura: os bichos comem a plantação, o povo os espanta e o chão lembra', raid && ate > 0.3 && scared && fear1 > fear0 && !c.n && !gestErr(), `à noite, ${raiders.length} bichos com fome perto da fazenda de ${(S().settlements.get(f.set) || {}).name}: ${raid ? 'entraram' : 'NÃO ENTRARAM'}, comeram ${ate.toFixed(2)} do crescido dos canteiros; uma pessoa à beira do campo: ${scared ? 'espantou-os' : 'NÃO os espantou'}; o medo aprendido ali ${fear0.toFixed(2)} → ${fear1.toFixed(2)}; verificador ${c.n}${c.n ? ': ' + c.msg : ''}`);
  } }

// ---------------------------------------------------------------- m11 the vultures
if (on('m11')) { world(); calmSky(); day();
  const p = spot((x, y, i) => land(x, y) && S().biome[i] === 5 && A.walkOK({ kind: 'hyena' }, x, y) && A.walkOK({ kind: 'hyena' }, x + 20, y) && A.lineOK({ kind: 'hyena' }, x + 20, y, x, y));
  if (!p) ok('m11 os abutres', false, 'nenhuma savana aberta de vinte casas');
  else {
    const [x, y] = p; clearAround(x, y, 36); const z = spawn('buffalo', x, y); sim(() => A.kill(z, null, 'other'));
    const vs = [spawn('vulture', x + 2, y + 1, { hunger: 0.9 }), spawn('vulture', x - 1, y + 2, { hunger: 0.9 })];
    const hy = [spawn('hyena', x + 20, y, { hunger: 0.8 }), spawn('hyena', x + 20, y + 1, { hunger: 0.8 })]; for (const h of hy) h.rest = 0;
    let circ = false, follow = false, arrived = false;
    until(70, () => { for (const v of vs) if (v.state === 'circle' || v.state === 'eat') circ = true; for (const h of hy) { if (h.state === 'abutres') follow = true; if (G.dist(h.x, h.y, z.x, z.y) < 2) arrived = true; } return follow && arrived; });
    const c = clean();
    ok('m11 os abutres no céu trazem as hienas', circ && follow && arrived && !c.n, `abutres rodando ${circ ? 'sim' : 'NÃO'}; as hienas a 20 casas ${follow ? 'olharam para o céu e foram' : 'NÃO foram'}${arrived ? ', e chegaram à carcaça' : ', e NÃO chegaram'}; verificador ${c.n}`);
  } }

// ---------------------------------------------------------------- m12 the alarm across kinds
if (on('m12')) { world(); calmSky(); day();
  const p = spot((x, y, i) => land(x, y) && A.walkOK({ kind: 'monkey' }, x, y) && A.walkOK({ kind: 'capybara' }, x + 8, y) && A.walkOK({ kind: 'jaguar' }, x - 2.5, y) && Mi.fearAt(x, y) === 0, 12);
  if (!p) ok('m12 o alarme', false, 'nenhum ermo');
  else {
    const [x, y] = p; clearAround(x, y, 16);
    const mk = spawn('monkey', x, y); const cap = spawn('capybara', x + 8, y); const zb = spawn('zebra', x + 7, y + 3); const j = spawn('jaguar', x - 2.5, y, { hunger: 0.95 }); j.state = 'chase'; j.target = mk.id; j.t = 8;
    const x0 = Mi.counts().alarmX || 0; mk.state = 'flee'; mk.tx = x + 5; mk.ty = y; mk.t = 3;
    let heard = false, alert = false; until(4, () => { if (cap.meio && cap.meio.al > 0) heard = true; if (cap.gest === 'alert' || zb.gest === 'alert') alert = true; return heard && alert; }, 0.25);
    const xk = (Mi.counts().alarmX || 0) - x0;
    // the bird that bursts up from a stalking hunter
    const q = spot((x2, y2, i) => land(x2, y2) && A.walkOK({ kind: 'gazelle' }, x2 + 6, y2) && A.walkOK({ kind: 'leopard' }, x2 + 1, y2) && Mi.fearAt(x2, y2) === 0 && G.dist(x2, y2, x, y) > 30, 12);
    let flushed = false, heard2 = false; if (q) { clearAround(q[0], q[1], 14); const bird = spawn('parrot', q[0], q[1]); bird.state = 'perch'; bird.z = 0; bird.perchZ = 0; bird.t = 30; const g = spawn('gazelle', q[0] + 6, q[1]); const lp = spawn('leopard', q[0] + 1, q[1], { hunger: 0.9 }); lp.state = 'stalk'; lp.target = g.id; lp.t = 20;
      until(5, () => { if (bird.state === 'fly') flushed = true; if (g.meio && g.meio.al > 0) heard2 = true; return flushed && heard2; }, 0.25); }
    const c = clean();
    ok('m12 o alarme atravessa as espécies', heard && alert && xk > 0 && flushed && heard2 && !c.n && !gestErr(), `o macaco fugindo do jaguar: a capivara a 8 casas ${heard ? 'ouviu' : 'NÃO ouviu'} (${alert ? 'ergueu a cabeça' : 'NÃO ergueu'}), ${xk} espécie(s) avisada(s); o papagaio sobre o leopardo que espreita: ${flushed ? 'levantou voo' : 'NÃO voou'}, a gazela ${heard2 ? 'ficou alerta' : 'NÃO ouviu'}; verificador ${c.n}`);
  } }

// ---------------------------------------------------------------- m13 the bad cases
if (on('m13')) { world(); calmSky(); day(); const said13 = []; let good = true;
  const p = spot((x, y, i) => land(x, y) && S().biome[i] === 5 && Mi.waterDist(x, y) >= 5 && Mi.waterDist(x, y) <= 10 && A.walkOK({ kind: 'zebra' }, x, y));
  if (!p) { good = false; said13.push('nenhuma savana perto da água'); }
  else {
    const [x, y] = p; clearAround(x, y, 14);
    // a) the save in the middle of a drink: the state does not go in the save — the thirst does; after the load the zebra decides
    // again, without the drinking gesture left on it, and goes back to drink
    const z = spawn('zebra', x, y, { meio: { th: 0.95 } }); const t = until(60, () => z.state === 'beber' && (Mi.phase(z) || {}).p === 1 && z.gest === 'drink');
    if (t < 0) { good = false; said13.push('a) a zebra NÃO chegou a beber'); }
    else { const th0 = z.meio.th; M.salvarCarregar(); const z2 = A.find(z.id); M.viver(1); const stale = z2.gest === 'drink' && z2.state !== 'beber'; const back = until(60, () => z2.meio.th < th0 - 0.3);
      if (stale || back < 0 || Math.abs(z2.meio.th - th0) > 0.5) good = false; said13.push(`a) save no meio do gole (a sede ${th0}): depois do load ${stale ? 'o gesto de beber FICOU sem o gole' : 'o gesto foi com o estado'}, ${back >= 0 ? `bebeu de novo em ${back.toFixed(0)} s` : 'NÃO voltou a beber'}`); }
    // b) the beast that dies while it drinks
    const z3 = spawn('zebra', x + 1, y, { meio: { th: 0.95 } }); until(60, () => z3.state === 'beber' && (Mi.phase(z3) || {}).p >= 1);
    if (z3.state === 'beber') { sim(() => A.kill(z3, null, 'other')); M.viver(1); const left = !!Mi.phase(z3) || (z3.gest && z3.gest !== 'drink' ? false : z3.gest === 'drink' && !z3.dead); said13.push(`b) morta bebendo: ${Mi.phase(z3) ? 'o registro FICOU' : 'o registro foi junto'}`); if (Mi.phase(z3)) good = false; void left; }
    else said13.push('b) (a segunda zebra não chegou à água a tempo)');
    // c) the god raises the land over the water a beast is walking to: it finds other water, or gives up — never drinks dry land
    const z4 = spawn('zebra', x, y + 1, { meio: { th: 0.95 } }); until(20, () => z4.state === 'beber' && (Mi.phase(z4) || {}).p === 0 && G.dist(z4.x, z4.y, x, y + 1) > 1.5);
    const r4 = Mi.phase(z4);
    if (r4) { const wx = (r4.wi % N()) + 0.5, wy = Math.floor(r4.wi / N()) + 0.5; const n = N(); for (let yy = Math.floor(wy) - 5; yy <= wy + 5; yy++) for (let xx = Math.floor(wx) - 5; xx <= wx + 5; xx++) { if (!W.inb(xx, yy)) continue; const i = yy * n + xx; if (S().type[i] === T.RIVER) { S().type[i] = T.GRASS; S().deep[i] = 0; } } S().typeVer = (S().typeVer || 0) + 1; W.invalidateLand(); W.touchWalk(); const dryNow = S().type[r4.wi] !== T.RIVER; let bad = 0; until(40, () => { const r = Mi.phase(z4); if (z4.state === 'beber' && r && r.p >= 1 && S().type[r.wi] !== T.RIVER) bad++; return false; });
      if (bad) good = false; said13.push(`c) o deus ergueu a terra sobre a água para onde a zebra ia (${dryNow ? 'a água virou terra' : 'a água ficou'}): ${bad ? bad + ' goles em terra seca' : 'nenhum gole em terra seca'} (agora ${z4.state}, sede ${z4.meio.th})`); }
    else said13.push('c) (a terceira zebra não saiu para beber)');
    // d) the save in the middle of a wallow: the mud on the coat goes in the save
    clearAround(x, y, 14); const b = spawn('buffalo', x, y, { meio: { hot: 0.9 } }); S().time = 0.36; const tw = until(60, () => b.state === 'lama' && (Mi.phase(b) || {}).p === 1 && b.meio.mud > 0.3);
    if (tw >= 0) { const mud0 = b.meio.mud; M.salvarCarregar(); const b2 = A.find(b.id); const kept = Math.abs(b2.meio.mud - mud0) < 0.02; M.viver(1); const stale = b2.gest === 'wallow' && b2.state !== 'lama'; if (!kept || stale) good = false; said13.push(`d) save no meio da lama: a lama no pelo ${kept ? 'ficou' : 'SUMIU'} (${b2.meio.mud}), ${stale ? 'o gesto FICOU' : 'o gesto foi com o estado'}`); }
    else said13.push('d) (o búfalo não chegou à lama)');
  }
  // e) a damaged a.meio in a save: refused clean, a fresh one for that beast
  const o = JSON.parse(G.Save.serialize()); const an = o.animals.find(a => a.meio); if (an) { an.meio = { th: 'x', wet: 7, mud: null, bx: 9999, by: 3, al: -5 }; }
  M.abrir(o); M.viver(1); const fixed = an ? A.find(an.id) : null; const fm = fixed && fixed.meio; const tidy = !fm || (fm.th >= 0 && fm.th <= 1 && fm.wet <= 1 && fm.bx === -1 && fm.al >= 0);
  if (!tidy) good = false; said13.push(`e) um a.meio estragado no save: ${tidy ? 'arrumado na carga' : 'FICOU estragado: ' + JSON.stringify(fm)}`);
  const c = clean(); const e = M.erros();
  ok('m13 os casos ruins', good && !c.n && M.limpo() && !gestErr(), `${said13.join('; ')}; verificador ${c.n}${c.n ? ': ' + c.msg : ''}; erros de módulo ${JSON.stringify(e.mod)}${e.console.length ? '; console: ' + e.console.slice(0, 3).join(' | ') : ''}`); }

// ---------------------------------------------------------------- m14 the long life
if (on('m14')) { const ANOS = +(process.env.ANOS || 12); const lines = []; const tot = {}; let bad = []; const RX = /travessia|seca|plantaç|abutres|elefante encostou|rondam|sede/;
  for (const [seed, type, size] of [[103, 'continente', 128], [7, 'continente', 128], [11, 'ilha', 96], [41, 'continente', 160]]) {
    M.novo({ seed, type, size, tribes: 4 }); const t0 = process.hrtime.bigint(); M.saltar(ANOS); const ms = Number(process.hrtime.bigint() - t0) / 1e6;
    const n = Mi.counts(); for (const k in n) tot[k] = (tot[k] || 0) + n[k];
    const v = QA.check().filter(q => q.sev <= 2); if (v.length) bad.push(`${type} #${seed}: ${v[0].msg}`);
    const cp = {}; const cnt = A.counts(); const over = []; for (const k of A.ids) { const cap = A.capacity(k); if (cap && (cnt[k] || 0) > cap * 1.25 + 2 && A.DEF[k].cls !== 'air') over.push(`${k} ${cnt[k]}/${cap}`); } void cp; if (over.length) bad.push(`${type} #${seed}: acima do teto ${over.join(', ')}`);
    for (const h of S().history) if (RX.test(h.txt)) lines.push(`[${type} #${seed} ano ${h.d}] ${h.txt}`);
    said.push(`${type} ${size} #${seed}: ${ANOS} anos em ${(ms / 1000).toFixed(0)} s, ${S().animals.size} bichos, goles ${n.drink || 0}, travessias ${n.cross || 0} (grandes ${n.crossBig || 0}), lama ${n.wallow || 0}, sombra ${n.shade || 0}, abrigo ${(n.shelter || 0) + (n.huddle || 0)}, lavoura ${n.raid || 0}, restos ${n.scav || 0}, abutres ${n.vult || 0}, alarmes ${n.alarm || 0}/${n.alarmX || 0}, curiosos ${n.curious || 0}, sede mortal ${n.thirstDead || 0}`);
  }
  console.log(said.join('\n')); console.log('— as contas juntas: ' + JSON.stringify(tot)); console.log('— a crônica do meio (' + lines.length + ' linhas):\n' + lines.slice(0, 40).join('\n'));
  const e = M.erros();
  ok('m14 a vida longa', !bad.length && M.limpo() && !gestErr() && (tot.drink || 0) > 100 && (tot.cross || 0) > 0, `${said.length} mundos; ${bad.length ? 'PROBLEMAS: ' + bad.join('; ') : 'verificador limpo e os tetos da fauna respeitados'}; erros de módulo ${JSON.stringify(e.mod)}; gestos recusados ${gestErr()}`); }

// ---------------------------------------------------------------- m15 the same seed
if (on('m15')) { const run = () => { M.novo({ seed: 5, type: 'arquipelago', size: 128, tribes: 3 }); M.saltar(2); M.viver(30); let h = 0; for (const a of S().animals.values()) h = (h * 31 + Math.round(a.x * 10) + Math.round(a.y * 10) * 7 + (a.meio ? Math.round(a.meio.th * 1000) : 0)) % 1e9; return JSON.stringify(Mi.counts()) + ' ' + h + ' ' + S().animals.size; };
  const a = run(), b = run(); ok('m15 a mesma semente, o mesmo meio', a === b, a === b ? `iguais: ${a.slice(0, 160)}` : `DIFERENTES:\n${a}\n${b}`); }

console.log(fails.length ? `FALHOU: ${fails.length} (${fails.join(', ')})` : 'TUDO PASSOU'); process.exit(fails.length ? 1 : 0);
