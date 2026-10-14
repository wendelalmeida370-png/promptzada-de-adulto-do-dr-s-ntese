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
    baixa: { scale: 0.75, near: 2, shadows: 0, npcs: 18, grass: 0, view: 260, detail: 0, field: 0 },
    media: { scale: 1, near: 3, shadows: 1024, npcs: 36, grass: 1, view: 420, detail: 1, field: 20 },
    alta: { scale: 1, near: 4, shadows: 2048, npcs: 60, grass: 1, view: 640, detail: 1, field: 30 },
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
    constructor() { this.p = []; this.n = []; this.c = []; this.k = null; this.ao = null; this.pat = 0; this.q = null; this.sph = null; this.uv = null; }
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
        if (this.ao) { const f = 0.6 + 0.4 * G.clamp((Y - this.ao(X, Z)) / 2.6, 0, 1); this.c.push(q[0] * f, q[1] * f, q[2] * f); } else this.c.push(q[0], q[1], q[2]);
        if (sway || this.k) this._k(typeof sway === 'function' ? sway(y) : sway, 1);
        if (this.pat || this.q) this._q(1);
      }
    }
    // a raw triangle (three points, one colour each or one for all), with its own normal
    tri(a, b, c, ca, cb, cc) {
      const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
      const A = lin(ca), B = lin(cb || ca), Cc = lin(cc || ca);
      this.p.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); this.n.push(nx, ny, nz, nx, ny, nz, nx, ny, nz); this.c.push(A[0], A[1], A[2], B[0], B[1], B[2], Cc[0], Cc[1], Cc[2]);
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
  // (patched once into three.js' own pieces of shader, so every material of the 3D has it — the look of the god's drawing
  // and of a painted world like Breath of the Wild: a soft band from shade to light instead of a smooth fall; a rim of
  // sunlight on the edges that turn away from it; the far land going blue into the haze, the haze warmer toward the sun;
  // the colours kept a little richer after the tone curve)
  let toned = false;
  function toon() {
    if (toned) return; toned = true; const SC = THREE.ShaderChunk;
    SC.lights_lambert_pars_fragment = SC.lights_lambert_pars_fragment.replace('float dotNL = saturate( dot( geometryNormal, directLight.direction ) );', `float nl = dot( geometryNormal, directLight.direction );
	float dotNL = smoothstep( -0.06, 0.4, nl ) * 0.8 + saturate( nl ) * 0.2;
	#ifndef RIM
	#define RIM 0.14
	#endif
	float rimV = pow( 1.0 - saturate( dot( geometryNormal, geometryViewDir ) ), 4.0 ) * saturate( dot( -geometryViewDir, directLight.direction ) + 0.25 );
	reflectedLight.directDiffuse += directLight.color * material.diffuseColor * rimV * RIM;`);
    SC.fog_fragment = `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	vec3 fogC = fogColor;
	#if ( defined( LAMBERT ) || defined( PHONG ) ) && NUM_DIR_LIGHTS > 0
	{
		vec3 ray = normalize( -vViewPosition );
		float toSun = pow( saturate( dot( ray, directionalLights[ 0 ].direction ) ), 6.0 );
		vec3 sl = directionalLights[ 0 ].color; vec3 sc = sl / max( 0.001, max( sl.r, max( sl.g, sl.b ) ) );
		fogC = mix( fogColor, fogColor * 0.6 + sc * 0.4, toSun * 0.55 * step( 0.05, sl.r + sl.g + sl.b ) );
		float aer = smoothstep( fogNear * 0.3, fogFar * 1.1, vFogDepth );
		gl_FragColor.rgb = mix( gl_FragColor.rgb, gl_FragColor.rgb * vec3( 0.55, 0.62, 0.74 ) + fogC * 0.3, aer * 0.6 );
	}
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogC, fogFactor );
#endif`;
    SC.tonemapping_fragment = `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
	{ float lum = dot( gl_FragColor.rgb, vec3( 0.2126, 0.7152, 0.0722 ) ); gl_FragColor.rgb = max( mix( vec3( lum ), gl_FragColor.rgb, 1.1 ), 0.0 ); }
#endif`;
  }
  function init() {
    THREE = window.THREE; if (!THREE) throw new Error('three.js não carregou');
    toon();
    U.wind.value = new THREE.Vector3(); U.body.value = new THREE.Vector4(); U.sky.value = new THREE.Color(0xbfd8ea);
    G.Ground3D.init(THREE);
    R3._m = new THREE.Matrix4(); R3._m2 = new THREE.Matrix4(); R3._v = new THREE.Vector3(); R3._nm = new THREE.Matrix3();
    canvas = document.createElement('canvas'); canvas.id = 'game3d';
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;display:none;z-index:1;opacity:0;outline:none;';
    document.body.insertBefore(canvas, document.getElementById('game').nextSibling);
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false });
    // (the neutral curve keeps the colours the god's view paints: ACES would darken and wash them)
    renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1600);
    hemi = new THREE.HemisphereLight(0xcfe6ff, 0x5a5a3a, 1.2); scene.add(hemi);
    sun = new THREE.DirectionalLight(0xfff2dc, 2.4); sun.position.set(40, 80, 30); scene.add(sun); scene.add(sun.target);
    moonL = new THREE.DirectionalLight(0x8aa4ff, 0); scene.add(moonL);
    scene.fog = new THREE.Fog(0xbfd8ea, 120, 600);
    // the sky: a dome painted from the horizon up, the glow of the sun, the moon, and a layer of clouds drifting with the
    // world's wind — thin on a fair day, a grey ceiling in the rain (only seen: it reads the weather, it is not the weather)
    skyU = { top: { value: new THREE.Color(0x5a9ae0) }, hor: { value: new THREE.Color(0xcfe4f2) }, sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunCol: { value: new THREE.Color(0xfff0c0) }, night: { value: 0 },
      cover: { value: 0.3 }, cloudCol: { value: new THREE.Color(0xffffff) }, uT: U.time, uWind: U.wind, uNoise: { value: G.Ground3D.cloudNoise() } };
    skyMesh = new THREE.Mesh(new THREE.SphereGeometry(1400, 32, 16), new THREE.ShaderMaterial({
      uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
      vertexShader: 'varying vec3 vd; void main(){ vd = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `uniform vec3 top; uniform vec3 hor; uniform vec3 sunDir; uniform vec3 sunCol; uniform float night; uniform float cover; uniform vec3 cloudCol; uniform float uT; uniform vec3 uWind; uniform sampler2D uNoise; varying vec3 vd;
        void main(){
          vec3 d = normalize(vd); float h = d.y;
          vec3 c = mix(hor, top, pow(clamp(h, 0.0, 1.0), 0.48)); if (h < 0.0) c = mix(hor, hor * 0.72, clamp(-h * 4.0, 0.0, 1.0));
          float s = max(dot(d, sunDir), 0.0); float low = 1.0 - clamp(h * 2.5, 0.0, 1.0);
          c += sunCol * (pow(s, 900.0) * 3.0 + pow(s, 28.0) * 0.22 + pow(s, 5.0) * 0.1 * low) * (1.0 - night * 0.85);
          vec3 md = -sunDir; float m = max(dot(d, md), 0.0); c += vec3(0.85, 0.9, 1.0) * (pow(m, 1400.0) * 2.0 + pow(m, 60.0) * 0.05) * night;
          if (h > 0.0) {
            vec2 uv = d.xz / (h + 0.08) * 0.11 + uWind.xy * uT * 0.0016;
            float n = texture2D(uNoise, uv).r * 0.68 + texture2D(uNoise, uv * 3.1 + 0.37).g * 0.32;
            float cl = smoothstep(0.98 - cover, 1.18 - cover, n) * smoothstep(0.0, 0.22, h);
            float thick = smoothstep(0.98 - cover, 1.5 - cover, n);
            // (a cloud is lit on the side of the sun and grey in its own shade: denser toward the sun is darker here)
            float ns = texture2D(uNoise, uv + normalize(sunDir.xz + 1e-4) * 0.018).r * 0.68 + texture2D(uNoise, (uv + normalize(sunDir.xz + 1e-4) * 0.018) * 3.1 + 0.37).g * 0.32;
            float sh = clamp((ns - n) * 5.0, -0.5, 0.6);
            vec3 cc = cloudCol * (1.06 - thick * 0.3) * (1.0 - sh * 0.35) + sunCol * pow(s, 6.0) * 0.35 * (1.0 - night) + sunCol * max(0.0, -sh) * 0.25 * (1.0 - night);
            c = mix(c, cc, cl * 0.94);
          }
          gl_FragColor = vec4(c, 1.0); }`,
    }));
    skyMesh.renderOrder = -1; skyMesh.frustumCulled = false; scene.add(skyMesh);
    { const n = 700, p = new Float32Array(n * 3); for (let k = 0; k < n; k++) { const a = G.hash(k * 3 + 1) * TAU, e = Math.asin(G.hash(k * 7 + 2) * 0.95 + 0.04), r = 1300; p[k * 3] = Math.cos(a) * Math.cos(e) * r; p[k * 3 + 1] = Math.sin(e) * r; p[k * 3 + 2] = Math.sin(a) * Math.cos(e) * r; }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
      stars = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, fog: false, transparent: true, opacity: 0, depthWrite: false })); stars.frustumCulled = false; scene.add(stars); }
    // materials (shared by every chunk)
    // (the ground: painted tile by tile with the god's colours, by the Ground3D; its vertex colour is only the shade of
    // the hollows and of the foot of the walls)
    MAT.land = G.Ground3D.material();
    MAT.solid = new THREE.MeshLambertMaterial({ vertexColors: true });
    // the trees: crowns swaying with the wind (aK: how much each point moves), leaves speckled with light and shade
    MAT.flora = new THREE.MeshLambertMaterial({ vertexColors: true });
    MAT.flora.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, { uTime: U.time, uWind: U.wind, uDet: { value: G.Ground3D.detail() } });
      sh.vertexShader = 'attribute float aK; uniform float uTime; uniform vec3 uWind; varying vec3 vFP; varying float vFK;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        vec4 wq = modelMatrix * vec4(transformed, 1.0); vFP = wq.xyz; vFK = aK;
        float ph = uTime * (0.9 + uWind.z) + wq.x * 0.11 + wq.z * 0.07;
        transformed.xz += uWind.xy * (sin(ph) * 0.6 + sin(ph * 2.7 + 1.3) * 0.25 + 0.3) * aK * (0.25 + uWind.z * 0.6);`);
      sh.fragmentShader = 'uniform sampler2D uDet; varying vec3 vFP; varying float vFK;\n' + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
        #ifndef NOPAT
        if (vFK > 0.07) { float lf = texture2D(uDet, (vFP.xz + vFP.y * 0.73) / 1.3).r * 0.6 + texture2D(uDet, (vFP.zy + vFP.x * 0.4) / 1.1).r * 0.4; diffuseColor.rgb *= 0.78 + lf * 0.44; }
        #endif`);
    };
    // the leaves at the edge of the crowns: a picture of a cluster of small leaves with gaps between them (dabbed as a painter
    // does a tree), swaying with the crown
    { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d');
      for (let k = 0; k < 24; k++) { const a = G.hash(k * 7 + 3) * TAU, r = Math.sqrt(G.hash(k * 13 + 5)) * 23; const l = 7 + G.hash(k * 3) * 5; const v = 205 + (k % 4) * 16;
        c.save(); c.translate(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); c.rotate(a + G.hash(k) * 1.2); c.fillStyle = `rgb(${v},${v},${v})`; c.beginPath(); c.ellipse(0, 0, l, l * 0.42, 0, 0, TAU); c.fill(); c.restore(); }
      const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
      MAT.leaf = new THREE.MeshLambertMaterial({ map: tx, alphaTest: 0.5, side: THREE.DoubleSide, vertexColors: true }); MAT.leaf.defines = { RIM: 0.28 };
      MAT.leaf.onBeforeCompile = sh => {
        Object.assign(sh.uniforms, { uTime: U.time, uWind: U.wind });
        sh.vertexShader = 'attribute float aK; uniform float uTime; uniform vec3 uWind;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
          vec4 wq = modelMatrix * vec4(transformed, 1.0);
          float ph = uTime * (0.9 + uWind.z) + wq.x * 0.11 + wq.z * 0.07;
          transformed.xz += uWind.xy * (sin(ph) * 0.6 + sin(ph * 2.7 + 1.3) * 0.25 + 0.3) * aK * (0.25 + uWind.z * 0.6) + vec2(sin(uTime * 3.1 + wq.y * 2.0), cos(uTime * 2.7 + wq.x)) * 0.04 * aK;`);
      };
    }
    // the plants that bend: grass, crops, reeds — swaying with the world's wind, parting round the body that walks in them
    MAT.plant = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
    MAT.plant.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, { uTime: U.time, uWind: U.wind, uBody: U.body });
      sh.vertexShader = 'attribute float aK; uniform float uTime; uniform vec3 uWind; uniform vec4 uBody;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        vec4 wq = modelMatrix * vec4(transformed, 1.0);
        float ph = uTime * (1.5 + uWind.z * 1.5) + wq.x * 0.37 + wq.z * 0.23;
        float sw = (sin(ph) * 0.55 + sin(ph * 2.3 + 1.7) * 0.22 + 0.4) * aK;
        transformed.xz += uWind.xy * sw * (0.12 + uWind.z * 0.35);
        vec2 dv = wq.xz - uBody.xz; float dd = length(dv); float pr = aK * uBody.w * (1.0 - smoothstep(0.25, 1.4, dd));
        transformed.xz += dv / max(dd, 0.001) * pr * 0.5; transformed.y -= pr * 0.22;`);
      // (a blade is lit the same on both faces: three.js turns the normal of a back face round; here it is turned back)
      sh.fragmentShader = sh.fragmentShader.replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n normal = normal * faceDirection;');
    };
    // water: the waves the god's view draws, in light — trains of waves running with the wind (long swells on the open sea,
    // a chop on the rivers, calm against the shore), the sky in it (pale at the horizon, deep blue above, as the angle asks),
    // the sun glittering on the slopes of the waves, the crests lit through, the shallows clear and the deep dark, foam where
    // it meets the land and on the crests when the wind blows hard
    MAT.water = new THREE.MeshPhongMaterial({ vertexColors: true, transparent: true, opacity: 1, shininess: 60, specular: 0x1c2228, depthWrite: false });
    MAT.water.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, { uTime: U.time, uSky: U.sky, uSkyTop: skyU.top, uSkyHor: skyU.hor, uSunDir: skyU.sunDir, uSunCol: skyU.sunCol, uNight: skyU.night, uDet: { value: G.Ground3D.detail() }, uWind: U.wind, uSeaY: { value: G.SEA * G.Space.HM } });
      sh.vertexShader = 'uniform float uTime; uniform vec3 uWind; uniform float uSeaY; attribute float aShore; varying float vShore; varying vec3 vWW;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        vec4 wp = modelMatrix * vec4(position, 1.0); float sea = 1.0 - step(0.15, abs(wp.y - uSeaY));
        float sw = (0.35 + uWind.z * 0.5) * (1.0 - aShore * 0.75) * mix(0.3, 1.0, sea);
        transformed.y += (sin(wp.x * 0.33 + uTime * 1.3) * 0.06 + cos(wp.z * 0.29 + uTime * 1.05) * 0.05) + sin(dot(wp.xz, normalize(uWind.xy + vec2(0.001))) * 0.21 - uTime * 1.4) * 0.12 * sw;
        vShore = aShore; vWW = wp.xyz;`);
      sh.fragmentShader = 'uniform float uTime; uniform vec3 uSky; uniform vec3 uSkyTop; uniform vec3 uSkyHor; uniform vec3 uSunDir; uniform vec3 uSunCol; uniform float uNight; uniform sampler2D uDet; uniform vec3 uWind; uniform float uSeaY; varying float vShore; varying vec3 vWW;\n' + sh.fragmentShader
        .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        // (four trains of waves: their slopes summed, steeper with the wind, flatter on the rivers and against the land)
        vec2 wq = vWW.xz; float isSea = 1.0 - step(0.15, abs(vWW.y - uSeaY));
        vec2 wd = normalize(uWind.xy + vec2(0.001)); float ws = clamp(uWind.z, 0.0, 2.0);
        float calm = mix(0.4, 1.0, isSea) * (1.0 - vShore * 0.55) * (0.65 + ws * 0.35);
        vec2 gw = vec2(0.0); float hw = 0.0;
        for (int i = 0; i < 4; i++) {
          float fi = float(i); float an = (fi - 1.5) * 0.55 + fi * 0.37; vec2 d = vec2(wd.x * cos(an) - wd.y * sin(an), wd.x * sin(an) + wd.y * cos(an));
          float L = 11.0 / (1.0 + fi * 1.15); float k = 6.2832 / L; float A = 0.05 * L / 6.0;
          float ph = dot(d, wq) * k - uTime * sqrt(9.8 * k) * 0.85 + fi * 1.7; float c = cos(ph);
          hw += A * sin(ph); gw += d * (A * k * c);
        }
        vec2 dr = wd * 0.07 + vec2(0.012, 0.008);
        float r1 = texture2D(uDet, wq / 11.0 + dr * uTime).r, r2 = texture2D(uDet, wq / 6.5 - dr.yx * uTime * 1.3).r;
        float r3 = texture2D(uDet, (wq + 0.2) / 11.0 + dr * uTime).r, r4 = texture2D(uDet, (wq + vec2(0.0, 0.2)) / 6.5 - dr.yx * uTime * 1.3).r;
        // (far off the small ripples blur into one sheen: only the long waves are seen, no glitter of noise)
        float wnear = 1.0 - smoothstep(22.0, 130.0, length(cameraPosition - vWW));
        gw = gw * calm * mix(0.45, 1.0, wnear) + vec2(r3 - r1, r4 - r2) * 0.7 * wnear;
        vec3 nW = normalize(vec3(-gw.x, 1.0, -gw.y));
        normal = normalize((viewMatrix * vec4(nW, 0.0)).xyz);`)
        .replace('#include <opaque_fragment>', `
        // (water takes little of the sun's light on itself: its colour is the depth's, lit softly, and what it reflects)
        vec3 sd0 = normalize(uSunDir); float day0 = (1.0 - uNight) * step(0.0, sd0.y);
        outgoingLight = mix(outgoingLight, diffuseColor.rgb * (0.34 + 0.46 * day0 * clamp(sd0.y * 1.4, 0.0, 1.0)) + totalEmissiveRadiance, 0.75);
        // (the sky in the water: the reflected ray's height picks the colour — pale near the horizon, deep blue overhead)
        vec3 Vw = normalize(cameraPosition - vWW); vec3 Rw = reflect(-Vw, nW); float rel = clamp(Rw.y, 0.0, 1.0);
        vec3 skyR = mix(uSkyHor, uSkyTop, pow(rel, 0.55));
        float fr = 0.02 + 0.98 * pow(1.0 - clamp(dot(nW, Vw), 0.0, 1.0), 5.0);
        outgoingLight = mix(outgoingLight, skyR * 0.88, clamp(fr * 0.78, 0.0, 0.8)); diffuseColor.a = mix(diffuseColor.a, 1.0, fr * 0.65);
        // (the sun on the slopes of the waves: a hard glitter and a soft sheen around it; the crests lit from within)
        vec3 sd = normalize(uSunDir); float rs = max(dot(Rw, sd), 0.0);
        float day = (1.0 - uNight) * step(0.0, sd.y);
        outgoingLight += uSunCol * (pow(rs, 900.0) * 5.0 + pow(rs, 90.0) * 0.22) * day;
        outgoingLight += vec3(0.02, 0.09, 0.08) * smoothstep(-0.02, 0.05, hw) * isSea * day * (1.0 - vShore * 0.5);
        float fn = texture2D(uDet, vWW.xz / 5.0 + uTime * 0.01).g;
        float band = vShore + (fn - 0.5) * 0.55 + sin(uTime * 0.9 - vShore * 7.0 + fn * 3.0) * 0.08;
        float foam = smoothstep(0.76, 0.94, band) * (0.45 + fn * 0.55);
        // (whitecaps on the open sea when the wind blows)
        foam = max(foam, smoothstep(0.06, 0.1, hw + (fn - 0.5) * 0.05) * smoothstep(0.9, 1.6, ws) * isSea * 0.7);
        outgoingLight = mix(outgoingLight, vec3(0.9, 0.94, 0.96) * (0.55 + 0.45 * uSky), clamp(foam, 0.0, 0.8)); diffuseColor.a = max(diffuseColor.a, foam * 0.9);
        #include <opaque_fragment>`);
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
    G.Build3D && G.Build3D.dress && G.Build3D.dress(MAT.solid); // (the solid material learns the patterns of the walls and roofs)
    G.People3D && G.People3D.init && G.People3D.init(THREE, R3);
    G.FX3D && G.FX3D.init && G.FX3D.init(THREE, R3);
    G.Dragon3D && G.Dragon3D.init && G.Dragon3D.init(THREE, R3);
    G.Things3D && G.Things3D.init && G.Things3D.init(THREE, R3);
    G.Grass3D && G.Grass3D.init && G.Grass3D.init(THREE, R3);
  }
  function applyQuality() {
    const q = R3.Q();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2) * q.scale);
    renderer.shadowMap.enabled = !!q.shadows; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    sun.castShadow = !!q.shadows;
    if (q.shadows) { sun.shadow.mapSize.set(q.shadows, q.shadows); const c = sun.shadow.camera; c.left = -45; c.right = 45; c.top = 45; c.bottom = -45; c.near = 1; c.far = 260; c.updateProjectionMatrix(); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.04; if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
    // (the patterns of walls and roofs and the speckle of the leaves only where the machine carries the ground's grain too)
    for (const m of [MAT.solid, MAT.flora]) if (m) m.defines = q.detail === 0 ? { NOPAT: 1 } : {};
    for (const m of [MAT.land, MAT.solid, MAT.flora, MAT.plant]) if (m) m.needsUpdate = true;
    G.Ground3D.quality();
    resize();
  }
  function resize() { if (!renderer) return; const w = window.innerWidth, h = window.innerHeight; renderer.setSize(w, h, false); camera.aspect = w / Math.max(1, h); camera.updateProjectionMatrix(); }

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
  function terrainGeo(x0, y0, w, h, step) {
    const TL = G.Space.TILE, HM = G.Space.HM; const gw = Math.round(w / step) + 1, gh = Math.round(h / step) + 1;
    const pos = new Float32Array(gw * gh * 3), nor = new Float32Array(gw * gh * 3), colr = new Float32Array(gw * gh * 3); const nn = [0, 0, 0];
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
      const x = Math.min(N, x0 + i * step), y = Math.min(N, y0 + j * step); const k = (j * gw + i) * 3;
      pos[k] = x * TL; pos[k + 1] = W.hAt(x, y) * HM - (step > 1 ? 0.3 : G.Space.bedDrop(x, y)); pos[k + 2] = y * TL; // (the far picture a little low: a crack at its edge shows ground, not sky; near, the beds of the rivers under their water)
      normalAt(x, y, nn); nor[k] = nn[0]; nor[k + 1] = nn[1]; nor[k + 2] = nn[2];
      const sh = step < 1 ? shadeAt(x, y) : 1; colr[k] = colr[k + 1] = colr[k + 2] = sh * sh; // (a shade, so linear)
    }
    const idx = []; for (let j = 0; j < gh - 1; j++) for (let i = 0; i < gw - 1; i++) { const a = j * gw + i, b = a + 1, c = a + gw, d = c + 1; idx.push(a, c, b, b, c, d); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.BufferAttribute(colr, 3)); g.setIndex(idx); g.computeBoundingSphere();
    return g;
  }
  // water: the sea at its level, every river and lake at its own; the ice of a sudden winter; the walls of a parted sea
  const WATER = [[96, 200, 204], [60, 166, 192], [36, 124, 172], [24, 90, 146], [18, 66, 120]]; // (clear and green over the sand, deep blue far out)
  const waterCol = d => { const k = G.clamp(d / 1.6, 0, 3.999); const a = WATER[Math.floor(k)], b = WATER[Math.min(4, Math.floor(k) + 1)]; return G.lerpColor(a, b, k - Math.floor(k)); };
  // (a water surface: its colour and clearness at each corner — the shallows let the bed show — and how near the land the
  // corner is, for the foam)
  class WGeo {
    constructor() { this.p = []; this.c = []; this.s = []; }
    quad(P, cols, al, sh) { for (const k of [0, 1, 2, 0, 2, 3]) { this.p.push(P[k][0], P[k][1], P[k][2]); const c = lin(cols[k]); this.c.push(c[0], c[1], c[2], al[k]); this.s.push(sh[k]); } }
    get empty() { return !this.p.length; }
    build() {
      const g = new THREE.BufferGeometry(); const n = this.p.length / 3; const nr = new Float32Array(n * 3); for (let k = 0; k < n; k++) nr[k * 3 + 1] = 1;
      g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nr, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 4)); g.setAttribute('aShore', new THREE.Float32BufferAttribute(this.s, 1));
      g.computeBoundingSphere(); return g;
    }
  }
  R3.WGeo = () => new WGeo();
  // (how far below the water a corner's bed is, and whether land touches it)
  function wetCorner(x, y, lvl, river) {
    const S = G.S; let d = 0, n = 0, land = 0;
    for (const [dx, dy] of [[-1, -1], [0, -1], [-1, 0], [0, 0]]) {
      const tx = x + dx, ty = y + dy; if (!W.inb(tx, ty)) continue; const i = ty * N + tx; const t = S.type[i];
      const wet = river ? t === T.RIVER || t <= T.SEA : t <= T.SEA && !(S.dry && S.dry[i]);
      if (!wet) { land = 1; continue; } d += lvl - W.tileH(i); n++;
    }
    return [n ? d / n : 0, land];
  }
  function waterGeo(x0, y0, w, h, far) {
    const S = G.S; const TL = G.Space.TILE, HM = G.Space.HM; const g = new WGeo(), ice = new Geo(), walls = new Geo();
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
        const C4 = [[x, y], [x, y + 1], [x + 1, y + 1], [x + 1, y]].map(([cx, cy]) => wetCorner(cx, cy, G.SEA, false));
        g.quad([[x * TL, sea, y * TL], [x * TL, sea, (y + 1) * TL], [(x + 1) * TL, sea, (y + 1) * TL], [(x + 1) * TL, sea, y * TL]],
          C4.map(c => waterCol(c[0])), C4.map(c => G.clamp(0.42 + c[0] * 0.3, 0.42, 0.93)), C4.map(c => c[1]));
      } else if (t === T.RIVER) {
        const wl = S.wl[i] * HM + 0.05;
        if (S.ice && S.ice[i]) { ice.quad([x * TL, wl + 0.05, y * TL], [x * TL, wl + 0.05, (y + 1) * TL], [(x + 1) * TL, wl + 0.05, (y + 1) * TL], [(x + 1) * TL, wl + 0.05, y * TL], '#dcecf6'); continue; }
        const dp = (S.wl[i] - W.tileH(i)) * 1.4 + (S.deep[i] ? 1.2 : 0); const c = waterCol(dp); const al = G.clamp(0.5 + dp * 0.25, 0.5, 0.9);
        const C4 = [[x, y], [x, y + 1], [x + 1, y + 1], [x + 1, y]].map(([cx, cy]) => wetCorner(cx, cy, S.wl[i], true)[1] * 0.85);
        g.quad([[x * TL, wl, y * TL], [x * TL, wl, (y + 1) * TL], [(x + 1) * TL, wl, (y + 1) * TL], [(x + 1) * TL, wl, y * TL]], [c, c, c, c], [al, al, al, al], C4);
      }
    }
    return { water: g.empty ? null : g.build(), ice: ice.empty ? null : ice.build(), walls: walls.empty ? null : walls.build() };
  }
  // the bridges: where a road crosses the water, a deck of planks (or of stone, on a paved road) on its beams and posts,
  // with a rail on each side (the road on land is painted on the ground by the Ground3D)
  function roadGeo(x0, y0, w, h) {
    const S = G.S; const TL = G.Space.TILE, HM = G.Space.HM; const g = new Geo();
    const isB = (x, y) => W.inb(x, y) && S.road[y * N + x] && S.type[y * N + x] === T.RIVER;
    const onRoad = (x, y) => W.inb(x, y) && S.road[y * N + x];
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
      if (!isB(x, y)) continue; const i = y * N + x; const r = S.road[i];
      const top = Math.max(W.hAt(x + 0.5, y + 0.5), S.wl[i]) * HM + 0.32;
      const alongX = onRoad(x - 1, y) || onRoad(x + 1, y) || !(onRoad(x, y - 1) || onRoad(x, y + 1));
      const X = (x + 0.5) * TL, Z = (y + 0.5) * TL; const ry = alongX ? 0 : Math.PI / 2; const stone = r >= 2;
      const deck = stone ? '#9a948a' : '#8a6a44', beam = stone ? '#7a756c' : '#5e4630';
      // (the deck in planks across the way, each a little different)
      const n = stone ? 1 : 8;
      for (let k = 0; k < n; k++) { const f = (k + 0.5) / n - 0.5; const v = stone ? 0 : (G.hash(i * 9 + k) - 0.5) * 18; const c = G.hex2rgb(deck).map(q => q + v);
        g.put(SH.box, R3.mat(X + (alongX ? f * TL : 0), top - 0.22, Z + (alongX ? 0 : f * TL), ry, stone ? TL : TL / n - 0.04, 0.22, 3.0), c); }
      for (const s of [-1, 1]) {
        const ox = alongX ? 0 : s * 1.55, oz = alongX ? s * 1.55 : 0;
        g.put(SH.box, R3.mat(X + ox, top - 0.5, Z + oz, ry, TL, 0.3, 0.3), beam);
        g.put(SH.box, R3.mat(X + ox, top, Z + oz, ry, TL, stone ? 0.75 : 0.1, stone ? 0.3 : 0.1), stone ? deck : beam);
        if (!stone) { g.put(SH.box, R3.mat(X + ox, top + 0.85, Z + oz, ry, TL, 0.12, 0.12), beam); for (const e of [-0.5, 0]) g.put(SH.box, R3.mat(X + ox + (alongX ? e * TL : 0), top - 0.1, Z + oz + (alongX ? 0 : e * TL), 0, 0.16, 1.05, 0.16), beam); }
        // (the posts down into the bed)
        const bed = W.tileH(i) * HM; g.put(SH.box, R3.mat(X + ox, bed - 0.3, Z + oz, 0, 0.32, top - bed, 0.32), beam);
      }
    }
    return g.empty ? null : g.build(true);
  }
  // ------------------------------ trees, rocks, bushes ------------------------------
  const KIND = {
    oak: ['round', '#4f8f36', '#6b4a2e'], apple: ['round', '#5a9a3a', '#6b4a2e', '#d23a2a'], mulberry: ['round', '#4a7f32', '#5a3e28', '#4a1a3a'], olive: ['round', '#8a9a6a', '#7a6a5a'],
    cacao: ['round', '#3f7a2c', '#5a3e28', '#c87a2a'], coffee: ['bush', '#356a2a', '#5a3e28', '#b82a2a'], pepper: ['bush', '#3f7a2c', '#5a3e28', '#c82a1a'],
    birch: ['round', '#8ab84a', '#e8e4d8'], willow: ['willow', '#7aa84a', '#6b5a3e'], pine: ['cone', '#2f6a3a', '#5a3e28'], snowpine: ['cone', '#2a5a3e', '#5a3e28', '#f4f8fc'],
    jungle: ['tall', '#2f7a2a', '#6b5038'], acacia: ['flat', '#7a9a3a', '#6b5038'], baobab: ['baobab', '#6a8a3a', '#9a8068'], cactus: ['cactus', '#5a8a3a'], incense: ['bush', '#8a9a5a', '#7a6a5a'],
    palm: ['palm', '#4a8a2a', '#8a6a44'], date: ['palm', '#5a8a3a', '#8a6a44', '#a8642a'], acai: ['palm', '#3f7a2a', '#6a5038', '#4a2a5a'], banana: ['banana', '#6aa83a', '#7a6a44', '#e8d04a'],
  };
  // the god's three tones of each crown: [base, dark, light] by kind and variant (art.js canopies)
  const TPAL = {
    oak: [['#4e8f3a', '#37692c', '#79b653'], ['#5b9d3e', '#3f7630', '#8fc75c'], ['#7c9b3a', '#5c7a2b', '#abc35b']],
    pine: [['#2f6e4a', '#224f36', '#4d9063'], ['#2c6a52', '#1f4d3c', '#4a8a6e'], ['#3a7445', '#2a5733', '#5b9660']],
    snowpine: [['#2e5e48', '#1f4234', '#4a7a60'], ['#2a5a4e', '#1c3e36', '#467666'], ['#35644a', '#244634', '#507e62']],
    birch: [['#8cc05a', '#679a3e', '#b4dc7a'], ['#9cc85a', '#76a23e', '#c4e27e'], ['#d0b44a', '#a88e30', '#e8d070']],
    jungle: [['#2f8a3a', '#1e6228', '#4fae4a'], ['#3a9440', '#246a2c', '#5cbc52'], ['#28803e', '#18582a', '#44a452']],
    acacia: [['#7a9a3a', '#5a7a28', '#9aba50'], ['#869e40', '#667e2c', '#a8c05a'], ['#8a9234', '#6a7226', '#aab04a']],
    willow: [['#6a8a42', '#4c6a30', '#8aa858'], ['#72904a', '#526e34', '#94b060'], ['#62823e', '#46642c', '#80a052']],
    apple: [['#5aa040', '#3e7a2e', '#88c860'], ['#64a646', '#447e30', '#94ce6a'], ['#58983c', '#3a722a', '#82be5a']],
    mulberry: [['#3e7e36', '#2a5a26', '#5e9e4a'], ['#448238', '#2e5e28', '#64a250'], ['#3a7632', '#285624', '#5a9646']],
  };
  const SNOW = [238, 244, 250];
  // (how much snow lies on a tile: where the land is cold enough that the god's view paints its ground white)
  const snowAt = i => (G.S.temp ? G.clamp((0.235 - G.S.temp[i] / 255) / 0.07, 0, 1) : 0);
  R3.snowAt = snowAt;
  function tpal(t) { const P = TPAL[t.kind]; if (P) return P[(t.v || 0) % 3].map(c => G.hex2rgb(c)); const b = G.hex2rgb((KIND[t.kind] || KIND.oak)[1]); return [b, [b[0] * 0.7, b[1] * 0.72, b[2] * 0.7], [Math.min(255, b[0] * 1.25 + 12), Math.min(255, b[1] * 1.22 + 12), Math.min(255, b[2] * 1.15 + 8)]]; }
  // (the colour of a point of a crown: dark under it and near its heart, the base on its sides, light on top; snow
  // resting on the upper faces where it is cold)
  const leafCol = (pal, snow, cx, cz, r) => (X, Y, Z, nx, ny) => {
    let c = ny < 0 ? G.lerpColor(pal[1], pal[0], (ny + 1)) : G.lerpColor(pal[0], pal[2], G.clamp(ny * 0.85, 0, 1) * 0.75);
    const inner = G.clamp(1 - Math.hypot(X - cx, Z - cz) / Math.max(0.5, r), 0, 1); c = G.lerpColor(c, pal[1], inner * 0.3 * (1 - Math.max(0, ny)));
    if (snow > 0 && ny > 0.3) c = G.lerpColor(c, SNOW, snow * G.clamp((ny - 0.3) / 0.35, 0, 1));
    return c;
  };
  // (where a tree's crown hangs, for the leaves it lets fall: [X, Y, Z, its radius, its colour 0..1], or null)
  R3.crownOf = function (t) {
    const k = KIND[t.kind] || KIND.oak; if (t.stage !== 'grow' || t.size < 0.35 || (k[0] !== 'round' && k[0] !== 'tall' && k[0] !== 'willow' && k[0] !== 'flat')) return null;
    const TL = G.Space.TILE, HM = G.Space.HM; const sz = G.clamp(t.size, 0.15, 1.4); const h = G.hash(t.id * 7); const tall = k[0] === 'tall' ? 1.35 : 1; const H = (5 + 7 * sz) * (0.85 + h * 0.3);
    const c = tpal(t)[0]; return [t.x * TL, W.groundH(t.x, t.y) * HM + H * 0.62 * tall, t.y * TL, (2.6 * sz + 0.8) * tall, [c[0] / 255, c[1] / 255, c[2] / 255]];
  };
  const barkCol = (bark, snow) => (X, Y, Z, nx, ny) => (snow > 0 && ny > 0.6 ? G.lerpColor(bark, SNOW, snow) : bark);
  // a tree of the world as it stands: the god's shapes and tones in the round — a crown of many lumps, faceted, lit from
  // above, swaying a little in the wind (its sway grows with height); pines in tiers; palms with drooping fronds; the
  // snow on top where the land is cold. gp: the plants that bend (fronds, hanging strands of a willow)
  function treeInto(g, t, gp, gl) {
    const TL = G.Space.TILE, HM = G.Space.HM;
    const X = t.x * TL, Z = t.y * TL, Y = W.groundH(t.x, t.y) * HM; const sz = G.clamp(t.size, 0.15, 1.4); const k = KIND[t.kind] || KIND.oak;
    const h = G.hash(t.id * 7); const rot = h * TAU; const s = 0.85 + h * 0.3;
    const snow = t.kind === 'snowpine' ? 0.85 : snowAt(W.idx(Math.floor(t.x), Math.floor(t.y))) * 0.85;
    const bark0 = G.hex2rgb(k[2] || '#6b4a2e');
    if (t.stage === 'stump') { g.put(SH.cyl, R3.mat(X, Y, Z, rot, 0.6, 0.45, 0.6), (X2, Y2, Z2, nx, ny) => (ny > 0.9 ? [214, 180, 128] : bark0)); return; }
    if (t.stage === 'fall' && !t._standing) return; // (a tree falling is drawn moving, by FX3D, until it lies)
    if (t.stage === 'log' || t.stage === 'fall') { g.put(SH.cyl, R3.mat(X, Y + 0.3, Z, rot, 0.5, 4.5 * sz, 0.5, 0, Math.PI / 2), (X2, Y2, Z2, nx, ny) => (Math.abs(ny) < 0.2 && Math.abs(nx) < 0.3 ? [214, 180, 128] : bark0)); return; }
    const burnt = t.stage === 'burnt';
    const pal = burnt ? [[42, 36, 32], [26, 22, 20], [58, 50, 44]] : tpal(t); const bark = burnt ? [30, 26, 24] : bark0;
    const H = (5 + 7 * sz) * s; // (a grown oak, 11 m; a sapling, a little more than a person)
    const bc = barkCol(bark, snow);
    const lump = (x, y, z, sx, sy, sz2, cr, sw) => g.put(SH.ico0, R3.mat(x, y, z, rot + x * 0.7 + z * 0.3, sx, sy, sz2), leafCol(pal, snow, X, Z, cr), sw);
    switch (k[0]) {
      case 'cone': {
        g.put(SH.cyl, R3.mat(X, Y, Z, rot, 0.45 * sz + 0.15, H * 0.3, 0.45 * sz + 0.15), bc);
        if (!burnt) for (let q = 0; q < 4; q++) {
          const w2 = (3.6 - q * 0.8) * sz + 0.6, y = Y + H * (0.2 + q * 0.17); g.sph = [X, Y + H * 0.45, Z, 0.45];
          g.put(SH.cone, R3.mat(X + Math.cos(rot + q) * 0.12, y, Z + Math.sin(rot + q) * 0.12, rot + q * 0.9, w2, H * 0.36, w2), leafCol(pal, snow, X, Z, w2 * 0.5), 0.08 + q * 0.05);
        }
        break;
      }
      case 'palm': case 'banana': {
        // (a trunk that leans and curves, in rings; fronds drooping from its top)
        const lean = (h - 0.5) * 0.5, segs = 4; let px = X, py = Y, pz = Z; const dx = Math.sin(rot), dz = Math.cos(rot);
        for (let q = 0; q < segs; q++) { const a = lean * (q + 1) / segs; const len = H * 0.85 / segs; g.put(SH.cyl, R3.mat(px, py, pz, rot, 0.36 - q * 0.03, len + 0.05, 0.36 - q * 0.03, a, 0), (X2, Y2, Z2, nx, ny) => G.lerpColor(bark, [bark[0] * 0.75, bark[1] * 0.75, bark[2] * 0.75], ((Y2 - Y) * 2.2) % 1 > 0.5 ? 1 : 0), q * 0.04); px += dx * Math.sin(a) * len; pz += dz * Math.sin(a) * len; py += Math.cos(a) * len; }
        if (!burnt) {
          const fl = (3.6 * sz + 1) * (t.kind === 'banana' ? 0.8 : 1); const nf = t.kind === 'banana' ? 6 : 9;
          for (let q = 0; q < nf; q++) {
            const a = q / nf * TAU + rot, cs = Math.cos(a), sn = Math.sin(a); const wd = t.kind === 'banana' ? 0.9 : 0.55;
            // (each frond in three pieces, rising a little, then falling)
            const P0 = [px, py, pz], P1 = [px + cs * fl * 0.35, py + 0.45, pz + sn * fl * 0.35], P2 = [px + cs * fl * 0.7, py + 0.1, pz + sn * fl * 0.7], P3 = [px + cs * fl, py - 0.9, pz + sn * fl];
            const c0 = pal[1], c1 = pal[0], c2 = pal[2];
            gp.blade(P0[0], P0[1], P0[2], wd * 0.6, a + Math.PI / 2, P1[0], P1[1], P1[2], c0, c1, 0.25);
            gp.blade(P1[0], P1[1], P1[2], wd, a + Math.PI / 2, P2[0], P2[1], P2[2], c1, c2, 0.4);
            gp.blade(P2[0], P2[1], P2[2], wd * 0.8, a + Math.PI / 2, P3[0], P3[1], P3[2], c2, c1, 0.6);
          }
          if (k[3]) for (let q = 0; q < 3; q++) g.put(SH.sph, R3.mat(px + Math.cos(q * 2.1) * 0.35, py - 0.5, pz + Math.sin(q * 2.1) * 0.35, 0, 0.5), k[3], 0.2);
        }
        break;
      }
      case 'cactus': {
        const c = (X2, Y2, Z2, nx, ny) => (ny > 0.7 ? G.lerpColor(pal[0], pal[2], 0.6) : G.lerpColor(pal[1], pal[0], 0.5 + nx * 0.3));
        const hh = 2.5 * sz + 0.8; g.put(SH.cyl, R3.mat(X, Y, Z, rot, 0.7, hh, 0.7), c); g.put(SH.sph, R3.mat(X, Y + hh, Z, 0, 0.7, 0.5, 0.7), c);
        for (const sd of [-1, 1]) { if ((t.v || 0) === (sd > 0 ? 1 : 2)) continue; const ax = X + Math.cos(rot) * 0.55 * sd, az = Z + Math.sin(rot) * 0.55 * sd, ay = Y + hh * (sd > 0 ? 0.42 : 0.32);
          g.put(SH.cyl, R3.mat(ax, ay, az, rot, 0.38, 0.4, 0.38, 0, sd * Math.PI / 2), c); g.put(SH.cyl, R3.mat(ax + Math.cos(rot) * 0.35 * sd, ay, az + Math.sin(rot) * 0.35 * sd, rot, 0.38, hh * 0.45, 0.38), c); }
        break;
      }
      case 'bush': {
        g.sph = [X, Y + 0.8, Z, 0.7];
        for (let q = 0; q < 4; q++) { const a = rot + q * 1.7, d = q ? 0.55 : 0; lump(X + Math.cos(a) * d, Y + 0.7 + (q ? 0 : 0.35), Z + Math.sin(a) * d, (2 * sz + 0.6) * (q ? 0.8 : 1), (1.6 * sz + 0.5) * (q ? 0.8 : 1), (2 * sz + 0.6) * (q ? 0.8 : 1), 1.4, 0.15); }
        if (k[3] && !burnt) for (let q = 0; q < 6; q++) g.put(SH.sph, R3.mat(X + Math.cos(q * 1.7) * 0.85, Y + 1.0 + (q % 2) * 0.4, Z + Math.sin(q * 1.7) * 0.85, 0, 0.2), k[3], 0.15);
        break;
      }
      case 'flat': {
        // (the acacia: a trunk that forks, an umbrella of flat lumps)
        g.put(SH.cyl, R3.mat(X, Y, Z, rot, 0.38, H * 0.45, 0.38), bc);
        for (const sd of [-1, 1]) g.put(SH.cyl, R3.mat(X, Y + H * 0.42, Z, rot, 0.22, H * 0.4, 0.22, 0, sd * 0.55), bc, 0.05);
        if (!burnt) { const R = 3.5 * sz + 0.6; g.sph = [X, Y + H * 0.7, Z, 0.6]; for (let q = 0; q < 6; q++) { const a = rot + q * 1.05, d = q ? R * 0.55 : 0; lump(X + Math.cos(a) * d, Y + H * 0.8 + (q ? -0.1 : 0.2), Z + Math.sin(a) * d, R * (q ? 0.9 : 1.1), 1.1, R * (q ? 0.9 : 1.1), R * 1.5, 0.22); } }
        break;
      }
      case 'baobab': {
        g.put(SH.cyl, R3.mat(X, Y, Z, rot, 2.2 * sz + 0.4, H * 0.62, 2.2 * sz + 0.4), bc);
        for (let q = 0; q < 5; q++) { const a = rot + q * 1.26; g.put(SH.cyl, R3.mat(X, Y + H * 0.58, Z, a, 0.3, H * 0.3, 0.3, 0.8, 0), bc, 0.05);
          if (!burnt) lump(X + Math.sin(a) * H * 0.22, Y + H * 0.8, Z + Math.cos(a) * H * 0.22, 2.2 * sz + 0.6, 1.2, 2.2 * sz + 0.6, 2, 0.2); }
        break;
      }
      case 'willow': {
        g.put(SH.cyl, R3.mat(X, Y, Z, rot, 0.55, H * 0.5, 0.55), bc);
        if (!burnt) {
          const R = 2.8 * sz + 0.9; g.sph = [X, Y + H * 0.6, Z, 0.7];
          for (let q = 0; q < 6; q++) { const a = rot + q * 1.05, d = q ? R * 0.5 : 0; lump(X + Math.cos(a) * d, Y + H * 0.6 + (q ? 0 : R * 0.3), Z + Math.sin(a) * d, R * 1.1, R * 0.8, R * 1.1, R, 0.25); }
          // (the hanging curtains of leaves)
          for (let q = 0; q < 22; q++) { const a = rot + q / 22 * TAU, d = R * (1.05 + G.hash(t.id + q) * 0.25), ty = Y + H * 0.55 + G.hash(t.id * 3 + q) * 0.8; const lx = X + Math.cos(a) * d, lz = Z + Math.sin(a) * d;
            gp.blade(lx, ty, lz, 0.32, a + Math.PI / 2, lx + Math.cos(a) * 0.2, ty - H * 0.38, lz + Math.sin(a) * 0.2, pal[0], pal[1], 0.7); }
        }
        break;
      }
      default: { // round crowns: oak, birch, the fruit trees, the tall trees of the forests of the south
        const tall = k[0] === 'tall' ? 1.35 : 1;
        const birch = t.kind === 'birch';
        g.put(SH.cyl, R3.mat(X, Y, Z, rot, 0.45 * sz + 0.15, H * 0.55 * tall, 0.45 * sz + 0.15), birch ? (X2, Y2, Z2, nx, ny) => (Math.floor((Y2 - Y) * 2.6 + h * 5) % 4 === 0 ? [46, 42, 38] : bark) : bc);
        // (two branches into the crown)
        for (const sd of [-1, 1]) g.put(SH.cyl, R3.mat(X, Y + H * 0.38 * tall, Z, rot + sd * 1.2, 0.18 * sz + 0.08, H * 0.28, 0.18 * sz + 0.08, 0.7, 0), bc, 0.05);
        if (!burnt) {
          const r = (2.6 * sz + 0.8) * tall; const cy = Y + H * 0.66 * tall; const n = birch ? 6 : 8;
          g.sph = [X, cy + r * 0.2, Z, 0.75];
          lump(X, cy + r * 0.55, Z, r * 1.25, r * 1.0, r * 1.25, r * 1.4, 0.3);
          for (let q = 0; q < n - 1; q++) {
            const a = rot + q * (TAU / (n - 1)) + G.hash(t.id + q) * 0.5, ring = q % 2 ? 0.62 : 0.78, up = q % 2 ? 0.25 : -0.15;
            const sc = r * (0.78 + G.hash(t.id * 5 + q) * 0.3) * (birch ? 0.8 : 1);
            lump(X + Math.cos(a) * r * ring, cy + r * up, Z + Math.sin(a) * r * ring, sc * 1.1, sc * 0.92 * (birch ? 1.2 : 1), sc * 1.1, r * 1.4, 0.22 + up * 0.1);
          }
          g.sph = null;
          // (and its edge of leaves)
          if (gl) { const lc = leafCol(pal, snow, X, Z, r * 1.4); for (let q = 0; q < (birch ? 12 : 16); q++) { const a = G.hash(t.id * 11 + q) * TAU, e = (G.hash(t.id * 17 + q * 3) - 0.3) * 1.5; const dx = Math.cos(a) * Math.cos(e), dy = Math.sin(e), dz = Math.sin(a) * Math.cos(e); const px = X + dx * r * 1.12, py = cy + r * 0.25 + dy * r * 0.95, pz = Z + dz * r * 1.12; gl.card(px, py, pz, r * 0.72, a, (G.hash(q + t.id) - 0.5) * 0.9, [dx, dy, dz], lc(px, py, pz, dx, dy, dz), 0.32); } }
          if (k[3] && t.fruit !== 0) for (let q = 0; q < 7; q++) { const a = rot + q * 0.9; g.put(SH.sph, R3.mat(X + Math.cos(a) * r * 0.95, cy - r * 0.1 + (q % 3) * 0.3, Z + Math.sin(a) * r * 0.95, 0, 0.32), k[3], 0.25); }
        }
      }
    }
    g.sph = null;
  }
  function floraGeo(x0, y0, w, h, far) {
    const S = G.S; const g = new Geo(), gp = new Geo(), gl = far || !R3.Q().detail ? null : new Geo(); const TL = G.Space.TILE, HM = G.Space.HM;
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
      if (!W.inb(x, y)) continue; const i = y * N + x;
      const tid = S.treeAt[i]; const t = tid && S.trees.get(tid);
      if (t) {
        if (far) { if (t.stage !== 'grow' || t.size < 0.3) continue; const k = KIND[t.kind] || KIND.oak; const H = 5 + 7 * t.size; const pal = tpal(t); g.put(k[0] === 'cone' ? SH.cone : SH.ico0, R3.mat(t.x * TL, W.groundH(t.x, t.y) * HM + (k[0] === 'cone' ? 0 : H * 0.6), t.y * TL, 0, k[0] === 'cone' ? 4 : 5.5 * t.size + 1.5, k[0] === 'cone' ? H : 4.5, k[0] === 'cone' ? 4 : 5.5 * t.size + 1.5), (X, Y, Z, nx, ny) => G.lerpColor(pal[1], pal[2], G.clamp(ny * 0.5 + 0.5, 0, 1) * 0.8)); }
        else treeInto(g, t, gp, gl);
      }
      if (far) continue;
      const oid = S.objAt[i]; if (!oid) continue;
      const r = S.rocks.get(oid);
      if (r) {
        // (a boulder: lit grey on top, darker below; moss in the wet lands, snow in the cold)
        const base = r.meteor ? [74, 58, 52] : [140, 134, 122];
        const cold = snowAt(i) > 0.4; const sty = G.Biome && G.Biome.style ? G.Biome.style(i) : 'grass'; const moss = sty === 'jungle' || sty === 'swamp' || sty === 'taiga';
        // (its faces softened a little in the light; a stone beside the big one, half sunk)
        g.sph = [r.x * TL, W.groundH(r.x, r.y) * HM, r.y * TL, 0.35];
        // (the shape is the Space's: the feet stand on these very faces)
        const [big, small] = G.Space.stones(r);
        if (small) g.put(SH.dode, R3.mat(small.X, small.Y, small.Z, small.ry, small.sx, small.sy, small.sz), base);
        g.put(SH.dode, R3.mat(big.X, big.Y, big.Z, big.ry, big.sx, big.sy, big.sz), (X, Y, Z, nx, ny) => { let c = G.lerpColor([base[0] * 0.6, base[1] * 0.6, base[2] * 0.62], base, G.clamp(ny * 0.6 + 0.5, 0, 1)); if (ny > 0.55) { if (cold) c = G.lerpColor(c, SNOW, 0.8); else if (moss) c = G.lerpColor(c, [90, 120, 60], 0.5); else if (sty === 'grass' && !r.meteor) c = G.lerpColor(c, [118, 150, 74], 0.32 * G.clamp((ny - 0.55) / 0.3, 0, 1)); } return c; });
        g.sph = null;
        continue;
      }
      const b = S.bushes.get(oid);
      if (b) {
        const X = b.x * TL, Z = b.y * TL, Y = W.groundH(b.x, b.y) * HM; const dead = b.burnt > 0; const pal = dead ? [[58, 48, 40], [40, 34, 28], [70, 60, 50]] : [[63, 122, 52], [42, 88, 36], [96, 156, 70]];
        g.sph = [X, Y + 0.5, Z, 0.7];
        for (let q = 0; q < 3; q++) { const a = G.hash(b.id) * TAU + q * 2.1, d = q ? 0.4 : 0; g.put(SH.ico0, R3.mat(X + Math.cos(a) * d, Y + 0.45 + (q ? 0 : 0.15), Z + Math.sin(a) * d, a, 1.3 - q * 0.15, 0.95, 1.3 - q * 0.15), leafCol(pal, 0, X, Z, 1), 0.12); }
        g.sph = null;
        if (b.berries > 0 && !dead) for (let q = 0; q < Math.min(6, b.berries); q++) g.put(SH.sph, R3.mat(X + Math.cos(q * 1.9) * 0.55, Y + 0.6 + (q % 2) * 0.25, Z + Math.sin(q * 1.9) * 0.55, 0, 0.16), '#c8283a', 0.12);
      }
    }
    return { flora: g.empty ? null : g.build(false, true), plants: gp.empty ? null : gp.build(), leaves: gl && !gl.empty ? gl.build(false, true) : null };
  }
  // a little grass and flowers on the open land near the body: only seen, the same tufts every time (the world's seed),
  // and of the land's own kind — short and green in the meadows, tall and golden in the savanna, reeds in the swamp,
  // sparse in the taiga, none on snow or dune
  // [tufts a tile, height (m), blades a tuft, tips: 0 green, 1 golden, 2 reeds]
  const GRASS = { grass: [7, 0.42, 4, 0], savanna: [8, 0.9, 5, 1], swamp: [6, 1.25, 4, 2], jungle: [8, 0.75, 5, 0], taiga: [3, 0.38, 3, 0], snow: null, dune: null };
  const FLOWER = ['#f2e46a', '#e86a8a', '#f4f4f0', '#9a7ae8', '#f29a4a'];
  function grassGeo(x0, y0, w, h) {
    const S = G.S; const g = new Geo(); const TL = G.Space.TILE, HM = G.Space.HM;
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
      if (!W.inb(x, y)) continue; const i = y * N + x; const t = S.type[i];
      if ((t !== T.GRASS && t !== T.MEADOW) || S.road[i] || S.occ[i] || S.cliff[i] || S.burnt[i] > 0 || S.scar[i] > 0 || G.pathLevel(S.wear[i]) >= 2) continue;
      const K = GRASS[G.Biome && G.Biome.style ? G.Biome.style(i) : 'grass']; if (!K || snowAt(i) > 0.45) continue;
      // (a worn tile keeps a little grass at its edges; a meadow has more, and flowers)
      const lv = G.pathLevel(S.wear[i]); const n = Math.round((K[0] + (t === T.MEADOW ? 3 : 0)) * (lv ? 0.4 : 1));
      const c = tileCol(i, x, y); const root = [c[0] * 0.62, c[1] * 0.72, c[2] * 0.55];
      for (let q = 0; q < n; q++) {
        const hx = G.hash(i * 13 + q * 7 + (S.seed | 0)), hz = G.hash(i * 17 + q * 11 + 3), hs = G.hash(i * 5 + q * 3 + 1);
        const px = (x + hx) * TL, pz = (y + hz) * TL; const Y = W.hAt(x + hx, y + hz) * HM - 0.02;
        const tip = K[3] === 1 ? G.lerpColor([205, 178, 96], [176, 160, 84], hs) : K[3] === 2 ? [110, 132, 70] : [Math.min(255, c[0] * 0.9 + 22), Math.min(255, c[1] * 1.12 + 12), c[2] * 0.78];
        const ht = K[1] * (0.6 + hs * 0.7);
        // (a tuft: blades fanning out from one root, each leaning its own way)
        for (let k = 0; k < K[2]; k++) {
          const a = hx * TAU + k * (TAU / K[2]) + hs, lean = 0.18 + G.hash(i * 3 + q * 5 + k) * 0.3; const hh = ht * (0.7 + G.hash(i + q * 7 + k * 3) * 0.5);
          const ox = Math.cos(a) * 0.05, oz = Math.sin(a) * 0.05;
          g.blade(px + ox, Y, pz + oz, K[3] === 2 ? 0.09 : 0.07, a + Math.PI / 2, px + ox + Math.cos(a) * hh * lean, Y + hh, pz + oz + Math.sin(a) * hh * lean, root, G.lerpColor(root, tip, 0.75 + k / K[2] * 0.25));
        }
        // (a flower on its stem, in the meadows and on the grass of spring)
        if (K[3] === 0 && hz > (t === T.MEADOW ? 0.55 : 0.86) && q < 3) {
          const fc = FLOWER[Math.floor(hx * 997) % FLOWER.length]; const fy = Y + ht * 1.15;
          g.blade(px, Y, pz, 0.03, hx * 3, px + 0.04, fy, pz, root, [90, 130, 60]);
          for (let k = 0; k < 3; k++) { const a = k * 2.1 + hx * 5; g.blade(px + 0.04, fy, pz, 0.09, a + Math.PI / 2, px + 0.04 + Math.cos(a) * 0.09, fy + 0.04, pz + Math.sin(a) * 0.09, fc, fc, 0.8); }
        }
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
      const oid = S.objAt[i]; if (oid) { const bu = S.bushes.get(oid), rk = !bu && S.rocks.get(oid); b = (b * 17 + oid + (bu ? (bu.berries > 0 ? 1 : 0) + (bu.burnt > 0 ? 2 : 0) : 0) + (rk ? G.Space.stoneSize(rk) * 5 : 0)) | 0; }
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
    addMesh(grp, floraGeo(x0, y0, C, C, true).flora, MAT.flora);
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
      addMesh(grp, roadGeo(x0, y0, C, C), MAT.solid, { cast: true, recv: true });
    } else if (part === 'flora') {
      const fg = floraGeo(x0, y0, C, C, false); addMesh(grp, fg.flora, MAT.flora, { cast: true, recv: true }); addMesh(grp, fg.plants, MAT.plant, { cast: true, recv: true }); addMesh(grp, fg.leaves, MAT.leaf, { cast: true, recv: true });
      // (the near grass is the field of blades round the eye (Grass3D) where the machine carries it; the tufts otherwise)
      if (q.grass && !q.field) addMesh(grp, grassGeo(x0, y0, C, C), MAT.plant, { recv: true });
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
  // the beyond: the sea to the horizon, past the edge of the map
  let ocean = null;
  function makeOcean() {
    if (ocean) { ocean.geometry.dispose(); scene.remove(ocean); }
    const L = G.Space.size(), E = 1400;
    const g = new THREE.PlaneGeometry(L + E * 2, L + E * 2, 1, 1); g.rotateX(-Math.PI / 2);
    const c = lin(WATER[4]); const nv = g.attributes.position.count; const cl = new Float32Array(nv * 4); for (let k = 0; k < cl.length; k += 4) { cl[k] = c[0]; cl[k + 1] = c[1]; cl[k + 2] = c[2]; cl[k + 3] = 0.94; }
    g.setAttribute('color', new THREE.BufferAttribute(cl, 4)); g.setAttribute('aShore', new THREE.BufferAttribute(new Float32Array(nv), 1));
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
    for (const [d2, cx, cy] of want) {
      const ch = chunks.get(ckey(cx, cy)); if (!ch) continue;
      if (!ch.near) { buildNear(ch); n++; }
      // (the ground round the body is looked at more often: a stone fallen beside it is under its feet at once — G.Space.stoneTop)
      else if (G.S.clock - ch.sigT > (d2 <= 2 ? 0.25 : 1.5)) { ch.sigT = G.S.clock; const s = sigOf(cx, cy); if (!sameSig(s, ch.sig)) { buildNear(ch, s); n++; } }
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
  let SKYB = null;
  function light() {
    if (!SKYB) SKYB = new THREE.Color(0.6, 0.75, 1.05);
    const S = G.S; const a = G.Render.ambient(); const night = G.clamp(G.Render.nightness(), 0, 1); const w = S.weather;
    const t = S.time; const dayK = G.clamp((t - 0.02) / 0.71, 0, 1); const el = Math.sin(dayK * Math.PI); // 0 at dawn and dusk, 1 at noon
    // (the sun climbs no higher than about 55°: the walls get their side of light and the shadows their length, as the
    // god's view shades a house — one face lit, one in shade)
    const az = dayK * Math.PI; const alt = Math.max(0.05, el) * 0.96;
    const sd = new THREE.Vector3(Math.cos(az) * Math.cos(alt), Math.sin(alt), 0.45 * Math.cos(alt) + 0.2).normalize();
    const am = [a[0] / 255, a[1] / 255, a[2] / 255];
    const rain = G.clamp(w.rain || 0, 0, 1), storm = G.clamp(w.storm || 0, 0, 1);
    skyU.sunDir.value.copy(night > 0.6 ? sd.clone().negate() : sd);
    // (a deep blue overhead and a pale, bright band at the horizon: the sky of a painted world)
    const top = new THREE.Color().setRGB(0.15 + 0.1 * am[0], 0.38 + 0.13 * am[1], 0.76 * am[2] + 0.14, THREE.SRGBColorSpace).multiplyScalar(1 - night * 0.84);
    const horC = new THREE.Color().setRGB(Math.min(1, am[0] * 0.8 + 0.07), Math.min(1, am[1] * 0.88 + 0.06), Math.min(1, am[2] * 0.95 + 0.05), THREE.SRGBColorSpace).multiplyScalar(1 - night * 0.7);
    // (dawn and dusk: the horizon warms)
    const warm = G.clamp(1 - el * 3, 0, 1) * (1 - night);
    horC.lerp(new THREE.Color(0xf0a070), warm * 0.45);
    // (rain greys the sky)
    const grey = new THREE.Color().setRGB(0.55, 0.58, 0.62).multiplyScalar(1 - night * 0.8);
    top.lerp(grey, rain * 0.75); horC.lerp(grey, rain * 0.55);
    skyU.top.value.copy(top); skyU.hor.value.copy(horC); skyU.night.value = night;
    skyU.sunCol.value.setRGB(1, 0.82 + el * 0.18, 0.55 + el * 0.45).multiplyScalar(1 - rain * 0.7);
    skyU.cover.value = G.clamp(0.36 + rain * 0.55 + storm * 0.2 + (S.clouds ? Math.min(0.15, S.clouds.length * 0.01) : 0), 0, 0.98);
    skyU.cloudCol.value.setRGB(am[0] * 0.98, am[1] * 0.98, am[2]).lerp(new THREE.Color(0.46, 0.48, 0.52), rain * 0.7).multiplyScalar(1 - night * 0.85);
    scene.fog.color.copy(horC); U.sky.value.copy(horC).lerp(top, 0.55);
    renderer.setClearColor(horC);
    sun.intensity = (0.5 + 2.6 * el) * (1 - night) * (1 - rain * 0.55);
    sun.color.setRGB(1, 0.84 + 0.16 * el, 0.66 + 0.34 * el).multiply(new THREE.Color(am[0], am[1], am[2]));
    hemi.intensity = (0.6 + 0.75 * (1 - night)) * (1 + rain * 0.2);
    // (the light of the sky in the shade is blue, as a painter has it; the ground's bounce warm)
    hemi.color.setRGB(am[0] * 0.75 + 0.2, am[1] * 0.82 + 0.15, am[2] * 0.9 + 0.12).lerp(SKYB, 0.35 * (1 - night) * (1 - rain * 0.6));
    moonL.intensity = night * 0.55;
    stars.material.opacity = G.clamp((night - 0.35) * 1.6, 0, 1) * (1 - rain);
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
  };
  // a new world, or a save loaded: every picture of the old one goes
  G.worldHooks.push(() => { if (!renderer) return; for (const ch of chunks.values()) { disposeGroup(ch.far); disposeGroup(ch.near); } chunks.clear(); clist = []; R3.built = null; if (ocean) { ocean.geometry.dispose(); scene.remove(ocean); ocean = null; } G.People3D && G.People3D.clear && G.People3D.clear(); });
  R3.time = () => U.time.value; // (the view's own clock: what waves, beats and flickers)
  R3.setOpacity = o => { if (canvas) canvas.style.opacity = o; };
  // the depth of the world on the screen: the god's picture flattens heights (4 px a unit against 16 a tile); during
  // the descent the 3D world starts as flat as the god's picture and grows to its true relief (only seen)
  R3.setDepth = k => { if (scene) scene.scale.y = k; };
  R3.frame = function (rdt, focus, budget) {
    if (!R3.on || !renderer) return;
    U.time.value += rdt;
    const sd = light();
    // (the wind of the world bends the plants; the body walking parts them)
    { const w = G.S.weather; const ws = G.clamp(w.windS || 0, 0, 2); U.wind.value.set(Math.cos(w.windA || 0) * (0.35 + ws), Math.sin(w.windA || 0) * (0.35 + ws), ws); }
    if (focus) U.body.value.set(focus.X, focus.Y || 0, focus.Z, 1); else U.body.value.w = 0;
    G.Ground3D.tick(focus);
    // (the clouds' shadows move as the sky's clouds do; darker under a bright sun, none at night)
    { const w = U.wind.value; const T = U.time.value; G.Ground3D.clouds(w.x * T * 0.0016 * 4.7, w.y * T * 0.0016 * 4.7, skyU.cover.value, G.clamp(sun.intensity / 3, 0, 1) * 0.3); }
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
    G.Things3D && G.Things3D.update && G.Things3D.update(rdt, focus); // (before the fire's drawing: it hands over its flames)
    G.FX3D && G.FX3D.update && G.FX3D.update(rdt, focus);
    G.Dragon3D && G.Dragon3D.update && G.Dragon3D.update(rdt, focus);
    G.Grass3D && G.Grass3D.update && G.Grass3D.update(rdt, focus, camera);
    renderer.render(scene, camera);
    R3.info = renderer.info;
    if (rdt > 0) R3.fps = R3.fps ? R3.fps * 0.95 + (1 / rdt) * 0.05 : 1 / rdt;
  };
  // (what the GPU holds — counted by three.js when a geometry is first drawn — and what the scene holds right now, drawn or not)
  R3.memory = () => { if (!renderer) return null; const seen = new Set(); scene.traverse(o => { if (o.geometry) seen.add(o.geometry); }); return { geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures, calls: renderer.info.render.calls, tris: renderer.info.render.triangles, live: seen.size }; };
  // (a single tree, standing, in its own geometry with its foot at the origin — for one that falls: FX3D turns it over)
  R3.treeMesh = function (t) {
    const g = new Geo(), gp = new Geo(), gl = R3.Q().detail ? new Geo() : null; const o = Object.assign({}, t, { stage: 'grow', _standing: 1 }); treeInto(g, o, gp, gl);
    const TL = G.Space.TILE, HM = G.Space.HM; const X = t.x * TL, Y = W.groundH(t.x, t.y) * HM, Z = t.y * TL;
    const grp = new THREE.Group();
    if (!g.empty) { const geo = g.build(false, true); geo.translate(-X, -Y, -Z); const m = new THREE.Mesh(geo, MAT.flora); m.castShadow = true; grp.add(m); }
    if (!gp.empty) { const geo = gp.build(); geo.translate(-X, -Y, -Z); const m = new THREE.Mesh(geo, MAT.plant); grp.add(m); }
    if (gl && !gl.empty) { const geo = gl.build(false, true); geo.translate(-X, -Y, -Z); const m = new THREE.Mesh(geo, MAT.leaf); m.castShadow = true; grp.add(m); }
    grp.position.set(X, Y, Z); scene.add(grp); return grp;
  };
  R3.dropMesh = grp => disposeGroup(grp);
  // (the near picture of the chunk with a tile is looked at again next frame, not in a second and a half: a tree that
  // starts to fall is gone from it at once)
  R3.refreshAt = function (x, y) { const ch = chunks.get(ckey(Math.floor(x / C), Math.floor(y / C))); if (ch) ch.sigT = -1e9; };
  // (for the tests: a chunk's signature, read only)
  R3.sigOf = (cx, cy) => sigOf(cx, cy);
  R3.chunkCount = () => ({ all: chunks.size, near: [...chunks.values()].filter(c => c.near).length });
  // (for the tests: the near picture of the chunk at a point — its terrain is the first mesh)
  R3.nearOf = (X, Z) => { const ch = chunks.get(ckey(Math.floor(X / G.Space.TILE / C), Math.floor(Z / G.Space.TILE / C))); if (!ch || !ch.near) return null; const out = []; ch.near.traverse(o => { if (o.isMesh) out.push(o); }); return out; };
})(window.G);
