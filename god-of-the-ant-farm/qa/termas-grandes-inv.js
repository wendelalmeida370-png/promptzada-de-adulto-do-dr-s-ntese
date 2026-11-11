// termas-grandes-inv: as regras do verificador para as termas e os lugares na água (T-784, D-183) — carregado depois do
// qa/qa.js (QA.more), como o escala-inv.js; o líder o junta (qa/junta-inv.js). Lê o prédio, o dia dos banhos e a tabela dos
// lugares da planta (G.Interiors) — nenhuma pergunta muda o mundo. Valem para os banhos de qualquer degrau com planta:
//   · nunca mais gente na água que os lugares de banhar da planta (S2) — o repartidor dá um lugar a cada um; um a mais ficaria
//     de pé no chão, «na água» sem estar em piscina nenhuma;
//   · quem está na água está num lugar de banhar (S3) — fora quando o corpo do deus está lá dentro, que toma o lugar que quer;
//   · as termas de um degrau maior, de pé, têm onde o dia dos banhos acontece (S2): piscinas com lugar na água alcançado da
//     porta (três pelo menos), cabides, a fornalha com o posto do foguista — sem isso o prédio é só uma casca grande.
(function () {
  if (!window.QA || !QA.more) return;
  const rule = function (add, s) {
    const In = G.Interiors, A = G.Act, Es = G.Escala; if (!In || !In.table || !A || !G.Termas) return;
    const reached = (t, use) => (t.byUse.get(use) || []).filter(e => e.din < Infinity);
    const body = s.avatar ? s.villagers.get(s.avatar.id) : null;
    // ---- the places in the water
    for (const op of s.acts || []) {
      if (op.def !== 'termas' || !A.live(op)) continue; const b = s.buildings.get(op.at); if (!b || !b.built || b.type !== 'banhos' || !b.ip) continue;
      const t = In.table(b); if (!t) continue; const places = reached(t, 'banhar').length; const inW = [];
      for (const id in (op.data && op.data.banho) || {}) { const v = s.villagers.get(+id); if (!v || v === body || v.inside !== b.id) continue; const k = v.task; if (k && k.type === 'termas' && k.op === op.id && k.st === 2) inW.push(v); }
      if (inW.length > places) add('termas', 2, `banhos#${b.id} (${b.w} casas): ${inW.length} na água e ${places} lugares de banhar na planta — um a mais que as piscinas`);
      else if (!(body && body.inside === b.id)) for (const v of inW) { const pl = In.placeOf(v); if (!pl || pl.use !== 'banhar') { add('termas', 3, `banhos#${b.id}: ${v.name} #${v.id} na água fora de um lugar de banhar (${pl ? pl.use || pl.pose : 'sem lugar'})`); break; } }
    }
    // ---- the thermae standing have where the baths' day happens
    if (!Es) return;
    for (const b of s.buildings.values()) {
      if (b.type !== 'banhos' || !b.built || !b.ip || !(b.w > Es.n0('banhos'))) continue;
      const t = In.table(b); if (!t) { add('termas', 2, `banhos#${b.id} (${b.w} casas): as termas de pé sem a tabela dos lugares — a planta não se arma`); continue; }
      const water = reached(t, 'banhar'); const pools = new Set(water.map(e => e.it.id)).size; const pegs = reached(t, 'despir').length; const fire = reached(t, 'alimentar').filter(e => e.it.job).length;
      if (pools < 3 || water.length < 20 || pegs < 4 || !fire) add('termas', 2, `banhos#${b.id} (${b.w} casas): as termas com ${pools} piscinas alcançadas da porta (${water.length} lugares na água), ${pegs} cabides e ${fire ? 'a' : 'NENHUMA'} fornalha com o posto do foguista — o dia dos banhos não tem onde acontecer`);
    }
  };
  QA.more.push(rule); QA.termasGrandes = rule;
})();
