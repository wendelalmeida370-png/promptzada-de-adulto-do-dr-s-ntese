// bairro-inv: as regras do verificador para a vida do bairro (Bairros Vivos) — carregado depois do qa/qa.js (QA.more), como
// os outros; o qa/junta-inv.js o copia para dentro do qa.js. Lê o mundo e pergunta ao G.Urban (nenhuma pergunta muda o mundo:
// G.Urban.at só refaz o índice dele, que não vai no save).
(function () {
  if (!window.QA || !QA.more) return;
  QA.more.push(function (add, s) {
    const U = G.Urban; if (!U || !U.KEYS) return;
    const fin = Number.isFinite; const NC = Math.ceil(G.N / U.C); const KEY = {}; for (const k of U.KEYS) KEY[k] = 1;
    const VIDA = {}; for (const k of U.VIDA) VIDA[k] = 1; const ORDER = Object.keys(U.TAGS);
    // ---- the day's counts: by patch of ground, of known kinds, never negative
    const acc = s.urbAcc;
    if (acc !== undefined && (!acc || typeof acc !== 'object' || Array.isArray(acc))) add('bairro', 1, 'as contagens do dia (S.urbAcc) não são um registro');
    else for (const c in acc || {}) {
      const e = acc[c]; if (!/^\d+$/.test(c) || +c >= NC * NC || !e || typeof e !== 'object') { add('bairro', 1, `contagem do dia num chão inválido (${c})`); break; }
      if (!fin(e.d) || e.d > s.day) add('bairro', 2, `contagem do dia no chão ${c}: dia ${e.d}`);
      for (const k in e) if (k !== 'd' && (!(KEY[k] || /^m:[a-z]+$/.test(k)) || !fin(e[k]) || e[k] <= 0)) { add('bairro', 2, `contagem do dia no chão ${c}: «${k}» = ${e[k]}`); break; }
    }
    // ---- each quarter, and each town's whole
    for (const st of s.settlements.values()) {
      const u = st.urb; if (!u) continue; const w = u.w;
      if (w) {
        if (!w.whole || w.set !== st.id) add('bairro', 2, `${st.name}: o todo da cidade não é dela`);
        if (!Array.isArray(w.cells) || w.cells.some(c => !Number.isInteger(c) || c < 0 || c >= NC * NC) || new Set(w.cells).size !== w.cells.length) add('bairro', 1, `${st.name}: o chão do todo da cidade é inválido`);
      }
      const ground = w && Array.isArray(w.cells) ? new Set(w.cells) : null;
      for (const q of (w ? [w] : []).concat(Array.isArray(u.d) ? u.d : [])) {
        const nm = q.whole ? `${st.name} (o todo)` : `${st.name} / ${q.name}`;
        if (q.vida !== undefined) {
          if (!q.vida || typeof q.vida !== 'object') { add('bairro', 1, `${nm}: a vida não é um registro`); continue; }
          for (const k in q.vida) { const x = q.vida[k]; if (!VIDA[k] || !fin(x) || x < 0 || ((k === 'rica' || k === 'pobre' || k === 'vazia') && x > 1.0005)) { add('bairro', 2, `${nm}: vida «${k}» = ${x}`); break; } }
          if (!Number.isInteger(q.dias) || q.dias < 1) add('bairro', 2, `${nm}: com vida e ${q.dias} dias contados`);
        }
        for (const k in q.ult || {}) if (!KEY[k] || !fin(q.ult[k]) || q.ult[k] > s.day) { add('bairro', 2, `${nm}: o último dia de «${k}» é ${q.ult[k]}`); break; }
        for (const g in q.luto || {}) if (!fin(q.luto[g]) || q.luto[g] < 0) { add('bairro', 2, `${nm}: luto «${g}» = ${q.luto[g]}`); break; }
        // ---- the profiles: known, each once, in their order; the patience counted in whole days below the four
        const tags = q.tags;
        // (a quarter that lost its ground is fading — six days, then it goes —: nothing is counted on it meanwhile, and its
        // profiles stay as they were)
        const fading = !q.whole && !(Array.isArray(q.cells) && q.cells.length);
        if (tags !== undefined) {
          if (!Array.isArray(tags) || tags.some(id => !U.TAGS[id]) || new Set(tags).size !== tags.length) { add('bairro', 1, `${nm}: perfis inválidos (${JSON.stringify(tags)})`); continue; }
          if (tags.some((id, i) => i && ORDER.indexOf(id) < ORDER.indexOf(tags[i - 1]))) add('bairro', 3, `${nm}: perfis fora de ordem (${tags.join(', ')})`);
          for (const id in q.tp || {}) if (!U.TAGS[id] || !Number.isInteger(q.tp[id]) || q.tp[id] < 1 || q.tp[id] >= U.PATIENCE) { add('bairro', 2, `${nm}: a paciência de «${id}» é ${q.tp[id]}`); break; }
          // ---- the profile agrees with the life: one held below its mark to go, or missing above its mark to come, is
          // counting its days (no profile is kept or denied against what happens, but for the patience)
          if (q.vida && (q.dias || 0) >= U.YOUNG && !fading) for (const id of ORDER) {
            const T = U.TAGS[id]; if (!T.k) continue; const has = tags.includes(id); const x = q.vida[T.k] || 0; const homes = (q._st || {}).homes;
            if (T.homes && homes !== undefined && homes < T.homes) { if (has && !(q.tp || {})[id]) add('bairro', 3, `${nm}: «${T.name}» com ${homes} casas, sem contar os dias para sair`); continue; }
            if (T.homes && homes === undefined) continue; // (a town just loaded: its look not made again yet)
            if (has && x < U.mark(q, id, true) - 1e-9 && !(q.tp || {})[id]) add('bairro', 3, `${nm}: «${T.name}» com ${T.k} ${x} (sai abaixo de ${U.mark(q, id, true)}), sem contar os dias`);
            if (!has && x >= U.mark(q, id, false) && !(q.tp || {})[id]) add('bairro', 3, `${nm}: sem «${T.name}» com ${T.k} ${x} (entra em ${U.mark(q, id, false)}), sem contar os dias`);
          }
        } else if (q.vida && (q.dias || 0) >= U.YOUNG && !fading) add('bairro', 3, `${nm}: com ${q.dias} dias de vida e sem lista de perfis`);
        // ---- a quarter's ground is the town's; and who asks by the ground gets this quarter
        if (!q.whole && ground && Array.isArray(q.cells) && q.cells.length && (q.dias || 0) >= 1) {
          const out = q.cells.filter(c => !ground.has(c)); if (out.length) add('bairro', 3, `${nm}: ${out.length} pedaço(s) de chão fora do chão da cidade`);
          const c = q.cells[0]; const [cx, cy] = U.cellXY(c); const at = U.at(cx + 1, cy + 1);
          if (at !== q && !(at && !at.whole && at.set !== q.set)) add('bairro', 2, `${nm}: quem pergunta pelo chão ${c} recebe ${at ? (at.whole ? 'o todo da cidade' : at.name) : 'nada'} (o índice está velho)`);
        }
      }
    }
    // ---- the memory of the towns that ended
    const past = s.urbPast;
    if (past !== undefined) {
      if (!Array.isArray(past)) add('bairro', 1, 'a memória das cidades que acabaram não é uma lista');
      else for (const p of past) if (!p || typeof p.name !== 'string' || !p.name || typeof p.town !== 'string' || !Array.isArray(p.cells) || !Array.isArray(p.hist) || !(p.ended <= s.day)) { add('bairro', 2, `memória de bairro inválida (${p && p.name})`); break; }
    }
  });
})();
