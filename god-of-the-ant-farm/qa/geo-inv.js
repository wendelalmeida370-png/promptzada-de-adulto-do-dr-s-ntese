// geo-inv: as regras do verificador para o relevo (o G.Geo, js/geo.js; D-490 a D-499). O G.Geo só lê o mundo e guarda pequenas memórias
// (a dobra das camadas de cada casa, as formações de cada região de 16 × 16 casas); estas regras conferem, a cada olhada do verificador,
// em quatro regiões escolhidas pelo dia (nunca por um acaso):
//   · o entalhe de um penhasco é nada na borda de toda casa que não é entalhada (onde se anda, onde há pedra, estrada, prédio, boca de
//     caverna): o chão desenhado encontra o chão do mundo ao centímetro (S2 — o corpo e as portas pisam ali);
//   · o entalhe é número em todo ponto, e nunca maior que uma camada (S3);
//   · a memória bate com o mundo agora (a rocha e a dobra de uma casa, as formações de uma região: G.Geo.fresh / formsFresh — S3);
//   · cada formação dentro da coluna de uma casa entalhada e longe da borda das casas onde se anda (S3);
//   · a terra além da borda só onde a terra do mapa corre até ela — nunca num mapa de ilhas (S3, D-467).
// Carregado depois do qa/qa.js (QA.more); o junta-inv.js o leva para dentro do qa.js.
(function () {
  if (!window.QA || !QA.more) return;
  QA.more.push(function (add, s) {
    const Ge = G.Geo; if (!Ge || !s.cliff || !s.H) return; const N = G.N, R = Ge.R; const nr = Math.ceil(N / R); const o = [0, 0, 0];
    let ne = 0, nn = 0, nm = 0, nf = 0;
    for (let q = 0; q < 4; q++) {
      const rx = Math.floor(G.hash(((s.day | 0) * 4 + q) * 7919 + 29) * nr) % nr, ry = Math.floor(G.hash(((s.day | 0) * 4 + q) * 104729 + 31) * nr) % nr;
      for (let y = ry * R; y < Math.min(N, ry * R + R); y++) for (let x = rx * R; x < Math.min(N, rx * R + R); x++) {
        const i = y * N + x; if (!Ge.carves(i)) continue;
        // (the edges with a tile not carved: nothing; and the middle a number, no deeper than a layer)
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { if (G.W.inb(x + dx, y + dy) && Ge.carves((y + dy) * N + x + dx)) continue;
          for (let k = 0; k <= 4; k++) { const u = k / 4; const px = dx === 1 ? x + 1 : dx === -1 ? x : x + u, py = dy === 1 ? y + 1 : dy === -1 ? y : y + u; Ge.cliffAt(px, py, o);
            if (Math.abs(o[0]) + Math.abs(o[1]) + Math.abs(o[2]) > 1e-6 && ne++ < 2) add('relevo', 2, `o penhasco entalhado em ${x},${y} sai do chão do mundo (${(o[0]).toFixed(2)} m) na borda com a casa ${x + dx},${y + dy}, onde se anda ou há coisa do mundo`, i); } }
        Ge.cliffAt(x + 0.5, y + 0.5, o);
        if ((!Number.isFinite(o[0] + o[1] + o[2]) || Math.abs(o[0]) > 8 || Math.hypot(o[1], o[2]) > 1.5) && nn++ < 2) add('relevo', 3, `o entalhe do penhasco em ${x},${y} fora da medida (${o.map(v => +(+v).toFixed(2)).join(', ')})`, i);
      }
      // (the memory against the world now: one tile's rock and fold, the region's formations)
      const k0 = Math.floor(G.hash(rx * 31 + ry * 17 + (s.day | 0)) * R * R); const i0 = (ry * R + ((k0 / R) | 0)) * N + rx * R + k0 % R;
      if (i0 < N * N && (i0 % N) < N) { const f = Ge.fresh(i0); if ((f.rock !== Ge.rockAt(i0) || Math.abs(f.fold - Ge.foldAt(i0)) > 1e-6) && nm++ < 2) add('relevo', 3, `a memória do relevo em ${i0 % N},${(i0 / N) | 0} diz a rocha ${Ge.rockAt(i0)} e a dobra ${Ge.foldAt(i0).toFixed(2)}, o mundo agora ${f.rock} e ${f.fold.toFixed(2)}`, i0); }
      const fs = Ge.forms(rx, ry), ff = Ge.formsFresh(rx, ry);
      if (JSON.stringify(fs) !== JSON.stringify(ff) && nm++ < 2) add('relevo', 3, `as formações da região ${rx},${ry} na memória (${fs.length}) não são as do mundo agora (${ff.length})`);
      for (const fm of fs) { const t = G.W.idx(fm.x, fm.y);
        if ((!Ge.carves(fm.i) || t !== fm.i || (fm.kind !== 'arco' && Ge.reach(fm.x, fm.y) < 0.12)) && nf++ < 2) add('relevo', 3, `a formação «${fm.kind}» em ${fm.x.toFixed(1)},${fm.y.toFixed(1)} fora da coluna de uma casa entalhada ou junto da borda de onde se anda`, fm.i); }
    }
    // (the land beyond the edge: none round the island maps)
    if ((s.mapType === 'ilha' || s.mapType === 'arquipelago' || s.mapType === 'mar') && Ge.beyondAny()) add('relevo', 3, `terra além da borda num mapa de ${s.mapType} (D-467: o horizonte de uma ilha é o mar)`);
  });
})();
