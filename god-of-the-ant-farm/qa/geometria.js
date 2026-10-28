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
const G = M.load({ extra: ['js/space.js'] }); const In = G.Interiors;
if (WORLD) M.pronto(WORLD);
else G.S = { villagers: new Map(), buildings: new Map(), dead: new Map(), settlements: new Map(), clock: 100, day: 3, time: 0.4, avatar: null, nextId: 1000, history: [], fire: new Float32Array(G.N * G.N) };
const CTX = [{ k: '', cl: 't', fl: 0, d: 1, w: 0, e: 1 }, { k: 'a', cl: 't', fl: 0, d: 3, w: 1, e: 3 }];
// the findings of one plan: [{ k: 'FALHA'|'ESCOLHA', what }] — the game's own report (In.report, the one the plan of the dev
// mode shows), with the world when there is one
const findings = (b, p, rec) => In.report(b, p, { world: !!WORLD, rec, holding: 1 });
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
