// fogo-pedra: o fogo nos monumentos de pedra (T-771, D-219) — Bairros Vivos, o agente M, 3ª rodada, em Node, num mundo pronto.
// Medido (qa/patch3/bloco-M2.md, seção 1b): todo prédio que pegava fogo queimava até o chão se não chovesse, e ninguém apaga —
// na semente 7, Mênfis perdeu o palácio de 24 m quatro anos depois dos vinte e um que levou para erguê-lo, e Argos o seu em
// obra. Pedra não queima como palha: o degrau maior de obra pública PRONTO é ferido pelo fogo (o que é de madeira: a parte de
// madeira da conta dele) e fica de pé; o fogo passa devagar por ele e não se alimenta mais dele depois; a obra EM CURSO perde
// os andaimes e a madeira, e fica com a pedra. As casas, os prédios do degrau clássico, o deus e a guerra, como antes.
//   p1  o monumento pronto aceso de propósito pelo deus, quantas vezes ele quiser: fica de pé, com a resistência no que o fogo
//       deixa (V.fireFloor) e a marca do que o fogo levou (b.burnHp); o fogo apaga nele e não pega de novo; a crônica. O mesmo
//       fogo num teatro do degrau clássico e numa casa: ruína
//   p2  o fogo não se alastra por ele como por uma fileira de cabanas: aceso num canto, as casas dele em chamas depois de meio
//       minuto contra o mesmo prédio queimando como casa (o controle da própria prova)
//   p3  o save no meio do fogo: o mesmo fim, e o mesmo futuro duas vezes
//   p4  a chuva no meio: o fogo apaga antes, a resistência fica entre o máximo e o que o fogo deixa, e ele ainda pode pegar
//   p5  o raio, o meteoro e o cerco continuam a derrubar; o fogo sozinho, por mais que seja, não
//   p6  a obra grande em curso: o fogo leva a madeira — a do canteiro, pelo livro —, e a obra fica, com a pedra que tinha e a
//       madeira por trazer de novo; não alimenta mais o fogo; a crônica. Uma obra comum em curso: ruína. Acabada depois, a
//       obra está inteira (a madeira que o fogo levou foi trazida de novo, pelo livro)
//   p7  o motim (Mênfis da semente 103 perdeu o palácio de 24 m para uma multidão): as tochas e as pedras do motim, pelas
//       portas do próprio motim, ferem o palácio de pedra até o que o fogo deixa e não o derrubam — o mesmo, sem a regra (o
//       controle da própria prova), é ruína; e um motim de verdade, com o save no meio do fogo
//   p8  o salão de madeira do povo do norte: pronto, queima até o chão como uma casa, e o fogo passa por ele como por uma casa
//       (nunca mais depressa); em obra, guarda a pedra como toda obra grande, e acabado está inteiro
//   node qa/fogo-pedra.js [mundo]        (ONLY=p1,p6 só esses; VERB=1 conta mais)
'use strict';
process.chdir(__dirname);
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['qa/degraus-inv.js', 'qa/canteiro-inv.js', 'qa/aterro-inv.js', 'qa/terra-guardada-inv.js'] });
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null; const VERB = !!process.env.VERB; const MUNDO = process.argv[2] || process.env.MUNDO || 'metropole';
const hr = process.hrtime.bigint(); const ms = () => Number((process.hrtime.bigint() - hr) / 1000000n);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | fogo-pedra ${name} | ${info}`); if (!c) fails.push(name); return c; };
const sim = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
function run(id, fn) { if (ONLY && !ONLY.includes(id)) return; try { fn(); } catch (e) { ok(id, false, 'exceção: ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join(' / ') : e)); } }
let S, V, Es, D, W, N, Nat;
const pega = () => { S = G.S; V = G.Village; Es = G.Escala; D = G.Depot; W = G.W; N = G.N; Nat = G.Nature; return S; };
const lado = b => (b ? `${b.type}#${b.id} ${b.w}×${b.h} em ${b.x},${b.y}` : 'nada');
const marca = () => G.S.logN || 0;
const linhas = (n0, rx) => G.S.history.filter(e => e.n > n0 && rx.test(e.txt));
function checa() {
  const out = []; for (const q of QA.check()) if (q.sev <= 2) out.push(`S${q.sev} ${q.sys}: ${q.msg.slice(0, 150)}`);
  const e = M.erros(); const errs = Object.keys(e.mod).length + e.console.length;
  return { ok: !out.length && !errs, txt: out.length ? out.slice(0, 3).join(' · ') : errs ? 'erros: ' + JSON.stringify(e).slice(0, 240) : 'verificador limpo' };
}
const capital = () => [...new Set(G.Fac.all().filter(f => f.alive).map(f => G.Fac.capitalOf(f.id)).filter(Boolean))].sort((a, c) => V.pop(c.id) - V.pop(a.id) || a.id - c.id)[0];
const casas = b => { const o = []; for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) o.push(y * N + x); return o; };
const emChamas = b => casas(b).filter(i => S.fire[i] > 0).length;
// (the god lights it on purpose: every tile of it — → how many took fire)
const acende = b => sim(() => casas(b).filter(i => Nat.ignite(i, 0.9)).length);
// (lived until no tile of it burns, or it is gone, or T seconds: → the seconds)
function ateApagar(b, T) { let t = 0; for (; t < (T || 600); t += 1) { M.viver(1); const o = S.buildings.get(b.id); if (!o || o.type === 'ruin' || !emChamas(o)) break; } return t; }
// (lit again and again until the fire has nothing more of it, the rain or not: → { vezes, seg })
// (the rain waited out first, and the ground of it dry: a fire lit in the rain is no proof of anything)
function estia(b) { for (let t = 0; t < 600; t++) { const o = S.buildings.get(b.id); if (!o) return; if (!(S.weather.rain > 0.02) && casas(o).every(i => !(S.wet[i] > 0.3))) return; M.viver(1); } }
function queima(b, max) { let vezes = 0, seg = 0; for (let k = 0; k < (max || 8); k++) { estia(b); const o = S.buildings.get(b.id); if (!o || o.type === 'ruin' || !acende(o)) break; vezes++; seg += ateApagar(o); } return { vezes, seg }; }
const abre = () => { M.pronto(MUNDO); pega(); return capital(); };
const grande = (set, built) => sim(() => V.handFound(set, 'teatro', Es.steps('teatro').find(q => q.n === 6).id, { built: !!built, R: 60 }));
const classico = (set, built) => sim(() => V.handFound(set, 'teatro', Es.steps('teatro').find(q => q.n === Es.n0('teatro')).id, { built: !!built, R: 60 }));
const madeira = b => { const c = Es.billOf(b).cost; let tot = 0; for (const k in c) tot += c[k] || 0; return (c.wood || 0) / tot; };
// (by the god's hand: all its timber and half of each other material at the site of a work, in the ledger)
const da = (o, f) => sim(() => { const bill = V.bill(o); for (const m in bill) { const n = m === 'wood' ? bill[m] : Math.floor(bill[m] / 2); const q = Math.min(n, o.need[m] || 0); if (q > 0) { D.make('f:' + f.id, m, q, { code: 'teste' }); D.move('f:' + f.id, 'o:' + o.id, m, q, { code: 'teste' }); } } });
// (and the rest of what it waits for, and the last stone laid)
const acaba = (o, f) => sim(() => { for (const m in o.need) { const q = Math.ceil(o.need[m] || 0); if (q > 0) { D.make('f:' + f.id, m, q, { code: 'teste' }); D.move('f:' + f.id, 'o:' + o.id, m, Math.min(q, o.need[m]), { code: 'teste' }); } } V.completeBuilding(o); });

// ------------------------------ p1: o monumento pronto, aceso de propósito ------------------------------
run('p1', () => {
  const set = abre(); const b = grande(set, true), c = classico(set, true); const casa = [...S.buildings.values()].find(o => o.set === set.id && o.type === 'house' && o.built && o.w === 1);
  if (!ok('p1a o teatro de 24 m, o de 12 e uma casa', !!b && !!c && !!casa && b.built && V.stoneWork(b) && !V.stoneWork(c) && !V.stoneWork(casa), `${set.name}: ${lado(b)} (${b ? b.hp : '-'} de resistência), ${lado(c)} (${c ? c.hp : '-'}), ${lado(casa)}`)) return;
  const max = b.maxHp, piso = V.fireFloor(b), quer = Math.max(1, Math.round(max * (1 - madeira(b)))); const hi = marca();
  const q = queima(b); const o = S.buildings.get(b.id); const L = linhas(hi, /O fogo consumiu o telhado/); const denovo = o ? acende(o) : -1;
  ok('p1b ferido, de pé', !!o && o.type === 'teatro' && o.built && piso === quer && Math.abs(o.hp - piso) < 1e-6 && Math.abs((o.burnHp || 0) - (max - piso)) < 1e-6 && emChamas(o) === 0 && denovo === 0 && L.length === 1 && V.fireFuel(o) === null,
    `aceso ${q.vezes} vez(es) pela mão do deus, ${q.seg} s de fogo: ${o ? (o.type === 'ruin' ? 'RUÍNA' : `de pé com ${o.hp} de ${max}`) : 'SUMIU'} (o que o fogo deixa: a parte que não é madeira da conta, ${quer}); a marca do que o fogo levou ${o ? o.burnHp : '-'}; em chamas agora ${o ? emChamas(o) : '-'} casas; aceso de novo, pegam ${denovo}; «${L.length ? L[0].txt : 'NENHUMA LINHA'}»`);
  const qc = queima(c), qh = queima(casa); const oc = S.buildings.get(c.id), oh = S.buildings.get(casa.id);
  ok('p1c o degrau clássico e a casa queimam como antes', (!oc || oc.type === 'ruin') && (!oh || oh.type === 'ruin'), `o teatro de 12 m, aceso ${qc.vezes} vez(es): ${!oc ? 'saiu do mapa' : oc.type === 'ruin' ? 'ruína' : 'DE PÉ com ' + oc.hp}; a casa, ${qh.vezes} vez(es): ${!oh ? 'saiu do mapa' : oh.type === 'ruin' ? 'ruína' : 'DE PÉ com ' + oh.hp}`);
  const v = checa(); ok('p1d verificador', v.ok, v.txt);
});

// ------------------------------ p2: o fogo passa devagar por ele ------------------------------
run('p2', () => {
  // (the same world, the same dice, the same corner lit: as stone, and — the proof's own control — as a house would burn)
  const vive = comoCasa => {
    const set = abre(); M.reseed(77); const b = grande(set, true); if (!b) return null; const f0 = V.fireFuel;
    if (comoCasa) V.fireFuel = o => (o === b ? 'building' : f0(o));
    try {
      // (the most tiles of it in flames at once in the half minute: with its timber gone in seconds a count at the end says little)
      estia(b); sim(() => Nat.ignite(b.y * N + b.x, 0.9)); let pico = 0; for (let t = 0; t < 30; t++) { M.viver(1); const q = S.buildings.get(b.id); pico = Math.max(pico, q && q.type !== 'ruin' ? emChamas(q) : 36); }
      const o = S.buildings.get(b.id);
      const r = { n: o && o.type !== 'ruin' ? emChamas(o) : 36, pico, hp: o ? o.hp : 0, max: b.maxHp, de: o && o.type !== 'ruin' };
      // (as stone, left to itself: out when the fire has had its timber — a house's fire, half a minute, not two and a half: L-787)
      if (!comoCasa && r.de) { r.seg = 30 + ateApagar(o, 900); const f = S.buildings.get(b.id); r.fim = f ? f.hp : 0; r.piso = V.fireFloor(b); r.ch = f && f.type !== 'ruin' ? emChamas(f) : -1; }
      return r;
    } finally { V.fireFuel = f0; }
  };
  const casa = vive(true), pedra = vive(false);
  ok('p2 o fogo não se alastra por ele', !!casa && !!pedra && pedra.de && casa.pico >= 24 && pedra.pico * 12 <= casa.pico * 5, casa && pedra ? `um canto aceso, meio minuto: queimando como casa, até ${casa.pico} das 36 casas dele em chamas ao mesmo tempo (a resistência ${Math.round(casa.hp)} de ${casa.max}); como pedra, até ${pedra.pico} (${Math.round(pedra.hp)} de ${pedra.max})` : 'a mão do deus não fundou o teatro');
  ok('p2b e apaga sozinho, em menos de um minuto e meio', !!pedra && pedra.ch === 0 && pedra.seg <= 90 && Math.abs(pedra.fim - pedra.piso) < 1e-6, pedra ? `um canto aceso e deixado a si: apagado em ${pedra.seg} s, com ${pedra.fim} de ${pedra.max} (o que o fogo deixa: ${pedra.piso}); em chamas ${pedra.ch}` : 'sem teatro');
});

// ------------------------------ p3: o save no meio do fogo ------------------------------
run('p3', () => {
  const set = abre(); const b = grande(set, true); if (!ok('p3a o teatro de 24 m', !!b, lado(b))) return;
  const piso = V.fireFloor(b); estia(b); sim(() => Nat.ignite(b.y * N + b.x, 0.9)); for (let t = 0; t < 20; t++) M.viver(1); // (one corner lit: the fire half-way)
  const meio = S.buildings.get(b.id); const hp0 = meio.hp, ch0 = emChamas(meio); const save = G.Save.serialize();
  const vive = () => { G.Save.apply(JSON.parse(save)); pega(); M.reseed(99); const o = S.buildings.get(b.id); const antes = [o.hp, emChamas(o), o.burnHp]; const q = queima(o); const f = S.buildings.get(b.id); return { antes, fim: [f ? f.type : '-', f ? f.hp : 0, f ? f.burnHp : 0, f ? emChamas(f) : 0, q.vezes, q.seg] }; };
  const v1 = vive(), v2 = vive();
  ok('p3b o mesmo fogo depois do save', Math.abs(v1.antes[0] - hp0) < 1e-6 && v1.antes[1] === ch0 && hp0 < b.maxHp && hp0 > piso, `com 20 s de fogo: ${hp0.toFixed(1)} de ${b.maxHp}, ${ch0} casas em chamas; depois do save ${v1.antes[0].toFixed(1)}, ${v1.antes[1]} em chamas`);
  ok('p3c o mesmo fim, duas vezes', v1.fim[0] === 'teatro' && Math.abs(v1.fim[1] - piso) < 1e-6 && v1.fim[3] === 0 && JSON.stringify(v1.fim) === JSON.stringify(v2.fim), `as duas vidas do mesmo save: ${JSON.stringify(v1.fim)} e ${JSON.stringify(v2.fim)} (de pé com ${piso})`);
  const v = checa(); ok('p3d verificador', v.ok, v.txt);
});

// ------------------------------ p4: a chuva no meio ------------------------------
run('p4', () => {
  const set = abre(); const b = grande(set, true); if (!ok('p4a o teatro de 24 m', !!b, lado(b))) return;
  const piso = V.fireFloor(b); estia(b); sim(() => Nat.ignite(b.y * N + b.x, 0.9)); for (let t = 0; t < 12; t++) M.viver(1); const antes = S.buildings.get(b.id).hp; // (one corner lit)
  // (the god's rain over it: a divine cloud — and, where the door of the clouds is not there, the tiles put out by the fire's own door)
  sim(() => { if (Nat.addCloud) Nat.addCloud(b.x + 3, b.y + 3, 7, 40, 'divine'); for (const i of casas(b)) Nat.extinguish(i, 1); });
  let t = 0; for (; t < 60 && emChamas(S.buildings.get(b.id)); t++) M.viver(1);
  const o = S.buildings.get(b.id); const hp = o.hp; for (let k = 0; k < 45; k++) M.viver(1); const pega2 = acende(o);
  ok('p4b a chuva apaga, e ele ainda pode pegar', o.type === 'teatro' && hp < b.maxHp && hp > piso + 1e-6 && Math.abs((o.burnHp || 0) - (b.maxHp - hp)) < 1e-6 && pega2 > 0,
    `12 s de fogo (${antes.toFixed(1)} de ${b.maxHp}) e a chuva do deus: apagado em ${t} s com ${hp.toFixed(1)} (o que o fogo deixaria: ${piso}); a marca do fogo ${Number(o.burnHp || 0).toFixed(1)}; passada a chuva e aceso de novo, pegam ${pega2} casas`);
});

// ------------------------------ p5: o deus e a guerra continuam a derrubar ------------------------------
run('p5', () => {
  const set = abre(); const cai = (como, golpe) => { const b = grande(set, true); if (!b) return null; let n = 0; for (; n < 400 && S.buildings.get(b.id) && S.buildings.get(b.id).type !== 'ruin'; n++) sim(() => golpe(S.buildings.get(b.id))); const o = S.buildings.get(b.id); return { como, n, caiu: !o || o.type === 'ruin' }; };
  const fogo = (() => { const b = grande(set, true); if (!b) return null; sim(() => V.damageBuilding(b, 99999, 'fire')); const o = S.buildings.get(b.id); return { de: !!o && o.type === 'teatro', hp: o ? o.hp : 0, piso: V.fireFloor(b) }; })();
  const R = [cai('o raio (40 de cada vez)', o => V.damageBuilding(o, 40, 'lightning')), cai('o meteoro', o => V.damageBuilding(o, 9999, 'meteor')), cai('o cerco (28 por pedra)', o => V.damageBuilding(o, 28, 'siege')), cai('o terremoto (130)', o => V.damageBuilding(o, 130, 'quake'))];
  ok('p5 o deus e a guerra derrubam; o fogo sozinho não', !!fogo && fogo.de && Math.abs(fogo.hp - fogo.piso) < 1e-6 && R.every(q => q && q.caiu), `99999 de dano de fogo de uma vez: ${fogo && fogo.de ? 'de pé com ' + fogo.hp : 'CAIU'}; ${R.map(q => (q ? `${q.como}: ${q.caiu ? 'cai em ' + q.n + ' golpe(s)' : 'NÃO CAI'}` : 'sem lote')).join('; ')}`);
});

// ------------------------------ p6: a obra grande em curso ------------------------------
run('p6', () => {
  const set = abre(); const f = G.Fac.get(set.fac); const b = grande(set, false), c = classico(set, false);
  if (!ok('p6a a obra grande e a obra comum, em curso', !!b && !!c && !b.built && !c.built, `${lado(b)}, a conta ${b ? JSON.stringify(V.bill(b)) : '-'}; ${lado(c)}`)) return;
  da(b, f); da(c, f); const tinha = Object.assign({}, V.delivered(b)); const bill = V.bill(b); const hi = marca();
  // (and what came to the great work laid, as its builders would have it: its progress at what its materials allow)
  b.progress = G.Vg.allowedProgress(b); const p0 = b.progress;
  const L = []; const fn = e => { if (e[3] === 'o:' + b.id || e[4] === 'o:' + b.id) L.push(e.slice()); }; D.onMove.push(fn);
  const q = queima(b); D.onMove.splice(D.onMove.indexOf(fn), 1); const o = S.buildings.get(b.id); const tem = o ? V.delivered(o) : {};
  const fogoLivro = L.filter(e => e[3] === 'o:' + b.id && e[5] === 'wood' && e[8] === 'fogo').reduce((a, e) => a + e[6], 0); const outros = Object.keys(tinha).filter(m => m !== 'wood');
  const cron = linhas(hi, /O fogo levou os andaimes/);
  ok('p6b o fogo leva a madeira, a pedra fica', !!o && o.type === 'teatro' && !o.built && (tinha.wood || 0) > 0 && !(tem.wood > 0) && Math.abs((o.need.wood || 0) - (bill.wood || 0)) < 1e-6 && outros.length > 0 && outros.every(m => (tem[m] || 0) >= tinha[m] - 1e-6) && fogoLivro >= tinha.wood - 1e-6 && emChamas(o) === 0 && V.fireFuel(o) === null && acende(o) === 0 && cron.length >= 1 && p0 > 0.2 && o.progress <= G.Vg.allowedProgress(o) + 1e-9 && o.progress < p0 - 1e-9,
    `o canteiro tinha ${JSON.stringify(tinha)}; aceso ${q.vezes} vez(es), ${q.seg} s de fogo: ${o ? (o.type === 'ruin' ? 'RUÍNA' : `a obra continua (assentada até ${Math.round(100 * p0)}%, de volta a ${Math.round(100 * o.progress)}%: o que a pedra permite), o canteiro com ${JSON.stringify(tem)}, espera ${JSON.stringify(o.need)}`) : 'SUMIU'}; madeira saída do canteiro pelo livro («fogo»): ${fogoLivro}; em chamas ${o ? emChamas(o) : '-'}; «${cron.length ? cron[0].txt : 'NENHUMA LINHA'}»`);
  const qc = queima(c); const oc = S.buildings.get(c.id);
  ok('p6c a obra comum em curso queima como antes', !oc || oc.type === 'ruin', `o teatro de 12 m em obra, aceso ${qc.vezes} vez(es): ${!oc ? 'saiu do mapa' : oc.type === 'ruin' ? 'ruína' : 'CONTINUA, com ' + oc.hp}`);
  const v = checa(); ok('p6d verificador', v.ok, v.txt);
  // (and the work goes on: the save, and timber brought again)
  M.salvarCarregar(); pega(); const o2 = S.buildings.get(b.id); const v2 = checa();
  ok('p6e depois do save', !!o2 && !o2.built && o2.type === 'teatro' && Math.abs((o2.need.wood || 0) - (bill.wood || 0)) < 1e-6 && v2.ok, `${lado(o2)}: espera ${o2 ? JSON.stringify(o2.need) : '-'}; ${v2.txt}`);
  // (finished afterwards: whole — the timber the fire took was brought again)
  if (o2) {
    const piso = V.fireFloor(o2); const era = [o2.hp, o2.burnHp, o2.maxHp]; acaba(o2, f); const v3 = checa();
    ok('p6f acabada depois, está inteira', o2.built && Math.abs(era[0] - piso) < 1e-6 && Math.abs(era[1] - (era[2] - piso)) < 1e-6 && o2.hp === o2.maxHp && !o2.burnHp && v3.ok,
      `queimada em obra: ${era[0]} de ${era[2]}, a marca do fogo ${era[1]}; acabada: ${o2.hp} de ${o2.maxHp}, a marca ${o2.burnHp || 0}; ${v3.txt}`);
  }
});

// ------------------------------ p7: o motim ------------------------------
run('p7', () => {
  M.pronto(process.env.MUNDO_MOTIM || 'mega'); pega();
  const b0 = [...S.buildings.values()].filter(o => o.built && o.type !== 'ruin' && G.Court.isPalace(o.type) && V.stoneWork(o) && G.Fac.get((S.settlements.get(o.set) || {}).fac)).sort((a, c) => c.w - a.w || a.id - c.id)[0];
  if (!ok('p7a um palácio de pedra de degrau maior, pronto', !!b0, b0 ? `${lado(b0)} [${b0.style}] em ${S.settlements.get(b0.set).name}: ${b0.hp} de ${b0.maxHp}, o que o fogo deixa ${V.fireFloor(b0)}` : 'nenhum no mundo')) return;
  const id = b0.id; const save = G.Save.serialize();
  // (the riot's own two doors, as riots.js throws them: a torch on a tile of it — Nat.ignite(i, 0.9) —, a stone — 2 of damage,
  // cause 'riot'. Twelve rounds of four torches and twenty stones, five seconds apart; then the fire left to itself)
  const portas = semRegra => {
    G.Save.apply(JSON.parse(save)); pega(); M.reseed(31); const f0 = V.stoneWork; if (semRegra) V.stoneWork = () => false;
    try {
      estia(S.buildings.get(id)); let tochas = 0;
      for (let k = 0; k < 12; k++) {
        sim(() => {
          const b = S.buildings.get(id); if (!b || b.type === 'ruin') return;
          for (let j = 0; j < 4; j++) { const i = W.idx(b.x + Math.floor(G.R() * b.w), b.y + Math.floor(G.R() * b.h)); if (S.fire[i] <= 0 && Nat.ignite(i, 0.9)) tochas++; }
          for (let j = 0; j < 20; j++) { const o = S.buildings.get(id); if (o && o.type !== 'ruin') V.damageBuilding(o, 2, 'riot'); }
        });
        M.viver(5);
      }
      const o1 = S.buildings.get(id); const seg = o1 && o1.type !== 'ruin' ? ateApagar(o1, 900) : 0;
      const o = S.buildings.get(id); return { tochas, seg, de: !!o && o.type !== 'ruin', hp: o ? o.hp : 0, burn: o ? o.burnHp || 0 : 0, piso: V.fireFloor(b0), max: b0.maxHp, ch: o && o.type !== 'ruin' ? emChamas(o) : 0 };
    } finally { V.stoneWork = f0; }
  };
  const com = portas(false), sem = portas(true);
  ok('p7b as tochas e as pedras do motim ferem e não derrubam', com.de && Math.abs(com.hp - com.piso) < 1e-6 && com.burn <= com.max - com.piso + 1e-6 && com.ch === 0 && !sem.de,
    `240 pedras e ${com.tochas} tochas pelas portas do motim: de pé com ${com.hp} de ${com.max} (o que o fogo deixa: ${com.piso}; o fogo levou ${Math.round(com.burn)}, as pedras o resto), apagado ${com.seg} s depois; o mesmo sem a regra (o controle): ${sem.de ? 'DE PÉ com ' + Math.round(sem.hp) : 'ruína'}`);
  // (a riot of the game itself, against who governs: it marches on the palace — and the save in the middle of its fire)
  G.Save.apply(JSON.parse(save)); pega(); M.reseed(57); const b = S.buildings.get(id); const sid = b.set; const set = S.settlements.get(sid); const f = G.Fac.get(set.fac); estia(b); const hi = marca();
  const R = sim(() => G.Riots.start(f, set, 'tirania', { boost: 2 }));
  if (!ok('p7c um motim de verdade vai ao palácio', !!R && !!R.tg && R.tg.b === id, R ? `${set.name}: ${R.n0} pessoas contra ${R.tg.kind}, o alvo ${R.tg.b === id ? 'o palácio' : '#' + R.tg.b}` : `${set.name}: o motim não nasceu`)) return;
  let t = 0, salvo = -1, queimou = 0;
  for (; t < 900; t++) {
    M.viver(1); let o = S.buildings.get(id); if (!o || o.type === 'ruin') break; if (emChamas(o) > 0) queimou++;
    if (salvo < 0 && queimou >= 8) { M.salvarCarregar(); pega(); salvo = t; o = S.buildings.get(id); }
    if (!G.Riots.active(sid) && !emChamas(o) && t > 40) break;
  }
  const o = S.buildings.get(id); const L = linhas(hi, /Motim em|atirar pedras e tochas|ardeu|cedeu|motim|multidão/i); const v = checa();
  ok('p7d o palácio fica de pé', !!o && o.type === b0.type && o.built && o.hp >= V.fireFloor(o) - 1e-6 && L.some(e => /atirar pedras e tochas/.test(e.txt)) && v.ok,
    `${t} s: ${o && o.type !== 'ruin' ? `de pé com ${Math.round(o.hp)} de ${o.maxHp} (o que o fogo deixa ${V.fireFloor(o)}; a marca do fogo ${Math.round(o.burnHp || 0)})` : 'RUÍNA'}; ${queimou} s em chamas${salvo >= 0 ? ', o save aos ' + salvo + ' s' : ', sem save (não pegou fogo)'}; ${L.slice(0, 4).map(e => '«' + e.txt.slice(0, 110) + '»').join(' ')}; ${v.txt}`);
});

// ------------------------------ p8: o salão de madeira do povo do norte ------------------------------
run('p8', () => {
  M.pronto(MUNDO); pega(); const set = [...S.settlements.values()].filter(s => G.Fac.get(s.fac) && G.Civ.idOfFac(s.fac) === 'nordico' && G.Fac.capitalOf(s.fac) === s).sort((a, c) => V.pop(c.id) - V.pop(a.id))[0];
  if (!ok('p8a uma capital do povo do norte', !!set, set ? `${set.name}, nível ${set.tier}, ${V.pop(set.id)} pessoas` : 'nenhuma no mundo')) return;
  const f = G.Fac.get(set.fac); M.reseed(77); const b = grande(set, true);
  if (!ok('p8b o salão de madeira de 24 m, pronto', !!b && b.style === 'nordico' && V.bigStep(b) && !V.stoneWork(b) && V.fireFuel(b) === 'building', b ? `${lado(b)} [${b.style}] «${V.nameOf(b.type, b)}»: a regra da pedra ${V.stoneWork(b) ? 'VALE' : 'não vale'}, alimenta o fogo como «${V.fireFuel(b)}»` : 'a mão do deus não o fundou')) return;
  // (a corner lit, half a minute: the fire passes through it as through a house; then lit until the fire has all of it)
  estia(b); sim(() => Nat.ignite(b.y * N + b.x, 0.9)); for (let t = 0; t < 30; t++) M.viver(1);
  const o30 = S.buildings.get(b.id); const n30 = o30 && o30.type !== 'ruin' ? emChamas(o30) : 36; const q = queima(b); const o = S.buildings.get(b.id);
  ok('p8c queima até o chão, e o fogo passa por ele como por uma casa', (!o || o.type === 'ruin') && n30 >= 12, `um canto aceso, 30 s depois: ${n30} das 36 casas dele em chamas; aceso mais ${q.vezes} vez(es), ${q.seg} s: ${!o ? 'saiu do mapa' : o.type === 'ruin' ? 'ruína' : 'DE PÉ com ' + o.hp}`);
  const c = grande(set, false); if (!ok('p8d o salão em obra', !!c && !c.built && V.stoneWork(c), lado(c))) return;
  da(c, f); const tinha = Object.assign({}, V.delivered(c)); const qc = queima(c); const oc = S.buildings.get(c.id); const tem = oc ? V.delivered(oc) : {};
  const ficou = !!oc && oc.type === 'teatro' && !oc.built && !(tem.wood > 0) && Object.keys(tinha).filter(m => m !== 'wood').every(m => (tem[m] || 0) >= tinha[m] - 1e-6);
  let fim = '-'; let inteiro = false;
  if (ficou) { acaba(oc, f); inteiro = oc.built && oc.hp === oc.maxHp && !oc.burnHp && !V.stoneWork(oc); fim = `acabado: ${oc.hp} de ${oc.maxHp}, a marca do fogo ${oc.burnHp || 0}, a regra da pedra ${V.stoneWork(oc) ? 'VALE' : 'não vale'}`; }
  const v = checa();
  ok('p8e em obra guarda a pedra; acabado, é de madeira inteiro', ficou && inteiro && v.ok, `o canteiro tinha ${JSON.stringify(tinha)}; aceso ${qc.vezes} vez(es): ${!oc ? 'SUMIU' : oc.type === 'ruin' ? 'RUÍNA' : 'a obra continua, o canteiro com ' + JSON.stringify(tem)}; ${fim}; ${v.txt}`);
});

console.log(fails.length ? `FOGO-PEDRA: FALHOU (${fails.join(', ')})` : `FOGO-PEDRA: ok (${ms()} ms)`);
process.exit(fails.length ? 1 : 0);
