// plantas: o que cada planta tem hoje — os pisos, os cômodos, os móveis, as portas de dentro, as escadas, os lugares —, nos
// prédios de verdade dos mundos prontos (metrópole e megalópole) e em plantas de amostra de cada tipo × povo × degrau
// node plantas.js > plantas.json   (só lê o jogo; nada escreve no repositório)
const M = require('../nodemundo.js');
const G = M.load({ qa: true }); const In = G.Interiors; const Es = G.Escala;
const r2 = x => Math.round(x * 100) / 100;
const now = () => Number(process.hrtime.bigint()) / 1e6;
function sum(p) {
  const o = { ok: !!p.ok, fam: p.fam || '', errs: (p.errs || []).slice(0, 2), levels: [], rooms: [], items: {}, nItems: 0, innerDoors: 0, innerKinds: {}, outerDoors: 0, stairs: {}, uses: {}, tiers: (p.tiers || []).length, marks: (p.marks || []).length, mainArea: 0, mainFn: '', mainOcc: 0, mainH: 0, floorArea: 0, sig: '', isig: '', openRooms: 0, maxH: 0 };
  if (!p.rooms) return o;
  for (const l of p.levels || []) { o.levels.push(l.kind + '@' + r2(l.h)); if (l.h > o.maxH) o.maxH = l.h; }
  const area = r => (r[2] - r[0]) * (r[3] - r[1]);
  const entryLv = p.entryLv || 0;
  for (const m of p.rooms) {
    const a = In.roomArea(m); o.floorArea += a; if (m.open) o.openRooms++;
    const its = (p.items || []).filter(it => it.room === m.id && !it.tier && !it.mark);
    const fa = its.reduce((s, it) => s + area(it.r), 0);
    o.rooms.push({ fn: m.fn, lv: m.lv, a: r2(a), open: m.open, occ: a ? Math.round(100 * fa / a) : 0, it: its.map(it => it.kind) });
    if (m.lv === entryLv && a > o.mainArea && !m.open) { o.mainArea = r2(a); o.mainFn = m.fn; o.mainOcc = a ? Math.round(100 * fa / a) : 0; const L = (p.levels || []).find(l => l.lv === m.lv); o.mainH = L ? r2(L.h) : 0; }
  }
  if (!o.mainArea) for (const m of p.rooms) { const a = In.roomArea(m); if (a > o.mainArea) { o.mainArea = r2(a); o.mainFn = m.fn + (m.open ? '*' : ''); } }
  for (const it of p.items || []) {
    if (it.tier || it.mark) continue; o.items[it.kind] = (o.items[it.kind] || 0) + 1; o.nItems++;
    for (const sp of it.spots || []) o.uses[sp.use] = (o.uses[sp.use] || 0) + 1;
  }
  for (const T of p.tiers || []) { const u = T.use || 'assistir'; o.uses[u] = (o.uses[u] || 0) + (T.seats || T.n || 1); }
  for (const Mk of p.marks || []) o.uses[Mk.use] = (o.uses[Mk.use] || 0) + 1;
  for (const d of p.doors || []) { if (d.outer) o.outerDoors++; else { o.innerDoors++; o.innerKinds[d.kind + (d.arch ? '-arco' : '')] = (o.innerKinds[d.kind + (d.arch ? '-arco' : '')] || 0) + 1; } }
  for (const s of p.stairs || []) o.stairs[s.kind] = (o.stairs[s.kind] || 0) + 1;
  o.floorArea = r2(o.floorArea);
  try { o.sig = In.signature(p); } catch (e) { o.sig = '?'; }
  o.isig = (p.items || []).filter(it => !it.tier && !it.mark).map(it => it.kind + ':' + it.r.map(x => Math.round(x * 4)).join(',')).sort().join(';');
  return o;
}
const out = { real: [], sample: [] };
for (const w of ['metropole', 'mega']) {
  M.pronto(w); const S = G.S;
  for (const b of S.buildings.values()) {
    if (!b.ip || !In.TYPES[b.ip.t] || !b.built) continue;
    const t0 = now(); In.uncache(); let p; try { p = In.plan(b); } catch (e) { p = { ok: false, errs: ['erro: ' + e.message] }; }
    const ms = now() - t0;
    const o = sum(p); o.w = w; o.id = b.id; o.t = b.type; o.c = b.style; o.n = b.w; o.esc = b.esc; o.ms = r2(ms); o.rd = b.ip.d; o.rw = b.ip.w; o.recf = b.ip.f;
    out.real.push(o);
  }
}
// the samples: every type with a plan, every people, every step its plans or forms lay out, two ids
let ID = 50001;
for (const t of Object.keys(In.TYPES)) {
  const T = In.TYPES[t]; if (!G.BDEF[t]) continue;
  const steps = Es.steps(t);
  for (const c of Object.keys(In.TRAD)) for (const st of steps) {
    const n = st.n; if (!(In.sizeOk(t, c, n) || (G.Forma.has(t, c) && G.Forma.has(t, c, n)))) continue;
    for (const id of [ID += 1017, ID += 2203]) {
      const b = { id, type: t, x: 10, y: 10, w: n, h: n, built: 1, style: c, set: 0 };
      const rec = { v: In.REC_V, f: '', r: 0, t, u: T.use, s: 'S', o: 0, c, e: 3, k: 'ae', cl: 't', fl: 0, d: 1, w: st.familia ? 2 : 1, pw: 0, n, h: [], m: 0, fx: [], dr: {}, hh: 0, nm: 0, vz: 0, ab: 0 };
      const c0 = In.familiesFor(rec); const pool = T.prefer ? T.prefer(rec, c0.ok) : c0.ok; rec.f = pool[0] || (T.fams || [])[0] || '';
      b.ip = rec; const t0 = now(); let p; try { p = In.make(b, rec); } catch (e) { p = { ok: false, errs: ['erro: ' + e.message] }; }
      const o = sum(p); o.t = t; o.c = c; o.n = n; o.esc = st.id; o.ms = r2(now() - t0); o.recf = rec.f; o.famsOk = c0.ok.length;
      out.sample.push(o);
    }
  }
}
console.log(JSON.stringify(out));
if (!M.limpo()) console.error('erros', JSON.stringify(M.erros()).slice(0, 600));
