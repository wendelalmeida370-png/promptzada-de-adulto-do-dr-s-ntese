// corpo-qa: what must always be true of the body's hands on the world (QA.more, loaded after qa/qa.js by the tests of the
// body — inlined into qa.js when the Modo Encarnado's foundation lands):
//   · what the hands asked of the world and the world has not yet done belongs to the body lived now: a body given back, or
//     dead, leaves nothing waiting (it never happened — Possess.release and the death drop it)
//   · the lead to the work near (Interact.lead: the HUD's line and mark) points only at what the world has — an unloading under
//     way, by day, with crates of it on its quay or on the ground; with a crate of it in the hands, the door of a store that is
//     a store (never a ruin, never a place the crate does not go)
(function (G) {
  QA.more.push(function (add, s) {
    if (!G.Possess || !G.Possess.queued) return;
    const q = G.Possess.queued(); const a = s.avatar;
    if (!a && q.length) add('maos', 1, `${q.length} pedido(s) das mãos esperando o passo do mundo sem ninguém encarnado: o corpo devolvido deixou o que pediu`);
    if (a) { const o = q.filter(id => id !== a.id); if (o.length) add('maos', 1, `${o.length} pedido(s) das mãos de outro corpo (#${o[0]}) esperando o passo do mundo, com #${a.id} encarnado`); }
  });
  QA.more.push(function (add, s) {
    const a = s.avatar; if (!a || !G.Interact || !G.Interact.lead || !G.Act) return;
    const v = s.villagers.get(a.id); const L = v ? G.Interact.lead(v) : null; if (!L) return;
    const op = G.Act.get(L.op);
    if (!op || !G.Act.live(op)) { add('pista', 2, `a pista do corpo aponta uma descarga que não existe mais (#${L.op})`); return; }
    if (L.step === 'pegar') {
      const d = s.buildings.get(op.at);
      if (!((d && d.crates) || []).some(c => c.op === op.id) && !(s.loose || []).some(o => o.op === op.id)) add('pista', 2, `a pista do corpo chama para a descarga #${op.id}, que não tem caixa no cais nem no chão`);
      if (op.st !== 'on' || G.isNight()) add('pista', 2, `a pista do corpo chama para a descarga #${op.id} ${G.isNight() ? 'de noite' : 'parada'}`);
    } else {
      const b = s.buildings.get(L.b);
      if (!(v.carry && v.carry.op === op.id)) add('pista', 2, `a pista do corpo manda levar ao armazém uma caixa da descarga #${op.id} que não está nas mãos`);
      if (!b || !G.BDEF[b.type] || !G.BDEF[b.type].dropoff) add('pista', 2, `a pista do corpo leva a caixa da descarga #${op.id} a um lugar que não é armazém (#${L.b}${b ? ' ' + b.type : ''})`);
    }
  });
})(window.G);
