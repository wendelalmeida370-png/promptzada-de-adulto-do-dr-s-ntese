// deco: o que a decoração com causa (G.Dentro3D.plan) põe hoje em cada tipo de prédio, na mega (só lê; o desenho não roda)
const M = require('../nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js', 'js/mesh3d.js', 'js/decomesh.js', 'js/movelmesh.js', 'js/movel3d.js', 'js/dentro3d.js'] });
M.pronto(process.argv[2] || 'mega'); M.viver(1);
const S = G.S, In = G.Interiors, D = G.Dentro3D;
console.log('Dentro3D', !!D, 'MESH3D', Object.keys(G.MESH3D || {}).length, 'Luz3D', !!G.Luz3D);
const by = {};
for (const b of S.buildings.values()) {
  if (!b.built || !In.has(b)) continue; const p = In.plan(b); if (!p || !p.ok) continue;
  let o = null; try { o = D.plan(b, p, true); } catch (e) { o = { list: [], err: e.message }; }
  const src = []; const fire = G.Atmos.fire(b), lit = G.Atmos.lit(b); for (const it of p.items) { if (it.fire && fire) src.push({ kind: it.kind }); else if ((it.kind === 'lampadario' || it.kind === 'altar') && lit) src.push({ kind: it.kind }); } try { for (const f of (D.fontes(b) || [])) src.push({ kind: 'deco:' + (f.kind || 'lamparina') }); } catch (e) { src.push({ kind: 'ERRO' }); }
  const r = by[b.type] || (by[b.type] = { n: 0, things: 0, kinds: {}, err: 0, fontes: {}, nf: 0 });
  r.n++; if (o.err) r.err++; r.things += o.list.length; for (const t of o.list) { const k = t.k || t.kind || t.name || '?'; r.kinds[k] = (r.kinds[k] || 0) + 1; }
  for (const s of src) { r.fontes[s.kind] = (r.fontes[s.kind] || 0) + 1; r.nf++; }
}
for (const [t, r] of Object.entries(by).sort((a, c) => c[1].things / c[1].n - a[1].things / a[1].n)) console.log(t.padEnd(16), 'prédios', String(r.n).padStart(4), '| coisas por prédio', (r.things / r.n).toFixed(1).padStart(5), r.err ? '| ERROS ' + r.err : '', '|', Object.entries(r.kinds).sort((a, c) => c[1] - a[1]).slice(0, 10).map(([k, v]) => k + ' ' + (v / r.n).toFixed(1)).join(', '), '| luzes agora', (r.nf / r.n).toFixed(1), JSON.stringify(r.fontes).slice(0, 80));
if (!M.limpo()) console.log('erros', JSON.stringify(M.erros()).slice(0, 500));
