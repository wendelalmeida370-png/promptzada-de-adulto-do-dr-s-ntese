// dentro-igual: o que cada prédio mostra por dentro igual ao de uma cópia do jogo de antes (a decoração por uso, F7 — D-1010): em cada
// prédio de pé com planta dos mundos prontos, o G.Atmos.within campo a campo (pelo seu hash, as chaves em ordem), as coisas do
// G.Dentro3D.plan de perto e de longe, as luzes da decoração e o enchimento das peças de guardar (In.state) — à hora do mundo pronto,
// às 0,45 e às 0,8 (a hora posta, não vivida) e, com SEG, depois de viver SEG segundos. Cada árvore do jogo num processo seu.
//   node qa/dentro-igual.js PASTA_DE_ANTES [cidade,metropole,mega] [SEG]
//   MUDA=luz,pano,enchimento …   o que a mudança diz que muda (um defeito consertado, a luz de cada povo): o resto tem de sair igual, e
//                                 as coisas e as luzes só mudam nos prédios onde um campo dito mudou
'use strict';
const path = require('path'), fs = require('fs'), cp = require('child_process');
const here = path.join(__dirname, '..'); const there = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (!there || !fs.existsSync(path.join(there, 'index.html'))) { console.log('FALHOU | dentro-igual | dê a pasta do jogo de antes: node qa/dentro-igual.js PASTA [mundos] [SEG]'); process.exit(1); }
const WORLDS = (process.argv[3] || 'cidade,metropole,mega').split(',').filter(Boolean); const SEG = +(process.argv[4] || 0);
const MUDA = new Set((process.env.MUDA || '').split(',').filter(Boolean));
// (the dump of one tree: run inside it, its own files — qa/visual/tres-node.js of that tree)
const code = (root, world) => `'use strict'; const path = require('path'), crypto = require('crypto');
  const T = require(${JSON.stringify(path.join(root, 'qa', 'visual', 'tres-node.js'))}); const { G, M } = T.load({ qa: false });
  M.pronto(${JSON.stringify(world)}); if (${SEG} > 0) M.viver(${SEG});
  const canon = x => { if (Array.isArray(x)) return x.map(canon); if (x && typeof x === 'object') { const o = {}; for (const k of Object.keys(x).sort()) o[k] = canon(x[k]); return o; } return x; };
  const h = x => crypto.createHash('sha1').update(JSON.stringify(canon(x))).digest('hex').slice(0, 12);
  const Sp = G.Space, At = G.Atmos, D = G.Dentro3D, In = G.Interiors; const out = []; const t0 = G.S.time;
  const ids = [...G.S.buildings.values()].filter(b => b.built && b.type !== 'ruin').map(b => b.id).sort((a, c) => a - c);
  for (const hour of [null, 0.45, 0.8]) { if (hour !== null) G.S.time = hour; if (At.flush) At.flush();
    for (const id of ids) { const b = G.S.buildings.get(id); const p = In.has && In.has(b) ? Sp.planNow(b) : null; if (!p || !p.ok) continue;
      const W = At.within(b); const near = D.plan(b, p, true), far = D.plan(b, p, false); const st = In.state(b); const fill = {};
      if (st) for (const k of Object.keys(st.items).sort((a, c) => a - c)) if (Number.isFinite(st.items[k].fill)) fill[k] = st.items[k].fill;
      out.push([id + '@' + (hour === null ? 'h' : hour), b.type, Object.fromEntries(Object.keys(W).sort().map(k => [k, h(W[k])])), h(near.list.map(t => [t.k, t.x, t.y, t.z, t.ry, t.key, t.why, t.s, t.on, t.lit || 0])), h(far.list.map(t => [t.k, t.x, t.y, t.z, t.ry, t.key])), h(near.fontes), h(fill), near.list.length]); } }
  G.S.time = t0; process.stdout.write(JSON.stringify({ n: out.length, day: G.S.day, err: M.limpo() ? 0 : JSON.stringify(M.erros()), out }));`;
const run = (root, world) => JSON.parse(cp.execFileSync(process.execPath, ['-e', code(root, world)], { maxBuffer: 1 << 28, cwd: root }).toString());
let fails = 0;
for (const world of WORLDS) {
  const a = run(there, world), b = run(here, world); const A = new Map(a.out.map(r => [r[0], r]));
  const by = {}; let diff = 0, bad = 0; const ex = [];
  for (const r of b.out) {
    const q = A.get(r[0]); if (!q) { diff++; bad++; ex.push(`${r[1]}#${r[0]} novo`); continue; }
    const fields = Object.keys(r[2]).filter(k => q[2][k] !== r[2][k]).concat(Object.keys(q[2]).filter(k => !(k in r[2])));
    const what = fields.concat(q[3] !== r[3] ? ['coisas'] : [], q[4] !== r[4] ? ['coisas-longe'] : [], q[5] !== r[5] ? ['luzes'] : [], q[6] !== r[6] ? ['enchimento'] : []);
    if (!what.length) continue; diff++;
    const e = by[r[1]] || (by[r[1]] = { n: 0, f: {} }); e.n++; for (const w of what) e.f[w] = (e.f[w] || 0) + 1;
    // (allowed: a field the change says it changes; the things and the lights of a building where one of those changed; the sig with them)
    const told = fields.filter(k => k !== 'sig').some(k => MUDA.has(k)); const off = what.filter(w => !(MUDA.has(w) || w === 'sig' && told || (w === 'coisas' || w === 'coisas-longe' || w === 'luzes') && told));
    if (off.length) { bad++; if (ex.length < 8) ex.push(`${r[1]}#${r[0]}: ${off.join(', ')}`); }
  }
  for (const k of A.keys()) if (!b.out.some(r => r[0] === k)) { diff++; bad++; ex.push(`#${k} sumiu`); }
  const rows = Object.entries(by).map(([t, e]) => `${t} ${e.n} (${Object.entries(e.f).map(([k, n]) => `${k} ${n}`).join(', ')})`);
  const good = !bad && !a.err && !b.err && b.n > 0;
  console.log(`${good ? 'PASSOU' : 'FALHOU'} | dentro-igual ${world} | ${b.n} prédios-hora (dia ${b.day}${SEG ? `, ${SEG} s vividos` : ''}) contra ${path.basename(there)}: ${diff} diferentes${MUDA.size ? ` (o que muda de propósito: ${[...MUDA].join(', ')})` : ''}${rows.length ? ' — ' + rows.join('; ') : ''}${bad ? '; FORA DO DITO: ' + ex.join(' | ') : ''}${a.err || b.err ? '; erros ' + (a.err || b.err) : ''}`);
  if (!good) fails++;
}
console.log(fails ? `FALHOU: ${fails} mundo(s)` : 'PASSOU'); process.exit(fails ? 1 : 0);
