// plantas: a gramática dos interiores provada em Node (segundos, sem navegador): para cada tipo de prédio com interior,
// cada povo e cada contexto (técnica, clima, alagado, densidade, riqueza) e cada lado da entrada, as famílias que valem ali
// (e por que as outras não valem), e para cada família muitas plantas (ids diferentes) — todas válidas pelo próprio
// validador do jogo (cabe no lote, nada sobreposto, todo cômodo e todo lugar de uso alcançados da porta, lugares para
// quem mora, postos para quem trabalha), a mesma assinatura estrutural dentro da família, assinaturas diferentes entre
// famílias, variação de medidas entre ids, e a mesma planta duas vezes para a mesma entrada. Uma casa que a família do
// registro não arma naquele lote o mundo funda na próxima família que abriga a casa (In.holdingFam, a regra da fundação:
// a casa do mundo nunca fica inválida — D-082): conta como caída, à parte; inválida só a que nenhuma família arma.
//   node qa/plantas.js [ids por família] [tipo,tipo...]      (CAT=1 imprime o catálogo inteiro; VERB=1 cada falha)
const M = require('./nodemundo.js');
const crypto = require('crypto');
const G = M.load({});
const In = G.Interiors;
const NID = +(process.argv[2] || 24); const ONLY = process.argv[3] ? process.argv[3].split(',') : null;
const hash = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | plantas ${name} | ${info}`); if (!c) fails.push(name); };
// the contexts a building is founded in (the record's frozen inputs), the ones that matter for a home's plan
const CTX = [
  { k: '', cl: 't', fl: 0, d: 1, w: 0, e: 1 }, { k: 'a', cl: 't', fl: 0, d: 3, w: 1, e: 3 }, { k: 'a', cl: 'q', fl: 0, d: 2, w: 0, e: 3 },
  { k: '', cl: 'f', fl: 0, d: 0, w: 0, e: 1 }, { k: '', cl: 'u', fl: 1, d: 1, w: 0, e: 2 }, { k: 'ae', cl: 't', fl: 0, d: 2, w: 2, e: 5 },
];
const SIDES = ['S', 'E', 'W', 'N'];
// (the harness stands Date.now still, as the browser tests do: the time is the process's own clock)
const clock = () => Number(process.hrtime.bigint() / 1000n) / 1000;
const t0 = clock(); let nPlans = 0, nBad = 0, nFell = 0, nShort = 0, nGen = 0, nCombo = 0, nHeld = 0; const small = [], byGen = []; const badEx = [], fellEx = [], heldEx = [];
const shortBy = new Map(); const shortEx = [];
// (the dearest plans and attempts as the round measured them — on a busy machine a cheap one is now and then measured a
// hundred times dearer: the candidates, made again at the end, are the ones the round put on top and each type's own)
const TOP = { plan: [], att: [], planBy: new Map(), attBy: new Map() };
const note = (L, w, n) => { if (L.length >= n && w.ms <= L[L.length - 1].ms) return; L.push(w); L.sort((x, y) => y.ms - x.ms); if (L.length > n) L.pop(); };
const noteBy = (M, k, w, n) => { let L = M.get(k); if (!L) M.set(k, L = []); note(L, w, n); };
const low = (L, ms) => L.length >= 40 && ms <= L[L.length - 1].ms; let nCells = 0, nFloorBad = 0; const floorEx = []; let nShell = 0, nShellBad = 0; const shellEx = [];
for (const type of Object.keys(In.TYPES)) {
  if (ONLY && !ONLY.includes(type)) continue;
  const def = G.BDEF[type]; if (!def) { ok('tipo ' + type, false, 'tipo sem BDEF'); continue; }
  for (const c of Object.keys(In.TRAD)) for (const [ci, ctx] of CTX.entries()) {
    const side = SIDES[(nPlans + c.length) % 4];
    const rec0 = { v: 1, f: '', r: 0, t: type, u: In.TYPES[type].use, s: side, o: 0, c, e: ctx.e, k: ctx.k, cl: ctx.cl, fl: ctx.fl, d: ctx.d, w: ctx.w, pw: 0, h: [], m: 0, fx: [], dr: {} };
    const cat = In.familiesFor(rec0);
    const sigs = new Map();
    for (const f of cat.ok) {
      const seen = new Set(); const fine = new Set();
      for (let q = 0; q < NID; q++) {
        // (other ids in each context: a family the context does not touch — a workshop's — would otherwise be laid out on the
        // same ids six times over, 24 plans in all, and a failure of 1 to 3% of the ids went through: T-083)
        const id = 1000 + (q + ci * NID) * 7919 + c.length * 31;
        const s = SIDES[q % 4]; const b = { id, type, x: 10, y: 10, w: def.w, h: def.h };
        const rec = Object.assign({}, rec0, { f, s, pw: q % 5 === 0 ? 2 : 0 });
        // (each attempt timed too: a plan made a little at a time stops between two of them)
        const a = clock(); let tA = a, nA = 0; const tag = `${type}/${c}/${f} #${id}`;
        In.trace = () => { const t = clock(), ms = t - tA; if (!low(TOP.att, ms)) note(TOP.att, { b, rec, n: nA, tag, ms }, 40); noteBy(TOP.attBy, type, { b, rec, n: nA, tag, ms }, 2); tA = t; nA++; };
        const p = In.make(b, rec); const ms = clock() - a; In.trace = null;
        if (!low(TOP.plan, ms)) note(TOP.plan, { b, rec, n: nA, tag, ms }, 40); noteBy(TOP.planBy, type, { b, rec, n: nA, tag, ms }, 2);
        nPlans++;
        // (a family the catalogue offers may not go on some lot: the plan falls to the next one offered there — always the
        // same —, or is laid out for fewer sleepers, said; an invalid plan is a failure, a fall is counted and must stay rare)
        if (p.short) { nShort++; const k = `${type}/${p.fam}`; shortBy.set(k, (shortBy.get(k) || 0) + 1); if (process.env.VERB) shortEx.push(`${type}/${c}/${JSON.stringify(ctx)}/${s} ${f} #${id} → ${p.fam}: ${p.short} no chão`); }
        // (the shell seen from afar, alone, is the whole plan's — the same family, shell, storeys, holes, way in)
        if (q < 2) { In.uncache(); const s1 = In.shellOf(Object.assign({}, b, { ip: rec })); const strip = o => { const x = Object.assign({}, o); delete x.key; return JSON.stringify(x); }; nShell++; if (!s1 || strip(s1) !== strip(In.shellOfPlan(p))) { nShellBad++; if (shellEx.length < 4) shellEx.push(`${type}/${c}/${f} #${id}`); } }
        if (!p.ok || p.fam !== f) {
          if (p.ok) { nFell++; if (fellEx.length < 6 || process.env.VERB) fellEx.push(`${type}/${c}/${JSON.stringify(ctx)}/${s} ${f} #${id} → ${p.fam}: ${(p.errsOf || []).slice(0, 1).join('; ')}`); continue; }
          // (a home the world founds in the next family that holds its household — In.holdingFam, the founding's own rule: the
          // world never has it invalid; counted apart, and with the falls)
          const g = In.TYPES[type].use === 'casa' && In.holdingFam ? In.holdingFam(b, rec) : null;
          if (g) { nHeld++; nFell++; if (heldEx.length < 6 || process.env.VERB) heldEx.push(`${type}/${c}/${JSON.stringify(ctx)}/${s} ${f} #${id} → ${g}: ${(p.errsOf || p.errs || []).slice(0, 1).join('; ')}`); continue; }
          nBad++; if (badEx.length < 12 || process.env.VERB) badEx.push(`${type}/${c}/${JSON.stringify(ctx)}/${s} ${f} #${id}: ${(p.errsOf || p.errs || []).slice(0, 2).join('; ')}`); continue;
        }
        // (the height of the floor under every cell the grid has as floor, off the flights and the steps: the storey's own —
        // as the body and the 3D read it —, never the ramp of a flight beside it: L-133)
        if (q === 0 && p.grid) for (const l of p.levels) {
          const g = p.grid.lv[l.lv]; if (!g) continue; const n = p.grid.n;
          for (let k = 0; k < n * n; k++) {
            const code = g[k]; if (code === 0 || code === 2 || code === 5 || code === 7) continue; // (out, wall, flight, void)
            const x = (k % n + 0.5) * In.CS, z = (Math.floor(k / n) + 0.5) * In.CS;
            if (p.stairs.some(st => st.kind === 'degraus' && st.lv1 === l.lv && x >= st.r[0] && x <= st.r[2] && z >= st.r[1] && z <= st.r[3])) continue;
            nCells++; const y = In.floorYOf(p, l.lv, x, z); if (Math.abs(y - l.y) > 1e-6) { nFloorBad++; if (floorEx.length < 4) floorEx.push(`${type}/${c}/${f} #${id} piso ${l.lv} (${x}, ${z}): ${y.toFixed(2)} com o piso a ${l.y}`); }
          }
        }
        seen.add(p.sig); fine.add(hash(JSON.stringify([p.shell, p.rooms.map(m => m.r), p.items.map(i => [i.kind, i.x, i.z, i.ry]), p.holes.map(h => [h.wall, h.at])])));
        // the same input, the same plan (a second build outside the cache)
        if (q < 3) { const p2 = In.make(b, rec); if (JSON.stringify(p2.items) !== JSON.stringify(p.items) || p2.sig !== p.sig) ok(`determinismo ${type}/${c}/${f}`, false, `#${id}: duas plantas diferentes da mesma entrada`); }
      }
      if (seen.size > 1) ok(`uma estrutura por família ${type}/${c}/${f}`, false, `${seen.size} assinaturas: ${[...seen].slice(0, 2).join(' | ')}`);
      if (seen.size) { const sg = [...seen][0]; if (sigs.has(sg)) ok(`famílias distintas ${type}/${c}`, false, `${f} e ${sigs.get(sg)} têm a mesma estrutura: ${sg}`); else sigs.set(sg, f); }
      if (NID >= 8 && fine.size < Math.min(4, NID / 2)) ok(`variação dentro da família ${type}/${c}/${f}`, false, `só ${fine.size} plantas diferentes em ${NID} ids`);
    }
    // (fewer than five: legitimate when the architecture allows no more there; a defect when the grammar failed families the
    // architecture allows — the combinations that would reach five if it had not are counted apart, to be brought to zero)
    const n = cat.ok.length, ng = Object.keys(cat.gen).length; nGen += ng; nCombo++;
    const tag = `${type}/${c}/${ctx.cl}${ctx.fl ? '+alaga' : ''}/d${ctx.d}/w${ctx.w}/${ctx.k || '-'}`;
    if (n < 5 && n + ng >= 5) byGen.push(`${tag}: ${n} + ${ng} que o gerador não armou — ${Object.entries(cat.gen).map(([f, w]) => f + ': ' + w).slice(0, 4).join(' · ')}`);
    else if (n < 5) small.push(`${tag}: ${n} (${cat.ok.join(', ')})${ng ? ` + ${ng} que o gerador não armou` : ''} — a arquitetura: ${Object.entries(cat.arch).map(([f, w]) => f + ': ' + w).slice(0, 4).join(' · ')}`);
    if (process.env.CAT) console.log(`  ${type}/${c}/${JSON.stringify(ctx)}: ${n} famílias: ${cat.ok.map(f => In.famName(f)).join(', ')}`);
  }
}
const secs = (clock() - t0) / 1000;
// (the candidates made again three times each: the least of the three is the cost; a plan made a little at a time, by the
// god's view or the 3D, stops between two attempts — the dearest attempt is what one frame may have to wait for)
const again = (w, one) => { let best = Infinity; for (let r = 0; r < 3; r++) { let n = 0, tA = clock(), mine = Infinity; const a = tA; In.trace = () => { const t = clock(); if (one && n === w.n) mine = t - tA; n++; tA = t; }; In.make(w.b, w.rec); In.trace = null; if (!one) mine = clock() - a; best = Math.min(best, mine); } return best; };
const dearest = (L, M, one) => { let top = null; const raw = L.length ? L[0].ms : 0; for (const w of new Set(L.concat(...M.values()))) { w.min = again(w, one); if (!top || w.min > top.min) top = w; } return { top, raw }; };
const DP = dearest(TOP.plan, TOP.planBy, false), DA = dearest(TOP.att, TOP.attBy, true);
ok('todas as plantas válidas', nBad === 0, `${nPlans} plantas, ${nBad} inválidas (${nHeld} casas que o mundo funda em outra família, In.holdingFam); ${nShort} com gente dormindo no chão; a mais cara ${DP.top ? DP.top.min.toFixed(1) : 0} ms (${DP.top ? DP.top.tag + ', ' + DP.top.n + ' tentativas' : '-'}, sem cache; na rodada, com o ruído da máquina, até ${DP.raw.toFixed(0)} ms); ${secs.toFixed(1)} s`);
for (const e of badEx) console.log('   ✗ ' + e);
for (const e of heldEx) console.log('   ⇢ ' + e);
// (the ones laid out for fewer sleepers than the house holds, by type and family: each class explained or brought down)
if (nShort) console.log('   com gente no chão, por tipo e família: ' + [...shortBy.entries()].sort((x, y) => y[1] - x[1]).map(([k, n]) => `${k}: ${n}`).join(' · '));
for (const e of shortEx) console.log('   ~ ' + e);
if (DA.top) console.log(`   a tentativa mais cara: ${DA.top.min.toFixed(1)} ms (${DA.top.tag}, a ${DA.top.n + 1}ª; na rodada, até ${DA.raw.toFixed(0)} ms)`);
ok('a casca de longe', nShellBad === 0, `${nShell} cascas pedidas sozinhas: ${nShellBad} diferentes da planta inteira${shellEx.length ? ' (' + shellEx.join(', ') + ')' : ''}`);
ok('o chão fora das escadas', nFloorBad === 0, `${nCells} células de chão fora das escadas e dos degraus; em ${nFloorBad} a altura não é a do piso`);
for (const e of floorEx) console.log('   ✗ ' + e);
ok('poucas caídas', nFell <= nPlans * 0.1, `${nFell} de ${nPlans} plantas (${(100 * nFell / Math.max(1, nPlans)).toFixed(1)}%) caíram da família do registro para a próxima que o catálogo oferece ali`);
for (const e of fellEx) console.log('   ↘ ' + e);
console.log(`${nCombo} combinações; ${nGen} famílias que a arquitetura permite e o gerador não armou`);
console.log(`combinações abaixo de 5 só porque a arquitetura não permite mais: ${small.length}`);
for (const s of small.slice(0, process.env.CAT ? 999 : 12)) console.log('   · ' + s);
// (a ratchet: the count the grammar has reached — it may only go down; brought down, the ceiling comes down with it, and the
// goal is zero. Raised by a change, the change is wrong — unless the leader agrees and the commit says why)
const GERADOR_TETO = 11; // (17 → 11 com a B2c: a ínsula do centro com um andar a mais, D-082 (3))
ok('abaixo de 5 pelo gerador', byGen.length <= GERADOR_TETO, `${byGen.length} combinações ficam abaixo de 5 só porque o gerador não armou famílias que a arquitetura permite (teto ${GERADOR_TETO}, a meta é zero)${byGen.length < GERADOR_TETO ? ' — baixou: desça o teto' : ''}`);
for (const s of byGen.slice(0, process.env.CAT ? 999 : 30)) console.log('   ✗ ' + s);
console.log(fails.length ? `FALHOU: ${fails.length}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
