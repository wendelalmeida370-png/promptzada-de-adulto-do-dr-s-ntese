// degraus-inv: as regras do verificador para os degraus grandes que nascem sozinhos (Bairros Vivos, o agente M: D-174 a D-177)
// — carregado depois do qa/qa.js (QA.more), como o escala-inv.js; o líder o junta (qa/junta-inv.js). Lê a cidade e os prédios
// e pergunta ao G.Village e ao G.Escala (nenhuma pergunta muda o mundo).
(function () {
  if (!window.QA || !QA.more) return;
  QA.more.push(function (add, s) {
    const V = G.Village, Es = G.Escala; if (!V || !Es || !V.keeps) return;
    const pub = t => !!G.BDEF[t] && (!!G.BDEF[t].civic || t === 'temple' || t === 'monument');
    for (const set of s.settlements.values()) {
      // ---- the great work that keeps its people's stone (D-174: set.gw, the planner's): a public work of the town going up, of a
      // bigger step than its type's own or being enlarged. One that stood or fell since the planner's last look keeps nothing
      const b = set.gw ? s.buildings.get(set.gw) : null;
      if (b && !b.built && b.type !== 'ruin') {
        if (b.set !== set.id) add('degraus', 2, `${set.name}: guarda a pedra para ${b.type}#${b.id}, que é de outra cidade (D-174)`);
        else if (!pub(b.type) || !(b.amp || b.w !== Es.n0(b.type))) add('degraus', 2, `${set.name}: guarda a pedra para ${b.type}#${b.id} (${b.w} casas), que não é uma obra grande (D-174)`);
      }
      const k = V.keeps(set);
      if (!(k >= 0) || !Number.isFinite(k)) add('degraus', 1, `${set.name}: a pedra guardada para a obra grande é ${k}`);
      // (and the stone it keeps is the stone its work waits for, never more: a work with its stone in keeps nothing)
      else if (b && k > (b.need && b.need.stone || 0) + 1e-6) add('degraus', 2, `${set.name}: guarda ${Math.round(k)} de pedra e a obra só espera ${Math.round((b.need && b.need.stone) || 0)}`);
    }
    // ---- one family, one house being raised (the rich house and the needed one go by the same door: T-447, D-177)
    const seen = new Map();
    for (const b of s.buildings.values()) {
      const o = b.encomenda; if (!o || b.built || !Array.isArray(o.fam)) continue;
      for (const id of o.fam) { if (seen.has(id)) add('degraus', 2, `#${id} espera duas casas encomendadas (${seen.get(id)} e ${b.type}#${b.id})`); else seen.set(id, `${b.type}#${b.id}`); }
      // ---- the rich house is a family's own choice (D-106, T-447): raised only where its people knows the step, paid for
      if (o.why === 'rica' && (b.type !== 'house' || b.w === Es.n0('house'))) add('degraus', 2, `${b.type}#${b.id}: encomendada como casa rica e é ${b.type} de ${b.w} casa(s)`);
      if (o.why === 'rica' && !(o.paid > 0)) add('degraus', 2, `house#${b.id}: a casa rica encomendada sem preço pago`);
    }
    // ---- the people gather on the square (the matrix's «cidade/juntar»): who is called to a vote or to the bread, in a town with
    // a square standing, goes to a square of it (S3: a square finished while the people were on their way is no fault)
    for (const v of s.villagers.values()) {
      const t = v.task; if (!t || t.type !== 'assembly' || (t.why !== 'voto' && t.why !== 'pao')) continue;
      let any = false, on = false;
      for (const b of s.buildings.values()) { if (b.set !== v.set || !b.built || b.type !== 'praca') continue; any = true; if (t.x >= b.x && t.x <= b.x + b.w && t.y >= b.y && t.y <= b.y + b.h) on = true; }
      if (any && !on) add('degraus', 3, `${v.name} #${v.id}: chamado ${t.why === 'voto' ? 'ao voto' : 'ao pão'} fora da praça da cidade (${t.x.toFixed(1)}, ${t.y.toFixed(1)})`);
    }
  });
})();
