// monumentos: as plantas dos monumentos (int-monumentos.js, P3 — o exemplo C do adendo: onde se assiste) provadas em Node,
// sem mundo gerado, sobre o código do jogo (M.load):
//   1. o teatro de cada povo pela sua forma (D-093), em todo lado: a planta vale e o relatório geométrico não acha falha
//   2. os lugares: o grego e o clássico — as fileiras da forma, os lugares de assistir sentado (cada fileira um bloco, os
//      corredores meia fileira por degrau), quem atua na orquestra —; o jardim egípcio e o campo asteca — quem atua e quem
//      assiste em pé —; o salão do hidromel — os bancos (sentar) e o escaldo junto ao fogo —; a arena romana — quem luta na
//      areia, quem assiste em pé no pódio (D-095) —: cada lugar onde o corpo fica, e um livre de cada uso
//   3. a planta só pisa onde a forma tem chão: as fileiras na altura dos anéis da forma, a areia e o pódio da arena na altura
//      da forma, o salão no piso do corpo da forma
//   4. os pés pelo caminho, num mundo em branco: na arena romana, da rua pelo arco da frente, pela passagem, pelo lance do
//      subsolo e pelo alçapão até a areia, e dos dois degraus ao pódio — a cada 2 cm, os pés (Space.indoor) no que a forma é:
//      o chão, a pisada de cada degrau, a areia, o pódio —; nunca um degrau que o corpo não sobe nem uma queda
//   5. o 3D desenha o teatro com planta pela forma (Build3D.byForm), de perto e de longe
//   node qa/monumentos.js
const M = require('./nodemundo.js');
const G = M.load({});
const In = G.Interiors, Sp = G.Space;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | monumentos ${name} | ${info}`); if (!c) fails.push(name); };
G.S = { villagers: new Map(), buildings: new Map(), dead: new Map(), settlements: new Map(), clock: 100, day: 3, time: 0.4, avatar: null, nextId: 1000, history: [], fire: new Float32Array(G.N * G.N) };
const POVOS = ['classico', 'grego', 'romano', 'egipcio', 'asteca', 'nordico'], LADOS = ['S', 'E', 'N', 'W'];
const rec = (t, c, f, s) => ({ v: In.REC_V || 4, f, r: 0, t, u: In.TYPES[t].use, s, o: 7, c, e: 3, k: 'ae', cl: c === 'egipcio' ? 'q' : 't', fl: 0, d: 1, w: 1, pw: 0, h: [], m: 0, fx: [], dr: {}, hh: 0, nm: 0, vz: 0, ab: 0 });
const made = []; let nid = 81001;
for (const c of POVOS) {
  const fam = In.familiesFor(rec('teatro', c, '', 'S'));
  for (const f of fam.ok) for (const s of LADOS) {
    const def = G.BDEF.teatro; const b = { id: (nid += 41), type: 'teatro', style: c, x: 8, y: 8, w: def.w, h: def.h, built: true }; b.ip = rec('teatro', c, f, s);
    const p = In.makeFam(b, b.ip, f); G.S.buildings.set(b.id, b); made.push({ c, s, f, b, p, rep: p && p.ok ? In.report(b, p, { rec: b.ip }) : [] });
  }
}
// ---------------------------------------------------------------- 1. the plans
{
  const bad = made.filter(m => !m.p || !m.p.ok), fal = made.filter(m => m.rep.some(q => q.k === 'FALHA'));
  ok('1a o teatro de cada povo se arma pela forma, em todo lado', made.length >= POVOS.length * LADOS.length && !bad.length, `${made.length - bad.length} de ${made.length} plantas${bad.length ? ': ' + bad.slice(0, 3).map(m => `${m.c}/${m.s}: ${(m.p && m.p.errs || []).slice(0, 2).join('; ')}`).join(' · ') : ''}`);
  ok('1b o relatório geométrico: nenhuma falha', !fal.length, fal.length ? fal.slice(0, 3).map(m => `${m.c}/${m.s}: ${m.rep.filter(q => q.k === 'FALHA').map(q => q.what).slice(0, 2).join('; ')}`).join(' · ') : `${made.length} plantas`);
}
// ---------------------------------------------------------------- 2. the places
{
  const S0 = made.filter(m => m.s === 'S' && m.p && m.p.ok); const out = []; const said = [];
  const marksOf = (p, use) => (p.marks || []).filter(M2 => M2.use === use).flatMap(M2 => M2.pts.filter(q => q.ok));
  const itemsOf = (p, kind) => p.items.filter(i => i.kind === kind);
  for (const m of S0) {
    const p = m.p; const need = [];
    if (m.c === 'grego' || m.c === 'classico') { need.push(['assistir (fileiras)', p.cap.watch, 40], ['atuar', marksOf(p, 'atuar').length, 3]); }
    else if (m.c === 'egipcio' || m.c === 'asteca') need.push(['atuar', marksOf(p, 'atuar').length, 1], ['assistir', marksOf(p, 'assistir').length, 4]);
    else if (m.c === 'nordico') need.push(['bancos', itemsOf(p, 'banco').length, 4], ['atuar', marksOf(p, 'atuar').length, 1]);
    else if (m.c === 'romano') need.push(['lutar', marksOf(p, 'lutar').length, 2], ['assistir', marksOf(p, 'assistir').length, 10]);
    for (const [what, n, min] of need) if (n < min) out.push(`${m.c}: ${what} ${n} (ao menos ${min})`);
    said.push(`${m.c} ${need.map(([w, n]) => `${w} ${n}`).join(', ')}`);
    // (a free place of each use, as the people ask it)
    for (const use of ['assistir', 'atuar', 'lutar', 'sentar']) { const has = (p.marks || []).some(M2 => M2.use === use) || p.items.some(i => (i.spots || []).some(q => q.use === use)) || (use === 'assistir' && p.cap.watch); if (has && !In.freePlace(m.b, use)) out.push(`${m.c}: nenhum lugar livre de ${use}`); }
  }
  ok('2a os lugares de cada teatro, onde o corpo fica, e um livre de cada uso', !out.length, out.slice(0, 4).join(' · ') || said.join(' · '));
}
// ---------------------------------------------------------------- 3. the plan's floors on the form's
{
  const out = [];
  for (const m of made.filter(q => q.s === 'S' && q.p && q.p.ok)) {
    const F = G.Forma.of('teatro', m.c), p = m.p;
    if (m.c === 'grego' || m.c === 'classico') {
      // (each row's top, as the form's ring of it, at a point of every row — off the aisles —, the plan's height)
      for (const e of F.els.filter(q => q.k === 'cavea')) { const A = e.aneis; for (let k = 0; k < A.length; k++) { const rIn = k < A.length - 1 ? A[k + 1][0] : e.fundo; const rr = (rIn + A[k][0]) / 2; const a = (e.arco ? (e.arco[0] + e.arco[1]) / 2 : 0) + 0.02;
        const x = e.c[0] + Math.cos(a) * rr, z = e.c[1] + Math.sin(a) * rr; const y = In.floorYOf(p, 0, x, z); if (Math.abs(y - A[k][1]) > 0.02) out.push(`${m.c}: a fileira de ${A[k][1].toFixed(2)} m na planta a ${y.toFixed(2)} (${x.toFixed(2)}, ${z.toFixed(2)})`); } }
    } else if (m.c === 'romano') {
      const A = F.amphi; const [cu, cv] = A.c;
      const pts = [[1, cu + A.fundo * 0.7, cv, A.ya, 'a areia'], [2, cu, cv + A.fundo + 0.6, A.yb, 'o pódio'], [0, cu, cv + A.R - 0.2, 0, 'a passagem']];
      for (const [lv, x, z, want, what] of pts) { const y = In.floorYOf(p, lv, x, z); if (Math.abs(y - want) > 0.02) out.push(`${m.c}: ${what} da forma a ${want.toFixed(2)}, na planta a ${y.toFixed(2)}`); }
    } else if (m.c === 'nordico') { const B = G.Forma.body(F); const l0 = p.levels.find(l => l.lv === 0); if (!l0 || Math.abs(l0.y - B.y0) > 0.01) out.push(`nordico: o piso do salão a ${l0 && l0.y}, o corpo da forma a ${B.y0.toFixed(2)}`); }
  }
  ok('3a a planta pisa onde a forma tem chão', !out.length, out.slice(0, 4).join(' · ') || 'as fileiras do grego e do clássico, a areia, o pódio e a passagem da arena, o salão do hidromel');
}
// ---------------------------------------------------------------- 4. the feet in the Roman arena, on a blank world
{
  const S = G.newState(7); S.H.fill(4); S.type.fill(G.T.GRASS); if (S.biome) S.biome.fill(0); S.clock = 0; S.day = 30; S.time = 0.3; G.S = S; G.newWorld();
  const TL = Sp.TILE, out = []; let nid2 = 91001; const sum = [];
  for (const [t, c] of [['teatro', 'romano'], ['maravilha', 'romano']]) {
    if (!In.TYPES[t]) continue; const def = G.BDEF[t]; const b = { id: (nid2 += 7), type: t, style: c, x: 20, y: 20, w: def.w, h: def.h, built: true, progress: 1, hp: 100, maxHp: 100, v: 0, set: 0, blocks: !!def.blocks, ip: null };
    S.buildings.set(b.id, b); if (def.blocks) for (let yy = b.y; yy < b.y + b.h; yy++) for (let xx = b.x; xx < b.x + b.w; xx++) S.occ[yy * G.N + xx] = b.id;
    b.ip = In.newRecord(b, { t, c, e: 3, k: 'ae', cl: 't', fl: 0, d: 1, w: 1, pw: 0, s: 'S', o: (1 << b.w) - 1 });
    const p = Sp.planNow(b); const F = G.Forma.of(t, c); const A = F && F.amphi; if (!p || !p.ok || !A) { out.push(`${t}: sem planta (${p ? p.errs.slice(0, 2).join('; ') : '—'})`); continue; }
    const pl = Sp.plinth(b); const L = b.h * TL; const [cu, cv] = A.c;
    // (the form's floor under a point: on one of its flights, the top of its highest tread there; off them, the storey's — the
    // ground of the passage, the sand (out of its round, the podium the steps come up to), the podium; the riser of each
    // flight, its rise over its treads)
    const boxes = F.els.filter(e => e.k === 'bloco' && e.degrau);
    const inBox = (r, u, z) => u >= r[0] && u <= r[2] && z >= r[1] && z <= r[3];
    const flightAt = (u, z) => (inBox(A.under, u, z) ? A.ya / Math.ceil(A.ya / 0.23) : inBox(A.steps, u, z) ? (A.yb - A.ya) / 2 : 0);
    const formAt = (lv, x, z) => { let y = lv === 1 ? (Math.hypot(x - cu, z - cv) > A.fundo ? A.yb : A.ya) : lv === 2 ? A.yb : 0; if (flightAt(x, z)) for (const q of boxes) if (inBox(q.r, x, z)) y = Math.max(y, q.y1); return y; };
    // (the way, leg by leg on its storey: from the street along the axis through the arch and the passage to the undercroft's
    // flight and up it to its top; on the sand from its landing round the hatch to the steps and up them; on the podium's walk)
    const vt = A.under[1], sx = cu - A.fundo; const legs = [
      [0, [[cu, L + 0.8], [cu, vt + 0.02]]],
      [1, [[cu, vt - 0.35], [cu - 0.9, vt - 0.35], [cu - 0.9, cv], [sx - 0.05, cv]]],
      [2, [[sx - 0.35, cv], [sx - 0.9, cv]]],
    ];
    let worst = 0, at = '', step = 0, fell = 0, prev = null, n = 0, shut = 0, shutAt = '';
    for (const [lv, pts] of legs) { prev = null;
      for (let k = 0; k < pts.length - 1; k++) { const [u0, z0] = pts[k], [u1, z1] = pts[k + 1]; const len = Math.hypot(u1 - u0, z1 - z0), m = Math.max(1, Math.round(len / 0.02));
        for (let j = 0; j <= m; j++) { const u = u0 + (u1 - u0) * j / m, z = z0 + (z1 - z0) * j / m;
          const X = b.x * TL + u, Z = b.y * TL + z; const ins = Sp.indoor(X, Z, lv, b.id); const foot = ins ? ins.y : Sp.footAt(X / TL, Z / TL);
          if (ins && !ins.walk) { shut++; if (!shutAt) shutAt = `(${u.toFixed(2)}, ${z.toFixed(2)}) piso ${lv}`; }
          if (prev !== null) step = Math.max(step, Math.abs(foot - prev)); prev = foot; n++;
          // (on a flight the feet go up its slope — a flight of a plan inside its shell is a ramp from its foot's edge to its top's
          // (In.floorYOf), through the noses of the form's treads: never over a tread, never a riser under it; T-158)
          const rs = flightAt(u, z);
          const want = pl.hi + formAt(lv, u, z) + (ins ? Sp.FLOOR_UP : 0); const d = foot - want; const lo = rs ? -rs - 0.03 : -0.03;
          if ((d > 0.03 || d < lo) && Math.abs(d) > Math.abs(worst)) { worst = d; at = `(${u.toFixed(2)}, ${z.toFixed(2)}) piso ${lv}`; }
          if (d < lo - 0.12) fell++; } } }
    sum.push(`${t}: ${n} pontos, o maior degrau ${step.toFixed(2)} m`);
    if (worst || fell || step > In.BODY.step + 0.01) out.push(`${t}/${c}: os pés a ${worst.toFixed(2)} m da forma em ${at}, ${fell} pontos abaixo dela, o maior degrau ${step.toFixed(2)} m`);
    if (shut) out.push(`${t}/${c}: ${shut} pontos do caminho onde o corpo não passa (o primeiro ${shutAt})`);
  }
  ok('4a os pés na arena romana: da rua pela passagem e pelo lance do subsolo até a areia, no que a forma é', !out.length, out.slice(0, 3).join(' / ') || sum.join(' · '));
}
// ---------------------------------------------------------------- 5. the 3D draws a planned theatre by its form
{
  const B3 = G.Build3D; const out = [];
  if (B3 && B3.byForm) for (const m of made.filter(q => q.s === 'S' && q.p && q.p.ok)) if (!B3.byForm(m.b)) out.push(m.c);
  ok('5a o 3D desenha o teatro com planta pela forma', !!(B3 && B3.byForm) ? !out.length : true, B3 && B3.byForm ? (out.length ? `não: ${out.join(', ')}` : 'nos seis povos (casca aberta, ou a casca levantada sobre o corpo da forma)') : 'sem o 3D carregado (a fidelidade cobre)');
}
const err = M.erros(); if (Object.keys(err.mod).length || err.console.length) ok('sem erros de módulo', false, JSON.stringify(err).slice(0, 300));
console.log(fails.length ? `FALHAS: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
