// ceu-inv: as regras do verificador para o céu, a luz e o ar (21d — D-466, D-520 a D-534). O G.Ceu só lê o mundo; estas regras
// conferem, a cada olhada do verificador, que o que ele responde tem a causa que diz ter — contada aqui de novo, direto dos campos
// do mundo (a chuva, as nuvens do mundo, o relevo, os rios, os biomas, as quedas, o chão queimado), nunca pelo próprio G.Ceu:
//   · com chuva sobre o corpo (a do tempo ou a de uma nuvem do mundo que passa), o céu sobre ele nunca é o de um dia limpo;
//   · o mapa do ar só tem névoa onde a causa existe: o vale (a terra mais baixa que o anel em volta), o rio ou o lago, o pântano,
//     a queda d'água do mundo, a mata úmida debaixo do dossel — num punhado de cantos escolhidos pelo hash, de novo;
//   · nenhum raio desenhado pelo 3D sem um raio do mundo ali há pouco (o chão queimado que o raio deixa na terra);
//   · o mapa do ar e a sombra dos montes que o 3D desenha são da versão do chão de agora (S.typeVer), passados uns segundos;
//   · o vento do céu é o do mundo, o mesmo que os bichos farejam (G.Meio.wind).
// Carregado depois do qa/qa.js (QA.more); o junta-inv.js o leva para dentro do qa.js.
(function () {
  if (!window.QA || !QA.more) return;
  QA.more.push(function (add, s) {
    const Ce = G.Ceu; if (!Ce || !s || !s.H || !s.type) return; const N = G.N, n = N + 1;
    const T = G.T, HM = 1.5;
    // the rain over the body: the sky over it never a fair day's
    const av = s.avatar ? s.villagers.get(s.avatar) : null;
    if (av) { const rainHere = Math.max(s.weather.rain || 0, G.Nature && G.Nature.rainAt ? G.Nature.rainAt(av.x, av.y) : 0);
      const c = Ce.cover(s.time, s.weather, s.clouds.length, s.day, av.x, av.y);
      if (rainHere > 0.3 && c < 0.36 + rainHere * 0.5) add('céu', 3, `chove ${rainHere.toFixed(2)} sobre o corpo e o céu sobre ele é de dia limpo (cobertura ${c.toFixed(2)})`); }
    // the map of the air: every corner with mist has its cause in the world — a handful of corners, by the hash, counted again
    const A = Ce.airMap(); if (A.n !== n) add('céu', 2, `o mapa do ar tem ${A.n} cantos de lado num mapa de ${n}`);
    else {
      const h = (i, j) => s.H[Math.max(0, Math.min(N, j)) * n + Math.max(0, Math.min(N, i))] * HM;
      const tileOf = (i, j, f) => { for (let dj = -1; dj <= 0; dj++) for (let di = -1; di <= 0; di++) { const x = i + di, y = j + dj; if (x >= 0 && y >= 0 && x < N && y < N && f(y * N + x)) return true; } return false; };
      const falls = (s.relief && s.relief.falls) || [];
      for (let k = 0; k < 64; k++) {
        const c = Math.floor(G.hash(k * 131 + (s.day | 0) * 7 + 11) * n * n); if (!(A.dawn[c] + A.last[c] > 0.02)) continue;
        const i = c % n, j = (c / n) | 0; const why = [];
        let ring = 0; for (let a = 0; a < 16; a++) { const an = a / 16 * Math.PI * 2; ring += h(Math.round(i + Math.cos(an) * 8), Math.round(j + Math.sin(an) * 8)); }
        if (ring / 16 - h(i, j) > 1.5) why.push('vale');
        if (tileOf(i, j, t => s.type[t] === T.RIVER)) why.push('rio');
        if (s.biome && tileOf(i, j, t => s.biome[t] === 3)) why.push('pântano');
        if (falls.some(f => Math.hypot(i - f.x - 0.5, j - f.y - 0.5) < 6.5 || Math.hypot(i - f.tx - 0.5, j - f.ty - 0.5) < 6.5)) why.push('queda');
        if (A.cano[c] > 0.3 && G.Mata) why.push('mata');
        if (!why.length) add('céu', 3, `névoa sem causa no canto ${i},${j} do mapa do ar (${(A.dawn[c] + A.last[c]).toFixed(2)})`);
      }
      if (!G.Mata) { let k = 0; for (let c = 0; c < n * n; c += 97) if (A.cano[c] > 0) k++; if (k) add('céu', 3, `o dossel no mapa do ar sem o G.Mata, que é quem o diz (${k} cantos)`); }
    }
    // the 3D's drawn bolts: each where the world struck a moment ago (on the land, a stroke leaves the ground burnt)
    const C3 = G.Ceu3D; if (C3 && C3.bolts) for (const b of C3.bolts) {
      if (s.clock - b.at > 8 || b.at > s.clock + 0.01) add('céu', 3, `um raio desenhado ${(s.clock - b.at).toFixed(1)} s depois do raio do mundo`);
      const x = Math.floor(b.x), y = Math.floor(b.y); if (x < 0 || y < 0 || x >= N || y >= N) continue; const i = y * N + x;
      if (s.type[i] > T.RIVER && s.burnt && !(s.burnt[i] > 0)) add('céu', 3, `um raio desenhado na casa ${x},${y}, onde o mundo não fez cair nenhum (o chão não queimou)`);
    }
    // the 3D's maps of the land: of the land as it is now, a few seconds on
    if (C3 && C3.maps) { const m = C3.maps(); if (m && m.key && m.key !== Ce.airKey() && s.clock - m.at > 6) add('céu', 3, `o 3D desenha o ar de outra versão do chão (${m.key} ≠ ${Ce.airKey()})`); }
    // one wind: the sky's is the world's, the one the beasts smell by
    if (G.Meio && G.Meio.wind) { const a = Ce.wind(s.weather).a, b = G.Meio.wind().a; let d = Math.abs(a - b) % (Math.PI * 2); if (d > Math.PI) d = Math.PI * 2 - d; if (d > 0.2) add('céu', 4, `o vento do céu (${a.toFixed(2)}) não é o dos bichos (${b.toFixed(2)})`); }
  });
})();
