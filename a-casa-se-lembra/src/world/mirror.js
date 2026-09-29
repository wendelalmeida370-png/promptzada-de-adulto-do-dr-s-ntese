// Espelho plano (baseado no Reflector do three.js) que enxerga a camada MIRROR:
// a "memória da casa". Protegido contra recursão entre espelhos.
import * as THREE from 'three';
import { L } from './layers.js';

let rendering = false;
let occluded = null;
export function setMirrorOcclusion(fn) { occluded = fn; }

const shader = {
  uniforms: {
    tDiffuse: { value: null },
    textureMatrix: { value: null },
    tint: { value: new THREE.Color(1, 1, 1) },
    strength: { value: 1 },
    time: { value: 0 },
    fog: { value: 0 },
  },
  vertexShader: /* glsl */ `
    uniform mat4 textureMatrix;
    varying vec4 vUv;
    varying vec2 vUv2;
    void main() {
      vUv = textureMatrix * vec4(position, 1.0);
      vUv2 = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform vec3 tint;
    uniform float strength, time, fog;
    varying vec4 vUv;
    varying vec2 vUv2;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    void main() {
      vec4 base = texture2DProj(tDiffuse, vUv);
      vec3 c = base.rgb * tint * strength;
      // embaçado (vapor)
      float n = hash(floor(vUv2 * 90.0));
      c = mix(c, vec3(0.55, 0.58, 0.6) * (0.8 + 0.2 * n), fog);
      // manchas nas bordas
      float e = smoothstep(0.0, 0.08, vUv2.x) * smoothstep(1.0, 0.92, vUv2.x) * smoothstep(0.0, 0.08, vUv2.y) * smoothstep(1.0, 0.92, vUv2.y);
      c *= mix(0.7, 1.0, e);
      gl_FragColor = vec4(c, 1.0);
    }`,
};

export class Mirror extends THREE.Mesh {
  constructor(w, h, opts = {}) {
    super(new THREE.PlaneGeometry(w, h));
    this.isMirror = true;
    const res = opts.res || 512;
    const aspect = w / h;
    this.rt = new THREE.WebGLRenderTarget(Math.round(aspect >= 1 ? res : res * aspect), Math.round(aspect >= 1 ? res / aspect : res), { type: THREE.HalfFloatType, samples: 0 });
    this.textureMatrix = new THREE.Matrix4();
    this.material = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(shader.uniforms),
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
    });
    this.material.uniforms.tDiffuse.value = this.rt.texture;
    this.material.uniforms.textureMatrix.value = this.textureMatrix;
    if (opts.tint) this.material.uniforms.tint.value.set(opts.tint);
    this.material.uniforms.strength.value = opts.strength === undefined ? 0.92 : opts.strength;
    this.camLayers = opts.layers || [L.MIRROR];
    this.maxDist = opts.maxDist || 9;
    this.enabled = true;
    this.virtualCam = new THREE.PerspectiveCamera();
    this.virtualCam.layers.disableAll();
    for (const l of this.camLayers) this.virtualCam.layers.enable(l);
    this._tmp = {
      plane: new THREE.Plane(), normal: new THREE.Vector3(), rpos: new THREE.Vector3(), cpos: new THREE.Vector3(),
      rot: new THREE.Matrix4(), look: new THREE.Vector3(), clip: new THREE.Vector4(), view: new THREE.Vector3(), target: new THREE.Vector3(), q: new THREE.Vector4(),
    };
    this.onBeforeRender = (renderer, scene, camera) => this._renderReflection(renderer, scene, camera);
  }

  set fog(v) { this.material.uniforms.fog.value = v; }
  get fog() { return this.material.uniforms.fog.value; }

  _renderReflection(renderer, scene, camera) {
    if (rendering || !this.enabled) return;
    const t = this._tmp;
    t.rpos.setFromMatrixPosition(this.matrixWorld);
    t.cpos.setFromMatrixPosition(camera.matrixWorld);
    if (t.rpos.distanceTo(t.cpos) > this.maxDist) return;
    t.rot.extractRotation(this.matrixWorld);
    t.normal.set(0, 0, 1).applyMatrix4(t.rot);
    t.view.subVectors(t.rpos, t.cpos);
    if (t.view.dot(t.normal) > 0) return;
    if (occluded && occluded(t.cpos.x, t.cpos.z, t.rpos.x + t.normal.x * 0.2, t.rpos.z + t.normal.z * 0.2)) return;
    t.view.reflect(t.normal).negate().add(t.rpos);
    t.rot.extractRotation(camera.matrixWorld);
    t.look.set(0, 0, -1).applyMatrix4(t.rot).add(t.cpos);
    t.target.subVectors(t.rpos, t.look).reflect(t.normal).negate().add(t.rpos);
    const vc = this.virtualCam;
    vc.position.copy(t.view);
    vc.up.set(0, 1, 0).applyMatrix4(t.rot).reflect(t.normal);
    vc.lookAt(t.target);
    vc.far = camera.far;
    vc.updateMatrixWorld();
    vc.projectionMatrix.copy(camera.projectionMatrix);
    this.textureMatrix.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
    this.textureMatrix.multiply(vc.projectionMatrix).multiply(vc.matrixWorldInverse).multiply(this.matrixWorld);
    t.plane.setFromNormalAndCoplanarPoint(t.normal, t.rpos).applyMatrix4(vc.matrixWorldInverse);
    t.clip.set(t.plane.normal.x, t.plane.normal.y, t.plane.normal.z, t.plane.constant);
    const pm = vc.projectionMatrix.elements;
    t.q.x = (Math.sign(t.clip.x) + pm[8]) / pm[0];
    t.q.y = (Math.sign(t.clip.y) + pm[9]) / pm[5];
    t.q.z = -1.0;
    t.q.w = (1.0 + pm[10]) / pm[14];
    t.clip.multiplyScalar(2.0 / t.clip.dot(t.q));
    pm[2] = t.clip.x; pm[6] = t.clip.y; pm[10] = t.clip.z + 1.0 - 0.003; pm[14] = t.clip.w;

    rendering = true;
    this.visible = false;
    const cur = renderer.getRenderTarget();
    const shadowAuto = renderer.shadowMap.autoUpdate;
    renderer.shadowMap.autoUpdate = false;
    renderer.setRenderTarget(this.rt);
    renderer.state.buffers.depth.setMask(true);
    renderer.clear();
    renderer.render(scene, vc);
    renderer.shadowMap.autoUpdate = shadowAuto;
    renderer.setRenderTarget(cur);
    this.visible = true;
    rendering = false;
  }
}
