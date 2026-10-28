// interiores-inv: as regras do verificador para os interiores (C2) — o registro de cada prédio (b.ip) e a planta que sai
// dele. Carregado depois do qa/qa.js (QA.more / QA.canonMore); o líder o leva para o QA.check quando os interiores chegam
// ao integracao. Lê os campos do mundo direto; a planta, pelas portas do G.Interiors (fazer uma planta não muda o mundo).
(function () {
  if (!window.QA || !QA.more) return;
  const SIDES = { N: 1, E: 1, S: 1, W: 1 };
  let turn = 0; // (which few plans this round builds: a different few each time, so a long life sees them all)
  let placeTurn = 0; // (and which few buildings with people inside have their places looked at)
  let heard = new Map(), heardS = null; // (the step's words on the way in already asked again here — once each, in this world)
  let pocketAt = new Map(), pocketS = null; // (the day each door was first seen before a pocket, in this world: L-216)
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
      if (r.v !== 3 || !In.TYPES[r.t] || !In.FAMS[r.f] || !SIDES[r.s] || !Number.isInteger(r.r) || r.r < 0 || !Array.isArray(r.h) || !Array.isArray(r.fx) || !r.dr || typeof r.dr !== 'object') { add('int', 1, `${nm}: registro danificado (${JSON.stringify(r).slice(0, 120)})`); continue; }
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
    // ---- the places of who is inside (D-085): one person a point — never two at one place of a piece, nor two closer than
    // 0.3 m but on one piece made for several (the double bed's two) —, every place a place of its piece; a few buildings with
    // people in them each round, a different few each time
    if (In.places) {
      const occ = []; const seenB = new Set();
      for (const v of s.villagers.values()) { if (!(v.inside > 0) || seenB.has(v.inside)) continue; seenB.add(v.inside); const b = s.buildings.get(v.inside); if (b && b.ip && In.TYPES[b.ip.t]) occ.push(b); }
      occ.sort((a, c) => a.id - c.id);
      for (let k = 0; k < Math.min(3, occ.length); k++) {
        const b = occ[(placeTurn++ * 7919) % occ.length]; const pts = [...In.places(b).by.entries()]; let clash = null;
        for (let i = 0; i < pts.length && !clash; i++) for (let j = i + 1; j < pts.length; j++) { const [ia, a] = pts[i], [ib, c] = pts[j]; if (a.lv !== c.lv) continue; if ((a.it && c.it && a.item === c.item && a.q === c.q) || (Math.hypot(a.x - c.x, a.z - c.z) < 0.3 && !(a.it && c.it && a.item === c.item))) { clash = `#${ia} e #${ib}`; break; } }
        if (clash) add('int', 2, `${b.type}#${b.id}: ${clash} no mesmo lugar`);
        for (const [id, pl] of pts) if (pl.it && (!pl.it.spots[pl.q] || pl.it.spots[pl.q].use !== pl.use)) { add('int', 3, `${b.type}#${b.id}: #${id} num ponto que não é da peça (${pl.item}:${pl.q} ${pl.use})`); break; }
      }
    }
    // ---- the way in (L-195): where the step put the door, with this record and this ground (the trees about it too: L-206),
    // the way in fits — or it fits on no side open to the street. Asked again here, made anew: every word of the step the first
    // round after it, the doors left where it does not fit every round (they are few), and the others in the round's few plans.
    // The way in fits with the door before a tile of the street the world walks — the people's door is the plan's, the body's,
    // wherever the step said it fits (L-209)
    if (In.entrySaid && In.entryKey && G.Space && G.Space.entryFits) {
      if (heardS !== s) { heardS = s; heard = new Map(); }
      for (const b of withIp) {
        const said = In.entrySaid(b); if (said === undefined) continue; const k = In.entryKey(b); if (said && heard.get(b.id) === k) continue; heard.set(b.id, k);
        const e = G.Space.entryFits(b, In.shellOf(b)); const front = !In.frontOpen || In.frontOpen(b); const ok = e.ok && front;
        const why = front ? `${e.kind}, o pé a ${e.foot} m` : 'a porta dá para uma casa da rua que não se anda';
        if (ok !== said) { add('int', 2, `${b.type}#${b.id}: a entrada ${ok ? 'cabe' : `não cabe (${why})`} diante da porta, e a virada do dia disse que ${said ? 'cabia' : 'não cabia'} com o mesmo chão`); continue; }
        if (!ok) { const to = In.fitSide(b); if (to) add('int', 2, `${b.type}#${b.id}: a porta ficou onde a entrada não cabe (${why}), e no lado ${to.s} ela cabe`); }
      }
    }
    // ---- the door onto the street (L-216): the plan's door opens onto the biggest ground round the building — never a pocket
    // smaller than the ground another side opens onto: whoever came out there would be shut in, as the family of a hut whose
    // door faced a tile between three cliffs starved two steps from its store. Where the step judged the door with this ground,
    // at once; anywhere else, a door seen before a pocket at the turn of a day and still there two days on (the ground may close
    // round a door between two turns — a wall, the god —: the next turn moves it). Read from the map of reach as it stands,
    // peeked at, never rebuilt for the clock here
    if (In.entrySaid && In.shellOf && G.W.reachIds) {
      if (pocketS !== s) { pocketS = s; pocketAt = new Map(); }
      const W = G.W, L = W.reachIds(true); let size = null;
      const at = (x, y) => { if (!W.inb(x, y) || !W.walkableXY(x, y)) return -1; if (!size) { size = new Map(); for (let i = 0; i < L.length; i++) if (L[i] >= 0) size.set(L[i], (size.get(L[i]) || 0) + 1); } return size.get(L[W.idx(x, y)]) || 0; };
      const out = (b, q, k) => q === 'S' ? [b.x + k + 0.5, b.y + b.h + 0.4] : q === 'N' ? [b.x + b.w - 1 - k + 0.5, b.y - 0.4] : q === 'E' ? [b.x + b.w + 0.4, b.y + b.h - 1 - k + 0.5] : [b.x - 0.4, b.y + k + 0.5];
      const TL = G.Space ? G.Space.TILE : 4; const seen = new Set();
      for (const b of withIp) {
        if (!b.built || !b.blocks || b.type === 'ruin' || !In.TYPES[b.type]) continue;
        const sh = In.shellOf(b); const e = sh && sh.entrance; if (!e || !e.out) continue;
        const g = at(b.x + e.out[0] / TL, b.y + e.out[1] / TL); if (g < 0) continue; // (a closed tile before the door: the way in's rule, above)
        let big = 0, side = ''; for (const q of ['S', 'E', 'W', 'N']) { const n = q === 'S' || q === 'N' ? b.w : b.h; for (let k = 0; k < n; k++) { const p = out(b, q, k); const z = at(p[0], p[1]); if (z > big) { big = z; side = q; } } }
        if (g >= big) continue;
        seen.add(b.id); const d0 = pocketAt.has(b.id) ? pocketAt.get(b.id) : (pocketAt.set(b.id, s.day), s.day);
        if (In.entrySaid(b) !== undefined || s.day - d0 >= 2) add('int', 2, `${b.type}#${b.id}: a porta (lado ${b.ip.s}) dá para um bolsão de ${g} casas, e o lado ${side} dá para um chão de ${big}${In.entrySaid(b) !== undefined ? ' — com o chão que a virada julgou' : ` — desde o dia ${d0}`}`);
      }
      for (const id of [...pocketAt.keys()]) if (!seen.has(id)) pocketAt.delete(id);
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
      if (In.entrySaid && In.entrySaid(b) === true && s1 && G.Space && G.Space.entryFits) { const e = G.Space.entryFits(b, s1); const front = !In.frontOpen || In.frontOpen(b); if (!e.ok || !front) add('int', 2, `${b.type}#${b.id}: a entrada não cabe (${front ? `${e.kind}, o pé a ${e.foot} m` : 'a porta dá para uma casa da rua que não se anda'}) diante da porta, e a virada do dia disse que cabia com o mesmo chão`); }
      // (the door the world's people use, with the port on: the plan's own wherever the step took it — and the step never
      // took a door onto ground smaller than the biggest round the building, the old corner's among it: a pocket shut in all
      // round shuts in whoever comes out — L-216)
      if (G.Vg && G.Vg.planDoor === In.planDoor && b.built && b.blocks) {
        const pd = In.planDoor(b);
        if (pd) { const d = G.Vg.door(b); if (Math.abs(d[0] - pd[0]) > 1e-6 || Math.abs(d[1] - pd[1]) > 1e-6) add('int', 2, `${b.type}#${b.id}: quem sai não sai pela porta da planta`); }
        const said = In.doorSaid(b);
        if (said) {
          const W = G.W, L = W.reachIds(true); const reg = p => (W.inb(p[0], p[1]) && W.walkableXY(p[0], p[1]) ? L[W.idx(p[0], p[1])] : -1);
          const ring = []; for (let k = 0; k < b.w; k++) ring.push([b.x + k + 0.5, b.y + b.h + 0.4], [b.x + k + 0.5, b.y - 0.4]); for (let k = 0; k < b.h; k++) ring.push([b.x + b.w + 0.4, b.y + k + 0.5], [b.x - 0.4, b.y + k + 0.5]);
          const rd = reg(said), regs = new Set(ring.map(reg).filter(r => r >= 0 && r !== rd));
          if (regs.size) { const n = new Map(); for (let i = 0; i < L.length; i++) if (L[i] === rd || regs.has(L[i])) n.set(L[i], (n.get(L[i]) || 0) + 1); const nd = n.get(rd) || 0; let no = 0; for (const r of regs) no = Math.max(no, n.get(r) || 0); if (nd < no) add('int', 2, `${b.type}#${b.id}: a porta de quem sai dá para um chão fechado de ${nd} casas (outro lado do prédio, para ${no})`); }
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
