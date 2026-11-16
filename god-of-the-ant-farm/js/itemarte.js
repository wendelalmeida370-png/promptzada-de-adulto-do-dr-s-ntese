'use strict';
// ============================================================
//  ItemArt: how a thing of the catalog (G.Itens) looks — its 3D
//  shape in the thing's own frame and its picture for the screen
//  (D-337). Only seen: no world, no chance of any kind (the
//  guard's LOOK list and its rule 135): the same key is the same
//  shape on every machine. The thing's frame, the same for every
//  thing: metres; the origin at the main hand's grip (where the
//  palm closes); +Y along the handle from the grip toward the
//  business end (the axe's head, the sword's point, the rod's
//  tip, the top of a shield); +Z the business end's front (the
//  axe's and the sword's edge, the shield's face, the way an
//  arrow on the bow flies); +X = Y × Z. What hangs from the fist
//  (the bucket, the basket, the sling) has its bail along Y and
//  hangs toward +Z, where the arm points (D-386); what is worn is
//  in the frame of its bone (D-387). The shapes are the recipes of
//  js/itemforma.js, made when first asked; the pictures are
//  js/itemicons.js, rendered from the same shapes in the game's
//  own light by qa/visual/itens-figuras.js (D-390). The contract:
//  JOGABILIDADE.md §4.3.
// ============================================================
(function (G) {
  const IA = G.ItemArt = {};
  const T3 = () => (G.Realm && G.Realm.three && G.Realm.three()) || window.THREE;
  const FO = () => G.ItemForma;
  // the triangles each level may have (D-388): a thing in the hand; a big one (the shield, the net, the basket, the
  // bucket); a worn one (the helmet, the cuirass) — near, mid, far
  IA.BUDGET = { mao: [1000, 300, 72], grande: [1500, 450, 120], vestir: [1700, 520, 120] };
  const BIG = new Set(['escudo', 'rede', 'cesto', 'balde']), WORN = new Set(['elmo', 'couraca']);
  IA.budgetOf = key => { const k = canon(key); if (!k) return null; const kind = k.split('.')[0]; return IA.BUDGET[WORN.has(kind) ? 'vestir' : BIG.has(kind) ? 'grande' : 'mao']; };
  // a key as the catalog reads it: the kind and its material ('machado' → 'machado.pedra'); null for what is not a thing
  function canon(key) {
    const It = G.Itens; if (!It || !It.def) return null; const d = It.def(key); if (!d || !d.coisa || !d.kind) return null;
    return d.kind + '.' + d.mat;
  }
  IA.canon = canon;
  // every key the catalog has, each kind in each of its materials
  IA.keys = () => { const K = (G.Itens && G.Itens.KINDS) || {}; const o = []; for (const k in K) for (const m of K[k].mats) o.push(k + '.' + m); return o; };

  // ------------------------------ the shapes ------------------------------
  const built = new Map(), geos = new Map();
  // (the numbers of a thing at a level: made once, kept)
  function raw(key, lod) {
    const k = canon(key); if (!k || !FO()) return null; const id = k + '/' + lod;
    if (built.has(id)) return built.get(id);
    const [kind, mat] = k.split('.'); const b = FO().build(kind, mat, lod); built.set(id, b); return b;
  }
  IA.raw = raw;
  // the shape of a thing, for a level of detail (0 near, 1 mid, 2 far): a THREE.BufferGeometry — position, normal, color
  // (linear light, the material's grain and shade in it), shine (metal, gloss, paint: what IA.material reads) — with
  // userData { key, lod, tris, parts: [{ name, start, count }] (runs of the index: cabo, cabeca, amarra, corda, enfeite),
  // marks, tint (1: it has a painted part the people's colour may take) }; shared: never dispose it; null for an unknown key
  IA.geo = function (key, lod) {
    const THREE = T3(); const k = canon(key); if (!k || !THREE) return null; const L = Math.max(0, Math.min(2, lod | 0)); const id = k + '/' + L;
    let g = geos.get(id); if (g) return g;
    const b = raw(k, L); if (!b) return null;
    g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(b.pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(b.nor, 3));
    g.setAttribute('color', new THREE.BufferAttribute(b.col, 3)); g.setAttribute('shine', new THREE.BufferAttribute(b.shine, 3));
    g.setIndex(new THREE.BufferAttribute(b.idx, 1)); g.computeBoundingBox(); g.computeBoundingSphere();
    g.userData = { key: k, lod: L, tris: b.idx.length / 3, parts: b.parts, marks: b.marks, tint: b.tint };
    geos.set(id, g); return g;
  };
  // (a shape is made the first time it is asked — a few milliseconds, the cuirass some tens: a drawer that would rather not pay
  // that in the frame a thing first appears makes them ahead, n shapes a call, while it idles; true when all are made)
  let warmQ = null;
  IA.warm = function (n) { if (!T3() || !FO()) return false; if (!warmQ) { warmQ = []; for (const k of IA.keys()) for (let l = 0; l < 3; l++) warmQ.push([k, l]); }
    for (let i = 0; i < (n || 1) && warmQ.length; i++) { const [k, l] = warmQ.shift(); IA.geo(k, l); } return !warmQ.length; };
  // where the hands take it, in its frame: main (the origin) and, for a thing of two hands, off — the other hand's place
  // (the spear's rear hand, the spade's T, the bow's string where the drawing hand nocks)
  IA.grip = key => { const b = raw(key, 0); return { main: [0, 0, 0], off: b && b.off ? b.off.slice() : null }; };
  // its named points (the far point — ponta —, the business end's middle — centro —; the torch's flame — chama —, the rod's
  // line — linha —, the bow's string — corda): for the flame, the line, the hit
  IA.marks = key => { const b = raw(key, 0); if (!b) return null; const o = {}; for (const n in b.marks) o[n] = b.marks[n].slice(); return o; };
  // how many triangles each level has, and the box of the near shape
  IA.info = key => { const b0 = raw(key, 0); if (!b0) return null; const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; const P = b0.pos; for (let i = 0; i < P.length; i++) { lo[i % 3] = Math.min(lo[i % 3], P[i]); hi[i % 3] = Math.max(hi[i % 3], P[i]); } return { tris: [0, 1, 2].map(l => raw(key, l).idx.length / 3), lo, hi }; };

  // ------------------------------ stowed on the body ------------------------------
  // where a thing goes when it is put away (D-389): on the back (the chest bone) or at the belt (the pelvis bone), for a
  // body of 1.75 m in its bind pose (scale `at` by height / 1.75): its origin at `at`, its +Y along `y`, its +Z along `z` —
  // in the bone's frame (+X the body's left, +Y up, +Z its front) — and the same as a quaternion `q` [x, y, z, w];
  // null where the catalog does not let it go (G.Itens.fits)
  const N3 = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const ortho = (y, zh) => { const Y = N3(y); const d = zh[0] * Y[0] + zh[1] * Y[1] + zh[2] * Y[2]; return [Y, N3([zh[0] - d * Y[0], zh[1] - d * Y[1], zh[2] - d * Y[2]])]; };
  function quat(Y, Z) { const X = [Y[1] * Z[2] - Y[2] * Z[1], Y[2] * Z[0] - Y[0] * Z[2], Y[0] * Z[1] - Y[1] * Z[0]]; const m00 = X[0], m11 = Y[1], m22 = Z[2]; const tr = m00 + m11 + m22; let x, y, z, w;
    if (tr > 0) { const s = 0.5 / Math.sqrt(tr + 1); w = 0.25 / s; x = (Y[2] - Z[1]) * s; y = (Z[0] - X[2]) * s; z = (X[1] - Y[0]) * s; }
    else if (m00 > m11 && m00 > m22) { const s = 2 * Math.sqrt(1 + m00 - m11 - m22); w = (Y[2] - Z[1]) / s; x = 0.25 * s; y = (Y[0] + X[1]) / s; z = (Z[0] + X[2]) / s; }
    else if (m11 > m22) { const s = 2 * Math.sqrt(1 + m11 - m00 - m22); w = (Z[0] - X[2]) / s; x = (Y[0] + X[1]) / s; y = 0.25 * s; z = (Z[1] + Y[2]) / s; }
    else { const s = 2 * Math.sqrt(1 + m22 - m00 - m11); w = (X[1] - Y[0]) / s; x = (Z[0] + X[2]) / s; y = (Z[1] + Y[2]) / s; z = 0.25 * s; }
    return [x, y, z, w]; }
  // (the back: its surface at about z −0.135 behind the chest bone, between the shoulder blades at y 0.27; the belt at the
  // pelvis' y 0.06, the hips at x ±0.15)
  const BACK = [0, 0.27, -0.16];
  const STOW = {
    costas: (kind, inf) => {
      const mid = (inf.lo[1] + inf.hi[1]) / 2;
      if (kind === 'escudo') return { bone: 'chest', at: [0, 0.24, -0.16], y: [0, 1, 0], z: [0, 0, -1] };
      if (kind === 'arco') { const [Y, Z] = ortho([0.4, 1, 0], [1, -0.4, 0]); return { bone: 'chest', at: [0.02, 0.26, -0.16], y: Y, z: Z }; }
      if (kind === 'cesto') return { bone: 'chest', at: [0, 0.5, -0.3], y: [1, 0, 0], z: [0, -1, 0] };
      if (kind === 'rede') return { bone: 'chest', at: [-0.05, 0.46, -0.21], y: [0, -1, 0], z: [0, 0, -1] };
      // (a long thing across the back, its working end over the right shoulder, standing out from the back, not into it)
      const steep = inf.hi[1] - inf.lo[1] > 1.8 ? 0.5 : 0.42; const [Y, Z] = ortho([-steep, 1, 0], [0, 0, -1]); const out = Math.max(0, -inf.lo[2]) + 0.01;
      return { bone: 'chest', at: [BACK[0] - Y[0] * mid, BACK[1] - Y[1] * mid, BACK[2] - out], y: Y, z: Z };
    },
    cinto: (kind, inf) => {
      if (kind === 'espada') { const [Y, Z] = ortho([0, -1, -0.55], [0, -0.55, 1]); return { bone: 'pel', at: [0.205, 0.12, 0.07], y: Y, z: Z }; }
      if (kind === 'faca') { const [Y, Z] = ortho([0.12, -1, 0.2], [0, 0, 1]); return { bone: 'pel', at: [-0.175, 0.1, 0.05], y: Y, z: Z }; }
      if (kind === 'funda') return { bone: 'pel', at: [0.13, 0.07, 0.1], y: [1, 0, 0], z: [0, -1, 0] };
      // (the axe, the hammer, the sickle, the club: hung by the head through the belt at the right hip, the handle down)
      const hy = inf.head; const [Y, Z] = ortho([-0.08, 1, 0], [0, 0, -1]);
      return { bone: 'pel', at: [-0.2, 0.06 - hy, -0.04], y: Y, z: Z };
    },
  };
  const stows = new Map();
  IA.stow = function (key, place) {
    const k = canon(key); if (!k || !STOW[place]) return null; const It = G.Itens; if (!It.fits(k, place)) return null; const id = k + '@' + place;
    if (stows.has(id)) return stows.get(id);
    const inf = IA.info(k); const b = raw(k, 0); const c = b.marks && b.marks.centro; inf.head = c ? c[1] : (inf.hi[1] * 0.8);
    const s = STOW[place](k.split('.')[0], inf); s.q = quat(N3(s.y), N3(s.z)); s.y = N3(s.y); s.z = N3(s.z);
    stows.set(id, s); return s;
  };

  // ------------------------------ the pictures ------------------------------
  // the picture of a thing for the screen: a data: URL (WebP, 128 × 128, a transparent ground), or null
  IA.icon = key => { const k = canon(key); const D = G.ITEMICONS; return (k && D && D.img && D.img[k]) || null; };
  IA.ICON_SIZE = 128;
  // (a signature of a near shape: the pictures say the shape they were rendered from — a shape changed since is a stale
  // picture, which the proof and IA.check say)
  IA.sig = key => { const b = raw(key, 0); if (!b) return null; let h = 2166136261 >>> 0; const mix = x => { h ^= x; h = Math.imul(h, 16777619) >>> 0; };
    for (const a of [b.pos, b.col]) for (let i = 0; i < a.length; i++) mix(Math.round(a[i] * 4096) | 0); mix(b.idx.length); return h.toString(36); };

  // ------------------------------ the material ------------------------------
  // the game's light on a thing (D-385): the people's Lambert with its vertex colours — the grain, the shade, the honed edge
  // are in them, so the thing reads with any lit material — and, read from the `shine` attribute, a highlight that moves
  // with the sun (the metals tinted by their own colour, the polished wood a little), the sky in the metals, and the
  // painted part in the instance's colour (the people's: an instance colour touches nothing else of the thing).
  // o: onBeforeCompile (the drawer's own patch, run first: the people's rim), key (its program's name)
  IA.PAINT_LUMA = 0.1;
  IA.material = function (THREE, o) {
    o = o || {}; const m = new THREE.MeshLambertMaterial({ vertexColors: true }); const base = o.onBeforeCompile;
    m.onBeforeCompile = (sh, r) => { if (base) base(sh, r); IA.patch(sh, THREE); };
    m.customProgramCacheKey = () => 'itemarte' + (o.key ? '-' + o.key : '');
    return m;
  };
  // (the patch itself, on a shader three.js is about to compile: how many of its anchors it found — all six, or the
  // three.js under it changed and the thing is drawn plain, which IA.check says)
  IA.patch = function (sh, THREE) {
    THREE = THREE || T3(); let found = 0; const rep = (k, a, b) => { if (sh[k].indexOf(a) < 0) return; sh[k] = sh[k].replace(a, b); found++; };
    rep('vertexShader', '#include <color_pars_vertex>', '#include <color_pars_vertex>\nattribute vec3 shine;\nvarying vec3 vShine;');
    rep('vertexShader', '#include <color_vertex>', `#include <color_vertex>
	vShine = shine;
	#if defined( USE_INSTANCING_COLOR ) && defined( USE_COLOR )
	vColor.xyz = mix( color.xyz, instanceColor.xyz * ( dot( color.xyz, vec3( 0.2126, 0.7152, 0.0722 ) ) / ${IA.PAINT_LUMA.toFixed(3)} ), shine.z );
	#endif`);
    const lam = THREE.ShaderChunk.lights_lambert_pars_fragment, at = 'reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );';
    if (lam.indexOf(at) >= 0) rep('fragmentShader', '#include <lights_lambert_pars_fragment>', 'varying vec3 vShine;\nvec3 iaSpec = vec3( 0.0 ); float iaExp = 8.0;\n' + lam.replace(at, `${at}
	{ vec3 iaH = normalize( directLight.direction + geometryViewDir ); float iaNL = saturate( dot( geometryNormal, directLight.direction ) );
	  reflectedLight.directSpecular += directLight.color * iaSpec * pow( saturate( dot( geometryNormal, iaH ) ), iaExp ) * ( iaExp + 8.0 ) * 0.04 * smoothstep( 0.0, 0.3, iaNL ); }`));
    rep('fragmentShader', '#include <lights_fragment_begin>', `iaSpec = mix( vec3( 0.035 ), diffuseColor.rgb * 1.7 + 0.015, vShine.x ) * vShine.y;
	iaExp = mix( 5.0, 70.0, vShine.y * vShine.y );
	diffuseColor.rgb *= 1.0 - 0.3 * vShine.x;
	#include <lights_fragment_begin>`);
    rep('fragmentShader', '#include <lights_fragment_end>', `#include <lights_fragment_end>
	{ vec3 iaR = reflect( - geometryViewDir, geometryNormal ); vec3 iaUp = normalize( ( viewMatrix * vec4( 0.0, 1.0, 0.0, 0.0 ) ).xyz ); float iaK = dot( iaR, iaUp );
	#if NUM_HEMI_LIGHTS > 0
	  vec3 iaEnv = mix( hemisphereLights[ 0 ].groundColor, hemisphereLights[ 0 ].skyColor, smoothstep( - 0.35, 0.65, iaK ) );
	#else
	  vec3 iaEnv = ambientLightColor;
	#endif
	  float iaF = 0.4 + 0.6 * pow( 1.0 - saturate( dot( geometryNormal, geometryViewDir ) ), 3.0 );
	  reflectedLight.indirectSpecular += iaEnv * iaSpec * vShine.x * iaF; }`);
    rep('fragmentShader', 'vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;', 'vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;');
    return found;
  };

  // ------------------------------ its own proof ------------------------------
  // what is wrong in the things' art (empty is good): every key of the catalog has its three levels within the budget, its
  // numbers finite and its normals of length one, its picture, and the picture of the shape it has now; the material's
  // patch finds its places in the three.js it runs on
  IA.check = function () {
    const bad = []; const THREE = T3();
    for (const k of IA.keys()) {
      const bud = IA.budgetOf(k); let prev = Infinity;
      for (let l = 0; l < 3; l++) {
        const b = raw(k, l); if (!b) { bad.push(`${k}: sem forma no nível ${l}`); continue; }
        const t = b.idx.length / 3; if (t > bud[l]) bad.push(`${k}: ${t} triângulos no nível ${l} (orçamento ${bud[l]})`); if (t > prev) bad.push(`${k}: o nível ${l} tem mais triângulos que o ${l - 1}`); prev = t;
        let nan = 0, unit = 0, out = 0; for (const a of [b.pos, b.nor, b.col, b.shine]) for (let i = 0; i < a.length; i++) if (!Number.isFinite(a[i])) nan++;
        for (let i = 0; i < b.nor.length; i += 3) if (Math.abs(Math.hypot(b.nor[i], b.nor[i + 1], b.nor[i + 2]) - 1) > 0.01) unit++;
        for (let i = 0; i < b.idx.length; i++) if (b.idx[i] >= b.pos.length / 3) out++;
        for (const a of [b.col, b.shine]) for (let i = 0; i < a.length; i++) if (a[i] < 0 || a[i] > 1) { out++; break; }
        if (nan) bad.push(`${k}: ${nan} números que não são números no nível ${l}`); if (unit) bad.push(`${k}: ${unit} normais sem comprimento 1 no nível ${l}`); if (out) bad.push(`${k}: índices, cores ou brilhos fora do lugar no nível ${l}`);
      }
      const D = G.ITEMICONS; if (!IA.icon(k)) bad.push(`${k}: sem figura (gere: qa/visual/itens-figuras.js)`); else if (D.sig && D.sig[k] !== IA.sig(k)) bad.push(`${k}: a figura é de uma forma de antes (gere de novo: qa/visual/itens-figuras.js)`);
    }
    if (THREE && THREE.ShaderLib && THREE.ShaderLib.lambert) { const sh = { vertexShader: THREE.ShaderLib.lambert.vertexShader, fragmentShader: THREE.ShaderLib.lambert.fragmentShader }; const n = IA.patch(sh, THREE); if (n !== 6) bad.push(`o material das coisas achou ${n} de 6 lugares no three.js (ele mudou?)`); }
    return bad;
  };
  // (ready when the shapes can be made: three.js and the recipes are both there)
  Object.defineProperty(IA, 'ready', { get: () => !!(T3() && FO()), enumerable: true });
})(window.G);
