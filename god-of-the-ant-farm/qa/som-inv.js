// som-inv: as regras do verificador para o que se ouve (Bairros Vivos, D-166, D-167) — carregado depois do qa/qa.js (QA.more),
// como os outros; o qa/junta-inv.js o copia para dentro do qa.js. O som não guarda nada no mundo: o que se confere é a cena
// (G.Audio.scene, pura — perguntar não muda nada) no meio de cada cidade: toda fonte tem dono vivo, os números são números, e
// o fundo do bairro não soa sem mãos; e a tabela gesto→som cobre todo gesto de G.Act.ANIM. E a sala (P9, D-780 a D-786): com o
// ouvido dentro de cada taverna aberta dessas cidades, o burburinho só de quem conversa agora, o fogo só aceso, a chuva no telhado só
// com chuva, a porta só com quem passa, cada som contínuo da sala dela, e o eco em números de uma sala.
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
        if (de.v !== undefined) { const v = s.villagers.get(de.v); if (!v) why = 'de ninguém'; else if (v.sleeping) why = 'de quem dorme'; else if (f.tipo === 'ocio') { const oc = A.ocioSom ? A.ocioSom(v) : null; if (v.act || v.moving || !oc || oc.s !== f.s) why = 'de uma coisinha do ócio que não está acontecendo'; } else if (f.tipo === 'passos' || f.tipo === 'porta') { if (!(G.Interiors && G.Interiors.passage(v)) && !(s.avatar && s.avatar.id === v.id)) why = 'de quem não está passando'; } else if (f.tipo === 'soluco') { if (!(A.ebrioDe(v) >= A.SOLUCO)) why = 'o soluço de quem não bebeu'; } else if (f.tipo === 'coro') { if (!(f.n >= 2) || (f.quem || []).some(id => { const p = s.villagers.get(id); return !p || !A.CORO[p.act]; })) why = 'o coro de quem não grita'; } else if (f.tipo !== 'luta' && !v.act) why = 'de quem não faz nada'; } // (the little thing of the idle that sounds is its owner's doing: the one the scheduler gives now, 22c D-610)
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
    // ---- the room (P9, D-780 to D-786): an ear inside each open tavern of those towns — the talk only of who talks there now, the fire
    // only lit, the rain on the roof only with rain over it, the door only with someone passing, each bed of the room of the room, and
    // its echo in numbers a room can have
    const In = G.Interiors, At = G.Atmos, T = G.Taverna; if (!In || !In.ready || !At || !T || !A.ecoDe) return;
    const towns = new Set(sets.map(x => x.id));
    for (const b of s.buildings.values()) {
      if (b.type !== 'taverna' || !b.built || !towns.has(b.set) || !b.ip || !In.ready(b) || !In.tableReady(b) || !T.aberta(b)) continue;
      const c = A.scene(A.earOf({ x: b.x + (b.w || 1) / 2, y: b.y + (b.h || 1) / 2, yaw: 0, inside: b.id })); if (!c || !c.sala) { add('som', 3, `a taverna #${b.id}: o ouvido dentro dela sem a sala`); continue; }
      const quem = [...s.villagers.values()].filter(v => v.inside === b.id && !v.sleeping); const fala = quem.filter(v => A.falando(v)).length;
      const mine = c.fontes.filter(f => (f.de && f.de.b === b.id) || f.sala === b.id); const mu = mine.find(f => f.s === 'murmur');
      let why = '';
      if ((fala >= 2) !== !!mu || (mu && mu.fala !== fala)) why = `${fala} conversando e o burburinho ${mu ? 'de ' + mu.fala : 'nenhum'}`;
      else if (!!At.fire(b) !== mine.some(f => f.tipo === 'fogo')) why = `o fogo ${At.fire(b) ? 'aceso e calado' : 'apagado e crepitando'}`;
      else if (mine.some(f => f.tipo === 'chuva') && !(c.sala.chuva > 0.02)) why = 'chuva no telhado sem chuva';
      else if (mine.some(f => f.tipo === 'porta') && !quem.some(v => In.passage(v))) why = 'a porta soa sem ninguém passando';
      else if (mine.some(f => f.q === 'leito' && !(f.de && f.de.b === b.id))) why = 'um som contínuo da sala que não é dela';
      const E = c.sala.eco; if (!why && E && (!fin(E.rt) || E.rt < 0.3 || E.rt > 1.6 || !fin(E.mix) || E.mix < 0.15 || E.mix > 0.45 || !fin(E.pre) || E.pre <= 0)) why = `o eco da sala fora do que uma sala tem (${E.rt} s, ${E.mix})`;
      if (why) { add('som', 3, `a taverna #${b.id}: ${why}`); break; }
    }
  });
})();
