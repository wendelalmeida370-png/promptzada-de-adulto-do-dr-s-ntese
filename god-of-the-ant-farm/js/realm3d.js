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
  // lights: how many of the nearest flames and lit windows light what is round them
  const QUAL = {
    baixa: { scale: 0.75, near: 2, shadows: 0, npcs: 18, grass: 0, view: 260, detail: 0, field: 0, sbox: 36, ao: 0, bloom: 0, lights: 1 },
    media: { scale: 1, near: 3, shadows: 1024, npcs: 36, grass: 1, view: 420, detail: 1, field: 20, sbox: 40, ao: 0, bloom: 0, lights: 2 },
    alta: { scale: 1, near: 4, shadows: 2048, npcs: 60, grass: 1, view: 640, detail: 1, field: 30, sbox: 52, ao: 1, bloom: 1, lights: 3 },
    ultra: { scale: 1, near: 5, shadows: 4096, npcs: 90, grass: 1, view: 900, detail: 1, field: 40, sbox: 68, ao: 2, bloom: 1, lights: 4 },
  };
  // (the presets in the order the menu shows them, with their names)
  R3.QNAMES = [['baixa', 'Leve'], ['media', 'Média'], ['alta', 'Alta'], ['ultra', 'Ultra']];
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
  let sun = null, hemi = null, skyMesh = null, skyU = null, stars = null;
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
  // sunlight on the edges that turn away from it; the air — the far land going blue into a haze that is the sky's own colour
  // at the horizon (warm toward the sun), a low mist over the water and in the hollows, thick at dawn; shadows that fade out
  // at the edge of the sun's picture instead of stopping on a line; the colours kept a little richer after the tone curve)
  // the air and the sky, the same for every material: three.js copies the uniforms of its own materials from its library,
  // a plain object by reference — so these few objects, set once a frame by light(), reach every material made after this
  // gxSunW: toward the sun · gxHor: the sky at the horizon · gxGlow: its glow toward the sun · gxBelt: the pink of the
  // dusk opposite it · gxAir: (haze k [1/m], mist at its base [1/m], mist falloff [1/m], mist base height [m]) ·
  // gxAir2: (haze start [m], the end of the view from, to [m], how blue the distance goes)
  const v4 = (x, y, z, w) => ({ value: { x, y, z, w } });
  const GX = { gxSunW: v4(0, 1, 0, 0), gxHor: v4(0.6, 0.7, 0.85, 0), gxGlow: v4(0, 0, 0, 0), gxBelt: v4(0, 0, 0, 0), gxAir: v4(0.003, 0.001, 0.11, 3), gxAir2: v4(0, 1250, 1520, 1) };
  R3.GX = GX;
  // (the haze of the horizon in a direction: shared by the sky's dome and the air in front of everything, so the far land
  // melts into exactly the sky behind it)
  const GXHAZE = `uniform vec3 gxSunW; uniform vec3 gxHor; uniform vec3 gxGlow; uniform vec3 gxBelt;
vec3 gxHaze( vec3 d ) {
	float cs = dot( d, gxSunW ); float s = max( cs, 0.0 ); float s2 = s * s; float s4 = s2 * s2; float s8 = s4 * s4; float a = max( - cs, 0.0 );
	return gxHor + gxGlow * ( s4 * 0.45 + s8 * s8 * 0.55 ) + gxBelt * a * a;
}`;
  // (the grade after the tone curve, the same here and in the post-processing's last pass)
  const GXGRADE = `vec3 gxGrade( vec3 c ) {
	float lum = dot( c, vec3( 0.2126, 0.7152, 0.0722 ) );
	// (a little richer in the middle tones, not in the lights: green stays moss, never neon)
	c = max( mix( vec3( lum ), c, 1.0 + 0.12 * ( 1.0 - smoothstep( 0.5, 0.95, lum ) ) ), 0.0 );
	// (a gentle S in the eye's own scale: the shade deeper, the light brighter — not washed out; the darks kept)
	vec3 cp = sqrt( c ); cp = mix( cp, cp * cp * ( 3.0 - 2.0 * cp ), 0.22 * smoothstep( 0.18, 0.5, cp ) ); c = cp * cp;
	// (the painter's split: the shadows a little cool, the lights a little warm)
	return c * mix( vec3( 0.96, 0.985, 1.04 ), vec3( 1.025, 1.0, 0.97 ), smoothstep( 0.04, 0.5, lum ) );
}`;
  R3.GLSL = { haze: GXHAZE, grade: GXGRADE };
  let toned = false;
  function toon() {
    if (toned) return; toned = true; const SC = THREE.ShaderChunk;
    // (each patch must find its place: a three.js that changed under it is said out loud, not drawn wrong in silence)
    const rep = (n, a, b) => { if (SC[n].indexOf(a) < 0) { console.warn('3D: o pedaço ' + n + ' do three.js mudou — luz incompleta'); return; } SC[n] = SC[n].replace(a, b); };
    rep('lights_lambert_pars_fragment', 'float dotNL = saturate( dot( geometryNormal, directLight.direction ) );', `float nl = dot( geometryNormal, directLight.direction );
	float dotNL = smoothstep( -0.06, 0.4, nl ) * 0.8 + saturate( nl ) * 0.2;
	#ifndef RIM
	#define RIM 0.14
	#endif
	float rimV = pow( 1.0 - saturate( dot( geometryNormal, geometryViewDir ) ), 4.0 ) * saturate( dot( -geometryViewDir, directLight.direction ) + 0.25 );
	reflectedLight.directDiffuse += directLight.color * material.diffuseColor * rimV * RIM;`);
    // (the sun's picture ends softly: near its edge the shadows thin out, so its border never shows as a line on the land)
    rep('shadowmap_pars_fragment', 'return mix( 1.0, shadow, shadowIntensity );', `vec2 se = abs( shadowCoord.xy * 2.0 - 1.0 );
		return mix( 1.0, shadow, shadowIntensity * ( 1.0 - smoothstep( 0.8, 0.97, max( se.x, se.y ) ) ) );`);
    // the air: where each point is in the world (for the mist, which lies low), carried to the fragment
    SC.fog_pars_vertex = `#ifdef USE_FOG
	varying float vFogDepth;
	varying vec3 vFogW;
#endif`;
    SC.fog_vertex = `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
	vFogW = cameraPosition + ( vec4( mvPosition.xyz, 0.0 ) * viewMatrix ).xyz;
#endif`;
    SC.fog_pars_fragment = `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	varying vec3 vFogW;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
	uniform vec4 gxAir; uniform vec4 gxAir2;
	${GXHAZE}
#endif`;
    // (the air is laid over the light itself, before the tone curve — the same in the picture drawn straight to the screen
    // and in the one the post-processing finishes: the haze and the sky meet in the same light)
    SC.fog_fragment = '';
    SC.tonemapping_pars_fragment += '\n' + GXGRADE;
    SC.tonemapping_fragment = `#ifdef USE_FOG
	{
		vec3 fr = vFogW - cameraPosition; float fl = length( fr ); vec3 fd = fr / max( fl, 1e-4 );
		float dl = max( fl - gxAir2.x, 0.0 );
		// (the haze of distance: nothing near, then more and more — and the low mist, thicker toward its base)
		float tau = dl * dl * gxAir.x * gxAir.x;
		float bd = clamp( gxAir.z * fr.y, -60.0, 60.0 ); float lk = abs( bd ) > 1e-3 ? ( 1.0 - exp( - bd ) ) / bd : 1.0 - 0.5 * bd;
		tau += gxAir.y * exp( - gxAir.z * ( cameraPosition.y - gxAir.w ) ) * dl * lk;
		// (the blue goes first: the far hills turn blue before they fade; at the very end of the view everything is haze)
		vec3 ff = 1.0 - exp( - tau * mix( vec3( 1.0 ), vec3( 0.8, 0.93, 1.12 ), gxAir2.w ) );
		ff = max( ff, vec3( smoothstep( gxAir2.y, gxAir2.z, fl ) ) );
		gl_FragColor.rgb = mix( gl_FragColor.rgb, gxHaze( normalize( vec3( fd.x, max( fd.y, 0.0 ) * 0.25, fd.z ) ) ), ff );
	}
#endif
#if defined( TONE_MAPPING )
	gl_FragColor.rgb = gxGrade( toneMapping( gl_FragColor.rgb ) );
#endif`;
    // (and every material three.js makes from its library from now on gets the air's uniforms — the same objects)
    for (const k in THREE.ShaderLib) { const u = THREE.ShaderLib[k].uniforms; if (u && u.fogColor) Object.assign(u, GX); }
    Object.assign(THREE.UniformsLib.fog, GX);
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
    // (the neutral curve keeps the colours the god's view paints: ACES would darken and wash them; the exposure follows the
    // hour — light(): the eye opens a little at dusk and at night, as ours does)
    renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0; renderer.outputColorSpace = THREE.SRGBColorSpace;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1600);
    // the light of the hour: the sky's (a hemisphere — the sky's own colour from above, the warm bounce of the land from
    // below) and one key light that casts the shadows: the sun by day, the moon by night (one light: every material pays
    // for each light it is lit by)
    hemi = new THREE.HemisphereLight(0xcfe6ff, 0x5a5a3a, 1); scene.add(hemi);
    sun = new THREE.DirectionalLight(0xfff2dc, 2.4); sun.position.set(40, 80, 30); scene.add(sun); scene.add(sun.target);
    scene.fog = new THREE.Fog(0xbfd8ea, 1250, 1520);
    // the sky: a dome painted from the haze of the horizon (the very colour the far land melts into) up to the deep colour
    // overhead, the glow round the sun, the pink of the dusk opposite it, the sun's disc and the moon's, the stars, and a
    // layer of clouds drifting with the world's wind — thin on a fair day, a grey ceiling in the rain, lit gold at sunset
    // (only seen: it reads the weather, it is not the weather). In the same light as everything (linear, the same tone curve)
    skyU = Object.assign({ top: { value: new THREE.Color(0x5a9ae0) }, hor: { value: new THREE.Color(0xcfe4f2) }, sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunCol: { value: new THREE.Color(0xfff0c0) }, night: { value: 0 },
      disc: { value: new THREE.Color(0) }, moonDir: { value: new THREE.Vector3(0, -1, 0) }, moonCol: { value: new THREE.Color(0) }, keyDir: { value: new THREE.Vector3(0, 1, 0) }, uStars: { value: 0 },
      cover: { value: 0.3 }, cloudCol: { value: new THREE.Color(0xffffff) }, cloudSh: { value: new THREE.Color(0x8890a0) }, uT: U.time, uWind: U.wind, uNoise: { value: G.Ground3D.cloudNoise() } }, GX);
    R3.skyU = skyU; // (the sky's colours, for what reflects it: the water, the windows — top, hor; sunDir/sunCol: the sun itself)
    skyMesh = new THREE.Mesh(new THREE.SphereGeometry(1400, 32, 16), new THREE.ShaderMaterial({
      uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
      vertexShader: 'varying vec3 vd; void main(){ vd = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `uniform vec3 top; uniform vec3 disc; uniform vec3 moonDir; uniform vec3 moonCol; uniform vec3 keyDir; uniform float uStars; uniform float cover; uniform vec3 cloudCol; uniform vec3 cloudSh; uniform float uT; uniform vec3 uWind; uniform sampler2D uNoise; varying vec3 vd;
        ${GXHAZE}
        float cloudN(vec2 uv) { return texture2D(uNoise, uv).r * 0.68 + texture2D(uNoise, uv * 3.1 + 0.37).g * 0.32; }
        void main(){
          vec3 d = normalize(vd); float h = d.y; float e = pow(max(h, 0.0), 0.42);
          // (from the haze of the horizon to the deep colour overhead: most of the change low down, where the air is thickest)
          vec3 hz = gxHaze(d); vec3 c = mix(hz, top, e);
          float cs = max(dot(d, gxSunW), 0.0);
          // (the bright sky round the sun reaches higher than the haze)
          c += gxGlow * (cs * cs * cs * cs * cs) * 0.3 * e * (1.0 - e * 0.6);
          // (under the horizon: the far haze over the sea, a little darker downward)
          if (h < 0.0) c = hz * (1.0 - min(-h * 2.0, 0.3));
          // (on a clear night, the faint river of the galaxy across the stars)
          if (uStars > 0.01 && h > 0.0) { float bd = dot(d, vec3(0.42, 0.56, 0.71)); float n = texture2D(uNoise, d.xz / (h + 0.4) * 0.6).r;
            c += vec3(0.5, 0.56, 0.75) * exp(-bd * bd * 30.0) * (0.35 + n * 0.9) * 0.028 * uStars * smoothstep(0.0, 0.25, h); }
          float cl = 0.0;
          if (h > 0.0) {
            vec2 uv = d.xz / (h + 0.08) * 0.11 + uWind.xy * uT * 0.0016;
            float n = cloudN(uv);
            cl = smoothstep(0.98 - cover, 1.18 - cover, n) * smoothstep(0.0, 0.22, h);
            float thick = smoothstep(0.98 - cover, 1.5 - cover, n);
            // (a cloud is lit on the side of the key light and grey in its own shade: denser toward the light is darker here;
            // its thin edges toward the sun shine — the silver lining, gold at sunset)
            float ns = cloudN(uv + normalize(keyDir.xz + 1e-4) * 0.018);
            float sh = clamp((ns - n) * 5.0 + thick * 0.45, 0.0, 1.0);
            vec3 cc = mix(cloudCol, cloudSh, sh) + gxGlow * pow(cs, 4.0) * 0.55 * (1.0 - thick);
            c = mix(c, cc, cl * 0.94);
          }
          // (the sun's disc, brighter than white — the glow of the higher qualities catches it — and the moon's with its halo;
          // both behind the clouds)
          c += disc * smoothstep(0.99955, 0.99975, cs) * (1.0 - cl);
          float cm = max(dot(d, moonDir), 0.0);
          c += moonCol * (smoothstep(0.99955, 0.99972, cm) + pow(cm, 300.0) * 0.05) * (1.0 - cl * 0.85);
          gl_FragColor = vec4(c, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          #ifdef TONE_MAPPING
          gl_FragColor.rgb += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0; // (no bands in the gradient)
          #endif
        }`,
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
    // the trees, the bushes and the stones: crowns swaying with the wind (aK: how much each point moves), leaves speckled with
    // light and shade; wood in its bark and stone in its grain once the pictures of the stack are in (wrapped from the sides
    // round a trunk, from all three round a boulder), moss on the tops of the stones of the wet lands, snow on the cold ones
    MAT.flora = new THREE.MeshLambertMaterial({ vertexColors: true });
    MAT.flora.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, { uTime: U.time, uWind: U.wind, uDet: { value: G.Ground3D.detail() } }, G.Ground3D.U3());
      sh.vertexShader = 'attribute float aK; uniform float uTime; uniform vec3 uWind; varying vec3 vFP; varying float vFK; varying vec3 vFN;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        vec4 wq = modelMatrix * vec4(transformed, 1.0); vFP = wq.xyz; vFK = aK; vFN = normalize(mat3(modelMatrix) * objectNormal);
        float sk = aK < -2.5 ? 0.0 : aK < -0.5 ? -aK - 1.0 : aK > 3.5 ? aK - 4.0 : aK > 1.5 ? aK - 2.0 : aK; // (a conifer's crown +4, a fruit +2)
        float ph = uTime * (0.9 + uWind.z) + wq.x * 0.11 + wq.z * 0.07;
        transformed.xz += uWind.xy * (sin(ph) * 0.6 + sin(ph * 2.7 + 1.3) * 0.25 + 0.3) * sk * (0.25 + uWind.z * 0.6);`);
      sh.fragmentShader = 'uniform sampler2D uDet; varying vec3 vFP; varying float vFK; varying vec3 vFN; float fHgt = 0.0; float fCrown = 0.0;\n' + sh.fragmentShader
        .replace('#include <common>', '#include <common>\n' + G.Ground3D.texGLSL() + `
        #ifdef M3_MOSS
        #define FMOSS M3_MOSS
        #define FMOSS_S M3S_MOSS
        #else
        #define FMOSS M3_GRASS
        #define FMOSS_S M3S_GRASS
        #endif
        #ifdef M3_CRAG
        #define FROCK M3_CRAG
        #define FROCK_S M3S_CRAG
        #else
        #define FROCK M3_ROCK
        #define FROCK_S M3S_ROCK
        #endif
        #if defined(M3_FOLIAGE) && defined(M3_BOUGHS)
        #define FLEAF 1
        #endif`)
        .replace('#include <color_fragment>', `#include <color_fragment>
        #ifndef NOPAT
        if (vFK > 3.5 || (vFK > 0.07 && vFK < 1.5)) {
          // (a crown: leaves, not the smooth side of a lump — the picture of the broad leaves, or of the sprays of needles of a
          // conifer, laid on it from the three sides by its own soft normal, with their relief; before the pictures are in,
          // speckled with light and shade)
          fCrown = 1.0;
          #ifdef FLEAF
          if (uTexOn > 0.5) {
            vec3 n = normalize(vFN); vec3 w = pow(abs(n), vec3(3.0)); w /= w.x + w.y + w.z + 1e-4; bool cf = vFK > 3.5;
            float L = cf ? M3_BOUGHS : M3_FOLIAGE, sc = cf ? M3S_BOUGHS : M3S_FOLIAGE;
            vec4 f = m3raw(L, vFP.zy * sc) * w.x + m3raw(L, vFP.xz * sc + 0.31) * w.y + m3raw(L, vFP.xy * sc + 0.57) * w.z;
            diffuseColor.rgb *= m3col(f); fHgt = f.a * 0.05;
          } else
          #endif
          { float lf = texture2D(uDet, (vFP.xz + vFP.y * 0.73) / 1.3).r * 0.6 + texture2D(uDet, (vFP.zy + vFP.x * 0.4) / 1.1).r * 0.4; diffuseColor.rgb *= 0.78 + lf * 0.44; }
        }
        else if (vFK < -5.5) {
          // (a cactus: its skin a little paler down its ribs, and the small pale tufts of its spines in rows)
          float sp = texture2D(uDet, vec2(atan(vFN.z, vFN.x) * 1.6, vFP.y * 2.4)).a;
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.62, 0.6, 0.48), step(0.975, sp) * 0.75);
        }
        else if (vFK < -2.5) {
          // (a stone: its grain from the three sides; moss on its top where the land is wet, in the low of its grain first;
          // the white the cold leaves on it, snow)
          vec3 n = normalize(vFN); float moss = clamp(-vFK - 3.0, 0.0, 1.0); float top = smoothstep(0.25, 0.85, n.y);
          float sn = smoothstep(0.6, 0.8, min(diffuseColor.r, min(diffuseColor.g, diffuseColor.b)));
          if (uTexOn > 0.5) {
            vec3 w = pow(abs(n), vec3(4.0)); w /= w.x + w.y + w.z + 1e-4;
            vec4 r = m3raw(FROCK, vFP.zy * FROCK_S * 1.6) * w.x + m3raw(FROCK, vFP.xz * FROCK_S * 1.6 + 0.31) * w.y + m3raw(FROCK, vFP.xy * FROCK_S * 1.6 + 0.57) * w.z;
            vec3 rc = diffuseColor.rgb * m3col(r);
            if (sn > 0.01) rc = mix(rc, diffuseColor.rgb * m3col(m3raw(M3_SNOW, vFP.xz * M3S_SNOW)), sn);
            float mm = 0.0;
            if (moss > 0.01) { vec4 mt = m3raw(FMOSS, vFP.xz * FMOSS_S * 1.5); mm = smoothstep(0.38, 0.6, top * moss + (mt.a - r.a) * 0.5 - 0.06) * (1.0 - sn); rc = mix(rc, vec3(0.12, 0.19, 0.055) * m3col(mt) * 1.2, mm); fHgt = mt.a * 0.02 * mm; }
            diffuseColor.rgb = rc; fHgt += r.a * 0.08 * (1.0 - mm);
          } else diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.12, 0.19, 0.055), top * moss * 0.55 * (1.0 - sn));
        }
        // (bark: the picture of the stack running up the wood — before it is in, deep grooves drawn up it, ridges between
        // them, darker and greener patches: moss, lichen, the wet side)
        else if (vFK < -0.5) {
          if (uTexOn > 0.5) {
            vec3 n = normalize(vFN); float wx = smoothstep(0.25, 0.75, abs(n.x) / (abs(n.x) + abs(n.z) + 1e-4)); float side = 1.0 - smoothstep(0.65, 0.9, abs(n.y));
            vec4 tb = mix(m3raw(M3_BARK, vec2(vFP.x, vFP.y * 0.7) * M3S_BARK + 0.5), m3raw(M3_BARK, vec2(vFP.z, vFP.y * 0.7) * M3S_BARK), wx);
            diffuseColor.rgb *= mix(vec3(1.0), m3col(tb), side);
            fHgt = tb.a * 0.03 * side;
          } else {
            float ga = texture2D(uDet, vec2(vFP.x * 1.5 + vFP.z * 0.4, vFP.y * 0.16)).r, gb = texture2D(uDet, vec2(vFP.z * 1.5 - vFP.x * 0.4, vFP.y * 0.16 + 0.5)).r;
            float gr = smoothstep(0.32, 0.68, (ga + gb) * 0.5); float pt = texture2D(uDet, vFP.xy * 0.35 + vFP.z * 0.21).a;
            diffuseColor.rgb *= mix(0.56, 1.14, gr) * (0.9 + pt * 0.2);
            diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.78, 1.02, 0.66), smoothstep(0.55, 0.75, pt) * 0.55);
          }
        }
        #endif`)
        // (the relief of the bark and of the stone, from the heights of their pictures)
        .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        #ifndef NOPAT
        { vec3 dpx = dFdx(vFP), dpy = dFdy(vFP); float hx = dFdx(fHgt), hy = dFdy(fHgt);
          if (uTexOn > 0.5 && (vFK < -0.5 || fCrown > 0.5)) { vec3 nw = normalize(vFN); vec3 r1 = cross(dpy, nw), r2 = cross(nw, dpx); float det = dot(dpx, r1); vec3 gr = sign(det) * (hx * r1 + hy * r2); normal = normalize((viewMatrix * vec4(normalize(abs(det) * nw - gr), 0.0)).xyz); } }
        #endif`)
        // (the sun behind a crown shines through its edge, as through the leaves)
        .replace('#include <opaque_fragment>', `
        #if NUM_DIR_LIGHTS > 0
        { float bl = saturate(dot(-normalize(vViewPosition), directionalLights[0].direction)); outgoingLight += diffuseColor.rgb * directionalLights[0].color * pow(bl, 4.0) * 0.2 * fCrown; }
        #endif
        #include <opaque_fragment>`);
    };
    // the leaves at the edge of the crowns: four pictures of sprays of leaves with gaps between them, dabbed as a painter does
    // a tree — 0 broad leaves on their twigs (the oaks, the fruit trees), 1 small round ones (the birches, the willows, the
    // bushes), 2 needles (the pines), 3 the big leaves of the south — each leaf its own grey of light and shade, with its rib;
    // the crown's colour laid over it. The same picture every time (G.hash). Swaying with the crown; the sun behind them
    // shines through
    { const S = 256; const cv = document.createElement('canvas'); cv.width = cv.height = S; const c = cv.getContext('2d');
      const hs = k => G.hash(k * 7 + 3);
      const grey = v => { v = Math.round(G.clamp(v, 0, 255)); return `rgb(${v},${v},${Math.round(v * 0.95)})`; };
      const leaf = (x, y, a, l, w, v, rib) => { c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = grey(v); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(l * 0.42, -w, l, 0); c.quadraticCurveTo(l * 0.42, w, 0, 0); c.fill();
        if (rib) { c.strokeStyle = 'rgba(30,34,20,0.32)'; c.lineWidth = Math.max(0.7, w * 0.14); c.beginPath(); c.moveTo(l * 0.04, 0); c.lineTo(l * 0.86, 0); c.stroke(); } c.restore(); };
      const twig = (x0, y0, x1, y1, w) => { c.strokeStyle = 'rgb(150,132,110)'; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); };
      for (let q = 0; q < 4; q++) {
        const ox = (q & 1) * 128, oy = (q >> 1) * 128, cx = ox + 64, cy = oy + 64;
        c.save(); c.beginPath(); c.rect(ox + 3, oy + 3, 122, 122); c.clip();
        if (q === 0) for (let k = 0; k < 9; k++) {
          const a = k / 9 * TAU + hs(k) * 0.6, L = 34 + hs(k + 20) * 22; const x1 = cx + Math.cos(a) * L, y1 = cy + Math.sin(a) * L; twig(cx + Math.cos(a) * 6, cy + Math.sin(a) * 6, x1, y1, 1.8);
          for (let j = 0; j < 7; j++) { const f = 0.2 + j / 7 * 0.85; const px = cx + Math.cos(a) * L * f, py = cy + Math.sin(a) * L * f; const la = a + (j % 2 ? 0.95 : -0.95) * (0.7 + hs(k * 13 + j) * 0.5);
            leaf(px, py, la, 15 + hs(k * 5 + j) * 9, 6.5 + hs(k * 3 + j) * 3, 165 + f * 60 + hs(k * 17 + j) * 30, true); }
          leaf(x1, y1, a, 18, 7, 230, true);
        }
        else if (q === 1) for (let k = 0; k < 150; k++) { const a = hs(k + 300) * TAU, r = Math.sqrt(hs(k + 500)) * 54; leaf(cx + Math.cos(a) * r, cy + Math.sin(a) * r, hs(k + 700) * TAU, 9 + hs(k + 900) * 5, 4.5 + hs(k + 1100) * 2, 170 + (r / 54) * 50 + hs(k + 1300) * 35, false); }
        else if (q === 2) for (let k = 0; k < 11; k++) {
          // (a bough of needles: a twig, needles all along it both sides, leaning to its tip)
          const a = k / 11 * TAU + hs(k + 40) * 0.5, L = 30 + hs(k + 60) * 24; const x1 = cx + Math.cos(a) * L, y1 = cy + Math.sin(a) * L; twig(cx, cy, x1, y1, 1.4);
          for (let j = 0; j < 22; j++) { const f = j / 22; const px = cx + Math.cos(a) * L * f, py = cy + Math.sin(a) * L * f; const v = grey(150 + f * 70 + hs(k * 29 + j) * 30);
            for (const sd of [-1, 1]) { const na = a + sd * (0.75 + hs(k * 7 + j) * 0.3); const nl = 9 + hs(k * 11 + j + sd) * 6; c.strokeStyle = v; c.lineWidth = 1.6; c.beginPath(); c.moveTo(px, py); c.lineTo(px + Math.cos(na) * nl, py + Math.sin(na) * nl); c.stroke(); } }
        }
        else for (let k = 0; k < 12; k++) { const a = k / 12 * TAU + (hs(k + 80) - 0.5) * 1.4; const L = 28 + hs(k + 90) * 32, o = 5 + hs(k + 97) * 14; twig(cx, cy, cx + Math.cos(a) * o, cy + Math.sin(a) * o, 2);
          leaf(cx + Math.cos(a) * o, cy + Math.sin(a) * o, a + (hs(k + 93) - 0.5) * 0.5, L, L * (0.24 + hs(k + 95) * 0.08), 170 + hs(k + 99) * 65, true); }
        c.restore();
      }
      const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4;
      MAT.leaf = new THREE.MeshLambertMaterial({ map: tx, alphaTest: 0.5, side: THREE.DoubleSide, vertexColors: true }); MAT.leaf.defines = { RIM: 0.28 };
      MAT.leaf.onBeforeCompile = sh => {
        Object.assign(sh.uniforms, { uTime: U.time, uWind: U.wind });
        sh.vertexShader = 'attribute float aK; uniform float uTime; uniform vec3 uWind;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
          vec4 wq = modelMatrix * vec4(transformed, 1.0);
          float ph = uTime * (0.9 + uWind.z) + wq.x * 0.11 + wq.z * 0.07;
          transformed.xz += uWind.xy * (sin(ph) * 0.6 + sin(ph * 2.7 + 1.3) * 0.25 + 0.3) * aK * (0.25 + uWind.z * 0.6) + vec2(sin(uTime * 3.1 + wq.y * 2.0), cos(uTime * 2.7 + wq.x)) * 0.04 * aK;`);
        // (a card is lit by the crown's own normal on both its faces: three.js would turn a back face's into the crown's dark)
        sh.fragmentShader = sh.fragmentShader.replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n normal = normal * faceDirection;').replace('#include <opaque_fragment>', `
          #if NUM_DIR_LIGHTS > 0
          // (the sun behind the leaves shines through them)
          { float bl = saturate(dot(-normalize(vViewPosition), directionalLights[0].direction)); outgoingLight += diffuseColor.rgb * directionalLights[0].color * pow(bl, 4.0) * 0.28; }
          #endif
          #include <opaque_fragment>`);
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
    // a chop on the rivers, calm against the shore, still in a basin), and what water is to the eye: how deep it is, read at
    // every point from the bed the 3D draws under it (bedTick) — clear over the sand at the shore, where it thins to nothing on
    // the land wherever the two meet, blue and then dark as it deepens; the sky in its face as the angle asks (the lower one
    // looks along it, the more sky: Fresnel); the key light glittering on the slopes of the waves (the sun by day, the moon's
    // road at night); the crests lit through; foam where it runs up the land, and on the crests when the wind blows hard
    // (aShore, a corner's mark: 0 open water, 1 against the land, 2 the still water of a basin, -1 the sea beyond the map; the
    // alpha of its colour: the least it hides of what is under it — a paddy's water stays water)
    WU.bedN.value = new THREE.Vector2(2 / G.Space.TILE, 1); WU.key.value = new THREE.Color(); WU.irr.value = new THREE.Color(); WU.deep.value = new THREE.Color(0.008, 0.04, 0.075);
    MAT.water = new THREE.MeshPhongMaterial({ vertexColors: true, transparent: true, opacity: 1, shininess: 60, specular: 0x1c2228, depthWrite: false });
    MAT.water.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, { uTime: U.time, uSky: U.sky, uSkyTop: skyU.top, uKeyDir: skyU.keyDir, uKeyCol: WU.key, uIrr: WU.irr, uDeep: WU.deep, uDet: { value: G.Ground3D.detail() }, uWind: U.wind, uSeaY: { value: G.SEA * G.Space.HM }, uBed: WU.bed, uBedN: WU.bedN, uK: WU.k });
      sh.vertexShader = 'uniform float uTime; uniform vec3 uWind; uniform float uSeaY; uniform sampler2D uBed; uniform vec2 uBedN; uniform float uK; attribute float aShore; varying float vShore; varying float vSea; varying vec3 vWW;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        vec4 wp = modelMatrix * vec4(position, 1.0); float sea = 1.0 - step(0.15, abs(wp.y - uSeaY * uK)); float still = step(1.5, aShore); float shore = clamp(aShore, 0.0, 1.0);
        // (the swell dies where the water is shallow: a paddy, a ford, the last of the beach hardly move)
        float dep = aShore < -0.5 ? 9.0 : wp.y - (texture2D(uBed, (wp.xz * uBedN.x + 0.5) * uBedN.y).r + uSeaY) * uK;
        float sw = (0.35 + uWind.z * 0.5) * (1.0 - shore * 0.75) * mix(0.3, 1.0, sea);
        transformed.y += ((sin(wp.x * 0.33 + uTime * 1.3) * 0.06 + cos(wp.z * 0.29 + uTime * 1.05) * 0.05) + sin(dot(wp.xz, normalize(uWind.xy + vec2(0.001))) * 0.21 - uTime * 1.4) * 0.12 * sw) * (1.0 - still) * smoothstep(0.05, 0.9, dep); // (none in the last centimetres: the water's edge stays where the land meets it)
        vShore = aShore; vSea = sea; vWW = (modelMatrix * vec4(transformed, 1.0)).xyz;`);
      sh.fragmentShader = 'uniform float uTime; uniform vec3 uSky; uniform vec3 uSkyTop; uniform vec3 uKeyDir; uniform vec3 uKeyCol; uniform vec3 uIrr; uniform vec3 uDeep; uniform sampler2D uDet; uniform vec3 uWind; uniform float uSeaY; uniform sampler2D uBed; uniform vec2 uBedN; uniform float uK; varying float vShore; varying float vSea; varying vec3 vWW;\n' + sh.fragmentShader
        .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        // (four trains of waves: their slopes summed, steeper with the wind, flatter on the rivers and against the land, none in a basin)
        vec2 wq = vWW.xz; float isSea = vSea; float still = step(1.5, vShore); float shore = clamp(vShore, 0.0, 1.0);
        vec2 wd = normalize(uWind.xy + vec2(0.001)); float ws = clamp(uWind.z, 0.0, 2.0);
        float calm = mix(0.4, 1.0, isSea) * (1.0 - shore * 0.55) * (0.65 + ws * 0.35) * (1.0 - still * 0.9);
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
        gw = gw * calm * mix(0.45, 1.0, wnear) + vec2(r3 - r1, r4 - r2) * 0.7 * wnear * (1.0 - still * 0.75);
        vec3 nW = normalize(vec3(-gw.x, 1.0, -gw.y));
        normal = normalize((viewMatrix * vec4(nW, 0.0)).xyz);`)
        .replace('#include <opaque_fragment>', `
        // (how deep it is here: its face over the bed under it)
        vec2 bu = (vWW.xz * uBedN.x + 0.5) * uBedN.y; float b0 = texture2D(uBed, bu).r;
        float wD = vShore < -0.5 ? 40.0 : max(vWW.y - (b0 + uSeaY) * uK, 0.0) / max(uK, 0.3);
        // (how steeply the bed rises here: the surf breaks on a slope, not over a flat that is barely wet)
        float bSl = length(vec2(texture2D(uBed, bu + vec2(uBedN.y, 0.0)).r - b0, texture2D(uBed, bu + vec2(0.0, uBedN.y)).r - b0)) * uBedN.x;
        // (its body: the colour it is given — clear and green — going blue, then dark, as it deepens; lit softly by the sky and
        // the key light, as water takes little light on itself; the torches by it a little)
        vec3 body = mix(diffuseColor.rgb, uDeep, 1.0 - exp(-wD * 0.32));
        vec3 lit = mix(body * (uKeyCol * clamp(uKeyDir.y, 0.0, 1.0) * 0.55 + uIrr) * 0.3183, outgoingLight * (body / max(diffuseColor.rgb, vec3(0.02))), 0.2);
        // (how much of the bed it hides: nothing where it thins on the sand, all of it in the deep — and never less than its colour asks)
        float a = max(1.0 - exp(-wD * 0.9), diffuseColor.a);
        // (the sky in its face: the reflected ray's height picks the colour, as the sky's own dome has it)
        vec3 Vw = normalize(cameraPosition - vWW); vec3 Rw = reflect(-Vw, nW); float rel = max(Rw.y, 0.0);
        #ifdef USE_FOG
        vec3 skyR = mix(gxHaze(normalize(vec3(Rw.x, rel, Rw.z))), uSkyTop, pow(rel, 0.42));
        #else
        vec3 skyR = mix(uSky, uSkyTop, pow(rel, 0.42));
        #endif
        float fr = 0.02 + 0.98 * pow(1.0 - clamp(dot(nW, Vw), 0.0, 1.0), 5.0);
        // (the key light on the slopes of the waves: a hard glitter and a soft sheen round it — the sun's, or the moon's road)
        float rs = max(dot(Rw, uKeyDir), 0.0);
        vec3 col = lit * a * (1.0 - fr) + skyR * fr + uKeyCol * (pow(rs, 900.0) * 1.7 + pow(rs, 90.0) * 0.075) * step(0.0, uKeyDir.y);
        float al = 1.0 - (1.0 - a) * (1.0 - fr);
        // (the crests lit from within where the sun shines through them)
        col += vec3(0.02, 0.09, 0.08) * smoothstep(-0.02, 0.05, hw) * isSea * clamp(uKeyCol.g * 0.33, 0.0, 1.0) * (1.0 - shore * 0.5) * a;
        // (foam: where the sea runs up the land and thins over it, breaking white, coming and going with the waves; a little at
        // the banks of the rivers; whitecaps on the open sea when the wind blows hard)
        float fn = texture2D(uDet, vWW.xz / 5.0 + uTime * 0.01).g;
        float run = sin(uTime * 0.9 + fn * 4.0 + (vWW.x + vWW.z) * 0.07) * 0.07;
        float foam = (1.0 - smoothstep(0.03, 0.34, wD + (fn - 0.5) * 0.2 + run)) * smoothstep(0.0, 0.025, wD) * (0.45 + fn * 0.55) * (isSea + (1.0 - isSea) * shore * 0.45) * (1.0 - still) * step(-0.5, vShore) * smoothstep(0.012, 0.05, bSl);
        foam = max(foam, smoothstep(0.06, 0.1, hw + (fn - 0.5) * 0.05) * smoothstep(0.9, 1.6, ws) * isSea * 0.7);
        col = mix(col, vec3(0.9, 0.94, 0.96) * (uKeyCol * clamp(uKeyDir.y, 0.0, 1.0) * 0.6 + uIrr) * 0.3183, clamp(foam, 0.0, 0.85)); al = max(al, foam * 0.9);
        // (and where it thins to nothing it is gone — no sheen of a film of water over the sand, no flicker where the two meet)
        al *= smoothstep(0.0, 0.04, wD) * step(-0.5, vShore) + step(vShore, -0.5);
        outgoingLight = col / max(al, 0.001); diffuseColor.a = al;
        #include <opaque_fragment>`);
    };
    MAT.ice = new THREE.MeshPhongMaterial({ color: 0xdcecf6, shininess: 70, specular: 0x5a6672, transparent: true, opacity: 0.92 });
    // (the ice shows the sky in its face, more as one looks along it — as the water does, duller)
    MAT.ice.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, { uSkyTop: skyU.top });
      sh.vertexShader = 'varying vec3 vIW;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vIW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = 'uniform vec3 uSkyTop; varying vec3 vIW;\n' + sh.fragmentShader.replace('#include <opaque_fragment>', `
        #ifdef USE_FOG
        { vec3 Vw = normalize(cameraPosition - vIW); vec3 Rw = reflect(-Vw, vec3(0.0, 1.0, 0.0)); float fr = 0.04 + 0.55 * pow(1.0 - clamp(Vw.y, 0.0, 1.0), 5.0);
          outgoingLight = mix(outgoingLight, mix(gxHaze(normalize(vec3(Rw.x, max(Rw.y, 0.0), Rw.z))), uSkyTop, pow(max(Rw.y, 0.0), 0.42)), fr); }
        #endif
        #include <opaque_fragment>`);
    };
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
    G.Post3D && G.Post3D.init && G.Post3D.init(THREE, R3);
  }
  function applyQuality() {
    const q = R3.Q();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2) * q.scale);
    renderer.shadowMap.enabled = !!q.shadows; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    sun.castShadow = !!q.shadows;
    // (the side of the sun's picture: never more than the graphics card can hold)
    if (q.shadows) { const n = Math.min(q.shadows, renderer.capabilities.maxTextureSize || 4096); sun.shadow.mapSize.set(n, n); shadowKey = ''; if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
    // (the patterns of walls and roofs and the speckle of the leaves only where the machine carries the ground's grain too)
    for (const m of [MAT.solid, MAT.flora]) if (m) m.defines = q.detail === 0 ? { NOPAT: 1 } : {};
    for (const m of [MAT.land, MAT.solid, MAT.flora, MAT.plant]) if (m) m.needsUpdate = true;
    G.Ground3D.quality();
    G.FX3D && G.FX3D.quality && G.FX3D.quality(q);
    G.Post3D && G.Post3D.quality && G.Post3D.quality(q);
    resize();
  }
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
  // (the colour of the sea's and the rivers' water where it is shallow: the shader takes it to blue and dark by the depth it
  // reads at each point — one colour for all their corners, so no tile shows its edges in the water)
  const SHALLOW = [64, 162, 172];
  // the water's uniforms, shared by its materials: the bed under it (its height every half tile), the key light on it, the
  // sky's light on it, the colour of the deep
  const WU = { bed: { value: null }, bedN: { value: null }, key: { value: null }, irr: { value: null }, deep: { value: null }, k: { value: 1 } }; // (k: the world's height on the screen — flatter in the descent)
  // the bed under the water as the 3D draws it — the land's own height, and the beds the Space carves into the rivers — one
  // value every half tile (the near land's own points): the water's shader reads how deep it is at each point from it. Made
  // whole for a new world or a changed land (S.typeVer), and a few rows a frame after that (a river's level changing)
  let bedTex = null, bedData = null, bedFor = null, bedVer = -1, bedRow = 0;
  function bedRows(j0, j1) {
    const n = 2 * N + 1, HM = G.Space.HM, sea = G.SEA * HM, half = THREE.DataUtils.toHalfFloat; let ch = false;
    for (let j = j0; j < j1; j++) for (let i = 0; i < n; i++) { const x = i / 2, y = j / 2; const o = j * n + i; const v = half(W.hAt(x, y) * HM - G.Space.bedDrop(x, y) - sea); if (bedData[o] !== v) { bedData[o] = v; ch = true; } }
    return ch;
  }
  function bedTick() {
    const S = G.S; const n = 2 * N + 1;
    if (!bedTex || bedTex.image.width !== n) {
      if (bedTex) bedTex.dispose(); bedData = new Uint16Array(n * n);
      bedTex = new THREE.DataTexture(bedData, n, n, THREE.RedFormat, THREE.HalfFloatType); bedTex.magFilter = bedTex.minFilter = THREE.LinearFilter; bedTex.generateMipmaps = false; bedTex.flipY = false;
      WU.bed.value = bedTex; WU.bedN.value.set(2 / G.Space.TILE, 1 / n); bedFor = null;
    }
    if (bedFor !== S || bedVer !== S.typeVer) { bedFor = S; bedVer = S.typeVer; bedRows(0, n); bedTex.needsUpdate = true; bedRow = 0; return; }
    const k = Math.min(n, bedRow + 8); if (bedRows(bedRow, k)) bedTex.needsUpdate = true; bedRow = k >= n ? 0 : k;
  }
  // (for the verifier: the bed the water reads, against the land's own height at a few points of the map)
  R3.bedCheck = function (n) {
    if (!bedData || bedFor !== G.S) return { n: 0, bad: 0 }; const m = 2 * N + 1, HM = G.Space.HM; let bad = 0, k = 0;
    for (let q = 0; q < (n || 64); q++) { const i = Math.floor(G.hash(q * 7 + 3) * m), j = Math.floor(G.hash(q * 11 + 5) * m); k++; const want = W.hAt(i / 2, j / 2) * HM - G.Space.bedDrop(i / 2, j / 2) - G.SEA * HM; if (Math.abs(THREE.DataUtils.fromHalfFloat(bedData[j * m + i]) - want) > 0.05 + Math.abs(want) * 0.002) bad++; }
    return { n: k, bad };
  };
  // (a water surface: its colour and the least it hides at each corner, and the corner's mark — near the land, still, beyond)
  class WGeo {
    constructor() { this.p = []; this.c = []; this.s = []; }
    quad(P, cols, al, sh) { for (const k of [0, 1, 2, 0, 2, 3]) { this.p.push(P[k][0], P[k][1], P[k][2]); const c = lin(cols[k]); this.c.push(c[0], c[1], c[2], al[k]); this.s.push(sh[k]); } }
    // a disc of still water (a basin, a fountain's bowl): its centre in the world (m), radius, colour and the least it hides
    disc(X, Y, Z, r, col, al, n) {
      const m = n || 18, c = lin(col), a = al === undefined ? 0.6 : al;
      for (let k = 0; k < m; k++) { const a0 = k / m * TAU, a1 = (k + 1) / m * TAU; this.p.push(X, Y, Z, X + Math.cos(a1) * r, Y, Z + Math.sin(a1) * r, X + Math.cos(a0) * r, Y, Z + Math.sin(a0) * r); for (let q = 0; q < 3; q++) { this.c.push(c[0], c[1], c[2], a); this.s.push(2); } }
    }
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
  // (whether the open sea touches a tile, at a side or a corner)
  function seaBeside(x, y) {
    const S = G.S;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy; if ((dx || dy) && W.inb(nx, ny)) { const j = ny * N + nx; if (S.type[j] <= T.SEA && !(S.dry && S.dry[j])) return true; } }
    return false;
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
        // (its colour and clearness come from the depth the shader reads at each point; the corners only say where the land is)
        const C4 = [[x, y], [x, y + 1], [x + 1, y + 1], [x + 1, y]].map(([cx, cy]) => wetCorner(cx, cy, G.SEA, false));
        g.quad([[x * TL, sea, y * TL], [x * TL, sea, (y + 1) * TL], [(x + 1) * TL, sea, (y + 1) * TL], [(x + 1) * TL, sea, y * TL]],
          [SHALLOW, SHALLOW, SHALLOW, SHALLOW], [0, 0, 0, 0], C4.map(c => c[1]));
      } else if (t === T.RIVER) {
        const wl = S.wl[i] * HM + 0.05;
        if (S.ice && S.ice[i]) { ice.quad([x * TL, wl + 0.05, y * TL], [x * TL, wl + 0.05, (y + 1) * TL], [(x + 1) * TL, wl + 0.05, (y + 1) * TL], [(x + 1) * TL, wl + 0.05, y * TL], '#dcecf6'); continue; }
        const C4 = [[x, y], [x, y + 1], [x + 1, y + 1], [x + 1, y]].map(([cx, cy]) => wetCorner(cx, cy, S.wl[i], true)[1] * 0.85);
        g.quad([[x * TL, wl, y * TL], [x * TL, wl, (y + 1) * TL], [(x + 1) * TL, wl, (y + 1) * TL], [(x + 1) * TL, wl, y * TL]], [SHALLOW, SHALLOW, SHALLOW, SHALLOW], [0, 0, 0, 0], C4);
      } else if (!far && Math.min(W.vh(x, y), W.vh(x + 1, y), W.vh(x, y + 1), W.vh(x + 1, y + 1)) < G.SEA + 0.12 && seaBeside(x, y)) {
        // (the shore: over a tile of land that dips toward the sea, the sea goes on until the land rises out of it — the water's
        // edge is where the two meet, wherever that is in the tile, not the tile's own edge; the land hides the rest)
        g.quad([[x * TL, sea, y * TL], [x * TL, sea, (y + 1) * TL], [(x + 1) * TL, sea, (y + 1) * TL], [(x + 1) * TL, sea, y * TL]], [SHALLOW, SHALLOW, SHALLOW, SHALLOW], [0, 0, 0, 0], [1, 1, 1, 1]);
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
  // (the god's bushes: art.js, [base, dark, light] — in the round a little deeper and quieter, as the trees round them are:
  // a bush among the trees, not a lamp; dry when burnt)
  const BPAL = [[[86, 160, 67], [63, 125, 52], [124, 195, 92]], [[79, 154, 80], [58, 122, 62], [116, 189, 106]], [[98, 164, 68], [74, 130, 51], [140, 203, 94]]]
    .map(p => p.map(c => { const l = 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2]; return c.map(v => (l + (v - l) * 0.85) * 0.78); }));
  // (the tone each land gives its bushes, [base, dark, light]: none in the temperate wood — the god's own green)
  const BTONE = [null, [[52, 84, 60], [34, 58, 42], [76, 110, 80]], [[56, 92, 58], [38, 64, 40], [82, 120, 78]], [[78, 104, 56], [54, 76, 40], [108, 132, 74]], [[42, 108, 46], [26, 76, 32], [66, 140, 64]], [[118, 124, 76], [86, 92, 56], [150, 152, 98]], [[124, 128, 88], [92, 96, 64], [156, 156, 112]]];
  // (the god's red of the berries, deeper: under the sun of the 3D the god's own would burn white)
  const BERRY = [[150, 22, 40], [128, 16, 34], [168, 34, 46]];
  const SNOW = [238, 244, 250];
  // (how much snow lies on a tile: as white as the god's view paints its ground there — the Ground3D's rule, the same snow the
  // land's shader lays)
  const snowAt = i => (G.Ground3D && G.Ground3D.snowAt ? G.Ground3D.snowAt(i) : G.S.temp ? G.clamp((0.235 - G.S.temp[i] / 255) / 0.07, 0, 1) : 0);
  R3.snowAt = snowAt;
  // (each tree its own shade of its kind's green — a little lighter or darker, warmer or cooler — by its id: the same tree
  // the same every time, from the hill and from under it)
  function tpal(t) {
    const P = TPAL[t.kind]; let p;
    if (P) p = P[(t.v || 0) % 3].map(c => G.hex2rgb(c)); else { const b = G.hex2rgb((KIND[t.kind] || KIND.oak)[1]); p = [b, [b[0] * 0.7, b[1] * 0.72, b[2] * 0.7], [Math.min(255, b[0] * 1.25 + 12), Math.min(255, b[1] * 1.22 + 12), Math.min(255, b[2] * 1.15 + 8)]]; }
    const f = 0.9 + G.hash(t.id * 13 + 5) * 0.2, w = G.hash(t.id * 29 + 3) - 0.5;
    return p.map(c => [Math.min(255, c[0] * f * (1 + w * 0.16)), Math.min(255, c[1] * f), Math.min(255, c[2] * f * (1 - w * 0.2))]);
  }
  // (the colour of a point of a crown: dark under it and near its heart, the base on its sides, light on top; snow
  // resting on the upper faces where it is cold)
  const leafCol = (pal, snow, cx, cz, r) => (X, Y, Z, nx, ny) => {
    let c = ny < 0 ? G.lerpColor(pal[1], pal[0], (ny + 1)) : G.lerpColor(pal[0], pal[2], G.clamp(ny * 0.85, 0, 1) * 0.75);
    const inner = G.clamp(1 - Math.hypot(X - cx, Z - cz) / Math.max(0.5, r), 0, 1); c = G.lerpColor(c, pal[1], inner * 0.3 * (1 - Math.max(0, ny)));
    if (snow > 0 && ny > 0.3) c = G.lerpColor(c, SNOW, snow * G.clamp((ny - 0.3) / 0.35, 0, 1));
    return c;
  };
  // (the measures of a standing tree, the same for its drawing and for the leaves it lets fall: height, crown's heart and radius)
  function treeDims(t) {
    const k = KIND[t.kind] || KIND.oak; const sz = G.clamp(t.size, 0.15, 1.4); const h = G.hash(t.id * 7); const s = 0.85 + h * 0.3;
    const H = (5 + 7 * sz) * s; const tall = k[0] === 'tall' ? 1.35 : 1;
    return { k, sz, h, s, H, tall, r: (2.6 * sz + 0.8) * tall, cy: H * 0.66 * tall };
  }
  // (where a tree's crown hangs, for the leaves it lets fall: [X, Y, Z, its radius, its colour 0..1], or null)
  R3.crownOf = function (t) {
    const k = KIND[t.kind] || KIND.oak; if (t.stage !== 'grow' || t.size < 0.35 || (k[0] !== 'round' && k[0] !== 'tall' && k[0] !== 'willow' && k[0] !== 'flat')) return null;
    const TL = G.Space.TILE, HM = G.Space.HM; const D = treeDims(t);
    const c = tpal(t)[0]; return [t.x * TL, W.groundH(t.x, t.y) * HM + D.cy + D.r * 0.15, t.y * TL, D.r * 1.05, [c[0] / 255, c[1] / 255, c[2] / 255]];
  };
  // (for the tests: what is wrong in the drawing of the trees round a point, in tiles — a point that is not a number, a tree
  // not standing on the ground, a crown flung far from its trunk, a card of leaves showing what lies outside its picture)
  R3.floraCheck = function (fx, fy, R) {
    const S = G.S; const out = []; if (!THREE) return out; const TL = G.Space.TILE, HM = G.Space.HM; let n = 0;
    for (const t of S.trees.values()) {
      if (Math.abs(t.x - fx) > R || Math.abs(t.y - fy) > R || t.stage === 'fall') continue;
      const g = new Geo(), gp = new Geo(), gl = new Geo(); treeInto(g, t, gp, gl); if (++n > 150) break;
      const X = t.x * TL, Z = t.y * TL, Y = W.groundH(t.x, t.y) * HM; let lo = Infinity, far = 0, bad = 0;
      for (const q of [g, gp, gl]) for (let k = 0; k < q.p.length; k += 3) { const x = q.p[k], y = q.p[k + 1], z = q.p[k + 2]; if (!Number.isFinite(x + y + z)) { bad++; continue; } lo = Math.min(lo, y); far = Math.max(far, Math.hypot(x - X, z - Z)); }
      if (gl.uv) for (const u of gl.uv) if (!(u >= 0 && u <= 1)) bad++;
      if (bad) out.push(`árvore #${t.id} (${t.kind}): ${bad} pontos fora do lugar (não são número ou fora da figura)`);
      else if (lo < Infinity && (lo > Y + 0.4 || lo < Y - 2.5)) out.push(`árvore #${t.id} (${t.kind}): o pé a ${(lo - Y).toFixed(2)} m do chão`);
      if (far > 16) out.push(`árvore #${t.id} (${t.kind}): a copa a ${far.toFixed(1)} m do tronco`);
    }
    return out;
  };
  // (the bark's mark: a sway below -0.5 is wood — trunks, branches, roots, stumps, logs — read back as -1 - sway: the crown's
  // own sway for a branch, none for a trunk; the drawing paints it with bark. Below -2.5 it is stone: -3 - its moss)
  const BARK = -1, ROCK = -3, CACTUS = -6, FRUIT = 2, CONIF = 4; // (a cactus's skin; a fruit and a conifer's crown: their sway, raised)
  const barkCol = (bark, snow) => (X, Y, Z, nx, ny) => (snow > 0 && ny > 0.6 ? G.lerpColor(bark, SNOW, snow) : bark);
  // the plants' own shapes, made once
  let FS = null;
  function fsh() {
    if (FS) return FS; FS = {};
    // (a trunk: tapering to the top, flaring at its very foot; open at both ends — the crown and the ground hide them)
    FS.trunk = new THREE.LatheGeometry([[0.74, -0.01], [0.58, 0.03], [0.5, 0.1], [0.44, 0.3], [0.38, 0.65], [0.33, 1]].map(([r, y]) => new THREE.Vector2(r, y)), 8);
    FS.trunk6 = new THREE.LatheGeometry([[0.7, -0.01], [0.52, 0.05], [0.44, 0.25], [0.36, 0.65], [0.3, 1]].map(([r, y]) => new THREE.Vector2(r, y)), 6);
    // (a branch, thinner at its end; a root, a wedge running out of the trunk into the ground)
    { const g = new THREE.CylinderGeometry(0.28, 0.5, 1, 6, 1, true); g.translate(0, 0.5, 0); FS.limb = g; }
    { const g = new THREE.ConeGeometry(0.5, 1, 5, 1, true); g.translate(0, 0.5, 0); FS.root = g; }
    // (a tier of a conifer's boughs: a low cone whose rim is ragged — the tips of the boughs jutting out and drooping, the
    // gaps between them higher — and, for the lowest tiers, its underside: the dark of the boughs seen from below)
    const tier = under => { const n = 9, P = [], I = []; const rim = () => { for (let k = 0; k < n * 2; k++) { const a = k / (n * 2) * TAU, tip = k % 2 === 0; const r = tip ? 0.5 : 0.31; P.push(Math.cos(a) * r, tip ? -0.07 : 0.14, Math.sin(a) * r); } };
      P.push(0, 1, 0); rim(); for (let k = 0; k < n * 2; k++) I.push(0, 1 + ((k + 1) % (n * 2)), 1 + k);
      if (under) { const b = P.length / 3; P.push(0, 0.3, 0); rim(); for (let k = 0; k < n * 2; k++) I.push(b, b + 1 + k, b + 1 + ((k + 1) % (n * 2))); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setIndex(I); g.computeVertexNormals(); return g; };
    FS.tier = tier(true); FS.tierT = tier(false);
    // (a cactus: a column of ribs — a dozen round the trunk, eight round an arm — and its crown, the same ribs closing over)
    const ribbed = (g, n) => { const P = g.attributes.position; for (let k = 0; k < P.count; k++) { const x = P.getX(k), z = P.getZ(k); const f = 1 + 0.09 * Math.cos(Math.atan2(z, x) * n); P.setX(k, x * f); P.setZ(k, z * f); } g.computeVertexNormals(); return g; };
    { const g = new THREE.CylinderGeometry(0.5, 0.5, 1, 24, 2, true); g.translate(0, 0.5, 0); FS.cact = ribbed(g, 12); }
    { const g = new THREE.CylinderGeometry(0.5, 0.5, 1, 16, 2, true); g.translate(0, 0.5, 0); FS.cactArm = ribbed(g, 8); }
    FS.cactTop = ribbed(new THREE.SphereGeometry(0.5, 24, 3, 0, TAU, 0, Math.PI / 2), 12);
    FS.cactTop8 = ribbed(new THREE.SphereGeometry(0.5, 16, 3, 0, TAU, 0, Math.PI / 2), 8);
    return FS;
  }
  // (a branch or a root from one point to another, of radius r0 at its start: a turned limb)
  function limb(g, shape, x0, y0, z0, x1, y1, z1, r0, col, sw) {
    const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0; const L = Math.hypot(dx, dy, dz) || 1e-3;
    g.put(shape, R3.mat(x0, y0, z0, Math.atan2(dx, dz), r0 * 2, L, r0 * 2, Math.acos(G.clamp(dy / L, -1, 1))), col, sw);
  }
  // a card of leaves (as Geo.card) showing one of the four pictures of the leaves: 0 broad leaves, 1 small round leaves,
  // 2 needles, 3 the big leaves of the south
  function card4(gl, x, y, z, s, a, t, n, c, sw, q) {
    if (!gl.uv) gl.uv = [];
    const ca = Math.cos(a), sa = Math.sin(a), ct = Math.cos(t), st = Math.sin(t), h = s / 2;
    const ux = -sa * h, uz = ca * h, vx = ca * st * h, vy = ct * h, vz = sa * st * h;
    const P = [[x - ux - vx, y - vy, z - uz - vz], [x + ux - vx, y - vy, z + uz - vz], [x + ux + vx, y + vy, z + uz + vz], [x - ux + vx, y + vy, z - uz + vz]];
    // (the canvas is turned upside down into the picture: its top row is v = 1)
    const u0 = (q & 1) * 0.5, v0 = (1 - (q >> 1)) * 0.5; const UV = [[0, 0], [0.5, 0], [0.5, 0.5], [0, 0.5]]; const C = lin(c);
    for (const k of [0, 1, 2, 0, 2, 3]) { gl.p.push(P[k][0], P[k][1], P[k][2]); gl.n.push(n[0], n[1], n[2]); gl.c.push(C[0], C[1], C[2]); gl.uv.push(u0 + UV[k][0], v0 + UV[k][1]); }
    gl._k(sw, 6);
  }
  // a crown of leaves: lumps round its heart, lit as one soft volume, and near the body the cards of leaves standing out
  // of their edges (a crown is leaves, not the smooth side of a lump). Returns its lumps [x, y, z, radius]
  function crownInto(g, gl, id, X, cy, Z, r, n, fl, pal, snow, sw, q, cards, shape) {
    // (the snow lies on the crown's lumps; the leaves standing out of its edge keep their green, a little frosted)
    const lc = leafCol(pal, snow, X, Z, r * 1.4), lcc = snow > 0 ? leafCol(pal, snow * 0.3, X, Z, r * 1.4) : lc; const lumps = [[X, cy + r * 0.42 * fl, Z, r * 0.92]];
    for (let k = 0; k < n - 1; k++) {
      const a = k / (n - 1) * TAU + G.hash(id * 3 + k) * 0.9, up = (k % 2 ? 0.3 : -0.14) * fl, ring = (k % 2 ? 0.52 : 0.8) * (0.86 + G.hash(id * 7 + k) * 0.28);
      lumps.push([X + Math.cos(a) * r * ring, cy + r * up, Z + Math.sin(a) * r * ring, r * (0.6 + G.hash(id * 5 + k) * 0.3)]);
    }
    g.sph = [X, cy + r * 0.12, Z, 0.75];
    for (let k = 0; k < lumps.length; k++) { const [x, y, z, s] = lumps[k]; const h = G.hash(id * 11 + k * 5); g.put(shape || SH.ico0, R3.mat(x, y, z, h * TAU, s * (1.05 + h * 0.2), s * 0.92 * fl, s * (1.15 - h * 0.2), (h - 0.5) * 0.6), lc, sw + (y - cy) / r * 0.06); }
    g.sph = null;
    if (gl && cards) for (let k = 0; k < lumps.length; k++) {
      const [x, y, z, s] = lumps[k]; let ox = x - X, oy = (y - cy) / Math.max(0.3, fl), oz = z - Z; const ol = Math.hypot(ox, oy, oz); if (ol < 0.2) { ox = 0; oy = 1; oz = 0; } else { ox /= ol; oy /= ol; oz /= ol; }
      for (let j = 0; j < cards; j++) {
        const a = Math.atan2(oz, ox) + (G.hash(id * 17 + k * 7 + j) - 0.5) * 2.4, e = Math.asin(G.clamp(oy, -1, 1)) * 0.6 + (G.hash(id * 19 + k * 3 + j * 5) - 0.35) * 1.3;
        const dx = Math.cos(a) * Math.cos(e), dy = Math.sin(e), dz = Math.sin(a) * Math.cos(e);
        const px = x + dx * s * 0.86, py = y + dy * s * 0.8 * fl, pz = z + dz * s * 0.86;
        card4(gl, px, py, pz, s * (1.0 + G.hash(id + k * 13 + j) * 0.35), a, (G.hash(j * 31 + k + id) - 0.5) * 1.1, [dx, dy, dz], lcc(px, py, pz, dx, dy, dz), sw + 0.08, q);
      }
    }
    return lumps;
  }
  // (the roots of a grown tree: wedges running out of its foot into the ground, bigger under the trees of the south)
  function rootsInto(g, id, X, Y, Z, rt, n, col) {
    for (let k = 0; k < n; k++) { const a = k / n * TAU + G.hash(id * 23 + k) * 0.8, L = rt * (2.2 + G.hash(id * 29 + k) * 1.4); const ex = X + Math.cos(a) * L, ez = Z + Math.sin(a) * L;
      // (each root running into the ground where it reaches: down the slope as far as up it)
      limb(g, FS.root, X + Math.cos(a) * rt * 0.35, Y + rt * 0.9, Z + Math.sin(a) * rt * 0.35, ex, Math.min(Y, G.Space.floorY(ex, ez)) - 0.12, ez, rt * 0.62, col, BARK); }
  }
  // (the lowest of the ground round a foot, in metres — on a slope a trunk goes down to it, no foot standing out of the
  // hillside on its lower side)
  function footY(x, y, r) { const TL = G.Space.TILE, HM = G.Space.HM; let lo = W.groundH(x, y) * HM; const d = r / TL; for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; lo = Math.min(lo, W.groundH(x + Math.cos(a) * d, y + Math.sin(a) * d) * HM); } return lo; }
  // a tree of the world as it stands: the god's shapes and tones in the round. A broad tree: a tapering trunk with roots at
  // its foot, boughs forking up into a crown of lumps and leaves, each tree its own shade; a conifer: tiers of ragged boughs
  // narrowing to the top; palms with drooping fronds; the snow on top where the land is cold. gp: the plants that bend
  // (fronds, hanging strands of a willow); gl: the cards of leaves (near the body only)
  function treeInto(g, t, gp, gl) {
    const TL = G.Space.TILE, HM = G.Space.HM; fsh(); const fine = !!gl; // (roots and twigs only where the machine carries the leaves' cards too)
    const X = t.x * TL, Z = t.y * TL, Y = W.groundH(t.x, t.y) * HM; const D = treeDims(t); const { k, sz, h, H } = D;
    const Yb = Math.min(Y, footY(t.x, t.y, 0.6) - 0.03), dY = Y - Yb; // (where the trunk starts: at the lowest ground round its foot)
    const rot = h * TAU;
    const snow = t.kind === 'snowpine' ? 0.85 : snowAt(W.idx(Math.floor(t.x), Math.floor(t.y))) * 0.85;
    const bark0 = G.hex2rgb(k[2] || '#6b4a2e');
    if (t.stage === 'stump') { g.put(SH.cyl, R3.mat(X, Yb, Z, rot, 0.6, 0.45 + dY, 0.6), (X2, Y2, Z2, nx, ny) => (ny > 0.9 ? [214, 180, 128] : bark0), BARK); return; }
    if (t.stage === 'fall' && !t._standing) return; // (a tree falling is drawn moving, by FX3D, until it lies)
    if (t.stage === 'log' || t.stage === 'fall') { g.put(SH.cyl, R3.mat(X, Y + 0.3, Z, rot, 0.5, 4.5 * sz, 0.5, 0, Math.PI / 2), (X2, Y2, Z2, nx, ny) => (Math.abs(ny) < 0.2 && Math.abs(nx) < 0.3 ? [214, 180, 128] : bark0), BARK); return; }
    const burnt = t.stage === 'burnt';
    const pal = burnt ? [[42, 36, 32], [26, 22, 20], [58, 50, 44]] : tpal(t); const bark = burnt ? [30, 26, 24] : bark0;
    const bc = barkCol(bark, snow);
    const lump = (x, y, z, sx, sy, sz2, cr, sw) => g.put(SH.ico0, R3.mat(x, y, z, rot + x * 0.7 + z * 0.3, sx, sy, sz2), leafCol(pal, snow, X, Z, cr), sw);
    switch (k[0]) {
      case 'cone': {
        // (a straight trunk, its foot showing; the tiers of boughs, each turned its own way, wide at the bottom, narrowing up)
        const r0 = 0.15 * sz + 0.07; g.put(FS.trunk6, R3.mat(X, Yb, Z, rot, r0 * 2, H * 0.7 + dY, r0 * 2), bc, BARK);
        if (fine && sz > 0.55) rootsInto(g, t.id, X, Y, Z, r0, 4, bc);
        if (!burnt) {
          const lc = leafCol(pal, snow, X, Z, 1.6 * sz + 0.6); const nt = 5;
          g.sph = [X, Y + H * 0.52, Z, 0.35];
          for (let q = 0; q < nt; q++) {
            const u = q / (nt - 1); const w2 = ((3.5 - u * 2.7) * sz + 0.6) * (0.9 + G.hash(t.id * 3 + q * 7) * 0.2); const y = Y + H * (0.15 + u * 0.63);
            g.put(q < 1 && fine ? FS.tier : FS.tierT, R3.mat(X + Math.cos(rot + q * 2.3) * 0.1, y, Z + Math.sin(rot + q * 2.3) * 0.1, rot + q * 1.7, w2, H * (0.3 - u * 0.1), w2), lc, CONIF + 0.08 + u * 0.12);
          }
          g.put(SH.cone, R3.mat(X, Y + H * 0.8, Z, rot, 0.7 * sz + 0.35, H * 0.24, 0.7 * sz + 0.35), lc, CONIF + 0.22);
          g.sph = null;
          // (the boughs' sprays of needles standing out of every tier, drooping at their tips, each its own way — the tier's
          // rim broken into boughs)
          if (gl) for (let q = 0; q < nt; q++) { const u = q / (nt - 1); const w2 = ((3.5 - u * 2.7) * sz + 0.6) * 0.5; const y = Y + H * (0.15 + u * 0.63); const nc = q < nt - 1 ? 7 : 4;
            for (let j = 0; j < nc; j++) { const a = rot + q * 1.7 + j * TAU / nc + (G.hash(t.id + q * 5 + j) - 0.5) * 0.7; const dx = Math.cos(a), dz = Math.sin(a); const rr = w2 * (0.78 + G.hash(t.id * 3 + q * 7 + j) * 0.2); const px = X + dx * rr, pz = Z + dz * rr;
              card4(gl, px, y - w2 * 0.08, pz, w2 * 0.66 + 0.3, a, 0.55 + G.hash(q + j * 3 + t.id) * 0.4, [dx * 0.6, 0.8, dz * 0.6], lc(px, y, pz, dx * 0.6, 0.8, dz * 0.6), 0.12 + u * 0.12, 2); } }
        }
        break;
      }
      case 'palm': case 'banana': {
        // (a trunk that leans and curves, in rings; fronds drooping from its top)
        const lean = (h - 0.5) * 0.5, segs = 4; let px = X, py = Yb, pz = Z; const dx = Math.sin(rot), dz = Math.cos(rot);
        for (let q = 0; q < segs; q++) { const a = lean * (q + 1) / segs; const len = H * 0.85 / segs; g.put(SH.cyl, R3.mat(px, py, pz, rot, 0.36 - q * 0.03, len + 0.05, 0.36 - q * 0.03, a, 0), (X2, Y2, Z2, nx, ny) => G.lerpColor(bark, [bark[0] * 0.75, bark[1] * 0.75, bark[2] * 0.75], ((Y2 - Y) * 2.2) % 1 > 0.5 ? 1 : 0), BARK - q * 0.04); px += dx * Math.sin(a) * len; pz += dz * Math.sin(a) * len; py += Math.cos(a) * len; }
        if (!burnt) {
          const fl = (3.6 * sz + 1) * (t.kind === 'banana' ? 0.8 : 1); const nf = t.kind === 'banana' ? 7 : 11;
          for (let q = 0; q < nf; q++) {
            const a = q / nf * TAU + rot + (G.hash(t.id + q) - 0.5) * 0.3, cs = Math.cos(a), sn = Math.sin(a); const wd = t.kind === 'banana' ? 0.9 : 0.55; const dr = 0.8 + G.hash(t.id * 3 + q) * 0.5;
            // (each frond in three pieces, rising a little, then falling; and its leaflets either side)
            const P0 = [px, py, pz], P1 = [px + cs * fl * 0.35, py + 0.45 * dr, pz + sn * fl * 0.35], P2 = [px + cs * fl * 0.7, py + 0.1, pz + sn * fl * 0.7], P3 = [px + cs * fl, py - 0.9 * dr, pz + sn * fl];
            const c0 = pal[1], c1 = pal[0], c2 = pal[2];
            gp.blade(P0[0], P0[1], P0[2], wd * 0.6, a + Math.PI / 2, P1[0], P1[1], P1[2], c0, c1, 0.25);
            gp.blade(P1[0], P1[1], P1[2], wd, a + Math.PI / 2, P2[0], P2[1], P2[2], c1, c2, 0.4);
            gp.blade(P2[0], P2[1], P2[2], wd * 0.8, a + Math.PI / 2, P3[0], P3[1], P3[2], c2, c1, 0.6);
            if (t.kind !== 'banana') for (const sd of [-1, 1]) for (let j = 1; j <= 3; j++) { const f = j / 4; const Q = [P1[0] + (P2[0] - P1[0]) * f, P1[1] + (P2[1] - P1[1]) * f, P1[2] + (P2[2] - P1[2]) * f]; const la = a + sd * 1.1; gp.blade(Q[0], Q[1], Q[2], 0.16, a, Q[0] + Math.cos(la) * 0.9, Q[1] - 0.45, Q[2] + Math.sin(la) * 0.9, c1, c2, 0.5); }
          }
          if (k[3]) { for (let q = 0; q < 3; q++) { const fx = px + Math.cos(q * 2.1) * 0.35, fz = pz + Math.sin(q * 2.1) * 0.35; g.sph = [fx, py - 0.5, fz, 1]; g.put(SH.ico0, R3.mat(fx, py - 0.5, fz, q, 0.5), k[3], FRUIT + 0.2); } g.sph = null; }
        }
        break;
      }
      case 'cactus': {
        // (a column of a dozen ribs, its crown rounded and paler; its arms going out and turning up at an elbow)
        const c = (X2, Y2, Z2, nx, ny) => (ny > 0.75 ? G.lerpColor(pal[0], pal[2], 0.45) : pal[0]);
        const hh = 2.5 * sz + 0.8; g.put(FS.cact, R3.mat(X, Yb, Z, rot, 0.7, hh + dY, 0.7), c, CACTUS); g.put(FS.cactTop, R3.mat(X, Y + hh, Z, rot, 0.7, 0.5, 0.7), c, CACTUS);
        for (const sd of [-1, 1]) { if ((t.v || 0) === (sd > 0 ? 1 : 2)) continue; const ax = X + Math.cos(rot) * 0.3 * sd, az = Z + Math.sin(rot) * 0.3 * sd, ay = Y + hh * (sd > 0 ? 0.42 : 0.32);
          const ex = X + Math.cos(rot) * 0.78 * sd, ez = Z + Math.sin(rot) * 0.78 * sd, ey = ay + 0.12;
          limb(g, FS.cactArm, ax, ay - 0.02, az, ex, ey, ez, 0.2, c, CACTUS); g.put(SH.sph, R3.mat(ex, ey, ez, 0, 0.4, 0.4, 0.4), c, CACTUS);
          g.put(FS.cactArm, R3.mat(ex, ey, ez, rot, 0.38, hh * 0.42, 0.38), c, CACTUS); g.put(FS.cactTop8, R3.mat(ex, ey + hh * 0.42, ez, rot, 0.38, 0.26, 0.38), c, CACTUS); }
        break;
      }
      case 'bush': {
        // (a shrub of the fields: lumps of leaves on a few stems, its fruit among them)
        const r = sz + 0.45;
        for (let q = 0; q < 3; q++) { const a = rot + q * 2.1; limb(g, FS.limb, X, Yb - 0.02, Z, X + Math.cos(a) * r * 0.35, Y + 0.9, Z + Math.sin(a) * r * 0.35, 0.07, bc, BARK - 0.05); }
        if (!burnt) crownInto(g, gl, t.id, X, Y + 0.6 + r * 0.35, Z, r, 6, 0.8, pal, snow, 0.15, 1, 2);
        // (its fruit, each round and lit as one)
        if (k[3] && !burnt) { for (let q = 0; q < 12; q++) { const a = q * 1.7 + G.hash(t.id * 5 + q) * 0.8, d = r * (0.62 + G.hash(t.id * 9 + q) * 0.28); const px = X + Math.cos(a) * d, py = Y + 0.62 + r * 0.2 + G.hash(t.id * 3 + q) * 0.5, pz = Z + Math.sin(a) * d; g.sph = [px, py, pz, 1]; g.put(SH.ico0, R3.mat(px, py, pz, q, 0.085), k[3], FRUIT + 0.15); } g.sph = null; }
        break;
      }
      case 'flat': {
        // (the acacia: a trunk that forks, an umbrella of flat lumps, its small leaves at the rim)
        g.put(FS.trunk, R3.mat(X, Yb, Z, rot, 0.46, H * 0.47 + dY, 0.46), bc, BARK);
        const R = 3.5 * sz + 0.6;
        for (let q = 0; q < 4; q++) { const a = rot + q * 1.6 + G.hash(t.id + q) * 0.6; limb(g, FS.limb, X, Y + H * 0.42, Z, X + Math.cos(a) * R * 0.55, Y + H * 0.78, Z + Math.sin(a) * R * 0.55, 0.15, bc, BARK - 0.05); }
        if (!burnt) crownInto(g, gl, t.id, X, Y + H * 0.8, Z, R, 7, 0.32, pal, snow, 0.22, 1, 3);
        break;
      }
      case 'baobab': {
        g.put(FS.trunk, R3.mat(X, Yb, Z, rot, 2.2 * sz + 0.4, H * 0.62 + dY, 2.2 * sz + 0.4), bc, BARK);
        for (let q = 0; q < 5; q++) { const a = rot + q * 1.26; limb(g, FS.limb, X, Y + H * 0.56, Z, X + Math.sin(a) * H * 0.24, Y + H * 0.82, Z + Math.cos(a) * H * 0.24, 0.22, bc, BARK - 0.05);
          if (!burnt) lump(X + Math.sin(a) * H * 0.24, Y + H * 0.84, Z + Math.cos(a) * H * 0.24, 2.2 * sz + 0.6, 1.2, 2.2 * sz + 0.6, 2, 0.2); }
        break;
      }
      case 'willow': {
        g.put(FS.trunk, R3.mat(X, Yb, Z, rot, 0.7, H * 0.5 + dY, 0.7), bc, BARK);
        if (!burnt) {
          const R = 2.8 * sz + 0.9;
          for (let q = 0; q < 3; q++) { const a = rot + q * 2.1; limb(g, FS.limb, X, Y + H * 0.4, Z, X + Math.cos(a) * R * 0.5, Y + H * 0.66, Z + Math.sin(a) * R * 0.5, 0.2, bc, BARK - 0.05); }
          crownInto(g, gl, t.id, X, Y + H * 0.62, Z, R, 7, 0.78, pal, snow, 0.25, 1, 2);
          // (the hanging curtains of leaves)
          for (let q = 0; q < 26; q++) { const a = rot + q / 26 * TAU, d = R * (1.0 + G.hash(t.id + q) * 0.25), ty = Y + H * 0.58 + G.hash(t.id * 3 + q) * 0.8; const lx = X + Math.cos(a) * d, lz = Z + Math.sin(a) * d;
            gp.blade(lx, ty, lz, 0.32, a + Math.PI / 2, lx + Math.cos(a) * 0.2, ty - H * 0.4, lz + Math.sin(a) * 0.2, pal[0], pal[1], 0.7); }
        }
        break;
      }
      default: { // broad crowns: oak, birch, the fruit trees, the tall trees of the forests of the south
        const { tall, r } = D; const birch = t.kind === 'birch'; const jung = k[0] === 'tall'; const olive = t.kind === 'olive';
        const r0 = (olive ? 0.36 : 0.27) * sz + 0.1; const tc = birch ? (X2, Y2, Z2, nx, ny) => (Math.floor((Y2 - Y) * 2.6 + h * 5) % 4 === 0 ? [46, 42, 38] : bark) : bc;
        const cy = Y + D.cy;
        if (olive) {
          // (an olive: a short thick trunk, leaning and twisting, that splits in two at a man's height into the crown)
          const fx = X + Math.cos(rot) * H * 0.1, fz = Z + Math.sin(rot) * H * 0.1, fy = Y + H * 0.27;
          limb(g, FS.trunk, X, Yb, Z, fx, fy, fz, r0, bc, BARK);
          for (let q = 0; q < 2; q++) { const a = rot + (q ? 2.3 : -0.9) + (h - 0.5) * 0.6; limb(g, FS.limb, fx, fy - 0.1, fz, X + Math.cos(a) * r * 0.42, cy - r * 0.1, Z + Math.sin(a) * r * 0.42, r0 * 0.62, bc, BARK - 0.04); }
        } else g.put(FS.trunk, R3.mat(X, Yb, Z, rot, r0 * 2, H * 0.58 * tall + dY, r0 * 2), tc, BARK);
        if (fine && sz > 0.5) rootsInto(g, t.id, X, Y, Z, r0, jung ? 5 : 4, bc);
        // (the boughs: forking from the trunk up into the crown, seen between its lumps)
        const nb = birch ? 3 : olive ? 0 : 4;
        for (let q = 0; q < nb; q++) {
          const a = rot + q * TAU / nb + G.hash(t.id * 31 + q) * 0.7, fy = Y + H * (0.36 + G.hash(t.id + q * 3) * 0.12) * tall, e = r * (0.48 + G.hash(t.id * 37 + q) * 0.2);
          const ex = X + Math.cos(a) * e, ey = cy + r * (0.05 + G.hash(t.id * 41 + q) * 0.3), ez = Z + Math.sin(a) * e;
          limb(g, FS.limb, X, fy, Z, ex, ey, ez, r0 * 0.45, bc, BARK - 0.06);
          if (fine && !birch && q % 2 === 0) limb(g, FS.limb, ex, ey, ez, ex + Math.cos(a + 0.8) * r * 0.32, ey + r * 0.32, ez + Math.sin(a + 0.8) * r * 0.32, r0 * 0.24, bc, BARK - 0.12);
        }
        if (!burnt) {
          // (the olive's crown wide and open, of small silver-green leaves)
          const lumps = crownInto(g, gl, t.id, X, cy, Z, olive ? r * 1.12 : r, birch ? 7 : olive ? 8 : 9, birch ? 1.12 : olive ? 0.72 : 1, pal, snow, 0.24, birch || olive ? 1 : jung ? 3 : 0, 4);
          // (its fruit: small — an apple of eight centimetres —, many, hanging on the sides and under the crown's lumps, some
          // of them half among the leaves; the god's colour, a little deeper)
          if (k[3] && t.fruit !== 0) { const fc = G.lerpColor(G.hex2rgb(k[3]), [70, 40, 30], 0.18);
            for (let q = 0; q < lumps.length; q++) { const [lx, ly, lz, ls] = lumps[q]; for (let j = 0; j < 3; j++) {
              const a = G.hash(t.id * 13 + q * 7 + j) * TAU, e = -0.65 + G.hash(t.id * 17 + q * 3 + j) * 1.0, rf = 0.5 * ls * (0.84 + G.hash(t.id * 19 + q + j * 5) * 0.24);
              const px = lx + Math.cos(a) * Math.cos(e) * rf * 1.1, py = ly + Math.sin(e) * rf * 0.92, pz = lz + Math.sin(a) * Math.cos(e) * rf * 1.1;
              g.sph = [px, py, pz, 1]; g.put(SH.ico0, R3.mat(px, py, pz, a, 0.08 + G.hash(q + j * 11 + t.id) * 0.03), fc, FRUIT + 0.25); } }
            g.sph = null; }
        } else for (let q = 0; q < 3; q++) { const a = rot + q * 2.1; limb(g, FS.limb, X, cy - r * 0.3, Z, X + Math.cos(a) * r * 0.7, cy + r * 0.4, Z + Math.sin(a) * r * 0.7, r0 * 0.25, bc, BARK - 0.05); }
      }
    }
    g.sph = null;
  }
  // (a boulder's colour, the god's grey; the sandstone of the dry lands, the dark stone of the forests of the south)
  function rockBase(r, i) { if (r.meteor) return [74, 58, 52]; const b = G.Biome && G.Biome.of ? G.Biome.of(i) : 0; return b === 5 || b === 6 ? [178, 136, 102] : b === 4 ? [124, 122, 108] : [154, 149, 140]; }
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
        // (a boulder: lit on top, darker below; the stone's own grain and moss on its top in the wet lands, snow in the
        // cold — drawn by the plants' material from its mark)
        const base = rockBase(r, i);
        const cold = snowAt(i) > 0.4; const sty = G.Biome && G.Biome.style ? G.Biome.style(i) : 'grass';
        const moss = r.meteor || cold || sty === 'dune' || sty === 'savanna' ? 0 : sty === 'jungle' || sty === 'swamp' || sty === 'taiga' ? 0.85 : 0.45;
        // (its faces softened a little in the light; a stone beside the big one, half sunk)
        g.sph = [r.x * TL, W.groundH(r.x, r.y) * HM, r.y * TL, 0.35];
        // (the shape is the Space's: the feet stand on these very faces)
        const [big, small] = G.Space.stones(r);
        const col = (X, Y, Z, nx, ny) => { let c = G.lerpColor([base[0] * 0.74, base[1] * 0.73, base[2] * 0.74], base, G.clamp(ny * 0.6 + 0.5, 0, 1)); if (ny > 0.55 && cold) c = G.lerpColor(c, SNOW, 0.8); return c; };
        if (small) g.put(SH.dode, R3.mat(small.X, small.Y, small.Z, small.ry, small.sx, small.sy, small.sz), col, ROCK - moss * 0.7);
        g.put(SH.dode, R3.mat(big.X, big.Y, big.Z, big.ry, big.sx, big.sy, big.sz), col, ROCK - moss);
        g.sph = null;
        // (and, near, the stones broken off it lying round its foot, sunk in the ground)
        if (gl) for (let q = 0; q < 5; q++) { const a = G.hash(oid * 7 + q) * TAU, d = big.sx * (0.55 + G.hash(oid * 11 + q) * 0.5), s = 0.08 + G.hash(oid * 13 + q) * 0.12; const px = big.X + Math.cos(a) * d, pz = big.Z + Math.sin(a) * d;
          if (!W.inb(px / TL, pz / TL) || S.road[W.idx(px / TL, pz / TL)]) continue; g.put(SH.dode, R3.mat(px, G.Space.floorY(px, pz) - s * 0.3, pz, a * 3, s * 1.3, s * 0.8, s), col, ROCK - moss * 0.5); }
        // (and, where the land is green, the grass growing up round its foot: the stone sits in the ground, not on it)
        if (gl && moss > 0 && !S.road[i]) { const tc = tileCol(i, x, y); const root = [tc[0] * 0.62, tc[1] * 0.72, tc[2] * 0.55], tip = [Math.min(255, tc[0] * 0.92 + 16), Math.min(255, tc[1] * 1.02 + 10), tc[2] * 0.82];
          for (let q = 0; q < 9; q++) { const a = G.hash(oid * 23 + q) * TAU, d = big.sx * 0.5 * (0.9 + G.hash(oid * 29 + q) * 0.32); const px = big.X + Math.cos(a) * d, pz = big.Z + Math.sin(a) * d;
            if (!W.inb(px / TL, pz / TL) || S.road[W.idx(px / TL, pz / TL)] || S.occ[W.idx(px / TL, pz / TL)]) continue; const py = G.Space.floorY(px, pz) - 0.02;
            for (let k = 0; k < 4; k++) { const ba = a + k * 1.6 + G.hash(oid + q * 3 + k), hh = 0.16 + G.hash(oid * 31 + q * 5 + k) * 0.22; gp.blade(px, py, pz, 0.055, ba + Math.PI / 2, px + Math.cos(ba) * hh * 0.32, py + hh, pz + Math.sin(ba) * hh * 0.32, root, G.lerpColor(root, tip, 0.8), 1); } } }
        continue;
      }
      const b = S.bushes.get(oid);
      if (b) {
        const X = b.x * TL, Z = b.y * TL, Y = W.groundH(b.x, b.y) * HM; const dead = b.burnt > 0; fsh();
        // (the god's green, leaning to the land's own: grey-green and dry where it is hot and dry, the dark of a juniper in the
        // snow, the deep green of the jungle, the swamp's olive — a bush of the place, among the trees of the place)
        const bt = BTONE[G.Biome && G.Biome.of ? G.Biome.of(i) : 0];
        const pal = dead ? [[110, 92, 58], [80, 66, 42], [138, 116, 72]] : BPAL[(b.id % 3 + 3) % 3].map((c, q) => { const f = 0.9 + G.hash(b.id * 3 + 1) * 0.2; const t = bt ? G.lerpColor(c, bt[q], 0.45) : c; return [t[0] * f, t[1] * f, t[2] * f]; });
        // (a bush: a few stems, lumps of leaves on them, sprays of small round leaves standing out of its edge; its berries
        // among them)
        const Yb = Math.min(Y, footY(b.x, b.y, 0.45)) - 0.05;
        for (let q = 0; q < 3; q++) { const a = G.hash(b.id) * TAU + q * 2.1; limb(g, FS.limb, X, Yb, Z, X + Math.cos(a) * 0.3, Y + 0.55, Z + Math.sin(a) * 0.3, 0.05, dead ? [60, 48, 36] : [92, 70, 46], BARK - 0.04); }
        // (green in the snow too: a bush keeps its leaves — the god's view draws it green — and near, its lumps rounder)
        crownInto(g, gl, b.id, X, Y + 0.52, Z, 0.78, 5, 0.75, pal, 0, 0.12, 1, dead ? 1 : 5, gl ? SH.ico : SH.ico0);
        // (the berries in bunches of three on the outside of the bush, each a small round berry lit as one — the god's red,
        // deeper; a bunch the same every time, by the bush's id)
        if (b.berries > 0 && !dead) {
          const bc = BERRY[(b.id % 3 + 3) % 3];
          for (let q = 0; q < Math.min(6, b.berries); q++) {
            const a = G.hash(b.id * 7 + q) * 0.9 + q * 1.05, d = 0.66 + G.hash(b.id * 11 + q) * 0.12, hy = Y + 0.42 + G.hash(b.id * 13 + q) * 0.42;
            const cx = X + Math.cos(a) * d, cz = Z + Math.sin(a) * d;
            for (let j = 0; j < 3; j++) { const aj = a + j * 2.09 + q, px = cx + Math.cos(aj) * 0.045, pz = cz + Math.sin(aj) * 0.045, py = hy + (j === 2 ? 0.05 : -0.01);
              g.sph = [px, py, pz, 1]; g.put(SH.ico0, R3.mat(px, py, pz, j + q, 0.072), j ? bc : G.lerpColor(bc, [190, 60, 70], 0.25), FRUIT + 0.12); }
          }
          g.sph = null;
        }
      }
    }
    return { flora: g.empty ? null : g.build(false, true), plants: gp.empty ? null : gp.build(), leaves: gl && !gl.empty ? gl.build(false, true) : null };
  }
  // (for the tests: the plants and stones of a stretch of land as the near picture draws them — its three geometries)
  R3.floraOf = (x0, y0, w, h) => (THREE ? floraGeo(x0, y0, w, h, false) : null);
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
  // the beyond: the sea to the horizon, past the edge of the map — a frame round it, at the sea's own level (inside the map
  // the sea is its chunks' own: one water over another would hide the shallows under a second, darker sea)
  let ocean = null;
  function makeOcean() {
    if (ocean) { ocean.geometry.dispose(); scene.remove(ocean); }
    const L = G.Space.size(), E = 1400, y = G.SEA * G.Space.HM; const P = [];
    const quad = (x0, z0, x1, z1) => P.push(x0, y, z0, x0, y, z1, x1, y, z1, x0, y, z0, x1, y, z1, x1, y, z0);
    quad(-E, -E, L + E, 0); quad(-E, L, L + E, L + E); quad(-E, 0, 0, L); quad(L, 0, L + E, L);
    const nv = P.length / 3; const c = lin(WATER[4]); const cl = new Float32Array(nv * 4), nr = new Float32Array(nv * 3);
    for (let k = 0; k < nv; k++) { cl[k * 4] = c[0]; cl[k * 4 + 1] = c[1]; cl[k * 4 + 2] = c[2]; cl[k * 4 + 3] = 0.94; nr[k * 3 + 1] = 1; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nr, 3));
    g.setAttribute('color', new THREE.BufferAttribute(cl, 4)); g.setAttribute('aShore', new THREE.BufferAttribute(new Float32Array(nv).fill(-1), 1)); g.computeBoundingSphere();
    ocean = new THREE.Mesh(g, MAT.water); ocean.renderOrder = 1; ocean.frustumCulled = false; scene.add(ocean);
  }
  // (the water's material, for the water other drawings hold — a paddy, a fountain's bowl: WGeo quads or discs drawn with it)
  R3.waterMat = () => MAT.water;
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
  // the hour is the world's (S.time) and nothing else. The sun's way: up in the east a little before the god's pink dawn,
  // over the south at mid-day — no higher than about 55°, so the walls keep a side of light and a side of shade and the
  // shadows their length, as the god's view shades a house — down in the west at his purple dusk; at night it goes on
  // under the world and the moon takes the sky: up in the east at dusk, over the south, down at dawn
  const RISE = -0.015, SET = 0.735;
  const dirOf = (alt, az, out) => out.set(Math.cos(az) * Math.cos(alt), Math.sin(alt), 0.45 * Math.cos(alt) + 0.2).normalize();
  // what the light, the sky and the air are at each height of the sun (the sine of its altitude), in linear light: warm and
  // low at dawn, clean and white at noon, gold late in the day; the glow of the sky round the sun at its rise and set and the
  // pink band opposite it after sunset; the deep blue of the night
  const RAMP = {
    sun: [[-0.06, [1, 0.3, 0.1]], [0, [1, 0.45, 0.2]], [0.08, [1, 0.64, 0.38]], [0.2, [1, 0.8, 0.56]], [0.45, [1, 0.92, 0.8]], [0.8, [1, 0.97, 0.92]]],
    zen: [[-0.3, [0.0035, 0.006, 0.016]], [-0.12, [0.012, 0.02, 0.055]], [-0.04, [0.04, 0.06, 0.16]], [0.05, [0.08, 0.14, 0.34]], [0.2, [0.08, 0.2, 0.5]], [0.6, [0.07, 0.21, 0.56]]],
    hor: [[-0.3, [0.01, 0.014, 0.028]], [-0.12, [0.03, 0.035, 0.07]], [-0.04, [0.2, 0.14, 0.17]], [0, [0.62, 0.42, 0.33]], [0.08, [0.78, 0.66, 0.56]], [0.2, [0.7, 0.75, 0.82]], [0.6, [0.62, 0.74, 0.88]]],
    glow: [[-0.15, [0, 0, 0]], [-0.05, [0.35, 0.1, 0.04]], [0, [1.1, 0.45, 0.15]], [0.1, [0.85, 0.5, 0.22]], [0.3, [0.55, 0.4, 0.24]], [0.5, [0.24, 0.2, 0.15]], [0.8, [0.14, 0.13, 0.11]]],
    belt: [[-0.15, [0, 0, 0]], [-0.04, [0.12, 0.06, 0.1]], [0.03, [0.14, 0.08, 0.1]], [0.12, [0, 0, 0]]],
    // (the eye opens as the light goes: dusk and night are dark, but one sees in them)
    exp: [[-0.3, 1.75], [-0.1, 1.5], [0, 1.3], [0.1, 1.18], [0.3, 1.07], [0.55, 1]],
  };
  // the low mist over the hours of the day (S.time): thick at dawn, still lying in the morning, burnt off by noon, a little
  // back at dusk and at night
  // (the same height of the sun is not the same hour: the morning's air is cool and clear, the afternoon's warmer — a touch
  // only, over the god's own light: by the hour, a tint of the sun and of the sky at the horizon)
  const AIRT = [[0, [1, 1, 1]], [0.08, [1, 1, 1]], [0.16, [0.96, 0.985, 1.05]], [0.32, [0.97, 0.99, 1.035]], [0.42, [1, 1, 1]], [0.52, [1.025, 1, 0.95]], [0.6, [1.02, 1, 0.96]], [0.68, [1, 1, 1]], [1, [1, 1, 1]]];
  const MIST = [[0, 1], [0.06, 0.95], [0.16, 0.7], [0.3, 0.42], [0.42, 0.18], [0.6, 0.16], [0.72, 0.32], [0.8, 0.42], [0.95, 0.65], [1, 1]];
  // (a ramp of keys [s, value]: the value at s, eased between its keys)
  function ramp(R, s, out) {
    const n = R.length; let a = R[0], b = R[0], u = 0;
    if (s >= R[n - 1][0]) a = b = R[n - 1]; else if (s > R[0][0]) { let k = 0; while (s > R[k + 1][0]) k++; a = R[k]; b = R[k + 1]; u = (s - a[0]) / (b[0] - a[0]); u = u * u * (3 - 2 * u); }
    if (typeof a[1] === 'number') return a[1] + (b[1] - a[1]) * u;
    for (let k = 0; k < 3; k++) out[k] = a[1][k] + (b[1][k] - a[1][k]) * u; return out;
  }
  const lum = c => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  const LT = { air: [1, 1, 1], sun: [0, 0, 0], zen: [0, 0, 0], hor: [0, 0, 0], glow: [0, 0, 0], belt: [0, 0, 0], fill: [0, 0, 0], sky: [0, 0, 0], bounce: [0, 0, 0], key: [0, 0, 0] };
  R3.LT = LT; // (the light of this hour, read only: for the tests and for what wants to match it)
  let _sd = null, _md = null, _cf = null, shadowKey = '';
  function light(focus) {
    if (!_sd) { _sd = new THREE.Vector3(); _md = new THREE.Vector3(); _cf = new THREE.Vector3(); }
    const S = G.S; const w = S.weather; const t = S.time; const night = G.clamp(G.Render.nightness(), 0, 1);
    const rain = G.clamp(w.rain || 0, 0, 1), storm = G.clamp(w.storm || 0, 0, 1);
    // the sun and the moon where the hour has them
    let k = t - RISE; k -= Math.floor(k); const DAY = SET - RISE;
    let alt, az, malt = -0.5, maz = 0;
    if (k <= DAY) { const u = k / DAY; alt = 0.96 * Math.sin(Math.PI * u); az = Math.PI * u; }
    else { const u = (k - DAY) / (1 - DAY); alt = -0.75 * Math.pow(Math.sin(Math.PI * u), 1.6); az = Math.PI * (1 + u); malt = 0.8 * Math.sin(Math.PI * u) - 0.03; maz = Math.PI * u; } // (slow just under the horizon: the dusk and the dawn last as long as the god's)
    dirOf(alt, az, _sd); dirOf(malt, maz, _md);
    const s = _sd.y; const dayL = G.smooth(-0.15, 0.1, s); // (the sine of the sun's height: every colour of the hour is read by it)
    // (the god's light of the hour — its hue only: the pink of his dawn, the gold of his afternoon, the blue of his night, the
    // grey of his rain — tints it all, as it tints his picture: the same dawn and the same dusk from both heights)
    const a = G.Render.ambient(); const am = Math.max(a[0], a[1], a[2], 1); const hue = [a[0] / am, a[1] / am, a[2] / am];
    const tint = (c, f) => { for (let q = 0; q < 3; q++) c[q] *= 1 - f + f * hue[q]; return c; };
    const sunC = tint(ramp(RAMP.sun, s, LT.sun), 0.6), zen = tint(ramp(RAMP.zen, s, LT.zen), 0.3), hor = tint(ramp(RAMP.hor, s, LT.hor), 0.35);
    const glow = tint(ramp(RAMP.glow, s, LT.glow), 0.65), belt = ramp(RAMP.belt, s, LT.belt);
    { const at = ramp(AIRT, t - Math.floor(t), LT.air); for (let q = 0; q < 3; q++) { sunC[q] *= at[q]; hor[q] *= 1 + (at[q] - 1) * 0.6; } }
    // (rain: the sky goes grey and low, the sun white and dim behind it, its glow gone)
    { const g = 0.06 + 0.3 * dayL; const wet = rain * 0.8 + storm * 0.2;
      for (let q = 0; q < 3; q++) { const gq = g * [0.95, 1, 1.08][q]; zen[q] += (gq * 0.85 - zen[q]) * wet; hor[q] += (gq - hor[q]) * wet * 0.85; glow[q] *= 1 - wet * 0.85; belt[q] *= 1 - wet; } }
    // the key light: the sun while it is up (dim and red near the horizon, through more air), the moon when it is not
    const sunI = 3 * (0.45 + 0.55 * G.smooth(0, 0.6, s)) * G.smooth(-0.03, 0.06, s) * (1 - rain * 0.72) * (1 - storm * 0.3);
    const moonI = 0.42 * G.smooth(-0.02, 0.15, _md.y) * G.smooth(0.05, -0.1, s) * (1 - rain * 0.8);
    const byMoon = moonI > sunI; const key = LT.key;
    if (byMoon) { key[0] = 0.62; key[1] = 0.72; key[2] = 1; tint(key, 0.4); } else { key[0] = sunC[0]; key[1] = sunC[1]; key[2] = sunC[2]; }
    const keyI = byMoon ? moonI : sunI; const kd = byMoon ? _md : _sd;
    sun.color.setRGB(key[0], key[1], key[2]); sun.intensity = keyI;
    // the sky's light in the shade: the sky that is drawn, averaged over the dome (blue by day, as a painter has it), and a
    // floor of night light — the stars, the moon's scattered glow: a night is dark, never black. From below, the warm
    // bounce of the land in the sun
    const fill = LT.fill; for (let q = 0; q < 3; q++) fill[q] = hor[q] * 0.55 + zen[q] * 0.45;
    const skyIrr = LT.sky, bounce = LT.bounce; const NF = [0.045, 0.06, 0.11];
    for (let q = 0; q < 3; q++) { skyIrr[q] = fill[q] * 0.68 * Math.PI + NF[q] * (1 - dayL) * (1 - rain * 0.5); bounce[q] = (key[q] * keyI * Math.max(kd.y, 0) + skyIrr[q] * 0.4) * [0.22, 0.2, 0.15][q]; }
    hemi.intensity = 1; hemi.color.setRGB(skyIrr[0], skyIrr[1], skyIrr[2]); hemi.groundColor.setRGB(bounce[0], bounce[1], bounce[2]);
    // the sky's dome: its colours, the discs, the clouds lit by the key light (gold at sunset, grey and low in the rain)
    skyU.top.value.setRGB(zen[0], zen[1], zen[2]); skyU.hor.value.setRGB(hor[0], hor[1], hor[2]); skyU.night.value = night;
    skyU.sunDir.value.copy(_sd); skyU.sunCol.value.setRGB(sunC[0], sunC[1], sunC[2]).multiplyScalar(G.smooth(-0.02, 0.04, s) * (1 - rain * 0.7));
    skyU.disc.value.setRGB(sunC[0], sunC[1], sunC[2]).multiplyScalar(24 * G.smooth(-0.02, 0.02, s) * (1 - rain * 0.9));
    skyU.moonDir.value.copy(_md); skyU.moonCol.value.setRGB(0.85, 0.9, 1).multiplyScalar(2.4 * G.smooth(-0.02, 0.06, _md.y) * G.smooth(0.08, -0.08, s) * (1 - rain));
    skyU.keyDir.value.copy(kd);
    skyU.cover.value = G.clamp(0.36 + rain * 0.55 + storm * 0.2 + (S.clouds ? Math.min(0.15, S.clouds.length * 0.01) : 0), 0, 0.98);
    skyU.cloudCol.value.setRGB(key[0] * keyI * 0.24 + skyIrr[0] * 0.24, key[1] * keyI * 0.24 + skyIrr[1] * 0.24, key[2] * keyI * 0.24 + skyIrr[2] * 0.24);
    skyU.cloudSh.value.setRGB(skyIrr[0] * 0.27 + key[0] * keyI * 0.05, skyIrr[1] * 0.27 + key[1] * keyI * 0.05, skyIrr[2] * 0.27 + key[2] * keyI * 0.05);
    stars.material.opacity = G.smooth(-0.03, -0.16, s) * (1 - rain); skyU.uStars.value = stars.material.opacity * (1 - skyU.cover.value * 0.6);
    // the air (every material reads it: GX)
    const q = R3.Q();
    GX.gxSunW.value.x = _sd.x; GX.gxSunW.value.y = _sd.y; GX.gxSunW.value.z = _sd.z;
    GX.gxHor.value.x = hor[0]; GX.gxHor.value.y = hor[1]; GX.gxHor.value.z = hor[2];
    GX.gxGlow.value.x = glow[0]; GX.gxGlow.value.y = glow[1]; GX.gxGlow.value.z = glow[2];
    GX.gxBelt.value.x = belt[0]; GX.gxBelt.value.y = belt[1]; GX.gxBelt.value.z = belt[2];
    { const A = GX.gxAir.value, A2 = GX.gxAir2.value; const mist = ramp(MIST, t - Math.floor(t));
      A.x = 1.25 / Math.max(120, q.view) * (1 + rain * 0.8 + storm * 0.4); A.y = 0.0055 * mist * (1 + rain * 1.2); A.z = 0.12 / scene.scale.y; A.w = G.SEA * G.Space.HM * scene.scale.y;
      // (the haze starts past what the eye looks at: from far up, in the descent, the town is not lost in it)
      const cd = focus ? Math.hypot(camera.position.x - focus.X, camera.position.y - (focus.Y || 0), camera.position.z - focus.Z) : 0;
      A2.x = Math.max(0, cd - 8) * 0.9; A2.y = 1250; A2.z = 1520; A2.w = 0.5 + 0.5 * dayL; }
    scene.fog.color.setRGB(hor[0], hor[1], hor[2]); U.sky.value.setRGB(hor[0], hor[1], hor[2]).lerp(skyU.top.value, 0.55);
    renderer.setClearColor(scene.fog.color);
    renderer.toneMappingExposure = ramp(RAMP.exp, s) * (1 + rain * 0.12);
    // (the water: the key light on it, the sky's light on it, the bed under it)
    WU.key.value.setRGB(key[0] * keyI, key[1] * keyI, key[2] * keyI); WU.irr.value.setRGB(skyIrr[0], skyIrr[1], skyIrr[2]); WU.k.value = scene.scale.y; bedTick();
    G.Build3D && G.Build3D.night(G.clamp((night - 0.25) * 1.6, 0, 1)); // (the windows light up as the dark comes)
    // the dome and the stars go with the eye; the key light's picture of the shadows over the ground round the body
    skyMesh.position.copy(camera.position); stars.position.copy(camera.position);
    if (focus) placeKey(kd, focus, q);
    return kd;
  }
  // (for the verifier: the light of the hour is numbers in their range; the key light is the sun by day and the moon by night,
  // and its picture of the shadows covers the body; the bed the water reads is the land's)
  R3.lightCheck = function () {
    const out = []; if (!renderer || !R3.on) return out;
    const bad = v => !Number.isFinite(v);
    for (const k in LT) if (LT[k].some(bad)) out.push(`luz: ${k} não é número`);
    for (const k in GX) { const v = GX[k].value; if (bad(v.x) || bad(v.y) || bad(v.z) || bad(v.w)) out.push(`ar: ${k} não é número`); }
    const e = renderer.toneMappingExposure; if (bad(e) || e < 0.5 || e > 3) out.push(`exposição fora do lugar: ${e}`);
    if (bad(sun.intensity) || sun.intensity < 0 || sun.intensity > 4) out.push(`luz principal com intensidade ${sun.intensity}`);
    const s = skyU.sunDir.value.y; if (s > 0.1 && skyU.keyDir.value.dot(skyU.sunDir.value) < 0.999) out.push('de dia, a luz principal não é o sol');
    if (sun.castShadow && U.body.value && U.body.value.w) { const b = U.body.value; const c = sun.target.position; const h = sun.shadow.camera.right; if (Math.abs(b.x - c.x) > h || Math.abs(b.z - c.z) > h) out.push('a imagem das sombras não cobre o corpo'); }
    const bc = R3.bedCheck(48); if (bc.bad > 2) out.push(`leito da água: ${bc.bad} de ${bc.n} pontos fora da altura do chão`);
    return out;
  };
  // the key light's picture of what is near the body (its shadows): a square of ground round the body, pushed a little ahead
  // of the eye (what one looks at gets the texels), its texels fixed on the land (walking, the shadows do not crawl), and only
  // as deep as the near world, so the shadows still touch the feet that cast them
  function placeKey(dir, focus, q) {
    const half = q.sbox || 45, size = sun.shadow.mapSize.x || 1024;
    camera.getWorldDirection(_cf); let fx = _cf.x, fz = _cf.z; const fl = Math.hypot(fx, fz); if (fl > 1e-3) { fx /= fl; fz /= fl; } else fx = fz = 0;
    let cx = focus.X + fx * half * 0.3, cy = focus.Y || 0, cz = focus.Z + fz * half * 0.3;
    // (the light's frame as three.js's lookAt makes it: z toward the light, x = up × z, y = z × x)
    const xl = Math.hypot(dir.z, dir.x) || 1, xx = dir.z / xl, xz = -dir.x / xl; const yx = dir.y * xz, yy = dir.z * xx - dir.x * xz, yz = -dir.y * xx;
    const tx = 2 * half / size; const u = cx * xx + cz * xz, v = cx * yx + cy * yy + cz * yz;
    const du = Math.round(u / tx) * tx - u, dv = Math.round(v / tx) * tx - v;
    cx += du * xx + dv * yx; cy += dv * yy; cz += du * xz + dv * yz;
    const D = half * 2.5 + 20; sun.position.set(cx + dir.x * D, cy + dir.y * D, cz + dir.z * D); sun.target.position.set(cx, cy, cz); sun.target.updateMatrixWorld();
    const kk = half + ':' + size; if (kk !== shadowKey) {
      shadowKey = kk; const c = sun.shadow.camera; c.left = -half; c.right = half; c.top = half; c.bottom = -half; c.near = Math.max(1, D - half * 2.5 - 20); c.far = D + half * 2.5 + 20; c.updateProjectionMatrix();
      // (a bias of a few centimetres in the picture's depth, and along the normal a little under a texel: no stripes of
      // self-shadow on the lit walls, and no gap between a foot and its shadow)
      sun.shadow.bias = -0.05 / (c.far - c.near); sun.shadow.normalBias = tx * 0.7;
    }
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
    light(focus); // (the hour's light, the sky, the air; the sun's picture of the shadows round the focus)
    // (the wind of the world bends the plants; the body walking parts them)
    { const w = G.S.weather; const ws = G.clamp(w.windS || 0, 0, 2); U.wind.value.set(Math.cos(w.windA || 0) * (0.35 + ws), Math.sin(w.windA || 0) * (0.35 + ws), ws); }
    if (focus) U.body.value.set(focus.X, focus.Y || 0, focus.Z, 1); else U.body.value.w = 0;
    G.Ground3D.tick(focus);
    // (the clouds' shadows move as the sky's clouds do; darker under a bright sun, none at night)
    { const w = U.wind.value; const T = U.time.value; G.Ground3D.clouds(w.x * T * 0.0016 * 4.7, w.y * T * 0.0016 * 4.7, skyU.cover.value, G.clamp(sun.intensity / 3, 0, 1) * 0.3); }
    if (focus) stream(focus.X, focus.Z, budget === undefined ? 6 : budget);
    G.People3D && G.People3D.update && G.People3D.update(rdt, focus);
    G.Things3D && G.Things3D.update && G.Things3D.update(rdt, focus); // (before the fire's drawing: it hands over its flames)
    G.FX3D && G.FX3D.update && G.FX3D.update(rdt, focus);
    G.Dragon3D && G.Dragon3D.update && G.Dragon3D.update(rdt, focus);
    G.Grass3D && G.Grass3D.update && G.Grass3D.update(rdt, focus, camera);
    if (!(G.Post3D && G.Post3D.render(scene, camera))) renderer.render(scene, camera); // (the post-processing, where the quality has it)
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
