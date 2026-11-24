// embriaguez-inv: as regras do verificador para a bebedeira (a taverna, quarta onda — T2, D-830 a D-839) — carregado depois do qa/qa.js
// (QA.more); o líder o junta (qa/junta-inv.js). Lê as pessoas e o livro dos dias da taverna — nenhuma pergunta muda o mundo:
//   · o álcool de cada um é um número bom: o sangue de 0 ao teto (G.Ebrio.MAX), o estômago e o pico não negativos, a ressaca de 0 a 1
//     (S2); ninguém com menos de 14 anos com álcool no corpo (S2);
//   · quem está desmaiado está num estado de desmaio — a tarefa do desmaio, sendo arrastado, à mesa da taverna (a marca da casa), o
//     corpo do deus dormindo —, e quem tem a tarefa do desmaio está desmaiado (S2);
//   · o desmaiado da tarefa do desmaio está deitado (S3); quem é arrastado tem quem o arraste — a tarefa de arrastar com o id dele —,
//     a não ser saindo pela porta (S3);
//   · a marca do desmaio à mesa da taverna só de quem está desmaiado (S3).
(function () {
  if (!window.QA || !QA.more) return;
  QA.more.push(function (add, s) {
    const E = G.Ebrio; if (!E || !s || !s.villagers) return;
    let n1 = 0, n2 = 0, n3 = 0;
    const leaving = v => !!(G.Vg && G.Vg.leaving && G.Vg.leaving(v));
    for (const v of s.villagers.values()) {
      const e = v.ebrio;
      if ((e !== undefined && !(Number.isFinite(e) && e >= 0 && e <= E.MAX + 1e-6)) || (v.ebrioG !== undefined && !(Number.isFinite(v.ebrioG) && v.ebrioG >= 0)) || (v.ebrioP !== undefined && !(Number.isFinite(v.ebrioP) && v.ebrioP >= 0)) || (v.ressaca !== undefined && !(Number.isFinite(v.ressaca) && v.ressaca >= 0 && v.ressaca <= 1 + 1e-6))) { if (n1++ < 3) add('ebrio', 2, `${v.name}#${v.id} com o álcool fora da conta (sangue ${e}, estômago ${v.ebrioG}, ressaca ${v.ressaca})`, v.id); }
      if (v.age < 14 && (v.ebrio > 0 || v.ebrioG > 0) && n1++ < 3) add('ebrio', 2, `${v.name}#${v.id}, ${Math.floor(v.age)} anos, com álcool no corpo`, v.id);
      const t = v.task; const body = !!(s.avatar && s.avatar.id === v.id);
      if (v.ebrioD > 0) {
        let held = false;
        if (body) held = !!v.sleeping;
        else if (t && (t.type === 'desmaio' || t.type === 'arrastado')) held = true;
        else if (t && t.type === 'tavern' && t.st >= 1) held = true; // (the house's: act-taverna.js marks the table — below)
        if (!held && n2++ < 3) add('ebrio', 2, `${v.name}#${v.id} desmaiado de bebida ${t ? 'na tarefa ' + t.type : 'sem afazer'}`, v.id);
        if (t && t.type === 'desmaio' && !v.sleeping && t.age > 1 && !leaving(v) && n3++ < 3) add('ebrio', 3, `${v.name}#${v.id} desmaiado de pé`, v.id);
      } else if (t && t.type === 'desmaio' && t.age > 1 && n2++ < 3) add('ebrio', 2, `${v.name}#${v.id} na tarefa do desmaio sem estar desmaiado`, v.id);
      if (t && t.type === 'arrastado' && !v.inside && t.age > 1) { const a = s.villagers.get(t.id); if (!(a && a.task && a.task.type === 'arrastar' && a.task.id === v.id) && n3++ < 3) add('ebrio', 3, `${v.name}#${v.id} sendo arrastado por ninguém`, v.id); }
    }
    for (const op of s.acts || []) {
      if (op.def !== 'taverna' || !op.data || !op.data.mesa) continue;
      for (const id of Object.keys(op.data.mesa)) { const m = op.data.mesa[id]; if (!m.dz) continue; const v = s.villagers.get(+id); if (v && !(v.ebrioD > 0) && n3++ < 3) add('ebrio', 3, `${v.name}#${v.id} com a marca do desmaio à mesa sem estar desmaiado`, v.id); }
    }
  });
})();
