// natureza: fotos fixas do chão e da natureza do 3D (A3) — Hedeby, a metrópole e cada bioma de um mundo feito por uma
// semente fixa (o mesmo mundo, o mesmo lugar, a mesma câmera, a mesma hora em toda rodada: serve para antes/depois)
//   bash qa/navegador.sh node qa/visual/natureza.js PASTA_DO_JOGO PASTA_DAS_FOTOS [nome,nome...]
//   (Q=media|alta|baixa; VW/VH o tamanho; MEDE=1 também conta triângulos e chamadas de desenho de cada vista)
// O aquecimento (os pedaços de chão perto do corpo sendo feitos, a pintura do chão) roda sem desenhar a tela — só a foto
// final é desenhada: por software cada quadro custa segundos, e os do aquecimento não aparecem na foto
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = process.argv[2]; const OUT = process.argv[3]; const ONLY = (process.argv[4] || '').split(',').filter(Boolean);
fs.mkdirSync(OUT, { recursive: true });
const SEED = 4242; // (the world of the biomes: continente 192, clima variado)
const VIEWS = [
  // name, world, place, yaw (camera), pitch, dist, hour
  ['hedeby-mata', 'cidade', 'forest', 3.6, 0.18, 4.8, 0.42],
  ['hedeby-praia', 'cidade', 'beach', 1.2, 0.2, 5.2, 0.42],
  ['hedeby-praca', 'cidade', 'praca', 0.55, 0.22, 5.2, 0.42],
  ['hedeby-rua-alto', 'cidade', 'praca', 3.9, 0.48, 9, 0.42],
  ['hedeby-pedra', 'cidade', 'rock', 2.2, 0.2, 5, 0.42],
  ['hedeby-encosta', 'cidade', 'slope', 1.0, 0.3, 7, 0.42],
  ['metropole-alto', 'metropole', 'house', 2.2, 0.5, 11, 0.42],
  ['metropole-campo', 'metropole', 'field', 0.9, 0.25, 6, 0.42],
  ['b-temperado', 'gerado', 'b:0', 3.6, 0.2, 5.5, 0.42],
  ['b-neve', 'gerado', 'b:1', 3.6, 0.22, 6, 0.42],
  ['b-taiga', 'gerado', 'b:2', 3.6, 0.2, 5.5, 0.42],
  ['b-pantano', 'gerado', 'b:3', 3.6, 0.2, 5.5, 0.42],
  ['b-selva', 'gerado', 'b:4', 3.6, 0.2, 5.5, 0.42],
  ['b-savana', 'gerado', 'b:5', 3.6, 0.22, 6, 0.42],
  ['b-deserto', 'gerado', 'b:6', 3.6, 0.22, 6, 0.42],
  ['b-temperado-alto', 'gerado', 'b:0', 2.4, 0.5, 12, 0.42],
  ['b-selva-alto', 'gerado', 'b:4', 2.4, 0.5, 12, 0.42],
  ['b-deserto-alto', 'gerado', 'b:6', 2.4, 0.5, 12, 0.42],
  // 21a: inside the jungle at the eye's height, and looking up into its roof; the swamp from above
  ['b-selva-dentro', 'gerado', 'b:4', 3.6, 0.06, 3.4, 0.42],
  ['b-selva-teto', 'gerado', 'b:4', 3.6, -0.32, 2.6, 0.42],
  ['b-pantano-alto', 'gerado', 'b:3', 2.4, 0.5, 12, 0.42],
  // 21b: the relief — an alpine world of a fixed seed (continente 128, falésias, one range: the relief's study's world). The camera's
  // turn (null) is read from the place: toward the peak, the face, the sea, the mouth, out past the edge. A view's eighth field: the
  // weather of its frames (rain); the hour 0.70 is the sun going down
  ['r-serra', 'relevo', 'r:serra', null, -0.05, 5.5, 0.42],
  ['r-serra-tarde', 'relevo', 'r:serra', null, -0.05, 5.5, 0.70],
  ['r-serra-chuva', 'relevo', 'r:serra', null, -0.05, 5.5, 0.42, { rain: 1 }],
  ['r-paredao', 'relevo', 'r:paredao', null, -0.02, 4.5, 0.42],
  ['r-paredao-tarde', 'relevo', 'r:paredao', null, -0.02, 4.5, 0.70],
  ['r-paredao-chuva', 'relevo', 'r:paredao', null, -0.02, 4.5, 0.42, { rain: 1 }],
  ['r-costa', 'relevo', 'r:costa', null, 0.1, 6, 0.42],
  ['r-caverna', 'relevo', 'r:caverna', null, 0.02, 4, 0.42],
  ['r-horizonte', 'relevo', 'r:borda', null, 0.0, 5, 0.42],
  ['r-horizonte-tarde', 'relevo', 'r:borda', null, 0.0, 5, 0.70],
  ['r-alto', 'relevo', 'r:serra', null, 0.42, 40, 0.42],
  ['r-deus', 'relevo', 'deus', null, 0, 0, 0.42],
];
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: +process.env.VW || 1000, height: +process.env.VH || 620 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver|GroupMarker|software WebGL/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900); await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 120000 });
  for (const w of ['cidade', 'metropole']) await page.addScriptTag({ path: path.join(ROOT, 'worlds', w + '.js') });
  let world = null; const log = [];
  for (const [name, w, place, yaw0, pitch, dist, hour, wx] of VIEWS) {
    if (ONLY.length && !ONLY.includes(name)) continue;
    const t0 = Date.now();
    const info = await page.evaluate(([w, place, yaw, pitch, dist, hour, fresh, Q, SEED, wx]) => {
      // (the frames of the warming up are lived but not drawn)
      const quiet = on => { const r = G.Realm.renderer && G.Realm.renderer(); if (!r) return; if (!window.__draw) window.__draw = r.render; r.render = on ? () => { } : window.__draw; };
      const f = n => { for (let k = 0; k < n; k++) G.Main.frameFor(33); }; const until = (c, m) => { for (let k = 0; k < m; k++) { if (c()) return k; G.Main.frameFor(33); } return -1; };
      if (fresh) {
        if (G.Modes.state !== 'GOD') { G.Modes.leave('deus'); until(() => G.Modes.state === 'GOD', 400); }
        G.Realm.setQuality(Q);
        if (w === 'gerado') { G.Main.newGame({ seed: SEED, type: 'continente', size: 192, tribes: 4, temper: 'normal', clima: 'variado', relevo: 'suave' }); }
        else if (w === 'relevo') { G.Main.newGame({ seed: SEED, type: 'continente', size: 128, tribes: 2, temper: 'normal', clima: 'variado', relevo: 'alpino', costa: 'falesias', cordilheiras: 'uma' }); }
        else G.Save.apply(JSON.parse(G.Ready.data[w]));
        G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); document.querySelector('#intro') && document.querySelector('#intro').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
        const S = G.S; const s = [...S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0];
        const v = [...S.villagers.values()].filter(o => (!s || o.set === s.id) && o.age >= 16 && !o.inside && G.Possess.can(o).ok).sort((a, b) => a.id - b.id)[0];
        G.Modes.enter(v); until(() => G.Modes.state === 'INC', 300); quiet(true); f(6);
      }
      quiet(true);
      const S = G.S, N = G.N, T = G.T, W = G.W; const s = [...S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0];
      const near = (x, y) => { for (let r = 0; r < 6; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const X = x + dx, Y = y + dy; if (W.inb(X, Y) && W.walkableXY(X, Y) && !S.treeAt[W.idx(X, Y)]) return [X, Y]; } return [x, y]; };
      // (the best tile of the map for a view: the highest score, the first one on a tie — the same every run)
      const best = sc => { let at = null, bs = -1; for (let y = 6; y < N - 6; y++) for (let x = 6; x < N - 6; x++) { const i = y * N + x; if (!W.walkable(i) || S.treeAt[i] || S.occ[i] || S.road[i] || S.objAt[i]) continue; const v = sc(i, x, y); if (v > bs) { bs = v; at = [x + 0.5, y + 0.5]; } } return at; };
      const count = (x, y, r, f) => { let n = 0; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (W.inb(x + dx, y + dy) && f((y + dy) * N + x + dx)) n++; return n; };
      let at = null, look = null;
      // 21b: the god's view of the relief, over the highest peak
      if (place === 'deus') {
        if (window.__draw) G.Realm.renderer().render = window.__draw;
        G.Modes.leave('deus'); until(() => G.Modes.state === 'GOD', 400); S.time = hour;
        const pk = S.relief.peaks[0]; const p = G.Render.proj(pk.x, pk.y, W.hAt(pk.x, pk.y));
        G.Render.cam.x = p[0]; G.Render.cam.y = p[1]; G.Render.cam.zoom = G.Render.cam.tz = 1.1; f(20);
        document.querySelectorAll('#hud, #inc-hud, #inc-label, .panel, #news').forEach(e => e.style.visibility = 'hidden'); f(4);
        return { deus: 1, peak: [pk.x, pk.y], err: JSON.stringify(G.modErr) };
      }
      // 21b: the places of the relief (the highest peak of the range, a face of cliff, the coast's cliffs, a cave's mouth, the edge) —
      // and where the eye looks from there
      if (place.startsWith('r:')) {
        const pk = S.relief.peaks[0]; const okT = i => W.walkable(i) && !S.treeAt[i] && !S.occ[i] && !S.road[i] && !S.objAt[i] && S.type[i] !== T.RIVER;
        const bestR = sc => { let a = null, bs = -1e9; for (let y = 4; y < N - 4; y++) for (let x = 4; x < N - 4; x++) { const i = y * N + x; if (!okT(i)) continue; const v = sc(i, x, y); if (v > bs) { bs = v; a = [x + 0.5, y + 0.5]; } } return a; };
        const mid = (x0, y0, r, fn) => { let sx = 0, sy = 0, n = 0; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (W.inb(x0 + dx, y0 + dy) && fn((y0 + dy) * N + x0 + dx)) { sx += x0 + dx + 0.5; sy += y0 + dy + 0.5; n++; } return n ? [sx / n, sy / n] : null; };
        if (place === 'r:serra') { at = bestR((i, x, y) => -Math.abs(Math.hypot(x - pk.x, y - pk.y) - 46) * 3 - Math.max(0, W.tileH(i) - G.SEA - 5) - count(x, y, 2, j => S.treeAt[j]) * 2); look = [pk.x, pk.y]; }
        else if (place === 'r:paredao') { at = bestR((i, x, y) => { let n = 0, dr = 0; for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const j = (y + dy) * N + x + dx; if (W.inb(x + dx, y + dy) && S.cliff[j]) { n++; dr += W.tileH(j) - W.tileH(i); } } return n > 5 && S.slope[i] < 1.2 ? dr - count(x, y, 2, j => S.treeAt[j]) * 6 : -1e6; }); if (at) look = mid(Math.floor(at[0]), Math.floor(at[1]), 3, j => S.cliff[j]); }
        else if (place === 'r:costa') { at = bestR((i, x, y) => { const sea = count(x, y, 5, j => S.type[j] <= T.SEA); const cl = count(x, y, 5, j => S.cliff[j]); return sea > 6 && sea < 40 && cl > 2 ? cl * 2 + sea * 0.3 - (W.tileH(i) - G.SEA) * 0.3 : -1e6; }); if (at) look = mid(Math.floor(at[0]), Math.floor(at[1]), 6, j => S.cliff[j] || S.type[j] <= T.SEA); }
        else if (place === 'r:caverna') { const ms = []; for (const cv of (G.Caves ? G.Caves.all() : [])) for (const m of cv.mouths) { const k = G.Caves.mouthKind ? G.Caves.mouthKind(m, cv) : m.kind; if (k === 'paredao' || k === 'abrigo' || k === 'fenda') ms.push(m); } ms.sort((a, b) => a.y * N + a.x - (b.y * N + b.x));
          const m = ms[0]; if (m) { const fx = m.fx || 1, fy = m.fy || 0; at = near(m.x + 0.5 + fx * 2.4, m.y + 0.5 + fy * 2.4); look = [m.x + 0.5, m.y + 0.5]; } }
        else if (place === 'r:borda') { const dmin = [N, N, N, N]; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (S.type[y * N + x] >= T.SAND) { const d = [x, N - 1 - x, y, N - 1 - y]; for (let q = 0; q < 4; q++) if (d[q] < dmin[q]) dmin[q] = d[q]; }
          const side = [0, 1, 2, 3].sort((a, b) => dmin[a] - dmin[b] || a - b)[0]; // (the side the land comes nearest to: the same in every copy of the game)
          at = bestR((i, x, y) => { const d = [x, N - x, y, N - y][side]; return S.type[i] === T.SAND || S.type[i] === T.GRASS ? -d * 2 + count(x, y, 4, j => S.type[j] <= T.SEA) * 0.2 - count(x, y, 2, j => S.treeAt[j]) * 3 : -1e6; });
          if (at) look = [[at[0] - 60, at[1]], [at[0] + 60, at[1]], [at[0], at[1] - 60], [at[0], at[1] + 60]][side]; }
        if (at && look) yaw = Math.atan2(look[1] - at[1], look[0] - at[0]);
      }
      const bl = t => [...S.buildings.values()].filter(b => b.type === t && b.built && (!s || b.set === s.id)).sort((a, b) => a.id - b.id)[0];
      if (at) { }
      else if (place === 'praca') { const b = bl('praca') || bl('campfire'); at = near(b.x - 1.2, b.y + b.h / 2); }
      else if (place === 'hut' || place === 'house') { const b = bl(place) || bl('hut') || bl('house'); at = near(b.x + b.w + 1.4, b.y + b.h + 1.4); }
      else if (place === 'forest') at = best((i, x, y) => count(x, y, 4, j => S.treeAt[j]));
      else if (place === 'beach') at = best((i, x, y) => { if (S.type[i] !== T.SAND) return -1; const sc = count(x, y, 5, j => S.type[j] <= T.SEA); return sc > 70 ? -1 : sc; });
      else if (place === 'rock') at = best((i, x, y) => { let n = 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [2, 0], [0, 2]]) { const o = W.inb(x + dx, y + dy) && S.objAt[(y + dy) * N + x + dx]; if (o && S.rocks.get(o)) n += 3; } return n ? n + count(x, y, 3, j => S.treeAt[j]) * 0.1 : -1; });
      else if (place === 'slope') at = best((i, x, y) => { const n = count(x, y, 3, j => S.slope[j] > 2); return n > 3 && S.slope[i] < 1 ? n : -1; });
      else if (place === 'field') at = best((i, x, y) => count(x, y, 3, j => { const b = S.occ[j] && S.buildings.get(S.occ[j]); return !!(b && (b.type === 'farm' || b.type === 'vinhedo' || b.type === 'plantacao')); }));
      else if (place.startsWith('b:')) {
        const id = +place.slice(2); const of = j => (G.Biome.of(j) === id);
        // (deep in the biome, among its trees but with room round the body for the eye — no trunk or bough in its face)
        at = best((i, x, y) => { if (!of(i)) return -1; const pure = count(x, y, 6, of); if (pure < 110) return -1; return 1e4 + pure + count(x, y, 4, j => S.treeAt[j] && of(j)) * 6 - count(x, y, 2, j => S.treeAt[j]) * 40 - count(x, y, 6, j => S.type[j] <= T.RIVER) * 4 - count(x, y, 6, j => S.occ[j]) * 8; });
      }
      if (!at) { quiet(false); return { skip: 'sem lugar' }; }
      G.Avatar.place(at[0], at[1]); S.time = hour; if (wx && wx.rain !== undefined) { S.weather.rain = wx.rain; S.weather.storm = 0; } else if (place.startsWith('r:')) { S.weather.rain = 0; S.weather.storm = 0; } f(30);
      if (yaw === null || yaw === undefined) yaw = 0.3;
      document.querySelectorAll('#inc-hud, #hud, #inc-label').forEach(e => e.style.visibility = 'hidden');
      const st = G.Avatar.state(); st.yaw = 0.3;
      G.Cam3D.OPT.follow = false; G.Cam3D.yaw = yaw; G.Cam3D.pitch = pitch; G.Cam3D.dist = dist; G.Cam3D.cur = dist; f(40); st.yaw = 0.3; G.Cam3D.yaw = yaw; G.Cam3D.pitch = pitch; G.Cam3D.cur = dist;
      // (the photo: drawn for real, three frames — the first one makes the shaders)
      quiet(false); const tq = performance.now(); for (let k = 0; k < 3; k++) { G.Cam3D.yaw = yaw; G.Cam3D.pitch = pitch; G.Cam3D.cur = dist; G.Main.frameFor(1); }
      const m = G.Realm.memory();
      // (21a: the checks of the plants' drawing, which no proof called before — T-1511: the trees round the place, the meadow's field, the forest's layers)
      const chk = [].concat(G.Geo3D && G.Geo3D.check ? G.Geo3D.check() : [], G.Realm.floraCheck ? G.Realm.floraCheck(at[0], at[1], 14) : [], G.Grass3D && G.Grass3D.check ? G.Grass3D.check() : [], G.Mata3D && G.Mata3D.check ? G.Mata3D.check() : []);
      const mata = G.Mata3D ? { inst: G.Mata3D.stats.inst, tris: G.Mata3D.stats.tris, calls: G.Mata3D.stats.calls } : null;
      return { at: at.map(q => +q.toFixed(2)), yaw: +(+yaw).toFixed(2), geo: G.Geo3D && G.Geo3D.stats ? JSON.stringify(G.Geo3D.stats) : '', biome: G.Biome ? G.Biome.of(W.idx(at[0], at[1])) : -1, err: JSON.stringify(G.modErr), calls: m && m.calls, tris: m && m.tris, drawMs: Math.round((performance.now() - tq) / 3), checks: chk.length ? chk.slice(0, 3) : 0, mata };
    }, [w, place, yaw0, pitch, dist, hour, world !== w, process.env.Q || 'media', SEED, wx || null]);
    world = w;
    if (info.skip) { log.push(`${name}: ${info.skip}`); console.log(log[log.length - 1]); continue; }
    await page.screenshot({ path: path.join(OUT, name + '.png'), timeout: +process.env.TSHOT || 240000 }); // (TSHOT: the Alta by software can take longer)
    log.push(`${name}: ${JSON.stringify(info)} (${((Date.now() - t0) / 1000).toFixed(0)} s)`); console.log(log[log.length - 1]);
  }
  console.log('erros: ' + (errs.slice(0, 5).join(' || ') || 'nenhum'));
  fs.writeFileSync(path.join(OUT, 'natureza.txt'), log.join('\n') + '\nerros: ' + (errs.slice(0, 5).join(' || ') || 'nenhum') + '\n');
  await browser.close();
})();
