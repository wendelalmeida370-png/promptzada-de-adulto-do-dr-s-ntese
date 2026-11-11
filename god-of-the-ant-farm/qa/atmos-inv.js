// atmos-inv: as regras do verificador para «o que se vê» (Bairros Vivos, BV-4 — D-162 a D-165). O G.Atmos só lê o mundo; estas
// regras conferem, a cada olhada do verificador, que o que ele responde tem a causa que diz ter — contada aqui de novo, direto
// dos campos do mundo (as operações, quem está dentro de cada prédio), nunca pelo próprio G.Atmos:
//   · um telhado só fuma com fogo de verdade embaixo (uma fornada com lenha ardendo, a forja quente com alguém acordado nela,
//     a fornalha dos banhos, a taverna aberta, gente acordada junto ao fogo da casa) — e com esse fogo, fuma;
//   · uma janela só está acesa com gente acordada dentro, e com gente acordada dentro está;
//   · em volta de uma casa vazia não há nada, e a lenha só na casa de um lenhador;
//   · a roupa de cada um diz o grupo que o mundo lhe dá (v.grp), e o frio só em quem está na rua;
//   · quem o mundo tem bêbado cambaleia, e só ele.
// Uma resposta guardada de um instante para o outro (o censo do G.Atmos vale por um instante do mundo) apareceria aqui como
// fumaça sem fogo. Carregado depois do qa/qa.js (QA.more); o junta-inv.js o leva para dentro do qa.js.
(function () {
  if (!window.QA || !QA.more) return;
  const EPS = 1e-6;
  const housing = b => !!(b && G.BDEF[b.type] && G.BDEF[b.type].housing);
  QA.more.push(function (add, s) {
    const At = G.Atmos, A = G.Act; if (!At || !A) return;
    // who is inside each building, awake, at the house's fire, cooking; who lives in each house — the checker's own count
    const ins = new Map(), homes = new Map();
    for (const v of s.villagers.values()) {
      if (v.inside > 0) { let e = ins.get(v.inside); if (!e) ins.set(v.inside, e = { n: 0, awake: 0, cook: 0, hearth: 0 }); e.n++; if (!v.sleeping) { e.awake++; const t = v.task; if (t && t.type === 'lar' && t.st >= 2 && t.home === v.inside) { if (t.what === 'cozinhar') e.cook++; else if (t.what !== 'acamado') e.hearth++; } } }
      if (v.home > 0) { let h = homes.get(v.home); if (!h) homes.set(v.home, h = { res: 0, cut: 0 }); h.res++; if (v.role === 'lenhador' && v.age >= 14 && !v.captive) h.cut++; }
    }
    // the fires of the trades and of the services, by building — from the operations themselves
    const fire = new Map();
    for (const op of A.all()) {
      if (!A.live(op)) continue; const d = op.data || {};
      if (op.def === 'oficio') {
        const t = G.Oficio && G.Oficio.DEFS[d.of]; const R = t && t.rx[d.p]; const st = R && R.st[d.s]; if (!st) continue;
        if (st.kind === 'fogo' && d.calor > EPS) fire.set(op.at, 'fornada');
        else if (st.kind === 'mao' && st.kiln && op.st === 'on' && R.st[d.s - 1] && R.st[d.s - 1].kind === 'fogo' && ins.get(op.at) && ins.get(op.at).awake > 0 && fire.get(op.at) !== 'fornada') fire.set(op.at, 'forja');
      } else if (op.def === 'termas') { if (d.calor > EPS) fire.set(op.at, 'fornalha'); }
      else if (op.def === 'taverna') { const b = s.buildings.get(op.at); if (b && op.st === 'on' && G.Taverna && G.Taverna.inHours(b)) fire.set(op.at, 'taverna'); }
    }
    let nf = 0, nl = 0, na = 0;
    for (const b of s.buildings.values()) {
      if (!b.built || b.type === 'ruin') { if (At.fire(b) || At.lit(b)) add('atmos', 2, `${b.type}#${b.id} ${b.built ? 'em ruína' : 'em obra'} com fogo ou janela acesa`, b.id); continue; }
      const dark = !!(G.Fest && G.Fest.darkB && G.Fest.darkB(b)); const e = ins.get(b.id);
      const want = dark ? null : b.type === 'campfire' ? 'fogueira' : b.type === 'banhos' || b.type === 'taverna' ? fire.get(b.id) || null : fire.get(b.id) || (housing(b) && e ? (e.cook ? 'cozinha' : e.hearth ? 'lareira' : null) : null);
      const got = At.fire(b); const why = got ? got.why : null;
      if (why !== want && nf++ < 3) add('atmos', 2, !want ? `${b.type}#${b.id} fumando (${why}) sem fogo nenhum embaixo` : !why ? `${b.type}#${b.id} com fogo de verdade (${want}) e sem fumaça` : `${b.type}#${b.id} fumando por «${why}» quando o fogo embaixo é «${want}»`, b.id);
      const lit = !dark && !!e && e.awake > 0;
      if (At.lit(b) !== lit && nl++ < 3) add('atmos', 2, lit ? `${b.type}#${b.id} com ${e.awake} acordado(s) dentro e a janela apagada` : `${b.type}#${b.id} com a janela acesa sem ninguém acordado dentro`, b.id);
      if (housing(b)) { const h = homes.get(b.id); const a = At.about(b);
        if ((!h || !h.res) && (a.wood || a.cask || a.bench || a.wash || a.roles.length) && na++ < 3) add('atmos', 3, `${b.type}#${b.id} vazia com coisas em volta (${JSON.stringify({ lenha: a.wood, barril: a.cask, banco: a.bench, varal: a.wash })})`, b.id);
        if (a.wood && !(h && h.cut) && na++ < 3) add('atmos', 3, `${b.type}#${b.id} com lenha em volta sem lenhador na casa`, b.id); }
    }
    // the clothes say the standing the world gives, the cold only out of doors; the drunk weave, and only they
    let nd = 0;
    for (const v of s.villagers.values()) {
      const D = At.dress(v); const want = v.captive || v.age < 16 ? '' : (v.grp || 'povo');
      if (D.grp !== want && nd++ < 3) add('atmos', 3, `${v.name}#${v.id} é d${want ? 'o grupo ' + want : 'e nenhum grupo'} e veste-se como ${D.grp || 'nenhum'}`, v.id);
      if (D.cold && (v.inside || v.aboard) && nd++ < 3) add('atmos', 3, `${v.name}#${v.id} agasalhado para o frio da rua dentro de ${v.inside ? 'casa' : 'um navio'}`, v.id);
      if ((At.drunk(v) > 0) !== (v.drunk > s.clock) && nd++ < 3) add('atmos', 3, `${v.name}#${v.id} ${v.drunk > s.clock ? 'bêbado sem cambalear' : 'cambaleando sem ter bebido'}`, v.id);
    }
  });
})();
