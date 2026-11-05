// duas: two visual rounds (rodada.sh) side by side — a colleague's branch against the integration, the integration against
// the game before the studio: the proofs of the Modo Encarnado that changed, the hunter's problems new and gone (by kind,
// owner and world), the measures (desempenho.js --compara) and the photos before | after (compara.py):
//   node qa/visual/duas.js RODADA_ANTES RODADA_DEPOIS SAIDA      → SAIDA/duas.txt (and printed), SAIDA/lado-a-lado/, SAIDA/desempenho.txt
const fs = require('fs'), path = require('path'); const { execFileSync } = require('child_process');
const [A, B, OUT] = process.argv.slice(2, 5).map(p => p && path.resolve(p));
if (!A || !B || !OUT) { console.log('uso: node qa/visual/duas.js RODADA_ANTES RODADA_DEPOIS SAIDA'); process.exit(2); }
fs.mkdirSync(OUT, { recursive: true });
const rd = (d, f) => { try { return fs.readFileSync(path.join(d, f), 'utf8'); } catch (e) { return null; } };
const rj = (d, f) => { try { return JSON.parse(fs.readFileSync(path.join(d, f), 'utf8')); } catch (e) { return null; } };
const L = []; const ma = rj(A, 'rodada.json') || {}, mb = rj(B, 'rodada.json') || {};
L.push(`DUAS RODADAS — antes ${ma.commit || '?'} (${ma.start || '?'}${ma.rapido ? ', rápida' : ''}) · depois ${mb.commit || '?'} (${mb.start || '?'}${mb.rapido ? ', rápida' : ''})`);
L.push(`  antes: ${ma.game || A}`); L.push(`  depois: ${mb.game || B}`); L.push('');

// ---- the guard and the rules of the 3D
for (const f of ['guard.txt', 'guarda3d.txt']) { const a = rd(A, f), b = rd(B, f); if (a === null && b === null) continue; const st = t => (t === null ? '-' : (t.trim().split('\n').pop() || '').slice(0, 90)); L.push(`${f.replace('.txt', '')}: antes ${st(a)} · depois ${st(b)}`); if (b) for (const l of b.split('\n').filter(l => /^FALHA/.test(l) && !(a || '').includes(l))) L.push(`  NOVO: ${l.slice(0, 220)}`); }

// ---- the proofs of the Modo Encarnado, part by part
const parts = t => { const m = new Map(); for (const l of (t || '').split('\n')) { const r = l.match(/^(PASSOU|FALHOU) \| encarna ([^|]+?)\s*\|\s*(.*)$/); if (r) m.set(r[2].trim(), { ok: r[1] === 'PASSOU', info: r[3] }); } return m; };
const ea = parts(rd(A, 'encarna.txt')), eb = parts(rd(B, 'encarna.txt'));
if (ea.size || eb.size) {
  const names = [...new Set([...ea.keys(), ...eb.keys()])]; const cnt = m => `${[...m.values()].filter(x => x.ok).length}/${m.size}`;
  L.push(''); L.push(`encarna: antes ${cnt(ea)} passaram · depois ${cnt(eb)} passaram`);
  for (const n of names) { const a = ea.get(n), b = eb.get(n); if (a && b && a.ok === b.ok) continue; const s = x => (x ? (x.ok ? 'passou' : 'FALHOU') : 'não rodou');
    L.push(`  ${n}: ${s(a)} → ${s(b)}${b && !b.ok ? ' · ' + b.info.slice(0, 260) : ''}`); }
  for (const n of names) { const a = ea.get(n), b = eb.get(n); if (a && b && !a.ok && !b.ok) L.push(`  (falha nos dois) ${n}: ${b.info.slice(0, 200)}`); }
}

// ---- the hunt: problems by kind, owner and world — new, gone, more, fewer
const ca = rj(A, 'caca/caca.json'), cb = rj(B, 'caca/caca.json');
if (ca || cb) {
  const by = R => { const m = new Map(); for (const p of (R ? R.problems : [])) { const k = `S${p.sev} [${p.owner}] ${p.kind} · ${p.world || '?'}`; const e = m.get(k) || { n: 0, ex: p, sev: p.sev }; e.n++; m.set(k, e); } return m; };
  const pa = by(ca), pb = by(cb); const sev = R => R ? [0, 1, 2, 3, 4].map(s => `S${s} ${R.groups.filter(g => g.sev === s).length}`).join(' · ') : '-';
  L.push(''); L.push(`caça: antes ${ca ? ca.groups.length + ' problemas diferentes (' + sev(ca) + ')' : 'não rodou'} · depois ${cb ? cb.groups.length + ' (' + sev(cb) + ')' : 'não rodou'}`);
  if (ca && cb) {
    const ks = [...new Set([...pa.keys(), ...pb.keys()])].sort((x, y) => (pb.get(x) || pa.get(x)).sev - (pb.get(y) || pa.get(y)).sev);
    const nw = ks.filter(k => pb.has(k) && !pa.has(k)), gone = ks.filter(k => pa.has(k) && !pb.has(k)), both = ks.filter(k => pa.has(k) && pb.has(k));
    L.push(`  NOVOS (${nw.length}):`); for (const k of nw) { const e = pb.get(k); L.push(`    ${k} ×${e.n} — ${String(e.ex.msg).slice(0, 220)} (${e.ex.spot || ''}${e.ex.foto ? ' · caca/' + e.ex.foto : ''})`); }
    L.push(`  SUMIRAM (${gone.length}):`); for (const k of gone) { const e = pa.get(k); L.push(`    ${k} ×${e.n} — ${String(e.ex.msg).slice(0, 160)}`); }
    L.push(`  NOS DOIS (${both.length}):`); for (const k of both) L.push(`    ${k}: ×${pa.get(k).n} → ×${pb.get(k).n}`);
    const calls = R => Object.entries(R.worlds).map(([w, W]) => `${w} ${W.callsMed}/${W.callsMax}`).join(', ');
    L.push(`  chamadas de desenho (mediana/máx por mundo): antes ${calls(ca)} · depois ${calls(cb)}`);
  }
}

// ---- the measures and the photos
if (fs.existsSync(path.join(A, 'desempenho', 'desempenho.json')) && fs.existsSync(path.join(B, 'desempenho', 'desempenho.json'))) {
  const out = path.join(OUT, 'desempenho.txt');
  try { execFileSync(process.execPath, [path.join(__dirname, 'desempenho.js'), '--compara', path.join(A, 'desempenho', 'desempenho.json'), path.join(B, 'desempenho', 'desempenho.json'), out], { stdio: 'ignore' }); } catch (e) { }
  const t = rd(OUT, 'desempenho.txt') || ''; L.push(''); L.push('desempenho (tudo em ' + out + '):');
  for (const l of t.split('\n').filter(l => /^ATENÇÃO|^antes:|▲\s*$|▼\s*$/.test(l)).slice(0, 30)) L.push('  ' + l.replace(/\s+/g, ' ').trim());
  const qs = t.split('\n'); const i = qs.findIndex(l => l.startsWith('quem mudou o quê')); if (i >= 0) for (const l of qs.slice(i, i + 24)) if (l.trim()) L.push('  ' + l.trim());
}
if (fs.existsSync(path.join(A, 'fotos')) && fs.existsSync(path.join(B, 'fotos'))) {
  try { execFileSync('python3', [path.join(__dirname, 'compara.py'), path.join(A, 'fotos'), path.join(B, 'fotos'), path.join(OUT, 'lado-a-lado')], { stdio: 'ignore' }); } catch (e) { }
  const n = fs.existsSync(path.join(OUT, 'lado-a-lado')) ? fs.readdirSync(path.join(OUT, 'lado-a-lado')).filter(f => f.endsWith('.png')) : [];
  L.push(''); L.push(`fotos lado a lado: ${n.length} vistas em ${path.join(OUT, 'lado-a-lado')} (${n.map(f => f.replace('.png', '')).join(', ')})`);
}
const txt = L.join('\n') + '\n'; fs.writeFileSync(path.join(OUT, 'duas.txt'), txt); process.stdout.write(txt);
