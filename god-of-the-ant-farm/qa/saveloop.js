// save → load → save → load: what one load changes (s1 vs s2) and whether the save is a fixed point (s2 vs s3)
const strip = o => { delete o.savedAt; for (const v of o.villagers || []) { delete v.think; delete v.scan; } return o; };
const DEF0 = new Set(['hood', 'dz', 'robe', 'sac', 'wind', 'stormT']);
const diffs = (a, b, path, out, lim) => {
  if (out.length >= lim) return;
  if (a === b) return;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') { out.push(`${path}: ${JSON.stringify(a)?.slice(0, 80)} → ${JSON.stringify(b)?.slice(0, 80)}`); return; }
  if (Array.isArray(a) !== Array.isArray(b)) { out.push(`${path}: array≠obj`); return; }
  if (Array.isArray(a)) {
    if (a.length !== b.length) out.push(`${path}: length ${a.length} → ${b.length}`);
    for (let i = 0; i < Math.min(a.length, b.length); i++) diffs(a[i], b[i], `${path}[${i}]`, out, lim);
    return;
  }
  const ks = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of ks) { if (!(k in a) && DEF0.has(k)) continue; if (!(k in a)) { out.push(`${path}.${k}: (ausente) → ${JSON.stringify(b[k])?.slice(0, 60)}`); continue; } if (!(k in b)) { out.push(`${path}.${k}: ${JSON.stringify(a[k])?.slice(0, 60)} → (ausente)`); continue; } diffs(a[k], b[k], `${path}.${k}`, out, lim); }
};
const res = {};
G.Village.forceUpdate();
const s1 = G.Save.serialize(); G.UI.select(null); G.Save.apply(JSON.parse(s1));
const s2 = G.Save.serialize(); G.Save.apply(JSON.parse(s2));
const s3 = G.Save.serialize(); G.Save.apply(JSON.parse(s3));
const s4 = G.Save.serialize();
const o1 = strip(JSON.parse(s1)), o2 = strip(JSON.parse(s2)), o3 = strip(JSON.parse(s3)), o4 = strip(JSON.parse(s4));
const d12 = [], d23 = [], d34 = []; diffs(o1, o2, '', d12, 400); diffs(o2, o3, '', d23, 120); diffs(o3, o4, '', d34, 60);
// group the first load's changes by their path shape
const shape = p => p.replace(/\[\d+\]/g, '[]');
const g = {}; for (const d of d12) { const k = shape(d.split(':')[0]); (g[k] = g[k] || []).push(d); }
res.bytes = s1.length; res.load1 = Object.entries(g).map(([k, l]) => `${k} ×${l.length}: ${l[0]}`).slice(0, 60);
res.load2 = d23.slice(0, 40); res.load3 = d34.slice(0, 20);
// and the world keeps living after all that
const v0 = QA.check().length; QA.run(0.5); res.after = QA.check().filter(q => q.sev <= 2).map(q => `[${q.sev}] ${q.msg}`).slice(0, 10); res.v0 = v0;
return res;
