'use strict';
// ============================================================
//  Forma, the steps of learning and of the town's government
//  (D-106, D-192; the agent B of the Bairros Vivos): the grand
//  library (biblioteca, 4 tiles: a lot of 16 m) of the six
//  peoples, each its own building — the Roman's of the exedra
//  and the colonnade, the Greek's stoa and its rooms, the
//  Egyptian's House of Life by its court and its pool, the
//  Aztec's house of the codices on its platform, the Norse's
//  hall of the skald among its rune stones, the classical
//  people's house of the tablets behind its walled court —,
//  put in by G.Forma.def(type, style, fn(L, n), sizes).
//  Each is one risk (risco): the god paints its outside from
//  it, and the plan (js/int-saber.js) lays out its walls, its
//  rooms, its doors, its columns, its court and its pieces
//  from the same numbers — kept on the platform's element
//  (e.risco), as the temples' (js/forma-poder.js).
//  Pure as js/forma.js (rules 36, 43): no chance, no world,
//  no 3D; the body's rules hold in every one.
// ============================================================
(function (G) {
  const Fo = G.Forma; if (!Fo) return;
  const TILE = 4;
  const r2 = x => Math.round(x * 100) / 100;
  const BASE = ['base0', 'base1', 'base2'], WALL = ['wl', 'wr', 'top'], COL = ['col0', 'col1', 'col0'], PAR = ['par0', 'par1', 'par0'];
  const ROOF = ['roof0', 'roof1', 'gable', 'roof2'];
  const DOOR_H = 2.6; // (an inner door's height: over the body's 1.75 m, under the lintel's beam)
  const bloco = (r, y0, y1, cor, o) => Object.assign({ k: 'bloco', r: r.map(r2), y0: r2(y0), y1: r2(y1), cor }, o || {});
  // (a palisade's planks between its stakes — the fence from afar, the wall the plan has there: L-800)
  const fenceOf = (along, rr, y, h) => { const c = along ? r2((rr[1] + rr[3]) / 2) : r2((rr[0] + rr[2]) / 2), y1 = r2(y + h - 0.45);
    return { k: 'pano', p: along ? [[rr[0], c, y], [rr[2], c, y], [rr[2], c, y1], [rr[0], c, y1]] : [[c, rr[1], y], [c, rr[3], y], [c, rr[3], y1], [c, rr[1], y1]], cor: '#5c4028', mat: 'plankV' }; };

  // ------------------------------ the kit of a risk ------------------------------
  // A building of the town on its platform: the platform and its flight from the street (risers of 0.25 m, the flight's foot at
  // the lot's edge), the block of its walls (R.B: the plan's shell), the court before it or round it on the platform (R.yard:
  // its walls, its gate where the flight comes up), the porches (annexes, their columns), the rooms, the pieces of the courts.
  // Metres in the form's frame: u across, v from the back, the way in at v = L, y over the lot's highest ground.
  // o: { e (the platform's margin in the lot), Hp (its height), td (a tread's depth), sw (the flight's width) }
  function kit(st, n, fam, o) {
    const L = n * TILE; const e = o.e === undefined ? 0.3 : o.e, Hp = o.Hp, td = o.td || 0.42; const nr = Math.max(1, Math.round(Hp / 0.25));
    const Vp = r2(L - e - (nr - 1) * td); const sw = o.sw; const su0 = r2(L / 2 - sw / 2), su1 = r2(L / 2 + sw / 2);
    const treads = []; for (let q = 0; q < nr - 1; q++) treads.push({ r: [su0, r2(L - e - td * (q + 1)), su1, r2(L - e - td * q)], y: r2(Hp * (q + 1) / nr) });
    const R = { st, n, L, k: 0, fam, e, Hp, nr, td, Vp, sw, su0, su1, treads, podium: [e, e, r2(L - e), Vp], stair: [su0, Vp, su1, r2(L - e)],
      walls: [], rooms: [], cols: [], annexes: [], pieces: [], fires: [], deco: [] };
    const K = { R, L, Hp, Vp, e };
    K.room = (fn, r, x) => { R.rooms.push(Object.assign({ lv: 0, fn, r: r.map(r2), id: R.rooms.length }, x || {})); return R.rooms.length - 1; };
    K.wall = (a, b, tw, h, kind, x) => { const w = Object.assign({ lv: 0, a: a.map(r2), b: b.map(r2), t: tw, h: r2(h), kind, outer: 0, casca: 0, ops: [] }, x || {}); R.walls.push(w); return w; };
    K.door = (w, p, ww, hh, kind, x) => { const d = Object.assign({ k: kind || 'porta', p: p.map(r2), w: ww, h: hh }, x || {}); w.ops.push(d); return d; };
    K.win = (w, p, ww, hh, sill) => { w.ops.push({ k: 'janela', p: p.map(r2), w: ww, h: hh, sill }); };
    K.solid = (rm, r, h, kind, x) => { R.pieces.push(Object.assign({ room: rm, r: r.map(r2), h: r2(h), k: kind }, x || {})); };
    // (a line of columns from a to b, their middles `at` metres from a; the bays between them the ways through)
    K.colLine = (a, b, at, rc, h, x) => { R.cols.push(Object.assign({ line: [a.map(r2), b.map(r2)], at: at.map(r2), rc, h: r2(h), y0: Hp }, x || {})); };
    K.evenly = (len, rc, m) => Array.from({ length: m }, (_, q) => r2(rc + q * (len - 2 * rc) / (m - 1)));
    // (the court on the platform: its walls — a balustrade, a high wall, a palisade — at its sides, behind where asked, and its
    // front with the gate where the flight comes up: an opening of the flight's width in an edge of no height — gate.k 'vao' —,
    // or a gate with its leaf in the front wall — 'portao')
    const ft = 0.3, c2 = ft / 2; K.ft = ft;
    K.precinct = (Yr, fh, back, gate) => {
      R.yard = Yr.map(r2); R.yardH = fh; const x = { outer: 1, casca: 1, yard: 1 };
      K.wall([r2(Yr[0] + c2), Yr[1]], [r2(Yr[0] + c2), Yr[3]], ft, fh, 'cerca', x); K.wall([r2(Yr[2] - c2), Yr[3]], [r2(Yr[2] - c2), Yr[1]], ft, fh, 'cerca', x);
      if (back) K.wall([Yr[2], r2(Yr[1] + c2)], [Yr[0], r2(Yr[1] + c2)], ft, fh, 'cerca', x);
      const fy = r2(Yr[3] - c2);
      if (gate.k === 'vao') { const g0 = r2(L / 2 - gate.w / 2), g1 = r2(L / 2 + gate.w / 2);
        K.wall([g0, fy], [Yr[0], fy], ft, fh, 'cerca', x); K.wall([Yr[2], fy], [g1, fy], ft, fh, 'cerca', x);
        const bw = K.wall([g1, r2(Yr[3] - 0.05)], [g0, r2(Yr[3] - 0.05)], 0.1, 0, 'borda', x); R.gateD = K.door(bw, [L / 2, r2(Yr[3] - 0.05)], gate.w, 2.2, 'vao', { rua: 1 }); }
      else { const fw = K.wall([Yr[2], fy], [Yr[0], fy], ft, fh, 'cerca', x); R.gateD = K.door(fw, [L / 2, fy], gate.w, gate.h, 'portao', { rua: 1 }); }
      R.gate = { u: L / 2, v: Yr[3], w: gate.w };
    };
    // (the block's walls of the people's stuff: its back, its sides, its front)
    K.block = (Bc, tw, Hw) => {
      Object.assign(R, { B: Bc.map(r2), t: tw, Hw, eave: r2(Hp + Hw) });
      const x = s => ({ outer: 1, casca: 1, side: s });
      return { fundo: K.wall([Bc[0], r2(Bc[1] + tw / 2)], [Bc[2], r2(Bc[1] + tw / 2)], tw, Hw, 'parede', x('fundo')),
        esquerda: K.wall([r2(Bc[0] + tw / 2), Bc[3]], [r2(Bc[0] + tw / 2), Bc[1]], tw, Hw, 'parede', x('esquerda')),
        direita: K.wall([r2(Bc[2] - tw / 2), Bc[1]], [r2(Bc[2] - tw / 2), Bc[3]], tw, Hw, 'parede', x('direita')),
        frente: K.wall([Bc[2], r2(Bc[3] - tw / 2)], [Bc[0], r2(Bc[3] - tw / 2)], tw, Hw, 'parede', x('frente')) };
    };
    // (windows along a wall of the block — its line across u, or along v —, one every `each` metres of the span [a, b], but
    // where one of `skip` stands ([middle, width]))
    K.wins = (w, along, a, b, each, ww, hh, sill, skip) => {
      const at = along === 'u' ? w.a[1] : w.a[0]; const m = Math.max(1, Math.floor((b - a) / each));
      for (let q = 0; q < m; q++) { const c = r2(a + (b - a) * (q + 0.5) / m); if ((skip || []).some(([sm, sw2]) => Math.abs(c - sm) < sw2 / 2 + ww / 2 + 0.4)) continue; K.win(w, along === 'u' ? [c, at] : [at, c], ww, hh, sill); }
    };
    K.done = () => { const B = R.B; R.levels = [{ lv: 0, y: Hp, h: R.Hw, kind: 'piso', area: [r2(B[0] + R.t), r2(B[1] + R.t), r2(B[2] - R.t), r2(B[3] - R.t)] }]; return R; };
    return K;
  }

  // ------------------------------ the outside, painted from a risk ------------------------------
  // the platform and its flight, the court's paving and its walls (the balustrade, the high wall and the lintel over its gate,
  // the palisade of stakes), the gate's leaf, the columns, the block of the walls with its windows and its door; then what the
  // people's own building has over them (R.deco: the entablature and the roof, the bands, the crests, the dragons) and the
  // pieces of the courts (the trees, the statues, the stones, the pool, the basin)
  function paint(R) {
    const { L, Hp, B } = R; const els = []; const EG = R.st === 'egipcio', NO = R.st === 'nordico', AZ = R.st === 'asteca';
    els.push(bloco(R.podium, 0, Hp, BASE, { mat: 'base', risco: R }));
    for (const q of R.treads) els.push(bloco(q.r, 0, q.y, BASE, { mat: 'base', degrau: 1 }));
    const pv = R.pave || '#e4dccb';
    els.push(bloco(R.yard, Hp, r2(Hp + 0.05), [pv, pv, pv], { mat: NO ? 'turf' : 'slab', piso: 1 }));
    for (const w of R.walls) {
      if (!w.yard || w.kind === 'borda') continue; const along = Math.abs(w.a[1] - w.b[1]) < 1e-6;
      const r = along ? [Math.min(w.a[0], w.b[0]), r2(w.a[1] - w.t / 2), Math.max(w.a[0], w.b[0]), r2(w.a[1] + w.t / 2)] : [r2(w.a[0] - w.t / 2), Math.min(w.a[1], w.b[1]), r2(w.a[0] + w.t / 2), Math.max(w.a[1], w.b[1])];
      const gate = w.ops.find(q => q.rua); const parts = gate && along ? [[r[0], r2(gate.p[0] - gate.w / 2)], [r2(gate.p[0] + gate.w / 2), r[2]]] : [[along ? r[0] : r[1], along ? r[2] : r[3]]];
      for (const [a, b] of parts) {
        const rr = along ? [a, r[1], b, r[3]] : [r[0], a, r[2], b];
        if (NO) { const len = b - a; const m = Math.max(1, Math.round(len / 0.8)); // (the palisade: its pointed stakes, thin from afar — the planks stand for them)
          for (let q = 0; q <= m; q++) { const pnt = along ? [r2(a + len * q / m), r2((r[1] + r[3]) / 2)] : [r2((r[0] + r[2]) / 2), r2(a + len * q / m)];
            els.push({ k: 'tora', a: [pnt[0], pnt[1], Hp], b: [pnt[0], pnt[1], r2(Hp + w.h - 0.4)], r: 0.14, cor: '#6a4a2c', fino: 1 }, { k: 'piramide', c: pnt, e: 0.12, y0: r2(Hp + w.h - 0.4), y1: r2(Hp + w.h + 0.3), cor: ['#6a4a2c', '#5a3c22'], mat: 'beam', fino: 1 }); }
          els.push(fenceOf(along, rr, Hp, w.h));
        } else els.push(bloco(rr, Hp, r2(Hp + w.h), w.h > 1.6 ? WALL : PAR, { mat: w.h > 1.6 ? 'parede' : 'slab' }));
      }
      if (gate && along && gate.k === 'portao') {
        // (a gate with its leaf: the lintel over it where the wall is higher — the plan's wall goes on over the door —, the
        // Norse's tall posts; the form paints the leaf shut, the inside's turns there when the inside is drawn)
        if (NO) for (const s of [-1, 1]) { const u = r2(gate.p[0] + s * (gate.w / 2 + 0.2)); els.push({ k: 'tora', a: [u, gate.p[1], Hp], b: [u, gate.p[1], r2(Hp + w.h + 1.2)], r: 0.2, cor: '#5a3a22' }); }
        else if (w.h > gate.h + 0.05) els.push(bloco([r2(gate.p[0] - gate.w / 2), r[1], r2(gate.p[0] + gate.w / 2), r[3]], r2(Hp + gate.h), r2(Hp + w.h), WALL, { mat: 'parede' }));
        els.push({ k: 'porta', na: 'frente', v: r2(gate.p[1] + w.t / 2), u: gate.p[0], w: gate.w, y0: Hp, y1: r2(Hp + gate.h), cor: EG ? '#2a2016' : NO ? '#4a3220' : 'door', portao: true });
      }
    }
    const colsOf = c => { const [a, b] = c.line; const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return c.at.map(s => [r2(a[0] + (b[0] - a[0]) * s / len), r2(a[1] + (b[1] - a[1]) * s / len)]); };
    const pap = EG ? { h: 0.8, r: 0.75, cor: 'acc2' } : null;
    for (const c of R.cols) els.push({ k: 'colunata', pts: colsOf(c), r: c.rc, y0: Hp, y1: r2(Hp + c.h), cor: NO || c.wood ? ['wr', 'wl'] : AZ ? ['wl', 'wr'] : ['col0', 'col1'], papiro: pap || undefined, mat: NO || c.wood ? 'beam' : undefined });
    const top = r2(Hp + R.Hw);
    els.push(bloco(B, Hp, top, WALL, Object.assign({ mat: 'parede' }, NO ? { tabuas: 8 } : {})));
    // (the windows and the doors of the block's faces: the shell's own in the 3D — the plan's openings —, painted by the god here)
    const face = { frente: B[3], fundo: B[1], direita: B[2], esquerda: B[0] };
    for (const w of R.walls) {
      if (!w.casca || !w.side) continue; const across = w.side === 'frente' || w.side === 'fundo';
      for (const q of w.ops) {
        const c = across ? q.p[0] : q.p[1];
        if (q.k === 'janela') els.push({ k: 'janelas', na: w.side, em: face[w.side], de: r2(c - q.w / 2), ate: r2(c + q.w / 2), y0: r2(Hp + q.sill), y1: r2(Hp + q.sill + q.h), n: 0 });
        else if (w.side === 'frente') els.push({ k: 'porta', na: 'frente', v: B[3], u: c, w: q.w, y0: Hp, y1: r2(Hp + q.h), cor: q.k === 'portal' ? (EG ? '#3e2e1c' : AZ ? '#2a1c14' : 'door') : 'door' });
      }
    }
    for (const q of R.deco) els.push(q);
    for (const p of R.pieces) {
      if (p.inner) continue; const c = [r2((p.r[0] + p.r[2]) / 2), r2((p.r[1] + p.r[3]) / 2)];
      if (p.k === 'cipreste') els.push({ k: 'bola', c: [c[0], c[1], r2(Hp + p.h * 0.5)], r: 0.45, ry: r2(p.h * 0.55), cor: '#2f5a2a', mat: 'turf' });
      else if (p.k === 'oliveira') els.push({ k: 'tora', a: [c[0], c[1], Hp], b: [c[0], c[1], r2(Hp + p.h * 0.5)], r: 0.14, cor: '#6a5a44' }, { k: 'bola', c: [c[0], c[1], r2(Hp + p.h * 0.7)], r: 0.95, ry: r2(p.h * 0.32), cor: '#7a8f5a', mat: 'turf' });
      else if (p.k === 'palmeira') els.push({ k: 'palmeira', p: [c[0], c[1], Hp], h: r2(p.h - 0.5), s: 1.2 });
      else if (p.k === 'estatua') els.push(bloco(p.r, Hp, r2(Hp + 0.9), BASE, { mat: 'base' }), { k: 'estatua', p: [c[0], c[1], r2(Hp + 0.9)], h: r2(p.h - 0.9), w: 0.45, cor: p.cor || '#e8e0d0' });
      else if (p.k === 'pedra') els.push({ k: 'pedra', c, e: r2((p.r[2] - p.r[0]) / 2), e1: r2((p.r[3] - p.r[1]) / 2 * 0.8), y0: Hp, y1: r2(Hp + p.h), cai: [0.04, 0.04], cor: ['#8e877b', '#6f6a60'], cobra: p.runa ? '#a23c2a' : undefined });
      else if (p.k === 'tanque') { const q = 0.22; els.push(bloco(p.r, Hp, r2(Hp + p.h), BASE, { mat: 'base' }), { k: 'lamina', r: [p.r[0] + q, p.r[1] + q, p.r[2] - q, p.r[3] - q].map(r2), y: r2(Hp + p.h + 0.01), cor: '#3f8fb0' },
        { k: 'flores', pts: [[r2(p.r[0] + 0.9), r2(c[1] - 0.25)], [r2(c[0]), r2(c[1] + 0.3)], [r2(p.r[2] - 0.9), r2(c[1] - 0.2)]], y: r2(Hp + p.h + 0.02), r: 0, n: 1, b: 0.24, chato: true, cor: ['#5a9a3c', '#f0a0c0'] }); }
      else if (p.k === 'tina') els.push({ k: 'bacia', c, r: r2((p.r[2] - p.r[0]) / 2), t: 0.14, y0: Hp, y1: r2(Hp + p.h), nivel: 0.12, cor: '#b89a74', agua: '#8a6a4a', fundo: '#7a5a3c' });
      else if (p.k === 'braseiro') els.push(bloco(p.r, Hp, r2(Hp + p.h * 0.7), BASE, { mat: 'base' }), { k: 'braseiro', p: [c[0], c[1], r2(Hp + p.h * 0.7)], r: r2((p.r[2] - p.r[0]) * 0.3) });
      else if (p.k === 'poste') els.push({ k: 'tora', a: [c[0], c[1], Hp], b: [c[0], c[1], r2(Hp + p.h)], r: r2((p.r[2] - p.r[0]) / 2), cor: '#6a4a30' }, { k: 'bola', c: [c[0], c[1], r2(Hp + p.h + 0.2)], r: 0.24, cor: '#a23c2a' });
      else els.push(bloco(p.r, Hp, r2(Hp + p.h), BASE, { mat: 'base' }));
    }
    return els;
  }
  const formOf = risk => st => (L, n) => { const R = risk(st, n); return { els: paint(R), door: R.doorD || { u: R.gate.u, w: R.gate.w, y0: R.Hp, y1: r2(R.Hp + 2.6) } }; };
  // (the plan's roof over the block, under the form's: a ridge the same way, as steep as the form's roof where it starts at the
  // same edge — never over it)
  const under = (kind, along, H, halfB, halfT, over) => ({ kind, along, h: r2(Math.floor(100 * H * (halfB + (over || 0)) / halfT) / 100 - 0.05), over: over || 0 });

  // ------------------------------ the grand library (biblioteca, 4 tiles) ------------------------------
  // What a library of a town has, in each people's own building: the reading room — the tables where one reads, two readers
  // to a table —, the room of the rolls (acervo: the shelves, the niches, the chests of what is kept), the office where the
  // scrolls are copied (escritorio: the copyists' desks, the librarian's), and before them the porch and the court where one
  // comes in and waits. The plan's rooms by what each is for (fn): 'leitura', 'acervo', 'escritorio', 'exedra' (the niche of
  // the image, open on the reading room), 'portico' (a porch one reads under too), 'patio' / 'terreiro' (open to the sky)
  const LIB = 'forma.salao'; // (the library's family: int-civicos.js, In.formType)
  function riscoBiblioteca(st, n) {
    const GR = st === 'grego', RO = st === 'romano', EG = st === 'egipcio', NO = st === 'nordico', AZ = st === 'asteca';
    if (RO) {
      // ---- the Roman's: on its podium behind the colonnade, the great hall and the exedra of Minerva at its back ----
      const K = kit(st, n, LIB, { Hp: 1.0, sw: 7.2 }); const { R, L, Hp, Vp } = K;
      const t = 0.5, ti = 0.3, Hc = 5.6, He = 1.2, Hw = r2(Hc + He), pd = 2.4, rc = 0.35;
      const B = [0.6, 0.6, r2(L - 0.6), 10.4]; const ws = K.block(B, t, Hw); R.Hc = Hc; R.He = He;
      K.precinct([B[0], B[3], B[2], Vp], 1.0, false, { k: 'vao', w: R.sw });
      const I = [B[0] + t, B[1] + t, B[2] - t, B[3] - t]; const bd = 2.6; const pv = r2(I[1] + bd + ti / 2); // (the back row's depth; the partition's line)
      const s0 = r2(L / 2 - 2.3), s1 = r2(L / 2 + 2.3);
      const esc = K.room('escritorio', [I[0], I[1], r2(s0 - ti / 2), r2(pv - ti / 2)]), exe = K.room('exedra', [r2(s0 + ti / 2), I[1], r2(s1 - ti / 2), r2(pv - ti / 2)]), ace = K.room('acervo', [r2(s1 + ti / 2), I[1], I[2], r2(pv - ti / 2)]);
      const hall = K.room('leitura', [I[0], r2(pv + ti / 2), I[2], I[3]]);
      const pw = K.wall([I[0], pv], [I[2], pv], ti, Hw, 'parede');
      K.door(pw, [L / 2, pv], 3.2, 4.4, 'vao'); // (the exedra open on the hall)
      for (const id of [esc, ace]) { const r = R.rooms[id].r; K.door(pw, [r2((r[0] + r[2]) / 2), pv], 1.0, DOOR_H, 'porta'); }
      K.wall([s0, I[1]], [s0, r2(pv - ti / 2)], ti, Hw, 'divisoria'); K.wall([s1, r2(pv - ti / 2)], [s1, I[1]], ti, Hw, 'divisoria');
      const dw = 2.2, dh = 3.6; K.door(ws.frente, [L / 2, r2(B[3] - t / 2)], dw, dh, 'portal'); R.doorD = { u: L / 2, w: dw, y0: Hp, y1: r2(Hp + dh) };
      // (the windows: high along the sides and the back, two tall ones either side of the door under the porch)
      K.wins(ws.esquerda, 'v', I[1], I[3], 3.0, 1.0, 1.6, 3.4); K.wins(ws.direita, 'v', I[1], I[3], 3.0, 1.0, 1.6, 3.4);
      K.wins(ws.fundo, 'u', I[0], I[2], 3.4, 1.0, 1.6, 3.4, [[L / 2, 4.6]]);
      for (const s of [-1, 1]) K.win(ws.frente, [r2(L / 2 + s * 4.4), r2(B[3] - t / 2)], 1.2, 2.2, 1.4);
      // the porch: six columns along its front, the landing before it where the flight comes up
      const P1 = r2(B[3] + pd); R.annexes.push({ r: [B[0], B[3], B[2], P1], h: Hc, fn: 'portico' });
      K.colLine([B[2], r2(P1 - rc)], [B[0], r2(P1 - rc)], K.evenly(B[2] - B[0], rc, 6), rc, Hc, { porch: 1 });
      const por = K.room('portico', [r2(B[0] + K.ft), B[3], r2(B[2] - K.ft), r2(P1 - 2 * rc)]);
      const land = K.room('terreiro', [r2(B[0] + K.ft), P1, r2(B[2] - K.ft), r2(Vp - 0.1)], { open: 1 });
      for (const s of [-1, 1]) { const u = r2(L / 2 + s * (R.sw / 2 + 1.5)), v = r2((P1 + Vp) / 2 - 0.05); K.solid(land, [u - 0.4, v - 0.4, u + 0.4, v + 0.4], 3.6, 'estatua'); }
      Object.assign(R, { hall, read: [hall], shelf: [ace, hall, exe], desk: [esc], image: exe, porch: por, courtRoom: land, wait: [por] });
      // the entablature over the block and the porch, its band; the hipped roof of tiles; the plaque over the door
      const Te = [r2(B[0] - 0.1), r2(B[1] - 0.1), r2(B[2] + 0.1), r2(P1 + 0.1)], top = r2(Hp + Hw), rh = 3.0;
      R.deco.push(bloco(Te, r2(Hp + Hc), top, COL, { mat: 'slab' }), { k: 'faixa', r: Te, y0: r2(top - He * 0.6), y1: r2(top - He * 0.3), cor: 'acc2' },
        { k: 'telhado', r: Te, y0: top, y1: r2(top + rh), ao: 'u', ov: 0.2, quatro: true, cor: ROOF },
        { k: 'placa', v: r2(Te[3] + 0.02), u: L / 2, w: 3.2, y0: r2(Hp + Hc + 0.25), y1: r2(top - 0.2), cor: '#e8d8a8' });
      for (const s of [B[0], B[2]]) { const pts = []; for (let v = r2(B[1] + 1.0); v <= B[3] - 0.8 + 1e-6; v = r2(v + 3.0)) pts.push([s, v]); R.deco.push({ k: 'colunata', pts, r: r2(t * 0.55), y0: Hp, y1: r2(Hp + Hc), cor: ['col0', 'col1'] }); } // (the engaged columns of the sides)
      R.roof = under('quatro-aguas', 'u', rh, (B[3] - B[1]) / 2, (Te[3] - Te[1]) / 2 + 0.2, 0.1); R.mat = 'reboco'; R.pave = '#e4dccb';
      return K.done();
    }
    if (GR) {
      // ---- the Greek's: the stoa along the court, the three rooms behind it under one roof ----
      const K = kit(st, n, LIB, { Hp: 0.75, sw: 9.6 }); const { R, L, Hp, Vp } = K;
      const t = 0.45, ti = 0.3, Hc = 4.4, He = 1.0, Hw = r2(Hc + He), sd = 3.2, rc = 0.32;
      const B = [0.6, 0.6, r2(L - 0.6), 7.0]; const ws = K.block(B, t, Hw); R.Hc = Hc; R.He = He;
      K.precinct([B[0], B[3], B[2], Vp], 1.0, false, { k: 'vao', w: R.sw });
      const I = [B[0] + t, B[1] + t, B[2] - t, B[3] - t]; const s0 = r2(L / 2 - 4.7), s1 = r2(L / 2 + 4.7), fy = r2(B[3] - t / 2);
      const ace = K.room('acervo', [I[0], I[1], r2(s0 - ti / 2), I[3]]), hall = K.room('leitura', [r2(s0 + ti / 2), I[1], r2(s1 - ti / 2), I[3]]), esc = K.room('escritorio', [r2(s1 + ti / 2), I[1], I[2], I[3]]);
      // (each room opens on the stoa, as the rooms of a stoa do: none into the next)
      const dw = 2.0, dh = 3.4; K.door(ws.frente, [L / 2, fy], dw, dh, 'portal'); R.doorD = { u: L / 2, w: dw, y0: Hp, y1: r2(Hp + dh) };
      for (const id of [ace, esc]) { const r = R.rooms[id].r; K.door(ws.frente, [r2((r[0] + r[2]) / 2), fy], 1.2, DOOR_H, 'porta'); }
      for (const x of [s0, s1]) K.wall([x, I[1]], [x, I[3]], ti, Hw, 'divisoria');
      K.wins(ws.fundo, 'u', I[0], I[2], 2.8, 0.9, 1.3, 2.9); K.wins(ws.esquerda, 'v', I[1], I[3], 2.6, 0.9, 1.3, 2.9); K.wins(ws.direita, 'v', I[1], I[3], 2.6, 0.9, 1.3, 2.9);
      // the stoa: eight columns along its front, the court before it
      const P1 = r2(B[3] + sd); R.annexes.push({ r: [B[0], B[3], B[2], P1], h: Hc, fn: 'portico' });
      K.colLine([B[2], r2(P1 - rc)], [B[0], r2(P1 - rc)], K.evenly(B[2] - B[0], rc, 8), rc, Hc, { porch: 1 });
      const por = K.room('portico', [r2(B[0] + K.ft), B[3], r2(B[2] - K.ft), r2(P1 - 2 * rc)]);
      const court = K.room('patio', [r2(B[0] + K.ft), P1, r2(B[2] - K.ft), r2(Vp - 0.1)], { open: 1 });
      // (the olives of the court's corners, Athena on her pedestal beside the way)
      for (const s of [-1, 1]) { const u = r2(L / 2 + s * 6.2), v = r2(P1 + 1.5); K.solid(court, [u - 0.3, v - 0.3, u + 0.3, v + 0.3], 4.2, 'oliveira'); }
      { const u = r2(L / 2 - R.sw / 2 - 0.9), v = r2(Vp - 1.3); K.solid(court, [u - 0.4, v - 0.4, u + 0.4, v + 0.4], 3.4, 'estatua', { cor: '#f2c14e' }); }
      Object.assign(R, { hall, read: [hall, por], shelf: [ace, hall, esc], desk: [esc], image: hall, porch: por, courtRoom: court, wait: [por, court], mu: 0.3 });
      // the entablature over the rooms and the stoa, its painted band; the roof of tiles along the front
      const Te = [r2(B[0] - 0.1), r2(B[1] - 0.1), r2(B[2] + 0.1), r2(P1 + 0.1)], top = r2(Hp + Hw), rh = 2.4;
      R.deco.push(bloco(Te, r2(Hp + Hc), top, COL, { mat: 'slab' }), { k: 'faixa', r: Te, y0: r2(top - He * 0.6), y1: r2(top - He * 0.3), cor: 'acc' },
        { k: 'telhado', r: Te, y0: top, y1: r2(top + rh), ao: 'u', ov: 0.2, cor: ROOF });
      for (let q = 1; q < 3; q++) R.deco.push({ k: 'faixa', r: R.podium.slice(), y0: r2(Hp * q / 3 - 0.05), y1: r2(Hp * q / 3), cor: 'base2' }); // (the crepidoma's steps)
      // (the painted panels of the stoa's back wall, between its doors)
      for (const s of [-1, 1]) R.deco.push({ k: 'placa', v: r2(B[3] + 0.02), u: r2(L / 2 + s * 3.4), w: 3.4, y0: r2(Hp + 0.9), y1: r2(Hp + 3.0), cor: s < 0 ? '#b8452f' : '#3f6fb0' });
      R.roof = under('duas-aguas', 'u', rh, (B[3] - B[1]) / 2, (Te[3] - Te[1]) / 2 + 0.2, 0.1); R.mat = 'reboco'; R.pave = '#e4dccb';
      return K.done();
    }
    if (EG) {
      // ---- the Egyptian's House of Life: behind the court's gate, the pool and the palms; the porch of papyrus columns; the
      // vestibule between the chamber of the rolls and the scribes'; behind them the hall of Thoth, its four columns ----
      const K = kit(st, n, LIB, { Hp: 0.5, td: 0.45, sw: 3.0 }); const { R, L, Hp, Vp } = K;
      const t = 0.7, ti = 0.4, Hw = 5.2, Hc = 3.8, pd = 2.4, rc = 0.4, Hy = 2.0, gw = 2.2, gh = 2.8;
      const B = [0.6, 0.6, r2(L - 0.6), 10.0]; const ws = K.block(B, t, Hw);
      K.precinct([B[0], B[3], B[2], Vp], Hy, false, { k: 'portao', w: gw, h: gh });
      const I = [B[0] + t, B[1] + t, B[2] - t, B[3] - t]; const pv = r2(I[3] - 2.3 - ti / 2), s0 = r2(L / 2 - 1.6), s1 = r2(L / 2 + 1.6);
      const hall = K.room('leitura', [I[0], I[1], I[2], r2(pv - ti / 2)]);
      const ace = K.room('acervo', [I[0], r2(pv + ti / 2), r2(s0 - ti / 2), I[3]]), vest = K.room('vestibulo', [r2(s0 + ti / 2), r2(pv + ti / 2), r2(s1 - ti / 2), I[3]]), esc = K.room('escritorio', [r2(s1 + ti / 2), r2(pv + ti / 2), I[2], I[3]]);
      const dw = 2.0, dh = 3.4; K.door(ws.frente, [L / 2, r2(B[3] - t / 2)], dw, dh, 'portal'); R.doorD = { u: L / 2, w: dw, y0: Hp, y1: r2(Hp + dh) };
      // (from the vestibule: the hall's portal on the axis, the chambers' doors at either hand)
      const pw = K.wall([I[0], pv], [I[2], pv], ti, Hw, 'parede'); K.door(pw, [L / 2, pv], 1.8, 3.2, 'portal');
      for (const x of [s0, s1]) { const w = K.wall([x, r2(pv + ti / 2)], [x, I[3]], ti, Hw, 'divisoria'); K.door(w, [x, r2((pv + ti / 2 + I[3]) / 2)], 1.0, DOOR_H, 'porta'); }
      // (the slits high under the roof)
      K.wins(ws.fundo, 'u', I[0], I[2], 2.6, 1.0, 0.6, r2(Hw - 1.4)); K.wins(ws.esquerda, 'v', I[1], I[3], 2.4, 1.0, 0.6, r2(Hw - 1.4)); K.wins(ws.direita, 'v', I[1], I[3], 2.4, 1.0, 0.6, r2(Hw - 1.4));
      // the hall's four papyrus columns, either side of the way to the image
      for (const du of [-1.35, 1.35]) for (const v of [r2(I[1] + 1.9), r2(pv - ti / 2 - 1.5)]) { const u = r2(L / 2 + du); K.solid(hall, [u - 0.4, v - 0.4, u + 0.4, v + 0.4], Hw, 'papiro', { rc: 0.4, inner: 1 }); }
      // the porch along the block's front, six papyrus columns; the court, its pool at the left, its palms at the right
      const P1 = r2(B[3] + pd); R.annexes.push({ r: [B[0], B[3], B[2], P1], h: Hc, fn: 'portico' });
      K.colLine([B[2], r2(P1 - rc)], [B[0], r2(P1 - rc)], K.evenly(B[2] - B[0] - 2 * K.ft, rc, 6).map(x => r2(x + K.ft)), rc, Hc, { porch: 1 });
      const por = K.room('portico', [r2(B[0] + K.ft), B[3], r2(B[2] - K.ft), r2(P1 - 2 * rc)]);
      const court = K.room('patio', [r2(B[0] + K.ft), P1, r2(B[2] - K.ft), r2(Vp - K.ft)], { open: 1 });
      K.solid(court, [2.0, r2(P1 + 0.8), 5.8, r2(P1 + 2.3)], 0.35, 'tanque');
      for (const u of [10.6, 13.4]) { const v = r2(P1 + 1.3); K.solid(court, [u - 0.3, v - 0.3, u + 0.3, v + 0.3], 6.0, 'palmeira'); }
      Object.assign(R, { hall, read: [hall], shelf: [ace, hall], desk: [esc], image: hall, porch: por, courtRoom: court, wait: [por, court], aisle: 1.8 });
      // the two painted bands and the cornice of the hall; the slab over the porch; the cornice of the court's wall, the sun over its gate
      const top = r2(Hp + Hw), yc = r2(Hp + Hy), Pe = [B[0], B[3], B[2], r2(P1 + 0.1)];
      R.deco.push({ k: 'faixa', r: B.slice(), y0: r2(top - 1.3), y1: r2(top - 0.7), cor: 'trim' }, { k: 'faixa', r: B.slice(), y0: r2(top - 0.7), y1: r2(top - 0.25), cor: 'trim2' },
        bloco([B[0] - 0.15, B[1] - 0.15, B[2] + 0.15, B[3] + 0.15], top, r2(top + 0.45), ['top', 'top', 'top'], { mat: 'slab' }),
        bloco(Pe, r2(Hp + Hc), r2(Hp + Hc + 0.45), ['top', 'top', 'top'], { mat: 'slab' }), { k: 'faixa', r: Pe, y0: r2(Hp + Hc + 0.08), y1: r2(Hp + Hc + 0.3), cor: 'trim' },
        { k: 'disco', na: 'frente', u: L / 2, v: r2(Vp + 0.02), y: r2(Hp + gh + 0.35), r: 0.22, cor: '#f2c14e' });
      // (the gate's two jambs, higher than the court's wall, on its line; the lintel between them over the gate, their cornice)
      { const g0 = r2(L / 2 - gw / 2), g1 = r2(L / 2 + gw / 2), v0 = r2(Vp - K.ft), jw = 1.2, yj = r2(Hp + gh + 0.9);
        for (const [a, b] of [[r2(g0 - jw), g0], [g1, r2(g1 + jw)]]) R.deco.push(bloco([a, v0, b, Vp], yc, yj, WALL, { mat: 'parede' }));
        R.deco.push(bloco([g0, v0, g1, Vp], r2(Hp + gh), yj, WALL, { mat: 'parede' }), bloco([r2(g0 - jw - 0.12), r2(v0 - 0.12), r2(g1 + jw + 0.12), r2(Vp + 0.12)], yj, r2(yj + 0.35), ['top', 'top', 'top'], { mat: 'slab' })); }
      R.roof = { kind: 'plano', h: 0, over: 0 }; R.mat = 'adobe-caiado'; R.pave = '#e8dcb4';
      return K.done();
    }
    if (AZ) {
      // ---- the Aztec's amoxcalli: on its platform, the patio behind the parapet; the porch of pillars; the painters' hall across
      // the front, the house of the codices and the master's room behind it ----
      const K = kit(st, n, LIB, { Hp: 1.0, td: 0.3, sw: 4.0 }); const { R, L, Hp, Vp } = K;
      const t = 0.5, ti = 0.3, Hw = 4.6, Hc = 3.4, pd = 2.2, rc = 0.35;
      const B = [0.6, 0.6, r2(L - 0.6), 10.4]; const ws = K.block(B, t, Hw);
      K.precinct([B[0], B[3], B[2], Vp], 1.0, false, { k: 'vao', w: R.sw });
      const I = [B[0] + t, B[1] + t, B[2] - t, B[3] - t]; const pv = r2(I[1] + 2.6 + ti / 2), sx = r2(L / 2 + 1.4);
      const ace = K.room('acervo', [I[0], I[1], r2(sx - ti / 2), r2(pv - ti / 2)]), esc = K.room('escritorio', [r2(sx + ti / 2), I[1], I[2], r2(pv - ti / 2)]);
      const hall = K.room('leitura', [I[0], r2(pv + ti / 2), I[2], I[3]]);
      const pw = K.wall([I[0], pv], [I[2], pv], ti, Hw, 'parede');
      for (const id of [ace, esc]) { const r = R.rooms[id].r; K.door(pw, [r2((r[0] + r[2]) / 2), pv], 1.2, DOOR_H, 'porta'); }
      K.wall([sx, I[1]], [sx, r2(pv - ti / 2)], ti, Hw, 'divisoria');
      // (the doorway from the porch into the hall, a window at either hand of it)
      const dw = 1.8, dh = 3.0, fy = r2(B[3] - t / 2); K.door(ws.frente, [L / 2, fy], dw, dh, 'portal'); R.doorD = { u: L / 2, w: dw, y0: Hp, y1: r2(Hp + dh) };
      for (const s of [-1, 1]) K.win(ws.frente, [r2(L / 2 + s * 4.4), fy], 1.0, 1.2, 1.5);
      K.wins(ws.fundo, 'u', I[0], I[2], 3.2, 0.9, 0.9, 2.4); K.wins(ws.esquerda, 'v', I[1], I[3], 2.8, 0.9, 0.9, 2.4); K.wins(ws.direita, 'v', I[1], I[3], 2.8, 0.9, 0.9, 2.4);
      const P1 = r2(B[3] + pd); R.annexes.push({ r: [B[0], B[3], B[2], P1], h: Hc, fn: 'portico' });
      K.colLine([B[2], r2(P1 - rc)], [B[0], r2(P1 - rc)], K.evenly(B[2] - B[0] - 2 * K.ft, rc, 6).map(x => r2(x + K.ft)), rc, Hc, { porch: 1 });
      const por = K.room('portico', [r2(B[0] + K.ft), B[3], r2(B[2] - K.ft), r2(P1 - 2 * rc)]);
      const court = K.room('patio', [r2(B[0] + K.ft), P1, r2(B[2] - K.ft), r2(Vp - 0.1)], { open: 1 });
      // (the braziers either side of where the flight comes up; the carved stone of the patio)
      for (const s of [-1, 1]) { const u = r2(L / 2 + s * (R.sw / 2 + 1.2)), v = r2(Vp - 0.9); K.solid(court, [u - 0.35, v - 0.35, u + 0.35, v + 0.35], 1.0, 'braseiro'); }
      { const u = r2(L / 2 - 5.6), v = r2(P1 + 1.0); K.solid(court, [u - 0.5, v - 0.35, u + 0.5, v + 0.35], 1.3, 'pedra'); }
      Object.assign(R, { hall, read: [hall], shelf: [ace, hall], desk: [esc], image: -1, porch: por, courtRoom: court, wait: [por, court] });
      // the platform's painted band; the hall's two bands, its parapet and its crest; the slab of the porch and its merlons
      const top = r2(Hp + Hw), Pe = [B[0], B[3], B[2], r2(P1 + 0.1)], yp = r2(Hp + Hc);
      R.deco.push({ k: 'faixa', r: R.podium.slice(), y0: r2(Hp - 0.45), y1: r2(Hp - 0.15), cor: 'trim' },
        { k: 'faixa', r: B.slice(), y0: r2(top - 1.3), y1: r2(top - 0.7), cor: 'trim' }, { k: 'faixa', r: B.slice(), y0: r2(top - 0.6), y1: r2(top - 0.2), cor: 'trim2' },
        bloco([B[0] - 0.1, B[1] - 0.1, B[2] + 0.1, B[3] + 0.1], top, r2(top + 0.4), PAR, { mat: 'slab' }),
        bloco([r2(L / 2 - 3.2), r2((B[1] + B[3]) / 2 - 0.2), r2(L / 2 + 3.2), r2((B[1] + B[3]) / 2 + 0.2)], r2(top + 0.4), r2(top + 2.2), ['trim', 'trim', 'trim'], { crista: true }),
        bloco(Pe, yp, r2(yp + 0.5), PAR, { mat: 'slab' }), { k: 'faixa', r: Pe, y0: r2(yp + 0.1), y1: r2(yp + 0.38), cor: 'trim2' });
      for (let q = 0; q < 9; q++) { const u = r2(B[0] + 0.5 + q * (B[2] - B[0] - 1.6) / 8); R.deco.push(bloco([u, r2(P1 - 0.25), r2(u + 0.6), r2(P1 + 0.1)], r2(yp + 0.5), r2(yp + 1.1), ['wl', 'wr', 'wl'])); }
      for (const s of [-1, 1]) R.deco.push(bloco(s < 0 ? [r2(R.su0 - 0.5), Vp, R.su0, r2(L - R.e)] : [R.su1, Vp, r2(R.su1 + 0.5), r2(L - R.e)], 0, r2(Hp + 0.25), BASE, { mat: 'base' })); // (the ramps at the flight's sides)
      R.roof = { kind: 'plano', h: 0, over: 0 }; R.mat = 'adobe-estuque'; R.pave = '#e0d6c0';
      return K.done();
    }
    if (NO) {
      // ---- the Norse's hall of the skald: the long hall of planks under the turf, the hearth in its middle; the rune master's
      // room and the store of the staves at its back; the garth in its palisade, the rune stones at its sides ----
      const K = kit(st, n, LIB, { Hp: 0.5, td: 0.45, sw: 3.0 }); const { R, L, Hp, Vp } = K;
      const t = 0.35, ti = 0.2, Hw = 4.4, Hg = 2.8, g = 1.4, rs = 0.15;
      const Y = [R.e, R.e, r2(L - R.e), Vp], Yi = [r2(Y[0] + K.ft), r2(Y[1] + K.ft), r2(Y[2] - K.ft), r2(Y[3] - K.ft)];
      const B = [2.4, r2(Yi[1] + 0.5), r2(L - 2.4), 11.5]; const ws = K.block(B, t, Hw); R.Hg = Hg;
      K.precinct(Y, 2.0, true, { k: 'portao', w: 1.8, h: 2.5 });
      const I = [B[0] + t, B[1] + t, B[2] - t, B[3] - t]; const pv = r2(I[1] + 2.6 + ti / 2);
      const ace = K.room('acervo', [I[0], I[1], r2(L / 2 - ti / 2), r2(pv - ti / 2)]), esc = K.room('escritorio', [r2(L / 2 + ti / 2), I[1], I[2], r2(pv - ti / 2)]);
      const hall = K.room('leitura', [I[0], r2(pv + ti / 2), I[2], I[3]]);
      const pw = K.wall([I[0], pv], [I[2], pv], ti, Hw, 'parede');
      for (const id of [ace, esc]) { const r = R.rooms[id].r; K.door(pw, [r2((r[0] + r[2]) / 2), pv], 1.0, DOOR_H, 'porta'); }
      K.wall([L / 2, I[1]], [L / 2, r2(pv - ti / 2)], ti, Hw, 'divisoria');
      const dw = 1.6, dh = 2.8; K.door(ws.frente, [L / 2, r2(B[3] - t / 2)], dw, dh, 'portal'); R.doorD = { u: L / 2, w: dw, y0: Hp, y1: r2(Hp + dh) };
      K.wins(ws.esquerda, 'v', I[1], I[3], 2.6, 0.7, 0.7, r2(Hw - 1.5)); K.wins(ws.direita, 'v', I[1], I[3], 2.6, 0.7, 0.7, r2(Hw - 1.5));
      // the hall's two rows of posts, the hearth between them in the hall's middle
      { const vm = r2((pv + ti / 2 + I[3]) / 2); for (const s of [-1, 1]) for (const dv of [-2.0, 2.0]) { const u = r2(L / 2 + s * 1.2), v = r2(vm + dv); K.solid(hall, [u - 0.2, v - 0.2, u + 0.2, v + 0.2], Hw, 'esteio', { inner: 1 }); } }
      // the gallery across the front, its staves; the garth before it and at the hall's sides
      const A = [B[0], B[3], B[2], r2(B[3] + g)]; R.annexes.push({ r: A, h: Hg, fn: 'galeria' }); R.gal = A;
      const lf = r2(A[2] - A[0]); let m = Math.max(2, Math.round(lf / 2.0) + 1); if ((m - 1) % 2 === 0) m++;
      K.colLine([A[2], r2(A[3] - rs)], [A[0], r2(A[3] - rs)], K.evenly(lf, rs, m), rs, Hg, { stave: 1 });
      const gal = K.room('galeria', [A[0], B[3], A[2], r2(A[3] - 2 * rs)]);
      const garth = K.room('terreiro', [Yi[0], A[3], Yi[2], Yi[3]], { open: 1 });
      const sl = K.room('terreiro', [Yi[0], Yi[1], B[0], A[3]], { open: 1 }), sr = K.room('terreiro', [B[2], Yi[1], Yi[2], A[3]], { open: 1 });
      // (the rune stones down the sides, the carved posts before the gallery)
      for (const rm of [sl, sr]) { const r = R.rooms[rm].r; const u = r2((r[0] + r[2]) / 2); for (const f of [0.22, 0.5, 0.78]) { const v = r2(r[1] + (r[3] - r[1]) * f); K.solid(rm, [u - 0.35, v - 0.3, u + 0.35, v + 0.3], f === 0.5 ? 2.4 : 1.8, 'pedra', { runa: 1 }); } }
      for (const s of [-1, 1]) { const u = r2(L / 2 + s * 2.6), v = r2(A[3] + 0.9); K.solid(garth, [u - 0.18, v - 0.18, u + 0.18, v + 0.18], 3.0, 'poste'); }
      Object.assign(R, { hall, read: [hall], shelf: [ace, hall], desk: [esc], image: -1, porch: gal, courtRoom: garth, wait: [gal, garth], hearth: 1, aisle: 1.45, mu: 0.2 });
      // the band under the eaves; the skirt roof of the gallery; the steep roof of turf along the way in, its dragons
      const top = r2(Hp + Hw), rh = r2((B[2] - B[0]) * 0.42), yl = r2(Hp + Hg), yh = r2(Hp + Hg + 0.9);
      R.deco.push({ k: 'faixa', r: B.slice(), y0: r2(top - 0.5), y1: r2(top - 0.15), cor: 'trim' },
        { k: 'pano', p: [[A[0], A[3], yl], [A[2], A[3], yl], [B[2], B[3], yh], [B[0], B[3], yh]], cor: 'shingle0', mat: 'shingle' },
        { k: 'telhado', r: [r2(B[0] - 0.3), r2(B[1] - 0.3), r2(B[2] + 0.3), r2(B[3] + 0.3)], y0: top, y1: r2(top + rh), ao: 'v', ov: 0.3, cor: ROOF, mat: 'turf' });
      for (const [v, dir] of [[r2(B[3] + 0.5), 1], [r2(B[1] - 0.5), -1]]) R.deco.push({ k: 'dragao', p: [L / 2, v, r2(top + rh)], dir, ao: 'v', cor: '#3a2616' });
      R.roof = under('turfa', 'v', rh, (B[2] - B[0]) / 2, (B[2] - B[0]) / 2 + 0.6, 0.1); R.mat = 'tabua'; R.pave = '#86a84e';
      return K.done();
    }
    // ---- the classical people's house of the tablets: behind the walled court — the clay's basin, the tree —, the porch of
    // posts; the hall of the benches at the left, the room of the shelves and the master's at the right ----
    const K = kit(st, n, LIB, { Hp: 0.5, sw: 3.2 }); const { R, L, Hp, Vp } = K;
    const t = 0.45, ti = 0.3, Hw = 4.2, Hc = 2.9, pd = 2.0, rc = 0.16, Hy = 2.4;
    const B = [0.6, 0.6, r2(L - 0.6), 8.6]; const ws = K.block(B, t, Hw);
    K.precinct([B[0], B[3], B[2], Vp], Hy, false, { k: 'portao', w: 1.8, h: 2.2 });
    const I = [B[0] + t, B[1] + t, B[2] - t, B[3] - t]; const sx = 10.75, sv = r2(I[1] + 3.2 + ti / 2), fy = r2(B[3] - t / 2);
    const hall = K.room('leitura', [I[0], I[1], r2(sx - ti / 2), I[3]]);
    const ace = K.room('acervo', [r2(sx + ti / 2), I[1], I[2], r2(sv - ti / 2)]), esc = K.room('escritorio', [r2(sx + ti / 2), r2(sv + ti / 2), I[2], I[3]]);
    const hu = r2((I[0] + sx - ti / 2) / 2), eu = r2((sx + ti / 2 + I[2]) / 2);
    const dw = 1.6, dh = 2.8; K.door(ws.frente, [hu, fy], dw, dh, 'portal'); R.doorD = { u: hu, w: dw, y0: Hp, y1: r2(Hp + dh) };
    K.door(ws.frente, [eu, fy], 1.0, DOOR_H, 'porta');
    const pw = K.wall([sx, I[1]], [sx, I[3]], ti, Hw, 'parede');
    K.door(pw, [sx, r2(sv - ti / 2 - 0.6)], 1.0, DOOR_H, 'porta'); K.door(pw, [sx, r2(sv + ti / 2 + 0.6)], 1.0, DOOR_H, 'porta'); // (both by the hall's middle, between its rows)
    K.wall([r2(sx + ti / 2), sv], [I[2], sv], ti, Hw, 'divisoria');
    K.wins(ws.fundo, 'u', I[0], I[2], 2.6, 0.9, 1.0, 2.2); K.wins(ws.esquerda, 'v', I[1], I[3], 2.4, 0.9, 1.0, 2.2); K.wins(ws.direita, 'v', I[1], I[3], 2.4, 0.9, 1.0, 2.2);
    const P1 = r2(B[3] + pd); R.annexes.push({ r: [B[0], B[3], B[2], P1], h: Hc, fn: 'portico' });
    K.colLine([B[2], r2(P1 - rc)], [B[0], r2(P1 - rc)], K.evenly(B[2] - B[0] - 2 * K.ft, rc, 7).map(x => r2(x + K.ft)), rc, Hc, { porch: 1, wood: 1 });
    const por = K.room('portico', [r2(B[0] + K.ft), B[3], r2(B[2] - K.ft), r2(P1 - 2 * rc)]);
    const court = K.room('patio', [r2(B[0] + K.ft), P1, r2(B[2] - K.ft), r2(Vp - K.ft)], { open: 1 });
    K.solid(court, [11.3, r2(P1 + 0.9), 12.7, r2(P1 + 2.3)], 0.6, 'tina');
    { const u = 3.4, v = r2(P1 + 1.9); K.solid(court, [u - 0.3, v - 0.3, u + 0.3, v + 0.3], 5.0, 'cipreste'); }
    Object.assign(R, { hall, read: [hall], shelf: [ace, hall], desk: [esc], image: -1, porch: por, courtRoom: court, wait: [por, court], mv0: 0.35 });
    // the roof of tiles along the front, steep; the porch's lean-to of boards; the coping of the court's wall
    const top = r2(Hp + Hw), rh = 3.0, Te = [r2(B[0] - 0.1), r2(B[1] - 0.1), r2(B[2] + 0.1), r2(B[3] + 0.1)], yl = r2(Hp + Hc), yh = r2(Hp + Hc + 0.7);
    R.deco.push({ k: 'faixa', r: B.slice(), y0: r2(top - 0.4), y1: r2(top - 0.1), cor: 'trim' },
      { k: 'telhado', r: Te, y0: top, y1: r2(top + rh), ao: 'u', ov: 0.3, cor: ROOF },
      { k: 'pano', p: [[B[0], r2(P1 + 0.2), yl], [B[2], r2(P1 + 0.2), yl], [B[2], B[3], yh], [B[0], B[3], yh]], cor: 'roof1', mat: 'plankH' },
      { k: 'placa', v: r2(B[3] + 0.02), u: hu, w: 1.6, y0: r2(Hp + dh + 0.25), y1: r2(Hp + dh + 0.75), cor: '#e8d8a8' });
    R.roof = under('duas-aguas', 'u', rh, (B[3] - B[1]) / 2, (Te[3] - Te[1]) / 2 + 0.3, 0.1); R.mat = 'adobe-caiado'; R.pave = '#d8cdb4';
    return K.done();
  }
  Fo.riscoBiblioteca = riscoBiblioteca; // (for the proofs)
  for (const st of ['grego', 'romano', 'egipcio', 'nordico', 'asteca', 'classico']) Fo.def('biblioteca', st, formOf(riscoBiblioteca)(st), [4]);
  Fo.saber = { kit, paint, formOf, under }; // (the kit, for the other buildings of this file's kind)
})(window.G = window.G || {});
