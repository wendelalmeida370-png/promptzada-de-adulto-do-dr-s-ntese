// caca: the hunter of visual problems — walks the body through real worlds (the ready worlds «cidade» and «metropole» and a
// new world of another seed and climate) to many places and eyes, and looks for what is wrong in the picture:
//   bash qa/navegador.sh node qa/visual/caca.js PASTA_DO_JOGO SAIDA [mundo,mundo...]   (mundos: cidade, metropole, novo, ou
//   outro mundo pronto: mega, mundial, anos100...)
//   PONTOS=12 places per world · Q=media the quality of the hunt · NOVO=tipo,tamanho,povos,clima,semente,anos,civ+civ
//   RAPIDO=1 (5 places, 2 eyes) · FOTOS=12 photos of the first place of each new problem · BASE=desempenho.json (the draw
//   calls of a reference run: more than 1.5× its most at a quality is an explosion)
// What it looks for (each with a severity S0–S4 and the owner by arte/ESTUDIO.md §3):
//   geometry, instances, bones, uniforms, lights with NaN/Infinity or thrown out of the world; buildings out of their
//   footprint, floating or sunk (Build3D.bounds, as e1); people and beasts floating, sunk or with a part loose in the air;
//   things and decoration buried; trees floating on slopes; the eye inside something solid or its lens cutting a wall; the
//   texture stack not loaded (a grey layer, a material with uTexOn off, a texture with no picture); shaders that do not
//   compile (page errors, console warnings, program diagnostics); G.modErr; draw calls exploding; the modules' own X.check();
//   the quality presets not kept; a frame black or blown out; geometry piling up; the drawing changing the world (the save
//   before and after frames with the world paused); and the world's invariants (QA.check) after it all.
// Output: SAIDA/caca.json (every problem, grouped) and SAIDA/caca.txt; photos SAIDA/caca-*.png. Exit 1 if S0–S2 found.
const path = require('path'); const fs = require('fs'); const os = require('os'); const { execSync } = require('child_process');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..')); const OUT = path.resolve(process.argv[3] || path.join(os.tmpdir(), 'caca'));
fs.mkdirSync(OUT, { recursive: true });
const { open } = require('./vistas.js');
const RAPIDO = !!process.env.RAPIDO;
const WORLDS = (process.argv[4] || 'cidade,metropole,novo').split(',').filter(Boolean);
const NPTS = +process.env.PONTOS || (RAPIDO ? 5 : 12);
const QH = process.env.Q || 'media';
const NOVO = (process.env.NOVO || 'continente,96,3,arido,7707,10,egipcio+asteca+grego').split(',');
const MAXF = +process.env.FOTOS || 12;
const BASE = process.env.BASE && fs.existsSync(process.env.BASE) ? JSON.parse(fs.readFileSync(process.env.BASE, 'utf8')) : null;
const commit = (() => { try { return execSync('git -C ' + JSON.stringify(ROOT) + ' log -1 --format=%h', { encoding: 'utf8' }).trim() + (execSync('git -C ' + JSON.stringify(ROOT) + ' status --porcelain -- js index.html', { encoding: 'utf8' }).trim() ? '+mudanças' : ''); } catch (e) { return '?'; } })();

// ------------------------------ in the page ------------------------------
function CACA() {
  if (window.__CACA) return;
  const V = window.__VIS; const P = []; const TAU = Math.PI * 2;
  const C = window.__CACA = { P };
  const add = (sev, kind, owner, msg, at) => { P.push({ sev, kind, owner, msg: String(msg).slice(0, 360), at: at || null }); };
  C.take = () => P.splice(0);
  const fin = Number.isFinite;
  const S = () => G.S;
  // (the owner of a material: the first object seen with it)
  const matWho = () => { const m = new Map(); G.Realm.scene().traverse(o => { if (o.material) for (const x of [].concat(o.material)) if (!m.has(x)) m.set(x, V.who(o)); }); return m; };
  const tileOf = (X, Z) => { const L = G.Space.TILE; const x = Math.floor(X / L), y = Math.floor(Z / L); return G.W.inb(x, y) ? y * G.N + x : -1; };
  const wet = i => { const s = S(); const T = G.T; return i >= 0 && s.type[i] <= T.RIVER && !s.road[i] && !(s.ice && s.ice[i]) && !(s.dry && s.dry[i]); };
  const where = (X, Z) => [+(X / G.Space.TILE).toFixed(1), +(Z / G.Space.TILE).toFixed(1)];

  // ---- the buildings: each body against its footprint and its ground (the rule of e1, for every building of the world)
  const PART = { farm: 1, horta: 1, plantacao: 1, vinhedo: 1, pomar: 1, cemetery: 1, apiario: 1, mercado: 1, feira: 1, mercado_negro: 1, campfire: 1, curral: 1, cercado: 1, ruin: 1 };
  C.buildings = function () {
    const L = G.Space.TILE; let n = 0; const st = b => b.style || ((G.Fac.ofSet ? G.Fac.ofSet(b.set) : null) || {}).civ || '?';
    for (const b of S().buildings.values()) {
      if (!G.Build3D || typeof G.Build3D.bounds !== 'function') { add(2, 'Build3D.bounds não existe (a prova do e1 e a caça dependem dela)', 'A2', 'contrato do ESTUDIO.md §2'); return 0; }
      let B; try { B = G.Build3D.bounds(b); } catch (e) { add(1, 'prédio: o desenho quebra', 'A2', `${b.type}#${b.id} (${st(b)}): ${e.message}`, [b.x, b.y]); continue; }
      if (!B) continue; n++;
      if (![...B.lo, ...B.hi, B.floor, ...B.ground].every(fin)) { add(1, 'prédio com número inválido no desenho', 'A2', `${b.type}#${b.id} (${st(b)})`, [b.x, b.y]); continue; }
      const cx = (b.x + b.w / 2) * L, cz = (b.y + b.h / 2) * L, mx = (B.lo[0] + B.hi[0]) / 2, mz = (B.lo[2] + B.hi[2]) / 2;
      const off = Math.hypot(mx - cx, mz - cz); const out = Math.max(b.x * L - B.lo[0], B.hi[0] - (b.x + b.w) * L, b.y * L - B.lo[2], B.hi[2] - (b.y + b.h) * L);
      const floats = B.lo[1] - B.ground[1], sunk = B.ground[0] - B.floor;
      if (b.type !== 'doca' && ((!PART[b.type] && off > 1.2) || out > 1.6)) add(2, 'prédio fora da caixa do seu terreno', 'A2', `${b.type}#${b.id} (${st(b)}, ${b.w}×${b.h}): passa ${out.toFixed(2)} m da caixa, centro a ${off.toFixed(2)} m`, [b.x, b.y]);
      if (floats > 0.35) add(2, 'prédio flutuando', 'A2', `${b.type}#${b.id} (${st(b)}): o ponto mais baixo ${floats.toFixed(2)} m acima do chão mais alto do terreno`, [b.x, b.y]);
      if (sunk > 0.05) add(2, 'prédio afundado', 'A2', `${b.type}#${b.id} (${st(b)}): o piso ${sunk.toFixed(2)} m abaixo do chão mais baixo`, [b.x, b.y]);
      if (B.hi[1] - B.floor > 80) add(3, 'prédio alto demais', 'A2', `${b.type}#${b.id} (${st(b)}): ${(B.hi[1] - B.floor).toFixed(0)} m`, [b.x, b.y]);
    }
    return n;
  };

  // ---- the texture stack: in, every layer decoded, every material reading it, every texture with its picture on the card
  C.textures = function () {
    const G3 = G.Ground3D; const r = G.Realm.renderer(); const names = Object.keys(G.TEX3D || {}); const out = { layers: names.length, ready: !!(G3.texReady && G3.texReady()) };
    if (!out.ready) add(1, 'a pilha de texturas não carregou', 'A1', `texReady() falso (${names.length} materiais em G.TEX3D)`);
    const t = G3.tex ? G3.tex() : null; const im = t && t.image;
    if (t && im && im.data) {
      const TS = im.width, D = im.depth; out.size = `${TS}×${im.height}×${D}`;
      if (names.length && D !== names.length) add(1, 'a pilha de texturas tem camadas de menos ou de mais', 'A1', `${D} camadas para ${names.length} materiais`);
      let grey = [];
      for (let k = 0; k < D; k++) { let same = 0; const n = 1024; for (let q = 0; q < n; q++) { const i = (k * TS * TS + Math.floor(G.hash(q * 7 + k * 131 + 3) * TS * TS)) * 4; if (im.data[i] === 128 && im.data[i + 1] === 128 && im.data[i + 2] === 128 && im.data[i + 3] === 128) same++; } if (same === n && names.length) grey.push(names[k] || '#' + k); }
      if (grey.length) add(1, 'camada da pilha de texturas cinza (a figura não decodificou)', 'A1', grey.join(', '));
      out.grey = grey.length;
    } else if (names.length) add(1, 'a pilha de texturas não existe', 'A1', 'G.Ground3D.tex() sem imagem');
    const who = matWho(); let mats = 0, linked = 0;
    for (const [m, w] of who) {
      const pr = r.properties.get(m); if (!pr.currentProgram) continue; mats++; const u = pr.uniforms || {};
      if (u.uTexOn) { linked++; if (out.ready && u.uTexOn.value !== 1) add(1, 'material não liga a pilha de texturas (uTexOn desligado)', w.owner, `${w.part}: uTexOn = ${u.uTexOn.value}`); }
      if (u.uTex3 && !(u.uTex3.value && u.uTex3.value.isTexture)) add(1, 'material sem a pilha de texturas', w.owner, `${w.part}: uTex3 vazio`);
      const texs = []; for (const k in m) if (m[k] && m[k].isTexture) texs.push([k, m[k]]); for (const k in u) if (u[k] && u[k].value && u[k].value.isTexture) texs.push([k, u[k].value]);
      for (const [k, tx] of texs) {
        if (tx.isRenderTargetTexture || tx.isDepthTexture || tx.isFramebufferTexture) continue;
        const img = tx.image; const ok = img && (Array.isArray(img) ? img.length : (img.width || (img.data && img.data.length) || img.videoWidth));
        if (!ok) add(1, 'textura sem figura', w.owner, `${w.part}.${k} (${tx.name || tx.constructor.name})`);
        else if (!r.properties.get(tx).__webglTexture && tx.version > 0) add(2, 'textura que não subiu para a placa', w.owner, `${w.part}.${k} (${tx.name || tx.constructor.name})`);
      }
    }
    out.mats = mats; out.linked = linked; return out;
  };

  // ---- the shader programs: one that did not compile (three keeps its diagnostics)
  C.programs = function () { const r = G.Realm.renderer(); const L = r.info.programs || []; for (const p of L) { const d = p.diagnostics; if (d && d.runnable === false) add(1, 'shader que não compila', '?', `${p.name || p.cacheKey && p.cacheKey.slice(0, 60)}: ${(d.programLog || '') + ' ' + ((d.fragmentShader && d.fragmentShader.log) || '') + ' ' + ((d.vertexShader && d.vertexShader.log) || '')}`.slice(0, 300)); } return L.length; };

  // ---- numbers: every point, instance, bone, uniform and light of the scene a number, and within the world
  const seenGeo = new WeakMap(); const M4 = () => new THREE.Matrix4(); const _b = new THREE.Box3();
  // (a geometry's own box, counted here and kept here: the game's geometries are not given a box they would not update)
  const boxes = new WeakMap(); const boxOf = g => { const pa = g.attributes.position; const k = pa.version + ':' + pa.count; let e = boxes.get(g); if (!e || e.k !== k) { e = { k, b: new THREE.Box3().setFromBufferAttribute(pa) }; boxes.set(g, e); } return e.b; };
  C.scan = function () {
    const scene = G.Realm.scene(); const r = G.Realm.renderer(); const W4 = G.N * G.Space.TILE, MG = 2500; let scanned = 0;
    const inWorld = (x, y, z) => x > -MG && x < W4 + MG && z > -MG && z < W4 + MG && y > -800 && y < 4000;
    scene.updateMatrixWorld();
    scene.traverse(o => {
      const w = () => V.who(o);
      if (!o.matrixWorld.elements.every(fin)) { add(1, 'objeto do 3D num lugar inválido (matriz com NaN)', w().owner, w().part); return; }
      const g = o.geometry;
      if (g && g.attributes && g.attributes.position) {
        const pa = g.attributes.position; const ver = pa.version + ':' + pa.count + ':' + o.matrixWorld.elements[12] + ':' + o.matrixWorld.elements[14];
        if (seenGeo.get(g) !== ver) {
          seenGeo.set(g, ver); scanned++;
          for (const k in g.attributes) { const a = g.attributes[k]; const arr = a.array; if (!arr || !arr.length || !(arr instanceof Float32Array || arr instanceof Float64Array)) continue; for (let i = 0; i < arr.length; i++) if (!fin(arr[i])) { add(1, 'geometria com NaN/Infinity', w().owner, `${w().part}: atributo ${k}, posição ${i} de ${arr.length}`); break; } }
          // (thrown out of the world: a point kilometres off is a broken number too)
          if (!o.isInstancedMesh && !V.who(o).part.endsWith(':céu') && !o.isPoints) {
            _b.copy(boxOf(g)).applyMatrix4(o.matrixWorld);
            if (fin(_b.min.x) && (!inWorld(_b.min.x, _b.min.y, _b.min.z) || !inWorld(_b.max.x, _b.max.y, _b.max.z))) add(2, 'geometria jogada para fora do mundo', w().owner, `${w().part}: caixa de ${_b.min.x.toFixed(0)},${_b.min.y.toFixed(0)},${_b.min.z.toFixed(0)} a ${_b.max.x.toFixed(0)},${_b.max.y.toFixed(0)},${_b.max.z.toFixed(0)} m`);
          }
          if (g.index) { const ia = g.index.array, nv = pa.count; for (let i = 0; i < ia.length; i++) if (ia[i] >= nv) { add(1, 'geometria com índice fora dos pontos', w().owner, `${w().part}: índice ${ia[i]} de ${nv} pontos`); break; } }
        }
      }
      if (o.isInstancedMesh && o.count > 0) {
        const a = o.instanceMatrix.array; let bad = -1, far = -1;
        for (let k = 0; k < o.count && bad < 0; k++) { for (let j = 0; j < 16; j++) if (!fin(a[k * 16 + j])) { bad = k; break; } if (far < 0 && (a[k * 16] || a[k * 16 + 5] || a[k * 16 + 10]) && !inWorld(a[k * 16 + 12] + o.matrixWorld.elements[12], a[k * 16 + 13] + o.matrixWorld.elements[13], a[k * 16 + 14] + o.matrixWorld.elements[14])) far = k; }
        if (bad >= 0) add(1, 'instância com NaN/Infinity', w().owner, `${w().part}: instância ${bad} de ${o.count}`);
        else if (far >= 0) add(2, 'instância jogada para fora do mundo', w().owner, `${w().part}: instância ${far} em ${a[far * 16 + 12].toFixed(0)},${a[far * 16 + 13].toFixed(0)},${a[far * 16 + 14].toFixed(0)} m`);
        if (o.count > o.instanceMatrix.count) add(1, 'instâncias de mais para o espaço que têm', w().owner, `${w().part}: ${o.count} de ${o.instanceMatrix.count}`);
      }
      if (o.isSkinnedMesh && o.skeleton && o.skeleton.boneMatrices) { const a = o.skeleton.boneMatrices; for (let i = 0; i < a.length; i++) if (!fin(a[i])) { add(1, 'osso com NaN/Infinity', w().owner, `${w().part}: osso ${Math.floor(i / 16)}`); break; } }
      if (o.isLight && (!fin(o.intensity) || (o.color && ![o.color.r, o.color.g, o.color.b].every(fin)))) add(1, 'luz com NaN/Infinity', 'A5', `${o.type} ${o.name || ''}`);
    });
    // (the uniforms each material really draws with: a NaN there is a black or white thing on the screen)
    for (const [m, wh] of matWho()) {
      const u = r.properties.get(m).uniforms; if (!u) continue;
      for (const k in u) { const v = u[k] && u[k].value; if (v === null || v === undefined) continue; let bad = false;
        if (typeof v === 'number') bad = !fin(v); else if (v.isVector2 || v.isVector3 || v.isVector4) bad = ![v.x, v.y, v.z === undefined ? 0 : v.z, v.w === undefined ? 0 : v.w].every(fin); else if (v.isColor) bad = ![v.r, v.g, v.b].every(fin); else if (v.isMatrix3 || v.isMatrix4) bad = !v.elements.every(fin);
        if (bad) add(1, 'uniforme de shader com NaN/Infinity', wh.owner, `${wh.part}.${k}`); }
    }
    const cam = G.Realm.camera(); if (![...cam.matrixWorld.elements, ...cam.projectionMatrix.elements].every(fin)) add(1, 'câmera com NaN/Infinity', 'líder', 'matriz da câmera');
    const fog = scene.fog; if (fog && fog.isFog && !(fog.far > fog.near)) add(2, 'névoa invertida', 'A5', `near ${fog.near} far ${fog.far}`);
    return scanned;
  };

  // (inside what is drawn, with no margin: under the ground, in a wall's stones, inside a house's walls — Cam3D.solid keeps
  // margins round them for the eye, a lens corner within them cuts nothing)
  const hard = (X, Y, Z) => {
    const s = S(); const L = G.Space.TILE, H = G.Space.HM; const x = X / L, y = Z / L; if (!G.W.inb(x, y)) return '';
    if (Y < G.W.hAt(x, y) * H - 0.02) return 'o chão';
    const i = G.W.idx(x, y); if (s.wall[i] && s.wall[i] !== 3 && G.Build3D && G.Build3D.wallSolid && G.Build3D.wallSolid(X, Y, Z, 0)) return 'um muro';
    const b = s.occ[i] && s.buildings.get(s.occ[i]); const top = b && b.blocks && G.Build3D ? G.Build3D.heightAt(i) : 0;
    if (top > 0) { const m = 0.35 / L, lx = x - b.x, ly = y - b.y; if (lx > m && ly > m && lx < b.w - m && ly < b.h - m && Y < G.W.maxH(b.x, b.y, b.w, b.h) * H + top) return `um prédio (${b.type}#${b.id})`; }
    return '';
  };
  // ---- the eye: inside something solid (the world's own rule), its lens cutting a wall, or inside a closed body (rays)
  C.eye = function (rays) {
    const cam = G.Realm.camera(); const p = cam.position; const out = { inside: false };
    if (G.Cam3D.solid(p.x, p.y, p.z)) { out.inside = true; add(2, 'câmera dentro de algo sólido', 'líder', `câmera em ${where(p.x, p.z)} a ${p.y.toFixed(2)} m (Cam3D.solid${hard(p.x, p.y, p.z) ? ': dentro de ' + hard(p.x, p.y, p.z) : ''})`, where(p.x, p.z)); }
    else {
      // (the four corners of the lens: the near plane cuts into a wall or a roof the eye stands next to)
      const hh = cam.near * Math.tan(cam.fov * Math.PI / 360), hw = hh * cam.aspect; const v = new THREE.Vector3(); let cut = 0, what = '';
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { v.set(sx * hw, sy * hh, -cam.near).applyMatrix4(cam.matrixWorld); const h = hard(v.x, v.y, v.z); if (h) { cut++; what = h; } }
      if (cut) add(3, 'a lente da câmera corta uma parede ou o chão', 'líder', `${cut} cantos do plano da lente dentro de ${what} em ${where(p.x, p.z)}`, where(p.x, p.z));
    }
    if (rays) {
      // (rays from the eye: when most of them leave a body through its back faces, the eye is inside it)
      const R = new THREE.Raycaster(); R.far = 30; const DS = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }); const proxy = new THREE.Mesh(undefined, DS);
      const cands = []; G.Realm.scene().traverseVisible(o => { if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh) return; const m = [].concat(o.material)[0]; if (!m || m.side !== THREE.FrontSide || m.transparent || V.who(o).part.endsWith(':céu')) return; const g = o.geometry; if (!g || !g.attributes.position) return; if (!g.boundingSphere) g.computeBoundingSphere(); const c = g.boundingSphere.center.clone().applyMatrix4(o.matrixWorld); if (c.distanceTo(p) < g.boundingSphere.radius + 30) cands.push(o); });
      const dirs = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1], [0.7, 0.7, 0], [-0.7, 0.7, 0], [0, 0.7, 0.7], [0, 0.7, -0.7]];
      let hit = 0, back = 0; const nm = new THREE.Matrix3(); let backOf = null;
      for (const d of dirs) {
        const dir = new THREE.Vector3(...d).normalize(); R.set(p, dir); let best = null;
        for (const o of cands) { proxy.geometry = o.geometry; proxy.matrixWorld.copy(o.matrixWorld); const hits = []; proxy.raycast(R, hits); for (const h of hits) if (!best || h.distance < best.h.distance) best = { h, o }; }
        if (!best || !best.h.face) continue; hit++;
        const n = best.h.face.normal.clone().applyMatrix3(nm.getNormalMatrix(best.o.matrixWorld)).normalize(); if (n.dot(dir) > 0.05) { back++; backOf = best.o; }
      }
      proxy.geometry = undefined; DS.dispose();
      out.rays = { hit, back };
      if (hit >= 4 && back >= hit * 0.6) { const w = V.who(backOf); out.inside = true; add(2, 'câmera dentro de uma geometria fechada', w.owner, `${w.part}: ${back} de ${hit} raios saem por dentro, câmera em ${where(p.x, p.z)} a ${p.y.toFixed(2)} m`, where(p.x, p.z)); }
    }
    return out;
  };

  // ---- people and beasts: their parts joined into bodies (boxes that touch), each body on the floor the world has there
  C.bodies = function () {
    const s = S(); const owners = { 'people3d.js': 1, 'body3d.js': 1 }; const bx = []; const m = M4(); const scene = G.Realm.scene(); scene.updateMatrixWorld();
    scene.traverseVisible(o => {
      if (!o.isInstancedMesh || !o.count || !owners[V.byOf(o)]) return; const g = o.geometry; const bb = boxOf(g); if (!fin(bb.min.x)) return;
      for (let k = 0; k < o.count; k++) { o.getMatrixAt(k, m); const e = m.elements; if (Math.abs(e[0]) + Math.abs(e[1]) + Math.abs(e[2]) + Math.abs(e[4]) + Math.abs(e[5]) + Math.abs(e[6]) + Math.abs(e[8]) + Math.abs(e[9]) + Math.abs(e[10]) < 1e-6) continue; m.premultiply(o.matrixWorld); _b.copy(bb).applyMatrix4(m); if (!fin(_b.min.x)) continue; bx.push([_b.min.x, _b.min.y, _b.min.z, _b.max.x, _b.max.y, _b.max.z]); }
    });
    // (union of the boxes that touch, within a hand)
    const par = bx.map((_, i) => i); const find = i => { while (par[i] !== i) i = par[i] = par[par[i]]; return i; }; const E = 0.1; const cell = new Map(); const ck = (x, z) => x + ',' + z;
    bx.forEach((b, i) => { for (let x = Math.floor(b[0] - E); x <= Math.floor(b[3] + E); x++) for (let z = Math.floor(b[2] - E); z <= Math.floor(b[5] + E); z++) { const k = ck(x, z); const l = cell.get(k); if (l) l.push(i); else cell.set(k, [i]); } });
    for (const l of cell.values()) for (let a = 0; a < l.length; a++) for (let c = a + 1; c < l.length; c++) { const p = bx[l[a]], q = bx[l[c]]; if (p[0] - E <= q[3] && q[0] - E <= p[3] && p[1] - E <= q[4] && q[1] - E <= p[4] && p[2] - E <= q[5] && q[2] - E <= p[5]) par[find(l[a])] = find(l[c]); }
    const comp = new Map(); bx.forEach((b, i) => { const r = find(i); const c = comp.get(r); if (!c) comp.set(r, { lo: b[1], hi: b[4], fx: (b[0] + b[3]) / 2, fz: (b[2] + b[5]) / 2, n: 1, x0: b[0], x1: b[3], z0: b[2], z1: b[5] }); else { if (b[1] < c.lo) { c.lo = b[1]; c.fx = (b[0] + b[3]) / 2; c.fz = (b[2] + b[5]) / 2; } c.hi = Math.max(c.hi, b[4]); c.n++; c.x0 = Math.min(c.x0, b[0]); c.x1 = Math.max(c.x1, b[3]); c.z0 = Math.min(c.z0, b[2]); c.z1 = Math.max(c.z1, b[5]); } });
    // (what is rightly off the ground: a bird in flight, someone the god's hand lifts, a dragon; the water and the walls)
    const flyers = []; for (const a of s.animals.values()) { const D = G.Animals.DEF[a.kind]; if (D && D.cls === 'air' && (a.z || 0) > 0.3) flyers.push([a.x * 4, a.y * 4]); } for (const d of s.dragons || []) flyers.push([d.x * 4, d.y * 4]);
    for (const v of s.villagers.values()) if ((v.z || 0) > 0.05 || v.held || v.air) flyers.push([v.x * 4, v.y * 4]);
    const av = G.Avatar.state(); if (av && (!av.ground || av.loco === 'climb' || av.loco === 'swim')) flyers.push([av.X, av.Z]);
    let n = 0, fl = 0, sk = 0;
    for (const c of comp.values()) {
      n++; const i = tileOf(c.fx, c.fz); if (i < 0 || wet(i) || s.wall[i] || (s.occ[i] && (S().buildings.get(s.occ[i]) || {}).blocks)) continue;
      const cx = (c.x0 + c.x1) / 2, cz = (c.z0 + c.z1) / 2; if (flyers.some(([x, z]) => Math.hypot(x - cx, z - cz) < 2.5)) continue;
      const floor = G.Avatar.floorAt(c.fx, c.fz); const lift = c.lo - floor;
      if (lift > 0.35) { fl++; add(2, c.n <= 2 ? 'peça de pessoa ou bicho solta no ar' : 'pessoa ou bicho flutuando', 'A4', `${c.n} peças, ${lift.toFixed(2)} m acima do chão em ${where(c.fx, c.fz)}`, where(c.fx, c.fz)); }
      else if (c.hi < floor - 0.05) { sk++; add(2, 'pessoa ou bicho enterrado', 'A4', `${c.n} peças, todo abaixo do chão em ${where(c.fx, c.fz)}`, where(c.fx, c.fz)); }
      else if (lift < -0.45) { sk++; add(2, 'pessoa ou bicho afundado no chão', 'A4', `${c.n} peças, os pés ${(-lift).toFixed(2)} m dentro do chão em ${where(c.fx, c.fz)}`, where(c.fx, c.fz)); }
    }
    return { parts: bx.length, bodies: n, floating: fl, sunk: sk };
  };

  // ---- things and decoration: none buried under the floor; the new decoration standing on it
  C.things = function () {
    const s = S(); const m = M4(); const scene = G.Realm.scene(); let n = 0, bad = 0;
    scene.traverseVisible(o => {
      const f = V.byOf(o); if (!o.isInstancedMesh || !o.count || !(f === 'things3d.js' || f === 'props3d.js')) return; const g = o.geometry; const bb = boxOf(g); if (!fin(bb.min.x)) return; const w = V.who(o);
      for (let k = 0; k < o.count; k++) {
        o.getMatrixAt(k, m); const e = m.elements; if (Math.abs(e[0]) + Math.abs(e[5]) + Math.abs(e[10]) + Math.abs(e[1]) + Math.abs(e[4]) < 1e-6) continue; m.premultiply(o.matrixWorld); _b.copy(bb).applyMatrix4(m); n++;
        const X = (_b.min.x + _b.max.x) / 2, Z = (_b.min.z + _b.max.z) / 2; const i = tileOf(X, Z); if (i < 0 || wet(i) || s.wall[i] || s.occ[i] || s.treeAt[i]) continue;
        const floor = G.Avatar.floorAt(X, Z);
        const lab = `${w.part}${o.userData && o.userData.max ? ' (cap. ' + o.userData.max + ')' : ''} instância ${k}`; const deep = floor - _b.max.y;
        if (deep > 0.05) { bad++; add(deep > 0.25 ? 2 : 3, deep > 0.25 ? 'coisa enterrada no chão' : 'coisa quase enterrada no chão', w.owner, `${lab}: o topo ${deep.toFixed(2)} m abaixo do chão em ${where(X, Z)}`, where(X, Z)); }
        else if (f === 'props3d.js' && _b.min.y > floor + 0.3) { bad++; add(2, 'decoração flutuando', w.owner, `${w.part} instância ${k}: ${(_b.min.y - floor).toFixed(2)} m acima do chão em ${where(X, Z)}`, where(X, Z)); }
      }
    });
    return { n, bad };
  };

  // ---- trees near the body: each standing one on its slope (its own picture made alone, as one that falls is)
  C.trees = function (x, y, R, max) {
    const s = S(); const HM = G.Space.HM; let n = 0, bad = 0;
    if (typeof G.Realm.treeMesh !== 'function') return { n: 0, bad: 0, none: 'G.Realm.treeMesh não existe' };
    const ts = [...s.trees.values()].filter(t => t.stage === 'grow' && G.dist(t.x, t.y, x, y) < R).sort((a, b) => G.dist2(a.x, a.y, x, y) - G.dist2(b.x, b.y, x, y)).slice(0, max);
    for (const t of ts) {
      let grp; try { grp = G.Realm.treeMesh(t); } catch (e) { add(1, 'árvore: o desenho quebra', 'A3', `árvore#${t.id} (${t.kind}): ${e.message}`, [t.x, t.y]); continue; }
      if (!grp) continue; n++;
      const box = new THREE.Box3().setFromObject(grp); G.Realm.dropMesh(grp);
      if (!fin(box.min.y)) { add(1, 'árvore com número inválido no desenho', 'A3', `árvore#${t.id} (${t.kind})`, [t.x, t.y]); continue; }
      let lo = 1e9; for (const [dx, dy] of [[0, 0], [0.07, 0], [-0.07, 0], [0, 0.07], [0, -0.07]]) lo = Math.min(lo, G.W.groundH(t.x + dx, t.y + dy) * HM);
      if (box.min.y > lo + 0.2) { bad++; add(box.min.y > lo + 0.4 ? 2 : 3, 'árvore flutuando', 'A3', `árvore#${t.id} (${t.kind}, tamanho ${(+t.size || 0).toFixed(2)}): o pé ${(box.min.y - lo).toFixed(2)} m acima do chão mais baixo em volta`, [+t.x.toFixed(1), +t.y.toFixed(1)]); }
    }
    return { n, bad };
  };

  // ---- the modules' own proofs (every module of the 3D with a check(): the known ones, and any new one)
  C.modules = function () {
    const b = G.Possess.body(); const out = {};
    for (const k of Object.keys(G)) {
      const M = G[k]; if (!(/3D$/.test(k)) || !M || typeof M.check !== 'function') continue;
      let r; try { r = k === 'Ground3D' ? (b ? M.check(b.x, b.y, 30, 400) : null) : M.check(); } catch (e) { add(1, `${k}.check() quebra`, '?', e.message); continue; }
      out[k] = r;
      const own = { People3D: 'A4', Body3D: 'A4', Things3D: 'líder', Dragon3D: 'líder', FX3D: 'A5', Post3D: 'A5', Ground3D: 'A3', Grass3D: 'A3', Build3D: 'A2', Props3D: 'A2' }[k] || '?';
      if (Array.isArray(r)) for (const e of r) add(2, `${k}.check()`, own, String(e));
      else if (r && typeof r === 'object' && 'bad' in r && r.bad > 2) add(2, `${k}.check()`, own, `${r.bad} de ${r.n} casas pintadas diferente do mundo`);
    }
    return out;
  };

  // ---- the quality: what each preset says, the drawing does
  C.preset = function (p) {
    const q = G.Realm.Q(); const r = G.Realm.renderer(); const d = V.drawn(); const R = q.near; const out = { p };
    let disc = 0; const RK = (R + 1.5) * (R + 1.5); for (let dy = -R - 2; dy <= R + 2; dy++) for (let dx = -R - 2; dx <= R + 2; dx++) if (dx * dx + dy * dy <= RK) disc++;
    if (!!r.shadowMap.enabled !== !!q.shadows) add(2, 'qualidade: sombras ligadas ao contrário do que o preset diz', 'A5', `${p}: shadows ${q.shadows}, shadowMap.enabled ${r.shadowMap.enabled}`);
    if (G.Grass3D && d.grass !== null && (!!(q.grass && q.field > 0) !== (d.grass > 0))) add(3, 'qualidade: capim ao contrário do que o preset diz', 'A3', `${p}: grass ${q.grass}, field ${q.field}, tufos desenhados ${d.grass}`);
    if (d.people !== null && d.people > q.npcs + 1 + (d.dead || 0)) add(3, 'qualidade: mais pessoas inteiras do que o preset deixa', 'A4', `${p}: ${d.people} desenhadas, npcs ${q.npcs}`);
    if (d.near !== null && d.near > disc) add(3, 'qualidade: mais pedaços perto do que o preset guarda', 'líder', `${p}: ${d.near} pedaços, o disco guarda ${disc}`);
    const pr = r.getPixelRatio(); if (Math.abs(pr - Math.min(window.devicePixelRatio || 1, 2) * q.scale) > 0.01) add(3, 'qualidade: resolução diferente do preset', 'A5', `${p}: pixelRatio ${pr}, scale ${q.scale}`);
    Object.assign(out, { near: d.near, disc, people: d.people, grass: d.grass, shadows: r.shadowMap.enabled }); return out;
  };

  // ---- the places to go: from the world's own data, the same every run (G.hash), many kinds
  C.spots = function (n) {
    const s = S(), N = G.N, T = G.T, W = G.W; const town = V.town(); const b0 = G.Possess.body(); const out = []; const used = new Set();
    const ok = (x, y) => { const i = y * N + x; return x > 2 && y > 2 && x < N - 3 && y < N - 3 && W.walkable(i) && !s.treeAt[i] && (!b0 || W.reaches(b0, x + 0.5, y + 0.5)); };
    const pick = (kind, f, inTown) => {
      const c = []; const cx = town ? town.cx : N / 2, cy = town ? town.cy : N / 2; const R = inTown ? 22 : N;
      for (let y = Math.max(3, Math.floor(cy - R)); y < Math.min(N - 3, cy + R); y++) for (let x = Math.max(3, Math.floor(cx - R)); x < Math.min(N - 3, cx + R); x++) { const i = y * N + x; if (used.has(i) || !f(i, x, y) || !ok(x, y)) continue; c.push(i); }
      if (!c.length) return null; c.sort((a, b) => G.hash(a * 13 + 7) - G.hash(b * 13 + 7)); const i = c[0]; used.add(i); for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) used.add(i + dy * N + dx);
      return { kind, x: (i % N) + 0.5, y: Math.floor(i / N) + 0.5 };
    };
    const blockedN = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([a, b]) => W.inb(x + a, y + b) && W.blocked((y + b) * N + x + a)).length;
    const trees = (x, y, r) => { let k = 0; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (W.inb(x + dx, y + dy) && s.treeAt[(y + dy) * N + x + dx]) k++; return k; };
    const nearT = (x, y, f) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => W.inb(x + a, y + b) && f((y + b) * N + x + a));
    const th = i => (W.tileH ? W.tileH(i) : 0); let hmax = -1e9; for (let i = 0; i < N * N; i++) if (W.walkable(i)) hmax = Math.max(hmax, th(i));
    // (town and land in turn: a short hunt still sees the streets, a wood, a door, the shore and a slope)
    const K = [
      ['entre prédios', (i, x, y) => blockedN(x, y) >= 2, 1],
      ['mata densa', (i, x, y) => trees(x, y, 3) >= 12, 0],
      ['porta', (i, x, y) => nearT(x, y, j => s.occ[j] && (s.buildings.get(s.occ[j]) || {}).blocks) && s.road[i] > 0, 1],
      ['costa', (i, x, y) => s.type[i] >= T.SAND && nearT(x, y, j => s.type[j] <= T.SEA), 0],
      ['ladeira', i => s.slope && s.slope[i] > 1.1 && s.type[i] >= T.SAND, 0],
      ['rua', i => s.road[i] > 0 && s.type[i] !== T.RIVER, 1],
      ['beira-rio', (i, x, y) => nearT(x, y, j => s.type[j] === T.RIVER), 0],
      ['muro', (i, x, y) => nearT(x, y, j => s.wall[j] > 0), 0],
      ['alto', i => th(i) >= hmax - 1.5, 0],
      ['cais', (i, x, y) => nearT(x, y, j => s.occ[j] && (s.buildings.get(s.occ[j]) || {}).type === 'doca'), 0],
      ['campo', i => { const b = s.occ[i] && s.buildings.get(s.occ[i]); return !!b && (b.type === 'farm' || b.type === 'horta' || b.type === 'plantacao'); }, 0],
      ['qualquer', () => true, 0],
    ];
    for (let round = 0; out.length < n && round < 6; round++) for (const [kind, f, inTown] of K) { if (out.length >= n) break; if (round > 0 && kind !== 'qualquer' && kind !== 'entre prédios' && kind !== 'porta' && round > 1) continue; const p = pick(kind, f, inTown); if (p) out.push(p); }
    return out;
  };

  // ---- the picture's light: a black frame, one blown out, one of a single colour
  C.light = function (pix, at) {
    if (pix.mean < 3 && pix.black > 95) add(1, 'quadro preto', 'A5', `luz média ${pix.mean}, ${pix.black}% preto, hora ${(+G.S.time).toFixed(2)}`, at);
    else if (pix.white > 60) add(2, 'quadro estourado (branco)', 'A5', `${pix.white}% branco, hora ${(+G.S.time).toFixed(2)}`, at);
    else if (pix.sd < 1.5) add(2, 'quadro chapado (uma cor só)', 'A5', `desvio ${pix.sd}, luz ${pix.mean}`, at);
  };
  // ---- the drawing leaves the world alone: the world paused (the menu), frames from many eyes and qualities, the save the same
  C.still = function () {
    const Q0 = G.Realm.q; G.Modes.menu(true); V.f(2); const a = C.world(); const r0 = JSON.stringify(G.S.rng), c0 = G.S.clock;
    for (const [k, p] of Object.keys(G.Realm.QUAL).entries()) { G.Realm.setQuality(p); for (let j = 0; j < 3; j++) { G.Cam3D.yaw = k + j * 2.1; G.Cam3D.pitch = [0.2, 0.6, -0.2][j]; V.warm(1); } }
    const b = C.world(); const out = { same: a === b, rng: JSON.stringify(G.S.rng) === r0, clock: G.S.clock === c0 };
    if (a !== b) add(0, 'o desenho mudou o mundo (com o mundo parado)', '?', C.firstDiff(a, b));
    else if (!out.rng || !out.clock) add(0, 'o desenho mexeu no acaso ou no relógio do mundo', '?', JSON.stringify(out));
    G.Modes.menu(false); G.Realm.setQuality(Q0); V.f(2); return out;
  };
  // the world as the save would keep it (without the moment it was saved): to see that drawing changed nothing
  // (the god's eye, kept in the save to open the view where it was, is a view: it eases toward its target in any frame)
  C.world = () => { const o = JSON.parse(G.Save.serialize()); delete o.savedAt; delete o.cam; return JSON.stringify(o); };
  C.firstDiff = (a, b) => { const A = JSON.parse(a), B = JSON.parse(b); const walk = (x, y, p) => { if (JSON.stringify(x) === JSON.stringify(y)) return null; if (x && y && typeof x === 'object' && typeof y === 'object') { for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) { const d = walk(x[k], y[k], p + '.' + k); if (d) return d; } } return `${p}: ${JSON.stringify(x).slice(0, 80)} → ${JSON.stringify(y).slice(0, 80)}`; }; return walk(A, B, 'save'); };
}

module.exports = { CACA };
if (require.main !== module) return;

// ------------------------------ the hunt ------------------------------
(async () => {
  const t00 = Date.now();
  const ready = WORLDS.filter(w => w !== 'novo');
  const { browser, page, errs } = await open(ROOT, { worlds: ready, w: +process.env.VW || 900, h: +process.env.VH || 560 });
  await page.evaluate(`(${CACA.toString()})()`);
  const R = { root: ROOT, commit, date: new Date().toISOString().slice(0, 16).replace('T', ' '), quality: QH, worlds: {}, problems: [], errors: [], load: [os.loadavg()[0].toFixed(1)] };
  let shots = 0; const seenKinds = new Set(); let errN = 0;
  const E = (fn, arg) => page.evaluate(fn, arg);
  // a problem found: kept with where it was; the first of each kind photographed
  const take = async (ctx) => {
    const ps = await E(() => __CACA.take()).catch(e => [{ sev: 1, kind: 'a página não responde', owner: '?', msg: e.message.slice(0, 200) }]);
    for (const e of errs.slice(errN)) { const shader = /Shader Error|WebGLProgram|GL_INVALID|WebGL: /.test(e); ps.push({ sev: 1, kind: shader ? 'erro de shader / WebGL no console' : e.startsWith('página') ? 'erro de página' : 'erro ou aviso no console', owner: '?', msg: e.slice(0, 360) }); }
    errN = errs.length;
    const fresh = [];
    for (const p of ps) { Object.assign(p, ctx); R.problems.push(p); const k = p.kind + '|' + p.owner; if (p.sev <= 2 && !seenKinds.has(k)) { seenKinds.add(k); fresh.push(p); } }
    if (fresh.length && shots < MAXF && ctx.cam !== undefined) { const f = `caca-${String(++shots).padStart(2, '0')}-${ctx.world}.png`; try { await page.screenshot({ path: path.join(OUT, f), timeout: 120000 }); for (const p of fresh) p.foto = f; } catch (e) { } }
    return ps;
  };
  for (const w of WORLDS) {
    const W = R.worlds[w] = { t: Date.now() };
    console.log(`\n=== ${w} ===`);
    // the world: a ready one, or a new one made from its seed and lived for a few years by the game's own skip
    let o;
    if (w === 'novo') {
      const [type, size, tribes, clima, seed, years, civs] = NOVO;
      const g = await page.evaluate(([type, size, tribes, clima, seed, civs]) => {
        if (G.Modes.state !== 'GOD') { G.Modes.leave('deus'); __VIS.until(() => G.Modes.state === 'GOD', 400); }
        G.Main.newGame({ type, size: +size, tribes: +tribes, temper: 'normal', clima, relevo: 'suave', seed: +seed, civs: civs ? civs.split('+') : [] });
        G.Main.mode = 'game'; document.querySelector('#intro') && document.querySelector('#intro').classList.add('hidden'); document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); if (G.Audio) G.Audio.mute = true;
        return { seed: G.S.seed >>> 0, N: G.N, civs: G.Fac.all().map(f => f.civ) };
      }, [type, size, tribes, clima, seed, civs]);
      console.log(`mundo novo: ${JSON.stringify(g)} · ${years} anos pelo salto do jogo`);
      const sk = await page.evaluate(y => new Promise(res => {
        const d0 = G.S.day, t0 = performance.now(); G.Skip.start(+y >= 25 ? 'anos25' : 'anos10', 'fartura');
        const tick = () => { if (G.Skip.on && G.S.day - d0 < +y && performance.now() - t0 < 1500000) return setTimeout(tick, 300); if (G.Skip.on) G.Skip.stop(); G.UI.closeModal(); res({ d0, d1: G.S.day, s: Math.round((performance.now() - t0) / 1000) }); };
        tick();
      }), years).catch(e => ({ err: e.message }));
      await page.evaluate(() => { G.UI.closeModal(); G.Ready.data.novo = G.Save.serialize(); });
      W.gen = Object.assign(g, sk); console.log(`  vividos: ${JSON.stringify(sk)}`);
    }
    o = await E(([w, q]) => { G.Realm.setQuality(q); G.Save.apply(JSON.parse(G.Ready.data[w])); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
      window.__QA0 = new Set(QA.check().filter(e => e.sev <= 3).map(e => e.id + '|' + e.msg.replace(/\s*\([^)]*\)\s*$/, '')));
      const r = __VIS.enterTown(); r.buildings = r.ok ? __CACA.buildings() : 0; // (Build3D.bounds needs the 3D made: after entering, as e1)
       r.N = G.N; r.pop = G.S.villagers.size; r.civs = [...new Set(G.Fac.all().filter(f => f.alive !== false).map(f => f.civ))]; return r; }, [w, QH]).catch(e => ({ ok: false, why: e.message }));
    W.open = o; console.log(`aberto: ${JSON.stringify(o)}`);
    await take({ world: w, spot: 'todos os prédios' });
    if (!o.ok) { R.problems.push({ sev: 1, kind: 'não encarnou', owner: 'líder', msg: o.why, world: w }); continue; }
    const tex = await E(() => { __VIS.warm(2); __VIS.f(3); return { tex: __CACA.textures(), programs: __CACA.programs() }; }).catch(e => ({ err: e.message }));
    W.tex = tex; console.log(`texturas: ${JSON.stringify(tex)}`);
    await take({ world: w, spot: 'texturas' });
    // the places
    const spots = await E(n => __CACA.spots(n), NPTS);
    W.spots = spots; console.log(`lugares: ${spots.map(p => p.kind + ' ' + p.x + ',' + p.y).join(' · ')}`);
    const calls = []; let first = null;
    for (const [k, sp] of spots.entries()) {
      const t0 = Date.now();
      const r = await E(([sp, k, rap]) => {
        const out = { kind: sp.kind, at: [sp.x, sp.y] };
        if (!G.Avatar.place(sp.x, sp.y)) { out.skip = 'não dá para pôr o corpo aqui'; return out; }
        G.S.time = [0.42, 0.66, 0.86, 0.3][k % 4]; // (the hours turn from place to place: day, evening, night, morning)
        __VIS.warm(2); __VIS.f(2);
        const st = G.Avatar.state(); const y0 = G.hash(k * 31 + 5) * Math.PI * 2;
        const eyes = rap ? [[y0, 0.22, 4.8], [y0 + Math.PI, -0.25, 2.2]] : [[y0, 0.22, 4.8], [y0 + Math.PI, 0.22, 4.8], [y0 + Math.PI / 2, 0.55, 9], [y0 - Math.PI / 2, -0.25, 2.2]];
        out.eyes = [];
        for (const [j, [yaw, pitch, dist]] of eyes.entries()) {
          if (st) st.yaw = 0.3; G.Cam3D.OPT.follow = false; G.Cam3D.yaw = yaw; G.Cam3D.pitch = pitch; G.Cam3D.dist = dist; G.Cam3D.cur = dist; G.Main.frameFor(33);
          const c = __VIS.count(); const e = __CACA.eye(j === 0); __CACA.light(c.pix, [sp.x, sp.y]);
          out.eyes.push({ yaw: +yaw.toFixed(2), pitch, dist, calls: c.calls, tris: c.tris, passes: c.passes, pix: c.pix, inside: e.inside, rays: e.rays });
        }
        out.scan = __CACA.scan(); out.bodies = __CACA.bodies(); out.things = __CACA.things(); const b = G.Possess.body(); out.trees = b ? __CACA.trees(b.x, b.y, 12, rap ? 10 : 24) : null;
        out.modules = Object.keys(__CACA.modules()); out.programs = __CACA.programs(); out.drawn = __VIS.drawn(); out.mem = __VIS.memory(); out.modErr = JSON.stringify(G.modErr);
        if (out.modErr !== '{}') __CACA.P.push({ sev: 1, kind: 'erro de módulo (G.modErr)', owner: '?', msg: out.modErr.slice(0, 300), at: [sp.x, sp.y] });
        return out;
      }, [sp, k, RAPIDO]).catch(e => ({ err: e.message.slice(0, 300) }));
      const ps = await take({ world: w, spot: `${k + 1} ${sp.kind} ${sp.x},${sp.y}`, cam: 0 });
      if (r.eyes) for (const e of r.eyes) calls.push(e.calls);
      if (!first && r.mem) first = r.mem;
      (W.visits = W.visits || []).push(Object.assign(r, { problems: ps.length, s: Math.round((Date.now() - t0) / 1000) }));
      console.log(`${k + 1}. ${sp.kind} ${sp.x},${sp.y}: ${r.err ? 'ERRO ' + r.err : r.skip ? r.skip : `chamadas ${r.eyes.map(e => e.calls).join('/')}, luz ${r.eyes.map(e => e.pix.mean).join('/')}, corpos ${r.bodies.bodies} (${r.bodies.parts} peças), árvores ${r.trees && r.trees.n}`} · ${ps.length} problema(s) · ${Math.round((Date.now() - t0) / 1000)} s`);
    }
    // draw calls exploding: far above the others of this world, or above the reference run
    if (calls.length >= 4) {
      const med = calls.slice().sort((a, b) => a - b)[Math.floor(calls.length / 2)]; W.callsMed = med; W.callsMax = Math.max(...calls);
      for (const v of W.visits || []) for (const e of v.eyes || []) if (e.calls > med * 2.5 && e.calls > med + 200) R.problems.push({ sev: 2, kind: 'chamadas de desenho explodem', owner: '?', msg: `${e.calls} chamadas (a mediana deste mundo é ${med})`, world: w, spot: `${v.kind} ${v.at}` });
      if (BASE) { const ref = Math.max(0, ...BASE.rows.filter(m => m.preset === QH && !m.err).map(m => m.calls)); if (ref && W.callsMax > ref * 1.5) R.problems.push({ sev: 2, kind: 'chamadas de desenho acima da referência', owner: '?', msg: `${W.callsMax} chamadas; a referência (${BASE.commit}) tem no máximo ${ref} em ${QH}`, world: w }); }
    }
    // the presets, the switch of quality, the memory, and the world left alone by the drawing — at the first place again
    const end = await E(([sp, QH]) => {
      const out = {}; G.Avatar.place(sp.x, sp.y); G.S.time = 0.42; G.Cam3D.yaw = 0.5; G.Cam3D.pitch = 0.22; G.Cam3D.dist = G.Cam3D.cur = 4.8;
      __VIS.warm(2); __VIS.f(2); out.back = __VIS.memory();
      // (a quality switched in the game keeps what is already made until it changes: how much the near pictures differ)
      G.Realm.setQuality('baixa'); G.Realm.rebuildAll(); __VIS.warm(2); __VIS.f(1); G.Realm.setQuality('media'); __VIS.warm(1); __VIS.f(1); const t0 = __VIS.count().tris; G.Realm.rebuildAll(); __VIS.warm(1); __VIS.f(1); const t1 = __VIS.count().tris;
      out.switch = { kept: t0, rebuilt: t1 };
      if (t1 && Math.abs(t1 - t0) / t1 > 0.05) __CACA.P.push({ sev: 4, kind: 'trocar a qualidade no jogo não refaz o que já está perto', owner: 'A5', msg: `baixa → média: ${(t0 / 1000).toFixed(0)} mil triângulos; refeito: ${(t1 / 1000).toFixed(0)} mil (o que está perto só muda quando o pedaço é refeito)` });
      out.presets = []; for (const p of Object.keys(G.Realm.QUAL)) { __VIS.fresh(p); out.presets.push(__CACA.preset(p)); }
      __VIS.fresh(QH); out.after = __VIS.memory();
      out.still = __CACA.still();
      // the world's own invariants, after it all (new ones only)
      out.qa = QA.check().filter(e => e.sev <= 2 && !window.__QA0.has(e.id + '|' + e.msg.replace(/\s*\([^)]*\)\s*$/, ''))).map(e => `${e.sys}/S${e.sev}: ${e.msg}`);
      for (const q of out.qa.slice(0, 10)) __CACA.P.push({ sev: 1, kind: 'invariante do mundo quebrada (QA.check)', owner: 'líder', msg: q });
      return out;
    }, [spots[0] || { x: 0, y: 0 }, QH]).catch(e => ({ err: e.message.slice(0, 300) }));
    if (first && end.after) {
      // (the scene's own geometries: the card's count grows as each far picture is drawn the first time — not a leak)
      W.leak = { first: first.live, back: end.back && end.back.live, after: end.after.live, gpu: [first.geometries, end.back && end.back.geometries], tex: [first.textures, end.after.textures] };
      if (end.back && end.back.live > first.live * 1.15 + 10) R.problems.push({ sev: 3, kind: 'geometrias acumulando', owner: '?', msg: `no primeiro lugar a cena tinha ${first.live} geometrias; de volta a ele depois da caça, ${end.back.live}`, world: w });
      if (end.after.textures > first.textures + 3) R.problems.push({ sev: 3, kind: 'texturas acumulando', owner: '?', msg: `${first.textures} → ${end.after.textures} texturas na placa depois de trocar as qualidades`, world: w });
    }
    W.end = end; console.log(`fim do mundo ${w}: ${JSON.stringify({ switch: end.switch, still: end.still, qa: end.qa && end.qa.length, presets: end.presets })}`);
    await take({ world: w, spot: 'qualidades e o mundo parado' });
    W.t = Math.round((Date.now() - W.t) / 1000);
  }
  R.load.push(os.loadavg()[0].toFixed(1)); R.secs = Math.round((Date.now() - t00) / 1000); R.errors = errs.slice(0, 50);
  // grouped: the same kind, owner and message (numbers aside) counted once, with where it was first seen
  const groups = new Map();
  for (const p of R.problems) { const k = p.sev + '|' + p.kind + '|' + p.owner + '|' + String(p.msg).replace(/-?\d+(\.\d+)?/g, '#').slice(0, 120); const g = groups.get(k); if (g) { g.n++; if (!g.worlds.includes(p.world)) g.worlds.push(p.world); } else groups.set(k, { sev: p.sev, kind: p.kind, owner: p.owner, msg: p.msg, n: 1, worlds: [p.world], first: p.spot || '', at: p.at || null, foto: p.foto || null }); }
  R.groups = [...groups.values()].sort((a, b) => a.sev - b.sev || b.n - a.n);
  fs.writeFileSync(path.join(OUT, 'caca.json'), JSON.stringify(R, null, 1));
  const L = [`CAÇA AOS PROBLEMAS VISUAIS — ${ROOT} @ ${commit} · ${R.date} · qualidade ${QH} · ${R.secs} s · carga ${R.load.join('→')}`];
  for (const w of WORLDS) { const W = R.worlds[w]; if (!W || !W.open) continue; L.push(`  ${w}: ${W.open.town || '?'} (${(W.open.civs || []).join(', ')}), ${W.open.buildings} prédios conferidos, ${(W.spots || []).length} lugares, chamadas mediana ${W.callsMed} / máx ${W.callsMax}${W.gen ? ` · gerado: semente ${W.gen.seed}, ${W.gen.N}×${W.gen.N}, anos ${W.gen.d0}→${W.gen.d1} em ${W.gen.s} s` : ''}`); }
  const bySev = s => R.groups.filter(g => g.sev === s);
  L.push(''); L.push(`${R.groups.length} problemas diferentes (${R.problems.length} ocorrências): ` + [0, 1, 2, 3, 4].map(s => `S${s} ${bySev(s).length}`).join(' · '));
  for (const g of R.groups) L.push(`S${g.sev} [${g.owner}] ${g.kind} — ${g.msg}${g.n > 1 ? ` (×${g.n})` : ''} · ${g.worlds.join(',')}${g.first ? ' · ' + g.first : ''}${g.foto ? ' · ' + g.foto : ''}`);
  fs.writeFileSync(path.join(OUT, 'caca.txt'), L.join('\n') + '\n');
  console.log('\n' + L.join('\n'));
  await browser.close();
  process.exit(R.groups.some(g => g.sev <= 2) ? 1 : 0);
})().catch(e => { console.error('caca: ' + (e.stack || e)); process.exit(2); });
