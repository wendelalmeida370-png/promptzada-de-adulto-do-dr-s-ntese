// forma-inv: as regras do verificador para os prédios com planta pela forma (D-093, D-096, D-097; P3) — carregado depois do
// qa/qa.js (QA.more), como o interiores-inv.js; o líder o junta (qa/junta-inv.js). Lê o registro (b.ip) e pergunta às portas
// do G.Interiors e do G.Forma (fazer uma planta não muda o mundo).
(function () {
  if (!window.QA || !QA.more) return;
  let seen = new Map(), seenS = null; // (the records already asked, in this world: a family's trial is a plan made)
  let turn = 0; // (which few ways in this round looks at: a different few each time, so a long life sees them all)
  QA.more.push(function (add, s) {
    const In = G.Interiors, Fo = G.Forma; if (!In || !In.familiesFor || !Fo) return;
    if (seenS !== s) { seen = new Map(); seenS = s; }
    // ---- one building (D-093): a building of a type planned by its form wherever that is laid out has the form's family —
    // the one the god and the 3D draw —, never one of the recipe's where the form's is laid out in it (the body would walk
    // another building than the one seen: the walls, the floor, the door elsewhere). A record of before goes to the form's
    // on opening (In.migrate), a new one is given it (In.found, In.newRecord); a people whose type has no form (the granary
    // that is a hall) keeps the recipe's
    for (const b of s.buildings.values()) {
      const r = b.ip; if (!r || !b.built || b.type === 'ruin') continue; const T = In.TYPES[r.t]; if (!T || !T.formFam || r.f === T.formFam) continue;
      if (!Fo.has(r.t, r.c)) continue;
      const key = `${b.id}:${r.f}:${r.r}:${r.s}`; let fits = seen.get(key);
      if (fits === undefined) { fits = In.familiesFor(r).ok.includes(T.formFam); seen.set(key, fits); }
      if (fits) add('forma', 2, `${b.type}#${b.id} (${r.c}): a planta da família ${r.f}, e a da forma (${T.formFam}) se arma nele — o corpo andaria noutro prédio que o visto`);
    }
    // ---- the way in from the street: where the street before a building's way in, a hand out of its lot on the way's line, is
    // more than a body's step below the form's ground (the plinth's top: where its flight or its floor begins), the steps Space
    // reckons up to it — before the door of a ground on its own base, before the foot of the form's flight up a solid one —;
    // none, the feet meet a wall of the slope's height (a lot falling away to the street; the ground can change under it)
    const Sp = G.Space; if (!Sp || !Sp.entryFits) return;
    const all = []; for (const b of s.buildings.values()) if (b.built && b.type !== 'ruin' && b.ip && /^forma\./.test(b.ip.f)) all.push(b);
    const TL = Sp.TILE;
    for (let k = 0; k < 3 && all.length; k++) {
      const b = all[(turn++ * 7919) % all.length]; const p = In.plan(b); if (!p || !p.ok || !p.entrance || !p.entrance.out) continue;
      const e = p.entrance, pl = Sp.plinth(b); const ux = e.x - e.out[0], uz = e.z - e.out[1], d = Math.hypot(ux, uz), Lw = b.w * TL, Ld = b.h * TL; if (!(d > 0)) continue;
      let t = 0; for (; t < 8; t += 0.05) { const x = e.x - ux / d * t, z = e.z - uz / d * t; if (x < -0.05 || z < -0.05 || x > Lw + 0.05 || z > Ld + 0.05) break; }
      const sx = b.x * TL + e.x - ux / d * t, sz = b.y * TL + e.z - uz / d * t; const drop = pl.y0 - Math.max(Sp.footAt(sx / TL, sz / TL), Sp.stepTop(sx, sz));
      if (drop <= In.BODY.step + 0.01) continue;
      const ef = Sp.entryFits(b, p);
      if (ef.kind === 'nenhum') add('forma', 2, `${b.type}#${b.id} (${b.ip.f}): a rua ${drop.toFixed(2)} m abaixo do chão da forma diante da entrada, e nenhum degrau até ele`);
    }
  });
})();
