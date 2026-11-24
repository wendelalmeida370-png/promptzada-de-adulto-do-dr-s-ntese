// noite-inv: as regras do verificador para a noite que dura para quem a vive (a onda 4, N — D-960 a D-964) — carregado depois do
// qa/qa.js (QA.more); o líder o junta (qa/junta-inv.js). Lê as tavernas, as partidas e as mesas (só lê). O sistema «noite»:
//   · o dia de uma taverna passado da hora dela fica aberto só pela última partida do corpo (d.ultima), e só até a paciência do
//     taverneiro (T.ULTIMA): nunca uma casa aberta noite adentro sem causa (S2; o olhar do dia da taverna é de segundo em segundo do
//     mundo — a regra dá esse segundo);
//   · numa partida das Tabuletas do corpo acabada por abandono, o pote é de quem ficou — o fim tem o lado que venceu (S2);
//   · nenhuma partida do corpo começa depois do chamado do fechamento da taverna dela (S2);
//   · as marcas da noite à mesa (o copo, a conversa, a espera que a noite não contou) são números do relógio: finitas, e a espera nunca
//     negativa (S2).
(function () {
  if (!window.QA || !QA.more) return;
  const LIVE = { plan: 1, rsv: 1, on: 1, wait: 1 };
  const GRACE = 0.006; // (of the day: a second of the world at the plain pace — the day's look is once a second)
  const num = x => typeof x === 'number' && Number.isFinite(x);
  const rule = function (add, s) {
    const T = G.Taverna; if (!T || !T.horas) return;
    const days = new Map();
    for (const op of s.acts || []) {
      if (op.def !== 'taverna' || !LIVE[op.st]) continue; const d = op.data || {}; const b = s.buildings.get(op.at); if (!b) continue;
      days.set(op.at, d); const h = T.horas(b); const nm = `a taverna #${b.id}`;
      // ---- past its hour only for the body's last game, and only to the keeper's patience
      if (op.st === 'on' && d.day === s.day && s.time >= h.fecha + GRACE) {
        if (!d.ultima) add('noite', 2, `${nm} aberta às ${s.time.toFixed(3)}, passada a hora dela (${h.fecha}), sem a última partida do corpo`, op.id);
        else if (s.time >= d.ultima.ate + GRACE) add('noite', 2, `${nm} aberta às ${s.time.toFixed(3)}, passada a paciência do taverneiro com a última partida (${d.ultima.ate})`, op.id);
      }
      // ---- the stamps of the night at the tables
      for (const id of Object.keys(d.mesa || {})) { const m = d.mesa[id]; if (!m || m.corpo || m.body) continue;
        for (const k of ['cup', 'nx', 'ws']) if (m[k] !== undefined && !num(m[k])) add('noite', 2, `${nm}: a marca «${k}» de #${id} à mesa não é um número (${m[k]})`, +id);
        if (num(m.ws) && m.ws < -1e-9) add('noite', 2, `${nm}: a espera que a noite não contou de #${id} é negativa (${m.ws})`, +id); }
    }
    // ---- the tablets of the body's: the abandonment pays who stayed; none begun after the closing call
    const c = s.cartas; if (!c || !c.j) return;
    for (const k of Object.keys(c.j)) { const j = c.j[k]; if (!j || !(j.corpo >= 0) || !j.s) continue; const nm = `a partida ${j.id} do corpo (taverna #${j.b})`;
      if (j.s.fim && j.s.fim.por === 'abandono' && !(j.s.fim.w === 0 || j.s.fim.w === 1)) add('noite', 2, `${nm} acabou por abandono sem o lado que ficou — o pote é de quem fica (D-964)`, j.id);
      const d = days.get(j.b); if (d && j.fase === 'jogo' && num(d.fecha) && num(j.t0) && j.t0 > d.fecha && d.day === s.day) add('noite', 2, `${nm} começou às ${j.t0}, depois do chamado do fechamento (${d.fecha})`, j.id); }
  };
  QA.more.push(rule); QA.noite = rule;
})();
