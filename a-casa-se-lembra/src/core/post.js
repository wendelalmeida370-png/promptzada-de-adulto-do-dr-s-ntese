// Pós-processamento: tone mapping + grão + vinheta + aberração + VHS + glitch.
import * as THREE from 'three';

const vert = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const frag = /* glsl */ `
precision highp float;
uniform sampler2D tDiffuse;
uniform vec2 res;
uniform float time, exposure, grain, vignette, chroma, scan, glitch, mode, flash, redFlash, desat, blackout, warp, fisheye, bright;
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

  col *= exposure;
  col = aces(col);
  col = pow(col, vec3(1.0/2.2));

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
  // vinheta
  float v = smoothstep(0.85, 0.2, length(cc * vec2(1.1, 1.0)));
  col *= mix(1.0, v, vignette);

  col = mix(col, vec3(1.0), flash);
  col = mix(col, vec3(0.6, 0.0, 0.0), redFlash);
  col *= 1.0 - blackout;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

export class Post {
  constructor(renderer) {
    this.renderer = renderer;
    const size = renderer.getDrawingBufferSize(new THREE.Vector2());
    this.rt = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: 0 });
    this.uniforms = {
      tDiffuse: { value: this.rt.texture },
      res: { value: new THREE.Vector2(size.x, size.y) },
      time: { value: 0 }, exposure: { value: 1.0 }, grain: { value: 0.05 }, vignette: { value: 0.75 },
      chroma: { value: 0.6 }, scan: { value: 0 }, glitch: { value: 0 }, mode: { value: 0 }, flash: { value: 0 },
      redFlash: { value: 0 }, desat: { value: 0.1 }, blackout: { value: 0 }, warp: { value: 0 }, fisheye: { value: 0 },
      tint: { value: new THREE.Color(1, 1, 1) }, bright: { value: 0 },
    };
    this.mat = new THREE.ShaderMaterial({ uniforms: this.uniforms, vertexShader: vert, fragmentShader: frag, depthTest: false, depthWrite: false });
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.mat);
    this.quad.frustumCulled = false;
    this.scene = new THREE.Scene();
    this.scene.add(this.quad);
    this.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }
  setSize() {
    const size = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    this.rt.setSize(size.x, size.y);
    this.uniforms.res.value.set(size.x, size.y);
  }
  render(scene, camera) {
    const r = this.renderer;
    r.setRenderTarget(this.rt);
    r.clear();
    r.render(scene, camera);
    r.setRenderTarget(null);
    r.render(this.scene, this.cam);
  }
}
