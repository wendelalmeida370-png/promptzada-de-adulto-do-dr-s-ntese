// ceu: o céu, a luz e o ar do instante (21d, NATUREZA.md §4 e §8; D-466, D-469) — o G.Ceu (js/ceu.js) provado em Node, sem
// navegador, sobre os mundos prontos: a fonte é pura (a mesma pergunta, a mesma resposta; não tira acaso nenhum, não escreve no
// mundo: o save igual byte a byte antes e depois de perguntar tudo), o caminho do sol e da lua, a fase da lua pelo dia, as cores
// da hora em faixa (nada de NaN, a noite nunca preta), o matiz da hora do deus e do 3D um só, o mapa do ar com a sua causa em
// cada casa, a sombra dos montes contra um raio de força bruta, a deriva das nuvens pelo relógio do mundo sem saltos, o vento
// um só (o dos bichos); e os casos ruins: o save no meio de uma tempestade, o deus que muda o clima, o inverno do deus, o chão
// que muda (o mapa do ar refeito), o mesmo save carregado duas vezes.
//   c1 pura e sem escrever · c2 o sol · c3 a lua · c4 as cores · c5 o matiz do deus · c6 o mapa do ar · c7 a sombra dos montes
//   c8 as nuvens · c9 o raio · c10 save/load na tempestade · c11 o chão que muda · c12 o tempo do deus · c13 a hora dourada
//   [ONLY=c1,c2] node qa/ceu.js [cidade|metropole|…]
// (the world with the 3D's own files loaded after it, as the page has them — no graphics card: the drawing's lists only)
const T3 = require('./visual/tres-node.js');
const { G, M } = T3.load({ extra: ['qa/ceu-inv.js'] });
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | ceu ${name} | ${info}`); if (!c) fails.push(name); };
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null; const on = k => !ONLY || ONLY.includes(k);
const Ce = G.Ceu; const W = G.W;
const WORLD = process.argv[2] || 'cidade';
M.pronto(WORLD); M.viver(2);
let S = G.S; const N = () => G.N;
const fin = a => (Array.isArray(a) ? a.every(Number.isFinite) : Number.isFinite(a));
// (everything the source answers, asked once: for the purity and for the sameness)
function askAll() {
  const out = [];
  for (let k = 0; k < 96; k++) { const t = k / 96; const L = Ce.light(t, S.weather, S.clouds.length, null, {});
    out.push(L.s, L.keyI, ...L.sun, ...L.sky, ...L.hor, L.exp, L.cover); out.push(Ce.ambient(t, S.weather)[0], Ce.nightness(t, S.weather)); const m = Ce.moon(t, S.day); out.push(m.x, m.y, m.phase); }
  const A = Ce.airMap(); out.push(A.pic.reduce((a, b) => (a * 31 + b) % 1000003, 0));
  for (let y = 0; y < N(); y += 7) for (let x = 0; x < N(); x += 7) { const a = Ce.air(x, y); out.push(a.dawn, a.last, a.top, a.canopy); }
  for (let k = 0; k < 12; k++) { const sd = Ce.sun(0.0 + k * 0.06); const sh = Ce.shadeFor(sd); out.push(sh.reduce((a, b) => a + b, 0)); }
  const dr = Ce.drift(S.clock, S.weather); out.push(dr.x0, dr.z0, dr.w0, Ce.cloudN(100, 200, dr, true), Ce.cover(0.4, S.weather, 2, S.day, 10, 10));
  out.push(Ce.cloudShade(100, 10, 100, Ce.sun(0.3), 0.5, 0.8, dr)); const wd = Ce.wind(); out.push(wd.x, wd.y, wd.s);
  return out;
}

// c1 — the source is pure: the same answer twice, no chance drawn, nothing of the world written (the save byte for byte)
if (on('c1')) {
  const s0 = G.Save.serialize(); const rng0 = S.rng; const a = askAll(); const b = askAll(); const s1 = G.Save.serialize();
  const same = a.length === b.length && a.every((v, k) => Object.is(v, b[k]));
  ok('c1 pura', same && s0 === s1 && S.rng === rng0 && a.every(Number.isFinite), `${a.length} respostas ${same ? 'iguais' : 'DIFERENTES'} nas duas vezes; o save ${s0 === s1 ? 'igual byte a byte' : 'MUDOU'} (${s0.length} caracteres); o acaso do mundo ${S.rng === rng0 ? 'intocado' : 'TIRADO'}; ${a.filter(v => !Number.isFinite(v)).length} não-números`);
}
// c2 — the sun's way: continuous over the day, up while the world calls it day and down at night, no higher than ~61°
if (on('c2')) {
  let maxStep = 0, maxAlt = 0, upAtNight = 0, downAtDay = 0, prev = null;
  for (let k = 0; k <= 4000; k++) { const t = k / 4000; const s = Ce.sun(t); const a = Math.asin(s.y) * 180 / Math.PI; if (prev !== null) maxStep = Math.max(maxStep, Math.abs(a - prev)); prev = a; maxAlt = Math.max(maxAlt, a);
    S.time = t; const night = G.isNight(); if (night && t > 0.745 && t < 0.98 && s.y > 0) upAtNight++; if (!night && t > 0.03 && t < 0.72 && s.y <= 0) downAtDay++; }
  S.time = 0.4;
  ok('c2 o sol', maxStep < 0.5 && maxAlt > 55 && maxAlt < 64 && !upAtNight && !downAtDay, `o maior salto de 1/4000 do dia ${maxStep.toFixed(3)}°; a maior altura ${maxAlt.toFixed(1)}°; acima do horizonte de noite ${upAtNight}, abaixo de dia ${downAtDay}`);
}
// c3 — the moon: its phase by the world's day — new on the first, full in the middle of the month, the same all night
if (on('c3')) {
  const ph = []; for (let d = 1; d <= Ce.MONTH * 2; d++) ph.push(+Ce.moon(0.85, d).lit.toFixed(3));
  const night = [0.74, 0.8, 0.9, 0.97].map(t => Ce.moon(t, 3).phase); const oneNight = night.every(v => v === night[0]);
  const full = Ce.moon(0.85, 1 + Ce.MONTH / 2).lit, nw = Ce.moon(0.85, 1).lit, up = Ce.moon(0.85, 3).y > 0;
  ok('c3 a lua', nw < 0.01 && full > 0.99 && oneNight && up, `a parte acesa pelos dias: ${ph.join(' ')}; a fase igual a noite inteira: ${oneNight}; a lua no céu à noite: ${up}`);
}
// c4 — the colours of the hour: numbers, in their range; the night never black (the floor of the night's light)
if (on('c4')) {
  const bad = []; let minSky = 9, maxKey = 0, maxExp = 0, minExp = 9;
  for (const rain of [0, 0.5, 0.85]) for (const storm of [0, 1]) for (let k = 0; k < 200; k++) {
    const t = k / 200; const L = Ce.light(t, { rain, storm, drought: 0, windA: 1, windS: 0.4 }, 3, null, {});
    for (const f of ['sun', 'zen', 'hor', 'glow', 'belt', 'sky', 'bounce', 'key', 'top', 'sunCol', 'disc', 'moonCol', 'cloudCol', 'cloudSh']) if (!fin(L[f]) || L[f].some(v => v < 0)) bad.push(`${f}@${t}`);
    for (const f of ['keyI', 'exp', 'cover', 'stars', 'grN', 'toe', 'mist', 'amb']) if (!fin(L[f])) bad.push(`${f}@${t}`);
    const sl = 0.2126 * L.sky[0] + 0.7152 * L.sky[1] + 0.0722 * L.sky[2]; minSky = Math.min(minSky, sl); maxKey = Math.max(maxKey, L.keyI); maxExp = Math.max(maxExp, L.exp); minExp = Math.min(minExp, L.exp);
    if (L.cover > 0.98 || L.cover < 0) bad.push('cobertura ' + L.cover);
  }
  ok('c4 as cores', !bad.length && minSky > 0.02 && maxKey <= 3.01 && maxExp < 2.2 && minExp >= 0.99, `${bad.length} fora (${bad.slice(0, 3).join(', ')}); a luz do céu nunca abaixo de ${minSky.toFixed(3)} (a noite nunca preta); a luz principal até ${maxKey.toFixed(2)}; a exposição ${minExp.toFixed(2)}–${maxExp.toFixed(2)}`);
}
// c5 — the god's hue of the hour is the sky's: the god's view asks it, and the 3D's light is tinted by the same
if (on('c5')) {
  const OLD = [[0, [225, 186, 176]], [0.05, [255, 226, 206]], [0.12, [255, 255, 255]], [0.56, [255, 252, 244]], [0.63, [255, 216, 172]], [0.69, [232, 172, 140]], [0.725, [150, 138, 172]], [0.765, [104, 114, 172]], [0.965, [100, 110, 168]], [1.0, [225, 186, 176]]];
  const old = t => { let c = OLD[0][1]; for (let k = 0; k < OLD.length - 1; k++) if (t >= OLD[k][0] && t <= OLD[k + 1][0]) { c = G.lerpColor(OLD[k][1], OLD[k + 1][1], (t - OLD[k][0]) / (OLD[k + 1][0] - OLD[k][0])); break; } return c; };
  let diff = 0, same = 0, n = 0; const t0 = S.time, w0 = Object.assign({}, S.weather);
  for (let k = 0; k < 400; k++) { S.time = k / 400; S.weather.rain = 0; S.weather.drought = 0; const a = G.Render.ambient(), b = Ce.ambient(S.time, S.weather); if (a.every((v, q) => v === b[q])) same++; n++;
    void diff; }
  S.time = t0; Object.assign(S.weather, w0);
  // (with the sun lingering low, the god's hue keeps with its height: the warm hours of dawn and dusk last as the sun's do)
  const warm = sh => { const k0 = Ce.SHAPE; Ce.SHAPE = sh; let n = 0; for (let k = 0; k < 2000; k++) { const a = Ce.ambient(k / 2000, { rain: 0 }); if (a[0] > 200 && a[0] - a[2] > 30) n++; } Ce.SHAPE = k0; return n / 2000; };
  const w1 = warm(1), wS = warm(Ce.SHAPE);
  const plain = (() => { const k0 = Ce.SHAPE; Ce.SHAPE = 1; let d = 0; for (let k = 0; k < 400; k++) { const t = k / 400; const c = old(t), b = Ce.ambient(t, { rain: 0, drought: 0 }); d = Math.max(d, ...c.map((v, q) => Math.abs(v - b[q]))); } Ce.SHAPE = k0; return d; })();
  ok('c5 o matiz do deus', same === n && plain < 1e-9 && (Ce.SHAPE === 1 || wS > w1), `${same} de ${n} horas: o deus pergunta ao céu (G.Render.ambient = G.Ceu.ambient); com o arco simples, a tabela de antes igual (diferença ${plain}); as horas quentes do dia ${(w1 * 100).toFixed(1)}% com o arco simples, ${(wS * 100).toFixed(1)}% com o sol que demora (forma ${Ce.SHAPE})`);
}
// c6 — the map of the air: every corner with mist says its cause; none on the dry desert's open land; the canopy is the woods'
// (nothing without G.Mata; with them, theirs); the same map twice; made again when the woods change
if (on('c6')) {
  const A = Ce.airMap(); const n = A.n; let mist = 0, noCause = 0, desertNoon = 0, canopy = 0; const causes = {};
  const mn = Ce.mistNow(0.36, { rain: 0 }, 0);
  for (let c = 0; c < n * n; c++) { if (A.cano[c] > 0) canopy++; const m = A.dawn[c] + A.last[c]; if (m > 0.02) { mist++; if (!A.why[c]) noCause++; for (const k in Ce.WHY) if (A.why[c] & Ce.WHY[k]) causes[k] = (causes[k] || 0) + 1; }
    const i = c % n, j = (c / n) | 0; if (i < N() && j < N() && S.biome[j * N() + i] === 6 && !(A.why[c] & (Ce.WHY.rio | Ce.WHY.queda)) && (A.dawn[c] * mn.dawn + A.last[c] * mn.last) > 0.2) desertNoon++; }
  const had = G.Mata; G.Mata = { ver: 'prova-1', at: i => ({ luz: (S.treeAt[i] ? 0.9 : 0), dens: 0 }) }; const B = Ce.airMap(); let withMata = 0, forest = 0; for (let c = 0; c < n * n; c++) { if (B.cano[c] > 0) withMata++; if (B.why[c] & Ce.WHY.mata) forest++; }
  const same = Ce.airMap() === B; G.Mata.ver = 'prova-2'; const C = Ce.airMap(); G.Mata = had; const D = Ce.airMap();
  ok('c6 o mapa do ar', mist > 50 && !noCause && !desertNoon && canopy === 0 && withMata > 50 && same && C !== B && D !== C, `${mist} cantos com névoa, ${noCause} sem causa (${Object.entries(causes).map(([k, v]) => k + ' ' + v).join(', ')}); no deserto seco ao meio-dia: ${desertNoon}; o dossel sem o G.Mata: ${canopy} cantos; com o G.Mata de prova: ${withMata} (mata úmida ${forest}); a mesma versão, o mesmo mapa: ${same}; a versão nova o refaz: ${C !== B}`);
}
// c7 — the shade of the hills: the sweep against a brute look along the line to the light, at corners picked by the hash
if (on('c7')) {
  let n = 0, agree = 0, shaded = 0; const res = [];
  for (const t of [0.0, 0.015, 0.03, 0.06, 0.66, 0.7, 0.72, 0.85]) {
    const d = t > 0.73 ? Ce.moonDir(t) : Ce.sun(t); if (d.y <= 0) continue; const sh = Ce.shadeFor(d); let a = 0, m = 0, s = 0;
    for (let k = 0; k < 600; k++) { const i = 2 + Math.floor(G.hash(k * 7 + t * 1000) * (N() - 4)), j = 2 + Math.floor(G.hash(k * 13 + 5 + t * 1000) * (N() - 4)); const X = i * 4, Z = j * 4, Y = S.H[j * (N() + 1) + i] * 1.5 + 0.05;
      const sw = Ce.shadeAt(sh, X, Y, Z), br = Ce.shadeRay(d, X, Y, Z); m++; if (sw === br) a++; if (br) s++; }
    n += m; agree += a; shaded += s; res.push(`${(Math.asin(d.y) * 180 / Math.PI).toFixed(1)}°: ${s} na sombra, ${(a / m * 100).toFixed(0)}%`);
  }
  ok('c7 a sombra dos montes', agree / n > 0.95 && shaded > 20, `a varredura bate com o raio de força bruta em ${(agree / n * 100).toFixed(1)}% de ${n} cantos (${shaded} na sombra): ${res.join(' · ')}`);
}
// c8 — the clouds drift by the world's clock: the same sky at the same clock; smooth from a tenth of a second to the next —
// through the start of a span too — and when the wind turns a little; how much of the sky they cover, eased through the days
if (on('c8')) {
  const w = { windA: 0.8, windS: 0.4, rain: 0 }; let jump = 0, jumpW = 0; const P = [[120, 340], [800, -200], [-50, 60]];
  for (let k = 0; k < 6000; k++) { const c = 1000 + k * 0.1; const a = Ce.drift(c, w), b = Ce.drift(c + 0.1, w); for (const p of P) jump = Math.max(jump, Math.abs(Ce.cloudN(p[0], p[1], a, true) - Ce.cloudN(p[0], p[1], b, true))); }
  for (let k = 0; k < 200; k++) { const c = 5000 + k * 7; const a = Ce.drift(c, w), b = Ce.drift(c, Object.assign({}, w, { windA: w.windA + 0.002 })); for (const p of P) jumpW = Math.max(jumpW, Math.abs(Ce.cloudN(p[0], p[1], a, true) - Ce.cloudN(p[0], p[1], b, true))); }
  const same = Ce.cloudN(300, 300, Ce.drift(777, w), true) === Ce.cloudN(300, 300, Ce.drift(777, w), true);
  let dayJump = 0; for (let d = 1; d < 30; d++) dayJump = Math.max(dayJump, Math.abs(Ce.cover(0.9999, w, 0, d) - Ce.cover(0, w, 0, d + 1)));
  const covers = []; for (let d = 1; d <= 6; d++) covers.push(Ce.cover(0.4, w, 0, d).toFixed(2));
  ok('c8 as nuvens', jump < 0.02 && jumpW < 0.03 && same && dayJump < 0.01 && new Set(covers).size > 3, `o maior salto em 0,1 s do mundo: ${jump.toFixed(4)} (10 min de mundo, três lugares); com o vento girando 0,002 rad: ${jumpW.toFixed(4)}; o mesmo relógio, o mesmo céu: ${same}; da meia-noite ao dia seguinte: ${dayJump.toFixed(4)}; a cobertura de seis dias: ${covers.join(' ')}`);
}
// c9 — the bolt is drawn where the world struck, and only there: the world's stroke (G.Powers.strike, on open land far from
// people, and one on the water) gives the 3D its bolt at that place and hour; a stroke the world holds back (near people:
// naturalLightning) gives none; the bolts go in a second and a half of the world, and with a save opened; the verifier clean
if (on('c9')) {
  const C3 = G.Ceu3D; const n = G.N; let land = null, sea = null;
  for (let k = 0; k < 4000 && (!land || !sea); k++) { const x = 4 + Math.floor(G.hash(k * 3 + 1) * (n - 8)), y = 4 + Math.floor(G.hash(k * 7 + 2) * (n - 8)); const i = y * n + x;
    const far = [...S.villagers.values()].every(v => G.dist2(v.x, v.y, x + 0.5, y + 0.5) > 100);
    if (!land && far && S.type[i] > G.T.RIVER && !S.occ[i] && !S.treeAt[i]) land = [x + 0.5, y + 0.5]; if (!sea && S.type[i] === G.T.DEEP) sea = [x + 0.5, y + 0.5]; }
  const b0 = C3.live().length; G.Powers.strike(land[0], land[1], false); const b1 = C3.live().slice(); G.Powers.strike(sea[0], sea[1], false); const b2 = C3.live().length;
  const at = b1.length ? b1[b1.length - 1] : null; const here = at && Math.abs(at.x - land[0]) < 1e-9 && Math.abs(at.y - land[1]) < 1e-9 && at.at === S.clock;
  const inv1 = QA.check().filter(q => q.sys === 'céu');
  // (a stroke the world holds back: next to a person, naturalLightning thunders far off and strikes nobody — no bolt)
  M.viver(2); const gone = C3.live().length;
  // (the storm's own strokes near people — naturalLightning: the world moves them off or holds them back —: every bolt drawn is a
  // stroke the world made, at its place; the test's hand only counts the strokes, by the world's own door)
  const st0 = G.Powers.strike; const made = []; G.Powers.strike = function (x, y) { made.push([x, y]); return st0.apply(this, arguments); };
  const ppl = [...S.villagers.values()].filter(o => !o.inside).slice(0, 12); try { for (const v of ppl) G.Powers.naturalLightning(v.x, v.y); } finally { G.Powers.strike = st0; }
  const drawn = C3.live().slice(); const matched = drawn.every(b => made.some(m => m[0] === b.x && m[1] === b.y)) && drawn.length === Math.min(made.length, 8); // (the last eight at most: the drawing's own limit)
  // (a bolt in the list with no stroke of the world under it: the verifier sees it)
  let spot = null; for (let k = 0; k < 4000 && !spot; k++) { const x = 4 + Math.floor(G.hash(k * 11 + 9) * (n - 8)), y = 4 + Math.floor(G.hash(k * 5 + 3) * (n - 8)); const i = y * n + x; if (S.type[i] > G.T.RIVER && !(S.burnt[i] > 0)) spot = [x + 0.5, y + 0.5]; }
  C3.live().length = 0; C3.live().push({ x: spot[0], y: spot[1], at: S.clock, seed: 1, t0: -1 }); const fake = QA.check().filter(q => q.sys === 'céu' && /onde o mundo não fez cair/.test(q.msg)).length; C3.live().length = 0;
  ok('c9 o raio', b0 === 0 && here && b2 === b1.length + 1 && !inv1.length && gone === 0 && matched && fake === 1, `o raio do mundo na terra (${land.map(q => q.toFixed(1))}): o 3D o tem ali e naquela hora: ${!!here}; no mar também: ${b2 === b1.length + 1}; o verificador limpo: ${!inv1.length}; passado 1,5 s do mundo, nenhum: ${gone === 0}; os raios da tempestade perto de gente: ${made.length} do mundo, ${drawn.length} desenhados, cada um no lugar de um do mundo: ${matched}; um raio de mentira sem raio do mundo, acusado: ${fake}`);
}
// c10 — the save in the middle of a storm: the light, the clouds and the air the same before and after (they are the saved world's)
if (on('c10')) {
  const w = S.weather; w.storm = 40; w.rain = 0.7; w.windS = 0.9; M.viver(3);
  const sig = () => { const L = Ce.light(S.time, S.weather, S.clouds.length, null, {}); const d = Ce.drift(S.clock, S.weather); return [L.keyI, L.cover, ...L.sky, d.x0, d.z1, Ce.cloudN(50, 70, d, true), Ce.airMap().pic.length, Ce.wind().a].map(v => +v.toFixed(6)).join(','); };
  const a = sig(); M.salvarCarregar(); S = G.S; const b = sig();
  ok('c10 save/load na tempestade', a === b && M.limpo(), `a luz, as nuvens e o ar ${a === b ? 'iguais' : 'DIFERENTES'} depois do save no meio da tempestade (chuva ${S.weather.rain.toFixed(2)})`);
  S.weather.storm = 0; S.weather.rain = 0;
}
// c11 — the land that changes: the god raises the land (S.typeVer) — the map of the air made again; the same save opened twice
// gives the same map
if (on('c11')) {
  const a = Ce.airMap(); const key0 = a.key; S.typeVer = (S.typeVer || 0) + 1; const b = Ce.airMap(); S.typeVer--;
  const s = G.Save.serialize(); G.Save.apply(JSON.parse(s)); S = G.S; const p1 = Array.from(Ce.airMap().pic); G.Save.apply(JSON.parse(s)); S = G.S; const p2 = Array.from(Ce.airMap().pic);
  const same = p1.length === p2.length && p1.every((v, k) => v === p2[k]);
  ok('c11 o chão que muda', b !== a && b.key !== key0 && same, `o chão mudou: o mapa do ar ${b !== a ? 'refeito' : 'NÃO refeito'}; o mesmo save aberto duas vezes, o mesmo mapa: ${same}`);
}
// c12 — the god's weather: the change of climate, the storm, the winter — the light follows (greyer, dimmer) and stays in its range
if (on('c12')) {
  const t = 0.4; const clear = Ce.light(t, { rain: 0, storm: 0 }, 0, null, {}); const kc = clear.keyI, cc = clear.cover;
  const wet = Ce.light(t, { rain: 0.85, storm: 1 }, 6, null, {});
  let errs = 0; if (G.Powers && G.Powers.use) { try { G.Powers.use('rain', 40, 40); } catch (e) { errs++; } }
  if (G.Winter && G.Winter.start) { try { G.Winter.start(G.N / 2, G.N / 2); } catch (e) { errs++; } }
  M.viver(4); const L = Ce.light(S.time, S.weather, S.clouds.length, null, {});
  ok('c12 o tempo do deus', wet.keyI < kc * 0.4 && wet.cover > cc + 0.3 && fin(L.sky) && L.keyI >= 0 && !errs && M.limpo(), `de dia, a luz do sol na tempestade ${wet.keyI.toFixed(2)} contra ${kc.toFixed(2)} com céu limpo; a cobertura ${cc.toFixed(2)} → ${wet.cover.toFixed(2)}; depois da mão do deus, os números em faixa`);
}
// c13 — the golden hour (D-469): how long the sun takes from 6° to 0° on its way down, in the body's clock (G.Space.TIME), and
// the hours the world counts unchanged (the sun up and down at the same hours: G.isNight is not the sky's)
if (on('c13')) {
  const deg = t => Math.asin(Ce.sun(t).y) * 180 / Math.PI; let a = null, b = null; for (let k = 0; k < 20000; k++) { const t = 0.5 + k / 20000 * 0.25; const d = deg(t); if (a === null && d < 6) a = t; if (b === null && d < 0) { b = t; break; } }
  const sec = (b - a) * G.DAY_LEN / (G.Space ? G.Space.TIME : 0.35); const rise = deg(Ce.RISE + 1e-4), set = deg(Ce.SET - 1e-4);
  ok('c13 a hora dourada', sec > (Ce.SHAPE > 1 ? 30 : 14) && Math.abs(rise) < 0.5 && Math.abs(set) < 0.5, `o sol de 6° a 0° leva ${sec.toFixed(1)} s do relógio do corpo (a forma da curva ${Ce.SHAPE}); nasce e se põe nas mesmas horas (${rise.toFixed(2)}°, ${set.toFixed(2)}°)`);
}
// and the verifier with the sky's rules, clean; no module error
{ const bad = QA.check().filter(q => q.sev <= 2); ok('verificador', !bad.length && M.limpo(), bad.length ? bad.slice(0, 4).map(q => `S${q.sev} ${q.sys}: ${q.msg}`).join(' · ') : 'limpo, sem erro de módulo'); }
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
