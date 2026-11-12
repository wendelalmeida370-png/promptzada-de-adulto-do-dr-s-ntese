// quintal-inv: as regras do verificador para o quintal — o que há em volta de um prédio desenhado de perto (Bairros Vivos,
// D-186; ao lado das regras de «o que se vê», qa/atmos-inv.js):
//   · o que o prédio tem pelo mundo está desenhado, onde o desenho tem lugar (S3): a casa habitada algo, a do lenhador a lenha,
//     a que guarda bebida o barril, a taverna com o que servir os barris, a olaria com peças cruas os potes;
//   · nada desenhado sem causa (S3): lenha sem lenhador, barril sem bebida, coisas de um ofício que não mora ali, barris de
//     prateleira vazia, potes sem nada cru, coisa em casa vazia;
//   · nenhuma coisa onde não pode (S3): fora do lote, dentro de uma parede, em chão que se anda, na soleira ou nos degraus de
//     uma porta, na frente de uma porta, sobre uma janela, uma em cima da outra.
// O que o prédio tem é contado aqui de novo dos campos do mundo (quem mora, os ofícios, os bens da casa, a prateleira, as peças
// cruas das fornadas); o que está desenhado é perguntado ao desenho (Props3D.pieces: o prédio desenhado de novo, a caixa de
// cada coisa no lote); onde uma coisa pode ficar é contado da casca e do mapa do mundo, nunca das faixas do Props3D. As regras
// são QA.yard(lista) — as provas dão o mundo inteiro (qa/quintal.js) —; o verificador olha a dúzia de prédios mais perto do
// corpo, onde o 3D está feito: sem ele, ou sem corpo, nada. Carregado depois do qa/qa.js (QA.more); o junta-inv.js o leva
// para dentro do qa.js.
(function () {
  if (!window.QA || !QA.more) return;
  const housing = b => !!(b && G.BDEF[b.type] && G.BDEF[b.type].housing);
  // ------------------------------ the yard: what lies about a building drawn near (D-186) ------------------------------
  // (what a building has is counted here again from the world's own fields; what is drawn is asked of the drawing — Props3D.pieces:
  // the building drawn again with what lies about it, each piece's box on its lot; where a piece may be is reckoned from the
  // shell and the world's map, never from Props3D's own strips)
  const DRINK = ['vinho', 'mel', 'cerveja', 'pulque', 'azeite', 'oleo'], POUR = ['vinho', 'mel', 'cerveja', 'pulque'];
  const TRADES = { pescador: 1, cacador: 1, guerreiro: 1, arqueiro: 1, tecelao: 1, agricultor: 1, coletor: 1, vinhateiro: 1 };
  QA.yard = function (list) {
    const P3 = G.Props3D, B3 = G.Build3D, Sp = G.Space, s = G.S, A = G.Act; const out = []; if (!P3 || !P3.made || !P3.made() || !A) return out;
    const L = Sp.TILE; const homes = new Map();
    for (const v of s.villagers.values()) if (v.home > 0) { let h = homes.get(v.home); if (!h) homes.set(v.home, h = { res: 0, roles: new Set() }); h.res++; if (v.role && v.age >= 14 && !v.captive) h.roles.add(v.role); }
    const cru = new Map(); for (const op of A.all()) if (op.def === 'oficio' && A.live(op) && op.data && op.data.cru > 0) cru.set(op.at, (cru.get(op.at) || 0) + op.data.cru);
    const q0 = G.Realm && G.Realm.Q ? G.Realm.Q() : null; const whole = !q0 || q0.props === undefined || q0.props >= 1; // (the preset draws all of the decoration)
    for (const b of list) {
      if (!b || !b.built || b.type === 'ruin') continue; const house = housing(b); if (!house && b.type !== 'taverna' && b.type !== 'olaria') continue;
      const pcs = P3.pieces(b); const T = pcs.map(p => p.thing).filter(Boolean); const tag = `${b.type}#${b.id}`; const I = b.inv || {};
      const h = house ? homes.get(b.id) : null; const res = h ? h.res : 0; const roles = h ? h.roles : new Set();
      const drink = DRINK.filter(k => (I[k] || 0) >= 1).length, pour = POUR.reduce((a, k) => a + (I[k] || 0), 0), raw = cru.get(b.id) || 0;
      // drawn with no cause in the world
      if (house && !res && pcs.length) out.push([3, `${tag} vazia com ${pcs.length} coisa(s) desenhada(s) em volta`, b.id]);
      if (T.includes('lenha') && !roles.has('lenhador')) out.push([3, `${tag} com lenha desenhada sem lenhador na casa`, b.id]);
      if (T.includes('barril') && !drink) out.push([3, `${tag} com barril desenhado sem bebida nem óleo na casa`, b.id]);
      for (const t of T) if (TRADES[t] && !roles.has(t)) out.push([3, `${tag} com coisas de ${t} desenhadas sem ${t} na casa`, b.id]);
      if (T.includes('barris') && (b.type !== 'taverna' || pour < 1)) out.push([3, `${tag} com barris desenhados e a prateleira vazia`, b.id]);
      if (T.includes('potes') && (b.type !== 'olaria' || !(raw > 0))) out.push([3, `${tag} com potes desenhados sem nada cru secando`, b.id]);
      // has, and nothing drawn — where its picture has room: a strip a stride long at the least
      const room = P3.roomOf(b) > 0 && P3.spanOf(b) >= 0.9;
      const must = house ? (roles.has('lenhador') ? 'a lenha do lenhador' : drink ? 'bebida' : '') : b.type === 'taverna' ? (pour >= 1 ? 'o que servir' : '') : raw > 0 ? 'potes crus' : '';
      if (room && !pcs.length && (must || (whole && res > 0))) out.push([3, `${tag} tem ${must || res + ' morador(es)'} pelo mundo e nada desenhado em volta (o desenho tem ${P3.roomOf(b)} faixa(s) de lugar)`, b.id]);
      if (!pcs.length) continue;
      // drawn where it may not be
      const Sh = B3.shellOf ? B3.shellOf(b) : null; const sh = Sh && Sh.shell; const X0 = b.x * L, Z0 = b.y * L, lw = b.w * L, ld = b.h * L; const made = !!(Sp.planMade && Sp.planMade(b));
      const solids = sh && sh.kind === 'rect' ? [sh.r].concat((sh.annex || []).map(a => a.r), sh.yard ? [sh.yard.r] : [], (Sh.steps || []).map(q => q.r)) : [];
      const byLv = Sh ? new Map(Sh.levels.map(l => [l.lv, l])) : null; const doors = [], wins = [];
      if (sh && sh.kind === 'rect') for (const hl of Sh.holes) { const w = Sh.byId.get(hl.wall); const l = w && byLv.get(w.lv); if (!l || l.kind === 'terraco') continue; const y0 = l.y + (hl.sill || 0);
        const Lw = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1; const tx = (w.b[0] - w.a[0]) / Lw, tz = (w.b[1] - w.a[1]) / Lw; const cx = w.a[0] + tx * hl.at, cz = w.a[1] + tz * hl.at; const ax = Math.abs(tz) < 0.5;
        // (the ground before the opening: from its wall out to the lot's edge, away from the middle of what the wall belongs to)
        const mid = w.kind === 'cerca' && sh.yard ? sh.yard.r : sh.r; const sg = ax ? (cz > (mid[1] + mid[3]) / 2 ? 1 : -1) : (cx > (mid[0] + mid[2]) / 2 ? 1 : -1);
        const hw = hl.w / 2 + (hl.kind === 'janela' ? 0.02 : 0.3); const near = ax ? cz : cx, edge = sg > 0 ? (ax ? ld : lw) : 0, far = Math.abs(edge - near) > 1.2 ? near + sg * 1.2 : edge; // (a stride out at the most: a door onto a yard)
        const r = ax ? [cx - hw, Math.min(near, far), cx + hw, Math.max(near, far)] : [Math.min(near, far), cz - hw, Math.max(near, far), cz + hw];
        // (an opening behind an annex is the annex's door, the inside's: no way out there)
        const o3 = ax ? [cx, cz + sg * (w.t / 2 + 0.3)] : [cx + sg * (w.t / 2 + 0.3), cz]; if ((sh.annex || []).some(q => o3[0] > q.r[0] && o3[0] < q.r[2] && o3[1] > q.r[1] && o3[1] < q.r[3])) continue;
        if (hl.kind !== 'janela') { if (y0 < 2.2) doors.push(r); } else if (y0 < 2.4) wins.push({ r, top: y0 - 0.45, sill: y0 }); }
      const over = (p, r, e) => Math.min(p.x1, r[2]) - Math.max(p.x0, r[0]) > e && Math.min(p.z1, r[3]) - Math.max(p.z0, r[1]) > e;
      let n = 0; const bad = msg => { if (n++ < 2) out.push([3, `${tag}: ${msg}`, b.id]); };
      pcs.forEach((p, k) => {
        const what = p.thing || 'coisa';
        if (![p.x0, p.x1, p.z0, p.z1, p.y].every(Number.isFinite)) { bad(`${what} com números que não são números`); return; }
        if (p.x0 < -0.02 || p.z0 < -0.02 || p.x1 > lw + 0.02 || p.z1 > ld + 0.02) bad(`${what} fora do lote (${p.x0.toFixed(2)}..${p.x1.toFixed(2)}, ${p.z0.toFixed(2)}..${p.z1.toFixed(2)} num lote de ${lw} × ${ld} m)`);
        for (const r of solids) if (over(p, r, 0.005)) { bad(`${what} dentro de uma parede (entra ${Math.min(Math.min(p.x1, r[2]) - Math.max(p.x0, r[0]), Math.min(p.z1, r[3]) - Math.max(p.z0, r[1])).toFixed(2)} m)`); break; }
        if (sh && sh.kind === 'round' && [[p.x0, p.z0], [p.x1, p.z0], [p.x0, p.z1], [p.x1, p.z1]].some(c => Math.hypot(c[0] - sh.cx, c[1] - sh.cz) < sh.r - 0.005)) bad(`${what} dentro da parede redonda`);
        // (where a body or anyone stands: the world's map, the plan's doorsteps, the steps before the doors)
        if (sh) for (const [fx, fz] of [[0.5, 0.5], [0.02, 0.02], [0.98, 0.02], [0.02, 0.98], [0.98, 0.98]]) { const X = X0 + p.x0 + (p.x1 - p.x0) * fx, Z = Z0 + p.z0 + (p.z1 - p.z0) * fz;
          if (Sp.surface(X, Z).walk) { bad(`${what} em chão que se anda`); break; }
          if (Sp.stepTop(X, Z) > -Infinity) { bad(`${what} sobre os degraus de uma porta`); break; }
          if (made) { const q = Sp.indoor(X, Z); if (q && q.b === b && q.walk) { bad(`${what} onde o corpo pisa (a soleira de uma porta)`); break; } } }
        for (const r of doors) if (over(p, r, 0.01)) { bad(`${what} na frente de uma porta`); break; }
        if (p.thin) { if (Math.abs(p.y + 0.02) > 1e-6) bad(`${what} fina fora da soleira da fundação (${p.y.toFixed(2)} m)`);
          for (const w of wins) if (p.hgt > w.top + 1e-6 && over(p, w.r, 0.01)) { bad(`${what} (${p.hgt.toFixed(2)} m de alto) sobre uma janela de peitoril a ${w.sill.toFixed(2)} m`); break; } }
        for (let j = 0; j < k; j++) if (over(p, pcs[j], 0.01)) { bad(`${what} em cima de ${pcs[j].thing || 'outra coisa'}`); break; }
      });
    }
    return out;
  };
  QA.more.push(function (add) {
    const P3 = G.Props3D; if (!P3 || !P3.made || !P3.made()) return;
    // (the buildings near the body, the nearest dozen: the ones drawn near — nothing without a body)
    const f = G.Possess && G.Possess.body && G.Possess.body(); if (!f) return;
    const near = [...G.S.buildings.values()].filter(b => b.built && (housing(b) || b.type === 'taverna' || b.type === 'olaria') && G.dist(b.x + b.w / 2, b.y + b.h / 2, f.x, f.y) < 8).sort((a, c) => G.dist(a.x + a.w / 2, a.y + a.h / 2, f.x, f.y) - G.dist(c.x + c.w / 2, c.y + c.h / 2, f.x, f.y)).slice(0, 12);
    for (const [sev, msg, id] of QA.yard(near).slice(0, 4)) add('atmos', sev, msg, id);
  });
})();
