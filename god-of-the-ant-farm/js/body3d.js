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
  const B3 = G.Body3D = { ready: false, failed: null, rows: 0, calls: 0, lod: true }; // (lod: the far ones in the lighter meshes — off only to measure)
  let THREE = null, scene = null;
  const MAXR = 96; // (rows: People3D's MAX — the bodies drawn whole, the living and the dead)
  let D = null, NB = 0, PB = 0, TW = 0, buf = null, tex = null, mat = null, depth = null, TU = null, JIDX = null;
  B3.rim = { value: 0.2 }; // (the edge light's strength: People3D sets it from the sky of the hour)
  // (the body the player lives in, in a weave of holes when the eye comes near its head — a stair, a loft, a gap: G.Cam3D.bodyFade,
  // D-736 —: its row, found by its look in B3.put, and how much of it goes. Only seen: the shadow keeps the whole body)
  B3.fadeRow = { value: -10 }; B3.fade = { value: 0 };
  const MESH = {}; // name → { mesh, geo, rows (Float32Array), n }
  // (22a, D-553: the face's bones, at the end of the list — the jaw, the upper and the lower lid of each eye — turned from the head)
  const FACE_BONES = ['jaw', 'lidUL', 'lidUR', 'lidLL', 'lidLR'];
  let FB = null, FOFF = null; const FR = [];
  let inv = null; // the bones' inverse bind matrices (the rig in its bind pose, inverted)
  const WT = 49, NW = 12; // (22a) the shape's weights: one a target of G.Feicao.ALVOS, four a texel, from 49
  const NP = WT + NW; // texels of params and colours a row (20), the cloth's state and the joints it is kept off (20), more of the face (1), the buttocks (2),
  // (22a) the face's bones as turned and the girth (43: the upper lid, the lower lid, the jaw, how wide the body is to its cloth), the face's
  // channels (44–48, G.Rosto's order), the shape's weights (49–60)
  B3.MAXR = MAXR;
  // (the joints a cape and a skirt are kept off, in the order of their texels from 22: the hips and the neck — the trunk's
  // axis —, the chest's side and front axes, then shoulder, elbow, wrist of each arm, hip, knee, ankle of each leg)
  const JOINTS = ['pel', 'head', null, null, 'shL', 'faL', 'hdL', 'shR', 'faR', 'hdR', 'thL', 'snL', 'ftL', 'thR', 'snR', 'ftR'];
  // (and, at 38 and 39, the shoulder caps' middles — the deltoids, which turn with the arms under a cloak's yoke; at 41 and
  // 42 the buttocks' middles, which a seat pushes back and out under a skirt — they go half as the thigh goes, as the skin)
  const CAP = [0.016, -0.05, 0], SEAT = [0.072, 0.873, -0.052];

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
    const zone = bytes(m.zone); const mo = new Float32Array(n * 2); for (let i = 0; i < n; i++) { mo[i * 2] = -1; mo[i * 2 + 1] = i; }
    g.setAttribute('aMorph', new THREE.BufferAttribute(mo, 2));
    const ib = bytes(m.idx); g.setIndex(new THREE.BufferAttribute(m.i32 ? new Uint32Array(ib.buffer) : new Uint16Array(ib.buffer), 1));
    const rows = new Float32Array(MAXR); const ra = new THREE.InstancedBufferAttribute(rows, 1); ra.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('aRow', ra); g.instanceCount = 0;
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);
    return { g, rows, ra, tris: m.tris, pos, zone, mo };
  }

  // ------------------------------ the shaders ------------------------------
  // (the skin: the point moved by its four bones, each a 3×4 matrix of three texels in its person's row)
  const SKIN = `
uniform highp sampler2D uBody; uniform highp sampler2D uMorph; uniform highp sampler2D uMorphH;
attribute vec4 aBone; attribute vec4 aWt; attribute float aRow; attribute float aZone; attribute float aAO; attribute vec2 aMorph;
ivec2 b3mi(int i) { return ivec2(i - (i / B3_MW) * B3_MW, i / B3_MW); }
float b3mw(vec4 w4, int j) { return j == 0 ? w4.x : j == 1 ? w4.y : j == 2 ? w4.z : w4.w; }
vec3 b3morph(vec3 p, int k0, int k1) {
  if (aMorph.x < 0.0) return p;
  int row = int(aRow + 0.5), base = int(aMorph.x + 0.5); vec3 d = vec3(0.0);
  for (int k = k0; k < k1; k++) {
    float w = b3mw(texelFetch(uBody, ivec2(PB + B3_WT + k / 4, row), 0), k - (k / 4) * 4);
    if (abs(w) < 0.002) continue;
    vec4 h = texelFetch(uMorphH, b3mi(base + k), 0); // (the headers, whole numbers: full floats; the runs, half floats — D-642)
    float i = aMorph.y - h.y;
    if (h.x < 0.0 || i < -0.5 || i > h.z - 0.5) continue;
    d += w * texelFetch(uMorph, b3mi(int(h.x + i + 0.5)), 0).xyz;
  }
  return p + d;
}
vec3 b3U; // (the point's own up as its bones carry it — a skirt's panel lifted with the thighs: what hangs from it)
void b3skin(in vec3 p, in vec3 n, out vec3 P, out vec3 N) {
  int row = int(aRow + 0.5); vec4 r0 = vec4(0.0), r1 = vec4(0.0), r2 = vec4(0.0);
  // (under a cuirass the trunk goes with the chest, as the cuirass does: the hips' and the spine's share of a point from the
  // cuirass' lower edge up taken by the chest, eased in over the hand's breadth below it — texel 40.w, the edge's height in
  // the body as modelled; 0 with none. The body bends at the hips under it, never through it: D-351)
  float cuE = texelFetch(uBody, ivec2(PB + 40, row), 0).w; float cuK = cuE > 0.0 ? smoothstep(cuE - 0.13, cuE - 0.03, p.y) : 0.0;
  vec4 c0 = vec4(0.0), c1 = vec4(0.0), c2 = vec4(0.0); if (cuK > 0.0) { c0 = texelFetch(uBody, ivec2(B3_CHEST * 3, row), 0); c1 = texelFetch(uBody, ivec2(B3_CHEST * 3 + 1, row), 0); c2 = texelFetch(uBody, ivec2(B3_CHEST * 3 + 2, row), 0); }
  for (int i = 0; i < 4; i++) { float w = aWt[i]; if (w > 0.0) { int bi = int(aBone[i] + 0.5); int b = bi * 3;
    vec4 m0 = texelFetch(uBody, ivec2(b, row), 0), m1 = texelFetch(uBody, ivec2(b + 1, row), 0), m2 = texelFetch(uBody, ivec2(b + 2, row), 0);
    if (cuK > 0.0 && bi < B3_CHEST) { m0 = mix(m0, c0, cuK); m1 = mix(m1, c1, cuK); m2 = mix(m2, c2, cuK); }
    r0 += w * m0; r1 += w * m1; r2 += w * m2; } }
  vec4 q = vec4(p, 1.0); P = vec3(dot(r0, q), dot(r1, q), dot(r2, q)); N = vec3(dot(r0.xyz, n), dot(r1.xyz, n), dot(r2.xyz, n)); b3U = vec3(r0.y, r1.y, r2.y);
  // (and the thigh raised under it — sitting, crouching, the knee driven up — goes under its edge: a point of the leg or the
  // hips that the bend brings above the edge, inside the cuirass' foot, is kept just under it, eased out beyond the foot: D-351)
  int b0 = int(aBone[0] + 0.5);
  if (cuE > 0.0 && ((b0 < B3_CHEST && cuK < 1.0) || b0 == B3_THL || b0 == B3_THR || b0 == B3_HPL || b0 == B3_HPR)) {
    if (cuK <= 0.0 || b0 >= B3_CHEST) { c0 = texelFetch(uBody, ivec2(B3_CHEST * 3, row), 0); c1 = texelFetch(uBody, ivec2(B3_CHEST * 3 + 1, row), 0); c2 = texelFetch(uBody, ivec2(B3_CHEST * 3 + 2, row), 0); }
    vec3 d = P - vec3(c0.w, c1.w, c2.w); vec3 cq = (c0.xyz * d.x + c1.xyz * d.y + c2.xyz * d.z) / max(dot(c0.xyz, c0.xyz), 1e-6);
    float ez = cq.z > 0.0 ? 0.19 : 0.16; float e = length(vec2(cq.x / 0.225, cq.z / ez)); float top = cuE - 0.012;
    float ky = 1.0 - smoothstep(1.0, 1.3, e);
    if (ky > 0.0 && cq.y > top) { cq.y = mix(cq.y, min(cq.y, top), ky); vec4 c4 = vec4(cq, 1.0); P = vec3(dot(c0, c4), dot(c1, c4), dot(c2, c4)); }
  }
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
// (kept off a limb toward the outside only: along u, away from the body — a heel kicked up behind a skirt pushes its cloth
// back, never through to the front of the shin, whichever side of it the point happens to be)
vec3 b3out(vec3 P, vec3 a, vec3 b, float r, vec3 u) {
  vec3 ab = b - a; float t = clamp(dot(P - a, ab) / max(dot(ab, ab), 1e-8), 0.0, 1.0); vec3 d = P - (a + ab * t); float l2 = dot(d, d);
  if (l2 >= r * r) return P; float du = dot(d, u); return P + u * (-du + sqrt(max(du * du - l2 + r * r, 0.0)));
}
vec3 b3cloth(vec3 P, vec3 p) {
  int z = int(aZone + 0.5); bool cape = z == 7 || z == 15 || z == 21; if (!cape && z != 5 && z != 6) return P; // (a cape, a toga, a blouse; a skirt)
  vec4 m = b3V(20), gs = b3V(21); float g43 = b3V(43).w > 0.0 ? b3V(43).w : 1.0, s = gs.y * g43; // (22a: the girth of the body under it)
  float sA = gs.y * (1.0 + (g43 - 1.0) * 0.35); // (the arms fatten less than the trunk: their push on a blouse's sides by it, L-1677)
  vec3 pel = b3V(22).xyz, nk = b3V(23).xyz, ex = b3V(24).xyz, ez = b3V(25).xyz;
  vec3 up = normalize(nk - pel); float L = dot(nk - pel, up);
  // (a skirt's panels turn about the line of the hips: a point blended between two of them keeps its distance from that
  // line — two frames far apart, blended, drew it in toward the hips: sitting, the cloth sank into the lap and the seat)
  if (!cape) { int row = int(aRow + 0.5); vec4 q0 = texelFetch(uBody, ivec2(0, row), 0), q1 = texelFetch(uBody, ivec2(1, row), 0), q2 = texelFetch(uBody, ivec2(2, row), 0);
    vec3 hc = vec3(q0.y, q1.y, q2.y) * 0.88 + vec3(q0.w, q1.w, q2.w), hx = normalize(vec3(q0.x, q1.x, q2.x)), hr = P - hc; float hp = dot(hr, hx); vec3 hq = hr - hx * hp;
    float hl = length(hq), hw = length(vec2(p.y - 0.88, p.z)) * s; if (hl > 1e-4 && hl < hw) P = hc + hx * hp + hq * (hw / hl); }
  // (how free the point is: 0 where it is held — the yoke, the waist —, 1 at the hem)
  float w = z == 7 ? clamp((1.40 - p.y) / 0.85, 0.0, 1.0) : clamp((0.98 - p.y) / 0.85, 0.0, 1.0); w = w * w * (3.0 - 2.0 * w);
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
    if (z != 21) { P = b3off(P, b3V(38).xyz, b3V(38).xyz, 0.078 * sA); P = b3off(P, b3V(39).xyz, b3V(39).xyz, 0.078 * sA); } // (a blouse has no yoke on them)
    P = b3off(P, mix(sL, eL, 0.15), eL, 0.072 * sA); P = b3off(P, eL, wL, 0.056 * sA); P = b3off(P, wL, wL + (wL - eL) * 0.62, 0.052 * sA);
    P = b3off(P, mix(sR, eR, 0.15), eR, 0.072 * sA); P = b3off(P, eR, wR, 0.056 * sA); P = b3off(P, wR, wR + (wR - eR) * 0.62, 0.052 * sA);
    // (then the trunk, last — nothing pushes the cloth into it: an elliptic cylinder round the hips-to-neck axis, a little
    // inside the cloth's place at rest; not the yoke, which lies on the shoulders as it was made)
    float h = dot(P - pel, up); vec3 q = P - pel - up * clamp(h, 0.0, L); float qx = dot(q, ex), qz = dot(q, ez);
    float u = clamp(h / L, 0.0, 1.0); float rx = mix(0.17, 0.2, u) * s, rz = mix(0.135, 0.122, u) * s;
    float kk = clamp((1.40 - p.y) / 0.1, 0.0, 1.0);
    vec2 qa = abs(vec2(qx / rx, qz / rz)); float k = pow(qa.x * qa.x * qa.x + qa.y * qa.y * qa.y, 1.0 / 3.0); // (a back fuller at its corners: the shoulder blades)
    if (k < 1.0 && k > 1e-4 && z != 21) P += (ex * qx + ez * qz) * ((1.0 / k - 1.0) * kk); // (a blouse goes with the trunk's bones)
    // (the legs, from a little under the hips)
    float lr = (z == 15 || z == 21 ? 1.0 : 1.0 - smoothstep(0.82, 0.97, p.y)) * s; // (a toga, a blouse are held by nothing at the waist: the thighs push them anywhere)
    P = b3off(P, b3V(32).xyz, b3V(33).xyz, 0.092 * lr); P = b3out(P, b3V(33).xyz, b3V(34).xyz, 0.07 * lr, rd);
    P = b3off(P, b3V(35).xyz, b3V(36).xyz, 0.092 * lr); P = b3out(P, b3V(36).xyz, b3V(37).xyz, 0.07 * lr, rd); // (the shins, outward only)
  } else {
    // (a skirt: its waist kept off the belly as the trunk bows over it, a little inside where it sits at rest; the thighs
    // from a tenth of their length — standing they never reach the waist, raised they carry the cloth over them)
    float fm = b3V(19).w; // (a woman: her hips, her buttocks and her thighs are fuller)
    // (below the knees a skirt the thighs have lifted hangs: past the fold at the knee's line of a panel raised toward the
    // level — sitting, crouching — it falls straight down from the fold, as cloth does; standing and walking nothing moves,
    // and lying down it rests on the legs)
    float hk = max(0.0, 0.38 - p.y);
    if (hk > 0.0) { float ul = length(b3U); P += (b3U - vec3(0.0, ul, 0.0)) * hk * (1.0 - smoothstep(0.55, 0.85, b3U.y / max(ul, 1e-5))) * smoothstep(0.45, 0.75, up.y); }
    // (the waist and the hips under it, down to the top of the thighs: a seat folds the cloth there, and it must not fold in;
    // and above the waist the trunk, fuller up to the chest: sitting on the ground the knees bring the cloth up against it)
    { float h = dot(P - pel, up); if (p.y > 0.45 && h > -0.25 * s) { vec3 q = P - pel - up * clamp(h, 0.0, L); float qx = dot(q, ex), qz = dot(q, ez); float g = smoothstep(0.05, 0.3, h / s);
      float k = length(vec2(qx / ((0.155 + 0.017 * fm + 0.02 * g) * s), qz / ((0.112 + 0.019 * fm + 0.025 * g) * s))); if (k < 1.0 && k > 1e-4) P += (ex * qx + ez * qz) * (1.0 / k - 1.0); } }
    // (standing, from a tenth of their length — they never reach the waist —; raised toward the belly, sitting or crouching,
    // from the hip itself and fuller — a woman's the more —: they carry the cloth over them)
    vec3 hL = b3V(32).xyz, kL = b3V(33).xyz, hR = b3V(35).xyz, kR = b3V(36).xyz;
    float uL = smoothstep(-0.8, -0.3, dot(normalize(kL - hL), up)), uR = smoothstep(-0.8, -0.3, dot(normalize(kR - hR), up));
    P = b3off(P, mix(hL, kL, 0.1 - 0.1 * uL), kL, mix(0.1 + 0.004 * fm, 0.105 + 0.012 * fm, uL) * s); P = b3out(P, kL, b3V(34).xyz, 0.068 * s, rd);
    P = b3off(P, mix(hR, kR, 0.1 - 0.1 * uR), kR, mix(0.1 + 0.004 * fm, 0.105 + 0.012 * fm, uR) * s); P = b3out(P, kR, b3V(37).xyz, 0.068 * s, rd); // (the shins, outward only)
    // (the buttocks: a seat pushes them back and out, and the cloth over them)
    P = b3off(P, b3V(41).xyz, b3V(41).xyz, (0.075 + 0.016 * fm) * s); P = b3off(P, b3V(42).xyz, b3V(42).xyz, (0.075 + 0.016 * fm) * s);
    // (and the forearms and the hands, where they rest on it: on the hips, tied behind the back)
    vec3 eL = b3V(27).xyz, wL = b3V(28).xyz, eR = b3V(30).xyz, wR = b3V(31).xyz;
    P = b3off(P, eL, wL, 0.05 * s); P = b3off(P, wL, wL + (wL - eL) * 0.62, 0.048 * s);
    P = b3off(P, eR, wR, 0.05 * s); P = b3off(P, wR, wR + (wR - eR) * 0.62, 0.048 * s);
  }
  if (gs.z > 0.5) P.y = max(P.y, gs.x + 0.012 * s);
  return P;
}
`;
  const VARY = 'varying vec3 vBind; varying vec3 vBindN; varying float vAO; flat varying int vRowI; flat varying int vZoneI;\n';
  // the paint of a body: from where the point is on the body as modelled (vBind) — the eyes from their own normal.
  // The row's texels after the bones: 0 face (shut, gaze x, gaze y, mouth open) · 1 mood (smile, brows up, brows in, blush)
  // · 2 cut (sleeve end down the arm, neckline, boot top, legs: 0 bare 1 trousers 2 wrapped) · 3 cut (belt height, belt
  // half-width, over: 0 none 1 the northern apron-dress 2 an apron 3 the skirt of its own colour, strap) · 4 skin · 5 cloth · 6 trim · 7 trousers ·
  // 8 boots · 9 belt · 10 hair · 11 iris · 12 lips · 13 over · 14 metal · 15 style (torso: 0 dressed 1 bare 2 bare with a
  // collar; trim motif; feet: 0 shoes 1 bare 2 sandals; stubble) · 16 hat · 17 cloak · 18 beads · 19 (hem trim, cloak trim, the collar: 0 cloth 1 fur 2 white fur, -) · 20, 21 and the joints: the cloth (CLOTH)
  const PAINT = `
vec4 b3T(int k) { return texelFetch(uBody, ivec2(PB + k, vRowI), 0); }
float b3aa(float d) { float w = fwidth(d) * 0.8 + 1e-5; return clamp(0.5 - d / w, 0.0, 1.0); }
// (cloth: a fine weave that fades before it can shimmer)
float b3weave(vec3 p) { float f = fwidth(p.y) + fwidth(p.x); float k = 1.0 - smoothstep(0.0008, 0.0025, f); return 1.0 + (sin(p.x * 1400.0 + p.z * 600.0) * sin(p.y * 1400.0)) * 0.035 * k; }
// (what a garment is made of — 1 wool, 2 linen or cotton, 3 leather —: its stuff from the materials' stack (Ground3D), the
// weave on the body as modelled, two planes blended by its normal; a fine weave of its own where the stack is not there.
// b3fk keeps what the body's paint was made of: under cloth the hollows of the skin — the navel — barely darken)
float b3fk = 0.0;
vec3 b3cl(vec3 c, float k, vec3 p) {
#ifndef B3_NOTEX
  if (uTexOn > 0.5 && k > 0.5) {
    float L = k < 1.5 ? M3_WOOL : k < 2.5 ? M3_LINEN : M3_LEATHER, S = k < 1.5 ? M3S_WOOL : k < 2.5 ? M3S_LINEN : M3S_LEATHER;
    vec3 n = abs(normalize(vBindN)); float w = n.z / max(n.z + n.x, 1e-3);
    vec3 f = m3col(m3raw(L, p.xy * S)) * w + m3col(m3raw(L, p.zy * S + 0.37)) * (1.0 - w);
    return c * mix(vec3(1.0), f, 0.85);
  }
#endif
  return c * b3weave(p);
}
// (a woven band: diamonds of a lighter thread along it — u along the band, v across, 0..1)
vec3 b3band(vec3 c, float u, float v, float motif) { if (motif < 0.5) return c; float d = abs(fract(u) - 0.5) * 2.0 + abs(v - 0.5) * 2.0; return mix(c, mix(c, vec3(0.95, 0.88, 0.62), 0.6), smoothstep(0.62, 0.52, d) * step(0.25, v) * step(v, 0.75) + 0.0); }
float b3gl = 0.0; // (the eyes' glint: a light of its own, added after the lighting — it shines in the shade too)
float b3sk = 0.0; // (22a: a pixel of skin — the light goes a little into it and comes out warm at the edge of the shade)
float b3sw = 0.0; // (22a wave 2, D-641: the sweat on a pixel of skin — the face's channel: the heat, the effort, the fever)
vec3 b3eye(vec3 skin, bool lidded) {
  vec4 f = b3T(0), m = b3T(1), x = b3T(40); vec3 d = normalize(vBindN);
  float outer = d.x * (vZoneI == 1 || vZoneI == 26 ? 1.0 : -1.0); // (toward the eye's outer corner)
  vec3 g = normalize(vec3(f.y, f.z, 1.0)); float a = dot(d, g);
  float aw = fwidth(a) * 1.5 + 0.004;
  vec3 iris = b3T(11).rgb;
  // (the white, a little grey toward its corners and under the upper lid's shadow)
  vec3 c = mix(vec3(0.93, 0.91, 0.87), vec3(0.7, 0.66, 0.62), smoothstep(0.25, -0.55, d.y) * 0.8 + smoothstep(0.3, 0.75, abs(d.x)) * 0.35);
  // (the iris: a dark ring at its edge, brighter toward the middle and below, where the light comes through it; fine
  // streaks round the pupil, only when close enough to see them; the pupil)
  float ir = smoothstep(0.809 - aw, 0.809 + aw, a); // (stylised, D-558: 1.1× a real one — it reads at a distance, and the eye stays calm)
  vec3 ic = mix(iris * 0.3, iris * 1.3, smoothstep(0.809, 0.925, a)) * (1.0 + 0.25 * smoothstep(0.0, -0.5, dot(d - g * a, vec3(0.0, 1.0, 0.0))));
  float fib = 1.0 - smoothstep(0.0, 0.06, fwidth(a) * 30.0); ic *= 1.0 + 0.12 * fib * sin(atan(d.x - g.x, d.y - g.y) * 22.0);
  c = mix(c, ic, ir); c = mix(c, vec3(0.02, 0.016, 0.015), smoothstep(0.961 - aw, 0.961 + aw, a));
  // (the glints: the sky in a wet eye — a big one high on one side, a small one below on the other)
  float hl = dot(d, normalize(g + vec3(-0.26, 0.34, 0.0))), h2 = dot(d, normalize(g + vec3(0.2, -0.24, 0.0)));
  float gl = smoothstep(0.972, 0.982, hl) + smoothstep(0.993, 0.996, h2) * 0.6;
  // (the lids: the upper one comes down with the blink; it opens wide in fear and awe, lowers in a glare, droops at the
  // outer corner in grief; the lower one rises as the cheeks do in a smile; their edges a dark line of lashes)
  float up = 0.42 + 0.24 * x.y - 0.16 * m.z - 0.1 * x.z - 0.2 * x.x * max(0.0, outer + 0.2);
  up = mix(up, -0.8, f.x); float lo = -0.47 + f.x * 0.3 + 0.28 * x.z - 0.1 * x.y;
  float e = fwidth(d.y) + 0.01;
  float lid = max(smoothstep(up - e, up + e, d.y), smoothstep(lo + e, lo - e, d.y));
  float lash = smoothstep(up - 0.2 - e, up - 0.03, d.y) * (0.75 + 0.25 * smoothstep(-0.2, 0.6, outer));
  if (lidded) { vec4 fb = b3T(43); up = sin(B3_LIDU - fb.x); lid = 0.0; lash = 0.0; } // (the lids are of their own: only their shadow here, where the upper one is)
  c *= 1.0 - 0.3 * smoothstep(up - 0.3, up - 0.02, d.y); // (the upper lid's shadow on the eye)
  vec3 lidc = skin * 0.84;
  c = mix(c, vec3(0.05, 0.035, 0.03), lash * (1.0 - lid) * 0.92);
  vec4 chC = b3T(B3_CH_CRY_T); float cry = clamp(chC[B3_CH_CRY_C], 0.0, 1.0); gl = min(1.0, gl * (1.0 + cry * 1.5) + cry * 0.15 * smoothstep(-0.2, -0.6, d.y)); // (22a: the wet eye — the tears in its lower rim)
  c = mix(c, vec3(1.0), gl * (1.0 - lid) * 0.85); b3gl = gl * (1.0 - lid) * (1.0 - lash * 0.7);
  return mix(c, lidc * (1.0 - 0.25 * smoothstep(up + 0.25, up + e, d.y)), lid); // (the lid darker at its edge: its crease)
}
// the face: brows, lips, the mouth (open, smiling, laughing, shouting), the cheeks. Its moods: texel 1 (smile, brows up,
// anger, blush) and 40 (grief, eyes wide, eyes smiling, the jaw open)
vec3 b3face(vec3 p, vec3 skin) {
  vec3 c = skin; vec4 m = b3T(1), x = b3T(40); vec3 hair = b3T(10).rgb; float ax = abs(p.x);
  if (p.z > 0.06) {
    // (the brows: an arc over each eye, thick at the inner end, darker than the skin whatever the hair — raised in fear and
    // awe, drawn in and down in anger, their inner ends up and the outer down in grief)
    float bx = ax + m.z * 0.0035;
    float u = clamp((bx - 0.016) / 0.054, 0.0, 1.0);
    float yc = 1.734 + 0.005 * sin(u * 3.1416) + u * 0.0015 + m.y * (0.008 + 0.004 * (1.0 - u)) - m.z * 0.009 * (1.0 - u) + x.x * (0.008 * (1.0 - u) - 0.004 * u);
    vec4 pp = b3T(B3_WT + 11); // (22a: the paint of the genes — the freckles, the brows' weight — at the shape's spare slots)
    // (22a: a shape, not stripes — full at the head, thinning to a point at the tail; up close, hairs: each strand of its own
    // slant, length and shade, slanting out and up as brows grow — a hash on the strand, the same every frame; far off, the shape)
    float th = mix(0.0062, 0.0016, smoothstep(0.35, 1.0, u)) * (0.75 + 0.5 * pp.y) * (0.8 + 0.2 * smoothstep(0.0, 0.12, u));
    float sy = (p.y - yc) / max(th, 1e-4), sx = bx + (p.y - yc) * mix(-0.4, 1.1, u); float sid = floor(sx / 0.0011);
    float h1 = fract(sin(sid * 12.9898) * 43758.5453), h2 = fract(sin(sid * 78.233) * 12543.123);
    float nr0 = 1.0 - smoothstep(0.0003, 0.0012, fwidth(p.x)), sf = abs(fract(sx / 0.0011) - 0.5) * 2.0;
    float edge = th * (1.0 + nr0 * (0.35 * h1 - 0.15)); // (the outline broken by the hairs that stick out)
    float br = b3aa(abs(p.y - yc) - edge) * smoothstep(0.012, 0.0165, bx) * smoothstep(0.075, 0.068 - 0.004 * h2 * nr0, bx);
    vec3 bc = mix(min(hair * 0.5, skin * 0.3), hair * 0.78, clamp(pp.w * 0.85, 0.0, 1.0)); // (grey with the hair, D-635)
    c = mix(c, bc, br * 0.95 * mix(1.0, (0.62 + 0.38 * h2) * (1.0 - 0.35 * sf * sf) * (1.0 - 0.25 * smoothstep(0.4, 1.0, abs(sy))), nr0));
    // (the lips and the mouth: the corners up in a smile, down in grief and anger; open as it talks, laughs, gasps — the
    // teeth showing in a laugh)
    float mx = ax / (0.0262 + 0.003 * max(m.x, 0.0));
    if (mx < 1.3 && p.y > 1.58 && p.y < 1.645) {
      float cy = 1.6145 + m.x * 0.006 * mx * mx; float open = b3T(0).w * 0.011 * max(0.0, 1.0 - mx * mx);
      // (22a: the lips with their volume and their colour — the upper one with its bow, the «M»: two peaks and the dip under the
      // nose; the lower one fuller, lit along its middle; a fine pale edge over the upper one, the shadow under the lower one, the
      // corners that read: a mouth's expression has to be seen from a few steps, the first sheet of five faces)
      float b1 = (mx - 0.3) / 0.16, b2 = mx / 0.12; float bow = 0.0017 * exp(-b1 * b1) - 0.0013 * exp(-b2 * b2);
      float up = 0.0072 * (1.0 - mx * mx * 0.8) + bow, dn = 0.0105 * (1.0 - mx * mx * 0.9);
      vec3 lips = b3T(12).rgb;
      float top = cy + up + open * 0.3, bot = cy - dn - open * 0.5, inl = b3aa(mx - 1.0);
      float lu = b3aa(p.y - top) * b3aa(cy + open * 0.5 - p.y), ld = b3aa((cy - open * 0.5) - p.y) * b3aa(p.y - bot);
      float hy = (p.y - (cy - dn * 0.45 - open * 0.5)) / (dn * 0.3); float hiL = exp(-hy * hy) * max(0.0, 1.0 - mx * mx);
      vec3 lc = mix(lips * 0.84, lips * (1.0 + 0.24 * hiL), step(p.y, cy));
      c = mix(c, lc, max(lu, ld) * inl * 0.93);
      c *= 1.0 + 0.07 * b3aa(abs(p.y - top - 0.0008) - 0.0006) * inl * (1.0 - mx * 0.5);
      float under = (1.0 - smoothstep(0.0, 0.0055, bot - p.y)) * step(p.y, bot) * max(0.0, 1.0 - mx * mx * 0.8); c *= 1.0 - 0.22 * under;
      float k1 = (mx - 1.0) / 0.09, k2 = (p.y - cy) / 0.0022; c *= 1.0 - 0.35 * exp(-k1 * k1 - k2 * k2);
      float line = b3aa(abs(p.y - cy) - (0.0007 + open * 0.5)) * b3aa(mx - 1.04);
      vec3 inside = mix(vec3(0.1, 0.03, 0.03), vec3(0.86, 0.82, 0.74), b3aa(cy + open * 0.5 - 0.0028 - p.y) * step(0.004, open) * b3aa(mx - 0.75) * step(0.2, m.x));
      c = mix(c, mix(lips * 0.35, inside, step(0.001, open)), line * 0.9);
    }
    // (a blush on the cheeks — and the cheeks lifted in a smile catch the light)
    // (22a wave 2, L-1675: the flush is a warmth over the cheek, not a disc of red — the old tint made the cheek darker and redder
    // under a sharp round edge, a stain on a dark skin and rouge on a pale one: now wide and soft, the brightness kept, as much as
    // the skin shows it — the feeling's blush (the face's channel) and the cold's and the drink's come through the same warmth)
    float ch = length(vec2(ax - 0.052, (p.y - 1.652) * 1.25)) / 0.03; float lum0 = dot(c, vec3(0.3, 0.59, 0.11));
    vec3 warm = c * vec3(1.1, 0.93, 0.9); warm *= lum0 / max(dot(warm, vec3(0.3, 0.59, 0.11)), 1e-4);
    c = mix(c, warm, (1.0 - smoothstep(0.0, 1.0, ch)) * min(0.1 + m.w, 1.0) * (0.35 + 0.65 * smoothstep(0.12, 0.5, lum0)));
    float nz = length(vec2(ax / 0.016, (p.y - 1.662) / 0.02)); c = mix(c, c * vec3(1.05, 0.88, 0.86), (1.0 - smoothstep(0.35, 1.0, nz)) * 0.4 * step(0.1, p.z)); // (the nose's tip)
    c *= 1.0 + 0.05 * x.z * (1.0 - smoothstep(0.2, 1.1, ch));
    // (22a, D-555: the years on the face — the lines of the forehead, the crow's feet at the eyes' outer corners, the fold from the
    // nose to the mouth —, as the shape's weights of the years have them; only where they can be seen, never shimmering far off)
    float yrs = clamp(pp.z, 0.0, 1.0);
    float fine = 1.0 - smoothstep(0.0006, 0.002, fwidth(p.y));
    // (22a wave 2, D-637: and broad and soft, for a few steps off where the fine lines are lost — the fold from the nose to the mouth,
    // the bags under the eyes, the shade of the jowls —; the old skin a little greyer)
    if (yrs > 0.01) {
      float nlb = abs((ax - 0.018) * 0.9 - (1.655 - p.y) * 0.45);
      float foldB = (1.0 - smoothstep(0.0, 0.0055, nlb)) * smoothstep(1.592, 1.602, p.y) * (1.0 - smoothstep(1.652, 1.66, p.y)) * smoothstep(0.012, 0.018, ax) * (1.0 - smoothstep(0.04, 0.046, ax));
      float bag = (1.0 - smoothstep(0.0, 1.0, length(vec2((ax - 0.037) / 0.016, (p.y - 1.683) / 0.006)))) * step(0.07, p.z);
      float jowl = 1.0 - smoothstep(0.0, 1.0, length(vec2((ax - 0.042) / 0.014, (p.y - 1.587) / 0.012)));
      c *= 1.0 - yrs * (foldB * 0.16 + bag * 0.13 + jowl * 0.1);
      c = mix(c, vec3(dot(c, vec3(0.3, 0.59, 0.11))), yrs * 0.12);
    }
    if (yrs > 0.01 && fine > 0.0) {
      float fh = smoothstep(1.742, 1.752, p.y) * smoothstep(1.8, 1.785, p.y) * smoothstep(0.045, 0.0, ax) * step(0.07, p.z);
      float lines = fh * smoothstep(0.55, 0.95, sin(p.y * 1250.0 + sin(p.x * 60.0) * 1.5));
      float cr = length(vec2(ax - 0.066, p.y - 1.703)); float crow = smoothstep(0.016, 0.006, cr) * smoothstep(0.6, 0.95, sin(atan(p.y - 1.703, ax - 0.066) * 9.0)) * step(0.06, ax);
      float nl = abs((ax - 0.018) * 0.9 - (1.655 - p.y) * 0.45) ; float fold = smoothstep(0.0025, 0.0, nl) * step(1.6, p.y) * step(p.y, 1.655) * step(0.016, ax) * step(ax, 0.04);
      c *= 1.0 - yrs * fine * (lines * 0.22 + crow * 0.2 + fold * 0.18);
    }
    // (the freckles: small spots over the nose and the cheeks, as many as the gene — a hash on the place, the same every frame)
    if (pp.x > 0.02 && fine > 0.0 && p.y > 1.63 && p.y < 1.71 && ax < 0.07) {
      vec2 q = vec2(p.x, p.y) * 420.0; vec2 cell = floor(q); float rnd = fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453);
      float sp = smoothstep(0.32, 0.18, length(fract(q) - 0.5)) * step(1.0 - pp.x * 0.55, rnd) * smoothstep(0.075, 0.03, length(vec2(ax - 0.03, p.y - 1.67)));
      c = mix(c, c * vec3(0.78, 0.62, 0.5), sp * fine * 0.8);
    }
    // (beads of sweat on the brow, near only — the face's channel, D-641; the shine of the wet skin is the light's, below)
    vec4 chS2 = b3T(B3_CH_SWEAT_T); float swt = clamp(chS2[B3_CH_SWEAT_C], 0.0, 1.0);
    if (swt > 0.2 && fine > 0.0 && p.y > 1.725 && p.y < 1.79 && ax < 0.05 && p.z > 0.06) {
      vec2 q3 = vec2(p.x, p.y) * 260.0; vec2 c3 = floor(q3); float r3 = fract(sin(dot(c3, vec2(27.619, 57.583))) * 31337.17);
      float bead = (1.0 - smoothstep(0.12, 0.3, length(fract(q3) - vec2(0.5, 0.42)))) * step(1.0 - (swt - 0.2) * 0.35, r3);
      c = mix(c, c * 1.3 + vec3(0.05), bead * fine * 0.7);
    }
    // (the spots of the age: few and broader than freckles, from the sixties on, near only — D-637)
    if (yrs > 0.4 && fine > 0.0 && p.y > 1.62 && p.y < 1.79 && ax < 0.075) {
      vec2 q2 = vec2(p.x, p.y) * 150.0; vec2 c2 = floor(q2); float r2 = fract(sin(dot(c2, vec2(39.346, 11.135))) * 24634.6345);
      float sp2 = (1.0 - smoothstep(0.25, 0.42, length(fract(q2) - 0.5))) * step(0.93 - (yrs - 0.4) * 0.12, r2);
      c = mix(c, c * vec3(0.8, 0.68, 0.55), sp2 * fine * 0.55);
    }
  }
  return c;
}
// (22a) the face's own parts: the lids — the skin of the eye's, a little darker toward the rim and in the fold —, the rims of
// lashes (the upper one dark, the lower one softer), the dark of the mouth, the teeth, the tongue
vec3 b3face2(vec3 p, vec3 skin) {
  if (vZoneI == 22) { b3sk = 1.0; return skin * vec3(0.95, 0.9, 0.88); }
  if (vZoneI == 28) return p.y > B3_EYEY ? vec3(0.05, 0.035, 0.03) : mix(skin * 0.5, vec3(0.08, 0.05, 0.04), 0.4);
  if (vZoneI == 23) return vec3(0.17, 0.045, 0.05);
  if (vZoneI == 24) return vec3(0.86, 0.83, 0.76);
  if (vZoneI == 25) return vec3(0.6, 0.27, 0.27);
  return skin;
}
// the pieces worn over the body: hair in locks, a beard, a skirt with its hem's band (an apron over it, or the northern
// apron-dress), a cape with its band, a hat of wool, straw, iron, a hood, a scarf, a crown
// (a skirt's cloth: the dress's, or the apron-dress's over it — and an apron in front)
vec3 b3skirtc(vec3 p) {
  vec4 Bc = b3T(3); bool ov = (Bc.z > 0.5 && Bc.z < 1.5) || Bc.z > 2.5; vec3 c = b3cl(ov ? b3T(13).rgb : b3T(5).rgb, ov ? b3T(20).w : b3T(21).w, p);
  if (Bc.z > 1.5 && Bc.z < 2.5 && p.z > 0.0 && abs(p.x) < 0.14) c = b3cl(b3T(13).rgb, b3T(20).w, p.zyx); // (the apron in front)
  return c;
}
vec3 b3piece(vec3 p) {
  int z = vZoneI; float ang = atan(p.x, p.z + 0.015);
  if (z == 3 || z == 4) {
    vec3 h = b3T(10).rgb; float st = sin(ang * (z == 3 ? 46.0 : 30.0) + p.y * 30.0 + sin(ang * 7.0) * 2.0) * 0.5 + 0.5;
    float k = 1.0 - smoothstep(0.0, 0.02, fwidth(ang) * 46.0);
    return h * mix(1.0, 0.8 + 0.32 * st, k) * (z == 4 ? 0.92 : 1.0);
  }
  if (z == 5 || z == 6) {
    vec3 c = b3skirtc(p);
    // (the hem's band follows the hem, which is never level — arte/corpo_roupa.py, skirt_hem)
    float sa = atan(p.x, p.z + 0.008); float hy = (z == 5 ? B3_HEMC : B3_HEML) + 0.011 * sin(sa * 3.0 + 1.0) + 0.006 * sin(sa * 7.0 + 0.4); float hb = (p.y - hy) / 0.03;
    if (b3T(19).x > 0.5 && hb < 1.0) c = b3band(b3T(6).rgb, ang * 9.0, clamp(hb, 0.0, 1.0), b3T(15).y);
    return c;
  }
  if (z == 7 || z == 11) {
    vec3 c = b3cl(b3T(17).rgb, 1.0, p);
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
    float fk = b3T(19).z; if (fk < 0.5) return b3cl(b3T(17).rgb, 1.0, p) * 0.94;
    vec3 fur = fk > 1.5 ? vec3(0.74, 0.7, 0.64) : vec3(0.3, 0.22, 0.15);
    float a = atan(p.x, -(p.z + 0.012)); float st = sin(a * 70.0 + sin(p.y * 160.0 + a * 9.0) * 2.0) * 0.5 + 0.5;
    float k = 1.0 - smoothstep(0.0, 0.03, fwidth(a) * 70.0);
    return fur * mix(1.0, 0.72 + 0.5 * st, k);
  }
  if (z == 8 || z == 13) { vec3 m = z == 13 ? b3T(14).rgb : b3T(16).rgb; float rv = step(0.5, fract(ang * 2.546)) * 0.0; return m * (0.92 + 0.12 * sin(ang * 4.0 + p.y * 30.0)) + rv; }
  if (z == 15) return b3cl(b3T(17).rgb, 1.0, p); // (the toga, the himation: the mantle's wool)
  if (z == 16) {
    // the nemes: stripes of gold and blue round the head and down the lappets
    float st = smoothstep(0.3, 0.7, abs(fract(p.y * 30.0) - 0.5) * 2.0); float k = 1.0 - smoothstep(0.0, 0.03, fwidth(p.y) * 30.0);
    return mix(mix(b3T(14).rgb, vec3(0.05, 0.1, 0.32), 0.5), mix(b3T(14).rgb * 1.08, vec3(0.04, 0.08, 0.3), st), k);
  }
  if (z == 17) { float st = sin(p.z * 260.0 + sin(p.y * 90.0) * 2.0) * 0.5 + 0.5; float k = 1.0 - smoothstep(0.0, 0.02, fwidth(p.z) * 260.0); return b3T(6).rgb * mix(1.0, 0.75 + 0.4 * st, k); } // (a crest of dyed horsehair, its strands)
  if (z == 18) {
    // the feathers of the jungle: quetzal green, bluer toward the tips, the barbs catching the light
    float r = length(p - vec3(0.0, 1.72, -0.01)); vec3 g = mix(vec3(0.03, 0.3, 0.15), vec3(0.02, 0.12, 0.22), smoothstep(0.22, 0.48, r));
    float st = sin(ang * 70.0 + r * 40.0) * 0.5 + 0.5; float k = 1.0 - smoothstep(0.0, 0.03, fwidth(ang) * 70.0); return g * mix(1.0, 0.8 + 0.4 * st, k);
  }
  if (z == 19) {
    // the loincloth: the cloth, its two ends with the people's band
    vec3 c = b3cl(b3T(5).rgb, 2.0, p); if (p.y < 0.65) c = b3band(b3T(6).rgb, p.x * 40.0, clamp((p.y - 0.6) / 0.05, 0.0, 1.0), 1.0); return c;
  }
  if (z == 20) { float lf = sin(ang * 44.0 + p.y * 180.0) * 0.5 + 0.5; return b3T(16).rgb * (0.82 + 0.3 * lf); } // (the laurel: green leaves — of gold for a ruler)
  if (z == 21) {
    // a blouse — a huipil, the overfold of a chiton: the tunic's cloth; its hem a woven band and, down its front, the middle
    // panel of a huipil with the people's motif (where the people have one)
    vec3 c = b3cl(b3T(5).rgb, b3T(21).w, p); vec4 St = b3T(15);
    float hb = (p.y - 0.84) / 0.035; if (hb < 1.0) c = b3band(b3T(6).rgb, atan(p.x, p.z + 0.008) * 9.0, clamp(hb, 0.0, 1.0), St.y);
    if (St.y > 0.5 && p.z > 0.0 && abs(p.x) < 0.045 && p.y > 0.88) c = b3band(b3T(6).rgb, p.y * 16.0, abs(p.x) / 0.045 * 0.5 + 0.5, 1.0);
    return c;
  }
  if (z == 10) { float w = step(0.5, fract(ang * 16.0 + p.y * 45.0)) * 0.5 + step(0.5, fract(ang * 16.0 - p.y * 45.0)) * 0.5; float k = 1.0 - smoothstep(0.0, 0.03, fwidth(ang) * 16.0); return b3T(16).rgb * mix(1.0, 0.82 + 0.3 * w, k); }
  return b3T(16).rgb * b3weave(p);
}
vec3 b3paint() {
  vec3 p = vBind; vec3 skin = b3T(4).rgb * vec3(1.0, 0.93, 0.87); // (warm: a pale skin read white under the sun)
  vec4 chP = b3T(B3_CH_PALE_T); float pale = chP[B3_CH_PALE_C]; skin = mix(skin, vec3(dot(skin, vec3(0.3, 0.59, 0.11))) * vec3(0.95, 0.97, 1.02), clamp(pale, 0.0, 1.0) * 0.45); // (22a: the colour gone in sickness and terror)
  if (vZoneI == 1 || vZoneI == 2) return b3eye(skin, false);
  if (vZoneI == 26 || vZoneI == 27) return b3eye(skin, true);
  if (vZoneI >= 22) return b3face2(p, skin);
  if (vZoneI >= 3) return b3piece(p);
  vec4 A = b3T(2), Bc = b3T(3), St = b3T(15);
  vec3 cloth = b3cl(b3T(5).rgb, b3T(21).w, p), trim = b3T(6).rgb;
  float sd = p.x < 0.0 ? -1.0 : 1.0;
  // the neckline: low in front, at the base of the neck behind
  // (the head and the neck: above the neckline, within the neck — the shoulders round it are the tunic's)
  float neckY = 1.486 - (0.03 + A.y) * smoothstep(0.0, 0.07, p.z); float rn = length(vec2(p.x, p.z + 0.008));
  if (p.y > 1.565 || (p.y > neckY && rn < 0.07 + A.y * 0.9)) { b3sk = 1.0; return b3face(p, skin); }
  // the arms, as modelled (open from the body by the bind's roll): how far down the arm, how far from its axis
  vec3 S = vec3(sd * 0.235, 1.44, 0.0); vec3 Dd = vec3(sd * B3_SR, -B3_CR, 0.0);
  vec3 ap = p - S; float t = dot(ap, Dd); float rad = length(ap - Dd * t);
  bool bare = St.x > 0.5;
  if (t > 0.03 && rad < 0.11) {
    if (t > 0.585 || t > A.x) { b3sk = 1.0; return skin; }
    if (bare) { b3sk = 1.0; return skin; }
    vec3 c = cloth; float tb = (A.x - t) / 0.022; b3fk = 1.0;
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
      vec3 ov = b3cl(b3T(13).rgb, b3T(20).w, p);
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
    if (Bc.z > 1.5 && Bc.z < 2.5 && p.z > 0.0 && abs(p.x) < 0.13 && p.y < 1.33) c = b3cl(b3T(13).rgb, b3T(20).w, p.zyx); // (an apron)
    // (a strap across the chest, left shoulder to right hip, for the bag)
    if (Bc.w > 0.5) { float sdst = abs(dot(vec2(p.x - 0.12, p.y - 1.43), normalize(vec2(0.44, 0.27)))); if (sdst < 0.016) c = b3T(9).rgb * 0.92; }
    float bl = abs(p.y - bY) - bH;
    if (bl < 0.0) { c = b3cl(b3T(9).rgb, 3.0, p); if (p.z > 0.06 && abs(p.x) < 0.016 + 0.0 && abs(p.y - bY) < bH * 0.85) c = b3T(14).rgb; }
    if (p.y < bY - bH) c = St.w > 0.5 ? b3skirtc(p) : b3cl(b3T(7).rgb, 1.0, p);
    if (!bare || p.y < bY + bH) b3fk = 1.0;
    return c;
  }
  // the legs: under a skirt, its cloth down to a little above its hem (texel 15.w: 1 a short one, 2 a long one) — what the
  // cloth lets through shows as the cloth —; then trousers (wrapped below the knee in the north) down to the boots; the
  // feet: shoes, sandals or bare
  if (St.w > 0.5 && p.y > (St.w > 1.5 ? B3_HEML : B3_HEMC) + 0.03) { b3fk = 1.0; return b3skirtc(p); }
  vec3 c = A.w > 0.5 ? b3cl(b3T(7).rgb, 1.0, p) : skin; b3fk = A.w > 0.5 ? 1.0 : 0.0;
  if (A.w > 1.5 && p.y < 0.43 && p.y > A.z) { float lx = p.x - sd * 0.095; float ang = atan(p.z, lx); float w = fract(p.y * 34.0 + ang * 0.42); c = mix(trim * 0.85, trim * 1.1, step(0.5, w)) * (0.86 + 0.14 * smoothstep(0.0, 0.18, abs(w - 0.5))); }
  if (p.y < A.z) {
    vec3 bt = b3cl(b3T(8).rgb, 3.0, p); c = bt; b3fk = 1.0;
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
    const fd = D.face || { lid: [0.6109, 0.6632, 1.117], eyes: [[0.037, 1.7036, 0.089]] };
    const Fe = G.Feicao, NTs = Fe && Fe.NT ? Fe.NT : 0, KB = Fe && Fe.KIND ? Fe.KIND.corpo : [0, 0];
    const RX = G.Rosto ? G.Rosto.IDX : { cry: 16, pale: 19 }; const chi = k => '#define B3_CH_' + k.toUpperCase() + '_T ' + (44 + (RX[k] >> 2)) + '\n#define B3_CH_' + k.toUpperCase() + '_C ' + (RX[k] & 3) + '\n';
    const pb = chi('cry') + chi('pale') + chi('sweat') + '#define PB ' + PB + '\n#define B3_WT ' + WT + '\n#define B3_MW ' + MW + '\n#define B3_NT ' + NTs + '\n#define B3_K0 ' + KB[0] + '\n#define B3_K1 ' + KB[1] + '\n#define B3_LIDU ' + fd.lid[0].toFixed(5) + '\n#define B3_EYEY ' + fd.eyes[0][1].toFixed(5) + '\n#define B3_CHEST ' + B3.CHEST + '\n#define B3_THL ' + D.bones.indexOf('thL') + '\n#define B3_THR ' + D.bones.indexOf('thR') + '\n#define B3_HPL ' + D.bones.indexOf('hpHL') + '\n#define B3_HPR ' + D.bones.indexOf('hpHR') + '\n#define B3_SR ' + Math.sin(D.roll).toFixed(6) + '\n#define B3_CR ' + Math.cos(D.roll).toFixed(6) + '\n#define B3_HEMC ' + hem.saiaC.toFixed(4) + '\n#define B3_HEML ' + hem.saiaL.toFixed(4) + '\n#define B3_HEMK ' + hem.cape.toFixed(4) + '\n';
    const TEX = !!(G.Ground3D && G.Ground3D.texGLSL && G.Ground3D.U3 && G.TEX3D && G.TEX3D.wool && G.TEX3D.linen && G.TEX3D.leather); // (the materials' stack, where the 3D has it)
    mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    mat.onBeforeCompile = sh => {
      sh.uniforms.uBody = B3.U; sh.uniforms.uMorph = B3.U2; sh.uniforms.uMorphH = B3.U3; sh.uniforms.uTime = TU.time; sh.uniforms.uWind = TU.wind; sh.uniforms.uRim = B3.rim;
      sh.uniforms.uFadeRow = B3.fadeRow; sh.uniforms.uFade = B3.fade;
      if (TEX) Object.assign(sh.uniforms, G.Ground3D.U3());
      sh.vertexShader = pb + SKIN + CLOTH + VARY + sh.vertexShader
        .replace('#include <beginnormal_vertex>', `vec3 b3P, b3N; b3skin(b3morph(position, 0, B3_NT), normal, b3P, b3N);
          vec3 objectNormal = b3N;
          #ifdef USE_TANGENT
          vec3 objectTangent = vec3( tangent.xyz );
          #endif
          vBind = position; vBindN = normal; vAO = aAO; vRowI = int(aRow + 0.5); vZoneI = int(aZone + 0.5);`)
        .replace('#include <begin_vertex>', 'vec3 transformed = b3cloth(b3P, position);');
      // (22a, D-553: the skin's warm edge of the shade — narrow and faint: wider and at 0.2 it read as rouge on a pale cheek a few
      // steps off, the first photos; and less red: even at 0.08 the second sheet kept a blush on the pale cheeks)
      const LC = THREE.ShaderChunk.lights_lambert_pars_fragment, LA = 'vec3 irradiance = dotNL * directLight.color;';
      const LIGHT = LC.indexOf(LA) >= 0 ? LC.replace(LA, LA + '\n\tfloat b3nl = dot( geometryNormal, directLight.direction );\n\treflectedLight.directDiffuse += directLight.color * material.diffuseColor * vec3( 1.0, 0.68, 0.52 ) * ( b3sk * 0.05 * smoothstep( -0.35, 0.02, b3nl ) * ( 1.0 - smoothstep( 0.02, 0.35, b3nl ) ) );\n\tif ( b3sw > 0.0 ) { vec3 b3h = normalize( directLight.direction + geometryViewDir ); reflectedLight.directDiffuse += directLight.color * ( b3sw * 0.45 * pow( max( dot( geometryNormal, b3h ), 0.0 ), 36.0 ) ); }') : LC;
      sh.fragmentShader = pb + (TEX ? G.Ground3D.texGLSL() : '#define B3_NOTEX\n') + 'uniform highp sampler2D uBody; uniform float uRim; uniform float uFadeRow; uniform float uFade;\n' + VARY + PAINT + sh.fragmentShader.replace('#include <lights_lambert_pars_fragment>', LIGHT)
        // (the weave: a hole where the screen's noise is under the fade — the same pixels from frame to frame, no shimmer)
        .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\n  if (uFade > 0.0 && float(vRowI) == uFadeRow && fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) < uFade * 0.85) discard;\n')
        .replace('#include <color_fragment>', '#include <color_fragment>\n  diffuseColor.rgb = b3paint(); diffuseColor.rgb *= mix(1.0, max(vAO, b3fk > 0.5 ? 0.8 : 0.6), 0.75);\n  vec4 b3chS = b3T(B3_CH_SWEAT_T); b3sw = b3sk * clamp(b3chS[B3_CH_SWEAT_C], 0.0, 1.0); diffuseColor.rgb *= 1.0 - 0.06 * b3sw;')
        // (a soft light on the edges, as the old figures had: the people read against the ground — as bright as the sky of
        // the hour: at night it does not glow)
        .replace('#include <opaque_fragment>', 'outgoingLight += diffuseColor.rgb * pow(1.0 - abs(dot(normal, normalize(vViewPosition))), 3.0) * uRim + vec3(0.92, 0.94, 1.0) * b3gl * 0.45;\n#include <opaque_fragment>');
    };
    mat.customProgramCacheKey = () => 'body3d-v10';
    depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
    depth.onBeforeCompile = sh => {
      sh.uniforms.uBody = B3.U; sh.uniforms.uTime = TU.time; sh.uniforms.uWind = TU.wind;
      sh.uniforms.uMorph = B3.U2; sh.uniforms.uMorphH = B3.U3;
      // (22a: in the shadow's pass the face's relief is pressed flat — the nose, the brows, the lips and the eyes cast no shadow on
      // the face, whose blocks of the shadow map read as dark stains on the cheeks and the chin; the head still shades the world)
      sh.vertexShader = pb + SKIN + CLOTH + sh.vertexShader.replace('#include <begin_vertex>', 'vec3 b3q = b3morph(position, B3_K0, B3_K1); if (position.y > 1.55 && position.z > 0.035 && (aZone < 2.5 || (aZone > 21.5 && aZone < 28.5))) b3q.z = 0.035 + (b3q.z - 0.035) * 0.25;\n  vec3 b3P, b3N; b3skin(b3q, vec3(0.0, 1.0, 0.0), b3P, b3N); vec3 transformed = b3cloth(b3P, position);');
    };
    depth.customProgramCacheKey = () => 'body3d-depth-v5';
  }

  // ------------------------------ starting ------------------------------
  B3.init = function (three, realm) {
    THREE = three; scene = realm.scene();
    try {
      D = G.BODYMESH; if (!D || !D.meshes || !D.meshes.corpoM) throw new Error('sem malhas (js/bodymesh.js)');
      NB = D.bones.length; PB = NB * 3; TW = PB + NP;
      TU = realm.U && realm.U.time && realm.U.wind ? realm.U : { time: { value: 0 }, wind: { value: new THREE.Vector3() } }; // (the view's clock and the world's wind)
      JIDX = JOINTS.map(n => (n ? D.bones.indexOf(n) : -1)); B3.CHEST = D.bones.indexOf('chest'); B3.HEAD = D.bones.indexOf('head');
      B3.HIPH = [D.bones.indexOf('hpHL'), D.bones.indexOf('hpHR')];
      FB = FACE_BONES.map(n => D.bones.indexOf(n)); if (FB.some(i => i < 0) || !D.face) FB = null; // (a mesh of before the face's bones: none)
      buf = new Float32Array(TW * MAXR * 4);
      tex = new THREE.DataTexture(buf, TW, MAXR, THREE.RGBAFormat, THREE.FloatType);
      tex.minFilter = tex.magFilter = THREE.NearestFilter; tex.generateMipmaps = false; tex.needsUpdate = true;
      B3.U = { value: tex }; B3.U2 = { value: null }; B3.U3 = { value: null };
      shaders();
      for (const name in D.meshes) {
        const o = geometryOf(D.meshes[name]);
        const m = new THREE.Mesh(o.g, mat); m.frustumCulled = false; m.castShadow = true; m.customDepthMaterial = depth; m.matrixAutoUpdate = false; m.visible = false;
        scene.add(m); MESH[name] = { mesh: m, geo: o.g, rows: o.rows, ra: o.ra, n: 0, tris: o.tris, pos: o.pos, zone: o.zone, mo: o.mo };
      }
      // (each mesh in its levels of detail — name, name_1, name_2 —, the lightest it has standing in for the ones it lacks)
      for (const name in MESH) if (!/_\d$/.test(name)) { const a = [name], l = [0]; for (let k = 1; k < 3; k++) { const ok = !!MESH[name + '_' + k]; a.push(ok ? name + '_' + k : a[k - 1]); l.push(ok ? k : l[k - 1]); } LVL[name] = a; LVN[name] = l; }
      bind(); shapes();
      B3.ready = true; return true;
    } catch (e) { B3.failed = String((e && e.message) || e); B3.ready = false; return false; }
  };
  // the bind: the rig in the pose the meshes were modelled in; its frames inverted turn a modelled point into one of the bone
  function bind() {
    const P3 = G.People3D; const pose = Object.assign(G.Anim3D.POSE0(), { elL: 0, elR: 0, knL: 0, knR: 0, shLr: D.roll - 0.05, shRr: -(D.roll - 0.05) });
    let R = P3.rig(0, 0, 0, Math.PI / 2, pose, { s: 1, bind: true });
    // (the face's bones in the bind: the head's frame moved to each one's hinge — the jaw's, each eye's centre)
    if (FB) { const h = new THREE.Vector3().setFromMatrixPosition(R[B3.HEAD]); FOFF = FACE_BONES.map(n => { const q = n === 'jaw' ? D.face.jaw : D.face.eyes[n.endsWith('L') ? 0 : 1]; return new THREE.Matrix4().makeTranslation(q[0] - h.x, q[1] - h.y, q[2] - h.z); });
      R = R.slice(); FB.forEach((b, k) => { R[b] = R[B3.HEAD].clone().multiply(FOFF[k]); }); } // (a copy: the rig's own frames untouched)
    inv = R.map(m => m.clone().invert());
    // (the rig and the meshes must agree on where every joint is: a mismatch is a mesh made for another rig)
    B3.bindErr = 0; const v = new THREE.Vector3();
    for (const k in D.bind) { const i = D.bones.indexOf(k); if (i < 0) continue; v.setFromMatrixPosition(R[i]); B3.bindErr = Math.max(B3.bindErr, Math.hypot(v.x - D.bind[k][0], v.y - D.bind[k][1], v.z - D.bind[k][2])); }
    if (B3.bindErr > 0.002) throw new Error('o rig e as malhas discordam (' + B3.bindErr.toFixed(4) + ' m)');
  }
  B3.bones = () => (D ? D.bones : null);

  // ------------------------------ the shapes (22a, D-554) ------------------------------
  // Each target of G.Feicao.ALVOS evaluated once on every point of every mesh: a mesh's header (one texel a target: where its run
  // of displacements starts, the first point it moves, how many) and the runs (one texel a point) in one table of numbers; each
  // point knows its mesh's header and its own index (aMorph). The eyes and their lids follow the targets that move them whole (at
  // the eye's centre) or make them bigger; the others leave the eyeballs as they are. Made at the start, never again
  const MW = 2048; let mtex = null; B3.MORPH = { texels: 0, bytes: 0, ms: 0 };
  const EYEZ = new Set([1, 2, 26, 27]), LIDZ = new Set([22, 28]);
  let PIV = null; // (each target's displacement at the face's hinges: the left eye's centre, the right one's, the jaw's)
  const Q3 = [0, 0, 0];
  function shapes() {
    const Fe = G.Feicao; if (!Fe || !Fe.ALVOS) return;
    const t0 = performance.now(), NT = Fe.NT; const hdr = [], runs = [], rk = []; let off = 0;
    const eyes = D.face ? D.face.eyes : [[0.0371, 1.7036, 0.089], [-0.0371, 1.7036, 0.089]], jaw = D.face ? D.face.jaw : [0, 1.657, -0.004];
    const names = Object.keys(MESH); const HB = names.length * NT; // (the headers first, then the runs)
    // (what is worn — the hair, a beard, a hat, the clothes — takes the shape of the body where it sits: each of its points moves as
    // the nearest point of the skin moves (the man's and the woman's near bodies), so a skirt goes out with a fat belly as far as the
    // belly goes, and a hat sits on a wider skull — the field at the cloth's own place fades sooner than the skin's. A stump is not
    // given to the clothes: a cloak by the forearm stays a cloak)
    const REF = []; for (const nm of ['corpoM', 'corpoF']) { const M = MESH[nm]; if (!M) continue; for (let i = 0; i < M.mo.length / 2; i++) if (M.zone[i] === 0) REF.push(M.pos[i * 3], M.pos[i * 3 + 1], M.pos[i * 3 + 2]); }
    const RN = REF.length / 3, CS = 0.03, cell = new Map(), ck = (a, b, c) => a * 73856093 ^ b * 19349663 ^ c * 83492791;
    for (let i = 0; i < RN; i++) { const k = ck(Math.floor(REF[i * 3] / CS), Math.floor(REF[i * 3 + 1] / CS), Math.floor(REF[i * 3 + 2] / CS)); let l = cell.get(k); if (!l) cell.set(k, l = []); l.push(i); }
    const nearest = (x, y, z) => { const cx = Math.floor(x / CS), cy = Math.floor(y / CS), cz = Math.floor(z / CS); let best = -1, bd = 1e9;
      for (let r = 1; r <= 12 && (best < 0 || bd > (r * CS) * (r * CS)); r += r < 3 ? 1 : 3) { for (let a = -r; a <= r; a++) for (let b = -r; b <= r; b++) for (let c = -r; c <= r; c++) { const l = cell.get(ck(cx + a, cy + b, cz + c)); if (!l) continue;
        for (const i of l) { const d = (REF[i * 3] - x) ** 2 + 9 * (REF[i * 3 + 1] - y) ** 2 + (REF[i * 3 + 2] - z) ** 2; if (d < bd) { bd = d; best = i; } } } } // (the skin at the same height first: a loose blouse over the belly takes the belly's, not the bust's)
      return best; };
    const RF = new Map(); // (each target's displacement at the reference points, made once)
    const refD = k => { let d = RF.get(k); if (!d) { d = new Float32Array(RN * 3); for (let i = 0; i < RN; i++) { const q = Fe.at(k, REF[i * 3], REF[i * 3 + 1], REF[i * 3 + 2]); d[i * 3] = q[0]; d[i * 3 + 1] = q[1]; d[i * 3 + 2] = q[2]; } RF.set(k, d); } return d; };
    for (const name of names) {
      const M = MESH[name], n = M.mo.length / 2, P = M.pos, Z = M.zone; const base = hdr.length / 4;
      const worn = !/^corpo/.test(name) && RN > 0; let NI = null;
      if (worn) { NI = new Int32Array(n); for (let i = 0; i < n; i++) NI[i] = nearest(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]); }
      let lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (let i = 0; i < n; i++) for (let a = 0; a < 3; a++) { const q = P[i * 3 + a]; if (q < lo[a]) lo[a] = q; if (q > hi[a]) hi[a] = q; }
      for (let k = 0; k < NT; k++) {
        const T = Fe.ALVOS[k], b = T.box;
        if ((worn && /^coto/.test(T.name)) || hi[0] < b[0][0] || hi[1] < b[0][1] || hi[2] < b[0][2] || lo[0] > b[1][0] || lo[1] > b[1][1] || lo[2] > b[1][2]) { hdr.push(-1, 0, 0, 0); continue; }
        const d = new Float32Array(n * 3); let first = -1, last = -1; const RD = worn ? refD(k) : null;
        for (let i = 0; i < n; i++) {
          const z = Z[i], x = P[i * 3], y = P[i * 3 + 1], zz = P[i * 3 + 2]; let q;
          if (EYEZ.has(z) || LIDZ.has(z)) {
            // (the eye and its lids are one: they move whole, or grow, with the targets that move the eye — never bent by the others,
            // or a lid pushed into its globe lets the eye through it when it closes)
            if (T.eye === 'move') { const c = eyes[x >= 0 ? 0 : 1]; q = Fe.at(k, c[0], c[1], c[2]); }
            else if (T.eye === 'scale') q = Fe.at(k, x, y, zz); else continue;
          } else if (worn) { const r = NI[i]; if (r < 0) continue; Q3[0] = RD[r * 3]; Q3[1] = RD[r * 3 + 1]; Q3[2] = RD[r * 3 + 2]; q = Q3; }
          else q = Fe.at(k, x, y, zz);
          if (Math.abs(q[0]) + Math.abs(q[1]) + Math.abs(q[2]) < 2e-5) continue;
          d[i * 3] = q[0]; d[i * 3 + 1] = q[1]; d[i * 3 + 2] = q[2]; if (first < 0) first = i; last = i;
        }
        if (first < 0) { hdr.push(-1, 0, 0, 0); continue; }
        const cnt = last - first + 1; hdr.push(off, first, cnt, 0); runs.push(d.subarray(first * 3, (last + 1) * 3)); rk.push(T.kind !== 'corpo' ? 'rosto' : /^coto/.test(T.name) ? 'coto' : 'corpo'); off += cnt;
      }
      for (let i = 0; i < n; i++) M.mo[i * 2] = base; M.geo.attributes.aMorph.needsUpdate = true;
    }
    // (22a wave 2, D-642: the runs in half floats — half the memory on the card; the headers, whole numbers past what a half keeps,
    // in a small table of full floats. The CPU's sum reads the very halves the card reads; err is what a half loses)
    const rows = Math.max(1, Math.ceil(off / MW)), hrows = Math.max(1, Math.ceil(HB / MW)), DU = THREE.DataUtils;
    const half = new Uint16Array(MW * rows * 4), buf = new Float32Array(MW * rows * 4), hbuf = new Float32Array(MW * hrows * 4); hbuf.set(hdr, 0);
    // (the nearest half — THREE's own cuts toward zero, a whole step lost —, and what a half loses by the kind of target: the face's —
    // the identity, the years, the features —, the body's, the stump's)
    const toHalf = x => { let h = DU.toHalfFloat(x); const h2 = h + 1; if ((h2 & 0x7fff) < 0x7c00 && Math.abs(DU.fromHalfFloat(h2) - x) < Math.abs(DU.fromHalfFloat(h) - x)) h = h2; return h; };
    let j = 0, err = 0; const errs = { rosto: 0, corpo: 0, coto: 0 };
    runs.forEach((r, q) => { for (let i = 0; i < r.length / 3; i++) { for (let a = 0; a < 3; a++) { const h16 = toHalf(r[i * 3 + a]); half[j + a] = h16; const b = DU.fromHalfFloat(h16); buf[j + a] = b; const e = Math.abs(b - r[i * 3 + a]); if (e > err) err = e; if (e > errs[rk[q]]) errs[rk[q]] = e; } j += 4; } });
    const tx = (data, h, type) => { const t = new THREE.DataTexture(data, MW, h, THREE.RGBAFormat, type); t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true; return t; };
    mtex = tx(half, rows, THREE.HalfFloatType); const htex = tx(hbuf, hrows, THREE.FloatType);
    B3.U2.value = mtex; B3.U3.value = htex; B3._morph = { buf, hdr: Float32Array.from(hdr), names, NT, err, errs };
    PIV = Fe.ALVOS.map((T, k) => [eyes[0], eyes[1], jaw].map(c => Array.from(Fe.at(k, c[0], c[1], c[2]))));
    B3.MORPH = { texels: off + HB, bytes: half.byteLength + hbuf.byteLength, full: (off + HB) * 16, ms: performance.now() - t0, err, errs };
  }
  // (for the tests and the verifier: the displacement of every point of a mesh for the weights w — the shader's own sum, on the CPU)
  B3.morphOf = function (name, w) {
    const Mo = B3._morph, M = MESH[name]; if (!Mo || !M) return null; const n = M.mo.length / 2, out = new Float32Array(n * 3), base = M.mo[0];
    for (let k = 0; k < Mo.NT; k++) { const wk = w[k]; if (!wk) continue; const h = (base + k) * 4; const o = Mo.hdr[h]; if (o < 0) continue; const f = Mo.hdr[h + 1], c = Mo.hdr[h + 2];
      for (let i = 0; i < c; i++) { const j = (o + i) * 4; out[(f + i) * 3] += wk * Mo.buf[j]; out[(f + i) * 3 + 1] += wk * Mo.buf[j + 1]; out[(f + i) * 3 + 2] += wk * Mo.buf[j + 2]; } }
    return out;
  };

  // ------------------------------ a frame ------------------------------
  const K = { m: null, c: null };
  B3.begin = function () { for (const k in MESH) MESH[k].n = 0; B3.rows = 0; B3.fadeRow.value = -10; B3.fade.value = 0; };
  // a person in row `row`: R the rig's frames (world), pose and look; which meshes they wear
  const AT = []; // (where each row's person stands, for the verifier: X, Y, Z, size)
  const WORN = []; // (what each row's person wears, for the verifier: their clothes, their skin)
  B3.put = function (row, R, pose, L, X, Y, Z) {
    if (!K.m) { K.m = new THREE.Matrix4(); K.c = new THREE.Color(); }
    AT[row] = [X, Y, Z, L.s || 1, R[0].elements[12], R[0].elements[13], R[0].elements[14]];
    { const av = G.People3D && G.People3D.avatar; const f = av && L === av.look && G.Cam3D && G.Cam3D.bodyFade ? G.Cam3D.bodyFade() : 0; if (f > 0) { B3.fadeRow.value = row; B3.fade.value = f; } }
    const o = row * TW * 4; WORN[row] = [L.out || DEF, L.skin];
    const fv = faceOf(pose, L); // (the face as the drawing turns it: the lids and the jaw, the channels)
    const fe = L.fe || null; weightsOf(fe, fv);
    // (a few steps off the lips are not cut — the mouth is painted open there —: the jaw goes a third as far, the face does not stretch)
    if (B3.lod && (L.lod | 0) >= 1) fv.jawA *= 0.35;
    // (the face's bones turn about their hinges as the person's shape moved them — the eyes further apart, the jaw longer)
    if (FB) for (let k = 0; k < 5; k++) { const F = FR[k] || (FR[k] = new THREE.Matrix4()); const dq = pivOf(k);
      K.r = K.r || new THREE.Matrix4(); K.t = K.t || new THREE.Matrix4();
      F.copy(R[B3.HEAD]).multiply(FOFF[k]).multiply(K.t.makeTranslation(dq[0], dq[1], dq[2])).multiply(K.r.makeRotationX(k === 0 ? fv.jawA : k < 3 ? fv.upA : fv.loA)).multiply(K.t.makeTranslation(-dq[0], -dq[1], -dq[2])); }
    for (let b = 0; b < NB; b++) {
      const Rb = FB && b >= FB[0] ? FR[b - FB[0]] : R[b];
      const e = K.m.multiplyMatrices(Rb, inv[b]).elements; const j = o + b * 12;
      buf[j] = e[0]; buf[j + 1] = e[4]; buf[j + 2] = e[8]; buf[j + 3] = e[12];
      buf[j + 4] = e[1]; buf[j + 5] = e[5]; buf[j + 6] = e[9]; buf[j + 7] = e[13];
      buf[j + 8] = e[2]; buf[j + 9] = e[6]; buf[j + 10] = e[10]; buf[j + 11] = e[14];
    }
    const p = o + PB * 4;
    const f = L.face || {}, u = L.out || DEF;
    const set = (k, a, b, c, d) => { const j = p + k * 4; buf[j] = a; buf[j + 1] = b; buf[j + 2] = c; buf[j + 3] = d; };
    // (the face's paint from the channels — the animation's pose.face or today's face, the same words (D-556): the blink, the look,
    // the mouth, the smile, the brows, the eyes wide and narrowed, the blush)
    const RI = G.Rosto && G.Rosto.IDX, c = fv.ch;
    if (RI) { set(0, Math.min(1, Math.max(0, c[RI.blink])), c[RI.gazeX], c[RI.gazeY], c[RI.jaw]); set(1, c[RI.smile], c[RI.browUp], c[RI.browIn], (u.blush || 0) + c[RI.blush]); set(40, c[RI.browSad], c[RI.wide], c[RI.squint], L.cuir || 0); }
    else { set(0, f.closed || 0, f.gx || 0, f.gy || 0, f.mouth || 0); set(1, f.smile || 0, f.up || 0, f.angry || 0, (u.blush || 0) + (f.blush || 0)); set(40, f.sad || 0, f.wide || 0, f.squint || 0, L.cuir || 0); }
    set(2, u.sleeve, u.neck, u.bootTop, u.legs); set(3, u.beltY, u.beltH, u.overK, u.strap);
    set(43, fv.upA, fv.loA, fv.jawA, fe ? fe.girth : 1); for (let k = 0; k < 5; k++) set(44 + k, fv.ch[k * 4], fv.ch[k * 4 + 1], fv.ch[k * 4 + 2], fv.ch[k * 4 + 3]);
    for (let k = 0; k < NW; k++) set(WT + k, SW[k * 4], SW[k * 4 + 1], SW[k * 4 + 2], SW[k * 4 + 3]);
    col(p + 4 * 4, L.skin); lin(5, u.lin.cloth); lin(6, u.lin.trim); lin(7, u.lin.pants); lin(8, u.lin.boots); lin(9, u.lin.belt);
    col(p + 10 * 4, L.hair); lin(11, u.lin.iris); lin(12, u.lin.lips); lin(13, u.lin.over); lin(14, u.lin.metal);
    set(15, u.torso, u.motif, u.feetK, u.skirt === 'saiaL' ? 2 : u.skirt === 'saiaC' ? 1 : 0); lin(16, u.lin.hat); lin(17, u.lin.cloak); lin(18, u.lin.beads); set(19, u.hem, u.cloakTrim, u.fur || 0, L.fem ? 1 : 0);
    function lin(k, c) { const j = p + k * 4; buf[j] = c[0]; buf[j + 1] = c[1]; buf[j + 2] = c[2]; buf[j + 3] = 1; }
    // (the cloth: the lag of the steps, the speed, its own clock; the ground under it; the joints it is kept off)
    const gr = L.ground !== undefined && Number.isFinite(L.ground);
    set(20, pose.clothB || 0, pose.clothV || 0, ((L.id || 0) % 97) * 0.37, u.fabO || 1); set(21, gr ? L.ground : 0, L.s || 1, gr ? 1 : 0, u.fab || 1);
    for (let k = 0; k < JOINTS.length; k++) {
      const j = p + (22 + k) * 4;
      if (JIDX[k] >= 0) { const e = R[JIDX[k]].elements; buf[j] = e[12]; buf[j + 1] = e[13]; buf[j + 2] = e[14]; buf[j + 3] = 1; }
      else { const e = R[B3.CHEST].elements, o = k === 2 ? 0 : 8, l = Math.hypot(e[o], e[o + 1], e[o + 2]) || 1; buf[j] = e[o] / l; buf[j + 1] = e[o + 1] / l; buf[j + 2] = e[o + 2] / l; buf[j + 3] = 0; }
    }
    for (let k = 0; k < 2; k++) { const e = R[JIDX[4 + k * 3]].elements, j = p + (38 + k) * 4, x = (k ? -1 : 1) * CAP[0], y = CAP[1];
      buf[j] = e[0] * x + e[4] * y + e[12]; buf[j + 1] = e[1] * x + e[5] * y + e[13]; buf[j + 2] = e[2] * x + e[6] * y + e[14]; buf[j + 3] = 1; }
    for (let k = 0; k < 2; k++) { const b = B3.HIPH[k], e = K.m.multiplyMatrices(R[b], inv[b]).elements, j = p + (41 + k) * 4, x = (k ? -1 : 1) * SEAT[0], y = SEAT[1], z = SEAT[2];
      buf[j] = e[0] * x + e[4] * y + e[8] * z + e[12]; buf[j + 1] = e[1] * x + e[5] * y + e[9] * z + e[13]; buf[j + 2] = e[2] * x + e[6] * y + e[10] * z + e[14]; buf[j + 3] = 1; }
    // (what this person wears: the body, the hair, the beard, the skirt or the robe, the cloak, the hat — each in the level of
    // detail the eye's distance asks (People3D: 0 near, 1 a few steps off, 2 far))
    const lv = B3.lod ? Math.max(0, Math.min(2, L.lod | 0)) : 0;
    const bd = u.body && MESH[u.body] ? u.body : L.fem ? 'corpoF' : 'corpoM';
    AT[row][7] = useL(MESH[bd] ? bd : 'corpoM', lv, row);
    if (u.hairM) useL(u.hairM, lv, row); if (u.beard) useL(u.beard, lv, row); if (u.skirt) useL(u.skirt, lv, row); if (u.cloakM) useL(u.cloakM, lv, row); if (u.hatM) useL(u.hatM, lv, row); if (u.topM) useL(u.topM, lv, row);
    if (row + 1 > B3.rows) B3.rows = row + 1;
  };
  // the face as the drawing turns it (22a, D-553, D-556): the channels of G.Rosto when the animation writes them (pose.face, 22c —
  // a Float32Array in G.Rosto's order), else the face of today (L.face: the blink, the mouth, the mood); the lids' and the jaw's
  // angles from them — the upper lid down to meet the lower in a blink, up in fear, down in a laugh and a glare; the lower lid up
  // in a laugh; the jaw open for the «a» of speech, the laugh, the shout
  const FV = { upA: 0, loA: 0, jawA: 0, ch: new Float32Array(20) }; const RAD = Math.PI / 180;
  function faceOf(pose, L) {
    const RI = G.Rosto && G.Rosto.IDX, ch = FV.ch, pf = pose && pose.face;
    if (RI && pf && pf.length >= G.Rosto.CH.length) { for (let k = 0; k < 20 && k < pf.length; k++) ch[k] = pf[k]; }
    else { const f = L.face || {}; ch.fill(0); if (RI) { ch[RI.blink] = f.closed || 0; ch[RI.gazeX] = f.gx || 0; ch[RI.gazeY] = f.gy || 0; ch[RI.jaw] = f.mouth || 0; ch[RI.smile] = f.smile || 0; ch[RI.browUp] = f.up || 0; ch[RI.browIn] = f.angry || 0; ch[RI.browSad] = f.sad || 0; ch[RI.wide] = f.wide || 0; ch[RI.squint] = f.squint || 0; ch[RI.blush] = f.blush || 0; } }
    if (!RI) { FV.upA = 0; FV.loA = 0; FV.jawA = 0; return FV; }
    const cl = (x, a, b) => (x < a ? a : x > b ? b : x);
    const bl = cl(ch[RI.blink], 0, 1), sq = cl(ch[RI.squint], 0, 1), wd = cl(ch[RI.wide], 0, 1), sd = cl(ch[RI.browSad], 0, 1), sm = cl(ch[RI.smile], -1, 1), pn = cl(ch[RI.pain], 0, 1);
    // (at rest the eye is calm — the upper lid over the top of the iris, a tenth or so of it, the lower one at its rim: the mesh's
    // own rest, rosto.py LID_REST_*; the white above and below it is the wide channel's, fear and awe, never the rest's: D-557)
    // (the upper lid that falls with the years — the old one's hooded eye, D-637 —, shut at a blink in the same place)
    const fe = L && L.fe, FX = G.Feicao && G.Feicao.IDX, dr = fe && fe.w && FX ? fe.w[FX.velho] * 5 + fe.w[FX.anciao] * 4 : 0;
    FV.loA = -cl(bl * 14 + sq * 12 + Math.max(0, sm) * 4 + pn * 8 - wd * 4, -10, 26) * RAD;
    FV.upA = cl(dr * (1 - bl) * (1 - wd) + bl * 56 + sq * 13 + sd * 6 + pn * 14 - wd * 22, -30, 56) * RAD;
    FV.jawA = cl(ch[RI.jaw], 0, 1) * 24 * RAD;
    return FV;
  }
  // the shape's weights of a person for this frame: their own (G.Feicao: the genes, the years, the body) and the face's movements
  // from its channels — the smile (one corner more than the other), the frown, the brows, the sneer, the lips (D-556)
  const SW = new Float32Array(NW * 4), DQ = [0, 0, 0];
  function weightsOf(fe, fv) {
    SW.fill(0); const Fe = G.Feicao; if (!Fe || !Fe.IDX) return; const X0 = Fe.IDX;
    if (fe && fe.w) for (let k = 0; k < fe.w.length && k < SW.length; k++) SW[k] = fe.w[k];
    if (fe && fe.paint) { SW[44] = fe.paint[0]; SW[45] = fe.paint[1]; } else SW[45] = 0.5; // (the freckles, the brows' weight: texel WT + 11)
    SW[46] = Math.min(1, SW[X0.maduro] * 0.35 + SW[X0.velho] * 0.8 + SW[X0.anciao] * 0.6); // (the lines of the years)
    SW[47] = fe ? fe.greyT || 0 : 0; // (the grey of the hair: the brows go with it, D-635)
    const RI = G.Rosto && G.Rosto.IDX; if (!RI) return; const ch = fv.ch, X = Fe.IDX;
    const smi = ch[RI.smile], side = ch[RI.smileSide], pn = ch[RI.pain];
    SW[X.sorrisoE] = Math.max(0, smi) * (1 - 0.6 * side); SW[X.sorrisoD] = Math.max(0, smi) * (1 + 0.6 * side); SW[X.tristeza] = Math.max(0, -smi);
    SW[X.sobeSobr] = ch[RI.browUp] * 0.9 + ch[RI.wide] * 0.3; SW[X.franze] = ch[RI.browIn] + pn * 0.6; SW[X.tristeSobr] = ch[RI.browSad];
    SW[X.nojo] = ch[RI.sneer]; SW[X.bico] = ch[RI.pucker]; SW[X.aperta] = ch[RI.press]; SW[X.estica] = ch[RI.stretch] + pn * 0.5;
  }
  // (where a face bone's hinge is for this person: the jaw's, an eye's — the targets' own displacement there, weighted)
  function pivOf(k) {
    DQ[0] = DQ[1] = DQ[2] = 0; if (!PIV) return DQ; const c = k === 0 ? 2 : k === 1 || k === 3 ? 0 : 1;
    for (let t = 0; t < PIV.length; t++) { const w = SW[t]; if (!w) continue; const q = PIV[t][c]; DQ[0] += w * q[0]; DQ[1] += w * q[1]; DQ[2] += w * q[2]; }
    return DQ;
  }
  // (who has no clothes of their own yet — the fallback's look: a plain tunic)
  const DEF = { sleeve: 0.585, neck: 0, bootTop: 0.11, legs: 1, beltY: 1.01, beltH: 0.017, overK: 0, strap: 0, torso: 0, motif: 0, feetK: 0, hem: 1, cloakTrim: 0, fur: 0, blush: 0,
    lin: { cloth: [0.4, 0.25, 0.12], trim: [0.4, 0.06, 0.04], pants: [0.07, 0.05, 0.04], boots: [0.1, 0.05, 0.03], belt: [0.05, 0.03, 0.02], iris: [0.07, 0.04, 0.02], lips: [0.5, 0.2, 0.18], over: [0.4, 0.25, 0.12], metal: [0.45, 0.25, 0.07], hat: [0.4, 0.25, 0.12], cloak: [0.2, 0.12, 0.06], beads: [0.6, 0.2, 0.03] } };
  function col(j, hex) { K.c.set(hex || '#888888'); buf[j] = K.c.r; buf[j + 1] = K.c.g; buf[j + 2] = K.c.b; buf[j + 3] = 1; }
  function use(name, row) { const M = MESH[name]; if (M && M.n < MAXR) M.rows[M.n++] = row; }
  const LVL = {}, LVN = {}; // (a mesh's name → its levels' meshes, and which level each one really is)
  function useL(name, lv, row) { const a = LVL[name]; if (!a) { use(name, row); return 0; } use(a[lv], row); return LVN[name][lv]; } // (the level used)
  B3.use = use; B3.levels = name => (LVL[name] ? LVL[name].slice() : null);
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
    // (nobody drawn naked: clothes on the trunk or on the hips — a tunic, a dress, an apron-dress; a skirt, a kilt, a
    // loincloth or trousers —, and not of the colour of their own skin)
    for (let r = 0; r < B3.rows; r++) { const w = WORN[r]; if (!w) continue; const why = B3.bare(w[0], w[1]); if (why) { out.push(`corpo ${r}: ${why} (${w[0].sig || 'sem roupa própria'})`); break; } }
    return out;
  };
  // what is bare of a person dressed in u with skin skin: '' if they are dressed, or what is missing
  B3.bare = function (u, skin) {
    if (!K.c) K.c = new THREE.Color();
    K.c.set(skin || '#888888'); const sk = lab(K.c.r, K.c.g, K.c.b);
    const far = c => { const q = lab(c[0], c[1], c[2]); return Math.hypot(q[0] - sk[0], q[1] - sk[1], q[2] - sk[2]) >= 10; }; // (a cloth the colour of the skin is no cloth)
    const trunk = ((u.torso === 0 || !!u.topM) && far(u.lin.cloth)) || (u.overK === 1 && far(u.lin.over));
    const skirtC = u.overK === 1 || u.overK === 3 ? u.lin.over : u.lin.cloth;
    const hips = (!!u.skirt && far(skirtC)) || (u.legs >= 1 && far(u.lin.pants));
    return !trunk && !hips ? 'sem roupa no tronco e nos quadris' : '';
  };
  function lab(r, g, b) { // (linear RGB → CIE L*a*b*, D65)
    const f = t => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
    const X = f((0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.9505), Y = f(0.2126 * r + 0.7152 * g + 0.0722 * b), Z = f((0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.089);
    return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)];
  }
  B3.meshes = () => Object.keys(MESH).map(k => ({ name: k, n: MESH[k].n, tris: MESH[k].tris }));
  B3.layer = n => { for (const k in MESH) MESH[k].mesh.layers.enable(n); }; // (the god's panel's portrait sees the bodies on a layer of its own: Retrato3D, D-645)
  B3.at = row => AT[row]; // (for the verifier: where row's person stands [X, Y, Z, size, hips X, Y, Z, the body's level of detail])
  B3._buf = () => buf; B3._tw = () => TW; // (for the tests: the rows of numbers, read only)
  // (a shader the graphics card refused when it first drew — no error to catch at the start: People3D asks after drawing,
  // and goes back to its pieces)
  B3.broken = function (renderer) {
    if (!B3.ready || !renderer || !renderer.properties) return false;
    for (const m of [mat, depth]) { const pr = renderer.properties.get(m); const prog = pr && pr.currentProgram; if (prog && prog.diagnostics && prog.diagnostics.runnable === false) return true; }
    return false;
  };
})(window.G);
