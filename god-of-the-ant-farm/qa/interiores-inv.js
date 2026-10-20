// interiores-inv: as regras do verificador para os interiores (C2) — o registro de cada prédio (b.ip) e a planta que sai
// dele. Carregado depois do qa/qa.js (QA.more / QA.canonMore); o líder o leva para o QA.check quando os interiores chegam
// ao integracao. Lê os campos do mundo direto; a planta, pelas portas do G.Interiors (fazer uma planta não muda o mundo).
(function () {
  if (!window.QA || !QA.more) return;
  const SIDES = { N: 1, E: 1, S: 1, W: 1 };
  let turn = 0; // (which few plans this round builds: a different few each time, so a long life sees them all)
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
    }
    // ---- a few plans each round: valid, and the shell seen from afar the whole plan's (the 3D draws the one far, the
    // other near: the same building, always)
    if (!withIp.length) return;
    for (let k = 0; k < 3; k++) {
      const b = withIp[(turn++ * 7919) % withIp.length]; const p = In.plan(b); if (!p) { add('int', 1, `${b.type}#${b.id}: sem planta`); continue; }
      if (!p.ok) add('int', 2, `${b.type}#${b.id}: planta inválida (${(p.errs || []).slice(0, 2).join('; ')})`);
      const s1 = In.shellOf(b), s2 = In.shellOfPlan(p); const strip = o => { const x = Object.assign({}, o); delete x.key; return JSON.stringify(x); };
      if (!s1 || strip(s1) !== strip(s2)) add('int', 1, `${b.type}#${b.id}: a casca de longe não é a da planta`);
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
