// desempenho: what the 3D costs in the fixed views of fotos.js, at each quality — draw calls, triangles, shader programs,
// textures, geometries, memory, the ms of a frame (relative only: the 3D here is drawn by software) and how many of each
// thing are drawn — saved as JSON and as a table, to compare one commit with another:
//   bash qa/navegador.sh node qa/visual/desempenho.js PASTA_DO_JOGO SAIDA [vista,vista...]
//     Q=baixa,media (default: every preset the game has, G.Realm.QUAL) · FRAMES=5 timed frames · RAPIDO=1 four views only
//     VW/VH the window (default 1000×620, as fotos.js) · NOTA="..." a note on the conditions, kept with the measure
//     (the machine's cores, the browsers open on it and its load are kept by themselves: a busy machine's ms are worth little)
//   node qa/visual/desempenho.js --compara ANTES.json DEPOIS.json [SAIDA.txt]   (side by side, the change in %, by owner)
const path = require('path'); const fs = require('fs'); const os = require('os'); const { execSync } = require('child_process');

const pct = (a, b) => (a ? ((b - a) / a * 100) : (b ? Infinity : 0));
const fmtPct = p => (p === Infinity ? 'novo' : (p >= 0 ? '+' : '') + p.toFixed(0) + '%');
const pad = (s, n, left) => { s = String(s === null || s === undefined ? '-' : s); return left ? s.padEnd(n) : s.padStart(n); };
// the machine while it measured: its cores, the browsers open on it (each a 3D drawn by software: 1–2 cores), the load
// (the ms of a busy machine are worth little: then only draw calls and triangles compare)
const browsers = () => { try { return execSync('ps -eo args', { encoding: 'utf8' }).split('\n').filter(l => /headless_shell|chrom(e|ium)/.test(l) && /--type=gpu-process/.test(l)).length; } catch (e) { return null; } };
const machine = () => ({ cores: os.cpus().length, browsers: browsers(), load: +os.loadavg()[0].toFixed(1) });
function busy(R) {
  const M = R.machine; if (!M || !M.start) return 'sem registro das condições da máquina (medida antiga): os ms valem pouco';
  const loads = [M.start.load, M.end && M.end.load, ...R.rows.map(m => m.load1)].filter(Number.isFinite); const top = Math.max(...loads);
  const br = Math.max(M.start.browsers || 0, (M.end && M.end.browsers) || 0); const why = [];
  if (top > M.cores * 0.75) why.push(`carga até ${top} em ${M.cores} núcleos`); if (br > 1) why.push(`${br} navegadores abertos (este incluído)`);
  return why.length ? `máquina ocupada (${why.join(', ')}): os ms valem pouco; compare chamadas e triângulos` : '';
}
// (the triangles of the main pass — the census of what is in the eye's frustum — are the same frame after frame; the frame's
// total also counts the shadow map, which is drawn again only on some frames: the same game measured 1553 and 1793 thousand)
const sceneT = m => (m.sceneTris !== undefined ? m.sceneTris : Object.values(m.census || {}).reduce((s, e) => s + (e.tris || 0), 0));
const sceneC = m => (m.sceneCalls !== undefined ? m.sceneCalls : Object.values(m.census || {}).reduce((s, e) => s + (e.calls || 0), 0));
const cond = R => { const M = R.machine; if (!M || !M.start) return 'condições: não registradas'; return `condições: ${M.cores} núcleos · navegadores abertos ${M.start.browsers}${M.end ? '→' + M.end.browsers : ''} (este incluído) · carga ${M.start.load}${M.end ? '→' + M.end.load : ''}${M.note ? ' · ' + M.note : ''}`; };

// ------------------------------ the table ------------------------------
function table(R) {
  const L = [];
  L.push(`DESEMPENHO DO 3D — ${R.root} @ ${R.commit} · ${R.date}`);
  L.push(`janela ${R.viewport} · ${R.frames} quadros por medida · carga da máquina ${R.load.join(' → ')} · calibração JS ${R.calib.join(' → ')} ms (o 3D é por software: os ms só valem comparados na mesma máquina e carga)`);
  L.push(cond(R)); const bz = busy(R); if (bz) L.push('ATENÇÃO: ' + bz);
  L.push('');
  const H = ['vista', 'qual.', 'chamadas', 'tri(mil)', 'cena(mil)', 'passes', 'progr.', 'text.', 'geom', 'vivas', 'geoMB', 'texMB', 'heapMB', 'ms', 'ms3D', 'p95 3D', 'pess.', 'mult.', 'bich.', 'perto', 'luz', 'preto%'];
  const W = [18, 6, 8, 9, 9, 6, 6, 5, 6, 6, 6, 6, 7, 7, 7, 7, 5, 5, 5, 5, 5, 6];
  L.push(H.map((h, k) => pad(h, W[k], k < 2)).join(' '));
  for (const m of R.rows) {
    if (m.err) { L.push(pad(m.view, W[0], 1) + ' ' + pad(m.preset || '', W[1], 1) + ' ERRO: ' + m.err); continue; }
    const c = [m.view, m.preset, m.calls, (m.tris / 1000).toFixed(1), (sceneT(m) / 1000).toFixed(1), m.passes, m.mem.programs, m.mem.textures, m.mem.geometries, m.mem.live, m.mem.geoMB, m.mem.texMB, m.heap, m.t.ms, m.t.ms3d, m.t.ms3dP95, m.drawn.people, m.drawn.crowd, m.drawn.beasts, m.drawn.near, m.pix.mean, m.pix.black];
    L.push(c.map((v, k) => pad(v, W[k], k < 2)).join(' '));
  }
  L.push('');
  L.push('por qualidade (média das vistas):');
  for (const p of [...new Set(R.rows.filter(m => !m.err).map(m => m.preset))]) {
    const rs = R.rows.filter(m => !m.err && m.preset === p); const av = f => rs.reduce((s, m) => s + f(m), 0) / rs.length;
    L.push(`  ${pad(p, 6, 1)} chamadas ${av(m => m.calls).toFixed(0)} · triângulos ${(av(m => m.tris) / 1000).toFixed(0)} mil (da cena vista ${(av(sceneT) / 1000).toFixed(0)} mil) · programas ${av(m => m.mem.programs).toFixed(0)} · texturas ${av(m => m.mem.textures).toFixed(0)} · geometria ${av(m => m.mem.geoMB).toFixed(0)} MB · heap ${av(m => m.heap || 0).toFixed(0)} MB · ms 3D ${av(m => m.t.ms3d).toFixed(0)} (quadro ${av(m => m.t.ms).toFixed(0)})`);
  }
  L.push('');
  L.push('quem desenha o quê (passe principal: objetos no campo de visão, chamadas / mil triângulos), média das vistas:');
  for (const p of [...new Set(R.rows.filter(m => !m.err).map(m => m.preset))]) {
    const rs = R.rows.filter(m => !m.err && m.preset === p); const acc = {};
    for (const m of rs) for (const k in m.census) { const e = acc[k] || (acc[k] = { owner: m.census[k].owner, calls: 0, tris: 0 }); e.calls += m.census[k].calls / rs.length; e.tris += m.census[k].tris / rs.length; }
    const parts = Object.entries(acc).sort((a, b) => b[1].tris - a[1].tris).map(([k, e]) => `${k} [${e.owner}] ${e.calls.toFixed(0)}/${(e.tris / 1000).toFixed(0)}`);
    L.push(`  ${p}: ${parts.join(' · ')}`);
  }
  if (R.errors && R.errors.length) { L.push(''); L.push('erros de página / console: ' + R.errors.length); for (const e of R.errors.slice(0, 12)) L.push('  ' + e.slice(0, 300)); }
  if (R.modErr && R.modErr !== '{}') L.push('erros de módulo (G.modErr): ' + R.modErr);
  return L.join('\n') + '\n';
}

// ------------------------------ the comparison ------------------------------
function compare(A, B) {
  const L = []; const key = m => m.view + '|' + m.preset;
  const a = new Map(A.rows.filter(m => !m.err).map(m => [key(m), m]));
  L.push(`COMPARAÇÃO DO 3D — antes ${A.commit} (${A.date}) · depois ${B.commit} (${B.date})`);
  L.push(`carga da máquina: antes ${A.load.join('→')} · depois ${B.load.join('→')}; calibração JS antes ${A.calib.join('→')} ms, depois ${B.calib.join('→')} ms`);
  L.push(`antes: ${cond(A)} · depois: ${cond(B)}`);
  for (const [k, R] of [['antes', A], ['depois', B]]) { const bz = busy(R); if (bz) L.push(`ATENÇÃO (${k}): ${bz}`); }
  L.push('(▲ chamadas ou triângulos da cena vista +15%, ms 3D +25%, memória +20%; ▼ o mesmo para menos — os triângulos do quadro inteiro contam as sombras, refeitas só em alguns quadros: ficam ao lado, sem marcar)');
  L.push('');
  const H = ['vista', 'qual.', 'chamadas', 'Δ', 'cena(mil)', 'Δ', 'quadro(mil)', 'progr.', 'text.', 'geoMB', 'Δ', 'texMB', 'heapMB', 'Δ', 'ms3D', 'Δ', 'média 3D', 'Δ', ''];
  const W = [18, 6, 13, 6, 13, 6, 13, 9, 9, 13, 6, 11, 13, 6, 13, 6, 13, 6, 3];
  L.push(H.map((h, k) => pad(h, W[k], k < 2)).join(' '));
  const sums = {};
  for (const m of B.rows) {
    if (m.err) continue; const o = a.get(key(m)); if (!o) { L.push(pad(m.view, W[0], 1) + ' ' + pad(m.preset, W[1], 1) + ' (sem medida antes)'); continue; }
    const d = { calls: pct(o.calls, m.calls), tris: pct(sceneT(o), sceneT(m)), geo: pct(o.mem.geoMB, m.mem.geoMB), heap: pct(o.heap, m.heap), ms: pct(o.t.ms3d, m.t.ms3d), mean: o.t.ms3dMean && m.t.ms3dMean ? pct(o.t.ms3dMean, m.t.ms3dMean) : null };
    const flag = (d.calls > 15 || d.tris > 15 || d.ms > 25 || d.geo > 20 || d.heap > 20) ? '▲' : (d.calls < -15 || d.tris < -15 || d.ms < -25) ? '▼' : '';
    const c = [m.view, m.preset, `${o.calls}→${m.calls}`, fmtPct(d.calls), `${(sceneT(o) / 1000).toFixed(0)}→${(sceneT(m) / 1000).toFixed(0)}`, fmtPct(d.tris), `${(o.tris / 1000).toFixed(0)}→${(m.tris / 1000).toFixed(0)}`, `${o.mem.programs}→${m.mem.programs}`, `${o.mem.textures}→${m.mem.textures}`, `${o.mem.geoMB}→${m.mem.geoMB}`, fmtPct(d.geo), `${o.mem.texMB}→${m.mem.texMB}`, `${o.heap}→${m.heap}`, fmtPct(d.heap), `${o.t.ms3d}→${m.t.ms3d}`, fmtPct(d.ms), d.mean === null ? '-' : `${o.t.ms3dMean}→${m.t.ms3dMean}`, d.mean === null ? '' : fmtPct(d.mean), flag];
    L.push(c.map((v, k) => pad(v, W[k], k < 2)).join(' '));
    const s = sums[m.preset] || (sums[m.preset] = { a: {}, b: {}, n: 0 }); s.n++;
    for (const [side, r] of [['a', o], ['b', m]]) for (const k in r.census) { const e = s[side][k] || (s[side][k] = { owner: r.census[k].owner, calls: 0, tris: 0 }); e.calls += r.census[k].calls; e.tris += r.census[k].tris; }
  }
  L.push('');
  L.push('quem mudou o quê (passe principal, média das vistas: chamadas e mil triângulos, antes → depois):');
  for (const p in sums) {
    const s = sums[p]; const ks = [...new Set([...Object.keys(s.a), ...Object.keys(s.b)])];
    const rows = ks.map(k => { const x = s.a[k] || { calls: 0, tris: 0, owner: (s.b[k] || {}).owner }, y = s.b[k] || { calls: 0, tris: 0, owner: x.owner }; return { k, owner: y.owner || x.owner, c0: x.calls / s.n, c1: y.calls / s.n, t0: x.tris / s.n, t1: y.tris / s.n }; })
      .filter(r => Math.abs(r.t1 - r.t0) > 500 || Math.abs(r.c1 - r.c0) >= 1).sort((u, v) => Math.abs(v.t1 - v.t0) - Math.abs(u.t1 - u.t0));
    L.push(`  ${p}:`); for (const r of rows) L.push(`    ${pad(r.k, 34, 1)} [${r.owner}] chamadas ${r.c0.toFixed(0)}→${r.c1.toFixed(0)} · triângulos ${(r.t0 / 1000).toFixed(1)}→${(r.t1 / 1000).toFixed(1)} mil (${fmtPct(pct(r.t0, r.t1))})`);
    if (!rows.length) L.push('    (nada mudou)');
  }
  return L.join('\n') + '\n';
}

// (the table and the comparison, for the other tools: required, nothing is measured)
module.exports = { table, compare, sceneT, busy };
if (require.main !== module) return;

if (process.argv[2] === '--compara') {
  const A = JSON.parse(fs.readFileSync(process.argv[3], 'utf8')), B = JSON.parse(fs.readFileSync(process.argv[4], 'utf8'));
  const t = compare(A, B); process.stdout.write(t); if (process.argv[5]) fs.writeFileSync(process.argv[5], t);
  process.exit(0);
}

// ------------------------------ the measure ------------------------------
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..')); const OUT = path.resolve(process.argv[3] || path.join(os.tmpdir(), 'desempenho'));
fs.mkdirSync(OUT, { recursive: true });
const { views, open } = require('./vistas.js');
const RAPIDO = ['hedeby-praca', 'hedeby-rua-alto', 'hedeby-noite', 'metropole-alto'];
const ONLY = (process.argv[4] || (process.env.RAPIDO ? RAPIDO.join(',') : '')).split(',').filter(Boolean);
const VIEWS = views().filter(v => !ONLY.length || ONLY.includes(v.name));
const FR = +process.env.FRAMES || 5;
const commit = (() => { try { return execSync('git -C ' + JSON.stringify(ROOT) + ' log -1 --format=%h', { encoding: 'utf8' }).trim() + (execSync('git -C ' + JSON.stringify(ROOT) + ' status --porcelain -- js index.html', { encoding: 'utf8' }).trim() ? '+mudanças' : ''); } catch (e) { try { return fs.readFileSync(path.join(ROOT, 'COMMIT'), 'utf8').trim(); } catch (e2) { return '?'; } } })();
(async () => {
  const t00 = Date.now();
  const worlds = [...new Set(VIEWS.map(v => v.world))];
  const { browser, page, errs, heap } = await open(ROOT, { worlds });
  const calib = () => page.evaluate(() => { const t0 = performance.now(); let x = 0; for (let i = 0; i < 3e7; i++) x += Math.sqrt(i) * 1e-9; return +(performance.now() - t0 + (x > 1e9 ? 1 : 0)).toFixed(0); });
  const R = { root: ROOT, commit, date: new Date().toISOString().slice(0, 16).replace('T', ' '), viewport: `${+process.env.VW || 1000}×${+process.env.VH || 620}`, frames: FR, load: [os.loadavg()[0].toFixed(1)], calib: [await calib()], presets: null, rows: [], worlds: {}, machine: { cores: os.cpus().length, start: machine(), end: null, note: process.env.NOTA || '' } };
  const presets = await page.evaluate(q => { const all = Object.keys(G.Realm.QUAL); return q ? q.split(',').filter(k => all.includes(k)) : all; }, process.env.Q || '');
  R.presets = presets; console.log(`qualidades: ${presets.join(', ')} · vistas: ${VIEWS.map(v => v.name).join(', ')}`);
  const save = () => { fs.writeFileSync(path.join(OUT, 'desempenho.json'), JSON.stringify(R, null, 1)); fs.writeFileSync(path.join(OUT, 'desempenho.txt'), table(R)); };
  for (const w of worlds) {
    const o = await page.evaluate(([w, q]) => __VIS.open(w, q), [w, presets[0]]).catch(e => ({ ok: false, why: e.message }));
    R.worlds[w] = o; console.log(`mundo ${w}: ${JSON.stringify(o)}`);
    if (!o.ok) { for (const vw of VIEWS.filter(v => v.world === w)) R.rows.push({ view: vw.name, preset: null, err: 'não encarnou: ' + o.why }); continue; }
    for (const vw of VIEWS.filter(v => v.world === w)) {
      const t0 = Date.now();
      // (the body taken to the view at the lightest quality: the frames of the way there are the cheapest)
      const g = await page.evaluate(([vw, q]) => { G.Realm.setQuality(q); return __VIS.go(vw); }, [vw, presets[0]]).catch(e => ({ ok: false, why: e.message }));
      if (!g.ok) { R.rows.push({ view: vw.name, preset: null, err: g.why }); console.log(`${vw.name}: ${g.why}`); continue; }
      for (const p of presets) {
        const m = await page.evaluate(([vw, p, FR]) => {
          // (every picture made again at this quality, from nothing: what is near was made at the last one)
          __VIS.fresh(p); __VIS.eye(vw.yaw, vw.pitch, vw.dist); __VIS.f(2);
          const c = __VIS.count(); const t = __VIS.time(FR);
          const census = __VIS.census(); let sceneTris = 0, sceneCalls = 0; for (const k in census) { sceneTris += census[k].tris; sceneCalls += census[k].calls; }
          return { calls: c.calls, tris: c.tris, sceneTris, sceneCalls, points: c.points, lines: c.lines, passes: c.passes, pix: c.pix, t, drawn: __VIS.drawn(), census, mem: __VIS.memory(), realm: G.Realm.memory(), err: null, modErr: JSON.stringify(G.modErr) };
        }, [vw, p, FR]).catch(e => ({ err: e.message.slice(0, 300) }));
        const row = Object.assign({ view: vw.name, world: w, preset: p, at: g.at, heap: await heap(), load1: +os.loadavg()[0].toFixed(1) }, m);
        if (!m.err) row.err = undefined;
        R.rows.push(row); save();
        console.log(m.err ? `${vw.name} ${p}: ERRO ${m.err}` : `${vw.name} ${p}: ${m.calls} chamadas, ${(m.tris / 1000).toFixed(1)} mil triângulos, ${m.passes} passe(s), ${m.mem.programs} programas, ${m.mem.textures} texturas, ${m.mem.live} geometrias vivas (${m.mem.geoMB} MB), heap ${row.heap} MB, ms ${m.t.ms} (3D ${m.t.ms3d}), ${m.drawn.people} pessoas, ${m.drawn.beasts} bichos, ${m.drawn.near} pedaços perto`);
      }
      console.log(`  (${vw.name}: ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    }
  }
  R.modErr = await page.evaluate(() => JSON.stringify(G.modErr)).catch(() => '?');
  R.load.push(os.loadavg()[0].toFixed(1)); R.calib.push(await calib().catch(() => null)); R.errors = errs.slice(); R.secs = Math.round((Date.now() - t00) / 1000); R.machine.end = machine();
  save();
  process.stdout.write('\n' + table(R));
  console.log(`(${R.secs} s) → ${path.join(OUT, 'desempenho.json')} · ${path.join(OUT, 'desempenho.txt')}`);
  await browser.close();
  process.exit(errs.length || R.rows.some(m => m.err) || (R.modErr && R.modErr !== '{}') ? 1 : 0);
})().catch(e => { console.error('desempenho: ' + (e.stack || e)); process.exit(2); });
