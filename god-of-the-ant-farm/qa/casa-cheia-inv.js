// casa-cheia-inv: as regras do verificador para «a casa cheia que não esvazia» (L-718; Bairros Vivos, o agente H: D-220 a D-224)
// — carregado depois do qa/qa.js (QA.more), como o degraus-inv.js; o líder o junta (qa/junta-inv.js). Só lê: as casas, as obras
// e o que o G.Casa diz (nenhuma pergunta muda o mundo).
//   H1 (S2) a obra das mãos de uma família (b.encomenda.maos) é uma cabana, com alguém da família vivo, e o dono é da família
//   H2 (S2) nela só trabalha gente da família — os construtores do povo nunca (villagers.js, buildTask)
//   H3 (S3) sem mãos crescidas da família na cidade, a obra passa aos construtores no dia da cidade (até lá, um aviso)
//   H4 (S2) o que a família separou na obra não passa dos materiais de uma cabana, e é o que a encomenda diz
//   H5 (S2) a obra das mãos não conta nas duas obras pagas dos construtores (K.cannotRaise)
//   H6 (S3) uma casa de várias famílias com o dobro da lotação, num povo de moeda, cuja família perguntada tem a outra estrada
//           aberta (a casa vazia do povo; ou as próprias mãos, cumprida a paciência — madeira de sobra, chão, vaga) e continua
//           assim mais dias do que a vez explica (uma decisão por dia em cada cidade). A regra lembra o dia em que viu a estrada
//           aberta pela primeira vez (o verificador não tem outra memória): só acusa quem é olhado em dias seguidos
(function () {
  if (!window.QA || !QA.more) return;
  const aberta = { s: null, day: -1, m: new Map() }; // (the houses seen with the road open, by id: the day first seen)
  // (what a save must give back: the works of families' own hands, and since when each house saves — the patience counts from it)
  if (QA.canonMore) QA.canonMore.push(['casa-cheia', () => (G.S ? [...G.S.buildings.values()].filter(b => (b.encomenda && b.encomenda.maos) || b.poupa).sort((a, b) => a.id - b.id).map(b => [b.id, b.encomenda && b.encomenda.maos ? 1 : 0, b.poupa ? b.poupa.d + ':' + (b.poupa.chao || 0) : '']) : null)]);
  QA.more.push(function (add, s) {
    const K = G.Casa, V = G.Village, D = G.Depot; if (!K || !K.road || !V || !D) return;
    const P = id => (id && s.villagers.get(id)) || null; const fin = Number.isFinite;
    const housing = b => !!(b && G.BDEF[b.type] && G.BDEF[b.type].housing);
    let mat = 0; { const c = G.BDEF.hut.cost; for (const k in c) mat += (c[k] || 0) * ((G.Eco.PRICE && G.Eco.PRICE[k]) || 0.3); }
    const works = new Map(); // (the families' own works, by id)
    for (const b of s.buildings.values()) {
      const o = b.encomenda; if (!o || !o.maos || b.built) continue; works.set(b.id, b);
      const nm = `${b.type}#${b.id}`;
      if (b.type !== 'hut') add('casa-cheia', 2, `${nm}: obra das mãos de uma família e não é uma cabana (D-222)`);
      const fam = Array.isArray(o.fam) ? o.fam.map(P).filter(Boolean) : [];
      if (!fam.length) add('casa-cheia', 2, `${nm}: obra das mãos de uma família sem ninguém da família vivo (D-222)`);
      else if (!b.dono || !o.fam.includes(b.dono)) add('casa-cheia', 2, `${nm}: obra das mãos de uma família e o dono (#${b.dono || 0}) não é dela`);
      else if (!fam.some(m => { const q = m.partner ? P(m.partner) : null; return (m.age >= 16 && !m.captive && m.set === b.set) || (!!q && q.home === m.home && q.age >= 16 && !q.captive && q.set === b.set); })) add('casa-cheia', 3, `${nm}: obra das mãos de uma família sem um crescido dela na cidade (passa aos construtores no dia da cidade)`);
      const kept = D.get('h:' + b.id, 'moedas');
      if (!fin(o.paid) || o.paid > mat + 0.011) add('casa-cheia', 2, `${nm}: a família pagou ${o.paid} pela cabana das suas mãos, mais do que os materiais dela (${mat.toFixed(2)})`);
      else if (Math.abs(kept - o.paid) > 0.011) add('casa-cheia', 2, `${nm}: a obra das mãos guarda ${kept.toFixed(2)} moedas e a encomenda diz ${o.paid}`);
    }
    for (const v of s.villagers.values()) {
      const t = v.task; if (!t || t.type !== 'build') continue; const b = works.get(t.id); if (!b) continue;
      if (!K.ownHands(b, v)) add('casa-cheia', 2, `${v.name} #${v.id} (${v.role}) trabalha na cabana das mãos de outra família (${b.type}#${b.id}) (D-222)`);
    }
    for (const set of s.settlements.values()) {
      // ---- the builders' two paid works: a family's own never counts
      let paid = 0, own = 0; for (const b of s.buildings.values()) if (b.set === set.id && b.encomenda && !b.built) { if (b.encomenda.maos) own++; else paid++; }
      if (own && paid < K.MAX_WORKS && /construtores do povo já têm/.test(K.cannotRaise(set, 'hut'))) add('casa-cheia', 2, `${set.name}: ${paid} obra(s) paga(s) e ${own} das mãos de famílias, e os construtores dizem ter casas demais (D-222)`);
      // ---- the house of several families at twice its beds whose asked family has the other road open and is not served
      if (!G.Eco.coinage(set.fac)) continue;
      if (aberta.s !== s || s.day < aberta.day) { aberta.s = s; aberta.m.clear(); } aberta.day = s.day; // (another world, a load: it starts over)
      let q = null;
      for (const b of s.buildings.values()) {
        if (b.set !== set.id || !b.built || !housing(b) || b.type === 'barraco' || b.type === 'ruin') continue;
        const cap = G.BDEF[b.type].housing; if ((b.res || 0) < 2 * cap) continue;
        const L = []; for (const v of s.villagers.values()) if (v.home === b.id && !v.captive) L.push(v);
        if (L.length < 2 * cap) continue;
        if (!q) q = K.queue(set);
        const k = q.findIndex(e => e[0].home === b.id); if (k < 0) continue; const v = q[k][0]; const why = q[k][1];
        const fam = K.family(v);
        // (another family in the house: a grown one, none of the asked family, with a partner or little ones of their own there)
        if (!L.some(o => o.age >= 16 && !fam.includes(o) && K.family(o).length > 1)) { aberta.m.delete(b.id); continue; }
        if (fam.some(m => m.age >= 16 && G.Act.isBody(m)) || K.waiting(v) || K.gaveUp(v)) { aberta.m.delete(b.id); continue; }
        const rd = K.road(v, { why, fam, set });
        if (rd.kind !== 'cede' && !(rd.kind === 'maos' && !rd.wait && !rd.chao)) { aberta.m.delete(b.id); continue; }
        const e = aberta.m.get(b.id); if (!e || e.v !== v.id) { aberta.m.set(b.id, { d: s.day, v: v.id }); continue; }
        const late = s.day - e.d - (k + 2);
        if (late > 0) add('casa-cheia', 3, `${set.name}: ${b.type}#${b.id} com ${L.length} para ${cap} camas; a família de ${v.name} #${v.id} (${fam.length}) tem ${rd.kind === 'cede' ? 'a casa vazia do povo' : 'as próprias mãos e a madeira'} desde o dia ${e.d}, e continua na casa cheia (${late} dia(s) além da vez)`);
      }
    }
  });
})();
