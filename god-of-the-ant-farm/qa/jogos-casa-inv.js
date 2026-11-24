// jogos-casa-inv: as regras do verificador para os jogos da casa (a quarta onda da taverna, frente J — D-930 a D-939) — carregado depois
// do qa/qa.js (QA.more); o líder o junta (qa/junta-inv.js). Lê o registro dos jogos na mesa (S.jogosMesa), as partidas e o livro (só lê):
//   · cada jogo na mesa é uma coisa de verdade de um dos dois tipos (dados, baralho), uma só, e o lugar 'n:' do livro tem o que ele diz (S2);
//   · um jogo numa mesa tem a sua partida viva — o jogo de dados, a partida das Tabuletas — (S2); o que ficou solto numa mesa é da casa (S3);
//   · cada partida viva tem o seu jogo na mesa: o jogo de dados o seu, a partida das Tabuletas os dois baralhos, um de cada lado (S2);
//   · os jogos da casa — na prateleira e nas mesas — são do material que o povo dela teve: os dados de osso de quem teve osso, o baralho de
//     papiro do povo do junco, o de cera de quem teve a cera, o de barro de quem teve a cerâmica (S3: a cidade tomada guarda os de antes);
//   · o livro do empréstimo («jogo-mesa», «jogo-volta») só leva dados e baralhos (S3).
(function () {
  if (!window.QA || !QA.more) return;
  const LIVE = { plan: 1, rsv: 1, on: 1, wait: 1 };
  const KIND = { dados: 1, baralho: 1 };
  const kindOf = k => { const d = G.Itens && k ? G.Itens.def(k) : null; return d && d.coisa ? d.kind : null; };
  let seenN = 0, seenS = null;
  const rule = function (add, s) {
    const JC = G.JogosCasa; if (!JC) return; const reg = s.jogosMesa; const recs = reg && reg.n ? Object.keys(reg.n).map(k => reg.n[k]) : [];
    const acts = s.acts || []; const byId = new Map(acts.map(o => [o.id, o])); const cj = (s.cartas && s.cartas.j) || {};
    // (each record: one real thing of the two kinds, the ledger's place holding it)
    for (const r of recs) {
      const nm = `jogo na mesa #${r.id} (${r.k}, taverna #${r.b})`;
      if (!KIND[kindOf(r.k)]) { add('jogos', 2, `${nm}: não é um jogo de dados nem um baralho`); continue; }
      if (!(r.n > 1e-6 && r.n <= 1 + 1e-6)) add('jogos', 2, `${nm}: ${r.n} na mesa (um jogo é uma coisa só)`);
      if (Math.abs(G.Depot.get('n:' + r.id, r.k) - r.n) > 1e-6) add('jogos', 2, `${nm}: o livro diz ${G.Depot.get('n:' + r.id, r.k)}, o registro ${r.n}`);
      if (!r.jogo) { if (r.dono || !/^b:/.test(r.ref)) add('jogos', 3, `${nm}: solto numa mesa sem ser da casa (${r.ref}, dono #${r.dono})`); continue; }
      // (its game alive — one moment after the end is no fault: the return is in the same step as the end, the round of the second catches the rest)
      if (r.tipo === 'dados') { const op = byId.get(r.jogo); const late = op && !LIVE[op.st] && op.end && s.clock - op.end.t > 1.5;
        if (!op || op.def !== 'jogo-dados' || late) add('jogos', 2, `${nm}: na mesa do jogo de dados #${r.jogo}, que ${op ? 'acabou' : 'não existe'}`); }
      else { const j = cj[r.jogo]; const late = j && j.fase !== 'jogo' && s.clock - (j.fimT || 0) > 1.5;
        if (!j || late) add('jogos', 2, `${nm}: na mesa da partida de Tabuletas #${r.jogo}, que ${j ? 'acabou' : 'não existe'}`); }
    }
    // (each live game has its own on the table)
    for (const op of acts) { if (op.def !== 'jogo-dados' || !LIVE[op.st]) continue; const d = op.data || {}; if (!d.set || !d.set.n) continue; // (a game of a save from before: its set on the shelf)
      const r = reg && reg.n[d.set.n]; if (!r || r.jogo !== op.id || r.k !== d.set.k || !(r.n > 1 - 1e-6)) add('jogos', 2, `jogo de dados #${op.id}: o jogo da mesa (#${d.set.n}, ${d.set.k}) não está nela`); }
    for (const k of Object.keys(cj)) { const j = cj[k]; if (!j || j.fase !== 'jogo' || !Array.isArray(j.ns)) continue;
      j.ns.forEach((n, i) => { const r = reg && reg.n[n]; if (!r || r.jogo !== j.id || r.k !== (j.bar || [])[i] || !(r.n > 1 - 1e-6)) add('jogos', 2, `Tabuletas #${j.id}: o baralho do lado ${i} (#${n}) não está na mesa`); }); }
    // (the house's sets of the material its people had — a detail, S3: a town taken by another people keeps the sets its old people made)
    const O = G.Origem; if (O && O.matOK) for (const b of s.buildings.values()) { if (b.type !== 'taverna' || !b.built) continue; const fid = G.Village.facOfSet(b.set); if (!fid) continue;
      for (const t of ['dados', 'baralho']) { const c = JC.casa(b, t); for (const k of Object.keys(c.por)) { const m = G.Itens.def(k).mat; if (!O.matOK(fid, m)) add('jogos', 3, `taverna #${b.id}: ${k} da casa, e o povo dela não tem ${m}`); } } }
    // (the ledger of the lending: only dice and decks)
    if (seenS !== s) { seenS = s; seenN = s.ledgerN || 0; }
    const L = G.Depot.ledger(); const from = seenN; seenN = s.ledgerN || 0;
    for (const e of L) { if (e[0] <= from) continue; if ((e[8] === 'jogo-mesa' || e[8] === 'jogo-volta') && !KIND[kindOf(e[5])]) add('jogos', 3, `o livro do empréstimo levou ${e[5]} (${e[3]} → ${e[4]})`); }
  };
  QA.more.push(rule); QA.jogosCasa = rule;
  if (QA.canonMore) QA.canonMore.push(['jogos-casa', () => { const r = G.S && G.S.jogosMesa; if (!r) return null; return Object.keys(r.n).sort((a, c) => a - c).map(k => { const q = r.n[k]; return [q.id, q.jogo, q.b, q.k, q.n, q.ref, q.dono, q.lado]; }); }]);
})();
