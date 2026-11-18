// genoma: o que se vê de uma pessoa, herdado (22a — D-551 a D-553, SOCIEDADE.md §3.2), em Node, sem o 3D (≈ 3 min):
//   g1 puro         o mesmo nascimento dá o mesmo genoma; o mesmo mundo com e sem o genoma vive igual: o acaso do mundo (S.rng) e o
//                   save inteiro, campo por campo, iguais depois de cinco dias — só o campo genoma difere
//   g2 a herança    cada alelo de um filho vem do pai ou da mãe; o filho mais perto dos pais que de estranhos, os irmãos também; o
//                   «puxou ao avô» (um alelo que salta uma geração); os filhos de um casal de dois povos com a pele entre os dois
//   g3 os fundadores  as distribuições de cada povo (o pigmento, o cabelo, o olho) no meio da tabela do povo; o sol da terra
//                   escurece a pele; nenhum par idêntico em milhares; o mesmo id em duas sementes, dois rostos
//   g4 os saves de antes  um save sem genoma abre e todos — vivos e mortos — ganham um; o mesmo save aberto duas vezes dá os mesmos;
//                   a pele desenhada de quem já existia fica a ΔE < 3 do v.skin salvo (o cabelo a ΔE < 5); um genoma estragado é refeito
//   g5 o pai morto  o pai morto antes do parto passa os genes (o registro dos mortos guarda o genoma); o corpo no chão tem o rosto que
//                   tinha; quem volta dos mortos volta com o mesmo genoma
//   g6 ninguém decide pela aparência  o mesmo mundo vivido dez dias com os genomas de verdade e com todos trocados por um genoma
//                   constante dá o mesmo mundo, campo por campo, fora o genoma (a prova forte da regra do dono)
//   g7 o peso do save  quanto o genoma pesa no save (a metrópole pronta)
//   g8 a mutação na regra  o passo de uma mutação nunca passa da regra do verificador (Ge.STEP): 200 mil filhos, a cauda contada
//   e o verificador (qa/feicao-inv.js) limpo, e acusando o genoma escrito à mão
//   [ONLY=g1,g6] node qa/genoma.js
const path = require('path');
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['qa/feicao-inv.js'] });
M.run('js/feicao.js'); // (the shape drawn: the colours the 3D reads — only seen)
const Ge = G.Genoma, Fe = G.Feicao;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | genoma ${name} | ${info}`); if (!c) fails.push(name); };
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean); const run = k => !ONLY.length || ONLY.includes(k);
const ms = t => Number(process.hrtime.bigint() - t) / 1e6;
const days = n => M.viver(G.DAY_LEN * n);
// the world, field by field, with every «genoma» left out (and the save's own clock)
function strip(o) { if (Array.isArray(o)) return o.map(strip); if (o && typeof o === 'object') { const r = {}; for (const k of Object.keys(o)) if (k !== 'genoma' && k !== 'savedAt') r[k] = strip(o[k]); return r; } return o; }
const snap = () => strip(JSON.parse(G.Save.serialize()));
function firstDiff(a, b, p) {
  if (a === b) return null; if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') return `${p}: ${JSON.stringify(a).slice(0, 80)} ≠ ${JSON.stringify(b).slice(0, 80)}`;
  const ks = new Set([...Object.keys(a), ...Object.keys(b)]); for (const k of ks) { const d = firstDiff(a[k], b[k], p + '.' + k); if (d) return d; } return null;
}
const dE = (h1, h2) => { const a = Ge.rgb2lab(G.hex2rgb(h1)), b = Ge.rgb2lab(G.hex2rgb(h2)); return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); };
const face = (p, q) => { let s = 0; for (let g = Ge.I.cranio; g <= Ge.I.orelhas; g++) s += (p[g] - q[g]) ** 2; return Math.sqrt(s); }; // (the genes of the face and the head)
const mean = a => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
const hook = G.Vg.born.find(f => /Ge\.bornOf/.test(String(f)));

// ------------------------------ g1 puro ------------------------------
if (run('g1')) {
  const a = Ge.founder(12345, 'grego', 0.2, 77), b = Ge.founder(12345, 'grego', 0.2, 77), c = Ge.child(999, a, Ge.founder(7, 'nordico', 0, 77), 77), d = Ge.child(999, b, Ge.founder(7, 'nordico', 0, 77), 77);
  const same = a === b && c === d && Ge.valid(a) && Ge.valid(c);
  const t0 = process.hrtime.bigint();
  M.novo({ seed: 4141, type: 'ilha', size: 64, tribes: 2 }); const r0 = G.S.rng; days(5);
  const A = snap(), rngA = G.S.rng, popA = G.S.villagers.size, withA = [...G.S.villagers.values()].filter(v => Ge.valid(v.genoma)).length, birthsA = G.S.stats.births;
  // (the same world with no genome at all: the door taken off)
  const i = G.Vg.born.indexOf(hook); if (i >= 0) G.Vg.born.splice(i, 1);
  M.novo({ seed: 4141, type: 'ilha', size: 64, tribes: 2 }); const r1 = G.S.rng; days(5);
  const B = snap(), rngB = G.S.rng, withB = [...G.S.villagers.values()].filter(v => v.genoma !== undefined).length;
  if (i >= 0) G.Vg.born.splice(i, 0, hook);
  const diff = firstDiff(A, B, 'save');
  ok('g1 puro', same && r0 === r1 && rngA === rngB && !diff && withA === popA && withB === 0,
    `o mesmo nascimento duas vezes: ${same ? 'o mesmo genoma' : 'OUTRO'} · cinco dias (${birthsA} nascimentos), ${popA} pessoas com genoma, e sem a porta do genoma ${withB} · o acaso do mundo ${rngA === rngB ? 'igual' : 'DIFERENTE'} · o save campo por campo fora o genoma: ${diff || 'igual'} · ${(ms(t0) / 1000).toFixed(1)} s`);
}

// ------------------------------ g2 a herança ------------------------------
if (run('g2')) {
  // (a few generations within a people and across two, as the world would make them)
  const seed = 99; let id = 1; const all = []; const fam = [];
  const civs = ['nordico', 'egipcio', 'asteca', 'grego'];
  let cur = []; for (const civ of civs) for (let k = 0; k < 120; k++) { const o = { id: id++, civ }; o.g = Ge.founder(o.id, civ, 0, seed); cur.push(o); all.push(o); }
  for (let gen = 0; gen < 3; gen++) {
    const next = [];
    for (const civ of civs) { const ppl = cur.filter(p => p.civ === civ); for (let k = 0; k + 1 < ppl.length; k += 2) { const kids = []; for (let c = 0; c < 3; c++) { const o = { id: id++, civ, m: ppl[k], f: ppl[k + 1] }; o.g = Ge.child(o.id, o.m.g, o.f.g, seed); kids.push(o); next.push(o); all.push(o); } fam.push([ppl[k], ppl[k + 1], kids]); } }
    cur = next;
  }
  const P = new Map(all.map(p => [p.id, Ge.pheno(p.g)]));
  let from = 0, n = 0; for (const p of all) if (p.m) { n++; if (Ge.fromParents(p.g, p.m.g, p.f.g)) from++; }
  const pc = [], sib = [], same = [];
  for (const [a, b, kids] of fam) { for (const k of kids) { pc.push(face(P.get(k.id), P.get(a.id))); pc.push(face(P.get(k.id), P.get(b.id))); } sib.push(face(P.get(kids[0].id), P.get(kids[1].id))); }
  for (let k = 0; k < 3000; k++) { const a = all[Math.floor(Ge.h32(1, k, 1, 0) * all.length)], b = all[Math.floor(Ge.h32(1, k, 2, 0) * all.length)]; if (a !== b && a.civ === b.civ) same.push(face(P.get(a.id), P.get(b.id))); }
  // (the grandfather's allele: an allele of a grandchild found in a grandparent but in neither allele of the parent's other side)
  let skip = 0; for (const p of all) if (p.m && p.m.m) { const G0 = Ge.alleles(p.m.m.g), C = Ge.alleles(p.g); for (let g = 0; g < Ge.NG; g++) if (C[g * 2] === G0[g * 2] || C[g * 2] === G0[g * 2 + 1]) { skip++; break; } }
  // (two peoples: a northern mother and an Egyptian father — the children's skin between theirs)
  const nm = all.find(p => p.civ === 'nordico'), ef = all.find(p => p.civ === 'egipcio'); const kids = [0, 1, 2, 3, 4].map(k => Ge.pheno(Ge.child(90000 + k, nm.g, ef.g, seed))[0]);
  const mN = Ge.pheno(nm.g)[0], mE = Ge.pheno(ef.g)[0]; const between = kids.every(x => x > Math.min(mN, mE) - 0.04 && x < Math.max(mN, mE) + 0.04);
  ok('g2 a herança', from === n && mean(pc) < 0.8 * mean(same) && mean(sib) < 0.85 * mean(same) && skip > 0 && between,
    `${from} de ${n} filhos com cada alelo do pai ou da mãe · a distância do rosto: pai/mãe–filho ${mean(pc).toFixed(3)}, irmãos ${mean(sib).toFixed(3)}, dois do mesmo povo ${mean(same).toFixed(3)} · netos com um alelo do avô materno: ${skip} · mãe nórdica ${mN.toFixed(2)}, pai egípcio ${mE.toFixed(2)} → filhos ${kids.map(x => x.toFixed(2)).join(' ')}`);
}

// ------------------------------ g3 os fundadores ------------------------------
if (run('g3')) {
  const seed = 2024, out = [], set = new Set(); let dup = 0, twins = 0; const by = {};
  for (const civ of Object.keys(Ge.POOL)) { by[civ] = []; for (let k = 0; k < 1000; k++) { const g = Ge.founder(civ.length * 100000 + k, civ, 0, seed); if (set.has(g)) dup++; set.add(g); by[civ].push(Ge.pheno(g)); } }
  const mel = c => mean(by[c].map(p => p[0])), hairC = c => mean(by[c].map(p => p[Ge.I.cabeloCor])), eye = c => mean(by[c].map(p => p[Ge.I.olhoCor]));
  const near = (x, c, g) => Math.abs(x - (Ge.POOL[c][g] ? Ge.POOL[c][g][0] : 32) / 63) < 0.025;
  const pools = Object.keys(Ge.POOL).every(c => near(mel(c), c, 'melanina') && near(hairC(c), c, 'cabeloCor') && near(eye(c), c, 'olhoCor'));
  const order = mel('nordico') < mel('grego') && mel('grego') < mel('egipcio') && mel('nordico') < mel('asteca');
  const sun = mean([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => Ge.pheno(Ge.founder(k, 'grego', 1, seed))[0] - Ge.pheno(Ge.founder(k, 'grego', -1, seed))[0]));
  const flat = Object.values(by).flat(); for (let i = 0; i < 1500; i++) for (let j = i + 1; j < 1500; j++) if (face(flat[i], flat[j]) < 0.05) { twins++; break; }
  const twoSeeds = Ge.founder(1, 'grego', 0, 1) !== Ge.founder(1, 'grego', 0, 2);
  ok('g3 os fundadores', dup === 0 && pools && order && sun > 0.15 && twins < 15 && twoSeeds,
    `${set.size} fundadores, ${dup} genomas repetidos · melanina média nórdico ${mel('nordico').toFixed(2)}, grego ${mel('grego').toFixed(2)}, romano ${mel('romano').toFixed(2)}, egípcio ${mel('egipcio').toFixed(2)}, asteca ${mel('asteca').toFixed(2)} (o meio de cada tabela: ${pools ? 'sim' : 'NÃO'}) · o sol da terra: ${sun.toFixed(2)} de melanina do frio ao calor · quase gêmeos no rosto entre 1500: ${twins} · o id 1 em duas sementes: ${twoSeeds ? 'dois rostos' : 'O MESMO'}`);
}

// ------------------------------ g4 os saves de antes ------------------------------
if (run('g4')) {
  M.pronto('cidade'); const S = G.S;
  const people = [...S.villagers.values(), ...S.dead.values()];
  const all = people.filter(p => Ge.valid(p.genoma)).length;
  const g1 = new Map(people.map(p => [p.id, p.genoma]));
  const born = people.length > 0 && !Number.isFinite(G.mod('genoma.desde')); // (made after the genome: born with them — T-1589)
  // (the save again, with no genome — as the ready worlds are —, opened twice)
  const raw = JSON.parse(G.Save.serialize()); const bare = strip(raw); bare.savedAt = raw.savedAt;
  G.Save.apply(JSON.parse(JSON.stringify(bare))); const g2 = new Map([...G.S.villagers.values(), ...G.S.dead.values()].map(p => [p.id, p.genoma]));
  G.Save.apply(JSON.parse(JSON.stringify(bare))); const g3 = new Map([...G.S.villagers.values(), ...G.S.dead.values()].map(p => [p.id, p.genoma]));
  // (the same save opened twice gives the same genomes; and, when the ready world came without them (the ones of before the
  // genome), the first opening gave those too — a ready world made after the genome brings the ones its people were born with,
  // and the save stripped of them is filled from the colours instead: T-1589)
  let same = 0; for (const [k, g] of g2) if (g3.get(k) === g && (born || g1.get(k) === g)) same++;
  let mxS = 0, mxH = 0, who = ''; for (const v of G.S.villagers.values()) { const f = Fe.of(v); const e = dE(f.skin, v.skin); if (e > mxS) { mxS = e; who = `${v.name} ${v.skin}→${f.skin}`; } mxH = Math.max(mxH, dE(f.hair, v.hair)); }
  // (a damaged genome — cut short — is made again at the load, the same as the whole one would be)
  const one = [...G.S.villagers.values()][3]; const want = one.genoma; const dmg = JSON.parse(JSON.stringify(bare)); const ov = dmg.villagers.find(v => v.id === one.id); ov.genoma = 'abc';
  G.Save.apply(dmg); const fixed = G.S.villagers.get(one.id).genoma;
  // (the verifier on the save filled from the looks: clean — the colour of who was born before is the one they had —; and a child
  // born after with colour alleles from neither parent is still caught, L-1674)
  const vq = () => QA.check().filter(q => q.sys === 'genoma'); const after = vq();
  const kid = [...G.S.villagers.values()].find(v => G.person(v.mother) && G.person(v.father)); let caughtOld = null, caughtNew = null;
  if (kid) { const keepG = kid.genoma, keepB = kid.born, A = Ge.alleles(keepG), Mo = Ge.alleles(G.person(kid.mother).genoma), mi = Ge.I.melanina * 2;
    A[mi] = Math.abs(Mo[mi] - 0) + Math.abs(Mo[mi + 1] - 0) > Math.abs(Mo[mi] - 63) + Math.abs(Mo[mi + 1] - 63) ? 0 : 63; kid.genoma = Ge.encode(A);
    caughtOld = vq().some(q => /não vem do pai nem da mãe/.test(q.msg)); kid.born = G.mod('genoma.desde') + 1; caughtNew = vq().some(q => /não vem do pai nem da mãe/.test(q.msg)); kid.genoma = keepG; kid.born = keepB; }
  // (a save of the 28 genes, before the greying one, D-635: every genome cut two short — opened, each keeps its 56 and gains the
  // 29th from the parents, the same both times, and the verifier finds every child's alleles in its parents)
  const full = JSON.parse(G.Save.serialize()); const cut = JSON.parse(JSON.stringify(full)); let cutN = 0;
  for (const k of ['villagers', 'dead']) for (const p of (Array.isArray(cut[k]) ? cut[k] : [])) { const r = Array.isArray(p) ? p[1] : p; if (r && typeof r.genoma === 'string') { r.genoma = r.genoma.slice(0, Ge.LEN - 2); cutN++; } }
  G.Save.apply(JSON.parse(JSON.stringify(cut))); const e1 = new Map([...G.S.villagers.values(), ...G.S.dead.values()].map(p => [p.id, p.genoma])); const kinCut = QA.check().filter(q => q.sys === 'genoma');
  G.Save.apply(JSON.parse(JSON.stringify(cut))); let keep = 0, twice = 0; for (const p of [...G.S.villagers.values(), ...G.S.dead.values()]) { const g0 = (full.villagers.concat(full.dead || []).map(q => (Array.isArray(q) ? q[1] : q)).find(q => q && q.id === p.id) || {}).genoma; if (g0 && Ge.valid(p.genoma) && p.genoma.slice(0, Ge.LEN - 2) === g0.slice(0, Ge.LEN - 2)) keep++; if (e1.get(p.id) === p.genoma) twice++; }
  const extOk = cutN > 0 && keep === e1.size && twice === e1.size && !kinCut.length;
  ok('g4 os saves de antes', all === people.length && same === g2.size && mxS < 3 && mxH < 5 && fixed === want && !after.length && caughtOld === false && caughtNew === true && extOk && M.limpo(),
    `a cidade pronta (${born ? 'com o genoma de quem nasceu' : 'sem genoma'}): ${all} de ${people.length} — vivos e mortos — com um ao abrir · sem ele, aberto duas vezes: ${same} de ${g2.size} iguais · a pele desenhada a ΔE ${mxS.toFixed(2)} do v.skin salvo no pior (${who}), o cabelo ${mxH.toFixed(2)} · um genoma estragado: ${fixed === want ? 'refeito igual' : 'OUTRO'} · o verificador depois: ${after.length ? after[0].msg : 'limpo'}; a cor de um filho fora dos pais: de quem nasceu antes ${caughtOld ? 'ACUSADA' : 'aceita (a cor que tinha)'}, de quem nasceu depois ${caughtNew ? 'acusada' : 'NÃO acusada'} · um save dos 28 genes (${cutN} genomas cortados): ${keep} de ${e1.size} guardam os 56 de antes, ${twice} iguais nas duas vezes, o verificador ${kinCut.length ? kinCut[0].msg : 'limpo'} · ${M.limpo() ? 'sem erro' : JSON.stringify(M.erros()).slice(0, 200)}`);
}

// ------------------------------ g5 o pai morto ------------------------------
if (run('g5')) {
  M.novo({ seed: 515, type: 'ilha', size: 64, tribes: 2 }); const S = G.S; days(1);
  const mother = [...S.villagers.values()].find(v => v.g === 'f' && v.partner && v.age >= 18 && v.age < 40 && !v.preg && S.villagers.get(v.partner));
  const father = mother && S.villagers.get(mother.partner); const fg = father && father.genoma;
  let info = 'sem casal'; let good = false;
  if (mother && father) {
    father.x = mother.x + 1.5; father.y = mother.y; // (fallen near her, on land)
    G.Village.kill(father, 'war', true); const rec = S.dead.get(father.id); const body = G.Carnage && G.Carnage.byVid ? G.Carnage.byVid(father.id) : null;
    mother.preg = 0.2; const k0 = mother.kids.length; let t = 0; while (mother.kids.length === k0 && t++ < 100) M.viver(0.1);
    const kid = S.villagers.get(mother.kids[mother.kids.length - 1]);
    const pass = !!kid && kid.father === father.id && Ge.fromParents(kid.genoma, mother.genoma, rec.genoma) && rec.genoma === fg;
    // (back from the dead: the power's own door, with the faith it asks)
    S.faith = 999; const P = G.Powers; let back = null; try { const at = body || { x: father.x, y: father.y }; P.resurrect(at.x, at.y, String(father.id)); back = S.villagers.get(father.id); } catch (e) { back = null; }
    good = pass && rec.genoma === fg && (!body || body.look.genoma === fg) && (!!back && back.genoma === fg);
    info = `o pai morto na guerra: o registro ${rec.genoma === fg ? 'guarda o genoma' : 'SEM O GENOMA'}; o corpo no chão ${body ? (body.look.genoma === fg ? 'com o mesmo rosto' : 'COM OUTRO') : '(sem corpo)'}; o filho nasceu ${kid ? `(${kid.name}, pai #${kid.father})` : 'NÃO'} com os alelos do pai morto ${pass ? 'sim' : 'NÃO'}; quem voltou dos mortos ${back ? (back.genoma === fg ? 'com o mesmo genoma' : 'COM OUTRO') : 'NÃO VOLTOU'}`;
  }
  ok('g5 o pai morto', good, info);
}

// ------------------------------ g6 ninguém decide pela aparência ------------------------------
if (run('g6')) {
  const t0 = process.hrtime.bigint();
  const live = cst => {
    M.pronto('cidade');
    const bornOf = Ge.bornOf; let hand = 0;
    if (cst) { for (const p of [...G.S.villagers.values(), ...G.S.dead.values()]) { p.genoma = cst; hand++; } Ge.bornOf = () => cst; }
    try { days(10); } finally { Ge.bornOf = bornOf; }
    const peop = [...G.S.villagers.values()]; return { snap: snap(), rng: G.S.rng, births: G.S.stats.births, pop: peop.length, gens: new Set(peop.map(v => v.genoma)).size, hand };
  };
  const A = live(null), B = live('g'.repeat(Ge.LEN));
  const diff = firstDiff(A.snap, B.snap, 'save');
  ok('g6 ninguém decide pela aparência', !diff && A.rng === B.rng && B.gens === 1 && A.gens > 50,
    `a cidade pronta, dez dias: ${A.pop} pessoas (${A.births} nascimentos), ${A.gens} genomas diferentes — e com todos trocados por um só (${B.hand} na mão, e os que nasceram): o acaso do mundo ${A.rng === B.rng ? 'igual' : 'DIFERENTE'}, o save campo por campo fora o genoma: ${diff || 'igual'} · ${(ms(t0) / 1000).toFixed(0)} s`);
}

// ------------------------------ g7 o peso do save ------------------------------
if (run('g7')) {
  M.pronto('metropole'); const S = G.S;
  const s1 = G.Save.serialize(), s0 = JSON.stringify(strip(JSON.parse(s1))); const n = S.villagers.size + S.dead.size;
  const per = (s1.length - s0.length) / n, pct = (s1.length / s0.length - 1) * 100;
  ok('g7 o peso do save', per < 72 && pct < 3, // (the genome's 58 characters — the 29th gene, D-635 — and its key: ≈ 70 bytes a person)
    `a metrópole pronta: ${S.villagers.size} vivos e ${S.dead.size} mortos — o save de ${(s0.length / 1e6).toFixed(2)} para ${(s1.length / 1e6).toFixed(2)} MB (+${((s1.length - s0.length) / 1024).toFixed(0)} KB, +${pct.toFixed(1)}%), ${per.toFixed(0)} bytes por pessoa`);
}

// ------------------------------ o verificador ------------------------------
if (run('inv')) {
  M.novo({ seed: 616, type: 'ilha', size: 64, tribes: 2 }); days(2); const S = G.S;
  const now = QA.check().filter(q => q.sys === 'genoma');
  const kid = [...S.villagers.values()].find(v => v.mother && v.father && G.person(v.mother) && G.person(v.father));
  let byHand = [], gone = [];
  if (kid) { const keep = kid.genoma; kid.genoma = Ge.founder(777777, 'asteca', 0, 1); byHand = QA.check().filter(q => q.sys === 'genoma'); kid.genoma = 'xyz'; gone = QA.check().filter(q => q.sys === 'genoma'); kid.genoma = keep; }
  // (the shape's marks: a stump drawn on someone whole, a weight out of its box — told by the test's hand into the drawn feição)
  let stump = [], box = []; const F = G.Feicao, whole = [...S.villagers.values()].find(v => !v.lost && F && F.of(v));
  if (whole) { const w = F.of(whole).w, X = F.IDX; w[X.cotoBracoE] = 1; stump = QA.check().filter(q => q.sys === 'genoma'); w[X.cotoBracoE] = 0; const k = w[X.gordo]; w[X.gordo] = NaN; box = QA.check().filter(q => q.sys === 'genoma'); w[X.gordo] = k; }
  ok('o verificador (qa/feicao-inv.js)', !now.length && byHand.some(q => /não vem do pai nem da mãe/.test(q.msg)) && gone.some(q => /sem um genoma válido/.test(q.msg)) && stump.some(q => /sem a causa no mundo/.test(q.msg)) && box.some(q => /fora da caixa/.test(q.msg)),
    `agora ${now.length} · o genoma de um filho escrito à mão: «${(byHand[0] || {}).msg || 'NADA'}» · um genoma estragado: «${(gone[0] || {}).msg || 'NADA'}» · um coto sem causa: «${(stump[0] || {}).msg || 'NADA'}» · um peso sem número: «${(box[0] || {}).msg || 'NADA'}»`);
}
// ------------------------------ g8 a mutação na regra ------------------------------
// (a child's allele is one of a parent's or a mutation of at most Ge.STEP from it — the generator and the verifier's rule are the
// same number: a rare big draw of the normal step made a child the verifier took for a genome written by hand, Valéria #28905 of
// the hundred years, 17 away from her father's: L-1709). 200 thousand births of two founders, each allele asked; and the births
// where the step drawn passed the bound, counted, so the proof shows it reached the tail it is about
if (run('g8')) {
  const seed = 3404, mg = Ge.founder(1, 'romano', 0, seed), fg = Ge.founder(2, 'romano', 0, seed);
  let bad = 0, ex = '', tail = 0; const t0 = process.hrtime.bigint();
  for (let id = 100; id < 200100; id++) {
    for (let g = 0; g < Ge.NG; g++) for (let k = 0; k < 2; k++) if (Ge.h32(seed, id, g, 13 + k) < 0.02 && Math.abs(Math.round(Ge.normInv(Ge.h32(seed, id, g, 15 + k)) * 4)) > Ge.STEP) tail++;
    if (!Ge.fromParents(Ge.child(id, mg, fg, seed), mg, fg)) { if (!bad++) ex = '#' + id; }
  }
  ok('g8 a mutação na regra do verificador', Number.isFinite(Ge.STEP) && !bad && tail > 0,
    `200 mil filhos de dois fundadores: ${bad ? bad + ' com um alelo fora da regra (o primeiro ' + ex + ')' : 'todo alelo do pai ou da mãe ou a um passo de no máximo ' + Ge.STEP} · ${tail} sorteios de mutação além do passo, levados ao passo · ${ms(t0).toFixed(0)} ms`);
}
// ------------------------------ as regras do guard, sabotadas ------------------------------
// (each rule of the 22a, 197–203, accuses a violation planted in a copy of the game's js/: the guard run on the copy fails with it)
if (run('gd')) {
  const fs = require('fs'), os = require('os'), cp = require('child_process');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'genoma-guard-')); const J = path.join(tmp, 'js'); fs.mkdirSync(J);
  const ROOT = path.join(__dirname, '..'), SRC = path.join(ROOT, 'js'); for (const f of fs.readdirSync(SRC)) if (f.endsWith('.js')) fs.copyFileSync(path.join(SRC, f), path.join(J, f));
  for (const e of fs.readdirSync(ROOT)) if (e !== 'js') fs.symlinkSync(path.join(ROOT, e), path.join(tmp, e)); // (the guard reads the page, the art, the proofs beside the code)
  const guard = () => { try { cp.execFileSync('node', [path.join(__dirname, 'guard.js'), tmp], { encoding: 'utf8' }); return ''; } catch (e) { return String(e.stdout || ''); } };
  const clean = guard() === '';
  const CASES = [
    ['197', 'possess.js', s => s + "\nG.S.villagers.get(1).genoma = 'x';\n", /o genoma só o genoma\.js escreve: possess\.js/],
    ['198', 'crime.js', s => s + '\nconst lookOf = v => v.genoma;\n', /o genoma só o desenho lê: crime\.js/],
    ['199 acaso', 'genoma.js', s => s.replace("const Ge = G.Genoma = {};", "const Ge = G.Genoma = {}; const roll = () => G.R();"), /o genoma é puro: genoma\.js:\d+ tira de um acaso/],
    ['199 o mundo na conta', 'genoma.js', s => s.replace("const Ge = G.Genoma = {};", "const Ge = G.Genoma = {}; const day = () => G.S.day;"), /o genoma é puro: genoma\.js:\d+ a conta lê o mundo/],
    ['199 outro campo', 'genoma.js', s => s.replace("p.genoma = Ge.withLook(g, p.skin, p.hair, mg && fg ? mg : null, mg && fg ? fg : null);", "p.genoma = Ge.withLook(g, p.skin, p.hair, mg && fg ? mg : null, mg && fg ? fg : null); p.skin = '#000000';"), /as portas do mundo escrevem outro campo/],
    ['200 número', 'body3d.js', s => s + '\nconst jawOf = pose => pose.face[3];\n', /o rosto pelo nome: body3d\.js:\d+ lê um canal do rosto por um número/],
    ['200 nome', 'body3d.js', s => s + '\nconst chinOf = pose => pose.face[RI.chin];\n', /lê o canal «chin»/],
    ['201', 'feicao.js', s => s.replace('MEMO.set(v.id, o);', 'MEMO.set(v.id, o); v.hp = 1;'), /a feição só se vê: feicao\.js/],
    ['201 a casa', 'feicao.js', s => s.replace("heavy = HEAVY.has(v.role) ? 1 : 0;", "heavy = HEAVY.has(v.role) || (G.Eco.homeOf(v) || {}).coin > 500 ? 1 : 0;"), /pergunta pela casa, as moedas/],
    ['201 um campo', 'feicao.js', s => s.replace("heavy = HEAVY.has(v.role) ? 1 : 0;", "heavy = HEAVY.has(v.role) || v.noble ? 1 : 0;"), /lê da pessoa «noble», que não é do corpo/],
    ['202 o retrato', 'look3d.js', s => s.replace('if (Fe) L.s *= Fe.alt;', ''), /o look3d\.js não desenha a altura/],
    ['202 a conta', 'art.js', s => s + '\nconst tone = () => G.Genoma.skinHex(0.5, 0.5);\n', /a cor e a altura da feição: art\.js/],
    ['203', 'people3d.js', s => s + '\nconst gx = v => v.genoma;\n', /o 3D lê a pessoa pela feição: people3d\.js/],
    // (236, L-1248 = L-1673 planted again: the water's piece without its last new line, joined to the rock's by «+» as it was)
    ['236 o pedaço com nome', 'agua3d.js', s => s.replace("}\n`; // (ends in a line of its own", "}`; // (ends in a line of its own"), /junta por «\+» o pedaço «groundGLSL\(\)»/, 'ground3d.js', s => s.replace("[G3.texGLSL(), gMeans(), G.Agua3D ? G.Agua3D.groundGLSL() : '', FRAG()].join('\\n')", "G3.texGLSL() + gMeans() + (G.Agua3D ? G.Agua3D.groundGLSL() : '') + FRAG()")],
    ['237', 'art.js', s => s.replace("c.fillStyle = skin; c.beginPath(); c.arc(0, hy, 2.05, 0, TAU); c.fill();", "c.fillStyle = v.skin; c.beginPath(); c.arc(0, hy, 2.05, 0, TAU); c.fill();"), /a vista do deus pela feição: art\.js:\d+ pinta a pessoa pelo v\.skin/],
    // (237, L-1678 planted again: the dead's painter copying the look's stored colours, the living skin painted over the rot)
    ['237 o morto', 'carnage.js', s => s.replace("L.skin = c.pose === 'burnt' ? c.look.skin : G.Art.skinOf(c.look); L.hair = G.Art.hairOf(c.look); L.dead = true; ", ''), /o pintor do morto \(C\.paintLook do carnage\.js\) não pinta a cópia pela feição/],
    // (238: the panel's portrait drawn by the god only; another file putting someone in the body's rows; the studio at work while
    // the 3D draws the body's world)
    ['238 o painel', 'ui.js', s => s.replace("    if (G.Retrato3D && G.Retrato3D.into(c, v)) return c; // (22a, D-645: the face by the 3D, made once and kept — the god's drawing until it is)\n", ''), /o portrait do ui\.js não pede o rosto ao G\.Retrato3D\.into/],
    ['238 as linhas', 'fx3d.js', s => s + '\nconst pose1 = () => G.Body3D.put(0, null, null, null, 0, 0, 0);\n', /fx3d\.js:\d+ põe gente nas linhas do corpo do 3D/],
    ['238 o corpo', 'retrato3d.js', s => s.replace('if (R3.on) { asks.clear(); return; }', ''), /o retrato3d\.js faz retratos com o 3D desenhando o mundo do corpo/],
    // (239: the society's answer without the talk's kind; the eye of a talk turning the player's yaw; the eye reading the act, not the task)
    ['239 a resposta', 'soc-verbos.js', s => s.replace("act: 'argue', pri: 1.1, wait: 3 * K, kind: 'talk' }", "act: 'argue', pri: 1.1, wait: 3 * K }"), /soc-verbos\.js:\d+ uma tarefa de fala com o corpo sem o kind 'talk'/],
    ['239 o olho gira', 'cam3d.js', s => s.replace("if (t) talkPt = t;", "if (t) { talkPt = t; C3.yaw += 0.01; }"), /cam3d\.js:\d+ o olho da conversa muda o rumo/],
    ['239 o ato', 'cam3d.js', s => s.replace("t.kind !== 'talk'", "!/talk|resposta/.test(t.type)"), /o talkOf do cam3d\.js não pergunta pelo kind 'talk'/],
    ['236 o modelo', 'mira3d.js', s => s + '\nconst bad = `uniform float uX;\nvoid main() { }` + `#define Y 1\n`;\n', /um modelo de GLSL juntado a outro por «\+»/],
  ];
  const res = [];
  for (const [name, f, plant, want, f2, plant2] of CASES) { // (a case may plant in two files: the piece and the place it is joined)
    const ps = [[f, plant]].concat(f2 ? [[f2, plant2]] : []).map(([ff, pl]) => { const p = path.join(J, ff), s0 = fs.readFileSync(p, 'utf8'); return { p, s0, s1: pl(s0) }; });
    if (ps.some(q => q.s1 === q.s0)) { res.push(`${name}: a sabotagem não pegou`); continue; }
    for (const q of ps) fs.writeFileSync(q.p, q.s1); const out = guard(); for (const q of ps) fs.writeFileSync(q.p, q.s0);
    res.push(`${name}: ${want.test(out) ? 'acusada' : 'NÃO ACUSADA'}`);
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  ok('as regras 197–203 e 236 a 239 do guard sabotadas', clean && res.every(r => / acusada$/.test(r)), `a cópia limpa: ${clean ? 'passa' : 'FALHA'} · ${res.join(' · ')}`);
}
ok('sem erro de módulo nem aviso no console', M.limpo(), M.limpo() ? 'limpo' : JSON.stringify(M.erros()).slice(0, 300));
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
