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
  B3.tops = new Map(); G.worldHooks.push(() => B3.tops.clear()); // (how high each building's near picture reaches: id → Y)
  // (the panes that light up at night, for FX3D's light on the street: building id → [[X, Y, Z, out x, out z], ...] — kept by the
  // chunk that drew them, so a building gone takes its panes with it when its chunk is drawn again)
  B3.lamps = new Map(); const litOf = new Map(); G.worldHooks.push(() => { B3.lamps.clear(); litOf.clear(); });
  // (the trades of the people of each house — home id → roles: what lies about a home tells of who lives there, a fisher's nets,
  // a hunter's hide. Only read; made again when the world's clock or its people have changed)
  let rolesMap = null, rolesKey = ''; G.worldHooks.push(() => { rolesMap = null; rolesKey = ''; });
  B3.roles = function () {
    const S = G.S; const key = S.clock + ':' + S.villagers.size; if (rolesMap && key === rolesKey) return rolesMap;
    rolesMap = new Map(); rolesKey = key;
    for (const v of S.villagers.values()) { if (!v.home || !v.role) continue; let l = rolesMap.get(v.home); if (!l) rolesMap.set(v.home, l = []); if (!l.includes(v.role)) l.push(v.role); }
    return rolesMap;
  };
  let THREE = null, R3 = null, SH = null, glass = null, PM = null, IDM = null, PEG = null, PLANK = null;
  const TAU = Math.PI * 2;
  B3.init = function (three, realm) {
    THREE = three; R3 = realm; SH = realm.SH; glass = new THREE.MeshPhongMaterial({ color: 0x1c2630, specular: 0x8aa0b4, shininess: 90, emissive: 0xffb860, emissiveIntensity: 0 });
    PM = new THREE.Matrix4(); IDM = new THREE.Matrix4(); // (a slanted box's frame, and the frame of the sheets already in place)
    for (let k = 0; k < 16; k++) { CUTU.a.value.push(new THREE.Vector3()); CUTU.b.value.push(new THREE.Vector3()); } CUTU.lo.value = new THREE.Vector3(); CUTU.hi.value = new THREE.Vector3();
    for (let k = 0; k < 4; k++) { SUNKU.a.value.push(new THREE.Vector3()); SUNKU.b.value.push(new THREE.Vector3()); }
    // (a timber's end out of a gable: eight sides, its end chamfered — a purlin, a peg; open at its foot, in the wall)
    PEG = new THREE.LatheGeometry([[0.5, 0], [0.5, 0.88], [0.4, 1], [0, 1]].map(([r, y]) => new THREE.Vector2(r, y)), 8);
    // (a plank lying on the ground: a box standing on its base, without the underside nobody sees)
    { const bx = new THREE.BoxGeometry(1, 1, 1).toNonIndexed(); bx.translate(0, 0.5, 0); const p = bx.attributes.position.array, nn = bx.attributes.normal.array; const P = [], Nn = [];
      for (let k = 0; k < p.length; k += 9) { if (nn[k + 1] < -0.5) continue; for (let q = 0; q < 9; q++) { P.push(p[k + q]); Nn.push(nn[k + q]); } }
      PLANK = new THREE.BufferGeometry(); PLANK.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); PLANK.setAttribute('normal', new THREE.Float32BufferAttribute(Nn, 3)); bx.dispose(); }
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
  // (13 'frame' is the half-timbered wall — plaster with its timbers; 'jamb' is the planed wood of a door's or a window's
  // frame. The stack's materials of the things of a town: a door's leaf (anchored: doorPat), wicker (a basket; 'wattle' the
  // same three times bigger: the fences and woven walls of the north), canvas, rope, linen. 30–33: the beam and the jamb lying
  // along X or Z, the picture turned so their grain runs with them — kit.box picks them for a lying piece)
  const PAT = B3.PAT = { plaster: 1, stone: 2, brick: 3, plankV: 4, plankH: 5, tile: 6, shingle: 7, thatch: 8, turf: 9, marble: 10, slab: 11, beam: 12, frame: 13, mud: 14, cloth: 15, soil: 16, rock: 17, bark: 18, iron: 19,
    door: 20, jamb: 21, wicker: 22, wattle: 23, canvas: 24, rope: 25, linen: 26, leather: 27, fur: 28, wool: 29, beamX: 30, beamZ: 31, jambX: 32, jambZ: 33,
    // (the other peoples' own stuff — A1's arte/mat_culturas.py: dressed stone, Roman roof tiles, Greek whitewash, painted wood,
    // sandstone, the Aztec's stucco and red volcanic stone; the Egyptian's mud brick is 'mud'. Until the stack has them, each draws
    // as the nearest it has)
    ashlar: 34, tegula: 35, whitewash: 36, painted: 37, sandstone: 38, stucco: 39, tezontle: 40 };
  // a door's leaf with one leaf of the stack's door picture across its own width and from its own foot up (the patterns are
  // drawn in the world's metres: the shader is told where the leaf starts along the wall and up — each to 2 cm, modulo 4 m —
  // how wide it is, to 5 cm, and which of the picture's two leaves, hinged left or right; a flat varying keeps it exact).
  // X, Y0, Z: the middle of its foot in the world; o: the way it faces
  const DOORQ = 4194304;
  const doorPat = (X, Y0, Z, o, dw, leaf) => {
    const q = v => Math.round((((v % 4) + 4) % 4) / 0.02) % 200; const u0 = -o[1] * X + o[0] * Z - dw / 2;
    return DOORQ + q(u0) + 256 * (q(Y0) + 256 * (G.clamp(Math.round((dw - 0.6) / 0.05), 0, 15) + 16 * (leaf ? 1 : 0)));
  };
  B3.doorPat = doorPat;
  // what each people builds with: the walls of a house, its base, its roofs
  const STUFF = {
    classico: { wall: 'frame', base: 'stone', tile: 'tile' }, grego: { wall: 'whitewash', base: 'marble', tile: 'tile' }, romano: { wall: 'plaster', base: 'ashlar', tile: 'tegula' },
    egipcio: { wall: 'mud', base: 'sandstone', tile: 'mud' }, asteca: { wall: 'stucco', base: 'tezontle', tile: 'thatch' }, nordico: { wall: 'plankV', base: 'stone', tile: 'shingle' },
  };
  const stuff = b => STUFF[styleOf(b)] || STUFF.classico;
  const PFRAG = `
uniform sampler2D uDet; varying vec3 vPP; varying vec3 vPN; flat varying float vPat;
float pHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec3 pattern(float p, vec2 uv, vec3 wp, out vec2 bump) {
  bump = vec2(0.0);
  // (the other peoples' stuff, before the stack is in: drawn as its nearest — stone, tiles, plaster, planks)
  if (p == 34.0 || p == 38.0 || p == 40.0) p = 2.0; else if (p == 35.0) p = 6.0; else if (p == 36.0 || p == 39.0) p = 1.0; else if (p == 37.0) p = 4.0;
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
  // (earth at the edge of a turf roof, a field stone, the bark of a log, iron: their grain only — the stack has the rest)
  if (p == 16.0) return vec3(0.82 + d.g * 0.3 + (big - 0.5) * 0.2);
  if (p == 17.0) return vec3(0.84 + d.r * 0.24 + (big - 0.5) * 0.24) * wthr;
  if (p == 18.0) { float gr = texture2D(uDet, vec2(uv.x * 2.2, uv.y * 0.25)).r; return vec3(0.7 + smoothstep(0.35, 0.65, gr) * 0.45); }
  if (p == 19.0) return vec3(0.9 + d.g * 0.2);
  // (the things' materials before the stack is in: a door, a jamb and lying timber as planed wood; wicker woven; cloth; rope)
  if (p == 20.0 || p == 21.0 || (p > 29.5 && p < 33.5)) return vec3(0.88 + 0.07 * sin(uv.x * 26.0 + d.g * 5.0) + (d.g - 0.5) * 0.1) * wthr;
  if (p == 22.0 || p == 23.0) { vec2 q = uv / (p == 22.0 ? 0.05 : 0.15); return vec3(0.8 + 0.2 * abs(sin(q.x * 3.14159 + step(0.5, fract(q.y)) * 1.57)) * (0.85 + 0.15 * sin(q.y * 6.28318))); }
  if (p == 24.0 || p == 26.0 || p == 29.0) return vec3(0.92 + 0.08 * sin(uv.x * 5.0) + (d.g - 0.5) * 0.08);
  if (p == 27.0 || p == 28.0) return vec3(0.86 + (d.g - 0.5) * 0.22 + (big - 0.5) * 0.12);
  if (p == 25.0) return vec3(0.82 + 0.18 * sin((uv.x + uv.y) * 40.0));
  return vec3(1.0);
}
// (the timbers of a framed wall: posts, rails and a brace now and then)
float frameMask(vec2 uv, vec3 wp) {
  float px = fract(uv.x / 1.35); float py = fract(wp.y / 1.25);
  float post = 1.0 - smoothstep(0.075, 0.1, min(px, 1.0 - px) * 1.35); float beam = 1.0 - smoothstep(0.06, 0.085, min(py, 1.0 - py) * 1.25);
  float br = 1.0 - smoothstep(0.05, 0.075, abs(px - py) * 1.2);
  return max(max(post, beam), br * step(0.5, pHash(vec2(floor(uv.x / 1.35), floor(wp.y / 1.25)))));
}
// (which picture of the stack each pattern reads: -1 keeps the drawn one — marble, cloth)
float m3layer(float p) {
  #ifdef M3_ADOBE
  if (p == 14.0) return M3_ADOBE;
  #endif
  if (p == 1.0 || p == 13.0 || p == 14.0) return M3_PLASTER; if (p == 2.0) return M3_STONE; if (p == 3.0) return M3_BRICK; if (p == 4.0) return M3_PLANKS;
  if (p == 5.0) return M3_PLANKSH; if (p == 6.0) return M3_TILE; if (p == 7.0) return M3_SHINGLE; if (p == 8.0) return M3_THATCH; if (p == 9.0) return M3_TURF;
  if (p == 11.0) return M3_SLAB; if (p == 12.0) return M3_BEAM;
  // (the ground's own pictures lent to buildings — only if the stack has them: a stack without one draws the old way)
  #ifdef M3_SOIL
  if (p == 16.0) return M3_SOIL;
  #endif
  #ifdef M3_ROCK
  if (p == 17.0) return M3_ROCK;
  #endif
  #ifdef M3_BARK
  if (p == 18.0) return M3_BARK;
  #endif
  if (p == 30.0 || p == 31.0) return M3_BEAM;
  // (the things' materials — each only if the stack has it)
  #ifdef M3_IRON
  if (p == 19.0) return M3_IRON;
  #endif
  #ifdef M3_DOOR
  if (p == 20.0) return M3_DOOR;
  #endif
  #ifdef M3_FRAME
  if (p == 21.0 || p == 32.0 || p == 33.0) return M3_FRAME;
  #endif
  #ifdef M3_WICKER
  if (p == 22.0 || p == 23.0) return M3_WICKER;
  #endif
  #ifdef M3_CANVAS
  if (p == 15.0 || p == 24.0) return M3_CANVAS;
  #endif
  #ifdef M3_ROPE
  if (p == 25.0) return M3_ROPE;
  #endif
  #ifdef M3_LINEN
  if (p == 26.0) return M3_LINEN;
  #endif
  #ifdef M3_LEATHER
  if (p == 27.0) return M3_LEATHER;
  #endif
  #ifdef M3_FUR
  if (p == 28.0) return M3_FUR;
  #endif
  #ifdef M3_WOOL
  if (p == 29.0) return M3_WOOL;
  #endif
  #ifdef M3_MARBLE
  if (p == 10.0) return M3_MARBLE;
  #endif
  #ifdef M3_ASHLAR
  if (p == 34.0) return M3_ASHLAR;
  #endif
  #ifdef M3_TEGULA
  if (p == 35.0) return M3_TEGULA;
  #endif
  #ifdef M3_WHITEWASH
  if (p == 36.0) return M3_WHITEWASH;
  #endif
  #ifdef M3_PAINTED
  if (p == 37.0) return M3_PAINTED;
  #endif
  #ifdef M3_SANDSTONE
  if (p == 38.0) return M3_SANDSTONE;
  #endif
  #ifdef M3_STUCCO
  if (p == 39.0) return M3_STUCCO;
  #endif
  #ifdef M3_TEZONTLE
  if (p == 40.0) return M3_TEZONTLE;
  #endif
  if (p == 34.0 || p == 38.0 || p == 40.0) return M3_STONE; if (p == 35.0) return M3_TILE; if (p == 36.0 || p == 39.0) return M3_PLASTER; if (p == 37.0) return M3_PLANKS;
  return -1.0;
}
float m3scale(float p) {
  #ifdef M3S_ADOBE
  if (p == 14.0) return M3S_ADOBE;
  #endif
  if (p == 1.0 || p == 13.0 || p == 14.0) return M3S_PLASTER; if (p == 2.0) return M3S_STONE; if (p == 3.0) return M3S_BRICK; if (p == 4.0) return M3S_PLANKS;
  if (p == 5.0) return M3S_PLANKSH; if (p == 6.0) return M3S_TILE; if (p == 7.0) return M3S_SHINGLE; if (p == 8.0) return M3S_THATCH; if (p == 9.0) return M3S_TURF;
  if (p == 11.0) return M3S_SLAB; if (p == 12.0 || p == 30.0 || p == 31.0) return M3S_BEAM;
  #ifdef M3S_SOIL
  if (p == 16.0) return M3S_SOIL * 2.0;
  #endif
  #ifdef M3S_ROCK
  if (p == 17.0) return M3S_ROCK * 3.0;
  #endif
  #ifdef M3S_BARK
  if (p == 18.0) return M3S_BARK;
  #endif
  #ifdef M3S_IRON
  if (p == 19.0) return M3S_IRON;
  #endif
  #ifdef M3S_DOOR
  if (p == 20.0) return M3S_DOOR;
  #endif
  #ifdef M3S_FRAME
  if (p == 21.0 || p == 32.0 || p == 33.0) return M3S_FRAME;
  #endif
  #ifdef M3S_WICKER
  if (p == 22.0) return M3S_WICKER; if (p == 23.0) return M3S_WICKER / 3.0;
  #endif
  #ifdef M3S_CANVAS
  if (p == 15.0 || p == 24.0) return M3S_CANVAS;
  #endif
  #ifdef M3S_ROPE
  if (p == 25.0) return M3S_ROPE;
  #endif
  #ifdef M3S_LINEN
  if (p == 26.0) return M3S_LINEN;
  #endif
  #ifdef M3S_LEATHER
  if (p == 27.0) return M3S_LEATHER;
  #endif
  #ifdef M3S_FUR
  if (p == 28.0) return M3S_FUR;
  #endif
  #ifdef M3S_WOOL
  if (p == 29.0) return M3S_WOOL;
  #endif
  #ifdef M3S_MARBLE
  if (p == 10.0) return M3S_MARBLE;
  #endif
  #ifdef M3S_ASHLAR
  if (p == 34.0) return M3S_ASHLAR;
  #endif
  #ifdef M3S_TEGULA
  if (p == 35.0) return M3S_TEGULA;
  #endif
  #ifdef M3S_WHITEWASH
  if (p == 36.0) return M3S_WHITEWASH;
  #endif
  #ifdef M3S_PAINTED
  if (p == 37.0) return M3S_PAINTED;
  #endif
  #ifdef M3S_SANDSTONE
  if (p == 38.0) return M3S_SANDSTONE;
  #endif
  #ifdef M3S_STUCCO
  if (p == 39.0) return M3S_STUCCO;
  #endif
  #ifdef M3S_TEZONTLE
  if (p == 40.0) return M3S_TEZONTLE;
  #endif
  if (p == 34.0 || p == 38.0 || p == 40.0) return M3S_STONE; if (p == 35.0) return M3S_TILE; if (p == 36.0 || p == 39.0) return M3S_PLASTER; if (p == 37.0) return M3S_PLANKS;
  return 1.0;
}
`;
  // the solid material learns to draw the patterns (and fades them far away, where they would only shimmer)
  // (the cut — M3CUT, the town's solid material: what stands in the boxes the inside drawn takes is not drawn; the box round
  // them all first, so the rest of the town pays one test)
  const CUTFRAG = `#ifdef M3CUT
  if (uCutN > 0 && vPP.x > uCutLo.x && vPP.y > uCutLo.y && vPP.z > uCutLo.z && vPP.x < uCutHi.x && vPP.y < uCutHi.y && vPP.z < uCutHi.z) {
    for (int i = 0; i < 16; i++) { if (i >= uCutN) break; vec3 ca = uCutA[i], cb = uCutB[i]; if (vPP.x > ca.x && vPP.y > ca.y && vPP.z > ca.z && vPP.x < cb.x && vPP.y < cb.y && vPP.z < cb.z) discard; }
  }
  #endif
  `;
  B3.dress = function (mat) {
    mat.onBeforeCompile = sh => {
      sh.uniforms.uDet = { value: G.Ground3D.detail() }; Object.assign(sh.uniforms, G.Ground3D.U3());
      Object.assign(sh.uniforms, { uCutA: CUTU.a, uCutB: CUTU.b, uCutN: CUTU.n, uCutLo: CUTU.lo, uCutHi: CUTU.hi });
      sh.vertexShader = 'attribute float aP; varying vec3 vPP; varying vec3 vPN; flat varying float vPat;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n vPP = (modelMatrix * vec4(transformed, 1.0)).xyz; vPN = normalize(mat3(modelMatrix) * objectNormal); vPat = aP;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\n#ifdef M3CUT\nuniform vec3 uCutA[16]; uniform vec3 uCutB[16]; uniform int uCutN; uniform vec3 uCutLo; uniform vec3 uCutHi;\n#endif\n' + G.Ground3D.texGLSL() + PFRAG)
        .replace('#include <clipping_planes_fragment>', CUTFRAG + '#include <clipping_planes_fragment>').replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        float pp = floor(vPat + 0.5);
        // (an anchored door — Build3D.doorPat: where its leaf starts along the wall and up, its width, which leaf of the picture)
        vec4 dA = vec4(0.0);
        if (pp > ${DOORQ - 0.5}) { float q = pp - ${DOORQ}.0; dA.x = mod(q, 256.0) * 0.02; q = floor(q / 256.0); dA.y = mod(q, 256.0) * 0.02; q = floor(q / 256.0); dA.z = 0.6 + mod(q, 16.0) * 0.05; dA.w = floor(q / 16.0); pp = 20.0; }
        #ifdef NOPAT
        pp = 0.0;
        #endif
        if (pp > 0.5) {
          vec3 pn = normalize(vPN); vec3 pt = abs(pn.y) > 0.92 ? vec3(1.0, 0.0, 0.0) : normalize(vec3(-pn.z, 0.0, pn.x)); vec3 pb = normalize(cross(pn, pt)); if (pb.y < 0.0) pb = -pb;
          vec2 puv = vec2(dot(vPP, pt), dot(vPP, pb));
          vec2 bump; vec3 pk = pattern(pp, puv, vPP, bump);
          float fade = 1.0 - smoothstep(30.0, 90.0, length(vViewPosition));
          // (the material's picture once the stack is in — mipmapped, so it never shimmers far off; roofs read down the slope)
          float L = m3layer(pp);
          if (uTexOn > 0.5 && L >= 0.0) {
            bool roof = (pp > 5.5 && pp < 9.5) || pp == 35.0; vec2 tu = puv * m3scale(pp); if (roof) tu.y = -tu.y;
            // (a lying beam or jamb — along X: 30, 32; along Z: 31, 33 — its grain level on every upright face, and along it on top)
            bool turn = pp > 29.5 && pp < 33.5 && (abs(pn.y) < 0.92 || mod(pp, 2.0) < 0.5);
            if (turn) tu = tu.yx;
            // (an anchored door: one leaf of the picture across its own width, from its foot up)
            vec2 ts = vec2(m3scale(pp));
            // (half a metre of slack before the start: the 2 cm the anchor is rounded to never wraps round to the far edge)
            if (dA.z > 0.0) { tu = vec2((dA.w + clamp((mod(puv.x - dA.x + 0.5, 4.0) - 0.5) / dA.z, 0.004, 0.996)) * 0.5, (mod(puv.y - dA.y + 0.5, 4.0) - 0.5) * ts.y); ts.x = 0.5 / dA.z; }
            vec4 tx = m3raw(L, tu); pk = m3col(tx) * 0.94;
            if (pp == 13.0) { vec4 tb = m3raw(M3_BEAM, puv * M3S_BEAM); pk = mix(pk, m3col(tb) * 0.34, frameMask(puv, vPP)); }
            vec2 sl = m3slope(L, tu, tx.a); if (roof) sl.y = -sl.y; if (turn) sl = sl.yx;
            bump = -sl * ts * 0.03;
            diffuseColor.rgb *= pk;
          } else diffuseColor.rgb *= mix(vec3(0.88), pk, fade);
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
  const rgbOf = c => (typeof c === 'string' ? G.hex2rgb(c) : c);
  const mixc = (a, b, t) => { a = rgbOf(a); b = rgbOf(b); return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; };
  // (a colour calmed: less saturated (sat) and darker (val) — the palette's bright paint as weathered stuff has it)
  const calm = (c, sat, val) => { c = rgbOf(c); const l = c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11; return [G.clamp((l + (c[0] - l) * sat) * val, 0, 255), G.clamp((l + (c[1] - l) * sat) * val, 0, 255), G.clamp((l + (c[2] - l) * sat) * val, 0, 255)]; };
  // (a colour to a step of 3: the colours of a sheet repeat, and the colour cache keeps up)
  const qc = c => [Math.round(G.clamp(c[0], 0, 255) / 3) * 3, Math.round(G.clamp(c[1], 0, 255) / 3) * 3, Math.round(G.clamp(c[2], 0, 255) / 3) * 3];
  // soft noise over the world's metres: the patches of moss and dry turf, the damp, the stains — the same at every visit
  function vnoise(x, z, s) {
    const xi = Math.floor(x), zi = Math.floor(z), fx = x - xi, fz = z - zi; const u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
    const h = (a, b) => G.hash((a * 73856093) ^ (b * 19349663) ^ (s * 83492791));
    const a = h(xi, zi), b = h(xi + 1, zi), c = h(xi, zi + 1), d = h(xi + 1, zi + 1);
    return (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v;
  }
  // (heights of the buildings, in metres: the camera and the far picture use them too)
  const HEIGHT = { hut: 4.4, house: 5.2, sobrado: 8.4, insula: 14, quarteirao: 15, barraco: 3, storehouse: 6.5, armazem: 7, celeiro: 7, workshop: 5.5, forja: 6, olaria: 5, tecelagem: 5.5, ourives: 5.5, perolaria: 5, sericultura: 5, acougue: 5, temple: 10, monument: 13, estatua: 7, maravilha: 26, palacio: 14, paco: 12, administracao: 9, coletoria: 7, biblioteca: 9, teatro: 7, banhos: 7, cadeia: 6, quartel: 6, torre: 12, taverna: 7.5, mercado: 3.2, feira: 3, mercado_negro: 3, doca: 1.2, mina: 4, apiario: 1.6, curral: 1.4, estabulo: 5, cercado: 1.5, farm: 1, horta: 0.8, plantacao: 1.2, vinhedo: 1.8, pomar: 4, well: 2.6, campfire: 0.6, cemetery: 1.2, praca: 3, aqueduto: 7, ruin: 2.5 };
  B3.height = b => HEIGHT[b.type] || 5;

  // ------------------------------ the kit ------------------------------
  // (everything in metres, from the corner of the footprint: a building is a little world of its own, then put in place)
  function kit(g, b, gp, gq, fine) {
    const L = TL(); const x0 = b.x * L, z0 = b.y * L, w = b.w * L, d = b.h * L;
    // the ground under the footprint: the base stands on the lowest point and reaches the highest
    // (the floor: a house stands on a plinth, as the god's view draws it; a field, a fence, a square lies on the ground — L-105;
    // the body's feet read the same: Space.plinth)
    const { lo, hi, y0 } = G.Space.plinth(b);
    g.ao = () => lo; // (its walls darken toward the ground)
    const P = palOf(b); const hurt = b.maxHp ? G.clamp(b.hp / b.maxHp, 0, 1) : 1; const soot = hurt < 0.6 ? 0.55 + hurt * 0.75 : 1;
    const c = cc => (soot < 1 ? (typeof cc === 'function' ? (X, Y, Z, a, b2, d2) => dim(cc(X, Y, Z, a, b2, d2), soot) : dim(cc, soot)) : cc);
    const K = {
      g, b, P, L, x0, z0, w, d, y0, lo, hi, st: styleOf(b), cx: x0 + w / 2, cz: z0 + d / 2, c, built: b.built, prog: b.built ? 1 : G.clamp(b.progress || 0, 0, 1), hurt,
      gp: gp || R3.Geo(), gq: gq || R3.WGeo(), // (the plants that sway, and the water of a paddy)
      // (a beam or a jamb lying down — longer across than up — takes its turned picture, the grain along it)
      box(x, y, z, sx, sy, sz, col, ry) { const p = g.pat; if (!ry && (p === 12 || p === 21) && Math.max(sx, sz) > sy * 1.3) g.pat = (p === 12 ? 30 : 32) + (sz > sx ? 1 : 0);
        g.put(SH.box, R3.mat(x0 + x, y0 + y, z0 + z, ry || 0, sx, sy, sz), c(col)); g.pat = p; },
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
      // (a triangle with a colour at each corner)
      tri3(a, b2, d2, ca, cb, cd, out) { const A = [x0 + a[0], y0 + a[1], z0 + a[2]], B = [x0 + b2[0], y0 + b2[1], z0 + b2[2]], D = [x0 + d2[0], y0 + d2[1], z0 + d2[2]];
        const ux = B[0] - A[0], uy = B[1] - A[1], uz = B[2] - A[2], vx = D[0] - A[0], vy = D[1] - A[1], vz = D[2] - A[2];
        if (out && (uy * vz - uz * vy) * out[0] + (uz * vx - ux * vz) * out[1] + (ux * vy - uy * vx) * out[2] < 0) g.tri(A, D, B, c(ca), c(cd), c(cb)); else g.tri(A, B, D, c(ca), c(cb), c(cd)); },
      // the pattern of what is put next (Build3D.PAT, or a code: an anchored door), and back to plain after fn
      as(pat, fn) { const o = g.pat; g.pat = typeof pat === 'number' ? pat : PAT[pat] || 0; fn(); g.pat = o; },
      // the house's own dice: the same house is always the same house (its id, never chance)
      hv: k => hvOf(b, k),
      // a slanted box: its base's middle at o, u its length, v its height, w its depth (vectors in metres) — boards that
      // follow a slope, braces, rafters
      para(o, u, v, w, col) {
        const s = (u[1] * v[2] - u[2] * v[1]) * w[0] + (u[2] * v[0] - u[0] * v[2]) * w[1] + (u[0] * v[1] - u[1] * v[0]) * w[2] < 0 ? -1 : 1; // (never a mirror: its faces would turn inside out)
        PM.set(u[0], v[0], w[0] * s, x0 + o[0], u[1], v[1], w[1] * s, y0 + o[1], u[2], v[2], w[2] * s, z0 + o[2], 0, 0, 0, 1); g.put(SH.box, PM, c(col));
      },
      // a board along the line from a to b (its middle), wv across it and tv through it (whole widths)
      bar(a, b2, wv, tv, col) { K.para([(a[0] + b2[0] - wv[0]) / 2, (a[1] + b2[1] - wv[1]) / 2, (a[2] + b2[2] - wv[2]) / 2], [b2[0] - a[0], b2[1] - a[1], b2[2] - a[2]], wv, tv, col); },
      // a log, a round post or a rail from a to b, r its radius (r2: squashed, the second way round)
      log(a, b2, r, col, r2, geo) {
        const d = [b2[0] - a[0], b2[1] - a[1], b2[2] - a[2]]; const l = Math.hypot(d[0], d[1], d[2]) || 1;
        let e1 = Math.abs(d[1]) / l > 0.9 ? [1, 0, 0] : [-d[2], 0, d[0]]; const l1 = Math.hypot(e1[0], e1[1], e1[2]) || 1; e1 = [e1[0] / l1, e1[1] / l1, e1[2] / l1];
        let e2 = [(d[1] * e1[2] - d[2] * e1[1]) / l, (d[2] * e1[0] - d[0] * e1[2]) / l, (d[0] * e1[1] - d[1] * e1[0]) / l];
        if ((e1[1] * d[2] - e1[2] * d[1]) * e2[0] + (e1[2] * d[0] - e1[0] * d[2]) * e2[1] + (e1[0] * d[1] - e1[1] * d[0]) * e2[2] < 0) e2 = [-e2[0], -e2[1], -e2[2]];
        const ra = r * 2, rb = (r2 || r) * 2; PM.set(e1[0] * ra, d[0], e2[0] * rb, x0 + a[0], e1[1] * ra, d[1], e2[1] * rb, y0 + a[1], e1[2] * ra, d[2], e2[2] * rb, z0 + a[2], 0, 0, 0, 1); g.put(geo || SH.cyl, PM, c(col));
      },
      // (a timber's end from a, in the wall, out to b: eight sides, chamfered at b)
      peg(a, b2, r, col) { K.log(a, b2, r, col, r, PEG || SH.cyl); },
      // a smooth sheet: a grid of points (nu + 1 across, nv + 1 down, row after row), its normals rounded between them,
      // seen from 'out'; col a colour or a function of the point and its normal (patches of moss, a damp edge)
      sheet(Pp, nu, nv, col, out) {
        const n1 = nu + 1; const NN = new Float32Array(n1 * (nv + 1) * 3);
        for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
          const a = Pp[j * n1 + Math.max(0, i - 1)], b2 = Pp[j * n1 + Math.min(nu, i + 1)], e = Pp[Math.max(0, j - 1) * n1 + i], f = Pp[Math.min(nv, j + 1) * n1 + i];
          const ux = b2[0] - a[0], uy = b2[1] - a[1], uz = b2[2] - a[2], vx = f[0] - e[0], vy = f[1] - e[1], vz = f[2] - e[2];
          const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1; const q = (j * n1 + i) * 3; NN[q] = nx / l; NN[q + 1] = ny / l; NN[q + 2] = nz / l;
        }
        const mq = ((nv >> 1) * n1 + (nu >> 1)) * 3; const flip = !!out && NN[mq] * out[0] + NN[mq + 1] * out[1] + NN[mq + 2] * out[2] < 0; const sg = flip ? -1 : 1;
        const pos = new Float32Array(nu * nv * 18), nor = new Float32Array(nu * nv * 18); let k = 0;
        const push = (i, j) => { const p = Pp[j * n1 + i], q = (j * n1 + i) * 3; pos[k] = x0 + p[0]; pos[k + 1] = y0 + p[1]; pos[k + 2] = z0 + p[2]; nor[k] = NN[q] * sg; nor[k + 1] = NN[q + 1] * sg; nor[k + 2] = NN[q + 2] * sg; k += 3; };
        for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
          if (!flip) { push(i, j); push(i + 1, j); push(i + 1, j + 1); push(i, j); push(i + 1, j + 1); push(i, j + 1); }
          else { push(i, j); push(i + 1, j + 1); push(i + 1, j); push(i, j); push(i, j + 1); push(i + 1, j + 1); }
        }
        g.put({ attributes: { position: { array: pos }, normal: { array: nor } }, index: null }, IDM, typeof col === 'function' ? (X, Y, Z, a, b2, d2) => c(col(X, Y, Z, a, b2, d2)) : c(col));
      },
      // (detail that only the closer qualities carry: hinges, hooks, battens)
      fine: fine !== undefined ? !!fine : !!(R3.Q && R3.Q().detail),
      lit: null, // (while a chunk is drawn near: the panes that light up at night — B3.lamps)
      // the base: stone from the lowest ground up to the floor (on a slope it shows; on flat ground it is a step) — under
      // the whole lot, unless the building laid its own footing of stones under its walls (footed)
      footed: false,
      plinth() { if (!BASELESS[b.type]) K.as(stuff(b).base, () => g.put(SH.box, R3.mat(x0 + w / 2, lo - 0.2, z0 + d / 2, 0, w - 0.2, y0 - lo + 0.2, d - 0.2), c(P.base ? P.base[0] : '#8a8478'))); },
      // (the local height of the ground at a point of the lot: what stands outside the walls of a footed house stands on it —
      // the ground as its mesh draws it, so what lies on it lies on what is seen: drawnAt)
      gy: (x, z) => drawnAt(Math.min(N - 0.001, (x0 + x) / L), Math.min(N - 0.001, (z0 + z) / L)) - y0,
    };
    return K;
  }
  const BASELESS = G.Space.BASELESS;
  // a building drawn whole: its type's shapes, then its base (the plinth under the lot, unless it stands on its own footing),
  // then what lies about it (Props3D: only seen, and only where the machine carries detail)
  function draw(g, gw, K, props) {
    const S = B3.shellOf(K.b);
    if (S) shellHouse(g, gw, K, S); else { const f = KIT[K.b.type]; if (f) f(g, gw, K); else house(g, gw, K); }
    if (!K.footed) K.plinth();
    if (props && K.fine && G.Props3D && K.prog >= 1) G.Props3D.into(K);
  }
  // (stones laid round a footing: courses from the floor down to the ground, each stone its own size and tone — the
  // house's id, not chance; the core behind them reaches below the lowest ground)
  function footing(K, x, z, sx, sz, dressed, ring) {
    const P = K.P; const base = P.base || ['#8a8478', '#6f6a60', '#a09a8e']; K.footed = true; // (dressed: squared blocks in even courses, as the classical lands lay them)
    // (ring: a building drawn from its shell stands on the faces of its footing and its top's ledge round the walls — never a
    // block under its floor: a cellar is there)
    if (ring) { const lo = K.lo - K.y0 - 0.2; const c0 = dim(base[1], 0.78), c1 = dim(base[1], 0.86); const R = [x - sx / 2, z - sz / 2, x + sx / 2, z + sz / 2], RR = [R[0] - 0.04, R[1] - 0.04, R[2] + 0.04, R[3] + 0.04];
      K.as('stone', () => { for (const sd of ['N', 'E', 'S', 'W']) { const F = rside(RR, sd); K.quad(F.P(F.u0, lo, 0), F.P(F.u1, lo, 0), F.P(F.u1, 0, 0), F.P(F.u0, 0, 0), c0, F.out); }
        for (const r of cutRect(RR, [R])) flatQ(K, r, 0, c1, 1); }); }
    else K.as('stone', () => K.box(x, K.lo - K.y0 - 0.2, z, sx + 0.08, K.y0 - K.lo + 0.2, sz + 0.08, dim(base[1], 0.78)));
    if (!K.fine) return;
    // (an old house on damp ground has moss on its stones — more on the lower courses, on some stones more than others)
    const mossy = G.clamp((K.hv(3) + K.hv(4)) * 0.5 - 0.28, 0, 0.42) * (dressed ? 0.5 : 1);
    const sides = [[[x - sx / 2, z + sz / 2], [x + sx / 2, z + sz / 2], [0, 1]], [[x + sx / 2, z - sz / 2], [x - sx / 2, z - sz / 2], [0, -1]], [[x + sx / 2, z + sz / 2], [x + sx / 2, z - sz / 2], [1, 0]], [[x - sx / 2, z - sz / 2], [x - sx / 2, z + sz / 2], [-1, 0]]];
    let n = 0;
    K.as(dressed ? (K.st === 'grego' ? 'marble' : 'ashlar') : 'rock', () => { for (const [A0, B, o] of sides) { // (dressed: the people's cut stone)
      const len0 = Math.hypot(B[0] - A0[0], B[1] - A0[1]); const dx = (B[0] - A0[0]) / len0, dz = (B[1] - A0[1]) / len0;
      const A = [A0[0] - dx * 0.17, A0[1] - dz * 0.17], len = len0 + 0.17; // (each side starts round its corner: no notch there)
      for (let row = 0, top = 0; row < 6; row++) {
        const ch = dressed ? 0.3 : 0.27 + K.hv(200 + row) * 0.1; let any = false;
        for (let t = row % 2 ? (dressed ? -0.3 : -0.18) : 0; t < len;) {
          const h1 = K.hv(300 + n), h2 = K.hv(500 + n), h3 = K.hv(700 + n); n++;
          const l = Math.min(len - t, dressed ? 0.6 : 0.34 + h1 * 0.34); if (l < 0.12) break; const m = Math.max(0, t) + (Math.min(len, t + l) - Math.max(0, t)) / 2;
          const pr = dressed ? 0.05 : 0.05 + h2 * 0.035; const px = A[0] + dx * m + o[0] * pr, pz = A[1] + dz * m + o[1] * pr;
          // (a stone shows where its top clears the ground at both its ends and its face — on a slope the ground came through
          // the top of the stones at the ground's line: Build3D.check, lying faces cut by the ground; the core shows there)
          const hl = (Math.min(len, t + l) - Math.max(0, t)) / 2, gHi = Math.max(K.gy(px - dx * hl, pz - dz * hl), K.gy(px + dx * hl, pz + dz * hl), K.gy(px + o[0] * 0.2, pz + o[1] * 0.2));
          if (top - ch * 0.15 > K.gy(px, pz) && top - 0.03 > gHi) { any = true; let cc = dressed ? mixc(base[0], base[2], h1 * 0.6).map(v => v * (0.94 + h3 * 0.1)) : mixc(base[Math.floor(h1 * 3)], base[Math.floor(h3 * 2.99)], 0.5 * h2).map(v => v * (0.86 + h3 * 0.26));
            if (mossy) cc = mixc(cc, [84, 100, 60], mossy * (0.45 + row * 0.22) * (h2 > 0.45 ? 1 : 0.25));
            K.rbox(px, top - ch + 0.01, pz, Math.min(len, t + l) - Math.max(0, t) - (dressed ? 0.02 : 0.035), ch - (dressed ? 0.02 : 0.035), dressed ? 0.2 : 0.2 + h3 * 0.08, cc, Math.atan2(-dz, dx) + (dressed ? 0 : (h2 - 0.5) * 0.08), 0, dressed ? 0 : (h3 - 0.5) * 0.05); }
          t += l;
        }
        top -= ch; if (!any) break;
      }
    } });
  }
  // tall grass at the foot of the walls, where the ground round the house is grass and the snow does not lie (the ground's own
  // snow: Realm.snowAt, the one the land, the trees and the grass read), none before the door: the house sits in the ground
  function wallGrass(K, x, z, sx, sz, door) {
    if (!K.fine) return; const S = G.S, T = G.T, L = K.L; let k = 0;
    const grassy = (X, Z) => { const tx = Math.floor((K.x0 + X) / L), ty = Math.floor((K.z0 + Z) / L); if (!W.inb(tx, ty)) return false; const i = ty * N + tx;
      const t = S.type[i]; const snow = R3.snowAt ? R3.snowAt(i) : S.temp ? G.clamp((0.235 - S.temp[i] / 255) / 0.07, 0, 1) : 0; return (t === T.GRASS || t === T.MEADOW) && snow < 0.45 && !(S.burnt[i] > 0) && !S.road[i]; };
    for (const W2 of wallsOf(sx, sz)) { const n = Math.floor(W2.len / 0.24);
      for (let q = 0; q < n; q++) { const h1 = K.hv(800 + k), h2 = K.hv(1000 + k); k++; const a = -W2.len / 2 + (q + 0.2 + h1 * 0.6) * W2.len / n;
        if (door && door.side === W2.side && Math.abs(a - door.a) < door.w / 2 + 0.35) continue; if (h2 < 0.25) continue;
        const out = 0.2 + h2 * 0.14; const px = x + (W2.ax ? a : W2.o[0] * (sx / 2 + out)), pz = z + (W2.ax ? W2.o[1] * (sz / 2 + out) : a); if (!grassy(px, pz)) continue;
        const X = K.x0 + px, Z = K.z0 + pz, Y = K.y0 + K.gy(px, pz) - 0.02; const len = 0.22 + h1 * 0.3;
        for (let b = 0; b < 2; b++) { const ang = h1 * 9 + b * 2.2; const lean = 0.08 + b * 0.05; K.gp.blade(X, Y, Z, 0.07, ang, X + W2.o[0] * lean + Math.cos(ang) * 0.05, Y + len * (1 - b * 0.25), Z + W2.o[1] * lean + Math.sin(ang) * 0.05, [74, 96, 48], mixc([128, 146, 78], [176, 168, 104], h2 * 0.7), 0.7); } } }
  }
  // (how far it is from a wall of a body (centre x, z, sx × sz) facing o to the edge of its lot)
  const stripOf = (K, x, z, sx, sz, o) => (o[0] > 0 ? K.w - (x + sx / 2) : o[0] < 0 ? x - sx / 2 : o[1] > 0 ? K.d - (z + sz / 2) : z - sz / 2);
  // the steps before a door, from its sill (top, local) down to the ground: one stone where the drop is small (sd1 its depth
  // at most); else a flight, each riser what the drop needs (at most 26 cm), each stone down to its own ground — on a slope a
  // door is reached, not climbed to: straight out where the room before the door allows (treads of 22–32 cm), or else a
  // landing before the door and the flight down along the wall, to the side with more of it (free: how much wall there is
  // from the door's middle to each end); else as many as fit. D, bx: the door's frame (a along the wall, y up, n out of it);
  // w the steps' width; room how far out from n0 they may go. Gives back where a flight along the wall stands ([a, width]
  // from the door's middle — nothing else is put there), or null
  function doorSteps(K, D, bx, w, room, n0, top, sd1, col, pat, free) {
    const gAt = (a, n) => { if (!K.footed) return -0.4; const p = D(a, 0, n); return K.gy(p[0], p[2]); };
    // (the highest ground under a tread a along the wall and n out, ta × tn: a step it would come through is not laid — the
    // ground is reached there)
    const under = (a, n, ta, tn) => Math.max(gAt(a, n), gAt(a - ta / 2, n), gAt(a + ta / 2, n), gAt(a, n - tn / 2), gAt(a, n + tn / 2), gAt(a - ta / 2, n + tn / 2), gAt(a + ta / 2, n + tn / 2));
    const tone = k => dim(col, 0.94 + K.hv(260 + k) * 0.1);
    // (how deep a tread of ta at a, from n, may go before the ground as it is drawn — on a plinth too: beyond the lot it may
    // rise — comes up to its top yt: a step stops where the ground meets it)
    const gT = (a, n) => { const p = D(a, 0, n); return K.gy(p[0], p[2]); };
    const reach = (a, ta, n, sd, yt) => { let d = 0; for (let j = 1; j <= 4; j++) { const q = n + sd * j / 4; if (Math.max(gT(a, q), gT(a - ta / 2, q), gT(a + ta / 2, q)) > yt - 0.025) break; d = sd * j / 4; } return d; };
    const drop = top - gAt(0, n0 + 0.3), need = Math.min(8, Math.ceil(drop / 0.26)), nOut = Math.floor(room / 0.22);
    const out = (n, rise) => { const t = Math.min(0.32, room / n); K.as(pat, () => { for (let k = 0; k < n; k++) { const sn = n0 + (k + 0.5) * t, yt = top - k * rise; if (k && yt < under(0, sn, w, t) + 0.03) break; const gy = Math.min(yt - rise, gAt(0, sn)) - 0.04;
      bx((K.hv(262 + k) - 0.5) * 0.04, gy, sn, w - k * 0.02, yt - gy, t + 0.02, tone(k)); } }); };
    const one = () => { const sd = reach(0, w, n0, Math.min(sd1, room), top); if (sd < 0.1) return null; const sn = n0 + sd / 2; const gy = Math.min(top - 0.4, gAt(0, sn) - 0.04); K.as(pat, () => bx(0, gy, sn, w, top - gy, sd, col)); return null; };
    if (drop <= 0.5 || need < 2 || (nOut < 2 && !free)) return one();
    if (nOut >= need) { out(need, drop / need); return null; }
    // (the side with room for it; of two, the one whose ground is higher where the flight would end — the shorter way down)
    const dp = Math.min(room, 0.6), sn = n0 + dp / 2; let sg = 0, run = 0, hi = -1e9;
    if (free && room >= 0.3) for (const s of [1, -1]) { const r = free[s > 0 ? 1 : 0] - w / 2 - 0.3; if (r < (need - 1) * 0.24) continue; const g = gAt(s * (w / 2 + (need - 1) * 0.28), sn); if (g > hi) { hi = g; sg = s; run = r; } }
    if (sg) {
      const rise = G.clamp((top - hi) / need, 0.12, 0.26), t = Math.min(0.32, run / (need - 1));
      K.as(pat, () => { const gy = Math.min(top - rise, gAt(0, sn)) - 0.04; bx(0, gy, sn, w, top - gy, dp, col); // (the landing)
        for (let k = 1; k < need; k++) { const a = sg * (w / 2 + (k - 0.5) * t), yt = top - k * rise; if (yt < under(a, sn, t, dp) + 0.03) break; const gk = Math.min(yt - rise, gAt(a, sn)) - 0.04; bx(a, gk, sn, t + 0.02, yt - gk, dp - k * 0.01, tone(k)); } });
      return [sg * (need - 1) * t / 2, w + (need - 1) * t];
    }
    if (nOut < 2) return one();
    out(nOut, 0.26); return null;
  }
  // which side the door opens to (the side people come out of — the world's own door)
  function doorSide(b) {
    const dr = G.Vg.door(b); const cx = b.x + b.w / 2, cy = b.y + b.h / 2; const dx = dr[0] - cx, dy = dr[1] - cy;
    return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'E' : 'W') : (dy > 0 ? 'S' : 'N');
  }
  B3.doorSide = doorSide;
  // windows and a door on the walls of a box-shaped house, as each people makes them: panes (lit at night) in frames of
  // the people's trim, a sill of stone under each, a lintel over it; shutters in the classical and the Greek towns (open
  // against the wall, or half shut: the house's id), a grille of wood high in an Egyptian wall, iron bars on a Roman
  // street, a painted frame in the Aztec's. The door of planks with its panels, frame and lintel, its iron, the step before
  // it down to the ground; a little pediment over a Roman door, a light over a Greek one, the stepped lintel of the Aztec
  function openings(g, gw, K, x, z, sx, sz, y, h, floors, door) {
    const side = doorSide(K.b); const P = K.P; const fh = h / floors; const st = styleOf(K.b);
    const framed = st !== 'nordico' && st !== 'egipcio'; const shut = (st === 'classico' || st === 'grego') && K.b.type !== 'insula'; const tc = st === 'asteca' ? (P.trim2 || P.trim) : (P.trim || '#6b4a30');
    const stone = P.base ? P.base[2] : '#a09a8e'; const cut = st === 'grego' ? 'marble' : st === 'romano' ? 'ashlar' : st === 'egipcio' ? 'sandstone' : 'stone'; const sh2 = st === 'grego' ? (P.trim || '#3f6fb0') : [[86, 104, 70], [104, 74, 50], [70, 92, 104]][Math.floor(K.hv(17) * 3)];
    let wk = 0; const fc = calm(tc, 0.75, 0.9); // (the people's trim calmed on a frame: a strong red only in small things)
    const wcol = K.wallCol || P.wl || '#efe2c4', wpat = K.wallPat || (stuff(K.b).wall === 'frame' ? 'plaster' : stuff(K.b).wall); const RV = st === 'egipcio' ? 0.22 : 0.16; // (the wall's thickness: 15–25 cm of reveal)
    // (a window on the face whose outward direction is (ox, oz), at (px, py, pz), ww wide and hh high: the pane at the back of a
    // reveal as deep as the wall is thick — its sides of the wall's own stuff — the frame at its mouth, a sill under it; what
    // closes it by the people and the house's id: shutters, iron bars, a grille, a rolled mat)
    const win = (px, py, pz, ox, oz, ww, hh) => {
      const ax = oz !== 0; const k = wk++; // (the face runs along X)
      gw.put(SH.box, R3.mat(K.x0 + px + ox * 0.004, K.y0 + py, K.z0 + pz + oz * 0.004, ax ? 0 : Math.PI / 2, ww, hh, 0.02), '#2a3440'); if (K.lit) K.lit.push([K.x0 + px + ox * 0.05, K.y0 + py + hh / 2, K.z0 + pz + oz * 0.05, ox, oz]);
      // (a piece at dx along the face, dy up from the pane's foot, n out of the wall; w2 along, h2 high, d2 deep)
      const fx = (dx, dy, w2, h2, d2, col, n) => { const nn = n === undefined ? RV + 0.02 : n; K.box(px + ox * nn + (ax ? dx : 0), py + dy, pz + oz * nn + (ax ? 0 : dx), ax ? w2 : d2, h2, ax ? d2 : w2, col || fc); };
      const tw = 0.1; K.as(wpat, () => { for (const s2 of [-1, 1]) fx(s2 * (ww / 2 + tw / 2), -0.06, tw, hh + 0.06 + tw, RV, wcol, RV / 2); fx(0, hh, ww, tw, RV, wcol, RV / 2); fx(0, -0.06, ww, 0.06, RV, wcol, RV / 2); });
      if (framed) { const fw = st === 'asteca' ? 0.13 : 0.09;
        fx(0, -0.08, ww + 0.2, 0.08, 0.05, fc); fx(0, hh, ww + 0.2, 0.09, 0.05, fc); fx(-ww / 2 - 0.05, 0, fw, hh, 0.05, fc); fx(ww / 2 + 0.05, 0, fw, hh, 0.05, fc); if (st === 'classico' || st === 'grego') fx(0, 0, 0.05, hh, 0.04, fc, 0.03); }
      K.as(cut, () => K.box(px + ox * (RV + 0.06), py - 0.14, pz + oz * (RV + 0.06), ax ? ww + 0.3 : 0.2, 0.08, ax ? 0.2 : ww + 0.3, stone));
      // (a lintel of stone over it in the stone-building lands)
      if (st === 'romano' || st === 'grego' || st === 'egipcio') K.as(st === 'egipcio' ? 'stucco' : cut, () => fx(0, hh + 0.09, ww + 0.34, 0.12, 0.08, st === 'egipcio' ? (P.trim || '#2f8f8a') : stone));
      const r = K.hv(130 + k); // (what closes it, by the house's id)
      if (st === 'egipcio') K.as('beam', () => { for (const e of [-0.22, 0, 0.22]) fx(e * ww, 0, 0.035, hh, 0.04, '#5a4430', 0.06); });
      if (st === 'romano' && K.fine && r < 0.45) K.as('iron', () => { for (const e of [-0.25, 0.25]) fx(e * ww, 0, 0.025, hh, 0.04, '#2e2c2a', 0.08); fx(0, hh * 0.5, ww, 0.025, 0.03, '#2e2c2a', 0.08); });
      if (st === 'asteca' && K.fine && r < 0.4) K.as('wicker', () => fx(0, hh - 0.16, ww + 0.04, 0.16, 0.16, [176, 150, 98], RV + 0.1)); // (a mat of reed, rolled up)
      // (a box of flowers under some windows of the classical and the southern towns — the house's id: geraniums, a white one)
      if (K.fine && (st === 'classico' || st === 'grego' || st === 'romano') && K.hv(120 + k) < 0.32) {
        K.as('jamb', () => K.box(px + ox * (RV + 0.18), py - 0.36, pz + oz * (RV + 0.18), ax ? ww + 0.08 : 0.2, 0.2, ax ? 0.2 : ww + 0.08, dim(fc, 0.9)));
        const fl = [[204, 62, 56], [222, 112, 140], [236, 230, 214]][Math.floor(K.hv(125 + k) * 3)];
        for (let q = 0; q < 6; q++) { const t = (q + 0.5) / 6 - 0.5, a = t * ww; const X = K.x0 + px + ox * (RV + 0.19) + (ax ? a : 0), Z = K.z0 + pz + oz * (RV + 0.19) + (ax ? 0 : a), Y = K.y0 + py - 0.17; const ang = q * 1.9 + k;
          K.gp.blade(X, Y, Z, 0.09, ang, X + ox * 0.12 + Math.cos(ang) * 0.05, Y + 0.24, Z + oz * 0.12 + Math.sin(ang) * 0.05, [62, 104, 46], q % 2 ? [84, 140, 62] : fl, 0.5); }
      }
      // (shutters: open flat on the wall beside the reveal, or half shut over its mouth — the classical town's all, most Greek ones,
      // some Roman ones)
      const sh = shut ? (st === 'grego' ? r < 0.78 : true) : st === 'romano' && K.b.type !== 'insula' && r >= 0.45 && r < 0.75;
      if (sh) K.as('painted', () => { const open = K.hv(110 + k) < 0.7; for (const s2 of [-1, 1]) { if (open) fx(s2 * (ww / 2 + tw + ww / 4 + 0.03), 0, ww * 0.5, hh, 0.04, sh2, 0.03); else fx(s2 * ww * 0.25, 0, ww * 0.5, hh, 0.05, sh2, RV + 0.06); } });
    };
    for (let f = 0; f < floors; f++) {
      const wy = y + f * fh + fh * 0.36, wh = Math.min(1.15, fh * 0.38);
      // (an Egyptian house opens little to the sun: its windows small and high)
      const ww = st === 'egipcio' ? 0.5 : 0.72, wh2 = st === 'egipcio' ? wh * 0.6 : wh, wy2 = st === 'egipcio' ? wy + wh * 0.45 : wy;
      const nx = Math.max(1, Math.floor(sx / 2.3)), nz = Math.max(1, Math.floor(sz / 2.3));
      for (let k = 0; k < nx; k++) { const px = x - sx / 2 + sx * (k + 0.5) / nx; if (!(f === 0 && side === 'S' && k === Math.floor(nx / 2))) win(px, wy2, z + sz / 2, 0, 1, ww, wh2); if (!(f === 0 && side === 'N' && k === Math.floor(nx / 2))) win(px, wy2, z - sz / 2, 0, -1, ww, wh2); }
      for (let k = 0; k < nz; k++) { const pz = z - sz / 2 + sz * (k + 0.5) / nz; if (!(f === 0 && side === 'E' && k === Math.floor(nz / 2))) win(x + sx / 2, wy2, pz, 1, 0, ww, wh2); if (!(f === 0 && side === 'W' && k === Math.floor(nz / 2))) win(x - sx / 2, wy2, pz, -1, 0, ww, wh2); }
    }
    if (door === false) return;
    const dc = P.door || '#5a3b25', dw = 1.0, dh = Math.min(2.1, fh * 0.82);
    const o = { S: [0, 1], N: [0, -1], E: [1, 0], W: [-1, 0] }[side]; const ax = o[1] !== 0;
    const dx = x + o[0] * (sx / 2), dz = z + o[1] * (sz / 2);
    // (in the door's frame: a along the wall, n out of it)
    const bx = (a, yy, n, wa, hy, wn, col) => K.box(dx + (ax ? a : 0) + o[0] * n, yy, dz + (ax ? 0 : a) + o[1] * n, ax ? wa : wn, hy, ax ? wn : wa, col);
    // (the leaf, as each people makes it: the classical town's planks with strap hinges and nails — one leaf of the stack's door
    // picture, hinged left or right by the house's id; the Greek's and the Aztec's painted; the Roman's and the Greek's panelled,
    // rails and a stile of planed wood; the Egyptian's plain planks)
    const strap = st === 'classico', painted = st === 'grego' || st === 'asteca', panel = st === 'romano' || st === 'grego'; const lf = K.hv(19) < 0.5 ? 0 : 1;
    K.as(strap ? doorPat(K.x0 + dx + o[0] * 0.03, K.y0 + y, K.z0 + dz + o[1] * 0.03, o, dw, lf) : painted ? 'painted' : 'plankV', () => bx(0, y, 0.03, dw, dh, 0.1, dc));
    if (panel) K.as(painted ? 'painted' : 'jamb', () => { for (const f of [0.2, 0.55, 0.88]) bx(0, y + dh * f - 0.04, 0.085, dw - 0.06, 0.08, 0.02, dim(dc, 0.82)); bx(0, y + 0.08, 0.085, 0.07, dh - 0.16, 0.02, dim(dc, 0.82)); });
    // (its frame and lintel, and the step)
    const tr = P.trim || '#6b4a30'; const sl = st === 'romano' || st === 'grego' || st === 'egipcio' || st === 'asteca';
    K.as('beam', () => { for (const s2 of [-1, 1]) bx(s2 * (dw / 2 + 0.07), y, 0.07, 0.14, dh, 0.14, tr); });
    K.as(sl ? (st === 'asteca' ? 'stucco' : cut) : 'beam', () => bx(0, y + dh, 0.08, dw + 0.42, 0.2, 0.18, sl ? (st === 'asteca' ? (P.trim || '#b33a2a') : stone) : tr));
    // (the classical house's porch, now and then: a little roof of tiles over the door on two brackets)
    if (st === 'classico' && floors <= 2 && K.hv(26) < 0.6) { const D2 = (a, yy, n) => [dx + (ax ? a : 0) + o[0] * n, yy, dz + (ax ? 0 : a) + o[1] * n]; const yb = y + dh + 0.36, dep = 0.62, wdt = dw + 0.7;
      K.as('beam', () => { for (const s2 of [-1, 1]) K.bar(D2(s2 * (wdt / 2 - 0.1), yb - 0.45, 0.03), D2(s2 * (wdt / 2 - 0.1), yb + 0.02, dep - 0.08), [0, 0.07, 0], ax ? [0.06, 0, 0] : [0, 0, 0.06], tr); bx(0, yb - 0.03, dep / 2, wdt - 0.1, 0.03, dep, dim(tr, 0.8)); });
      const c0 = D2(0, yb, dep / 2); K.as('tile', () => K.gable(c0[0], c0[1], c0[2], ax ? wdt : dep + 0.1, 0.4, ax ? dep + 0.1 : wdt, (P.roof && P.roof[1]) || '#94452d', ax)); }
    if (st === 'romano') K.as('stone', () => { for (const s2 of [-1, 1]) { const a = s2 * (dw / 2 + 0.28); const A = [dx + (ax ? a : 0) + o[0] * 0.13, y + dh + 0.22, dz + (ax ? 0 : a) + o[1] * 0.13], B = [dx + o[0] * 0.13, y + dh + 0.58, dz + o[1] * 0.13]; const da = -a, dy = 0.36, l = Math.hypot(da, dy); K.bar(A, B, [ax ? -dy / l * 0.12 : 0, da / l * 0.12, ax ? 0 : -dy / l * 0.12], [o[0] * 0.12, 0, o[1] * 0.12], stone); } });
    if (st === 'grego') gw.put(SH.box, R3.mat(K.x0 + dx + o[0] * 0.03, K.y0 + y + dh + 0.22, K.z0 + dz + o[1] * 0.03, ax ? 0 : Math.PI / 2, dw * 0.8, 0.26, 0.05), '#2a3440');
    if (st === 'asteca') K.as('stucco', () => { bx(0, y + dh + 0.2, 0.1, dw + 0.7, 0.14, 0.2, P.trim2 || '#2fae8f'); bx(0, y + dh + 0.34, 0.1, dw + 0.25, 0.1, 0.2, P.trim || '#b33a2a'); });
    // (the iron: on the strap door only the pin of the picture's ring, in relief where the picture has it; on a plain one its two
    // straps; on a panelled one a knob of bronze)
    if (K.fine) K.as('iron', () => { const su = ax ? -o[1] : o[0]; const ra = strap ? su * ((lf ? 0.16 : 0.84) - 0.5) * dw : dw * 0.3;
      if (!strap && !panel) for (const f of [0.22, 0.78]) bx(-dw * 0.3, y + dh * f, 0.09, dw * 0.36, 0.045, 0.012, '#2e2b28');
      const r = [dx + (ax ? ra : 0) + o[0] * 0.09, y + (strap ? 1.06 : dh * 0.5), dz + (ax ? 0 : ra) + o[1] * 0.09]; K.log(r, [r[0] + o[0] * 0.03, r[1], r[2] + o[1] * 0.03], strap ? 0.03 : 0.055, st === 'grego' || st === 'romano' ? '#8a7440' : '#2e2b28'); });
    // (the step: down to the ground before a footed house — no further out than a hand past the lot)
    { const wl = (ax ? sx : sz) / 2; const cut = doorSteps(K, (a, yy, n) => [dx + (ax ? a : 0) + o[0] * n, yy, dz + (ax ? 0 : a) + o[1] * n], bx, dw + 0.5, stripOf(K, x, z, sx, sz, o) + 0.15, 0.1, 0.02, 0.7, stone, 'stone', [wl, wl]);
      if (cut && K.body && K.body.door) K.body.door.cut = cut; }
  }
  // a roof of the people's kind over a box of sx × sz (centre x, z) whose walls end at y: gable, hip, flat with its
  // parapet, thatch or turf — with the god's pitches (the roof of a cottage is as tall as its walls), eaves that stand
  // out, the ends of a gable closed in the wall's colour, a ridge; the pattern of its tiles, straw or grass
  // (rise: the shell's own height of the roof over its eaves; shell: drawn from a shell — a flat roof's slab is flatTop's, and on
  // a terrace its parapet too ('terrace'); a hip's boards are under its eaves only, outside the walls: the inside is under it)
  // (cut: the sides — 'N', 'E', 'S', 'W' — whose eaves stand no further out than the wall: an annex's lean-to meets it there)
  function roofOf(K, x, z, sx, sz, y, kind, cols, ridgeZ, rise, shell, cut) {
    const P = K.P; const r = cols || P.roof || ['#b85a3c', '#94452d', '#7a3826']; kind = kind || P.kind || 'gable';
    const st = stuff(K.b); const ov = 0.42, alongZ = ridgeZ !== undefined ? ridgeZ : sz > sx + 0.01 || (K.b.v === 1 && Math.abs(sx - sz) < 0.01);
    if (kind === 'flat') {
      if (!shell) K.as(st.tile === 'mud' ? 'mud' : 'slab', () => K.box(x, y, z, sx + 0.12, 0.25, sz + 0.12, P.top || P.wl));
      const pc = (P.par && P.par[0]) || P.wl; const civ = K.st;
      if (civ === 'egipcio') {
        // (the Egyptian cornice: the wall's top curving out in a gorge, the round moulding under it, a flat band over it)
        const yb = y + 0.08, H2 = 0.5, F = 0.26; const c2 = (P.par && P.par[1]) || dim(pc, 0.88);
        K.as('mud', () => { for (const W2 of wallsOf(sx, sz)) {
          const a0 = -W2.len / 2, a1 = W2.len / 2; const p = (a, up, out) => [x + (W2.ax ? a * (1 + out * 2 / W2.len) : W2.o[0] * (sx / 2 + out)), yb + up, z + (W2.ax ? W2.o[1] * (sz / 2 + out) : a * (1 + out * 2 / W2.len))];
          // (the gorge in three bands, flaring more as it rises)
          const prof = [[0, 0], [0.18, 0.05], [0.34, 0.14], [H2, F]];
          for (let k = 0; k < 3; k++) { const [u0, f0] = prof[k], [u1, f1] = prof[k + 1]; K.tri3(p(a0, u0, f0), p(a1, u0, f0), p(a1, u1, f1), k ? pc : c2, k ? pc : c2, pc, [W2.o[0], 0.3, W2.o[1]]); K.tri3(p(a0, u0, f0), p(a1, u1, f1), p(a0, u1, f1), k ? pc : c2, pc, pc, [W2.o[0], 0.3, W2.o[1]]); }
          K.box(...(W2.ax ? [x, yb + H2, z + W2.o[1] * (sz / 2 + F / 2 - 0.02), sx + F * 2, 0.1, F + 0.04] : [x + W2.o[0] * (sx / 2 + F / 2 - 0.02), yb + H2, z, F + 0.04, 0.1, sz + F * 2]), dim(pc, 0.95));
          if (shell !== 'terrace') K.box(...(W2.ax ? [x, yb + H2 + 0.1, z + W2.o[1] * (sz / 2 - 0.05), sx + 0.1, 0.32, 0.22] : [x + W2.o[0] * (sx / 2 - 0.05), yb + H2 + 0.1, z, 0.22, 0.32, sz + 0.1]), pc);
        }
        // (the torus: a round moulding along the top of the walls, under the gorge)
        for (const W2 of wallsOf(sx, sz)) { const a = W2.len / 2 + 0.06; const A = W2.ax ? [x - a, yb - 0.02, z + W2.o[1] * (sz / 2 + 0.03)] : [x + W2.o[0] * (sx / 2 + 0.03), yb - 0.02, z - a], B = W2.ax ? [x + a, yb - 0.02, z + W2.o[1] * (sz / 2 + 0.03)] : [x + W2.o[0] * (sx / 2 + 0.03), yb - 0.02, z + a]; K.log(A, B, 0.07, dim(pc, 0.9)); } });
        return y + H2 + 0.42;
      }
      // (a parapet round the terrace, its coping a little wider, spouts to throw the rain off; the Aztec's crowned with
      // stepped merlons — a shell's terrace has its own parapet: the spouts only)
      if (shell === 'terrace') { if (K.fine) K.as('stone', () => { for (const W2 of wallsOf(sx, sz)) { const n = Math.max(1, Math.floor(W2.len / 3)); for (let k = 0; k < n; k++) { const a = -W2.len / 2 + W2.len * (k + 0.5) / n; K.box(x + (W2.ax ? a : W2.o[0] * (sx / 2 + 0.2)), y + 0.3, z + (W2.ax ? W2.o[1] * (sz / 2 + 0.2) : a), W2.ax ? 0.12 : 0.36, 0.1, W2.ax ? 0.36 : 0.12, P.base ? P.base[1] : '#8a8478'); } } }); return y + 1.15; }
      K.as(st.wall, () => { for (const [px, pz, a, bb] of [[x, z - sz / 2, sx + 0.12, 0.25], [x, z + sz / 2, sx + 0.12, 0.25], [x - sx / 2, z, 0.25, sz], [x + sx / 2, z, 0.25, sz]]) K.box(px, y + 0.25, pz, a, 0.6, bb, pc); });
      K.as('slab', () => { for (const [px, pz, a, bb] of [[x, z - sz / 2, sx + 0.22, 0.34], [x, z + sz / 2, sx + 0.22, 0.34], [x - sx / 2, z, 0.34, sz], [x + sx / 2, z, 0.34, sz]]) K.box(px, y + 0.85, pz, a, 0.06, bb, (P.par && P.par[1]) || dim(pc, 0.9)); });
      if (K.fine) K.as('stone', () => { for (const W2 of wallsOf(sx, sz)) { const n = Math.max(1, Math.floor(W2.len / 3)); for (let k = 0; k < n; k++) { const a = -W2.len / 2 + W2.len * (k + 0.5) / n; K.box(x + (W2.ax ? a : W2.o[0] * (sx / 2 + 0.2)), y + 0.3, z + (W2.ax ? W2.o[1] * (sz / 2 + 0.2) : a), W2.ax ? 0.12 : 0.36, 0.1, W2.ax ? 0.36 : 0.12, P.base ? P.base[1] : '#8a8478'); } } });
      if (civ === 'asteca') K.as('stucco', () => { for (const W2 of wallsOf(sx, sz)) { const n = Math.max(2, Math.round(W2.len / 0.9)); for (let k = 0; k < n; k++) { const a = -W2.len / 2 + W2.len * (k + 0.5) / n; const px = x + (W2.ax ? a : W2.o[0] * sx / 2), pz = z + (W2.ax ? W2.o[1] * sz / 2 : a);
        K.box(px, y + 0.91, pz, W2.ax ? 0.44 : 0.24, 0.16, W2.ax ? 0.24 : 0.44, pc); K.box(px, y + 1.07, pz, W2.ax ? 0.26 : 0.2, 0.14, W2.ax ? 0.2 : 0.26, k % 2 ? (P.trim || '#b33a2a') : pc); } } });
      return y + 0.91;
    }
    const L = alongZ ? sz : sx, D = alongZ ? sx : sz; // (along the ridge, and across it)
    const pitch = kind === 'turf' ? 1.25 : kind === 'thatch' ? 1.05 : (P.pitch || 0.8);
    const h = rise > 0 ? rise : Math.min(4.6, D * pitch * 0.82);
    const pat = kind === 'thatch' ? 'thatch' : kind === 'turf' ? 'turf' : st.tile === 'mud' ? 'tile' : st.tile;
    const col = kind === 'thatch' ? ((P.thatch && P.thatch[0]) || '#c8a85a') : r[0];
    // (a point in the roof's frame — u along the ridge, v across it — to the building's)
    const at = (u, yy, v) => alongZ ? [x + v, yy, z + u] : [x + u, yy, z + v];
    if (kind === 'hip') {
      // (four slopes of tiles over the eaves all round: the edge of the tiles thick, the boards under the eaves, ridge tiles
      // along the ridge and down the four hips, a course of round tiles at the eaves; each slope its own stains)
      const e = ov; const U = L / 2 + e, V = D / 2 + e; const ru = Math.max(0, U - V); const yt = y + h + 0.15, yb = y - e * (h / (D / 2)) + 0.15;
      const seed = K.b.id & 1023; const base = rgbOf(col); const tone = k => { const f = 0.93 + K.hv(40 + k) * 0.12; return qc([base[0] * f, base[1] * f, base[2] * f]); };
      const mossy = k => mixc(tone(k), [104, 112, 72], G.clamp((K.hv(3) - 0.35) * 0.5, 0, 0.3));
      const C = [at(-U, yb, V), at(U, yb, V), at(U, yb, -V), at(-U, yb, -V)], Ra = at(-ru, yt, 0), Rb = at(ru, yt, 0);
      // (a side with an annex under it: its eave at the wall, on its own slope — the ends' slopes rise to meet it there)
      if (cut && cut.size) { const sideOf = (du, dv) => (alongZ ? (du ? (du > 0 ? 'S' : 'N') : (dv > 0 ? 'E' : 'W')) : (du ? (du > 0 ? 'E' : 'W') : (dv > 0 ? 'S' : 'N')));
        const yw = y + 0.15; for (const [k0, k1, dv] of [[0, 1, 1], [2, 3, -1]]) if (cut.has(sideOf(0, dv))) { C[k0] = at(k0 === 0 ? -U : U, yw, dv * (D / 2 + 0.02)); C[k1] = at(k1 === 1 ? U : -U, yw, dv * (D / 2 + 0.02)); }
        for (const [k0, k1, du] of [[1, 2, 1], [3, 0, -1]]) if (cut.has(sideOf(du, 0))) { const a0 = C[k0], a1 = C[k1]; const toU = q => { const p2 = alongZ ? [q[2] - z, q[0] - x] : [q[0] - x, q[2] - z]; return at(du * (L / 2 + 0.02), yw, p2[1]); }; C[k0] = toU(a0); C[k1] = toU(a1); } }
      K.as(pat, () => {
        K.tri3(C[0], C[1], Rb, tone(0), tone(0), mossy(0), alongZ ? [1, 1, 0] : [0, 1, 1]); K.tri3(C[0], Rb, Ra, tone(0), mossy(0), mossy(0), alongZ ? [1, 1, 0] : [0, 1, 1]);
        K.tri3(C[2], C[3], Ra, mossy(1), mossy(1), tone(1), alongZ ? [-1, 1, 0] : [0, 1, -1]); K.tri3(C[2], Ra, Rb, mossy(1), tone(1), tone(1), alongZ ? [-1, 1, 0] : [0, 1, -1]);
        K.tri3(C[1], C[2], Rb, tone(2), tone(2), tone(2), alongZ ? [0, 1, 1] : [1, 1, 0]);
        K.tri3(C[3], C[0], Ra, tone(3), tone(3), tone(3), alongZ ? [0, 1, -1] : [-1, 1, 0]);
        // (the thick edge of the tiles all round the eaves)
        const ed = dim(col, 0.62); for (let k = 0; k < 4; k++) { const a = C[k], b2 = C[(k + 1) % 4]; const lo = [a[0], a[1] - 0.16, a[2]], lo2 = [b2[0], b2[1] - 0.16, b2[2]]; const m = [(a[0] + b2[0]) / 2 - x, 0, (a[2] + b2[2]) / 2 - z]; K.quad(a, b2, lo2, lo, ed, m); }
      });
      // (the underside of the eaves: the boards)
      if (shell) { const cs = cut || new Set(); const E = [x - sx / 2 - (cs.has('W') ? 0 : e - 0.02), z - sz / 2 - (cs.has('N') ? 0 : e - 0.02), x + sx / 2 + (cs.has('E') ? 0 : e - 0.02), z + sz / 2 + (cs.has('S') ? 0 : e - 0.02)];
        K.as('plankH', () => { for (const q of cutRect(E, [[x - sx / 2, z - sz / 2, x + sx / 2, z + sz / 2]])) flatQ(K, q, yb - 0.2, dim('#6a5038', 0.8), -1); }); }
      else K.as('plankH', () => K.box(x, yb - 0.2, z, (alongZ ? D : L) + e * 2 - 0.04, 0.05, (alongZ ? L : D) + e * 2 - 0.04, dim('#6a5038', 0.8)));
      // (ridge tiles on the ridge and down the hips, round tiles along the eaves)
      K.as(pat, () => { const rc = r[1] || dim(col, 0.82);
        if (ru > 0.1) K.log([Ra[0], Ra[1] + 0.02, Ra[2]], [Rb[0], Rb[1] + 0.02, Rb[2]], 0.12, rc, 0.1);
        for (let k = 0; k < 4; k++) { const R0 = k === 1 || k === 2 ? Rb : Ra; K.log([C[k][0], C[k][1] + 0.01, C[k][2]], [R0[0], R0[1] + 0.03, R0[2]], 0.09, rc, 0.08); }
        if (K.fine) for (let k = 0; k < 4; k++) { const a = C[k], b2 = C[(k + 1) % 4]; K.log([a[0], a[1] - 0.04, a[2]], [b2[0], b2[1] - 0.04, b2[2]], 0.075, dim(col, 0.9)); } });
      void seed;
      return y + h;
    }
    return gableRoof(K, x, z, sx, sz, y, kind, r, alongZ, rise, cut);
  }
  // the turf of one roof: the green of the people's palette calmed to a living roof's, and its age — fresh, greying,
  // mossy, damp — by the house's id
  const hvOf = (b, k) => G.hash(b.id * 7919 + k * 104729 + 13);
  // (on a square lot a timber house of the north turns its ridge along the wall with its door — the door in the long side,
  // as the north builds — save now and then one entered by its gable)
  const ridgeX = (b, side) => (side === 'N' || side === 'S') !== (hvOf(b, 14) < 0.2);
  function turfTone(K) {
    const age = K.hv(3), wet = K.hv(4); const base = calm((K.P.roof && K.P.roof[0]) || '#71903f', 0.66, 0.86);
    const grass = mixc(base, [114, 108, 70], age * 0.42);
    return { age, wet, grass, moss: mixc(calm(base, 0.45, 0.68), [56, 78, 54], 0.4 + wet * 0.25), dry: mixc(base, [158, 138, 90], 0.62),
      soil: [64, 50, 38], tuft: mixc(grass, [66, 86, 44], 0.4), tip: mixc(grass, [172, 168, 106], 0.45) };
  }
  // the carved end of a barge board past the ridge, as the north carves them: a scroll, a horse's head, a dragon's with
  // its jaws open (tip: where the board ends; dir: the way it runs; out: level, away from the ridge; tv: through the board)
  function bargeEnd(K, tip, dir, out, tv, wd, style, col, paint, eye) {
    // (in the gable's own plane: a = along 'out', b = up)
    const P2 = (p, a, b) => [p[0] + out[0] * a, p[1] + b, p[2] + out[2] * a];
    const da = dir[0] * out[0] + dir[2] * out[2], db = dir[1];
    const seg = (p, a, b, l, w, cc, th) => { const n = Math.hypot(a, b) || 1; a /= n; b /= n; const e = P2(p, a * l, b * l); K.bar(p, e, [-out[0] * b * w, a * w, -out[2] * b * w], [tv[0] * (th || 1), tv[1] * (th || 1), tv[2] * (th || 1)], cc); return e; };
    if (style === 1) { const e = seg(tip, da + 1.1, db, 0.2, wd * 0.8, col); seg(e, 0.45, -0.9, 0.14, wd * 0.6, col); return; }
    const head = paint || col;
    if (style === 2) {
      const n = seg(tip, da, db, 0.1, wd, col); const h = seg(n, 0.93, 0.36, 0.3, 0.15, head, 1.25);
      seg(h, 0.6, -0.8, 0.1, 0.09, head, 1.25); seg(P2(n, 0.06, 0.05), -0.3, 0.95, 0.13, 0.05, head); return;
    }
    // (the dragon: the head, the open jaw, the crest curling back, the eye, the tongue)
    const n = seg(tip, da, db, 0.08, wd, col); const h = seg(n, 0.9, 0.44, 0.36, 0.15, head, 1.3);
    seg(P2(n, 0.08, -0.03), 0.85, -0.53, 0.26, 0.06, head, 1.2);
    const c1 = seg(P2(n, -0.02, 0.06), -0.45, 0.9, 0.2, 0.05, head); seg(c1, -0.9, 0.1, 0.12, 0.04, head);
    seg(P2(n, 0.12, -0.02), 0.98, -0.25, 0.22, 0.025, K.P.trim || '#a23c2a', 0.6);
    if (eye) for (const s of [-1, 1]) { const m = P2(n, 0.2, 0.12); K.bar([m[0] + tv[0] * s * 0.68, m[1], m[2] + tv[2] * s * 0.68], [m[0] + tv[0] * s * 0.68 + out[0] * 0.05, m[1], m[2] + tv[2] * s * 0.68 + out[2] * 0.05], [0, 0.05, 0], [tv[0] * 0.2, 0, tv[2] * 0.2], eye); }
    void h;
  }
  // a gable roof: two slopes of the roof's own thickness from the ridge down past the walls — turf in lumps on its boards,
  // patches of moss and of dry grass, its grass hanging over the log that holds it at the eaves; straw thick and soft;
  // tiles and shingles — the edges where the stuff shows, the roof boards under the eaves, the ridge (a roll of turf,
  // ridge tiles, the ridge boards), the barge boards (crossed in the north, their ends carved), the purlins' ends
  function gableRoof(K, x, z, sx, sz, y, kind, r, alongZ, rise, cut) {
    const P = K.P; const st = stuff(K.b); const nord = styleOf(K.b) === 'nordico';
    const L = alongZ ? sz : sx, D = alongZ ? sx : sz; // (along the ridge, and across it)
    const turf = kind === 'turf', thatch = kind === 'thatch';
    const pat = thatch ? 'thatch' : turf ? 'turf' : st.tile === 'mud' ? 'tile' : st.tile;
    const col = thatch ? ((P.thatch && P.thatch[0]) || '#c8a85a') : r[0];
    // (turf is laid at the pitch it holds on — about fifty degrees, not the god's steep stroke; straw and tiles as he draws them)
    const pitch = turf ? 0.76 : thatch ? 1.05 : (P.pitch || 0.8);
    const h = rise > 0 ? rise : Math.min(4.6, D * pitch * 0.82);
    const ov = turf ? 0.46 : thatch ? 0.5 : 0.42, T = thatch ? 0.4 : turf ? 0.26 : 0.16;
    const half = D / 2, ang = Math.atan2(h, half), ca = Math.cos(ang), sa = Math.sin(ang);
    const sw = Math.hypot(half, h), run = sw + ov / ca, eu = L / 2 + (turf ? 0.34 : thatch ? 0.38 : ov * 0.8), s0 = -T * sa / ca;
    // (the roof's frame: u along the ridge, v across it, from the middle of the house; S: a point of the slope sd, s down it
    // from the ridge along the boards, n out of it)
    const vec = (u, yy, v) => (alongZ ? [v, yy, u] : [u, yy, v]);
    const at = (u, yy, v) => (alongZ ? [x + v, yy, z + u] : [x + u, yy, z + v]);
    const S = (u, s, n, sd) => at(u, y + h - sa * s + ca * n, sd * (ca * s + sa * n));
    const nN = sd => vec(0, ca, sd * sa), tD = sd => vec(0, -sa, sd * ca), rU = vec(1, 0, 0);
    const sc = (v, k) => [v[0] * k, v[1] * k, v[2] * k], add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
    const seed = K.b.id & 1023;
    // (an old turf or straw roof sags a little between its gables)
    const sag = (turf ? 0.07 : thatch ? 0.05 : 0) * K.hv(31) * (0.5 + K.hv(3));
    const sagY = u => sag * Math.max(0, 1 - (u / eu) * (u / eu));
    const amp = turf ? 0.055 : thatch ? 0.03 : 0;
    const nu = Math.max(3, Math.round(2 * eu / (turf ? 0.5 : thatch ? 0.6 : 0.9))), ns = Math.max(2, Math.round((run - s0) / (turf ? 0.45 : thatch ? 0.55 : 0.9)));
    // (a slope over an annex stops at the wall: its run that far)
    const runOf = sd => (cut && cut.has(alongZ ? (sd > 0 ? 'E' : 'W') : (sd > 0 ? 'S' : 'N')) ? sw + 0.02 : run);
    const uOf = i => -eu + 2 * eu * i / nu, sOf = (j, sd) => s0 + (runOf(sd) - s0) * j / ns;
    // (the lumps of the turf, the swell of the straw: none at the gable edges or on the ridge, a bulge over the eave)
    const lump = (i, j, sd) => { if (!amp) return 0; const fu = G.clamp((eu - Math.abs(uOf(i))) / 0.45, 0, 1), fs = G.clamp((sOf(j, sd) - s0) / 0.4, 0, 1);
      return (amp * (G.hash(seed * 977 + i * 131 + j * 31 + (sd > 0 ? 7 : 0)) - 0.5) * 2 * fs + (j === ns ? amp * 0.6 : 0)) * fu; };
    const top = (i, j, sd) => { const u = uOf(i); const p = S(u, sOf(j, sd), T + lump(i, j, sd), sd); p[1] -= sagY(u); return p; };
    const bot = (u, s, sd) => { const p = S(u, s, 0, sd); p[1] -= sagY(u); return p; };
    // the colours of the top: turf by patches (drier on the sunny side, mossy in the shade, damp at the eaves); tiles,
    // shingles and straw by their stains and a little moss where the sun does not reach
    const yR = K.y0 + y + h, drop = sa * run; let topCol;
    if (turf) {
      const tc = turfTone(K); K.turf = tc;
      topCol = (X, Y, Z, nx, ny, nz) => {
        const a = vnoise(X * 0.6, Z * 0.6, seed), q = vnoise(X * 2.1 + 3.1, Z * 2.1, seed + 7); const dn = G.clamp((yR - Y) / drop, 0, 1);
        const dry = G.clamp((a - 0.55 + nz * 0.16 + (1 - dn) * 0.08 - tc.wet * 0.12) * 3.2, 0, 0.8), moss = G.clamp((0.45 - a - nz * 0.12 + tc.wet * 0.14 + tc.age * 0.12 + dn * 0.1) * 3, 0, 0.85);
        const cc = mixc(mixc(tc.grass, tc.dry, dry), tc.moss, moss); const f = (0.88 + q * 0.24) * (1 - G.clamp((dn - 0.8) * 2.5, 0, 0.3));
        return qc([cc[0] * f, cc[1] * f, cc[2] * f]);
      };
    } else {
      const base = thatch ? mixc(col, [128, 118, 96], K.hv(3) * 0.35) : rgbOf(col); const moss = thatch ? [96, 100, 62] : [92, 108, 64];
      topCol = (X, Y, Z, nx, ny, nz) => {
        const a = vnoise(X * 0.5, Z * 0.5, seed + 3), q = vnoise(X * 1.6, Z * 1.6, seed + 5); const dn = G.clamp((yR - Y) / drop, 0, 1);
        const m = G.clamp((0.42 - a - nz * 0.12 + K.hv(3) * 0.16 + dn * 0.08) * 2.4, 0, thatch ? 0.3 : 0.4);
        const cc = mixc(base, moss, m); const f = 0.9 + q * 0.18; return qc([cc[0] * f, cc[1] * f, cc[2] * f]);
      };
    }
    const eb = turf ? [K.turf.tuft, [84, 64, 46], K.turf.soil] : thatch ? [dim(col, 1.06), dim(col, 0.9), dim(col, 0.72)] : [dim(col, 0.78), dim(col, 0.62), dim(col, 0.5)];
    const under = dim(nord ? P.wr || '#5f4630' : '#6a5038', 0.78);
    for (const sd of [-1, 1]) {
      // (the top: a sheet of points following the slope, lumped and sagging)
      const pts = []; for (let j = 0; j <= ns; j++) for (let i = 0; i <= nu; i++) pts.push(top(i, j, sd));
      K.as(pat, () => K.sheet(pts, nu, ns, topCol, nN(sd)));
      // (the roof boards seen under the eaves and the gables)
      const und = []; for (let j = 0; j <= 1; j++) for (let i = 0; i <= nu; i++) und.push(bot(uOf(i), j ? runOf(sd) + (turf ? 0.17 : 0.02) : 0, sd));
      K.as('plankH', () => K.sheet(und, nu, 1, under, sc(nN(sd), -1)));
      // (the eave's edge — the earth and roots of the turf, the cut ends of the straw, the edge of the tiles — and the gables')
      K.as(turf ? 'soil' : pat, () => {
        for (let i = 0; i < nu; i++) { const a = top(i, ns, sd), b2 = top(i + 1, ns, sd), c2 = bot(uOf(i + 1), runOf(sd), sd), d2 = bot(uOf(i), runOf(sd), sd); K.tri3(a, b2, c2, eb[0], eb[0], eb[2], tD(sd)); K.tri3(a, c2, d2, eb[0], eb[2], eb[2], tD(sd)); }
        for (const e of [-1, 1]) for (let j = 0; j < ns; j++) { const i = e < 0 ? 0 : nu; const a = top(i, j, sd), b2 = top(i, j + 1, sd), c2 = bot(uOf(i), Math.max(0, sOf(j + 1, sd)), sd), d2 = bot(uOf(i), Math.max(0, sOf(j, sd)), sd);
          K.tri3(a, b2, c2, eb[1], eb[1], eb[2], sc(rU, e)); K.tri3(a, c2, d2, eb[1], eb[2], eb[2], sc(rU, e)); }
      });
    }
    // (the gable ends: triangles of wall up to the ridge, in the people's gable colour)
    const gc = turf || nord ? P.gable || P.wr : P.gable || P.wl;
    K.as(nord ? 'plankV' : st.wall === 'frame' ? 'plaster' : st.wall, () => { for (const e of [-1, 1]) K.tri(at(e * L / 2, y, -half), at(e * L / 2, y, half), at(e * L / 2, y + h, 0), gc, alongZ ? [0, 0, e] : [e, 0, 0]); });
    const ridgeY = y + h + T / ca;
    // the ridge: a roll of turf, ridge tiles, a thick cap of straw, two ridge boards over shingles
    { const segs = turf || thatch ? 4 : 1; const rr = turf ? [0.2, 0.12, -0.05] : thatch ? [0.27, 0.19, -0.08] : st.tile === 'shingle' ? null : [0.13, 0.11, -0.03];
      if (rr) K.as(pat, () => { for (let k = 0; k < segs; k++) { const u0 = -eu + 0.04 + (2 * eu - 0.08) * k / segs, u1 = -eu + 0.04 + (2 * eu - 0.08) * (k + 1) / segs; const um = (u0 + u1) / 2;
        K.log(at(u0, ridgeY + rr[2] - sagY(um), 0), at(u1, ridgeY + rr[2] - sagY(um), 0), rr[0], turf || thatch ? topCol : (r[1] || dim(col, 0.85)), rr[1]); } });
      else K.as('beam', () => { for (const sd of [-1, 1]) K.bar(S(-eu, s0 + 0.13, T + 0.025, sd), S(eu, s0 + 0.13, T + 0.025, sd), sc(tD(sd), 0.26), sc(nN(sd), 0.05), dim(col, 0.72)); }); }
    // the barge boards: crossed over the ridge in the north, their ends carved by how rich the house is; elsewhere a plain board
    if (!thatch) {
      const bw = turf ? 0.3 : T + 0.12, bt = 0.06, cross = nord; const cls = K.cls || 0; const hv = K.hv(5);
      let style = !cross ? 0 : cls >= 3 ? 3 : cls === 2 ? (hv < 0.7 ? 3 : 2) : cls === 1 ? (hv < 0.5 ? 2 : 1) : (hv < 0.55 ? 1 : 0);
      // (the dragon of a rich house carved whole — the model made in Blender, G.Mesh3D 'dragao' — standing where the boards cross
      // at each end of the ridge, looking out along it, the boards' own ends then cut plain; where the machine carries no
      // detail, the dragon cut in boards as before)
      // (every hall has its dragons, most big houses; now and then a house or a cabin whose people carved theirs too, smaller)
      const carved = cross && (style === 3 || (cls === 1 && K.hv(7) < 0.45) || (cls === 0 && K.hv(7) < 0.3));
      // (A1's two heads — 'dragao2' the deeper S of the neck, the long snout, lower: 0.88 m to 1.1 — one or the other by the house's id)
      const DRG = G.Mesh3D && K.hv(8) < 0.5 && G.Mesh3D.has('dragao2') && G.Mesh3D.part('dragao2', 'madeira') ? 'dragao2' : 'dragao';
      const mesh = carved && K.fine && !!(G.Mesh3D && G.Mesh3D.has(DRG) && G.Mesh3D.part(DRG, 'madeira')); if (mesh) style = 0; // (the dragon rides the cross: the boards' ends plain)
      const EMP = cross && K.fine && !!(G.Mesh3D && G.Mesh3D.has('empena') && G.Mesh3D.part('empena', 'cavalo') && G.Mesh3D.part('empena', 'voluta'));
      const bc = nord ? nordWood(K).dark : (P.trim || '#6b4a30'); const ext = cross ? (mesh ? 0.2 : 0.4 + Math.min(0.35, D * 0.06)) : 0;
      const paint = cls >= 2 || (cls === 1 && K.hv(6) < 0.4) ? (P.trim || '#a23c2a') : null;
      if (mesh) { const s = [0.68, 0.76, 0.84, 1][Math.min(3, cls)]; const wc = mixc(paint || bc, bc, 0.35); const ec = cls >= 2 ? (P.acc || '#d8b25a') : '#2a2016'; const M3 = G.Mesh3D;
        for (const e of [-1, 1]) { const p = at(e * (eu + bt / 2 + 0.005), y + h + T / (2 * ca) + bw * 0.42, 0); const d = vec(e, 0, 0); const ry = Math.atan2(d[0], d[2]);
          const m = R3.mat(K.x0 + p[0], K.y0 + p[1], K.z0 + p[2], ry, s, s, s);
          K.as('jamb', () => K.g.put(M3.part(DRG, 'madeira'), m, K.c(wc))); const eye = M3.part(DRG, 'olho'); if (eye) K.g.put(eye, m, K.c(ec)); } }
      K.as('beam', () => { for (const e of [-1, 1]) for (const sd of [-1, 1]) {
        const ub = e * (eu + bt / 2 + 0.005); const sMid = -(T / 2) * sa / ca;
        const a = S(ub, runOf(sd) + (turf ? 0.06 : 0.03), T / 2, sd), b2 = S(ub, cross ? sMid - ext : sMid, T / 2, sd);
        K.bar(a, b2, sc(nN(sd), bw), sc(rU, bt), bc);
        if (cross && style > 0) {
          // (the board's end cut in a horse's head or a scroll — the model made in Blender, G.Mesh3D 'empena': a board's thickness in
          // the gable's plane, growing out from the ridge and up — where the machine carries detail; the boards' own cut elsewhere)
          // (the horse on the houses, the scroll on the big ones: a cabin's own cut is boards)
          if (EMP && (style === 2 ? cls >= 1 : cls >= 2)) { const out = vec(0, 0, -sd); const s = 0.9 + cls * 0.07; const m = R3.mat(K.x0 + b2[0], K.y0 + b2[1], K.z0 + b2[2], Math.atan2(out[0], out[2]), s, s, s);
            K.g.put(G.Mesh3D.part('empena', style === 2 ? 'cavalo' : 'voluta'), m, K.c(style === 2 ? (paint || bc) : bc)); const eye = style === 2 && G.Mesh3D.part('empena', 'olho'); if (eye) K.g.put(eye, m, K.c('#1e1610')); }
          else { const d = [b2[0] - a[0], b2[1] - a[1], b2[2] - a[2]]; const l = Math.hypot(d[0], d[1], d[2]); bargeEnd(K, b2, [d[0] / l, d[1] / l, d[2] / l], vec(0, 0, -sd), sc(rU, bt), bw * 0.8, style, bc, paint, cls >= 2 ? (P.acc || '#d8b25a') : '#1e1610'); } }
      } });
      // (the purlins' ends under the gables, round logs past the boards)
      if (nord) K.as('beam', () => { for (const e of [-1, 1]) { for (const sd of [-1, 1]) for (const f of [0.42, 0.8]) K.peg(S(e * (L / 2 - 0.1), sw * f, -0.16, sd), S(e * (eu + 0.07), sw * f, -0.16, sd), 0.075, dim(bc, 0.95));
        K.peg(at(e * (L / 2 - 0.1), y + h - 0.17, 0), at(e * (eu + 0.08), y + h - 0.17, 0), 0.085, dim(bc, 0.95)); } });
    }
    // a turf roof's log along the eaves, on its hooks, that holds the turf from sliding; the grass growing over it all
    if (turf) {
      const tc = K.turf; const lc = mixc([104, 94, 80], tc.soil, 0.2);
      K.as('bark', () => { for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) { const u0 = -eu + 0.03 + (2 * eu - 0.06) * k / 3, u1 = -eu + 0.03 + (2 * eu - 0.06) * (k + 1) / 3, um = (u0 + u1) / 2;
        const a = S(u0, runOf(sd) + 0.07, 0.09, sd), b2 = S(u1, runOf(sd) + 0.07, 0.09, sd); a[1] -= sagY(um); b2[1] -= sagY(um); K.log(a, b2, 0.085, lc); } });
      if (K.fine) K.as('beam', () => { const n = Math.max(2, Math.round(2 * eu / 0.62)); const dk = dim(P.wr || '#5f4630', 0.8);
        for (const sd of [-1, 1]) for (let k = 0; k < n; k++) { const u = -eu + 2 * eu * (k + 0.5) / n; const sy = -sagY(u);
          const rn = runOf(sd); const a = S(u, rn - 0.12, -0.03, sd), b2 = S(u, rn + 0.2, -0.03, sd), c2 = S(u, rn + 0.19, -0.06, sd), d2 = S(u, rn + 0.19, 0.16, sd); for (const p of [a, b2, c2, d2]) p[1] += sy;
          K.bar(a, b2, sc(nN(sd), 0.045), sc(rU, 0.05), dk); K.bar(c2, d2, sc(tD(sd), 0.045), sc(rU, 0.05), dk); } });
      // (tufts: hanging over the log, standing on the ridge and over the barge boards, scattered on the slopes; a flower now and then)
      const gp = K.gp; const W0 = [K.x0, K.y0, K.z0]; let kk = 0;
      const blade = (p, d, len, w, sw2, tip) => { const k = kk++; const l = Math.hypot(d[0], d[1], d[2]) || 1; const X = W0[0] + p[0], Y = W0[1] + p[1], Z = W0[2] + p[2]; const a = G.hash(seed * 613 + k) * TAU;
        gp.blade(X, Y, Z, w, a, X + d[0] / l * len, Y + d[1] / l * len, Z + d[2] / l * len, tc.tuft, tip || mixc(tc.tip, tc.grass, G.hash(seed + k * 3) * 0.6), sw2); };
      for (const sd of [-1, 1]) {
        const ne = Math.round(2 * eu / 0.13);
        for (let k = 0; k < ne; k++) { const hh = G.hash(seed * 31 + k * 7 + (sd > 0 ? 1 : 0)); const u = -eu + 0.08 + (2 * eu - 0.16) * (k + hh * 0.8) / ne; const p = S(u, runOf(sd) + 0.02, T * 0.9, sd); p[1] -= sagY(u);
          blade(p, add(add(sc(tD(sd), 0.6), [0, -0.5 - hh * 0.4, 0]), sc(rU, (hh - 0.5) * 0.7)), 0.14 + 0.16 * G.hash(k * 5 + seed), 0.09, 0.8); }
        const nsf = Math.round(2 * eu * run * 0.9);
        for (let k = 0; k < nsf; k++) { const i = G.hash(seed * 17 + k * 11 + sd) * nu, j = 0.6 + G.hash(seed * 23 + k * 13 + sd) * (ns - 1.2); const i0 = Math.floor(i), j0 = Math.floor(j);
          const p = top(Math.min(nu, i0), Math.min(ns, j0), sd); const lean = add(nN(sd), add(sc(tD(sd), 0.35), sc(rU, (G.hash(k + seed) - 0.5) * 0.8)));
          for (let q = 0; q < 3; q++) blade([p[0] + (q - 1) * 0.04, p[1] - 0.02, p[2] + (q - 1) * 0.03], add(lean, [0, q * 0.2, 0]), 0.12 + 0.14 * G.hash(k * 3 + q), 0.07, 0.7); }
        for (const e of [-1, 1]) for (let j = 1; j < ns; j++) { const p = top(e < 0 ? 0 : nu, j, sd); blade([p[0], p[1] + 0.02, p[2]], add(sc(rU, e * 0.5), add(nN(sd), [0, 0.3, 0])), 0.12 + 0.1 * G.hash(j * 7 + seed + e), 0.08, 0.7); }
      }
      const nr = Math.round(2 * eu / 0.11);
      for (let k = 0; k < nr; k++) { const u = -eu + 0.1 + (2 * eu - 0.2) * k / nr; const p = at(u, ridgeY + 0.06 - sagY(u), (G.hash(k * 3 + seed) - 0.5) * 0.18); blade(p, [(G.hash(k + seed * 5) - 0.5) * 0.7, 1, (G.hash(k * 7 + seed) - 0.5) * 0.7], 0.16 + 0.18 * G.hash(k * 11 + seed), 0.09, 0.85); }
      // (flowers on the old roofs: yellow, white, a pink thrift)
      const nf = Math.round(tc.age * 10); const FL = [[236, 206, 84], [238, 234, 220], [214, 128, 168]];
      for (let k = 0; k < nf; k++) { const sd = k % 2 ? 1 : -1; const p = top(Math.floor(G.hash(seed * 41 + k) * nu), 1 + Math.floor(G.hash(seed * 43 + k) * (ns - 2)), sd); const fc = FL[Math.floor(G.hash(k * 9 + seed) * 3)];
        blade(p, add(nN(sd), [0, 0.6, 0]), 0.2, 0.03, 0.8, [90, 120, 60]); const tp = add(p, sc(add(nN(sd), [0, 0.6, 0]), 0.16)); for (let q = 0; q < 3; q++) blade(tp, [Math.cos(q * 2.1), 0.3, Math.sin(q * 2.1)], 0.06, 0.06, 0.8, fc); }
    }
    K.roof = { at, S, nN, tD, rU, vec, eu, run, T, h, ang, ridgeY, alongZ, L, D, sw, sagY, y };
    return y + h;
  }
  // (where the windows of a wall are, as openings() puts them: their middles along it, the door's place on the ground floor)
  const winAt = (len, n) => { const out = []; for (let k = 0; k < n; k++) out.push(-len / 2 + len * (k + 0.5) / n); return out; };
  // the walls of the classical and the warm lands, as each people builds them — the half-timber of the classical towns as
  // timber standing out of the plaster (posts by the windows and at the corners, rails at the sills and the lintels, braces
  // in the corner panels), the stone socle and the cornice of the Greek and the Roman house, the Egyptian's cornice curving
  // out over its walls with the round moulding at its corners, the Aztec's painted socle and band
  function warmWalls(K, x, z, sx, sz, h, floors, o) {
    const P = K.P; const st = stuff(K.b); const civ = K.st; const fh = h / floors; const wc = o.wall || (K.b.v === 2 ? P.wr : P.wl);
    const frame = st.wall === 'frame' && !o.wall && !o.pat;
    // (the wall itself: plaster where the timber is geometry, the people's stuff otherwise; under eaves, its top band in their shade)
    const w0 = frame ? mixc(wc, [244, 236, 214], 0.25) : wc; const eave = !o.noRoof && (o.roof || P.kind) !== 'flat';
    K.wallCol = w0; K.wallPat = o.pat || (st.wall === 'frame' ? 'plaster' : st.wall); // (the windows' reveals are of the wall: openings())
    K.as(K.wallPat, () => { if (eave) { K.box(x, 0, z, sx, h - 0.45, sz, w0); K.box(x, h - 0.45, z, sx, 0.45, sz, eaveShade(K, w0, h)); } else K.box(x, 0, z, sx, h, sz, w0); });
    const tr = P.trim || '#6b4a30';
    if (frame) {
      const side = doorSide(K.b); const wt = mixc(tr, [74, 52, 36], 0.25); const t = 0.15, pr = 0.035;
      K.as('beam', () => {
        for (const W2 of wallsOf(sx, sz)) {
          const n = Math.max(1, Math.floor(W2.len / 2.3)); const ws = winAt(W2.len, n);
          // (a timber on this face: a along it, from y0 up hy high, wa wide)
          const tb = (a, y0, wa, hy) => K.box(x + (W2.ax ? a : W2.o[0] * (sx / 2 + pr / 2)), y0, z + (W2.ax ? W2.o[1] * (sz / 2 + pr / 2) : a), W2.ax ? wa : pr, hy, W2.ax ? pr : wa, wt);
          const br = (a0, y0, a1, y1) => { const A = [x + (W2.ax ? a0 : W2.o[0] * (sx / 2 + pr / 2)), y0, z + (W2.ax ? W2.o[1] * (sz / 2 + pr / 2) : a0)], B = [x + (W2.ax ? a1 : W2.o[0] * (sx / 2 + pr / 2)), y1, z + (W2.ax ? W2.o[1] * (sz / 2 + pr / 2) : a1)];
            const dx = a1 - a0, dy = y1 - y0, l = Math.hypot(dx, dy); K.bar(A, B, [W2.ax ? -dy / l * t : 0, dx / l * t, W2.ax ? 0 : -dy / l * t], [W2.o[0] * pr, 0, W2.o[1] * pr], wt); };
          for (let f = 0; f < floors; f++) {
            const yb = f * fh, wy = yb + fh * 0.36, wh = Math.min(1.15, fh * 0.38);
            tb(0, yb + 0.02, W2.len, t); tb(0, wy - 0.12, W2.len, 0.1); tb(0, wy + wh + 0.02, W2.len, 0.1);
            const posts = []; ws.forEach((a, k) => { if (f === 0 && W2.side === side && k === Math.floor(n / 2)) posts.push(a - 0.67, a + 0.67); else posts.push(a - 0.48, a + 0.48); });
            for (const a of posts) tb(a, yb + 0.02, t, fh - 0.04);
            // (a brace in each corner panel, leaning toward the corner)
            const first = Math.min(...posts), last = Math.max(...posts);
            if (first + W2.len / 2 > 0.55) { br(-W2.len / 2 + 0.12, yb + 0.12, first - 0.06, wy - 0.12); br(-W2.len / 2 + 0.12, wy + wh + 0.08, first - 0.06, yb + fh - 0.22); }
            if (W2.len / 2 - last > 0.55) { br(W2.len / 2 - 0.12, yb + 0.12, last + 0.06, wy - 0.12); br(W2.len / 2 - 0.12, wy + wh + 0.08, last + 0.06, yb + fh - 0.22); }
          }
        }
        for (const [px, pz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) K.box(x + px * (sx / 2 - 0.06), 0, z + pz * (sz / 2 - 0.06), 0.2, h, 0.2, wt);
      });
    } else if (civ === 'grego' || civ === 'romano' || civ === 'classico') {
      // (a socle of stone round the foot, a band at each floor, a cornice under the eaves)
      K.as(st.base === 'marble' || st.base === 'ashlar' ? st.base : 'stone', () => K.box(x, 0, z, sx + 0.06, 0.42, sz + 0.06, P.base ? P.base[1] : '#8a8478'));
      for (let f = 1; f < floors; f++) K.as(st.wall === 'frame' ? 'plaster' : st.wall, () => K.box(x, f * fh - 0.1, z, sx + 0.08, 0.16, sz + 0.08, dim(wc, 0.86)));
      // (quoins: the Roman house's corners of cut stone, long and short in turn up the wall — the box's edges broken)
      if (K.fine && civ === 'romano' && floors <= 2) K.as(st.base === 'ashlar' ? 'ashlar' : 'stone', () => { const q0 = P.base ? P.base[2] : '#a09a8e'; let k = 0;
        for (const [px, pz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) for (let yy = 0.44, i = 0; yy < h - 0.42; yy += 0.32, i++) { const lng = (i + (px * pz > 0 ? 0 : 1)) % 2 === 0; const la = lng ? 0.46 : 0.26, lb = lng ? 0.26 : 0.46;
          K.box(x + px * (sx / 2 - la / 2 + 0.03), yy, z + pz * (sz / 2 + 0.015), la, 0.29, 0.06, dim(q0, 0.92 + K.hv(240 + k) * 0.12)); K.box(x + px * (sx / 2 + 0.015), yy, z + pz * (sz / 2 - lb / 2 + 0.03), 0.06, 0.29, lb, dim(q0, 0.92 + K.hv(241 + k) * 0.12)); k += 2; } });
    } else if (civ === 'egipcio') {
      K.as('sandstone', () => K.box(x, 0, z, sx + 0.08, 0.36, sz + 0.08, P.base ? P.base[1] : '#cdb98f')); // (a low socle of sandstone under the mud brick)
      // (the round moulding up the corners)
      K.as('mud', () => { for (const [px, pz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) K.cyl(x + px * sx / 2, 0.1, z + pz * sz / 2, 0.09, h - 0.1, dim(wc, 0.92)); });
    } else if (civ === 'asteca') {
      K.as('stucco', () => { K.box(x, 0, z, sx + 0.05, 0.5, sz + 0.05, P.trim2 || '#2fae8f'); K.box(x, 0.5, z, sx + 0.04, 0.08, sz + 0.04, P.trim || '#b33a2a'); });
    }
    // (the floors between storeys and the band at the top: timber in the timber lands, a band of plaster elsewhere)
    if (!frame) K.as(civ === 'grego' || civ === 'romano' || civ === 'egipcio' || civ === 'asteca' ? 'plaster' : 'beam', () => { for (let f = 1; f < floors; f++) if (civ !== 'grego' && civ !== 'romano') K.box(x, f * fh - 0.12, z, sx + 0.14, 0.24, sz + 0.14, civ === 'asteca' ? (P.trim || '#b33a2a') : tr); });
  }
  // the Aztec town house as the god's view draws it: storey on storey, each set back from the one under it, a terrace with its
  // parapet and its pots of flowers at every step, the painted bands at each floor
  function stepped(g, gw, K, o, x, z, sx, sz, h, floors) {
    const P = K.P; const fh = h / floors; const back = Math.min(0.5, Math.min(sx, sz) * 0.12); let top = h;
    for (let f = 0; f < floors; f++) {
      const fx = sx - f * back * 2, fz = sz - f * back * 2, yb = f * fh;
      K.as(stuff(K.b).wall, () => K.box(x, yb, z, fx, fh, fz, f % 2 ? P.wr : P.wl));
      if (!f) K.as('stucco', () => { K.box(x, 0, z, fx + 0.05, 0.5, fz + 0.05, P.trim2 || '#2fae8f'); K.box(x, 0.5, z, fx + 0.04, 0.08, fz + 0.04, P.trim || '#b33a2a'); });
      K.as('stucco', () => K.box(x, yb + fh - 0.36, z, fx + 0.06, 0.3, fz + 0.06, f % 2 ? (P.trim2 || '#2fae8f') : (P.trim || '#b33a2a')));
      K.wallCol = f % 2 ? P.wr : P.wl; K.wallPat = stuff(K.b).wall; openings(g, gw, K, x, z, fx, fz, yb, fh, 1, f === 0 ? o.door : false);
      if (f < floors - 1) {
        // (the terrace: the floor of the step, its low parapet, flowers along it)
        const tx = fx + 0.1, tz = fz + 0.1, pc = (P.par && P.par[0]) || P.wl;
        K.as('slab', () => K.box(x, yb + fh, z, tx, 0.12, tz, P.top || P.wl));
        K.as('stucco', () => { for (const [px, pz, a2, b2] of [[x, z - tz / 2 + 0.07, tx, 0.14], [x, z + tz / 2 - 0.07, tx, 0.14], [x - tx / 2 + 0.07, z, 0.14, tz], [x + tx / 2 - 0.07, z, 0.14, tz]]) K.box(px, yb + fh + 0.12, pz, a2, 0.34, b2, pc); });
        const n = Math.max(2, Math.round(fx / 1.2)); const side = doorSide(K.b); const so = { S: [0, 1], N: [0, -1], E: [1, 0], W: [-1, 0] }[side];
        for (let k = 0; k < n; k++) { const a2 = -fx / 2 + fx * (k + 0.5) / n; const px = x + (so[1] ? a2 : so[0] * (tx / 2 - 0.22)), pz = z + (so[1] ? so[1] * (tz / 2 - 0.22) : a2); const py = yb + fh + 0.12;
          K.as('mud', () => K.cyl(px, py, pz, 0.15, 0.26, '#b8683a'));
          const fl = K.hv(130 + k + f * 9) < 0.5 ? [224, 90, 122] : K.hv(140 + k) < 0.5 ? [236, 196, 70] : [96, 164, 72];
          for (let q = 0; q < 3; q++) { const a3 = q * 2.1 + k; K.gp.blade(K.x0 + px, K.y0 + py + 0.24, K.z0 + pz, 0.14, a3, K.x0 + px + Math.cos(a3) * 0.12, K.y0 + py + 0.62, K.z0 + pz + Math.sin(a3) * 0.12, [70, 120, 50], q ? [90, 156, 70] : fl, 0.5); } }
      } else top = roofOf(K, x, z, fx, fz, yb + fh, 'flat');
    }
    K.body = { x, z, sx, sz, door: K.body && K.body.door };
    return top;
  }
  // a balcony of planks on brackets along the wall with the door, on the top floor: its posts and its rail
  function balcony(K, x, z, sx, sz, h, floors) {
    const side = doorSide(K.b); const o = { S: [0, 1], N: [0, -1], E: [1, 0], W: [-1, 0] }[side]; const ax = o[1] !== 0;
    const len = (ax ? sx : sz) * 0.72, dep = 0.62, yb = (floors - 1) * h / floors + 0.02; const wc = [118, 86, 58];
    const fx = x + o[0] * sx / 2, fz = z + o[1] * sz / 2; const D = (a, y, n) => [fx + (ax ? a : 0) + o[0] * n, y, fz + (ax ? 0 : a) + o[1] * n];
    const bx = (a, y, n, wa, hy, wn, col) => { const q = D(a, y, n); K.box(q[0], q[1], q[2], ax ? wa : wn, hy, ax ? wn : wa, col); };
    K.as('plankH', () => bx(0, yb, dep / 2, len, 0.07, dep, wc));
    K.as('beam', () => {
      const n = Math.max(3, Math.round(len / 0.32)); for (let k = 0; k <= n; k++) bx(-len / 2 + 0.03 + (len - 0.06) * k / n, yb + 0.07, dep - 0.04, 0.045, 0.85, 0.045, dim(wc, 0.9));
      for (const e of [-1, 1]) bx(e * (len / 2 - 0.03), yb + 0.07, dep / 2, 0.045, 0.85, dep, dim(wc, 0.9));
      bx(0, yb + 0.92, dep - 0.04, len + 0.04, 0.06, 0.08, dim(wc, 0.82));
      // (the brackets under it, into the wall)
      for (const e of [-0.36, 0.36]) K.bar(D(e * len, yb - 0.55, 0.04), D(e * len, yb - 0.02, dep - 0.08), [0, 0.07, 0], ax ? [0.07, 0, 0] : [0, 0, 0.07], dim(wc, 0.85));
    });
  }
  // a plain house body: walls, windows, door, roof — the base of most buildings; the walls of the people's stuff
  // (half-timber in the classical lands, plaster, mud brick, planks), floors between the storeys, a chimney
  function house(g, gw, K, o) {
    o = o || {}; const P = K.P; const inset = o.inset === undefined ? 0.35 : o.inset; const B0 = o.body; // (body: a box given — the shop of a smithy)
    let sx = B0 ? B0.sx : K.w - inset * 2, sz = B0 ? B0.sz : K.d - inset * 2, x = B0 ? B0.x : K.w / 2, z = B0 ? B0.z : K.d / 2; const floors = o.floors || 1; const h = (o.h || 2.6) * floors;
    // (a yard before the door, where a store's goods and a potter's pots stand: the body that much shallower, pushed back)
    if (o.yard && !B0 && K.prog >= 1) { const od0 = { S: [0, 1], N: [0, -1], E: [1, 0], W: [-1, 0] }[doorSide(K.b)]; if ((od0[1] ? sz : sx) - o.yard < 3) o = Object.assign({}, o, { yard: 0 }); // (a lot too shallow keeps its whole body)
      else if (od0[1]) { sz -= o.yard; z -= od0[1] * o.yard / 2; } else { sx -= o.yard; x -= od0[0] * o.yard / 2; } }
    const built = K.prog; const st = stuff(K.b);
    if (built >= 1 || o.body) { const sd = doorSide(K.b); K.body = { x, z, sx, sz, door: o.door === false ? null : { side: sd, o: { S: [0, 1], N: [0, -1], E: [1, 0], W: [-1, 0] }[sd], a: 0, w: 1.42 } }; }
    // (the north builds in timber whatever the house is for: its walls, door, windows and turf as the longhouse's)
    if (styleOf(K.b) === 'nordico' && built >= 1 && (!o.pat || o.pat === 'plankV') && (o.roof || P.kind) === 'turf' && !o.noRoof) { const t = nordHouse(g, gw, K, o, x, z, sx, sz, h, floors); if (o.yard) yardFence(K, o.yard); return t; }
    const wallsH = h * (built < 1 ? G.clamp(built / 0.8, 0.08, 1) : 1);
    if (built < 1) {
      // (going up: its walls as high as the work has got, the scaffold round them)
      K.as(o.pat || (o.wall ? 'plaster' : st.wall), () => K.box(x, 0, z, sx, wallsH, sz, o.wall || (K.b.v === 2 ? P.wr : P.wl)));
      K.as('beam', () => { for (let f = 1; f < floors && wallsH > f * h / floors; f++) K.box(x, f * h / floors - 0.12, z, sx + 0.14, 0.24, sz + 0.14, P.trim || '#6b4a30'); });
      scaffold(K, x, z, sx, sz, h); return h;
    }
    // (a house stands on its own footing of stones; the halls and the yards whose things stand round them keep the plinth)
    if (!o.plinth) footing(K, x, z, sx, sz, K.st !== 'egipcio' && K.st !== 'asteca');
    if (K.st === 'asteca' && floors > 1 && (o.roof || P.kind) === 'flat' && !o.noRoof && !o.wall) return stepped(g, gw, K, o, x, z, sx, sz, h, floors);
    warmWalls(K, x, z, sx, sz, h, floors, o);
    // (the band under the eaves: a cornice of cut stone in two steps in the Roman and the Greek town, timber in the classical,
    // painted in the Egyptian)
    if (K.st === 'romano' || K.st === 'grego') { const cs = P.base ? P.base[2] : '#a09a8e'; K.as(K.st === 'grego' ? 'marble' : 'ashlar', () => { K.box(x, h - 0.24, z, sx + 0.08, 0.13, sz + 0.08, cs); K.box(x, h - 0.11, z, sx + 0.2, 0.11, sz + 0.2, dim(cs, 0.95)); }); }
    else K.as(K.st === 'egipcio' ? 'stucco' : 'beam', () => K.box(x, h - 0.2, z, sx + 0.1, 0.2, sz + 0.1, K.st === 'egipcio' ? (P.trim || '#2f8f8a') : (P.trim || '#6b4a30')));
    openings(g, gw, K, x, z, sx, sz, 0, h, floors, o.door);
    // (the wooden balcony of the classical and the southern town houses, on the floor under the roof, over the door)
    if (floors >= 2 && (K.st === 'classico' || K.st === 'grego' || K.st === 'romano') && (K.b.type === 'sobrado' || K.b.type === 'insula') && K.hv(18) < 0.75) balcony(K, x, z, sx, sz, h, floors);
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
        K.as('stucco', () => K.box(x, h - 0.35, z, sx + 0.08, 0.3, sz + 0.08, P.trim || '#b33a2a'));
        for (let k = 0; k < 3; k++) { const px = x - sx * 0.3 + k * sx * 0.3, pz = z + sz * 0.3; K.as('mud', () => K.cyl(px, h + 0.25, pz, 0.22, 0.32, '#b8683a')); K.gp.blade(K.x0 + px, K.y0 + h + 0.55, K.z0 + pz, 0.18, k, K.x0 + px + 0.1, K.y0 + h + 1.05, K.z0 + pz, [70, 120, 50], k % 2 ? [90, 160, 70] : [224, 90, 122], 0.5); K.gp.blade(K.x0 + px, K.y0 + h + 0.55, K.z0 + pz, 0.18, k + 1.6, K.x0 + px - 0.12, K.y0 + h + 0.95, K.z0 + pz + 0.05, [70, 120, 50], [96, 164, 72], 0.5); }
      }
    }
    if (o.chimney) { K.as('stone', () => { const cx = x + sx * 0.28, cz = z - sz * 0.18; K.box(cx, h * 0.6, cz, 0.62, top - h * 0.6 + 0.8, 0.62, P.base ? P.base[1] : '#6f6a60'); K.box(cx, top + 0.8, cz, 0.78, 0.14, 0.78, P.base ? P.base[0] : '#8a8478'); });
      B3.chim.set(K.b.id, [K.x0 + x + sx * 0.28, K.y0 + top + 0.95, K.z0 + z - sz * 0.18]); } // (where its smoke comes out: FX3D)
    if (o.yard) yardFence(K, o.yard);
    return top;
  }
  // a rune stone (the model made in Blender, G.Mesh3D 'runa': its foot a quarter of a metre in the ground), at (x, z) of the lot,
  // its carved face turned ry from +Z, s its size: granite, the serpent band painted red, the runes cut dark. False: no model
  function runeStone(K, x, z, ry, s) {
    const M3 = G.Mesh3D; if (!M3 || !M3.has('runa') || !M3.part('runa', 'pedra')) return false;
    const y = K.footed || BASELESS[K.b.type] ? Math.min(K.gy(x - 0.4, z), K.gy(x + 0.4, z), K.gy(x, z)) : 0; const m = R3.mat(K.x0 + x, K.y0 + y, K.z0 + z, ry, s, s, s);
    const P = K.P; const rock = mixc(P.base ? P.base[1] : '#6f6a60', [128, 124, 116], 0.5);
    K.as('rock', () => K.g.put(M3.part('runa', 'pedra'), m, K.c(rock)));
    for (const [part, col] of [['faixa', P.trim || '#a23c2a'], ['runas', dim(rock, 0.42)], ['olho', '#e8e0c8']]) { const pg = M3.part('runa', part); if (pg) K.g.put(pg, m, K.c(col)); }
    return true;
  }
  // the inn's sign beside its door: an iron arm out of the wall at the height of the lintel, the board hanging from it on two
  // chains, painted (a jug, the people's gold on it)
  function innSign(K) {
    const B = K.body; if (!B || !B.door) return; const d = B.door, o = d.o, ax = o[1] !== 0; const P = K.P;
    const wall = ax ? B.z + o[1] * B.sz / 2 : B.x + o[0] * B.sx / 2; const side = K.hv(23) < 0.5 ? -1 : 1; const a = (ax ? B.x : B.z) + d.a + side * (d.w / 2 + 0.35);
    const at = (aa, y, n) => (ax ? [aa, y, wall + o[1] * n] : [wall + o[0] * n, y, aa]); const y = 2.45;
    K.as('iron', () => { K.bar(at(a, y, 0), at(a, y, 0.82), [0, 0.04, 0], ax ? [0.03, 0, 0] : [0, 0, 0.03], '#2e2b28'); K.bar(at(a, y - 0.35, 0), at(a, y - 0.02, 0.5), [0, 0.03, 0], ax ? [0.02, 0, 0] : [0, 0, 0.02], '#2e2b28');
      for (const n of [0.22, 0.68]) K.log(at(a, y - 0.2, n), at(a, y, n), 0.008, '#3a3632'); });
    const c = at(a, y - 0.66, 0.45); K.as('jamb', () => K.box(c[0], c[1], c[2], ax ? 0.05 : 0.62, 0.46, ax ? 0.62 : 0.05, P.trim || '#6b4a30'));
    K.as('jamb', () => { for (const s2 of [-1, 1]) { const q = at(a + s2 * 0.032, y - 0.6, 0.45); K.box(q[0], q[1], q[2], ax ? 0.012 : 0.4, 0.3, ax ? 0.4 : 0.012, P.acc || '#d8b25a'); } });
  }
  // the yard before the door of a store, a barn, a potter's (house's o.yard): fenced from the body's front corners to the edge
  // of the lot, the gate open before the door — in the north stakes and wattle and a walk of planks over the mud to the door,
  // elsewhere a low wall of the people's stuff with its cap. What stands in it is Props3D's (K.body.yard: how deep it is)
  function yardFence(K, deep) {
    const B = K.body; if (!B || !B.door || K.prog < 1) return; const P = K.P; const d = B.door; const o = d.o; const ax = o[1] !== 0; const sg = o[0] + o[1];
    const len = ax ? B.sx : B.sz, mid = ax ? B.x : B.z, wall = ax ? B.z + o[1] * B.sz / 2 : B.x + o[0] * B.sx / 2;
    const n1 = Math.abs((sg > 0 ? (ax ? K.d : K.w) : 0) - wall) - 0.16; if (n1 < 0.8) return; B.yard = { deep, n1, side: d.side };
    // (a point of the yard: a along the wall, n out from it; the ground there)
    const at = (a, n) => (ax ? [a, wall + o[1] * n] : [wall + o[0] * n, a]); const gyA = (a, n) => { const p = at(a, n); return K.footed ? K.gy(p[0], p[1]) : 0; };
    const a0 = mid - len / 2 + 0.06, a1 = mid + len / 2 - 0.06, ga = mid + d.a, gh = 0.72; // (the gate: its half width, before the door)
    const runs = [[a0, n1, ga - gh, n1], [ga + gh, n1, a1, n1], [a0, 0.32, a0, n1], [a1, 0.32, a1, n1]].filter(r => Math.hypot(r[2] - r[0], r[3] - r[1]) > 0.3); // (the sides from clear of the footing's stones)
    const nord = K.st === 'nordico'; const hv = k => K.hv(600 + k);
    if (nord) {
      // (stakes driven in a little crooked, wattle woven between them, its top uneven; the gate's posts taller)
      const stake = [96, 78, 58], wat = mixc([142, 118, 84], [118, 104, 82], hv(1) * 0.6); let q = 0;
      for (const [aA, nA, aB, nB] of runs) {
        const L = Math.hypot(aB - aA, nB - nA), n = Math.max(1, Math.round(L / 0.9));
        for (let k = 0; k <= n; k++) { const f = k / n, a = aA + (aB - aA) * f, nn = nA + (nB - nA) * f; const p = at(a, nn), y = gyA(a, nn), lean = (hv(10 + q++) - 0.5) * 0.06;
          K.as('bark', () => K.log([p[0], y - 0.2, p[1]], [p[0] + lean, y + 0.92 + hv(40 + q) * 0.1, p[1] - lean], 0.042, stake)); }
        for (let k = 0; k < n; k++) { const fa = k / n, fb = (k + 1) / n; const A = at(aA + (aB - aA) * fa, nA + (nB - nA) * fa), Bp = at(aA + (aB - aA) * fb, nA + (nB - nA) * fb);
          const yA = gyA(aA + (aB - aA) * fa, nA + (nB - nA) * fa), yB = gyA(aA + (aB - aA) * fb, nA + (nB - nA) * fb); const y = Math.min(yA, yB) - 0.06, top = Math.max(yA, yB) + 0.74 + hv(70 + q++) * 0.08;
          const l = Math.hypot(Bp[0] - A[0], Bp[1] - A[1]); K.as('wattle', () => K.rbox((A[0] + Bp[0]) / 2, y, (A[1] + Bp[1]) / 2, l, top - y, 0.07, wat, -Math.atan2(Bp[1] - A[1], Bp[0] - A[0]))); }
      }
      K.as('beam', () => { for (const s of [-1, 1]) { const a = ga + s * gh; const p = at(a, n1), y = gyA(a, n1); K.box(p[0], y - 0.25, p[1], 0.15, 1.42, 0.15, nordWood(K).dark); } });
      // (the walk of planks laid across the mud from the step to the gate)
      const nP = Math.floor((n1 - 0.42) / 0.27);
      // (each plank on the ground as it is drawn — on a slope a plank laid flat went into the ground at its high end)
      K.as(ax ? 'beamX' : 'beamZ', () => { for (let k = 0; k < nP; k++) { const nn = 0.5 + k * 0.27, a0 = ga + (hv(90 + k) - 0.5) * 0.06, hl = (1.05 + hv(110 + k) * 0.1) / 2, sk = (hv(150 + k) - 0.5) * 0.08;
        const pa = at(a0 - hl, nn - sk), pb = at(a0 + hl, nn + sk); laid(K.g, [K.x0 + pa[0], K.z0 + pa[1]], [K.x0 + pb[0], K.z0 + pb[1]], 0.24, 0.05, K.c(mixc([128, 104, 74], [104, 92, 78], hv(130 + k)))); } });
    } else {
      // (a low wall of stone, mud brick or plastered, its cap of slabs; the gate between two piers)
      const pat = K.st === 'egipcio' ? 'mud' : K.st === 'grego' ? 'whitewash' : K.st === 'asteca' ? 'stucco' : 'stone'; const wc = pat === 'stone' ? (P.base ? P.base[1] : '#8a8478') : (P.wl || '#efe2c4');
      for (const [aA, nA, aB, nB] of runs) { const A = at(aA, nA), Bp = at(aB, nB); const l = Math.hypot(Bp[0] - A[0], Bp[1] - A[1]); const yA = gyA(aA, nA), yB = gyA(aB, nB), y = Math.min(yA, yB) - 0.1, top = Math.max(yA, yB) + 0.78; const ry = -Math.atan2(Bp[1] - A[1], Bp[0] - A[0]);
        K.as(pat, () => K.rbox((A[0] + Bp[0]) / 2, y, (A[1] + Bp[1]) / 2, l + 0.24, top - y, 0.24, wc, ry));
        K.as('slab', () => K.rbox((A[0] + Bp[0]) / 2, top, (A[1] + Bp[1]) / 2, l + 0.3, 0.07, 0.32, K.st === 'asteca' ? (P.trim || '#b33a2a') : dim(P.base ? P.base[2] : '#a09a8e', 0.95), ry)); }
      K.as(pat, () => { for (const s of [-1, 1]) { const a = ga + s * (gh + 0.1); const p = at(a, n1), y = gyA(a, n1); K.box(p[0], y - 0.1, p[1], 0.38, 1.12, 0.38, dim(pat === 'stone' ? wc : P.wl || '#efe2c4', 0.94)); } });
    }
  }
  // a timber building of the north that is not a home — the workshop, the store, the barn, the hall: the longhouse's walls,
  // door, windows and turf over the body the house's kind asks for, a chimney of stone where a fire works, the smoke hole
  // elsewhere; the hall-like ones (temple, chief's house, barracks, inn) carved as the rich carve theirs
  function nordHouse(g, gw, K, o, x, z, sx, sz, h, floors) {
    const P = K.P; const cls = K.cls = ({ temple: 2, palacio: 3, paco: 3, quartel: 2, taverna: 2, administracao: 2, coletoria: 1, biblioteca: 2 })[K.b.type] || 1;
    const side = doorSide(K.b); const along = sx > sz + 0.01 ? true : sz > sx + 0.01 ? false : ridgeX(K.b, side); const hf = h / floors;
    if (!o.plinth) footing(K, x, z, sx, sz);
    nordWalls(K, x, z, sx, sz, h, cls, side, o.wall);
    if (floors > 1) K.as('beam', () => { for (let f = 1; f < floors; f++) K.box(x, f * hf - 0.12, z, sx + 0.12, 0.22, sz + 0.12, P.wr || '#5f4630'); });
    const door = o.door === false ? null : nordDoor(K, x, z, sx, sz, hf, side, cls, along);
    for (let f = 0; f < floors; f++) nordWindows(gw, K, x, z, sx, sz, hf, cls, along, door, f * hf);
    if (K.footed) wallGrass(K, x, z, sx, sz, door);
    const top = roofOf(K, x, z, sx, sz, h, 'turf', null, !along);
    nordGables(gw, K, cls);
    if (o.chimney) {
      // (a chimney of fieldstone through the turf, its cap a flat stone)
      const R = K.roof; const u = R.L * 0.22, v = -R.D * 0.18; const c0 = R.at(u, 0, v); const yTop = top + 0.75;
      K.as('rock', () => { K.box(c0[0], h * 0.6, c0[2], 0.7, yTop - h * 0.6, 0.7, P.base ? P.base[1] : '#6f6a60'); K.box(c0[0], yTop, c0[2], 0.86, 0.12, 0.86, P.base ? P.base[0] : '#8a8478'); });
      B3.chim.set(K.b.id, [K.x0 + c0[0], K.y0 + yTop + 0.2, K.z0 + c0[2]]);
    } else smokeHole(K, cls);
    K.body = { x, z, sx, sz, door };
    return top;
  }
  // the smithy and the workshop, as the god's view draws the forge: the shop behind and, on the side of its door, the open
  // work floor under a roof on posts — for the smith, the hearth of stone against the shop's wall with its hood and its tall
  // chimney. What is worked there (the anvil, the tub, the coal and the tools; the bench, the trestle, the planks) is
  // Props3D's, on the floor this leaves (K.body.floor)
  function smithy(g, gw, K, o) {
    if (K.prog < 1) return house(g, gw, K, o);
    const P = K.P; const side = doorSide(K.b); const od = { S: [0, 1], N: [0, -1], E: [1, 0], W: [-1, 0] }[side]; const ax = od[1] !== 0;
    // (the lot's frame: a along the door's wall, n from the back toward the door)
    const hd = (ax ? K.d : K.w) / 2, inset = 0.35; const wid = (ax ? K.w : K.d) - inset * 2, dep = hd * 2 - inset * 2;
    const at = (a, y, n) => [K.w / 2 + (ax ? a : od[0] * n), y, K.d / 2 + (ax ? od[1] * n : a)];
    const fd = Math.min(2.7, dep * 0.36), bd = dep - fd, nb = -hd + inset + bd / 2, nf0 = -hd + inset + bd, nf1 = hd - 0.16;
    const c = at(0, 0, nb); const top = house(g, gw, K, Object.assign({}, o, { body: { x: c[0], z: c[2], sx: ax ? wid : bd, sz: ax ? bd : wid }, chimney: o.kind === 'forge' ? false : o.chimney }));
    const B = K.body; const doorA = B && B.door ? B.door.a : 0; const h = o.h || 3.2;
    // (the floor: on a footing house, beaten earth a step over the ground, its edge of stones; on a plinth, the plinth)
    const fy = K.footed ? -0.24 : 0; const nord = K.st === 'nordico';
    if (K.footed) { const m = at(0, 0, (nf0 + nf1) / 2); K.as('soil', () => K.box(m[0], K.lo - K.y0 - 0.1, m[2], ax ? wid : nf1 - nf0, K.y0 - K.lo + 0.1 + fy, ax ? nf1 - nf0 : wid, [112, 94, 72]));
      const e = at(0, 0, nf1 - 0.1); K.as('rock', () => K.box(e[0], fy - 0.18, e[2], ax ? wid + 0.06 : 0.2, 0.22, ax ? 0.2 : wid + 0.06, P.base ? P.base[2] : '#8e877b')); }
    // (the posts and the beam along the front, the roof of the floor sloping down from the shop's wall)
    const ph = Math.min(2.3, h - 0.5), wc = nord ? (P.wr || '#5f4630') : '#6a5038'; const np = wid > 5.5 ? 3 : 2;
    K.as('beam', () => { for (let k = 0; k < np; k++) { const a = -wid / 2 + 0.12 + (wid - 0.24) * k / (np - 1); if (np === 3 && k === 1 && Math.abs(a - doorA) < 0.9) continue; const p = at(a, 0, nf1 - 0.14); K.box(p[0], fy, p[2], 0.2, ph - fy, 0.2, wc); }
      const p = at(0, 0, nf1 - 0.14); K.box(p[0], ph - 0.18, p[2], ax ? wid : 0.22, 0.2, ax ? 0.22 : wid, wc); });
    const rA = at(0, h - 0.06, nf0 - 0.04), rB = at(0, ph - 0.05, nf1 + 0.22);
    const tt = nord ? turfTone(K) : null; const seed = K.b.id & 1023;
    K.as(nord ? 'turf' : (stuff(K.b).tile === 'mud' ? 'tile' : stuff(K.b).tile), () => K.bar(rA, rB, [0, 0.14, 0], ax ? [wid + 0.36, 0, 0] : [0, 0, wid + 0.36], nord ? (X, Y, Z) => { const a = vnoise(X * 0.6, Z * 0.6, seed); return qc(mixc(mixc(tt.grass, tt.dry, G.clamp((a - 0.55) * 3, 0, 0.7)), tt.moss, G.clamp((0.45 - a) * 3, 0, 0.8))); } : ((P.roof && P.roof[1]) || '#94452d')));
    K.as('plankH', () => K.bar([rA[0], rA[1] - 0.09, rA[2]], [rB[0], rB[1] - 0.09, rB[2]], [0, 0.04, 0], ax ? [wid + 0.3, 0, 0] : [0, 0, wid + 0.3], dim(wc, 0.85)));
    // (the smith's hearth against the wall, away from the door, its hood and the chimney through the roof)
    let hearthA = null;
    if (o.kind === 'forge') {
      hearthA = (doorA > 0.2 ? -1 : doorA < -0.2 ? 1 : K.hv(15) < 0.5 ? -1 : 1) * (wid / 2 - 0.95); const hc = P.base ? P.base[1] : '#6f6a60';
      const p = at(hearthA, 0, nf0 + 0.5); K.as('rock', () => { K.box(p[0], fy, p[2], 1.3, 0.82 - fy, 1.0, hc); K.hip(p[0], 1.65, p[2], 1.3, 0.75, 1.0, dim(hc, 0.9)); });
      K.box(p[0], 0.83, p[2], 0.95, 0.05, 0.62, '#2a1a14'); for (let k = 0; k < 4; k++) K.sph(p[0] + (K.hv(16 + k) - 0.5) * 0.6, 0.86, p[2] + (K.hv(20 + k) - 0.5) * 0.36, 0.07, k % 2 ? '#a8401c' : '#d06428', 0.04);
      const R = K.roof; const q = at(hearthA, 0, nf0 - 0.36); let yT = top + 0.8;
      if (R) { const v = R.alongZ ? q[0] - B.x : q[2] - B.z; yT = Math.max(R.y + 1.2, R.y + R.h - Math.tan(R.ang) * Math.abs(v) + R.T / Math.cos(R.ang) + 1.1); }
      K.as('rock', () => { K.box(q[0], 1.6, q[2], 0.66, yT - 1.6, 0.66, hc); K.box(q[0], yT, q[2], 0.82, 0.12, 0.82, P.base ? P.base[0] : '#8a8478'); });
      B3.chim.set(K.b.id, [K.x0 + q[0], K.y0 + yT + 0.2, K.z0 + q[2]]);
    }
    if (B) B.floor = { ax, od, a0: -wid / 2 + 0.2, a1: wid / 2 - 0.2, n0: nf0 + 0.08, n1: nf1 - 0.3, y: fy, doorA, hearthA, kind: o.kind, at };
    return top;
  }
  // the longhouse of the northern people (the god's view: low planked walls, a roof of turf on them, the door in the long
  // side; f: its length and walls grow with the storeys). It stands on a sill on a footing of stones — corner posts, posts
  // between the planks, the wall plate under the eaves; a door in its portal, with its iron; a few small windows with
  // shutters; the turf roof with its log and its crossed, carved barge boards; the smoke hole on the ridge. How rich it is
  // (cls: 0 a cabin, 1 a house, 2 a big house, 3 a hall) shows in its size, its carving, its paint, its shields; its own id
  // picks the rest — a woodshed at one end, the door off the middle, the windows and shutters, the age of its turf
  function longhouse(g, gw, K, f) {
    f = f || 1; const cls = f < 0.8 ? 0 : f < 1.5 ? 1 : f < 2.5 ? 2 : 3; K.cls = cls;
    const side = doorSide(K.b); const od = { S: [0, 1], N: [0, -1], E: [1, 0], W: [-1, 0] }[side];
    // (the ridge along the lot's long side; on a square lot along the wall with the door — the door in the long side, as
    // the north builds — save now and then a house entered by its gable)
    const along = K.w > K.d + 0.01 ? true : K.d > K.w + 0.01 ? false : ridgeX(K.b, side);
    const Ll = along ? K.w : K.d, Dl = along ? K.d : K.w;
    let ll = Math.min(Ll - 0.4, Ll * (0.84 + f * 0.04)); const dd = Dl * 0.64; const h = 1.7 + f * 0.45;
    let x = K.w / 2, z = K.d / 2;
    if (K.prog < 1) {
      // (going up: the footing laid, the sill and the corner posts standing, the planks rising with the work; the scaffold round)
      const lx = along ? ll : dd, lz = along ? dd : ll, k = K.prog; const wd = K.P.wr || '#5f4630';
      if (k > 0.08) footing(K, x, z, lx, lz);
      if (k > 0.2) K.as('beam', () => { K.box(x, 0, z, lx + 0.1, 0.2, lz + 0.1, dim(wd, 0.92)); const ph = h * G.clamp((k - 0.2) / 0.4, 0.1, 1); for (const [px, pz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) K.box(x + px * (lx / 2 - 0.08), 0, z + pz * (lz / 2 - 0.08), 0.26, ph, 0.26, wd); });
      if (k > 0.45) K.as('plankV', () => K.box(x, 0.2, z, lx - 0.06, h * G.clamp((k - 0.45) / 0.45, 0.05, 1) - 0.2, lz - 0.06, mixc(K.P.wl || '#7e5e40', [168, 132, 92], 0.35)));
      scaffold(K, x, z, lx, lz, h + 2); return;
    }
    const gableDoor = along ? od[0] !== 0 : od[1] !== 0;
    // (a woodshed against one gable — never the door's — the house itself that much shorter)
    let lean = 0, lt = 0; if (cls <= 1 && K.hv(1) < 0.42) { lean = gableDoor ? -(along ? od[0] : od[1]) : (K.hv(2) < 0.5 ? -1 : 1); lt = Math.min(1.05, ll * 0.27); ll -= lt; if (along) x -= lean * lt / 2; else z -= lean * lt / 2; }
    const lx = along ? ll : dd, lz = along ? dd : ll;
    footing(K, x, z, lx, lz);
    nordWalls(K, x, z, lx, lz, h, cls, side);
    const door = nordDoor(K, x, z, lx, lz, h, side, cls, along);
    nordWindows(gw, K, x, z, lx, lz, h, cls, along, door); wallGrass(K, x, z, lx, lz, door);
    const top = roofOf(K, x, z, lx, lz, h, 'turf', null, !along);
    nordGables(gw, K, cls);
    smokeHole(K, cls);
    if (lean) leanTo(K, x, z, lx, lz, h, lean, lt, along);
    if (cls >= 3) shields(K, x, z, lx, lz, h, along, door);
    // (the body's box and its door, for what lies about the house: Props3D; a woodshed's end is taken)
    K.body = { x, z, sx: lx, sz: lz, door, lean: lean ? (along ? [lean, 0] : [0, lean]) : null, along };
    return top;
  }
  // the walls of a timber house of the north: planks standing on a sill, corner posts, posts between the planks (not on the
  // wall with the door), the wall plate under the eaves; a painted band on the houses of the rich
  // (the timber of the north: dark and weathered, not the paint-box brown — each house its own shade of the years)
  function nordWood(K) {
    const P = K.P; const base = mixc(P.wl || '#7e5e40', K.hv(10) < 0.5 ? [92, 82, 70] : [120, 92, 66], 0.2 + K.hv(11) * 0.3);
    return { wall: calm(base, 0.68, 0.86), dark: calm(P.wr || '#5f4630', 0.7, 0.88) };
  }
  function nordWalls(K, x, z, lx, lz, h, cls, side, wallCol) {
    const P = K.P; const NW = nordWood(K); const wd = NW.dark;
    const wall = wallCol ? calm(mixc(wallCol, [126, 94, 64], 0.08 + K.hv(11) * 0.1), 0.8, 0.88) : NW.wall;
    // (the wall, its top band in the shade of the eaves — the roof's volume where no shadow of contact is drawn)
    K.as('plankV', () => { K.box(x, 0, z, lx, h - 0.45, lz, wall); K.box(x, h - 0.45, z, lx, 0.45, lz, eaveShade(K, wall, h)); });
    // (an old house mended: a plank or three replaced, fresher than the grey ones round them — where, by its id)
    const age = K.hv(3); if (K.fine && age > 0.45) K.as('plankV', () => { const n = 1 + Math.floor((age - 0.45) * 5.5); let k = 0;
      for (const W2 of wallsOf(lx, lz)) { if (k >= n) break; if (K.hv(230 + k * 3) < 0.35) continue; const a = (K.hv(231 + k * 3) - 0.5) * (W2.len - 0.9); const w2 = 0.2 + K.hv(232 + k * 3) * 0.08; k++;
        K.box(x + (W2.ax ? a : W2.o[0] * (lx / 2 + 0.006)), 0.22, z + (W2.ax ? W2.o[1] * (lz / 2 + 0.006) : a), W2.ax ? w2 : 0.02, h - 0.44, W2.ax ? 0.02 : w2, mixc(wall, [168, 132, 92], 0.42)); } });
    K.as('beam', () => {
      K.box(x, 0, z, lx + 0.1, 0.2, lz + 0.1, dim(wd, 0.92)); K.box(x, h - 0.2, z, lx + 0.09, 0.2, lz + 0.09, wd);
      for (const [px, pz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) K.box(x + px * (lx / 2 - 0.08), 0, z + pz * (lz / 2 - 0.08), 0.26, h, 0.26, wd);
      if (K.fine) for (const W2 of wallsOf(lx, lz)) { if (W2.side === side) continue; const nb = bays(W2.len);
        for (let k = 1; k < nb; k++) { const a = -W2.len / 2 + W2.len * k / nb; K.box(x + (W2.ax ? a : W2.o[0] * (lx / 2 + 0.012)), 0.2, z + (W2.ax ? W2.o[1] * (lz / 2 + 0.012) : a), W2.ax ? 0.15 : 0.05, h - 0.4, W2.ax ? 0.05 : 0.15, dim(wd, 1.06)); } }
    });
    if (cls >= 2) K.as('beam', () => K.box(x, h - 0.31, z, lx + 0.03, 0.09, lz + 0.03, P.trim || '#a23c2a'));
  }
  // (a wall's colour darkening up to the eaves over it: ×0.78 at the top h — a colour of the point, for the band's box)
  const eaveShade = (K, col, h) => { const top = K.y0 + h - 0.02, lo = dim(col, 0.78); return (X, Y) => (Y > top ? lo : col); };
  // (the four walls of a box: the side each faces, its outward way, whether it runs along X, its length; and how many bays)
  const wallsOf = (lx, lz) => [{ side: 'S', o: [0, 1], ax: true, len: lx }, { side: 'N', o: [0, -1], ax: true, len: lx }, { side: 'E', o: [1, 0], ax: false, len: lz }, { side: 'W', o: [-1, 0], ax: false, len: lz }];
  const bays = len => Math.max(1, Math.round(len / 1.25));
  // the door of a timber house of the north: planks in a portal of posts and a lintel, a threshold, the iron straps of its
  // hinges and a ring; on the better houses a carved peak over it and paint, on a gable a little roof on brackets; the
  // stone step before it, down to the ground. Gives back where it is (for the windows to keep clear of it)
  function nordDoor(K, x, z, lx, lz, h, side, cls, along) {
    const P = K.P; const o = { S: [0, 1], N: [0, -1], E: [1, 0], W: [-1, 0] }[side]; const ax = o[1] !== 0;
    const len = ax ? lx : lz; const gable = along ? !ax : ax;
    const dw = cls >= 3 ? 1.25 : cls >= 2 ? 1.05 : 0.9; let dh = Math.min(cls >= 2 ? 2.05 : 1.8, gable ? h + 0.45 : h - 0.24); // (widths in steps of 5 cm: the door picture's own)
    // (the carved portal — the model made in Blender, G.Mesh3D 'portal': two jambs and a heavy lintel round a door of 1.0 × 1.9 m,
    // the interlace in relief, its threshold half in the ground — where the machine carries detail: scaled to this door, its
    // lintel kept under the eaves, so a cabin's door is a low one, as the north's were)
    const PT = K.fine && (cls >= 1 || K.hv(27) < 0.5) && !!(G.Mesh3D && G.Mesh3D.has('portal') && G.Mesh3D.part('portal', 'madeira')); let psy = 0; // (every house and hall; half the cabins)
    if (PT) { psy = Math.min(dh / 1.9, (gable ? h + 0.7 : h - 0.04) / 2.3); dh = 1.9 * psy; }
    const nb = bays(len); const off = gable || nb < 3 ? 0 : (K.hv(6) < 0.5 ? -1 : 1) * (K.hv(6) < 0.25 || K.hv(6) > 0.75 ? len / nb : 0);
    const fx = x + o[0] * lx / 2 + (ax ? off : 0), fz = z + o[1] * lz / 2 + (ax ? 0 : off);
    // (in the door's frame: a along the wall, n out of it)
    const D = (a, y, n) => [fx + (ax ? a : 0) + o[0] * n, y, fz + (ax ? 0 : a) + o[1] * n];
    const bx = (a, y, n, wa, hy, wn, col) => { const p = D(a, y, n); K.box(p[0], p[1], p[2], ax ? wa : wn, hy, ax ? wn : wa, col); };
    const hv = K.hv(12); const leaf = hv < 0.3 ? mixc(P.door || '#3a2616', [104, 98, 88], 0.18) : cls >= 2 && hv > 0.6 ? mixc(P.trim || '#a23c2a', P.door || '#3a2616', 0.5) : (P.door || '#3a2616');
    // (the leaf: planks with their iron straps, nails and ring — one leaf of the stack's door picture, hinged left or right by the
    // house's id, across the leaf's own width from its foot)
    const lf = K.hv(19) < 0.5 ? 0 : 1; const fp = D(0, 0.06, 0.04);
    K.as(doorPat(K.x0 + fp[0], K.y0 + 0.06, K.z0 + fp[2], o, dw, lf), () => bx(0, 0.06, 0.04, dw, dh - 0.06, 0.07, leaf));
    const fc = nordWood(K).dark;
    if (PT) { const M3 = G.Mesh3D; const p = D(0, 0, 0); const m = R3.mat(K.x0 + p[0], K.y0 + p[1], K.z0 + p[2], Math.atan2(o[0], o[1]), dw, psy, 1);
      K.as('beam', () => K.g.put(M3.part('portal', 'madeira'), m, K.c(fc))); const ent = M3.part('portal', 'entalhe');
      if (ent) K.as('jamb', () => K.g.put(ent, m, K.c(cls >= 2 || (cls === 1 && K.hv(6) < 0.4) ? (P.trim || '#a23c2a') : mixc(fc, [150, 118, 82], 0.5)))); }
    else K.as('beam', () => {
      for (const s of [-1, 1]) bx(s * (dw / 2 + 0.08), 0, 0.07, 0.16, dh + 0.02, 0.17, fc);
      bx(0, dh, 0.08, dw + 0.52, 0.2, 0.2, fc); bx(0, 0, 0.1, dw + 0.36, 0.07, 0.25, dim(fc, 0.85));
      if (cls >= 2) for (const s of [-1, 1]) bx(s * (dw / 2 + 0.08), 0.15, 0.16, 0.06, dh - 0.3, 0.02, P.trim || '#a23c2a');
      // (a carved peak over the lintel: two boards meeting)
      if (cls >= 1 && (gable || h - dh > 0.62)) for (const s of [-1, 1]) { const a = D(s * (dw / 2 + 0.22), dh + 0.2, 0.09), b2 = D(0, dh + 0.42 + cls * 0.05, 0.09); const da = -s * (dw / 2 + 0.22), dy = b2[1] - a[1]; const l = Math.hypot(da, dy);
        K.bar(a, b2, [ax ? -dy / l * 0.1 : 0, da / l * 0.1, ax ? 0 : -dy / l * 0.1], [o[0] * 0.06, 0, o[1] * 0.06], cls >= 2 ? (P.trim || '#a23c2a') : fc); }
    });
    // (the iron is the picture's; in relief only the pin the ring hangs from, on the latch side, where the picture has the ring —
    // its leaf runs along the wall the way the shader reads it: su)
    if (K.fine) K.as('iron', () => { const su = ax ? -o[1] : o[0]; const a = su * ((lf ? 0.16 : 0.84) - 0.5) * dw; const r = D(a, 1.12, 0.075), r2 = D(a, 1.12, 0.11); K.log(r, r2, 0.03, '#2e2b28'); });
    // (on a gable, a little roof over the door on two brackets)
    if (gable && cls >= 1 && K.hv(13) < 0.7) { const yb = PT ? Math.max(dh + 0.3, 2.3 * psy + 0.08) : dh + 0.3, dep = 0.62, wdt = dw + 0.6;
      K.as('beam', () => { for (const s of [-1, 1]) K.bar(D(s * (wdt / 2 - 0.1), yb - 0.45, 0.03), D(s * (wdt / 2 - 0.1), yb + 0.02, dep - 0.08), [0, 0.07, 0], ax ? [0.06, 0, 0] : [0, 0, 0.06], fc); bx(0, yb - 0.03, dep / 2, wdt - 0.1, 0.03, dep, dim(fc, 0.8)); });
      const c0 = D(0, yb, dep / 2); K.as('shingle', () => K.gable(c0[0], c0[1], c0[2], ax ? wdt : dep + 0.1, 0.42, ax ? dep + 0.1 : wdt, dim(fc, 0.9), ax)); }
    // (the stone step before it, from the ground up to the floor — no further out than a hand past the lot)
    const cut = doorSteps(K, D, bx, dw + 0.4, stripOf(K, x, z, lx, lz, o) + 0.12, 0.06, 0.04, 0.36, P.base ? P.base[2] : '#a09a8e', 'rock', [len / 2 + off, len / 2 - off]);
    return { o, a: off, w: dw + 0.5, side, cut: cut ? [off + cut[0], cut[1]] : null };
  }
  // the windows of a timber house of the north: small and high in the bays between the posts of the long walls (and the
  // gables of a hall), each in its frame with a sill and its shutter — open against the wall, or shut (no light in it)
  function nordWindows(gw, K, x, z, lx, lz, h, cls, along, door, yb) {
    const P = K.P; const fc = nordWood(K).dark; let k = yb ? 100 : 0; yb = yb || 0;
    for (const W2 of wallsOf(lx, lz)) {
      const long = along ? W2.ax : !W2.ax; if (!long && cls < 2) continue;
      const nb = bays(W2.len); const ww = cls >= 2 ? 0.56 : 0.46, wh = cls >= 2 ? 0.46 : 0.38, wy = yb + Math.min(h - 0.34 - wh, h * 0.5);
      if (yb) door = null; // (the upper floor: windows over the door too)
      // (which bays have a window: every other one, shifted by the house's id; one fewer in a cabin)
      const want = long ? Math.max(cls === 0 ? 0 : 1, Math.round(nb / 2) - (cls === 0 && K.hv(20 + k) < 0.5 ? 1 : 0)) : 1; let made = 0;
      for (let q = 0; q < nb && made < want; q++) {
        const bi = (q * 2 + Math.floor(K.hv(21 + k) * nb)) % nb; const a = -W2.len / 2 + W2.len * (bi + 0.5) / nb; k++;
        if (door && door.side === W2.side && Math.abs(a - door.a) < door.w / 2 + ww / 2 + 0.2) continue;
        if (Math.abs(a) > W2.len / 2 - ww / 2 - 0.25) continue; made++;
        const o = W2.o, ax = W2.ax; const fx = x + o[0] * lx / 2 + (ax ? a : 0), fz = z + o[1] * lz / 2 + (ax ? 0 : a);
        const bx = (da, y, n, wa, hy, wn, col) => K.box(fx + (ax ? da : 0) + o[0] * n, y, fz + (ax ? 0 : da) + o[1] * n, ax ? wa : wn, hy, ax ? wn : wa, col);
        const open = K.hv(40 + k) < 0.62; const s = Math.abs(a) + ww * 1.5 + 0.25 > W2.len / 2 ? -Math.sign(a) || 1 : K.hv(60 + k) < 0.5 ? -1 : 1; // (the shutter swings toward the middle near a corner)
        if (open) { gw.put(SH.box, R3.mat(K.x0 + fx + o[0] * 0.03, K.y0 + wy, K.z0 + fz + o[1] * 0.03, ax ? 0 : Math.PI / 2, ww, wh, 0.05), '#28303a'); if (K.lit) K.lit.push([K.x0 + fx + o[0] * 0.07, K.y0 + wy + wh / 2, K.z0 + fz + o[1] * 0.07, o[0], o[1]]); }
        K.as('beam', () => { bx(0, wy - 0.07, 0.05, ww + 0.16, 0.07, 0.1, fc); bx(0, wy + wh, 0.05, ww + 0.16, 0.07, 0.1, fc); for (const e of [-1, 1]) bx(e * (ww / 2 + 0.04), wy, 0.05, 0.07, wh, 0.1, fc);
          bx(0, wy - 0.12, 0.09, ww + 0.22, 0.05, 0.16, dim(fc, 0.9)); if (cls >= 2) bx(0, wy + wh + 0.07, 0.07, ww + 0.3, 0.08, 0.1, P.trim || '#a23c2a'); });
        const sc2 = mixc(fc, P.wl || '#7e5e40', 0.4);
        K.as('plankV', () => { if (open) bx(s * (ww + 0.12), wy - 0.02, 0.05, ww + 0.02, wh + 0.04, 0.04, sc2); else bx(0, wy - 0.02, 0.1, ww + 0.04, wh + 0.04, 0.04, sc2); });
        // (the shutter's two hinge straps, from its hinge side — toward the window when open, the side it swings to when shut)
        if (K.fine) K.as('iron', () => { const sw = ww + 0.03, c0 = open ? s * (ww + 0.12) : 0, hin = open ? c0 - s * sw / 2 : c0 + s * sw / 2, dir = open ? s : -s;
          for (const f of [0.2, 0.8]) bx(hin + dir * sw * 0.3, wy - 0.02 + (wh + 0.04) * f - 0.017, open ? 0.076 : 0.126, sw * 0.6, 0.034, 0.012, '#2e2b28'); });
      }
    }
  }
  // the gables of a timber house: a small vent high in each (dark: the smoke and the light go through it), lit at night
  // in a hall
  function nordGables(gw, K, cls) {
    const R = K.roof; if (!R) return; const fc = nordWood(K).dark;
    for (const e of [-1, 1]) { const c0 = R.at(e * (R.L / 2 + 0.02), R.y + R.h * 0.4, 0); const ax = R.alongZ; // (the gable faces along the ridge)
      const w = cls >= 2 ? 0.42 : 0.3, hh = cls >= 2 ? 0.3 : 0.22;
      (cls >= 3 ? gw : K.g).put(SH.box, R3.mat(K.x0 + c0[0], K.y0 + c0[1], K.z0 + c0[2], ax ? 0 : Math.PI / 2, w, hh, 0.05), cls >= 3 ? '#28303a' : K.c('#16110c'));
      if (cls >= 3 && K.lit) K.lit.push([K.x0 + c0[0] + (ax ? 0 : e * 0.08), K.y0 + c0[1] + hh / 2, K.z0 + c0[2] + (ax ? e * 0.08 : 0), ax ? 0 : e, ax ? e : 0]);
      K.as('beam', () => { for (const dy of [-0.06, hh]) K.box(c0[0] + (ax ? 0 : e * 0.03), c0[1] + dy, c0[2] + (ax ? e * 0.03 : 0), ax ? w + 0.14 : 0.07, 0.06, ax ? 0.07 : w + 0.14, fc); });
    }
  }
  // the smoke hole on the ridge: a box of boards over it and a little roof on four pegs; the house's smoke comes out there
  function smokeHole(K, cls) {
    const R = K.roof; if (!R) return; const fc = nordWood(K).dark;
    const us = cls >= 3 ? [-0.22, 0.22] : [(K.hv(9) - 0.5) * 0.36];
    us.forEach((f, k) => { const u = f * R.L; const yb = R.ridgeY - 0.08 - R.sagY(u); const c0 = R.at(u, yb, 0);
      K.as('beam', () => { K.box(c0[0], c0[1], c0[2], 0.5, 0.28, 0.5, dim(fc, 0.86)); if (K.fine) for (const [a, b2] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) K.box(c0[0] + a * 0.2, c0[1] + 0.28, c0[2] + b2 * 0.2, 0.04, 0.12, 0.04, fc); });
      K.as('shingle', () => K.gable(c0[0], c0[1] + 0.4, c0[2], 0.66, 0.22, 0.62, dim(fc, 0.95), R.alongZ));
      if (!k) B3.chim.set(K.b.id, [K.x0 + c0[0], K.y0 + c0[1] + 0.3, K.z0 + c0[2]]); });
  }
  // a woodshed against a gable: posts at its open front, sides of planks, a roof of boards sloping away, firewood stacked in it
  function leanTo(K, x, z, lx, lz, h, e, lt, along) {
    const P = K.P; const fc = nordWood(K).dark; const wdt = (along ? lz : lx) * 0.84; const hHi = h * 0.9, hLo = h * 0.6;
    // (in the shed's frame: a out from the gable wall, b across it)
    const at = (a, y, b2) => (along ? [x + e * (lx / 2 + a), y, z + b2] : [x + b2, y, z + e * (lz / 2 + a)]);
    const bx = (a, y, b2, sa, hy, sb, col) => { const p = at(a, y, b2); K.box(p[0], p[1], p[2], along ? sa : sb, hy, along ? sb : sa, col); };
    footing(K, ...(along ? [x + e * (lx / 2 + lt / 2), z, lt, wdt] : [x, z + e * (lz / 2 + lt / 2), wdt, lt]));
    K.as('beam', () => { for (const s of [-1, 1]) bx(lt - 0.08, 0, s * (wdt / 2 - 0.08), 0.14, hLo, 0.14, fc); bx(lt - 0.08, hLo - 0.14, 0, 0.16, 0.14, wdt, fc); });
    K.as('plankV', () => { for (const s of [-1, 1]) bx(lt / 2 - 0.04, 0, s * (wdt / 2 - 0.03), lt - 0.08, hLo - 0.05, 0.05, dim(P.wl || '#7e5e40', 0.92)); });
    const a = at(-0.05, hHi + 0.08, 0), b2 = at(lt + 0.22, hLo - 0.06, 0);
    K.as('shingle', () => K.bar(a, b2, [0, 0.07, 0], along ? [0, 0, wdt + 0.3] : [wdt + 0.3, 0, 0], dim(fc, 0.9)));
    if (G.Props3D && K.fine) { const c0 = at(lt / 2 - 0.05, 0, 0); G.Props3D.woodpile(K, c0[0], 0, c0[2], wdt - 0.24, lt - 0.3, hLo * 0.72, along ? Math.PI / 2 : 0); }
  }
  // the shields of a hall along its long walls, in the colours of the house (its id), each with its iron boss
  function shields(K, x, z, lx, lz, h, along, door) {
    const P = K.P; const cols = [P.trim || '#a23c2a', P.acc || '#d8b25a', '#3f6fb0', '#e8e0c8']; let k = 0;
    for (const W2 of wallsOf(lx, lz)) { const long = along ? W2.ax : !W2.ax; if (!long) continue; const n = Math.floor(W2.len / 1.15);
      for (let q = 0; q < n; q++) { const a = -W2.len / 2 + W2.len * (q + 0.5) / n; if (door && door.side === W2.side && Math.abs(a - door.a) < door.w / 2 + 0.4) continue;
        const o = W2.o; const p = [x + o[0] * lx / 2 + (W2.ax ? a : 0), h * 0.6, z + o[1] * lz / 2 + (W2.ax ? 0 : a)];
        K.log([p[0] + o[0] * 0.02, p[1], p[2] + o[1] * 0.02], [p[0] + o[0] * 0.07, p[1], p[2] + o[1] * 0.07], 0.34, cols[Math.floor(K.hv(80 + k++) * 4)]);
        K.as('iron', () => K.sph(p[0] + o[0] * 0.08, p[1] - 0.06, p[2] + o[1] * 0.08, 0.08, '#6a6660', 0.06)); } }
  }
  // a building going up: the poles of the scaffold at its corners and along its long sides, the ledgers lashed across them
  // at two heights, a deck of planks on one, braces, a ladder leaning on it; and in the lot what it is being made of — a
  // pile of logs, a stack of planks, a heap of stones (by the house's id: never two sites alike)
  function scaffold(K, x, z, sx, sz, h) {
    const pc = '#8a6a44', lc = '#9a7a50'; const hv = k => K.hv(400 + k); const m = 0.3;
    // (the poles: never out past the lot)
    const X0 = Math.max(0.12, x - sx / 2 - m), X1 = Math.min(K.w - 0.12, x + sx / 2 + m), Z0 = Math.max(0.12, z - sz / 2 - m), Z1 = Math.min(K.d - 0.12, z + sz / 2 + m);
    const along = X1 - X0 >= Z1 - Z0; const nP = Math.max(2, Math.round((along ? X1 - X0 : Z1 - Z0) / 2.4) + 1); const ph = h + 0.6;
    K.as('bark', () => {
      for (const s2 of [0, 1]) for (let k = 0; k < nP; k++) { const f = k / (nP - 1); const px = along ? X0 + (X1 - X0) * f : (s2 ? X1 : X0), pz = along ? (s2 ? Z1 : Z0) : Z0 + (Z1 - Z0) * f;
        K.log([px, Math.min(0, K.gy(px, pz)) - 0.1, pz], [px + (hv(k + s2 * 7) - 0.5) * 0.08, ph, pz + (hv(k * 3 + s2) - 0.5) * 0.08], 0.065, pc); }
      // (the ledgers lashed across the poles, at two heights, on both long sides; the end poles tied too)
      for (const s2 of [0, 1]) for (const yy of [ph * 0.4, ph * 0.8]) { if (along) K.log([X0 - 0.05, yy, s2 ? Z1 : Z0], [X1 + 0.05, yy, s2 ? Z1 : Z0], 0.05, lc); else K.log([s2 ? X1 : X0, yy, Z0 - 0.05], [s2 ? X1 : X0, yy, Z1 + 0.05], 0.05, lc); }
      for (const yy of [ph * 0.4, ph * 0.8]) { if (along) { K.log([X0, yy, Z0], [X0, yy, Z1], 0.045, lc); K.log([X1, yy, Z0], [X1, yy, Z1], 0.045, lc); } else { K.log([X0, yy, Z0], [X1, yy, Z0], 0.045, lc); K.log([X0, yy, Z1], [X1, yy, Z1], 0.045, lc); } }
      // (a brace across the first bay)
      if (along) K.log([X0, 0.1, Z1], [X0 + (X1 - X0) / (nP - 1), ph * 0.8, Z1], 0.04, lc); else K.log([X1, 0.1, Z0], [X1, ph * 0.8, Z0 + (Z1 - Z0) / (nP - 1)], 0.04, lc);
    });
    // (a deck of planks on the lower ledgers along one side, the ladder up to it)
    const sd = hv(9) < 0.5 ? 0 : 1; const dy = ph * 0.4 + 0.05;
    K.as('plankH', () => { if (along) K.box((X0 + X1) / 2, dy, sd ? Z1 - 0.2 : Z0 + 0.2, X1 - X0 - 0.1, 0.05, 0.42, lc); else K.box(sd ? X1 - 0.2 : X0 + 0.2, dy, (Z0 + Z1) / 2, 0.42, 0.05, Z1 - Z0 - 0.1, lc); });
    if (K.fine) K.as('beam', () => { const lx = along ? X0 + (X1 - X0) * (0.25 + hv(10) * 0.5) : (sd ? X1 : X0), lz = along ? (sd ? Z1 : Z0) : Z0 + (Z1 - Z0) * (0.25 + hv(10) * 0.5); const o = along ? [0, sd ? 1 : -1] : [sd ? 1 : -1, 0];
      const fx2 = G.clamp(lx + o[0] * 0.55, 0.06, K.w - 0.06), fz2 = G.clamp(lz + o[1] * 0.55, 0.06, K.d - 0.06); const foot = [fx2, Math.min(0, K.gy(fx2, fz2)), fz2], topP = [lx + o[0] * 0.02, dy + 0.9, lz + o[1] * 0.02];
      const side = along ? [0.22, 0, 0] : [0, 0, 0.22];
      for (const e of [-1, 1]) K.log([foot[0] + side[0] * e, foot[1], foot[2] + side[2] * e], [topP[0] + side[0] * e, topP[1], topP[2] + side[2] * e], 0.03, pc);
      for (let k = 1; k < 7; k++) { const f = k / 7; const a = [foot[0] + (topP[0] - foot[0]) * f, foot[1] + (topP[1] - foot[1]) * f, foot[2] + (topP[2] - foot[2]) * f]; K.log([a[0] - side[0], a[1], a[2] - side[2]], [a[0] + side[0], a[1], a[2] + side[2]], 0.022, pc); } });
    // (what it is being made of, in a corner of the lot: logs, planks, stones)
    const cx = hv(11) < 0.5 ? Math.min(K.w - 0.9, X1 - 0.6) : Math.max(0.9, X0 + 0.6), cz = hv(12) < 0.5 ? Math.min(K.d - 0.7, Z1 - 0.45) : Math.max(0.7, Z0 + 0.45);
    // (on the top of the plinth where the lot has one — the work stands on it; on the ground as it is drawn on a footed lot,
    // each piece on its own ground: laid flat at the height of the pile's middle, a slope put the high end of the planks under
    // the ground, inside the plinth where there was one — Build3D.check: lying faces cut by the ground)
    const on = (x2, z2) => (K.footed ? K.gy(x2, z2) : 0);
    K.as('bark', () => { for (let k = 0; k < 5; k++) { const row = k < 3 ? 0 : 1; const off = row ? (k - 3.5) * 0.24 : (k - 1) * 0.24; const xa = cx - 0.75, xb = cx + 0.75, zz = cz + off;
      K.log([xa, on(xa, zz) + 0.1 + row * 0.2, zz], [xb, on(xb, zz) + 0.1 + row * 0.2, zz], 0.11, k % 2 ? [128, 98, 66] : [112, 86, 58]); } });
    if (K.fine) { const pz = cz + (cz > z ? -1 : 1) * 0.6;
      K.as('plankH', () => { for (let k = 0; k < 4; k++) { if (K.footed) laid(K.g, [K.x0 + cx - 0.7, K.z0 + pz], [K.x0 + cx + 0.7, K.z0 + pz], 0.3, 0.045, K.c([168, 134, 92]), k * 0.05); else K.box(cx, k * 0.05, pz, 1.4, 0.045, 0.3, [168, 134, 92], 0); } });
      const R3r = G.Realm; const bs = K.P.base || ['#8a8478']; K.as('rock', () => { for (let k = 0; k < 4; k++) { const sx2 = cx + (cx > x ? -1 : 1) * (0.95 + (k % 2) * 0.32), sz2 = cz + (k < 2 ? -0.18 : 0.18); K.g.put(R3r.SH.ico0, R3r.mat(K.x0 + sx2, K.y0 + on(sx2, sz2) + 0.1, K.z0 + sz2, k, 0.4, 0.28, 0.34), K.c(bs[k % bs.length])); } }); }
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
  // (the side of a quay its water is on: the world's — Naval.dockInfo writes it when the quay works —, or, for one still building,
  // reckoned here by the same rule — the side with most water along it — and never written: the drawing reads the world. None
  // with water on any side: null — L-188)
  function quaySide(b) {
    if (b.wd) return b.wd; const S = G.S, T = G.T; let best = null, bw = 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { let n = 0;
      for (let k = 0; k < b.w; k++) { const x = dx > 0 ? b.x + b.w : dx < 0 ? b.x - 1 : b.x + k, y = dy > 0 ? b.y + b.h : dy < 0 ? b.y - 1 : b.y + k; if (G.W.inb(x, y)) { const i = G.W.idx(x, y); if (S.type[i] <= T.SEA && !(S.dry && S.dry[i])) n++; } }
      if (n > bw) { bw = n; best = [dx, dy]; } }
    return best;
  }
  // ------------------------------ the types ------------------------------
  const KIT = {
    hut(g, gw, K) {
      if (styleOf(K.b) === 'nordico') return longhouse(g, gw, K, 0.6);
      const r = K.w * 0.36;
      if (K.prog < 1) { scaffold(K, K.w / 2, K.d / 2, r * 2, r * 2, 2.4); return; }
      roundHut(g, gw, K, r);
    },
    house(g, gw, K) { if (styleOf(K.b) === 'nordico') return longhouse(g, gw, K, 1); const st = styleOf(K.b); house(g, gw, K, { chimney: st === 'classico' || st === 'romano' || K.b.v === 1 }); },
    sobrado(g, gw, K) { if (styleOf(K.b) === 'nordico') return longhouse(g, gw, K, 2); house(g, gw, K, { floors: 2, h: 2.7, roof: K.P.kind === 'flat' ? 'flat' : K.P.kind === 'hip' ? 'hip' : undefined, inset: 0.25, chimney: styleOf(K.b) === 'classico' }); },
    insula(g, gw, K) { if (styleOf(K.b) === 'nordico') return longhouse(g, gw, K, 3); house(g, gw, K, { floors: styleOf(K.b) === 'romano' ? 4 : 3, h: 2.8, roof: K.P.kind === 'flat' || styleOf(K.b) === 'romano' ? 'flat' : undefined, inset: 0.15 }); },
    quarteirao(g, gw, K) { house(g, gw, K, { floors: 4, h: 2.9, roof: K.P.kind === 'flat' ? 'flat' : 'hip', inset: 0.3 }); },
    barraco(g, gw, K) {
      const sx = K.w * 0.7, sz = K.d * 0.6;
      K.wallCol = ['#8a7a5a', '#7a6a4a', '#9a8a6a'][K.b.v || 0]; K.wallPat = 'plankV'; K.as('plankV', () => K.box(K.w / 2, 0, K.d / 2, sx, 2.1, sz, K.wallCol));
      g.put(SH.box, R3.mat(K.x0 + K.w / 2, K.y0 + 2.1, K.z0 + K.d / 2, 0, sx + 0.4, 0.12, sz + 0.5, 0.18), '#6a6a6a');
      openings(g, gw, K, K.w / 2, K.d / 2, sx, sz, 0, 2.1, 1);
    },
    storehouse(g, gw, K) { house(g, gw, K, { h: 3.8, inset: 0.4, yard: 1.3 }); }, // (its people's stock, heaped in the yard: Props3D.piles)
    armazem(g, gw, K) { KIT.storehouse(g, gw, K); },
    celeiro(g, gw, K) { house(g, gw, K, { h: 4, inset: 0.4, wall: '#9a4a32', pat: 'plankV', yard: 1.1 }); },
    workshop(g, gw, K) { smithy(g, gw, K, { h: 3.2, chimney: true, kind: 'wood' }); },
    forja(g, gw, K) { smithy(g, gw, K, { h: 3.3, wall: K.P.base ? K.P.base[2] : '#a09a8e', pat: 'stone', kind: 'forge' }); },
    olaria(g, gw, K) {
      house(g, gw, K, { h: 3, yard: 1.4 });
      // (the kiln: a dome of clay in the yard, on the ground, away from the door; its smoke)
      if (K.prog >= 1 && K.body) { const B = K.body; const d = B.door; const o = d ? d.o : [0, 1]; const ax = o[1] !== 0; const a = (d && d.a > 0 ? -1 : 1) * ((ax ? B.sx : B.sz) / 2 - 0.9);
        const px = ax ? B.x + a : B.x + o[0] * (B.sx / 2 + 0.75), pz = ax ? B.z + o[1] * (B.sz / 2 + 0.75) : B.z + a; const gy = K.footed ? Math.min(0, K.gy(px, pz)) - 0.05 : 0;
        K.as('mud', () => { K.sph(px, gy, pz, 0.62, '#b86a44', 0.66); K.box(px + o[0] * 0.5, gy, pz + o[1] * 0.5, ax ? 0.34 : 0.3, 0.32, ax ? 0.3 : 0.34, '#2a1a12'); });
        B3.chim.set(K.b.id, [K.x0 + px, K.y0 + gy + 0.7, K.z0 + pz]); B.kiln = { side: d ? d.side : 'S', at: ax ? px : pz }; } },
    tecelagem(g, gw, K) { house(g, gw, K, { h: 3.2 }); if (K.prog >= 1) for (const [cc, k] of [['#c8483a', 0], ['#3f6fb0', 1], ['#e8b83a', 2]]) K.box(K.w * (0.25 + k * 0.25), 2.2, K.d - 0.3, 0.9, 1.4, 0.05, cc); },
    ourives(g, gw, K) { house(g, gw, K, { h: 3.2, wall: K.P.wr }); },
    perolaria(g, gw, K) { house(g, gw, K, { h: 3 }); },
    sericultura(g, gw, K) { house(g, gw, K, { h: 3 }); },
    acougue(g, gw, K) { house(g, gw, K, { h: 3 }); if (K.prog >= 1) K.box(K.w * 0.75, 1.6, K.d - 0.3, 1.2, 0.08, 0.08, '#6a4a30'); },
    // the inn: its yard before the door (barrels, a table and its benches: Props3D), its sign hung from an iron arm by the door
    taverna(g, gw, K) { house(g, gw, K, { floors: 2, h: 2.9, chimney: true, plinth: true, yard: 1.2 }); if (K.prog >= 1) innSign(K); },
    temple(g, gw, K) {
      const st = styleOf(K.b); const P = K.P;
      if (K.prog < 1) { scaffold(K, K.w / 2, K.d / 2, K.w - 1, K.d - 1, 5); return; }
      if (st === 'asteca' || st === 'maia' || st === 'inca') { K.as('tezontle', () => { for (let k = 0; k < 4; k++) { const s = (K.w - 0.5) * (1 - k * 0.2); K.box(K.w / 2, k * 1.6, K.d / 2, s, 1.6, s, P.base ? P.base[k % 2] : '#b9ad93'); } }); K.as('stucco', () => K.box(K.w / 2, 6.4, K.d / 2, K.w * 0.3, 2, K.d * 0.3, P.wl)); K.as('stucco', () => K.box(K.w / 2, 0.8, K.d - 0.6, 1.2, 0.2, 2.6, P.trim || '#b33a2a')); return; }
      if (st === 'egipcio') { K.as('sandstone', () => K.box(K.w / 2, 0, K.d / 2, K.w - 0.6, 6, K.d - 0.6, P.wl)); K.box(K.w / 2, 6, K.d / 2, K.w - 0.4, 0.5, K.d - 0.4, P.trim || '#2f8f8a'); K.as('plankV', () => K.box(K.w / 2, 0, K.d - 0.25, 1.6, 3.4, 0.2, P.door || '#3e2e1c')); K.as('sandstone', () => { for (const s of [-1, 1]) K.box(K.w / 2 + s * 2.6, 0, K.d + 0.4, 0.6, 7.5, 0.6, P.wr); }); return; }
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
      // (the north raises rune stones, not needles: a tall one, two lesser ones turned toward it)
      if (K.st === 'nordico' && runeStone(K, K.w / 2, K.d / 2 - 0.4, 0, 1.3)) { runeStone(K, K.w / 2 - 2.1, K.d / 2 + 1.3, 0.5, 0.8); runeStone(K, K.w / 2 + 2.1, K.d / 2 + 1.3, -0.5, 0.85); return; }
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
      const t = house(g, gw, K, { floors: 2, h: 4, roof: P.kind === 'flat' ? 'flat' : 'hip', inset: 1.2, plinth: true }); void t;
      for (const [px, pz] of [[0.9, 0.9], [K.w - 0.9, 0.9], [0.9, K.d - 0.9], [K.w - 0.9, K.d - 0.9]]) { K.as('stone', () => K.box(px, 0, pz, 1.8, 11, 1.8, P.wr)); K.as(stuff(K.b).tile === 'mud' ? 'slab' : stuff(K.b).tile, () => g.put(SH.cone, R3.mat(K.x0 + px, K.y0 + 11, K.z0 + pz, Math.PI / 4, 2.6, 3, 2.6), K.c((P.roof && P.roof[1]) || '#94452d'))); }
      K.box(K.w / 2, 8.6, K.d / 2, 0.1, 4, 0.1, '#5a4a3a'); K.box(K.w / 2 + 0.6, 11.4, K.d / 2, 1.2, 0.7, 0.05, '#c8483a');
    },
    paco(g, gw, K) { KIT.palacio(g, gw, K); },
    administracao(g, gw, K) { const P = K.P; house(g, gw, K, { floors: 2, h: 3.4, roof: P.kind === 'flat' ? 'flat' : 'hip', inset: 0.6, plinth: true }); if (K.prog >= 1) colonnade(K, 0.6, K.d - 0.25, K.w - 0.6, K.d - 0.25, 4, 6.6, 0.25, (P.col && P.col[0]) || P.wl); },
    coletoria(g, gw, K) { house(g, gw, K, { h: 3.6, inset: 0.5 }); },
    biblioteca(g, gw, K) { KIT.administracao(g, gw, K); },
    teatro(g, gw, K) {
      const P = K.P; const cx = K.w / 2, cz = K.d * 0.35; const R = Math.min(K.w, K.d) * 0.48;
      for (let k = 0; k < 5; k++) for (let a = 0; a < 9; a++) { const ang = Math.PI * (a / 8); const r = R - k * 0.9; g.put(SH.box, R3.mat(K.x0 + cx + Math.cos(ang) * r, K.y0 + k * 0.7, K.z0 + cz + Math.sin(ang) * r, -ang + Math.PI / 2, 2.2, 0.7 + k * 0.7, 1), K.c(k % 2 ? P.wl : P.wr)); }
      K.box(cx, 0, K.d * 0.2, K.w * 0.6, 0.6, 1.4, P.base ? P.base[0] : '#8a8478');
    },
    banhos(g, gw, K) { house(g, gw, K, { h: 3.4, noRoof: true, inset: 0.5 }); if (K.prog >= 1) { K.sph(K.w * 0.35, 3.4, K.d * 0.5, K.w * 0.24, '#d8d0c0', K.w * 0.18); K.sph(K.w * 0.72, 3.4, K.d * 0.5, K.w * 0.16, '#d8d0c0', K.w * 0.12); } },
    cadeia(g, gw, K) { const P = K.P; house(g, gw, K, { h: 3.6, wall: P.base ? P.base[1] : '#6f6a60', pat: 'stone', roof: 'flat' }); },
    quartel(g, gw, K) { house(g, gw, K, { h: 3.4, plinth: true }); if (K.prog >= 1) { K.box(K.w - 0.4, 0, 0.4, 0.12, 7, 0.12, '#5a4a3a'); K.box(K.w - 0.4 + 0.6, 6.2, 0.4, 1.2, 0.7, 0.05, G.Fac.hex(G.Village.facOfSet(K.b.set))); } },
    torre(g, gw, K) {
      const P = K.P; const s = K.w - 0.8; const h = K.prog < 1 ? 10 * K.prog + 1 : 10;
      K.as('stone', () => K.box(K.w / 2, 0, K.d / 2, s, h, s, P.base ? P.base[2] : '#a09a8e'));
      if (K.prog < 1) { scaffold(K, K.w / 2, K.d / 2, s, s, 10); return; }
      K.as('stone', () => { K.box(K.w / 2, h, K.d / 2, s + 0.5, 0.4, s + 0.5, P.base ? P.base[1] : '#6f6a60');
        for (const [px, pz] of [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, -1], [0, 1], [-1, 0], [1, 0]]) K.box(K.w / 2 + px * (s / 2), h + 0.4, K.d / 2 + pz * (s / 2), 0.5, 0.7, 0.5, P.base ? P.base[2] : '#a09a8e'); });
      gw.put(SH.box, R3.mat(K.x0 + K.w / 2, K.y0 + h * 0.65, K.z0 + K.d / 2 + s / 2 + 0.04, 0, 0.3, 0.9, 0.08), '#2a3440'); if (K.lit) K.lit.push([K.x0 + K.w / 2, K.y0 + h * 0.65 + 0.45, K.z0 + K.d / 2 + s / 2 + 0.1, 0, 1]);
    },
    mercado(g, gw, K) { stalls(K, 4); },
    feira(g, gw, K) { stalls(K, 3); },
    mercado_negro(g, gw, K) { stalls(K, 2, ['#3a3440', '#4a2a2a']); },
    doca(g, gw, K) {
      // the quay: planks out over the water on the side of the sea, on posts
      const b = K.b; const wd = quaySide(b); const L = K.L; const sea = G.SEA * HM() + 0.5;
      if (wd) {
        const len = 2.6 * L; const x = K.w / 2 + wd[0] * (K.w / 2 + len / 2 - L * 0.3), z = K.d / 2 + wd[1] * (K.d / 2 + len / 2 - L * 0.3);
        const half = (wd[0] ? K.d : K.w) * 0.3, top = sea + 0.27, P = u => [x + wd[0] * (u - len / 2), z + wd[1] * (u - len / 2)];
        // (the deck only over ground below its top, as the steps of the street (L-178): from where the bank comes below it, in
        // lengths of planks each as wide as the ground under its edges lets it — a stride at least —, out to where the ground
        // comes above it again — a rock by the planks, the other bank —, and no further: the posts under it — L-188)
        const gAt = (u, s) => { const p = P(u); return K.gy(p[0] + wd[1] * s, p[1] + wd[0] * s) + K.y0; };
        const clear = (a, e, h) => [a, (a + e) / 2, e].every(u => gAt(u, -h) <= top && gAt(u, 0) <= top && gAt(u, h) <= top);
        const NL = 13, dl = len / NL, segs = [];
        for (let j = 0; j < NL; j++) { const a = j * dl, e = a + dl; let hw = half; while (hw > 0.6 && !clear(a, e, hw)) hw -= 0.1;
          if (!clear(a, e, hw)) { if (segs.length) break; continue; }
          const q = segs[segs.length - 1]; if (q && Math.abs(q.hw - hw) < 1e-6) { q.e = e; continue; }
          let a0 = a; if (!q) while (a0 - len / 40 >= 0 && clear(a0 - len / 40, a0, hw)) a0 -= len / 40; // (the first length from as near the bank as its edge lets it)
          segs.push({ a: a0, e, hw }); }
        K.as('plankH', () => { for (const q of segs) { const c = P((q.a + q.e) / 2), ln = q.e - q.a; g.put(SH.box, R3.mat(K.x0 + c[0], sea, K.z0 + c[1], 0, wd[0] ? ln : 2 * q.hw, 0.3, wd[1] ? ln : 2 * q.hw), K.c('#8a6a44')); } });
        if (segs.length) { const u0 = segs[0].a, u1 = segs[segs.length - 1].e;
          for (let k = 0; k < 4; k++) { const u = u0 + (u1 - u0) * (0.1 + k * 0.8 / 3); const q = segs.find(s => u >= s.a - 1e-6 && u <= s.e + 1e-6) || segs[0]; const c = P(u);
            g.put(SH.cyl, R3.mat(K.x0 + c[0] + (wd[0] ? 0 : q.hw - 0.15), sea - 3, K.z0 + c[1] + (wd[0] ? q.hw - 0.15 : 0), 0, 0.3, 3.2, 0.3), K.c('#6a4a2c')); } }
      }
      house(g, gw, K, { h: 2.4, inset: Math.min(K.w, K.d) * 0.22, wall: '#9a7a50', pat: 'plankH', door: true });
    },
    // the mine: a mound of rock over the shaft — only its cap, laid on the floor (a ball sunk 2.3 m in the ground drew the same
    // cap: Build3D.check found it buried), its stones out or in by the mine's id, darker at its foot; the timbered mouth before it
    mina(g, gw, K) {
      const cx = K.w / 2, cz = K.d / 2, R = K.w * 0.4, H = 1.3, nu = 12, nv = 4; const pts = [];
      for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) { const q = i % nu, a = q / nu * TAU, t = j / nv;
        const jr = j === 0 ? 0.96 + K.hv(300 + q) * 0.08 : j === nv ? 1 : 0.86 + K.hv(300 + q + j * 17) * 0.28, jy = j === 0 || j === nv ? 1 : 0.94 + K.hv(340 + q + j * 13) * 0.12;
        const r = Math.max(0.02, R * Math.pow(Math.cos(t * Math.PI / 2), 0.75) * jr); pts.push([cx + Math.cos(a) * r, j === 0 ? -0.05 : H * Math.sin(t * Math.PI / 2) * jy, cz + Math.sin(a) * r]); }
      K.as('rock', () => K.sheet(pts, nu, nv, (X, Y) => mixc([104, 98, 86], [140, 134, 122], G.clamp((Y - K.y0) / H, 0, 1)), [0, 1, 0]));
      K.as('beam', () => { for (const s of [-1, 1]) K.box(cx + s * 0.9, 0, K.d - 0.6, 0.4, 2.4, 0.4, '#6a4a2c'); K.box(cx, 1.9, K.d - 0.6, 1.4, 0.5, 0.4, '#5e4228'); });
      K.box(cx, 0, K.d - 0.7, 1.4, 1.9, 0.42, '#141414');
    },
    apiario(g, gw, K) { for (let k = 0; k < 4; k++) { const px = K.w * (0.25 + (k % 2) * 0.5), pz = K.d * (0.3 + Math.floor(k / 2) * 0.4); K.box(px, 0, pz, 0.15, 0.6, 0.15, '#6a4a2c'); K.box(px, 0.6, pz, 0.8, 0.7, 0.6, '#e8c870'); K.box(px, 1.3, pz, 0.95, 0.1, 0.75, '#8a6a44'); } },
    curral(g, gw, K) { fenceAround(K, 1.3, '#8a6a44', true); },
    estabulo(g, gw, K) { house(g, gw, K, { h: 3.4, inset: 0.6, wall: '#8a5a3a', pat: 'plankH' }); },
    cercado(g, gw, K) { fenceAround(K, 1.6, '#6a5a44', true); },
    farm(g, gw, K) { fields(K, '#d4ac44', '#6a9a3a'); },
    horta(g, gw, K) { fields(K, '#7aaa4a', '#4a8a2a', true); },
    plantacao(g, gw, K) { fields(K, '#c8b84a', '#5a8a2a'); },
    vinhedo(g, gw, K) { for (let r = 0; r < K.b.h * 2; r++) { const z = (r + 0.5) * K.d / (K.b.h * 2); K.box(K.w / 2, 0, z, K.w - 0.8, 1.5, 0.35, '#4a7a2a'); K.box(0.4, 0, z, 0.12, 1.8, 0.12, '#6a4a2c'); K.box(K.w - 0.4, 0, z, 0.12, 1.8, 0.12, '#6a4a2c'); } },
    pomar(g, gw, K) { for (let k = 0; k < K.b.w * K.b.h; k++) { const px = ((k % K.b.w) + 0.5) * K.L, pz = (Math.floor(k / K.b.w) + 0.5) * K.L; K.cyl(px, 0, pz, 0.18, 1.6, '#6a4a2c'); K.sph(px, 2.6, pz, 1.2, '#4f8f36', 1.0); K.sph(px + 0.6, 2.3, pz + 0.3, 0.2, '#d23a2a'); } },
    // the well: a ring of stones round the shaft, dark inside, its water deep down; two posts, the windlass across them with its
    // rope and bucket, a little roof of the people's kind (the same place and size as the god's: x, z, 0.8 m round)
    well(g, gw, K) {
      const P = K.P; const x = K.w / 2, z = K.d / 2; const bs = P.base || ['#8a8478', '#6f6a60', '#a09a8e']; const nord = K.st === 'nordico';
      K.cyl(x, 0, z, 0.6, 0.35, dim(bs[1], 0.45)); // (the shaft's dark)
      K.as('stone', () => { const n = 11; for (let k = 0; k < n; k++) { const a = (k + 0.5) / n * TAU; K.rbox(x + Math.cos(a) * 0.68, 0, z + Math.sin(a) * 0.68, 0.43, 0.8, 0.24, mixc(bs[k % 3], bs[(k + 1) % 3], K.hv(170 + k) * 0.6), -a - Math.PI / 2); } });
      K.as('slab', () => { for (let k = 0; k < 11; k++) { const a = (k + 0.5) / 11 * TAU; K.rbox(x + Math.cos(a) * 0.68, 0.8, z + Math.sin(a) * 0.68, 0.45, 0.07, 0.28, dim(bs[2], 0.95 + K.hv(190 + k) * 0.08), -a - Math.PI / 2); } });
      K.gq.disc(K.x0 + x, K.y0 + 0.36, K.z0 + z, 0.57, [34, 62, 70], 0.85, 12);
      const wc = nord ? nordWood(K).dark : [104, 78, 52];
      K.as('beam', () => { for (const s of [-1, 1]) K.box(x + s * 0.82, 0, z, 0.13, 2.25, 0.13, wc); });
      K.as('bark', () => K.log([x - 0.84, 1.45, z], [x + 0.84, 1.45, z], 0.075, [118, 94, 66]));
      K.as('beam', () => K.bar([x + 0.88, 1.45, z], [x + 1.02, 1.28, z], [0, 0, 0.04], [0, 0.04, 0], wc)); // (the crank)
      K.as('rope', () => K.log([x + 0.05, 1.42, z], [x + 0.05, 0.98, z], 0.012, [176, 156, 118]));
      K.as('plankV', () => K.cyl(x + 0.05, 0.72, z, 0.13, 0.26, [120, 88, 56])); K.as('iron', () => K.cyl(x + 0.05, 0.9, z, 0.138, 0.03, '#3c3a36'));
      const rp = nord ? 'shingle' : stuff(K.b).tile === 'mud' ? 'thatch' : stuff(K.b).tile; const rc = nord ? dim(wc, 1.1) : rp === 'thatch' ? ((P.thatch && P.thatch[0]) || '#c8a85a') : (P.roof && P.roof[0]) || '#b85a3c';
      K.as(rp, () => K.gable(x, 2.2, z, 2, 0.6, 1.4, rc));
      // (one rune stone to a town of the north, at its oldest well: in the well's lot — the body does not walk into it — behind the
      // well from the side people come to it, its carved face to them)
      if (nord && K.prog >= 1 && ![...G.S.buildings.values()].some(q => q.type === 'well' && q.set === K.b.set && q.id < K.b.id)) {
        const o = { S: [0, 1], N: [0, -1], E: [1, 0], W: [-1, 0] }[doorSide(K.b)]; runeStone(K, x - o[0] * 1.48, z - o[1] * 1.48, Math.atan2(o[0], o[1]), 0.7); }
    },
    // the campfire: a ring of broken stones half sunk in the ground — each its size, its tilt and its grey by the fire's id,
    // sooted on the side the fire is — round a bed of ash and embers, and the logs leaning in on one another, their bark on,
    // their upper ends burnt to charcoal (where they meet, 0.6 m over the ground, FX3D's flames rise)
    campfire(g, gw, K) {
      const cx = K.w / 2, cz = K.d / 2, gc = K.gy(cx, cz), X0 = K.x0 + cx, Z0 = K.z0 + cz; const n = 9 + Math.floor(K.hv(40) * 3);
      const stone = (X, Y, Z, nx, ny, nz) => { const dx = X0 - X, dz = Z0 - Z, l = Math.hypot(dx, dz) || 1; const s = G.clamp((nx * dx + nz * dz) / l, 0, 1) * 0.55 + G.clamp(1 - (Y - K.y0 - gc) * 3, 0, 1) * 0.15; return mixc([118, 114, 106], [40, 36, 32], s); };
      K.as('rock', () => { for (let k = 0; k < n; k++) { const h = q => K.hv(50 + k * 7 + q); const a = (k + (h(0) - 0.5) * 0.5) / n * TAU, r = 0.68 + (h(1) - 0.5) * 0.1;
        const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r, s = 0.62 + h(2) * 0.55; const sy = (0.2 + h(3) * 0.12) * s;
        const m = R3.mat(K.x0 + x, K.y0 + K.gy(x, z) + sy * 0.12, K.z0 + z, a + h(4) * 1.4, (0.3 + h(5) * 0.14) * s, sy, (0.26 + h(6) * 0.12) * s, (h(3) - 0.5) * 0.5, (h(5) - 0.5) * 0.5);
        g.put(h(0) < 0.5 ? SH.dode : SH.ico0, m, K.c(stone)); } });
      // (the bed of ash on the ground as it is drawn, a hand over it; the embers in it)
      { const nu = 12, RR = [0.52, 0.28, 0.06], UP = [0.02, 0.026, 0.045], pts = []; for (let j = 0; j <= 2; j++) for (let i = 0; i <= nu; i++) { const a = i / nu * TAU; const x = cx + Math.cos(a) * RR[j], z = cz + Math.sin(a) * RR[j]; pts.push([x, K.gy(x, z) + UP[j], z]); }
        K.as('soil', () => K.sheet(pts, nu, 2, (X, Y, Z) => mixc([92, 88, 82], [44, 40, 36], G.clamp(1 - Math.hypot(X - X0, Z - Z0) / 0.5, 0, 1)), [0, 1, 0])); }
      for (let k = 0; k < 5; k++) { const a = K.hv(90 + k) * TAU, r = K.hv(95 + k) * 0.26; const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
        g.put(SH.ico0, R3.mat(K.x0 + x, K.y0 + K.gy(x, z) + 0.03, K.z0 + z, a, 0.1, 0.06, 0.08), K.c(k % 2 ? [150, 62, 28] : [96, 40, 22])); }
      // (the logs: five or six leaning in, their feet on the ground, their bark below and the charcoal above)
      const nl = 5 + (K.hv(41) < 0.5 ? 1 : 0); const top = [X0 - K.x0, gc + 0.62, Z0 - K.z0];
      for (let k = 0; k < nl; k++) { const a = (k + K.hv(60 + k) * 0.4) / nl * TAU, rr = 0.07 + K.hv(70 + k) * 0.03; const fx = cx + Math.cos(a) * 0.48, fz = cz + Math.sin(a) * 0.48;
        const foot = [fx, K.gy(fx, fz) + rr * 0.6, fz], tip = [top[0] + Math.cos(a) * 0.06, top[1] - K.hv(80 + k) * 0.12, top[2] + Math.sin(a) * 0.06];
        const mid = [foot[0] + (tip[0] - foot[0]) * 0.62, foot[1] + (tip[1] - foot[1]) * 0.62, foot[2] + (tip[2] - foot[2]) * 0.62];
        K.as('bark', () => K.log(foot, mid, rr, mixc([112, 86, 58], [92, 78, 62], K.hv(85 + k))));
        K.as('bark', () => K.log(mid, tip, rr * 0.92, mixc([46, 38, 32], [26, 22, 20], K.hv(86 + k)), rr * 0.85)); }
    },
    cemetery(g, gw, K) {
      fenceAround(K, 1, '#5a4a3a', true);
      if (K.st === 'nordico') runeStone(K, K.w / 2, 0.75, 0, 0.75); // (the north's memorial: a rune stone at the head of its graves)
      const n = Math.min(12, (K.b.graves || []).length);
      for (let k = 0; k < n; k++) { const px = 1 + (k % 4) * (K.w - 2) / 3.2, pz = 1.2 + Math.floor(k / 4) * (K.d - 2.4) / 2.5; K.box(px, 0, pz, 0.6, 0.8, 0.18, '#9a968e'); K.box(px, 0, pz + 0.7, 0.6, 0.06, 1.2, '#6a5a44'); }
    },
    // the square: paved, a kerb of bigger stones round it, the fountain in the middle (a basin, a column, a bowl spilling
    // into it), two benches facing it
    praca(g, gw, K) {
      const P = K.P; const st = P.base ? P.base[2] : '#a09a8e', dk = P.base ? P.base[0] : '#8a8478'; const cx = K.w / 2, cz = K.d / 2;
      K.as('slab', () => K.box(cx, -0.05, cz, K.w - 0.2, 0.15, K.d - 0.2, st));
      K.as('stone', () => { for (const [x, z, w, d] of [[cx, 0.25, K.w - 0.2, 0.32], [cx, K.d - 0.25, K.w - 0.2, 0.32], [0.25, cz, 0.32, K.d - 0.84], [K.w - 0.25, cz, 0.32, K.d - 0.84]]) K.box(x, -0.05, z, w, 0.25, d, dk);
        // (the basin: its floor, a rim of dressed blocks round it — each its own tone — the column, the bowl on it with its lip)
        // (inside the 1.4 m the body walks round: avatar.js)
        K.cyl(cx, 0.1, cz, 1.2, 0.3, dim(dk, 0.8)); const n = 14;
        for (let k = 0; k < n; k++) { const a = (k + 0.5) / n * TAU; K.rbox(cx + Math.cos(a) * 1.27, 0.1, cz + Math.sin(a) * 1.27, 0.59, 0.62, 0.26, dim(dk, 0.92 + K.hv(160 + k) * 0.14), -a - Math.PI / 2); }
        K.cyl(cx, 0.4, cz, 0.17, 1.18, st); K.cyl(cx, 1.5, cz, 0.24, 0.08, st); K.cyl(cx, 1.56, cz, 0.5, 0.12, st); });
      K.as('slab', () => { for (let k = 0; k < 14; k++) { const a = (k + 0.5) / 14 * TAU; K.rbox(cx + Math.cos(a) * 1.27, 0.72, cz + Math.sin(a) * 1.27, 0.61, 0.07, 0.27, dim(st, 0.96 + K.hv(180 + k) * 0.08), -a - Math.PI / 2); } });
      { const lip = []; for (let j = 0; j <= 1; j++) for (let i = 0; i <= 12; i++) { const a = i / 12 * TAU; lip.push([cx + Math.cos(a) * 0.5, j ? 1.75 : 1.67, cz + Math.sin(a) * 0.5]); } K.as('stone', () => K.sheet(lip, 12, 1, st, [-1, 0, 0])); }
      // (still water, not a blue lid: the sky in it, the light of the hour — the water of the chunk, A5's material)
      K.gq.disc(K.x0 + cx, K.y0 + 0.6, K.z0 + cz, 1.15, [70, 150, 165], 0.55); K.gq.disc(K.x0 + cx, K.y0 + 1.72, K.z0 + cz, 0.47, [70, 150, 165], 0.55, 12);
      const bz = Math.min(2.7, K.d / 2 - 1.1);
      K.as('plankH', () => { for (const s of [-1, 1]) K.box(cx, 0.4, cz + s * bz, 1.8, 0.08, 0.44, '#8a6a44'); });
      for (const s of [-1, 1]) for (const e of [-0.72, 0.72]) K.box(cx + e, 0.1, cz + s * bz, 0.14, 0.3, 0.38, dk);
    },
    // the cistern an aqueduct fills: a block of stone, a parapet round its top, the still water in it (the chunk's water)
    aqueduto(g, gw, K) { const P = K.P; const c = P.base ? P.base[2] : '#a09a8e'; const sx = K.w - 0.6, sz = K.d - 0.6, cx = K.w / 2, cz = K.d / 2;
      K.as('stone', () => { K.box(cx, 0, cz, sx, 4.5, sz, c); for (const [px, pz, a, b2] of [[cx, cz - sz / 2 + 0.15, sx, 0.3], [cx, cz + sz / 2 - 0.15, sx, 0.3], [cx - sx / 2 + 0.15, cz, 0.3, sz - 0.6], [cx + sx / 2 - 0.15, cz, 0.3, sz - 0.6]]) K.box(px, 4.5, pz, a, 0.55, b2, dim(c, 0.92)); });
      const x0 = K.x0 + cx - sx / 2 + 0.29, x1 = K.x0 + cx + sx / 2 - 0.29, z0 = K.z0 + cz - sz / 2 + 0.29, z1 = K.z0 + cz + sz / 2 - 0.29, wy = K.y0 + 4.85, cw = [66, 140, 160];
      K.gq.quad([[x0, wy, z0], [x0, wy, z1], [x1, wy, z1], [x1, wy, z0]], [cw, cw, cw, cw], [0.6, 0.6, 0.6, 0.6], [2, 2, 2, 2]); },
    ruin(g, gw, K) { const P = K.P; for (let k = 0; k < 5; k++) { const h = 0.6 + G.hash(K.b.id * 7 + k) * 2.4; const px = 0.6 + G.hash(K.b.id + k * 3) * (K.w - 1.2), pz = 0.6 + G.hash(K.b.id * 3 + k) * (K.d - 1.2); K.box(px, 0, pz, 1.2, h, 0.5, dim(P.wl || '#efe2c4', 0.7), G.hash(k) * 3); } },
  };
  // the round hut, as the god's view draws it: a round wall of plaster or mud on a ring of stones (a painted band on the
  // Aztec's), a deep cone of straw over it — thick at its eaves, in courses, knotted at the top — the door in its frame on
  // the side people come out of, a small window
  function roundHut(g, gw, K, r) {
    const P = K.P; const cx = K.w / 2, cz = K.d / 2; const H = 2.3, N2 = 18; const wallPat = stuff(K.b).wall === 'frame' ? 'plaster' : stuff(K.b).wall;
    // (the ring of stones under it, and its core down to the ground)
    K.footed = true; const base = P.base || ['#8a8478', '#6f6a60', '#a09a8e'];
    K.as('stone', () => K.cyl(cx, K.lo - K.y0 - 0.2, cz, r + 0.04, K.y0 - K.lo + 0.2, dim(base[1], 0.78)));
    if (K.fine) K.as('rock', () => { const n = Math.round(TAU * r / 0.42); for (let k = 0; k < n; k++) { const a = k / n * TAU; const h1 = K.hv(300 + k), h2 = K.hv(500 + k); const px = cx + Math.cos(a) * (r + 0.1), pz = cz + Math.sin(a) * (r + 0.1);
      const gy = K.gy(px, pz); const ht = Math.max(0.3, -gy + 0.05); K.rbox(px, -ht + 0.01, pz, 0.4, ht - 0.02, 0.24 + h2 * 0.06, mixc(base[Math.floor(h1 * 3)], base[Math.floor(h2 * 2.99)], 0.5).map(v => v * (0.88 + h1 * 0.2)), -a + Math.PI / 2, 0, (h2 - 0.5) * 0.06); } });
    // (the wall: a smooth ring, darker where the rain splashes at its foot; the Aztec's painted band under the eaves)
    // (a ring's middle point faces -X: what 'out' is told for the rings)
    const wc = rgbOf(P.wl || '#efe2c4'); const ring = (rr, y0, y1, f0, f1) => { const pts = []; for (let j = 0; j <= 1; j++) for (let i = 0; i <= N2; i++) { const a = i / N2 * TAU; pts.push([cx + Math.cos(a) * rr, j ? y1 : y0, cz + Math.sin(a) * rr]); } return pts; };
    K.as(wallPat, () => K.sheet(ring(r, 0, H), N2, 1, (X, Y) => { const f = 0.78 + 0.22 * G.clamp((Y - K.y0) / 0.7, 0, 1); return qc([wc[0] * f, wc[1] * f, wc[2] * f]); }, [-1, 0, 0]));
    if (K.st === 'asteca') K.as('stucco', () => { K.sheet(ring(r + 0.015, H - 0.5, H - 0.3), N2, 1, P.trim || '#b33a2a', [-1, 0, 0]); K.sheet(ring(r + 0.015, 0.06, 0.42), N2, 1, P.trim2 || '#2fae8f', [-1, 0, 0]); });
    // (the straw: a cone in three courses swelling a little, its eaves thick, the underside, the knot at the top)
    const th = rgbOf((P.thatch && P.thatch[0]) || '#c8a85a'), th2 = rgbOf((P.thatch && P.thatch[1]) || '#a3843f'); const R0 = r * 1.36, Y0 = H - 0.25, HT = 2.6;
    const cone = []; const rows = 4; for (let j = 0; j <= rows; j++) for (let i = 0; i <= N2; i++) { const a = i / N2 * TAU, f = j / rows; const rr = R0 * (1 - f) + (f > 0 && f < 1 ? 0.05 : 0) + 0.02; cone.push([cx + Math.cos(a) * rr, Y0 + HT * f, cz + Math.sin(a) * rr]); }
    const seed = K.b.id & 1023; const thCol = (X, Y, Z) => { const q = vnoise(X * 1.3, Z * 1.3 + Y, seed); const c2 = mixc(th, th2, q * 0.6 + K.hv(3) * 0.25); const f = 0.9 + vnoise(X * 3, Y * 3 + Z, seed + 2) * 0.18; return qc([c2[0] * f, c2[1] * f, c2[2] * f]); };
    K.as('thatch', () => { K.sheet(cone, N2, rows, thCol, [0, 1, 0]); K.sheet(ring(R0 + 0.02, Y0 - 0.32, Y0 + 0.01), N2, 1, (X, Y, Z) => mixc(thCol(X, Y, Z), [70, 56, 36], 0.25), [-1, 0, 0]); });
    { const und = []; for (let j = 0; j <= 1; j++) for (let i = 0; i <= N2; i++) { const a = i / N2 * TAU, rr = j ? r : R0; und.push([cx + Math.cos(a) * rr, j ? H - 0.05 : Y0 - 0.32, cz + Math.sin(a) * rr]); }
      K.as('thatch', () => K.sheet(und, N2, 1, dim(th2, 0.6), [0, -1, 0])); }
    K.as('thatch', () => { K.cyl(cx, Y0 + HT - 0.42, cz, 0.16, 0.32, dim(th2, 0.85)); K.cone(cx, Y0 + HT - 0.12, cz, 0.15, 0.32, dim(th2, 0.75)); });
    // (the door in its frame on its side, a step before it, a window on another side)
    const side = doorSide(K.b); const od = { S: [0, 1], N: [0, -1], E: [1, 0], W: [-1, 0] }[side]; const ax = od[1] !== 0; const dw = 0.85, dh = 1.75;
    const D = (a, y, n) => [cx + (ax ? a : od[0] * (r + n)), y, cz + (ax ? od[1] * (r + n) : a)];
    const bx = (a, y, n, wa, hy, wn, col) => { const q = D(a, y, n); K.box(q[0], q[1], q[2], ax ? wa : wn, hy, ax ? wn : wa, col); };
    // (its leaf as the people make theirs — openings(): planks with straps in the classical lands, painted by the Greek and the Aztec)
    { const lp = D(0, 0, -0.02); const pat = K.st === 'classico' ? doorPat(K.x0 + lp[0], K.y0, K.z0 + lp[2], od, dw, K.hv(19) < 0.5 ? 0 : 1) : K.st === 'grego' || K.st === 'asteca' ? 'painted' : 'plankV';
      K.as(pat, () => bx(0, 0, -0.02, dw, dh, 0.1, P.door || '#3a2a1c')); }
    K.as('beam', () => { for (const e of [-1, 1]) bx(e * (dw / 2 + 0.06), 0, 0.02, 0.12, dh + 0.04, 0.14, P.trim || '#6b4a30'); bx(0, dh, 0.02, dw + 0.34, 0.16, 0.16, P.trim || '#6b4a30'); });
    const sp = D(0, 0, 0.35); const gy = Math.min(-0.36, K.gy(sp[0], sp[2]) - 0.04); K.as('stone', () => bx(0, gy, 0.33, dw + 0.3, 0.04 - gy, 0.42, base[2]));
    const wo = [-od[1], od[0]]; const wq = [cx + wo[0] * (r - 0.02), 1.2, cz + wo[1] * (r - 0.02)];
    gw.put(SH.box, R3.mat(K.x0 + wq[0], K.y0 + wq[1], K.z0 + wq[2], wo[1] !== 0 ? 0 : Math.PI / 2, 0.42, 0.4, 0.12), '#2a3440'); if (K.lit) K.lit.push([K.x0 + wq[0] + wo[0] * 0.08, K.y0 + wq[1] + 0.2, K.z0 + wq[2] + wo[1] * 0.08, wo[0], wo[1]]);
    K.as('beam', () => { K.box(wq[0] + wo[0] * 0.04, wq[1] - 0.07, wq[2] + wo[1] * 0.04, wo[1] !== 0 ? 0.6 : 0.12, 0.07, wo[1] !== 0 ? 0.12 : 0.6, P.trim || '#6b4a30'); K.box(wq[0] + wo[0] * 0.04, wq[1] + 0.4, wq[2] + wo[1] * 0.04, wo[1] !== 0 ? 0.6 : 0.12, 0.07, wo[1] !== 0 ? 0.12 : 0.6, P.trim || '#6b4a30'); });
    K.body = { x: cx, z: cz, sx: r * 2, sz: r * 2, door: { side, o: od, a: 0, w: dw + 0.5 } };
  }
  // stalls of a market: tables under coloured awnings, goods on them
  function stalls(K, n, cols) {
    const cl = cols || ['#c8483a', '#3f6fb0', '#e8b83a', '#4a9a5a'];
    // (the stall made in Blender, G.Mesh3D 'banca' — a counter of planks on its legs, the striped awning of canvas falling to the
    // front, baskets of what is sold, sacks — where the machine carries detail; facing the buyers: out to the street from a
    // market one cannot walk into, in toward the middle of a fair one walks through)
    const BM = K.fine && K.w > 7.9 && K.d > 7.9 && !!(G.Mesh3D && G.Mesh3D.has('banca') && G.Mesh3D.part('banca', 'madeira')); const inward = !(G.BDEF[K.b.type] || {}).blocks; // (2.7 m wide with its sacks: a lot of two tiles)
    const FRUIT = [[176, 76, 54], [198, 152, 66], [120, 140, 70], [122, 86, 118]]; K.banca = BM; // (Props3D: its own baskets then not needed)
    for (let k = 0; k < n; k++) {
      const px = K.w * ((k % 2) * 0.5 + 0.25), pz = K.d * (Math.floor(k / 2) * 0.5 + 0.25);
      if (BM) { const M3 = G.Mesh3D; const dx = px - K.w / 2, dz = pz - K.d / 2; const s = inward ? -1 : 1; // (the way it faces: the axis nearer its own from the middle)
        const ry = Math.abs(dx) > Math.abs(dz) ? Math.atan2(s * Math.sign(dx), 0) : Math.atan2(0, s * Math.sign(dz || 1));
        const m = R3.mat(K.x0 + px, K.y0, K.z0 + pz, ry, 1, 1, 1);
        for (const [part, pat, col] of [['madeira', 'plankH', '#8a6a44'], ['lona', 'canvas', cl[k % cl.length]], ['lona2', 'canvas', [232, 222, 196]], ['vime', 'wicker', [168, 132, 76]], ['fruta', null, FRUIT[(k + K.b.id) % 4]], ['saco', 'linen', [196, 178, 136]]]) {
          const pg = M3.part('banca', part); if (pg) K.as(pat, () => K.g.put(pg, m, K.c(col))); }
        continue; }
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
        // (a hill of rice: narrow leaves fanning out, each its own height, lean and shade; when it is ripe, two stems whose heavy
        // heads hang over — 8 triangles a hill against the 9 of the three stalks with their two crossed heads it had)
        if (GR.flood) {
          const hr = q => G.hash(i * 131 + r * 29 + q * 7 + 3);
          const nl = ripeNow || g >= 0.75 ? 4 : 3; // (three leaves while it grows: never more triangles than the stalks it had)
          for (let s = 0; s < nl; s++) { const a = hh * 9 + s * TAU / nl + (hr(s) - 0.5) * 0.7, lh = h * (0.62 + hr(s + 4) * 0.4), le = lh * (0.16 + hr(s + 8) * 0.16);
            const tip = G.lerpColor(stalk, ripeNow ? [150, 152, 74] : [96, 150, 62], hr(s + 12) * 0.45); gp.blade(px, Y, pz, 0.022 + hr(s + 16) * 0.012, a + 1.57, px + Math.cos(a) * le, Y + lh, pz + Math.sin(a) * le, foot, tip); }
          if (ripeNow || g >= 0.75) for (let s = 0; s < 2; s++) { const a = hh * 5 + s * 3.1 + hr(s + 20); const sh = h * (0.86 + hr(s + 22) * 0.16), dr = 0.1 + hr(s + 24) * 0.08;
            const top = [px + Math.cos(a) * 0.05, Y + sh, pz + Math.sin(a) * 0.05], hc = ripeNow ? G.lerpColor(head, [172, 140, 62], hr(s + 26) * 0.5) : G.lerpColor(stalk, head, 0.5);
            gp.blade(px, Y, pz, 0.016, a + 1.57, top[0], top[1], top[2], foot, stalk, 0.6); // (the stem)
            gp.blade(top[0], top[1], top[2], 0.045, a + 1.57, top[0] + Math.cos(a) * dr * 1.4, top[1] - dr - 0.04, top[2] + Math.sin(a) * dr * 1.4, hc, dim(hc, 0.9), 0.9); } // (the head, hanging)
          continue;
        }
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
  function wallsInto(g, x0, y0, n, gq) { // (gq: the water of the chunk, for the aqueducts' channels)
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
        // (the water running in the channel between its two kerbs: the water of the chunk, flowing — a quad over the channel's floor)
        g.pat = 0; if (gq) { const wy = gy + top + 1.1 + 0.16, e = 0.43, h0 = L / 2; const A = at(-h0, wy), B = at(h0, wy); const cw = [62, 136, 156], al = 0.6;
          gq.quad(ax ? [[A[0], wy, A[2] - e], [A[0], wy, A[2] + e], [B[0], wy, B[2] + e], [B[0], wy, B[2] - e]] : [[A[0] - e, wy, A[2]], [A[0] - e, wy, B[2]], [A[0] + e, wy, B[2]], [A[0] + e, wy, A[2]]], [cw, cw, cw, cw], [al, al, al, al], [0, 0, 0, 0]);
          g.pat = PAT.slab; const f = at(0, gy + top + 1.1); g.put(SH.box, R3.mat(f[0], f[1], f[2], ry, L, 0.02, 0.86), dim(deck, 0.7)); g.pat = 0; }
        else { const w = at(0, gy + top + 1.1); g.put(SH.box, R3.mat(w[0], w[1], w[2], ry, L, 0.12, 0.8), '#3a8ab0'); }
        g.pat = PAT.stone; for (const sd of [-1, 1]) { const q = at(0, gy + top + 1.1); g.put(SH.box, R3.mat(q[0] + (ax ? 0 : sd * 0.55), q[1], q[2] + (ax ? sd * 0.55 : 0), ry, L, 0.3, 0.25), deck); }
        g.pat = 0;
      } }
  }

  // ------------------------------ a chunk's buildings ------------------------------
  const inChunk = (b, x0, y0, n) => b.x >= x0 && b.y >= y0 && b.x < x0 + n && b.y < y0 + n;
  // ------------------------------ the walks of planks over the mud ------------------------------
  // the streets of the north are walks of planks laid across the way over the mud, as Hedeby's were: on the trodden and the
  // paved ways of a town of the north (the people of the nearest house, within ten tiles), a deck two metres wide down the
  // middle of the tile and out to each road beside it, its planks across the way, each its own width and grey of old oak, a
  // little longer or shorter at its ends, three centimetres over the ground as its mesh is drawn — no flicker, no plank lost
  // under it. Only where the machine carries detail; the bridges are the realm's. Only seen: deckAt gives their top
  const decks = new Map(), deckOf = new Map(); G.worldHooks.push(() => { decks.clear(); deckOf.clear(); });
  // (the near ground as its mesh draws it — realm3d's terrainGeo: a point every half tile, each cell cut from its +x corner
  // to its +y corner — so what lies on it lies on what is seen; Space's, so that the steps before a door and the feet on them
  // read the same)
  const drawnAt = (x, y) => G.Space.drawnAt(x, y);
  const DW = 1.0, DT = 0.06, DUP = 0.03; // (the deck's half width, a plank's thickness, how far its top stands over the ground)
  // (a plank from A to B — the middles of its two ends, on its top — wv across it, t thick under its top)
  function plank(g, A, B, wv, t, col) {
    const v = [0, t, 0], w = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], u = wv;
    const s = (u[1] * v[2] - u[2] * v[1]) * w[0] + (u[2] * v[0] - u[0] * v[2]) * w[1] + (u[0] * v[1] - u[1] * v[0]) * w[2] < 0 ? -1 : 1;
    PM.set(u[0], v[0], w[0] * s, (A[0] + B[0]) / 2, u[1], v[1], w[1] * s, (A[1] + B[1]) / 2 - t, u[2], v[2], w[2] * s, (A[2] + B[2]) / 2, 0, 0, 0, 1); g.put(PLANK || SH.box, PM, col);
  }
  // (a plank laid on the ground as it is drawn: A, B the middles of its ends (world metres, x and z), wd its width, t its
  // thickness — its top DUP over the highest ground under each end, lifted where the ground bulges between them)
  function laid(g, A, B, wd, t, col, up) { // (up: how much higher than that its top stands — a plank on others)
    const L = TL(), dx = B[0] - A[0], dz = B[1] - A[1], l = Math.hypot(dx, dz) || 1; const wv = [-dz / l * wd, 0, dx / l * wd];
    const top = (X, Z) => Math.max(drawnAt(X / L, Z / L), drawnAt((X - wv[0] / 2) / L, (Z - wv[2] / 2) / L), drawnAt((X + wv[0] / 2) / L, (Z + wv[2] / 2) / L)) + DUP + (up || 0);
    let yA = top(A[0], A[1]), yB = top(B[0], B[1]); const lift = Math.max(0, top((A[0] + B[0]) / 2, (A[1] + B[1]) / 2) - (yA + yB) / 2); yA += lift; yB += lift;
    plank(g, [A[0], yA, A[1]], [B[0], yB, B[1]], wv, t, col);
  }
  function walksInto(g, x0, y0, n, reg) {
    const S = G.S, T = G.T, L = TL(); const mine = []; if (reg !== false) deckOf.set(x0 + ',' + y0, mine); // (reg false: the proof's own drawing, nothing kept)
    const near = []; for (const b of S.buildings.values()) { const cx = b.x + b.w / 2, cy = b.y + b.h / 2; if (cx > x0 - 10 && cx < x0 + n + 10 && cy > y0 - 10 && cy < y0 + n + 10) near.push([cx, cy, styleOf(b) === 'nordico']); }
    if (!near.some(q => q[2])) return;
    const road = (x, y) => W.inb(x, y) && S.road[y * N + x] > 0;
    for (let y = y0; y < y0 + n; y++) for (let x = x0; x < x0 + n; x++) {
      if (!W.inb(x, y)) continue; const i = y * N + x; const r = S.road[i]; if (!r || r > 2 || S.type[i] <= T.RIVER || S.occ[i] || S.wall[i]) continue;
      let best = null, bd = 100; for (const q of near) { const d = (q[0] - x - 0.5) ** 2 + (q[1] - y - 0.5) ** 2; if (d < bd) { bd = d; best = q; } } if (!best || !best[2]) continue;
      const E = road(x + 1, y), Wt = road(x - 1, y), So = road(x, y + 1), No = road(x, y - 1);
      if (reg !== false) { decks.set(i, (E ? 1 : 0) | (Wt ? 2 : 0) | (So ? 4 : 0) | (No ? 8 : 0)); mine.push(i); }
      const cx = (x + 0.5) * L, cz = (y + 0.5) * L; const alongX = (E || Wt) && !(So || No) ? true : (So || No) && !(E || Wt) ? false : G.hash(i * 7 + 1) < 0.5;
      // (a run of planks across the way, from a0 to a1 along it from the tile's middle; ax: the way runs along X)
      const run = (ax, a0, a1, k0) => { const m = Math.max(1, Math.round((a1 - a0) / 0.34)), p = (a1 - a0) / m; g.pat = ax ? PAT.beamZ : PAT.beamX;
        for (let k = 0; k < m; k++) { const h = G.hash(i * 131 + k0 + k), h2 = G.hash(i * 37 + k0 + k * 3); const a = a0 + (k + 0.5) * p + (h - 0.5) * 0.03;
          const e0 = -DW - h2 * 0.08, e1 = DW + G.hash(i * 53 + k0 + k) * 0.08; // (each a little longer or shorter at its ends)
          const A = ax ? [cx + a, cz + e0] : [cx + e0, cz + a], B = ax ? [cx + a, cz + e1] : [cx + e1, cz + a];
          laid(g, A, B, p - 0.035, DT, mixc([128, 106, 80], [112, 106, 98], h2 * 0.8).map(c => c * (0.88 + h * 0.2))); } };
      run(alongX, -DW, DW, 0);
      if (E) run(true, DW, L / 2, 20); if (Wt) run(true, -L / 2, -DW, 40); if (So) run(false, DW, L / 2, 60); if (No) run(false, -L / 2, -DW, 80);
    }
    g.pat = 0;
  }
  // (the top of a walk's planks under a point of the world, in metres, or null — for the feet, Space.surface, to stand on)
  B3.deckAt = function (X, Z) {
    const L = TL(), x = X / L, z = Z / L, tx = Math.floor(x), ty = Math.floor(z); if (!W.inb(tx, ty)) return null; const m = decks.get(ty * N + tx); if (m === undefined) return null;
    const lx = X - (tx + 0.5) * L, lz = Z - (ty + 0.5) * L; const inC = Math.abs(lx) <= DW && Math.abs(lz) <= DW;
    const inArm = (Math.abs(lz) <= DW && ((lx > DW && (m & 1)) || (lx < -DW && (m & 2)))) || (Math.abs(lx) <= DW && ((lz > DW && (m & 4)) || (lz < -DW && (m & 8))));
    return inC || inArm ? drawnAt(x, z) + DUP : null;
  };
  // (how far round the body the near houses keep their finest form — the iron, the pieces made in Blender, what lies about
  // them: 35 m × the preset's lod (Realm.Q().lod; all the near ones where the preset has none), a chunk at a time by its nearest edge. Once
  // fine it stays so until the body is 8 m further: walking along a chunk's edge does not draw it again and again. Only seen)
  const fineOf = new Map(); G.worldHooks.push(() => fineOf.clear());
  function fineAt(x0, y0, n) {
    const q = R3 && R3.Q ? R3.Q() : null; if (!q || !q.detail) return false;
    const f = G.Possess && G.Possess.body && G.Possess.body(); if (!f || q.lod === undefined) return true; // (no body, or a preset without lod: every near picture fine, as before)
    const L = TL(), X = f.x * L, Z = f.y * L, D = 35 * q.lod; const key = x0 + ',' + y0;
    const d = Math.hypot(Math.max(x0 * L - X, 0, X - (x0 + n) * L), Math.max(y0 * L - Z, 0, Z - (y0 + n) * L));
    const now = fineOf.get(key) ? d < D + 8 : d < D; fineOf.set(key, now); return now;
  }
  B3.sig = function (x0, y0, n) {
    let s = 0; const fine = fineAt(x0, y0, n);
    // (and the trees about the steps its doors run on into the street: the steps go round a tree come, and back where it went —
    // Space.doorFlight, L-197)
    for (const b of G.S.buildings.values()) { if (!inChunk(b, x0, y0, n)) continue; s = (s * 31 + b.id * 7 + (b.built ? 1 : 0) + Math.floor((b.progress || 0) * 5) * 3 + Math.floor((b.hp / (b.maxHp || 1)) * 4) * 11 + (b.crops ? b.crops.reduce((a, c) => a + c.s + Math.floor((c.g || 0) * 3), 0) : 0) * 13 + (b.graves ? b.graves.length : 0) * 17 + B3.shellSig(b) * 19 + G.Space.treeSig(b) * 37) | 0;
      // (a store's heaps are its people's stock: drawn again, where they are drawn — fine, in its yard —, when a count of them
      // changes; a store drawn from its plan has no yard: it shows its stock inside, in its keeping pieces — Build3D.fillOf)
      if (fine && b.built && G.Props3D && G.Props3D.shows && G.Props3D.shows(b) && !B3.shellOf(b)) { const p = G.Props3D.piles(b); s = (s * 7 + p[0] * 19 + p[1] * 23 + p[2] * 29) | 0; } }
    // (the arches standing in this chunk: one built across the map does not change it)
    for (const a of G.S.aqueducts || []) for (let k = 0; k < a.built; k++) { const t = a.tiles[k]; if (t[0] >= x0 && t[1] >= y0 && t[0] < x0 + n && t[1] < y0 + n) s = (s + (k + 1) * 23 + (a.dead ? 5 : 0)) | 0; }
    // (a chunk with buildings or ways the body comes near is drawn again, finer — its walks of planks too; one without has
    // nothing to make finer)
    let rd = s !== 0; if (!rd) { const S = G.S; for (let y = y0; y < y0 + n && !rd; y++) for (let x = x0; x < x0 + n; x++) if (W.inb(x, y) && S.road[y * N + x]) { rd = true; break; } }
    return rd ? (s * 3 + (fine ? 1 : 0)) | 0 : 0;
  };
  B3.nearGeo = function (x0, y0, n) {
    const g = R3.Geo(), gw = R3.Geo(), gp = R3.Geo(), gq = R3.WGeo();
    const ck = x0 + ',' + y0; for (const id of litOf.get(ck) || []) B3.lamps.delete(id); const lit = []; litOf.set(ck, lit); const fine = fineAt(x0, y0, n);
    for (const b of G.S.buildings.values()) {
      if (!inChunk(b, x0, y0, n)) continue;
      const K = kit(g, b, gp, gq, fine); const n0 = g.p.length; K.lit = [];
      draw(g, gw, K, true);
      if (K.lit.length) { const L = K.lit, m = Math.min(8, L.length); B3.lamps.set(b.id, Array.from({ length: m }, (_, i) => L[Math.floor(i * L.length / m)])); lit.push(b.id); } // (eight at most, spread round it)
      // (how high it really stands, for the eye that must not go into its roof)
      let top = -1e9; for (let k = n0 + 1; k < g.p.length; k += 3) if (g.p[k] > top) top = g.p[k]; if (top > -1e9) B3.tops.set(b.id, top);
    }
    for (const i of deckOf.get(ck) || []) decks.delete(i); deckOf.delete(ck); if (fine) walksInto(g, x0, y0, n);
    g.ao = (X, Z) => W.hAt(X / TL(), Z / TL()) * HM();
    wallsInto(g, x0, y0, n, gq);
    return { solid: g.empty ? null : g.build(true), glass: gw.empty ? null : gw.build(), plants: gp.empty ? null : gp.build(), water: gq.empty ? null : gq.build() };
  };
  // the far picture: a block and a roof for each house, the height of what it is
  B3.farGeo = function (x0, y0, n) {
    const g = R3.Geo(); const L = TL();
    for (const b of G.S.buildings.values()) {
      if (!inChunk(b, x0, y0, n)) continue;
      const P = palOf(b); const Sh = B3.shellOf(b);
      if (Sh && Sh.shell.kind !== 'round') { const sh = Sh.shell, R = sh.r; const y0 = G.Space.plinth(b).y0; const X = b.x * L + (R[0] + R[2]) / 2, Z = b.y * L + (R[1] + R[3]) / 2; const st = stuff(b); const rk = ROOFK[sh.roof && sh.roof.kind] || P.kind;
        g.pat = PAT[OUTPAT[sh.mat] || 'plaster']; g.put(SH.box, R3.mat(X, y0 - 0.3, Z, 0, R[2] - R[0], sh.eave + 0.3, R[3] - R[1]), P.wl || '#efe2c4');
        if (rk !== 'flat' && sh.roof && sh.roof.h > 0) { const az = sh.roof.along === 'z'; const rc = rk === 'thatch' ? ((P.thatch && P.thatch[0]) || '#c8a85a') : rk === 'turf' ? mixc(calm((P.roof && P.roof[0]) || '#71903f', 0.66, 0.86), [114, 108, 70], hvOf(b, 3) * 0.42) : (P.roof && P.roof[0]) || '#b85a3c';
          g.pat = PAT[rk === 'turf' ? 'turf' : rk === 'thatch' ? 'thatch' : st.tile]; g.put(SH.gable, R3.mat(X, y0 + sh.eave, Z, az ? Math.PI / 2 : 0, (az ? R[3] - R[1] : R[2] - R[0]) + 0.84, sh.roof.h, (az ? R[2] - R[0] : R[3] - R[1]) + 0.84), rc); }
        g.pat = 0; continue; }
      const h = (HEIGHT[b.type] || 5) * (b.built ? 1 : 0.4); if (h < 1.5) continue;
      const X = (b.x + b.w / 2) * L, Z = (b.y + b.h / 2) * L, Y = W.maxH(b.x, b.y, b.w, b.h) * HM();
      const st = stuff(b); const flat = P.kind === 'flat';
      g.pat = PAT[st.wall === 'frame' ? 'plaster' : st.wall]; g.put(SH.box, R3.mat(X, Y - 0.3, Z, 0, b.w * L * 0.85, h * (flat ? 0.95 : 0.6), b.h * L * 0.85), P.wl || '#efe2c4');
      // (a turf roof in the same calm green as its near picture, its own by its age)
      const rc = P.kind === 'thatch' ? ((P.thatch && P.thatch[0]) || '#c8a85a') : P.kind === 'turf' ? mixc(calm((P.roof && P.roof[0]) || '#71903f', 0.66, 0.86), [114, 108, 70], hvOf(b, 3) * 0.42) : (P.roof && P.roof[0]) || '#b85a3c';
      // (the ridge the way the near picture turns it: a longhouse on a square lot along the wall with its door)
      let ax = b.w >= b.h; if (P.kind === 'turf' && b.w === b.h && b.built) ax = ridgeX(b, doorSide(b));
      if (!flat) { g.pat = PAT[P.kind === 'turf' ? 'turf' : P.kind === 'thatch' ? 'thatch' : st.tile]; g.put(SH.gable, R3.mat(X, Y + h * 0.6 - 0.3, Z, ax ? 0 : Math.PI / 2, (b.w >= b.h ? b.w : b.h) * L * 0.95, h * 0.5, (b.w >= b.h ? b.h : b.w) * L * 0.95), rc); }
      g.pat = 0;
    }
    return g.empty ? null : g.build(true);
  };
  // the box a building's 3D body fills, in metres (the tests ask: does it stand where the world says, on the ground?)
  // — the building itself; what lies about it is Props3D's, asked by its own check
  // ------------------------------ the inside: the plan of G.Interiors, drawn ------------------------------
  // the inside of a building from its plan — the storeys' floors and ceilings, the walls' inner faces with their doors and
  // windows cut through them (and the reveals), the partitions whole, the stairs, the ladders and the steps, the roof seen
  // from under it, the furniture by its kind — in the plan's own metres (from the lot's corner; y = 0 the plinth's top: the
  // kit's frame), so the body walks on what it sees. Only the inside: the outer faces are the outside's (its chunk draws
  // them), and what is drawn here faces in. Pure: the plan in, the geometry out — it never changes the world nor draws on
  // the dice (the same plan, the same picture). The doors' leaves come apart, each to turn on its hinge as the world has it.
  //   → { lv: {storey: Geo}, roof: Geo, leaf: [{ id, lv, at: the hinge's foot [X, Y, Z], yaw: shut, swing: ±1 the turn that
  //     opens it into its room, w, h, g: Geo in its own frame }], hatch: [{ id: the stair's, lv, at: the hinge [X, Y, Z], yaw,
  //     w, d, g }] (the lids over the stairs' holes: shut, they are floor — Interiors' HATCH —; one opens a lid by turning it
  //     up about its hinge, rotation.x = −angle after yaw), item: {id: [storey, from, to] its points in the storey's Geo},
  //     light: [[X, Y, Z, k]] its fires, cut: the inner room where the outside's own faces are not drawn while the inside
  //     is, box: all of it, tris }
  const INMAT = { tabua: ['plankH', [146, 114, 80]], taipa: ['mud', [178, 146, 110]], adobe: ['mud', [192, 164, 124]], 'adobe-caiado': ['whitewash', [236, 230, 216]],
    'adobe-estuque': ['stucco', [222, 208, 180]], reboco: ['plaster', [222, 213, 196]], 'pau-a-pique': ['mud', [170, 144, 110]], pedra: ['stone', [158, 152, 142]], enxaimel: ['frame', [230, 222, 205]] };
  const inMat = m => INMAT[m] || INMAT.reboco;
  const IWOOD = [132, 98, 66], IDARK = [98, 72, 48], ILINEN = [224, 216, 198], ISTRAW = [198, 174, 112], IIRON = [54, 52, 50], ICLAY = [178, 106, 68], ISTONE = [152, 146, 136], IASH = [72, 66, 62], IEMBER = [226, 98, 40], IWOOL = [160, 116, 82];
  const IGOLD = [196, 160, 78], IRUG = [146, 64, 50], IWATER = [72, 126, 144]; // (the god's image and the chief's seat; a prayer mat; the water of a pool, a tub, a fountain)
  const UP = [0, 1, 0], DOWN = [0, -1, 0];
  const FLOOR_UP = 0.012; // (a floor a hair over the plinth's top it lies on: the two faces never fight)
  // (what a storey's floor is: boards over a room below and in a loft, flags in the stone towns, beaten earth on the ground)
  function floorMat(K, l) {
    if (l.kind === 'terraco') return ['slab', [204, 190, 164]];
    if (l.lv > 0 || l.kind === 'jirau' || l.kind === 'elevado') return ['plankH', [146, 112, 78]];
    if (l.kind !== 'porao' && (K.st === 'grego' || K.st === 'romano')) return ['slab', [170, 158, 140]];
    return ['soil', K.st === 'nordico' ? [112, 94, 72] : [140, 118, 90]];
  }
  // (a rectangle less the holes in it: the pieces left, cut along the holes' edges, each row's run of pieces joined)
  function cutRect(R, holes) {
    const hs = holes.filter(h => h[0] < R[2] - 1e-4 && h[2] > R[0] + 1e-4 && h[1] < R[3] - 1e-4 && h[3] > R[1] + 1e-4); if (!hs.length) return [R];
    const xs = [R[0], R[2]], zs = [R[1], R[3]];
    for (const h of hs) { for (const x of [h[0], h[2]]) if (x > R[0] && x < R[2]) xs.push(x); for (const z of [h[1], h[3]]) if (z > R[1] && z < R[3]) zs.push(z); }
    xs.sort((a, b) => a - b); zs.sort((a, b) => a - b); const out = [];
    for (let j = 0; j + 1 < zs.length; j++) {
      if (zs[j + 1] - zs[j] < 1e-4) continue; let run = null;
      for (let i = 0; i + 1 < xs.length; i++) {
        if (xs[i + 1] - xs[i] < 1e-4) continue; const cx = (xs[i] + xs[i + 1]) / 2, cz = (zs[j] + zs[j + 1]) / 2;
        if (hs.some(h => cx > h[0] && cx < h[2] && cz > h[1] && cz < h[3])) { run = null; continue; }
        if (run) run[2] = xs[i + 1]; else out.push(run = [xs[i], zs[j], xs[i + 1], zs[j + 1]]);
      }
    }
    return out;
  }
  const clipR = (r, A) => { const o = [Math.max(r[0], A[0]), Math.max(r[1], A[1]), Math.min(r[2], A[2]), Math.min(r[3], A[3])]; return o[2] - o[0] > 1e-3 && o[3] - o[1] > 1e-3 ? o : null; };
  // (a level face over a rectangle at height y, seen from above (1) or from under it (-1))
  const flatQ = (K, R, y, col, dir) => K.quad([R[0], y, R[1]], [R[2], y, R[1]], [R[2], y, R[3]], [R[0], y, R[3]], col, dir > 0 ? UP : DOWN);
  // (the side of an outer wall that is in: toward a room of its storey — or toward the middle of the storey)
  function sideIn(plan, w, l) {
    const ax = w.b[0] - w.a[0], az = w.b[1] - w.a[1]; const L = Math.hypot(ax, az) || 1; const nx = -az / L, nz = ax / L; const mx = (w.a[0] + w.b[0]) / 2, mz = (w.a[1] + w.b[1]) / 2; const d = w.t / 2 + 0.12;
    for (const sg of [1, -1]) { const px = mx + nx * d * sg, pz = mz + nz * d * sg; if (plan.rooms.some(m => m.lv === w.lv && px > m.r[0] && px < m.r[2] && pz > m.r[1] && pz < m.r[3])) return sg; }
    const A = l.area; return ((A[0] + A[2]) / 2 - mx) * nx + ((A[1] + A[3]) / 2 - mz) * nz >= 0 ? 1 : -1;
  }
  // (an outer wall with a room of its storey on each side: the one between the hall and its annex)
  function roomsBoth(plan, w) {
    const ax = w.b[0] - w.a[0], az = w.b[1] - w.a[1]; const L = Math.hypot(ax, az) || 1; const nx = -az / L, nz = ax / L; const mx = (w.a[0] + w.b[0]) / 2, mz = (w.a[1] + w.b[1]) / 2; const d = w.t / 2 + 0.12;
    const has = sg => { const px = mx + nx * d * sg, pz = mz + nz * d * sg; return plan.rooms.some(m => m.lv === w.lv && px > m.r[0] && px < m.r[2] && pz > m.r[1] && pz < m.r[3]); };
    return has(1) && has(-1);
  }
  // a wall of the plan on its storey: its faces between the openings (an outer wall's inner face; a partition whole), the
  // reveals of the openings through it and its top; a rail is posts and rails
  function inWall(K, plan, w, l) {
    const ax = w.b[0] - w.a[0], az = w.b[1] - w.a[1]; const L = Math.hypot(ax, az); if (L < 0.02) return;
    const tx = ax / L, tz = az / L, nx = -tz, nz = tx; const H = w.h, t = w.t; const ry = Math.atan2(-tz, tx);
    const P = (s, y, o) => [w.a[0] + tx * s + nx * o, l.y + y, w.a[1] + tz * s + nz * o];
    const holes = plan.holes.filter(h => h.wall === w.id).sort((p, q) => p.at - q.at);
    if (w.kind === 'guarda-corpo') {
      const runs = []; let s = 0; for (const h of holes) { const h0 = h.at - h.w / 2, h1 = h.at + h.w / 2; if (h0 > s + 0.05) runs.push([s, h0]); s = Math.max(s, h1); } if (s < L - 0.05) runs.push([s, L]);
      K.as('beam', () => { for (const [s0, s1] of runs) { const n = Math.max(1, Math.ceil((s1 - s0) / 0.9)); for (let k = 0; k <= n; k++) { const c = P(s0 + (s1 - s0) * k / n, 0, 0); K.box(c[0], c[1], c[2], 0.07, H, 0.07, IDARK, ry); }
        for (const yy of [H - 0.07, H * 0.45]) { const c = P((s0 + s1) / 2, yy, 0); K.box(c[0], c[1], c[2], s1 - s0, 0.07, 0.07, IWOOD, ry); } } });
      return;
    }
    const [pat, col] = inMat(w.mat || plan.shell.mat); const sg = w.outer && !roomsBoth(plan, w) ? sideIn(plan, w, l) : 0;
    // (the niches cut into it: a blind opening of the inner face, its recess as deep as the niche)
    const nich = sg ? plan.items.filter(it => it.niche && it.lv === w.lv).map(it => { const s0 = (it.x - w.a[0]) * tx + (it.z - w.a[1]) * tz, o0 = (it.x - w.a[0]) * nx + (it.z - w.a[1]) * nz; return Math.abs(o0) <= t / 2 + 0.02 && s0 > -0.01 && s0 < L + 0.01 ? { at: s0, w: it.w, h: it.h, sill: it.y || 0, d: it.d } : null; }).filter(Boolean) : [];
    // (the face's spans: [from, to along it, foot, top] — round the openings)
    const sp = []; let s = 0;
    const gaps = holes.concat(nich).sort((p, q) => p.at - q.at);
    for (const h of gaps) { const h0 = G.clamp(h.at - h.w / 2, 0, L), h1 = G.clamp(h.at + h.w / 2, 0, L); if (h0 > s) sp.push([s, h0, 0, H]); if (h.sill > 0) sp.push([h0, h1, 0, Math.min(H, h.sill)]); if (h.sill + h.h < H) sp.push([h0, h1, h.sill + h.h, H]); s = Math.max(s, h1); }
    if (s < L) sp.push([s, L, 0, H]);
    K.as(pat, () => {
      if (!sg) { for (const [s0, s1, ya, yb] of sp) { if (s1 - s0 < 1e-3 || yb - ya < 1e-3) continue; const c = P((s0 + s1) / 2, ya, 0); K.box(c[0], c[1], c[2], s1 - s0, yb - ya, t, col, ry); }
        // (the floor through a partition's door: a board over the gap between the two rooms)
        for (const h of holes) if (h.sill <= 0.001) { const c = P(h.at, 0, 0); K.as('plankH', () => K.box(c[0], c[1], c[2], h.w, FLOOR_UP + 0.008, t + 0.02, IDARK, ry)); }
        return; }
      const o = sg * t / 2, out = [nx * sg, 0, nz * sg];
      for (const [s0, s1, ya, yb] of sp) if (s1 - s0 > 1e-3 && yb - ya > 1e-3) K.quad(P(s0, ya, o), P(s1, ya, o), P(s1, yb, o), P(s0, yb, o), col, out);
      // (the reveals: the opening's sides through the wall, its sill, its lintel — a door's threshold a board on the floor)
      for (const h of holes) {
        const h0 = G.clamp(h.at - h.w / 2, 0, L), h1 = G.clamp(h.at + h.w / 2, 0, L), ya = h.sill, yb = Math.min(H, h.sill + h.h);
        // (a window's from the pane in the wall's middle to the room — the outside has the rest; a door's and an arch's through)
        const o0 = h.kind === 'janela' ? 0 : -sg * t / 2, o1 = sg * t / 2;
        K.quad(P(h0, ya, o0), P(h0, ya, o1), P(h0, yb, o1), P(h0, yb, o0), col, [tx, 0, tz]); K.quad(P(h1, ya, o0), P(h1, ya, o1), P(h1, yb, o1), P(h1, yb, o0), col, [-tx, 0, -tz]);
        if (yb < H) K.quad(P(h0, yb, o0), P(h1, yb, o0), P(h1, yb, o1), P(h0, yb, o1), col, DOWN);
        if (ya > 0) K.quad(P(h0, ya, o0), P(h1, ya, o0), P(h1, ya, o1), P(h0, ya, o1), col, UP);
      }
      // (a niche: its back, its sides, its floor and its top, into the wall from the inner face)
      for (const h of nich) { const h0 = h.at - h.w / 2, h1 = h.at + h.w / 2, ya = h.sill, yb = h.sill + h.h, ob = o - sg * h.d;
        K.quad(P(h0, ya, ob), P(h1, ya, ob), P(h1, yb, ob), P(h0, yb, ob), dim(col, 0.9), out);
        K.quad(P(h0, ya, o), P(h0, ya, ob), P(h0, yb, ob), P(h0, yb, o), dim(col, 0.94), [tx, 0, tz]); K.quad(P(h1, ya, o), P(h1, ya, ob), P(h1, yb, ob), P(h1, yb, o), dim(col, 0.94), [-tx, 0, -tz]);
        K.quad(P(h0, ya, o), P(h1, ya, o), P(h1, ya, ob), P(h0, ya, ob), col, UP); K.quad(P(h0, yb, o), P(h1, yb, o), P(h1, yb, ob), P(h0, yb, ob), dim(col, 0.85), DOWN); }
      K.quad(P(0, H, -t / 2), P(L, H, -t / 2), P(L, H, t / 2), P(0, H, t / 2), col, UP);
    });
    // (the frames round the openings, on the inside: jambs and a lintel of the people's wood; a door's threshold)
    if (sg) K.as('jamb', () => { const o = sg * (t / 2 + 0.02);
      for (const h of holes) { const h0 = h.at - h.w / 2, h1 = h.at + h.w / 2, ya = h.sill, yb = h.sill + h.h;
        for (const e of [h0 - 0.04, h1 + 0.04]) { const c = P(e, ya, o); K.box(c[0], c[1], c[2], 0.08, yb - ya + 0.08, 0.04, IDARK, ry); }
        if (yb + 0.08 < H) { const c = P(h.at, yb, o); K.box(c[0], c[1], c[2], h1 - h0 + 0.16, 0.08, 0.04, IDARK, ry); }
        if (ya <= 0.001) { const c = P(h.at, FLOOR_UP, 0); K.box(c[0], c[1], c[2], h1 - h0, 0.02, t, IDARK, ry); } else { const c = P(h.at, ya - 0.04, o); K.box(c[0], c[1], c[2], h1 - h0 + 0.12, 0.04, 0.08, IWOOD, ry); } } });
  }
  // the ring of a round hut: its inner face from the floor to the eaves, open where the straight piece with the door stands
  function inRing(K, plan, l) {
    const sh = plan.shell; const ri = sh.r - sh.t; const [pat, col] = inMat(sh.mat); const H = sh.eave - l.y; if (H <= 0) return;
    const seg = plan.walls.find(w => w.kind === 'anel' && w.lv === l.lv); const n = 22; const pts = [];
    const ang = p => Math.atan2(p[1] - sh.cz, p[0] - sh.cx); const on = a => [sh.cx + Math.cos(a) * ri, sh.cz + Math.sin(a) * ri];
    if (seg) {
      // (from the piece's one inner corner round the long way to its other)
      const ax = seg.b[0] - seg.a[0], az = seg.b[1] - seg.a[1]; const L = Math.hypot(ax, az) || 1; const o = sideIn(plan, seg, l) * seg.t / 2;
      const A = [seg.a[0] - az / L * o, seg.a[1] + ax / L * o], B = [seg.b[0] - az / L * o, seg.b[1] + ax / L * o];
      const aB = ang(B), aA = ang(A), e = ang([(A[0] + B[0]) / 2, (A[1] + B[1]) / 2]); const md = x => ((x % TAU) + TAU) % TAU;
      const d = md(aA - aB); const sw = md(e - aB) < d ? d - TAU : d;
      pts.push(B); for (let k = 1; k < n; k++) pts.push(on(aB + sw * k / n)); pts.push(A);
    } else for (let k = 0; k <= n; k++) pts.push(on(TAU * k / n));
    K.as(pat, () => { for (let k = 0; k + 1 < pts.length; k++) { const p = pts[k], q = pts[k + 1]; const mx = (p[0] + q[0]) / 2, mz = (p[1] + q[1]) / 2;
      K.quad([p[0], l.y, p[1]], [q[0], l.y, q[1]], [q[0], l.y + H, q[1]], [p[0], l.y + H, p[1]], col, [sh.cx - mx, 0, sh.cz - mz]); } });
  }
  // a storey's floor over its area less the holes of the ladders and stairs that come up through it; where another storey
  // is under it, its slab — the underside (the ceiling of the room below), the edges (a loft's front, a hatch's sides), the
  // joists under it
  function inFloor(K, plan, l, below) {
    const holes = plan.stairs.filter(s => s.lv1 === l.lv && s.hole).map(s => s.hole);
    // (over a court open to the sky a storey has no floor — its grid has none there: the court's own storey has its paving)
    const court = plan.shell.court; if (court && courtOpenOn(plan, l, court)) holes.push(court);
    const [pat, col] = floorMat(K, l); const y = l.y + FLOOR_UP;
    if (plan.shell.kind === 'round' && l.lv === Math.min(...plan.levels.map(q => q.lv))) {
      const sh = plan.shell, ri = sh.r - sh.t + 0.02, n = 22; K.as(pat, () => { for (let k = 0; k < n; k++) { const a0 = TAU * k / n, a1 = TAU * (k + 1) / n; K.tri([sh.cx, y, sh.cz], [sh.cx + Math.cos(a0) * ri, y, sh.cz + Math.sin(a0) * ri], [sh.cx + Math.cos(a1) * ri, y, sh.cz + Math.sin(a1) * ri], col, UP); } });
      return;
    }
    const pieces = cutRect(l.area, holes);
    // (and the rooms beyond the storey's own area — an annex against its side)
    const A0 = l.area; const extra = plan.rooms.filter(m => m.lv === l.lv && (m.r[0] < A0[0] - 0.05 || m.r[1] < A0[1] - 0.05 || m.r[2] > A0[2] + 0.05 || m.r[3] > A0[3] + 0.05) && !clipR(m.r, A0));
    K.as(pat, () => { for (const r of pieces) flatQ(K, r, y, col, 1); for (const m of extra) for (const r of cutRect(m.r, holes)) flatQ(K, r, y, col, 1); });
    if (!below) return;
    // (the slab the plan gives the storey — from y − slab to y —, the joists within it, their feet at the ceiling of the room
    // below — the boards between them a hand higher: the headroom drawn is the plan's)
    const th = l.slab > 0 ? l.slab : G.clamp(l.y - (below.y + below.h), 0.1, 0.3), yb = l.y - th; const A = below.area; const wd = l.kind === 'jirau' ? IWOOD : dim(IWOOD, 0.92); const jh = K.fine ? Math.min(0.07, th - 0.03) : 0;
    K.as(l.kind === 'jirau' ? 'plankH' : 'beam', () => {
      for (const r of pieces) { const q = clipR(r, A); if (q) flatQ(K, q, yb + jh, wd, -1); }
      // (the edges: of the storey's own area where it stands free over the room, and round each hole)
      const R = l.area; const edge = (x0, z0, x1, z1, out) => K.quad([x0, yb, z0], [x1, yb, z1], [x1, y, z1], [x0, y, z0], wd, out);
      edge(R[0], R[1], R[2], R[1], [0, 0, -1]); edge(R[2], R[1], R[2], R[3], [1, 0, 0]); edge(R[2], R[3], R[0], R[3], [0, 0, 1]); edge(R[0], R[3], R[0], R[1], [-1, 0, 0]);
      for (const h of holes) { edge(h[0], h[1], h[2], h[1], [0, 0, 1]); edge(h[2], h[1], h[2], h[3], [-1, 0, 0]); edge(h[2], h[3], h[0], h[3], [0, 0, -1]); edge(h[0], h[3], h[0], h[1], [1, 0, 0]); }
    });
    // (the joists, across the short way, every 60 cm: cut where a hole is)
    if (!K.fine) return;
    const R = clipR(l.area, A); if (!R) return; const alongX = R[2] - R[0] <= R[3] - R[1];
    K.as('beam', () => { const len = alongX ? R[3] - R[1] : R[2] - R[0]; const n = Math.max(1, Math.floor(len / 0.6));
      for (let k = 1; k <= n; k++) { const c = (alongX ? R[1] : R[0]) + len * (k - 0.5) / n; const strip = alongX ? [R[0], c - 0.045, R[2], c + 0.045] : [c - 0.045, R[1], c + 0.045, R[3]];
        for (const q of cutRect(strip, holes)) K.box((q[0] + q[2]) / 2, yb, (q[1] + q[3]) / 2, q[2] - q[0], jh, q[3] - q[1], IDARK); } });
  }
  // the roof seen from under it: the gable's two slopes and its ends, the hip's four, the hut's cone, the flat ceiling — a
  // little under the outside's roof (its slopes from the walls' inner faces at the eaves), with the rafters and the ridge beam
  function inRoof(K, plan) {
    const sh = plan.shell, R = sh.roof || { kind: 'plano' }; const eave = sh.eave; const wall = inMat(sh.mat); const wood = IWOOD;
    // (the roof's underside as Interiors measures a loft's headroom under it — Interiors.roofY, a hand under the outside's
    // slopes: from the eaves at the shell's outer edge to the ridge; so the room the plan gives a loft is the room drawn)
    const rise = R.h || 0, DN = 0.25;
    if (sh.kind === 'round') {
      const ri = sh.r - sh.t; const yAt = d => eave + rise * Math.max(0, 1 - d / sh.r) - DN; const yk = Math.max(eave, yAt(ri)), yr = yAt(0); const n = 22; const C = [sh.cx, yr, sh.cz];
      const on = (a, y) => [sh.cx + Math.cos(a) * ri, y, sh.cz + Math.sin(a) * ri];
      K.as(R.kind === 'palha-conica' || R.kind === 'palha' ? 'thatch' : 'beam', () => { for (let k = 0; k < n; k++) { const a0 = TAU * k / n, a1 = TAU * (k + 1) / n; K.tri(on(a0, yk), on(a1, yk), C, ISTRAW, DOWN); } });
      if (yk > eave + 0.005) K.as(wall[0], () => { for (let k = 0; k < n; k++) { const a0 = TAU * k / n, a1 = TAU * (k + 1) / n, am = (a0 + a1) / 2; K.quad(on(a0, eave), on(a1, eave), on(a1, yk), on(a0, yk), wall[1], [-Math.cos(am), 0, -Math.sin(am)]); } });
      if (K.fine) K.as('beam', () => { for (let k = 0; k < 8; k++) { const a = TAU * k / 8; K.log(on(a, yk - 0.06), [sh.cx, yr - 0.08, sh.cz], 0.04, IDARK); } });
      return;
    }
    // (under the roof: the widest of the storeys under it — the upper storeys' walls are thinner than the ground's)
    const I = [9, 9, -9, -9]; for (const l of plan.levels) { if (l.kind === 'porao') continue; I[0] = Math.min(I[0], l.area[0]); I[1] = Math.min(I[1], l.area[1]); I[2] = Math.max(I[2], l.area[2]); I[3] = Math.max(I[3], l.area[3]); }
    // (a court: the sky over it, the roof all round it — the court's walls taken up to the roof's underside)
    const court = sh.court || R.court || null; const covered = court && courtCovered(plan, court);
    if (rise <= DN || R.kind === 'plano') {
      // (a flat roof: the ceiling under it — unless a terrace's floor is the ceiling)
      if (!plan.levels.some(l => l.kind === 'terraco')) K.as('beam', () => { for (const q of court ? cutRect(I, [court]) : [I]) flatQ(K, q, eave, dim(wood, 0.95), -1); });
      if (court && !covered) courtKnees(K, plan, court, () => eave, () => eave);
      if (K.fine && !court && !plan.levels.some(l => l.kind === 'terraco')) { const alongX = I[2] - I[0] <= I[3] - I[1]; const len = alongX ? I[3] - I[1] : I[2] - I[0]; const n = Math.max(1, Math.floor(len / 0.55));
        K.as('beam', () => { for (let k = 1; k <= n; k++) { const c = (alongX ? I[1] : I[0]) + len * (k - 0.5) / n; if (alongX) K.log([I[0], eave - 0.07, c], [I[2], eave - 0.07, c], 0.06, IDARK); else K.log([c, eave - 0.07, I[1]], [c, eave - 0.07, I[3]], 0.06, IDARK); } }); }
      return;
    }
    const pat = R.kind === 'palha' ? 'thatch' : R.kind === 'turfa' ? 'beam' : 'plankH'; const cl = R.kind === 'palha' ? ISTRAW : dim(wood, 0.9);
    const ax = R.along !== 'z'; // (the ridge along X: the slopes go down to the walls at the low and high Z)
    const O = sh.r; const [ou0, ov0, ou1, ov1] = ax ? O : [O[1], O[0], O[3], O[2]]; const um = (ou0 + ou1) / 2, vm = (ov0 + ov1) / 2, hu = (ou1 - ou0) / 2, hv = (ov1 - ov0) / 2;
    const [u0, v0, u1, v1] = ax ? I : [I[1], I[0], I[3], I[2]];
    const Pt = (u, y, v) => (ax ? [u, y, v] : [v, y, u]);
    const hip = R.kind === 'quatro-aguas';
    const yAt = (u, v) => { const across = Math.abs(v - vm) / hv; const end = hip ? (Math.abs(u - um) - (hu - hv)) / hv : -1; return eave + rise * Math.max(0, 1 - Math.max(across, end)) - DN; };
    const r0 = hip ? G.clamp(um - (hu - hv), u0, um) : u0, r1 = hip ? G.clamp(um + (hu - hv), um, u1) : u1; const yr = yAt((r0 + r1) / 2, vm);
    const P2 = (u, v) => Pt(u, Math.max(eave, yAt(u, v)), v);
    if (court) {
      // (round a court: the underside a field of points, every half metre and at the court's edges and the ridge — as the
      // outside's roof is laid —, none over the court)
      const yX = (x, z) => Math.max(eave, ax ? yAt(x, z) : yAt(z, x));
      const lines = (a0, a1, extra) => { const st = new Set(); const n = Math.ceil((a1 - a0) / 0.5); for (let k = 0; k <= n; k++) st.add(+(a0 + (a1 - a0) * k / n).toFixed(4)); for (const e of extra) if (e > a0 && e < a1) st.add(+e.toFixed(4)); return [...st].sort((a, b) => a - b); };
      const xs = lines(I[0], I[2], [court[0], court[2], (O[0] + O[2]) / 2]), zs = lines(I[1], I[3], [court[1], court[3], (O[1] + O[3]) / 2]);
      K.as(pat, () => { for (let j = 0; j + 1 < zs.length; j++) for (let i = 0; i + 1 < xs.length; i++) { const x0 = xs[i], x1 = xs[i + 1], z0 = zs[j], z1 = zs[j + 1]; if (inRect(court, (x0 + x1) / 2, (z0 + z1) / 2)) continue;
        K.quad([x0, yX(x0, z0), z0], [x1, yX(x1, z0), z0], [x1, yX(x1, z1), z1], [x0, yX(x0, z1), z1], cl, DOWN); } });
      if (!covered) courtKnees(K, plan, court, (x, z) => yX(x, z), (x, z) => yX(x, z) + DN);
    } else K.as(pat, () => {
      K.quad(P2(u0, v0), P2(u1, v0), P2(r1, vm), P2(r0, vm), cl, DOWN); K.quad(P2(u0, v1), P2(u1, v1), P2(r1, vm), P2(r0, vm), cl, DOWN);
      if (hip) { K.tri(P2(u0, v0), P2(u0, v1), P2(r0, vm), cl, DOWN); K.tri(P2(u1, v0), P2(u1, v1), P2(r1, vm), cl, DOWN); }
    });
    // (the walls' inner faces from the eaves up to the underside — the knee walls under the slopes — and the gable ends,
    // of the wall's own stuff)
    K.as(wall[0], () => {
      const knee = (a, b2, out) => { const ya = yAt(a[0], a[1]), yb = yAt(b2[0], b2[1]); if (Math.max(ya, yb) < eave + 0.005) return; K.quad(Pt(a[0], eave, a[1]), Pt(b2[0], eave, b2[1]), Pt(b2[0], Math.max(eave, yb), b2[1]), Pt(a[0], Math.max(eave, ya), a[1]), wall[1], out); };
      const Vin = ax ? [0, 0, 1] : [1, 0, 0], Uin = ax ? [1, 0, 0] : [0, 0, 1];
      knee([u0, v0], [u1, v0], Vin); knee([u0, v1], [u1, v1], Vin.map(q => -q));
      if (hip) { knee([u0, v0], [u0, v1], Uin); knee([u1, v0], [u1, v1], Uin.map(q => -q)); }
      else for (const [u, o] of [[u0, Uin], [u1, Uin.map(q => -q)]]) { knee([u, v0], [u, v1], o); K.tri(P2(u, v0), P2(u, v1), Pt(u, yr, vm), wall[1], o); }
    });
    if (!K.fine || court) return;
    // (the rafters from the walls to the ridge, a hand under the slope; the ridge beam)
    K.as('beam', () => { const n = Math.max(2, Math.round((u1 - u0) / 0.6)); const dn = 0.06;
      for (let k = 0; k <= n; k++) { const u = u0 + 0.05 + (u1 - u0 - 0.1) * k / n; if (u < r0 - 0.01 || u > r1 + 0.01) continue; for (const v of [v0, v1]) { const p = P2(u, v); K.log([p[0], p[1] - dn, p[2]], Pt(u, yr - dn, vm), 0.04, IDARK); } }
      if (r1 - r0 > 0.05) K.log(Pt(r0, yr - 0.1, vm), Pt(r1, yr - 0.1, vm), 0.07, IDARK); });
  }
  // (a storey whose grid has nothing to stand on over the court — no floor, stair nor hatch there: the court is open through it)
  function courtOpenOn(plan, l, c) {
    const g = plan.grid && plan.grid.lv[l.lv]; if (!g) return false; const n = plan.grid.n, cs = plan.grid.cs, C = G.Interiors.CELL; let inner = 0;
    for (let z = Math.max(0, Math.floor(c[1] / cs)); z < Math.min(n, Math.ceil(c[3] / cs)); z++) for (let x = Math.max(0, Math.floor(c[0] / cs)); x < Math.min(n, Math.ceil(c[2] / cs)); x++) {
      const px = (x + 0.5) * cs, pz = (z + 0.5) * cs; if (!(px > c[0] && px < c[2] && pz > c[1] && pz < c[3])) continue; inner++; const k = g[z * n + x];
      if (k === C.FLOOR || k === C.STAIR || k === C.HATCH || k === C.DOOR) return false; }
    return inner > 0;
  }
  // (a court a storey over the ground has floor over — the grid's: where the body walks there, nothing of the court's stands)
  function courtCovered(plan, c) {
    const n = plan.grid.n, cs = plan.grid.cs, F = G.Interiors.CELL.FLOOR;
    for (const l of plan.levels) { if (l.lv <= 0) continue; const g = plan.grid.lv[l.lv]; if (!g) continue;
      for (let z = Math.max(0, Math.floor(c[1] / cs)); z < Math.min(n, Math.ceil(c[3] / cs)); z++) for (let x = Math.max(0, Math.floor(c[0] / cs)); x < Math.min(n, Math.ceil(c[2] / cs)); x++) { const px = (x + 0.5) * cs, pz = (z + 0.5) * cs; if (px > c[0] && px < c[2] && pz > c[1] && pz < c[3] && g[z * n + x] === F) return true; } }
    return false;
  }
  // the court's walls from their tops up to the roof: on the rooms' side to the underside the inside draws (yIn), on the court's
  // to the outside's roof over it (yOut) — the court's own sides, the outside's from afar, are put aside where the inside is
  function courtKnees(K, plan, c, yIn, yOut) {
    const [pat, col] = inMat(plan.shell.mat);
    for (const sd of ['N', 'E', 'S', 'W']) {
      const F = rside(c, sd); let t = 0.2, top = 0;
      for (const w of plan.walls) { if (w.lv < 0) continue; const l = plan.levels.find(q => q.lv === w.lv); if (!l) continue; const along = F.ax ? Math.abs(w.b[1] - w.a[1]) < 1e-3 : Math.abs(w.b[0] - w.a[0]) < 1e-3; if (!along) continue;
        const cl = F.ax ? w.a[1] : w.a[0]; if (Math.abs(cl - (F.line + (F.ax ? F.o[1] : F.o[0]) * w.t / 2)) > 0.04) continue; t = w.t; top = Math.max(top, l.y + w.h); }
      if (!top) continue; const n = Math.max(1, Math.ceil((F.u1 - F.u0 + 2 * t) / 0.25)); const a0 = F.u0 - t, a1 = F.u1 + t;
      K.as(pat, () => { for (let k = 0; k < n; k++) { const a = a0 + (a1 - a0) * k / n, b2 = a0 + (a1 - a0) * (k + 1) / n;
        const pa = F.P(a, 0, 0), pb = F.P(b2, 0, 0), ra = F.P(a, 0, t), rb = F.P(b2, 0, t);
        const ya = yOut(pa[0], pa[2]), yb = yOut(pb[0], pb[2]); if (Math.max(ya, yb) > top + 0.005 && a >= F.u0 - 1e-3 && b2 <= F.u1 + 1e-3) K.quad(F.P(a, top, 0), F.P(b2, top, 0), F.P(b2, Math.max(top, yb), 0), F.P(a, Math.max(top, ya), 0), col, [-F.o[0], 0, -F.o[1]]);
        const za = yIn(ra[0], ra[2]), zb = yIn(rb[0], rb[2]); if (Math.max(za, zb) > top + 0.005) K.quad(F.P(a, top, t), F.P(b2, top, t), F.P(b2, Math.max(top, zb), t), F.P(a, Math.max(top, za), t), col, F.out); } });
    }
  }
  // the stairs between the storeys, the ladders up to a loft and down to a cellar, the steps from the ground to the door
  // (into a sunken floor, up to a house on stilts): each over its footprint, from its foot to its top as Interiors.floorY has it
  function inStair(K, plan, s) {
    const lv = lv => plan.levels.find(l => l.lv === lv); const r = s.r; const dx = s.dir[0], dz = s.dir[1];
    const len = dx ? r[2] - r[0] : r[3] - r[1], wid = dx ? r[3] - r[1] : r[2] - r[0];
    // (a point along it — from the end it starts at — and across it, at a height)
    const at = (t, a, y) => { const sx0 = dx > 0 ? r[0] : r[2], sz0 = dz > 0 ? r[1] : r[3]; return dx ? [sx0 + dx * t, y, (r[1] + r[3]) / 2 + a] : [(r[0] + r[2]) / 2 + a, y, sz0 + dz * t]; };
    const ry = dx ? 0 : Math.PI / 2; // (a box along it: X along, as the flight runs)
    const y0 = s.kind === 'degraus' ? 0 : (lv(s.lv0) || { y: 0 }).y, y1 = s.kind === 'degraus' ? (lv(s.lv1) || { y: 0 }).y : (lv(s.lv1) || { y: y0 + 2.4 }).y;
    if (s.kind === 'escada-de-mao') {
      // (a ladder: its feet at the start, leaning to the far end — up through a hatch to its floor, under the lid; against a
      // loft's edge, a hand-hold over it)
      const top = s.hole ? Math.max(y0, y1) - 0.02 : Math.max(y0, y1) + 0.9, bot = Math.min(y0, y1); const tb = len - 0.08, ta = 0.08;
      K.as('beam', () => { for (const a of [-wid / 2 + 0.06, wid / 2 - 0.06]) K.log(at(ta, a, bot + FLOOR_UP), at(tb, a, top), 0.03, IWOOD);
        const n = Math.max(2, Math.round((top - bot) / 0.28)); for (let k = 1; k < n; k++) { const f = k / n; const p = at(ta + (tb - ta) * f, -wid / 2 + 0.06, bot + (top - bot) * f), q = at(ta + (tb - ta) * f, wid / 2 - 0.06, bot + (top - bot) * f); K.log(p, q, 0.02, IDARK); } });
      return;
    }
    // (steps: solid, each from the lower floor up to its tread — the last one the floor it reaches)
    const rise = y1 - y0; const n = Math.max(2, Math.round(Math.abs(rise) / 0.19)); const run = len / n; const lo = Math.min(y0, y1);
    const stone = s.kind === 'degraus' && !(y1 > 0.6); const [pat, col] = stone ? ['stone', ISTONE] : ['plankH', IWOOD];
    K.as(pat, () => { for (let k = 0; k < n; k++) { const tr = y0 + rise * (k + 1) / n; const hh = tr - lo; if (hh < 0.01) continue; const c = at(run * (k + 0.5), 0, lo); K.box(c[0], c[1], c[2], run + 0.002, hh + FLOOR_UP, wid, col, ry); } });
  }
  // a piece of furniture in its own frame: a across its front, n out of it (its users stand at +n), y up from its foot
  function piece(K, it, y0) {
    const c = Math.cos(it.ry || 0), s = Math.sin(it.ry || 0); const P = (a, n) => [it.x + a * c + n * s, it.z - a * s + n * c];
    const F = {
      box(a, y, n, sa, sy, sn, col, pat, ry2) { const p = P(a, n); K.as(pat || 0, () => K.box(p[0], y0 + y, p[1], sa, sy, sn, col, (it.ry || 0) + (ry2 || 0))); },
      cyl(a, y, n, r, h, col, pat) { const p = P(a, n); K.as(pat || 0, () => K.cyl(p[0], y0 + y, p[1], r, h, col)); },
      sph(a, y, n, r, col, sy, pat) { const p = P(a, n); K.as(pat || 0, () => K.sph(p[0], y0 + y, p[1], r, col, sy)); },
      log(a0, ya, n0, a1, yb, n1, r, col, pat) { const p = P(a0, n0), q = P(a1, n1); K.as(pat || 0, () => K.log([p[0], y0 + ya, p[1]], [q[0], y0 + yb, q[1]], r, col)); },
      legs(w, d, h, r, col) { for (const ea of [-1, 1]) for (const en of [-1, 1]) F.box(ea * (w / 2 - r), 0, en * (d / 2 - r), r * 2, h, r * 2, col, 'beam'); },
      hv: k => K.hv(9000 + (it.k | 0) * 37 + k),
    };
    return F;
  }
  // the furniture by its kind (Interiors' catalogue, int-moveis.js): w across its front, d deep, h high — what each is made of
  const FURN = {
    cama(F, it) { const { w, d } = it; F.legs(w, d, 0.3, 0.035, IDARK); F.box(0, 0.25, 0, w, 0.12, d, IWOOD, 'plankH'); F.box(0, 0.37, 0.02, w - 0.08, 0.13, d - 0.1, ILINEN, 'linen'); F.box(0, 0.25, -d / 2 + 0.025, w, 0.55, 0.05, IDARK, 'plankV');
      const k = it.places >= 2 || w > 1.2 ? 2 : 1; for (let q = 0; q < k; q++) F.box(k === 2 ? (q ? 1 : -1) * w / 4 : 0, 0.5, -d / 2 + 0.25, k === 2 ? w / 2 - 0.12 : w - 0.3, 0.08, 0.32, ILINEN, 'linen');
      F.box(0, 0.5, d * 0.16, w - 0.04, 0.03, d * 0.6, F.hv(1) < 0.5 ? IWOOL : [128, 92, 70], 'wool'); },
    'cama-casal'(F, it) { FURN.cama(F, it); },
    esteira(F, it) { const { w, d } = it; F.box(0, 0, 0, w, 0.03, d, ISTRAW, 'wicker'); F.log(-w / 2 + 0.08, 0.1, -d / 2 + 0.16, w / 2 - 0.08, 0.1, -d / 2 + 0.16, 0.07, IWOOL, 'wool'); },
    'esteira-casal'(F, it) { const { w, d } = it; F.box(0, 0, 0, w, 0.04, d, ISTRAW, 'wicker'); for (const e of [-1, 1]) F.log(e * w / 4 - w / 5, 0.11, -d / 2 + 0.16, e * w / 4 + w / 5, 0.11, -d / 2 + 0.16, 0.07, IWOOL, 'wool');
      F.box(0, 0.04, d * 0.12, w - 0.06, 0.025, d * 0.55, F.hv(2) < 0.5 ? IWOOL : [128, 92, 70], 'wool'); },
    fogareiro(F, it) { const { w, h } = it; F.cyl(0, 0, 0, w / 2 - 0.05, h - 0.06, ICLAY, 'mud'); F.box(0, 0.08, w / 2 - 0.1, 0.18, 0.14, 0.1, [40, 32, 28]); F.cyl(0, h - 0.06, 0, w / 2 - 0.12, 0.05, IEMBER); F.cyl(0.03, h - 0.03, 0, 0.12, 0.14, IIRON, 'iron'); },
    nicho(F, it) { const { w, d } = it; F.cyl(-w * 0.22, 0, 0, Math.min(0.08, d / 2 - 0.02), 0.22, ICLAY, 'mud'); F.box(w * 0.18, 0, 0, w * 0.34, 0.12, d - 0.06, IWOOD, 'plankH'); F.cyl(w * 0.18, 0.12, 0, 0.04, 0.05, [168, 136, 70]); },
    'banco-cama'(F, it) { const { w, d, h } = it; F.box(0, 0, 0, w, h - 0.05, d, dim(IWOOD, 0.9), 'plankH'); F.box(0, h - 0.05, 0, w, 0.05, d, IWOOD, 'plankH');
      const k = Math.max(1, Math.floor(w / 0.7 + 1e-6)); for (let q = 0; q < k; q++) F.box(-w / 2 + w * (q + 0.5) / k, h, -0.04, Math.min(0.62, w / k - 0.06), 0.05, d - 0.18, q % 2 ? [120, 96, 70] : [150, 126, 92], 'fur'); },
    berco(F, it) { const { w, d } = it; F.box(0, 0.12, 0, w, 0.3, d, IWOOD, 'plankH'); F.box(0, 0.3, 0, w - 0.08, 0.1, d - 0.08, ILINEN, 'linen'); for (const e of [-1, 1]) F.box(0, 0, e * (d / 2 - 0.1), w + 0.06, 0.12, 0.06, IDARK, 'beam'); },
    lar(F, it) { const { w, d } = it; F.box(0, 0, -d / 2 + 0.06, w, 0.25, 0.12, ISTONE, 'stone'); F.box(0, 0, d / 2 - 0.06, w, 0.25, 0.12, ISTONE, 'stone'); F.box(-w / 2 + 0.06, 0, 0, 0.12, 0.25, d - 0.24, ISTONE, 'stone'); F.box(w / 2 - 0.06, 0, 0, 0.12, 0.25, d - 0.24, ISTONE, 'stone');
      F.box(0, 0, 0, w - 0.24, 0.06, d - 0.24, IASH, 'soil'); F.box(0, 0.06, 0, w * 0.35, 0.05, d * 0.3, IEMBER); F.log(-w * 0.2, 0.1, -d * 0.2, w * 0.2, 0.12, d * 0.2, 0.045, IDARK, 'bark'); F.log(w * 0.2, 0.1, -d * 0.2, -w * 0.2, 0.12, d * 0.2, 0.045, IDARK, 'bark'); },
    fogao(F, it, cx) { const { w, d, h } = it; F.box(0, 0, 0, w, h, d, ISTONE, 'stone'); F.box(0, 0.15, d / 2, w * 0.42, 0.3, 0.02, [36, 30, 28]); F.box(0, 0.17, d / 2 - 0.02, w * 0.3, 0.08, 0.04, IEMBER);
      F.cyl(-w * 0.22, h, 0, 0.13, 0.18, IIRON, 'iron'); const hy = Math.min(cx.ceil - 0.25, h + 0.75); F.box(0, hy, -0.04, w * 0.9, 0.35, d * 0.7, dim(ISTONE, 0.9), 'stone'); if (cx.ceil > hy + 0.36) F.box(0, hy + 0.35, -d / 2 + 0.18, 0.34, cx.ceil - hy - 0.35, 0.32, dim(ISTONE, 0.85), 'stone'); },
    forno(F, it) { const { w, d, h } = it; F.box(0, 0, 0, w, h * 0.45, d, ISTONE, 'stone'); F.sph(0, h * 0.5, 0, w / 2 - 0.04, ICLAY, h * 0.5, 'mud'); F.box(0, h * 0.45, d / 2 - 0.08, 0.3, 0.22, 0.12, [40, 32, 28]); },
    braseiro(F, it) { const { h } = it; for (let k = 0; k < 3; k++) { const a = k * TAU / 3; F.log(Math.cos(a) * 0.2, 0, Math.sin(a) * 0.2, Math.cos(a) * 0.08, h - 0.1, Math.sin(a) * 0.08, 0.015, IIRON, 'iron'); }
      F.cyl(0, h - 0.14, 0, 0.22, 0.12, IIRON, 'iron'); F.cyl(0, h - 0.03, 0, 0.17, 0.03, IEMBER); },
    mesa(F, it) { const { w, d, h } = it; F.legs(w, d, h - 0.05, 0.035, IDARK); F.box(0, h - 0.05, 0, w, 0.05, d, IWOOD, 'plankH'); F.cyl(w * 0.2, h, 0, 0.09, 0.05, ICLAY); F.cyl(-w * 0.25, h, d * 0.1, 0.05, 0.16, ICLAY); },
    'mesa-baixa'(F, it) { FURN.mesa(F, it); },
    banco(F, it) { const { w, d, h } = it; for (const e of [-1, 1]) F.box(e * (w / 2 - 0.12), 0, 0, 0.05, h - 0.05, d - 0.04, IDARK, 'plankV'); F.box(0, h - 0.05, 0, w, 0.05, d, IWOOD, 'plankH'); },
    arca(F, it) { const { w, d, h } = it; F.box(0, 0, 0, w, h - 0.06, d, IWOOD, 'plankH'); F.box(0, h - 0.06, 0, w + 0.02, 0.06, d + 0.02, IDARK, 'plankH'); for (const e of [-1, 1]) F.box(e * w / 4, 0, 0, 0.04, h + 0.005, d + 0.025, IIRON, 'iron'); },
    // (a keeping piece shows how full it is when the world says — cx.fill, Interiors.state: its share of the store it holds —, the
    // shelves filled from the bottom up; told nothing, as a piece of furniture is)
    despensa(F, it, cx) { const { w, d, h } = it; for (const e of [-1, 1]) F.box(e * (w / 2 - 0.02), 0, 0, 0.04, h, d, IDARK, 'plankV'); for (const y of [0.04, 0.6, 1.12, h - 0.04]) F.box(0, y, 0, w - 0.08, 0.03, d, IWOOD, 'plankH');
      const told = cx && Number.isFinite(cx.fill); const shown = told ? Math.round(G.clamp(cx.fill, 0, 1) * 9) : 9; let q = 0;
      for (const y of [0.07, 0.63, 1.15]) for (let k = 0; k < 3; k++) { const a = -w / 2 + 0.2 + (w - 0.4) * k / 2; if (told ? q++ < shown : F.hv(k + y * 10) < 0.7) F.cyl(a, y, 0, 0.08 + F.hv(k + 5) * 0.04, 0.2 + F.hv(k + 7) * 0.12, ICLAY); } },
    jarros(F, it) { const { w, d, h } = it; const n = w > 0.8 ? 3 : 2; for (let k = 0; k < n; k++) { const a = -w / 2 + w * (k + 0.5) / n, r = Math.min(d / 2 - 0.03, w / n / 2 - 0.02) * (0.85 + F.hv(k) * 0.15), hh = h * (0.75 + F.hv(k + 3) * 0.25);
      F.sph(a, hh / 2 - 0.02, 0, r, dim(ICLAY, 0.85 + F.hv(k + 6) * 0.2), hh / 2 - 0.04, 'mud'); F.cyl(a, hh - 0.12, 0, r * 0.45, 0.12, dim(ICLAY, 0.8)); } },
    cesto(F, it) { const { w, d, h } = it; F.cyl(-w * 0.22, 0, 0, Math.min(d / 2, w / 4) - 0.02, h * 0.7, ISTRAW, 'wicker'); F.cyl(w * 0.24, 0, 0.03, Math.min(d / 2, w / 4) - 0.06, h * 0.5, dim(ISTRAW, 0.9), 'wicker'); },
    lenha(F, it) { const { w, d, h } = it; const rows = Math.max(2, Math.round(h / 0.15)), per = Math.max(2, Math.round(d / 0.15)); for (let j = 0; j < rows; j++) for (let k = 0; k < per; k++) { const n = -d / 2 + d * (k + 0.5) / per + (j % 2 ? 0.035 : 0); if (Math.abs(n) > d / 2 - 0.05) continue;
      F.log(-w / 2 + 0.02, 0.07 + j * 0.13, n, w / 2 - 0.02, 0.07 + j * 0.13, n, 0.065, dim(IWOOD, 0.85 + F.hv(j * 7 + k) * 0.25), 'bark'); } },
    tear(F, it) { const { w, d, h } = it; for (const e of [-1, 1]) F.box(e * (w / 2 - 0.05), 0, -d / 2 + 0.1, 0.08, h, 0.08, IDARK, 'beam'); for (const y of [0.3, h - 0.1]) F.box(0, y, -d / 2 + 0.1, w, 0.08, 0.1, IWOOD, 'beam');
      F.box(0, 0.42, -d / 2 + 0.1, w - 0.22, h - 0.6, 0.015, F.hv(2) < 0.5 ? [176, 70, 54] : [72, 104, 150], 'linen'); F.box(0, 0, d / 2 - 0.18, w * 0.6, 0.45, 0.3, IWOOD, 'plankH'); },
    baia(F, it, cx) { const { w, d, h } = it; F.box(0, 0, 0, w, 0.04, d, dim(IWOOD, 0.8), 'plankH'); F.box(0, 0, -d / 2 + 0.03, w, Math.min(1, h), 0.06, IWOOD, 'plankH'); for (const e of [-1, 1]) F.box(e * (w / 2 - 0.03), 0, 0, 0.06, Math.min(1, h), d, IWOOD, 'plankH');
      // (the sacks heaped in the bay, as many as it holds: rows of three, a second layer over the first)
      const n = cx && Number.isFinite(cx.fill) ? Math.round(G.clamp(cx.fill, 0, 1) * 6) : 0;
      for (let q = 0; q < n; q++) { const row = Math.floor(q / 3) % 2, i = q % 3; F.sph(-w / 2 + 0.36 + (w - 0.72) * i / 2, 0.24 + row * 0.36, -d / 2 + 0.38 + row * 0.12, 0.26, dim(ILINEN, 0.82 + F.hv(q) * 0.12), 0.2, 'linen'); } },
    prateleira(F, it, cx) { FURN.despensa(F, it, cx); },
    tulha(F, it, cx) { const { w, d, h } = it; F.box(0, 0, 0, w, h - 0.05, d, IWOOD, 'plankV'); F.box(0, h - 0.05, 0, w + 0.04, 0.05, d + 0.04, IDARK, 'plankH');
      // (the grain up to how full it is — a bin of the people's stock shows its share —; told nothing, near the top)
      const f = cx && Number.isFinite(cx.fill) ? G.clamp(cx.fill, 0, 1) : 1; if (f > 0.01) F.box(0, 0.06 + (h - 0.14) * f, 0, w - 0.1, 0.02, d - 0.1, [214, 186, 120]); },
    pipas(F, it) { const { w, d, h } = it; for (const e of [-1, 1]) F.box(0, 0, e * (d / 2 - 0.08), w, 0.12, 0.08, IDARK, 'beam'); const r = Math.min(h / 2 - 0.08, w / 4 - 0.02);
      for (const e of [-1, 1]) F.log(e * w / 4, 0.12 + r, -d / 2 + 0.04, e * w / 4, 0.12 + r, d / 2 - 0.04, r, IWOOD, 'plankV'); },
    'mesa-conferencia'(F, it) { const { w, d, h } = it; FURN.mesa(F, it); F.box(w * 0.25, h, -0.05, 0.03, 0.4, 0.03, IIRON, 'iron'); F.box(w * 0.25, h + 0.38, -0.05, 0.4, 0.02, 0.02, IIRON, 'iron'); for (const e of [-1, 1]) F.cyl(w * 0.25 + e * 0.18, h + 0.18, -0.05, 0.07, 0.02, [168, 136, 70]);
      F.box(-w * 0.2, h, 0.02, 0.3, 0.02, 0.22, [200, 184, 150]); },
    banca(F, it) { const { w, d, h } = it; F.box(0, 0, d / 2 - 0.025, w, h - 0.05, 0.05, IWOOD, 'plankV'); F.legs(w, d, h - 0.05, 0.035, IDARK); F.box(0, h - 0.05, 0, w, 0.05, d, IWOOD, 'plankH');
      for (let k = 0; k < 3; k++) F.cyl(-w / 2 + w * (k + 0.5) / 3, h, 0, 0.16, 0.1, k === 1 ? ISTRAW : dim(ISTRAW, 0.85), 'wicker'); },
    balcao(F, it) { const { w, d, h } = it; F.box(0, 0, 0, w, h - 0.05, d - 0.06, IWOOD, 'plankV'); F.box(0, h - 0.05, 0, w + 0.06, 0.05, d, IDARK, 'plankH'); },
    // (a shop's little stall: a banca of its own size)
    banquinha(F, it) { FURN.banca(F, it); },
    // (a board on two brackets against the wall, a hand and a half up: a pot, a bowl on it)
    'prateleira-parede'(F, it) { const { w, d, h } = it; for (const e of [-1, 1]) F.box(e * (w / 2 - 0.1), 0, -d / 2 + 0.03, 0.035, 0.11, 0.06, IDARK, 'beam'); F.box(0, 0.11, 0, w, 0.03, d, IWOOD, 'plankH');
      F.cyl(-w * 0.22, 0.14, 0, 0.07, Math.min(0.14, h - 0.16), ICLAY, 'mud'); F.cyl(w * 0.18, 0.14, 0.01, 0.1, 0.05, dim(ICLAY, 0.85), 'mud'); },
    // (a rail of pegs high on the wall, the baskets hung from it on their cords)
    'cesto-pendurado'(F, it) { const { w, d, h } = it; F.box(0, h - 0.06, -d / 2 + 0.03, w, 0.06, 0.06, IDARK, 'beam'); const n = w > 0.6 ? 2 : 1;
      for (let k = 0; k < n; k++) { const a = n === 1 ? 0 : (k ? 1 : -1) * w / 4; const r = Math.min(d / 2 - 0.02, w / n / 2 - 0.03); const hb = h * (0.5 + F.hv(k) * 0.12);
        F.cyl(a, 0.02, 0.02, r, hb, dim(ISTRAW, 0.9 + F.hv(k + 2) * 0.15), 'wicker'); F.box(a, hb, -d / 2 + 0.06, 0.012, h - 0.06 - hb, 0.012, [120, 104, 76], 'rope'); } },
    // (a loading pallet: planks laid on three battens, a hand off the floor)
    estrado(F, it) { const { w, d, h } = it; for (const e of [-1, 0, 1]) F.box(e * (w / 2 - 0.06), 0, 0, 0.09, h - 0.05, d, IDARK, 'beam'); const n = Math.max(3, Math.round(d / 0.16));
      for (let k = 0; k < n; k++) F.box(0, h - 0.05, -d / 2 + d * (k + 0.5) / n, w, 0.05, d / n - 0.02, dim(IWOOD, 0.88 + F.hv(k) * 0.18), 'plankH'); },
    bancada(F, it) { const { w, d, h } = it; F.legs(w, d, h - 0.08, 0.045, IDARK); F.box(0, h - 0.08, 0, w, 0.08, d, IWOOD, 'plankH'); F.box(0, 0.15, 0, w - 0.1, 0.03, d - 0.1, dim(IWOOD, 0.85), 'plankH');
      F.log(-w * 0.25, h + 0.03, 0.05, -w * 0.25 + 0.28, h + 0.03, 0.05, 0.02, IDARK); F.box(-w * 0.25 + 0.3, h, 0.05, 0.12, 0.07, 0.07, IWOOD); F.box(w * 0.3, h, -0.05, 0.22, 0.1, 0.12, IIRON, 'iron'); },
    'forja-fogo'(F, it, cx) { const { w, d, h } = it; F.box(0, 0, 0, w, h - 0.1, d, ISTONE, 'stone'); F.box(0, h - 0.1, 0, w * 0.55, 0.06, d * 0.55, IEMBER); F.box(0, h - 0.1, -d / 2 + 0.1, w, 0.25, 0.2, dim(ISTONE, 0.9), 'stone');
      const hy = Math.min(cx.ceil - 0.3, h + 0.8); F.box(0, hy, -0.05, w * 0.85, 0.3, d * 0.8, dim(ISTONE, 0.85), 'stone'); if (cx.ceil > hy + 0.31) F.box(0, hy + 0.3, -d / 2 + 0.2, 0.4, cx.ceil - hy - 0.3, 0.4, dim(ISTONE, 0.8), 'stone');
      F.box(-w / 2 + 0.2, h - 0.1, d / 2 - 0.14, 0.3, 0.14, 0.24, [112, 82, 60], 'leather'); },
    bigorna(F, it) { F.cyl(0, 0, 0, 0.2, 0.5, IWOOD, 'bark'); F.box(0, 0.5, 0, 0.42, 0.17, 0.16, IIRON, 'iron'); F.box(0.2, 0.58, 0, 0.14, 0.07, 0.09, IIRON, 'iron'); },
    tina(F, it) { const { w, h } = it; F.cyl(0, 0, 0, w / 2 - 0.02, h, IWOOD, 'plankV'); F.cyl(0, h - 0.08, 0, w / 2 - 0.05, 0.01, [52, 70, 82]); },
    'roda-oleiro'(F, it) { F.cyl(0, 0.04, 0, 0.32, 0.07, IWOOD, 'plankH'); F.cyl(0, 0.1, 0, 0.03, 0.52, IDARK); F.cyl(0, 0.62, 0, 0.18, 0.04, IWOOD); F.cyl(0, 0.66, 0, 0.09, 0.12, ICLAY, 'mud'); },
    'forno-olaria'(F, it) { const { w, h } = it; F.cyl(0, 0, 0, w / 2 - 0.02, h * 0.32, ISTONE, 'stone'); F.sph(0, h * 0.5, 0, w / 2 - 0.05, ICLAY, h * 0.5, 'mud'); F.box(0, 0.1, w / 2 - 0.12, 0.36, 0.34, 0.2, [40, 32, 28]); },
    secador(F, it) { const { w, d, h } = it; for (const e of [-1, 1]) F.box(e * (w / 2 - 0.03), 0, 0, 0.05, h, d, IDARK, 'beam'); for (const y of [0.3, 0.75, 1.2]) { F.box(0, y, 0, w - 0.06, 0.03, d, IWOOD, 'plankH'); for (let k = 0; k < 4; k++) F.cyl(-w / 2 + 0.22 + (w - 0.44) * k / 3, y + 0.03, 0, 0.08, 0.16, ICLAY, 'mud'); } },
    'bancada-ourives'(F, it) { FURN.bancada(F, it); },
    fornalha(F, it) { const { w, h } = it; F.cyl(0, 0, 0, w / 2 - 0.02, h, ISTONE, 'stone'); F.box(0, 0.12, w / 2 - 0.08, 0.2, 0.22, 0.12, IEMBER); },
    cepo(F, it) { const { w, h } = it; F.cyl(0, 0, 0, w / 2 - 0.04, h, dim(IWOOD, 0.85), 'bark'); F.box(0.05, h, 0, 0.26, 0.02, 0.12, IIRON, 'iron', 0.4); },
    ganchos(F, it) { const { w, d, h } = it; F.box(0, h - 0.08, -d / 2 + 0.1, w, 0.08, 0.08, IDARK, 'beam'); for (let k = 0; k < 4; k++) { const a = -w / 2 + w * (k + 0.5) / 4; F.box(a, h - 0.3, -d / 2 + 0.1, 0.015, 0.22, 0.015, IIRON, 'iron');
      if (F.hv(k) < 0.75) F.sph(a, h - 0.62, -d / 2 + 0.12, 0.13, [150, 70, 60], 0.32, 'leather'); } },
    'mesa-escriba'(F, it) { const { w, d, h } = it; FURN.mesa(F, it); for (let k = 0; k < 3; k++) F.log(-w * 0.3 + k * 0.12, h + 0.03, -0.1, -w * 0.3 + k * 0.12, h + 0.03, 0.14, 0.025, [214, 200, 164]); F.cyl(w * 0.3, h, -0.12, 0.04, 0.06, [40, 34, 30]); },
    cofre(F, it) { const { w, d, h } = it; F.box(0, 0, 0, w, h, d, IDARK, 'plankH'); for (const e of [-1, 0, 1]) F.box(e * w * 0.35, 0, 0, 0.05, h + 0.01, d + 0.015, IIRON, 'iron'); F.box(0, h * 0.55, d / 2, 0.1, 0.12, 0.03, [168, 136, 70]); },
    redes(F, it) { const { w, d, h } = it; F.box(0, h - 0.06, -d / 2 + 0.06, w, 0.06, 0.06, IDARK, 'beam'); F.box(0, 0.5, -d / 2 + 0.08, w - 0.1, h - 0.6, 0.03, [150, 140, 110], 'rope'); F.cyl(-w * 0.25, 0, 0.05, 0.18, 0.4, ISTRAW, 'wicker'); F.cyl(w * 0.25, 0, 0.05, 0.16, 0.32, ISTRAW, 'wicker'); },
    entulho(F, it) { const { w, d, h } = it; for (let k = 0; k < 6; k++) F.box((F.hv(k) - 0.5) * w * 0.8, 0, (F.hv(k + 9) - 0.5) * d * 0.8, 0.2 + F.hv(k + 3) * 0.3, h * (0.3 + F.hv(k + 5) * 0.7), 0.2 + F.hv(k + 7) * 0.3, dim(ISTONE, 0.75 + F.hv(k + 11) * 0.3), 'rock', F.hv(k + 13) * 3); },
    // ---- the temple (int-civicos.js): the god's image on its plinth, the altar, the benches and the mats of the faithful, a lamp
    idolo(F, it) { const { w, d, h } = it; const ph = Math.min(0.7, h * 0.3); F.box(0, 0, 0, w, ph, d, ISTONE, 'stone'); F.box(0, ph - 0.06, 0, w + 0.04, 0.06, d + 0.04, dim(ISTONE, 0.9), 'stone');
      const s = h - ph; F.cyl(0, ph, -0.02, Math.min(w, d) * 0.3, s * 0.62, IGOLD); F.box(0, ph + s * 0.5, -0.02, Math.min(w * 0.7, 0.56), s * 0.14, Math.min(d * 0.5, 0.3), IGOLD);
      F.sph(0, ph + s * 0.74, -0.02, Math.min(w, d) * 0.2, IGOLD, Math.min(w, d) * 0.22); F.cyl(0, ph + s * 0.86, -0.02, Math.min(w, d) * 0.12, s * 0.12, dim(IGOLD, 0.85)); },
    altar(F, it) { const { w, d, h } = it; F.box(0, 0, 0, w - 0.06, h - 0.07, d - 0.06, ISTONE, 'stone'); F.box(0, h - 0.07, 0, w, 0.07, d, dim(ISTONE, 1.06), 'stone');
      F.cyl(0, h, 0.04, 0.12, 0.06, dim(IGOLD, 0.9)); for (const e of [-1, 1]) { F.cyl(e * (w / 2 - 0.12), h, -0.1, 0.03, 0.14, ILINEN); F.cyl(e * (w / 2 - 0.12), h + 0.14, -0.1, 0.012, 0.03, IEMBER); } },
    'banco-fieis'(F, it) { FURN.banco(F, it); },
    'esteira-oracao'(F, it) { const { w, d, h } = it; F.box(0, 0, 0, w, Math.max(0.015, h - 0.01), d, IRUG, 'wool'); F.box(0, 0.002, 0, w - 0.12, Math.max(0.016, h - 0.008), d - 0.12, dim(IRUG, 1.25), 'wool'); },
    lampadario(F, it) { const { w, h } = it; F.cyl(0, 0, 0, w * 0.38, 0.05, IIRON, 'iron'); F.cyl(0, 0.05, 0, 0.022, h - 0.16, IIRON, 'iron'); F.cyl(0, h - 0.11, 0, w * 0.28, 0.05, IIRON, 'iron'); F.cyl(0, h - 0.06, 0, 0.03, 0.05, IEMBER); },
    // ---- the barracks: the cots, the weapons' rack, the training post
    catre(F, it) { const { w, d } = it; F.legs(w, d, 0.3, 0.03, IDARK); F.box(0, 0.3, 0, w, 0.05, d, IWOOD, 'plankH'); F.box(0, 0.35, 0.02, w - 0.08, 0.07, d - 0.12, ILINEN, 'linen');
      F.box(0, 0.42, d / 2 - 0.32, w - 0.1, 0.03, 0.4, F.hv(1) < 0.5 ? IWOOL : [118, 98, 72], 'wool'); },
    armeiro(F, it) { const { w, d, h } = it; for (const e of [-1, 1]) F.box(e * (w / 2 - 0.04), 0, -d / 2 + 0.06, 0.07, h, 0.07, IDARK, 'beam'); for (const y of [0.25, h * 0.55, h - 0.12]) F.box(0, y, -d / 2 + 0.06, w, 0.06, 0.06, IWOOD, 'beam');
      const n = Math.max(3, Math.floor(w / 0.22)); for (let k = 0; k < n; k++) { const a = -w / 2 + 0.16 + (w - 0.32) * k / (n - 1); F.log(a, 0.05, -d / 2 + 0.2, a, h - 0.16, -d / 2 + 0.1, 0.015, IDARK); F.box(a, h - 0.16, -d / 2 + 0.1, 0.03, 0.12, 0.012, IIRON, 'iron'); } },
    manequim(F, it) { const { w, h } = it; for (const r of [0, Math.PI / 2]) F.box(0, 0, 0, w, 0.08, 0.1, IDARK, 'beam', r); F.cyl(0, 0.08, 0, 0.06, h - 0.1, IWOOD, 'bark'); F.box(0, h * 0.72, 0, w * 0.95, 0.07, 0.08, IWOOD, 'beam');
      F.sph(0, h * 0.42, 0, 0.17, ISTRAW, 0.24, 'wicker'); F.sph(0, h - 0.12, 0, 0.11, ISTRAW, 0.11, 'wicker'); },
    // ---- the jail: the straw to sleep on, the bucket, the board of the keys
    palha(F, it) { const { w, d, h } = it; F.box(0, 0, 0, w, Math.max(0.03, h - 0.04), d, ISTRAW, 'wicker');
      for (let k = 0; k < 4; k++) { const r = Math.min(w, d) * (0.16 + F.hv(k + 8) * 0.06); F.sph((F.hv(k) - 0.5) * (w - 2 * r - 0.04), h * 0.5, (F.hv(k + 4) - 0.5) * (d - 2 * r - 0.04), r, dim(ISTRAW, 0.9 + F.hv(k + 2) * 0.15), h * 0.45, 'wicker'); } },
    balde(F, it) { const { w, h } = it; const r = w / 2 - 0.03; F.cyl(0, 0, 0, r, h - 0.08, IWOOD, 'plankV'); for (const y of [0.05, h - 0.16]) F.cyl(0, y, 0, r + 0.006, 0.02, IIRON, 'iron');
      F.log(-r, h - 0.08, 0, 0, h - 0.01, 0, 0.008, IIRON); F.log(0, h - 0.01, 0, r, h - 0.08, 0, 0.008, IIRON); },
    chaves(F, it) { const { w, d, h } = it; F.box(0, 0, -d / 2 + 0.02, w, h, 0.03, IWOOD, 'plankH'); for (let k = 0; k < 4; k++) { const a = -w / 2 + 0.1 + (w - 0.2) * k / 3; F.box(a, h * 0.7, -d / 2 + 0.05, 0.015, 0.015, 0.04, IIRON, 'iron'); if (F.hv(k) < 0.8) F.box(a, h * 0.38, -d / 2 + 0.06, 0.035, 0.16, 0.012, dim(IGOLD, 0.7), 'iron'); } },
    // ---- the baths: the pool one goes down into, the tub, the furnace, the pegs for the clothes
    piscina(F, it) { const { w, d, h } = it; const t = 0.16; F.box(0, 0, 0, w - 2 * t, 0.03, d - 2 * t, dim(ISTONE, 1.1), 'tile');
      for (const e of [-1, 1]) { F.box(0, 0, e * (d / 2 - t / 2), w, h, t, ISTONE, 'stone'); F.box(e * (w / 2 - t / 2), 0, 0, t, h, d - 2 * t, ISTONE, 'stone'); } F.box(0, h - 0.14, 0, w - 2 * t, 0.02, d - 2 * t, IWATER); },
    'tina-banho'(F, it) { const { w, d, h } = it; F.box(0, 0, 0, w, h - 0.04, d, IWOOD, 'plankV'); for (const y of [0.08, h - 0.16]) F.box(0, y, 0, w + 0.012, 0.03, d + 0.012, IIRON, 'iron'); F.box(0, h - 0.12, 0, w - 0.1, 0.02, d - 0.1, IWATER); },
    'fornalha-banho'(F, it) { const { w, d, h } = it; F.box(0, 0, 0, w, h, d, ISTONE, 'stone'); F.box(0, 0.1, d / 2 - 0.02, w * 0.45, 0.32, 0.03, [36, 30, 28]); F.box(0, 0.12, d / 2 - 0.04, w * 0.32, 0.12, 0.04, IEMBER);
      F.box(0, h - 0.04, 0, w + 0.04, 0.04, d + 0.04, dim(ISTONE, 0.9), 'stone'); },
    cabide(F, it) { const { w, d, h } = it; F.box(0, h - 0.08, -d / 2 + 0.03, w, 0.07, 0.05, IDARK, 'beam'); const n = Math.max(2, Math.round(w / 0.3));
      for (let k = 0; k < n; k++) { const a = -w / 2 + w * (k + 0.5) / n; F.box(a, h - 0.1, -d / 2 + 0.08, 0.02, 0.02, 0.07, IWOOD); if (F.hv(k) < 0.7) F.box(a, 0, -d / 2 + 0.1, w / n - 0.06, h - 0.12, 0.03, F.hv(k + 3) < 0.5 ? ILINEN : [156, 92, 70], 'linen'); } },
    // ---- the tavern's vat, the chief's seat, the court's fountain
    cuba(F, it) { const { w, h } = it; const r = w / 2 - 0.03; F.cyl(0, 0, 0, r, h - 0.05, IWOOD, 'plankV'); for (const y of [0.1, h * 0.5, h - 0.2]) F.cyl(0, y, 0, r + 0.008, 0.035, IIRON, 'iron'); F.cyl(0, h - 0.08, 0, r - 0.04, 0.02, [118, 72, 46]); },
    trono(F, it) { const { w, d, h } = it; F.box(0, 0, 0, w, 0.12, d, IDARK, 'plankH'); F.box(0, 0.12, 0.04, w - 0.12, 0.36, d - 0.14, IWOOD, 'plankV'); F.box(0, 0.48, 0.05, w - 0.16, 0.08, d - 0.2, IRUG, 'wool');
      F.box(0, 0.12, -d / 2 + 0.07, w, h - 0.12, 0.12, IWOOD, 'plankV'); F.box(0, h - 0.1, -d / 2 + 0.07, w + 0.06, 0.1, 0.16, dim(IGOLD, 0.85)); for (const e of [-1, 1]) F.box(e * (w / 2 - 0.05), 0.48, 0.02, 0.1, 0.32, d - 0.1, IDARK, 'beam'); },
    fonte(F, it) { const { w, h } = it; const r = w / 2 - 0.02; F.cyl(0, 0, 0, r, h - 0.1, ISTONE, 'stone'); F.cyl(0, h - 0.1, 0, r + 0.02, 0.06, dim(ISTONE, 1.08), 'stone'); F.cyl(0, h - 0.12, 0, r - 0.1, 0.02, IWATER);
      F.cyl(0, h - 0.1, 0, 0.09, 0.45, dim(ISTONE, 0.95), 'stone'); F.sph(0, h + 0.38, 0, 0.13, dim(ISTONE, 0.95), 0.07, 'stone'); },
  };
  B3.FURN = FURN; // (for the tests: the kinds the 3D knows how to draw)
  const FIRE_K = { lar: 1, fogao: 0.7, forno: 0.5, fogareiro: 0.45, braseiro: 0.6, 'forja-fogo': 1, 'forno-olaria': 0.6, fornalha: 0.5, 'fornalha-banho': 0.55 };
  // the door's leaf, apart, in its own frame: from its hinge (the origin) across the opening along +X, its foot at 0 — planks
  // with their battens on the room's side, the iron straps
  function leafParts(w, h, col) {
    const lw = w - 0.03, lh = h - 0.02; const out = [[lw / 2 + 0.015, 0.01, 0, lw, lh, 0.05, col, 'plankV']];
    for (const y of [0.25, lh / 2, lh - 0.35]) out.push([lw / 2 + 0.015, y, 0.04, lw - 0.1, 0.1, 0.03, dim(col, 0.85), 'plankH']);
    for (const y of [0.3, lh - 0.3]) out.push([lw * 0.36, y, -0.03, lw * 0.62, 0.04, 0.012, IIRON, 'iron']);
    return out;
  }
  function leafGeo(w, h, col) {
    const g = R3.Geo(); for (const [x, y, z, sx, sy, sz, c, pat] of leafParts(w, h, col)) { g.pat = PAT[pat] || 0; g.put(SH.box, R3.mat(x, y, z, 0, sx, sy, sz), c); }
    g.pat = 0; return g;
  }
  // (a grate — a cell's door: iron bars in a frame, in the same frame as a leaf)
  function gradeGeo(w, h) {
    const g = R3.Geo(); g.pat = PAT.iron; const lw = w - 0.03, lh = h - 0.02; const put = (x, y, sx, sy, sz) => g.put(SH.box, R3.mat(x, y, 0, 0, sx, sy, sz), IIRON);
    for (const x of [0.04, lw - 0.01]) put(x, 0.01, 0.05, lh, 0.05); for (const y of [0.04, lh * 0.5, lh - 0.05]) put(lw / 2 + 0.015, y, lw, 0.05, 0.04);
    const n = Math.max(3, Math.round(lw / 0.12)); for (let k = 1; k < n; k++) put(0.015 + lw * k / n, 0.01, 0.022, lh, 0.022);
    g.pat = 0; return g;
  }
  // a lid over a stair's hole, apart, in its own frame: its hinge along X at the origin, the lid out along +Z, its top at 0 —
  // boards across, two battens under them
  function lidGeo(w, d) {
    const g = R3.Geo(); const put = (x, y, z, sx, sy, sz, c, pat) => { g.pat = PAT[pat] || 0; g.put(SH.box, R3.mat(x, y, z, 0, sx, sy, sz), c); };
    put(0, -0.05, d / 2, w, 0.05, d, [140, 108, 74], 'plankH'); for (const e of [-0.3, 0.3]) put(e * w, -0.09, d / 2, 0.08, 0.04, d - 0.1, IDARK, 'beam'); put(0, 0, d - 0.12, 0.12, 0.008, 0.05, IIRON, 'iron');
    g.pat = 0; return g;
  }
  B3.interior = function (plan, b, o) {
    o = o || {}; if (!plan || !plan.levels || !plan.levels.length || !plan.shell) return null;
    const levels = plan.levels.slice().sort((p, q) => p.y - q.y); const fine = o.fine !== undefined ? !!o.fine : undefined; const fill = o.fill || null;
    const out = { lv: {}, roof: null, leaf: [], hatch: [], item: {}, light: [], cut: null, box: null, tris: 0 };
    const Ks = {}; let K0 = null;
    for (const l of levels) { const g = R3.Geo(); const K = kit(g, b, undefined, undefined, fine); g.ao = null; Ks[l.lv] = K; out.lv[l.lv] = g; if (!K0) K0 = K; }
    out.at = [K0.x0, K0.y0, K0.z0]; // (the plan's origin in the world: the lot's corner, the plinth's top)
    const sh = plan.shell; const round = sh.kind === 'round';
    // (what the outside draws, from the same shell: the steps outside it; a terrace's walls)
    const outSteps = new Set(outOfPlan(plan).steps);
    // (the storey under another: the one whose area its own lies over, highest first)
    const under = l => { let best = null; for (const q of levels) if (q.y < l.y - 0.01 && clipR(q.area, l.area) && (!best || q.y > best.y)) best = q; return best; };
    for (const l of levels) {
      const K = Ks[l.lv]; const g = out.lv[l.lv];
      inFloor(K, plan, l, under(l));
      for (const w of plan.walls) if (w.lv === l.lv && l.kind !== 'terraco') inWall(K, plan, w, l);
      if (round && l.lv === levels[0].lv) inRing(K, plan, l);
      for (const s of plan.stairs) if ((s.kind === 'degraus' ? s.lv1 : s.lv0) === l.lv && !outSteps.has(s)) inStair(K, plan, s);
      for (const it of plan.items) {
        if (it.lv !== l.lv) continue; const from = g.p.length / 3; const foot = l.y + (it.y || 0) + FLOOR_UP; const F = piece(K, it, foot);
        // (the ceiling a piece reaches up to from its foot — a hood, a flue: the storey's own, or the eaves)
        const ceil = Math.min(l.y + l.h, sh.eave) - foot;
        const f = FURN[it.kind]; if (f) f(F, it, { ceil, fill: fill ? fill[it.id] : undefined }); else F.box(0, 0, 0, it.w, it.h, it.d, IWOOD, 'plankH');
        out.item[it.id] = [l.lv, from, g.p.length / 3];
        if (it.fire) out.light.push([K.x0 + it.x, K.y0 + l.y + (it.y || 0) + Math.min(it.h, 0.6), K.z0 + it.z, FIRE_K[it.kind] || 0.5]);
      }
    }
    { const g = R3.Geo(); const K = kit(g, b, undefined, undefined, fine); g.ao = null; inRoof(K, plan);
      // (an annex's lean-to, its ceiling at its own height — the room on a terrace is the outside's, whole)
      K.as('beam', () => { for (const a of sh.annex || []) { const l = levels.find(q => q.lv === (a.lv || 0)) || levels[0]; flatQ(K, a.r, l.y + a.h, dim(IWOOD, 0.9), -1); } });
      out.roof = g; }
    // the leaves of the doors, shut where the plan has them, to turn as the world has them
    const TLm = TL();
    for (const d of plan.doors) {
      if (d.kind === 'vao') continue; const w = plan.walls[d.wall]; const l = w && levels.find(q => q.lv === w.lv); if (!l) continue;
      const ax = w.b[0] - w.a[0], az = w.b[1] - w.a[1]; const L = Math.hypot(ax, az) || 1; const nx = -az / L, nz = ax / L;
      // (it swings into its first room: the house's for a street door, the hall's for the door into an annex)
      let sg = w.outer ? sideIn(plan, w, l) : 1;
      { const m = plan.rooms.find(q => q.id === d.rooms[0]); if (m) { const cx = (m.r[0] + m.r[2]) / 2 - (w.a[0] + w.b[0]) / 2, cz = (m.r[1] + m.r[3]) / 2 - (w.a[1] + w.b[1]) / 2; sg = cx * nx + cz * nz >= 0 ? 1 : -1; } }
      // (turning by +θ carries the free end along (uz, −ux): toward the room, or the other way — leafPose; the foot at the sill)
      const hole = plan.holes.find(h => h.door === d.id); const ps = leafPose(w, Object.assign({}, d, { sill: hole ? hole.sill || 0 : d.sill || 0 }), l, sg);
      out.leaf.push({ id: d.id, lv: w.lv, at: [b.x * TLm + ps.hx, K0.y0 + ps.y, b.y * TLm + ps.hz], yaw: ps.yaw, swing: ps.swing, w: d.w, h: d.h, g: d.kind === 'grade' ? gradeGeo(d.w, d.h) : leafGeo(d.w, d.h, (K0.P && K0.P.door) || '#5a3b25') });
    }
    // the lids over the holes the stairs come up through, shut — hinged along the hole's edge at the stair's top
    for (const s of plan.stairs) {
      const l = s.hole && levels.find(q => q.lv === s.lv1); if (!l) continue; const r = s.hole, dx = s.dir[0], dz = s.dir[1];
      const w = dx ? r[3] - r[1] : r[2] - r[0], d = dx ? r[2] - r[0] : r[3] - r[1];
      // (the hinge: the middle of the far edge along the climb; the lid lies back from it, against the climb)
      const hx = dx ? (dx > 0 ? r[2] : r[0]) : (r[0] + r[2]) / 2, hz = dz ? (dz > 0 ? r[3] : r[1]) : (r[1] + r[3]) / 2;
      out.hatch.push({ id: s.id, lv: s.lv1, at: [b.x * TL() + hx, K0.y0 + l.y + FLOOR_UP, b.y * TL() + hz], yaw: Math.atan2(-dx, -dz), w, d, g: lidGeo(w, d) });
    }
    // (the room inside the outer walls, where the outside's own faces give way to these; and all of it)
    const ylo = levels[0].y - 0.3; let yhi = sh.eave + Math.max(0.3, ((sh.roof && sh.roof.h) || 0) + 0.3);
    for (const l of levels) yhi = Math.max(yhi, l.y + l.h + 0.3);
    const X0 = b.x * TLm, Z0 = b.y * TLm, Y0 = K0.y0;
    if (round) { const ri = sh.r - sh.t; out.cut = { round: 1, at: [X0 + sh.cx, Z0 + sh.cz], r: ri - 0.02, y: [Y0 + ylo, Y0 + sh.eave + 0.05] }; out.box = [X0 + sh.cx - sh.r, Y0 + ylo, Z0 + sh.cz - sh.r, X0 + sh.cx + sh.r, Y0 + yhi, Z0 + sh.cz + sh.r]; }
    else { const I = [sh.r[0] + sh.t, sh.r[1] + sh.t, sh.r[2] - sh.t, sh.r[3] - sh.t]; out.cut = { at: [X0 + I[0] + 0.02, Y0 + ylo, Z0 + I[1] + 0.02, X0 + I[2] - 0.02, Y0 + sh.eave + 0.05, Z0 + I[3] - 0.02] }; out.box = [X0 + sh.r[0], Y0 + ylo, Z0 + sh.r[1], X0 + sh.r[2], Y0 + yhi, Z0 + sh.r[3]]; }
    for (const k in out.lv) out.tris += out.lv[k].p.length / 9; out.tris += out.roof.p.length / 9; for (const f of out.leaf.concat(out.hatch)) out.tris += f.g.p.length / 9;
    return out;
  };
  // ------------------------------ the outside from the shell ------------------------------
  // A building with a plan is drawn outside from its shell — Interiors.shellOf from afar, the plan's own once it is made:
  // the same shell, so a building does not change as one comes to it. The four sides of the shell from its foot to its
  // eaves, each storey's band in its own stuff (the half-timber of an upper storey over a ground floor of adobe), cut round
  // the doors, windows and arches of its walls: the reveals into the wall — in to the pane in its middle, through it for a
  // door or an arch —, the pane, a door's leaf shut on the room's side where the inside hangs it, the dark of an arch; the
  // people's dressing (the socle, the storeys' bands, the cornice, the timbers of the half-timber, the frames, sills and
  // shutters, the door's frame and its step); the stones it stands on, or the posts of a raised floor; an annex's sides
  // and its lean-to; the court's sides; the roof of the shell's kind, pitch and ridge (the people's own, roofOf), open over
  // the court; a terrace's parapet and the room on it; the steps from the ground to a raised door. Nothing of it stands
  // inside the walls — there the inside is (Build3D.interior), when it is drawn —, so the two meet at the walls and never
  // fight: only a door's own opening and the court are the inside's then (Build3D.cuts: the outside's copy put aside)
  const ROOFK = { 'duas-aguas': 'gable', 'quatro-aguas': 'hip', plano: 'flat', turfa: 'turf', palha: 'thatch', 'palha-conica': 'thatch' };
  const OUTPAT = { tabua: 'plankV', taipa: 'mud', adobe: 'mud', 'adobe-caiado': 'whitewash', 'adobe-estuque': 'stucco', reboco: 'plaster', 'pau-a-pique': 'mud', pedra: 'stone', enxaimel: 'plaster' };
  const SIDEO = { S: [0, 1], N: [0, -1], E: [1, 0], W: [-1, 0] };
  const NCLS = { temple: 2, palacio: 3, paco: 3, quartel: 2, taverna: 2, administracao: 2, coletoria: 1, biblioteca: 2, insula: 2, sobrado: 2 };
  const FLUE = { fogao: 1, 'forja-fogo': 1, forno: 1, fornalha: 1, 'forno-olaria': 1 }; // (the fires with a flue: a chimney over them)
  const inRect = (r, x, z, m) => x > r[0] + (m || 0) && x < r[2] - (m || 0) && z > r[1] + (m || 0) && z < r[3] - (m || 0);
  // (the shell as the outside reads it — the same from the plan and from Interiors.shellOf: the walls the shell raises, their
  // openings, the steps outside it, its fires; walls and doors by their ids)
  const outMemo = new WeakMap();
  const outsideShell = (sh, s) => { const cx = (s.r[0] + s.r[2]) / 2, cz = (s.r[1] + s.r[3]) / 2; return sh.kind === 'round' ? Math.hypot(cx - sh.cx, cz - sh.cz) > sh.r : !inRect(sh.r, cx, cz); };
  function outOfPlan(p) {
    let S = outMemo.get(p); if (S) return S;
    const kindOf = new Map(p.levels.map(l => [l.lv, l.kind])); const marked = p.walls.some(w => w.shell);
    const walls = p.walls.filter(w => kindOf.get(w.lv) !== 'porao' && (marked ? w.shell : w.outer || kindOf.get(w.lv) === 'terraco'));
    const ids = new Set(walls.map(w => w.id)); const sh = p.shell;
    S = { shell: sh, levels: p.levels, walls, holes: p.holes.filter(h => ids.has(h.wall)), doors: p.doors, rooms: p.rooms, entrance: p.entrance,
      steps: p.stairs.filter(s => s.kind === 'degraus' && outsideShell(sh, s)), items: [], p };
    S.byId = new Map(p.walls.map(w => [w.id, w])); outMemo.set(p, S); return S;
  }
  function outOfShell(s, p) {
    let S = outMemo.get(s); if (S && S.p === p) return S;
    const kindOf = new Map(s.levels.map(l => [l.lv, l.kind])); const walls = (s.walls || []).filter(w => kindOf.get(w.lv) !== 'porao'); const ids = new Set(walls.map(w => w.id));
    // (the steps outside it: the shell's own; a door's hinge and the room it swings into, the plan's once made)
    const P0 = p && p.ok ? outOfPlan(p) : null;
    S = { shell: s.shell, levels: s.levels, walls, holes: (s.holes || []).filter(h => ids.has(h.wall)), doors: P0 ? P0.doors : null, rooms: P0 ? P0.rooms : null, entrance: s.entrance,
      steps: (s.steps || (P0 ? P0.steps : [])).filter(q => q.kind === 'degraus' && outsideShell(s.shell, q)), items: [], p };
    S.byId = new Map((s.walls || []).map(w => [w.id, w])); outMemo.set(s, S); return S;
  }
  // the shell a building is drawn from outside — Interiors.shellOf (cheap, from afar), else its plan once made (Space's, or
  // Interiors' cache: nothing is made here) — or null: the old drawing (a building going up, a ruin, a type without plans)
  // (kept by building while its record is the same and its plan as it was: a chunk drawn again does not ask again)
  let shellMemo = new Map(); G.worldHooks.push(() => { shellMemo = new Map(); });
  B3.shellOf = function (b) {
    const In = G.Interiors; if (!In || !In.has || !b || !b.built || b.type === 'ruin' || !In.has(b)) return null;
    const p = G.Space.planMade ? G.Space.planMade(b) : In.ready && In.ready(b) ? In.plan(b) : null;
    const k = (In.keyOf ? In.keyOf(b) : b.type + ':' + (b.ip ? b.ip.r + ':' + b.ip.f + ':' + b.ip.s + ':' + (b.ip.fx || []).length : '')); const m = shellMemo.get(b.id);
    if (m && m.k === k && m.p === p) return m.S;
    const s = In.shellOf ? In.shellOf(b) : p && p.ok && In.shellOfPlan ? In.shellOfPlan(p) : null;
    const S = s && s.shell && s.levels && s.levels.length ? outOfShell(s, p) : p && p.ok && p.shell && p.levels && p.levels.length ? outOfPlan(p) : null;
    shellMemo.set(b.id, { k, p, S }); if (shellMemo.size > 4000) shellMemo.delete(shellMemo.keys().next().value);
    return S;
  };
  // (what makes a building's outside change: its shell's record — a number for the chunk's signature)
  B3.shellSig = function (b) {
    const In = G.Interiors; if (!In || !In.has || !b.built || b.type === 'ruin' || !In.has(b)) return 0;
    if (!In.shellOf && !(G.Space.planMade ? G.Space.planMade(b) : In.ready && In.ready(b))) return 0;
    const k = In.keyOf ? In.keyOf(b) : (b.ip ? b.ip.r + ':' + b.ip.f + ':' + b.ip.s + ':' + (b.ip.fx || []).length : ''); let h = 7;
    for (let i = 0; i < k.length; i++) h = (Math.imul(h, 31) + k.charCodeAt(i)) | 0;
    // (an open shell shows its plan's pieces: drawn again once they are there)
    const S = B3.shellOf(b); if (S && S.shell.kind === 'aberta' && S.p) h = (Math.imul(h, 31) + 1) | 0;
    return h || 1;
  };
  // (a side of a rectangle: its line, the way out of it, its run — u from its west or north end — and a point on it: u along,
  // y up, n out of its line)
  function rside(r, sd) {
    const ax = sd === 'N' || sd === 'S', o = SIDEO[sd]; const line = sd === 'N' ? r[1] : sd === 'S' ? r[3] : sd === 'W' ? r[0] : r[2];
    return { sd, ax, o, line, u0: ax ? r[0] : r[1], u1: ax ? r[2] : r[3], out: [o[0], 0, o[1]], P: (u, y, n) => (ax ? [u, y, line + o[1] * n] : [line + o[0] * n, y, u]) };
  }
  // (the side of a wall of the shell that is out — its outer face's line —, for a wall not on the shell's rectangle: the
  // straight piece of a round hut)
  function wside(w, out) {
    const ax = Math.abs(w.b[1] - w.a[1]) < 1e-3; const o = ax ? [0, out] : [out, 0]; const line = (ax ? w.a[1] : w.a[0]) + out * w.t / 2;
    const u0 = ax ? Math.min(w.a[0], w.b[0]) : Math.min(w.a[1], w.b[1]), u1 = ax ? Math.max(w.a[0], w.b[0]) : Math.max(w.a[1], w.b[1]);
    return { sd: ax ? (out > 0 ? 'S' : 'N') : (out > 0 ? 'E' : 'W'), ax, o, line, u0: u0 - w.t / 2, u1: u1 + w.t / 2, out: [o[0], 0, o[1]], P: (u, y, n) => (ax ? [u, y, line + o[1] * n] : [line + o[0] * n, y, u]) };
  }
  // (a wall of the shell on a side: along it, its outer face on the side's line, over part of its run)
  function wallOn(w, F) {
    const along = F.ax ? Math.abs(w.b[1] - w.a[1]) < 1e-3 : Math.abs(w.b[0] - w.a[0]) < 1e-3; if (!along) return false;
    const face = (F.ax ? w.a[1] : w.a[0]) + (F.ax ? F.o[1] : F.o[0]) * w.t / 2; if (Math.abs(face - F.line) > 0.03) return false;
    const a = F.ax ? Math.min(w.a[0], w.b[0]) : Math.min(w.a[1], w.b[1]), b = F.ax ? Math.max(w.a[0], w.b[0]) : Math.max(w.a[1], w.b[1]);
    return b > F.u0 + 0.05 && a < F.u1 - 0.05;
  }
  // (what a wall of the shell is made of outside: the people's own colour for the shell's stuff, another stuff's own colour —
  // the half-timber over the adobe —, the north's weathered planks)
  function outStuff(K, S, w) {
    const m = (w && w.mat) || S.shell.mat; const P = K.P; const main = m === S.shell.mat;
    let col = main ? (K.b.v === 2 ? P.wr : P.wl) || '#efe2c4' : inMat(m)[1];
    if (m === 'tabua' && K.st === 'nordico') col = nordWood(K).wall;
    if (m === 'enxaimel') col = mixc(col, [244, 236, 214], 0.25);
    return { pat: OUTPAT[m] || 'plaster', col: rgbOf(col), mat: m, frame: m === 'enxaimel' };
  }
  // (the bands of stuff up a side: each wall's from its storey's foot — the slab under it with it — to its top; the stuff
  // below where no wall says)
  function stuffBands(K, ctx, ws, ya, yb) {
    const marks = ws.map(w => { const l = ctx.byLv.get(w.lv); return [w.lv === ctx.l0.lv ? ya : l.y - (l.slab || 0), w.h ? l.y + w.h : null, w]; }).sort((p, q) => p[0] - q[0]);
    const out = []; let y = ya; const shellSt = outStuff(K, ctx.S, null);
    for (let k = 0; k < marks.length && y < yb - 1e-3; k++) {
      const [a, b0, w] = marks[k]; const nx = marks[k + 1]; const b = Math.min(yb, b0 !== null ? b0 : nx ? nx[0] : yb);
      if (a > y + 1e-3) { out.push([y, Math.min(a, yb), out.length ? out[out.length - 1][2] : shellSt]); y = Math.min(a, yb); }
      const lo = Math.max(y, a); if (b > lo + 1e-3) { out.push([lo, b, outStuff(K, ctx.S, w)]); y = b; }
    }
    if (y < yb - 1e-3) out.push([y, yb, out.length ? out[out.length - 1][2] : shellSt]);
    return out;
  }
  // (rectangles of a side's face — u along, y up — at n out of its line, turned out: darker toward the ground as the kit's
  // boxes are, and under the eaves the top of it in their shade)
  function faceRects(K, F, rects, st, n, shadeY) {
    const lo = K.lo - K.y0; const ao = y => 0.6 + 0.4 * G.clamp((y - lo) / 2.6, 0, 1);
    const cut = [lo + 2.6]; if (shadeY !== undefined) cut.push(shadeY - 0.45);
    const colAt = y => { const f = ao(y) * (shadeY !== undefined && y > shadeY - 0.03 ? 0.78 : 1); return [st.col[0] * f, st.col[1] * f, st.col[2] * f]; };
    K.as(st.pat, () => { for (const r0 of rects) { let ys = [r0[1], r0[3]]; for (const c of cut) if (c > r0[1] + 1e-3 && c < r0[3] - 1e-3) ys.push(c); ys = ys.sort((a, b) => a - b);
      for (let j = 0; j + 1 < ys.length; j++) { const y0 = ys[j], y1 = ys[j + 1]; const A = F.P(r0[0], y0, n), B = F.P(r0[2], y0, n), C = F.P(r0[2], y1, n), D = F.P(r0[0], y1, n); const c0 = colAt(y0), c1 = colAt(y1);
        K.tri3(A, B, C, c0, c0, c1, F.out); K.tri3(A, C, D, c0, c1, c1, F.out); } } });
  }
  // the outside of a building from its shell (rect; round: shellRound)
  function shellHouse(g, gw, K, S) {
    const sh = S.shell, P = K.P; if (sh.kind === 'round') return shellRound(g, gw, K, S); if (sh.kind === 'aberta') return shellOpen(K, S);
    const R = sh.r, x = (R[0] + R[2]) / 2, z = (R[1] + R[3]) / 2, sx = R[2] - R[0], sz = R[3] - R[1];
    const byLv = new Map(S.levels.map(l => [l.lv, l]));
    const body = S.levels.filter(l => l.kind !== 'porao' && l.kind !== 'terraco' && l.kind !== 'jirau').sort((a, c) => a.y - c.y);
    const l0 = body[0] || S.levels[0], raised = l0.kind === 'elevado' || sh.base === 'esteios';
    const foot = raised ? l0.y - (l0.slab || 0.2) : 0, eave = sh.eave;
    const rk = ROOFK[sh.roof && sh.roof.kind] || P.kind || 'gable', flat = rk === 'flat';
    const e = S.entrance, side = (e && e.side) || doorSide(K.b), od = SIDEO[side] || [0, 1];
    K.cls = K.st === 'nordico' ? NCLS[K.b.type] || 1 : 0;
    K.body = { x, z, sx, sz, door: e ? { side, o: od, a: od[1] ? e.x - x : e.z - z, w: (e.w || 1) + 0.5 } : null, shell: true };
    const ctx = { S, byLv, l0, foot, eave, rk, flat, raised, k: 0, gw };
    // the base: stones under the walls (an annex's too), or the posts of a raised floor
    if (raised) stilts(K, ctx, R); else { footing(K, x, z, sx, sz, K.st !== 'egipcio' && K.st !== 'asteca', true); for (const a of sh.annex || []) footing(K, (a.r[0] + a.r[2]) / 2, (a.r[1] + a.r[3]) / 2, a.r[2] - a.r[0], a.r[3] - a.r[1], false, true); }
    // the sides — the shell's from its foot to the eaves (where an annex stands against one, from its lean-to up) — and the
    // annexes' own, and their lean-tos
    const leans = (sh.annex || []).map(a => leanOf(ctx, a)).filter(Boolean);
    for (const sd of ['N', 'E', 'S', 'W']) { const covers = leans.filter(ln => ln.on === sd).map(ln => [ln.u0, foot - 0.01, ln.u1, ln.hi]); sideFace(g, gw, K, ctx, rside(R, sd), foot, eave, covers, true); }
    for (const ln of leans) { for (const sd of ln.free) sideFace(g, gw, K, ctx, rside(ln.a.r, sd), foot, ln.a.h, [], false); leanRoof(K, ctx, ln); }
    if (sh.court) courtSides(K, ctx, sh.court);
    // the roof: the people's, as steep as the shell says, its ridge where it says; a flat one with its terrace; open over a court
    let top;
    if (!sh.roof) top = wallTops(K, S, R, eave); // (no roof at all — a shell open above, as a ruin's: the tops of its walls)
    else if (flat) top = flatTop(g, gw, K, ctx, x, z, sx, sz);
    else if (sh.court) top = courtRoof(K, ctx, rk);
    else top = roofOf(K, x, z, sx, sz, eave, rk, null, sh.roof.along === 'z', sh.roof.h, true, new Set(leans.map(ln => ln.on)));
    if (K.st === 'nordico' && rk === 'turf' && K.roof && !sh.court) nordGables(gw, K, K.cls);
    // (an outside flight, and the steps before its foot down to the ground — Space.feet; L-163)
    for (const s of S.steps || []) { inStair(K, S, s); const f = G.Space.feet(s); const fl = G.Space.doorFlight(K.b, sh, { w: K.w, d: K.d }, f.w, f.h, 0, false, f.F, f.uc); if (fl) layFlight(K, fl, (K.P.base || [])[2] || '#a09a8e'); }
    smokeOf(K, ctx, top);
    if (K.b.type === 'taverna') innSign(K);
    if (K.footed && !raised && K.body.door) wallGrass(K, x, z, sx, sz, { side, a: K.body.door.a, w: K.body.door.w });
    return top;
  }
  // (the tops of a shell's walls with no roof over them: each side's wall, its thickness, at the eaves)
  function wallTops(K, S, R, eave) {
    const t = S.shell.t || 0.3; const st = outStuff(K, S, null);
    K.as(st.pat, () => { for (const q of [[R[0], R[1], R[2], R[1] + t], [R[0], R[3] - t, R[2], R[3]], [R[0], R[1] + t, R[0] + t, R[3] - t], [R[2] - t, R[1] + t, R[2], R[3] - t]])
      K.quad([q[0], eave, q[1]], [q[2], eave, q[1]], [q[2], eave, q[3]], [q[0], eave, q[3]], st.col, UP); });
    return eave;
  }
  // an open shell (a fair): no sides and no roof — the lot's own ground —; under awnings, their cloths over the lot at the eaves'
  // height, in strips along the way the shell says, on posts at their ends; and what stands there, seen from the street as
  // from inside — there is no inside to it —: the plan's own pieces (the stalls, the fountain), once the plan is made (asked
  // for here: Space.plan; the frame's pump makes it, and the chunk is drawn again with them)
  const AWN = [[196, 84, 62], [222, 192, 118], [88, 120, 162], [234, 226, 204], [160, 104, 64]];
  function shellOpen(K, S) {
    const sh = S.shell, R = sh.r, x = (R[0] + R[2]) / 2, z = (R[1] + R[3]) / 2, sx = R[2] - R[0], sz = R[3] - R[1];
    K.body = { x, z, sx, sz, door: null, shell: true, open: true };
    if (sh.roof && sh.roof.kind === 'toldo' && sh.eave > 0.5) {
      const az = sh.roof.along === 'z'; const len = (az ? sz : sx) - 0.2, wide = az ? sx : sz; const sw = 2.1, gap = 0.55;
      const n = Math.max(1, Math.floor((wide + gap) / (sw + gap))); const off = (wide - (n * sw + (n - 1) * gap)) / 2;
      const P = (u, y, w) => (az ? [R[0] + w, y, R[1] + 0.1 + u] : [R[0] + 0.1 + u, y, R[1] + w]); const sag = Math.min(0.28, len * 0.025);
      for (let k = 0; k < n; k++) {
        const w0 = off + k * (sw + gap), w1 = w0 + sw, e = sh.eave; const col = AWN[Math.floor(K.hv(40 + k) * AWN.length) % AWN.length];
        // (the cloth: two slopes down to its middle, seen from above and from under it)
        for (const [ua, ub, ya, yb] of [[0, len / 2, e, e - sag], [len / 2, len, e - sag, e]]) {
          K.as('linen', () => { K.quad(P(ua, ya, w0), P(ub, yb, w0), P(ub, yb, w1), P(ua, ya, w1), col, [0, 1, 0]); K.quad(P(ua, ya - 0.012, w0), P(ub, yb - 0.012, w0), P(ub, yb - 0.012, w1), P(ua, ya - 0.012, w1), dim(col, 0.8), [0, -1, 0]); });
        }
        // (its posts, at its four corners — and in the middle, when it runs long)
        const us = len > 7 ? [0.05, len / 2, len - 0.05] : [0.05, len - 0.05];
        K.as('beam', () => { for (const u of us) for (const w of [w0 + 0.05, w1 - 0.05]) { const q = P(u, 0, w); const top = u === len / 2 ? e - sag : e; K.box(q[0], 0, q[2], 0.08, top + 0.04, 0.08, IDARK); } });
      }
    }
    // (what stands on the ground of the fair: the plan's own pieces, as the inside draws them)
    const p = S.p && S.p.ok ? S.p : null;
    if (!p && G.Space.plan) G.Space.plan(K.b);
    if (p) for (const it of p.items) { const l = p.levels.find(q => q.lv === it.lv) || p.levels[0]; const foot = l.y + (it.y || 0) + FLOOR_UP; const F = piece(K, it, foot); const f = FURN[it.kind]; if (f) f(F, it, { ceil: (sh.eave || 3) - foot }); else F.box(0, 0, 0, it.w, it.h, it.d, IWOOD, 'plankH'); }
    return sh.eave || 0.3;
  }
  // (a building of the world drawn open to the sky, with nothing to open — a fair: its people are seen where they are)
  B3.openShell = id => { const b = G.S.buildings.get(id); const S = b && B3.shellOf(b); return !!(S && S.shell.kind === 'aberta'); };
  // one side of the outside: its face round its openings, the openings, its dressing
  function sideFace(g, gw, K, ctx, F, ya, yb, covers, main) {
    if (yb <= ya + 0.01 || F.u1 - F.u0 < 0.02) return; const S = ctx.S;
    const ws = S.walls.filter(w => w.kind !== 'parapeito' && w.kind !== 'guarda-corpo' && ctx.byLv.has(w.lv) && ctx.byLv.get(w.lv).kind !== 'terraco' && wallOn(w, F));
    const wid = new Set(ws.map(w => w.id)); const ops = [];
    for (const h of S.holes) {
      if (!wid.has(h.wall)) continue; const w = S.byId.get(h.wall); const l = ctx.byLv.get(w.lv); if (!l) continue;
      const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1; const uc = F.ax ? w.a[0] + (w.b[0] - w.a[0]) / L * h.at : w.a[1] + (w.b[1] - w.a[1]) / L * h.at;
      const y0 = l.y + (h.sill || 0); const q = { h, w, l, u0: uc - h.w / 2, u1: uc + h.w / 2, uc, y0, y1: y0 + h.h, t: w.t };
      // (an opening behind an annex is the annex's door: the inside's)
      if (covers.some(c => q.u0 >= c[0] - 0.01 && q.u1 <= c[2] + 0.01 && q.y1 <= c[3] + 0.01)) continue;
      ops.push(q);
    }
    const cuts = ops.map(q => [q.u0, q.y0, q.u1, q.y1]).concat(covers);
    const shade = main && !ctx.flat ? yb : undefined;
    for (const [b0, b1, st] of stuffBands(K, ctx, ws, ya, yb)) faceRects(K, F, cutRect([F.u0, b0, F.u1, b1], cuts), st, 0, b1 >= yb - 1e-3 ? shade : undefined);
    for (const q of ops) opening(gw, K, ctx, F, q);
    dressSide(K, ctx, F, ws, ops, ya, yb, main, covers);
  }
  // (a flight of steps of Space's reckoning laid in stone — before a door, before the foot of an outside flight: Space.doorFlight)
  function layFlight(K, fl, stone) {
    const tone = k => dim(stone, 0.94 + K.hv(260 + k) * 0.1); const F = fl.F;
    K.as('stone', () => { for (const t of fl.treads) { const a = t.a + (t.kind === 'out' ? (K.hv(262 + t.k) - 0.5) * 0.04 : 0); const p = fl.P(a, t.n); const sx = F.ax ? t.wa : t.wn, sz = F.ax ? t.wn : t.wa;
      K.box(p[0], t.gy, p[1], sx, t.y - t.gy, sz, t.kind === 'one' || t.kind === 'landing' ? stone : tone(t.k));
      (K.steps || (K.steps = [])).push([K.x0 + p[0] - sx / 2, K.x0 + p[0] + sx / 2, K.z0 + p[1] - sz / 2, K.z0 + p[1] + sz / 2]); } }); // (where they stand, for the proof: Build3D.check)
  }
  // (the way along a side, +1 toward its u1 end)
  const alongV = (F, s) => (F.ax ? [s, 0, 0] : [0, 0, s]);
  // an opening of a side: its reveals of the wall's stuff (in to the pane, through the wall for a door or an arch), the pane
  // and its lamp, a door's leaf shut, an arch's dark; their frames
  function opening(gw, K, ctx, F, q) {
    const st = outStuff(K, ctx.S, q.w), t = q.t, kind = q.h.kind; const deep = kind === 'janela' ? t / 2 : t; const { u0, u1, y0, y1 } = q; const P = F.P;
    K.as(st.pat, () => {
      K.quad(P(u0, y0, 0), P(u0, y0, -deep), P(u0, y1, -deep), P(u0, y1, 0), dim(st.col, 0.9), alongV(F, 1));
      K.quad(P(u1, y0, 0), P(u1, y0, -deep), P(u1, y1, -deep), P(u1, y1, 0), dim(st.col, 0.9), alongV(F, -1));
      K.quad(P(u0, y1, 0), P(u1, y1, 0), P(u1, y1, -deep), P(u0, y1, -deep), dim(st.col, 0.8), DOWN);
      if (kind === 'janela' || (q.h.sill || 0) > 0.001) K.quad(P(u0, y0, 0), P(u1, y0, 0), P(u1, y0, -deep), P(u0, y0, -deep), dim(st.col, 0.95), UP);
    });
    if (kind === 'janela') {
      const c = P(q.uc, y0, -t / 2); gw.put(SH.box, R3.mat(K.x0 + c[0], K.y0 + c[1], K.z0 + c[2], F.ax ? 0 : Math.PI / 2, u1 - u0, y1 - y0, 0.02), '#2a3440');
      if (K.lit) { const l = P(q.uc, y0 + (y1 - y0) / 2, -t / 2 + 0.05); K.lit.push([K.x0 + l[0], K.y0 + l[1], K.z0 + l[2], F.o[0], F.o[1]]); }
      winDress(K, F, q, ctx.k++); return;
    }
    // (a door's or an arch's floor through the wall: its threshold, a hair under the inside's)
    if ((q.h.sill || 0) <= 0.001) K.as('plankH', () => K.quad(P(u0, y0 + 0.006, 0), P(u1, y0 + 0.006, 0), P(u1, y0 + 0.006, -t), P(u0, y0 + 0.006, -t), IDARK, UP));
    if (kind === 'vao') K.as(0, () => K.quad(P(u0, y0, -t + 0.005), P(u1, y0, -t + 0.005), P(u1, y1, -t + 0.005), P(u0, y1, -t + 0.005), [26, 22, 20], F.out));
    else leafShut(K, ctx, q, F);
    doorDress(K, ctx, F, q);
  }
  // (the door a hole is the opening of: the plan's, or as the shell says it)
  const doorOf = (S, h) => (S.doors && h.door >= 0 && S.doors[h.door]) || { at: h.at, w: h.w, h: h.h, hinge: h.hinge || 'a', sill: h.sill || 0 };
  // (which side of a door's wall its room is: the plan's first room for the door; else in, away from the side it opens on)
  function roomSide(S, w, d, F) {
    const ax = w.b[0] - w.a[0], az = w.b[1] - w.a[1]; const L = Math.hypot(ax, az) || 1; const nx = -az / L, nz = ax / L;
    const m = S.rooms && d.rooms && S.rooms.find(q => q.id === d.rooms[0]);
    if (m) { const cx = (m.r[0] + m.r[2]) / 2 - (w.a[0] + w.b[0]) / 2, cz = (m.r[1] + m.r[3]) / 2 - (w.a[1] + w.b[1]) / 2; return cx * nx + cz * nz >= 0 ? 1 : -1; }
    return F.o[0] * nx + F.o[1] * nz > 0 ? -1 : 1;
  }
  // where a door's leaf hangs, shut: its hinge's foot (lot metres; y up from the plinth's top) and its turn — the inside's own
  // rule (Build3D.interior hangs it there too: the outside's copy and the inside's are one)
  function leafPose(w, d, l, sg) {
    const ax = w.b[0] - w.a[0], az = w.b[1] - w.a[1]; const L = Math.hypot(ax, az) || 1; const tx = ax / L, tz = az / L, nx = -tz, nz = tx;
    const ds = d.hinge === 'b' ? -1 : 1; const sH = d.at - ds * d.w / 2; const off = sg * Math.max(0, w.t / 2 - 0.04);
    const ux = tx * ds, uz = tz * ds;
    return { hx: w.a[0] + tx * sH + nx * off, hz: w.a[1] + tz * sH + nz * off, y: l.y + (d.sill || 0) + FLOOR_UP, yaw: Math.atan2(-uz, ux), swing: (uz * nx * sg - ux * nz * sg) >= 0 ? 1 : -1 };
  }
  function leafShut(K, ctx, q, F) {
    const d = doorOf(ctx.S, q.h); const ps = leafPose(q.w, d, q.l, roomSide(ctx.S, q.w, d, F)); const c = Math.cos(ps.yaw), s = Math.sin(ps.yaw);
    for (const [x, y, z, sx, sy, sz, col, pat] of leafParts(d.w, d.h, (K.P && K.P.door) || '#5a3b25')) K.as(pat, () => K.box(ps.hx + x * c + z * s, ps.y + y, ps.hz - x * s + z * c, sx, sy, sz, col, ps.yaw));
  }
  // the frame of a window at its mouth, as each people makes it — the frame of the people's trim, a sill of stone, a lintel
  // of stone in the stone lands; the grille of the Egyptian, the bars of a Roman street, the Aztec's rolled mat; a box of
  // flowers under some in the classical and the southern towns; shutters open flat on the wall or half shut (the house's id)
  function winDress(K, F, q, k) {
    const P = K.P, st = K.st; const ww = q.u1 - q.u0, hh = q.y1 - q.y0, py = q.y0;
    const framed = st !== 'nordico' && st !== 'egipcio'; const shut = (st === 'classico' || st === 'grego') && K.b.type !== 'insula';
    const tc = st === 'asteca' ? (P.trim2 || P.trim) : (P.trim || '#6b4a30'); const fc = st === 'nordico' ? nordWood(K).dark : calm(tc, 0.75, 0.9);
    const stone = P.base ? P.base[2] : '#a09a8e'; const cut = st === 'grego' ? 'marble' : st === 'romano' ? 'ashlar' : st === 'egipcio' ? 'sandstone' : 'stone';
    const sh2 = st === 'grego' ? (P.trim || '#3f6fb0') : [[86, 104, 70], [104, 74, 50], [70, 92, 104]][Math.floor(K.hv(17) * 3)];
    // (a piece dx along the face from the window's middle, dy up from its foot, its middle n out of the face: w2 along, h2 high, d2 deep)
    // (beyond the preset's fine reach a piece a hand deep or less is its front face: its depth is nothing at that distance)
    const fx = (dx, dy, w2, h2, d2, col, n) => { if (!K.fine && d2 <= 0.06) { const f = n + d2 / 2; K.quad(F.P(q.uc + dx - w2 / 2, py + dy, f), F.P(q.uc + dx + w2 / 2, py + dy, f), F.P(q.uc + dx + w2 / 2, py + dy + h2, f), F.P(q.uc + dx - w2 / 2, py + dy + h2, f), col || fc, F.out); return; }
      const c = F.P(q.uc + dx, py + dy, n); K.box(c[0], c[1], c[2], F.ax ? w2 : d2, h2, F.ax ? d2 : w2, col || fc); };
    if (framed || st === 'nordico') K.as('jamb', () => { const fw = st === 'asteca' ? 0.13 : 0.09;
      fx(0, -0.08, ww + 0.2, 0.08, 0.05, fc, 0.025); fx(0, hh, ww + 0.2, 0.09, 0.05, fc, 0.025); fx(-ww / 2 - fw / 2, 0, fw, hh, 0.05, fc, 0.025); fx(ww / 2 + fw / 2, 0, fw, hh, 0.05, fc, 0.025);
      if (st === 'classico' || st === 'grego') fx(0, 0, 0.05, hh, 0.04, fc, -0.03); });
    if (st !== 'nordico') K.as(cut, () => fx(0, -0.14, ww + 0.3, 0.08, 0.2, stone, 0.06));
    if (st === 'romano' || st === 'grego' || st === 'egipcio') K.as(st === 'egipcio' ? 'stucco' : cut, () => fx(0, hh + 0.09, ww + 0.34, 0.12, 0.08, st === 'egipcio' ? (P.trim || '#2f8f8a') : stone, 0.04));
    const r = K.hv(130 + k);
    if (st === 'egipcio') K.as('beam', () => { for (const e of [-0.22, 0, 0.22]) fx(e * ww, 0, 0.035, hh, 0.04, '#5a4430', -0.03); });
    if (st === 'romano' && K.fine && r < 0.45) K.as('iron', () => { for (const e of [-0.25, 0.25]) fx(e * ww, 0, 0.025, hh, 0.04, '#2e2c2a', -0.03); fx(0, hh * 0.5, ww, 0.025, 0.03, '#2e2c2a', -0.03); });
    if (st === 'asteca' && K.fine && r < 0.4) K.as('wicker', () => fx(0, hh - 0.16, ww + 0.04, 0.16, 0.16, [176, 150, 98], 0.09));
    if (K.fine && (st === 'classico' || st === 'grego' || st === 'romano') && K.hv(120 + k) < 0.32 && hh < 1.4) {
      K.as('jamb', () => fx(0, -0.36, ww + 0.08, 0.2, 0.2, dim(fc, 0.9), 0.12));
      const fl = [[204, 62, 56], [222, 112, 140], [236, 230, 214]][Math.floor(K.hv(125 + k) * 3)];
      for (let j = 0; j < 6; j++) { const a = ((j + 0.5) / 6 - 0.5) * ww; const p0 = F.P(q.uc + a, py - 0.17, 0.13); const X = K.x0 + p0[0], Y = K.y0 + p0[1], Z = K.z0 + p0[2]; const ang = j * 1.9 + k;
        K.gp.blade(X, Y, Z, 0.09, ang, X + F.o[0] * 0.12 + Math.cos(ang) * 0.05, Y + 0.24, Z + F.o[1] * 0.12 + Math.sin(ang) * 0.05, [62, 104, 46], j % 2 ? [84, 140, 62] : fl, 0.5); }
    }
    const sh = shut ? (st === 'grego' ? r < 0.78 : true) : (st === 'romano' && K.b.type !== 'insula' && r >= 0.45 && r < 0.75) || (st === 'nordico' && r < 0.6);
    if (sh) K.as(st === 'nordico' ? 'plankV' : 'painted', () => { const open = K.hv(110 + k) < 0.7; const sc = st === 'nordico' ? nordWood(K).dark : sh2;
      for (const s2 of [-1, 1]) { if (open) fx(s2 * (ww / 2 + 0.1 + ww / 4 + 0.03), 0, ww * 0.5, hh, 0.04, sc, 0.03); else fx(s2 * ww * 0.25, 0, ww * 0.5, hh, 0.05, sc, 0.04); } });
  }
  // the frame of a door at its mouth, as each people makes it — the posts and the lintel (of stone in the stone lands), the
  // classical porch now and then, the Roman's pediment, the Greek's light over it, the Aztec's bands, the north's portal —
  // and the step down to the ground before it (a raised door has the shell's steps)
  function doorDress(K, ctx, F, q) {
    const P = K.P, st = K.st; const dw = q.u1 - q.u0, dh = q.y1 - q.y0, y = q.y0;
    const bx = (a, yy, n, wa, hy, wn, col) => { const c = F.P(q.uc + a, yy, n); K.box(c[0], c[1], c[2], F.ax ? wa : wn, hy, F.ax ? wn : wa, col); };
    const tr = P.trim || '#6b4a30'; const stone = P.base ? P.base[2] : '#a09a8e'; const cut = st === 'grego' ? 'marble' : st === 'romano' ? 'ashlar' : st === 'egipcio' ? 'sandstone' : 'stone';
    if (st === 'nordico') { const wd = nordWood(K).dark; K.as('beam', () => { for (const s2 of [-1, 1]) bx(s2 * (dw / 2 + 0.08), y, 0.06, 0.16, dh + 0.1, 0.12, wd); bx(0, y + dh, 0.07, dw + 0.4, 0.18, 0.14, wd); }); }
    else {
      const sl = st === 'romano' || st === 'grego' || st === 'egipcio' || st === 'asteca';
      K.as('beam', () => { for (const s2 of [-1, 1]) bx(s2 * (dw / 2 + 0.07), y, 0.07, 0.14, dh, 0.14, tr); });
      K.as(sl ? (st === 'asteca' ? 'stucco' : cut) : 'beam', () => bx(0, y + dh, 0.08, dw + 0.42, 0.2, 0.18, sl ? (st === 'asteca' ? (P.trim || '#b33a2a') : stone) : tr));
      if (st === 'classico' && y < 0.3 && K.hv(26) < 0.6 && q.y1 + 0.9 < ctx.eave) { const D2 = (a, yy, n) => F.P(q.uc + a, yy, n); const yb = y + dh + 0.36, dep = 0.62, wdt = dw + 0.7;
        K.as('beam', () => { for (const s2 of [-1, 1]) K.bar(D2(s2 * (wdt / 2 - 0.1), yb - 0.45, 0.03), D2(s2 * (wdt / 2 - 0.1), yb + 0.02, dep - 0.08), [0, 0.07, 0], F.ax ? [0.06, 0, 0] : [0, 0, 0.06], tr); bx(0, yb - 0.03, dep / 2, wdt - 0.1, 0.03, dep, dim(tr, 0.8)); });
        const c0 = D2(0, yb, dep / 2); K.as('tile', () => K.gable(c0[0], c0[1], c0[2], F.ax ? wdt : dep + 0.1, 0.4, F.ax ? dep + 0.1 : wdt, (P.roof && P.roof[1]) || '#94452d', F.ax)); }
      if (st === 'romano') K.as('stone', () => { for (const s2 of [-1, 1]) { const a = s2 * (dw / 2 + 0.28); const A = F.P(q.uc + a, y + dh + 0.22, 0.13), B = F.P(q.uc, y + dh + 0.58, 0.13); const da = -a, dy = 0.36, l = Math.hypot(da, dy);
        K.bar(A, B, [F.ax ? -dy / l * 0.12 : 0, da / l * 0.12, F.ax ? 0 : -dy / l * 0.12], [F.o[0] * 0.12, 0, F.o[1] * 0.12], stone); } });
      if (st === 'grego' && ctx.gw && q.y1 + 0.5 < ctx.eave) { const c = F.P(q.uc, y + dh + 0.22, 0.03); ctx.gw.put(SH.box, R3.mat(K.x0 + c[0], K.y0 + c[1], K.z0 + c[2], F.ax ? 0 : Math.PI / 2, dw * 0.8, 0.26, 0.05), '#2a3440'); }
      if (st === 'asteca') K.as('stucco', () => { bx(0, y + dh + 0.2, 0.1, dw + 0.7, 0.14, 0.2, P.trim2 || '#2fae8f'); bx(0, y + dh + 0.34, 0.1, dw + 0.25, 0.1, 0.2, P.trim || '#b33a2a'); });
    }
    // (the step: down to the ground before the door — no further out than a hand past the lot): Space's reckoning, the one the
    // feet go up (Space.doorFlight; L-163)
    const fl = G.Space.doorFlight(K.b, ctx.S.shell, { w: K.w, d: K.d }, q.w, q.h, q.l.y, ctx.raised);
    if (fl) { layFlight(K, fl, stone); if (fl.cut && K.body && K.body.door && K.body.door.side === fl.F.sd) K.body.door.cut = fl.cut; }
  }
  // the people's dressing of a side: the socle at its foot, the bands of its storeys, the cornice under the eaves (none under
  // a flat roof: its own top), the timbers of a half-timbered storey, the north's corner posts, sill and plate — all of it a
  // hand out of the face, broken where an opening is
  function dressSide(K, ctx, F, ws, ops, ya, yb, main, covers) {
    const P = K.P, st = K.st; const S = ctx.S; const wc = outStuff(K, S, null).col; const tr = P.trim || '#6b4a30';
    const gaps = ops.map(q => [q.u0 - 0.03, q.y0, q.u1 + 0.03, q.y1]).concat(covers || []);
    const band = (y0, hy, d, col, pat, pad) => { if (y0 + hy <= ya + 1e-3 || y0 >= yb) return; const spans = cutRect([F.u0 - pad, Math.max(ya, y0), F.u1 + pad, Math.min(yb, y0 + hy)], gaps);
      K.as(pat, () => { for (const r of spans) { if (r[2] - r[0] < 0.04 || r[3] - r[1] < 0.01) continue;
        if (!K.fine && d <= 0.07) { const f = d - 0.01; K.quad(F.P(r[0], r[1], f), F.P(r[2], r[1], f), F.P(r[2], r[3], f), F.P(r[0], r[3], f), col, F.out); continue; }
        const c = F.P((r[0] + r[2]) / 2, r[1], d / 2 - 0.01); K.box(c[0], c[1], c[2], F.ax ? r[2] - r[0] : d, r[3] - r[1], F.ax ? d : r[2] - r[0], col); } }); };
    const base = P.base || ['#8a8478', '#6f6a60', '#a09a8e']; const frameAll = ws.length && ws.every(w => outStuff(K, S, w).frame);
    if (st === 'nordico') {
      const wd = nordWood(K).dark;
      band(ya, 0.2, 0.06, dim(wd, 0.92), 'beam', 0.06); band(yb - 0.2, 0.2, 0.05, wd, 'beam', 0.05);
      if (main) K.as('beam', () => { for (const u of [F.u0, F.u1]) { const c = F.P(u, ya, 0.03); K.box(c[0], c[1], c[2], 0.2, yb - ya, 0.2, wd); } });
    } else if (!frameAll && (st === 'grego' || st === 'romano' || st === 'classico')) band(ya, 0.42, 0.04, base[1], stuff(K.b).base === 'marble' || stuff(K.b).base === 'ashlar' ? stuff(K.b).base : 'stone', 0.04);
    else if (st === 'egipcio') band(ya, 0.36, 0.05, base[1] || '#cdb98f', 'sandstone', 0.05);
    else if (st === 'asteca') { band(ya, 0.5, 0.03, P.trim2 || '#2fae8f', 'stucco', 0.03); band(ya + 0.5, 0.08, 0.025, P.trim || '#b33a2a', 'stucco', 0.025); }
    // (the bands of the storeys over the first)
    for (const l of [...new Set(ws.map(w => w.lv))].map(v => ctx.byLv.get(v)).filter(l => l && l !== ctx.l0 && l.y > ya + 0.5)) {
      const yj = l.y - (l.slab || 0);
      if (st === 'grego' || st === 'romano') band(yj - 0.06, 0.16, 0.05, dim(wc, 0.86), outStuff(K, S, null).pat, 0.05);
      else if (st === 'asteca') band(yj - 0.04, 0.24, 0.05, P.trim || '#b33a2a', 'stucco', 0.05);
      else band(yj - 0.06, 0.24, 0.07, st === 'nordico' ? nordWood(K).dark : tr, 'beam', 0.07);
    }
    // (the cornice under the eaves of a pitched roof)
    if (main && !ctx.flat) {
      if (st === 'romano' || st === 'grego') { const cs = base[2]; const cp = st === 'grego' ? 'marble' : 'ashlar'; band(yb - 0.24, 0.13, 0.06, cs, cp, 0.06); band(yb - 0.11, 0.11, 0.14, dim(cs, 0.95), cp, 0.14); }
      else if (st !== 'nordico') band(yb - 0.2, 0.2, 0.06, st === 'egipcio' ? (P.trim || '#2f8f8a') : tr, st === 'egipcio' ? 'stucco' : 'beam', 0.06);
    }
    // (the half-timber: posts at the ends and by each opening, the sill and the plate of each storey, a brace in each wide panel)
    for (const [b0, b1, sf] of stuffBands(K, ctx, ws, ya, yb)) {
      if (!sf.frame) continue; const wt = mixc(tr, [74, 52, 36], 0.25); const t = 0.15, pr = 0.035; const inB = ops.filter(q => q.y1 > b0 + 0.05 && q.y0 < b1 - 0.05);
      const post = (u, y0, y1) => { const c = F.P(u, y0, pr / 2); K.box(c[0], c[1], c[2], F.ax ? t : pr, y1 - y0, F.ax ? pr : t, wt); };
      const rail = (y0, hy) => { for (const r of cutRect([F.u0, y0, F.u1, y0 + hy], inB.map(q => [q.u0 - 0.02, q.y0, q.u1 + 0.02, q.y1]))) { const c = F.P((r[0] + r[2]) / 2, r[1], pr / 2); K.box(c[0], c[1], c[2], F.ax ? r[2] - r[0] : pr, r[3] - r[1], F.ax ? pr : r[2] - r[0], wt); } };
      K.as('beam', () => {
        rail(b0 + 0.02, t); rail(b1 - 0.14, 0.12);
        const posts = [F.u0 + t / 2, F.u1 - t / 2]; for (const q of inB) posts.push(q.u0 - t / 2 - 0.02, q.u1 + t / 2 + 0.02); posts.sort((a, b) => a - b);
        for (const u of posts) post(u, b0 + 0.02, b1 - 0.02);
        for (let k = 0; k + 1 < posts.length; k++) { const a = posts[k] + t / 2, c = posts[k + 1] - t / 2; if (c - a < 1.0 || inB.some(q => q.u0 < c && q.u1 > a)) continue;
          const A = F.P(a + 0.06, b0 + 0.18, pr / 2), B = F.P(c - 0.06, b1 - 0.16, pr / 2); const du = c - a - 0.12, dy = b1 - b0 - 0.34, l = Math.hypot(du, dy);
          K.bar(A, B, [F.ax ? -dy / l * t : 0, du / l * t, F.ax ? 0 : -dy / l * t], [F.o[0] * pr, 0, F.o[1] * pr], wt); }
      });
    }
  }
  // the posts of a raised floor: from the ground to the floor's underside at its corners and along its sides, the boards
  // under it
  function stilts(K, ctx, R) {
    K.footed = true; const y = ctx.foot; const wd = K.st === 'nordico' ? nordWood(K).dark : [106, 80, 56];
    K.as('plankH', () => flatQ(K, R, y, dim(wd, 0.8), -1));
    K.as('beam', () => { for (const sd of ['N', 'S', 'E', 'W']) { const F = rside(R, sd); const len = F.u1 - F.u0; const n = Math.max(1, Math.round(len / 1.5));
      for (let k = 0; k <= n; k++) { if ((sd === 'E' || sd === 'W') && (k === 0 || k === n)) continue; const c = F.P(F.u0 + 0.12 + (len - 0.24) * k / n, 0, -0.12); const gy = K.gy(c[0], c[2]) - 0.25; K.box(c[0], gy, c[2], 0.2, y - gy, 0.2, wd); } } });
  }
  // an annex against a side of the shell: which side, its own sides out, and its lean-to — from its walls' top at the far
  // side up to the house's wall, under the windows over it
  function leanOf(ctx, a) {
    const R = ctx.S.shell.r, r = a.r; let on = null;
    if (Math.abs(r[2] - R[0]) < 0.03) on = 'W'; else if (Math.abs(r[0] - R[2]) < 0.03) on = 'E'; else if (Math.abs(r[3] - R[1]) < 0.03) on = 'N'; else if (Math.abs(r[1] - R[3]) < 0.03) on = 'S';
    if (!on) return null; const opp = { W: 'E', E: 'W', N: 'S', S: 'N' }; const ax = on === 'N' || on === 'S';
    const depth = ax ? r[3] - r[1] : r[2] - r[0]; const Fh = rside(R, on);
    // (the house's windows over the annex: the lean-to stays under them)
    let lim = ctx.eave; for (const h of ctx.S.holes) { const w = ctx.S.byId.get(h.wall); if (!w || !wallOn(w, Fh)) continue; const l = ctx.byLv.get(w.lv); if (l && l.y + (h.sill || 0) > a.h + 0.1) lim = Math.min(lim, l.y + (h.sill || 0) - 0.12); }
    const hi = Math.max(a.h + 0.15, Math.min(a.h + depth * 0.5, lim, ctx.eave - 0.05));
    return { a, on, free: ['N', 'E', 'S', 'W'].filter(sd => sd !== opp[on]), u0: ax ? r[0] : r[1], u1: ax ? r[2] : r[3], hi, depth, Fh };
  }
  function leanRoof(K, ctx, ln) {
    const P = K.P, a = ln.a, Fh = ln.Fh; const nord = K.st === 'nordico'; const st = stuff(K.b);
    // (the peoples of the flat roofs lay reeds on their lean-tos; the others their own tiles, straw, turf)
    const pat = nord ? 'turf' : a.roof === 'palha' || st.tile === 'thatch' || st.tile === 'mud' ? 'thatch' : st.tile; const col = nord ? turfTone(K).grass : pat === 'thatch' ? ((P.thatch && P.thatch[0]) || '#c8a85a') : (P.roof && P.roof[0]) || '#b85a3c';
    const ov = 0.3, T = pat === 'thatch' ? 0.25 : 0.12; const yAt = n => ln.hi + (a.h - ln.hi) * (n / ln.depth);
    const u0 = ln.u0 - ov, u1 = ln.u1 + ov, n1 = ln.depth + ov; const Q = (u, n, dy) => Fh.P(u, yAt(n) + dy, n);
    const up = [0, 1, 0]; const und = dim('#6a5038', 0.78);
    K.as(pat, () => { K.quad(Q(u0, 0, T), Q(u1, 0, T), Q(u1, n1, T), Q(u0, n1, T), col, up);
      K.quad(Q(u0, n1, 0), Q(u1, n1, 0), Q(u1, n1, T), Q(u0, n1, T), dim(col, 0.7), Fh.out);
      for (const [u, s] of [[u0, -1], [u1, 1]]) K.quad(Q(u, 0, 0), Q(u, n1, 0), Q(u, n1, T), Q(u, 0, T), dim(col, 0.75), alongV(Fh, s)); });
    K.as('plankH', () => K.quad(Q(u0, 0, 0), Q(u1, 0, 0), Q(u1, n1, 0), Q(u0, n1, 0), und, DOWN));
    // (its cheeks: the wall's stuff closing the slope over the annex's end walls)
    const sf = outStuff(K, ctx.S, ctx.S.walls.find(w => w.lv === (a.lv || 0) && w.outer && !wallOn(w, rside(ctx.S.shell.r, ln.on))) || null);
    K.as(sf.pat, () => { for (const [u, s] of [[ln.u0, -1], [ln.u1, 1]]) K.tri(Fh.P(u, a.h, 0), Fh.P(u, a.h, ln.depth), Fh.P(u, ln.hi, 0), sf.col, alongV(Fh, s)); });
  }
  // the court's sides, plain, from its floor to the roof's underside over them (their openings are the inside's), and its
  // floor — a hair under the inside's
  function courtSides(K, ctx, c) {
    const S = ctx.S; const st = outStuff(K, S, null); const yT = (x, z) => roofUnder(ctx, x, z);
    for (const sd of ['N', 'E', 'S', 'W']) {
      const F = rside(c, sd); const inF = { ax: F.ax, o: [-F.o[0], -F.o[1]], out: [-F.o[0], 0, -F.o[1]], P: (u, y, n) => F.P(u, y, -n) }; const n = Math.max(1, Math.ceil((F.u1 - F.u0) / 0.5));
      K.as(st.pat, () => { for (let k = 0; k < n; k++) { const a = F.u0 + (F.u1 - F.u0) * k / n, b2 = F.u0 + (F.u1 - F.u0) * (k + 1) / n; const pa = F.P(a, 0, 0), pb = F.P(b2, 0, 0);
        K.quad(inF.P(a, 0, 0), inF.P(b2, 0, 0), inF.P(b2, yT(pb[0], pb[2]), 0), inF.P(a, yT(pa[0], pa[2]), 0), st.col, inF.out); } });
    }
    K.as(K.st === 'grego' || K.st === 'romano' ? 'slab' : 'soil', () => flatQ(K, c, 0.004, K.st === 'grego' || K.st === 'romano' ? [170, 158, 140] : [140, 118, 90], 1));
  }
  // (the roof over a point of the shell — Interiors' roofY in the lot's frame: from the eaves at the walls to the ridge, the
  // hip's ends, the overhang beyond the walls going on down; flat: the eaves)
  function roofUnder(ctx, x, z) {
    const sh = ctx.S.shell, R = sh.r, Rf = sh.roof || {}; const rise = Rf.h || 0; if (ctx.flat || !rise) return ctx.eave;
    const ax = Rf.along !== 'z'; const um = ax ? (R[0] + R[2]) / 2 : (R[1] + R[3]) / 2, vm = ax ? (R[1] + R[3]) / 2 : (R[0] + R[2]) / 2, hu = ax ? (R[2] - R[0]) / 2 : (R[3] - R[1]) / 2, hv = ax ? (R[3] - R[1]) / 2 : (R[2] - R[0]) / 2;
    const u = ax ? x : z, v = ax ? z : x; const across = Math.abs(v - vm) / hv; const end = Rf.kind === 'quatro-aguas' ? (Math.abs(u - um) - (hu - hv)) / hv : -1;
    return ctx.eave + rise * (1 - Math.max(across, end));
  }
  // a pitched roof open over a court: its slopes as the shell has them (roofUnder), a field of points round the court — tiles,
  // turf, straw by the people —, its edges at the eaves and at the court, the boards under the eaves; the sides' tops under it
  function courtRoof(K, ctx, rk) {
    const S = ctx.S, sh = S.shell, R = sh.r, c = sh.court, P = K.P; const ov = 0.42; const st = stuff(K.b);
    const pat = rk === 'turf' ? 'turf' : rk === 'thatch' ? 'thatch' : st.tile === 'mud' ? 'tile' : st.tile; const T = rk === 'thatch' ? 0.4 : rk === 'turf' ? 0.26 : 0.16;
    const col = rk === 'thatch' ? ((P.thatch && P.thatch[0]) || '#c8a85a') : rk === 'turf' ? turfTone(K).grass : (P.roof && P.roof[0]) || '#b85a3c';
    const E = [R[0] - ov, R[1] - ov, R[2] + ov, R[3] + ov]; const H = (x, z) => roofUnder(ctx, x, z) + 0.002;
    // (the grid's lines: every 0.5 m, and the court's edges and the walls' — so no cell straddles them)
    const lines = (a0, a1, extra) => { const s = new Set(); const n = Math.ceil((a1 - a0) / 0.5); for (let k = 0; k <= n; k++) s.add(+(a0 + (a1 - a0) * k / n).toFixed(4)); for (const e of extra) if (e > a0 && e < a1) s.add(+e.toFixed(4)); return [...s].sort((a, b) => a - b); };
    const xs = lines(E[0], E[2], [c[0], c[2], R[0], R[2], (R[0] + R[2]) / 2]), zs = lines(E[1], E[3], [c[1], c[3], R[1], R[3], (R[1] + R[3]) / 2]);
    const lo = dim(col, 0.62); const und = dim('#6a5038', 0.78);
    K.as(pat, () => { for (let j = 0; j + 1 < zs.length; j++) for (let i = 0; i + 1 < xs.length; i++) {
      const x0 = xs[i], x1 = xs[i + 1], z0 = zs[j], z1 = zs[j + 1]; const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2; if (inRect(c, mx, mz)) continue;
      const A = [x0, H(x0, z0) + T, z0], B = [x1, H(x1, z0) + T, z0], C2 = [x1, H(x1, z1) + T, z1], D = [x0, H(x0, z1) + T, z1]; K.quad(A, B, C2, D, col, UP); } });
    // (the eaves' edges, the court's edges: the thickness of the roof)
    const edge = (p0, p1, out) => K.quad([p0[0], H(p0[0], p0[1]), p0[1]], [p1[0], H(p1[0], p1[1]), p1[1]], [p1[0], H(p1[0], p1[1]) + T, p1[1]], [p0[0], H(p0[0], p0[1]) + T, p0[1]], lo, out);
    K.as(pat, () => { for (const [ys, fix, out, ax] of [[xs, E[1], [0, 0, -1], 1], [xs, E[3], [0, 0, 1], 1], [zs, E[0], [-1, 0, 0], 0], [zs, E[2], [1, 0, 0], 0]]) for (let k = 0; k + 1 < ys.length; k++) edge(ax ? [ys[k], fix] : [fix, ys[k]], ax ? [ys[k + 1], fix] : [fix, ys[k + 1]], out);
      for (const [ys, fix, out, ax, lim] of [[xs, c[1], [0, 0, 1], 1, [c[0], c[2]]], [xs, c[3], [0, 0, -1], 1, [c[0], c[2]]], [zs, c[0], [1, 0, 0], 0, [c[1], c[3]]], [zs, c[2], [-1, 0, 0], 0, [c[1], c[3]]]])
        for (let k = 0; k + 1 < ys.length; k++) { if (ys[k] < lim[0] - 1e-4 || ys[k + 1] > lim[1] + 1e-4) continue; edge(ax ? [ys[k], fix] : [fix, ys[k]], ax ? [ys[k + 1], fix] : [fix, ys[k + 1]], out); } });
    // (the boards under the eaves, outside the walls)
    K.as('plankH', () => { for (const r of cutRect(E, [R])) for (const q of [r]) { const A = [q[0], H(q[0], q[1]), q[1]], B = [q[2], H(q[2], q[1]), q[1]], C2 = [q[2], H(q[2], q[3]), q[3]], D = [q[0], H(q[0], q[3]), q[3]]; K.quad(A, B, C2, D, und, DOWN); } });
    // (the sides' tops over the eaves, up to the roof's underside: the gables, a hip's none)
    const st2 = outStuff(K, S, null);
    for (const sd of ['N', 'E', 'S', 'W']) { const F = rside(R, sd); const n = Math.max(1, Math.ceil((F.u1 - F.u0) / 0.25));
      K.as(st2.pat, () => { for (let k = 0; k < n; k++) { const a = F.u0 + (F.u1 - F.u0) * k / n, b2 = F.u0 + (F.u1 - F.u0) * (k + 1) / n; const pa = F.P(a, 0, 0), pb = F.P(b2, 0, 0);
        const ya = H(pa[0], pa[2]) - 0.002, yb = H(pb[0], pb[2]) - 0.002; if (Math.max(ya, yb) < ctx.eave + 0.005) continue; K.quad(F.P(a, ctx.eave, 0), F.P(b2, ctx.eave, 0), F.P(b2, Math.max(ctx.eave, yb), 0), F.P(a, Math.max(ctx.eave, ya), 0), st2.col, F.out); } }); }
    return ctx.eave + ((sh.roof && sh.roof.h) || 0) + T;
  }
  // a flat roof from the shell: the slab's top (a terrace's floor) and its edges — never its underside: the ceiling under it
  // is the inside's —, open over a court; on a terrace the shell's parapet whole with its coping, the room on it with its
  // door and its roof of reed; else the people's own parapet, the Egyptian's cornice, the Aztec's merlons (roofOf)
  function flatTop(g, gw, K, ctx, x, z, sx, sz) {
    const S = ctx.S, sh = S.shell, P = K.P, st = stuff(K.b); const tl = S.levels.find(l => l.kind === 'terraco'); const yb = ctx.eave, yt = tl ? tl.y : yb + 0.25;
    const R = sh.r, m = 0.06; const RR = [R[0] - m, R[1] - m, R[2] + m, R[3] + m]; const c = sh.court; const sp = st.tile === 'mud' ? 'mud' : 'slab'; const sc = P.top || P.wl || '#e8dcc0';
    K.as(sp, () => { for (const r of c ? cutRect(RR, [c]) : [RR]) flatQ(K, r, yt, sc, 1);
      const ed = dim(sc, 0.86); for (const sd of ['N', 'E', 'S', 'W']) { const F = rside(RR, sd); K.quad(F.P(F.u0, yb, 0), F.P(F.u1, yb, 0), F.P(F.u1, yt, 0), F.P(F.u0, yt, 0), ed, F.out); }
      // (the slab's band round the walls' tops, under it: what the slab stands out over)
      for (const sd of ['N', 'E', 'S', 'W']) { const F = rside(RR, sd), Fi = rside(R, sd); K.quad(F.P(F.u0, yb, 0), F.P(F.u1, yb, 0), Fi.P(Fi.u1, yb, 0), Fi.P(Fi.u0, yb, 0), dim(sc, 0.7), DOWN); }
      if (c) for (const sd of ['N', 'E', 'S', 'W']) { const F = rside(c, sd); const o = [-F.o[0], 0, -F.o[1]]; K.quad(F.P(F.u0, yb, 0), F.P(F.u1, yb, 0), F.P(F.u1, yt, 0), F.P(F.u0, yt, 0), ed, o); } });
    if (!tl) return roofOf(K, x, z, sx, sz, yb, 'flat', null, undefined, 0, true);
    // the terrace: the shell's parapet and the room on it
    const top = roofOf(K, x, z, sx, sz, yb, 'flat', null, undefined, 0, 'terrace');
    for (const w of S.walls) {
      if (w.lv !== tl.lv) continue; const sf = outStuff(K, S, w);
      if (w.kind === 'parapeito') { const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]); if (L < 0.02) continue; const ry = Math.atan2(-(w.b[1] - w.a[1]) / L, (w.b[0] - w.a[0]) / L); const cx = (w.a[0] + w.b[0]) / 2, cz = (w.a[1] + w.b[1]) / 2; const hh = w.h || 0.9;
        K.as(sf.pat, () => K.box(cx, tl.y, cz, L + w.t, hh - 0.05, w.t, sf.col, ry)); K.as(sp, () => K.box(cx, tl.y + hh - 0.05, cz, L + w.t + 0.04, 0.05, w.t + 0.06, (P.par && P.par[1]) || dim(sf.col, 0.9), ry)); continue; }
      inWall(K, S, w, tl);
      for (const h of S.holes) { if (h.wall !== w.id || h.kind !== 'porta') continue; const d = doorOf(S, h); const rm = sh.roof && sh.roof.room; const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1; const nx = -(w.b[1] - w.a[1]) / L, nz = (w.b[0] - w.a[0]) / L;
        const sg = rm && rm.r ? ((rm.r[0] + rm.r[2]) / 2 - (w.a[0] + w.b[0]) / 2) * nx + ((rm.r[1] + rm.r[3]) / 2 - (w.a[1] + w.b[1]) / 2) * nz >= 0 ? 1 : -1 : 1;
        const ps = leafPose(w, d, tl, S.rooms ? roomSide(S, w, d, { o: [0, 0] }) : sg); const cy = Math.cos(ps.yaw), sy = Math.sin(ps.yaw);
        for (const [px, py, pz, ssx, ssy, ssz, col, pat] of leafParts(d.w, d.h, (P && P.door) || '#5a3b25')) K.as(pat, () => K.box(ps.hx + px * cy + pz * sy, ps.y + py, ps.hz - px * sy + pz * cy, ssx, ssy, ssz, col, ps.yaw)); }
    }
    const rm = sh.roof && sh.roof.room; if (rm && rm.r) K.as('thatch', () => K.box((rm.r[0] + rm.r[2]) / 2, tl.y + rm.h, (rm.r[1] + rm.r[3]) / 2, rm.r[2] - rm.r[0] + 0.2, 0.14, rm.r[3] - rm.r[1] + 0.2, ISTRAW));
    return Math.max(top, rm && rm.r ? tl.y + rm.h + 0.14 : 0, tl.y + 0.9);
  }
  // the smoke of the house, by a rule of its shell alone — where its fire is, only the inside knows (each try of the plan puts it
  // its own way): the north's smoke hole on the ridge; a chimney on the ridge a third along it (which end, the house's id)
  // over the houses of the peoples who build them and over the trades that keep a fire; out of the straw where the roof is
  // straw; on a flat roof a short stack near a corner (Build3D.chim: where FX3D's smoke comes out)
  const CHIM = { house: 1, sobrado: 1, insula: 1, quarteirao: 1, hut: 1, forja: 2, olaria: 2, taverna: 2, workshop: 2, ourives: 2, acougue: 1, tecelagem: 1 };
  function smokeOf(K, ctx, top) {
    const S = ctx.S, P = K.P, sh = S.shell, R = sh.r, t = K.b.type; void top;
    if (K.st === 'nordico' && K.roof && !sh.court) { smokeHole(K, K.cls || 1); return; }
    const k = CHIM[t]; if (!k || (k === 1 && !(K.st === 'classico' || K.st === 'romano' || K.st === 'grego' || ctx.flat))) return;
    const e = K.hv(27) < 0.5 ? -1 : 1; const az = sh.roof && sh.roof.along === 'z'; let fx, fz;
    if (ctx.flat) { fx = e < 0 ? R[0] + 0.55 : R[2] - 0.55; fz = K.hv(28) < 0.5 ? R[1] + 0.55 : R[3] - 0.55; }
    else if (az) { fx = (R[0] + R[2]) / 2; fz = (R[1] + R[3]) / 2 + e * (R[3] - R[1]) * 0.28; } else { fx = (R[0] + R[2]) / 2 + e * (R[2] - R[0]) * 0.28; fz = (R[1] + R[3]) / 2; }
    if (sh.court && inRect(sh.court, fx, fz, -0.5)) return;
    // (on a flat roof the smoke's hole only: the terrace is the plan's floor, nothing stands on it but what the plan says;
    // out of straw, the smoke through it)
    const tl = S.levels.find(l => l.kind === 'terraco'); if (ctx.flat) { B3.chim.set(K.b.id, [K.x0 + fx, K.y0 + (tl ? tl.y : ctx.eave + 0.25) + 0.1, K.z0 + fz]); return; }
    const yr = roofUnder(ctx, fx, fz) + 0.16; if (ctx.rk === 'thatch') { B3.chim.set(K.b.id, [K.x0 + fx, K.y0 + yr + 0.1, K.z0 + fz]); return; }
    // (the stack: its sides from the tiles up — never down into the roof's room —, its cap)
    const hw = 0.25, hTop = Math.max(...[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, c]) => roofUnder(ctx, fx + a * hw, fz + c * hw))) + 0.16 + 0.75; const col = (P.base && P.base[1]) || '#6f6a60';
    K.as('stone', () => { for (const [a0, c0, a1, c1, out] of [[-1, 1, 1, 1, [0, 0, 1]], [1, 1, 1, -1, [1, 0, 0]], [1, -1, -1, -1, [0, 0, -1]], [-1, -1, -1, 1, [-1, 0, 0]]]) {
      const x0 = fx + a0 * hw, z0 = fz + c0 * hw, x1 = fx + a1 * hw, z1 = fz + c1 * hw; K.quad([x0, roofUnder(ctx, x0, z0) + 0.14, z0], [x1, roofUnder(ctx, x1, z1) + 0.14, z1], [x1, hTop, z1], [x0, hTop, z0], col, out); }
      flatQ(K, [fx - hw, fz - hw, fx + hw, fz + hw], hTop, dim(col, 0.6), 1); K.box(fx, hTop, fz, 0.64, 0.1, 0.64, (P.base && P.base[0]) || '#8a8478'); });
    B3.chim.set(K.b.id, [K.x0 + fx, K.y0 + hTop + 0.15, K.z0 + fz]);
  }
  // a round hut from its shell: the ring of its wall from its foot to the eaves, open where the straight piece with the door
  // stands — that piece's face with its openings —, the ring of stones under it, the cone of straw from the shell's eaves up
  // as steep as the shell says, its underside, the knot on top
  function shellRound(g, gw, K, S) {
    const sh = S.shell, P = K.P; const cx = sh.cx, cz = sh.cz, r = sh.r, eave = sh.eave, rise = (sh.roof && sh.roof.h) || 2.4; const N2 = 22;
    const byLv = new Map(S.levels.map(l => [l.lv, l])); const l0 = S.levels.slice().sort((a, b) => a.y - b.y).find(l => l.kind !== 'porao') || S.levels[0];
    const ctx = { S, byLv, l0, foot: 0, eave, rk: 'thatch', flat: false, raised: false, k: 0, gw };
    K.footed = true; const base = P.base || ['#8a8478', '#6f6a60', '#a09a8e']; const st = outStuff(K, S, null);
    const seg = S.walls.find(w => w.kind === 'anel' || (w.outer && w.kind === 'parede'));
    const ang = p => Math.atan2(p[1] - cz, p[0] - cx); const on = (a, rr, y) => [cx + Math.cos(a) * rr, y, cz + Math.sin(a) * rr];
    let a0 = 0, sw = TAU, F = null;
    if (seg) { const mx = (seg.a[0] + seg.b[0]) / 2, mz = (seg.a[1] + seg.b[1]) / 2; const ax = Math.abs(seg.b[1] - seg.a[1]) < 1e-3; const out = ax ? Math.sign(mz - cz) || 1 : Math.sign(mx - cx) || 1;
      F = wside(seg, out); const A = F.P(F.u0, 0, 0), B = F.P(F.u1, 0, 0); const aA = ang([A[0], A[2]]), aB = ang([B[0], B[2]]); const md = v => ((v % TAU) + TAU) % TAU; const e = ang([mx, mz]);
      // (round the long way: from one end of the piece to the other, not through the piece's own side)
      const d = md(aA - aB); sw = md(e - aB) < d ? d - TAU : d; a0 = aB;
      K.as(st.pat, () => { for (const [p, a] of [[B, aB], [A, aA]]) { const q = on(a, r, 0); K.quad([p[0], 0, p[2]], [q[0], 0, q[2]], [q[0], eave, q[2]], [p[0], eave, p[2]], st.col, [p[0] - cx, 0, p[2] - cz]); } }); }
    K.as('stone', () => { for (let k = 0; k < N2; k++) { const p = on(TAU * k / N2, r + 0.04, 0), q = on(TAU * (k + 1) / N2, r + 0.04, 0); const lo = K.lo - K.y0 - 0.2; const am = TAU * (k + 0.5) / N2;
      K.quad([p[0], lo, p[2]], [q[0], lo, q[2]], [q[0], 0, q[2]], [p[0], 0, p[2]], dim(base[1], 0.78), [Math.cos(am), 0, Math.sin(am)]);
      K.quad([p[0], 0, p[2]], [q[0], 0, q[2]], on(TAU * (k + 1) / N2, r, 0), on(TAU * k / N2, r, 0), dim(base[1], 0.86), UP); } });
    // (the wall: a smooth ring, darker where the rain splashes at its foot)
    { const pts = []; for (let j = 0; j <= 1; j++) for (let i = 0; i <= N2; i++) { const a = a0 + sw * i / N2; pts.push(on(a, r, j ? eave : 0)); }
      const am = a0 + sw * (N2 >> 1) / N2; K.as(st.pat, () => K.sheet(pts, N2, 1, (X, Y) => { const f = 0.78 + 0.22 * G.clamp((Y - K.y0) / 0.7, 0, 1); return qc([st.col[0] * f, st.col[1] * f, st.col[2] * f]); }, [Math.cos(am), 0, Math.sin(am)])); }
    if (seg && F) sideFace(g, gw, K, ctx, F, 0, Math.min(eave, l0.y + (seg.h || eave)), [], false);
    // (the straw: a cone from a hand past the wall at the eaves up to the top, its edge thick, its underside, the knot)
    const th = rgbOf((P.thatch && P.thatch[0]) || '#c8a85a'), th2 = rgbOf((P.thatch && P.thatch[1]) || '#a3843f'); const R0 = r + 0.45, T = 0.35;
    const yAt = d => eave + rise * (1 - d / r) + T; const seed = K.b.id & 1023;
    const thCol = (X, Y, Z) => { const q = vnoise(X * 1.3, Z * 1.3 + Y, seed); const c2 = mixc(th, th2, q * 0.6 + K.hv(3) * 0.25); const f = 0.9 + vnoise(X * 3, Y * 3 + Z, seed + 2) * 0.18; return qc([c2[0] * f, c2[1] * f, c2[2] * f]); };
    const cone = []; const rows = 4; for (let j = 0; j <= rows; j++) for (let i = 0; i <= N2; i++) { const a = TAU * i / N2, f = j / rows; const d = R0 * (1 - f); cone.push(on(a, d + (f > 0 && f < 1 ? 0.04 : 0), yAt(d))); }
    K.as('thatch', () => { K.sheet(cone, N2, rows, thCol, [0, 1, 0]); const ring = []; for (let j = 0; j <= 1; j++) for (let i = 0; i <= N2; i++) ring.push(on(TAU * i / N2, R0 + 0.02, yAt(R0) - (j ? 0 : T)));
      K.sheet(ring, N2, 1, (X, Y, Z) => mixc(thCol(X, Y, Z), [70, 56, 36], 0.25), [-1, 0, 0]); });
    { const und = []; for (let j = 0; j <= 1; j++) for (let i = 0; i <= N2; i++) und.push(on(TAU * i / N2, j ? r : R0, j ? eave : yAt(R0) - T)); K.as('thatch', () => K.sheet(und, N2, 1, dim(th2, 0.6), [0, -1, 0])); }
    K.as('thatch', () => { K.cyl(cx, yAt(0) - 0.3, cz, 0.16, 0.32, dim(th2, 0.85)); K.cone(cx, yAt(0) - 0.02, cz, 0.15, 0.32, dim(th2, 0.75)); });
    const e = S.entrance; const side = (e && e.side) || doorSide(K.b); const od = SIDEO[side] || [0, 1];
    K.body = { x: cx, z: cz, sx: r * 2, sz: r * 2, door: e ? { side, o: od, a: od[1] ? e.x - cx : e.z - cz, w: (e.w || 0.9) + 0.5 } : null, shell: true };
    B3.chim.set(K.b.id, [K.x0 + cx, K.y0 + yAt(0.3) + 0.1, K.z0 + cz]);
    return yAt(0);
  }
  // the cut: what of the outside gives way where the inside is drawn (boxes in the world's metres, [x0, y0, z0, x1, y1, z1]) —
  // each door's and arch's own opening through its wall (its shut leaf with it, and a hand into the room where the leaf's
  // battens are), the court and its sides
  B3.cuts = function (b, S) {
    S = S || B3.shellOf(b); if (!S) return [];
    const L = TL(), X0 = b.x * L, Z0 = b.y * L, Y0 = G.Space.plinth(b).y0; const out = [];
    for (const h of S.holes) {
      if (h.kind === 'janela') continue; const w = S.byId.get(h.wall); const l = w && S.levels.find(q => q.lv === w.lv); if (!w || !l) continue;
      const ax = w.b[0] - w.a[0], az = w.b[1] - w.a[1]; const Lw = Math.hypot(ax, az) || 1; const tx = ax / Lw, tz = az / Lw; const along = Math.abs(tx) > 0.5;
      const cx = w.a[0] + tx * h.at, cz = w.a[1] + tz * h.at; const half = h.w / 2 + 0.012, th = w.t / 2 + 0.07; const y0 = l.y + (h.sill || 0) - 0.02, y1 = l.y + (h.sill || 0) + h.h + 0.012;
      out.push(along ? [X0 + cx - half, Y0 + y0, Z0 + cz - th, X0 + cx + half, Y0 + y1, Z0 + cz + th] : [X0 + cx - th, Y0 + y0, Z0 + cz - half, X0 + cx + th, Y0 + y1, Z0 + cz + half]);
    }
    const c = S.shell.court; if (c) out.push([X0 + c[0] - 0.003, Y0 + 0.008, Z0 + c[1] - 0.003, X0 + c[2] + 0.003, Y0 + S.shell.eave + 12, Z0 + c[3] + 0.003]);
    return out;
  };
  // (for the proofs: the outside of a building drawn from a plan given — or its own shell —: its solid, its panes, the shell
  // read, its cuts)
  B3.outside = function (b, plan, o) {
    o = o || {}; const In = G.Interiors; const S = plan ? (In.shellOfPlan ? outOfShell(In.shellOfPlan(plan), plan) : outOfPlan(plan)) : B3.shellOf(b); if (!S) return null;
    const g = R3.Geo(), gw = R3.Geo(), gp = R3.Geo(); const K = kit(g, b, gp, undefined, o.fine); shellHouse(g, gw, K, S); if (!K.footed) K.plinth();
    return { solid: g, glass: gw, S, cuts: B3.cuts(b, S), at: [K.x0, K.y0, K.z0], body: K.body };
  };
  // ------------------------------ the inside drawn round the body ------------------------------
  // The buildings with a plan made nearest the body — the one it is in, the ones by whose doors it stands: three at most —
  // have their inside drawn in the scene (Build3D.interior), its doors' leaves turning as the world has its doors, the lids
  // over the stairs' holes lifting while the body goes up through them, the fires of the hearths while someone is home; the
  // outside's own door openings and court put aside where the inside is (the cut: the solid material drops what stands in
  // those boxes). The people the world has inside stand where Interiors.placeOf puts them (People3D asks openPlace). Only
  // seen: nothing here writes the world nor makes a plan (Space.plan asks for one; the frame's pump makes it)
  const OPEN_R = 8, CLOSE_R = 12, OPEN_MAX = 3, CUT_MAX = 16;
  let opened = new Map(); const CUTU = { a: { value: [] }, b: { value: [] }, n: { value: 0 }, lo: { value: null }, hi: { value: null } };
  // (the ground over a sunken floor or a cellar of an inside drawn: given way — the realm's ground shader reads these)
  const SUNKU = B3.sunkU = { a: { value: [] }, b: { value: [] }, n: { value: 0 } };
  G.worldHooks.push(() => { B3.insideClear(); });
  B3.cutU = CUTU; B3.flames = [];
  B3.isOpen = id => opened.has(id);
  // (for the tests: what is drawn open — its leaves' and lids' turns, its cuts)
  B3.opened = () => [...opened.values()].map(o => ({ id: o.b.id, leaves: o.leaves.map(l => +l.cur.toFixed(2)), lids: o.lids.map(l => +l.cur.toFixed(2)), cuts: o.cuts.length, people: o.people || 0 }));
  B3.insideClear = function () { for (const o of opened.values()) dropOpen(o); opened = new Map(); CUTU.n.value = 0; SUNKU.n.value = 0; B3.flames.length = 0; placeMemo.clear(); };
  B3.insideTick = function (rdt, focus) {
    if (!THREE || !focus || !R3.scene || !R3.mats().inner || !G.Space.plan) return;
    const S = G.S, L = TL(); const v0 = G.Possess && G.Possess.body && G.Possess.body();
    const X = focus.X, Z = focus.Z; const dRect = b => Math.hypot(Math.max(b.x * L - X, 0, X - (b.x + b.w) * L), Math.max(b.y * L - Z, 0, Z - (b.y + b.h) * L));
    // (the candidates: the building the body is in, first; those whose lot is within reach — a plan asked for, the made ones)
    const want = []; const seen = new Set(); const inB = v0 && v0.inside ? S.buildings.get(v0.inside) : null;
    // (an open shell — a fair — has nothing to open: its outside shows its pieces, and its people where the plan puts them; a ruin
    // is drawn as a ruin, the old way, its plan's rubble not over it)
    const opens = (b, p) => !!p && b.type !== 'ruin' && !(p.shell && p.shell.kind === 'aberta');
    if (inB) { seen.add(inB.id); const p = inB.type === 'ruin' ? null : G.Space.plan(inB); if (opens(inB, p)) want.push([-1, inB, p]); }
    const tx = Math.floor(X / L), ty = Math.floor(Z / L), r = Math.ceil(OPEN_R / L) + 1;
    for (let y = ty - r; y <= ty + r; y++) for (let x = tx - r; x <= tx + r; x++) {
      if (!W.inb(x, y)) continue; const id = S.occ[y * N + x]; if (!id || seen.has(id)) continue; seen.add(id);
      const b = S.buildings.get(id); if (!b || b.type === 'ruin' || dRect(b) > OPEN_R) continue; const p = G.Space.plan(b); if (opens(b, p)) want.push([dRect(b), b, p]);
    }
    want.sort((a, c) => a[0] - c[0]); const keep = new Set(want.slice(0, OPEN_MAX).map(w => w[1].id));
    // (those gone far, gone, or with another plan now: given back; those whose keeping pieces hold another share now — a second of
    // the world apart —: drawn again)
    for (const [id, o] of opened) { const b = S.buildings.get(id); const p = b && G.Space.planMade(b);
      let refill = false; if (b && S.clock - o.fillT >= 1) { o.fillT = S.clock; refill = B3.fillSig(b) !== o.fill; }
      if (!b || p !== o.p || refill || (!keep.has(id) && (dRect(b) > CLOSE_R || opened.size > OPEN_MAX))) { dropOpen(o); opened.delete(id); } }
    // (one made a frame, at most: a few milliseconds)
    for (const [, b, p] of want.slice(0, OPEN_MAX)) if (!opened.has(b.id) && opened.size < OPEN_MAX) { const o = makeOpen(b, p); if (o) opened.set(b.id, o); break; }
    B3.flames.length = 0; const boxes = []; let ns = 0;
    for (const o of opened.values()) { stepOpen(o, rdt, focus); for (const c of o.cuts) if (boxes.length < CUT_MAX) boxes.push(c);
      for (const c of o.sunk) if (ns < 4) { SUNKU.a.value[ns].set(c[0], c[1], c[2]); SUNKU.b.value[ns].set(c[3], c[4], c[5]); ns++; } }
    setCut(boxes); SUNKU.n.value = ns;
  };
  // (how full each keeping piece of a building is, as the world says — Interiors.state —, and its signature by the ninth: what is
  // shown on its shelves, in its bays and bins; drawn again when a ninth changes, and only then)
  B3.fillOf = function (b) { const In = G.Interiors; const st = In && In.state ? In.state(b) : null; const out = {}; if (st) for (const id in st.items) if (Number.isFinite(st.items[id].fill)) out[id] = st.items[id].fill; return out; };
  const fillSig = f => Object.keys(f).sort().map(id => id + ':' + Math.round(f[id] * 9)).join(',');
  B3.fillSig = b => fillSig(B3.fillOf(b));
  function makeOpen(b, p) {
    const MI = R3.mats().inner; const q = R3.Q(); const fill = B3.fillOf(b); const out = B3.interior(p, b, { fine: q.detail ? undefined : false, fill }); if (!out) return null;
    const grp = new THREE.Group(); grp.matrixAutoUpdate = false; const geos = [];
    const add = g => { if (!g || g.empty) return; const geo = g.build(true); geos.push(geo); const m = new THREE.Mesh(geo, MI); m.receiveShadow = true; m.matrixAutoUpdate = false; grp.add(m); };
    for (const k in out.lv) add(out.lv[k]); add(out.roof);
    const piece = (f, order) => { const geo = f.g.build(true); geos.push(geo); const m = new THREE.Mesh(geo, MI); m.receiveShadow = true; m.rotation.order = order || 'XYZ'; m.position.set(f.at[0], f.at[1], f.at[2]); m.rotation.y = f.yaw; grp.add(m); return m; };
    const leaves = out.leaf.map(f => ({ f, m: piece(f), cur: 0, was: undefined }));
    const lids = out.hatch.map(f => ({ f, m: piece(f, 'YXZ'), cur: 0 }));
    R3.scene().add(grp);
    // (the floors under the street — a sunken one, a cellar: the ground over them given way, from their floor to the plinth's top)
    const L = TL(), X0 = b.x * L, Z0 = b.y * L, Y0 = G.Space.plinth(b).y0; const sunk = [];
    for (const l of p.levels) if (l.y < -0.05 && l.area) sunk.push([X0 + l.area[0] + 0.02, Y0 + l.y - 0.1, Z0 + l.area[1] + 0.02, X0 + l.area[2] - 0.02, Y0 - 0.01, Z0 + l.area[3] - 0.02]);
    return { b, p, out, grp, geos, leaves, lids, cuts: B3.cuts(b, B3.shellOf(b)), sunk, homeT: -1, home: false, fill: fillSig(fill), fillT: G.S.clock };
  }
  function dropOpen(o) { if (o.grp.parent) o.grp.parent.remove(o.grp); for (const g of o.geos) g.dispose(); }
  function stepOpen(o, rdt, focus) {
    const In = G.Interiors, b = o.b; const k = 1 - Math.exp(-7 * rdt);
    // (the leaves: open as the world has its doors; a creak and a knock as one turns, as loud as it is near)
    for (const l of o.leaves) {
      const st = In.doorState(b, l.f.id); const open = !!st && st.state === 'aberta'; const w = open ? l.f.swing * 1.45 : 0;
      if (l.was !== undefined && open !== l.was && G.Audio && G.Audio.play) { const d = Math.hypot(l.f.at[0] - focus.X, l.f.at[2] - focus.Z); const v = G.clamp(1 - d / 14, 0, 1); if (v > 0.05) G.Audio.play(open ? 'door' : 'doorShut', v); }
      l.was = open; l.cur += (w - l.cur) * k; l.m.rotation.y = l.f.yaw + l.cur;
    }
    // (a lid lifts while the body goes through its hole: the flight it climbs on the stair the lid closes)
    const fl = G.Avatar && G.Avatar.flight ? G.Avatar.flight() : null;
    for (const l of o.lids) { const up = fl && fl.b === b.id && fl.s === l.f.id ? 1.35 : 0; l.cur += (up - l.cur) * k; l.m.rotation.x = -l.cur; }
    // (the hearths burn while someone is home — the body too —, a little lower by day)
    if (o.homeT !== G.S.clock) { o.homeT = G.S.clock; let n = 0; for (const v of G.S.villagers.values()) if (v.inside === b.id) n++; o.people = n; o.home = n > 0; }
    if (o.home && o.out.light.length) { const day = G.Render && G.Render.nightness ? 1 - G.clamp(G.Render.nightness() * 1.4, 0, 1) : 0;
      for (const Lt of o.out.light) B3.flames.push([Lt[0], Lt[1] - 0.3, Lt[2], (0.45 + Lt[3] * 0.45) * (1 - day * 0.35)]); }
  }
  // (the boxes of the cut, to the solid material: the box round them all first — most of the town is outside it)
  function setCut(boxes) {
    const n = Math.min(boxes.length, CUT_MAX); CUTU.n.value = n; if (!n) return;
    const lo = CUTU.lo.value, hi = CUTU.hi.value; lo.set(1e9, 1e9, 1e9); hi.set(-1e9, -1e9, -1e9);
    for (let k = 0; k < n; k++) { const c = boxes[k]; CUTU.a.value[k].set(c[0], c[1], c[2]); CUTU.b.value[k].set(c[3], c[4], c[5]); lo.min(CUTU.a.value[k]); hi.max(CUTU.b.value[k]); }
  }
  // where someone the world has inside a building drawn open stands, sits, lies or works: Interiors.placeOf, in the world's
  // metres — { X, Y, Z, yaw, st } — or null (not open: not drawn); the same for a step of the world
  const placeMemo = new Map(); let placeT = -1;
  B3.openPlace = function (v) {
    if (!v || !(v.inside > 0)) return null; let o = opened.get(v.inside);
    // (an open shell — a fair —, its plan made: the same, without opening it)
    if (!o) { const b = G.S.buildings.get(v.inside); const S = b && B3.shellOf(b); if (!S || S.shell.kind !== 'aberta' || !S.p || !S.p.ok) return null; o = { b, p: S.p }; }
    if (placeT !== G.S.clock) { placeMemo.clear(); placeT = G.S.clock; }
    let pl = placeMemo.get(v.id); if (pl !== undefined) return pl; pl = null;
    const q = G.Interiors.placeOf(v);
    if (q && q.b === o.b) { const l = o.p.levels.find(x => x.lv === q.lv); const L = TL(); const y0 = G.Space.plinth(o.b).y0;
      pl = { X: o.b.x * L + q.x, Z: o.b.y * L + q.z, Y: y0 + (l ? l.y : 0) + (q.y || 0) + FLOOR_UP, yaw: Math.PI / 2 - (q.ry || 0), st: { deitado: 'sleep', sentado: 'sit', trabalhando: 'interact' }[q.pose] || 'idle' }; }
    placeMemo.set(v.id, pl); return pl;
  };
  B3.bounds = function (b) {
    const g = R3.Geo(), gw = R3.Geo(); const K = kit(g, b); draw(g, gw, K, false);
    const P = g.p; if (!P.length) return null; const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
    for (let k = 0; k < P.length; k += 3) for (let a = 0; a < 3; a++) { lo[a] = Math.min(lo[a], P[k + a]); hi[a] = Math.max(hi[a], P[k + a]); }
    return { lo, hi, floor: K.y0, ground: [K.lo, K.hi] };
  };
  // (what a building costs to draw: its triangles — the solid body, the panes, the swaying grass — with what lies about it)
  B3.cost = function (b) {
    const g = R3.Geo(), gw = R3.Geo(), gp = R3.Geo(); const K = kit(g, b, gp); draw(g, gw, K, true);
    return { solid: g.p.length / 9, glass: gw.p.length / 9, plants: gp.p.length / 9 };
  };
  // the drawing's own proof (for the tests): every building near the body (or the ones given) drawn again — no number that
  // is not a number, nothing far out of its lot, nothing deep in the ground, a floor on its ground; and what lies about
  // them (Props3D.check). Gives back the list of what is wrong
  // (how much of the lying surfaces of a drawing — the faces turned up: a step, a plank, a slab — the ground as it is drawn
  // comes through: part of the face over the ground, part under it, in square metres; the faces all under it are hidden)
  function cutByGround(P, Nn) {
    const L = TL(); let area = 0, at = null, worst = 0;
    for (let k = 0; k + 8 < P.length; k += 9) {
      if (Nn[k + 1] < 0.85 || Nn[k + 4] < 0.85 || Nn[k + 7] < 0.85) continue;
      let lo = 1e9, hi = -1e9; const cx = (P[k] + P[k + 3] + P[k + 6]) / 3, cy = (P[k + 1] + P[k + 4] + P[k + 7]) / 3, cz = (P[k + 2] + P[k + 5] + P[k + 8]) / 3;
      for (const [X, Y, Z] of [[P[k], P[k + 1], P[k + 2]], [P[k + 3], P[k + 4], P[k + 5]], [P[k + 6], P[k + 7], P[k + 8]], [cx, cy, cz]]) { const d = Y - drawnAt(X / L, Z / L); if (d < lo) lo = d; if (d > hi) hi = d; }
      if (lo < -0.015 && hi > 0.005) { const ux = P[k + 3] - P[k], uz = P[k + 5] - P[k + 2], vx = P[k + 6] - P[k], vz = P[k + 8] - P[k + 2]; const a = Math.abs(ux * vz - uz * vx) / 2; area += a; if (-lo > worst) { worst = -lo; at = [+(cx / L).toFixed(1), +(cz / L).toFixed(1)]; } }
    }
    return { area, at, worst };
  }
  B3.check = function (list) {
    const S = G.S; const out = []; const L = TL(); if (!SH) return out; // (only once the 3D is made)
    if (!list) { const f = G.Possess && G.Possess.body && G.Possess.body(); const cx = f ? f.x : N / 2, cy = f ? f.y : N / 2; list = [...S.buildings.values()].filter(b => G.dist(b.x + b.w / 2, b.y + b.h / 2, cx, cy) < 14); }
    for (const b of list) {
      const g = R3.Geo(), gw = R3.Geo(), gp = R3.Geo(); const K = kit(g, b, gp); draw(g, gw, K, false);
      const P = g.p; let bad = 0, lo = 1e9, x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
      for (const arr of [P, g.n, gw.p, gp.p]) for (let k = 0; k < arr.length; k++) if (!Number.isFinite(arr[k])) bad++;
      // (the steps before a door that come down into the street stand out of the lot by rights, on the street's ground — lower
      // than the lot's on a slope —: not counted in how far it goes, nor in how low; each tread stands on the ground under it,
      // a hand into it — Space.doorFlight —, and its top over it: the cut by the ground below says so)
      const onStep = (X, Z) => !!K.steps && K.steps.some(r => X >= r[0] - 0.02 && X <= r[1] + 0.02 && Z >= r[2] - 0.02 && Z <= r[3] + 0.02);
      for (let k = 0; k < P.length; k += 3) { if (onStep(P[k], P[k + 2])) continue; lo = Math.min(lo, P[k + 1]); x0 = Math.min(x0, P[k]); x1 = Math.max(x1, P[k]); z0 = Math.min(z0, P[k + 2]); z1 = Math.max(z1, P[k + 2]); }
      const tag = `${b.type}#${b.id}`;
      if (bad) out.push(`${tag}: ${bad} números que não são números`);
      const over = Math.max(b.x * L - x0, x1 - (b.x + b.w) * L, b.y * L - z0, z1 - (b.y + b.h) * L);
      if (b.type !== 'doca' && P.length && over > 1.6) out.push(`${tag}: ${over.toFixed(2)} m fora do lote`);
      if (P.length && lo < K.lo - 1.2 && b.type !== 'doca') out.push(`${tag}: enterrado ${(K.lo - lo).toFixed(2)} m`); // (a quay's posts go down into the sea)
      if (P.length && lo > K.hi + 0.35) out.push(`${tag}: flutua ${(lo - K.hi).toFixed(2)} m`);
      if (K.y0 < K.lo - 0.05) out.push(`${tag}: piso abaixo do chão`);
      const cut = cutByGround(P, g.n); if (cut.area > 0.2) out.push(`${tag}: ${cut.area.toFixed(2)} m² de superfície deitada cortada pelo chão (até ${(cut.worst * 100).toFixed(0)} cm), perto de ${cut.at}`);
    }
    // (the walks of planks of the chunks of these buildings, drawn again for the proof alone: none cut by the ground)
    const C = 16, seen = new Set(); for (const b of list) { const cx = Math.floor(b.x / C), cy = Math.floor(b.y / C); const key = cx + ',' + cy; if (seen.has(key)) continue; seen.add(key);
      const g = R3.Geo(); walksInto(g, cx * C, cy * C, C, false); if (!g.p.length) continue; const cut = cutByGround(g.p, g.n);
      if (cut.area > 0.2) out.push(`passarelas do pedaço ${key}: ${cut.area.toFixed(2)} m² cortados pelo chão (até ${(cut.worst * 100).toFixed(0)} cm), perto de ${cut.at}`); }
    if (G.Props3D && G.Props3D.check) for (const p of G.Props3D.check(list)) out.push(p);
    return out;
  };
  // (for Props3D's proof: the building drawn again, with what lies about it, at full detail; its body's box and its door)
  B3.propsOf = function (b) { const g = R3.Geo(), gw = R3.Geo(), gp = R3.Geo(); const K = kit(g, b, gp, undefined, true); draw(g, gw, K, true); return K.body || null; };
  // (for the tests: the patterns a building's body is drawn with — {pattern code: points} — and the ones its people's
  // walls and roofs should have)
  B3.patsOf = function (b) {
    const g = R3.Geo(), gw = R3.Geo(); const K = kit(g, b); draw(g, gw, K, false);
    const out = {}; for (const q of g.q || []) out[q] = (out[q] || 0) + 1; const st = stuff(b); const P = palOf(b);
    const roof = P.kind === 'flat' ? (st.tile === 'mud' ? 'mud' : 'slab') : P.kind === 'turf' || styleOf(b) === 'nordico' ? 'turf' : P.kind === 'thatch' ? 'thatch' : st.tile;
    // (the half-timber of the classical lands is timber standing out of plaster now: its wall is the plaster between)
    return { pats: out, wall: PAT[styleOf(b) === 'nordico' ? 'plankV' : st.wall === 'frame' ? 'plaster' : st.wall], roof: PAT[roof] };
  };
  // what stands on a tile, and how high (for the camera, so it does not go through roofs): the top its near picture really
  // reaches, once drawn; the type's height before that
  B3.heightAt = function (i) {
    const S = G.S; const b = S.occ[i] && S.buildings.get(S.occ[i]);
    if (b && b.blocks) { const t = B3.tops.get(b.id); return t === undefined ? HEIGHT[b.type] || 5 : Math.max(1, t - W.maxH(i % N, (i / N) | 0, 1, 1) * HM()); }
    const w = S.wall[i]; return w === 1 || w === 2 || w === 4 ? 6 : 0;
  };
  // is a point (metres) in the stones of a wall or a gate, give or take m? (no wall here: false)
  B3.wallSolid = function (X, Y, Z, m) {
    const x = Math.floor(X / TL()), y = Math.floor(Z / TL()); if (!W.inb(x, y)) return false; const bs = wallBoxes(x, y); if (!bs) return false;
    for (const q of bs) if (Math.abs(X - q[0]) < q[3] / 2 + m && Math.abs(Z - q[2]) < q[5] / 2 + m && Y > q[1] - m && Y < q[1] + q[4] + m) return true;
    return false;
  };
})(window.G);
