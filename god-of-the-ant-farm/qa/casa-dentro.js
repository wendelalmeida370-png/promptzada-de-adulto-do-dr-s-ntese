// casa-dentro: a casa por dentro (Bairros Vivos, o G — T-403, T-436, T-446), provada em Node, sem navegador e sem mundo:
// a gramática das plantas das casas e dos depósitos medida em vários dados (os «sais» do In.SALT: o mesmo prédio com outros
// sorteios, T-436), e não só nos de hoje.
//   c1  toda casa de todo povo tem onde a família come junta e tem fogo (D-196): em cada tipo de casa (o barraco, a cabana, a
//       casa, o sobrado, a ínsula, a casa rica de 8 m, o quarteirão) × cada povo × os seis contextos do qa/plantas.js × cada
//       família que vale ali × N ids — a planta válida; o fogo (uma peça de fogo: a lareira, o fogão, o forno, o fogareiro, o
//       braseiro, o comal); o lugar de comer junto (dois ou mais lugares de uso «comer» que o corpo ocupa, numa peça só), de
//       quem senta de verdade: num assento da peça, ou no chão em volta dela onde o povo come no chão (a peça diz: `chao`); e
//       as camas que a casa abriga, como antes
//   c2  o teto do gerador (o do qa/plantas.js): quantas combinações ficam abaixo de 5 famílias só porque o gerador não armou
//       famílias que a arquitetura permite — nas casas, e por tipo
//   c3  os depósitos guardam o que o prédio guarda (T-436): o armazém, o depósito do porto, o celeiro e o mercado, em todas as
//       famílias e contextos — a capacidade dos depósitos da planta contra o `storage` do prédio
//   c4  o motor recusa na hora a peça que o corpo não usa (T-446): em todas as tentativas das plantas de c1 e c3 e dos templos
//       (o caso do achado: o banco do templo grego `w-patio.*`), nenhuma acaba recusada só no fim porque o corpo não fica num
//       lugar de uso de uma peça posta pelo `P.place` / `P.put`; e (c4b) o alcance não atravessa parede: em toda planta válida
//       feita aqui, cada lugar de uso que o corpo ocupa tem chão alcançado da porta a até 0,3 m sem parede no meio (conferido
//       pela prova, na grade da planta, sem perguntar ao motor)
//   c2b a segunda rodada da prova de uma família é outra (L-890): as tentativas 12 a 23, não as doze primeiras de novo
//   c5  o que se vê (a noite em casa, G.Lar): num mundo pronto (MUNDO=cidade,metropole), das 0,70 às 0,82 do dia (a gente
//       grande em casa e ainda de pé), em cada povo, as casas com gente acordada dentro: em quantas há alguém sentado onde a família come (num banco
//       da mesa, no chão em volta da esteira ou do fogo), em quantas dois ou mais comem juntos na mesma peça, em quantas há
//       alguém junto ao fogo — e o verificador limpo, sem erro de módulo. A afirmação é da família (D-246): nas casas com duas
//       ou mais pessoas acordadas, três em cada quatro com alguém sentado onde a família come (quem está acordado sozinho
//       descansa junto ao fogo); o total de todas as casas acordadas é dito na linha. Só com c5 no pedido (vive o mundo: minutos)
//   c6  um save de antes abre (qa/save-g196.json, feito pelo código de antes do D-196 — qa/gera-save-g196.js —: o corpo
//       encarnado dentro de uma casa, com um lugar da planta de então nas mãos, a família em casa à noite): sem erro; a casa
//       com o registro julgado ao abrir (o save não diz a gramática das plantas dele: é de antes) e a planta de agora, com
//       onde comer e fogo; o corpo ainda o corpo, solto do lugar que não é mais daquela planta, dentro de casa onde a planta
//       o deixa (ou à porta); a família dentro, cada um num lugar da planta nova; um tempo de vida com o verificador limpo; e
//       salvo e carregado de novo, o save diz a gramática (intG) e nenhum registro é julgado outra vez
//   node qa/casa-dentro.js [ids por família] [c1,c2,c3,c4] [tipos]        ·  node qa/casa-dentro.js 0 c5,c6   (MUNDO=cidade)
//       SAIS=0,101,777,4242 (o padrão: cada sal num processo, um depois do outro) · SALT=n (só esse sal, neste processo)
//       VERB=1 cada falha · JSON=arquivo (os números desta rodada, para o bloco) · IDS=n e ONLY=c1,c3 (o mesmo que os dois
//       primeiros argumentos, para quem roda a prova sem argumentos: as sabotagens) · SAVEG=arquivo (o save de antes do c6)
const path = require('path'); const fs = require('fs');
const NID = +(process.argv[2] || process.env.IDS || 6); const PARTS = (process.argv[3] || process.env.ONLY || 'c1,c2,c3,c4').split(',').filter(Boolean); const TYPES = process.argv[4] ? process.argv[4].split(',') : null;
const want = k => PARTS.includes(k);
// ------------------------------ every salt in a process of its own, one after the other ------------------------------
if (process.env.SALT === undefined) {
  const { spawnSync } = require('child_process');
  const sais = (process.env.SAIS || '0,101,777,4242').split(',').map(s => s.trim()).filter(Boolean); let bad = 0; const lines = [];
  for (const s of sais) {
    const r = spawnSync(process.execPath, [__filename].concat(process.argv.slice(2)), { env: Object.assign({}, process.env, { SALT: s }), encoding: 'utf8', maxBuffer: 1 << 28 });
    process.stdout.write(r.stdout || ''); if (r.stderr) process.stderr.write(r.stderr);
    if (r.status !== 0) bad++; const last = (r.stdout || '').trim().split('\n').pop() || ''; lines.push(`sal ${s}: ${last}`);
  }
  console.log('---'); for (const l of lines) console.log(l);
  console.log(bad ? `CASA-DENTRO: FALHOU em ${bad} de ${sais.length} sais` : `CASA-DENTRO: ok (${sais.length} sais)`);
  process.exit(bad ? 1 : 0);
}
const M = require('./nodemundo.js');
const G = M.load(want('c5') || want('c6') ? { qa: true, extra: ['js/space.js', 'js/possess.js', 'qa/lar-inv.js'] } : {}); const In = G.Interiors; const IT = In.ITEMS;
const SAL = Number(process.env.SALT) | 0;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | casa-dentro ${name} (sal ${SAL}) | ${info}`); if (!c) fails.push(name); };
const clock = () => Number(process.hrtime.bigint() / 1000n) / 1000; const t0 = clock();
const pct = (a, b) => (b ? (100 * a / b).toFixed(1) + '%' : '-');
const CTX = [
  { k: '', cl: 't', fl: 0, d: 1, w: 0, e: 1 }, { k: 'a', cl: 't', fl: 0, d: 3, w: 1, e: 3 }, { k: 'a', cl: 'q', fl: 0, d: 2, w: 0, e: 3 },
  { k: '', cl: 'f', fl: 0, d: 0, w: 0, e: 1 }, { k: '', cl: 'u', fl: 1, d: 1, w: 0, e: 2 }, { k: 'ae', cl: 't', fl: 0, d: 2, w: 2, e: 5 },
];
const SIDES = ['S', 'E', 'W', 'N']; // (the door's side: it turns with the id and with the context — the four of them with any number of ids)
// (the homes: each type at its own lot, and the house's bigger step, the rich house of 8 m — its own family, on its own lot)
const HOMES = [['barraco', 0], ['hut', 0], ['house', 0], ['house', 2], ['sobrado', 0], ['insula', 0], ['quarteirao', 0]].filter(([t]) => In.TYPES[t] && (!TYPES || TYPES.includes(t)));
const STORES = ['storehouse', 'armazem', 'celeiro', 'mercado'].filter(t => In.TYPES[t] && (!TYPES || TYPES.includes(t)));
const PEOPLES = Object.keys(In.TRAD);
const tname = (t, n) => (n ? `${t}×${n}` : t);
const recOf = (t, c, ctx, s, n) => { const r = { v: 4, f: '', r: 0, t, u: In.TYPES[t].use, s, o: 0, c, e: ctx.e, k: ctx.k, cl: ctx.cl, fl: ctx.fl, d: ctx.d, w: ctx.w, pw: 0, h: [], m: 0, fx: [], dr: {} }; if (n) r.n = n; return r; };
const lotOf = (t, n) => n || (G.BDEF[t] || {}).w || 1;
// ------------------------------ what a plan has (read from the plan made: its pieces and their places, as the body has them) ------------------------------
// (the fire: a piece of fire with a place to use it the body takes)
const fireOf = p => p.items.filter(it => it.fire && it.spots.some(sp => sp.ok));
// (where one sits to eat: the places of use «comer» the body takes — sp.ok —, by piece; seated for real on a seat of the
// piece — on —, or on the ground round a piece of those who eat on the ground — the catalogue's `chao`)
// (a piece to eat at — the catalogue's `min.comer` —, or no such piece in the house: the round hut, where one eats round the
// fire on the ground, at its places to warm oneself: fogo 1)
const eatPiece = p => p.items.some(it => ((IT[it.kind] || {}).min || {}).comer);
const eatOf = p => {
  const out = []; const round = !eatPiece(p);
  for (const it of p.items) { const D = IT[it.kind] || {}; const byF = round && D.chao && it.fire; const sp = it.spots.filter(q => (q.use === 'comer' || (q.use === 'aquecer' && byF)) && q.ok); if (!sp.length) continue; out.push({ it, n: sp.length, real: sp.filter(q => q.on || D.chao).length, chao: D.chao ? 1 : 0, fogo: byF ? 1 : 0 }); }
  return out;
};
// (a place to sit by the fire: «aquecer», «comer» or «sentar» within 1.6 m of a fire of the same storey)
const byFire = p => { const fs2 = fireOf(p); let n = 0; for (const it of p.items) for (const sp of it.spots) { if (!sp.ok || !(sp.use === 'aquecer' || sp.use === 'comer' || sp.use === 'sentar')) continue; if (fs2.some(f => f.lv === it.lv && Math.hypot(f.x - sp.x, f.z - sp.z) <= 1.6 + Math.max(f.w, f.d) / 2)) n++; } return n; };
const stats = new Map(); // (type×people → the counts)
const row = k => { let r = stats.get(k); if (!r) stats.set(k, r = { plans: 0, bad: 0, fell: 0, held: 0, fogo: 0, peca: 0, junta: 0, sentada: 0, fogoLugar: 0, soFogo: 0, soFogoFam: new Set(), naPeca: 0, short: 0, places: 0, need: 0, fams: new Set(), semFogo: [], semComer: [] }); return r; };
const badEx = []; const bodyEnd = { n: 0, att: 0, ex: [] }; // (c4: the attempts refused at the end for the body alone)
// (c4b: a place of use the body takes, with a cell the door reaches within 0.3 m of where it stands and no wall between them —
// the proof's own reading of the plan's grid: the cells of code 2 along the line, every 5 cm; a wall between is the line
// inside wall for 10 cm or more — three samples in a row —, never the corner of a jamb grazed by half a centimetre: the
// table's way in by the cellar's hatch, sobrado/classico/setores.porao-andar3 #17086, T-892)
const wallRx = { n: 0, bad: 0, ex: [] }; const CS = In.CS;
const wallFree = (p, lv, x, z) => {
  const g = p.grid.lv[lv], sn = p.reach && p.reach[lv]; if (!g || !sn) return false; const n = p.grid.n; const cx = Math.floor(x / CS), cz = Math.floor(z / CS);
  for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) { const X = cx + dx, Z = cz + dz; if (X < 0 || Z < 0 || X >= n || Z >= n || !sn[Z * n + X]) continue;
    const bx = (X + 0.5) * CS, bz = (Z + 0.5) * CS; const d = Math.hypot(bx - x, bz - z); const k = Math.max(1, Math.ceil(d / 0.05)); let wall = false, run = 0;
    for (let q = 0; q <= k && !wall; q++) { const ux = Math.floor((x + (bx - x) * q / k) / CS), uz = Math.floor((z + (bz - z) * q / k) / CS); if (ux >= 0 && uz >= 0 && ux < n && uz < n && g[uz * n + ux] === 2) { if (++run >= 3) wall = true; } else run = 0; }
    if (!wall) return true; }
  return false;
};
const wallCheck = (p, tag) => { if (!want('c4') || !p.ok || !p.grid || !p.reach) return; for (const it of p.items) for (const sp of it.spots) { if (sp.on || !sp.ok) continue; wallRx.n++; if (!wallFree(p, it.lv, sp.x, sp.z)) { wallRx.bad++; if (wallRx.ex.length < 6 || process.env.VERB) wallRx.ex.push(`${tag}: ${it.kind} (${sp.use}) em (${sp.x}, ${sp.z}) piso ${it.lv}`); } } };
// (each attempt's end, as the engine says it: In.trace)
const BODY_ERR = /^o corpo não fica em /;
let curTag = '';
In.trace = (a, plan) => { bodyEnd.att++; const errs = plan.errs || []; if (!plan.ok && errs.length && errs.every(e => BODY_ERR.test(e))) { bodyEnd.n++; if (bodyEnd.ex.length < 8 || process.env.VERB) bodyEnd.ex.push(`${curTag} tentativa ${a + 1}: ${errs[0]}`); } };
const combos = { n: 0, byGen: [], small: 0, gen: [] };
function homes() {
  for (const [type, n] of HOMES) {
    const def = G.BDEF[type]; const L = lotOf(type, n); const need = def.housing || 0;
    for (const c of PEOPLES) for (const [ci, ctx] of CTX.entries()) {
      if (n && !In.sizeOk(type, c, n)) continue;
      const rec0 = recOf(type, c, ctx, 'S', n); const cat = In.familiesFor(rec0); const R = row(tname(type, n) + '/' + c);
      // (c2: the generator's ceiling, as qa/plantas.js counts it — the classic lot only: a bigger step has its one family)
      if (!n) for (const f in cat.gen) if (combos.gen.length < 40) combos.gen.push({ rec: rec0, f, tag: `${type}/${c}/${f} d${ctx.d} ${ctx.cl}` });
      if (!n) { const ng = Object.keys(cat.gen).length; combos.n++; const tag = `${type}/${c}/${ctx.cl}${ctx.fl ? '+alaga' : ''}/d${ctx.d}/w${ctx.w}/${ctx.k || '-'}`;
        if (cat.ok.length < 5 && cat.ok.length + ng >= 5) combos.byGen.push(`${tag}: ${cat.ok.length} + ${ng} que o gerador não armou — ${Object.entries(cat.gen).map(([f, w]) => f + ': ' + w).slice(0, 3).join(' · ')}`); else if (cat.ok.length < 5) combos.small++; }
      if (!want('c1') && !want('c4')) continue;
      const fams = n ? cat.ok.filter(f => f === In.TYPES[type].stepFam) : cat.ok;
      for (const f of fams) for (let q = 0; q < NID; q++) {
        const id = 1000 + (q + ci * NID) * 7919 + c.length * 31; const s = SIDES[(q + ci) % 4]; const b = { id, type, x: 10, y: 10, w: L, h: L };
        const rec = Object.assign({}, rec0, { f, s, pw: q % 5 === 0 ? 2 : 0 }); curTag = `${tname(type, n)}/${c}/${f} #${id}`;
        const p = In.make(b, rec); R.plans++;
        if (!p.ok || p.fam !== f) {
          if (p.ok) { R.fell++; } else if (In.TYPES[type].use === 'casa' && In.holdingFam && In.holdingFam(b, rec)) { R.held++; R.fell++; continue; } else { R.bad++; if (badEx.length < 12 || process.env.VERB) badEx.push(`${curTag} ${JSON.stringify(ctx)}/${s}: ${(p.errsOf || p.errs || []).slice(0, 2).join('; ')}`); continue; }
        }
        wallCheck(p, curTag); R.fams.add(p.fam); R.places += p.cap.places; R.need += need; if (p.short) R.short++;
        const fo = fireOf(p), ea = eatOf(p);
        if (fo.length) R.fogo++; else if (R.semFogo.length < 3 || process.env.VERB) R.semFogo.push(`${p.fam} #${id}`);
        if (ea.length) R.peca++;
        if (ea.some(e => e.n >= 2)) R.junta++;
        if (!eatPiece(p)) { R.soFogo++; R.soFogoFam.add(p.fam); }
        if (ea.some(e => e.real >= 2 && !e.fogo)) R.naPeca++;
        if (ea.some(e => e.real >= 2)) R.sentada++; else if (R.semComer.length < 3 || process.env.VERB) R.semComer.push(`${p.fam} #${id}`);
        if (byFire(p) >= 1) R.fogoLugar++;
      }
    }
  }
}
const stores = new Map();
// (the families that never hold what the building keeps, on any dice — the market's three naves on the ground and over a
// cellar, 28 to 42 of its 50; the port's store with its corridor on stilts, 118 to 128 of its 150 —: dead ones the catalogue
// leaves out everywhere, known and said — T-893; any other left out for a short depot is the defect of L-499 back)
const DEAD = new Set(['mercado/w-naves.terreo', 'mercado/w-naves.porao', 'storehouse/w-corredor.esteios']);
function depots() {
  for (const type of STORES) {
    const def = G.BDEF[type]; const goal = def.storage || 0;
    for (const c of PEOPLES) for (const [ci, ctx] of CTX.entries()) {
      const rec0 = recOf(type, c, ctx, 'S', 0); const cat = In.familiesFor(rec0);
      let R = stores.get(type); if (!R) stores.set(type, R = { plans: 0, bad: 0, fell: 0, curto: 0, min: Infinity, goal, ex: [], gen: 0, genCurto: 0, mortas: 0 });
      R.gen += Object.keys(cat.gen).length;
      // (the family the generator leaves out for a short depot: how the defect went unseen — the catalogue left it out where
      // the probe fell, and the building went to another family, L-499)
      for (const f in cat.gen) if (/depósitos para/.test(cat.gen[f])) { if (DEAD.has(type + '/' + f)) { R.mortas++; continue; } R.genCurto++; if (R.ex.length < 6 || process.env.VERB) R.ex.push(`${type}/${c}/${f} ${JSON.stringify(ctx)}: o gerador não arma — ${cat.gen[f]}`); }
      for (const f of cat.ok) for (let q = 0; q < NID; q++) {
        const id = 1000 + (q + ci * NID) * 7919 + c.length * 31; const s = SIDES[(q + ci) % 4]; const b = { id, type, x: 10, y: 10, w: def.w, h: def.h };
        const rec = Object.assign({}, rec0, { f, s, pw: q % 5 === 0 ? 2 : 0 }); curTag = `${type}/${c}/${f} #${id}`;
        const p = In.make(b, rec); R.plans++;
        if (!p.ok) { R.bad++; const e = (p.errsOf || p.errs || []); if (e.some(x => /^depósitos para/.test(x))) R.curto++; if (R.ex.length < 6 || process.env.VERB) R.ex.push(`${curTag} ${JSON.stringify(ctx)}/${s}: ${e.slice(0, 2).join('; ')}`); continue; }
        if (p.fam !== f) R.fell++; wallCheck(p, curTag);
        R.min = Math.min(R.min, p.cap.store); if (p.cap.store < goal) { R.curto++; if (R.ex.length < 6) R.ex.push(`${curTag}: válida com depósitos para ${p.cap.store} (guarda ${goal})`); }
      }
    }
  }
}
// (c4: the temples too — where the defect was found: the Greek temple's fourth bench, `w-patio.*`)
function temples() {
  const type = 'temple'; if (!In.TYPES[type] || (TYPES && !TYPES.includes(type))) return 0; const def = G.BDEF[type]; let n = 0;
  for (const c of PEOPLES) for (const [ci, ctx] of CTX.entries()) {
    const rec0 = recOf(type, c, ctx, 'S', 0); const cat = In.familiesFor(rec0);
    for (const f of cat.ok) for (let q = 0; q < NID; q++) { const id = 1000 + (q + ci * NID) * 7919 + c.length * 31; const b = { id, type, x: 10, y: 10, w: def.w, h: def.h }; curTag = `${type}/${c}/${f} #${id}`; wallCheck(In.make(b, Object.assign({}, rec0, { f, s: SIDES[(q + ci) % 4] })), curTag); n++; }
  }
  return n;
}
if (want('c1') || want('c2') || want('c4')) homes();
if (want('c3') || want('c4')) depots();
const nT = want('c4') ? temples() : 0;
In.trace = null;
const out = { sal: SAL, nid: NID, homes: {}, stores: {}, gen: combos.byGen.length, body: bodyEnd.n, att: bodyEnd.att };
if (want('c1')) {
  let P = 0, B = 0, F = 0, S2 = 0, J = 0, FL = 0, SF = 0, NP = 0; const sfF = new Set();
  console.log(`  casa/povo            plantas inval. caíram | fogo    | peça de comer | come junto (2+) | sentada de verdade | lugar junto ao fogo | camas/abriga | no chão | famílias`);
  for (const [k, r] of stats) {
    const v = r.plans - r.bad - r.held; P += r.plans; B += r.bad; F += r.fogo; S2 += r.sentada; J += r.junta; FL += r.fogoLugar; SF += r.soFogo; NP += r.naPeca; for (const f of r.soFogoFam) sfF.add(f);
    out.homes[k] = { plantas: r.plans, invalidas: r.bad, validas: v, fogo: r.fogo, peca: r.peca, junta: r.junta, sentada: r.sentada, fogoLugar: r.fogoLugar, camas: r.places, abriga: r.need, chao: r.short, familias: r.fams.size };
    console.log(`  ${k.padEnd(20)} ${String(r.plans).padStart(6)} ${String(r.bad).padStart(6)} ${String(r.fell).padStart(6)} | ${pct(r.fogo, v).padStart(7)} | ${pct(r.peca, v).padStart(13)} | ${pct(r.junta, v).padStart(15)} | ${pct(r.sentada, v).padStart(18)} | ${pct(r.fogoLugar, v).padStart(19)} | ${String(r.places).padStart(5)}/${String(r.need).padEnd(6)} | ${String(r.short).padStart(7)} | ${r.fams.size}`);
    if (process.env.VERB && r.semComer.length) console.log('      sem lugar de comer: ' + r.semComer.join(', '));
    if (r.semFogo.length) console.log('      SEM FOGO: ' + r.semFogo.join(', '));
  }
  const V = P - B - [...stats.values()].reduce((a, r) => a + r.held, 0);
  out.c1 = { plantas: P, invalidas: B, validas: V, fogo: F, junta: J, sentada: S2, fogoLugar: FL, soFogo: SF };
  ok('c1a nenhuma planta de casa inválida', B === 0, `${P} plantas de casa (${HOMES.map(([t, n]) => tname(t, n)).join(', ')} × ${PEOPLES.length} povos × ${CTX.length} contextos × as famílias que valem × ${NID} ids): ${B} inválidas`);
  for (const e of badEx) console.log('   ✗ ' + e);
  ok('c1b toda casa tem fogo', F === V, `${F} de ${V} plantas válidas com uma peça de fogo que o corpo usa (${pct(F, V)})`);
  ok('c1c toda casa tem onde a família come junta, sentada (D-196)', S2 === V, `${S2} de ${V} plantas válidas com dois ou mais lugares de comer numa peça, de quem senta de verdade — num assento ou no chão onde o povo come no chão (${pct(S2, V)}): ${NP} numa peça de comer (a mesa com os bancos, o banco de comer, a esteira) e ${S2 - NP} em volta do fogo de chão, sem outra peça (${[...sfF].join(', ') || '-'})`);
  ok('c1e só a cabana redonda come em volta do fogo de chão, sem peça de comer', [...sfF].every(f => /^redonda\./.test(f)), `${SF} plantas sem peça de comer: ${[...sfF].join(', ') || 'nenhuma'}`);
  // (not every house: the kitchen apart from the hall is architecture — the domus's culina, the upper storey's hearth; before D-196, two in three)
  ok('c1d a casa tem lugar junto ao fogo (85% ou mais, em todas as casas juntas)', !!TYPES || FL * 100 >= V * 85, `${FL} de ${V} plantas válidas com um lugar de sentar, comer ou se aquecer a até 1,6 m do fogo (${pct(FL, V)})${TYPES ? ' — só alguns tipos pedidos: sem cobrança' : ''}`);
}
if (want('c2')) {
  // (the qa/plantas.js ratchet, whose count takes every type; here the homes alone. The game's dice — salt 0 — and 777 under
  // the ceiling of 6; the other dice keep the ratchet of what they have today, never more — before D-196: 12, 12 and 10 —, the
  // ones over the ceiling an open limit, each with its reason: T-892)
  const META = 6; const TETO = TYPES ? META : ({ 101: 11, 4242: 8 })[SAL] || META;
  ok('c2 o teto do gerador nas casas', combos.byGen.length <= TETO, `${combos.byGen.length} combinações de casa abaixo de 5 famílias só porque o gerador não armou famílias que a arquitetura permite (teto ${META}${TETO > META ? `; ACIMA DO TETO neste sal — a catraca dele: ${TETO}, aberto, T-892` : ''}; ${combos.n} combinações, ${combos.small} abaixo de 5 pela arquitetura)`);
  for (const s of combos.byGen) console.log('   ✗ ' + s);
}
if (want('c3')) {
  let P = 0, B = 0, C = 0, GC = 0;
  for (const [t, r] of stores) { P += r.plans; B += r.bad; C += r.curto; GC += r.genCurto; out.stores[t] = { plantas: r.plans, invalidas: r.bad, curtas: r.curto, min: r.min === Infinity ? null : r.min, guarda: r.goal, gerador: r.gen, geradorCurto: r.genCurto };
    console.log(`  ${t.padEnd(12)} ${r.plans} plantas, ${r.bad} inválidas (${r.curto} por depósito curto), ${r.fell} caídas; o menor depósito de uma válida: ${r.min === Infinity ? '-' : r.min} (o prédio guarda ${r.goal}); ${r.gen} famílias que o gerador não armou (${r.genCurto} por depósito curto; e ${r.mortas} das que nunca guardam, T-893)`);
    for (const e of r.ex) console.log('   ✗ ' + e); }
  ok('c3 os depósitos guardam o que o prédio guarda (T-436)', B === 0 && C === 0 && GC === 0, `${P} plantas de depósito (${STORES.join(', ')}): ${B} inválidas, ${C} com depósito curto; ${GC} famílias que o gerador deixa de fora por depósito curto`);
}
if (want('c4')) {
  ok('c4 o motor recusa na hora a peça que o corpo não usa (T-446)', bodyEnd.n === 0, `${bodyEnd.att} tentativas (casas, depósitos e ${nT} templos): ${bodyEnd.n} recusadas só no fim, e só porque o corpo não fica num lugar de uso de uma peça`);
  for (const e of bodyEnd.ex) console.log('   ✗ ' + e);
  ok('c4b o alcance não atravessa parede (T-446)', wallRx.n > 0 && wallRx.bad === 0, `${wallRx.n} lugares de uso que o corpo ocupa, nas plantas válidas: ${wallRx.bad} sem chão alcançado a até 0,3 m senão pelo outro lado de uma parede`);
  for (const e of wallRx.ex) console.log('   ✗ ' + e);
}
// (c2b: a family the generator did not lay out, probed again: where a probe's first twelve attempts all fail, the next one
// is the thirteenth — attempt 12 —, never the first again)
if (want('c2')) {
  let got = null, tried = 0;
  for (const g of combos.gen) { if (got || tried++ >= 12) break; const seq = []; In.trace = (a2, plan) => seq.push([a2, plan.ok ? 1 : 0]); In.probe(g.rec, g.f); In.trace = null;
    for (let i = 0; i + 12 < seq.length && !got; i++) if (seq.slice(i, i + 12).every((q, k) => q[0] === k && !q[1])) got = { tag: g.tag, next: seq[i + 12][0], n: seq.length }; }
  ok('c2b a segunda rodada da prova é outra (L-890)', !!got && got.next === 12, got ? `${got.tag}: depois das doze primeiras tentativas falhadas num lote de prova, a seguinte é a ${got.next + 1}ª (${got.n} tentativas na prova inteira)` : `nenhuma família das ${combos.gen.length} que o gerador não armou falha as doze primeiras de um lote (${tried} provadas de novo)`);
}
// ------------------------------ c5: the evening at home, in a ready world ------------------------------
if (want('c5')) for (const world of (process.env.MUNDO || 'cidade').split(',')) {
  // (the hours the grown ones are home and still up — after dark, 0.73, and before the bed time of most —, an evening with no
  // feast in any town: every town keeps its feast of the year, and a day of the world is a year — the test's hand, as qa/lar.js)
  M.pronto(world); const S = G.S; const HOURS = [0.7, 0.72, 0.74, 0.75, 0.76, 0.77, 0.78, 0.79, 0.8, 0.82];
  S.time = 0.6; for (const st of S.settlements.values()) st.festPlan = { day: S.day, key: null, done: true };
  const fam = [0, 0]; // (the houses with two or more awake inside, and of them the ones with someone sitting where the family eats: D-246)
  const acc = new Map(); const rowP = c => { let r = acc.get(c); if (!r) acc.set(c, r = { casas: 0, come: 0, juntos: 0, mesa: 0, fogo: 0, ambos: 0, nucleo: 0, chao: 0, gente: 0, sentada: 0 }); return r; };
  const doing = {}; // (what each one awake at home is doing — the task of the home, G.Lar —, and where)
  const housing = b => !!(b && b.built && b.type !== 'ruin' && G.BDEF[b.type] && G.BDEF[b.type].housing && b.ip && In.TYPES[b.ip.t]);
  const mid = []; const SEV = { lar: 3, act: 2, int: 2, nan: 2, pop: 2, fam: 2 };
  const watch = () => { for (const q of QA.check()) if (SEV[q.sys] !== undefined && q.sev <= SEV[q.sys]) { const k = `S${q.sev} ${q.sys}: ${q.msg}`; if (!mid.includes(k)) mid.push(k); } };
  for (const h of HOURS) {
    const sec = ((h - S.time) % 1 + 1) % 1 * G.DAY_LEN; const n = Math.round(sec * 10); for (let k = 0; k < n; k++) { S.weather.storm = 0; G.debug.step(0.1); if (k % 50 === 49) watch(); }
    const inside = new Map(); for (const v of S.villagers.values()) if (v.inside > 0) { let L = inside.get(v.inside); if (!L) inside.set(v.inside, L = []); L.push(v); }
    for (const [bid, L] of inside) {
      const b = S.buildings.get(bid); if (!housing(b)) continue; const awake = L.filter(v => !v.sleeping && v.age >= 3 && !(S.avatar && S.avatar.id === v.id)); if (!awake.length) continue;
      const p = In.plan(b); if (!p || !p.ok) continue; const R = rowP(b.style || 'classico'); R.casas++; R.gente += awake.length;
      const fires = p.items.filter(it => it.fire); const at = new Map(); let come = 0, mesa = 0, fogo = 0, chao = 0; const round = !eatPiece(p);
      for (const v of awake) {
        const wk = v.task && v.task.type === 'lar' ? v.task.what || '?' : v.task ? '(' + v.task.type + ')' : '(nada)'; const W = doing[wk] || (doing[wk] = { n: 0, come: 0, fogo: 0, chao: 0 }); W.n++;
        const pl = In.placeOf(v); if (!pl || !pl.it) { chao++; W.chao++; continue; } const D = IT[pl.it.kind] || {}; const sp = pl.it.spots[pl.q] || {};
        const eats = (pl.use === 'comer' && (sp.on || D.chao)) || (round && pl.use === 'aquecer' && D.chao && pl.it.fire);
        if (pl.use === 'comer') mesa++; if (eats) { come++; W.come++; R.sentada++; at.set(pl.item, (at.get(pl.item) || 0) + 1); }
        if (pl.it.fire || fires.some(f => f.lv === pl.lv && Math.hypot(f.x - pl.x, f.z - pl.z) <= 1.6 + Math.max(f.w, f.d) / 2)) { fogo++; W.fogo++; }
      }
      if (awake.length >= 2) { fam[0]++; if (come) fam[1]++; }
      if (come) R.come++; if (mesa) R.mesa++; if ([...at.values()].some(k => k >= 2)) R.juntos++; if (fogo) R.fogo++; if (come && fogo) R.ambos++; if (come || fogo) R.nucleo++; if (chao === awake.length) R.chao++;
    }
  }
  watch();
  let C = 0, E = 0, N = 0; out['noite-' + world] = {};
  console.log(`  ${world}: as casas com gente acordada dentro, nas horas ${HOURS.join(', ')} do dia (cada casa em cada hora)`);
  console.log('  povo        casas  gente | alguém sentado onde se come | dois ou mais juntos | alguém à mesa (qualquer «comer») | alguém junto ao fogo | os dois | um ou outro (o núcleo em uso) | todos no chão ou de pé');
  for (const [c, r] of [...acc].sort()) { C += r.casas; E += r.come; N += r.nucleo; out['noite-' + world][c] = r;
    console.log(`  ${c.padEnd(10)} ${String(r.casas).padStart(6)} ${String(r.gente).padStart(6)} | ${(r.come + ' (' + pct(r.come, r.casas) + ')').padStart(27)} | ${(r.juntos + ' (' + pct(r.juntos, r.casas) + ')').padStart(19)} | ${(r.mesa + ' (' + pct(r.mesa, r.casas) + ')').padStart(32)} | ${(r.fogo + ' (' + pct(r.fogo, r.casas) + ')').padStart(20)} | ${(r.ambos + ' (' + pct(r.ambos, r.casas) + ')').padStart(7)} | ${(r.nucleo + ' (' + pct(r.nucleo, r.casas) + ')').padStart(29)} | ${r.chao} (${pct(r.chao, r.casas)})`); }
  out['noite-' + world].fazendo = doing;
  console.log('  o que cada um acordado em casa faz, e onde: ' + Object.entries(doing).sort((a, b) => b[1].n - a[1].n).map(([k, w]) => `${k} ${w.n} (onde se come ${w.come}, junto ao fogo ${w.fogo}, no chão ou de pé ${w.chao})`).join(' · '));
  const ce = doing.ceia || { n: 0, come: 0 };
  ok(`c5b quem ceia senta onde a família come (${world})`, ce.n > 0 && ce.come * 10 >= ce.n * 8, `${ce.come} de ${ce.n} pessoas na ceia sentadas onde se come (${pct(ce.come, ce.n)})`);
  ok(`c5c o núcleo da casa em uso: alguém sentado onde se come ou junto ao fogo em 85% ou mais das casas acordadas (${world})`, N * 100 >= C * 85, `${N} de ${C} casas com gente acordada (${pct(N, C)})`);
  // (D-246: the claim is the family's — two or more awake at home, one of them sitting where the family eats. One awake alone rests
  // by the fire, the rule of who stays where (act-lar.js: rest asks the fire first, talk a seat, supper the table): the share of all
  // the awake houses was the share of the houses with company, 52% in the city when the case was born and 48% with the third round
  // of the F — 83 of the 110 awake houses with one awake; of the houses with two or more, 93% in the city and 97% in the metropole)
  ok(`c5 a noite em casa: nas casas com duas ou mais pessoas acordadas, três em cada quatro com alguém sentado onde a família come (${world})`, fam[0] >= 10 && fam[1] * 4 >= fam[0] * 3 && M.limpo() && !mid.length, `${fam[1]} de ${fam[0]} casas com duas ou mais acordadas (${pct(fam[1], fam[0])}); de todas as casas com gente acordada, ${E} de ${C} (${pct(E, C)})${mid.length ? ' — o verificador: ' + mid.slice(0, 3).join(' · ') : ''}${M.limpo() ? '' : ' — ERROS: ' + JSON.stringify(M.erros()).slice(0, 300)}`);
}
// ------------------------------ c6: a save of before D-196 ------------------------------
if (want('c6')) {
  const file = process.env.SAVEG || path.join(__dirname, 'save-g196.json'); let o = null; try { o = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { o = null; }
  if (!o) ok('c6 um save de antes abre', false, 'sem o qa/save-g196.json (node qa/gera-save-g196.js, na árvore de antes)');
  else {
    const a0 = o.avatar || {}; const u0 = a0.use || null; const g0 = o.intG; const kept = (o.lar || []).filter(e => u0 && e[1] === u0.b).map(e => e[0]);
    M.abrir(o); const S = G.S; const why = [];
    const b = u0 ? S.buildings.get(u0.b) : null; const v = S.avatar ? S.villagers.get(S.avatar.id) : null;
    if (g0 !== undefined) why.push(`o save já diz a gramática (${g0}): não é de antes`);
    if (!M.limpo()) why.push('erros ao abrir: ' + JSON.stringify(M.erros()).slice(0, 200));
    if (!b || !b.ip) why.push('a casa do corpo sumiu'); if (!v || v.id !== a0.id) why.push('o corpo não é mais o corpo');
    let txt = '';
    if (b && b.ip && v) {
      const p = In.plan(b); const eat = p.items.filter(it => (IT[it.kind].min || {}).comer || (it.fire && IT[it.kind].chao)).length, fire = p.items.filter(it => it.fire).length;
      if (!p.ok) why.push('a planta de agora inválida: ' + p.errs.slice(0, 2).join('; ')); if (!eat || !fire) why.push(`a planta de agora sem ${eat ? 'fogo' : 'onde comer'}`);
      if (b.ip.v !== In.REC_V) why.push(`o registro na versão ${b.ip.v}`);
      const use = S.avatar.use; if (use && (use.key !== In.keyOf(b) || !In.placeFor(b, use.it, use.q))) why.push('o corpo segura um lugar que a planta de agora não tem');
      if (use && u0 && use.key === u0.key) why.push('a chave da planta de agora é a de antes: o lugar de então ficaria nas mãos');
      const inside = v.inside === b.id; if (inside && !G.Possess.onPlan(v)) why.push('o corpo dentro, onde a planta não o deixa');
      // (a while of the world: the body where the plan lets it, the household in the house at places of the plan of now)
      const bad = new Set(); const SEV = { lar: 3, act: 2, int: 2, nan: 2, pop: 2, fam: 2, avatar: 2 };
      for (let k = 0; k < 200; k++) { S.weather.storm = 0; G.debug.step(0.1); if (k % 20 === 19) for (const q of QA.check()) if (SEV[q.sys] !== undefined && q.sev <= SEV[q.sys]) bad.add(`S${q.sev} ${q.sys}: ${q.msg}`); }
      if (bad.size) why.push('o verificador: ' + [...bad].slice(0, 3).join(' · ')); if (!M.limpo()) why.push('erros na vida: ' + JSON.stringify(M.erros()).slice(0, 200));
      const fam = kept.map(id => S.villagers.get(id)).filter(Boolean); const homeIn = fam.filter(q => q.inside === b.id); const placed = homeIn.filter(q => { const pl = In.placeOf(q); return pl && (pl.it || pl.use === 'chao' || pl.use === 'de-pe'); });
      if (placed.length !== homeIn.length) why.push(`${homeIn.length - placed.length} da casa sem lugar na planta`);
      // (saved again and loaded: the save says its grammar, and no record is judged again)
      const recs = () => JSON.stringify([...S.buildings.values()].filter(q => q.ip).map(q => [q.id, q.ip.v, q.ip.f, q.ip.s, q.ip.o, q.ip.r]));
      const s1 = G.Save.serialize(); const g1 = JSON.parse(s1).intG; const r0 = recs(); G.Save.apply(JSON.parse(s1)); G.Main.mode = 'game'; const r1 = recs();
      if (g1 !== In.VERSION) why.push(`o save de agora diz a gramática ${g1}`); if (r0 !== r1) why.push('os registros mudaram num save e load da gramática de agora');
      txt = `${b.type}#${b.id} (${b.ip.f}): no save, o corpo #${a0.id} em ${u0 ? u0.it + ':' + u0.q + ' (' + u0.use + ')' : '-'}, ${kept.length} da casa guardados dentro; aberto: a planta de agora ${p.items.map(i => i.kind).join(' ')}; o corpo ${use ? 'num lugar de agora' : 'solto do lugar'}, ${inside ? 'dentro, onde a planta deixa' : 'à porta'}; ${homeIn.length} da casa dentro, ${placed.length} em lugares da planta; a gramática do save de agora: ${g1}`;
    }
    ok('c6 um save de antes abre: o corpo solto do lugar que mudou, a família em casa, o verificador limpo', !why.length, why.length ? why.join(' · ') + (txt ? ' — ' + txt : '') : txt);
  }
}
if (process.env.JSON) { let all = {}; try { all = JSON.parse(fs.readFileSync(process.env.JSON, 'utf8')); } catch (e) { all = {}; } all[SAL] = out; fs.writeFileSync(process.env.JSON, JSON.stringify(all, null, 1)); }
console.log(`${fails.length ? 'FALHOU: ' + fails.join(', ') : 'PASSOU'} (${((clock() - t0) / 1000).toFixed(0)} s)`);
process.exit(fails.length ? 1 : 0);
