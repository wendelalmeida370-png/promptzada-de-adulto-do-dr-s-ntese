// relatorio: the short report of a visual round (rodada.sh) — what failed, with its probable owner (arte/ESTUDIO.md §3):
//   node qa/visual/relatorio.js SAIDA_DA_RODADA     → SAIDA/relatorio.txt (and printed)
const fs = require('fs'), path = require('path');
const OUT = path.resolve(process.argv[2] || '.');
const rd = f => { try { return fs.readFileSync(path.join(OUT, f), 'utf8'); } catch (e) { return null; } };
const rj = f => { try { return JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8')); } catch (e) { return null; } };
const meta = rj('rodada.json') || {};
const L = []; const fails = []; const look = [];
const fail = (owner, what, why) => fails.push({ owner, what, why });
const OWNF = { 'build3d.js': 'A2', 'props3d.js': 'A2', 'ground3d.js': 'A3', 'grass3d.js': 'A3', 'people3d.js': 'A4', 'body3d.js': 'A4', 'bodymesh.js': 'A4', 'fx3d.js': 'A5', 'post3d.js': 'A5', 'cam3d.js': 'A5', 'incui.js': 'A1', 'mesh3d.js': 'A1', 'tex3d.js': 'A1', 'css': 'A1' };
const ownerOfText = t => { const m = String(t).match(/\b([\w-]+\.js)\b/); return m ? OWNF[m[1]] || 'líder' : '?'; };
L.push(`RODADA VISUAL — ${meta.game || '?'} @ ${meta.commit || '?'} · ${meta.start || ''} → ${meta.end || ''}${meta.rapido ? ' · rápida' : ''}`);
L.push('');

// ---- the guard and the rules of the 3D
const g = rd('guard.txt'); if (g !== null) { const ok = /PASSOU/.test(g) && !/FALHOU/.test(g); L.push(`guard.js: ${ok ? 'PASSOU' : 'FALHOU'}`); if (!ok) for (const l of g.split('\n').filter(l => l.trim() && !/^FALHOU|^PASSOU/.test(l)).slice(0, 20)) fail(ownerOfText(l), 'guard.js', l.trim()); }
const g3 = rd('guarda3d.txt'); if (g3 !== null) { const fl = g3.split('\n').filter(l => l.startsWith('FALHA: ')), av = g3.split('\n').filter(l => l.startsWith('AVISO: ')); L.push(`guarda3d.js (regras do 3D): ${fl.length ? 'FALHOU ' + fl.length : 'PASSOU'}${av.length ? ' · avisos ' + av.length : ''}`); for (const l of fl) { const m = l.match(/^FALHA: \[([^\]]+)\] (.*)$/); fail(m ? m[1] : '?', 'guarda3d', m ? m[2] : l); } for (const l of av) { const m = l.match(/^AVISO: \[([^\]]+)\] (.*)$/); look.push({ owner: m ? m[1] : '?', what: 'guarda3d', why: m ? m[2] : l }); } for (const l of g3.split('\n').filter(l => l.startsWith('info: '))) L.push('  ' + l.slice(6)); }

// ---- the proofs of the Modo Encarnado
// (who answers for each proof: its subject in the team's matrix — the body's controller and the camera's collision are the leader's)
const ENC = [[/^e1 prédios/, 'A2'], [/^e1 o chão 3D/, 'A3'], [/^e1 /, 'líder'], [/^e6 terreno/, 'líder (A3 se o chão do 3D não bate)'], [/^e6 o mundo leva/, 'líder (câmera)'], [/^e6 /, 'líder'],
  [/^e10/, 'A1'], [/^e11 o chão/, 'A3'], [/^e11 plantas/, 'A2 (paredes, telhados) / A3 (plantas)'], [/^e11 o fogo/, 'A5'], [/^e11 a árvore/, 'A5 (queda, fx3d) / A3 (a árvore)'], [/^e11 quem está/, 'A4'], [/^e11 com o mundo parado/, '? (quem desenhando mexeu no mundo)'],
  [/^e12 o dragão|^e12 o sopro/, 'líder (dragon3d)'], [/^e12 à noite/, 'A4 (tocha na mão) / A5 (luz)'], [/^e12 as carroças|^e12 os bichos|^e12 a chuva/, 'líder (things3d)'], [/^e12 os mortos/, 'A4'], [/^e12 o campo de capim/, 'A3'],
  [/^e13|^e15/, 'A4 (animação) / líder (avatar.js)'], [/^e14/, 'líder (avatar.js) / A4 (pose) / A5 (água)'], [/verificador/, '? (ver a mensagem)'], [/sem erros de página/, '? (ver a mensagem)']];
const enc = rd('encarna.txt');
if (enc !== null) {
  const ps = enc.split('\n').filter(l => /^(PASSOU|FALHOU) \| encarna /.test(l)); const bad = ps.filter(l => l.startsWith('FALHOU'));
  L.push(`encarna (${meta.encarna || 'e1,e6,e10–e15'}): ${ps.length - bad.length} passaram, ${bad.length} falharam${/TUDO PASSOU/.test(enc) ? '' : ps.length ? '' : ' (não rodou até o fim: veja encarna.txt)'}`);
  for (const l of bad) { const [, name, info] = l.split(' | '); const n = name.replace(/^encarna /, ''); const o = (ENC.find(([r]) => r.test(n)) || [0, '?'])[1]; fail(o, 'encarna ' + n, (info || '').slice(0, 300)); }
  if (!ps.length) fail('?', 'encarna', 'nenhuma prova rodou: ' + enc.split('\n').slice(-5).join(' ').slice(0, 300));
  const perf = enc.split('\n').find(l => l.startsWith('DESEMPENHO')); if (perf) L.push('  ' + perf);
}

// ---- the hunt
const cc = rj('caca/caca.json');
if (cc) {
  const by = s => cc.groups.filter(x => x.sev === s).length;
  L.push(`caça (${Object.keys(cc.worlds).join(', ')}; ${cc.secs} s): ${cc.groups.length} problemas diferentes — ${[0, 1, 2, 3, 4].map(s => `S${s} ${by(s)}`).join(' · ')}`);
  for (const w in cc.worlds) { const W = cc.worlds[w]; if (W.open) L.push(`  ${w}: ${W.open.town || '?'} (${(W.open.civs || []).join(', ')}), ${W.open.buildings} prédios, ${(W.spots || []).length} lugares, chamadas ${W.callsMed}/${W.callsMax} (mediana/máx)`); }
  for (const x of cc.groups) { const t = `${x.kind} — ${x.msg}${x.n > 1 ? ` (×${x.n})` : ''} [${x.worlds.join(',')}${x.foto ? ' · caca/' + x.foto : ''}]`; if (x.sev <= 2) fail(x.owner, `caça S${x.sev}`, t); else look.push({ owner: x.owner, what: `caça S${x.sev}`, why: t }); }
} else if (rd('caca.log') !== null) fail('?', 'caça', 'não terminou: ' + (rd('caca.log') || '').split('\n').slice(-4).join(' ').slice(0, 300));

// ---- the measures
const de = rj('desempenho/desempenho.json');
if (de) {
  L.push(`desempenho (${de.rows.length} medidas, ${de.secs} s, carga ${de.load.join('→')}):`);
  for (const p of de.presets) { const rs = de.rows.filter(m => !m.err && m.preset === p); if (!rs.length) continue; const av = f => rs.reduce((s, m) => s + f(m), 0) / rs.length; L.push(`  ${p.padEnd(6)} chamadas ${av(m => m.calls).toFixed(0)} · triângulos ${(av(m => m.tris) / 1000).toFixed(0)} mil · programas ${av(m => m.mem.programs).toFixed(0)} · texturas ${av(m => m.mem.textures).toFixed(0)} · geometria ${av(m => m.mem.geoMB).toFixed(0)} MB · heap ${av(m => m.heap || 0).toFixed(0)} MB · ms 3D ${av(m => m.t.ms3d).toFixed(0)}`); }
  for (const m of de.rows.filter(m => m.err)) fail('?', 'desempenho', `${m.view} ${m.preset || ''}: ${m.err}`);
  for (const e of (de.errors || []).slice(0, 8)) fail(ownerOfText(e), 'desempenho: erro na página', e.slice(0, 300));
  if (de.modErr && de.modErr !== '{}') fail('?', 'desempenho: G.modErr', de.modErr.slice(0, 300));
  const cmp = rd('desempenho/compara.txt');
  if (cmp) { const up = cmp.split('\n').filter(l => /▲\s*$/.test(l)); L.push(`  comparado com a referência: ${up.length} medidas subiram muito (▲) — desempenho/compara.txt`); for (const l of up.slice(0, 10)) look.push({ owner: '?', what: 'desempenho ▲', why: l.replace(/\s+/g, ' ').trim() });
    const who = cmp.split('\n').filter(l => /^\s{4}\S/.test(l) && /\[(A\d|líder|\?)\]/.test(l)).slice(0, 8); for (const l of who) look.push({ owner: (l.match(/\[([^\]]+)\]/) || [])[1] || '?', what: 'desempenho, quem mudou', why: l.trim() }); }
}

// ---- the photos
const fo = rd('fotos.log');
if (fo !== null) {
  const vs = fo.split('\n').filter(l => /^[\w-]+: \{/.test(l)); const er = (fo.match(/^erros: (.*)$/m) || [])[1];
  L.push(`fotos: ${vs.length} vistas em fotos/${fs.existsSync(path.join(OUT, 'lado-a-lado')) ? ', antes | depois em lado-a-lado/' : ''}`);
  for (const v of vs) { const m = v.match(/"err":"(\{[^"]*\})"/); if (m && m[1] !== '{}') fail('?', 'fotos: G.modErr', v.slice(0, 300)); }
  if (er && er !== 'nenhum') fail(ownerOfText(er), 'fotos: erro na página', er.slice(0, 300));
  if (!vs.length) fail('?', 'fotos', 'nenhuma vista saiu: ' + fo.split('\n').slice(-4).join(' ').slice(0, 300));
}

// ---- by owner
L.push('');
const order = ['A1', 'A2', 'A3', 'A4', 'A5', 'líder', '?'];
const ownKey = o => { const k = order.findIndex(x => String(o).startsWith(x)); return k < 0 ? order.length : k; };
if (!fails.length) L.push('NADA FALHOU.');
else {
  L.push(`O QUE FALHOU (${fails.length}), por dono provável:`);
  for (const f of fails.sort((a, b) => ownKey(a.owner) - ownKey(b.owner))) L.push(`  [${f.owner}] ${f.what}: ${f.why}`);
}
if (look.length) { L.push(''); L.push(`PARA OLHAR (não falha: S3/S4, avisos, medidas que subiram) — ${look.length}:`); for (const f of look.sort((a, b) => ownKey(a.owner) - ownKey(b.owner)).slice(0, 40)) L.push(`  [${f.owner}] ${f.what}: ${f.why}`); }
const txt = L.join('\n') + '\n';
fs.writeFileSync(path.join(OUT, 'relatorio.txt'), txt); process.stdout.write(txt);
process.exit(fails.length ? 1 : 0);
