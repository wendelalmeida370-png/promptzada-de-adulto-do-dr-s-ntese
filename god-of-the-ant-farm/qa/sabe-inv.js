// sabe-inv: as regras do verificador para o que o personagem sabe (Bairros Vivos, BV-6: D-170) — carregado depois do qa/qa.js
// (QA.more / QA.canonMore), como os outros; o qa/junta-inv.js o copia para dentro do qa.js. Só lê o mundo. O registro do que
// uma pessoa viveu nas mãos do deus (v.ken: p, quem conheceu de frente; q, os bairros e as cidades onde os pés estiveram —
// [chave, o dia da primeira vez, 1 quando alguém do lugar disse o nome]; um bairro pelo id, uma cidade por menos o id) é
// pequeno, é da pessoa, vai no save com ela, e só o possess.js escreve.
(function () {
  if (!window.QA || !QA.more) return;
  QA.more.push(function (add, s) {
    const K = G.Possess && G.Possess.knows; const PM = K ? K.P_MAX : 40, QM = K ? K.Q_MAX : 16;
    for (const v of s.villagers.values()) {
      const k = v.ken; if (k === undefined) continue; const nm = `${v.name}#${v.id}`;
      if (!k || typeof k !== 'object' || !Array.isArray(k.p) || !Array.isArray(k.q)) { add('sabe', 1, `${nm}: o registro do que sabe não é um registro`, v.id); continue; }
      // ---- small: a few people, a few places
      if (k.p.length > PM || k.q.length > QM) add('sabe', 2, `${nm}: o registro do que sabe cresceu demais (${k.p.length} pessoas, ${k.q.length} lugares)`, v.id);
      // ---- the people met: ids of the world, each once, never oneself
      if (k.p.some(id => !Number.isInteger(id) || id <= 0 || id >= s.nextId) || new Set(k.p).size !== k.p.length) add('sabe', 2, `${nm}: a lista de quem conheceu é inválida (${JSON.stringify(k.p).slice(0, 80)})`, v.id);
      else if (k.p.includes(v.id)) add('sabe', 3, `${nm}: está na própria lista de quem conheceu`, v.id);
      // ---- the places: [key, the day of the first time — never a day to come —, told 0 or 1], each key once
      const bad = k.q.find(e => !Array.isArray(e) || !Number.isInteger(e[0]) || e[0] === 0 || !Number.isFinite(e[1]) || e[1] > s.day || (e[2] !== 0 && e[2] !== 1));
      if (bad !== undefined) add('sabe', 2, `${nm}: um lugar do registro é inválido (${JSON.stringify(bad)}, hoje é o dia ${s.day})`, v.id);
      else if (new Set(k.q.map(e => e[0])).size !== k.q.length) add('sabe', 3, `${nm}: o mesmo lugar duas vezes no registro`, v.id);
      // ---- a meeting is of two: whom one met has them too (while the other's list has room, and the other is alive)
      if (Array.isArray(k.p)) for (const id of k.p) {
        const o = s.villagers.get(id); if (!o) continue; const ko = o.ken; const lo = ko && Array.isArray(ko.p) ? ko.p : null;
        if (!(lo && (lo.includes(v.id) || lo.length >= PM))) { add('sabe', 3, `${nm}: conheceu ${o.name}#${o.id}, que não o tem entre os que conheceu`, v.id); break; }
      }
    }
  });
  // (the record goes in the save with its person: the canonical state carries it, so a round trip that loses it is seen —
  // and so is a screen that wrote it)
  QA.canonMore.push(['sabe', () => (G.S ? [...G.S.villagers.values()].filter(v => v.ken && typeof v.ken === 'object').sort((a, b) => a.id - b.id).map(v => [v.id, (v.ken.p || []).join('.'), (v.ken.q || []).map(e => (Array.isArray(e) ? e.join(':') : '?')).join('.')]) : null)]);
})();
