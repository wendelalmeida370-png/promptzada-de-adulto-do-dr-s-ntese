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
//   l10 a presa que o caçador escolhe (D-299b): o leão e o tigre sozinhos não escolhem o búfalo nem o hipopótamo crescidos e sãos —
//      a cria e (o tigre) o ferido, sim; três leões famintos tomam o búfalo; o lobo sozinho não escolhe o boi-almiscarado, três lobos famintos sim;
//   b1 save e load no meio de uma pegada (a garganta, o abraço, o giro): a pegada volta com o mesmo caçador e a mesma presa, e acaba;
//   b2 o caçador morto no meio da pegada: a presa solta, ninguém preso a um morto;
//   b3 a manada inteira morta no meio da caçada: o caçador não fica preso a nada;
//   b4 o deus ergue o caçador (a mão) no meio da pegada: a presa solta; o deus ergue a presa: a pegada acaba;
//   b5 o chão muda debaixo de uma pegada (a mão alaga o chão): nada fica inválido;
//   o caçador e a pessoa (D-297b) — p1 o tigre com fome e o lenhador sozinho na beira do mato: a espreita, o bote; p2 cinco
//      pessoas juntas: o tigre não ataca, vigia e se afasta; p3 de noite, a tocha afasta o tigre, e sem ela, a caça; p4 o leão
//      velho e manco vira devorador de gente, o leão são com a mesma fome não; p5 o leão saciado não fica deitado ao lado de uma
//      pessoa como se ela não estivesse ali; b6 save e load no meio da espreita de uma pessoa; b7 a mão do deus ergue a pessoa
//      espreitada, e a pessoa que entra em casa: a caça acaba na hora;
//   e os outros bichos diante da pessoa (D-297c) — p0 todo bicho selvagem do chão tem o seu jeito; p6 os cervos vigiam e fogem na distância deles, a lebre se esconde e dispara;
//      p7 a víbora pica o pé que chega nela, a píton vai embora; p8 o hipopótamo junto da água e a elefanta com o filhote avisam e
//      investem; p9 o urso blefa, a ursa com o filhote investe de verdade; p10 os lobos de dia ficam longe da pessoa sozinha;
// e em todos o verificador calado nos sistemas da luta e da mente, nenhum gesto recusado pela porta, nenhum erro de módulo.
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['qa/mente-inv.js'] });
const SEED = +(process.argv[2] || 103);
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
// (each case in a world of its own, the same seed lived the same two seconds: a case lived after the others found the hour, the
// sleep of the beasts and the people about as the cases before left them, and failed in the whole round while it passed alone —
// the tiger's torch, the old lion, the she-bear, T-1319b. ONE_WORLD=1: all of them in one world, as before)
let first = true;
const on = k => { if (ONLY && !ONLY.includes(k)) return false; if (!first && !process.env.ONE_WORLD) world(); first = false; return true; };
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | luta ${name} | ${info}`); if (!c) fails.push(name); };
const A = G.Animals, W = G.W, T = G.T, L = G.Luta, Me = G.Mente;
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
// (the sky held clear by the proof's hand: a storm sends the beasts into the caves, and the case is the fight, not the weather)
const step0 = G.debug.step; G.debug.step = dt => { const w = G.S && G.S.weather; if (w) { w.storm = 0; w.rain = 0; } return step0(dt); };
let S = null;
function world() { M.novo({ seed: SEED, type: 'continente', size: 128, tribes: 2 }); M.viver(2); S = G.S; }
world();
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
// ---------------- l10 the prey a hunter chooses (D-299b) ----------------
// (a grown, sound defender bigger than the hunter is no prey for one alone: a lone lion by a grown buffalo and a hippo, nothing
// else in reach, chooses neither, nor does a lone tiger; the buffalo's calf the lion does, the buffalo hurt the tiger does (the lone
// lion is too small for it even so); three lions starving take the grown one; a lone wolf and a musk ox the same. Asked of the
// hunters' own look, A.findPrey, the beasts awake where the proof puts them)
// (the choice of a case is among the case's beasts: a town's herd by the arena — a cow within the look — is out of it for the
// look, held for that instant by the proof's hand and given back as it was; in the world of the three pillars the arena of the
// buffalo fell by a town's cows, and the lion's choice of a cow said nothing of the buffalo, T-1334)
const caseOnly = (f, spot) => { const off = []; for (const b of S.animals.values()) if (!spot.has(b) && !b.held && A.DEF[b.kind] && A.DEF[b.kind].dom) { off.push(b); b.held = true; } try { return f(); } finally { for (const b of off) b.held = false; } };
if (on('l10')) {
  let msg = 'sem lugar', good = false;
  const p = arena('buffalo', true, used);
  if (p) {
    used.push(p); clear(p[0], p[1], 26); S.time = 0.35;
    const lion = put('lion', p[0] - 4, p[1], { hunger: 0.6 }); const bu = put('buffalo', p[0], p[1]); const hp = put('hippo', p[0], p[1] + 2.5);
    // (the look asked at a reach the senses of the moment cannot cut short: the case is the choice, not the eyes)
    // (each look after a moment of life — the hunters resting through it, not off after the calf —, everyone put back where they
    // stood, calm and idle: in that moment the buffalo may have turned on the lion, and a lion hurt by a prey lets that one be)
    const spot = new Map(); const pin = (...bs) => { for (const b of bs) spot.set(b, [b.x, b.y]); }; pin(lion, bu, hp);
    const look = (a, r) => { god(() => { for (const b of spot.keys()) b.rest = 5; }); M.viver(0.3); god(() => { for (const [b, c] of spot) if (S.animals.has(b.id) && !b.dead) { b.x = c[0]; b.y = c[1]; b.state = 'idle'; b.t = 5; b.target = 0; b.angry = 0; b.noPrey = null; } }); const q = caseOnly(() => A.findPrey(a, r || 16), spot); return q ? q.kind + (q.grown < 0.8 ? '(cria)' : q.hp < q.maxHp * 0.6 ? '(ferido)' : '') : 'nada'; };
    const r1 = look(lion);
    const calf = put('buffalo', p[0] + 0.8, p[1] - 0.6, { grown: 0.45 }); pin(calf); const r2 = look(lion); god(() => A.remove(calf)); spot.delete(calf);
    const tg = put('tiger', p[0] - 4, p[1] + 3, { hunger: 0.6 }); pin(tg); const r1t = look(tg);
    god(() => { bu.hp = bu.maxHp * 0.45; }); const r3 = look(tg); god(() => { bu.hp = bu.maxHp; A.remove(tg); }); spot.delete(tg);
    const two = [put('lion', p[0] - 4.5, p[1] + 1, { hunger: 0.85 }), put('lion', p[0] - 4.5, p[1] - 1, { hunger: 0.85 })]; pin(...two); god(() => { lion.hunger = 0.85; for (const o of two) o.leader = lion.id; lion.leader = 0; });
    const r4 = look(lion); god(() => { for (const o of two) A.remove(o); lion.hunger = 0.6; });
    // (the lone wolf and the musk ox; and the wolves, three and starving)
    const q = arena('muskox', false, used); let r5 = '—', r6 = '—';
    if (q) {
      used.push(q); clear(q[0], q[1], 26);
      const mo = put('muskox', q[0], q[1]); const wf = put('wolf', q[0] - 4, q[1], { hunger: 0.6 });
      const sp2 = new Map(); for (const b of [mo, wf]) sp2.set(b, [b.x, b.y]);
      const lk = (a) => { god(() => { for (const b of sp2.keys()) b.rest = 5; }); M.viver(0.3); god(() => { for (const [b, c] of sp2) if (S.animals.has(b.id) && !b.dead) { b.x = c[0]; b.y = c[1]; b.state = 'idle'; b.t = 5; b.target = 0; b.angry = 0; b.noPrey = null; } }); const x = caseOnly(() => A.findPrey(a, 16), sp2); return x ? x.kind : 'nada'; };
      r5 = lk(wf);
      const pk = [put('wolf', q[0] - 4.5, q[1] + 1, { hunger: 0.85 }), put('wolf', q[0] - 4.5, q[1] - 1, { hunger: 0.85 })]; for (const b of pk) sp2.set(b, [b.x, b.y]); god(() => { wf.hunger = 0.85; for (const o of pk) o.leader = wf.id; wf.leader = 0; });
      r6 = lk(wf);
    }
    good = r1 === 'nada' && r1t === 'nada' && r2 === 'buffalo(cria)' && r3 === 'buffalo(ferido)' && r4 === 'buffalo' && r5 === 'nada' && r6 === 'muskox';
    msg = `o leão sozinho, o búfalo e o hipopótamo crescidos e sãos: ${r1}; o tigre sozinho: ${r1t}; o leão com a cria do búfalo: ${r2}; o tigre e o búfalo ferido: ${r3}; três leões famintos: ${r4}; o lobo sozinho e o boi-almiscarado: ${r5}; três lobos famintos: ${r6}`;
  }
  ok('l10 o defensor crescido e são, maior que o caçador, não é presa de um só', good, msg);
}
// ---------------- p: the wild hunter and the person (D-297b) ----------------
// (people of the world taken out to the wild by the proof's hand: grown, free, not the god's body; each case its own)
const takenP = new Set();
// (the ones not yet taken first; a small world runs out of them by the last cases, and then a case takes one again)
function people(n, need) {
  const out = []; const all = [...S.villagers.values()].sort((p, q) => p.id - q.id);
  const fit = v => !v.dead && !v.captive && !v.jail && !v.aboard && !v.held && v.age >= 18 && v.age <= 50 && v.hp >= 80 && !L.armed(v) && !(S.avatar && S.avatar === v.id) && (!need || need(v));
  for (const again of [false, true]) for (const v of all) {
    if (out.length >= n) break;
    if (out.includes(v) || !fit(v) || (!again && takenP.has(v.id))) continue;
    takenP.add(v.id); out.push(v);
  }
  return out;
}
function place(v, x, y) { god(() => { G.Vg.endTask(v); if (v.ug && G.Caves) G.Caves.exitNow(v); v.sleeping = false; v.inside = 0; v.x = x; v.y = y; v.path = null; v.hunger = Math.min(v.hunger, 20); v.energy = Math.max(v.energy, 80); v.carry = null; }); }
// (a tree to cut at the edge of a wood: the woodcutter at work, standing at it)
function chop(v) { const tr = A.treeNear(v.x, v.y, 4); if (tr) god(() => { tr.claim = v.id; G.Vg.setTask(v, { type: 'chop', id: tr.id, pri: 1 }); }); return !!tr; }
// (a wood's edge far from the towns, where a tiger walks: a tree within four steps of an open spot)
function edge(kind) {
  for (let k = 0; k < 20000; k++) {
    const p = arena(kind, false, used); if (!p) return null; used.push(p);
    if (A.treeNear(p[0], p[1], 4)) return p;
  }
  return null;
}
// what the hunter did to the person over the case: the hunt seen (stalk, pounce, chase on them), the hurt, the reactions
function watchMan(hs, vs) {
  const ids = new Set(vs.map(v => v.id)); const hp0 = new Map(vs.map(v => [v.id, v.hp]));
  const o = { hs, hunt: 0, stalk: 0, pounce: 0, eye: 0, shy: 0, warn: 0, fled: 0, states: new Set() };
  o.tick = () => { for (const h of hs) { if (h.dead) continue; o.states.add(h.state); const on = ids.has(h.target);
    if (on && h.onPerson && (h.state === 'stalk' || h.state === 'pounce' || h.state === 'chase')) { o.hunt++; if (h.state === 'stalk') o.stalk++; if (h.state === 'pounce') o.pounce++; }
    if (h.state === 'eye') o.eye++; if (h.state === 'shy' || h.state === 'flee') o.shy++; if (h.angry > 0 && on) o.warn++; }
    for (const v of vs) if (v.task && v.task.type === 'flee') o.fled++; };
  o.hurt = () => vs.filter(v => !S.villagers.has(v.id) || v.dead || v.hp < hp0.get(v.id) - 1).length;
  return o;
}
// (the person kept at their place by the proof's hand while they do not run — at their work, awake in the night; a woodcutter
// back at the tree)
const keepAt = (v, c, work) => god(() => { if (!S.villagers.has(v.id) || v.dead || (v.task && (v.task.type === 'flee' || v.task.type === 'fight'))) return; if (G.isNight()) { v.sleeping = false; v.energy = Math.max(v.energy, 90); }
  if (G.dist(v.x, v.y, c[0], c[1]) > (work ? 1.6 : 0.6)) { G.Vg.endTask(v); v.inside = 0; v.x = c[0]; v.y = c[1]; v.path = null; if (work) chop(v); } });
// (and every second the ground round the hunters cleared of other beasts by the proof's hand: the case is the person, not the
// deer that wanders in — in the whole run the tiger of the p3 went after a gazelle and never looked at the torch)
const clearBut = hs => god(() => { for (const a of [...S.animals.values()]) { if (hs.includes(a) || A.DEF[a.kind].dom || A.DEF[a.kind].town) continue; if (hs.some(h => G.dist(a.x, a.y, h.x, h.y) < 24)) A.remove(a); } });
const liveMan = (sec, w, each, done) => { const seen = []; for (let t = 0; t < sec * 4; t++) { if (t % 4 === 0 && w.hs) clearBut(w.hs); M.viver(0.25); w.tick(); if (each) each(t); if (t % 8 === 7) for (const q of bad()) if (seen.length < 6 && !seen.some(s => s.msg === q.msg)) seen.push(q); if (done && done()) break; } return seen; };
const tsay = w => `estados ${[...w.states].join('/')}`;
// (a beast of ordinary boldness or more: the character is the id's, and a timid tiger rightly lets a person be — the case is the
// hunt: the proof's hand sends back the timid ones, by the door, until one comes that is not)
const putBold = (kind, x, y, o, minB) => { for (let k = 0; k < 30; k++) { const a = put(kind, x, y, o); if (Me.trait(a, 'b') >= (minB || 0.45) || k === 29) return a; god(() => A.remove(a)); } };
// (the proof's hand keeps these awake: one asleep notices late, rightly — and the case is the beast awake that sees them come)
// (and the sleep's gesture ended by the door with it, and the beast rested: left sleepy, the brain laid it down again between two
// looks of the proof, and it noticed the person with the senses of one asleep — the deer of the p6 ran at two steps)
const awake = hs => god(() => { for (const h of hs) if (!h.dead) { if (h.state === 'sleep' || h.state === 'rest' || h.state === 'watch') { h.state = 'idle'; h.t = 0; A.gestEnd(h); } Me.m(h).en = Math.max(Me.m(h).en, 0.95); } });
// p0 every wild kind of the ground has its temper toward people (the sloth only, slow in its tree, does not run from anybody)
if (on('p0')) {
  const miss = A.ids.filter(k => { const d = A.DEF[k]; return (d.cls === 'land' || d.cls === 'amph') && !d.dom && !d.town && !L.TEMPER[k] && k !== 'sloth'; });
  ok('p0 todo bicho selvagem do chão tem o seu jeito diante de uma pessoa', !miss.length, miss.length ? `SEM JEITO: ${miss.join(', ')}` : `${Object.keys(L.TEMPER).length} espécies: ${['hunt', 'flight', 'freeze', 'snake', 'giant', 'boar', 'curious'].map(t => `${t} ${Object.values(L.TEMPER).filter(x => x === t).length}`).join(', ')}`);
}
// (the person of a case of the beast's reading does not see the beast: the fear of the beasts (D-310, D-311) would have her run
// before the meeting — the case is the beast's answer to a person who comes on unaware, as on a path in the grass at dusk; the
// people's fear has its own proofs, qa/medo.js. Given back at the case's end, T-1334)
const unseen = hs => { const ids = new Set(hs.map(h => h.id)); const d0 = G.Vg.dread; if (!d0) return () => {}; G.Vg.dread = a => (a && ids.has(a.id) ? 0 : d0(a)); return () => { G.Vg.dread = d0; }; };
// p1 a lone woodcutter at the edge of a wood, a hungry tiger eight steps off: the stalk from cover, the rush, the takedown
if (on('p1')) {
  let msg = 'sem lugar', good = false;
  const p = edge('tiger'); const [v] = people(1);
  if (p && v) {
    clear(p[0], p[1], 26); S.time = 0.35;
    // (at the tree itself: the woodcutter stands at it to cut)
    const tr = A.treeNear(p[0], p[1], 4); const at = tr ? (W.nearestLand(tr.x + 0.5, tr.y + 0.5, 2, (x, y) => W.walkableXY(x, y) && !S.treeAt[W.idx(x, y)]) || p) : p;
    place(v, at[0], at[1]); const cut = chop(v);
    // (five steps into the wood, on ground it walks to the woodcutter from: with the meio's senses a tiger eight steps off in the
    // trees may not know the woodcutter standing at his tree is there, T-1334)
    const tp = (() => { for (let k = 0; k < 16; k++) { const an = Math.PI + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.39, x = at[0] + Math.cos(an) * 5, y = at[1] + Math.sin(an) * 5; if (W.inb(x, y) && W.walkableXY(x, y) && W.canWalk(x, y, at[0], at[1])) return [x, y]; } return [at[0] - 5, at[1] + 1]; })();
    const tg = putBold('tiger', tp[0], tp[1], { hunger: 0.95, age: 6 }); G.faceTo(tg, at[0] - tp[0], at[1] - tp[1]); const back = unseen([tg]); // (the woodcutter at his tree does not see the tiger in the wood: the case is the stalk, T-1334)
    const w = watchMan([tg], [v]); const t0 = T0();
    // (the tiger kept hungry, rested and awake by the proof's hand: by day a cat sleeps — the case is the woodcutter, not its nap)
    const viol = liveMan(60, w, () => { keepAt(v, at, true); god(() => { if (tg.state === 'sleep' || tg.state === 'rest') { tg.state = 'idle'; tg.t = 0; } tg.hunger = Math.max(tg.hunger, 0.95); Me.m(tg).en = 1; }); }, () => w.hurt() > 0 && !(tg.state === 'stalk' || tg.state === 'pounce'));
    const hurt = w.hurt();
    // (the hunt: from far, the stalk; from near, the rush — then the person hurt, leapt on, or running for their life)
    good = w.hunt > 0 && (hurt > 0 || w.pounce > 0 || w.fled > 0) && !viol.length;
    msg = `${v.name} ${cut ? 'cortando lenha' : 'parado'} na beira do mato, o tigre (fome 0,95) a 5 passos: espreita ${w.stalk > 0 ? 'sim' : w.hunt ? 'não (visto antes: a corrida)' : 'NÃO'}, salto ${w.pounce > 0 ? 'sim' : 'não'}, a pessoa ${!S.villagers.has(v.id) || v.dead ? 'morta' : hurt ? `ferida (vida ${Math.round(v.hp)})` : w.fled ? 'fugiu dele' : 'ilesa'}; caças de gente ${diff(t0, 'caca-gente:tiger')}; ${tsay(w)}${w.hunt ? '' : (r => ` (a leitura no fim: quer ${r.want.toFixed(2)}, perigo ${r.danger.toFixed(2)}, outros ${r.others}, armados ${r.arm}, tochas ${r.fire}, ousadia ${Me.trait(tg, 'b').toFixed(2)}, a ${G.dist(tg.x, tg.y, v.x, v.y).toFixed(1)} passos, caminho ${W.canWalk(tg.x, tg.y, v.x, v.y)})`)(L.readMan(tg, v))} — ${vsay(viol)}`;
    back();
  }
  ok('p1 o tigre com fome e o lenhador sozinho na beira do mato: a espreita, o bote', good, msg);
}
// p2 five people together, the same hungry tiger: no hunt — it watches them, and gives way
if (on('p2')) {
  let msg = 'sem lugar', good = false;
  const p = edge('tiger'); const vs = people(5);
  if (p && vs.length === 5) {
    clear(p[0], p[1], 26); S.time = 0.35;
    const spot = vs.map((v, i) => [p[0] + Math.cos(i * 1.256) * 0.9, p[1] + Math.sin(i * 1.256) * 0.9]);
    vs.forEach((v, i) => place(v, spot[i][0], spot[i][1]));
    const tg = put('tiger', p[0] - 7, p[1] + 1, { hunger: 0.95, age: 6 });
    const w = watchMan([tg], vs); const t0 = T0();
    // (a group at its work together: the proof's hand keeps them in their places, whatever each would do alone)
    const viol = liveMan(40, w, () => god(() => vs.forEach((v, i) => { if (S.villagers.has(v.id) && !v.dead && G.dist(v.x, v.y, spot[i][0], spot[i][1]) > 0.6) { v.x = spot[i][0]; v.y = spot[i][1]; v.path = null; } })));
    good = w.hunt === 0 && w.hurt() === 0 && (w.eye + w.shy) > 0 && !viol.length;
    msg = `cinco juntos, o tigre (fome 0,95) a 7 passos: caça ${w.hunt ? 'SIM (' + w.hunt + ')' : 'nenhuma'}, feridos ${w.hurt()}, de olho ${(w.eye / 4).toFixed(1)} s, recuando ${(w.shy / 4).toFixed(1)} s; vigia ${diff(t0, 'gente:vigia:tiger')}, recua ${diff(t0, 'gente:recua:tiger') + diff(t0, 'gente:foge:tiger')}; ${tsay(w)} — ${vsay(viol)}`;
  }
  ok('p2 cinco pessoas juntas: o tigre não ataca — vigia e se afasta', good, msg);
}
// p3 a lone person at night with a torch, a hungry tiger: kept off by the fire; the torch put out, the hunt
if (on('p3')) {
  let msg = 'sem lugar', good = false;
  // (the world's torch: one in three grown people walking in the night carries one — L.fire, the views' own rule. A walker who
  // carries one, and one who does not, each walking up and down a few steps by the wood, the tiger hungry and awake by them)
  const p = edge('tiger'); const [vt] = people(1, q => q.id % 3 === 0); const [vn] = people(1, q => q.id % 3 !== 0);
  if (p && vt && vn) {
    clear(p[0], p[1], 26); S.time = 0.75;
    const pace = v => god(() => { const t = v.task; if (!S.villagers.has(v.id) || (t && (t.type === 'flee' || t.type === 'fight'))) return; v.sleeping = false; v.energy = Math.max(v.energy, 90);
      // (turned before the end of each leg: one who walks on, never stopping — the torch is carried walking)
      if (!t || t.type !== 'olhar' || t.st === 2 || G.dist(v.x, v.y, t.x, t.y) < 1.2) { const e = t && t.type === 'olhar' && t.x > p[0] ? -3 : 3; G.Vg.setTask(v, { type: 'olhar', x: p[0] + e, y: p[1], fx: p[0] - 8, fy: p[1] + 1, until: S.clock + 30, st: 0, pri: 1.2, torch: v === vt }); } }); // (the torch in the hand of the one who carries it, walking or at the turn: lit only while moving, it was out half the case in the full run, T-1334)
    const night = () => { if (S.time < 0.74 && S.time > 0.5) S.time = 0.75; };
    const tg = putBold('tiger', p[0] - 8, p[1] + 1, { hunger: 0.95, age: 6 }); const back = unseen([tg]);
    const keepT = () => god(() => { if (tg.state === 'sleep' || tg.state === 'rest') { tg.state = 'idle'; tg.t = 0; } tg.hunger = Math.max(tg.hunger, 0.95); Me.m(tg).en = 1; });
    place(vt, p[0] - 3, p[1]); place(vn, p[0] + 30, p[1]); // (the one without it still far off)
    const w = watchMan([tg], [vt]); let lit0 = 0;
    const v1 = liveMan(25, w, () => { night(); pace(vt); keepT(); if (L.fire(vt)) lit0++; });
    const lit = { hunt: w.hunt, hurt: w.hurt(), react: w.eye + w.shy, fire: lit0 };
    // (the one with the torch home; the one without it, now, in the same place, and the tiger brought back where it began)
    place(vt, p[0] + 30, p[1]); place(vn, p[0] - 3, p[1]);
    god(() => { tg.x = p[0] - 8; tg.y = p[1] + 1; tg.state = 'idle'; tg.t = 0; tg.target = 0; tg.hunger = 0.95; tg.rest = 0; tg.ey = 0; });
    const w2 = watchMan([tg], [vn]);
    const v2 = liveMan(40, w2, () => { night(); pace(vn); keepT(); }, () => w2.hunt > 0);
    good = lit.hunt === 0 && lit.hurt === 0 && lit.react > 0 && lit.fire > 0 && w2.hunt > 0 && !v1.length && !v2.length;
    msg = `de noite, andando sozinho: ${vt.name} com a tocha (${(lit.fire / 4).toFixed(1)} s com ela acesa): caça ${lit.hunt ? 'SIM' : 'nenhuma'}, ${lit.hurt ? 'FERIDO' : 'ileso'}, o tigre ${lit.react ? 'vigiou e recuou' : 'NÃO REAGIU'} (${tsay(w)}); ${vn.name} sem tocha: caça ${w2.hunt > 0 ? 'sim' : 'NÃO'} — ${vsay(v1.concat(v2))}`;
    back();
  }
  ok('p3 a tocha de noite afasta o tigre; sem ela, a caça', good, msg);
}
// p4 the old lion with a lame leg turns man-eater: hunger that a sound lion bears, and it hunts a lone person; the sound lion,
// as hungry, does not
if (on('p4')) {
  let msg = 'sem lugar', good = false;
  const p = arena('lion', false, used); if (p) used.push(p); const q = arena('lion', false, used); if (q) used.push(q);
  const [v1, v2] = people(2);
  if (p && q && v1 && v2) {
    clear(p[0], p[1], 26); clear(q[0], q[1], 26); S.time = 0.35;
    place(v1, p[0], p[1]); place(v2, q[0], q[1]);
    // (five steps off, not eight: with the senses of the meio — the wind, the cover — a lion eight steps off may not know the
    // builder is there at all, and the case is the reading of one it sees, T-1334)
    // (and on ground the lion walks to the person from: a spot across a ditch or inside a lot was a lion that could not come, T-1334)
    const reach = c => { for (let k = 0; k < 16; k++) { const an = k * 0.39, x = c[0] - Math.cos(an) * 5, y = c[1] + Math.sin(an) * 5; if (W.inb(x, y) && W.walkableXY(x, y) && W.canWalk(x, y, c[0], c[1])) return [x, y]; } return [c[0] - 5, c[1]]; };
    const po = reach(p), qo = reach(q);
    const old = put('lion', po[0], po[1], { hunger: 0.7, age: A.DEF.lion.life * 0.88, lifeMul: 1 }); god(() => { L.wound(old, 5, 0.55, null); old.wnd.b = 0; Me.m(old).sx = 1; });
    const young = put('lion', qo[0], qo[1], { hunger: 0.7, age: A.DEF.lion.life * 0.3, lifeMul: 1 }); god(() => { Me.m(young).sx = 1; }); const back = unseen([old, young]);
    const wo = watchMan([old], [v1]), wy = watchMan([young], [v2]); const both = { hs: [old, young], tick() { wo.tick(); wy.tick(); } };
    const keep = () => god(() => { for (const [v, c] of [[v1, p], [v2, q]]) if (S.villagers.has(v.id) && !v.dead && !(v.task && v.task.type === 'flee') && G.dist(v.x, v.y, c[0], c[1]) > 0.6) { v.x = c[0]; v.y = c[1]; v.path = null; } for (const l of [old, young]) l.hunger = 0.7; });
    const viol = liveMan(45, both, keep, () => wo.hunt > 0 && wy.states.size > 1);
    good = wo.hunt > 0 && wy.hunt === 0 && !viol.length;
    msg = `o leão velho e manco (fome 0,7): caça ${wo.hunt > 0 ? 'sim' : 'NÃO'} (${tsay(wo)}); o leão moço e são, a mesma fome: caça ${wy.hunt ? 'SIM' : 'nenhuma'} (${tsay(wy)}) — ${vsay(viol)}`;
    back();
  }
  ok('p4 o leão velho e ferido vira devorador de gente; o são, com a mesma fome, não', good, msg);
}
// p5 a lion with a full belly and a person coming by at three steps: it does not lie on as if nobody were there
if (on('p5')) {
  let msg = 'sem lugar', good = false;
  const p = arena('lion', false, used); if (p) used.push(p); const [v] = people(1);
  if (p && v) {
    clear(p[0], p[1], 26); S.time = 0.35;
    const lion = put('lion', p[0], p[1], { hunger: 0.05 }); god(() => { lion.state = 'rest'; lion.t = 20; });
    place(v, p[0] + 3, p[1]);
    const w = watchMan([lion], [v]);
    const viol = liveMan(15, w, () => god(() => { if (S.villagers.has(v.id) && !(v.task && v.task.type === 'flee') && G.dist(v.x, v.y, p[0] + 3, p[1]) > 0.6) { v.x = p[0] + 3; v.y = p[1]; v.path = null; } }));
    const near = G.dist(lion.x, lion.y, v.x, v.y);
    good = (w.eye + w.shy + w.warn) > 0 && w.hunt === 0 && w.hurt() === 0 && !viol.length;
    msg = `o leão de barriga cheia deitado, ${v.name} a 3 passos: ${w.shy ? 'afastou-se' : w.warn ? 'ameaçou' : w.eye ? 'ficou de olho' : 'NÃO REAGIU'} (${tsay(w)}); agora a ${near.toFixed(1)} passos; caça ${w.hunt ? 'SIM' : 'nenhuma'} — ${vsay(viol)}`;
  }
  ok('p5 o leão saciado não fica deitado ao lado de uma pessoa como se ela não estivesse ali', good, msg);
}
// (a person sent by the proof's hand to walk up to a spot — on their own feet, by the world's own errand of going to look at
// something there ('olhar': the way, the walk, the stop): the way someone comes on through the grass, and the beasts see who is
// coming their way)
const walkTo = (v, x, y) => god(() => { if (!S.villagers.has(v.id) || v.dead) return; const t = v.task; if (t && (t.type === 'flee' || t.type === 'fight')) return; if (t && t.type === 'olhar' && G.dist(t.x, t.y, x, y) < 0.8) return; G.Vg.setTask(v, { type: 'olhar', x, y, fx: x, fy: y, until: S.clock + 60, st: 0, pri: 1.2 }); });
// p6 the prey (D-297c): a person walking on a herd of deer — they lift their heads and watch, then run at their own distance;
// a hare in the grass — still, pressed flat, and then the bolt at the last moment
if (on('p6')) {
  let msg = 'sem lugar', good = false;
  const p = arena('deer', false, used); if (p) used.push(p); const q = arena('hare', false, used); if (q) used.push(q); const [v, u] = people(2);
  if (p && q && v && u) {
    clear(p[0], p[1], 26); clear(q[0], q[1], 26); S.time = 0.35;
    const ds = []; for (let i = 0; i < 4; i++) ds.push(put('deer', p[0] + (i % 2) * 0.9, p[1] + ((i / 2) | 0) * 0.9, { hunger: 0.05 })); for (const d of ds.slice(1)) d.leader = ds[0].id;
    // (the hare in the grass of its own ground, the way a second person comes by — far from the deer: their alarm is not the case)
    const hare = put('hare', q[0], q[1], { hunger: 0.05 });
    place(v, p[0] - 13, p[1] + 0.5); place(u, q[0] - 8, q[1] + 0.4);
    const w = watchMan(ds, [v]), wh = watchMan([hare], [u]); const both = { hs: ds.concat([hare]), tick() { w.tick(); wh.tick(); } };
    let runAt = 0, hideSeen = 0, boltAt = 0; const t0 = T0();
    const viol = liveMan(40, both, () => {
      // (the herd and the hare kept grazing at their places by the proof's hand until they react — the case is the distance at
      // which they do —, and the two people walking up to them)
      // (the wind across the way they come: the scent on the wind is the meio's case, not this one — with the wind the world had
      // blowing that day, the run came at 2.4 paces one time and at the right distance another; T-1319b)
      S.weather.windA = Math.PI / 2;
      awake(ds.concat([hare])); god(() => { ds.forEach((d, i) => { if (!d.dead && !runAt && d.state !== 'eye' && d.state !== 'flee') { d.x = p[0] + (i % 2) * 0.9; d.y = p[1] + ((i / 2) | 0) * 0.9; } }); if (!boltAt && hare.state !== 'eye' && hare.state !== 'flee') { hare.x = q[0]; hare.y = q[1]; } });
      if (!runAt) walkTo(v, p[0], p[1], 0.25); if (!boltAt) walkTo(u, q[0], q[1], 0.25);
      if (!runAt && diff(t0, 'gente:foge:deer') > 0) runAt = Math.min(...ds.filter(d => !d.dead).map(d => G.dist(v.x, v.y, d.x, d.y))); // (the run from the person, not from anything else)
      if (hare.state === 'eye' && hare.gest === 'hide') hideSeen++;
      if (!boltAt && hare.state === 'flee') boltAt = G.dist(u.x, u.y, hare.x, hare.y) || 0.01;
    }, () => runAt && boltAt);
    // (their own distance: the kind's fear, stretched by the senses of each — the sentinel, the frightened one run sooner —, at most
    // the senses' reach, A.SENSE_MAX)
    good = runAt > 2.5 && runAt <= A.DEF.deer.fear * A.SENSE_MAX + 0.5 && hideSeen > 0 && boltAt > 0 && !viol.length;
    msg = `os cervos de olho ${(w.eye / 4).toFixed(1)} s, correram com ${v.name} a ${runAt ? runAt.toFixed(1) : '—'} passos (o medo deles: ${A.DEF.deer.fear}); a lebre, ${u.name} passando: ${hideSeen ? `parada e rente ao chão ${(hideSeen / 4).toFixed(1)} s` : 'NÃO SE ESCONDEU'}, ${boltAt ? `disparou a ${boltAt.toFixed(1)} passos` : 'NÃO DISPAROU'} — ${vsay(viol)}`;
  }
  ok('p6 os cervos vigiam e fogem na distância deles; a lebre se esconde e dispara', good, msg);
}
// p7 the snakes: the viper the foot comes on strikes; the one met a few steps off slips away; the python only goes
if (on('p7')) {
  let msg = 'sem lugar', good = false;
  const p = arena('viper', false, used); if (p) used.push(p); const q = arena('python', false, used); if (q) used.push(q); const [v1, v2] = people(2);
  if (p && q && v1 && v2) {
    clear(p[0], p[1], 20); clear(q[0], q[1], 20); S.time = 0.35;
    const vp = put('viper', p[0], p[1], { hunger: 0.2 }); const py = put('python', q[0], q[1], { hunger: 0.2 }); const back = unseen([vp, py]);
    place(v1, p[0] - 3, p[1]); place(v2, q[0] - 2.5, q[1]);
    const hp1 = v1.hp; const w = watchMan([vp, py], [v1, v2]); let bit = 0, slipP = 0;
    const viol = liveMan(30, w, () => { awake([vp, py]); if (!bit) walkTo(v1, vp.x, vp.y, 0.25); god(() => { if (S.villagers.has(v2.id) && G.dist(v2.x, v2.y, q[0] - 2.5, q[1]) > 0.6) { v2.x = q[0] - 2.5; v2.y = q[1]; v2.path = null; } }); if (py.state === 'shy') slipP++; if (v1.hp < hp1 - 1) bit = 1; });
    good = bit && slipP > 0 && !viol.length;
    msg = `${v1.name} andando para a víbora: ${bit ? `picado (vida ${Math.round(v1.hp)})` : `NÃO picado (a ${G.dist(v1.x, v1.y, vp.x, vp.y).toFixed(1)} dela, ${v1.task ? v1.task.type : 'sem tarefa'}, a víbora em «${vp.state}»)`}; a píton com ${v2.name} a 2,5 passos: ${slipP ? 'foi embora' : 'FICOU'} (${tsay(w)}) — ${vsay(viol)}`;
    back();
  }
  ok('p7 a víbora pica o pé que chega nela; a píton vai embora', good, msg);
}
// p8 the giants: a hippo by its water and a person coming down to it — the display, then the charge; an elephant with its calf
if (on('p8')) {
  let msg = 'sem lugar', good = false;
  const p = arena('hippo', true, used); if (p) used.push(p); const q = arena('elephant', false, used); if (q) used.push(q); const [v1, v2] = people(2);
  if (p && q && v1 && v2) {
    clear(p[0], p[1], 20); clear(q[0], q[1], 20); S.time = 0.35;
    const hp = put('hippo', p[0], p[1], { hunger: 0.05 });
    const el = put('elephant', q[0], q[1], { hunger: 0.05 }); const calf = put('elephant', q[0] + 0.8, q[1] + 0.5, { hunger: 0.1, grown: 0.4 }); god(() => { Me.m(el).sx = 0; Me.m(calf).mom = el.id; calf.leader = el.id; }); const back = unseen([hp, el, calf]);
    place(v1, p[0] - 7, p[1]); place(v2, q[0] - 9, q[1]);
    const w = watchMan([hp, el], [v1, v2]); let shownH = 0, shownE = 0, chH = 0, chE = 0;
    const viol = liveMan(30, w, () => { awake([hp, el]); god(() => { el.leader = 0; calf.leader = el.id; if (!calf.dead && G.dist(calf.x, calf.y, el.x, el.y) > 1.5) { calf.x = el.x + 0.8; calf.y = el.y + 0.5; } }); walkTo(v1, hp.x, hp.y, 0.35); walkTo(v2, el.x, el.y, 0.35); if (hp.state === 'eye') shownH++; if (el.state === 'eye') shownE++; if (hp.angry > 0 && hp.target === v1.id) chH++; if (el.angry > 0 && el.target === v2.id) chE++; }, () => chH > 0 && chE > 0);
    good = chH > 0 && chE > 0 && !viol.length;
    msg = `o hipopótamo junto da água: ${shownH ? 'ameaçou' : 'não ameaçou'}, ${chH ? 'investiu' : 'NÃO INVESTIU'} contra ${v1.name}; a elefanta com o filhote: ${shownE ? 'ameaçou' : 'não ameaçou'}, ${chE ? 'investiu' : `NÃO INVESTIU (a ${G.dist(v2.x, v2.y, el.x, el.y).toFixed(1)} dela, ${v2.task ? v2.task.type : 'sem tarefa'}, ela em «${el.state}», o filhote a ${G.dist(calf.x, calf.y, el.x, el.y).toFixed(1)})`} (${tsay(w)}) — ${vsay(viol)}`;
    back();
  }
  ok('p8 o hipopótamo junto da água e a elefanta com o filhote avisam e investem', good, msg);
}
// p9 the bears: met at three paces without its cubs, the bluff — the rush that stops short; with its cubs, the real charge
if (on('p9')) {
  let msg = 'sem lugar', good = false;
  const p = arena('bear', false, used); if (p) used.push(p); const q = arena('bear', false, used); if (q) used.push(q); const [v1, v2] = people(2);
  if (p && q && v1 && v2) {
    clear(p[0], p[1], 20); clear(q[0], q[1], 20); S.time = 0.35;
    const b1 = put('bear', p[0], p[1], { hunger: 0.1 }); god(() => { Me.m(b1).sx = 1; });
    const b2 = put('bear', q[0], q[1], { hunger: 0.1 }); const cub = put('bear', q[0] + 0.7, q[1] + 0.4, { grown: 0.35, hunger: 0.1 }); god(() => { Me.m(b2).sx = 0; Me.m(cub).mom = b2.id; cub.leader = b2.id; }); const back = unseen([b1, b2, cub]);
    place(v1, p[0] - 2.8, p[1]); place(v2, q[0] - 3, q[1]);
    const w1 = watchMan([b1], [v1]), w2 = watchMan([b2], [v2]); let bl = 0, ch = 0;
    const both = { hs: [b1, b2, cub], tick() { w1.tick(); w2.tick(); if (b1.state === 'bluff') bl++; if (b2.angry > 0 && b2.target === v2.id) ch++; } };
    // (the people at three paces, and the bears awake where they were met until they answer them — the case is the meeting: a bear
    // that wandered half a step off met the person at more than three, and only watched)
    const keep = () => god(() => { for (const [v, c] of [[v1, [p[0] - 2.8, p[1]]], [v2, [q[0] - 3, q[1]]]]) if (S.villagers.has(v.id) && !(v.task && (v.task.type === 'flee' || v.task.type === 'fight')) && G.dist(v.x, v.y, c[0], c[1]) > 0.6) { v.x = c[0]; v.y = c[1]; v.path = null; }
      for (const [b, c, done] of [[b1, p, bl > 0], [b2, q, ch > 0]]) { if (b.dead || done) continue; if (b.state === 'sleep' || b.state === 'rest') { b.state = 'idle'; b.t = 0; } if (!(b.angry > 0) && b.state !== 'bluff' && b.state !== 'shy' && b.state !== 'flee' && b.state !== 'eye' && G.dist(b.x, b.y, c[0], c[1]) > 0.15) { b.x = c[0]; b.y = c[1]; } } });
    const viol = liveMan(15, both, keep, () => bl > 0 && ch > 0);
    good = bl > 0 && ch > 0 && !viol.length;
    msg = `o urso sozinho a 2,8 passos: ${bl ? 'o blefe (correu e parou)' : 'SEM BLEFE'} (${tsay(w1)}); a ursa com o filhote a 3 passos: ${ch ? 'investiu de verdade' : 'NÃO INVESTIU'} (${tsay(w2)}) — ${vsay(viol)}`;
    back();
  }
  ok('p9 o urso blefa; a ursa com o filhote investe', good, msg);
}
// p10 the wolves by day keep away from a lone person; the boar cornered against the water charges
if (on('p10')) {
  let msg = 'sem lugar', good = false;
  const p = edge('wolf'); const [v1] = people(1);
  if (p && v1) {
    clear(p[0], p[1], 26); S.time = 0.35;
    const ws = []; for (let i = 0; i < 3; i++) ws.push(put('wolf', p[0] - 8 - i * 0.7, p[1] + i * 0.6, { hunger: 0.95 })); for (const o of ws.slice(1)) o.leader = ws[0].id;
    place(v1, p[0], p[1]);
    const w = watchMan(ws, [v1]);
    const viol = liveMan(30, w, () => { keepAt(v1, p); for (const o of ws) o.hunger = Math.max(o.hunger, 0.9); });
    good = w.hunt === 0 && w.hurt() === 0 && (w.eye + w.shy) > 0 && !viol.length;
    msg = `três lobos com fome, de dia, e ${v1.name} sozinho: caça ${w.hunt ? 'SIM' : 'nenhuma'}, de olho ${(w.eye / 4).toFixed(1)} s, recuando ${(w.shy / 4).toFixed(1)} s (${tsay(w)}) — ${vsay(viol)}`;
  }
  ok('p10 os lobos de dia ficam longe da pessoa sozinha', good, msg);
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
    // (the save while the hold is on: a prey that broke out before is staged again — the case is the save, not the escape)
    let c = null; for (let i = 0; i < 4 && (!c || c.h.state !== 'hold'); i++) { c = staged(hk, pk, k); if (!c) break; M.viver(k === L.K.CROC ? 3 : 1.5); }
    if (!c) { out.push(`${nm}: sem lugar`); continue; }
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
    const v = live(30); const dead = new Set(gs.map(g => g.id)); const stuck = ls.filter(l => !l.dead && (l.state === 'hold' || l.state === 'stalk' || (l.state === 'chase' && !l.carc)) && dead.has(l.target));
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
// b6 save and load while a tiger stalks a person: it goes on (or the stalk is let go), nothing left pointing at nobody; b7 the god
// lifts the stalked one, and another goes indoors: the hunt is over at once
const stalking = () => {
  const p = edge('tiger'); const [v] = people(1); if (!p || !v) return null;
  clear(p[0], p[1], 26); S.time = 0.35; place(v, p[0], p[1]);
  const tg = put('tiger', p[0] - 7, p[1], { hunger: 0.95, age: 6 });
  god(() => { tg.target = v.id; tg.onPerson = true; tg.carc = false; tg.state = 'stalk'; tg.t = 18; });
  return { p, v, tg };
};
if (on('b6')) {
  let msg = 'sem lugar', good = false; const c = stalking();
  if (c) {
    M.viver(1); const st0 = c.tg.state, id = c.tg.id, vid = c.v.id;
    M.salvarCarregar(); S = G.S; const tg = S.animals.get(id), v = S.villagers.get(vid);
    const viol = bad(); const after = tg ? tg.state : 'sumiu';
    viol.push(...live(20));
    const dangling = !!tg && tg.onPerson && !S.villagers.has(tg.target);
    good = !!tg && !!v && !viol.length && !dangling;
    msg = `antes do save «${st0}», depois do load «${after}» (alvo ${tg && tg.target === vid ? 'a mesma pessoa' : tg && tg.target ? 'outro' : 'nenhum'}), 20 s depois «${tg ? tg.state : '-'}»${dangling ? ', CAÇANDO NINGUÉM' : ''} — ${vsay(viol)}`;
  }
  ok('b6 save e load no meio da espreita de uma pessoa', good, msg);
}
if (on('b7')) {
  const out = []; let good = true;
  { const c = stalking(); if (c) { M.viver(1); god(() => { c.v.held = true; }); const v = live(2); const over = !(c.tg.target === c.v.id && c.tg.onPerson && (c.tg.state === 'stalk' || c.tg.state === 'pounce' || c.tg.state === 'chase')); good = good && over && !v.length; out.push(`o deus ergue a pessoa: o tigre ${over ? 'larga' : 'AINDA ESPREITA'} (${c.tg.state}) — ${vsay(v)}`); god(() => { c.v.held = false; }); } else good = false; }
  { const c = stalking(); if (c) { M.viver(1); const b = [...S.buildings.values()].find(q => q.built && G.BDEF[q.type] && G.BDEF[q.type].housing); god(() => { c.v.inside = b ? b.id : 1; }); const v = live(2); const over = !(c.tg.target === c.v.id && c.tg.onPerson && (c.tg.state === 'stalk' || c.tg.state === 'pounce' || c.tg.state === 'chase')); good = good && over && !v.length; out.push(`a pessoa entra numa casa: o tigre ${over ? 'larga' : 'AINDA ESPREITA'} (${c.tg.state}) — ${vsay(v)}`); god(() => { G.Vg.endTask(c.v); c.v.inside = 0; }); } else good = false; }
  ok('b7 a mão do deus ergue a pessoa espreitada; a pessoa entra em casa', good && out.length === 2, out.join('; '));
}
// ---------------- the whole ----------------
{ const e = M.erros(); const ge = A.gestErr.slice(0, 4);
  ok('fim: nenhum gesto recusado pela porta, nenhum erro de módulo', !ge.length && M.limpo(), `gestos recusados ${ge.length ? ge.join('; ') : 'nenhum'}; erros ${JSON.stringify(e.mod)} ${e.console.slice(0, 2).join(' | ')}`);
  console.log('  as contas da luta: ' + Object.entries(L.tally).filter(([k]) => !k.includes(':')).map(([k, v]) => `${k} ${v}`).join(', ')); }
console.log(fails.length ? `FALHOU: ${fails.length} (${fails.join(', ')})` : 'TUDO PASSOU'); process.exit(fails.length ? 1 : 0);
