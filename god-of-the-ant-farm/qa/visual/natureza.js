// natureza: fotos fixas do chão e da natureza do 3D (A3) — Hedeby, a metrópole e cada bioma de um mundo feito por uma
// semente fixa (o mesmo mundo, o mesmo lugar, a mesma câmera, a mesma hora em toda rodada: serve para antes/depois)
//   bash qa/navegador.sh node qa/visual/natureza.js PASTA_DO_JOGO PASTA_DAS_FOTOS [nome,nome...]
//   (Q=media|alta|baixa; VW/VH o tamanho; MEDE=1 também conta triângulos e chamadas de desenho de cada vista)
//   21c: as vistas da água (agua-…): a maior cachoeira de um mundo montanhoso, um rio com corrente, um lago, a praia com ondas,
//   a chuva numa rua e nos telhados — de dia, ao pôr do sol (-tarde) e na chuva (-chuva); o yaw nulo olha para o que a vista mostra.
//   Cada vista mede também o quadro já compilado (ms, chamadas, triângulos) e diz o que a água desenha ali
// O aquecimento (os pedaços de chão perto do corpo sendo feitos, a pintura do chão) roda sem desenhar a tela — só a foto
// final é desenhada: por software cada quadro custa segundos, e os do aquecimento não aparecem na foto
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(process.argv[2]); const OUT = process.argv[3]; const ONLY = (process.argv[4] || '').split(',').filter(Boolean);
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
  // 21c: the water — the greatest fall of a mountain world (from its pool and from above), a river running, a lake, the beach and its
  // waves, the rain on a street and on its roofs; by day, at sunset and in the rain (yaw null: toward what the view shows)
  ['agua-queda', 'montanha', 'fall', null, 0.02, 5.5, 0.42],
  ['agua-queda-tarde', 'montanha', 'fall', null, 0.02, 5.5, 0.69],
  ['agua-queda-chuva', 'montanha', 'fall', null, 0.02, 5.5, 0.42, { rain: 0.7 }],
  ['agua-queda-alto', 'montanha', 'fall', null, 0.42, 13, 0.42],
  ['agua-rio', 'montanha', 'river', null, 0.16, 6, 0.42],
  ['agua-rio-chuva', 'montanha', 'river', null, 0.16, 6, 0.42, { rain: 0.75 }],
  ['agua-lago', 'gerado', 'lake', null, 0.1, 6, 0.42],
  ['agua-praia', 'gerado', 'shore', null, 0.12, 5.5, 0.42],
  ['agua-praia-tarde', 'gerado', 'shore', null, 0.12, 5.5, 0.69],
  ['agua-chuva-rua', 'cidade', 'praca', 3.9, 0.48, 9, 0.42, { rain: 0.8 }],
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
  for (const [name, w, place, yaw, pitch, dist, hour, opt] of VIEWS) {
    if (ONLY.length && !ONLY.includes(name)) continue;
    const t0 = Date.now();
    const info = await page.evaluate(([w, place, yaw0, pitch, dist, hour, fresh, Q, SEED, opt]) => {
      let yaw = yaw0; opt = opt || {};
      // (the frames of the warming up are lived but not drawn)
      const quiet = on => { const r = G.Realm.renderer && G.Realm.renderer(); if (!r) return; if (!window.__draw) window.__draw = r.render; r.render = on ? () => { } : window.__draw; };
      const f = n => { for (let k = 0; k < n; k++) G.Main.frameFor(33); }; const until = (c, m) => { for (let k = 0; k < m; k++) { if (c()) return k; G.Main.frameFor(33); } return -1; };
      if (fresh) {
        if (G.Modes.state !== 'GOD') { G.Modes.leave('deus'); until(() => G.Modes.state === 'GOD', 400); }
        G.Realm.setQuality(Q);
        if (w === 'gerado') { G.Main.newGame({ seed: SEED, type: 'continente', size: 192, tribes: 4, temper: 'normal', clima: 'variado', relevo: 'suave' }); }
        else if (w === 'montanha') { G.Main.newGame({ seed: SEED, type: 'continente', size: 192, tribes: 4, temper: 'normal', clima: 'variado', relevo: 'montanhoso' }); } // (21c: the falls live in the mountains)
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
        // (deep in the biome, among its trees but with room round the body for the eye — no trunk or bough in its face)
        at = best((i, x, y) => { if (!of(i)) return -1; const pure = count(x, y, 6, of); if (pure < 110) return -1; return 1e4 + pure + count(x, y, 4, j => S.treeAt[j] && of(j)) * 6 - count(x, y, 2, j => S.treeAt[j]) * 40 - count(x, y, 6, j => S.type[j] <= T.RIVER) * 4 - count(x, y, 6, j => S.occ[j]) * 8; });
      }
      // 21c: the water's views — found by what the world keeps (the same in the game before the water was drawn: no G.Agua here)
      let look = null;
      const walkAt = (x, y) => W.inb(x, y) && W.walkableXY(x, y) && !S.treeAt[W.idx(x, y)] && !S.occ[W.idx(x, y)];
      if (place === 'fall') {
        const fl = (S.relief.falls || []).filter(f => !f.sub).sort((a, b) => (b.tot || b.drop) - (a.tot || a.drop) || a.y - b.y || a.x - b.x)[0];
        if (fl) { const nx = fl.tx - fl.x, ny = fl.ty - fl.y; look = [fl.x + 0.5 + nx * 0.5, fl.y + 0.5 + ny * 0.5, S.wl[fl.y * N + fl.x] - (fl.tot || fl.drop) * 0.45];
          // (the body downstream of the pool, a few tiles off, on dry walkable ground low by the water — not up on a bank — with room behind it
          // for the eye (no slope of the gorge between) and nothing higher than the two between it and the fall: the nearest to the line of it)
          const HM = 1.5, lx = look[0], ly = look[1];
          let bs = 1e9; for (let r = 2; r <= 9; r++) for (let sd = -5; sd <= 5; sd++) { const x = fl.tx + nx * r + (ny ? sd : 0), y = fl.ty + ny * r + (nx ? sd : 0); if (!walkAt(x, y)) continue;
            const bx = x + 0.5, by = y + 0.5, gy = W.groundH(bx, by); const dl = Math.hypot(lx - bx, ly - by) || 1, ux = (lx - bx) / dl, uy = (ly - by) / dl;
            const cx = bx - ux * dist / 4, cy = by - uy * dist / 4; if (!W.inb(cx, cy) || W.hAt(cx, cy) > gy + 1.1) continue;
            let blocked = false; for (let q = 1; q < 8; q++) { const px = bx + (lx - bx) * q / 8, py = by + (ly - by) * q / 8; if (W.hAt(px, py) > Math.max(gy, S.wl[fl.y * N + fl.x]) + 0.6) { blocked = true; break; } } if (blocked) continue;
            const sc = Math.abs(sd) * 1.2 + Math.abs(r - 4.5) + Math.max(0, gy - S.wl[fl.ty * N + fl.tx]) * 2; if (sc < bs) { bs = sc; at = [x + 0.5, y + 0.5]; } } }
      } else if (place === 'river') {
        // (a narrow river running down a slope: river tiles round it in a line, its levels falling, a bank to stand on)
        at = best((i, x, y) => { let n = 0, fall = 0; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const j = W.inb(x + dx, y + dy) ? (y + dy) * N + x + dx : -1; if (j >= 0 && S.type[j] === T.RIVER) { n++; } }
          if (n < 4 || n > 9) return -1; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const j = W.inb(x + dx, y + dy) ? (y + dy) * N + x + dx : -1; if (j >= 0 && S.type[j] === T.RIVER) for (const [ex, ey] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = W.inb(x + dx + ex, y + dy + ey) ? (y + dy + ey) * N + x + dx + ex : -1; if (k >= 0 && S.type[k] === T.RIVER) fall = Math.max(fall, Math.abs(S.wl[j] - S.wl[k])); } }
          return fall > 0.05 && fall < 0.9 ? 100 + fall * 50 - count(x, y, 2, j => S.treeAt[j]) * 3 : -1; });
        if (at) { let bx = 0, by = 0, n = 0; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const X = Math.floor(at[0]) + dx, Y = Math.floor(at[1]) + dy; if (W.inb(X, Y) && S.type[Y * N + X] === T.RIVER) { bx += X + 0.5; by += Y + 0.5; n++; } } look = [bx / n, by / n, null]; }
      } else if (place === 'lake') {
        const L = (S.relief.lakes || []).slice().sort((a, b) => b.n - a.n || a.y - b.y)[0];
        if (L) { look = [L.x, L.y, null]; let bd = 1e9; for (let y = 2; y < N - 2; y++) for (let x = 2; x < N - 2; x++) { if (!walkAt(x, y) || count(x, y, 1, j => S.type[j] === T.RIVER) < 2) continue; const d = Math.hypot(x + 0.5 - L.x, y + 0.5 - L.y); if (d < bd) { bd = d; at = [x + 0.5, y + 0.5]; } } }
      } else if (place === 'shore') {
        // (a beach of sand with the open sea before it — the most sea in front, a little sand to stand on)
        at = best((i, x, y) => { if (S.type[i] !== T.SAND) return -1; const sea = count(x, y, 5, j => S.type[j] <= T.SEA); const deep = count(x, y, 7, j => S.type[j] === T.DEEP); return sea < 30 || sea > 85 ? -1 : sea + deep * 0.3 - count(x, y, 3, j => S.occ[j]) * 5; });
        if (at) { let bx = 0, by = 0, n = 0; for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) { const X = Math.floor(at[0]) + dx, Y = Math.floor(at[1]) + dy; if (W.inb(X, Y) && S.type[Y * N + X] <= T.SEA) { bx += X + 0.5; by += Y + 0.5; n++; } } look = [bx / n, by / n, null]; }
      }
      if (at && look && yaw === null) yaw = Math.atan2(look[1] - at[1], look[0] - at[0]);
      if (yaw === null) yaw = 2.2;
      // (the rain of the view: the world's weather for the photo — the rain that falls and wets)
      if (opt.rain) { S.weather.rain = opt.rain; S.weather.storm = 0; }
      G.Avatar.place(at[0], at[1]); S.time = hour; if (opt.rain) S.weather.rain = opt.rain; f(30); if (opt.rain) S.weather.rain = opt.rain;
      document.querySelectorAll('#inc-hud, #hud, #inc-label').forEach(e => e.style.visibility = 'hidden');
      const st = G.Avatar.state(); const byaw = /^agua/.test(place) || look ? yaw : 0.3; st.yaw = byaw; // (21c: in the water's views the body looks where the eye looks)
      G.Cam3D.OPT.follow = false; G.Cam3D.yaw = yaw; G.Cam3D.pitch = pitch; G.Cam3D.dist = dist; G.Cam3D.cur = dist; f(40); st.yaw = byaw; G.Cam3D.yaw = yaw; G.Cam3D.pitch = pitch; G.Cam3D.cur = dist;
      // (the photo: drawn for real, three frames — the first one makes the shaders)
      quiet(false); const tq = performance.now(); for (let k = 0; k < 3; k++) { G.Cam3D.yaw = yaw; G.Cam3D.pitch = pitch; G.Cam3D.cur = dist; G.Main.frameFor(1); }
      const m = G.Realm.memory();
      // (21a: the checks of the plants' drawing, which no proof called before — T-1511: the trees round the place, the meadow's field, the forest's layers)
      const chk = [].concat(G.Realm.floraCheck ? G.Realm.floraCheck(at[0], at[1], 14) : [], G.Grass3D && G.Grass3D.check ? G.Grass3D.check() : [], G.Mata3D && G.Mata3D.check ? G.Mata3D.check() : []);
      const mata = G.Mata3D ? { inst: G.Mata3D.stats.inst, tris: G.Mata3D.stats.tris, calls: G.Mata3D.stats.calls } : null;
      // (21c: the frame once all is made — the shaders compiled: its time, its calls and its triangles; what the water draws here)
      let fms = 0, gms = 0; { const r = G.Realm.renderer(); const gl = r && r.getContext(); const k0 = performance.now(); for (let k = 0; k < 4; k++) { G.Cam3D.yaw = yaw; G.Cam3D.pitch = pitch; G.Cam3D.cur = dist; G.Main.frameFor(1); } fms = Math.round((performance.now() - k0) / 4);
        // (and with the drawing waited for — gl.finish: the time the graphics (here, the software one) took, not only the orders given)
        if (gl) { const k1 = performance.now(); for (let k = 0; k < 2; k++) { G.Cam3D.yaw = yaw; G.Cam3D.pitch = pitch; G.Cam3D.cur = dist; G.Main.frameFor(1); gl.finish(); } gms = Math.round((performance.now() - k1) / 2); } }
      const m2 = G.Realm.memory(); const agua = G.Agua3D ? Object.assign({}, G.Agua3D.stats, G.FX3D.water || {}, { check: G.Agua3D.check ? G.Agua3D.check().slice(0, 2) : [] }) : null;
      if (opt.rain) S.weather.rain = 0;
      return { at: at.map(q => +q.toFixed(2)), yaw: +yaw.toFixed(2), frameMs: fms, gpuMs: gms, calls2: m2 && m2.calls, tris2: m2 && m2.tris, agua, biome: G.Biome ? G.Biome.of(W.idx(at[0], at[1])) : -1, err: JSON.stringify(G.modErr), calls: m && m.calls, tris: m && m.tris, drawMs: Math.round((performance.now() - tq) / 3), checks: chk.length ? chk.slice(0, 3) : 0, mata };
    }, [w, place, yaw, pitch, dist, hour, world !== w, process.env.Q || 'media', SEED, opt || null]);
    world = w;
    if (info.skip) { log.push(`${name}: ${info.skip}`); console.log(log[log.length - 1]); continue; }
    // (TSHOT: the Alta by software can take longer; a photo that does not come in time is said, and the next view goes on — 21c)
    try { await page.screenshot({ path: path.join(OUT, name + '.png'), timeout: +process.env.TSHOT || 240000 }); } catch (e) { info.foto = 'sem foto: ' + String(e.message).split('\n')[0].slice(0, 120); }
    log.push(`${name}: ${JSON.stringify(info)} (${((Date.now() - t0) / 1000).toFixed(0)} s)`); console.log(log[log.length - 1]);
  }
  console.log('erros: ' + (errs.slice(0, 5).join(' || ') || 'nenhum'));
  fs.writeFileSync(path.join(OUT, 'natureza.txt'), log.join('\n') + '\nerros: ' + (errs.slice(0, 5).join(' || ') || 'nenhum') + '\n');
  await browser.close();
})();
