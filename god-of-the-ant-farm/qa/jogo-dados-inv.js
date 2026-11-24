// jogo-dados-inv: as regras do verificador para o jogo de dados da taverna (a quarta onda, T4 — D-850 a D-859) — carregado depois do
// qa/qa.js (QA.more); o líder o junta (qa/junta-inv.js). Lê as operações do jogo e o livro (só lê):
//   · o pote de uma partida viva é o que cada um pôs nele (pago), até o prêmio; uma partida acabada não guarda moeda (S1);
//   · quem joga ainda tem de 1 a 3 dados, quem está fora tem 0; com os copos na mesa, as faces de cada um são as dos seus dados, de 1 a
//     6, e são as do G.hash da partida, da rodada, de quem joga e do dado (D-669: o lance é do mundo) (S2);
//   · os palpites da rodada são números diferentes, dentro do que os dados da mesa podem dar, um por jogador (S2);
//   · o jogo de dados de uma partida existe de verdade onde ela diz — na prateleira da casa ou na mochila de quem joga (S2);
//   · ninguém está em duas partidas vivas; quem faz o gesto do jogo (o ato 'jogo-dados') joga numa partida viva (S3);
//   · o torneio da noite guarda só o prêmio, e o acabado nada (S2).
(function () {
  if (!window.QA || !QA.more) return;
  const LIVE = { plan: 1, rsv: 1, on: 1, wait: 1 };
  const rule = function (add, s) {
    const JD = G.JogoDados; if (!JD || !JD.R) return;
    const ops = (s.acts || []).filter(o => o.def === 'jogo-dados'); const seen = new Map();
    for (const op of ops) {
      const d = op.data || {}; const nm = `dados #${op.id} (taverna #${op.at})`;
      if (!LIVE[op.st]) { if ((d.pote || 0) > 1e-6) add('dados', 1, `${nm}: acabou com ${d.pote} no pote`); continue; }
      const paid = Object.values(d.pago || {}).reduce((a, x) => a + (x && x[1] || 0), 0);
      if (d.fase !== 'fim' && Math.abs((d.pote || 0) - paid) > 1e-6) add('dados', 1, `${nm}: o pote tem ${d.pote}, e puseram ${Math.round(paid * 100) / 100}`);
      if ((d.pote || 0) < -1e-6) add('dados', 1, `${nm}: pote negativo (${d.pote})`);
      for (const id of d.quem || []) {
        const n = d.n[id] | 0; if (d.fora[id] ? n !== 0 : !(n >= 1 && n <= 3)) add('dados', 2, `${nm}: #${id} com ${n} dados (${d.fora[id] ? 'fora: ' + d.fora[id] : 'jogando'})`);
        if (!d.fora[id] && d.fase !== 'convite' && d.r > 0) { const F = d.faces && d.faces[id];
          // (the cups up: the faces of the round still count the die just burnt)
          const n0 = n + ((d.fase === 'revela' || d.fase === 'fim') && d.res && (d.res.queimou || []).includes(id) ? 1 : 0);
          if (!Array.isArray(F) || F.length !== n0) add('dados', 2, `${nm}: #${id} com ${F ? F.length : 0} faces para ${n0} dados`);
          else F.forEach((f, i) => { const want = JD.R.face(d.seed, d.r, id, i); const turned = d.res && d.res.trap && !d.res.trap.pego && d.res.trap.id === id && d.res.trap.i === i && (d.fase === 'revela' || d.fase === 'fim');
            if (!(f >= 1 && f <= 6) || (f !== want && !turned)) add('dados', 2, `${nm}: o dado ${i} de #${id} mostra ${f}, o mundo jogou ${want}`); }); }
        if (!d.fora[id] && d.fase !== 'fim') { if (seen.has(id)) add('dados', 3, `#${id} em duas partidas (#${seen.get(id)} e #${op.id})`); seen.set(id, op.id); }
      }
      const said = (d.pal || []).map(p => p[1]); if (new Set(said).size !== said.length) add('dados', 2, `${nm}: um palpite repetido (${said.join(', ')})`);
      if ((d.pal || []).some(p => (d.pal || []).filter(q => q[0] === p[0]).length > 1)) add('dados', 2, `${nm}: alguém disse dois palpites na rodada`);
      if (d.set && d.set.ref) { const has = G.Depot.get(d.set.ref, d.set.k); if (!(has >= 1 - 1e-6)) add('dados', 2, `${nm}: joga com ${d.set.k} de ${d.set.ref}, que não tem nenhum`); }
    }
    // (the act is the tavern's, set in the people's step before the games' own: one step behind the game is no fault — a die burnt, the
    // game just ended)
    const near = v => ops.some(op => (op.data.quem || []).includes(v.id) && (LIVE[op.st] || (op.end && s.clock - op.end.t < 1.5)));
    for (const v of s.villagers.values()) if (v.act === 'jogo-dados' && !near(v)) add('dados', 3, `${v.name} #${v.id}: o gesto do jogo de dados sem partida viva`);
    for (const op of (s.acts || []).filter(o => o.def === 'torneio-dados')) { const d = op.data || {};
      if (!LIVE[op.st] && (d.pote || 0) > 1e-6) add('dados', 2, `torneio #${op.id}: acabou com ${d.pote} no pote`);
      if ((d.pote || 0) < -1e-6) add('dados', 2, `torneio #${op.id}: pote negativo`); }
  };
  QA.more.push(rule); QA.jogoDados = rule;
})();
