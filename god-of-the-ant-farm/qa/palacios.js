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
//   7. os abertos da fase E (a decisão do líder de 29/10): o mercado de cada povo e o celeiro egípcio (as cúpulas) e o asteca
//      (os potes de barro) pela forma (forma.mercado, forma.celeiro), com as bancas, as baias e as tulhas do P4 como são; o
//      celeiro dos outros povos, um salão, fica com as famílias da receita. As plantas valem em todo lado; a casca aberta no
//      chão da forma (o calçamento, a base, o chão batido), cada banca, baia e tulha da forma uma peça do P4 onde a forma a
//      tem, o que fica em pé no chão guardado dos pés, a entrada por um vão da borda (a do celeiro egípcio só no alto do lance
//      da forma, com os degraus dela); o corpo da entrada a quem vende e a quem compra em cada banca e a onde se guarda em cada
//      baia e tulha; as bancas, os postos e os depósitos do que o prédio guarda; a casca de longe; num mundo em branco, os pés
//      da rua para dentro e em cada um desses lugares, no chão da forma; um registro de antes vira o da forma ao abrir (o do
//      celeiro-salão fica da receita); o 3D os desenha pela forma
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
// (the open ones of phase E: the market of each people, the granary where it is no hall — the Egyptians' domes, the Aztecs' pots)
const BINS = { egipcio: 1, asteca: 1 };
const ABERTOS = POVOS.map(c => ['mercado', c]).concat(POVOS.filter(c => BINS[c]).map(c => ['celeiro', c])); const open = [];
for (const [t, c] of ABERTOS) for (const s of LADOS) {
  const def = G.BDEF[t]; const b = { id: (nid += 41), type: t, style: c, x: 8, y: 8, w: def.w, h: def.h, built: true }; b.ip = rec(t, c, FAM(t), s);
  const p = In.makeFam(b, b.ip, FAM(t)); G.S.buildings.set(b.id, b); open.push({ t, c, s, b, p, so: In.shellOf(b) });
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
// ---------------------------------------------------------------- 7. the open ones of phase E: the market, the granaries
// (the form's ground: its widest floor at the foot under the middle of the lot — the pavement, the base, the beaten floor)
const floorOf = (F, L) => { const c = L / 2, area = r => (r[2] - r[0]) * (r[3] - r[1]); let fl = null;
  for (const e of F.els) if (e.k === 'bloco' && !e.degrau && !e.uso && e.y0 < 0.01 && e.r[0] < c && e.r[2] > c && e.r[1] < c && e.r[3] > c && (!fl || area(e.r) > area(fl.r))) fl = e;
  return fl; };
const KEEP = ['banca', 'baia', 'tulha'], USES = { banca: ['vender', 'comprar'], baia: ['guardar'], tulha: ['guardar'] };
{
  const bad = open.filter(m => !m.p.ok); const no = [];
  for (const [t, c] of ABERTOS) { const r0 = rec(t, c, '', 'S'); const fam = In.familiesFor(r0); const T = In.TYPES[t]; const pref = T.prefer ? T.prefer(r0, fam.ok) : fam.ok; if (pref[0] !== FAM(t)) no.push(`${t}/${c} (${(fam.why && fam.why[FAM(t)]) || 'não preferida: ' + pref[0]})`); }
  const hall = POVOS.filter(c => !BINS[c]).filter(c => { const fam = In.familiesFor(rec('celeiro', c, '', 'S')); return fam.ok.includes(FAM('celeiro')) || !fam.ok.length; });
  ok('7a o mercado de cada povo e o celeiro egípcio e o asteca se armam em todo lado pela família da forma, a que o tipo prefere; o celeiro dos outros povos, um salão, pelas famílias da receita', !bad.length && !no.length && !hall.length,
    `${open.length - bad.length} de ${open.length} plantas${no.length ? '; sem a forma: ' + no.join(', ') : ''}${bad.length ? '; ' + some(bad).map(m => `${tag(m)} ${m.s}: ${m.p.errs.slice(0, 2).join(' | ')}`).join(' / ') : ''}${hall.length ? '; o celeiro-salão pela forma ou sem família: ' + hall.join(', ') : ''}`);
}
{
  const out = [];
  for (const m of open.filter(q => q.p.ok)) {
    const p = m.p, F = formOf(m), L = p.lot.w, why = [];
    const R = r => { const a = In.toLoc(m.s, L, r[0], r[1]), b = In.toLoc(m.s, L, r[2], r[3]); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
    const same = (a, b) => !!a && !!b && a.every((x, k) => Math.abs(x - b[k]) < 0.02);
    const near = (r, x, z, d) => x >= r[0] - d && x <= r[2] + d && z >= r[1] - d && z <= r[3] + d;
    const fl = floorOf(F, L); if (!fl) { out.push(`${tag(m)} ${m.s}: a forma sem chão`); continue; }
    if (p.shell.kind !== 'aberta' || p.roof) why.push('com paredes ou teto');
    if (!same(p.shell.r, R(fl.r)) || Math.abs(p.levels[0].y - fl.y1) > 0.01) why.push(`o chão em ${p.shell.r.join(',')} a ${p.levels[0].y} m (a forma ${R(fl.r).map(v => v.toFixed(2)).join(',')} a ${fl.y1.toFixed(2)})`);
    // (each stall, bay and bin of the form a piece of P4's of that use where the form stands it, drawn by the form)
    const U = G.Forma.uses(F).filter(u => KEEP.includes(u.uso)); const lost = U.filter(u => !p.items.some(i => i.kind === u.uso && i.form && same(i.r, R(u.r))));
    if (!U.length || lost.length) why.push(`${lost.length} de ${U.length} bancas, baias e tulhas da forma sem a peça${lost.length ? ' (' + lost.map(u => u.uso).join(', ') + ')' : ''}`);
    // (and the god's: the market's stalls and bays, which arch.js reads from the form — dropped by it, the god's market was bare
    // pavement, and the mass of the fidelity, low things on a wide floor, did not see it: T-254)
    const nu = k => U.filter(u => u.uso === k).length;
    if (m.t === 'mercado' && (!F.stalls || !F.bays || F.stalls.length !== nu('banca') || F.bays.length !== nu('baia'))) why.push(`o deus sem as bancas e as baias da forma (${F.stalls ? F.stalls.length : '-'} e ${F.bays ? F.bays.length : '-'}; a planta ${nu('banca')} e ${nu('baia')})`);
    // (what stands solid on its floor kept from the feet: every point of its foot under a piece of the plan, 6 cm round)
    let bare = 0, all = 0;
    for (const s of G.Forma.solids(F, fl.y1)) {
      const r = s.k === 'rect' ? s.r : [s.c[0] - s.r, s.c[1] - s.r, s.c[0] + s.r, s.c[1] + s.r];
      for (let u = r[0] + 0.03; u <= r[2] - 0.03 + 1e-9; u += 0.05) for (let v = r[1] + 0.03; v <= r[3] - 0.03 + 1e-9; v += 0.05) {
        if (!near(fl.r, u, v, -0.03)) continue; all++; const q = In.toLoc(m.s, L, u, v); if (!p.items.some(i => near(i.r, q[0], q[1], 0.06))) bare++; }
    }
    if (bare) why.push(`${bare} de ${all} pontos de um sólido da forma sem peça da planta`);
    // (the way in: openings of the front edge to the street; the Egyptian's at the top of the form's flight only, with its treads)
    const e = p.entrance, ed = e && p.doors[e.door]; const rua = p.doors.filter(d => d.rooms.includes('rua'));
    if (!ed || !ed.rooms.includes('rua') || !rua.every(d => d.kind === 'vao' && p.walls[d.wall] && p.walls[d.wall].kind === 'borda')) why.push('a entrada sem os vãos da borda para a rua');
    const tr = F.els.filter(q => q.degrau);
    if (tr.length) {
      let r = tr[0].r.slice(); for (const q of tr) r = [Math.min(r[0], q.r[0]), Math.min(r[1], q.r[1]), Math.max(r[2], q.r[2]), Math.max(r[3], q.r[3])];
      const st = p.stairs.find(q => q.kind === 'degraus'); if (!st || !st.treads || st.treads.length < tr.length) why.push('sem os degraus da forma');
      if (rua.length !== 1 || !ed || !near(R(r), e.x, e.z, 0.06)) why.push(`a rua entra fora do alto do lance (${rua.length} vãos; em ${e ? e.x + ',' + e.z : '-'})`);
    }
    const g = p.reach && p.reach[0]; const room = p.rooms.find(q => q.fn === m.t); const n = p.grid.n, cs = p.grid.cs; let got = 0;
    if (g && room) for (let z = 0; z < n && !got; z++) for (let x = 0; x < n; x++) if (g[z * n + x] && (x + 0.5) * cs > room.r[0] && (x + 0.5) * cs < room.r[2] && (z + 0.5) * cs > room.r[1] && (z + 0.5) * cs < room.r[3]) { got = 1; break; }
    if (!got) why.push(`o ${m.t} que a rua não alcança`);
    if (why.length) out.push(`${tag(m)} ${m.s}: ${why.join(', ')}`);
  }
  ok('7b a casca aberta no chão da forma: cada banca, baia e tulha da forma uma peça do P4 onde ela a tem (e o deus as desenha), o que fica em pé guardado dos pés, a entrada pelos vãos da borda (no celeiro egípcio só no alto do lance, com os degraus da forma); da rua para dentro', open.some(m => m.p.ok) && !out.length, some(out).join(' / ') || `${open.filter(m => m.p.ok).length} plantas`);
}
{
  // (the body by the plan's own rule, from just inside the way in to where one sells and buys at each stall, where one keeps at
  // each bay and bin, by points 5 cm apart)
  const stuck = []; let nIt = 0;
  for (const m of open.filter(q => q.p.ok && q.s === 'S')) {
    const p = m.p, b = m.b; const st = 0.05, nn = Math.round(p.lot.w / st); const e = p.entrance; const seen = new Uint8Array(nn * nn); const q = [];
    const go = (i, j) => { if (i < 0 || j < 0 || i >= nn || j >= nn || seen[j * nn + i]) return; const x = (i + 0.5) * st, z = (j + 0.5) * st; seen[j * nn + i] = 1; if (In.walk(b, 0, x, z, In.BODY.r) && Sp.inBody(p.shell, 0, x, z)) q.push(i, j); else seen[j * nn + i] = 2; };
    for (let j = 0; j < nn; j++) for (let i = 0; i < nn; i++) if (Math.hypot((i + 0.5) * st - e.x, (j + 0.5) * st - e.z) <= 1.0) go(i, j);
    for (let k = 0; k < q.length; k += 2) { const i = q[k], j = q[k + 1]; go(i + 1, j); go(i - 1, j); go(i, j + 1); go(i, j - 1); }
    const got = (x, z) => { for (let j = Math.max(0, Math.floor((z - 0.1) / st)); j <= Math.min(nn - 1, Math.floor((z + 0.1) / st)); j++) for (let i = Math.max(0, Math.floor((x - 0.1) / st)); i <= Math.min(nn - 1, Math.floor((x + 0.1) / st)); i++) if (seen[j * nn + i] === 1 && Math.hypot((i + 0.5) * st - x, (j + 0.5) * st - z) < 0.1) return true; return false; };
    for (const it of p.items.filter(i => i.form && KEEP.includes(i.kind))) {
      nIt++;
      for (const use of USES[it.kind]) { const sp = (it.spots || []).find(x => x.use === use && x.ok); if (!sp || !got(sp.x, sp.z)) stuck.push(`${tag(m)}: o corpo não vai da entrada ${e.x.toFixed(2)},${e.z.toFixed(2)} a ${use} na ${it.kind} ${it.r.map(v => v.toFixed(2)).join(',')}${sp ? ` (${sp.x.toFixed(2)},${sp.z.toFixed(2)})` : ' (sem lugar)'}`); }
    }
  }
  ok('7c o corpo (0,32 m, a regra da planta) vai da entrada a quem vende e a quem compra em cada banca, a onde se guarda em cada baia e tulha, ponto a ponto', nIt && !stuck.length, some(stuck).join(' / ') || `${nIt} peças de ${open.filter(m => m.p.ok && m.s === 'S').length} prédios`);
}
{
  const out = [];
  for (const m of open.filter(q => q.p.ok)) {
    const p = m.p, def = G.BDEF[m.t], T = In.TYPES[m.t], U = G.Forma.uses(formOf(m)); const n = k => p.items.filter(i => i.kind === k).length, nu = k => U.filter(u => u.uso === k).length; const why = [];
    const lack = p.items.filter(i => KEEP.includes(i.kind) && !USES[i.kind].every(u => (i.spots || []).some(x => x.use === u && x.ok))).map(i => i.kind); if (lack.length) why.push(`sem lugar de uso: ${lack.join(', ')}`);
    if (m.t === 'mercado') {
      const J = T.jobs === undefined ? def.jobs : T.jobs;
      if (n('banca') < 3 || n('banca') !== nu('banca') || n('baia') !== nu('baia')) why.push(`${n('banca')} bancas e ${n('baia')} baias (a forma ${nu('banca')} e ${nu('baia')})`);
      if (p.cap.jobs < (J || 0) || p.cap.jobs < n('banca')) why.push(`${p.cap.jobs} postos (as bancas ${n('banca')}; o mercado emprega ${J})`);
    } else {
      if (!n('tulha') || n('tulha') !== nu('tulha')) why.push(`${n('tulha')} tulhas (a forma ${nu('tulha')})`);
      const other = p.items.filter(i => i.store && i.store.dep === 'povo' && !(i.kind === 'tulha' && (i.store.goods || []).includes('food'))); if (other.length) why.push(`o povo guarda fora das tulhas de grão (${other.map(i => i.kind).join(', ')})`);
    }
    if (!(p.cap.store >= def.storage)) why.push(`depósitos para ${p.cap.store} (o ${m.t} guarda ${def.storage})`);
    const free = (m.t === 'mercado' ? ['vender', 'comprar', 'guardar'] : ['guardar']).filter(u => !In.freePlace(m.b, u)); if (free.length) why.push(`sem lugar livre de ${free.join(', ')}`);
    if (why.length) out.push(`${tag(m)} ${m.s}: ${why.join(', ')}`);
  }
  ok('7d o mercado com as bancas da forma (quem vende, quem compra, um posto cada) e as baias; o celeiro com as tulhas da forma, o grão só nelas; os depósitos do que cada um guarda; um lugar livre de cada uso', open.some(m => m.p.ok) && !out.length, some(out).join(' / ') || `${open.filter(m => m.p.ok).length} plantas`);
  const all = open.filter(m => m.p.ok); const diff = all.filter(m => !m.so || strip(m.so) !== strip(In.shellOfPlan(m.p)));
  ok('7e a casca de longe do mercado e dos celeiros igual à da planta', all.length && !diff.length, `${diff.length} cascas diferentes da planta (de ${all.length})${diff.length ? ': ' + diff.slice(0, 3).map(m => tag(m) + ' ' + m.s).join(', ') : ''}`);
}
{
  // (on the blank world of part 5: the feet from the street straight in at the entrance, every 2 cm, on what the form is there —
  // its treads, its floor —, to a body's room before the first piece the line meets, else to the floor's back; and the feet
  // where one sells, buys and keeps, standing on the form's floor. An old record beside each, of the recipe's)
  const S = G.S, TL = Sp.TILE, out = [], at = [], sum = []; let nid3 = 98001; const old = [], halls = [], placedO = [];
  const put = (t, c, x, y) => { const def = G.BDEF[t]; const b = { id: (nid3 += 7), type: t, style: c, x, y, w: def.w, h: def.h, built: true, progress: 1, hp: 100, maxHp: 100, v: 0, set: 0, blocks: !!def.blocks, ip: null };
    S.buildings.set(b.id, b); if (def.blocks) for (let yy = b.y; yy < b.y + b.h; yy++) for (let xx = b.x; xx < b.x + b.w; xx++) S.occ[yy * G.N + xx] = b.id; return b; };
  const inR = (r, x, z) => x >= r[0] && x <= r[2] && z >= r[1] && z <= r[3];
  const NEW = (o, t, c) => In.newRecord(o, { t, c, e: 3, k: 'ae', cl: c === 'egipcio' ? 'q' : 't', fl: 0, d: 1, w: 1, pw: 0, s: 'S', o: (1 << o.w) - 1 });
  ABERTOS.forEach(([t, c], k) => {
    const b = put(t, c, 12 + 6 * k, 52); b.ip = NEW(b, t, c); const key = `${t}/${c}`;
    if (b.ip.f !== FAM(t)) { out.push(`${key}: o registro novo com ${b.ip.f}`); return; }
    const p = Sp.planNow(b); if (!p || !p.ok) { out.push(`${key}: sem planta`); return; } placedO.push({ t, c, b });
    const F = G.Forma.of(t, c), pl = Sp.plinth(b), L = b.h * TL, fl = floorOf(F, L), tr = F.els.filter(q => q.degrau);
    const top = (x, z) => { let h = -1; for (const q of tr) if (inR(q.r, x, z)) h = Math.max(h, q.y1); return h >= 0 ? h : inR(fl.r, x, z) ? fl.y1 : 0; };
    const u = p.entrance.x; let end = fl.r[1] + 0.4; for (const it of p.items) if (it.r[0] < u + In.BODY.r && it.r[2] > u - In.BODY.r) end = Math.max(end, it.r[3] + In.BODY.r + 0.05);
    const edges = [].concat(tr.map(q => q.r), [fl.r]).flatMap(r => [r[1], r[3]]);
    let worst = 0, wz = 0, step = 0, fell = 0, prev = null, n = 0, stop = null;
    for (let z = L + 1.0; z >= end; z -= 0.02) {
      const X = b.x * TL + u, Z = b.y * TL + z; const ins = Sp.indoor(X, Z, 0, b.id); const foot = ins ? ins.y : Sp.footAt(X / TL, Z / TL);
      if (prev !== null) step = Math.max(step, Math.abs(foot - prev)); prev = foot;
      if (ins && !ins.walk && ins.door < 0 && stop === null) stop = z;
      if (edges.some(e => Math.abs(z - e) < 0.03)) continue; n++;
      const d = foot - (pl.hi + top(u, z) + (z < L ? Sp.FLOOR_UP : 0)); if (Math.abs(d) > Math.abs(worst)) { worst = d; wz = z; }
      if (d < -0.05) fell++;
    }
    sum.push(`${key} ${worst >= 0 ? '+' : ''}${worst.toFixed(3)}`);
    if (Math.abs(worst) > 0.025 || fell || step > In.BODY.step + 0.01 || Math.abs(pl.y0 - pl.hi) > 1e-9 || stop !== null) out.push(`${key}: os pés a ${worst.toFixed(2)} m da forma em v ${wz.toFixed(2)}, ${fell} pontos abaixo dela, o maior degrau ${step.toFixed(2)} m, o quadro a ${(pl.y0 - pl.hi).toFixed(2)} m do chão${stop !== null ? `, um chão onde os pés não ficam em v ${stop.toFixed(2)}` : ''} (${n} pontos)`);
    for (const it of p.items.filter(i => i.form && KEEP.includes(i.kind))) for (const x of (it.spots || []).filter(q => q.ok)) {
      const ins = Sp.indoor(b.x * TL + x.x, b.y * TL + x.z, 0, b.id); const want = pl.hi + fl.y1 + Sp.FLOOR_UP;
      if (!ins || !ins.walk || Math.abs(ins.y - want) > 0.025) at.push(`${key}: ${x.use} na ${it.kind} (${x.x.toFixed(2)},${x.z.toFixed(2)}) ${ins ? `a ${(ins.y - want).toFixed(2)} m do chão${ins.walk ? '' : ', onde os pés não ficam'}` : 'fora da planta'}`);
    }
    const o = put(t, c, 12 + 6 * k, 57); o.ip = Object.assign(NEW(o, t, c), { v: In.REC_V - 1 });
    const was = In.TYPES[t].fams.find(f => f !== FAM(t) && In.familiesFor(o.ip).ok.includes(f)); if (was) { o.ip.f = was; old.push({ key, o, was, t }); }
  });
  // (the granary of the other peoples, a hall: an old record of it stays of the recipe's)
  POVOS.filter(c => !BINS[c]).forEach((c, k) => { const o = put('celeiro', c, 12 + 6 * k, 62); o.ip = Object.assign(NEW(o, 'celeiro', c), { v: In.REC_V - 1 }); halls.push({ c, o, f: o.ip.f }); });
  ok('7f os pés entram no mercado e nos celeiros pelo que a forma é, da rua para dentro, e ficam no chão dela onde se vende, se compra e se guarda', placedO.length === ABERTOS.length && !out.length && !at.length, some(out.concat(at)).join(' / ') || `nos ${placedO.length}, a cada 2 cm (a maior diferença: ${sum.join(', ')})`);
  G.inSim++; In.migrate(); G.inSim--;
  const bad = old.filter(q => q.o.ip.f !== FAM(q.t) || q.o.ip.v !== In.REC_V || !Sp.onForm(q.o) || Math.abs(Sp.plinth(q.o).y0 - Sp.plinth(q.o).hi) > 1e-9);
  const moved = halls.filter(q => q.o.ip.f !== q.f || /^forma\./.test(q.o.ip.f));
  ok('7g um registro de antes vira o da forma ao abrir, no mercado e nos celeiros egípcio e asteca; o do celeiro-salão fica da receita', old.length === ABERTOS.length && !bad.length && halls.length && !moved.length,
    `${old.length - bad.length} de ${old.length}${bad.length ? '; ficou: ' + bad.slice(0, 4).map(q => q.key + ' ' + q.o.ip.f).join(', ') : ''}; os celeiros-salão: ${halls.length - moved.length} de ${halls.length} da receita${moved.length ? ' (mudou: ' + moved.map(q => q.c + ' ' + q.o.ip.f).join(', ') + ')' : ''}`);
  const no3 = B3 && B3.byForm ? placedO.filter(q => !B3.byForm(q.b)).map(q => `${q.t}/${q.c}`) : [];
  ok('7h o 3D desenha o mercado e os celeiros com planta pela forma', placedO.length && !no3.length, B3 && B3.byForm ? (no3.length ? `não: ${no3.join(', ')}` : `os ${placedO.length} (a casca aberta: a forma inteira)`) : 'sem o 3D carregado (a fidelidade cobre)');
}
const err = M.erros(); if (Object.keys(err.mod).length || err.console.length) ok('sem erros de módulo', false, JSON.stringify(err).slice(0, 300));
console.log(fails.length ? `FALHAS: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
