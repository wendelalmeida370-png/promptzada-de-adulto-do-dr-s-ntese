// pe-da-escada: o corpo chega ao pé de cada lance e o sobe, pela regra do próprio corpo (L-391) — em Node, sem navegador (a
// simulação do qa/nodemundo.js com os arquivos do corpo, como o qa/visual/corpo-casa.js):
//   node qa/visual/pe-da-escada.js [mundo] [prédios]       (padrão: o mundo pronto «metropole»; 8 prédios na parte 3)
// O corpo toma um lance só pelo pé (avatar.js: o lance é sólido no piso de onde sobe; o corpo o toma a até 0,7 m antes do
// primeiro degrau, na largura dele, andando ao longo dele), com a borda inteira (0,32 m) num chão onde se anda. As provas:
//   1. o pé: em cada lance de cada prédio com planta do mundo, o patamar do pé que a planta guarda (s.a) fica onde o corpo toma o
//      lance, com a borda inteira do corpo no chão que o Space dá aos pés (Space.indoor) e fora de todo lance daquele piso; e
//      dele, ao longo do lance, até o primeiro degrau, a borda no chão o caminho todo (L-447)
//   1b. o corpo e as pessoas do mundo pelas mesmas células: em cada lance, o que barra o corpo (Avatar.flightBox) são as casas do
//      lance na planta (C.STAIR do piso de onde ele sobe), e o desenho do lance passa delas meia casa no máximo (0,125 m)
//   2. o caminho: da porta da rua — ou do topo do lance que chega ao piso — até o pé de cada lance, um caminho pelas casas da
//      planta onde o corpo cabe pela regra dele: a borda de 0,34 m (ou de 0,26, roçando o que está ao lado; ou, entre duas
//      quinas, o passo do próprio corpo, que olha a borda do lado para onde vai: Avatar.blocked), nunca por cima de um lance do
//      piso, pelas portas dos cômodos (as mãos as abrem)
//   3. o corpo de verdade (o controle, quadro a quadro), em alguns prédios — o sobrado #2938 da metrópole, o do e18, entre eles —:
//      entra pela porta, anda até o pé de um lance do piso da entrada pelo caminho da parte 2 e sobe ao piso de cima
//   4. o verificador limpo, sem erro de módulo
// (o corpo salvo dentro de uma planta refeita depois — um save de antes deste conserto —: o qa/visual/salvo-dentro.js, L-422)
const path = require('path');
const M = require(path.join(__dirname, '..', 'nodemundo.js'));
const G = M.load({ qa: true, extra: ['js/space.js', 'js/people3d.js', 'js/possess.js', 'js/interact.js', 'js/avatar.js', 'qa/visual/corpo-qa.js'] });
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | pe-da-escada ${name} | ${info}`); if (!c) fails.push(name); };
const WORLD = process.argv[2] || 'metropole', NB = +(process.argv[3] || 8);
M.pronto(WORLD);
const S = G.S, W = G.W, In = G.Interiors, Sp = G.Space, TL = Sp.TILE;
const RDT = 1 / 30;
const frame = () => { G.debug.step(RDT * G.Space.TIME); G.Avatar.frame(RDT); };
const IN = G.Avatar.input; const stop = () => { IN.mx = 0; IN.mz = 0; IN.run = false; };
const st = () => G.Avatar.state();
const bad0 = new Set(QA.check().filter(q => q.sev <= 2).map(q => q.sys + '|' + q.msg));
const vbad = () => QA.check().filter(q => q.sev <= 2 && !bad0.has(q.sys + '|' + q.msg));
const R = 0.32;
const RIM = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7]];
const ups = (p, lv) => p.stairs.filter(s => s.kind !== 'degraus' && s.lv0 === lv);
const inRect = (r, x, z, m) => x > r[0] - m && x < r[2] + m && z > r[1] - m && z < r[3] + m;
// (what of a flight bars the body: the plan's cells of it — Avatar.flightBox; the body and the people of the world by the same
// cells, the drawn outline up to half a cell past them, D-146 —: the body's rule, for its ways and its steps here. By the
// outline, the way of the 3 went 0,06 m from the ladder of the sobrado#3002 of the generation-18 metropole, inside its cells:
// the body was barred there, short of the foot, T-615)
const bar = s => G.Avatar.flightBox(s.r);
// (where the body takes a flight from: before its first step, up to 0.7 m, across its width — Avatar's atFoot)
function atFoot(s, x, z) { const r = s.r, dx = s.dir[0], dz = s.dir[1]; if (dx) { const e = dx > 0 ? r[0] - x : x - r[2]; return e >= -0.05 && e < 0.7 && z > r[1] - 0.05 && z < r[3] + 0.05; } const e = dz > 0 ? r[1] - z : z - r[3]; return e >= -0.05 && e < 0.7 && x > r[0] - 0.05 && x < r[2] + 0.05; }
// a path over a storey of a plan, by the body's rule (qa/visual/corpo-casa.js's: the rim round each point on what the feet walk
// — Space.indoor —, never over a flight going up from the storey, a door of the rooms taken whole, its corridor)
function pathIn(b, p, lv, from, to) {
  const fl = ups(p, lv), fb = fl.map(bar); const onUp = (x, z) => fb.some(r => inRect(r, x, z, 0.02));
  const doors = p.doors.map((d, id) => { const w = p.walls[d.wall]; if (!w || w.lv !== lv || d.outer) return null; const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1; const ux = (w.b[0] - w.a[0]) / L, uz = (w.b[1] - w.a[1]) / L;
    return { id, M: [w.a[0] + ux * d.at, w.a[1] + uz * d.at], u: [ux, uz], n: [-uz, ux], half: Math.max(0.1, d.w / 2 - 0.25) }; }).filter(Boolean);
  const doorOf = (x, z) => { for (const d of doors) { const dx = x - d.M[0], dz = z - d.M[1]; if (Math.abs(dx * d.u[0] + dz * d.u[1]) <= d.half && Math.abs(dx * d.n[0] + dz * d.n[1]) <= 0.7) return d; } return null; };
  const fits = (x, z, r) => { const d = doorOf(x, z); if (d) { const q = Sp.indoor(b.x * TL + x, b.y * TL + z, lv, b.id); return !!q && (q.walk || q.door === d.id); }
    for (const [dx, dz] of RIM) { const q = Sp.indoor(b.x * TL + x + dx * r, b.y * TL + z + dz * r, lv, b.id); if (!q || !q.walk || onUp(x + dx * r, z + dz * r)) return false; } return true; };
  // (the body's own step — Avatar's blocked: the centre and the points of the rim on the side it moves toward, at 0.32 m, on what
  // the feet walk and off every flight of the storey, to the centimetre — for the last search: as the body slides past two
  // corners, the rim behind it never looked at)
  const stepOK = (x, z, mx, mz) => { const d = doorOf(x, z); if (d) { const q = Sp.indoor(b.x * TL + x, b.y * TL + z, lv, b.id); return !!q && (q.walk || q.door === d.id); }
    for (const [dx, dz] of RIM) { if ((dx || dz) && dx * mx + dz * mz <= 0.05) continue; const X = x + dx * R, Z = z + dz * R; const q = Sp.indoor(b.x * TL + X, b.y * TL + Z, lv, b.id); if (!q || !(q.walk || q.door >= 0) || fb.some(r => inRect(r, X, Z, 0))) return false; } return true; };
  const cells = (cs, r) => { const n = Math.round(p.grid.n * p.grid.cs / cs); const c = (x, z) => [Math.floor(x / cs), Math.floor(z / cs)]; const [sx, sz] = c(from[0], from[1]), [tx, tz] = c(to[0], to[1]);
    const prev = new Map(); const key = (x, z) => z * n + x; const q = [[sx, sz]]; prev.set(key(sx, sz), null);
    for (let i = 0; i < q.length; i++) { const [x, z] = q[i]; if (x === tx && z === tz) break;
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Z = z + dz; if (X < 0 || Z < 0 || X >= n || Z >= n || prev.has(key(X, Z))) continue; const cx = (X + 0.5) * cs, cz = (Z + 0.5) * cs; if (!(X === tx && Z === tz) && !(r ? fits(cx, cz, r) : stepOK(cx, cz, dx, dz))) continue; prev.set(key(X, Z), [x, z]); q.push([X, Z]); } }
    if (!prev.has(key(tx, tz))) return null; const out = []; let cur = [tx, tz]; while (cur) { out.unshift([(cur[0] + 0.5) * cs, (cur[1] + 0.5) * cs]); cur = prev.get(key(cur[0], cur[1])); } return out; };
  // (the body's rim and a little more round each cell; else, on cells of half that, the rim brushing what is beside it; else,
  // on cells of 2.5 cm, by the body's own step, as it slides past two corners — the window between a piece's corner and a
  // flight's can be of a few centimetres, and sliding along them the body finds it)
  const out = cells(p.grid.cs, 0.34) || cells(p.grid.cs / 2, 0.26) || cells(p.grid.cs / 10, 0); if (!out) return null;
  const res = [];
  for (let k = 0; k < out.length; k++) {
    const d = doorOf(out[k][0], out[k][1]); if (!d || k === out.length - 1) { res.push(out[k]); continue; }
    const k0 = k; while (k + 1 < out.length - 1 && doorOf(out[k + 1][0], out[k + 1][1]) === d) k++;
    const sd = (P, s0) => ((P[0] - d.M[0]) * d.n[0] + (P[1] - d.M[1]) * d.n[1] >= 0 ? s0 : -s0);
    const a = sd(k0 ? out[k0 - 1] : from, 0.45), e = sd(out[k + 1], 0.45); if (Math.sign(a) === Math.sign(e)) { for (let j = k0; j <= k; j++) res.push(out[j]); continue; }
    const A = [d.M[0] + d.n[0] * a, d.M[1] + d.n[1] * a]; A.door = d.id; res.push(A, d.M.slice(), [d.M[0] + d.n[0] * e, d.M[1] + d.n[1] * e]);
  }
  return res;
}
// (a point straight in from the entrance, k metres past its door)
const inward = (p, k) => { const e = p.entrance; const d = p.doors[e.door]; const w = p.walls[d.wall]; const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1; let nx = -(w.b[1] - w.a[1]) / L, nz = (w.b[0] - w.a[0]) / L;
  if ((p.lot.w / 2 - e.x) * nx + (p.lot.w / 2 - e.z) * nz < 0) { nx = -nx; nz = -nz; } return [e.x + nx * k, e.z + nz * k]; };
// (the rim of the body at a point of a storey: on what the feet walk there — a door of the rooms too, the hands open it —, off
// every flight going up from it (but own: the flight it is at the foot of, which it takes there by walking into its cells);
// null when it stands, else what the first point of the rim that does not stand is on)
const rimWhy = (b, p, lv, x, z, own) => { for (const [dx, dz] of RIM) { const X = x + dx * R, Z = z + dz * R; const q = Sp.indoor(b.x * TL + X, b.y * TL + Z, lv, b.id);
  if (!q) return `${X.toFixed(2)},${Z.toFixed(2)} fora da planta`; if (!(q.walk || q.door >= 0)) return `${X.toFixed(2)},${Z.toFixed(2)} na casa ${q.code}`; const f = ups(p, lv).find(s => s !== own && inRect(bar(s), X, Z, 0)); if (f) return `${X.toFixed(2)},${Z.toFixed(2)} no lance ${f.id}`; } return null; };
const rimOK = (b, p, lv, x, z, own) => !rimWhy(b, p, lv, x, z, own);
// (the body's own step there — Avatar's blocked: the centre and the points of the rim on the side it moves toward (mx, mz), on
// what the feet walk and off every flight of the storey; null when it steps, else what the first point that does not is on)
const stepWhy = (b, p, lv, x, z, mx, mz) => { for (const [dx, dz] of RIM) { if ((dx || dz) && dx * mx + dz * mz <= 0.05) continue; const X = x + dx * R, Z = z + dz * R; const q = Sp.indoor(b.x * TL + X, b.y * TL + Z, lv, b.id);
  if (!q) return `${X.toFixed(2)},${Z.toFixed(2)} fora da planta`; if (!(q.walk || q.door >= 0)) return `${X.toFixed(2)},${Z.toFixed(2)} na casa ${q.code}`; const f = ups(p, lv).find(s => inRect(bar(s), X, Z, 0)); if (f) return `${X.toFixed(2)},${Z.toFixed(2)} no lance ${f.id}`; } return null; };

// ------------------------------ 1 and 2: every flight of the world's plans ------------------------------
const blds = [...S.buildings.values()].filter(b => b.built && b.type !== 'ruin' && In.has(b)).sort((a, c) => a.id - c.id);
let nFl = 0, footBad = [], wayBad = [], nWay = 0;
// (1b: the body and the people of the world by the same cells — the flight bars the body by the plan's cells of it, C.STAIR on the
// storey it goes up from (Avatar.flightBox) —, and the drawing may pass them by half a cell at most: the body never comes into a
// flight's drawn outline by more than 0,125 m. Barred by the outline itself, the body met the ladder of the house#18346 of the
// generation-17 metropole past its cells, where the walk of the plan and the people go — L-645, D-146)
const CS = In.CS, cellBad = [], deep = {}; let worstIn = null;
for (const b of blds) {
  const p = Sp.planNow(b); if (!p || !p.ok) continue; const fl = p.stairs.filter(s => s.kind !== 'degraus'); if (!fl.length) continue;
  const open = p.shell.kind === 'aberta'; const e0 = p.entryLv || 0;
  for (const s of fl) {
    nFl++; const [ax, az] = s.a; const tag = `${b.type}#${b.id} (${b.ip.f}) lance ${s.id} ${s.lv0}→${s.lv1}`;
    { const B = G.Avatar.flightBox(s.r), r = s.r, g = p.grid.lv[s.lv0], n = p.grid.n; let miss = 0;
      // (what bars the body is the plan's cells of the flight, to the edge: the cells of the storey whose middle is in the outline,
      // the flight's in the grid — their box, and the body's, one)
      let c0 = null; if (g) for (let z = 0; z < n; z++) for (let x = 0; x < n; x++) { const mx = (x + 0.5) * CS, mz = (z + 0.5) * CS; if (mx > r[0] && mx < r[2] && mz > r[1] && mz < r[3] && g[z * n + x] === In.CELL.STAIR) c0 = c0 ? [Math.min(c0[0], x), Math.min(c0[1], z), Math.max(c0[2], x), Math.max(c0[3], z)] : [x, z, x, z]; }
      const C0 = c0 ? [c0[0] * CS, c0[1] * CS, (c0[2] + 1) * CS, (c0[3] + 1) * CS] : null; if (!C0 || [0, 1, 2, 3].some(k => Math.abs(B[k] - C0[k]) > 1e-6)) miss++;
      for (let z = Math.round(B[1] / CS); z < Math.round(B[3] / CS); z++) for (let x = Math.round(B[0] / CS); x < Math.round(B[2] / CS); x++) if (!g || g[z * n + x] !== In.CELL.STAIR) miss++;
      // (and the other way: no cell the outline touches that the plan has as the flight's and that does not bar the body — none of
      // another flight of the storey)
      const others = fl.filter(q => q !== s && q.lv0 === s.lv0).map(q => G.Avatar.flightBox(q.r)); const inB = (Q, x, z) => x > Q[0] && x < Q[2] && z > Q[1] && z < Q[3];
      if (g) for (let z = Math.max(0, Math.floor(r[1] / CS)); z <= Math.min(n - 1, Math.floor(r[3] / CS)); z++) for (let x = Math.max(0, Math.floor(r[0] / CS)); x <= Math.min(n - 1, Math.floor(r[2] / CS)); x++) {
        const mx = (x + 0.5) * CS, mz = (z + 0.5) * CS; if (g[z * n + x] === In.CELL.STAIR && !inB(B, mx, mz) && !others.some(Q => inB(Q, mx, mz))) miss++; }
      const over = Math.max(B[0] - r[0], r[2] - B[2], B[1] - r[1], r[3] - B[3], 0); deep[s.kind] = Math.max(deep[s.kind] || 0, over);
      if (!worstIn || over > worstIn.over) worstIn = { over, tag };
      if (miss || over > CS / 2 + 1e-9) cellBad.push(`${tag}: ${miss ? `${miss} casa(s) do corpo fora das da planta` : ''}${miss && over > CS / 2 + 1e-9 ? '; ' : ''}${over > CS / 2 + 1e-9 ? `o desenho ${(over * 100).toFixed(1)} cm além delas` : ''}`); }
    // 1. the foot the plan keeps: where the body takes the flight, its whole rim on the feet's floor, off the flights — and from
    // it, along the flight's line, up to its first step, by the body's own step all the way (stepWhy, Avatar's blocked): the body
    // takes the flight by walking into it, and the loft's ladder of a house cut front and back had its foot past the partition,
    // L-447. The step, not the whole rim: walking in, the body slides along what stands beside it — a hut's loft ladder beside
    // the annex's wall had the side of the rim in the wall's cell, 7 cm off its face, and the body went up it, T-471
    const toStep = () => { const r = bar(s), du = s.dir[0], dv = s.dir[1], e0 = du ? (du > 0 ? r[0] : r[2]) : (dv > 0 ? r[1] : r[3]); const e = du ? (du > 0 ? e0 - ax : ax - e0) : (dv > 0 ? e0 - az : az - e0);
      const K = R + 0.01; if (e <= K) return null; for (let k = Math.max(K, e - 0.02); ; k = Math.max(K, k - 0.02)) { const x = du ? e0 - du * k : ax, z = du ? az : e0 - dv * k; const w = stepWhy(b, p, s.lv0, x, z, du, dv); if (w) return `a ${(k - R).toFixed(2)} m do primeiro degrau, ${w}`; if (k <= K) return null; } }; // (up to a centimetre from it: there the rim meets it)
    // (by the cells, the plan's foot may stand nearer its own flight than the body's rim: the sobrado#3002 of the generation-18
    // metropole, its ladder's cells 0,12 m past the outline at its foot — the body takes it there, its rim meeting them, and lands
    // there coming down —: its middle off them, and the rim off the others)
    if (!atFoot(s, ax, az) || (!open && (!rimOK(b, p, s.lv0, ax, az, s) || inRect(bar(s), ax, az, 0)))) footBad.push(`${tag}: o pé ${ax},${az} ${atFoot(s, ax, az) ? (inRect(bar(s), ax, az, 0) ? 'dentro das casas do lance' : 'sem a borda do corpo no chão (' + rimWhy(b, p, s.lv0, ax, az, s) + ')') : 'fora de onde o corpo toma o lance'}`);
    else if (!open) { const w = toStep(); if (w) footBad.push(`${tag}: do pé ${ax},${az} o corpo não chega ao lance (${w})`); }
    // 2. the way to it — from the door on the entrance's storey, from the top of a flight coming up to the others (a storey below
    // the entrance is come down to by the flight itself: its foot is where the body lands; an open ground is the street's)
    if (open || s.lv0 < e0) continue; nWay++;
    const starts = s.lv0 === e0 ? (p.entrance.door >= 0 ? [inward(p, 0.6)] : []) : p.stairs.filter(q => q.kind !== 'degraus' && q.lv1 === s.lv0).map(q => q.b);
    if (!starts.some(f => pathIn(b, p, s.lv0, f, s.a))) wayBad.push(`${tag}: nenhum caminho do corpo até o pé ${ax},${az}`);
  }
}
ok('1. o pé de cada lance onde o corpo o toma, com a borda inteira no chão dos pés e fora dos lances', !footBad.length, `${nFl} lances em ${WORLD}${footBad.length ? `: ${footBad.length} sem pé — ${footBad.slice(0, 4).join(' · ')}` : ': todos'}`);
ok('1b. o corpo e as pessoas do mundo pelas mesmas células: cada lance barra o corpo pelas casas dele na planta, e o desenho passa delas meia casa no máximo (0,125 m)', !cellBad.length && nFl > 0,
  `${nFl} lances; o desenho além das casas, o mais: ${Object.entries(deep).map(([k, v]) => `${k} ${(v * 100).toFixed(1)} cm`).join(', ') || '-'}${worstIn ? ` (${worstIn.tag})` : ''}${cellBad.length ? `; ${cellBad.length} FORA — ${cellBad.slice(0, 3).join(' · ')}` : ''}`);
ok('2. um caminho do corpo, pela regra dele, da porta (ou do topo do lance de baixo) até o pé de cada lance', !wayBad.length, `${nWay} lances${wayBad.length ? `: ${wayBad.length} sem caminho — ${wayBad.slice(0, 4).join(' · ')}` : ': todos'}`);

// ------------------------------ 3. the body for real ------------------------------
let bad = [];
function check() {
  const v = G.Possess.body(), s = st(); if (!v || !s || s.loco !== 'ground') return;
  const ins = Sp.indoor(s.X, s.Z, s.lv, s.inB ? s.inB.id : 0); if (!ins) return;
  const q = ins.p.stairs.find(f => f.kind !== 'degraus' && f.lv0 === ins.lv && inRect(f.r, ins.x, ins.z, 0)); if (q) bad.push(`dentro do lance ${q.id} de ${ins.b.type}#${ins.b.id} em ${ins.x.toFixed(2)},${ins.z.toFixed(2)}`);
}
function walkTo(X, Z, max, near) {
  let k = 0, still = 0, last = [st().X, st().Z];
  for (; k < (max || 300); k++) {
    const dx = X - st().X, dz = Z - st().Z; if (Math.hypot(dx, dz) < (near || 0.15)) break;
    IN.camYaw = Math.atan2(dz, dx); IN.mz = 1; IN.mx = 0; frame(); check();
    if (Math.hypot(st().X - last[0], st().Z - last[1]) < 0.004) { if (++still > 25) break; } else still = 0; last = [st().X, st().Z];
  }
  stop(); for (let q = 0; q < 6; q++) { frame(); check(); }
  return Math.hypot(X - st().X, Z - st().Z);
}
let followAt = '';
const follow = (b, pts) => { followAt = ''; for (const pt of pts) { const d = walkTo(b.x * TL + pt[0], b.y * TL + pt[1], 200, 0.12);
  const ds = pt.door !== undefined && In.doorState(b, pt.door); if (ds && ds.state !== 'aberta') { G.Possess.apply(w => In.useDoor(b, pt.door, 'abrir', w)); frame(); }
  if (d > 0.3) { followAt = `parado em ${(st().X - b.x * TL).toFixed(2)},${(st().Z - b.y * TL).toFixed(2)}, a ${d.toFixed(2)} m de ${pt[0].toFixed(2)},${pt[1].toFixed(2)}; barrado por ${st().block || 'nada'}`; return false; } } return true; };
{ // (one building of each family with a flight up from the entrance's storey and a door on a street — the sobrado #2938 first —,
  // lived by one of its household free at that moment: a building with nobody free then is passed over for the next)
  const famSeen = new Set(); const want = blds.filter(b => b.id === 2938).concat(blds.filter(b => b.id !== 2938)); const pick = [];
  let upN = 0; const why = [], done = [], out3 = [];
  for (const b of want) {
    if (pick.length >= NB) break; if (!In.planDoor(b) || (b.id !== 2938 && famSeen.has(b.ip.f))) continue; const p = Sp.planNow(b); if (!p || !p.ok || !p.entrance || p.entrance.door < 0 || !ups(p, p.entryLv || 0).length) continue;
    const s = ups(p, p.entryLv || 0)[0]; const v = [...S.villagers.values()].filter(o => o.home === b.id && o.age >= 18 && o.age < 55 && !o.sleeping && G.Possess.can(o).ok).sort((a, c) => a.id - c.id)[0];
    if (!v) continue; famSeen.add(b.ip.f); pick.push(b);
    if (G.Possess.body()) G.Possess.release('deus'); G.Avatar.detach();
    const d = In.planDoor(b); G.inSim++; G.Vg.endTask(v); v.inside = 0; v.x = d[0]; v.y = d[1]; v.path = null; G.inSim--;
    if (!G.Possess.take(v).ok) { why.push(`${b.type}#${b.id}: não deu para encarnar ${v.name}`); continue; }
    G.Avatar.attach(v, 0); for (let k = 0; k < 4; k++) frame();
    G.Possess.apply(w => { In.useDoor(b, p.entrance.door, 'abrir', w); return { ok: true }; }); frame();
    const o = inward(p, -0.6); walkTo(b.x * TL + o[0], b.y * TL + o[1], 300, 0.08); const i = inward(p, 0.6); walkTo(b.x * TL + i[0], b.y * TL + i[1], 300);
    // (in by its door first — the threshold is the soleira proof's: a building the body did not get into is passed over, said)
    if (v.inside !== b.id) { pick.pop(); out3.push(`${b.type}#${b.id} (não entrou pela porta: parado em ${(st().X - b.x * TL).toFixed(2)},${(st().Z - b.y * TL).toFixed(2)})`); continue; }
    const here = [st().X - b.x * TL, st().Z - b.y * TL]; const pa = pathIn(b, p, p.entryLv || 0, here, s.a);
    if (!pa || !follow(b, pa)) { why.push(`${b.type}#${b.id} (${b.ip.f}): ${pa ? 'não chegou ao pé: ' + followAt : `nenhum caminho ao pé ${s.a.join(',')} de ${here.map(q => q.toFixed(2)).join(',')} (dentro: ${v.inside === b.id})`}`); continue; }
    walkTo(b.x * TL + s.b[0], b.y * TL + s.b[1], 600, 0.2); for (let k = 0; k < 600 && st().loco === 'stair'; k++) frame();
    if (G.Possess.level() === s.lv1) { upN++; done.push(`${b.type}#${b.id} (${b.ip.f})`); } else why.push(`${b.type}#${b.id} (${b.ip.f}): no pé, não subiu (piso ${G.Possess.level()}, ${st().block || 'nada'})`);
  }
  ok('3. o corpo de verdade entra, anda até o pé do lance pelo caminho do corpo e sobe ao piso de cima', pick.length > 0 && upN === pick.length && !bad.length, `${upN} de ${pick.length} prédios${done.length ? ' — subiu em ' + done.slice(0, 4).join(', ') : ''}${out3.length ? ' — deixados: ' + out3.join(', ') : ''}${why.length ? ' — ' + why.slice(0, 3).join(' · ') : ''}${bad.length ? ' — ' + bad.slice(0, 2).join(' · ') : ''}`); }

// ------------------------------ 4. the verifier ------------------------------
{ const vb = vbad(), er = M.erros(); ok('4. o verificador limpo, sem erro de módulo', !vb.length && !Object.keys(er.mod).length, `${vb.length ? vb.slice(0, 3).map(q => `S${q.sev} ${q.sys}: ${q.msg}`).join(' · ') : 'verificador limpo'}; módulos ${JSON.stringify(er.mod)}`); }
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
