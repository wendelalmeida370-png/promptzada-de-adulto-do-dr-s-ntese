// saber-inv: as regras do verificador para os degraus maiores do saber e do governo da cidade (D-192, os Bairros Vivos; o
// agente B) — a grande biblioteca. Carregado depois do qa/qa.js (QA.more), como o poder-inv.js; o líder o junta
// (qa/junta-inv.js). Lê o prédio, o livro do dia dele e a tabela dos lugares da planta (nenhuma pergunta muda o mundo: a
// planta é função do registro, e a tabela dela fica na memória do motor das plantas, fora do save).
(function () {
  if (!window.QA || !QA.more) return;
  QA.saber = function (add, s) {
    const In = G.Interiors, Bi = G.Biblioteca, E = G.Eco; if (!In || !In.table || !Bi || !Bi.copistas || !E) return;
    for (const b of s.buildings.values()) {
      if (b.type !== 'biblioteca' || !b.built || !b.ip || !In.TYPES[b.ip.t] || b.ip.t !== b.type) continue;
      const t = In.table(b); if (!t || !t.byUse) continue; // (a plan that is not laid out: the interiors' own rule says so)
      const n = use => (t.byUse.get(use) || []).filter(e => e.ok).length;
      // ---- the hands the library employs have each a desk in its plan: the grand library's three copyists (E.jobsOf) —
      // the plan's own rule only asks for the type's one (BDEF.jobs)
      const j = E.jobsOf(b); const desks = n('escrever');
      if (j && j.n > desks) add('saber', 2, `biblioteca#${b.id} (${b.style || 'classico'}, ${b.w} casas): emprega ${j.n} copistas e a planta só tem ${desks} mesas de escriba`);
      // ---- nobody reads standing: the readers of the book of the day are no more than the places of reading of the plan
      // (G.Biblioteca asks In.freePlace before each one comes in)
      const q = b.livros && b.livros.quem ? Object.keys(b.livros.quem).length : 0; const seats = n('ler');
      if (q > seats) add('saber', 2, `biblioteca#${b.id}: ${q} lendo e a planta só tem ${seats} lugares de ler`);
      // ---- a grand library has what its step promises: twice the readers of the biggest classic one, the three desks
      if (Bi.grande(b) && In.GRANDE_BIBLIOTECA && (seats < In.GRANDE_BIBLIOTECA.ler || desks < In.GRANDE_BIBLIOTECA.escribas)) add('saber', 2, `biblioteca#${b.id} (${b.style || 'classico'}): a grande biblioteca com ${seats} lugares de ler e ${desks} mesas de escriba (o degrau: ${In.GRANDE_BIBLIOTECA.ler} e ${In.GRANDE_BIBLIOTECA.escribas})`);
    }
  };
  QA.more.push(QA.saber); // (by its name too, for the proofs that ask this rule alone: qa/saber.js)
})();
