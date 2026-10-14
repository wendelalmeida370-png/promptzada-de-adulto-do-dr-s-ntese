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
  for (const [name, w, place, yaw, pitch, dist, hour] of VIEWS) {
    if (ONLY.length && !ONLY.includes(name)) continue;
    const t0 = Date.now();
    const info = await page.evaluate(([w, place, yaw, pitch, dist, hour, fresh, Q, SEED]) => {
      // (the frames of the warming up are lived but not drawn)
      const quiet = on => { const r = G.Realm.renderer && G.Realm.renderer(); if (!r) return; if (!window.__draw) window.__draw = r.render; r.render = on ? () => { } : window.__draw; };
      const f = n => { for (let k = 0; k < n; k++) G.Main.frameFor(33); }; const until = (c, m) => { for (let k = 0; k < m; k++) { if (c()) return k; G.Main.frameFor(33); } return -1; };
      if (fresh) {
        if (G.Modes.state !== 'GOD') { G.Modes.leave('deus'); until(() => G.Modes.state === 'GOD', 400); }
        G.Realm.setQuality(Q);
        if (w === 'gerado') { G.Main.newGame({ seed: SEED, type: 'continente', size: 192, tribes: 4, temper: 'normal', clima: 'variado', relevo: 'suave' }); }
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
      let at = null;
      const bl = t => [...S.buildings.values()].filter(b => b.type === t && b.built && (!s || b.set === s.id)).sort((a, b) => a.id - b.id)[0];
      if (place === 'praca') { const b = bl('praca') || bl('campfire'); at = near(b.x - 1.2, b.y + b.h / 2); }
      else if (place === 'hut' || place === 'house') { const b = bl(place) || bl('hut') || bl('house'); at = near(b.x + b.w + 1.4, b.y + b.h + 1.4); }
      else if (place === 'forest') at = best((i, x, y) => count(x, y, 4, j => S.treeAt[j]));
      else if (place === 'beach') at = best((i, x, y) => { if (S.type[i] !== T.SAND) return -1; const sc = count(x, y, 5, j => S.type[j] <= T.SEA); return sc > 70 ? -1 : sc; });
      else if (place === 'rock') at = best((i, x, y) => { let n = 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [2, 0], [0, 2]]) { const o = W.inb(x + dx, y + dy) && S.objAt[(y + dy) * N + x + dx]; if (o && S.rocks.get(o)) n += 3; } return n ? n + count(x, y, 3, j => S.treeAt[j]) * 0.1 : -1; });
      else if (place === 'slope') at = best((i, x, y) => { const n = count(x, y, 3, j => S.slope[j] > 2); return n > 3 && S.slope[i] < 1 ? n : -1; });
      else if (place === 'field') at = best((i, x, y) => count(x, y, 3, j => { const b = S.occ[j] && S.buildings.get(S.occ[j]); return !!(b && (b.type === 'farm' || b.type === 'vinhedo' || b.type === 'plantacao')); }));
      else if (place.startsWith('b:')) {
        const id = +place.slice(2); const of = j => (G.Biome.of(j) === id);
        at = best((i, x, y) => { if (!of(i)) return -1; const pure = count(x, y, 6, of); if (pure < 150) return -1; return pure + count(x, y, 4, j => S.treeAt[j] && of(j)) * 6 - count(x, y, 6, j => S.type[j] <= T.RIVER) * 4 - count(x, y, 6, j => S.occ[j]) * 8; });
      }
      if (!at) { quiet(false); return { skip: 'sem lugar' }; }
      G.Avatar.place(at[0], at[1]); S.time = hour; f(30);
      document.querySelectorAll('#inc-hud, #hud, #inc-label').forEach(e => e.style.visibility = 'hidden');
      const st = G.Avatar.state(); st.yaw = 0.3;
      G.Cam3D.OPT.follow = false; G.Cam3D.yaw = yaw; G.Cam3D.pitch = pitch; G.Cam3D.dist = dist; G.Cam3D.cur = dist; f(40); st.yaw = 0.3; G.Cam3D.yaw = yaw; G.Cam3D.pitch = pitch; G.Cam3D.cur = dist;
      // (the photo: drawn for real, three frames — the first one makes the shaders)
      quiet(false); const tq = performance.now(); for (let k = 0; k < 3; k++) { G.Cam3D.yaw = yaw; G.Cam3D.pitch = pitch; G.Cam3D.cur = dist; G.Main.frameFor(1); }
      const m = G.Realm.memory();
      return { at: at.map(q => +q.toFixed(2)), biome: G.Biome ? G.Biome.of(W.idx(at[0], at[1])) : -1, err: JSON.stringify(G.modErr), calls: m && m.calls, tris: m && m.tris, drawMs: Math.round((performance.now() - tq) / 3) };
    }, [w, place, yaw, pitch, dist, hour, world !== w, process.env.Q || 'media', SEED]);
    world = w;
    if (info.skip) { log.push(`${name}: ${info.skip}`); console.log(log[log.length - 1]); continue; }
    await page.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 });
    log.push(`${name}: ${JSON.stringify(info)} (${((Date.now() - t0) / 1000).toFixed(0)} s)`); console.log(log[log.length - 1]);
  }
  console.log('erros: ' + (errs.slice(0, 5).join(' || ') || 'nenhum'));
  fs.writeFileSync(path.join(OUT, 'natureza.txt'), log.join('\n') + '\nerros: ' + (errs.slice(0, 5).join(' || ') || 'nenhum') + '\n');
  await browser.close();
})();
