// plantas: a gramática dos interiores provada em Node (segundos, sem navegador): para cada tipo de prédio com interior,
// cada povo e cada contexto (técnica, clima, alagado, densidade, riqueza) e cada lado da entrada, as famílias que valem ali
// (e por que as outras não valem), e para cada família muitas plantas (ids diferentes) — todas válidas pelo próprio
// validador do jogo (cabe no lote, nada sobreposto, todo cômodo e todo lugar de uso alcançados da porta, lugares para
// quem mora, postos para quem trabalha), a mesma assinatura estrutural dentro da família, assinaturas diferentes entre
// famílias, variação de medidas entre ids, e a mesma planta duas vezes para a mesma entrada.
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
const t0 = clock(); let nPlans = 0, nBad = 0, nFell = 0, nShort = 0, nGen = 0, nCombo = 0; const small = [], byGen = []; const badEx = [], fellEx = [];
let msMax = 0, msWho = ''; let nCells = 0, nFloorBad = 0; const floorEx = [];
for (const type of Object.keys(In.TYPES)) {
  if (ONLY && !ONLY.includes(type)) continue;
  const def = G.BDEF[type]; if (!def) { ok('tipo ' + type, false, 'tipo sem BDEF'); continue; }
  for (const c of Object.keys(In.TRAD)) for (const ctx of CTX) {
    const side = SIDES[(nPlans + c.length) % 4];
    const rec0 = { v: 1, f: '', r: 0, t: type, u: In.TYPES[type].use, s: side, o: 0, c, e: ctx.e, k: ctx.k, cl: ctx.cl, fl: ctx.fl, d: ctx.d, w: ctx.w, pw: 0, h: [], m: 0, fx: [], dr: {} };
    const cat = In.familiesFor(rec0);
    const sigs = new Map();
    for (const f of cat.ok) {
      const seen = new Set(); const fine = new Set();
      for (let q = 0; q < NID; q++) {
        const id = 1000 + q * 7919 + c.length * 31;
        const s = SIDES[q % 4]; const b = { id, type, x: 10, y: 10, w: def.w, h: def.h };
        const rec = Object.assign({}, rec0, { f, s, pw: q % 5 === 0 ? 2 : 0 });
        const a = clock(); const p = In.make(b, rec); const ms = clock() - a; if (ms > msMax) { msMax = ms; msWho = `${type}/${c}/${f} #${id}`; }
        nPlans++;
        // (a family the catalogue offers may not go on some lot: the plan falls to the next one offered there — always the
        // same —, or is laid out for fewer sleepers, said; an invalid plan is a failure, a fall is counted and must stay rare)
        if (p.short) nShort++;
        if (!p.ok || p.fam !== f) {
          if (p.ok) { nFell++; if (fellEx.length < 6 || process.env.VERB) fellEx.push(`${type}/${c}/${JSON.stringify(ctx)}/${s} ${f} #${id} → ${p.fam}: ${(p.errsOf || []).slice(0, 1).join('; ')}`); continue; }
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
ok('todas as plantas válidas', nBad === 0, `${nPlans} plantas, ${nBad} inválidas; ${nShort} com gente dormindo no chão; a mais lenta ${msMax.toFixed(0)} ms (${msWho}, sem cache); ${((clock() - t0) / 1000).toFixed(1)} s`);
for (const e of badEx) console.log('   ✗ ' + e);
ok('o chão fora das escadas', nFloorBad === 0, `${nCells} células de chão fora das escadas e dos degraus; em ${nFloorBad} a altura não é a do piso`);
for (const e of floorEx) console.log('   ✗ ' + e);
ok('poucas caídas', nFell <= nPlans * 0.1, `${nFell} de ${nPlans} plantas (${(100 * nFell / Math.max(1, nPlans)).toFixed(1)}%) caíram da família do registro para a próxima que o catálogo oferece ali`);
for (const e of fellEx) console.log('   ↘ ' + e);
console.log(`${nCombo} combinações; ${nGen} famílias que a arquitetura permite e o gerador não armou`);
console.log(`combinações abaixo de 5 só porque a arquitetura não permite mais: ${small.length}`);
for (const s of small.slice(0, process.env.CAT ? 999 : 12)) console.log('   · ' + s);
// (a ratchet: the count the grammar has reached — it may only go down; brought down, the ceiling comes down with it, and the
// goal is zero. Raised by a change, the change is wrong — unless the leader agrees and the commit says why)
const GERADOR_TETO = 103;
ok('abaixo de 5 pelo gerador', byGen.length <= GERADOR_TETO, `${byGen.length} combinações ficam abaixo de 5 só porque o gerador não armou famílias que a arquitetura permite (teto ${GERADOR_TETO}, a meta é zero)${byGen.length < GERADOR_TETO ? ' — baixou: desça o teto' : ''}`);
for (const s of byGen.slice(0, process.env.CAT ? 999 : 30)) console.log('   ✗ ' + s);
console.log(fails.length ? `FALHOU: ${fails.length}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
