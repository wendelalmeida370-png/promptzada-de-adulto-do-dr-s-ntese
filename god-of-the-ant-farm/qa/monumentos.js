// monumentos: as plantas dos monumentos (int-monumentos.js, P3 — o exemplo C do adendo: onde se assiste) provadas em Node,
// sem mundo gerado, sobre o código do jogo (M.load):
//   1. o teatro e a maravilha de cada povo pela sua forma (D-093), em todo lado: a planta vale e o relatório geométrico não
//      acha falha
//   2. os lugares, onde o corpo fica, e um livre de cada uso: o teatro grego e o clássico — as fileiras da forma, os lugares
//      de assistir sentado (cada fileira um bloco, os corredores meia fileira por degrau), quem atua na orquestra —; o jardim
//      egípcio e o campo asteca — quem atua e quem assiste em pé —; o salão do hidromel — os bancos e o escaldo junto ao fogo
//      —; a arena e o Coliseu — quem luta na areia, quem assiste em pé no pódio (D-095) —; o Templo Mayor — quem oficia
//      diante de cada santuário, quem acende os braseiros, quem olha do alto —; o zigurate — quem reza diante do olho, quem
//      olha do terraço —; a Grande Pirâmide — quem oferta e quem reza diante dela —; Valhala — o assento do rei, os bancos, as
//      mesas, o escaldo —; a Acrópole — quem reza diante do templo, quem oferta à estátua, quem olha do alto da rocha
//   3. a planta só pisa onde a forma tem chão: as fileiras na altura dos anéis da forma, a areia e o pódio da arena, o salão
//      no piso do corpo da forma; o topo do Templo Mayor, o terraço do zigurate, a rocha da Acrópole, a laje da pirâmide
//   4. os pés pelo caminho, num mundo em branco, a cada 2 cm (Space.indoor), no que a forma é — o chão, a pisada de cada
//      degrau, a areia, o pódio, o topo —, por onde o corpo passa, nunca um degrau que ele não sobe: na arena e no Coliseu, da
//      rua pelo arco da frente, pela passagem, pelo lance do subsolo e pelo alçapão até a areia, e dos dois degraus ao pódio;
//      da rua pelo lance até o topo do Templo Mayor, o terraço do zigurate e a rocha da Acrópole, pelos degraus até dentro de
//      Valhala, da rua à frente da pirâmide
//   5. o 3D desenha o teatro e a maravilha com planta pela forma (Build3D.byForm)
//   node qa/monumentos.js
const M = require('./nodemundo.js');
const G = M.load({});
const In = G.Interiors, Sp = G.Space;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | monumentos ${name} | ${info}`); if (!c) fails.push(name); };
G.S = { villagers: new Map(), buildings: new Map(), dead: new Map(), settlements: new Map(), clock: 100, day: 3, time: 0.4, avatar: null, nextId: 1000, history: [], fire: new Float32Array(G.N * G.N) };
const POVOS = ['classico', 'grego', 'romano', 'egipcio', 'asteca', 'nordico'], LADOS = ['S', 'E', 'N', 'W'], TIPOS = ['teatro', 'maravilha'].filter(t => In.TYPES[t]);
const rec = (t, c, f, s) => ({ v: In.REC_V || 4, f, r: 0, t, u: In.TYPES[t].use, s, o: 7, c, e: 3, k: 'ae', cl: c === 'egipcio' ? 'q' : 't', fl: 0, d: 1, w: 1, pw: 0, h: [], m: 0, fx: [], dr: {}, hh: 0, nm: 0, vz: 0, ab: 0 });
const made = []; let nid = 81001;
for (const t of TIPOS) for (const c of POVOS) {
  const fam = In.familiesFor(rec(t, c, '', 'S'));
  for (const f of fam.ok) for (const s of LADOS) {
    const def = G.BDEF[t]; const b = { id: (nid += 41), type: t, style: c, x: 8, y: 8, w: def.w, h: def.h, built: true }; b.ip = rec(t, c, f, s);
    const p = In.makeFam(b, b.ip, f); G.S.buildings.set(b.id, b); made.push({ t, c, s, f, b, p, rep: p && p.ok ? In.report(b, p, { rec: b.ip }) : [] });
  }
}
const tag = m => `${m.t}/${m.c}`;
// ---------------------------------------------------------------- 1. the plans
{
  const bad = made.filter(m => !m.p || !m.p.ok), fal = made.filter(m => m.rep.some(q => q.k === 'FALHA'));
  ok('1a o teatro e a maravilha de cada povo se armam pela forma, em todo lado', made.length >= TIPOS.length * POVOS.length * LADOS.length && !bad.length, `${made.length - bad.length} de ${made.length} plantas (${TIPOS.join(', ')})${bad.length ? ': ' + bad.slice(0, 3).map(m => `${tag(m)}/${m.s}: ${(m.p && m.p.errs || []).slice(0, 2).join('; ')}`).join(' · ') : ''}`);
  ok('1b o relatório geométrico: nenhuma falha', !fal.length, fal.length ? fal.slice(0, 3).map(m => `${tag(m)}/${m.s}: ${m.rep.filter(q => q.k === 'FALHA').map(q => q.what).slice(0, 2).join('; ')}`).join(' · ') : `${made.length} plantas`);
}
// ---------------------------------------------------------------- 2. the places
{
  const S0 = made.filter(m => m.s === 'S' && m.p && m.p.ok); const out = []; const said = [];
  const marksOf = (p, use) => (p.marks || []).filter(M2 => M2.use === use).flatMap(M2 => M2.pts.filter(q => q.ok));
  const itemsOf = (p, kind) => p.items.filter(i => i.kind === kind);
  // (what each one has at least: the theatres', the wonders')
  const NEED = {
    'teatro/grego': p => [['assistir (fileiras)', p.cap.watch, 40], ['atuar', marksOf(p, 'atuar').length, 3]], 'teatro/classico': p => [['assistir (fileiras)', p.cap.watch, 40], ['atuar', marksOf(p, 'atuar').length, 3]],
    'teatro/egipcio': p => [['atuar', marksOf(p, 'atuar').length, 1], ['assistir', marksOf(p, 'assistir').length, 4]], 'teatro/asteca': p => [['atuar', marksOf(p, 'atuar').length, 1], ['assistir', marksOf(p, 'assistir').length, 4]],
    'teatro/nordico': p => [['bancos', itemsOf(p, 'banco').length, 4], ['atuar', marksOf(p, 'atuar').length, 1]],
    'teatro/romano': p => [['lutar', marksOf(p, 'lutar').length, 2], ['assistir', marksOf(p, 'assistir').length, 10]], 'maravilha/romano': p => [['lutar', marksOf(p, 'lutar').length, 2], ['assistir', marksOf(p, 'assistir').length, 12]],
    'maravilha/asteca': p => [['oficiar', marksOf(p, 'oficiar').length, 2], ['acender', marksOf(p, 'acender').length, 2], ['topo', marksOf(p, 'topo').length, 2]],
    'maravilha/classico': p => [['rezar', marksOf(p, 'rezar').length, 3], ['topo', marksOf(p, 'topo').length, 1]],
    'maravilha/egipcio': p => [['ofertar', marksOf(p, 'ofertar').length, 1], ['rezar', marksOf(p, 'rezar').length, 3]],
    'maravilha/nordico': p => [['assento do rei', itemsOf(p, 'trono').length, 1], ['bancos', itemsOf(p, 'banco').length, 6], ['atuar', marksOf(p, 'atuar').length, 1]],
    'maravilha/grego': p => [['rezar', marksOf(p, 'rezar').length, 2], ['ofertar', marksOf(p, 'ofertar').length, 1], ['topo', marksOf(p, 'topo').length, 1]],
  };
  for (const m of S0) {
    const p = m.p; const need = NEED[tag(m)] ? NEED[tag(m)](p) : [['algum lugar', (p.marks || []).length + p.items.length, 1]];
    for (const [what, n, min] of need) if (n < min) out.push(`${tag(m)}: ${what} ${n} (ao menos ${min})`);
    said.push(`${tag(m)} ${need.map(([w, n]) => `${w} ${n}`).join(', ')}`);
    // (a free place of each use, as the people ask it)
    for (const use of ['assistir', 'atuar', 'lutar', 'sentar', 'oficiar', 'acender', 'topo', 'rezar', 'ofertar', 'comer', 'audiencia']) { const has = (p.marks || []).some(M2 => M2.use === use) || p.items.some(i => (i.spots || []).some(q => q.use === use)) || (use === 'assistir' && p.cap.watch); if (has && !In.freePlace(m.b, use)) out.push(`${tag(m)}: nenhum lugar livre de ${use}`); }
  }
  ok('2a os lugares de cada teatro e maravilha, onde o corpo fica, e um livre de cada uso', !out.length, out.slice(0, 4).join(' · ') || said.join(' · '));
}
// ---------------------------------------------------------------- 3. the plan's floors on the form's
{
  const out = []; const lv0 = p => p.levels.find(l => l.lv === 0);
  const same = (m, what, y, want) => { if (Math.abs(y - want) > 0.02) out.push(`${tag(m)}: ${what} da forma a ${want.toFixed(2)}, na planta a ${y.toFixed(2)}`); };
  for (const m of made.filter(q => q.s === 'S' && q.p && q.p.ok)) {
    const F = G.Forma.of(m.t, m.c), p = m.p, k = tag(m);
    if (k === 'teatro/grego' || k === 'teatro/classico') {
      // (each row's top, as the form's ring of it, at a point of every row — off the aisles —, the plan's height)
      for (const e of F.els.filter(q => q.k === 'cavea')) { const A = e.aneis; for (let j = 0; j < A.length; j++) { const rIn = j < A.length - 1 ? A[j + 1][0] : e.fundo; const rr = (rIn + A[j][0]) / 2; const a = (e.arco ? (e.arco[0] + e.arco[1]) / 2 : 0) + 0.02;
        const x = e.c[0] + Math.cos(a) * rr, z = e.c[1] + Math.sin(a) * rr; same(m, `a fileira em (${x.toFixed(2)}, ${z.toFixed(2)})`, In.floorYOf(p, 0, x, z), A[j][1]); } }
    } else if (m.c === 'romano') {
      const A = F.amphi; const [cu, cv] = A.c;
      for (const [lv, x, z, want, what] of [[1, cu + A.fundo * 0.7, cv, A.ya, 'a areia'], [2, cu, cv + A.fundo + 0.6, A.yb, 'o pódio'], [0, cu, cv + A.R - 0.2, 0, 'a passagem']]) same(m, what, In.floorYOf(p, lv, x, z), want);
    } else if (m.c === 'nordico') same(m, 'o piso do salão', lv0(p).y, G.Forma.body(F).y0);
    else if (k === 'maravilha/asteca') { const e = F.els.find(q => q.k === 'escalonada'); same(m, 'o topo', lv0(p).y, e.niveis[e.niveis.length - 1][2]); }
    else if (k === 'maravilha/classico') { const e = F.els.find(q => q.k === 'escalonada'); same(m, 'o terraço', lv0(p).y, e.niveis[e.niveis.length - 2][2]); }
    else if (k === 'maravilha/grego') same(m, 'a rocha', lv0(p).y, F.els.find(q => q.k === 'talude').y1);
    else if (k === 'maravilha/egipcio') same(m, 'a laje', lv0(p).y, F.els.find(q => q.k === 'piramide').y0);
  }
  ok('3a a planta pisa onde a forma tem chão', !out.length, out.slice(0, 4).join(' · ') || 'as fileiras, a areia, o pódio e a passagem das arenas, os salões, o topo, o terraço, a rocha e a laje das maravilhas');
}
// ---------------------------------------------------------------- 4. the feet, on a blank world
{
  const S = G.newState(7); S.H.fill(4); S.type.fill(G.T.GRASS); if (S.biome) S.biome.fill(0); S.clock = 0; S.day = 30; S.time = 0.3; G.S = S; G.newWorld();
  const TL = Sp.TILE; let nid2 = 91001;
  // (a building of the world on the blank ground, its record made as the world makes it, its door to the south; its plan)
  const put = (t, c) => {
    const def = G.BDEF[t]; const b = { id: (nid2 += 7), type: t, style: c, x: 20 + (nid2 % 3) * 6, y: 20, w: def.w, h: def.h, built: true, progress: 1, hp: 100, maxHp: 100, v: 0, set: 0, blocks: !!def.blocks, ip: null };
    S.buildings.set(b.id, b); if (def.blocks) for (let yy = b.y; yy < b.y + b.h; yy++) for (let xx = b.x; xx < b.x + b.w; xx++) S.occ[yy * G.N + xx] = b.id;
    b.ip = In.newRecord(b, { t, c, e: 3, k: 'ae', cl: 't', fl: 0, d: 1, w: 1, pw: 0, s: 'S', o: (1 << b.w) - 1 });
    const p = Sp.planNow(b); return { b, p };
  };
  const inBox = (r, u, z) => u >= r[0] && u <= r[2] && z >= r[1] && z <= r[3];
  // (the way, leg by leg on its storey, every 2 cm: the feet where Space puts them, against the form's floor under the point —
  // want(lv, u, z), and the riser of a flight there (rs: a flight inside a shell is a ramp through its treads' noses, T-158) —;
  // the body passing at every point; the biggest step)
  const walk = (b, legs, want, flight, edge) => {
    const pl = Sp.plinth(b); let worst = 0, at = '', step = 0, fell = 0, prev = null, n = 0, shut = 0, shutAt = '';
    for (const [lv, pts] of legs) { prev = null;
      for (let k = 0; k < pts.length - 1; k++) { const [u0, z0] = pts[k], [u1, z1] = pts[k + 1]; const len = Math.hypot(u1 - u0, z1 - z0), m = Math.max(1, Math.round(len / 0.02));
        for (let j = 0; j <= m; j++) { const u = u0 + (u1 - u0) * j / m, z = z0 + (z1 - z0) * j / m;
          const X = b.x * TL + u, Z = b.y * TL + z; const ins = Sp.indoor(X, Z, lv, b.id); const foot = ins ? ins.y : Sp.footAt(X / TL, Z / TL);
          if (ins && !ins.walk) { shut++; if (!shutAt) shutAt = `(${u.toFixed(2)}, ${z.toFixed(2)}) piso ${lv}`; }
          if (prev !== null) step = Math.max(step, Math.abs(foot - prev)); prev = foot; n++;
          const rs = flight ? flight(u, z, ins) : 0; if (edge && edge(u, z)) continue; // (at a tread's edge either tread is the floor)
          const d = foot - (pl.hi + want(lv, u, z, ins) + (ins ? Sp.FLOOR_UP : 0)); const lo = rs ? -rs - 0.03 : -0.03;
          if ((d > 0.03 || d < lo) && Math.abs(d) > Math.abs(worst)) { worst = d; at = `(${u.toFixed(2)}, ${z.toFixed(2)}) piso ${lv}`; }
          if (d < lo - 0.12) fell++; } } }
    const bad = []; if (worst || fell || step > In.BODY.step + 0.01) bad.push(`os pés a ${worst.toFixed(2)} m da forma em ${at}, ${fell} pontos abaixo dela, o maior degrau ${step.toFixed(2)} m`);
    if (shut) bad.push(`${shut} pontos do caminho onde o corpo não passa (o primeiro ${shutAt})`);
    return { bad, sum: `${n} pontos, o maior degrau ${step.toFixed(2)} m` };
  };
  // 4a the arenas
  { const out = [], sum = [];
    for (const [t, c] of [['teatro', 'romano'], ['maravilha', 'romano']]) {
      if (!In.TYPES[t]) continue; const { b, p } = put(t, c); const F = G.Forma.of(t, c); const A = F && F.amphi; if (!p || !p.ok || !A) { out.push(`${t}: sem planta (${p ? p.errs.slice(0, 2).join('; ') : '—'})`); continue; }
      const L = b.h * TL; const [cu, cv] = A.c;
      // (the form's floor under a point: on one of its flights, the top of its highest tread there; off them, the storey's — the
      // ground of the passage, the sand (out of its round, the podium the steps come up to), the podium; the riser of each
      // flight, its rise over its treads)
      const boxes = F.els.filter(e => e.k === 'bloco' && e.degrau);
      const flightAt = (u, z) => (inBox(A.under, u, z) ? A.ya / Math.ceil(A.ya / 0.23) : inBox(A.steps, u, z) ? (A.yb - A.ya) / 2 : 0);
      const formAt = (lv, x, z) => { let y = lv === 1 ? (Math.hypot(x - cu, z - cv) > A.fundo ? A.yb : A.ya) : lv === 2 ? A.yb : 0; if (flightAt(x, z)) for (const q of boxes) if (inBox(q.r, x, z)) y = Math.max(y, q.y1); return y; };
      // (from the street along the axis through the arch and the passage to the undercroft's flight and up it to its top; on the
      // sand from its landing round the hatch to the steps and up them; on the podium's walk)
      const vt = A.under[1], sx = cu - A.fundo;
      const r = walk(b, [[0, [[cu, L + 0.8], [cu, vt + 0.02]]], [1, [[cu, vt - 0.35], [cu - 0.9, vt - 0.35], [cu - 0.9, cv], [sx + 0.06, cv]]], [2, [[sx - 0.35, cv], [sx - 0.9, cv]]]], formAt, flightAt);
      sum.push(`${t}: ${r.sum}`); for (const q of r.bad) out.push(`${t}/${c}: ${q}`);
    }
    ok('4a os pés nas arenas: da rua pela passagem e pelo lance do subsolo até a areia, e ao pódio, no que a forma é', !out.length, out.slice(0, 3).join(' / ') || sum.join(' · ')); }
  // 4b the ways up to the wonders' floors: from the street along the middle of the front, up the form's flight on its treads
  // (a form's flight out of the shell: the feet on each tread, D-093) or its steps, through the way in, 0.8 m on to the floor
  { const out = [], sum = [];
    for (const c of ['asteca', 'classico', 'grego', 'egipcio', 'nordico']) {
      if (!In.TYPES.maravilha) break; const { b, p } = put('maravilha', c); if (!p || !p.ok) { out.push(`maravilha/${c}: sem planta (${p ? p.errs.slice(0, 2).join('; ') : '—'})`); continue; }
      const F = G.Forma.of('maravilha', c), L = b.h * TL; const l0 = p.levels.find(l => l.lv === 0); const e = p.entrance;
      // (a door with its leaf — the hall's —: opened as the body opens it, in the world's step)
      if (p.doors[e.door] && p.doors[e.door].kind !== 'vao') { G.inSim = true; In.useDoor(b, e.door, 'abrir', null); G.inSim = false; }
      const st = F.els.find(q => q.k === 'escada'); const B = G.Forma.body(F);
      const treads = st ? G.Forma.flight(st).map(q => [q.r, q.y1]) : B ? B.degraus.map(q => [q.r, q.y1]) : [];
      if (st) { const t = treads[treads.length - 1]; treads.push([[t[0][0], st.b[1] - 0.4, t[0][2], st.b[1]], st.b[2]]); } // (the last step into the floor, as the 3D lays it)
      const edge = (u, z) => treads.some(([r]) => u >= r[0] - 0.015 && u <= r[2] + 0.015 && (Math.abs(z - r[1]) < 0.015 || Math.abs(z - r[3]) < 0.015));
      // (the form under a point: the highest tread of its flight there; else, on the floor's area — the shell's —, the floor; else
      // the ground — a base the floor is on drawn under the shell's edge: a hall's)
      const want = (lv, u, z, ins) => { let tr = -1; for (const [r, y1] of treads) if (inBox(r, u, z)) tr = Math.max(tr, y1); if (tr >= 0) return tr; return ins && ins.shell ? l0.y : B && B.base && inBox(B.base.r, u, z) ? B.base.h : 0; };
      const r = walk(b, [[0, [[e.x, L + 0.8], [e.x, e.z - 0.8]]]], want, null, edge);
      sum.push(`${c}: ${r.sum}`); for (const q of r.bad) out.push(`maravilha/${c}: ${q}`);
    }
    ok('4b os pés subindo às maravilhas: da rua pelo lance até o topo, o terraço, a rocha, pelos degraus ao salão, à frente da pirâmide', !out.length, out.slice(0, 3).join(' / ') || sum.join(' · ')); }
}
// ---------------------------------------------------------------- 5. the 3D draws a planned theatre and wonder by its form
{
  const B3 = G.Build3D; const out = [];
  if (B3 && B3.byForm) for (const m of made.filter(q => q.s === 'S' && q.p && q.p.ok)) if (!B3.byForm(m.b)) out.push(tag(m));
  ok('5a o 3D desenha o teatro e a maravilha com planta pela forma', !!(B3 && B3.byForm) ? !out.length : true, B3 && B3.byForm ? (out.length ? `não: ${out.join(', ')}` : 'nos seis povos (casca aberta, ou a casca levantada sobre o corpo da forma)') : 'sem o 3D carregado (a fidelidade cobre)');
}
const err = M.erros(); if (Object.keys(err.mod).length || err.console.length) ok('sem erros de módulo', false, JSON.stringify(err).slice(0, 300));
console.log(fails.length ? `FALHAS: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
