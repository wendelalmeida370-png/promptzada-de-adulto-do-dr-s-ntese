// mata-inv: as regras do verificador para a mata (o G.Mata, js/mata.js; D-470 a D-473). O G.Mata só lê o mundo e guarda uma memória
// de regiões de 16 × 16 casas, refeita quando o que a faz muda; estas regras conferem, a cada olhada do verificador, em quatro regiões
// escolhidas pelo dia (nunca por um acaso):
//   · a memória bate com a mata feita do zero agora (G.Mata.fresh) — uma memória atrasada desenharia a mata de ontem;
//   · nada de mata em estrada, prédio, muro e água; a trilha batida (desgaste ≥ 2) aberta;
//   · os caules duros que o corpo não atravessa (Space.stems) nunca em estrada, prédio, trilha ou água, e longe de todo tronco do
//     mundo o bastante para o corpo passar (0,64 m).
// Carregado depois do qa/qa.js (QA.more); o junta-inv.js o leva para dentro do qa.js.
(function () {
  if (!window.QA || !QA.more) return;
  QA.more.push(function (add, s) {
    const Ma = G.Mata; if (!Ma || !s.treeAt || !s.trees) return; const N = G.N, R = Ma.R, T = G.T; const nr = Math.ceil(N / R);
    let nm = 0, nz = 0, ns = 0;
    for (let q = 0; q < 4; q++) {
      const h = G.hash(((s.day | 0) * 4 + q) * 7919 + 13); const rx = Math.floor(h * nr) % nr, ry = Math.floor(G.hash(((s.day | 0) * 4 + q) * 104729 + 7) * nr) % nr;
      const r = Ma.region(rx, ry); if (!r) continue;
      // (one tile of the region against the forest made from nothing)
      const k0 = Math.floor(G.hash(rx * 31 + ry * 17 + (s.day | 0)) * R * R); const i0 = (r.y0 + ((k0 / R) | 0)) * N + r.x0 + k0 % R;
      if (i0 < N * N) { const a = Ma.at(i0), f = Ma.fresh(i0); for (const fd of Ma.FIELDS) if (Math.abs(a[fd] - f[fd]) > 1e-9) { if (nm++ < 2) add('mata', 3, `a memória da mata em ${i0 % N},${(i0 / N) | 0} diz ${fd} ${a[fd].toFixed(2)} e o mundo agora ${f[fd].toFixed(2)}`, i0); break; } }
      for (let k = 0; k < R * R; k++) {
        const x = r.x0 + k % R, y = r.y0 + ((k / R) | 0); if (x >= N || y >= N) continue; const i = y * N + x; const d = r.dens[k];
        if (d && (s.road[i] || s.occ[i] || s.wall[i] || (s.type[i] <= T.RIVER && !(s.dry && s.dry[i])) || G.pathLevel(s.wear[i]) >= 2)) { if (nz++ < 2) add('mata', 3, `mata (${(d / 255).toFixed(2)}) em ${x},${y}, sobre ${s.road[i] ? 'estrada' : s.occ[i] ? 'prédio' : s.wall[i] ? 'muro' : s.type[i] <= T.RIVER ? 'água' : 'trilha batida'}`, i); }
        if (!G.Space || !G.Space.stems) continue;
        for (const st of Ma.stemsOf(i, r)) {
          let why = s.road[i] ? 'estrada' : s.occ[i] ? 'prédio' : G.pathLevel(s.wear[i]) >= 1 ? 'trilha' : s.type[i] <= T.RIVER ? 'água' : '';
          if (!why) for (let dy = -1; dy <= 1 && !why; dy++) for (let dx = -1; dx <= 1; dx++) { const j = (y + dy) * N + x + dx; if (j < 0 || j >= N * N) continue; const t = s.trees.get(s.treeAt[j]); const tr = G.Space.trunk(t); if (tr && Math.hypot(st[0] - t.x * 4, st[1] - t.y * 4) - tr - st[2] < 0.64) { why = `o tronco da árvore #${t.id}, sem lugar para o corpo passar`; break; } }
          if (why && ns++ < 2) add('mata', 2, `um caule duro em ${x},${y} sobre ${why}`, i);
        }
      }
    }
  });
})();
