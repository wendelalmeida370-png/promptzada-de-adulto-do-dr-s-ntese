// vistas: what the visual tools share — the browser opened on a game folder, the fixed views of fotos.js (read from its
// own source, so the measures and the photos are always of the same places), and a helper put in the page (__VIS) that
// stands the body in a view, measures a frame and knows who drew each thing (the owner, by the team's matrix)
const path = require('path'); const fs = require('fs');

// the views, exactly as fotos.js has them (its table is the one truth: parsed, not copied)
function views() {
  const src = fs.readFileSync(path.join(__dirname, 'fotos.js'), 'utf8');
  const m = src.match(/const VIEWS = (\[[\s\S]*?\n\]);/);
  if (!m) throw new Error('vistas: a tabela VIEWS do fotos.js não foi encontrada');
  return (0, eval)(m[1]).map(([name, world, place, yaw, pitch, dist, hour]) => ({ name, world, place, yaw, pitch, dist, hour }));
}

// (the noise every test of the game ignores: the fonts it cannot fetch, the software GL's own notes)
const QUIET = /ERR_FAILED|fonts|GL Driver|GroupMarker|software WebGL|Automatic fallback to software WebGL/;

// a browser on the game folder ROOT, with the ready worlds loaded and the texture stack decoded
async function open(ROOT, opts) {
  opts = opts || {};
  const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader', '--enable-precise-memory-info'] });
  const page = await browser.newPage({ viewport: { width: opts.w || +process.env.VW || 1000, height: opts.h || +process.env.VH || 620 } });
  const errs = [];
  page.on('pageerror', e => errs.push('página: ' + e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' | ')));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !QUIET.test(t)) errs.push('console: ' + t.slice(0, 600)); });
  page.on('crash', () => errs.push('página: o navegador caiu (crash)'));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
  await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 180000 }).catch(() => errs.push('pilha de texturas: não ficou pronta em 3 min'));
  for (const w of opts.worlds || ['cidade', 'metropole']) { const f = path.join(ROOT, 'worlds', w + '.js'); if (fs.existsSync(f)) await page.addScriptTag({ path: f }); else errs.push(`mundo pronto ${w}: ${f} não existe`); }
  if (opts.qa !== false) { const q = fs.existsSync(path.join(ROOT, 'qa', 'qa.js')) ? path.join(ROOT, 'qa', 'qa.js') : path.join(__dirname, '..', 'qa.js'); await page.addScriptTag({ path: q }); }
  await page.evaluate(`(${PAGE.toString()})()`);
  const cdp = await page.context().newCDPSession(page);
  // (the JS heap after a collection: what stays, not what is waiting to be swept)
  const heap = async () => { try { await cdp.send('HeapProfiler.collectGarbage'); const h = await cdp.send('Runtime.getHeapUsage'); return Math.round(h.usedSize / 1048576 * 10) / 10; } catch (e) { return null; } };
  return { browser, page, errs, heap };
}

// ------------------------------ in the page ------------------------------
// (serialized into the page: nothing here may use what lives in node)
function PAGE() {
  if (window.__VIS) return;
  const TAU = Math.PI * 2;
  // who put each thing in the scene: the first file of the game in the stack of its add() (a WeakMap: the game never sees it)
  const BY = new WeakMap();
  if (window.THREE && !THREE.Object3D.prototype.__visAdd) {
    const add0 = THREE.Object3D.prototype.add;
    THREE.Object3D.prototype.add = function () {
      const st = (new Error().stack || '').split('\n'); let f = '';
      for (let k = 2; k < st.length && !f; k++) { const m = st[k].match(/\/js\/([\w.-]+\.js):\d+/); if (m && m[1] !== 'three.min.js') f = m[1]; }
      for (const o of arguments) if (o && typeof o === 'object' && !BY.has(o)) BY.set(o, f);
      return add0.apply(this, arguments);
    };
    THREE.Object3D.prototype.__visAdd = 1;
  }
  // the team's matrix (arte/ESTUDIO.md §3): a file or a material of the 3D → who answers for it
  const OWN_FILE = { 'build3d.js': 'A2', 'props3d.js': 'A2', 'ground3d.js': 'A3', 'grass3d.js': 'A3', 'people3d.js': 'A4', 'body3d.js': 'A4', 'bodymesh.js': 'A4', 'fx3d.js': 'A5', 'post3d.js': 'A5', 'cam3d.js': 'A5', 'incui.js': 'A1', 'mesh3d.js': 'A1', 'tex3d.js': 'A1', 'things3d.js': 'A2', 'mesh-dragao.js': 'A1', 'dragon3d.js': 'líder', 'realm3d.js': 'líder', 'modes.js': 'líder', 'avatar.js': 'líder', 'space.js': 'líder' };
  const OWN_MAT = { solid: 'A2', glass: 'A2', land: 'A3', flora: 'A3', leaf: 'A3', plant: 'A3', grass: 'A3', water: 'A5', ice: 'A5', wallWater: 'A5', sky: 'A5', stars: 'A5' };
  let matName = null;
  const names = () => {
    if (matName) return matName; matName = new Map(); const R = G.Realm;
    try { const M = R.mats(); for (const k in M) if (M[k]) matName.set(M[k], k); } catch (e) { }
    try { if (G.Build3D && G.Build3D.glassMat && G.Build3D.glassMat()) matName.set(G.Build3D.glassMat(), 'glass'); } catch (e) { }
    try { if (G.Ground3D && G.Ground3D.material && G.Ground3D.material()) matName.set(G.Ground3D.material(), 'land'); } catch (e) { }
    try { const T = G.Things3D && G.Things3D.mats; if (T) for (const k in T) if (T[k] && T[k].isMaterial) matName.set(T[k], 'things.' + k); } catch (e) { }
    return matName;
  };
  const byOf = o => { for (let p = o; p; p = p.parent) { const f = BY.get(p); if (f) return f; } return ''; };
  // (the sky dome and the stars: realm3d's, A5's light — known by their shape, they have no name)
  const isSky = o => o.material && o.material.isShaderMaterial && o.material.side === THREE.BackSide;
  // (a mesh of a chunk's picture, by the part it is in: far ones hang from the scene in one group; near ones in a group per
  // part — the ground with its water and roads, the plants, the buildings — told apart by the materials beside them)
  const chunkPart = (o, mk, nm) => {
    const g = o.parent; if (!g || !g.parent) return null; const far = g.parent.isScene;
    const sib = new Set(g.children.map(c => nm.get([].concat(c.material)[0])).filter(Boolean));
    if (far) return { part: 'longe:' + ({ land: 'chão', water: 'água', ice: 'gelo', flora: 'árvores', solid: 'prédios' }[mk] || mk), owner: { land: 'A3', water: 'A5', ice: 'A5', flora: 'A3', solid: 'A2' }[mk] || 'líder' };
    if (sib.has('land')) return { part: 'perto:' + ({ land: 'chão', water: 'água', ice: 'gelo', wallWater: 'parede-dágua', solid: 'estradas' }[mk] || mk), owner: { land: 'A3', water: 'A5', ice: 'A5', wallWater: 'A5', solid: 'A3' }[mk] || 'líder' };
    if (sib.has('flora') || sib.has('leaf') || (mk === 'plant' && !sib.has('solid') && !sib.has('glass'))) return { part: 'perto:' + ({ flora: 'árvores-pedras', plant: 'plantas', leaf: 'folhas' }[mk] || mk), owner: 'A3' };
    if (sib.has('solid') || sib.has('glass')) return { part: 'perto:' + ({ solid: 'prédios', glass: 'vidro', plant: 'plantas-dos-prédios', water: 'água-dos-prédios' }[mk] || mk), owner: 'A2' };
    return null;
  };
  const who = o => {
    const mats = Array.isArray(o.material) ? o.material : [o.material]; const nm = names();
    const mk = mats.map(m => nm.get(m)).find(Boolean);
    const file = byOf(o);
    if (isSky(o)) return { part: 'realm3d.js:céu', owner: 'A5' };
    if (o.isPoints && file === 'realm3d.js') return { part: 'realm3d.js:estrelas', owner: 'A5' };
    if (mk && file === 'realm3d.js') { const c = chunkPart(o, mk, nm); if (c) return { part: 'realm3d.js:' + c.part, owner: c.owner }; }
    // (a thing that says its name — the things of the world: 'things:rock', 'things:lamp'... — is told by it, not by its material)
    if (o.name && typeof o.name === 'string' && file && file !== 'realm3d.js') return { part: file + ':' + o.name, owner: OWN_FILE[file] || OWN_MAT[mk] || '?' };
    if (mk) return { part: (file || 'realm3d.js') + ':' + mk, owner: OWN_MAT[mk] || OWN_FILE[file] || 'líder' };
    return { part: (file || '?') + ':' + ((mats[0] && (mats[0].name || mats[0].type)) || '?'), owner: OWN_FILE[file] || '?' };
  };
  const V = window.__VIS = {
    who, byOf,
    f(n, ms) { for (let k = 0; k < n; k++) G.Main.frameFor(ms || 33); },
    until(c, m, ms) { for (let k = 0; k < (m || 400); k++) { if (c()) return k; G.Main.frameFor(ms || 33); } return c() ? m : -1; },
    // (frames whose near pictures are all made at once: the stream's budget lifted — what the tests wait for, not the player)
    warm(n) { const R = G.Realm; const f0 = R.frame; R.frame = function (rdt, focus) { return f0.call(this, rdt, focus, 1e6); }; try { V.f(n || 2); } finally { R.frame = f0; } },
    // the 3D made again from nothing at a quality: what the last one made near the body is thrown away (switched in the
    // game, the near pictures of the old quality stay until each is made again — a measure would carry them)
    fresh(p) { const R = G.Realm; if (p) R.setQuality(p); R.stop(); R.start(); R.setOpacity(1); R.rebuildAll(); V.warm(2); V.f(2); },
    town: () => [...G.S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0],
    // a world opened as fotos.js opens it: the biggest town, its first grown-up (by id) taken into the body
    open(w, Q) {
      if (G.Modes.state !== 'GOD') { G.Modes.leave('deus'); V.until(() => G.Modes.state === 'GOD', 400); }
      if (Q) G.Realm.setQuality(Q);
      G.Save.apply(JSON.parse(G.Ready.data[w])); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
      return V.enterTown();
    },
    enterTown() {
      const S = G.S; const s = V.town(); if (!s) return { ok: false, why: 'sem cidade' };
      const v = [...S.villagers.values()].filter(o => o.set === s.id && o.age >= 18 && o.age < 55 && !o.inside && G.Possess.can(o).ok).sort((a, b) => a.id - b.id)[0];
      if (!v) return { ok: false, why: 'ninguém para encarnar' };
      // (the descent in frames of 0.1 s: the same flight, a third of the frames)
      G.Modes.enter(v); const k = V.until(() => G.Modes.state === 'INC', 300, 100); V.f(6);
      return { ok: k >= 0, town: s.name, pop: G.Village.pop(s.id), person: v.name, id: v.id, civ: ((G.Fac.ofSet ? G.Fac.ofSet(s.id) : null) || {}).civ || null };
    },
    // where the body stands in a view (fotos.js's rule, from the world's own data)
    spot(place) {
      const S = G.S, N = G.N, T = G.T; const s = V.town();
      const near = (x, y) => { for (let r = 0; r < 6; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const X = x + dx, Y = y + dy; if (G.W.inb(X, Y) && G.W.walkableXY(X, Y) && !S.treeAt[G.W.idx(X, Y)]) return [X, Y]; } return [x, y]; };
      const bl = t => [...S.buildings.values()].filter(b => b.type === t && b.built && b.set === s.id).sort((a, b) => a.id - b.id)[0];
      if (place === 'praca') { const b = bl('praca') || bl('campfire'); return b ? near(b.x - 1.2, b.y + b.h / 2) : null; }
      if (place === 'hut' || place === 'house') { const b = bl(place) || bl('hut') || bl('house'); return b ? near(b.x + b.w + 1.4, b.y + b.h + 1.4) : null; }
      let best = null, bs = -1;
      for (let y = 4; y < N - 4; y++) for (let x = 4; x < N - 4; x++) { const i = y * N + x; if (!G.W.walkable(i) || S.treeAt[i] || S.occ[i]) continue; let sc = 0;
        if (place === 'forest') { for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) if (S.treeAt[(y + dy) * N + x + dx]) sc++; }
        else { if (S.type[i] !== T.SAND) continue; for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) if (S.type[(y + dy) * N + x + dx] <= T.SEA) sc++; if (sc > 70) sc = 0; }
        if (sc > bs) { bs = sc; best = [x + 0.5, y + 0.5]; } }
      return best;
    },
    // the eye of a view: yaw (null: in front of the body; 'side': at its side), pitch, distance — held, not following
    eye(yaw, pitch, dist) {
      const st = G.Avatar.state(); if (!st) return; st.yaw = 0.3;
      const cy = yaw === null ? st.yaw + Math.PI : yaw === 'side' ? st.yaw + Math.PI / 2 : yaw;
      G.Cam3D.OPT.follow = false; G.Cam3D.yaw = cy; G.Cam3D.pitch = pitch; G.Cam3D.dist = dist; G.Cam3D.cur = dist;
    },
    // a view of fotos.js: the body placed, the hour set, the eye held (the frames fotos.js waits, but the near pictures made at once)
    go(vw) {
      const at = V.spot(vw.place); if (!at) return { ok: false, why: 'lugar ' + vw.place + ' não existe neste mundo' };
      const placed = G.Avatar.place(at[0], at[1]); G.S.time = vw.hour; V.warm(2); V.f(5);
      V.eye(vw.yaw, vw.pitch, vw.dist); V.warm(1); V.f(6); V.eye(vw.yaw, vw.pitch, vw.dist); G.Main.frameFor(1);
      return { ok: true, placed, at: at.map(q => +q.toFixed(2)) };
    },
    // (the graphics card made to finish the frame: one pixel read back — or the time measured is only the CPU's)
    sync() { const gl = G.Realm.renderer().getContext(); const px = new Uint8Array(4); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); },
    // the picture's light, read back from the frame just drawn (it must be read in the same task: the buffer is not kept)
    pixels() {
      const gl = G.Realm.renderer().getContext(); const w = gl.drawingBufferWidth, h = gl.drawingBufferHeight; const px = new Uint8Array(w * h * 4);
      gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
      let s = 0, s2 = 0, blk = 0, wht = 0, n = 0;
      for (let k = 0; k < px.length; k += 16) { const L = 0.2126 * px[k] + 0.7152 * px[k + 1] + 0.0722 * px[k + 2]; s += L; s2 += L * L; n++; if (L < 6) blk++; if (L > 250) wht++; }
      const m = s / n; return { mean: +m.toFixed(1), sd: +Math.sqrt(Math.max(0, s2 / n - m * m)).toFixed(1), black: +(blk / n * 100).toFixed(1), white: +(wht / n * 100).toFixed(1), w, h };
    },
    // one frame counted alone, every pass of it (three resets its counts at each render: a post-process would hide the rest)
    count() {
      const r = G.Realm.renderer(); const info = r.info; const r0 = r.render; let passes = 0;
      r.render = function () { passes++; return r0.apply(this, arguments); };
      info.autoReset = false; info.reset();
      try { G.Main.frameFor(33); V.sync(); } finally { r.render = r0; info.autoReset = true; }
      return { calls: info.render.calls, tris: info.render.triangles, points: info.render.points, lines: info.render.lines, passes, pix: V.pixels() };
    },
    // n frames timed: the whole frame (the world's step and the 3D) and the 3D alone, each waited for to the end
    time(n) {
      const R = G.Realm; const f0 = R.frame; let t3 = 0; const all = [], d3 = [];
      R.frame = function () { const t0 = performance.now(); const o = f0.apply(this, arguments); V.sync(); t3 += performance.now() - t0; return o; };
      try { for (let k = 0; k < n; k++) { t3 = 0; const t0 = performance.now(); G.Main.frameFor(33); V.sync(); all.push(performance.now() - t0); d3.push(t3); } } finally { R.frame = f0; }
      const med = a => { const b = a.slice().sort((p, q) => p - q); return b.length ? b[Math.floor(b.length / 2)] : null; };
      const p95 = a => { const b = a.slice().sort((p, q) => p - q); return b.length ? b[Math.min(b.length - 1, Math.floor(b.length * 0.95))] : null; };
      // (and the mean: a shadow redrawn every other frame makes two kinds of frame, and the median of an odd count falls on
      // one kind or the other by chance — the mean of an even count is what the frames cost)
      const mean = a => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : null);
      return { ms: +med(all).toFixed(1), msP95: +p95(all).toFixed(1), ms3d: +med(d3).toFixed(1), ms3dP95: +p95(d3).toFixed(1), msMean: +mean(all).toFixed(1), ms3dMean: +mean(d3).toFixed(1), n };
    },
    // what is drawn, by who answers for it: the objects in the eye's frustum, their draw calls and triangles (the main pass)
    census() {
      const cam = G.Realm.camera(); const scene = G.Realm.scene(); cam.updateMatrixWorld(); scene.updateMatrixWorld();
      const fr = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
      const out = {};
      scene.traverseVisible(o => {
        if (!(o.isMesh || o.isPoints || o.isLine || o.isSprite)) return;
        // (instances: an InstancedMesh's count, or — a mesh drawing an InstancedBufferGeometry, as the continuous body does — the
        // geometry's own instanceCount: counted as one, the bodies of 19 people weighed as one each mesh, 193 thousand short)
        const gi = o.geometry; const inst = o.isInstancedMesh ? o.count : gi && gi.isInstancedBufferGeometry && Number.isFinite(gi.instanceCount) ? gi.instanceCount : 1; if (!inst) return;
        if (o.frustumCulled !== false && !(o.isSprite ? fr.intersectsSprite(o) : fr.intersectsObject(o))) return;
        const g = o.geometry; if (!g || !g.attributes || !g.attributes.position) return;
        const n = Math.min(g.index ? g.index.count : g.attributes.position.count, g.drawRange ? g.drawRange.count : Infinity);
        const calls = Array.isArray(o.material) ? Math.max(1, (g.groups || []).length) : 1;
        const w = who(o); const e = out[w.part] || (out[w.part] = { owner: w.owner, objs: 0, calls: 0, tris: 0, inst: 0 });
        e.objs++; e.calls += calls; e.inst += inst; if (o.isMesh) e.tris += Math.round(n / 3) * inst;
      });
      return out;
    },
    // how many of each thing the drawing has this frame (what each module says it drew)
    drawn() {
      const g = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
      const P = G.People3D || {}, T = G.Things3D || {}, F = G.FX3D || {}, D = G.Dragon3D || {}, GR = G.Grass3D || {};
      return { people: g(() => P.count, null), crowd: g(() => P.crowd, null), beasts: g(() => P.beasts, null), dead: g(() => P.dead, null),
        near: g(() => G.Realm.chunkCount().near, null), chunks: g(() => G.Realm.chunkCount().all, null), grass: g(() => (GR.on ? GR.clumps : 0), null),
        particles: g(() => F.particles, null), fires: g(() => F.fires, null), torches: g(() => F.torches, null), dragons: g(() => D.drawn, null),
        things: g(() => Object.fromEntries(Object.entries(T.n || {}).filter(([, v]) => v > 0)), null) };
    },
    // what the graphics card holds and what the scene holds right now (bytes of geometry counted from the arrays themselves)
    memory() {
      const r = G.Realm.renderer(); const scene = G.Realm.scene(); const geos = new Set(), texs = new Set(), mats = new Set();
      scene.traverse(o => { if (o.geometry) geos.add(o.geometry); if (o.material) for (const m of [].concat(o.material)) mats.add(m); });
      let gb = 0; for (const g of geos) { for (const k in g.attributes) gb += g.attributes[k].array.byteLength; if (g.index) gb += g.index.array.byteLength; }
      scene.traverse(o => { if (o.isInstancedMesh) { gb += o.instanceMatrix.array.byteLength; if (o.instanceColor) gb += o.instanceColor.array.byteLength; } });
      const tx = v => { if (v && v.isTexture) texs.add(v); };
      for (const m of mats) { for (const k in m) tx(m[k]); if (m.uniforms) for (const k in m.uniforms) tx(m.uniforms[k] && m.uniforms[k].value); const pu = r.properties.get(m).uniforms; if (pu) for (const k in pu) tx(pu[k] && pu[k].value); }
      let tb = 0; for (const t of texs) { const im = t.image || {}; const w = im.width || 0, h = im.height || 0, d = im.depth || 1; tb += w * h * d * 4 * (t.generateMipmaps || (t.mipmaps && t.mipmaps.length) ? 1.33 : 1); }
      const pm = performance.memory;
      return { programs: (r.info.programs || []).length, textures: r.info.memory.textures, geometries: r.info.memory.geometries, live: geos.size, materials: mats.size,
        geoMB: +(gb / 1048576).toFixed(1), texMB: +(tb / 1048576).toFixed(1), heapMB: pm ? +(pm.usedJSHeapSize / 1048576).toFixed(1) : null };
    },
  };
}

module.exports = { views, open, PAGE, QUIET };
