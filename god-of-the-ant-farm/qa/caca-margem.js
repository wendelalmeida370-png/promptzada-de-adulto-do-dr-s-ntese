// caca-margem: a presa que cai onde os pés não vão (L-706).   [ONLY=c1,c3] node qa/caca-margem.js [mundo]
// Quem mata um bicho vai buscar a carne (e a pele): pedia o caminho até o corpo uma vez e esperava chegar a 0,8 dele. Um corpo
// caído na água rasa, a um braço da margem, nunca ficava a 0,8 de pé nenhum: a pessoa parava na beira, com a tarefa viva até
// o limite geral de uma tarefa (70 s) — e a de quem matou defendendo a cidade vale mais que a fome e a cama (prioridade 4).
// Uma moradora de Mênfis, com fome 100 e a vida em 40 e caindo, o armazém cheio, ficou assim diante de uma sucuri morta a
// 0,93 dela (o verificador acusou no meio da prova da casa: S2 fome). Agora quem busca um corpo caído onde os pés não vão
// fica no chão mais perto dele e o apanha dali, no alcance do golpe que o matou; o corpo fora desse alcance (no meio da água)
// fica onde está, e o caminho que acaba fora do alcance encerra a busca — ninguém espera parado.
// A mão da prova põe a pessoa na margem e o corpo no lugar do caso (o bicho morre pela porta do jogo, G.Animals.kill, pela
// mão dela) e dá a tarefa como o jogo dá: «fight» de prioridade 4 (a defesa), ou «hunt» de prioridade 1 (o caçador).
// c1 a sucuri morta na água rasa, a um braço da margem (o caso de Mênfis): a pele e a carne nas mãos, sem ficar parada;
// c2 o corpo fundo na casa d'água (0,9 para dentro): apanhado da beira, no alcance do golpe;
// c3 o corpo no meio da água (nenhum chão em volta): a busca acaba na hora, o corpo fica sem dono;
// c4 o caso comum (o corpo em terra, a três casas): buscado como sempre;
// c5 o caçador (a tarefa «hunt» de prioridade 1) e a capivara morta na água: a carne nas mãos;
// c6 a mão do deus alaga o chão do corpo no meio da busca: apanhado da beira ou deixado — nunca a espera;
// c7 save e load no meio da busca: o corpo sem dono, o verificador limpo, ninguém parado;
// c8 com fome e de noite (Mênfis inteira): a pele em poucos segundos, depois come — a vida não cai;
// c9 a mão do deus alaga o chão do corpo e todo o chão em volta no meio da busca: o caminho acaba fora do alcance, e a busca
//    acaba ali — o corpo fica sem dono;
// e o verificador (o S2 novo: «parado diante de uma presa morta») calado em todos, e nenhum erro.
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const WORLD = process.argv[2] || 'cidade';
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const on = k => !ONLY || ONLY.includes(k);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | caca-margem ${name} | ${info}`); if (!c) fails.push(name); };
const Vg = G.Vg, W = G.W, A = G.Animals, T = G.T;
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
// (the sky held clear by the proof's hand, at every step: a storm puts every grown-up of the four towns under a roof —
// «shelter», 1,05, which also takes the hunter of priority 1 from his prey — and no one is free for the case; the history of
// now brought one before c8, T-868. The case is the body where the feet do not go, not the weather)
const step0 = G.debug.step; G.debug.step = dt => { const w = G.S && G.S.weather; if (w) { w.storm = 0; w.rain = 0; } return step0(dt); };
let S = M.pronto(WORLD);
const base = new Set(QA.check().filter(q => q.sev <= 2).map(q => q.sys + '|' + q.msg));
const novas = () => QA.check().filter(q => q.sev <= 2 && !base.has(q.sys + '|' + q.msg)).map(q => `[S${q.sev}] ${q.sys}: ${q.msg}`);
const free = v => v.age >= 18 && v.age < 58 && !v.captive && !v.jail && !v.aboard && !v.ug && !v.held && !v.air && !v.inside && v.hp > 70 && !(v.carry && v.carry.n > 1e-6) && !(v.task && (v.task.pri || 0) >= 2) && !(S.avatar && S.avatar.id === v.id) && !Vg.handsBusy(v) && !(G.War.threat && G.War.threat(v.set));
const wet = (x, y) => W.inb(x, y) && !W.walkableXY(x, y) && S.type[W.idx(x, y)] <= T.SEA;
const dry = (x, y) => W.walkableXY(x, y) && S.type[W.idx(x, y)] >= T.SAND && !S.occ[W.idx(x, y)] && !(S.fire[W.idx(x, y)] > 0);
const used = new Set();

// a straight bank near a town: a tile of ground (gx, gy) with three rows of water in front of it (dx, dy), three tiles wide —
// the only ground beside the first tile of water is the row of the bank itself —, and three tiles of ground behind it
function banks() {
  const out = [];
  for (const set of S.settlements.values()) {
    if (!G.Fac.get(set.fac) || G.Village.pop(set.id) < 8) continue;
    for (let gy = Math.floor(set.cy) - 24; gy <= set.cy + 24; gy++) for (let gx = Math.floor(set.cx) - 24; gx <= set.cx + 24; gx++) {
      if (!W.inb(gx, gy) || !dry(gx, gy)) continue;
      for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
        const px = -dy, py = dx; let good = true;
        for (let r = 1; r <= 3 && good; r++) for (let s = -1; s <= 1; s++) if (!wet(gx + dx * r + px * s, gy + dy * r + py * s)) { good = false; break; }
        for (let r = 1; r <= 3 && good; r++) if (!dry(gx - dx * r, gy - dy * r)) good = false;
        // (for the flood of c9: a fourth tile of ground behind, and nothing built or grown on the nine tiles round the bank's)
        let clear = good && dry(gx - dx * 4, gy - dy * 4);
        for (let ay = -1; ay <= 1 && clear; ay++) for (let ax = -1; ax <= 1; ax++) { const i = W.idx(gx + ax, gy + ay); if (S.occ[i] || S.treeAt[i] || S.objAt[i] || S.wall[i] || S.road[i]) { clear = false; break; } }
        if (good) out.push({ set, gx, gy, dx, dy, px, py, clear, d: G.dist(gx, gy, set.cx, set.cy) });
      }
    }
  }
  return out.sort((a, b) => used.has(a.gx + ',' + a.gy) - used.has(b.gx + ',' + b.gy) || a.d - b.d || a.gx - b.gx || a.gy - b.gy);
}
// a free adult of the bank's town who walks to it; the hand puts them on the bank, awake and fed
function person(bk, role) {
  const list = [...S.villagers.values()].filter(v => v.set === bk.set.id && free(v) && !used.has('v' + v.id) && (!role || v.role === role) && W.reaches(v, bk.gx + 0.5, bk.gy + 0.5)).sort((a, b) => a.id - b.id);
  return list[0] || null;
}
function stage(role, clear) {
  for (const bk of banks()) { if (clear && !bk.clear) continue; const v = person(bk, role); if (v) { used.add(bk.gx + ',' + bk.gy); used.add('v' + v.id); return { bk, v }; } }
  return null;
}
function put(v, x, y) { god(() => { Vg.endTask(v); v.sleeping = false; v.x = x; v.y = y; v.path = null; v.hunger = Math.min(v.hunger, 20); v.energy = Math.max(v.energy, 80); v.carry = null; }); }
// the beast dead at (x, y) by this person's hand, and the task the game gives: the defender's fight (4) or the hunter's (1)
function slain(v, kind, x, y, hunt) {
  return god(() => { const a = A.spawn(kind, x, y, { morph: null }); A.kill(a, v); if (hunt) a.claim = v.id; Vg.setTask(v, hunt ? { type: 'hunt', id: a.id, pri: 1, rt: 0 } : { type: 'fight', id: a.id, pri: 4, rt: 0 }); return a; });
}
const onIt = (v, a) => !!(v.task && (v.task.type === 'hunt' || v.task.type === 'fight') && v.task.id === a.id);
// lives the fetch: until the task on this body ends (or `max` seconds); the longest the person stood still out of reach with
// the task alive and no skinning going on, and what the verifier said on the way
function fetch(v, a, max) {
  let still = 0, worst = 0, t = 0, skin = 9; const said = new Set();
  for (; t < max && onIt(v, a); t += 0.25) {
    M.viver(0.25);
    if (onIt(v, a) && v.act === 'skin') skin = Math.min(skin, G.dist(v.x, v.y, a.x, a.y));
    const idle = onIt(v, a) && !v.moving && v.act !== 'skin' && G.dist(v.x, v.y, a.x, a.y) > 0.8;
    still = idle ? still + 0.25 : 0; if (still > worst) worst = still;
    if (Math.round(t * 4) % 8 === 0) for (const q of novas()) said.add(q);
  }
  for (const q of novas()) said.add(q);
  return { t, worst, skin, said: [...said], over: !onIt(v, a) };
}
const hands = v => (v.carry && v.carry.n > 1e-6 ? `${v.carry.n} de ${v.carry.k}${v.carry.meat ? ' (' + v.carry.meat + ')' : ''}${v.carry.extra ? ' + ' + Object.keys(v.carry.extra).join(', ') : ''}` : 'nada');
const none = name => ok(name, false, 'nenhuma margem reta perto de uma cidade com um adulto livre que chegue a ela');
S.time = 0.3;

// ---------------------------------------------------------------- c1
if (on('c1')) {
  const st = stage();
  if (!st) none('c1 a sucuri morta na água rasa, a um braço da margem');
  else {
    const { bk, v } = st; S.time = 0.3;
    put(v, bk.gx + 0.5, bk.gy + 0.5);
    // (Mênfis: the body 0.94 ahead and 0.24 to the side — 0.97 from her, 0.44 into the water)
    const a = slain(v, 'anaconda', bk.gx + 0.5 + bk.dx * 0.94 + bk.px * 0.24, bk.gy + 0.5 + bk.dy * 0.94 + bk.py * 0.24);
    const d0 = G.dist(v.x, v.y, a.x, a.y);
    const r = fetch(v, a, 60);
    const got = !!(v.carry && v.carry.k === 'food' && v.carry.meat === 'anaconda' && v.carry.extra && v.carry.extra.couro_exotico > 0);
    ok('c1 a sucuri morta na água rasa, a um braço da margem', r.over && got && a.skinned === true && r.worst <= 1.5 && !W.walkableXY(a.x, a.y) && W.walkableXY(v.x, v.y) && !r.said.length,
      `${v.name}, de ${bk.set.name}, a ${d0.toFixed(2)} do corpo (em água, ${(0.44).toFixed(2)} para dentro): ${r.over ? 'a busca acabou em ' + r.t.toFixed(1) + ' s' : 'a busca NÃO acabou em 60 s'}; nas mãos ${hands(v)}; esfolada ${a.skinned === true}; sem se mexer no máximo ${r.worst.toFixed(2)} s; os pés em terra ${W.walkableXY(v.x, v.y)}; verificador ${r.said.join(' | ') || 'limpo'}`);
  }
}

// ---------------------------------------------------------------- c2
if (on('c2')) {
  const st = stage();
  if (!st) none('c2 o corpo fundo na casa d\'água: apanhado da beira');
  else {
    const { bk, v } = st; S.time = 0.3;
    put(v, bk.gx + 0.5, bk.gy + 0.5);
    // (0.9 into the tile of water: no ground within 0.8 of it — the edge of the bank is 1.02 away)
    const a = slain(v, 'anaconda', bk.gx + 0.5 + bk.dx * 1.4, bk.gy + 0.5 + bk.dy * 1.4);
    const r = fetch(v, a, 60);
    const got = !!(v.carry && v.carry.k === 'food' && v.carry.meat === 'anaconda');
    const dEnd = G.dist(v.x, v.y, a.x, a.y);
    ok('c2 o corpo fundo na casa d\'água: apanhado da beira', r.over && got && a.skinned === true && r.worst <= 1.5 && dEnd > 0.8 && dEnd <= 1.2 + 1e-6 && W.walkableXY(v.x, v.y) && !r.said.length,
      `${v.name}, de ${bk.set.name}: o corpo 0,90 para dentro da água; ${r.over ? 'a busca acabou em ' + r.t.toFixed(1) + ' s' : 'a busca NÃO acabou em 60 s'}, a pessoa a ${dEnd.toFixed(2)} do corpo (mais de 0,8, dentro do alcance do golpe, 1,2), os pés em terra ${W.walkableXY(v.x, v.y)}; nas mãos ${hands(v)}; sem se mexer no máximo ${r.worst.toFixed(2)} s; verificador ${r.said.join(' | ') || 'limpo'}`);
  }
}

// ---------------------------------------------------------------- c3
if (on('c3')) {
  const st = stage();
  if (!st) none('c3 o corpo no meio da água: a busca acaba na hora');
  else {
    const { bk, v } = st; S.time = 0.3;
    put(v, bk.gx + 0.5, bk.gy + 0.5);
    // (the middle of the second row of water: the eight tiles round it are water)
    const a = slain(v, 'anaconda', bk.gx + 0.5 + bk.dx * 2, bk.gy + 0.5 + bk.dy * 2);
    const r = fetch(v, a, 30);
    const still = S.animals.get(a.id);
    ok('c3 o corpo no meio da água: a busca acaba na hora', r.over && r.t <= 1.01 && !(v.carry && v.carry.n > 0) && !!still && still.dead && !still.claim && !still.skinned && !r.said.length,
      `${v.name}, de ${bk.set.name}: o corpo a duas casas da margem, só água em volta; ${r.over ? 'a busca acabou em ' + r.t.toFixed(2) + ' s' : 'a busca NÃO acabou em 30 s'}; nas mãos ${hands(v)}; o corpo ${still ? 'fica onde caiu, dono ' + (still.claim || 'nenhum') : 'SUMIU'}; a pessoa agora: ${v.task ? v.task.type : 'livre'}; verificador ${r.said.join(' | ') || 'limpo'}`);
  }
}

// ---------------------------------------------------------------- c4
if (on('c4')) {
  const st = stage();
  if (!st) none('c4 o caso comum: o corpo em terra');
  else {
    const { bk, v } = st; S.time = 0.3;
    put(v, bk.gx + 0.5, bk.gy + 0.5);
    const a = slain(v, 'anaconda', bk.gx + 0.5 - bk.dx * 3, bk.gy + 0.5 - bk.dy * 3);
    const r = fetch(v, a, 60); const near = r.skin;
    const got = !!(v.carry && v.carry.k === 'food' && v.carry.meat === 'anaconda' && v.carry.extra && v.carry.extra.couro_exotico > 0);
    ok('c4 o caso comum: o corpo em terra', r.over && got && a.skinned === true && near <= 0.8 && r.worst <= 1.5 && !r.said.length,
      `${v.name}, de ${bk.set.name}: o corpo em terra a três casas; ${r.over ? 'a busca acabou em ' + r.t.toFixed(1) + ' s' : 'a busca NÃO acabou em 60 s'}; esfolou a ${near.toFixed(2)} do corpo (até 0,8); nas mãos ${hands(v)}; sem se mexer no máximo ${r.worst.toFixed(2)} s; verificador ${r.said.join(' | ') || 'limpo'}`);
  }
}

// ---------------------------------------------------------------- c5
if (on('c5')) {
  const st = stage('cacador') || stage();
  if (!st) none('c5 o caçador e a capivara morta na água');
  else {
    const { bk, v } = st; S.time = 0.3;
    put(v, bk.gx + 0.5, bk.gy + 0.5);
    const a = slain(v, 'capybara', bk.gx + 0.5 + bk.dx * 1.4, bk.gy + 0.5 + bk.dy * 1.4, true);
    const r = fetch(v, a, 60);
    const got = !!(v.carry && v.carry.k === 'food' && v.carry.meat === 'capybara' && v.carry.n >= 1);
    ok('c5 o caçador e a capivara morta na água', r.over && got && r.worst <= 1.5 && W.walkableXY(v.x, v.y) && !r.said.length,
      `${v.name} (${v.role || 'sem ofício'}), de ${bk.set.name}, com a tarefa do caçador (prioridade 1): a capivara 0,90 para dentro da água; ${r.over ? 'a busca acabou em ' + r.t.toFixed(1) + ' s' : 'a busca NÃO acabou em 60 s'}; nas mãos ${hands(v)}; sem se mexer no máximo ${r.worst.toFixed(2)} s; verificador ${r.said.join(' | ') || 'limpo'}`);
  }
}

// ---------------------------------------------------------------- c6
if (on('c6')) {
  const st = stage();
  if (!st) none('c6 a mão do deus alaga o chão do corpo no meio da busca');
  else {
    const { bk, v } = st; S.time = 0.3;
    // the person three tiles inland, the body on the bank; the way half walked, the god turns the bank's tile into water
    put(v, bk.gx + 0.5 - bk.dx * 3, bk.gy + 0.5 - bk.dy * 3);
    const a = slain(v, 'anaconda', bk.gx + 0.5, bk.gy + 0.5);
    let t0 = 0; for (; t0 < 20 && onIt(v, a) && G.dist(v.x, v.y, a.x, a.y) > 1.8; t0 += 0.25) M.viver(0.25);
    const mid = G.dist(v.x, v.y, a.x, a.y), was = S.type[W.idx(a.x, a.y)];
    god(() => { S.type[W.idx(a.x, a.y)] = T.SEA; S.typeVer++; W.invalidateLand(); });
    const r = fetch(v, a, 60);
    const got = !!(v.carry && v.carry.k === 'food' && v.carry.meat === 'anaconda');
    const body = S.animals.get(a.id);
    ok('c6 a mão do deus alaga o chão do corpo no meio da busca', onItWas(mid) && r.over && r.worst <= 1.5 && W.walkableXY(v.x, v.y) && (got || (body && !body.claim)) && !r.said.length,
      `${v.name}, de ${bk.set.name}, a ${mid.toFixed(2)} do corpo quando o chão dele virou água (era ${was}): ${r.over ? 'a busca acabou em ' + r.t.toFixed(1) + ' s' : 'a busca NÃO acabou em 60 s'} — ${got ? 'apanhado da beira: ' + hands(v) : 'deixado onde está, sem dono'}; sem se mexer no máximo ${r.worst.toFixed(2)} s; os pés em terra ${W.walkableXY(v.x, v.y)}; verificador ${r.said.join(' | ') || 'limpo'}`);
    god(() => { S.type[W.idx(bk.gx + 0.5, bk.gy + 0.5)] = was; S.typeVer++; W.invalidateLand(); });
  }
}
function onItWas(mid) { return mid <= 2.2 && mid > 0.8; }

// ---------------------------------------------------------------- c7
if (on('c7')) {
  const st = stage();
  if (!st) none('c7 save e load no meio da busca');
  else {
    const { bk, v } = st; S.time = 0.3; const vid = v.id;
    put(v, bk.gx + 0.5 - bk.dx * 3, bk.gy + 0.5 - bk.dy * 3);
    const a = slain(v, 'anaconda', bk.gx + 0.5 + bk.dx * 1.4, bk.gy + 0.5 + bk.dy * 1.4); const aid = a.id;
    for (let t = 0; t < 1.5; t += 0.25) M.viver(0.25);
    const during = onIt(v, a);
    M.salvarCarregar(); S = G.S;
    const v2 = S.villagers.get(vid), a2 = S.animals.get(aid);
    const q0 = novas();
    let worst = 0, still = 0; for (let t = 0; t < 40; t += 0.25) { M.viver(0.25); const idle = v2.task && (v2.task.type === 'hunt' || v2.task.type === 'fight') && v2.task.id === aid && !v2.moving && v2.act !== 'skin'; still = idle ? still + 0.25 : 0; if (still > worst) worst = still; }
    const q1 = novas(); const b2 = S.animals.get(aid);
    ok('c7 save e load no meio da busca', during && !!v2 && !!a2 && a2.dead && (!a2.claim || (S.villagers.get(a2.claim) && S.villagers.get(a2.claim).task && S.villagers.get(a2.claim).task.id === aid)) && worst <= 1.5 && !q0.length && !q1.length,
      `${v2 ? v2.name : '?'}: a busca viva no save ${during}; depois do load o corpo ${a2 ? (a2.dead ? 'morto' : 'VIVO') + ', dono ' + (a2.claim || 'nenhum') : 'SUMIU'}; 40 s depois ${b2 ? 'o corpo fica (dono ' + (b2.claim || 'nenhum') + ')' : 'o corpo foi levado'}, a pessoa ${v2 && v2.task ? v2.task.type : 'livre'}, sem se mexer diante dele no máximo ${worst.toFixed(2)} s; verificador ${q0.concat(q1).join(' | ') || 'limpo'}`);
  }
}

// ---------------------------------------------------------------- c8
if (on('c8')) {
  const st = stage();
  if (!st) none('c8 com fome e de noite: depois da pele, come');
  else {
    const { bk, v } = st;
    put(v, bk.gx + 0.5, bk.gy + 0.5);
    god(() => { S.time = 0.9; v.hunger = 96; v.energy = 10; });
    const hp0 = v.hp;
    const a = slain(v, 'anaconda', bk.gx + 0.5 + bk.dx * 0.94 + bk.px * 0.24, bk.gy + 0.5 + bk.dy * 0.94 + bk.py * 0.24);
    const r = fetch(v, a, 60);
    // the day after the fetch: the hide home, and a meal
    let ate = false, tasks = []; for (let t = 0; t < 150 && !ate; t += 0.5) { M.viver(0.5); if (v.task && tasks[tasks.length - 1] !== v.task.type) tasks.push(v.task.type); if (v.hunger < 60) ate = true; }
    const alive = S.villagers.has(v.id) && v.hp > 0;
    ok('c8 com fome e de noite: depois da pele, come', r.over && r.t <= 30 && alive && ate && v.hp >= hp0 - 2 && !r.said.length && !novas().length,
      `${v.name}, de ${bk.set.name}, fome 96 e sono, de noite: ${r.over ? 'a busca acabou em ' + r.t.toFixed(1) + ' s' : 'a busca NÃO acabou em 60 s'} (${hands(v)} na hora); depois: ${tasks.slice(0, 8).join(' → ') || 'nada'}; ${ate ? 'comeu (fome ' + v.hunger.toFixed(0) + ')' : 'NÃO comeu (fome ' + v.hunger.toFixed(0) + ')'}; vida ${hp0.toFixed(0)} → ${v.hp.toFixed(0)}; verificador ${r.said.concat(novas()).join(' | ') || 'limpo'}`);
  }
}

// ---------------------------------------------------------------- c9
if (on('c9')) {
  const st = stage(null, true);
  if (!st) ok('c9 o chão em volta do corpo alagado no meio da busca: a busca acaba', false, 'nenhuma margem reta e limpa (nove casas sem nada construído nem plantado, quatro de chão atrás) perto de uma cidade');
  else {
    const { bk, v } = st; S.time = 0.3;
    put(v, bk.gx + 0.5 - bk.dx * 4, bk.gy + 0.5 - bk.dy * 4);
    const a = slain(v, 'anaconda', bk.gx + 0.5, bk.gy + 0.5);
    let t0 = 0; for (; t0 < 20 && onIt(v, a) && G.dist(v.x, v.y, a.x, a.y) > 2.9; t0 += 0.25) M.viver(0.25);
    const mid = G.dist(v.x, v.y, a.x, a.y);
    // the nine tiles round the body — nobody on them
    const tiles = []; for (let ay = -1; ay <= 1; ay++) for (let ax = -1; ax <= 1; ax++) tiles.push(W.idx(bk.gx + ax, bk.gy + ay));
    const onThem = [...S.villagers.values()].filter(o => tiles.includes(W.idx(o.x, o.y)));
    const was = tiles.map(i => S.type[i]);
    god(() => { for (const i of tiles) if (S.type[i] > T.SEA) S.type[i] = T.SEA; S.typeVer++; W.invalidateLand(); });
    const r = fetch(v, a, 60); const body = S.animals.get(a.id);
    ok('c9 o chão em volta do corpo alagado no meio da busca: a busca acaba', !onThem.length && mid > 2.2 && r.over && r.worst <= 1.5 && W.walkableXY(v.x, v.y) && !(v.carry && v.carry.n > 0) && !!body && !body.claim && !body.skinned && !r.said.length,
      `${v.name}, de ${bk.set.name}, a ${mid.toFixed(2)} do corpo quando as nove casas em volta dele viraram água${onThem.length ? ' (COM ' + onThem.length + ' pessoa(s) em cima)' : ''}: ${r.over ? 'a busca acabou em ' + r.t.toFixed(1) + ' s' : 'a busca NÃO acabou em 60 s'}, a ${G.dist(v.x, v.y, a.x, a.y).toFixed(2)} do corpo; nas mãos ${hands(v)}; o corpo ${body ? 'fica, dono ' + (body.claim || 'nenhum') : 'SUMIU'}; sem se mexer no máximo ${r.worst.toFixed(2)} s; os pés em terra ${W.walkableXY(v.x, v.y)}; verificador ${r.said.join(' | ') || 'limpo'}`);
    god(() => { tiles.forEach((i, k) => { S.type[i] = was[k]; }); S.typeVer++; W.invalidateLand(); });
  }
}

ok('nenhum erro', M.limpo(), M.limpo() ? 'nenhum erro de módulo, nenhum aviso' : JSON.stringify(M.erros()).slice(0, 300));
console.log(fails.length ? `\ncaca-margem: ${fails.length} falha(s): ${fails.join(', ')}` : '\ncaca-margem: tudo passou');
process.exit(fails.length ? 1 : 0);
