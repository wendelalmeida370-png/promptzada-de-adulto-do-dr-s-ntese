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
  let THREE = null, R3 = null, SH = null, glass = null, PM = null, IDM = null, PEG = null;
  const TAU = Math.PI * 2;
  B3.init = function (three, realm) {
    THREE = three; R3 = realm; SH = realm.SH; glass = new THREE.MeshPhongMaterial({ color: 0x1c2630, specular: 0x8aa0b4, shininess: 90, emissive: 0xffb860, emissiveIntensity: 0 });
    PM = new THREE.Matrix4(); IDM = new THREE.Matrix4(); // (a slanted box's frame, and the frame of the sheets already in place)
    // (a timber's end out of a gable: eight sides, its end chamfered — a purlin, a peg; open at its foot, in the wall)
    PEG = new THREE.LatheGeometry([[0.5, 0], [0.5, 0.88], [0.4, 1], [0, 1]].map(([r, y]) => new THREE.Vector2(r, y)), 8);
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
    classico: { wall: 'frame', base: 'stone', tile: 'tile' }, grego: { wall: 'plaster', base: 'marble', tile: 'tile' }, romano: { wall: 'plaster', base: 'stone', tile: 'tile' },
    egipcio: { wall: 'mud', base: 'stone', tile: 'mud' }, asteca: { wall: 'plaster', base: 'stone', tile: 'thatch' }, nordico: { wall: 'plankV', base: 'stone', tile: 'shingle' },
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
  B3.dress = function (mat) {
    mat.onBeforeCompile = sh => {
      sh.uniforms.uDet = { value: G.Ground3D.detail() }; Object.assign(sh.uniforms, G.Ground3D.U3());
      sh.vertexShader = 'attribute float aP; varying vec3 vPP; varying vec3 vPN; flat varying float vPat;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n vPP = (modelMatrix * vec4(transformed, 1.0)).xyz; vPN = normalize(mat3(modelMatrix) * objectNormal); vPat = aP;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + G.Ground3D.texGLSL() + PFRAG).replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
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
    let lo = 1e9, hi = -1e9; for (let ty = b.y; ty <= b.y + b.h; ty++) for (let tx = b.x; tx <= b.x + b.w; tx++) { const h = W.hAt(Math.min(N, tx), Math.min(N, ty)) * HM(); lo = Math.min(lo, h); hi = Math.max(hi, h); }
    // (the floor: a house stands on a plinth, as the god's view draws it; a field, a fence, a square lies on the ground — L-105)
    const y0 = hi + (BASELESS[b.type] ? 0.12 : 0.4);
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
      // (the local height of the ground at a point of the lot: what stands outside the walls of a footed house stands on it)
      gy: (x, z) => W.hAt(Math.min(N - 0.001, (x0 + x) / L), Math.min(N - 0.001, (z0 + z) / L)) * HM() - y0,
    };
    return K;
  }
  const BASELESS = { farm: 1, horta: 1, plantacao: 1, vinhedo: 1, doca: 1, praca: 1, cemetery: 1, curral: 1, cercado: 1, campfire: 1 };
  // a building drawn whole: its type's shapes, then its base (the plinth under the lot, unless it stands on its own footing),
  // then what lies about it (Props3D: only seen, and only where the machine carries detail)
  function draw(g, gw, K, props) {
    const f = KIT[K.b.type]; if (f) f(g, gw, K); else house(g, gw, K);
    if (!K.footed) K.plinth();
    if (props && K.fine && G.Props3D && K.prog >= 1) G.Props3D.into(K);
  }
  // (stones laid round a footing: courses from the floor down to the ground, each stone its own size and tone — the
  // house's id, not chance; the core behind them reaches below the lowest ground)
  function footing(K, x, z, sx, sz, dressed) {
    const P = K.P; const base = P.base || ['#8a8478', '#6f6a60', '#a09a8e']; K.footed = true; // (dressed: squared blocks in even courses, as the classical lands lay them)
    K.as('stone', () => K.box(x, K.lo - K.y0 - 0.2, z, sx + 0.08, K.y0 - K.lo + 0.2, sz + 0.08, dim(base[1], 0.78)));
    if (!K.fine) return;
    // (an old house on damp ground has moss on its stones — more on the lower courses, on some stones more than others)
    const mossy = G.clamp((K.hv(3) + K.hv(4)) * 0.5 - 0.28, 0, 0.42) * (dressed ? 0.5 : 1);
    const sides = [[[x - sx / 2, z + sz / 2], [x + sx / 2, z + sz / 2], [0, 1]], [[x + sx / 2, z - sz / 2], [x - sx / 2, z - sz / 2], [0, -1]], [[x + sx / 2, z + sz / 2], [x + sx / 2, z - sz / 2], [1, 0]], [[x - sx / 2, z - sz / 2], [x - sx / 2, z + sz / 2], [-1, 0]]];
    let n = 0;
    K.as('rock', () => { for (const [A0, B, o] of sides) {
      const len0 = Math.hypot(B[0] - A0[0], B[1] - A0[1]); const dx = (B[0] - A0[0]) / len0, dz = (B[1] - A0[1]) / len0;
      const A = [A0[0] - dx * 0.17, A0[1] - dz * 0.17], len = len0 + 0.17; // (each side starts round its corner: no notch there)
      for (let row = 0, top = 0; row < 6; row++) {
        const ch = dressed ? 0.3 : 0.27 + K.hv(200 + row) * 0.1; let any = false;
        for (let t = row % 2 ? (dressed ? -0.3 : -0.18) : 0; t < len;) {
          const h1 = K.hv(300 + n), h2 = K.hv(500 + n), h3 = K.hv(700 + n); n++;
          const l = Math.min(len - t, dressed ? 0.6 : 0.34 + h1 * 0.34); if (l < 0.12) break; const m = Math.max(0, t) + (Math.min(len, t + l) - Math.max(0, t)) / 2;
          const pr = dressed ? 0.05 : 0.05 + h2 * 0.035; const px = A[0] + dx * m + o[0] * pr, pz = A[1] + dz * m + o[1] * pr;
          if (top - ch * 0.15 > K.gy(px, pz)) { any = true; let cc = dressed ? mixc(base[0], base[2], h1 * 0.6).map(v => v * (0.94 + h3 * 0.1)) : mixc(base[Math.floor(h1 * 3)], base[Math.floor(h3 * 2.99)], 0.5 * h2).map(v => v * (0.86 + h3 * 0.26));
            if (mossy) cc = mixc(cc, [84, 100, 60], mossy * (0.45 + row * 0.22) * (h2 > 0.45 ? 1 : 0.25));
            K.rbox(px, top - ch + 0.01, pz, Math.min(len, t + l) - Math.max(0, t) - (dressed ? 0.02 : 0.035), ch - (dressed ? 0.02 : 0.035), dressed ? 0.2 : 0.2 + h3 * 0.08, cc, Math.atan2(-dz, dx) + (dressed ? 0 : (h2 - 0.5) * 0.08), 0, dressed ? 0 : (h3 - 0.5) * 0.05); }
          t += l;
        }
        top -= ch; if (!any) break;
      }
    } });
  }
  // tall grass at the foot of the walls, where the ground round the house is grass and the snow does not lie (the rule of the
  // ground's own grass: ground3d), none before the door: the house sits in the ground, not on it
  function wallGrass(K, x, z, sx, sz, door) {
    if (!K.fine) return; const S = G.S, T = G.T, L = K.L; let k = 0;
    const grassy = (X, Z) => { const tx = Math.floor((K.x0 + X) / L), ty = Math.floor((K.z0 + Z) / L); if (!W.inb(tx, ty)) return false; const i = ty * N + tx;
      const t = S.type[i]; const snow = S.temp ? G.clamp((0.235 - S.temp[i] / 255) / 0.07, 0, 1) : 0; return (t === T.GRASS || t === T.MEADOW) && snow < 0.45 && !(S.burnt[i] > 0) && !S.road[i]; };
    for (const W2 of wallsOf(sx, sz)) { const n = Math.floor(W2.len / 0.24);
      for (let q = 0; q < n; q++) { const h1 = K.hv(800 + k), h2 = K.hv(1000 + k); k++; const a = -W2.len / 2 + (q + 0.2 + h1 * 0.6) * W2.len / n;
        if (door && door.side === W2.side && Math.abs(a - door.a) < door.w / 2 + 0.35) continue; if (h2 < 0.25) continue;
        const out = 0.2 + h2 * 0.14; const px = x + (W2.ax ? a : W2.o[0] * (sx / 2 + out)), pz = z + (W2.ax ? W2.o[1] * (sz / 2 + out) : a); if (!grassy(px, pz)) continue;
        const X = K.x0 + px, Z = K.z0 + pz, Y = K.y0 + K.gy(px, pz) - 0.02; const len = 0.22 + h1 * 0.3;
        for (let b = 0; b < 2; b++) { const ang = h1 * 9 + b * 2.2; const lean = 0.08 + b * 0.05; K.gp.blade(X, Y, Z, 0.07, ang, X + W2.o[0] * lean + Math.cos(ang) * 0.05, Y + len * (1 - b * 0.25), Z + W2.o[1] * lean + Math.sin(ang) * 0.05, [74, 96, 48], mixc([128, 146, 78], [176, 168, 104], h2 * 0.7), 0.7); } } }
  }
  // (how far it is from a wall of a body (centre x, z, sx × sz) facing o to the edge of its lot)
  const stripOf = (K, x, z, sx, sz, o) => (o[0] > 0 ? K.w - (x + sx / 2) : o[0] < 0 ? x - sx / 2 : o[1] > 0 ? K.d - (z + sz / 2) : z - sz / 2);
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
    const stone = P.base ? P.base[2] : '#a09a8e'; const sh2 = st === 'grego' ? (P.trim || '#3f6fb0') : [[86, 104, 70], [104, 74, 50], [70, 92, 104]][Math.floor(K.hv(17) * 3)];
    let wk = 0;
    // (a window on the face whose outward direction is (ox, oz), at (px, py, pz), ww wide and hh high)
    const win = (px, py, pz, ox, oz, ww, hh) => {
      const ax = oz !== 0; const k = wk++; // (the face runs along X)
      gw.put(SH.box, R3.mat(K.x0 + px + ox * 0.03, K.y0 + py, K.z0 + pz + oz * 0.03, ax ? 0 : Math.PI / 2, ww, hh, 0.06), '#2a3440');
      const fx = (dx, dy, w2, h2, d2, col) => K.box(px + ox * 0.06 + (ax ? dx : 0), py + dy, pz + oz * 0.06 + (ax ? 0 : dx), ax ? w2 : d2, h2, ax ? d2 : w2, col || tc);
      if (framed) { const fc = tc; const fw = st === 'asteca' ? 0.13 : 0.09;
        fx(0, -0.08, ww + 0.2, 0.08, 0.1, fc); fx(0, hh, ww + 0.2, 0.09, 0.1, fc); fx(-ww / 2 - 0.05, 0, fw, hh, 0.1, fc); fx(ww / 2 + 0.05, 0, fw, hh, 0.1, fc); if (st === 'classico' || st === 'grego') fx(0, 0, 0.05, hh, 0.07); }
      K.as('stone', () => K.box(px + ox * 0.1, py - 0.14, pz + oz * 0.1, ax ? ww + 0.3 : 0.2, 0.08, ax ? 0.2 : ww + 0.3, stone));
      // (a lintel of stone over it in the stone-building lands)
      if (st === 'romano' || st === 'grego' || st === 'egipcio') K.as('stone', () => fx(0, hh + 0.09, ww + 0.34, 0.12, 0.08, st === 'egipcio' ? (P.trim || '#2f8f8a') : stone));
      if (st === 'egipcio') K.as('beam', () => { for (const e of [-0.22, 0, 0.22]) fx(e * ww, 0, 0.035, hh, 0.04, '#5a4430'); });
      if (st === 'romano' && K.fine) K.as('iron', () => { for (const e of [-0.25, 0.25]) fx(e * ww, 0, 0.025, hh, 0.04, '#2e2c2a'); });
      if (shut) K.as('plankV', () => { const open = K.hv(110 + k) < 0.7; for (const s2 of [-1, 1]) { if (open) fx(s2 * (ww / 2 + 0.3), 0, ww * 0.5, hh, 0.05, sh2); else fx(s2 * ww * 0.25, 0, ww * 0.5, hh, 0.06, sh2); } });
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
    K.as('plankV', () => bx(0, y, 0.03, dw, dh, 0.1, dc));
    // (its panels: rails across the leaf and a stile down its middle)
    K.as('beam', () => { for (const f of [0.2, 0.55, 0.88]) bx(0, y + dh * f - 0.04, 0.085, dw - 0.06, 0.08, 0.02, dim(dc, 0.82)); bx(0, y + 0.08, 0.085, 0.07, dh - 0.16, 0.02, dim(dc, 0.82)); });
    // (its frame and lintel, and the step)
    const tr = P.trim || '#6b4a30'; const sl = st === 'romano' || st === 'grego' || st === 'egipcio' || st === 'asteca';
    K.as('beam', () => { for (const s2 of [-1, 1]) bx(s2 * (dw / 2 + 0.07), y, 0.07, 0.14, dh, 0.14, tr); });
    K.as(sl ? 'stone' : 'beam', () => bx(0, y + dh, 0.08, dw + 0.42, 0.2, 0.18, sl ? (st === 'asteca' ? (P.trim || '#b33a2a') : stone) : tr));
    if (st === 'romano') K.as('stone', () => { for (const s2 of [-1, 1]) { const a = s2 * (dw / 2 + 0.28); const A = [dx + (ax ? a : 0) + o[0] * 0.13, y + dh + 0.22, dz + (ax ? 0 : a) + o[1] * 0.13], B = [dx + o[0] * 0.13, y + dh + 0.58, dz + o[1] * 0.13]; const da = -a, dy = 0.36, l = Math.hypot(da, dy); K.bar(A, B, [ax ? -dy / l * 0.12 : 0, da / l * 0.12, ax ? 0 : -dy / l * 0.12], [o[0] * 0.12, 0, o[1] * 0.12], stone); } });
    if (st === 'grego') gw.put(SH.box, R3.mat(K.x0 + dx + o[0] * 0.03, K.y0 + y + dh + 0.22, K.z0 + dz + o[1] * 0.03, ax ? 0 : Math.PI / 2, dw * 0.8, 0.26, 0.05), '#2a3440');
    if (st === 'asteca') K.as('plaster', () => { bx(0, y + dh + 0.2, 0.1, dw + 0.7, 0.14, 0.2, P.trim2 || '#2fae8f'); bx(0, y + dh + 0.34, 0.1, dw + 0.25, 0.1, 0.2, P.trim || '#b33a2a'); });
    if (K.fine) K.as('iron', () => { for (const f of [0.22, 0.78]) bx(-dw * 0.3, y + dh * f, 0.09, dw * 0.36, 0.045, 0.012, '#2e2b28'); const r = [dx + (ax ? dw * 0.3 : 0) + o[0] * 0.09, y + dh * 0.5, dz + (ax ? 0 : dw * 0.3) + o[1] * 0.09]; K.log(r, [r[0] + o[0] * 0.03, r[1], r[2] + o[1] * 0.03], 0.055, st === 'grego' || st === 'romano' ? '#8a7440' : '#2e2b28'); });
    // (the step: down to the ground before a footed house — no further out than a hand past the lot)
    const sdp = Math.min(0.7, stripOf(K, x, z, sx, sz, o) + 0.15), sn = 0.1 + sdp / 2;
    const sp = [dx + o[0] * sn, 0, dz + o[1] * sn]; const gy = K.footed ? Math.min(-0.4, K.gy(sp[0], sp[2]) - 0.04) : -0.4;
    K.as('stone', () => bx(0, gy, sn, dw + 0.5, 0.42 + (-0.4 - gy), sdp, stone));
  }
  // a roof of the people's kind over a box of sx × sz (centre x, z) whose walls end at y: gable, hip, flat with its
  // parapet, thatch or turf — with the god's pitches (the roof of a cottage is as tall as its walls), eaves that stand
  // out, the ends of a gable closed in the wall's colour, a ridge; the pattern of its tiles, straw or grass
  function roofOf(K, x, z, sx, sz, y, kind, cols, ridgeZ) {
    const P = K.P; const r = cols || P.roof || ['#b85a3c', '#94452d', '#7a3826']; kind = kind || P.kind || 'gable';
    const st = stuff(K.b); const ov = 0.42, alongZ = ridgeZ !== undefined ? ridgeZ : sz > sx + 0.01 || (K.b.v === 1 && Math.abs(sx - sz) < 0.01);
    if (kind === 'flat') {
      K.as(st.tile === 'mud' ? 'mud' : 'slab', () => K.box(x, y, z, sx + 0.12, 0.25, sz + 0.12, P.top || P.wl));
      const pc = (P.par && P.par[0]) || P.wl; const civ = K.st;
      if (civ === 'egipcio') {
        // (the Egyptian cornice: the wall's top curving out in a gorge, the round moulding under it, a flat band over it)
        const yb = y + 0.08, H2 = 0.5, F = 0.26; const c2 = (P.par && P.par[1]) || dim(pc, 0.88);
        K.as('plaster', () => { for (const W2 of wallsOf(sx, sz)) {
          const a0 = -W2.len / 2, a1 = W2.len / 2; const p = (a, up, out) => [x + (W2.ax ? a * (1 + out * 2 / W2.len) : W2.o[0] * (sx / 2 + out)), yb + up, z + (W2.ax ? W2.o[1] * (sz / 2 + out) : a * (1 + out * 2 / W2.len))];
          // (the gorge in three bands, flaring more as it rises)
          const prof = [[0, 0], [0.18, 0.05], [0.34, 0.14], [H2, F]];
          for (let k = 0; k < 3; k++) { const [u0, f0] = prof[k], [u1, f1] = prof[k + 1]; K.tri3(p(a0, u0, f0), p(a1, u0, f0), p(a1, u1, f1), k ? pc : c2, k ? pc : c2, pc, [W2.o[0], 0.3, W2.o[1]]); K.tri3(p(a0, u0, f0), p(a1, u1, f1), p(a0, u1, f1), k ? pc : c2, pc, pc, [W2.o[0], 0.3, W2.o[1]]); }
          K.box(...(W2.ax ? [x, yb + H2, z + W2.o[1] * (sz / 2 + F / 2 - 0.02), sx + F * 2, 0.1, F + 0.04] : [x + W2.o[0] * (sx / 2 + F / 2 - 0.02), yb + H2, z, F + 0.04, 0.1, sz + F * 2]), dim(pc, 0.95));
          K.box(...(W2.ax ? [x, yb + H2 + 0.1, z + W2.o[1] * (sz / 2 - 0.05), sx + 0.1, 0.32, 0.22] : [x + W2.o[0] * (sx / 2 - 0.05), yb + H2 + 0.1, z, 0.22, 0.32, sz + 0.1]), pc);
        }
        // (the torus: a round moulding along the top of the walls, under the gorge)
        for (const W2 of wallsOf(sx, sz)) { const a = W2.len / 2 + 0.06; const A = W2.ax ? [x - a, yb - 0.02, z + W2.o[1] * (sz / 2 + 0.03)] : [x + W2.o[0] * (sx / 2 + 0.03), yb - 0.02, z - a], B = W2.ax ? [x + a, yb - 0.02, z + W2.o[1] * (sz / 2 + 0.03)] : [x + W2.o[0] * (sx / 2 + 0.03), yb - 0.02, z + a]; K.log(A, B, 0.07, dim(pc, 0.9)); } });
        return y + H2 + 0.42;
      }
      // (a parapet round the terrace, its coping a little wider, spouts to throw the rain off; the Aztec's crowned with
      // stepped merlons)
      K.as(st.wall, () => { for (const [px, pz, a, bb] of [[x, z - sz / 2, sx + 0.12, 0.25], [x, z + sz / 2, sx + 0.12, 0.25], [x - sx / 2, z, 0.25, sz], [x + sx / 2, z, 0.25, sz]]) K.box(px, y + 0.25, pz, a, 0.6, bb, pc); });
      K.as('slab', () => { for (const [px, pz, a, bb] of [[x, z - sz / 2, sx + 0.22, 0.34], [x, z + sz / 2, sx + 0.22, 0.34], [x - sx / 2, z, 0.34, sz], [x + sx / 2, z, 0.34, sz]]) K.box(px, y + 0.85, pz, a, 0.06, bb, (P.par && P.par[1]) || dim(pc, 0.9)); });
      if (K.fine) K.as('stone', () => { for (const W2 of wallsOf(sx, sz)) { const n = Math.max(1, Math.floor(W2.len / 3)); for (let k = 0; k < n; k++) { const a = -W2.len / 2 + W2.len * (k + 0.5) / n; K.box(x + (W2.ax ? a : W2.o[0] * (sx / 2 + 0.2)), y + 0.3, z + (W2.ax ? W2.o[1] * (sz / 2 + 0.2) : a), W2.ax ? 0.12 : 0.36, 0.1, W2.ax ? 0.36 : 0.12, P.base ? P.base[1] : '#8a8478'); } } });
      if (civ === 'asteca') K.as('plaster', () => { for (const W2 of wallsOf(sx, sz)) { const n = Math.max(2, Math.round(W2.len / 0.9)); for (let k = 0; k < n; k++) { const a = -W2.len / 2 + W2.len * (k + 0.5) / n; const px = x + (W2.ax ? a : W2.o[0] * sx / 2), pz = z + (W2.ax ? W2.o[1] * sz / 2 : a);
        K.box(px, y + 0.91, pz, W2.ax ? 0.44 : 0.24, 0.16, W2.ax ? 0.24 : 0.44, pc); K.box(px, y + 1.07, pz, W2.ax ? 0.26 : 0.2, 0.14, W2.ax ? 0.2 : 0.26, k % 2 ? (P.trim || '#b33a2a') : pc); } } });
      return y + 0.91;
    }
    const L = alongZ ? sz : sx, D = alongZ ? sx : sz; // (along the ridge, and across it)
    const pitch = kind === 'turf' ? 1.25 : kind === 'thatch' ? 1.05 : (P.pitch || 0.8);
    const h = Math.min(4.6, D * pitch * 0.82);
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
      K.as(pat, () => {
        K.tri3(C[0], C[1], Rb, tone(0), tone(0), mossy(0), alongZ ? [1, 1, 0] : [0, 1, 1]); K.tri3(C[0], Rb, Ra, tone(0), mossy(0), mossy(0), alongZ ? [1, 1, 0] : [0, 1, 1]);
        K.tri3(C[2], C[3], Ra, mossy(1), mossy(1), tone(1), alongZ ? [-1, 1, 0] : [0, 1, -1]); K.tri3(C[2], Ra, Rb, mossy(1), tone(1), tone(1), alongZ ? [-1, 1, 0] : [0, 1, -1]);
        K.tri3(C[1], C[2], Rb, tone(2), tone(2), tone(2), alongZ ? [0, 1, 1] : [1, 1, 0]);
        K.tri3(C[3], C[0], Ra, tone(3), tone(3), tone(3), alongZ ? [0, 1, -1] : [-1, 1, 0]);
        // (the thick edge of the tiles all round the eaves)
        const ed = dim(col, 0.62); for (let k = 0; k < 4; k++) { const a = C[k], b2 = C[(k + 1) % 4]; const lo = [a[0], a[1] - 0.16, a[2]], lo2 = [b2[0], b2[1] - 0.16, b2[2]]; const m = [(a[0] + b2[0]) / 2 - x, 0, (a[2] + b2[2]) / 2 - z]; K.quad(a, b2, lo2, lo, ed, m); }
      });
      // (the underside of the eaves: the boards)
      K.as('plankH', () => K.box(x, yb - 0.2, z, (alongZ ? D : L) + e * 2 - 0.04, 0.05, (alongZ ? L : D) + e * 2 - 0.04, dim('#6a5038', 0.8)));
      // (ridge tiles on the ridge and down the hips, round tiles along the eaves)
      K.as(pat, () => { const rc = r[1] || dim(col, 0.82);
        if (ru > 0.1) K.log([Ra[0], Ra[1] + 0.02, Ra[2]], [Rb[0], Rb[1] + 0.02, Rb[2]], 0.12, rc, 0.1);
        for (let k = 0; k < 4; k++) { const R0 = k === 1 || k === 2 ? Rb : Ra; K.log([C[k][0], C[k][1] + 0.01, C[k][2]], [R0[0], R0[1] + 0.03, R0[2]], 0.09, rc, 0.08); }
        if (K.fine) for (let k = 0; k < 4; k++) { const a = C[k], b2 = C[(k + 1) % 4]; K.log([a[0], a[1] - 0.04, a[2]], [b2[0], b2[1] - 0.04, b2[2]], 0.075, dim(col, 0.9)); } });
      void seed;
      return y + h;
    }
    return gableRoof(K, x, z, sx, sz, y, kind, r, alongZ);
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
  function gableRoof(K, x, z, sx, sz, y, kind, r, alongZ) {
    const P = K.P; const st = stuff(K.b); const nord = styleOf(K.b) === 'nordico';
    const L = alongZ ? sz : sx, D = alongZ ? sx : sz; // (along the ridge, and across it)
    const turf = kind === 'turf', thatch = kind === 'thatch';
    const pat = thatch ? 'thatch' : turf ? 'turf' : st.tile === 'mud' ? 'tile' : st.tile;
    const col = thatch ? ((P.thatch && P.thatch[0]) || '#c8a85a') : r[0];
    // (turf is laid at the pitch it holds on — about fifty degrees, not the god's steep stroke; straw and tiles as he draws them)
    const pitch = turf ? 0.76 : thatch ? 1.05 : (P.pitch || 0.8);
    const h = Math.min(4.6, D * pitch * 0.82);
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
    const uOf = i => -eu + 2 * eu * i / nu, sOf = j => s0 + (run - s0) * j / ns;
    // (the lumps of the turf, the swell of the straw: none at the gable edges or on the ridge, a bulge over the eave)
    const lump = (i, j, sd) => { if (!amp) return 0; const fu = G.clamp((eu - Math.abs(uOf(i))) / 0.45, 0, 1), fs = G.clamp((sOf(j) - s0) / 0.4, 0, 1);
      return (amp * (G.hash(seed * 977 + i * 131 + j * 31 + (sd > 0 ? 7 : 0)) - 0.5) * 2 * fs + (j === ns ? amp * 0.6 : 0)) * fu; };
    const top = (i, j, sd) => { const u = uOf(i); const p = S(u, sOf(j), T + lump(i, j, sd), sd); p[1] -= sagY(u); return p; };
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
      const und = []; for (let j = 0; j <= 1; j++) for (let i = 0; i <= nu; i++) und.push(bot(uOf(i), j ? run + (turf ? 0.17 : 0.02) : 0, sd));
      K.as('plankH', () => K.sheet(und, nu, 1, under, sc(nN(sd), -1)));
      // (the eave's edge — the earth and roots of the turf, the cut ends of the straw, the edge of the tiles — and the gables')
      K.as(turf ? 'soil' : pat, () => {
        for (let i = 0; i < nu; i++) { const a = top(i, ns, sd), b2 = top(i + 1, ns, sd), c2 = bot(uOf(i + 1), run, sd), d2 = bot(uOf(i), run, sd); K.tri3(a, b2, c2, eb[0], eb[0], eb[2], tD(sd)); K.tri3(a, c2, d2, eb[0], eb[2], eb[2], tD(sd)); }
        for (const e of [-1, 1]) for (let j = 0; j < ns; j++) { const i = e < 0 ? 0 : nu; const a = top(i, j, sd), b2 = top(i, j + 1, sd), c2 = bot(uOf(i), Math.max(0, sOf(j + 1)), sd), d2 = bot(uOf(i), Math.max(0, sOf(j)), sd);
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
      const mesh = carved && K.fine && !!(G.Mesh3D && G.Mesh3D.has('dragao') && G.Mesh3D.part('dragao', 'madeira')); if (mesh) style = 0; // (the dragon rides the cross: the boards' ends plain)
      const EMP = cross && K.fine && !!(G.Mesh3D && G.Mesh3D.has('empena') && G.Mesh3D.part('empena', 'cavalo') && G.Mesh3D.part('empena', 'voluta'));
      const bc = nord ? nordWood(K).dark : (P.trim || '#6b4a30'); const ext = cross ? (mesh ? 0.2 : 0.4 + Math.min(0.35, D * 0.06)) : 0;
      const paint = cls >= 2 || (cls === 1 && K.hv(6) < 0.4) ? (P.trim || '#a23c2a') : null;
      if (mesh) { const s = [0.68, 0.76, 0.84, 1][Math.min(3, cls)]; const wc = mixc(paint || bc, bc, 0.35); const ec = cls >= 2 ? (P.acc || '#d8b25a') : '#2a2016'; const M3 = G.Mesh3D;
        for (const e of [-1, 1]) { const p = at(e * (eu + bt / 2 + 0.005), y + h + T / (2 * ca) + bw * 0.42, 0); const d = vec(e, 0, 0); const ry = Math.atan2(d[0], d[2]);
          const m = R3.mat(K.x0 + p[0], K.y0 + p[1], K.z0 + p[2], ry, s, s, s);
          K.as('jamb', () => K.g.put(M3.part('dragao', 'madeira'), m, K.c(wc))); const eye = M3.part('dragao', 'olho'); if (eye) K.g.put(eye, m, K.c(ec)); } }
      K.as('beam', () => { for (const e of [-1, 1]) for (const sd of [-1, 1]) {
        const ub = e * (eu + bt / 2 + 0.005); const sMid = -(T / 2) * sa / ca;
        const a = S(ub, run + (turf ? 0.06 : 0.03), T / 2, sd), b2 = S(ub, cross ? sMid - ext : sMid, T / 2, sd);
        K.bar(a, b2, sc(nN(sd), bw), sc(rU, bt), bc);
        if (cross && style > 0) {
          // (the board's end cut in a horse's head or a scroll — the model made in Blender, G.Mesh3D 'empena': a board's thickness in
          // the gable's plane, growing out from the ridge and up — where the machine carries detail; the boards' own cut elsewhere)
          if (EMP && (style === 2 ? cls >= 1 : cls >= 2)) { const out = vec(0, 0, -sd); // (the horse on the houses, the scroll on the big ones: a cabin's own cut is boards) const s = 0.9 + cls * 0.07; const m = R3.mat(K.x0 + b2[0], K.y0 + b2[1], K.z0 + b2[2], Math.atan2(out[0], out[2]), s, s, s);
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
        const a = S(u0, run + 0.07, 0.09, sd), b2 = S(u1, run + 0.07, 0.09, sd); a[1] -= sagY(um); b2[1] -= sagY(um); K.log(a, b2, 0.085, lc); } });
      if (K.fine) K.as('beam', () => { const n = Math.max(2, Math.round(2 * eu / 0.62)); const dk = dim(P.wr || '#5f4630', 0.8);
        for (const sd of [-1, 1]) for (let k = 0; k < n; k++) { const u = -eu + 2 * eu * (k + 0.5) / n; const sy = -sagY(u);
          const a = S(u, run - 0.12, -0.03, sd), b2 = S(u, run + 0.2, -0.03, sd), c2 = S(u, run + 0.19, -0.06, sd), d2 = S(u, run + 0.19, 0.16, sd); for (const p of [a, b2, c2, d2]) p[1] += sy;
          K.bar(a, b2, sc(nN(sd), 0.045), sc(rU, 0.05), dk); K.bar(c2, d2, sc(tD(sd), 0.045), sc(rU, 0.05), dk); } });
      // (tufts: hanging over the log, standing on the ridge and over the barge boards, scattered on the slopes; a flower now and then)
      const gp = K.gp; const W0 = [K.x0, K.y0, K.z0]; let kk = 0;
      const blade = (p, d, len, w, sw2, tip) => { const k = kk++; const l = Math.hypot(d[0], d[1], d[2]) || 1; const X = W0[0] + p[0], Y = W0[1] + p[1], Z = W0[2] + p[2]; const a = G.hash(seed * 613 + k) * TAU;
        gp.blade(X, Y, Z, w, a, X + d[0] / l * len, Y + d[1] / l * len, Z + d[2] / l * len, tc.tuft, tip || mixc(tc.tip, tc.grass, G.hash(seed + k * 3) * 0.6), sw2); };
      for (const sd of [-1, 1]) {
        const ne = Math.round(2 * eu / 0.13);
        for (let k = 0; k < ne; k++) { const hh = G.hash(seed * 31 + k * 7 + (sd > 0 ? 1 : 0)); const u = -eu + 0.08 + (2 * eu - 0.16) * (k + hh * 0.8) / ne; const p = S(u, run + 0.02, T * 0.9, sd); p[1] -= sagY(u);
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
    K.as(o.pat || (frame || o.wall ? 'plaster' : st.wall), () => { if (eave) { K.box(x, 0, z, sx, h - 0.45, sz, w0); K.box(x, h - 0.45, z, sx, 0.45, sz, eaveShade(K, w0, h)); } else K.box(x, 0, z, sx, h, sz, w0); });
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
      K.as('stone', () => K.box(x, 0, z, sx + 0.06, 0.42, sz + 0.06, P.base ? P.base[1] : '#8a8478'));
      for (let f = 1; f < floors; f++) K.as('plaster', () => K.box(x, f * fh - 0.1, z, sx + 0.08, 0.16, sz + 0.08, dim(wc, 0.86)));
    } else if (civ === 'egipcio') {
      // (the round moulding up the corners)
      K.as('plaster', () => { for (const [px, pz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) K.cyl(x + px * sx / 2, 0.1, z + pz * sz / 2, 0.09, h - 0.1, dim(wc, 0.92)); });
    } else if (civ === 'asteca') {
      K.as('plaster', () => { K.box(x, 0, z, sx + 0.05, 0.5, sz + 0.05, P.trim2 || '#2fae8f'); K.box(x, 0.5, z, sx + 0.04, 0.08, sz + 0.04, P.trim || '#b33a2a'); });
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
      K.as('plaster', () => K.box(x, yb, z, fx, fh, fz, f % 2 ? P.wr : P.wl));
      if (!f) K.as('plaster', () => { K.box(x, 0, z, fx + 0.05, 0.5, fz + 0.05, P.trim2 || '#2fae8f'); K.box(x, 0.5, z, fx + 0.04, 0.08, fz + 0.04, P.trim || '#b33a2a'); });
      K.as('plaster', () => K.box(x, yb + fh - 0.36, z, fx + 0.06, 0.3, fz + 0.06, f % 2 ? (P.trim2 || '#2fae8f') : (P.trim || '#b33a2a')));
      openings(g, gw, K, x, z, fx, fz, yb, fh, 1, f === 0 ? o.door : false);
      if (f < floors - 1) {
        // (the terrace: the floor of the step, its low parapet, flowers along it)
        const tx = fx + 0.1, tz = fz + 0.1, pc = (P.par && P.par[0]) || P.wl;
        K.as('slab', () => K.box(x, yb + fh, z, tx, 0.12, tz, P.top || P.wl));
        K.as('plaster', () => { for (const [px, pz, a2, b2] of [[x, z - tz / 2 + 0.07, tx, 0.14], [x, z + tz / 2 - 0.07, tx, 0.14], [x - tx / 2 + 0.07, z, 0.14, tz], [x + tx / 2 - 0.07, z, 0.14, tz]]) K.box(px, yb + fh + 0.12, pz, a2, 0.34, b2, pc); });
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
    K.as(K.st === 'egipcio' ? 'plaster' : 'beam', () => K.box(x, h - 0.2, z, sx + 0.1, 0.2, sz + 0.1, K.st === 'egipcio' ? (P.trim || '#2f8f8a') : (P.trim || '#6b4a30')));
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
        K.as('plaster', () => K.box(x, h - 0.35, z, sx + 0.08, 0.3, sz + 0.08, P.trim || '#b33a2a'));
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
      K.as('plankH', () => { for (let k = 0; k < nP; k++) { const nn = 0.5 + k * 0.27, p = at(ga + (hv(90 + k) - 0.5) * 0.06, nn); const y = Math.min(gyA(ga - 0.5, nn), gyA(ga + 0.5, nn)) - 0.01;
        K.rbox(p[0], y, p[1], ax ? 1.05 + hv(110 + k) * 0.1 : 0.24, 0.05, ax ? 0.24 : 1.05 + hv(110 + k) * 0.1, mixc([128, 104, 74], [104, 92, 78], hv(130 + k)), (hv(150 + k) - 0.5) * 0.08); } });
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
    const strip = stripOf(K, x, z, lx, lz, o); const sd = Math.min(0.36, strip + 0.12), sn = 0.06 + sd / 2;
    const sp = D(0, 0, sn); const gy = Math.min(-0.36, K.gy(sp[0], sp[2]) - 0.04);
    K.as('rock', () => bx(0, gy, sn, dw + 0.4, 0.04 - gy, sd, P.base ? P.base[2] : '#a09a8e'));
    return { o, a: off, w: dw + 0.5, side };
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
    const gy = Math.min(0, K.gy(cx, cz)) - 0.03;
    K.as('bark', () => { for (let k = 0; k < 5; k++) { const row = k < 3 ? 0 : 1; const off = row ? (k - 3.5) * 0.24 : (k - 1) * 0.24; K.log([cx - 0.75, gy + 0.12 + row * 0.2, cz + off], [cx + 0.75, gy + 0.12 + row * 0.2, cz + off], 0.11, k % 2 ? [128, 98, 66] : [112, 86, 58]); } });
    if (K.fine) { const pz = cz + (cz > z ? -1 : 1) * 0.6; K.as('plankH', () => { for (let k = 0; k < 4; k++) K.box(cx, gy + k * 0.05, pz, 1.4, 0.045, 0.3, [168, 134, 92], 0); });
      const R3r = G.Realm; const bs = K.P.base || ['#8a8478']; K.as('rock', () => { for (let k = 0; k < 4; k++) { const sx2 = cx + (cx > x ? -1 : 1) * (0.95 + (k % 2) * 0.32), sz2 = cz + (k < 2 ? -0.18 : 0.18); K.g.put(R3r.SH.ico0, R3r.mat(K.x0 + sx2, K.y0 + gy + 0.12, K.z0 + sz2, k, 0.4, 0.28, 0.34), K.c(bs[k % bs.length])); } }); }
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
      K.box(K.w / 2, 0, K.d / 2, sx, 2.1, sz, ['#8a7a5a', '#7a6a4a', '#9a8a6a'][K.b.v || 0]);
      g.put(SH.box, R3.mat(K.x0 + K.w / 2, K.y0 + 2.1, K.z0 + K.d / 2, 0, sx + 0.4, 0.12, sz + 0.5, 0.18), '#6a6a6a');
      openings(g, gw, K, K.w / 2, K.d / 2, sx, sz, 0, 2.1, 1);
    },
    storehouse(g, gw, K) { house(g, gw, K, { h: 3.8, inset: 0.4, yard: 1.3 }); }, // (its sacks, crates and barrels: Props3D, in the yard)
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
    campfire(g, gw, K) { for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; K.sph(K.w / 2 + Math.cos(a) * 0.7, 0.1, K.d / 2 + Math.sin(a) * 0.7, 0.22, '#6a6a66'); } for (let k = 0; k < 3; k++) g.put(SH.cyl, R3.mat(K.x0 + K.w / 2, K.y0 + 0.2, K.z0 + K.d / 2, k * 1.05, 0.16, 1.1, 0.16, 0, Math.PI / 2), K.c('#5a3a24')); },
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
    if (K.st === 'asteca') K.as('plaster', () => { K.sheet(ring(r + 0.015, H - 0.5, H - 0.3), N2, 1, P.trim || '#b33a2a', [-1, 0, 0]); K.sheet(ring(r + 0.015, 0.06, 0.42), N2, 1, P.trim2 || '#2fae8f', [-1, 0, 0]); });
    // (the straw: a cone in three courses swelling a little, its eaves thick, the underside, the knot at the top)
    const th = rgbOf((P.thatch && P.thatch[0]) || '#c8a85a'), th2 = rgbOf((P.thatch && P.thatch[1]) || '#a3843f'); const R0 = r * 1.36, Y0 = H - 0.25, HT = 2.6;
    const cone = []; const rows = 4; for (let j = 0; j <= rows; j++) for (let i = 0; i <= N2; i++) { const a = i / N2 * TAU, f = j / rows; const rr = R0 * (1 - f) + (f > 0 && f < 1 ? 0.05 : 0) + 0.02; cone.push([cx + Math.cos(a) * rr, Y0 + HT * f, cz + Math.sin(a) * rr]); }
    const seed = K.b.id & 1023; const thCol = (X, Y, Z) => { const q = vnoise(X * 1.3, Z * 1.3 + Y, seed); const c2 = mixc(th, th2, q * 0.6 + K.hv(3) * 0.25); const f = 0.9 + vnoise(X * 3, Y * 3 + Z, seed + 2) * 0.18; return qc([c2[0] * f, c2[1] * f, c2[2] * f]); };
    K.as('thatch', () => { K.sheet(cone, N2, rows, thCol, [0, 1, 0]); K.sheet(ring(R0 + 0.02, Y0 - 0.32, Y0 + 0.01), N2, 1, (X, Y, Z) => mixc(thCol(X, Y, Z), [70, 56, 36], 0.25), [-1, 0, 0]); });
    { const und = []; for (let j = 0; j <= 1; j++) for (let i = 0; i <= N2; i++) { const a = i / N2 * TAU, rr = j ? r : R0; und.push([cx + Math.cos(a) * rr, j ? H - 0.05 : Y0 - 0.32, cz + Math.sin(a) * rr]); }
      K.as('thatch', () => K.sheet(und, N2, 1, dim(th2, 0.6), [0, -1, 0])); }
    K.as('thatch', () => { K.cyl(cx, Y0 + HT - 0.42, cz, 0.16, 0.32, dim(th2, 0.85)); K.cone(cx, Y0 + HT - 0.12, cz, 0.15, 0.32, dim(th2, 0.75)); });
    // (the door in its frame on its side, a step before it, a window on another side)
    const side = doorSide(K.b); const od = { S: [0, 1], N: [0, -1], E: [1, 0], W: [-1, 0] }[side]; const ax = od[1] !== 0; const dw = 0.84, dh = 1.75;
    const D = (a, y, n) => [cx + (ax ? a : od[0] * (r + n)), y, cz + (ax ? od[1] * (r + n) : a)];
    const bx = (a, y, n, wa, hy, wn, col) => { const q = D(a, y, n); K.box(q[0], q[1], q[2], ax ? wa : wn, hy, ax ? wn : wa, col); };
    K.as('plankV', () => bx(0, 0, -0.02, dw, dh, 0.1, P.door || '#3a2a1c'));
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
  B3.sig = function (x0, y0, n) {
    let s = 0;
    for (const b of G.S.buildings.values()) { if (!inChunk(b, x0, y0, n)) continue; s = (s * 31 + b.id * 7 + (b.built ? 1 : 0) + Math.floor((b.progress || 0) * 5) * 3 + Math.floor((b.hp / (b.maxHp || 1)) * 4) * 11 + (b.crops ? b.crops.reduce((a, c) => a + c.s + Math.floor((c.g || 0) * 3), 0) : 0) * 13 + (b.graves ? b.graves.length : 0) * 17) | 0; }
    // (the arches standing in this chunk: one built across the map does not change it)
    for (const a of G.S.aqueducts || []) for (let k = 0; k < a.built; k++) { const t = a.tiles[k]; if (t[0] >= x0 && t[1] >= y0 && t[0] < x0 + n && t[1] < y0 + n) s = (s + (k + 1) * 23 + (a.dead ? 5 : 0)) | 0; }
    return s;
  };
  B3.nearGeo = function (x0, y0, n) {
    const g = R3.Geo(), gw = R3.Geo(), gp = R3.Geo(), gq = R3.WGeo();
    const ck = x0 + ',' + y0; for (const id of litOf.get(ck) || []) B3.lamps.delete(id); const lit = []; litOf.set(ck, lit);
    for (const b of G.S.buildings.values()) {
      if (!inChunk(b, x0, y0, n)) continue;
      const K = kit(g, b, gp, gq); const n0 = g.p.length; K.lit = [];
      draw(g, gw, K, true);
      if (K.lit.length) { const L = K.lit, m = Math.min(8, L.length); B3.lamps.set(b.id, Array.from({ length: m }, (_, i) => L[Math.floor(i * L.length / m)])); lit.push(b.id); } // (eight at most, spread round it)
      // (how high it really stands, for the eye that must not go into its roof)
      let top = -1e9; for (let k = n0 + 1; k < g.p.length; k += 3) if (g.p[k] > top) top = g.p[k]; if (top > -1e9) B3.tops.set(b.id, top);
    }
    g.ao = (X, Z) => W.hAt(X / TL(), Z / TL()) * HM();
    wallsInto(g, x0, y0, n, gq);
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
  B3.check = function (list) {
    const S = G.S; const out = []; const L = TL(); if (!SH) return out; // (only once the 3D is made)
    if (!list) { const f = G.Possess && G.Possess.body && G.Possess.body(); const cx = f ? f.x : N / 2, cy = f ? f.y : N / 2; list = [...S.buildings.values()].filter(b => G.dist(b.x + b.w / 2, b.y + b.h / 2, cx, cy) < 14); }
    for (const b of list) {
      const g = R3.Geo(), gw = R3.Geo(), gp = R3.Geo(); const K = kit(g, b, gp); draw(g, gw, K, false);
      const P = g.p; let bad = 0, lo = 1e9, x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
      for (const arr of [P, g.n, gw.p, gp.p]) for (let k = 0; k < arr.length; k++) if (!Number.isFinite(arr[k])) bad++;
      for (let k = 0; k < P.length; k += 3) { x0 = Math.min(x0, P[k]); x1 = Math.max(x1, P[k]); lo = Math.min(lo, P[k + 1]); z0 = Math.min(z0, P[k + 2]); z1 = Math.max(z1, P[k + 2]); }
      const tag = `${b.type}#${b.id}`;
      if (bad) out.push(`${tag}: ${bad} números que não são números`);
      const over = Math.max(b.x * L - x0, x1 - (b.x + b.w) * L, b.y * L - z0, z1 - (b.y + b.h) * L);
      if (b.type !== 'doca' && P.length && over > 1.6) out.push(`${tag}: ${over.toFixed(2)} m fora do lote`);
      if (P.length && lo < K.lo - 1.2 && b.type !== 'doca') out.push(`${tag}: enterrado ${(K.lo - lo).toFixed(2)} m`); // (a quay's posts go down into the sea)
      if (P.length && lo > K.hi + 0.35) out.push(`${tag}: flutua ${(lo - K.hi).toFixed(2)} m`);
      if (K.y0 < K.lo - 0.05) out.push(`${tag}: piso abaixo do chão`);
    }
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
