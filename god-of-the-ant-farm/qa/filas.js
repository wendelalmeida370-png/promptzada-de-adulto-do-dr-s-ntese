// filas: a fila das bancas acha os seus 8 lugares (C1, a decisão do líder) — reta para fora como sempre, dobrando ao
// longo da fachada ou em L quando a rua acaba, sem cortar a porta de outro prédio, sem sair do chão do balcão e sem pôr
// gente na água —, com as portas das plantas desligadas e ligadas, nos mercados dos mundos prontos «metrópole» e
// «mundial».   node qa/filas.js   (em Node)
// f1 cada lugar de banca de cada mercado, com o mercado cheio (as três bancas abertas, cada mercador no seu lugar): os 8
//    lugares, ou o máximo que o chão em volta permite, com o motivo; a busca sem limite não acha mais; e cada lugar
//    conferido pelo teste, à parte da regra: andável, seco, na região do lugar do balcão, a mais de 0,8 de toda porta de
//    outro prédio, fora de onde está um vendedor (o seu e os das outras bancas do mercado), a um passo do anterior. Ao lado,
//    a regra antiga (reta, sem voltar atrás) no mesmo chão
// f2 três dias de mercado na metrópole com as portas ligadas: quem acha a fila cheia e vai embora é raro (contado contra
//    quem chegou ao balcão, e à parte o que foi numa fila com menos lugares que os seus), e as filas do mundo — bancas,
//    poços, lojas — seguem a regra o tempo todo (o verificador)
// e o verificador limpo, sem erro de módulo.
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js', 'js/possess.js', 'qa/atividades-inv.js'] });
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | filas ${name} | ${info}`); if (!c) fails.push(name); };
const B = G.Biz, L = G.Life, W = G.W;
const sim = f => { G.inSim++; const r = f(); G.inSim--; return r; }; // (the doors' rule of a pocket is judged in the world's step)
let S;
// (the old rule, for the side by side: straight out, the first open bend, never back)
function oldLine(x0, y0, dx, dy) {
  const s = [[x0, y0]]; let x = x0, y = y0, a = Math.atan2(dy, dx);
  for (let k = 1; k < B.LINE; k++) {
    let okk = false;
    for (const da of [0, 0.5, -0.5, 1, -1, 1.5, -1.5]) { const nx = x + Math.cos(a + da) * 0.6, ny = y + Math.sin(a + da) * 0.6; if (W.inb(nx, ny) && W.walkableXY(nx, ny)) { x = nx; y = ny; a += da * 0.5; okk = true; break; } }
    if (!okk) break; s.push([x, y]);
  }
  return s;
}
// (each place of a line, judged by the test from the world's fields, apart from the rule that drew it)
function judge(slots, own, avoid) {
  const [x0, y0] = slots[0]; const T = G.T;
  const doors = []; for (const b of S.buildings.values()) if (b.id !== own && b.blocks && b.type !== 'ruin' && Math.abs(b.x + b.w / 2 - x0) < 12 && Math.abs(b.y + b.h / 2 - y0) < 12) { const d = G.Vg.door(b); if (d) doors.push([b, d]); }
  for (let k = 1; k < slots.length; k++) {
    const [x, y] = slots[k], [px, py] = slots[k - 1]; const i = W.idx(x, y);
    if (!W.walkableXY(x, y)) return `o lugar ${k + 1} onde não se pisa`;
    if ((S.type[i] <= T.SEA || S.type[i] === T.RIVER) && !S.road[i] && !(S.dry && S.dry[i])) return `o lugar ${k + 1} na água`;
    if (!W.canWalk(x0, y0, x, y, false)) return `o lugar ${k + 1} noutra região`;
    const d = doors.find(([, p]) => Math.hypot(p[0] - x, p[1] - y) < 0.72); if (d) return `o lugar ${k + 1} diante da porta de ${d[0].type}#${d[0].id}`;
    if (avoid.some(p => Math.hypot(p[0] - x, p[1] - y) < (p[2] || 0.5) - 0.08)) return `o lugar ${k + 1} em cima de um vendedor`;
    if (Math.hypot(x - px, y - py) > 0.75) return `o lugar ${k + 1} longe do anterior`;
    for (let j = 0; j < k - 1; j++) if (Math.hypot(slots[j][0] - x, slots[j][1] - y) < 0.52) return `o lugar ${k + 1} dobrando sobre o ${j + 1}`;
  }
  return '';
}
// ---------------- f1: every stall place of every market, the doors off and on
for (const world of ['metropole', 'mundial']) {
  M.pronto(world); S = G.S;
  for (const doors of [false, true]) {
    G.Vg.planDoor = doors ? G.Interiors.planDoor : null;
    const out = sim(() => {
      const res = { n: 0, full: 0, old: 0, short: [], wrong: [], budget: [], front: 0 };
      const mk = [...S.buildings.values()].filter(b => b.type === 'mercado' && b.built).sort((a, b) => a.id - b.id);
      for (const b of mk) {
        const jobs = (G.BDEF[b.type] && G.BDEF[b.type].jobs) || 3;
        for (let slot = 0; slot < jobs; slot++) {
          const z = B.at(b, slot) || { id: -(b.id * 10 + slot + 1), b: b.id, slot, st: 'on' };
          const sp = B.spots(z); if (!sp) { res.short.push(`#${b.id}/${slot}: sem lugar de balcão`); continue; }
          res.n++;
          // (the market full: the three counters open, each merchant at his place — the line's hardest day)
          const o = B.lineOf(z); o.avoid = [[sp.seller[0], sp.seller[1], 0.3]];
          for (let s2 = 0; s2 < jobs; s2++) if (s2 !== slot) { const p = B.spots(B.at(b, s2) || { id: -(b.id * 10 + s2 + 1), b: b.id, slot: s2, st: 'on' }); if (p) o.avoid.push([p.seller[0], p.seller[1], 0.3]); }
          const r = L.lineAt(sp.buyer[0], sp.buyer[1], sp.dx, sp.dy, o);
          const big = L.lineAt(sp.buyer[0], sp.buyer[1], sp.dx, sp.dy, Object.assign({}, o, { budget: 200000 }));
          const bad = judge(r.slots, o.own, o.avoid); if (bad) res.wrong.push(`#${b.id}/${slot}: ${bad}`);
          if (big.slots.length > r.slots.length) res.budget.push(`#${b.id}/${slot}: ${r.slots.length} contra ${big.slots.length} sem limite`);
          const ol = oldLine(sp.buyer[0], sp.buyer[1], sp.dx, sp.dy); if (ol.length >= B.LINE) res.old++;
          // (with fewer places: the rule's own reason, and what the old rule did there that the new one does not allow)
          const olBad = r.slots.length < B.LINE && ol.length > r.slots.length ? judge(ol, o.own, o.avoid) : '';
          if (r.slots.length >= B.LINE) res.full++; else res.short.push(`#${b.id}/${slot}: ${r.slots.length} — ${r.why || 'SEM MOTIVO'}${ol.length > r.slots.length ? ` (a regra antiga achava ${ol.length}: ${olBad || 'SEM DEFEITO'})` : ''}`);
          // (the counter's own place before another door: the stall's, not the line's — told, not judged)
          for (const q of S.buildings.values()) if (q.id !== b.id && q.blocks && q.type !== 'ruin' && Math.abs(q.x - b.x) < 8 && Math.abs(q.y - b.y) < 8) { const d = G.Vg.door(q); if (d && Math.hypot(d[0] - sp.buyer[0], d[1] - sp.buyer[1]) < 0.8) { res.front++; break; } }
        }
      }
      res.mk = mk.length; return res;
    });
    const noWhy = out.short.filter(s => /SEM MOTIVO/.test(s));
    ok(`f1 ${world}, portas ${doors ? 'ligadas' : 'desligadas'}`, out.n > 0 && !out.wrong.length && !out.budget.length && !noWhy.length,
      `${out.mk} mercados, ${out.n} lugares de banca: ${out.full} com os ${B.LINE} lugares (a regra antiga: ${out.old})${out.short.length ? `; com menos: ${out.short.slice(0, 6).join(' · ')}${out.short.length > 6 ? ` (e mais ${out.short.length - 6})` : ''}` : ''}${out.wrong.length ? `; ERRADOS: ${out.wrong.slice(0, 3).join(' · ')}` : ''}${out.budget.length ? `; A BUSCA PAROU CEDO: ${out.budget.slice(0, 3).join(' · ')}` : ''}${out.front ? `; ${out.front} balcão(ões) com o próprio lugar diante de outra porta (é da banca, não da fila)` : ''}`);
  }
}
// ---------------- f2: three market days of the metropolis, the doors on: the line full is rare; the world's lines keep the rule
{
  M.pronto('metropole'); S = G.S; G.Vg.planDoor = G.Interiors.planDoor;
  const q0 = L.queueFull; let full = 0, short = 0, at = 0; const seen = new Set(); const where = new Map();
  // (counted at the world's own question: a buyer at the counter asks if the line is full — not changed, only counted; a
  // line full with fewer places than its own is the ground's doing, not the crowd's: counted apart)
  L.queueFull = function (key) {
    const r = q0.apply(this, arguments);
    if (r && typeof key === 'string' && key.startsWith('biz:') && G.inSim) { full++; const q = L.queues().find(o => o.key === key); const n = q ? q.slots.length : 0; if (n < B.LINE) short++; where.set(`${key} (${n} lugares${q && q.why ? ': ' + q.why : ''})`, (where.get(`${key} (${n} lugares${q && q.why ? ': ' + q.why : ''})`) || 0) + 1); }
    return r;
  };
  const L0 = S.ledgerN; let fila = new Map(); const t0 = S.clock;
  for (let k = 0; k < 6000; k++) {
    G.debug.step(0.1);
    for (const v of S.villagers.values()) { const t = v.task; if (t && t.type === 'compra' && t.st >= 1 && !seen.has(v.id + ':' + t.biz + ':' + (t.k || ''))) { seen.add(v.id + ':' + t.biz + ':' + (t.k || '')); at++; } }
    if (k % 50 === 49) for (const q of QA.check()) if (q.sys === 'fila') fila.set(q.msg, (fila.get(q.msg) || 0) + 1);
  }
  L.queueFull = q0;
  const sold = G.Depot.ledger().filter(e => e[0] > L0 && e[8] === 'venda').length;
  const lines = L.queues(); const wells = lines.filter(q => q.key.startsWith('well:')).length, shops = lines.filter(q => q.key.startsWith('shop:')).length, stalls = lines.filter(q => q.key.startsWith('biz:')).length;
  const rate = at ? full / at : 0;
  ok('f2 três dias de mercado com as portas ligadas', at >= 20 && rate <= 0.05 && !fila.size,
    `${Math.round(S.clock - t0)} s do mundo: ${at} chegadas ao balcão, ${sold} vendas no livro; ${full} acharam a fila cheia e foram embora (${Math.round(rate * 1000) / 10}%${short ? `; ${short} numa fila com menos que os ${B.LINE} lugares` : ''})${where.size ? ': ' + [...where.entries()].slice(0, 4).map(([k, n]) => `${n}× ${k}`).join(' · ') : ''}; as filas agora: ${stalls} de banca, ${wells} de poço, ${shops} de loja; o verificador das filas: ${fila.size ? [...fila.keys()].slice(0, 3).join(' · ') : 'limpo'}`);
}
// (the checker of the lines and of the activities: what weighs, S0 to S2 — and no module error)
{ const l = QA.check().filter(q => q.sev <= 2 && (q.sys === 'fila' || q.sys === 'act' || q.sys === 'nan')); ok('verificador e módulos', !l.length && M.limpo(), `${l.length ? l.slice(0, 3).map(q => `S${q.sev} ${q.sys}: ${q.msg}`).join(' · ') : 'verificador limpo'} · ${JSON.stringify(M.erros().mod)}`); }
console.log(fails.length ? `FILAS: FALHOU (${fails.join(', ')})` : 'FILAS: ok');
process.exit(fails.length ? 1 : 0);
