// morar-palacio-inv: as regras do verificador para a casa de quem governa (Bairros Vivos, o agente R: D-205 a D-207; fecha a
// T-765) — carregado depois do qa/qa.js (QA.more), como o degraus-inv.js; o líder o junta (qa/junta-inv.js). Lê as pessoas, os
// prédios e os povos e pergunta ao G.Court, ao G.Casa, ao G.Vg e ao W (nenhuma pergunta muda o mundo). O parentesco é
// conferido aqui, por conta própria, não pela regra do jogo (G.Casa.ofCourt).
//   P1  só se mora num prédio de morar: uma casa, ou a sede de quem governa (BDEF.housing ou BDEF.aposentos)
//   P2  quem mora numa sede é da família de quem governa o povo dela, e a sede é a do povo (a melhor de pé na capital)
//   P3  quem governa um povo com sede de pé na capital mora nela — ou a causa está dita no mundo: o deus vive na família, a
//       família mora noutra cidade e não tem caminho por terra, alguém dela não pode partir agora, ou foi chamada hoje
//   P4  ninguém mora dentro de uma sede em obra ou caída
//   P5  a sede não é de ninguém: sem dono, sem aluguel, sem encomenda, sem poupança de casa
//   P6  quem mora na sede não precisa de casa (a fila das casas da cidade nunca o chama)
//   P7  numa sede com mais gente que camas só mora quem tem de morar com quem governa: nenhuma casa de filho ou irmão casado,
//       nenhum crescido solteiro sem pequenos
// P2, P3, P4 e P7 dão à porta o tempo dela (G.Casa.reign: a cada dois segundos do mundo; o repartidor de casas, a cada 2,5 s): só
// acusam o que dura mais de GRACE segundos do relógio do mundo.
(function () {
  if (!window.QA || !QA.more) return;
  const GRACE = 8; let world = null; const since = new Map();
  // (how long a fault has lasted, by its key: seen now for the first time, it starts counting; not seen in a check, it is forgotten)
  const lasts = (key, clock, seen) => { seen.add(key); if (!since.has(key)) since.set(key, clock); return clock - since.get(key); };
  QA.more.push(function (add, s) {
    const V = G.Village, Co = G.Court, K = G.Casa; if (!V || !V.bedsOf || !Co || !Co.seatOf || !K || !K.court) return;
    if (world !== s) { world = s; since.clear(); }
    const seen = new Set(); const P = id => (id ? s.villagers.get(id) : null);
    const seat = b => !!b && !!G.BDEF[b.type] && !G.BDEF[b.type].housing && !!G.BDEF[b.type].aposentos;
    const stands = b => !!b && b.built && b.type !== 'ruin';
    const body = s.avatar ? s.avatar.id : 0;
    // (of one blood or one bed: self, the partner, a parent, a child, a brother or a sister)
    const near = (a, o) => !!a && !!o && (a.id === o.id || a.partner === o.id || o.mother === a.id || o.father === a.id || a.mother === o.id || a.father === o.id || (!!a.mother && a.mother === o.mother) || (!!a.father && a.father === o.father));
    // (the family: the ruler's and the partner's — of one blood or one bed —, their children's children and their brothers' and
    // sisters' — the grandchildren, the nephews —; and who the town's housing brings to live with one of them: who is married
    // to one, and the little ones of such a couple. The rule of the game since the L-974 — the husband of a ruler's niece was put
    // out of the seat and brought back to his wife's home every few seconds —, and the checker kept the family of before: in the
    // chaos of seed 13 it accused the husband of a ruler's granddaughter and their baby, whom the seat rightly keeps — T-849)
    const ofFamily = (v, r) => {
      const p = P(r.partner); const fam = o => near(r, o) || near(p, o);
      const kids = (r.kids || []).concat(p ? p.kids || [] : []);
      const own = o => !!o && (fam(o) || fam(P(o.mother)) || fam(P(o.father)) || kids.includes(o.mother) || kids.includes(o.father));
      const mate = o => !!o && (own(o) || own(P(o.partner)));
      return mate(v) || (v.age < 16 && (mate(P(v.mother)) || mate(P(v.father))));
    };
    const res = new Map(); // (who lives in each seat)
    for (const v of s.villagers.values()) {
      if (!v.home) continue; const h = s.buildings.get(v.home); if (!h) continue;
      // ---- P1
      if (h.type !== 'ruin' && !(V.bedsOf(h) > 0)) add('paco', 2, `${v.name} #${v.id} mora em ${h.type}#${h.id}, que não é prédio de morar (D-205)`, v.id);
      if (seat(h)) { const l = res.get(h.id); if (l) l.push(v); else res.set(h.id, [v]); }
    }
    const lord = new Map(); // (seat id → the ruler whose seat it is)
    for (const f of G.Fac.all()) { const b = Co.seatOf(f); const r = G.Politics.ruler(f); if (b && r && !r.captive) lord.set(b.id, [r, f]); }
    for (const [bid, L] of res) {
      const b = s.buildings.get(bid); const e = stands(b) ? lord.get(bid) : null;
      // ---- P4
      if (!stands(b)) { for (const v of L) if (v.id !== body && lasts('P4:' + v.id + ':' + bid, s.clock, seen) > GRACE) add('paco', 1, `${v.name} #${v.id} mora dentro de ${b.type}#${bid}, que ${b.type === 'ruin' ? 'caiu' : 'está em obra'} (D-206)`, v.id); continue; }
      // ---- P2 (the god's body and its household stay where the player has them: D-098)
      const mine = L.some(v => v.id === body);
      for (const v of L) {
        if (mine || (e && ofFamily(v, e[0]))) continue;
        if (lasts('P2:' + v.id + ':' + bid, s.clock, seen) > GRACE) add('paco', 2, `${v.name} #${v.id} mora em ${b.type}#${bid} sem ser da família de quem governa${e ? ' (' + e[0].name + ')' : ': a sede não é a de povo nenhum'} (D-206)`, v.id);
      }
      // ---- P7: a seat with more people than beds keeps only who must live with who rules — the ruler and the partner, their
      // parents, who is under eighteen, who alone has little ones there, who minds them —: never a married household of the
      // family's, never a grown single one (D-206)
      if (e && e[0].home === bid && !mine && L.length > V.bedsOf(b)) {
        const r = e[0], p = P(r.partner); const own = v => !!v && (v.id === r.id || v.id === r.partner || v.id === r.mother || v.id === r.father || (!!p && (v.id === p.mother || v.id === p.father)));
        for (const v of L) {
          if (v.age < 18 || own(v) || own(P(v.partner)) || !ofFamily(v, r)) continue;
          const pair = !!v.partner && L.some(o => o.id === v.partner), kids = L.some(k => k.age < 16 && (k.mother === v.id || k.father === v.id)), minds = !!(G.Lar && G.Lar.minder && G.Lar.minder(v));
          if ((pair || (!kids && !minds)) && lasts('P7:' + v.id + ':' + bid, s.clock, seen) > GRACE) add('paco', 2, `${v.name} #${v.id} mora em ${b.type}#${bid}, cheia demais (${L.length} para ${V.bedsOf(b)} camas), sem ser dos que têm de morar com quem governa (D-206)`, v.id);
        }
      }
      // ---- P6
      for (const v of L) if (v.age >= 18 && K.need && K.need(v)) add('paco', 2, `${v.name} #${v.id} mora em ${b.type}#${bid} e «precisa de casa» (${K.need(v)})`, v.id);
    }
    // ---- P3
    for (const [bid, [r, f]] of lord) {
      const b = s.buildings.get(bid); if (r.home === bid) continue;
      const fam = K.court(r); let why = '';
      if (fam.some(m => m.id === body)) why = 'corpo';
      else if (r.set !== b.set) { const cap = s.settlements.get(b.set); why = !fam.every(m => G.W.reachesTown(m, cap)) ? 'sem caminho' : !fam.every(m => G.Vg.canSend(m)) ? 'ocupado' : G.mod('casa.corte.' + f.id) === s.day ? 'chamado' : ''; }
      if (why) continue;
      if (lasts('P3:' + r.id + ':' + bid, s.clock, seen) > GRACE) add('paco', 2, `${r.name} #${r.id} governa ${f.name} e não mora em ${b.type}#${bid}, a sede de pé na capital, sem causa dita (mora em ${r.home ? (s.buildings.get(r.home) || {}).type + '#' + r.home : 'lugar nenhum'}) (D-205)`, r.id);
    }
    // ---- P5
    for (const b of s.buildings.values()) if (seat(b) && (b.dono || b.aluga || b.encomenda || b.poupa)) add('paco', 2, `${b.type}#${b.id}: a sede com ${b.dono ? 'dono' : b.aluga ? 'aluguel' : b.encomenda ? 'encomenda' : 'poupança de casa'} (D-205)`);
    for (const k of [...since.keys()]) if (!seen.has(k)) since.delete(k);
  });
})();
