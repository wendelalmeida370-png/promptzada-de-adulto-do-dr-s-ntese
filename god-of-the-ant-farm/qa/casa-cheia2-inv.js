// casa-cheia2-inv: as regras do verificador da segunda rodada da casa cheia (Bairros Vivos, o agente H: D-235 a D-238, L-973,
// L-974) — carregado depois do qa/qa.js (QA.more), como o casa-cheia-inv.js; o líder o junta (qa/junta-inv.js). Só lê.
//   H7  (S2) a cabana dos moços de uma casa (b.encomenda.mocos) é obra de mãos, só de crescidos, e o dono é o mais velho deles
//   H8  (S3) quem mora numa casa não fica com moedas suas no bolso além de um dia da cidade (L-973: o bolso de quem tem teto
//            vai ao pote da casa; o que um ladrão levou e ainda deve fica escondido). A regra lembra o dia em que viu o bolso
//   H9  (S2) ninguém deixa a sede três vezes no mesmo dia (L-974: o par de quem pode morar nela entrava pelo repartidor de
//            casas e saía pela porta da sede a cada poucos segundos)
//   H10 (S3) a casa vazia do povo que uma família da cidade espera (G.Casa.heldFor) não é tomada por um solteiro sozinho que
//            o repartidor mandou (D-236). A regra lembra as casas guardadas da olhada de antes
(function () {
  if (!window.QA || !QA.more) return;
  const bolso = { s: null, m: new Map() }; // (the purses seen on someone with a roof: id → the day first seen)
  const guard = { s: null, m: new Map() }; // (the houses seen held for a family: id → the day seen)
  if (QA.canonMore) QA.canonMore.push(['casa-cheia2', () => (G.S ? [...G.S.buildings.values()].filter(b => b.encomenda && b.encomenda.mocos).sort((a, b) => a.id - b.id).map(b => [b.id, b.encomenda.mocos, b.encomenda.fam.length]) : null)]);
  QA.more.push(function (add, s) {
    const K = G.Casa, V = G.Village; if (!K || !K.mates || !K.heldFor || !V) return;
    const P = id => (id && s.villagers.get(id)) || null;
    const housing = b => !!(b && G.BDEF[b.type] && G.BDEF[b.type].housing);
    // ---- H7: the hut of the grown single ones of a house
    for (const b of s.buildings.values()) {
      const o = b.encomenda; if (!o || !o.mocos || b.built) continue; const nm = `${b.type}#${b.id}`;
      const fam = Array.isArray(o.fam) ? o.fam.map(P).filter(Boolean) : [];
      if (fam.some(m => m.age < 16)) add('casa-cheia', 2, `${nm}: cabana dos moços de uma casa com um pequeno escrito nela (D-235)`);
      if (!o.maos) continue; // (with no grown hands left it is the people's builders': D-222)
      const eld = fam.slice().sort((a, c) => c.age - a.age || a.id - c.id)[0];
      if (eld && b.dono !== eld.id) add('casa-cheia', 2, `${nm}: cabana dos moços de uma casa e o dono (#${b.dono || 0}) não é o mais velho deles (${eld.name} #${eld.id}) (D-235)`);
    }
    // ---- H8: the purse of who has a roof
    if (bolso.s !== s) { bolso.s = s; bolso.m.clear(); }
    let loot = null; const seen = new Set();
    for (const v of s.villagers.values()) {
      if (!(v.purse > 0.02) || v.captive || !v.home) continue; const h = s.buildings.get(v.home); if (!h || !V.livable(h)) continue;
      if (!loot) { loot = new Map(); for (const c of s.crimes || []) if (c.st === 'aberto') loot.set(c.thief, (loot.get(c.thief) || 0) + (c.n || 0)); }
      const own = v.purse - (loot.get(v.id) || 0); if (!(own > 0.02)) continue;
      seen.add(v.id); const d = bolso.m.get(v.id);
      if (d === undefined || d > s.day) bolso.m.set(v.id, s.day);
      else if (s.day - d >= 2) add('casa-cheia', 3, `${v.name} #${v.id} mora numa casa e tem ${own.toFixed(2)} moedas suas no bolso desde o dia ${d} (L-973)`);
    }
    for (const id of [...bolso.m.keys()]) if (!seen.has(id)) bolso.m.delete(id);
    // ---- H9: out of the seat again and again
    for (const v of s.villagers.values()) {
      let n = 0; for (const m of v.moves || []) if (m[0] === s.day && m[1] === 'deixou a casa de quem governa') n++;
      if (n >= 3) add('casa-cheia', 2, `${v.name} #${v.id} deixou a sede ${n} vezes no dia ${s.day} (L-974)`);
    }
    // ---- H10: the people's empty house kept for a family, taken by one alone
    if (guard.s !== s) { guard.s = s; guard.m.clear(); }
    const now = new Map();
    for (const set of s.settlements.values()) {
      let any = false; for (const b of s.buildings.values()) if (b.set === set.id && b.built && housing(b) && b.type !== 'barraco' && !b.dono && !(b.res > 0)) { any = true; break; }
      if (any) for (const [id, vid] of K.heldFor(set)) now.set(id, { d: s.day, v: vid });
    }
    for (const [id, e] of guard.m) {
      if (now.has(id) || s.day - e.d > 1) continue; const b = s.buildings.get(id); if (!b || !b.built) continue;
      const L = []; for (const v of s.villagers.values()) if (v.home === id && !v.captive) L.push(v);
      // (one alone, grown, who paid nothing for it: sent by the housing — who buys it with the price is the owner by right —,
      // while the family it was kept for still needs a house and has not let it go)
      const w = P(e.v); if (!w || !K.need(w) || K.gaveUp(w) || K.waiting(w)) continue;
      if (L.length === 1 && L[0].age >= 16 && !L[0].partner && !(b.custo > 0)) add('casa-cheia', 3, `${b.type}#${id}: a casa vazia do povo que a família de ${w.name} esperava no dia ${e.d} foi tomada por ${L[0].name} #${L[0].id}, sozinho (D-236)`);
    }
    guard.m = now;
  });
})();
