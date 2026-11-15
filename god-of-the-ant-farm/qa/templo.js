// templo: o templo de cada povo pela sua forma (D-093, Patch 2: a forma é do P3, o chão dela, a base, os lances, os lugares de
// uso e o corpo dentro são do P4 — os dois conferem aqui, como na biblioteca-praca), em Node, sem mundo, sobre o código do jogo:
//   1. o templo se arma em todo povo e lado pela família da forma (forma.templo), a que o tipo prefere
//   2. a casca pelo corpo da forma: as paredes no pé dela, o piso na altura dela — sobre a base maciça, ou no chão —, a porta, as
//      janelas; o pórtico (o romano) e o peristilo (o grego, o clássico; a galeria do nórdico) com cada coluna onde a forma a tem e
//      a rua entrando pelo vão do meio; o pátio e o pilone do egípcio (a porta da rua no portão, o pátio aberto, as torres, os
//      batentes e as colunas sólidos da forma); a plataforma do asteca (o topo da base, a borda onde o lance chega a porta da
//      rua); o lance da forma com os degraus dela; da rua à cela; e o corpo (0,32 m, In.walk) da porta da rua ao altar, ponto
//      a ponto — nunca por uma fresta que a caminhada das casas da grade passa e um corpo não (o batente de um portão e uma
//      coluna diante dele)
//   3. o que o templo é: a imagem do deus; o altar, com o lugar de quem oficia e o de quem oferta; dois lugares dos fiéis ao
//      menos (bancos, esteiras, ou de pé diante da porta); o cofre; os braseiros da forma no chão da planta, com o lugar de quem
//      os acende virado para eles; um lugar livre de oficiar e de guardar
//   4. a casca de longe igual à da planta
//   5. num mundo em branco: os pés da rua à cela a cada 2 cm, no que a forma é ali — a rua, cada degrau do lance, os degraus da
//      base, o estilóbata, o pódio, o pátio, a plataforma, o piso —, nunca um degrau que o corpo não sobe, nunca uma queda, o
//      quadro da planta no chão da forma (Space.onForm pela família do registro); e um registro de antes, de um salão, vira o
//      da forma ao abrir (In.migrate), onde ela se arma
//   node qa/templo.js
const M = require('./nodemundo.js');
const G = M.load({});
const In = G.Interiors, Sp = G.Space;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | templo ${name} | ${info}`); if (!c) fails.push(name); };
G.S = { villagers: new Map(), buildings: new Map(), dead: new Map(), settlements: new Map(), clock: 100, day: 3, time: 0.4, avatar: null, nextId: 1000, history: [], fire: new Float32Array(G.N * G.N) };
const POVOS = ['grego', 'classico', 'romano', 'egipcio', 'asteca', 'nordico'];
const rec = (c, f, s) => ({ v: In.REC_V, f, r: 0, t: 'temple', u: In.TYPES.temple.use, s, o: 3, c, e: 3, k: 'ae', cl: c === 'egipcio' ? 'q' : 't', fl: 0, d: 1, w: 1, pw: 0, h: [], m: 0, fx: [], dr: {}, hh: 0, nm: 0, vz: 0, ab: 0 });
const strip = o => { const x = Object.assign({}, o); delete x.key; return JSON.stringify(x); };
const FAM = 'forma.templo';
let nid = 91001; const made = []; const offer = {};
for (const c of POVOS) {
  const fam = In.familiesFor(rec(c, '', 'S')); const pref = In.TYPES.temple.prefer ? In.TYPES.temple.prefer(rec(c, '', 'S'), fam.ok) : fam.ok;
  offer[c] = { ok: fam.ok.includes(FAM), pref: pref[0], why: fam.why && fam.why[FAM] };
  for (const s of ['S', 'E', 'N', 'W']) {
    const b = { id: (nid += 41), type: 'temple', x: 8, y: 8, w: 2, h: 2, built: true }; b.ip = rec(c, FAM, s);
    const p = In.makeFam(b, b.ip, FAM); G.S.buildings.set(b.id, b); made.push({ c, s, b, p, so: In.shellOf(b) });
  }
}
const body = c => G.Forma.body(G.Forma.of('temple', c));
// ---------------------------------------------------------------- 1. by the form, everywhere
{
  const bad = made.filter(m => !m.p.ok); const no = POVOS.filter(c => !offer[c].ok || offer[c].pref !== FAM);
  ok('1a o templo se arma em todo povo e lado pela família da forma, a que o tipo prefere', !bad.length && !no.length,
    `${made.length - bad.length} de ${made.length} plantas${no.length ? '; sem a forma: ' + no.map(c => `${c} (${offer[c].why || 'não preferida: ' + offer[c].pref})`).join(', ') : ''}${bad.length ? '; ' + bad.slice(0, 3).map(m => `${m.c} ${m.s}: ${m.p.errs.slice(0, 2).join(' | ')}`).join(' / ') : ''}`);
}
// ---------------------------------------------------------------- 2. the shell by the form's body
{
  const out = [];
  for (const m of made.filter(q => q.p.ok)) {
    const p = m.p, B = body(m.c), Lw = p.lot.w; const R = r => { const a = In.toLoc(m.s, Lw, r[0], r[1]), b = In.toLoc(m.s, Lw, r[2], r[3]); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
    const same = (a, b) => !!a && !!b && a.every((x, k) => Math.abs(x - b[k]) < 0.02); const why = [];
    if (!same(p.shell.r, R(B.r))) why.push('as paredes fora do pé da forma');
    if (p.shell.base !== (B.y0 > 0.05 ? 'macica' : 'pedra') || Math.abs(p.levels[0].y - B.y0) > 0.01) why.push(`o piso a ${p.levels[0].y} sobre ${p.shell.base} (a forma ${B.y0.toFixed(2)})`);
    const wins = p.holes.filter(h => h.kind === 'janela').length; if (wins !== B.janelas.length) why.push(`${wins} janelas (a forma ${B.janelas.length})`);
    // (each colonnade of the plan: its bays between columns where the form stands them — as many as the form's rows have gaps)
    const cols = p.walls.filter(w => w.kind === 'colunata'); const bays = cols.reduce((a, w) => a + p.doors.filter(d => d.wall === w.id).length, 0);
    const near = (a, b) => Math.abs(a - b) < 0.05;
    const rowsOf = cs => { const v1 = Math.max(...cs.map(q => q.c[1])), v0 = Math.min(...cs.map(q => q.c[1])), u0 = Math.min(...cs.map(q => q.c[0])), u1 = Math.max(...cs.map(q => q.c[0]));
      return [cs.filter(q => near(q.c[1], v1)), cs.filter(q => near(q.c[1], v0)), cs.filter(q => near(q.c[0], u0)), cs.filter(q => near(q.c[0], u1))].filter(r => r.length >= 2); };
    const want = B.portico ? B.portico.colunas.length - 1 : B.peristilo ? rowsOf(B.peristilo.colunas).reduce((a, r) => a + r.length - 1, 0) : 0;
    if (bays !== want) why.push(`${bays} vãos de colunata (a forma ${want})`);
    if (B.portico && !(p.shell.annex || []).some(a => same(a.r, R(B.portico.r)))) why.push('o pórtico fora da forma');
    if (B.peristilo && (p.shell.annex || []).filter(a => a.fn === 'peristilo').length !== 4) why.push('o peristilo sem as quatro faixas');
    // (the street's door: the gate of the pylon, the edge of the platform where the steps come up, the bay before the steps, the
    // door of the walls; a door to the street, and only one)
    const e = p.entrance; const ed = e && p.doors[e.door]; const rua = p.doors.filter(d => d.rooms.includes('rua'));
    // (the gate an opening always open, as the form draws it — no leaf —, at its face, the edge of the passage under its
    // lintel, an annex: the court the yard)
    const gp = B.portao ? In.toLoc(m.s, Lw, B.portao.u, B.portao.v) : null; const pas = (p.shell.annex || []).find(a => a.fn === 'passagem');
    if (!ed || !ed.rooms.includes('rua') || rua.length !== 1) why.push(`a porta da rua (${rua.length})`);
    else if (gp && (ed.kind !== 'vao' || Math.hypot(e.x - gp[0], e.z - gp[1]) > 0.05)) why.push('a rua não entra pelo portão do pilone, aberto');
    else if (gp && (!p.shell.yard || !pas || !(gp[0] > pas.r[0] - 0.02 && gp[0] < pas.r[2] + 0.02 && gp[1] > pas.r[1] - 0.02 && gp[1] < pas.r[3] + 0.02))) why.push('o pátio do pilone sem o terreiro, ou a passagem sem o anexo até o portão');
    const tiers = B.base && B.base.degraus; const plat = tiers && tiers.length && !B.portico && !B.peristilo && !B.portao ? tiers[tiers.length - 1] : null;
    if (plat && plat.r[3] - B.r[3] > 0.3 && (!p.shell.yard || !same(p.shell.yard.r, R(plat.r)) || p.walls[ed.wall].kind !== 'borda')) why.push('a plataforma do topo, ou a borda onde o lance chega');
    const st = p.stairs.find(q => q.kind === 'degraus'); if (B.degraus.length && (!st || !st.treads || st.treads.length < B.degraus.length)) why.push('sem os degraus da forma');
    // (the cella reached from the street, on the walk from the door)
    const g = p.reach && p.reach[0]; const cella = p.rooms.find(q => q.fn === 'nave'); const n = p.grid.n, cs = p.grid.cs; let got = 0;
    if (g && cella) for (let z = 0; z < n && !got; z++) for (let x = 0; x < n; x++) if (g[z * n + x] && (x + 0.5) * cs > cella.r[0] && (x + 0.5) * cs < cella.r[2] && (z + 0.5) * cs > cella.r[1] && (z + 0.5) * cs < cella.r[3]) { got = 1; break; }
    if (!got) why.push('a cela que a rua não alcança');
    if (why.length) out.push(`${m.c} ${m.s}: ${why.join(', ')}`);
  }
  ok('2a a casca pelo corpo da forma: paredes, piso, porta, janelas; o pórtico, o peristilo, o pátio do pilone, a plataforma; o lance; da rua à cela', made.some(m => m.p.ok) && !out.length, out.slice(0, 3).join(' / ') || `${made.filter(m => m.p.ok).length} plantas nos seis povos`);
  // (and the body by the plan's own rule — In.walk, a circle of 0.32 m —, from just inside the street's door to where one offers
  // at the altar, by points 5 cm apart: never through a gap the walk of cells goes by and a body does not — between the jamb of
  // a gate and a column before it)
  const stuck = [];
  for (const m of made.filter(q => q.p.ok && q.s === 'S')) {
    const p = m.p, b = m.b; const st = 0.05, nn = Math.round(p.lot.w / st); const e = p.entrance; const seen = new Uint8Array(nn * nn); const q = [];
    const go = (i, j) => { if (i < 0 || j < 0 || i >= nn || j >= nn || seen[j * nn + i]) return; const x = (i + 0.5) * st, z = (j + 0.5) * st; seen[j * nn + i] = 1; if (In.walk(b, 0, x, z, In.BODY.r) && Sp.inBody(p.shell, 0, x, z)) q.push(i, j); else seen[j * nn + i] = 2; };
    for (let j = 0; j < nn; j++) for (let i = 0; i < nn; i++) if (Math.hypot((i + 0.5) * st - e.x, (j + 0.5) * st - e.z) <= 1.0) go(i, j);
    for (let k = 0; k < q.length; k += 2) { const i = q[k], j = q[k + 1]; go(i + 1, j); go(i - 1, j); go(i, j + 1); go(i, j - 1); }
    const al = p.items.find(i => i.kind === 'altar'); const sp = al && al.spots.find(x => x.use === 'ofertar' && x.ok);
    const got = sp && q.some((x, k) => k % 2 === 0 && Math.hypot((x + 0.5) * st - sp.x, (q[k + 1] + 0.5) * st - sp.z) < 0.1);
    if (!got) stuck.push(`${m.c}: o corpo não vai da porta ${e.x.toFixed(2)},${e.z.toFixed(2)} ao altar ${sp ? sp.x.toFixed(2) + ',' + sp.z.toFixed(2) : '(sem lugar)'} (${q.length / 2} pontos alcançados)`);
  }
  ok('2b o corpo (0,32 m, a regra da planta) vai da porta da rua ao altar, ponto a ponto', !stuck.length, stuck.slice(0, 3).join(' / ') || `${made.filter(m => m.p.ok && m.s === 'S').length} templos`);
}
// ---------------------------------------------------------------- 3. what a temple is
{
  const out = []; const lit = [];
  for (const m of made.filter(q => q.p.ok)) {
    const p = m.p; const n = k => p.items.filter(i => i.kind === k).length; const why = [];
    const al = p.items.find(i => i.kind === 'altar'); const sp = u => !!al && al.spots.some(q => q.use === u && q.ok);
    if (n('idolo') !== 1) why.push(`${n('idolo')} imagens`);
    if (!al || !sp('oficiar') || !sp('ofertar')) why.push('o altar sem quem oficia ou quem oferta');
    const pray = (p.marks || []).filter(q => q.use === 'rezar').reduce((a, q) => a + q.pts.filter(x => x.ok).length, 0);
    const faith = n('banco-fieis') + n('esteira-oracao') + pray; if (faith < 2) why.push(`${faith} lugares dos fiéis`);
    if (n('cofre') < 1) why.push('sem o cofre');
    // (the form's braziers on the plan's floor: a solid of the form there, and where one stands to light it, facing it)
    const F = G.Forma.of('temple', m.c); const Lw = p.lot.w; const inRoom = c => p.rooms.some(q => c[0] > q.r[0] && c[0] < q.r[2] && c[1] > q.r[1] && c[1] < q.r[3]);
    for (const u of G.Forma.uses(F).filter(q => q.uso === 'acender')) {
      const c = In.toLoc(m.s, Lw, u.c[0], u.c[1]); if (!inRoom(c)) { if (m.s === 'S') lit.push(`${m.c}: um braseiro fora do chão da planta (na rua)`); continue; }
      const mk = (p.marks || []).find(q => q.use === 'acender' && q.pts.some(x => x.ok && Math.hypot(x.x - c[0], x.z - c[1]) < u.rad + 1.2));
      const face = mk && mk.pts.some(x => { const a = Math.atan2(c[0] - x.x, c[1] - x.z); return Math.abs(Math.atan2(Math.sin(a - x.ry), Math.cos(a - x.ry))) < 0.5; });
      const so = p.items.some(i => i.kind === 'solido' && i.form && Math.hypot(i.x - c[0], i.z - c[1]) < 0.05);
      if (!mk || !face || !so) why.push('um braseiro da forma sem o lugar de acender, ou sem o sólido');
      else if (m.s === 'S') lit.push(`${m.c}: um braseiro aceso do chão da planta`);
    }
    const free = ['oficiar', 'guardar'].filter(u => !In.freePlace(m.b, u)); if (free.length) why.push(`sem lugar livre de ${free.join(', ')}`);
    if (why.length) out.push(`${m.c} ${m.s}: ${why.join(', ')}`);
  }
  ok('3a a imagem, o altar (quem oficia, quem oferta), dois lugares dos fiéis ao menos, o cofre; os braseiros da forma no chão da planta, com o lugar de acendê-los', made.some(m => m.p.ok) && !out.length, (out.slice(0, 3).join(' / ') || `${made.filter(m => m.p.ok).length} plantas`) + (lit.length ? `; ${lit.join(', ')}` : ''));
}
// ---------------------------------------------------------------- 4. the shell from afar; an old record; the plinth
{
  const all = made.filter(m => m.p.ok); const diff = all.filter(m => !m.so || strip(m.so) !== strip(In.shellOfPlan(m.p)));
  ok('4a a casca de longe igual à da planta', all.length && !diff.length, `${diff.length} cascas diferentes da planta (de ${all.length})${diff.length ? ': ' + diff.slice(0, 3).map(m => m.c + ' ' + m.s).join(', ') : ''}`);
}
// ---------------------------------------------------------------- 5. the feet up the temple, on a blank world
// (from the street along the way in, every 2 cm: the feet — Space.indoor — on what the form is there, as the god and the 3D draw
// it — to 2.5 cm: the plan keeps its heights to the centimetre, and the landing before the flight's foot lies 2 cm over the
// street —: never a step the body does not take, never a fall; the plan's frame on the ground the form stands on — Space.onForm,
// by the record's family. And an old record — a hall's, of the version before — brought to the form's family on opening)
{
  const S = G.newState(7); S.H.fill(4); S.type.fill(G.T.GRASS); if (S.biome) S.biome.fill(0); S.clock = 0; S.day = 30; S.time = 0.3; G.S = S; G.newWorld();
  const TL = Sp.TILE, out = [], sum = []; let nid2 = 93001; const old = [];
  const put = (c, x, y) => { const def = G.BDEF.temple; const b = { id: (nid2 += 7), type: 'temple', style: c, x, y, w: def.w, h: def.h, built: true, progress: 1, hp: 100, maxHp: 100, v: 0, set: 0, blocks: !!def.blocks, ip: null };
    S.buildings.set(b.id, b); if (def.blocks) for (let yy = b.y; yy < b.y + b.h; yy++) for (let xx = b.x; xx < b.x + b.w; xx++) S.occ[yy * G.N + xx] = b.id; return b; };
  let col = 0;
  for (const c of POVOS) {
    const b = put(c, 12 + 6 * col++, 20); b.ip = In.newRecord(b, { t: 'temple', c, e: 3, k: 'ae', cl: c === 'egipcio' ? 'q' : 't', fl: 0, d: 1, w: 1, pw: 0, s: 'S', o: (1 << b.w) - 1 });
    if (b.ip.f !== FAM) { out.push(`${c}: o registro novo com ${b.ip.f}`); continue; }
    const p = Sp.planNow(b); const B = body(c); if (!p || !p.ok || !B) { out.push(`${c}: sem planta ou sem corpo`); continue; }
    const pl = Sp.plinth(b); const L = b.h * TL; const u = p.entrance.x;
    // (what the form is at a point of the lot — the side S: the plan's frame —, over the ground it stands on: the lance's treads
    // where it is cut into the base; else the base's steps — the tiers of a stepped one —, the base, the floor of the walls,
    // of the porch, of the peristyle; the court of the pylon and the ground before it, the street's)
    const inR = (r, x, z) => x >= r[0] && x <= r[2] && z >= r[1] && z <= r[3];
    const top = (x, z) => { let tr = -1; for (const q of B.degraus) if (inR(q.r, x, z)) tr = Math.max(tr, q.y1); if (tr >= 0) return tr;
      let t = 0; const tiers = B.base && B.base.degraus;
      if (B.base) { if (tiers && tiers.length) { for (const q of tiers) if (inR(q.r, x, z)) t = Math.max(t, q.y1); } else if (inR(B.base.r, x, z)) t = Math.max(t, B.base.h); }
      for (const r of [B.r, B.portico && B.portico.r, B.peristilo && B.peristilo.r]) if (r && inR(r, x, z)) t = Math.max(t, B.y0);
      return t; };
    const edges = [].concat(B.degraus.map(q => q.r), B.base ? [B.base.r].concat((B.base.degraus || []).map(q => q.r)) : [], B.portico ? [B.portico.r] : [], B.peristilo ? [B.peristilo.r] : [], B.portao ? [B.portao.r] : [], B.patio ? [B.patio.r] : [], [B.r]).flatMap(r => [r[1], r[3]]);
    let worst = 0, at = 0, step = 0, fell = 0, prev = null, n = 0, stop = null;
    for (let z = L + 1.0; z >= B.r[3] - 0.6; z -= 0.02) {
      const X = b.x * TL + u, Z = b.y * TL + z; const ins = Sp.indoor(X, Z, 0, b.id); const foot = ins ? ins.y : Sp.footAt(X / TL, Z / TL);
      if (prev !== null) step = Math.max(step, Math.abs(foot - prev)); prev = foot;
      // (and ground the feet may be on, all along: the plan's floor, a door's opening, the doorstep and its steps — never a
      // cell of the lot no room has, before the door: the court of the pylon reaching past its gate, as it did)
      if (ins && !ins.walk && ins.door < 0 && !stop) stop = z;
      if (edges.some(e => Math.abs(z - e) < 0.03)) continue; n++;
      const want = pl.hi + top(u, z) + (z < L ? Sp.FLOOR_UP : 0); const d = foot - want; if (Math.abs(d) > Math.abs(worst)) { worst = d; at = z; }
      if (d < -0.05) fell++;
    }
    sum.push(`${c} ${worst >= 0 ? '+' : ''}${worst.toFixed(3)}`);
    if (Math.abs(worst) > 0.025 || fell || step > In.BODY.step + 0.01 || Math.abs(pl.y0 - pl.hi) > 1e-9 || stop !== null) out.push(`${c}: os pés a ${worst.toFixed(2)} m da forma em v ${at.toFixed(2)}, ${fell} pontos abaixo dela, o maior degrau ${step.toFixed(2)} m, o quadro a ${(pl.y0 - pl.hi).toFixed(2)} m do chão${stop !== null ? `, um chão onde os pés não ficam em v ${stop.toFixed(2)}` : ''} (${n} pontos)`);
    // (an old record beside it: a hall's, of the version before — brought to the form's family on opening, with the fact)
    const o = put(c, 12 + 6 * (col - 1), 26); o.ip = Object.assign(In.newRecord(o, { t: 'temple', c, e: 3, k: 'ae', cl: c === 'egipcio' ? 'q' : 't', fl: 0, d: 1, w: 1, pw: 0, s: 'S', o: (1 << o.w) - 1 }), { v: In.REC_V - 1 });
    const hall = In.TYPES.temple.fams.find(f => f !== FAM && In.familiesFor(o.ip).ok.includes(f)); if (hall) { o.ip.f = hall; old.push({ c, o, hall }); }
  }
  ok('5a os pés sobem o templo pelo que a forma é, da rua à cela, sempre num chão onde ficam', !out.length, out.slice(0, 3).join(' / ') || `nos seis povos, a cada 2 cm (a maior diferença por povo: ${sum.join(', ')}); o maior degrau no caminho, o de um dos degraus da forma`);
  G.inSim++; In.migrate(); G.inSim--;
  const bad = old.filter(q => q.o.ip.f !== FAM || q.o.ip.v !== In.REC_V || !(q.o.ip.h || []).some(h => /reforma/.test(h[1] || '') || /família/.test(JSON.stringify(h))) || !Sp.onForm(q.o) || Math.abs(Sp.plinth(q.o).y0 - Sp.plinth(q.o).hi) > 1e-9);
  ok('5b um registro de antes, de um salão, vira o da forma ao abrir — e o quadro da planta no chão da forma', old.length >= 4 && !bad.length, `${old.length - bad.length} de ${old.length} (${old.map(q => q.c + ': ' + q.hall + ' > ' + q.o.ip.f).join(', ')})${bad.length ? '; ficou: ' + bad.map(q => q.c + ' ' + q.o.ip.f).join(', ') : ''}`);
}
const err = M.erros(); if (Object.keys(err.mod).length || err.console.length) ok('sem erros de módulo', false, JSON.stringify(err).slice(0, 300));
console.log(fails.length ? `FALHAS: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
