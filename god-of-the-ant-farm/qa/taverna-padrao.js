// taverna-padrao: o padrão da taverna dos interiores 2.0 (P3; D-720 a D-724) — a taberna de 8 m, a taverna de 12 e a hospedaria
// de 16 dos seis povos, medidas na planta pronta, por contas desta prova (não as da receita):
//   t1 o padrão em todo povo, tamanho, lado e frente: a planta válida; o salão com o chão do padrão (30 / 60 / 110 m²); os
//      lugares à mesa (8 / 16 / 30: o assento sobre uma peça de sentar ao pé de uma mesa); o corredor de 1 m da porta ao
//      balcão, ao fogo, ao estrado do músico, ao pé da escada e a toda mesa (a faixa de 1 m inteira, num quadriculado de 10 cm);
//      o balcão contra a parede (a prateleira encostada, o balcão a uma faixa do taverneiro dela; o de alvenaria ao longo da
//      frente); ninguém sentado no ar (todo lugar de sentar e de comer sobre a sua peça — In.rootY); nenhuma peça fixa solta
//      no meio do salão senão o fogo comprido do nórdico; a escada encostada; a cuba no chão; o salão até o telhado (o andar de
//      cima só sobre o fundo na de 8 e na de 12; na de 16 as galerias dos lados); a casca de longe a da planta
//   t2 as variantes: ≥ 3 por povo e tamanho, nenhum par igual entre doze tavernas; a riqueza do dono muda a planta; a mesma
//      planta duas vezes da mesma entrada
//   t3 o tempo de fazer a planta (alvo: 400 ms de CPU em Node, sem cache)
//   t4 no mundo: a taberna pela mão do deus; a riqueza do taverneiro na virada do dia (rec.q, o fato 'riqueza', a planta
//      válida), a paciência de 20 dias, a faixa que não vai e volta; salvar e carregar no meio; o taverneiro morto; a taverna
//      derrubada; o verificador limpo
//   t5 um save antigo (qa/oldsave_7.json): as tavernas de antes viram a taberna e a estalagem, com o fato da reforma
//   node qa/taverna-padrao.js            a prova rápida (t1 a t3, quatro tavernas por povo e tamanho: poucos minutos)
//   N=12 ONLY=t1,t2,t3,t4,t5 node qa/taverna-padrao.js   a inteira (doze por povo e tamanho, o mundo e o save antigo), antes da versão
const M = require('./nodemundo.js');
const fs = require('fs'), path = require('path');
const ONLY = (process.env.ONLY || 't1,t2,t3').split(','); const on = k => ONLY.includes(k);
// (the checker with the world's case: the t4 counts what QA.check says before and after — the plans alone need none; loaded
// with the game, as the page does, or the t4 never ran: T-2131)
const G = M.load({ qa: on('t4') });
const In = G.Interiors;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | taverna-padrao ${name} | ${info}`); if (!c) fails.push(name); };
const NK = Math.max(4, +(process.env.N || 4)); // (the taverns of each people and size: the sides, the fronts and the wealths go round)
const POVOS = ['classico', 'romano', 'grego', 'egipcio', 'nordico', 'asteca'];
const SIZES = [2, 3, 4]; const MIN = { 2: { hall: 30, seats: 8 }, 3: { hall: 60, seats: 16 }, 4: { hall: 110, seats: 30 } };
const FAM = { 2: 'taberna.salao', 3: 'estalagem.andar', 4: 'estalagem.andar' };
const clock = () => { const u = process.cpuUsage(); return (u.user + u.system) / 1000; };
const strip = o => { const x = Object.assign({}, o); delete x.key; return JSON.stringify(x); };
const some = (a, k) => a.slice(0, k || 3);
const blankS = () => ({ villagers: new Map(), buildings: new Map(), dead: new Map(), settlements: new Map(), clock: 100, day: 3, time: 0.4, avatar: null, nextId: 1000, history: [], fire: new Float32Array(G.N * G.N), occ: new Int32Array(G.N * G.N) });
const rec = (c, s, n, o, q) => ({ v: In.REC_V, f: FAM[n], r: 0, t: 'taverna', u: In.TYPES.taverna.use, s, o, c, e: 3, k: 'ae', cl: c === 'egipcio' ? 'q' : 't', fl: 0, d: 1, w: 1, pw: 0, h: [], m: 0, fx: [], dr: {}, hh: 0, nm: 0, vz: 0, ab: 0, n, q });
const MASKS = { 2: [3, 1, 2], 3: [7, 2, 1, 4, 3], 4: [15, 6, 1, 8, 3] };
const SIDES = ['S', 'E', 'W', 'N'];
const tag = m => `${m.c}/${m.n * 4}m/${m.s}/o${m.o}/q${m.q}#${m.b.id}`;
// (the taverns of the proof: each people and size, each side, four fronts and the three wealths — the ids all different)
let made = null;
const make = () => {
  if (made) return made; G.S = blankS(); made = []; let id = 61003;
  for (const n of SIZES) for (const c of POVOS) for (let k = 0; k < NK; k++) {
    const s = SIDES[k % 4], o = MASKS[n][k % MASKS[n].length], q = k % 3; id += 97 + k;
    const b = { id, type: 'taverna', style: c, x: 8, y: 8, w: n, h: n, built: true }; b.ip = rec(c, s, n, o, q);
    const t0 = clock(); const p = In.makeFam(b, b.ip, FAM[n]); const ms = clock() - t0; G.S.buildings.set(b.id, b);
    made.push({ n, c, s, o, q, k, b, p, ms, so: In.shellOf(b) });
  }
  return made;
};
// ---------------------------------------------------------------- the measures, from the finished plan alone
const ITEMS = In.ITEMS;
const TABLES = { 'mesa-taverna': 1, 'mesa-redonda': 1 };
const SEATS = { banquinho: 1, banco: 1, cadeira: 1 };
const rectsOf = it => (it.parts && it.parts.length ? it.parts : [it.r]);
const inRect = (r, x, z, e) => x >= r[0] - (e || 0) && x <= r[2] + (e || 0) && z >= r[1] - (e || 0) && z <= r[3] + (e || 0);
const gapOf = (a, b) => Math.max(0, Math.max(a[0], b[0]) - Math.min(a[2], b[2]), Math.max(a[1], b[1]) - Math.min(a[3], b[3]));
const hallOf = p => p.rooms.find(q => q.fn === 'salao' && q.lv === 0);
const inHall = (p, it) => { const h = hallOf(p); return it.lv === 0 && (it.room === h.id || inRect(h.r, it.x, it.z, 1e-6)); };
// (the seats at the tables: the places on a piece one sits on, next to a table of the hall)
function seatsAt(p) {
  const its = p.items.filter(it => inHall(p, it)); const tabs = its.filter(it => TABLES[it.kind]); let n = 0;
  for (const it of its) { if (!SEATS[it.kind] || !tabs.some(t => gapOf(t.r, it.r) <= 0.12)) continue; n += it.spots.filter(sp => sp.on && sp.use === 'sentar').length; }
  return n;
}
// (the corridor: the hall on a 10 cm grid, each cell's room to the nearest wall or piece; the cells a metre's way passes —
// half a metre each side — flooded from inside the hall's door)
function corridor(p) {
  const h = hallOf(p); const R = h.r; const CS = 0.1; const nx = Math.round((R[2] - R[0]) / CS), nz = Math.round((R[3] - R[1]) / CS);
  const obs = []; for (const it of p.items) if (it.lv === 0 && gapOf(it.r, R) <= 0) for (const r of rectsOf(it)) obs.push(r);
  for (const st of p.stairs) if (st.lv0 === 0 && st.kind !== 'degraus') obs.push(st.r);
  const C = new Float32Array(nx * nz);
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const x = R[0] + (i + 0.5) * CS, z = R[1] + (j + 0.5) * CS; let d = Math.min(x - R[0], R[2] - x, z - R[1], R[3] - z);
    for (const r of obs) { const dx = Math.max(r[0] - x, 0, x - r[2]), dz = Math.max(r[1] - z, 0, z - r[3]); d = Math.min(d, Math.hypot(dx, dz)); if (d <= 0) break; }
    C[j * nx + i] = d;
  }
  // (the door of the hall: onto the street, or onto the yard of the 16 m)
  const d = p.doors.find(q => q.rooms.includes(h.id) && q.rooms.some(x => x === 'rua' || (p.rooms[x] && p.rooms[x].fn === 'terreiro')));
  const w = p.walls[d.wall]; const len = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]); const dp = [w.a[0] + (w.b[0] - w.a[0]) * d.at / len, w.a[1] + (w.b[1] - w.a[1]) * d.at / len];
  const cx = (R[0] + R[2]) / 2, cz = (R[1] + R[3]) / 2; const horiz = Math.abs(w.a[1] - w.b[1]) < 1e-6;
  const start = horiz ? [dp[0], dp[1] + Math.sign(cz - dp[1]) * 0.6] : [dp[0] + Math.sign(cx - dp[0]) * 0.6, dp[1]];
  const half = 0.5 - 1e-6; const seen = new Uint8Array(nx * nz); const q = [];
  const cell = (x, z) => [Math.floor((x - R[0]) / CS), Math.floor((z - R[1]) / CS)];
  const [si, sj] = cell(start[0], start[1]);
  for (let dj = -3; dj <= 3; dj++) for (let di = -3; di <= 3; di++) { const i = si + di, j = sj + dj; if (i < 0 || j < 0 || i >= nx || j >= nz) continue; const k = j * nx + i; if (C[k] >= half && !seen[k]) { seen[k] = 1; q.push(k); } }
  for (let h0 = 0; h0 < q.length; h0++) { const k = q[h0]; const i = k % nx, j = (k - i) / nx;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const a = i + di, c = j + dj; if (a < 0 || c < 0 || a >= nx || c >= nz) continue; const k2 = c * nx + a; if (seen[k2] || C[k2] < half) continue; seen[k2] = 1; q.push(k2); } }
  const reach = (pt, r) => { const [i0, j0] = cell(pt[0], pt[1]); const k = Math.ceil(r / CS); for (let j = j0 - k; j <= j0 + k; j++) for (let i = i0 - k; i <= i0 + k; i++) { if (i < 0 || j < 0 || i >= nx || j >= nz || !seen[j * nx + i]) continue; if (Math.hypot(R[0] + (i + 0.5) * CS - pt[0], R[1] + (j + 0.5) * CS - pt[1]) <= r) return true; } return false; };
  // (how far from a point the nearest cell the metre reaches: for the reports)
  const gapTo = pt => { let d = Infinity; for (const k of q) { const i = k % nx, j = (k - i) / nx; d = Math.min(d, Math.hypot(R[0] + (i + 0.5) * CS - pt[0], R[1] + (j + 0.5) * CS - pt[1])); } return d; };
  return { reach, gapTo, start, cells: q.length };
}
// (the fixed pieces of the hall that stand against a wall — the hall's sides, the partition, the loft's edge: none in the middle)
const WALLED = { 'prateleira-bar': 1, anforeira: 1, barril: 1, lareira: 1, 'forno-barro': 1, 'fogao-comal': 1, 'estrado-musico': 1, cuba: 1, 'balcao-alvenaria': 1 };
const FIRES = { lareira: 1, 'forno-barro': 1, 'fogao-comal': 1, 'fogo-comprido': 1 };
const touches = (R, r, e) => Math.abs(r[0] - R[0]) <= e || Math.abs(r[2] - R[2]) <= e || Math.abs(r[1] - R[1]) <= e || Math.abs(r[3] - R[3]) <= e;
function judge(m) {
  const p = m.p, why = []; if (!p.ok) return [`inválida: ${(p.errs || []).slice(0, 2).join('; ')}`];
  if (p.fam !== FAM[m.n]) why.push(`a família ${p.fam}`);
  const h = hallOf(p); if (!h) return ['sem salão']; const R = h.r; const area = In.roomArea(h);
  if (area < MIN[m.n].hall - 1e-6) why.push(`o salão de ${area.toFixed(0)} m²`);
  const seats = seatsAt(p); if (seats < MIN[m.n].seats) why.push(`${seats} lugares à mesa`);
  const hall = p.items.filter(it => inHall(p, it));
  // (the corridor)
  const K = corridor(p); const one = (pts, what) => { if (!pts.length) why.push(`sem ${what}`); else if (!pts.some(pt => K.reach(pt, 0.35))) why.push(`o corredor de 1 m não chega ${what} (a ${Math.min(...pts.map(K.gapTo)).toFixed(2)} m)`); };
  const bal = hall.find(it => it.kind === 'balcao' || it.kind === 'balcao-alvenaria');
  one(bal ? bal.spots.filter(sp => sp.use === 'comprar').map(sp => [sp.x, sp.z]) : [], 'ao balcão');
  const fire = hall.find(it => FIRES[it.kind]); one(fire ? fire.spots.filter(sp => sp.use === 'cozinhar').map(sp => [sp.x, sp.z]) : [], 'ao fogo');
  const stage = hall.find(it => it.kind === 'estrado-musico'); one(stage ? stage.spots.filter(sp => sp.use === 'acesso').map(sp => [sp.x, sp.z]) : [], 'ao estrado do músico');
  const st = p.stairs.find(q => q.kind === 'escada' && q.lv0 === 0); one(st ? [st.a] : [], 'ao pé da escada');
  for (const t of hall.filter(it => TABLES[it.kind])) { const acc = []; for (const s0 of hall.filter(it => SEATS[it.kind] && gapOf(t.r, it.r) <= 0.12)) for (const sp of s0.spots) if (!sp.on && sp.use === 'acesso') acc.push([sp.x, sp.z]); if (!acc.some(pt => K.reach(pt, 0.35))) { why.push(`o corredor de 1 m não chega à mesa ${t.id} (${t.kind} em ${t.r.join(',')}; a ${Math.min(...acc.map(K.gapTo)).toFixed(2)} m)`); break; } }
  // (the counter against the wall: the shelf against it, the counter a keeper's lane before it; the masonry one along the front)
  const sh = hall.find(it => it.kind === 'prateleira-bar'); if (!sh) why.push('sem a prateleira do bar'); else if (!touches(R, sh.r, 0.05)) why.push('a prateleira do bar solta');
  if (bal && bal.kind === 'balcao' && sh) { const lane = gapOf(bal.r, sh.r); if (lane < 0.85 || lane > 1.15) why.push(`o balcão a ${lane.toFixed(2)} m da prateleira`); }
  if (bal && bal.kind === 'balcao-alvenaria' && !touches(R, bal.r, 0.05)) why.push('o balcão de alvenaria solto');
  // (nobody seated in the air: every place of sitting and of eating on its piece — the root the 3D gives on its seat)
  for (const it of p.items) for (const sp of it.spots) {
    if (sp.use !== 'sentar' && sp.use !== 'comer') continue;
    if (!sp.on || !rectsOf(it).some(r => inRect(r, sp.x, sp.z, 0.02))) { why.push(`${it.kind}: um lugar de ${sp.use} fora da peça (no ar)`); break; }
    const y = In.rootY(it, sp, 'sit'); if (!(y >= 0 && y <= 0.05)) { why.push(`${it.kind}: sentado a ${y.toFixed(2)} m`); break; }
  }
  // (no fixed piece loose in the hall — the Norse long fire alone —; the stair against its wall; the vat on the ground)
  for (const it of hall) if (WALLED[it.kind] && !touches(R, it.r, 0.06)) why.push(`${it.kind} solto no salão`);
  if (st && !touches(R, st.r, 0.06) && !touches(p.levels.find(l => l.lv === 0).area, st.r, 0.06)) why.push('a escada solta');
  if (p.items.some(it => it.kind === 'cuba' && it.lv > 0)) why.push('a cuba no andar de cima');
  // (the hall up to the roof: the storey above, in the 8 m and the 12, only over the back — in the 16 the galleries along the sides)
  const up = p.levels.find(l => l.lv === 1); const hd = R[3] - R[1], hw = R[2] - R[0];
  if (up) { const A = (up.areas && up.areas.length ? up.areas : [up.area]); const over = A.reduce((s, a) => s + Math.max(0, Math.min(a[2], R[2]) - Math.max(a[0], R[0])) * Math.max(0, Math.min(a[3], R[3]) - Math.max(a[1], R[1])), 0);
    const lim = m.n === 2 ? 0.45 : m.n === 3 ? 0.02 : 0.45; if (over > area * lim + 1e-6) why.push(`o andar de cima cobre ${(100 * over / area).toFixed(0)}% do salão`); void hd; void hw; }
  // (the shell seen from afar: the plan's)
  if (!m.so || strip(m.so) !== strip(In.shellOfPlan(p))) why.push('a casca de longe outra');
  m.seats = seats; m.area = area;
  return why;
}
// ================================================================ t1: the pattern
if (on('t1')) {
  const all = make(); const out = []; const sum = {};
  for (const m of all) { const why = judge(m); if (why.length) out.push(`${tag(m)}: ${why.join(', ')}`); else { const k = `${m.c}/${m.n * 4}`; const S = sum[k] || (sum[k] = { a: [], s: [] }); S.a.push(m.area); S.s.push(m.seats); } }
  const line = Object.entries(sum).map(([k, S]) => `${k} ${Math.min(...S.a).toFixed(0)} m² ${Math.min(...S.s)}–${Math.max(...S.s)}`).join(', ');
  ok('t1 o padrão: o salão, os lugares à mesa, o corredor de 1 m, o balcão contra a parede, ninguém no ar, nenhuma peça solta, o salão até o telhado, a casca', !out.length, `${all.length - out.length} de ${all.length}${out.length ? ' — ' + some(out, 4).join(' / ') : ''}; ${line}`);
}
// ================================================================ t2: the variants
if (on('t2')) {
  const all = make(); const out = [], sum = [];
  const sig = p => JSON.stringify(p.items.filter(it => it.lv === 0).map(it => [it.kind, it.r.map(x => Math.round(x * 10))]).sort());
  // (the layouts the record gives — the bar, the stage, the mirror —: asked of the record's choices for 24 ids, on the traits of
  // a plan made, with no plan made for each)
  const lays = m => { const P0 = m.p._P; const out = new Set(); if (!P0) return out; for (let k = 0; k < 24; k++) { const X = In.tavAxes({ rec: Object.assign({}, P0.rec, { s: SIDES[k % 4], o: MASKS[m.n][k % MASKS[m.n].length] }), L: P0.L, b: { id: 81001 + k * 7919 }, tr: P0.tr }); if (X) out.add(`${X.bar}/${X.stage}/${X.flip}`); } return out; };
  for (const n of SIZES) for (const c of POVOS) {
    const ms = all.filter(m => m.n === n && m.c === c && m.p.ok); const sigs = ms.map(m => sig(m.p));
    const same = []; for (let i = 0; i < sigs.length; i++) for (let j = i + 1; j < sigs.length; j++) if (sigs[i] === sigs[j]) same.push(`${tag(ms[i])} = ${tag(ms[j])}`);
    const vars = ms.length ? lays(ms[0]) : new Set(); if (vars.size < 3) out.push(`${c}/${n * 4}m: ${vars.size} variantes (${[...vars].join(' ')})`);
    if (same.length) out.push(`${c}/${n * 4}m: iguais ${some(same, 2).join(', ')}`);
    sum.push(`${c}/${n * 4} ${vars.size}`);
  }
  ok(`t2a ≥ 3 variantes por povo e tamanho (o bar, o estrado, o espelho), nenhum par de plantas igual entre ${NK}`, !out.length, some(out, 4).join(' / ') || sum.join(', '));
  // (the owner's wealth: the same building at the three steps — the round tables and the owner's chair of the rich)
  const w = []; const kinds = p => new Set(p.items.filter(it => it.lv === 0).map(it => it.kind));
  for (const n of SIZES) for (const c of POVOS) {
    const ps = [0, 1, 2].map(q => { const b = { id: 70001 + n * 31 + c.length, type: 'taverna', style: c, x: 8, y: 8, w: n, h: n, built: true }; b.ip = rec(c, 'S', n, MASKS[n][0], q); return In.makeFam(b, b.ip, FAM[n]); });
    if (!ps.every(p => p.ok)) { w.push(`${c}/${n * 4}m: ${ps.map(p => p.ok ? 'ok' : p.errs[0]).join(' | ')}`); continue; }
    if (sig(ps[0]) === sig(ps[2])) w.push(`${c}/${n * 4}m: o pobre e o rico com a mesma planta`);
    if (!kinds(ps[2]).has('cadeira') && !kinds(ps[2]).has('mesa-redonda')) w.push(`${c}/${n * 4}m: o rico sem a mesa redonda nem a cadeira`);
  }
  ok('t2b a riqueza do dono muda a planta (o rico com as mesas redondas e a cadeira, o pobre com as compridas)', !w.length, some(w, 4).join(' / ') || `os seis povos nos três tamanhos`);
  const diff = all.filter(m => m.p.ok && m.k < 2).filter(m => { In.uncache(); const q = In.makeFam(m.b, m.b.ip, FAM[m.n]); return JSON.stringify([q.rooms, q.items.map(i => [i.kind, i.x, i.z, i.ry]), q.doors, q.holes]) !== JSON.stringify([m.p.rooms, m.p.items.map(i => [i.kind, i.x, i.z, i.ry]), m.p.doors, m.p.holes]); });
  ok('t2c a mesma planta duas vezes da mesma entrada', !diff.length, `${diff.length} diferentes${diff.length ? ': ' + some(diff).map(tag).join(', ') : ''}`);
}
// ================================================================ t3: the time
if (on('t3')) {
  const all = make(); const ts = all.slice().sort((a, b) => b.ms - a.ms); const med = all.map(q => q.ms).sort((a, b) => a - b)[all.length >> 1];
  const again = ts.slice(0, 3).map(m => { let best = Infinity; for (let r = 0; r < 3; r++) { In.uncache(); const a = clock(); In.makeFam(m.b, m.b.ip, FAM[m.n]); best = Math.min(best, clock() - a); } return [tag(m), best]; }).sort((a, b) => b[1] - a[1]);
  ok('t3 o tempo de fazer a planta (alvo: 400 ms de CPU em Node)', again[0][1] < 400, `as mais caras ${again.map(([k, ms]) => `${ms.toFixed(0)} ms (${k})`).join(', ')}, sem cache; a mediana ${med.toFixed(0)} ms na rodada`);
}
// ================================================================ t4: in the world
if (on('t4')) {
  // (what the checker says that it did not say before the case — by the verdict, not by the count —, but the age of a story: the
  // proof moves the day on by its hand, the turn of the day of the plans alone (In.onNewDay), and the stories the world's step
  // would have closed as their days ran out stay open — the rule of their age reads the day counter, not the case: T-2131)
  const ageOfStory = q => q.sys === 'story' && /: ativa há \d+ anos \(máx\. \d+\)$/.test(q.msg);
  const qaS = () => globalThis.QA.check().filter(q => q.sev <= 2 && !ageOfStory(q)); const vk = q => q.sys + '|' + q.msg;
  // (a world whose households have their houses — the keeper's coins are his house's, by the ledger: in a new world, on its first
  // day, nobody has a house yet and no keeper is found, T-2131 —, the one asked for and not another: R12)
  M.pronto('cidade'); const out = [], said = [];
  if (G.S.villagers.size < 100) out.push(`o mundo pronto «cidade» não abriu (${G.S.villagers.size} pessoas)`);
  const q0 = new Set(qaS().map(vk));
  const set = [...G.S.settlements.values()].filter(s => G.Fac.get(s.fac) && G.Eco.coinage && G.Eco.coinage(s.fac)).sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0]
    || [...G.S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0];
  let b; G.inSim++; try { b = G.Village.handFound(set, 'taverna', 'taberna', { built: true, R: 40 }); } finally { G.inSim--; }
  if (!b) out.push('a taberna sem lote');
  else {
    const id = b.id; const p0 = In.plan(b); if (!p0 || !p0.ok || b.ip.f !== FAM[2]) out.push(`a taberna: ${b.ip.f}, ${p0 && p0.ok ? 'válida' : 'inválida ' + (p0 ? p0.errs[0] : '')}`);
    // (its keeper: one of the town, by the proof's hand — held while the case lasts: T-850 —, his house's coins by the ledger)
    const k = [...G.S.villagers.values()].filter(v => v.set === set.id && v.age >= 20 && v.age < 55 && !v.captive && G.Eco.homeOf(v)).sort((a, c) => a.id - c.id)[0];
    const hold = () => { k.job = id; k.role = 'taverneiro'; };
    const coins = n => { const r = 'h:' + k.home; const have = G.Depot.get(r, 'moedas'); const f = 'f:' + G.Fac.ofV(k).id; if (n > have) G.Depot.move(f, r, 'moedas', n - have, { code: 'prova', by: k.id }); else if (n < have) G.Depot.move(r, f, 'moedas', have - n, { code: 'prova', by: k.id }); return G.Depot.get(r, 'moedas'); };
    const day = () => { G.S.day++; hold(); G.inSim++; try { In.onNewDay(); } finally { G.inSim--; } return G.S.buildings.get(id); };
    const facts = () => G.S.buildings.get(id).ip.h.filter(f => f[1] === 'riqueza').length;
    if (!k) out.push('sem taverneiro na cidade');
    else {
      hold(); G.Fac.ofV(k).stock.moedas = Math.max(G.Fac.ofV(k).stock.moedas || 0, 500);
      const q0r = b.ip.q | 0; coins(60); let b1 = day();
      if ((b1.ip.q | 0) !== 2 || facts() !== 1) out.push(`a riqueza: ${q0r} → ${b1.ip.q} com 60 moedas (${facts()} fatos)`);
      const p1 = In.plan(b1); if (!p1 || !p1.ok) out.push(`a planta do rico inválida: ${p1 ? p1.errs[0] : '-'}`);
      said.push(`o taverneiro com 60 moedas: o degrau ${q0r} → ${b1.ip.q}, a planta ${p1 && p1.ok ? 'válida' : 'NÃO'} (${p1 ? p1.items.filter(i => i.kind === 'cadeira' || i.kind === 'mesa-redonda').length : 0} mesas redondas e cadeiras)`);
      // (the band: 30 coins keep the rich step; 5, after the patience, the poor one — and not before)
      coins(30); b1 = day(); if ((b1.ip.q | 0) !== 2) out.push(`a faixa: 30 moedas tiraram o degrau (${b1.ip.q})`);
      coins(5); b1 = day(); if ((b1.ip.q | 0) !== 2) out.push(`a paciência: o degrau mudou no dia seguinte (${b1.ip.q})`);
      // (saved and loaded in the middle of the patience: the same step, the same plan)
      const sig0 = JSON.stringify(In.plan(b1).items.map(i => [i.kind, i.x, i.z])); M.salvarCarregar(); b1 = G.S.buildings.get(id); const kk = G.S.villagers.get(k.id);
      if (!b1 || (b1.ip.q | 0) !== 2 || JSON.stringify(In.plan(b1).items.map(i => [i.kind, i.x, i.z])) !== sig0) out.push('o save no meio da paciência: outro degrau ou outra planta');
      const k2 = kk; const hold2 = () => { k2.job = id; k2.role = 'taverneiro'; };
      const day2 = () => { G.S.day++; hold2(); G.inSim++; try { In.onNewDay(); } finally { G.inSim--; } return G.S.buildings.get(id); };
      for (let d = 0; d < In.TAV_DAYS; d++) b1 = day2();
      if ((b1.ip.q | 0) !== 0) out.push(`depois da paciência, com 5 moedas: o degrau ${b1.ip.q}`);
      said.push(`a faixa (30 moedas ficam no degrau rico), a paciência de ${In.TAV_DAYS} dias, salvo e carregado no meio: ${b1.ip.q} com 5 moedas`);
      // (the keeper dead: no keeper, no change)
      const r0 = b1.ip.r; G.inSim++; try { G.Village.kill(k2, 'old'); } finally { G.inSim--; }
      for (let d = 0; d < In.TAV_DAYS + 1; d++) { G.S.day++; G.inSim++; try { In.onNewDay(); } finally { G.inSim--; } }
      const b2 = G.S.buildings.get(id); if (G.Taverna.keeperOf(b2)) said.push('(um taverneiro novo)'); else if (b2.ip.r !== r0) out.push('sem taverneiro, o registro mudou');
      said.push('o taverneiro morto: a planta fica');
    }
    // (the god pulls it down: the ruin, with its plan; saved and loaded)
    const b3 = G.S.buildings.get(id); G.inSim++; try { G.Village.destroyBuilding(b3, 'deus'); } finally { G.inSim--; }
    const r = G.S.buildings.get(id); const pr = r && In.plan(r); if (!r || r.type !== 'ruin' || !pr || !pr.ok) out.push(`a ruína: ${r ? r.type : 'sumiu'}, ${pr && pr.ok ? 'planta ok' : 'planta NÃO'}`);
    M.salvarCarregar(); said.push('a taberna derrubada pelo deus: a ruína com a planta, salva e carregada');
  }
  const bad = qaS().filter(q => !q0.has(vk(q))); if (bad.length) out.push(`o verificador: ${some(bad, 2).map(q => q.msg.slice(0, 120)).join('; ')}`);
  ok('t4 no mundo: a riqueza do taverneiro na virada do dia, a faixa, a paciência, o save no meio, o taverneiro morto, a ruína; o verificador limpo', !out.length && M.limpo(), out.length ? out.join(' / ') : said.join('; ') + (M.limpo() ? '' : '; ERROS: ' + JSON.stringify(M.erros()).slice(0, 200)));
}
// ================================================================ t5: an old save
if (on('t5')) {
  const out = []; let threw = '';
  try { M.abrir(JSON.parse(fs.readFileSync(path.join(__dirname, 'oldsave_7.json'), 'utf8'))); } catch (e) { threw = e.message; }
  const tv = threw ? [] : [...G.S.buildings.values()].filter(b => b.ip && b.ip.t === 'taverna');
  for (const b of tv) {
    const n = b.w; if (b.type !== 'ruin' && b.ip.f !== FAM[n]) out.push(`${b.type}#${b.id} (${n * 4} m): ${b.ip.f}`);
    const p = In.plan(b); if (!p || !p.ok) out.push(`${b.type}#${b.id}: a planta ${p ? p.errs[0] : 'nenhuma'}`);
  }
  const refs = tv.filter(b => b.ip.h.some(f => f[1] === 'reforma')).length;
  ok('t5 um save antigo: as tavernas de antes na taberna e na estalagem, com a reforma dita; as plantas válidas; sem erro', !threw && !out.length && M.limpo(), threw ? 'ERRO: ' + threw : `${tv.length} tavernas (${refs} com o fato da reforma)${out.length ? ' — ' + some(out, 4).join(' / ') : ''}${M.limpo() ? '' : '; ERROS: ' + JSON.stringify(M.erros()).slice(0, 200)}`);
}
const err = M.erros(); if (Object.keys(err.mod).length || err.console.length) ok('sem erros de módulo', false, JSON.stringify(err).slice(0, 300));
console.log(fails.length ? `FALHAS: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
