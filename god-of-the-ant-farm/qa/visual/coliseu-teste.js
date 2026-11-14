// coliseu-teste: o Coliseu de teste das provas do 3D (E, Arquitetura Monumental, 1ª rodada). Enquanto a forma do Coliseu de
// 10 casas (40 m) do M1 não chega, este gerador a põe só nas provas que o carregam (no navegador por addScriptTag, em Node
// pelo extra do nodemundo): o anfiteatro de hoje (js/forma.js, amphi, D-095) no lote de 10 casas, com o mesmo vocabulário de
// peças — o tambor de três andares de arcos, a cávea (o pódio e cinco fileiras com as escadas, uma só peça; as três galerias
// com parapeito por cima, outra), a arena com o alçapão do subsolo, os mastros do velário — e os números que a planta do
// anfiteatro lê (F.amphi: a passagem, o subsolo, os degraus do pódio). Se o povo já sabe a forma de 10 casas (a do M1, em
// js/forma-espetaculo.js), não faz nada: a prova mede a forma de verdade.
(function (G) {
  const Fo = G.Forma; if (!Fo || Fo.has('maravilha', 'romano', 10)) return;
  const TAU = Math.PI * 2, RUN48 = 1 / Math.tan(48 * Math.PI / 180);
  const STONE = ['#c8b8a0', '#a89880', '#d8c8b0'];
  // (o: os números — r o raio do tambor, h a altura, andares, arcos em volta, a arena, as fileiras)
  function coliseu(L, o) {
    const c = [L / 2, L / 2]; const [cu, cv] = c;
    const R = L / 2 - 1.2, t = 0.8, H = o.h, N = o.arcos; const fundo = o.arena, ya = 3.0, yb = ya + 0.45, tr1 = 1.2;
    const ROW = 0.8, RISE = 0.45, nR = 5; // (as fileiras: assento de corpo, 0,45 m de altura e 0,8 m de fundo)
    // (a abertura do parapeito do pódio sobre os degraus da areia: 2,4 m — a planta do anfiteatro corta o parapeito em 32 pedaços,
    // de 2 m em volta de uma arena de 10 m, e tira os de meio a menos de w/2 + 0,1 da abertura: com 1,1 m, nenhum)
    const GAP = 2.4;
    const bw = 2 * R * Math.sin(Math.PI / N), aw = bw * 0.6, ah = (H / o.andares) * 0.725, hw = aw / 2;
    // (o pódio e as fileiras: do alto para baixo; a primeira é o topo da cávea — dela só a face, a fileira de cima é das galerias)
    const rows = []; for (let k = nR; k >= 1; k--) rows.push([fundo + tr1 + k * ROW, yb + k * RISE]); rows.push([fundo + tr1, yb]);
    const top = rows[0];
    // (as três galerias por cima das fileiras, de 1 m, igualmente até o andar de cima do tambor; a fileira de cima por baixo delas)
    const gy = k => top[1] + (H - top[1]) * k / 4;
    const gal = [[R, H], [R - t, gy(3)], [R - t - 0.8, gy(2)], [R - t - 1.8, gy(1)], top];
    // (as escadas: oito, entre os eixos — nos eixos ficam as entradas)
    const esc = { a: [0, 1, 2, 3, 4, 5, 6, 7].map(k => (k + 0.5) * Math.PI / 4), l: 1.2, n: 2 };
    const treads = (r, y, rise, m, du) => { const out = []; for (let j = 0; j < m; j++) { const f0 = (m - j - 1) / m, f1 = (m - j) / m;
      const q = du ? [r[0] + (r[2] - r[0]) * f0, r[1], r[0] + (r[2] - r[0]) * f1, r[3]] : [r[0], r[1] + (r[3] - r[1]) * f0, r[2], r[1] + (r[3] - r[1]) * f1];
      out.push({ k: 'bloco', r: q, y0: y, y1: y + rise * (j + 1) / m, cor: STONE, mat: 'slab', degrau: 1 }); } return out; };
    // (o subsolo, a passagem e os degraus do pódio: os do amphi)
    const run = ya * RUN48, vt = cv - 0.88; const under = [cu - hw, vt, cu + hw, vt + run];
    const hatch = [cu - hw, vt, cu + hw, vt + run * (1 - (ya - 0.2 - 1.9) / ya)];
    const steps = [cu - fundo, cv - 0.4, cu - fundo + 0.5, cv + 0.4];
    const vo = cv + R - t, vf = cv + Math.sqrt(Math.max(0, fundo * fundo - (hw + 0.15) ** 2)), hv = Math.min(ah, yb - 0.25); const pass = [];
    for (const s of [-1, 1]) { const u0 = s < 0 ? cu - hw - 0.15 : cu + hw, u1 = u0 + 0.15;
      pass.push({ k: 'bloco', r: [u0, vf, u1, vo], y0: 0, y1: hv, cor: STONE, mat: 'ashlar' }, { k: 'bloco', r: [u0, vt - 0.1, u1, vf], y0: 0, y1: ya - 0.2, cor: STONE, mat: 'ashlar' }); }
    pass.push({ k: 'bloco', r: [cu - hw - 0.15, vf, cu + hw + 0.15, vo], y0: hv, y1: hv + 0.2, cor: STONE, mat: 'ashlar' }, { k: 'bloco', r: [cu - hw, vt - 0.1, cu + hw, vt], y0: 0, y1: ya - 0.2, cor: STONE, mat: 'ashlar' });
    const shut = n => ({ anel: n, a: 0, w: 1e4 }); // (um anel sem parapeito)
    const els = [
      { k: 'tambor', c, r: R, t, y0: 0, y1: H, andares: o.andares, arcos: N, arcoW: 0.6, arcoA: 0.175, arcoB: 0.725, cor: ['#e8d2a6', '#b89a70'], escuro: '#2a1e18', mat: 'ashlar', abertos: [Math.PI / 2] },
      { k: 'cavea', c, aneis: gal, fundo: top[0] - ROW, cor: '#c8b8a0', parapeito: 0.9, muro: '#b8a888', vaos: [shut(gal.length - 1)], mat: 'ashlar' },
      { k: 'cavea', c, aneis: rows, fundo, cor: '#c8b8a0', parapeito: 0.9, muro: '#b8a888', escadas: esc, vaos: [shut(1), shut(2), shut(3), shut(4), { anel: nR, a: Math.PI, w: GAP }] },
      { k: 'arena', c, r: fundo, y: ya, cor: '#e8d8a8', muro: yb, buraco: hatch },
      ...treads(under, 0, ya, Math.ceil(ya / 0.23), 0), ...treads(steps, ya, yb - ya, 2, -1), ...pass,
      { k: 'mastros', c, r: R - 0.08, n: N, y0: H, h: 6, cor: '#7a5a3a' },
    ];
    return { els, door: { u: L / 2, w: aw, y0: 0, y1: ah },
      amphi: { c, R, t, fundo, ya, yb, tr1, aw, ah, under, hatch, steps, gap: { a: Math.PI, w: GAP }, face: R * Math.cos(Math.PI / N) } };
  }
  const O = { h: 21, andares: 3, arcos: +((typeof process !== 'undefined' && process.env && process.env.ARCOS) || 28), arena: 10 };
  Fo.def('maravilha', 'romano', L => coliseu(L, O), [10]);
  G.ColiseuTeste = O; // (a prova diz que mediu o Coliseu de teste, não o do M1)
})(window.G);
