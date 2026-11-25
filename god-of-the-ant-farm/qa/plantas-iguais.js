// plantas-iguais: a impressão digital de todas as plantas — a prova de que uma mudança na gramática (o motor, uma receita, uma
// peça do catálogo) refaz só as plantas dos tipos que ela diz e deixa as dos outros iguais byte a byte (F13, D-990). A planta é
// função do registro: o mesmo registro e a mesma gramática, a mesma planta; mudou a planta de um tipo, a versão dele sobe
// (In.VERSION_T) e o catálogo dele se refaz — esta prova diz quais mudaram.
//   node qa/plantas-iguais.js grava SAIDA.json           cada prédio dos mundos prontos (MUNDOS, cidade,metropole,mega se não
//                                                        dito): a casca pedida sozinha, a planta inteira, a chave; as linhas do
//                                                        catálogo (js/int-catalogo.js, como o jogo as lê); e as plantas das
//                                                        provas do catálogo dos tipos de TIPOS (taverna se não dito; TIPOS=- nenhum)
//   node qa/plantas-iguais.js compara ANTES.json [DEPOIS.json]   o antes e o depois (sem DEPOIS, as plantas de agora): por tipo,
//                                                        quantas iguais e quantas mudaram. MUDOU=forja,… os tipos que podem mudar;
//                                                        os outros iguais byte a byte, ou FALHOU. CHAVES=1: a chave da planta
//                                                        também (uma versão subida muda a chave do tipo e só dele)
//   node qa/plantas-iguais.js sobe [tipo]                a versão de um tipo sobe (forja se não dito; só neste processo, nada
//                                                        gravado no jogo): só as plantas dele com a chave nova, só as linhas dele
//                                                        do catálogo postas de lado e refeitas (as dos outros iguais), só os
//                                                        registros dele julgados ao abrir um save de antes; as plantas de todos
//                                                        iguais byte a byte (≈ 1 min nos três mundos)
//   (o antes numa cópia do jogo de antes: git worktree add PASTA COMMIT; node PASTA/qa/plantas-iguais.js grava … — a prova é a
//   mesma nos dois lados, pois só lê as portas da planta: In.plan, In.shellOf, In.keyOf, In.makeFam)
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const M = require('./nodemundo.js');
const G = M.load({});
const In = G.Interiors;
const args = process.argv.slice(2); const cmd = args[0] || '';
const MUNDOS = (process.env.MUNDOS || 'cidade,metropole,mega').split(',').filter(Boolean);
const TIPOS = process.env.TIPOS === '-' ? [] : (process.env.TIPOS || 'taverna').split(',').filter(Boolean);
const sha = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 16);
// (a plan as JSON, the typed arrays — the grid, the reach, the heights — by their bytes; the cache's own key left out: the
// version is in it, and a version raised changes the key of its type — CHAVES compares it apart)
const canon = o => JSON.stringify(o, (k, v) => (k === 'key' ? undefined : ArrayBuffer.isView(v) ? 'B:' + crypto.createHash('sha1').update(Buffer.from(v.buffer, v.byteOffset, v.byteLength)).digest('hex') : v));
// (the parts of a plan, each its own print: what changed, said by part)
const PARTS = ['shell', 'levels', 'walls', 'holes', 'doors', 'rooms', 'stairs', 'items', 'grid', 'errs'];
const printOf = p => { const o = { h: sha(canon(p)) }; if (p) for (const k of PARTS) o[k] = sha(canon(p[k] === undefined ? null : p[k])); return o; };
const clock = () => Number(process.hrtime.bigint() / 1000000n);
// the catalogue as the game reads it: each key's table, family by family (1, or why it is not laid out), and the version of
// each type in the file (the grammar each line was made by)
function catalogue() {
  const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'int-catalogo.js'), 'utf8');
  const m = /addProbed\((\d+), (\{[\s\S]*\})\);/.exec(src); if (!m) return { ver: null, rows: {}, vers: {} };
  const o = JSON.parse(m[2]); const rows = {};
  for (const k in o.keys) { const t = k.split('|')[0]; const fams = In.TYPES[t] ? In.TYPES[t].fams : []; const tab = {}; o.keys[k].forEach((v, q) => { tab[fams[q] || '#' + q] = v === 1 ? 1 : o.msgs[v - 2]; }); rows[k] = sha(JSON.stringify([o.fams[t], tab])); }
  return { ver: +m[1], rows, vers: o.vers || {} };
}
// (the probes of a key, as the catalogue lays them: qa/catalogo.js compute — each family of the type on each probe lot)
const partsOfKey = k => { const q = k.split('|'); const n = /^n\d+$/.test(q[q.length - 1]) ? +q.pop().slice(1) : 0; return [q[0], q[1], +q[2], +q[3], q[4] || '', n]; };
function probes(keys) {
  const out = {}; const PS = ['S', 'E', 'W', 'N'];
  for (const k of keys) {
    const [t, c, hot, wb, y, n] = partsOfKey(k); if (!In.TYPES[t]) continue;
    const rec = { v: 1, f: '', r: 0, t, u: In.TYPES[t].use, s: 'S', o: 0, c, e: 3, k: 'ae', cl: hot ? 'q' : 't', fl: 0, d: y === 'c' ? 3 : 1, w: wb, pw: 0, h: [], m: 0, fx: [], dr: {} }; if (n) rec.n = n;
    const side = rec.n || (G.BDEF[t] || {}).w || 1;
    for (const f of In.TYPES[t].fams) for (let q = 0; q < In.PROBES.length; q++) {
      const pb = { id: In.PROBES[q], type: t, x: 8, y: 8, w: side, h: side }; const p = In.makeFam(pb, Object.assign({}, rec, { f, s: PS[q % 4] }), f);
      out[`${k}/${f}/${q}`] = { t, h: sha(canon(p)) };
    }
  }
  return out;
}
// the buildings of the world open now, each: its record, the shell asked alone first (the 3D's from afar, by the shells), then
// the whole plan, its key
function worldPrints() {
  In.uncache(); const S = G.S; const W = {}; const list = [...S.buildings.values()].filter(b => b.ip && In.TYPES[b.ip.t]).sort((a, b) => a.id - b.id);
  for (const b of list) W[b.id] = { t: b.ip.t, type: b.type, rec: sha(JSON.stringify(b.ip)), casca: sha(canon(In.shellOf(b))) };
  In.uncache();
  for (const b of list) { const p = In.plan(b); const e = W[b.id]; Object.assign(e, printOf(p)); e.key = In.keyOf(b); e.ok = p && p.ok ? 1 : 0; }
  return W;
}
// everything: each ready world's buildings, the catalogue's lines and the probes of TIPOS
function record() {
  const out = { quando: new Date().toISOString(), versao: In.VERSION, versaoT: In.VERSION_T ? Object.assign({}, In.VERSION_T) : {}, mundos: {}, cat: catalogue(), sondas: {} };
  for (const w of MUNDOS) {
    const t0 = clock(); M.pronto(w); out.mundos[w] = worldPrints();
    console.log(`  ${w}: ${Object.keys(out.mundos[w]).length} prédios com planta (${((clock() - t0) / 1000).toFixed(1)} s)`);
  }
  if (TIPOS.length) { const t0 = clock(); const keys = Object.keys(out.cat.rows).filter(k => TIPOS.includes(k.split('|')[0])).sort(); out.sondas = probes(keys); console.log(`  as provas do catálogo de ${TIPOS.join(', ')}: ${keys.length} chaves, ${Object.keys(out.sondas).length} plantas (${((clock() - t0) / 1000).toFixed(1)} s)`); }
  return out;
}
function compare(A, B) {
  const MUDOU = (process.env.MUDOU || '').split(',').filter(Boolean); const bad = []; const by = {}; const note = (t, same, what) => { const e = by[t] || (by[t] = { iguais: 0, mudaram: 0, ex: [] }); if (same) e.iguais++; else { e.mudaram++; if (e.ex.length < 3) e.ex.push(what); } };
  // (the worlds both have — the one recorded and the one made now, of MUNDOS —, and the probes of the types both have)
  const ws = Object.keys(A.mundos).filter(w => B.mundos[w]); const pt = k => k.split('|')[0];
  const sA = new Set(Object.keys(A.sondas || {}).map(pt)), sB = new Set(Object.keys(B.sondas || {}).map(pt));
  for (const w of ws) {
    const a = A.mundos[w], b = B.mundos[w];
    for (const id of new Set(Object.keys(a).concat(Object.keys(b)))) {
      const x = a[id], y = b[id]; const t = (x || y).t;
      if (!x || !y) { note(t, false, `${w}#${id} ${x ? 'sumiu' : 'novo'}`); continue; }
      const diff = []; if (x.rec !== y.rec) diff.push('o registro'); if (x.casca !== y.casca) diff.push('a casca sozinha'); if (x.h !== y.h) diff.push('a planta (' + PARTS.filter(k => x[k] !== y[k]).join(', ') + ')'); if (process.env.CHAVES && x.key !== y.key) diff.push(`a chave ${x.key} → ${y.key}`);
      note(t, !diff.length, `${w}#${id} ${t}: ${diff.join(', ')}`);
    }
  }
  const cat = {}; const cnote = (t, same, k) => { const e = cat[t] || (cat[t] = { iguais: 0, mudaram: 0, ex: [] }); if (same) e.iguais++; else { e.mudaram++; if (e.ex.length < 2) e.ex.push(k); } };
  for (const k of new Set(Object.keys(A.cat.rows).concat(Object.keys(B.cat.rows)))) cnote(k.split('|')[0], A.cat.rows[k] === B.cat.rows[k], k);
  const son = {}; for (const k of new Set(Object.keys(A.sondas || {}).concat(Object.keys(B.sondas || {})))) { if (!sA.has(pt(k)) || !sB.has(pt(k))) continue; const x = (A.sondas || {})[k], y = (B.sondas || {})[k]; const t = (x || y).t; const e = son[t] || (son[t] = { iguais: 0, mudaram: 0, ex: [] }); if (x && y && x.h === y.h) e.iguais++; else { e.mudaram++; if (e.ex.length < 3) e.ex.push(k); } }
  let nP = 0, nS = 0, nC = 0;
  for (const t of Object.keys(by).sort()) { const e = by[t]; nP += e.iguais + e.mudaram; if (e.mudaram) { const ok = MUDOU.includes(t); console.log(`${ok ? 'mudou (dito)' : 'MUDOU'} | ${t}: ${e.mudaram} de ${e.iguais + e.mudaram} plantas — ${e.ex.join(' · ')}`); if (!ok) bad.push(t); } }
  for (const t of Object.keys(cat).sort()) { const e = cat[t]; nC += e.iguais + e.mudaram; if (e.mudaram) { const ok = MUDOU.includes(t); console.log(`${ok ? 'mudou (dito)' : 'MUDOU'} | o catálogo de ${t}: ${e.mudaram} de ${e.iguais + e.mudaram} linhas — ${e.ex.join(' · ')}`); if (!ok) bad.push('catálogo ' + t); } }
  for (const t of Object.keys(son).sort()) { const e = son[t]; nS += e.iguais + e.mudaram; if (e.mudaram) { const ok = MUDOU.includes(t); console.log(`${ok ? 'mudou (dito)' : 'MUDOU'} | as provas do catálogo de ${t}: ${e.mudaram} de ${e.iguais + e.mudaram} plantas — ${e.ex.join(' · ')}`); if (!ok) bad.push('provas ' + t); } }
  const types = Object.keys(by).length; const same = Object.values(by).reduce((s, e) => s + e.iguais, 0);
  if (!ws.length) bad.push('nenhum mundo em comum');
  console.log(`${bad.length ? 'FALHOU' : 'PASSOU'} | plantas-iguais | ${same} de ${nP} plantas iguais byte a byte em ${ws.join(', ')} (${types} tipos); ${Object.values(cat).reduce((s, e) => s + e.iguais, 0)} de ${nC} linhas do catálogo; ${Object.values(son).reduce((s, e) => s + e.iguais, 0)} de ${nS} plantas das provas do catálogo${MUDOU.length ? `; podiam mudar: ${MUDOU.join(', ')}` : ''}${bad.length ? ' — mudaram sem ser ditos: ' + [...new Set(bad)].join(', ') : ''}`);
  return !bad.length;
}
// ---- the proof of the version of a type (F13, D-990): its number goes up — in this process only, nothing written to the game —,
// and only its plans are made again (their keys change, the others' not), only its lines of the catalogue are left to be made
// again (the game reads the others as they are; made again, they come out the same, of the new number), and only its records in
// a save made before are judged on loading (one with a family its type does not have goes back to one it has, with the fact;
// one of another type with the same, never judged, keeps it); the save made after says the type's number, and opened again
// judges nothing. The plans of every building, before and after, the same byte for byte
function raise(T) {
  const out = [], said = []; const fail = m => out.push(m); const vm = require('vm');
  if (!In.TYPES[T]) { console.log(`FALHOU | plantas-iguais sobe | ${T} não é um tipo com planta`); process.exit(1); }
  const n0 = In.VERSION_T[T] | 0, n1 = n0 + 1; const v0 = In.versionOf(T);
  const setV = n => { delete In.VERSION_T[T]; if (n) In.VERSION_T[T] = n; };
  // (the catalogue read again as the game reads it at its start — the game's file, or one of the proof's)
  const readCat = file => { for (const k of Object.keys(In.PROBED)) delete In.PROBED[k]; vm.runInThisContext(fs.readFileSync(file, 'utf8'), { filename: file }); };
  const CAT = path.join(__dirname, '..', 'js', 'int-catalogo.js');
  const tabOf = () => { const o = {}; for (const k of Object.keys(In.PROBED)) o[k] = JSON.stringify(In.PROBED[k]); return o; };
  const ofT = k => k.split('|')[0] === T; let nT = 0, nW = 0;
  for (const w of MUNDOS) {
    setV(n0); readCat(CAT); const probed0 = tabOf();
    M.pronto(w); const P0 = worldPrints(); const B = [...G.S.buildings.values()];
    const listT = Object.keys(P0).filter(id => P0[id].t === T); nT += listT.length; nW += Object.keys(P0).length;
    // (the two records a save of before will judge or not: one of the type, one of another — each given a family its type does
    // not have, the tavern's of before, w-terreiro.andar, which no type lays out any more)
    const ALIEN = 'w-terreiro.andar'; const pickOf = f => B.filter(b => b.ip && b.built && b.type === b.ip.t && b.type !== 'ruin' && f(b)).sort((a, b) => a.id - b.id)[0];
    const bT = pickOf(b => b.ip.t === T), bU = pickOf(b => b.ip.t !== T && In.TYPES[b.ip.t].fams.length > 1);
    const fT = bT ? bT.ip.f : null, fU = bU ? bU.ip.f : null; if (bT) bT.ip.f = ALIEN; if (bU) bU.ip.f = ALIEN;
    const save = G.Save.serialize(); const o0 = JSON.parse(save); const recs0 = new Map(o0.buildings.filter(b => b.ip).map(b => [b.id, JSON.stringify(b.ip)]));
    if (o0.intGT) fail(`${w}: o save de antes já diz a gramática dos tipos (${JSON.stringify(o0.intGT)})`);
    // (the version up, the catalogue read again: the type's lines set aside, the others' as they were)
    setV(n1); readCat(CAT); const probed1 = tabOf();
    const linesT = Object.keys(probed0).filter(ofT).length, lostT = Object.keys(probed1).filter(ofT).length;
    const keptO = Object.keys(probed0).filter(k => !ofT(k)); const sameO = keptO.filter(k => probed1[k] === probed0[k]).length;
    if (lostT) fail(`${w}: o jogo ainda lê ${lostT} linhas do catálogo de ${T} da gramática de antes`);
    if (sameO !== keptO.length) fail(`${w}: só ${sameO} de ${keptO.length} linhas do catálogo dos outros tipos lidas como eram`);
    // (the save of before opened: the type's record judged, the other's not, nothing else changed)
    G.Save.apply(o0); G.Main.mode = 'game';
    const recs1 = new Map([...G.S.buildings.values()].filter(b => b.ip).map(b => [b.id, JSON.stringify(b.ip)]));
    const cT = bT && G.S.buildings.get(bT.id), cU = bU && G.S.buildings.get(bU.id);
    if (bT && (!cT || !In.TYPES[T].fams.includes(cT.ip.f) || !cT.ip.h.some(f => f[1] === 'reforma' && String(f[2] || '').includes(ALIEN)))) fail(`${w}: o registro de ${T}#${bT.id} com a família ${ALIEN} não foi julgado ao abrir (${cT ? cT.ip.f : 'sumiu'})`);
    if (bU && (!cU || cU.ip.f !== ALIEN)) fail(`${w}: o registro de ${bU.type}#${bU.id}, de outro tipo, foi julgado ao abrir (${cU ? cU.ip.f : 'sumiu'})`);
    let moved = 0; for (const [id, j] of recs0) if (id !== (bT && bT.id) && recs1.get(id) !== j) moved++;
    if (moved) fail(`${w}: ${moved} registros mudaram ao abrir, além do julgado`);
    // (the keys: the type's with its new number, the others' as they were; the plans, all of them the same. The judged one is another
    // record now — its fact, the renovation's number in its key —: given back its family in memory, its plan compared alone)
    if (cU) cU.ip.f = fU; let judged = null; if (cT) { judged = JSON.parse(JSON.stringify(cT.ip)); cT.ip.f = fT; cT.ip.r = JSON.parse(recs0.get(cT.id)).r; cT.ip.fx = JSON.parse(recs0.get(cT.id)).fx; cT.ip.h = JSON.parse(recs0.get(cT.id)).h; }
    const P1 = worldPrints(); let kT = 0, kO = 0, same = 0; const diff = [];
    for (const id of Object.keys(P0)) {
      const a = P0[id], b = P1[id]; if (!b) { diff.push(`#${id} sumiu`); continue; }
      if (a.t === T) { if (b.key !== a.key && b.key === a.key.replace(/:g[\d.]+$/, ':g' + In.versionOf(T))) kT++; } else if (b.key === a.key) kO++;
      if (a.h === b.h && a.casca === b.casca) same++; else if (diff.length < 3) diff.push(`${a.t}#${id}`);
    }
    if (cT) Object.assign(cT.ip, judged);
    const nO = Object.keys(P0).length - listT.length;
    if (kT !== listT.length) fail(`${w}: ${kT} de ${listT.length} chaves de ${T} com a gramática nova`);
    if (kO !== nO) fail(`${w}: ${kO} de ${nO} chaves dos outros tipos como eram`);
    if (same !== Object.keys(P0).length) fail(`${w}: ${Object.keys(P0).length - same} plantas diferentes (${diff.join(', ')})`);
    // (the save made now says the type's number, and opened again judges nothing)
    const o2 = JSON.parse(G.Save.serialize());
    if (!o2.intGT || o2.intGT[T] !== n1 || o2.intG !== In.VERSION) fail(`${w}: o save de agora diz ${JSON.stringify({ intG: o2.intG, intGT: o2.intGT })}`);
    const r2 = new Map(o2.buildings.filter(b => b.ip).map(b => [b.id, JSON.stringify(b.ip)])); G.Save.apply(o2); G.Main.mode = 'game';
    let again = 0; for (const b of G.S.buildings.values()) if (b.ip && r2.get(b.id) !== JSON.stringify(b.ip)) again++;
    if (again) fail(`${w}: ${again} registros julgados de novo num save da gramática de agora`);
    said.push(`${w}: ${listT.length} de ${T} com a chave nova e ${nO} dos outros como era, ${same} plantas iguais, ${linesT} linhas de ${T} postas de lado e ${sameO} dos outros lidas como eram${bT ? `, ${T}#${bT.id} julgado ao abrir e ${bU.type}#${bU.id} não` : ''}`);
  }
  // (its lines of the catalogue made again — in a file of the proof's, never the game's —: the others' the same, its own the same
  // tables of the new number, and the game reads them)
  setV(n1); readCat(CAT);
  const C = require('./catalogo.js'); const tmp = path.join(require('os').tmpdir(), `catalogo-sobe-${process.pid}.js`);
  const t0 = clock(); const table = C.read(); const before = C.raw(); const old = Object.keys(before.o.keys).filter(ofT);
  if (old.some(k => table[k])) fail(`o qa/catalogo.js leu de volta linhas de ${T} da gramática de antes`);
  process.env.QUIET = '1'; Object.assign(table, C.run(C.keysOf('tudo', [T]))); C.write(table, tmp); const after = C.raw(tmp);
  const dec = (R, k) => { const t = k.split('|')[0]; const fams = In.TYPES[t].fams; return JSON.stringify(R.o.keys[k].map((v, q) => [fams[q], v === 1 ? 1 : R.o.msgs[v - 2]])); };
  const ks = Object.keys(before.o.keys); const others = ks.filter(k => !ofT(k)); const otherSame = others.filter(k => after.o.keys[k] && dec(before, k) === dec(after, k)).length;
  const ownSame = old.filter(k => after.o.keys[k] && dec(before, k) === dec(after, k)).length;
  if (otherSame !== others.length) fail(`o catálogo refeito: ${otherSame} de ${others.length} linhas dos outros tipos iguais`);
  if (ownSame !== old.length || (after.vers[T] | 0) !== n1) fail(`o catálogo refeito: ${ownSame} de ${old.length} linhas de ${T} iguais, a versão ${after.vers[T]}`);
  readCat(tmp); const read = Object.keys(In.PROBED).filter(ofT).length; fs.unlinkSync(tmp);
  if (read !== old.length) fail(`o catálogo refeito: o jogo lê ${read} de ${old.length} linhas de ${T}`);
  said.push(`o catálogo de ${T} refeito sozinho (${old.length} chaves em ${((clock() - t0) / 1000).toFixed(0)} s): as ${old.length} linhas iguais, da versão ${In.versionOf(T)}, e o jogo as lê; as ${others.length} dos outros tipos como eram`);
  setV(n0);
  if (!nT) fail(`nenhum prédio de ${T} em ${MUNDOS.join(', ')}`);
  const okAll = !out.length && M.limpo();
  console.log(`${okAll ? 'PASSOU' : 'FALHOU'} | plantas-iguais sobe | a versão de ${T} de ${v0} para ${In.VERSION}.${n1}, em ${nW} prédios: ${out.length ? out.join(' / ') : said.join('; ')}${M.limpo() ? '' : '; ERROS: ' + JSON.stringify(M.erros()).slice(0, 200)}`);
  return okAll;
}
if (cmd === 'grava') {
  const out = args[1]; if (!out) { console.log('grava SAIDA.json'); process.exit(2); }
  const R = record(); fs.writeFileSync(out, JSON.stringify(R)); console.log(`gravado ${out}`);
  if (!M.limpo()) { console.log('ERROS: ' + JSON.stringify(M.erros()).slice(0, 300)); process.exit(1); }
} else if (cmd === 'compara') {
  const A = JSON.parse(fs.readFileSync(args[1], 'utf8')); const B = args[2] ? JSON.parse(fs.readFileSync(args[2], 'utf8')) : record();
  const ok = compare(A, B); if (!M.limpo()) { console.log('ERROS: ' + JSON.stringify(M.erros()).slice(0, 300)); process.exit(1); }
  process.exit(ok ? 0 : 1);
} else if (cmd === 'sobe') {
  process.exit(raise(args[1] || 'forja') ? 0 : 1);
} else { console.log('comando? grava SAIDA.json | compara ANTES.json [DEPOIS.json] | sobe [tipo]'); process.exit(2); }
