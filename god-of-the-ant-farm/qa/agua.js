// agua: a água como o mundo a guarda (G.Agua, js/agua.js; D-505 a D-510).   [ONLY=a1,a3] node qa/agua.js [semente]   (≈ 3 min)
// O G.Agua é uma fonte pura: a corrente de cada rio e lago (o rumo, a velocidade, a vazão — achada pela foz, do que o save tem), os
// degraus da água (as quedas com nome, as corredeiras), a cor pelo lugar, a espuma com causa, a distância à praia, o molhado e as poças,
// a onda desenhada. A fase A só desenha: o mundo fica igual byte a byte.
// a1 a corrente: em mundos de cada relevo, toda casa de rio com caminho à foz ou a um lago tem rumo (≥ 95 %), de acordo com o sentido
//    verdadeiro do gerador (o down[] do hydro, pego antes de ser jogado fora: ≥ 95 %); o meio dos lagos lento; a mesma corrente depois de
//    um save e um load; e a corrente do 3D de antes (a da descida, flowTick) perdia o rio da planície — esta não;
// a2 pura: ler tudo (a corrente, os degraus, a cor, a espuma, o molhado, as poças, a onda) não muda o save (igual byte a byte) nem tira
//    de acaso nenhum (o S.rng igual); duas leituras, os mesmos números; um mundo novo e um load começam de novo;
// a3 os degraus: toda queda do mundo (S.relief.falls) é um degrau, com o nome dela; nenhum degrau numa ponte, num prédio ou no gelo;
//    as faces de cima e de baixo, as da água; as corredeiras abaixo de 1,2 m, as quedas acima;
// a4 os casos ruins: o deus ergue e afunda a terra no meio de um rio com queda (a corrente e os degraus seguem o chão novo); o inverno
//    súbito (sem corrente sob o gelo, a queda congelada); o mar aberto ao meio (o fundo seco não é água, nem praia, nem degrau); a ponte
//    nova sobre um degrau (o degrau some ali); o save e o load no meio; a borda do mapa (a foz na borda, a onda e a poça fora dele);
// a5 a onda desenhada: nunca passa de 15 cm, em qualquer vento e hora; morre na água rasa (nada na última dezena de centímetros);
// a6 a chuva que molha: o molhado sobe com a chuva que cai e com o S.wet do mundo, e seca com ele; o rio turvo depois da chuva, limpo
//    depois de secar; as poças só onde o chão as guarda (plano, fora da água, de prédio e de muro);
// a7 o mundo igual: a mesma semente vivida 30 s lendo a água a cada passo e sem ler — o mesmo save; e o verificador «agua» calado.
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js'] });
const SEED = +(process.argv[2] || 4242);
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const on = k => !ONLY || ONLY.includes(k);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | agua ${name} | ${info}`); if (!c) fails.push(name); };
const Ag = G.Agua, W = G.W, T = G.T;
// (the true downstream of each tile, kept as the generator made it)
let down = null; const hydro0 = G.Relief.hydro; G.Relief.hydro = function (S, ctx) { const r = hydro0.call(this, S, ctx); down = Int32Array.from(r.down); return r; };
const novo = (relevo, seed) => M.novo({ seed: seed || SEED, type: 'continente', size: 192, tribes: 4, temper: 'normal', clima: 'variado', relevo: relevo || 'montanhoso' });
const qaAgua = () => { const out = []; for (const f of QA.more) { try { f((type, sev, msg) => { if (type === 'agua') out.push(msg); }, G.S); } catch (e) { out.push('erro: ' + e.message); } } return out; };
let S, N;

if (on('a1')) {
  const lines = []; let good = true;
  for (const relevo of ['plano', 'suave', 'montanhoso', 'alpino']) {
    S = novo(relevo); N = G.N; const f = Ag.field();
    let riv = 0, way = 0, cmp = 0, agree = 0, lake = 0, lakeSlow = 0, basin = 0, old = 0;
    for (let i = 0; i < N * N; i++) {
      if (S.type[i] !== T.RIVER) continue; const k = G.Waters.kind(i % N, (i / N) | 0); if (k === 'lake') { lake++; if (f.sp[i] < 0.25) lakeSlow++; continue; }
      riv++; const l = Math.hypot(f.dx[i], f.dz[i]); if (l > 0.5) way++; else if (f.par[i] === -3) basin++;
      const d = down[i]; if (d >= 0 && l > 0.5) { cmp++; const ex = (d % N) - (i % N), ey = ((d / N) | 0) - ((i / N) | 0); if (f.dx[i] * ex + f.dz[i] * ey > 0) agree++; }
      // (the 3D of before: the way down the levels only — none where the levels lie flat)
      const x = i % N, y = (i / N) | 0; let drop = 0; for (const [ex, ey] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const nx = x + ex, ny = y + ey; if (!W.inb(nx, ny)) continue; const j = ny * N + nx; const t = S.type[j]; const h = t === T.RIVER ? S.wl[j] : t <= T.SEA ? G.SEA : NaN; if (h === h && S.wl[i] - h > drop) drop = S.wl[i] - h; }
      if (drop > 0) old++;
    }
    const cover = (way + basin) / riv, ag = agree / Math.max(1, cmp);
    M.salvarCarregar(); const f2 = Ag.field(); let same = true; for (let i = 0; i < N * N; i++) if (f2.dx[i] !== f.dx[i] || f2.sp[i] !== f.sp[i]) { same = false; break; }
    good = good && cover >= 0.95 && ag >= 0.95 && lakeSlow >= lake * 0.85 && same && f2 !== f;
    lines.push(`${relevo}: rio ${riv}, com rumo ${(100 * way / riv).toFixed(1)}% (+ fundo de bacia ${basin}; o 3D de antes: ${(100 * old / riv).toFixed(1)}% com descida), de acordo com o gerador ${(100 * ag).toFixed(1)}% de ${cmp}; lagos lentos ${lakeSlow}/${lake}; depois do load ${same ? 'a mesma' : 'OUTRA'} (refeita: ${f2 !== f ? 'sim' : 'NÃO'})`);
  }
  ok('a1', good, lines.join(' · '));
}

if (on('a2')) {
  S = novo('montanhoso'); N = G.N; const rng0 = JSON.stringify(S.rng), sv0 = G.Save.serialize();
  const read = () => { const f = Ag.fresh(); let h = 0; const st = Ag.steps(0, 0, N, N); for (const s of st) h = (h * 31 + Math.round(s.drop * 1000) + s.i) | 0;
    for (let i = 0; i < N * N; i++) { const l = Ag.look(i), fo = Ag.foam(i); h = (h * 7 + (l ? l.col[0] + l.col[1] * 3 + Math.round(l.clar * 100) : 0) + Math.round(fo[0] * 100) + Math.round(Ag.wet(i) * 100) + Math.round(Ag.puddle((i % N) + 0.5, ((i / N) | 0) + 0.5) * 100) + Math.round(f.sp[i] * 1000)) | 0; }
    for (let q = 0; q < 50; q++) h = (h * 3 + Math.round(Ag.waveY(q * 7.3, q * 3.1, q * 0.7, [1, 0.5, 0.8], q & 1, 3) * 1e5)) | 0; return h; };
  const h1 = read(), h2 = read();
  const sv1 = G.Save.serialize(), rng1 = JSON.stringify(S.rng);
  const f1 = Ag.field(); S = novo('montanhoso'); const f2 = Ag.field();
  ok('a2', sv0 === sv1 && rng0 === rng1 && h1 === h2 && f1 !== f2, `ler a água inteira (${N * N} casas: a corrente, os degraus, a cor, a espuma, o molhado, as poças, a onda): o save ${sv0 === sv1 ? 'igual byte a byte' : 'MUDOU'} (${sv0.length} bytes), o acaso ${rng0 === rng1 ? 'igual' : 'MUDOU'}; duas leituras ${h1 === h2 ? 'iguais' : 'DIFERENTES'}; o mundo novo refaz a corrente: ${f1 !== f2 ? 'sim' : 'NÃO'}`);
}

if (on('a3')) {
  S = novo('montanhoso'); N = G.N; const st = Ag.steps(0, 0, N, N); const key = s => s.i * 4 + (s.tx > s.x ? 0 : s.tx < s.x ? 1 : s.ty > s.y ? 2 : 3); const ks = new Map(st.map(s => [key(s), s]));
  let falls = 0, have = 0, named = 0, namedOk = 0; const bad = [];
  for (const fl of S.relief.falls) { falls++; const i = fl.y * N + fl.x; const s = ks.get(i * 4 + (fl.tx > fl.x ? 0 : fl.tx < fl.x ? 1 : fl.ty > fl.y ? 2 : 3)); if (s) have++; if (fl.name) { named++; if (s && s.name === fl.name) namedOk++; } }
  for (const s of st) { if (S.road[s.i] || S.road[s.j] || S.occ[s.i] || S.occ[s.j]) bad.push('ponte/prédio'); if (Math.abs(s.top - (S.wl[s.i] * 1.5 + 0.05)) > 1e-6) bad.push('face de cima'); if (s.kind !== (s.dq >= Ag.FALL - 0.02 ? 'queda' : 'corredeira')) bad.push('tipo'); if (s.dq < Ag.STEP || s.drop < Ag.STEP - 0.012) bad.push('sem queda'); }
  const q = st.filter(s => s.kind === 'queda').length, c = st.length - q;
  ok('a3', have === falls && namedOk === named && !bad.length, `${falls} quedas do mundo, ${have} são degraus da água; com nome ${namedOk}/${named}; ${st.length} degraus (${q} quedas, ${c} corredeiras); ${bad.length} erros${bad.length ? ' (' + bad.slice(0, 3).join(', ') + ')' : ''}`);
}

if (on('a4')) {
  S = novo('montanhoso'); N = G.N; const lines = []; let good = true; const check = () => { const o = qaAgua(); return o; };
  // (the biggest fall: the god raises the land under its pool, and sinks it again)
  const fl = S.relief.falls.filter(f => !f.sub).sort((a, b) => (b.tot || b.drop) - (a.tot || a.drop))[0]; const i0 = fl.y * N + fl.x, j0 = fl.ty * N + fl.tx;
  const f0 = Ag.field(); const v0 = S.typeVer; G.Powers.raise(fl.tx + 0.5, fl.ty + 0.5); const f1 = Ag.field();
  const stR = Ag.steps(fl.x - 3, fl.y - 3, 7, 7); const o1 = check();
  lines.push(`a terra erguida sob o poço da queda ${fl.name || ''}: o chão mudou ${S.typeVer !== v0 ? 'sim' : 'NÃO'}, a corrente refeita ${f1 !== f0 ? 'sim' : 'NÃO'}, ${stR.length} degraus em volta, o verificador ${o1.length ? o1[0] : 'calado'}`);
  good = good && S.typeVer !== v0 && f1 !== f0 && !o1.length;
  G.Powers.sink(fl.tx + 0.5, fl.ty + 0.5); const o2 = check(); lines.push(`e afundada: ${o2.length ? o2[0] : 'calado'}`); good = good && !o2.length;
  // (a sudden winter over a river: no current under the ice, the falls frozen)
  S = novo('montanhoso'); N = G.N; const stA = Ag.steps(0, 0, N, N); let wb = null, wn = -1;
  for (let i = 0; i < N * N; i++) { if (S.type[i] !== T.RIVER || !S.deep[i] || S.road[i]) continue; const x = i % N, y = (i / N) | 0; const n = stA.filter(s => Math.hypot(s.x - x, s.y - y) < 6 && (S.deep[s.i] || S.deep[s.j])).length; if (n > wn) { wn = n; wb = [x, y]; } }
  G.Powers.winter(wb[0] + 0.5, wb[1] + 0.5); const iced = []; for (let i = 0; i < N * N; i++) if (S.ice && S.ice[i]) iced.push(i);
  const under = iced.filter(i => Ag.flow(i).sp > 0).length; const frz = Ag.steps(0, 0, N, N).filter(s => s.frozen).length; const o3 = check();
  lines.push(`o inverno súbito: ${iced.length} casas de gelo, ${under} com corrente, ${frz} degraus congelados, o verificador ${o3.length ? o3[0] : 'calado'}`); good = good && iced.length > 0 && !under && !o3.length;
  // (the sea parted: its bed is not water, not shore, no step falls into it)
  S = novo('suave'); N = G.N; let px = -1, py = -1;
  for (let y = 4; y < N - 4 && px < 0; y++) for (let x = 4; x < N - 4; x++) { if (S.type[y * N + x] > T.SEA) continue; G.Powers.why = ''; if (G.Powers.check({ id: 'seapart' }, x + 0.5, y + 0.5)) { px = x; py = y; break; } }
  if (px >= 0) { G.Powers.seapart(px + 0.5, py + 0.5); M.viver(6); const dry = []; for (let i = 0; i < N * N; i++) if (S.dry && S.dry[i]) dry.push(i);
    const wetBed = dry.filter(i => Ag.level(i) === Ag.level(i)).length, stepIn = Ag.steps(0, 0, N, N).filter(s => S.dry && S.dry[s.j]).length, shoreIn = dry.filter(i => Ag.shore(i)[0] > 0).length; const o4 = check();
    lines.push(`o mar aberto: ${dry.length} casas de fundo seco, ${wetBed} com nível de água, ${stepIn} degraus caindo nele, ${shoreIn} com distância à praia, o verificador ${o4.length ? o4[0] : 'calado'}`); good = good && dry.length > 0 && !wetBed && !stepIn && !shoreIn && !o4.length; }
  else { lines.push('o mar aberto: sem lugar'); good = false; }
  // (a bridge over a step: the step is gone there)
  S = novo('montanhoso'); N = G.N; const sb = Ag.steps(0, 0, N, N).filter(s => s.kind === 'corredeira')[0]; S.road[sb.i] = 1; const gone = !Ag.steps(sb.x, sb.y, 1, 1).some(s => s.j === sb.j); S.road[sb.i] = 0;
  lines.push(`a ponte sobre um degrau em ${sb.x},${sb.y}: o degrau ${gone ? 'some' : 'FICA'} ali`); good = good && gone;
  // (save and load in the middle: the same water)
  const fa = Ag.fresh(); M.viver(3); M.salvarCarregar(); const fb = Ag.field(); let same = 0, n = 0; for (let i = 0; i < N * N; i++) { if (G.S.type[i] !== T.RIVER) continue; n++; if (Math.abs(fa.sp[i] - fb.sp[i]) < 1e-6 && Math.abs(fa.dx[i] - fb.dx[i]) < 1e-6) same++; }
  lines.push(`o save e o load no meio: ${same}/${n} casas de rio com a mesma corrente`); good = good && same === n;
  // (the edge of the map: the mouth at the edge, the wave and the puddle outside it)
  S = G.S; N = G.N;
  const wv = [Ag.waveY(-50, -50, 3, [1, 1, 1], 1, 9), Ag.waveY(N * 4 + 80, 9, 3, [1, 1, 1], 1, 9)]; const pz = [Ag.puddle(-1, 3), Ag.puddle(N + 2, 3)];
  // (the generator puts no land at the map's edge — the sea goes round every map —: a river made by the proof's hand on the west edge, its
  // first tile against the edge, runs out there (the edge is a mouth); every tile of it has a way, every number is a number)
  let edgeLand = 0; for (let k = 0; k < N; k++) for (const i of [k, (N - 1) * N + k, k * N, k * N + N - 1]) if (S.type[i] >= T.SAND) edgeLand++;
  const ey = N >> 1; for (let x = 0; x < 3; x++) { S.type[ey * N + x] = T.RIVER; S.wl[ey * N + x] = G.SEA + 0.3 + x * 0.04; } S.typeVer = (S.typeVer || 0) + 1;
  const fe = Ag.field(); const mouth = fe.par[ey * N] === -2; let finite = true; for (let i = 0; i < N * N && finite; i++) if (!Number.isFinite(fe.dx[i]) || !Number.isFinite(fe.sp[i]) || !Number.isFinite(fe.dist[i])) finite = false;
  const way = fe.dx[ey * N] < -0.5; /* (the tile against the edge runs out over it; the two beside it, with the sea on both sides, run to it as they can) */ const past = Ag.steps(-6, -6, N + 12, N + 12).length === Ag.steps(0, 0, N, N).length;
  lines.push(`a borda: ${edgeLand} casas de terra na borda do mapa (o gerador não as faz); o rio feito à mão na borda oeste: ${mouth ? 'a borda é a foz' : 'A BORDA NÃO É FOZ'}, ${way ? 'a casa da borda corre para fora' : 'A CASA DA BORDA NÃO CORRE PARA FORA'}, ${finite ? 'tudo com número' : 'NÚMERO FALTANDO'}; os degraus pedidos além da borda ${past ? 'os mesmos' : 'OUTROS'}; a onda fora do mapa ${wv.every(Number.isFinite) ? 'com número' : 'SEM NÚMERO'}, a poça fora ${pz.join(',')}`);
  good = good && mouth && way && finite && past && wv.every(Number.isFinite) && !pz[0] && !pz[1];
  ok('a4', good, lines.join(' · '));
}

if (on('a5')) {
  let mx = 0, shallow = 0, n = 0;
  for (let q = 0; q < 20000; q++) { const X = (q * 7.31) % 900, Z = (q * 3.77) % 900, t = q * 0.137; const ws = (q % 5) * 0.5; const a = q * 0.61; const w = [Math.cos(a) * (0.35 + ws), Math.sin(a) * (0.35 + ws), ws];
    const y = Ag.waveY(X, Z, t, w, q & 1, 0.3 + (q % 7)); mx = Math.max(mx, Math.abs(y)); n++; if (Math.abs(Ag.waveY(X, Z, t, w, 1, 0.04)) > 0) shallow++; }
  ok('a5', mx <= Ag.WAVE.cap + 1e-9 && mx > 0.05 && !shallow, `${n} pontos, vento de 0 a 2, mar e rio: a maior onda desenhada ${(mx * 100).toFixed(1)} cm (o teto: ${Ag.WAVE.cap * 100} cm — quem nada e o navio ficam a no máximo isso da água que se vê); na água de 4 cm, ${shallow} com onda`);
}

if (on('a6')) {
  S = novo('suave'); N = G.N; const lines = []; let good = true;
  S.weather.rain = 0; S.weather.storm = 0; S.clouds.length = 0; for (let i = 0; i < N * N; i++) S.wet[i] = 0;
  const land = []; for (let i = 0; i < N * N; i++) if (S.type[i] >= T.SAND && !S.occ[i]) land.push(i);
  const mean = () => land.reduce((a, i) => a + Ag.wet(i), 0) / land.length;
  const dry0 = mean(); S.weather.rain = 0.8; const rain1 = mean(); S.weather.rain = 0; for (const i of land) S.wet[i] = 0.9; const kept = mean();
  // (the river turbid after the rain: the land round it wet; clear when it dries)
  let riv = -1; for (let i = 0; i < N * N && riv < 0; i++) if (S.type[i] === T.RIVER && G.Waters.kind(i % N, (i / N) | 0) === 'river') riv = i;
  const tur1 = Ag.turbid(riv), lk1 = Ag.look(riv); for (const i of land) S.wet[i] = 0; const tur0 = Ag.turbid(riv), lk0 = Ag.look(riv);
  lines.push(`o molhado da terra: seca ${dry0.toFixed(2)}, chovendo ${rain1.toFixed(2)}, o chão molhado depois (S.wet) ${kept.toFixed(2)}, seco de novo ${mean().toFixed(2)}`);
  lines.push(`o rio em ${riv % N},${(riv / N) | 0}: turvo ${tur1.toFixed(2)} com a terra molhada (clareza ${lk1.clar.toFixed(2)}), ${tur0.toFixed(2)} seca (clareza ${lk0.clar.toFixed(2)})`);
  good = good && dry0 === 0 && rain1 > 0.6 && kept > 0.8 && mean() === 0 && tur1 > 0.5 && tur0 === 0 && lk1.clar < lk0.clar;
  // (the puddles: only on flat ground, never on water, a building, a wall)
  let pz = 0, bad = 0, steepP = 0; for (let i = 0; i < N * N; i++) { const x = i % N, y = (i / N) | 0; const p = Ag.puddle(x + 0.5, y + 0.5); if (p > 0) { pz++; if (S.type[i] <= T.RIVER || S.occ[i] || S.wall[i]) bad++; if (S.slope && S.slope[i] > 2) steepP++; } }
  lines.push(`poças possíveis em ${pz} casas (${(100 * pz / (N * N)).toFixed(1)}%), ${bad} na água, num prédio ou num muro, ${steepP} em encosta íngreme`); good = good && pz > 50 && !bad && !steepP;
  ok('a6', good, lines.join(' · '));
}

if (on('a7')) {
  const run = read => { M.novo({ seed: SEED, type: 'continente', size: 128, tribes: 3, temper: 'normal', clima: 'variado', relevo: 'montanhoso' }); const n = G.N; S = G.S; S.weather.rain = 0.6;
    for (let k = 0; k < 30; k++) { M.viver(1); if (read) { Ag.field(); Ag.steps(0, 0, n, n); for (let i = 0; i < n * n; i += 7) { Ag.look(i); Ag.wet(i); Ag.puddle((i % n) + 0.5, ((i / n) | 0) + 0.5); } } }
    return G.Save.serialize(); };
  const a = run(true), b = run(false); const v = qaAgua();
  ok('a7', a === b && !v.length, `a mesma semente vivida 30 s lendo a água a cada segundo e sem ler: o save ${a === b ? 'igual' : 'DIFERENTE'} (${a.length} bytes); o verificador «agua» ${v.length ? v[0] : 'calado'}`);
}

const er = M.erros(); const bad = Object.keys(er.mod).length || er.console.length;
console.log(bad ? 'erros: ' + JSON.stringify(er).slice(0, 300) : 'erros: nenhum');
console.log(fails.length || bad ? `FALHOU: ${fails.join(', ')}` : 'PASSOU');
process.exit(fails.length || bad ? 1 : 0);
