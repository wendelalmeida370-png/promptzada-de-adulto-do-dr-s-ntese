// ceu-fotos: as fotos fixas do céu, da luz e do ar do 3D (21d, NATUREZA.md) — o mesmo mundo, o mesmo lugar, a mesma câmera, a mesma
// hora em toda rodada: serve para antes/depois (a pasta de um jogo antigo dá o «antes»):
//   bash qa/navegador.sh node qa/visual/ceu-fotos.js PASTA_DO_JOGO PASTA_DAS_FOTOS [nome,nome...]   (Q=media|alta|ultra|baixa; VW/VH)
// As vistas: o morro com vista (o mais alto acima do que há em volta) ao amanhecer, ao meio-dia, ao pôr do sol e à noite; a mata
// mais fechada ao meio-dia e ao pôr do sol; a tempestade com um raio que a prova faz cair diante do olho. Cada foto diz o que se
// mediu dela (o tempo do quadro desenhado, as chamadas, os triângulos, a luz) no log.txt da pasta.
// MATA=1: onde o jogo ainda não tem o G.Mata (a 21a), a prova põe um no lugar dele, só para a foto — o dossel lido das árvores do
// mundo em volta de cada casa —, para mostrar a luz da mata pela porta que o céu lê (NATUREZA.md §8). Nunca no jogo.
// MEDE=n: além da foto, o tempo de n quadros desenhados (a mediana), para o custo de cada qualidade (D-468).
// O aquecimento roda sem desenhar a tela (por software cada quadro custa segundos): só os últimos quadros e o da foto são desenhados.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(process.argv[2]); const OUT = process.argv[3]; const ONLY = (process.argv[4] || '').split(',').filter(Boolean);
fs.mkdirSync(OUT, { recursive: true });
// nome, mundo, lugar, olhar ('sol': para o sol; 'costas': de costas para ele; um número: o giro), inclinação, distância, hora, tempo
const VIEWS = [
  ['alto-amanhecer', 'cidade', 'alto', 'sol', -0.04, 6, 0.0, ''],
  ['alto-meiodia', 'cidade', 'alto', 'costas', 0.04, 6, 0.36, ''],
  ['alto-por', 'cidade', 'alto', 'sol', -0.04, 6, 0.72, ''],
  ['alto-noite', 'cidade', 'alto', 'costas', -0.06, 6, 0.86, ''],
  ['mata-meiodia', 'cidade', 'forest', 'sol', 0.1, 4.8, 0.36, ''],
  ['mata-por', 'cidade', 'forest', 'sol', 0.0, 4.8, 0.71, ''],
  ['tempestade', 'cidade', 'alto', 'costas', 0.02, 6, 0.4, 'storm'],
];
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: +process.env.VW || 1000, height: +process.env.VH || 620 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver|GroupMarker|software WebGL/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
  await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 240000 });
  for (const w of [...new Set(VIEWS.map(v => v[1]))]) await page.addScriptTag({ path: path.join(ROOT, 'worlds', w + '.js') });
  let world = null; const log = [];
  for (const [name, w, place, look, pitch, dist, hour, wx] of VIEWS) {
    if (ONLY.length && !ONLY.includes(name)) continue;
    const t0 = Date.now();
    const { png, ...info } = await page.evaluate(([w, place, look, pitch, dist, hour, wx, fresh, Q, MATA, MEDE]) => {
      let r0 = null, rq = null, quiet = true;
      const hush = on => { quiet = on; const r = G.Realm.renderer(); if (!r || r0) return; rq = r; r0 = r.render; r.render = function () { return quiet ? undefined : r0.apply(this, arguments); }; };
      const sync = () => { const r = G.Realm.renderer(); if (!r) return; const gl = r.getContext(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4)); };
      const step = () => { hush(true); G.Main.frameFor(33); }, drawn = ms => { hush(false); const t = performance.now(); G.Main.frameFor(ms); sync(); return performance.now() - t; };
      const f = n => { for (let k = 0; k < n; k++) step(); }; const until = (c, m) => { for (let k = 0; k < m; k++) { if (c()) return k; step(); } return -1; };
      try {
        if (fresh) {
          if (G.Modes.state !== 'GOD') { G.Modes.leave('deus'); until(() => G.Modes.state === 'GOD', 400); }
          G.Realm.setQuality(Q); G.Save.apply(JSON.parse(G.Ready.data[w])); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
          // (the stand-in of the canopy, for the photo only: where the game has no G.Mata yet)
          if (MATA && !G.Mata) { const S0 = () => G.S; G.Mata = { stand: true, at(i) { const S = S0(), N = G.N, x = i % N, y = (i / N) | 0; let n = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const j = (y + dy) * N + x + dx; const t = S.trees.get(S.treeAt[j]); if (t && t.stage === 'grow') n += Math.min(1, 0.35 + t.size * 0.65); } return { luz: Math.min(1, n / 5.5), dens: 0 }; } }; }
          const S = G.S; const s = [...S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0];
          const v = [...S.villagers.values()].filter(o => o.set === s.id && o.age >= 18 && o.age < 55 && !o.inside && G.Possess.can(o).ok).sort((a, b) => a.id - b.id)[0];
          G.Modes.enter(v); until(() => G.Modes.state === 'INC', 300); f(6);
        }
        const S = G.S, N = G.N; let at = null;
        if (place === 'forest') {
          let best = null, bs = -1;
          for (let y = 4; y < N - 4; y++) for (let x = 4; x < N - 4; x++) { const i = y * N + x; if (!G.W.walkable(i) || S.treeAt[i] || S.occ[i]) continue; let sc = 0;
            for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) if (S.treeAt[(y + dy) * N + x + dx]) sc++;
            if (sc > bs) { bs = sc; best = [x + 0.5, y + 0.5]; } }
          at = best;
        } else if (place === 'alto') {
          // (a hill with a view: walkable, no tree, no building, no road; the highest over the ring of 10 tiles round it)
          let best = null, bs = -1e9;
          for (let y = 12; y < N - 12; y++) for (let x = 12; x < N - 12; x++) { const i = y * N + x; if (!G.W.walkable(i) || S.treeAt[i] || S.occ[i] || S.road[i]) continue;
            const h = G.W.groundH(x + 0.5, y + 0.5); let lo = 0; for (let a = 0; a < 12; a++) lo += G.W.groundH(x + Math.cos(a / 12 * 6.283) * 10, y + Math.sin(a / 12 * 6.283) * 10);
            const sc = h - lo / 12; if (sc > bs) { bs = sc; best = [x + 0.5, y + 0.5]; } }
          at = best;
        }
        // (the weather of the view: clear, or a storm over the body — the world's own storm, with its clouds)
        const ww = S.weather; if (wx === 'storm') { ww.storm = 90; ww.rain = 0.8; ww.windS = 0.95; if (!S.clouds.some(c => c.kind === 'storm')) for (let k = 0; k < 3; k++) G.Nature.addCloud(at[0] + (k - 1) * 9, at[1] + 6, 8, 60, 'storm'); }
        else { ww.storm = 0; ww.rain = 0; S.clouds.length = 0; }
        G.Avatar.place(at[0], at[1]); S.time = hour; f(30);
        document.querySelectorAll('#inc-hud, #hud, #inc-label').forEach(e => e.style.visibility = 'hidden');
        const sd = G.Realm.skyU.sunDir.value; const toSun = Math.atan2(sd.z, sd.x);
        const cy = look === 'sol' ? toSun : look === 'costas' ? toSun + Math.PI : look;
        const st = G.Avatar.state(); st.yaw = cy + 0.4;
        G.Cam3D.OPT.follow = false; G.Cam3D.yaw = cy; G.Cam3D.pitch = pitch; G.Cam3D.dist = dist; G.Cam3D.cur = dist; f(38); drawn(33); drawn(33); st.yaw = cy + 0.4; G.Cam3D.yaw = cy; G.Cam3D.pitch = pitch; G.Cam3D.cur = dist;
        // (the storm's bolt: the world's own stroke, on open land some 60 m ahead of the eye — where the 3D draws it, if it does)
        let bolt = null;
        if (wx === 'storm') { const fx = Math.cos(cy + Math.PI), fz = Math.sin(cy + Math.PI); let bx = at[0] - Math.cos(cy) * 15, by = at[1] - Math.sin(cy) * 15; void fx; void fz;
          bx = G.clamp(bx, 2, N - 3); by = G.clamp(by, 2, N - 3); G.Powers.strike(bx, by, false); bolt = [+bx.toFixed(1), +by.toFixed(1)]; drawn(33); }
        const ms = drawn(1); const R = G.Realm, ri = R.info ? R.info.render : {}; const pi = G.Post3D && G.Post3D.info ? G.Post3D.info() : null;
        let med = null; if (MEDE > 0) { const t = []; for (let k = 0; k < MEDE; k++) t.push(drawn(33)); t.sort((a, b) => a - b); med = +t[t.length >> 1].toFixed(0); }
        const c = R.renderer().domElement, o = document.createElement('canvas'); o.width = c.clientWidth || c.width; o.height = c.clientHeight || c.height; o.getContext('2d').drawImage(c, 0, 0, o.width, o.height);
        const LT = R.LT || {}; const k3 = a => (a ? a.map(v => +v.toFixed(3)) : null);
        return { at: at.map(q => +q.toFixed(2)), time: +S.time.toFixed(3), sunY: +sd.y.toFixed(3), exp: +R.renderer().toneMappingExposure.toFixed(3), key: k3(LT.key), sky: k3(LT.sky), hor: k3(LT.hor), cover: +R.skyU.cover.value.toFixed(2), rain: +S.weather.rain.toFixed(2), bolt, ms: +ms.toFixed(0), med, calls: ri.calls, tris: ri.triangles, post: pi, ceu: !!G.Ceu, mata: G.Mata ? (G.Mata.stand ? 'substituto da prova' : 'do jogo') : 'nenhum', err: JSON.stringify(G.modErr), png: o.toDataURL('image/png') };
      } finally { if (rq) rq.render = r0; }
    }, [w, place, look, pitch, dist, hour, wx, world !== w, process.env.Q || 'media', process.env.MATA === '1', +process.env.MEDE || 0]);
    world = w; const file = path.join(OUT, name + '.png');
    fs.writeFileSync(file, Buffer.from(png.split(',')[1], 'base64'));
    log.push(`${name}: ${JSON.stringify(info)} (${((Date.now() - t0) / 1000).toFixed(0)} s)`); console.log(log[log.length - 1]);
    fs.writeFileSync(path.join(OUT, 'log.txt'), log.join('\n') + '\n');
  }
  console.log('erros: ' + (errs.slice(0, 5).join(' || ') || 'nenhum'));
  fs.writeFileSync(path.join(OUT, 'log.txt'), log.join('\n') + '\nerros: ' + (errs.slice(0, 5).join(' || ') || 'nenhum') + '\n');
  await browser.close();
  process.exit(errs.length ? 1 : 0);
})();
