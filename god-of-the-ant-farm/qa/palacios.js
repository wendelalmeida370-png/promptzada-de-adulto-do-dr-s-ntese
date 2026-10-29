// palacios: o palácio, os banhos e o paço de cada povo pela sua forma (D-093; a decisão do líder de 29/10: a família pela forma
// dos três no int-monumentos.js, com os móveis do P4), em Node, sem mundo gerado, sobre o código do jogo:
//   1. cada um se arma em todo povo e lado pela família da forma (forma.palacio, forma.banhos, forma.paco), a que o tipo
//      prefere; o grande palácio e o colossal ficam com as plantas deles (não têm o corpo da forma)
//   2. a casca pelo corpo da forma: as paredes no pé dela, o piso na altura dela — sobre a base maciça, ou no chão —, a porta,
//      as janelas; o pórtico com cada coluna onde a forma a tem e a rua entrando pelo vão diante do lance; o portão do pilone
//      do palácio egípcio (a passagem sob a verga até a face do portão, um vão sempre aberto); a passagem do temazcal sob o
//      domo até a porta da forma; o lago egípcio aberto — a borda e as palmeiras sólidas, a água e a fornalha onde a forma as
//      tem, a entrada pela frente do patamar —; o lance da forma com os degraus dela; uma porta da rua só; da rua ao cômodo de
//      cada um; e o corpo (0,32 m, In.walk) da porta da rua ao lugar de pedir audiência e à fornalha e à água dos banhos,
//      ponto a ponto
//   3. o que cada um é: o palácio — o trono (quem senta, quem pede audiência), o aposento com a cama, o fogo, os bancos da
//      corte —; o paço — o assento do chefe, o fogo, os bancos —; os banhos — onde se tira a roupa, a água (a piscina, a tina),
//      a fornalha com o seu posto de trabalho —; um lugar livre de cada uso que o mundo pede ali (os banhos do P2: despir,
//      banhar, alimentar)
//   4. a casca de longe igual à da planta
//   5. num mundo em branco: os pés da rua para dentro a cada 2 cm, no que a forma é ali — a rua, cada degrau do lance, a base,
//      o pórtico, a passagem, o patamar —, nunca um degrau que o corpo não sobe, nunca uma queda, sempre um chão onde ficam, o
//      quadro da planta no chão da forma (Space.onForm pela família do registro); e um registro de antes, de uma família da
//      receita, vira o da forma ao abrir (In.migrate), onde ela se arma
//   6. o 3D desenha os três com planta pela forma (Build3D.byForm)
//   node qa/palacios.js        VERB=1: cada caso que falha, não só os três primeiros
'use strict';
const M = require('./nodemundo.js');
const G = M.load({});
const In = G.Interiors, Sp = G.Space;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | palacios ${name} | ${info}`); if (!c) fails.push(name); };
G.S = { villagers: new Map(), buildings: new Map(), dead: new Map(), settlements: new Map(), clock: 100, day: 3, time: 0.4, avatar: null, nextId: 1000, history: [], fire: new Float32Array(G.N * G.N) };
const POVOS = ['classico', 'grego', 'romano', 'egipcio', 'asteca', 'nordico'], LADOS = ['S', 'E', 'N', 'W'], TIPOS = ['palacio', 'banhos', 'paco'];
const FAM = t => 'forma.' + t;
const rec = (t, c, f, s) => ({ v: In.REC_V, f, r: 0, t, u: In.TYPES[t].use, s, o: (1 << G.BDEF[t].w) - 1, c, e: 3, k: 'ae', cl: c === 'egipcio' ? 'q' : 't', fl: 0, d: 1, w: 1, pw: 0, h: [], m: 0, fx: [], dr: {}, hh: 0, nm: 0, vz: 0, ab: 0 });
const strip = o => { const x = Object.assign({}, o); delete x.key; return JSON.stringify(x); };
const tag = m => `${m.t}/${m.c}`;
const some = L => (process.env.VERB ? L : L.slice(0, 3)); // (the cases that fail: three, or all of them)
let nid = 95001; const made = []; const offer = {};
for (const t of TIPOS) for (const c of POVOS) {
  const r0 = rec(t, c, '', 'S'); const fam = In.familiesFor(r0); const T = In.TYPES[t]; const pref = T.prefer ? T.prefer(r0, fam.ok) : fam.ok;
  offer[t + '/' + c] = { t, ok: fam.ok.includes(FAM(t)), pref: pref[0], why: fam.why && fam.why[FAM(t)] };
  for (const s of LADOS) {
    const def = G.BDEF[t]; const b = { id: (nid += 41), type: t, style: c, x: 8, y: 8, w: def.w, h: def.h, built: true }; b.ip = rec(t, c, FAM(t), s);
    const p = In.makeFam(b, b.ip, FAM(t)); G.S.buildings.set(b.id, b); made.push({ t, c, s, b, p, so: In.shellOf(b) });
  }
}
const formOf = m => G.Forma.of(m.t, m.c), body = m => G.Forma.body(formOf(m));
// ---------------------------------------------------------------- 1. by the form, everywhere
{
  const bad = made.filter(m => !m.p.ok); const no = Object.keys(offer).filter(k => !offer[k].ok || offer[k].pref !== FAM(offer[k].t));
  const keep = ['grande_palacio', 'palacio_colossal'].filter(t => In.TYPES[t] && (In.TYPES[t].fams || []).some(f => /^forma\./.test(f)));
  ok('1a o palácio, os banhos e o paço se armam em todo povo e lado pela família da forma, a que o tipo prefere (o grande palácio e o colossal com as suas)', !bad.length && !no.length && !keep.length,
    `${made.length - bad.length} de ${made.length} plantas${no.length ? '; sem a forma: ' + no.map(k => `${k} (${offer[k].why || 'não preferida: ' + offer[k].pref})`).join(', ') : ''}${bad.length ? '; ' + bad.slice(0, 3).map(m => `${tag(m)} ${m.s}: ${m.p.errs.slice(0, 2).join(' | ')}`).join(' / ') : ''}${keep.length ? '; com a família da forma sem ter corpo: ' + keep.join(', ') : ''}`);
}
// ---------------------------------------------------------------- 2. the shell by the form's body
{
  const out = [];
  for (const m of made.filter(q => q.p.ok)) {
    const p = m.p, B = body(m), Lw = p.lot.w; const why = [];
    const R = r => { const a = In.toLoc(m.s, Lw, r[0], r[1]), b = In.toLoc(m.s, Lw, r[2], r[3]); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
    const same = (a, b) => !!a && !!b && a.every((x, k) => Math.abs(x - b[k]) < 0.02);
    const e = p.entrance; const ed = e && p.doors[e.door]; const rua = p.doors.filter(d => d.rooms.includes('rua'));
    if (!B) {
      // (the sacred lake: open, on the form's ground — its rim and its palms solid, the water and the furnace where the form has
      // them, the way in at the landing's front)
      const F = formOf(m); const sol = p.items.filter(i => i.kind === 'solido').length, want = G.Forma.solids(F).length;
      if (p.shell.kind !== 'aberta' || p.roof) why.push('o lago com paredes ou teto');
      if (sol < want) why.push(`${sol} sólidos (a forma ${want})`);
      const water = p.items.find(i => i.kind === 'piscina'), fur = p.items.find(i => i.kind === 'fornalha-banho');
      if (!water || !water.form || !fur || !fur.form) why.push('a água ou a fornalha fora da forma');
      if (!ed || !rua.length || p.walls[ed.wall].kind !== 'borda') why.push('a entrada pela frente do patamar');
    } else {
      if (!same(p.shell.r, R(B.r))) why.push('as paredes fora do pé da forma');
      if (p.shell.base !== (B.y0 > 0.05 ? 'macica' : 'pedra') || Math.abs(p.levels[0].y - B.y0) > 0.01) why.push(`o piso a ${p.levels[0].y} sobre ${p.shell.base} (a forma ${B.y0.toFixed(2)})`);
      const wins = p.holes.filter(h => h.kind === 'janela').length; if (wins !== B.janelas.length) why.push(`${wins} janelas (a forma ${B.janelas.length})`);
      const bays = p.walls.filter(w => w.kind === 'colunata').reduce((a, w) => a + p.doors.filter(d => d.wall === w.id).length, 0); const want = B.portico ? B.portico.colunas.length - 1 : 0;
      if (bays !== want) why.push(`${bays} vãos de colunata (a forma ${want})`);
      if (B.portico && !(p.shell.annex || []).some(a => a.fn === 'portico' && same(a.r, R(B.portico.r)))) why.push('o pórtico fora da forma');
      if (!ed || !ed.rooms.includes('rua') || rua.length !== 1) why.push(`a porta da rua (${rua.length})`);
      // (the street's door where the form opens it: the gate of the pylon, the temazcal's way in on its dome — an opening always
      // open, the passage to it an annex)
      const gp = B.portao ? In.toLoc(m.s, Lw, B.portao.u, B.portao.v) : null, pp = B.passagem ? In.toLoc(m.s, Lw, B.porta.u, B.passagem.r[3]) : null; const pas = (p.shell.annex || []).some(a => a.fn === 'passagem');
      for (const [pt, what] of [[gp, 'pelo portão do pilone'], [pp, 'pela porta do domo']]) if (pt && ed && (ed.kind !== 'vao' || Math.hypot(e.x - pt[0], e.z - pt[1]) > 0.06 || !pas)) why.push(`a rua não entra ${what}, aberto, pela passagem`);
      const st = p.stairs.find(q => q.kind === 'degraus'); if (B.degraus.length && (!st || !st.treads || st.treads.length < B.degraus.length)) why.push('sem os degraus da forma');
    }
    // (the room it is for, reached from the street on the walk from the door: the throne's, the chief's hall, the hot room, the lake)
    const fn = { palacio: 'trono', paco: 'salao', banhos: B ? 'quente' : 'banhos' }[m.t];
    const g = p.reach && p.reach[0]; const room = p.rooms.find(q => q.fn === fn); const n = p.grid.n, cs = p.grid.cs; let got = 0;
    if (g && room) for (let z = 0; z < n && !got; z++) for (let x = 0; x < n; x++) if (g[z * n + x] && (x + 0.5) * cs > room.r[0] && (x + 0.5) * cs < room.r[2] && (z + 0.5) * cs > room.r[1] && (z + 0.5) * cs < room.r[3]) { got = 1; break; }
    if (!got) why.push(`o cômodo ${fn} que a rua não alcança`);
    if (why.length) out.push(`${tag(m)} ${m.s}: ${why.join(', ')}`);
  }
  ok('2a a casca pelo corpo da forma: paredes, piso, porta, janelas; o pórtico, o portão do pilone, a passagem do temazcal, o lago aberto; o lance; da rua ao cômodo de cada um', made.some(m => m.p.ok) && !out.length, some(out).join(' / ') || `${made.filter(m => m.p.ok).length} plantas`);
  // (and the body by the plan's own rule — In.walk, a circle of 0.32 m —, from just inside the street's door to where one asks
  // an audience before the throne, to the furnace and to the water of the baths, by points 5 cm apart)
  const stuck = [];
  for (const m of made.filter(q => q.p.ok && q.s === 'S')) {
    const p = m.p, b = m.b; const st = 0.05, nn = Math.round(p.lot.w / st); const e = p.entrance; const seen = new Uint8Array(nn * nn); const q = [];
    const go = (i, j) => { if (i < 0 || j < 0 || i >= nn || j >= nn || seen[j * nn + i]) return; const x = (i + 0.5) * st, z = (j + 0.5) * st; seen[j * nn + i] = 1; if (In.walk(b, 0, x, z, In.BODY.r) && Sp.inBody(p.shell, 0, x, z)) q.push(i, j); else seen[j * nn + i] = 2; };
    for (let j = 0; j < nn; j++) for (let i = 0; i < nn; i++) if (Math.hypot((i + 0.5) * st - e.x, (j + 0.5) * st - e.z) <= 1.0) go(i, j);
    for (let k = 0; k < q.length; k += 2) { const i = q[k], j = q[k + 1]; go(i + 1, j); go(i - 1, j); go(i, j + 1); go(i, j - 1); }
    const goals = m.t === 'banhos' ? [['fornalha-banho', 'alimentar'], [null, 'entrar']] : [['trono', 'audiencia']];
    for (const [kind, use] of goals) {
      const sp = p.items.filter(i => !kind || i.kind === kind).flatMap(i => (i.spots || []).filter(x => x.use === use && x.ok))[0];
      const got = sp && q.some((x, k) => k % 2 === 0 && Math.hypot((x + 0.5) * st - sp.x, (q[k + 1] + 0.5) * st - sp.z) < 0.1);
      if (!got) stuck.push(`${tag(m)}: o corpo não vai da porta ${e.x.toFixed(2)},${e.z.toFixed(2)} a ${use} ${sp ? sp.x.toFixed(2) + ',' + sp.z.toFixed(2) : '(sem lugar)'} (${q.length / 2} pontos)`);
    }
  }
  ok('2b o corpo (0,32 m, a regra da planta) vai da porta da rua ao lugar de pedir audiência, à fornalha e à água, ponto a ponto', !stuck.length, some(stuck).join(' / ') || `${made.filter(m => m.p.ok && m.s === 'S').length} prédios`);
}
// ---------------------------------------------------------------- 3. what each is
{
  const out = [];
  for (const m of made.filter(q => q.p.ok)) {
    const p = m.p; const n = k => p.items.filter(i => i.kind === k).length; const why = [];
    const spot = (kind, use) => p.items.some(i => i.kind === kind && (i.spots || []).some(x => x.use === use && x.ok));
    if (m.t === 'banhos') {
      if (n('fornalha-banho') !== 1 || !spot('fornalha-banho', 'alimentar')) why.push('a fornalha sem quem a alimenta');
      if (n('piscina') + n('tina-banho') < 1) why.push('sem água');
      const despir = n('cabide') + (p.marks || []).filter(q => q.use === 'despir').reduce((a, q) => a + q.pts.filter(x => x.ok).length, 0); if (!despir) why.push('sem onde tirar a roupa');
      if (!(p.cap && p.cap.jobs >= 1)) why.push('sem o posto de trabalho');
    } else {
      if (n('trono') !== 1 || !spot('trono', 'audiencia')) why.push('o assento sem quem pede audiência');
      if (!['lar', 'fogao', 'braseiro', 'fogareiro', 'forno'].some(k => n(k))) why.push('sem fogo');
      if (n('banco') < 2) why.push(`${n('banco')} bancos`);
      if (m.t === 'palacio' && !p.items.some(i => (i.kind === 'cama-casal' || i.kind === 'cama') && p.rooms[i.room] && p.rooms[i.room].fn === 'aposento')) why.push('o aposento sem a cama');
    }
    const uses = m.t === 'banhos' ? ['despir', 'banhar', 'alimentar'] : ['sentar', 'audiencia']; const free = uses.filter(u => !In.freePlace(m.b, u)); if (free.length) why.push(`sem lugar livre de ${free.join(', ')}`);
    if (why.length) out.push(`${tag(m)} ${m.s}: ${why.join(', ')}`);
  }
  ok('3a o trono e o aposento do palácio, o assento do chefe, o fogo e os bancos; nos banhos onde se despe, a água, a fornalha e o seu posto; um lugar livre de cada uso', made.some(m => m.p.ok) && !out.length, some(out).join(' / ') || `${made.filter(m => m.p.ok).length} plantas`);
}
// ---------------------------------------------------------------- 4. the shell from afar
{
  const all = made.filter(m => m.p.ok); const diff = all.filter(m => !m.so || strip(m.so) !== strip(In.shellOfPlan(m.p)));
  ok('4a a casca de longe igual à da planta', all.length && !diff.length, `${diff.length} cascas diferentes da planta (de ${all.length})${diff.length ? ': ' + diff.slice(0, 3).map(m => tag(m) + ' ' + m.s).join(', ') : ''}`);
}
// ---------------------------------------------------------------- 5. the feet in, on a blank world
// (from the street along the way in, every 2 cm: the feet — Space.indoor — on what the form is there, as the god and the 3D draw
// it, to 2.5 cm; never a step the body does not take, never a fall, always a floor they stand on; the plan's frame on the ground
// the form stands on — Space.onForm, by the record's family. And an old record — of the recipe's, of the version before —
// brought to the form's family on opening)
const B3 = G.Build3D; const placed = [];
{
  const S = G.newState(7); S.H.fill(4); S.type.fill(G.T.GRASS); if (S.biome) S.biome.fill(0); S.clock = 0; S.day = 30; S.time = 0.3; G.S = S; G.newWorld();
  const TL = Sp.TILE, out = [], sum = []; let nid2 = 97001; const old = [];
  const put = (t, c, x, y) => { const def = G.BDEF[t]; const b = { id: (nid2 += 7), type: t, style: c, x, y, w: def.w, h: def.h, built: true, progress: 1, hp: 100, maxHp: 100, v: 0, set: 0, blocks: !!def.blocks, ip: null };
    S.buildings.set(b.id, b); if (def.blocks) for (let yy = b.y; yy < b.y + b.h; yy++) for (let xx = b.x; xx < b.x + b.w; xx++) S.occ[yy * G.N + xx] = b.id; return b; };
  const inR = (r, x, z) => x >= r[0] && x <= r[2] && z >= r[1] && z <= r[3];
  TIPOS.forEach((t, ti) => POVOS.forEach((c, ci) => {
    const b = put(t, c, 12 + 6 * ci, 14 + 12 * ti); b.ip = In.newRecord(b, { t, c, e: 3, k: 'ae', cl: c === 'egipcio' ? 'q' : 't', fl: 0, d: 1, w: 1, pw: 0, s: 'S', o: (1 << b.w) - 1 });
    const k = `${t}/${c}`; if (b.ip.f !== FAM(t)) { out.push(`${k}: o registro novo com ${b.ip.f}`); return; }
    const p = Sp.planNow(b); if (!p || !p.ok) { out.push(`${k}: sem planta`); return; } placed.push({ t, c, b });
    const F = G.Forma.of(t, c), B = G.Forma.body(F); const pl = Sp.plinth(b); const L = b.h * TL; const u = p.entrance.x;
    // (what the form is at a point of the lot — the side S: the plan's frame —, over the ground it stands on: the form's treads;
    // the base; the floors of the walls, of the porch, of the passages; of the lake, its landing)
    const lake = !B && F.els.find(e => e.k === 'bloco' && e.piso && e.r[1] >= L / 2);
    const top = (x, z) => {
      if (lake) return inR(lake.r, x, z) ? lake.y1 : 0;
      let tr = -1; for (const q of B.degraus) if (inR(q.r, x, z)) tr = Math.max(tr, q.y1); if (tr >= 0) return tr;
      let h = 0; if (B.base && inR(B.base.r, x, z)) h = B.base.h;
      for (const r of [B.r, B.portico && B.portico.r, B.passagem && B.passagem.r, B.portao && [B.portao.r[0], B.portao.r[1], B.portao.r[2], B.portao.v]]) if (r && inR(r, x, z)) h = Math.max(h, B.y0);
      return h; };
    // (the way in, straight from the street: into the hall where the line goes through its door; else to the back of what stands
    // before it — the porch whose bay the street comes up by is beside the door, the gate's passage —; the lake's, to the water)
    const thru = B && Math.abs(u - B.porta.u) < B.porta.w / 2 - 0.3 && !B.portao;
    const end = lake ? lake.r[1] + 0.1 : thru ? B.r[3] - 0.6 : B.portao ? B.portao.r[1] + 0.15 : B.portico ? B.r[3] + 0.15 : B.r[3] - 0.6;
    const edges = lake ? [lake.r[1], lake.r[3]] : [].concat(B.degraus.map(q => q.r), B.base ? [B.base.r] : [], B.portico ? [B.portico.r] : [], B.portao ? [B.portao.r, [0, B.portao.v, 0, B.portao.v]] : [], B.passagem ? [B.passagem.r] : [], [B.r]).flatMap(r => [r[1], r[3]]);
    let worst = 0, at = 0, step = 0, fell = 0, prev = null, n = 0, stop = null;
    for (let z = L + 1.0; z >= end; z -= 0.02) {
      const X = b.x * TL + u, Z = b.y * TL + z; const ins = Sp.indoor(X, Z, 0, b.id); const foot = ins ? ins.y : Sp.footAt(X / TL, Z / TL);
      if (prev !== null) step = Math.max(step, Math.abs(foot - prev)); prev = foot;
      if (ins && !ins.walk && ins.door < 0 && stop === null) stop = z;
      if (edges.some(e => Math.abs(z - e) < 0.03)) continue; n++;
      const want = pl.hi + top(u, z) + (z < L ? Sp.FLOOR_UP : 0); const d = foot - want; if (Math.abs(d) > Math.abs(worst)) { worst = d; at = z; }
      if (d < -0.05) fell++;
    }
    sum.push(`${k} ${worst >= 0 ? '+' : ''}${worst.toFixed(3)}`);
    if (Math.abs(worst) > 0.025 || fell || step > In.BODY.step + 0.01 || Math.abs(pl.y0 - pl.hi) > 1e-9 || stop !== null) out.push(`${k}: os pés a ${worst.toFixed(2)} m da forma em v ${at.toFixed(2)}, ${fell} pontos abaixo dela, o maior degrau ${step.toFixed(2)} m, o quadro a ${(pl.y0 - pl.hi).toFixed(2)} m do chão${stop !== null ? `, um chão onde os pés não ficam em v ${stop.toFixed(2)}` : ''} (${n} pontos)`);
    // (an old record beside it: of the recipe's families, of the version before — brought to the form's family on opening)
    const o = put(t, c, 12 + 6 * ci, 14 + 12 * ti + 5); o.ip = Object.assign(In.newRecord(o, { t, c, e: 3, k: 'ae', cl: c === 'egipcio' ? 'q' : 't', fl: 0, d: 1, w: 1, pw: 0, s: 'S', o: (1 << o.w) - 1 }), { v: In.REC_V - 1 });
    const was = In.TYPES[t].fams.find(f => f !== FAM(t) && In.familiesFor(o.ip).ok.includes(f)); if (was) { o.ip.f = was; old.push({ k, o, was, t }); }
  }));
  ok('5a os pés entram pelo que a forma é, da rua para dentro, sempre num chão onde ficam', !out.length, some(out).join(' / ') || `nos ${placed.length}, a cada 2 cm (a maior diferença: ${sum.join(', ')})`);
  G.inSim++; In.migrate(); G.inSim--;
  const bad = old.filter(q => q.o.ip.f !== FAM(q.t) || q.o.ip.v !== In.REC_V || !Sp.onForm(q.o) || Math.abs(Sp.plinth(q.o).y0 - Sp.plinth(q.o).hi) > 1e-9);
  ok('5b um registro de antes, de uma família da receita, vira o da forma ao abrir — e o quadro da planta no chão da forma', old.length >= TIPOS.length * 4 && !bad.length, `${old.length - bad.length} de ${old.length}${bad.length ? '; ficou: ' + bad.slice(0, 4).map(q => q.k + ' ' + q.o.ip.f).join(', ') : ''}`);
}
// ---------------------------------------------------------------- 6. the 3D draws them by their form
{
  const out = []; if (B3 && B3.byForm) for (const q of placed) if (!B3.byForm(q.b)) out.push(`${q.t}/${q.c}`);
  ok('6a o 3D desenha o palácio, os banhos e o paço com planta pela forma', B3 && B3.byForm ? !out.length : true, B3 && B3.byForm ? (out.length ? `não: ${out.join(', ')}` : `os ${placed.length} (a casca levantada sobre o corpo da forma; o lago, aberto)`) : 'sem o 3D carregado (a fidelidade cobre)');
}
const err = M.erros(); if (Object.keys(err.mod).length || err.console.length) ok('sem erros de módulo', false, JSON.stringify(err).slice(0, 300));
console.log(fails.length ? `FALHAS: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
