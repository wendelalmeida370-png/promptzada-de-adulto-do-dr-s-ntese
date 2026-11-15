// freguesia-inv: as regras do verificador para a freguesia dos banhos e da biblioteca (Bairros Vivos, D-200, D-201; L-717) —
// carregado depois do qa/qa.js (QA.more), como o termas-grandes-inv.js; o líder o junta (qa/junta-inv.js). Lê as pessoas, o
// livro do dia dos banhos e o da biblioteca — nenhuma pergunta muda o mundo. Valem enquanto houver quem vá aos banhos e à
// biblioteca por vontade sua (G.Termas.urge, G.Biblioteca.urge) ou pelo passeio (G.City.leisureTask):
//   · ninguém cativo ou preso com a ida aos banhos ou à biblioteca (S2) — a vontade é de quem é livre;
//   · ninguém lê num povo sem a escrita, e a idade é a de cada porta: 6 anos nos banhos, 10 na biblioteca (S2);
//   · um banho por dia e um rolo por dia (S3): quem já se banhou hoje (v.bathDay) não está de novo nos banhos sem ser para
//     sair, nem quem já leu hoje (v.readDay) está de novo à mesa — fora o corpo do deus, que se banha e lê quando o jogador manda;
//   · ninguém a caminho com uma carga nas mãos, nem dormindo (S3) — a regra das mãos ocupadas, D-094.
(function () {
  if (!window.QA || !QA.more) return;
  const rule = function (add, s) {
    const A = G.Act; if (!A) return;
    const body = s.avatar ? s.avatar.id : 0;
    const lit = v => { const f = G.Fac && G.Fac.ofV ? G.Fac.ofV(v) : null; return !!(f && f.tech && f.tech.known && f.tech.known.escrita); };
    // ---- who has the errand
    for (const v of s.villagers.values()) {
      const t = v.task; if (!t || (t.type !== 'termas' && t.type !== 'ler')) continue;
      const bath = t.type === 'termas'; const nm = `${v.name} #${v.id}`; const where = bath ? 'aos banhos' : 'à biblioteca';
      if (v.captive || v.jail) add('freguesia', 2, `${nm} ${v.captive ? 'cativo' : 'preso'} com a ida ${where} (${t.st ? 'lá dentro' : 'a caminho'})`);
      if (v.age < (bath ? 6 : 10)) add('freguesia', 2, `${nm}, ${Math.floor(v.age)} anos, com a ida ${where}`);
      if (!bath && !lit(v)) add('freguesia', 2, `${nm} com a ida à biblioteca num povo sem a escrita`);
      if (t.st === 0 && v.id !== body) {
        if (v.carry && v.carry.n > 1e-6) add('freguesia', 3, `${nm} a caminho ${bath ? 'dos banhos' : 'da biblioteca'} com uma carga nas mãos (${v.carry.k})`);
        if (v.sleeping) add('freguesia', 3, `${nm} a caminho ${bath ? 'dos banhos' : 'da biblioteca'} dormindo`);
      }
    }
    // ---- a bath a day
    for (const op of s.acts || []) {
      if (op.def !== 'termas' || !A.live(op) || !op.data || !op.data.banho) continue;
      for (const id in op.data.banho) { const m = op.data.banho[id]; const v = s.villagers.get(+id); if (!v || m.body || v.id === body) continue;
        if (v.bathDay === s.day && !m.done) add('freguesia', 3, `${v.name} #${v.id} já se banhou hoje e está de novo nos banhos #${op.at} — dois banhos num dia`); }
    }
    // ---- a scroll a day
    for (const b of s.buildings.values()) {
      if (b.type !== 'biblioteca' || !b.livros || !b.livros.quem) continue;
      for (const id in b.livros.quem) { const v = s.villagers.get(+id); if (!v || v.id === body) continue;
        if (v.readDay === s.day && v.task && v.task.type === 'ler' && v.task.id === b.id) add('freguesia', 3, `${v.name} #${v.id} já leu hoje e está de novo à mesa da biblioteca #${b.id} — dois rolos num dia`); }
    }
  };
  QA.more.push(rule); QA.freguesia = rule;
})();
