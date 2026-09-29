// Mundo: seções reconstruíveis, colisores 2D, interações, luzes, zonas e grafo de navegação.
import * as THREE from 'three';
import { defaultVis } from './layers.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export class World {
  constructor(scene) {
    this.scene = scene;
    this.sections = new Map();
    this.cur = null;
    this.colliders = [];
    this.interactables = [];
    this.meshToInteract = new Map();
    this.fixtures = [];
    this.zones = [];
    this.floors = [];
    this.hides = [];
    this.doors = new Map();
    this.updaters = [];
    this.navNodes = new Map();
    this.navEdges = [];
    this.photoTargets = [];
    this.objects = new Map(); // id -> Object3D (referências nomeadas)
  }

  begin(id) {
    if (this.sections.has(id)) this.remove(id);
    const s = {
      id, group: new THREE.Group(), colliders: [], interactables: [], fixtures: [], zones: [], floors: [],
      hides: [], doors: [], updaters: [], navNodes: [], navEdges: [], photoTargets: [], objects: [],
    };
    s.group.name = 'section:' + id;
    this.scene.add(s.group);
    this.sections.set(id, s);
    this.cur = s;
    return s.group;
  }

  end() {
    const s = this.cur;
    defaultVis(s.group);
    if (this.bake !== false) this.bakeStatic(s);
    this.cur = null;
    this.refresh();
    return s;
  }

  // junta malhas estáticas por material (menos chamadas de desenho)
  bakeStatic(s) {
    const protectedSet = new Set();
    const addObj = (v, depth = 0) => {
      if (!v || depth > 2) return;
      if (v.isObject3D) { protectedSet.add(v); return; }
      if (Array.isArray(v)) { v.forEach((x) => addObj(x, depth + 1)); return; }
      if (typeof v === 'object') for (const k of Object.keys(v)) { const x = v[k]; if (x && (x.isObject3D || Array.isArray(x) || (typeof x === 'object' && depth < 1))) addObj(x, depth + 1); }
    };
    for (const it of s.interactables) { protectedSet.add(it.obj); for (const m of it.meshes) protectedSet.add(m); }
    for (const name of s.objects) addObj(this.objects.get(name));
    for (const d of s.doors) addObj(d.pivot);
    const isProtected = (o) => {
      let p = o;
      while (p && p !== s.group) { if (protectedSet.has(p) || p.userData.dynamic || p.isMirror) return true; p = p.parent; }
      return false;
    };
    s.group.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(s.group.matrixWorld).invert();
    const buckets = new Map();
    const victims = [];
    s.group.traverse((o) => {
      if (!o.isMesh || !o.visible || isProtected(o) || o.isSkinnedMesh || o.isInstancedMesh) return;
      const g0 = o.geometry;
      if (!g0 || !g0.attributes.position || !g0.attributes.normal || !g0.attributes.uv) return;
      let hidden = false; let p = o.parent; while (p && p !== s.group) { if (!p.visible) { hidden = true; break; } p = p.parent; }
      if (hidden) return;
      const mat = new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld);
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      const groups = Array.isArray(o.material) && g0.groups.length ? g0.groups : [{ start: 0, count: g0.index ? g0.index.count : g0.attributes.position.count, materialIndex: 0 }];
      for (const gr of groups) {
        const m = mats[gr.materialIndex];
        if (!m || m.visible === false) continue;
        const key = m.uuid + '|' + o.layers.mask + '|' + (o.castShadow ? 1 : 0) + (o.receiveShadow ? 1 : 0);
        let sub;
        if (Array.isArray(o.material)) {
          sub = new THREE.BufferGeometry();
          const idx = g0.index.array.slice(gr.start, gr.start + gr.count);
          sub.setAttribute('position', g0.attributes.position.clone());
          sub.setAttribute('normal', g0.attributes.normal.clone());
          sub.setAttribute('uv', g0.attributes.uv.clone());
          sub.setIndex(new THREE.BufferAttribute(new Uint32Array(idx), 1));
        } else {
          sub = new THREE.BufferGeometry();
          sub.setAttribute('position', g0.attributes.position.clone());
          sub.setAttribute('normal', g0.attributes.normal.clone());
          sub.setAttribute('uv', g0.attributes.uv.clone());
          if (g0.index) sub.setIndex(new THREE.BufferAttribute(new Uint32Array(g0.index.array), 1));
          else { const n = g0.attributes.position.count; const ia = new Uint32Array(n); for (let i = 0; i < n; i++) ia[i] = i; sub.setIndex(new THREE.BufferAttribute(ia, 1)); }
        }
        sub.applyMatrix4(mat);
        if (!buckets.has(key)) buckets.set(key, { m, layers: o.layers.mask, cast: o.castShadow, recv: o.receiveShadow, geos: [], vis: o.userData.vis });
        buckets.get(key).geos.push(sub);
      }
      victims.push(o);
    });
    // móveis interativos estáticos: junta as malhas dentro do próprio grupo
    const named = new Set();
    const addNamed = (v, depth = 0) => {
      if (!v || depth > 2) return;
      if (v.isObject3D) { named.add(v); return; }
      if (Array.isArray(v)) { v.forEach((x) => addNamed(x, depth + 1)); return; }
      if (typeof v === 'object') for (const k of Object.keys(v)) addNamed(v[k], depth + 1);
    };
    for (const name of s.objects) addNamed(this.objects.get(name));
    for (const it of s.interactables) {
      const root = it.obj;
      if (!root || named.has(root) || root.userData.dynamic || it.kind === 'door' || it.kind === 'drawer' || it.kind === 'leaf' || it.kind === 'pickup') continue;
      let skip = false; let p = root.parent; while (p && p !== s.group) { if (named.has(p) || p.userData.dynamic) { skip = true; break; } p = p.parent; }
      if (skip || !root.isGroup) continue;
      root.updateMatrixWorld(true);
      const rinv = new THREE.Matrix4().copy(root.matrixWorld).invert();
      const b2 = new Map(); const v2 = [];
      root.traverse((o) => {
        if (!o.isMesh || o === root || !o.visible || o.isMirror || Array.isArray(o.material)) return;
        let q = o.parent, bad = false; while (q && q !== root) { if (named.has(q) || q.userData.dynamic || !q.visible) { bad = true; break; } q = q.parent; }
        if (bad || named.has(o)) return;
        const g0 = o.geometry; if (!g0.attributes.uv || !g0.attributes.normal) return;
        const sub = new THREE.BufferGeometry();
        sub.setAttribute('position', g0.attributes.position.clone()); sub.setAttribute('normal', g0.attributes.normal.clone()); sub.setAttribute('uv', g0.attributes.uv.clone());
        if (g0.index) sub.setIndex(new THREE.BufferAttribute(new Uint32Array(g0.index.array), 1));
        else { const n = g0.attributes.position.count; const ia = new Uint32Array(n); for (let i = 0; i < n; i++) ia[i] = i; sub.setIndex(new THREE.BufferAttribute(ia, 1)); }
        sub.applyMatrix4(new THREE.Matrix4().multiplyMatrices(rinv, o.matrixWorld));
        const key = o.material.uuid + '|' + o.layers.mask + '|' + (o.castShadow ? 1 : 0);
        if (!b2.has(key)) b2.set(key, { m: o.material, mask: o.layers.mask, cast: o.castShadow, geos: [], vis: o.userData.vis });
        b2.get(key).geos.push(sub); v2.push(o);
      });
      if (v2.length < 3) { b2.forEach((b) => b.geos.forEach((gg) => gg.dispose())); continue; }
      v2.forEach((o) => o.parent.remove(o));
      const newMeshes = [];
      for (const b of b2.values()) {
        const merged = mergeGeometries(b.geos, false); b.geos.forEach((gg) => gg.dispose());
        if (!merged) continue;
        const mesh = new THREE.Mesh(merged, b.m);
        mesh.layers.mask = b.mask; mesh.userData.vis = b.vis; mesh.castShadow = b.cast; mesh.receiveShadow = true;
        root.add(mesh); newMeshes.push(mesh);
      }
      it.meshes = it.meshes.filter((m) => !v2.includes(m)).concat(newMeshes);
    }
    if (!victims.length) return;
    for (const v of victims) { v.parent.remove(v); }
    for (const b of buckets.values()) {
      const merged = mergeGeometries(b.geos, false);
      b.geos.forEach((gg) => gg.dispose());
      if (!merged) continue;
      const mesh = new THREE.Mesh(merged, b.m);
      mesh.layers.mask = b.layers;
      mesh.userData.vis = b.vis || 'baked';
      mesh.castShadow = b.cast; mesh.receiveShadow = b.recv;
      mesh.matrixAutoUpdate = false;
      mesh.name = 'baked';
      s.group.add(mesh);
    }
  }

  remove(id) {
    const s = this.sections.get(id);
    if (!s) return;
    s.group.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.isMirror && o.rt) o.rt.dispose();
    });
    this.scene.remove(s.group);
    for (const d of s.doors) this.doors.delete(d.id);
    for (const o of s.objects) this.objects.delete(o);
    this.sections.delete(id);
    this.refresh();
  }

  has(id) { return this.sections.has(id); }

  // adiciona coisas a uma seção já construída
  addTo(id, fn) {
    const s = this.sections.get(id);
    if (!s) return null;
    const prev = this.cur;
    this.cur = s;
    const r = fn(s.group);
    defaultVis(s.group);
    this.cur = prev;
    this.refresh();
    return r;
  }

  refresh() {
    const all = (k) => [].concat(...[...this.sections.values()].map((s) => s[k]));
    this.colliders = all('colliders');
    this.interactables = all('interactables');
    this.fixtures = all('fixtures');
    this.zones = all('zones');
    this.floors = all('floors');
    this.hides = all('hides');
    this.updaters = all('updaters');
    this.photoTargets = all('photoTargets');
    this.meshToInteract.clear();
    for (const it of this.interactables) for (const m of it.meshes) if (!this.meshToInteract.has(m)) this.meshToInteract.set(m, it);
    for (const it of this.interactables) if (!this.meshToInteract.has(it.obj)) this.meshToInteract.set(it.obj, it);
    this.navNodes.clear();
    for (const s of this.sections.values()) for (const n of s.navNodes) this.navNodes.set(n.id, n);
    this.navEdges = all('navEdges').filter((e) => this.navNodes.has(e.a) && this.navNodes.has(e.b));
    this._adj = null;
  }

  // ------------------------------------------------------------ registro
  name(id, obj) { this.objects.set(id, obj); if (this.cur) this.cur.objects.push(id); return obj; }
  get(id) { return this.objects.get(id); }

  collider(minX, maxX, minZ, maxZ, opts = {}) {
    const c = { minX: Math.min(minX, maxX), maxX: Math.max(minX, maxX), minZ: Math.min(minZ, maxZ), maxZ: Math.max(minZ, maxZ), enabled: true, los: opts.los !== false, id: opts.id || null, tag: opts.tag || null, entity: opts.entity !== false };
    this.cur.colliders.push(c);
    return c;
  }
  // colisor a partir de um centro/tamanho
  colliderC(x, z, w, d, opts) { return this.collider(x - w / 2, x + w / 2, z - d / 2, z + d / 2, opts); }

  interact(obj, def) {
    const meshes = [];
    obj.traverse((o) => { if (o.isMesh) meshes.push(o); });
    for (const ex of def.extra || []) ex.traverse((o) => { if (o.isMesh) meshes.push(o); });
    const it = { dist: 2.3, enabled: true, ...def, obj, meshes };
    this.cur.interactables.push(it);
    return it;
  }

  fixture(x, y, z, opts = {}) {
    const f = { x, y, z, color: new THREE.Color(opts.color || 0xfff1dc), intensity: opts.intensity === undefined ? 6 : opts.intensity, dist: opts.dist || 7, on: opts.on !== false, flicker: 0, id: opts.id || null, room: opts.room || null, bulb: opts.bulb || null, level: 0, priority: opts.priority || 0 };
    this.cur.fixtures.push(f);
    return f;
  }

  zone(id, minX, maxX, minZ, maxZ, extra = {}) {
    const z = { id, minX: Math.min(minX, maxX), maxX: Math.max(minX, maxX), minZ: Math.min(minZ, maxZ), maxZ: Math.max(minZ, maxZ), ...extra };
    this.cur.zones.push(z);
    return z;
  }

  floor(minX, maxX, minZ, maxZ, surface, heightFn = null, room = null) {
    const f = { minX: Math.min(minX, maxX), maxX: Math.max(minX, maxX), minZ: Math.min(minZ, maxZ), maxZ: Math.max(minZ, maxZ), surface, heightFn, room };
    this.cur.floors.push(f);
    return f;
  }

  hide(def) { this.cur.hides.push(def); return def; }
  door(d) { this.cur.doors.push(d); this.doors.set(d.id, d); return d; }
  update(fn) { this.cur.updaters.push(fn); return fn; }
  photo(def) { this.cur.photoTargets.push(def); return def; }

  nav(id, x, z, room) { const n = { id, x, z, room }; this.cur.navNodes.push(n); return n; }
  link(a, b, door = null) { this.cur.navEdges.push({ a, b, door }); }

  // ------------------------------------------------------------ consultas
  floorAt(x, z) {
    let best = null;
    for (const f of this.floors) if (x >= f.minX && x <= f.maxX && z >= f.minZ && z <= f.maxZ) best = f;
    return best;
  }
  heightAt(x, z) {
    const f = this.floorAt(x, z);
    if (!f) return 0;
    return f.heightFn ? f.heightFn(x, z) : 0;
  }
  roomAt(x, z) { const f = this.floorAt(x, z); return f ? f.room : null; }

  zonesAt(x, z) {
    const out = [];
    for (const zz of this.zones) if (x >= zz.minX && x <= zz.maxX && z >= zz.minZ && z <= zz.maxZ) out.push(zz.id);
    return out;
  }
  inZone(id, x, z) {
    for (const zz of this.zones) if (zz.id === id && x >= zz.minX && x <= zz.maxX && z >= zz.minZ && z <= zz.maxZ) return true;
    return false;
  }

  // empurra um círculo para fora dos colisores
  resolve(pos, r, filter = null) {
    for (let iter = 0; iter < 3; iter++) {
      let moved = false;
      for (const c of this.colliders) {
        if (!c.enabled) continue;
        if (filter && !filter(c)) continue;
        const cx = Math.max(c.minX, Math.min(pos.x, c.maxX));
        const cz = Math.max(c.minZ, Math.min(pos.z, c.maxZ));
        const dx = pos.x - cx, dz = pos.z - cz;
        const d2 = dx * dx + dz * dz;
        if (d2 < r * r) {
          if (d2 > 1e-8) {
            const d = Math.sqrt(d2);
            pos.x += (dx / d) * (r - d);
            pos.z += (dz / d) * (r - d);
          } else {
            // centro dentro da caixa: sai pelo lado mais próximo
            const l = pos.x - c.minX, rr = c.maxX - pos.x, t = pos.z - c.minZ, b = c.maxZ - pos.z;
            const m = Math.min(l, rr, t, b);
            if (m === l) pos.x = c.minX - r; else if (m === rr) pos.x = c.maxX + r; else if (m === t) pos.z = c.minZ - r; else pos.z = c.maxZ + r;
          }
          moved = true;
        }
      }
      if (!moved) break;
    }
  }

  // linha de visão 2D (paredes e portas fechadas bloqueiam)
  losBlocked(ax, az, bx, bz, ignoreDoors = false) {
    const dx = bx - ax, dz = bz - az;
    for (const c of this.colliders) {
      if (!c.enabled || !c.los) continue;
      if (ignoreDoors && c.tag === 'door') continue;
      let tmin = 0, tmax = 1;
      if (Math.abs(dx) < 1e-9) { if (ax < c.minX || ax > c.maxX) continue; }
      else {
        let t1 = (c.minX - ax) / dx, t2 = (c.maxX - ax) / dx;
        if (t1 > t2) [t1, t2] = [t2, t1];
        tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2);
        if (tmin > tmax) continue;
      }
      if (Math.abs(dz) < 1e-9) { if (az < c.minZ || az > c.maxZ) continue; }
      else {
        let t1 = (c.minZ - az) / dz, t2 = (c.maxZ - az) / dz;
        if (t1 > t2) [t1, t2] = [t2, t1];
        tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2);
        if (tmin > tmax) continue;
      }
      return true;
    }
    return false;
  }

  // ------------------------------------------------------------ navegação (A*)
  adj() {
    if (this._adj) return this._adj;
    const m = new Map();
    for (const n of this.navNodes.keys()) m.set(n, []);
    for (const e of this.navEdges) { m.get(e.a).push({ to: e.b, door: e.door }); m.get(e.b).push({ to: e.a, door: e.door }); }
    this._adj = m;
    return m;
  }
  nearestNode(x, z, needLos = true) {
    let best = null, bd = Infinity;
    for (const n of this.navNodes.values()) {
      const d = Math.hypot(n.x - x, n.z - z);
      if (d < bd && (!needLos || !this.losBlocked(x, z, n.x, n.z, true))) { bd = d; best = n; }
    }
    if (!best && needLos) return this.nearestNode(x, z, false);
    return best;
  }
  path(fromId, toId, canPass) {
    const adj = this.adj();
    if (!adj.has(fromId) || !adj.has(toId)) return null;
    const open = new Set([fromId]);
    const g = new Map([[fromId, 0]]);
    const f = new Map();
    const came = new Map();
    const hN = (id) => { const a = this.navNodes.get(id), b = this.navNodes.get(toId); return Math.hypot(a.x - b.x, a.z - b.z); };
    f.set(fromId, hN(fromId));
    while (open.size) {
      let cur = null, cf = Infinity;
      for (const id of open) { const v = f.get(id); if (v < cf) { cf = v; cur = id; } }
      if (cur === toId) {
        const out = [cur];
        while (came.has(cur)) { cur = came.get(cur); out.unshift(cur); }
        return out.map((id) => this.navNodes.get(id));
      }
      open.delete(cur);
      for (const e of adj.get(cur)) {
        if (canPass && !canPass(e)) continue;
        const a = this.navNodes.get(cur), b = this.navNodes.get(e.to);
        const ng = g.get(cur) + Math.hypot(a.x - b.x, a.z - b.z);
        if (ng < (g.has(e.to) ? g.get(e.to) : Infinity)) {
          came.set(e.to, cur); g.set(e.to, ng); f.set(e.to, ng + hN(e.to)); open.add(e.to);
        }
      }
    }
    return null;
  }
}
