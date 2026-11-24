// resumo: junta o plantas.json por tipo (os prédios de verdade e as amostras)
// node resumo.js [real|sample] [tipo,…]
const o = require('./plantas.json');
const which = process.argv[2] || 'real'; const only = process.argv[3] ? process.argv[3].split(',') : null;
const L = o[which]; const by = new Map();
for (const p of L) { if (only && !only.includes(p.t)) continue; if (!by.has(p.t)) by.set(p.t, []); by.get(p.t).push(p); }
const med = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const r1 = x => Math.round(x * 10) / 10;
for (const [t, ps] of by) {
  const ok = ps.filter(p => p.ok);
  const civs = {}; for (const p of ps) civs[p.c] = (civs[p.c] || 0) + 1;
  const ns = {}; for (const p of ps) ns[p.n] = (ns[p.n] || 0) + 1;
  const fams = {}; for (const p of ps) fams[p.fam || p.recf] = (fams[p.fam || p.recf] || 0) + 1;
  const items = {}; for (const p of ok) for (const k in p.items) items[k] = (items[k] || 0) + p.items[k];
  const rooms = {}; for (const p of ok) for (const m of p.rooms) { const k = m.fn + '@' + m.lv + (m.open ? '*' : ''); rooms[k] = (rooms[k] || 0) + 1; }
  const lvk = {}; for (const p of ok) lvk[p.levels.length] = (lvk[p.levels.length] || 0) + 1;
  const lvkinds = {}; for (const p of ok) for (const l of p.levels) { const k = l.split('@')[0]; lvkinds[k] = (lvkinds[k] || 0) + 1; }
  const st = {}; for (const p of ok) for (const k in p.stairs) st[k] = (st[k] || 0) + p.stairs[k];
  const ik = {}; for (const p of ok) for (const k in p.innerKinds) ik[k] = (ik[k] || 0) + p.innerKinds[k];
  const uses = {}; for (const p of ok) for (const k in p.uses) uses[k] = (uses[k] || 0) + p.uses[k];
  const nOk = ok.length || 1;
  // diversity: identical furniture layouts within (type, people, n)
  const grp = new Map(); for (const p of ok) { const k = p.c + '|' + p.n; if (!grp.has(k)) grp.set(k, []); grp.get(k).push(p); }
  let pairs = 0, same = 0, sigs = 0, isigs = 0, grpN = 0;
  for (const g of grp.values()) { if (g.length < 2) continue; grpN += g.length; sigs += new Set(g.map(p => p.sig)).size; isigs += new Set(g.map(p => p.isig)).size; for (let i = 0; i < g.length; i++) for (let j = i + 1; j < g.length; j++) { pairs++; if (g[i].isig === g[j].isig) same++; } }
  console.log(`\n### ${t}  (${ps.length} plantas, ${ok.length} ok)  povos ${JSON.stringify(civs)}  lotes ${JSON.stringify(ns)}`);
  console.log(`  famílias ${Object.keys(fams).length}: ${Object.entries(fams).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => k + '×' + v).join(', ')}`);
  console.log(`  cômodo principal: ${[...new Set(ok.map(p => p.mainFn))].join('/')}  m² mediana ${r1(med(ok.map(p => p.mainArea)))} (${r1(Math.min(...ok.map(p => p.mainArea)))}–${r1(Math.max(...ok.map(p => p.mainArea)))}), pé-direito ${r1(med(ok.map(p => p.mainH)))}, ocupado ${med(ok.map(p => p.mainOcc))}%  | chão total mediana ${r1(med(ok.map(p => p.floorArea)))} m²`);
  console.log(`  pisos: ${JSON.stringify(lvk)}  tipos de piso ${JSON.stringify(lvkinds)}  escadas ${JSON.stringify(st)}`);
  console.log(`  portas de dentro: média ${r1(ok.reduce((s, p) => s + p.innerDoors, 0) / nOk)} ${JSON.stringify(ik)}; portas da rua média ${r1(ok.reduce((s, p) => s + p.outerDoors, 0) / nOk)}`);
  console.log(`  cômodos (por planta): ${Object.entries(rooms).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + r1(v / nOk)).join(', ')}`);
  console.log(`  móveis (média ${r1(ok.reduce((s, p) => s + p.nItems, 0) / nOk)} por planta): ${Object.entries(items).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + r1(v / nOk)).join(', ')}`);
  console.log(`  lugares (usos, média): ${Object.entries(uses).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + r1(v / nOk)).join(', ')}`);
  console.log(`  fileiras ${r1(ok.reduce((s, p) => s + p.tiers, 0) / nOk)}, marcas ${r1(ok.reduce((s, p) => s + p.marks, 0) / nOk)}; ms mediana ${r1(med(ps.map(p => p.ms)))} máx ${r1(Math.max(...ps.map(p => p.ms)))}`);
  if (pairs) console.log(`  diversidade: ${grpN} plantas em grupos do mesmo povo e lote — ${sigs} arquiteturas, ${isigs} arranjos de móveis; pares idênticos ${same}/${pairs}`);
  const bad = ps.filter(p => !p.ok); if (bad.length) console.log(`  NÃO ARMA: ${bad.length} — ${bad.slice(0, 2).map(p => p.c + ' n' + p.n + ': ' + p.errs.join('; ')).join(' | ')}`);
}
