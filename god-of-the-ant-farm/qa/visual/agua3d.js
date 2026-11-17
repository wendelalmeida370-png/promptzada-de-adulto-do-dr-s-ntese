// agua3d: a água do 3D em Node (a geometria e os retratos, sem placa de vídeo; D-505 a D-510).   [ONLY=g1,g3] node qa/visual/agua3d.js   (≈ 3 min)
// g1 a água de cada pedaço de um mundo montanhoso: os quadrados de água com número, a água sobre a terra só onde ela mergulha
//    (R3.waterCheck), o leito que a água lê o do chão (R3.bedCheck); cada degrau com a sua lâmina (G.Agua3D.fallCheck): na face de cima
//    no lábio e na de baixo no pé (± 5 cm), por cima do chão em que cai, nada fora da casa de baixo, nada numa ponte ou num prédio;
// g2 a mesma água duas vezes (o mesmo pedaço, os mesmos números) — e o mesmo mundo feito de novo;
// g3 o mundo igual: o save byte a byte antes e depois de desenhar toda a água na Ultra (os pedaços de perto e de longe, os retratos, as
//    lâminas, o mar além do mapa, o navio na onda) — e nenhum acaso do mundo tirado;
// g4 os retratos batem com a fonte: a corrente, a cor, a espuma, a distância à praia, o molhado, as poças e o borrifo que o sombreador
//    lê são os do G.Agua (casa a casa, na precisão do retrato);
// g5 o que boia: o navio monta na onda desenhada (a altura dele a da G.Agua.waveY, o balanço pequeno); a onda, a mesma conta no JS e no
//    sombreador (os números da G.Agua.WAVE na G.Agua.waveGLSL); os sombreadores da água, da lâmina, do chão molhado e do telhado molhado
//    acham cada um o seu lugar no three.js (nenhum remendo perdido);
// g6 os casos ruins no 3D: o deus ergue a terra sob o poço de uma queda (o pedaço refeito, a lâmina segue as faces novas), o inverno
//    súbito (a lâmina congelada), a ponte sobre um degrau (sem lâmina ali), o mar aberto (as paredes, nenhuma lâmina no fundo seco), o
//    save e o load (a mesma geometria);
// g7 o custo: os triângulos da água e das lâminas por pedaço, as chamadas a mais (uma por pedaço com degrau), o tempo de montar.
'use strict';
const path = require('path');
const T3 = require(path.join(__dirname, 'tres-node.js'));
const { G, M, THREE } = T3.load({ qa: false });
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const on = k => !ONLY || ONLY.includes(k);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | agua3d ${name} | ${info}`); if (!c) fails.push(name); };
const SEED = 4242;
const novo = (relevo) => M.novo({ seed: SEED, type: 'continente', size: 192, tribes: 4, temper: 'normal', clima: 'variado', relevo: relevo || 'montanhoso' });
const A3 = G.Agua3D, Ag = G.Agua, R3 = G.Realm, W = G.W, T = G.T, TL = G.Space.TILE, HM = G.Space.HM;
// (the materials as the realm makes them, with no renderer: the water's checks know their meshes by them)
if (!G.Ground3D.detail()) G.Ground3D.init(THREE);
const MAT = {}; const U = { time: { value: 7.3 }, wind: { value: new THREE.Vector3(1.1, 0.4, 0.8) }, sky: { value: new THREE.Color() } };
const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color(0.7, 0.75, 0.82) }, keyDir: { value: new THREE.Vector3(0, 1, 0) }, sunDir: { value: new THREE.Vector3(0.3, 0.8, 0.2) }, cover: { value: 0.4 }, cloudCol: { value: new THREE.Color() }, cloudSh: { value: new THREE.Color() }, uNoise: { value: null } };
A3.materials(THREE, MAT, U, skyU); R3.U.wind.value = U.wind.value; R3.U.time.value = U.time.value;
// (the near pictures of the chunks, as the realm would hold them: the checks walk them by R3.eachNear)
let held = [];
R3.eachNear = fn => { for (const h of held) fn(h.parts, h.ch); };
function build(cx, cy, far) { const g = A3.geo(cx * 16, cy * 16, 16, 16, !!far); const kids = []; if (g.water) kids.push({ material: MAT.water, geometry: g.water }); if (g.falls) kids.push({ material: MAT.fall, geometry: g.falls }); if (g.ice) kids.push({ material: MAT.ice, geometry: g.ice }); return { parts: { ground: { children: kids } }, ch: { cx, cy }, g }; }
const NC = () => Math.ceil(G.N / 16);
function buildAll(far) { held = []; for (let cy = 0; cy < NC(); cy++) for (let cx = 0; cx < NC(); cx++) held.push(build(cx, cy, far)); return held; }
const light = () => A3.light([1, 0.95, 0.9], 2.4, [0.4, 0.45, 0.55], 1);
let S = novo(); let N = G.N;

if (on('g1')) {
  light(); const t0 = process.hrtime.bigint(); buildAll(); const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  let quads = 0, nan = 0; for (const h of held) for (const k of h.parts.ground.children) for (const v of k.geometry.attributes.position.array) { if (!Number.isFinite(v)) nan++; } for (const h of held) if (h.g.water) quads += h.g.water.attributes.position.count / 6;
  const wc = A3.waterCheck(), bc = A3.bedCheck(200), fc = A3.fallCheck();
  // (each sheet over the ground it falls on: its middle column at every row of its profile — the banks hide its edges)
  let under = 0, rows = 0, lipBad = 0, footBad = 0; const st = Ag.steps(0, 0, N, N);
  for (const s of st) { const sh = A3.sheetOf(s); const mx = (s.ax + s.bx) / 2, my = (s.ay + s.by) / 2;
    if (Math.abs(sh.prof[0][1] - s.top) > 0.05) lipBad++; if (Math.abs(sh.prof[sh.prof.length - 1][1] - s.low) > 0.05) footBad++;
    for (let k = 1; k < sh.prof.length - 1; k++) { rows++; const [d, y] = sh.prof[k]; if (y < G.Space.footAt(mx + s.nx * d / TL, my + s.ny * d / TL) - 0.02) under++; } }
  ok('g1', !nan && !wc.bad && bc.bad <= 2 && !fc.bad && fc.n === st.length && !under && !lipBad && !footBad, `${held.length} pedaços em ${ms.toFixed(0)} ms: ${quads} quadrados de água, ${nan} sem número; a água sobre a terra: ${wc.bad} fora de ${wc.n}; o leito: ${bc.bad} de ${bc.n} fora; ${fc.n} lâminas para ${st.length} degraus (${fc.bad} erros${fc.bad ? ': ' + fc.out[0] : ''}); o perfil: ${under} de ${rows} pontos debaixo do chão, ${lipBad} lábios e ${footBad} pés fora da face da água`);
}

if (on('g2')) {
  S = novo(); N = G.N; const st = Ag.steps(0, 0, N, N).sort((a, b) => b.drop - a.drop)[0]; const cx = Math.floor(st.x / 16), cy = Math.floor(st.y / 16);
  const arr = g => [g.water, g.falls].filter(Boolean).map(x => Array.from(x.attributes.position.array).concat(x.attributes.aF ? Array.from(x.attributes.aF.array) : []));
  const a = arr(A3.geo(cx * 16, cy * 16, 16, 16, false)), b = arr(A3.geo(cx * 16, cy * 16, 16, 16, false)); S = novo(); const c = arr(A3.geo(cx * 16, cy * 16, 16, 16, false));
  const eq = (p, q) => p.length === q.length && p.every((x, k) => x.length === q[k].length && x.every((v, j) => v === q[k][j]));
  ok('g2', eq(a, b) && eq(a, c), `o pedaço ${cx},${cy} (a maior queda, ${st.drop.toFixed(1)} m): duas vezes ${eq(a, b) ? 'igual' : 'DIFERENTE'}; o mesmo mundo feito de novo ${eq(a, c) ? 'igual' : 'DIFERENTE'}`);
}

if (on('g3')) {
  S = novo(); N = G.N; const rng0 = JSON.stringify(S.rng), sv0 = G.Save.serialize(); R3.setQuality('ultra');
  light(); A3.fieldNow(); buildAll(false); buildAll(true); for (const s of Ag.steps(0, 0, N, N)) A3.sheetOf(s); for (let k = 0; k < 40; k++) light();
  const sc = new THREE.Scene(); A3.ocean(sc); A3.dropOcean(sc);
  let rides = 0; for (const sh of S.ships) { G.FX3D.shipRide(sh.x * TL, sh.y * TL, 0.3, [10, 3, 8]); rides++; } for (let q = 0; q < 50; q++) G.FX3D.shipRide(q * 13.1, q * 7.7, q, [12, 3.5, 9]);
  const sv1 = G.Save.serialize(), rng1 = JSON.stringify(S.rng); R3.setQuality('media');
  ok('g3', sv0 === sv1 && rng0 === rng1, `toda a água de ${NC() * NC()} pedaços (de perto e de longe, na Ultra), os retratos, as lâminas, o mar além do mapa, ${rides + 50} navios na onda: o save ${sv0 === sv1 ? 'igual byte a byte' : 'MUDOU'} (${sv0.length} bytes), o acaso ${rng0 === rng1 ? 'igual' : 'MUDOU'}`);
}

if (on('g4')) {
  S = novo(); N = G.N; S.weather.rain = 0.5; light(); A3.fieldNow(); const tx = A3.tex(); const f = Ag.field(); const half = THREE.DataUtils.fromHalfFloat;
  let bad = 0, n = 0; const ex = [];
  const note = (w, i) => { bad++; if (ex.length < 3) ex.push(`${w} em ${i % N},${(i / N) | 0}`); };
  for (let i = 0; i < N * N; i++) { const o = i * 4; n++;
    const F = tx.flow.image.data, L = tx.look.image.data, H = tx.shore.image.data, Wt = tx.wet.image.data;
    const riv = S.type[i] === T.RIVER && !(S.ice && S.ice[i]); const rule = riv ? Math.min(1, f.sp[i] / 0.8) : 0;
    if (Math.abs((F[o] / 255 - 0.5) * 2 - f.dx[i] * rule) > 0.01 || Math.abs(F[o + 2] / 255 * 3 - (riv ? f.sp[i] : 0)) > 0.015) note('corrente', i);
    const fo = riv ? Ag.foam(i) : [0, 0]; if (Math.abs(F[o + 3] / 255 - fo[0]) > 0.005 || Math.abs(half(H[o + 3]) - fo[1]) > 0.003) note('espuma', i);
    if (Math.abs(half(H[o]) - f.dist[i]) > Math.max(0.05, f.dist[i] * 0.002)) note('praia', i);
    const lk = Ag.look(i); if (lk && (Math.abs(L[o] - Math.round(lk.col[0])) > 1 || Math.abs(L[o + 3] - Math.round(G.clamp(lk.clar / 1.25, 0, 1) * 255)) > 1)) note('cor', i);
    if (Math.abs(Wt[o] / 255 - Ag.wet(i)) > 0.005) note('molhado', i);
    const x = i % N, y = (i / N) | 0; const pz = S.type[i] <= T.RIVER ? 0 : Math.max(Ag.puddle(x + 0.25, y + 0.25), Ag.puddle(x + 0.75, y + 0.25), Ag.puddle(x + 0.25, y + 0.75), Ag.puddle(x + 0.75, y + 0.75)); if (Math.abs(Wt[o + 1] / 255 - pz) > 0.005) note('poça', i);
    if (Math.abs(Wt[o + 2] / 255 - Ag.spray(i)) > 0.005) note('borrifo', i); }
  S.weather.rain = 0;
  ok('g4', !bad, `${n} casas: os retratos da corrente, da espuma, da praia, da cor, do molhado, das poças e do borrifo contra o G.Agua — ${bad} fora${ex.length ? ' (' + ex.join('; ') + ')' : ''}`);
}

if (on('g5')) {
  S = novo(); N = G.N; let mx = 0, ang = 0, diff = 0; const t = R3.time(); const w = [R3.U.wind.value.x, R3.U.wind.value.y, R3.U.wind.value.z];
  for (let q = 0; q < 400; q++) { let X, Z; do { X = G.hash(q * 3 + 1) * N * TL; Z = G.hash(q * 7 + 2) * N * TL; q++; } while (S.type[W.idx(X / TL, Z / TL)] > T.SEA && q < 4000);
    const r = G.FX3D.shipRide(X, Z, q * 0.7, [13, 3.8, 10]); const dep = G.SEA * HM - (W.hAt(X / TL, Z / TL) * HM - G.Space.bedDrop(X / TL, Z / TL));
    diff = Math.max(diff, Math.abs(r[0] - Ag.waveY(X, Z, t, w, 1, dep))); mx = Math.max(mx, Math.abs(r[0])); ang = Math.max(ang, Math.abs(r[1]), Math.abs(r[2])); }
  const gl = Ag.waveGLSL(); const miss = Object.entries(Ag.WAVE).filter(([k, v]) => !gl.includes(String(v))).map(([k]) => k);
  // (each shader finds its place in three.js's own pieces: run the patches on the library's shaders, as the renderer would)
  const patched = []; const tryMat = (m, need) => { const sh = { uniforms: {}, vertexShader: THREE.ShaderLib.phong.vertexShader, fragmentShader: THREE.ShaderLib.phong.fragmentShader }; m.onBeforeCompile(sh); for (const n of need) if (!(sh.vertexShader + sh.fragmentShader).includes(n)) patched.push(n); };
  tryMat(MAT.water, ['aguaWaveY(wp.xz', 'texture2D(uLook', 'aguaCloud(', 'uShoreT', 'laceF']); tryMat(MAT.fall, ['vF = aF', 'diffuseColor = vec4(c, a)', 'totalEmissiveRadiance += gFallGlow']);
  { const lm = G.Ground3D.material(); const sh = { uniforms: {}, vertexShader: THREE.ShaderLib.lambert.vertexShader, fragmentShader: THREE.ShaderLib.lambert.fragmentShader }; lm.onBeforeCompile(sh); for (const n of ['aguaWetGround(c, vGP', 'outgoingLight += gAgSheen']) if (!sh.fragmentShader.includes(n)) patched.push('chão: ' + n); }
  { const sm = new THREE.MeshLambertMaterial({ vertexColors: true }); const mats0 = R3.mats; R3.mats = () => ({ solid: sm }); G.Build3D.dress(sm); const sh = { uniforms: {}, vertexShader: THREE.ShaderLib.lambert.vertexShader, fragmentShader: THREE.ShaderLib.lambert.fragmentShader }; sm.onBeforeCompile(sh); R3.mats = mats0; for (const n of ['aguaWetSolid(diffuseColor.rgb', 'outgoingLight += gAgSheen']) if (!sh.fragmentShader.includes(n)) patched.push('telhado: ' + n); }
  ok('g5', mx <= 0.15 && ang < 0.12 && diff < 1e-9 && !miss.length && !patched.length, `o navio na onda: a altura a da G.Agua.waveY (diferença ${diff.toExponential(1)}), no máximo ${(mx * 100).toFixed(1)} cm, o balanço até ${(ang * 57.3).toFixed(1)}°; os números da onda no sombreador: ${miss.length ? 'FALTAM ' + miss.join(',') : 'todos'}; os remendos dos sombreadores: ${patched.length ? 'PERDIDOS ' + patched.join(', ') : 'todos no lugar'}`);
}

if (on('g6')) {
  const lines = []; let good = true; const chk = () => { const fc = A3.fallCheck(), wc = A3.waterCheck(); return fc.bad || wc.bad ? (fc.out[0] || wc.ex) : ''; };
  S = novo(); N = G.N; light(); const fl = S.relief.falls.filter(f => !f.sub).sort((a, b) => (b.tot || b.drop) - (a.tot || a.drop))[0]; const cx = Math.floor(fl.x / 16), cy = Math.floor(fl.y / 16);
  const near = () => { held = []; for (let y = cy - 1; y <= cy + 1; y++) for (let x = cx - 1; x <= cx + 1; x++) if (x >= 0 && y >= 0 && x < NC() && y < NC()) held.push(build(x, y)); };
  near(); const c0 = chk(); G.Powers.raise(fl.tx + 0.5, fl.ty + 0.5); light(); near(); const c1 = chk(); lines.push(`a terra erguida sob o poço: antes ${c0 || 'limpo'}, depois ${c1 || 'limpo'}`); good = good && !c0 && !c1;
  S = novo(); N = G.N; light(); const stA = Ag.steps(0, 0, N, N); let wb = null, wn = -1;
  for (let i = 0; i < N * N; i++) { if (S.type[i] !== T.RIVER || !S.deep[i] || S.road[i]) continue; const x = i % N, y = (i / N) | 0; const n = stA.filter(s => Math.hypot(s.x - x, s.y - y) < 6 && (S.deep[s.i] || S.deep[s.j])).length; if (n > wn) { wn = n; wb = [x, y]; } }
  G.Powers.winter(wb[0] + 0.5, wb[1] + 0.5); light(); buildAll(); let frozen = 0; for (const h of held) { const g = h.g.falls; if (!g) continue; const F = g.attributes.aF.array; for (let k = 3; k < F.length; k += 4) if (F[k] === 2) { frozen++; break; } }
  const c2 = chk(); lines.push(`o inverno súbito: ${frozen} pedaços com lâmina congelada, ${c2 || 'limpo'}`); good = good && frozen > 0 && !c2;
  S = novo(); N = G.N; light(); const sb = Ag.steps(0, 0, N, N)[0]; S.road[sb.i] = 1; held = [build(Math.floor(sb.x / 16), Math.floor(sb.y / 16))]; const has = (held[0].g.falls ? held[0].g.falls.userData.steps : []).some(s => s.i === sb.i && s.j === sb.j); const c3 = chk(); S.road[sb.i] = 0;
  lines.push(`a ponte sobre o degrau em ${sb.x},${sb.y}: ${has ? 'COM lâmina' : 'sem lâmina'}, ${c3 || 'limpo'}`); good = good && !has && !c3;
  S = novo('suave'); N = G.N; let px = -1, py = -1; for (let y = 4; y < N - 4 && px < 0; y++) for (let x = 4; x < N - 4; x++) { if (S.type[y * N + x] > T.SEA) continue; if (G.Powers.check({ id: 'seapart' }, x + 0.5, y + 0.5)) { px = x; py = y; break; } }
  G.Powers.seapart(px + 0.5, py + 0.5); M.viver(6); light(); held = [build(Math.floor(px / 16), Math.floor(py / 16))]; const walls = held[0].g.walls ? held[0].g.walls.attributes.position.count / 6 : 0; const c4 = chk();
  lines.push(`o mar aberto: ${walls} quadrados de parede de água, ${c4 || 'limpo'}`); good = good && walls > 0 && !c4;
  S = novo(); N = G.N; light(); const a = build(cx, cy).g; M.salvarCarregar(); light(); const b = build(cx, cy).g; const pa = Array.from(a.falls.attributes.position.array), pb = Array.from(b.falls.attributes.position.array);
  const same = pa.length === pb.length && pa.every((v, k) => Math.abs(v - pb[k]) < 0.02); lines.push(`o save e o load: a lâmina da maior queda ${same ? 'a mesma' : 'OUTRA'} (${pa.length / 3} pontos)`); good = good && same;
  // (the e15 of the encarna, in the world «cidade»: the bank of 30,44 — water drawn over its edge — under a road the town lays while the body
  // lives on; the near picture is made again at the realm's next look: until then stale, not judged; past its time, judged — T-1550)
  M.pronto('cidade'); S = G.S; N = G.N; light(); const ci = 44 * N + 30; const mk = () => { const h = build(1, 2); h.ch.sig = R3.sigOf(1, 2); h.ch.sigT = S.clock; return h; };
  held = [mk()]; const w0 = A3.waterCheck(); S.road[ci] = 1; const w1 = A3.waterCheck(); const k0 = S.clock; S.clock += 3; const w2 = A3.waterCheck(); S.clock = k0; held = [mk()]; const w3 = A3.waterCheck(); S.road[ci] = 0;
  lines.push(`a margem de 30,44 na «cidade» sob uma estrada nova: antes ${w0.bad} fora de ${w0.n}; logo depois, a imagem por refazer ${w1.stale ? 'esperada' : 'JULGADA'} (${w1.bad} fora); 3 s do mundo sem refazer, ${w2.bad ? 'acusada (' + w2.ex + ')' : 'NÃO ACUSADA'}; refeita, ${w3.bad} fora de ${w3.n}`);
  good = good && !w0.bad && w1.stale === 1 && !w1.bad && w2.bad === 1 && !w3.bad;
  ok('g6', good, lines.join(' · '));
}

if (on('g7')) {
  S = novo(); N = G.N; light(); const per = []; let fallT = 0, watT = 0, withF = 0; const t0 = process.hrtime.bigint();
  for (const h of buildAll()) { const ft = h.g.falls ? h.g.falls.attributes.position.count / 3 : 0, wt = h.g.water ? h.g.water.attributes.position.count / 3 : 0; fallT += ft; watT += wt; if (ft) { withF++; per.push(ft); } }
  const ms = Number(process.hrtime.bigint() - t0) / 1e6; per.sort((a, b) => b - a);
  const far = buildAll(true).reduce((a, h) => a + (h.g.falls ? h.g.falls.attributes.position.count / 3 : 0), 0);
  ok('g7', per[0] < 6000, `um mundo montanhoso de ${NC() * NC()} pedaços: a água ${watT} triângulos, as lâminas ${fallT} (${withF} pedaços com degrau — uma chamada a mais em cada; o mais cheio ${per[0]}, a mediana ${per[per.length >> 1]}); de longe, as lâminas das quedas ${far}; montar tudo ${ms.toFixed(0)} ms (${(ms / (NC() * NC())).toFixed(1)} por pedaço)`);
}

const er = M.erros(); const bad = Object.keys(er.mod).length || er.console.length;
console.log(bad ? 'erros: ' + JSON.stringify(er).slice(0, 300) : 'erros: nenhum');
console.log(fails.length || bad ? `FALHOU: ${fails.join(', ')}` : 'PASSOU');
process.exit(fails.length || bad ? 1 : 0);
