// itens-arte-inv: a regra do verificador para a arte das coisas (a base do corpo, 20d: D-385 a D-390) — carregada depois do
// qa/qa.js (QA.more), como as outras; o qa/junta-inv.js a copia para dentro do qa.js. Só lê o mundo e a arte. Tudo o que
// alguém segura, leva às costas ou no cinto, ou veste (G.Inv.held: as coisas dele ou o kit do ofício) tem a sua forma nos três
// níveis e a sua figura; o que está guardado nas costas ou no cinto tem onde ficar no corpo (G.ItemArt.stow).
(function () {
  if (!window.QA || !QA.more) return;
  QA.more.push(function (add, s) {
    const IA = G.ItemArt, It = G.Itens, Inv = G.Inv; if (!IA || !IA.raw || !It || !Inv || !Inv.held) return;
    const seen = new Map(); // (each key judged once a check: the people are many, the keys few)
    const judge = (key, slot) => { const id = key + '@' + slot; if (seen.has(id)) return seen.get(id); let why = null;
      if (!IA.raw(key, 0) || !IA.raw(key, 1) || !IA.raw(key, 2)) why = 'não tem forma';
      else if (!IA.icon(key)) why = 'não tem figura';
      else if ((slot === 'costas' || slot === 'cinto') && !IA.stow(key, slot)) why = `não tem onde ficar ${slot === 'costas' ? 'nas costas' : 'no cinto'}`;
      seen.set(id, why); return why; };
    for (const v of s.villagers.values()) {
      const h = Inv.held(v); if (!h) continue;
      for (const slot of It.SLOTS) { const k = h[slot]; if (!k || !It.isThing(k)) continue; const why = judge(k, slot);
        if (why) { add('itens-arte', 3, `${v.name}#${v.id}: ${k} (${It.SLOT_NOME[slot] || slot}) ${why}`, v.id); break; } }
    }
  });
})();
