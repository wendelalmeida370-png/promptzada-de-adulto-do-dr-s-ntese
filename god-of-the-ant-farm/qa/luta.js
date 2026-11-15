// luta: a caça e a luta dos bichos provocadas de propósito (D-297 a D-299).   [ONLY=l1,b1] node qa/luta.js [semente]
// Num mundo novo, longe das cidades, a mão da prova limpa um terreiro de bichos (pela porta G.Animals.remove), põe ali os
// caçadores e as presas de cada caso (pela porta G.Animals.spawn) e deixa o mundo viver pelo passo do jogo; olha de segundo em
// segundo o verificador (os sistemas «luta» e «mente», S0–S2) e conta o que aconteceu (G.Luta.tally, G.Mente.tally):
//   l1 um bando de leões contra uma manada de zebras: a caça começa, uma leoa agarra (o lombo, depois a garganta), e a zebra
//      morre sufocada — ou escapa —; quem matou come e chama o bando;
//   l2 uma alcateia contra um alce: as mordidas nas ancas e nos flancos, o sangue, a derrubada a vários (ou o alce os expulsa);
//   l3 um crocodilo na beira do rio e gnus bebendo: o bote, a pegada, o arrasto, o giro da morte;
//   l4 uma sucuri e uma capivara: o abraço que aperta, a presa engolida inteira (o corpo sai do mundo), a digestão;
//   l5 uma víbora e um coelho: a picada, o coelho que foge e cai, a víbora que o segue e o engole;
//   l6 búfalos defendendo um bezerro de leões: a manada que encara, a investida, a leoa que larga e foge;
//   l7 a zebra que dá coice no leão que a segura pelo lombo;
//   l8 as hienas tomam a presa de uma leoa sozinha;
//   l9 o leopardo leva a presa para a árvore;
//   b1 save e load no meio de uma pegada (a garganta, o abraço, o giro): a pegada volta com o mesmo caçador e a mesma presa, e acaba;
//   b2 o caçador morto no meio da pegada: a presa solta, ninguém preso a um morto;
//   b3 a manada inteira morta no meio da caçada: o caçador não fica preso a nada;
//   b4 o deus ergue o caçador (a mão) no meio da pegada: a presa solta; o deus ergue a presa: a pegada acaba;
//   b5 o chão muda debaixo de uma pegada (a mão alaga o chão): nada fica inválido;
// e em todos o verificador calado nos sistemas da luta e da mente, nenhum gesto recusado pela porta, nenhum erro de módulo.
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['qa/mente-inv.js'] });
const SEED = +(process.argv[2] || 103);
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const on = k => !ONLY || ONLY.includes(k);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | luta ${name} | ${info}`); if (!c) fails.push(name); };
const A = G.Animals, W = G.W, T = G.T, L = G.Luta, Me = G.Mente;
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
// (the sky held clear by the proof's hand: a storm sends the beasts into the caves, and the case is the fight, not the weather)
const step0 = G.debug.step; G.debug.step = dt => { const w = G.S && G.S.weather; if (w) { w.storm = 0; w.rain = 0; } return step0(dt); };
M.novo({ seed: SEED, type: 'continente', size: 128, tribes: 2 });
M.viver(2);
let S = G.S;
const bad = () => QA.check().filter(q => q.sev <= 2 && (q.sys === 'luta' || q.sys === 'mente' || q.sys === 'fauna'));
const T0 = () => JSON.parse(JSON.stringify(L.tally));
const diff = (t0, k) => (L.tally[k] || 0) - (t0[k] || 0);
// an open ground far from the towns: land a beast of `kind` walks on, the nine tiles round it too; `water`: within two of the river
function arena(kind, water, avoid) {
  const sp = A.DEF[kind]; const P = { kind };
  for (let k = 0; k < 20000; k++) {
    const px = 6 + ((k * 7919) % (G.N - 12)) + 0.5, py = 6 + (((k * 104729) >> 3) % (G.N - 12)) + 0.5;
    if (avoid && k < 12000 && avoid.slice(-3).some(p => G.dist(p[0], p[1], px, py) < 20)) continue; // (not the last few places used, while there are others)
    let far = true; for (const s of S.settlements.values()) if (G.dist(px, py, s.cx, s.cy) < 22) { far = false; break; } if (!far) continue;
    const R = water ? 1 : 2; let good = true; for (let dy = -R; dy <= R && good; dy++) for (let dx = -R; dx <= R; dx++) if (!A.walkOK(P, px + dx, py + dy) || S.type[W.idx(px + dx, py + dy)] <= T.RIVER) { good = false; break; }
    if (!good) continue;
    const wd = A.waterD(W.idx(px, py)); if (water ? wd !== 2 : wd < 4) continue;
    if (sp.cls === 'land' && S.treeAt[W.idx(px, py)]) continue;
    return [px, py];
  }
  return null;
}
// the proof's hand clears the ground of other beasts (the one door out of the world)
function clear(x, y, r) { god(() => { for (const a of [...S.animals.values()]) if (G.dist(a.x, a.y, x, y) < r && !A.DEF[a.kind].dom && !A.DEF[a.kind].town) A.remove(a); }); }
function put(kind, x, y, o) { return god(() => { const a = A.spawn(kind, x, y, Object.assign({ grown: 1, morph: null }, o || {})); Me.m(a); a.hx = x; a.hy = y; return a; }); }
// lives `sec` seconds of the world's step, looking at the checker each second; stops early when `done()`; gives the violations
function live(sec, done) {
  const seen = []; for (let t = 0; t < sec; t++) { M.viver(1); if (t % 2 === 1) for (const q of bad()) if (seen.length < 6 && !seen.some(s => s.msg === q.msg)) seen.push(q); if (done && done()) break; }
  return seen;
}
const vsay = v => (v.length ? v.slice(0, 3).map(q => `[S${q.sev}] ${q.sys}: ${q.msg}`).join(' · ') : 'verificador limpo');
const used = [];

// ---------------- l1 a pride and a zebra herd ----------------
if (on('l1')) {
  let kills = 0, holds = 0, info = [], viol = [];
  for (let tries = 0; tries < 3 && !kills; tries++) {
    const p = arena('zebra', false, used); if (!p) break; used.push(p); clear(p[0], p[1], 26); const t0 = T0();
    const zs = []; for (let i = 0; i < 6; i++) zs.push(put('zebra', p[0] + (i % 3) * 0.9, p[1] + ((i / 3) | 0) * 0.9, { leader: 0 }));
    for (const z of zs.slice(1)) z.leader = zs[0].id;
    const ls = []; for (let i = 0; i < 3; i++) ls.push(put('lion', p[0] - 7 - i * 0.8, p[1] + 1.5 * i, { hunger: 0.75 }));
    for (const l of ls.slice(1)) l.leader = ls[0].id; for (const l of ls) Me.m(l).sx = 0;
    viol = viol.concat(live(160, () => diff(t0, 'abate:lion') > 0 && zs.some(z => z.dead) && ls.every(l => l.state !== 'hold')));
    kills += diff(t0, 'abate:lion'); holds += diff(t0, 'agarra:lion:lombo') + diff(t0, 'agarra:lion:garganta');
    info.push(`#${tries + 1}: caças ${diff(t0, 'caca:lion')}, agarra ${diff(t0, 'agarra')}, derruba ${diff(t0, 'derruba:lion')}, abate ${diff(t0, 'abate:lion')}, escapa ${diff(t0, 'escapa:zebra')}, coice ${diff(t0, 'coice:zebra')}, falha ${diff(t0, 'falha:lion')}`);
  }
  ok('l1 um bando de leões e uma manada de zebras: a pegada e o abate', kills > 0 && holds > 0 && !viol.length, `${info.join('; ')} — ${vsay(viol)}`);
}
// ---------------- l2 a wolf pack and a moose ----------------
if (on('l2')) {
  let info = [], viol = [], bites = 0, end = 0;
  for (let tries = 0; tries < 3 && !end; tries++) {
    const p = arena('moose', false, used); if (!p) break; used.push(p); clear(p[0], p[1], 26); const t0 = T0();
    const mo = put('moose', p[0], p[1]); mo.hp = mo.maxHp * 0.8;
    const ws = []; for (let i = 0; i < 4; i++) ws.push(put('wolf', p[0] - 6 - (i % 2), p[1] - 1.5 + i, { hunger: 0.8 })); for (const w of ws.slice(1)) w.leader = ws[0].id;
    let bled = 0;
    viol = viol.concat(live(150, () => { if (mo.wnd && mo.wnd.b > 0) bled = Math.max(bled, mo.wnd.b); return mo.dead || ws.every(w => w.dead || w.state === 'flee' || w.rest > 0); }));
    bites += diff(t0, 'golpe:moose:gore') + diff(t0, 'ferida'); end = mo.dead ? 1 : ws.some(w => w.dead || w.wnd) ? 2 : 0;
    info.push(`#${tries + 1}: ${mo.dead ? 'o alce caiu (' + diff(t0, 'abate:wolf:derrubada') + ' derrubadas)' : 'o alce de pé'}, feridas ${diff(t0, 'ferida')}, o maior sangue do alce ${bled.toFixed(2)}/s, investidas do alce ${diff(t0, 'investida:moose')}, lobos mortos ${ws.filter(w => w.dead).length}, afugentados ${diff(t0, 'afugenta:moose>wolf')}`);
  }
  ok('l2 a alcateia e o alce: as mordidas, o sangue e o fim (o alce cai, ou fere e expulsa os lobos)', bites > 0 && end > 0 && !viol.length, `${info.join('; ')} — ${vsay(viol)}`);
}
// ---------------- l3 a crocodile at the river and gnus drinking ----------------
if (on('l3')) {
  let info = [], viol = [], rolled = 0, grip = 0;
  for (let tries = 0; tries < 4 && !grip; tries++) {
    const p = arena('gnu', true, used); if (!p) break; used.push(p); clear(p[0], p[1], 20); const t0 = T0();
    // the water: the nearest river tile to the bank
    let wx = null; for (let r = 1; r <= 3 && !wx; r++) for (let k = 0; k < 16; k++) { const x = p[0] + Math.cos(k / 16 * 6.28) * r, y = p[1] + Math.sin(k / 16 * 6.28) * r; if (W.inb(x, y) && S.type[W.idx(x, y)] <= T.RIVER) { wx = [x, y]; break; } }
    if (!wx) continue;
    const c = put('croc', wx[0], wx[1], { hunger: 0.8 });
    const gs = []; for (let i = 0; i < 4; i++) { const q = W.nearestLand(wx[0] + (i - 1.5) * 0.6, wx[1], 3, (x, y) => A.walkOK({ kind: 'gnu' }, x, y)); if (q) gs.push(put('gnu', q[0], q[1], { hunger: 0.1 })); }
    for (const g of gs.slice(1)) g.leader = gs[0].id;
    let seenRoll = false;
    viol = viol.concat(live(140, () => { if (c.gest === 'deathroll') seenRoll = true; return gs.some(g => g.dead) && c.state !== 'hold'; }));
    grip += diff(t0, 'agarra:croc:crocodilo'); rolled += seenRoll ? 1 : 0;
    info.push(`#${tries + 1}: botes ${diff(t0, 'caca:croc')}, pegadas ${diff(t0, 'agarra:croc:crocodilo')}, o giro ${seenRoll ? 'visto' : 'não'}, abate ${diff(t0, 'abate:croc')}, escapa ${diff(t0, 'escapa-croc')}`);
  }
  ok('l3 o crocodilo na beira do rio: o bote, a pegada, o arrasto e o giro', grip > 0 && !viol.length, `${info.join('; ')} — ${vsay(viol)}`);
}
// ---------------- l4 an anaconda and a capybara ----------------
if (on('l4')) {
  let info = [], viol = [], swallowed = 0, coiled = 0;
  for (let tries = 0; tries < 3 && !swallowed; tries++) {
    const p = arena('capybara', true, used); if (!p) break; used.push(p); clear(p[0], p[1], 20); const t0 = T0();
    const sn = put('anaconda', p[0], p[1], { hunger: 0.85 }); const cp = put('capybara', p[0] + 1.6, p[1] + 0.4, { hunger: 0.1 });
    let sawCoil = false;
    viol = viol.concat(live(180, () => { if (sn.gest === 'coil') sawCoil = true; return !S.animals.has(cp.id) && sn.state !== 'hold'; }));
    coiled += sawCoil ? 1 : 0; swallowed += !S.animals.has(cp.id) && diff(t0, 'engole:anaconda') > 0 ? 1 : 0;
    info.push(`#${tries + 1}: o abraço ${sawCoil ? 'visto' : 'não'}, abate ${diff(t0, 'abate:anaconda')}, engolida ${diff(t0, 'engole:anaconda')}, a sucuri depois em «${sn.state}», fome ${sn.hunger.toFixed(2)}`);
  }
  ok('l4 a sucuri e a capivara: o abraço, a presa engolida inteira e a digestão', coiled > 0 && swallowed > 0 && !viol.length, `${info.join('; ')} — ${vsay(viol)}`);
}
// ---------------- l5 a viper and a rabbit ----------------
if (on('l5')) {
  let info = [], viol = [], done = 0;
  for (let tries = 0; tries < 4 && !done; tries++) {
    const p = arena('rabbit', false, used); if (!p) break; used.push(p); clear(p[0], p[1], 20); const t0 = T0();
    const vp = put('viper', p[0], p[1], { hunger: 0.85 }); const rb = put('rabbit', p[0] + 1.2, p[1], { hunger: 0.1 });
    let venom = 0, trail = false;
    viol = viol.concat(live(120, () => { if (rb.wnd && rb.wnd.v > 0) venom = 1; if (vp.state === 'trail') trail = true; return !S.animals.has(rb.id) || (rb.dead && vp.state !== 'trail' && vp.state !== 'eat'); }));
    done = venom && (rb.dead || !S.animals.has(rb.id)) ? 1 : 0;
    info.push(`#${tries + 1}: picada ${diff(t0, 'picada')}, veneno ${venom ? 'sim' : 'não'}, a víbora no rastro ${trail ? 'sim' : 'não'}, o coelho ${!S.animals.has(rb.id) ? 'engolido' : rb.dead ? 'morto' : 'vivo'}`);
  }
  ok('l5 a víbora e o coelho: a picada, a fuga que enfraquece, o rastro e a presa engolida', done > 0 && !viol.length, `${info.join('; ')} — ${vsay(viol)}`);
}
// ---------------- l6 buffalo defend a calf from lions ----------------
if (on('l6')) {
  let info = [], viol = [], defended = 0;
  for (let tries = 0; tries < 3 && !defended; tries++) {
    const p = arena('buffalo', false, used); if (!p) break; used.push(p); clear(p[0], p[1], 26); const t0 = T0();
    const bs = []; for (let i = 0; i < 4; i++) bs.push(put('buffalo', p[0] + (i % 2) * 1.2, p[1] + ((i / 2) | 0) * 1.2));
    for (const b of bs.slice(1)) b.leader = bs[0].id;
    const calf = put('buffalo', p[0] + 0.6, p[1] + 0.6, { grown: 0.4, leader: bs[0].id }); Me.m(calf).mom = bs[1].id; Me.m(bs[1]).sx = 0;
    const ls = []; for (let i = 0; i < 2; i++) ls.push(put('lion', p[0] - 7, p[1] + i * 1.2, { hunger: 0.8 })); ls[1].leader = ls[0].id;
    viol = viol.concat(live(120, () => diff(t0, 'investida:buffalo') > 0 && (diff(t0, 'afugenta:buffalo>lion') > 0 || calf.dead)));
    defended = diff(t0, 'investida:buffalo') + diff(t0, 'enfrenta:buffalo');
    info.push(`#${tries + 1}: encaram ${diff(t0, 'enfrenta:buffalo')}, investidas ${diff(t0, 'investida:buffalo')}, golpes ${diff(t0, 'golpe:buffalo:gore') + diff(t0, 'golpe:buffalo:toss')}, leões afugentados ${diff(t0, 'afugenta:buffalo>lion')}, resgates ${diff(t0, 'resgate:buffalo')}, a cria ${calf.dead ? 'morta' : 'viva'}`);
  }
  ok('l6 os búfalos defendem a cria dos leões: encaram, investem, os leões fogem', defended > 0 && !viol.length, `${info.join('; ')} — ${vsay(viol)}`);
}
// ---------------- l7 a zebra kicks the lion on its back ----------------
if (on('l7')) {
  let info = [], viol = [], kicks = 0;
  for (let tries = 0; tries < 6 && !kicks; tries++) {
    const p = arena('zebra', false, used); if (!p) break; used.push(p); clear(p[0], p[1], 20); const t0 = T0();
    const z = put('zebra', p[0], p[1]); const l = put('lion', p[0] - 1, p[1], { hunger: 0.8 }); Me.m(l).sx = 0;
    god(() => { G.faceTo(z, 1, 0); z.tx = z.x + 4; z.ty = z.y; z.state = 'flee'; L.hold(l, z, L.K.RUMP); });
    viol = viol.concat(live(40, () => l.state !== 'hold'));
    kicks += diff(t0, 'coice:zebra'); info.push(`#${tries + 1}: coices ${diff(t0, 'coice:zebra')}, derrubada ${diff(t0, 'derruba:lion')}, escapa ${diff(t0, 'escapa:zebra')}, a zebra ${z.dead ? 'morta' : 'viva'}, o leão ${l.dead ? 'morto' : l.wnd ? 'ferido' : 'inteiro'}${l.wnd && l.wnd.j ? ', a mandíbula ' + l.wnd.j.toFixed(2) : ''}`);
  }
  ok('l7 a zebra dá coice no leão que a segura pelo lombo', kicks > 0 && !viol.length, `${info.join('; ')} — ${vsay(viol)}`);
}
// ---------------- l8 hyenas take a lioness's kill ----------------
if (on('l8')) {
  let info = [], viol = [], stolen = 0;
  for (let tries = 0; tries < 3 && !stolen; tries++) {
    const p = arena('zebra', false, used); if (!p) break; used.push(p); clear(p[0], p[1], 24); const t0 = T0();
    const c = put('zebra', p[0], p[1]); god(() => A.kill(c, null, 'old'));
    const l = put('lion', p[0] - 0.5, p[1], { hunger: 1 }); Me.m(l).sx = 0; l.state = 'eat'; l.target = c.id; l.t = 40; l.carc = true;
    const hs = []; for (let i = 0; i < 4; i++) hs.push(put('hyena', p[0] + 3, p[1] - 1.5 + i, { hunger: 0.8 })); for (const h of hs.slice(1)) h.leader = hs[0].id;
    viol = viol.concat(live(60, () => diff(t0, 'roubo:hyena>lion') > 0));
    stolen = diff(t0, 'roubo:hyena>lion'); info.push(`#${tries + 1}: roubos ${stolen}, brigas ${diff(t0, 'briga-carcaca')}, a leoa em «${l.state}», hienas comendo ${hs.filter(h => h.state === 'eat' && h.target === c.id).length}`);
  }
  ok('l8 as hienas tomam a presa de uma leoa sozinha', stolen > 0 && !viol.length, `${info.join('; ')} — ${vsay(viol)}`);
}
// ---------------- l9 the leopard caches its kill ----------------
if (on('l9')) {
  let info = [], viol = [], up = 0;
  for (let tries = 0; tries < 4 && !up; tries++) {
    // a tree near open ground
    let p = null; for (const t of S.trees.values()) { if (t.stage !== 'grow' || t.size < 0.7 || t.kind === 'cactus') continue; if (used.some(q => G.dist(q[0], q[1], t.x, t.y) < 30)) continue; let far = true; for (const s of S.settlements.values()) if (G.dist(t.x, t.y, s.cx, s.cy) < 22) { far = false; break; } if (!far) continue; const q = W.nearestLand(t.x + 2, t.y, 2, (x, y) => A.walkOK({ kind: 'leopard' }, x, y)); if (q) { p = q; break; } }
    if (!p) break; used.push(p); clear(p[0], p[1], 20); const t0 = T0();
    const c = put('gazelle', p[0], p[1]); god(() => A.kill(c, null, 'old'));
    const lp = put('leopard', p[0] - 0.5, p[1], { hunger: 0.7 }); lp.state = 'eat'; lp.target = c.id; lp.t = 30; lp.carc = true;
    viol = viol.concat(live(40, () => (c.z || 0) > 3));
    up = (c.z || 0) > 3 ? 1 : 0; info.push(`#${tries + 1}: o leopardo em «${lp.state}», a presa a ${(c.z || 0).toFixed(1)} de altura`);
  }
  ok('l9 o leopardo leva a presa para a árvore', up > 0 && !viol.length, `${info.join('; ')} — ${vsay(viol)}`);
}
// ---------------- the bad cases ----------------
// a hold staged by the proof's hand: a holder and its prey, side by side, the hold of a kind
function staged(hk, pk, k) {
  const p = arena(pk, k === L.K.CROC || k === L.K.COIL, used); if (!p) return null; used.push(p); clear(p[0], p[1], 20);
  const prey = put(pk, p[0] + 0.6, p[1]); const h = put(hk, p[0], p[1], { hunger: 0.8 }); god(() => { G.faceTo(h, 1, 0); L.hold(h, prey, k); });
  return { h, prey, p };
}
if (on('b1')) {
  const out = [], viol = [];
  for (const [hk, pk, k, nm] of [['lion', 'gazelle', L.K.THROAT, 'a garganta'], ['anaconda', 'capybara', L.K.COIL, 'o abraço'], ['croc', 'gnu', L.K.CROC, 'o giro']]) {
    const c = staged(hk, pk, k); if (!c) { out.push(`${nm}: sem lugar`); continue; }
    M.viver(k === L.K.CROC ? 5.5 : 1.5);
    const before = { h: c.h.id, p: c.prey.id, st: c.h.state, caught: c.prey.caught };
    M.salvarCarregar(); S = G.S;
    const h = S.animals.get(before.h), p = S.animals.get(before.p);
    const back = !!h && !!p && h.state === 'hold' && h.target === p.id && p.caught === h.id;
    for (const q of bad()) viol.push(q);
    const v2 = live(60, () => !p || p.dead || h.state !== 'hold'); viol.push(...v2);
    out.push(`${nm}: antes ${before.st}/${before.caught === before.h ? 'segura' : 'solta'}, depois do load ${back ? 'a mesma pegada' : 'PERDIDA'}, e no fim a presa ${!p ? 'engolida' : p.dead ? 'morta' : 'viva e solta'}`);
    if (!back) viol.push({ sev: 2, sys: 'luta', msg: `${nm}: a pegada não voltou do save` });
  }
  ok('b1 save e load no meio de uma pegada: a mesma pegada volta e acaba', !viol.length, `${out.join('; ')} — ${vsay(viol)}`);
}
if (on('b2')) {
  const c = staged('lion', 'zebra', L.K.THROAT); let msg = 'sem lugar', good = false;
  if (c) { M.viver(1); god(() => A.kill(c.h, null, 'old')); const v = live(6); good = !c.prey.caught && !(c.prey.wnd && c.prey.wnd.h) && !v.length; msg = `o leão morto: a zebra ${c.prey.caught ? 'AINDA SEGURA' : 'solta'}, em «${c.prey.state}» — ${vsay(v)}`; }
  ok('b2 o caçador morto no meio da pegada: a presa solta', good, msg);
}
if (on('b3')) {
  const p = arena('gazelle', false, used); let good = false, msg = 'sem lugar';
  if (p) {
    used.push(p); clear(p[0], p[1], 24);
    const gs = []; for (let i = 0; i < 4; i++) gs.push(put('gazelle', p[0] + i, p[1])); for (const g of gs.slice(1)) g.leader = gs[0].id;
    const ls = []; for (let i = 0; i < 2; i++) ls.push(put('lion', p[0] - 6, p[1] + i, { hunger: 0.8 })); ls[1].leader = ls[0].id;
    live(40, () => ls.some(l => l.state === 'chase' || l.state === 'stalk' || l.state === 'hold'));
    god(() => { for (const g of gs) if (!g.dead) { if (g.caught) { /* (the hand takes the prey from the jaws) */ } A.kill(g, null, 'old'); } });
    const v = live(30); const stuck = ls.filter(l => !l.dead && (l.state === 'hold' || l.state === 'stalk' || (l.state === 'chase' && !l.carc)));
    good = !stuck.length && !v.length; msg = `as gazelas mortas pela mão: os leões em ${ls.map(l => '«' + l.state + '»').join(', ')} — ${vsay(v)}`;
  }
  ok('b3 a manada morta no meio da caçada: o caçador não fica preso a nada', good, msg);
}
if (on('b4')) {
  const out = []; let good = true;
  { const c = staged('lion', 'zebra', L.K.THROAT); if (c) { M.viver(1); god(() => { c.h.held = true; }); const v = live(3); const free = !c.prey.caught; good = good && free && !v.length; out.push(`o deus ergue o leão: a zebra ${free ? 'solta' : 'AINDA SEGURA'} — ${vsay(v)}`); god(() => { c.h.held = false; }); } }
  { const c = staged('wolf', 'deer', L.K.PULL); if (c) { M.viver(1); god(() => { c.prey.held = true; }); const v = live(3); const over = c.h.state !== 'hold' && !c.prey.caught; good = good && over && !v.length; out.push(`o deus ergue o cervo: o lobo ${over ? 'larga' : 'AINDA SEGURA'} — ${vsay(v)}`); god(() => { c.prey.held = false; }); } }
  ok('b4 a mão do deus no meio da pegada', good && out.length === 2, out.join('; '));
}
if (on('b5')) {
  const c = staged('lion', 'zebra', L.K.THROAT); let good = false, msg = 'sem lugar';
  if (c) {
    M.viver(1);
    god(() => { const i = W.idx(c.prey.x, c.prey.y); S.type[i] = T.RIVER; S.typeVer = (S.typeVer || 0) + 1; W.invalidateLand && W.invalidateLand(); W.touchWalk && W.touchWalk(); A.invalidate(); });
    const v = live(30, () => c.prey.dead || c.h.state !== 'hold');
    good = !v.length && Number.isFinite(c.prey.x) && Number.isFinite(c.h.x); msg = `o chão da presa virou rio: a pegada ${c.prey.dead ? 'acabou com a presa morta' : c.h.state === 'hold' ? 'continua' : 'acabou'} — ${vsay(v)}`;
  }
  ok('b5 o chão muda debaixo de uma pegada', good, msg);
}
// ---------------- the whole ----------------
{ const e = M.erros(); const ge = A.gestErr.slice(0, 4);
  ok('fim: nenhum gesto recusado pela porta, nenhum erro de módulo', !ge.length && M.limpo(), `gestos recusados ${ge.length ? ge.join('; ') : 'nenhum'}; erros ${JSON.stringify(e.mod)} ${e.console.slice(0, 2).join(' | ')}`);
  console.log('  as contas da luta: ' + Object.entries(L.tally).filter(([k]) => !k.includes(':')).map(([k, v]) => `${k} ${v}`).join(', ')); }
console.log(fails.length ? `FALHOU: ${fails.length} (${fails.join(', ')})` : 'TUDO PASSOU'); process.exit(fails.length ? 1 : 0);
