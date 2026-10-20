// caca-prova: the hunter tried on purpose — each kind of problem it hunts is planted in the page (a NaN in the ground, a
// person lifted two metres, a grey layer of the texture stack, the eye inside a closed box, a shader that cannot compile,
// the drawing writing the world, a face glued to the ground, people flickering between their two drawings, the cape inside
// the body, leaves lit white...), the hunt must accuse it — something the base did not already have — and it is undone;
// and with nothing planted it must be quiet (no S0–S2; a real problem of the game it finds there fails it too, until fixed):
//   bash qa/navegador.sh node qa/visual/caca-prova.js [PASTA_DO_JOGO]       → PROVA: ok (exit 0) or the planted ones it missed
const path = require('path');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..'));
const { open } = require('./vistas.js'); const { CACA } = require('./caca.js');
(async () => {
  const { browser, page, errs } = await open(ROOT, { worlds: ['cidade'], w: 800, h: 500 });
  await page.evaluate(`(${CACA.toString()})()`);
  const fails = []; const ok = (name, cond, info) => { console.log(`${cond ? 'PASSOU' : 'FALHOU'} | caca-prova ${name} | ${info}`); if (!cond) fails.push(name); };
  const o = await page.evaluate(() => { const r = __VIS.open('cidade', 'media'); const b = G.Possess.body(); G.Avatar.place(b.x, b.y); __VIS.warm(2); __VIS.f(3); __CACA.take(); return r; });
  ok('entra na cidade', o.ok, JSON.stringify(o));
  // (one plant: done, the checks run, the kinds they accused, undone. Only what the base did not already have counts: a real
  // problem of the game the hunt reports with nothing planted must not make a plant of the same kind pass for it. A plant of
  // something this game does not draw (an «NA:» error: no continuous body, no leaves) is said, not failed)
  let BASE = [];
  const plant = (name, want, fn) => page.evaluate(([fn, want, base]) => {
    __CACA.take(); let undo = null, got = [], na = null; const old = new Set(base);
    try { undo = (0, eval)('(' + fn + ')')(); got = __CACA.take(); } catch (e) { if (/^NA:/.test(e.message)) na = e.message.slice(3).trim(); else got = [{ kind: 'ERRO ' + e.message }]; } finally { try { if (typeof undo === 'function') undo(); } catch (e) { got.push({ kind: 'ERRO ao desfazer ' + e.message }); } }
    __CACA.take(); const fresh = got.filter(p => !old.has(p.kind + '|' + p.msg));
    return { na, hit: fresh.some(p => (p.kind + ' ' + p.msg).includes(want)), kinds: [...new Set(fresh.map(p => `S${p.sev} ${p.kind}`))].slice(0, 6), stale: got.length - fresh.length };
  }, [fn.toString(), want, BASE]).then(r => r.na ? ok(name, true, `não se aplica a este jogo: ${r.na}`) : ok(name, r.hit, `procurado: «${want}» · acusou: ${r.kinds.join('; ') || 'nada'}${r.stale ? ` (${r.stale} que a base já tinha, sem contar)` : ''}`));
  // nothing planted: quiet (S0–S2 fail; the S3/S4 the base has are shown, and every kind it has is kept as the base the plants
  // are measured against)
  const q0 = await page.evaluate(() => { __CACA.scan(); __CACA.bodies(); __CACA.things(); __CACA.eye(true); __CACA.textures(); __CACA.programs(); const st = G.Avatar.state(); if (st) __CACA.zfight(st.X, st.Z, 24); __CACA.cloth(); const c = __VIS.count(); __CACA.light(c.pix, null);
    const all = __CACA.take(); return { bad: all.filter(p => p.sev <= 2).map(p => `S${p.sev} ${p.kind}: ${p.msg}`), soft: all.filter(p => p.sev > 2).map(p => `S${p.sev} ${p.kind}: ${p.msg}`), keys: all.map(p => p.kind + '|' + p.msg) }; });
  BASE = q0.keys; const quiet = q0.bad;
  ok('sem nada plantado, a caça fica quieta', quiet.length === 0, quiet.slice(0, 4).join(' · ') || 'nenhum problema');
  if (q0.soft.length) console.log(`(a base tem, sem contar: ${q0.soft.slice(0, 6).join(' · ')})`);

  await plant('NaN num ponto do chão perto do corpo', 'geometria com NaN', () => { const st = G.Avatar.state(); const m = G.Realm.nearOf(st.X, st.Z)[0]; const a = m.geometry.attributes.position; const v = a.array[4]; a.array[4] = NaN; a.needsUpdate = true; __CACA.scan(); return () => { a.array[4] = v; a.needsUpdate = true; }; });
  await plant('um ponto do chão jogado a 10 mil km', 'geometria jogada para fora do mundo', () => { const st = G.Avatar.state(); const m = G.Realm.nearOf(st.X, st.Z)[0]; const a = m.geometry.attributes.position; const v = a.array[3]; a.array[3] = 1e7; a.needsUpdate = true; __CACA.scan(); return () => { a.array[3] = v; a.needsUpdate = true; }; });
  await plant('um índice além dos pontos', 'índice fora dos pontos', () => { const st = G.Avatar.state(); let m = G.Realm.nearOf(st.X, st.Z).find(x => x.geometry.index); if (!m) G.Realm.scene().traverse(o => { if (!m && o.isMesh && o.geometry && o.geometry.index) m = o; }); const ia = m.geometry.index.array; const v = ia[0]; ia[0] = m.geometry.attributes.position.count + 5; m.geometry.attributes.position.needsUpdate = true; __CACA.scan(); return () => { ia[0] = v; m.geometry.attributes.position.needsUpdate = true; }; });
  await plant('NaN na matriz de uma pessoa', 'instância com NaN', () => { let im = null; G.Realm.scene().traverse(o => { if (!im && o.isInstancedMesh && o.count > 1 && __VIS.byOf(o) === 'people3d.js') im = o; }); const v = im.instanceMatrix.array[16 + 12]; im.instanceMatrix.array[16 + 12] = NaN; __CACA.scan(); return () => { im.instanceMatrix.array[16 + 12] = v; }; });
  // (a whole person — every part of one drawn body, the same instance in every mesh of the people — lifted, then sunk)
  // (someone on dry open ground: the body itself is the first instance of the people's meshes, the walkers drawn whole the
  // ones after it — the ready «cidade» opens in the small hours, with almost everyone asleep indoors: T-036)
  const lift = dy => `() => { const P = G.People3D, S = G.S; const dry = (X, Z) => { const x = Math.floor(X / 4), y = Math.floor(Z / 4); const i = y * G.N + x; return G.W.inb(x, y) && S.type[i] > G.T.RIVER && !S.wall[i] && !S.occ[i]; };
    let k = P.avatar && dry(P.avatar.X, P.avatar.Z) ? 0 : -1; for (let j = 0; j < P.walkers.length && k < 0; j++) { const [X, , Z] = P.walkers[j]; if (dry(X, Z)) k = j + (P.avatar ? 1 : 0); }
    const ms = []; G.Realm.scene().traverse(o => { if (o.isInstancedMesh && o.count === P.count && __VIS.byOf(o) === 'people3d.js') ms.push(o); }); if (k < 0 || (!ms.length && !(G.Body3D && G.Body3D.ready))) throw new Error('ninguém em chão seco para mover');
    const old = ms.map(m => m.instanceMatrix.array[k * 16 + 13]); ms.forEach(m => { m.instanceMatrix.array[k * 16 + 13] += ${dy}; });
    // (the continuous body, where it is drawn so: the same person's row of bones, every bone moved the same)
    const B3 = G.Body3D; let bk = null; if (B3 && B3.ready && B3._buf && P.skin && P.skin() && k < B3.rows) { const buf = B3._buf(), o = k * B3._tw() * 4; bk = []; for (let b = 0; b < B3.bones().length; b++) { bk.push(buf[o + b * 12 + 7]); buf[o + b * 12 + 7] += ${dy}; } }
    __CACA.bodies(); return () => { ms.forEach((m, j) => { m.instanceMatrix.array[k * 16 + 13] = old[j]; }); if (bk) { const buf = B3._buf(), o = k * B3._tw() * 4; bk.forEach((v, b) => { buf[o + b * 12 + 7] = v; }); } }; }`;
  await plant('uma pessoa erguida 2 m', 'flutuando', lift(2));
  await plant('uma pessoa afundada 1,2 m', 'afundado', lift(-1.2));
  await plant('uma pessoa enterrada 4 m', 'enterrado', lift(-4));
  // (a thing that lies on dry land — the stones round the caves' mouths, or the gold the god spills by the body — sunk 6 m:
  // the first of the things' meshes could be the sea's beasts or a stain, which the hunt rightly looks at another way, and
  // the plant passed only on the base's own buried stones — T-038)
  await plant('uma coisa do mundo enterrada', 'coisa enterrada', () => { const onLand = o => o.isInstancedMesh && o.count > 0 && __VIS.byOf(o) === 'things3d.js' && (o.name === 'things:rock' || o.name === 'things:coin' || (!o.name && (o.userData.max === 160 || o.userData.max === 260)));
    let im = null; G.Realm.scene().traverse(o => { if (!im && onLand(o)) im = o; });
    if (!im) { const b = G.Possess.body(); G.Powers.spillGold && G.Powers.spillGold(b.x + 0.6, b.y, 10, 0, 'prova'); __VIS.f(3); G.Realm.scene().traverse(o => { if (!im && onLand(o)) im = o; }); }
    if (!im) throw new Error('nenhuma coisa do mundo em chão seco para enterrar');
    const a = im.instanceMatrix.array; const old = []; for (let k = 0; k < im.count; k++) { old.push(a[k * 16 + 13]); a[k * 16 + 13] -= 6; } __CACA.things(); return () => { for (let k = 0; k < im.count; k++) a[k * 16 + 13] = old[k]; }; });
  await plant('um prédio que sai 3 m da sua caixa', 'prédio fora da caixa', () => { const f = G.Build3D.bounds; const id = [...G.S.buildings.values()].find(b => b.type === 'house' || b.type === 'hut').id; G.Build3D.bounds = b => { const B = f(b); if (B && b.id === id) { B.hi[0] += 3; } return B; }; __CACA.buildings(); return () => { G.Build3D.bounds = f; }; });
  await plant('um prédio que flutua 1 m', 'prédio flutuando', () => { const f = G.Build3D.bounds; const id = [...G.S.buildings.values()].find(b => b.type === 'house' || b.type === 'hut').id; G.Build3D.bounds = b => { const B = f(b); if (B && b.id === id) { B.lo[1] += 1.2; } return B; }; __CACA.buildings(); return () => { G.Build3D.bounds = f; }; });
  await plant('um prédio afundado', 'prédio afundado', () => { const f = G.Build3D.bounds; const id = [...G.S.buildings.values()].find(b => b.type === 'house' || b.type === 'hut').id; G.Build3D.bounds = b => { const B = f(b); if (B && b.id === id) { B.floor = B.ground[0] - 0.5; } return B; }; __CACA.buildings(); return () => { G.Build3D.bounds = f; }; });
  await plant('uma árvore que flutua 1 m', 'árvore flutuando', () => { const f = G.Realm.treeMesh; G.Realm.treeMesh = t => { const g = f(t); g.position.y += 1; return g; }; const b = G.Possess.body(); __CACA.trees(b.x, b.y, 20, 3); return () => { G.Realm.treeMesh = f; }; });
  await plant('uma camada da pilha de texturas cinza', 'cinza', () => { const im = G.Ground3D.tex().image; const n = im.width * im.height * 4; const keep = im.data.slice(0, n); im.data.fill(128, 0, n); __CACA.textures(); return () => { im.data.set(keep, 0); }; });
  await plant('um material com a pilha desligada (uTexOn 0)', 'uTexOn desligado', () => { const r = G.Realm.renderer(); const m = G.Realm.mats().solid; const pr = r.properties.get(m); const u0 = pr.uniforms.uTexOn; pr.uniforms.uTexOn = { value: 0 }; __CACA.textures(); return () => { pr.uniforms.uTexOn = u0; }; });
  await plant('uma textura sem figura', 'textura sem figura', () => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), new THREE.MeshBasicMaterial({ map: new THREE.Texture() })); const st = G.Avatar.state(); m.position.set(st.X + 1, st.Y + 1, st.Z); G.Realm.scene().add(m); __VIS.f(1); __CACA.textures(); return () => { G.Realm.scene().remove(m); m.geometry.dispose(); m.material.dispose(); }; });
  await plant('a câmera dentro de uma casa', 'câmera dentro de algo sólido', () => { const b = [...G.S.buildings.values()].find(q => q.built && q.blocks && (q.type === 'house' || q.type === 'hut')); const cam = G.Realm.camera(); const p = cam.position.clone(); cam.position.set((b.x + b.w / 2) * 4, G.W.hAt(b.x + b.w / 2, b.y + b.h / 2) * 1.5 + 1.2, (b.y + b.h / 2) * 4); cam.updateMatrixWorld(); __CACA.eye(false); return () => { cam.position.copy(p); cam.updateMatrixWorld(); }; });
  await plant('a câmera dentro de uma caixa fechada', 'geometria fechada', () => { const cam = G.Realm.camera(); const m = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), new THREE.MeshLambertMaterial()); m.position.copy(cam.position); G.Realm.scene().add(m); m.updateMatrixWorld(); __CACA.eye(true); return () => { G.Realm.scene().remove(m); m.geometry.dispose(); m.material.dispose(); }; });
  await plant('um quadro preto', 'quadro preto', () => { const r = G.Realm.renderer(); const sc = G.Realm.scene(); const c0 = r.getClearColor(new THREE.Color()).getHex(); const bg = sc.background; sc.visible = false; sc.background = new THREE.Color(0x000000); r.setClearColor(0x000000); const c = __VIS.count(); __CACA.light(c.pix, null); return () => { sc.visible = true; sc.background = bg; r.setClearColor(c0); }; });
  await plant('um quadro de uma cor só', 'chapado', () => { const r = G.Realm.renderer(); const sc = G.Realm.scene(); const c0 = r.getClearColor(new THREE.Color()).getHex(); sc.visible = false; r.setClearColor(0x5a7a9a); const c = __VIS.count(); __CACA.light(c.pix, null); return () => { sc.visible = true; r.setClearColor(c0); }; });
  await plant('um uniforme NaN', 'uniforme de shader com NaN', () => { const r = G.Realm.renderer(); const m = G.Realm.mats().solid; const u = r.properties.get(m).uniforms; u.__prova = { value: NaN }; __CACA.scan(); return () => { delete u.__prova; }; });
  await plant('a luz do sol NaN', 'luz com NaN', () => { let L = null; G.Realm.scene().traverse(o => { if (!L && o.isDirectionalLight) L = o; }); const v = L.intensity; L.intensity = NaN; __CACA.scan(); return () => { L.intensity = v; }; });
  await plant('as sombras ligadas ao contrário do preset', 'sombras ligadas ao contrário', () => { const r = G.Realm.renderer(); const v = r.shadowMap.enabled; r.shadowMap.enabled = !v; __CACA.preset(G.Realm.q); return () => { r.shadowMap.enabled = v; }; });
  await plant('um X.check() que acusa', 'FX3D.check()', () => { const f = G.FX3D.check; G.FX3D.check = () => ['plantado pela prova']; __CACA.modules(); return () => { G.FX3D.check = f; }; });
  await plant('o desenho escrevendo no mundo', 'o desenho mudou o mundo', () => { const f = G.Realm.frame; const S = G.S; G.Realm.frame = function () { S.weather.windA = (S.weather.windA || 0) + 0.25; return f.apply(this, arguments); }; const w0 = S.weather.windA; try { __CACA.still(); } finally { G.Realm.frame = f; } return () => { S.weather.windA = w0; }; });
  // (what flickers or shows through: the land's own triangles round the body copied into the buildings' picture — 2 mm over
  // the ground, then a hand over and under it in turn; people drawn whole one frame and not the next; the cape drawn inside
  // the body; the leaves lit white)
  const onGround = dy => `() => { const st = G.Avatar.state(); const ms = G.Realm.nearOf(st.X, st.Z) || []; const land = ms.find(o => __VIS.who(o).part === 'realm3d.js:perto:chão'); const host = ms.find(o => /perto:prédios$/.test(__VIS.who(o).part));
    if (!land || !host) throw new Error('sem chão ou prédios no pedaço do corpo'); const g = land.geometry, pa = g.attributes.position, ix = g.index; const P = []; const v = new THREE.Vector3();
    for (let t = 0; t + 2 < (ix ? ix.count : pa.count); t += 3) { const tri = []; let near = true; for (let j = 0; j < 3; j++) { v.fromBufferAttribute(pa, ix ? ix.getX(t + j) : t + j).applyMatrix4(land.matrixWorld); if (Math.hypot(v.x - st.X, v.z - st.Z) > 6) near = false; tri.push(v.x, v.y + (${dy})(j), v.z); } if (near) P.push(...tri); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); geo.computeVertexNormals(); const m = new THREE.Mesh(geo, G.Realm.mats().solid); m.matrixAutoUpdate = false; host.parent.add(m); m.updateMatrixWorld();
    __CACA.zfight(st.X, st.Z, 24); return () => { host.parent.remove(m); geo.dispose(); }; }`;
  await plant('o chão copiado 2 mm acima dele mesmo', 'colada no chão', onGround('() => 0.002'));
  await plant('o chão copiado ora acima, ora abaixo dele', 'atravessa uma superfície deitada', onGround('j => (j % 2 ? 0.15 : -0.15)'));
  {
    // (people drawn whole one frame and not the next — the body itself too, so that it holds in the small hours, everyone
    // indoors: the frames of the base first, then the planted ones)
    const r = await page.evaluate(() => {
      __CACA.take(); const base = __CACA.lod(12); __CACA.take();
      const P = G.People3D; const f = P.update; let k = 0;
      P.update = function () { const q = G.Realm.Q(); const n0 = q.npcs, a = P.avatar; if (++k % 2) { q.npcs = 0; P.avatar = null; } try { return f.apply(this, arguments); } finally { q.npcs = n0; P.avatar = a; } };
      let got; try { got = __CACA.lod(12); } finally { P.update = f; } const ks = __CACA.take().map(p => `S${p.sev} ${p.kind}`);
      __VIS.f(1); __CACA.take(); return { base, got, ks };
    }).catch(e => ({ err: e.message.slice(0, 200) }));
    ok('pessoas trocando de desenho a cada quadro', !r.err && r.got.flick > r.base.flick && r.ks.some(k => k.includes('troca de LOD')), r.err || `base: ${r.base.flick} piscando de ${r.base.people} · plantado: ${r.got.flick} de ${r.got.people} · acusou: ${r.ks.join('; ') || 'nada'}`);
  }
  await plant('a capa desenhada por dentro do corpo', 'o corpo atravessa a capa', () => { const B = G.Body3D, D = G.BODYMESH; if (!B || !B.ready || !B._buf || !D || !D.meshes || !D.meshes.capa) throw new Error('NA: sem o corpo contínuo e a capa (body3d.js)');
    const names = Object.keys(D.meshes); const ms = []; G.Realm.scene().traverse(o => { if (o.isMesh && o.geometry && o.geometry.attributes && o.geometry.attributes.aRow && __VIS.byOf(o) === 'body3d.js') ms.push(o); });
    const g = ms[names.indexOf('capa')].geometry; const pa = g.attributes.position.array; const keep = pa.slice(); const ax = D.bind.chest;
    for (let i = 0; i < pa.length; i += 3) { pa[i] = ax[0] + (pa[i] - ax[0]) * 0.55; pa[i + 2] = ax[2] + (pa[i + 2] - ax[2]) * 0.55; }
    // (the body's own row, 0, made to wear it)
    const ra = g.attributes.aRow; const n0 = g.instanceCount; const r0 = ra.array[n0]; ra.array[n0] = 0; g.instanceCount = n0 + 1;
    __CACA.cloth(['capa']); return () => { pa.set(keep); ra.array[n0] = r0; g.instanceCount = n0; }; });
  // (someone drawn with no clothes on the trunk and the hips: the continuous body's own verifier, Body3D.check, must say so)
  await plant('alguém desenhado sem roupa', 'sem roupa', () => { const B = G.Body3D, P = G.People3D; if (!B || !B.ready || typeof B.bare !== 'function') throw new Error('NA: sem o verificador de roupa (Body3D.bare)');
    const f = P.look; P.look = function () { const L = f.apply(this, arguments); if (L && L.out) L.out = Object.assign({}, L.out, { torso: 1, overK: 0, skirt: null, legs: 0 }); return L; };
    try { __VIS.f(1); } finally { P.look = f; } __CACA.modules(); return () => { __VIS.f(1); }; });
  await plant('as folhas acesas de branco', 'folhas estourando em branco', () => { const M = G.Realm.mats(); if (!M.leaf) throw new Error('NA: sem o material das folhas'); const S = G.S; const b = G.Possess.body(); const x0 = b.x, y0 = b.y;
    // (the body taken beside the nearest tree, the eye looking up into its crown, by day)
    const t = [...S.trees.values()].filter(q => q.stage === 'grow' && q.size > 0.6).sort((p, q) => G.dist2(p.x, p.y, x0, y0) - G.dist2(q.x, q.y, x0, y0))[0]; if (!t) throw new Error('NA: nenhuma árvore crescida');
    let at = null; for (const [dx, dy] of [[1.6, 0], [0, 1.6], [-1.6, 0], [0, -1.6], [1.2, 1.2], [-1.2, -1.2]]) if (G.Avatar.place(t.x + dx, t.y + dy)) { at = [t.x + dx, t.y + dy]; break; } if (!at) throw new Error('NA: sem lugar ao pé da árvore');
    const t0 = G.S.time; G.S.time = 0.42; G.Cam3D.OPT.follow = false; G.Cam3D.yaw = Math.atan2(t.y - at[1], t.x - at[0]); G.Cam3D.pitch = -0.35; G.Cam3D.dist = G.Cam3D.cur = 3; __VIS.warm(2); __VIS.f(2);
    const e0 = M.leaf.emissive.clone(); M.leaf.emissive.setRGB(30, 30, 30); __CACA.leaves(null, { folhas: M.leaf });
    return () => { M.leaf.emissive.copy(e0); G.S.time = t0; G.Avatar.place(x0, y0); __VIS.warm(1); }; });
  await plant('um shader que não compila', 'shader que não compila', () => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), new THREE.ShaderMaterial({ vertexShader: 'void main() { gl_Position = vec4(0.0); }', fragmentShader: 'void main() { gl_FragColor = vec4(nao_existe); }' })); const st = G.Avatar.state(); m.position.set(st.X + 1, st.Y + 1, st.Z + 1); G.Realm.scene().add(m); __VIS.f(1); __CACA.programs(); return () => { G.Realm.scene().remove(m); m.geometry.dispose(); m.material.dispose(); }; });
  // (the shader planted above must also have reached the console, where the round sees it)
  ok('o erro do shader planted chega ao console', errs.some(e => /Shader Error|shader error|nao_existe|WebGLProgram/i.test(e)), errs.slice(-2).map(e => e.slice(0, 120)).join(' · ') || 'nada no console');
  // after it all, undone: quiet again
  const after = await page.evaluate(() => { __VIS.f(2); __CACA.scan(); __CACA.bodies(); __CACA.things(); __CACA.eye(true); __CACA.textures(); const c = __VIS.count(); __CACA.light(c.pix, null); return __CACA.take().filter(p => p.sev <= 2).map(p => `S${p.sev} ${p.kind}: ${p.msg}`); });
  ok('tudo desfeito, a caça fica quieta de novo', after.length === 0, after.slice(0, 4).join(' · ') || 'nenhum problema');
  console.log(fails.length ? `PROVA: FALHOU ${fails.length} (${fails.join(', ')})` : 'PROVA: ok');
  await browser.close(); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('caca-prova: ' + (e.stack || e)); process.exit(2); });
