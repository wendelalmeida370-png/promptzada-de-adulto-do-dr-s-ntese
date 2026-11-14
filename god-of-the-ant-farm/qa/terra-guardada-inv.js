// terra-guardada-inv: as regras do verificador para o campo cívico (parte da D-160, D-230) e para o fogo nos monumentos de pedra (D-219) —
// Bairros Vivos, o agente M, 3ª rodada. Carregado depois do qa/qa.js (QA.more), como o degraus-inv.js; o líder o junta
// (qa/junta-inv.js). Lê as cidades e os prédios; nenhuma pergunta muda o mundo.
(function () {
  if (!window.QA || !QA.more) return;
  QA.more.push(function (add, s) {
    const V = G.Village, Es = G.Escala; if (!V || !V.civWork || !Es) return;
    const FIELD = { farm: 1, horta: 1, pomar: 1, plantacao: 1, vinhedo: 1, apiario: 1 }; const N = G.N;
    // ---- the civic field a capital keeps (D-230): six tiles a side, on the map; no building on it but the town's own fields
    // (a building put down on it lets it go at once — V.addBuilding); not over the lot of the town's wonder; looked at every day
    for (const set of s.settlements.values()) {
      const r = set.urb && set.urb.civ; if (!r) continue; const tag = `${set.name}: o campo cívico`;
      if (r.type !== 'civico' || r.n !== V.CIVIC_N) add('terra-guardada', 2, `${tag} é de ${r.type}, com ${r.n} casas`);
      if (!(r.x >= 0 && r.y >= 0 && r.x + r.n <= N && r.y + r.n <= N)) { add('terra-guardada', 2, `${tag} sai do mapa (${r.x}, ${r.y}, ${r.n})`); continue; }
      let on = null; for (let y = r.y; y < r.y + r.n && !on; y++) for (let x = r.x; x < r.x + r.n; x++) { const o = s.occ[y * N + x] ? s.buildings.get(s.occ[y * N + x]) : null; if (o && !(o.set === set.id && (FIELD[o.type] || (o.type === 'ruin' && FIELD[o.origType])))) { on = o; break; } }
      if (on) add('terra-guardada', 2, `${tag}: ${on.type}#${on.id} em cima dele — no campo guardado não se ergue nada`);
      const w = set.urb.res; if (w && r.x < w.x + w.n && r.x + r.n > w.x && r.y < w.y + w.n && r.y + r.n > w.y) add('terra-guardada', 2, `${tag} está em cima do campo da maravilha da cidade`);
      if ((r.chk || 0) < s.day - 1) add('terra-guardada', 3, `${tag}: a cidade não olha para ele desde o ano ${r.chk}`);
    }
    // ---- the fire and the great works (D-219): what the fire took of one (b.burnHp) is a count, never negative, never more
    // than the strength it lacks, and only a public work of a bigger step has it; a hall of timber that stands (it burns as a
    // house does) has none — the mark of one burnt going up is undone when it is finished
    for (const b of s.buildings.values()) {
      if (b.type === 'ruin' || !b.burnHp) continue;
      if (!(b.burnHp > 0) || !isFinite(b.burnHp)) add('terra-guardada', 2, `${b.type}#${b.id}: o que o fogo levou é ${b.burnHp}`);
      else if (!V.bigStep(b)) add('terra-guardada', 3, `${b.type}#${b.id} (${b.w}×${b.h}) tem a marca do fogo dos monumentos (${b.burnHp}) e não é um degrau maior de obra pública`);
      else if (!V.stoneWork(b)) add('terra-guardada', 3, `${b.type}#${b.id} (${b.style}) é um salão de madeira de pé e guarda a marca do fogo dos monumentos de pedra (${b.burnHp})`);
      else if (b.burnHp > b.maxHp - b.hp + 1e-6) add('terra-guardada', 3, `${b.type}#${b.id}: o fogo levou ${b.burnHp} e só faltam ${b.maxHp - b.hp} de ${b.maxHp}`);
    }
  });
})();
