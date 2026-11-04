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
//     A7 os lugares (In.places, a tabela da planta), num processo à parte com prazo: feita a tempo, um lugar livre de assistir
//        e de lutar
//   C — as pirâmides (a maravilha egípcia e a asteca nos degraus de 10 e 13 casas: js/forma-espetaculo.js e as plantas em
//       js/int-monumentos.js, D-108):
//     C1 as formas: a Grande Pirâmide lisa (as faces de 50 a 54°, a base ≥ 36 m), a entrada aberta na face (≥ 2,2 m), o
//        corredor, a galeria (degraus ≤ 0,30 m, ≤ 45°) e a câmara do rei dentro da massa (ocultos, meio metro dentro das
//        faces ao menos), o templo do pé no lote colossal; o Templo Mayor de ≥ 4 terraços, a escada dupla (as duas pistas,
//        a crista, as rampas; degraus ≤ 0,30 m) da praça ao alto, os dois santuários com as portas (≥ 2,2 m) e os braseiros,
//        o parapeito de 0,9 m aberto na escada; as duas massas de longe diferentes; a mesma forma para todo prédio do degrau
//     C2 as plantas: nos quatro lados e nos dois tamanhos, sem falha; os dois pisos e o lance; o corredor, o patamar e a
//        câmara (a praça e a plataforma) alcançados; os lugares do rito, os de cima no piso de cima; o tempo (≤ 400 ms)
//     C3 a forma × a planta: só se anda onde a forma tem chão — a laje fora da pirâmide, o corredor e a galeria; o patamar e
//        a câmara fora do sarcófago; a praça fora da base e a escada; o alto fora dos santuários e dos braseiros — e na
//        altura dela; o corredor, a câmara e a plataforma andados inteiros
//     C4 os pés, num mundo em branco, a cada 2 cm (Space.indoor): da rua pela entrada e o corredor, subindo a galeria, do alto
//        dela pela porta à câmara; da rua pela praça, em volta da base, subindo a escada, no alto entre os braseiros e em
//        volta dos santuários — o chão da forma (num lance, a até um degrau sob os degraus dela), o maior degrau, o corpo
//        passando em todo ponto
//     C5 o mundo: a pirâmide em Tebas e o Templo Mayor em Tenochtitlan pela mão do deus (a metrópole pronta) — o povo não
//        funda mais a maravilha antiga —, de pé, vivendo, salvos e carregados (a mesma planta), derrubados: o verificador limpo
//     C6 o verificador: pega a câmara do rei noutra altura e o alto sem quem oficia, e cala quando voltam
//     C7 os lugares (a tabela da planta), num processo à parte com prazo: feita a tempo, um lugar livre de cada uso do rito
//   node qa/monumental.js [A C …]   (só as letras pedidas; sem nada, todas)
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
  {
    const o = placesOf('romano', 10, ['assistir', 'lutar']); const out = [];
    if (o.err) out.push(o.err);
    else { if (!o.ok || !o.free.assistir || !o.free.lutar) out.push(`a tabela ${o.ok ? 'feita' : 'não feita'}, um lugar livre de assistir ${o.free.assistir}, de lutar ${o.free.lutar}`); if (o.dt > 400) out.push(`a tabela dos lugares levou ${o.dt.toFixed(0)} ms (o alvo: 400)`); }
    ok('A7 os lugares do Coliseu (In.places, a tabela da planta): feita a tempo, um lugar livre de assistir e de lutar', !out.length, out.join(' · ') || `${o.spots} lugares na tabela em ${o.dt.toFixed(0)} ms`);
  }
}
// (who is given a place in a wonder of a people — In.places, freePlace, the body's «lugar» —: the table of its plan's places,
// made once a record; in a process of its own with a deadline, so that a table that never ends fails the proof instead of
// hanging it → { ok, dt, spots, free: { use: a place free } } | { err })
function placesOf(style, n, uses) {
  const path = require('path'), cp = require('child_process');
  const code = `const M = require(${JSON.stringify(path.join(__dirname, 'nodemundo.js'))}); const G = M.load({}); const In = G.Interiors; const ms = () => Number(process.hrtime.bigint()) / 1e6;
    G.S = { villagers: new Map(), buildings: new Map(), dead: new Map(), settlements: new Map(), clock: 100, day: 3, time: 0.4, avatar: null, nextId: 1000, history: [], fire: new Float32Array(G.N * G.N) };
    const b = { id: 71021, type: 'maravilha', style: ${JSON.stringify(style)}, x: 8, y: 8, w: ${n}, h: ${n}, esc: ${JSON.stringify(n >= 13 ? 'colossal' : 'maravilha')}, built: true }; b.ip = ${JSON.stringify(rec('maravilha', style, 'forma.maravilha', 'S', n))}; G.S.buildings.set(b.id, b);
    const p = In.plan(b); const t0 = ms(); const t = In.table(b); const dt = ms() - t0; const free = {}; for (const u of ${JSON.stringify(uses)}) free[u] = !!In.freePlace(b, u);
    console.log(JSON.stringify({ ok: !!(p && p.ok && t), dt, free, spots: t ? t.spots.length : 0 })); process.exit(0);`;
  const t0 = ms(); const r = cp.spawnSync(process.execPath, ['-e', code], { cwd: __dirname, timeout: 30000, encoding: 'utf8' }); const wall = ms() - t0;
  let o = null; try { o = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch (e) { o = null; }
  if (!o) return { err: r.signal ? `o repartidor de lugares não terminou em ${(wall / 1000).toFixed(0)} s (interiors.js, makeTable)` : `o processo da prova falhou: ${(r.stderr || '').slice(0, 160)}` };
  return o;
}
// (a wonder's plan on the blank state, its street on the side s: { b, p, dt — the time of making it })
function wonderPlan(style, n, s, id) {
  const b = { id, type: 'maravilha', style, x: 8, y: 8, w: n, h: n, built: true }; b.ip = rec('maravilha', style, 'forma.maravilha', s, n);
  const t0 = ms(); const p = In.makeFam(b, b.ip, 'forma.maravilha'); return { b, p, dt: ms() - t0 };
}
// (the places of a use a plan's marks have that the body takes — on the storey lv, when given)
const marksOk = (p, use, lv) => (p.marks || []).filter(q => q.use === use && (lv === undefined || q.lv === lv)).flatMap(q => q.pts).filter(q => q.ok).length;
// (a room of a plan made — its rectangle the grid's — with a cell the walk from the door reaches)
const roomReached = (p, m) => { const R = p.reach[m.lv], n = p.grid.n; if (!R) return false;
  for (let z = Math.max(0, Math.floor(m.r[1] / CS)); z <= Math.min(n - 1, Math.floor(m.r[3] / CS)); z++) for (let x = Math.max(0, Math.floor(m.r[0] / CS)); x <= Math.min(n - 1, Math.floor(m.r[2] / CS)); x++) if (R[z * n + x]) return true; return false; };
// (the half width of a form's far figure at a height y, about its axis u = cu: of its masses there, the widest)
function massHalf(ms0, cu, y) {
  let w = 0;
  for (const m of ms0) {
    if (m.k === 'piramide') { if (y >= m.y0 && y <= m.y1) w = Math.max(w, m.e * (1 - (y - m.y0) / (m.y1 - m.y0))); }
    else if (m.k === 'box' && !m.ralo && y >= m.y0 && y <= m.y1) w = Math.max(w, Math.abs(m.r[0] - cu), Math.abs(m.r[2] - cu));
  }
  return w;
}

// =========================================================================================== C — the pyramids
function testeC() {
  blank();
  // ---------------------------------------------------------------- C1 the forms
  {
    const out = [], said = [];
    for (const n of SIZES) {
      // ---- the Great Pyramid
      const F = Fo.of('maravilha', 'egipcio', n), A = F && F.amphi && F.amphi.piramide; const pyr = F && F.els.find(e => e.k === 'piramide' && !e.oculto);
      if (!A || !pyr) { out.push(`egípcia n ${n}: sem a forma`); continue; }
      if (Fo.of('maravilha', 'egipcio', n) !== F) out.push(`egípcia n ${n}: a forma não é a mesma para todo prédio do degrau`);
      if (F.L !== n * 4 || F.L < 40) out.push(`egípcia n ${n}: o lote de ${F.L} m`);
      // (smooth — one pyramid, no terraces —, its faces at the Great Pyramid's slope, its base)
      const H = pyr.y1 - pyr.y0, slope = Math.atan2(H, pyr.e) * 180 / Math.PI;
      if (slope < 50 || slope > 54 || 2 * pyr.e < 36 || F.els.some(e => e.k === 'escalonada')) out.push(`egípcia n ${n}: as faces a ${slope.toFixed(2)}°, a base de ${(2 * pyr.e).toFixed(1)} m`);
      // (the way in: open through the face — the corridor's mouth, as wide —, a public door's height; the door of the form there)
      const en = pyr.entrada; const dr = F.door;
      if (!en || en.w < 1.2 || en.y1 - en.y0 < 2.2 || Math.abs(en.u - A.cu) > 1e-6 || Math.abs(en.w - 2 * A.cw) > 1e-6 || !dr || dr.sealed || dr.y1 - dr.y0 < 2.2) out.push(`egípcia n ${n}: a entrada na face ${en ? `${en.w} × ${(en.y1 - en.y0).toFixed(2)} m` : 'nenhuma'}, a porta da forma ${dr ? `${dr.w} × ${(dr.y1 - dr.y0).toFixed(2)} m${dr.sealed ? ' lacrada' : ''}` : 'nenhuma'}`);
      // (what is inside the mass — the corridor, the gallery, the landing, the chamber —: hidden, each piece half a metre inside the
      // faces at least; the corridor's pieces from their back end — their mouth leaves the face: its portal)
      const inner = F.els.filter(e => e.oculto), half = y => pyr.e * (1 - (Math.max(y, pyr.y0) - pyr.y0) / H); let worst = 9, at = '';
      for (const e of inner) { if (e.k !== 'bloco') continue; const mouth = e.r[3] >= A.face - 1e-6;
        for (const u of [e.r[0], e.r[2]]) for (const v of (mouth ? [e.r[1]] : [e.r[1], e.r[3]])) for (const y of [e.y0, e.y1]) { const m = half(y) - Math.max(Math.abs(u - pyr.c[0]), Math.abs(v - pyr.c[1])); if (m < worst) { worst = m; at = `(${u.toFixed(1)}, ${v.toFixed(1)}, ${y.toFixed(1)})`; } } }
      if (inner.length < 12 || worst < 0.5) out.push(`egípcia n ${n}: ${inner.length} peças ocultas, a mais rasa a ${worst.toFixed(2)} m da face em ${at}`);
      // (the gallery's steps: each a body's, up to the chamber's floor, the flight walked — 45° at most)
      const st = inner.filter(e => e.degrau).sort((a, b) => a.y1 - b.y1); let rmax = 0, prev = A.y0; for (const e of st) { rmax = Math.max(rmax, e.y1 - prev); prev = e.y1; }
      const gal = Math.atan2(A.yK - A.y0, A.gallery.run) * 180 / Math.PI;
      if (st.length < 10 || rmax > In.BODY.step + 1e-6 || Math.abs(prev - A.yK) > 1e-6 || gal > 45 + 1e-6) out.push(`egípcia n ${n}: a galeria de ${st.length} degraus de ${rmax.toFixed(2)} m a ${gal.toFixed(1)}°, até ${prev.toFixed(2)} m (a câmara a ${A.yK} m)`);
      // (the chamber: its size, its door a public door's height, the sarcophagus in it)
      const K = A.chamber, kw = K[2] - K[0], kd = K[3] - K[1], dw = Math.round((A.doorK[1] - A.doorK[0]) * 100) / 100, dh = A.doorK[4], S0 = A.sarco;
      if (kw < 5 || kd < 3.5 || dh < 2.2 || dw < 1.0 || !(S0[0] > K[0] && S0[2] < K[2] && S0[1] > K[1] && S0[3] < K[3])) out.push(`egípcia n ${n}: a câmara de ${kw} × ${kd} m, a porta de ${dw} × ${dh} m`);
      // (the temple at its foot where the lot leaves room for it — the colossal's —: its court, its pillars, its altar)
      const T = A.temple, pil = F.els.filter(e => e.k === 'colunata').reduce((s, e) => s + e.pts.length, 0);
      if (n >= 13 && (!T || !T.altar || pil < 8)) out.push(`egípcia n ${n}: sem o templo do pé (${pil} pilares)`);
      said.push(`egípcia n ${n}: lote ${F.L} m, a base de ${(2 * pyr.e).toFixed(0)} m e ${H.toFixed(2)} m de alto, as faces a ${slope.toFixed(2)}°, lisa; a entrada de ${en.w} × ${(en.y1 - en.y0).toFixed(1)} m, o corredor de ${(A.face - A.vC).toFixed(1)} m, a galeria de ${st.length} degraus de ${rmax.toFixed(2)} m (${gal.toFixed(1)}°), a câmara de ${kw} × ${kd} m a ${A.yK} m (a porta de ${dw} × ${dh} m); ${inner.length} peças ocultas, a mais rasa a ${worst.toFixed(2)} m da face; ${T ? `o templo do pé com ${pil} pilares` : 'sem lugar para o templo do pé'}`);
      // ---- the Templo Mayor
      const F2 = Fo.of('maravilha', 'asteca', n), B = F2 && F2.amphi && F2.amphi.mayor;
      if (!B) { out.push(`asteca n ${n}: sem a forma`); continue; }
      if (Fo.of('maravilha', 'asteca', n) !== F2) out.push(`asteca n ${n}: a forma não é a mesma para todo prédio do degrau`);
      if (F2.L !== n * 4 || F2.L < 40) out.push(`asteca n ${n}: o lote de ${F2.L} m`);
      // (four terraces at least, each narrower than the one under it, on it)
      const N = (F2.els.find(e => e.k === 'escalonada') || { niveis: [] }).niveis;
      const stacked = N.every((q, k) => !k || (q[0] < N[k - 1][0] - 0.5 && Math.abs(q[1] - N[k - 1][2]) < 1e-6));
      if (N.length < 4 || !stacked || F2.els.some(e => e.k === 'piramide')) out.push(`asteca n ${n}: ${N.length} terraços${stacked ? '' : ' fora de ordem'}`);
      // (the double stair — its two lanes, the ridge between them, the ramps at its sides —, from the square to the top's front
      // edge, each step a body's)
      const es = F2.els.find(e => e.k === 'escada'), tr = es ? Fo.flight(es) : []; let er = 0, ep = es ? es.a[2] : 0; for (const q of tr) { er = Math.max(er, q.y1 - ep); ep = q.y1; }
      const lane = es && es.divisor ? (es.w - es.divisor.w) / 2 : 0, deg = es ? Math.atan2(es.b[2] - es.a[2], es.a[1] - es.b[1]) * 180 / Math.PI : 0;
      if (!es || !es.divisor || !es.alfarda || lane < 1.2 || er > In.BODY.step + 1e-6 || Math.abs(es.b[2] - B.H) > 1e-6 || Math.abs(es.b[1] - B.top[3]) > 1e-6 || es.a[2] > 0.1) out.push(`asteca n ${n}: a escada ${es ? `de ${es.w} m (pistas de ${lane.toFixed(2)} m), degraus de ${er.toFixed(2)} m, de ${es.a[2]} a ${es.b[2]} m` : 'nenhuma'}`);
      // (the two shrines on the top, each its band — two colours —, its door to the front a public door's height; the braziers)
      const sh = F2.els.filter(e => e.k === 'bloco' && Math.abs(e.y0 - B.H) < 1e-6 && e.y1 - e.y0 >= 5), doors = F2.els.filter(e => e.k === 'porta' && e.na === 'frente' && Math.abs(e.y0 - B.H) < 1e-6);
      const bands = new Set(F2.els.filter(e => e.k === 'faixa' && e.y0 > B.H).map(e => e.cor)), br = Fo.uses(F2).filter(u => u.uso === 'acender' && u.pe);
      if (sh.length !== 2 || doors.length !== 2 || doors.some(d => d.y1 - d.y0 < 2.2 || d.w < 1.2) || bands.size !== 2 || br.length !== 2) out.push(`asteca n ${n}: ${sh.length} santuários, ${doors.length} portas, ${bands.size} cores, ${br.length} braseiros no alto`);
      // (the parapet round the top: 0.9 m on its edges, open where the stair comes up)
      const Tp = B.top, par = F2.els.filter(e => e.k === 'bloco' && Math.abs(e.y0 - B.H) < 1e-6 && Math.abs(e.y1 - e.y0 - 0.9) < 1e-6 && Math.min(e.r[2] - e.r[0], e.r[3] - e.r[1]) <= B.pt + 1e-6);
      const per = 2 * (Tp[2] - Tp[0] + Tp[3] - Tp[1]), len = par.reduce((s, e) => s + Math.max(e.r[2] - e.r[0], e.r[3] - e.r[1]), 0);
      const gap = !par.some(e => e.r[3] > Tp[3] - B.pt - 1e-6 && e.r[0] < B.stair.u + B.stair.w / 2 - 1e-6 && e.r[2] > B.stair.u - B.stair.w / 2 + 1e-6);
      if (len < per - B.stair.w - 1 || !gap) out.push(`asteca n ${n}: o parapeito de ${len.toFixed(1)} m em volta do alto de ${per.toFixed(1)} m${gap ? '' : ', fechado diante da escada'}`);
      said.push(`asteca n ${n}: lote ${F2.L} m, ${N.length} terraços de ${(2 * N[0][0]).toFixed(0)} a ${(2 * N[N.length - 1][0]).toFixed(0)} m e ${B.H} m de alto; a escada dupla de ${es.w} m (duas pistas de ${lane.toFixed(2)} m e a crista), ${tr.length} degraus de ${er.toFixed(2)} m a ${deg.toFixed(1)}°; os dois santuários com as portas de ${doors[0].w} × ${(doors[0].y1 - doors[0].y0).toFixed(1)} m, os dois braseiros; o parapeito de 0,9 m, ${len.toFixed(1)} m em volta do alto`);
      // ---- the two masses from far off: the smooth pyramid, its top a point; the terraces, each one's top flat, the shrines on
      // the last (the half width at each share of the height, a share of the foot's)
      const mE = Fo.mass(F), mA = Fo.mass(F2); const prof = (m, cu, y0, y1) => [0.25, 0.5, 0.75, 0.95].map(f => massHalf(m, cu, y0 + f * (y1 - y0)) / (massHalf(m, cu, y0 + 0.01) || 1));
      const pE = prof(mE, A.cu, pyr.y0, pyr.y1), pA = prof(mA, B.cu, 0, B.H); const diff = Math.max(...pE.map((q, k) => Math.abs(q - pA[k])));
      if (!mE.some(m => m.k === 'piramide') || mA.some(m => m.k === 'piramide') || diff < 0.3) out.push(`n ${n}: as duas massas de longe parecidas (as meias larguras ${pE.map(q => q.toFixed(2)).join('/')} e ${pA.map(q => q.toFixed(2)).join('/')})`);
      said.push(`de longe (n ${n}): a meia largura a 25/50/75/95% da altura ${pE.map(q => q.toFixed(2)).join('/')} da do pé na egípcia, ${pA.map(q => q.toFixed(2)).join('/')} na asteca`);
    }
    ok('C1 as formas das pirâmides: a Grande Pirâmide lisa (50–54°, base ≥ 36 m, a entrada, o corredor, a galeria, a câmara), o Templo Mayor (≥ 4 terraços, a escada dupla, os santuários, o parapeito), as massas', !out.length, out.slice(0, 4).join(' · ') || said.join(' · '));
  }
  // ---------------------------------------------------------------- C2 the plans
  const plans = {}; let nid = 62001;
  {
    const out = [], said = [], times = [];
    const ROOMS = { egipcio: ['esplanada', 'corredor', 'patamar', 'camara'], asteca: ['praca', 'plataforma'] };
    const USES = { egipcio: { ofertar: 2, rezar: 6 }, asteca: { acender: 2, oficiar: 2, topo: 2, assistir: 6 } };
    const TOP = { egipcio: { ofertar: 1, rezar: 2 }, asteca: { acender: 2, oficiar: 2 } };
    for (const style of ['egipcio', 'asteca']) for (const n of SIZES) for (const s of SIDES) {
      const { b, p, dt } = wonderPlan(style, n, s, (nid += 37)); times.push(dt); plans[style + n + s] = { b, p };
      if (!p || !p.ok) { out.push(`${style} n ${n}/${s}: não se arma (${p ? p.errs.slice(0, 2).join('; ') : '—'})`); continue; }
      G.S.buildings.set(b.id, b);
      const rep = In.report(b, p, { rec: b.ip }), fal = rep.filter(q => q.k === 'FALHA'), esc = rep.filter(q => q.k === 'ESCOLHA'); if (fal.length) out.push(`${style} n ${n}/${s}: ${fal.slice(0, 2).map(q => q.what).join('; ')}`);
      const lv = p.levels.map(l => l.lv).join(','); if (lv !== '0,1') out.push(`${style} n ${n}/${s}: os pisos ${lv}`);
      const fl = p.stairs.filter(q => q.kind !== 'degraus'); if (fl.length !== 1 || fl[0].lv0 !== 0 || fl[0].lv1 !== 1) out.push(`${style} n ${n}/${s}: os lances ${fl.map(q => `${q.lv0}→${q.lv1}`).join(' ') || 'nenhum'}`);
      for (const fn of ROOMS[style]) { const rs = p.rooms.filter(m => m.fn === fn); if (!rs.length || !rs.every(m => roomReached(p, m))) out.push(`${style} n ${n}/${s}: o cômodo ${fn} ${rs.length ? 'que a porta não alcança' : 'ausente'}`); }
      for (const use in USES[style]) if (marksOk(p, use) < USES[style][use]) out.push(`${style} n ${n}/${s}: ${marksOk(p, use)} lugares de ${use} (${USES[style][use]} ao menos)`);
      for (const use in TOP[style]) if (marksOk(p, use, 1) < TOP[style][use]) out.push(`${style} n ${n}/${s}: ${marksOk(p, use, 1)} lugares de ${use} no piso de cima`);
      if (s === 'S') said.push(`${style} n ${n}: ${p.rooms.length} cômodos, o lance de ${fl[0] ? `${fl[0].slope}° (${fl[0].cls})` : '—'}, ${Object.keys(USES[style]).map(u => `${marksOk(p, u)} de ${u}`).join(', ')}${esc.length ? ` (escolha: ${esc.map(q => q.what).join('; ')})` : ''}`);
    }
    const tmax = Math.max(...times), tmed = times.slice().sort((a, b) => a - b)[times.length >> 1];
    if (tmax > 400) out.push(`a planta levou ${tmax.toFixed(0)} ms (o alvo: 400)`);
    ok('C2 as plantas das pirâmides: nos quatro lados e nos dois tamanhos, sem falha, os dois pisos e o lance, os cômodos alcançados, os lugares do rito, o tempo', !out.length, out.slice(0, 4).join(' · ') || `${said.join(' · ')}; o tempo: a mediana ${tmed.toFixed(0)} ms, a maior ${tmax.toFixed(0)} (alvo 400)`);
  }
  // ---------------------------------------------------------------- C3 the form × the plan
  {
    const out = [], said = [];
    const cellsOf = (p, lv, fn) => { const N = p.grid.n, R = p.reach[lv], o = []; for (let k = 0; k < N * N; k++) if (R && R[k]) o.push([(k % N + 0.5) * CS, (Math.floor(k / N) + 0.5) * CS, k]); return o; };
    const inR = (r, x, z, d) => x > r[0] - (d || 0) && x < r[2] + (d || 0) && z > r[1] - (d || 0) && z < r[3] + (d || 0);
    // (the form's solid pieces on a floor at y — a wall, an altar, a pillar, a shrine, a brazier's stand —: what the walk keeps out of)
    const stone = (F, y) => F.els.filter(e => !e.oculto && ((e.k === 'bloco' && !e.piso && e.y0 <= y + 0.1 && e.y1 > y + 0.3) || e.k === 'colunata'));
    const inStone = (S, x, z) => S.some(e => (e.k === 'colunata' ? e.pts.some(q => Math.hypot(x - q[0], z - q[1]) < e.r) : inR(e.r, x, z)));
    for (const n of SIZES) {
      // ---- the Great Pyramid: on the ground the slab out of the pyramid's foot and the corridor in it, and the gallery's flight;
      // up the gallery the landing and the chamber but the sarcophagus; each storey at the form's height
      { const { p } = plans['egipcio' + n + 'S']; if (!p || !p.ok) continue; const F = Fo.of('maravilha', 'egipcio', n), A = F.amphi.piramide; const { cu, cv, e, cw } = A;
        const allow = { 0: (x, z) => Math.max(Math.abs(x - cu), Math.abs(z - cv)) > e || inR([cu - cw, A.vC, cu + cw, A.face], x, z) || inR(A.gallery.r, x, z),
          1: (x, z) => (inR(A.landing, x, z) || inR(A.chamber, x, z) || inR([A.doorK[0], A.doorK[2], A.doorK[1], A.doorK[3]], x, z)) && !inR(A.sarco, x, z) };
        const S0 = stone(F, A.y0), S1 = stone(F, A.yK).filter(q => q.oculto);
        for (const lv of [0, 1]) { let bad = 0, first = ''; for (const [x, z] of cellsOf(p, lv)) if (!allow[lv](x, z) || (lv === 0 && inStone(S0, x, z))) { bad++; if (!first) first = `(${x.toFixed(2)}, ${z.toFixed(2)})`; }
          if (bad) out.push(`egípcia n ${n}: ${bad} casinhas do piso ${lv} andadas fora do chão da forma (a primeira ${first})`); }
        const y0 = p.levels.find(l => l.lv === 0).y, y1 = p.levels.find(l => l.lv === 1).y; if (Math.abs(y0 - A.y0) > 1e-6 || Math.abs(y1 - A.yK) > 1e-6) out.push(`egípcia n ${n}: os pisos da planta a ${y0} e ${y1} m, os da forma a ${A.y0} e ${A.yK} m`);
        // (the corridor and the chamber walked whole, a body's half off their walls — the chamber but round the sarcophagus)
        let ic = 0, rc = 0, ik = 0, rk = 0; const N = p.grid.n;
        for (let k = 0; k < N * N; k++) { const x = (k % N + 0.5) * CS, z = (Math.floor(k / N) + 0.5) * CS;
          if (inR([cu - cw + 0.45, A.vC + 0.45, cu + cw - 0.45, A.face - 0.45], x, z)) { ic++; if (p.reach[0][k]) rc++; }
          if (inR([A.chamber[0] + 0.45, A.chamber[1] + 0.45, A.chamber[2] - 0.45, A.chamber[3] - 0.45], x, z) && !inR(A.sarco, x, z, 0.45)) { ik++; if (p.reach[1][k]) rk++; } }
        if (rc < ic || rk < ik) out.push(`egípcia n ${n}: o corredor andado em ${rc} de ${ic} casinhas, a câmara em ${rk} de ${ik}`);
        said.push(`egípcia n ${n}: andadas ${cellsOf(p, 0).length} / ${cellsOf(p, 1).length} casinhas, o corredor ${rc}/${ic}, a câmara ${rk}/${ik}, os pisos a ${y0} e ${y1} m`); }
      // ---- the Templo Mayor: on the ground the square out of the base and the stair; on the top, within its edge, out of the
      // shrines and the braziers' stands; each storey at the form's height
      { const { p } = plans['asteca' + n + 'S']; if (!p || !p.ok) continue; const F = Fo.of('maravilha', 'asteca', n), B = F.amphi.mayor; const { cu, cv, e0 } = B; const T = B.top, sw = B.stair.w;
        const S1 = stone(F, B.H);
        const allow = { 0: (x, z) => Math.max(Math.abs(x - cu), Math.abs(z - cv)) > e0 || inR([cu - sw / 2, B.stair.top, cu + sw / 2, B.stair.foot], x, z),
          1: (x, z) => inR(T, x, z) && !inStone(S1, x, z) };
        for (const lv of [0, 1]) { let bad = 0, first = ''; for (const [x, z] of cellsOf(p, lv)) if (!allow[lv](x, z)) { bad++; if (!first) first = `(${x.toFixed(2)}, ${z.toFixed(2)})`; }
          if (bad) out.push(`asteca n ${n}: ${bad} casinhas do piso ${lv} andadas fora do chão da forma (a primeira ${first})`); }
        const gy = F.els.find(e => e.k === 'bloco' && e.piso).y1, y0 = p.levels.find(l => l.lv === 0).y, y1 = p.levels.find(l => l.lv === 1).y;
        if (Math.abs(y0 - gy) > 1e-6 || Math.abs(y1 - B.H) > 1e-6) out.push(`asteca n ${n}: os pisos da planta a ${y0} e ${y1} m, os da forma a ${gy} e ${B.H} m`);
        // (the platform before the shrines walked whole, a body's half in from the parapet and off the stands)
        const bb = B.shrines.map(q => q.r).reduce((a, q) => [Math.min(a[0], q[0]), Math.min(a[1], q[1]), Math.max(a[2], q[2]), Math.max(a[3], q[3])]);
        let ip = 0, rp = 0; const N = p.grid.n;
        for (let k = 0; k < N * N; k++) { const x = (k % N + 0.5) * CS, z = (Math.floor(k / N) + 0.5) * CS;
          if (inR([T[0] + B.pt + 0.45, bb[3] + 0.45, T[2] - B.pt - 0.45, T[3] - B.pt - 0.45], x, z) && !S1.some(q => inR(q.r, x, z, 0.45))) { ip++; if (p.reach[1][k]) rp++; } }
        if (rp < ip) out.push(`asteca n ${n}: a plataforma andada em ${rp} de ${ip} casinhas`);
        said.push(`asteca n ${n}: andadas ${cellsOf(p, 0).length} / ${cellsOf(p, 1).length} casinhas, a plataforma ${rp}/${ip}, os pisos a ${y0} e ${y1} m`); }
    }
    ok('C3 a forma × a planta das pirâmides: só se anda onde a forma tem chão e na altura dela, o corredor, a câmara e a plataforma inteiros', !out.length, out.slice(0, 4).join(' · ') || said.join(' · '));
  }
  // ---------------------------------------------------------------- C4 the feet, on a blank world
  {
    const S = G.newState(7); S.H.fill(4); S.type.fill(G.T.GRASS); if (S.biome) S.biome.fill(0); S.clock = 0; S.day = 30; S.time = 0.3; G.S = S; G.newWorld();
    const TL = Sp.TILE; const out = [], said = [];
    for (const style of ['egipcio', 'asteca']) for (const n of SIZES) {
      const def = G.BDEF.maravilha; const b = { id: 92001 + n + (style === 'asteca' ? 100 : 0), type: 'maravilha', style, esc: n === 10 ? 'maravilha' : 'colossal', x: 12, y: 12, w: n, h: n, built: true, progress: 1, hp: def.hp || 100, maxHp: def.hp || 100, v: 0, set: 0, blocks: true, ip: null };
      for (const o of [...S.buildings.values()]) { for (let yy = o.y; yy < o.y + o.h; yy++) for (let xx = o.x; xx < o.x + o.w; xx++) S.occ[yy * G.N + xx] = 0; S.buildings.delete(o.id); }
      S.buildings.set(b.id, b); for (let yy = b.y; yy < b.y + b.h; yy++) for (let xx = b.x; xx < b.x + b.w; xx++) S.occ[yy * G.N + xx] = b.id;
      b.ip = In.newRecord(b, { t: 'maravilha', c: style, e: 3, k: 'ae', cl: 't', fl: 0, d: 1, w: 1, pw: 0, s: 'S', o: (1 << n) - 1, n });
      const p = Sp.planNow(b); if (!p || !p.ok) { out.push(`${style} n ${n}: sem planta (${p ? p.errs.slice(0, 2).join('; ') : '—'})`); continue; }
      const F = Fo.of('maravilha', style, n), L = n * TL, pl = Sp.plinth(b); let worst = 0, at = '', step = 0, shut = 0, shutAt = '', pts = 0, flight = 0;
      // (the legs, each on its storey, the floor the form has under each point: on a flight, the top of the tread under it — the
      // feet go up its slope, within a step under the treads' edges, never over them)
      let legs, floor, treads;
      if (style === 'egipcio') { const A = F.amphi.piramide, cu = A.cu, K = A.chamber, sv = A.sarco[3] + 0.55, fv = A.face + (A.temple ? 0.75 : 1.0), al = A.temple && A.temple.altar;
        treads = F.els.filter(e => e.oculto && e.degrau).map(e => ({ r: e.r, y1: e.y1 }));
        // (from the street — on the colossal's lot through the temple's gate and round its altar — along the face's foot and in)
        const court = al ? [[cu, al[3] + 0.6], [cu - 2.0, al[3] + 0.6], [cu - 2.0, al[1] - 0.6], [cu, al[1] - 0.6]] : [];
        legs = [[0, [[cu, L + 0.8], ...court, [cu, fv], [cu - 6, fv], [cu, fv], [cu, A.vC + 0.3]]], [0, [[cu, A.vC - 0.05], [cu, A.gallery.r[1] + 0.05]], 1],
          [1, [[cu, A.gallery.r[1] - 0.3], [cu, sv], [K[0] + 0.5, sv], [K[0] + 0.5, K[1] + 0.5]]]];
        floor = lv => (lv === 0 ? A.y0 : A.yK); }
      else { const B = F.amphi.mayor, cu = B.cu, cv = B.cv, T = B.top, e0 = B.e0, pt = B.pt; const bb = B.shrines.map(q => q.r).reduce((a, q) => [Math.min(a[0], q[0]), Math.min(a[1], q[1]), Math.max(a[2], q[2]), Math.max(a[3], q[3])]);
        treads = Fo.flight(F.els.find(e => e.k === 'escada')); const lit = Fo.uses(F).filter(u => u.uso === 'acender' && u.pe).sort((a, b) => a.c[0] - b.c[0]);
        // (on the top: before the shrines, to the left brazier's place before its stand, round the shrines behind the parapet, to
        // the right one's, before each shrine's door)
        const vl = lit[0].pe[3] + 0.5, fr = bb[3] + 0.6, l0 = T[0] + pt + 0.4, l1 = T[2] - pt - 0.4, back = T[1] + pt + 0.4, doors = B.shrines.map(q => q.door);
        legs = [[0, [[cu - 1.5, L + 0.8], [cu - 1.5, B.stair.foot + 0.3]]], [0, [[cu + B.stair.w / 2 + 1.0, L - 0.8], [cu + e0 + 2.0, L - 0.8], [cu + e0 + 2.0, cv - e0 - 2.0], [cu - e0 - 2.0, cv - e0 - 2.0], [cu - e0 - 2.0, L - 0.8]]],
          [0, [[cu - 1.5, B.stair.foot - 0.05], [cu - 1.5, B.stair.top + 0.05]], 1],
          [1, [[cu - 1.5, T[3] - 0.35], [cu - 1.5, vl], [lit[0].c[0], vl], [l0, vl], [l0, back], [l1, back], [l1, vl], [lit[1].c[0], vl], [cu + 1.5, vl], [cu + 1.5, fr], [Math.max(...doors), fr], [Math.min(...doors), fr]]]];
        floor = lv => (lv === 0 ? F.els.find(e => e.k === 'bloco' && e.piso).y1 : B.H); }
      const tread = (u, z) => { let y = null; for (const q of treads) if (u >= q.r[0] && u <= q.r[2] && z >= q.r[1] && z <= q.r[3] && (y === null || q.y1 > y)) y = q.y1; return y; };
      const rise = treads.length > 1 ? Math.abs(treads[1].y1 - treads[0].y1) : 0.3;
      for (const [lv, path, onFlight] of legs) { let prev = null;
        for (let k = 0; k < path.length - 1; k++) { const [u0, z0] = path[k], [u1, z1] = path[k + 1]; const len = Math.hypot(u1 - u0, z1 - z0), m = Math.max(1, Math.round(len / 0.02));
          for (let j = 0; j <= m; j++) { const u = u0 + (u1 - u0) * j / m, z = z0 + (z1 - z0) * j / m; const X = b.x * TL + u, Z = b.y * TL + z; const ins = Sp.indoor(X, Z, lv, b.id);
            const foot = ins ? ins.y : Math.max(Sp.footAt(X / TL, Z / TL), Sp.stepTop(X, Z)); pts++;
            if (ins && !ins.walk) { shut++; if (!shutAt) shutAt = `(${u.toFixed(2)}, ${z.toFixed(2)}) piso ${lv}`; }
            if (prev !== null) step = Math.max(step, Math.abs(foot - prev)); prev = foot;
            if (!ins || !ins.shell) continue; // (the street before the way in)
            if (onFlight) { const ty = tread(u, z); if (ty === null) continue; flight++; const d = foot - (pl.hi + ty + Sp.FLOOR_UP); if ((d > 0.03 || d < -rise - 0.03) && Math.abs(d) > Math.abs(worst)) { worst = d; at = `(${u.toFixed(2)}, ${z.toFixed(2)}) no lance`; } continue; }
            const d = foot - (pl.hi + floor(lv) + Sp.FLOOR_UP); if (Math.abs(d) > 0.03 && Math.abs(d) > Math.abs(worst)) { worst = d; at = `(${u.toFixed(2)}, ${z.toFixed(2)}) piso ${lv}`; } } } }
      if (worst || step > In.BODY.step + 0.01) out.push(`${style} n ${n}: os pés a ${worst.toFixed(2)} m da forma em ${at || '—'}, o maior degrau ${step.toFixed(2)} m`);
      if (shut) out.push(`${style} n ${n}: ${shut} pontos do caminho onde o corpo não passa (o primeiro ${shutAt})`);
      said.push(`${style} n ${n}: ${pts} pontos (${flight} no lance), o maior degrau ${step.toFixed(2)} m`);
    }
    ok('C4 os pés pelas pirâmides: da rua pela entrada e o corredor, a galeria, a câmara; pela praça, a escada dupla e o alto em volta dos santuários', !out.length, out.slice(0, 3).join(' · ') || said.join(' · '));
  }
  // ---------------------------------------------------------------- C5 the world: the god's hand in Thebes and Tenochtitlan
  const WORLD = [['egipcio', 'Tebas'], ['asteca', 'Tenochtitlan']];
  const townOf = (S, style, name) => { const all = [...S.settlements.values()].filter(s => G.Civ.idOfFac(s.fac) === style); return all.find(s => s.name === name) || all.sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0]; };
  {
    const out = [], said = [];
    M.pronto('metropole'); const S = G.S;
    const bad = what => { const q = globalThis.QA.check().filter(x => x.sev <= 2 || x.sys === 'monumental' || x.sys === 'escala'); if (q.length) out.push(`${what}: ${q.slice(0, 2).map(x => `${x.sys} S${x.sev} ${x.msg.slice(0, 90)}`).join(' · ')}`); };
    bad('antes'); const built = [];
    for (const [style, name] of WORLD) {
      const set = townOf(S, style, name); if (!set) { out.push(`sem cidade ${style}`); continue; }
      // (its people raises the wonder of its capital now, never the old one: the ladder's steps for it)
      const steps = G.Escala.choose(set, 'maravilha').map(s => s.id); if (steps.includes('antiga') || !steps.includes('maravilha')) out.push(`${set.name}: os degraus da maravilha ${steps.join(', ')}`);
      G.inSim++; let b; try { b = G.Village.handFound(set, 'maravilha', 'maravilha', { built: true, R: 60 }); } finally { G.inSim--; }
      if (!b) { out.push(`a mão do deus não achou lote de 10 casas perto de ${set.name}`); continue; }
      const p = In.plan(b), F = Fo.of(b.type, b.style, b.w);
      if (b.w !== 10 || b.h !== 10 || b.esc !== 'maravilha' || !b.built || b.style !== style) out.push(`${set.name}: o prédio ${b.w}×${b.h} esc=${b.esc} ${b.style} pronto=${b.built}`);
      if (!F || F.L !== b.w * 4 || !p || !p.ok || In.nOf(b.ip) !== b.w) out.push(`${set.name}: o lote, a forma e a planta: ${b.w * 4} m, ${F ? F.L : '—'} m, ${p && p.ok ? In.nOf(b.ip) * 4 + ' m' : 'sem planta'}`);
      const fal = p && p.ok ? In.report(b, p, { world: true, sides: true }).filter(q => q.k === 'FALHA') : []; if (fal.length) out.push(`${set.name} no mundo: ${fal.map(q => q.what).join('; ')}`);
      built.push({ b, set, sig: p && p.sig, steps });
    }
    bad('de pé'); M.viver(5); bad('vivendo');
    M.salvarCarregar(); for (const q of built) { const b2 = G.S.buildings.get(q.b.id); const p2 = b2 && In.plan(b2); if (!p2 || !p2.ok || p2.sig !== q.sig || b2.w !== 10 || b2.esc !== 'maravilha') out.push(`${q.set.name}: depois do save, outro prédio ou outra planta`); }
    bad('carregado');
    G.inSim++; try { for (const q of built) G.Village.damageBuilding(G.S.buildings.get(q.b.id), 1e6, 'quake'); } finally { G.inSim--; }
    for (const q of built) { const b3 = G.S.buildings.get(q.b.id); if (b3 && b3.type !== 'ruin') out.push(`${q.set.name}: o deus derrubou e ficou de pé`); }
    bad('derrubados'); M.viver(1); bad('as ruínas vivendo');
    if (!M.limpo()) { const e = M.erros(); out.push(`erros: ${JSON.stringify(e.mod)} ${e.console.slice(0, 2).join(' | ')}`); }
    for (const q of built) said.push(`${q.set.name}: #${q.b.id} ${q.b.w}×${q.b.h} casas a ${G.dist(q.b.x + q.b.w / 2, q.b.y + q.b.h / 2, q.set.cx, q.set.cy).toFixed(1)} casas do centro (os degraus ${q.steps.join(', ')})`);
    ok('C5 as pirâmides pela mão do deus em Tebas e em Tenochtitlan (a metrópole): de pé, vivendo, salvas e carregadas, derrubadas — o verificador limpo', !out.length, out.slice(0, 3).join(' · ') || `${said.join(' · ')}; vivas, salvas e carregadas (a mesma planta), derrubadas: o verificador limpo`);
  }
  // ---------------------------------------------------------------- C6 the checker
  {
    const out = []; M.pronto('metropole'); const got = {};
    for (const [style, name] of WORLD) { const set = townOf(G.S, style, name); G.inSim++; try { got[style] = set && G.Village.handFound(set, 'maravilha', 'maravilha', { built: true, R: 60 }); } finally { G.inSim--; } }
    const mine = () => globalThis.QA.check().filter(q => q.sys === 'monumental');
    if (!got.egipcio || !got.asteca) out.push('sem as duas maravilhas'); else if (mine().length) out.push(`com as plantas inteiras: ${mine().map(q => q.msg.slice(0, 80)).join(' · ')}`);
    // (the king's chamber a metre off the form's; the top of the Templo Mayor with no priest before the shrines)
    const plan0 = In.plan; let hit = [];
    In.plan = x => { const p = plan0(x); if (!p) return p;
      if (x === got.egipcio) return Object.assign({}, p, { levels: p.levels.map(l => (l.lv === 1 ? Object.assign({}, l, { y: l.y + 1 }) : l)) });
      if (x === got.asteca) return Object.assign({}, p, { marks: (p.marks || []).filter(M2 => M2.use !== 'oficiar') });
      return p; };
    try { hit = got.egipcio && got.asteca ? mine() : []; } finally { In.plan = plan0; }
    const k1 = hit.find(q => q.sev === 1 && q.msg.includes('câmara')), k2 = hit.find(q => q.sev === 2 && q.msg.includes('oficiar'));
    if (!k1) out.push('com a câmara noutra altura o verificador calou'); if (!k2) out.push('sem os lugares de oficiar o verificador calou');
    if (got.egipcio && got.asteca && mine().length) out.push('de volta, o verificador não calou');
    ok('C6 o verificador das pirâmides: pega a câmara noutra altura e o alto sem quem oficia, e cala quando elas voltam', !out.length, out.join(' · ') || `limpo; «${k1.msg.slice(0, 80)}»; «${k2.msg.slice(0, 80)}»; limpo de novo`);
  }
  // ---------------------------------------------------------------- C7 the places' table
  {
    const out = [], said = [];
    for (const [style, uses] of [['egipcio', ['rezar', 'ofertar']], ['asteca', ['oficiar', 'acender', 'assistir']]]) for (const n of SIZES) {
      const o = placesOf(style, n, uses);
      if (o.err) { out.push(`${style} n ${n}: ${o.err}`); continue; }
      const none = uses.filter(u => !o.free[u]); if (!o.ok || none.length) out.push(`${style} n ${n}: a tabela ${o.ok ? 'feita' : 'não feita'}${none.length ? `, sem lugar livre de ${none.join(', ')}` : ''}`);
      if (o.dt > 400) out.push(`${style} n ${n}: a tabela dos lugares levou ${o.dt.toFixed(0)} ms (o alvo: 400)`);
      said.push(`${style} n ${n}: ${o.spots} lugares em ${o.dt.toFixed(0)} ms`);
    }
    ok('C7 os lugares das pirâmides (In.places, a tabela da planta): feita a tempo, um lugar livre de cada uso do rito', !out.length, out.slice(0, 3).join(' · ') || said.join(' · '));
  }
}

const TESTS = { A: testeA, C: testeC };
const want = process.argv.slice(2).map(s => s.toUpperCase());
for (const k of Object.keys(TESTS)) if (!want.length || want.includes(k)) TESTS[k]();
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'monumental: tudo PASSOU');
process.exit(fails.length ? 1 : 0);
