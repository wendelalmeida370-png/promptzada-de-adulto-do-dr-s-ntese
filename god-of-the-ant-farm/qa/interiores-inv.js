// interiores-inv: as regras do verificador para os interiores (C2) — o registro de cada prédio (b.ip) e a planta que sai
// dele. Carregado depois do qa/qa.js (QA.more / QA.canonMore); o líder o leva para o QA.check quando os interiores chegam
// ao integracao. Lê os campos do mundo direto; a planta, pelas portas do G.Interiors (fazer uma planta não muda o mundo).
(function () {
  if (!window.QA || !QA.more) return;
  const SIDES = { N: 1, E: 1, S: 1, W: 1 };
  let turn = 0; // (which few plans this round builds: a different few each time, so a long life sees them all)
  let heard = new Map(), heardS = null; // (the step's words on the way in already asked again here — once each, in this world)
  QA.more.push(function (add, s) {
    const In = G.Interiors; if (!In) return;
    const withIp = [];
    for (const b of s.buildings.values()) {
      const T = In.TYPES[b.type]; const nm = `${b.type}#${b.id}`;
      // ---- every building of a type with a plan has its record (a ruin keeps the one it had)
      if (T && !b.ip) { add('int', 2, `${nm}: prédio com planta sem registro (b.ip)`); continue; }
      if (!b.ip) continue;
      const r = b.ip; withIp.push(b);
      // ---- the record is whole: its family is one its type has, its side a side, its counters numbers
      if (r.v !== 1 || !In.TYPES[r.t] || !In.FAMS[r.f] || !SIDES[r.s] || !Number.isInteger(r.r) || r.r < 0 || !Array.isArray(r.h) || !Array.isArray(r.fx) || !r.dr || typeof r.dr !== 'object') { add('int', 1, `${nm}: registro danificado (${JSON.stringify(r).slice(0, 120)})`); continue; }
      if (!In.TYPES[r.t].fams.includes(r.f)) add('int', 1, `${nm}: a família ${r.f} não é de ${r.t}`);
      // ---- a building standing and finished is of the type its record says (a rebuilding is a renovation of the record)
      if (b.built && b.type !== 'ruin' && T && r.t !== b.type) add('int', 2, `${nm}: o registro diz ${r.t}`);
      // ---- a house given up was empty for In.LEFT days at least, and nobody lived in it at the last turn of the day
      if (r.ab && (!(r.vz > 0) || r.ab - r.vz < In.LEFT || r.nm)) add('int', 3, `${nm}: abandonada no dia ${r.ab} sem ter ficado vazia ${In.LEFT} dias (vazia desde ${r.vz}, ${r.nm} moradores)`);
    }
    // ---- a prisoner in his jail is on the straw of one of its cells, behind the grating (where the drawing puts him: the
    // jail's plan has its cells, each with its bed — an invalid plan is said below)
    for (const v of s.villagers.values()) {
      if (!v.jail || v.inside !== v.jail) continue; const b = s.buildings.get(v.jail); const T = b && In.TYPES[b.type];
      if (!b || !b.ip || !T || !T.cells) continue; const cs = In.cells(b); if (!cs.length) continue;
      const at = In.placeOf(v); if (!at || !cs.some(c => c.bed === at.item)) add('int', 3, `pessoa #${v.id}: presa na cadeia #${b.id} fora das celas`);
    }
    // ---- the way in (L-195): where the step put the door, with this record and this ground (the trees about it too: L-206),
    // the way in fits — or it fits on no side open to the street. Asked again here, made anew: every word of the step the first
    // round after it, the doors left where it does not fit every round (they are few), and the others in the round's few plans
    if (In.entrySaid && In.entryKey && G.Space && G.Space.entryFits) {
      if (heardS !== s) { heardS = s; heard = new Map(); }
      for (const b of withIp) {
        const said = In.entrySaid(b); if (said === undefined) continue; const k = In.entryKey(b); if (said && heard.get(b.id) === k) continue; heard.set(b.id, k);
        const e = G.Space.entryFits(b, In.shellOf(b));
        if (e.ok !== said) { add('int', 2, `${b.type}#${b.id}: a entrada ${e.ok ? 'cabe' : `não cabe (${e.kind}, o pé a ${e.foot} m)`} diante da porta, e a virada do dia disse que ${said ? 'cabia' : 'não cabia'} com o mesmo chão`); continue; }
        if (!e.ok) { const to = In.fitSide(b); if (to) add('int', 2, `${b.type}#${b.id}: a porta ficou onde a entrada não cabe (${e.kind}, o pé a ${e.foot} m), e no lado ${to.s} ela cabe`); }
      }
    }
    // ---- a few plans each round: valid, and the shell seen from afar the whole plan's (the 3D draws the one far, the
    // other near: the same building, always)
    if (!withIp.length) return;
    for (let k = 0; k < 3; k++) {
      const b = withIp[(turn++ * 7919) % withIp.length]; const p = In.plan(b); if (!p) { add('int', 1, `${b.type}#${b.id}: sem planta`); continue; }
      if (!p.ok) add('int', 2, `${b.type}#${b.id}: planta inválida (${(p.errs || []).slice(0, 2).join('; ')})`);
      // (the plan of a house given up: what the household takes with it is gone)
      if (p.left && p.items.some(it => In.ITEMS[it.kind] && In.ITEMS[it.kind].leva)) add('int', 3, `${b.type}#${b.id}: a casa abandonada ainda tem as coisas que a família leva`);
      const s1 = In.shellOf(b), s2 = In.shellOfPlan(p); const strip = o => { const x = Object.assign({}, o); delete x.key; return JSON.stringify(x); };
      if (!s1 || strip(s1) !== strip(s2)) add('int', 1, `${b.type}#${b.id}: a casca de longe não é a da planta`);
      // (the way in where the step said it fits, with this record and this ground: asked again here, made anew — L-195)
      if (In.entrySaid && In.entrySaid(b) === true && s1 && G.Space && G.Space.entryFits) { const e = G.Space.entryFits(b, s1); if (!e.ok) add('int', 2, `${b.type}#${b.id}: a entrada não cabe (${e.kind}, o pé a ${e.foot} m) diante da porta, e a virada do dia disse que cabia com o mesmo chão`); }
      // (the door the world's people use, with the port on: the plan's own wherever the step took it — and the step never
      // took a door onto ground smaller than the old corner's: a pocket shut in all round shuts in whoever comes out)
      if (G.Vg && G.Vg.planDoor === In.planDoor && b.built && b.blocks) {
        const pd = In.planDoor(b);
        if (pd) { const d = G.Vg.door(b); if (Math.abs(d[0] - pd[0]) > 1e-6 || Math.abs(d[1] - pd[1]) > 1e-6) add('int', 2, `${b.type}#${b.id}: quem sai não sai pela porta da planta`); }
        const said = In.doorSaid(b); const corner = [[b.x + b.w - 0.5, b.y + b.h + 0.4], [b.x + b.w + 0.4, b.y + b.h - 0.5], [b.x - 0.4, b.y + 0.5], [b.x + 0.5, b.y - 0.4]].find(c => G.W.walkableXY(c[0], c[1]));
        if (said && corner) {
          const L = G.W.reachIds(true); const rd = L[G.W.idx(said[0], said[1])], ro = L[G.W.idx(corner[0], corner[1])];
          if (rd !== ro) { let nd = 0, no = 0; for (let i = 0; i < L.length; i++) { if (L[i] === rd) nd++; else if (L[i] === ro) no++; } if (nd < no) add('int', 2, `${b.type}#${b.id}: a porta de quem sai dá para um chão fechado de ${nd} casas (o canto de antes, para ${no})`); }
        }
      }
    }
  });
  // (the records go into the save with their buildings: the canonical state carries them, so a round trip that loses one is seen)
  QA.canonMore.push(['interiores', () => {
    const In = G.Interiors; if (!In) return null; let h = 2166136261; let n = 0;
    for (const b of [...G.S.buildings.values()].sort((a, c) => a.id - c.id)) {
      if (!b.ip) continue; n++; const r = b.ip; const str = [b.id, r.t, r.f, r.r, r.s, r.o, r.c, r.h.length, (r.fx || []).length].join('|');
      for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    }
    return [n, (h >>> 0).toString(16)];
  }]);
})();
