// taverna-vida-inv: as regras do verificador para a vida da taverna e os lugares de dentro (os interiores 2.0, P7 — D-760 a D-766)
// — carregado depois do qa/qa.js (QA.more); o líder o junta (qa/junta-inv.js). Lê as pessoas, os prédios e o repartidor dos lugares
// (G.Interiors.placeOf, puro) — nenhuma pergunta muda o mundo:
//   · quem está à mesa da taverna (a tarefa 'tavern' sentada, fora do estrado e do balcão) está num lugar de sentar sobre a peça — o
//     banquinho, o banco, a cadeira —, nunca no ar nem de pé (S2);
//   · duas pessoas nunca no mesmo lugar de uma peça, e um lugar guardado (t.lugar, o banquinho de quem está lá) não é dado a
//     outro (S2);
//   · quem está dentro da taverna, pela porta: o mundo o guarda no ponto da porta (S3) — nunca a metros dela, L-1927;
//   · ninguém passando pela porta por mais que a caminhada mais longa (G.Vg.WALK_MAX: S3);
//   · o bebê dentro de um prédio onde está quem o carrega fica no colo dele, em todo prédio (S3, D-660);
//   · a caneca de um dia da taverna só nas mãos de quem está às mesas dele ou de quem serve nele (S3);
//   · o músico do dia está às mesas, no estrado (S3); a porta da taverna aberta enquanto o dia dela está (S4);
//   · o corpo do deus às mesas (D-767): a entrada dele num estado que a taverna conhece, o pedido com o que foi pedido, quem o
//     atende vivo e capaz, o que lhe serviram nas mãos enquanto a entrada diz «servido» (S2, S3);
//   · o que está nas mesas (D-790, D-791): cada coisa do livro sobre a mesa ('t:' do dia) num lugar da planta e de um tipo que a
//     taverna conhece; o pedido do corpo «na mesa» com a sua coisa lá; o lugar guardado só para um pedido que espera; as canecas e os
//     pratos deixados num lugar da planta; quem joga ossinhos está àquela mesa (S2, S3);
//   · a memória dos fregueses de sempre e o grão da cerveja da casa bem formados (S3, D-792, D-794).
(function () {
  if (!window.QA || !QA.more) return;
  const LIVE = { plan: 1, rsv: 1, on: 1, wait: 1 };
  const SEAT = { sentar: 1, comer: 1 };
  const rule = function (add, s) {
    const T = G.Taverna, In = G.Interiors; if (!T || !In || !In.placeOf || !In.places) return;
    const days = (s.acts || []).filter(o => o.def === 'taverna' && LIVE[o.st]);
    const dayOf = new Map(); for (const op of days) dayOf.set(op.at, op);
    const atBldg = new Map(); // (who is inside each tavern)
    for (const v of s.villagers.values()) {
      const nm = `${v.name} #${v.id}`; const t = v.task;
      // (the walks through a door: never longer than the longest)
      if (v.saiT > s.clock + G.Vg.WALK_MAX + 0.05 && v.inside) add('taverna', 3, `${nm}: saindo de #${v.inside} por mais ${Math.round(v.saiT - s.clock)} s (a caminhada mais longa é ${G.Vg.WALK_MAX} s)`);
      if (t && t.inW > s.clock + G.Vg.WALK_MAX + 0.05 && v.inside) add('taverna', 3, `${nm}: entrando em #${v.inside} por mais ${Math.round(t.inW - s.clock)} s`);
      // (the baby in the arms of who carries it, in every building — D-660)
      if (v.age < 2 && v.inside && !(v.sleeping && v.home === v.inside)) { const c = v.carrier && s.villagers.get(v.carrier); const b = s.buildings.get(v.inside);
        if (c && c.inside === v.inside && b && b.ip && In.ready && In.ready(b)) { const pl = In.placeOf(v); if (!pl || pl.with !== c.id) add('taverna', 3, `${nm}, bebê, em ${b.type}#${b.id} fora do colo de ${c.name} #${c.id} (${pl ? pl.use || pl.pose : 'sem lugar'}: D-660)`); } }
      const b = v.inside && s.buildings.get(v.inside); if (!b || b.type !== 'taverna') continue;
      let L = atBldg.get(b.id); if (!L) atBldg.set(b.id, L = []); L.push(v);
      // (in by the door: the world keeps one at it — the walk to the place is the interiors', L-1927)
      if (t && (t.type === 'tavern' || t.type === 'atender')) { const dr = G.Vg.door(b); if (Math.hypot(v.x - dr[0], v.y - dr[1]) > 0.5) add('taverna', 3, `${nm}: dentro da taverna #${b.id} a ${Math.round(Math.hypot(v.x - dr[0], v.y - dr[1]) * 4 * 10) / 10} m da porta — entrou sem passar por ela (L-1927)`); }
      // (at the table: seated on a seat — never in the air, nor standing — D-722, D-762)
      if (t && t.type === 'tavern' && t.st >= 2 && t.st < 6 && !G.Vg.entering(v) && !G.Vg.leaving(v) && In.ready && In.ready(b)) {
        const pl = In.placeOf(v); const sp = pl && pl.it && pl.it.spots ? pl.it.spots[pl.q] : null;
        if (!sp || !sp.on || !SEAT[sp.use]) add('taverna', 2, `${nm}: à mesa da taverna #${b.id} fora de um assento (${pl ? (pl.it ? pl.it.kind + ' ' : '') + (pl.use || pl.pose) : 'sem lugar'}: D-762)`);
      }
    }
    for (const [bid, L] of atBldg) {
      const b = s.buildings.get(bid); if (!b.ip || !(In.ready && In.ready(b))) continue;
      // (one place, one person: of a piece, never two; and a place held is its holder's)
      const P = In.places(b); const seen = new Map(), held = new Map();
      for (const v of L) { const h = v.task && Array.isArray(v.task.lugar) ? v.task.lugar[0] + '#' + v.task.lugar[1] : null; if (h) { if (held.has(h)) add('taverna', 2, `taverna #${bid}: o lugar ${h} tomado por #${held.get(h)} e por #${v.id}`); else held.set(h, v.id); } }
      for (const [vid, pl] of P.by) { if (!pl.it) continue; const k = pl.item + '#' + pl.q; if (seen.has(k)) add('taverna', 2, `taverna #${bid}: #${seen.get(k)} e #${vid} no mesmo lugar (${pl.it.kind}: D-085)`); else seen.set(k, vid);
        const h = held.get(k); const o = h && s.villagers.get(h); if (h && h !== vid && o && o.inside === bid && o.task && o.task.lugar && o.task.lugar[2]) add('taverna', 2, `taverna #${bid}: o lugar que #${h} tomou (${pl.it.kind}) dado a #${vid} (D-762)`); }
    }
    for (const op of days) {
      const b = s.buildings.get(op.at); if (!b || !b.built) continue; const d = op.data || {};
      // (the cups of the day: in the hands of who is at its tables or of who serves in it)
      for (const v of s.villagers.values()) { const c = v.carry; if (!c || c.op !== op.id || !(c.n > 1e-6)) continue; const t = v.task;
        if (!(d.mesa && d.mesa[v.id]) && !(t && t.type === 'atender' && t.op === op.id)) add('taverna', 3, `${v.name} #${v.id}: com ${c.k} do dia da taverna #${op.at} nas mãos, sem estar às mesas nem servindo nela`); }
      // (the god's body at the tables — D-767)
      for (const id in d.mesa || {}) {
        const m = d.mesa[id]; if (!m || !m.corpo) continue; const v = s.villagers.get(+id); const nm = v ? `${v.name} #${v.id}` : `#${id}`;
        if (!v) { add('taverna', 2, `taverna #${op.at}: a entrada do corpo ${nm} sem a pessoa (D-767)`); continue; }
        if (!(T.CV && T.CV[m.cv])) add('taverna', 2, `taverna #${op.at}: o corpo ${nm} às mesas num estado que a taverna não conhece («${m.cv}»: D-767)`);
        if (m.cv === 'pedido' && !(m.pedido && m.pedido.k)) add('taverna', 2, `taverna #${op.at}: o pedido do corpo ${nm} sem o que foi pedido (D-767)`);
        if (m.srv > 0) { const k = s.villagers.get(m.srv); if (!k || !G.Act.able(k)) add('taverna', 3, `taverna #${op.at}: o pedido do corpo ${nm} com quem já não pode atender (#${m.srv}: D-767)`); }
        if (m.cv === 'servido' && !(v.carry && v.carry.op === op.id && v.carry.n > 1e-6)) add('taverna', 3, `taverna #${op.at}: o corpo ${nm} «servido» de mãos vazias (D-767)`);
      }
      // (what lies on the tables — D-790, D-791)
      const KIND = { pedido: 1, sobra: 1 }; const na = Array.isArray(d.na) ? d.na : [];
      for (const x of na) { if (!KIND[x.kind] || !(x.n > 1e-6) || !x.it) add('taverna', 2, `taverna #${op.at}: na mesa ${x.k} ${x.n} de um tipo «${x.kind}» ou sem lugar (D-790)`);
        else if (b.ip && In.ready && In.ready(b) && In.table && In.table(b) && !In.slots(b).some(q => q.item && q.item.id === x.it)) add('taverna', 3, `taverna #${op.at}: ${x.k} na mesa num lugar que a planta não tem (${x.it}#${x.q})`); }
      for (const id in d.mesa || {}) { const m = d.mesa[id]; if (!m || !m.corpo) continue;
        if (m.cv === 'mesa' && !na.some(x => x.id === m.na && x.kind === 'pedido')) add('taverna', 2, `taverna #${op.at}: o pedido do corpo #${id} «na mesa» sem nada na mesa (D-790)`);
        if (m.guarda && m.cv !== 'pedido' && m.cv !== 'mesa') add('taverna', 3, `taverna #${op.at}: o lugar guardado para o corpo #${id} sem pedido que espere («${m.cv}»: D-790)`); }
      for (const x of Array.isArray(d.deixa) ? d.deixa : []) if ((x.k !== 'caneca' && x.k !== 'prato') || !x.it) add('taverna', 3, `taverna #${op.at}: deixado na mesa ${x.k} sem lugar (D-791)`);
      if (d.jogo) for (const g of Object.keys(d.jogo)) for (const id of d.jogo[g].quem || []) { const m = d.mesa && d.mesa[id]; if (!m || String(m.g) !== g) add('taverna', 3, `taverna #${op.at}: #${id} no jogo de ossinhos da mesa ${g} sem estar a ela (D-796)`); }
      if (d.mus) { const m = d.mesa && d.mesa[d.mus]; const v = s.villagers.get(d.mus); if (!m || m.st !== 6 || !v || !v.task || v.task.type !== 'tavern' || v.task.st !== 6) add('taverna', 3, `taverna #${op.at}: o músico #${d.mus} não está no estrado`); }
      if (T.aberta(b) && b.ip && In.doorState && In.plan(b) && In.plan(b).entrance) { const ds = In.doorState(b, In.plan(b).entrance.door); if (ds && ds.state !== 'aberta' && ds.state !== 'bloqueada') add('taverna', 4, `taverna #${op.at}: aberta, e a porta ${ds.state} (D-766)`); }
    }
  };
  // (the house's memory and its beer's grain — D-792, D-794)
  const house = function (add, s) {
    for (const b of s.buildings.values()) { if (b.type !== 'taverna') continue;
      if (b.freg !== undefined && !(Array.isArray(b.freg) && b.freg.length <= ((G.Taverna && G.Taverna.FREG) || 40) && b.freg.every(e => Array.isArray(e) && Number.isInteger(e[0]) && e[1] >= 1 && Number.isFinite(e[2]) && e[3] && typeof e[3] === 'object'))) add('taverna', 3, `taverna #${b.id}: a memória dos fregueses mal formada (D-794)`);
      if (b.malte !== undefined && !(b.malte && typeof b.malte === 'object' && Object.keys(b.malte).every(k => (k === '?' || (G.Origem && G.Origem.FOOD[k] && G.Origem.FOOD[k].cereal)) && b.malte[k] > 0))) add('taverna', 3, `taverna #${b.id}: o grão da cerveja da casa mal formado (D-792)`); }
  };
  QA.more.push(rule, house); QA.tavernaVida = rule; QA.tavernaCasa = house;
})();
