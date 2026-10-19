// planta-ver: uma planta desenhada em texto, piso por piso (para quem faz e para quem confere)
//   node qa/planta-ver.js tipo povo família [id] [lado] [contexto JSON]
//   ex.: node qa/planta-ver.js house nordico integrado.terreo 1001 S '{"cl":"t","w":0}'
// a grade de 25 cm: ' ' fora · '.' piso · '#' parede · 'M' móvel sólido · 'b' móvel baixo (cama, banco) · 'E' escada ·
// '+' porta ou vão · '~' vazio (sem piso) · ',' teto baixo · '=' alçapão; o que se alcança da porta a pé aparece como ':'
const M = require('./nodemundo.js');
const G = M.load({}); const In = G.Interiors;
// node qa/planta-ver.js diag tipo povo [contexto JSON]: para cada família do tipo, por que cai (cada id de prova, a primeira falha)
if (process.argv[2] === 'diag') {
  const [, , , type, c, ctxS] = process.argv; const def = G.BDEF[type];
  const ctx = Object.assign({ k: 'a', cl: 't', fl: 0, d: 1, w: 0, e: 3 }, ctxS ? JSON.parse(ctxS) : {});
  const rec = { v: 1, f: '', r: 0, t: type, u: In.TYPES[type].use, s: 'S', o: 0, c, e: ctx.e, k: ctx.k, cl: ctx.cl, fl: ctx.fl, d: ctx.d, w: ctx.w, pw: 0, h: [], m: 0, fx: [], dr: {} };
  for (const f of In.TYPES[type].fams) {
    const F = In.FAMS[f]; const why = F.can ? F.can(rec, In.TYPES[type], In.TRAD[c]) : null;
    if (why) { console.log(`  ${f.padEnd(22)} regra: ${why}`); continue; }
    const out = []; for (const id of [101, 2203, 30307, 404011, 5551, 6661]) { const b = { id, type, x: 10, y: 10, w: def.w, h: def.h }; const p = In.makeFam(b, rec, f); out.push(p.ok ? 'ok' : (p.errs[0] || '?')); }
    console.log(`  ${f.padEnd(22)} ${out.filter(o => o === 'ok').length}/6  ${[...new Set(out.filter(o => o !== 'ok'))].slice(0, 3).join(' · ')}`);
  }
  process.exit(0);
}
const [type, c, f, idS, side, ctxS] = process.argv.slice(2);
const def = G.BDEF[type]; const ctx = Object.assign({ k: 'a', cl: 't', fl: 0, d: 1, w: 0, e: 3 }, ctxS ? JSON.parse(ctxS) : {});
const b = { id: +(idS || 1001), type, x: 10, y: 10, w: def.w, h: def.h };
const rec = { v: 1, f, r: 0, t: type, u: In.TYPES[type].use, s: side || 'S', o: 0, c, e: ctx.e, k: ctx.k, cl: ctx.cl, fl: ctx.fl, d: ctx.d, w: ctx.w, pw: 0, h: [], m: 0, fx: [], dr: {} };
const p = In.make(b, rec);
console.log(`${type}/${c}/${p.fam} (${p.famName}) #${b.id} lado ${rec.s}: ${p.ok ? 'VÁLIDA' : 'INVÁLIDA'}${p.fell ? ' (a família ' + p.fell + ' caiu: ' + (p.errsOf || []).join('; ') + ')' : ''}`);
if (p.errs.length) console.log('  erros: ' + p.errs.join(' · '));
console.log(`  casca ${JSON.stringify(p.shell.kind === 'round' ? { r: p.shell.r, cx: p.shell.cx } : { x: p.shell.x, z: p.shell.z, sx: p.shell.sx, sz: p.shell.sz })} parede ${p.shell.t} m ${p.shell.mat}; telhado ${JSON.stringify(p.shell.roof)}`);
console.log(`  lugares ${p.cap.places} · postos ${p.cap.jobs} · assinatura ${p.sig}`);
for (const m of p.rooms) console.log(`  cômodo ${m.id} ${m.fn} piso ${m.lv} [${m.r.join(', ')}]${m.open ? ' (aberto)' : ''}`);
for (const it of p.items) console.log(`  ${it.kind.padEnd(14)} piso ${it.lv} cômodo ${it.room} em (${it.x}, ${it.z}) ${it.w}×${it.d} ry ${it.ry}${it.places ? ' lugares ' + it.places : ''}`);
for (const s of p.stairs) console.log(`  ${s.kind} ${s.lv0}→${s.lv1} [${s.r.join(', ')}] pé (${s.a.join(', ')}) topo (${s.b.join(', ')})`);
const CH = { 0: ' ', 1: '.', 2: '#', 3: 'M', 4: 'b', 5: 'E', 6: '+', 7: '~', 8: ',', 9: '='};
for (const l of p.levels) {
  const g = p.grid.lv[l.lv]; const n = p.grid.n; const seen = p.reach && p.reach[l.lv];
  console.log(`  — piso ${l.lv} (${l.kind}, y ${l.y}, h ${l.h})  N em cima, S embaixo`);
  for (let z = 0; z < n; z++) { let row = '    '; for (let x = 0; x < n; x++) { const k = g[z * n + x]; row += seen && seen[z * n + x] && k === 1 ? ':' : CH[k]; } console.log(row); }
}
