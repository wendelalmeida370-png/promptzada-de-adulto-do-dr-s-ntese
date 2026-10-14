'use strict';
// ============================================================
//  Body3D: the people's bodies as one continuous skin — the
//  meshes of js/bodymesh.js (made by arte/corpo.py) bent on the
//  graphics card by the bones People3D's rig computes (pelvis,
//  trunk, head, arms, hands, legs, feet: P3.rig, the same frames
//  P3.body always made). Every person drawn is one row of a
//  texture of numbers: their bones' matrices, then the colours
//  and the measures of their clothes and face (P3.look). One
//  draw call a mesh for the whole crowd: a mesh is told which
//  rows wear it (a hairstyle, a dress). The paint of the body —
//  the tunic, the sleeves, the trousers, the boots, the belt,
//  the brows, the lips, the eyes that look and blink — is made
//  in the shader from the point's place on the body as it was
//  modelled, so it stays where it belongs whatever the pose.
//  Only seen: nothing here is saved, nothing changes the world.
//  If it cannot start (no data, a shader refused), People3D
//  keeps drawing its old pieces.
// ============================================================
(function (G) {
  const B3 = G.Body3D = { ready: false, failed: null, rows: 0, calls: 0, lod: true }; // (lod: the far ones in the lighter bodies — off only to measure)
  let THREE = null, scene = null;
  const MAXR = 96; // (rows: People3D's MAX — the bodies drawn whole, the living and the dead)
  let D = null, NB = 0, PB = 0, TW = 0, buf = null, tex = null, mat = null, depth = null, TU = null, JIDX = null;
  B3.rim = { value: 0.2 }; // (the edge light's strength: People3D sets it from the sky of the hour)
  const MESH = {}; // name → { mesh, geo, rows (Float32Array), n }
  let inv = null; // the bones' inverse bind matrices (the rig in its bind pose, inverted)
  const NP = 40; // texels of params and colours a row (20), then the cloth's state and the joints it is kept off (20)
  B3.MAXR = MAXR;
  // (the joints a cape and a skirt are kept off, in the order of their texels from 22: the hips and the neck — the trunk's
  // axis —, the chest's side and front axes, then shoulder, elbow, wrist of each arm, hip, knee, ankle of each leg)
  const JOINTS = ['pel', 'head', null, null, 'shL', 'faL', 'hdL', 'shR', 'faR', 'hdR', 'thL', 'snL', 'ftL', 'thR', 'snR', 'ftR'];
  // (and, at 38 and 39, the shoulder caps' middles — the deltoids, which turn with the arms under a cloak's yoke)
  const CAP = [0.016, -0.05, 0];

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
    const ib = bytes(m.idx); g.setIndex(new THREE.BufferAttribute(m.i32 ? new Uint32Array(ib.buffer) : new Uint16Array(ib.buffer), 1));
    const rows = new Float32Array(MAXR); const ra = new THREE.InstancedBufferAttribute(rows, 1); ra.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('aRow', ra); g.instanceCount = 0;
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);
    return { g, rows, ra, tris: m.tris };
  }

  // ------------------------------ the shaders ------------------------------
  // (the skin: the point moved by its four bones, each a 3×4 matrix of three texels in its person's row)
  const SKIN = `
uniform highp sampler2D uBody;
attribute vec4 aBone; attribute vec4 aWt; attribute float aRow; attribute float aZone; attribute float aAO;
void b3skin(in vec3 p, in vec3 n, out vec3 P, out vec3 N) {
  int row = int(aRow + 0.5); vec4 r0 = vec4(0.0), r1 = vec4(0.0), r2 = vec4(0.0);
  for (int i = 0; i < 4; i++) { float w = aWt[i]; if (w > 0.0) { int b = int(aBone[i] + 0.5) * 3;
    r0 += w * texelFetch(uBody, ivec2(b, row), 0); r1 += w * texelFetch(uBody, ivec2(b + 1, row), 0); r2 += w * texelFetch(uBody, ivec2(b + 2, row), 0); } }
  vec4 q = vec4(p, 1.0); P = vec3(dot(r0, q), dot(r1, q), dot(r2, q)); N = vec3(dot(r0.xyz, n), dot(r1.xyz, n), dot(r2.xyz, n));
}
`;
  // the cloth's own motion and its collisions (a cape, a skirt), after the skin, in the world: its free part (from under the
  // yoke, from the hips) lags the hips' rise and fall at each step, ripples down its length as it goes through the air,
  // leans and flutters in the world's wind; then it is kept off the body — the trunk, the arms, the hands, the legs — and
  // above the ground. The row's texels 20 (the lag of the steps, the speed, its own clock, -) and 21 (the ground, the size,
  // on the ground?, -), then the joints (JOINTS) from 22
  const CLOTH = `
uniform float uTime; uniform vec3 uWind;
vec4 b3V(int k) { return texelFetch(uBody, ivec2(PB + k, int(aRow + 0.5)), 0); }
vec3 b3off(vec3 P, vec3 a, vec3 b, float r) {
  vec3 ab = b - a; float t = clamp(dot(P - a, ab) / max(dot(ab, ab), 1e-8), 0.0, 1.0); vec3 d = P - (a + ab * t); float l = length(d);
  return l < r && l > 1e-5 ? P + d * ((r - l) / l) : P;
}
vec3 b3cloth(vec3 P, vec3 p) {
  int z = int(aZone + 0.5); bool cape = z == 7; if (!cape && z != 5 && z != 6) return P;
  vec4 m = b3V(20), gs = b3V(21); float s = gs.y;
  vec3 pel = b3V(22).xyz, nk = b3V(23).xyz, ex = b3V(24).xyz, ez = b3V(25).xyz;
  vec3 up = normalize(nk - pel); float L = dot(nk - pel, up);
  // (how free the point is: 0 where it is held — the yoke, the waist —, 1 at the hem)
  float w = cape ? clamp((1.40 - p.y) / 0.85, 0.0, 1.0) : clamp((0.98 - p.y) / 0.85, 0.0, 1.0); w = w * w * (3.0 - 2.0 * w);
  float t = uTime + m.z, sp = min(m.y, 6.0);
  vec3 rd = P - pel - up * clamp(dot(P - pel, up), 0.0, L); rd = length(rd) > 1e-4 ? normalize(rd) : -ez;
  P += up * (m.x * w * (cape ? 1.0 : 0.5));
  P += rd * (sin(t * (4.2 + sp * 1.6) - p.y * 11.0 + p.x * 7.0) * (0.004 + 0.005 * sp) * w * (cape ? 1.0 : 0.35) * s);
  vec3 Wd = vec3(uWind.x, 0.0, uWind.y);
  P += Wd * ((cape ? 0.022 : 0.008) + 0.012 * uWind.z) * w * (0.75 + 0.25 * sin(t * (1.3 + uWind.z * 0.8) + p.y * 4.0 + p.x * 5.0)) * s;
  P += rd * (sin(t * (5.0 + uWind.z * 2.0) + p.x * 17.0 - p.y * 11.0) * 0.006 * uWind.z * w * (cape ? 1.0 : 0.4) * s);
  if (cape) {
    // (the arms: the shoulder caps, the upper arm from a little under the shoulder — the yoke is made for the shoulder as it
    // hangs —, the forearm, the hand)
    vec3 sL = b3V(26).xyz, eL = b3V(27).xyz, wL = b3V(28).xyz, sR = b3V(29).xyz, eR = b3V(30).xyz, wR = b3V(31).xyz;
    P = b3off(P, b3V(38).xyz, b3V(38).xyz, 0.078 * s); P = b3off(P, b3V(39).xyz, b3V(39).xyz, 0.078 * s);
    P = b3off(P, mix(sL, eL, 0.15), eL, 0.072 * s); P = b3off(P, eL, wL, 0.056 * s); P = b3off(P, wL, wL + (wL - eL) * 0.62, 0.052 * s);
    P = b3off(P, mix(sR, eR, 0.15), eR, 0.072 * s); P = b3off(P, eR, wR, 0.056 * s); P = b3off(P, wR, wR + (wR - eR) * 0.62, 0.052 * s);
    // (then the trunk, last — nothing pushes the cloth into it: an elliptic cylinder round the hips-to-neck axis, a little
    // inside the cloth's place at rest; not the yoke, which lies on the shoulders as it was made)
    float h = dot(P - pel, up); vec3 q = P - pel - up * clamp(h, 0.0, L); float qx = dot(q, ex), qz = dot(q, ez);
    float u = clamp(h / L, 0.0, 1.0); float rx = mix(0.17, 0.2, u) * s, rz = mix(0.135, 0.122, u) * s;
    float kk = clamp((1.40 - p.y) / 0.1, 0.0, 1.0);
    vec2 qa = abs(vec2(qx / rx, qz / rz)); float k = pow(qa.x * qa.x * qa.x + qa.y * qa.y * qa.y, 1.0 / 3.0); // (a back fuller at its corners: the shoulder blades)
    if (k < 1.0 && k > 1e-4) P += (ex * qx + ez * qz) * ((1.0 / k - 1.0) * kk);
    // (the legs, from a little under the hips)
    float lr = (1.0 - smoothstep(0.82, 0.97, p.y)) * s;
    P = b3off(P, b3V(32).xyz, b3V(33).xyz, 0.092 * lr); P = b3off(P, b3V(33).xyz, b3V(34).xyz, 0.07 * lr);
    P = b3off(P, b3V(35).xyz, b3V(36).xyz, 0.092 * lr); P = b3off(P, b3V(36).xyz, b3V(37).xyz, 0.07 * lr);
  } else {
    // (a skirt: its waist kept off the belly as the trunk bows over it, a little inside where it sits at rest; the thighs
    // from a tenth of their length — standing they never reach the waist, raised they carry the cloth over them)
    if (p.y > 0.86) { float h = dot(P - pel, up); vec3 q = P - pel - up * clamp(h, 0.0, L); float qx = dot(q, ex), qz = dot(q, ez);
      float k = length(vec2(qx / (0.155 * s), qz / (0.112 * s))); if (k < 1.0 && k > 1e-4) P += (ex * qx + ez * qz) * (1.0 / k - 1.0); }
    vec3 hL = b3V(32).xyz, kL = b3V(33).xyz, hR = b3V(35).xyz, kR = b3V(36).xyz;
    P = b3off(P, mix(hL, kL, 0.1), kL, 0.09 * s); P = b3off(P, kL, b3V(34).xyz, 0.068 * s);
    P = b3off(P, mix(hR, kR, 0.1), kR, 0.09 * s); P = b3off(P, kR, b3V(37).xyz, 0.068 * s);
  }
  if (gs.z > 0.5) P.y = max(P.y, gs.x + 0.012 * s);
  return P;
}
`;
  const VARY = 'varying vec3 vBind; varying vec3 vBindN; varying float vAO; flat varying int vRowI; flat varying int vZoneI;\n';
  // the paint of a body: from where the point is on the body as modelled (vBind) — the eyes from their own normal.
  // The row's texels after the bones: 0 face (shut, gaze x, gaze y, mouth open) · 1 mood (smile, brows up, brows in, blush)
  // · 2 cut (sleeve end down the arm, neckline, boot top, legs: 0 bare 1 trousers 2 wrapped) · 3 cut (belt height, belt
  // half-width, over: 0 none 1 the northern apron-dress 2 an apron, strap) · 4 skin · 5 cloth · 6 trim · 7 trousers ·
  // 8 boots · 9 belt · 10 hair · 11 iris · 12 lips · 13 over · 14 metal · 15 style (torso: 0 dressed 1 bare 2 bare with a
  // collar; trim motif; feet: 0 shoes 1 bare 2 sandals; stubble) · 16 hat · 17 cloak · 18 beads · 19 (hem trim, cloak trim, the collar: 0 cloth 1 fur 2 white fur, -) · 20, 21 and the joints: the cloth (CLOTH)
  const PAINT = `
vec4 b3T(int k) { return texelFetch(uBody, ivec2(PB + k, vRowI), 0); }
float b3aa(float d) { float w = fwidth(d) * 0.8 + 1e-5; return clamp(0.5 - d / w, 0.0, 1.0); }
// (cloth: a fine weave that fades before it can shimmer)
float b3weave(vec3 p) { float f = fwidth(p.y) + fwidth(p.x); float k = 1.0 - smoothstep(0.0008, 0.0025, f); return 1.0 + (sin(p.x * 1400.0 + p.z * 600.0) * sin(p.y * 1400.0)) * 0.035 * k; }
// (a woven band: diamonds of a lighter thread along it — u along the band, v across, 0..1)
vec3 b3band(vec3 c, float u, float v, float motif) { if (motif < 0.5) return c; float d = abs(fract(u) - 0.5) * 2.0 + abs(v - 0.5) * 2.0; return mix(c, mix(c, vec3(0.95, 0.88, 0.62), 0.6), smoothstep(0.62, 0.52, d) * step(0.25, v) * step(v, 0.75) + 0.0); }
vec3 b3eye(vec3 skin) {
  vec4 f = b3T(0); vec3 d = normalize(vBindN);
  vec3 g = normalize(vec3(f.y, f.z, 1.0)); float a = dot(d, g);
  float aw = fwidth(a) * 1.5 + 0.004;
  vec3 iris = b3T(11).rgb;
  vec3 c = mix(vec3(0.9, 0.88, 0.84), vec3(0.74, 0.7, 0.66), smoothstep(0.3, -0.5, d.y));
  float ir = smoothstep(0.80 - aw, 0.80 + aw, a);
  vec3 ic = mix(iris * 0.5, iris * 1.2, smoothstep(0.83, 0.94, a));
  c = mix(c, ic, ir); c = mix(c, vec3(0.025, 0.02, 0.02), smoothstep(0.952 - aw, 0.952 + aw, a));
  float hl = dot(d, normalize(g + vec3(-0.24, 0.32, 0.0))); c = mix(c, vec3(1.0), smoothstep(0.985, 0.99, hl) * 0.9);
  // (the lids: the upper one comes down with the blink, its edge a dark line of lashes)
  float up = mix(0.5, -0.8, f.x), lo = -0.62 + f.x * 0.3; float e = fwidth(d.y) + 0.01;
  float lid = max(smoothstep(up - e, up + e, d.y), smoothstep(lo + e, lo - e, d.y));
  vec3 lidc = skin * 0.84; float lash = smoothstep(up - 0.16 - e, up - 0.03, d.y);
  c = mix(c, vec3(0.07, 0.05, 0.04), lash * (1.0 - lid) * 0.9);
  return mix(c, lidc, lid);
}
// the face: brows, lips, the mouth (open, smiling), the cheeks
vec3 b3face(vec3 p, vec3 skin) {
  vec3 c = skin; vec4 m = b3T(1); vec3 hair = b3T(10).rgb; float ax = abs(p.x);
  if (p.z > 0.06) {
    // (the brows: an arc over each eye, thick at the inner end; raised in fear, drawn in and down in anger)
    float u = clamp((ax - 0.016) / 0.052, 0.0, 1.0);
    float yc = 1.733 + 0.0045 * sin(u * 3.1416) + m.y * 0.006 + u * 0.0015 - m.z * 0.007 * (1.0 - u) + m.y * 0.004 * (1.0 - u);
    float th = mix(0.0052, 0.0028, u);
    float br = b3aa(abs(p.y - yc) - th) * smoothstep(0.013, 0.017, ax) * smoothstep(0.072, 0.066, ax);
    c = mix(c, hair * 0.75, br * 0.92);
    // (the lips and the mouth)
    float mx = ax / 0.0262;
    if (mx < 1.25 && p.y > 1.59 && p.y < 1.64) {
      float cy = 1.6145 + m.x * 0.0045 * mx * mx; float open = b3T(0).w * 0.009 * max(0.0, 1.0 - mx * mx);
      float up = 0.0078 * (1.0 - mx * mx * 0.75), dn = 0.0092 * (1.0 - mx * mx * 0.85);
      vec3 lips = b3T(12).rgb;
      float lu = b3aa(p.y - (cy + up)) * b3aa(cy + open * 0.5 - p.y), ld = b3aa((cy - open * 0.5) - p.y) * b3aa(p.y - (cy - dn));
      float lip = max(lu * 0.9, ld) * b3aa(mx - 1.0);
      c = mix(c, lips, lip * 0.85);
      float line = b3aa(abs(p.y - cy) - (0.0007 + open * 0.5)) * b3aa(mx - 1.04);
      c = mix(c, mix(lips * 0.35, vec3(0.12, 0.04, 0.04), step(0.001, open)), line * 0.9);
    }
    // (a blush on the cheeks)
    float ch = length(vec2(ax - 0.054, p.y - 1.652)) / 0.022; c = mix(c, c * vec3(1.06, 0.86, 0.84), (1.0 - smoothstep(0.3, 1.0, ch)) * m.w);
  }
  return c;
}
// the pieces worn over the body: hair in locks, a beard, a skirt with its hem's band (an apron over it, or the northern
// apron-dress), a cape with its band, a hat of wool, straw, iron, a hood, a scarf, a crown
vec3 b3piece(vec3 p) {
  int z = vZoneI; float ang = atan(p.x, p.z + 0.015);
  if (z == 3 || z == 4) {
    vec3 h = b3T(10).rgb; float st = sin(ang * (z == 3 ? 46.0 : 30.0) + p.y * 30.0 + sin(ang * 7.0) * 2.0) * 0.5 + 0.5;
    float k = 1.0 - smoothstep(0.0, 0.02, fwidth(ang) * 46.0);
    return h * mix(1.0, 0.8 + 0.32 * st, k) * (z == 4 ? 0.92 : 1.0);
  }
  if (z == 5 || z == 6) {
    vec4 Bc = b3T(3); vec3 c = Bc.z > 0.5 && Bc.z < 1.5 ? b3T(13).rgb : b3T(5).rgb; c *= b3weave(p);
    if (Bc.z > 1.5 && p.z > 0.0 && abs(p.x) < 0.14) c = b3T(13).rgb * b3weave(p.zyx); // (the apron in front)
    float hy = z == 5 ? B3_HEMC : B3_HEML; float hb = (p.y - hy) / 0.03;
    if (b3T(19).x > 0.5 && hb < 1.0) c = b3band(b3T(6).rgb, ang * 9.0, clamp(hb, 0.0, 1.0), b3T(15).y);
    return c;
  }
  if (z == 7 || z == 11) {
    vec3 c = b3T(17).rgb * b3weave(p.yxz);
    if (z == 7) {
      // (the hem's band follows the hem: higher at the sides than at the back)
      float th = atan(p.x, -(p.z + 0.035)); float hy = B3_HEMK + 0.035 * (th / 1.4) * (th / 1.4);
      if (b3T(19).y > 0.5 && p.y < hy + 0.04) c = b3band(b3T(6).rgb, th * 9.0, clamp((p.y - hy) / 0.04, 0.0, 1.0), b3T(15).y);
    }
    return c;
  }
  if (z == 14) {
    // the collar: a roll of fur on a northern cloak — locks of a lighter and a darker hair, white for a ruler — or of the
    // cloak's own cloth
    float fk = b3T(19).z; if (fk < 0.5) return b3T(17).rgb * b3weave(p.yxz) * 0.94;
    vec3 fur = fk > 1.5 ? vec3(0.74, 0.7, 0.64) : vec3(0.3, 0.22, 0.15);
    float a = atan(p.x, -(p.z + 0.012)); float st = sin(a * 70.0 + sin(p.y * 160.0 + a * 9.0) * 2.0) * 0.5 + 0.5;
    float k = 1.0 - smoothstep(0.0, 0.03, fwidth(a) * 70.0);
    return fur * mix(1.0, 0.72 + 0.5 * st, k);
  }
  if (z == 8 || z == 13) { vec3 m = z == 13 ? b3T(14).rgb : b3T(16).rgb; float rv = step(0.5, fract(ang * 2.546)) * 0.0; return m * (0.92 + 0.12 * sin(ang * 4.0 + p.y * 30.0)) + rv; }
  if (z == 10) { float w = step(0.5, fract(ang * 16.0 + p.y * 45.0)) * 0.5 + step(0.5, fract(ang * 16.0 - p.y * 45.0)) * 0.5; float k = 1.0 - smoothstep(0.0, 0.03, fwidth(ang) * 16.0); return b3T(16).rgb * mix(1.0, 0.82 + 0.3 * w, k); }
  return b3T(16).rgb * b3weave(p);
}
vec3 b3paint() {
  vec3 p = vBind; vec3 skin = b3T(4).rgb;
  if (vZoneI == 1 || vZoneI == 2) return b3eye(skin);
  if (vZoneI >= 3) return b3piece(p);
  vec4 A = b3T(2), Bc = b3T(3), St = b3T(15);
  vec3 cloth = b3T(5).rgb * b3weave(p), trim = b3T(6).rgb;
  float sd = p.x < 0.0 ? -1.0 : 1.0;
  // the neckline: low in front, at the base of the neck behind
  // (the head and the neck: above the neckline, within the neck — the shoulders round it are the tunic's)
  float neckY = 1.486 - (0.03 + A.y) * smoothstep(0.0, 0.07, p.z); float rn = length(vec2(p.x, p.z + 0.008));
  if (p.y > 1.565 || (p.y > neckY && rn < 0.07 + A.y * 0.9)) return b3face(p, skin);
  // the arms, as modelled (open from the body by the bind's roll): how far down the arm, how far from its axis
  vec3 S = vec3(sd * 0.235, 1.44, 0.0); vec3 Dd = vec3(sd * B3_SR, -B3_CR, 0.0);
  vec3 ap = p - S; float t = dot(ap, Dd); float rad = length(ap - Dd * t);
  bool bare = St.x > 0.5;
  if (t > 0.03 && rad < 0.11) {
    if (t > 0.585 || t > A.x) return skin;
    if (bare) return skin;
    vec3 c = cloth; float tb = (A.x - t) / 0.022;
    if (tb < 1.0 && A.x < 0.58) c = b3band(trim, atan(ap.z, dot(ap, vec3(sd * B3_CR, B3_SR, 0.0))) * 1.9, tb, St.y);
    return c;
  }
  // the trunk: above the belt the tunic (or the bare chest), the belt, below it the trousers
  float bY = Bc.x, bH = Bc.y;
  if (p.y > 0.79) {
    vec3 c = cloth;
    if (bare) { c = skin; if (St.x > 1.5) { float cr = length(vec2(p.x, (p.y - 1.47) * 1.25)); if (p.z > 0.0 && cr < 0.135 && cr > 0.055) c = mix(trim, b3T(14).rgb, step(0.5, fract(cr * 38.0))); } }
    // (the neckline's band)
    float nb = max((neckY - p.y) / 0.016, (rn - 0.07 - A.y * 0.9) / 0.016); if (!bare && p.y > neckY - 0.016 && rn < 0.086 + A.y * 0.9 && nb < 1.0) c = b3band(trim, atan(p.x, p.z) * 4.0, clamp(nb, 0.0, 1.0), St.y);
    if (Bc.z > 0.5 && Bc.z < 1.5 && p.y < 1.385 && abs(p.x) < 0.2) {
      // the northern apron-dress: front and back panels from under the arms, straps over the shoulders, two oval brooches
      // at the top of the straps and a string of beads between them
      vec3 ov = b3T(13).rgb * b3weave(p.zyx);
      c = ov;
    }
    if (Bc.z > 0.5 && Bc.z < 1.5 && p.y > 1.3 && abs(abs(p.x) - 0.095) < 0.016) c = b3T(13).rgb * 0.9;
    if (Bc.z > 0.5 && Bc.z < 1.5 && p.z > 0.04) {
      float bro = length(vec2((abs(p.x) - 0.088) / 0.02, (p.y - 1.375) / 0.028));
      if (bro < 1.0) { vec3 mt = b3T(14).rgb; c = mix(mt * 0.55, mt * 1.15, smoothstep(1.0, 0.2, bro)) * (0.85 + 0.15 * step(0.5, fract(bro * 3.0))); }
      float by = 1.355 - 0.045 * (1.0 - (p.x / 0.088) * (p.x / 0.088));
      float bd = length(vec2((fract(p.x / 0.011) - 0.5) * 0.011, p.y - by));
      if (abs(p.x) < 0.075 && bd < 0.0042) { float k = floor(p.x / 0.011); vec3 bc = mod(k, 3.0) < 1.0 ? b3T(18).rgb : mod(k, 3.0) < 2.0 ? vec3(0.2, 0.35, 0.6) : vec3(0.85, 0.8, 0.7); c = bc * (0.8 + 0.4 * smoothstep(0.0042, 0.0, bd)); }
    }
    if (Bc.z > 1.5 && p.z > 0.0 && abs(p.x) < 0.13 && p.y < 1.33) c = b3T(13).rgb * b3weave(p.zyx); // (an apron)
    // (a strap across the chest, left shoulder to right hip, for the bag)
    if (Bc.w > 0.5) { float sdst = abs(dot(vec2(p.x - 0.12, p.y - 1.43), normalize(vec2(0.44, 0.27)))); if (sdst < 0.016) c = b3T(9).rgb * 0.92; }
    float bl = abs(p.y - bY) - bH;
    if (bl < 0.0) { c = b3T(9).rgb; if (p.z > 0.06 && abs(p.x) < 0.016 + 0.0 && abs(p.y - bY) < bH * 0.85) c = b3T(14).rgb; }
    if (p.y < bY - bH) c = b3T(7).rgb * b3weave(p);
    return c;
  }
  // the legs: trousers (wrapped below the knee in the north) down to the boots; the feet: shoes, sandals or bare
  vec3 c = A.w > 0.5 ? b3T(7).rgb * b3weave(p) : skin;
  if (A.w > 1.5 && p.y < 0.43 && p.y > A.z) { float lx = p.x - sd * 0.095; float ang = atan(p.z, lx); float w = fract(p.y * 34.0 + ang * 0.42); c = mix(trim * 0.85, trim * 1.1, step(0.5, w)) * (0.86 + 0.14 * smoothstep(0.0, 0.18, abs(w - 0.5))); }
  if (p.y < A.z) {
    vec3 bt = b3T(8).rgb; c = bt;
    if (A.z > 0.12 && A.z - p.y < 0.018) c = bt * 1.18; // (the boot's cuff)
  }
  if (p.y < 0.095) {
    if (St.z > 1.5) { c = skin; float sl = step(p.y, 0.012) + step(abs(p.y - 0.045), 0.006) + step(abs(p.y - 0.085), 0.006); c = mix(c, b3T(8).rgb, clamp(sl, 0.0, 1.0)); }
    else if (St.z > 0.5) c = skin;
    else c = b3T(8).rgb;
    if (p.y < 0.008 && St.z < 0.5) c *= 0.55; // (the sole)
  }
  return c;
}
`;
  function shaders() {
    const hem = D.hem || { saiaC: 0.5, saiaL: 0.12, cape: 0.55 };
    const pb = '#define PB ' + PB + '\n#define B3_SR ' + Math.sin(D.roll).toFixed(6) + '\n#define B3_CR ' + Math.cos(D.roll).toFixed(6) + '\n#define B3_HEMC ' + hem.saiaC.toFixed(4) + '\n#define B3_HEML ' + hem.saiaL.toFixed(4) + '\n#define B3_HEMK ' + hem.cape.toFixed(4) + '\n';
    mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    mat.onBeforeCompile = sh => {
      sh.uniforms.uBody = B3.U; sh.uniforms.uTime = TU.time; sh.uniforms.uWind = TU.wind; sh.uniforms.uRim = B3.rim;
      sh.vertexShader = pb + SKIN + CLOTH + VARY + sh.vertexShader
        .replace('#include <beginnormal_vertex>', `vec3 b3P, b3N; b3skin(position, normal, b3P, b3N);
          vec3 objectNormal = b3N;
          #ifdef USE_TANGENT
          vec3 objectTangent = vec3( tangent.xyz );
          #endif
          vBind = position; vBindN = normal; vAO = aAO; vRowI = int(aRow + 0.5); vZoneI = int(aZone + 0.5);`)
        .replace('#include <begin_vertex>', 'vec3 transformed = b3cloth(b3P, position);');
      sh.fragmentShader = pb + 'uniform highp sampler2D uBody; uniform float uRim;\n' + VARY + PAINT + sh.fragmentShader
        .replace('#include <color_fragment>', '#include <color_fragment>\n  diffuseColor.rgb = b3paint() * mix(1.0, vAO, 0.75);')
        // (a soft light on the edges, as the old figures had: the people read against the ground — as bright as the sky of
        // the hour: at night it does not glow)
        .replace('#include <opaque_fragment>', 'outgoingLight += diffuseColor.rgb * pow(1.0 - abs(dot(normal, normalize(vViewPosition))), 3.0) * uRim;\n#include <opaque_fragment>');
    };
    mat.customProgramCacheKey = () => 'body3d-v2';
    depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
    depth.onBeforeCompile = sh => {
      sh.uniforms.uBody = B3.U; sh.uniforms.uTime = TU.time; sh.uniforms.uWind = TU.wind;
      sh.vertexShader = pb + SKIN + CLOTH + sh.vertexShader.replace('#include <begin_vertex>', 'vec3 b3P, b3N; b3skin(position, vec3(0.0, 1.0, 0.0), b3P, b3N); vec3 transformed = b3cloth(b3P, position);');
    };
    depth.customProgramCacheKey = () => 'body3d-depth-v2';
  }

  // ------------------------------ starting ------------------------------
  B3.init = function (three, realm) {
    THREE = three; scene = realm.scene();
    try {
      D = G.BODYMESH; if (!D || !D.meshes || !D.meshes.corpoM) throw new Error('sem malhas (js/bodymesh.js)');
      NB = D.bones.length; PB = NB * 3; TW = PB + NP;
      TU = realm.U && realm.U.time && realm.U.wind ? realm.U : { time: { value: 0 }, wind: { value: new THREE.Vector3() } }; // (the view's clock and the world's wind)
      JIDX = JOINTS.map(n => (n ? D.bones.indexOf(n) : -1)); B3.CHEST = D.bones.indexOf('chest');
      buf = new Float32Array(TW * MAXR * 4);
      tex = new THREE.DataTexture(buf, TW, MAXR, THREE.RGBAFormat, THREE.FloatType);
      tex.minFilter = tex.magFilter = THREE.NearestFilter; tex.generateMipmaps = false; tex.needsUpdate = true;
      B3.U = { value: tex };
      shaders();
      for (const name in D.meshes) {
        const o = geometryOf(D.meshes[name]);
        const m = new THREE.Mesh(o.g, mat); m.frustumCulled = false; m.castShadow = true; m.customDepthMaterial = depth; m.matrixAutoUpdate = false; m.visible = false;
        scene.add(m); MESH[name] = { mesh: m, geo: o.g, rows: o.rows, ra: o.ra, n: 0, tris: o.tris };
      }
      bind();
      B3.ready = true; return true;
    } catch (e) { B3.failed = String((e && e.message) || e); B3.ready = false; return false; }
  };
  // the bind: the rig in the pose the meshes were modelled in; its frames inverted turn a modelled point into one of the bone
  function bind() {
    const P3 = G.People3D; const pose = Object.assign(G.Anim3D.POSE0(), { elL: 0, elR: 0, knL: 0, knR: 0, shLr: D.roll - 0.05, shRr: -(D.roll - 0.05) });
    const R = P3.rig(0, 0, 0, Math.PI / 2, pose, { s: 1, bind: true });
    inv = R.map(m => m.clone().invert());
    // (the rig and the meshes must agree on where every joint is: a mismatch is a mesh made for another rig)
    B3.bindErr = 0; const v = new THREE.Vector3();
    for (const k in D.bind) { const i = D.bones.indexOf(k); if (i < 0) continue; v.setFromMatrixPosition(R[i]); B3.bindErr = Math.max(B3.bindErr, Math.hypot(v.x - D.bind[k][0], v.y - D.bind[k][1], v.z - D.bind[k][2])); }
    if (B3.bindErr > 0.002) throw new Error('o rig e as malhas discordam (' + B3.bindErr.toFixed(4) + ' m)');
  }
  B3.bones = () => (D ? D.bones : null);

  // ------------------------------ a frame ------------------------------
  const K = { m: null, c: null };
  B3.begin = function () { for (const k in MESH) MESH[k].n = 0; B3.rows = 0; };
  // a person in row `row`: R the rig's frames (world), pose and look; which meshes they wear
  const AT = []; // (where each row's person stands, for the verifier: X, Y, Z, size)
  B3.put = function (row, R, pose, L, X, Y, Z) {
    if (!K.m) { K.m = new THREE.Matrix4(); K.c = new THREE.Color(); }
    AT[row] = [X, Y, Z, L.s || 1, R[0].elements[12], R[0].elements[13], R[0].elements[14]];
    const o = row * TW * 4;
    for (let b = 0; b < NB; b++) {
      const e = K.m.multiplyMatrices(R[b], inv[b]).elements; const j = o + b * 12;
      buf[j] = e[0]; buf[j + 1] = e[4]; buf[j + 2] = e[8]; buf[j + 3] = e[12];
      buf[j + 4] = e[1]; buf[j + 5] = e[5]; buf[j + 6] = e[9]; buf[j + 7] = e[13];
      buf[j + 8] = e[2]; buf[j + 9] = e[6]; buf[j + 10] = e[10]; buf[j + 11] = e[14];
    }
    const p = o + PB * 4;
    const f = L.face || {}, u = L.out || DEF;
    const set = (k, a, b, c, d) => { const j = p + k * 4; buf[j] = a; buf[j + 1] = b; buf[j + 2] = c; buf[j + 3] = d; };
    set(0, f.closed || 0, f.gx || 0, f.gy || 0, f.mouth || 0);
    set(1, f.smile || 0, f.up || 0, f.angry || 0, u.blush || 0);
    set(2, u.sleeve, u.neck, u.bootTop, u.legs); set(3, u.beltY, u.beltH, u.overK, u.strap);
    col(p + 4 * 4, L.skin); lin(5, u.lin.cloth); lin(6, u.lin.trim); lin(7, u.lin.pants); lin(8, u.lin.boots); lin(9, u.lin.belt);
    col(p + 10 * 4, L.hair); lin(11, u.lin.iris); lin(12, u.lin.lips); lin(13, u.lin.over); lin(14, u.lin.metal);
    set(15, u.torso, u.motif, u.feetK, 0); lin(16, u.lin.hat); lin(17, u.lin.cloak); lin(18, u.lin.beads); set(19, u.hem, u.cloakTrim, u.fur || 0, 0);
    function lin(k, c) { const j = p + k * 4; buf[j] = c[0]; buf[j + 1] = c[1]; buf[j + 2] = c[2]; buf[j + 3] = 1; }
    // (the cloth: the lag of the steps, the speed, its own clock; the ground under it; the joints it is kept off)
    const gr = L.ground !== undefined && Number.isFinite(L.ground);
    set(20, pose.clothB || 0, pose.clothV || 0, ((L.id || 0) % 97) * 0.37, 0); set(21, gr ? L.ground : 0, L.s || 1, gr ? 1 : 0, 0);
    for (let k = 0; k < JOINTS.length; k++) {
      const j = p + (22 + k) * 4;
      if (JIDX[k] >= 0) { const e = R[JIDX[k]].elements; buf[j] = e[12]; buf[j + 1] = e[13]; buf[j + 2] = e[14]; buf[j + 3] = 1; }
      else { const e = R[B3.CHEST].elements, o = k === 2 ? 0 : 8, l = Math.hypot(e[o], e[o + 1], e[o + 2]) || 1; buf[j] = e[o] / l; buf[j + 1] = e[o + 1] / l; buf[j + 2] = e[o + 2] / l; buf[j + 3] = 0; }
    }
    for (let k = 0; k < 2; k++) { const e = R[JIDX[4 + k * 3]].elements, j = p + (38 + k) * 4, x = (k ? -1 : 1) * CAP[0], y = CAP[1];
      buf[j] = e[0] * x + e[4] * y + e[12]; buf[j + 1] = e[1] * x + e[5] * y + e[13]; buf[j + 2] = e[2] * x + e[6] * y + e[14]; buf[j + 3] = 1; }
    // (what this person wears: the body, the hair, the beard, the skirt or the robe, the cloak, the hat)
    // (far from the eye, the lighter body; its clothes and hair the same)
    const bd0 = u.body || (L.fem ? 'corpoF' : 'corpoM'), bd = L.lod && B3.lod && MESH[bd0 + '_1'] ? bd0 + '_1' : bd0; use(MESH[bd] ? bd : 'corpoM', row);
    AT[row][7] = bd !== bd0 ? 1 : 0;
    if (u.hairM) use(u.hairM, row); if (u.beard) use(u.beard, row); if (u.skirt) use(u.skirt, row); if (u.cloakM) use(u.cloakM, row); if (u.hatM) use(u.hatM, row);
    if (row + 1 > B3.rows) B3.rows = row + 1;
  };
  // (who has no clothes of their own yet — the fallback's look: a plain tunic)
  const DEF = { sleeve: 0.585, neck: 0, bootTop: 0.11, legs: 1, beltY: 1.01, beltH: 0.017, overK: 0, strap: 0, torso: 0, motif: 0, feetK: 0, hem: 1, cloakTrim: 0, fur: 0, blush: 0,
    lin: { cloth: [0.4, 0.25, 0.12], trim: [0.4, 0.06, 0.04], pants: [0.07, 0.05, 0.04], boots: [0.1, 0.05, 0.03], belt: [0.05, 0.03, 0.02], iris: [0.07, 0.04, 0.02], lips: [0.5, 0.2, 0.18], over: [0.4, 0.25, 0.12], metal: [0.45, 0.25, 0.07], hat: [0.4, 0.25, 0.12], cloak: [0.2, 0.12, 0.06], beads: [0.6, 0.2, 0.03] } };
  function col(j, hex) { K.c.set(hex || '#888888'); buf[j] = K.c.r; buf[j + 1] = K.c.g; buf[j + 2] = K.c.b; buf[j + 3] = 1; }
  function use(name, row) { const M = MESH[name]; if (M && M.n < MAXR) M.rows[M.n++] = row; }
  B3.use = use;
  B3.end = function () {
    let calls = 0, tris = 0;
    for (const k in MESH) { const M = MESH[k]; M.geo.instanceCount = M.n; M.mesh.visible = M.n > 0; if (M.n) { M.ra.needsUpdate = true; calls++; tris += M.n * M.tris; } }
    if (B3.rows) tex.needsUpdate = true;
    B3.calls = calls; B3.tris = tris;
  };
  B3.clear = function () { for (const k in MESH) { MESH[k].n = 0; MESH[k].geo.instanceCount = 0; MESH[k].mesh.visible = false; } B3.rows = 0; };
  // (for the verifier: every number of every row drawn is a number; every mesh's rows are rows that were written)
  B3.check = function () {
    const out = []; if (!B3.ready) return out;
    for (let r = 0; r < B3.rows; r++) { const o = r * TW * 4; for (let k = 0; k < TW * 4; k++) if (!Number.isFinite(buf[o + k])) { out.push(`corpo ${r}: número inválido nos ossos`); return out; } }
    for (const k in MESH) { const M = MESH[k]; for (let i = 0; i < M.n; i++) if (!(M.rows[i] >= 0 && M.rows[i] < B3.rows)) { out.push(`malha ${k}: linha ${M.rows[i]} não desenhada`); break; } }
    // (every row drawn has one body, and only one; nobody's hips far from where the world has them)
    const bodies = new Array(B3.rows).fill(0); for (const k in MESH) if (/^corpo/.test(k)) for (let i = 0; i < MESH[k].n; i++) bodies[MESH[k].rows[i]]++;
    for (let r = 0; r < B3.rows; r++) {
      if (bodies[r] !== 1) { out.push(`corpo ${r}: ${bodies[r]} corpos na mesma linha`); break; }
      const a = AT[r]; if (!a) continue; const dh = Math.hypot(a[4] - a[0], a[6] - a[2]), dv = a[5] - a[1];
      if (dh > 1.2 * a[3] || dv < -0.4 || dv > 1.4 * a[3]) { out.push(`corpo ${r}: a pelve a ${dh.toFixed(2)} m de onde a pessoa está (altura ${dv.toFixed(2)})`); break; }
    }
    return out;
  };
  B3.meshes = () => Object.keys(MESH).map(k => ({ name: k, n: MESH[k].n, tris: MESH[k].tris }));
  B3.at = row => AT[row]; // (for the verifier: where row's person stands [X, Y, Z, size, hips X, Y, Z, the lighter body])
  B3._buf = () => buf; B3._tw = () => TW; // (for the tests: the rows of numbers, read only)
  // (a shader the graphics card refused when it first drew — no error to catch at the start: People3D asks after drawing,
  // and goes back to its pieces)
  B3.broken = function (renderer) {
    if (!B3.ready || !renderer || !renderer.properties) return false;
    for (const m of [mat, depth]) { const pr = renderer.properties.get(m); const prog = pr && pr.currentProgram; if (prog && prog.diagnostics && prog.diagnostics.runnable === false) return true; }
    return false;
  };
})(window.G);
