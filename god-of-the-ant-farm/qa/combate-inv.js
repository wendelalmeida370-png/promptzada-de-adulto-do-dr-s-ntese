// combate-inv: as regras do verificador do combate do corpo (20f, D-410 a D-424) — carregado depois do qa/qa.js (QA.more),
// juntado a ele pelo qa/junta-inv.js. Lê o registro do combate (S.combate: o duelo, as flechas no ar, as brigas) e o mundo —
// nenhuma pergunta muda nada. O sistema «combate»:
//   · toda flecha no ar é de alguém e é uma flecha (S2): uma chave do catálogo, uma só, números que são números, no mapa, voando
//     há menos do que voa uma flecha — e só com um corpo vivido para voá-la (fora dele, todas descem onde estão);
//   · o lugar 'a:' do livro tem só o que as flechas no ar têm (S2: o livro e o registro, a mesma conta);
//   · o duelo é do corpo vivido, com alguém vivo, dos dois povos em paz (S2), e quem duela luta com o corpo — a tarefa do duelo (S3);
//   · quem briga com alguém (a resposta de um golpe) existe e luta com ele (S3);
//   · a guarda erguida é do corpo vivido (S2), e nenhuma porta do combate foi pedida de fora do passo do mundo (S3);
//   · o tranco de alguém dura segundos, não dias (S3): v.stagT no máximo cinco segundos do mundo adiante.
(function () {
  if (!window.QA || !QA.more) return;
  const fin = x => typeof x === 'number' && isFinite(x);
  const rule = function (add, s) {
    const Cb = G.Combate; if (!Cb) return;
    const c = s.combate; const body = s.avatar ? s.villagers.get(s.avatar.id) : null;
    if (c) {
      if (!Array.isArray(c.fl) || !Array.isArray(c.br)) { add('combate', 1, 'S.combate sem as listas das flechas e das brigas'); return; }
      const TL = Cb.TILE || 4;
      for (const f of c.fl) {
        const nm = `flecha#${f && f.id}`;
        if (!f || !fin(f.id) || !(G.Itens.THINGS.has(f.k) && G.Itens.def(f.k).kind === 'flecha') || !(f.n === 1)) { add('combate', 2, `${nm}: no ar sem ser uma flecha (${f && f.k} × ${f && f.n})`); continue; }
        const bad = ['X', 'Y', 'Z', 'vx', 'vy', 'vz', 't'].filter(k => !fin(f[k])); if (bad.length) { add('combate', 2, `${nm}: números que não são números (${bad.join(', ')})`); continue; }
        if (!G.W.inb(f.X / TL, f.Z / TL)) add('combate', 2, `${nm}: fora do mapa, em ${(f.X / TL).toFixed(1)},${(f.Z / TL).toFixed(1)}`);
        if (f.t > (Cb.FLY || 4) + 0.5) add('combate', 2, `${nm}: voando há ${f.t.toFixed(1)} s (uma flecha voa no máximo ${Cb.FLY} s)`);
        if (!body) add('combate', 2, `${nm}: no ar sem um corpo vivido que a voe (devia ter descido onde estava)`);
        if (!s.villagers.has(f.by) && !s.dead.has(f.by)) add('combate', 3, `${nm}: de alguém que não existe (#${f.by})`);
      }
      const ids = new Set(c.fl.map(f => f.id));
      if (G.Depot && G.Depot.total && G.Depot.KINDS.includes('a')) for (const f of c.fl) if (Math.abs((G.Depot.get('a:' + f.id, f.k) || 0) - f.n) > 1e-6) add('combate', 2, `flecha#${f.id}: o livro tem ${G.Depot.get('a:' + f.id, f.k)} no lugar dela, o registro ${f.n}`);
      void ids;
      const d = c.duel;
      if (d) {
        const a = s.villagers.get(d.a), o = s.villagers.get(d.o);
        if (!a || !o) add('combate', 2, `o duelo de #${d.a} e #${d.o}: um dos dois não existe`);
        else if (!s.avatar || s.avatar.id !== d.a) add('combate', 2, `o duelo de ${a.name} e ${o.name}: não é do corpo vivido`);
        else {
          if (G.Fac.idOfV(a) && G.Fac.idOfV(o) && G.Fac.idOfV(a) !== G.Fac.idOfV(o)) { const r = G.Fac.get(G.Fac.idOfV(a)); const rel = r && r.rel && r.rel[G.Fac.idOfV(o)]; if (rel && rel.st === 'guerra') add('combate', 2, `o duelo de ${a.name} e ${o.name}: os povos deles estão em guerra`); }
          if (!(o.task && o.task.type === 'combat' && o.task.id === a.id && o.task.duel)) add('combate', 3, `o duelo de ${a.name} e ${o.name}: ${o.name} não luta com o corpo (${o.task ? o.task.type : 'sem tarefa'})`);
        }
      }
      for (const q of c.br) {
        const o = s.villagers.get(q.id); if (!o) { add('combate', 3, `briga de #${q.id}: não existe`); continue; }
        if (!(o.task && o.task.type === 'combat' && o.task.id === q.foe && o.task.brawl)) add('combate', 3, `briga de ${o.name} #${o.id}: não briga com #${q.foe} (${o.task ? o.task.type : 'sem tarefa'})`);
      }
    }
    const g = Cb.guarding && Cb.guarding(); if (g && (!s.avatar || s.avatar.id !== g.id)) add('combate', 2, `a guarda erguida de #${g.id}, que não é o corpo vivido`);
    const st = Cb.stats ? Cb.stats() : null; if (st && st.outside > 0) add('combate', 3, `${st.outside} porta(s) do combate pedida(s) de fora do passo do mundo`);
    for (const v of s.villagers.values()) if (v.stagT && v.stagT > s.clock + 5) add('combate', 3, `${v.name} #${v.id}: o tranco até ${(v.stagT - s.clock).toFixed(1)} s adiante`, v.id);
  };
  QA.more.push(rule); QA.combate = rule;
  // (the save's round trip sees the fight's record too)
  if (QA.canonMore) QA.canonMore.push(['combate', () => { const c = G.S && G.S.combate; if (!c) return null; return { duel: c.duel ? [c.duel.a, c.duel.o] : null, fl: c.fl.map(f => [f.id, f.k, f.n, Math.round(f.X * 100), Math.round(f.Z * 100)]), br: c.br.map(q => [q.id, q.foe]) }; }]);
})();
