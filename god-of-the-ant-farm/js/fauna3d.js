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
  const F3 = G.Fauna3D = { ready: false, failed: null, rows: 0, calls: 0, tris: 0, lod: true };
  let THREE = null, scene = null;
  const MAXR = 64; // (rows: People3D's MAXA — the beasts drawn)
  let D = null, NB = 0, PB = 0, TW = 0, buf = null, tex = null, mat = null, depth = null, TU = null;
  const NP = 18; // texels of coat a row
  F3.MAXR = MAXR; F3.rim = (G.Body3D && G.Body3D.rim) || { value: 0.2 };
  const MESH = {}; // name → { mesh, geo, rows, ra, n, tris }
  const FORM = {}; // mesh name → { J: Float32Array(NB*3) the bind joints, box, meta }

  // ------------------------------ the data ------------------------------
  function bytes(s) { const b = atob(s); const u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function geometryOf(m) {
    const g = new THREE.InstancedBufferGeometry(); const n = m.n;
    const q = new Uint16Array(bytes(m.pos).buffer); const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) pos[i * 3 + k] = m.lo[k] + q[i * 3 + k] * m.sc[k];
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(new Int8Array(bytes(m.nor).buffer), 3, true));
    g.setAttribute('aBone', new THREE.BufferAttribute(bytes(m.bi), 4, false));
    g.setAttribute('aWt', new THREE.BufferAttribute(bytes(m.bw), 4, true));
    g.setAttribute('aZone', new THREE.BufferAttribute(bytes(m.zone), 1, false));
    g.setAttribute('aAO', new THREE.BufferAttribute(bytes(m.ao), 1, true));
    g.setAttribute('aReg', new THREE.BufferAttribute(bytes(m.reg), 4, true));
    g.setAttribute('aReg2', new THREE.BufferAttribute(bytes(m.reg2), 4, true));
    g.setIndex(new THREE.BufferAttribute(new Uint16Array(bytes(m.idx).buffer), 1));
    const rows = new Float32Array(MAXR); const ra = new THREE.InstancedBufferAttribute(rows, 1); ra.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('aRow', ra); g.instanceCount = 0;
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);
    return { g, rows, ra, tris: m.tris };
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
  const VARY = 'varying vec3 vBind; varying vec3 vBindN; varying float vAO; varying vec4 vReg; varying vec4 vReg2; flat varying int vRowI; flat varying int vZoneI;\n';
  // the coat. The row's texels after the bones: 0 coat (rgb, pattern) · 1 belly (rgb, amount) · 2 the pattern's dark (rgb,
  // its scale) · 3 socks (rgb, amount) · 4 muzzle (rgb, amount) · 5 mane and the tail's tip (rgb, tip amount) · 6 horn (rgb,
  // the nose's leather amount) · 7 hoof and claws (rgb, -) · 8 beak and bare legs (rgb, -) · 9 iris (rgb, pupil: 0 round
  // 1 slit 2 bar) · 10 ear tips (rgb, amount) · 11 the back's line (rgb, amount) · 12 throat and breast (rgb, amount) ·
  // 13 (the pattern's contrast, its seed, the fur's grain, the eyes forward) · 14 the face's mask (rgb, amount) · 15 wings
  // (rgb, the wing's bars) · 16 (young, the size in metres, wet, -) · 17 comb and wattle, the inside of the ear (rgb, -)
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
vec3 f3eye() {
  vec4 ir = f3T(9), X = f3T(13); vec3 d = normalize(vBindN); float sd = vZoneI == 1 ? 1.0 : -1.0;
  vec3 g = normalize(vec3(sd * (1.0 - X.w), 0.05, X.w * 1.6)); float a = dot(d, g); float aw = fwidth(a) * 1.5 + 0.004;
  vec3 c = mix(ir.rgb * 0.45, ir.rgb * 1.15, smoothstep(0.55, 0.9, a)); // (the iris fills the eye that shows, darker at its rim)
  // (the pupil: round, a slit up and down — the cats —, a bar across — the goats, the sheep, the horses)
  vec3 t1 = normalize(cross(g, vec3(0.0, 1.0, 0.0))), t2 = cross(t1, g); vec3 q = d - g * a; float u = dot(q, t1), v = dot(q, t2);
  float pr = ir.w < 0.5 ? length(vec2(u, v)) / 0.32 : ir.w < 1.5 ? length(vec2(u / 0.1, v / 0.42)) : length(vec2(u / 0.42, v / 0.13));
  c = mix(c, vec3(0.015, 0.012, 0.01), smoothstep(1.0 + aw * 6.0, 1.0 - aw * 6.0, pr) * step(0.0, a));
  c = mix(vec3(0.025, 0.02, 0.018), c, smoothstep(0.3, 0.45, a)); // (the dark round it)
  float hl = dot(d, normalize(g + vec3(-0.25 * sd, 0.45, 0.2))); f3gl = smoothstep(0.965, 0.98, hl);
  return mix(c, vec3(1.0), f3gl * 0.8);
}
vec3 f3pattern(vec3 c, vec3 p, float kind, vec3 dk, float sc, float con, float seed) {
  vec3 q = p * sc + seed;
  if (kind < 0.5) return c;
  if (kind < 1.5) { // the giraffe: patches parted by pale lines
    vec3 id; vec2 r = f3cell(q + vec3(0.0, 0.0, f3n(q * 2.0) * 0.3), id); float e = r.y - r.x; float line = f3aa(e - 0.09 - 0.04 * f3n(q * 5.0));
    vec3 pc = dk * (0.85 + 0.3 * f3h(id)); return mix(mix(c, pc, con), c * 1.08, line); }
  if (kind < 2.5) { // the zebra: stripes round the body, bending down the legs and the neck
    float w = q.z * 1.0 + q.y * 0.35 + sin(q.y * 2.2 + q.z * 0.6) * 0.35 + f3n(q * 1.5) * 0.4; float s = abs(fract(w) - 0.5) - 0.24;
    return mix(c, dk, f3aa(s) * con); }
  if (kind < 3.5) { // the tiger: broken stripes down the flanks
    float w = q.z * 1.1 + f3n(q * vec3(0.8, 2.5, 0.8)) * 1.2; float s = abs(fract(w) - 0.5) - 0.12 - 0.1 * f3n(q * 3.0) + smoothstep(0.2, 0.6, f3n(q * 1.7 + 5.0)) * 0.2;
    return mix(c, dk, f3aa(s) * con); }
  if (kind < 4.5) { // rosettes: dark rings round a darker middle
    vec3 id; vec2 r = f3cell(q, id); float ring = abs(r.x - 0.26 - 0.05 * f3n(q * 6.0)) - 0.07; float mid = r.x - 0.16;
    vec3 c2 = mix(c, c * 0.82, f3aa(mid) * 0.6); return mix(c2, dk, f3aa(ring) * con * step(0.25, f3h(id + 3.1))); }
  if (kind < 5.5) { // spots
    vec3 id; vec2 r = f3cell(q, id); return mix(c, dk, f3aa(r.x - 0.22 - 0.06 * f3h(id)) * con); }
  if (kind < 6.5) { // great patches (the cattle, the piebald)
    float n = f3n(q * 0.9) * 0.65 + f3n(q * 2.3) * 0.35; return mix(c, dk, f3aa(0.52 - n) * con); }
  if (kind < 7.5) { // the tabby: thin stripes, darker along the back
    float w = q.z * 1.4 + f3n(q * 1.6) * 0.7; float s = abs(fract(w) - 0.5) - 0.17; return mix(c, dk, f3aa(s) * con * 0.85); }
  if (kind < 8.5) { // scutes: rows of plates, darker in their joins
    vec3 g = fract(q * vec3(1.3, 1.0, 1.6)) - 0.5; float e = max(abs(g.x), abs(g.z)); return mix(c, dk, smoothstep(0.38, 0.5, e) * con); }
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
    float n = f3n(q * vec3(2.0, 9.0, 2.0)) * 0.6 + f3n(q * 7.0) * 0.4; float k = 1.0 - smoothstep(0.0, 0.03, fwidth(q.y) * 9.0); return c * (1.0 - con * 0.22 * smoothstep(0.45, 0.75, n) * k); }
  return c;
}
vec3 f3coat() {
  vec4 C = f3T(0), Be = f3T(1), Dk = f3T(2), So = f3T(3), Mz = f3T(4), Mn = f3T(5), X = f3T(13), Ey = f3T(16);
  vec3 p = vBind / max(Ey.y, 0.05);
  vec3 c = C.rgb;
  c = f3pattern(c, p, C.w, Dk.rgb, Dk.w, X.x, X.y);
  vec4 Bk = f3T(11); c = mix(c, Bk.rgb, vReg2.z * Bk.w);                                  // (the back's line)
  vec4 Th = f3T(12); c = mix(c, Th.rgb, smoothstep(0.15, 0.85, vReg2.w) * Th.w);           // (the throat and breast)
  c = mix(c, Be.rgb, smoothstep(0.12, 0.8, vReg.x) * Be.w);                               // (the belly, lighter)
  c = mix(c, Dk.rgb, smoothstep(0.1, 0.32, vReg.x) * smoothstep(0.62, 0.36, vReg.x) * Ey.z); // (the flank's dark band, where the belly begins)
  c = mix(c, So.rgb, smoothstep(0.25, 0.85, vReg.y) * So.w);                              // (the socks)
  vec4 Mk = f3T(14); c = mix(c, Mk.rgb, smoothstep(0.3, 0.9, vReg.w) * (1.0 - vReg.z) * Mk.w); // (the face)
  c = mix(c, Mz.rgb, smoothstep(0.1, 0.7, vReg.z) * Mz.w);                                // (the muzzle)
  vec4 Hn = f3T(6); c = mix(c, vec3(0.05, 0.04, 0.035), smoothstep(0.86, 0.97, vReg.z) * Hn.w); // (the nose's leather)
  vec4 Er = f3T(10); c = mix(c, Er.rgb, smoothstep(0.55, 0.95, vReg2.y) * Er.w);          // (the ear tips)
  c = mix(c, Mn.rgb, smoothstep(Ey.w, min(Ey.w + 0.22, 1.0), vReg2.x) * Mn.w);          // (the tail's tip — or all of it)
  vec3 ib = f3T(17).rgb; float inner = smoothstep(0.15, 0.4, vReg2.y) * smoothstep(0.2, 0.6, dot(normalize(vBindN), vec3(0.0, 0.0, 1.0)));
  c = mix(c, ib, inner * 0.65 * step(0.01, vReg2.y));                                   // (the inside of the ear)
  // (the fur's grain: fine strands along the body, gone before they could shimmer)
  float fk = 1.0 - smoothstep(0.004, 0.02, fwidth(vBind.z) * 40.0);
  c *= 1.0 + (f3n(vBind * vec3(60.0, 160.0, 25.0) / max(Ey.y, 0.2)) - 0.5) * 0.16 * X.z * fk;
  return c;
}
vec3 f3paint() {
  int z = vZoneI;
  if (z == 1 || z == 2) return f3eye();
  if (z == 0) return f3coat();
  if (z == 3) { vec3 h = f3T(6).rgb; return h * (0.85 + 0.25 * f3n(vBind * 90.0)); }               // horn
  if (z == 4 || z == 14) return f3T(7).rgb * (0.9 + 0.15 * f3n(vBind * 120.0));                       // hoof, claws, nails
  if (z == 6) { vec4 m = f3T(5); float k = 1.0 - smoothstep(0.0, 0.03, fwidth(vBind.x) * 60.0); return m.rgb * (0.85 + 0.3 * k * f3n(vBind * vec3(240.0, 40.0, 240.0))); } // mane, tuft
  if (z == 7) return vec3(0.9, 0.86, 0.76);                                                            // ivory
  if (z == 8) return f3T(8).rgb;                                                                       // beak, bare legs
  if (z == 9) return f3T(17).rgb;                                                                      // comb, wattle
  if (z == 10) return f3T(6).rgb * (0.8 + 0.3 * f3n(vBind * 70.0));                                    // antler
  if (z == 11 || z == 12) { vec4 w = f3T(15); vec3 c = z == 11 ? w.rgb : f3T(5).rgb; vec3 q = vBind / max(f3T(16).y, 0.05);
    if (z == 11) c = mix(c, f3T(2).rgb, smoothstep(0.62, 0.92, vReg2.x) * f3T(10).w);                  // (the wing's tips, darker)
    float bar = w.w > 0.5 ? step(0.5, fract(q.z * 6.0 + q.x * 2.0)) * 0.18 : 0.0;
    float k = 1.0 - smoothstep(0.0, 0.02, fwidth(vBind.x) * 60.0);
    return c * (1.0 - bar) * (0.9 + 0.15 * k * f3n(vBind * vec3(60.0, 30.0, 160.0))); }
  if (z == 13) { vec4 C = f3T(0); return f3pattern(C.rgb * 0.8, vBind / max(f3T(16).y, 0.05), 8.0, f3T(2).rgb, 4.0, 0.7, 0.0); } // shell
  return f3T(0).rgb;
}
`;
  function shaders() {
    const pb = '#define PB ' + PB + '\n';
    mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    mat.onBeforeCompile = sh => {
      sh.uniforms.uFauna = F3.U; sh.uniforms.uRim = F3.rim;
      sh.vertexShader = pb + SKIN + VARY + sh.vertexShader
        .replace('#include <beginnormal_vertex>', `vec3 f3P, f3N; f3skin(position, normal, f3P, f3N);
          vec3 objectNormal = f3N;
          #ifdef USE_TANGENT
          vec3 objectTangent = vec3( tangent.xyz );
          #endif
          vBind = position; vBindN = normal; vAO = aAO; vReg = aReg; vReg2 = aReg2; vRowI = int(aRow + 0.5); vZoneI = int(aZone + 0.5);`)
        .replace('#include <begin_vertex>', 'vec3 transformed = f3P;');
      sh.fragmentShader = pb + 'uniform highp sampler2D uFauna; uniform float uRim;\n' + VARY + PAINT + sh.fragmentShader
        .replace('#include <color_fragment>', '#include <color_fragment>\n  diffuseColor.rgb = f3paint(); diffuseColor.rgb *= mix(1.0, vAO, 0.7);')
        .replace('#include <opaque_fragment>', 'outgoingLight += diffuseColor.rgb * pow(1.0 - abs(dot(normal, normalize(vViewPosition))), 3.0) * uRim + vec3(0.92, 0.94, 1.0) * f3gl * 0.4;\n#include <opaque_fragment>');
    };
    mat.customProgramCacheKey = () => 'fauna3d-v2';
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
      buf = new Float32Array(TW * MAXR * 4);
      tex = new THREE.DataTexture(buf, TW, MAXR, THREE.RGBAFormat, THREE.FloatType);
      tex.minFilter = tex.magFilter = THREE.NearestFilter; tex.generateMipmaps = false; tex.needsUpdate = true;
      F3.U = { value: tex };
      shaders();
      for (const name in D.meshes) {
        const o = geometryOf(D.meshes[name]);
        const m = new THREE.Mesh(o.g, mat); m.frustumCulled = false; m.castShadow = true; m.receiveShadow = false; m.customDepthMaterial = depth; m.matrixAutoUpdate = false; m.visible = false;
        scene.add(m); MESH[name] = { mesh: m, geo: o.g, rows: o.rows, ra: o.ra, n: 0, tris: o.tris };
      }
      for (const name in D.forms) { const f = D.forms[name]; FORM[name] = { J: new Float32Array(f.bind), box: f.box, meta: f.meta }; }
      F3.dataErr = selfCheck();
      F3.ready = true; return true;
    } catch (e) { F3.failed = String((e && e.message) || e); F3.ready = false; return false; }
  };
  // (the data, once at the start: every kind of the land, the water's edge and the air has its mesh, its form and its coat — a
  // bird of the air its mesh in flight —; every mesh's indices, bones, weights and zones are sound; every form's joints are
  // where a beast's are)
  function selfCheck() {
    const out = []; const ZN = new Set(Object.values(D.zones || {}));
    for (const kind in G.Animals.DEF) { const sp = G.Animals.DEF[kind]; if (sp.cls === 'water') continue; const e = D.species[kind];
      if (!e || !MESH[e.mesh] || !FORM[e.mesh]) { out.push(`bicho ${kind}: sem malha`); continue; }
      if (sp.cls === 'air' && (!e.fly || !MESH[e.fly] || !FORM[e.fly])) out.push(`bicho ${kind}: ave do ar sem a malha do voo`);
      if (!G.FaunaAnim.paint(kind)) out.push(`bicho ${kind}: sem pelagem (FaunaAnim PAINT)`); }
    for (const name in D.meshes) { const m = D.meshes[name]; const idx = new Uint16Array(bytes(m.idx).buffer), bi = bytes(m.bi), bw = bytes(m.bw), zn = bytes(m.zone);
      for (let i = 0; i < idx.length; i++) if (idx[i] >= m.n) { out.push(`malha ${name}: índice ${idx[i]} além dos ${m.n} pontos`); break; }
      for (let i = 0; i < m.n; i++) { if (bw[i * 4] + bw[i * 4 + 1] + bw[i * 4 + 2] + bw[i * 4 + 3] !== 255) { out.push(`malha ${name}: ponto ${i} com pesos que não somam 1`); break; }
        if (bi[i * 4] >= NB || bi[i * 4 + 1] >= NB || bi[i * 4 + 2] >= NB || bi[i * 4 + 3] >= NB) { out.push(`malha ${name}: ponto ${i} num osso que não existe`); break; }
        if (!ZN.has(zn[i])) { out.push(`malha ${name}: ponto ${i} numa zona desconhecida (${zn[i]})`); break; } }
      if (!/_1$/.test(name) && !FORM[name]) out.push(`malha ${name}: sem forma (as juntas)`); }
    for (const name in FORM) { const f = FORM[name]; if (f.J.length !== NB * 3 || !f.J.every(Number.isFinite)) { out.push(`forma ${name}: juntas inválidas`); continue; }
      if (f.meta.fam === 'quad') { const H = f.meta.H; for (const b of ['flL3', 'flR3', 'hlL3', 'hlR3']) { const y = f.J[G.FaunaAnim.B[b] * 3 + 1]; if (!(y >= -0.01 && y < H * 0.2)) out.push(`forma ${name}: o pé ${b} longe do chão (${y.toFixed(3)} m)`); } } }
    return out;
  }
  F3.dataErr = [];
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
  F3.begin = function () { for (const k in MESH) MESH[k].n = 0; F3.rows = 0; };
  // a beast in row `row`: R its bones' frames in the world (G.FaunaAnim), its kind, its coat (G.FaunaAnim.coat), its level of
  // detail (0 near, 1 far)
  F3.put = function (row, R, kind, coat, lod, X, Y, Z, fly) {
    const s = D.species[kind]; const mn = fly && s.fly ? s.fly : s.mesh; const f = FORM[mn]; const J = f.J; const o = row * TW * 4;
    for (let b = 0; b < NB; b++) {
      const e = R[b].elements; const j = o + b * 12; const x = J[b * 3], y = J[b * 3 + 1], z = J[b * 3 + 2];
      // (the bind is the bones' joints with no turn: its inverse a translation — the skin is the frame moved back to the joint)
      buf[j] = e[0]; buf[j + 1] = e[4]; buf[j + 2] = e[8]; buf[j + 3] = e[12] - (e[0] * x + e[4] * y + e[8] * z);
      buf[j + 4] = e[1]; buf[j + 5] = e[5]; buf[j + 6] = e[9]; buf[j + 7] = e[13] - (e[1] * x + e[5] * y + e[9] * z);
      buf[j + 8] = e[2]; buf[j + 9] = e[6]; buf[j + 10] = e[10]; buf[j + 11] = e[14] - (e[2] * x + e[6] * y + e[10] * z);
    }
    const p = o + PB * 4; const C = coat;
    for (let k = 0; k < NP; k++) { const c = C[k]; const j = p + k * 4; buf[j] = c[0]; buf[j + 1] = c[1]; buf[j + 2] = c[2]; buf[j + 3] = c[3]; }
    const e0 = R[0].elements; AT[row] = [X, Y, Z, F3.sizeOf(kind), e0[12], e0[13], e0[14]];
    const name = F3.lod && lod > 0 && MESH[mn + '_1'] ? mn + '_1' : mn;
    const M = MESH[name]; if (M && M.n < MAXR) M.rows[M.n++] = row;
    if (row + 1 > F3.rows) F3.rows = row + 1;
  };
  F3.end = function () {
    let calls = 0, tris = 0;
    for (const k in MESH) { const M = MESH[k]; M.geo.instanceCount = M.n; M.mesh.visible = M.n > 0; if (M.n) { M.ra.needsUpdate = true; calls++; tris += M.n * M.tris; } }
    if (F3.rows) tex.needsUpdate = true;
    F3.calls = calls; F3.tris = tris;
  };
  F3.clear = function () { for (const k in MESH) { MESH[k].n = 0; MESH[k].geo.instanceCount = 0; MESH[k].mesh.visible = false; } F3.rows = 0; };
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
