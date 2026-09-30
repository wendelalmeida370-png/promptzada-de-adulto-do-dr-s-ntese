// Poeira no ar. Os grãos só aparecem de verdade dentro do facho da lanterna do celular,
// como em casa de verdade de madrugada. Uma caixa de 7 m acompanha a câmera (os grãos "dão a volta").
import * as THREE from 'three';
import { vis } from './layers.js';

const vert = /* glsl */ `
uniform float time, spotCos, spotOn, size, ambient;
uniform vec3 camPos, spotPos, spotDir;
attribute float seed;
varying float vA;
void main(){
  vec3 box = vec3(7.0, 3.4, 7.0);
  vec3 p = position;
  p.x += sin(time * 0.11 + seed * 6.283) * 0.35 + time * 0.011;
  p.y += sin(time * 0.07 + seed * 12.9) * 0.22 - time * 0.005;
  p.z += cos(time * 0.09 + seed * 3.1) * 0.35;
  vec3 rel = mod(p - camPos + box * 0.5, box) - box * 0.5;
  vec3 wp = camPos + rel;
  vec3 toP = wp - spotPos;
  float d = length(toP);
  float cone = smoothstep(spotCos, mix(spotCos, 1.0, 0.6), dot(toP / max(d, 1e-3), spotDir));
  float fall = smoothstep(0.25, 0.8, d) * (1.0 - smoothstep(2.2, 6.0, d));
  vec4 mv = viewMatrix * vec4(wp, 1.0);
  vA = (spotOn * cone * fall + ambient) * smoothstep(0.15, 0.45, -mv.z) * (0.45 + 0.55 * fract(seed * 7.13));
  gl_Position = projectionMatrix * mv;
  gl_PointSize = size * (0.6 + fract(seed * 3.7) * 0.9) / max(0.25, -mv.z);
}`;
const frag = /* glsl */ `
uniform vec3 color;
varying float vA;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float a = smoothstep(0.5, 0.0, length(c));
  gl_FragColor = vec4(color * a * a * vA, 1.0);
}`;

export class Dust {
  constructor(scene, n = 900) {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(n * 3), seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = Math.random() * 7; pos[i * 3 + 1] = Math.random() * 3.4; pos[i * 3 + 2] = Math.random() * 7;
      seed[i] = Math.random();
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
    this.uniforms = {
      time: { value: 0 }, spotCos: { value: 0.87 }, spotOn: { value: 0 }, size: { value: 6 }, ambient: { value: 0 },
      camPos: { value: new THREE.Vector3() }, spotPos: { value: new THREE.Vector3() }, spotDir: { value: new THREE.Vector3(0, 0, -1) },
      color: { value: new THREE.Color(0.95, 0.9, 0.8) },
    };
    this.points = new THREE.Points(g, new THREE.ShaderMaterial({
      uniforms: this.uniforms, vertexShader: vert, fragmentShader: frag,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    this.points.frustumCulled = false;
    this.points.renderOrder = 3;
    vis(this.points, 'e');
    scene.add(this.points);
    this.enabled = true;
  }
  update(dt, camera, phone, pixelScale = 1) {
    const u = this.uniforms;
    this.points.visible = this.enabled;
    if (!this.enabled) return;
    u.time.value += dt;
    u.camPos.value.copy(camera.position);
    const s = phone.spot;
    u.spotPos.value.copy(s.position);
    u.spotDir.value.copy(phone.spotTarget.position).sub(s.position).normalize();
    u.spotCos.value = Math.cos(s.angle);
    u.spotOn.value = Math.min(1, s.intensity / 22) * 0.8;
    u.size.value = 7 * pixelScale;
  }
}
