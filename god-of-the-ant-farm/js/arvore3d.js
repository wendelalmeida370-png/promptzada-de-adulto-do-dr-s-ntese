'use strict';
// ============================================================
//  Arvore3D: the trees of the world in the round (Modo Encarnado)
//  — each tree of S.trees as it stands, by its kind and its own
//  measures (G.Mata.tree: the same for its drawing, the leaves it
//  lets fall, what perches on it and the canopy's map), the bushes
//  and the boulders of the near chunks, and the grass tufts where
//  the field of blades is not drawn; the materials of the plants
//  (the crowns that sway, the cards of leaves, the plants that
//  bend). Taken out of realm3d.js (NATUREZA.md §4, 21a): the scene,
//  the chunks and the frame stay there, and call here.
//  Only seen: nothing here touches the world.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const A3 = G.Arvore3D = {};
  const R3 = G.Realm; const TAU = Math.PI * 2;
  let THREE = null, SH = null, MAT = {};
  // (the shapes every builder puts, made once — without a graphics card too: the tests in Node build the same chunks)
  function ready() { if (!SH) { SH = R3.shapes(); THREE = window.THREE; } return SH; }
  const tileCol = (i, x, y) => G.Ground3D.tileCol(i, x, y);

  // ------------------------------ the materials of the plants ------------------------------
  A3.materials = function (three, M, U) {
    THREE = three; MAT = M; ready();
    // the trees, the bushes and the stones: crowns swaying with the wind (aK: how much each point moves), leaves speckled with
    // light and shade; wood in its bark and stone in its grain once the pictures of the stack are in (wrapped from the sides
    // round a trunk, from all three round a boulder), moss on the tops of the stones of the wet lands, snow on the cold ones
    // (how near the plants keep their finest form — the leaves' cards at the edge of the crowns, the grain and the relief of
    // stone and bark: 40 m times the preset's lod, read every frame; a preset without lod keeps it everywhere, as before)
    const UFINE = { get value() { const q = R3.Q(); return Number.isFinite(q.lod) ? 40 * q.lod : 1e5; } };
    MAT.flora = new THREE.MeshLambertMaterial({ vertexColors: true });
    MAT.flora.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, { uTime: U.time, uWind: U.wind, uDet: { value: G.Ground3D.detail() }, uFine: UFINE }, G.Ground3D.U3());
      sh.vertexShader = 'attribute float aK; uniform float uTime; uniform vec3 uWind; varying vec3 vFP; varying float vFK; varying vec3 vFN;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        vec4 wq = modelMatrix * vec4(transformed, 1.0); vFP = wq.xyz; vFK = aK; vFN = normalize(mat3(modelMatrix) * objectNormal);
        float sk = aK < -1.45 ? 0.0 : aK < -0.5 ? -aK - 1.0 : aK > 3.5 ? aK - 4.0 : aK > 1.5 ? aK - 2.0 : aK; // (a conifer's crown +4, a fruit +2)
        float ph = uTime * (0.9 + uWind.z) + wq.x * 0.11 + wq.z * 0.07;
        transformed.xz += uWind.xy * (sin(ph) * 0.6 + sin(ph * 2.7 + 1.3) * 0.25 + 0.3) * sk * (0.25 + uWind.z * 0.6);`);
      sh.fragmentShader = 'uniform sampler2D uDet; uniform float uFine; varying vec3 vFP; varying float vFK; varying vec3 vFN; float fHgt = 0.0; float fCrown = 0.0; float fFine = 0.0;\n' + sh.fragmentShader
        // (a crown right at the eye — the eye behind the body passing through a pine's tiers, under a low bough — thins out and
        // goes within a metre and a half: never a flat wall of green across the view)
        .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
        if (vFK > 0.07) { float ed = length(vViewPosition); if (ed < 1.5 && fract(sin(dot(floor(gl_FragCoord.xy), vec2(12.9898, 78.233))) * 43758.5453) > smoothstep(0.45, 1.5, ed)) discard; } // (its fruit with it)`)
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
        // (the grain of stone and bark and the relief of all three only as near as the machine carries them; beyond, fading
        // over the last quarter, the plain colours — the crowns keep their leaves' picture)
        fFine = uTexOn > 0.5 ? 1.0 - smoothstep(uFine * 0.75, uFine, length(vViewPosition)) : 0.0;
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
            diffuseColor.rgb *= m3col(f); fHgt = f.a * 0.05 * fFine;
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
          // (each face of the stone its own tone, as a stone broken along its planes: the face's own normal, from the slopes of
          // the point across the screen — the light keeps the stone's soft volume)
          { vec3 fn = normalize(cross(dFdx(vFP), dFdy(vFP))); float fh = fract(sin(dot(floor(fn * 3.0 + 0.5), vec3(12.9898, 78.233, 37.719))) * 43758.5453); diffuseColor.rgb *= 0.86 + fh * 0.26; }
          float sn = smoothstep(0.6, 0.8, min(diffuseColor.r, min(diffuseColor.g, diffuseColor.b)));
          vec3 plain = mix(diffuseColor.rgb, vec3(0.12, 0.19, 0.055), top * moss * 0.55 * (1.0 - sn));
          if (fFine > 0.0) {
            vec3 w = pow(abs(n), vec3(4.0)); w /= w.x + w.y + w.z + 1e-4;
            vec4 r = m3raw(FROCK, vFP.zy * FROCK_S * 1.6) * w.x + m3raw(FROCK, vFP.xz * FROCK_S * 1.6 + 0.31) * w.y + m3raw(FROCK, vFP.xy * FROCK_S * 1.6 + 0.57) * w.z;
            vec3 rc = diffuseColor.rgb * m3col(r);
            if (sn > 0.01) rc = mix(rc, diffuseColor.rgb * m3col(m3raw(M3_SNOW, vFP.xz * M3S_SNOW)), sn);
            float mm = 0.0;
            if (moss > 0.01) { vec4 mt = m3raw(FMOSS, vFP.xz * FMOSS_S * 1.5); mm = smoothstep(0.38, 0.6, top * moss + (mt.a - r.a) * 0.5 - 0.06) * (1.0 - sn); rc = mix(rc, vec3(0.12, 0.19, 0.055) * m3col(mt) * 1.2, mm); fHgt = mt.a * 0.02 * mm; }
            diffuseColor.rgb = mix(plain, rc, fFine); fHgt = (fHgt + r.a * 0.08 * (1.0 - mm)) * fFine;
          } else diffuseColor.rgb = plain;
        }
        // (bark: the picture of the stack running up the wood — before it is in, deep grooves drawn up it, ridges between
        // them, darker and greener patches: moss, lichen, the wet side)
        else if (vFK < -0.5) {
          if (fFine > 0.0) {
            vec3 n = normalize(vFN); float wx = smoothstep(0.25, 0.75, abs(n.x) / (abs(n.x) + abs(n.z) + 1e-4)); float side = (1.0 - smoothstep(0.65, 0.9, abs(n.y))) * fFine;
            vec4 tb = mix(m3raw(M3_BARK, vec2(vFP.x, vFP.y * 0.7) * M3S_BARK + 0.5), m3raw(M3_BARK, vec2(vFP.z, vFP.y * 0.7) * M3S_BARK), wx);
            diffuseColor.rgb *= mix(vec3(1.0), m3col(tb), side);
            fHgt = tb.a * 0.03 * side;
          } else if (uTexOn < 0.5) {
            float ga = texture2D(uDet, vec2(vFP.x * 1.5 + vFP.z * 0.4, vFP.y * 0.16)).r, gb = texture2D(uDet, vec2(vFP.z * 1.5 - vFP.x * 0.4, vFP.y * 0.16 + 0.5)).r;
            float gr = smoothstep(0.32, 0.68, (ga + gb) * 0.5); float pt = texture2D(uDet, vFP.xy * 0.35 + vFP.z * 0.21).a;
            diffuseColor.rgb *= mix(0.56, 1.14, gr) * (0.9 + pt * 0.2);
            diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.78, 1.02, 0.66), smoothstep(0.55, 0.75, pt) * 0.55);
          }
        }
        #endif
        // (moss on the trunks of the wet forests: on the side of the rain and low on the trunk, in patches, never on the stone's mark)
        if (vFK < -1.45 && vFK > -2.5) { float mo = clamp(-vFK - 1.5, 0.0, 1.0); vec3 n = normalize(vFN);
          float pt = texture2D(uDet, vec2(vFP.x * 0.6 + vFP.z * 0.4, vFP.y * 0.22)).r * 0.6 + texture2D(uDet, vFP.xz * 0.9 + vFP.y * 0.13).a * 0.4;
          float side = 0.55 + 0.45 * dot(n, normalize(vec3(-0.4, 0.3, 0.85)));
          float mm = smoothstep(0.42, 0.62, pt * side + mo * 0.55 - 0.25 - max(vFP.y - 6.0, 0.0) * 0.01) * mo;
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.085, 0.14, 0.045) * (0.8 + pt * 0.5), mm); }`)
        // (the relief of the bark and of the stone, from the heights of their pictures)
        .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        #ifndef NOPAT
        { vec3 dpx = dFdx(vFP), dpy = dFdy(vFP); float hx = dFdx(fHgt), hy = dFdy(fHgt);
          if (fFine > 0.0 && (vFK < -0.5 || fCrown > 0.5)) { vec3 nw = normalize(vFN); vec3 r1 = cross(dpy, nw), r2 = cross(nw, dpx); float det = dot(dpx, r1); vec3 gr = sign(det) * (hx * r1 + hy * r2); normal = normalize((viewMatrix * vec4(normalize(abs(det) * nw - gr), 0.0)).xyz); } }
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
      const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = R3.Q().aniso || 4; // (the preset's: 1 at Leve and Média, by software every sample costs — A5)
      MAT.leaf = new THREE.MeshLambertMaterial({ map: tx, alphaTest: 0.5, side: THREE.DoubleSide, vertexColors: true }); MAT.leaf.defines = { RIM: 0.28 };
      MAT.leaf.onBeforeCompile = sh => {
        Object.assign(sh.uniforms, { uTime: U.time, uWind: U.wind, uFine: UFINE });
        sh.vertexShader = 'attribute float aK; uniform float uTime; uniform vec3 uWind;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
          vec4 wq = modelMatrix * vec4(transformed, 1.0);
          float ph = uTime * (0.9 + uWind.z) + wq.x * 0.11 + wq.z * 0.07;
          transformed.xz += uWind.xy * (sin(ph) * 0.6 + sin(ph * 2.7 + 1.3) * 0.25 + 0.3) * aK * (0.25 + uWind.z * 0.6) + vec2(sin(uTime * 3.1 + wq.y * 2.0), cos(uTime * 2.7 + wq.x)) * 0.04 * aK;`);
        // (a card is lit by the crown's own normal on both its faces: three.js would turn a back face's into the crown's dark)
        // (the cards only as near as the machine carries them: past three quarters of the preset's distance they thin out and
        // go — the crown's lumps and their picture of leaves stand alone, as in the far pictures)
        sh.fragmentShader = 'uniform float uFine;\n' + sh.fragmentShader.replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
          { float ed = length(vViewPosition), fd = ed / uFine, hz = fract(sin(dot(floor(gl_FragCoord.xy), vec2(12.9898, 78.233))) * 43758.5453);
            if ((fd > 0.75 && hz < (fd - 0.75) * 4.0) || (ed < 1.5 && hz > smoothstep(0.45, 1.5, ed))) discard; } // (and right at the eye: a bough of needles, a spray of leaves crossing the view goes — no green card a metre wide)`)
          .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n normal = normal * faceDirection;').replace('#include <opaque_fragment>', `
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
  };

  // ------------------------------ the trees, the bushes, the stones ------------------------------
  const KIND = {
    oak: ['round', '#4f8f36', '#6b4a2e'], apple: ['round', '#5a9a3a', '#6b4a2e', '#d23a2a'], mulberry: ['round', '#4a7f32', '#5a3e28', '#4a1a3a'], olive: ['round', '#8a9a6a', '#7a6a5a'],
    cacao: ['round', '#4b763b', '#5a3e28', '#c87a2a'], coffee: ['bush', '#3e6733', '#5a3e28', '#b82a2a'], pepper: ['bush', '#4b763b', '#5a3e28', '#c82a1a'],
    birch: ['round', '#8ab84a', '#e8e4d8'], willow: ['willow', '#7aa84a', '#6b5a3e'], pine: ['cone', '#2f6a3a', '#5a3e28'], snowpine: ['cone', '#2a5a3e', '#5a3e28', '#f4f8fc'],
    jungle: ['tall', '#43763b', '#6b5038'], acacia: ['flat', '#7a9a3a', '#6b5038'], baobab: ['baobab', '#6a8a3a', '#9a8068'], cactus: ['cactus', '#5a8a3a'], incense: ['bush', '#8a9a5a', '#7a6a5a'],
    palm: ['palm', '#598643', '#8a6a44'], date: ['palm', '#5d8643', '#8a6a44', '#a8642a'], acai: ['palm', '#4c763b', '#6a5038', '#4a2a5a'], banana: ['banana', '#73a351', '#7a6a44', '#e8d04a'],
  };
  // the god's three tones of each crown: [base, dark, light] by kind and variant (art.js canopies)
  const TPAL = {
    oak: [['#4e8f3a', '#37692c', '#79b653'], ['#5b9d3e', '#3f7630', '#8fc75c'], ['#7c9b3a', '#5c7a2b', '#abc35b']],
    pine: [['#2f6e4a', '#224f36', '#4d9063'], ['#2c6a52', '#1f4d3c', '#4a8a6e'], ['#3a7445', '#2a5733', '#5b9660']],
    snowpine: [['#2e5e48', '#1f4234', '#4a7a60'], ['#2a5a4e', '#1c3e36', '#467666'], ['#35644a', '#244634', '#507e62']],
    birch: [['#8cc05a', '#679a3e', '#b4dc7a'], ['#9cc85a', '#76a23e', '#c4e27e'], ['#d0b44a', '#a88e30', '#e8d070']],
    // (the jungle's deep green: dark and full, not bright — S about half, as the moss of the roofs; under the hot sun the
    // grading lifts it, and the old greens of the south burned neon — the A6's proof in Tenochtitlan)
    jungle: [['#408441', '#295e2c', '#60a559'], ['#458e44', '#2d662e', '#6bb360'], ['#3b7b42', '#25542c', '#549c57']],
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
  const BTONE = [null, [[52, 84, 60], [34, 58, 42], [76, 110, 80]], [[56, 92, 58], [38, 64, 40], [82, 120, 78]], [[78, 104, 56], [54, 76, 40], [108, 132, 74]], [[53, 105, 52], [34, 74, 35], [80, 136, 75]], [[118, 124, 76], [86, 92, 56], [150, 152, 98]], [[124, 128, 88], [92, 96, 64], [156, 156, 112]]];
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
    // (a little quieter than the god's flat greens, as the moss of the turf roofs is: a crown among them, not lime)
    return p.map(c => { const q = [c[0] * f * (1 + w * 0.16), c[1] * f, c[2] * f * (1 - w * 0.2)]; const l = 0.3 * q[0] + 0.59 * q[1] + 0.11 * q[2]; return q.map(v => Math.min(255, l + (v - l) * 0.88)); });
  }
  // (the colour of a point of a crown: dark under it and near its heart, the base on its sides, light on top; snow
  // resting on the upper faces where it is cold)
  const leafCol = (pal, snow, cx, cz, r) => (X, Y, Z, nx, ny) => {
    let c = ny < 0 ? G.lerpColor(pal[1], pal[0], (ny + 1)) : G.lerpColor(pal[0], pal[2], G.clamp(ny * 0.85, 0, 1) * 0.75);
    const inner = G.clamp(1 - Math.hypot(X - cx, Z - cz) / Math.max(0.5, r), 0, 1); c = G.lerpColor(c, pal[1], inner * 0.3 * (1 - Math.max(0, ny)));
    if (snow > 0 && ny > 0.3) c = G.lerpColor(c, SNOW, snow * G.clamp((ny - 0.3) / 0.35, 0, 1));
    return c;
  };
  // (the leaves' cards and the blades at the foot of the stones a fifth quieter than the crown they stand out of: the sun
  // through a leaf and the grading of the picture saturate them — under a hot sun they were neon, the A6's proof)
  const calm = (c, k) => { const l = 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2]; return [l + (c[0] - l) * (1 - k), l + (c[1] - l) * (1 - k), l + (c[2] - l) * (1 - k)]; };
  // (how much quieter: the cards and the fronds, the large surfaces of green the sun shines through — under the warm sun of
  // the afternoon a fifth was not enough, the BIBLE's neon line is S 70 on the screen)
  const LCALM = 0.3;
  const calmCol = (f, k) => (X, Y, Z, nx, ny, nz) => calm(f(X, Y, Z, nx, ny, nz), k);
  // (the measures of a standing tree, the same for its drawing and for the leaves it lets fall: height, crown's heart and radius)
  // (G.Mata.tree: the forest's own rule — the canopy's map reads the same crowns; a temperate tree keeps the measures it had)
  function treeDims(t) {
    const k = KIND[t.kind] || KIND.oak; const D = G.Mata.tree(t);
    return { k, sz: D.sz, h: D.h, s: D.s, H: D.H, tall: 1, r: D.r, cy: D.cy, fl: D.fl, top: D.top, emerg: D.emerg, arq: D.arq };
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
    const S = G.S; const out = []; if (!window.THREE) return out; ready(); const TL = G.Space.TILE, HM = G.Space.HM; let n = 0;
    for (const t of S.trees.values()) {
      if (Math.abs(t.x - fx) > R || Math.abs(t.y - fy) > R || t.stage === 'fall') continue;
      const g = R3.Geo(), gp = R3.Geo(), gl = R3.Geo(); treeInto(g, t, gp, gl); if (++n > 150) break;
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
  // (a trunk with moss on it — the wet forests: -1,5 - its moss, 0..1; it does not sway)
  const MOSS = m => -1.5 - G.clamp(m, 0, 0.99);
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
    // (a buttress root of the great trees of the south: a thin flange, from high on the trunk down to the ground a stride or two out,
    // its outer edge a hollow curve; x out from the trunk, y up, z its thickness)
    { const pr = [[0, 1], [0.08, 0.72], [0.2, 0.46], [0.42, 0.22], [0.7, 0.08], [1, 0]]; const P = [], I = [];
      for (const z of [-0.5, 0.5]) { for (const [x, y] of pr) P.push(x, y, z); P.push(0, 0, z); } // (each face: the curve and the foot at the trunk)
      const n = pr.length + 1; for (let q = 0; q < pr.length - 1; q++) { I.push(pr.length, q, q + 1); I.push(n + pr.length, n + q + 1, n + q); I.push(q, n + q, n + q + 1, q, n + q + 1, q + 1); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setIndex(I); g.computeVertexNormals(); FS.butt = g; }
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
    const u0 = (q & 1) * 0.5, v0 = (1 - (q >> 1)) * 0.5; const UV = [[0, 0], [0.5, 0], [0.5, 0.5], [0, 0.5]]; const C = R3.lin(c);
    for (const k of [0, 1, 2, 0, 2, 3]) { gl.p.push(P[k][0], P[k][1], P[k][2]); gl.n.push(n[0], n[1], n[2]); gl.c.push(C[0], C[1], C[2]); gl.uv.push(u0 + UV[k][0], v0 + UV[k][1]); }
    gl._k(sw, 6);
  }
  // a crown of leaves: lumps round its heart, lit as one soft volume, and near the body the cards of leaves standing out
  // of their edges (a crown is leaves, not the smooth side of a lump). Returns its lumps [x, y, z, radius]
  function crownInto(g, gl, id, X, cy, Z, r, n, fl, pal, snow, sw, q, cards, shape) {
    // (the snow lies on the crown's lumps; the leaves standing out of its edge keep their green, a little frosted)
    const lc = leafCol(pal, snow, X, Z, r * 1.4), lcc = calmCol(snow > 0 ? leafCol(pal, snow * 0.3, X, Z, r * 1.4) : lc, LCALM); const lumps = [[X, cy + r * 0.42 * fl, Z, r * 0.92]];
    for (let k = 0; k < n - 1; k++) {
      const a = k / (n - 1) * TAU + G.hash(id * 3 + k) * 0.9, up = (k % 2 ? 0.3 : -0.14) * fl, ring = (k % 2 ? 0.52 : 0.8) * (0.86 + G.hash(id * 7 + k) * 0.28);
      lumps.push([X + Math.cos(a) * r * ring, cy + r * up, Z + Math.sin(a) * r * ring, r * (0.6 + G.hash(id * 5 + k) * 0.3)]);
    }
    // (each lump a soft mass of leaves, no flat face left on it: its light bent all the way round, from a point between its own
    // heart and the crown's — it still swells out of the crown, and the crown is still one volume in the sun; and where the
    // leaves' cards are drawn, near the body, a rounder lump under them, no box in its outline)
    const hy = cy + r * 0.12, sh = shape || (gl ? SH.dode : SH.ico0);
    for (let k = 0; k < lumps.length; k++) { const [x, y, z, s] = lumps[k]; const h = G.hash(id * 11 + k * 5); g.sph = [x + (X - x) * 0.45, y + (hy - y) * 0.45, z + (Z - z) * 0.45, 1];
      g.put(sh, R3.mat(x, y, z, h * TAU, s * (1.05 + h * 0.2), s * 0.92 * fl, s * (1.15 - h * 0.2), (h - 0.5) * 0.6), lc, sw + (y - cy) / r * 0.06); }
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

  // ------------------------------ the great trees of the south ------------------------------
  // (the trunk's radius at the foot of a great tree: its form and whether it is an emergent)
  const jungleGirth = D => (0.3 * D.sz + 0.16) * (D.emerg ? 1.35 : 1) * (D.arq === 3 ? 1.2 : 1);
  // the bark of each form: the umbrella's pale grey, the tiers' red-brown, the column's grey-green, the fig's dark and netted
  const JBARK = [[150, 144, 128], [124, 92, 70], [122, 128, 110], [96, 86, 72]];
  // a great tree of the tropical forest (D-471): a straight smooth trunk to the roof of the forest, buttress roots at its foot, its
  // boughs opening under a crown of its form — the umbrella wide and flat, the tiers in storeys, the column narrow and tall, the
  // fig spreading low with its aerial roots —, the emergent's umbrella above the roof of the others; moss on the trunk in the wet;
  // near the body, its hanging lianas and the bromeliads on its boughs
  function jungleInto(g, gp, gl, t, D, X, Y, Z, Yb, dY, rot, pal, snow, burnt, fine) {
    const { H, r, cy, fl, arq, emerg, sz, h } = D; const id = t.id;
    const r0 = jungleGirth(D); const i0 = W.idx(Math.floor(t.x), Math.floor(t.y)); const wet = G.S.moist ? G.S.moist[i0] / 255 : 0.6;
    const bk = burnt ? [30, 26, 24] : JBARK[arq].map(v => v * (0.9 + G.hash(id * 61) * 0.2)); const bc = barkCol(bk, snow); const moss = burnt ? 0 : G.clamp(0.25 + wet * 0.7, 0, 0.95);
    const base = Y + cy - r * fl * 0.5; // (where the trunk opens into its boughs)
    const lean = (h - 0.5) * 0.12, la = rot + 1.3; const tx = X + Math.cos(la) * lean * (base - Y), tz = Z + Math.sin(la) * lean * (base - Y);
    limb(g, FS.trunk, X, Yb, Z, tx, base + 0.4, tz, r0, bc, MOSS(moss));
    // (the buttresses: thin flanges round the foot, taller under the emergents; the fig has none — its roots hang from above)
    if (arq !== 3 && sz > 0.45) { const nb = 4 + Math.floor(G.hash(id * 67) * 3) + (emerg ? 1 : 0);
      for (let q = 0; q < nb; q++) { const a = rot + q / nb * TAU + (G.hash(id * 71 + q) - 0.5) * 0.7; const hb = (1.4 + G.hash(id * 73 + q) * 1.6) * (0.6 + sz * 0.5) * (emerg ? 1.5 : 1), lb = hb * (0.65 + G.hash(id * 79 + q) * 0.35);
        const ex = X + Math.cos(a) * r0 * 0.5, ez = Z + Math.sin(a) * r0 * 0.5; const fy = Math.min(Yb, G.Space.floorY(X + Math.cos(a) * (r0 + lb), Z + Math.sin(a) * (r0 + lb))) - 0.08;
        g.put(FS.butt, R3.mat(ex, fy, ez, -a, lb + r0 * 0.6, hb + (Yb - fy), 0.1 + r0 * 0.12), bc, MOSS(moss * 0.9)); } }
    // (the fig: aerial roots hanging from its boughs into the ground, and the net of the strangler round the trunk)
    if (arq === 3 && sz > 0.45) { const nr = fine ? 9 : 5;
      for (let q = 0; q < nr; q++) { const a = rot + q / nr * TAU + G.hash(id * 83 + q) * 0.5, d = r * (0.25 + G.hash(id * 89 + q) * 0.45); const rx = X + Math.cos(a) * d, rz = Z + Math.sin(a) * d; const top = base + r * fl * 0.2;
        limb(g, FS.limb, rx, G.Space.floorY(rx, rz) - 0.1, rz, rx + (G.hash(id + q) - 0.5) * 0.4, top, rz + (G.hash(id * 3 + q) - 0.5) * 0.4, 0.05 + G.hash(id * 97 + q) * 0.05, bc, MOSS(moss * 0.6)); }
      for (let q = 0; q < 5; q++) { const a0 = rot + q * 1.25; let px = X + Math.cos(a0) * r0 * 0.95, pz = Z + Math.sin(a0) * r0 * 0.95, py = Yb;
        for (let j = 0; j < 4; j++) { const a1 = a0 + (j + 1) * 0.55; const nx = X + Math.cos(a1) * r0 * (0.95 - j * 0.04), nz = Z + Math.sin(a1) * r0 * (0.95 - j * 0.04), ny = Yb + (base - Yb) * (j + 1) / 4; limb(g, FS.limb, px, py, pz, nx, ny, nz, 0.07, bc, MOSS(moss * 0.7)); px = nx; py = ny; pz = nz; } } }
    // (the boughs: rising and opening from the trunk's top into the crown, seen from below between its masses)
    const nb2 = arq === 2 ? 3 : 5; const ends = [];
    for (let q = 0; q < nb2; q++) { const a = rot + q / nb2 * TAU + G.hash(id * 101 + q) * 0.6; const e = r * (arq === 2 ? 0.35 : 0.55 + G.hash(id * 103 + q) * 0.2); const ex = tx + Math.cos(a) * e, ez = tz + Math.sin(a) * e, ey = base + r * fl * (0.25 + G.hash(id * 107 + q) * 0.3);
      limb(g, FS.limb, tx, base - 0.6, tz, ex, ey, ez, r0 * 0.42, bc, BARK - 0.05); ends.push([ex, ey, ez, a]);
      if (fine) limb(g, FS.limb, ex, ey, ez, ex + Math.cos(a + 0.7) * r * 0.3, ey + r * fl * 0.3, ez + Math.sin(a + 0.7) * r * 0.3, r0 * 0.2, bc, BARK - 0.1); }
    if (burnt) return;
    // (the crown of its form: masses of leaves round a wide heart — the umbrella in a ring and flat, the tiers in two storeys, the
    // column tall, the fig a low dome; the big leaves of the south at its edge where the body is near)
    const ccy = Y + cy; const cards = arq === 1 ? 2 : 3;
    if (arq === 1) { crownInto(g, gl, id, tx, ccy - r * 0.35, tz, r, 9, 0.45, pal, snow, 0.22, 3, cards); crownInto(g, gl, id + 7, tx + Math.cos(rot) * r * 0.2, ccy + r * 0.35, tz + Math.sin(rot) * r * 0.2, r * 0.68, 7, 0.5, pal, snow, 0.26, 3, cards); }
    else if (arq === 2) { crownInto(g, gl, id, tx, ccy, tz, r, 9, fl, pal, snow, 0.24, 3, cards); crownInto(g, gl, id + 5, tx, ccy + r * 0.9, tz, r * 0.6, 6, 0.9, pal, snow, 0.27, 3, 2); }
    else { crownInto(g, gl, id, tx, ccy, tz, r, 11, fl, pal, snow, 0.22, arq === 3 ? 0 : 3, cards);
      // (the umbrella's under-storey: a few masses under the rim, so its underside is leaves, not a lid)
      for (let q = 0; q < 4; q++) { const a = rot + q * 1.57 + 0.6, d = r * 0.6; const lc = leafCol(pal, snow, tx, tz, r * 1.2); g.sph = [tx, ccy, tz, 0.8]; g.put(SH.ico0, R3.mat(tx + Math.cos(a) * d, ccy - r * fl * 0.55, tz + Math.sin(a) * d, a, r * 0.55, r * 0.22, r * 0.5), lc, 0.2); g.sph = null; } }
    // (near: the lianas hanging from the boughs, swaying a little, and the bromeliads in the forks — the forest's quality says how many)
    const cq = R3.Q().cipo; if (!fine || !(cq > 0)) return;
    const nl = (2 + Math.floor(G.hash(id * 109) * 3)) * (cq > 1 ? 2 : 1); const lv = [64, 74, 48];
    for (let q = 0; q < nl; q++) { const a = rot + q * 2.39 + G.hash(id * 113 + q), d = r * (0.3 + G.hash(id * 127 + q) * 0.55); const sx = tx + Math.cos(a) * d, sz2 = tz + Math.sin(a) * d, sy = ccy - r * fl * (0.6 + G.hash(id * 131 + q) * 0.2);
      const gy = G.Space.floorY(sx, sz2); const ey = gy + 0.4 + G.hash(id * 137 + q) * Math.max(0.5, (sy - gy) * 0.6); let px = sx, py = sy, pz = sz2; const n = 4;
      for (let j = 1; j <= n; j++) { const u = j / n; const nx = sx + Math.sin(u * 3 + q) * 0.35, nz = sz2 + Math.cos(u * 2.6 + q) * 0.3, ny = sy + (ey - sy) * u; limb(g, FS.limb, px, py, pz, nx, ny, nz, 0.035 - u * 0.01, lv, BARK - 0.12 * u); px = nx; py = ny; pz = nz; }
      if (q % 2 === 0) { const c0 = calm(pal[1], LCALM), c1 = calm(pal[0], LCALM); for (let j = 0; j < 3; j++) { const ly = sy + (ey - sy) * (0.3 + j * 0.25), lx = sx + Math.sin((0.3 + j * 0.25) * 3 + q) * 0.35, lz = sz2 + Math.cos((0.3 + j * 0.25) * 2.6 + q) * 0.3; const aa = a + j * 2.1;
        gp.blade(lx, ly, lz, 0.14, aa, lx + Math.cos(aa) * 0.28, ly - 0.08, lz + Math.sin(aa) * 0.28, c0, c1, 0.5); } } }
    // (the bromeliads in the forks of the boughs: a rosette of strap leaves round a red heart)
    for (let q = 0; q < Math.min(ends.length, cq > 1 ? 5 : 3); q++) { const [ex, ey, ez] = ends[q]; const c0 = calm([60, 104, 50], 0.2), c1 = calm([110, 140, 64], 0.2);
      for (let j = 0; j < 7; j++) { const aa = j / 7 * TAU + q; gp.blade(ex, ey, ez, 0.07, aa + Math.PI / 2, ex + Math.cos(aa) * 0.32, ey + 0.22, ez + Math.sin(aa) * 0.32, j < 2 ? [150, 40, 50] : c0, c1, 0.3); } }
  }
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
    const gr = k[0] === 'tall' ? jungleGirth(D) / 0.27 : 1; // (a great tree of the south leaves a stump, and lies as a log, of its own girth)
    if (t.stage === 'stump') { g.put(SH.cyl, R3.mat(X, Yb, Z, rot, 0.6 * gr, 0.45 + dY, 0.6 * gr), (X2, Y2, Z2, nx, ny) => (ny > 0.9 ? [214, 180, 128] : bark0), BARK); return; }
    if (t.stage === 'fall' && !t._standing) return; // (a tree falling is drawn moving, by FX3D, until it lies)
    if (t.stage === 'log' || t.stage === 'fall') { g.put(SH.cyl, R3.mat(X, Y + 0.3 * gr, Z, rot, 0.5 * gr, 4.5 * sz * (gr > 1 ? 1.6 : 1), 0.5 * gr, 0, Math.PI / 2), (X2, Y2, Z2, nx, ny) => (Math.abs(ny) < 0.2 && Math.abs(nx) < 0.3 ? [214, 180, 128] : bark0), k[0] === 'tall' ? MOSS(0.5) : BARK); return; }
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
          // rim broken into boughs; in the snow, the green of their needles under a frost — the snow lies on the tiers, a spray
          // standing out of it all white would be a feather)
          const lcn = calmCol(snow > 0 ? leafCol(pal, snow * 0.3, X, Z, 1.6 * sz + 0.6) : lc, LCALM);
          if (gl) for (let q = 0; q < nt; q++) { const u = q / (nt - 1); const w2 = ((3.5 - u * 2.7) * sz + 0.6) * 0.5; const y = Y + H * (0.15 + u * 0.63); const nc = q < nt - 1 ? 7 : 4;
            for (let j = 0; j < nc; j++) { const a = rot + q * 1.7 + j * TAU / nc + (G.hash(t.id + q * 5 + j) - 0.5) * 0.7; const dx = Math.cos(a), dz = Math.sin(a); const rr = w2 * (0.78 + G.hash(t.id * 3 + q * 7 + j) * 0.2); const px = X + dx * rr, pz = Z + dz * rr;
              card4(gl, px, y - w2 * 0.08, pz, w2 * 0.66 + 0.3, a, 0.55 + G.hash(q + j * 3 + t.id) * 0.4, [dx * 0.6, 0.8, dz * 0.6], lcn(px, y, pz, dx * 0.6, 0.8, dz * 0.6), 0.12 + u * 0.12, 2); } }
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
            const c0 = calm(pal[1], LCALM), c1 = calm(pal[0], LCALM), c2 = calm(pal[2], LCALM); // (the fronds in the sun as quiet as the cards)
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
      case 'tall': jungleInto(g, gp, gl, t, D, X, Y, Z, Yb, dY, rot, pal, snow, burnt, fine); break;
      default: { // broad crowns: oak, birch, the fruit trees
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
            for (let q = 0; q < lumps.length; q++) { const [lx, ly, lz, ls] = lumps[q]; for (let j = 0; j < (fine ? 3 : 1); j++) {
              const a = G.hash(t.id * 13 + q * 7 + j) * TAU, e = -0.65 + G.hash(t.id * 17 + q * 3 + j) * 1.0, rf = 0.5 * ls * (0.84 + G.hash(t.id * 19 + q + j * 5) * 0.24);
              const px = lx + Math.cos(a) * Math.cos(e) * rf * 1.1, py = ly + Math.sin(e) * rf * 0.92, pz = lz + Math.sin(a) * Math.cos(e) * rf * 1.1;
              g.sph = [px, py, pz, 1]; g.put(SH.ico0, R3.mat(px, py, pz, a, 0.08 + G.hash(q + j * 11 + t.id) * 0.03), fc, FRUIT + 0.25); } }
            g.sph = null; }
        } else for (let q = 0; q < 3; q++) { const a = rot + q * 2.1; limb(g, FS.limb, X, cy - r * 0.3, Z, X + Math.cos(a) * r * 0.7, cy + r * 0.4, Z + Math.sin(a) * r * 0.7, r0 * 0.25, bc, BARK - 0.05); }
      }
    }
    g.sph = null;
    // (21a: in the swamp, the old man's beard hanging from the crowns of its broad trees — near the body, where the quality has the lianas)
    if (fine && !burnt && R3.Q().cipo > 0 && (k[0] === 'willow' || k[0] === 'tall' || k[0] === 'round') && G.S.biome && G.S.biome[W.idx(Math.floor(t.x), Math.floor(t.y))] === 3) beardInto(gp, t, D, X, Y, Z);
  }
  // (the hanging moss of the swamp — the old man's beard —, grey-green strands under the crown of its trees, near the body: D-480)
  function beardInto(gp, t, D, X, Y, Z) {
    for (let q = 0; q < 14; q++) { const a = q * 2.39 + G.hash(t.id * 139 + q) * 0.7, d = D.r * (0.35 + G.hash(t.id * 149 + q) * 0.55); const lx = X + Math.cos(a) * d, lz = Z + Math.sin(a) * d, ly = Y + D.cy - D.r * D.fl * (0.3 + G.hash(t.id * 151 + q) * 0.3);
      const L = 0.8 + G.hash(t.id * 157 + q) * 1.6; gp.blade(lx, ly, lz, 0.22, a + Math.PI / 2, lx + Math.cos(a) * 0.12, ly - L, lz + Math.sin(a) * 0.12, [132, 140, 112], [168, 172, 146], 0.8); }
  }
  // (a boulder's colour, the god's grey; the sandstone of the dry lands, the dark stone of the forests of the south)
  function rockBase(r, i) { if (r.meteor) return [74, 58, 52]; const b = G.Biome && G.Biome.of ? G.Biome.of(i) : 0; return b === 5 || b === 6 ? [178, 136, 102] : b === 4 ? [124, 122, 108] : [154, 149, 140]; }
  // (which near chunks draw the finest of their plants — the leaves' cards, roots and twigs, every fruit, the stones round a
  // boulder's foot, the rounder lumps of a bush: those the body is within 40 m × the preset's lod of, by the chunk's nearest
  // edge; once fine, until the body is 8 m further off. Asked by the chunks' signature, so a chunk is drawn again when it
  // changes; a chunk never asked — a preset without lod, a test's stretch of land — keeps it all, as before. Only seen)
  const fineOf = new Map(); G.worldHooks.push(() => fineOf.clear());
  R3.floraFine = function (x0, y0, n) {
    const q = R3.Q(); const key = x0 + ',' + y0; const f = G.Possess && G.Possess.body ? G.Possess.body() : null;
    if (!Number.isFinite(q.lod) || !f) { fineOf.delete(key); return 1; }
    const L = G.Space.TILE, X = f.x * L, Z = f.y * L, D = 40 * q.lod;
    const d = Math.hypot(Math.max(x0 * L - X, 0, X - (x0 + n) * L), Math.max(y0 * L - Z, 0, Z - (y0 + n) * L));
    const now = fineOf.get(key) ? d < D + 8 : d < D; fineOf.set(key, now); return now ? 1 : 0;
  };
  function floraGeo(x0, y0, w, h, far) {
    const fine = !fineOf.has(x0 + ',' + y0) || fineOf.get(x0 + ',' + y0);
    const S = G.S; const g = R3.Geo(), gp = R3.Geo(), gl = far || !fine || !R3.Q().detail ? null : R3.Geo(); const TL = G.Space.TILE, HM = G.Space.HM;
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
      if (!W.inb(x, y)) continue; const i = y * N + x;
      const tid = S.treeAt[i]; const t = tid && S.trees.get(tid);
      if (t) {
        if (far && (KIND[t.kind] || KIND.oak)[0] === 'tall') { if (t.stage !== 'grow' || t.size < 0.3) continue; const D = G.Mata.tree(t); const pal = tpal(t); // (the great tree of the south: its umbrella where it hangs, over the roof)
          g.put(SH.ico0, R3.mat(t.x * TL, W.groundH(t.x, t.y) * HM + D.cy, t.y * TL, D.h * TAU, D.r * 2.1, D.r * D.fl * 1.4 + 1.2, D.r * 2.1), (X, Y, Z, nx, ny) => G.lerpColor(pal[1], pal[2], G.clamp(ny * 0.5 + 0.5, 0, 1) * 0.8)); }
        else if (far) { if (t.stage !== 'grow' || t.size < 0.3) continue; const k = KIND[t.kind] || KIND.oak; const H = 5 + 7 * t.size; const pal = tpal(t); g.put(k[0] === 'cone' ? SH.cone : SH.ico0, R3.mat(t.x * TL, W.groundH(t.x, t.y) * HM + (k[0] === 'cone' ? 0 : H * 0.6), t.y * TL, 0, k[0] === 'cone' ? 4 : 5.5 * t.size + 1.5, k[0] === 'cone' ? H : 4.5, k[0] === 'cone' ? 4 : 5.5 * t.size + 1.5), (X, Y, Z, nx, ny) => G.lerpColor(pal[1], pal[2], G.clamp(ny * 0.5 + 0.5, 0, 1) * 0.8)); }
        else treeInto(g, t, gp, gl);
      }
      if (far) continue;
      const oid = S.objAt[i]; if (!oid) continue;
      const r = S.rocks.get(oid);
      if (r) {
        // (21b: the boulder itself and the stones broken off round its foot are the relief's — G.Geo3D, js/geo3d.js, by instancing, in the
        // bands of its rock; here only the grass round its foot)
        const sty = G.Biome && G.Biome.style ? G.Biome.style(i) : 'grass';
        const moss = r.meteor || snowAt(i) > 0.4 || sty === 'dune' || sty === 'savanna' ? 0 : sty === 'jungle' || sty === 'swamp' || sty === 'taiga' ? 0.85 : 0.45;
        const [big] = G.Space.stones(r);
        // (and, where the land is green, the grass growing up round its foot: the stone sits in the ground, not on it)
        if (gl && moss > 0 && !S.road[i]) { const tc = tileCol(i, x, y); const root = calm([tc[0] * 0.62, tc[1] * 0.72, tc[2] * 0.55], 0.2), tip = calm([Math.min(255, tc[0] * 0.92 + 16), Math.min(255, tc[1] * 1.02 + 10), tc[2] * 0.82], 0.2);
          // (a ring of tufts hugging its foot — round the stone's own outline, just outside it —, their blades leaning out
          // from it: the stone sits in a ring of grass, not among a few spikes)
          const cr = Math.cos(big.ry), sr = Math.sin(big.ry);
          for (let q = 0; q < 18; q++) { const a = (q + G.hash(oid * 23 + q) * 0.8) / 18 * TAU, f = 1.0 + G.hash(oid * 29 + q) * 0.22; const lx = Math.cos(a) * big.sx * 0.5 * f, lz = Math.sin(a) * big.sz * 0.5 * f;
            const px = big.X + lx * cr + lz * sr, pz = big.Z - lx * sr + lz * cr, oa = Math.atan2(pz - big.Z, px - big.X);
            if (!W.inb(px / TL, pz / TL) || S.road[W.idx(px / TL, pz / TL)] || S.occ[W.idx(px / TL, pz / TL)]) continue; const py = G.Space.floorY(px, pz) - 0.02;
            for (let k = 0; k < 5; k++) { const ba = oa + (k - 2) * 0.5 + (G.hash(oid + q * 3 + k) - 0.5) * 0.6, hh = 0.16 + G.hash(oid * 31 + q * 5 + k) * 0.24; gp.blade(px, py, pz, 0.08, ba + Math.PI / 2, px + Math.cos(ba) * hh * 0.42, py + hh, pz + Math.sin(ba) * hh * 0.42, root, G.lerpColor(root, tip, 0.8), 1); } } }
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
            for (let j = 0; j < (gl ? 3 : 1); j++) { const aj = a + j * 2.09 + q, px = cx + Math.cos(aj) * 0.045, pz = cz + Math.sin(aj) * 0.045, py = hy + (j === 2 ? 0.05 : -0.01);
              g.sph = [px, py, pz, 1]; g.put(SH.ico0, R3.mat(px, py, pz, j + q, 0.072), j ? bc : G.lerpColor(bc, [190, 60, 70], 0.25), FRUIT + 0.12); }
          }
          g.sph = null;
        }
      }
    }
    if (far) roofInto(g, x0, y0, w, h);
    else if (gl && R3.Q().cipo > 0) lianasInto(g, x0, y0, w, h);
    return { flora: g.empty ? null : g.build(false, true), plants: gp.empty ? null : gp.build(), leaves: gl && !gl.empty ? gl.build(false, true) : null };
  }
  // the roof of the forest seen from far (D-474): where the crowns close (Mata's canopy), a sheet a little under the tops of the
  // crowns — tile by tile, at the height of the canopy there —, so the forest from a hill is one roof in waves with the great
  // crowns standing out of it, never the ground showing between balls
  const ROOF = [[44, 86, 46], [38, 72, 46], [34, 64, 50], [52, 82, 52], [36, 78, 40], [86, 100, 52], [96, 104, 64]];
  function roofInto(g, x0, y0, w, h) {
    if (!G.Mata) return; const TL = G.Space.TILE, HM = G.Space.HM; const S = G.S;
    // (only a chunk with a wood in it: a plain, the sea, a town, the desert ask nothing of the forest's map — the far pictures of the
    // whole map are made when the view opens)
    let nt = 0; for (let y = y0; y < y0 + h && nt < 24; y++) for (let x = x0; x < x0 + w; x++) { if (!W.inb(x, y)) continue; const t = S.trees.get(S.treeAt[y * G.N + x]); if (t && t.stage === 'grow' && t.size >= 0.5) nt++; }
    if (nt < 24) return;
    const cd = G.Mata.canopy(x0 - 1, y0 - 1, w + 2, h + 2), ca = G.Mata.canopy(x0 - 1, y0 - 1, w + 2, h + 2, 'alto'); const W2 = w + 2;
    const at = (x, y) => (y - y0 + 1) * W2 + (x - x0 + 1);
    // (a corner's height: the mean of the roof of the tiles round it that are under the canopy)
    const corner = (x, y) => { let s = 0, n = 0; for (let dy = -1; dy <= 0; dy++) for (let dx = -1; dx <= 0; dx++) { const k = at(x + dx, y + dy); if (k < 0 || k >= cd.data.length || cd.data[k] < 100) continue; s += ca.data[k] / 4; n++; } return n ? s / n : -1; };
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
      if (!W.inb(x, y)) continue; const k = at(x, y); if (cd.data[k] < 140 || ca.data[k] < 24) continue;
      const P = [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]].map(([cx, cy]) => { const hh = corner(cx, cy); const gy = W.hAt(Math.min(G.N - 0.001, cx), Math.min(G.N - 0.001, cy)) * HM; return [cx * TL, gy + Math.max(2, (hh < 0 ? ca.data[k] / 4 : hh) - 1.6), cy * TL]; });
      const b = S.biome ? S.biome[y * G.N + x] : 0; const base = ROOF[b] || ROOF[0]; const f = 0.86 + G.hash(y * 7919 + x * 31) * 0.26;
      const c = [base[0] * f, base[1] * f, base[2] * f], c2 = [c[0] * 0.86, c[1] * 0.9, c[2] * 0.86];
      g.tri(P[0], P[2], P[1], c, c2, c); g.tri(P[0], P[3], P[2], c, c, c2);
    }
  }
  // the lianas between the great trees of a chunk (D-475): from the boughs of one to the boughs of a neighbour three to nine metres
  // off, sagging between them — only two trees of the same chunk (a felled one takes its liana with it when the chunk is made again)
  function lianaPairs(x0, y0, w, h) {
    const S = G.S; const TL = G.Space.TILE; const list = [], out = [];
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) { if (!W.inb(x, y)) continue; const t = S.trees.get(S.treeAt[y * G.N + x]); if (!t || t.stage !== 'grow' || t.size < 0.5) continue; const k = KIND[t.kind] || KIND.oak; if (k[0] !== 'tall' && !(k[0] === 'round' && S.biome && (S.biome[y * G.N + x] === 4 || S.biome[y * G.N + x] === 3))) continue; list.push(t); }
    const many = R3.Q().cipo > 1 ? 0.55 : 0.32;
    for (const a of list) for (const b of list) { if (b.id <= a.id) continue; const d = Math.hypot(a.x - b.x, a.y - b.y) * TL; if (d >= 3 && d <= 9 && G.hash(a.id * 977 + b.id * 131) <= many) out.push([a, b, d]); }
    return out;
  }
  function lianasInto(g, x0, y0, w, h) {
    const TL = G.Space.TILE, HM = G.Space.HM; const lv = [60, 70, 44];
    for (const [a, b, d] of lianaPairs(x0, y0, w, h)) {
      const Da = G.Mata.tree(a), Db = G.Mata.tree(b); const ya = W.groundH(a.x, a.y) * HM + Da.cy - Da.r * Da.fl * 0.4, yb = W.groundH(b.x, b.y) * HM + Db.cy - Db.r * Db.fl * 0.4;
      const ax = a.x * TL, az = a.y * TL, bx = b.x * TL, bz = b.y * TL; const sag = 1.5 + d * (0.2 + G.hash(a.id + b.id * 3) * 0.25); const n = 6; let px = ax, py = ya, pz = az;
      for (let j = 1; j <= n; j++) { const u = j / n; const nx = ax + (bx - ax) * u, nz = az + (bz - az) * u, ny = ya + (yb - ya) * u - sag * 4 * u * (1 - u); limb(g, FS.limb, px, py, pz, nx, ny, nz, 0.035, lv, BARK - 0.1 - 0.1 * Math.sin(u * Math.PI)); px = nx; py = ny; pz = nz; }
    }
  }
  // (for the tests: the plants and stones of a stretch of land as the near picture draws them — its three geometries)
  R3.floraOf = (x0, y0, w, h) => (window.THREE ? (ready(), floraGeo(x0, y0, w, h, false)) : null);
  // a little grass and flowers on the open land near the body: only seen, the same tufts every time (the world's seed),
  // and of the land's own kind — short and green in the meadows, tall and golden in the savanna, reeds in the swamp,
  // sparse in the taiga, none on snow or dune
  // [tufts a tile, height (m), blades a tuft, tips: 0 green, 1 golden, 2 reeds]
  const GRASS = { grass: [7, 0.42, 4, 0], savanna: [8, 0.9, 5, 1], swamp: [6, 1.25, 4, 2], jungle: [8, 0.75, 5, 0], taiga: [3, 0.38, 3, 0], snow: null, dune: null };
  const FLOWER = ['#f2e46a', '#e86a8a', '#f4f4f0', '#9a7ae8', '#f29a4a'];
  function grassGeo(x0, y0, w, h) {
    const S = G.S; const g = R3.Geo(); const TL = G.Space.TILE, HM = G.Space.HM;
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

  // (a single tree, standing, in its own geometry with its foot at the origin — for one that falls: FX3D turns it over)
  R3.treeMesh = function (t) {
    ready();
    const g = R3.Geo(), gp = R3.Geo(), gl = R3.Q().detail ? R3.Geo() : null; const o = Object.assign({}, t, { stage: 'grow', _standing: 1 }); treeInto(g, o, gp, gl);
    const TL = G.Space.TILE, HM = G.Space.HM; const X = t.x * TL, Y = W.groundH(t.x, t.y) * HM, Z = t.y * TL;
    const grp = new THREE.Group();
    if (!g.empty) { const geo = g.build(false, true); geo.translate(-X, -Y, -Z); const m = new THREE.Mesh(geo, MAT.flora); m.castShadow = true; grp.add(m); }
    if (!gp.empty) { const geo = gp.build(); geo.translate(-X, -Y, -Z); const m = new THREE.Mesh(geo, MAT.plant); grp.add(m); }
    if (gl && !gl.empty) { const geo = gl.build(false, true); geo.translate(-X, -Y, -Z); const m = new THREE.Mesh(geo, MAT.leaf); m.castShadow = true; grp.add(m); }
    grp.position.set(X, Y, Z); R3.scene().add(grp); return grp;
  };

  // ------------------------------ the doors ------------------------------
  // where what perches on a tree of the world is (D-476), in metres, [X, Y, Z]: 'colmeia' a hive hanging under a bough, 'ninho' a nest in
  // a fork of the crown, 'copa' the crown's heart (and its radius, the fourth), 'tronco' the top of the trunk where the boughs open.
  // A tree of the temperate lands keeps the places it had (the hive at 2,6 m + 2,2 × its size, the nest at 3 + 3,2 × its size); a great
  // tree of the south has them up in its own crown, twenty metres up — never a hive on the bare trunk
  A3.anchor = function (t, what) {
    if (!t) return null; const TL = G.Space.TILE, HM = G.Space.HM; const X = t.x * TL, Z = t.y * TL, Yg = W.groundH(t.x, t.y) * HM; const D = G.Mata.tree(t); const tall = (KIND[t.kind] || KIND.oak)[0] === 'tall';
    if (what === 'copa') return [X, Yg + D.cy, Z, D.r];
    if (!tall) { if (what === 'colmeia') return [X + 0.6, Yg + 2.6 + t.size * 2.2, Z + 0.3]; if (what === 'ninho') return [X, Yg + 3 + t.size * 3.2, Z]; return [X, Yg + D.cy - D.r * 0.5, Z]; }
    const base = Yg + D.cy - D.r * D.fl * 0.5; const a = D.h * TAU + 1.1;
    if (what === 'colmeia') return [X + Math.cos(a) * D.r * 0.35, base - 0.25, Z + Math.sin(a) * D.r * 0.35];
    if (what === 'ninho') return [X + Math.cos(a + 2) * D.r * 0.28, base + D.r * D.fl * 0.25, Z + Math.sin(a + 2) * D.r * 0.28];
    return [X, base, Z];
  };
  // (how high a beast up a tree is drawn, in metres over the ground: the world's climb — its height against the crown it climbs to,
  // A.canopyZ — laid on the tree as it is drawn; a temperate tree the old way, four metres at most)
  A3.perchY = function (a) {
    const t = a && G.S.trees.get(a.tree || a.perch); const z = a.z || 0;
    if (!t || (KIND[t.kind] || KIND.oak)[0] !== 'tall' || !(G.Animals && G.Animals.canopyZ)) return Math.min(4, z * 0.22);
    const D = G.Mata.tree(t); return G.clamp(z / Math.max(1, G.Animals.canopyZ(t)), 0, 1) * (D.cy - D.r * D.fl * 0.5);
  };
  // the plants of a stretch of land, for a chunk: the near picture (far false: the three geometries — what sways, what bends, the
  // cards of leaves) or the far one (far true: one form for each tree)
  A3.geo = (x0, y0, w, h, far) => { ready(); return floraGeo(x0, y0, w, h, far); };
  // the grass tufts of a chunk where the field of blades (Grass3D) is not drawn
  A3.grassGeo = (x0, y0, w, h) => { ready(); return grassGeo(x0, y0, w, h); };
  // (for the proofs: one tree drawn alone into three builders; the lianas of a stretch, as pairs of tree ids)
  A3._treeInto = (g, t, gp, gl) => { ready(); fsh(); treeInto(g, t, gp, gl); };
  A3._lianas = (x0, y0, w, h) => lianaPairs(x0, y0, w, h).map(([a, b]) => [a.id, b.id]);
})(window.G);
