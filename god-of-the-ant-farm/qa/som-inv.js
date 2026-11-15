// som-inv: as regras do verificador para o que se ouve (Bairros Vivos, D-166, D-167) — carregado depois do qa/qa.js (QA.more),
// como os outros; o qa/junta-inv.js o copia para dentro do qa.js. O som não guarda nada no mundo: o que se confere é a cena
// (G.Audio.scene, pura — perguntar não muda nada) no meio de cada cidade: toda fonte tem dono vivo, os números são números, e
// o fundo do bairro não soa sem mãos; e a tabela gesto→som cobre todo gesto de G.Act.ANIM.
(function () {
  if (!window.QA || !QA.more) return;
  QA.more.push(function (add, s) {
    const A = G.Audio; if (!A || !A.scene || !A.earOf || !G.Act || !G.Act.ANIM) return;
    const fin = Number.isFinite;
    // ---- the table: every gesture of the activities has its line, every line's sound is in the library
    const none = A.semLinha(); if (none.length) add('som', 3, `gesto sem linha na tabela gesto→som (G.Audio.GESTO): ${none.slice(0, 6).join(', ')}`);
    const lib = new Set(A.sons ? A.sons() : []);
    if (lib.size) for (const k in A.GESTO) { const L = A.GESTO[k]; if (L.s ? !lib.has(L.s) : !L.por) { add('som', 3, `a linha do gesto «${k}» não tem som da biblioteca nem silêncio dito`); break; } }
    // ---- the scene in the middle of each town (the biggest twelve): every source of something alive, every number a number
    const sets = [...s.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id) || a.id - b.id).slice(0, 12);
    for (const st of sets) {
      const c = A.scene(A.earOf({ x: st.cx, y: st.cy, yaw: 0, r: 20 })); if (!c) continue;
      for (const f of c.fontes) {
        const de = f.de || {}; let why = '';
        if (de.v !== undefined) { const v = s.villagers.get(de.v); if (!v) why = 'de ninguém'; else if (v.sleeping) why = 'de quem dorme'; else if (f.tipo !== 'luta' && !v.act) why = 'de quem não faz nada'; }
        if (!why && de.op) { const op = G.Act.get(de.op); if (!op || !G.Act.live(op)) why = 'de uma operação que não está viva'; }
        if (!why && de.b && !s.buildings.has(de.b)) why = 'de um prédio que não existe';
        if (!why && de.navio !== undefined && !s.ships.some(x => x.id === de.navio && x.moving)) why = 'de um navio parado ou que não existe';
        if (!why && de.bicho !== undefined) { const a = s.animals.get(de.bicho); if (!a || a.dead) why = 'de um bicho morto ou que não existe'; }
        if (!why && de.v === undefined && !de.b && de.navio === undefined && de.bicho === undefined) why = 'sem dono';
        if (why) { add('som', 3, `${st.name}: uma fonte de som (${f.tipo} «${f.s}») ${why}`); break; }
        if (!fin(f.gain) || f.gain <= 0 || f.gain > 1 || !fin(f.pan) || f.pan < -1 || f.pan > 1 || (f.muf !== 0 && f.muf !== 1) || !fin(f.x) || !fin(f.y) || (lib.size && !lib.has(f.s))) { add('som', 3, `${st.name}: uma fonte de som com número ou som inválido (${f.tipo} «${f.s}», ganho ${f.gain}, pan ${f.pan}, abafado ${f.muf})`); break; }
      }
      // ---- the quarter's bed: each weight between nothing and all, and nothing with no hands at that work
      const F = c.fundo; if (!F) continue;
      for (const k of A.FAMS) {
        const w = F.w[k], h = F.h[k];
        if (!fin(w) || w < 0 || w > 1 || !fin(h) || h < 0 || h > 1) { add('som', 3, `${st.name}: o fundo do bairro «${k}» com peso ${w} e hábito ${h}`); break; }
        if (w > 0 && !(F.maos[k] > 0)) { add('som', 3, `${st.name}: o fundo do bairro soa a «${k}» (peso ${w}) sem mãos nesse trabalho`); break; }
      }
      const m = c.musica; if (!m || !Array.isArray(m.notas) || m.notas.length < 10 || m.notas.some(x => !fin(x) || x <= 0)) add('som', 3, `${st.name}: a música do chão sem escala`);
    }
  });
})();
