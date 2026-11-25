// pacotes: the libraries of the interiors' models — the furniture (js/movelmesh*.js, arte/blender/moveis.py) and the decoration
// (js/decomesh*.js, arte/blender/deco.py) — in the 16-bit form (the interiors 3, the front X — the F8 of planos/interiores-3.md;
// D-1020 to D-1029). In Node, no browser:
//   node qa/visual/pacotes.js [PASTA_DO_JOGO]     (BASE=commit: the libraries the 16 bits are set beside — by default 5c482ef, the
//                                                 last one of the floats; a commit of the 16 bits too: then every number the same)
//   p1. the 16 bits are the floats of before: every model of BASE's libraries decoded by the game's own reader (G.Mesh3D.geo) from
//       today's files — the same points (the count), the same triangles (the index, number for number), the same parts, the same
//       box (the numbers the file says); each point within a millimetre of before, each normal within a degree, each uv within a
//       millimetre; the same light it gives itself (the colours, byte for byte); the same kind, people, size, level, anchors, how it
//       rests and the broth's level; no model of before missing
// And the packs, in the game in Node (qa/visual/tres-node.js with the libraries' indexes alone — pacotes: false —, the packs let in by
// the proof's own hand, as the page's script tags would):
//   p2. the base is what the shell and the street draw: the leaf of a door of the family «base», in the index — the only models there
//       are the base's —, and in the base only the leaf and the pieces the ready worlds' plans put in a yard; nothing else
//   p3. without the packs, the drawing of today without models: a tavern of the world opened as the game opens it (Build3D.insideTick)
//       — every piece of a pack by the boxes of the FURN, the leaves of its doors by their model (the base), the decoration without the
//       things of the packs —, no error; the packs of its families asked for, once (asked again, not asked twice)
//   p4. the pack comes and the inside is drawn again by itself: the packs let in one at a time — each one more in the look's signature
//       (G.Movel3D.gen) —, and a second of the world later the open tavern drawn again by the game, every piece by its model and its
//       things on its shelves and tables (the same drawing as with every pack in from the start)
//   p5. the pack whose file does not come: a failure where every module's is (G.modErr.Pacotes, the console), its pieces by the boxes,
//       no storm of asking (asked again only after G.Movel3D.RETRY); let in later, drawn by its models
//   p6. a save and a load in the middle: the packs stay in (they are the page's, not the world's), the same drawing before and after
//   p7. a building asks for few packs: every type of building of the ready worlds, the packs its plan's pieces and the things its
//       decoration shows need — the common, the house's where people live in it, its own: three of each library at most; and each of
//       them early, or asked for by the building's type as the world opens (D-1025)
//   p8. what a pack costs: the time to run its file and to read every model of it (G.Mesh3D.geo), in Node
//   p9. (a measure, D-665, D-1023) the meshes of a tavern drawn by instances — a model's part and pattern each — and the ones there
//       would be with the parts of a model in one mesh (and the furniture's half way, the two woods apart)
//   p10. a world opened asks at once for the packs its kinds of building will want (D-1025): the hook scheduled as it opens and run
//       once it is in, the families whose types it has and no other; a new world without them asks for none
//   p11. the hands ask for the pack of what they hold (L-2262): the cup served and the keeper's cloth by the loader — asked for while
//       out, nothing of the model in the hands; with every pack in, the models
//   p12. the yard waits for its pack, and the street is drawn again when it comes (D-1027): a piece of a yard given (planted) a family
//       whose pack is out — by the boxes, its pack asked for —, then the pack in — by its model —: the yard's number (G.Movel3D.yardSig)
//       changes; where Build3D.shellSig carries it (the line for the supervisor), the building's part of its chunk's signature changes
//       too, and a yard's piece may live in a family's pack; where it does not, every piece of a yard with a model is in the base
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..'));
const BASE = process.env.BASE || '5c482ef';
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | pacotes ${name} | ${info}`); if (!c) fails.push(name); };
const few = (a, n = 4) => (a.length ? ': ' + a.slice(0, n).join(' · ') + (a.length > n ? ` … (${a.length})` : '') : '');
const LIBS = ['movelmesh.js', 'decomesh.js'];

// ------------------------------ the libraries, read as the game reads them ------------------------------
// (a context of its own with three.js and the game's reader of the meshes — js/mesh3d.js —, the files run in it)
function context() {
  const ctx = { console, atob: s => Buffer.from(s, 'base64').toString('binary'), Math, Float32Array, Uint8Array, Uint16Array, Uint32Array, Int8Array, Int16Array, Uint8ClampedArray, ArrayBuffer, DataView };
  ctx.window = ctx; ctx.self = ctx; ctx.G = {}; vm.createContext(ctx); return ctx;
}
const js = f => path.join(ROOT, 'js', f);
// (the files of a library: its index, and the packs it names — G.MOVEIS.packs, G.DECO.packs — when it has them)
function libFiles(read, f) {
  const out = [[f, read(f)]]; const c = context(); try { vm.runInContext(out[0][1], c, { filename: f }); } catch (e) { return out; }
  const P = f === 'movelmesh.js' ? c.G.MOVEIS : c.G.DECO;
  for (const k of Object.keys((P && P.packs) || {}).sort()) { const pf = P.packs[k].f.replace(/^js\//, ''); out.push([pf, read(pf)]); }
  return out;
}
// (base64 to a typed array, little-endian)
const arr = (b64, Kind) => { const b = Buffer.from(b64, 'base64'); const u = new Uint8Array(b.length); u.set(b); return new Kind(u.buffer, 0, u.length / Kind.BYTES_PER_ELEMENT); };
const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };

// ------------------------------ p1: the 16 bits are the floats of before ------------------------------
{
  const show = f => cp.execFileSync('git', ['show', `${BASE}:god-of-the-ant-farm/js/${f}`], { cwd: ROOT, maxBuffer: 256 * 1048576, encoding: 'utf8' });
  let base = null; try { base = context(); for (const L of LIBS) for (const [f, s] of libFiles(show, L)) vm.runInContext(s, base, { filename: 'base:' + f }); } catch (e) { base = null; ok('p1 a base', false, `${BASE}: ${e.message.split('\n')[0]}`); }
  const now = context(); vm.runInContext(fs.readFileSync(js('lib/three.min.js'), 'utf8'), now, { filename: 'three.min.js' }); vm.runInContext(fs.readFileSync(js('mesh3d.js'), 'utf8'), now, { filename: 'mesh3d.js' });
  for (const L of LIBS) for (const [f, s] of libFiles(f => fs.readFileSync(js(f), 'utf8'), L)) vm.runInContext(s, now, { filename: f });
  if (base) {
    const B = base.G.MESH3D, N = now.G.MESH3D, M3 = now.G.Mesh3D; const bad = [], lost = []; let n = 0, v2 = 0; const worst = { pos: 0, nor: 0, uv: 0 }; const at = { pos: '', nor: '', uv: '' };
    const META = ['kind', 'civ', 'var', 'w', 'd', 'h', 'lod', 'anc', 'pousa', 'niv'];
    for (const name of Object.keys(B).filter(k => /^(movel|deco|comida|bebida)-/.test(k)).sort()) {
      const b = B[name], d = N[name]; if (!d) { lost.push(name); continue; } n++; if (d.v === 2) v2++;
      const fail = w => bad.push(`${name}: ${w}`);
      if (d.n !== b.n || d.t !== b.t) { fail(`${d.n} pontos e ${d.t} triângulos, antes ${b.n} e ${b.t}`); continue; }
      if (JSON.stringify(d.box) !== JSON.stringify(b.box)) fail(`a caixa ${JSON.stringify(d.box)}, antes ${JSON.stringify(b.box)}`);
      if (JSON.stringify(d.parts) !== JSON.stringify(b.parts)) fail('as partes não são as de antes');
      for (const k of META) if (JSON.stringify(d[k]) !== JSON.stringify(b[k])) fail(`o ${k} não é o de antes`);
      const g = M3.geo(name); if (!g) { fail('não decodifica'); continue; }
      // (before: the floats of the file, decoded as the reader of before did)
      const P0 = arr(b.pos, Float32Array), N0 = arr(b.nor, Int8Array), U0 = b.uv ? arr(b.uv, Float32Array) : null, C0 = b.col ? arr(b.col, Uint8Array) : null, I0 = arr(b.idx, b.i32 ? Uint32Array : Uint16Array);
      const P = g.attributes.position.array, Nn = g.attributes.normal.array, U = g.attributes.uv ? g.attributes.uv.array : null, C = g.attributes.color ? g.attributes.color.array : null, I = g.index.array;
      let dp = 0, dn = 0, du = 0, di = 0, dc = 0;
      for (let i = 0; i < P0.length; i++) dp = Math.max(dp, Math.abs(P[i] - P0[i]));
      for (let i = 0; i < N0.length; i += 3) { const l = Math.hypot(N0[i], N0[i + 1], N0[i + 2]) || 1; const c = (N0[i] * Nn[i] + N0[i + 1] * Nn[i + 1] + N0[i + 2] * Nn[i + 2]) / l; dn = Math.max(dn, Math.acos(Math.max(-1, Math.min(1, c))) * 180 / Math.PI); }
      if (!!U0 !== !!U) fail('o uv: um tem, o outro não'); else if (U0) for (let i = 0; i < U0.length; i++) du = Math.max(du, Math.abs(U[i] - U0[i]));
      if (!!C0 !== !!C) fail('a luz própria: um tem, o outro não'); else if (C0) for (let i = 0; i < C0.length; i++) if (C[i] !== Math.fround(lin(C0[i]))) dc++; // (the reader keeps it in 32 bits)
      if (I.length !== I0.length) di = 1; else for (let i = 0; i < I0.length; i++) if (I[i] !== I0[i]) { di++; break; }
      if (di) fail('os triângulos não são os de antes (o índice)'); if (dc) fail(`${dc} cores que não são as de antes`);
      if (dp > 0.001) fail(`um ponto a ${(dp * 1000).toFixed(3)} mm do de antes`); if (dn > 1) fail(`uma normal a ${dn.toFixed(3)}° da de antes`); if (du > 0.001) fail(`um uv a ${(du * 1000).toFixed(3)} mm do de antes`);
      for (const [k, v] of [['pos', dp], ['nor', dn], ['uv', du]]) if (v > worst[k]) { worst[k] = v; at[k] = name; }
    }
    ok(`p1 os 16 bits são os números de antes (${BASE}): os mesmos pontos, triângulos, partes, caixa, cor e dados; cada ponto a menos de 1 mm, cada normal a menos de 1°, cada uv a menos de 1 mm`,
      n > 300 && !bad.length && !lost.length, `${n} modelos comparados (${v2} na forma de 16 bits); o mais longe: ponto ${(worst.pos * 1000).toFixed(3)} mm (${at.pos}), normal ${worst.nor.toFixed(3)}° (${at.nor}), uv ${(worst.uv * 1000).toFixed(3)} mm (${at.uv})${few(bad)}${lost.length ? '; faltam ' + lost.length + few(lost) : ''}`);
  }
}

// ------------------------------ the packs in the game (p2 to p11) ------------------------------
{
  const T = require(path.join(__dirname, 'tres-node.js'));
  const { G, M, THREE } = T.load({ pacotes: false });
  const MV = G.Movel3D, D = G.Dentro3D, B3 = G.Build3D, In = G.Interiors, M3 = G.Mesh3D; const TL = G.Space.TILE;
  // (the page's script tags in the proof's hand: a file asked for is held until let in — run as the page runs it — or refused)
  const held = []; MV.script = (file, done) => held.push({ file, done });
  const letIn = (n, why) => { let k = 0; while (held.length && k < (n === undefined ? 1e9 : n)) { const h = held.shift(); if (why) { h.done(false); } else { M.run(h.file); h.done(true); } k++; } return k; };
  // (the inside drawn without a graphics card: a scene and an inner material of its own — Build3D opens the buildings as the game does)
  const scene = new THREE.Scene(), MI = new THREE.MeshBasicMaterial(); G.Realm.scene = () => scene; const m0 = G.Realm.mats; G.Realm.mats = () => Object.assign({}, m0 ? m0() : {}, { inner: MI, solid: MI, innerF: MI });
  const meshes = pre => { const o = []; scene.traverse(m => { if (m.name && m.name.startsWith(pre)) o.push(m); }); return o; };
  const RDT = 1 / 30; let FOCUS = null; const tick = n => { for (let k = 0; k < (n || 1); k++) B3.insideTick(RDT, FOCUS); };
  const world = s => { for (let k = 0; k < Math.round(s / 0.1); k++) G.debug.step(0.1); };
  const TAV = ['banquinho', 'mesa-redonda', 'mesa-taverna', 'banco', 'cadeira', 'balcao', 'balcao-alvenaria', 'prateleira-bar', 'anforeira', 'barril', 'lareira', 'forno-barro', 'fogao-comal', 'fogo-comprido', 'estrado-musico', 'cuba', 'pipas', 'lampadario', 'cama', 'cama-casal', 'arca', 'mesa', 'mesa-terreiro', 'talha', 'jarros', 'fogao', 'lar', 'esteira', 'esteira-casal'];
  const drawn = (b, plan) => { const out = B3.interior(plan, b, { fine: true }); let mod = 0, box = 0; for (const it of plan.items) { if (!TAV.includes(it.kind) || (it.form && B3.byForm && B3.byForm(b))) continue; const R = out.item[it.id]; if (R && R[3] !== undefined) mod++; else box++; } return { out, mod, box, leaves: out.leaf.length }; };
  const errs0 = () => Object.keys(G.modErr || {}).length; const planted = []; // (the console lines of the failure the proof plants: p5)
  const S = () => G.S; const LIB = { movel: () => G.MOVEIS, deco: () => G.DECO };
  // ---- p10 (first, nothing asked yet): a world opened asks at once for the packs its kinds of building will want (D-1025) — the hook
  // scheduled as the world opens (the page's timer here in the proof's hand) and run once the world is in: the families whose types the
  // world has, nothing else; every type a family names a building of the game, no early family with types; a world without those
  // kinds of building asks for none
  { const bad = []; const later = []; const st0 = global.setTimeout; global.setTimeout = f => { later.push(f); return 0; };
    try { M.pronto('metropole'); } finally { global.setTimeout = st0; }
    const hook = later.filter(f => f === MV.forWorld); const before = held.length + MV.packs().queue.length;
    if (hook.length !== 1) bad.push(`o mundo aberto agendou ${hook.length} vezes o pedido dos pacotes (uma)`); if (before) bad.push(`${before} pacotes pedidos antes de o mundo estar dentro`);
    const got = hook.length ? hook[0]() : []; const types = new Set([...S().buildings.values()].map(q => q.type)); const want = [];
    for (const lib of ['movel', 'deco']) { const P = LIB[lib](); for (const fam of Object.keys(P.packs).sort()) { const T = P.packs[fam].tipos || [];
        for (const t of T) if (!G.BDEF[t]) bad.push(`${lib}:${fam}: o tipo «${t}» não é um prédio do jogo`); if (T.length && P.packs[fam].cedo) bad.push(`${lib}:${fam}: cedo e com tipos`);
        if (T.some(t => types.has(t))) want.push(lib + ':' + fam); } }
    // (the loader asks one file at a time: the first in the page's hand, the others in its queue)
    const fileOf = k => { const [lib, fam] = k.split(':'); return path.basename(LIB[lib]().packs[fam].f); };
    const files = held.map(h => path.basename(h.file)).concat(MV.packs().queue.map(fileOf)).sort(); const wantF = want.map(fileOf).sort();
    if (!want.length) bad.push('o mundo não tem um prédio de família pedida pelo tipo'); if (JSON.stringify(got) !== JSON.stringify(want)) bad.push(`pediu ${got.join(', ') || 'nada'}, e o mundo quer ${want.join(', ')}`);
    if (JSON.stringify(files) !== JSON.stringify(wantF)) bad.push(`os arquivos pedidos ${files.join(', ')}`);
    M.novo({ seed: 11, type: 'ilha', size: 64, tribes: 1 }); const types2 = [...new Set([...S().buildings.values()].map(q => q.type))].sort(); const none = MV.forWorld();
    if (want.some(k => { const [lib, fam] = k.split(':'); return LIB[lib]().packs[fam].tipos.some(t => types2.includes(t)); })) bad.push(`o mundo novo já tem ${types2.join(', ')} (a prova quer um sem eles)`); else if (none.length) bad.push(`o mundo novo (${types2.join(', ')}) pediu ${none.join(', ')}`);
    ok('p10 o mundo aberto pede na hora os pacotes dos seus tipos de prédio: o pedido agendado ao abrir e feito com o mundo dentro, as famílias dos tipos que ele tem e nenhuma outra; um mundo sem eles não pede nada', !bad.length,
      `a metrópole (${types.size} tipos de prédio): ${got.join(', ')} → ${files.join(', ')}; o mundo novo (${types2.join(', ')}): ${none.length ? none.join(', ') : 'nada'}${few(bad)}`);
    M.pronto('metropole');
  }
  const taverns = () => [...S().buildings.values()].filter(b => b.type === 'taverna' && b.built && In.plan(b) && In.plan(b).ok).sort((a, c) => a.id - c.id);
  const b = taverns().find(t => G.Taverna.keeperOf(t)) || taverns()[0]; const plan = G.Space.planNow(b);
  const fams = lib => Object.keys((lib === 'movel' ? G.MOVEIS : G.DECO).packs).sort();

  // ---- p2: the base is what the shell and the street draw (whether a piece of a yard may be out of it is the p12's)
  const YARD = new Set(); let YARD_AT = null; // (the kinds of the pieces of the ready worlds' yards; the first building with one of a model: [world, id, kind])
  { const bad = [];
    for (const w of ['metropole', 'mundial', 'mega']) { M.pronto(w); for (const q of [...S().buildings.values()].sort((a, c) => a.id - c.id)) { if (!q.built || !In.has(q)) continue; const p = G.Space.planNow(q); if (!p || !p.items) continue;
      for (const it of p.items) if (it.yard) { YARD.add(it.kind); if (!YARD_AT && G.MOVEIS.of[it.kind]) YARD_AT = [w, q.id, it.kind]; } } }
    const P = G.MOVEIS; const base = Object.keys(P.of).filter(k => P.of[k] === 'base').sort();
    if (P.of.folha !== 'base') bad.push(`a folha da porta na família «${P.of.folha}»`);
    for (const k of base) if (k !== 'folha' && !YARD.has(k)) bad.push(`${k} na base, sem ser da casca nem de um quintal`);
    const inIdx = Object.keys(G.MESH3D).filter(n => /^movel-/.test(n)); for (const n of inIdx) if (P.of[G.MESH3D[n].kind] !== 'base') bad.push(`${n} no índice, sem ser da base`);
    ok('p2 a base é o que a casca e a rua desenham: a folha da porta no índice, e na base só ela e as peças de um quintal — nada mais', !bad.length && inIdx.length > 0, `a base: ${base.join(', ')} (${inIdx.length} modelos no índice); os quintais dos mundos prontos: ${[...YARD].sort().join(', ')}${few(bad)}`);
    M.pronto('metropole');
  }
  const b1 = S().buildings.get(b.id); const plan1 = G.Space.planNow(b1);
  // ---- p11: the hands ask for the pack of what they hold (L-2262) — the cup served to a guest (G.Dentro3D.served) and the keeper's cloth
  // over his shoulder (G.Dentro3D.ombro) reach their models by the loader, as every thing of the decoration does: their packs asked for,
  // nothing in the hands while they are out (the catalogue's own thing drawn, as before), the models once they are in. What the world
  // serves and who wears the cloth are the proof's hand on the two pure readings (G.Atmos.serving, the ombro of G.Atmos.within)
  const hands = (b, kp) => { const calls = []; const At = G.Atmos, pk0 = MV.pacote, sv0 = At.serving, wi0 = At.within; const guest = { id: kp.id + 1e6 };
    MV.pacote = function (lib, fam) { calls.push(lib + ':' + fam); return pk0.apply(this, arguments); };
    At.serving = v => (v === guest ? { b: b.id, k: 'cerveja', st: 0, fresco: true, quente: false, t0: 0, why: 'a prova' } : sv0(v));
    At.within = q => { const W = wi0(q); return q === b ? Object.assign({}, W, { ombro: { id: kp.id, why: 'a prova' } }) : W; };
    try { const s = D.served(guest), o = D.ombro({ id: kp.id, job: b.id }); return { calls, s: s ? s.name + ' ' + s.parts.length : '-', o: o ? o.name + ' ' + o.parts.length : '-', ns: s ? s.parts.length : -1, no: o ? o.parts.length : -1 }; }
    finally { MV.pacote = pk0; At.serving = sv0; At.within = wi0; } };
  const kp1 = G.Taverna.keeperOf(b1);
  { const bad = []; const h = kp1 ? hands(b1, kp1) : null;
    if (!h) bad.push('a taverna sem taverneiro'); else { const fs0 = MV.familyOf('deco', 'bebida-cerveja'), fo = MV.familyOf('deco', 'pano-ombro');
      if (!h.calls.includes('deco:' + fs0)) bad.push(`a caneca servida não pediu o pacote «${fs0}» (pediu: ${h.calls.join(', ') || 'nada'})`); if (!h.calls.includes('deco:' + fo)) bad.push(`o pano do ombro não pediu o pacote «${fo}»`);
      if (h.ns !== 0 || h.no !== 0) bad.push(`com os pacotes fora, as mãos com ${h.ns} e ${h.no} partes`); }
    ok('p11 as mãos pedem o pacote do que seguram: a caneca servida e o pano do ombro pelo carregador (L-2262); fora o pacote, nada do modelo', !bad.length, h ? `pedidos: ${h.calls.join(', ')}; ${h.s} partes, ${h.o} partes${few(bad)}` : few(bad));
  }
  // ---- p3: without the packs, the drawing of today without models
  { const bad = []; const sig0 = MV.look(b1).sig; const d0 = drawn(b1, plan1); const dp = D.plan(b1, plan1, true);
    FOCUS = { X: (b1.x + b1.w / 2) * TL, Z: (b1.y + b1.h + 0.6) * TL }; tick(4);
    const open = B3.opened().find(q => q.id === b1.id); const mv = meshes('movel:'), dt = meshes('dentro:');
    const st = MV.packs(); const askedM = fams('movel').filter(f => st.movel[f] === 'pedido' || held.some(h => h.file.endsWith(`movelmesh-${f}.js`))), askedD = fams('deco').filter(f => st.deco[f] === 'pedido' || held.some(h => h.file.endsWith(`decomesh-${f}.js`)));
    const again = MV.want('comum'); const before = held.length + st.queue.length; MV.want('comum'); MV.pick('banco', 'romano', 1.4, 0.35, 0.45); const after = held.length + MV.packs().queue.length;
    if (d0.mod) bad.push(`${d0.mod} peças desenhadas pelo modelo sem o pacote`); if (!d0.box) bad.push('nenhuma peça pelas caixas');
    if (!d0.leaves) bad.push('nenhuma folha de porta'); if (dp.list.length) bad.push(`${dp.list.length} coisas da decoração sem o pacote delas`);
    if (!open) bad.push('o Build3D não abriu a taverna'); if (mv.length) bad.push(`${mv.length} malhas de móvel modelado sem pacote`);
    if (!askedM.length || !askedD.length) bad.push(`os pacotes não foram pedidos (${askedM.join(',') || '-'} / ${askedD.join(',') || '-'})`);
    if (again || after !== before) bad.push('pedir de novo pediu outra vez'); if (errs0()) bad.push('erro de módulo: ' + JSON.stringify(G.modErr));
    ok('p3 sem os pacotes, o desenho de hoje sem modelo: as peças pelas caixas, as folhas pelo modelo da base, a decoração sem as coisas dos pacotes; os pacotes pedidos uma vez', !bad.length,
      `taverna#${b1.id} (${MV.look(b1).civ}): ${d0.box} peças pelas caixas, ${d0.leaves} folhas; ${dp.list.length} coisas; aberta pelo Build3D com ${mv.length} malhas de móvel e ${dt.length} de coisa; pedidos ${askedM.join(', ')} | ${askedD.join(', ')} (assinatura ${sig0})${few(bad)}`);
  }
  // ---- p5 (first, while the packs are out): a pack whose file does not come
  { const bad = []; const log0 = M.erros().console.length;
    // (the next file asked for refused — the page's script that did not open)
    const k0 = held[0] ? held[0].file : null; letIn(1, 'falhou'); const st = MV.packs(); const which = Object.entries(st.movel).concat(Object.entries(st.deco)).filter(([, v]) => v === 'falhou').map(([f]) => f);
    const errN = (G.modErr || {}).Pacotes | 0; const said = M.erros().console.slice(log0).filter(l => /\[Pacotes\]/.test(l));
    const fam = k0 && (k0.match(/(?:movelmesh|decomesh)-([\w-]+)\.js$/) || [])[1]; const lib = k0 && /movelmesh/.test(k0) ? 'movel' : 'deco';
    const n0 = held.length + MV.packs().queue.length; MV.pacote(lib, fam); MV.pacote(lib, fam); const n1 = held.length + MV.packs().queue.length;
    let threw = null; try { B3.interior(plan1, b1, { fine: true }); D.plan(b1, plan1, true); } catch (e) { threw = e.message; }
    if (!k0 || errN !== 1 || said.length !== 1 || which.length !== 1) bad.push(`a falha não foi contada uma vez (${errN} em G.modErr, ${said.length} no console, ${which.join(',')})`);
    if (n1 !== n0) bad.push('a falha pediu de novo antes do tempo'); if (threw) bad.push('o desenho quebrou: ' + threw);
    // (let in later: asked again once its time has passed)
    const R0 = MV.RETRY; MV.RETRY = 0; MV.pacote(lib, fam); MV.RETRY = R0; const queued = held.some(h => h.file === k0) || MV.packs().queue.includes(lib + ':' + fam);
    if (!queued) bad.push('passado o tempo, o pacote não foi pedido de novo');
    ok('p5 o pacote que não vem: uma falha contada (G.modErr, o console), as peças pelas caixas, nenhum pedido em cima de pedido; passado o tempo, pedido de novo', !bad.length, `${k0}: ${errN} falha, «${(said[0] || '').slice(0, 90)}»${few(bad)}`);
    // (the planted failure is the proof's own: taken from what the end counts)
    delete G.modErr.Pacotes; planted.push(...said.map((_, i) => log0 + i));
  }
  // ---- p4: the pack comes and the inside is drawn again by itself
  { const bad = []; const steps = []; let g0 = MV.gen(), s0 = MV.look(b1).sig;
    while (held.length) { const f = held[0].file; letIn(1); const g1 = MV.gen(), s1 = MV.look(b1).sig; steps.push(`${path.basename(f)} ${g1 > g0 && s1 !== s0 ? 'nova assinatura' : 'MESMA ASSINATURA'}`); if (!(g1 > g0) || s1 === s0) bad.push(`${f}: a assinatura não mudou`); g0 = g1; s0 = s1; }
    // (every pack asked for in — the tavern's families: the others nobody asked for stay out, as on the page)
    const st = MV.packs(); const out = fams('movel').filter(f => st.movel[f] === 'pedido' || st.movel[f] === 'falhou').concat(fams('deco').filter(f => st.deco[f] === 'pedido' || st.deco[f] === 'falhou'));
    if (out.length || st.queue.length || st.busy) bad.push(`pacotes pedidos que não entraram: ${out.join(', ')} ${st.queue.join(',')} ${st.busy || ''}`);
    // (a second of the world, and the game draws the open tavern again — its furniture by its models, its things on it)
    for (let k = 0; k < 14 && !meshes('movel:').length; k++) { world(0.1); tick(1); } tick(3);
    const mv = meshes('movel:'), dt = meshes('dentro:'); const d1 = drawn(b1, plan1); const dp = D.plan(b1, plan1, true);
    if (!mv.length) bad.push('o Build3D não desenhou de novo os móveis pelo modelo'); if (!dt.length) bad.push('nem as coisas'); if (d1.box) bad.push(`${d1.box} peças ainda pelas caixas`);
    if (!dp.list.length) bad.push('a decoração continua sem as coisas');
    ok('p4 o pacote chega e o interior se refaz sozinho: cada pacote uma assinatura nova; um segundo do mundo depois, a taverna aberta desenhada de novo pelo jogo, cada peça pelo modelo e as coisas nela', !bad.length,
      `${steps.join(' · ')}; depois: ${d1.mod} peças pelo modelo, ${mv.length} malhas de móvel e ${dt.length} de coisa no Build3D, ${dp.list.length} coisas${few(bad)}`);
  }
  // ---- p6: a save and a load in the middle — the world opened again first, as the m6 of moveis.js does (the wear of a building reads
  // the town's portrait of the day, which a load does not keep: the world run a while and then loaded is a little cleaner until its
  // town's next day — the atmos.js's careOf, not a pack's)
  { const sig = o => JSON.stringify(o.inst.map(q => [q.name, q.m.map(v => +v.toFixed(5)), q.parts])) + '|' + Object.keys(o.item).length;
    const in0 = JSON.stringify(MV.packs()); M.pronto('metropole'); const bA = S().buildings.get(b1.id); const pA = G.Space.planNow(bA);
    const s0 = sig(B3.interior(pA, bA, { fine: true })), g0 = MV.gen(), n0 = D.plan(bA, pA, true).list.length;
    M.salvarCarregar(); const b2 = S().buildings.get(b1.id); const p2 = G.Space.planNow(b2); const s1 = sig(B3.interior(p2, b2, { fine: true })), n1 = D.plan(b2, p2, true).list.length;
    const same = JSON.stringify(MV.packs()) === in0;
    ok('p6 um save e um load no meio: os pacotes ficam (são da página, não do mundo), o mesmo desenho antes e depois', s0 === s1 && MV.gen() === g0 && same && n0 === n1 && n0 > 0, `os móveis ${s0 === s1 ? 'iguais' : 'OUTROS'}, ${n0} → ${n1} coisas, os pacotes ${same ? 'os mesmos' : 'OUTROS'} (${MV.gen()} chegaram)`);
  }
  // ---- p7: a building asks for few packs (every pack let in first: a piece is counted where its model draws it)
  { const per = {}; const bad = []; const late = new Set(); MV.wantAll(); letIn();
    for (const w of ['metropole', 'mundial']) { M.pronto(w); for (const q of S().buildings.values()) { if (!q.built || !In.has(q)) continue; const p = G.Space.planNow(q); if (!p || !p.items) continue;
        const look = MV.look(q); const fm = new Set(), fd = new Set();
        for (const it of p.items) { const fam = MV.familyOf('movel', it.kind); if (fam && fam !== 'base' && MV.pick(it.kind, look.civ, it.w, it.d, it.h, look.rico >= 2 ? 'rico' : '')) fm.add(fam); }
        for (const t of D.plan(q, p, true).list) { const fam = MV.familyOf('deco', t.k); if (fam) fd.add(fam); }
        const r = per[q.type] || (per[q.type] = { n: 0, m: new Set(), d: new Set(), mx: 0 }); r.n++; for (const f of fm) r.m.add(f); for (const f of fd) r.d.add(f); r.mx = Math.max(r.mx, fm.size, fd.size);
        if (fm.size > 3 || fd.size > 3) bad.push(`${q.type}#${q.id}: ${[...fm].join('+')} | ${[...fd].join('+')}`);
        // (and each of them early, or asked for as the world opens by the building's type — D-1025: never first asked by the drawing)
        for (const [lib, set] of [['movel', fm], ['deco', fd]]) for (const fam of set) { const pk = LIB[lib]().packs[fam]; if (!pk.cedo && !(pk.tipos || []).includes(q.type)) late.add(`${q.type} → ${lib}:${fam}`); } } }
    const rows = Object.keys(per).sort().filter(t => per[t].m.size || per[t].d.size).map(t => `${t} ${[...per[t].m].sort().join('+') || '-'} | ${[...per[t].d].sort().join('+') || '-'}`);
    for (const l of late) bad.push(`${l}: nem cedo nem pedido pelo tipo (arte/blender/pacotes.py TIPOS)`);
    ok('p7 cada prédio pede poucos pacotes: o comum, o da casa onde alguém mora nele, o seu — três de cada biblioteca, no máximo; e cada um cedo ou pedido pelo tipo do prédio ao abrir o mundo', !bad.length && rows.length > 3, `${rows.join(' · ')}${few(bad)}`);
  }
  // ---- p11 (again, every pack in): the hands hold the models
  { M.pronto('metropole'); const b2 = S().buildings.get(b1.id); const k2 = b2 && G.Taverna.keeperOf(b2); const h = k2 ? hands(b2, k2) : null;
    ok('p11 com os pacotes dentro, as mãos seguram os modelos: a caneca servida e o pano do ombro com as suas partes', !!h && h.ns > 0 && h.no > 0, h ? `${h.s} partes, ${h.o} partes` : 'a taverna sem taverneiro'); }
  // ---- p8: what a pack costs (in Node: the file run, every model of it read)
  { const ms = []; const bad = [];
    for (const lib of ['movel', 'deco']) { const P = lib === 'movel' ? G.MOVEIS : G.DECO; for (const fam of fams(lib)) { const f = P.packs[fam].f; const text = fs.readFileSync(path.join(ROOT, f), 'utf8'); const kb = Buffer.byteLength(text) / 1024;
        const t0 = process.hrtime.bigint(); vm.runInNewContext(text, { window: { G: {} } }, { filename: f }); const t1 = process.hrtime.bigint();
        const names = [...text.matchAll(/^ {2}M\["([^"]+)"\] = /gm)].map(m => m[1]); const t2 = process.hrtime.bigint();
        // (each model read again under a name of its own — the reader keeps what it read —, as the first drawing of it reads it)
        for (const n of names) { G.MESH3D['p8/' + n] = G.MESH3D[n]; M3.geo('p8/' + n); delete G.MESH3D['p8/' + n]; } const t3 = process.hrtime.bigint();
        const run = Number(t1 - t0) / 1e6, dec = Number(t3 - t2) / 1e6; ms.push(`${path.basename(f)} ${kb.toFixed(0)} KB: ${run.toFixed(0)} ms o arquivo, ${dec.toFixed(0)} ms os ${names.length} modelos`); if (run > 3000) bad.push(`${f}: ${run.toFixed(0)} ms`); } }
    ok('p8 o que um pacote custa (em Node: o arquivo rodado, cada modelo dele lido pelo G.Mesh3D)', !bad.length, ms.join(' · ') + few(bad));
  }
  // ---- p9: (a measure, D-665, D-1023) the meshes of a tavern by instances, and with the parts of a model in one mesh — and, for the
  // furniture, the half way that three.js's one colour an instance allows without a shader of its own: the two woods apart (their tones
  // are the piece's own, each of its id), every other part of a model in one mesh with its colour in its points (the building's)
  { M.pronto('metropole'); const rows = []; let mx = [0, 0, 0, 0, 0];
    for (const t of taverns()) { const p = G.Space.planNow(t); const out = B3.interior(p, t, { fine: true }); const gs = B3.instGroups(out, 0); const models = new Set(out.inst.map(q => q.name)).size;
      const by = new Map(); for (const q of out.inst) { const s = by.get(q.name) || new Set(); for (const [pt] of q.parts) s.add(pt === 'madeira' || pt === 'madeira2' ? pt : 'resto'); by.set(q.name, s); }
      const half = [...by.values()].reduce((n, s) => n + s.size, 0);
      const dp = D.groupsOf(D.plan(t, p, true), t, [0, 0, 0], 0); const things = new Set(dp.map(g => g.name)).size;
      rows.push(`#${t.id} ${gs.length}+${dp.length} → ${models}+${things} (os móveis a meio caminho: ${half})`); mx = [Math.max(mx[0], gs.length + dp.length), Math.max(mx[1], models + things), Math.max(mx[2], gs.length), Math.max(mx[3], half), Math.max(mx[4], models)]; }
    ok('p9 (medida, D-665, D-1023) as malhas de uma taverna — os móveis + as coisas, uma por modelo, parte e padrão — e as que seriam com as partes de um modelo numa malha', true, `${rows.join(' · ')}; no máximo ${mx[0]} → ${mx[1]}; só os móveis: ${mx[2]} → ${mx[4]} (a meio caminho, sem sombreador novo: ${mx[3]})`);
  }
  // ---- p12: the yard waits for its pack, and the street is drawn again when it comes (D-1027) — a piece of a yard is drawn into the
  // street's chunk, drawn again only when its signature changes: G.Movel3D.yardSig, the number of its packs, changes when one comes in
  // (planted here: a yard's kind given a family whose pack is out — the file held in the proof's hand —, then let in as its file would
  // say so); with that number in Build3D.shellSig (the line for the supervisor) the chunk's signature changes too, and a piece of a
  // yard may be in a family's pack; without it, every piece of a yard with a model is in the base
  { const bad = []; const P = G.MOVEIS; let q0 = null, k0 = null, line = false, info = '';
    if (YARD_AT) { M.pronto(YARD_AT[0]); q0 = S().buildings.get(YARD_AT[1]); k0 = YARD_AT[2]; if (q0) G.Space.planNow(q0); }
    const Sh0 = q0 && B3.shellOf(q0); if (!Sh0 || !(Sh0.yard || []).some(t => t.kind === k0)) { bad.push(`nenhum prédio dos mundos prontos com uma peça de quintal com modelo na casca (${YARD_AT ? YARD_AT.join(' ') : '-'})`); q0 = null; }
    if (q0) { const Sh = Sh0, look = MV.look(q0), it = Sh.yard.find(t => t.kind === k0), fam0 = P.of[k0], FAM = 'p12';
      // (the piece as the street draws it: its rectangle across and deep by its turn — Build3D's shellYard)
      const r = it.r, side = Math.abs(Math.sin(it.rot || 0)) > 0.5, w = side ? r[3] - r[1] : r[2] - r[0], d = side ? r[2] - r[0] : r[3] - r[1];
      const y0 = MV.yardSig(Sh.yard); P.of[k0] = FAM; P.packs[FAM] = { f: 'js/movelmesh-p12.js', n: 0 };
      // (the building's part of its chunk's signature — Build3D.sig over its own lot: what the street compares to draw it again)
      const cs = () => B3.sig(q0.x, q0.y, 1);
      try {
        const h1 = B3.shellSig(q0), c1 = cs(), pk0 = MV.pick(k0, look.civ, w, d, it.h, look.rico >= 2 ? 'rico' : ''), y1 = MV.yardSig(Sh.yard); const asked = held.some(h => h.file.endsWith('movelmesh-p12.js'));
        (G.PACOTES = G.PACOTES || {})['movel:' + FAM] = 1; MV.got('movel', FAM); const i = held.findIndex(h => h.file.endsWith('movelmesh-p12.js')); if (i >= 0) held.splice(i, 1)[0].done(true);
        const pk1 = MV.pick(k0, look.civ, w, d, it.h, look.rico >= 2 ? 'rico' : ''), y2 = MV.yardSig(Sh.yard), h2 = B3.shellSig(q0), c2 = cs();
        if (pk0) bad.push('a peça do quintal pelo modelo com o pacote fora'); if (!asked) bad.push('a peça do quintal não pediu o seu pacote'); if (!pk1) bad.push('a peça do quintal sem o modelo com o pacote dentro');
        if (y1 === y2) bad.push('o número do quintal não mudou quando o pacote chegou');
        line = h1 !== h2; if (line && c1 === c2) bad.push('o Build3D.shellSig mudou e a assinatura do pedaço da rua não');
        info = `${q0.type}#${q0.id} (${k0}): o número do quintal ${y0} → ${y1} (o pacote fora) → ${y2} (dentro); o Build3D.shellSig ${line ? `muda com ele, e o pedaço da rua ${c1 !== c2 ? 'também' : 'NÃO'}` : 'não o leva (a linha do D-1027, do supervisor)'}`;
      } finally { P.of[k0] = fam0; delete P.packs[FAM]; delete G.PACOTES['movel:' + FAM]; }
    }
    // (without the line, nothing draws the street again when a pack comes: every piece of a yard with a model in the base)
    if (!line) for (const k of [...YARD].sort()) if (P.of[k] && P.of[k] !== 'base') bad.push(`${k} (de um quintal) na família «${P.of[k]}», e a rua não se refaz quando o pacote chega`);
    ok('p12 o quintal espera o seu pacote e a rua se refaz quando ele chega (D-1027): o número do quintal muda com o pacote; sem ele no Build3D.shellSig, toda peça de quintal com modelo na base', !bad.length,
      `${info}; as peças de quintal com modelo: ${[...YARD].filter(k => P.of[k]).sort().join(', ') || '-'}${few(bad)}`);
  }
  const E = M.erros(); const con = E.console.filter((l, i) => !planted.includes(i));
  ok('sem erro de módulo nem aviso no console (fora a falha plantada da p5)', !Object.keys(E.mod).length && !con.length, JSON.stringify(E.mod).slice(0, 200) + ' ' + con.slice(0, 3).join(' | '));
}

for (const f of fails) console.log('FALHA: ' + f);
console.log(fails.length ? `FALHOU: ${fails.length}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
