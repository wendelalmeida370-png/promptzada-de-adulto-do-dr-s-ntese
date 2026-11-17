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
  // gxLM, gxLM2: the picture of the light of the flames round the body (FX3D paints it: its colour; where it comes from) ·
  // gxLMB: (its corner x, z [m], 1 / its side [1/m], on — and the world's height on the screen) · gxLMY: (the height its
  // sources are measured from [m], the most light it holds, the span of its offsets [m], -) · gxGr: (how much of the night's
  // grade: the colours going out in the dark, -, -, -) · gxAmb: (the sky's light now against noon's, 0.1 at night to 1; -, -, -:
  // for a light a material makes of its own — a rim, a glow — that must go down with the day's)
  const GX = { gxSunW: v4(0, 1, 0, 0), gxHor: v4(0.6, 0.7, 0.85, 0), gxGlow: v4(0, 0, 0, 0), gxBelt: v4(0, 0, 0, 0), gxAir: v4(0.003, 0.001, 0.11, 3), gxAir2: v4(0, 1250, 1520, 1),
    gxLM: { value: null }, gxLM2: { value: null }, gxLMB: v4(0, 0, 0, 0), gxLMY: v4(0, 16, 32, 0), gxGr: v4(0, 0.09, 0.25, 1), gxTn: v4(0.5, 0, 0, 0), gxAmb: v4(1, 0, 0, 0) };
  R3.GX = GX;
  // (the haze of the horizon in a direction: shared by the sky's dome and the air in front of everything, so the far land
  // melts into exactly the sky behind it)
  const GXHAZE = `uniform vec3 gxSunW; uniform vec3 gxHor; uniform vec3 gxGlow; uniform vec3 gxBelt;
vec3 gxHaze( vec3 d ) {
	float cs = dot( d, gxSunW ); float s = max( cs, 0.0 ); float s2 = s * s; float s4 = s2 * s2; float s8 = s4 * s4; float a = max( - cs, 0.0 );
	return gxHor + gxGlow * ( s4 * 0.45 + s8 * s8 * 0.55 ) + gxBelt * a * a;
}`;
  // (the grade after the tone curve, the same here and in the post-processing's last pass)
  const GXGRADE = `uniform vec4 gxGr; uniform vec4 gxTn;
// (three.js's neutral curve — Khronos PBR Neutral — the very one, with the darks it crushes in its toe given back as much as
// gxTn.x says (0 the curve's own, 1 a straight line at black): the dark wood in the shade, and under the moon, where nearly
// all the picture lies in the toe, keep their colour instead of going black)
vec3 gxTone( vec3 color ) {
	const float sc = 0.8 - 0.04; const float ds = 0.15;
	float x = min( color.r, min( color.g, color.b ) ); color -= x < 0.08 ? ( x - 6.25 * x * x ) * ( 1.0 - gxTn.x * ( 1.0 - x * 12.5 ) ) : 0.04; // (given back only near black: the same curve from 0.08 up)
	float peak = max( color.r, max( color.g, color.b ) ); if ( peak < sc ) return color;
	float d = 1.0 - sc; float np = 1.0 - d * d / ( peak + d - sc ); color *= np / peak;
	float g = 1.0 - 1.0 / ( ds * ( peak - np ) + 1.0 ); return mix( color, vec3( np ), g );
}
vec3 gxGrade( vec3 c ) {
	float lum = dot( c, vec3( 0.2126, 0.7152, 0.0722 ) );
	// (a little richer in the middle tones, not in the lights: green stays moss, never neon)
	c = max( mix( vec3( lum ), c, 1.0 + gxGr.y * ( 1.0 - smoothstep( 0.5, 0.95, lum ) ) ), 0.0 );
	// (a gentle S in the eye's own scale: the shade deeper, the light brighter — not washed out; the darks kept)
	vec3 cp = sqrt( c ); cp = mix( cp, cp * cp * ( 3.0 - 2.0 * cp ), gxGr.z * smoothstep( 0.18, 0.5, cp ) ); c = cp * cp;
	// (at night the eye loses the colours of what is dim — the moonlit land goes blue-grey — and keeps them where a flame
	// lights: the warm pools stand out of the cool night, as they do)
	c = mix( c, vec3( lum ) * vec3( 0.8, 0.92, 1.16 ), gxGr.x * ( 1.0 - smoothstep( 0.03, 0.3, lum ) ) );
	// (the painter's split: the shadows a little cool, the lights a little warm)
	return c * mix( vec3( 1.0 - 0.04 * gxGr.w, 1.0 - 0.015 * gxGr.w, 1.0 + 0.04 * gxGr.w ), vec3( 1.0 + 0.025 * gxGr.w, 1.0, 1.0 - 0.03 * gxGr.w ), smoothstep( 0.04, 0.5, lum ) );
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
    // soft shadows where the quality has them (the key light's shadow.radius > 0: how many texels of penumbra one unit of the
    // picture's depth between a thing and its shadow makes): as the sun's are — sharp where a thing touches the ground, softer
    // the farther the shade falls from what casts it (a post's foot crisp, the crown of a tree a blur). The things in the way
    // are looked for first in a disc round the point; where there are none it is lit, where all the disc is in the way it is
    // shade, and only the edge between is gathered from a disc as wide as its penumbra — turned at each texel of the sun's
    // picture, so its grain stays on the land and does not crawl with the eye
    const disc = (n, k) => { const o = []; for (let i = 0; i < n; i++) { const r = Math.sqrt((i + 0.5) / n), a = i * 2.39996323 + k; o.push(`vec2(${(Math.cos(a) * r).toFixed(4)}, ${(Math.sin(a) * r).toFixed(4)})`); } return `const vec2 ${n === 10 ? 'GXB' : 'GXP'}[${n}] = vec2[${n}](${o.join(', ')});`; };
    rep('shadowmap_pars_fragment', 'float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {', `${disc(10, 0.6)}
	${disc(16, 0)}
	float gxSoft( sampler2D sm, vec2 size, float pk, vec3 sc ) {
		vec2 tx = 1.0 / size; vec2 cell = floor( sc.xy * size * 0.5 );
		float an = 6.2831853 * fract( sin( dot( cell, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 ); mat2 rot = mat2( cos( an ), sin( an ), - sin( an ), cos( an ) );
		// (the receiver's own slope in the picture's depth, from the screen's derivatives: each sample is compared with the
		// surface's own depth there, so a roof or a hillside turned from the sun does not shade itself in a wide disc)
		vec3 sx = dFdx( sc ), sy = dFdy( sc ); float det = sx.x * sy.y - sx.y * sy.x;
		vec2 dz = abs( det ) > 1e-14 ? clamp( vec2( sx.z * sy.y - sx.y * sy.z, sx.x * sy.z - sx.z * sy.x ) / det, -1.5, 1.5 ) : vec2( 0.0 );
		// (the point itself first: a post or a leg right over it is never missed between the samples of the disc)
		float zb = unpackRGBAToDepth( texture2D( sm, sc.xy ) ), nb = step( zb, sc.z ); zb *= nb;
		for ( int i = 0; i < 10; i ++ ) { vec2 o = rot * GXB[ i ] * 9.0 * tx; float d = unpackRGBAToDepth( texture2D( sm, sc.xy + o ) ); if ( d < sc.z + dot( dz, o ) ) { zb += d; nb += 1.0; } }
		if ( nb < 0.5 ) return 1.0;
		float pen = clamp( ( sc.z - zb / nb ) * pk, 1.25, 9.0 );
		if ( nb > 10.5 && pen < 8.0 ) return 0.0;
		float s = 0.0;
		for ( int i = 0; i < 16; i ++ ) { vec2 o = rot * GXP[ i ] * pen * tx; s += step( sc.z + dot( dz, o ), unpackRGBAToDepth( texture2D( sm, sc.xy + o ) ) ); }
		return s * ( 1.0 / 16.0 );
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {`);
    rep('shadowmap_pars_fragment', `#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;`, `#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			if ( shadowRadius > 0.0 ) shadow = gxSoft( shadowMap, shadowMapSize, shadowRadius, shadowCoord.xyz ); else {
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;`);
    rep('shadowmap_pars_fragment', `) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )`, `) * ( 1.0 / 9.0 ); }
		#elif defined( SHADOWMAP_TYPE_VSM )`);
    // the light of the flames and the lit doorways round the body (FX3D paints it into gxLM each frame: its colour, and in
    // gxLM2 where it comes from): every lit material adds it to the light of the sky, as a light of its own — turned to it,
    // falling off with the distance — a pool of warm light round a campfire, the street before a door, the face by a torch
    SC.lights_fragment_maps += `
#if defined( RE_IndirectDiffuse )
	if ( gxLMB.w > 0.0 ) {
		vec3 lmW = cameraPosition + ( vec4( geometryPosition, 0.0 ) * viewMatrix ).xyz; vec2 lmU = ( lmW.xz - gxLMB.xy ) * gxLMB.z;
		if ( lmU.x > 0.0 && lmU.y > 0.0 && lmU.x < 1.0 && lmU.y < 1.0 ) {
			vec4 lm1 = texture2D( gxLM, lmU );
			if ( lm1.r + lm1.g > 0.004 ) {
				vec4 lm2 = texture2D( gxLM2, lmU );
				vec3 lmL = vec3( ( lm2.r - 0.5 ) * gxLMY.z, ( gxLMY.x + ( lm2.b - 0.5 ) * gxLMY.z ) * gxLMB.w - lmW.y, ( lm2.g - 0.5 ) * gxLMY.z );
				float lmD = dot( lmL, lmL ); lmL *= inversesqrt( max( lmD, 1e-4 ) );
				irradiance += lm1.rgb * lm1.rgb * gxLMY.y * saturate( dot( ( vec4( geometryNormal, 0.0 ) * viewMatrix ).xyz, lmL ) * 0.8 + 0.2 ) / ( 1.0 + lmD * 0.45 );
			}
		}
	}
#endif`;
    SC.lights_pars_begin += '\nuniform sampler2D gxLM; uniform sampler2D gxLM2; uniform vec4 gxLMB; uniform vec4 gxLMY; uniform vec4 gxAmb;';
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
	gl_FragColor.rgb = gxGrade( gxTone( gl_FragColor.rgb * toneMappingExposure ) );
#endif`;
    // (and every material three.js makes from its library from now on gets the air's uniforms — the same objects)
    for (const k in THREE.ShaderLib) { const u = THREE.ShaderLib[k].uniforms; if (u && u.fogColor) Object.assign(u, GX); }
    Object.assign(THREE.UniformsLib.fog, GX);
  }
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
    toon();
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
    // the light of the hour: the sky's (a hemisphere — the sky's own colour from above, the warm bounce of the land from
    // below) and one key light that casts the shadows: the sun by day, the moon by night (one light: every material pays
    // for each light it is lit by)
    hemi = new THREE.HemisphereLight(0xcfe6ff, 0x5a5a3a, 1); scene.add(hemi);
    sun = new THREE.DirectionalLight(0xfff2dc, 2.4); sun.position.set(40, 80, 30); scene.add(sun); scene.add(sun.target);
    scene.fog = new THREE.Fog(0xbfd8ea, 1250, 1520);
    // the picture of the light of the flames round the body (a texel a metre; FX3D paints it each frame): its colour (the
    // root of it, for the dim light's sake), and where its light comes from. One picture for every material: three.js gives
    // each material a copy of the uniforms of its kind, and a copy of this picture is the picture itself
    { const n = 96; const mk = () => { const t = new THREE.DataTexture(new Uint8Array(n * n * 4), n, n, THREE.RGBAFormat, THREE.UnsignedByteType); t.magFilter = t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; t.flipY = false; t.needsUpdate = true; t.clone = function () { return this; }; return t; };
      R3.LM = { n, m: 1, tex: mk(), tex2: mk() }; GX.gxLM.value = R3.LM.tex; GX.gxLM2.value = R3.LM.tex2; }
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
        #ifdef SKYCHEAP
        float cloudN(vec2 uv) { return texture2D(uNoise, uv).r; }
        #else
        float cloudN(vec2 uv) { return texture2D(uNoise, uv).r * 0.68 + texture2D(uNoise, uv * 3.1 + 0.37).g * 0.32; }
        #endif
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
            #ifdef SKYCHEAP
            float ns = n + thick * 0.08;
            #else
            float ns = cloudN(uv + normalize(keyDir.xz + 1e-4) * 0.018);
            #endif
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
    // the stars: many faint and a few bright (the magnitudes of a real sky), white, blue-white and a few orange, more of them
    // along the river of the galaxy; each twinkles, the more the nearer the horizon, where the air is thick and dims them; and
    // the clouds of the sky hide them (the same clouds the dome draws, read at each star)
    { const n = 1500, p = new Float32Array(n * 3), m = new Float32Array(n * 2), gb = new THREE.Vector3(0.42, 0.56, 0.71).normalize(); let k = 0;
      for (let q = 0; k < n && q < n * 4; q++) {
        const a = G.hash(q * 3 + 1) * TAU, e = Math.asin(G.hash(q * 7 + 2) * 0.96 + 0.03), r = 1300; const x = Math.cos(a) * Math.cos(e), y = Math.sin(e), z = Math.sin(a) * Math.cos(e);
        const band = Math.abs(x * gb.x + y * gb.y + z * gb.z); if (G.hash(q * 13 + 5) > 0.35 + 0.65 * Math.exp(-band * band * 18)) continue; // (thinner away from the band)
        p[k * 3] = x * r; p[k * 3 + 1] = y * r; p[k * 3 + 2] = z * r; const mg = G.hash(q * 11 + 3); m[k * 2] = Math.pow(mg, 7); m[k * 2 + 1] = G.hash(q * 17 + 9); k++;
      }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('aM', new THREE.BufferAttribute(m, 2)); g.setDrawRange(0, k);
      stars = new THREE.Points(g, new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
        uniforms: { uStars: { value: 0 }, uPx: { value: 1 }, uT: U.time, uWind: U.wind, cover: null, uNoise: null, gxGr: GX.gxGr, gxTn: GX.gxTn },
        vertexShader: `attribute vec2 aM; uniform float uStars; uniform float uPx; uniform float uT; uniform vec3 uWind; uniform float cover; uniform sampler2D uNoise; varying vec3 vC; varying float vA;
          void main() { vec3 d = normalize(position); float h = d.y;
            vec2 uv = d.xz / (h + 0.08) * 0.11 + uWind.xy * uT * 0.0016; float cn = texture2D(uNoise, uv).r * 0.68 + texture2D(uNoise, uv * 3.1 + 0.37).g * 0.32;
            float cl = smoothstep(0.98 - cover, 1.18 - cover, cn) * smoothstep(0.0, 0.22, h);
            float tw = 1.0 + sin(uT * (2.3 + aM.y * 3.1) + aM.y * 61.0) * mix(0.12, 0.4, 1.0 - smoothstep(0.05, 0.45, h));
            vA = uStars * (0.22 + aM.x * 1.6) * tw * (1.0 - cl * 0.97) * smoothstep(0.0, 0.18, h);
            vC = aM.y < 0.12 ? vec3(1.0, 0.78, 0.55) : aM.y < 0.45 ? vec3(0.78, 0.86, 1.0) : vec3(1.0);
            gl_PointSize = max(1.0, (1.4 + aM.x * 2.6) * uPx); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`, // (never under a pixel: the lightest quality draws a smaller picture)
        fragmentShader: `varying vec3 vC; varying float vA; void main() { vec2 p = gl_PointCoord * 2.0 - 1.0; float a = exp(-dot(p, p) * 3.0) * vA; if (a < 0.004) discard; gl_FragColor = vec4(vC * a, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          }` }));
      stars.material.uniforms.cover = skyU.cover; stars.material.uniforms.uNoise = skyU.uNoise;
      stars.frustumCulled = false; stars.renderOrder = -0.5; scene.add(stars); }
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
    renderer.shadowMap.autoUpdate = (q.shadowEvery | 0) <= 1; renderer.shadowMap.needsUpdate = true; // (light() asks for it every n frames)
    sun.castShadow = !!q.shadows;
    // (the side of the sun's picture: never more than the graphics card can hold)
    if (q.shadows) { const n = Math.min(q.shadows, renderer.capabilities.maxTextureSize || 4096); sun.shadow.mapSize.set(n, n); shadowKey = ''; if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
    // (the patterns of walls and roofs and the speckle of the leaves only where the machine carries the ground's grain too)
    for (const m of [MAT.solid, MAT.flora, MAT.inner]) if (m) m.defines = q.detail === 0 ? { NOPAT: 1 } : {};
    if (MAT.solid) MAT.solid.defines.M3CUT = 1; // (the town's solid gives way where an inside is drawn: Build3D.cuts)
    // (the water and the sky in their cheap ways where the quality draws no grain: the lightest is for the weak machines)
    { const ch = q.detail === 0; skyMesh.material.defines = ch ? { SKYCHEAP: 1 } : {}; skyMesh.material.needsUpdate = true; }
    for (const m of [MAT.land, MAT.solid, MAT.flora, MAT.plant, MAT.inner]) if (m) m.needsUpdate = true;
    G.Ground3D.quality();
    G.Agua3D.quality(q); // (the water's ways by the quality: its cheap one, the clouds and the scene in its face — 21c)
    G.FX3D && G.FX3D.quality && G.FX3D.quality(q);
    G.Post3D && G.Post3D.quality && G.Post3D.quality(q);
    // (what is near the body was made at the last quality: each near picture is asked to be made again — the stream does it,
    // the nearest first, a few a frame — so the quality chosen is the one seen, not only in the pictures made after it)
    for (const ch of chunks.values()) if (ch.near) { ch.sig = STALE; ch.sigT = -1e9; }
    resize();
  }
  const STALE = { a: NaN, b: NaN, c: NaN, d: NaN }; // (a signature no picture has: what carries it is made again)
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
    return { a, b, c, d: bs };
  }
  const sameSig = (p, q) => p && q && p.a === q.a && p.b === q.b && p.c === q.c && p.d === q.d;
  function buildFar(ch) {
    disposeGroup(ch.far); const grp = new THREE.Group(); ch.far = grp; grp.matrixAutoUpdate = false;
    const x0 = ch.cx * C, y0 = ch.cy * C;
    addMesh(grp, terrainGeo(x0, y0, C, C, 2), MAT.land, { recv: false });
    const wg = waterGeo(x0, y0, C, C, true); G.Agua3D.hook(addMesh(grp, wg.water, MAT.water, { order: 2 })); addMesh(grp, wg.ice, MAT.ice); addMesh(grp, wg.falls, MAT.fall, { order: 2.5 });
    addMesh(grp, G.Arvore3D.geo(x0, y0, C, C, true).flora, MAT.flora);
    if (G.Build3D) addMesh(grp, G.Build3D.farGeo(x0, y0, C), MAT.solid);
    addMesh(grp, roadGeo(x0, y0, C, C, true), MAT.solid);
    scene.add(grp); grp.visible = !ch.near;
  }
  // a near picture is three parts, each made again only when what it shows has changed: the ground (terrain, water,
  // roads), the plants (trees, bushes, rocks, grass) and the buildings — a field ripening does not remake the hillside
  const PARTS = { ground: s => s.a + ':' + s.c, flora: s => s.a + ':' + s.b + ':' + s.c, build: s => s.c + ':' + s.d };
  function makePart(ch, part) {
    const x0 = ch.cx * C, y0 = ch.cy * C; const q = R3.Q(); const grp = new THREE.Group(); grp.matrixAutoUpdate = false;
    if (part === 'ground') {
      addMesh(grp, terrainGeo(x0, y0, C, C, 0.5), MAT.land, { recv: true });
      const wg = waterGeo(x0, y0, C, C, false); G.Agua3D.hook(addMesh(grp, wg.water, MAT.water, { order: 2 })); addMesh(grp, wg.ice, MAT.ice, { recv: true }); addMesh(grp, wg.walls, MAT.wallWater, { order: 3 }); addMesh(grp, wg.falls, MAT.fall, { order: 2.5, recv: true });
      addMesh(grp, roadGeo(x0, y0, C, C, false), MAT.solid, { cast: true, recv: true });
    } else if (part === 'flora') {
      const fg = G.Arvore3D.geo(x0, y0, C, C, false); addMesh(grp, fg.flora, MAT.flora, { cast: true, recv: true }); addMesh(grp, fg.plants, MAT.plant, { cast: true, recv: true }); addMesh(grp, fg.leaves, MAT.leaf, { cast: true, recv: true });
      // (the near grass is the field of blades round the eye (Grass3D) where the machine carries it; the tufts otherwise)
      if (q.grass && !q.field) addMesh(grp, G.Arvore3D.grassGeo(x0, y0, C, C), MAT.plant, { recv: true });
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
  // (the light's own dials, for the tests and the eye: 1 is the light as it is made — the exposure, the sun, the sky's light
  // and how blue it is, the bounce of the land, the deep of the sky overhead, the haze; the grade's richness, its S, its split)
  // (toeD, toeN: the darks of the curve's toe given back by day and under the moon — the dark wood in the shade keeps its
  // planks, the moonlit shade stays legible; gsat: the grade's richness in the middle tones, calm: green stays moss)
  const TUNE = R3.TUNE = { exp: 1, sun: 1, sky: 1, skySat: 1, bounce: 1, zen: 1, haze: 1, moon: 1, nf: 1, gsat: 0.09, gs: 0.25, gsplit: 1, toeD: 0.5, toeN: 0.65 };
  const LT = { air: [1, 1, 1], sun: [0, 0, 0], zen: [0, 0, 0], hor: [0, 0, 0], glow: [0, 0, 0], belt: [0, 0, 0], fill: [0, 0, 0], sky: [0, 0, 0], bounce: [0, 0, 0], key: [0, 0, 0] };
  R3.LT = LT; // (the light of this hour, read only: for the tests and for what wants to match it)
  let _sd = null, _md = null, _cf = null, shadowKey = '', shadowTick = 0;
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
    const sunI = 3 * TUNE.sun * (0.45 + 0.55 * G.smooth(0, 0.6, s)) * G.smooth(-0.03, 0.06, s) * (1 - rain * 0.72) * (1 - storm * 0.3);
    const moonI = 0.42 * TUNE.moon * G.smooth(-0.02, 0.15, _md.y) * G.smooth(0.05, -0.1, s) * (1 - rain * 0.8);
    const byMoon = moonI > sunI; const key = LT.key;
    if (byMoon) { key[0] = 0.62; key[1] = 0.72; key[2] = 1; tint(key, 0.4); } else { key[0] = sunC[0]; key[1] = sunC[1]; key[2] = sunC[2]; }
    const keyI = byMoon ? moonI : sunI; const kd = byMoon ? _md : _sd;
    sun.color.setRGB(key[0], key[1], key[2]); sun.intensity = keyI;
    // the sky's light in the shade: the sky that is drawn, averaged over the dome (blue by day, as a painter has it), and a
    // floor of night light — the stars, the moon's scattered glow: a night is dark, never black. From below, the warm
    // bounce of the land in the sun
    const fill = LT.fill; for (let q = 0; q < 3; q++) fill[q] = hor[q] * 0.55 + zen[q] * 0.45;
    const skyIrr = LT.sky, bounce = LT.bounce; const NF = [0.045, 0.06, 0.11];
    for (let q = 0; q < 3; q++) { skyIrr[q] = fill[q] * 0.68 * Math.PI * TUNE.sky + NF[q] * TUNE.nf * (1 - dayL) * (1 - rain * 0.5); }
    if (TUNE.skySat !== 1) { const l = lum(skyIrr); for (let q = 0; q < 3; q++) skyIrr[q] = Math.max(0, l + (skyIrr[q] - l) * TUNE.skySat); }
    for (let q = 0; q < 3; q++) bounce[q] = (key[q] * keyI * Math.max(kd.y, 0) + skyIrr[q] * 0.4) * [0.22, 0.2, 0.15][q] * TUNE.bounce;
    hemi.intensity = 1; hemi.color.setRGB(skyIrr[0], skyIrr[1], skyIrr[2]); hemi.groundColor.setRGB(bounce[0], bounce[1], bounce[2]);
    GX.gxAmb.value.x = G.clamp(lum(skyIrr) / 1.05, 0.1, 1);
    // the sky's dome: its colours, the discs, the clouds lit by the key light (gold at sunset, grey and low in the rain)
    skyU.top.value.setRGB(zen[0], zen[1], zen[2]); if (TUNE.zen !== 1) { const l = lum(zen); skyU.top.value.setRGB(l + (zen[0] - l) * TUNE.zen, l + (zen[1] - l) * TUNE.zen, l + (zen[2] - l) * TUNE.zen); } skyU.hor.value.setRGB(hor[0], hor[1], hor[2]); skyU.night.value = night;
    skyU.sunDir.value.copy(_sd); skyU.sunCol.value.setRGB(sunC[0], sunC[1], sunC[2]).multiplyScalar(G.smooth(-0.02, 0.04, s) * (1 - rain * 0.7));
    skyU.disc.value.setRGB(sunC[0], sunC[1], sunC[2]).multiplyScalar(24 * G.smooth(-0.02, 0.02, s) * (1 - rain * 0.9));
    skyU.moonDir.value.copy(_md); skyU.moonCol.value.setRGB(0.85, 0.9, 1).multiplyScalar(2.4 * G.smooth(-0.02, 0.06, _md.y) * G.smooth(0.08, -0.08, s) * (1 - rain));
    skyU.keyDir.value.copy(kd);
    skyU.cover.value = G.clamp(0.36 + rain * 0.55 + storm * 0.2 + (S.clouds ? Math.min(0.15, S.clouds.length * 0.01) : 0), 0, 0.98);
    skyU.cloudCol.value.setRGB(key[0] * keyI * 0.24 + skyIrr[0] * 0.24, key[1] * keyI * 0.24 + skyIrr[1] * 0.24, key[2] * keyI * 0.24 + skyIrr[2] * 0.24);
    skyU.cloudSh.value.setRGB(skyIrr[0] * 0.27 + key[0] * keyI * 0.05, skyIrr[1] * 0.27 + key[1] * keyI * 0.05, skyIrr[2] * 0.27 + key[2] * keyI * 0.05);
    { const st = G.smooth(-0.03, -0.16, s) * (1 - rain); stars.material.uniforms.uStars.value = st; stars.material.uniforms.uPx.value = renderer.getPixelRatio(); skyU.uStars.value = st * (1 - skyU.cover.value * 0.6); }
    // (the night's grade: the dim colours going out as the sun goes down)
    GX.gxGr.value.x = 0.6 * G.smooth(0.02, -0.14, s) * (1 - rain * 0.3); GX.gxGr.value.y = TUNE.gsat; GX.gxGr.value.z = TUNE.gs; GX.gxGr.value.w = TUNE.gsplit;
    GX.gxTn.value.x = G.lerp(TUNE.toeD, TUNE.toeN, G.smooth(0.05, -0.12, s)); // (the toe given back: by day, and under the moon)
    // the air (every material reads it: GX)
    const q = R3.Q();
    GX.gxSunW.value.x = _sd.x; GX.gxSunW.value.y = _sd.y; GX.gxSunW.value.z = _sd.z;
    GX.gxHor.value.x = hor[0]; GX.gxHor.value.y = hor[1]; GX.gxHor.value.z = hor[2];
    GX.gxGlow.value.x = glow[0]; GX.gxGlow.value.y = glow[1]; GX.gxGlow.value.z = glow[2];
    GX.gxBelt.value.x = belt[0]; GX.gxBelt.value.y = belt[1]; GX.gxBelt.value.z = belt[2];
    { const A = GX.gxAir.value, A2 = GX.gxAir2.value; const mist = ramp(MIST, t - Math.floor(t));
      A.x = 1.25 / Math.max(120, q.view) * (1 + rain * 0.8 + storm * 0.4) * TUNE.haze; A.y = 0.0055 * mist * (1 + rain * 1.2); A.z = 0.12 / scene.scale.y; A.w = G.SEA * G.Space.HM * scene.scale.y;
      // (the haze starts past what the eye looks at: from far up, in the descent, the town is not lost in it)
      const cd = focus ? Math.hypot(camera.position.x - focus.X, camera.position.y - (focus.Y || 0), camera.position.z - focus.Z) : 0;
      A2.x = Math.max(0, cd - 8) * 0.9; A2.y = 1250; A2.z = 1520; A2.w = 0.5 + 0.5 * dayL; }
    // (the dome and the stars inside the far end of the view, wherever the quality puts it)
    { const ks = Math.min(1, camera.far * 0.92 / 1400); skyMesh.scale.setScalar(ks); stars.scale.setScalar(ks); }
    scene.fog.color.setRGB(hor[0], hor[1], hor[2]); U.sky.value.setRGB(hor[0], hor[1], hor[2]).lerp(skyU.top.value, 0.55);
    renderer.setClearColor(scene.fog.color);
    renderer.toneMappingExposure = ramp(RAMP.exp, s) * (1 + rain * 0.12) * TUNE.exp;
    // (the water: the key light on it, the sky's light on it, the bed under it)
    G.Agua3D.light(key, keyI, skyIrr, scene.scale.y); // (21c: the water's light and its pictures — js/agua3d.js)
    G.Build3D && G.Build3D.night(G.clamp((night - 0.25) * 1.6, 0, 1)); // (the windows light up as the dark comes)
    // the dome and the stars go with the eye; the key light's picture of the shadows over the ground round the body
    skyMesh.position.copy(camera.position); stars.position.copy(camera.position);
    if (focus) placeKey(kd, focus, q);
    // (the sun's picture of the shadows made again every n frames where the quality says so: three.js keeps the frame it
    // was drawn in with it, so the shadows stay where they are; only the shadow of what moves trails a frame)
    if (!renderer.shadowMap.autoUpdate) { shadowTick = (shadowTick + 1) % Math.max(1, q.shadowEvery | 0); if (shadowTick === 0) renderer.shadowMap.needsUpdate = true; }
    return kd;
  }
  // (for the verifier: the light of the hour is numbers in their range; the key light is the sun by day and the moon by night,
  // and its picture of the shadows covers the body; the bed the water reads is the land's)
  // the far end of the view of the body's eye: where the haze has hidden all (at least 99.9% of it), never past the dome
  R3.viewFar = () => G.clamp(3 / Math.max(1e-5, GX.gxAir.value.x), 500, 1600);
  R3.lightCheck = function () {
    const out = []; if (!renderer || !R3.on) return out;
    const bad = v => !Number.isFinite(v);
    for (const k in LT) if (LT[k].some(bad)) out.push(`luz: ${k} não é número`);
    for (const k in GX) { const v = GX[k].value; if (!v || v.isTexture) continue; if (bad(v.x) || bad(v.y) || bad(v.z) || bad(v.w)) out.push(`ar: ${k} não é número`); } // (the pictures of the flames' light are pictures, not numbers)
    const e = renderer.toneMappingExposure; if (bad(e) || e < 0.5 || e > 3) out.push(`exposição fora do lugar: ${e}`);
    if (bad(sun.intensity) || sun.intensity < 0 || sun.intensity > 4) out.push(`luz principal com intensidade ${sun.intensity}`);
    const s = skyU.sunDir.value.y; if (s > 0.1 && skyU.keyDir.value.dot(skyU.sunDir.value) < 0.999) out.push('de dia, a luz principal não é o sol');
    if (sun.castShadow && U.body.value && U.body.value.w) { const b = U.body.value; const c = sun.target.position; const h = sun.shadow.camera.right; if (Math.abs(b.x - c.x) > h || Math.abs(b.z - c.z) > h) out.push('a imagem das sombras não cobre o corpo'); }
    const bc = R3.bedCheck(48); if (bc.bad > 2) out.push(`leito da água: ${bc.bad} de ${bc.n} pontos fora da altura do chão`);
    const wc = R3.waterCheck(); if (wc.bad) out.push(`água desenhada sobre a terra fora do lugar: ${wc.bad} de ${wc.n} (${wc.ex})`);
    return out;
  };
  // (for the verifier: the water laid over the land only where it dips under its face — Agua3D, 21c)
  R3.waterCheck = () => G.Agua3D.waterCheck();
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
    const kk = half + ':' + size + ':' + (q.soft | 0); if (kk !== shadowKey) {
      shadowKey = kk; const c = sun.shadow.camera; c.left = -half; c.right = half; c.top = half; c.bottom = -half; c.near = Math.max(1, D - half * 2.5 - 20); c.far = D + half * 2.5 + 20; c.updateProjectionMatrix();
      // (a bias of a few centimetres in the picture's depth, and along the normal a little under a texel: no stripes of
      // self-shadow on the lit walls, and no gap between a foot and its shadow)
      sun.shadow.bias = -0.05 / (c.far - c.near); sun.shadow.normalBias = tx * 0.7;
      // (the soft shadows: the penumbra a shade makes per metre between it and what casts it — a little wider than the sun's
      // own half a degree, as a painter softens them — in texels of the picture per unit of its depth)
      sun.shadow.radius = q.soft ? (c.far - c.near) * 0.03 / tx : 0;
      renderer.shadowMap.needsUpdate = true;
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
    light(focus); // (the hour's light, the sky, the air; the sun's picture of the shadows round the focus)
    // (the wind of the world bends the plants; the body walking parts them)
    { const w = G.S.weather; const ws = G.clamp(w.windS || 0, 0, 2); U.wind.value.set(Math.cos(w.windA || 0) * (0.35 + ws), Math.sin(w.windA || 0) * (0.35 + ws), ws); }
    if (focus) U.body.value.set(focus.X, focus.Y || 0, focus.Z, 1); else U.body.value.w = 0;
    G.Ground3D.tick(focus);
    // (the clouds' shadows move as the sky's clouds do; darker under a bright sun, none at night)
    { const w = U.wind.value; const T = U.time.value; G.Ground3D.clouds(w.x * T * 0.0016 * 4.7, w.y * T * 0.0016 * 4.7, skyU.cover.value, G.clamp(sun.intensity / 3, 0, 1) * 0.3); }
    if (focus) stream(focus.X, focus.Z, budget === undefined ? 6 : budget);
    G.Build3D && G.Build3D.insideTick && G.Build3D.insideTick(rdt, focus); // (the insides round the body: before the people who stand in them)
    G.People3D && G.People3D.update && G.People3D.update(rdt, focus);
    G.Things3D && G.Things3D.update && G.Things3D.update(rdt, focus); // (before the fire's drawing: it hands over its flames)
    G.FX3D && G.FX3D.update && G.FX3D.update(rdt, focus);
    G.Dragon3D && G.Dragon3D.update && G.Dragon3D.update(rdt, focus);
    G.Grass3D && G.Grass3D.update && G.Grass3D.update(rdt, focus, camera);
    G.Agua3D.frame(); // (21c: a new frame — the picture behind the water copied again, where the quality has it)
    if (!(G.Post3D && G.Post3D.render(scene, camera))) renderer.render(scene, camera); // (the post-processing, where the quality has it)
    R3.info = renderer.info;
    if (rdt > 0) R3.fps = R3.fps ? R3.fps * 0.95 + (1 / rdt) * 0.05 : 1 / rdt;
  };
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
