'use strict';
// ============================================================
//  Post3D: what is done to the picture of the body's view after
//  it is drawn, where the quality has it (G.Realm.Q: ao, bloom).
//  The world is drawn first into a picture of linear light (more
//  than white where the light is), then: the shade gathered in
//  the corners and where things touch (ambient occlusion, read
//  from the picture's depth — SAO), the glow of what is brighter
//  than white (lamps and windows at night, the sun's disc, its
//  glitter on the water), and last the exposure of the hour, the
//  tone curve and the grade — the very ones the materials use
//  when the picture goes straight to the screen (R3.GLSL) — and a
//  fine grain so the sky has no bands. Nothing is invented: a
//  shade only where the drawn shapes close in, a glow only round
//  what is that bright. Only seen: it reads the drawn picture.
// ============================================================
(function (G) {
  const P3 = G.Post3D = { on: false, failed: null, passes: 0, ms: 0 };
  let THREE = null, R3 = null, ren = null;
  let rtS = null, rtA = null, rtB = null, BL = [], quad = null, qcam = null, M = null, size = [0, 0], want = { ao: 0, bloom: 0 };
  const NB = 5; // (the glow's ladder of ever smaller pictures)

  // ------------------------------ the shaders ------------------------------
  const VS = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
  // (view space from the depth picture: the eye's own frame, metres)
  const VIEW = `uniform sampler2D tDepth; uniform vec4 uProj; uniform vec2 uNF;
float vz(vec2 uv) { float d = texture2D(tDepth, uv).r; return uNF.x * uNF.y / ((uNF.y - uNF.x) * d - uNF.y); }
vec3 vpos(vec2 uv, float z) { return vec3((uv * 2.0 - 1.0 + uProj.zw) / uProj.xy * -z, z); }`;
  // ambient occlusion (scalable ambient obscurance, McGuire et al. 2012): round each point, samples on a spiral in a disc
  // of a metre or so of the world; each one that rises over the point's surface takes away some of the sky it sees
  const AOFS = `varying vec2 vUv; uniform vec2 uTexel; uniform float uR; uniform float uScale; uniform float uFar;
${VIEW}
#ifndef NS
#define NS 8
#endif
void main() {
  float z = vz(vUv);
  if (-z > uFar) { gl_FragColor = vec4(1.0, -z, 0.0, 1.0); return; }
  vec3 P = vpos(vUv, z);
  // (the surface's slope from the neighbours: on each axis the side that is nearer, so an edge does not bend it)
  vec2 dx = vec2(uTexel.x, 0.0), dy = vec2(0.0, uTexel.y);
  vec3 Pr = vpos(vUv + dx, vz(vUv + dx)), Pl = vpos(vUv - dx, vz(vUv - dx)), Pu = vpos(vUv + dy, vz(vUv + dy)), Pd = vpos(vUv - dy, vz(vUv - dy));
  vec3 ex = abs(Pr.z - P.z) < abs(P.z - Pl.z) ? Pr - P : P - Pl; vec3 ey = abs(Pu.z - P.z) < abs(P.z - Pd.z) ? Pu - P : P - Pd;
  vec3 N = normalize(cross(ex, ey)); if (dot(N, P) > 0.0) N = -N;
  // (the disc on the screen: a world radius seen at this depth; turned a different way at each pixel, the noise blurred later)
  float rs = min(uR * uScale / -z, 48.0); float ang = 6.2831853 * fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  float sum = 0.0;
  for (int i = 0; i < NS; i++) {
    float a = (float(i) + 0.5) / float(NS); float th = a * 6.2831853 * 2.62 + ang;
    vec2 o = vec2(cos(th), sin(th)) * a * rs;
    vec2 su = vUv + o * uTexel;
    vec3 Q = vpos(su, vz(su)); vec3 v = Q - P; float vv = dot(v, v); float vn = dot(v, N);
    // (only what is in front of the surface and within the radius; a far wall behind does not count)
    sum += max(0.0, vn + z * 0.002) / (vv + 0.01) * max(0.0, 1.0 - vv / (uR * uR));
  }
  float ao = max(0.0, 1.0 - 2.0 * 0.28 * sum / float(NS));
  ao = pow(ao, 1.6);
  // (far off the shade fades: the haze has the distance)
  ao = mix(ao, 1.0, smoothstep(uFar * 0.6, uFar, -z));
  gl_FragColor = vec4(ao, -z, 0.0, 1.0);
}`;
  // (the speckle of the samples blurred away, but never across an edge: the weight falls with the difference in depth)
  const BLURFS = `varying vec2 vUv; uniform sampler2D tAO; uniform vec2 uDir;
void main() {
  vec4 c = texture2D(tAO, vUv); float z = c.g; float s = c.r * 0.27, w = 0.27; float tol = 0.04 * z + 0.05;
  for (int i = 1; i <= 3; i++) {
    float k = i == 1 ? 0.217 : i == 2 ? 0.111 : 0.037;
    for (int sd = -1; sd <= 1; sd += 2) { vec4 q = texture2D(tAO, vUv + uDir * float(i * sd)); float wq = k * exp(-abs(q.g - z) / tol); s += q.r * wq; w += wq; }
  }
  gl_FragColor = vec4(s / w, z, 0.0, 1.0);
}`;
  // the glow: what is brighter than white, kept (a soft knee), then down a ladder of halving pictures and back up, each step
  // a small blur — a wide, soft halo for a little work
  const PREFS = `varying vec2 vUv; uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uExp; uniform float uTh;
void main() {
  vec3 c = (texture2D(tSrc, vUv + uTexel * vec2(-1.0, -1.0)).rgb + texture2D(tSrc, vUv + uTexel * vec2(1.0, -1.0)).rgb + texture2D(tSrc, vUv + uTexel * vec2(-1.0, 1.0)).rgb + texture2D(tSrc, vUv + uTexel * vec2(1.0, 1.0)).rgb) * 0.25 * uExp;
  float br = max(c.r, max(c.g, c.b)); float kn = uTh * 0.35; float sq = clamp(br - uTh + kn, 0.0, 2.0 * kn); sq = sq * sq / (4.0 * kn + 1e-5);
  gl_FragColor = vec4(min(c * max(sq, br - uTh) / max(br, 1e-4), vec3(32.0)), 1.0);
}`;
  const DOWNFS = `varying vec2 vUv; uniform sampler2D tSrc; uniform vec2 uTexel;
void main() { vec2 h = uTexel; gl_FragColor = vec4((texture2D(tSrc, vUv).rgb * 4.0 + texture2D(tSrc, vUv + vec2(-h.x, -h.y)).rgb + texture2D(tSrc, vUv + vec2(h.x, -h.y)).rgb + texture2D(tSrc, vUv + vec2(-h.x, h.y)).rgb + texture2D(tSrc, vUv + vec2(h.x, h.y)).rgb) / 8.0, 1.0); }`;
  const UPFS = `varying vec2 vUv; uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uK;
void main() { vec2 h = uTexel; vec3 c = (texture2D(tSrc, vUv + vec2(-h.x * 2.0, 0.0)).rgb + texture2D(tSrc, vUv + vec2(h.x * 2.0, 0.0)).rgb + texture2D(tSrc, vUv + vec2(0.0, -h.y * 2.0)).rgb + texture2D(tSrc, vUv + vec2(0.0, h.y * 2.0)).rgb) / 6.0
  + (texture2D(tSrc, vUv + vec2(-h.x, -h.y)).rgb + texture2D(tSrc, vUv + vec2(h.x, -h.y)).rgb + texture2D(tSrc, vUv + vec2(-h.x, h.y)).rgb + texture2D(tSrc, vUv + vec2(h.x, h.y)).rgb) / 12.0;
  gl_FragColor = vec4(c * uK, 1.0); }`;
  // the last pass: the picture, its shade, its glow; the exposure of the hour, the tone curve, the grade, to the screen's colours
  const COMPFS = () => `varying vec2 vUv; uniform sampler2D tScene; uniform sampler2D tAOt; uniform sampler2D tBloom; uniform vec2 uAOTexel; uniform float uAOK; uniform float uBloomK; uniform float uExp;
${VIEW}
${R3.GLSL.grade}
// (three.js's neutral curve, the one the materials use straight to the screen — Khronos PBR Neutral)
vec3 neutral(vec3 color) {
  const float startCompression = 0.8 - 0.04; const float desaturation = 0.15;
  float x = min(color.r, min(color.g, color.b)); float offset = x < 0.08 ? x - 6.25 * x * x : 0.04; color -= offset;
  float peak = max(color.r, max(color.g, color.b)); if (peak < startCompression) return color;
  float d = 1.0 - startCompression; float newPeak = 1.0 - d * d / (peak + d - startCompression); color *= newPeak / peak;
  float g = 1.0 - 1.0 / (desaturation * (peak - newPeak) + 1.0); return mix(color, vec3(newPeak), g);
}
vec3 toSRGB(vec3 c) { return mix(c * 12.92, pow(c, vec3(0.41666)) * 1.055 - 0.055, step(0.0031308, c)); }
void main() {
  vec3 c = texture2D(tScene, vUv).rgb;
#ifdef AO
  // (the shade, brought up to the full picture without crossing edges: of the four nearest, those at this depth count)
  { float z = -vz(vUv); vec2 p = vUv / uAOTexel - 0.5; vec2 f = fract(p); vec2 b = (floor(p) + 0.5) * uAOTexel;
    vec4 a00 = texture2D(tAOt, b), a10 = texture2D(tAOt, b + vec2(uAOTexel.x, 0.0)), a01 = texture2D(tAOt, b + vec2(0.0, uAOTexel.y)), a11 = texture2D(tAOt, b + uAOTexel);
    float tol = 0.03 * z + 0.05;
    vec4 w = vec4((1.0 - f.x) * (1.0 - f.y), f.x * (1.0 - f.y), (1.0 - f.x) * f.y, f.x * f.y) * exp(-abs(vec4(a00.g, a10.g, a01.g, a11.g) - z) / tol) + 1e-4;
    float ao = dot(vec4(a00.r, a10.r, a01.r, a11.r), w) / (w.x + w.y + w.z + w.w);
    c *= mix(1.0, ao, uAOK); }
#endif
#ifdef BLOOM
  c += texture2D(tBloom, vUv).rgb * uBloomK;
#endif
  c = gxGrade(neutral(c * uExp));
  c = toSRGB(clamp(c, 0.0, 1.0));
  c += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  gl_FragColor = vec4(c, 1.0);
}`;

  // ------------------------------ setting up ------------------------------
  function mk(fs, uniforms, defines) { return new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: fs, uniforms, defines: defines || {}, depthTest: false, depthWrite: false, toneMapped: false }); }
  P3.init = function (three, realm) {
    THREE = three; R3 = realm; ren = realm.renderer();
    // (the picture of linear light needs a graphics card that can draw into numbers past one)
    if (!ren.capabilities.isWebGL2 || !(ren.extensions.has('EXT_color_buffer_float') || ren.extensions.has('EXT_color_buffer_half_float'))) { P3.failed = 'sem imagem de ponto flutuante'; return; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
    qcam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const view = () => ({ tDepth: { value: null }, uProj: { value: new THREE.Vector4(1, 1, 0, 0) }, uNF: { value: new THREE.Vector2(0.1, 1600) } });
    M = {
      ao: null, aoU: Object.assign(view(), { uTexel: { value: new THREE.Vector2() }, uR: { value: 1.1 }, uScale: { value: 500 }, uFar: { value: 120 } }),
      blur: mk(BLURFS, { tAO: { value: null }, uDir: { value: new THREE.Vector2() } }),
      pre: mk(PREFS, { tSrc: { value: null }, uTexel: { value: new THREE.Vector2() }, uExp: { value: 1 }, uTh: { value: 1.1 } }),
      down: mk(DOWNFS, { tSrc: { value: null }, uTexel: { value: new THREE.Vector2() } }),
      up: mk(UPFS, { tSrc: { value: null }, uTexel: { value: new THREE.Vector2() }, uK: { value: 1 } }),
      comp: null, compU: Object.assign(view(), { tScene: { value: null }, tAOt: { value: null }, tBloom: { value: null }, uAOTexel: { value: new THREE.Vector2() }, uAOK: { value: 0.85 }, uBloomK: { value: 0.12 }, uExp: { value: 1 } }),
    };
    M.up.blending = THREE.AdditiveBlending; M.up.transparent = true;
    quad = new THREE.Mesh(g, M.blur); quad.frustumCulled = false;
    P3.quality(R3.Q());
  };
  // (the shaders that depend on the quality: the samples of the shade, which passes the last one mixes)
  function shaders() {
    if (M.ao) M.ao.dispose(); if (M.comp) M.comp.dispose();
    M.ao = mk(AOFS, M.aoU, { NS: want.ao >= 2 ? 12 : 8 });
    const d = {}; if (want.ao) d.AO = 1; if (want.bloom) d.BLOOM = 1; M.comp = mk(COMPFS(), M.compU, d);
  }
  P3.quality = function (q) {
    if (!M) return; const nw = { ao: q.ao | 0, bloom: q.bloom | 0 };
    const changed = nw.ao !== want.ao || nw.bloom !== want.bloom; want = nw;
    P3.on = !P3.failed && (want.ao > 0 || want.bloom > 0);
    if (!P3.on) { free(); return; }
    if (changed || !M.comp) { shaders(); size = [0, 0]; }
    P3.resize();
  };
  function free() { for (const r of [rtS, rtA, rtB, ...BL]) if (r) r.dispose(); rtS = rtA = rtB = null; BL = []; size = [0, 0]; }
  P3.release = free;
  P3.resize = function () {
    if (!P3.on || !ren) return; const v = ren.getDrawingBufferSize(new THREE.Vector2()); const w = Math.max(1, v.x | 0), h = Math.max(1, v.y | 0);
    if (w === size[0] && h === size[1] && rtS) return; free(); size = [w, h];
    const HF = THREE.HalfFloatType;
    rtS = new THREE.WebGLRenderTarget(w, h, { type: HF, samples: 4, depthBuffer: true, depthTexture: new THREE.DepthTexture(w, h, THREE.UnsignedIntType), minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
    if (want.ao) {
      // (the shade at half the picture's size, or the whole of it at the finest quality)
      const k = want.ao >= 2 ? 1 : 2; const aw = Math.max(1, Math.ceil(w / k)), ah = Math.max(1, Math.ceil(h / k));
      for (const n of ['A', 'B']) { const r = new THREE.WebGLRenderTarget(aw, ah, { type: HF, depthBuffer: false, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter }); if (n === 'A') rtA = r; else rtB = r; }
    }
    if (want.bloom) { let bw = w, bh = h; for (let k = 0; k < NB; k++) { bw = Math.max(1, bw >> 1); bh = Math.max(1, bh >> 1); BL.push(new THREE.WebGLRenderTarget(bw, bh, { type: HF, depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter })); } }
  };
  function pass(mat, target) { quad.material = mat; ren.setRenderTarget(target); ren.render(quad, qcam); P3.passes++; }
  // the frame through the passes (false: not on — the picture goes straight to the screen)
  P3.render = function (scene, camera) {
    if (!P3.on || !rtS) return false;
    const t0 = performance.now(); P3.passes = 0;
    const info = ren.info; info.autoReset = false; info.reset();
    const prevT = ren.getRenderTarget(); const ac = ren.autoClear;
    try {
      ren.setRenderTarget(rtS); ren.render(scene, camera); P3.sceneCalls = info.render.calls; P3.sceneTris = info.render.triangles;
      const pm = camera.projectionMatrix.elements; const proj = [pm[0], pm[5], pm[8], pm[9]];
      for (const U of [M.aoU, M.compU]) { U.tDepth.value = rtS.depthTexture; U.uProj.value.set(proj[0], proj[1], proj[2], proj[3]); U.uNF.value.set(camera.near, camera.far); }
      const exp = ren.toneMappingExposure;
      if (want.ao && rtA) {
        const aw = rtA.width, ah = rtA.height;
        M.aoU.uTexel.value.set(1 / aw, 1 / ah); M.aoU.uScale.value = proj[1] * ah * 0.5; M.aoU.uR.value = want.ao >= 2 ? 1.2 : 1.1; M.aoU.uFar.value = 110;
        pass(M.ao, rtA);
        M.blur.uniforms.tAO.value = rtA.texture; M.blur.uniforms.uDir.value.set(1 / aw, 0); pass(M.blur, rtB);
        M.blur.uniforms.tAO.value = rtB.texture; M.blur.uniforms.uDir.value.set(0, 1 / ah); pass(M.blur, rtA);
        M.compU.tAOt.value = rtA.texture; M.compU.uAOTexel.value.set(1 / aw, 1 / ah);
      }
      if (want.bloom && BL.length) {
        M.pre.uniforms.tSrc.value = rtS.texture; M.pre.uniforms.uTexel.value.set(0.5 / size[0], 0.5 / size[1]); M.pre.uniforms.uExp.value = exp; pass(M.pre, BL[0]);
        for (let k = 1; k < BL.length; k++) { M.down.uniforms.tSrc.value = BL[k - 1].texture; M.down.uniforms.uTexel.value.set(1 / BL[k - 1].width, 1 / BL[k - 1].height); pass(M.down, BL[k]); }
        ren.autoClear = false;
        for (let k = BL.length - 1; k > 0; k--) { M.up.uniforms.tSrc.value = BL[k].texture; M.up.uniforms.uTexel.value.set(1 / BL[k].width, 1 / BL[k].height); M.up.uniforms.uK.value = 0.85; pass(M.up, BL[k - 1]); }
        ren.autoClear = ac;
        M.compU.tBloom.value = BL[0].texture;
      }
      M.compU.tScene.value = rtS.texture; M.compU.uExp.value = exp;
      pass(M.comp, prevT);
    } finally { ren.autoClear = ac; info.autoReset = true; ren.setRenderTarget(prevT); }
    P3.ms = performance.now() - t0;
    return true;
  };
  // (for the verifier: the passes and their pictures as the quality wants them, and nothing that is not a number)
  P3.check = function () {
    const out = []; if (!M || P3.failed) return out; const q = R3.Q();
    if (P3.on !== (q.ao > 0 || q.bloom > 0)) out.push(`pós-processamento ${P3.on ? 'ligado' : 'desligado'} numa qualidade que ${P3.on ? 'não' : ''} o pede`);
    if (P3.on && rtS) { const v = ren.getDrawingBufferSize(new THREE.Vector2()); if (rtS.width !== v.x || rtS.height !== v.y) out.push(`imagem do pós ${rtS.width}×${rtS.height}, a tela ${v.x}×${v.y}`); if (want.ao && !rtA) out.push('sombra de contato sem imagem'); if (want.bloom && BL.length !== NB) out.push(`brilho com ${BL.length} degraus`); }
    for (const k of ['uExp', 'uAOK', 'uBloomK']) if (!Number.isFinite(M.compU[k].value)) out.push(`pós: ${k} não é número`);
    return out;
  };
  // (what it holds: for the measures)
  P3.info = () => ({ on: P3.on, failed: P3.failed, ao: want.ao, bloom: want.bloom, size: size.slice(), targets: [rtS, rtA, rtB, ...BL].filter(Boolean).length, passes: P3.passes, sceneCalls: P3.sceneCalls || 0, ms: +P3.ms.toFixed(1) });
})(window.G);
