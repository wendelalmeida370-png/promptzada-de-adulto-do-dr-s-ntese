// medo: as pessoas têm medo das feras (D-310).   [ONLY=m1,m3] node qa/medo.js [mundo]   (≈ 1 min)
// O dono viu um leão e um tigre andando no meio da cidade, do lado dos aldeões, e ninguém dava um passo para o lado: as pessoas
// só olhavam para o bicho que vinha atrás de alguém naquele instante. Agora quem não pode lutar foge da fera que caça gente
// (o leão, o tigre, o urso, o crocodilo fora d'água, os lobos) ao vê-la, e dá lugar aos gigantes (o hipopótamo, o elefante, o
// rinoceronte, o búfalo); os armados vão contra a fera que caça gente — nunca um sozinho contra um leão: só com outros dois
// armados perto, ou com quem já luta com ela; a crônica diz que a fera entrou na cidade.
// A mão da prova põe a fera onde o caso pede e a segura ali (a fera não sai: o caso é o medo das pessoas, não o juízo da fera);
// o céu fica limpo (uma tempestade põe a cidade debaixo dos tetos, T-868).
// m1 um leão na praça ao meio-dia: em três segundos, quem não pode lutar e está a cinco casas dele foge; a crônica diz que
//    ele entrou na cidade (uma vez);
// m2 três armados perto: a turma vai contra o leão (duas lutas ou mais) e o leão cai ferido ou morto;
// m3 um armado sozinho, longe dos outros: não vai contra o leão, foge;
// m4 um hipopótamo à beira do caminho: quem está a duas casas dá lugar («bicho»), e ninguém vai lutar com ele;
// m5 o caçador que caça um javali não foge dele;
// m6 save e load com as pessoas a fugir do leão: depois do load, em três segundos, fogem de novo; ninguém parado ao lado;
// m7 o leão morre no meio da fuga: ninguém mais foge dele;
// m8 quem come com a fome acima de 85 continua a comer com o leão a quatro casas (L-725);
// m9 o caminho que passaria pelo lugar de um leão dá a volta nele, como no fogo (D-311): o campo do medo (W.danger) no custo
//    das casas e no puxão reto do caminho;
// m10 uma víbora dentro da aldeia: os armados a matam com o pau; a criança perto dela dá lugar;
// m11 ninguém anda na direção de um bicho: quem é mandado de um lado ao outro de um hipopótamo dá a volta, nunca dentro do anel;
// e o verificador (o S3 novo «medo») calado, nenhum S0–S2 novo, nenhum erro de módulo nem de console.
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const WORLD = process.argv[2] || 'cidade';
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const on = k => !ONLY || ONLY.includes(k);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | medo ${name} | ${info}`); if (!c) fails.push(name); };
const Vg = G.Vg, W = G.W, A = G.Animals;
// (the sky clear and the beast held where the case puts it, at every step)
let hold = null;
const step0 = G.debug.step; G.debug.step = dt => { const w = G.S && G.S.weather; if (w) { w.storm = 0; w.rain = 0; } if (hold) hold(); return step0(dt); };
let S = M.pronto(WORLD);
const base = new Set(QA.check().filter(q => q.sev <= 2).map(q => q.sys + '|' + q.msg));
const novas = () => QA.check().filter(q => q.sev <= 2 && !base.has(q.sys + '|' + q.msg)).map(q => `[S${q.sev}] ${q.sys}: ${q.msg}`);
let medoS3 = [];
const look = () => { for (const q of QA.check()) if (q.sys === 'medo') medoS3.push(q.msg); };
const live = seg => { for (let k = 0, n = Math.round(seg / 0.1); k < n; k++) { G.debug.step(0.1); if (k % 10 === 9) look(); } };
const town = () => [...S.settlements.values()].filter(s => G.Fac.get(s.fac)).sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0];
const open = (x, y) => W.inb(x, y) && W.walkableXY(x, y) && !S.occ[W.idx(x, y)] && !(S.fire[W.idx(x, y)] > 0) && S.type[W.idx(x, y)] >= G.T.SAND;
// the open spot nearest to (x, y) with the most people outdoors round it
function spotNear(x, y, R) {
  let best = null, bn = -1;
  for (let yy = Math.floor(y - R); yy <= y + R; yy++) for (let xx = Math.floor(x - R); xx <= x + R; xx++) {
    if (!open(xx + 0.5, yy + 0.5)) continue; let n = 0;
    for (const v of S.villagers.values()) if (!v.inside && G.dist2(v.x, v.y, xx + 0.5, yy + 0.5) < 36) n++;
    if (n > bn) { bn = n; best = [xx + 0.5, yy + 0.5]; }
  }
  return best;
}
const pin = (a, x, y) => () => { if (!S.animals.has(a.id) || a.dead) return; a.x = x; a.y = y; a.tx = x; a.ty = y; a.state = 'idle'; a.t = 1e6; a.rest = 1e6; a.hunger = 0; a.target = 0; a.angry = 0; a.onPerson = false; };
const beast = (kind, x, y) => A.spawn(kind, x, y, { age: A.DEF[kind].life * 0.5, grown: 1, hunger: 0, state: 'idle', t: 1e6, rest: 1e6 });
const people = (x, y, r, f) => [...S.villagers.values()].filter(v => !v.inside && !v.held && !v.aboard && !v.ug && !(S.avatar && S.avatar.id === v.id) && v.age >= 2 && G.dist(v.x, v.y, x, y) < r && (!f || f(v)));
// (a build from before the fear, D-310, has no door for the armed: the same rule, written here — to see the old case fail)
const armedFor = Vg.armedFor || (v => v.age >= 16 && v.age < 62 && v.hp > 45 && (v.role === 'guerreiro' || v.role === 'arqueiro' || v.role === 'cacador' || !!v.unit || v.courage > 0.62));
const DREADK = Vg.DREAD || { lion: 1, tiger: 1, leopard: 1, jaguar: 1, bear: 1, polarbear: 1, snowleopard: 1, croc: 1, anaconda: 1, wolf: 1, hyena: 1, hippo: 1, rhino: 1, buffalo: 1, elephant: 1 };
const unarmed = v => !(v.age >= 16 && armedFor(v));
// (the stage cleared of the other beasts people dread, round the case's spot: the case is the one the proof brings)
const clear = (x, y) => { for (const a of [...S.animals.values()]) if (DREADK[a.kind] && G.dist(a.x, a.y, x, y) < 30) A.remove(a); };
S.time = 0.5;

if (on('m1') || on('m6') || on('m7')) {
  const s = town(); const p = spotNear(s.cx, s.cy, 10); clear(p[0], p[1]);
  const lion = beast('lion', p[0], p[1]); hold = pin(lion, p[0], p[1]);
  const near0 = people(p[0], p[1], 5, unarmed); const h0 = S.history.length;
  live(3);
  const near = people(p[0], p[1], 5, unarmed); const still = near.filter(v => !(v.task && v.task.type === 'flee') && !(v.hunger > 85));
  const logs = S.history.slice(h0).filter(h => /^Um leão entrou em/.test(h.txt));
  if (on('m1')) ok('m1', near0.length > 0 && !still.length && logs.length === 1, `${near0.length} sem armas a 5 casas do leão na praça de ${s.name}; depois de 3 s, ${near.length} ainda a 5 casas, ${still.length} sem fugir (${still.slice(0, 3).map(v => v.name + ':' + (v.task ? v.task.type : '—')).join(', ')}); crônica: ${logs.map(h => h.txt).join(' | ') || 'nada'}`);
  if (on('m6')) {
    M.salvarCarregar(); S = G.S; const l2 = S.animals.get(lion.id); hold = l2 ? pin(l2, p[0], p[1]) : null;
    live(3);
    const n2 = people(p[0], p[1], 4, unarmed); const st2 = n2.filter(v => !(v.task && v.task.type === 'flee') && !(v.hunger > 85));
    ok('m6', !!l2 && !st2.length, `depois do load: o leão ${l2 ? 'de volta' : 'sumiu'}; ${n2.length} sem armas a 4 casas, ${st2.length} sem fugir`);
  }
  if (on('m7')) {
    const l3 = S.animals.get(lion.id); hold = null; if (l3) A.kill(l3, null, 'old');
    const before = new Set([...S.villagers.values()].filter(v => v.task && v.task.type === 'flee' && v.task.why === 'wolf').map(v => v.id + ':' + v.task.age));
    live(4);
    const fresh = [...S.villagers.values()].filter(v => v.task && v.task.type === 'flee' && v.task.why === 'wolf' && v.task.age < 3.5 && G.dist(v.task.fx, v.task.fy, p[0], p[1]) < 0.5);
    ok('m7', !!l3 && Vg.dread(l3) === 0 && !fresh.length, `o leão morto: medo ${l3 ? Vg.dread(l3) : '—'}; fugas novas dele em 4 s: ${fresh.length} (antes ${before.size} a fugir)`);
    if (l3 && S.animals.has(l3.id)) A.remove(l3);
  }
  if (S.animals.has(lion.id)) A.remove(S.animals.get(lion.id)); hold = null;
}
if (on('m2')) {
  const s = town(); const p = spotNear(s.cx, s.cy, 12); clear(p[0], p[1]);
  const lion = beast('lion', p[0], p[1]); hold = pin(lion, p[0], p[1]);
  // three grown bodies made brave by the proof's hand, at three to five tiles from the lion
  const brave = [...S.villagers.values()].filter(v => v.age >= 20 && v.age < 50 && !v.inside && !v.aboard && !v.ug && !(S.avatar && S.avatar.id === v.id) && !v.captive && !v.jail).sort((a, b) => G.dist(a.x, a.y, p[0], p[1]) - G.dist(b.x, b.y, p[0], p[1])).slice(0, 3);
  brave.forEach((v, k) => { v.courage = 0.95; v.hp = 100; const an = k * 2.1; const q = [p[0] + Math.cos(an) * 4, p[1] + Math.sin(an) * 4]; if (open(q[0], q[1])) { v.x = q[0]; v.y = q[1]; } Vg.endTask && Vg.endTask(v); });
  live(2);
  const fights = [...S.villagers.values()].filter(v => v.task && v.task.type === 'fight' && v.task.id === lion.id).length;
  hold = null; const hp0 = lion.hp; live(20);
  ok('m2', fights >= 2 && (lion.dead || lion.hp < hp0 || G.dist(lion.x, lion.y, p[0], p[1]) > 10), `${fights} foram contra o leão em 2 s; o leão ${lion.dead ? 'morto' : `com ${Math.round(lion.hp)}/${lion.maxHp}`}, a ${G.dist(lion.x, lion.y, p[0], p[1]).toFixed(1)} casas de onde estava`);
  if (S.animals.has(lion.id)) A.remove(lion);
}
if (on('m3')) {
  // a spot in the open, with nobody of the armed within 16 tiles but the one the proof brings
  let spot = null; const armedAll = [...S.villagers.values()].filter(v => !v.inside && v.age >= 16 && armedFor(v));
  for (const s of S.settlements.values()) { for (let k = 0; k < 40 && !spot; k++) { const an = k * 0.7, r = (s.radius || 8) + 4 + (k % 5) * 2; const x = s.cx + Math.cos(an) * r, y = s.cy + Math.sin(an) * r; if (open(x, y) && !armedAll.some(o => G.dist(o.x, o.y, x, y) < 16)) spot = [x, y]; } if (spot) break; }
  const one = [...S.villagers.values()].find(v => v.age >= 20 && v.age < 50 && !v.inside && !v.aboard && !v.ug && !(S.avatar && S.avatar.id === v.id) && !v.captive && !v.jail && !armedFor(v));
  if (!spot || !one) ok('m3', false, 'sem lugar ou pessoa para o caso');
  else {
    one.courage = 0.95; one.hp = 100; Vg.endTask(one); one.x = spot[0] + 4; one.y = spot[1]; if (!open(one.x, one.y)) { one.x = spot[0]; one.y = spot[1] + 4; }
    clear(spot[0], spot[1]); const lion = beast('lion', spot[0], spot[1]); hold = pin(lion, spot[0], spot[1]);
    live(1.5);
    const t = one.task; ok('m3', !(t && t.type === 'fight') && !!t && t.type === 'flee', `${one.name}, armado e sozinho a ${G.dist(one.x, one.y, spot[0], spot[1]).toFixed(1)} casas do leão: ${t ? t.type + (t.why ? '/' + t.why : '') : 'sem tarefa'}`);
    hold = null; A.remove(lion);
  }
}
if (on('m4')) {
  const s = town(); const p = spotNear(s.cx, s.cy, 12);
  const v = people(p[0], p[1], 1e9, x => x.age >= 16 && unarmed(x) && !x.captive && !x.jail).sort((a, b) => G.dist(a.x, a.y, p[0], p[1]) - G.dist(b.x, b.y, p[0], p[1]))[0];
  clear(p[0], p[1]); const hippo = beast('hippo', p[0], p[1]); hold = pin(hippo, p[0], p[1]);
  if (v) { Vg.endTask(v); v.x = p[0] + 2; v.y = p[1]; if (!open(v.x, v.y)) { v.x = p[0]; v.y = p[1] + 2; } }
  live(1.5);
  const fights = [...S.villagers.values()].filter(o => o.task && o.task.type === 'fight' && o.task.id === hippo.id).length;
  ok('m4', !!v && !!v.task && v.task.type === 'flee' && v.task.why === 'bicho' && !fights, `${v ? v.name : '—'} a 2 casas do hipopótamo: ${v && v.task ? v.task.type + '/' + (v.task.why || '') : 'sem tarefa'}; ${fights} foram lutar com ele`);
  hold = null; A.remove(hippo);
}
if (on('m5')) {
  const s = town(); const p = spotNear(s.cx, s.cy, 14);
  const v = people(p[0], p[1], 1e9, x => x.age >= 18 && x.age < 55 && !x.captive && !x.jail && x.hp > 60).sort((a, b) => G.dist(a.x, a.y, p[0], p[1]) - G.dist(b.x, b.y, p[0], p[1]))[0];
  clear(p[0], p[1]); const boar = beast('boar', p[0], p[1]); hold = pin(boar, p[0], p[1]);
  Vg.endTask(v); v.hunger = 0; v.energy = 100; v.x = p[0] + 2; v.y = p[1]; if (!open(v.x, v.y)) { v.x = p[0]; v.y = p[1] + 2; }
  G.inSim++; try { Vg.setTask ? Vg.setTask(v, { type: 'hunt', id: boar.id, pri: 1, rt: 0 }) : Vg.give(v, { type: 'hunt', id: boar.id, pri: 1, rt: 0 }); } finally { G.inSim--; }
  const seq = [v.task ? v.task.type : '—']; for (let k = 0; k < 10; k++) { G.debug.step(0.1); const q = v.task ? v.task.type + (v.task.why ? '/' + v.task.why : '') : '—'; if (q !== seq[seq.length - 1]) seq.push(q); }
  const t = v.task; ok('m5', !(t && t.type === 'flee'), `${v.name} (${v.role}) caçando o javali a 2 casas: ${seq.join(' → ')}`);
  hold = null; if (S.animals.has(boar.id)) A.remove(boar);
}
if (on('m8')) {
  // whoever is eating in the world now, made hungry by the proof's hand, a lion at four tiles
  let v = null; for (let k = 0; k < 60 && !v; k++) { live(1); v = [...S.villagers.values()].find(o => o.task && o.task.type === 'eat' && !o.inside && !(S.avatar && S.avatar.id === o.id) && unarmed(o)); }
  if (!v) ok('m8', false, 'ninguém comendo fora de casa em um minuto');
  else {
    v.hunger = 92; const an = G.hash(v.id) * 6.28; let q = null; for (let k = 0; k < 12 && !q; k++) { const x = v.x + Math.cos(an + k * 0.52) * 4, y = v.y + Math.sin(an + k * 0.52) * 4; if (open(x, y)) q = [x, y]; }
    clear(q[0], q[1]); const lion = beast('lion', q[0], q[1]); hold = pin(lion, q[0], q[1]);
    live(1);
    const t = v.task; ok('m8', !(t && t.type === 'flee'), `${v.name}, com fome ${Math.round(v.hunger)}, a ${G.dist(v.x, v.y, q[0], q[1]).toFixed(1)} casas do leão: ${t ? t.type + (t.why ? '/' + t.why : '') : 'sem tarefa'}`);
    hold = null; A.remove(lion);
  }
}
// an open stretch of ground round (x, y): every tile within R walkable and dry (no house, no water, no fire)
// (ground one walks on, a tree or a bush allowed — the way goes about them — but no house, no water, no fire)
const walkOn = (x, y) => W.inb(x, y) && W.walkableXY(x, y) && S.type[W.idx(x, y)] >= G.T.SAND && !(S.fire[W.idx(x, y)] > 0);
const clearRound = (x, y, R) => { for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) { if (dx * dx + dy * dy > R * R) continue; if (!walkOn(x + dx, y + dy)) return false; } return walkOn(x - 10, y) && walkOn(x + 10, y) && walkOn(x - 9, y) && walkOn(x + 9, y); };
// (the open ground nearest a town of the people: the whole map looked at, every third tile)
function openStretch(R) {
  const s = town(); let best = null, bd = 1e9; const NN = G.N;
  for (let y = R + 1; y < NN - R - 1; y += 3) for (let x = R + 1; x < NN - R - 1; x += 3) { const d = G.dist2(x, y, s.cx, s.cy); if (d >= bd || !clearRound(x + 0.5, y + 0.5, R)) continue; bd = d; best = [x + 0.5, y + 0.5]; }
  return best;
}
// the nearest a way (a list of points after the start) comes to (px, py)
const nearest = (sx, sy, path, px, py) => { let best = 1e9, ax = sx, ay = sy; for (const [bx, by] of path) { const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy; const u = l > 0 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l)) : 0; best = Math.min(best, G.dist(ax + dx * u, ay + dy * u, px, py)); ax = bx; ay = by; } return best; };
if (on('m9')) {
  // the way past a lion goes round it, as round a fire — the straight pull of the way does not cut through its ring again
  const p = openStretch(7);
  if (!p) ok('m9', false, 'sem chão aberto de 7 casas em volta');
  else {
    clear(p[0], p[1]); live(0.6); const A0 = [p[0] - 10, p[1]], B0 = [p[0] + 10, p[1]];
    const w0 = W.findPath(A0[0], A0[1], B0[0], B0[1]) || []; const n0 = nearest(A0[0], A0[1], w0, p[0], p[1]);
    const lion = beast('lion', p[0], p[1]); hold = pin(lion, p[0], p[1]); live(0.6);
    const w1 = W.findPath(A0[0], A0[1], B0[0], B0[1]) || []; const n1 = nearest(A0[0], A0[1], w1, p[0], p[1]);
    ok('m9', w1.length > 0 && n1 >= 4 && n1 > n0 + 2, `o caminho de 20 casas passando pelo lugar do leão: sem ele a ${n0.toFixed(1)} casas; com ele a ${n1.toFixed(1)} casas (${w1.length} pontos)`);
    hold = null; A.remove(lion); live(0.6);
  }
}
if (on('m10')) {
  // a viper inside a village: the armed kill it with a stick; a child near it gives it room
  const s = town(); const p = spotNear(s.cx, s.cy, 8); clear(p[0], p[1]);
  const viper = beast('viper', p[0], p[1]); hold = pin(viper, p[0], p[1]);
  const two = [...S.villagers.values()].filter(v => v.age >= 20 && v.age < 50 && !v.inside && !v.aboard && !v.ug && !(S.avatar && S.avatar.id === v.id) && !v.captive && !v.jail).sort((a, b) => G.dist(a.x, a.y, p[0], p[1]) - G.dist(b.x, b.y, p[0], p[1])).slice(0, 2);
  two.forEach((v, k) => { v.courage = 0.95; v.hp = 100; Vg.endTask(v); const q = [p[0] + (k ? -3 : 3), p[1]]; if (open(q[0], q[1])) { v.x = q[0]; v.y = q[1]; } });
  const kid = [...S.villagers.values()].find(v => v.age >= 4 && v.age < 12 && !v.inside && !v.aboard && !v.ug);
  if (kid) { Vg.endTask(kid); const q = [p[0], p[1] + 2.5]; if (open(q[0], q[1])) { kid.x = q[0]; kid.y = q[1]; } }
  live(1.5); hold = null;
  const fights = [...S.villagers.values()].filter(v => v.task && v.task.type === 'fight' && v.task.id === viper.id).length;
  const kt = kid && kid.task; live(20);
  ok('m10', fights >= 1 && viper.dead && (!kid || (kt && kt.type === 'flee')), `a víbora dentro de ${s.name}: ${fights} foram matá-la; ${viper.dead ? 'morta' : 'viva'}; a criança ${kid ? (kt ? kt.type + (kt.why ? '/' + kt.why : '') : 'sem tarefa') : '—'}`);
  if (S.animals.has(viper.id)) A.remove(viper);
}
if (on('m11')) {
  // nobody walks up to a beast: one sent straight past a hippo goes round it, never within its ring; and nobody heads at it
  const p = openStretch(7);
  if (!p) ok('m11', false, 'sem chão aberto');
  else {
    clear(p[0], p[1]); const hippo = beast('hippo', p[0], p[1]); hold = pin(hippo, p[0], p[1]); live(0.6);
    const v = [...S.villagers.values()].filter(o => o.age >= 18 && o.age < 55 && !o.inside && !o.aboard && !o.ug && !(S.avatar && S.avatar.id === o.id) && !o.captive && !o.jail && !(o.age >= 16 && armedFor(o))).sort((a, b) => G.dist(a.x, a.y, p[0], p[1]) - G.dist(b.x, b.y, p[0], p[1]))[0];
    Vg.endTask(v); v.hunger = 0; v.energy = 100; v.x = p[0] - 9; v.y = p[1];
    G.inSim++; try { Vg.setTask(v, { type: 'wander', pri: 1, kind: 'wander', wait: 30 }); Vg.goto(v, p[0] + 9, p[1], false); } finally { G.inSim--; }
    let minD = 1e9; for (let k = 0; k < 120; k++) { G.debug.step(0.1); minD = Math.min(minD, G.dist(v.x, v.y, p[0], p[1])); }
    ok('m11', minD >= 2 + 3 * Vg.DREAD.hippo, `${v.name} mandado de um lado ao outro do hipopótamo: o mais perto que chegou ${minD.toFixed(1)} casas (o anel ${(2 + 3 * Vg.DREAD.hippo).toFixed(1)}); agora ${v.task ? v.task.type : 'sem tarefa'} a ${G.dist(v.x, v.y, p[0] + 9, p[1]).toFixed(1)} do destino`);
    hold = null; A.remove(hippo);
  }
}
const nv = novas(); const e = M.erros();
ok('verificador', !medoS3.length && !nv.length && !Object.keys(e.mod).length && !e.console.length, `medo S3: ${medoS3.length}${medoS3.length ? ' (' + medoS3[0] + ')' : ''}; S0–S2 novas: ${nv.length}${nv.length ? ' (' + nv[0] + ')' : ''}; módulos ${JSON.stringify(e.mod)}; console ${e.console.length}`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
