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
  // quality: what the machine can carry (the player's choice, kept in this browser only) — the same world and the same light
  // in every one; the higher ones only draw more of it, farther and finer. shadows: the side of the sun's picture in texels
  // (0: none); sbox: half the side of the ground it covers (m); ao: the shade in the corners and where things touch (0 off,
  // 1 at half the resolution, 2 finer); bloom: the glow of what is brighter than white (lamps at night, the sun on the water);
  // lights: how many of the nearest flames get a real light of their own (every flame and lit door near the body lights its
  // surroundings anyway, painted: FX3D); soft: the shadows sharp at the foot of what casts them and soft farther off (0: the
  // plain filter); rays: the shafts of a low sun through the gaps, toward the eye (with the post-processing); lod: how far
  // each drawing keeps its finest form before it simplifies — a multiplier of every module's own distances (bodies, trees,
  // houses, things); props: how much of the decoration about the houses and the streets is drawn (0..1); shadowEvery: the
  // sun's picture of the shadows made again every n frames (the picture and its own frame go together: only what moves
  // trails a frame); aniso: how many samples a picture seen at a slant is read with (the stack of materials, the ground's
  // detail, the leaves — a graphics card does it nearly free, a machine drawing by itself pays each one: a fifth of the
  // medium's frame, measured); grassDen: the share of the meadow's tufts drawn (the A3's grass3d: fewer, each the fuller —
  // the A3's numbers, measured on the meadow: 0,5 a third cheaper; the Leve draws no grass). The lightest two must cost no more than the game did before the studio (measured: the
  // shadows are a third of the medium's triangles, the far people and the near ring of chunks the next; in time, the
  // slanted samples and the pixels): every module reads these to scale its own drawing (the medium's 0,75 and its shadow
  // every third frame are the reserve cut of D-032: the medium measured by the mean of its frames came out 10% dearer than
  // the game before the studio; with the cut, 1–2%, the picture hardly softer)
  const QUAL = {
    baixa: { scale: 0.6, near: 1, shadows: 0, npcs: 12, grass: 0, view: 200, detail: 0, field: 0, sbox: 36, ao: 0, bloom: 0, lights: 0, soft: 0, rays: 0, lod: 0.5, props: 0.25, shadowEvery: 1, aniso: 1, grassDen: 0.5 },
    media: { scale: 0.75, near: 2, shadows: 1024, npcs: 30, grass: 1, view: 360, detail: 1, field: 12, sbox: 40, ao: 0, bloom: 0, lights: 2, soft: 0, rays: 0, lod: 0.75, props: 0.6, shadowEvery: 3, aniso: 1, grassDen: 0.5 },
    alta: { scale: 1, near: 4, shadows: 2048, npcs: 60, grass: 1, view: 640, detail: 1, field: 30, sbox: 52, ao: 1, bloom: 1, lights: 3, soft: 1, rays: 1, lod: 1, props: 1, shadowEvery: 1, aniso: 4, grassDen: 0.7 },
    ultra: { scale: 1, near: 5, shadows: 4096, npcs: 90, grass: 1, view: 900, detail: 1, field: 40, sbox: 68, ao: 2, bloom: 1, lights: 4, soft: 1, rays: 1, lod: 1.4, props: 1, shadowEvery: 1, aniso: 8, grassDen: 1 },
  };
  // (the presets in the order the menu shows them, with their names)
  R3.QNAMES = [['baixa', 'Leve'], ['media', 'Média'], ['alta', 'Alta'], ['ultra', 'Ultra']];
  R3.QUAL = QUAL;
  // (a part with presets of its own — the nature's pillars, NATUREZA.md — adds its fields to every preset from its own file, never by
  // editing this table: R3.qualAdd('mata', { baixa: 0, media: 0.5, alta: 0.8, ultra: 1 }); D-466)
  R3.qualAdd = function (k, byQ) { if (!byQ) return; for (const q in QUAL) if (byQ[q] !== undefined) QUAL[q][k] = byQ[q]; qc = null; };
  R3.q = (() => { try { return localStorage.getItem('gotaf-3dq') || 'media'; } catch (e) { return 'media'; } })();
  if (!QUAL[R3.q]) R3.q = 'media';
  // (a preset, and the player's own changes over it: view distance, people drawn, resolution, shadows, grass)
  let over = {}; try { const o = JSON.parse(localStorage.getItem('gotaf-3dover') || 'null'); if (o && typeof o === 'object') for (const k in o) if (k in QUAL.media && Number.isFinite(o[k])) over[k] = o[k]; } catch (e) { }
  let qc = null;
  R3.Q = () => qc || (qc = Object.assign({}, QUAL[R3.q] || QUAL.media, over));
  R3.setQuality = function (k) { if (!QUAL[k]) return; R3.q = k; over = {}; qc = null; try { localStorage.setItem('gotaf-3dq', k); localStorage.removeItem('gotaf-3dover'); } catch (e) { } if (renderer) applyQuality(); };
  R3.setOver = function (k, v) { if (!(k in QUAL.media) || !Number.isFinite(v)) return; over[k] = v; qc = null; try { localStorage.setItem('gotaf-3dover', JSON.stringify(over)); } catch (e) { } if (renderer) applyQuality(); };

  let THREE = null, renderer = null, scene = null, camera = null, canvas = null;
  let skyU = null; // (the sky's uniforms — G.Ceu3D's —: what reflects the sky reads them)
  const MAT = {};
  const U = R3.U = { time: { value: 0 }, wind: { value: null }, body: { value: null }, sky: { value: null } }; // (the clocks and winds of the drawing: only seen)
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
    constructor() { this.p = []; this.n = []; this.c = []; this.k = null; this.ao = null; this.ao3 = null; this.pat = 0; this.q = null; this.sph = null; this.uv = null; }
    // (the sway of each point: 0 is rooted, 1 moves all the wind gives — only the plants' material reads it)
    _k(v, n) { if (!this.k) { if (!v) return; this.k = new Array(this.p.length / 3 - n).fill(0); } for (let q = 0; q < n; q++) this.k.push(typeof v === 'object' ? v[q] : v || 0); }
    // (the pattern of the surface each point is on — stone, planks, tiles, thatch...: this.pat at the time it was put;
    // only the solid material reads it, Build3D.PAT names them)
    _q(n) { if (!this.q) { if (!this.pat) return; this.q = new Array(this.p.length / 3 - n).fill(0); } for (let k = 0; k < n; k++) this.q.push(this.pat); }
    // a shape (BufferGeometry), moved by a matrix, painted one colour (or a function of the vertex); sway: a number, or
    // a function of the point's height in the shape (0 at its foot, 1 at its top)
    put(g, m, color, sway) {
      const P = g.attributes.position.array, Nn = g.attributes.normal.array, I = g.index ? g.index.array : null;
      const e = m.elements; const nm = R3._nm.getNormalMatrix(m).elements;
      const cc = typeof color === 'function' ? null : lin(color);
      const cnt = I ? I.length : P.length / 3;
      for (let k = 0; k < cnt; k++) {
        const j = I ? I[k] : k; const x = P[j * 3], y = P[j * 3 + 1], z = P[j * 3 + 2];
        const X = e[0] * x + e[4] * y + e[8] * z + e[12], Y = e[1] * x + e[5] * y + e[9] * z + e[13], Z = e[2] * x + e[6] * y + e[10] * z + e[14];
        const a = Nn[j * 3], b = Nn[j * 3 + 1], d = Nn[j * 3 + 2];
        let nx = nm[0] * a + nm[3] * b + nm[6] * d, ny = nm[1] * a + nm[4] * b + nm[7] * d, nz = nm[2] * a + nm[5] * b + nm[8] * d; let l = Math.hypot(nx, ny, nz) || 1;
        // (a crown lit as one soft volume: its normals lean out from the crown's heart — no facets in the light, as a painter does a tree)
        if (this.sph) { const S = this.sph; const rx = X - S[0], ry = Y - S[1], rz = Z - S[2]; const rl = Math.hypot(rx, ry, rz) || 1; nx = nx / l * (1 - S[3]) + rx / rl * S[3]; ny = ny / l * (1 - S[3]) + ry / rl * S[3]; nz = nz / l * (1 - S[3]) + rz / rl * S[3]; l = Math.hypot(nx, ny, nz) || 1; }
        this.p.push(X, Y, Z); this.n.push(nx / l, ny / l, nz / l);
        const q = cc || lin(color(X, Y, Z, nx / l, ny / l, nz / l));
        // (the foot of a wall is darker: the sky does not reach it — this.ao gives the ground under a point)
        if (this.ao) { const f = 0.6 + 0.4 * G.clamp((Y - this.ao(X, Z)) / 2.6, 0, 1); this.c.push(q[0] * f, q[1] * f, q[2] * f); }
        // (the shade where things touch inside a building — the foot of a wall, a corner, the floor under and round a piece: ao3 gives
        // it at a point and its normal, Build3D's inside, D-705)
        else if (this.ao3) { const f = this.ao3(X, Y, Z, nx / l, ny / l, nz / l); this.c.push(q[0] * f, q[1] * f, q[2] * f); } else this.c.push(q[0], q[1], q[2]);
        if (sway || this.k) this._k(typeof sway === 'function' ? sway(y) : sway, 1);
        if (this.pat || this.q) this._q(1);
      }
    }
    // a raw triangle (three points, one colour each or one for all), with its own normal
    tri(a, b, c, ca, cb, cc) {
      const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
      const A = lin(ca), B = lin(cb || ca), Cc = lin(cc || ca);
      this.p.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); this.n.push(nx, ny, nz, nx, ny, nz, nx, ny, nz);
      if (this.ao3) { const fa = this.ao3(a[0], a[1], a[2], nx, ny, nz), fb = this.ao3(b[0], b[1], b[2], nx, ny, nz), fc = this.ao3(c[0], c[1], c[2], nx, ny, nz); this.c.push(A[0] * fa, A[1] * fa, A[2] * fa, B[0] * fb, B[1] * fb, B[2] * fb, Cc[0] * fc, Cc[1] * fc, Cc[2] * fc); }
      else this.c.push(A[0], A[1], A[2], B[0], B[1], B[2], Cc[0], Cc[1], Cc[2]);
      if (this.k) this._k(0, 3);
      if (this.pat || this.q) this._q(3);
    }
    // a blade (of grass, of wheat, a leaf): one triangle from a root two points wide to a tip, lit as the ground under it
    // is lit (its normal leans up: both faces read alike), the tip swaying
    blade(x, y, z, w, ax, tx, ty, tz, cb, ct, sw) {
      const dx = Math.cos(ax) * w / 2, dz = Math.sin(ax) * w / 2; const A = lin(cb), Bc = lin(ct);
      this.p.push(x - dx, y, z - dz, x + dx, y, z + dz, tx, ty, tz);
      const lx = tx - x, lz = tz - z, l = Math.hypot(lx * 0.25, 1, lz * 0.25); const nx = lx * 0.25 / l, ny = 1 / l, nz = lz * 0.25 / l;
      this.n.push(nx, ny, nz, nx, ny, nz, nx, ny, nz); this.c.push(A[0], A[1], A[2], A[0], A[1], A[2], Bc[0], Bc[1], Bc[2]);
      this._k([0, 0, sw === undefined ? 1 : sw], 3);
      if (this.q) this._q(3);
    }
    quad(a, b, c, d, ca, cb, cc, cd) { this.tri(a, b, c, ca, cb, cc); this.tri(a, c, d, ca, cc, cd || ca); }
    // a card of leaves (a small picture with gaps: the edge of a crown is leaves, not the smooth side of a lump): a square
    // of side s at (x, y, z) turned a about the vertical and tilted t, lit along n (out from the crown), coloured c, swaying sw
    // (only in a geometry of its own: it carries the picture's coordinates)
    card(x, y, z, s, a, t, n, c, sw) {
      if (!this.uv) this.uv = [];
      const ca = Math.cos(a), sa = Math.sin(a), ct = Math.cos(t), st = Math.sin(t), h = s / 2;
      const ux = -sa * h, uz = ca * h, vx = ca * st * h, vy = ct * h, vz = sa * st * h;
      const P = [[x - ux - vx, y - vy, z - uz - vz], [x + ux - vx, y - vy, z + uz - vz], [x + ux + vx, y + vy, z + uz + vz], [x - ux + vx, y + vy, z - uz + vz]];
      const UV = [[0, 0], [1, 0], [1, 1], [0, 1]]; const C = lin(c);
      for (const k of [0, 1, 2, 0, 2, 3]) { this.p.push(P[k][0], P[k][1], P[k][2]); this.n.push(n[0], n[1], n[2]); this.c.push(C[0], C[1], C[2]); this.uv.push(UV[k][0], UV[k][1]); }
      this._k(sw, 6);
    }
    get empty() { return !this.p.length; }
    // (solid: the geometry always carries its patterns, even all plain — a shader's attribute never read unbound)
    build(solid, sway) {
      const g = new THREE.BufferGeometry(); const nv = this.p.length / 3;
      if (sway && !this.k) this.k = new Array(nv).fill(0);
      g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
      if (this.k) g.setAttribute('aK', new THREE.Float32BufferAttribute(this.k, 1));
      if (this.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
      if (this.q || solid) g.setAttribute('aP', this.q ? new THREE.Float32BufferAttribute(this.q, 1) : new THREE.BufferAttribute(new Float32Array(nv), 1));
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
  // ------------------------------ the painter's light ------------------------------
  // (the painter's light patched into three.js's own pieces of shader — the air, the grade, the soft shadows, the light of the
  // flames — and the uniforms of the air every material reads, GX: the sky's, js/ceu3d.js — 21d, NATUREZA.md §8)
  // the shapes every builder puts, and the frames reused to put them — made once, before anything is drawn (and without a
  // graphics card: the geometry is only numbers — the tests in Node build the same chunks the game does)
  R3.shapes = function () {
    THREE = window.THREE; if (R3.SH) return R3.SH;
    R3._m = new THREE.Matrix4(); R3._m2 = new THREE.Matrix4(); R3._v = new THREE.Vector3(); R3._nm = new THREE.Matrix3();
    SH.box = new THREE.BoxGeometry(1, 1, 1); SH.box.translate(0, 0.5, 0); // (standing on its base)
    SH.cyl = new THREE.CylinderGeometry(0.5, 0.5, 1, 7); SH.cyl.translate(0, 0.5, 0);
    SH.cone = new THREE.ConeGeometry(0.5, 1, 8); SH.cone.translate(0, 0.5, 0);
    SH.ico = new THREE.IcosahedronGeometry(0.5, 1);
    SH.ico0 = new THREE.IcosahedronGeometry(0.5, 0);
    SH.dode = new THREE.DodecahedronGeometry(0.5, 0);
    SH.sph = new THREE.SphereGeometry(0.5, 8, 6);
    // a gable: a triangular prism, ridge along X, base 1×1 at y = 0, peak at y = 1 — each face wound out of it, as the
    // one-sided material shows it (wound in, its outside was never drawn: from out one saw the far slope's inside, its light
    // the wrong way — the far roofs dark, L-270)
    { const g = new THREE.BufferGeometry(); const v = [
      -0.5, 0, -0.5, 0.5, 1, 0, 0.5, 0, -0.5, -0.5, 0, -0.5, -0.5, 1, 0, 0.5, 1, 0, // north slope
      -0.5, 0, 0.5, 0.5, 1, 0, -0.5, 1, 0, -0.5, 0, 0.5, 0.5, 0, 0.5, 0.5, 1, 0, // south slope
      -0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 1, 0, 0.5, 0, -0.5, 0.5, 1, 0, 0.5, 0, 0.5, // the two gable ends
    ]; g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.computeVertexNormals(); SH.gable = g; }
    // a hip roof: a pyramid of four slopes on a 1×1 base
    { const g = new THREE.ConeGeometry(0.7071, 1, 4, 1); g.rotateY(Math.PI / 4); g.translate(0, 0.5, 0); SH.hip = g; }
    R3.SH = SH;
    return SH;
  };
  function init() {
    THREE = window.THREE; if (!THREE) throw new Error('three.js não carregou');
    G.Ceu3D.toon(THREE); // (the painter's light in three.js's own pieces of shader, before any material is made: the sky's)
    U.wind.value = new THREE.Vector3(); U.body.value = new THREE.Vector4(); U.sky.value = new THREE.Color(0xbfd8ea);
    G.Ground3D.init(THREE);
    R3.shapes();
    canvas = document.createElement('canvas'); canvas.id = 'game3d';
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;display:none;z-index:1;opacity:0;outline:none;';
    document.body.insertBefore(canvas, document.getElementById('game').nextSibling);
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false });
    // (the neutral curve keeps the colours the god's view paints: ACES would darken and wash them; the exposure follows the
    // hour — light(): the eye opens a little at dusk and at night, as ours does)
    renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0; renderer.outputColorSpace = THREE.SRGBColorSpace;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1600);
    // the light of the hour, the air and the sky — a hemisphere and one key light, the picture of the light of the flames round
    // the body, the dome with its sun, moon, clouds and stars: the sky's (ceu3d.js, 21d)
    G.Ceu3D.init(THREE, renderer, scene, camera); skyU = R3.skyU;
    // the light inside the buildings, baked from their plans: its pictures, in the sky's uniforms (G.Luz3D, D-700)
    G.Luz3D && G.Luz3D.init && G.Luz3D.init(THREE);
    // materials (shared by every chunk)
    // (the ground: painted tile by tile with the god's colours, by the Ground3D; its vertex colour is only the shade of
    // the hollows and of the foot of the walls)
    MAT.land = G.Ground3D.material();
    // (the ground's own shader, and one thing more: where an inside is drawn under the street — a sunken floor, a cellar — the
    // ground over its floor is not drawn: Build3D.sunk, four boxes at most)
    { const g0 = MAT.land.onBeforeCompile; const SU = G.Build3D && G.Build3D.sunkU;
      if (SU) MAT.land.onBeforeCompile = (sh, rn) => { if (g0) g0(sh, rn); Object.assign(sh.uniforms, { uSunkA: SU.a, uSunkB: SU.b, uSunkN: SU.n });
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uSunkA[4]; uniform vec3 uSunkB[4]; uniform int uSunkN;\n')
          .replace('#include <clipping_planes_fragment>', 'for (int i = 0; i < 4; i++) { if (i >= uSunkN) break; vec3 ca = uSunkA[i], cb = uSunkB[i]; if (vGP.x > ca.x && vGP.y > ca.y && vGP.z > ca.z && vGP.x < cb.x && vGP.y < cb.y && vGP.z < cb.z) discard; }\n#include <clipping_planes_fragment>'); }; }
    MAT.solid = new THREE.MeshLambertMaterial({ vertexColors: true });
    // (the inside of a building drawn round the body: the same stuff, never cut — Build3D's insides)
    MAT.inner = new THREE.MeshLambertMaterial({ vertexColors: true });
    // (and, where the machine carries it, with its sheen: the waxed wood, the glazed clay, the bronze and the floor polished by the
    // feet catch the light of the fire and of the window — each pattern its own, Build3D's m3spec; the painter's band of light as
    // the Lambert's: the Alta and the Ultra, D-706)
    MAT.innerHi = new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 26, specular: 0x3a3630 });
    // the trees, the bushes and the grass: their materials are the forest's (Arvore3D, js/arvore3d.js — 21a)
    G.Arvore3D.materials(THREE, MAT, U);
    // the water's materials: the water, the ice, the parted sea's walls, the sheets of the falls (Agua3D, js/agua3d.js — 21c)
    G.Agua3D.materials(THREE, MAT, U, skyU);
    applyQuality();
    window.addEventListener('resize', resize);
    resize();
    G.Build3D && G.Build3D.init && G.Build3D.init(THREE, R3);
    G.Build3D && G.Build3D.dress && G.Build3D.dress(MAT.solid); // (the solid material learns the patterns of the walls and roofs)
    G.Build3D && G.Build3D.dress && G.Build3D.dress(MAT.inner); // (and the inside's: the cut is the town's only — M3CUT)
    if (G.Build3D && G.Build3D.dress) { G.Build3D.dress(MAT.innerHi); const ob = MAT.innerHi.onBeforeCompile;
      MAT.innerHi.onBeforeCompile = (sh, rn) => { ob(sh, rn); sh.fragmentShader = sh.fragmentShader.replace('#include <lights_phong_pars_fragment>', THREE.ShaderChunk.lights_phong_pars_fragment.replace('float dotNL = saturate( dot( geometryNormal, directLight.direction ) );',
        'float nl = dot( geometryNormal, directLight.direction ); float dotNL = smoothstep( -0.06, 0.4, nl ) * 0.8 + saturate( nl ) * 0.2;')); }; }
    G.People3D && G.People3D.init && G.People3D.init(THREE, R3);
    G.FX3D && G.FX3D.init && G.FX3D.init(THREE, R3);
    G.Dragon3D && G.Dragon3D.init && G.Dragon3D.init(THREE, R3);
    G.Things3D && G.Things3D.init && G.Things3D.init(THREE, R3);
    G.Geo3D && G.Geo3D.init && G.Geo3D.init(THREE, R3); // (21b: the relief — the rock's material, the kit of rock, the land beyond the edge)
    G.Grass3D && G.Grass3D.init && G.Grass3D.init(THREE, R3);
    G.Post3D && G.Post3D.init && G.Post3D.init(THREE, R3);
  }
  function applyQuality() {
    const q = R3.Q();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2) * q.scale);
    renderer.shadowMap.enabled = !!q.shadows; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = (q.shadowEvery | 0) <= 1; renderer.shadowMap.needsUpdate = true; // (light() asks for it every n frames)
    G.Ceu3D.quality(q); // (the sun's picture of the shadows, the sky in its cheap way where no grain is drawn: the sky's)
    // (the patterns of walls and roofs and the speckle of the leaves only where the machine carries the ground's grain too)
    for (const m of [MAT.solid, MAT.flora, MAT.inner, MAT.innerHi]) if (m) m.defines = q.detail === 0 ? { NOPAT: 1 } : {};
    if (MAT.innerHi) MAT.innerHi.defines.M3SPEC = 1;
    for (const m of [MAT.inner, MAT.innerHi]) if (m) m.defines.M3EYE = 1; // (the inside gives way in the eye's box — the front P4's quarta parede: Build3D.eyeBox)
    // (the insides' materials in high resolution on the Alta and the Ultra — P8, D-772: loaded in the background by the Ground3D, a
    // material at a time; on the others the card's memory given back)
    const hiQ = !!(G.Ground3D.HI_SIZE && G.Ground3D.HI_SIZE[R3.q]) && q.detail !== 0;
    for (const m of [MAT.inner, MAT.innerHi]) if (m && hiQ) m.defines.M3HI = 1;
    G.Ground3D.hiWant && G.Ground3D.hiWant(hiQ ? R3.q : null);
    if (MAT.solid) { MAT.solid.defines.M3CUT = 1; MAT.solid.defines.GX_NOVOL = 1; } // (the town's solid gives way where an inside is drawn: Build3D.cuts; and its outer faces are the open air's, never lit as the room behind them — G.Luz3D)
    for (const m of [MAT.land, MAT.solid, MAT.flora, MAT.plant, MAT.inner, MAT.innerHi]) if (m) m.needsUpdate = true;
    G.Build3D && G.Build3D.insideClear && G.Build3D.made && G.Build3D.made() && G.Build3D.insideClear(); // (the insides made again in the material of the quality)
    G.Ground3D.quality();
    G.Agua3D.quality(q); // (the water's ways by the quality: its cheap one, the clouds and the scene in its face — 21c)
    G.FX3D && G.FX3D.quality && G.FX3D.quality(q);
    G.Post3D && G.Post3D.quality && G.Post3D.quality(q);
    // (what is near the body was made at the last quality: each near picture is asked to be made again — the stream does it,
    // the nearest first, a few a frame — so the quality chosen is the one seen, not only in the pictures made after it)
    for (const ch of chunks.values()) if (ch.near) { ch.sig = STALE; ch.sigT = -1e9; }
    resize();
  }
  const STALE = { a: NaN, b: NaN, c: NaN, d: NaN, e: NaN }; // (a signature no picture has: what carries it is made again)
  function resize() { if (!renderer) return; const w = window.innerWidth, h = window.innerHeight; renderer.setSize(w, h, false); camera.aspect = w / Math.max(1, h); camera.updateProjectionMatrix(); G.Post3D && G.Post3D.resize && G.Post3D.resize(); }

  // ------------------------------ the ground of a chunk ------------------------------
  // (its colour is the Ground3D's tile picture, read by the land's shader; here only its shape and its shade)
  const tileCol = (i, x, y) => G.Ground3D.tileCol(i, x, y);
  // the shade of a point of the ground: in a hollow, and at the foot of a house or a wall (what the god's view darkens
  // with its contour of shade) — the light the sky does not reach
  function shadeAt(x, y) {
    const S = G.S; let k = 1;
    // (the tiles this point touches: four at a corner, one in the middle of a tile)
    const x0 = Math.abs(x - Math.round(x)) < 0.01 ? Math.round(x) - 1 : Math.floor(x), x1 = Math.floor(x + 0.01);
    const y0 = Math.abs(y - Math.round(y)) < 0.01 ? Math.round(y) - 1 : Math.floor(y), y1 = Math.floor(y + 0.01);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      if (!W.inb(tx, ty)) continue; const i = ty * N + tx;
      const b = S.occ[i] && S.buildings.get(S.occ[i]); if (b && b.blocks) k = Math.min(k, 0.66); else if (S.wall[i] && S.wall[i] !== 3) k = Math.min(k, 0.72);
    }
    const h = W.hAt(x, y), m = (W.hAt(x + 1, y) + W.hAt(x - 1, y) + W.hAt(x, y + 1) + W.hAt(x, y - 1)) / 4;
    return k * G.clamp(1 - (m - h) * 0.12, 0.72, 1);
  }
  // the slope of the ground from its heights (continuous across chunks: no seams of light between them)
  function normalAt(x, y, out) { const e = 0.25; const hx = (W.hAt(x + e, y) - W.hAt(x - e, y)) * G.Space.HM / (2 * e * G.Space.TILE), hz = (W.hAt(x, y + e) - W.hAt(x, y - e)) * G.Space.HM / (2 * e * G.Space.TILE); const l = Math.hypot(hx, 1, hz); out[0] = -hx / l; out[1] = 1 / l; out[2] = -hz / l; return out; }
  // (o.far: the far picture, a little low; o.skip: the tiles whose ground another drawing makes — the carved faces of cliff, 21b — one byte
  // a tile of the stretch, 1 to leave it out)
  function terrainGeo(x0, y0, w, h, step, o) {
    const TL = G.Space.TILE, HM = G.Space.HM; const gw = Math.round(w / step) + 1, gh = Math.round(h / step) + 1; const far = o ? !!o.far : step > 1, skip = o && o.skip;
    const pos = new Float32Array(gw * gh * 3), nor = new Float32Array(gw * gh * 3), colr = new Float32Array(gw * gh * 3); const nn = [0, 0, 0];
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
      const x = Math.min(N, x0 + i * step), y = Math.min(N, y0 + j * step); const k = (j * gw + i) * 3;
      pos[k] = x * TL; pos[k + 1] = W.hAt(x, y) * HM - (far ? 0.3 : G.Space.bedDrop(x, y)); pos[k + 2] = y * TL; // (the far picture a little low: a crack at its edge shows ground, not sky; near, the beds of the rivers under their water)
      normalAt(x, y, nn); nor[k] = nn[0]; nor[k + 1] = nn[1]; nor[k + 2] = nn[2];
      const sh = step < 1 ? shadeAt(x, y) : 1; colr[k] = colr[k + 1] = colr[k + 2] = sh * sh; // (a shade, so linear)
    }
    const idx = []; for (let j = 0; j < gh - 1; j++) for (let i = 0; i < gw - 1; i++) { if (skip && skip[Math.floor((j + 0.5) * step) * w + Math.floor((i + 0.5) * step)]) continue; const a = j * gw + i, b = a + 1, c = a + gw, d = c + 1; idx.push(a, c, b, b, c, d); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.BufferAttribute(colr, 3)); g.setIndex(idx); g.computeBoundingSphere();
    return g;
  }
  // water: the sea at its level, every river and lake at its own; the ice of a sudden winter; the walls of a parted sea; the sheets of
  // the falls — the water's drawing (Agua3D, js/agua3d.js — 21c)
  const waterGeo = (x0, y0, w, h, far) => G.Agua3D.geo(x0, y0, w, h, far);
  R3.WGeo = () => G.Agua3D.WGeo();
  R3.bedCheck = n => G.Agua3D.bedCheck(n);

  // ------------------------------ the bridges ------------------------------
  // where a road crosses the water (a road on a river's tile). The world gives a bridge little height: its deck is the feet's
  // own (Space.deckAt, 12 cm over the water's face; the land's own height where that stands higher), so a bridge here is a low
  // one, as over a canal at high water — the feet of its arches under the water, only their crowns out of it, in the face of
  // the parapet's own wall. All the tiles that touch are one bridge (corners too), in the stone and the manner of the people
  // whose houses stand nearest its middle (as a house reads its own: b.style): Rome's round arch of wedge stones; Egypt's slab
  // on piers under its roll and its cavetto; the Aztec causeway of red volcanic stone, its ends in steps; the Greek corbelled
  // gap in pale stone; the classic's low arch of brick; in the north, and on every road not yet paved, timber — on dry stone
  // there. A side over the water has its parapet; a side the way goes on through (the land, the bridge's next tile, a corner
  // another tile touches) is open. From far, a slab and its walls. Only seen, and no chance in it: G.hash by the tile
  const BRC = [null, [184, 164, 128], [190, 182, 164], [146, 142, 134]]; // (a road's colours, as the ground paints them: Ground3D's)
  const BSIDE = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // (out of a tile's sides: N, E, S, W; along a side: [-oz, ox])
  const BF = 1.92, BT = 0.34, BGAP = 1.3, BREC = 0.22; // (m: a side's face from the tile's middle, the wall's thickness, a corner left open, how deep a gap is cut)
  const BDARK = [30, 33, 38]; // (the dark under an arch)
  // each people's bridge of stone — gap: 0 a round arch, 1 a low segment of one, 2 bays under a slab, 3 one gap under a lintel,
  // 4 a corbelled gap; the stuff of its walls (Build3D.PAT) and its own colour, or the people's (Arch.PAL's base); how high the
  // wall stands over the deck; the stuff of its wedge stones and lintels, and of its coping
  const BRIDGE = {
    romano: { gap: 0, pat: 'ashlar', col: [180, 171, 154], h: 0.8, cut: 'marble', cap: 'ashlar' }, classico: { gap: 1, pat: 'brick', col: [172, 108, 82], h: 0.8, cut: 'brick', cap: 'ashlar' },
    egipcio: { gap: 2, pat: 'sandstone', h: 0.46, cut: 'sandstone', cap: 'sandstone' }, asteca: { gap: 3, pat: 'tezontle', col: [150, 110, 98], h: 0.5, cut: 'stucco', cap: 'stucco' },
    grego: { gap: 4, pat: 'marble', h: 0.76, cut: 'marble', cap: 'marble' },
  };
  // (what lies across a side of a bridge's tile, or at its corner — 0 the way goes on: land one walks; 1 the bridge itself;
  // 2 water; 3 a wall: a building, a city's wall, a cliff)
  function bridgeNb(x, y) {
    const S = G.S; if (!W.inb(x, y)) return 2; const i = y * N + x, t = S.type[i];
    if (t <= T.RIVER) return t === T.RIVER && S.road[i] ? 1 : 2;
    return W.blocked(i) || S.wall[i] === 1 || S.cliff[i] ? 3 : 0;
  }
  // (a bridge's tile: what lies across each side — k: N, E, S, W — and at each corner — c: NE, SE, SW, NW —, and how the parapet
  // of a side over water ends, at its start and at its end — e: 0 it goes on along the next tile, 1 it ends there (the bank, a
  // wall), 2 it meets the next side's at the corner, 3 it stops short of a corner the way goes through: one with the bridge's
  // next tile across it, or with the land across it and no way beside it — water or a wall on the side next to it)
  function bridgePlan(x, y) {
    const k = [], c = [], e = [];
    for (let s = 0; s < 4; s++) { const o = BSIDE[s], o2 = BSIDE[(s + 1) % 4]; k.push(bridgeNb(x + o[0], y + o[1])); c.push(bridgeNb(x + o[0] + o2[0], y + o[1] + o2[1])); }
    const end = (s2, cn) => (c[cn] === 1 ? 3 : k[s2] >= 2 ? (c[cn] === 0 ? 3 : k[s2] === 2 ? 2 : 1) : k[s2] === 1 && c[cn] === 2 ? 0 : 1);
    for (let s = 0; s < 4; s++) e.push(k[s] === 2 && !G.S.wall[y * N + x] ? [end((s + 3) % 4, (s + 3) % 4), end((s + 1) % 4, s)] : null); // (under a city's wall, no parapet: the wall is one)
    return { k, c, e };
  }
  // (the whole bridge a tile is of: the tiles of road over the river that touch it, corners too, and the people in whose manner
  // it is built — of the building nearest its middle, within ten tiles; else of the nearest town. memo: the tiles already asked)
  function bridgeOf(i, memo) {
    let br = memo && memo.get(i); if (br) return br;
    const S = G.S; const tiles = [i], seen = new Set([i]); let sx = 0, sy = 0;
    for (let q = 0; q < tiles.length; q++) { const x = tiles[q] % N, y = (tiles[q] / N) | 0; sx += 2 * x + 1; sy += 2 * y + 1;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny)) continue; const j = ny * N + nx; if (!seen.has(j) && S.type[j] === T.RIVER && S.road[j]) { seen.add(j); tiles.push(j); } } }
    const cx = sx / (2 * tiles.length), cy = sy / (2 * tiles.length), X0 = Math.floor(cx), Y0 = Math.floor(cy); let st = null, bd = 1e9;
    const civ = id => { const f = G.Fac && G.Fac.ofSet ? G.Fac.ofSet(id) : null; return f ? f.civ : null; };
    for (let y = Y0 - 10; y <= Y0 + 10; y++) for (let x = X0 - 10; x <= X0 + 10; x++) {
      if (!W.inb(x, y)) continue; const o = S.occ[y * N + x]; if (!o) continue; const d = (x + 0.5 - cx) * (x + 0.5 - cx) + (y + 0.5 - cy) * (y + 0.5 - cy); if (d >= bd) continue;
      const b = S.buildings.get(o), s = b && (b.style || civ(b.set)); if (s) { bd = d; st = s; } }
    if (!st) { let sd = 1e9; for (const q of S.settlements.values()) { const d = (q.cx - cx) * (q.cx - cx) + (q.cy - cy) * (q.cy - cy), s = d < sd && civ(q.id); if (s) { sd = d; st = s; } } }
    br = { tiles, st: st === 'nordico' || BRIDGE[st] ? st : 'classico' }; if (memo) for (const j of tiles) memo.set(j, br);
    return br;
  }
  // (what a bridge's tile is drawn from, in one number, for the chunk's signature: its people, its sides, its corners)
  const BPEOPLE = ['classico', 'grego', 'romano', 'egipcio', 'asteca', 'nordico'];
  function bridgeSig(i, memo) { const pl = bridgePlan(i % N, (i / N) | 0); let s = BPEOPLE.indexOf(bridgeOf(i, memo).st) + 1; for (let k = 0; k < 4; k++) s = s * 16 + pl.k[k] * 4 + pl.c[k]; return s | 0; }
  // (a flat piece — its corners in order round it —, wound to face the way n points)
  function bface(g, P, n, col) {
    const a = P[0];
    for (let k = 1; k + 1 < P.length; k++) { const b = P[k], c = P[k + 1]; const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx; if (cx * cx + cy * cy + cz * cz < 1e-12) continue;
      if (cx * n[0] + cy * n[1] + cz * n[2] >= 0) g.tri(a, b, c, col); else g.tri(a, c, b, col); }
  }
  // (the deck's top over a rectangle of the map — tiles —: at the feet's own height dk, and over the land where that stands
  // higher; cut along the land's own picture — a point every half tile, each cell cut from its +x corner to its +y corner:
  // Space.drawnAt —, so the land never comes through it)
  function deckTop(g, u0, v0, u1, v1, dk, col) {
    const Sp = G.Space, TL = Sp.TILE; const Y = (u, v) => Math.max(dk, Sp.drawnAt(Math.min(N - 1e-6, u), Math.min(N - 1e-6, v)) + 0.03);
    for (let j = Math.floor(v0 * 2 + 1e-9); j / 2 < v1 - 1e-9; j++) for (let i = Math.floor(u0 * 2 + 1e-9); i / 2 < u1 - 1e-9; i++) {
      const a0 = Math.max(u0, i / 2), a1 = Math.min(u1, (i + 1) / 2), b0 = Math.max(v0, j / 2), b1 = Math.min(v1, (j + 1) / 2); if (a1 - a0 < 1e-6 || b1 - b0 < 1e-6) continue;
      const R = [[a0, b0], [a1, b0], [a1, b1], [a0, b1]], c = (i + j + 1) / 2; // (the cell's cut: u + v = c)
      for (const sg of [1, -1]) { const P = [];
        for (let k = 0; k < 4; k++) { const p = R[k], q = R[(k + 1) % 4]; const dp = (c - p[0] - p[1]) * sg, dq = (c - q[0] - q[1]) * sg; if (dp >= 0) P.push(p); if ((dp > 0 && dq < 0) || (dp < 0 && dq > 0)) { const t = dp / (dp - dq); P.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); } }
        if (P.length >= 3) bface(g, P.map(p => [p[0] * TL, Y(p[0], p[1]), p[1] * TL]), [0, 1, 0], col); }
    }
  }
  // one tile of a bridge into a chunk's geometry (marks: for the proofs — [the part's name, the tile, its first point])
  function bridgeInto(g, x, y, br, far, marks) {
    const S = G.S, Sp = G.Space, TL = Sp.TILE, HM = Sp.HM; const PAT = G.Build3D.PAT; const i = y * N + x, r = Math.min(3, S.road[i]);
    const mk = n => { if (marks) marks.push([n, i, g.p.length / 3]); };
    const pl = bridgePlan(x, y), CX = (x + 0.5) * TL, CZ = (y + 0.5) * TL; const wf = S.wl[i] * HM + 0.05, dk = Sp.deckAt(x + 0.5, y + 0.5);
    // (down into the bed: under the water's face and under the lowest of the land round the tile)
    const yb = Math.min(wf, W.vh(x, y) * HM, W.vh(x + 1, y) * HM, W.vh(x, y + 1) * HM, W.vh(x + 1, y + 1) * HM) - 0.6, yw = wf - 0.45;
    const timber = r < 2 || br.st === 'nordico', north = br.st === 'nordico', B = BRIDGE[br.st] || BRIDGE.classico;
    const P = ((G.Arch && G.Arch.PAL) || {})[br.st] || {}; const base = (P.base || ['#8a8478', '#6f6a60', '#a09a8e']).map(c => G.hex2rgb(c));
    const tone = (c, f) => [c[0] * f, c[1] * f, c[2] * f], hs = q => G.hash(i * 31 + q);
    const stone = B.col || base[0], dark = tone(stone, 0.72), light = B.col ? (B.cut === 'stucco' ? G.hex2rgb(P.wl || '#f1e9d6') : base[2]) : base[2];
    const wood = q => (north ? G.lerpColor([128, 106, 80], [112, 106, 98], hs(q) * 0.8) : [138, 106, 68]).map(c => c * (0.88 + hs(q + 7) * 0.2)), beam = north ? [78, 60, 46] : [94, 70, 48];
    // (the way over a timber deck runs along X unless only its north and south are open: the planks lie across it)
    const wayX = pl.k[1] !== 2 || pl.k[3] !== 2 || (pl.k[0] === 2 && pl.k[2] === 2);
    // ---- the deck: the road's own paving, at the feet's height; of planks across the way on a timber one
    // (how far the deck runs toward each side, from the tile's middle: to the tile's edge; over water, to the bridge's face —
    // under a wall of stone only to its inner face: in the gaps cut into the wall it would show as a floor)
    const lim = s => (pl.k[s] !== 2 ? 2 : pl.e[s] && !timber && !far ? BF - BT + 0.01 : BF);
    mk('deck');
    const paving = G.lerpColor(BRC[r], base[2], 0.3); // (the street's slabs, a third toward the people's own stone)
    if (!timber || far) { g.pat = timber ? PAT.plankH : PAT.slab; const c = timber ? wood(0) : paving;
      if (far) g.put(SH.box, R3.mat(CX + (lim(1) - lim(3)) / 2, yb, CZ + (lim(2) - lim(0)) / 2, 0, lim(1) + lim(3), dk - yb, lim(0) + lim(2)), c);
      else deckTop(g, x + 0.5 - lim(3) / TL, y + 0.5 - lim(0) / TL, x + 0.5 + lim(1) / TL, y + 0.5 + lim(2) / TL, dk, c);
    } else { const n = 12, a0 = -lim(wayX ? 3 : 0), a1 = lim(wayX ? 1 : 2), b0 = -lim(wayX ? 0 : 3), b1 = lim(wayX ? 2 : 1); g.pat = wayX ? PAT.beamZ : PAT.beamX;
      for (let k = 0; k < n; k++) { const p0 = a0 + (a1 - a0) * k / n + 0.012, p1 = a0 + (a1 - a0) * (k + 1) / n - 0.012, pm = (p0 + p1) / 2; let top = dk;
        // (a plank is level: over the highest of the land under it)
        for (let q = 0; q <= 4; q++) { const b = b0 + (b1 - b0) * q / 4; top = Math.max(top, Sp.drawnAt(Math.min(N - 1e-6, x + 0.5 + (wayX ? pm : b) / TL), Math.min(N - 1e-6, y + 0.5 + (wayX ? b : pm) / TL)) + 0.03); }
        const e0 = b0 === -2 ? b0 : b0 + hs(k * 3 + 1) * 0.05, e1 = b1 === 2 ? b1 : b1 - hs(k * 3 + 2) * 0.05; // (each a little shorter or longer over the water)
        g.put(SH.box, R3.mat(CX + (wayX ? pm : (e0 + e1) / 2), top - 0.08, CZ + (wayX ? (e0 + e1) / 2 : pm), 0, wayX ? p1 - p0 : e1 - e0, 0.08, wayX ? e1 - e0 : p1 - p0), wood(k)); }
    }
    for (let s = 0; s < 4; s++) {
      const o = BSIDE[s], tx = -o[1], tz = o[0], ax = o[1] !== 0, ry = Math.atan2(o[0], o[1]), ON = [o[0], 0, o[1]];
      // (the side's own frame: a along it, d out from the tile's middle, yy up)
      const pt = (a, d, yy) => [CX + a * tx + d * o[0], yy, CZ + a * tz + d * o[1]];
      const box = (a0, a1, d0, d1, y0b, y1b, col) => { if (a1 - a0 < 1e-4 || y1b - y0b < 1e-4) return; const c = pt((a0 + a1) / 2, (d0 + d1) / 2, 0); g.put(SH.box, R3.mat(c[0], y0b, c[2], 0, ax ? a1 - a0 : d1 - d0, y1b - y0b, ax ? d1 - d0 : a1 - a0), col); };
      // (a bar leaning in the side's face: from [a0, y0] to [a1, y1], w wide in the face and th out of it, its middle at d)
      const bar = (shape, a0, y0b, a1, y1b, d, w, th, col) => { const c = pt(a0, d, y0b); g.put(shape, R3.mat(c[0], y0b, c[2], ry, w, Math.hypot(a1 - a0, y1b - y0b), th, 0, Math.atan2(a1 - a0, y1b - y0b)), col); };
      const e = pl.e[s];
      if (!e) {
        // ---- a side the way goes on through: the deck's edge, down into the ground (none against a wall; over water under a
        // city's wall, the bridge's bare flank)
        if (!far && pl.k[s] !== 3) { mk('soleira'); g.pat = timber ? (ax ? PAT.beamX : PAT.beamZ) : PAT[B.pat]; const d1 = pl.k[s] === 2 ? BF : 1.98; box(-lim((s + 3) % 4), lim((s + 1) % 4), d1 - 0.14, d1, yb, dk - 0.012, timber ? beam : dark); }
        continue;
      }
      // (the wall's run along the side: to the tile's edge where it goes on or ends, to the next side's face at a corner, short
      // of a corner left open)
      const run = q => (q === 0 ? 2 : q === 1 ? 1.94 : q === 2 ? BF : 2 - BGAP), A0 = -run(e[0]), A1 = run(e[1]);
      if (timber) {
        // ---- timber: a kerb log on the planks' ends, posts down into the bed, a rail on them, braces crossed between; in the
        // north, at each end, a block of dry stone
        const yt = dk + 0.98; g.pat = ax ? PAT.beamX : PAT.beamZ;
        if (far) { mk('mureta'); box(A0, A1, BF - 0.2, BF - 0.07, yt - 0.13, yt, beam); continue; } // (from far, its rail)
        mk('mureta'); box(A0, A1, BF - 0.24, BF - 0.03, dk, dk + 0.15, beam);
        const stub = q => (q === 0 ? 0 : north && r >= 2 ? 0.5 : 0.07), p0 = A0 + stub(e[0]), p1 = A1 - stub(e[1]), n = Math.max(1, Math.round((p1 - p0) / 1.3)), dm = BF - 0.135;
        for (let k = 0; k <= n; k++) { if (k === n && e[1] === 0) break; const a = p0 + (p1 - p0) * k / n; g.pat = PAT.beam; mk('poste'); box(a - 0.065, a + 0.065, dm - 0.065, dm + 0.065, yb, yt + 0.06 + hs(40 + k) * 0.04, beam); }
        g.pat = ax ? PAT.beamX : PAT.beamZ; mk('corrimao'); bar(SH.cyl, A0 + (e[0] ? stub(e[0]) - 0.07 : 0), yt - 0.06, A1 - (e[1] ? stub(e[1]) - 0.07 : 0), yt - 0.06, dm, 0.13, 0.13, tone(beam, 1.12));
        box(p0, p1, dm - 0.03, dm + 0.03, dk + 0.5, dk + 0.57, beam);
        g.pat = PAT.beam; mk('escora');
        for (let k = 0; k < n; k++) { const a = p0 + (p1 - p0) * k / n + 0.07, b = p0 + (p1 - p0) * (k + 1) / n - 0.07; bar(SH.box, a, dk + 0.17, b, dk + 0.5, dm - 0.02, 0.05, 0.035, tone(beam, 1.08)); bar(SH.box, b, dk + 0.17, a, dk + 0.5, dm + 0.02, 0.05, 0.035, tone(beam, 1.08)); }
        if (north && r >= 2) { g.pat = PAT.stone; mk('encontro');
          for (const [q, a] of [[e[0], A0], [e[1], A1]]) { if (q === 0 || (q === 2 && a < 0)) continue; const sg = a < 0 ? 1 : -1, a0 = q === 2 ? BF - 0.47 : Math.min(a, a + sg * 0.5), d0 = BF - 0.47;
            box(a0, a0 + 0.5, d0, BF + 0.03, yb, dk + 0.52 + hs(50 + s) * 0.08, tone(base[0], 0.96 + hs(52 + s) * 0.1)); box(a0 + 0.05, a0 + 0.45, d0 + 0.05, BF - 0.02, dk + 0.5, dk + 0.72 + hs(54 + s) * 0.06, tone(base[2], 0.9 + hs(56 + s) * 0.1)); }
        }
        continue;
      }
      // ---- stone: the wall — the bridge's flank and its parapet in one — with its gaps, and what crowns it
      const yt = dk + B.h, top = yt + (B.gap === 2 ? 0.44 : 0.12);
      if (far) { mk('mureta'); g.pat = PAT[B.pat]; box(A0, A1, BF - BT, BF, yb, top, stone); continue; }
      // (the gaps, between the piers: the points of each one's top, from its start to its end — [a, yy])
      const m0 = A0 + (e[0] === 0 ? 0.35 : 0.55), m1 = A1 - (e[1] === 0 ? 0.35 : 0.55), ac = (m0 + m1) / 2, gaps = []; let arc = null;
      if (m1 - m0 >= 1.2) {
        if (B.gap < 2) {
          // (a round arch whole, its middle under the water; the low one springs at the water's face)
          const hw = (m1 - m0) / 2, rr = B.gap === 0 ? hw : (hw * hw + 0.27) / 1.04, cy = wf + 0.5 - rr, tm = B.gap === 0 ? Math.acos(G.clamp((yw - cy) / rr, 0, 1)) : Math.asin(Math.min(1, hw / rr)), n = B.gap === 0 ? 11 : 15, q = [];
          for (let k = 0; k <= n; k++) { const th = -tm + 2 * tm * k / n; q.push([ac + rr * Math.sin(th), cy + rr * Math.cos(th)]); }
          if (q[0][1] > yw + 1e-6) { q.unshift([q[0][0], yw]); q.push([q[q.length - 1][0], yw]); }
          gaps.push(q); arc = { rr, cy, tm, n };
        } else if (B.gap === 2) { const yl = wf + 0.34; for (const [b0, b1] of m1 - m0 >= 2.6 ? [[m0, ac - 0.27], [ac + 0.27, m1]] : [[m0, m1]]) gaps.push([[b0, yw], [b0, yl], [b1, yl], [b1, yw]]); }
        else if (B.gap === 3) { const hw = Math.min(0.8, (m1 - m0) / 2), yl = wf + 0.36; gaps.push([[ac - hw, yw], [ac - hw, yl], [ac + hw, yl], [ac + hw, yw]]); }
        else { const hw = Math.min(1.05, (m1 - m0) / 2), st = hw * 0.27, q = [[ac - hw, yw]]; for (let k = 0; k < 3; k++) q.push([ac - hw + st * k, wf + 0.17 * (k + 1)], [ac - hw + st * (k + 1), wf + 0.17 * (k + 1)]);
          q.pop(); for (let k = q.length - 1; k >= 0; k--) q.push([2 * ac - q[k][0], q[k][1]]); gaps.push(q); }
      }
      mk('flanco'); g.pat = PAT[B.pat];
      const rect = (a0, a1) => { if (a1 - a0 > 1e-6) bface(g, [pt(a0, BF, yb), pt(a1, BF, yb), pt(a1, BF, yt), pt(a0, BF, yt)], ON, stone); };
      let at = A0;
      for (const q of gaps) { rect(at, q[0][0]); at = q[q.length - 1][0];
        for (let k = 0; k + 1 < q.length; k++) if (q[k + 1][0] - q[k][0] > 1e-6) bface(g, [pt(q[k][0], BF, q[k][1]), pt(q[k + 1][0], BF, q[k + 1][1]), pt(q[k + 1][0], BF, yt), pt(q[k][0], BF, yt)], ON, stone); }
      rect(at, A1);
      bface(g, [pt(A0, BF - BT, dk - 0.06), pt(A1, BF - BT, dk - 0.06), pt(A1, BF - BT, yt), pt(A0, BF - BT, yt)], [-o[0], 0, -o[1]], stone);
      // (each gap cut into the wall: its soffit and its sides, and the dark at its back)
      mk('vao');
      for (const q of gaps) for (let k = 0; k + 1 < q.length; k++) { const a = q[k], b = q[k + 1], na = b[1] - a[1], ny = a[0] - b[0];
        g.pat = PAT[B.pat]; bface(g, [pt(a[0], BF, a[1]), pt(b[0], BF, b[1]), pt(b[0], BF - BREC, b[1]), pt(a[0], BF - BREC, a[1])], [na * tx, ny, na * tz], dark);
        g.pat = 0; if (b[0] - a[0] > 1e-6) bface(g, [pt(a[0], BF - BREC, yw), pt(b[0], BF - BREC, yw), pt(b[0], BF - BREC, b[1]), pt(a[0], BF - BREC, a[1])], ON, BDARK); }
      g.pat = PAT[B.cut];
      if (arc) {
        // (the wedge stones round the arch — each under its own piece of it, a finger below; each its own shade, the keystone
        // prouder —, only those out of the water)
        const n = arc.n, ring = B.gap === 0 ? 0.22 : 0.2, len = 2 * arc.rr * Math.sin(arc.tm / n), ri = arc.rr * Math.cos(arc.tm / n) - 0.006; mk('aduela');
        for (let k = 0; k < n; k++) { const th = -arc.tm + 2 * arc.tm * (k + 0.5) / n, key = k === (n - 1) / 2; if (arc.cy + (arc.rr + ring) * Math.cos(th) < wf) continue;
          const c = pt(ac + ri * Math.sin(th), BF - (key ? 0 : 0.012), arc.cy + ri * Math.cos(th));
          g.put(SH.box, R3.mat(c[0], c[1], c[2], ry, len - 0.014, ring + (key ? 0.06 : 0), key ? 0.15 : 0.1, 0, th), tone(B.gap === 0 ? light : stone, (key ? 1.0 : 0.86) + hs(60 + s * 16 + k) * 0.16)); }
      } else for (const q of gaps) { // (a lintel over each gap)
        mk('verga'); let a0 = q[0][0], a1 = q[q.length - 1][0], yl = yw; for (const p of q) yl = Math.max(yl, p[1]); if (B.gap === 4) { a0 = ac - 0.55; a1 = ac + 0.55; }
        box(a0 - 0.16, a1 + 0.16, BF - 0.06, BF + 0.035, yl - 0.008, yl + (B.gap === 4 ? 0.2 : B.gap === 3 ? 0.16 : 0.14), tone(light, 0.94 + hs(70 + s) * 0.08)); }
      // (a pilaster where the wall goes on over a pier into the next tile)
      g.pat = PAT[B.pat]; mk('pilar');
      if (e[0] === 0) box(-2, -1.7, BF - 0.02, BF + 0.045, yb, yt, tone(stone, 0.94)); if (e[1] === 0) box(1.7, 2, BF - 0.02, BF + 0.045, yb, yt, tone(stone, 0.94));
      // (a corner left open: the deck only, out to the tile's own corner — the way goes over it)
      for (const [a0, a1] of [e[0] === 3 ? [-2, A0] : null, e[1] === 3 ? [A1, 2] : null].filter(Boolean)) { box(a0, a1, BF - BT, 2, yb, dk - 0.012, dark); const p = pt(a0, BF - BT, 0), q = pt(a1, 2, 0);
        g.pat = PAT.slab; deckTop(g, Math.min(p[0], q[0]) / TL, Math.min(p[2], q[2]) / TL, Math.max(p[0], q[0]) / TL, Math.max(p[2], q[2]) / TL, dk, paving); g.pat = PAT[B.pat]; }
      // ---- what crowns the wall
      mk('capa'); g.pat = PAT[B.cap];
      if (B.gap === 2) {
        // (Egypt's: a roll along the wall's head and, over it, the cavetto leaning out to its fillet)
        bar(SH.cyl, A0, yt + 0.055, A1, yt + 0.055, BF - 0.015, 0.13, 0.13, tone(light, 0.96));
        const C = [[0, 0.11], [0.02, 0.21], [0.065, 0.3], [0.14, 0.36], [0.14, 0.44]]; // (out of the wall's face, up from its head)
        for (let k = 0; k + 1 < C.length; k++) bface(g, [pt(A0, BF + C[k][0], yt + C[k][1]), pt(A1, BF + C[k][0], yt + C[k][1]), pt(A1, BF + C[k + 1][0], yt + C[k + 1][1]), pt(A0, BF + C[k + 1][0], yt + C[k + 1][1])], [o[0] * 0.6, -0.4, o[1] * 0.6], k === 3 ? light : tone(light, 0.9 + k * 0.03));
        bface(g, [pt(A0, BF - BT - 0.03, top), pt(A1, BF - BT - 0.03, top), pt(A1, BF + 0.14, top), pt(A0, BF + 0.14, top)], [0, 1, 0], light);
        bface(g, [pt(A0, BF - BT - 0.03, yt), pt(A1, BF - BT - 0.03, yt), pt(A1, BF - BT - 0.03, top), pt(A0, BF - BT - 0.03, top)], [-o[0], 0, -o[1]], tone(light, 0.94));
        bface(g, [pt(A0, BF - BT - 0.03, yt), pt(A1, BF - BT - 0.03, yt), pt(A1, BF - BT, yt), pt(A0, BF - BT, yt)], [0, -1, 0], dark);
        // (the people's own colour, a thread under the roll)
        g.pat = 0; if (P.trim) box(A0, A1, BF - 0.01, BF + 0.012, yt - 0.095, yt - 0.035, G.hex2rgb(P.trim));
      } else {
        const ov = B.gap === 3 ? 0.03 : B.gap === 4 ? 0.04 : 0.05; box(A0, A1, BF - BT - ov, BF + ov, yt, top, light);
        // (the Aztec's: the red and the turquoise of their houses, two threads round the cap's foot)
        if (B.gap === 3) { g.pat = 0;
          for (const [y0b, y1b, c] of [[yt - 0.11, yt - 0.07, P.trim || '#b33a2a'], [yt - 0.05, yt - 0.015, P.trim2 || '#2fae8f']]) for (const [d, n] of [[BF + 0.006, ON], [BF - BT - 0.006, [-o[0], 0, -o[1]]]])
            bface(g, [pt(A0, d, y0b), pt(A1, d, y0b), pt(A1, d, y1b), pt(A0, d, y1b)], n, G.hex2rgb(c)); }
      }
      // ---- its ends: a pier where it ends — at the bank, short of an open corner: a finger past the wall's end, their end
      // faces never one —, one at a corner for the two walls that meet there (the side that ends at it draws it)
      for (const [q, a] of [[e[0], A0], [e[1], A1]]) {
        if (q === 0 || (q === 2 && a < 0)) continue; const sg = a < 0 ? 1 : -1; mk('pilar');
        // (Egypt's stands out round the cavetto's end)
        // (a corner's pier, where the tile across the corner is a building, a wall or a cliff: inside the bridge's own tile, its cap
        // too — out past both sides it stood a hand inside the market#13618 by a bridge of the mega of the generation 21, L-794)
        const cap = B.gap === 3 ? 0.03 : 0.035, out0 = B.gap === 2 ? 0.16 : 0.06, out = q === 2 && pl.c[s] === 3 ? Math.min(out0, 1.995 - BF - cap) : out0;
        // (and cut on its outer side, never moved in: its inner faces stay where the walk passes by them — moved in, Egypt's broad
        // pier stood on the walk of a bridge at a corner by a building, 1,09 m over the feet, L-812)
        const w = (B.gap === 4 ? 0.44 : B.gap === 2 ? 0.6 : 0.52) - (out0 - out), a0 = q === 2 ? BF + out - w : sg > 0 ? a - 0.025 : a - w + 0.025, d0 = BF + out - w, hp = top + (B.gap === 2 ? 0.1 : 0.2);
        if (B.gap === 3) {
          // (the Aztec's ends in steps: two blocks, each a hand higher, each under its cap)
          for (let k = 0; k < 2; k++) { const b0 = q === 2 ? a0 : a0 + sg * k * 0.46, yk = top + (k ? 0.16 : 0.4); if (q === 2 && k) break;
            g.pat = PAT[B.pat]; box(b0, b0 + w, d0, BF + out, yb, yk, tone(stone, k ? 0.94 : 1)); g.pat = PAT[B.cap]; box(b0 - cap, b0 + w + cap, d0 - cap, BF + out + cap, yk, yk + 0.09, light); }
          continue;
        }
        g.pat = PAT[B.pat]; box(a0, a0 + w, d0, BF + out, yb, hp, tone(stone, 1.03));
        g.pat = PAT[B.cap]; box(a0 - cap, a0 + w + cap, d0 - cap, BF + out + cap, hp, hp + 0.09, light);
        if (B.gap === 0) { const c = pt(a0 + w / 2, d0 + w / 2, 0); g.put(SH.hip, R3.mat(c[0], hp + 0.09, c[2], 0, w, 0.17, w), tone(light, 0.95)); } // (Rome's: a low point on its cap)
      }
    }
    g.pat = 0;
  }
  // (a chunk's bridges: the near picture, or the far one)
  function roadGeo(x0, y0, w, h, far, marks) {
    const S = G.S; const g = new Geo(), memo = new Map();
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) { if (!W.inb(x, y)) continue; const i = y * N + x; if (S.type[i] === T.RIVER && S.road[i]) bridgeInto(g, x, y, bridgeOf(i, memo), far, marks); }
    return g.empty ? null : g.build(true);
  }
  // (for the proofs: a stretch's bridges as they are drawn, near or far, with the parts' marks; the whole bridge a tile is of;
  // a tile's sides)
  R3.bridgesOf = (x0, y0, w, h, far) => { if (!THREE) return null; const marks = []; return { geo: roadGeo(x0, y0, w, h, !!far, marks), marks }; };
  R3.bridgeOf = i => bridgeOf(i, null); R3.bridgePlan = (x, y) => bridgePlan(x, y);
  // ------------------------------ trees, rocks, bushes ------------------------------
  // the trees, the bushes, the stones and the near grass of each chunk: the forest's drawing (Arvore3D, js/arvore3d.js — 21a; the
  // stones stay in its plants' part until the relief takes them, 21b)

  // ------------------------------ chunks ------------------------------
  const chunks = new Map(); let NC = 0;
  const ckey = (cx, cy) => cy * 4096 + cx;
  function disposeGroup(grp) { if (!grp) return; grp.traverse(o => { if (o.geometry) o.geometry.dispose(); }); if (grp.parent) grp.parent.remove(grp); }
  function addMesh(grp, geo, mat, o) { if (!geo) return null; const m = new THREE.Mesh(geo, mat); if (o && o.cast) m.castShadow = true; if (o && o.recv) m.receiveShadow = true; if (o && o.order !== undefined) m.renderOrder = o.order; m.matrixAutoUpdate = false; grp.add(m); return m; }
  // (what makes a chunk need building again: the shape of its ground, its trees, its houses, its roads, its water — all of
  // it read inside the chunk: a house built across the map does not make this one be built again)
  function sigOf(cx, cy) {
    const S = G.S; let a = 0, b = 0, c = 0, brm = null;
    const x0 = cx * C, y0 = cy * C; const V = N + 1;
    for (let y = y0; y <= y0 + C && y <= N; y++) for (let x = x0; x <= x0 + C && x <= N; x++) a = (a * 31 + Math.round(S.H[y * V + x] * 8)) | 0;
    for (let y = y0; y < y0 + C && y < N; y++) for (let x = x0; x < x0 + C && x < N; x++) {
      const i = y * N + x;
      const tid = S.treeAt[i]; if (tid) { const t = S.trees.get(tid); if (t) b = (b * 31 + tid * 3 + (t.stage.charCodeAt(0)) + Math.floor(t.size * 4)) | 0; }
      const oid = S.objAt[i]; if (oid) { const bu = S.bushes.get(oid), rk = !bu && S.rocks.get(oid); b = (b * 17 + oid + (bu ? (bu.berries > 0 ? 1 : 0) + (bu.burnt > 0 ? 2 : 0) : 0) + (rk ? G.Space.stoneSize(rk) * 5 : 0)) | 0; }
      c = (c * 7 + S.road[i] + (S.burnt[i] > 0 ? 3 : 0) + (S.ice && S.ice[i] ? 5 : 0) + (S.dry && S.dry[i] ? 11 : 0) + S.wall[i] * 13 + S.occ[i] * 19 + S.type[i] * 23 + (S.cliff[i] ? 29 : 0)) | 0;
      if (S.type[i] === T.RIVER) { a = (a * 7 + Math.round(S.wl[i] * 8)) | 0; if (S.road[i]) c = (c * 31 + bridgeSig(i, (brm = brm || new Map()))) | 0; } // (a bridge: its people and its sides too)
    }
    b = (b * 3 + (R3.floraFine ? R3.floraFine(x0, y0, C) : 1)) | 0; // (the near plants finer where the body comes: the preset's lod — A3)
    const bs = G.Build3D ? G.Build3D.sig(x0, y0, C) : 0;
    return { a, b, c, d: bs, e: G.Geo3D ? G.Geo3D.sig(x0, y0, C) : 0 }; // (e: the carved faces and the mouths, their steps, the far grid — 21b)
  }
  const sameSig = (p, q) => p && q && p.a === q.a && p.b === q.b && p.c === q.c && p.d === q.d && p.e === q.e;
  function buildFar(ch) {
    disposeGroup(ch.far); const grp = new THREE.Group(); ch.far = grp; grp.matrixAutoUpdate = false;
    const x0 = ch.cx * C, y0 = ch.cy * C;
    addMesh(grp, terrainGeo(x0, y0, C, C, G.Geo3D ? G.Geo3D.farStep(x0, y0, C) : 2, { far: true }), MAT.land, { recv: false }); // (21b: finer where the relief is rough)
    const wg = waterGeo(x0, y0, C, C, true); G.Agua3D.hook(addMesh(grp, wg.water, MAT.water, { order: 2 })); addMesh(grp, wg.ice, MAT.ice); addMesh(grp, wg.falls, MAT.fall, { order: 2.5 });
    addMesh(grp, G.Arvore3D.geo(x0, y0, C, C, true).flora, MAT.flora);
    if (G.Build3D) addMesh(grp, G.Build3D.farGeo(x0, y0, C), MAT.solid);
    addMesh(grp, roadGeo(x0, y0, C, C, true), MAT.solid);
    scene.add(grp); grp.visible = !ch.near;
  }
  // a near picture is three parts, each made again only when what it shows has changed: the ground (terrain, water,
  // roads), the plants (trees, bushes, rocks, grass) and the buildings — a field ripening does not remake the hillside
  const PARTS = { ground: s => s.a + ':' + s.c + ':' + s.e, flora: s => s.a + ':' + s.b + ':' + s.c, build: s => s.c + ':' + s.d, geo: s => s.a + ':' + s.b + ':' + s.c + ':' + s.e }; // (e, geo: the carving, the stones and the formations, the mouths — 21b)
  function makePart(ch, part) {
    const x0 = ch.cx * C, y0 = ch.cy * C; const q = R3.Q(); const grp = new THREE.Group(); grp.matrixAutoUpdate = false;
    if (part === 'ground') {
      // (21b: the faces of cliff carved in their layers, by the Geo3D; the land's own picture leaves their tiles out)
      const G3 = G.Geo3D; const skip = G3 ? G3.skipOf(x0, y0, C) : null;
      const tg = terrainGeo(x0, y0, C, C, 0.5, { skip });
      addMesh(grp, skip ? G3.merge(tg, G3.carveGeo(x0, y0, C, G3.mouthsIn(x0 - 2, y0 - 2, C + 4).filter(m => m.carve))) : tg, MAT.land, { recv: true });
      const wg = waterGeo(x0, y0, C, C, false); G.Agua3D.hook(addMesh(grp, wg.water, MAT.water, { order: 2 })); addMesh(grp, wg.ice, MAT.ice, { recv: true }); addMesh(grp, wg.walls, MAT.wallWater, { order: 3 }); addMesh(grp, wg.falls, MAT.fall, { order: 2.5, recv: true });
      addMesh(grp, roadGeo(x0, y0, C, C, false), MAT.solid, { cast: true, recv: true });
    } else if (part === 'flora') {
      const fg = G.Arvore3D.geo(x0, y0, C, C, false); addMesh(grp, fg.flora, MAT.flora, { cast: true, recv: true }); addMesh(grp, fg.plants, MAT.plant, { cast: true, recv: true }); addMesh(grp, fg.leaves, MAT.leaf, { cast: true, recv: true });
      // (the near grass is the field of blades round the eye (Grass3D) where the machine carries it; the tufts otherwise)
      if (q.grass && !q.field) addMesh(grp, G.Arvore3D.grassGeo(x0, y0, C, C), MAT.plant, { recv: true });
    } else if (part === 'geo') { if (G.Geo3D) G.Geo3D.partInto(grp, x0, y0, C); // (21b)
    } else if (G.Build3D) { const bg = G.Build3D.nearGeo(x0, y0, C); addMesh(grp, bg.solid, MAT.solid, { cast: true, recv: true }); if (bg.glass) addMesh(grp, bg.glass, G.Build3D.glassMat()); addMesh(grp, bg.plants, MAT.plant, { recv: true }); addMesh(grp, bg.water, MAT.water, { order: 2 }); }
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
  // the beyond: the sea to the horizon, past the edge of the map (Agua3D — 21c)
  function makeOcean() { G.Agua3D.ocean(scene); }
  // (the water's material, for the water other drawings hold — a paddy, a fountain's bowl: WGeo quads or discs drawn with it)
  R3.waterMat = () => MAT.water;
  // (the chunks a building runs into past the chunk of its corner, which draws it whole: chunk → the chunks whose buildings reach
  // into it — a lot of 4 tiles or more: a smaller one runs a few metres past its chunk, the far figure of the chunk's edge. Made
  // again when a building comes or goes — the walk's version moves then, W.touchWalk — or the world is another)
  let spill = new Map(), spillKey = ''; G.worldHooks.push(() => { spill = new Map(); spillKey = ''; });
  function spillOf() {
    const S = G.S; const key = (S.walkVer || 0) + ':' + S.buildings.size; if (key === spillKey) return spill;
    spill = new Map(); spillKey = key;
    for (const b of S.buildings.values()) {
      if (Math.max(b.w, b.h) < 4) continue;
      const ox = Math.floor(b.x / C), oy = Math.floor(b.y / C), ex = Math.floor((b.x + b.w - 1) / C), ey = Math.floor((b.y + b.h - 1) / C);
      if (ex === ox && ey === oy) continue; const own = ckey(ox, oy);
      for (let cy = oy; cy <= ey; cy++) for (let cx = ox; cx <= ex; cx++) { if (cx === ox && cy === oy) continue; const k = ckey(cx, cy); let s = spill.get(k); if (!s) spill.set(k, s = new Set()); s.add(own); }
    }
    return spill;
  }
  R3.spillOf = () => spillOf(); // (for the proofs)
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
    // (a chunk near whose ground a building of another chunk stands — a monument of 10 or 13 tiles from the chunk of its corner —:
    // that chunk near too, as soon as this one, or the monument stood there as its far figure while its own stones were near the
    // body — and came up whole as the body walked on: on the light quality, the Colosseum beside the body)
    const sp = spillOf();
    if (sp.size) { const inW = new Set(want.map(w => ckey(w[1], w[2]))); for (let k = 0, n = want.length; k < n; k++) { const o = sp.get(ckey(want[k][1], want[k][2])); if (!o) continue;
      for (const ok of o) if (!inW.has(ok)) { inW.add(ok); want.push([want[k][0], ok % 4096, Math.floor(ok / 4096)]); } } }
    want.sort((a, b) => a[0] - b[0]);
    // (kept a little further than they are made: a body walking back and forth on a chunk's edge does not make and throw
    // away the same picture again and again)
    const keep = new Set(); const RK = (R + 1.5) * (R + 1.5);
    for (let dy = -R - 2; dy <= R + 2; dy++) for (let dx = -R - 2; dx <= R + 2; dx++) if (dx * dx + dy * dy <= RK) keep.add(ckey(ccx + dx, ccy + dy));
    if (sp.size) for (const k of [...keep]) { const o = sp.get(k); if (o) for (const ok of o) keep.add(ok); }
    const t0 = performance.now(); let n = 0;
    for (const [d2, cx, cy] of want) {
      const ch = chunks.get(ckey(cx, cy)); if (!ch) continue;
      if (!ch.near) { buildNear(ch); n++; }
      // (the ground round the body is looked at more often: a stone fallen beside it is under its feet at once — G.Space.stoneTop)
      else if (G.S.clock - ch.sigT > (d2 <= 2 ? 0.25 : 1.5)) { ch.sigT = G.S.clock; const s = sigOf(cx, cy); if (!sameSig(s, ch.sig)) { buildNear(ch, s); n++; } }
      if (performance.now() - t0 > budget && n) break;
    }
    // (and the near pictures kept beyond reach follow the world too, as slowly as the farther ones within it: kept as they were, a
    // house founded in one stood unbuilt in its picture, and a bank's water over its lot, while the body stayed away — the
    // house#21365 of the generation-17 metropole, founded at 84,84 two chunks from the body at the quay of Mênfis: «água desenhada
    // sobre a terra fora do lugar», e17)
    if (!(performance.now() - t0 > budget && n)) for (const k of keep) {
      const ch = chunks.get(k); if (!ch || !ch.near || G.S.clock - ch.sigT <= 1.5) continue;
      ch.sigT = G.S.clock; const s = sigOf(ch.cx, ch.cy); if (!sameSig(s, ch.sig)) { buildNear(ch, s); n++; }
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
  // (the light, the sky and the air are the sky's: G.Ceu says them — js/ceu.js, pure — and G.Ceu3D gives them to the drawing —
  // js/ceu3d.js: the lights, the dome, the stars, the uniforms of the air (GX) and the painter's light patched into three.js;
  // 21d, NATUREZA.md §8)
  // (for the verifier: the light of the hour is numbers in their range — the sky's own check —, and the bed the water reads is
  // the land's)
  R3.lightCheck = function () {
    const out = G.Ceu3D && G.Ceu3D.check ? G.Ceu3D.check() : []; if (!renderer || !R3.on) return out;
    const bc = R3.bedCheck(48); if (bc.bad > 2) out.push(`leito da água: ${bc.bad} de ${bc.n} pontos fora da altura do chão`);
    const wc = R3.waterCheck(); if (wc.bad) out.push(`água desenhada sobre a terra fora do lugar: ${wc.bad} de ${wc.n} (${wc.ex})`);
    return out;
  };
  // (for the verifier: the water laid over the land only where it dips under its face — Agua3D, 21c)
  R3.waterCheck = () => G.Agua3D.waterCheck();

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
    G.Ground3D.full(); // (the ground's picture as the world is now)
    canvas.style.display = 'block'; R3.on = true; resize();
  };
  R3.stop = function () {
    R3.on = false; if (!canvas) return;
    canvas.style.display = 'none'; canvas.style.opacity = 0;
    // (the near pictures are given back: the god's view does not carry them)
    for (const ch of chunks.values()) dropNear(ch);
    G.People3D && G.People3D.clear && G.People3D.clear();
    G.Dragon3D && G.Dragon3D.clear && G.Dragon3D.clear();
    G.Things3D && G.Things3D.clear && G.Things3D.clear();
    G.Build3D && G.Build3D.insideClear && G.Build3D.insideClear();
  };
  // a new world, or a save loaded: every picture of the old one goes
  G.worldHooks.push(() => { if (!renderer) return; for (const ch of chunks.values()) { disposeGroup(ch.far); disposeGroup(ch.near); } chunks.clear(); clist = []; R3.built = null; G.Agua3D.dropOcean(scene); G.People3D && G.People3D.clear && G.People3D.clear(); });
  R3.time = () => U.time.value; // (the view's own clock: what waves, beats and flickers)
  R3.setOpacity = o => { if (canvas) canvas.style.opacity = o; };
  // the depth of the world on the screen: the god's picture flattens heights (4 px a unit against 16 a tile); during
  // the descent the 3D world starts as flat as the god's picture and grows to its true relief (only seen)
  R3.setDepth = k => { if (scene) scene.scale.y = k; };
  R3.frame = function (rdt, focus, budget) {
    if (!R3.on || !renderer) return;
    U.time.value += rdt;
    // (the hour's light, the sky, the air; the sun's picture of the shadows round the focus: the sky's — ceu3d.js, 21d)
    const LK = G.Ceu3D.light(focus);
    // (the water: the key light on it, the sky's light on it, the bed under it)
    G.Agua3D.light(LK.key, LK.keyI, LK.sky, scene.scale.y); // (21c: the water's light and its pictures — js/agua3d.js)
    // (the wind of the world — the one wind, the sky's G.Ceu.wind — bends the plants; the body walking parts them)
    { const wd = G.Ceu.wind(); const ws = G.clamp(wd.s || 0, 0, 2); U.wind.value.set(wd.x * (0.35 + ws), wd.y * (0.35 + ws), ws); }
    if (focus) U.body.value.set(focus.X, focus.Y || 0, focus.Z, 1); else U.body.value.w = 0;
    G.Ground3D.tick(focus);
    // (the clouds' shadows move as the sky's clouds do; darker under a bright sun, none at night)
    G.Ground3D.clouds(0, 0, skyU.cover.value, 0); // (the clouds' shadows are the sky's now, on every material along the key light — ceu3d.js: gxLightAt —, not the land's own)
    if (focus) stream(focus.X, focus.Z, budget === undefined ? 6 : budget);
    G.Build3D && G.Build3D.insideTick && G.Build3D.insideTick(rdt, focus); // (the insides round the body: before the people who stand in them)
    G.People3D && G.People3D.update && G.People3D.update(rdt, focus);
    G.Things3D && G.Things3D.update && G.Things3D.update(rdt, focus); // (before the fire's drawing: it hands over its flames)
    G.FX3D && G.FX3D.update && G.FX3D.update(rdt, focus);
    G.Dragon3D && G.Dragon3D.update && G.Dragon3D.update(rdt, focus);
    G.Grass3D && G.Grass3D.update && G.Grass3D.update(rdt, focus, camera);
    G.Agua3D.frame(); // (21c: a new frame — the picture behind the water copied again, where the quality has it)
    // (the flames' lights' pictures of the shadows, in a pass of their own: only what stands in the insides casts — D-707)
    shadeInsides();
    // (with the eye in a room, the town only where it is seen through the room's openings: the rest is not drawn this frame — D-708)
    const hid = R3.portalCull ? portalCull() : null;
    if (!(G.Post3D && G.Post3D.render(scene, camera))) renderer.render(scene, camera); // (the post-processing, where the quality has it)
    if (hid) for (const g of hid) g.visible = true;
    R3.info = renderer.info;
    if (rdt > 0) R3.fps = R3.fps ? R3.fps * 0.95 + (1 / rdt) * 0.05 : 1 / rdt;
  };
  // the pictures of the shadows of the flames' lights that are due (D-707): drawn here, before the frame, in a scene of their own that
  // holds only the insides drawn and those lights — three.js's own pass takes every mesh that casts a shadow round a light, six times
  // (the whole town, and the bodies, whose picture of depth is the sun's only), and reads the eye's layers, not the light's —, the sun's
  // picture left as it is; the frame's own pass then leaves them alone (they keep their picture until they are due again)
  let shadeScene = null, shadeRT = null;
  function shadeInsides() {
    const F3 = G.FX3D; if (!F3 || !F3.shadeDue || !renderer.shadowMap.enabled) return; const due = F3.shadeDue(); if (!due.length) return;
    for (const l of due) l.userData.shDue = false;
    const grps = G.Build3D && G.Build3D.insideGroups ? G.Build3D.insideGroups() : []; if (!grps.length) return;
    if (!shadeScene) { shadeScene = new THREE.Scene(); shadeRT = new THREE.WebGLRenderTarget(1, 1); }
    const back = []; for (const o of grps.concat(due)) { const p = o.parent; back.push([o, p, p ? p.children.indexOf(o) : -1]); shadeScene.add(o); }
    for (const l of due) l.shadow.needsUpdate = true;
    const rt = renderer.getRenderTarget(); renderer.setRenderTarget(shadeRT); renderer.render(shadeScene, camera); renderer.setRenderTarget(rt);
    // (each back in its own place among its parent's: the order of the lights is the order of the masks — FX3D)
    for (const [o, p, k] of back) { shadeScene.remove(o); if (!p) continue; o.parent = p; if (k >= 0 && k <= p.children.length) p.children.splice(k, 0, o); else p.children.push(o); }
  }
  // the town cut by the openings of the room the eye is in (D-708): each chunk's pictures hidden for this frame where no opening — a
  // window, an open way or door, the court — lets the eye see any of it (the side planes of the pyramid from the eye through the
  // opening, and the opening's own plane); the chunk the eye is in always drawn. Only seen: the pictures shown again after the frame
  R3.portalCull = true; R3.culled = 0;
  const PL = [];
  function portalCull() {
    R3.culled = 0; const P = G.Build3D && G.Build3D.portals ? G.Build3D.portals(camera.position.x, camera.position.y, camera.position.z) : null; if (!P) return null;
    const c = camera.position; PL.length = 0;
    for (const q of P) { const m = [(q[0][0] + q[2][0]) / 2, (q[0][1] + q[2][1]) / 2, (q[0][2] + q[2][2]) / 2]; const pl = [];
      for (let k = 0; k < 4; k++) { const a = q[k], b = q[(k + 1) % 4]; const ux = a[0] - c.x, uy = a[1] - c.y, uz = a[2] - c.z, vx = b[0] - c.x, vy = b[1] - c.y, vz = b[2] - c.z;
        let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; let d = -(nx * c.x + ny * c.y + nz * c.z); if (nx * m[0] + ny * m[1] + nz * m[2] + d < 0) { nx = -nx; ny = -ny; nz = -nz; d = -d; } pl.push([nx, ny, nz, d]); }
      // (the opening's plane: what lies beyond it from the eye)
      { const ux = q[1][0] - q[0][0], uy = q[1][1] - q[0][1], uz = q[1][2] - q[0][2], vx = q[3][0] - q[0][0], vy = q[3][1] - q[0][1], vz = q[3][2] - q[0][2]; let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
        let d = -(nx * m[0] + ny * m[1] + nz * m[2]); if (nx * c.x + ny * c.y + nz * c.z + d > 0) { nx = -nx; ny = -ny; nz = -nz; d = -d; } pl.push([nx, ny, nz, d]); }
      PL.push(pl); }
    const TL = G.Space.TILE, S = C * TL; const out = []; const ccx = Math.floor(c.x / S), ccz = Math.floor(c.z / S);
    const seen = (x0, z0, x1, z1) => PL.some(pl => pl.every(([nx, ny, nz, d]) => { for (const x of [x0, x1]) for (const y of [-200, 900]) for (const z of [z0, z1]) if (nx * x + ny * y + nz * z + d >= 0) return true; return false; }));
    for (const ch of chunks.values()) { if (ch.cx === ccx && ch.cy === ccz) continue; const x0 = ch.cx * S, z0 = ch.cy * S; if (seen(x0, z0, x0 + S, z0 + S)) continue;
      for (const g of [ch.near, ch.far]) if (g && g.visible) { g.visible = false; out.push(g); } }
    R3.culled = out.length; return out;
  }
  // (what the GPU holds — counted by three.js when a geometry is first drawn — and what the scene holds right now, drawn or not)
  R3.memory = () => { if (!renderer) return null; const seen = new Set(); scene.traverse(o => { if (o.geometry) seen.add(o.geometry); }); return { geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures, calls: renderer.info.render.calls, tris: renderer.info.render.triangles, live: seen.size }; };
  R3.dropMesh = grp => disposeGroup(grp);
  // (the near picture of the chunk with a tile is looked at again next frame, not in a second and a half: a tree that
  // starts to fall is gone from it at once)
  R3.refreshAt = function (x, y) { const ch = chunks.get(ckey(Math.floor(x / C), Math.floor(y / C))); if (ch) ch.sigT = -1e9; };
  // (for the tests: a chunk's signature, read only)
  R3.sigOf = (cx, cy) => sigOf(cx, cy);
  R3.eachNear = fn => { for (const ch of chunks.values()) if (ch.parts) fn(ch.parts, ch); }; // (for the checks of what the near pictures hold: the water's, 21c)
  R3.chunkCount = () => ({ all: chunks.size, near: [...chunks.values()].filter(c => c.near).length });
  R3.nearAt = (cx, cy) => { const ch = chunks.get(ckey(cx, cy)); return !!(ch && ch.near); }; // (for the proofs: has the chunk its near picture)
  // (for the tests: the near picture of the chunk at a point — its terrain is the first mesh)
  R3.nearOf = (X, Z) => { const ch = chunks.get(ckey(Math.floor(X / G.Space.TILE / C), Math.floor(Z / G.Space.TILE / C))); if (!ch || !ch.near) return null; const out = []; ch.near.traverse(o => { if (o.isMesh) out.push(o); }); return out; };
})(window.G);
