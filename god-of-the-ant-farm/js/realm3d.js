'use strict';
// ============================================================
//  Realm (3D): the same world, seen from the ground. Nothing
//  here is a world of its own: every hill is a height of S.H,
//  every tree is a tree of S.trees, every house a building of
//  S.buildings, every person someone of S.villagers. This module
//  only draws what G.S says, with Three.js (js/lib/three.min.js).
//  The land is cut in chunks of 16×16 tiles (64×64 m). Each has
//  two pictures: a far one, built for the whole map when the
//  view opens (coarse ground, boxes for houses, blobs for trees:
//  the horizon, the town seen from the hill), and a near one,
//  built around the body as it walks and thrown away behind it
//  (with its geometry disposed). A chunk is built again when
//  what is in it changes — a house goes up, a tree falls.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const R3 = G.Realm = { on: false, built: 0, failed: null, stats: { chunks: 0, near: 0, builds: 0, rebuilds: 0, parts: 0, farBuilds: 0, ms: 0 } };
  const C = 16, TAU = Math.PI * 2;
  const Sp = () => G.Space;
  // quality: what the machine can carry (the player's choice, kept in this browser only)
  const QUAL = {
    baixa: { scale: 0.75, near: 2, shadows: 0, npcs: 18, grass: 0, view: 260 },
    media: { scale: 1, near: 3, shadows: 1024, npcs: 36, grass: 1, view: 420 },
    alta: { scale: 1, near: 4, shadows: 2048, npcs: 60, grass: 1, view: 640 },
  };
  R3.QUAL = QUAL;
  R3.q = (() => { try { return localStorage.getItem('gotaf-3dq') || 'media'; } catch (e) { return 'media'; } })();
  if (!QUAL[R3.q]) R3.q = 'media';
  // (a preset, and the player's own changes over it: view distance, people drawn, resolution, shadows, grass)
  let over = {}; try { const o = JSON.parse(localStorage.getItem('gotaf-3dover') || 'null'); if (o && typeof o === 'object') for (const k in o) if (k in QUAL.media && Number.isFinite(o[k])) over[k] = o[k]; } catch (e) { }
  let qc = null;
  R3.Q = () => qc || (qc = Object.assign({}, QUAL[R3.q] || QUAL.media, over));
  R3.setQuality = function (k) { if (!QUAL[k]) return; R3.q = k; over = {}; qc = null; try { localStorage.setItem('gotaf-3dq', k); localStorage.removeItem('gotaf-3dover'); } catch (e) { } if (renderer) applyQuality(); };
  R3.setOver = function (k, v) { if (!(k in QUAL.media) || !Number.isFinite(v)) return; over[k] = v; qc = null; try { localStorage.setItem('gotaf-3dover', JSON.stringify(over)); } catch (e) { } if (renderer) applyQuality(); };

  let THREE = null, renderer = null, scene = null, camera = null, canvas = null;
  let sun = null, hemi = null, skyMesh = null, skyU = null, stars = null, moonL = null;
  const MAT = {};
  const U = { time: { value: 0 } }; // (the water's own clock: only seen)
  R3.scene = () => scene; R3.camera = () => camera; R3.three = () => THREE; R3.renderer = () => renderer; R3.canvas = () => canvas; R3.mats = () => MAT;

  // ------------------------------ colours ------------------------------
  const col = new Map();
  // (an sRGB hex or [r,g,b] 0..255 to the linear floats the vertex colours need)
  function lin(c) {
    const k = typeof c === 'string' ? c : (c[0] | 0) * 65536 + (c[1] | 0) * 256 + (c[2] | 0);
    let o = col.get(k); if (o) return o;
    const t = new THREE.Color(); if (typeof c === 'string') t.set(c); else t.setRGB(G.clamp(c[0], 0, 255) / 255, G.clamp(c[1], 0, 255) / 255, G.clamp(c[2], 0, 255) / 255, THREE.SRGBColorSpace);
    o = [t.r, t.g, t.b]; if (col.size > 6000) col.clear(); col.set(k, o); return o;
  }
  R3.lin = c => lin(c);

  // ------------------------------ geometry: one builder, many shapes ------------------------------
  // (every static thing of a chunk goes into one geometry with its colours: a few draw calls, not thousands)
  class Geo {
    constructor() { this.p = []; this.n = []; this.c = []; }
    // a shape (BufferGeometry), moved by a matrix, painted one colour (or a function of the vertex)
    put(g, m, color) {
      const P = g.attributes.position.array, Nn = g.attributes.normal.array, I = g.index ? g.index.array : null;
      const e = m.elements; const nm = R3._nm.getNormalMatrix(m).elements;
      const cc = typeof color === 'function' ? null : lin(color);
      const cnt = I ? I.length : P.length / 3;
      for (let k = 0; k < cnt; k++) {
        const j = I ? I[k] : k; const x = P[j * 3], y = P[j * 3 + 1], z = P[j * 3 + 2];
        const X = e[0] * x + e[4] * y + e[8] * z + e[12], Y = e[1] * x + e[5] * y + e[9] * z + e[13], Z = e[2] * x + e[6] * y + e[10] * z + e[14];
        const a = Nn[j * 3], b = Nn[j * 3 + 1], d = Nn[j * 3 + 2];
        let nx = nm[0] * a + nm[3] * b + nm[6] * d, ny = nm[1] * a + nm[4] * b + nm[7] * d, nz = nm[2] * a + nm[5] * b + nm[8] * d; const l = Math.hypot(nx, ny, nz) || 1;
        this.p.push(X, Y, Z); this.n.push(nx / l, ny / l, nz / l);
        const q = cc || lin(color(X, Y, Z, nx / l, ny / l, nz / l)); this.c.push(q[0], q[1], q[2]);
      }
    }
    // a raw triangle (three points, one colour each or one for all), with its own normal
    tri(a, b, c, ca, cb, cc) {
      const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
      const A = lin(ca), B = lin(cb || ca), Cc = lin(cc || ca);
      this.p.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); this.n.push(nx, ny, nz, nx, ny, nz, nx, ny, nz); this.c.push(A[0], A[1], A[2], B[0], B[1], B[2], Cc[0], Cc[1], Cc[2]);
    }
    quad(a, b, c, d, ca, cb, cc, cd) { this.tri(a, b, c, ca, cb, cc); this.tri(a, c, d, ca, cc, cd || ca); }
    get empty() { return !this.p.length; }
    build() {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
      g.computeBoundingSphere();
      return g;
    }
  }
  R3.Geo = () => new Geo();
  // the shapes every builder uses, made once
  const SH = {};
  const M4 = () => new THREE.Matrix4();
  // position + rotation around Y + scale, as one matrix
  R3.mat = function (x, y, z, ry, sx, sy, sz, rx, rz) {
    const m = R3._m.makeRotationY(ry || 0);
    if (rx) m.multiply(R3._m2.makeRotationX(rx)); if (rz) m.multiply(R3._m2.makeRotationZ(rz));
    m.scale(R3._v.set(sx === undefined ? 1 : sx, sy === undefined ? (sx === undefined ? 1 : sx) : sy, sz === undefined ? (sx === undefined ? 1 : sx) : sz));
    m.setPosition(x, y, z); return m;
  };

  // ------------------------------ setting up ------------------------------
  function init() {
    THREE = window.THREE; if (!THREE) throw new Error('three.js não carregou');
    R3._m = new THREE.Matrix4(); R3._m2 = new THREE.Matrix4(); R3._v = new THREE.Vector3(); R3._nm = new THREE.Matrix3();
    canvas = document.createElement('canvas'); canvas.id = 'game3d';
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;display:none;z-index:1;opacity:0;outline:none;';
    document.body.insertBefore(canvas, document.getElementById('game').nextSibling);
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false });
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1600);
    hemi = new THREE.HemisphereLight(0xcfe6ff, 0x5a5a3a, 1.2); scene.add(hemi);
    sun = new THREE.DirectionalLight(0xfff2dc, 2.4); sun.position.set(40, 80, 30); scene.add(sun); scene.add(sun.target);
    moonL = new THREE.DirectionalLight(0x8aa4ff, 0); scene.add(moonL);
    scene.fog = new THREE.Fog(0xbfd8ea, 120, 600);
    // the sky: a dome painted from the horizon up, the sun and moon on it, stars at night
    skyU = { top: { value: new THREE.Color(0x5a9ae0) }, hor: { value: new THREE.Color(0xcfe4f2) }, sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunCol: { value: new THREE.Color(0xfff0c0) }, night: { value: 0 } };
    skyMesh = new THREE.Mesh(new THREE.SphereGeometry(1400, 24, 12), new THREE.ShaderMaterial({
      uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
      vertexShader: 'varying vec3 vd; void main(){ vd = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'uniform vec3 top; uniform vec3 hor; uniform vec3 sunDir; uniform vec3 sunCol; uniform float night; varying vec3 vd;' +
        'void main(){ float h = clamp(vd.y, -0.2, 1.0); vec3 c = mix(hor, top, pow(max(h, 0.0), 0.55)); if (h < 0.0) c = mix(hor, hor * 0.7, -h * 4.0);' +
        ' float s = max(dot(vd, sunDir), 0.0); c += sunCol * (pow(s, 600.0) * 2.0 + pow(s, 12.0) * 0.18) * (1.0 - night * 0.7);' +
        ' vec3 md = -sunDir; float m = max(dot(vd, md), 0.0); c += vec3(0.85, 0.9, 1.0) * pow(m, 900.0) * 1.6 * night; gl_FragColor = vec4(c, 1.0); }',
    }));
    skyMesh.renderOrder = -1; skyMesh.frustumCulled = false; scene.add(skyMesh);
    { const n = 700, p = new Float32Array(n * 3); for (let k = 0; k < n; k++) { const a = G.hash(k * 3 + 1) * TAU, e = Math.asin(G.hash(k * 7 + 2) * 0.95 + 0.04), r = 1300; p[k * 3] = Math.cos(a) * Math.cos(e) * r; p[k * 3 + 1] = Math.sin(e) * r; p[k * 3 + 2] = Math.sin(a) * Math.cos(e) * r; }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
      stars = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, fog: false, transparent: true, opacity: 0, depthWrite: false })); stars.frustumCulled = false; scene.add(stars); }
    // materials (shared by every chunk)
    MAT.land = new THREE.MeshLambertMaterial({ vertexColors: true });
    MAT.solid = new THREE.MeshLambertMaterial({ vertexColors: true });
    MAT.flora = new THREE.MeshLambertMaterial({ vertexColors: true });
    MAT.water = new THREE.MeshPhongMaterial({ vertexColors: true, transparent: true, opacity: 0.8, shininess: 90, specular: 0x9ab8d0, depthWrite: false });
    MAT.water.onBeforeCompile = sh => {
      sh.uniforms.uTime = U.time;
      sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vec4 wp = modelMatrix * vec4(position, 1.0); transformed.y += sin(wp.x * 0.33 + uTime * 1.3) * 0.07 + cos(wp.z * 0.29 + uTime * 1.05) * 0.06;');
    };
    MAT.ice = new THREE.MeshPhongMaterial({ color: 0xdcecf6, shininess: 60, transparent: true, opacity: 0.92 });
    MAT.wallWater = new THREE.MeshPhongMaterial({ color: 0x3f9cbc, transparent: true, opacity: 0.6, shininess: 100, side: THREE.DoubleSide, depthWrite: false });
    // the shapes
    SH.box = new THREE.BoxGeometry(1, 1, 1); SH.box.translate(0, 0.5, 0); // (standing on its base)
    SH.cyl = new THREE.CylinderGeometry(0.5, 0.5, 1, 7); SH.cyl.translate(0, 0.5, 0);
    SH.cone = new THREE.ConeGeometry(0.5, 1, 8); SH.cone.translate(0, 0.5, 0);
    SH.ico = new THREE.IcosahedronGeometry(0.5, 1);
    SH.ico0 = new THREE.IcosahedronGeometry(0.5, 0);
    SH.dode = new THREE.DodecahedronGeometry(0.5, 0);
    SH.sph = new THREE.SphereGeometry(0.5, 8, 6);
    // a gable: a triangular prism, ridge along X, base 1×1 at y = 0, peak at y = 1
    { const g = new THREE.BufferGeometry(); const v = [
      -0.5, 0, -0.5, 0.5, 0, -0.5, 0.5, 1, 0, -0.5, 0, -0.5, 0.5, 1, 0, -0.5, 1, 0, // north slope
      -0.5, 0, 0.5, -0.5, 1, 0, 0.5, 1, 0, -0.5, 0, 0.5, 0.5, 1, 0, 0.5, 0, 0.5, // south slope
      -0.5, 0, -0.5, -0.5, 1, 0, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0, 0.5, 0.5, 1, 0, // the two gable ends
    ]; g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.computeVertexNormals(); SH.gable = g; }
    // a hip roof: a pyramid of four slopes on a 1×1 base
    { const g = new THREE.ConeGeometry(0.7071, 1, 4, 1); g.rotateY(Math.PI / 4); g.translate(0, 0.5, 0); SH.hip = g; }
    R3.SH = SH;
    applyQuality();
    window.addEventListener('resize', resize);
    resize();
    G.Build3D && G.Build3D.init && G.Build3D.init(THREE, R3);
    G.People3D && G.People3D.init && G.People3D.init(THREE, R3);
    G.FX3D && G.FX3D.init && G.FX3D.init(THREE, R3);
  }
  function applyQuality() {
    const q = R3.Q();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2) * q.scale);
    renderer.shadowMap.enabled = !!q.shadows; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    sun.castShadow = !!q.shadows;
    if (q.shadows) { sun.shadow.mapSize.set(q.shadows, q.shadows); const c = sun.shadow.camera; c.left = -45; c.right = 45; c.top = 45; c.bottom = -45; c.near = 1; c.far = 260; c.updateProjectionMatrix(); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.04; if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
    for (const m of [MAT.land, MAT.solid, MAT.flora]) if (m) m.needsUpdate = true;
    resize();
  }
  function resize() { if (!renderer) return; const w = window.innerWidth, h = window.innerHeight; renderer.setSize(w, h, false); camera.aspect = w / Math.max(1, h); camera.updateProjectionMatrix(); }

  // ------------------------------ the ground of a chunk ------------------------------
  const tileCol = (i, x, y) => {
    const S = G.S; const t = S.type[i];
    if (t <= T.SEA) { const d = G.clamp((G.SEA - W.tileH(i)) / 2.2, 0, 1); return G.lerpColor([214, 196, 150], [70, 96, 108], d); }
    if (t === T.RIVER) return G.lerpColor([150, 132, 98], [96, 104, 92], S.deep[i] ? 0.7 : 0.25);
    let c = G.Render.tileColor ? G.Render.tileColor(i, x, y) : [118, 172, 78];
    if (S.cliff[i] || S.slope[i] > 2.6) c = G.lerpColor(c, G.Render.rockColor ? G.Render.rockColor(i, S.slope[i]) : [140, 134, 124], S.cliff[i] ? 0.9 : 0.5);
    // (a farm's field is turned earth)
    const b = S.occ[i] && S.buildings.get(S.occ[i]); if (b && (b.type === 'farm' || b.type === 'horta' || b.type === 'plantacao' || b.type === 'vinhedo')) c = G.lerpColor(c, [122, 92, 62], 0.75);
    return c;
  };
  // a point of the ground: the colour of the tiles around it, mixed
  function groundAt(x, y) {
    const xi = Math.floor(x - 0.001), yi = Math.floor(y - 0.001); let r = 0, g = 0, b = 0, n = 0;
    const fx = x - Math.floor(x), fy = y - Math.floor(y);
    const xs = fx < 0.01 || fx > 0.99 ? [Math.round(x) - 1, Math.round(x)] : [Math.floor(x)], ys = fy < 0.01 || fy > 0.99 ? [Math.round(y) - 1, Math.round(y)] : [Math.floor(y)];
    void xi; void yi;
    for (const ty of ys) for (const tx of xs) { if (!W.inb(tx, ty)) continue; const c = tileCol(ty * N + tx, tx, ty); r += c[0]; g += c[1]; b += c[2]; n++; }
    return n ? [r / n, g / n, b / n] : [90, 120, 80];
  }
  // the slope of the ground from its heights (continuous across chunks: no seams of light between them)
  function normalAt(x, y, out) { const e = 0.25; const hx = (W.hAt(x + e, y) - W.hAt(x - e, y)) * G.Space.HM / (2 * e * G.Space.TILE), hz = (W.hAt(x, y + e) - W.hAt(x, y - e)) * G.Space.HM / (2 * e * G.Space.TILE); const l = Math.hypot(hx, 1, hz); out[0] = -hx / l; out[1] = 1 / l; out[2] = -hz / l; return out; }
  function terrainGeo(x0, y0, w, h, step) {
    const TL = G.Space.TILE, HM = G.Space.HM; const gw = Math.round(w / step) + 1, gh = Math.round(h / step) + 1;
    const pos = new Float32Array(gw * gh * 3), nor = new Float32Array(gw * gh * 3), colr = new Float32Array(gw * gh * 3); const nn = [0, 0, 0];
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
      const x = Math.min(N, x0 + i * step), y = Math.min(N, y0 + j * step); const k = (j * gw + i) * 3;
      pos[k] = x * TL; pos[k + 1] = W.hAt(x, y) * HM - (step > 1 ? 0.3 : 0); pos[k + 2] = y * TL; // (the far picture a little low: a crack at its edge shows ground, not sky)
      normalAt(x, y, nn); nor[k] = nn[0]; nor[k + 1] = nn[1]; nor[k + 2] = nn[2];
      const gc = groundAt(x, y); const jit = step < 1 ? 0.94 + G.hash(Math.round(x * 2) * 7919 + Math.round(y * 2) * 104729) * 0.12 : 1; const c = lin([gc[0] * jit, gc[1] * jit, gc[2] * jit]); colr[k] = c[0]; colr[k + 1] = c[1]; colr[k + 2] = c[2];
    }
    const idx = []; for (let j = 0; j < gh - 1; j++) for (let i = 0; i < gw - 1; i++) { const a = j * gw + i, b = a + 1, c = a + gw, d = c + 1; idx.push(a, c, b, b, c, d); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.BufferAttribute(colr, 3)); g.setIndex(idx); g.computeBoundingSphere();
    return g;
  }
  // water: the sea at its level, every river and lake at its own; the ice of a sudden winter; the walls of a parted sea
  const WATER = [[108, 205, 210], [80, 176, 200], [58, 146, 186], [44, 118, 166], [38, 104, 152]];
  const waterCol = d => { const k = G.clamp(d / 1.6, 0, 3.999); const a = WATER[Math.floor(k)], b = WATER[Math.min(4, Math.floor(k) + 1)]; return G.lerpColor(a, b, k - Math.floor(k)); };
  function waterGeo(x0, y0, w, h, far) {
    const S = G.S; const TL = G.Space.TILE, HM = G.Space.HM; const g = new Geo(), ice = new Geo(), walls = new Geo();
    const sea = G.SEA * HM;
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
      if (!W.inb(x, y)) continue; const i = y * N + x; const t = S.type[i];
      if (t <= T.SEA) {
        if (S.dry && S.dry[i]) {
          // (the bed of the parted sea: around it the water stands up in walls)
          if (far) continue;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny)) continue; const j = ny * N + nx; if (S.type[j] > T.SEA || (S.dry && S.dry[j])) continue;
            // (the side the two tiles share: along Z for a neighbour east or west, along X for one north or south)
            const ex = dx > 0 ? x + 1 : x, ez = dy > 0 ? y + 1 : y;
            const ax = dx !== 0 ? ex : x, az = dx !== 0 ? y : ez, bx = dx !== 0 ? ex : x + 1, bz = dx !== 0 ? y + 1 : ez;
            const fa = W.hAt(ax, az) * HM, fb = W.hAt(bx, bz) * HM, top = sea + 6.6;
            walls.quad([ax * TL, fa, az * TL], [bx * TL, fb, bz * TL], [bx * TL, top, bz * TL], [ax * TL, top, az * TL], '#2f7fa0', '#2f7fa0', '#8fd4e6', '#8fd4e6');
          }
          continue;
        }
        const c = waterCol(G.SEA - W.tileH(i));
        g.quad([x * TL, sea, y * TL], [x * TL, sea, (y + 1) * TL], [(x + 1) * TL, sea, (y + 1) * TL], [(x + 1) * TL, sea, y * TL], c);
      } else if (t === T.RIVER) {
        const wl = S.wl[i] * HM + 0.05;
        if (S.ice && S.ice[i]) { ice.quad([x * TL, wl + 0.05, y * TL], [x * TL, wl + 0.05, (y + 1) * TL], [(x + 1) * TL, wl + 0.05, (y + 1) * TL], [(x + 1) * TL, wl + 0.05, y * TL], '#dcecf6'); continue; }
        const c = waterCol((S.wl[i] - W.tileH(i)) * 1.4 + (S.deep[i] ? 1.2 : 0));
        g.quad([x * TL, wl, y * TL], [x * TL, wl, (y + 1) * TL], [(x + 1) * TL, wl, (y + 1) * TL], [(x + 1) * TL, wl, y * TL], c);
      }
    }
    return { water: g.empty ? null : g.build(), ice: ice.empty ? null : ice.build(), walls: walls.empty ? null : walls.build() };
  }
  // the roads: a strip of beaten earth or paving laid on the ground, following it
  const ROADC = [null, [168, 140, 98], [150, 142, 128], [132, 126, 116]];
  function roadGeo(x0, y0, w, h) {
    const S = G.S; const TL = G.Space.TILE, HM = G.Space.HM; const g = new Geo();
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
      if (!W.inb(x, y)) continue; const i = y * N + x; const r = S.road[i]; if (!r || S.type[i] <= T.SEA) continue;
      const lift = S.type[i] === T.RIVER ? Math.max(0, S.wl[i] - W.tileH(i)) * HM + 0.12 : 0.05; // (a bridge stands over the water)
      const P = (a, b) => [a * TL, W.hAt(a, b) * HM + lift, b * TL];
      const c = ROADC[Math.min(3, r)]; const v = G.hash(i * 5) * 10 - 5; const cc = [c[0] + v, c[1] + v, c[2] + v];
      g.quad(P(x, y), P(x, y + 1), P(x + 1, y + 1), P(x + 1, y), cc);
      // (paved: the joints of the stones)
      if (r >= 2) { const d = [cc[0] * 0.8, cc[1] * 0.8, cc[2] * 0.8]; g.quad(P(x + 0.48, y), P(x + 0.48, y + 1), P(x + 0.52, y + 1), P(x + 0.52, y), d); }
    }
    return g.empty ? null : g.build();
  }
  // ------------------------------ trees, rocks, bushes ------------------------------
  const KIND = {
    oak: ['round', '#4f8f36', '#6b4a2e'], apple: ['round', '#5a9a3a', '#6b4a2e', '#d23a2a'], mulberry: ['round', '#4a7f32', '#5a3e28', '#4a1a3a'], olive: ['round', '#8a9a6a', '#7a6a5a'],
    cacao: ['round', '#3f7a2c', '#5a3e28', '#c87a2a'], coffee: ['bush', '#356a2a', '#5a3e28', '#b82a2a'], pepper: ['bush', '#3f7a2c', '#5a3e28', '#c82a1a'],
    birch: ['round', '#8ab84a', '#e8e4d8'], willow: ['willow', '#7aa84a', '#6b5a3e'], pine: ['cone', '#2f6a3a', '#5a3e28'], snowpine: ['cone', '#2a5a3e', '#5a3e28', '#f4f8fc'],
    jungle: ['tall', '#2f7a2a', '#6b5038'], acacia: ['flat', '#7a9a3a', '#6b5038'], baobab: ['baobab', '#6a8a3a', '#9a8068'], cactus: ['cactus', '#5a8a3a'], incense: ['bush', '#8a9a5a', '#7a6a5a'],
    palm: ['palm', '#4a8a2a', '#8a6a44'], date: ['palm', '#5a8a3a', '#8a6a44', '#a8642a'], acai: ['palm', '#3f7a2a', '#6a5038', '#4a2a5a'], banana: ['banana', '#6aa83a', '#7a6a44', '#e8d04a'],
  };
  function treeInto(g, t) {
    const TL = G.Space.TILE, HM = G.Space.HM;
    const X = t.x * TL, Z = t.y * TL, Y = W.groundH(t.x, t.y) * HM; const sz = G.clamp(t.size, 0.15, 1.4); const k = KIND[t.kind] || KIND.oak;
    const h = G.hash(t.id * 7) ; const rot = h * TAU; const s = 0.85 + h * 0.3;
    if (t.stage === 'stump') { g.put(SH.cyl, R3.mat(X, Y, Z, rot, 0.6, 0.45, 0.6), k[2] || '#6b4a2e'); return; }
    if (t.stage === 'log' || t.stage === 'fall') { g.put(SH.cyl, R3.mat(X, Y + 0.3, Z, rot, 0.5, 4.5 * sz, 0.5, 0, Math.PI / 2), k[2] || '#6b4a2e'); return; }
    const burnt = t.stage === 'burnt';
    const leaf = burnt ? '#2a2420' : k[1], bark = burnt ? '#1e1a18' : (k[2] || '#6b4a2e');
    const H = (5 + 7 * sz) * s; // (a grown oak, 11 m; a sapling, a little more than a person)
    switch (k[0]) {
      case 'cone': {
        g.put(SH.cyl, R3.mat(X, Y, Z, rot, 0.45 * sz + 0.15, H * 0.3, 0.45 * sz + 0.15), bark);
        if (!burnt) for (let q = 0; q < 3; q++) g.put(SH.cone, R3.mat(X, Y + H * (0.22 + q * 0.22), Z, rot + q, (3.4 - q * 0.9) * sz + 0.6, H * 0.42, (3.4 - q * 0.9) * sz + 0.6), q === 2 && k[3] ? k[3] : leaf);
        break;
      }
      case 'palm': case 'banana': {
        const lean = (h - 0.5) * 0.35;
        g.put(SH.cyl, R3.mat(X, Y, Z, rot, 0.32, H * 0.85, 0.32, lean, 0), bark);
        const tx = X + Math.sin(rot) * Math.sin(lean) * H * 0.85, tz = Z + Math.cos(rot) * Math.sin(lean) * H * 0.85, ty = Y + H * 0.82;
        if (!burnt) for (let q = 0; q < 7; q++) g.put(SH.box, R3.mat(tx, ty, tz, q / 7 * TAU, 0.9, 0.12, 3.6 * sz + 1, 0.55, 0), leaf);
        if (k[3] && !burnt) g.put(SH.sph, R3.mat(tx, ty - 0.6, tz, 0, 0.9), k[3]);
        break;
      }
      case 'cactus': {
        g.put(SH.cyl, R3.mat(X, Y, Z, rot, 0.7, 2.5 * sz + 0.8, 0.7), k[1]);
        g.put(SH.cyl, R3.mat(X + 0.5, Y + 1.1, Z, rot, 0.4, 1.2 * sz + 0.3, 0.4), k[1]);
        break;
      }
      case 'bush': {
        g.put(SH.ico, R3.mat(X, Y + 0.9, Z, rot, 2.2 * sz + 0.6, 1.8 * sz + 0.5, 2.2 * sz + 0.6), leaf);
        if (k[3] && !burnt) for (let q = 0; q < 4; q++) g.put(SH.sph, R3.mat(X + Math.cos(q * 1.7) * 0.8, Y + 1.2 + (q % 2) * 0.4, Z + Math.sin(q * 1.7) * 0.8, 0, 0.22), k[3]);
        break;
      }
      case 'flat': {
        g.put(SH.cyl, R3.mat(X, Y, Z, rot, 0.35, H * 0.75, 0.35), bark);
        if (!burnt) g.put(SH.ico, R3.mat(X, Y + H * 0.78, Z, rot, 7 * sz + 1, 1.4, 7 * sz + 1), leaf);
        break;
      }
      case 'baobab': {
        g.put(SH.cyl, R3.mat(X, Y, Z, rot, 2.2 * sz + 0.4, H * 0.7, 2.2 * sz + 0.4), bark);
        if (!burnt) g.put(SH.ico, R3.mat(X, Y + H * 0.72, Z, rot, 5 * sz + 1, 1.8, 5 * sz + 1), leaf);
        break;
      }
      case 'willow': {
        g.put(SH.cyl, R3.mat(X, Y, Z, rot, 0.5, H * 0.5, 0.5), bark);
        if (!burnt) { g.put(SH.ico, R3.mat(X, Y + H * 0.6, Z, rot, 6 * sz + 1.2, 4 * sz + 1.4, 6 * sz + 1.2), leaf); g.put(SH.cyl, R3.mat(X, Y + H * 0.15, Z, rot, 5.5 * sz + 1, H * 0.42, 5.5 * sz + 1), leaf); }
        break;
      }
      default: { // round crowns: oak, birch, the fruit trees, the tall trees of the forests of the south
        const tall = k[0] === 'tall' ? 1.35 : 1;
        g.put(SH.cyl, R3.mat(X, Y, Z, rot, 0.45 * sz + 0.15, H * 0.5 * tall, 0.45 * sz + 0.15), bark);
        if (!burnt) {
          const r = (2.6 * sz + 0.8) * tall;
          for (let q = 0; q < 3; q++) { const a = rot + q * 2.1, d = r * 0.35; g.put(SH.ico, R3.mat(X + Math.cos(a) * d, Y + H * 0.62 * tall + (q === 0 ? r * 0.35 : 0), Z + Math.sin(a) * d, a, r * 1.25, r * 1.05, r * 1.25), q === 0 ? leaf : G.lerpColor(G.hex2rgb(leaf), [20, 40, 20], 0.14)); }
          if (k[3] && t.fruit !== 0) for (let q = 0; q < 5; q++) { const a = rot + q * 1.3; g.put(SH.sph, R3.mat(X + Math.cos(a) * r * 0.8, Y + H * 0.55 * tall, Z + Math.sin(a) * r * 0.8, 0, 0.32), k[3]); }
        }
      }
    }
  }
  function floraGeo(x0, y0, w, h, far) {
    const S = G.S; const g = new Geo(); const TL = G.Space.TILE, HM = G.Space.HM;
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
      if (!W.inb(x, y)) continue; const i = y * N + x;
      const tid = S.treeAt[i]; const t = tid && S.trees.get(tid);
      if (t) {
        if (far) { if (t.stage !== 'grow' || t.size < 0.3) continue; const k = KIND[t.kind] || KIND.oak; const H = 5 + 7 * t.size; g.put(k[0] === 'cone' ? SH.cone : SH.ico0, R3.mat(t.x * TL, W.groundH(t.x, t.y) * HM + (k[0] === 'cone' ? 0 : H * 0.6), t.y * TL, 0, k[0] === 'cone' ? 4 : 5.5 * t.size + 1.5, k[0] === 'cone' ? H : 4.5, k[0] === 'cone' ? 4 : 5.5 * t.size + 1.5), k[1]); }
        else treeInto(g, t);
      }
      if (far) continue;
      const oid = S.objAt[i]; if (!oid) continue;
      const r = S.rocks.get(oid);
      if (r) { const sc = 0.8 + 1.6 * G.clamp(r.stone / Math.max(1, r.max || r.stone), 0.2, 1); g.put(SH.dode, R3.mat(r.x * TL, W.groundH(r.x, r.y) * HM + sc * 0.25, r.y * TL, G.hash(r.id) * TAU, sc * 1.4, sc, sc * 1.2), r.meteor ? '#4a3a34' : '#8c867a'); continue; }
      const b = S.bushes.get(oid);
      if (b) {
        const X = b.x * TL, Z = b.y * TL, Y = W.groundH(b.x, b.y) * HM;
        g.put(SH.ico, R3.mat(X, Y + 0.45, Z, G.hash(b.id) * TAU, 1.5, 1.0, 1.5), b.burnt > 0 ? '#3a3028' : '#3f7a34');
        if (b.berries > 0 && !(b.burnt > 0)) for (let q = 0; q < Math.min(6, b.berries); q++) g.put(SH.sph, R3.mat(X + Math.cos(q * 1.9) * 0.55, Y + 0.6 + (q % 2) * 0.25, Z + Math.sin(q * 1.9) * 0.55, 0, 0.16), '#c8283a');
      }
    }
    return g.empty ? null : g.build();
  }
  // a little grass and flowers on the open land near the body: only seen, the same tufts every time (the world's seed),
  // and of the land's own kind — short and green in the meadows, tall and golden in the savanna, reeds in the swamp,
  // sparse in the taiga, none on snow or dune
  const GRASS = { grass: [3, 0.45, 1, 0], savanna: [4, 0.95, 0.75, 1], swamp: [3, 1.2, 0.9, 2], jungle: [4, 0.8, 1.1, 0], taiga: [1, 0.4, 0.9, 0], snow: null, dune: null };
  function grassGeo(x0, y0, w, h) {
    const S = G.S; const g = new Geo(); const TL = G.Space.TILE, HM = G.Space.HM;
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
      if (!W.inb(x, y)) continue; const i = y * N + x; const t = S.type[i];
      if ((t !== T.GRASS && t !== T.MEADOW) || S.road[i] || S.occ[i] || S.cliff[i] || S.burnt[i] > 0 || (S.wear[i] || 0) > 20) continue;
      const K = GRASS[G.Biomes && G.Biomes.style ? G.Biomes.style(i) : 'grass']; if (!K) continue;
      const n = K[0] + (t === T.MEADOW ? 2 : 0);
      const c = tileCol(i, x, y);
      for (let q = 0; q < n; q++) {
        const hx = G.hash(i * 13 + q * 7 + (S.seed | 0)), hz = G.hash(i * 17 + q * 11 + 3);
        const px = x + hx, pz = y + hz; const Y = W.hAt(px, pz) * HM;
        const tip = K[3] === 1 ? [205, 178, 96] : K[3] === 2 ? [96, 120, 64] : [c[0] * 0.8 + 18, c[1] * 1.08 + 10, c[2] * 0.7];
        // (a tuft: three thin blades leaning out from one root)
        for (let k = 0; k < 3; k++) {
          const a = hx * TAU + k * 2.1, ht = K[1] * (0.6 + G.hash(i * 5 + q * 3 + k) * 0.6);
          g.put(SH.cone, R3.mat(px * TL + Math.cos(a) * 0.06, Y, pz * TL + Math.sin(a) * 0.06, a, 0.07 * K[2] + 0.02, ht, 0.05 * K[2] + 0.02, 0.32, 0), G.lerpColor([c[0] * 0.7, c[1] * 0.8, c[2] * 0.6], tip, 0.4 + k * 0.2));
        }
        if (t === T.MEADOW && q === 0 && hz > 0.45 && K[3] === 0) g.put(SH.sph, R3.mat(px * TL + 0.2, Y + 0.42, pz * TL, 0, 0.13), ['#f2e46a', '#e86a8a', '#f4f4f0', '#9a7ae8'][Math.floor(hx * 4)]);
      }
    }
    return g.empty ? null : g.build();
  }

  // ------------------------------ chunks ------------------------------
  const chunks = new Map(); let NC = 0;
  const ckey = (cx, cy) => cy * 4096 + cx;
  function disposeGroup(grp) { if (!grp) return; grp.traverse(o => { if (o.geometry) o.geometry.dispose(); }); if (grp.parent) grp.parent.remove(grp); }
  function addMesh(grp, geo, mat, o) { if (!geo) return null; const m = new THREE.Mesh(geo, mat); if (o && o.cast) m.castShadow = true; if (o && o.recv) m.receiveShadow = true; if (o && o.order !== undefined) m.renderOrder = o.order; m.matrixAutoUpdate = false; grp.add(m); return m; }
  // (what makes a chunk need building again: the shape of its ground, its trees, its houses, its roads, its water — all of
  // it read inside the chunk: a house built across the map does not make this one be built again)
  function sigOf(cx, cy) {
    const S = G.S; let a = 0, b = 0, c = 0;
    const x0 = cx * C, y0 = cy * C; const V = N + 1;
    for (let y = y0; y <= y0 + C && y <= N; y++) for (let x = x0; x <= x0 + C && x <= N; x++) a = (a * 31 + Math.round(S.H[y * V + x] * 8)) | 0;
    for (let y = y0; y < y0 + C && y < N; y++) for (let x = x0; x < x0 + C && x < N; x++) {
      const i = y * N + x;
      const tid = S.treeAt[i]; if (tid) { const t = S.trees.get(tid); if (t) b = (b * 31 + tid * 3 + (t.stage.charCodeAt(0)) + Math.floor(t.size * 4)) | 0; }
      const oid = S.objAt[i]; if (oid) { const bu = S.bushes.get(oid); b = (b * 17 + oid + (bu ? (bu.berries > 0 ? 1 : 0) + (bu.burnt > 0 ? 2 : 0) : 0)) | 0; }
      c = (c * 7 + S.road[i] + (S.burnt[i] > 0 ? 3 : 0) + (S.ice && S.ice[i] ? 5 : 0) + (S.dry && S.dry[i] ? 11 : 0) + S.wall[i] * 13 + S.occ[i] * 19 + S.type[i] * 23 + (S.cliff[i] ? 29 : 0)) | 0;
      if (S.type[i] === T.RIVER) a = (a * 7 + Math.round(S.wl[i] * 8)) | 0;
    }
    const bs = G.Build3D ? G.Build3D.sig(x0, y0, C) : 0;
    return { a, b, c, d: bs };
  }
  const sameSig = (p, q) => p && q && p.a === q.a && p.b === q.b && p.c === q.c && p.d === q.d;
  function buildFar(ch) {
    disposeGroup(ch.far); const grp = new THREE.Group(); ch.far = grp; grp.matrixAutoUpdate = false;
    const x0 = ch.cx * C, y0 = ch.cy * C;
    addMesh(grp, terrainGeo(x0, y0, C, C, 2), MAT.land, { recv: false });
    const wg = waterGeo(x0, y0, C, C, true); addMesh(grp, wg.water, MAT.water, { order: 2 }); addMesh(grp, wg.ice, MAT.ice);
    addMesh(grp, floraGeo(x0, y0, C, C, true), MAT.flora);
    if (G.Build3D) addMesh(grp, G.Build3D.farGeo(x0, y0, C), MAT.solid);
    scene.add(grp); grp.visible = !ch.near;
  }
  // a near picture is three parts, each made again only when what it shows has changed: the ground (terrain, water,
  // roads), the plants (trees, bushes, rocks, grass) and the buildings — a field ripening does not remake the hillside
  const PARTS = { ground: s => s.a + ':' + s.c, flora: s => s.a + ':' + s.b + ':' + s.c, build: s => s.c + ':' + s.d };
  function makePart(ch, part) {
    const x0 = ch.cx * C, y0 = ch.cy * C; const q = R3.Q(); const grp = new THREE.Group(); grp.matrixAutoUpdate = false;
    if (part === 'ground') {
      addMesh(grp, terrainGeo(x0, y0, C, C, 0.5), MAT.land, { recv: true });
      const wg = waterGeo(x0, y0, C, C, false); addMesh(grp, wg.water, MAT.water, { order: 2 }); addMesh(grp, wg.ice, MAT.ice, { recv: true }); addMesh(grp, wg.walls, MAT.wallWater, { order: 3 });
      addMesh(grp, roadGeo(x0, y0, C, C), MAT.land, { recv: true });
    } else if (part === 'flora') {
      addMesh(grp, floraGeo(x0, y0, C, C, false), MAT.flora, { cast: true, recv: true });
      if (q.grass) addMesh(grp, grassGeo(x0, y0, C, C), MAT.flora);
    } else if (G.Build3D) { const bg = G.Build3D.nearGeo(x0, y0, C); addMesh(grp, bg.solid, MAT.solid, { cast: true, recv: true }); if (bg.glass) addMesh(grp, bg.glass, G.Build3D.glassMat()); }
    disposeGroup(ch.parts[part]); ch.parts[part] = grp; ch.near.add(grp);
  }
  function buildNear(ch, s) {
    const t0 = performance.now(); s = s || sigOf(ch.cx, ch.cy);
    if (!ch.near) { const grp = new THREE.Group(); grp.matrixAutoUpdate = false; ch.near = grp; ch.parts = {}; scene.add(grp); for (const p in PARTS) makePart(ch, p); R3.stats.builds++; }
    else { let n = 0; for (const p in PARTS) if (PARTS[p](s) !== PARTS[p](ch.sig)) { makePart(ch, p); n++; } R3.stats.rebuilds++; R3.stats.parts += n; }
    if (ch.far) ch.far.visible = false;
    ch.sig = s; ch.sigT = G.S.clock;
    R3.stats.ms += performance.now() - t0;
  }
  function dropNear(ch) { if (!ch.near) return; disposeGroup(ch.near); ch.near = null; ch.parts = null; if (ch.far) ch.far.visible = true; }
  R3.rebuildAll = function () { for (const ch of chunks.values()) { if (ch.near) { dropNear(ch); buildNear(ch); } buildFar(ch); } };
  function makeAll() {
    for (const ch of chunks.values()) { disposeGroup(ch.far); disposeGroup(ch.near); }
    chunks.clear(); clist = []; NC = Math.ceil(N / C);
    for (let cy = 0; cy < NC; cy++) for (let cx = 0; cx < NC; cx++) { const ch = { cx, cy, far: null, near: null, sig: null, sigT: -1e9, farSig: null }; chunks.set(ckey(cx, cy), ch); clist.push(ch); buildFar(ch); ch.farSig = sigOf(cx, cy); }
    R3.built = G.S;
  }
  // the beyond: the sea to the horizon, past the edge of the map
  let ocean = null;
  function makeOcean() {
    if (ocean) { ocean.geometry.dispose(); scene.remove(ocean); }
    const L = G.Space.size(), E = 1400;
    const g = new THREE.PlaneGeometry(L + E * 2, L + E * 2, 1, 1); g.rotateX(-Math.PI / 2);
    const c = lin(WATER[4]); const cl = new Float32Array(g.attributes.position.count * 3); for (let k = 0; k < cl.length; k += 3) { cl[k] = c[0]; cl[k + 1] = c[1]; cl[k + 2] = c[2]; }
    g.setAttribute('color', new THREE.BufferAttribute(cl, 3));
    ocean = new THREE.Mesh(g, MAT.water); ocean.position.set(L / 2, G.SEA * G.Space.HM - 0.25, L / 2); ocean.renderOrder = 1; scene.add(ocean);
  }
  // streaming: the near pictures within reach of the focus, nearest first, a few milliseconds a frame
  function stream(fx, fz, budget) {
    const q = R3.Q(); const TL = G.Space.TILE; const R = q.near;
    const ccx = Math.floor(fx / TL / C), ccy = Math.floor(fz / TL / C);
    const want = [];
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      const cx = ccx + dx, cy = ccy + dy; if (cx < 0 || cy < 0 || cx >= NC || cy >= NC) continue;
      if (dx * dx + dy * dy > (R + 0.5) * (R + 0.5)) continue;
      want.push([dx * dx + dy * dy, cx, cy]);
    }
    want.sort((a, b) => a[0] - b[0]);
    // (kept a little further than they are made: a body walking back and forth on a chunk's edge does not make and throw
    // away the same picture again and again)
    const keep = new Set(); const RK = (R + 1.5) * (R + 1.5);
    for (let dy = -R - 2; dy <= R + 2; dy++) for (let dx = -R - 2; dx <= R + 2; dx++) if (dx * dx + dy * dy <= RK) keep.add(ckey(ccx + dx, ccy + dy));
    const t0 = performance.now(); let n = 0;
    for (const [, cx, cy] of want) {
      const ch = chunks.get(ckey(cx, cy)); if (!ch) continue;
      if (!ch.near) { buildNear(ch); n++; }
      else if (G.S.clock - ch.sigT > 1.5) { ch.sigT = G.S.clock; const s = sigOf(cx, cy); if (!sameSig(s, ch.sig)) { buildNear(ch, s); n++; } }
      if (performance.now() - t0 > budget && n) break;
    }
    // (behind the body, beyond reach: thrown away, its geometry given back)
    for (const ch of chunks.values()) if (ch.near && !keep.has(ckey(ch.cx, ch.cy))) dropNear(ch);
    // (the far pictures follow the world too, slowly: one checked each frame)
    farTick = (farTick + 1) % Math.max(1, clist.length);
    const fc = clist[farTick]; if (fc) { const s = sigOf(fc.cx, fc.cy); if (!sameSig(s, fc.farSig)) { buildFar(fc); fc.farSig = s; if (fc.near) fc.far.visible = false; R3.stats.farBuilds++; } }
    let near = 0; for (const ch of chunks.values()) if (ch.near) near++;
    R3.stats.chunks = chunks.size; R3.stats.near = near;
  }
  let farTick = 0, clist = [];

  // ------------------------------ the sky and the light of the hour ------------------------------
  function light() {
    const S = G.S; const a = G.Render.ambient(); const night = G.clamp(G.Render.nightness(), 0, 1);
    const t = S.time; const dayK = G.clamp((t - 0.02) / 0.71, 0, 1); const el = Math.sin(dayK * Math.PI); // 0 at dawn and dusk, 1 at noon
    const az = dayK * Math.PI; // east to west
    const sd = new THREE.Vector3(Math.cos(az) * Math.max(0.15, 1 - el * 0.6), Math.max(0.05, el), 0.35).normalize();
    const am = [a[0] / 255, a[1] / 255, a[2] / 255];
    skyU.sunDir.value.copy(night > 0.6 ? sd.clone().negate() : sd);
    const top = new THREE.Color().setRGB(0.22 + 0.15 * am[0], 0.42 + 0.2 * am[1], 0.8 * am[2] + 0.1, THREE.SRGBColorSpace).multiplyScalar(1 - night * 0.82);
    const horC = new THREE.Color().setRGB(Math.min(1, am[0] * 0.95 + 0.06), Math.min(1, am[1] * 0.92 + 0.05), Math.min(1, am[2] * 0.95 + 0.04), THREE.SRGBColorSpace).multiplyScalar(1 - night * 0.7);
    // (dawn and dusk: the horizon warms)
    const warm = G.clamp(1 - el * 3, 0, 1) * (1 - night);
    horC.lerp(new THREE.Color(0xf0a070), warm * 0.45);
    skyU.top.value.copy(top); skyU.hor.value.copy(horC); skyU.night.value = night;
    skyU.sunCol.value.setRGB(1, 0.85 + el * 0.15, 0.6 + el * 0.4);
    scene.fog.color.copy(horC);
    renderer.setClearColor(horC);
    sun.intensity = (0.4 + 2.4 * el) * (1 - night) * (S.weather.rain > 0.1 ? 0.6 : 1);
    sun.color.setRGB(1, 0.86 + 0.14 * el, 0.7 + 0.3 * el);
    hemi.intensity = 0.55 + 0.75 * (1 - night);
    hemi.color.setRGB(am[0] * 0.8 + 0.2, am[1] * 0.85 + 0.15, am[2] * 0.9 + 0.1);
    moonL.intensity = night * 0.5;
    stars.material.opacity = G.clamp((night - 0.35) * 1.6, 0, 1);
    G.Build3D && G.Build3D.night(G.clamp((night - 0.25) * 1.6, 0, 1)); // (the windows light up as the dark comes)
    return sd;
  }

  // ------------------------------ the frame ------------------------------
  R3.ready = () => !!renderer;
  // the 3D made, the first time it is needed (a browser that cannot make a WebGL context is remembered, and said so)
  R3.ready = function () {
    if (renderer) return true; if (R3.failed) return false;
    try { init(); return true; } catch (e) { R3.failed = String((e && e.message) || e); console.warn('3D indisponível:', R3.failed); if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas); canvas = null; renderer = null; return false; }
  };
  R3.start = function () {
    if (!renderer) init();
    if (R3.built !== G.S || !chunks.size || NC !== Math.ceil(N / C)) { makeAll(); makeOcean(); }
    // (the far pictures kept from the last time: the ones whose part of the world changed meanwhile are made again)
    else for (const ch of chunks.values()) { const s = sigOf(ch.cx, ch.cy); if (!sameSig(s, ch.farSig)) { buildFar(ch); ch.farSig = s; } }
    canvas.style.display = 'block'; R3.on = true; resize();
  };
  R3.stop = function () {
    R3.on = false; if (!canvas) return;
    canvas.style.display = 'none'; canvas.style.opacity = 0;
    // (the near pictures are given back: the god's view does not carry them)
    for (const ch of chunks.values()) dropNear(ch);
    G.People3D && G.People3D.clear && G.People3D.clear();
  };
  // a new world, or a save loaded: every picture of the old one goes
  G.worldHooks.push(() => { if (!renderer) return; for (const ch of chunks.values()) { disposeGroup(ch.far); disposeGroup(ch.near); } chunks.clear(); clist = []; R3.built = null; if (ocean) { ocean.geometry.dispose(); scene.remove(ocean); ocean = null; } G.People3D && G.People3D.clear && G.People3D.clear(); });
  R3.setOpacity = o => { if (canvas) canvas.style.opacity = o; };
  // the depth of the world on the screen: the god's picture flattens heights (4 px a unit against 16 a tile); during
  // the descent the 3D world starts as flat as the god's picture and grows to its true relief (only seen)
  R3.setDepth = k => { if (scene) scene.scale.y = k; };
  R3.frame = function (rdt, focus, budget) {
    if (!R3.on || !renderer) return;
    U.time.value += rdt;
    const sd = light();
    if (focus) {
      stream(focus.X, focus.Z, budget === undefined ? 6 : budget);
      sun.position.set(focus.X + sd.x * 120, focus.Y + sd.y * 120, focus.Z + sd.z * 120); sun.target.position.set(focus.X, focus.Y, focus.Z); sun.target.updateMatrixWorld();
      moonL.position.set(focus.X - sd.x * 100, focus.Y + 80, focus.Z - sd.z * 100);
      skyMesh.position.copy(camera.position); stars.position.copy(camera.position);
      // (the fog starts past what the eye looks at: from far up, during the descent, the town is not lost in it)
      const q = R3.Q(); const cd = Math.hypot(camera.position.x - focus.X, camera.position.y - (focus.Y || 0), camera.position.z - focus.Z);
      scene.fog.near = cd + q.view * 0.25; scene.fog.far = cd + q.view;
    }
    G.People3D && G.People3D.update && G.People3D.update(rdt, focus);
    G.FX3D && G.FX3D.update && G.FX3D.update(rdt, focus);
    renderer.render(scene, camera);
    R3.info = renderer.info;
    if (rdt > 0) R3.fps = R3.fps ? R3.fps * 0.95 + (1 / rdt) * 0.05 : 1 / rdt;
  };
  // (what the GPU holds — counted by three.js when a geometry is first drawn — and what the scene holds right now, drawn or not)
  R3.memory = () => { if (!renderer) return null; const seen = new Set(); scene.traverse(o => { if (o.geometry) seen.add(o.geometry); }); return { geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures, calls: renderer.info.render.calls, tris: renderer.info.render.triangles, live: seen.size }; };
  // (for the tests: a chunk's signature, read only)
  R3.sigOf = (cx, cy) => sigOf(cx, cy);
  R3.chunkCount = () => ({ all: chunks.size, near: [...chunks.values()].filter(c => c.near).length });
  // (for the tests: the near picture of the chunk at a point — its terrain is the first mesh)
  R3.nearOf = (X, Z) => { const ch = chunks.get(ckey(Math.floor(X / G.Space.TILE / C), Math.floor(Z / G.Space.TILE / C))); if (!ch || !ch.near) return null; const out = []; ch.near.traverse(o => { if (o.isMesh) out.push(o); }); return out; };
})(window.G);
