'use strict';
// ============================================================
//  Build3D: every real building in three dimensions. Each one
//  is drawn from what the world knows of it — its type, its
//  footprint and place (b.x, b.y, b.w, b.h), the style of the
//  people who built it (b.style → Arch.PAL: walls, roofs, trim),
//  the side its door opens to (Vg.door: where people come out),
//  how far its building has got (progress), how hurt it is (hp),
//  its crops, its graves — and on a stone base that meets the
//  slope, so nothing floats and nothing sinks. A small kit of
//  boxes, prisms, columns and cones, put into one geometry per
//  chunk. The city walls and gates, and the aqueducts, too.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const B3 = G.Build3D = {};
  B3.chim = new Map(); G.worldHooks.push(() => B3.chim.clear()); // (the tops of the chimneys drawn: building id → [X, Y, Z])
  let THREE = null, R3 = null, SH = null, glass = null;
  const TAU = Math.PI * 2;
  B3.init = function (three, realm) {
    THREE = three; R3 = realm; SH = realm.SH; glass = new THREE.MeshPhongMaterial({ color: 0x1c2630, specular: 0x8aa0b4, shininess: 90, emissive: 0xffb860, emissiveIntensity: 0 });
    // (a window shows the sky it faces — pale low, deeper above — more as one looks along the wall; at night, its lamp)
    const sk = realm.skyU;
    if (sk) glass.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, { uSkyTop: sk.top, uSkyHor: sk.hor });
      sh.vertexShader = 'varying vec3 vGW;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n vGW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = 'uniform vec3 uSkyTop; uniform vec3 uSkyHor; varying vec3 vGW;\n' + sh.fragmentShader.replace('#include <opaque_fragment>', `
        { vec3 nW = normalize((vec4(normal, 0.0) * viewMatrix).xyz); vec3 Vw = normalize(cameraPosition - vGW); vec3 Rw = reflect(-Vw, nW);
          float fr = 0.08 + 0.92 * pow(1.0 - clamp(abs(dot(nW, Vw)), 0.0, 1.0), 4.0);
          vec3 sky = mix(uSkyHor, uSkyTop, clamp(Rw.y * 1.4, 0.0, 1.0)) * (0.55 + 0.45 * step(0.0, Rw.y));
          outgoingLight = mix(outgoingLight, sky * 0.8, fr * 0.7 * (1.0 - clamp(length(totalEmissiveRadiance) * 1.5, 0.0, 0.9))); }
        #include <opaque_fragment>`);
    };
  };
  // ------------------------------ the surfaces: what walls and roofs are made of ------------------------------
  // (each point of a building carries a pattern — Geo.pat when it was put — and the solid material draws it on the
  // surface, in metres of the world: blocks of stone, planks, courses of tiles, straw, turf; the god's view draws the
  // same with its lines: the planks of a longhouse, the tile courses of a hip roof)
  const PAT = B3.PAT = { plaster: 1, stone: 2, brick: 3, plankV: 4, plankH: 5, tile: 6, shingle: 7, thatch: 8, turf: 9, marble: 10, slab: 11, beam: 12, frame: 13, mud: 14, cloth: 15 };
  // what each people builds with: the walls of a house, its base, its roofs
  const STUFF = {
    classico: { wall: 'frame', base: 'stone', tile: 'tile' }, grego: { wall: 'plaster', base: 'marble', tile: 'tile' }, romano: { wall: 'plaster', base: 'stone', tile: 'tile' },
    egipcio: { wall: 'mud', base: 'stone', tile: 'mud' }, asteca: { wall: 'plaster', base: 'stone', tile: 'thatch' }, nordico: { wall: 'plankV', base: 'stone', tile: 'shingle' },
  };
  const stuff = b => STUFF[styleOf(b)] || STUFF.classico;
  const PFRAG = `
uniform sampler2D uDet; varying vec3 vPP; varying vec3 vPN; varying float vPat;
float pHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec3 pattern(float p, vec2 uv, vec3 wp, out vec2 bump) {
  bump = vec2(0.0);
  vec4 d = texture2D(uDet, uv / 1.7); float big = texture2D(uDet, uv / 11.0).r; float huge = texture2D(uDet, uv / 31.0 + 0.3).r;
  // (the weather on every wall and roof: broad stains, a warmer or cooler patch, streaks the rain ran down)
  float streak = texture2D(uDet, vec2(uv.x * 0.45, uv.y * 0.035) + 0.17).r;
  vec3 wthr = vec3(0.93 + (huge - 0.5) * 0.24) * (1.0 - smoothstep(0.55, 0.8, streak) * 0.13) * mix(vec3(1.03, 1.0, 0.95), vec3(0.96, 0.99, 1.04), big);
  if (p == 1.0) {
    // (plaster: mottled, mended, worn through to the bricks here and there)
    float m = 0.93 + (d.g - 0.5) * 0.16 + (big - 0.5) * 0.22;
    float pk = texture2D(uDet, uv / 13.0 + 0.41).r * 0.75 + texture2D(uDet, uv / 3.1 + 0.2).g * 0.25; float here = step(0.56, texture2D(uDet, uv / 37.0 + 0.7).g);
    float hole = smoothstep(0.66, 0.69, pk) * here;
    vec2 q = uv / vec2(0.42, 0.19); q.x += 0.5 * mod(floor(q.y), 2.0); vec2 f = fract(q); float e = min(min(f.x, 1.0 - f.x) * 0.42, min(f.y, 1.0 - f.y) * 0.19);
    vec3 brick = mix(vec3(0.5, 0.4, 0.35), vec3(0.95, 0.66, 0.5) * (0.85 + pHash(floor(q)) * 0.3), smoothstep(0.012, 0.03, e));
    float rim = smoothstep(0.6, 0.66, pk) * here * (1.0 - hole);
    return mix(vec3(m) * wthr * (1.0 - rim * 0.2), brick, hole);
  }
  if (p == 2.0 || p == 3.0) {
    vec2 sz = p == 2.0 ? vec2(0.9, 0.5) : vec2(0.42, 0.19);
    vec2 q = uv / sz; q.x += 0.5 * mod(floor(q.y), 2.0) + (p == 2.0 ? (pHash(vec2(floor(q.y), 7.0)) - 0.5) * 0.4 : 0.0); vec2 f = fract(q);
    float e = min(min(f.x, 1.0 - f.x) * sz.x, min(f.y, 1.0 - f.y) * sz.y); float m = smoothstep(0.012, 0.032, e); float h = pHash(floor(q));
    bump = vec2(f.x < 0.5 ? -1.0 : 1.0, f.y < 0.5 ? -1.0 : 1.0) * (1.0 - smoothstep(0.0, 0.07, e)) * 0.35;
    // (each block its own: warmer or cooler, now and then a dark one; moss in the joints low on the wall)
    vec3 tn = mix(vec3(1.08, 1.0, 0.9), vec3(0.9, 0.97, 1.08), pHash(floor(q) + 3.1)) * (pHash(floor(q) + 8.3) > 0.9 ? 0.78 : 1.0);
    vec3 joint = mix(vec3(0.5), vec3(0.42, 0.5, 0.32), smoothstep(0.55, 0.75, big) * (p == 2.0 ? 1.0 : 0.3));
    return mix(joint, vec3(0.84 + h * 0.26) * tn, m) * (0.9 + d.g * 0.2) * wthr;
  }
  if (p == 4.0 || p == 5.0 || p == 12.0) {
    float w = p == 5.0 ? 0.3 : 0.24; float a = p == 5.0 ? uv.y : uv.x; float o = p == 5.0 ? uv.x : uv.y;
    float q = a / w; float f = fract(q); float h = pHash(vec2(floor(q), 3.0));
    float seam = p == 12.0 ? 1.0 : smoothstep(0.0, 0.07, f) * smoothstep(0.0, 0.07, 1.0 - f);
    float grain = 0.92 + 0.08 * sin(o * 7.0 + h * 20.0 + sin(o * 1.9 + h * 7.0) * 2.5) + (d.g - 0.5) * 0.08;
    bump = (p == 5.0 ? vec2(0.0, 1.0) : vec2(1.0, 0.0)) * (f - 0.5) * (p == 12.0 ? 0.0 : 0.3);
    // (a plank greyed by the years beside a fresher one; a knot here and there)
    vec3 tn = mix(vec3(1.08, 1.0, 0.9), vec3(0.86, 0.88, 0.92), h * h);
    vec2 kq = vec2(f, o / 0.9 + h * 7.0); vec2 kf = fract(kq) - 0.5; float knot = (1.0 - smoothstep(0.05, 0.12, length(kf * vec2(1.0, 2.8)))) * step(0.72, pHash(floor(kq) + vec2(h, 9.0)));
    return mix(vec3(0.52), vec3(0.84 + h * 0.24) * tn, seam) * grain * (1.0 - knot * 0.45) * wthr;
  }
  if (p == 6.0 || p == 7.0) {
    float rh = p == 6.0 ? 0.34 : 0.26; float rw = p == 6.0 ? 0.26 : 0.36;
    float r = uv.y / rh; float fr = fract(r); float row = floor(r);
    float x = uv.x / rw + (p == 7.0 ? 0.5 * mod(row, 2.0) : 0.0); float fx = fract(x); float h = pHash(vec2(floor(x), row));
    float sh = 0.62 + 0.38 * (1.0 - smoothstep(0.5, 1.0, fr));
    float lat = p == 6.0 ? 0.8 + 0.2 * sin(fx * 3.14159) : mix(0.72, 1.0, smoothstep(0.0, 0.06, fx) * smoothstep(0.0, 0.06, 1.0 - fx));
    bump = vec2(p == 6.0 ? cos(fx * 3.14159) * 0.4 : 0.0, (fr - 0.5) * 0.45);
    // (no two tiles alike, a darker one replaced now and then, moss creeping over the old ones)
    vec3 tn = (1.0 + (h - 0.5) * vec3(0.24, 0.13, 0.06)) * (pHash(vec2(floor(x), row) + 5.0) > 0.92 ? 0.76 : 1.0);
    tn = mix(tn, vec3(0.6, 0.76, 0.42), smoothstep(0.62, 0.78, texture2D(uDet, uv / 5.0 + 0.9).r) * 0.5);
    return vec3(sh * lat * (0.86 + h * 0.22) * (0.94 + d.g * 0.12)) * tn * wthr;
  }
  if (p == 8.0) {
    float r = uv.y / 0.42; float fr = fract(r + (pHash(vec2(floor(uv.x / 0.3), floor(r))) - 0.5) * 0.25);
    float st = texture2D(uDet, vec2(uv.x * 1.9, uv.y * 0.16)).r;
    bump = vec2(0.0, (fr - 0.5) * 0.4);
    return vec3((0.68 + 0.32 * (1.0 - smoothstep(0.45, 1.0, fr))) * (0.76 + st * 0.48)) * mix(vec3(1.05, 1.0, 0.9), vec3(0.84, 0.84, 0.8), big) * wthr;
  }
  if (p == 9.0) {
    // (turf: tufts in rows down the slope, dark in the hollows between them, patches gone straw-brown or mossy, a flower now
    // and then — never one flat green)
    float tuft = texture2D(uDet, vec2(uv.x / 2.4, uv.y / 6.0) + 0.31).r; float fine = texture2D(uDet, uv / 1.2 + 0.6).r;
    float blade = 0.58 + 0.5 * smoothstep(0.32, 0.7, tuft) + (fine - 0.5) * 0.3;
    float dry = smoothstep(0.52, 0.72, texture2D(uDet, uv / 7.0 + 0.13).a) * 0.8; float moss = smoothstep(0.5, 0.72, texture2D(uDet, uv / 5.0 + 0.77).a) * 0.6;
    vec3 c = mix(mix(vec3(0.8, 0.9, 0.64), vec3(1.1, 0.88, 0.56), dry), vec3(0.62, 0.78, 0.6), moss) * blade;
    vec2 fq = floor(uv * 3.0); float fl = step(0.97, pHash(fq)) * (1.0 - smoothstep(0.12, 0.26, length(fract(uv * 3.0) - 0.5)));
    c = mix(c, pHash(fq + 2.0) > 0.5 ? vec3(1.9, 1.75, 1.2) : vec3(1.7, 1.0, 1.45), fl);
    bump = vec2(tuft - 0.5, fine - 0.5) * 0.7;
    return c;
  }
  if (p == 10.0) { float v = sin(uv.x * 2.6 + uv.y * 1.3 + big * 9.0); return vec3(0.97 + 0.03 * v - smoothstep(0.95, 1.0, abs(v)) * 0.09) * mix(vec3(1.0), wthr, 0.5); }
  if (p == 11.0) {
    vec2 q = wp.xz / 1.1; q.x += 0.5 * mod(floor(q.y), 2.0); vec2 f = fract(q); float e = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y));
    return vec3(mix(0.62, 0.88 + pHash(floor(q)) * 0.2, smoothstep(0.01, 0.04, e)) * (0.92 + d.g * 0.16)) * wthr;
  }
  if (p == 13.0) {
    float px = fract(uv.x / 1.35); float py = fract(wp.y / 1.25);
    float post = 1.0 - smoothstep(0.075, 0.1, min(px, 1.0 - px) * 1.35);
    float beam = 1.0 - smoothstep(0.06, 0.085, min(py, 1.0 - py) * 1.25);
    float br = 1.0 - smoothstep(0.05, 0.075, abs(px - py) * 1.2);
    float tim = max(max(post, beam), br * step(0.5, pHash(vec2(floor(uv.x / 1.35), floor(wp.y / 1.25)))));
    return mix(vec3(0.95 + (d.g - 0.5) * 0.12 + (big - 0.5) * 0.14) * wthr, vec3(0.3, 0.26, 0.22), tim);
  }
  if (p == 14.0) {
    vec2 q = uv / vec2(0.5, 0.25); q.x += 0.5 * mod(floor(q.y), 2.0); vec2 f = fract(q); float e = min(min(f.x, 1.0 - f.x) * 0.5, min(f.y, 1.0 - f.y) * 0.25);
    return vec3((0.9 + (d.g - 0.5) * 0.24 + (big - 0.5) * 0.22) * mix(0.88, 1.0, smoothstep(0.004, 0.02, e))) * wthr;
  }
  if (p == 15.0) return vec3(0.9 + 0.1 * sin(uv.x * 5.0));
  return vec3(1.0);
}
`;
  // the solid material learns to draw the patterns (and fades them far away, where they would only shimmer)
  B3.dress = function (mat) {
    mat.onBeforeCompile = sh => {
      sh.uniforms.uDet = { value: G.Ground3D.detail() };
      sh.vertexShader = 'attribute float aP; varying vec3 vPP; varying vec3 vPN; varying float vPat;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n vPP = (modelMatrix * vec4(transformed, 1.0)).xyz; vPN = normalize(mat3(modelMatrix) * objectNormal); vPat = aP;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + PFRAG).replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        float pp = floor(vPat + 0.5);
        #ifdef NOPAT
        pp = 0.0;
        #endif
        if (pp > 0.5) {
          vec3 pn = normalize(vPN); vec3 pt = abs(pn.y) > 0.92 ? vec3(1.0, 0.0, 0.0) : normalize(vec3(-pn.z, 0.0, pn.x)); vec3 pb = normalize(cross(pn, pt)); if (pb.y < 0.0) pb = -pb;
          vec2 bump; vec3 pk = pattern(pp, vec2(dot(vPP, pt), dot(vPP, pb)), vPP, bump);
          float fade = 1.0 - smoothstep(30.0, 90.0, length(vViewPosition));
          diffuseColor.rgb *= mix(vec3(0.88), pk, fade);
          normal = normalize(normal + (viewMatrix * vec4(pt * bump.x + pb * bump.y, 0.0)).xyz * fade);
        }`);
    };
    mat.needsUpdate = true;
  };
  B3.glassMat = () => glass;
  // (the windows light up at night: the hour's light, only seen)
  B3.night = k => { if (glass) glass.emissiveIntensity = k * 0.9; };
  const TL = () => G.Space.TILE, HM = () => G.Space.HM;
  const palOf = b => { const P = G.Arch && G.Arch.PAL || {}; const st = b.style || ((G.Fac.ofSet ? G.Fac.ofSet(b.set) : null) || {}).civ || 'classico'; return P[st] || P.classico || { wl: '#efe2c4', wr: '#d2c19e', base: ['#8a8478', '#6f6a60', '#a09a8e'], roof: ['#b85a3c', '#94452d', '#7a3826'], gable: '#dccba6', trim: '#6b4a30', win: '#2f3a48', door: '#5a3b25', kind: 'gable' }; };
  const styleOf = b => b.style || ((G.Fac.ofSet ? G.Fac.ofSet(b.set) : null) || {}).civ || 'classico';
  const dim = (c, f) => { const r = typeof c === 'string' ? G.hex2rgb(c) : c; return [r[0] * f, r[1] * f, r[2] * f]; };
  // (heights of the buildings, in metres: the camera and the far picture use them too)
  const HEIGHT = { hut: 4.4, house: 5.2, sobrado: 8.4, insula: 14, quarteirao: 15, barraco: 3, storehouse: 6.5, armazem: 7, celeiro: 7, workshop: 5.5, forja: 6, olaria: 5, tecelagem: 5.5, ourives: 5.5, perolaria: 5, sericultura: 5, acougue: 5, temple: 10, monument: 13, estatua: 7, maravilha: 26, palacio: 14, paco: 12, administracao: 9, coletoria: 7, biblioteca: 9, teatro: 7, banhos: 7, cadeia: 6, quartel: 6, torre: 12, taverna: 7.5, mercado: 3.2, feira: 3, mercado_negro: 3, doca: 1.2, mina: 4, apiario: 1.6, curral: 1.4, estabulo: 5, cercado: 1.5, farm: 1, horta: 0.8, plantacao: 1.2, vinhedo: 1.8, pomar: 4, well: 2.6, campfire: 0.6, cemetery: 1.2, praca: 3, aqueduto: 7, ruin: 2.5 };
  B3.height = b => HEIGHT[b.type] || 5;

  // ------------------------------ the kit ------------------------------
  // (everything in metres, from the corner of the footprint: a building is a little world of its own, then put in place)
  function kit(g, b, gp, gq) {
    const L = TL(); const x0 = b.x * L, z0 = b.y * L, w = b.w * L, d = b.h * L;
    // the ground under the footprint: the base stands on the lowest point and reaches the highest
    let lo = 1e9, hi = -1e9; for (let ty = b.y; ty <= b.y + b.h; ty++) for (let tx = b.x; tx <= b.x + b.w; tx++) { const h = W.hAt(Math.min(N, tx), Math.min(N, ty)) * HM(); lo = Math.min(lo, h); hi = Math.max(hi, h); }
    // (the floor: a house stands on a plinth, as the god's view draws it; a field, a fence, a square lies on the ground — L-105)
    const BASELESS = { farm: 1, horta: 1, plantacao: 1, vinhedo: 1, doca: 1, praca: 1, cemetery: 1, curral: 1, cercado: 1, campfire: 1 };
    const y0 = hi + (BASELESS[b.type] ? 0.12 : 0.4);
    g.ao = () => lo; // (its walls darken toward the ground)
    const P = palOf(b); const hurt = b.maxHp ? G.clamp(b.hp / b.maxHp, 0, 1) : 1; const soot = hurt < 0.6 ? 0.55 + hurt * 0.75 : 1;
    const c = cc => (soot < 1 ? dim(cc, soot) : cc);
    const K = {
      g, b, P, L, x0, z0, w, d, y0, lo, hi, cx: x0 + w / 2, cz: z0 + d / 2, c, built: b.built, prog: b.built ? 1 : G.clamp(b.progress || 0, 0, 1), hurt,
      gp: gp || R3.Geo(), gq: gq || R3.WGeo(), // (the plants that sway, and the water of a paddy)
      box(x, y, z, sx, sy, sz, col, ry) { g.put(SH.box, R3.mat(x0 + x, y0 + y, z0 + z, ry || 0, sx, sy, sz), c(col)); },
      cyl(x, y, z, r, h, col, top) { g.put(SH.cyl, R3.mat(x0 + x, y0 + y, z0 + z, 0, r * 2, h, r * 2), c(col)); void top; },
      cone(x, y, z, r, h, col) { g.put(SH.cone, R3.mat(x0 + x, y0 + y, z0 + z, 0, r * 2, h, r * 2), c(col)); },
      sph(x, y, z, r, col, sy) { g.put(SH.sph, R3.mat(x0 + x, y0 + y, z0 + z, 0, r * 2, (sy || r) * 2, r * 2), c(col)); },
      gable(x, y, z, sx, h, sz, col, alongZ) { g.put(SH.gable, R3.mat(x0 + x, y0 + y, z0 + z, alongZ ? Math.PI / 2 : 0, alongZ ? sz : sx, h, alongZ ? sx : sz), c(col)); },
      hip(x, y, z, sx, h, sz, col) { g.put(SH.hip, R3.mat(x0 + x, y0 + y, z0 + z, 0, sx, h, sz), c(col)); },
      // a box turned on its own axes (ry, then rx, then rz), its base at (x, y, z)
      rbox(x, y, z, sx, sy, sz, col, ry, rx, rz) { g.put(SH.box, R3.mat(x0 + x, y0 + y, z0 + z, ry || 0, sx, sy, sz, rx || 0, rz || 0), c(col)); },
      // a triangle (and a quad) in the building's frame, turned to face 'out' (a direction), so it is seen from outside
      tri(a, b2, d2, col, out) { const A = [x0 + a[0], y0 + a[1], z0 + a[2]], B = [x0 + b2[0], y0 + b2[1], z0 + b2[2]], D = [x0 + d2[0], y0 + d2[1], z0 + d2[2]];
        const ux = B[0] - A[0], uy = B[1] - A[1], uz = B[2] - A[2], vx = D[0] - A[0], vy = D[1] - A[1], vz = D[2] - A[2]; const n = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
        if (out && n[0] * out[0] + n[1] * out[1] + n[2] * out[2] < 0) g.tri(A, D, B, c(col)); else g.tri(A, B, D, c(col)); },
      quad(a, b2, d2, e, col, out) { K.tri(a, b2, d2, col, out); K.tri(a, d2, e, col, out); },
      // the pattern of what is put next (Build3D.PAT), and back to plain after fn
      as(pat, fn) { const o = g.pat; g.pat = PAT[pat] || 0; fn(); g.pat = o; },
    };
    // the base: stone from the lowest ground up to the floor (on a slope it shows; on flat ground it is a step)
    if (!BASELESS[b.type])
      K.as(stuff(b).base, () => g.put(SH.box, R3.mat(x0 + w / 2, lo - 0.2, z0 + d / 2, 0, w - 0.2, y0 - lo + 0.2, d - 0.2), c(P.base ? P.base[0] : '#8a8478')));
    return K;
  }
  // which side the door opens to (the side people come out of — the world's own door)
  function doorSide(b) {
    const dr = G.Vg.door(b); const cx = b.x + b.w / 2, cy = b.y + b.h / 2; const dx = dr[0] - cx, dy = dr[1] - cy;
    return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'E' : 'W') : (dy > 0 ? 'S' : 'N');
  }
  B3.doorSide = doorSide;
  // windows and a door on the walls of a box-shaped house: panes (lit at night) in frames of the people's trim, a sill
  // under each, shutters on the houses of the classical lands; the door of planks in its frame, a step before it
  function openings(g, gw, K, x, z, sx, sz, y, h, floors, door) {
    const side = doorSide(K.b); const P = K.P; const fh = h / floors; const st = styleOf(K.b);
    const framed = st !== 'nordico' && st !== 'egipcio'; const shut = st === 'classico' && K.b.type !== 'insula'; const tc = st === 'asteca' ? (P.trim2 || P.trim) : (P.trim || '#6b4a30');
    // (a window on the face whose outward direction is (ox, oz), at (px, py, pz), ww wide and hh high)
    const win = (px, py, pz, ox, oz, ww, hh) => {
      const ax = oz !== 0; // (the face runs along X)
      gw.put(SH.box, R3.mat(K.x0 + px + ox * 0.03, K.y0 + py, K.z0 + pz + oz * 0.03, ax ? 0 : Math.PI / 2, ww, hh, 0.06), '#2a3440');
      const fx = (dx, dy, w2, h2, d2) => K.box(px + ox * 0.06 + (ax ? dx : 0), py + dy, pz + oz * 0.06 + (ax ? 0 : dx), ax ? w2 : d2, h2, ax ? d2 : w2, tc);
      if (framed) { fx(0, -0.08, ww + 0.2, 0.08, 0.1); fx(0, hh, ww + 0.2, 0.09, 0.1); fx(-ww / 2 - 0.05, 0, 0.09, hh, 0.1); fx(ww / 2 + 0.05, 0, 0.09, hh, 0.1); fx(0, 0, 0.05, hh, 0.07); }
      K.box(px + ox * 0.1, py - 0.14, pz + oz * 0.1, ax ? ww + 0.3 : 0.2, 0.08, ax ? 0.2 : ww + 0.3, P.base ? P.base[2] : '#a09a8e');
      if (shut) K.as('plankV', () => { for (const s2 of [-1, 1]) fx(s2 * (ww / 2 + 0.3), 0, ww * 0.5, hh, 0.05); });
    };
    for (let f = 0; f < floors; f++) {
      const wy = y + f * fh + fh * 0.36, wh = Math.min(1.15, fh * 0.38);
      const nx = Math.max(1, Math.floor(sx / 2.3)), nz = Math.max(1, Math.floor(sz / 2.3));
      for (let k = 0; k < nx; k++) { const px = x - sx / 2 + sx * (k + 0.5) / nx; if (!(f === 0 && side === 'S' && k === Math.floor(nx / 2))) win(px, wy, z + sz / 2, 0, 1, 0.72, wh); if (!(f === 0 && side === 'N' && k === Math.floor(nx / 2))) win(px, wy, z - sz / 2, 0, -1, 0.72, wh); }
      for (let k = 0; k < nz; k++) { const pz = z - sz / 2 + sz * (k + 0.5) / nz; if (!(f === 0 && side === 'E' && k === Math.floor(nz / 2))) win(x + sx / 2, wy, pz, 1, 0, 0.72, wh); if (!(f === 0 && side === 'W' && k === Math.floor(nz / 2))) win(x - sx / 2, wy, pz, -1, 0, 0.72, wh); }
    }
    if (door === false) return;
    const dc = P.door || '#5a3b25', dw = 1.0, dh = Math.min(2.1, fh * 0.82);
    const o = { S: [0, 1], N: [0, -1], E: [1, 0], W: [-1, 0] }[side]; const ax = o[1] !== 0;
    const dx = x + o[0] * (sx / 2), dz = z + o[1] * (sz / 2);
    K.as('plankV', () => K.box(dx + o[0] * 0.03, y, dz + o[1] * 0.03, ax ? dw : 0.1, dh, ax ? 0.1 : dw, dc));
    // (its frame and lintel, and the step)
    const tr = P.trim || '#6b4a30';
    K.as('beam', () => { for (const s2 of [-1, 1]) K.box(dx + o[0] * 0.07 + (ax ? s2 * (dw / 2 + 0.07) : 0), y, dz + o[1] * 0.07 + (ax ? 0 : s2 * (dw / 2 + 0.07)), ax ? 0.14 : 0.14, dh, 0.14, tr); K.box(dx + o[0] * 0.08, y + dh, dz + o[1] * 0.08, ax ? dw + 0.42 : 0.18, 0.2, ax ? 0.18 : dw + 0.42, tr); });
    K.as('stone', () => K.box(dx + o[0] * 0.45, -0.4, dz + o[1] * 0.45, ax ? dw + 0.5 : 0.7, 0.42, ax ? 0.7 : dw + 0.5, P.base ? P.base[2] : '#a09a8e'));
  }
  // a roof of the people's kind over a box of sx × sz (centre x, z) whose walls end at y: gable, hip, flat with its
  // parapet, thatch or turf — with the god's pitches (the roof of a cottage is as tall as its walls), eaves that stand
  // out, the ends of a gable closed in the wall's colour, a ridge; the pattern of its tiles, straw or grass
  function roofOf(K, x, z, sx, sz, y, kind, cols) {
    const P = K.P; const r = cols || P.roof || ['#b85a3c', '#94452d', '#7a3826']; kind = kind || P.kind || 'gable';
    const st = stuff(K.b); const ov = 0.42, alongZ = sz > sx + 0.01 || (K.b.v === 1 && Math.abs(sx - sz) < 0.01);
    if (kind === 'flat') {
      K.as(st.tile === 'mud' ? 'mud' : 'slab', () => K.box(x, y, z, sx + 0.12, 0.25, sz + 0.12, P.top || P.wl));
      const pc = (P.par && P.par[0]) || P.wl;
      K.as(st.wall, () => { for (const [px, pz, a, bb] of [[x, z - sz / 2, sx + 0.12, 0.25], [x, z + sz / 2, sx + 0.12, 0.25], [x - sx / 2, z, 0.25, sz], [x + sx / 2, z, 0.25, sz]]) K.box(px, y + 0.25, pz, a, 0.6, bb, pc); });
      return y + 0.85;
    }
    const L = alongZ ? sz : sx, D = alongZ ? sx : sz; // (along the ridge, and across it)
    const pitch = kind === 'turf' ? 1.25 : kind === 'thatch' ? 1.05 : (P.pitch || 0.8);
    const h = Math.min(4.6, D * pitch * 0.82);
    const pat = kind === 'thatch' ? 'thatch' : kind === 'turf' ? 'turf' : st.tile === 'mud' ? 'tile' : st.tile;
    const col = kind === 'thatch' ? ((P.thatch && P.thatch[0]) || '#c8a85a') : r[0];
    // (a point in the roof's frame — u along the ridge, v across it — to the building's)
    const at = (u, yy, v) => alongZ ? [x + v, yy, z + u] : [x + u, yy, z + v];
    if (kind === 'hip') {
      const e = ov; const U = L / 2 + e, V = D / 2 + e; const ru = Math.max(0, U - V); const yt = y + h + 0.15, yb = y - e * (h / (D / 2)) + 0.15;
      K.as(pat, () => {
        K.quad(at(-U, yb, V), at(U, yb, V), at(ru, yt, 0), at(-ru, yt, 0), col, alongZ ? [1, 1, 0] : [0, 1, 1]);
        K.quad(at(U, yb, -V), at(-U, yb, -V), at(-ru, yt, 0), at(ru, yt, 0), col, alongZ ? [-1, 1, 0] : [0, 1, -1]);
        K.tri(at(U, yb, V), at(U, yb, -V), at(ru, yt, 0), col, alongZ ? [0, 1, 1] : [1, 1, 0]);
        K.tri(at(-U, yb, -V), at(-U, yb, V), at(-ru, yt, 0), col, alongZ ? [0, 1, -1] : [-1, 1, 0]);
      });
      // (the underside of the eaves, dark)
      K.box(x, yb - 0.06, z, (alongZ ? D : L) + e * 2, 0.06, (alongZ ? L : D) + e * 2, dim(col, 0.55));
      if (ru > 0.1) K.as('beam', () => K.rbox(...at(0, yt - 0.06, 0), alongZ ? 0.22 : ru * 2 + 0.2, 0.16, alongZ ? ru * 2 + 0.2 : 0.22, r[2] || dim(col, 0.7)));
      return y + h;
    }
    // a gable: two slabs from the ridge down past the walls, the two ends closed, a ridge beam
    const half = D / 2, ang = Math.atan2(h, half), sl = Math.hypot(half, h), T = kind === 'thatch' ? 0.42 : kind === 'turf' ? 0.32 : 0.18;
    const run = sl + ov / Math.cos(ang); const eu = L / 2 + ov * 0.8;
    for (const sd of [-1, 1]) {
      // (the slab's base runs from the ridge outwards and down; centre half-way)
      const cv = sd * Math.cos(ang) * run / 2, cy = y + h - Math.sin(ang) * run / 2;
      const p = at(0, cy, cv);
      // (the slab's own frame: X along the ridge, Z down the slope — turned a quarter round when the ridge runs along Z)
      K.as(pat, () => K.rbox(p[0], p[1], p[2], eu * 2, T, run, col, alongZ ? Math.PI / 2 : 0, sd * ang));
    }
    // (the gable ends: triangles of wall up to the ridge, in the people's gable colour)
    const gc = kind === 'turf' || styleOf(K.b) === 'nordico' ? P.gable || P.wr : P.gable || P.wl;
    K.as(stuff(K.b).wall === 'frame' ? 'plaster' : stuff(K.b).wall, () => { for (const e of [-1, 1]) K.tri(at(e * L / 2, y, -half), at(e * L / 2, y, half), at(e * L / 2, y + h, 0), gc, alongZ ? [0, 0, e] : [e, 0, 0]); });
    K.as('beam', () => K.rbox(...at(0, y + h + T * 0.5, 0), alongZ ? 0.26 : eu * 2 + 0.1, 0.24, alongZ ? eu * 2 + 0.1 : 0.26, kind === 'turf' ? '#5a4430' : (r[2] || dim(col, 0.7))));
    // (the barge boards along the ends of the slopes)
    if (kind !== 'thatch') K.as('beam', () => { for (const e of [-1, 1]) for (const sd of [-1, 1]) { const p = at(e * eu, y + h - Math.sin(ang) * run / 2, sd * Math.cos(ang) * run / 2); K.rbox(p[0], p[1] + T * 0.6, p[2], 0.1, 0.2, run, P.trim || '#6b4a30', alongZ ? Math.PI / 2 : 0, sd * ang); } });
    // (a turf roof: grass at its eaves and on its ridge; a longhouse's dragon heads at the ends of the ridge)
    if (kind === 'turf') {
      for (const sd of [-1, 1]) for (let k = 0; k <= 12; k++) { const u = -eu + 2 * eu * k / 12; const p = at(u, y - ov * Math.tan(ang) + T, sd * (half + ov * 0.95)); const q = K.x0 + p[0], qz = K.z0 + p[2], qy = K.y0 + p[1];
        for (let b2 = 0; b2 < 3; b2++) { const a = G.hash(K.b.id * 31 + k * 7 + b2 + sd * 3) * TAU; K.gp.blade(q, qy, qz, 0.1, a, q + Math.cos(a) * 0.12, qy + 0.32, qz + Math.sin(a) * 0.12, [70, 96, 40], [136, 168, 82], 0.7); } }
      for (let k = 0; k <= 10; k++) { const p = at(-eu + 2 * eu * k / 10, y + h + T, 0); for (let b2 = 0; b2 < 2; b2++) { const a = G.hash(K.b.id * 13 + k * 5 + b2) * TAU; K.gp.blade(K.x0 + p[0], K.y0 + p[1], K.z0 + p[2], 0.1, a, K.x0 + p[0] + Math.cos(a) * 0.1, K.y0 + p[1] + 0.34, K.z0 + p[2] + Math.sin(a) * 0.1, [80, 108, 46], [150, 180, 90], 0.7); } }
      for (const e of [-1, 1]) { const p = at(e * (eu + 0.05), y + h + 0.1, 0); const dir = alongZ ? [0, e] : [e, 0];
        K.rbox(p[0], p[1], p[2], 0.16, 1.0, 0.16, '#3a2616', 0, alongZ ? e * 0.5 : 0, alongZ ? 0 : -e * 0.5);
        K.sph(p[0] + dir[0] * 0.55, p[1] + 0.95, p[2] + dir[1] * 0.55, 0.17, '#3a2616', 0.13); }
    }
    return y + h;
  }
  // a plain house body: walls, windows, door, roof — the base of most buildings; the walls of the people's stuff
  // (half-timber in the classical lands, plaster, mud brick, planks), floors between the storeys, a chimney
  function house(g, gw, K, o) {
    o = o || {}; const P = K.P; const inset = o.inset === undefined ? 0.35 : o.inset;
    const sx = K.w - inset * 2, sz = K.d - inset * 2, x = K.w / 2, z = K.d / 2; const floors = o.floors || 1; const h = (o.h || 2.6) * floors;
    const built = K.prog; const st = stuff(K.b);
    const wallsH = h * (built < 1 ? G.clamp(built / 0.8, 0.08, 1) : 1);
    K.as(o.pat || (o.wall ? 'plaster' : st.wall), () => K.box(x, 0, z, sx, wallsH, sz, o.wall || (K.b.v === 2 ? P.wr : P.wl)));
    // (the posts at the corners of a timber frame; floors between the storeys, a band of trim)
    if (st.wall === 'frame' && !o.wall && !o.pat) K.as('beam', () => { for (const [px, pz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) K.box(x + px * (sx / 2 - 0.08), 0, z + pz * (sz / 2 - 0.08), 0.24, wallsH, 0.24, P.trim || '#6b4a30'); K.box(x, 0, z, sx + 0.06, 0.24, sz + 0.06, P.trim || '#6b4a30'); });
    K.as('beam', () => { for (let f = 1; f < floors && wallsH > f * h / floors; f++) K.box(x, f * h / floors - 0.12, z, sx + 0.14, 0.24, sz + 0.14, P.trim || '#6b4a30'); });
    if (built < 1) { scaffold(K, x, z, sx, sz, h); return h; }
    K.as('beam', () => K.box(x, h - 0.2, z, sx + 0.1, 0.2, sz + 0.1, P.trim || '#6b4a30'));
    openings(g, gw, K, x, z, sx, sz, 0, h, floors, o.door);
    const top = o.noRoof ? h : roofOf(K, x, z, sx, sz, h, o.roof, o.roofCols);
    // (the flat roofs of the south, as the god draws them: the Egyptian house with its awning of cloth and its wind-catcher,
    // the Aztec one with a band of colour under the parapet and pots of plants on the terrace)
    const civ = styleOf(K.b);
    if (!o.noRoof && (o.roof || P.kind) === 'flat' && K.b.type !== 'cadeia') {
      if (civ === 'egipcio') {
        K.as('beam', () => { for (const [px, pz] of [[-0.3, -0.25], [0.05, -0.25], [0.05, 0.2], [-0.3, 0.2]]) K.box(x + px * sx, h + 0.25, z + pz * sz, 0.1, 1.5, 0.1, '#7a5a3a'); });
        K.as('cloth', () => K.rbox(x - 0.12 * sx, h + 1.72, z - 0.02 * sz, sx * 0.42, 0.05, sz * 0.52, '#e8e0c8', 0, 0.08));
        K.as(stuff(K.b).wall, () => { K.box(x + 0.3 * sx, h + 0.25, z - 0.28 * sz, 0.7, 1.6, 0.7, P.wl); }); K.box(x + 0.3 * sx, h + 1.1, z - 0.28 * sz + 0.36, 0.5, 0.55, 0.04, '#3a2a1c');
      } else if (civ === 'asteca') {
        K.as('plaster', () => K.box(x, h - 0.35, z, sx + 0.08, 0.3, sz + 0.08, P.trim || '#b33a2a'));
        for (let k = 0; k < 3; k++) { const px = x - sx * 0.3 + k * sx * 0.3, pz = z + sz * 0.3; K.as('mud', () => K.cyl(px, h + 0.25, pz, 0.22, 0.32, '#b8683a')); K.gp.blade(K.x0 + px, K.y0 + h + 0.55, K.z0 + pz, 0.18, k, K.x0 + px + 0.1, K.y0 + h + 1.05, K.z0 + pz, [70, 120, 50], k % 2 ? [90, 160, 70] : [224, 90, 122], 0.5); K.gp.blade(K.x0 + px, K.y0 + h + 0.55, K.z0 + pz, 0.18, k + 1.6, K.x0 + px - 0.12, K.y0 + h + 0.95, K.z0 + pz + 0.05, [70, 120, 50], [96, 164, 72], 0.5); }
      }
    }
    if (o.chimney) { K.as('stone', () => { const cx = x + sx * 0.28, cz = z - sz * 0.18; K.box(cx, h * 0.6, cz, 0.62, top - h * 0.6 + 0.8, 0.62, P.base ? P.base[1] : '#6f6a60'); K.box(cx, top + 0.8, cz, 0.78, 0.14, 0.78, P.base ? P.base[0] : '#8a8478'); });
      B3.chim.set(K.b.id, [K.x0 + x + sx * 0.28, K.y0 + top + 0.95, K.z0 + z - sz * 0.18]); } // (where its smoke comes out: FX3D)
    return top;
  }
  // the longhouse of the northern people (the god's view: low planked walls, a tall roof of turf on them, dragon
  // heads at the ends of the ridge, the door in the long side); f: its length and walls grow with the storeys
  function longhouse(g, gw, K, f) {
    const P = K.P; f = f || 1; const sx = Math.min(K.w - 0.4, K.w * (0.84 + f * 0.04)), sz = K.d * 0.64, x = K.w / 2, z = K.d / 2; const h = 1.7 + f * 0.45;
    const along = K.w >= K.d; const lx = along ? sx : sz, lz = along ? sz : sx;
    if (K.prog < 1) { scaffold(K, x, z, lx, lz, h + 2); return; }
    K.as('plankV', () => K.box(x, 0, z, lx, h, lz, P.wl));
    K.as('beam', () => { K.box(x, h - 0.25, z, lx + 0.1, 0.25, lz + 0.1, P.trim || '#a23c2a'); for (const [px, pz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) K.box(x + px * (lx / 2 - 0.1), 0, z + pz * (lz / 2 - 0.1), 0.26, h, 0.26, P.wr); });
    openings(g, gw, K, x, z, lx, lz, 0, h + 0.3, 1);
    const top = roofOf(K, x, z, lx, lz, h, 'turf');
    return top;
  }
  // a building going up: the poles of the scaffold, a pile of wood
  function scaffold(K, x, z, sx, sz, h) {
    for (const [px, pz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) K.box(x + px * (sx / 2 + 0.3), 0, z + pz * (sz / 2 + 0.3), 0.15, h + 0.6, 0.15, '#8a6a44');
    K.box(x, h * 0.55, z + sz / 2 + 0.3, sx + 0.6, 0.1, 0.5, '#9a7a50');
    K.box(x + sx / 2 + 0.9, 0, z, 1.2, 0.5, 0.8, '#a07a48');
  }
  // columns in a row
  function colonnade(K, x0, z0, x1, z1, n, h, r, col) { for (let k = 0; k < n; k++) { const f = n === 1 ? 0.5 : k / (n - 1); K.cyl(x0 + (x1 - x0) * f, 0, z0 + (z1 - z0) * f, r, h, col); } }
  function fence(K, x0, z0, x1, z1, h, col) {
    const len = Math.hypot(x1 - x0, z1 - z0); const n = Math.max(2, Math.round(len / 1.6));
    for (let k = 0; k <= n; k++) { const f = k / n; K.box(x0 + (x1 - x0) * f, 0, z0 + (z1 - z0) * f, 0.14, h, 0.14, col); }
    const a = Math.atan2(z1 - z0, x1 - x0);
    for (const yy of [h * 0.45, h * 0.85]) K.box((x0 + x1) / 2, yy, (z0 + z1) / 2, len, 0.09, 0.07, col, -a);
  }
  function fenceAround(K, h, col, gate) {
    const w = K.w, d = K.d, e = 0.25;
    fence(K, e, e, w - e, e, h, col); fence(K, w - e, e, w - e, d - e, h, col); fence(K, e, e, e, d - e, h, col);
    if (gate) { fence(K, e, d - e, w / 2 - 1, d - e, h, col); fence(K, w / 2 + 1, d - e, w - e, d - e, h, col); } else fence(K, e, d - e, w - e, d - e, h, col);
  }
  // ------------------------------ the types ------------------------------
  const KIT = {
    hut(g, gw, K) {
      const P = K.P; const r = K.w * 0.36;
      if (styleOf(K.b) === 'nordico') return longhouse(g, gw, K, 0.6);
      if (K.prog < 1) { scaffold(K, K.w / 2, K.d / 2, r * 2, r * 2, 2.4); return; }
      // (the round hut: a wall of plaster or mud, a cone of straw over it)
      K.as(stuff(K.b).wall === 'frame' ? 'plaster' : stuff(K.b).wall, () => K.cyl(K.w / 2, 0, K.d / 2, r, 2.3, P.wl));
      K.as('thatch', () => g.put(SH.cone, R3.mat(K.x0 + K.w / 2, K.y0 + 2.1, K.z0 + K.d / 2, 0, r * 2.7, 2.6, r * 2.7), K.c((P.thatch && P.thatch[0]) || '#c8a85a')));
      openings(g, gw, K, K.w / 2, K.d / 2, r * 1.9, r * 1.9, 0, 2.3, 1);
    },
    house(g, gw, K) { if (styleOf(K.b) === 'nordico') return longhouse(g, gw, K, 1); const st = styleOf(K.b); house(g, gw, K, { chimney: st === 'classico' || st === 'romano' || K.b.v === 1 }); },
    sobrado(g, gw, K) { if (styleOf(K.b) === 'nordico') return longhouse(g, gw, K, 2); house(g, gw, K, { floors: 2, h: 2.7, roof: K.P.kind === 'flat' ? 'flat' : K.P.kind === 'hip' ? 'hip' : undefined, inset: 0.25, chimney: styleOf(K.b) === 'classico' }); },
    insula(g, gw, K) { if (styleOf(K.b) === 'nordico') return longhouse(g, gw, K, 3); house(g, gw, K, { floors: styleOf(K.b) === 'romano' ? 4 : 3, h: 2.8, roof: K.P.kind === 'flat' || styleOf(K.b) === 'romano' ? 'flat' : undefined, inset: 0.15 }); },
    quarteirao(g, gw, K) { house(g, gw, K, { floors: 4, h: 2.9, roof: K.P.kind === 'flat' ? 'flat' : 'hip', inset: 0.3 }); },
    barraco(g, gw, K) {
      const sx = K.w * 0.7, sz = K.d * 0.6;
      K.box(K.w / 2, 0, K.d / 2, sx, 2.1, sz, ['#8a7a5a', '#7a6a4a', '#9a8a6a'][K.b.v || 0]);
      g.put(SH.box, R3.mat(K.x0 + K.w / 2, K.y0 + 2.1, K.z0 + K.d / 2, 0, sx + 0.4, 0.12, sz + 0.5, 0.18), '#6a6a6a');
      openings(g, gw, K, K.w / 2, K.d / 2, sx, sz, 0, 2.1, 1);
    },
    storehouse(g, gw, K) { const t = house(g, gw, K, { h: 3.8, inset: 0.4 }); void t; if (K.prog >= 1) for (let k = 0; k < 3; k++) K.box(K.w * 0.15, 0, K.d * (0.25 + k * 0.25), 0.9, 0.9, 0.9, '#9a7a4a'); },
    armazem(g, gw, K) { KIT.storehouse(g, gw, K); },
    celeiro(g, gw, K) { house(g, gw, K, { h: 4, inset: 0.4, wall: '#9a4a32', pat: 'plankV' }); },
    workshop(g, gw, K) { house(g, gw, K, { h: 3.2, chimney: true }); if (K.prog >= 1) { K.box(K.w * 0.8, 0, K.d - 0.6, 1.6, 0.9, 0.8, '#8a6a44'); } },
    forja(g, gw, K) { house(g, gw, K, { h: 3.3, chimney: true, wall: K.P.base ? K.P.base[2] : '#a09a8e', pat: 'stone' }); if (K.prog >= 1) { K.box(K.w * 0.2, 0, K.d - 0.6, 0.8, 0.8, 0.6, '#3a3a3e'); K.box(K.w * 0.2, 0.8, K.d - 0.6, 1, 0.15, 0.4, '#4a4a50'); } },
    olaria(g, gw, K) { house(g, gw, K, { h: 3 }); if (K.prog >= 1) K.sph(K.w * 0.25, 0.2, K.d * 0.75, 1.1, '#b86a44', 0.9); },
    tecelagem(g, gw, K) { house(g, gw, K, { h: 3.2 }); if (K.prog >= 1) for (const [cc, k] of [['#c8483a', 0], ['#3f6fb0', 1], ['#e8b83a', 2]]) K.box(K.w * (0.25 + k * 0.25), 2.2, K.d - 0.3, 0.9, 1.4, 0.05, cc); },
    ourives(g, gw, K) { house(g, gw, K, { h: 3.2, wall: K.P.wr }); },
    perolaria(g, gw, K) { house(g, gw, K, { h: 3 }); },
    sericultura(g, gw, K) { house(g, gw, K, { h: 3 }); },
    acougue(g, gw, K) { house(g, gw, K, { h: 3 }); if (K.prog >= 1) K.box(K.w * 0.75, 1.6, K.d - 0.3, 1.2, 0.08, 0.08, '#6a4a30'); },
    taverna(g, gw, K) { house(g, gw, K, { floors: 2, h: 2.9, chimney: true }); if (K.prog >= 1) { for (let k = 0; k < 2; k++) K.cyl(K.w * (0.2 + k * 0.18), 0, K.d - 0.5, 0.42, 0.95, '#7a5030'); K.box(K.w * 0.82, 2.6, K.d - 0.15, 0.9, 0.6, 0.06, '#c89a4a'); } },
    temple(g, gw, K) {
      const st = styleOf(K.b); const P = K.P;
      if (K.prog < 1) { scaffold(K, K.w / 2, K.d / 2, K.w - 1, K.d - 1, 5); return; }
      if (st === 'asteca' || st === 'maia' || st === 'inca') { K.as('stone', () => { for (let k = 0; k < 4; k++) { const s = (K.w - 0.5) * (1 - k * 0.2); K.box(K.w / 2, k * 1.6, K.d / 2, s, 1.6, s, P.base ? P.base[k % 2] : '#b9ad93'); } }); K.as('plaster', () => K.box(K.w / 2, 6.4, K.d / 2, K.w * 0.3, 2, K.d * 0.3, P.wl)); K.as('stone', () => K.box(K.w / 2, 0.8, K.d - 0.6, 1.2, 0.2, 2.6, P.trim || '#b33a2a')); return; }
      if (st === 'egipcio') { K.as('stone', () => K.box(K.w / 2, 0, K.d / 2, K.w - 0.6, 6, K.d - 0.6, P.wl)); K.box(K.w / 2, 6, K.d / 2, K.w - 0.4, 0.5, K.d - 0.4, P.trim || '#2f8f8a'); K.as('plankV', () => K.box(K.w / 2, 0, K.d - 0.25, 1.6, 3.4, 0.2, P.door || '#3e2e1c')); K.as('stone', () => { for (const s of [-1, 1]) K.box(K.w / 2 + s * 2.6, 0, K.d + 0.4, 0.6, 7.5, 0.6, P.wr); }); return; }
      if (st === 'nordico') { house(g, gw, K, { h: 3.4, roof: 'turf', inset: 0.3 }); return; }
      // the classical temple: steps, columns all round, a pediment roof
      K.as('stone', () => { K.box(K.w / 2, 0, K.d / 2, K.w - 0.3, 0.4, K.d - 0.3, P.base ? P.base[1] : '#8a8478'); K.box(K.w / 2, 0.4, K.d / 2, K.w - 0.8, 0.4, K.d - 0.8, P.base ? P.base[2] : '#a09a8e'); });
      const cs = (P.col && P.col[0]) || '#fbf6ea'; const hh = 5.6;
      K.as('marble', () => { K.box(K.w / 2, 0.8, K.d / 2, K.w - 3.2, hh, K.d - 3.2, P.wl); colonnade(K, 1, 1, K.w - 1, 1, 4, hh, 0.32, cs); colonnade(K, 1, K.d - 1, K.w - 1, K.d - 1, 4, hh, 0.32, cs); colonnade(K, 1, 1, 1, K.d - 1, 4, hh, 0.32, cs); colonnade(K, K.w - 1, 1, K.w - 1, K.d - 1, 4, hh, 0.32, cs);
        K.box(K.w / 2, 0.8 + hh, K.d / 2, K.w - 1.2, 0.5, K.d - 1.2, P.gable || P.wl); });
      // (the pediment and its roof of tiles)
      K.as('tile', () => roofOf(K, K.w / 2, K.d / 2, K.w - 1.6, K.d - 1.6, 1.3 + hh, 'gable', P.roof));
    },
    monument(g, gw, K) {
      const P = K.P; if (K.prog < 1) { scaffold(K, K.w / 2, K.d / 2, 3, 3, 6); return; }
      K.box(K.w / 2, 0, K.d / 2, 3.4, 1, 3.4, P.base ? P.base[0] : '#8a8478');
      g.put(SH.cone, R3.mat(K.x0 + K.w / 2, K.y0 + 1, K.z0 + K.d / 2, Math.PI / 4, 2.2, 12, 2.2), K.c(P.wl)); // (an obelisk: a needle of stone)
    },
    estatua(g, gw, K) {
      const P = K.P; K.box(K.w / 2, 0, K.d / 2, 2.2, 2, 2.2, P.base ? P.base[0] : '#8a8478');
      const s = '#d8d4c8'; K.box(K.w / 2, 2, K.d / 2, 0.8, 2.4, 0.5, s); K.sph(K.w / 2, 4.75, K.d / 2, 0.42, s); K.box(K.w / 2 + 0.55, 3.5, K.d / 2, 0.25, 1.4, 0.25, s);
    },
    maravilha(g, gw, K) {
      const P = K.P; if (K.prog < 1) { scaffold(K, K.w / 2, K.d / 2, K.w - 1, K.d - 1, 10); return; }
      const st = styleOf(K.b);
      if (st === 'egipcio') { g.put(SH.cone, R3.mat(K.x0 + K.w / 2, K.y0, K.z0 + K.d / 2, Math.PI / 4, K.w * 1.35, 24, K.d * 1.35), K.c(P.wl)); return; }
      for (let k = 0; k < 6; k++) { const s = K.w * (1 - k * 0.14); K.box(K.w / 2, k * 3.4, K.d / 2, s, 3.4, s, k % 2 ? P.wr : P.wl); }
      K.box(K.w / 2, 20.4, K.d / 2, K.w * 0.18, 4, K.d * 0.18, P.acc || '#f2c14e');
    },
    palacio(g, gw, K) {
      const P = K.P; if (K.prog < 1) { scaffold(K, K.w / 2, K.d / 2, K.w - 1, K.d - 1, 8); return; }
      if (styleOf(K.b) === 'nordico') { longhouse(g, gw, K, 3); return; }
      const t = house(g, gw, K, { floors: 2, h: 4, roof: P.kind === 'flat' ? 'flat' : 'hip', inset: 1.2 }); void t;
      for (const [px, pz] of [[0.9, 0.9], [K.w - 0.9, 0.9], [0.9, K.d - 0.9], [K.w - 0.9, K.d - 0.9]]) { K.as('stone', () => K.box(px, 0, pz, 1.8, 11, 1.8, P.wr)); K.as(stuff(K.b).tile === 'mud' ? 'slab' : stuff(K.b).tile, () => g.put(SH.cone, R3.mat(K.x0 + px, K.y0 + 11, K.z0 + pz, Math.PI / 4, 2.6, 3, 2.6), K.c((P.roof && P.roof[1]) || '#94452d'))); }
      K.box(K.w / 2, 8.6, K.d / 2, 0.1, 4, 0.1, '#5a4a3a'); K.box(K.w / 2 + 0.6, 11.4, K.d / 2, 1.2, 0.7, 0.05, '#c8483a');
    },
    paco(g, gw, K) { KIT.palacio(g, gw, K); },
    administracao(g, gw, K) { const P = K.P; house(g, gw, K, { floors: 2, h: 3.4, roof: P.kind === 'flat' ? 'flat' : 'hip', inset: 0.6 }); if (K.prog >= 1) colonnade(K, 0.6, K.d - 0.25, K.w - 0.6, K.d - 0.25, 4, 6.6, 0.25, (P.col && P.col[0]) || P.wl); },
    coletoria(g, gw, K) { house(g, gw, K, { h: 3.6, inset: 0.5 }); },
    biblioteca(g, gw, K) { KIT.administracao(g, gw, K); },
    teatro(g, gw, K) {
      const P = K.P; const cx = K.w / 2, cz = K.d * 0.35; const R = Math.min(K.w, K.d) * 0.48;
      for (let k = 0; k < 5; k++) for (let a = 0; a < 9; a++) { const ang = Math.PI * (a / 8); const r = R - k * 0.9; g.put(SH.box, R3.mat(K.x0 + cx + Math.cos(ang) * r, K.y0 + k * 0.7, K.z0 + cz + Math.sin(ang) * r, -ang + Math.PI / 2, 2.2, 0.7 + k * 0.7, 1), K.c(k % 2 ? P.wl : P.wr)); }
      K.box(cx, 0, K.d * 0.2, K.w * 0.6, 0.6, 1.4, P.base ? P.base[0] : '#8a8478');
    },
    banhos(g, gw, K) { house(g, gw, K, { h: 3.4, noRoof: true, inset: 0.5 }); if (K.prog >= 1) { K.sph(K.w * 0.35, 3.4, K.d * 0.5, K.w * 0.24, '#d8d0c0', K.w * 0.18); K.sph(K.w * 0.72, 3.4, K.d * 0.5, K.w * 0.16, '#d8d0c0', K.w * 0.12); } },
    cadeia(g, gw, K) { const P = K.P; house(g, gw, K, { h: 3.6, wall: P.base ? P.base[1] : '#6f6a60', pat: 'stone', roof: 'flat' }); },
    quartel(g, gw, K) { house(g, gw, K, { h: 3.4 }); if (K.prog >= 1) { K.box(K.w - 0.4, 0, 0.4, 0.12, 7, 0.12, '#5a4a3a'); K.box(K.w - 0.4 + 0.6, 6.2, 0.4, 1.2, 0.7, 0.05, G.Fac.hex(G.Village.facOfSet(K.b.set))); } },
    torre(g, gw, K) {
      const P = K.P; const s = K.w - 0.8; const h = K.prog < 1 ? 10 * K.prog + 1 : 10;
      K.as('stone', () => K.box(K.w / 2, 0, K.d / 2, s, h, s, P.base ? P.base[2] : '#a09a8e'));
      if (K.prog < 1) { scaffold(K, K.w / 2, K.d / 2, s, s, 10); return; }
      K.as('stone', () => { K.box(K.w / 2, h, K.d / 2, s + 0.5, 0.4, s + 0.5, P.base ? P.base[1] : '#6f6a60');
        for (const [px, pz] of [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, -1], [0, 1], [-1, 0], [1, 0]]) K.box(K.w / 2 + px * (s / 2), h + 0.4, K.d / 2 + pz * (s / 2), 0.5, 0.7, 0.5, P.base ? P.base[2] : '#a09a8e'); });
      gw.put(SH.box, R3.mat(K.x0 + K.w / 2, K.y0 + h * 0.65, K.z0 + K.d / 2 + s / 2 + 0.04, 0, 0.3, 0.9, 0.08), '#2a3440');
    },
    mercado(g, gw, K) { stalls(K, 4); },
    feira(g, gw, K) { stalls(K, 3); },
    mercado_negro(g, gw, K) { stalls(K, 2, ['#3a3440', '#4a2a2a']); },
    doca(g, gw, K) {
      // the quay: planks out over the water on the side of the sea, on posts
      const b = K.b; const wd = b.wd || [0, 1]; const L = K.L; const sea = G.SEA * HM() + 0.5;
      const len = 2.6 * L; const x = K.w / 2 + wd[0] * (K.w / 2 + len / 2 - L * 0.3), z = K.d / 2 + wd[1] * (K.d / 2 + len / 2 - L * 0.3);
      const sx = wd[0] ? len : K.w * 0.6, sz = wd[1] ? len : K.d * 0.6;
      K.as('plankH', () => g.put(SH.box, R3.mat(K.x0 + x, sea, K.z0 + z, 0, sx, 0.3, sz), K.c('#8a6a44')));
      for (let k = 0; k < 4; k++) { const f = k / 3 - 0.5; g.put(SH.cyl, R3.mat(K.x0 + x + (wd[0] ? f * sx : sx / 2) * 1, sea - 3, K.z0 + z + (wd[1] ? f * sz : sz / 2), 0, 0.3, 3.2, 0.3), K.c('#6a4a2c')); }
      house(g, gw, K, { h: 2.4, inset: Math.min(K.w, K.d) * 0.22, wall: '#9a7a50', pat: 'plankH', door: true });
    },
    mina(g, gw, K) { const P = K.P; K.sph(K.w / 2, -0.5, K.d / 2, K.w * 0.42, '#8c867a', 1.8); K.box(K.w / 2, 0, K.d - 0.6, 2.2, 2.4, 0.4, '#6a4a2c'); K.box(K.w / 2, 0, K.d - 0.55, 1.4, 1.9, 0.42, '#141414'); void P; },
    apiario(g, gw, K) { for (let k = 0; k < 4; k++) { const px = K.w * (0.25 + (k % 2) * 0.5), pz = K.d * (0.3 + Math.floor(k / 2) * 0.4); K.box(px, 0, pz, 0.15, 0.6, 0.15, '#6a4a2c'); K.box(px, 0.6, pz, 0.8, 0.7, 0.6, '#e8c870'); K.box(px, 1.3, pz, 0.95, 0.1, 0.75, '#8a6a44'); } },
    curral(g, gw, K) { fenceAround(K, 1.3, '#8a6a44', true); },
    estabulo(g, gw, K) { house(g, gw, K, { h: 3.4, inset: 0.6, wall: '#8a5a3a', pat: 'plankH' }); },
    cercado(g, gw, K) { fenceAround(K, 1.6, '#6a5a44', true); },
    farm(g, gw, K) { fields(K, '#d4ac44', '#6a9a3a'); },
    horta(g, gw, K) { fields(K, '#7aaa4a', '#4a8a2a', true); },
    plantacao(g, gw, K) { fields(K, '#c8b84a', '#5a8a2a'); },
    vinhedo(g, gw, K) { for (let r = 0; r < K.b.h * 2; r++) { const z = (r + 0.5) * K.d / (K.b.h * 2); K.box(K.w / 2, 0, z, K.w - 0.8, 1.5, 0.35, '#4a7a2a'); K.box(0.4, 0, z, 0.12, 1.8, 0.12, '#6a4a2c'); K.box(K.w - 0.4, 0, z, 0.12, 1.8, 0.12, '#6a4a2c'); } },
    pomar(g, gw, K) { for (let k = 0; k < K.b.w * K.b.h; k++) { const px = ((k % K.b.w) + 0.5) * K.L, pz = (Math.floor(k / K.b.w) + 0.5) * K.L; K.cyl(px, 0, pz, 0.18, 1.6, '#6a4a2c'); K.sph(px, 2.6, pz, 1.2, '#4f8f36', 1.0); K.sph(px + 0.6, 2.3, pz + 0.3, 0.2, '#d23a2a'); } },
    well(g, gw, K) {
      const P = K.P; const x = K.w / 2, z = K.d / 2;
      K.cyl(x, 0, z, 0.8, 0.85, P.base ? P.base[2] : '#a09a8e'); K.cyl(x, 0.82, z, 0.62, 0.05, '#2a5a7a');
      for (const s of [-1, 1]) K.box(x + s * 0.75, 0.8, z, 0.12, 1.5, 0.12, '#6a4a2c');
      K.gable(x, 2.2, z, 2, 0.6, 1.4, (P.roof && P.roof[0]) || '#b85a3c');
    },
    campfire(g, gw, K) { for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; K.sph(K.w / 2 + Math.cos(a) * 0.7, 0.1, K.d / 2 + Math.sin(a) * 0.7, 0.22, '#6a6a66'); } for (let k = 0; k < 3; k++) g.put(SH.cyl, R3.mat(K.x0 + K.w / 2, K.y0 + 0.2, K.z0 + K.d / 2, k * 1.05, 0.16, 1.1, 0.16, 0, Math.PI / 2), K.c('#5a3a24')); },
    cemetery(g, gw, K) {
      fenceAround(K, 1, '#5a4a3a', true);
      const n = Math.min(12, (K.b.graves || []).length);
      for (let k = 0; k < n; k++) { const px = 1 + (k % 4) * (K.w - 2) / 3.2, pz = 1.2 + Math.floor(k / 4) * (K.d - 2.4) / 2.5; K.box(px, 0, pz, 0.6, 0.8, 0.18, '#9a968e'); K.box(px, 0, pz + 0.7, 0.6, 0.06, 1.2, '#6a5a44'); }
    },
    // the square: paved, a kerb of bigger stones round it, the fountain in the middle (a basin, a column, a bowl spilling
    // into it), two benches facing it
    praca(g, gw, K) {
      const P = K.P; const st = P.base ? P.base[2] : '#a09a8e', dk = P.base ? P.base[0] : '#8a8478'; const cx = K.w / 2, cz = K.d / 2;
      K.as('slab', () => K.box(cx, -0.05, cz, K.w - 0.2, 0.15, K.d - 0.2, st));
      K.as('stone', () => { for (const [x, z, w, d] of [[cx, 0.25, K.w - 0.2, 0.32], [cx, K.d - 0.25, K.w - 0.2, 0.32], [0.25, cz, 0.32, K.d - 0.84], [K.w - 0.25, cz, 0.32, K.d - 0.84]]) K.box(x, -0.05, z, w, 0.25, d, dk);
        K.cyl(cx, 0.1, cz, 1.4, 0.6, dk); K.cyl(cx, 0.1, cz, 0.2, 1.5, st); K.cyl(cx, 1.58, cz, 0.5, 0.16, st); });
      K.cyl(cx, 0.68, cz, 1.22, 0.04, '#3a8ab0'); K.cyl(cx, 1.72, cz, 0.42, 0.03, '#3a8ab0');
      const bz = Math.min(2.7, K.d / 2 - 1.1);
      K.as('plankH', () => { for (const s of [-1, 1]) K.box(cx, 0.4, cz + s * bz, 1.8, 0.08, 0.44, '#8a6a44'); });
      for (const s of [-1, 1]) for (const e of [-0.72, 0.72]) K.box(cx + e, 0.1, cz + s * bz, 0.14, 0.3, 0.38, dk);
    },
    aqueduto(g, gw, K) { const P = K.P; K.box(K.w / 2, 0, K.d / 2, K.w - 0.6, 4.5, K.d - 0.6, P.base ? P.base[2] : '#a09a8e'); K.box(K.w / 2, 4.5, K.d / 2, K.w - 0.2, 0.4, K.d - 0.2, '#3a8ab0'); },
    ruin(g, gw, K) { const P = K.P; for (let k = 0; k < 5; k++) { const h = 0.6 + G.hash(K.b.id * 7 + k) * 2.4; const px = 0.6 + G.hash(K.b.id + k * 3) * (K.w - 1.2), pz = 0.6 + G.hash(K.b.id * 3 + k) * (K.d - 1.2); K.box(px, 0, pz, 1.2, h, 0.5, dim(P.wl || '#efe2c4', 0.7), G.hash(k) * 3); } },
  };
  // stalls of a market: tables under coloured awnings, goods on them
  function stalls(K, n, cols) {
    const cl = cols || ['#c8483a', '#3f6fb0', '#e8b83a', '#4a9a5a'];
    for (let k = 0; k < n; k++) {
      const px = K.w * ((k % 2) * 0.5 + 0.25), pz = K.d * (Math.floor(k / 2) * 0.5 + 0.25);
      K.box(px, 0, pz, 1.8, 0.85, 1, '#8a6a44');
      for (const [sx, sz] of [[-0.85, -0.45], [0.85, -0.45], [-0.85, 0.45], [0.85, 0.45]]) K.box(px + sx, 0, pz + sz, 0.08, 2.3, 0.08, '#6a4a2c');
      K.gable(px, 2.2, pz, 2.2, 0.6, 1.4, cl[k % cl.length]);
      for (let q = 0; q < 3; q++) K.sph(px - 0.5 + q * 0.5, 1, pz, 0.18, ['#e85a3a', '#f2c14e', '#7ab84a'][q]);
    }
  }
  // the rows of a field, each tile with its own crop at its own stage (the world's crops), drawn as the god's view draws
  // them: the grain of the land (wheat, barley, flooded rice, tall maize, red sorghum — Estates.grainOf), four rows of
  // plants on the ridges of the furrows, stalks that grow with the crop, green, then golden with their heads and ears
  // and beards when ripe; sprouts when just sown; the water of a paddy; posts at the corners
  function fields(K, ripe, green, small) {
    const b = K.b; const L = K.L; const S = G.S; const gp = K.gp;
    const GR = (G.Estates && b.built && G.Estates.grainOf ? G.Estates.grainOf(b) : null) || { ripe: ripe, head: ripe, green: G.hex2rgb(green), h: small ? 2.5 : 5 };
    const grn = Array.isArray(GR.green) ? GR.green : G.hex2rgb(GR.green);
    for (let ty = 0; ty < b.h; ty++) for (let tx = 0; tx < b.w; tx++) {
      const k = ty * b.w + tx; const x = b.x + tx, y = b.y + ty; const i = y * N + x; if (!W.inb(x, y)) continue;
      // (a paddy's water over the earth)
      if (b.built && GR.flood && !(S.burnt[i] > 0)) { const wy = W.hAt(x + 0.5, y + 0.5) * HM() + 0.1; K.gq.quad([[x * L + 0.3, wy, y * L + 0.3], [x * L + 0.3, wy, (y + 1) * L - 0.3], [(x + 1) * L - 0.3, wy, (y + 1) * L - 0.3], [(x + 1) * L - 0.3, wy, y * L + 0.3]], [[120, 180, 200], [120, 180, 200], [120, 180, 200], [120, 180, 200]], [0.5, 0.5, 0.5, 0.5], [0, 0, 0, 0]); }
      const c = b.crops && b.crops[k]; if (!b.built || !c || !c.s || S.burnt[i] > 0) continue; // (bare earth: just ploughed, or harvested; or burnt)
      const g = G.clamp(c.g || 0, 0, 1); const ripeNow = c.s === 3;
      // (the god's pixels of stalk, in metres: a cob of maize stands over a person, wheat to the waist)
      const hgt = c.s === 1 ? 0.16 : (2 + g * GR.h) * (GR.ear ? 0.26 : 0.15) * (small ? 0.7 : 1);
      const stalk = ripeNow ? G.hex2rgb(GR.ripe) : G.lerpColor(grn, [200, 190, 90], Math.max(0, g - 0.6) * 2);
      const foot = [stalk[0] * 0.55, stalk[1] * 0.6, stalk[2] * 0.45]; const head = G.hex2rgb(GR.head || GR.ripe);
      for (let r = 0; r < 4; r++) for (let q = 0; q < 9; q++) {
        const hh = G.hash(i * 37 + r * 11 + q * 3); const px = x * L + 0.22 + q * 0.44 + (hh - 0.5) * 0.16, pz = y * L + 0.5 + r + (G.hash(i * 7 + r * 5 + q) - 0.5) * 0.12;
        const Y = W.hAt(px / L, pz / L) * HM() - 0.02; const h = hgt * (0.85 + hh * 0.3);
        if (c.s === 1) { for (let s = 0; s < 3; s++) { const a = s * 2.1 + hh * 6; gp.blade(px, Y, pz, 0.05, a + 1.57, px + Math.cos(a) * 0.07, Y + h, pz + Math.sin(a) * 0.07, [70, 120, 50], [126, 196, 90], 0.3); } continue; }
        // (a clump: three stalks, a little apart, leaning their own ways)
        for (let s = 0; s < 3; s++) {
          const a = hh * 9 + s * 2.1; const lx = Math.cos(a) * h * 0.12, lz = Math.sin(a) * h * 0.12; const sx = px + Math.cos(a + 1) * 0.04, sz = pz + Math.sin(a + 1) * 0.04;
          gp.blade(sx, Y, sz, GR.ear ? 0.09 : 0.055, a, sx + lx, Y + h, sz + lz, foot, stalk);
          // (the leaves of a tall stalk: maize, sorghum)
          if (GR.ear && g > 0.4) for (const f of [0.45, 0.65]) { const la = a + f * 7; gp.blade(sx + lx * f, Y + h * f, sz + lz * f, 0.06, la, sx + lx * f + Math.cos(la) * 0.35, Y + h * f + 0.12, sz + lz * f + Math.sin(la) * 0.35, stalk, ripeNow ? [184, 160, 74] : [90, 154, 58], 0.8); }
          if (!ripeNow && g < 0.75) continue;
          const tx2 = sx + lx, ty2 = Y + h, tz2 = sz + lz;
          if (GR.ear) { // (a cob on the side of the stalk)
            const ex = sx + lx * 0.62, ey = Y + h * 0.62, ez = sz + lz * 0.62;
            gp.blade(ex, ey, ez, 0.07, a + 1.57, ex + Math.cos(a) * 0.12, ey + 0.26, ez + Math.sin(a) * 0.12, ripeNow ? head : [120, 170, 80], ripeNow ? head : [150, 190, 90], 0.6);
          } else { // (the head of the grain, and its beard)
            const hc = ripeNow ? head : G.lerpColor(stalk, head, 0.5); const hl = GR.flood ? 0.12 : 0.16;
            gp.blade(tx2, ty2 - hl * 0.4, tz2, GR.flood ? 0.05 : 0.07, a + 1.57, tx2 + lx * 0.3, ty2 + hl, tz2 + lz * 0.3, hc, hc);
            gp.blade(tx2, ty2 - hl * 0.4, tz2, GR.flood ? 0.05 : 0.07, a, tx2 + lx * 0.3, ty2 + hl, tz2 + lz * 0.3, hc, hc);
            if (GR.beard && ripeNow) gp.blade(tx2, ty2 + hl * 0.6, tz2, 0.02, a, tx2 + lx * 0.5, ty2 + hl + 0.14, tz2 + lz * 0.5, hc, [216, 200, 144]);
          }
        }
      }
    }
    // (fence posts at the corners of the tiles, round the field)
    if (!small) for (let k = 0; k <= b.w; k++) for (let q = 0; q <= b.h; q++) {
      if (k !== 0 && k !== b.w && q !== 0 && q !== b.h) continue; const fx = b.x + k, fy = b.y + q;
      const gy = W.hAt(Math.min(fx, N - 0.01), Math.min(fy, N - 0.01)) * HM(); K.g.put(SH.box, R3.mat(fx * L, gy - 0.1, fy * L, G.hash(fx * 7 + fy) * 0.4, 0.14, 1.0, 0.14), K.c('#6e4a2c'));
    }
  }

  // ------------------------------ walls, gates, aqueducts ------------------------------
  // the stones of one wall tile, as boxes [x, base, z, width, height, depth, colour] (metres): the drawing puts them,
  // the camera asks them — one shape for both, so the eye goes through a gate's passage the body walks through
  function wallBoxes(x, y) {
    const S = G.S; const L = TL(); const H = HM(); const i = y * N + x; const w = S.wall[i]; if (!w || w === 3) return null;
    const gy = W.hAt(x + 0.5, y + 0.5) * H; const col = '#9a948a'; const out = [];
    const nb = (dx, dy) => W.inb(x + dx, y + dy) && S.wall[(y + dy) * N + x + dx] && S.wall[(y + dy) * N + x + dx] !== 3;
    const E = nb(1, 0), Wn = nb(-1, 0), S2 = nb(0, 1), Nn = nb(0, -1);
    const cx = (x + 0.5) * L, cz = (y + 0.5) * L;
    if (w === 2 || w === 4) {
      // a gate: two piers, the lintel, the doors (shut, or open against the walls)
      const alongX = E || Wn;
      for (const s of [-1, 1]) out.push([cx + (alongX ? s * 1.5 : 0), gy - 0.5, cz + (alongX ? 0 : s * 1.5), alongX ? 1 : 1.8, 7, alongX ? 1.8 : 1, col]);
      out.push([cx, gy + 4.6, cz, alongX ? 4 : 1.8, 1.4, alongX ? 1.8 : 4, col]);
      if (w === 4) out.push([cx, gy, cz, alongX ? 2.2 : 0.3, 4.4, alongX ? 0.3 : 2.2, '#6a4a2c']);
      return out;
    }
    out.push([cx, gy - 0.5, cz, 1.6, 5.5, 1.6, col]);
    if (E) out.push([cx + L / 4, gy - 0.5, cz, L / 2, 5.5, 1.4, col]);
    if (Wn) out.push([cx - L / 4, gy - 0.5, cz, L / 2, 5.5, 1.4, col]);
    if (S2) out.push([cx, gy - 0.5, cz + L / 4, 1.4, 5.5, L / 2, col]);
    if (Nn) out.push([cx, gy - 0.5, cz - L / 4, 1.4, 5.5, L / 2, col]);
    // (the battlements)
    for (let k = 0; k < 2; k++) out.push([cx + (k ? 0.5 : -0.5), gy + 5, cz, 0.5, 0.7, 1.7, '#8a847a']);
    return out;
  }
  function wallsInto(g, x0, y0, n) {
    const S = G.S; const L = TL(); const H = HM();
    for (let y = y0; y < y0 + n; y++) for (let x = x0; x < x0 + n; x++) {
      if (!W.inb(x, y)) continue; const bs = wallBoxes(x, y); if (!bs) continue;
      g.pat = PAT.stone; for (const q of bs) { g.pat = q[6] === '#6a4a2c' ? PAT.plankV : PAT.stone; g.put(SH.box, R3.mat(q[0], q[1], q[2], 0, q[3], q[4], q[5]), q[6]); } g.pat = 0;
    }
    // (the aqueducts: piers along the run at each end of the tile, a round arch of voussoirs between them, the deck over
    // the arches and the water running in its channel on top — in the stone of the people who built it)
    for (const a of S.aqueducts || []) { const P = palOf({ set: a.set }); const col = P.base ? P.base[2] : '#b0a898', deck = P.wl || '#d8d0c0';
      for (let k = 0; k < a.built; k++) {
        const [x, y] = a.tiles[k]; if (x < x0 || y < y0 || x >= x0 + n || y >= y0 + n) continue;
        const i = y * N + x; if (S.occ[i]) { const ob = S.buildings.get(S.occ[i]); if (ob && ob.blocks) continue; }
        const pv = a.tiles[k - 1], nx = a.tiles[k + 1]; const ddx = (nx ? nx[0] : x) - (pv ? pv[0] : x), ddy = (nx ? nx[1] : y) - (pv ? pv[1] : y); const ax = Math.abs(ddx) >= Math.abs(ddy);
        const gy = W.hAt(x + 0.5, y + 0.5) * H; const cx = (x + 0.5) * L, cz = (y + 0.5) * L; const top = 6.2, r = L / 2 - 0.85, spring = top - r - 0.75;
        const at = (u, yy) => (ax ? [cx + u, yy, cz] : [cx, yy, cz + u]); const ry = ax ? 0 : Math.PI / 2;
        g.pat = PAT.stone;
        for (const sd of [-1, 1]) { const p = at(sd * (L / 2 - 0.42), gy - 0.5); g.put(SH.box, R3.mat(p[0], p[1], p[2], ry, 0.84, spring + 0.5, 1.3), col); }
        for (let j = 0; j < 7; j++) { const th = Math.PI * (j + 0.5) / 7; const p = at(Math.cos(th) * r * (ax ? 1 : -1), gy + spring + Math.sin(th) * r); g.put(SH.box, R3.mat(p[0], p[1], p[2], ry, Math.PI * r / 7 + 0.06, 0.6, 1.3, 0, th - Math.PI / 2), col); }
        // (the spandrels over the piers, then the deck)
        for (const sd of [-1, 1]) { const p = at(sd * (L / 2 - 0.5), gy + spring); g.put(SH.box, R3.mat(p[0], p[1], p[2], ry, 1.0, top - spring, 1.3), col); }
        const d = at(0, gy + top); g.put(SH.box, R3.mat(d[0], d[1], d[2], ry, L, 1.1, 1.4), deck);
        g.pat = 0; const w = at(0, gy + top + 1.1); g.put(SH.box, R3.mat(w[0], w[1], w[2], ry, L, 0.12, 0.8), '#3a8ab0');
        g.pat = PAT.stone; for (const sd of [-1, 1]) { const q = at(0, gy + top + 1.1); g.put(SH.box, R3.mat(q[0] + (ax ? 0 : sd * 0.55), q[1], q[2] + (ax ? sd * 0.55 : 0), ry, L, 0.3, 0.25), deck); }
        g.pat = 0;
      } }
  }

  // ------------------------------ a chunk's buildings ------------------------------
  const inChunk = (b, x0, y0, n) => b.x >= x0 && b.y >= y0 && b.x < x0 + n && b.y < y0 + n;
  B3.sig = function (x0, y0, n) {
    let s = 0;
    for (const b of G.S.buildings.values()) { if (!inChunk(b, x0, y0, n)) continue; s = (s * 31 + b.id * 7 + (b.built ? 1 : 0) + Math.floor((b.progress || 0) * 5) * 3 + Math.floor((b.hp / (b.maxHp || 1)) * 4) * 11 + (b.crops ? b.crops.reduce((a, c) => a + c.s + Math.floor((c.g || 0) * 3), 0) : 0) * 13 + (b.graves ? b.graves.length : 0) * 17) | 0; }
    // (the arches standing in this chunk: one built across the map does not change it)
    for (const a of G.S.aqueducts || []) for (let k = 0; k < a.built; k++) { const t = a.tiles[k]; if (t[0] >= x0 && t[1] >= y0 && t[0] < x0 + n && t[1] < y0 + n) s = (s + (k + 1) * 23 + (a.dead ? 5 : 0)) | 0; }
    return s;
  };
  B3.nearGeo = function (x0, y0, n) {
    const g = R3.Geo(), gw = R3.Geo(), gp = R3.Geo(), gq = R3.WGeo();
    for (const b of G.S.buildings.values()) {
      if (!inChunk(b, x0, y0, n)) continue;
      const K = kit(g, b, gp, gq); const f = KIT[b.type];
      if (f) f(g, gw, K); else house(g, gw, K);
    }
    g.ao = (X, Z) => W.hAt(X / TL(), Z / TL()) * HM();
    wallsInto(g, x0, y0, n);
    return { solid: g.empty ? null : g.build(true), glass: gw.empty ? null : gw.build(), plants: gp.empty ? null : gp.build(), water: gq.empty ? null : gq.build() };
  };
  // the far picture: a block and a roof for each house, the height of what it is
  B3.farGeo = function (x0, y0, n) {
    const g = R3.Geo(); const L = TL();
    for (const b of G.S.buildings.values()) {
      if (!inChunk(b, x0, y0, n)) continue;
      const P = palOf(b); const h = (HEIGHT[b.type] || 5) * (b.built ? 1 : 0.4); if (h < 1.5) continue;
      const X = (b.x + b.w / 2) * L, Z = (b.y + b.h / 2) * L, Y = W.maxH(b.x, b.y, b.w, b.h) * HM();
      const st = stuff(b); const flat = P.kind === 'flat';
      g.pat = PAT[st.wall === 'frame' ? 'plaster' : st.wall]; g.put(SH.box, R3.mat(X, Y - 0.3, Z, 0, b.w * L * 0.85, h * (flat ? 0.95 : 0.6), b.h * L * 0.85), P.wl || '#efe2c4');
      if (!flat) { g.pat = PAT[P.kind === 'turf' ? 'turf' : P.kind === 'thatch' ? 'thatch' : st.tile]; g.put(SH.gable, R3.mat(X, Y + h * 0.6 - 0.3, Z, b.w >= b.h ? 0 : Math.PI / 2, (b.w >= b.h ? b.w : b.h) * L * 0.95, h * 0.5, (b.w >= b.h ? b.h : b.w) * L * 0.95), P.kind === 'thatch' ? ((P.thatch && P.thatch[0]) || '#c8a85a') : (P.roof && P.roof[0]) || '#b85a3c'); }
      g.pat = 0;
    }
    return g.empty ? null : g.build(true);
  };
  // the box a building's 3D body fills, in metres (the tests ask: does it stand where the world says, on the ground?)
  B3.bounds = function (b) {
    const g = R3.Geo(), gw = R3.Geo(); const K = kit(g, b); const f = KIT[b.type]; if (f) f(g, gw, K); else house(g, gw, K);
    const P = g.p; if (!P.length) return null; const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
    for (let k = 0; k < P.length; k += 3) for (let a = 0; a < 3; a++) { lo[a] = Math.min(lo[a], P[k + a]); hi[a] = Math.max(hi[a], P[k + a]); }
    return { lo, hi, floor: K.y0, ground: [K.lo, K.hi] };
  };
  // (for the tests: the patterns a building's body is drawn with — {pattern code: points} — and the ones its people's
  // walls and roofs should have)
  B3.patsOf = function (b) {
    const g = R3.Geo(), gw = R3.Geo(); const K = kit(g, b); const f = KIT[b.type]; if (f) f(g, gw, K); else house(g, gw, K);
    const out = {}; for (const q of g.q || []) out[q] = (out[q] || 0) + 1; const st = stuff(b); const P = palOf(b);
    const roof = P.kind === 'flat' ? (st.tile === 'mud' ? 'mud' : 'slab') : P.kind === 'turf' || styleOf(b) === 'nordico' ? 'turf' : P.kind === 'thatch' ? 'thatch' : st.tile;
    return { pats: out, wall: PAT[styleOf(b) === 'nordico' ? 'plankV' : st.wall], roof: PAT[roof] };
  };
  // what stands on a tile, and how high (for the camera, so it does not go through roofs)
  B3.heightAt = function (i) { const S = G.S; const b = S.occ[i] && S.buildings.get(S.occ[i]); if (b && b.blocks) return HEIGHT[b.type] || 5; const w = S.wall[i]; return w === 1 || w === 2 || w === 4 ? 6 : 0; };
  // is a point (metres) in the stones of a wall or a gate, give or take m? (no wall here: false)
  B3.wallSolid = function (X, Y, Z, m) {
    const x = Math.floor(X / TL()), y = Math.floor(Z / TL()); if (!W.inb(x, y)) return false; const bs = wallBoxes(x, y); if (!bs) return false;
    for (const q of bs) if (Math.abs(X - q[0]) < q[3] / 2 + m && Math.abs(Z - q[2]) < q[5] / 2 + m && Y > q[1] - m && Y < q[1] + q[4] + m) return true;
    return false;
  };
})(window.G);
