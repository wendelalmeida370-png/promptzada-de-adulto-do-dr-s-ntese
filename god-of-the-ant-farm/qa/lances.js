// lances: o cenário do L-195 — a porta só fica onde o lance de entrada dela cabe (G.Space.entryFits: degraus que os pés
// sobem, de um chão aonde o mundo anda um passo antes do pé). Quem escolhe o lado é o registro, no passo do mundo — a
// fundação, a virada do dia, a reforma —; a planta nunca lê o mundo. Cada caso provocado de propósito, e nunca vazio (num
// mundo sem um prédio que sirva, o caso faz o seu):
//   1. o mundo como abre: depois da virada do dia, toda entrada cabe, ou não cabe em lado nenhum aberto — as que não cabiam
//      foram para o primeiro lado onde cabem, e nenhum outro registro mudou;
//   2. um muro toma a rua por onde os degraus desciam, e o lado continua aberto noutra casa (a regra de antes não mudava a
//      porta): a entrada deixa de caber; um save no meio; na virada, a porta vai a um lado onde cabe, e quem estava dentro
//      sai por ela;
//   3. a fundação num lote cujo primeiro lado aberto dá num barranco (o deus ergueu o lote e o norte, o sul ficou embaixo):
//      a porta nasce no primeiro lado onde a entrada cabe;
//   4. em lado nenhum cabe (o deus ergueu só o lote): a porta fica no primeiro lado aberto, a virada não a muda, e o
//      verificador sabe que não havia outro lado;
//   5. a reforma do deus para um lado onde a entrada não cabe é recusada e não muda nada, nem a família pedida junto;
//   6. o verificador vê uma virada que errou (a pergunta trocada por uma que diz que nada cabe);
//   7. uma árvore crescida no caminho dos degraus que entram na rua (L-197, L-206): ela nasce, cresce um décimo ou é cortada
//      depois da virada, e o verificador não chama isso de virada errada — a palavra dela era para outro chão —; um save no
//      meio; a virada seguinte leva a porta a um lado onde cabe; a árvore cortada deixa a porta onde está (D-060); e uma porta
//      sem outro lado: com a árvore, fica, e a virada diz que não cabe; sem ela, cabe de novo;
//   8. a rua tomada diante de uma porta (L-207): um prédio fundado na casa da frente — a porta do vizinho muda na própria
//      fundação, não na virada —, com save no meio, e o chão que volta (o prédio novo desfeito: a porta fica onde está, D-060);
//      e um degrau de um lance de lado sobre chão que o mundo não anda: a entrada não cabe, e a virada a muda; e uma obra
//      cuja rua é tomada antes de ficar pronta: a fundação ao lado, um save e a virada passam por ela; pronta, a porta
//      dela é julgada na hora; e um penhasco sob o meio do patamar, fora do lote (L-208): a entrada não cabe, a virada a
//      muda, e sem o penhasco ela fica onde está;
//   9. a porta da frente dos prédios de trabalho (L-209): todos com ela diante de um chão que se anda (ou sem lado onde
//      caiba), e a porta das pessoas é a da planta; e um muro diante da casa da porta, outra casa do lado aberta: a virada a
//      leva a um chão que se anda;
//  11. a porta diante de um bolsão (L-216): o primeiro lado aberto dá para uma casa fechada em volta — a cabana de
//      Tenochtitlan cuja família morreu de fome a dois passos do armazém —: a fundação põe a porta no primeiro lado que dá
//      para a rua; a rua de uma porta fechada num bolsão: até a virada o passo não a usa, um save no meio, alguém dentro, e
//      a virada a leva à rua, por onde ele sai; o verificador vê uma virada que a deixou no bolsão, e uma porta num bolsão há
//      dois dias; e um registro de antes (v 2) com a porta no bolsão e a família presa nele (o save de antes guardava quem
//      estava dentro na porta de então), julgado ao abrir: a porta vai à rua, e a família sai por ela;
//  10. salvar e carregar: os mesmos lados e as mesmas portas, e a virada seguinte não muda nada.
// (os casos 8b e 8d, num mundo sem um lance de lado que sirva, fazem o seu: um armazém num lote inclinado pelo deus, T-117)
// O verificador limpo, nenhum erro de módulo.
//   node qa/lances.js [mundo]
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['qa/interiores-inv.js'] }); const In = G.Interiors, W = G.W, T = G.T, Sp = G.Space;
const KEY = process.argv[2] || 'cidade';
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | lances ${name} | ${info}`); if (!c) fails.push(name); };
const near = (a, b) => !!a && !!b && Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6;
const f2 = p => (p ? p.map(n => n.toFixed(2)).join(',') : '-');
const sim = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
// (the turn of the day of the interiors alone — the doors, the records —: the world's clock stays where it is)
const turn = () => sim(() => In.onNewDay());
const qa = name => { const bad = QA.check().filter(q => q.sev <= 2 || q.sys === 'int'); ok(`${name} verificador`, !bad.length, bad.length ? bad.slice(0, 4).map(q => `S${q.sev} ${q.sys}: ${q.msg}`).join(' · ') : 'limpo'); };
const SIDES = ['S', 'E', 'W', 'N'];
const outside = (b, s, k) => s === 'S' ? [b.x + k + 0.5, b.y + b.h + 0.4] : s === 'N' ? [b.x + b.w - 1 - k + 0.5, b.y - 0.4] : s === 'E' ? [b.x + b.w + 0.4, b.y + b.h - 1 - k + 0.5] : [b.x - 0.4, b.y + k + 0.5];
const openT = (b, s) => { let m = 0; const n = s === 'S' || s === 'N' ? b.w : b.h; for (let k = 0; k < n; k++) { const p = outside(b, s, k); if (W.walkableXY(p[0], p[1])) m |= 1 << k; } return m; };
const bits = m => { let n = 0; for (; m; m >>= 1) n += m & 1; return n; };
const shutNow = b => { const m0 = openT(b, b.ip.s); return !(m0 & (b.ip.o || m0)) || !m0; };
const ready = () => [...G.S.buildings.values()].filter(b => b.built && b.type !== 'ruin' && b.ip && In.TYPES[b.ip.t]);
const entry = b => Sp.entryFits(b, In.shellOf(b));
const recOf = b => ({ s: b.ip.s, o: b.ip.o, r: b.ip.r, f: b.ip.f });
const sameRec = (a, b) => a.s === b.s && a.o === b.o && a.r === b.r && a.f === b.f;
// (the god's hand on the ground: vertices set to a height, walls laid — and what was there before, to put back; the ground's
// maps told, as the god's own powers tell them)
const V1 = () => G.N + 1;
function ground(set, walls) {
  return sim(() => {
    const S = G.S; const back = { H: [], walls: [] }; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (const [vx, vy, h] of set) { const k = vy * V1() + vx; back.H.push([vx, vy, S.H[k]]); S.H[k] = h; x0 = Math.min(x0, vx); y0 = Math.min(y0, vy); x1 = Math.max(x1, vx); y1 = Math.max(y1, vy); }
    for (const i of walls || []) { back.walls.push([i, S.wall[i]]); S.wall[i] = 1; }
    if (set.length) G.Relief.fixArea(x0 - 2, y0 - 2, x1 + 1, y1 + 1); S.typeVer = (S.typeVer || 0) + 1; W.invalidateLand(); W.touchWalk();
    return back;
  });
}
const unground = back => { ground(back.H, []); sim(() => { for (const [i, w] of back.walls) G.S.wall[i] = w; W.touchWalk(); }); };
const unwall = list => sim(() => { for (const i of list) G.S.wall[i] = 0; W.touchWalk(); });
M.pronto(KEY); In.uncache();
// (free lots of n by n tiles anywhere on the map, the nearest to the main town first, apart: the lot and the ring round it
// ground one walks with nothing on it — no building, wall, cliff, tree or stone —, the second ring with no building nor wall
// on it — the god's hand moves the vertices of the first and walls tiles of the second; the water or a cliff may be there, as
// on a small island —; with the height of the highest vertex of the lot and its ring)
function freeLots(n, max, also) {
  const S = G.S, N = G.N; const vH = (vx, vy) => S.H[vy * V1() + vx]; const set0 = G.Village.mainSettlement(); const cx = set0 ? set0.cx : N / 2, cy = set0 ? set0.cy : N / 2; const cands = [];
  for (let y = 3; y + n + 3 < N; y++) for (let x = 3; x + n + 3 < N; x++) { let good = true;
    for (let ty = y - 2; ty <= y + n + 1 && good; ty++) for (let tx = x - 2; tx <= x + n + 1; tx++) { const i = ty * N + tx; const ring = Math.max(tx < x ? x - tx : tx >= x + n ? tx - x - n + 1 : 0, ty < y ? y - ty : ty >= y + n ? ty - y - n + 1 : 0);
      if (S.occ[i] || S.wall[i] || (ring <= 1 && (S.type[i] < T.SAND || S.cliff[i] || !W.walkable(i) || S.treeAt[i] || S.objAt[i]))) { good = false; break; } }
    if (good && (!also || also({ x, y }))) cands.push({ x, y, d: Math.hypot(x - cx, y - cy) }); }
  cands.sort((p, q) => p.d - q.d || p.y - q.y || p.x - q.x); const out = [];
  for (const { x, y } of cands) { if (out.length >= max) break; if (out.some(l => Math.abs(l.x - x) < n + 5 && Math.abs(l.y - y) < n + 5)) continue; let hi = -1e9; for (let vy = y - 1; vy <= y + n + 1; vy++) for (let vx = x - 1; vx <= x + n + 1; vx++) hi = Math.max(hi, vH(vx, vy)); out.push({ x, y, base: hi, set: (G.Village.nearestSettlement(x, y) || set0 || {}).id }); }
  return out;
}
// (a world with no free lot that serves — small islands taken by their towns —: the god raises land from the sea by the game's
// own power, G.Powers.reshape, in the open water nearest the main town, and lays its middle flat; twice at most)
const raised = [];
function newLand() {
  if (raised.length >= 2) return false; const S = G.S, N = G.N; const set0 = G.Village.mainSettlement(); const cx = set0 ? set0.cx : N / 2, cy = set0 ? set0.cy : N / 2;
  let best = null, bd = 1e9;
  for (let y = 10; y < N - 10; y++) for (let x = 10; x < N - 10; x++) { const d = Math.hypot(x - cx, y - cy); if (d >= bd) continue; let all = true;
    for (let ty = y - 7; ty <= y + 7 && all; ty++) for (let tx = x - 7; tx <= x + 7; tx++) { const i = ty * N + tx; if (S.type[i] > T.SEA || S.occ[i]) { all = false; break; } }
    if (all) { best = [x, y]; bd = d; } }
  if (!best) return false;
  sim(() => G.Powers.reshape(best[0] + 0.5, best[1] + 0.5, 5.5, +1, { peak: 0.6, hill: 0 }));
  let hi = -1e9; const set = []; for (let vy = best[1] - 3; vy <= best[1] + 4; vy++) for (let vx = best[0] - 3; vx <= best[0] + 4; vx++) hi = Math.max(hi, S.H[vy * V1() + vx]);
  for (let vy = best[1] - 3; vy <= best[1] + 4; vy++) for (let vx = best[0] - 3; vx <= best[0] + 4; vx++) set.push([vx, vy, hi]);
  ground(set, []); raised.push([best[0], best[1]]);
  return true;
}
const landNote = () => (raised.length ? ` (no chão que o deus ergueu do mar em ${raised[raised.length - 1].join(',')}: este mundo não tinha lote livre que servisse)` : '');

// ---- 1. the world as it opens: after the turn of the day, every way in fits, or fits on no side open ----
{
  const before = new Map(); let nNot = 0;
  for (const b of ready()) { const e = entry(b); before.set(b.id, { k: In.keyOf(b), fit: e.ok, shut: shutNow(b) }); if (!e.ok && !shutNow(b)) nNot++; }
  turn();
  let moved = 0, kept = 0, same = 0; const wrong = [];
  for (const b of ready()) {
    const a = before.get(b.id); if (!a || a.shut) continue; const changed = In.keyOf(b) !== a.k;
    if (a.fit) { if (changed) wrong.push(`#${b.id} ${b.type}: cabia e mudou`); else same++; continue; }
    if (changed) { moved++; if (!entry(b).ok) wrong.push(`#${b.id} ${b.type}: mudou para ${b.ip.s} e não cabe lá`); }
    else { kept++; const to = In.fitSide(b); if (to) wrong.push(`#${b.id} ${b.type}: ficou onde não cabe, e cabe em ${to.s}`); }
  }
  ok('o mundo como abre', !wrong.length && same + moved + kept > 0, `${before.size} prédios prontos: ${same} entradas cabiam e ficaram; das ${nNot} que não cabiam, ${moved} foram para um lado onde cabem e ${kept} ficaram (em lado nenhum aberto cabe)${wrong.length ? ' — ' + wrong.slice(0, 3).join(' · ') : ''}`);
}
qa('na virada');

// ---- 2. a wall takes the street the steps went down: the way in no longer fits; a save in the middle; the turn moves the door ----
let moved2 = null;
{
  // (a building whose way in fits, with steps — a door with none has no foot to take —, the street before its door open, and
  // its side open on another tile: the wall closes that tile alone, and the rule of before would keep the door there)
  let b = null, i = -1, e0 = null, tried = 0; const home = c => In.TYPES[c.type].use === 'casa' ? 1 : 0;
  for (const c of ready().sort((p, q) => home(q) - home(p) || p.id - q.id)) {
    if (!c.blocks || tried >= 200) continue; const e = entry(c); if (!e.ok || e.kind === 'nenhum') continue;
    const pd = sim(() => In.planDoor(c)); if (!pd) continue; const j = W.idx(pd[0], pd[1]); if (!W.walkable(j) || bits(openT(c, c.ip.s)) < 2) continue;
    tried++; ground([], [j]);
    if (!shutNow(c) && !entry(c).ok && In.fitSide(c)) { b = c; i = j; e0 = e; break; }
    unwall([j]);
  }
  if (!b) ok('um muro toma a rua da entrada', false, `nenhum prédio deste mundo com degraus, outra casa aberta no lado da porta e um lado onde a entrada cabe (${tried} tentados)`);
  else {
    const e1 = entry(b), r0 = recOf(b); const id = b.id;
    // (someone inside when the door moves: one who lives or works there, or anyone of the town)
    const free = v => !v.jail && !v.aboard && !v.captive && v.age >= 16 && !(G.S.avatar && G.S.avatar.id === v.id);
    const v0 = [...G.S.villagers.values()].find(v => free(v) && (v.home === b.id || v.job === b.id)) || [...G.S.villagers.values()].find(v => free(v) && v.set === b.set);
    ok('um muro toma a rua da entrada', !shutNow(b) && !e1.ok, `${b.type}#${id}: a entrada ${e0.kind} cabia; o muro na casa da porta (o lado ${b.ip.s} segue aberto: ${bits(openT(b, b.ip.s))} casas, e a regra de antes não mudava a porta) — agora ${e1.kind}, o pé a ${e1.foot} m, chão ${e1.ground ? 'sim' : 'não'}`);
    M.salvarCarregar(); In.uncache();
    b = G.S.buildings.get(id); const v = v0 && G.S.villagers.get(v0.id);
    ok('salvar e carregar no meio', !!b && sameRec(recOf(b), r0) && G.S.wall[i] === 1 && !entry(b).ok, 'o registro e o muro como estavam, e a entrada ainda não cabe');
    // (inside when the turn comes — put in after the load: the load takes out whoever is in a building with nothing to do there)
    if (v) sim(() => { G.Vg.endTask(v); G.Vg.setTask(v, { type: 'idle', wait: 5, pri: 0.3 }); v.inside = id; });
    turn();
    const ref = b.ip.h[b.ip.h.length - 1]; const p = In.plan(b); const pd = sim(() => In.planDoor(b)); const e2 = entry(b);
    ok('a virada muda a porta', b.ip.s + b.ip.o !== r0.s + r0.o && b.ip.r === r0.r + 1 && ref[1] === 'reforma' && /^porta /.test(ref[2] || '') && e2.ok && p && p.ok && pd && near(G.Vg.door(b), pd), `o lado ${r0.s}/${r0.o} → ${b.ip.s}/${b.ip.o}, o fato ${JSON.stringify(ref)}; a entrada ${e2.kind}, o pé a ${e2.foot} m; a planta ${p && p.ok ? 'válida' : 'INVÁLIDA'}; quem sai sai em ${f2(G.Vg.door(b))}, a porta da planta ${f2(pd)}`);
    if (v) sim(() => G.Vg.endTask(v)); ok('quem estava dentro sai pela porta nova', !!v && !v.inside && near([v.x, v.y], pd), v ? `${v.name} saiu em ${f2([v.x, v.y])}` : 'ninguém dentro');
    moved2 = { id, s: b.ip.s, o: b.ip.o };
  }
}

// ---- 3 and 4. the founding: a lot the god raised — with the north, the south left below; or alone ----
// (an empty lot of dry ground, with no building in the way three tiles out: the god's hand sets it a slope of DH over a tile
// above the street, and walls the second ring, so no flight runs on into the street past the slope)
const TYPE = 'house'; const D = G.BDEF[TYPE];
const lots = [];
{
  const S = G.S, N = G.N; const vH = (vx, vy) => S.H[vy * V1() + vx];
  const set0 = G.Village.mainSettlement(); const cx = set0 ? set0.cx : N / 2, cy = set0 ? set0.cy : N / 2;
  // (the nearest to the main town first, anywhere on the map: a dense town has its empty ground at its edges)
  const cands = [];
  for (let y = 4; y + D.h + 4 < N; y++) for (let x = 4; x + D.w + 4 < N; x++) {
    // (the lot free; the ring round it ground one walks — a field or a square on it is no matter —; out to the third ring dry
    // land with no building that stands in the way: the god's hand moves the ground under them, and walls the second)
    let good = true;
    for (let ty = y - 3; ty <= y + D.h + 2 && good; ty++) for (let tx = x - 3; tx <= x + D.w + 2; tx++) {
      const i = ty * N + tx; const ring = Math.max(tx < x ? x - tx : tx >= x + D.w ? tx - x - D.w + 1 : 0, ty < y ? y - ty : ty >= y + D.h ? ty - y - D.h + 1 : 0);
      if (S.type[i] < T.SAND || W.blocked(i) || (ring === 0 && (S.occ[i] || S.wall[i] || S.cliff[i] || !W.walkable(i))) || (ring === 1 && (S.wall[i] || !W.walkable(i)))) { good = false; break; }
    }
    if (good) cands.push({ x, y, d: Math.hypot(x - cx, y - cy) });
  }
  cands.sort((p, q) => p.d - q.d || p.y - q.y || p.x - q.x);
  for (const { x, y } of cands) {
    if (lots.length >= 30) break; if (lots.some(l => Math.abs(l.x - x) < 9 && Math.abs(l.y - y) < 9)) continue;
    let hi = -1e9; for (let vy = y - 2; vy <= y + D.h + 2; vy++) for (let vx = x - 2; vx <= x + D.w + 2; vx++) hi = Math.max(hi, vH(vx, vy));
    lots.push({ x, y, base: hi, set: (G.Village.nearestSettlement(x, y) || set0 || {}).id });
  }
}
const DH = 2.75; // (a slope of 4 m over a tile — under a cliff, 2.8 —: more than the fourteen steps of 0.30 come down, on a tile of street)
const ring2 = (x, y) => { const N = G.N, out = []; for (let ty = y - 2; ty <= y + D.h + 1; ty++) for (let tx = x - 2; tx <= x + D.w + 1; tx++) if (tx < x - 1 || tx > x + D.w || ty < y - 1 || ty > y + D.h) out.push(ty * N + tx); return out; };
let built3 = null;
{
  // 3. the lot and the north raised, the south left below: S is open (its slope is ground one walks), and the way in does not fit there
  let b = null, why = 'nenhum lote vazio com o chão vazio em volta neste mundo';
  for (const L of lots) {
    // (the lot and the ground north, east and west of it at base + DH; the street south of it at base, a tile below)
    const set = []; for (let vy = L.y - 2; vy <= L.y + D.h + 1; vy++) for (let vx = L.x - 2; vx <= L.x + D.w + 2; vx++) set.push([vx, vy, vy <= L.y + D.h ? L.base + DH : L.base]);
    const walls = []; for (let tx = L.x - 2; tx <= L.x + D.w + 1; tx++) walls.push((L.y + D.h + 1) * G.N + tx);
    const back = ground(set, walls);
    const c = sim(() => G.Village.addBuilding(TYPE, L.x, L.y, L.set, true));
    const eS = openT(c, 'S') ? In.entryOn(c, 'S') : null; const first = SIDES.find(s => { const e = In.entryOn(c, s); return e && e.ok; });
    if (eS && !eS.ok && first && first !== 'S') { b = c; L.used = 1; built3 = { b, eS, first }; break; }
    why = `o lote ${L.x},${L.y} não fez um sul sem entrada (S ${eS ? (eS.ok ? 'cabe' : 'não cabe') : 'fechado'}; o primeiro onde cabe: ${first || 'nenhum'})`;
    sim(() => G.Village.removeBuilding(c)); unground(back);
  }
  if (!b) ok('a fundação num barranco', false, why);
  else {
    const p = In.plan(b); const eNow = entry(b);
    ok('a fundação num barranco', b.ip.s === built3.first && eNow.ok && p && p.ok, `${TYPE}#${b.id} em ${b.x},${b.y}: o primeiro lado aberto, S, dá num barranco (${built3.eS.kind}, o pé a ${built3.eS.foot} m); a porta nasce em ${b.ip.s}, o primeiro onde a entrada cabe (${eNow.kind}); a planta ${p && p.ok ? 'válida' : 'INVÁLIDA'}`);
  }
}
let alone = null;
{
  // 4. only the lot raised, the second ring walled: every side open, and the way in fits on none
  let b = null, why = 'nenhum lote vazio que sobrasse neste mundo';
  for (const L of lots) {
    if (L.used) continue;
    // (the lot at base + DH, the ring round it at base, a tile below on every side)
    const set = []; for (let vy = L.y - 1; vy <= L.y + D.h + 1; vy++) for (let vx = L.x - 1; vx <= L.x + D.w + 1; vx++) set.push([vx, vy, vx >= L.x && vx <= L.x + D.w && vy >= L.y && vy <= L.y + D.h ? L.base + DH : L.base]);
    const walls = ring2(L.x, L.y); const back = ground(set, walls);
    const c = sim(() => G.Village.addBuilding(TYPE, L.x, L.y, L.set, true));
    const open = SIDES.filter(s => openT(c, s)); const any = open.some(s => { const e = In.entryOn(c, s); return e && e.ok; });
    if (open.length === 4 && !any) { b = c; L.used = 1; break; }
    why = `o lote ${L.x},${L.y} não fez um prédio sem lado onde a entrada caiba (abertos: ${open.join('') || 'nenhum'}; ${any ? 'algum cabe' : 'nenhum cabe'})`;
    sim(() => G.Village.removeBuilding(c)); unground(back);
  }
  if (!b) ok('em lado nenhum cabe', false, why);
  else {
    const r0 = recOf(b); turn(); const e = entry(b);
    ok('em lado nenhum cabe', b.ip.s === 'S' && sameRec(recOf(b), r0) && !e.ok && In.entrySaid(b) === false && !In.fitSide(b), `${TYPE}#${b.id} em ${b.x},${b.y}: os quatro lados abertos, a entrada não cabe em nenhum (S: ${e.kind}, o pé a ${e.foot} m); a porta nasce em S, o primeiro aberto, e a virada não a muda`);
    alone = b;
  }
}
qa('as fundações');

// ---- 5. the god's renovation to a side where the way in does not fit: refused, and nothing changes ----
if (built3) {
  const b = built3.b; const r0 = recOf(b); const other = In.familiesFor(b.ip).ok.find(f => f !== b.ip.f);
  const a = sim(() => In.renovate(b, { side: 'S' })); const same1 = sameRec(recOf(b), r0);
  const c = other ? sim(() => In.renovate(b, { fam: other, side: 'S' })) : null; const same2 = sameRec(recOf(b), r0);
  const to = SIDES.find(s => s !== b.ip.s && openT(b, s) && (In.entryOn(b, s) || {}).ok);
  const d = to ? sim(() => In.renovate(b, { side: to })) : null;
  ok('a reforma para onde não cabe', !a.ok && a.why === 'a entrada não cabe desse lado' && same1 && (!c || (!c.ok && c.why === a.why)) && same2 && !!to && d.ok && b.ip.s === to && b.ip.r === r0.r + 1 && entry(b).ok, `para S: ${a.ok ? 'FEITA' : 'recusada (' + a.why + ')'}${same1 ? ', nada mudou' : ', MAS O REGISTRO MUDOU'}; com a família ${other || '-'} junto: ${c ? (c.ok ? 'FEITA' : 'recusada') : '-'}, a família ficou ${b.ip.f}${same2 ? '' : ' (O REGISTRO MUDOU)'}; para ${to || '-'}, onde cabe: ${d ? (d.ok ? 'feita' : 'recusada (' + d.why + ')') : '-'}`);
} else ok('a reforma para onde não cabe', false, 'sem o prédio do barranco (caso 3)');

// ---- 6. the checker sees a turn that judged wrong: the question swapped for one that says nothing fits ----
{
  const real = Sp.entryFits; let bad = [];
  try { Sp.entryFits = () => ({ ok: false, foot: 9, rise: 0, n: 1, kind: 'teste', ground: false, de: 'porta' }); turn(); } finally { Sp.entryFits = real; }
  bad = QA.check().filter(q => q.sys === 'int' && /disse que não cabia com o mesmo chão/.test(q.msg));
  turn(); const after = QA.check().filter(q => q.sys === 'int' && /a entrada|a porta ficou/.test(q.msg));
  ok('o verificador vê uma virada errada', bad.length > 0 && !after.length, `com a pergunta trocada, ${bad.length} queixas (${bad.slice(0, 1).map(q => q.msg).join('')}); com a pergunta de volta e a virada refeita, ${after.length}`);
}

// ---- 7. a tree on the way the steps run on into the street (L-197, L-206): the turn said; then a grown tree comes there, grows a
// tenth or is felled, and the way in is another — the checker, asking again before the next turn, never calls that a turn that
// judged wrong: its word was for other ground. A save in the middle; the next turn takes the door to a side where it fits; the
// tree felled, the door stays where it is (D-060). And a door with no other side open: with the tree it stays, and the turn
// says the way in does not fit; the tree felled, it fits again — and the checker, again, says nothing until the turn says it
{
  const Nat = G.Nature, TL = Sp.TILE;
  const raisedOf = c => { const l0 = c.levels.filter(l => l.kind !== 'porao' && l.kind !== 'terraco' && l.kind !== 'jirau').sort((a, d) => a.y - d.y)[0] || c.levels[0]; return !!l0 && (l0.kind === 'elevado' || c.shell.base === 'esteios'); };
  // (the steps before a building's way in, reckoned anew — the flight its entry's answer is from)
  const flightOf = b => { const c = In.shellOf(b); const en = c && c.entrance; const h = en && c.holes.find(q => q.door === en.door && q.kind !== 'janela'); const w = h && c.walls[h.wall]; if (!w) return null; const l = c.levels.find(q => q.lv === w.lv); return Sp.doorFlight(b, c.shell, { w: b.w * TL, d: b.h * TL }, w, h, l ? l.y : 0, raisedOf(c), undefined, undefined, true); };
  // (a grown oak on the line of the steps that run on into the street, halfway down them — or null where it cannot stand)
  const plantOn = b => { const fl = flightOf(b); if (!fl) return null; const far = fl.treads.filter(t => t.n > fl.room + 0.3); if (far.length < 2) return null; const q = fl.P(0, far[Math.floor(far.length / 2)].n); return sim(() => Nat.addTree(b.x + q[0] / TL, b.y + q[1] / TL, 'oak', 1.0)); };
  const fell = t => sim(() => { t.stage = 'log'; }); // (felled and lying: a log is no trunk in the way — Space.trunk)
  const unplant = t => sim(() => Nat.removeTree(t));
  const heardBad = () => QA.check().filter(q => q.sys === 'int' && /a entrada|a porta ficou/.test(q.msg));
  const sig = b => (Sp.treesAround ? Sp.treesAround(b) : null);
  const rua = c => { const e = entry(c); return e.ok && e.kind === 'rua' && e.de === 'porta'; };
  turn(); // (a word of the turn for every door, before any tree comes)
  // 7a. a building whose way in fits with steps into the street, where the oak on their line makes it not fit, and another side fits
  let A = null; const usedA = new Set();
  for (const c of ready()) { if (!c.blocks || !rua(c)) continue; usedA.add(c.id); const t = plantOn(c); if (!t) continue; if (!entry(c).ok && In.fitSide(c)) { A = { b: c, t }; break; } unplant(t); if (usedA.size > 120) break; }
  if (!A) ok('a árvore na rua dos degraus', false, `nenhum prédio deste mundo com degraus na rua onde um carvalho na linha deles tire a entrada e outro lado sirva (${usedA.size} tentados)`);
  else {
    const id = A.b.id, s0 = A.b.ip.s + '/' + A.b.ip.o, e1 = entry(A.b); const bad1 = heardBad();
    ok('a árvore na rua dos degraus', !e1.ok && !bad1.length && In.entrySaid(A.b) === undefined, `${A.b.type}#${id}, lado ${s0}: um carvalho no meio dos degraus da rua — a entrada não cabe mais (${e1.kind}, o pé a ${e1.foot} m); o verificador antes da virada: ${bad1.length ? bad1.length + ' queixas (' + bad1[0].msg + ')' : 'nada, a palavra da virada era para o chão sem a árvore'}`);
    M.salvarCarregar(); In.uncache(); let b = G.S.buildings.get(id); const tr = G.S.trees.get(A.t.id);
    ok('a árvore: salvar e carregar no meio', !!b && !!tr && b.ip.s + '/' + b.ip.o === s0 && !entry(b).ok, `a árvore ${tr ? 'lá' : 'SUMIU'}, o lado ${b ? b.ip.s + '/' + b.ip.o : '-'}, e a entrada ainda não cabe`);
    turn(); const e2 = entry(b); const ref = b.ip.h[b.ip.h.length - 1]; const s1 = b.ip.s + '/' + b.ip.o; const bad2 = heardBad();
    ok('a árvore: a virada muda a porta', s1 !== s0 && e2.ok && ref[1] === 'reforma' && In.entrySaid(b) === true && !bad2.length, `o lado ${s0} → ${s1}, o fato ${JSON.stringify(ref)}; a entrada ${e2.kind}; o verificador ${bad2.length ? bad2.length + ' queixas: ' + bad2[0].msg : 'limpo'}`);
    // (felled: the side of before would have its way in again — and the door stays where it is, where it fits: D-060)
    fell(tr); const back = In.entryOn(b, s0.split('/')[0]); const bad3 = heardBad(); turn(); const bad4 = heardBad();
    ok('a árvore cortada deixa a porta onde está', b.ip.s + '/' + b.ip.o === s1 && entry(b).ok && !bad3.length && !bad4.length, `a árvore cortada: no lado ${s0.split('/')[0]} a entrada ${back && back.ok ? 'caberia de novo' : 'ainda não caberia'}; a porta fica em ${b.ip.s}/${b.ip.o}, onde cabe; o verificador ${bad3.length + bad4.length ? 'QUEIXAS: ' + bad3.concat(bad4)[0].msg : 'limpo antes e depois da virada'}`);
    treeDoor = { id, s: b.ip.s, o: b.ip.o };
    // 7b. a tree come up a tenth about the door, after the turn said: the word is for other ground (and a sapling is no matter)
    // (on the first tile free round it, two tiles out at most — where the word's ground is: Space.treesAround)
    let small = null; for (let r = 1; r <= 2 && !small; r++) for (let y = b.y - r; y <= b.y + b.h - 1 + r && !small; y++) for (let x = b.x - r; x <= b.x + b.w - 1 + r && !small; x++) {
      if (Math.max(x < b.x ? b.x - x : x - b.x - b.w + 1, y < b.y ? b.y - y : y - b.y - b.h + 1) !== r || !W.inb(x, y)) continue; small = sim(() => Nat.addTree(x + 0.5, y + 0.5, 'oak', 0.44)); }
    if (!small) ok('a árvore que cresce um décimo', false, `nenhuma casa livre a duas casas de ${b.type}#${id}`);
    else {
      turn(); const said0 = In.entrySaid(b), g0 = sig(b); sim(() => { small.size = 0.47; }); const said1 = In.entrySaid(b), g1 = sig(b); sim(() => { small.size = 0.53; }); const said2 = In.entrySaid(b), g2 = sig(b);
      ok('a árvore que cresce um décimo', said0 === true && said1 === true && g1 === g0 && said2 === undefined && g2 !== g0, `a palavra da virada: ${said0}; a árvore de 0,44 a 0,47, no mesmo décimo: ${said1} (a assinatura ${g1 === g0 ? 'igual' : 'OUTRA'}); a 0,53, o décimo de cima: ${said2 === undefined ? 'a palavra é para outro chão' : said2} (a assinatura ${g2 !== g0 ? 'outra' : 'IGUAL'})`);
      unplant(small);
    }
  }
  // 7c. a door with no other side open: the oak on its steps, it stays and the turn says the way in does not fit; felled, it fits
  let B = null, walls = [];
  for (const c of ready()) {
    if (!c.blocks || (A && c.id === A.b.id) || !rua(c)) continue; const s0 = c.ip.s; const close = [];
    for (const sd of SIDES) { if (sd === s0) continue; const n = sd === 'S' || sd === 'N' ? c.w : c.h; for (let k = 0; k < n; k++) { const p = outside(c, sd, k); const i = W.idx(p[0], p[1]); if (W.inb(p[0], p[1]) && W.walkable(i)) close.push(i); } }
    ground([], close); if (!rua(c) || SIDES.some(sd => sd !== s0 && openT(c, sd))) { unwall(close); continue; }
    turn(); const t = plantOn(c); if (t && !entry(c).ok) { B = { b: c, t }; walls = close; break; } if (t) unplant(t); unwall(close);
  }
  if (!B) ok('a árvore numa porta sem outro lado', false, 'nenhum prédio deste mundo com degraus na rua onde um carvalho na linha deles tire a entrada');
  else {
    const b = B.b, r0 = recOf(b); const bad1 = heardBad(); turn(); const said1 = In.entrySaid(b), bad2 = heardBad();
    fell(B.t); const e3 = entry(b); const bad3 = heardBad(); turn(); const said3 = In.entrySaid(b);
    ok('a árvore numa porta sem outro lado', !bad1.length && said1 === false && !bad2.length && sameRec(recOf(b), r0) && e3.ok && !bad3.length && said3 === true, `${b.type}#${b.id}: os outros lados fechados (${walls.length} muros); com o carvalho a virada diz que a entrada ${said1 === false ? 'não cabe' : '?'} e a porta fica; cortado, a entrada cabe de novo (${e3.kind}) — o verificador, com o carvalho antes da virada: ${bad1.length ? 'QUEIXA: ' + bad1[0].msg : 'nada'}; depois dela: ${bad2.length ? 'QUEIXA: ' + bad2[0].msg : 'nada'}; cortado, antes da virada: ${bad3.length ? 'QUEIXA: ' + bad3[0].msg : 'nada'}; a virada seguinte diz que ${said3 === true ? 'cabe' : said3 === false ? 'NÃO CABE' : '?'}`);
    unwall(walls);
  }
}
qa('as árvores');

// ---- 8. the street taken before a door (L-207): a building founded on the tile before it — the neighbour's door moves at that
// founding, not at the next turn —, a save in the middle, and the ground come back (the new building undone: the door stays
// where it is, D-060); and a tread of a side flight over ground the world does not walk: the way in does not fit, and the
// turn moves the door; and a building at work whose street is taken: done, its door is judged then
let taken = null, atWork = null;
{
  const TL = Sp.TILE;
  const outOf = c => { const sh = In.shellOf(c); const e = sh && sh.entrance; return e && e.out ? [c.x + e.out[0] / TL, c.y + e.out[1] / TL] : null; };
  const freeTile = (x, y) => W.inb(x, y) && !G.S.occ[W.idx(x, y)] && !G.S.treeAt[W.idx(x, y)] && !G.S.objAt[W.idx(x, y)] && W.walkable(W.idx(x, y));
  const heardBad = () => QA.check().filter(q => q.sys === 'int' && /a entrada|a porta ficou/.test(q.msg));
  // 8a. a house founded on the tile before a door that has another side where it fits
  let A = null, tried = 0;
  for (const c of ready()) {
    if (!c.blocks || !entry(c).ok || tried >= 60) continue; const d = outOf(c); if (!d) continue; const x = Math.floor(d[0]), y = Math.floor(d[1]); if (!freeTile(x, y)) continue;
    tried++; const r0 = recOf(c), day = G.S.day; const nb = sim(() => G.Village.addBuilding('house', x, y, c.set, true));
    if (!sameRec(recOf(c), r0)) { A = { c, nb, r0, day }; break; }
    sim(() => G.Village.removeBuilding(nb)); turn();
  }
  if (!A) ok('a casa fundada diante da porta', false, `nenhum prédio deste mundo com a casa da frente livre e outro lado onde a entrada caiba (${tried} tentados)`);
  else {
    const { c, nb, r0, day } = A; const ref = c.ip.h[c.ip.h.length - 1]; const e = entry(c), eN = entry(nb);
    ok('a casa fundada diante da porta', c.ip.r === r0.r + 1 && ref[0] === day && ref[1] === 'reforma' && /^porta /.test(ref[2] || '') && e.ok && In.entrySaid(c) === true && eN.ok, `${nb.type}#${nb.id} fundada na casa diante da porta de ${c.type}#${c.id}: a porta foi de ${r0.s}/${r0.o} a ${c.ip.s}/${c.ip.o} na hora (${JSON.stringify(ref)}), sem esperar a virada; a entrada dele ${e.kind}, a da casa nova ${eN.kind}`);
    const id = c.id, nid = nb.id, r1 = recOf(c); M.salvarCarregar(); In.uncache(); const c2 = G.S.buildings.get(id), nb2 = G.S.buildings.get(nid);
    ok('a rua tomada: salvar e carregar no meio', !!c2 && !!nb2 && sameRec(recOf(c2), r1) && entry(c2).ok, `${c2 ? c2.type + '#' + id : '-'} em ${c2 ? c2.ip.s + '/' + c2.ip.o : '-'}, a casa nova ${nb2 ? 'lá' : 'SUMIU'}`);
    sim(() => G.Village.removeBuilding(nb2)); turn(); const e3 = entry(c2);
    ok('o chão que volta deixa a porta onde está', sameRec(recOf(c2), r1) && e3.ok, `a casa nova desfeita: a porta de ${c2.type}#${id} fica em ${c2.ip.s}/${c2.ip.o}, onde cabe (${e3.kind}); no lado ${r0.s} ${(In.entryOn(c2, r0.s) || {}).ok ? 'caberia de novo' : 'ainda não caberia'}`);
    taken = { id, s: c2.ip.s, o: c2.ip.o };
  }
  // (a world with no side flight that serves a case — a young town on flat ground —: the case makes its own, by the god's hand —
  // a free lot of two by two by the main town tilted down to the street before it, a store founded on it, whose floor stands
  // over the street higher than its lot gives steps room for: they go down along its wall; the ground and the building left
  // as they are if it serves, put back if not — T-117)
  const flightOf = c => { const sh = In.shellOf(c); const en = sh.entrance; const h = sh.holes.find(q => q.door === en.door && q.kind !== 'janela'); const w = sh.walls[h.wall]; const l = sh.levels.find(q => q.lv === w.lv);
    return Sp.doorFlight(c, sh.shell, { w: c.w * TL, d: c.h * TL }, w, h, l ? l.y : 0, false, undefined, undefined, true); };
  let lots2 = null; const made = [];
  const lotsOf2 = () => (lots2 || (lots2 = freeLots(2, 12)));
  const why = {}; const no = k => { why[k] = (why[k] || 0) + 1; return null; };
  const whyNot = () => `${lotsOf2().length} lotes livres de dois por dois; ${Object.entries(why).map(([k, n]) => `${n} ${k}`).join(', ') || 'nenhum feito'}`;
  const makeSide = serves => {
    const r = makeSideOn(serves); if (r || !newLand()) return r; lots2 = null; const r2 = makeSideOn(serves); if (r2) r2.made += landNote(); return r2; };
  const makeSideOn = serves => {
    let n = 0;
    for (const L of lotsOf2()) { if (L.used) continue; for (const dh of [0.4, 0.6, 0.3, 0.8]) {
      // (its back at base + dh, falling to its front at base, the street round it at base)
      const set = []; for (let vy = L.y - 1; vy <= L.y + 3; vy++) for (let vx = L.x - 1; vx <= L.x + 3; vx++) { const inLot = vx >= L.x && vx <= L.x + 2 && vy >= L.y && vy <= L.y + 2; set.push([vx, vy, inLot ? L.base + dh * (L.y + 2 - vy) / 2 : L.base]); }
      const back = ground(set, []); const c = sim(() => G.Village.addBuilding('storehouse', L.x, L.y, L.set, true)); n++;
      const e = entry(c); const r = e.ok && e.kind === 'lado' ? serves(c) : no(`com a entrada ${e.ok ? e.kind : 'que não cabe'}`);
      if (r) { L.used = 1; made.push(c.id); r.made = ` (feito pelo deus neste mundo, que não tinha um que servisse: ${c.type}#${c.id} num lote inclinado ${dh} em ${L.x},${L.y})`; return r; }
      sim(() => G.Village.removeBuilding(c)); unground(back); if (n >= 24) return null; } }
    return null; };
  // 8b. a tread of a side flight over ground the world does not walk (a wall where its foot runs along the street): the feet
  // could not stand on it — the way in does not fit (Space.entryFits: stand), and the turn moves the door
  const serves8b = c => {
    const fl = flightOf(c); const lowS = fl.treads.filter(t => t.kind === 'side').sort((p, q) => p.y - q.y)[0]; if (!lowS) return no('sem degrau de lado');
    const q = fl.P(lowS.a, lowS.n); const i = W.idx(c.x + q[0] / TL, c.y + q[1] / TL); if (G.S.occ[i] === c.id) return no('com o degrau de baixo no lote'); if (!W.walkable(i)) return no('com o degrau de baixo num chão que não se anda');
    const d = outOf(c); if (d && W.idx(d[0], d[1]) === i) return no('com o degrau de baixo na casa da porta'); // (not the tile before the door itself: there it is the street taken, 8a)
    triedC++; ground([], [i]); const e2 = entry(c);
    if (!e2.ok && !e2.stand && In.fitSide(c)) return { c, i, e2, made: '' }; unwall([i]); return no(e2.ok || e2.stand ? 'que o muro não tirou' : 'sem outro lado onde caiba'); };
  let C = null, triedC = 0;
  for (const c of ready()) { if (!c.blocks || triedC >= 200) continue; const e = entry(c); if (!e.ok || e.kind !== 'lado') continue; C = serves8b(c); if (C) break; }
  if (!C) C = makeSide(serves8b);
  if (!C) ok('o degrau sobre chão que não se anda', false, `nenhum prédio deste mundo com um lance de lado cujo degrau de baixo caia fora do lote e da casa da porta (${triedC} tentados), e nenhum que o deus fizesse servir (${whyNot()})`);
  else {
    const { c, i, e2 } = C; const r0 = recOf(c); const bad = heardBad(); turn(); const e3 = entry(c);
    ok('o degrau sobre chão que não se anda', !bad.length && !sameRec(recOf(c), r0) && e3.ok, `${c.type}#${c.id}: um muro sob o degrau de baixo do lance de lado — a entrada não cabe (${e2.kind}, os pés não pisam em todos), o verificador ${bad.length ? 'QUEIXOU: ' + bad[0].msg : 'calado'}; na virada, a porta vai de ${r0.s}/${r0.o} a ${c.ip.s}/${c.ip.o}, onde cabe (${e3.kind})${C.made}`);
    unwall([i]);
  }
  // 8c. a building at work whose street is taken before it is done: the founding beside it and the turn of the day pass it by
  // — its plan is not walked yet —; a save in the middle; done, its door is judged then (In.complete), not at the next turn
  let D = null, triedD = 0; const HD = G.BDEF.house;
  const lotFree = (x, y) => { for (let yy = y - 1; yy <= y + HD.h; yy++) for (let xx = x - 1; xx <= x + HD.w; xx++) { const inner = xx >= x && xx < x + HD.w && yy >= y && yy < y + HD.h; if (inner ? !freeTile(xx, yy) : !(W.inb(xx, yy) && W.walkable(W.idx(xx, yy)))) return false; } return true; };
  look: for (const c of ready()) {
    if (triedD >= 40) break;
    for (let y = c.y - 3; y <= c.y + c.h + 2; y++) for (let x = c.x - 3; x <= c.x + c.w + 2; x++) {
      if (!lotFree(x, y)) continue;
      const site = sim(() => G.Village.addBuilding('house', x, y, c.set, false)); const d = site.ip && outOf(site); const fx = d ? Math.floor(d[0]) : -1, fy = d ? Math.floor(d[1]) : -1;
      if (d && freeTile(fx, fy)) {
        triedD++; const r0 = recOf(site); const nb = sim(() => G.Village.addBuilding('house', fx, fy, c.set, true));
        if (sameRec(recOf(site), r0) && In.fitSide(site)) { D = { site, nb, r0 }; break look; }
        sim(() => G.Village.removeBuilding(nb));
      }
      sim(() => G.Village.removeBuilding(site));
    }
  }
  if (!D) ok('a obra cuja rua foi tomada', false, `nenhum lugar deste mundo para uma obra com a casa da frente livre e outro lado onde a entrada caiba (${triedD} tentados)`);
  else {
    const { site, nb, r0 } = D; const sid = site.id, nid = nb.id; const shut0 = shutNow(site), e0 = entry(site);
    M.salvarCarregar(); In.uncache(); let s2 = G.S.buildings.get(sid); const nb2 = G.S.buildings.get(nid);
    turn(); s2 = G.S.buildings.get(sid); const passed = !!s2 && !s2.built && sameRec(recOf(s2), r0);
    ok('a obra: a fundação ao lado, salvar e carregar e a virada passam por ela', passed && !!nb2 && shut0, `a obra ${s2 ? s2.type + '#' + sid : '-'} (porta em ${r0.s}/${r0.o}) com ${nb.type}#${nid} fundada na casa diante da porta dela: a rua dela ${shut0 ? 'fechada' : 'ABERTA'} (a entrada ${e0.ok ? 'cabe' : 'não cabe'}, ${e0.kind}); depois de salvar e carregar e da virada, ${passed ? 'o registro o mesmo' : 'MUDOU: ' + JSON.stringify(s2 ? recOf(s2) : null)}`);
    const day = G.S.day; sim(() => G.Village.completeBuilding(s2)); const h = s2.ip.h, last = h[h.length - 1], prev = h[h.length - 2]; const e1 = entry(s2), bad = heardBad();
    ok('a obra pronta: a porta julgada na hora', s2.built && prev && prev[0] === day && prev[1] === 'pronto' && last[0] === day && last[1] === 'reforma' && /^porta /.test(last[2] || '') && !shutNow(s2) && e1.ok && In.entrySaid(s2) === true && !bad.length,
      `${s2.type}#${sid} pronta no dia ${day}: ${JSON.stringify(prev)}, ${JSON.stringify(last)} — a porta de ${r0.s}/${r0.o} a ${s2.ip.s}/${s2.ip.o}, onde a entrada cabe (${e1.kind}), sem esperar a virada; o verificador ${bad.length ? 'QUEIXOU: ' + bad[0].msg : 'calado'}`);
    atWork = { id: sid };
  }
  // 8d. a cliff under the landing's middle, beyond the lot's edge — the side's steps going down onto open ground beside it, as
  // the quartel#4882's of the new metropolis (L-208): the feet would not stand there — the way in does not fit (Space.entryFits:
  // stand) —, and the turn moves the door to a side where it fits; the cliff gone, the door stays (D-060)
  const cliff = (list, on) => sim(() => { for (const i of list) G.S.cliff[i] = on ? 1 : 0; G.S.typeVer = (G.S.typeVer || 0) + 1; W.invalidateLand(); W.touchWalk(); });
  const serves8d = c => {
    const fl = flightOf(c); const L = fl.treads.find(t => t.kind === 'landing'); if (!L) return no('sem patamar');
    const q = fl.P(0, L.n); const i = W.idx(c.x + q[0] / TL, c.y + q[1] / TL); if (G.S.occ[i] === c.id) return no('com o patamar no lote'); if (!W.walkable(i)) return no('com o patamar num chão que não se anda');
    // (the ground a stride before the lowest of its steps on another tile, open: only the landing over the cliff — the
    // quartel's way: its steps down onto the open tile of its street, the landing before the closed one)
    const lo = fl.treads.reduce((a, t) => (t.y < a.y ? t : a)); const g = fl.P(lo.a, lo.n + lo.wn / 2 + 0.5); const gi = W.idx(c.x + g[0] / TL, c.y + g[1] / TL); if (gi === i) return no('com o pé dos degraus na casa do patamar');
    triedE++; cliff([i], true); const other = SIDES.some(s => s !== c.ip.s && (In.entryOn(c, s) || {}).ok);
    if (other) return { c, i, made: '' }; cliff([i], false); return no('sem outro lado onde caiba'); };
  let E = null, triedE = 0;
  for (const c of ready()) { if (!c.blocks || triedE >= 200) continue; const e = entry(c); if (!e.ok || e.kind !== 'lado') continue; E = serves8d(c); if (E) break; }
  if (!E) E = makeSide(serves8d);
  if (!E) ok('o patamar sobre um penhasco', false, `nenhum prédio deste mundo com um patamar fora do lote e outro lado onde a entrada caiba (${triedE} tentados), e nenhum que o deus fizesse servir (${whyNot()})`);
  else {
    const { c, i } = E; const r0 = recOf(c); const e2 = entry(c); turn(); const e3 = entry(c); const r1 = recOf(c); cliff([i], false); turn();
    ok('o patamar sobre um penhasco', !e2.ok && !e2.stand && !sameRec(r1, r0) && e3.ok && sameRec(recOf(c), r1),
      `${c.type}#${c.id}: um penhasco sob o meio do patamar — a entrada ${e2.ok ? 'CABE' : 'não cabe'} (${e2.kind}, os pés ${e2.stand ? 'PISAM em todos' : 'não pisam em todos'}); na virada, a porta vai de ${r0.s}/${r0.o} a ${r1.s}/${r1.o}${e3.ok ? ', onde cabe' : ', onde NÃO cabe'} (${e3.kind}); sem o penhasco, ${sameRec(recOf(c), r1) ? 'fica onde está' : 'MUDOU de novo'}${E.made}`);
  }
}
qa('a rua tomada');

// ---- 9. the front door of a building of work before an open tile of its street (L-209): the people's door the plan's, the
// body's; a wall before the tile it opens onto, another of its side open: the turn takes it to an open one ----
let slid = null;
{
  const TL = Sp.TILE; const outOf = c => { const sh = In.shellOf(c); const e = sh && sh.entrance; return e && e.out ? [c.x + e.out[0] / TL, c.y + e.out[1] / TL] : null; };
  const work = () => ready().filter(b => /^w-/.test(b.ip.f) && b.blocks);
  const heardBad = () => QA.check().filter(q => q.sys === 'int' && /a entrada|a porta ficou/.test(q.msg));
  // 9a. the world as it is now: every building of work opens before ground one walks — or fits on no side open —, and its
  // people go in and out by the plan's door
  let nW = 0; const badW = [];
  for (const b of work()) { nW++; const o = outOf(b); if (!o) continue;
    if (!W.walkableXY(o[0], o[1])) { if (In.fitSide(b)) badW.push(`${b.type}#${b.id} ${b.ip.s}/${b.ip.o}: diante de uma casa que não se anda, e no lado ${In.fitSide(b).s} caberia`); continue; }
    if (!near(G.Vg.door(b), o) && In.planDoor(b)) badW.push(`${b.type}#${b.id}: a porta das pessoas não é a da planta`); }
  ok('a porta de trabalho diante de chão que se anda', nW > 0 && !badW.length, `${nW} prédios de trabalho${badW.length ? ' — ' + badW.slice(0, 3).join(' · ') : ': todos com a porta da frente diante de um chão que se anda, e a das pessoas é a da planta'}`);
  // 9b. a wall before the tile the door opens onto, another tile of its side open (a door with no steps first: the rule of
  // before kept it there — its way in fit, its street open —, the people out by another door)
  let C = null, tried = 0;
  for (const pass of [0, 1]) { for (const c of work()) {
    if (c.w < 2 || tried >= 80) continue; if (!pass && entry(c).kind !== 'nenhum') continue; const o = outOf(c); if (!o || !W.walkableXY(o[0], o[1])) continue;
    const i = W.idx(o[0], o[1]); const m = openT(c, c.ip.s); if (bits(m) < 2) continue;
    tried++; ground([], [i]);
    if (!shutNow(c) && SIDES.some(s => (In.entryOn(c, s) || {}).ok)) { C = { c, i }; break; } unwall([i]); }
    if (C) break; }
  if (!C) ok('o muro diante da porta de trabalho', false, `nenhum prédio de trabalho deste mundo com duas casas abertas do lado da porta (${tried} tentados)`);
  else {
    const { c, i } = C; const r0 = recOf(c), k0 = entry(c).kind; const bad = heardBad(); turn(); const o2 = outOf(c); const e2 = entry(c);
    ok('o muro diante da porta de trabalho', !sameRec(recOf(c), r0) && !!o2 && W.walkableXY(o2[0], o2[1]) && near(G.Vg.door(c), o2) && e2.ok && In.entrySaid(c) === true && !bad.length,
      `${c.type}#${c.id} (${c.ip.f}, ${k0}): um muro diante da casa da porta, o lado ainda aberto noutra — o verificador ${bad.length ? 'QUEIXOU: ' + bad[0].msg : 'calado'}; na virada, a porta de ${r0.s}/${r0.o} a ${c.ip.s}/${c.ip.o}, ${o2 && W.walkableXY(o2[0], o2[1]) ? 'diante de um chão que se anda' : 'DIANTE DE UM CHÃO QUE NÃO SE ANDA'}; a porta das pessoas ${o2 && near(G.Vg.door(c), o2) ? 'é a da planta' : 'NÃO é a da planta'}`);
    unwall([i]); slid = { id: c.id };
  }
}
qa('as portas de trabalho');

// ---- 11. a door onto a pocket (L-216): the street before a side shut in round a single tile — the hut of Tenochtitlan whose
// first side open faced a tile between three cliffs, its family starved two steps from the store —: the founding takes the
// first side onto the street, the turn takes a door whose street closed round it into a pocket to another (a save in the
// middle, someone inside who comes out on the street), the checker sees a turn that left one there, and a record of before
// (v 2), its family shut in the pocket, is judged on loading ----
let pocketDoor = null;
{
  const S = G.S, N = G.N; const at = (x, y) => y * N + x;
  const outOf = c => { const sh = In.shellOf(c); const e = sh && sh.entrance; return e && e.out ? [c.x + e.out[0] / Sp.TILE, c.y + e.out[1] / Sp.TILE] : null; };
  const size = () => { const L = W.reachIds(true); const m = new Map(); for (let i = 0; i < L.length; i++) if (L[i] >= 0) m.set(L[i], (m.get(L[i]) || 0) + 1); return p => (p && W.walkableXY(p[0], p[1]) ? m.get(L[W.idx(p[0], p[1])]) || 0 : -1); };
  const pocketBad = () => QA.check().filter(q => q.sys === 'int' && /bolsão/.test(q.msg));
  // (a lot of one tile with two rings of ground one walks round it, nothing on them: the god walls three tiles round the tile
  // before its south side — S, the first side open, a pocket of one tile; the others on the street)
  // (the lot: its other three sides on one street, a dozen tiles at least, and the second ring round it ground one walks — the
  // walls the case lays there leave a way round its corners to the street; on a small island, the first lot where they are)
  const ring2 = c => { for (let ty = c.y - 2; ty <= c.y + 2; ty++) for (let tx = c.x - 2; tx <= c.x + 2; tx++) if (!W.walkable(at(tx, ty))) return false; return true; };
  let L = null, b = null, tried = 0;
  for (let pass = 0; pass < 2 && !L; pass++) { if (pass && !newLand()) break; tried = 0; for (const c of freeLots(1, 40, ring2)) {
    if (tried >= 16) break; tried++; const { x, y } = c; const wS = [at(x - 1, y + 1), at(x + 1, y + 1), at(x, y + 2)].filter(i => W.walkable(i)); const back = ground([], wS);
    const h = sim(() => G.Village.addBuilding('house', x, y, c.set, true)); const L0 = W.reachIds(true); const sz = size();
    const reg = p => L0[W.idx(p[0], p[1])]; const E = [x + 1.4, y + 0.5], Wt = [x - 0.4, y + 0.5], Nt = [x + 0.5, y - 0.4];
    if (sz([x + 0.5, y + 1.4]) === 1 && [E, Wt, Nt].every(p => sz(p) >= 12) && reg(E) === reg(Wt) && reg(Wt) === reg(Nt)) { L = c; b = h; L.note = pass ? landNote() : ''; break; }
    sim(() => G.Village.removeBuilding(h)); unground(back);
  } }
  if (!L) ok('a fundação diante de um bolsão', false, `nenhum lote livre de uma casa com os outros três lados numa rua, neste mundo (${tried} tentados)`);
  else {
    const { x, y } = L; const sTile = [x + 0.5, y + 1.4];
    // 11a. the founding: the door on the first side onto the street, never the pocket's (the house on the lot closes it)
    const first = SIDES.find(s => (In.entryOn(b, s) || {}).ok);
    const sz1 = size(); const pd = sim(() => In.planDoor(b)); const od = outOf(b);
    ok('a fundação diante de um bolsão', b.ip.s !== 'S' && b.ip.s === first && !!pd && near(pd, od) && sz1(od) >= 12 && W.walkableXY(sTile[0], sTile[1]) && sz1(sTile) === 1 && In.entrySaid(b) === true && !pocketBad().length,
      `house#${b.id} em ${x},${y}: o sul, o primeiro lado aberto, dá para uma casa que se anda (${f2(sTile)}) fechada pelos três muros e pela casa — um bolsão de ${sz1(sTile)} casa —; a porta nasce em ${b.ip.s}/${b.ip.o}, o primeiro lado para a rua onde a entrada cabe (${first || '-'}), diante de um chão de ${sz1(od)} casas; quem sai sai em ${f2(pd)}${L.note}`);
    // 11b. the street before the door closed round it into a pocket — walls on the tiles beside the one it opens onto, the other
    // sides on the street —: until the turn the step does not take that door (the first old corner on the street meanwhile), a
    // save in the middle, someone inside at the turn, which moves the door; who was inside comes out on the street
    const s0 = b.ip.s, r0 = recOf(b); const oi = W.idx(od[0], od[1]); const ox = oi % N, oy = (oi / N) | 0;
    const wE = [at(ox - 1, oy), at(ox + 1, oy), at(ox, oy - 1), at(ox, oy + 1)].filter(i => i !== oi && S.occ[i] !== b.id && W.walkable(i)); ground([], wE);
    const sz2 = size(); const pocket = sz2(od); const bad0 = pocketBad(); const inStep = sim(() => In.planDoor(b)); const exitV = sim(() => G.Vg.door(b));
    ok('a rua da porta fechada num bolsão', pocket >= 1 && pocket <= 2 && !!inStep && !near(inStep, od) && near(exitV, inStep) && sz2(inStep) >= 12 && !bad0.length, `house#${b.id}: ${wE.length} muros em volta da casa diante da porta (${s0}) — um bolsão de ${pocket} casa(s); no passo, até a virada, quem sai sai em ${f2(exitV)}, ${inStep && near(inStep, od) ? 'A PORTA DO BOLSÃO' : 'um canto de antes num chão de ' + sz2(inStep) + ' casas'}; o verificador antes da virada ${bad0.length ? 'QUEIXOU: ' + bad0[0].msg : 'calado (a palavra da virada era para o chão de antes)'}`);
    const id = b.id; M.salvarCarregar(); In.uncache(); let b2 = G.S.buildings.get(id);
    const free16 = v => !v.jail && !v.aboard && !v.captive && v.age >= 16 && !(G.S.avatar && G.S.avatar.id === v.id) && !v.inside;
    const v = [...G.S.villagers.values()].find(q => free16(q) && q.set === b2.set);
    ok('o bolsão: salvar e carregar no meio', !!b2 && sameRec(recOf(b2), r0) && wE.every(i => G.S.wall[i] === 1) && size()(od) === pocket, `o registro ${b2 ? b2.ip.s + '/' + b2.ip.o : '-'} e os muros como estavam, o bolsão ainda de ${size()(od)}`);
    if (v) sim(() => { G.Vg.endTask(v); G.Vg.setTask(v, { type: 'idle', wait: 5, pri: 0.3 }); v.inside = id; });
    turn(); const ref = b2.ip.h[b2.ip.h.length - 1]; const pd2 = sim(() => In.planDoor(b2)); const od2 = outOf(b2); const sz3 = size();
    ok('a virada tira a porta do bolsão', b2.ip.s !== s0 && b2.ip.r === r0.r + 1 && ref[1] === 'reforma' && /^porta /.test(ref[2] || '') && !!pd2 && near(pd2, od2) && sz3(od2) >= 12 && In.entrySaid(b2) === true && !pocketBad().length,
      `o lado ${s0} → ${b2.ip.s}/${b2.ip.o}, o fato ${JSON.stringify(ref)}; a porta nova diante de um chão de ${sz3(od2)} casas; o verificador ${pocketBad().length ? 'QUEIXOU: ' + pocketBad()[0].msg : 'calado'}`);
    if (v) sim(() => G.Vg.endTask(v));
    ok('quem estava dentro sai na rua', !!v && !v.inside && near([v.x, v.y], pd2) && sz3([v.x, v.y]) >= 12, v ? `${v.name} saiu em ${f2([v.x, v.y])}, num chão de ${sz3([v.x, v.y])} casas` : 'ninguém dentro');
    // 11c. the checker sees a turn that left a door before a pocket: the step's map swapped for one where all ground is one
    // (a turn that does not see pockets) — the door left there, and the word said with this ground —; then the real turn
    const s1 = b2.ip.s; const oi2 = W.idx(od2[0], od2[1]); const qx = oi2 % N, qy = (oi2 / N) | 0;
    const wW = [at(qx - 1, qy), at(qx + 1, qy), at(qx, qy - 1), at(qx, qy + 1)].filter(i => i !== oi2 && S.occ[i] !== b2.id && W.walkable(i)); ground([], wW);
    const real = W.reachIds; const one = new Int32Array(N * N).fill(-1); for (let i = 0; i < N * N; i++) if (W.walkable(i)) one[i] = 0;
    let bad1 = [];
    try { W.reachIds = peek => (peek ? real(true) : one); W.reachBuilds++; turn(); } finally { W.reachIds = real; W.reachBuilds++; }
    bad1 = pocketBad(); const left = b2.ip.s === s1;
    turn(); const bad2 = pocketBad(); const od3 = outOf(b2);
    ok('o verificador vê a porta deixada num bolsão', left && bad1.length > 0 && b2.ip.s !== s1 && !bad2.length && size()(od3) >= 12, `com o mapa trocado, a virada deixou a porta em ${s1}: ${bad1.length} queixa(s) (${bad1.slice(0, 1).map(q => q.msg).join('')}); com o mapa de volta, a virada a leva a ${b2.ip.s}, e o verificador ${bad2.length ? 'AINDA QUEIXA' : 'cala'}`);
    // 11d. the checker sees a door before a pocket two days on, whatever the step said: the ground changed again (the word
    // is for another ground), the days go by without a turn of the interiors (the street of the side before it given back,
    // so that one side is on the street)
    unwall(wW);
    const s2 = b2.ip.s; const oi3 = W.idx(od3[0], od3[1]); const zx = oi3 % N, zy = (oi3 / N) | 0;
    const wN = [at(zx - 1, zy), at(zx + 1, zy), at(zx, zy - 1), at(zx, zy + 1)].filter(i => i !== oi3 && S.occ[i] !== b2.id && W.walkable(i)); ground([], wN);
    const day = G.S.day; const n0 = pocketBad().length; G.S.day = day + 2; const n2 = pocketBad(); G.S.day = day;
    turn(); const n3 = pocketBad().length;
    ok('o verificador vê a porta num bolsão há dois dias', !n0 && n2.length > 0 && /desde o dia/.test(n2[0].msg) && !n3, `um bolsão novo diante da porta (${s2}): no mesmo dia, ${n0} queixas; dois dias depois sem virada, ${n2.length} (${n2.slice(0, 1).map(q => q.msg).join('')}); depois da virada (a porta em ${b2.ip.s}), ${n3}`);
    // 11e. a record of before (v 2), its door before a pocket in the save, and the family already shut in there — the save of
    // before kept those who were inside at the door of then, in the pocket —: judged on loading, the door on the street from
    // the first frame, the record of this version, the family out at the new door, the checker calm
    const before = b2.ip.s; const str = G.Save.serialize(); const o = JSON.parse(str); const ob = (o.buildings || []).find(q => q.id === id);
    const fam = (o.villagers || []).filter(q => !q.jail && !q.aboard && !q.captive && !q.ug && q.age >= 2 && q.set === ob.set && !(o.avatar && o.avatar.id === q.id)).slice(0, 3);
    let migr = null;
    if (ob && ob.ip && fam.length) {
      ob.ip.v = 2; ob.ip.s = s2; ob.ip.o = 1; for (const q of fam) { q.x = od3[0]; q.y = od3[1]; q.home = id; q.inside = 0; }
      const shut0 = size()(od3); G.Save.apply(o); In.uncache(); const b3 = G.S.buildings.get(id); const od4 = b3 && outOf(b3); const fact = b3 && b3.ip.h[b3.ip.h.length - 1];
      const out = fam.map(q => G.S.villagers.get(q.id)).filter(Boolean); const vd = b3 && sim(() => G.Vg.door(b3)); const sz4 = size();
      const free = out.length === fam.length && out.every(v => near([v.x, v.y], vd) && sz4([v.x, v.y]) >= 12);
      migr = { ok: !!b3 && b3.ip.v === 3 && b3.ip.s !== s2 && !!fact && fact[1] === 'reforma' && sz4(od4) >= 12 && In.entrySaid(b3) === true && free && !pocketBad().length,
        info: `o registro v 2 com a porta em ${s2}/1, diante do bolsão de ${shut0} casa(s), e ${fam.length} da família nele (${fam.map(q => q.name).join(', ')}): ao abrir, v ${b3 ? b3.ip.v : '-'}, a porta em ${b3 ? b3.ip.s + '/' + b3.ip.o : '-'} (o fato ${JSON.stringify(fact)}), diante de um chão de ${sz4(od4)} casas; a família ${free ? 'na porta nova, nesse chão' : 'AINDA NO BOLSÃO: ' + out.map(v => f2([v.x, v.y]) + ' num chão de ' + sz4([v.x, v.y])).join(' · ')}; antes de salvar, ${before}` }; }
    ok('o registro de antes julgado ao abrir', !!migr && migr.ok, migr ? migr.info : 'o save sem o prédio, o registro ou gente da cidade');
    pocketDoor = { id };
  }
}
qa('o bolsão');

// ---- 10. save and load: the same sides and the same doors, and the next turn changes nothing ----
{
  const snap = () => { const m = new Map(); for (const b of ready()) m.set(b.id, JSON.stringify([b.ip.s, b.ip.o, b.ip.r, b.blocks ? sim(() => G.Vg.door(b)) : null])); return m; };
  const a = snap(); M.salvarCarregar(); In.uncache(); const c = snap(); turn(); const d = snap(); let diff = 0, diffT = 0; const ex = [];
  for (const [id, s] of a) { if (c.get(id) !== s) { diff++; if (ex.length < 2) ex.push(`#${id}: ${s} ≠ ${c.get(id)}`); } if (d.get(id) !== c.get(id)) { diffT++; if (ex.length < 2) ex.push(`#${id} na virada: ${c.get(id)} → ${d.get(id)}`); } }
  // (the doors the cases moved or kept, as they are now — later cases may move them again: what must hold is the load and the
  // turn after it changing none of them, as none of the others)
  const kept = [['o muro', moved2], ['lado nenhum', alone], ['a árvore', treeDoor], ['a rua tomada', taken], ['a obra', atWork], ['a porta de trabalho', slid], ['o bolsão', pocketDoor]].filter(q => q[1]).map(([n, x]) => { const b = G.S.buildings.get(x.id); return `${n}: ${b.type}#${b.id} em ${b.ip.s}/${b.ip.o}`; });
  ok('salvar e carregar', !diff && !diffT && a.size === c.size, `${a.size} prédios: ${diff} com outro lado ou outra porta depois de carregar, ${diffT} mudados pela virada seguinte${ex.length ? ' — ' + ex.join(' · ') : ''}; ${kept.join(', ')}`);
}
qa('no fim');
const er = M.erros(); ok('sem erros', M.limpo(), `módulos ${JSON.stringify(er.mod)}; console ${er.console.slice(0, 2).join(' | ') || 'limpo'}`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
