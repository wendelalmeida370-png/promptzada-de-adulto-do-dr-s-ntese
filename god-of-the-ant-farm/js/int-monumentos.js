// The plans of the monuments (P3, the Patch 2: Part 5 from the side of the space, the example C — where one watches from): the
// theatre and the wonder of each people by its form (G.Forma, D-093). What is seen is the form — the god draws it and the 3D builds it —; the
// plan lays on it only what the body and the people use, where the form has it: the rows to watch from (P.tiers, on the form's
// own rows of seats), the places to act, to play, to fight (P.marks), the benches round a hall's fire; it keeps the feet off
// what stands solid on the form's ground (a piece of no use, 'solido', at each foot: P4's square, D-093) and lets them in where
// the form opens. Built on P4's engine (B4: P.tiers, P.ringWall, P.marks, the solid base). As every plan: no chance drawn
// (every theatre of a people the same, turned to its door), nothing written in the world — the record is the Interiors'
(function (G) {
  'use strict';
  const In = G.Interiors; if (!In) return;
  const TAU = Math.PI * 2;
  const r2 = x => Math.round(x * 100) / 100;
  const FM = { form: 1 }; // (a piece the form draws: the plan only uses it — the 3D does not draw it again)

  // ------------------------------ what the form has ------------------------------
  // (the top of the form's ground under the plan's floor: its slab, its lawn — the widest low one under the middle of the lot,
  // not an alley or a court laid on it; none: the ground)
  function groundOf(F, L) {
    let y = 0, best = 0; const c = L / 2;
    for (const e of F.els) { if (e.k !== 'bloco' || e.uso || e.y0 > 1e-6 || e.y1 >= 0.15 || e.r[0] > c || e.r[2] < c || e.r[1] > c || e.r[3] < c) continue; const a = (e.r[2] - e.r[0]) * (e.r[3] - e.r[1]); if (a > best) { best = a; y = e.y1; } }
    return y;
  }
  // (the base of an open floor of a form: solid — a podium, raised: the plan's own flight up from the ground before it, and no
  // steps before its door (Space) — where the floor is a step or more over its foot, as the Egyptian granary's base up its flight;
  // lower — a pavement, a garden's lawn, a landing, a slab of a hand or two —, the ground's own: where the lot falls away to the
  // street the steps before the way in come down to it, as before a house's door (on a solid base the feet met a wall of the
  // slope's height there, up to 1.6 m in the world map: L-390)
  const openBase = y => (y >= In.BODY.step ? 'macica' : 'chao');
  // (what stands solid on the form's ground — its walls, its stage, its columns, its trees, a pool's rim — a piece of no use at
  // each foot, the biggest first: where a foot meets one already laid — two walls at a corner, a rim round a pool's floor, the
  // posts of a stall at its counter's corners — what is left of it, 5 cm off the other (two pieces of a plan keep 2 cm apart), and
  // nothing of it narrower than 5 cm: the feet and the marks kept off them all; o.skip: the feet the plan has walls of its own on;
  // o.y: of the form's floor at that height (a pyramid's top, a terrace); o.rooms: the part of each foot in each of them (the
  // strips round what stands in a floor's middle); o.list: these solids only. The form's own pieces laid already on that floor
  // (FM) — a stall, a bay, a bin — are feet laid too: a wall of a stoa beside its room is kept off it as off another solid; a
  // piece of the plan's own where the form stands solid is still an error)
  const minus = (a, b) => {
    if (a[0] >= b[2] || a[2] <= b[0] || a[1] >= b[3] || a[3] <= b[1]) return [a];
    const out = []; if (a[0] < b[0]) out.push([a[0], a[1], b[0], a[3]]); if (b[2] < a[2]) out.push([b[2], a[1], a[2], a[3]]);
    const u0 = Math.max(a[0], b[0]), u1 = Math.min(a[2], b[2]); if (a[1] < b[1]) out.push([u0, a[1], u1, b[1]]); if (b[3] < a[3]) out.push([u0, b[3], u1, a[3]]);
    return out;
  };
  // (a column's foot is its base — the vocabulary's square slab, 2.3 radii a side (js/forma.js COLUMN_BASE), as the 3D draws it
  // under the shaft —, not the shaft's round: on the cells between the two edges the plan had floor, and the body stood in the
  // base of the six columns of the Greek theatre's stage — L-494. A plan file asks the form only the plan's questions (the
  // guard, the form's rule): its half side here, and the proof — qa/monumental.js E3 — holds it to the vocabulary's)
  const COL_HALF = 1.15;
  const colOf = (F, s) => F.els.some(e => e.k === 'colunata' && Math.abs(e.r - s.r) < 1e-9 && e.pts.some(p => Math.abs(p[0] - s.c[0]) < 1e-9 && Math.abs(p[1] - s.c[1]) < 1e-9));
  function solids(P, F, room, o) {
    o = o || {}; const lv0 = P.rooms[(o.rooms || [room])[0]].lv; const feet = P.items.filter(it => it.form && it.lv === lv0 && !it.niche).map(it => it.r.slice()); const area = r => (r[2] - r[0]) * (r[3] - r[1]);
    const foot = s => { if (s.k === 'rect') return s.r; const h = colOf(F, s) ? s.r * COL_HALF : s.r; return [s.c[0] - h, s.c[1] - h, s.c[0] + h, s.c[1] + h]; };
    const off = (p, q) => minus(p, [q[0] - 0.05, q[1] - 0.05, q[2] + 0.05, q[3] + 0.05]); const big = q => q[2] - q[0] >= 0.05 && q[3] - q[1] >= 0.05;
    for (const s of (o.list || G.Forma.solids(F, o.y)).slice().sort((a, b) => area(foot(b)) - area(foot(a)))) {
      const r0 = foot(s); if (o.skip && o.skip(r0)) continue;
      for (const id of o.rooms || [room]) {
        const R = P.rooms[id].r; const r = [Math.max(r0[0], R[0]), Math.max(r0[1], R[1]), Math.min(r0[2], R[2]), Math.min(r0[3], R[3])]; if (!big(r)) continue;
        // (the pieces left of it, laid the biggest first, each kept off the ones laid before — of it too)
        const queue = [r];
        while (queue.length) {
          let parts = [queue.shift()]; for (const q of feet) parts = parts.flatMap(p => off(p, q)); parts = parts.filter(big).sort((a, b) => area(b) - area(a));
          if (!parts.length) continue; const p = parts[0].map(r2); queue.push(...parts.slice(1));
          if (!P.at('solido', P.rooms[id].lv, id, p, 0, 1, Object.assign({ h: s.y1 }, FM))) { P.errs.push(`um sólido da forma onde a planta não o põe (${p.join(', ')})`); return false; }
          feet.push(p);
        }
      }
    }
    return true;
  }
  // (the way in from the street: the shell's front edge, at v from u0 to u1 — a wall of kind 'borda', of no height, inside the
  // edge as a house's front wall is —, its opening the stretch one comes in by, a 'vao' (P4's platform's), the entrance: a
  // monument blocks the world's walk on its lot, so the body comes on to its open ground by a door, through its opening, the
  // doorstep before it the street's (Possess.onPlan); an open shell with no door has none — a square's, a fair's, the town walks
  // across. One opening, as a house has one door (L-207): of the stretches the front leaves free, the widest — of two as wide,
  // the nearer its middle. Where the lot falls away to the street each opening has its steps down to it (Space.doorFlight,
  // L-390), reckoned each on its own: the market's, between its stalls, side by side with no room before the front, all went
  // along it to the same side, and the treads of one ran under the landing of the next — up to a metre below it: the feet met
  // a ledge, climbed with the hands (L-413))
  function wayIn(P, u0, u1, v, spans) {
    const tb = 0.1; const bw = P.wall(0, [u1, v - tb / 2], [u0, v - tb / 2], tb, 0, 1, 'borda');
    const mid = (u0 + u1) / 2, wide = s => s[1] - s[0], off = s => Math.abs((s[0] + s[1]) / 2 - mid);
    const [s0, s1] = spans.reduce((q, s) => (wide(s) > wide(q) + 0.01 || (wide(s) > wide(q) - 0.01 && off(s) < off(q)) ? s : q));
    const d = P.door(bw, P.atOf(bw, [(s0 + s1) / 2, v - tb / 2]), r2(s1 - s0), In.DOOR_MIN + 0.45, -1, 'rua', 1, 'vao');
    P.entrance = { door: d, u: r2((s0 + s1) / 2), v, w: r2(s1 - s0), lv: 0 };
  }
  // (the stretches of the front edge one could come in by — the way in the widest of them, wayIn —: where nothing of the form
  // stands within the clear way a door keeps before it — 0.9 m in from its wall, 0.12 m past its ends —, each 0.9 m wide at
  // least; the lot's edge a hand off)
  function frontSpans(F, sh, y) {
    const v = sh[3]; let spans = [[sh[0] + 0.05, sh[2] - 0.05]];
    for (const s of G.Forma.solids(F, y)) {
      const r = s.k === 'rect' ? s.r : [s.c[0] - s.r, s.c[1] - s.r, s.c[0] + s.r, s.c[1] + s.r]; if (r[3] < v - 1.0) continue;
      const a = r[0] - 0.15, b = r[2] + 0.15; spans = spans.flatMap(([s0, s1]) => (b <= s0 || a >= s1 ? [[s0, s1]] : [[s0, a], [b, s1]]));
    }
    return spans.filter(([s0, s1]) => s1 - s0 >= 0.9).map(q => q.map(r2));
  }
  // (the open ground of a form one walks on: the lot less a hand at its edge, the form's ground its floor, the way in along
  // its front where the form leaves it free)
  function openGround(P, F, fn) {
    const L = P.L, m = 0.1; const sh = [m, m, L - m, L - m]; const y = groundOf(F, L);
    P.shell = { kind: 'aberta', r: sh, t: 0, mat: 'chao', base: openBase(y), baseH: y, floors: 1, eave: 0 }; P.roof = null;
    P.level(0, y, 3.0, 'chao', sh); P.entryLv = 0;
    const spans = frontSpans(F, sh); if (!spans.length) { P.errs.push('a frente da forma fechada: nenhum vão por onde entrar'); return null; }
    wayIn(P, sh[0], sh[2], sh[3], spans);
    return { sh, y, fn };
  }

  // ------------------------------ the theatre ------------------------------
  // (who acts there for a living — the actors a theatre employs, P2's trade: the type's number of jobs, else the building's
  // (G.BDEF.teatro.jobs), as the validator counts them (cap.jobs) —: a post each, a piece of the plan with its job, at the first
  // places of the stage — of the sand, to fight ('lutar') —, facing the way the place does; the places left over marks, for
  // whoever comes, the body too. A post is a place on the form's floor: no piece the form or the 3D draws (FM), no foot the
  // feet walk round. With none, the plan of a theatre that employs two was refused: «só 0 postos de trabalho» — L-421)
  In.addItems({
    cena: { name: 'Lugar de cena', w: 0, d: 0, h: 0, job: 1, spots: () => [{ use: 'atuar', a: 0, n: 0 }] },
    luta: { name: 'Lugar de luta', w: 0, d: 0, h: 0, job: 1, spots: () => [{ use: 'lutar', a: 0, n: 0 }] },
  });
  const jobsOf = P => { const T = In.TYPES[P.rec.t]; return (T && T.jobs !== undefined ? T.jobs : (G.BDEF[P.rec.t] || {}).jobs) || 0; };
  // (the places of a stage — [u, v, ry] as P.marks has them —: the posts first, then the marks; one stands at a post facing away
  // from its front, the piece turned so: ry the way one faces)
  function stage(P, lv, room, use, pts, o) {
    const n = Math.min(jobsOf(P), pts.length);
    for (const [u, v, ry] of pts.slice(0, n)) {
      if (P.at(use === 'lutar' ? 'luta' : 'cena', lv, room, [u, v, u, v].map(r2), -Math.round(Math.sin(ry)), -Math.round(Math.cos(ry)), FM)) continue;
      P.errs.push(`o posto de quem ${use === 'lutar' ? 'luta' : 'atua'} onde a planta não o põe (${r2(u)}, ${r2(v)})`); return;
    }
    if (pts.length > n) P.marks(lv, room, use, pts.slice(n), o);
  }
  // the Greek's and the classical people's (the form's half bowl, D-084: the rows of a real one, 0.70 m deep and 0.40 m up):
  // the rows of seats where the form has them — each ring of the form a block of P.tiers, the whole ones round the back half,
  // the outer ones cut where they would leave the lot —, four aisles up through them all (the kerkides: half a row at a step,
  // the five wedges between them the seats), the places to act in the orchestra, facing the rows; the stage building and its
  // columns solid. One walks in from the front, round the stage's ends (the parodoi)
  function halfBowl(P, F) {
    const g = openGround(P, F, 'teatro'); const y = g.y;
    // (each ring of seats of the form: its rows from the inside out — the form lists them from the outside in —, its arc; its
    // aisles the form's stairways, which the 3D draws as steps: one rule, L-493)
    for (const e of F.els.filter(q => q.k === 'cavea')) {
      const A = e.aneis.slice().reverse(); const n = A.length; const rise = n > 1 ? A[1][1] - A[0][1] : 0.4; const tread = (A[n - 1][0] - e.fundo) / n;
      const arc = e.arco || [0, TAU]; const E = e.escadas || { a: [], l: 1.0 };
      P.tiers(0, null, { ring: [e.c[0], e.c[1], e.fundo, A[n - 1][0]], arc, dir: 'out', rows: n, rise, tread, first: r2(A[0][1] - y), aisles: E.a, aisleW: E.l, climb: E.n });
    }
    if (P.inside()) return;
    const id = P.room(0, 'teatro', g.sh, 1);
    if (!solids(P, F, id)) return;
    // (who acts: in the orchestra, before its middle, facing the rows — three abreast)
    const o = F.els.find(e => e.k === 'arena'); if (!o) { P.errs.push('a forma do teatro sem orquestra'); return; }
    const [cu, cv] = o.c; stage(P, 0, id, 'atuar', [[cu, cv + 0.3, Math.PI], [cu - 1.0, cv + 0.6, Math.PI], [cu + 1.0, cv + 0.6, Math.PI]]);
  }
  // the Egyptian's sacred garden: its lawn, the pool in its stone rim, the palms, the sphinx, the walls at the back and the left
  // — all solid, as the form has them —; who performs the rite at the pool's front (atuar), and round it those who watch it,
  // standing on the lawn, facing the water
  function garden(P, F) {
    const g = openGround(P, F, 'jardim'); if (P.inside()) return;
    const id = P.room(0, 'jardim', g.sh, 1); if (!solids(P, F, id)) return;
    const rim = F.els.filter(e => e.k === 'bloco' && e.y1 > 0.3 && e.y1 < 1.0); if (!rim.length) { P.errs.push('a forma do jardim sem o tanque'); return; }
    const R = rim.reduce((a, e) => [Math.min(a[0], e.r[0]), Math.min(a[1], e.r[1]), Math.max(a[2], e.r[2]), Math.max(a[3], e.r[3])], [Infinity, Infinity, -Infinity, -Infinity]);
    const cu = (R[0] + R[2]) / 2, cv = (R[1] + R[3]) / 2;
    stage(P, 0, id, 'atuar', jobsOf(P) > 1 ? [[cu - 0.5, R[3] + 0.6, Math.PI], [cu + 0.5, R[3] + 0.6, Math.PI]] : [[cu, R[3] + 0.6, Math.PI]]); // (two side by side where two act)
    const watch = []; for (const du of [-2.4, -1.2, 1.2, 2.4]) watch.push([cu + du, R[3] + 1.6, Math.PI]);
    for (const s of [-1, 1]) watch.push([s < 0 ? R[0] - 0.7 : R[2] + 0.7, cv, s < 0 ? Math.PI / 2 : -Math.PI / 2]);
    P.marks(0, id, 'assistir', watch, { st: 'idle' });
  }
  // the Aztec's ball court: the two walls with their sloping benches — solid to the feet —, the alley between them where the
  // players play (atuar), and at its two open ends those who watch, standing, facing up the alley
  function ballCourt(P, F) {
    const g = openGround(P, F, 'campo'); if (P.inside()) return;
    const id = P.room(0, 'campo', g.sh, 1); if (!solids(P, F, id)) return;
    const walls = F.els.filter(e => e.k === 'talude'); if (walls.length < 2) { P.errs.push('a forma do campo sem os muros'); return; }
    const u0 = Math.min(...walls.map(e => e.r[0])), u1 = Math.max(...walls.map(e => e.r[2])); const v0 = Math.max(...walls.filter(e => e.r[3] < P.L / 2).map(e => e.r[3])), v1 = Math.min(...walls.filter(e => e.r[1] > P.L / 2).map(e => e.r[1]));
    const cv = (v0 + v1) / 2, cu = (u0 + u1) / 2;
    stage(P, 0, id, 'atuar', [[cu - 1.6, cv, Math.PI / 2], [cu + 1.6, cv, -Math.PI / 2], [cu - 3.2, cv, Math.PI / 2], [cu + 3.2, cv, -Math.PI / 2]]);
    const watch = []; for (const [u, f] of [[u0 - 0.5, Math.PI / 2], [u1 + 0.5, -Math.PI / 2]]) for (const dv of [-0.5, 0.5]) watch.push([u, cv + dv, f]);
    P.marks(0, id, 'assistir', watch, { st: 'idle' });
  }
  // the Norse's mead hall: the form's longhouse — its walls of planks at the form's foot, its floor on the footing, the door, the
  // turf over it —; inside, the long hearth in the middle, the benches along the long walls where one sits to hear the skald,
  // who stands by the fire (atuar)
  // (a hall the form's body is: its walls of planks at the form's foot, its floor on its base, its door, the form's roof over
  // it; the form's steps from the street up to the base one flight on their own treads, as P4's hall by the form has them →
  // { id, I } — the hall and its inside —, or null)
  function hallOf(P, F, fn) {
    const B = G.Forma.body(F); if (!B || !B.porta) { P.errs.push('a forma do salão sem corpo'); return null; }
    const tr = P.tr; const t = Math.min(tr.t || 0.3, 0.35), c = t / 2; const sh = B.r.slice(); const y0 = B.y0, h0 = B.y1 - B.y0;
    P.shell = { kind: 'rect', r: sh, t, mat: 'tabua', base: 'macica', baseH: y0, floors: 1, eave: B.y1 };
    const T = B.telhado; P.roof = { kind: T.tipo, along: T.ao || null, h: r2(T.y1 - T.y0), over: T.ov || 0 }; P.roofGeo = { kind: T.tipo, along: T.ao || null, eave: T.y0, rise: T.y1 - T.y0, R: T.r.slice() };
    const I = P.inner(); P.level(0, y0, h0, 'piso', I); P.entryLv = 0;
    P.outer = P.walls4(0, [sh[0] + c, sh[1] + c, sh[2] - c, sh[3] - c], t, h0, 1, 'parede'); P.outers = [P.outer];
    const fw = P.outer.frente; const d0 = P.door(fw, P.atOf(fw, [B.porta.u, sh[3] - c]), B.porta.w, Math.min(h0 - 0.1, B.porta.y1 - B.porta.y0), -1, 'rua', 1, 'porta');
    P.entrance = { door: d0, u: B.porta.u, v: sh[3], w: B.porta.w, lv: 0 };
    if (B.degraus.length) {
      let r = B.degraus[0].r.slice(); for (const q of B.degraus) r = [Math.min(r[0], q.r[0]), Math.min(r[1], q.r[1]), Math.max(r[2], q.r[2]), Math.max(r[3], q.r[3])];
      const treads = B.degraus.map(q => ({ r: q.r.slice(), y: q.y1 })); if (r[1] > sh[3] + 1e-6) { treads.push({ r: [r[0], sh[3], r[2], r[1]], y: y0 }); r[1] = sh[3]; }
      P.stair('degraus', -1, 0, r, 0, -1, null, { larga: r[2] - r[0] >= 1.2 ? 1 : 0, treads });
    }
    if (P.inside()) return null;
    return { id: P.room(0, fn, I), I };
  }
  function meadHall(P, F) {
    const h = hallOf(P, F, 'salao'); if (!h) return; const { id, I } = h;
    const fire = P.at('lar', 0, id, [(I[0] + I[2]) / 2 - 0.6, (I[1] + I[3]) / 2 - 0.4, (I[0] + I[2]) / 2 + 0.6, (I[1] + I[3]) / 2 + 0.4], 0, 1);
    if (!fire) { P.errs.push('sem lugar para o fogo do salão'); return; }
    let n = 0; for (const s of ['fundo', 'frente']) for (let k = 0; k < 4; k++) if (P.place('banco', 0, id, { sides: [s] })) n++;
    if (n < 4) { P.errs.push(`só ${n} bancos no salão do hidromel`); return; }
    const fu = (fire.r[0] + fire.r[2]) / 2, fv = (I[1] + I[3]) / 2; stage(P, 0, id, 'atuar', [[fu - 1.4, fv, Math.PI / 2]].concat(jobsOf(P) > 1 ? [[fu + 1.4, fv, -Math.PI / 2]] : [])); // (and at its other end where two act)
  }
  // the Roman's arena — and the Colosseum, by the same form (amphi: D-095): the way in from the street through the arch of the
  // drum before it, the passage through the substructure, the flight of the undercroft up through the hatch into the arena;
  // on the sand, the places to fight, two and two beside the hatch; the two steps up to the podium, the first balcony, and on
  // it, standing at its parapet, the places to watch from, facing the arena. The walk only on the floors the form lays — the
  // passage, the sand, the podium's walk —, the parapet a wall (open where the steps come up); the balconies over it are seen,
  // not walked: no floor of the plan there
  function amphitheatre(P, F) {
    const A = F.amphi; if (!A) { P.errs.push('a forma do anfiteatro sem os seus números'); return; }
    if (A.oval) { coliseu(P, F, A.oval); return; } // (the Colosseum of a capital, the split oval: D-107)
    const L = P.L, m = 0.1; const sh = [m, m, L - m, L - m]; const [cu, cv] = A.c; const hw = A.aw / 2; const ro = A.fundo + A.tr1;
    P.shell = { kind: 'aberta', r: sh, t: 0, mat: 'chao', base: 'chao', floors: 1, eave: 0 }; P.roof = null;
    // (the storeys: the ground — the passage, the undercroft —, the sand, the podium)
    P.level(0, 0, A.ya, 'chao', sh); P.entryLv = 0;
    P.level(1, A.ya, A.yb - A.ya, 'arena', [cu - A.fundo, cv - A.fundo, cu + A.fundo, cv + A.fundo]);
    P.level(2, A.yb, 2.6, 'sacada', [cu - ro, cv - ro, cu + ro, cv + ro]);
    wayIn(P, cu - hw, cu + hw, sh[3], [[cu - hw, cu + hw]]); // (the arch's width)
    // (the flights: the undercroft's, its hole the hatch; the steps from the sand to the podium)
    P.stair('escada', 0, 1, A.under, 0, -1, A.hatch);
    P.stair('escada', 1, 2, A.steps, -1, 0, null);
    // (the podium's parapet: a low wall round the sand's edge, its middle line 6 cm out, open beside the steps exactly as the 3D
    // leaves it open — its 48 chords round the ring, the opening the gap's width at the ring's own radius, cut at those angles:
    // 32 pieces of which those whose middle fell in the opening were left out, round an arena of 10 m, left none out and the
    // parapet shut over the steps, L-551)
    const pr = A.fundo + 0.06, NS = 48, half = A.gap.w / 2 / A.fundo;
    for (let k = 0; k < NS; k++) {
      let parts = [[k * TAU / NS, (k + 1) * TAU / NS]];
      for (let s = -1; s <= 1; s++) { const p0 = A.gap.a - half + s * TAU, p1 = A.gap.a + half + s * TAU;
        parts = parts.flatMap(([q0, q1]) => (p1 <= q0 || p0 >= q1 ? [[q0, q1]] : [[q0, Math.max(q0, p0)], [Math.min(q1, p1), q1]].filter(([u0, u1]) => (u1 - u0) * pr > 0.01))); }
      for (const [a0, a1] of parts) P.wall(2, [r2(cu + pr * Math.cos(a0)), r2(cv + pr * Math.sin(a0))], [r2(cu + pr * Math.cos(a1)), r2(cv + pr * Math.sin(a1))], 0.12, 0.9, 0, 'parede');
    }
    if (P.inside()) return;
    // (the rooms: the passage from the street to the top of the undercroft's flight — through the arch: its width —, under the
    // drum to its outer face, and before it the way from the street to the arch, under the sky — half a metre at least, a row
    // of the plan's cells the feet reach past the edge where the way in is: the Colosseum's drum comes to 0.15 m of the lot's
    // edge, the way under its arch then —; the sand, the podium's walk)
    const vf = r2(Math.min(cv + A.face, sh[3] - 0.5));
    P.room(0, 'passagem', [cu - hw, A.under[1], cu + hw, vf], 0); P.room(0, 'passagem', [cu - hw, vf, cu + hw, sh[3]], 1);
    const ar = P.room(1, 'arena', [cu - A.fundo, cv - A.fundo, cu + A.fundo, cv + A.fundo], 1, [cu, cv, A.fundo]);
    const po = P.room(2, 'podio', [cu - ro, cv - ro, cu + ro, cv + ro], 1, [cu, cv, ro, A.fundo]);
    // (who fights: on the sand, right of the hatch, facing each other)
    const fx = cu + (A.fundo + hw) / 2; stage(P, 1, ar, 'lutar', [[fx, cv - 0.55, 0], [fx, cv + 0.55, Math.PI]], { st: 'fight' });
    // (who watches: along the podium's walk, 0.4 m from its parapet, every 0.8 m, facing the middle — standing at it —; none
    // where the steps come up)
    const rw = A.fundo + 0.12 + 0.4; const nw = Math.floor(TAU * rw / 0.8); const watch = [];
    for (let k = 0; k < nw; k++) {
      const a = (k + 0.5) * TAU / nw; if (Math.abs(((a - A.gap.a) % TAU + TAU + Math.PI) % TAU - Math.PI) * rw < A.gap.w / 2 + 0.5) continue;
      watch.push([cu + rw * Math.cos(a), cv + rw * Math.sin(a), Math.atan2(-Math.cos(a), -Math.sin(a))]);
    }
    P.marks(2, po, 'assistir', watch, { st: 'idle' });
  }
  // the Colosseum of a capital (the steps of 10 and 13 tiles, js/forma-espetaculo.js — D-107): its plan the form's split oval.
  // Three storeys: the ground — the square round it, the four passages through it on its axes (their walls the ends of the
  // rows either side), and under the sand the undercroft, its long corridor in from the right passage and the cross one, the
  // cages behind their walls (seen, not gone into) —; the sand; the podium and the rows over it. The way in from the street at
  // the lot's front, across the square to any of the four arches; from the front and the back passages the flight up to the
  // podium's landing, from the left one the flight up to the gate of the sand, from the undercroft the flight up through the
  // hatch. On the podium, standing at its parapet, the places to watch from; the rows of each wedge of the oval a block of
  // P.tiers (an aisle up its middle, two steps a row), on the form's rings; on the sand, the places to fight. The walk only where
  // the form has floor: each storey's rooms are rectangles of the lot, and what they hold that is no floor of the form — the
  // facade, the solid under the rows, the sand's quarters on the podium's storey, the lot's corners on the rows' — is shut in
  // by walls where the form has its faces (the facade's, the podium's, the ends of the rows), and never reached
  function coliseu(P, F, O) {
    const L = P.L, m = 0.1; const sh = [m, m, L - m, L - m];
    const { cu, cv, g, h, Au, Bv, ya, yb, dp } = O; const hg = g / 2, hh = h / 2, W = O.ways; const wt = 0.2; const y0 = groundOf(F, L); // (the square's top)
    P.shell = { kind: 'aberta', r: sh, t: 0, mat: 'chao', base: openBase(y0), baseH: y0, floors: 1, eave: 0 }; P.roof = null;
    P.level(0, y0, ya - y0, 'chao', sh); P.entryLv = 0;
    P.level(1, ya, yb - ya, 'arena', [cu - Au, cv - Bv, cu + Au, cv + Bv]);
    P.level(2, yb, 2.6, 'sacada', [cu - Au - O.D, cv - Bv - O.D, cu + Au + O.D, cv + Bv + O.D]);
    wayIn(P, sh[0], sh[2], sh[3], [O.way]);
    // (a wall along a side a → b moved out by d — to the right of its way round, the outside of the oval —, t thick, h high)
    const along = (lv, a, b, d, t, ht, kind) => { const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; const nx = (b[1] - a[1]) / l, nz = -(b[0] - a[0]) / l;
      return P.wall(lv, [r2(a[0] + nx * d), r2(a[1] + nz * d)], [r2(b[0] + nx * d), r2(b[1] + nz * d)], t, ht, 0, kind || 'parede'); };
    // the ground: the facade — its bays, as thick as it is, the arches on the axes the ways through it —; the walls of the
    // passages and of the undercroft's corridors (on the lines of the rows' ends, outside the passages); the foundation of the
    // podium round the sand, but where the left passage's flight comes up to the gate and the right passage goes in under it
    const nb = O.nb, mid = O.pts.map((p, k) => [(p[0] + O.pts1[k][0]) / 2, (p[1] + O.pts1[k][1]) / 2]);
    for (let k = 0; k < nb; k++) {
      const w = P.wall(0, mid[k].map(r2), mid[(k + 1) % nb].map(r2), O.t, O.storeys[0], 0, 'parede');
      if (O.axes.includes(k)) P.door(w, P.wlen(w) / 2, O.aw, O.ah, -1, -1, 0, 'arco');
    }
    const ax = k => O.pts1[k]; const vF = ax(O.axes[1])[1], vB = ax(O.axes[3])[1], uR = ax(O.axes[0])[0], uL = ax(O.axes[2])[0]; // (the facade's inner face on each axis)
    for (const s of [-1, 1]) {
      const u = cu + s * (hg + wt / 2), v = cv + s * (hh + wt / 2);
      P.wall(0, [r2(u), r2(cv + hh)], [r2(u), r2(vF)], wt, yb, 0, 'parede'); P.wall(0, [r2(u), r2(cv - hh)], [r2(u), r2(vB)], wt, yb, 0, 'parede');
      P.wall(0, [r2(cu + hg), r2(v)], [r2(uR), r2(v)], wt, yb, 0, 'parede'); P.wall(0, [r2(cu - hg), r2(v)], [r2(uL), r2(v)], wt, yb, 0, 'parede');
    }
    const edge = O.sides(0);
    for (const e of edge) if (e.i !== 6 && e.i !== 0 && e.i !== 12) along(0, e.a, e.b, wt / 2, wt, ya);
    // the sand: the podium's wall round it, the gate at its left end — under the bridge, as high as the sand leaves (2.2 m) — open
    for (const e of edge) { const w = along(1, e.a, e.b, wt / 2, wt, yb - ya); if (e.i === 6) P.door(w, P.wlen(w) / 2, r2(P.wlen(w) - 0.2), r2(yb - 0.3 - ya), -1, -1, 0, 'vao'); }
    // the podium's storey: its parapet round the sand — on the landings and the bridges too —; along the passages, on the rows,
    // over the drop; on the bridges' outer edges; the facade's inner face behind the rows' top
    for (const e of edge) along(2, e.a, e.b, 0.06, 0.12, 0.9, 'parapeito');
    const hp = r2(O.yTop - yb + 0.9);
    for (const s of [-1, 1]) {
      const u = cu + s * (hg + 0.06), v = cv + s * (hh + 0.06);
      P.wall(2, [r2(u), r2(cv + Bv + dp)], [r2(u), r2(vF)], 0.12, hp, 0, 'parapeito'); P.wall(2, [r2(u), r2(cv - Bv - dp)], [r2(u), r2(vB)], 0.12, hp, 0, 'parapeito');
      P.wall(2, [r2(cu + Au + dp), r2(v)], [r2(uR), r2(v)], 0.12, hp, 0, 'parapeito'); P.wall(2, [r2(cu - Au - dp), r2(v)], [r2(uL), r2(v)], 0.12, hp, 0, 'parapeito');
      const ub = cu + s * (Au + dp - 0.06); P.wall(2, [r2(ub), r2(cv - hh)], [r2(ub), r2(cv + hh)], 0.12, 0.9, 0, 'parapeito');
    }
    for (let k = 0; k < nb; k++) along(2, O.pts1[k], O.pts1[(k + 1) % nb], wt / 2, wt, 2.6);
    // (the flights: up to the podium's landings, rising toward the sand; up to the gate; up from the undercroft through the hatch)
    P.stair('escada', 0, 2, W.frente.r, 0, -1, null); P.stair('escada', 0, 2, W.fundo.r, 0, 1, null);
    P.stair('escada', 0, 1, W.esquerda.r, 1, 0, null); P.stair('escada', 0, 1, O.hypo.r, 0, 1, O.hatch);
    // (the rows: each wedge of the oval, the form's own rings about its own centre)
    for (const B of O.blocks) P.tiers(2, null, { ring: [B.c[0], B.c[1], B.r0, B.r1], arc: B.arco, dir: 'out', rows: O.rows, rise: O.rise, tread: O.tread, first: O.rise, aisles: B.aisles, aisleW: 1.0, climb: 2 });
    if (P.inside()) return;
    // (the rooms, rectangles of the lot: on the ground the four quarters and the passages between them, the crossing under the
    // middle of the sand; the sand; on the podium's storey the four quarters, the landings and the bridges)
    const quad = (su, sv) => [su > 0 ? cu + hg : m, sv > 0 ? cv + hh : m, su > 0 ? L - m : cu - hg, sv > 0 ? L - m : cv - hh].map(r2);
    for (const [su, sv] of [[1, 1], [-1, 1], [-1, -1], [1, -1]]) P.room(0, 'praca', quad(su, sv), 1);
    for (const r of [[cu - hg, cv + hh, cu + hg, L - m], [cu - hg, m, cu + hg, cv - hh], [m, cv - hh, cu - hg, cv + hh], [cu + hg, cv - hh, L - m, cv + hh]]) P.room(0, 'passagem', r.map(r2), 1);
    P.room(0, 'subsolo', [cu - hg, cv - hh, cu + hg, cv + hh].map(r2), 0);
    const ar = P.room(1, 'arena', [cu - Au, cv - Bv, cu + Au, cv + Bv].map(r2), 1);
    for (const [su, sv] of [[1, 1], [-1, 1], [-1, -1], [1, -1]]) P.room(2, 'cavea', quad(su, sv), 1);
    for (const r of [W.frente.landing, W.fundo.landing, W.esquerda.bridge, W.direita.bridge]) P.room(2, 'podio', r, 1);
    // (the posts round the square: solid at their feet — the form's, FM)
    for (const e of F.els) { if (e.k !== 'coluna') continue; const id = P.rooms.findIndex(q => q.lv === 0 && In.inRoomPt(q, e.c[0], e.c[1]));
      if (id < 0 || !P.at('solido', 0, id, [e.c[0] - e.r, e.c[1] - e.r, e.c[0] + e.r, e.c[1] + e.r].map(r2), 0, 1, Object.assign({ h: e.y1 }, FM))) { P.errs.push('um marco da praça onde a planta não o põe'); return; } }
    // (who fights: on the sand, two and two facing each other, off the hatch)
    const fight = []; for (const [du, dv] of [[-0.55, 0], [0.32, -0.27], [-0.32, -0.27], [0.55, 0]]) { const u = cu + du * Au, v = cv + dv * Bv; fight.push([r2(u - 0.55), r2(v), Math.PI / 2], [r2(u + 0.55), r2(v), -Math.PI / 2]); }
    stage(P, 1, ar, 'lutar', fight, { st: 'fight' });
    // (who watches standing: along the podium, 0.52 m in from its parapet, every 0.8 m, facing the sand — but on the landings and
    // the bridges, where the flights come up and the passages are crossed)
    const watch = []; const cIn = (u, v) => (v > cv + hh || v < cv - hh) && (u > cu + hg || u < cu - hg); let run = 0.4;
    for (const e of O.sides(0.52, 0.05)) { const l = Math.hypot(e.b[0] - e.a[0], e.b[1] - e.a[1]); if (e.i % 3 === 0) { run = 0.4; continue; } // (each arc's from 0.4 m on)
      const nx = -(e.b[1] - e.a[1]) / l, nz = (e.b[0] - e.a[0]) / l;
      for (; run < l; run += 0.8) { const f = run / l; const u = e.a[0] + (e.b[0] - e.a[0]) * f, v = e.a[1] + (e.b[1] - e.a[1]) * f; if (cIn(u, v)) watch.push([r2(u), r2(v), Math.atan2(nx, nz)]); }
      run -= l; }
    for (const [su, sv] of [[1, 1], [-1, 1], [-1, -1], [1, -1]]) { const id = P.rooms.findIndex(q => q.lv === 2 && q.fn === 'cavea' && In.inRoomPt(q, cu + su * (hg + 1), cv + sv * (hh + 1)));
      P.marks(2, id, 'assistir', watch.filter(q => Math.sign(q[0] - cu) === su && Math.sign(q[1] - cv) === sv), { st: 'idle' }); }
  }
  const THEATRE = { grego: halfBowl, classico: halfBowl, egipcio: garden, asteca: ballCourt, nordico: meadHall, romano: amphitheatre };

  // ------------------------------ the wonders ------------------------------
  // (the strips of a floor round what stands in its middle — the front one, where the way in comes on to it, always; the others
  // where a body goes along them and the walk from the way in reaches them, as P4's platform round a temple's walls —: their ids)
  function strips(P, top, bb, fn) {
    const ids = []; const W = 2 * In.BODY.r + 0.12;
    const parts = [[top[0], bb[3], top[2], top[3]], [top[0], bb[1], bb[0], bb[3]], [bb[2], bb[1], top[2], bb[3]], [top[0], top[1], top[2], bb[1]]];
    parts.forEach((r, k) => { if (Math.min(r[2] - r[0], r[3] - r[1]) < W) return; const id = P.room(0, fn, r.map(r2), 1); if (k && !P.walks(0)) { P.rooms.pop(); return; } ids.push(id); });
    return ids;
  }
  // (a floor on the top of a form — a pyramid's top, a terrace —, at y over the square top: the flight from the street up its
  // front to the floor's front edge, on the form's own treads (st: the form's 'escada'; D-086, a temple's flight, wide and as
  // steep as the god draws it); that edge the way in, as wide as the flight (wayIn); what stands in the floor's middle — the
  // form's solids on it of a tenth of it at least — kept out of it, the strips round it its rooms (fn), what else of the form
  // stands in them kept off → { rooms, bb } or null)
  function platform(P, F, top, y, st, fn) {
    const T = top.map(r2); const hw = st.w / 2, u = st.a[0];
    const treads = G.Forma.flight(st).map(q => ({ r: q.r.map(r2), y: q.y1 })); const r = [u - hw, Math.min(...treads.map(q => q.r[1])), u + hw, st.a[1]].map(r2);
    if (!floorUp(P, T, y, [r2(u - hw), r2(u + hw)], r, treads)) return null;
    return roundMiddle(P, F, T, y, fn);
  }
  // (a floor on a form, at y over its square top T: the way in its front edge from span[0] to span[1], the flight r from the
  // street up to it on its treads — from the lowest —, from the last of them to the edge a tread at the floor → false: only
  // the outside is wanted)
  function floorUp(P, T, y, span, r, treads) {
    P.shell = { kind: 'aberta', r: T, t: 0, mat: 'chao', base: 'macica', baseH: r2(y), floors: 1, eave: 0 }; P.roof = null;
    P.level(0, y, 3.0, 'chao', T); P.entryLv = 0;
    wayIn(P, T[0], T[2], T[3], [span]);
    if (r[1] > T[3] + 1e-6) { treads.push({ r: [r[0], T[3], r[2], r[1]], y }); r[1] = T[3]; }
    P.stair('degraus', -1, 0, r, 0, -1, null, { larga: r[2] - r[0] >= 1.2 ? 1 : 0, treads });
    return !P.inside();
  }
  // (the floor's middle — the form's solids on it of a tenth of it at least — kept out of it, the strips round it its rooms
  // (fn), what else of the form stands in them kept off → { rooms, bb } or null)
  function roundMiddle(P, F, T, y, fn) {
    const foot = s => (s.k === 'rect' ? s.r : [s.c[0] - s.r, s.c[1] - s.r, s.c[0] + s.r, s.c[1] + s.r]); const area = q => (q[2] - q[0]) * (q[3] - q[1]);
    const all = G.Forma.solids(F, y); const mid = all.filter(s => area(foot(s)) >= 0.1 * area(T)); if (!mid.length) { P.errs.push('nada no meio do topo da forma'); return null; }
    const bb = mid.map(foot).reduce((a, q) => [Math.min(a[0], q[0]), Math.min(a[1], q[1]), Math.max(a[2], q[2]), Math.max(a[3], q[3])]);
    const rooms = strips(P, T, bb, fn); if (!rooms.length) { P.errs.push('o topo da forma sem chão em volta do que está nele'); return null; }
    if (!solids(P, F, null, { y, rooms, list: all.filter(s => !mid.includes(s)) })) return null;
    return { rooms, bb };
  }
  // (the braziers of the form on a floor of the plan: solid at their foot, and where one stands to light them, beside each
  // toward the way in, facing it — P4's temple's)
  function lights(P, F, rooms) {
    const e = P.entrance;
    for (const u of G.Forma.uses(F)) {
      if (u.uso !== 'acender') continue; const id = rooms.find(q => { const m = P.rooms[q].r; return u.c[0] > m[0] && u.c[0] < m[2] && u.c[1] > m[1] && u.c[1] < m[3]; }); if (id === undefined) continue;
      const pe = (u.pe || [u.c[0] - u.rad, u.c[1] - u.rad, u.c[0] + u.rad, u.c[1] + u.rad]).map(r2);
      if (!P.at('solido', 0, id, pe, 0, 1, Object.assign({ h: u.y1 }, FM))) { P.errs.push('o braseiro da forma onde a planta não o põe'); return false; }
      const du = e.u - u.c[0], dv = e.v - u.c[1], L = Math.hypot(du, dv) || 1, d = Math.max(pe[2] - pe[0], pe[3] - pe[1]) / 2 + In.BODY.r + 0.1;
      P.marks(0, id, 'acender', [[r2(u.c[0] + du / L * d), r2(u.c[1] + dv / L * d), Math.atan2(-du, -dv)]]);
    }
    return true;
  }
  // the Templo Mayor (asteca): its top — the platform before its two shrines — up the flight from the street; before each
  // shrine's door, where the priest stands (oficiar), facing it; at the braziers before the shrines' outer corners, where one
  // lights them; at the platform's front, beside where the flight comes up, two places to stand and look out over the city
  // (topo) — the feast of Toxcatl on high
  function mayor(P, F) {
    if (F.amphi && F.amphi.mayor) { mayorGrande(P, F, F.amphi.mayor); return; } // (the Templo Mayor of a capital: D-108)
    const lv = F.els.find(e => e.k === 'escalonada'), st = F.els.find(e => e.k === 'escada'); if (!lv || !st) { P.errs.push('a forma do templo sem os níveis ou a escada'); return; }
    const [s, , y] = lv.niveis[lv.niveis.length - 1]; const top = [lv.c[0] - s, lv.c[1] - s, lv.c[0] + s, lv.c[1] + s];
    const g = platform(P, F, top, y, st, 'plataforma'); if (!g) return; const id = g.rooms[0];
    if (!lights(P, F, g.rooms)) return;
    const doors = F.els.filter(e => e.k === 'porta' && e.na === 'frente' && e.y0 >= y - 0.01);
    if (doors.length) P.marks(0, id, 'oficiar', doors.map(e => [r2(e.u), r2(e.v + 0.42), Math.PI]));
    const hw = st.w / 2 + 0.25; P.marks(0, id, 'topo', [[r2(st.a[0] - hw), r2(top[3] - 0.4), 0], [r2(st.a[0] + hw), r2(top[3] - 0.4), 0]]);
  }
  // the ziggurat (classico): the terrace on its third level round the fourth, up the flight from the street to its front edge;
  // before the golden eye on the fourth's front, where one prays (rezar), facing it; on the terrace's sides, where one stands
  // and looks out (topo)
  function ziggurat(P, F) {
    const lv = F.els.find(e => e.k === 'escalonada'), st = F.els.find(e => e.k === 'escada'); if (!lv || !st || lv.niveis.length < 2) { P.errs.push('a forma do zigurate sem os níveis ou a escada'); return; }
    const [s, , y] = lv.niveis[lv.niveis.length - 2]; const top = [lv.c[0] - s, lv.c[1] - s, lv.c[0] + s, lv.c[1] + s];
    const g = platform(P, F, top, y, st, 'patamar'); if (!g) return; const bb = g.bb, cu = (bb[0] + bb[2]) / 2, v = r2((bb[3] + top[3]) / 2 - 0.1);
    const pray = []; for (const du of [-2.3, -1.4, 1.4, 2.3]) if (cu + du > top[0] + 0.4 && cu + du < top[2] - 0.4) pray.push([r2(cu + du), v, Math.PI]);
    P.marks(0, g.rooms[0], 'rezar', pray);
    const cv = (bb[1] + bb[3]) / 2; for (const id of g.rooms.slice(1)) { const r = P.rooms[id].r; if (r[3] - r[1] < r[2] - r[0]) continue; const left = r[2] <= bb[0] + 0.01;
      P.marks(0, id, 'topo', [[r2((r[0] + r[2]) / 2), r2(cv), left ? -Math.PI / 2 : Math.PI / 2]]); }
  }
  // the Great Pyramid (egipcio): massive and sealed — the door high on its front face the one the god paints —; on its slab,
  // the walk before its front face, where one makes the offering under the sealed door (ofertar), and beside it those who pray
  // (rezar), facing it
  function pyramidFoot(P, F) {
    if (F.amphi && F.amphi.piramide) { piramideGrande(P, F, F.amphi.piramide); return; } // (the Great Pyramid of a capital: D-108)
    const L = P.L; const sh = [0, 0, L, L]; const pyr = F.els.find(e => e.k === 'piramide'); if (!pyr) { P.errs.push('a forma sem a pirâmide'); return; } // (its slab the whole lot: from the street a step up on to it)
    const y = pyr.y0; P.shell = { kind: 'aberta', r: sh, t: 0, mat: 'chao', base: openBase(y), baseH: r2(y), floors: 1, eave: 0 }; P.roof = null;
    P.level(0, y, 3.0, 'chao', sh); P.entryLv = 0;
    const spans = frontSpans(F, sh, y); if (!spans.length) { P.errs.push('a frente da pirâmide sem vão por onde entrar'); return; }
    wayIn(P, sh[0], sh[2], sh[3], spans);
    if (P.inside()) return;
    const f = pyr.c[1] + pyr.e; const id = P.room(0, 'esplanada', [sh[0], r2(f + 0.05), sh[2], sh[3]], 1);
    const cu = pyr.c[0], v = r2((f + sh[3]) / 2);
    P.marks(0, id, 'ofertar', [[r2(cu), v, Math.PI]]);
    P.marks(0, id, 'rezar', [-2.8, -1.4, 1.4, 2.8].map(du => [r2(cu + du), v, Math.PI]));
  }
  // Valhalla (nordico): the great hall the form's body is, up its steps from the street; the king's high seat at the back wall's
  // middle, facing the door (sentar, audiencia); the two long hearths along the middle; the benches along the long walls
  // (sentar); the tables of the feast where they fit (comer); the skald between the fires, facing the king (atuar)
  function valhalla(P, F) {
    const h = hallOf(P, F, 'salao'); if (!h) return; const { id, I } = h; const cu = (I[0] + I[2]) / 2, cv = (I[1] + I[3]) / 2;
    if (!P.at('trono', 0, id, [r2(cu - 0.5), r2(I[1] + 0.05), r2(cu + 0.5), r2(I[1] + 0.85)], 0, 1)) { P.errs.push('sem lugar para o assento do rei'); return; }
    for (const du of [-2.6, 2.6]) if (!P.at('lar', 0, id, [r2(cu + du - 0.6), r2(cv - 0.4), r2(cu + du + 0.6), r2(cv + 0.4)], 0, 1)) { P.errs.push('sem lugar para os fogos do salão'); return; }
    let n = 0; for (const s of ['fundo', 'frente']) for (let k = 0; k < 5; k++) if (P.place('banco', 0, id, { sides: [s] })) n++;
    if (n < 6) { P.errs.push(`só ${n} bancos em Valhala`); return; }
    for (let k = 0; k < 2; k++) P.place('mesa', 0, id);
    P.marks(0, id, 'atuar', [[r2(cu), r2(cv + 0.3), Math.PI]]);
  }
  // the Acropolis (grego): the rock's top round the temple — seen, not gone into: the steps of its base each a body's knee
  // high —, up the flight cut steep into the rock's front; before the temple's front, where one prays (rezar), facing it;
  // before Athena's statue, where one makes the offering (ofertar); at the rock's back, where one stands and looks out (topo)
  function acropolis(P, F) {
    const rock = F.els.find(e => e.k === 'talude'), st = F.els.find(e => e.k === 'escada'); if (!rock || !st) { P.errs.push('a forma da acrópole sem a rocha ou a escada'); return; }
    const y = rock.y1, top = rock.r1; const g = platform(P, F, top, y, st, 'planalto'); if (!g) return;
    const bb = g.bb, cu = (bb[0] + bb[2]) / 2, v = r2((bb[3] + top[3]) / 2 - 0.15); const id = g.rooms[0];
    const fig = F.els.find(e => e.k === 'estatua' && Math.abs(e.p[2] - y) < 0.05);
    const pray = []; for (const du of [-2.4, -1.2, 1.2, 2.4]) { const u = cu + du; if (fig && Math.hypot(u - fig.p[0], v - fig.p[1]) < 1.0) continue; pray.push([r2(u), v, Math.PI]); }
    P.marks(0, id, 'rezar', pray);
    if (fig) P.marks(0, id, 'ofertar', [[r2(fig.p[0]), r2(fig.p[1] + 0.75), Math.PI]]);
    const back = g.rooms.find(q => P.rooms[q].r[3] <= bb[1] + 0.01); if (back !== undefined) { const r = P.rooms[back].r; P.marks(0, back, 'topo', [[r2(cu), r2((r[1] + r[3]) / 2), 0]]); }
  }
  // the Great Pyramid of a capital (the steps of 10 and 13 tiles, js/forma-espetaculo.js — D-108): two storeys — the ground, the
  // slab round the pyramid (the square before its face, the ways along its sides and its back; on the colossal's lot the court of
  // its temple, its walls, pillars and altar solid) and the corridor in from the way in at the face's foot —, and the king's
  // chamber: up the great gallery from the corridor's end to its landing, through the door in the chamber's wall. Every room a
  // rectangle of the form's floor, the mass round them no room (the void: never walked). Before the sarcophagus where one makes
  // the offering, and about it those who pray; before the way in, the offering and the prayers of the square
  function piramideGrande(P, F, A) {
    const L = P.L, m = 0.1; const sh = [m, m, L - m, L - m]; const { cu, cv, e, y0, face, cw, yK } = A;
    P.shell = { kind: 'aberta', r: sh, t: 0, mat: 'chao', base: openBase(y0), baseH: y0, floors: 1, eave: 0 }; P.roof = null;
    P.level(0, y0, A.ch, 'chao', sh); P.entryLv = 0;
    P.level(1, yK, 4.4, 'chao', [A.chamber[0], A.chamber[1], A.chamber[2], A.landing[3]]);
    wayIn(P, sh[0], sh[2], sh[3], [[r2(cu - 3.0), r2(cu + 3.0)]]);
    // (the chamber's front wall between the landing and it, its door; the gallery's flight)
    const wv = r2(A.doorK[3] - 0.2); const w = P.wall(1, [r2(A.chamber[0] - 0.4), wv], [r2(A.chamber[2] + 0.4), wv], 0.4, 4.4, 0, 'parede');
    P.door(w, P.atOf(w, [cu, wv]), r2(A.doorK[1] - A.doorK[0]), A.doorK[4], -1, -1, 0, 'vao');
    P.stair('escada', 0, 1, A.gallery.r, 0, -1, null);
    if (P.inside()) return;
    // (the rooms: the square before the face, the ways round the pyramid, the corridor, the gallery; the landing, the chamber)
    const sq = P.room(0, 'esplanada', [sh[0], r2(face), sh[2], sh[3]], 1);
    for (const r of [[sh[0], sh[1], sh[2], r2(cv - e)], [sh[0], r2(cv - e), r2(cu - e), r2(face)], [r2(cu + e), r2(cv - e), sh[2], r2(face)]]) if (r[2] - r[0] >= 0.8 && r[3] - r[1] >= 0.8) P.room(0, 'esplanada', r, 1);
    P.room(0, 'corredor', [r2(cu - cw), A.vC, r2(cu + cw), r2(face)], 0); // (the gallery is its flight: no floor of its own)
    P.room(1, 'patamar', A.landing, 0); const ch = P.room(1, 'camara', A.chamber, 0);
    // (what stands on the square — the temple's walls, its pillars, its altar — solid; the sarcophagus)
    if (!solids(P, F, sq, { y: y0 })) return;
    if (!P.at('solido', 1, ch, A.sarco, 0, 1, Object.assign({ h: 1.05 }, FM))) { P.errs.push('o sarcófago onde a planta não o põe'); return; }
    const sv = A.sarco[3] + 0.55; P.marks(1, ch, 'ofertar', [[r2(cu), r2(sv), Math.PI]]);
    P.marks(1, ch, 'rezar', [-2.2, -1.2, 1.2, 2.2].map(du => [r2(cu + du), r2(Math.min(A.chamber[3] - 0.45, sv + 1.0)), Math.PI]));
    const T = A.temple, fv = T ? r2(T.altar[3] + 0.55) : r2(Math.min(sh[3] - 0.5, face + 1.2)), au = T ? (T.altar[0] + T.altar[2]) / 2 : cu;
    P.marks(0, sq, 'ofertar', [[r2(au), fv, Math.PI]]);
    P.marks(0, sq, 'rezar', [-2.4, -1.4, 1.4, 2.4].map(du => [r2(au + du), r2(Math.min(sh[3] - 0.5, fv + 0.9)), Math.PI]));
  }
  // the Templo Mayor of a capital (the steps of 10 and 13 tiles, js/forma-espetaculo.js — D-108): two storeys — the ceremonial
  // square round the pyramid (its four sides, rectangles of the slab) and the top —, the double stair between them (the god's
  // steep one, climbed facing it: D-086). On the top, round the two shrines (solid: seen, not gone into), behind its parapet: before
  // each shrine's door where the priest stands (oficiar), at the braziers where one lights them, at the top's front corners where
  // one looks out (topo); in the square before the stair, those who watch the feast standing (assistir)
  function mayorGrande(P, F, A) {
    const L = P.L, m = 0.1; const sh = [m, m, L - m, L - m]; const { cu, cv, e0, e1, H } = A; const y0 = groundOf(F, L), T = A.top, pt = A.pt, sw = A.stair.w;
    P.shell = { kind: 'aberta', r: sh, t: 0, mat: 'chao', base: openBase(y0), baseH: y0, floors: 1, eave: 0 }; P.roof = null;
    P.level(0, y0, 3.0, 'chao', sh); P.entryLv = 0;
    P.level(1, H, 3.0, 'chao', T);
    wayIn(P, sh[0], sh[2], sh[3], [[r2(cu - sw / 2 - 2), r2(cu + sw / 2 + 2)]]);
    // (the top's parapet, open where the stair comes up; the stair from the square's front to the top's front edge)
    const pw = (a, b) => P.wall(1, a.map(r2), b.map(r2), pt, 0.9, 0, 'parapeito'), h2 = pt / 2;
    pw([T[0], T[1] + h2], [T[2], T[1] + h2]); pw([T[0] + h2, T[1]], [T[0] + h2, T[3]]); pw([T[2] - h2, T[1]], [T[2] - h2, T[3]]);
    pw([T[0], T[3] - h2], [cu - sw / 2, T[3] - h2]); pw([cu + sw / 2, T[3] - h2], [T[2], T[3] - h2]);
    P.stair('escada', 0, 1, [r2(cu - sw / 2), A.stair.top, r2(cu + sw / 2), A.stair.foot], 0, -1, null);
    if (P.inside()) return;
    // (the square's four sides; the top round the shrines — the platform before them, its sides, behind them)
    const fr = P.room(0, 'praca', [sh[0], r2(cv + e0), sh[2], sh[3]], 1);
    for (const r of [[sh[0], sh[1], sh[2], r2(cv - e0)], [sh[0], r2(cv - e0), r2(cu - e0), r2(cv + e0)], [r2(cu + e0), r2(cv - e0), sh[2], r2(cv + e0)]]) P.room(0, 'praca', r, 1);
    // (the shrines and the slot between them no room: the void, never walked)
    const bb = A.shrines.map(q => q.r).reduce((a, q) => [Math.min(a[0], q[0]), Math.min(a[1], q[1]), Math.max(a[2], q[2]), Math.max(a[3], q[3])]);
    const plat = P.room(1, 'plataforma', [T[0], r2(bb[3]), T[2], T[3]], 1);
    for (const r of [[T[0], T[1], r2(bb[0]), r2(bb[3])], [r2(bb[2]), T[1], T[2], r2(bb[3])], [r2(bb[0]), T[1], r2(bb[2]), r2(bb[1])]]) if (r[2] - r[0] >= 0.8 && r[3] - r[1] >= 0.8) P.room(1, 'plataforma', r, 1);
    // (the braziers' stands solid, and where one lights each, before it; the priests before the doors; the look-outs; the crowd)
    const lit = []; for (const u of G.Forma.uses(F)) { if (u.uso !== 'acender' || !u.pe) continue; if (!P.at('solido', 1, plat, u.pe.map(r2), 0, 1, Object.assign({ h: u.y1 }, FM))) { P.errs.push('o braseiro da forma onde a planta não o põe'); return; }
      lit.push([r2(u.c[0]), r2(u.pe[3] + In.BODY.r + 0.12), Math.PI]); }
    P.marks(1, plat, 'acender', lit);
    P.marks(1, plat, 'oficiar', A.shrines.map(q => [q.door, r2(q.r[3] + 0.45), Math.PI]));
    P.marks(1, plat, 'topo', [[r2(T[0] + 1.0), r2(T[3] - 0.6), 0], [r2(T[2] - 1.0), r2(T[3] - 0.6), 0]]);
    const watch = []; for (let k = -4; k <= 4; k++) { if (Math.abs(k) < 2) continue; watch.push([r2(cu + k * 1.6), r2(Math.min(sh[3] - 0.6, A.stair.foot + 0.9)), Math.PI]); }
    P.marks(0, fr, 'assistir', watch, { st: 'idle' });
  }
  const WONDER = { romano: amphitheatre, asteca: mayor, classico: ziggurat, egipcio: pyramidFoot, nordico: valhalla, grego: acropolis };

  // ------------------------------ the monument (D-097) ------------------------------
  // the monument one goes up to — its base's steps each a body's (the god's each split in two: G.Forma's crepis) —: the top
  // step round what stands on it — the obelisk's pedestal, the god's statue's, the triumphal column's, the Sun Stone in its
  // cradle —, up its steps along the front from the street (each a tread of the way up), its front edge the way in; before the
  // pedestal where one makes the offering (ofertar), facing it, and either side behind that where one prays (rezar). The Norse's
  // rune stones on their grass: where one prays before them and makes the offering at the tallest. (The golden statue, the
  // estatua, has none: only seen — the top of its base round its column is narrower than a body)
  function monumentPlan(P, F) {
    if (F.style === 'nordico') return runestones(P, F);
    const st = F.els.filter(e => e.k === 'bloco' && e.degrau === 1).sort((a, b) => a.y1 - b.y1); if (st.length < 2) { P.errs.push('o monumento sem os degraus da base'); return; }
    const T = st[st.length - 1].r.map(r2), y = st[st.length - 1].y1;
    const treads = []; for (let k = 0; k < st.length - 1; k++) treads.push({ r: [T[0], r2(st[k + 1].r[3]), T[2], r2(st[k].r[3])], y: st[k].y1 });
    if (!floorUp(P, T, y, [r2(T[0] + 0.05), r2(T[2] - 0.05)], [T[0], T[3], T[2], r2(st[0].r[3])], treads)) return;
    const g = roundMiddle(P, F, T, y, 'plataforma'); if (!g) return;
    if (!lights(P, F, g.rooms)) return; // (the braziers of a great monument — the Aztec's —, where one lights them: D-109)
    const bb = g.bb, cu = (bb[0] + bb[2]) / 2, id = g.rooms[0], r = P.rooms[id].r; const v = r2(Math.min(r[3] - 0.4, bb[3] + 1.1));
    P.marks(0, id, 'ofertar', [[r2(cu), r2(bb[3] + 0.45), Math.PI]]);
    // (on a great one's top — 10 m across and more, D-109 — a row of eight, and a second behind it)
    const great = T[2] - T[0] >= 10, dus = great ? [-3.2, -2.4, -1.6, -0.8, 0.8, 1.6, 2.4, 3.2] : [-1.6, -0.8, 0.8, 1.6];
    const pray = []; for (const vv of great && r[3] - v >= 1.3 ? [v, r2(v + 0.9)] : [v]) for (const du of dus) if (cu + du > r[0] + 0.4 && cu + du < r[2] - 0.4) pray.push([r2(cu + du), vv, Math.PI]);
    P.marks(0, id, 'rezar', pray);
  }
  function runestones(P, F) {
    const g = openGround(P, F, 'pedras'); if (!g || P.inside()) return;
    const id = P.room(0, 'pedras', g.sh, 1); if (!solids(P, F, id)) return;
    const S = F.els.filter(e => e.k === 'pedra'); if (!S.length) { P.errs.push('o monumento sem as pedras'); return; }
    const tall = S.reduce((a, e) => (e.y1 > a.y1 ? e : a)), front = Math.max(...S.map(e => e.c[1] + e.e)), cu = P.L / 2;
    P.marks(0, id, 'ofertar', [[r2(tall.c[0]), r2(tall.c[1] + tall.e + 0.5), Math.PI]]);
    P.marks(0, id, 'rezar', [-1.6, -0.8, 0.8, 1.6].map(du => [r2(cu + du), r2(Math.min(g.sh[3] - 0.5, front + 1.0)), Math.PI]));
  }
  function monumentOf(P) {
    const F = G.Forma && G.Forma.of(P.rec.t, P.rec.c, In.nOf(P.rec)); if (!F) { P.errs.push('o monumento sem forma'); return; }
    monumentPlan(P, F);
  }
  function wonder(P) {
    const F = G.Forma && G.Forma.of(P.rec.t, P.rec.c, In.nOf(P.rec)); if (!F) { P.errs.push('a maravilha sem forma'); return; }
    const f = WONDER[F.style] || WONDER[P.rec.c]; if (!f) { P.errs.push(`a maravilha de ${P.rec.c} ainda sem planta`); return; }
    f(P, F);
  }
  function theatre(P) {
    const F = G.Forma && G.Forma.of(P.rec.t, P.rec.c, In.nOf(P.rec)); if (!F) { P.errs.push('o teatro sem forma'); return; }
    if (F.amphi && F.amphi.teatro) { teatroPlan(P, F, F.amphi.teatro); return; } // (the theatre of a city: D-109)
    if (F.amphi && F.amphi.campo) { campoPlan(P, F, F.amphi.campo); return; } // (the great ball court of a city: D-109)
    const f = THEATRE[F.style] || THEATRE[P.rec.c]; if (!f) { P.errs.push(`o teatro de ${P.rec.c} ainda sem planta`); return; }
    f(P, F);
  }
  // the great ball court of a city (the Aztec's theatre, the steps of 6, 8 and 10 tiles, js/forma-espetaculo.js — D-109): the
  // ground — the alley, the fields at its ends, round the walls (solid) — and the stands on the walls' tops a storey up: the walk
  // along the slope's edge, the rows of the form (a block of P.tiers each, rising away from the alley, the walk behind them their
  // last row's), the walks at the ends; the parapets walls of their storey where the form has them; the flight up each wall's left
  // end from the field. Who plays in the alley (the actors' posts and places: the players), who watches standing in the fields
  // at its ends, facing up it
  function campoPlan(P, F, A) {
    const L = P.L, m = 0.1; const sh = [m, m, L - m, L - m]; const { cu, cv, yq, Hw, ua, ub, pt, ew } = A;
    P.shell = { kind: 'aberta', r: sh, t: 0, mat: 'chao', base: 'chao', baseH: yq, floors: 1, eave: 0 }; P.roof = null;
    P.level(0, yq, 3.0, 'chao', sh); P.entryLv = 0;
    const ext = A.stands.reduce((a, q) => [Math.min(a[0], q.vO, q.vI), Math.max(a[1], q.vO, q.vI)], [L, 0]); P.level(1, Hw, 3.0, 'chao', [ua, ext[0], ub, ext[1]]);
    wayIn(P, sh[0], sh[2], sh[3], [[r2(cu - 4), r2(cu + 4)]]);
    // (each stand: its rows a block, rising away from the alley; the parapets along the slope, at the back, at the ends — open at
    // the flight —, the stepped walls at the rows' ends; the flight)
    for (const q of A.stands) { const s = q.s, [v0, v1] = q.room, rv = q.rows, inner = s < 0 ? v1 : v0, outer = s < 0 ? v0 : v1;
      P.tiers(1, null, { r: [ua + ew, rv[0], ub - ew, rv[1]], dir: s < 0 ? 'n' : 's', rows: A.rows, rise: A.rs, tread: A.tr, first: A.rs, aisles: A.aisles, aisleW: 1.0, climb: 2 });
      const pw = (a, b) => P.wall(1, a.map(r2), b.map(r2), pt, 0.9, 0, 'parapeito');
      pw([ua, inner - s * pt / 2], [ub, inner - s * pt / 2]); pw([ua, outer + s * pt / 2], [ub, outer + s * pt / 2]);
      pw([ua + pt / 2, Math.min(v0, v1)], [ua + pt / 2, q.vm - 0.7]); pw([ua + pt / 2, q.vm + 0.7], [ua + pt / 2, Math.max(v0, v1)]); pw([ub - pt / 2, Math.min(v0, v1)], [ub - pt / 2, Math.max(v0, v1)]);
      pw([ua + ew - pt / 2, rv[0]], [ua + ew - pt / 2, rv[1]]); pw([ub - ew + pt / 2, rv[0]], [ub - ew + pt / 2, rv[1]]);
      P.stair('escada', 0, 1, q.flight, 1, 0, null); }
    if (P.inside()) return;
    const id = P.room(0, 'campo', sh, 1); for (const q of A.stands) P.room(1, 'arquibancada', [ua, Math.min(...q.room), ub, Math.max(...q.room)], 1);
    if (!solids(P, F, id)) return;
    // (who plays: in the alley, two and two either side of its middle, facing across it; who watches standing: in the fields at
    // its ends, facing up it)
    stage(P, 0, id, 'atuar', [[cu - 1.6, cv, Math.PI / 2], [cu + 1.6, cv, -Math.PI / 2], [cu - 3.2, cv, Math.PI / 2], [cu + 3.2, cv, -Math.PI / 2]]);
    const watch = []; for (const [u, f] of [[r2(ua - 0.8), Math.PI / 2], [r2(ub + 0.8), -Math.PI / 2]]) for (const dv of [-1.5, -0.5, 0.5, 1.5]) watch.push([u, r2(cv + dv), f]);
    P.marks(0, id, 'assistir', watch, { st: 'idle' });
  }
  // the theatre of a city (the steps of 6, 8 and 10 tiles, js/forma-espetaculo.js — D-109): the open ground — the forecourt on
  // the street, the yards along the stage building, the ways in between the rows' ends and it, the orchestra, the rows of the
  // form (each piece of them a block of P.tiers, the walk round them and the gallery their top rows' depth), the stepped walls at
  // their ends and the parapet round the gallery walls where the form has them —; the stage building's own storey — the Roman's
  // stage, corridor and rooms 1 m up on its podium (its flights up from the orchestra, the hall's up from the forecourt), the
  // Greek's skene's on the ground —, the doors where the form has them: the three in the wall behind the stage, one from the
  // corridor into each room, the hall's opening on the street side. Who acts on the Roman's stage, in the Greek's orchestra (the
  // actors' posts, P2's trade, and the places); the musicians in the orchestra; the dressing rooms' hangers and benches
  function teatroPlan(P, F, A) {
    const L = P.L, m = 0.1; const sh = [m, m, L - m, L - m]; const roman = A.st === 'romano'; const { cu, vD, yq, u0, u1, vS, vC, vR, vF, wm, hb } = A;
    P.shell = { kind: 'aberta', r: sh, t: 0, mat: 'chao', base: 'chao', baseH: yq, floors: 1, eave: 0 }; P.roof = null;
    P.level(0, yq, 3.0, 'chao', sh); P.entryLv = 0;
    const lb = roman ? 1 : 0; if (roman) P.level(1, A.ys, hb, 'chao', [u0, A.vP, u1, vF]);
    wayIn(P, sh[0], sh[2], sh[3], [[u0, u1]]);
    // (the rows: each piece of the form with its stairways — the lower, the upper — a block)
    for (const e of F.els) { if (e.k !== 'cavea' || !e.escadas) continue; const Ar = e.aneis.slice().reverse();
      P.tiers(0, null, { ring: [e.c[0], e.c[1], e.fundo, Ar[Ar.length - 1][0]], arc: e.arco, dir: 'out', rows: Ar.length, rise: A.rs, tread: A.tr, first: r2(Ar[0][1] - yq), aisles: e.escadas.a, aisleW: e.escadas.l, climb: e.escadas.n }); }
    // (the stepped walls at the rows' ends — their middle line 0.1 m out of them —, the parapet round the gallery — its chords
    // the 3D's —: walls of the storey)
    const at = (r, a) => [r2(cu + r * Math.cos(a)), r2(vD + r * Math.sin(a))];
    for (const [a, s] of [[A.a0, -1], [A.a1, 1]]) { const o = [-Math.sin(a) * s * 0.1, Math.cos(a) * s * 0.1]; const p0 = at(A.ri, a), p1 = at(A.rG, a);
      P.wall(0, [r2(p0[0] + o[0]), r2(p0[1] + o[1])], [r2(p1[0] + o[0]), r2(p1[1] + o[1])], 0.2, 0.9, 0, 'parapeito'); }
    const span = A.a1 - A.a0, nS = Math.max(4, Math.round(48 * span / TAU));
    for (let k = 0; k < nS; k++) P.wall(0, at(A.R - 0.1, A.a0 + span * k / nS), at(A.R - 0.1, A.a0 + span * (k + 1) / nS), 0.2, 0.9, 0, 'parapeito');
    // (the stage building's walls on its storey: the one behind the stage with its three doors, its sides, the partition with a
    // door into each room, the rooms' walls, the front open where the hall's door is)
    const back = P.wall(lb, [u0, r2((vS + vC) / 2)], [u1, r2((vS + vC) / 2)], r2(vC - vS), A.hf, 0, 'parede');
    for (const [u, dw, dh] of A.doors) P.door(back, P.atOf(back, [u, (vS + vC) / 2]), dw, dh, -1, -1, 0, 'vao');
    for (const u of [r2(u0 + 0.2), r2(u1 - 0.2)]) P.wall(lb, [u, vC], [u, r2(vF - 0.3)], 0.4, hb, 0, 'parede');
    if (A.dc) { const part = P.wall(lb, [r2(u0 + 0.4), r2(vR - 0.15)], [r2(u1 - 0.4), r2(vR - 0.15)], 0.3, hb, 0, 'divisoria');
      for (const u of [cu - wm, cu, cu + wm]) P.door(part, P.atOf(part, [u, vR - 0.15]), 1.0, 2.2, -1, -1, 0, 'vao'); }
    for (const s of [-1, 1]) P.wall(lb, [r2(cu + s * wm / 2), vR], [r2(cu + s * wm / 2), r2(vF - 0.3)], 0.2, hb, 0, 'divisoria');
    P.wall(lb, [u0, r2(vF - 0.15)], [r2(cu - 0.8), r2(vF - 0.15)], 0.3, hb, 0, 'parede'); P.wall(lb, [r2(cu + 0.8), r2(vF - 0.15)], [u1, r2(vF - 0.15)], 0.3, hb, 0, 'parede');
    // (the Roman's flights: up from the orchestra to the stage at its front, up from the forecourt to the hall)
    if (roman) { for (const r of A.flights) P.stair('escada', 0, 1, r, 0, 1, null); P.stair('escada', 0, 1, A.front, 0, -1, null); }
    if (P.inside()) return;
    // (the rooms: the rows and the orchestra and the ways in, the yards, the forecourt; the stage, the corridor, the rooms, the
    // opening of the hall's door)
    const cav = P.room(0, 'teatro', [sh[0], sh[1], sh[2], roman ? A.vP : vS], 1);
    P.room(0, 'passagem', [sh[0], roman ? A.vP : vS, u0, vF], 1); P.room(0, 'passagem', [u1, roman ? A.vP : vS, sh[2], vF], 1);
    P.room(0, 'adro', [sh[0], vF, sh[2], sh[3]], 1);
    const stg = roman ? P.room(1, 'palco', [u0, A.vP, u1, vS], 1) : cav;
    if (A.dc) P.room(lb, 'bastidores', [r2(u0 + 0.4), vC, r2(u1 - 0.4), r2(vR - 0.3)], 0);
    const rooms = [P.room(lb, 'camarim', [r2(u0 + 0.4), vR, r2(cu - wm / 2 - 0.1), r2(vF - 0.3)], 0), P.room(lb, 'camarim', [r2(cu + wm / 2 + 0.1), vR, r2(u1 - 0.4), r2(vF - 0.3)], 0)];
    const hall = P.room(lb, 'preparacao', [r2(cu - wm / 2 + 0.1), vR, r2(cu + wm / 2 - 0.1), r2(vF - 0.3)], 0);
    P.room(lb, 'entrada', [r2(cu - 0.8), r2(vF - 0.3), r2(cu + 0.8), vF], 0);
    // (what stands in the back — the Greek's proskenion's columns —, on the Roman's stage — the frons's lowest columns —: solid)
    if (!solids(P, F, cav)) return; if (roman && !solids(P, F, stg, { y: A.ys })) return;
    // (the dressing rooms' hangers and bench, the hall's benches)
    for (const id of rooms) { P.opt(() => P.place('cabide', lb, id, { sides: ['fundo'] })); P.opt(() => P.place('banco', lb, id, {})); }
    for (const sd of ['esquerda', 'direita']) P.opt(() => P.place('banco', lb, hall, { sides: [sd] }));
    // (who acts: on the Roman's stage along its middle, in the Greek's orchestra; facing the rows. The musicians in the
    // orchestra, before the stage — the Greek's at its sides —, facing the rows)
    if (roman) { const v = r2((A.vP + vS) / 2); stage(P, 1, stg, 'atuar', [0, -1, 1, -2, 2].map(k => [r2(cu + k * 1.6), v, Math.PI])); }
    else stage(P, 0, cav, 'atuar', [[cu, r2(vD + 0.3), Math.PI], [r2(cu - 1.2), r2(vD + 0.6), Math.PI], [r2(cu + 1.2), r2(vD + 0.6), Math.PI], [r2(cu - 2.4), r2(vD + 1.0), Math.PI], [r2(cu + 2.4), r2(vD + 1.0), Math.PI]]);
    const mv = roman ? r2((vD + A.vP) / 2) : r2(vD + 0.75 * A.ro), mu = roman ? 1.2 : r2(0.6 * A.ro);
    P.marks(0, cav, 'tocar', [[r2(cu - mu), mv, Math.PI], [r2(cu + mu), mv, Math.PI]]);
  }
  // ------------------------------ the palace, the baths and the chief's house (D-093; the leader's of 29/10) ------------------------------
  // the shell by the form's body, as the god and the 3D draw it — P4's builder, In.formType (int-civicos.js: the walls at the
  // form's foot, the floor on its base or on the ground, the door and the windows where the form has them, the porch, the
  // pylon's gate before the walls with no court (the Egyptian palace's), the way the form covers to its walls (the temazcal's),
  // the form's steps) —; here, of each type, how its hall is split into rooms and what stands in them
  // (the storey's height: the form's body, from its floor to its eaves)
  const storeyH = P => { const B = G.Forma.body(G.Forma.of(P.rec.t, P.rec.c, In.nOf(P.rec))); return B.y1 - B.y0; };
  const fnRoom = (P, rooms, fn) => rooms.all.find(id => P.rooms[id] && P.rooms[id].fn === fn);
  // (a door of 0.9 m in a partition, at p, between the rooms either side of it)
  const inDoor = (P, w, p, ra, rb, h) => P.door(w, P.atOf(w, p), 0.9, Math.min(h - 0.2, 2.1), ra, rb, 0, 'porta');
  // (where one stands to use a piece, a body's room — 0.7 m — kept clear of what is laid after it: the plan walks by its cells,
  // the body by its round, and the bench beside the tub, the table before the throne left the cells and not the body: qa/palacios.js)
  const keepStand = (P, it, uses) => { if (it) for (const sp of P.spotsOf(it)) if (!sp.on && (!uses || uses.includes(sp.use))) P.zones.push({ lv: it.lv, r: [sp.u - 0.35, sp.v - 0.35, sp.u + 0.35, sp.v + 0.35] }); return it; };
  // (the throne against the back wall in the middle: before it the audience's room, its width and 0.3 m either side, 1.6 m out,
  // kept clear — no table, no lamp there —; its two lamps beside it, where they go)
  const throneAt = (P, hall) => {
    const th = P.place('trono', 0, hall, { sides: ['fundo'], center: true }); if (!th) return null;
    P.zones.push({ lv: 0, r: [th.r[0] - 0.3, th.r[3], th.r[2] + 0.3, th.r[3] + 1.6] });
    P.opt(() => { const cu = (th.r[0] + th.r[2]) / 2; for (const du of [-1.0, 1.0]) P.at('lampadario', 0, hall, [r2(cu + du - 0.225), r2(th.r[1] + 0.05), r2(cu + du + 0.225), r2(th.r[1] + 0.5)], 0, 1); });
    return th;
  };
  // (the fire where the people keeps it: its hearth in the middle of the room, else the stove against a wall, else a brazier)
  const fireIn = (P, id) => { const f = P.tr.fire; return (f === 'lar' && P.place('lar', 0, id, { sides: ['livre'], margin: 0.6 })) || (f && P.place(f === 'lar' || f === 'forno' ? 'fogao' : f, 0, id)) || P.place('braseiro', 0, id); };
  // the palace (palácio): the throne hall and, behind a partition across its back, the lord's chamber — his bed, his chest —
  // and the kitchen beside it — the fire, the table, the jars —; a hall too shallow for them (the Norse's longhouse), the
  // chamber at its left end and the hearth in the hall. In the hall the throne against its back in the middle, the benches of
  // the court along its sides, two lamps, the chest
  function palaceSplit(P, I) {
    const h0 = storeyH(P), ti = 0.15; const hall = P.room(0, 'trono', I);
    if (I[3] - I[1] >= 6.4) {
      const vs = r2(I[1] + 2.6); const [back, front, w] = P.split(hall, 'v', vs, ti, h0);
      const [left, right] = P.split(back, 'u', r2((I[0] + I[2]) / 2), ti, h0);
      inDoor(P, w, [r2(I[0] + 1.0), vs], front, left, h0); inDoor(P, w, [r2(I[2] - 1.0), vs], front, right, h0);
      P.rooms[front].fn = 'trono'; P.rooms[left].fn = 'aposento'; P.rooms[right].fn = 'cozinha';
      return { main: front, rooms: [left, front, right] };
    }
    const us = r2(I[0] + 2.8); const [left, right, w] = P.split(hall, 'u', us, ti, h0);
    inDoor(P, w, [us, r2(I[1] + 1.0)], right, left, h0); P.rooms[left].fn = 'aposento'; P.rooms[right].fn = 'trono';
    return { main: right, rooms: [left, right] };
  }
  function palaceFurnish(P, rooms) {
    const hall = rooms.main, bed = fnRoom(P, rooms, 'aposento'), ck = fnRoom(P, rooms, 'cozinha'), cook = ck === undefined ? null : ck;
    if (!throneAt(P, hall)) { P.errs.push('sem lugar para o trono'); return; }
    const court = () => { let n = 0; for (const s of ['esquerda', 'direita']) for (let g = 0; g < 2; g++) if (P.place('banco', 0, hall, { sides: [s] })) n++; if (n < 2) P.errs.push(`só ${n} bancos no salão do trono`); };
    const chamber = () => { if (!P.place('cama-casal', 0, bed) && !P.place('cama', 0, bed)) { P.errs.push('sem cama no aposento'); return; } P.opt(() => P.place('arca', 0, bed)); };
    const kitchen = () => { if (!fireIn(P, cook === null ? hall : cook)) P.errs.push('sem lugar para o fogo'); if (cook !== null) P.opt(() => { P.place('mesa', 0, cook, { sides: ['livre'] }); P.place('jarros', 0, cook); }); };
    for (const f of [[court, chamber, kitchen], [chamber, kitchen, court], [kitchen, court, chamber]][P.attempt % 3]) f();
    P.opt(() => P.place('arca', 0, hall));
  }
  // the chief's house (paço): his hall — his seat against its back in the middle, the fire (the hearth in the middle where the
  // people keeps one, else against a wall), the benches of those he receives along its sides, the table, the chest. The hall is
  // his seat's ('trono'): one room, but not a workshop's hall — qa/plantas.js, «famílias distintas»: the Egyptian's had the
  // structure of the recipe's w-salao.terreo
  function pacoFurnish(P, rooms) {
    const hall = rooms.main;
    if (!throneAt(P, hall)) { P.errs.push('sem lugar para o assento do chefe'); return; }
    const fire = () => { if (!fireIn(P, hall)) P.errs.push('sem lugar para o fogo'); };
    const benches = () => { let n = 0; for (const s of ['esquerda', 'direita', 'frente']) for (let g = 0; g < 2 && n < 4; g++) if (P.place('banco', 0, hall, { sides: [s] })) n++; if (n < 2) P.errs.push(`só ${n} bancos no salão`); };
    for (const f of [[fire, benches], [benches, fire]][P.attempt % 2]) f();
    P.opt(() => { if (P.place('mesa', 0, hall, { sides: ['livre'] })) P.place('banco', 0, hall); });
    P.opt(() => P.place('arca', 0, hall));
  }
  // the baths (banhos): where one undresses (the pegs on a wall, a bench), the water (the pool; the tub where no pool goes), the
  // furnace that warms it (the keeper's work) — in the thermae's hall the changing room across its front by the door, the cold
  // room and the hot one side by side behind it, one into the other; the sauna's and the temazcal's one room, the steam's —;
  // the Egyptian's sacred lake under the sky (sacredLake: the form has no body)
  function bathsSplit(P, I) {
    const h0 = storeyH(P), ti = 0.15; const hall = P.room(0, 'quente', I);
    if (I[2] - I[0] >= 5.4 && I[3] - I[1] >= 5.4) {
      const vs = r2(I[3] - 1.8); const [back, front, w] = P.split(hall, 'v', vs, ti, h0);
      const us = r2((I[0] + I[2]) / 2); const [left, right, w2] = P.split(back, 'u', us, ti, h0);
      inDoor(P, w, [r2(I[0] + 1.2), vs], front, left, h0); inDoor(P, w2, [us, r2(I[1] + 1.2)], left, right, h0);
      P.rooms[front].fn = 'vestiario'; P.rooms[left].fn = 'frio'; P.rooms[right].fn = 'quente';
      return { main: front, rooms: [left, front, right] };
    }
    return { main: hall, rooms: [hall] };
  }
  function bathsFurnish(P, rooms) {
    const hot = fnRoom(P, rooms, 'quente'), cl = fnRoom(P, rooms, 'frio'), cold = cl === undefined ? null : cl, dr = fnRoom(P, rooms, 'vestiario'), dress = dr === undefined ? hot : dr;
    const pool = id => keepStand(P, P.place('piscina', 0, id, { sides: ['livre', 'fundo', 'esquerda', 'direita'], margin: 0.5 }) || P.place('tina-banho', 0, id), ['entrar']);
    const pools = () => { let n = 0; for (const id of [hot, cold].filter(q => q !== null)) if (pool(id)) n++; if (!n) P.errs.push('sem lugar para a água'); };
    const fire = () => { if (!keepStand(P, P.place('fornalha-banho', 0, hot))) P.errs.push('sem lugar para a fornalha'); };
    const pegs = () => { if (!P.niche('cabide', 0, dress)) P.errs.push('sem lugar para os cabides'); };
    for (const f of [[fire, pools, pegs], [pools, fire, pegs], [fire, pegs, pools]][P.attempt % 3]) f();
    P.opt(() => { for (const id of [dress, hot].filter((x, q, a) => a.indexOf(x) === q)) P.place('banco', 0, id); });
  }
  // the Egyptian's sacred lake, open to the sky (the leader's of 29/10: D-044's open shell): its ground the form's, the rim of
  // stone and the palms solid round the water; the pool the form's water ('piscina', FM) one goes down into from the landing at
  // its front, where the rim opens; the furnace that warms it, the form's at the landing's left ('fornalha-banho', FM: the
  // keeper's), turned to the landing; where one undresses, on the landing beside the way down (P.marks 'despir': no wall to hang
  // the pegs on), facing the water; the way in the landing's front, but where the furnace stands
  function sacredLake(P, F) {
    // (its floor the landing's — the form's floor before the water, out to the front, 0.16 m over the ground: the step up onto it
    // from the street the feet's —, where the water is behind it)
    const lam = F.els.find(e => e.k === 'lamina'); if (!lam) { P.errs.push('o lago sem água'); return; }
    const ld = F.els.find(e => e.k === 'bloco' && e.piso && e.r[1] >= lam.r[3] - 0.01); if (!ld) { P.errs.push('o lago sem o patamar'); return; }
    const L = P.L, m = 0.1; const sh = [m, m, L - m, L - m]; const y = ld.y1;
    P.shell = { kind: 'aberta', r: sh, t: 0, mat: 'chao', base: openBase(y), baseH: y, floors: 1, eave: 0 }; P.roof = null;
    P.level(0, y, 3.0, 'chao', sh); P.entryLv = 0;
    const fur = G.Forma.uses(F).find(u => u.uso === 'fornalha'); if (!fur) { P.errs.push('o lago sem a fornalha'); return; }
    const a = fur.r[0] - 0.15, b = fur.r[2] + 0.15;
    const spans = frontSpans(F, sh).flatMap(([s0, s1]) => (b <= s0 || a >= s1 ? [[s0, s1]] : [[s0, a], [b, s1]])).filter(([s0, s1]) => s1 - s0 >= 0.9).map(q => q.map(r2));
    if (!spans.length) { P.errs.push('a frente do lago fechada'); return; }
    wayIn(P, sh[0], sh[2], sh[3], spans);
    if (P.inside()) return;
    const id = P.room(0, 'banhos', sh, 1); if (!solids(P, F, id)) return;
    // (the water where one bathes 8 cm in from the rim — the way the landing's front keeps clear before the way in, 0.9 m, ends
    // short of it —, and 0.3 m from the furnace at its front, as a fire keeps from what is low)
    const wf = Math.min(lam.r[3] - 0.08, fur.r[1] - 0.32);
    if (!P.at('piscina', 0, id, [lam.r[0] + 0.08, lam.r[1] + 0.08, lam.r[2] - 0.08, wf].map(r2), 0, 1, FM)) { P.errs.push('a água do lago onde a planta não a põe'); return; }
    const fv = fur.vira || [0, 1];
    if (!P.at('fornalha-banho', 0, id, [fur.r[0] + 0.02, fur.r[1], fur.r[2], fur.r[3]].map(r2), fv[0], fv[1], FM)) { P.errs.push('a fornalha do lago onde a planta não a põe'); return; }
    // (where one undresses: on the landing, either side of its middle)
    const lv = r2((ld.r[1] + ld.r[3]) / 2), u0 = Math.max(ld.r[0], fur.r[2]) + 0.45, u1 = ld.r[2] - 0.45;
    P.marks(0, id, 'despir', [[r2(u0), lv, Math.PI], [r2(u1), lv, Math.PI]]);
  }

  In.addFamilies([{ id: 'forma.teatro', H: 'forma', V: 'teatro', S: 'forma.teatro', name: 'Pela forma', can: rec => (G.Forma && G.Forma.of(rec.t, rec.c, In.nOf(rec)) ? null : 'o prédio sem forma'), build: P => theatre(P) }]);
  In.addTypes({ teatro: { use: 'teatro', fams: ['forma.teatro'], open: 1 } });
  In.addFamilies([{ id: 'forma.maravilha', H: 'forma', V: 'maravilha', S: 'forma.maravilha', name: 'Pela forma', can: rec => (G.Forma && G.Forma.of(rec.t, rec.c, In.nOf(rec)) ? null : 'o prédio sem forma'), build: P => wonder(P) }]);
  In.addTypes({ maravilha: { use: 'maravilha', fams: ['forma.maravilha'], open: 1 } });
  In.addFamilies([{ id: 'forma.monumento', H: 'forma', V: 'monumento', S: 'forma.monumento', name: 'Pela forma', can: rec => (G.Forma && G.Forma.of(rec.t, rec.c, In.nOf(rec)) ? null : 'o prédio sem forma'), build: P => monumentOf(P) }]);
  In.addTypes({ monument: { use: 'monumento', fams: ['forma.monumento'], open: 1 } });
  // ------------------------------ the granary (celeiro) of the Egyptians and of the Aztecs (the leader's of 29/10, phase E) ------------------------------
  // open, its ground the form's — the Egyptian's base under its four domes, up the flight at its front; the Aztec's floor of
  // beaten earth —; each dome, each pot of the form a bin of the people's grain where the form stands it ('tulha', FM: P4's
  // piece as it is, its mouth on its front where one pours and takes; each its share of what the granary keeps — the Egyptian's
  // four of 28, the Aztec's three of 37 for the 110), a body's room before each mouth; the way in the ground's front, where the
  // form's flight comes up to it, else along it all
  function granaryForm(P) {
    const F = G.Forma.of(P.rec.t, P.rec.c, In.nOf(P.rec)); const U = G.Forma.uses(F).filter(u => u.uso === 'tulha'); if (!U.length) { P.errs.push('o celeiro sem tulhas'); return; }
    // (its ground: the widest piece of the form's floor under the middle of the lot — the base, the floor —, at its top)
    const L = P.L, c = L / 2, area = r => (r[2] - r[0]) * (r[3] - r[1]); let fl = null;
    for (const e of F.els) if (e.k === 'bloco' && !e.degrau && !e.uso && e.y0 < 0.01 && e.r[0] < c && e.r[2] > c && e.r[1] < c && e.r[3] > c && (!fl || area(e.r) > area(fl.r))) fl = e;
    if (!fl) { P.errs.push('o celeiro sem chão'); return; }
    const sh = fl.r.map(r2), y = fl.y1;
    P.shell = { kind: 'aberta', r: sh, t: 0, mat: 'chao', base: openBase(y), baseH: y, floors: 1, eave: 0 }; P.roof = null;
    P.level(0, y, 3.0, 'chao', sh); P.entryLv = 0;
    const st = F.els.filter(e => e.degrau).map(e => ({ r: e.r.slice(), y: e.y1 }));
    if (st.length) {
      let r = st[0].r.slice(); for (const q of st) r = [Math.min(r[0], q.r[0]), Math.min(r[1], q.r[1]), Math.max(r[2], q.r[2]), Math.max(r[3], q.r[3])];
      if (r[1] > sh[3] + 1e-6) { st.push({ r: [r[0], sh[3], r[2], r[1]], y }); r[1] = sh[3]; }
      P.stair('degraus', -1, 0, r, 0, -1, null, { larga: r[2] - r[0] >= 1.2 ? 1 : 0, treads: st });
      // (the edge where the flight comes up the way in, and only it: the rest of the front the base's edge, its floor to it — a
      // wall of no height along it all took the strip before the front domes' mouths from the feet)
      wayIn(P, r2(r[0]), r2(r[2]), sh[3], [[r2(r[0]), r2(r[2])]]);
    } else wayIn(P, sh[0], sh[2], sh[3], [[r2(sh[0] + 0.05), r2(sh[2] - 0.05)]]);
    if (P.inside()) return;
    const id = P.room(0, 'celeiro', sh, 1);
    const goal = (G.BDEF[P.rec.t] || {}).storage || 0, cap = Math.ceil(goal / U.length), dflt = In.ITEMS.tulha.store.cap;
    for (const u of U) {
      const fv = u.vira || [0, 1]; const it = P.at('tulha', 0, id, u.r.map(r2), fv[0], fv[1], Object.assign(cap > dflt ? { cap } : {}, FM));
      if (!it) { P.errs.push('uma tulha da forma onde a planta não a põe'); return; }
      keepStand(P, it);
    }
    solids(P, F, id, { y });
  }

  // ------------------------------ the market (mercado), open (the leader's of 29/10, phase E) ------------------------------
  // its ground the form's pavement; each stall of the form a stall of P4's where its counter is ('banca', FM: the one who sells
  // under the cloth behind it, the buyers before it), each bay of the people's store a bay of P4's ('baia', FM: 30 each, the
  // market keeps 50) — a body's room where one stands at each —; what else stands on the pavement solid (the posts, the
  // macellum, the stoa's walls and columns, the jars, the barrels, the palm); the way in the front's widest stretch where
  // nothing stands
  function marketForm(P) {
    const F = G.Forma.of(P.rec.t, P.rec.c, In.nOf(P.rec)); const U = G.Forma.uses(F).filter(u => u.uso === 'banca' || u.uso === 'baia'); if (!U.length) { P.errs.push('o mercado sem bancas'); return; }
    const L = P.L, c = L / 2, area = r => (r[2] - r[0]) * (r[3] - r[1]); let fl = null;
    for (const e of F.els) if (e.k === 'bloco' && e.piso && e.y0 < 0.01 && e.r[0] < c && e.r[2] > c && e.r[1] < c && e.r[3] > c && (!fl || area(e.r) > area(fl.r))) fl = e;
    if (!fl) { P.errs.push('o mercado sem chão'); return; }
    const sh = fl.r.map(r2), y = fl.y1;
    P.shell = { kind: 'aberta', r: sh, t: 0, mat: 'chao', base: openBase(y), baseH: y, floors: 1, eave: 0 }; P.roof = null;
    P.level(0, y, 3.0, 'chao', sh); P.entryLv = 0;
    // (the front where nothing stands — of the form's solids nor of its stalls' counters —: the stretches one could come in by,
    // the way in the widest of them — wayIn: one, L-413)
    let spans = frontSpans(F, sh, y);
    for (const u of U) { const a = u.r[0] - 0.15, b = u.r[2] + 0.15; if (u.r[3] < sh[3] - 1.0) continue; spans = spans.flatMap(([s0, s1]) => (b <= s0 || a >= s1 ? [[s0, s1]] : [[s0, a], [b, s1]])); }
    spans = spans.filter(([s0, s1]) => s1 - s0 >= 0.9).map(q => q.map(r2)); if (!spans.length) { P.errs.push('a frente do mercado fechada'); return; }
    wayIn(P, sh[0], sh[2], sh[3], spans);
    if (P.inside()) return;
    const id = P.room(0, 'mercado', sh, 1);
    for (const u of U) {
      const fv = u.vira || [0, 1]; const it = P.at(u.uso, 0, id, u.r.map(r2), fv[0], fv[1], FM);
      if (!it) { P.errs.push(`${u.uso === 'banca' ? 'uma banca' : 'uma baia'} da forma onde a planta não a põe`); return; }
      keepStand(P, it);
    }
    solids(P, F, id, { y });
  }

  // (the palace's, the baths', the chief's house's: the form's by P4's one builder of them — In.formType: its shell, its porch,
  // the pylon's gate, the temazcal's way and walls, the sacred lake where the form has no body —, before the type's halls, and
  // the one a new building is given wherever it is laid out (D-093); the great palace and the colossal one keep their plans,
  // they have no body of the form. A record of before goes to the form's on opening: P4's In.migrate, by formFam)
  // (and the granary's and the market's, phase E, open grounds, by their own: the granary only where it is no hall — the
  // Egyptian's domes, the Aztec's pots; the others keep the recipe's)
  const BINS = { egipcio: 1, asteca: 1 };
  In.formType('palacio', { fam: 'forma.palacio', hall: 'trono', split: palaceSplit, furnish: palaceFurnish, keep: true });
  In.formType('banhos', { fam: 'forma.banhos', hall: 'quente', split: bathsSplit, furnish: bathsFurnish, keep: true, t: (rec, F) => (F.style === 'asteca' ? 0.2 : null), bare: (P, F) => sacredLake(P, F) });
  In.formType('paco', { fam: 'forma.paco', hall: 'trono', furnish: pacoFurnish, keep: true });
  for (const [t, fam, build, only] of [['celeiro', 'forma.celeiro', granaryForm, BINS], ['mercado', 'forma.mercado', marketForm]]) {
    const T0 = In.TYPES[t]; if (!T0) continue;
    In.addFamilies([{ id: fam, H: 'forma', V: t, S: fam, name: 'Pela forma', can: rec => (only && !only[rec.c] ? 'o deste povo é um salão' : G.Forma && G.Forma.has(rec.t, rec.c, In.nOf(rec)) ? null : 'o prédio sem forma'), build: P => build(P) }]);
    In.addTypes({ [t]: Object.assign({}, T0, { fams: [fam].concat((T0.fams || []).filter(f => f !== fam)), formFam: fam, prefer: (rec, ok) => (ok.includes(fam) ? [fam] : ok) }) });
  }
})(window.G);
