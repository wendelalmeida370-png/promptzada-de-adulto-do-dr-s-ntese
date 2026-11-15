// aterro-inv: as regras do verificador para o chão aplainado da obra grande (D-217) e a renda média de pedra (D-216) — Bairros
// Vivos, o agente M, 2ª rodada. Carregado depois do qa/qa.js (QA.more), como o degraus-inv.js; o líder o junta
// (qa/junta-inv.js). Lê os prédios e os povos; nenhuma pergunta muda o mundo.
(function () {
  if (!window.QA || !QA.more) return;
  QA.more.push(function (add, s) {
    const V = G.Village, Es = G.Escala; if (!V || !V.levelLot || !Es) return;
    const pub = t => !!G.BDEF[t] && (!!G.BDEF[t].civic || t === 'temple' || t === 'monument');
    // ---- the earth a work's lot had moved: a count of levels, on a public work of a bigger step alone (a ruin keeps its past)
    for (const b of s.buildings.values()) {
      if (b.terra === undefined || b.terra === null || b.type === 'ruin') continue;
      if (!(b.terra > 0) || !isFinite(b.terra)) add('aterro', 2, `${b.type}#${b.id}: a terra aplainada da obra é ${b.terra}`);
      else if (!pub(b.type) || b.w === Es.n0(b.type)) add('aterro', 2, `${b.type}#${b.id} (${b.w}×${b.h}) tem terra aplainada (${b.terra}) e não é um degrau maior de obra pública`);
    }
    // ---- the people's stone income: [the day, its stone, the day before's, the day the mean is brought up to, the mean]
    for (const f of s.factions.values()) {
      const p = f.pedra; if (!p) continue;
      if (!Array.isArray(p) || !(p[0] <= s.day) || !(p[1] >= 0) || !(p[2] >= 0)) { add('aterro', 2, `${f.name}: a conta da renda de pedra é ${JSON.stringify(p)} no dia ${s.day}`); continue; }
      if (p[3] !== undefined && p[3] !== null && (!(p[3] <= s.day) || !(p[4] >= 0) || !isFinite(p[4]))) add('aterro', 2, `${f.name}: a média da renda de pedra é ${JSON.stringify(p.slice(3))} no dia ${s.day}`);
    }
  });
})();
