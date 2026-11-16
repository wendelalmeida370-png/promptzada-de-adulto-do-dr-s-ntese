'use strict';
// ============================================================
//  Fauna3D: the animals as one continuous skin each — the
//  meshes of js/faunamesh.js (made by arte/fauna.py) bent on
//  the graphics card by the bones of one skeleton for all
//  (G.FaunaAnim poses it: the gaits, the head, the tail, the
//  wings). Every beast drawn is one row of a texture of
//  numbers: its bones' matrices, then its coat — the colours
//  and the pattern of its kind (the giraffe's patches, the
//  zebra's stripes, the leopard's rosettes, the belly lighter,
//  the socks, the muzzle, the ear tips) — painted in the shader
//  from where each point is on the beast as it was modelled,
//  so the pattern stays where it belongs whatever the pose.
//  One draw call a mesh for every beast of that kind.
//  Only seen: nothing here is saved, nothing changes the world.
//  If it cannot start (no data, a shader refused), People3D
//  keeps drawing its old pieces.
// ============================================================
(function (G) {
  const F3 = G.Fauna3D = { ready: false, failed: null, rows: 0, calls: 0, tris: 0, lod: true, live: false };
  let THREE = null, scene = null;
  const MAXR = 64; // (rows: People3D's MAXA — the beasts drawn)
  const MAXS = 16, MAXD = 4, ROWS = MAXR + MAXS + MAXD; // (and after them, rows kept for the sea's beasts — Things3D, D-267 — and for the dragons — G.Dragon3D, D-270)
  let D = null, NB = 0, PB = 0, TW = 0, buf = null, tex = null, mat = null, depth = null, TU = null;
  const NP = 29; // texels of coat a row (18 of the coat of the kind, 4 of the marks of the beast: D-283, 5 of the face of its mesh and 2 more of the coat: D-321)
  const NC = 18; // (the coat's own)
  const FT = NC + 4, NF = 5, CT2 = FT + NF; // (the face's texels — the eye's centre and axis, the mouth, the nostril — and after them the coat's two more: the ring round the eye, the eye's white)
  F3.MAXR = MAXR; F3.MAXS = MAXS; F3.MAXD = MAXD; F3.ROWS = ROWS; F3.rim = (G.Body3D && G.Body3D.rim) || { value: 0.2 }; F3.frame = 0;
  const MESH = {}; // name → { mesh, geo, rows, ra, n, tris }
  const FORM = {}; // mesh name → { J: Float32Array(NB*3) the bind joints, box, meta }

  // ------------------------------ the data ------------------------------
  function bytes(s) { const b = atob(s); const u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  // a mesh unpacked: format 3 (arte/fauna.py encode — octahedral normals, three weights, zone and occlusion in a byte, seven
  // regions in 4 bits and the one along the body whole, the corners in variable-length bytes) or the first, plain one
  function unpack(m) {
    const n = m.n; const q = new Uint16Array(bytes(m.pos).buffer); const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) pos[i * 3 + k] = m.lo[k] + q[i * 3 + k] * m.sc[k];
    if (m.f !== 3) return { n, pos, nor: new Int8Array(bytes(m.nor).buffer), bi: bytes(m.bi), bw: bytes(m.bw), zone: bytes(m.zone), ao: bytes(m.ao), reg: bytes(m.reg), reg2: bytes(m.reg2), idx: new Uint16Array(bytes(m.idx).buffer) };
    const oc = new Int8Array(bytes(m.oct).buffer), nor = new Int8Array(n * 3);
    for (let i = 0; i < n; i++) {
      let x = oc[i * 2] / 127, y = oc[i * 2 + 1] / 127; let z = 1 - Math.abs(x) - Math.abs(y);
      if (z < 0) { const ax = Math.abs(x), ay = Math.abs(y); x = (1 - ay) * (x >= 0 ? 1 : -1); y = (1 - ax) * (y >= 0 ? 1 : -1); }
      const l = Math.hypot(x, y, z) || 1; nor[i * 3] = Math.round(x / l * 127); nor[i * 3 + 1] = Math.round(y / l * 127); nor[i * 3 + 2] = Math.round(z / l * 127);
    }
    const w3 = bytes(m.bw3), bw = new Uint8Array(n * 4); for (let i = 0; i < n; i++) { const a = w3[i * 3], b = w3[i * 3 + 1], c = w3[i * 3 + 2]; bw[i * 4] = a; bw[i * 4 + 1] = b; bw[i * 4 + 2] = c; bw[i * 4 + 3] = 255 - a - b - c; }
    const za = bytes(m.za), zone = new Uint8Array(n), ao = new Uint8Array(n); for (let i = 0; i < n; i++) { zone[i] = za[i] >> 4; ao[i] = (za[i] & 15) * 17; }
    const rg = bytes(m.rg), tx = bytes(m.tx), reg = new Uint8Array(n * 4), reg2 = new Uint8Array(n * 4);
    for (let i = 0; i < n; i++) { const o = i * 4; reg[o] = (rg[o] >> 4) * 17; reg[o + 1] = (rg[o] & 15) * 17; reg[o + 2] = (rg[o + 1] >> 4) * 17; reg[o + 3] = (rg[o + 1] & 15) * 17;
      reg2[o] = tx[i]; reg2[o + 1] = (rg[o + 2] >> 4) * 17; reg2[o + 2] = (rg[o + 2] & 15) * 17; reg2[o + 3] = (rg[o + 3] >> 4) * 17; }
    const ix = bytes(m.ix), idx = new Uint16Array(m.tris * 3); let hw = 0, p = 0;
    for (let k = 0; k < idx.length; k++) { let c = 0, sh = 0, b; do { b = ix[p++]; c |= (b & 127) << sh; sh += 7; } while (b & 128); idx[k] = c === 0 ? hw++ : hw - c; }
    return { n, pos, nor, bi: bytes(m.bi), bw, zone, ao, reg, reg2, idx };
  }
  F3.unpack = unpack; // (for the tests)
  function geometryOf(m) {
    const g = new THREE.InstancedBufferGeometry(); const u = unpack(m);
    g.setAttribute('position', new THREE.BufferAttribute(u.pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(u.nor, 3, true));
    g.setAttribute('aBone', new THREE.BufferAttribute(u.bi, 4, false));
    g.setAttribute('aWt', new THREE.BufferAttribute(u.bw, 4, true));
    g.setAttribute('aZone', new THREE.BufferAttribute(u.zone, 1, false));
    g.setAttribute('aAO', new THREE.BufferAttribute(u.ao, 1, true));
    g.setAttribute('aReg', new THREE.BufferAttribute(u.reg, 4, true));
    g.setAttribute('aReg2', new THREE.BufferAttribute(u.reg2, 4, true));
    g.setIndex(new THREE.BufferAttribute(u.idx, 1));
    const rows = new Float32Array(ROWS); const ra = new THREE.InstancedBufferAttribute(rows, 1); ra.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('aRow', ra); g.instanceCount = 0;
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);
    return { g, rows, ra, tris: m.tris, u };
  }

  // ------------------------------ the shaders ------------------------------
  const SKIN = `
uniform highp sampler2D uFauna;
attribute vec4 aBone; attribute vec4 aWt; attribute float aRow; attribute float aZone; attribute float aAO; attribute vec4 aReg; attribute vec4 aReg2;
void f3skin(in vec3 p, in vec3 n, out vec3 P, out vec3 N) {
  int row = int(aRow + 0.5); vec4 r0 = vec4(0.0), r1 = vec4(0.0), r2 = vec4(0.0);
  for (int i = 0; i < 4; i++) { float w = aWt[i]; if (w > 0.0) { int b = int(aBone[i] + 0.5) * 3;
    r0 += w * texelFetch(uFauna, ivec2(b, row), 0); r1 += w * texelFetch(uFauna, ivec2(b + 1, row), 0); r2 += w * texelFetch(uFauna, ivec2(b + 2, row), 0); } }
  vec4 q = vec4(p, 1.0); P = vec3(dot(r0, q), dot(r1, q), dot(r2, q)); N = vec3(dot(r0.xyz, n), dot(r1.xyz, n), dot(r2.xyz, n));
}
`;
  // (the body's zones, by the bones that move each point — the wounds of the fight are told by zone, a.wnd.z: 0 the head, 1 the
  // neck and the throat, 2 the forequarters, 3 the flank and the belly, 4 the rump, 5 the legs; and how much of a point is leg,
  // how much trunk — the mud, the carcass torn open)
  const ZONES = `
int f3zone(int b) { if (b >= 30 || (b >= 6 && b <= 9)) return 0; if (b >= 3 && b <= 5) return 1; if (b == 2 || b == 14 || b == 15 || b == 18 || b == 19) return 2; if (b == 1) return 3;
  if (b == 0 || b == 10 || b == 11 || b == 22 || b == 23 || b == 26 || b == 27) return 4; return 5; }
void f3marksV() { int row = int(aRow + 0.5); vec4 w0 = texelFetch(uFauna, ivec2(PB + 19, row), 0), w1 = texelFetch(uFauna, ivec2(PB + 20, row), 0);
  float z[6]; z[0] = w0.x; z[1] = w0.y; z[2] = w0.z; z[3] = w0.w; z[4] = w1.x; z[5] = w1.y; vWnd = 0.0; vLeg = 0.0; vTrunk = 0.0;
  for (int i = 0; i < 4; i++) { float w = aWt[i]; if (w > 0.0) { int b = int(aBone[i] + 0.5); int zi = f3zone(b); vWnd += w * z[zi];
    if (zi == 5) vLeg += w; else if (b == 15 || b == 19 || b == 23 || b == 27) vLeg += w * 0.5; if (b <= 2) vTrunk += w; } }
}
`;
  const VARY = 'varying vec3 vBind; varying vec3 vBindN; varying float vAO; varying vec4 vReg; varying vec4 vReg2; flat varying int vRowI; flat varying int vZoneI; varying float vWnd; varying float vLeg; varying float vTrunk;\n';
  // the coat. The row's texels after the bones: 0 coat (rgb, pattern) · 1 belly (rgb, amount) · 2 the pattern's dark (rgb,
  // its scale) · 3 socks (rgb, amount) · 4 muzzle (rgb, amount) · 5 mane and the tail's tip (rgb, tip amount) · 6 horn (rgb,
  // the nose's leather amount) · 7 hoof and claws (rgb, -) · 8 beak and bare legs (rgb, -) · 9 iris (rgb, pupil: 0 round
  // 1 slit 2 bar) · 10 ear tips (rgb, amount) · 11 the back's line (rgb, amount) · 12 throat and breast (rgb, amount) ·
  // 13 (the pattern's contrast, its seed, the fur's grain, the eyes forward) · 14 the face's mask (rgb, amount) · 15 wings
  // (rgb, the wing's bars) · 16 (young, the size in metres, wet, -) · 17 comb and wattle, the inside of the ear (rgb, -)
  // The dragon (G.FaunaAnim.dragonCoat) uses three of the w's no other kind uses — 7.w the eyes' own light, 8 the breath's
  // colour (rgb) and how much the sun shows through the wings (w), 17.w the mouth's glow (its rgb the inside of the mouth) —,
  // the pupil 3 (the eye shut: the lid) and the pattern 15 (its scales, and the plates down its belly by reg2.x, how far
  // along the body). The sea's coat (pattern 16 the swimmers, 17 the sea turtle's skin: f3sea, f3shell) reads some of them
  // its own way — said where it does (D-267)
  const PAINT = `
vec4 f3T(int k) { return texelFetch(uFauna, ivec2(PB + k, vRowI), 0); }
float f3h(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
vec3 f3h3(vec3 p) { return vec3(f3h(p), f3h(p + 19.19), f3h(p + 47.3)); }
float f3n(vec3 x) { vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(f3h(i), f3h(i + vec3(1, 0, 0)), f.x), mix(f3h(i + vec3(0, 1, 0)), f3h(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(f3h(i + vec3(0, 0, 1)), f3h(i + vec3(1, 0, 1)), f.x), mix(f3h(i + vec3(0, 1, 1)), f3h(i + vec3(1, 1, 1)), f.x), f.y), f.z); }
// (cells: the distance to the nearest point and the second — the giraffe's patches, the rosettes, the scales)
vec2 f3cell(vec3 x, out vec3 id) { vec3 i = floor(x), f = fract(x); float d1 = 8.0, d2 = 8.0; id = vec3(0.0);
  for (int z = -1; z <= 1; z++) for (int y = -1; y <= 1; y++) for (int k = -1; k <= 1; k++) { vec3 g = vec3(float(k), float(y), float(z)); vec3 o = f3h3(i + g) * 0.8 + 0.1; vec3 r = g + o - f; float d = dot(r, r);
    if (d < d1) { d2 = d1; d1 = d; id = i + g; } else if (d < d2) d2 = d; }
  return vec2(sqrt(d1), sqrt(d2)); }
float f3aa(float d) { float w = fwidth(d) * 0.9 + 1e-4; return clamp(0.5 - d / w, 0.0, 1.0); }
float f3gl = 0.0; // (the eye's glint, a light of its own)
vec3 f3em = vec3(0.0); float f3bl = 0.0; // (a light of its own — the dragon's eyes, its mouth breathing —; the sun through a wing)
float f3sp = 0.0, f3shn = 24.0; // (the sheen of the sun on what is wet or hard: the eye, the nose's leather, the horn, the hoof, the wet coat — D-324)
float f3bh = 0.0, f3bs = 0.0;   // (the skin's relief: its height here, in metres, and how much of it shows — the fur's strands, the wrinkles, the scales: D-324)
// the eye of a face told (D-321): painted in its own frame — its axis out of the head, across it toward the front, up — so the
// iris sits in the middle of the lids' opening whichever way the eye was seated; the iris with its fibres and its dark rim, the
// pupil (round, the cats' slit, the grazers' bar), the white where the kind shows it (28), the wet sheen and a catchlight
vec3 f3eye2(vec4 F0, vec4 F1) {
  vec4 ir = f3T(9), X = f3T(13), MK = f3T(18), SC = f3T(28), LD = f3T(27); float sd = vZoneI == 1 ? 1.0 : -1.0;
  vec3 c = vec3(F0.x * sd, F0.y, F0.z), n = normalize(vec3(F1.x * sd, F1.y, F1.z));
  vec3 p = normalize(vBind - c); vec3 u = vec3(0.0, 0.0, 1.0) - n * n.z; u = dot(u, u) > 1e-6 ? normalize(u) : normalize(vec3(0.0, 1.0, 0.0) - n * n.y);
  vec3 v = normalize(cross(n, u)); v *= sign(v.y + 1e-6);
  float a = dot(p, n), pu = dot(p, u), pv = dot(p, v), rr = length(vec2(pu, pv));
  if (MK.w > 1.5) { f3gl = 0.0; return mix(ir.rgb * 0.18, vec3(0.04, 0.035, 0.03), 0.7); } // (dead: the eye dull, no light in it)
  if (MK.w > 0.5) return mix(f3T(0).rgb * 0.8, LD.rgb * 0.6, smoothstep(0.09, 0.0, abs(pv))); // (shut: the lids met, a dark line where they meet)
  float ri = 0.56 + 0.26 * clamp(X.w, 0.0, 1.0); // (the iris: the hunters' fills the opening, the grazers' leaves its corners dark)
  float an = atan(pv, pu); float fib = f3n(vec3(an * 7.0, rr * 10.0, sd * 3.1)) * 0.55 + f3n(vec3(an * 19.0, rr * 3.0, 5.7)) * 0.45;
  vec3 ic = ir.rgb * (0.7 + 0.6 * fib);
  ic = mix(ic * 1.3, ic, smoothstep(0.08, 0.32, rr));                 // (paler round the pupil)
  ic = mix(ic, ir.rgb * 0.3, smoothstep(ri * 0.74, ri * 0.98, rr));  // (the dark rim of the iris)
  float pr = ir.w < 0.5 ? rr / 0.25 : ir.w < 1.5 ? length(vec2(pu / 0.075, pv / 0.44)) : length(vec2(pu / 0.38, pv / 0.11));
  float pa = fwidth(pr) + 0.02; vec3 col = mix(ic, vec3(0.012, 0.01, 0.009), 1.0 - smoothstep(1.0 - pa, 1.0 + pa, pr));
  float aw = fwidth(rr) + 0.004; vec3 wh = mix(ir.rgb * 0.22 + vec3(0.02), SC.rgb, SC.w);
  col = mix(col, wh, smoothstep(ri - aw, ri + aw, rr));
  col *= mix(1.0, 0.55, smoothstep(0.35, 0.75, rr)) * smoothstep(-0.1, 0.35, a); // (the lids' shadow on the ball's rim)
  float gl = length(vec2(pu + 0.2 * sign(u.z + 1e-4), pv - 0.28)); f3gl = smoothstep(0.12, 0.05, gl) * step(0.3, a);
  f3sp = 1.1; f3shn = 140.0;
  return mix(col, vec3(1.0), f3gl * 0.85);
}
vec3 f3eye() {
  vec4 F0 = f3T(22); if (F0.w > 0.0) return f3eye2(F0, f3T(23));
  vec4 ir = f3T(9), X = f3T(13), MK = f3T(18); vec3 d = normalize(vBindN); float sd = vZoneI == 1 ? 1.0 : -1.0;
  if (MK.w > 1.5) { f3gl = 0.0; return mix(ir.rgb * 0.18, vec3(0.04, 0.035, 0.03), 0.7); } // (dead: the eye dull, no light in it)
  if (MK.w > 0.5) ir.w = 3.0; // (shut: asleep, a blink)
  vec3 g = normalize(vec3(sd * (1.0 - X.w), 0.05, X.w * 1.6)); float a = dot(d, g); float aw = fwidth(a) * 1.5 + 0.004;
  vec3 t1 = normalize(cross(g, vec3(0.0, 1.0, 0.0))), t2 = cross(t1, g); vec3 q = d - g * a; float u = dot(q, t1), v = dot(q, t2);
  if (ir.w > 2.5) return mix(f3T(0).rgb * 0.7, vec3(0.03, 0.025, 0.02), smoothstep(0.07, 0.03, abs(v)) * step(0.25, a)); // (shut: the lid and its line)
  vec3 c = mix(ir.rgb * 0.45, ir.rgb * 1.15, smoothstep(0.55, 0.9, a)); // (the iris fills the eye that shows, darker at its rim)
  // (the pupil: round, a slit up and down — the cats —, a bar across — the goats, the sheep, the horses)
  float pr = ir.w < 0.5 ? length(vec2(u, v)) / 0.32 : ir.w < 1.5 ? length(vec2(u / 0.1, v / 0.42)) : length(vec2(u / 0.42, v / 0.13));
  float pm = smoothstep(1.0 + aw * 6.0, 1.0 - aw * 6.0, pr) * step(0.0, a), im = smoothstep(0.3, 0.45, a);
  c = mix(c, vec3(0.015, 0.012, 0.01), pm);
  c = mix(vec3(0.025, 0.02, 0.018), c, im); // (the dark round it)
  f3em = ir.rgb * f3T(7).w * im * (1.0 - pm); // (eyes that burn: the dragon's)
  float hl = dot(d, normalize(g + vec3(-0.25 * sd, 0.45, 0.2))); f3gl = smoothstep(0.965, 0.98, hl);
  return mix(c, vec3(1.0), f3gl * 0.8);
}
float f3ph = 0.0; // (the pattern's own relief: the scutes' seams, the wrinkles, the feathers' edges — D-324)
vec3 f3pattern(vec3 c, vec3 p, float kind, vec3 dk, float sc, float con, float seed) {
  vec3 q = p * sc + seed;
  if (kind < 0.5) return c;
  if (kind < 1.5) { // the giraffe: patches parted by pale lines
    vec3 id; vec2 r = f3cell(q + vec3(0.0, 0.0, f3n(q * 2.0) * 0.3), id); float e = r.y - r.x; float line = f3aa(e - 0.09 - 0.04 * f3n(q * 5.0));
    vec3 pc = dk * (0.85 + 0.3 * f3h(id)); return mix(mix(c, pc, con), c * 1.08, line); }
  if (kind < 2.5) { // the zebra: stripes round the body, bending down the legs and the neck
    float w = q.z * 1.0 + q.y * 0.35 + sin(q.y * 2.2 + q.z * 0.6) * 0.35 + f3n(q * 1.5) * 0.4; float s = abs(fract(w) - 0.5) - 0.24;
    return mix(c, dk, f3aa(s) * con); }
  if (kind < 3.5) { // the tiger: bold stripes down the flanks, a little slanted, tapering, now and then forked; round the legs
    float w = q.z * 1.1 + q.y * 0.35 + f3n(q * vec3(0.8, 2.2, 0.8)) * 0.9; float e = abs(fract(w) - 0.5);
    float s = e - 0.17 - 0.07 * f3n(q * 3.0) + smoothstep(0.42, 0.78, f3n(q * 1.7 + 5.0)) * 0.13;
    s = max(s, 0.035 - e - (1.0 - smoothstep(0.55, 0.8, f3n(q * 2.3 + 9.0)))); // (the fork: a pale split down some of them)
    return mix(c, dk, f3aa(s) * con); }
  if (kind < 4.5) { // rosettes: dark rings round a darker middle
    vec3 id; vec2 r = f3cell(q, id); float ring = abs(r.x - 0.26 - 0.05 * f3n(q * 6.0)) - 0.07; float mid = r.x - 0.16;
    vec3 c2 = mix(c, c * 0.82, f3aa(mid) * 0.6); return mix(c2, dk, f3aa(ring) * con * step(0.25, f3h(id + 3.1))); }
  if (kind < 5.5) { // spots
    vec3 id; vec2 r = f3cell(q, id); f3ph = 0.15 * smoothstep(0.3, 0.0, r.x); return mix(c, dk, f3aa(r.x - 0.22 - 0.06 * f3h(id)) * con); }
  if (kind < 6.5) { // great patches (the cattle, the piebald)
    float n = f3n(q * 0.9) * 0.65 + f3n(q * 2.3) * 0.35; return mix(c, dk, f3aa(0.52 - n) * con); }
  if (kind < 7.5) { // the tabby: thin stripes, darker along the back
    float w = q.z * 1.4 + f3n(q * 1.6) * 0.7; float s = abs(fract(w) - 0.5) - 0.17; return mix(c, dk, f3aa(s) * con * 0.85); }
  if (kind < 8.5) { // scutes: rows of plates, darker in their joins
    vec3 g = fract(q * vec3(1.3, 1.0, 1.6)) - 0.5; float e = max(abs(g.x), abs(g.z)); f3ph = -smoothstep(0.36, 0.5, e) + 0.3 * f3n(q * 4.0); return mix(c, dk, smoothstep(0.38, 0.5, e) * con); }
  if (kind < 9.5) { // the snake's saddles: dark blotches on the back, edged pale
    float n = sin(q.z * 2.6 + f3n(q * 2.0) * 2.0) * 0.5 + 0.5; float up = smoothstep(-0.35, 0.45, normalize(vBindN).y + (f3n(q * 3.0) - 0.5) * 0.4);
    float m = smoothstep(0.55, 0.62, n) * up; float e = (smoothstep(0.45, 0.55, n) - smoothstep(0.55, 0.62, n)) * up;
    return mix(mix(c, dk, m * con), c * 1.25, e * 0.6); }
  if (kind < 10.5) { // the wool: curls catching the light
    float n = f3n(q * 3.0) * 0.6 + f3n(q * 7.0) * 0.4; return c * (0.82 + 0.32 * n); }
  if (kind < 11.5) { // feathers: scallops in rows
    vec3 g = q * vec3(1.6, 2.2, 2.2); float r = length(fract(vec2(g.x + floor(g.z) * 0.5, g.z)) - vec2(0.5, 0.0)); return mix(c, dk, smoothstep(0.42, 0.55, r) * con); }
  if (kind < 12.5) { // dapples
    vec3 id; vec2 r = f3cell(q, id); return mix(c * 1.12, c * 0.9, smoothstep(0.1, 0.5, r.x)); }
  if (kind < 13.5) { // the forequarters dark and shaggy (the bison): from a line across the body, forward (sc: where, in the beast's heights)
    float e = smoothstep(sc - 0.08, sc + 0.08, p.z + f3n(p * 9.0) * 0.08); return mix(c, dk, e * con); }
  if (kind < 14.5) { // a wrinkled hide: fine creases, more on the legs
    float n = f3n(q * vec3(2.0, 9.0, 2.0)) * 0.6 + f3n(q * 7.0) * 0.4; float k = 1.0 - smoothstep(0.0, 0.03, fwidth(q.y) * 9.0); f3ph = -0.6 * con * smoothstep(0.4, 0.8, n); return c * (1.0 - con * 0.22 * smoothstep(0.45, 0.75, n) * k); }
  if (kind < 15.5) { // the dragon's scales: each its own shade, lit at its middle and dark at its rim
    vec3 id; vec2 r = f3cell(q * vec3(1.0, 1.3, 0.8), id); float e = r.y - r.x;
    vec3 s = c * (0.9 + 0.2 * f3h(id)) * mix(1.12, 0.8, smoothstep(0.05, 0.6, r.x));
    return mix(s, dk, f3aa(e - 0.07) * con); }
  return c;
}
// the sea's coat (D-267; the coat's pattern 16 the swimmers, 17 the sea turtle's skin). The back's colour over the belly's,
// parted by a line drawn from a signed distance (reg.x: 0.5 on the line, written by fauna_forma.swim_paint) — crisp whatever
// the triangles, or as soft as Be.w; ragged and flecked by a mottle (Dk, its scale; X.x its strength: the whale's blotches);
// the dark cape down the back (reg2.z, the back's texel 11); the orca's grey saddle (reg.w, the mask's texel 14); the
// stripes (reg2.y where reg2.w: the shark's gill slits, the whale's throat grooves — the ear's texel 10); the fins' tips
// (reg.y, the socks' 3), the flukes' (reg2.x, the mane's 5). The turtle's skin: scales parted by pale lines (the belly's)
vec3 f3sea(vec4 C) {
  vec4 Be = f3T(1), Dk = f3T(2), So = f3T(3), Mz = f3T(4), Mn = f3T(5), Er = f3T(10), Bk = f3T(11), X = f3T(13), Mk = f3T(14), Ey = f3T(16);
  vec3 p = vBind / max(Ey.y, 0.05); vec3 c = C.rgb;
  if (C.w > 16.5) {
    vec3 id; vec2 r = f3cell(p * Dk.w + X.y, id); float e = r.y - r.x;
    c = mix(c * (0.84 + 0.26 * f3h(id)), mix(c, Be.rgb, 0.38), f3aa(e - 0.035));
    return mix(c, Be.rgb, smoothstep(0.12, 0.8, vReg.x) * Be.w);
  }
  c = mix(c, Bk.rgb, smoothstep(0.1, 0.9, vReg2.z) * Bk.w);
  c = mix(c, Mk.rgb, smoothstep(0.2, 0.7, vReg.w) * Mk.w);
  float n = f3n(p * Dk.w + X.y) * 0.65 + f3n(p * Dk.w * 2.7 + X.y) * 0.35;
  float d = vReg.x - 0.5 + (n - 0.5) * X.x * 0.03; float w = fwidth(d) * 0.75 + Be.w * 0.2 + 1e-4;
  float bel = smoothstep(-w, w, d);
  c = mix(c, Be.rgb, bel);
  c = mix(c, Dk.rgb, smoothstep(0.6, 0.66, n) * X.x * bel * smoothstep(0.62, 0.5, vReg.x));
  c = mix(c, Mz.rgb, smoothstep(0.3, 0.8, vReg.z) * Mz.w);
  float sg = abs(fract(vReg2.y * 25.5 + 0.5) - 0.5); c = mix(c, Er.rgb, f3aa(sg - 0.09) * smoothstep(0.2, 0.6, vReg2.w) * Er.w);
  c = mix(c, So.rgb, smoothstep(0.72, 0.92, vReg.y) * So.w);
  c = mix(c, Mn.rgb, smoothstep(Ey.w, min(Ey.w + 0.08, 1.0), vReg2.x) * Mn.w);
  return c;
}
// the sea turtle's shell (zone 13, the coat's pattern 17): its scutes — five down the middle, four each side, the ring of the
// rim — parted by fine seams, each streaked out from its growing corner (the tortoiseshell), in the shell's colour (the
// wings' texel 15) with the dark of its streaks (Dk) and an amber light; the plastron under it (the belly's colour), in plates.
// Where each point is on the shell is in its regions (fauna_forma.shell_paint: across, along, under, the rim)
float f3band(float v, vec4 b, out float id) { float m = 9.0; id = 0.0;
  for (int k = 0; k < 4; k++) { float e = abs(v - b[k]); if (e < m) m = e; if (v < b[k]) id = float(k) + 1.0; } return m; }
vec3 f3shell() {
  vec4 Sh = f3T(15), Dk = f3T(2), Be = f3T(1);
  float u = vReg.x * 2.0 - 1.0, v = vReg.y * 2.0 - 1.0, au = abs(u), rim = vReg.w;
  float vw = 0.26 + 0.06 * (1.0 - v * v); float sd, id; vec2 g;
  if (rim > 0.82) { float an = atan(au, v) * 11.0 / 3.14159; sd = min(abs(fract(an + 0.5) - 0.5) * 0.25, rim - 0.82); id = 20.0 + floor(an) + step(0.0, u) * 11.0; g = vec2(0.0, rim - 0.98); }
  else if (au < vw) { sd = min(f3band(v, vec4(0.6, 0.24, -0.12, -0.46), id), vw - au); g = vec2(u * 2.0, fract(v * 2.6 + 0.3) - 0.85); }
  else { float vs = v + (au - vw) * 0.45; sd = min(min(f3band(vs, vec4(0.44, 0.06, -0.32, -9.0), id), au - vw), 0.82 - rim); id += 5.0 + step(0.0, u) * 5.0; g = vec2((au - vw) * 2.0 - 0.9, fract(vs * 2.6 + 0.15) - 0.9); }
  float a = atan(g.y, g.x); float rr = length(g);
  float st = f3n(vec3(a * 4.5, rr * 1.5, id * 3.7)) * 0.7 + f3n(vec3(a * 11.0, rr * 4.0, id)) * 0.3;
  vec3 c = mix(Sh.rgb * 1.45 + vec3(0.06, 0.03, 0.0), Sh.rgb, smoothstep(0.2, 0.5, st));
  c = mix(c, mix(Sh.rgb, Dk.rgb, 0.7), smoothstep(0.6, 0.75, st));
  c = mix(c, Dk.rgb, f3aa(sd - 0.008) * 0.75);
  vec3 pl = Be.rgb * (0.92 + 0.08 * f3n(vec3(u * 9.0, v * 9.0, 1.0))); pl = mix(pl, Be.rgb * 0.7, f3aa(min(abs(u), abs(fract(v * 2.5) - 0.5) * 0.4) - 0.01));
  return mix(c, pl, smoothstep(0.3, 0.7, vReg.z));
}
// the face told on the skin (D-321; the mesh's texels 22-26, both sides by the left's): the rim of the lids and the bare skin
// round the eye (27: its colour, how much), the mouth's line where the lips part — the plane through its corner and its front,
// across the muzzle, only where the skin crosses it —, the cleft from the nose down to the lip (the cats', the dogs'), the
// nostrils' holes dark. Lines as wide as told, never thinner than a pixel and a half
vec3 f3face(vec3 c, float zb) {
  vec4 F0 = f3T(22), F2 = f3T(24), F3 = f3T(25), F4 = f3T(26), LD = f3T(27);
  vec3 p = vec3(abs(vBind.x), vBind.yz); vec3 N3 = normalize(vBindN);
  float d = length(p - F0.xyz) / F0.w;
  float rim = smoothstep(1.3, 1.12, d) * smoothstep(0.85, 1.0, d), halo = smoothstep(1.85, 1.25, d) * 0.3; // (the lids' edge, and the skin round the eye)
  c = mix(c, LD.rgb, max(rim, halo) * LD.w * (1.0 - zb));
  if (F3.x > 0.0) {
    vec2 C = F2.xy, Fp = F2.zw, e = Fp - C; float L = max(length(e), 1e-5); e /= L; vec2 nn = vec2(-e.y, e.x);
    vec2 q = p.yz - C; float t = dot(q, e) / L, h = dot(q, nn); float w = F3.x + fwidth(h) * 0.9;
    float ln = (1.0 - smoothstep(w * 0.45, w, abs(h))) * smoothstep(-0.12, 0.05, t) * (1.0 - smoothstep(1.06, 1.2, t)) * (1.0 - smoothstep(F3.y, F3.y + w * 3.0, p.x));
    ln *= 1.0 - smoothstep(0.55, 0.85, abs(dot(N3, vec3(0.0, nn))));
    c = mix(c, c * 0.16, ln * 0.92);
    if (F3.z != 0.0 || F3.w != 0.0) { // (the cleft: in the middle, from under the nose to the lips' front, on the face's front)
      vec2 Np = F3.zw, e2 = Fp - Np; float L2 = max(length(e2), 1e-5); vec2 q2 = p.yz - Np; float t2 = dot(q2, e2) / (L2 * L2), o2 = abs(dot(q2, vec2(-e2.y, e2.x))) / L2;
      float cl = (1.0 - smoothstep(F3.x * 0.4, F3.x * 0.9 + fwidth(p.x), p.x)) * smoothstep(-0.05, 0.05, t2) * (1.0 - smoothstep(0.95, 1.05, t2)) * (1.0 - smoothstep(0.25, 0.45, o2)) * smoothstep(0.0, 0.3, N3.z);
      c = mix(c, c * 0.22, cl * 0.85); }
  }
  if (F4.w > 0.0) { float dn = length(p - F4.xyz) / F4.w; c = mix(c, c * 0.1, smoothstep(1.2, 0.75, dn)); }
  return c;
}
vec3 f3coat() {
  vec4 C = f3T(0), Be = f3T(1), Dk = f3T(2), So = f3T(3), Mz = f3T(4), Mn = f3T(5), X = f3T(13), Ey = f3T(16);
  if (C.w > 15.5) return f3sea(C);
  vec3 p = vBind / max(Ey.y, 0.05);
  vec3 c = C.rgb;
  float iv = f3T(21).z; // (this beast's own: its pattern not its kin's, its coat a shade its own — D-324)
  c = f3pattern(c, p, C.w, Dk.rgb, Dk.w, X.x, X.y + iv * 31.0);
  vec4 Bk = f3T(11); c = mix(c, Bk.rgb, vReg2.z * Bk.w);                                  // (the back's line)
  vec4 Th = f3T(12); c = mix(c, Th.rgb, smoothstep(0.15, 0.85, vReg2.w) * Th.w);           // (the throat and breast)
  c = mix(c, Be.rgb, smoothstep(0.12, 0.8, vReg.x) * Be.w);                               // (the belly, lighter)
  if (C.w > 14.5 && C.w < 15.5) { float pl = fract(vReg2.x * 64.0); float bw = smoothstep(0.12, 0.8, vReg.x) * Be.w;   // (the dragon's belly: plates across it, a seam between each two)
    c = mix(c, c * (0.84 + 0.26 * pl), bw); c = mix(c, Dk.rgb * 0.9, f3aa(min(pl, 1.0 - pl) * 2.0 - 0.1) * bw * 0.85); }
  c = mix(c, Dk.rgb, smoothstep(0.1, 0.32, vReg.x) * smoothstep(0.62, 0.36, vReg.x) * Ey.z); // (the flank's dark band, where the belly begins)
  c = mix(c, So.rgb, smoothstep(0.25, 0.85, vReg.y) * So.w);                              // (the socks)
  vec4 Mk = f3T(14); c = mix(c, Mk.rgb, smoothstep(0.3, 0.9, vReg.w) * (1.0 - vReg.z) * Mk.w); // (the face)
  c = mix(c, Mz.rgb, smoothstep(0.1, 0.7, vReg.z) * Mz.w);                                // (the muzzle)
  vec4 Hn = f3T(6); c = mix(c, vec3(0.05, 0.04, 0.035), smoothstep(0.86, 0.97, vReg.z) * Hn.w); // (the nose's leather)
  f3sp = 0.6 * smoothstep(0.86, 0.97, vReg.z) * Hn.w; f3shn = 60.0;                       // (wet)
  vec4 Er = f3T(10); c = mix(c, Er.rgb, smoothstep(0.55, 0.95, vReg2.y) * Er.w);          // (the ear tips)
  c = mix(c, Mn.rgb, smoothstep(Ey.w, min(Ey.w + 0.22, 1.0), vReg2.x) * Mn.w);          // (the tail's tip — or all of it)
  vec3 ib = f3T(17).rgb; float inner = smoothstep(0.15, 0.4, vReg2.y) * smoothstep(0.2, 0.6, dot(normalize(vBindN), vec3(0.0, 0.0, 1.0)));
  c = mix(c, ib, inner * 0.65 * step(0.01, vReg2.y));                                   // (the inside of the ear)
  // (the fur's grain: fine strands along the body, gone before they could shimmer)
  float fk = 1.0 - smoothstep(0.004, 0.02, fwidth(vBind.z) * 40.0);
  float H = max(Ey.y, 0.2), g1 = f3n(vBind * vec3(60.0, 160.0, 25.0) / H);
  c *= 1.0 + (g1 - 0.5) * 0.16 * X.z * fk;
  if (f3T(22).w > 0.0) { // (a face told — D-321, D-324: the coat a shade its own in broad soft clouds; the face; the fur's relief — its tufts and
    // its strands, the hide's wrinkles, the scales' seams —, each gone before it could shimmer)
    vec3 nB = normalize(vBindN); float fur = clamp(X.z, 0.0, 1.0);
    c *= (0.89 + 0.22 * (f3n(p * 1.7 + iv * 13.0) * 0.65 + f3n(p * 4.3 + iv * 5.0) * 0.35)) * (0.97 + 0.06 * iv);
    c *= 1.0 - (0.08 + 0.1 * fur) * smoothstep(0.1, 0.95, nB.y) * (1.0 - smoothstep(0.2, 0.8, vReg.y)); // (the back darker than the flank: the coat's own shade over the form)
    c = f3face(c, 0.0);
    float g2 = f3n(vBind * vec3(16.0, 34.0, 9.0) / H + iv * 7.0), k2 = 1.0 - smoothstep(0.25, 0.6, fwidth(vBind.y) * 34.0 / H);
    c *= 1.0 + (g2 - 0.5) * 0.12 * fur * k2; // (the tufts, a shade each)
    f3bh = (g1 * 0.0009 * fk + g2 * 0.0032 * k2) * H * X.z + f3ph * H * 0.006 * k2; f3bs = 1.0;
  }
  return c;
}
// the marks of what happened to this beast (D-283; the texels after the coat: 18 the blood on the muzzle, what is eaten of a
// carcass, its bones, the eyes — 19, 20 the wounds by zone, the wet, the mud — 21 the dust, the frost): the wounds dark gashes
// with the blood run down from them, the muzzle red from the kill, the carcass opened on its flank and belly — the ribs showing
// as it is eaten, the bones at the end —, the coat darker wet, the mud on the legs and the belly, the dust paler over all
float f3wet = 0.0;
vec3 f3marks(vec3 c) {
  vec4 M0 = f3T(18), M2 = f3T(20), M3 = f3T(21); float H = max(f3T(16).y, 0.05); vec3 q = vBind / H;
  vec3 blood = vec3(0.36, 0.035, 0.04), fresh = vec3(0.55, 0.06, 0.06);
  if (vWnd > 0.01) { // (a few torn places in the zone — as big as the wound is bad —, raked by parallel gashes, the blood run down below them)
    float sd = f3T(13).y; float blob = smoothstep(0.66 - 0.28 * vWnd, 0.72 - 0.28 * vWnd, f3n(q * 3.2 + sd));
    float above = smoothstep(0.62 - 0.3 * vWnd, 0.7 - 0.3 * vWnd, f3n((q + vec3(0.0, 0.22, 0.0)) * 3.2 + sd));
    float gash = smoothstep(0.1, 0.0, abs(fract((q.z * 1.0 + q.y * 1.7 + q.x * 0.5) * 7.0) - 0.5) - 0.36) * blob;
    float run = above * (1.0 - blob) * smoothstep(0.5, 0.68, f3n(vec3(q.x * 34.0, q.y * 2.5, q.z * 34.0))) * smoothstep(0.3, 0.8, vWnd);
    c = mix(c, mix(fresh, blood, 0.35), blob * 0.75); c = mix(c, blood * 0.45, gash); c = mix(c, fresh * 0.9, run * 0.85); }
  if (M0.x > 0.01) { float mz = smoothstep(0.08, 0.6, vReg.z) + float(vZoneI == 5) + smoothstep(0.3, 0.9, vReg2.w) * smoothstep(0.4, 0.9, M0.x) * smoothstep(0.5, 0.7, f3n(vec3(q.x * 40.0, q.y * 5.0, q.z * 40.0)));
    c = mix(c, mix(fresh, blood, 0.4), clamp(mz, 0.0, 1.0) * M0.x * 0.9); }
  if (M0.y > 0.01 && vZoneI == 0) { float side = smoothstep(0.15, 0.85, vReg.x) + 0.6 * (1.0 - smoothstep(0.1, 0.6, abs(normalize(vBindN).y))); float mask = clamp(side, 0.0, 1.0) * smoothstep(0.2, 0.7, vTrunk);
    float torn = smoothstep(0.35, 0.65, f3n(q * 9.0) + M0.y * 0.6 - 0.3); vec3 meat = mix(blood, fresh * 1.25, smoothstep(0.4, 0.8, f3n(q * 22.0)));
    float rib = smoothstep(0.1, 0.03, abs(fract(q.z * 7.0) - 0.5) - 0.32) * smoothstep(0.45, 0.8, M0.y);
    c = mix(c, mix(meat, vec3(0.88, 0.83, 0.74), rib), mask * torn * clamp(M0.y * 1.6, 0.0, 1.0)); }
  if (M0.z > 0.5) { float rib = smoothstep(0.1, 0.03, abs(fract(q.z * 7.0) - 0.5) - 0.3); vec3 bone = vec3(0.86, 0.81, 0.72) * (0.85 + 0.25 * f3n(q * 40.0));
    c = mix(mix(bone, vec3(0.22, 0.12, 0.08), (1.0 - rib) * smoothstep(0.2, 0.8, vTrunk) * 0.75), c, 0.12); }
  if (M2.z > 0.01) { c *= 1.0 - 0.38 * M2.z; f3wet = M2.z; }
  if (M2.w > 0.01) { float low = 1.0 - smoothstep(0.05, 0.5, q.y); float mk = clamp(vLeg * 1.2 + smoothstep(0.1, 0.8, vReg.x) * 0.7 + low * 0.8, 0.0, 1.0) * (0.55 + 0.45 * f3n(q * 14.0));
    c = mix(c, vec3(0.2, 0.15, 0.1), clamp(mk * M2.w * 1.2, 0.0, 0.92)); }
  if (M3.x > 0.01) c = mix(c, vec3(0.62, 0.54, 0.4), M3.x * 0.5 * (0.7 + 0.3 * f3n(q * 11.0)));
  if (M3.y > 0.01) c = mix(c, vec3(0.86, 0.9, 0.95), M3.y * 0.35 * smoothstep(0.3, 0.9, normalize(vBindN).y));
  return c;
}
// (the relief on the shading normal — the surface's own gradient of the height, as three's bump map does it; vp the view position,
// fd the face's side)
vec3 f3bump(vec3 N, vec3 vp, float fd) {
  vec3 dpx = dFdx(-vp), dpy = dFdy(-vp); float dhx = dFdx(f3bh), dhy = dFdy(f3bh);
  if (f3bs <= 0.0) return N;
  vec3 r1 = cross(dpy, N), r2 = cross(N, dpx); float det = dot(dpx, r1) * fd;
  vec3 g = sign(det) * (dhx * r1 + dhy * r2) * f3bs; return normalize(abs(det) * N - g);
}
vec3 f3paint() {
  int z = vZoneI;
  if (z == 1 || z == 2) return f3eye();
  if (z == 0) return f3coat();
  // (a face told — D-323: a horn, an antler, a tusk carries how far out along it each point is, reg2.x: the horn's rings and its
  // tip darker, the antler's tines paler at their ends, the tusk yellowed where it leaves the lip)
  bool told = f3T(22).w > 0.0; float al = vReg2.x;
  if (z == 3) { vec3 h = f3T(6).rgb; float n = f3n(vBind * 90.0); vec3 c = h * (0.85 + 0.25 * n); f3sp = 0.18; f3shn = 30.0;    // horn
    if (told) { float rg = smoothstep(0.3, 0.48, abs(fract(al * 13.0 + n * 0.25) - 0.5)) * (1.0 - smoothstep(0.5, 0.9, al));
      c *= 1.0 - 0.22 * rg; c = mix(c, c * 0.4, smoothstep(0.55, 1.0, al) * 0.8); c = mix(c * 0.78, c, smoothstep(0.0, 0.1, al)); f3bh = -rg * 0.0012; f3bs = 1.0; }
    return c; }
  if (z == 4 || z == 14) { f3sp = 0.1; f3shn = 20.0; return f3T(7).rgb * (0.9 + 0.15 * f3n(vBind * 120.0)); }                       // hoof, claws, nails
  if (z == 6) { vec4 m = f3T(5); float k = 1.0 - smoothstep(0.0, 0.03, fwidth(vBind.x) * 60.0); float st = f3n(vBind * vec3(240.0, 40.0, 240.0));
    if (told) { f3bh = st * 0.0015 * k; f3bs = 1.0; }
    return m.rgb * (0.85 + 0.3 * k * st); } // mane, tuft
  if (z == 7) { f3sp = 0.3; f3shn = 50.0; vec3 iv = vec3(0.9, 0.86, 0.76); return told ? mix(vec3(0.6, 0.52, 0.38), iv * (0.95 + 0.08 * f3n(vBind * 60.0)), smoothstep(0.0, 0.35, al)) : iv; } // ivory
  if (z == 8) { vec3 c = f3T(8).rgb; f3sp = 0.2; f3shn = 36.0; return told && f3T(25).x > 0.0 && vZoneI == 8 ? f3face(c, 1.0) : c; } // beak (its gape), bare legs
  if (z == 9) { f3em = f3T(8).rgb * f3T(17).w; return f3T(17).rgb; }                                // comb, wattle; the dragon's mouth (its glow)
  if (z == 10) { vec3 c = f3T(6).rgb * (0.8 + 0.3 * f3n(vBind * 70.0)); f3sp = 0.08; return told ? mix(c, vec3(0.93, 0.89, 0.8), smoothstep(0.82, 1.0, al) * 0.8) : c; } // antler
  if (z == 11 || z == 12) { vec4 w = f3T(15); vec3 c = z == 11 ? w.rgb : f3T(5).rgb; vec3 q = vBind / max(f3T(16).y, 0.05);
    if (z == 11) { c = mix(c, f3T(2).rgb, smoothstep(0.62, 0.92, vReg2.x) * f3T(10).w); f3bl = f3T(8).w; } // (the wing's tips, darker; a membrane the sun shows through)
    float bar = w.w > 0.5 ? step(0.5, fract(q.z * 6.0 + q.x * 2.0)) * 0.18 : 0.0;
    float k = 1.0 - smoothstep(0.0, 0.02, fwidth(vBind.x) * 60.0);
    return c * (1.0 - bar) * (0.9 + 0.15 * k * f3n(vBind * vec3(60.0, 30.0, 160.0))); }
  if (z == 13 && f3T(0).w > 15.5) return f3shell();                                                   // the sea turtle's shell
  if (z == 13) { vec4 C = f3T(0); return f3pattern(C.rgb * 0.8, vBind / max(f3T(16).y, 0.05), 8.0, f3T(2).rgb, 4.0, 0.7, 0.0); } // shell
  return f3T(0).rgb;
}
`;
  function shaders() {
    const pb = '#define PB ' + PB + '\n';
    mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    mat.onBeforeCompile = sh => {
      sh.uniforms.uFauna = F3.U; sh.uniforms.uRim = F3.rim;
      sh.vertexShader = pb + SKIN + VARY + ZONES + sh.vertexShader
        .replace('#include <beginnormal_vertex>', `vec3 f3P, f3N; f3skin(position, normal, f3P, f3N);
          vec3 objectNormal = f3N;
          #ifdef USE_TANGENT
          vec3 objectTangent = vec3( tangent.xyz );
          #endif
          vBind = position; vBindN = normal; vAO = aAO; vReg = aReg; vReg2 = aReg2; vRowI = int(aRow + 0.5); vZoneI = int(aZone + 0.5); f3marksV();`)
        .replace('#include <begin_vertex>', 'vec3 transformed = f3P;');
      sh.fragmentShader = pb + 'uniform highp sampler2D uFauna; uniform float uRim;\n' + VARY + PAINT + sh.fragmentShader
        .replace('#include <color_fragment>', '#include <color_fragment>\n  diffuseColor.rgb = vZoneI == 1 || vZoneI == 2 ? f3paint() : f3marks(f3paint()); diffuseColor.rgb *= mix(1.0, vAO, 0.7);')
        .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n  normal = f3bump(normal, vViewPosition, faceDirection);')
        .replace('#include <opaque_fragment>', `outgoingLight += diffuseColor.rgb * pow(1.0 - abs(dot(normal, normalize(vViewPosition))), 3.0) * uRim * (1.0 + 2.5 * f3wet) + vec3(0.92, 0.94, 1.0) * f3gl * 0.4 + f3em;
          #if NUM_DIR_LIGHTS > 0
          if (f3bl > 0.0) { float bl = max(0.0, dot(-normalize(vViewPosition), directionalLights[0].direction)); outgoingLight += diffuseColor.rgb * vec3(1.0, 0.62, 0.42) * directionalLights[0].color * bl * bl * f3bl; }
          { float sp = f3sp + f3wet * 0.45; if (sp > 0.0) { // (the sheen of the sun, as much as the sun reaches here: the shade and the shadow take it — D-324)
            vec3 Hh = normalize(directionalLights[0].direction + normalize(vViewPosition)); float sh = f3wet > 0.0 && f3sp < 0.05 ? 30.0 : f3shn;
            float lit = clamp(3.14159 * dot(reflectedLight.directDiffuse, vec3(0.333)) / max(dot(diffuseColor.rgb * directionalLights[0].color, vec3(0.333)), 1e-4), 0.0, 1.0);
            outgoingLight += directionalLights[0].color * pow(max(dot(normal, Hh), 0.0), sh) * sp * (sh + 8.0) / 60.0 * lit; } }
          #endif
          #include <opaque_fragment>`);
    };
    mat.customProgramCacheKey = () => 'fauna3d-v6';
    depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
    depth.onBeforeCompile = sh => {
      sh.uniforms.uFauna = F3.U;
      sh.vertexShader = pb + SKIN + sh.vertexShader.replace('#include <begin_vertex>', 'vec3 f3P, f3N; f3skin(position, vec3(0.0, 1.0, 0.0), f3P, f3N); vec3 transformed = f3P;');
    };
    depth.customProgramCacheKey = () => 'fauna3d-depth-v1';
  }

  // ------------------------------ starting ------------------------------
  F3.init = function (three, realm) {
    THREE = three; scene = realm.scene();
    try {
      D = G.FAUNAMESH; if (!D || !D.meshes || !D.species) throw new Error('sem malhas (js/faunamesh.js)');
      if (!G.FaunaAnim || G.FaunaAnim.BONES.join() !== D.bones.join()) throw new Error('o esqueleto do FaunaAnim e o das malhas discordam');
      NB = D.bones.length; PB = NB * 3; TW = PB + NP;
      buf = new Float32Array(TW * ROWS * 4);
      tex = new THREE.DataTexture(buf, TW, ROWS, THREE.RGBAFormat, THREE.FloatType);
      tex.minFilter = tex.magFilter = THREE.NearestFilter; tex.generateMipmaps = false; tex.needsUpdate = true;
      F3.U = { value: tex };
      shaders();
      for (const name in D.meshes) {
        const o = geometryOf(D.meshes[name]);
        const m = new THREE.Mesh(o.g, mat); m.frustumCulled = false; m.castShadow = true; m.receiveShadow = false; m.customDepthMaterial = depth; m.matrixAutoUpdate = false; m.visible = false;
        scene.add(m); MESH[name] = { mesh: m, geo: o.g, rows: o.rows, ra: o.ra, n: 0, tris: o.tris, u: o.u };
      }
      for (const name in D.forms) { const f = D.forms[name]; FORM[name] = { J: new Float32Array(f.bind), box: f.box, meta: f.meta, ft: faceOf(f.meta) }; }
      // (the support points of each bone's skin, for the gestures that set the body on the ground — FaunaAnim.Gest, D-280)
      const FG = G.FaunaAnim.Gest; if (FG && FG.hullOf) for (const name in FORM) if (MESH[name] && MESH[name].u) FORM[name].hull = F3.hullOf(name, n => MESH[n] && MESH[n].u);
      F3.dataErr = selfCheck(); for (const k in MESH) MESH[k].u = null;
      F3.ready = true; return true;
    } catch (e) { F3.failed = String((e && e.message) || e); F3.ready = false; return false; }
  };
  // (the data, once at the start: every kind of the land, the water's edge, the air and the sea has its mesh, its form and its
  // coat — a bird of the air its mesh in flight, a beast of the sea a swimmer's form —; every mesh's indices, bones, weights and
  // zones are sound; every form's joints are where a beast's are)
  function selfCheck() {
    const out = []; const ZN = new Set(Object.values(D.zones || {}));
    for (const kind in G.Animals.DEF) { const sp = G.Animals.DEF[kind]; const e = D.species[kind];
      if (!e || !MESH[e.mesh] || !FORM[e.mesh]) { out.push(`bicho ${kind}: sem malha`); continue; }
      if (sp.cls === 'air' && (!e.fly || !MESH[e.fly] || !FORM[e.fly])) out.push(`bicho ${kind}: ave do ar sem a malha do voo`);
      if (sp.cls === 'water') { const sw = FORM[e.mesh].meta.swim; if (!sw || !(sw.R > 0)) out.push(`bicho ${kind}: do mar sem a forma de nadador (D-267)`);
        else if (Math.abs(FORM[e.mesh].J[G.FaunaAnim.B.root * 3 + 1] - sw.yc) > sw.R * 0.35) out.push(`bicho ${kind}: o quadril do nadador longe do meio do corpo`);
        if (!G.FaunaAnim[FORM[e.mesh].meta.fam]) out.push(`bicho ${kind}: sem o nado da família ${FORM[e.mesh].meta.fam} (FaunaAnim)`); }
      if (!G.FaunaAnim.paint(kind)) out.push(`bicho ${kind}: sem pelagem (FaunaAnim PAINT)`);
      // (every beast of the land, the water's edge and the air: its face told — the eye seated on the skin, L-1040, D-321 — and its
      // eyes in each of its three levels, the far one too — L-1041, D-322)
      if (sp.cls !== 'water') for (const mn of sp.cls === 'air' ? [e.mesh, e.fly] : [e.mesh]) {
        if (!(FORM[mn].ft[3] > 0)) out.push(`bicho ${kind}: sem o rosto na malha ${mn} (o olho na pele, D-321)`);
        for (const n of [mn, mn + '_1', mn + '_2']) { const m = D.meshes[n]; if (!m) { out.push(`bicho ${kind}: sem a malha ${n} (os três níveis, D-322)`); continue; }
          const zn = MESH[n] && MESH[n].u ? MESH[n].u.zone : unpack(m).zone; if (!zn.includes(D.zones.olhoL) || !zn.includes(D.zones.olhoR)) out.push(`bicho ${kind}: a malha ${n} sem os olhos (L-1041)`); } } }
    // (the dragon of the god's power — not a kind of Animals.DEF —: its mesh on the ground and its mesh in the air, its pose)
    { const e = D.species.dragon; if (!e || !MESH[e.mesh] || !FORM[e.mesh] || !e.fly || !MESH[e.fly] || !FORM[e.fly]) out.push('dragão: sem a malha do chão e a do voo');
      else if (!G.FaunaAnim.dragon || !G.FaunaAnim.dragonCoat) out.push('dragão: sem a pose (FaunaAnim.dragon)');
      else for (const n of [e.fly, e.fly + '_1']) { const m = D.meshes[n]; if (m && !(MESH[n] && MESH[n].u ? MESH[n].u : unpack(m)).zone.includes(D.zones.asa)) out.push(`dragão: a malha ${n} sem as asas`); } }
    for (const name in D.meshes) { const m = D.meshes[name]; const u = MESH[name] ? MESH[name].u : unpack(m); const idx = u.idx, bi = u.bi, bw = u.bw, zn = u.zone;
      for (let i = 0; i < idx.length; i++) if (idx[i] >= m.n) { out.push(`malha ${name}: índice ${idx[i]} além dos ${m.n} pontos`); break; }
      for (let i = 0; i < m.n; i++) { if (bw[i * 4] + bw[i * 4 + 1] + bw[i * 4 + 2] + bw[i * 4 + 3] !== 255) { out.push(`malha ${name}: ponto ${i} com pesos que não somam 1`); break; }
        if (bi[i * 4] >= NB || bi[i * 4 + 1] >= NB || bi[i * 4 + 2] >= NB || bi[i * 4 + 3] >= NB) { out.push(`malha ${name}: ponto ${i} num osso que não existe`); break; }
        if (!ZN.has(zn[i])) { out.push(`malha ${name}: ponto ${i} numa zona desconhecida (${zn[i]})`); break; } }
      if (!/_[12]$/.test(name) && !FORM[name]) out.push(`malha ${name}: sem forma (as juntas)`); } // (the lighter levels — _1, _2: D-322 — use the form of their mesh)
    for (const name in FORM) { const f = FORM[name]; if (f.J.length !== NB * 3 || !f.J.every(Number.isFinite)) { out.push(`forma ${name}: juntas inválidas`); continue; }
      if (f.meta.fam === 'quad') { const H = f.meta.H; for (const b of ['flL3', 'flR3', 'hlL3', 'hlR3']) { const y = f.J[G.FaunaAnim.B[b] * 3 + 1]; if (!(y >= -0.01 && y < H * 0.2)) out.push(`forma ${name}: o pé ${b} longe do chão (${y.toFixed(3)} m)`); } } }
    return out;
  }
  F3.dataErr = [];
  // (the face of a mesh, as the shader reads it — D-321: the left eye's centre and radius, its axis and the lids' opening, the
  // mouth's corner and front, its line's width, the corner's breadth and the cleft's top, the nostril; zeros: a face not told —
  // the dragon's, the sea's — painted as it was)
  function faceOf(m) {
    const f = m && m.face, t = new Float32Array(NF * 4); if (!f || !f.eye) return t;
    const put = (k, a) => { if (a) for (let i = 0; i < 4; i++) t[k * 4 + i] = a[i] || 0; };
    put(0, f.eye); put(1, f.ax); put(2, f.mouth); put(3, f.mw); put(4, f.nos); return t;
  }
  F3.faceOf = name => (FORM[name] ? FORM[name].ft : null); // (for the tests)
  // (a form's support points, for the gestures — FaunaAnim.Gest.hullOf, D-280: the ground under a lying body from the near mesh, the
  // skin that is drawn; the points the others reach for — the throat, the nape, the back, the rump — each bone's extremes, from the
  // middle level where there are three, made with the triangles the near one had before D-322: on the finer near level the gnu's
  // jowl, under the ear, a point shared by the head, the jaw and the neck, was the lowest of its neck — 9 cm under the throat and
  // 11 cm aside —, and the crocodile could not reach it, L-1047. unpacked(name): the unpacked mesh of that name)
  F3.hullOf = (name, unpacked) => {
    const FG = G.FaunaAnim.Gest, M = D || G.FAUNAMESH; const h = FG.hullOf(unpacked(name));
    if (M && M.meshes[name + '_2'] && M.meshes[name + '_1']) { const k = FG.hullOf(unpacked(name + '_1')); h.p = k.p; h.has = k.has; }
    return h;
  };
  // (a kind's mesh, its form and its scale — or null: the old pieces draw it)
  F3.has = kind => !!(F3.ready && D.species[kind] && FORM[D.species[kind].mesh] && MESH[D.species[kind].mesh]);
  F3.form = kind => { const s = D && D.species[kind]; return s ? FORM[s.mesh] : null; };
  F3.scaleOf = kind => { const s = D && D.species[kind]; return s ? s.scale || 1 : 1; };
  F3.meshOf = kind => { const s = D && D.species[kind]; return s ? s.mesh : null; };
  F3.hasFly = kind => !!(F3.ready && D.species[kind] && D.species[kind].fly && FORM[D.species[kind].fly] && MESH[D.species[kind].fly]);
  F3.formFly = kind => { const s = D && D.species[kind]; return s && s.fly ? FORM[s.fly] : null; };
  // (how big a kind is, in metres: its length or its height, whichever is more — the studio frames it by this)
  F3.sizeOf = kind => { const f = F3.form(kind); if (!f) return 1; const b = f.box; return Math.max(b[1][1], b[1][2] - b[0][2]) * F3.scaleOf(kind); };

  // ------------------------------ a frame ------------------------------
  const AT = []; // (where each row's beast stands, for the verifier: X, Y, Z, size, root X, Y, Z)
  F3.begin = function () { for (const k in MESH) MESH[k].n = 0; F3.rows = 0; F3.frame++; F3.live = true; };
  // (a drawer after People3D's beasts in the same frame takes the next free row, puts its beast there and ends the frame again:
  // the beasts' rows are People3D's MAXR; the sea's — Things3D, F3.take — the MAXS after them; the dragons' — G.Dragon3D,
  // F3.extra — whatever is left, the MAXD last ones always theirs; -1 when none is left or the frame was not opened. F3.frame
  // counts the frames People3D began: one that did not begin a frame here — it fell back to its pieces — has no rows)
  F3.take = () => (F3.ready && F3.live && F3.rows < MAXR + MAXS ? F3.rows : -1);
  F3.extra = () => (F3.ready && F3.rows < ROWS ? F3.rows : -1);
  // a beast in row `row`: R its bones' frames in the world (G.FaunaAnim), its kind, its coat (G.FaunaAnim.coat), its level of
  // detail (0 near, 1 far)
  // mk: the marks of this beast (16 numbers — People3D's marksOf: the blood on the muzzle, what is eaten of it, its bones, the eyes,
  // the six wounds, the wet, the mud, the dust, the frost); none: no marks
  F3.put = function (row, R, kind, coat, lod, X, Y, Z, fly, mk) {
    const s = D.species[kind]; const mn = fly && s.fly ? s.fly : s.mesh; const f = FORM[mn]; const J = f.J; const o = row * TW * 4;
    for (let b = 0; b < NB; b++) {
      const e = R[b].elements; const j = o + b * 12; const x = J[b * 3], y = J[b * 3 + 1], z = J[b * 3 + 2];
      // (the bind is the bones' joints with no turn: its inverse a translation — the skin is the frame moved back to the joint)
      buf[j] = e[0]; buf[j + 1] = e[4]; buf[j + 2] = e[8]; buf[j + 3] = e[12] - (e[0] * x + e[4] * y + e[8] * z);
      buf[j + 4] = e[1]; buf[j + 5] = e[5]; buf[j + 6] = e[9]; buf[j + 7] = e[13] - (e[1] * x + e[5] * y + e[9] * z);
      buf[j + 8] = e[2]; buf[j + 9] = e[6]; buf[j + 10] = e[10]; buf[j + 11] = e[14] - (e[2] * x + e[6] * y + e[10] * z);
    }
    const p = o + PB * 4; const C = coat;
    for (let k = 0; k < NC; k++) { const c = C[k]; const j = p + k * 4; buf[j] = c[0]; buf[j + 1] = c[1]; buf[j + 2] = c[2]; buf[j + 3] = c[3]; }
    for (let k = 0; k < 16; k++) buf[p + NC * 4 + k] = mk ? mk[k] : 0;
    buf.set(f.ft, p + FT * 4);
    for (let k = 0; k < 2; k++) { const c = C[NC + k], j = p + (CT2 + k) * 4; buf[j] = c ? c[0] : 0; buf[j + 1] = c ? c[1] : 0; buf[j + 2] = c ? c[2] : 0; buf[j + 3] = c ? c[3] : 0; }
    const e0 = R[0].elements; AT[row] = [X, Y, Z, F3.sizeOf(kind), e0[12], e0[13], e0[14]];
    // (the level: 0 near, 1 the middle — the far of a mesh with two —, 2 far: D-322)
    const name = F3.lod && lod >= 2 && MESH[mn + '_2'] ? mn + '_2' : F3.lod && lod > 0 && MESH[mn + '_1'] ? mn + '_1' : mn;
    const M = MESH[name]; if (M && M.n < ROWS) M.rows[M.n++] = row;
    if (row + 1 > F3.rows) F3.rows = row + 1;
  };
  F3.end = function () {
    let calls = 0, tris = 0;
    for (const k in MESH) { const M = MESH[k]; M.geo.instanceCount = M.n; M.mesh.visible = M.n > 0; if (M.n) { M.ra.needsUpdate = true; calls++; tris += M.n * M.tris; } }
    if (F3.rows) tex.needsUpdate = true;
    F3.calls = calls; F3.tris = tris;
  };
  F3.clear = function () { for (const k in MESH) { MESH[k].n = 0; MESH[k].geo.instanceCount = 0; MESH[k].mesh.visible = false; } F3.rows = 0; F3.live = false; };
  // (for the verifier: every number of every row drawn is a number; every mesh's rows are rows that were written; each row
  // drawn once; no beast's hips far from where the world has it)
  F3.check = function () {
    const out = F3.dataErr ? F3.dataErr.slice(0, 5) : []; if (!F3.ready) return out;
    for (let r = 0; r < F3.rows; r++) { const o = r * TW * 4; for (let k = 0; k < TW * 4; k++) if (!Number.isFinite(buf[o + k])) { out.push(`bicho ${r}: número inválido nos ossos`); return out; } }
    const seen = new Array(F3.rows).fill(0);
    for (const k in MESH) { const M = MESH[k]; for (let i = 0; i < M.n; i++) { if (!(M.rows[i] >= 0 && M.rows[i] < F3.rows)) { out.push(`malha ${k}: linha ${M.rows[i]} não desenhada`); break; } seen[M.rows[i]]++; } }
    for (let r = 0; r < F3.rows; r++) {
      if (seen[r] !== 1) { out.push(`bicho ${r}: ${seen[r]} malhas na mesma linha`); break; }
      const a = AT[r]; if (!a) continue; const dh = Math.hypot(a[4] - a[0], a[6] - a[2]), dv = a[5] - a[1];
      if (dh > 1.0 * a[3] + 0.5 || dv < -0.5 * a[3] - 0.3 || dv > 1.5 * a[3] + 2) { out.push(`bicho ${r}: o quadril a ${dh.toFixed(2)} m de onde o bicho está (altura ${dv.toFixed(2)})`); break; }
    }
    return out;
  };
  // (the meshes: their sizes and what they hold — for the tests)
  F3.meshes = () => Object.keys(MESH).map(k => ({ name: k, n: MESH[k].n, tris: MESH[k].tris }));
  F3.kinds = () => (D ? Object.keys(D.species) : []);
  F3.at = row => AT[row];
  F3.broken = function (renderer) {
    if (!F3.ready || !renderer || !renderer.properties) return false;
    for (const m of [mat, depth]) { const pr = renderer.properties.get(m); const prog = pr && pr.currentProgram; if (prog && prog.diagnostics && prog.diagnostics.runnable === false) return true; }
    return false;
  };
})(window.G);
