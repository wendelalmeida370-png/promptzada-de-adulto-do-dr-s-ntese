// itens-figuras: the things of the catalog (G.Itens) photographed by the game's own three.js, in the game's own light — the
// pictures of the inventory (js/itemicons.js, generated here: never edited by hand) and the photo sheets for the owner.
//   bash qa/navegador.sh node qa/visual/itens-figuras.js PASTA [icones|folha|corpo|tudo]   (tudo by default)
//     icones: renders every key's picture (128 × 128 WebP, a transparent ground: the thing at a three-quarter turn, the same
//             light for all, a soft dark outline that reads on a dark and on a light screen) and writes js/itemicons.js, with
//             the signature of the shape each picture was rendered from (G.ItemArt.sig: a shape changed since is a stale picture —
//             qa/visual/itens-arte.js fails on it); and PASTA/figuras.png, every picture on the dark glass and on parchment
//     folha:  PASTA/folha-N.png — every thing from two sides (near level), its mid and far levels beside, its size and triangles;
//             and PASTA/folha-corpo.png (also alone: corpo) — the game's two bodies in clay wearing the helmets and the cuirasses
//             and with things stowed on the back and at the belt where G.ItemArt.stow puts them, from the front and from behind
//   env KEYS (a,b: only these keys — the pictures of the others are kept), SS (supersampling, 4)
// Only the drawing files of the things are loaded (three.js, the catalog, the recipes, the port): no world, nothing fetched.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.resolve(process.argv[2] || '.'); const MODE = process.argv[3] || 'tudo';
fs.mkdirSync(OUT, { recursive: true });
// (the game's soft diffuse is a patch the realm lays on three.js's Lambert — read from realm3d.js itself, so the pictures
// keep the game's light when it changes)
const realm = fs.readFileSync(path.join(ROOT, 'js/realm3d.js'), 'utf8');
const tm = realm.match(/rep\('lights_lambert_pars_fragment', ('[^']*'), (`[^`]*`)\);/);
if (!tm) { console.log('FALHA: o remendo da luz do realm3d.js (lights_lambert_pars_fragment) não foi achado'); process.exit(1); }
const TOON = [eval(tm[1]), eval(tm[2])]; // (two string literals of the game's own source)

(async () => {
  const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 800, height: 800 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/GL Driver|GroupMarker|software WebGL|swiftshader/i.test(t)) errs.push('console: ' + t.slice(0, 400)); });
  await page.setContent('<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="512" height="512"></canvas></body></html>');
  await page.addScriptTag({ path: path.join(ROOT, 'js/lib/three.min.js') });
  await page.addScriptTag({ content: 'window.G = {};' });
  for (const f of ['js/itens.js', 'js/itemforma.js', 'js/itemarte.js']) await page.addScriptTag({ path: path.join(ROOT, f) });
  const SS = +process.env.SS || 4;
  await page.evaluate(({ TOON, SS }) => {
    const THREE = window.THREE; const SC = THREE.ShaderChunk;
    if (SC.lights_lambert_pars_fragment.indexOf(TOON[0]) >= 0) SC.lights_lambert_pars_fragment = SC.lights_lambert_pars_fragment.replace(TOON[0], TOON[1]);
    const cv = document.getElementById('c');
    const R = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true, preserveDrawingBuffer: true });
    R.setClearColor(0x000000, 0); R.toneMapping = THREE.NeutralToneMapping; R.toneMappingExposure = 1.0;
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xcfe6ff, 0x5a5a3a, 1.0));
    const sun = new THREE.DirectionalLight(0xfff2dc, 2.4); scene.add(sun); scene.add(sun.target);
    const back = new THREE.DirectionalLight(0xdfe8ff, 0.8); scene.add(back); scene.add(back.target);
    const mat = G.ItemArt.material(THREE, { key: 'figura' });
    const mesh = new THREE.Mesh(new THREE.BufferGeometry(), mat); scene.add(mesh);
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 50);
    // how each kind is turned for its picture: the long ones on the diagonal, the working end up and to the right, the flat of
    // the blade to the eye; the shield, the helmet, the cuirass from three-quarters; what hangs, its mouth up
    const FACE = ['pa', 'remo']; // (their working end is a face, not an edge: the face to the eye)
    const LONG = ['machado', 'picareta', 'pa', 'enxada', 'foice', 'martelo', 'faca', 'vara', 'remo', 'cajado', 'tocha', 'espada', 'lanca', 'clava', 'flecha'];
    const turn = (kind, side) => {
      const q = new THREE.Quaternion(), e = new THREE.Euler();
      const s = side ? -1 : 1;
      if (LONG.includes(kind)) { const a = new THREE.Quaternion().setFromEuler(e.set(0, FACE.includes(kind) ? -s * 0.5 : Math.PI / 2 - s * 0.38, 0)); const b = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI / 4); const c = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.12); return q.multiply(c).multiply(b).multiply(a); }
      if (kind === 'arco') { const a = new THREE.Quaternion().setFromEuler(e.set(0, Math.PI / 2 - s * 0.3, 0)); const b = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -0.62); return q.multiply(b).multiply(a); }
      if (kind === 'escudo') return q.setFromEuler(e.set(0.14, s * 0.55 + (side ? Math.PI : 0), 0.05));
      if (kind === 'elmo' || kind === 'couraca') return q.setFromEuler(e.set(0.2, s * 0.62 + (side ? Math.PI : 0), 0));
      if (kind === 'cesto' || kind === 'balde') { const a = new THREE.Quaternion().setFromEuler(e.set(Math.PI / 2 + 0.6, 0, 0)); const b = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), s * 0.6 + (side ? Math.PI : 0)); return q.multiply(b).multiply(a); }
      if (kind === 'rede') return q.setFromEuler(e.set(Math.PI + 0.12, s * 0.6, 0));
      if (kind === 'funda') return q.setFromEuler(e.set(-Math.PI / 2 + 0.25, s * 0.5 + 0.3, 0.6));
      return q.setFromEuler(e.set(0.3, s * 0.6, 0));
    };
    // (a long thing's picture shows its working end: the frame holds at most this much of it, the rest runs off the corner — the
    // rod, its butt with the winder and the line: its tip runs off)
    const CROP = { lanca: 0.85, remo: 1.0, vara: -1.25, cajado: 1.0, enxada: 0.8, pa: 0.95 };
    // (the arrows' picture is a small fan of three: they come by the dozen)
    const fan = [-0.11, 0.11].map(() => { const m = new THREE.Mesh(new THREE.BufferGeometry(), mat); m.visible = false; scene.add(m); return m; });
    // draw one key at a level, turned, into the canvas at w × h: the camera fitted to its turned box
    window.shot = (key, lod, side, w, h, crop) => {
      const g = G.ItemArt.geo(key, lod); mesh.geometry = g; const kind = key.split('.')[0];
      mesh.quaternion.copy(turn(kind, side)); mesh.updateMatrixWorld(true);
      const many = crop && kind === 'flecha'; fan.forEach((m, i) => { m.visible = many; if (!many) return; m.geometry = g; m.quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), i ? 0.11 : -0.11).multiply(mesh.quaternion); m.position.set(i ? 0.012 : -0.012, i ? -0.01 : 0.01, -0.02 * (i + 1)); m.updateMatrixWorld(true); });
      const P = g.attributes.position; const v = new THREE.Vector3(); let lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
      const cr = crop && CROP[kind]; const yHi = g.boundingBox.max.y, yLo = g.boundingBox.min.y;
      for (const m of [mesh].concat(many ? fan : [])) for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); if (cr > 0 && v.y < yHi - cr) continue; if (cr < 0 && v.y > yLo - cr) continue; v.applyMatrix4(m.matrixWorld); lo = [Math.min(lo[0], v.x), Math.min(lo[1], v.y), Math.min(lo[2], v.z)]; hi = [Math.max(hi[0], v.x), Math.max(hi[1], v.y), Math.max(hi[2], v.z)]; }
      const cx = (lo[0] + hi[0]) / 2, cy = (lo[1] + hi[1]) / 2; const half = Math.max(hi[0] - lo[0], (hi[1] - lo[1]) * w / h) / 2 * 1.08;
      cam.left = -half; cam.right = half; cam.top = half * h / w; cam.bottom = -half * h / w; cam.position.set(cx, cy, hi[2] + 5); cam.lookAt(cx, cy, 0); cam.near = 0.1; cam.far = (hi[2] - lo[2]) + 10; cam.updateProjectionMatrix();
      // (the sun from the upper left and in front, the rim from behind on the right: the same for every thing)
      sun.position.set(cx - 3, cy + 4, hi[2] + 4); sun.target.position.set(cx, cy, 0); back.position.set(cx + 3, cy + 1, lo[2] - 4); back.target.position.set(cx, cy, 0);
      R.setSize(w, h, false); R.render(scene, cam); return cv;
    };
    // the picture: rendered SS× larger, brought down in halves, a soft dark outline and shadow under it
    window.icon = (key, N) => {
      const big = shot(key, 0, 0, N * SS, N * SS, true);
      let src = big, s = N * SS; while (s > N) { const n = Math.max(N, s / 2); const c = document.createElement('canvas'); c.width = c.height = n; const x = c.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, n, n); src = c; s = n; }
      const sil = document.createElement('canvas'); sil.width = sil.height = N; const sx = sil.getContext('2d'); sx.drawImage(src, 0, 0); sx.globalCompositeOperation = 'source-in'; sx.fillStyle = 'rgb(18,13,8)'; sx.fillRect(0, 0, N, N);
      const out = document.createElement('canvas'); out.width = out.height = N; const o = out.getContext('2d');
      o.globalAlpha = 0.32; o.filter = 'blur(2.2px)'; o.drawImage(sil, 1, 2); o.filter = 'none';
      o.globalAlpha = 0.62; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7]]) o.drawImage(sil, dx, dy);
      o.globalAlpha = 1; o.drawImage(src, 0, 0);
      return out.toDataURL('image/webp', 0.9);
    };
  }, { TOON, SS });

  const all = await page.evaluate(() => G.ItemArt.keys());
  const KEYS = process.env.KEYS ? process.env.KEYS.split(',').filter(k => all.includes(k)) : all;
  const T0 = Date.now();
  if (MODE === 'icones' || MODE === 'tudo') {
    const icons = {}, sig = {};
    const oldF = path.join(ROOT, 'js/itemicons.js');
    if (process.env.KEYS && fs.existsSync(oldF)) { const t = fs.readFileSync(oldF, 'utf8'); const m = t.match(/G\.ITEMICONS = (\{[\s\S]*\});/); if (m) { const d = JSON.parse(m[1]); Object.assign(icons, d.img); Object.assign(sig, d.sig); } }
    for (const k of KEYS) { icons[k] = await page.evaluate(k => icon(k, G.ItemArt.ICON_SIZE), k); sig[k] = await page.evaluate(k => G.ItemArt.sig(k), k); }
    for (const k of Object.keys(icons)) if (!all.includes(k)) { delete icons[k]; delete sig[k]; }
    const data = { v: 1, size: 128, fmt: 'webp', sig, img: icons };
    const head = '\'use strict\';\n// GENERATED by qa/visual/itens-figuras.js — do not edit by hand. The pictures of the things (G.ItemArt.icon): each key of the\n// catalog rendered by the game\'s three.js in the game\'s light, 128 × 128 WebP with a transparent ground; sig: the signature of\n// the shape each picture was rendered from (G.ItemArt.sig). Original (arte/LICENCAS.md).\n';
    fs.writeFileSync(oldF, head + 'window.G = window.G || {}; G.ITEMICONS = ' + JSON.stringify(data) + ';\n');
    const kb = fs.statSync(oldF).size / 1024; console.log(`figuras: ${Object.keys(icons).length} em js/itemicons.js (${kb.toFixed(0)} KB)`);
    // (every picture on the dark glass of the screen and on parchment, its key under it)
    const png = await page.evaluate(({ keys, icons }) => new Promise(done => {
      const N = 128, cols = 8, cw = N + 24, ch = N + 30, rows = Math.ceil(keys.length / cols); const c = document.createElement('canvas'); c.width = cols * cw * 2 + 30; c.height = rows * ch + 20; const x = c.getContext('2d');
      x.fillStyle = '#1b1915'; x.fillRect(0, 0, cols * cw + 10, c.height); x.fillStyle = '#e6dcc8'; x.fillRect(cols * cw + 20, 0, cols * cw + 10, c.height);
      let n = keys.length; if (!n) done(c.toDataURL('image/png'));
      keys.forEach((k, i) => { const im = new Image(); im.onload = () => { for (const s of [0, 1]) { const ox = s * (cols * cw + 20) + (i % cols) * cw + 12, oy = Math.floor(i / cols) * ch + 10; x.fillStyle = s ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)'; x.fillRect(ox - 2, oy - 2, N + 4, N + 4); x.drawImage(im, ox, oy); x.fillStyle = s ? '#2a2620' : '#cfc6b4'; x.font = '11px sans-serif'; x.fillText(k, ox, oy + N + 14); } if (--n === 0) done(c.toDataURL('image/png')); }; im.src = icons[k]; });
    }), { keys: Object.keys(icons), icons });
    fs.writeFileSync(path.join(OUT, 'figuras.png'), Buffer.from(png.split(',')[1], 'base64')); console.log('figuras: ' + path.join(OUT, 'figuras.png'));
  }
  if (MODE === 'folha' || MODE === 'tudo' || MODE === 'corpo') {
    // (the things on a body of 1.75 m — the game's two bodies, in clay, in their bind pose: what is worn on its bone, what is
    // stowed where G.ItemArt.stow puts it — from the front and from behind)
    await page.addScriptTag({ path: path.join(ROOT, 'js/bodymesh.js') });
    const png = await page.evaluate(() => {
      const THREE = window.THREE; const BM = G.BODYMESH; const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
      const bodyGeo = n => { const m = BM.meshes[n]; const q = new Uint16Array(b64(m.pos).buffer); const P = new Float32Array(m.n * 3); for (let i = 0; i < m.n; i++) for (let k = 0; k < 3; k++) P[i * 3 + k] = m.lo[k] + q[i * 3 + k] * m.sc[k];
        const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); const ib = b64(m.idx); g.setIndex(new THREE.BufferAttribute(m.i32 ? new Uint32Array(ib.buffer) : new Uint16Array(ib.buffer), 1)); g.computeVertexNormals(); return g; };
      const cv = document.createElement('canvas'); cv.width = 280; cv.height = 420; const R = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true, preserveDrawingBuffer: true }); R.setClearColor(0, 0); R.toneMapping = THREE.NeutralToneMapping;
      const scene = new THREE.Scene(); scene.add(new THREE.HemisphereLight(0xcfe6ff, 0x5a5a3a, 1.0)); const sun = new THREE.DirectionalLight(0xfff2dc, 2.4); sun.position.set(-2, 4, 3); scene.add(sun);
      const clay = new THREE.MeshLambertMaterial({ color: 0xb4ada2 }); const mat = G.ItemArt.material(THREE, { key: 'corpo' });
      const OUT = [['corpoM', ['elmo.ferro', 'couraca.ferro'], [['espada.ferro', 'cinto'], ['escudo.madeira', 'costas']]], ['corpoF', ['elmo.bronze', 'couraca.bronze'], [['espada.bronze', 'cinto'], ['escudo.bronze', 'costas']]],
        ['corpoM', ['elmo.couro', 'couraca.couro'], [['machado.ferro', 'cinto'], ['lanca.ferro', 'costas']]], ['corpoF', [], [['faca.ferro', 'cinto'], ['arco.madeira', 'costas']]],
        ['corpoM', [], [['martelo.ferro', 'cinto'], ['picareta.ferro', 'costas']]], ['corpoF', [], [['funda.corda', 'cinto'], ['cesto.vime', 'costas']]],
        ['corpoM', [], [['foice.ferro', 'cinto'], ['rede.corda', 'costas']]], ['corpoF', [], [['clava.madeira', 'cinto'], ['remo.madeira', 'costas']]]];
      const bone = n => BM.bind[n === 'pel' ? 'pel' : n]; const cam = new THREE.PerspectiveCamera(26, 280 / 420, 0.1, 50);
      const W = 280, H = 420; const c = document.createElement('canvas'); c.width = 4 * (2 * W + 20) + 20; c.height = 2 * (H + 34) + 20; const x = c.getContext('2d');
      const bg = x.createLinearGradient(0, 0, 0, c.height); bg.addColorStop(0, '#8f969c'); bg.addColorStop(1, '#6d7175'); x.fillStyle = bg; x.fillRect(0, 0, c.width, c.height);
      OUT.forEach(([body, worn, stow], n) => {
        const group = new THREE.Group(); group.add(new THREE.Mesh(bodyGeo(body), clay)); const names = [];
        for (const k of worn) { const m = new THREE.Mesh(G.ItemArt.geo(k, 0), mat); const b = bone(k.startsWith('elmo') ? 'head' : 'chest'); m.position.set(b[0], b[1], b[2]); group.add(m); names.push(k); }
        for (const [k, place] of stow) { const s = G.ItemArt.stow(k, place); if (!s) continue; const m = new THREE.Mesh(G.ItemArt.geo(k, 0), mat); const b = bone(s.bone); m.quaternion.set(s.q[0], s.q[1], s.q[2], s.q[3]); m.position.set(b[0] + s.at[0], b[1] + s.at[1], b[2] + s.at[2]); group.add(m); names.push(k + ' (' + place + ')'); }
        scene.add(group);
        for (const side of [0, 1]) { const a = side ? Math.PI + 0.6 : 0.55; cam.position.set(Math.sin(a) * 5.2, 1.05, Math.cos(a) * 5.2); cam.lookAt(0, 0.95, 0); R.setSize(W, H, false); R.render(scene, cam);
          x.drawImage(cv, 15 + (n % 4) * (2 * W + 20) + side * W, 10 + Math.floor(n / 4) * (H + 34)); }
        x.fillStyle = '#101418'; x.font = '12px sans-serif'; x.fillText(names.join(' · '), 18 + (n % 4) * (2 * W + 20), 10 + Math.floor(n / 4) * (H + 34) + H + 16);
        scene.remove(group);
      });
      return c.toDataURL('image/png');
    });
    const f = path.join(OUT, 'folha-corpo.png'); fs.writeFileSync(f, Buffer.from(png.split(',')[1], 'base64')); console.log('folha: ' + f);
  }
  if (MODE === 'folha' || MODE === 'tudo') {
    const per = 12, cols = 3; let page_ = 0;
    for (let i0 = 0; i0 < KEYS.length; i0 += per) {
      const keys = KEYS.slice(i0, i0 + per); page_++;
      const png = await page.evaluate(({ keys, cols }) => {
        const V = 300, S2 = 140, cw = V * 2 + S2 + 30, ch = V + 46; const rows = Math.ceil(keys.length / cols); const c = document.createElement('canvas'); c.width = cols * cw + 20; c.height = rows * ch + 20; const x = c.getContext('2d');
        const bg = x.createLinearGradient(0, 0, 0, c.height); bg.addColorStop(0, '#8f969c'); bg.addColorStop(1, '#6d7175'); x.fillStyle = bg; x.fillRect(0, 0, c.width, c.height);
        keys.forEach((k, i) => { const ox = (i % cols) * cw + 15, oy = Math.floor(i / cols) * ch + 12; const inf = G.ItemArt.info(k);
          x.fillStyle = 'rgba(255,255,255,0.10)'; x.fillRect(ox - 4, oy - 4, cw - 18, ch - 10);
          x.drawImage(shot(k, 0, 0, V, V, false), ox, oy); x.drawImage(shot(k, 0, 1, V, V, false), ox + V + 6, oy);
          x.drawImage(shot(k, 1, 0, S2, S2, false), ox + 2 * V + 12, oy); x.drawImage(shot(k, 2, 0, S2, S2, false), ox + 2 * V + 12, oy + S2 + 6);
          const sz = inf.hi.map((h, a) => h - inf.lo[a]); const L = Math.max(...sz);
          x.fillStyle = '#101418'; x.font = 'bold 15px sans-serif'; x.fillText(k, ox + 4, oy + V + 20); x.font = '12.5px sans-serif';
          x.fillText(`${(L).toFixed(2).replace('.', ',')} m · triângulos ${inf.tris.join(' / ')} (perto / meio / longe)`, ox + 4, oy + V + 37); x.fillText('meio', ox + 2 * V + 14, oy + 12); x.fillText('longe', ox + 2 * V + 14, oy + S2 + 18); });
        return c.toDataURL('image/png');
      }, { keys, cols });
      const f = path.join(OUT, `folha-${page_}.png`); fs.writeFileSync(f, Buffer.from(png.split(',')[1], 'base64')); console.log('folha: ' + f);
    }
  }
  await browser.close();
  console.log(`(${((Date.now() - T0) / 1000).toFixed(0)} s)`);
  if (errs.length) { console.log('FALHA: erros na página:\n' + errs.slice(0, 10).join('\n')); process.exit(1); }
  console.log('PASSOU');
})();
