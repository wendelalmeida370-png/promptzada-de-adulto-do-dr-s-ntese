// Pós-processamento: oclusão de ambiente (SAO), brilho (bloom), tone mapping, grão, vinheta,
// aberração, VHS, glitch e um leve color grading. AO e bloom desligam na qualidade "Leve".
import * as THREE from 'three';

const vert = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

// ---------------------------------------------------------------- oclusão de ambiente (só profundidade)
const aoFrag = /* glsl */ `
precision highp float;
uniform sampler2D tDepth;
uniform mat4 projInv;
uniform vec2 res;
uniform float radius, intensity, bias, projScale, aspect;
varying vec2 vUv;
float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
vec3 viewPos(vec2 uv){ float d = texture2D(tDepth, uv).x; vec4 c = vec4(uv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0); vec4 v = projInv * c; return v.xyz / v.w; }
void main(){
  float d0 = texture2D(tDepth, vUv).x;
  if (d0 >= 0.99999) { gl_FragColor = vec4(1.0); return; }
  vec3 p = viewPos(vUv);
  vec2 px = 1.0 / res;
  vec3 pr = viewPos(vUv + vec2(px.x, 0.0)), pl = viewPos(vUv - vec2(px.x, 0.0));
  vec3 pu = viewPos(vUv + vec2(0.0, px.y)), pd = viewPos(vUv - vec2(0.0, px.y));
  vec3 dx = abs(pr.z - p.z) < abs(p.z - pl.z) ? pr - p : p - pl;
  vec3 dy = abs(pu.z - p.z) < abs(p.z - pd.z) ? pu - p : p - pd;
  vec3 n = normalize(cross(dx, dy));
  float rUV = clamp(radius * projScale / max(0.05, -p.z), 3.0 * px.y, 0.18);
  float ang = hash(vUv * res) * 6.2831853;
  float ao = 0.0;
  const int N = 12;
  for (int i = 0; i < N; i++) {
    float fi = (float(i) + 0.5) / float(N);
    float a = ang + float(i) * 2.3999632;
    vec2 off = vec2(cos(a) / aspect, sin(a)) * rUV * fi;
    vec3 q = viewPos(vUv + off);
    vec3 v = q - p;
    float vv = dot(v, v);
    float vn = dot(v, n);
    float fall = max(0.0, 1.0 - vv / (radius * radius * 2.2));
    ao += max(0.0, vn - bias * -p.z) / (vv + 0.02) * fall;
  }
  ao = clamp(1.0 - intensity * ao / float(N), 0.0, 1.0);
  gl_FragColor = vec4(ao, ao, ao, 1.0);
}
`;
// desfoque que respeita as bordas (profundidade)
const aoBlurFrag = /* glsl */ `
precision highp float;
uniform sampler2D tAO; uniform sampler2D tDepth; uniform vec2 res; uniform mat4 projInv;
varying vec2 vUv;
float vz(vec2 uv){ float d = texture2D(tDepth, uv).x; vec4 c = vec4(uv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0); vec4 v = projInv * c; return v.z / v.w; }
void main(){
  float z0 = vz(vUv);
  float s = 0.0, w = 0.0;
  for (int x = -2; x <= 2; x++) for (int y = -2; y <= 2; y++) {
    vec2 uv = vUv + vec2(float(x), float(y)) / res;
    float wz = 1.0 / (0.002 + abs(vz(uv) - z0) * 6.0);
    s += texture2D(tAO, uv).r * wz; w += wz;
  }
  float a = s / w;
  gl_FragColor = vec4(a, a, a, 1.0);
}
`;

// ---------------------------------------------------------------- bloom
const brightFrag = /* glsl */ `
precision highp float;
uniform sampler2D tDiffuse; uniform vec2 res; uniform float threshold;
varying vec2 vUv;
void main(){
  vec2 o = 0.5 / res;
  vec3 c = (texture2D(tDiffuse, vUv + vec2(-o.x, -o.y)).rgb + texture2D(tDiffuse, vUv + vec2(o.x, -o.y)).rgb + texture2D(tDiffuse, vUv + vec2(-o.x, o.y)).rgb + texture2D(tDiffuse, vUv + vec2(o.x, o.y)).rgb) * 0.25;
  float l = max(c.r, max(c.g, c.b));
  float k = smoothstep(threshold, threshold * 2.2, l);
  gl_FragColor = vec4(min(c * k, vec3(8.0)), 1.0);
}
`;
const blurFrag = /* glsl */ `
precision highp float;
uniform sampler2D tSrc; uniform vec2 dir;
varying vec2 vUv;
void main(){
  vec3 c = texture2D(tSrc, vUv).rgb * 0.2270270;
  c += (texture2D(tSrc, vUv + dir * 1.3846154).rgb + texture2D(tSrc, vUv - dir * 1.3846154).rgb) * 0.3162162;
  c += (texture2D(tSrc, vUv + dir * 3.2307692).rgb + texture2D(tSrc, vUv - dir * 3.2307692).rgb) * 0.0702703;
  gl_FragColor = vec4(c, 1.0);
}
`;

// ---------------------------------------------------------------- composição final
const frag = /* glsl */ `
precision highp float;
uniform sampler2D tDiffuse;
uniform sampler2D tAO;
uniform sampler2D tBloom;
uniform float aoOn, bloomOn, bloomStrength;
uniform vec2 res;
uniform float time, exposure, grain, vignette, chroma, scan, glitch, mode, flash, redFlash, desat, blackout, warp, fisheye, bright, pulse;
uniform vec3 tint;
varying vec2 vUv;

float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
vec3 aces(vec3 x){ const float a=2.51, b=0.03, c=2.43, d=0.59, e=0.14; return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0); }

void main(){
  vec2 uv = vUv;
  vec2 cc = uv - 0.5;
  // lente de celular levemente abaulada
  if (fisheye > 0.0) { float r2 = dot(cc, cc); uv = 0.5 + cc * (1.0 - fisheye * r2); }
  // distorção de "casa mudando"
  if (warp > 0.0) {
    uv.x += sin(uv.y * 18.0 + time * 3.0) * 0.006 * warp;
    uv.y += sin(uv.x * 14.0 + time * 2.3) * 0.004 * warp;
  }
  // glitch: faixas horizontais deslocadas
  if (glitch > 0.0) {
    float band = floor(uv.y * 24.0 + floor(time * 18.0));
    float n = hash(vec2(band, floor(time * 30.0)));
    if (n < glitch * 0.5) uv.x += (hash(vec2(band, time)) - 0.5) * 0.12 * glitch;
    uv.y += (hash(vec2(floor(time*40.0), 3.0)) - 0.5) * 0.01 * glitch;
  }
  // VHS: leve tremor de linha
  if (scan > 0.0) uv.x += (hash(vec2(floor(uv.y * res.y * 0.5), floor(time * 24.0))) - 0.5) * 0.0025 * scan;

  float ca = chroma * (0.4 + length(cc));
  vec3 col;
  col.r = texture2D(tDiffuse, uv + vec2(ca, 0.0) * 0.004).r;
  col.g = texture2D(tDiffuse, uv).g;
  col.b = texture2D(tDiffuse, uv - vec2(ca, 0.0) * 0.004).b;

  // oclusão de ambiente: cantos, rodapés e o chão embaixo dos móveis ficam mais escuros
  if (aoOn > 0.5) col *= texture2D(tAO, uv).r;
  // brilho em volta das luzes fortes
  if (bloomOn > 0.5) col += texture2D(tBloom, uv).rgb * bloomStrength;

  col *= exposure;
  col = aces(col);
  col = pow(col, vec3(1.0/2.2));

  // color grading sutil: sombras um pouco mais frias, luzes um pouco mais quentes
  float lum0 = dot(col, vec3(0.3, 0.59, 0.11));
  col = mix(col, col * vec3(0.93, 0.98, 1.08), (1.0 - smoothstep(0.0, 0.45, lum0)) * 0.6);
  col = mix(col, col * vec3(1.04, 1.0, 0.94), smoothstep(0.55, 1.0, lum0) * 0.5);

  // modos da câmera do celular
  if (mode > 0.5 && mode < 1.5) { // CÂMERA
    col = mix(col, vec3(dot(col, vec3(0.3,0.59,0.11))), 0.25);
    col *= vec3(0.95, 1.02, 0.98);
    col += bright;
  } else if (mode > 1.5) { // VÍDEO (memória gravada)
    float l = dot(col, vec3(0.3,0.59,0.11));
    col = mix(col, vec3(l) * vec3(0.8, 0.95, 1.15), 0.55);
    col += bright;
  }
  float l = dot(col, vec3(0.3,0.59,0.11));
  col = mix(col, vec3(l), desat);
  col *= tint;

  // scanlines
  if (scan > 0.0) {
    col *= 1.0 - scan * 0.18 * (0.5 + 0.5 * sin(uv.y * res.y * 1.6));
    col += (hash(uv * res + time) - 0.5) * 0.06 * scan;
  }
  // grão
  col += (hash(uv * res * 0.7 + fract(time * 7.0)) - 0.5) * grain;
  // vinheta (pulsa com o coração quando o medo aperta)
  float vr = length(cc * vec2(1.1, 1.0));
  float v = smoothstep(0.85 - pulse * 0.12, 0.2, vr);
  col *= mix(1.0, v, vignette);
  col = mix(col, col * vec3(1.0, 0.72, 0.7), pulse * smoothstep(0.35, 0.85, vr) * 0.5);

  col = mix(col, vec3(1.0), flash);
  col = mix(col, vec3(0.6, 0.0, 0.0), redFlash);
  col *= 1.0 - blackout;
  // dithering: some com os "degraus" nos gradientes escuros
  col += (hash(gl_FragCoord.xy + fract(time)) - 0.5) / 255.0;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

export class Post {
  constructor(renderer) {
    this.renderer = renderer;
    const size = renderer.getDrawingBufferSize(new THREE.Vector2());
    this.rt = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: 0 });
    this.rt.depthTexture = new THREE.DepthTexture(size.x, size.y);
    this.rt.depthTexture.type = THREE.UnsignedIntType;
    const half = (v) => Math.max(1, Math.round(v / 2)), quarter = (v) => Math.max(1, Math.round(v / 4));
    this.aoRT = new THREE.WebGLRenderTarget(half(size.x), half(size.y), { depthBuffer: false });
    this.aoBlurRT = new THREE.WebGLRenderTarget(half(size.x), half(size.y), { depthBuffer: false });
    this.bloomA = new THREE.WebGLRenderTarget(quarter(size.x), quarter(size.y), { type: THREE.HalfFloatType, depthBuffer: false });
    this.bloomB = new THREE.WebGLRenderTarget(quarter(size.x), quarter(size.y), { type: THREE.HalfFloatType, depthBuffer: false });
    this.ao = true;
    this.bloom = true;
    const white = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1); white.needsUpdate = true;
    const black = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1); black.needsUpdate = true;
    this.uniforms = {
      tDiffuse: { value: this.rt.texture }, tAO: { value: white }, tBloom: { value: black },
      aoOn: { value: 0 }, bloomOn: { value: 0 }, bloomStrength: { value: 0.2 },
      res: { value: new THREE.Vector2(size.x, size.y) },
      time: { value: 0 }, exposure: { value: 1.0 }, grain: { value: 0.05 }, vignette: { value: 0.75 },
      chroma: { value: 0.6 }, scan: { value: 0 }, glitch: { value: 0 }, mode: { value: 0 }, flash: { value: 0 },
      redFlash: { value: 0 }, desat: { value: 0.1 }, blackout: { value: 0 }, warp: { value: 0 }, fisheye: { value: 0 },
      tint: { value: new THREE.Color(1, 1, 1) }, bright: { value: 0 }, pulse: { value: 0 },
    };
    const mat = (fragmentShader, uniforms) => new THREE.ShaderMaterial({ uniforms, vertexShader: vert, fragmentShader, depthTest: false, depthWrite: false });
    this.mat = mat(frag, this.uniforms);
    this.aoMat = mat(aoFrag, {
      tDepth: { value: this.rt.depthTexture }, projInv: { value: new THREE.Matrix4() }, res: { value: new THREE.Vector2(half(size.x), half(size.y)) },
      radius: { value: 0.45 }, intensity: { value: 1.1 }, bias: { value: 0.012 }, projScale: { value: 1 }, aspect: { value: 1 },
    });
    this.aoBlurMat = mat(aoBlurFrag, { tAO: { value: this.aoRT.texture }, tDepth: { value: this.rt.depthTexture }, res: { value: new THREE.Vector2(half(size.x), half(size.y)) }, projInv: this.aoMat.uniforms.projInv });
    this.brightMat = mat(brightFrag, { tDiffuse: { value: this.rt.texture }, res: { value: new THREE.Vector2(quarter(size.x), quarter(size.y)) }, threshold: { value: 1.35 } });
    this.blurMat = mat(blurFrag, { tSrc: { value: null }, dir: { value: new THREE.Vector2() } });
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.mat);
    this.quad.frustumCulled = false;
    this.scene = new THREE.Scene();
    this.scene.add(this.quad);
    this.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this._white = white; this._black = black;
  }
  setSize() {
    const size = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    const half = (v) => Math.max(1, Math.round(v / 2)), quarter = (v) => Math.max(1, Math.round(v / 4));
    this.rt.setSize(size.x, size.y);
    this.aoRT.setSize(half(size.x), half(size.y)); this.aoBlurRT.setSize(half(size.x), half(size.y));
    this.bloomA.setSize(quarter(size.x), quarter(size.y)); this.bloomB.setSize(quarter(size.x), quarter(size.y));
    this.uniforms.res.value.set(size.x, size.y);
    this.aoMat.uniforms.res.value.set(half(size.x), half(size.y));
    this.aoBlurMat.uniforms.res.value.set(half(size.x), half(size.y));
    this.brightMat.uniforms.res.value.set(quarter(size.x), quarter(size.y));
  }
  _pass(material, target) {
    this.quad.material = material;
    this.renderer.setRenderTarget(target);
    this.renderer.render(this.scene, this.cam);
  }
  render(scene, camera) {
    const r = this.renderer;
    r.setRenderTarget(this.rt);
    r.clear();
    r.render(scene, camera);
    const u = this.uniforms;
    // oclusão de ambiente
    if (this.ao) {
      const au = this.aoMat.uniforms;
      au.projInv.value.copy(camera.projectionMatrixInverse);
      au.projScale.value = camera.projectionMatrix.elements[5] * 0.5;
      au.aspect.value = camera.aspect || 1;
      this._pass(this.aoMat, this.aoRT);
      this._pass(this.aoBlurMat, this.aoBlurRT);
      u.tAO.value = this.aoBlurRT.texture; u.aoOn.value = 1;
    } else { u.tAO.value = this._white; u.aoOn.value = 0; }
    // brilho
    if (this.bloom) {
      this._pass(this.brightMat, this.bloomA);
      const bu = this.blurMat.uniforms;
      const w = this.bloomA.width, h = this.bloomA.height;
      for (let i = 0; i < 2; i++) {
        bu.tSrc.value = this.bloomA.texture; bu.dir.value.set((1 + i) / w, 0); this._pass(this.blurMat, this.bloomB);
        bu.tSrc.value = this.bloomB.texture; bu.dir.value.set(0, (1 + i) / h); this._pass(this.blurMat, this.bloomA);
      }
      u.tBloom.value = this.bloomA.texture; u.bloomOn.value = 1;
    } else { u.tBloom.value = this._black; u.bloomOn.value = 0; }
    this.quad.material = this.mat;
    r.setRenderTarget(null);
    r.render(this.scene, this.cam);
  }
}
