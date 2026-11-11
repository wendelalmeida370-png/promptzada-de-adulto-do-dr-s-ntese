'use strict';
// ============================================================
//  The great baths by their form (D-106, D-183; T-784): the
//  thermae of five tiles and the great thermae of seven — js/
//  forma-termas.js, riscoTermas — laid out from the risk their
//  form keeps (the podium's element: e.risco), as the temple and
//  the palace of the bigger steps are (int-palacio.js). No dice:
//  the risk fixes every wall, room, pool and peg — one thermae,
//  one plan. In the form's family of the baths (forma.banhos),
//  where the form of that size is the people's (In.formSized).
// ============================================================
(function (G) {
  const In = G.Interiors; if (!In || !In.formSized || !In.riskLayer || !In.riskOf) return;
  const r2 = x => Math.round(x * 100) / 100;
  const FM = { form: 1 }; // (a piece the form draws: the plan only keeps the feet off it, or uses it where it stands)
  // (where one stands to use a piece — to go down into a pool, to feed the furnace —, a body's room kept clear of what is laid
  // after it: the plan walks by its cells, the body by its round)
  const keepStand = (P, it, uses) => { for (const sp of P.spotsOf(it)) if (!sp.on && (!uses || uses.includes(sp.use))) P.zones.push({ lv: it.lv, r: [r2(sp.u - 0.35), r2(sp.v - 0.35), r2(sp.u + 0.35), r2(sp.v + 0.35)] }); return it; };
  // Its shell: the block of the baths on the podium — a solid base, the floor its top —, its four walls and their high windows,
  // the portal; the palaestra before it its yard, open to the sky — its low wall, the gate of no height where the flight comes
  // up, the street's way in —; the portico along the block's front an annex, its columns where the form stands them, every bay
  // a way through; the flight on the form's own treads. Its inside: the walls between the rooms and their ways (open arches
  // between the rooms of the bath, a leaf on the service's), the rooms the risk names; the form's pieces solid where it stands
  // them (the statues of the palaestra, the columns of the great hall); the water — each pool where the risk has it, a place to
  // go down into it kept clear (the open pools of the palaestra the form's own water) —; the furnace against the hot room's
  // wall, the stoker's place before its mouth; the pegs hung on the changing rooms' walls, where one undresses; then the
  // benches and the wood, comfort that gives way. The ceiling flat at the eaves: the form's roofs, its clerestory and its dome
  // stand over the walls' tops
  function termasByForm(P, F) {
    const R = In.riskOf(F); if (!R || !R.termas) { P.errs.push('as termas sem o risco da forma'); return; }
    P.shell = { kind: 'rect', r: R.B.slice(), t: R.t, mat: R.mat, base: R.Hp >= In.BODY.step ? 'macica' : 'pedra', baseH: R.Hp, floors: 1, eave: R.eave };
    P.roof = { kind: 'plano', along: null, h: 0, over: 0 };
    for (const l of R.levels) P.level(l.lv, l.y, l.h, l.kind, l.area);
    P.entryLv = 0;
    const Ly = In.riskLayer(P);
    for (const w of R.walls) if (w.casca) Ly.lay(w);
    for (const a of R.annexes) P.annex.push({ r: a.r.slice(), h: a.h, fn: a.fn, lv: 0, roof: 'portico' });
    for (const c of R.cols) P.colonnade(0, c.line[0], c.line[1], { at: c.at, col: r2(2 * c.rc), h: c.h, dh: c.h });
    P.yard = { r: R.yard.slice(), h: R.yardH, lv: 0 };
    P.stair('degraus', -1, 0, R.stair.slice(), 0, -1, null, { larga: R.sw >= 1.2 ? 1 : 0, treads: R.treads.map(q => ({ r: q.r.slice(), y: q.y })) });
    if (Ly.gate < 0) { P.errs.push('as termas sem a porta da rua'); return; }
    P.entrance = { door: Ly.gate, u: R.gate.u, v: R.gate.v, w: R.gate.w, lv: 0 };
    if (P.inside()) return;
    // ======== the inside ========
    for (const w of R.walls) if (!w.casca) Ly.lay(w);
    const ids = R.rooms.map(m => P.room(m.lv, m.fn, m.r, m.open));
    for (const p of R.pieces) if (!P.at('solido', 0, ids[p.room], p.r.slice(), 0, 1, { h: p.h, form: 1 })) { P.errs.push(`${p.k} da forma onde a planta não o põe (${p.r.join(', ')})`); return; }
    // the water
    for (const q of R.pools) {
      const it = P.at('piscina', 0, ids[q.room], q.r.slice(), q.f[0], q.f[1], q.open ? FM : undefined);
      if (!it) { P.errs.push(`a piscina ${q.k} onde a planta não a põe (${q.r.join(', ')})`); return; }
      keepStand(P, it, ['entrar']);
    }
    // the furnace, the stoker's
    { const q = R.fornalha; const it = P.at('fornalha-banho', 0, ids[q.room], q.r.slice(), q.f[0], q.f[1]); if (!it) { P.errs.push('a fornalha onde a planta não a põe'); return; } keepStand(P, it); }
    // the pegs, hung on the walls: they take no floor
    let pegs = 0; const D = In.ITEMS.cabide;
    for (const q of R.pegs) if (P.at('cabide', 0, ids[q.room], q.r.slice(), q.f[0], q.f[1], { niche: 1, y: D.y || 1.5, side: q.side })) pegs++;
    if (pegs < R.pegs.length) { P.errs.push(`só ${pegs} dos ${R.pegs.length} cabides`); return; }
    // the benches, the wood: comfort
    P.opt(() => { for (const q of R.seats.concat(R.extras)) P.at(q.kind, 0, ids[q.room], q.r.slice(), q.f[0], q.f[1]); });
  }
  In.formSized('banhos', termasByForm);
  // (the recipe's halls on the lot of a bigger step would be the three rooms of the village baths grown to 20 m — never what
  // the god and the 3D draw there: where the form of that size is the people's, the thermae are the form's alone, as the
  // palace of a bigger step is. The halls are other types' too: only a record of the baths is refused)
  const classic = () => (G.BDEF.banhos || {}).w || 1;
  const formOnly = rec => rec.t === 'banhos' && In.nOf(rec) !== classic() && !!(G.Forma && G.Forma.has('banhos', rec.c, In.nOf(rec)));
  for (const id of (In.TYPES.banhos && In.TYPES.banhos.fams) || []) {
    const F = In.FAMS[id]; if (!F || /^forma\./.test(id)) continue; const can0 = F.can;
    F.can = (rec, T, tr) => (formOnly(rec) ? 'as termas de um degrau maior são as da forma' : can0 ? can0(rec, T, tr) : null);
  }
})(window.G);
