// pacotes-fotos: the inside of a tavern photographed by the game in the browser — for the before and the after of the libraries of
// the interiors' models in packs and in 16 bits (the interiors 3, the front X: D-1020 to D-1022):
//   bash qa/navegador.sh node qa/visual/pacotes-fotos.js PASTA_DO_JOGO PASTA_DAS_FOTOS [mundo]     (Q=media|alta; VW, VH)
// PASTA_DO_JOGO is the game folder — this one, or a copy of before (git archive) for the «antes». Every pack asked for and in before
// the world opens (a game of before has none: nothing to wait for); then the same world, the same tavern (the first of the world with
// its keeper, by its id), the body put in by a seat near its door, the same frames stepped (the 3D by software: only the last ones
// drawn, as qa/visual/fotos.js does) and the eye on the hall from two sides: taverna-a.png, taverna-b.png. Side by side:
// python3 qa/visual/compara.py ANTES DEPOIS SAIDA
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..')); const OUT = process.argv[3] || path.join(require('os').tmpdir(), 'pacotes-fotos'); const WORLD = process.argv[4] || 'metropole';
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: +process.env.VW || 1000, height: +process.env.VH || 620 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver|GroupMarker|software WebGL|WebGL: INVALID|CONTEXT_LOST/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
  await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 120000 });
  // (every pack in before the world opens — the page's script tags, one at a time; a game of before has none)
  const t0 = Date.now(); await page.waitForFunction(() => !(G.Movel3D && G.Movel3D.wantAll) || G.Movel3D.wantAll(), null, { timeout: 180000, polling: 200 });
  const packs = await page.evaluate(() => (G.Movel3D && G.Movel3D.packs ? JSON.stringify(G.Movel3D.packs()) : 'sem pacotes (antes)'));
  console.log(`os pacotes (${((Date.now() - t0) / 1000).toFixed(1)} s): ${packs}`);
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', WORLD + '.js') });
  const shots = [['taverna-a', 0], ['taverna-b', Math.PI]];
  for (let k = 0; k < shots.length; k++) {
    const [name, turn] = shots[k]; const t1 = Date.now();
    const { png, ...info } = await page.evaluate(([w, turn, first, Q]) => {
      let r0 = null, rq = null, quiet = true;
      const hush = on => { quiet = on; const r = G.Realm.renderer(); if (!r || r0) return; rq = r; r0 = r.render; r.render = function () { return quiet ? undefined : r0.apply(this, arguments); }; };
      const sync = () => { const r = G.Realm.renderer(); if (!r) return; const gl = r.getContext(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4)); };
      const step = () => { hush(true); G.Main.frameFor(33); }, drawn = ms => { hush(false); G.Main.frameFor(ms); sync(); };
      const f = n => { for (let i = 0; i < n; i++) step(); }; const until = (c, m) => { for (let i = 0; i < m; i++) { if (c()) return i; step(); } return -1; };
      const god = fn => { G.inSim++; try { return fn(); } finally { G.inSim--; } };
      try {
        const In = G.Interiors, TL = G.Space.TILE;
        if (first) {
          G.Realm.setQuality(Q); G.Save.apply(JSON.parse(G.Ready.data[w])); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
        }
        const S = G.S; const b = [...S.buildings.values()].filter(t => t.type === 'taverna' && t.built && In.has(t) && G.Taverna.keeperOf(t)).sort((a, c) => a.id - c.id)[0]; if (!b) return { err: 'nenhuma taverna com taverneiro' };
        const p = G.Space.planNow(b); const kp = G.Taverna.keeperOf(b);
        if (first) {
          const v = [...S.villagers.values()].filter(o => o !== kp && o.age >= 18 && o.age < 55 && !o.inside && G.Possess.can(o).ok).sort((a, c) => G.dist(a.x, a.y, b.x, b.y) - G.dist(c.x, c.y, b.x, b.y) || a.id - c.id)[0];
          god(() => { G.Vg.endTask(v); v.path = null; }); G.Modes.enter(v); until(() => G.Modes.state === 'INC', 300); f(6);
          // (in by a seat near the door, standing where one gets onto it — as the proofs put the body in a room)
          const pls = In.freeNear(b, p.entryLv || 0, p.entrance.x, p.entrance.z, 40, ['sentar', 'comer']).filter(q => In.walkIn(b, q) < Infinity); const pl = pls[0]; if (!pl) return { err: 'nenhum lugar livre' };
          const at = In.standFor(b, pl, pl.x, pl.z); G.Avatar.detach(); god(() => { v.inside = b.id; v.x = b.x + at[0] / TL; v.y = b.y + at[1] / TL; }); G.Possess.setLevel(pl.lv); G.Avatar.attach(v, 0); f(20);
        }
        document.querySelectorAll('#inc-hud, #hud, #inc-label').forEach(e => e.style.visibility = 'hidden');
        // (the eye on the hall: from the body toward the middle of the largest room of its storey, and the other way)
        const room = p.rooms.filter(m => m.lv === (p.entryLv || 0) && !m.open).sort((a, c) => (c.r[2] - c.r[0]) * (c.r[3] - c.r[1]) - (a.r[2] - a.r[0]) * (a.r[3] - a.r[1]))[0];
        const st = G.Avatar.state(); const cx = b.x * TL + (room.r[0] + room.r[2]) / 2, cz = b.y * TL + (room.r[1] + room.r[3]) / 2;
        const yaw = Math.atan2(cx - st.X, cz - st.Z) + Math.PI + turn;
        G.Cam3D.OPT.follow = false; G.Cam3D.yaw = yaw; G.Cam3D.pitch = 0.32; G.Cam3D.dist = 2.6; G.Cam3D.cur = 2.6; f(60);
        drawn(33); drawn(33); G.Cam3D.yaw = yaw; G.Cam3D.pitch = 0.32; G.Cam3D.cur = 2.6; drawn(1);
        const c = G.Realm.renderer().domElement, o = document.createElement('canvas'); o.width = c.clientWidth || c.width; o.height = c.clientHeight || c.height; o.getContext('2d').drawImage(c, 0, 0, o.width, o.height);
        const B3 = G.Build3D; const open = B3.opened ? B3.opened().find(q => q.id === b.id) : null;
        return { b: b.id, civ: b.style || '', clock: +S.clock.toFixed(2), open: !!open, err: JSON.stringify(G.modErr), png: o.toDataURL('image/png') };
      } finally { if (rq) rq.render = r0; }
    }, [WORLD, turn, k === 0, process.env.Q || 'media']);
    if (info.err && !png) { console.log(`FALHOU ${name}: ${info.err}`); break; }
    const file = path.join(OUT, name + '.png'); fs.writeFileSync(file, Buffer.from(png.split(',')[1], 'base64'));
    console.log(`${name}: ${JSON.stringify(info)} (${((Date.now() - t1) / 1000).toFixed(0)} s) → ${file}`);
  }
  console.log('erros: ' + (errs.slice(0, 5).join(' || ') || 'nenhum'));
  await browser.close();
})();
