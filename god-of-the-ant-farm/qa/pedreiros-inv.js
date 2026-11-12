// pedreiros-inv: a regra do verificador para as minas e os pedreiros (L-785) — Bairros Vivos, o agente M, 3ª rodada. Carregado
// depois do qa/qa.js (QA.more), como o degraus-inv.js; o líder o junta (qa/junta-inv.js). Lê as cidades e as pessoas; não muda o mundo.
(function () {
  if (!window.QA || !QA.more) return;
  QA.more.push(function (add, s) {
    if (!G.Eco || !G.Eco.CREW_CAP) return;
    // ---- the «mineiros» of a town with a post in one of its mines are no more than the crew its planner gave the mines
    // (set.minaN, village.js): the others are the stone's. A town not planned yet — a save of before — has no count
    for (const set of s.settlements.values()) {
      if (set.minaN === undefined) continue; let n = 0;
      for (const v of s.villagers.values()) { if (v.set !== set.id || v.role !== 'mineiro' || !v.job || v.captive) continue; const b = s.buildings.get(v.job); if (b && b.type === 'mina' && b.set === set.id) n++; }
      if (n > set.minaN) add('pedreiros', 3, `${set.name}: ${n} mineiros com posto na mina, e a turma que o planejador deu às minas é ${set.minaN}`);
    }
  });
})();
