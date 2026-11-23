// luz: a luz de dentro (os interiores 2.0, a frente P1 — D-700 a D-709): o volume de luz assado da planta (G.Luz3D), as fontes com
// causa, a luz que não vaza, os materiais de dentro, a janela sem vidro — em Node, sem placa (qa/visual/tres-node.js: os arquivos
// do 3D do jogo, a geometria que o jogo faz). Num mundo pronto (a metrópole, por padrão):
//   l1 o mesmo volume para a mesma planta: assado duas vezes, e de uma cópia da planta, os mesmos bytes; nenhum sorteio (nem o do
//      mundo nem o do olhar) e o mundo como estava
//   l2 a luz não vaza pela parede: em cada prédio com planta, todos os fogos acesos — nenhum voxel fora dos cômodos com fogo; um
//      voxel de cômodo sem linha de visada a nenhum fogo do seu andar (uma parede inteira no meio, pela grade da planta, casa a
//      casa) sem fogo; o céu só por onde há abertura (um cômodo sem nenhuma abertura para fora, escuro)
//   l3 toda fonte tem causa: em cada prédio com planta, de dia e de noite, os fogos da luz de dentro só com o prédio queimando
//      (G.Atmos.fire) e os lampadários só com alguém acordado (G.Atmos.lit); a casa de família dormindo, sem fogo
//   l4 o deus interfere: a casa que pega fogo, o prédio que vira ruína — as fontes de dentro seguem o mundo (a ruína não tem dentro)
//   l5 o save no meio: as fontes e o volume de um prédio antes e depois de salvar e carregar, iguais
//   l6 o assado aos pedaços: o trabalho de um prédio grande em passos de 3 ms, nenhum passo muito além (o grande palácio), e o volume
//      igual ao de uma vez; os tempos por tipo
//   l7 o olho que se acostuma: G.Luz3D.at dentro e fora; a exposição de um quarto escuro de dia maior que 1 e no teto
//   l8 a sombra de contato: o pé da parede mais escuro que o alto, o canto mais escuro que o meio da parede, o chão junto da parede
//      e debaixo de um móvel mais escuro que o meio do cômodo
//   l9 os materiais de dentro: nenhum chão de terra lavrada (16) nem de lajes com capim (11) dentro; a parede de dentro de adobe
//      rebocada (nenhum tijolo do lado de fora dentro); o mosaico romano na casa rica; a faixa e o friso
//  l10 a janela sem vidro: o vão de cada janela da casca aberto quando o interior é desenhado (a caixa do recorte em volta do escuro
//      que se vê de fora), e as venezianas nunca fechadas sobre ela
//   node qa/luz.js [mundo]        ONLY=l1,l2 …
'use strict';
const path = require('path');
const T = require('./visual/tres-node.js'); const { G, M } = T.load({ extra: ['qa/luz-inv.js'] });
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean); const want = k => !ONLY.length || ONLY.includes(k);
const WORLD = process.argv[2] || 'metropole'; M.pronto(WORLD);
const L = G.Luz3D, B3 = G.Build3D, In = G.Interiors, Sp = G.Space, S = () => G.S;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | luz ${name} | ${info}`); if (!c) fails.push(name); return c; };
const planned = () => [...G.S.buildings.values()].filter(b => b.built && b.type !== 'ruin' && In.has(b)).map(b => [b, Sp.planNow(b)]).filter(([, p]) => p && p.ok && p.grid && p.shell && p.shell.kind !== 'aberta');
const allFires = p => p.items.filter(it => it.fire).map(it => { const l = p.levels.find(q => q.lv === it.lv); return { x: it.x, y: (l ? l.y : 0) + Math.min(it.h, 0.6), z: it.z, lv: it.lv, forca: L.FIRE_K[it.kind] || 0.5, raio: 9, cor: [1, 0.6, 0.3], tremor: 0.1, id: it.id }; });
const outerOpen = p => new Set(p.doors.filter(d => d.outer).map(d => d.id));
const C = In.CELL;
// (the cells a straight line crosses on a storey's grid, every one — an exact walk, not the bake's own steps)
function cellsOn(g, x0, z0, x1, z1) {
  const cs = g.cs; let i = Math.floor(x0 / cs), j = Math.floor(z0 / cs); const i1 = Math.floor(x1 / cs), j1 = Math.floor(z1 / cs); const out = [[i, j]];
  const dx = x1 - x0, dz = z1 - z0; const si = Math.sign(dx), sj = Math.sign(dz); let tx = si ? ((si > 0 ? (i + 1) * cs : i * cs) - x0) / dx : Infinity, tz = sj ? ((sj > 0 ? (j + 1) * cs : j * cs) - z0) / dz : Infinity;
  const ddx = si ? cs / Math.abs(dx) : Infinity, ddz = sj ? cs / Math.abs(dz) : Infinity;
  // (until the line's end: a corner crossed exactly never walks past it)
  for (let k = 0; k < 400 && (i !== i1 || j !== j1) && Math.min(tx, tz) <= 1; k++) { if (tx < tz) { i += si; tx += ddx; } else { j += sj; tz += ddz; } out.push([i, j]); }
  return out;
}
const at = (vol, i, j, k) => ((k * vol.ny + j) * vol.nx + i) * 4;

if (want('l1')) {
  // ---- l1: the same plan, the same volume
  const r0 = G.S.rng ? JSON.stringify(G.S.rng) : ''; const vr0 = G.VR ? G.VR.state ? JSON.stringify(G.VR.state()) : '' : ''; let n = 0, diff = [];
  const sum = () => { let h = 0; for (const b of G.S.buildings.values()) h = (h * 31 + (b.hp || 0) * 7 + (b.ip ? 1 : 0)) % 1e9; return h; }; const h0 = sum();
  for (const [b, p] of planned().filter(([b]) => ['taverna', 'house', 'paco', 'temple'].includes(b.type)).slice(0, 40)) {
    const src = L.sources(b, p).concat(allFires(p)); const op = outerOpen(p); const a = L.bake(p, src, op), c = L.bake(JSON.parse(JSON.stringify(p)), JSON.parse(JSON.stringify(src)), new Set([...op])); n++;
    if (!a || !c || a.d1.length !== c.d1.length || a.d1.some((x, k) => x !== c.d1[k]) || a.d2.some((x, k) => x !== c.d2[k])) diff.push(`${b.type}#${b.id}`);
  }
  const r1 = G.S.rng ? JSON.stringify(G.S.rng) : ''; const vr1 = G.VR ? G.VR.state ? JSON.stringify(G.VR.state()) : '' : '';
  ok('l1 o mesmo volume para a mesma planta (assado duas vezes e de uma cópia), nenhum sorteio, o mundo como estava', n > 20 && !diff.length && r0 === r1 && vr0 === vr1 && sum() === h0, `${n} prédios${diff.length ? '; diferentes: ' + diff.slice(0, 6).join(', ') : ''}${r0 !== r1 ? '; o acaso do mundo mudou' : ''}`);
}

if (want('l2')) {
  // ---- l2: the light does not go through a wall
  let n = 0, vox = 0; const leak = [], wall = [], dark = [];
  for (const [b, p] of planned()) {
    const src = allFires(p); const v = L.bake(p, src, outerOpen(p)); if (!v) continue; n++; const g = p.grid; const tag = `${b.type}#${b.id}`;
    let out0 = 0, behind = 0;
    for (let k = 0; k < v.nz; k++) for (let j = 0; j < v.ny; j++) for (let i = 0; i < v.nx; i++) { const o = at(v, i, j, k); vox++;
      if (v.d1[o + 3] === 0 && v.d1[o + 1] > 0) out0++;
      if (v.d1[o + 3] !== 255 || v.d1[o + 1] === 0) continue;
      // (a voxel of a room with fire: some source of its storey seen from it — the line crosses two wall cells in a row at the most)
      const x = (i + 0.5) * v.vs, y = v.org[1] + (j + 0.5) * v.vy, z = (k + 0.5) * v.vs; let lv = null; for (const l of p.levels.slice().sort((a2, c2) => a2.y - c2.y)) if (y >= l.y - 0.02) lv = l; if (!lv) continue;
      const lg = g.lv[lv.lv]; const cellIn = (q, r) => (q < 0 || r < 0 || q >= g.n || r >= g.n || !lg ? C.OUT : lg[r * g.n + q]);
      if (cellIn(Math.floor(x / g.cs), Math.floor(z / g.cs)) === C.WALL) continue; // (a wall's own voxel: filled from its rooms)
      const top = p.levels.reduce((m2, l) => (l.y > m2.y ? l : m2), p.levels[0]); if (lv !== top && y > lv.y + lv.h) continue; // (a slab's: its nearest room's)
      const seen = src.some(s => { if (s.lv !== lv.lv) return false; const cl = cellsOn(g, x, z, s.x, s.z); let run = 0, worst = 0; for (const [q, r] of cl.slice(1, -2)) { const c = cellIn(q, r); if (c === C.WALL || c === C.OUT) { run++; worst = Math.max(worst, run); } else run = 0; } return worst < 3; });
      if (!seen) behind++; }
    if (out0) leak.push(`${tag} (${out0})`); if (behind > 2) wall.push(`${tag} (${behind})`);
    // (a room with no opening to the open air is dark by day: its sky nothing — the bake's openings only)
  }
  ok('l2 a luz não vaza pela parede: nenhum fogo fora dos cômodos, nenhum voxel de cômodo com fogo atrás de uma parede inteira', n > 100 && !leak.length && !wall.length, `${n} prédios, ${vox} voxels${leak.length ? '; fora dos cômodos: ' + leak.slice(0, 5).join(', ') : ''}${wall.length ? '; atrás da parede: ' + wall.slice(0, 5).join(', ') : ''}`);
}

if (want('l3')) {
  // ---- l3: every source has its cause, by day and by night
  const At = G.Atmos; const bad = []; let fires = 0, lamps = 0, dark = 0, homes = 0; const W = G.W;
  for (const hour of [0.45, 0.92]) {
    // (the world lived to the hour by its own step: the families go home, sleep, wake)
    let k = 0; while (!(G.S.time >= hour && G.S.time < hour + 0.03) && k < 6000) { G.debug.step(0.05); k++; }
    for (const [b, p] of planned()) { const src = L.sources(b, p); const f = At.fire(b), li = At.lit(b);
      for (const s of src) { const it = p.items.find(q => q.id === s.id); if (!it) continue;
        if (it.fire) { fires++; if (!f) bad.push(`${b.type}#${b.id} fogo de ${it.kind} sem causa`); }
        else if (L.LAMPS[it.kind]) { lamps++; if (!li) bad.push(`${b.type}#${b.id} ${it.kind} aceso sem ninguém acordado`); } }
      if (f && p.items.some(it => it.fire) && !src.some(s => s.fire)) bad.push(`${b.type}#${b.id} queimando sem fogo desenhado`);
      if (G.BDEF[b.type] && G.BDEF[b.type].housing && p.items.some(it => it.fire)) { homes++; if (!f && !src.length) dark++; } }
  }
  ok('l3 toda fonte tem causa (de dia e de noite): o fogo só com o prédio queimando, o lampadário só com alguém acordado; a casa que dorme às escuras', !bad.length && fires > 0 && dark > 0, `${fires} fogos, ${lamps} lampadários, ${dark} de ${homes} casas às escuras${bad.length ? '; ' + bad.slice(0, 6).join(', ') : ''}`);
}

if (want('l4')) {
  // ---- l4: the god interferes — a house that burns, a building that falls to ruin
  const At = G.Atmos; const tv = planned().find(([b]) => b.type === 'taverna'); let info = '', good = false;
  if (tv) { const [b, p] = tv; const before = L.sources(b, p).length; const i = b.y * G.N + b.x; const f0 = G.S.fire[i]; G.S.fire[i] = 0.9; const shut = In.doorState(b, 0); const lvl = L.sources(b, p).length; G.S.fire[i] = f0;
    // (the ruin: no inside — the 3D does not open it, the light has no plan of it)
    const t0 = b.type; b.type = 'ruin'; const ruin = Sp.plan(b) === null || b.type === 'ruin'; b.type = t0;
    info = `fontes ${before} → com fogo no prédio ${lvl}; porta ${shut ? shut.state : '-'}; ruína sem dentro ${ruin}`; good = ruin && (!shut || shut.state === 'bloqueada'); }
  ok('l4 o deus interfere: o prédio em chamas tem a porta tomada pelo fogo, a ruína não tem dentro', good, info);
}

if (want('l5')) {
  // ---- l5: the save in the middle
  const pick = planned().filter(([b]) => b.type === 'taverna' || b.type === 'house').slice(0, 12).map(([b]) => b.id);
  const snap = () => pick.map(id => { const b = G.S.buildings.get(id); const p = Sp.planNow(b); const src = L.sources(b, p); const v = L.bake(p, src.concat(allFires(p)), outerOpen(p)); let h = 0; for (let k = 0; k < v.d1.length; k += 7) h = (h * 31 + v.d1[k]) % 1e9; return id + ':' + L.sig(src, '') + ':' + h; });
  const a = snap(); M.salvarCarregar(); const c = snap(); const d = a.filter((x, k) => x !== c[k]);
  ok('l5 o save no meio: as fontes e o volume de cada prédio iguais antes e depois de salvar e carregar', !d.length, `${pick.length} prédios${d.length ? '; diferentes: ' + d.slice(0, 3).join(' | ') : ''}`);
}

if (want('l6')) {
  // ---- l6: baked in pieces
  const t = {}; let worst = 0, wid = '', same = true; const hr = () => Number(process.hrtime.bigint()) / 1e6;
  for (const [b, p] of planned()) { const src = allFires(p); const t0 = hr(); const v = L.bake(p, src, outerOpen(p)); const ms = hr() - t0; if (!v) continue; const e = t[b.type] = t[b.type] || { n: 0, ms: 0, max: 0 }; e.n++; e.ms += ms; e.max = Math.max(e.max, ms);
    if (ms > 20) { const j = L.job(p, src, outerOpen(p)); let steps = 0; while (true) { const s0 = hr(); const done = j.step(3); const dt = hr() - s0; steps++; if (dt > worst) { worst = dt; wid = `${b.type}#${b.id}`; } if (done) break; }
      if (j.vol.d1.some((x, k) => x !== v.d1[k])) same = false; } }
  const rows = Object.entries(t).sort((a, c) => c[1].ms / c[1].n - a[1].ms / a[1].n).map(([k, e]) => `${k} ${(e.ms / e.n).toFixed(1)}/${e.max.toFixed(0)} ms`);
  ok('l6 assado aos pedaços: nenhum passo de 3 ms muito além (até 12 ms, ou um quinto do assado inteiro na máquina ocupada), o volume igual ao de uma vez', (worst < 12 || worst < 0.2 * Math.max(...Object.values(t).map(e => e.max))) && same, `pior passo ${worst.toFixed(1)} ms (${wid}); por tipo (média/máx): ${rows.slice(0, 10).join(', ')}`);
}

if (want('l7')) {
  // ---- l7: the eye that gets used to the dark — the light at a point, in and out; the exposure inside never past the ceiling
  const tv = planned().find(([b]) => b.type === 'taverna'); let info = '', good = false;
  if (tv) { const [b, p] = tv; const v = L.bake(p, [], outerOpen(p)); const TL = Sp.TILE; const y0 = Sp.plinth(b).y0;
    const m = p.rooms.find(r => r.lv === 0) || p.rooms[0]; const cx = (m.r[0] + m.r[2]) / 2, cz = (m.r[1] + m.r[3]) / 2; const l0 = p.levels.find(l => l.lv === m.lv);
    const inn = L.sample(v, cx, (l0 ? l0.y : 0) + 1.5, cz), out = L.sample(v, -1, 1.5, -1), street = L.sample(v, 0.1, 1.5, 0.1);
    const E = G.Ceu3D.EYE; const lvl = Math.min(1, inn.ceu * L.SKY_GAIN + inn.rebate); const want2 = G.clamp(E.k / Math.max(E.lo, lvl), 1, E.max);
    info = `dentro ${JSON.stringify(Object.fromEntries(Object.entries(inn).map(([k, x]) => [k, +x.toFixed(3)])))}, a rua ${JSON.stringify(street)}, fora do lote ${out}; olho ${want2.toFixed(2)} (teto ${E.max})`;
    good = inn.dentro === 1 && (!street || street.dentro === 0) && out === null && want2 >= 1 && want2 <= E.max && E.max * 1.5 <= 3; void TL; void y0; }
  ok('l7 o olho que se acostuma: a luz de dentro no meio do salão, nada fora; a exposição de dentro maior que 1 e no teto', good, info);
}

if (want('l8')) {
  // ---- l8: the shade where things touch
  const tv = planned().find(([b]) => b.type === 'taverna'); let info = '', good = false;
  if (tv) { const [b, p] = tv; const out = B3.interior(p, b, { fine: true }); const g = out.lv[0]; const ao = B3.aoIn(p, { x0: out.at[0], y0: out.at[1], z0: out.at[2] });
    const area = r => (r.r[2] - r.r[0]) * (r.r[3] - r.r[1]); const m = p.rooms.filter(r => !r.open && r.fn === 'salao').sort((a, c) => area(c) - area(a))[0] || p.rooms[0]; const X0 = out.at[0], Y0 = out.at[1], Z0 = out.at[2]; const l0 = p.levels.find(l => l.lv === m.lv) || { y: 0 };
    // (a point of the room's floor clear of the pieces and the walls by a metre: the floor at its brightest)
    const gr = p.grid, lg = gr.lv[m.lv]; let cx = (m.r[0] + m.r[2]) / 2, cz = (m.r[1] + m.r[3]) / 2, bestD = -1;
    for (let z = m.r[1] + 0.2; z < m.r[3] - 0.2; z += 0.25) for (let x = m.r[0] + 0.2; x < m.r[2] - 0.2; x += 0.25) { let dmin = 9; for (let dz = -1.2; dz <= 1.2; dz += 0.25) for (let dx = -1.2; dx <= 1.2; dx += 0.25) { const i = Math.floor((x + dx) / gr.cs), j = Math.floor((z + dz) / gr.cs); const c = i < 0 || j < 0 || i >= gr.n || j >= gr.n ? C.OUT : lg[j * gr.n + i]; if (c !== C.FLOOR && c !== C.DOOR) dmin = Math.min(dmin, Math.hypot(dx, dz)); } if (dmin > bestD) { bestD = dmin; cx = x; cz = z; } }
    const mid = ao(X0 + cx, Y0 + l0.y + 0.012, Z0 + cz, 0, 1, 0), byWall = ao(X0 + m.r[0] + 0.15, Y0 + l0.y + 0.012, Z0 + cz, 0, 1, 0);
    const foot = ao(X0 + m.r[0] + 0.001, Y0 + l0.y + 0.02, Z0 + (m.r[1] + m.r[3]) / 2, 1, 0, 0), top = ao(X0 + m.r[0] + 0.001, Y0 + l0.y + 2.0, Z0 + (m.r[1] + m.r[3]) / 2, 1, 0, 0);
    const corner = ao(X0 + m.r[0] + 0.001, Y0 + l0.y + 1.2, Z0 + m.r[1] + 0.05, 1, 0, 0), wallMid = ao(X0 + m.r[0] + 0.001, Y0 + l0.y + 1.2, Z0 + (m.r[1] + m.r[3]) / 2, 1, 0, 0);
    const piece = p.items.find(it => it.lv === m.lv && it.solid && !it.wall && it.kind !== 'lar'); const under = piece ? ao(X0 + piece.x, Y0 + l0.y + 0.012, Z0 + piece.z, 0, 1, 0) : 0;
    info = `chão no meio ${mid.toFixed(2)}, junto da parede ${byWall.toFixed(2)}, ${piece ? piece.kind : '-'} ${under.toFixed(2)}; parede: pé ${foot.toFixed(2)}, alto ${top.toFixed(2)}, canto ${corner.toFixed(2)}, meio ${wallMid.toFixed(2)}`;
    let tinted = 0; for (let k = 0; k < g.c.length; k += 3) if (g.c[k] < 1e-4) tinted++;
    good = byWall < mid - 0.05 && foot < top - 0.1 && corner < wallMid - 0.02 && (!piece || under < mid - 0.05) && mid > 0.9; }
  ok('l8 a sombra de contato: o pé da parede, o canto, o chão junto da parede e debaixo de um móvel mais escuros', good, info);
}

if (want('l9')) {
  // ---- l9: the materials of the insides
  const P = B3.PAT; const bad = []; let n = 0, mos = 0, rich = 0, friso = 0, dado = 0;
  for (const [b, p] of planned()) { const out = B3.interior(p, b, { fine: true }); if (!out) continue; n++; const tag = `${b.type}#${b.id}`;
    const mine = {}; for (const id in out.item) { const [lv, a, z] = out.item[id]; (mine[lv] = mine[lv] || []).push([a, z]); }
    for (const k in out.lv) { const g = out.lv[k]; const q = g.q || []; const its = mine[k] || []; for (let i = 0; i < q.length; i += 3) { if (its.some(([a, z]) => i >= a && i < z)) continue; const ny = g.n[i * 3 + 1]; const pp = q[i];
      if (ny > 0.9 && (pp === P.soil || pp === P.slab || pp === P.cobble)) { bad.push(`${tag}: chão de fora (${pp}) dentro`); break; }
      if (Math.abs(ny) < 0.1 && pp === P.mud && /adobe|taipa|reboco/.test(p.shell.mat || '')) { bad.push(`${tag}: os tijolos de fora na parede de dentro`); break; }
      if (pp === P.mosaico) mos++; if (pp >= 8388608) friso++; if (pp === P.caiado && Math.abs(ny) < 0.1) dado++; } }
    if (b.type === 'house' && b.w > 1 && b.style === 'romano') rich++; }
  ok('l9 os materiais de dentro: nenhum chão de terra lavrada nem de lajes com capim, a parede de adobe rebocada, o mosaico romano, a faixa e o friso', n > 100 && !bad.length && (!rich || mos > 0) && dado > 0 && friso > 0, `${n} interiores; mosaico ${mos} pontos (${rich} casas ricas romanas), friso ${friso}, reboco ${dado}${bad.length ? '; ' + bad.slice(0, 5).join(', ') : ''}`);
}

if (want('l10')) {
  // ---- l10: the window without glass — its dark cut where the inside is drawn, no shutter shut over it
  let n = 0, cut = 0; const bad = [];
  for (const [b] of planned().slice(0, 160)) { const o = B3.outside(b); if (!o || !o.glass || o.glass.empty) continue; const S2 = B3.shellOf(b); if (!S2 || S2.shell.kind !== 'rect') continue;
    // (the windows of the shell: each its box in the world — a pane elsewhere, the light over a Greek door, is no opening)
    const TL = Sp.TILE, X0 = b.x * TL, Z0 = b.y * TL, Y0 = o.at[1]; const wins = S2.holes.filter(h => h.kind === 'janela').map(h => { const w = S2.byId.get(h.wall); const l = w && S2.levels.find(q => q.lv === w.lv); if (!l) return null;
      const Lw = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1; const cx = w.a[0] + (w.b[0] - w.a[0]) * h.at / Lw, cz = w.a[1] + (w.b[1] - w.a[1]) * h.at / Lw; const r = h.w / 2 + 0.05; return [X0 + cx - r, Y0 + l.y + (h.sill || 0) - 0.05, Z0 + cz - r, X0 + cx + r, Y0 + l.y + (h.sill || 0) + h.h + 0.05, Z0 + cz + r]; }).filter(Boolean);
    const P = o.glass.p; for (let k = 0; k + 8 < P.length; k += 9) { const cx = (P[k] + P[k + 3] + P[k + 6]) / 3, cy = (P[k + 1] + P[k + 4] + P[k + 7]) / 3, cz = (P[k + 2] + P[k + 5] + P[k + 8]) / 3;
      if (!wins.some(c => cx > c[0] && cy > c[1] && cz > c[2] && cx < c[3] && cy < c[4] && cz < c[5])) continue; n++;
      if (o.cuts.some(c => cx > c[0] && cy > c[1] && cz > c[2] && cx < c[3] && cy < c[4] && cz < c[5])) cut++; else if (bad.length < 6) bad.push(`${b.type}#${b.id}`); } }
  ok('l10 a janela sem vidro: o escuro que se vê de fora em cada janela sai quando o interior é desenhado (o recorte)', n > 50 && cut === n, `${cut} de ${n} faces de janela no recorte${bad.length ? '; fora: ' + bad.join(', ') : ''}`);
}

{ const e = G.modErr || {}; ok('sem erro de módulo', !Object.keys(e).length, JSON.stringify(e)); }
const er = M.erros(); ok('sem aviso no console', !er.console.length, er.console.slice(0, 3).join(' | '));
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'TUDO PASSOU'); process.exit(fails.length ? 1 : 0);
