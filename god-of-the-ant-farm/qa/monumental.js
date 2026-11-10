// monumental: a Arquitetura Monumental provada em Node (D-106, D-107; qa/monumental/PLANO.md §7, os testes de aceitação) —
// uma função por teste (a sua letra), cada uma escreve as suas linhas, PASSOU | monumental X… | o que mediu, ou FALHOU | …;
// o M2 escreve as suas (B, D, F, G e a H dos seus tipos) em qa/monumental-poder.js, com as mesmas linhas.
//   A — o Coliseu (a maravilha romana nos degraus de 10 e 13 casas: js/forma-espetaculo.js e a planta em
//       js/int-monumentos.js, D-107):
//     A1 a forma: o lote (40 e 52 m), a fachada (≥ 18 m, três andares de arcos e o ático, as baias de 4 a 6 m, os arcos na
//        proporção de gente, as quatro entradas nos eixos), a arena oval (≥ 20 × 12 m), as fileiras do corpo (0,40–0,45 ×
//        0,70–0,80 m; as de cima do camarote sobre a fileira de trás dele), os parapeitos (0,9 m; ao longo da passagem do
//        fundo, um só no chão do camarote), os degraus (≤ 0,30 m), o subsolo (os corredores, as jaulas, o alçapão), os mastros;
//        a mesma forma para todo prédio do degrau
//     A2 a planta: arma-se nos quatro lados, nos dois tamanhos, sem falha no relatório geométrico; três pisos e os lances entre
//        eles; ≥ 600 lugares de assistir sentados, cada um alcançado da porta; quem assiste em pé no pódio, quem luta na areia;
//        o tempo de fazê-la (o alvo: 400 ms)
//     A3 a forma × a planta: a planta só anda onde a forma tem chão (no térreo a praça e as passagens, na areia a arena, no
//        piso do pódio o pódio e as fileiras, os patamares e as pontes) e na altura dela (o pódio, as fileiras dos anéis da
//        forma, a areia); a parede da planta em cada baia da fachada, aberta nos eixos; a arena e o pódio andados inteiros
//     A4 os pés pelo caminho, num mundo em branco, a cada 2 cm (Space.indoor): da rua pela praça e pelo arco da frente até o pé
//        do lance; pela praça até o arco da esquerda e o pé do lance da porta da areia; pelo da direita até o subsolo e o pé
//        do lance do alçapão; na areia; no pódio e subindo um corredor até o alto das fileiras; pela praça até o arco do fundo,
//        subindo o lance do fundo nos degraus dele e do patamar pelo pódio até diante do trono e do banco da corte do camarote
//        — o chão da forma, o maior degrau, o corpo passando em todo ponto
//     A5 o mundo: o Coliseu pela mão do deus numa cidade romana (a metrópole pronta; a cidade pela regra do jogo, nunca pelo
//        nome: handFor, T-505), de pé — o lote, a forma e a planta do mesmo tamanho, o verificador limpo —; vivendo; salvo e
//        carregado (a mesma planta); derrubado pelo deus (a ruína limpa)
//     A6 o verificador (qa/monumental-inv.js): pega uma planta com menos lugares que o Coliseu tem (700 no de 10, 1340 no de
//        13), ou sem o trono do camarote, e cala quando ela volta
//     A7 os lugares (In.places, a tabela da planta), num processo à parte com prazo: feita a tempo, um lugar livre de assistir,
//        de lutar, o trono e a corte
//     A8 o parapeito do pódio do anfiteatro de hoje em volta de uma arena de 10 m (L-551): aberto sobre os degraus como o 3D,
//        as paredes no polígono do 3D (T-457)
//     A9 as passagens da esquerda e da direita cobertas da ponte do pódio à fachada (a abóbada: o vão azul que o E viu)
//     A10 o camarote do imperador (D-125), dos dois lados do patamar do fundo: na forma, 2,5 m da primeira fileira, o chão no
//        pódio duas fileiras fundo, a fileira de trás com o parapeito (a queda de 1,26 m), as fileiras de cima a partir da
//        quarta, o parapeito da passagem no chão dele, o trono (o assento a 0,5 m e o espaldar) e o banco da corte; na planta,
//        nos dois tamanhos e nos quatro lados, o lugar do trono e os quatro da corte (os usos 'trono' e 'corte') que o corpo
//        toma, um assento um do outro, o caminho até eles alcançado da porta; nenhum assento das fileiras nem lugar em pé no
//        camarote; a fileira de trás nunca andada, o parapeito dela no polígono do 3D (T-457); os assentos iguais nos quatro
//        lados
//   C — as pirâmides (a maravilha egípcia e a asteca nos degraus de 10 e 13 casas: js/forma-espetaculo.js e as plantas em
//       js/int-monumentos.js, D-108):
//     C1 as formas: a Grande Pirâmide lisa (as faces de 50 a 54°, a base ≥ 36 m), a entrada aberta na face (≥ 2,2 m), o
//        corredor, a galeria (degraus ≤ 0,30 m, ≤ 45°) e a câmara do rei dentro da massa (ocultos, meio metro dentro das
//        faces ao menos), o templo do pé no lote colossal; o Templo Mayor de ≥ 4 terraços, a escada dupla (as duas pistas,
//        a crista, as rampas; degraus ≤ 0,30 m) da praça ao alto, os dois santuários com as portas (≥ 2,2 m) e os braseiros,
//        o parapeito de 0,9 m aberto na escada; as duas massas de longe diferentes; a mesma forma para todo prédio do degrau
//     C2 as plantas: nos quatro lados e nos dois tamanhos, sem falha; os dois pisos e o lance; o corredor, o patamar e a
//        câmara (a praça e a plataforma) alcançados; os lugares do rito, os de cima no piso de cima; o tempo (≤ 400 ms)
//     C3 a forma × a planta: só se anda onde a forma tem chão — a laje fora da pirâmide, o corredor e a galeria; o patamar e
//        a câmara fora do sarcófago; a praça fora da base e a escada; o alto fora dos santuários e dos braseiros — e na
//        altura dela; o corredor, a câmara e a plataforma andados inteiros
//     C4 os pés, num mundo em branco, a cada 2 cm (Space.indoor): da rua pela entrada e o corredor, subindo a galeria, do alto
//        dela pela porta à câmara; da rua pela praça, em volta da base, subindo a escada, no alto entre os braseiros e em
//        volta dos santuários — o chão da forma (num lance, a até um degrau sob os degraus dela), o maior degrau, o corpo
//        passando em todo ponto
//     C5 o mundo: a pirâmide numa cidade egípcia e o Templo Mayor numa asteca pela mão do deus (a metrópole pronta; cada cidade
//        pela regra do jogo: handFor, T-505) — o povo não funda mais a maravilha antiga —, de pé, vivendo, salvos e carregados
//        (a mesma planta), derrubados: o verificador limpo
//     C6 o verificador: pega a câmara do rei noutra altura e o alto sem quem oficia, e cala quando voltam
//     C7 os lugares (a tabela da planta), num processo à parte com prazo: feita a tempo, um lugar livre de cada uso do rito
//   E — os teatros (o romano, o grego e o clássico — a forma do grego sem a faixa — nos degraus de 6, 8 e 10 casas: js/forma-espetaculo.js e a planta em
//       js/int-monumentos.js, D-109; e a L-494):
//     E1 as formas: a cávea (a romana meio círculo, a grega mais que meio), as fileiras do corpo, os níveis (o passeio entre
//        eles, o dobro de escadas acima), a galeria do alto (≥ 0,8 m) e o seu parapeito, o muro de 0,9 m na ponta de cada
//        fileira (da largura da parede da planta: L-507), a orquestra rente ao chão (L-494), o palco romano a 1 m (≥ 12 m de
//        largura no monumental, os lances do
//        corpo) e a frons acima das fileiras, a skene grega e o proskenion, as três portas (≥ 2,2 m), as colunas, as
//        entradas (≥ 2 m), os bastidores (o corredor, os camarins, a sala do meio)
//     E2 as plantas: nos quatro lados e nos três tamanhos, sem falha; todo assento alcançado (≥ 300 no monumental), os
//        níveis, os pisos e os lances, o palco, os bastidores, os camarins, a sala, as entradas, o adro — alcançados —;
//        quem atua (os postos do ofício e os lugares) e quem toca; os cabides; o tempo (≤ 400 ms)
//     E3 a forma × a planta: o chão e as fileiras na altura da forma, nada andado nos muros das pontas nem no parapeito; as
//        paredes da planta nas da forma — o parapeito da galeria no polígono do 3D (T-457); o prédio do palco até o teto da
//        forma, nenhuma parede dele acima (D-131) —, as portas nas aberturas; os lances do palco romano nos degraus da forma
//        (L-506); a L-494
//        (1) a orquestra e (3) nenhum chão na base de uma
//        coluna — também no teatro antigo —; a (2), do 3D e da planta, contada
//     E4 os pés, num mundo em branco, a cada 2 cm: da rua pelo adro, pelas entradas e pelos bastidores à orquestra, subindo ao
//        palco e aos bastidores, subindo a escada do meio pelas fileiras, pelo passeio e pela galeria
//     E5 o mundo: o teatro monumental numa cidade romana e numa grega pela mão do deus (cada cidade pela regra do jogo:
//        handFor, T-505) — o povo não funda mais o antigo —, de pé, vivendo, salvos e carregados, derrubados: o verificador limpo
//     E6 o verificador: pega o palco noutra altura e a plateia menor que o degrau, e cala quando voltam
//     E7 os lugares (a tabela da planta), num processo à parte com prazo: um lugar livre de assistir, de atuar e de tocar
//   H — os povos (cada tipo grande do M1 em cada povo, cada um com a forma do seu desenho: D-109):
//     H1 a maravilha (o Coliseu, a Grande Pirâmide, o Templo Mayor, Valhala, a Acrópole, o zigurate) e o teatro (o romano, o
//        grego e o clássico — o mesmo —, o campo de bola asteca, o salão do hidromel, o jardim sagrado),
//        cada um a sua forma: as silhuetas de longe (Fo.mass) se afastam em ≥ 10% do lote a alguma altura, de frente ou de lado
//     H2 a forma do campo de bola: a pista entre os muros com a rampa e os aros, as fileiras do corpo em cima deles, os
//        parapeitos de 0,9 m, os degraus dos lances
//     H3 as plantas do campo de bola: nos quatro lados e nos três tamanhos, sem falha, todo assento alcançado, o chão das
//        arquibancadas na altura da forma, os jogadores e quem assiste em pé, o tempo
//     H4 os pés pelo campo de bola, a cada 2 cm: da rua ao campo e à pista, subindo o lance do muro, pelo passeio e por uma
//        escada até o alto das fileiras
//     H5 o mundo: cada povo funda o seu degrau grande e nunca o antigo; o campo de bola pela mão do deus numa cidade asteca
//        (handFor, T-505), de pé, vivendo, salvo e carregado, o verificador (as arquibancadas noutra altura), derrubado
//     H6 os lugares do campo de bola (a tabela da planta): um lugar livre de assistir e de jogar
//   M — o grande monumento (o degrau de 4 casas, 16 m, em seis povos: o obelisco egípcio, a coluna do triunfo romana, a
//       Pedra do Sol asteca, o deus de ouro grego — D-109 —, o obelisco clássico, o do deus, e o navio de pedras nórdico — a 4ª
//       rodada; a planta, a do monumento de antes):
//     M1 as formas: os degraus do corpo (cada um em dois), o alto de 12,8 m, a peça do meio (≥ um décimo do alto), a altura
//        (≥ 10 m), as quatro silhuetas diferentes
//     M2 as plantas: nos quatro lados e nos quatro povos, sem falha, o alto alcançado, quem oferta, quem reza (16), quem acende
//     M3 os pés, a cada 2 cm: da rua pelos degraus ao alto, em volta do que está no meio, ao lugar de ofertar
//     M4 o mundo: pela mão do deus numa cidade de cada povo (a metrópole; pela regra do jogo: handFor, T-505), de pé, vivendo,
//        salvo e carregado, o verificador (o alto noutra altura), derrubado
//     M5 os lugares (a tabela da planta): um lugar livre de cada uso
//   W — as maravilhas que faltavam (Valhala nórdica, a Acrópole grega, o zigurate clássico nos degraus de 10 e 13 casas:
//       js/forma-espetaculo.js e as plantas em js/int-monumentos.js — a 3ª rodada):
//     W1 as formas: o lote, os degraus e as escadas do corpo (≤ 0,30 m, ≤ 50°), os parapeitos de 0,9 m na borda dos altos, as
//        portas (≥ 2,2 m), os postes do salão escondidos pelo telhado (antes dele na lista, ocultos), o vão do meio da frente
//        do templo (≥ 1,2 m entre as bases), os quatro níveis do zigurate, os braseiros, o olho; a mesma forma para todo prédio
//     W2 as plantas: nos quatro lados e nos dois tamanhos, sem falha, todo cômodo alcançado; os lugares de cada uma (os
//        bancos, as mesas e o escaldo; a prece na cela, a oferta e a vista no alto; o sacerdote, a prece, os braseiros e a
//        vista no terraço, a multidão na praça); o tempo (≤ 400 ms)
//     W3 a forma × a planta: os pisos na altura da forma, os parapeitos e as paredes da cela da planta nos da forma, nenhum
//        chão na base de uma coluna
//     W4 os pés, num mundo em branco, a cada 2 cm: pelos degraus e pela porta ao longo da nave; pela grande escada, entre as
//        colunas do meio, pela cela à prece e em volta da colunata; pela praça e pela escada ao terraço, diante do olho e em volta
//     W5 o mundo: cada povo as ergue (e nunca a antiga); pela mão do deus numa cidade de cada povo (handFor, T-505), de pé,
//        vivendo, salvas e carregadas, o verificador (o piso noutra altura), derrubadas — o povo clássico sem cidade na
//        metrópole (T-401)
//     W6 os lugares (a tabela da planta): um lugar livre de cada uso
//   T — os teatros que faltavam (o salão do hidromel nórdico e o jardim sagrado egípcio nos degraus de 6, 8 e 10 casas; o
//       clássico, a forma do grego sem a faixa, vai na E):
//     T1 as formas: o lote, os degraus, a porta (≥ 2,2 m), os postes escondidos, o lago na borda de pedra, as palmeiras, a
//        entrada entre as esfinges (≥ 2,2 m)
//     T2 as plantas: nos quatro lados e nos três tamanhos, sem falha, todo cômodo alcançado, quem assiste (nos bancos; em pé
//        diante do lago) e quem atua (os postos do ofício), o tempo
//     T3 a forma × a planta: o chão na altura da forma, nada andado no que ela tem de sólido, nenhum chão sob a água do
//        lago (L-505)
//     T4 os pés, a cada 2 cm: pelos degraus e pela porta ao longo da nave; entre as esfinges até diante do lago e ao longo dele
//     T5 o mundo: cada povo os ergue (e nunca o antigo); pela mão do deus numa cidade de cada povo (handFor, T-505), de pé,
//        vivendo, salvos e carregados, o verificador, derrubados
//     T6 os lugares (a tabela da planta): um lugar livre de cada uso
//   node qa/monumental.js [A C E H M W T …]   (só as letras pedidas; sem nada, todas)
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['qa/monumental-inv.js'] });
const In = G.Interiors, Fo = G.Forma, Sp = G.Space;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | monumental ${name} | ${info}`); if (!c) fails.push(name); };
const ms = () => Number(process.hrtime.bigint()) / 1e6; // (the clock of the process: Date.now stands still in nodemundo)
// (the time the process itself spent on fn — what a plan costs the game, not what a busy machine adds to the clock) → [its result, ms]
const cpuMs = fn => { const c0 = process.cpuUsage(); const r = fn(); const c = process.cpuUsage(c0); return [r, (c.user + c.system) / 1000]; };
const TAU = Math.PI * 2, CS = In.CS;
const blank = () => { G.S = { villagers: new Map(), buildings: new Map(), dead: new Map(), settlements: new Map(), clock: 100, day: 3, time: 0.4, avatar: null, nextId: 1000, history: [], fire: new Float32Array(G.N * G.N) }; };
const rec = (t, c, f, s, n) => ({ v: In.REC_V || 4, f, r: 0, t, u: In.TYPES[t].use, s, o: 7, c, e: 3, k: 'ae', cl: 't', fl: 0, d: 1, w: 1, pw: 0, h: [], m: 0, fx: [], dr: {}, hh: 0, nm: 0, vz: 0, ab: 0, n });
const SIZES = [10, 13], SIDES = ['S', 'E', 'N', 'W'];
// (a point in a polygon, by the crossings of a ray)
const inPoly = (pts, x, z) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, zi] = pts[i], [xj, zj] = pts[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; };
const angGap = (a, b) => { const d = ((a - b) % TAU + TAU) % TAU; return Math.min(d, TAU - d); };
const angIn = (th, a0, a1) => { const span = ((a1 - a0) % TAU + TAU) % TAU || TAU; return ((th - a0) % TAU + TAU) % TAU <= span + 1e-9; };
// (T-457: a plan's walls along a ring — their middle line on the 3D's polygon of radius r about c, G.Forma.ringEdge — over the
// arc from a0 to a1: the most a point of them stands off that polygon, and the widest stretch of the arc they leave open, in m)
const ringWallsOff = (walls, c, r, a0, a1) => {
  const ang = q => a0 - 0.5 + (((Math.atan2(q[1] - c[1], q[0] - c[0]) - a0 + 0.5) % TAU) + TAU) % TAU;
  let dev = 0; for (const w of walls) for (let j = 0; j <= 20; j++) { const x = w.a[0] + (w.b[0] - w.a[0]) * j / 20, z = w.a[1] + (w.b[1] - w.a[1]) * j / 20;
    dev = Math.max(dev, Math.abs(Math.hypot(x - c[0], z - c[1]) / Fo.ringEdge(1, Math.atan2(z - c[1], x - c[0])) - r)); }
  const arcs = walls.map(w => [ang(w.a), ang(w.b)].sort((x, y) => x - y)).sort((x, y) => x[0] - y[0]);
  let gap = arcs.length ? Math.max(arcs[0][0] - a0, a1 - arcs[arcs.length - 1][1], 0) : a1 - a0; for (let k = 1; k < arcs.length; k++) gap = Math.max(gap, arcs[k][0] - arcs[k - 1][1]);
  return { dev, gap: gap * r, n: walls.length };
};
// (the seats of a plan's rows the walk from its door reaches: a cell beside each, reached, a step from its height)
const reachedSeats = p => In.tierSeats(p).filter(q => { const n = p.grid.n, R = p.reach[q.lv], H = p.hgt && p.hgt[q.lv]; if (!R) return false; const cx = Math.floor(q.x / CS), cz = Math.floor(q.z / CS);
  for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) { const x = cx + dx, z = cz + dz; if (x < 0 || z < 0 || x >= n || z >= n) continue; const k = z * n + x; if (R[k] && (!H || Math.abs(H[k] - q.y) <= In.BODY.step + 1e-6)) return true; } return false; });
// (the floor of the form's seats at a point of the podium's storey, metres over the lot's ground — the cavea pieces' own
// rings: the podium's walk, each row, and in an aisle its steps, n to a row within a row's depth — the top ring is its top row
// and the walk behind it, flat —; null off them. Each ring's edge as the 3D draws it and the plan walks it: the polygon of its
// radius — the point's distance over the drawn edge's at its angle, G.Forma.ringEdge (L-494, 2))
function caveaY(F, u, z) {
  for (const e of F.els) {
    if (e.k !== 'cavea') continue; const th = Math.atan2(z - e.c[1], u - e.c[0]), d = Math.hypot(u - e.c[0], z - e.c[1]) / Fo.ringEdge(1, th);
    if (d < e.fundo || d > e.aneis[0][0] || !angIn(th, e.arco[0], e.arco[1])) continue;
    const A = e.aneis, n = A.length; let k = n - 1; while (k > 0 && d > A[k][0]) k--; const rIn = k < n - 1 ? A[k + 1][0] : e.fundo;
    const E = e.escadas; if (!E || !E.a.some(a => angGap(th, a) * d <= E.l / 2)) return A[k][1];
    const tread = n > 1 ? A[n - 1][0] - e.fundo : A[0][0] - e.fundo, rise = n > 1 ? A[n - 2][1] - A[n - 1][1] : 0.4; const j = Math.floor((d - rIn) / (tread / E.n));
    return j >= E.n ? A[k][1] : A[k][1] - rise + (j + 1) * rise / E.n;
  }
  return null;
}

// =========================================================================================== A — the Colosseum
function testeA() {
  blank();
  // ---------------------------------------------------------------- A1 the form
  {
    const out = [], said = [];
    for (const n of SIZES) {
      const F = Fo.of('maravilha', 'romano', n); if (!F || !F.amphi || !F.amphi.oval) { out.push(`n ${n}: sem forma`); continue; }
      const O = F.amphi.oval, cu = O.cu, cv = O.cv; const arc = F.els.find(e => e.k === 'arcada'), areia = F.els.find(e => e.k === 'areia');
      if (Fo.of('maravilha', 'romano', n) !== F) out.push(`n ${n}: a forma não é a mesma para todo prédio do degrau`);
      if (F.L !== n * 4 || F.L < 40) out.push(`n ${n}: o lote de ${F.L} m`);
      if (!arc || O.H < 18 || F.top < O.H) out.push(`n ${n}: a fachada de ${O.H} m (18 ao menos)`);
      const tiers = arc ? arc.andares.filter(a => a.arco).length : 0; if (tiers < 3 || !arc.andares.some(a => a.janela)) out.push(`n ${n}: ${tiers} andares de arcos e ${arc && arc.andares.some(a => a.janela) ? 'o' : 'nenhum'} ático`);
      const ch = arc.pts.map((p, k) => { const q = arc.pts[(k + 1) % arc.pts.length]; return Math.hypot(q[0] - p[0], q[1] - p[1]); });
      if (Math.min(...ch) < 4 || Math.max(...ch) > 6) out.push(`n ${n}: baias de ${Math.min(...ch).toFixed(2)} a ${Math.max(...ch).toFixed(2)} m (4 a 6)`);
      if (O.ah < 2.2 || O.aw < 2 || O.aw > 4 || O.ah / O.aw < 1.5 || O.ah / O.aw > 2.5) out.push(`n ${n}: o arco do térreo de ${O.aw} × ${O.ah} m`);
      // (the four ways in: open bays, each centred on an axis, square to the lot)
      const ways = (arc.abertos || []).filter(k => { const p = arc.pts[k], q = arc.pts[(k + 1) % arc.pts.length]; const mu = (p[0] + q[0]) / 2, mv = (p[1] + q[1]) / 2;
        return (Math.abs(mu - cu) < 1e-3 && Math.abs(p[1] - q[1]) < 1e-3) || (Math.abs(mv - cv) < 1e-3 && Math.abs(p[0] - q[0]) < 1e-3); });
      if (ways.length < 4) out.push(`n ${n}: ${ways.length} entradas nos eixos`);
      // (the arena: an oval of 20 × 12 m at least, the form's sand on its outline)
      const ext = areia ? [Math.max(...areia.pts.map(p => p[0])) - Math.min(...areia.pts.map(p => p[0])), Math.max(...areia.pts.map(p => p[1])) - Math.min(...areia.pts.map(p => p[1]))] : [0, 0];
      if (ext[0] < 20 || ext[1] < 12 || Math.abs(ext[0] - ext[1]) < 2) out.push(`n ${n}: a arena de ${ext[0].toFixed(2)} × ${ext[1].toFixed(2)} m`);
      // (the rows: the body's seat — each ring one rise over the next, one tread deep but the top one's; the lowest over the podium,
      // or over the third row behind the emperor's box (D-125) —, the podium's parapet: the walk on each arc's edge)
      const rowsP = F.els.filter(e => e.k === 'cavea' && e.aneis.length > 1), pod = F.els.filter(e => e.k === 'cavea' && (Math.abs(e.fundo - O.rs) < 1e-3 || Math.abs(e.fundo - O.rb) < 1e-3)); let rmin = 9, rmax = 0, tmin = 9, tmax = 0;
      for (const e of rowsP) { const A = e.aneis; const X = O.boxes.find(q => Math.abs(e.fundo - q.r3) < 1e-3), base = X ? X.y3 : O.yb;
        for (let k = 0; k < A.length; k++) { const rIn = k < A.length - 1 ? A[k + 1] : [e.fundo, base]; const rise = A[k][1] - rIn[1];
        rmin = Math.min(rmin, rise); rmax = Math.max(rmax, rise); if (k > 0) { const tr = A[k][0] - rIn[0]; tmin = Math.min(tmin, tr); tmax = Math.max(tmax, tr); } } }
      if (rmin < 0.4 - 1e-6 || rmax > 0.45 + 1e-6 || tmin < 0.7 - 1e-6 || tmax > 0.8 + 1e-6) out.push(`n ${n}: fileiras de ${rmin.toFixed(2)}–${rmax.toFixed(2)} × ${tmin.toFixed(2)}–${tmax.toFixed(2)} m`);
      if (pod.length < 8 || pod.some(e => !(e.parapeito >= 0.9))) out.push(`n ${n}: o pódio sem o parapeito de 0,9 m`);
      if (O.yb - O.ya < 2.2) out.push(`n ${n}: o pódio a ${(O.yb - O.ya).toFixed(2)} m sobre a areia`);
      // (the steps: each flight's riser, the aisles' half rows; the parapets along the passages, 0.9 m over the rows)
      const risers = [O.yb / O.ways.frente.m, O.yb / O.ways.fundo.m, O.ya / O.ways.esquerda.m, O.ya / O.hypo.m, O.rise / 2]; if (Math.max(...risers) > In.BODY.step) out.push(`n ${n}: degraus de ${Math.max(...risers).toFixed(2)} m`);
      // (by the emperor's box the first two rows along the back passage are its floor: one parapet at its height, not two)
      const par = F.els.filter(e => e.k === 'bloco' && e.y0 >= O.yb - 1e-6 && Math.abs(e.y1 - e.y0 - 0.9) < 1e-6); if (par.length < 8 * O.rows - 2) out.push(`n ${n}: ${par.length} parapeitos ao longo das passagens (${8 * O.rows - 2} ao menos)`);
      // (the undercroft: its corridors' walls under the sand, the cages with their bars, the hatch; the masts)
      const under = F.els.filter(e => e.k === 'bloco' && e.y0 === 0 && Math.abs(e.y1 - (O.ya - 0.2)) < 1e-6).length, bars = F.els.filter(e => e.k === 'janelas' && e.grade).length;
      if (under < 8 || O.cages.length < 4 || bars < O.cages.length || !areia || !(areia.buracos || []).length) out.push(`n ${n}: o subsolo com ${under} paredes, ${O.cages.length} jaulas, ${bars} grades, ${areia && areia.buracos ? areia.buracos.length : 0} alçapões`);
      const masts = F.els.filter(e => e.k === 'tora').length; if (masts < O.nb) out.push(`n ${n}: ${masts} mastros (${O.nb} pilares)`);
      said.push(`n ${n}: lote ${F.L} m, fachada ${O.H} m (o alto ${F.top.toFixed(1)}) em ${tiers} andares de arcos e o ático, ${O.nb} baias de ${Math.min(...ch).toFixed(2)} m, arco ${O.aw} × ${O.ah} m, ${ways.length} entradas; arena ${ext[0].toFixed(1)} × ${ext[1].toFixed(1)} m a ${O.ya} m, pódio a ${O.yb} m; ${O.rows} fileiras de ${rmax.toFixed(2)} × ${tmin.toFixed(2)} m; ${O.cages.length} jaulas; ${masts} mastros`);
    }
    ok('A1 a forma do Coliseu: o lote, a fachada, a arena oval, as fileiras do corpo, os parapeitos, os degraus, o subsolo', !out.length, out.slice(0, 4).join(' · ') || said.join(' · '));
  }
  // ---------------------------------------------------------------- A2 the plan
  const plans = {}; let nid = 61001;
  {
    const out = [], said = []; const times = [];
    for (const n of SIZES) for (const s of SIDES) {
      const b = { id: (nid += 37), type: 'maravilha', style: 'romano', x: 8, y: 8, w: n, h: n, built: true }; b.ip = rec('maravilha', 'romano', 'forma.maravilha', s, n);
      const [p, dt] = cpuMs(() => In.makeFam(b, b.ip, 'forma.maravilha')); times.push(dt); plans[n + s] = { b, p };
      if (!p || !p.ok) { out.push(`n ${n}/${s}: não se arma (${p ? p.errs.slice(0, 2).join('; ') : '—'})`); continue; }
      G.S.buildings.set(b.id, b);
      const fal = In.report(b, p, { rec: b.ip }).filter(q => q.k === 'FALHA'); if (fal.length) out.push(`n ${n}/${s}: ${fal.slice(0, 2).map(q => q.what).join('; ')}`);
      const seats = In.tierSeats(p), got = reachedSeats(p); if (seats.length < 600 || got.length < seats.length) out.push(`n ${n}/${s}: ${seats.length} assentos, ${got.length} alcançados`);
      const lv = p.levels.map(l => l.lv).join(','); if (lv !== '0,1,2') out.push(`n ${n}/${s}: os pisos ${lv}`);
      const fl = p.stairs.map(q => `${q.lv0}→${q.lv1}`).sort().join(' '); if (fl !== '0→1 0→1 0→2 0→2') out.push(`n ${n}/${s}: os lances ${fl}`);
      const mk = use => (p.marks || []).filter(q => q.use === use).flatMap(q => q.pts).filter(q => q.ok).length; if (mk('lutar') < 2 || mk('assistir') < 40) out.push(`n ${n}/${s}: ${mk('lutar')} lugares de luta, ${mk('assistir')} de assistir em pé`);
      if (s === 'S') said.push(`n ${n}: ${got.length} assentos alcançados de ${seats.length}, ${mk('assistir')} em pé no pódio, ${mk('lutar')} de luta; ${p.rooms.length} cômodos, ${p.walls.length} paredes`);
    }
    const tmax = Math.max(...times), tmed = times.slice().sort((a, b) => a - b)[times.length >> 1];
    if (tmax > 400) out.push(`a planta levou ${tmax.toFixed(0)} ms (o alvo: 400)`);
    ok('A2 a planta do Coliseu: nos quatro lados e nos dois tamanhos, ≥ 600 assentos alcançados, em pé no pódio, a luta na areia, o tempo', !out.length, out.slice(0, 4).join(' · ') || `${said.join(' · ')}; o tempo: a primeira ${times[0].toFixed(0)} ms, a mediana ${tmed.toFixed(0)}, a maior ${tmax.toFixed(0)} (alvo 400)`);
  }
  // ---------------------------------------------------------------- A3 the form × the plan
  {
    const out = [], said = [];
    for (const n of SIZES) {
      const { p } = plans[n + 'S']; if (!p || !p.ok) continue; const F = Fo.of('maravilha', 'romano', n), O = F.amphi.oval; const { cu, cv } = O; const N = p.grid.n;
      const arc = F.els.find(e => e.k === 'arcada'); const strip = (x, z) => Math.abs(x - cu) < O.g / 2 || Math.abs(z - cv) < O.h / 2;
      const inArena = (x, z) => O.inside(x, z, 0), inBand = (x, z) => O.inside(x, z, O.dp);
      // (where the walk goes on each storey: the form's floors there — the square out of the facade and the passages through
      // it, the arena and its gate, the podium and the rows within the facade's inner face, out of the passages but for the
      // landings and the bridges)
      const allowed = {
        0: (x, z) => !inPoly(arc.pts, x, z) || strip(x, z),
        1: (x, z) => inArena(x, z) || (Math.abs(z - cv) < O.h / 2 && x < cu && x > cu - O.Au - 0.3),
        2: (x, z) => !inArena(x, z) && ((inPoly(arc.pts1, x, z) && !strip(x, z)) || (strip(x, z) && inBand(x, z))),
      };
      const bad = { 0: 0, 1: 0, 2: 0 }, first = {}, cnt = { 0: 0, 1: 0, 2: 0 };
      for (const lv of [0, 1, 2]) { const R = p.reach[lv]; for (let k = 0; k < N * N; k++) { if (!R[k]) continue; cnt[lv]++; const x = (k % N + 0.5) * CS, z = (Math.floor(k / N) + 0.5) * CS; if (!allowed[lv](x, z)) { bad[lv]++; if (!first[lv]) first[lv] = `(${x.toFixed(2)}, ${z.toFixed(2)})`; } } }
      for (const lv of [0, 1, 2]) if (bad[lv]) out.push(`n ${n}: ${bad[lv]} casinhas do piso ${lv} andadas fora do chão da forma (a primeira ${first[lv]})`);
      // (and every floor of the form walked: the arena's and the podium's band, the cells inside them a body's half off their edges)
      let ia = 0, ra = 0, ib = 0, rb = 0;
      for (let k = 0; k < N * N; k++) { const x = (k % N + 0.5) * CS, z = (Math.floor(k / N) + 0.5) * CS;
        if (O.inside(x, z, -0.45) && !(x > O.hatch[0] - 0.45 && x < O.hatch[2] + 0.45 && z > O.hatch[1] - 0.45 && z < O.hatch[3] + 0.45)) { ia++; if (p.reach[1][k]) ra++; }
        if (O.inside(x, z, O.dp - 0.45) && !O.inside(x, z, 0.45) && !strip(x, z)) { ib++; if (p.reach[2][k]) rb++; } }
      if (ra < ia || rb < ib) out.push(`n ${n}: a arena andada em ${ra} de ${ia} casinhas, o pódio em ${rb} de ${ib}`);
      // (the heights: the podium's and the rows' — the form's rings, off the aisles —, the sand's, the ground's)
      let worst = 0, at = '';
      for (let k = 0; k < N * N; k++) { if (!p.reach[2][k]) continue; const x = (k % N + 0.5) * CS, z = (Math.floor(k / N) + 0.5) * CS; if (strip(x, z)) continue; const fy = caveaY(F, x, z); if (fy === null) continue;
        // (a row's top where the cell's middle is: the cell's own height is its middle's — off the risers by half a cell)
        const near = [[0.13, 0], [-0.13, 0], [0, 0.13], [0, -0.13]].some(([dx, dz]) => Math.abs((caveaY(F, x + dx, z + dz) ?? fy) - fy) > 1e-6); if (near) continue;
        const d = In.floorYOf(p, 2, x, z) - fy; if (Math.abs(d) > Math.abs(worst)) { worst = d; at = `(${x.toFixed(2)}, ${z.toFixed(2)})`; } }
      if (Math.abs(worst) > 0.01) out.push(`n ${n}: o piso do pódio a ${worst.toFixed(2)} m da forma em ${at}`);
      const y1 = p.levels.find(l => l.lv === 1).y, ay = F.els.find(e => e.k === 'areia').y; if (Math.abs(y1 - ay) > 1e-6) out.push(`n ${n}: a areia da planta a ${y1}, a da forma a ${ay}`);
      const y0 = p.levels.find(l => l.lv === 0).y, gy = F.els.find(e => e.k === 'bloco' && e.piso).y1; if (Math.abs(y0 - gy) > 1e-6) out.push(`n ${n}: o térreo da planta a ${y0}, a praça da forma a ${gy}`);
      // (the facade: the plan's wall in each bay — between its outer and its inner face —, open on the axes: the way through)
      const g0 = p.grid.lv[0]; let shut = 0, open = 0;
      for (let k = 0; k < arc.pts.length; k++) { const q = (k + 1) % arc.pts.length; const x = (arc.pts[k][0] + arc.pts[q][0] + arc.pts1[k][0] + arc.pts1[q][0]) / 4, z = (arc.pts[k][1] + arc.pts[q][1] + arc.pts1[k][1] + arc.pts1[q][1]) / 4;
        const c = g0[Math.floor(z / CS) * N + Math.floor(x / CS)]; if (arc.abertos.includes(k)) { if (c === In.CELL.DOOR && p.reach[0][Math.floor(z / CS) * N + Math.floor(x / CS)]) open++; } else if (c === In.CELL.WALL) shut++; }
      if (shut < arc.pts.length - 4 || open < 4) out.push(`n ${n}: a fachada na planta: ${shut} baias fechadas, ${open} abertas e andadas`);
      said.push(`n ${n}: andadas ${cnt[0]} / ${cnt[1]} / ${cnt[2]} casinhas nos três pisos, a arena ${ra}/${ia} e o pódio ${rb}/${ib}; o piso das fileiras a ${worst.toFixed(3)} m da forma; ${shut} baias fechadas e ${open} abertas`);
    }
    ok('A3 a forma × a planta: só se anda onde a forma tem chão, na altura dela, a arena e o pódio inteiros, a fachada nas baias', !out.length, out.slice(0, 4).join(' · ') || said.join(' · '));
  }
  // ---------------------------------------------------------------- A4 the feet, on a blank world
  {
    const S = G.newState(7); S.H.fill(4); S.type.fill(G.T.GRASS); if (S.biome) S.biome.fill(0); S.clock = 0; S.day = 30; S.time = 0.3; G.S = S; G.newWorld();
    const TL = Sp.TILE; const out = [], said = [];
    for (const n of SIZES) {
      const def = G.BDEF.maravilha; const b = { id: 91001 + n, type: 'maravilha', style: 'romano', esc: n === 10 ? 'maravilha' : 'colossal', x: 12, y: 12, w: n, h: n, built: true, progress: 1, hp: def.hp || 100, maxHp: def.hp || 100, v: 0, set: 0, blocks: true, ip: null };
      for (const o of [...S.buildings.values()]) { for (let yy = o.y; yy < o.y + o.h; yy++) for (let xx = o.x; xx < o.x + o.w; xx++) S.occ[yy * G.N + xx] = 0; S.buildings.delete(o.id); }
      S.buildings.set(b.id, b); for (let yy = b.y; yy < b.y + b.h; yy++) for (let xx = b.x; xx < b.x + b.w; xx++) S.occ[yy * G.N + xx] = b.id;
      b.ip = In.newRecord(b, { t: 'maravilha', c: 'romano', e: 3, k: 'ae', cl: 't', fl: 0, d: 1, w: 1, pw: 0, s: 'S', o: (1 << n) - 1, n });
      const p = Sp.planNow(b); if (!p || !p.ok) { out.push(`n ${n}: sem planta (${p ? p.errs.slice(0, 2).join('; ') : '—'})`); continue; }
      const F = Fo.of('maravilha', 'romano', n), O = F.amphi.oval, W = O.ways; const { cu, cv, g, h, Au, Bv, rb, dp } = O; const L = n * TL; const gy = F.els.find(e => e.k === 'bloco' && e.piso).y1;
      // (the form's floor under a point of a storey: the square's top on the ground; the sand; on the podium's storey the seats'
      // own — the landings', the bridges' and the podium's top —; within half a cell's diagonal of a step of the rows — the
      // plan's height is its cell's middle's —, not asked)
      const want = (lv, u, z) => (lv === 0 ? gy : lv === 1 ? O.ya : (caveaY(F, u, z) ?? O.yb));
      const R8 = [0, 1, 2, 3, 4, 5, 6, 7].map(k => [0.18 * Math.cos(k * Math.PI / 4), 0.18 * Math.sin(k * Math.PI / 4)]);
      const edge = (lv, u, z) => lv === 2 && R8.some(([dx, dz]) => Math.abs((caveaY(F, u + dx, z + dz) ?? O.yb) - (caveaY(F, u, z) ?? O.yb)) > 1e-6);
      const pl = Sp.plinth(b); let worst = 0, at = '', step = 0, shut = 0, shutAt = '', pts = 0;
      // (the ways, leg by leg on their storeys, every 2 cm: the feet where Space puts them, against the form's floor there)
      const big = [cu + g / 2, cv + h / 2 - O.b]; const am = (O.phi + Math.PI / 2) / 2; const onBig = (r, a) => [big[0] + r * Math.cos(a), big[1] + r * Math.sin(a)];
      const podium = []; for (let a = Math.PI / 2 - 0.02; a >= am; a -= 0.02) podium.push(onBig(rb + 0.62, a)); podium.push(onBig(rb + 0.62, am));
      const top = []; for (let a = am; a <= am + 0.12; a += 0.02) top.push(onBig(rb + O.D - O.t - 0.36, a));
      // (and to the emperor's box, D-125: round the square to the back arch, up the back flight — on its treads —, from the
      // landing along the podium into each side of it: to where one stands before the throne, before the court's bench)
      const vL = cv - Bv - dp / 2, thr = O.boxes.find(X => X.seat === 'trono').r, ben = O.boxes.find(X => X.seat === 'corte').r; const bm = (ben[0] + ben[2]) / 2;
      const legs = [
        [0, [[cu, L + 0.8], [cu, W.frente.r[3] + 0.45]]],
        [0, [[cu - 3, L - 2.0], [0.85, L - 2.0], [0.85, cv], [W.esquerda.r[0] - 0.45, cv]]],
        [0, [[cu + 3, L - 2.0], [L - 0.85, L - 2.0], [L - 0.85, cv], [cu, cv], [cu, O.hypo.r[1] - 0.45]]],
        [1, [[cu - Au + 0.5, cv], [cu, cv], [cu + 3, cv + 2.5], [cu + 3, O.hypo.r[3] + 1.0]]],
        [2, [[cu, cv + Bv + 0.85]].concat(podium, [onBig(rb + O.D - O.t - 0.36, am)], top)],
        [0, [[cu + 3, L - 2.0], [L - 0.85, L - 2.0], [L - 0.85, 0.85], [cu, 0.85], [cu, W.fundo.r[1] - 0.45]]],
        [0, [[cu, W.fundo.r[1] - 0.05], [cu, W.fundo.r[3] - 0.05]], 1],
        // (and up each of the other flights, from its foot to its top: the front one to the podium, the gate's to the sand, the
        // undercroft's under the hatch — L-665)
        [0, [[cu, W.frente.r[3] + 0.05], [cu, W.frente.r[1] + 0.05]], 1], [0, [[W.esquerda.r[0] - 0.05, cv], [W.esquerda.r[2] - 0.05, cv]], 1], [0, [[cu, O.hypo.r[1] - 0.05], [cu, O.hypo.r[3] - 0.05]], 1],
        [2, [[cu, W.fundo.r[3] + 0.35], [cu, vL], [cu + g / 2 + 1.0, vL], [(thr[0] + thr[2]) / 2, vL], [(thr[0] + thr[2]) / 2, thr[3] + 0.45]]],
        [2, [[cu, vL], [cu - g / 2 - 1.0, vL], [bm + 0.6, vL], [bm + 0.6, ben[3] + 0.35], [bm - 0.6, ben[3] + 0.35]]],
      ];
      // (the form's treads of each flight — its blocks marked degrau on the flight's footprint —, and the way up it: along v or u)
      const LANCES = [['frente', W.frente.r, 1], ['fundo', W.fundo.r, 1], ['esquerda', W.esquerda.r, 0], ['subsolo', O.hypo.r, 1]];
      const treads = []; for (const [nm, r, ax] of LANCES) for (const e of F.els) if (e.k === 'bloco' && e.degrau && e.r[0] >= r[0] - 1e-6 && e.r[2] <= r[2] + 1e-6 && e.r[1] >= r[1] - 1e-6 && e.r[3] <= r[3] + 1e-6) treads.push({ r: e.r, y1: e.y1, nm, ax });
      // (the top of the highest tread under a point — a hair either side: the plan's are rounded to the centimetre, and at a
      // tread's edge the next one's is the feet's —; within a hair of an edge across the way up, a step under it too: L-665)
      const near = (q, u, z) => u >= q.r[0] - 0.011 && u <= q.r[2] + 0.011 && z >= q.r[1] - 0.011 && z <= q.r[3] + 0.011;
      const tread = (u, z) => { let y = null, nm = null; for (const q of treads) if (near(q, u, z) && (y === null || q.y1 > y)) { y = q.y1; nm = q.nm; } return y === null ? null : { y, nm }; };
      // (and within a cell of the grid of a flight's end: there the plan reads the flight where the cell's middle is on it — In.floorY,
      // as In.walk reads the grid —, the storey's floor before the first tread off it: the back flight's foot at 6.68 m, the cell's
      // middle at 6.625)
      const edgeOf = (u, z) => treads.some(q => near(q, u, z) && (q.ax ? Math.abs(z - q.r[1]) <= 0.011 || Math.abs(z - q.r[3]) <= 0.011 : Math.abs(u - q.r[0]) <= 0.011 || Math.abs(u - q.r[2]) <= 0.011))
        || LANCES.some(([, r, ax]) => { const c = ax ? z : u, x = ax ? u : z, k = ax ? 0 : 1; return x >= r[k] && x <= r[k + 2] && (Math.abs(c - r[ax]) <= 0.261 || Math.abs(c - r[ax + 2]) <= 0.261); });
      let flight = 0; const per = {}; for (const [nm] of LANCES) per[nm] = 0;
      for (const [lv, path, onFlight] of legs) { let prev = null;
        for (let k = 0; k < path.length - 1; k++) { const [u0, z0] = path[k], [u1, z1] = path[k + 1]; const len = Math.hypot(u1 - u0, z1 - z0), m = Math.max(1, Math.round(len / 0.02));
          for (let j = 0; j <= m; j++) { const u = u0 + (u1 - u0) * j / m, z = z0 + (z1 - z0) * j / m; const X = b.x * TL + u, Z = b.y * TL + z; const ins = Sp.indoor(X, Z, lv, b.id);
            const foot = ins ? ins.y : Math.max(Sp.footAt(X / TL, Z / TL), Sp.stepTop(X, Z)); pts++;
            if (ins && !ins.walk) { shut++; if (!shutAt) shutAt = `(${u.toFixed(2)}, ${z.toFixed(2)}) piso ${lv}`; }
            if (prev !== null) step = Math.max(step, Math.abs(foot - prev)); prev = foot;
            // (on a flight: the feet on each of its treads, as the form draws them — the plan has them, L-665)
            if (onFlight) { const t = tread(u, z); if (t === null) continue; flight++; per[t.nm]++; const d = foot - (pl.hi + t.y + Sp.FLOOR_UP); const under = edgeOf(u, z) ? 0.3 : 0;
              if ((d > 0.03 || d < -under - 0.03) && Math.abs(d) > Math.abs(worst)) { worst = d; at = `(${u.toFixed(2)}, ${z.toFixed(2)}) no lance ${t.nm === 'subsolo' ? 'do subsolo' : t.nm === 'esquerda' ? 'do portão' : 'd' + (t.nm === 'frente' ? 'a frente' : 'o fundo')}`; } continue; }
            if (!ins || !ins.shell || edge(lv, u, z)) continue; // (the street before the way in; a step's edge of the rows)
            const d = foot - (pl.hi + want(lv, u, z) + Sp.FLOOR_UP); if (Math.abs(d) > 0.03 && Math.abs(d) > Math.abs(worst)) { worst = d; at = `(${u.toFixed(2)}, ${z.toFixed(2)}) piso ${lv}`; } } } }
      if (worst || step > In.BODY.step + 0.01) out.push(`n ${n}: os pés a ${worst.toFixed(2)} m da forma em ${at || '—'}, o maior degrau ${step.toFixed(2)} m`);
      if (shut) out.push(`n ${n}: ${shut} pontos do caminho onde o corpo não passa (o primeiro ${shutAt})`);
      const sem = Object.keys(per).filter(k => !per[k]); if (sem.length) out.push(`n ${n}: o caminho não subiu o lance ${sem.join(', ')}`);
      said.push(`n ${n}: ${pts} pontos (nos lances: ${Object.entries(per).map(([k, v]) => `${k} ${v}`).join(', ')}), o maior degrau ${step.toFixed(2)} m`);
    }
    ok('A4 os pés pelo Coliseu: da rua pelos arcos às passagens e ao subsolo, na areia, no pódio, subindo um corredor das fileiras e pelo lance do fundo até o trono e a corte do camarote', !out.length, out.slice(0, 3).join(' · ') || said.join(' · '));
  }
  // ---------------------------------------------------------------- A5 the world: the god's hand in a Roman town
  // (the town by the game's rule, never by its name — handFor, T-505: the Roman capital, while the hand finds its lot there —, in
  // the metrópole while the Roman people has a town in it: mundoDe, T-604)
  {
    const out = []; const w = mundoDe('romano');
    M.pronto(w || 'metropole');
    const bad = what => { const q = globalThis.QA.check().filter(x => x.sev <= 2 || x.sys === 'monumental' || x.sys === 'escala'); if (q.length) out.push(`${what}: ${q.slice(0, 2).map(x => `${x.sys} S${x.sev} ${x.msg.slice(0, 90)}`).join(' · ')}`); };
    bad('antes');
    const hf = handFor('romano', 'maravilha', 'maravilha'), set = hf.set, b = hf.b;
    let info = '';
    if (!set) out.push('sem cidade romana em mundo pronto nenhum');
    else if (!b) out.push(`a mão do deus não achou nem abriu lote de 10 casas para o povo romano (${set.name})`);
    else {
      const p = In.plan(b), F = Fo.of(b.type, b.style, b.w);
      if (b.w !== 10 || b.h !== 10 || b.esc !== 'maravilha' || !b.built) out.push(`o prédio ${b.w}×${b.h} esc=${b.esc} pronto=${b.built}`);
      if (!F || F.L !== b.w * 4 || !p || !p.ok || In.nOf(b.ip) !== b.w) out.push(`o lote, a forma e a planta: ${b.w * 4} m, ${F ? F.L : '—'} m, ${p && p.ok ? In.nOf(b.ip) * 4 + ' m' : 'sem planta'}`);
      const fal = p && p.ok ? In.report(b, p, { world: true, sides: true }).filter(q => q.k === 'FALHA') : []; if (fal.length) out.push(`no mundo: ${fal.map(q => q.what).join('; ')}`);
      bad('de pé'); M.viver(5); bad('vivendo'); const sig = p && p.sig;
      M.salvarCarregar(); const b2 = G.S.buildings.get(b.id); const p2 = b2 && In.plan(b2); if (!p2 || !p2.ok || p2.sig !== sig || b2.w !== 10 || b2.esc !== 'maravilha') out.push('depois do save: outro prédio ou outra planta'); bad('carregado');
      G.inSim++; try { G.Village.damageBuilding(G.S.buildings.get(b.id), 1e6, 'quake'); } finally { G.inSim--; }
      const b3 = G.S.buildings.get(b.id); if (b3 && b3.type !== 'ruin') out.push('o deus derrubou e ficou de pé'); bad('derrubado'); M.viver(1); bad('a ruína vivendo');
      info = `${set.name}: #${b.id} ${b.w}×${b.h} casas a ${G.dist(b.x + b.w / 2, b.y + b.h / 2, set.cx, set.cy).toFixed(1)} casas do centro${goneTxt(hf)}, ${p && p.cap.watch} assentos; vivo, salvo e carregado (a mesma planta), derrubado: o verificador limpo${ondeTxt(w, 'romano')}`;
    }
    if (!M.limpo()) { const e = M.erros(); out.push(`erros: ${JSON.stringify(e.mod)} ${e.console.slice(0, 2).join(' | ')}`); }
    ok('A5 o Coliseu pela mão do deus numa cidade romana (a metrópole; a cidade pela regra do jogo): de pé, vivendo, salvo e carregado, derrubado — o verificador limpo', !out.length, out.slice(0, 3).join(' · ') || info);
  }
  // ---------------------------------------------------------------- A6 the checker
  {
    const out = []; M.pronto(mundoDe('romano') || 'metropole'); const { b } = handFor('romano', 'maravilha', 'maravilha');
    const mine = () => globalThis.QA.check().filter(q => q.sys === 'monumental');
    const clean = b ? mine() : []; if (!b) out.push('sem o Coliseu'); else if (clean.length) out.push(`com a planta inteira: ${clean.map(q => q.msg.slice(0, 80)).join(' · ')}`);
    const plan0 = In.plan; In.plan = x => { const p = plan0(x); return x === b && p ? Object.assign({}, p, { cap: Object.assign({}, p.cap, { watch: 120 }) }) : p; };
    let hit; try { hit = mine(); } finally { In.plan = plan0; }
    if (!hit.some(q => q.sev === 2)) out.push('com 120 lugares o verificador calou');
    if (mine().length) out.push('de volta, o verificador não calou');
    // (and a plan with no throne in the emperor's box, D-125)
    In.plan = x => { const p = plan0(x); return x === b && p ? Object.assign({}, p, { items: p.items.filter(i => i.kind !== 'trono-camarote') }) : p; };
    let hit2; try { hit2 = mine(); } finally { In.plan = plan0; }
    if (!hit2.some(q => q.sev === 2 && /trono/.test(q.msg))) out.push('sem o trono do camarote o verificador calou');
    if (mine().length) out.push('de volta, o verificador não calou');
    ok('A6 o verificador do Coliseu: pega uma planta com menos lugares que o degrau, ou sem o trono do camarote, e cala quando ela volta', !out.length, out.join(' · ') || `limpo; com 120 lugares: «${hit[0].msg.slice(0, 90)}»; sem o trono: «${hit2.find(q => /trono/.test(q.msg)).msg.slice(0, 90)}»; limpo de novo`);
  }
  // ---------------------------------------------------------------- A7 the places' table
  {
    const o = placesOf('romano', 10, ['assistir', 'lutar', 'trono', 'corte']); const out = [];
    if (o.err) out.push(o.err);
    else { if (!o.ok || !o.free.assistir || !o.free.lutar || !o.free.trono || !o.free.corte) out.push(`a tabela ${o.ok ? 'feita' : 'não feita'}, um lugar livre de assistir ${o.free.assistir}, de lutar ${o.free.lutar}, o trono ${o.free.trono}, a corte ${o.free.corte}`); if (o.dt > 400) out.push(`a tabela dos lugares levou ${o.dt.toFixed(0)} ms (o alvo: 400)`); }
    ok('A7 os lugares do Coliseu (In.places, a tabela da planta): feita a tempo, um lugar livre de assistir e de lutar, o trono e a corte do camarote', !out.length, out.join(' · ') || `${o.spots} lugares na tabela em ${o.dt.toFixed(0)} ms`);
  }
  // ---------------------------------------------------------------- A8 the podium's parapet of today's amphitheatre, round a great arena
  // (L-551: the arena's plan of before — js/forma.js amphi — round an arena of 10 m, as E's test Colosseum has it: its parapet open
  // over the steps from the sand exactly as the 3D leaves it — the gap's width at the ring's radius, cut at those angles —, and the
  // body taking the steps' top. In a process of its own: the test form, a size no people has, never reaches the other tests)
  {
    const path = require('path'), cp = require('child_process');
    const code = `const M = require(${JSON.stringify(path.join(__dirname, 'nodemundo.js'))}); const G = M.load({}); const In = G.Interiors, Fo = G.Forma;
      G.S = { villagers: new Map(), buildings: new Map(), dead: new Map(), settlements: new Map(), clock: 100, day: 3, time: 0.4, avatar: null, nextId: 1000, history: [], fire: new Float32Array(G.N * G.N) };
      const RUN48 = 1 / Math.tan(48 * Math.PI / 180), n = 12, L = n * 4, cu = L / 2, cv = L / 2, R = L / 2 - 1.2, N = 28, fundo = 10, ya = 3.0, yb = 3.45, tr1 = 1.2;
      const bw = 2 * R * Math.sin(Math.PI / N), aw = bw * 0.6, ah = 7 * 0.725, hw = aw / 2, run = ya * RUN48, vt = cv - 0.88;
      const A = { c: [cu, cv], R, t: 0.8, fundo, ya, yb, tr1, aw, ah, under: [cu - hw, vt, cu + hw, vt + run], hatch: [cu - hw, vt, cu + hw, vt + run * (1 - (ya - 0.2 - 1.9) / ya)], steps: [cu - fundo, cv - 0.4, cu - fundo + 0.5, cv + 0.4], gap: { a: Math.PI, w: 1.1 }, face: R * Math.cos(Math.PI / N) };
      Fo.def('maravilha', 'romano', () => ({ els: [], amphi: A }), [n]);
      const rec = ${JSON.stringify(rec('maravilha', 'romano', 'forma.maravilha', 'S', 12))}; const b = { id: 72001, type: 'maravilha', style: 'romano', x: 8, y: 8, w: n, h: n, built: true, ip: rec }; G.S.buildings.set(b.id, b);
      const p = In.makeFam(b, rec, 'forma.maravilha'); const out = { ok: !!(p && p.ok), errs: p ? p.errs.slice(0, 2) : [] };
      if (p && p.ok) { const fal = In.report(b, p, { rec }).filter(q => q.k === 'FALHA').map(q => q.what); out.fal = fal;
        // (the opening: the gap between the podium's walls' ends either side of it, as angles about the middle, against the 3D's)
        const ang = q => Math.atan2(q[1] - cv, q[0] - cu); let lo = -9, hi = 9; const half = A.gap.w / 2 / fundo;
        for (const w of p.walls) { if (w.lv !== 2 || w.kind !== 'parede') continue; for (const q of [w.a, w.b]) { let a = ang(q); if (a < 0) a += 2 * Math.PI; const d = a - Math.PI; if (d <= 1e-9 && d > lo) lo = d; if (d >= -1e-9 && d < hi) hi = d; } }
        out.open = [lo, hi]; out.want = half; const st = p.stairs.find(s => s.lv0 === 1 && s.lv1 === 2); out.top = st ? st.b : null;
        // (and the walls on the 3D's polygon — their middle line 6 cm out of the sand's edge by its measure, the cut's ends too: T-457)
        let dev = 0; for (const w of p.walls) { if (w.lv !== 2 || w.kind !== 'parede') continue; for (let j = 0; j <= 20; j++) { const x = w.a[0] + (w.b[0] - w.a[0]) * j / 20, z = w.a[1] + (w.b[1] - w.a[1]) * j / 20; dev = Math.max(dev, Math.abs(Math.hypot(x - cu, z - cv) / Fo.ringEdge(1, Math.atan2(z - cv, x - cu)) - fundo - 0.06)); } } out.dev = dev; }
      console.log(JSON.stringify(out)); process.exit(0);`;
    const r = cp.spawnSync(process.execPath, ['-e', code], { cwd: __dirname, timeout: 60000, encoding: 'utf8' }); let o = null; try { o = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch (e) { o = null; }
    const out = [];
    if (!o) out.push(`o processo da prova falhou: ${(r.stderr || '').slice(0, 160)}`);
    else if (!o.ok) out.push(`a planta não se arma: ${o.errs.join('; ')}`);
    else { if (o.fal.length) out.push(o.fal.slice(0, 2).join('; ')); if (Math.abs(-o.open[0] - o.want) > 0.002 || Math.abs(o.open[1] - o.want) > 0.002) out.push(`a abertura do parapeito de ${(o.open[0] * 180 / Math.PI).toFixed(2)}° a ${(o.open[1] * 180 / Math.PI).toFixed(2)}°, a do 3D ±${(o.want * 180 / Math.PI).toFixed(2)}°`);
      if (!(o.dev <= 0.01)) out.push(`o parapeito a ${(o.dev * 100).toFixed(1)} cm do polígono do 3D (T-457)`); }
    ok('A8 o parapeito do pódio do anfiteatro de hoje em volta de uma arena de 10 m (L-551): aberto sobre os degraus da areia como o 3D, o corpo no alto deles', !out.length, out.join(' · ') || `a abertura de ${(o.open[0] * 180 / Math.PI).toFixed(2)}° a +${(o.open[1] * 180 / Math.PI).toFixed(2)}° em volta do meio (a do 3D: ±${(o.want * 180 / Math.PI).toFixed(2)}°, 1,1 m no raio da arena), o parapeito a ${(o.dev * 100).toFixed(1)} cm do polígono do 3D (T-457); o alto dos degraus em (${o.top.map(q => q.toFixed(2)).join(', ')})`);
  // ---------------------------------------------------------------- A9 the side passages' vault
  // (the passages of the left and the right go under the rows from the bridge at the podium out to the facade: at every point of
  // them, a piece of the form over the head — the bridge, the vault —; without the vault the sky showed between the rows' ends,
  // beside the bridge: the blue gap E saw. The proof counts the points left open with the vault taken out, too: it would see it)
  {
    const out = [], said = [];
    for (const n of SIZES) {
      const F = Fo.of('maravilha', 'romano', n), O = F.amphi.oval; const k3 = x => Math.round(x * 1000) / 1000;
      const roofed = (els, u, v) => els.some(e => e.k === 'bloco' && !e.degrau && e.y0 >= 2.0 && u > e.r[0] - 1e-6 && u < e.r[2] + 1e-6 && v > e.r[1] - 1e-6 && v < e.r[3] + 1e-6);
      let open = 0, openAt = '', pts = 0, without = 0;
      for (const su of [1, -1]) {
        const e0 = O.cu + su * O.Au, e1 = e0 + su * O.dp, ef = O.cu + su * (O.Au + O.D - O.t); const vr = [Math.min(e1, ef), O.cv - O.h / 2, Math.max(e1, ef), O.cv + O.h / 2].map(k3);
        const rest = F.els.filter(e => !(e.k === 'bloco' && e.r.every((q, k) => Math.abs(q - vr[k]) < 1e-6)));
        for (let u = Math.min(e0, ef) + 0.05; u < Math.max(e0, ef) - 0.05; u += 0.1) for (const v of [O.cv - O.h / 2 + 0.1, O.cv, O.cv + O.h / 2 - 0.1]) { pts++;
          if (!roofed(F.els, u, v)) { open++; if (!openAt) openAt = `(${u.toFixed(2)}, ${v.toFixed(2)})`; }
          if (!roofed(rest, u, v)) without++; }
      }
      if (open) out.push(`n ${n}: ${open} de ${pts} pontos das passagens sem nada por cima (o primeiro ${openAt})`);
      if (!without) out.push(`n ${n}: sem a abóbada, nenhum ponto aberto — a prova não a veria`);
      said.push(`n ${n}: ${pts} pontos das duas passagens, todos cobertos (sem a abóbada, ${without} abertos)`);
    }
    ok('A9 as passagens da esquerda e da direita do Coliseu: cobertas da ponte do pódio à fachada (a abóbada; sem ela, o vão azul do céu entre as pontas das fileiras)', !out.length, out.join(' · ') || said.join(' · '));
  }
  }
  // ---------------------------------------------------------------- A10 the emperor's box (D-125)
  // (either side of the back landing, on the minor axis: the first two rows out of the back's big arcs along 2.5 m of the first
  // row — its floor the podium's, at its height —; the third its back, the parapet on its edge over a drop of more than a metre,
  // no seat on it — one seated there has the parapet over his eyes —; the rows from the fourth over it; the parapet along the
  // passage at its floor; the throne in the right one — its seat at the hips of one seated, its back over his head —, the
  // court's bench in the left. On the plan, in the two sizes and the four sides: the throne's place and the court's four — the
  // uses 'trono' and 'corte', the names the games will ask for —, each the body takes, a seat apart, the way onto it reached
  // from the door; no seat of the rows nor place standing in the box, its back row never walked)
  {
    const out = [], said = [];
    for (const n of SIZES) {
      const F = Fo.of('maravilha', 'romano', n), O = F.amphi.oval, B = O.boxes || [];
      if (B.length !== 2 || !B.some(X => X.seat === 'trono' && X.su > 0) || !B.some(X => X.seat === 'corte' && X.su < 0)) { out.push(`n ${n}: ${B.length} camarotes`); continue; }
      const r1 = O.rb + O.dp; let lens = [];
      for (const X of B) {
        const tag = `n ${n} (${X.seat})`, len = (X.span[1] - X.span[0]) * r1; lens.push(len);
        if (Math.abs(len - 2.5) > 0.05) out.push(`${tag}: ${len.toFixed(2)} m da primeira fileira`);
        const on = e => e.k === 'cavea' && e.arco && Math.abs(e.arco[0] - X.span[0]) < 1e-6 && Math.abs(e.arco[1] - X.span[1]) < 1e-6;
        // (the rows of its quarter: over it only from the fourth — the piece of them from the fourth over the whole arc, the god
        // painting no end of them across it —, the first three over the rest of the arc)
        const am = (X.span[0] + X.span[1]) / 2, mine = F.els.filter(e => e.k === 'cavea' && e.escadas && Math.abs(e.c[0] - X.c[0]) < 1e-6 && Math.abs(e.c[1] - X.c[1]) < 1e-6);
        const ps = F.els.filter(on), floor = ps.find(e => e.aneis.length === 1 && !e.parapeito), back = ps.find(e => e.aneis.length === 1 && e.parapeito), up = mine.find(e => Math.abs(e.fundo - X.r3) < 1e-3 && angIn(am, e.arco[0], e.arco[1]));
        if (!floor || Math.abs(floor.aneis[0][1] - O.yb) > 1e-6 || Math.abs(floor.fundo - r1) > 1e-3 || Math.abs(floor.aneis[0][0] - r1 - 2 * O.tread) > 1e-3) out.push(`${tag}: o chão ${floor ? `a ${floor.aneis[0][1]} m, de ${floor.fundo} a ${floor.aneis[0][0]}` : 'ausente'}`);
        const drop = back ? back.aneis[0][1] - O.yb : 0; if (!back || !(back.parapeito >= 0.9) || drop <= 1 || Math.abs(back.fundo - X.rB) > 1e-3) out.push(`${tag}: a fileira de trás ${back ? `${drop.toFixed(2)} m sobre o chão, parapeito ${back.parapeito}` : 'ausente'}`);
        if (!up || Math.abs(up.fundo - X.r3) > 1e-3 || Math.abs(up.aneis[up.aneis.length - 1][1] - (O.yb + 4 * O.rise)) > 1e-3) out.push(`${tag}: as fileiras de cima ${up ? `a partir de ${up.aneis[up.aneis.length - 1][1]} m` : 'ausentes'}`);
        if (mine.length !== 2 || mine.some(e => angIn(am, e.arco[0], e.arco[1]) && e.fundo < X.r3 - 1e-3)) out.push(`${tag}: as fileiras do quarto por cima do camarote (${mine.length} peças)`);
        const ue = O.cu + X.su * O.g / 2, vf = O.cv - O.Bv - O.dp, vb = vf - 2 * O.tread;
        if (!F.els.some(e => e.k === 'bloco' && Math.abs(e.y0 - O.yb) < 1e-6 && Math.abs(e.y1 - e.y0 - 0.9) < 1e-6 && Math.abs((X.su > 0 ? e.r[0] : e.r[2]) - ue) < 1e-3 && e.r[1] <= vb + 1e-3 && e.r[3] >= vf - 1e-3)) out.push(`${tag}: sem o parapeito ao longo da passagem`);
        const at = (y0, y1) => F.els.find(e => e.k === 'bloco' && Math.abs(e.y0 - y0) < 1e-6 && Math.abs(e.y1 - y1) < 1e-6 && e.r[0] < X.r[2] && e.r[2] > X.r[0] && e.r[1] < X.r[3] + 0.5 && e.r[3] > X.r[1] - 0.5);
        if (X.seat === 'trono' && (!at(O.yb, O.yb + 0.5) || !at(O.yb + 0.5, O.yb + 1.6))) out.push(`${tag}: o trono sem o assento a 0,5 m ou o espaldar`);
        if (X.seat === 'corte' && (!at(O.yb, O.yb + 0.45) || X.r[2] - X.r[0] < 2.2)) out.push(`${tag}: o banco da corte`);
      }
      // (the plans: the places, the body, the door — and, the street on the front, the box's ground)
      const tally = [];
      for (const s of SIDES) {
        const { b, p } = plans[n + s] || {}; if (!p || !p.ok) { out.push(`n ${n}/${s}: sem planta`); continue; }
        const its = k => p.items.filter(i => i.kind === k && i.lv === 2); const T = its('trono-camarote'), C = its('banco-corte');
        const sp = (L, use) => L.flatMap(i => i.spots.filter(q => q.use === use)); const tr = sp(T, 'trono'), co = sp(C, 'corte');
        if (T.length !== 1 || C.length !== 1 || tr.length !== 1 || co.length !== 4 || ![...tr, ...co].every(q => q.ok && q.on)) out.push(`n ${n}/${s}: ${tr.length} tronos e ${co.length} lugares da corte (${[...tr, ...co].filter(q => q.ok).length} que o corpo toma)`);
        const gap = Math.min(...co.map((q, k) => Math.min(...co.filter((_, j) => j !== k).map(o => Math.hypot(o.x - q.x, o.z - q.z))))); if (gap < 0.5 - 1e-6) out.push(`n ${n}/${s}: a corte a ${gap.toFixed(2)} m um do outro`);
        const N = p.grid.n, R = p.reach[2]; const reached = (x, z) => { const cx = Math.floor(x / CS), cz = Math.floor(z / CS); for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) { const k = (cz + dz) * N + cx + dx; if (R[k]) return true; } return false; };
        for (const i of [...T, ...C]) if (!i.spots.some(q => q.use === 'acesso' && q.ok && reached(q.x, q.z))) out.push(`n ${n}/${s}: ${i.name.toLowerCase()} que a porta não alcança`);
        tally.push(p.cap.watch);
        if (s !== 'S') continue;
        // (the street on the front: the plan's frame the form's)
        // (the box's band by the 3D's polygon, as the plan lays it — the radius over the edge's at the angle, G.Forma.ringEdge —;
        // and its back wall on that polygon, a hand inside the band, the whole arc: along the round it stood 4.3 cm off it, T-457.
        // A hand inside the band, where the 3D lays the parapet of a piece — on its row, 0.12 m from the edge in (build3d's
        // cavea) —, 0.12 m thick, to the parapet's top: the plan's stood on the box's floor before it, and the proof looked for it
        // there, L-600)
        const l2 = p.levels.find(l => l.lv === 2), pw = (X, w) => Math.abs(w.t - 0.12) < 1e-6 && Math.abs(l2.y + w.h - X.y3 - 0.9) < 0.011;
        const inBox = (x, z, r0, rA) => B.some(X => { const th = Math.atan2(z - X.c[1], x - X.c[0]), d = Math.hypot(x - X.c[0], z - X.c[1]) / Fo.ringEdge(1, th); return d >= r0(X) && d <= rA(X) && angIn(th, X.span[0], X.span[1]); });
        const backs = B.map(X => ringWallsOff(p.walls.filter(w => w.lv === 2 && w.kind === 'parapeito' && pw(X, w) && [w.a, w.b].every(q => Math.abs(Math.hypot(q[0] - X.c[0], q[1] - X.c[1]) - (X.rB + 0.06)) < 0.15 && angIn(Math.atan2(q[1] - X.c[1], q[0] - X.c[0]), X.span[0] - 0.01, X.span[1] + 0.01))), X.c, X.rB + 0.06, X.span[0], X.span[1]));
        if (backs.some(o => !o.n || o.dev > 0.01 || o.gap > 0.02)) out.push(`n ${n}: o parapeito de trás do camarote ${backs.map(o => `em ${o.n} paredes a ${(o.dev * 100).toFixed(1)} cm do polígono do 3D, o maior vão ${o.gap.toFixed(2)} m`).join(' e ')} (T-457, L-600)`);
        const seats = In.tierSeats(p).filter(q => inBox(q.x, q.z, () => r1, X => X.r3)); if (seats.length) out.push(`n ${n}: ${seats.length} assentos das fileiras no camarote ou na fileira de trás`);
        const stand = (p.marks || []).filter(M => M.use === 'assistir').flatMap(M => M.pts).filter(q => inBox(q.x, q.z, () => O.rb, X => X.r3)); if (stand.length) out.push(`n ${n}: ${stand.length} lugares de assistir em pé diante do camarote`);
        let strip = 0, walked = 0; for (let k = 0; k < N * N; k++) { const x = (k % N + 0.5) * CS, z = (Math.floor(k / N) + 0.5) * CS; if (!inBox(x, z, X => X.rB + 0.02, X => X.r3 - 0.02)) continue; strip++; if (R[k]) walked++; }
        if (!strip || walked) out.push(`n ${n}: a fileira de trás do camarote andada em ${walked} de ${strip} casinhas`);
        said.push(`n ${n}: o camarote de ${lens.map(x => x.toFixed(2)).join(' e ')} m, o trono e a corte (4) que o corpo toma, alcançados da porta; ${p.cap.watch} assentos; a fileira de trás (${strip} casinhas) nunca andada, o parapeito dela a ${(Math.max(...backs.map(o => o.dev)) * 100).toFixed(1)} cm do polígono do 3D (T-457)`);
      }
      if (new Set(tally).size > 1) out.push(`n ${n}: os assentos mudam com o lado (${tally.join(', ')})`);
    }
    ok('A10 o camarote do imperador (D-125): a forma — o chão no pódio, a fileira de trás com o parapeito, o trono e o banco —, o trono e a corte que o corpo toma alcançados da porta, nenhum assento nem lugar em pé no camarote', !out.length, out.slice(0, 4).join(' · ') || said.join(' · '));
  }
  // ---------------------------------------------------------------- A11 the plan's storeys against the form (L-599, L-600)
  // (on the plans of A2 — the two sizes, the four sides —, in the form's own frame (G.Forma.toCan): (1) the walls round the sand —
  // the ground's, the sand's, the podium's parapet — on the 3D's polygon of each arc, the podium's front: laid as chords of their
  // own they stood up to 1.4 cm off it, L-599; (2) under the sand no wall taller than its storey: the passages' walls stood up
  // through the sand to the podium; (3) a flight under the storey it comes up to, its hole wherever a head would meet that
  // storey's floor: the 3D laid the podium's floor over the front and back flights, 27 cm over their top steps; (4) the grid's
  // floor within its storey's area: the lot's corners on the rows' storey were floor in the air; (5) none of it on the rows'
  // storey in the facade's stone, where the heads of its ground arches are; (6) the cages walled as the form stands them: the
  // quarter's floor went on through their stone; (7) the top ring of the rows out to the polygon round the facade's inner face:
  // between its corners the back of the rows stood before the facade's flat bays, in the colossal — L-600. The 3D's own reading,
  // ray by ray, is the interior3d's, in the worlds that have a Colosseum standing: T-490)
  {
    const out = [], said = []; const FL = In.CELL.FLOOR;
    for (const n of SIZES) {
      const F = Fo.of('maravilha', 'romano', n), O = F.amphi.oval, L = F.L, cS = Math.cos(Math.PI / Fo.SEG); let dev = 0, nRing = 0;
      // (the facade's stone: between its inner and its outer faces — its bays flat, from corner to corner (pts1, pts) —, a hand
      // off both)
      const segD = (x, z, a, c) => { const dx = c[0] - a[0], dz = c[1] - a[1], l2 = dx * dx + dz * dz || 1; const f = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / l2)); return Math.hypot(x - a[0] - dx * f, z - a[1] - dz * f); };
      const offAll = (P2, x, z) => P2.every((a, k) => segD(x, z, a, P2[(k + 1) % P2.length]) > 0.05);
      const inStone = (x, z) => inPoly(O.pts, x, z) && !inPoly(O.pts1, x, z) && offAll(O.pts, x, z) && offAll(O.pts1, x, z);
      for (const e of F.els) { if (e.k !== 'cavea' || Math.abs(e.aneis[0][1] - O.yTop) > 1e-6) continue; const q = O.prims.find(o => o.k === 'arco' && Math.hypot(o.c[0] - e.c[0], o.c[1] - e.c[1]) < 2e-3);
        if (q && e.aneis[0][0] * cS < q.r0 + O.D - O.t - 1e-3) out.push(`n ${n}: o alto das fileiras no raio ${e.aneis[0][0]}, por dentro da face de dentro da fachada entre os cantos`); }
      for (const s of SIDES) {
        const { p } = plans[n + s] || {}; if (!p || !p.ok) { out.push(`n ${n}/${s}: sem planta`); continue; }
        const tag = `n ${n}/${s}`, can = c => Fo.toCan(s, L, c[0], c[1]), lvOf = lv => p.levels.find(l => l.lv === lv), N = p.grid.n;
        const cells = (lv, fn) => { const g = p.grid.lv[lv]; let k2 = 0; for (let k = 0; k < N * N; k++) { if (g[k] !== FL) continue; const x = (k % N + 0.5) * CS, z = (Math.floor(k / N) + 0.5) * CS; if (fn(x, z, can([x, z]))) k2++; } return k2; };
        // (1)
        for (const q of O.prims) { if (q.k !== 'arco') continue;
          for (const [lv, half] of [[0, 0.1], [1, 0.1], [2, 0.06]]) {
            const ws = p.walls.filter(w => w.lv === lv && Math.abs(w.t - 2 * half) < 1e-6).map(w => ({ a: can(w.a), b: can(w.b) })).filter(w => [w.a, w.b].every(c => { const th = Math.atan2(c[1] - q.c[1], c[0] - q.c[0]);
              return Math.abs(Math.hypot(c[0] - q.c[0], c[1] - q.c[1]) / Fo.ringEdge(1, th) - q.r0 - half) < 0.08 && angIn(th, q.arco[0] - 0.01, q.arco[1] + 0.01); }));
            const o = ringWallsOff(ws, q.c, q.r0 + half, q.arco[0], q.arco[1]); nRing += o.n; dev = Math.max(dev, o.dev);
            if (!o.n || o.gap > 0.03) out.push(`${tag}: piso ${lv}, o arco de ${q.r0.toFixed(2)} m em ${o.n} paredes, o maior vão ${o.gap.toFixed(2)} m`); } }
        // (2)
        const l0 = lvOf(0), l1 = lvOf(1), l2 = lvOf(2);
        const tall = p.walls.filter(w => w.lv === 0 && l0.y + w.h > l1.y + 0.005 && [0.1, 0.5, 0.9].some(f => { const c = can([w.a[0] + (w.b[0] - w.a[0]) * f, w.a[1] + (w.b[1] - w.a[1]) * f]); return O.inside(c[0], c[1], 0); }));
        if (tall.length) out.push(`${tag}: ${tall.length} paredes do térreo debaixo da areia mais altas que ele (a ${Math.max(...tall.map(w => l0.y + w.h)).toFixed(2)} m)`);
        // (3)
        for (const st of p.stairs) { if (st.kind !== 'escada') continue; const a = lvOf(st.lv0), b2 = lvOf(st.lv1), A = b2.area, r = st.r, [du, dv] = st.dir; let open = 0;
          for (let k = 0; k < 40; k++) { const f = (k + 0.5) / 40, y = a.y + (b2.y - a.y) * f;
            const x = du ? (du > 0 ? r[0] + (r[2] - r[0]) * f : r[2] - (r[2] - r[0]) * f) : (r[0] + r[2]) / 2, z = dv ? (dv > 0 ? r[1] + (r[3] - r[1]) * f : r[3] - (r[3] - r[1]) * f) : (r[1] + r[3]) / 2;
            if (x > A[0] && x < A[2] && z > A[1] && z < A[3] && b2.y - y < 2.05 && !(st.hole && x >= st.hole[0] - 1e-6 && x <= st.hole[2] + 1e-6 && z >= st.hole[1] - 1e-6 && z <= st.hole[3] + 1e-6)) open++; }
          if (open) out.push(`${tag}: o lance ${st.id} (${st.lv0}→${st.lv1}) debaixo do piso de cima sem buraco em ${open} de 40 pontos`); }
        // (4) (5) (6)
        for (const l of p.levels) { const A = l.area, k4 = cells(l.lv, (x, z) => x < A[0] - 0.01 || x > A[2] + 0.01 || z < A[1] - 0.01 || z > A[3] + 0.01); if (k4) out.push(`${tag}: ${k4} casinhas de chão do piso ${l.lv} fora da área dele`); }
        const k5 = cells(2, (x, z, c) => inStone(c[0], c[1])); if (k5) out.push(`${tag}: ${k5} casinhas de chão do piso das fileiras na pedra da fachada`);
        // (no wall of no length: the proofs' rays past the walls of its storey all meet it — the box's back had one, T-491)
        const nil = p.walls.filter(w => Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) < 0.02); if (nil.length) out.push(`${tag}: ${nil.length} paredes sem comprimento (a ${nil[0].id}, piso ${nil[0].lv})`);
        const k6 = cells(0, (x, z, c) => O.cages.some(cg => cg.walls.some(q => c[0] > q[0] + 0.01 && c[0] < q[2] - 0.01 && c[1] > q[1] + 0.01 && c[1] < q[3] - 0.01))); if (k6) out.push(`${tag}: ${k6} casinhas de chão na pedra das jaulas`);
        if (s === 'S') said.push(`n ${n}: ${nRing} paredes em volta da areia, a ${(dev * 100).toFixed(1)} cm do polígono do 3D no máximo; os lances do pódio com o poço aberto; o chão de cada piso na área dele, nenhum na pedra da fachada (${l2.y} m) nem na das ${O.cages.length} jaulas`);
      }
      if (dev > 0.008) out.push(`n ${n}: as paredes em volta da areia a ${(dev * 100).toFixed(1)} cm do polígono do 3D (L-599)`);
    }
    ok('A11 os pisos da planta do Coliseu contra a forma: as paredes da areia no polígono do 3D, nenhuma parede do subsolo pela areia acima, os lances do pódio abertos, o chão na área do seu piso e fora da pedra da fachada e das jaulas, as fileiras até a fachada', !out.length, out.slice(0, 4).join(' · ') || said.join(' · '));
  }
}
// (who is given a place in a building of a people — In.places, freePlace, the body's «lugar» —: the table of its plan's places,
// made once a record; in a process of its own with a deadline, so that a table that never ends fails the proof instead of
// hanging it → { ok, dt — the process's own time making it: on a busy machine the clock's stretched the Colosseum's from 200 to
// 787 ms —, wall, spots, free: { use: a place free } } | { err })
const stepOf = (type, n) => (G.Escala.steps(type).find(s => s.n === n) || {}).id;
function placesOf(style, n, uses, type) {
  const path = require('path'), cp = require('child_process'); type = type || 'maravilha';
  const code = `const M = require(${JSON.stringify(path.join(__dirname, 'nodemundo.js'))}); const G = M.load({}); const In = G.Interiors; const ms = () => Number(process.hrtime.bigint()) / 1e6;
    G.S = { villagers: new Map(), buildings: new Map(), dead: new Map(), settlements: new Map(), clock: 100, day: 3, time: 0.4, avatar: null, nextId: 1000, history: [], fire: new Float32Array(G.N * G.N) };
    const b = { id: 71021, type: ${JSON.stringify(type)}, style: ${JSON.stringify(style)}, x: 8, y: 8, w: ${n}, h: ${n}, esc: ${JSON.stringify(stepOf(type, n))}, built: true }; b.ip = ${JSON.stringify(rec(type, style, famOf(type), 'S', n))}; G.S.buildings.set(b.id, b);
    const p = In.plan(b); const t0 = ms(), c0 = process.cpuUsage(); const t = In.table(b); const c1 = process.cpuUsage(c0), wall = ms() - t0, dt = (c1.user + c1.system) / 1000; const free = {}; for (const u of ${JSON.stringify(uses)}) free[u] = !!In.freePlace(b, u);
    console.log(JSON.stringify({ ok: !!(p && p.ok && t), dt, wall, free, spots: t ? t.spots.length : 0 })); process.exit(0);`;
  const t0 = ms(); const r = cp.spawnSync(process.execPath, ['-e', code], { cwd: __dirname, timeout: 30000, encoding: 'utf8' }); const wall = ms() - t0;
  let o = null; try { o = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch (e) { o = null; }
  if (!o) return { err: r.signal ? `o repartidor de lugares não terminou em ${(wall / 1000).toFixed(0)} s (interiors.js, makeTable)` : `o processo da prova falhou: ${(r.stderr || '').slice(0, 160)}` };
  return o;
}
// (a building's plan on the blank state — by its form —, its street on the side s: { b, p, dt — the time of making it })
const famOf = type => (type === 'monument' ? 'forma.monumento' : 'forma.' + type);
function planOf(type, style, n, s, id) {
  const b = { id, type, style, x: 8, y: 8, w: n, h: n, built: true }; b.ip = rec(type, style, famOf(type), s, n);
  const [p, dt] = cpuMs(() => In.makeFam(b, b.ip, famOf(type))); return { b, p, dt };
}
const wonderPlan = (style, n, s, id) => planOf('maravilha', style, n, s, id);
// (the places of a use a plan's marks have that the body takes — on the storey lv, when given)
const marksOk = (p, use, lv) => (p.marks || []).filter(q => q.use === use && (lv === undefined || q.lv === lv)).flatMap(q => q.pts).filter(q => q.ok).length;
// (a room of a plan made — its rectangle the grid's — with a cell the walk from the door reaches)
const roomReached = (p, m) => { const R = p.reach[m.lv], n = p.grid.n; if (!R) return false;
  for (let z = Math.max(0, Math.floor(m.r[1] / CS)); z <= Math.min(n - 1, Math.floor(m.r[3] / CS)); z++) for (let x = Math.max(0, Math.floor(m.r[0] / CS)); x <= Math.min(n - 1, Math.floor(m.r[2] / CS)); x++) if (R[z * n + x]) return true; return false; };
// (the half width of a form's far figure at a height y, about its axis u = cu: of its masses there, the widest)
function massHalf(ms0, cu, y) {
  let w = 0;
  for (const m of ms0) {
    if (m.k === 'piramide') { if (y >= m.y0 && y <= m.y1) w = Math.max(w, m.e * (1 - (y - m.y0) / (m.y1 - m.y0))); }
    else if (m.k === 'box' && !m.ralo && y >= m.y0 && y <= m.y1) w = Math.max(w, Math.abs(m.r[0] - cu), Math.abs(m.r[2] - cu));
  }
  return w;
}

// =========================================================================================== C — the pyramids
function testeC() {
  blank();
  // ---------------------------------------------------------------- C1 the forms
  {
    const out = [], said = [];
    for (const n of SIZES) {
      // ---- the Great Pyramid
      const F = Fo.of('maravilha', 'egipcio', n), A = F && F.amphi && F.amphi.piramide; const pyr = F && F.els.find(e => e.k === 'piramide' && !e.oculto);
      if (!A || !pyr) { out.push(`egípcia n ${n}: sem a forma`); continue; }
      if (Fo.of('maravilha', 'egipcio', n) !== F) out.push(`egípcia n ${n}: a forma não é a mesma para todo prédio do degrau`);
      if (F.L !== n * 4 || F.L < 40) out.push(`egípcia n ${n}: o lote de ${F.L} m`);
      // (smooth — one pyramid, no terraces —, its faces at the Great Pyramid's slope, its base)
      const H = pyr.y1 - pyr.y0, slope = Math.atan2(H, pyr.e) * 180 / Math.PI;
      if (slope < 50 || slope > 54 || 2 * pyr.e < 36 || F.els.some(e => e.k === 'escalonada')) out.push(`egípcia n ${n}: as faces a ${slope.toFixed(2)}°, a base de ${(2 * pyr.e).toFixed(1)} m`);
      // (the way in: open through the face — the corridor's mouth, as wide —, a public door's height; the door of the form there)
      const en = pyr.entrada; const dr = F.door;
      if (!en || en.w < 1.2 || en.y1 - en.y0 < 2.2 || Math.abs(en.u - A.cu) > 1e-6 || Math.abs(en.w - 2 * A.cw) > 1e-6 || !dr || dr.sealed || dr.y1 - dr.y0 < 2.2) out.push(`egípcia n ${n}: a entrada na face ${en ? `${en.w} × ${(en.y1 - en.y0).toFixed(2)} m` : 'nenhuma'}, a porta da forma ${dr ? `${dr.w} × ${(dr.y1 - dr.y0).toFixed(2)} m${dr.sealed ? ' lacrada' : ''}` : 'nenhuma'}`);
      // (what is inside the mass — the corridor, the gallery, the landing, the chamber —: hidden, each piece half a metre inside the
      // faces at least; the corridor's pieces from their back end — their mouth leaves the face: its portal)
      const inner = F.els.filter(e => e.oculto), half = y => pyr.e * (1 - (Math.max(y, pyr.y0) - pyr.y0) / H); let worst = 9, at = '';
      for (const e of inner) { if (e.k !== 'bloco') continue; const mouth = e.r[3] >= A.face - 1e-6;
        for (const u of [e.r[0], e.r[2]]) for (const v of (mouth ? [e.r[1]] : [e.r[1], e.r[3]])) for (const y of [e.y0, e.y1]) { const m = half(y) - Math.max(Math.abs(u - pyr.c[0]), Math.abs(v - pyr.c[1])); if (m < worst) { worst = m; at = `(${u.toFixed(1)}, ${v.toFixed(1)}, ${y.toFixed(1)})`; } } }
      if (inner.length < 12 || worst < 0.5) out.push(`egípcia n ${n}: ${inner.length} peças ocultas, a mais rasa a ${worst.toFixed(2)} m da face em ${at}`);
      // (the gallery's steps: each a body's, up to the chamber's floor, the flight walked — 45° at most)
      const st = inner.filter(e => e.degrau).sort((a, b) => a.y1 - b.y1); let rmax = 0, prev = A.y0; for (const e of st) { rmax = Math.max(rmax, e.y1 - prev); prev = e.y1; }
      const gal = Math.atan2(A.yK - A.y0, A.gallery.run) * 180 / Math.PI;
      if (st.length < 10 || rmax > In.BODY.step + 1e-6 || Math.abs(prev - A.yK) > 1e-6 || gal > 45 + 1e-6) out.push(`egípcia n ${n}: a galeria de ${st.length} degraus de ${rmax.toFixed(2)} m a ${gal.toFixed(1)}°, até ${prev.toFixed(2)} m (a câmara a ${A.yK} m)`);
      // (the chamber: its size, its door a public door's height, the sarcophagus in it)
      const K = A.chamber, kw = K[2] - K[0], kd = K[3] - K[1], dw = Math.round((A.doorK[1] - A.doorK[0]) * 100) / 100, dh = A.doorK[4], S0 = A.sarco;
      if (kw < 5 || kd < 3.5 || dh < 2.2 || dw < 1.0 || !(S0[0] > K[0] && S0[2] < K[2] && S0[1] > K[1] && S0[3] < K[3])) out.push(`egípcia n ${n}: a câmara de ${kw} × ${kd} m, a porta de ${dw} × ${dh} m`);
      // (the temple at its foot where the lot leaves room for it — the colossal's —: its court, its pillars, its altar)
      const T = A.temple, pil = F.els.filter(e => e.k === 'colunata').reduce((s, e) => s + e.pts.length, 0);
      if (n >= 13 && (!T || !T.altar || pil < 8)) out.push(`egípcia n ${n}: sem o templo do pé (${pil} pilares)`);
      said.push(`egípcia n ${n}: lote ${F.L} m, a base de ${(2 * pyr.e).toFixed(0)} m e ${H.toFixed(2)} m de alto, as faces a ${slope.toFixed(2)}°, lisa; a entrada de ${en.w} × ${(en.y1 - en.y0).toFixed(1)} m, o corredor de ${(A.face - A.vC).toFixed(1)} m, a galeria de ${st.length} degraus de ${rmax.toFixed(2)} m (${gal.toFixed(1)}°), a câmara de ${kw} × ${kd} m a ${A.yK} m (a porta de ${dw} × ${dh} m); ${inner.length} peças ocultas, a mais rasa a ${worst.toFixed(2)} m da face; ${T ? `o templo do pé com ${pil} pilares` : 'sem lugar para o templo do pé'}`);
      // ---- the Templo Mayor
      const F2 = Fo.of('maravilha', 'asteca', n), B = F2 && F2.amphi && F2.amphi.mayor;
      if (!B) { out.push(`asteca n ${n}: sem a forma`); continue; }
      if (Fo.of('maravilha', 'asteca', n) !== F2) out.push(`asteca n ${n}: a forma não é a mesma para todo prédio do degrau`);
      if (F2.L !== n * 4 || F2.L < 40) out.push(`asteca n ${n}: o lote de ${F2.L} m`);
      // (four terraces at least, each narrower than the one under it, on it)
      const N = (F2.els.find(e => e.k === 'escalonada') || { niveis: [] }).niveis;
      const stacked = N.every((q, k) => !k || (q[0] < N[k - 1][0] - 0.5 && Math.abs(q[1] - N[k - 1][2]) < 1e-6));
      if (N.length < 4 || !stacked || F2.els.some(e => e.k === 'piramide')) out.push(`asteca n ${n}: ${N.length} terraços${stacked ? '' : ' fora de ordem'}`);
      // (the double stair — its two lanes, the ridge between them, the ramps at its sides —, from the square to the top's front
      // edge, each step a body's)
      const es = F2.els.find(e => e.k === 'escada'), tr = es ? Fo.flight(es) : []; let er = 0, ep = es ? es.a[2] : 0; for (const q of tr) { er = Math.max(er, q.y1 - ep); ep = q.y1; }
      const lane = es && es.divisor ? (es.w - es.divisor.w) / 2 : 0, deg = es ? Math.atan2(es.b[2] - es.a[2], es.a[1] - es.b[1]) * 180 / Math.PI : 0;
      if (!es || !es.divisor || !es.alfarda || lane < 1.2 || er > In.BODY.step + 1e-6 || Math.abs(es.b[2] - B.H) > 1e-6 || Math.abs(es.b[1] - B.top[3]) > 1e-6 || es.a[2] > 0.1) out.push(`asteca n ${n}: a escada ${es ? `de ${es.w} m (pistas de ${lane.toFixed(2)} m), degraus de ${er.toFixed(2)} m, de ${es.a[2]} a ${es.b[2]} m` : 'nenhuma'}`);
      // (the two shrines on the top, each its band — two colours —, its door to the front a public door's height; the braziers)
      const sh = F2.els.filter(e => e.k === 'bloco' && Math.abs(e.y0 - B.H) < 1e-6 && e.y1 - e.y0 >= 5), doors = F2.els.filter(e => e.k === 'porta' && e.na === 'frente' && Math.abs(e.y0 - B.H) < 1e-6);
      const bands = new Set(F2.els.filter(e => e.k === 'faixa' && e.y0 > B.H).map(e => e.cor)), br = Fo.uses(F2).filter(u => u.uso === 'acender' && u.pe);
      if (sh.length !== 2 || doors.length !== 2 || doors.some(d => d.y1 - d.y0 < 2.2 || d.w < 1.2) || bands.size !== 2 || br.length !== 2) out.push(`asteca n ${n}: ${sh.length} santuários, ${doors.length} portas, ${bands.size} cores, ${br.length} braseiros no alto`);
      // (the parapet round the top: 0.9 m on its edges, open where the stair comes up)
      const Tp = B.top, par = F2.els.filter(e => e.k === 'bloco' && Math.abs(e.y0 - B.H) < 1e-6 && Math.abs(e.y1 - e.y0 - 0.9) < 1e-6 && Math.min(e.r[2] - e.r[0], e.r[3] - e.r[1]) <= B.pt + 1e-6);
      const per = 2 * (Tp[2] - Tp[0] + Tp[3] - Tp[1]), len = par.reduce((s, e) => s + Math.max(e.r[2] - e.r[0], e.r[3] - e.r[1]), 0);
      const gap = !par.some(e => e.r[3] > Tp[3] - B.pt - 1e-6 && e.r[0] < B.stair.u + B.stair.w / 2 - 1e-6 && e.r[2] > B.stair.u - B.stair.w / 2 + 1e-6);
      if (len < per - B.stair.w - 1 || !gap) out.push(`asteca n ${n}: o parapeito de ${len.toFixed(1)} m em volta do alto de ${per.toFixed(1)} m${gap ? '' : ', fechado diante da escada'}`);
      said.push(`asteca n ${n}: lote ${F2.L} m, ${N.length} terraços de ${(2 * N[0][0]).toFixed(0)} a ${(2 * N[N.length - 1][0]).toFixed(0)} m e ${B.H} m de alto; a escada dupla de ${es.w} m (duas pistas de ${lane.toFixed(2)} m e a crista), ${tr.length} degraus de ${er.toFixed(2)} m a ${deg.toFixed(1)}°; os dois santuários com as portas de ${doors[0].w} × ${(doors[0].y1 - doors[0].y0).toFixed(1)} m, os dois braseiros; o parapeito de 0,9 m, ${len.toFixed(1)} m em volta do alto`);
      // ---- the two masses from far off: the smooth pyramid, its top a point; the terraces, each one's top flat, the shrines on
      // the last (the half width at each share of the height, a share of the foot's)
      const mE = Fo.mass(F), mA = Fo.mass(F2); const prof = (m, cu, y0, y1) => [0.25, 0.5, 0.75, 0.95].map(f => massHalf(m, cu, y0 + f * (y1 - y0)) / (massHalf(m, cu, y0 + 0.01) || 1));
      const pE = prof(mE, A.cu, pyr.y0, pyr.y1), pA = prof(mA, B.cu, 0, B.H); const diff = Math.max(...pE.map((q, k) => Math.abs(q - pA[k])));
      if (!mE.some(m => m.k === 'piramide') || mA.some(m => m.k === 'piramide') || diff < 0.3) out.push(`n ${n}: as duas massas de longe parecidas (as meias larguras ${pE.map(q => q.toFixed(2)).join('/')} e ${pA.map(q => q.toFixed(2)).join('/')})`);
      said.push(`de longe (n ${n}): a meia largura a 25/50/75/95% da altura ${pE.map(q => q.toFixed(2)).join('/')} da do pé na egípcia, ${pA.map(q => q.toFixed(2)).join('/')} na asteca`);
    }
    ok('C1 as formas das pirâmides: a Grande Pirâmide lisa (50–54°, base ≥ 36 m, a entrada, o corredor, a galeria, a câmara), o Templo Mayor (≥ 4 terraços, a escada dupla, os santuários, o parapeito), as massas', !out.length, out.slice(0, 4).join(' · ') || said.join(' · '));
  }
  // ---------------------------------------------------------------- C2 the plans
  const plans = {}; let nid = 62001;
  {
    const out = [], said = [], times = [];
    const ROOMS = { egipcio: ['esplanada', 'corredor', 'patamar', 'camara'], asteca: ['praca', 'plataforma'] };
    const USES = { egipcio: { ofertar: 2, rezar: 6 }, asteca: { acender: 2, oficiar: 2, topo: 2, assistir: 6 } };
    const TOP = { egipcio: { ofertar: 1, rezar: 2 }, asteca: { acender: 2, oficiar: 2 } };
    for (const style of ['egipcio', 'asteca']) for (const n of SIZES) for (const s of SIDES) {
      const { b, p, dt } = wonderPlan(style, n, s, (nid += 37)); times.push(dt); plans[style + n + s] = { b, p };
      if (!p || !p.ok) { out.push(`${style} n ${n}/${s}: não se arma (${p ? p.errs.slice(0, 2).join('; ') : '—'})`); continue; }
      G.S.buildings.set(b.id, b);
      const rep = In.report(b, p, { rec: b.ip }), fal = rep.filter(q => q.k === 'FALHA'), esc = rep.filter(q => q.k === 'ESCOLHA'); if (fal.length) out.push(`${style} n ${n}/${s}: ${fal.slice(0, 2).map(q => q.what).join('; ')}`);
      const lv = p.levels.map(l => l.lv).join(','); if (lv !== '0,1') out.push(`${style} n ${n}/${s}: os pisos ${lv}`);
      const fl = p.stairs.filter(q => q.kind !== 'degraus'); if (fl.length !== 1 || fl[0].lv0 !== 0 || fl[0].lv1 !== 1) out.push(`${style} n ${n}/${s}: os lances ${fl.map(q => `${q.lv0}→${q.lv1}`).join(' ') || 'nenhum'}`);
      for (const fn of ROOMS[style]) { const rs = p.rooms.filter(m => m.fn === fn); if (!rs.length || !rs.every(m => roomReached(p, m))) out.push(`${style} n ${n}/${s}: o cômodo ${fn} ${rs.length ? 'que a porta não alcança' : 'ausente'}`); }
      for (const use in USES[style]) if (marksOk(p, use) < USES[style][use]) out.push(`${style} n ${n}/${s}: ${marksOk(p, use)} lugares de ${use} (${USES[style][use]} ao menos)`);
      for (const use in TOP[style]) if (marksOk(p, use, 1) < TOP[style][use]) out.push(`${style} n ${n}/${s}: ${marksOk(p, use, 1)} lugares de ${use} no piso de cima`);
      if (s === 'S') said.push(`${style} n ${n}: ${p.rooms.length} cômodos, o lance de ${fl[0] ? `${fl[0].slope}° (${fl[0].cls})` : '—'}, ${Object.keys(USES[style]).map(u => `${marksOk(p, u)} de ${u}`).join(', ')}${esc.length ? ` (escolha: ${esc.map(q => q.what).join('; ')})` : ''}`);
    }
    const tmax = Math.max(...times), tmed = times.slice().sort((a, b) => a - b)[times.length >> 1];
    if (tmax > 400) out.push(`a planta levou ${tmax.toFixed(0)} ms (o alvo: 400)`);
    ok('C2 as plantas das pirâmides: nos quatro lados e nos dois tamanhos, sem falha, os dois pisos e o lance, os cômodos alcançados, os lugares do rito, o tempo', !out.length, out.slice(0, 4).join(' · ') || `${said.join(' · ')}; o tempo: a mediana ${tmed.toFixed(0)} ms, a maior ${tmax.toFixed(0)} (alvo 400)`);
  }
  // ---------------------------------------------------------------- C3 the form × the plan
  {
    const out = [], said = [];
    const cellsOf = (p, lv, fn) => { const N = p.grid.n, R = p.reach[lv], o = []; for (let k = 0; k < N * N; k++) if (R && R[k]) o.push([(k % N + 0.5) * CS, (Math.floor(k / N) + 0.5) * CS, k]); return o; };
    const inR = (r, x, z, d) => x > r[0] - (d || 0) && x < r[2] + (d || 0) && z > r[1] - (d || 0) && z < r[3] + (d || 0);
    // (the form's solid pieces on a floor at y — a wall, an altar, a pillar, a shrine, a brazier's stand —: what the walk keeps out of)
    const stone = (F, y) => F.els.filter(e => !e.oculto && ((e.k === 'bloco' && !e.piso && e.y0 <= y + 0.1 && e.y1 > y + 0.3) || e.k === 'colunata'));
    const inStone = (S, x, z) => S.some(e => (e.k === 'colunata' ? e.pts.some(q => Math.hypot(x - q[0], z - q[1]) < e.r) : inR(e.r, x, z)));
    for (const n of SIZES) {
      // ---- the Great Pyramid: on the ground the slab out of the pyramid's foot and the corridor in it, and the gallery's flight;
      // up the gallery the landing and the chamber but the sarcophagus; each storey at the form's height
      { const { p } = plans['egipcio' + n + 'S']; if (!p || !p.ok) continue; const F = Fo.of('maravilha', 'egipcio', n), A = F.amphi.piramide; const { cu, cv, e, cw } = A;
        const allow = { 0: (x, z) => Math.max(Math.abs(x - cu), Math.abs(z - cv)) > e || inR([cu - cw, A.vC, cu + cw, A.face], x, z) || inR(A.gallery.r, x, z),
          1: (x, z) => (inR(A.landing, x, z) || inR(A.chamber, x, z) || inR([A.doorK[0], A.doorK[2], A.doorK[1], A.doorK[3]], x, z)) && !inR(A.sarco, x, z) };
        const S0 = stone(F, A.y0), S1 = stone(F, A.yK).filter(q => q.oculto);
        for (const lv of [0, 1]) { let bad = 0, first = ''; for (const [x, z] of cellsOf(p, lv)) if (!allow[lv](x, z) || (lv === 0 && inStone(S0, x, z))) { bad++; if (!first) first = `(${x.toFixed(2)}, ${z.toFixed(2)})`; }
          if (bad) out.push(`egípcia n ${n}: ${bad} casinhas do piso ${lv} andadas fora do chão da forma (a primeira ${first})`); }
        const y0 = p.levels.find(l => l.lv === 0).y, y1 = p.levels.find(l => l.lv === 1).y; if (Math.abs(y0 - A.y0) > 1e-6 || Math.abs(y1 - A.yK) > 1e-6) out.push(`egípcia n ${n}: os pisos da planta a ${y0} e ${y1} m, os da forma a ${A.y0} e ${A.yK} m`);
        // (the corridor and the chamber walked whole, a body's half off their walls — the chamber but round the sarcophagus)
        let ic = 0, rc = 0, ik = 0, rk = 0; const N = p.grid.n;
        for (let k = 0; k < N * N; k++) { const x = (k % N + 0.5) * CS, z = (Math.floor(k / N) + 0.5) * CS;
          if (inR([cu - cw + 0.45, A.vC + 0.45, cu + cw - 0.45, A.face - 0.45], x, z)) { ic++; if (p.reach[0][k]) rc++; }
          if (inR([A.chamber[0] + 0.45, A.chamber[1] + 0.45, A.chamber[2] - 0.45, A.chamber[3] - 0.45], x, z) && !inR(A.sarco, x, z, 0.45)) { ik++; if (p.reach[1][k]) rk++; } }
        if (rc < ic || rk < ik) out.push(`egípcia n ${n}: o corredor andado em ${rc} de ${ic} casinhas, a câmara em ${rk} de ${ik}`);
        said.push(`egípcia n ${n}: andadas ${cellsOf(p, 0).length} / ${cellsOf(p, 1).length} casinhas, o corredor ${rc}/${ic}, a câmara ${rk}/${ik}, os pisos a ${y0} e ${y1} m`); }
      // ---- the Templo Mayor: on the ground the square out of the base and the stair; on the top, within its edge, out of the
      // shrines and the braziers' stands; each storey at the form's height
      { const { p } = plans['asteca' + n + 'S']; if (!p || !p.ok) continue; const F = Fo.of('maravilha', 'asteca', n), B = F.amphi.mayor; const { cu, cv, e0 } = B; const T = B.top, sw = B.stair.w;
        const S1 = stone(F, B.H);
        const allow = { 0: (x, z) => Math.max(Math.abs(x - cu), Math.abs(z - cv)) > e0 || inR([cu - sw / 2, B.stair.top, cu + sw / 2, B.stair.foot], x, z),
          1: (x, z) => inR(T, x, z) && !inStone(S1, x, z) };
        for (const lv of [0, 1]) { let bad = 0, first = ''; for (const [x, z] of cellsOf(p, lv)) if (!allow[lv](x, z)) { bad++; if (!first) first = `(${x.toFixed(2)}, ${z.toFixed(2)})`; }
          if (bad) out.push(`asteca n ${n}: ${bad} casinhas do piso ${lv} andadas fora do chão da forma (a primeira ${first})`); }
        const gy = F.els.find(e => e.k === 'bloco' && e.piso).y1, y0 = p.levels.find(l => l.lv === 0).y, y1 = p.levels.find(l => l.lv === 1).y;
        if (Math.abs(y0 - gy) > 1e-6 || Math.abs(y1 - B.H) > 1e-6) out.push(`asteca n ${n}: os pisos da planta a ${y0} e ${y1} m, os da forma a ${gy} e ${B.H} m`);
        // (the platform before the shrines walked whole, a body's half in from the parapet and off the stands)
        const bb = B.shrines.map(q => q.r).reduce((a, q) => [Math.min(a[0], q[0]), Math.min(a[1], q[1]), Math.max(a[2], q[2]), Math.max(a[3], q[3])]);
        let ip = 0, rp = 0; const N = p.grid.n;
        for (let k = 0; k < N * N; k++) { const x = (k % N + 0.5) * CS, z = (Math.floor(k / N) + 0.5) * CS;
          if (inR([T[0] + B.pt + 0.45, bb[3] + 0.45, T[2] - B.pt - 0.45, T[3] - B.pt - 0.45], x, z) && !S1.some(q => inR(q.r, x, z, 0.45))) { ip++; if (p.reach[1][k]) rp++; } }
        if (rp < ip) out.push(`asteca n ${n}: a plataforma andada em ${rp} de ${ip} casinhas`);
        said.push(`asteca n ${n}: andadas ${cellsOf(p, 0).length} / ${cellsOf(p, 1).length} casinhas, a plataforma ${rp}/${ip}, os pisos a ${y0} e ${y1} m`); }
    }
    ok('C3 a forma × a planta das pirâmides: só se anda onde a forma tem chão e na altura dela, o corredor, a câmara e a plataforma inteiros', !out.length, out.slice(0, 4).join(' · ') || said.join(' · '));
  }
  // ---------------------------------------------------------------- C4 the feet, on a blank world
  {
    const S = G.newState(7); S.H.fill(4); S.type.fill(G.T.GRASS); if (S.biome) S.biome.fill(0); S.clock = 0; S.day = 30; S.time = 0.3; G.S = S; G.newWorld();
    const TL = Sp.TILE; const out = [], said = [];
    for (const style of ['egipcio', 'asteca']) for (const n of SIZES) {
      const def = G.BDEF.maravilha; const b = { id: 92001 + n + (style === 'asteca' ? 100 : 0), type: 'maravilha', style, esc: n === 10 ? 'maravilha' : 'colossal', x: 12, y: 12, w: n, h: n, built: true, progress: 1, hp: def.hp || 100, maxHp: def.hp || 100, v: 0, set: 0, blocks: true, ip: null };
      for (const o of [...S.buildings.values()]) { for (let yy = o.y; yy < o.y + o.h; yy++) for (let xx = o.x; xx < o.x + o.w; xx++) S.occ[yy * G.N + xx] = 0; S.buildings.delete(o.id); }
      S.buildings.set(b.id, b); for (let yy = b.y; yy < b.y + b.h; yy++) for (let xx = b.x; xx < b.x + b.w; xx++) S.occ[yy * G.N + xx] = b.id;
      b.ip = In.newRecord(b, { t: 'maravilha', c: style, e: 3, k: 'ae', cl: 't', fl: 0, d: 1, w: 1, pw: 0, s: 'S', o: (1 << n) - 1, n });
      const p = Sp.planNow(b); if (!p || !p.ok) { out.push(`${style} n ${n}: sem planta (${p ? p.errs.slice(0, 2).join('; ') : '—'})`); continue; }
      const F = Fo.of('maravilha', style, n), L = n * TL, pl = Sp.plinth(b); let worst = 0, at = '', step = 0, shut = 0, shutAt = '', pts = 0, flight = 0;
      // (the legs, each on its storey, the floor the form has under each point: on a flight, the top of the tread under it — the
      // feet on each of them, as the form draws them — the Templo Mayor's double stair, the Great Pyramid's gallery: their plans
      // have the form's treads —, but within a hair of an edge, where the plan's are rounded to the centimetre: L-665)
      let legs, floor, treads;
      if (style === 'egipcio') { const A = F.amphi.piramide, cu = A.cu, K = A.chamber, sv = A.sarco[3] + 0.55, fv = A.face + (A.temple ? 0.75 : 1.0), al = A.temple && A.temple.altar;
        treads = F.els.filter(e => e.oculto && e.degrau).map(e => ({ r: e.r, y1: e.y1 }));
        // (from the street — on the colossal's lot through the temple's gate and round its altar — along the face's foot and in)
        const court = al ? [[cu, al[3] + 0.6], [cu - 2.0, al[3] + 0.6], [cu - 2.0, al[1] - 0.6], [cu, al[1] - 0.6]] : [];
        legs = [[0, [[cu, L + 0.8], ...court, [cu, fv], [cu - 6, fv], [cu, fv], [cu, A.vC + 0.3]]], [0, [[cu, A.vC - 0.05], [cu, A.gallery.r[1] + 0.05]], 1],
          [1, [[cu, A.gallery.r[1] - 0.3], [cu, sv], [K[0] + 0.5, sv], [K[0] + 0.5, K[1] + 0.5]]]];
        floor = lv => (lv === 0 ? A.y0 : A.yK); }
      else { const B = F.amphi.mayor, cu = B.cu, cv = B.cv, T = B.top, e0 = B.e0, pt = B.pt; const bb = B.shrines.map(q => q.r).reduce((a, q) => [Math.min(a[0], q[0]), Math.min(a[1], q[1]), Math.max(a[2], q[2]), Math.max(a[3], q[3])]);
        treads = Fo.flight(F.els.find(e => e.k === 'escada')); const lit = Fo.uses(F).filter(u => u.uso === 'acender' && u.pe).sort((a, b) => a.c[0] - b.c[0]);
        // (on the top: before the shrines, to the left brazier's place before its stand, round the shrines behind the parapet, to
        // the right one's, before each shrine's door)
        const vl = lit[0].pe[3] + 0.5, fr = bb[3] + 0.6, l0 = T[0] + pt + 0.4, l1 = T[2] - pt - 0.4, back = T[1] + pt + 0.4, doors = B.shrines.map(q => q.door);
        legs = [[0, [[cu - 1.5, L + 0.8], [cu - 1.5, B.stair.foot + 0.3]]], [0, [[cu + B.stair.w / 2 + 1.0, L - 0.8], [cu + e0 + 2.0, L - 0.8], [cu + e0 + 2.0, cv - e0 - 2.0], [cu - e0 - 2.0, cv - e0 - 2.0], [cu - e0 - 2.0, L - 0.8]]],
          [0, [[cu - 1.5, B.stair.foot - 0.05], [cu - 1.5, B.stair.top + 0.05]], 1],
          [1, [[cu - 1.5, T[3] - 0.35], [cu - 1.5, vl], [lit[0].c[0], vl], [l0, vl], [l0, back], [l1, back], [l1, vl], [lit[1].c[0], vl], [cu + 1.5, vl], [cu + 1.5, fr], [Math.max(...doors), fr], [Math.min(...doors), fr]]]];
        floor = lv => (lv === 0 ? F.els.find(e => e.k === 'bloco' && e.piso).y1 : B.H); }
      // (the top of the highest tread under a point — a hair either side along the flight: the plan's are rounded to the
      // centimetre, and at a tread's edge the next one's is the feet's, as W4's)
      const tread = (u, z) => { let y = null; for (const q of treads) if (u >= q.r[0] && u <= q.r[2] && z >= q.r[1] - 0.01 && z <= q.r[3] + 0.01 && (y === null || q.y1 > y)) y = q.y1; return y; };
      const rise = treads.length > 1 ? Math.abs(treads[1].y1 - treads[0].y1) : 0.3;
      for (const [lv, path, onFlight] of legs) { let prev = null;
        for (let k = 0; k < path.length - 1; k++) { const [u0, z0] = path[k], [u1, z1] = path[k + 1]; const len = Math.hypot(u1 - u0, z1 - z0), m = Math.max(1, Math.round(len / 0.02));
          for (let j = 0; j <= m; j++) { const u = u0 + (u1 - u0) * j / m, z = z0 + (z1 - z0) * j / m; const X = b.x * TL + u, Z = b.y * TL + z; const ins = Sp.indoor(X, Z, lv, b.id);
            const foot = ins ? ins.y : Math.max(Sp.footAt(X / TL, Z / TL), Sp.stepTop(X, Z)); pts++;
            if (ins && !ins.walk) { shut++; if (!shutAt) shutAt = `(${u.toFixed(2)}, ${z.toFixed(2)}) piso ${lv}`; }
            if (prev !== null) step = Math.max(step, Math.abs(foot - prev)); prev = foot;
            if (!ins || !ins.shell) continue; // (the street before the way in)
            if (onFlight) { const ty = tread(u, z); if (ty === null) continue; flight++; const d = foot - (pl.hi + ty + Sp.FLOOR_UP);
              const under = treads.some(q => Math.abs(z - q.r[1]) <= 0.011 || Math.abs(z - q.r[3]) <= 0.011) ? rise : 0;
              if ((d > 0.03 || d < -under - 0.03) && Math.abs(d) > Math.abs(worst)) { worst = d; at = `(${u.toFixed(2)}, ${z.toFixed(2)}) no lance`; } continue; }
            const d = foot - (pl.hi + floor(lv) + Sp.FLOOR_UP); if (Math.abs(d) > 0.03 && Math.abs(d) > Math.abs(worst)) { worst = d; at = `(${u.toFixed(2)}, ${z.toFixed(2)}) piso ${lv}`; } } } }
      if (worst || step > In.BODY.step + 0.01) out.push(`${style} n ${n}: os pés a ${worst.toFixed(2)} m da forma em ${at || '—'}, o maior degrau ${step.toFixed(2)} m`);
      if (shut) out.push(`${style} n ${n}: ${shut} pontos do caminho onde o corpo não passa (o primeiro ${shutAt})`);
      said.push(`${style} n ${n}: ${pts} pontos (${flight} no lance), o maior degrau ${step.toFixed(2)} m`);
    }
    ok('C4 os pés pelas pirâmides: da rua pela entrada e o corredor, a galeria, a câmara; pela praça, a escada dupla e o alto em volta dos santuários', !out.length, out.slice(0, 3).join(' · ') || said.join(' · '));
  }
  // ---------------------------------------------------------------- C5 the world: the god's hand in an Egyptian and an Aztec town
  // (each town by the game's rule, never by its name — handFor, T-505: Tebas, by its name, had no lot of 10 in the metrópole of
  // the generation 15 —, in the ready world that has a town of its people, the metrópole first: mundoDe, T-604)
  const WORLD = ['egipcio', 'asteca'];
  {
    const out = [], said = [];
    const bad = what => { const q = globalThis.QA.check().filter(x => x.sev <= 2 || x.sys === 'monumental' || x.sys === 'escala'); if (q.length) out.push(`${what}: ${q.slice(0, 2).map(x => `${x.sys} S${x.sev} ${x.msg.slice(0, 90)}`).join(' · ')}`); };
    const { grupos, sem } = porMundo(WORLD); for (const st of sem) out.push(`sem cidade ${st} em mundo pronto nenhum`);
    for (const [w, styles] of grupos) {
      M.pronto(w); bad('antes'); const built = [];
      for (const style of styles) {
        const hf = handFor(style, 'maravilha', 'maravilha'), set = hf.set;
        // (its people raises the wonder of its capital now, never the old one: the ladder's steps for it)
        const steps = hf.steps; if (steps.includes('antiga') || !steps.includes('maravilha')) out.push(`${set.name}: os degraus da maravilha ${steps.join(', ')}`);
        const b = hf.b; if (!b) { out.push(`a mão do deus não achou nem abriu lote de 10 casas para o povo ${style} (${set.name})`); continue; }
        const p = In.plan(b), F = Fo.of(b.type, b.style, b.w);
        if (b.w !== 10 || b.h !== 10 || b.esc !== 'maravilha' || !b.built || b.style !== style) out.push(`${set.name}: o prédio ${b.w}×${b.h} esc=${b.esc} ${b.style} pronto=${b.built}`);
        if (!F || F.L !== b.w * 4 || !p || !p.ok || In.nOf(b.ip) !== b.w) out.push(`${set.name}: o lote, a forma e a planta: ${b.w * 4} m, ${F ? F.L : '—'} m, ${p && p.ok ? In.nOf(b.ip) * 4 + ' m' : 'sem planta'}`);
        const fal = p && p.ok ? In.report(b, p, { world: true, sides: true }).filter(q => q.k === 'FALHA') : []; if (fal.length) out.push(`${set.name} no mundo: ${fal.map(q => q.what).join('; ')}`);
        built.push({ b, set, sig: p && p.sig, steps, gone: hf.gone });
      }
      bad('de pé'); M.viver(5); bad('vivendo');
      M.salvarCarregar(); for (const q of built) { const b2 = G.S.buildings.get(q.b.id); const p2 = b2 && In.plan(b2); if (!p2 || !p2.ok || p2.sig !== q.sig || b2.w !== 10 || b2.esc !== 'maravilha') out.push(`${q.set.name}: depois do save, outro prédio ou outra planta`); }
      bad('carregado');
      G.inSim++; try { for (const q of built) G.Village.damageBuilding(G.S.buildings.get(q.b.id), 1e6, 'quake'); } finally { G.inSim--; }
      for (const q of built) { const b3 = G.S.buildings.get(q.b.id); if (b3 && b3.type !== 'ruin') out.push(`${q.set.name}: o deus derrubou e ficou de pé`); }
      bad('derrubados'); M.viver(1); bad('as ruínas vivendo');
      for (const q of built) said.push(`${q.set.name}: #${q.b.id} ${q.b.w}×${q.b.h} casas a ${G.dist(q.b.x + q.b.w / 2, q.b.y + q.b.h / 2, q.set.cx, q.set.cy).toFixed(1)} casas do centro${goneTxt(q)} (os degraus ${q.steps.join(', ')})${ondeTxt(w, q.b.style)}`);
    }
    if (!M.limpo()) { const e = M.erros(); out.push(`erros: ${JSON.stringify(e.mod)} ${e.console.slice(0, 2).join(' | ')}`); }
    ok('C5 as pirâmides pela mão do deus numa cidade egípcia e numa asteca (a metrópole; cada cidade pela regra do jogo): de pé, vivendo, salvas e carregadas, derrubadas — o verificador limpo', !out.length, out.slice(0, 3).join(' · ') || `${said.join(' · ')}; vivas, salvas e carregadas (a mesma planta), derrubadas: o verificador limpo`);
  }
  // ---------------------------------------------------------------- C6 the checker
  // (each wonder in the world of its people's town, as in C5: the checker provoked there, and quiet again)
  {
    const out = [], got = {}, hit = [];
    const mine = () => globalThis.QA.check().filter(q => q.sys === 'monumental');
    for (const [w, styles] of porMundo(WORLD).grupos) {
      M.pronto(w); const here = {}; for (const style of styles) got[style] = here[style] = handFor(style, 'maravilha', 'maravilha').b;
      if (mine().length) out.push(`com as plantas inteiras (${w}): ${mine().map(q => q.msg.slice(0, 80)).join(' · ')}`);
      // (the king's chamber a metre off the form's; the top of the Templo Mayor with no priest before the shrines)
      const plan0 = In.plan;
      In.plan = x => { const p = plan0(x); if (!p) return p;
        if (x === here.egipcio) return Object.assign({}, p, { levels: p.levels.map(l => (l.lv === 1 ? Object.assign({}, l, { y: l.y + 1 }) : l)) });
        if (x === here.asteca) return Object.assign({}, p, { marks: (p.marks || []).filter(M2 => M2.use !== 'oficiar') });
        return p; };
      try { hit.push(...mine()); } finally { In.plan = plan0; }
      if (mine().length) out.push(`de volta (${w}), o verificador não calou`);
    }
    if (!got.egipcio || !got.asteca) out.push('sem as duas maravilhas');
    const k1 = hit.find(q => q.sev === 1 && q.msg.includes('câmara')), k2 = hit.find(q => q.sev === 2 && q.msg.includes('oficiar'));
    if (!k1) out.push('com a câmara noutra altura o verificador calou'); if (!k2) out.push('sem os lugares de oficiar o verificador calou');
    ok('C6 o verificador das pirâmides: pega a câmara noutra altura e o alto sem quem oficia, e cala quando elas voltam', !out.length, out.join(' · ') || `limpo; «${k1.msg.slice(0, 80)}»; «${k2.msg.slice(0, 80)}»; limpo de novo`);
  }
  // ---------------------------------------------------------------- C7 the places' table
  {
    const out = [], said = [];
    for (const [style, uses] of [['egipcio', ['rezar', 'ofertar']], ['asteca', ['oficiar', 'acender', 'assistir']]]) for (const n of SIZES) {
      const o = placesOf(style, n, uses);
      if (o.err) { out.push(`${style} n ${n}: ${o.err}`); continue; }
      const none = uses.filter(u => !o.free[u]); if (!o.ok || none.length) out.push(`${style} n ${n}: a tabela ${o.ok ? 'feita' : 'não feita'}${none.length ? `, sem lugar livre de ${none.join(', ')}` : ''}`);
      if (o.dt > 400) out.push(`${style} n ${n}: a tabela dos lugares levou ${o.dt.toFixed(0)} ms (o alvo: 400)`);
      said.push(`${style} n ${n}: ${o.spots} lugares em ${o.dt.toFixed(0)} ms`);
    }
    ok('C7 os lugares das pirâmides (In.places, a tabela da planta): feita a tempo, um lugar livre de cada uso do rito', !out.length, out.slice(0, 3).join(' · ') || said.join(' · '));
  }
}

// =========================================================================================== E — the theatres
const TSIZES = [6, 8, 10], TSTYLES = ['romano', 'grego', 'classico'];
// (a point in a piece of the form's rows — its radius within it, by the polygon of the 3D and the plan (G.Forma.ringEdge), its
// angle in its arc)
const inPiece = (e, x, z) => { const th = Math.atan2(z - e.c[1], x - e.c[0]), d = Math.hypot(x - e.c[0], z - e.c[1]) / Fo.ringEdge(1, th); return d >= e.fundo - 1e-6 && d <= e.aneis[0][0] + 1e-6 && angIn(th, e.arco[0], e.arco[1]); };
// (a point in a block of the form standing on a floor at y — from it up past a body's head —, its rect grown by e)
const inBlock = (F, x, z, y, e) => F.els.some(q => q.k === 'bloco' && !q.piso && !q.degrau && q.y0 <= y + 0.05 && q.y1 >= y + 2.0 && x > q.r[0] - e && x < q.r[2] + e && z > q.r[1] - e && z < q.r[3] + e);
function testeE() {
  blank();
  // ---------------------------------------------------------------- E1 the forms
  {
    const out = [], said = [];
    for (const st of TSTYLES) for (const n of TSIZES) {
      const F = Fo.of('teatro', st, n), A = F && F.amphi && F.amphi.teatro; const tag = `${st} n ${n}`;
      if (!A) { out.push(`${tag}: sem a forma`); continue; }
      if (Fo.of('teatro', st, n) !== F || F.L !== n * 4) out.push(`${tag}: o lote de ${F.L} m, ou outra forma para o mesmo degrau`);
      // (the cavea: the Roman's a half round on the orchestra's diameter, the Greek's more than half)
      const span = A.a1 - A.a0; if (st === 'romano' ? Math.abs(span - Math.PI) > 1e-3 || Math.abs(A.a0 - Math.PI) > 1e-3 : span < Math.PI + 0.3) out.push(`${tag}: a cávea de ${(span * 180 / Math.PI).toFixed(0)}°`);
      // (the rows: the body's seat; their levels — the walk round between them, twice the stairways above it —; the gallery at the top
      // and its parapet, 0.9 m; at each row's end a wall 0.9 m over it, each side)
      const pieces = F.els.filter(e => e.k === 'cavea' && e.escadas); let rmin = 9, rmax = 0, tmin = 9, tmax = 0;
      for (const e of pieces) { const Ar = e.aneis.slice().reverse(); let y0 = e.fundo === A.ri ? A.yq : A.yq + A.rs * A.lo, r0 = e.fundo;
        for (let k = 0; k < Ar.length; k++) { rmin = Math.min(rmin, Ar[k][1] - y0); rmax = Math.max(rmax, Ar[k][1] - y0); if (k < Ar.length - 1) { tmin = Math.min(tmin, Ar[k][0] - r0); tmax = Math.max(tmax, Ar[k][0] - r0); } y0 = Ar[k][1]; r0 = Ar[k][0]; } }
      if (rmin < 0.4 - 1e-6 || rmax > 0.45 + 1e-6 || tmin < 0.7 - 1e-6 || tmax > 0.8 + 1e-6) out.push(`${tag}: fileiras de ${rmin.toFixed(2)}–${rmax.toFixed(2)} × ${tmin.toFixed(2)}–${tmax.toFixed(2)} m`);
      const walk = pieces.length > 1 ? A.rW - (A.ri + A.tr * A.lo) : 0, gal = A.rG - (pieces.length > 1 ? A.rW + A.tr * A.up : A.ri + A.tr * A.lo);
      if ((n >= 8 && (pieces.length < 2 || walk < 1.2 - 1e-6 || pieces[1].escadas.a.length <= pieces[0].escadas.a.length)) || gal < 0.8) out.push(`${tag}: ${pieces.length} níveis, o passeio de ${walk.toFixed(2)} m, a galeria de ${gal.toFixed(2)} m`);
      const par = F.els.find(e => e.k === 'cavea' && !e.escadas && Math.abs(e.aneis[0][0] - A.R) < 1e-6), ends = F.els.filter(e => e.k === 'cavea' && !e.escadas && e !== par);
      // (the walls at the rows' ends: at each end of each row, 0.9 m over it, its whole depth — and of the plan's wall's width, 0.2
      // m: a wedge of the row's whole depth stood 1.28 cm off it, L-507 —: the most any of them stands off a strip of 0.2 m)
      let endBad = '', endDev = 0;
      for (const [r0, r1, y] of A.rows) for (const sd of [0, 1]) {
        const mine = ends.filter(e => Math.abs(e.aneis[0][1] - y - 0.9) < 1e-3 && Math.abs(e.arco[1 - sd] - (sd ? A.a1 : A.a0)) < 2e-3 && e.fundo >= r0 - 1e-3 && e.aneis[0][0] <= r1 + 1e-3).sort((p, q) => p.fundo - q.fundo);
        let at = r0; for (const e of mine) { if (Math.abs(e.fundo - at) > 2e-3) break; at = e.aneis[0][0]; const d = e.arco[1] - e.arco[0]; for (const r of [e.fundo, e.aneis[0][0]]) endDev = Math.max(endDev, Math.abs(r * Math.sin(d) - 0.2)); }
        if (Math.abs(at - r1) > 2e-3 && !endBad) endBad = `a fileira de ${r0} a ${r1} m: o muro da ponta só até ${at} m`;
      }
      if (!par || Math.abs(par.aneis[0][1] - A.top - 0.9) > 1e-3 || endBad || endDev > 0.006) out.push(`${tag}: o parapeito da galeria ${par ? 'de ' + (par.aneis[0][1] - A.top).toFixed(2) + ' m' : 'ausente'}; ${endBad || 'os muros nas pontas inteiros'}, a ${(endDev * 100).toFixed(2)} cm da largura da parede da planta (L-507)`);
      // (the orchestra: a hair over the floor — the plan's, L-494 —, its round clear of the rows; the Greek's acting floor ≥ 12 m on the
      // monumental)
      const orq = F.els.find(e => e.k === 'arena'); if (!orq || orq.y < A.yq || orq.y - A.yq > 0.015 || orq.r > A.ri - 0.4 || (st === 'grego' && n >= 10 && 2 * orq.r < 12)) out.push(`${tag}: a orquestra ${orq ? `de ${(2 * orq.r).toFixed(1)} m a ${(orq.y - A.yq).toFixed(3)} m do chão` : 'ausente'}`);
      // (the stage: the Roman's ≤ 1 m over the orchestra — a drop with no parapet —, ≥ 12 m wide on the monumental, its flights the
      // body's; the wall behind it over the rows' top, its three doors a public door's; the Greek's proskenion and its logeion)
      const dOk = A.doors.length === 3 && A.doors.every(([, dw, dh]) => dw >= 1.2 && dh >= 2.2), colsN = F.els.filter(e => e.k === 'colunata').reduce((s, e) => s + e.pts.length, 0);
      if (st === 'romano') { const tr = F.els.filter(e => e.degrau); let rr = 0; for (const q of tr) rr = Math.max(rr, q.y1 - (tr.filter(o => Math.abs(o.r[0] - q.r[0]) < 1e-6 && o.y1 < q.y1).reduce((a, o) => Math.max(a, o.y1), A.yq)));
        if (A.ys - A.yq > 1.0 + 1e-6 || (n >= 10 && A.w < 12) || rr > In.BODY.step + 1e-6 || A.flights.length !== 2 || A.ys + A.hf < A.top + 0.9 || !dOk || colsN < 6) out.push(`${tag}: o palco a ${(A.ys - A.yq).toFixed(2)} m, ${A.w} m de largura, degraus de ${rr.toFixed(2)} m, a frons a ${(A.ys + A.hf).toFixed(1)} m, ${colsN} colunas`); }
      else if (!dOk || colsN < 6 || !F.els.some(e => e.k === 'bloco' && Math.abs(e.r[1] - A.vP) < 1e-6 && Math.abs(e.r[3] - A.vS) < 1e-6 && e.y0 >= 2.2)) out.push(`${tag}: a skene com ${A.doors.length} portas, ${colsN} colunas no proskenion`);
      // (the ways in: between the building's corner and the rows' end wall; behind the stage the corridor, the rooms, the hall's way out)
      const way = Math.abs(-Math.cos(A.a0) * (A.vP - A.vD) + Math.sin(A.a0) * (A.u0 - A.cu)) - 0.2;
      if (way < 2.0 - 0.01 || (A.dc && A.dc < 1.2) || A.dr < 2.0 || A.wm < 2.0) out.push(`${tag}: a entrada de ${way.toFixed(2)} m entre o prédio e a ponta das fileiras, o corredor de ${A.dc} m, os cômodos de ${A.dr} m`);
      said.push(`${tag}: lote ${F.L} m, a cávea de ${(span * 180 / Math.PI).toFixed(0)}° e ${(2 * A.R).toFixed(1)} m, ${A.rows.length} fileiras de ${rmax.toFixed(2)} × ${tmin.toFixed(2)} m em ${pieces.length} níveis${walk ? ` (o passeio de ${walk.toFixed(1)} m)` : ''}, a galeria de ${gal.toFixed(2)} m a ${A.top.toFixed(2)} m; a orquestra de ${(2 * A.ro).toFixed(0)} m; ${st === 'romano' ? `o palco de ${A.w} × ${(A.vS - A.vP).toFixed(1)} m a ${A.ys} m, a frons de ${(A.ys + A.hf).toFixed(1)} m` : `a skene de ${A.w} m, o proskenion de ${(A.vS - A.vP).toFixed(1)} m`} com ${colsN} colunas e 3 portas; a entrada de ${way.toFixed(1)} m; ${A.dc ? `o corredor de ${A.dc} m, ` : ''}os cômodos de ${A.dr} m`);
    }
    ok('E1 as formas dos teatros: a cávea (meio círculo, mais que meio), as fileiras do corpo em níveis, a galeria e os parapeitos, a orquestra, o palco, a frons e a skene, as entradas, os bastidores', !out.length, out.slice(0, 4).join(' · ') || said.join(' · '));
  }
  // ---------------------------------------------------------------- E2 the plans
  const plans = {}; let nid = 63001;
  {
    const out = [], said = [], times = [];
    for (const st of TSTYLES) for (const n of TSIZES) for (const s of SIDES) {
      const { b, p, dt } = planOf('teatro', st, n, s, (nid += 37)); times.push(dt); plans[st + n + s] = { b, p }; const tag = `${st} n ${n}/${s}`;
      if (!p || !p.ok) { out.push(`${tag}: não se arma (${p ? p.errs.slice(0, 2).join('; ') : '—'})`); continue; }
      G.S.buildings.set(b.id, b); const A = Fo.of('teatro', st, n).amphi.teatro;
      const fal = In.report(b, p, { rec: b.ip }).filter(q => q.k === 'FALHA'); if (fal.length) out.push(`${tag}: ${fal.slice(0, 2).map(q => q.what).join('; ')}`);
      // (the seats: every one reached; ≥ 300 on the monumental; the levels — the blocks of rows —)
      const seats = In.tierSeats(p), got = reachedSeats(p); if (got.length < seats.length || (n >= 10 && got.length < 300)) out.push(`${tag}: ${seats.length} assentos, ${got.length} alcançados`);
      if ((p.tiers || []).length !== (A.up ? 2 : 1)) out.push(`${tag}: ${(p.tiers || []).length} blocos de fileiras`);
      const lv = p.levels.map(l => l.lv).join(','), fl = p.stairs.filter(q => q.kind !== 'degraus');
      if (st === 'romano' ? lv !== '0,1' || fl.length !== 3 || fl.some(q => q.cls !== 'degraus') : lv !== '0' || fl.length) out.push(`${tag}: os pisos ${lv}, os lances ${fl.map(q => `${q.lv0}→${q.lv1} ${q.cls}`).join(' ')}`);
      // (the rooms: the stage, the corridor behind, the dressing rooms, the hall, the ways in — each reached)
      const want = ['teatro', 'passagem', 'adro', 'camarim', 'preparacao', 'entrada'].concat(st === 'romano' ? ['palco'] : [], A.dc ? ['bastidores'] : []);
      for (const fn of want) { const rs = p.rooms.filter(m => m.fn === fn); if (!rs.length || !rs.every(m => roomReached(p, m))) out.push(`${tag}: o cômodo ${fn} ${rs.length ? 'que a porta não alcança' : 'ausente'}`); }
      // (who acts — the posts of the trade and the places —, the musicians; the dressing rooms' hangers)
      const posts = p.items.filter(it => it.kind === 'cena').length, hang = p.items.filter(it => it.kind === 'cabide').length;
      if (posts + marksOk(p, 'atuar') < 3 || marksOk(p, 'tocar') < 2 || hang < 2) out.push(`${tag}: ${posts} postos e ${marksOk(p, 'atuar')} lugares de atuar, ${marksOk(p, 'tocar')} de tocar, ${hang} cabides`);
      if (s === 'S') said.push(`${tag.split('/')[0]}: ${got.length} assentos em ${(p.tiers || []).length} níveis, ${posts} postos e ${marksOk(p, 'atuar')} lugares de atuar, ${marksOk(p, 'tocar')} de tocar; ${p.rooms.length} cômodos (${[...new Set(p.rooms.map(m => m.fn))].join(', ')})`);
    }
    const tmax = Math.max(...times), tmed = times.slice().sort((a, b) => a - b)[times.length >> 1];
    if (tmax > 400) out.push(`a planta levou ${tmax.toFixed(0)} ms (o alvo: 400)`);
    ok('E2 as plantas dos teatros: nos quatro lados e nos três tamanhos, sem falha, todo assento alcançado (≥ 300 no monumental), os níveis, o palco, os bastidores, os camarins, quem atua e quem toca, o tempo', !out.length, out.slice(0, 4).join(' · ') || `${said.join(' · ')}; o tempo: a mediana ${tmed.toFixed(0)} ms, a maior ${tmax.toFixed(0)} (alvo 400)`);
  }
  // ---------------------------------------------------------------- E3 the form × the plan (and L-494)
  {
    const out = [], said = []; const CELL = In.CELL;
    for (const st of TSTYLES) for (const n of TSIZES) {
      const { p } = plans[st + n + 'S']; if (!p || !p.ok) continue; const F = Fo.of('teatro', st, n), A = F.amphi.teatro; const N = p.grid.n; const tag = `${st} n ${n}`;
      const pieces = F.els.filter(e => e.k === 'cavea' && e.escadas), walls = F.els.filter(e => e.k === 'cavea' && !e.escadas);
      // (the ground: never in the walls at the rows' ends nor in the gallery's parapet; on the rows at the form's height, off a
      // step's edge — the plan's height is its cell's middle's —; elsewhere on the floor)
      let bad = 0, first = '', worst = 0, at = '', cells = 0;
      for (let k = 0; k < N * N; k++) { if (!p.reach[0][k]) continue; const x = (k % N + 0.5) * CS, z = (Math.floor(k / N) + 0.5) * CS; cells++;
        if (walls.some(e => inPiece(e, x, z))) { bad++; if (!first) first = `(${x.toFixed(2)}, ${z.toFixed(2)})`; continue; }
        const e = pieces.find(q => inPiece(q, x, z)); const fy = e ? caveaY(F, x, z) : A.yq; if (fy === null) continue;
        if (e && [[0.13, 0], [-0.13, 0], [0, 0.13], [0, -0.13]].some(([dx, dz]) => Math.abs((caveaY(F, x + dx, z + dz) ?? fy) - fy) > 1e-6)) continue;
        const d = In.floorYOf(p, 0, x, z) - fy; if (Math.abs(d) > Math.abs(worst)) { worst = d; at = `(${x.toFixed(2)}, ${z.toFixed(2)})`; } }
      if (bad) out.push(`${tag}: ${bad} casinhas andadas nos muros das pontas ou no parapeito (a primeira ${first})`);
      if (Math.abs(worst) > 0.01) out.push(`${tag}: o chão da planta a ${worst.toFixed(2)} m da forma em ${at}`);
      // (the stage building's storey: the Roman's stage at the form's; its walls on the form's walls, its doors in their openings)
      const lb = st === 'romano' ? 1 : 0, yb = st === 'romano' ? A.ys : A.yq; const l1 = p.levels.find(l => l.lv === lb); if (Math.abs(l1.y - yb) > 1e-6) out.push(`${tag}: o piso do palco a ${l1.y} m, o da forma a ${yb} m`);
      let off = 0, offAt = '', doors = 0, shut = 0;
      for (const w of p.walls) { if (w.lv !== lb || (w.kind !== 'parede' && w.kind !== 'divisoria')) continue; const L2 = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]); const hs = p.holes.filter(h => h.wall === w.id);
        for (let s = 0.15; s < L2 - 0.15; s += 0.25) { if (hs.some(h => Math.abs(s - h.at) < h.w / 2 + 0.1)) continue; const x = w.a[0] + (w.b[0] - w.a[0]) * s / L2, z = w.a[1] + (w.b[1] - w.a[1]) * s / L2; if (!inBlock(F, x, z, yb, 0.02)) { off++; if (!offAt) offAt = `(${x.toFixed(2)}, ${z.toFixed(2)})`; } }
        for (const h of hs) { doors++; const x = w.a[0] + (w.b[0] - w.a[0]) * h.at / L2, z = w.a[1] + (w.b[1] - w.a[1]) * h.at / L2; if (inBlock(F, x, z, yb, -0.05)) shut++; } }
      if (off || shut || doors < 3 + (A.dc ? 3 : 0)) out.push(`${tag}: ${off} pontos das paredes da planta fora das da forma (o primeiro ${offAt}), ${shut} de ${doors} portas fechadas na forma`);
      // (T-457: the parapet round the gallery — the plan's walls of it on the 3D's polygon, their middle line R − 0.1 by its
      // measure at every point, the arc from a0 to a1 whole: as chords of their own from a0 the Greek's stood 4.3 cm off it)
      const rim = p.walls.filter(w => w.lv === 0 && w.kind === 'parapeito' && [w.a, w.b].every(q => Math.abs(Math.hypot(q[0] - A.cu, q[1] - A.vD) - (A.R - 0.1)) < 0.3));
      const ro = ringWallsOff(rim, [A.cu, A.vD], A.R - 0.1, A.a0, A.a1);
      if (!ro.n || ro.dev > 0.01 || ro.gap > 0.02) out.push(`${tag}: o parapeito da galeria da planta a ${(ro.dev * 100).toFixed(1)} cm do polígono do 3D, ${ro.n} paredes, o maior vão ${ro.gap.toFixed(2)} m (T-457)`);
      // (D-131: the stage building a closed part under its roof — its storey up to the form's ceiling of it, A.teto, the foot of
      // the roof over its rooms, and no wall of it above: the Greek's walls of 4 m stood on a storey of 3, the Roman's scaenae
      // frons of 4.6 m on one of 3, over the building)
      const ls = p.levels.find(l => l.lv === lb); const over = p.walls.filter(w => w.lv === lb && (w.kind === 'parede' || w.kind === 'divisoria') && ls.y + w.h > A.teto + 1e-6);
      if (Math.abs(ls.y + ls.h - A.teto) > 1e-6 || over.length) out.push(`${tag}: o piso do prédio do palco até ${(ls.y + ls.h).toFixed(2)} m, o teto da forma a ${A.teto} m; ${over.length} paredes acima dele (D-131)`);
      // (L-506: the Roman's flights up to the stage and to the hall — the plan's floor on them the form's steps, as drawn: a slope
      // across their four risers of 23.5 cm left the feet up to 20 cm under the step drawn)
      let stepOff = 0, stepAt = '', stepN = 0; const steps = F.els.filter(e => e.k === 'bloco' && e.degrau);
      for (const s of p.stairs) { if (s.lv0 !== 0 || s.lv1 !== 1) continue;
        for (let z = Math.floor(s.r[1] / CS); z <= Math.floor(s.r[3] / CS); z++) for (let x = Math.floor(s.r[0] / CS); x <= Math.floor(s.r[2] / CS); x++) { const mx = (x + 0.5) * CS, mz = (z + 0.5) * CS;
          const e = steps.find(q => mx > q.r[0] + 0.01 && mx < q.r[2] - 0.01 && mz > q.r[1] + 0.01 && mz < q.r[3] - 0.01); if (!e) continue; stepN++;
          const d = Math.abs(In.floorYOf(p, 0, mx, mz) - e.y1); if (d > stepOff) { stepOff = d; stepAt = `(${mx.toFixed(2)}, ${mz.toFixed(2)})`; } } }
      if (stepOff > 0.0051) out.push(`${tag}: nos lances do palco, o chão da planta a ${(stepOff * 100).toFixed(1)} cm do degrau da forma em ${stepAt} (L-506)`); // (the plan keeps a tread's top to the centimetre: 0.295 is 0.3 in it)
      // (L-494: the orchestra drawn a hair over the plan's floor — (1) —; no floor of the plan in a column's base — (3), the 3D's
      // base of 2.3 radii —; (2), the rows drawn as chords and walked as rounds: below)
      const orq = F.els.find(e => e.k === 'arena'); const d1 = orq.y - (p.levels[0].y); if (d1 < 0 || d1 > 0.015) out.push(`${tag}: a orquestra desenhada a ${d1.toFixed(3)} m do chão da planta (L-494, 1)`);
      let inBase = 0; for (const e of F.els) { if (e.k !== 'colunata') continue; const lc = Math.abs(e.y0 - yb) < 0.2 ? lb : -1; if (lc < 0) continue; const g = p.grid.lv[lc], h = e.r * Fo.COLUMN_BASE / 2;
        for (const [cx, cz] of e.pts) for (let z = Math.floor((cz - h) / CS); z <= Math.floor((cz + h) / CS); z++) for (let x = Math.floor((cx - h) / CS); x <= Math.floor((cx + h) / CS); x++) { const mx = (x + 0.5) * CS, mz = (z + 0.5) * CS; if (Math.abs(mx - cx) < h && Math.abs(mz - cz) < h && g[z * N + x] === CELL.FLOOR) inBase++; } }
      if (inBase) out.push(`${tag}: ${inBase} casinhas de chão na base de uma coluna (L-494, 3)`);
      // (L-494 (2): the rows drawn as chords and walked as rounds — one polygon now for the 3D and the plan, G.Forma.ringEdge —:
      // every reached cell of the rows, a step's edge too, on the form's floor by it; and, to read, how many lie between the round
      // and the polygon of an edge — the ones the round put in another row than the drawing)
      let poly = 0, band = 0, polyAt = ''; for (const e of pieces) { const bnd = e.aneis.map(q => q[0]).concat([e.fundo]);
        for (let k = 0; k < N * N; k++) { if (!p.reach[0][k]) continue; const x = (k % N + 0.5) * CS, z = (Math.floor(k / N) + 0.5) * CS; if (!inPiece(e, x, z)) continue;
          const th = Math.atan2(z - e.c[1], x - e.c[0]), d = Math.hypot(x - e.c[0], z - e.c[1]), dp = d / Fo.ringEdge(1, th); if (bnd.some(r => (d < r) !== (dp < r))) band++;
          if (Math.abs(In.floorYOf(p, 0, x, z) - caveaY(F, x, z)) > 1e-6) { poly++; if (!polyAt) polyAt = `(${x.toFixed(2)}, ${z.toFixed(2)})`; } } }
      if (poly) out.push(`${tag}: ${poly} casinhas das fileiras com o chão da planta fora do da forma (a primeira ${polyAt}; L-494, 2)`);
      said.push(`${tag}: ${cells} casinhas andadas no chão, o chão a ${worst.toFixed(3)} m da forma, ${doors} portas nas aberturas da forma, a orquestra ${(d1 * 100).toFixed(1)} cm sobre o chão; L-494 (2): ${poly} casinhas fora da forma (${band} entre o redondo e o polígono); o parapeito da galeria em ${ro.n} paredes a ${(ro.dev * 100).toFixed(1)} cm do polígono do 3D (T-457); o prédio do palco até o teto da forma, ${A.teto} m (D-131)${stepN ? `; nos lances do palco, ${stepN} casinhas no degrau da forma (L-506)` : ''}`);
    }
    // (the classic theatre — the Greek's and the classical people's, the one of before (antigo) —: no floor in its columns' bases)
    for (const st of ['grego', 'classico']) { const n0 = G.BDEF.teatro.w; const { b, p } = planOf('teatro', st, n0, 'S', (nid += 37)); if (!p || !p.ok) { out.push(`o teatro antigo ${st}: não se arma`); continue; }
      const F = Fo.of('teatro', st, n0), N = p.grid.n, g = p.grid.lv[0]; let inBase = 0;
      for (const e of F.els) { if (e.k !== 'colunata') continue; const h = e.r * Fo.COLUMN_BASE / 2; for (const [cx, cz] of e.pts) for (let z = Math.floor((cz - h) / CS); z <= Math.floor((cz + h) / CS); z++) for (let x = Math.floor((cx - h) / CS); x <= Math.floor((cx + h) / CS); x++) { const mx = (x + 0.5) * CS, mz = (z + 0.5) * CS; if (Math.abs(mx - cx) < h && Math.abs(mz - cz) < h && g[z * N + x] === CELL.FLOOR) inBase++; } }
      if (inBase) out.push(`o teatro antigo ${st}: ${inBase} casinhas de chão na base de uma coluna (L-494, 3)`); else said.push(`o teatro antigo ${st} (${b.w} casas): nenhuma casinha de chão na base de uma coluna`); }
    ok('E3 a forma × a planta dos teatros: o chão e as fileiras na altura da forma, nada andado nos muros, as paredes e as portas da planta nas da forma; a L-494 (1), (2) e (3)', !out.length, out.slice(0, 4).join(' · ') || said.join(' · '));
  }
  // ---------------------------------------------------------------- E4 the feet, on a blank world
  {
    const S = G.newState(7); S.H.fill(4); S.type.fill(G.T.GRASS); if (S.biome) S.biome.fill(0); S.clock = 0; S.day = 30; S.time = 0.3; G.S = S; G.newWorld();
    const TL = Sp.TILE; const out = [], said = [];
    for (const st of TSTYLES) for (const n of TSIZES) {
      const def = G.BDEF.teatro; const b = { id: 93001 + n + 100 * TSTYLES.indexOf(st), type: 'teatro', style: st, esc: stepOf('teatro', n), x: 12, y: 12, w: n, h: n, built: true, progress: 1, hp: def.hp || 100, maxHp: def.hp || 100, v: 0, set: 0, blocks: true, ip: null };
      for (const o of [...S.buildings.values()]) { for (let yy = o.y; yy < o.y + o.h; yy++) for (let xx = o.x; xx < o.x + o.w; xx++) S.occ[yy * G.N + xx] = 0; S.buildings.delete(o.id); }
      S.buildings.set(b.id, b); for (let yy = b.y; yy < b.y + b.h; yy++) for (let xx = b.x; xx < b.x + b.w; xx++) S.occ[yy * G.N + xx] = b.id;
      b.ip = In.newRecord(b, { t: 'teatro', c: st, e: 3, k: 'ae', cl: 't', fl: 0, d: 1, w: 1, pw: 0, s: 'S', o: (1 << n) - 1, n });
      const p = Sp.planNow(b); const tag = `${st} n ${n}`; if (!p || !p.ok) { out.push(`${tag}: sem planta (${p ? p.errs.slice(0, 2).join('; ') : '—'})`); continue; }
      const F = Fo.of('teatro', st, n), A = F.amphi.teatro, L = n * TL, pl = Sp.plinth(b); const { cu, vD, ro, u0, vP, vS, vC, vR, vF, wm, dc } = A;
      // (the middle stairway of the rows — the lower's and the upper's are on one line —; the walk round and the gallery)
      const pieces = F.els.filter(e => e.k === 'cavea' && e.escadas), a = pieces[0].escadas.a[pieces[0].escadas.a.length >> 1], on = (r, th) => [cu + r * Math.cos(th), vD + r * Math.sin(th)];
      const rTop = A.up ? A.rW + A.tr * A.up : A.ri + A.tr * A.lo, gl = (rTop + A.rG) / 2, wl = (A.ri + A.tr * A.lo + A.rW) / 2;
      // (up the stairway from the orchestra — to the walk round and along it and back, on up to the gallery —, along the gallery)
      const up = [on(ro - 0.3, a)].concat(A.up ? [on(wl, a), on(wl, a + 0.15), on(wl, a)] : [], [on(gl, a), on(gl, a + 0.12), on(gl, a - 0.12)]);
      let legs, treads = [];
      if (st === 'romano') { const f = A.flights[0], fu = (f[0] + f[2]) / 2; treads = F.els.filter(e => e.degrau && e.r[0] === f[0]).map(e => ({ r: e.r, y1: e.y1 }));
        legs = [[0, [[cu - 3, L + 0.8], [cu - 3, vF + 1.6 + 0.3], [u0 - 1.4, vF + 1.6 + 0.3], [u0 - 1.4, vD + 0.55], [fu, vD + 0.55], [fu, f[1] - 0.45]]], [0, [[fu, f[1] + 0.05], [fu, vP - 0.05]], 1],
          [1, [[fu, vP + 0.45], [cu, vP + 1.0], [cu, (vS + vC) / 2]].concat(dc ? [[cu, vC + dc / 2], [cu - wm, vC + dc / 2], [cu - wm, vR + 0.6]] : [[cu, vR + 0.6]])],
          [0, [[cu, vD + 0.3]].concat(up)]]; }
      else legs = [[0, [[cu, L + 0.8], [cu, vF + 0.6], [cu, vR + 0.6], [cu, vC + dc / 2], [cu, vS - 0.5], [cu, vD + 0.3]].concat(up)],
        [0, [[cu - 3, vF + 0.6], [u0 - 1.0, vF + 0.6], [u0 - 1.0, vP - 0.5], [cu - 0.5 * ro, vD + 0.85 * ro]]]];
      const floor = (lv, u, z) => (lv === 1 ? A.ys : pieces.some(e => inPiece(e, u, z)) ? caveaY(F, u, z) : A.yq);
      const R8 = [0, 1, 2, 3, 4, 5, 6, 7].map(k => [0.18 * Math.cos(k * Math.PI / 4), 0.18 * Math.sin(k * Math.PI / 4)]);
      const edge = (u, z) => R8.some(([dx, dz]) => Math.abs(floor(0, u + dx, z + dz) - floor(0, u, z)) > 1e-6);
      const tread = (u, z) => { let y = null; for (const q of treads) if (u >= q.r[0] && u <= q.r[2] && z >= q.r[1] && z <= q.r[3] && (y === null || q.y1 > y)) y = q.y1; return y; };
      let worst = 0, at = '', step = 0, shut = 0, shutAt = '', pts = 0;
      for (const [lv, path, onFlight] of legs) { let prev = null;
        for (let k = 0; k < path.length - 1; k++) { const [u0p, z0] = path[k], [u1p, z1] = path[k + 1]; const len = Math.hypot(u1p - u0p, z1 - z0), m = Math.max(1, Math.round(len / 0.02));
          for (let j = 0; j <= m; j++) { const u = u0p + (u1p - u0p) * j / m, z = z0 + (z1 - z0) * j / m; const X = b.x * TL + u, Z = b.y * TL + z; const ins = Sp.indoor(X, Z, lv, b.id);
            const foot = ins ? ins.y : Math.max(Sp.footAt(X / TL, Z / TL), Sp.stepTop(X, Z)); pts++;
            if (ins && !ins.walk) { shut++; if (!shutAt) shutAt = `(${u.toFixed(2)}, ${z.toFixed(2)}) piso ${lv}`; }
            if (prev !== null) step = Math.max(step, Math.abs(foot - prev)); prev = foot;
            if (!ins || !ins.shell) continue;
            if (onFlight) { const ty = tread(u, z); if (ty === null) continue; const d = foot - (pl.hi + ty + Sp.FLOOR_UP); if ((d > 0.03 || d < -0.3) && Math.abs(d) > Math.abs(worst)) { worst = d; at = `(${u.toFixed(2)}, ${z.toFixed(2)}) no lance`; } continue; }
            if (lv === 0 && edge(u, z)) continue;
            const d = foot - (pl.hi + floor(lv, u, z) + Sp.FLOOR_UP); if (Math.abs(d) > 0.03 && Math.abs(d) > Math.abs(worst)) { worst = d; at = `(${u.toFixed(2)}, ${z.toFixed(2)}) piso ${lv}`; } } } }
      if (worst || step > In.BODY.step + 0.01) out.push(`${tag}: os pés a ${worst.toFixed(2)} m da forma em ${at || '—'}, o maior degrau ${step.toFixed(2)} m`);
      if (shut) out.push(`${tag}: ${shut} pontos do caminho onde o corpo não passa (o primeiro ${shutAt})`);
      said.push(`${tag}: ${pts} pontos, o maior degrau ${step.toFixed(2)} m`);
    }
    ok('E4 os pés pelos teatros: da rua pelo adro e pelas entradas à orquestra, ao palco e aos bastidores, subindo a escada do meio pelas fileiras, o passeio e a galeria', !out.length, out.slice(0, 3).join(' · ') || said.join(' · '));
  }
  // ---------------------------------------------------------------- E5 the world: the god's hand in a Roman and a Greek town
  // (each town by the game's rule, never by its name — handFor, T-505: in the metrópole of the generation 15 the one lot of 10
  // left, by Roma, served the Roman, and Argos, by its name, had none —, in the ready world that has a town of its people, the
  // metrópole first: mundoDe, T-604)
  const WORLD = ['romano', 'grego'];
  {
    const out = [], said = [];
    const bad = what => { const q = globalThis.QA.check().filter(x => x.sev <= 2 || x.sys === 'monumental' || x.sys === 'escala'); if (q.length) out.push(`${what}: ${q.slice(0, 2).map(x => `${x.sys} S${x.sev} ${x.msg.slice(0, 90)}`).join(' · ')}`); };
    const { grupos, sem } = porMundo(WORLD); for (const st of sem) out.push(`sem cidade ${st} em mundo pronto nenhum`);
    for (const [w, styles] of grupos) {
      M.pronto(w); bad('antes'); const built = [];
      for (const style of styles) {
        const hf = handFor(style, 'teatro', 'monumental'), set = hf.set;
        const steps = hf.steps; if (steps.includes('antigo') || !steps.includes('teatro')) out.push(`${set.name}: os degraus do teatro ${steps.join(', ')}`);
        const b = hf.b; if (!b) { out.push(`a mão do deus não achou nem abriu lote de 10 casas para o povo ${style} (${set.name})`); continue; }
        const p = In.plan(b), F = Fo.of(b.type, b.style, b.w);
        if (b.w !== 10 || b.esc !== 'monumental' || !b.built || b.style !== style) out.push(`${set.name}: o prédio ${b.w}×${b.h} esc=${b.esc} ${b.style} pronto=${b.built}`);
        if (!F || F.L !== b.w * 4 || !p || !p.ok || In.nOf(b.ip) !== b.w) out.push(`${set.name}: o lote, a forma e a planta: ${b.w * 4} m, ${F ? F.L : '—'} m, ${p && p.ok ? In.nOf(b.ip) * 4 + ' m' : 'sem planta'}`);
        const fal = p && p.ok ? In.report(b, p, { world: true, sides: true }).filter(q => q.k === 'FALHA') : []; if (fal.length) out.push(`${set.name} no mundo: ${fal.map(q => q.what).join('; ')}`);
        built.push({ b, set, sig: p && p.sig, steps, watch: p && p.cap.watch, gone: hf.gone });
      }
      bad('de pé'); M.viver(5); bad('vivendo');
      M.salvarCarregar(); for (const q of built) { const b2 = G.S.buildings.get(q.b.id); const p2 = b2 && In.plan(b2); if (!p2 || !p2.ok || p2.sig !== q.sig || b2.w !== 10 || b2.esc !== 'monumental') out.push(`${q.set.name}: depois do save, outro prédio ou outra planta`); }
      bad('carregado');
      G.inSim++; try { for (const q of built) G.Village.damageBuilding(G.S.buildings.get(q.b.id), 1e6, 'quake'); } finally { G.inSim--; }
      for (const q of built) { const b3 = G.S.buildings.get(q.b.id); if (b3 && b3.type !== 'ruin') out.push(`${q.set.name}: o deus derrubou e ficou de pé`); }
      bad('derrubados'); M.viver(1); bad('as ruínas vivendo');
      for (const q of built) said.push(`${q.set.name}: #${q.b.id} ${q.b.w}×${q.b.h} casas a ${G.dist(q.b.x + q.b.w / 2, q.b.y + q.b.h / 2, q.set.cx, q.set.cy).toFixed(1)} casas do centro${goneTxt(q)}, ${q.watch} assentos (os degraus ${q.steps.join(', ')})${ondeTxt(w, q.b.style)}`);
    }
    if (!M.limpo()) { const e = M.erros(); out.push(`erros: ${JSON.stringify(e.mod)} ${e.console.slice(0, 2).join(' | ')}`); }
    ok('E5 os teatros monumentais pela mão do deus numa cidade romana e numa grega (a metrópole; cada cidade pela regra do jogo): de pé, vivendo, salvos e carregados, derrubados — o verificador limpo', !out.length, out.slice(0, 3).join(' · ') || `${said.join(' · ')}; vivos, salvos e carregados (a mesma planta), derrubados: o verificador limpo`);
  }
  // ---------------------------------------------------------------- E6 the checker
  // (each theatre in the world of its people's town, as in E5: the checker provoked there, and quiet again)
  {
    const out = [], got = {}, hit = [];
    const mine = () => globalThis.QA.check().filter(q => q.sys === 'monumental');
    for (const [w, styles] of porMundo(WORLD).grupos) {
      M.pronto(w); const here = {}; for (const style of styles) got[style] = here[style] = handFor(style, 'teatro', 'monumental').b;
      if (mine().length) out.push(`com as plantas inteiras (${w}): ${mine().map(q => q.msg.slice(0, 80)).join(' · ')}`);
      // (the Roman's stage a metre off the form's; the Greek's rows seating 120)
      const plan0 = In.plan;
      In.plan = x => { const p = plan0(x); if (!p) return p;
        if (x === here.romano) return Object.assign({}, p, { levels: p.levels.map(l => (l.lv === 1 ? Object.assign({}, l, { y: l.y + 1 }) : l)) });
        if (x === here.grego) return Object.assign({}, p, { cap: Object.assign({}, p.cap, { watch: 120 }) });
        return p; };
      try { hit.push(...mine()); } finally { In.plan = plan0; }
      if (mine().length) out.push(`de volta (${w}), o verificador não calou`);
    }
    if (!got.romano || !got.grego) out.push('sem os dois teatros');
    const k1 = hit.find(q => q.sev === 1 && q.msg.includes('palco')), k2 = hit.find(q => q.sev === 2 && q.msg.includes('assistir'));
    if (!k1) out.push('com o palco noutra altura o verificador calou'); if (!k2) out.push('com 120 assentos o verificador calou');
    ok('E6 o verificador dos teatros: pega o palco noutra altura e a plateia menor que o degrau, e cala quando eles voltam', !out.length, out.join(' · ') || `limpo; «${k1.msg.slice(0, 80)}»; «${k2.msg.slice(0, 80)}»; limpo de novo`);
  }
  // ---------------------------------------------------------------- E7 the places' table
  {
    const out = [], said = [];
    for (const st of TSTYLES) for (const n of TSIZES) {
      const uses = ['assistir', 'atuar', 'tocar'], o = placesOf(st, n, uses, 'teatro');
      if (o.err) { out.push(`${st} n ${n}: ${o.err}`); continue; }
      const none = uses.filter(u => !o.free[u]); if (!o.ok || none.length) out.push(`${st} n ${n}: a tabela ${o.ok ? 'feita' : 'não feita'}${none.length ? `, sem lugar livre de ${none.join(', ')}` : ''}`);
      if (o.dt > 400) out.push(`${st} n ${n}: a tabela dos lugares levou ${o.dt.toFixed(0)} ms (o alvo: 400)`);
      said.push(`${st} n ${n}: ${o.spots} lugares em ${o.dt.toFixed(0)} ms`);
    }
    ok('E7 os lugares dos teatros (In.places, a tabela da planta): feita a tempo, um lugar livre de assistir, de atuar e de tocar', !out.length, out.slice(0, 3).join(' · ') || said.join(' · '));
  }
}

// =========================================================================================== H — the peoples
// (a form seen from the side, far off: at each twentieth of its height the span of its masses — Fo.mass — across the lot and
// along it, shares of the lot: its silhouette from the front and from the side)
function sideMap(F) {
  const ms0 = Fo.mass(F); let H = 0; for (const m of ms0) H = Math.max(H, m.y1 || 0, ...(m.p ? m.p.map(q => q[2]) : []));
  const at = (m, y) => { // (the rect a mass covers at the height y, or null)
    if ((m.k === 'box' || m.k === 'telhado') && y >= m.y0 && y <= m.y1) return m.r;
    if (m.k === 'talude' && y >= m.y0 && y <= m.y1) { const f = (y - m.y0) / ((m.y1 - m.y0) || 1); return m.r.map((q, k) => q + (m.r1[k] - q) * f); }
    if (m.k === 'piramide' && y >= m.y0 && y <= m.y1) { const h = m.e * (1 - (y - m.y0) / (m.y1 - m.y0)); return [m.c[0] - h, m.c[1] - h, m.c[0] + h, m.c[1] + h]; }
    if (m.k === 'anel' && y >= (m.y0 || 0) && y <= m.y1) { const a0 = m.a0 === undefined ? 0 : m.a0, sp = m.a0 === undefined ? TAU : ((m.a1 - m.a0) % TAU + TAU) % TAU || TAU; let r = null;
      for (let k = 0; k <= 32; k++) { const a = a0 + sp * k / 32, u = m.c[0] + m.r * Math.cos(a), v = m.c[1] + m.r * Math.sin(a); r = r ? [Math.min(r[0], u), Math.min(r[1], v), Math.max(r[2], u), Math.max(r[3], v)] : [u, v, u, v]; } return r; }
    if (m.k === 'pano') { const ys = m.p.map(q => q[2]); if (y < Math.min(...ys) || y > Math.max(...ys)) return null; const us = m.p.map(q => q[0]), vs = m.p.map(q => q[1]); return [Math.min(...us), Math.min(...vs), Math.max(...us), Math.max(...vs)]; }
    return null; };
  const out = [];
  for (let k = 1; k <= 19; k++) { const y = H * k / 20; let r = null; for (const m of ms0) { const e = at(m, y); if (e) r = r ? [Math.min(r[0], e[0]), Math.min(r[1], e[1]), Math.max(r[2], e[2]), Math.max(r[3], e[3])] : e.slice(); }
    out.push(r ? (r[2] - r[0]) / F.L : 0, r ? (r[3] - r[1]) / F.L : 0); }
  return out;
}
function testeH() {
  blank();
  // (every people now: the classical people's theatre is the Greek's form — its skene with no band, as the god draws it —, not
  // another; no ready world has a town of the classical people, T-401)
  const TYPES = { maravilha: { peoples: ['romano', 'egipcio', 'asteca', 'nordico', 'grego', 'classico'], n: [10, 13] }, teatro: { peoples: ['romano', 'grego', 'asteca', 'nordico', 'egipcio'], n: [6, 8, 10] } };
  // ---------------------------------------------------------------- H1 every people, each its own form
  {
    const out = [], said = [];
    for (const t in TYPES) for (const n of TYPES[t].n) {
      const maps = {}; for (const st of TYPES[t].peoples) { if (!Fo.has(t, st, n)) { out.push(`${t} ${st} n ${n}: sem forma`); continue; } maps[st] = sideMap(Fo.of(t, st, n)); }
      const ps = Object.keys(maps); let least = 9, pair = '';
      for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) { const a = maps[ps[i]], b = maps[ps[j]]; const d = Math.max(...a.map((q, k) => Math.abs(q - b[k]))); if (d < least) { least = d; pair = `${ps[i]} e ${ps[j]}`; } }
      // (two of them are another form where their silhouettes part by a tenth of the lot at some height, from the front or the side)
      if (ps.length < 3 || least < 0.1) out.push(`${t} n ${n}: ${ps.length} povos, os mais parecidos ${pair} (${least.toFixed(2)} do lote)`);
      said.push(`${t} n ${n}: ${ps.join(', ')} — os mais parecidos, ${pair}, a ${(least * 100).toFixed(0)}% do lote um do outro`);
    }
    ok('H1 cada tipo grande em cada povo, cada um com a sua forma: a maravilha (o Coliseu, a Grande Pirâmide, o Templo Mayor, Valhala, a Acrópole, o zigurate), o teatro (o romano, o grego — e o clássico, o mesmo —, o campo de bola, o salão do hidromel, o jardim sagrado)', !out.length, out.slice(0, 3).join(' · ') || said.join(' · '));
  }
  // ---------------------------------------------------------------- H2 the great ball court: its form
  {
    const out = [], said = [];
    for (const n of TSIZES) {
      const F = Fo.of('teatro', 'asteca', n), A = F && F.amphi && F.amphi.campo; if (!A) { out.push(`n ${n}: sem a forma`); continue; }
      const walls = F.els.filter(e => e.k === 'talude'), rings = F.els.filter(e => e.k === 'aro');
      // (the two walls, their faces to the alley sloping, the rings on them facing it; the rows the body's; the parapets; the flights)
      const slope = walls.every(e => (e.r1[1] - e.r[1]) + (e.r[3] - e.r1[3]) > 0.5 && e.r1[0] === e.r[0] && e.r1[2] === e.r[2]);
      if (walls.length !== 2 || !slope || rings.length !== 2 || A.ub - A.ua < 0.65 * F.L || A.Wa < 4) out.push(`n ${n}: ${walls.length} muros${slope ? '' : ' sem a rampa'}, ${rings.length} aros, a pista de ${A.ub - A.ua} × ${A.Wa} m`);
      const rows = F.els.filter(e => e.k === 'bloco' && e.piso && e.y0 === A.Hw), steps = F.els.filter(e => e.degrau); let rr = 0;
      for (const q of steps.filter(e => e.y0 === 0)) { const prev = steps.filter(o => o.y0 === 0 && Math.abs(o.r[1] - q.r[1]) < 1e-6 && o.y1 < q.y1).reduce((a, o) => Math.max(a, o.y1), A.yq); rr = Math.max(rr, q.y1 - prev); }
      const par = F.els.filter(e => e.k === 'bloco' && !e.piso && !e.degrau && e.y0 >= A.Hw - 1e-6 && Math.abs(e.y1 - e.y0 - 0.9) < 1e-6).length;
      if (!rows.length || rr > In.BODY.step + 1e-6 || par < 8 || A.tr < 0.7 || A.tr > 0.8 || A.rs < 0.4 || A.rs > 0.45) out.push(`n ${n}: ${rows.length} fileiras, degraus de ${rr.toFixed(2)} m, ${par} parapeitos`);
      said.push(`n ${n}: a pista de ${A.ub - A.ua} × ${A.Wa} m entre os muros de ${A.Hw} m, os campos de ${A.Le} × ${A.We} m, ${A.rows} fileiras de ${A.rs} × ${A.tr} m em cada muro, os lances de degraus de ${rr.toFixed(2)} m, ${par} parapeitos de 0,9 m`);
    }
    ok('H2 a forma do campo de bola (o teatro asteca): a pista, os muros com a rampa e os aros, as fileiras do corpo em cima deles, os parapeitos, os lances', !out.length, out.slice(0, 3).join(' · ') || said.join(' · '));
  }
  // ---------------------------------------------------------------- H3 the great ball court: its plans
  let nid = 64001; const plans = {};
  {
    const out = [], said = [], times = [];
    for (const n of TSIZES) for (const s of SIDES) {
      const { b, p, dt } = planOf('teatro', 'asteca', n, s, (nid += 37)); times.push(dt); plans[n + s] = { b, p }; const tag = `n ${n}/${s}`;
      if (!p || !p.ok) { out.push(`${tag}: não se arma (${p ? p.errs.slice(0, 2).join('; ') : '—'})`); continue; }
      G.S.buildings.set(b.id, b);
      const fal = In.report(b, p, { rec: b.ip }).filter(q => q.k === 'FALHA'); if (fal.length) out.push(`${tag}: ${fal.slice(0, 2).map(q => q.what).join('; ')}`);
      const seats = In.tierSeats(p), got = reachedSeats(p); if (!seats.length || got.length < seats.length) out.push(`${tag}: ${seats.length} assentos, ${got.length} alcançados`);
      const fl = p.stairs.filter(q => q.kind !== 'degraus'); if (p.levels.map(l => l.lv).join(',') !== '0,1' || fl.length !== 2) out.push(`${tag}: os pisos ${p.levels.map(l => l.lv).join(',')}, ${fl.length} lances`);
      for (const fn of ['campo', 'arquibancada']) { const rs = p.rooms.filter(m => m.fn === fn); if (!rs.length || !rs.every(m => roomReached(p, m))) out.push(`${tag}: o cômodo ${fn} ${rs.length ? 'que a porta não alcança' : 'ausente'}`); }
      const posts = p.items.filter(it => it.kind === 'cena').length; if (posts + marksOk(p, 'atuar') < 4 || marksOk(p, 'assistir') < 6) out.push(`${tag}: ${posts} postos e ${marksOk(p, 'atuar')} lugares de jogar, ${marksOk(p, 'assistir')} de assistir em pé`);
      // (on the street's side as the form is drawn: the stands' floor — the walks, the rows, their stairways — at the form's height,
      // off a step's edge)
      if (s === 'S') { const F = Fo.of('teatro', 'asteca', n), A = F.amphi.campo, N = p.grid.n; let worst = 0, wat = '';
        const rowY = (u, v) => { let y = null; for (const e of F.els) if (e.k === 'bloco' && (e.piso || e.degrau) && e.y0 === A.Hw && u >= e.r[0] && u <= e.r[2] && v >= e.r[1] && v <= e.r[3]) y = Math.max(y ?? 0, e.y1); return y ?? A.Hw; };
        for (let k = 0; k < N * N; k++) { if (!p.reach[1][k]) continue; const x = (k % N + 0.5) * CS, z = (Math.floor(k / N) + 0.5) * CS; const fy = rowY(x, z);
          if ([[0.13, 0], [-0.13, 0], [0, 0.13], [0, -0.13]].some(([dx, dz]) => rowY(x + dx, z + dz) !== fy)) continue; const d = In.floorYOf(p, 1, x, z) - fy; if (Math.abs(d) > Math.abs(worst)) { worst = d; wat = `(${x.toFixed(2)}, ${z.toFixed(2)})`; } }
        if (Math.abs(worst) > 0.01) out.push(`${tag}: o chão das arquibancadas a ${worst.toFixed(2)} m da forma em ${wat}`);
        said.push(`n ${n}: ${got.length} assentos nos muros (o chão a ${worst.toFixed(3)} m da forma), ${marksOk(p, 'assistir')} em pé nos campos, ${posts + marksOk(p, 'atuar')} jogadores; os lances de ${fl.map(q => `${q.slope}°`).join(', ')}`); }
    }
    const tmax = Math.max(...times); if (tmax > 400) out.push(`a planta levou ${tmax.toFixed(0)} ms (o alvo: 400)`);
    ok('H3 as plantas do campo de bola: nos quatro lados e nos três tamanhos, sem falha, todo assento alcançado, os jogadores e quem assiste, o tempo', !out.length, out.slice(0, 4).join(' · ') || `${said.join(' · ')}; a maior em ${tmax.toFixed(0)} ms`);
  }
  // ---------------------------------------------------------------- H4 the feet in the ball court, on a blank world
  {
    const S = G.newState(7); S.H.fill(4); S.type.fill(G.T.GRASS); if (S.biome) S.biome.fill(0); S.clock = 0; S.day = 30; S.time = 0.3; G.S = S; G.newWorld();
    const TL = Sp.TILE; const out = [], said = [];
    for (const n of TSIZES) {
      const def = G.BDEF.teatro; const b = { id: 94001 + n, type: 'teatro', style: 'asteca', esc: stepOf('teatro', n), x: 12, y: 12, w: n, h: n, built: true, progress: 1, hp: def.hp || 100, maxHp: def.hp || 100, v: 0, set: 0, blocks: true, ip: null };
      for (const o of [...S.buildings.values()]) { for (let yy = o.y; yy < o.y + o.h; yy++) for (let xx = o.x; xx < o.x + o.w; xx++) S.occ[yy * G.N + xx] = 0; S.buildings.delete(o.id); }
      S.buildings.set(b.id, b); for (let yy = b.y; yy < b.y + b.h; yy++) for (let xx = b.x; xx < b.x + b.w; xx++) S.occ[yy * G.N + xx] = b.id;
      b.ip = In.newRecord(b, { t: 'teatro', c: 'asteca', e: 3, k: 'ae', cl: 't', fl: 0, d: 1, w: 1, pw: 0, s: 'S', o: (1 << n) - 1, n });
      const p = Sp.planNow(b); if (!p || !p.ok) { out.push(`n ${n}: sem planta`); continue; }
      const F = Fo.of('teatro', 'asteca', n), A = F.amphi.campo, L = n * TL, pl = Sp.plinth(b); const q = A.stands.find(z => z.s > 0), f = q.flight, inner = q.room[0], a = A.aisles[0];
      const rowY = (u, v) => { let y = A.Hw; for (const e of F.els) if (e.k === 'bloco' && (e.piso || e.degrau) && e.y0 === A.Hw && u >= e.r[0] && u <= e.r[2] && v >= e.r[1] && v <= e.r[3]) y = Math.max(y, e.y1); return y; };
      // (the treads of the two flights — each stand's, up its front wall from the field: the form's blocks marked degrau from the
      // ground —; the feet on each of them, as the plan has them — but within a hair of an edge along the way up, where the plan's
      // are rounded to the centimetre: L-665)
      const q2 = A.stands.find(z => z.s < 0), f2 = q2.flight;
      const treads = F.els.filter(e => e.degrau && e.y0 === 0 && [f, f2].some(r => Math.abs(e.r[1] - r[1]) < 1e-6));
      const nearT = (e, u, z) => u >= e.r[0] - 0.011 && u <= e.r[2] + 0.011 && z >= e.r[1] - 1e-6 && z <= e.r[3] + 1e-6;
      // (from the street to the field and the alley; up the front wall's flight; along the walk by the slope; up a stairway to the walk behind the rows)
      const legs = [[0, [[A.cu, L + 0.8], [A.cu, q.vO + 1.0], [f[0] - 0.8, q.vO + 1.0], [f[0] - 0.8, A.cv], [A.cu - 2, A.cv], [f[0] - 0.8, A.cv], [f[0] - 0.8, q.vm]]], [0, [[f[0] + 0.05, q.vm], [f[2] - 0.05, q.vm]], 1], [0, [[f2[0] + 0.05, q2.vm], [f2[2] - 0.05, q2.vm]], 1],
        [1, [[A.ua + 0.5, q.vm], [A.ua + 0.5, inner + 0.6], [a, inner + 0.6], [a, q.room[1] - 0.4], [a + 1.5, q.room[1] - 0.4]]]];
      let worst = 0, at = '', step = 0, shut = 0, shutAt = '', pts = 0;
      for (const [lv, path, onFlight] of legs) { let prev = null;
        for (let k = 0; k < path.length - 1; k++) { const [u0, z0] = path[k], [u1, z1] = path[k + 1]; const len = Math.hypot(u1 - u0, z1 - z0), m = Math.max(1, Math.round(len / 0.02));
          for (let j = 0; j <= m; j++) { const u = u0 + (u1 - u0) * j / m, z = z0 + (z1 - z0) * j / m; const X = b.x * TL + u, Z = b.y * TL + z; const ins = Sp.indoor(X, Z, lv, b.id);
            const foot = ins ? ins.y : Math.max(Sp.footAt(X / TL, Z / TL), Sp.stepTop(X, Z)); pts++;
            if (ins && !ins.walk) { shut++; if (!shutAt) shutAt = `(${u.toFixed(2)}, ${z.toFixed(2)}) piso ${lv}`; }
            if (prev !== null) step = Math.max(step, Math.abs(foot - prev)); prev = foot;
            if (!ins || !ins.shell) continue;
            let want;
            if (onFlight) { want = null; for (const e of treads) if (nearT(e, u, z)) want = Math.max(want ?? 0, e.y1); if (want === null) continue; const d = foot - (pl.hi + want + Sp.FLOOR_UP); const under = treads.some(e => nearT(e, u, z) && (Math.abs(u - e.r[0]) <= 0.011 || Math.abs(u - e.r[2]) <= 0.011)) ? 0.3 : 0; if ((d > 0.03 || d < -under - 0.03) && Math.abs(d) > Math.abs(worst)) { worst = d; at = `(${u.toFixed(2)}, ${z.toFixed(2)}) no lance`; } continue; }
            want = lv === 0 ? A.yq : rowY(u, z); if (lv === 1 && [[0.18, 0], [-0.18, 0], [0, 0.18], [0, -0.18]].some(([dx, dz]) => rowY(u + dx, z + dz) !== want)) continue;
            const d = foot - (pl.hi + want + Sp.FLOOR_UP); if (Math.abs(d) > 0.03 && Math.abs(d) > Math.abs(worst)) { worst = d; at = `(${u.toFixed(2)}, ${z.toFixed(2)}) piso ${lv}`; } } } }
      if (worst || step > In.BODY.step + 0.01) out.push(`n ${n}: os pés a ${worst.toFixed(2)} m da forma em ${at || '—'}, o maior degrau ${step.toFixed(2)} m`);
      if (shut) out.push(`n ${n}: ${shut} pontos do caminho onde o corpo não passa (o primeiro ${shutAt})`);
      said.push(`n ${n}: ${pts} pontos, o maior degrau ${step.toFixed(2)} m`);
    }
    ok('H4 os pés pelo campo de bola: da rua ao campo e à pista, subindo o lance do muro, pelo passeio e por uma escada até o alto das fileiras', !out.length, out.slice(0, 3).join(' · ') || said.join(' · '));
  }
  // ---------------------------------------------------------------- H5 the world: each people raises its own, never the old one
  // (each people in the ready world that has a town of it, the metrópole first: mundoDe, T-604 — in the metrópole of the generation
  // 18 the Aztec people was gone)
  {
    const out = [], said = [];
    const bad = what => { const q = globalThis.QA.check().filter(x => x.sev <= 2 || x.sys === 'monumental' || x.sys === 'escala'); if (q.length) out.push(`${what}: ${q.slice(0, 2).map(x => `${x.sys} S${x.sev} ${x.msg.slice(0, 90)}`).join(' · ')}`); };
    const { grupos, sem } = porMundo([...new Set(Object.values(TYPES).flatMap(T => T.peoples).concat('asteca'))]);
    for (const st of sem) if (st === 'classico') said.push('o povo clássico sem cidade em mundo pronto nenhum'); else out.push(`sem cidade ${st} em mundo pronto nenhum`);
    for (const [w, sts] of grupos) {
      M.pronto(w); const S = G.S;
      const townOf = st => [...S.settlements.values()].filter(s => G.Fac.get(s.fac) && G.Civ.idOfFac(s.fac) === st).sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0];
      for (const t in TYPES) for (const st of TYPES[t].peoples) { if (!sts.includes(st)) continue; const set = townOf(st); const ids = G.Escala.choose(set, t).map(s => s.id);
        if (ids.some(id => (G.Escala.steps(t).find(s => s.id === id) || {}).legado)) out.push(`${set.name} (${st}): os degraus de ${t} ${ids.join(', ')}`); else said.push(`${t} em ${set.name}: ${ids.join(', ')}${ondeTxt(w, st)}`); }
      if (!sts.includes('asteca')) continue;
      // (the ball court by the god's hand in an Aztec town — by the game's rule, handFor, T-505 —: standing, living, saved and loaded,
      // thrown down)
      const hf = handFor('asteca', 'teatro', 'monumental'), set = hf.set, b = hf.b;
      if (!b) out.push(`a mão do deus não achou nem abriu lote para o campo de bola (${set.name})`); else {
        const p = In.plan(b); if (!p || !p.ok || b.style !== 'asteca' || b.w !== 10) out.push(`o campo de bola: ${b.style} ${b.w} casas, a planta ${p && p.ok}`);
        const fal = p && p.ok ? In.report(b, p, { world: true, sides: true }).filter(q => q.k === 'FALHA') : []; if (fal.length) out.push(`no mundo: ${fal.map(q => q.what).join('; ')}`);
        bad('de pé'); M.viver(5); bad('vivendo'); const sig = p && p.sig; M.salvarCarregar(); const b2 = G.S.buildings.get(b.id), p2 = b2 && In.plan(b2); if (!p2 || p2.sig !== sig) out.push('depois do save, outra planta'); bad('carregado');
        // (the checker: the stands a metre off the form's, and quiet again)
        const plan0 = In.plan; let hit = []; In.plan = x => { const q = plan0(x); return x === b2 && q ? Object.assign({}, q, { levels: q.levels.map(l => (l.lv === 1 ? Object.assign({}, l, { y: l.y + 1 }) : l)) }) : q; };
        try { hit = globalThis.QA.check().filter(q => q.sys === 'monumental'); } finally { In.plan = plan0; }
        if (!hit.some(q => q.sev === 1 && q.msg.includes('arquibancadas'))) out.push('com as arquibancadas noutra altura o verificador calou'); bad('de volta');
        G.inSim++; try { G.Village.damageBuilding(G.S.buildings.get(b.id), 1e6, 'quake'); } finally { G.inSim--; } bad('derrubado'); M.viver(1); bad('a ruína vivendo');
        said.push(`o campo de bola em ${set.name}: #${b.id}${goneTxt(hf)}, ${p && p.cap.watch} assentos; vivo, salvo e carregado; o verificador pega as arquibancadas noutra altura e cala de volta; derrubado: limpo${ondeTxt(w, 'asteca')}`); }
    }
    if (!M.limpo()) { const e = M.erros(); out.push(`erros: ${JSON.stringify(e.mod)} ${e.console.slice(0, 2).join(' | ')}`); }
    ok('H5 o mundo: cada povo funda o seu degrau grande, nunca o antigo; o campo de bola pela mão do deus numa cidade asteca (pela regra do jogo), de pé, vivendo, salvo e carregado, o verificador, derrubado', !out.length, out.slice(0, 3).join(' · ') || said.join(' · '));
  }
  // ---------------------------------------------------------------- H6 the places' table of the ball court
  {
    const out = [], said = [];
    for (const n of TSIZES) { const uses = ['assistir', 'atuar'], o = placesOf('asteca', n, uses, 'teatro'); if (o.err) { out.push(`n ${n}: ${o.err}`); continue; }
      const none = uses.filter(u => !o.free[u]); if (!o.ok || none.length || o.dt > 400) out.push(`n ${n}: a tabela ${o.ok ? 'feita' : 'não feita'} em ${o.dt.toFixed(0)} ms${none.length ? `, sem lugar livre de ${none.join(', ')}` : ''}`);
      said.push(`n ${n}: ${o.spots} lugares em ${o.dt.toFixed(0)} ms`); }
    ok('H6 os lugares do campo de bola (In.places, a tabela da planta): feita a tempo, um lugar livre de assistir e de jogar', !out.length, out.slice(0, 3).join(' · ') || said.join(' · '));
  }
}

// =========================================================================================== M — the great monument
const MPEOPLES = ['egipcio', 'romano', 'asteca', 'grego', 'classico', 'nordico'];
function testeM() {
  blank(); const n = 4;
  // ---------------------------------------------------------------- M1 the forms
  {
    const out = [], said = [], maps = {};
    for (const st of MPEOPLES) {
      const F = Fo.has('monument', st, n) && Fo.of('monument', st, n); if (!F) { out.push(`${st}: sem a forma`); continue; }
      if (st === 'nordico') {
        // (the Norse's stone ship on its grass: the great stone 8 m and more, the ship's stones round it, its middle open to the
        // street — 2.2 m between the stones at least —, the way in)
        const S = F.els.filter(e => e.k === 'pedra'), g = S.reduce((a, e) => (e.y1 > a.y1 ? e : a)), A = F.amphi && F.amphi.runas;
        const front = S.filter(e => e.c[1] > F.L / 2 + 1.5).map(e => [e.c[0] - e.e, e.c[0] + e.e]).sort((a, b) => a[0] - b[0]); let gap = 0; for (let k = 1; k < front.length; k++) if (front[k - 1][1] < F.L / 2 && front[k][0] > F.L / 2) gap = front[k][0] - front[k - 1][1];
        if (F.L !== 16 || !A || S.length < 12 || g.y1 < 8 || gap < 2.2 || !F.els.some(e => e.k === 'bloco' && e.mat === 'turf')) out.push(`${st}: lote ${F.L} m, ${S.length} pedras, a grande de ${g.y1} m, a entrada de ${gap.toFixed(2)} m`);
        maps[st] = sideMap(F); said.push(`${st}: o navio de ${S.length - 3} pedras, a grande de ${g.y1} m, a entrada de ${gap.toFixed(1)} m`); continue;
      }
      // (the steps: a body's each — the crepis, each step split along the front —; the top 12 m across; what stands in its middle,
      // a tenth of the top at least; the height of a great one)
      const st0 = F.els.filter(e => e.k === 'bloco' && e.degrau === 1).sort((a, b) => a.y1 - b.y1); let rr = 0, prev = 0; for (const e of st0) { rr = Math.max(rr, e.y1 - prev); prev = e.y1; }
      const T = st0[st0.length - 1].r, mid = Fo.solids(F, prev).filter(s => s.k === 'rect' && (s.r[2] - s.r[0]) * (s.r[3] - s.r[1]) >= 0.1 * (T[2] - T[0]) * (T[3] - T[1]));
      if (F.L !== 16 || st0.length < 6 || rr > In.BODY.step + 1e-6 || T[2] - T[0] < 12 || !mid.length || F.top < 10) out.push(`${st}: lote ${F.L} m, ${st0.length} meios-degraus de ${rr.toFixed(2)} m, o alto de ${(T[2] - T[0]).toFixed(1)} m, ${mid.length} peça no meio, ${F.top.toFixed(1)} m de altura`);
      maps[st] = sideMap(F); said.push(`${st}: ${F.top.toFixed(1)} m de altura, o alto de ${(T[2] - T[0]).toFixed(1)} m a ${prev} m (${st0.length / 2} degraus de ${(2 * rr).toFixed(2)} m em dois)`);
    }
    const ps = Object.keys(maps); let least = 9, pair = ''; for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) { const a = maps[ps[i]], b = maps[ps[j]]; const d = Math.max(...a.map((q, k) => Math.abs(q - b[k]))); if (d < least) { least = d; pair = `${ps[i]} e ${ps[j]}`; } }
    if (ps.length < 3 || least < 0.1) out.push(`${ps.length} povos, os mais parecidos ${pair} (${least.toFixed(2)} do lote)`);
    ok('M1 as formas do grande monumento (16 m) em seis povos — o obelisco egípcio e o clássico, a coluna do triunfo, a Pedra do Sol, o deus de ouro, o navio de pedras: os degraus do corpo, o alto, a peça do meio, a altura, cada um a sua', !out.length, out.slice(0, 3).join(' · ') || `${said.join(' · ')}; os mais parecidos, ${pair}, a ${(least * 100).toFixed(0)}% do lote`);
  }
  // ---------------------------------------------------------------- M2 the plans
  {
    const out = [], said = [], times = []; let nid = 65001;
    for (const st of MPEOPLES) for (const s of SIDES) {
      const { b, p, dt } = planOf('monument', st, n, s, (nid += 37)); times.push(dt); const tag = `${st}/${s}`;
      if (!p || !p.ok) { out.push(`${tag}: não se arma (${p ? p.errs.slice(0, 2).join('; ') : '—'})`); continue; }
      G.S.buildings.set(b.id, b);
      const fal = In.report(b, p, { rec: b.ip }).filter(q => q.k === 'FALHA'); if (fal.length) out.push(`${tag}: ${fal.slice(0, 2).map(q => q.what).join('; ')}`);
      const rs = p.rooms.filter(m => m.fn === (st === 'nordico' ? 'pedras' : 'plataforma')); if (!rs.length || !rs.every(m => roomReached(p, m))) out.push(`${tag}: o alto que a porta não alcança`);
      if (marksOk(p, 'ofertar') < 1 || marksOk(p, 'rezar') < 8 || (st === 'asteca' && marksOk(p, 'acender') < 2)) out.push(`${tag}: ${marksOk(p, 'ofertar')} de ofertar, ${marksOk(p, 'rezar')} de rezar, ${marksOk(p, 'acender')} de acender`);
      if (s === 'S') said.push(`${st}: ${marksOk(p, 'ofertar')} de ofertar, ${marksOk(p, 'rezar')} de rezar${st === 'asteca' ? `, ${marksOk(p, 'acender')} de acender` : ''}`);
    }
    const tmax = Math.max(...times); if (tmax > 400) out.push(`a planta levou ${tmax.toFixed(0)} ms (o alvo: 400)`);
    ok('M2 as plantas do grande monumento: nos quatro lados e nos seis povos, sem falha, o alto (o gramado do navio) alcançado, quem oferta, quem reza, quem acende os braseiros, o tempo', !out.length, out.slice(0, 4).join(' · ') || `${said.join(' · ')}; a maior em ${tmax.toFixed(0)} ms`);
  }
  // ---------------------------------------------------------------- M3 the feet, on a blank world: up the steps, round the middle
  {
    const S = G.newState(7); S.H.fill(4); S.type.fill(G.T.GRASS); if (S.biome) S.biome.fill(0); S.clock = 0; S.day = 30; S.time = 0.3; G.S = S; G.newWorld();
    const TL = Sp.TILE; const out = [], said = [];
    for (const st of MPEOPLES) {
      const def = G.BDEF.monument; const b = { id: 95001 + MPEOPLES.indexOf(st), type: 'monument', style: st, esc: 'grande', x: 12, y: 12, w: n, h: n, built: true, progress: 1, hp: def.hp || 100, maxHp: def.hp || 100, v: 0, set: 0, blocks: true, ip: null };
      for (const o of [...S.buildings.values()]) { for (let yy = o.y; yy < o.y + o.h; yy++) for (let xx = o.x; xx < o.x + o.w; xx++) S.occ[yy * G.N + xx] = 0; S.buildings.delete(o.id); }
      S.buildings.set(b.id, b); for (let yy = b.y; yy < b.y + b.h; yy++) for (let xx = b.x; xx < b.x + b.w; xx++) S.occ[yy * G.N + xx] = b.id;
      b.ip = In.newRecord(b, { t: 'monument', c: st, e: 3, k: 'ae', cl: 't', fl: 0, d: 1, w: 1, pw: 0, s: 'S', o: (1 << n) - 1, n });
      const p = Sp.planNow(b); if (!p || !p.ok) { out.push(`${st}: sem planta`); continue; }
      if (st === 'nordico') {
        // (the stone ship: from the street over the grass, in by the ship's open middle, to the place of the offering before the
        // great stone and along the prayers' first row)
        const F = Fo.of('monument', st, n), A = F.amphi.runas, L = n * TL, of = (p.marks.find(q => q.use === 'ofertar') || { pts: [] }).pts[0];
        const legs = [[0, [[A.cu, L + 0.8], [A.cu, A.fila + 1.4]].concat(of ? [[of.x, of.z], [of.x, A.fila], [A.cu - 2.0, A.fila]] : [])]];
        const r = feetAlong(b, legs, (lv, u, z) => (u > 0.45 && u < L - 0.45 && z > 0.45 && z < L - 0.45 ? [0.075, 0] : null));
        if (r.worst || r.step > In.BODY.step + 0.01) out.push(`${st}: os pés a ${r.worst.toFixed(2)} m da forma em ${r.at || '—'}, o maior degrau ${r.step.toFixed(2)} m`);
        if (r.shut || !of) out.push(`${st}: ${r.shut} pontos do caminho onde o corpo não passa (o primeiro ${r.shutAt || '—'})${of ? '' : ', sem lugar de ofertar'}`);
        said.push(`${st}: ${r.pts} pontos, o maior degrau ${r.step.toFixed(2)} m`); continue;
      }
      const F = Fo.of('monument', st, n), L = n * TL, pl = Sp.plinth(b); const st0 = F.els.filter(e => e.k === 'bloco' && e.degrau === 1); const T = st0.reduce((a, e) => (e.y1 > a.y1 ? e : a)).r, top = Math.max(...st0.map(e => e.y1)), cu = L / 2;
      const of = (p.marks.find(M2 => M2.use === 'ofertar') || { pts: [] }).pts[0];
      // (the floor under a point: the highest step there — the street off them —; from the street up the front, round the middle
      // by its front strip and its left side, to the place of the offering)
      const want = (u, z) => { let y = 0; for (const e of st0) if (u >= e.r[0] && u <= e.r[2] && z >= e.r[1] && z <= e.r[3]) y = Math.max(y, e.y1); return y; };
      const path = [[cu - 1.0, L + 0.8], [cu - 1.0, T[3] - 0.6], [T[0] + 0.6, T[3] - 0.6], [T[0] + 0.6, T[1] + 0.6]].concat(of ? [[T[0] + 0.6, T[3] - 0.6], [of.x, T[3] - 0.6], [of.x, of.z]] : []);
      let worst = 0, at = '', step = 0, shut = 0, shutAt = '', pts = 0, prev = null;
      for (let k = 0; k < path.length - 1; k++) { const [u0, z0] = path[k], [u1, z1] = path[k + 1]; const len = Math.hypot(u1 - u0, z1 - z0), m = Math.max(1, Math.round(len / 0.02));
        for (let j = 0; j <= m; j++) { const u = u0 + (u1 - u0) * j / m, z = z0 + (z1 - z0) * j / m; const X = b.x * TL + u, Z = b.y * TL + z; const ins = Sp.indoor(X, Z, 0, b.id);
          const foot = ins ? ins.y : Math.max(Sp.footAt(X / TL, Z / TL), Sp.stepTop(X, Z)); pts++;
          if (ins && !ins.walk) { shut++; if (!shutAt) shutAt = `(${u.toFixed(2)}, ${z.toFixed(2)})`; }
          if (prev !== null) step = Math.max(step, Math.abs(foot - prev)); prev = foot;
          const w = want(u, z); if (u > T[0] && u < T[2] && z > T[1] && z < T[3]) { const d = foot - (pl.hi + top + Sp.FLOOR_UP); if (Math.abs(d) > 0.03 && Math.abs(d) > Math.abs(worst)) { worst = d; at = `(${u.toFixed(2)}, ${z.toFixed(2)})`; } } else if (w > 0 && foot > pl.hi + w + 0.03) { worst = foot - pl.hi - w; at = `(${u.toFixed(2)}, ${z.toFixed(2)}) nos degraus`; } } }
      if (worst || step > In.BODY.step + 0.01) out.push(`${st}: os pés a ${worst.toFixed(2)} m da forma em ${at || '—'}, o maior degrau ${step.toFixed(2)} m`);
      if (shut) out.push(`${st}: ${shut} pontos do caminho onde o corpo não passa (o primeiro ${shutAt})`);
      said.push(`${st}: ${pts} pontos, o maior degrau ${step.toFixed(2)} m`);
    }
    ok('M3 os pés no grande monumento: da rua pelos degraus ao alto, em volta do que está no meio, até o lugar de ofertar; no navio de pedras, pelo gramado e pelo meio aberto do navio', !out.length, out.slice(0, 3).join(' · ') || said.join(' · '));
  }
  // ---------------------------------------------------------------- M4 the world: the god's hand in a town of each people
  // (each people in the ready world that has a town of it, the metrópole first: mundoDe, T-604)
  {
    const out = [], said = [];
    const bad = what => { const q = globalThis.QA.check().filter(x => x.sev <= 2 || x.sys === 'monumental' || x.sys === 'escala'); if (q.length) out.push(`${what}: ${q.slice(0, 2).map(x => `${x.sys} S${x.sev} ${x.msg.slice(0, 90)}`).join(' · ')}`); };
    const { grupos, sem } = porMundo(MPEOPLES); let eg = null;
    for (const st of sem) if (st === 'classico') said.push('o povo clássico sem cidade em mundo pronto nenhum (T-401)'); else out.push(`sem cidade ${st} em mundo pronto nenhum`);
    for (const [w, sts] of grupos) {
      M.pronto(w); bad('antes'); const built = [];
      // (each town by the game's rule — handFor, T-505 —, never the biggest by its numbers alone)
      for (const st of sts) { const hf = handFor(st, 'monument', 'grande'), set = hf.set;
        const b = hf.b; if (!b) { out.push(`a mão do deus não achou nem abriu lote de 4 casas para o povo ${st} (${set.name})`); continue; }
        const p = In.plan(b); if (!p || !p.ok || b.w !== 4 || b.esc !== 'grande' || b.style !== st) out.push(`${set.name}: ${b.style} ${b.w} casas esc=${b.esc}, a planta ${p && p.ok}`);
        const fal = p && p.ok ? In.report(b, p, { world: true, sides: true }).filter(q => q.k === 'FALHA') : []; if (fal.length) out.push(`${set.name} no mundo: ${fal.map(q => q.what).join('; ')}`);
        built.push({ b, set, sig: p && p.sig, gone: hf.gone }); }
      bad('de pé'); M.viver(5); bad('vivendo');
      M.salvarCarregar(); for (const q of built) { const b2 = G.S.buildings.get(q.b.id), p2 = b2 && In.plan(b2); if (!p2 || p2.sig !== q.sig) out.push(`${q.set.name}: depois do save, outra planta`); } bad('carregado');
      // (the checker: the top of the Egyptian's a metre off the form's)
      const e0 = built.find(q => q.b.style === 'egipcio'); if (e0) { eg = e0; const b2 = G.S.buildings.get(e0.b.id), plan0 = In.plan; let hit = [];
        In.plan = x => { const q = plan0(x); return x === b2 && q ? Object.assign({}, q, { levels: q.levels.map(l => (l.lv === 0 ? Object.assign({}, l, { y: l.y + 1 }) : l)) }) : q; };
        try { hit = globalThis.QA.check().filter(q => q.sys === 'monumental'); } finally { In.plan = plan0; } if (!hit.some(q => q.sev === 1 && q.msg.includes('monumento'))) out.push('com o alto noutra altura o verificador calou'); bad('de volta'); }
      G.inSim++; try { for (const q of built) G.Village.damageBuilding(G.S.buildings.get(q.b.id), 1e6, 'quake'); } finally { G.inSim--; }
      bad('derrubados'); M.viver(1); bad('as ruínas vivendo');
      for (const q of built) said.push(`${q.set.name} (${q.b.style}): #${q.b.id}${goneTxt(q)}${ondeTxt(w, q.b.style)}`);
    }
    if (!eg) out.push('sem o monumento egípcio, o verificador sem prova');
    if (!M.limpo()) { const e = M.erros(); out.push(`erros: ${JSON.stringify(e.mod)} ${e.console.slice(0, 2).join(' | ')}`); }
    ok('M4 o grande monumento pela mão do deus em uma cidade de cada povo (a metrópole): de pé, vivendo, salvo e carregado, o verificador, derrubado', !out.length, out.slice(0, 3).join(' · ') || `${said.join(' · ')}; vivos, salvos e carregados (a mesma planta), o verificador pega o alto noutra altura, derrubados: limpo`);
  }
  // ---------------------------------------------------------------- M5 the places' table
  {
    const out = [], said = [];
    for (const st of MPEOPLES) { const uses = ['ofertar', 'rezar'].concat(st === 'asteca' ? ['acender'] : []), o = placesOf(st, n, uses, 'monument'); if (o.err) { out.push(`${st}: ${o.err}`); continue; }
      const none = uses.filter(u => !o.free[u]); if (!o.ok || none.length || o.dt > 400) out.push(`${st}: a tabela ${o.ok ? 'feita' : 'não feita'} em ${o.dt.toFixed(0)} ms${none.length ? `, sem lugar livre de ${none.join(', ')}` : ''}`);
      said.push(`${st}: ${o.spots} lugares em ${o.dt.toFixed(0)} ms`); }
    ok('M5 os lugares do grande monumento (In.places, a tabela da planta): feita a tempo, um lugar livre de cada uso', !out.length, out.slice(0, 3).join(' · ') || said.join(' · '));
  }
}

// =========================================================================================== W and T — the other peoples
// (the feet along legs of a path — [storey, [[u, z]…]] in the lot's metres, the street on S — every 2 cm, by Space.indoor: the
// biggest step, the points where the body does not pass — a shut door's opening it passes, opening it —, and the worst gap to
// the floor of the form there — floor(lv, u, z): [y, how far under it the feet may be — a flight's treads, walked as the plan's
// slope —] or null: not asked there)
function feetAlong(b, legs, floor) {
  const TL = Sp.TILE, pl = Sp.plinth(b); let worst = 0, at = '', step = 0, shut = 0, shutAt = '', pts = 0;
  for (const [lv, path] of legs) { let prev = null;
    for (let k = 0; k < path.length - 1; k++) { const [u0, z0] = path[k], [u1, z1] = path[k + 1]; const m = Math.max(1, Math.round(Math.hypot(u1 - u0, z1 - z0) / 0.02));
      for (let j = 0; j <= m; j++) { const u = u0 + (u1 - u0) * j / m, z = z0 + (z1 - z0) * j / m; const X = b.x * TL + u, Z = b.y * TL + z; const ins = Sp.indoor(X, Z, lv, b.id);
        const foot = ins ? ins.y : Math.max(Sp.footAt(X / TL, Z / TL), Sp.stepTop(X, Z)); pts++;
        if (ins && !ins.walk && !(ins.door >= 0)) { shut++; if (!shutAt) shutAt = `(${u.toFixed(2)}, ${z.toFixed(2)}) piso ${lv}`; }
        if (prev !== null) step = Math.max(step, Math.abs(foot - prev)); prev = foot;
        const f = ins ? floor(lv, u, z) : null; if (!f) continue; const d = foot - (pl.hi + f[0] + Sp.FLOOR_UP);
        if ((d > 0.03 || d < -0.03 - f[1]) && Math.abs(d) > Math.abs(worst)) { worst = d; at = `(${u.toFixed(2)}, ${z.toFixed(2)}) piso ${lv}`; } } } }
  return { worst, at, step, shut, shutAt, pts };
}
// (a building of the blank world — its lot cleared, the others thrown out —, its plan made: { b, p })
function standAlone(S, type, st, n, id) {
  const def = G.BDEF[type]; const b = { id, type, style: st, esc: stepOf(type, n), x: 12, y: 12, w: n, h: n, built: true, progress: 1, hp: def.hp || 100, maxHp: def.hp || 100, v: 0, set: 0, blocks: true, ip: null };
  for (const o of [...S.buildings.values()]) { for (let yy = o.y; yy < o.y + o.h; yy++) for (let xx = o.x; xx < o.x + o.w; xx++) S.occ[yy * G.N + xx] = 0; S.buildings.delete(o.id); }
  S.buildings.set(b.id, b); for (let yy = b.y; yy < b.y + b.h; yy++) for (let xx = b.x; xx < b.x + b.w; xx++) S.occ[yy * G.N + xx] = b.id;
  b.ip = In.newRecord(b, { t: type, c: st, e: 3, k: 'ae', cl: 't', fl: 0, d: 1, w: 1, pw: 0, s: 'S', o: (1 << n) - 1, n });
  return { b, p: Sp.planNow(b) };
}
// (the places of a use a plan has on a storey: its marks the body takes and the spots of its pieces)
const usesOn = (p, lv, use) => marksOk(p, use, lv) + (p.items || []).filter(i => i.lv === lv).reduce((n, i) => n + i.spots.filter(q => q.use === use).length, 0);
// (a form's treads — the steps of its own (degrau) — each a body's: the most any rises over the one before it, or over its foot)
const treadRise = F => { let r = 0, prev = 0; for (const e of F.els.filter(q => q.k === 'bloco' && q.degrau === 1).sort((a, b) => a.y1 - b.y1)) { r = Math.max(r, e.y1 - Math.max(e.y0, prev)); prev = e.y1; } return r; };
// (a form's flight: each tread a body's step, and its slope as the plan's classes have it — degrees)
const flightOf = e => { const q = Fo.flight(e); let r = 0, prev = e.a[2]; for (const t of q.slice().sort((a, b) => a.y1 - b.y1)) { r = Math.max(r, t.y1 - prev); prev = t.y1; } return { rise: r, deg: Math.atan2(Math.abs(e.b[2] - e.a[2]), Math.hypot(e.b[0] - e.a[0], e.b[1] - e.a[1])) * 180 / Math.PI }; };
// (the parapet of a top T at y: the form's blocks 0.9 m high on its edge — their length along it)
const parapetLen = (F, T, y) => F.els.filter(e => e.k === 'bloco' && Math.abs(e.y0 - y) < 0.01 && Math.abs(e.y1 - e.y0 - 0.9) < 0.01 && (e.r[0] <= T[0] + 0.01 || e.r[2] >= T[2] - 0.01 || e.r[1] <= T[1] + 0.01 || e.r[3] >= T[3] - 0.01)).reduce((n, e) => n + Math.max(e.r[2] - e.r[0], e.r[3] - e.r[1]), 0);
// (the god's hand for a people in the ready world, by the game's rule and never a town by its name — in the metrópole of the
// generation 15 there was no lot of 10 by Tebas nor by Birka, and the one left in the whole world, by Roma, served one people
// of two, T-505 —: its towns in the order its wonder looks for them (V.startProject, D-121), the capitals first and then the
// most peopled, the first where the hand (V.handFound, within R) finds its lot. With none, the place the proof opens with the
// game's doors: by the first of those towns, of the lots within R whose ground the hand takes — dry, the ring too, no wall, no
// highway nor fire on the lot: V.handFound's rule —, the one with the fewest buildings on it and on its ring, the nearest of
// those (the hand's order: the plain ones first, ring by ring from the town's middle), never one with a cemetery (the god's
// blows never take one, V.damageBuilding); each falls as under the god's meteor (V.destroyBuilding) and its ruin is cleared as
// its own end clears it (V.removeBuilding), the hand founds there, and the world takes the blow in (3 s: the prisoners of a
// jail that fell go free within 2). → { set, b, steps (the town's for the type, before it), gone (what fell for it) | null };
// set null: the people has no town)
function handFor(style, type, esc, R) {
  const S = G.S, V = G.Village, N = G.N, T = G.T; R = R || 60; const n = G.Escala.steps(type).find(q => q.id === esc).n, h = Math.floor(n / 2);
  const caps = new Set(G.Fac.all().filter(f => f.alive).map(f => G.Fac.capitalOf(f.id)).filter(Boolean).map(s => s.id));
  const towns = [...S.settlements.values()].filter(s => G.Fac.get(s.fac) && G.Civ.idOfFac(s.fac) === style)
    .sort((a, c) => (caps.has(c.id) ? 1 : 0) - (caps.has(a.id) ? 1 : 0) || V.pop(c.id) - V.pop(a.id) || a.id - c.id);
  const sim = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
  const stepsOf = set => G.Escala.choose(set, type).map(q => q.id);
  for (const set of towns) { const steps = stepsOf(set); const b = sim(() => V.handFound(set, type, esc, { built: true, R })); if (b) return { set, b, steps, gone: null }; }
  // (the ground the hand takes, but for what stands on it → the buildings on the lot and on its ring, or null)
  const ground = (x, y) => { const on = new Map();
    for (let ty = y - 1; ty <= y + n; ty++) for (let tx = x - 1; tx <= x + n; tx++) {
      if (tx < 2 || ty < 2 || tx >= N - 2 || ty >= N - 2) return null; const i = ty * N + tx;
      if (S.wall[i] || S.type[i] < T.SAND) return null;
      if (tx >= x && tx < x + n && ty >= y && ty < y + n && (S.road[i] >= 2 || S.fire[i] > 0)) return null;
      const o = S.occ[i] ? S.buildings.get(S.occ[i]) : null; if (o) { if (o.type === 'cemetery') return null; on.set(o.id, o); } }
    return [...on.values()]; };
  const plain = (x, y) => { if (G.W.slope(x, y, n, n) > V.PODIUM) return false;
    for (let ty = y - 1; ty <= y + n; ty++) for (let tx = x - 1; tx <= x + n; tx++) if ((ty < y || ty >= y + n || tx < x || tx >= x + n) && S.cliff[ty * N + tx]) return false; return true; };
  for (const set of towns) {
    const ox = Math.floor(set.cx), oy = Math.floor(set.cy); let best = null;
    for (const pass of [plain, null]) for (let r = 0; r <= R; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const x = ox + dx - h, y = oy + dy - h;
      const on = ground(x, y); if (!on || (best && on.length >= best.on.length) || (pass && !pass(x, y))) continue; best = { x, y, on }; }
    if (!best) continue;
    const steps = stepsOf(set), gone = best.on.map(o => o.type);
    sim(() => { for (const o of best.on) { if (S.buildings.has(o.id) && o.type !== 'ruin') V.destroyBuilding(o, 'meteor'); if (S.buildings.has(o.id)) V.removeBuilding(o); } });
    // (at once, before a town's planner takes the cleared ground; R 0.5: the hand reads a radius of 0 as none given, and would
    // look 40 round the point — T-435)
    const b = sim(() => V.handFound(set, type, esc, { x: best.x + h, y: best.y + h, R: 0.5, built: true }));
    M.viver(3);
    return { set, b, steps, gone };
  }
  return { set: towns[0] || null, b: null, steps: towns[0] ? stepsOf(towns[0]) : [], gone: null };
}
// (what the place opened for a building cost, for the proofs' lines)
const goneTxt = h => (h.gone ? ` — o lugar aberto pela prova: ${h.gone.length} prédio${h.gone.length > 1 ? 's' : ''} derrubado${h.gone.length > 1 ? 's' : ''} (${[...new Set(h.gone)].join(', ')})` : '');
// (the ready world a people's test of the god's hand opens: the metrópole, where the people has a living town; else the first of
// the other ready worlds that has one, said on the line — in the metrópole of the generation 18 the Aztec people was gone and
// Tenochtitlan a Norse town, T-604 —; null in none. Each world opened once a run to see whose towns it has)
const MUNDOS = ['metropole', 'cidade', 'mega', 'mundial'], povosDe = {};
function mundoDe(style) {
  for (const w of MUNDOS) {
    if (!povosDe[w]) { M.pronto(w); povosDe[w] = new Set([...G.S.settlements.values()].filter(s => G.Fac.get(s.fac)).map(s => G.Civ.idOfFac(s.fac))); }
    if (povosDe[w].has(style)) return w;
  }
  return null;
}
// (the peoples by the world their test opens, the metrópole first: { grupos: [[world, peoples]…], sem: the peoples in none })
function porMundo(peoples) {
  const by = new Map(), sem = [];
  for (const st of peoples) { const w = mundoDe(st); if (!w) { sem.push(st); continue; } if (!by.has(w)) by.set(w, []); by.get(w).push(st); }
  return { grupos: [...by.entries()].sort((a, b) => MUNDOS.indexOf(a[0]) - MUNDOS.indexOf(b[0])), sem };
}
// (where a people's test ran, for its line: nothing for the metrópole)
const ondeTxt = (w, st) => (w === 'metropole' ? '' : ` — no mundo pronto «${w}»: o povo ${st} sem cidade na metrópole`);
// (a world test of the god's hand: in the ready metropolis — or, for a people with no town in it, the ready world that has one:
// mundoDe —, a step of a type in a town of each people by the game's rule — handFor —, the people no longer founding the old
// one; standing, living, saved and loaded (the same plan), the checker catching each one's floor a metre off the form's and quiet
// again, thrown down → [out, said])
function handWorld(type, esc, peoples) {
  const out = [], said = [];
  const bad = what => { const q = globalThis.QA.check().filter(x => x.sev <= 2 || x.sys === 'monumental' || x.sys === 'escala'); if (q.length) out.push(`${what}: ${q.slice(0, 2).map(x => `${x.sys} S${x.sev} ${x.msg.slice(0, 90)}`).join(' · ')}`); };
  const n = G.Escala.steps(type).find(q => q.id === esc).n; const { grupos, sem } = porMundo(peoples);
  for (const st of sem) said.push(`${st}: sem cidade em mundo pronto nenhum`);
  for (const [w, sts] of grupos) {
    M.pronto(w); bad('antes'); const built = [];
    for (const st of sts) { const hf = handFor(st, type, esc), set = hf.set;
      const ids = hf.steps; if (ids.some(id => (G.Escala.steps(type).find(q => q.id === id) || {}).legado)) out.push(`${set.name} (${st}): os degraus ${ids.join(', ')} — o antigo ainda`);
      const b = hf.b; if (!b) { out.push(`a mão do deus não achou nem abriu lote de ${n} casas para o povo ${st} (${set.name})`); continue; }
      const p = In.plan(b); if (!p || !p.ok || b.w !== n || b.style !== st) out.push(`${set.name}: ${b.style} ${b.w} casas, a planta ${p && p.ok}`);
      const fal = p && p.ok ? In.report(b, p, { world: true, sides: true }).filter(q => q.k === 'FALHA') : []; if (fal.length) out.push(`${set.name} no mundo: ${fal.map(q => q.what).join('; ')}`);
      built.push({ b, set, sig: p && p.sig, gone: hf.gone }); }
    bad('de pé'); M.viver(5); bad('vivendo');
    M.salvarCarregar(); for (const q of built) { const b2 = G.S.buildings.get(q.b.id), p2 = b2 && In.plan(b2); if (!p2 || p2.sig !== q.sig) out.push(`${q.set.name}: depois do save, outra planta`); } bad('carregado');
    for (const q of built) { const b2 = G.S.buildings.get(q.b.id), plan0 = In.plan; let hit = [];
      In.plan = x => { const r = plan0(x); return x === b2 && r ? Object.assign({}, r, { levels: r.levels.map(l => Object.assign({}, l, { y: l.y + 1 })) }) : r; };
      try { hit = globalThis.QA.check().filter(x => x.sys === 'monumental'); } finally { In.plan = plan0; } if (!hit.some(x => x.sev === 1 && x.msg.includes('#' + q.b.id))) out.push(`${q.set.name}: com o piso noutra altura o verificador calou`); }
    bad('de volta');
    G.inSim++; try { for (const q of built) G.Village.damageBuilding(G.S.buildings.get(q.b.id), 1e6, 'quake'); } finally { G.inSim--; }
    bad('derrubados'); M.viver(1); bad('as ruínas vivendo');
    for (const q of built) said.push(`${q.set.name} (${q.b.style}): #${q.b.id} a ${G.dist(q.b.x + q.b.w / 2, q.b.y + q.b.h / 2, q.set.cx, q.set.cy).toFixed(1)} casas do centro${goneTxt(q)}${ondeTxt(w, q.b.style)}`);
  }
  if (!M.limpo()) { const e = M.erros(); out.push(`erros: ${JSON.stringify(e.mod)} ${e.console.slice(0, 2).join(' | ')}`); }
  return [out, said];
}

const WPEOPLES = ['nordico', 'grego', 'classico'], WKEY = { nordico: 'salao', grego: 'acropole', classico: 'zigurate' };
const WUSES = { nordico: [[0, 'sentar', 16], [0, 'atuar', 1], [0, 'comer', 8]], grego: [[1, 'rezar', 4], [0, 'ofertar', 2], [0, 'topo', 3]], classico: [[1, 'oficiar', 1], [1, 'rezar', 4], [1, 'acender', 2], [1, 'topo', 3], [0, 'assistir', 6]] };
function testeW() {
  blank(); const plans = {};
  // ---------------------------------------------------------------- W1 the forms
  {
    const out = [], said = [];
    for (const st of WPEOPLES) for (const n of SIZES) {
      const tag = `${st} n ${n}`; const F = Fo.has('maravilha', st, n) && Fo.of('maravilha', st, n); const A = F && F.amphi && F.amphi[WKEY[st]]; if (!A) { out.push(`${tag}: sem a forma`); continue; }
      if (Fo.of('maravilha', st, n) !== F) out.push(`${tag}: a forma não é a mesma para todo prédio do degrau`);
      if (F.L !== n * 4) out.push(`${tag}: o lote de ${F.L} m`);
      const rr = treadRise(F); if (rr > In.BODY.step + 1e-6) out.push(`${tag}: um degrau de ${rr.toFixed(2)} m`);
      const fl = F.els.filter(e => e.k === 'escada').map(flightOf); for (const f of fl) if (f.rise > In.BODY.step + 1e-6 || f.deg > 50) out.push(`${tag}: a escada a ${f.deg.toFixed(1)}°, o degrau de ${f.rise.toFixed(2)} m`);
      if (st === 'nordico') {
        // (the hall: its body — the walls, the base, the treads —, the door ≥ 2.2 m, the posts inside before the roof: hidden)
        const B = Fo.body(F), ti = F.els.findIndex(e => e.k === 'telhado'), posts = F.els.map((e, k) => [e, k]).filter(([e]) => e.k === 'tora');
        if (!B || !B.porta || B.porta.y1 - B.porta.y0 < 2.2 || B.porta.w < 0.9) { out.push(`${tag}: a porta do salão ${B && B.porta ? `${B.porta.w} × ${(B.porta.y1 - B.porta.y0).toFixed(1)} m` : '—'}`); continue; }
        if (!posts.length || posts.some(([e, k]) => !e.oculto || k > ti)) out.push(`${tag}: os postes do salão fora de ordem ou à mostra (${posts.length})`);
        said.push(`${tag}: o salão de ${(A.r[2] - A.r[0]).toFixed(0)} × ${(A.r[3] - A.r[1]).toFixed(0)} m, ${posts.length} postes, a porta de ${(B.porta.y1 - B.porta.y0).toFixed(1)} m`);
      } else if (st === 'grego') {
        // (the rock's top and its parapet; the middle bay of the temple's front, ≥ 1.2 m between the bases; the cella's door)
        const pl = parapetLen(F, A.top, A.zr), per = 2 * (A.top[2] - A.top[0] + A.top[3] - A.top[1]) - A.sw;
        if (pl < per - 1.0) out.push(`${tag}: o parapeito de ${pl.toFixed(1)} m numa borda de ${per.toFixed(1)} m`);
        const vf = Math.max(...A.cols.map(c => c[1])), front = A.cols.filter(c => Math.abs(c[1] - vf) < 1e-6).map(c => c[0]).sort((a, b) => a - b), base = F.els.find(e => e.k === 'colunata').r * Fo.COLUMN_BASE;
        let bay = 0; for (let k = 1; k < front.length; k++) if (front[k - 1] < A.cu && front[k] > A.cu) bay = front[k] - front[k - 1] - base;
        if (bay < 1.2) out.push(`${tag}: o vão do meio da frente do templo de ${bay.toFixed(2)} m entre as bases`);
        if (A.door[2] < 2.2 || A.door[1] < 0.9) out.push(`${tag}: a porta da cela de ${A.door[1]} × ${A.door[2]} m`);
        said.push(`${tag}: a rocha de ${A.zr} m, a escada a ${fl[0].deg.toFixed(1)}°, o parapeito de ${pl.toFixed(1)} m, ${A.cols.length} colunas, o vão do meio de ${bay.toFixed(2)} m, a cela de ${(A.cella[2] - A.cella[0]).toFixed(1)} × ${(A.cella[3] - A.cella[1]).toFixed(1)} m`);
      } else {
        // (four levels — the fourth a block over the terrace —, the parapet round the terrace, the braziers, the eye)
        const lv = F.els.find(e => e.k === 'escalonada'), Q = F.els.find(e => e.k === 'bloco' && Math.abs(e.y0 - A.yt) < 0.01 && e.r[0] === A.quarto[0]);
        const pl = parapetLen(F, A.top, A.yt), per = 2 * (A.top[2] - A.top[0] + A.top[3] - A.top[1]) - A.sw;
        if (!lv || lv.niveis.length !== 3 || !Q || pl < per - 1.0 || Fo.uses(F).filter(u => u.uso === 'acender').length < 2 || !F.els.some(e => e.k === 'disco' && e.olho)) out.push(`${tag}: os níveis ${lv ? lv.niveis.length : 0} + ${Q ? 1 : 0}, o parapeito de ${pl.toFixed(1)} m em ${per.toFixed(1)}, os braseiros, o olho`);
        said.push(`${tag}: o terraço a ${A.yt} m, ${F.top.toFixed(1)} m de altura, a escada a ${fl[0].deg.toFixed(1)}°, o parapeito de ${pl.toFixed(1)} m`);
      }
    }
    ok('W1 as formas das maravilhas que faltavam (10 e 13 casas): Valhala, a Acrópole, o zigurate — o lote, os degraus e as escadas do corpo, os parapeitos, as portas, o vão do meio do templo, a mesma forma para todo prédio do degrau', !out.length, out.slice(0, 4).join(' · ') || said.join(' · '));
  }
  // ---------------------------------------------------------------- W2 the plans
  {
    const out = [], said = [], times = []; let nid = 66001;
    for (const st of WPEOPLES) for (const n of SIZES) for (const s of SIDES) {
      const tag = `${st} n ${n} ${s}`; const r = wonderPlan(st, n, s, (nid += 37)); plans[st + n + s] = r; const { b, p, dt } = r; times.push(dt);
      if (!p || !p.ok) { out.push(`${tag}: não se arma (${p ? p.errs.slice(0, 2).join('; ') : '—'})`); continue; }
      G.S.buildings.set(b.id, b);
      const fal = In.report(b, p, { rec: b.ip }).filter(q => q.k === 'FALHA'); if (fal.length) out.push(`${tag}: ${fal.slice(0, 2).map(q => q.what).join('; ')}`);
      const lost = p.rooms.filter(m => !roomReached(p, m)); if (lost.length) out.push(`${tag}: ${lost.length} cômodos que a porta não alcança (${lost.slice(0, 2).map(m => m.fn).join(', ')})`);
      const miss = WUSES[st].filter(([lv, use, min]) => usesOn(p, lv, use) < min); if (miss.length) out.push(`${tag}: ${miss.map(([lv, use, min]) => `${usesOn(p, lv, use)} de ${use} no piso ${lv} (${min})`).join(', ')}`);
      if (s === 'S') said.push(`${st} n ${n}: ${p.levels.length} pisos, ${p.rooms.length} cômodos, ${WUSES[st].map(([lv, use]) => `${usesOn(p, lv, use)} ${use}`).join(', ')}`);
    }
    const tmax = Math.max(...times); if (tmax > 400) out.push(`a planta levou ${tmax.toFixed(0)} ms (o alvo: 400)`);
    ok('W2 as plantas das maravilhas que faltavam: nos quatro lados e nos dois tamanhos, sem falha, todo cômodo alcançado, os lugares de cada uma (os bancos, as mesas e o escaldo; a prece na cela e a oferta no alto; o sacerdote, a prece e os braseiros no terraço), o tempo', !out.length, out.slice(0, 4).join(' · ') || `${said.join(' · ')}; a maior em ${tmax.toFixed(0)} ms`);
  }
  // ---------------------------------------------------------------- W3 the form × the plan
  {
    const out = [], said = []; const CELL = In.CELL;
    for (const st of WPEOPLES) for (const n of SIZES) {
      const { p } = plans[st + n + 'S']; if (!p || !p.ok) continue; const F = Fo.of('maravilha', st, n), A = F.amphi[WKEY[st]], N = p.grid.n; const tag = `${st} n ${n}`;
      const want = st === 'nordico' ? [[0, A.yb]] : st === 'grego' ? [[0, A.zr], [1, A.ys]] : [[0, F.els.find(e => e.piso).y1], [1, A.yt]];
      for (const [lv, y] of want) { const l = p.levels.find(q => q.lv === lv); if (!l || Math.abs(l.y - y) > 1e-6) out.push(`${tag}: o piso ${lv} a ${l ? l.y : '—'} m, o da forma a ${y} m`); }
      // (the plan's parapets on the form's, the cella's walls on the form's — their door in its opening —; no floor in a column's base)
      let off = 0, offAt = '', walls = 0;
      for (const w of p.walls) { const lb = w.kind === 'parapeito' ? (st === 'grego' ? 0 : 1) : (st === 'grego' && w.kind === 'parede' ? 1 : -1); if (lb < 0 || w.lv !== lb) continue; walls++;
        const yb = lb === 0 ? A.zr : st === 'grego' ? A.ys : A.yt, hh = w.kind === 'parapeito' ? 0.85 : 4.0; const L2 = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]); const hs = p.holes.filter(h => h.wall === w.id);
        for (let k = 0.1; k < L2 - 0.1; k += 0.25) { if (hs.some(h => Math.abs(k - h.at) < h.w / 2 + 0.1)) continue; const x = w.a[0] + (w.b[0] - w.a[0]) * k / L2, z = w.a[1] + (w.b[1] - w.a[1]) * k / L2;
          if (!F.els.some(e => e.k === 'bloco' && !e.degrau && e.y0 <= yb + 0.01 && e.y1 >= yb + hh && x > e.r[0] - 0.02 && x < e.r[2] + 0.02 && z > e.r[1] - 0.02 && z < e.r[3] + 0.02)) { off++; if (!offAt) offAt = `(${x.toFixed(2)}, ${z.toFixed(2)})`; } } }
      if (off) out.push(`${tag}: ${off} pontos das paredes da planta fora das da forma (o primeiro ${offAt})`);
      // (a cell whose middle is on a base's edge — within the plan's centimetre — is the floor's: the body's feet at the edge)
      let inBase = 0; for (const e of F.els) { if (e.k !== 'colunata') continue; const g = p.grid.lv[1], h = e.r * Fo.COLUMN_BASE / 2 - 0.005;
        for (const [cx, cz] of e.pts) for (let z = Math.floor((cz - h) / CS); z <= Math.floor((cz + h) / CS); z++) for (let x = Math.floor((cx - h) / CS); x <= Math.floor((cx + h) / CS); x++) { const mx = (x + 0.5) * CS, mz = (z + 0.5) * CS; if (Math.abs(mx - cx) < h && Math.abs(mz - cz) < h && g[z * N + x] === CELL.FLOOR) inBase++; } }
      if (inBase) out.push(`${tag}: ${inBase} casinhas de chão na base de uma coluna`);
      said.push(`${tag}: os pisos a ${want.map(q => q[1]).join(' e ')} m, ${walls} paredes da planta nas da forma${st === 'grego' ? ', nenhuma casinha de chão na base de uma coluna' : ''}`);
    }
    ok('W3 a forma × a planta das maravilhas que faltavam: os pisos na altura da forma, os parapeitos e as paredes da cela da planta nos da forma, nenhum chão na base de uma coluna', !out.length, out.slice(0, 4).join(' · ') || said.join(' · '));
  }
  // ---------------------------------------------------------------- W4 the feet, on a blank world
  {
    const S = G.newState(7); S.H.fill(4); S.type.fill(G.T.GRASS); if (S.biome) S.biome.fill(0); S.clock = 0; S.day = 30; S.time = 0.3; G.S = S; G.newWorld();
    const out = [], said = [];
    for (const st of WPEOPLES) for (const n of SIZES) {
      const tag = `${st} n ${n}`; const { b, p } = standAlone(S, 'maravilha', st, n, 96001 + 20 * WPEOPLES.indexOf(st) + n); if (!p || !p.ok) { out.push(`${tag}: sem planta`); continue; }
      const F = Fo.of('maravilha', st, n), A = F.amphi[WKEY[st]], L = F.L; let legs, floor;
      const flight = F.els.find(e => e.k === 'escada'), treads = flight ? Fo.flight(flight) : [];
      // (the top of the highest tread under a point — a hair either side: the plan's are rounded to the centimetre, and at a
      // tread's edge the next one's is the feet's)
      const top = (list, u, z) => { let y = null; for (const q of list) if (u >= q.r[0] - 0.01 && u <= q.r[2] + 0.01 && z >= q.r[1] - 0.01 && z <= q.r[3] + 0.01 && (y === null || q.y1 > y)) y = q.y1; return y; };
      const onTread = (u, z) => top(treads, u, z);
      // (within a hair of a tread's edge across the way up — the plan's rounded to the centimetre —, a step under it too: elsewhere
      // the feet on each tread, as the form draws it, L-665)
      const edgeV = (list, z) => list.some(q => Math.abs(z - q.r[1]) <= 0.011 || Math.abs(z - q.r[3]) <= 0.011);
      if (st === 'nordico') {
        // (from the street up the treads, in by the door, along the nave between the posts — past the hearths — to its ends)
        const R = A.r, steps = F.els.filter(e => e.degrau);
        legs = [[0, [[A.cu, L + 0.8], [A.cu, R[3] - 0.6], [A.cu, A.cv + 1.2], [R[2] - 2.0, A.cv + 1.2], [R[0] + 2.0, A.cv + 1.2]]]];
        floor = (lv, u, z) => { if (u > R[0] && u < R[2] && z > R[1] && z < R[3]) return [A.yb, 0]; const t = top(steps, u, z); return t === null ? null : [t, edgeV(steps, z) ? 0.3 : 0]; };
      } else if (st === 'grego') {
        // (up the great stair to the rock's top, between the altar and Promachos to the temple's steps, up between the middle
        // columns, through the pronaos and the cella's door to the place of prayer; round the left side of the colonnade)
        const T = A.top, S0 = A.stylo, C = A.cella, pv = A.ped[3] + 1.4;
        const lw = (S0[0] + 0.6 + F.els.find(e => e.k === 'colunata').r * Fo.COLUMN_BASE / 2 + C[0]) / 2, fw = (C[3] + S0[3] - 0.6) / 2;
        // (and up the temple's two steps between the middle columns, on each: the krepis' and the stylobate's blocks, or the rock's
        // top before them — L-665)
        const kr = F.els.filter(e => e.k === 'bloco' && e.degrau), kf = [A.cu - 0.6, S0[3], A.cu + 0.6, S0[3] + 2 * A.krepis];
        legs = [[0, [[A.cu - 1.5, L + 0.8], [A.cu - 1.5, T[3] - 1.0], [A.cu, T[3] - 1.0], [A.cu, S0[3] + 0.02]]], [1, [[A.cu, S0[3] - 0.1], [A.cu, fw], [A.cu, pv], [A.cu, fw], [lw, fw], [lw, (C[1] + C[3]) / 2]]]];
        floor = (lv, u, z) => { if (lv === 1) return [A.ys, 0];
          if (u >= kf[0] && u <= kf[2] && z >= kf[1] && z <= kf[3]) { const t = top(kr, u, z); return [t === null ? A.zr : t, edgeV(kr, z) ? 0.3 : 0]; }
          const ty = onTread(u, z); if (ty !== null && z > T[3]) return [ty, edgeV(treads, z) ? 0.3 : 0]; if (u > T[0] && u < T[2] && z > T[1] && z < T[3] && z > S0[3] + 1.05) return [A.zr, 0]; return null; };
      } else {
        // (across the court, up the stair to the terrace, before the eye to the priest's place, round the left side to the back)
        const T = A.top, Q = A.quarto, yq = F.els.find(e => e.piso).y1;
        legs = [[0, [[A.cu - 3.5, L + 0.8], [A.cu - 3.5, L - 0.6], [A.cu - 1.0, L - 0.6], [A.cu - 1.0, A.stair.top + 0.05]]], [1, [[A.cu - 1.0, T[3] - 0.3], [A.cu - 1.0, Q[3] + 0.6], [(T[0] + Q[0]) / 2, Q[3] + 0.6], [(T[0] + Q[0]) / 2, (T[1] + Q[1]) / 2], [A.cu, (T[1] + Q[1]) / 2]]]];
        floor = (lv, u, z) => { if (lv === 1) return [A.yt, 0]; const ty = onTread(u, z); if (ty !== null) return [ty, edgeV(treads, z) ? 0.3 : 0]; if (z > A.cv + A.e0 && z < L - 0.1) return [yq, 0]; return null; };
      }
      const r = feetAlong(b, legs, floor);
      if (r.worst || r.step > In.BODY.step + 0.01) out.push(`${tag}: os pés a ${r.worst.toFixed(2)} m da forma em ${r.at || '—'}, o maior degrau ${r.step.toFixed(2)} m`);
      if (r.shut) out.push(`${tag}: ${r.shut} pontos do caminho onde o corpo não passa (o primeiro ${r.shutAt})`);
      said.push(`${tag}: ${r.pts} pontos, o maior degrau ${r.step.toFixed(2)} m`);
    }
    ok('W4 os pés nas maravilhas que faltavam: em Valhala pelos degraus e pela porta ao longo da nave; na Acrópole pela grande escada, entre as colunas do meio, pela cela à prece e em volta da colunata; no zigurate pela praça e pela escada ao terraço, diante do olho e em volta', !out.length, out.slice(0, 3).join(' · ') || said.join(' · '));
  }
  // ---------------------------------------------------------------- W5 the world: the god's hand in a town of each people
  {
    const pre = []; for (const st of WPEOPLES) for (const n of SIZES) if (!G.Escala.can('maravilha', st, n)) pre.push(`o povo ${st} não ergue a maravilha de ${n} casas`);
    const [out, said] = handWorld('maravilha', 'maravilha', WPEOPLES); out.unshift(...pre);
    ok('W5 as maravilhas que faltavam pela mão do deus (a metrópole: uma cidade nórdica e uma grega, pela regra do jogo — o povo clássico sem cidade nela, T-401): cada povo as ergue, nunca a antiga; de pé, vivendo, salvas e carregadas, o verificador, derrubadas', !out.length, out.slice(0, 3).join(' · ') || `${said.join(' · ')}; vivas, salvas e carregadas (a mesma planta), o verificador pega o piso noutra altura, derrubadas: limpo`);
  }
  // ---------------------------------------------------------------- W6 the places' table
  {
    const out = [], said = [];
    for (const st of WPEOPLES) for (const n of SIZES) { const uses = [...new Set(WUSES[st].map(q => q[1]))], o = placesOf(st, n, uses, 'maravilha'); if (o.err) { out.push(`${st} n ${n}: ${o.err}`); continue; }
      const none = uses.filter(u => !o.free[u]); if (!o.ok || none.length || o.dt > 400) out.push(`${st} n ${n}: a tabela ${o.ok ? 'feita' : 'não feita'} em ${o.dt.toFixed(0)} ms${none.length ? `, sem lugar livre de ${none.join(', ')}` : ''}`);
      said.push(`${st} n ${n}: ${o.spots} lugares em ${o.dt.toFixed(0)} ms`); }
    ok('W6 os lugares das maravilhas que faltavam (In.places, a tabela da planta): feita a tempo, um lugar livre de cada uso', !out.length, out.slice(0, 3).join(' · ') || said.join(' · '));
  }
}

const TPEOPLES = ['nordico', 'egipcio'], TKEY = { nordico: 'salao', egipcio: 'jardim' };
const TUSES = { nordico: [[0, 'sentar', 16], [0, 'atuar', 1]], egipcio: [[0, 'assistir', 50], [0, 'atuar', 1]] }, GARDEN = { 6: 50, 8: 90, 10: 140 };
function testeT() {
  blank(); const plans = {};
  // ---------------------------------------------------------------- T1 the forms
  {
    const out = [], said = [];
    for (const st of TPEOPLES) for (const n of TSIZES) {
      const tag = `${st} n ${n}`; const F = Fo.has('teatro', st, n) && Fo.of('teatro', st, n); const A = F && F.amphi && F.amphi[TKEY[st]]; if (!A) { out.push(`${tag}: sem a forma`); continue; }
      if (Fo.of('teatro', st, n) !== F || F.L !== n * 4) out.push(`${tag}: a forma de ${F.L} m, ${Fo.of('teatro', st, n) === F ? 'a mesma' : 'outra'} para cada prédio`);
      const rr = treadRise(F); if (rr > In.BODY.step + 1e-6) out.push(`${tag}: um degrau de ${rr.toFixed(2)} m`);
      if (st === 'nordico') { const B = Fo.body(F); if (!B || !B.porta || B.porta.y1 - B.porta.y0 < 2.2 || B.porta.w < 0.9) { out.push(`${tag}: a porta do salão`); continue; }
        if (F.els.some((e, k) => e.k === 'tora' && (!e.oculto || k > F.els.findIndex(q => q.k === 'telhado')))) out.push(`${tag}: os postes à mostra`);
        said.push(`${tag}: o salão de ${(A.r[2] - A.r[0]).toFixed(0)} × ${(A.r[3] - A.r[1]).toFixed(0)} m, a porta de ${(B.porta.y1 - B.porta.y0).toFixed(1)} m, o telhado de turfa`); }
      else { // (the lake in its rim, the palms, the sphinxes on their plinths either side of the way in, ≥ 2.2 m between them)
        const pl = F.els.filter(e => e.k === 'bloco' && Math.abs(e.y1 - 0.5) < 1e-6).map(e => e.r).sort((a, b) => a[0] - b[0]);
        const gap = pl.length >= 2 ? pl[1][0] - pl[0][2] : 0; const pal = F.els.filter(e => e.k === 'palmeira').length;
        if (gap < 2.2 || pal < 10 || !F.els.some(e => e.k === 'lamina')) out.push(`${tag}: a entrada de ${gap.toFixed(1)} m entre as esfinges, ${pal} palmeiras`);
        said.push(`${tag}: o lago de ${(A.lago[2] - A.lago[0]).toFixed(0)} × ${(A.lago[3] - A.lago[1]).toFixed(0)} m, ${pal} palmeiras, a entrada de ${gap.toFixed(1)} m`); }
    }
    ok('T1 as formas dos teatros que faltavam (6, 8 e 10 casas): o salão do hidromel nórdico e o jardim sagrado egípcio — o lote, os degraus, a porta, os postes, o lago, as palmeiras, a entrada entre as esfinges', !out.length, out.slice(0, 4).join(' · ') || said.join(' · '));
  }
  // ---------------------------------------------------------------- T2 the plans
  {
    const out = [], said = [], times = []; let nid = 67001; const jobs = In.TYPES.teatro.jobs !== undefined ? In.TYPES.teatro.jobs : G.BDEF.teatro.jobs || 0;
    for (const st of TPEOPLES) for (const n of TSIZES) for (const s of SIDES) {
      const tag = `${st} n ${n} ${s}`; const r = planOf('teatro', st, n, s, (nid += 37)); plans[st + n + s] = r; const { b, p, dt } = r; times.push(dt);
      if (!p || !p.ok) { out.push(`${tag}: não se arma (${p ? p.errs.slice(0, 2).join('; ') : '—'})`); continue; }
      G.S.buildings.set(b.id, b);
      const fal = In.report(b, p, { rec: b.ip }).filter(q => q.k === 'FALHA'); if (fal.length) out.push(`${tag}: ${fal.slice(0, 2).map(q => q.what).join('; ')}`);
      const lost = p.rooms.filter(m => !roomReached(p, m)); if (lost.length) out.push(`${tag}: ${lost.length} cômodos que a porta não alcança`);
      const need = TUSES[st].map(q => (q[1] === 'assistir' ? [q[0], q[1], GARDEN[n]] : q));
      const miss = need.filter(([lv, use, min]) => usesOn(p, lv, use) < min); if (miss.length) out.push(`${tag}: ${miss.map(([lv, use, min]) => `${usesOn(p, lv, use)} de ${use} (${min})`).join(', ')}`);
      if (p.cap.jobs < jobs) out.push(`${tag}: ${p.cap.jobs} postos de quem atua (${jobs})`);
      if (s === 'S') said.push(`${st} n ${n}: ${need.map(([lv, use]) => `${usesOn(p, lv, use)} ${use}`).join(', ')}, ${p.cap.jobs} postos`);
    }
    const tmax = Math.max(...times); if (tmax > 400) out.push(`a planta levou ${tmax.toFixed(0)} ms (o alvo: 400)`);
    ok('T2 as plantas dos teatros que faltavam: nos quatro lados e nos três tamanhos, sem falha, todo cômodo alcançado, quem assiste (nos bancos do salão; em pé diante do lago) e quem atua, o tempo', !out.length, out.slice(0, 4).join(' · ') || `${said.join(' · ')}; a maior em ${tmax.toFixed(0)} ms`);
  }
  // ---------------------------------------------------------------- T3 the form × the plan
  {
    const out = [], said = []; const CELL = In.CELL;
    for (const st of TPEOPLES) for (const n of TSIZES) {
      const { p } = plans[st + n + 'S']; if (!p || !p.ok) continue; const F = Fo.of('teatro', st, n), A = F.amphi[TKEY[st]], N = p.grid.n, tag = `${st} n ${n}`;
      const y = st === 'nordico' ? A.yb : A.yl; if (Math.abs(p.levels[0].y - y) > 1e-6) out.push(`${tag}: o chão da planta a ${p.levels[0].y} m, o da forma a ${y} m`);
      // (no floor of the plan the walk reaches on what the form has solid — the walls, the lake's rim, the palms, the plinths —)
      let bad = 0, first = ''; const g = p.grid.lv[0];
      for (const q of Fo.solids(F, y)) { const r = q.k === 'rect' ? q.r : [q.c[0] - q.r, q.c[1] - q.r, q.c[0] + q.r, q.c[1] + q.r];
        for (let z = Math.max(0, Math.floor(r[1] / CS)); z <= Math.min(N - 1, Math.floor(r[3] / CS)); z++) for (let x = Math.max(0, Math.floor(r[0] / CS)); x <= Math.min(N - 1, Math.floor(r[2] / CS)); x++) { const mx = (x + 0.5) * CS, mz = (z + 0.5) * CS;
          if (mx > r[0] + 0.03 && mx < r[2] - 0.03 && mz > r[1] + 0.03 && mz < r[3] - 0.03 && g[z * N + x] === CELL.FLOOR && p.reach[0][z * N + x]) { bad++; if (!first) first = `(${mx.toFixed(2)}, ${mz.toFixed(2)})`; } } }
      if (bad) out.push(`${tag}: ${bad} casinhas de chão alcançado no que a forma tem de sólido (a primeira ${first})`);
      // (and no floor of the plan under the form's water — the lake's, walled by its rim and no solid of the form: 836 cells of
      // floor 4 cm under its floor in the garden of 6, 2660 in the one of 10, L-505)
      let wet = 0; for (const e of F.els) { if (e.k !== 'lamina') continue; for (let z = 0; z < N; z++) for (let x = 0; x < N; x++) { const mx = (x + 0.5) * CS, mz = (z + 0.5) * CS; if (mx > e.r[0] && mx < e.r[2] && mz > e.r[1] && mz < e.r[3] && (g[z * N + x] === CELL.FLOOR || g[z * N + x] === CELL.DOOR)) wet++; } }
      if (wet) out.push(`${tag}: ${wet} casinhas de chão sob a água da forma (L-505)`);
      said.push(`${tag}: o chão a ${y} m, nada andado no sólido da forma${F.els.some(e => e.k === 'lamina') ? ', nenhum chão sob a água' : ''}`);
    }
    ok('T3 a forma × a planta dos teatros que faltavam: o chão na altura da forma, nada andado no que ela tem de sólido (as paredes, o lago, as palmeiras, as esfinges)', !out.length, out.slice(0, 4).join(' · ') || said.join(' · '));
  }
  // ---------------------------------------------------------------- T4 the feet, on a blank world
  {
    const S = G.newState(7); S.H.fill(4); S.type.fill(G.T.GRASS); if (S.biome) S.biome.fill(0); S.clock = 0; S.day = 30; S.time = 0.3; G.S = S; G.newWorld();
    const out = [], said = [];
    for (const st of TPEOPLES) for (const n of TSIZES) {
      const tag = `${st} n ${n}`; const { b, p } = standAlone(S, 'teatro', st, n, 97001 + 20 * TPEOPLES.indexOf(st) + n); if (!p || !p.ok) { out.push(`${tag}: sem planta`); continue; }
      const F = Fo.of('teatro', st, n), A = F.amphi[TKEY[st]], L = F.L; let legs, floor;
      if (st === 'nordico') { const R = A.r, steps = F.els.filter(e => e.degrau);
        const top = (u, z) => { let y = null; for (const q of steps) if (u >= q.r[0] - 0.01 && u <= q.r[2] + 0.01 && z >= q.r[1] - 0.01 && z <= q.r[3] + 0.01 && (y === null || q.y1 > y)) y = q.y1; return y; };
        legs = [[0, [[A.cu, L + 0.8], [A.cu, R[3] - 0.6], [A.cu, A.cv + 1.2], [R[2] - 2.0, A.cv + 1.2], [R[0] + 2.0, A.cv + 1.2]]]];
        floor = (lv, u, z) => { if (u > R[0] && u < R[2] && z > R[1] && z < R[3]) return [A.yb, 0]; const t = top(u, z); return t === null ? null : [t, 0.3]; }; }
      else { const R = A.lago; const cu = (R[0] + R[2]) / 2;
        legs = [[0, [[cu, L + 0.8], [cu, R[3] + 0.4], [R[0] - 0.45, R[3] + 0.4], [R[0] - 0.45, R[1] + 0.5]]]];
        floor = (lv, u, z) => (z < L - 0.3 && u > 0.3 && u < L - 0.3 ? [A.yl, 0] : null); }
      const r = feetAlong(b, legs, floor);
      if (r.worst || r.step > In.BODY.step + 0.01) out.push(`${tag}: os pés a ${r.worst.toFixed(2)} m da forma em ${r.at || '—'}, o maior degrau ${r.step.toFixed(2)} m`);
      if (r.shut) out.push(`${tag}: ${r.shut} pontos do caminho onde o corpo não passa (o primeiro ${r.shutAt})`);
      said.push(`${tag}: ${r.pts} pontos, o maior degrau ${r.step.toFixed(2)} m`);
    }
    ok('T4 os pés nos teatros que faltavam: no salão pelos degraus e pela porta ao longo da nave; no jardim entre as esfinges até diante do lago e ao longo dele', !out.length, out.slice(0, 3).join(' · ') || said.join(' · '));
  }
  // ---------------------------------------------------------------- T5 the world: the god's hand in a town of each people
  {
    const pre = []; for (const st of TPEOPLES.concat(['classico'])) for (const n of TSIZES) if (!G.Escala.can('teatro', st, n)) pre.push(`o povo ${st} não ergue o teatro de ${n} casas`);
    const [out, said] = handWorld('teatro', 'monumental', TPEOPLES); out.unshift(...pre);
    ok('T5 os teatros que faltavam pela mão do deus (a metrópole: uma cidade nórdica e uma egípcia, pela regra do jogo; o clássico, o do grego, sem cidade nela): cada povo os ergue, nunca o antigo; de pé, vivendo, salvos e carregados, o verificador, derrubados', !out.length, out.slice(0, 3).join(' · ') || `${said.join(' · ')}; vivos, salvos e carregados (a mesma planta), o verificador pega o chão noutra altura, derrubados: limpo`);
  }
  // ---------------------------------------------------------------- T6 the places' table
  {
    const out = [], said = [];
    for (const st of TPEOPLES) for (const n of TSIZES) { const uses = [...new Set(TUSES[st].map(q => q[1]))], o = placesOf(st, n, uses, 'teatro'); if (o.err) { out.push(`${st} n ${n}: ${o.err}`); continue; }
      const none = uses.filter(u => !o.free[u]); if (!o.ok || none.length || o.dt > 400) out.push(`${st} n ${n}: a tabela ${o.ok ? 'feita' : 'não feita'} em ${o.dt.toFixed(0)} ms${none.length ? `, sem lugar livre de ${none.join(', ')}` : ''}`);
      said.push(`${st} n ${n}: ${o.spots} lugares em ${o.dt.toFixed(0)} ms`); }
    ok('T6 os lugares dos teatros que faltavam (In.places, a tabela da planta): feita a tempo, um lugar livre de cada uso', !out.length, out.slice(0, 3).join(' · ') || said.join(' · '));
  }
}

const TESTS = { A: testeA, C: testeC, E: testeE, H: testeH, M: testeM, W: testeW, T: testeT };
const want = process.argv.slice(2).map(s => s.toUpperCase());
for (const k of Object.keys(TESTS)) if (!want.length || want.includes(k)) TESTS[k]();
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'monumental: tudo PASSOU');
process.exit(fails.length ? 1 : 0);
