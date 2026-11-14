'use strict';
// ============================================================
//  The plans of the steps of learning and of the town's
//  government (D-106, D-192; the agent B of the Bairros Vivos):
//  the grand library of 16 m, laid out from the risk its form
//  keeps (js/forma-saber.js: the platform's element, e.risco) —
//  its shell the block of its walls on the platform, its porch
//  an annex with the form's columns, the court its yard with its
//  gate where the flight comes up; inside, the walls and their
//  doors, the rooms by what each is for, the form's pieces —,
//  as the temples of the bigger steps are (int-palacio.js); then
//  the furniture by what each room is for: the reading tables in
//  their rows, two readers to a table; the shelves of the rolls
//  along the walls; the copyists' desks; the image in its niche;
//  the benches of the porch and the court. A function of the
//  record alone (rules 15 to 17): the risk fixes the rooms, the
//  rows are laid the same way, the plan's own dice only choose
//  among the places along a wall. In the form's family, where
//  the form of that size is the people's (In.formSized).
// ============================================================
(function (G) {
  const In = G.Interiors; if (!In || !In.formSized || !In.riskLayer || !In.riskOf) return;
  const r2 = x => Math.round(x * 100) / 100;
  const B = In.BODY;

  // ------------------------------ a building by its risk ------------------------------
  // (the shell and the inside of a risk of js/forma-saber.js's kit: one block on its platform, its porches, its court — the
  // temple's way, int-palacio.js templeByForm —; then the type's own furniture, furnish(P, R, ids))
  function byRisk(P, F, what, furnish) {
    const R = In.riskOf(F); if (!R) { P.errs.push(what + ' sem o risco da forma'); return; }
    P.shell = { kind: 'rect', r: R.B.slice(), t: R.t, mat: R.mat, base: R.Hp >= B.step ? 'macica' : 'pedra', baseH: R.Hp, floors: 1, eave: R.eave };
    P.roof = { kind: R.roof.kind, along: R.roof.along || null, h: R.roof.h, over: R.roof.over };
    for (const l of R.levels) P.level(l.lv, l.y, l.h, l.kind, l.area);
    P.entryLv = 0;
    const Ly = In.riskLayer(P);
    for (const w of R.walls) if (w.casca) Ly.lay(w);
    for (const a of R.annexes) P.annex.push({ r: a.r.slice(), h: a.h, fn: a.fn, lv: 0, roof: 'portico' });
    for (const c of R.cols) P.colonnade(0, c.line[0], c.line[1], { at: c.at, col: r2(2 * c.rc), h: c.wh || c.h, dh: c.h, outer: c.outer ? 1 : 0 });
    if (R.yard) P.yard = { r: R.yard.slice(), h: R.yardH, lv: 0 };
    P.stair('degraus', -1, 0, R.stair.slice(), 0, -1, null, { larga: R.sw >= 1.2 ? 1 : 0, treads: R.treads.map(q => ({ r: q.r.slice(), y: q.y })) });
    if (Ly.gate < 0) { P.errs.push(what + ' sem a porta da rua'); return; }
    P.entrance = { door: Ly.gate, u: R.gate.u, v: R.gate.v, w: R.gate.w, lv: 0 };
    if (P.inside()) return;
    // ======== the inside ========
    for (const w of R.walls) if (!w.casca) Ly.lay(w);
    const ids = R.rooms.map(m => P.room(m.lv, m.fn, m.r, m.open));
    for (const p of R.pieces) if (!P.at('solido', 0, ids[p.room], p.r.slice(), 0, 1, { h: p.h, form: 1 })) { P.errs.push(`${p.k} da forma onde a planta não o põe (${p.r.join(', ')})`); return; }
    furnish(P, R, ids);
  }
  In.byRisk = byRisk; // (for the proofs)

  // ------------------------------ the rows of tables ------------------------------
  // the tables of a room in rows across it, a reader on either long side of each (the piece's own places): the rows a body
  // and a table apart, a table's gap between two of a row; an aisle kept where the way in crosses the room (o.axis: its u);
  // clear of what stands there already (the form's columns, the hearth: o.keep, rects) — each where it fits and leaves every
  // way open (P.at), the others left out. turned: the tables along the way in, their readers at either hand — a porch's,
  // against its back wall (o.back: how far from it). → how many
  const REACH = 0.8 + B.r + 0.06; // (from a table's middle to the far side of who reads at it)
  function rows(P, kind, id, o) {
    o = o || {}; const D = In.ITEMS[kind]; const r = P.rooms[id].r; const mu = o.mu === undefined ? 0.5 : o.mu; let n = 0;
    const clear = rr => !(o.keep || []).some(q => rr[0] < q[2] + 0.05 && q[0] < rr[2] + 0.05 && rr[1] < q[3] + 0.05 && q[1] < rr[3] + 0.05);
    // (the spans across the room free of the aisle)
    let spans = [[r2(r[0] + mu), r2(r[2] - mu)]];
    if (o.axis !== undefined && o.axis > r[0] && o.axis < r[2]) { const h = o.aisle === undefined ? 0.95 : o.aisle; spans = [[spans[0][0], r2(o.axis - h)], [r2(o.axis + h), spans[0][1]]]; }
    if (o.turned) {
      const cv = r2(r[1] + (o.back === undefined ? 0.15 : o.back) + D.w / 2);
      // (between what is kept clear along the wall — the doors' fronts —: the stretches left)
      for (const q of (o.keep || []).slice().sort((a, b) => a[0] - b[0])) spans = spans.flatMap(([a, b]) => (q[2] <= a || q[0] >= b ? [[a, b]] : [[a, r2(Math.min(b, q[0]))], [r2(Math.max(a, q[2])), b]].filter(s => s[1] - s[0] > 0.1)));
      for (const [a, b] of spans) { const k = Math.floor((b - a + 0.3) / (2 * REACH + 0.3)); for (let q = 0; q < k && n < (o.max || 99); q++) { const cu = r2(a + (b - a) * (q + 0.5) / k); const rr = [r2(cu - D.d / 2), r2(cv - D.w / 2), r2(cu + D.d / 2), r2(cv + D.w / 2)]; if (clear(rr) && P.at(kind, 0, id, rr, 1, 0)) n++; } }
      return n;
    }
    const v0 = r2(r[1] + (o.mv0 === undefined ? 0.2 : o.mv0) + REACH), v1 = r2(r[3] - (o.mv1 === undefined ? 0.2 : o.mv1) - REACH); if (v1 < v0 - 1e-6) return 0;
    const nr = Math.min(o.rows || 99, Math.floor((v1 - v0) / (2 * REACH + 0.02) + 1e-6) + 1);
    for (let j = 0; j < nr; j++) {
      const cv = r2(nr > 1 ? v0 + (v1 - v0) * j / (nr - 1) : (v0 + v1) / 2);
      for (const [a, b] of spans) { const k = Math.min(o.per || 99, Math.floor((b - a + 0.5) / (D.w + 0.5))); for (let q = 0; q < k && n < (o.max || 99); q++) { const cu = r2(a + (b - a) * (q + 0.5) / k); const rr = [r2(cu - D.w / 2), r2(cv - D.d / 2), r2(cu + D.w / 2), r2(cv + D.d / 2)]; if (clear(rr) && P.at(kind, 0, id, rr, 0, 1)) n++; } }
    }
    return n;
  }
  // (as many of a piece along the walls of a room as go there, up to max: each where the plan's dice put it)
  const along = (P, kind, id, sides, max) => { let n = 0; while (n < max && P.place(kind, 0, id, sides ? { sides } : undefined)) n++; return n; };

  // ------------------------------ the grand library ------------------------------
  // Its furniture, by what the risk says each room is for (R.read: where one reads; R.shelf: where the rolls are kept; R.desk:
  // where they are copied; R.image: the niche of the image; R.wait: the porch and the court). The numbers the world reads of
  // it: the places of 'ler' — a reader each: G.Biblioteca fills them, In.freePlace —, the desks of 'escrever' — a copyist
  // each, G.Biblioteca.copistas —, the shelves (what the building keeps: G.Depot.stores)
  const LIB = { ler: 16, mesas: 8, escribas: 3, estantes: 8 }; // (the least a grand library has: twice the readers of the biggest classic one)
  In.GRANDE_BIBLIOTECA = LIB;
  function libraryFurnish(P, R, ids) {
    const L = R.L; const hall = ids[R.hall]; const keep = R.pieces.filter(p => p.inner).map(p => p.r);
    // the image in its niche, against the back wall in its middle; a lamp at either hand
    if (R.image >= 0) { const id = ids[R.image]; const im = P.place('idolo', 0, id, { sides: ['fundo'], center: true }); if (!im) { P.errs.push('sem lugar para a imagem'); return; }
      keep.push([r2(im.r[0] - 0.3), im.r[1], r2(im.r[2] + 0.3), r2(im.r[3] + 1.0)]);
      P.opt(() => { const c = (im.r[0] + im.r[2]) / 2; for (const du of [-1.2, 1.2]) P.at('lampadario', 0, id, [r2(c + du - 0.225), r2(im.r[1] + 0.1), r2(c + du + 0.225), r2(im.r[1] + 0.55)], 0, 1); }); }
    // (the hearth of the skald's hall, in its middle between the rows of posts)
    if (R.hearth) { const r = P.rooms[hall].r; const cu = r2(L / 2), cv = r2((r[1] + r[3]) / 2); const it = P.at('lar', 0, hall, [r2(cu - 0.4), r2(cv - 0.6), r2(cu + 0.4), r2(cv + 0.6)], 0, 1); if (it) keep.push([r2(it.r[0] - 0.8), r2(it.r[1] - 0.8), r2(it.r[2] + 0.8), r2(it.r[3] + 0.8)]); }
    // the copyists' desks, in the office: three at the least
    let desks = 0; for (const k of R.desk) desks += along(P, 'mesa-escriba', ids[k], null, 4 - desks);
    if (desks < LIB.escribas) { P.lack = 1; P.errs.push(`só ${desks} mesas de escriba`); return; }
    // the tables: in the reading room in rows either side of the way in, clear of the image, the columns and the hearth; under
    // a porch deep enough, along its back wall
    let tables = 0;
    for (const k of R.read) { const id = ids[k]; const m = R.rooms[k]; const r = m.r;
      if (m.fn === 'portico') { if (r[3] - r[1] >= 2.3) tables += rows(P, 'mesa-leitura', id, { turned: true, mu: 0.6, max: 4, keep: doorsOn(R, r) }); }
      else tables += rows(P, 'mesa-leitura', id, { axis: R.doorD.u, aisle: R.aisle, mu: R.mu, mv0: R.mv0 !== undefined ? R.mv0 : k === R.image ? 0.3 : 0.85, mv1: 0.25, keep, per: 2 }); }
    if (tables < LIB.mesas) { P.errs.push(`só ${tables} mesas de leitura`); return; }
    // the shelves: all round the room of the rolls, and along the walls of the others that keep them
    let shelves = 0;
    for (const k of R.shelf) { const id = ids[k]; const fn = R.rooms[k].fn; shelves += along(P, 'estante', id, fn === 'acervo' || fn === 'escritorio' ? null : fn === 'exedra' ? ['esquerda', 'direita'] : ['fundo', 'esquerda', 'direita'], fn === 'acervo' ? 10 : fn === 'leitura' ? 6 : 2); }
    if (shelves < LIB.estantes) { P.errs.push(`só ${shelves} estantes de rolos`); return; }
    // the chest of the office; the benches of the reading room's walls, of the porch and of the court
    P.opt(() => { for (const k of R.desk) if (P.place('arca', 0, ids[k])) break; });
    P.opt(() => { along(P, 'banco', hall, ['frente'], 2); });
    P.opt(() => { for (const k of R.wait) { const m = R.rooms[k]; along(P, 'banco', ids[k], m.open ? ['esquerda', 'direita'] : ['fundo'], m.open ? 2 : 3); } });
  }
  // (the doors of the block's front that open on a room before it — a porch's back wall —: the floor before each kept clear)
  function doorsOn(R, r) {
    const out = [];
    for (const w of R.walls) if (w.side === 'frente') for (const q of w.ops) if (q.k !== 'janela') out.push([r2(q.p[0] - q.w / 2 - 0.5), r[1], r2(q.p[0] + q.w / 2 + 0.5), r[3]]);
    return out;
  }
  In.formSized('biblioteca', (P, F) => byRisk(P, F, 'a grande biblioteca', libraryFurnish));
})(window.G);
