// escala-inv: as regras do verificador para a escala de cada prédio (D-106, a Arquitetura Monumental) — carregado depois do
// qa/qa.js (QA.more), como o forma-inv.js; o líder o junta (qa/junta-inv.js). Lê o prédio e pergunta ao G.Escala, ao G.Forma
// e ao G.Interiors (nenhuma pergunta muda o mundo).
(function () {
  if (!window.QA || !QA.more) return;
  QA.more.push(function (add, s) {
    const Es = G.Escala, Fo = G.Forma, In = G.Interiors; if (!Es) return;
    for (const b of s.buildings.values()) {
      if (b.type === 'ruin' || !G.BDEF[b.type]) continue;
      // ---- the lot is a step of the type's ladder: square, of a size the ladder has (a building of before, its type's own)
      if (b.w !== b.h) add('escala', 2, `${b.type}#${b.id}: o lote de ${b.w} × ${b.h} casas — todo lote é quadrado (D-106)`);
      else if (!Es.steps(b.type).some(st => st.n === b.w)) add('escala', 2, `${b.type}#${b.id}: o lote de ${b.w} casas não é um degrau da escada do tipo (${Es.steps(b.type).map(st => st.n).join(', ')})`);
      // ---- the lot, the form and the plan of one size: a type with a form has one at the building's size (the god and the body
      // draw it, the plan reads it), and the plan's record keeps the building's lot — else the three would be three buildings
      const st = b.style || 'classico';
      if (Fo && Fo.has(b.type, st)) {
        const F = Fo.of(b.type, st, b.w);
        if (!F) add('escala', 1, `${b.type}#${b.id} (${st}): ${b.w} × ${b.w} casas e nenhuma forma desse tamanho — o deus, o corpo e a planta não teriam o que desenhar`);
        else if (Math.abs(F.L - b.w * 4) > 1e-6) add('escala', 1, `${b.type}#${b.id}: a forma de ${F.L} m num lote de ${b.w * 4} m`);
      }
      if (b.ip && In && In.nOf && In.nOf(b.ip) !== b.w) add('escala', 1, `${b.type}#${b.id}: o registro da planta é de um lote de ${In.nOf(b.ip)} casas e o prédio tem ${b.w} — a planta seria de outro prédio`);
    }
    // ---- the lot a capital keeps for a great work (D-121): a step of the work, on the map; no building on it but the town's own
    // fields (a building put down on it lets it go at once — V.addBuilding); the town looks at it every day
    const FIELD = { farm: 1, horta: 1, pomar: 1, plantacao: 1, vinhedo: 1, apiario: 1 }; const N = G.N;
    for (const set of s.settlements.values()) {
      const r = set.urb && set.urb.res; if (!r) continue;
      const tag = `${set.name}: o campo guardado para ${r.type}/${r.esc}`; const st = Es.steps(r.type).find(q => q.id === r.esc);
      if (!st || st.n !== r.n) add('escala', 2, `${tag} tem ${r.n} casas, e não é um degrau do tipo`);
      if (!(r.x >= 0 && r.y >= 0 && r.x + r.n <= N && r.y + r.n <= N)) { add('escala', 2, `${tag} sai do mapa (${r.x}, ${r.y}, ${r.n})`); continue; }
      let on = null; for (let y = r.y; y < r.y + r.n && !on; y++) for (let x = r.x; x < r.x + r.n; x++) { const o = s.occ[y * N + x] ? s.buildings.get(s.occ[y * N + x]) : null; if (o && !(o.set === set.id && FIELD[o.type])) { on = o; break; } }
      if (on) add('escala', 2, `${tag}: ${on.type}#${on.id} em cima dele — no campo guardado não se ergue nada`);
      if ((r.chk || 0) < s.day - 1) add('escala', 3, `${tag}: a cidade não olha para ele desde o ano ${r.chk}`);
    }
    // ---- the audience at the palace (D-124): who is in one goes to the ready palace its people's audience is in, or is in it, at a
    // place of the allotter
    for (const v of s.villagers.values()) {
      const t = v.task; if (!t || t.type !== 'assembly' || t.kind !== 'audiencia') continue;
      const b = s.buildings.get(t.b); const f = G.Fac.get(t.fid);
      if (!b || !b.built || b.type === 'ruin' || !b.ip || !G.Court || !G.Court.RANK[b.type]) add('escala', 2, `${v.name} #${v.id}: em audiência num palácio que não está pronto de pé (#${t.b})`);
      else if (!f || !f.aud || f.aud.b !== b.id) add('escala', 2, `${v.name} #${v.id}: em audiência no palácio #${b.id}, e o povo não tem audiência nele`);
      else if (v.inside && v.inside !== b.id) add('escala', 2, `${v.name} #${v.id}: em audiência no palácio #${b.id}, dentro de outro prédio (#${v.inside})`);
      else if (v.id !== f.aud.ruler && v.set !== b.set) add('escala', 3, `${v.name} #${v.id}: em audiência no palácio #${b.id}, de outra cidade`);
      else if (v.inside === b.id && In && In.places) { const P = In.places(b); if (!P.by.has(v.id) && !P.with.has(v.id)) add('escala', 3, `${v.name} #${v.id}: na audiência dentro do palácio #${b.id} sem um lugar do repartidor`); }
    }
  });
})();
