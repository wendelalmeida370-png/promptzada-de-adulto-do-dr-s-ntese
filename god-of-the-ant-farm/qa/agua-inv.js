// agua-inv: as regras do verificador para a água (o G.Agua, js/agua.js, e o desenho dela, js/agua3d.js; D-505 a D-510). O G.Agua só lê
// o mundo e guarda a corrente inteira, refeita quando o chão muda; estas regras conferem, a cada olhada do verificador, em casas escolhidas
// pelo dia (nunca por um acaso):
//   · a memória da corrente bate com a corrente feita do zero agora (G.Agua.fresh) — uma memória atrasada desenharia o rio de ontem;
//   · corrente só na água, com número e no seu limite (0 a 3 m/s, o rumo uma unidade);
//   · cada degrau da água entre duas casas de água, de cima para baixo, nunca numa ponte nem num prédio; toda queda do mundo
//     (S.relief.falls) cujas duas casas ainda são água, em níveis que caem, sem ponte nem prédio, é um degrau — a cachoeira com nome
//     tem a sua lâmina;
//   · a onda desenhada nunca passa de 15 cm (quem nada e o navio ficam no nível plano do mundo: D-506);
//   · o molhado entre 0 e 1, nada na água; nenhuma poça na água, num prédio ou num muro;
//   · com o 3D aberto: o leito que a água lê é o do chão, a água não cobre terra seca nem fica sob prédio, e cada degrau perto do corpo
//     tem a sua lâmina (G.Agua3D.check).
// Carregado depois do qa/qa.js (QA.more); o junta-inv.js o leva para dentro do qa.js.
(function () {
  if (!window.QA || !QA.more) return;
  QA.more.push(function (add, s) {
    const Ag = G.Agua; if (!Ag || !s.wl || !s.type) return; const N = G.N, T = G.T; const day = s.day | 0;
    const f = Ag.field(), fr = Ag.fresh(); let nm = 0;
    for (let q = 0; q < 64; q++) { const i = Math.floor(G.hash(day * 64 + q + 101) * N * N); if (i >= N * N) continue;
      for (const k of ['dx', 'dz', 'sp', 'q', 'dist']) if (Math.abs(f[k][i] - fr[k][i]) > 1e-4) { if (nm++ < 2) add('agua', 3, `a memória da corrente em ${i % N},${(i / N) | 0} diz ${k} ${f[k][i].toFixed(3)} e o mundo agora ${fr[k][i].toFixed(3)}`, i); break; } }
    for (const m of Ag.check(200).slice(0, 2)) add('agua', 3, m);
    // (the steps of the water: high to low, between two waters, never at a bridge or a building)
    const st = Ag.steps(0, 0, N, N); const sk = new Set(); let nb = 0;
    for (const p of st) { sk.add(p.i * 4 + (p.tx > p.x ? 0 : p.tx < p.x ? 1 : p.ty > p.y ? 2 : 3));
      const why = !(p.top - p.low >= Ag.STEP - 0.012) ? 'sem queda' : s.type[p.i] !== T.RIVER ? 'de cima fora do rio' : s.type[p.j] > T.RIVER ? 'de baixo em terra' : s.road[p.i] || s.road[p.j] ? 'numa ponte' : s.occ[p.i] || s.occ[p.j] ? 'num prédio' : '';
      if (why && nb++ < 2) add('agua', 3, `degrau da água em ${p.x},${p.y}→${p.tx},${p.ty} ${why}`, p.i); }
    // (every fall of the world still standing is a step: the named waterfalls are drawn)
    let nf = 0;
    for (const fl of (s.relief && s.relief.falls) || []) { const i = fl.y * N + fl.x, j = fl.ty * N + fl.tx; if (Math.abs(fl.tx - fl.x) + Math.abs(fl.ty - fl.y) !== 1) continue;
      if (s.type[i] !== T.RIVER || s.type[j] > T.RIVER || s.road[i] || s.road[j] || s.occ[i] || s.occ[j] || (s.dry && s.dry[j])) continue;
      if ((Ag.levelQ(i) - Ag.levelQ(j)) / 100 * 1.5 < Ag.STEP) continue;
      if (!sk.has(i * 4 + (fl.tx > fl.x ? 0 : fl.tx < fl.x ? 1 : fl.ty > fl.y ? 2 : 3)) && nf++ < 2) add('agua', 3, `a queda ${fl.name || ''} em ${fl.x},${fl.y} não é um degrau da água (sem lâmina)`, i); }
    // (the drawn wave within its 15 cm, in any wind, at any hour)
    for (let q = 0; q < 24; q++) { const X = G.hash(day * 31 + q) * N * 4, Z = G.hash(day * 37 + q + 7) * N * 4, t = G.hash(q * 13 + day) * 900; const w = [Math.cos(q) * 2.35, Math.sin(q) * 2.35, 2];
      const y = Ag.waveY(X, Z, t, w, q & 1, 9); if (!(Math.abs(y) <= Ag.WAVE.cap + 1e-9)) { add('agua', 2, `a onda desenhada de ${(y * 100).toFixed(0)} cm passa dos ${Ag.WAVE.cap * 100} cm (D-506)`); break; } }
    // (the wet and the puddles: in their range, none on the water, a building, a wall)
    let nw = 0;
    for (let q = 0; q < 48; q++) { const i = Math.floor(G.hash(day * 48 + q + 5003) * N * N); if (i >= N * N) continue; const x = i % N, y = (i / N) | 0; const w = Ag.wet(i), pz = Ag.puddle(x + 0.5, y + 0.5);
      const water = s.type[i] <= T.RIVER && !(s.dry && s.dry[i]);
      const why = !(w >= 0 && w <= 1) ? `molhado ${w}` : water && w > 0 ? 'molhado na água' : !(pz >= 0 && pz <= 1) ? `poça ${pz}` : pz > 0 && (water || s.occ[i] || s.wall[i]) ? `poça sobre ${water ? 'água' : s.occ[i] ? 'prédio' : 'muro'}` : '';
      if (why && nw++ < 2) add('agua', 3, `${why} em ${x},${y}`, i); }
    // (the 3D, open: the water it draws against the world)
    if (G.Realm && G.Realm.on && G.Agua3D && G.Agua3D.check) for (const m of G.Agua3D.check().slice(0, 3)) add('vista3d', 3, m);
  });
})();
