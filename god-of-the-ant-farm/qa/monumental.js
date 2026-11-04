// monumental: a Arquitetura Monumental provada em Node (D-106, D-107; qa/monumental/PLANO.md §7, os testes de aceitação) —
// uma função por teste (a sua letra), cada uma escreve as suas linhas, PASSOU | monumental X… | o que mediu, ou FALHOU | …;
// o M2 escreve as suas (B, D, F, G e a H dos seus tipos) em qa/monumental-poder.js, com as mesmas linhas.
//   A — o Coliseu (a maravilha romana nos degraus de 10 e 13 casas: js/forma-espetaculo.js e a planta em
//       js/int-monumentos.js, D-107):
//     A1 a forma: o lote (40 e 52 m), a fachada (≥ 18 m, três andares de arcos e o ático, as baias de 4 a 6 m, os arcos na
//        proporção de gente, as quatro entradas nos eixos), a arena oval (≥ 20 × 12 m), as fileiras do corpo (0,40–0,45 ×
//        0,70–0,80 m), os parapeitos (0,9 m), os degraus (≤ 0,30 m), o subsolo (os corredores, as jaulas, o alçapão), os
//        mastros; a mesma forma para todo prédio do degrau
//     A2 a planta: arma-se nos quatro lados, nos dois tamanhos, sem falha no relatório geométrico; três pisos e os lances entre
//        eles; ≥ 600 lugares de assistir sentados, cada um alcançado da porta; quem assiste em pé no pódio, quem luta na areia;
//        o tempo de fazê-la (o alvo: 400 ms)
//     A3 a forma × a planta: a planta só anda onde a forma tem chão (no térreo a praça e as passagens, na areia a arena, no
//        piso do pódio o pódio e as fileiras, os patamares e as pontes) e na altura dela (o pódio, as fileiras dos anéis da
//        forma, a areia); a parede da planta em cada baia da fachada, aberta nos eixos; a arena e o pódio andados inteiros
//     A4 os pés pelo caminho, num mundo em branco, a cada 2 cm (Space.indoor): da rua pela praça e pelo arco da frente até o pé
//        do lance; pela praça até o arco da esquerda e o pé do lance da porta da areia; pelo da direita até o subsolo e o pé
//        do lance do alçapão; na areia; no pódio e subindo um corredor até o alto das fileiras — o chão da forma, o maior
//        degrau, o corpo passando em todo ponto
//     A5 o mundo: o Coliseu pela mão do deus em Roma (a metrópole pronta), de pé — o lote, a forma e a planta do mesmo tamanho,
//        o verificador limpo —; vivendo; salvo e carregado (a mesma planta); derrubado pelo deus (a ruína limpa)
//     A6 o verificador (qa/monumental-inv.js): pega uma planta com menos lugares que o Coliseu tem, e cala quando ela volta
//   node qa/monumental.js [A …]   (só as letras pedidas; sem nada, todas)
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['qa/monumental-inv.js'] });
const In = G.Interiors, Fo = G.Forma, Sp = G.Space;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | monumental ${name} | ${info}`); if (!c) fails.push(name); };
const ms = () => Number(process.hrtime.bigint()) / 1e6; // (the clock of the process: Date.now stands still in nodemundo)
const TAU = Math.PI * 2, CS = In.CS;
const blank = () => { G.S = { villagers: new Map(), buildings: new Map(), dead: new Map(), settlements: new Map(), clock: 100, day: 3, time: 0.4, avatar: null, nextId: 1000, history: [], fire: new Float32Array(G.N * G.N) }; };
const rec = (t, c, f, s, n) => ({ v: In.REC_V || 4, f, r: 0, t, u: In.TYPES[t].use, s, o: 7, c, e: 3, k: 'ae', cl: 't', fl: 0, d: 1, w: 1, pw: 0, h: [], m: 0, fx: [], dr: {}, hh: 0, nm: 0, vz: 0, ab: 0, n });
const SIZES = [10, 13], SIDES = ['S', 'E', 'N', 'W'];
// (a point in a polygon, by the crossings of a ray)
const inPoly = (pts, x, z) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, zi] = pts[i], [xj, zj] = pts[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; };
const angGap = (a, b) => { const d = ((a - b) % TAU + TAU) % TAU; return Math.min(d, TAU - d); };
const angIn = (th, a0, a1) => { const span = ((a1 - a0) % TAU + TAU) % TAU || TAU; return ((th - a0) % TAU + TAU) % TAU <= span + 1e-9; };
// (the seats of a plan's rows the walk from its door reaches: a cell beside each, reached, a step from its height)
const reachedSeats = p => In.tierSeats(p).filter(q => { const n = p.grid.n, R = p.reach[q.lv], H = p.hgt && p.hgt[q.lv]; if (!R) return false; const cx = Math.floor(q.x / CS), cz = Math.floor(q.z / CS);
  for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) { const x = cx + dx, z = cz + dz; if (x < 0 || z < 0 || x >= n || z >= n) continue; const k = z * n + x; if (R[k] && (!H || Math.abs(H[k] - q.y) <= In.BODY.step + 1e-6)) return true; } return false; });
// (the floor of the form's seats at a point of the podium's storey, metres over the lot's ground — the cavea pieces' own
// rings: the podium's walk, each row, and in an aisle its steps, n to a row within a row's depth — the top ring is its top row
// and the walk behind it, flat —; null off them)
function caveaY(F, u, z) {
  for (const e of F.els) {
    if (e.k !== 'cavea') continue; const d = Math.hypot(u - e.c[0], z - e.c[1]), th = Math.atan2(z - e.c[1], u - e.c[0]);
    if (d < e.fundo || d > e.aneis[0][0] || !angIn(th, e.arco[0], e.arco[1])) continue;
    const A = e.aneis, n = A.length; let k = n - 1; while (k > 0 && d > A[k][0]) k--; const rIn = k < n - 1 ? A[k + 1][0] : e.fundo;
    const E = e.escadas; if (!E || !E.a.some(a => angGap(th, a) * d <= E.l / 2)) return A[k][1];
    const tread = n > 1 ? A[n - 1][0] - e.fundo : A[0][0] - e.fundo, rise = n > 1 ? A[n - 2][1] - A[n - 1][1] : 0.4; const j = Math.floor((d - rIn) / (tread / E.n));
    return j >= E.n ? A[k][1] : A[k][1] - rise + (j + 1) * rise / E.n;
  }
  return null;
}

// =========================================================================================== A — the Colosseum
function testeA() {
  blank();
  // ---------------------------------------------------------------- A1 the form
  {
    const out = [], said = [];
    for (const n of SIZES) {
      const F = Fo.of('maravilha', 'romano', n); if (!F || !F.amphi || !F.amphi.oval) { out.push(`n ${n}: sem forma`); continue; }
      const O = F.amphi.oval, cu = O.cu, cv = O.cv; const arc = F.els.find(e => e.k === 'arcada'), areia = F.els.find(e => e.k === 'areia');
      if (Fo.of('maravilha', 'romano', n) !== F) out.push(`n ${n}: a forma não é a mesma para todo prédio do degrau`);
      if (F.L !== n * 4 || F.L < 40) out.push(`n ${n}: o lote de ${F.L} m`);
      if (!arc || O.H < 18 || F.top < O.H) out.push(`n ${n}: a fachada de ${O.H} m (18 ao menos)`);
      const tiers = arc ? arc.andares.filter(a => a.arco).length : 0; if (tiers < 3 || !arc.andares.some(a => a.janela)) out.push(`n ${n}: ${tiers} andares de arcos e ${arc && arc.andares.some(a => a.janela) ? 'o' : 'nenhum'} ático`);
      const ch = arc.pts.map((p, k) => { const q = arc.pts[(k + 1) % arc.pts.length]; return Math.hypot(q[0] - p[0], q[1] - p[1]); });
      if (Math.min(...ch) < 4 || Math.max(...ch) > 6) out.push(`n ${n}: baias de ${Math.min(...ch).toFixed(2)} a ${Math.max(...ch).toFixed(2)} m (4 a 6)`);
      if (O.ah < 2.2 || O.aw < 2 || O.aw > 4 || O.ah / O.aw < 1.5 || O.ah / O.aw > 2.5) out.push(`n ${n}: o arco do térreo de ${O.aw} × ${O.ah} m`);
      // (the four ways in: open bays, each centred on an axis, square to the lot)
      const ways = (arc.abertos || []).filter(k => { const p = arc.pts[k], q = arc.pts[(k + 1) % arc.pts.length]; const mu = (p[0] + q[0]) / 2, mv = (p[1] + q[1]) / 2;
        return (Math.abs(mu - cu) < 1e-3 && Math.abs(p[1] - q[1]) < 1e-3) || (Math.abs(mv - cv) < 1e-3 && Math.abs(p[0] - q[0]) < 1e-3); });
      if (ways.length < 4) out.push(`n ${n}: ${ways.length} entradas nos eixos`);
      // (the arena: an oval of 20 × 12 m at least, the form's sand on its outline)
      const ext = areia ? [Math.max(...areia.pts.map(p => p[0])) - Math.min(...areia.pts.map(p => p[0])), Math.max(...areia.pts.map(p => p[1])) - Math.min(...areia.pts.map(p => p[1]))] : [0, 0];
      if (ext[0] < 20 || ext[1] < 12 || Math.abs(ext[0] - ext[1]) < 2) out.push(`n ${n}: a arena de ${ext[0].toFixed(2)} × ${ext[1].toFixed(2)} m`);
      // (the rows: the body's seat — each ring one rise over the next, one tread deep but the top one's —, the podium's parapet)
      const rowsP = F.els.filter(e => e.k === 'cavea' && e.escadas), pod = F.els.filter(e => e.k === 'cavea' && !e.escadas); let rmin = 9, rmax = 0, tmin = 9, tmax = 0;
      for (const e of rowsP) { const A = e.aneis; for (let k = 0; k < A.length; k++) { const rIn = k < A.length - 1 ? A[k + 1] : [e.fundo, e.fundo === O.blocks[0].r0 ? O.yb : O.yb]; const rise = A[k][1] - (k < A.length - 1 ? A[k + 1][1] : O.yb);
        rmin = Math.min(rmin, rise); rmax = Math.max(rmax, rise); if (k > 0) { const tr = A[k][0] - rIn[0]; tmin = Math.min(tmin, tr); tmax = Math.max(tmax, tr); } } }
      if (rmin < 0.4 - 1e-6 || rmax > 0.45 + 1e-6 || tmin < 0.7 - 1e-6 || tmax > 0.8 + 1e-6) out.push(`n ${n}: fileiras de ${rmin.toFixed(2)}–${rmax.toFixed(2)} × ${tmin.toFixed(2)}–${tmax.toFixed(2)} m`);
      if (pod.length < 8 || pod.some(e => !(e.parapeito >= 0.9))) out.push(`n ${n}: o pódio sem o parapeito de 0,9 m`);
      if (O.yb - O.ya < 2.2) out.push(`n ${n}: o pódio a ${(O.yb - O.ya).toFixed(2)} m sobre a areia`);
      // (the steps: each flight's riser, the aisles' half rows; the parapets along the passages, 0.9 m over the rows)
      const risers = [O.yb / O.ways.frente.m, O.yb / O.ways.fundo.m, O.ya / O.ways.esquerda.m, O.ya / O.hypo.m, O.rise / 2]; if (Math.max(...risers) > In.BODY.step) out.push(`n ${n}: degraus de ${Math.max(...risers).toFixed(2)} m`);
      const par = F.els.filter(e => e.k === 'bloco' && e.y0 >= O.yb - 1e-6 && Math.abs(e.y1 - e.y0 - 0.9) < 1e-6); if (par.length < 8 * O.rows) out.push(`n ${n}: ${par.length} parapeitos ao longo das passagens (${8 * O.rows} ao menos)`);
      // (the undercroft: its corridors' walls under the sand, the cages with their bars, the hatch; the masts)
      const under = F.els.filter(e => e.k === 'bloco' && e.y0 === 0 && Math.abs(e.y1 - (O.ya - 0.2)) < 1e-6).length, bars = F.els.filter(e => e.k === 'janelas' && e.grade).length;
      if (under < 8 || O.cages.length < 4 || bars < O.cages.length || !areia || !(areia.buracos || []).length) out.push(`n ${n}: o subsolo com ${under} paredes, ${O.cages.length} jaulas, ${bars} grades, ${areia && areia.buracos ? areia.buracos.length : 0} alçapões`);
      const masts = F.els.filter(e => e.k === 'tora').length; if (masts < O.nb) out.push(`n ${n}: ${masts} mastros (${O.nb} pilares)`);
      said.push(`n ${n}: lote ${F.L} m, fachada ${O.H} m (o alto ${F.top.toFixed(1)}) em ${tiers} andares de arcos e o ático, ${O.nb} baias de ${Math.min(...ch).toFixed(2)} m, arco ${O.aw} × ${O.ah} m, ${ways.length} entradas; arena ${ext[0].toFixed(1)} × ${ext[1].toFixed(1)} m a ${O.ya} m, pódio a ${O.yb} m; ${O.rows} fileiras de ${rmax.toFixed(2)} × ${tmin.toFixed(2)} m; ${O.cages.length} jaulas; ${masts} mastros`);
    }
    ok('A1 a forma do Coliseu: o lote, a fachada, a arena oval, as fileiras do corpo, os parapeitos, os degraus, o subsolo', !out.length, out.slice(0, 4).join(' · ') || said.join(' · '));
  }
  // ---------------------------------------------------------------- A2 the plan
  const plans = {}; let nid = 61001;
  {
    const out = [], said = []; const times = [];
    for (const n of SIZES) for (const s of SIDES) {
      const b = { id: (nid += 37), type: 'maravilha', style: 'romano', x: 8, y: 8, w: n, h: n, built: true }; b.ip = rec('maravilha', 'romano', 'forma.maravilha', s, n);
      const t0 = ms(); const p = In.makeFam(b, b.ip, 'forma.maravilha'); times.push(ms() - t0); plans[n + s] = { b, p };
      if (!p || !p.ok) { out.push(`n ${n}/${s}: não se arma (${p ? p.errs.slice(0, 2).join('; ') : '—'})`); continue; }
      G.S.buildings.set(b.id, b);
      const fal = In.report(b, p, { rec: b.ip }).filter(q => q.k === 'FALHA'); if (fal.length) out.push(`n ${n}/${s}: ${fal.slice(0, 2).map(q => q.what).join('; ')}`);
      const seats = In.tierSeats(p), got = reachedSeats(p); if (seats.length < 600 || got.length < seats.length) out.push(`n ${n}/${s}: ${seats.length} assentos, ${got.length} alcançados`);
      const lv = p.levels.map(l => l.lv).join(','); if (lv !== '0,1,2') out.push(`n ${n}/${s}: os pisos ${lv}`);
      const fl = p.stairs.map(q => `${q.lv0}→${q.lv1}`).sort().join(' '); if (fl !== '0→1 0→1 0→2 0→2') out.push(`n ${n}/${s}: os lances ${fl}`);
      const mk = use => (p.marks || []).filter(q => q.use === use).flatMap(q => q.pts).filter(q => q.ok).length; if (mk('lutar') < 2 || mk('assistir') < 40) out.push(`n ${n}/${s}: ${mk('lutar')} lugares de luta, ${mk('assistir')} de assistir em pé`);
      if (s === 'S') said.push(`n ${n}: ${got.length} assentos alcançados de ${seats.length}, ${mk('assistir')} em pé no pódio, ${mk('lutar')} de luta; ${p.rooms.length} cômodos, ${p.walls.length} paredes`);
    }
    const tmax = Math.max(...times), tmed = times.slice().sort((a, b) => a - b)[times.length >> 1];
    if (tmax > 400) out.push(`a planta levou ${tmax.toFixed(0)} ms (o alvo: 400)`);
    ok('A2 a planta do Coliseu: nos quatro lados e nos dois tamanhos, ≥ 600 assentos alcançados, em pé no pódio, a luta na areia, o tempo', !out.length, out.slice(0, 4).join(' · ') || `${said.join(' · ')}; o tempo: a primeira ${times[0].toFixed(0)} ms, a mediana ${tmed.toFixed(0)}, a maior ${tmax.toFixed(0)} (alvo 400)`);
  }
  // ---------------------------------------------------------------- A3 the form × the plan
  {
    const out = [], said = [];
    for (const n of SIZES) {
      const { p } = plans[n + 'S']; if (!p || !p.ok) continue; const F = Fo.of('maravilha', 'romano', n), O = F.amphi.oval; const { cu, cv } = O; const N = p.grid.n;
      const arc = F.els.find(e => e.k === 'arcada'); const strip = (x, z) => Math.abs(x - cu) < O.g / 2 || Math.abs(z - cv) < O.h / 2;
      const inArena = (x, z) => O.inside(x, z, 0), inBand = (x, z) => O.inside(x, z, O.dp);
      // (where the walk goes on each storey: the form's floors there — the square out of the facade and the passages through
      // it, the arena and its gate, the podium and the rows within the facade's inner face, out of the passages but for the
      // landings and the bridges)
      const allowed = {
        0: (x, z) => !inPoly(arc.pts, x, z) || strip(x, z),
        1: (x, z) => inArena(x, z) || (Math.abs(z - cv) < O.h / 2 && x < cu && x > cu - O.Au - 0.3),
        2: (x, z) => !inArena(x, z) && ((inPoly(arc.pts1, x, z) && !strip(x, z)) || (strip(x, z) && inBand(x, z))),
      };
      const bad = { 0: 0, 1: 0, 2: 0 }, first = {}, cnt = { 0: 0, 1: 0, 2: 0 };
      for (const lv of [0, 1, 2]) { const R = p.reach[lv]; for (let k = 0; k < N * N; k++) { if (!R[k]) continue; cnt[lv]++; const x = (k % N + 0.5) * CS, z = (Math.floor(k / N) + 0.5) * CS; if (!allowed[lv](x, z)) { bad[lv]++; if (!first[lv]) first[lv] = `(${x.toFixed(2)}, ${z.toFixed(2)})`; } } }
      for (const lv of [0, 1, 2]) if (bad[lv]) out.push(`n ${n}: ${bad[lv]} casinhas do piso ${lv} andadas fora do chão da forma (a primeira ${first[lv]})`);
      // (and every floor of the form walked: the arena's and the podium's band, the cells inside them a body's half off their edges)
      let ia = 0, ra = 0, ib = 0, rb = 0;
      for (let k = 0; k < N * N; k++) { const x = (k % N + 0.5) * CS, z = (Math.floor(k / N) + 0.5) * CS;
        if (O.inside(x, z, -0.45) && !(x > O.hatch[0] - 0.45 && x < O.hatch[2] + 0.45 && z > O.hatch[1] - 0.45 && z < O.hatch[3] + 0.45)) { ia++; if (p.reach[1][k]) ra++; }
        if (O.inside(x, z, O.dp - 0.45) && !O.inside(x, z, 0.45) && !strip(x, z)) { ib++; if (p.reach[2][k]) rb++; } }
      if (ra < ia || rb < ib) out.push(`n ${n}: a arena andada em ${ra} de ${ia} casinhas, o pódio em ${rb} de ${ib}`);
      // (the heights: the podium's and the rows' — the form's rings, off the aisles —, the sand's, the ground's)
      let worst = 0, at = '';
      for (let k = 0; k < N * N; k++) { if (!p.reach[2][k]) continue; const x = (k % N + 0.5) * CS, z = (Math.floor(k / N) + 0.5) * CS; if (strip(x, z)) continue; const fy = caveaY(F, x, z); if (fy === null) continue;
        // (a row's top where the cell's middle is: the cell's own height is its middle's — off the risers by half a cell)
        const near = [[0.13, 0], [-0.13, 0], [0, 0.13], [0, -0.13]].some(([dx, dz]) => Math.abs((caveaY(F, x + dx, z + dz) ?? fy) - fy) > 1e-6); if (near) continue;
        const d = In.floorYOf(p, 2, x, z) - fy; if (Math.abs(d) > Math.abs(worst)) { worst = d; at = `(${x.toFixed(2)}, ${z.toFixed(2)})`; } }
      if (Math.abs(worst) > 0.01) out.push(`n ${n}: o piso do pódio a ${worst.toFixed(2)} m da forma em ${at}`);
      const y1 = p.levels.find(l => l.lv === 1).y, ay = F.els.find(e => e.k === 'areia').y; if (Math.abs(y1 - ay) > 1e-6) out.push(`n ${n}: a areia da planta a ${y1}, a da forma a ${ay}`);
      const y0 = p.levels.find(l => l.lv === 0).y, gy = F.els.find(e => e.k === 'bloco' && e.piso).y1; if (Math.abs(y0 - gy) > 1e-6) out.push(`n ${n}: o térreo da planta a ${y0}, a praça da forma a ${gy}`);
      // (the facade: the plan's wall in each bay — between its outer and its inner face —, open on the axes: the way through)
      const g0 = p.grid.lv[0]; let shut = 0, open = 0;
      for (let k = 0; k < arc.pts.length; k++) { const q = (k + 1) % arc.pts.length; const x = (arc.pts[k][0] + arc.pts[q][0] + arc.pts1[k][0] + arc.pts1[q][0]) / 4, z = (arc.pts[k][1] + arc.pts[q][1] + arc.pts1[k][1] + arc.pts1[q][1]) / 4;
        const c = g0[Math.floor(z / CS) * N + Math.floor(x / CS)]; if (arc.abertos.includes(k)) { if (c === In.CELL.DOOR && p.reach[0][Math.floor(z / CS) * N + Math.floor(x / CS)]) open++; } else if (c === In.CELL.WALL) shut++; }
      if (shut < arc.pts.length - 4 || open < 4) out.push(`n ${n}: a fachada na planta: ${shut} baias fechadas, ${open} abertas e andadas`);
      said.push(`n ${n}: andadas ${cnt[0]} / ${cnt[1]} / ${cnt[2]} casinhas nos três pisos, a arena ${ra}/${ia} e o pódio ${rb}/${ib}; o piso das fileiras a ${worst.toFixed(3)} m da forma; ${shut} baias fechadas e ${open} abertas`);
    }
    ok('A3 a forma × a planta: só se anda onde a forma tem chão, na altura dela, a arena e o pódio inteiros, a fachada nas baias', !out.length, out.slice(0, 4).join(' · ') || said.join(' · '));
  }
  // ---------------------------------------------------------------- A4 the feet, on a blank world
  {
    const S = G.newState(7); S.H.fill(4); S.type.fill(G.T.GRASS); if (S.biome) S.biome.fill(0); S.clock = 0; S.day = 30; S.time = 0.3; G.S = S; G.newWorld();
    const TL = Sp.TILE; const out = [], said = [];
    for (const n of SIZES) {
      const def = G.BDEF.maravilha; const b = { id: 91001 + n, type: 'maravilha', style: 'romano', esc: n === 10 ? 'maravilha' : 'colossal', x: 12, y: 12, w: n, h: n, built: true, progress: 1, hp: def.hp || 100, maxHp: def.hp || 100, v: 0, set: 0, blocks: true, ip: null };
      for (const o of [...S.buildings.values()]) { for (let yy = o.y; yy < o.y + o.h; yy++) for (let xx = o.x; xx < o.x + o.w; xx++) S.occ[yy * G.N + xx] = 0; S.buildings.delete(o.id); }
      S.buildings.set(b.id, b); for (let yy = b.y; yy < b.y + b.h; yy++) for (let xx = b.x; xx < b.x + b.w; xx++) S.occ[yy * G.N + xx] = b.id;
      b.ip = In.newRecord(b, { t: 'maravilha', c: 'romano', e: 3, k: 'ae', cl: 't', fl: 0, d: 1, w: 1, pw: 0, s: 'S', o: (1 << n) - 1, n });
      const p = Sp.planNow(b); if (!p || !p.ok) { out.push(`n ${n}: sem planta (${p ? p.errs.slice(0, 2).join('; ') : '—'})`); continue; }
      const F = Fo.of('maravilha', 'romano', n), O = F.amphi.oval, W = O.ways; const { cu, cv, g, h, Au, Bv, rb, dp } = O; const L = n * TL; const gy = F.els.find(e => e.k === 'bloco' && e.piso).y1;
      // (the form's floor under a point of a storey: the square's top on the ground; the sand; on the podium's storey the seats'
      // own — the landings', the bridges' and the podium's top —; within half a cell's diagonal of a step of the rows — the
      // plan's height is its cell's middle's —, not asked)
      const want = (lv, u, z) => (lv === 0 ? gy : lv === 1 ? O.ya : (caveaY(F, u, z) ?? O.yb));
      const R8 = [0, 1, 2, 3, 4, 5, 6, 7].map(k => [0.18 * Math.cos(k * Math.PI / 4), 0.18 * Math.sin(k * Math.PI / 4)]);
      const edge = (lv, u, z) => lv === 2 && R8.some(([dx, dz]) => Math.abs((caveaY(F, u + dx, z + dz) ?? O.yb) - (caveaY(F, u, z) ?? O.yb)) > 1e-6);
      const pl = Sp.plinth(b); let worst = 0, at = '', step = 0, shut = 0, shutAt = '', pts = 0;
      // (the ways, leg by leg on their storeys, every 2 cm: the feet where Space puts them, against the form's floor there)
      const big = [cu + g / 2, cv + h / 2 - O.b]; const am = (O.phi + Math.PI / 2) / 2; const onBig = (r, a) => [big[0] + r * Math.cos(a), big[1] + r * Math.sin(a)];
      const podium = []; for (let a = Math.PI / 2 - 0.02; a >= am; a -= 0.02) podium.push(onBig(rb + 0.62, a)); podium.push(onBig(rb + 0.62, am));
      const top = []; for (let a = am; a <= am + 0.12; a += 0.02) top.push(onBig(rb + O.D - O.t - 0.36, a));
      const legs = [
        [0, [[cu, L + 0.8], [cu, W.frente.r[3] + 0.45]]],
        [0, [[cu - 3, L - 2.0], [0.85, L - 2.0], [0.85, cv], [W.esquerda.r[0] - 0.45, cv]]],
        [0, [[cu + 3, L - 2.0], [L - 0.85, L - 2.0], [L - 0.85, cv], [cu, cv], [cu, O.hypo.r[1] - 0.45]]],
        [1, [[cu - Au + 0.5, cv], [cu, cv], [cu + 3, cv + 2.5], [cu + 3, O.hypo.r[3] + 1.0]]],
        [2, [[cu, cv + Bv + 0.85]].concat(podium, [onBig(rb + O.D - O.t - 0.36, am)], top)],
      ];
      for (const [lv, path] of legs) { let prev = null;
        for (let k = 0; k < path.length - 1; k++) { const [u0, z0] = path[k], [u1, z1] = path[k + 1]; const len = Math.hypot(u1 - u0, z1 - z0), m = Math.max(1, Math.round(len / 0.02));
          for (let j = 0; j <= m; j++) { const u = u0 + (u1 - u0) * j / m, z = z0 + (z1 - z0) * j / m; const X = b.x * TL + u, Z = b.y * TL + z; const ins = Sp.indoor(X, Z, lv, b.id);
            const foot = ins ? ins.y : Math.max(Sp.footAt(X / TL, Z / TL), Sp.stepTop(X, Z)); pts++;
            if (ins && !ins.walk) { shut++; if (!shutAt) shutAt = `(${u.toFixed(2)}, ${z.toFixed(2)}) piso ${lv}`; }
            if (prev !== null) step = Math.max(step, Math.abs(foot - prev)); prev = foot;
            if (!ins || !ins.shell || edge(lv, u, z)) continue; // (the street before the way in; a step's edge of the rows)
            const d = foot - (pl.hi + want(lv, u, z) + Sp.FLOOR_UP); if (Math.abs(d) > 0.03 && Math.abs(d) > Math.abs(worst)) { worst = d; at = `(${u.toFixed(2)}, ${z.toFixed(2)}) piso ${lv}`; } } } }
      if (worst || step > In.BODY.step + 0.01) out.push(`n ${n}: os pés a ${worst.toFixed(2)} m da forma em ${at || '—'}, o maior degrau ${step.toFixed(2)} m`);
      if (shut) out.push(`n ${n}: ${shut} pontos do caminho onde o corpo não passa (o primeiro ${shutAt})`);
      said.push(`n ${n}: ${pts} pontos, o maior degrau ${step.toFixed(2)} m`);
    }
    ok('A4 os pés pelo Coliseu: da rua pelos arcos às passagens e ao subsolo, na areia, no pódio e subindo um corredor das fileiras', !out.length, out.slice(0, 3).join(' · ') || said.join(' · '));
  }
  // ---------------------------------------------------------------- A5 the world: the god's hand in Rome
  {
    const out = [];
    M.pronto('metropole'); const S = G.S; const set = [...S.settlements.values()].find(s => s.name === 'Roma');
    const bad = what => { const q = globalThis.QA.check().filter(x => x.sev <= 2 || x.sys === 'monumental' || x.sys === 'escala'); if (q.length) out.push(`${what}: ${q.slice(0, 2).map(x => `${x.sys} S${x.sev} ${x.msg.slice(0, 90)}`).join(' · ')}`); };
    bad('antes');
    G.inSim++; let b; try { b = set && G.Village.handFound(set, 'maravilha', 'maravilha', { built: true, R: 60 }); } finally { G.inSim--; }
    let info = '';
    if (!b) out.push('a mão do deus não achou lote de 10 casas perto de Roma');
    else {
      const p = In.plan(b), F = Fo.of(b.type, b.style, b.w);
      if (b.w !== 10 || b.h !== 10 || b.esc !== 'maravilha' || !b.built) out.push(`o prédio ${b.w}×${b.h} esc=${b.esc} pronto=${b.built}`);
      if (!F || F.L !== b.w * 4 || !p || !p.ok || In.nOf(b.ip) !== b.w) out.push(`o lote, a forma e a planta: ${b.w * 4} m, ${F ? F.L : '—'} m, ${p && p.ok ? In.nOf(b.ip) * 4 + ' m' : 'sem planta'}`);
      const fal = p && p.ok ? In.report(b, p, { world: true, sides: true }).filter(q => q.k === 'FALHA') : []; if (fal.length) out.push(`no mundo: ${fal.map(q => q.what).join('; ')}`);
      bad('de pé'); M.viver(5); bad('vivendo'); const sig = p && p.sig;
      M.salvarCarregar(); const b2 = G.S.buildings.get(b.id); const p2 = b2 && In.plan(b2); if (!p2 || !p2.ok || p2.sig !== sig || b2.w !== 10 || b2.esc !== 'maravilha') out.push('depois do save: outro prédio ou outra planta'); bad('carregado');
      G.inSim++; try { G.Village.damageBuilding(G.S.buildings.get(b.id), 1e6, 'quake'); } finally { G.inSim--; }
      const b3 = G.S.buildings.get(b.id); if (b3 && b3.type !== 'ruin') out.push('o deus derrubou e ficou de pé'); bad('derrubado'); M.viver(1); bad('a ruína vivendo');
      info = `Roma: #${b.id} ${b.w}×${b.h} casas a ${G.dist(b.x + b.w / 2, b.y + b.h / 2, set.cx, set.cy).toFixed(1)} casas do centro, ${p && p.cap.watch} assentos; vivo, salvo e carregado (a mesma planta), derrubado: o verificador limpo`;
    }
    if (!M.limpo()) { const e = M.erros(); out.push(`erros: ${JSON.stringify(e.mod)} ${e.console.slice(0, 2).join(' | ')}`); }
    ok('A5 o Coliseu pela mão do deus em Roma (a metrópole): de pé, vivendo, salvo e carregado, derrubado — o verificador limpo', !out.length, out.slice(0, 3).join(' · ') || info);
  }
  // ---------------------------------------------------------------- A6 the checker
  {
    const out = []; M.pronto('metropole'); const set = [...G.S.settlements.values()].find(s => s.name === 'Roma');
    G.inSim++; let b; try { b = set && G.Village.handFound(set, 'maravilha', 'maravilha', { built: true, R: 60 }); } finally { G.inSim--; }
    const mine = () => globalThis.QA.check().filter(q => q.sys === 'monumental');
    const clean = b ? mine() : []; if (!b) out.push('sem o Coliseu'); else if (clean.length) out.push(`com a planta inteira: ${clean.map(q => q.msg.slice(0, 80)).join(' · ')}`);
    const plan0 = In.plan; In.plan = x => { const p = plan0(x); return x === b && p ? Object.assign({}, p, { cap: Object.assign({}, p.cap, { watch: 120 }) }) : p; };
    let hit; try { hit = mine(); } finally { In.plan = plan0; }
    if (!hit.some(q => q.sev === 2)) out.push('com 120 lugares o verificador calou');
    if (mine().length) out.push('de volta, o verificador não calou');
    ok('A6 o verificador do Coliseu: pega uma planta com menos lugares que o degrau, e cala quando ela volta', !out.length, out.join(' · ') || `limpo; com 120 lugares: «${hit[0].msg.slice(0, 90)}»; limpo de novo`);
  }
  // ---------------------------------------------------------------- A7 the places' table
  // (who is given a place in it — In.places, freePlace, the body's «lugar» —: the table of the plan's places, made once a record;
  // in a process of its own with a deadline, so that a table that never ends fails the proof instead of hanging it)
  {
    const path = require('path'), cp = require('child_process');
    const code = `const M = require(${JSON.stringify(path.join(__dirname, 'nodemundo.js'))}); const G = M.load({}); const In = G.Interiors; const ms = () => Number(process.hrtime.bigint()) / 1e6;
      G.S = { villagers: new Map(), buildings: new Map(), dead: new Map(), settlements: new Map(), clock: 100, day: 3, time: 0.4, avatar: null, nextId: 1000, history: [], fire: new Float32Array(G.N * G.N) };
      const b = { id: 71021, type: 'maravilha', style: 'romano', x: 8, y: 8, w: 10, h: 10, esc: 'maravilha', built: true }; b.ip = ${JSON.stringify(rec('maravilha', 'romano', 'forma.maravilha', 'S', 10))}; G.S.buildings.set(b.id, b);
      const p = In.plan(b); const t0 = ms(); const t = In.table(b); const dt = ms() - t0;
      console.log(JSON.stringify({ ok: !!(p && p.ok && t), dt, watch: !!In.freePlace(b, 'assistir'), fight: !!In.freePlace(b, 'lutar'), spots: t ? t.spots.length : 0 })); process.exit(0);`;
    const t0 = ms(); const r = cp.spawnSync(process.execPath, ['-e', code], { cwd: __dirname, timeout: 30000, encoding: 'utf8' }); const wall = ms() - t0;
    let o = null; try { o = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch (e) { o = null; }
    const out = [];
    if (!o) out.push(r.signal ? `o repartidor de lugares não terminou em ${(wall / 1000).toFixed(0)} s (interiors.js, makeTable)` : `o processo da prova falhou: ${(r.stderr || '').slice(0, 160)}`);
    else { if (!o.ok || !o.watch || !o.fight) out.push(`a tabela ${o.ok ? 'feita' : 'não feita'}, um lugar livre de assistir ${o.watch}, de lutar ${o.fight}`); if (o.dt > 400) out.push(`a tabela dos lugares levou ${o.dt.toFixed(0)} ms (o alvo: 400)`); }
    ok('A7 os lugares do Coliseu (In.places, a tabela da planta): feita a tempo, um lugar livre de assistir e de lutar', !out.length, out.join(' · ') || `${o.spots} lugares na tabela em ${o.dt.toFixed(0)} ms`);
  }
}

const TESTS = { A: testeA };
const want = process.argv.slice(2).map(s => s.toUpperCase());
for (const k of Object.keys(TESTS)) if (!want.length || want.includes(k)) TESTS[k]();
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'monumental: tudo PASSOU');
process.exit(fails.length ? 1 : 0);
