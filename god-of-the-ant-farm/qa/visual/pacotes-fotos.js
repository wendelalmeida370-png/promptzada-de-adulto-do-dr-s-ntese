// pacotes-fotos: the inside of a tavern photographed by the game in the browser — for the before and the after of the libraries of
// the interiors' models in packs and in 16 bits (the interiors 3, the front X: D-1020 to D-1022):
//   bash qa/navegador.sh node qa/visual/pacotes-fotos.js PASTA_DO_JOGO PASTA_DAS_FOTOS [mundo]     (Q=media|alta; VW, VH)
// PASTA_DO_JOGO is the game folder — this one, or a copy of before (git archive) for the «antes». Every pack asked for and in before
// the world opens (a game of before has none: nothing to wait for); then the same world, the same tavern (the first of the world with
// its keeper, by its id), the body put in by a seat near its door, the same frames stepped (the 3D by software: only the last ones
// drawn, as qa/visual/fotos.js does) and the eye on the hall from two sides: taverna-a.png, taverna-b.png. Side by side:
// python3 qa/visual/compara.py ANTES DEPOIS SAIDA. With SEM=1, the packs are not waited for: sem-pacote.png is the tavern as the
// page draws it before its pack comes (its own pieces by the boxes), chegou.png the same eye once every pack is in and a second of
// the world has passed (the inside drawn again by itself, D-1022).
// With CARGA=n, no photos — what the page costs to open, before and after (D-1026):
//   CARGA=5 bash qa/navegador.sh node qa/visual/pacotes-fotos.js PASTA_DO_JOGO [OUTRA_PASTA…]
// each folder n times, the rounds interleaved (the machine is shared: its load drifts), each in a fresh context of the browser (nothing
// kept from the round before): the bytes of JavaScript the page's own script tags bring, and of them the libraries of the interiors'
// models; the time until the DOM is read and until the page has run every script of index.html (its load event) — by the clock, and
// by the work of the page's own thread (Chrome's metrics in the thread's time: what the machine's load does not stretch — the tasks,
// the scripts run, their compiling); the JS heap then, after a collection; and, where the game has packs, the time for every one of
// them asked for at once to come in, and the heap with them all in — the medians, and every round
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs'); const os = require('os');
const CARGA = +process.env.CARGA || 0;
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..')); const OUT = process.argv[3] || path.join(os.tmpdir(), 'pacotes-fotos'); const WORLD = process.argv[4] || 'metropole';
if (!CARGA) fs.mkdirSync(OUT, { recursive: true });
// (the page's own JavaScript, by the script tags of its index.html; the libraries' files among them, and the packs beside them)
const LIBF = /^js\/(?:movelmesh|decomesh)(?:-[\w-]+)?\.js$/;
function bytesOf(root) {
  const tags = [...fs.readFileSync(path.join(root, 'index.html'), 'utf8').matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
  const size = f => (fs.existsSync(path.join(root, f)) ? fs.statSync(path.join(root, f)).size : 0);
  const packs = fs.readdirSync(path.join(root, 'js')).filter(f => /^(?:movelmesh|decomesh)-[\w-]+\.js$/.test(f)).map(f => 'js/' + f);
  return { js: tags.reduce((s, f) => s + size(f), 0), lib: tags.filter(f => LIBF.test(f)).reduce((s, f) => s + size(f), 0), packs: packs.reduce((s, f) => s + size(f), 0), npacks: packs.length };
}
async function carga(roots, n) {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192 --expose-gc', '--enable-precise-memory-info', '--enable-unsafe-swiftshader'] });
  const rows = new Map(roots.map(r => [r, []])); const mib = b => b / 1048576;
  const heap = page => page.evaluate(() => { if (window.gc) { window.gc(); window.gc(); } return performance.memory ? performance.memory.usedJSHeapSize : -1; });
  console.log(`a máquina: carga ${os.loadavg().map(v => v.toFixed(1)).join(' ')} (${os.cpus().length} núcleos)`);
  for (let k = 0; k < n; k++) for (const root of roots) {
    const cx = await browser.newContext({ viewport: { width: 1000, height: 620 } }); const page = await cx.newPage(); const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    const cdp = await cx.newCDPSession(page); await cdp.send('Performance.enable', { timeDomain: 'threadTicks' });
    await page.goto('file://' + path.join(root, 'index.html'), { waitUntil: 'load' });
    const nav = await page.evaluate(() => { const e = performance.getEntriesByType('navigation')[0]; return { dcl: e.domContentLoadedEventEnd, load: e.loadEventEnd }; });
    const pm = {}; for (const q of (await cdp.send('Performance.getMetrics')).metrics) pm[q.name] = q.value * 1000; // (seconds to ms)
    const r = { dcl: nav.dcl, load: nav.load, task: pm.TaskDuration, script: pm.ScriptDuration, compile: pm.V8CompileDuration, heap: await heap(page), packs: -1, heapAll: -1 };
    if (await page.evaluate(() => !!(window.G && G.Movel3D && G.Movel3D.wantAll))) {
      const t0 = await page.evaluate(() => performance.now()); await page.waitForFunction(() => G.Movel3D.wantAll(), null, { timeout: 120000, polling: 10 });
      r.packs = (await page.evaluate(() => performance.now())) - t0; r.heapAll = await heap(page);
    }
    r.err = errs.slice(0, 2).join(' | '); rows.get(root).push(r); await cx.close();
  }
  const med = a => { const s = a.slice().sort((x, y) => x - y); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
  for (const root of roots) { const R = rows.get(root); const B = bytesOf(root); const has = R[0].packs >= 0;
    console.log(`${root}\n  o JavaScript da página ${(B.js / 1024).toFixed(0)} KB, dos quais as bibliotecas dos modelos ${(B.lib / 1024).toFixed(0)} KB; ${B.npacks ? `os ${B.npacks} pacotes ${(B.packs / 1024).toFixed(0)} KB, fora da página` : 'nenhum pacote'}`);
    console.log(`  a mediana de ${R.length}: o DOM em ${med(R.map(q => q.dcl)).toFixed(0)} ms, a página carregada em ${med(R.map(q => q.load)).toFixed(0)} ms (o trabalho da linha da página ${med(R.map(q => q.task)).toFixed(0)} ms: os scripts ${med(R.map(q => q.script)).toFixed(0)}, compilá-los ${med(R.map(q => q.compile)).toFixed(0)}), a memória do JS ${mib(med(R.map(q => q.heap))).toFixed(1)} MiB` +
      (has ? `; os pacotes todos em ${med(R.map(q => q.packs)).toFixed(0)} ms depois de pedidos, a memória com eles ${mib(med(R.map(q => q.heapAll))).toFixed(1)} MiB` : ''));
    R.forEach((q, i) => console.log(`    vez ${i + 1}: o DOM ${q.dcl.toFixed(0)} ms, carregada ${q.load.toFixed(0)} ms (o trabalho ${q.task.toFixed(0)}, os scripts ${q.script.toFixed(0)}, compilar ${q.compile.toFixed(0)}), ${mib(q.heap).toFixed(1)} MiB` + (q.packs >= 0 ? `; os pacotes ${q.packs.toFixed(0)} ms, ${mib(q.heapAll).toFixed(1)} MiB` : '') + (q.err ? ` · erro: ${q.err}` : ''))); }
  console.log(`a máquina no fim: carga ${os.loadavg().map(v => v.toFixed(1)).join(' ')}`);
  await browser.close();
}
(async () => {
  if (CARGA) return carga(process.argv.slice(2).length ? process.argv.slice(2).map(p => path.resolve(p)) : [ROOT], CARGA);
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: +process.env.VW || 1000, height: +process.env.VH || 620 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver|GroupMarker|software WebGL|WebGL: INVALID|CONTEXT_LOST/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
  await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 120000 });
  // (every pack in before the world opens — the page's script tags, one at a time; a game of before has none)
  const SEM = !!process.env.SEM; const allIn = async () => { const t0 = Date.now(); await page.waitForFunction(() => !(G.Movel3D && G.Movel3D.wantAll) || G.Movel3D.wantAll(), null, { timeout: 180000, polling: 200 });
    console.log(`os pacotes (${((Date.now() - t0) / 1000).toFixed(1)} s): ${await page.evaluate(() => (G.Movel3D && G.Movel3D.packs ? JSON.stringify(G.Movel3D.packs()) : 'sem pacotes (antes)'))}`); };
  if (SEM) console.log(`os pacotes ao abrir: ${await page.evaluate(() => (G.Movel3D && G.Movel3D.packs ? JSON.stringify(G.Movel3D.packs()) : '-'))}`); else await allIn();
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', WORLD + '.js') });
  // (name, the turn of the eye from the hall's middle, the frames stepped before — a second of the world is 111 at the body's pace)
  const shots = SEM ? [['sem-pacote', 0, 0], ['chegou', 0, 130]] : [['taverna-a', 0, 0], ['taverna-b', Math.PI, 0]];
  for (let k = 0; k < shots.length; k++) {
    const [name, turn, wait] = shots[k]; const t1 = Date.now(); if (SEM && k === 1) await allIn();
    const { png, ...info } = await page.evaluate(([w, turn, first, Q, wait]) => {
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
        G.Cam3D.OPT.follow = false; G.Cam3D.yaw = yaw; G.Cam3D.pitch = 0.32; G.Cam3D.dist = 2.6; G.Cam3D.cur = 2.6; f(60 + (wait | 0));
        drawn(33); drawn(33); G.Cam3D.yaw = yaw; G.Cam3D.pitch = 0.32; G.Cam3D.cur = 2.6; drawn(1);
        const c = G.Realm.renderer().domElement, o = document.createElement('canvas'); o.width = c.clientWidth || c.width; o.height = c.clientHeight || c.height; o.getContext('2d').drawImage(c, 0, 0, o.width, o.height);
        const B3 = G.Build3D; const open = B3.opened ? B3.opened().find(q => q.id === b.id) : null;
        // (what of the furniture the scene draws by its models: the instanced meshes of the inside — Build3D's 'movel:', Dentro3D's 'dentro:')
        let mv = 0, dt = 0; G.Realm.scene().traverse(m => { if (m.name && m.name.startsWith('movel:')) mv++; if (m.name && m.name.startsWith('dentro:')) dt++; });
        return { b: b.id, civ: b.style || '', clock: +S.clock.toFixed(2), open: !!open, moveis: mv, coisas: dt, pacotes: G.Movel3D && G.Movel3D.packs ? JSON.stringify(G.Movel3D.packs()) : '-', err: JSON.stringify(G.modErr), png: o.toDataURL('image/png') };
      } finally { if (rq) rq.render = r0; }
    }, [WORLD, turn, k === 0, process.env.Q || 'media', wait]);
    if (info.err && !png) { console.log(`FALHOU ${name}: ${info.err}`); break; }
    const file = path.join(OUT, name + '.png'); fs.writeFileSync(file, Buffer.from(png.split(',')[1], 'base64'));
    console.log(`${name}: ${JSON.stringify(info)} (${((Date.now() - t1) / 1000).toFixed(0)} s) → ${file}`);
  }
  console.log('erros: ' + (errs.slice(0, 5).join(' || ') || 'nenhum'));
  await browser.close();
})();
