// geometria: o relatório geométrico por prédio (Parte 7.4, D-087). Para cada prédio com planta, cada achado é FALHA (um
// defeito: a planta que não se arma, a entrada que falta, o lance sem patamar onde o corpo fica, o piso ou o cômodo que a
// porta não alcança, o porão baixo, o lugar de uso onde o corpo não fica, a casca fora do lote) ou ESCOLHA (legítima, com o
// motivo: a escada de mão ou a íngreme onde a escada não cabe, o chão aberto sem porta, o cômodo restrito que a receita
// declara, quem dorme no chão guardado da casa, a família em que o mundo funda a casa que a do registro não abriga); o
// resumo por tipo, e o JSON para a matriz (por tipo: plantas, falhas, escolhas, os motivos).
//   node qa/geometria.js                            (sem mundo: os tipos × povos × 2 contextos × 2 lados, prédios de mentira)
//   node qa/geometria.js <mundo> [saída.json]       (com mundo: todos os prédios do mundo pronto — a porta da rua também)
const path = require('path');
const M = require('./nodemundo.js');
const args = process.argv.slice(2); const WORLD = args[0] && !args[0].endsWith('.json') ? args[0] : null; const OUT = args.find(a => a.endsWith('.json')) || null;
const G = M.load({ extra: ['js/space.js'] }); const In = G.Interiors, Sp = G.Space;
if (WORLD) M.pronto(WORLD);
else G.S = { villagers: new Map(), buildings: new Map(), dead: new Map(), settlements: new Map(), clock: 100, day: 3, time: 0.4, avatar: null, nextId: 1000, history: [], fire: new Float32Array(G.N * G.N) };
const CTX = [{ k: '', cl: 't', fl: 0, d: 1, w: 0, e: 1 }, { k: 'a', cl: 't', fl: 0, d: 3, w: 1, e: 3 }];
const SLOPE_MAX = { escada: 50, degraus: 45 }; // (D-086: above these, the flight is of the next class — a class that says less is a defect)
// the findings of one plan: [{ k: 'FALHA'|'ESCOLHA', what }]
function findings(b, p, rec) {
  const out = []; const F = w => out.push({ k: 'FALHA', what: w }), E = w => out.push({ k: 'ESCOLHA', what: w });
  if (!p || !p.ok) {
    const g = In.TYPES[rec.t] && In.TYPES[rec.t].use === 'casa' && In.holdingFam ? In.holdingFam(b, rec) : null;
    if (g) E(`a família ${rec.f} não abriga a casa neste lote: o mundo a funda em ${g}`); else F(`a planta não se arma (${(p && p.errs || []).slice(0, 2).join('; ') || 'sem planta'})`);
    return out;
  }
  // (the way in: an entrance, from the street to a room; an open ground has none — it is walked on from every side)
  if (!p.entrance) F('sem entrada');
  else if (p.entrance.door < 0) { if (p.shell.kind === 'aberta') E('chão aberto, sem porta: entra-se de todo lado'); else F('a entrada sem porta'); }
  if (WORLD && b.built && b.blocks && Sp.entryFits && In.shellOf) { const e = Sp.entryFits(b, In.shellOf(b)); const said = In.entrySaid ? In.entrySaid(b) : undefined; if (!e.ok && said !== false) F(`a entrada não cabe diante da porta (${e.kind}, o pé a ${e.foot} m)`); else if (!e.ok) E('a entrada não cabe em lado nenhum aberto à rua (dito pela virada do dia)'); }
  if (WORLD && b.built && b.blocks && G.Vg && G.Vg.planDoor === In.planDoor) { const pd = In.planDoor(b), d = G.Vg.door(b); if (pd && (Math.abs(pd[0] - d[0]) > 1e-6 || Math.abs(pd[1] - d[1]) > 1e-6)) F('quem sai não sai pela porta da planta'); }
  // (the flights: their ends where a body stands; their class by their slope — a ladder or a steep stair a choice, said)
  for (const s of p.stairs) {
    if (s.kind === 'degraus') continue;
    if (In.landsAt && (!In.landsAt(p, s.lv0, s.a[0], s.a[1]) || !In.landsAt(p, s.lv1, s.b[0], s.b[1]))) F(`o corpo não cabe no ${In.landsAt(p, s.lv0, s.a[0], s.a[1]) ? 'topo' : 'pé'} do lance ${s.lv0}→${s.lv1}`);
    const cls = s.cls || (s.kind === 'escada-de-mao' ? 'mao' : 'escada'); const deg = s.slope !== undefined ? Math.round(s.slope) : null;
    if (cls === 'mao') E(`escada de mão ${s.lv0}→${s.lv1}${deg !== null ? ` (${deg}°)` : ''}`);
    else if (cls === 'ingreme') E(`escada íngreme ${s.lv0}→${s.lv1}${deg !== null ? ` (${deg}°)` : ''}`);
    else if (deg !== null && SLOPE_MAX[cls] && deg > SLOPE_MAX[cls] + 0.5 && !s.larga) F(`${cls} de ${deg}° (mais que ${SLOPE_MAX[cls]}°: a classe não diz o lance)`);
  }
  // (each storey and each room reached from the door — a room the recipe declares restricted, a choice)
  const n = p.grid ? p.grid.n : 0, cs = p.grid ? p.grid.cs : 0.25; const R = p.reach || {};
  const hit = (lv, r) => { const g = R[lv]; if (!g) return false; for (let z = Math.max(0, Math.floor(r[1] / cs)); z <= Math.min(n - 1, Math.floor(r[3] / cs)); z++) for (let x = Math.max(0, Math.floor(r[0] / cs)); x <= Math.min(n - 1, Math.floor(r[2] / cs)); x++) if (g[z * n + x]) return true; return false; };
  for (const l of p.levels) { const rooms = p.rooms.filter(m => m.lv === l.lv); if (!rooms.length) continue; if (!rooms.some(m => hit(l.lv, m.r))) { if (rooms.every(m => m.restrito)) E(`piso ${l.lv} restrito`); else F(`piso ${l.lv} (${l.kind}) que a porta não alcança`); } }
  for (const m of p.rooms) if (!hit(m.lv, m.r)) { if (m.restrito) E(`cômodo ${m.fn} restrito (piso ${m.lv})`); else if (p.levels.some(l => l.lv === m.lv)) F(`cômodo ${m.fn} (piso ${m.lv}) que a porta não alcança`); }
  // (a cellar: its headroom — 1.8 m at least where one walks in it)
  for (const l of p.levels) if (l.kind === 'porao' && l.h !== undefined && l.h < 1.8 - 1e-6) F(`porão com ${l.h.toFixed(2)} m de pé-direito`);
  // (the places of use: each use of each piece with a place where a body is)
  for (const it of p.items) { const uses = [...new Set(it.spots.map(q => q.use))].filter(u => u !== 'acesso' && u !== 'entrar'); for (const u of uses) if (!it.spots.some(q => q.use === u && q.ok)) F(`o corpo não fica em ${(In.ITEMS[it.kind] || {}).name || it.kind} (${u}, piso ${it.lv})`); }
  // (the shell inside the lot)
  const L = p.lot ? p.lot.w : 4; const sh = p.shell; const r = sh.kind === 'round' ? [sh.cu - sh.rad, sh.cv - sh.rad, sh.cu + sh.rad, sh.cv + sh.rad] : sh.r;
  if (r && (r[0] < -1e-3 || r[1] < -1e-3 || r[2] > L + 1e-3 || r[3] > L + 1e-3)) F(`a casca sai do lote (${JSON.stringify(r)} num lote de ${L} m)`);
  // (who sleeps on a floor kept for them: said by the plan)
  if (p.short) E(`${p.short} ${p.short > 1 ? 'dormem' : 'dorme'} no chão guardado da casa`);
  return out;
}
// the buildings: the world's, or one of each type, people, context and side
const list = [];
if (WORLD) { for (const b of G.S.buildings.values()) if (b.ip && In.TYPES[b.ip.t] && b.type !== 'ruin') list.push({ b, rec: b.ip }); }
else {
  let nid = 9001;
  for (const t of Object.keys(In.TYPES)) for (const c of Object.keys(In.TRAD)) for (const x of CTX) {
    const def = G.BDEF[t]; if (!def) continue; const rec0 = { v: 4, f: '', r: 0, t, u: In.TYPES[t].use, s: 'S', o: 0, c, e: x.e, k: x.k, cl: x.cl, fl: x.fl, d: x.d, w: x.w, pw: 0, h: [], m: 0, fx: [], dr: {}, hh: 0, nm: 0, vz: 0, ab: 0 };
    const ok = In.familiesFor(rec0).ok; const T = In.TYPES[t]; const pool = T.prefer ? T.prefer(rec0, ok) : ok; if (!pool.length) continue;
    for (const s of ['S', 'E']) { const b = { id: (nid += 53), type: t, x: 10, y: 10, w: def.w, h: def.h, built: true }; const rec = Object.assign({}, rec0, { f: pool[nid % pool.length], s }); b.ip = rec; list.push({ b, rec }); }
  }
}
const byType = new Map(); let nF = 0, nE = 0; const lines = [];
for (const { b, rec } of list) {
  const p = WORLD ? In.plan(b) : In.make(b, rec); const fs = findings(b, p, rec);
  let T = byType.get(rec.t); if (!T) byType.set(rec.t, T = { plantas: 0, falhas: 0, escolhas: 0, motivos: {} }); T.plantas++;
  for (const f of fs) { if (f.k === 'FALHA') { T.falhas++; nF++; } else { T.escolhas++; nE++; } const key = f.k + ': ' + f.what.replace(/\d+(\.\d+)?/g, 'N'); T.motivos[key] = (T.motivos[key] || 0) + 1; }
  if (fs.some(f => f.k === 'FALHA')) lines.push(`${rec.t}#${b.id} ${rec.c} ${p && p.fam ? p.fam : rec.f}: ${fs.map(f => f.k + ' ' + f.what).join(' · ')}`);
}
for (const l of lines.slice(0, 40)) console.log('   ✗ ' + l);
console.log(`--- por tipo (plantas · falhas · escolhas)`);
for (const [t, T] of [...byType.entries()].sort()) { const top = Object.entries(T.motivos).sort((a, c) => c[1] - a[1]).slice(0, 3).map(([k, v]) => `${k} ×${v}`).join('; '); console.log(`   ${t.padEnd(12)} ${String(T.plantas).padStart(4)} · ${String(T.falhas).padStart(3)} · ${String(T.escolhas).padStart(4)}${top ? '  — ' + top : ''}`); }
if (OUT) { require('fs').writeFileSync(OUT, JSON.stringify(Object.fromEntries(byType), null, 1)); console.log(`gravado ${path.relative(process.cwd(), OUT)}`); }
const err = M.erros(); const modErr = Object.keys(err.mod).length || err.console.length;
console.log(`${nF ? 'FALHOU' : 'PASSOU'} | geometria ${list.length} prédios${WORLD ? ' do mundo ' + WORLD : ' de mentira'}: ${nF} falhas, ${nE} escolhas${modErr ? '; erros: ' + JSON.stringify(err).slice(0, 200) : ''}`);
process.exit(nF || modErr ? 1 : 0);
