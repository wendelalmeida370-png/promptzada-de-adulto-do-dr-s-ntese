// oficio-fica-inv: as regras do verificador para o ofício que fica (Bairros Vivos: D-210 a D-212) — carregado depois do
// qa/qa.js (QA.more / QA.canonMore), como os outros; o qa/junta-inv.js o copia para dentro do qa.js. Só lê o mundo e o registro
// das últimas trocas (G.Village.tradeLog, que não é do mundo: recomeça com cada mundo e não vai no save).
// O ofício é da pessoa: o dia em que o tomou (v.roleDay) e o ofício de que uma emergência a tirou (v.roleBack) vão com ela no
// save; a memória do que cada ofício pede vai com a cidade (set.ofm). Só o repartidor de ofícios (village.js) os escreve.
(function () {
  if (!window.QA || !QA.more) return;
  const KID = { bebe: 1, crianca: 1 };
  QA.more.push(function (add, s) {
    const V = G.Village; if (!V || V.TRADE_MIN === undefined) return;
    const fin = Number.isFinite; const known = r => typeof r === 'string' && !!(G.ROLE && G.ROLE[r]);
    for (const v of s.villagers.values()) {
      const nm = `${v.name}#${v.id}`;
      // ---- the day the trade was taken: a day that has been — and never of a child's years (a first trade's days start
      // V.TRADE_MIN back, so the young are the first to go where the town asks; the years of a life run a little ahead of the
      // world's days — a scene that lingers slows the day, not the ageing —, never behind)
      if (v.roleDay !== undefined && v.roleDay !== null) {
        if (!fin(v.roleDay) || v.roleDay > s.day + 1e-9) add('oficio', 2, `${nm}: tomou o ofício num dia que não houve (${v.roleDay}, hoje é o dia ${s.day})`, v.id);
        else if (fin(v.age) && v.age >= 16 && s.day - v.roleDay > v.age - 16 + V.TRADE_MIN + 1.5) add('oficio', 3, `${nm}: tem o ofício há mais dias (${Math.round((s.day - v.roleDay) * 10) / 10}) do que os anos que tem depois dos dezesseis (${Math.round((v.age - 16) * 10) / 10})`, v.id);
      }
      // ---- the trade an emergency pulled the person from: a trade, another than the one they have, of a grown hand
      if (v.roleBack) {
        if (!known(v.roleBack) || KID[v.roleBack] || v.roleBack === 'anciao' || v.roleBack === 'cativo') add('oficio', 2, `${nm}: o ofício a que volta não é um ofício («${v.roleBack}»)`, v.id);
        else if (v.roleBack === v.role) add('oficio', 3, `${nm}: foi tirad${v.g === 'f' ? 'a' : 'o'} pela emergência do ofício que tem (${v.role})`, v.id);
        else if (KID[v.role] || v.role === 'anciao') add('oficio', 3, `${nm}: ${v.role === 'anciao' ? 'ancião' : 'criança'} com um ofício a que voltar (${v.roleBack})`, v.id);
      }
    }
    // ---- the town's memory of what each trade asks: numbers, never negative, never more hands than the town ever had
    for (const st of s.settlements.values()) {
      const m = st.ofm; if (m === undefined || m === null) continue;
      if (typeof m !== 'object' || Array.isArray(m)) { add('oficio', 1, `${st.name}: a memória dos ofícios não é um registro`); continue; }
      let pop = 0; for (const v of s.villagers.values()) if (v.set === st.id) pop++;
      for (const r in m) if (!fin(m[r]) || m[r] < -1e-9 || m[r] > Math.max(40, pop * 2 + 20)) { add('oficio', 2, `${st.name}: a memória dos ofícios pede ${m[r]} de «${r}»`); break; }
    }
    // ---- nobody changes trades in a hurry: two changes for the need that lasted, of one person, less than V.TRADE_MIN days
    // apart (an emergency's pull and the way back from it are not of these; one with no trade — set free, arrested — takes a
    // first one again, and starts over)
    const last = new Map();
    for (const e of V.tradeLog || []) {
      if (e.why === 'novo') last.delete(e.id);
      if (e.why !== 'falta') continue; const p = last.get(e.id);
      if (p !== undefined && e.day - p < V.TRADE_MIN) { const v = s.villagers.get(e.id); add('oficio', 2, `${v ? v.name : '?'}#${e.id}: trocou de ofício duas vezes pela necessidade em menos de ${V.TRADE_MIN} dias (os dias ${p} e ${e.day}: agora ${e.from} → ${e.to})`, e.id); break; }
      last.set(e.id, e.day);
    }
    // ---- and every change of the dealing says why
    const bad = (V.tradeLog || []).find(e => !e.why || !known(e.to));
    if (bad) add('oficio', 2, `uma troca de ofício sem causa dita (a pessoa #${bad.id}: ${bad.from} → ${bad.to}, «${bad.why}»)`, bad.id);
  });
  // (the day, the trade to go back to and the town's memory go in the save: the canonical state carries them, so a round trip
  // that loses them is seen — and so is a screen that wrote them)
  QA.canonMore.push(['oficio', () => (G.S ? [
    [...G.S.villagers.values()].filter(v => v.roleDay !== undefined && v.roleDay !== null || v.roleBack).sort((a, b) => a.id - b.id).map(v => [v.id, v.roleDay === undefined || v.roleDay === null ? '' : v.roleDay, v.roleBack || '']),
    [...G.S.settlements.values()].filter(st => st.ofm).sort((a, b) => a.id - b.id).map(st => [st.id, Object.keys(st.ofm).sort().map(r => r + ':' + Math.round(st.ofm[r] * 1e6) / 1e6).join(' ')]),
  ] : null)]);
})();
