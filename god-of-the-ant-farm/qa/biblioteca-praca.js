// biblioteca-praca: as plantas da biblioteca e da praça (fase E do Patch 2, P4) provadas em Node, sem mundo, sobre o código
// do jogo (M.load):
//   1. a biblioteca de cada povo pela sua forma (D-093), em todo lado: a casca pelo corpo da forma (as paredes, a base maciça,
//      a porta, as janelas, o pórtico com as colunas, os degraus da rua); as estantes de rolos (o inventário do prédio), as mesas
//      de leitura — um leitor de cada lado onde nada mais está; três leitores ao menos —, a mesa do escriba do copista; um
//      lugar livre para ler, escrever e guardar (o G.Biblioteca do P2 pergunta ao repartidor)
//   2. a praça de cada povo pela sua forma (D-093: o deus e o 3D desenham a forma, a planta põe nela a função): casca aberta, no
//      chão (Space.BASELESS); cada uso da forma uma peça da planta no retângulo da forma (marcada form) — a fonte, os bancos, a
//      pedra de falar —; os sólidos da forma, chão onde ninguém pisa; quem fala na pedra, ou no topo dos rostros (um piso, pelo
//      lance dos degraus da forma); quem ouve virado para ele, quem conversa um para o outro, todos onde o corpo fica; um lugar
//      livre de cada uso da forma
//   3. a casca de longe: a praça da forma sem peças na casca (a forma é o que se vê); a casca sozinha igual à da planta
//   4. o corpo pisa o chão livre da praça, a volta da fonte (não dentro dela) e o topo dos rostros
//   node qa/biblioteca-praca.js
const M = require('./nodemundo.js');
const G = M.load({});
const In = G.Interiors, Sp = G.Space;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | biblioteca-praca ${name} | ${info}`); if (!c) fails.push(name); };
G.S = { villagers: new Map(), buildings: new Map(), dead: new Map(), settlements: new Map(), clock: 100, day: 3, time: 0.4, avatar: null, nextId: 1000, history: [], fire: new Float32Array(G.N * G.N) };
const POVOS = ['classico', 'grego', 'romano', 'egipcio', 'asteca', 'nordico'];
const rec = (t, c, f, s) => ({ v: 4, f, r: 0, t, u: In.TYPES[t].use, s, o: 3, c, e: 3, k: 'ae', cl: c === 'egipcio' ? 'q' : 't', fl: 0, d: 1, w: 1, pw: 0, h: [], m: 0, fx: [], dr: {}, hh: 0, nm: 0, vz: 0, ab: 0 });
const strip = o => { const x = Object.assign({}, o); delete x.key; return JSON.stringify(x); };
let nid = 61001;
const made = [];
for (const t of ['biblioteca', 'praca']) for (const c of POVOS) {
  const fam = In.familiesFor(rec(t, c, '', 'S'));
  for (const f of fam.ok) for (const s of ['S', 'E', 'N', 'W']) {
    const b = { id: (nid += 41), type: t, x: 8, y: 8, w: 2, h: 2, built: true }; b.ip = rec(t, c, f, s);
    const p = In.makeFam(b, b.ip, f); G.S.buildings.set(b.id, b); made.push({ t, c, s, f, b, p, so: In.shellOf(b), nfam: fam.ok.length });
  }
}
const free = (m, uses) => uses.filter(u => !In.freePlace(m.b, u));
// ---------------------------------------------------------------- 1. the library
{
  const L = made.filter(m => m.t === 'biblioteca'); const bad = L.filter(m => !m.p.ok);
  const per = POVOS.map(c => `${c} ${(L.find(m => m.c === c) || { nfam: 0 }).nfam}`).join(', ');
  ok('1a a biblioteca se arma em todo povo e lado, pela forma', L.length && !bad.length && POVOS.every(c => L.some(m => m.c === c)), `${L.length - bad.length} de ${L.length} plantas; famílias por povo: ${per}${bad.length ? '; ' + bad.slice(0, 2).map(m => `${m.c} ${m.f}: ${m.p.errs.slice(0, 2).join(' | ')}`).join(' / ') : ''}`);
  // (two tables at least, each with a reader at least — a reader on either side where nothing else stands —, three readers in all)
  const short = L.filter(m => m.p.ok).map(m => { const n = k => m.p.items.filter(i => i.kind === k).length; const T = m.p.items.filter(i => i.kind === 'mesa-leitura'); const rd = T.map(i => i.spots.filter(q => q.use === 'ler').length); return n('estante') >= 2 && T.length >= 2 && n('mesa-escriba') >= 1 && rd.every(x => x >= 1) && rd.reduce((a, x) => a + x, 0) >= 3 ? null : `${m.c} ${m.f}: estantes ${n('estante')}, mesas ${T.length} (leitores ${rd.join('+')}), escriba ${n('mesa-escriba')}`; }).filter(Boolean);
  const miss = L.filter(m => m.p.ok).map(m => { const x = free(m, ['ler', 'escrever', 'guardar']); return x.length ? `${m.c} ${m.s}: sem ${x.join(', ')}` : null; }).filter(Boolean);
  ok('1b as estantes, as mesas de leitura (três leitores ao menos) e a mesa do escriba; um lugar livre para ler, escrever e guardar', !short.length && !miss.length, short.concat(miss).slice(0, 3).join(' / ') || `${L.length} plantas`);
  // (the shell from the form's body, D-093: the walls at the form's foot, the floor on the solid base at the form's height, the
  // door where the form has it, a window for each of its panes, the porch an annex with the form's columns — the way in
  // through the gap nearest the door —, the form's steps from the street; the hall reached from the street)
  const body = [];
  for (const m of L.filter(q => q.p.ok)) {
    const p = m.p; const B = G.Forma.body(G.Forma.of('biblioteca', m.c)); const Lw = p.lot.w; const R = r => { const a = In.toLoc(m.s, Lw, r[0], r[1]), b = In.toLoc(m.s, Lw, r[2], r[3]); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
    const same = (a, b) => a.every((x, k) => Math.abs(x - b[k]) < 0.02); const why = [];
    if (!same(p.shell.r, R(B.r))) why.push('as paredes fora do pé da forma');
    if (p.shell.base !== 'macica' || Math.abs(p.shell.baseH - B.y0) > 0.01 || Math.abs(p.levels[0].y - B.y0) > 0.01) why.push(`o piso a ${p.levels[0].y} (a forma ${B.y0})`);
    const wins = p.holes.filter(h => h.kind === 'janela').length; if (wins !== B.janelas.length) why.push(`${wins} janelas (a forma ${B.janelas.length})`);
    if (B.portico) { const an = (p.shell.annex || [])[0]; const col = p.walls.find(w => w.kind === 'colunata'); if (!an || !same(an.r, R(B.portico.r)) || !col || p.doors.filter(d => d.wall === col.id).length !== B.portico.colunas.length - 1) why.push('o pórtico ou as colunas fora da forma'); }
    const st = p.stairs.find(q => q.kind === 'degraus'); if (B.degraus.length && !st) why.push('sem os degraus da forma');
    const e = p.entrance; const g = p.reach && p.reach[0]; const hall = p.rooms.find(q => q.fn === 'salao'); const n = p.grid.n, cs = p.grid.cs; let got = 0;
    if (g && hall) for (let z = 0; z < n && !got; z++) for (let x = 0; x < n; x++) if (g[z * n + x] && (x + 0.5) * cs > hall.r[0] && (x + 0.5) * cs < hall.r[2] && (z + 0.5) * cs > hall.r[1] && (z + 0.5) * cs < hall.r[3]) { got = 1; break; }
    if (!e || !got) why.push('o salão que a rua não alcança');
    if (why.length) body.push(`${m.c} ${m.s}: ${why.join(', ')}`);
  }
  ok('1c a casca pelo corpo da forma (D-093): as paredes, a base maciça, a porta, as janelas, o pórtico e as colunas, os degraus; da rua ao salão', L.length && !body.length, body.slice(0, 3).join(' / ') || `${L.length} plantas nos seis povos`);
}
// ---------------------------------------------------------------- 2. the square, by its form (D-093)
{
  const Q = made.filter(m => m.t === 'praca'); const bad = Q.filter(m => !m.p.ok);
  ok('2a a praça se arma em todo povo e lado: casca aberta, no chão', Q.length && !bad.length && Q.every(m => !m.p.ok || (m.p.shell.kind === 'aberta' && !m.p.shell.roof)) && Sp.baseless({ type: 'praca' }), `${Q.length - bad.length} de ${Q.length} plantas${bad.length ? '; ' + bad[0].c + ': ' + bad[0].p.errs.slice(0, 2).join(' | ') : ''}`);
  // (each use of the form a piece of the plan at the form's own rectangle — turned with the lot —, marked form; the speaker on
  // the stone or, where it is higher than a step, on the rostra's top, a storey reached by the form's treads; who listens faces
  // the speaker, who talks faces the other of the pair, all where a body stands; a place free of each use the form has)
  const out = [];
  for (const m of Q.filter(q => q.p.ok)) {
    const p = m.p; const F = G.Forma.of('praca', m.c); const U = G.Forma.uses(F); const L = p.lot.w;
    const at = r => { const a = In.toLoc(m.s, L, r[0], r[1]), b = In.toLoc(m.s, L, r[2], r[3]); return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; };
    for (const u of U) {
      if (u.uso === 'tribuna' && u.y1 > In.BODY.up) { const M2 = (p.marks || []).find(q => q.use === 'falar' && q.lv === 1); const st = p.stairs.find(q => q.lv0 === 0 && q.lv1 === 1); if (!M2 || !M2.pts.some(q => q.ok) || !st || !p.levels.some(l => l.lv === 1 && Math.abs(l.y - u.y1) < 0.01)) out.push(`${m.c} ${m.s}: os rostros sem o topo, o lance ou quem fala nele`); continue; }
      const c = at(u.r); const it = p.items.find(i => i.kind === u.uso && i.form && Math.hypot(i.x - c[0], i.z - c[1]) < 0.02);
      if (!it) out.push(`${m.c} ${m.s}: ${u.uso} da forma fora do lugar dela (${c.map(x => x.toFixed(2)).join(',')})`);
    }
    const solid = G.Forma.solids(F).length; if (solid && !p.items.some(i => i.kind === 'solido' && i.form)) out.push(`${m.c} ${m.s}: os sólidos da forma fora da planta`);
    const sp = (p.items.find(i => i.kind === 'tribuna') || { spots: [] }).spots.find(q => q.use === 'falar') || ((p.marks || []).find(q => q.use === 'falar') || { pts: [] }).pts[0];
    const ouvir = (p.marks || []).find(q => q.use === 'ouvir'), conv = (p.marks || []).find(q => q.use === 'conversar');
    if (!sp || !ouvir || !conv) { out.push(`${m.c} ${m.s}: sem quem fala, quem ouve ou quem conversa`); continue; }
    const face = (q, x, z) => { const a = Math.atan2(x - q.x, z - q.z); return Math.abs(Math.atan2(Math.sin(a - q.ry), Math.cos(a - q.ry))) < 0.2; };
    if (!ouvir.pts.every(q => q.ok && face(q, sp.x, sp.z))) out.push(`${m.c} ${m.s}: quem ouve não olha quem fala`);
    for (let k = 0; k < conv.pts.length; k += 2) { const a = conv.pts[k], c = conv.pts[k + 1]; if (!a.ok || !c.ok || !face(a, c.x, c.z) || !face(c, a.x, a.z)) { out.push(`${m.c} ${m.s}: um par que não se olha`); break; } }
    const want = ['falar', 'ouvir', 'conversar'].concat(U.some(u => u.uso === 'fonte') ? ['beber'] : [], U.some(u => u.uso === 'banco') ? ['sentar'] : []);
    const x = free(m, want); if (x.length) out.push(`${m.c} ${m.s}: sem ${x.join(', ')}`);
  }
  ok('2b as peças da forma onde a forma as tem; quem fala, quem ouve virado para ele, quem conversa um para o outro; um lugar livre de cada uso', !out.length, out.slice(0, 3).join(' / ') || `${Q.length} plantas`);
}
// ---------------------------------------------------------------- 3. the shell seen from afar
{
  // (a square with a form: nothing of it in the shell — the form is what is seen, its pieces drawn by it —; and the shell asked
  // alone the plan's whole one)
  const Q = made.filter(m => m.t === 'praca' && m.p.ok); const all = made.filter(m => m.p.ok);
  const diff = all.filter(m => !m.so || strip(m.so) !== strip(In.shellOfPlan(m.p)));
  const pieces = Q.filter(m => m.so.yard && m.so.yard.length);
  ok('3a a casca de longe: a praça da forma sem peças na casca; a casca sozinha igual à da planta', !diff.length && !pieces.length, `${diff.length} cascas diferentes da planta (de ${all.length}); ${pieces.length} praças com peças na casca`);
}
// ---------------------------------------------------------------- 4. the body on the square
{
  // (on the free floor of the square; by the fountain where the form has one, not in it; on the rostra's top, a storey of its own)
  const out = [];
  for (const m of made.filter(q => q.t === 'praca' && q.p.ok && q.s === 'S')) {
    const p = m.p; const fo = p.items.find(i => i.kind === 'fonte'); const conv = (p.marks || []).find(q => q.use === 'conversar'); const q0 = conv && conv.pts.find(q => q.ok);
    if (!q0 || !Sp.inBody(p.shell, 0, q0.x, q0.z) || !In.standsAt(p, 0, q0.x, q0.z, 0.25)) out.push(`${m.c}: o corpo não fica no chão livre`);
    if (fo) { const c = [(fo.r[0] + fo.r[2]) / 2, (fo.r[1] + fo.r[3]) / 2]; const sp = fo.spots.find(q => q.use === 'beber' && q.ok); if (!sp || !In.standsAt(p, 0, sp.x, sp.z, 0.25) || In.standsAt(p, 0, c[0], c[1], 0.25)) out.push(`${m.c}: o corpo junto da fonte ${sp ? 'não' : 'sem lugar'}, ou dentro dela`); }
    const top = (p.marks || []).find(q => q.use === 'falar' && q.lv === 1); if (top && !top.pts.some(q => q.ok && In.standsAt(p, 1, q.x, q.z, 0.25))) out.push(`${m.c}: o corpo não fica no topo dos rostros`);
  }
  ok('4a o corpo pisa a praça, a volta da fonte e o topo dos rostros, não dentro da fonte', !out.length, out.slice(0, 3).join(' / ') || 'nos seis povos');
}
// ---------------------------------------------------------------- 5. the feet up the library's steps, on a blank world
// (from the street along the way in, every 2 cm: the feet — Space.indoor — on what the form is there, as the god and the 3D
// draw it — to 2.5 cm: the plan keeps its heights to the centimetre, and the landing before the flight's foot lies 2 cm over the
// street —: the street, the top of each of its treads, the porch or the plinth before the door, the hall's floor; never a crack
// to the ground — the Nordic hall's 0.2 m of plinth between its steps and its door —, never a step the body does not take;
// the plan's frame on the ground the form stands on — Space.onForm: no plinth of 0.4 under it, D-093, the P3's probe)
{
  const S = G.newState(7); S.H.fill(4); S.type.fill(G.T.GRASS); if (S.biome) S.biome.fill(0); S.clock = 0; S.day = 30; S.time = 0.3; G.S = S; G.newWorld();
  const TL = Sp.TILE, out = [], sum = []; let nid2 = 71001;
  for (const c of POVOS) {
    const def = G.BDEF.biblioteca; const b = { id: (nid2 += 7), type: 'biblioteca', style: c, x: 20, y: 20, w: def.w, h: def.h, built: true, progress: 1, hp: 100, maxHp: 100, v: 0, set: 0, blocks: !!def.blocks, ip: null };
    S.buildings.set(b.id, b); if (def.blocks) for (let yy = b.y; yy < b.y + b.h; yy++) for (let xx = b.x; xx < b.x + b.w; xx++) S.occ[yy * G.N + xx] = b.id;
    b.ip = In.newRecord(b, { t: 'biblioteca', c, e: 3, k: 'ae', cl: 't', fl: 0, d: 1, w: 1, pw: 0, s: 'S', o: (1 << b.w) - 1 });
    const p = Sp.planNow(b); const B = G.Forma.body(G.Forma.of('biblioteca', c)); if (!p || !B) { out.push(`${c}: sem planta ou sem corpo`); continue; }
    const pl = Sp.plinth(b); const L = b.h * TL; const u = p.entrance.x;
    // (what the form is at a point of the lot — the side S: the plan's frame —, over the ground it stands on, and its edges)
    const inR = (r, x, z) => x >= r[0] && x <= r[2] && z >= r[1] && z <= r[3];
    const top = (x, z) => { let t = 0; for (const q of B.degraus) if (inR(q.r, x, z)) t = Math.max(t, q.y1); if (B.base && inR(B.base.r, x, z)) t = Math.max(t, B.base.h); if ((B.portico && inR(B.portico.r, x, z)) || inR(B.r, x, z)) t = Math.max(t, B.y0); return t; };
    const edges = [].concat(B.degraus.map(q => q.r), B.base ? [B.base.r] : [], B.portico ? [B.portico.r] : [], [B.r]).flatMap(r => [r[1], r[3]]);
    const end = B.portico ? B.r[3] + 0.05 : B.r[3] - 0.6; let worst = 0, at = 0, step = 0, fell = 0, prev = null, n = 0;
    for (let z = L + 1.0; z >= end; z -= 0.02) {
      const X = b.x * TL + u, Z = b.y * TL + z; const ins = Sp.indoor(X, Z, 0, b.id); const foot = ins ? ins.y : Sp.footAt(X / TL, Z / TL);
      if (prev !== null) step = Math.max(step, Math.abs(foot - prev)); prev = foot;
      if (edges.some(e => Math.abs(z - e) < 0.03)) continue; n++;
      // (the form stands on the highest of its ground, as the god draws it)
      const want = pl.hi + top(u, z) + (z < L ? Sp.FLOOR_UP : 0); const d = foot - want; if (Math.abs(d) > Math.abs(worst)) { worst = d; at = z; }
      if (d < -0.05) fell++;
    }
    sum.push(`${c} ${worst >= 0 ? '+' : ''}${worst.toFixed(3)}`);
    if (Math.abs(worst) > 0.025 || fell || step > In.BODY.step + 0.01 || Math.abs(pl.y0 - pl.hi) > 1e-9) out.push(`${c}: os pés a ${worst.toFixed(2)} m da forma em v ${at.toFixed(2)}, ${fell} pontos abaixo dela, o maior degrau ${step.toFixed(2)} m, o quadro a ${(pl.y0 - pl.hi).toFixed(2)} m do chão (${n} pontos)`);
  }
  ok('5a os pés sobem a biblioteca pelo que a forma é, da rua ao salão', !out.length, out.slice(0, 3).join(' / ') || `nos seis povos, a cada 2 cm (a maior diferença por povo: ${sum.join(', ')}); o maior degrau no caminho, o de um dos degraus da forma`);
}
const err = M.erros(); if (Object.keys(err.mod).length || err.console.length) ok('sem erros de módulo', false, JSON.stringify(err).slice(0, 300));
console.log(fails.length ? `FALHAS: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
