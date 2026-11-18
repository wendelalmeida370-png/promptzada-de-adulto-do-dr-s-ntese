// sociedade-eco: o medidor da sociedade (22b, D-547; o molde do oficio-eco.js). Não é uma prova: mede.
//   node qa/sociedade-eco.js [sementes=103,7,2024,11,42] [anos=40] [tipo=continente] [tam=128] [povos=4]
//       cada mundo do zero no salto, um ano por vez; o resultado de cada semente vai para OUT/semente-N.json (OUT, a pasta; sem ela,
//       só a tela) — e uma semente já medida na pasta é pulada (a máquina reinicia sem avisar: roda de novo e continua)
//   node qa/sociedade-eco.js pronto:metropole [anos=4]   um mundo pronto (as cidades grandes: o crime dos mundos novos é raro), no
//       mesmo salto, para OUT/pronto-metropole.json; a soma dos prontos: soma PASTA [ANTES] pronto
//   RAIZ=pasta-do-jogo   mede outra cópia do jogo (a de antes de uma mudança), com as provas desta
//   node qa/sociedade-eco.js soma PASTA [PASTA_DE_ANTES]   a soma de uma pasta — e, com a segunda, o antes e o depois lado a lado
// O que mede, em cada mundo de 40 anos: a gente e a pirâmide; os nascimentos; os casais novos (por como se formaram), a idade do
// primeiro casal, os viúvos que casam de novo; as mortes por causa; os furtos, as agressões, os homicídios, os presos e os
// executados por mil pessoas-ano; as revoltas, os motins e os golpes; os órfãos; os laços por pessoa (e os amigos, os inimigos);
// o save por pessoa e o tempo de um ano do salto. **Tudo também por povo** (o povo de cada pessoa, v.civ): a regra do dono medida —
// nenhum povo mais «criminoso», «cruel» ou «odiado» que outro na mesma condição. A condição de quem furta é a que o furto lê
// (a fome com a bolsa vazia, a rua, o hábito, a pobreza entre os que têm), olhada em todos os adultos a cada dez segundos do salto:
// os furtos de um povo contam contra o tempo que a sua gente passou nessa condição, não contra a sua gente inteira; e as agressões, contra o
// tempo que ela passou bêbada, ou com uma ofensa de peso na cabeça, ou sem nenhuma das duas (o povo cujas cidades bebem mais briga mais:
// é a bebida, não o povo).
// Mundo a mundo o acaso das guerras muda muito: só a soma de cinco ou dez mundos diz alguma coisa.
const fs = require('fs'), path = require('path');
const ROOT = process.env.RAIZ ? path.resolve(process.env.RAIZ) : path.resolve(__dirname, '..');
const OUT = process.env.OUT || '';
const civName = id => id || '—';
const add = (o, k, n) => { o[k] = (o[k] || 0) + (n === undefined ? 1 : n); };

if (process.argv[2] === 'soma') { soma(process.argv[3], process.argv[4]); process.exit(0); }

const M = require(path.join(ROOT, 'qa', 'nodemundo.js')); const G = M.load({ qa: true, root: ROOT });
const a2 = process.argv[2] || '103,7,2024,11,42';
const seeds = a2.split(',').map(x => (/^pronto:/.test(x) ? x : Number(x))), anos = +(process.argv[3] || 40), type = process.argv[4] || 'continente', size = +(process.argv[5] || 128), tribes = +(process.argv[6] || 4);
const ms = () => Number(process.hrtime.bigint() / 1000000n);
let R = null; // (the world being measured)
// ------------------------------ the hooks (they only count: nothing of the world is changed) ------------------------------
const kill0 = G.Village.kill;
G.Village.kill = function (v, cause) {
  if (R && v && !v.dead && G.S.villagers.has(v.id)) { add(R.mortes, cause || 'unknown'); add(R.porPovo(v.civ).mortes, cause || 'unknown'); }
  return kill0.apply(this, arguments);
};
const create0 = G.Vg.create;
G.Vg.create = function (o) {
  const v = create0.apply(this, arguments);
  if (R && v && o && o.age === 0 && o.mother) { R.nasc++; R.porPovo(v.civ).nasc++; }
  return v;
};
const pair0 = G.Vg.pair;
if (pair0) G.Vg.pair = function (a, b, como) {
  if (R && a && b && a !== b) {
    add(R.casais, como || '?');
    if (como !== 'inicio' && como !== 'chegada') {
      R.casaisN++; R.porPovo(a.civ).casais += 0.5; R.porPovo(b.civ).casais += 0.5;
      for (const x of [a, b]) {
        if (x.widow) R.viuvosCasam++;
        if (!R.teve.has(x.id)) { R.idade1.push(Math.round(x.age * 10) / 10); R.teve.add(x.id); }
      }
    }
  }
  return pair0.apply(this, arguments);
};
const give0 = G.Vg.give;
G.Vg.give = function (v, t) {
  const ok = give0.apply(this, arguments);
  if (R && ok && t && t.type === 'furto') { wealthAt = new Map(); const c = cond(v); const p = R.porPovo(v.civ); add(R.furtoCond, c); add(p.furtoCond, c); }
  return ok;
};
const signal0 = G.Stories.signal;
G.Stories.signal = function (kind, d) {
  if (R && G.S && G.Main.mode !== 'menu') {
    if (kind === 'uprising' || kind === 'riot') { add(R.politica, kind); const f = d && G.Fac.get(d.fac); add(R.porPovo(f && f.civ).politica, kind); }
    if (kind === 'regime') add(R.politica, 'regime');
  }
  return signal0.apply(this, arguments);
};
// the condition a theft reads (crime.js desperate): hunger with an empty purse, a night in the street, the habit, poverty among the well-off
const purse = v => (G.Eco && G.Eco.purse ? G.Eco.purse(v) : 0);
// (a town's ordinary coin, counted here: G.Crime.wealth keeps the day's in its own memory, and asking it from outside the step
// would fill that memory at another hour than the world's)
let wealthAt = new Map(); const wealth = sid => { if (wealthAt.has(sid)) return wealthAt.get(sid); let c = 0, n = 0; for (const b of G.S.buildings.values()) if (b.set === sid && b.built && G.BDEF[b.type].housing) { c += b.coin || 0; n++; } const w = n ? c / n : 0; wealthAt.set(sid, w); return w; };
function cond(v) {
  const f = G.Fac.ofV(v); const pop = f ? G.Fac.pop(f.id) : 1;
  if (v.hunger > 62 && purse(v) < 1 && f && f.stock.food < pop * 0.4) return 'fome';
  if (v.rua && G.S.day - v.rua >= 2) return 'rua';
  if ((v.thefts || 0) > 0) return 'habito';
  if (purse(v) < 1 && f && G.Eco.coinage(f.id) && wealth(v.set) >= 10) return 'pobreza';
  return 'nenhuma';
}
const crimes = new Map(); // id → { kind, civ, preso }
// the condition a blow reads (soc-vida.js, act-taverna.js): drunk at the tavern, a grudge held (an offence of weight on the mind), neither
const MARCA_RUIM = { humilhou: 1, insultou: 1, bateu: 1, roubou: 1, traiu: 1, matou: 1, denunciou: 1 };
function condA(v) { if (!v) return 'nenhuma'; if (v.drunk > G.S.clock) return 'bebado'; if ((v.marcas || []).some(q => MARCA_RUIM[q[0]] && q[3] >= 20)) return 'rancor'; return 'nenhuma'; }
function lookCrimes() {
  for (const c of G.S.crimes || []) {
    let r = crimes.get(c.id);
    if (!r) {
      const th = G.S.villagers.get(c.thief) || G.S.dead.get(c.thief); const civ = th ? th.civ : null;
      r = { kind: c.kind, civ, preso: false }; crimes.set(c.id, r);
      add(R.crimes, c.kind); add(R.porPovo(civ).crimes, c.kind);
      if (c.kind !== 'furto') { const vi = G.S.villagers.get(c.victim) || G.S.dead.get(c.victim); add(R.porPovo(vi ? vi.civ : null).vitimas, c.kind); const k = condA(G.S.villagers.get(c.thief)); add(R.agrCond, k); add(R.porPovo(civ).agrCond, k); }
    }
    if (c.kind !== r.kind && c.kind === 'homicidio') { add(R.crimes, r.kind, -1); add(R.porPovo(r.civ).crimes, r.kind, -1); r.kind = c.kind; add(R.crimes, c.kind); add(R.porPovo(r.civ).crimes, c.kind); }
    if (!r.preso && c.jail) { r.preso = true; R.presos++; R.porPovo(r.civ).presos++; }
  }
}
function lookPeople() {
  const S = G.S; wealthAt = new Map();
  for (const v of S.villagers.values()) {
    const p = R.porPovo(v.civ); p.amostras++;
    if (v.age >= 16 && v.age <= 64 && !v.captive) { add(p.expo, cond(v)); add(p.expoA, condA(v)); }
  }
  R.amostras++;
}
function lookYear() {
  const S = G.S;
  for (const v of S.villagers.values()) { R.pessoasAno++; R.porPovo(v.civ).pessoasAno++; }
  // the rulers' persona, as written (never computed here: the first reading writes it)
  for (const f of S.factions.values()) { const r = f.leader && S.villagers.get(f.leader); if (!r || !r.pe) continue; const p = R.porPovo(r.civ); p.gov++; p.cru += r.pe.cru; p.agg += r.pe.agg; R.gov++; R.cru += r.pe.cru; R.agg += r.pe.agg; }
}
function fresh(seed) {
  const pov = {};
  return {
    seed, anos, type, size, tribes, root: ROOT, nasc: 0, casais: {}, casaisN: 0, viuvosCasam: 0, idade1: [], teve: new Set(), mortes: {}, crimes: {}, presos: 0,
    politica: {}, furtoCond: {}, agrCond: {}, pessoasAno: 0, amostras: 0, gov: 0, cru: 0, agg: 0, msAno: [], pov,
    porPovo(c) { const k = civName(c); return pov[k] || (pov[k] = { pessoasAno: 0, nasc: 0, casais: 0, mortes: {}, crimes: {}, vitimas: {}, presos: 0, furtoCond: {}, expo: {}, agrCond: {}, expoA: {}, amostras: 0, politica: {}, gov: 0, cru: 0, agg: 0, gente: 0, orfaos: 0, lacos: 0, afetoRecebido: 0, afetoN: 0, odiado: 0 }); },
  };
}
function finish() {
  const S = G.S; const o = R; const vs = [...S.villagers.values()];
  // (the world's fingerprint: two versions of the game that should make the same world give the same one)
  { const s = JSON.stringify(QA.canon()); let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } o.fp = (h >>> 0).toString(16) + '/' + S.rng; }
  o.gente = vs.length; o.adultos = vs.filter(v => v.age >= 16 && v.age < 62).length;
  o.piramide = [0, 0, 0, 0, 0, 0]; for (const v of vs) o.piramide[v.age < 2 ? 0 : v.age < 16 ? 1 : v.age < 30 ? 2 : v.age < 45 ? 3 : v.age < 62 ? 4 : 5]++;
  o.orfaos = 0; o.criancas = 0; o.criados = 0;
  // (and the orphans someone raises — the phase 4b, G.Tutela —: the ones with nobody are the orphans less these)
  for (const v of vs) { const p = o.porPovo(v.civ); p.gente++; if (v.age < 16) { o.criancas++; if (!S.villagers.has(v.mother) && !S.villagers.has(v.father)) { o.orfaos++; p.orfaos++; if (v.tutor && S.villagers.has(v.tutor)) o.criados++; } } }
  // (the rumours alive at the end, and how many were born — the phase 3, G.Boatos)
  o.boatos = S.boatos && S.boatos.list ? S.boatos.list.length : 0; o.boatosN = S.boatos ? S.boatos.tot || 0 : 0;
  // the ties (22b): how many each one keeps, the friends and the enemies, and what the others feel for each people
  const lens = vs.map(v => (Array.isArray(v.lacos) ? v.lacos.length : 0)).sort((a, b) => a - b);
  o.lacosMedia = lens.reduce((a, b) => a + b, 0) / Math.max(1, lens.length); o.lacosP90 = lens[Math.floor(lens.length * 0.9)] || 0;
  o.amigos = 0; o.inimigos = 0;
  if (G.Lacos && G.Lacos.de) for (const v of vs) { o.amigos += G.Lacos.de(v, 'amizade').length; o.inimigos += G.Lacos.de(v, 'odio').length; }
  for (const v of vs) for (const l of v.lacos || []) { const t = S.villagers.get(l[0]); if (!t) continue; const p = o.porPovo(t.civ); p.afetoRecebido += l[1]; p.afetoN++; if (l[1] <= -50) p.odiado++; }
  for (const v of vs) o.porPovo(v.civ).lacos += Array.isArray(v.lacos) ? v.lacos.length : 0;
  o.marcas = vs.reduce((a, v) => a + (Array.isArray(v.marcas) ? v.marcas.length : 0), 0);
  const sv = G.Save.serialize(); const so = JSON.parse(sv);
  o.save = sv.length; o.savePessoa = Math.round(JSON.stringify(so.villagers).length / Math.max(1, so.villagers.length));
  o.casaisVivos = vs.filter(v => v.partner && v.g === 'f').length;
  o.solteiros3062 = vs.filter(v => v.age >= 30 && v.age < 62 && !v.partner && !v.widow).length; o.adultos3062 = vs.filter(v => v.age >= 30 && v.age < 62).length;
  o.cidades = S.settlements.size; o.povos = [...S.factions.values()].filter(f => f.alive !== false && G.Fac.pop(f.id) > 0).length;
  o.coups = S.stats.coups || 0; o.revolutions = S.stats.revolutions || 0; o.govChanges = S.stats.govChanges || 0;
  o.erros = M.limpo() ? null : M.erros();
  delete o.teve; delete o.porPovo;
  return o;
}
// ------------------------------ the worlds ------------------------------
let bad = false;
for (const seed of seeds) {
  const pr = typeof seed === 'string' ? seed.slice(7) : null;
  const file = OUT && path.join(OUT, pr ? `pronto-${pr}.json` : `semente-${seed}.json`);
  if (file && fs.existsSync(file)) { console.log(`semente ${seed}: já medida (${file})`); continue; }
  if (pr) M.pronto(pr); else M.novo({ seed, type, size, tribes });
  crimes.clear(); for (const c of G.S.crimes || []) crimes.set(c.id, { kind: c.kind, civ: null, preso: !!c.jail }); R = fresh(seed);
  for (const v of G.S.villagers.values()) if (v.partner || v.widow) R.teve.add(v.id);
  const step0 = G.Main.skipStep; let k = 0;
  G.Main.skipStep = function (dt) { const r = step0.apply(this, arguments); if (++k % 10 === 0) { lookCrimes(); lookPeople(); } return r; };
  const t0 = ms();
  try {
    for (let y = 1; y <= anos; y++) { const a = ms(); M.saltar(1); lookCrimes(); lookYear(); R.povoAnos = (R.povoAnos || 0) + [...G.S.factions.values()].filter(f => f.alive !== false && G.Fac.pop(f.id) > 0).length; R.msAno.push(ms() - a); if (y % 10 === 0) console.log(`  semente ${seed}, ano ${y}: ${G.S.villagers.size} pessoas, ${Math.round((ms() - t0) / 1000)} s`); }
  } finally { G.Main.skipStep = step0; }
  const o = finish(); R = null;
  if (o.erros) bad = true;
  console.log(linha(o));
  if (file) { fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(file, JSON.stringify(o)); }
}
process.exit(bad ? 1 : 0);

// ------------------------------ the sums ------------------------------
function linha(o) {
  const py = o.pessoasAno / 1000; const c = o.crimes;
  return `semente ${o.seed}, ano ${o.anos}: gente ${o.gente} (adultos ${o.adultos}) | nascimentos ${o.nasc} | casais novos ${o.casaisN} (${Object.entries(o.casais).map(([k, n]) => k + ' ' + n).join(', ')}) | viúvos que casam ${o.viuvosCasam} | furtos ${c.furto || 0}, agressões ${c.agressao || 0}, homicídios ${c.homicidio || 0}, presos ${o.presos} (por mil pessoas-ano ${((c.furto || 0) / py).toFixed(1)} / ${((c.agressao || 0) / py).toFixed(2)} / ${((c.homicidio || 0) / py).toFixed(2)} / ${(o.presos / py).toFixed(1)}) | órfãos ${o.orfaos} de ${o.criancas} | laços ${o.lacosMedia.toFixed(1)} (p90 ${o.lacosP90}) | save ${(o.save / 1e6).toFixed(2)} MB, ${o.savePessoa} B por pessoa | um ano ${Math.round(o.msAno.reduce((a, b) => a + b, 0) / o.msAno.length)} ms | o mundo ${o.fp}` + (o.erros ? ' | ERROS ' + JSON.stringify(o.erros).slice(0, 300) : '');
}
function soma(dir, dir0) {
  const rx = process.argv[5] === 'pronto' ? /^pronto-.*\.json$/ : /^semente-\d+\.json$/;
  const read = d => fs.readdirSync(d).filter(f => rx.test(f)).map(f => JSON.parse(fs.readFileSync(path.join(d, f), 'utf8'))).sort((a, b) => a.seed - b.seed);
  const A = read(dir), B = dir0 ? read(dir0) : null;
  const both = B ? A.filter(a => B.some(b => b.seed === a.seed)).map(a => a.seed) : A.map(a => a.seed);
  const pick = L => L.filter(o => both.includes(o.seed));
  if (!A.length) { console.log('nenhum mundo medido em ' + dir); return; }
  const tot = L => {
    const t = { n: L.length, gente: 0, adultos: 0, nasc: 0, casaisN: 0, viuvosCasam: 0, idade1: [], mortes: {}, crimes: {}, presos: 0, politica: {}, pessoasAno: 0, orfaos: 0, criados: 0, boatos: 0, boatosN: 0, criancas: 0, lacos: 0, amigos: 0, inimigos: 0, marcas: 0, save: 0, savePessoa: 0, msAno: 0, piramide: [0, 0, 0, 0, 0, 0], coups: 0, revolutions: 0, govChanges: 0, casais: {}, solteiros3062: 0, adultos3062: 0, pov: {}, gov: 0, cru: 0, agg: 0, furtoCond: {}, agrCond: {} };
    for (const o of L) {
      for (const k of ['gente', 'adultos', 'nasc', 'casaisN', 'viuvosCasam', 'presos', 'pessoasAno', 'orfaos', 'criados', 'boatos', 'boatosN', 'povoAnos', 'criancas', 'amigos', 'inimigos', 'marcas', 'save', 'savePessoa', 'coups', 'revolutions', 'govChanges', 'solteiros3062', 'adultos3062', 'gov', 'cru', 'agg']) t[k] += o[k] || 0;
      t.lacos += o.lacosMedia * o.gente; t.idade1.push(...o.idade1); t.msAno += o.msAno.reduce((a, b) => a + b, 0) / o.msAno.length;
      for (const k of ['mortes', 'crimes', 'politica', 'casais', 'furtoCond', 'agrCond']) for (const [q, n] of Object.entries(o[k] || {})) add(t[k], q, n);
      o.piramide.forEach((n, i) => { t.piramide[i] += n; });
      for (const [c, p] of Object.entries(o.pov)) {
        const q = t.pov[c] || (t.pov[c] = { pessoasAno: 0, nasc: 0, casais: 0, mortes: {}, crimes: {}, vitimas: {}, presos: 0, furtoCond: {}, expo: {}, agrCond: {}, expoA: {}, amostras: 0, politica: {}, gov: 0, cru: 0, agg: 0, gente: 0, orfaos: 0, lacos: 0, afetoRecebido: 0, afetoN: 0, odiado: 0 });
        for (const k in p) if (typeof p[k] === 'number') q[k] += p[k]; else for (const [z, n] of Object.entries(p[k])) add(q[k], z, n);
      }
    }
    t.idade1.sort((a, b) => a - b);
    return t;
  };
  const q = (arr, f) => (arr.length ? arr[Math.min(arr.length - 1, Math.floor(arr.length * f))] : 0);
  const pct = (a, b) => (b ? ((a - b) / b * 100).toFixed(1) + ' %' : '—');
  const T = tot(pick(A)), T0 = B ? tot(pick(B)) : null;
  const rows = [
    ['gente aos ' + (A[0] ? A[0].anos : 40) + ' anos', t => t.gente], ['adultos', t => t.adultos], ['nascimentos', t => t.nasc], ['casais novos', t => t.casaisN],
    ['idade do primeiro casal (mediana)', t => q(t.idade1, 0.5)], ['  p10', t => q(t.idade1, 0.1)], ['  p90', t => q(t.idade1, 0.9)],
    ['viúvos que casam de novo', t => t.viuvosCasam], ['adultos de 30–61 que nunca tiveram par', t => t.solteiros3062], ['adultos de 30–61', t => t.adultos3062],
    ['pessoas-ano', t => t.pessoasAno],
    ['furtos', t => t.crimes.furto || 0], ['agressões', t => t.crimes.agressao || 0], ['homicídios', t => t.crimes.homicidio || 0], ['presos', t => t.presos],
    ['executados', t => t.mortes.execution || 0], ['furtos por mil pessoas-ano', t => +((t.crimes.furto || 0) / t.pessoasAno * 1000).toFixed(2)],
    ['agressões por mil pessoas-ano', t => +((t.crimes.agressao || 0) / t.pessoasAno * 1000).toFixed(2)], ['homicídios por mil pessoas-ano', t => +((t.crimes.homicidio || 0) / t.pessoasAno * 1000).toFixed(2)],
    ['presos por mil pessoas-ano', t => +(t.presos / t.pessoasAno * 1000).toFixed(2)], ['executados por mil pessoas-ano', t => +((t.mortes.execution || 0) / t.pessoasAno * 1000).toFixed(2)],
    ['revoltas (levantes)', t => t.politica.uprising || 0], ['motins', t => t.politica.riot || 0], ['golpes', t => t.coups], ['revoluções', t => t.revolutions], ['mudanças de governo', t => t.govChanges],
    ['órfãos', t => t.orfaos], ['  criados por alguém (4b)', t => t.criados || 0], ['  sem ninguém', t => t.orfaos - (t.criados || 0)], ['crianças', t => t.criancas],
    ['boatos vivos no fim (soma)', t => t.boatos || 0], ['boatos nascidos (soma)', t => t.boatosN || 0],
    ['revoltas por milhão de pessoas-ano', t => +((t.politica.uprising || 0) / t.pessoasAno * 1e6).toFixed(0)], ['golpes por milhão de pessoas-ano', t => +(t.coups / t.pessoasAno * 1e6).toFixed(0)],
    ['revoltas por mil povo-anos', t => +((t.politica.uprising || 0) / Math.max(1, t.povoAnos || 1) * 1000).toFixed(1)], ['golpes por mil povo-anos', t => +(t.coups / Math.max(1, t.povoAnos || 1) * 1000).toFixed(1)], ['laços por pessoa', t => +(t.lacos / Math.max(1, t.gente)).toFixed(2)], ['amigos (laços de amizade)', t => t.amigos], ['inimigos (laços de ódio)', t => t.inimigos], ['marcas', t => t.marcas],
    ['save por pessoa (B, média dos mundos)', t => Math.round(t.savePessoa / t.n)], ['save (MB, média)', t => +(t.save / t.n / 1e6).toFixed(2)], ['um ano do salto (ms, média)', t => Math.round(t.msAno / t.n)],
    ['crueldade média dos governantes (pe.cru)', t => +(t.cru / Math.max(1, t.gov)).toFixed(3)], ['agressividade média dos governantes (pe.agg)', t => +(t.agg / Math.max(1, t.gov)).toFixed(3)],
  ];
  console.log(`== a soma de ${T.n} mundo(s) (${both.join(', ')})${B ? ` — contra ${dir0}` : ''}`);
  for (const [nm, f] of rows) { const a = f(T); const b = T0 ? f(T0) : null; console.log(`  ${nm}: ${a}${T0 ? `   (antes ${b}; ${pct(a, b)})` : ''}`); }
  console.log('  as mortes por causa: ' + Object.entries(T.mortes).sort((x, y) => y[1] - x[1]).map(([k, n]) => `${k} ${n}${T0 ? ` (antes ${T0.mortes[k] || 0})` : ''}`).join(', '));
  console.log('  os casais por como: ' + Object.entries(T.casais).sort((x, y) => y[1] - x[1]).map(([k, n]) => `${k} ${n}${T0 ? ` (antes ${T0.casais[k] || 0})` : ''}`).join(', '));
  console.log('  a pirâmide (bebês, crianças, 16–29, 30–44, 45–61, 62+): ' + T.piramide.join(' / ') + (T0 ? `   (antes ${T0.piramide.join(' / ')})` : ''));
  console.log('  a condição dos furtos: ' + Object.entries(T.furtoCond).map(([k, n]) => k + ' ' + n).join(', ') + ' | a condição das agressões: ' + Object.entries(T.agrCond).map(([k, n]) => k + ' ' + n).join(', '));
  // ---- by people: the owner's rule measured ----
  console.log('== por povo (o povo de cada pessoa)');
  const pooled = (k, sub) => { let n = 0, e = 0; for (const p of Object.values(T.pov)) { n += sub ? (p[k][sub] || 0) : p[k]; e += p.pessoasAno; } return n / Math.max(1, e); };
  const flags = [];
  for (const [c, p] of Object.entries(T.pov).sort((a, b) => b[1].pessoasAno - a[1].pessoasAno)) {
    if (p.pessoasAno < 200) continue;
    const r = (n) => (n / p.pessoasAno * 1000).toFixed(2);
    const cru = p.gov ? (p.cru / p.gov).toFixed(2) : '—', agg = p.gov ? (p.agg / p.gov).toFixed(2) : '—';
    const af = p.afetoN ? (p.afetoRecebido / p.afetoN).toFixed(1) : '—';
    // the thefts against the time this people's grown ones spent in the condition a theft reads
    const fc = Object.entries(p.furtoCond).filter(([k]) => k !== 'nenhuma').map(([k, n]) => `${k} ${n}/${p.expo[k] || 0}`).join(', ');
    const ac = ['bebado', 'rancor', 'nenhuma'].map(k => `${k} ${(p.agrCond || {})[k] || 0}/${(p.expoA || {})[k] || 0}`).join(', ');
    console.log(`  ${c}: ${Math.round(p.pessoasAno)} pessoas-ano | nascimentos ${p.nasc} (${r(p.nasc)}‰) | furtos ${p.crimes.furto || 0} (${r(p.crimes.furto || 0)}‰), agressões ${p.crimes.agressao || 0}, homicídios ${p.crimes.homicidio || 0}, presos ${p.presos} (${r(p.presos)}‰), executados ${p.mortes.execution || 0} | vítimas de agressão/homicídio ${(p.vitimas.agressao || 0)}/${(p.vitimas.homicidio || 0)} | agressões por condição (agressões/amostras) ${ac} | furtos por condição (furtos/amostras) ${fc || '—'} | governantes-ano ${p.gov}, crueldade ${cru}, agressividade ${agg} | o afeto que recebe ${af} (${p.afetoN} laços; ${p.odiado} de ódio)`);
    // (a people whose rate, in the same condition, stands far above the others': a Poisson count far above what the pooled rate would give)
    // (the blows against the time this people's grown ones spent in the condition a blow reads — drunk, holding a grudge, neither:
    // a people whose towns drink more fights more, and that is the drink, not the people)
    for (const k of ['bebado', 'rancor', 'nenhuma']) {
      let n = 0, e = 0; for (const q of Object.values(T.pov)) { n += (q.agrCond || {})[k] || 0; e += (q.expoA || {})[k] || 0; }
      const ex = e ? n / e * ((p.expoA || {})[k] || 0) : 0, got = (p.agrCond || {})[k] || 0;
      if (got >= 8 && got > 2 * ex && (got - ex) / Math.sqrt(Math.max(1, ex)) > 3) flags.push(`${c}: agressões na condição «${k}» ${got} contra ${ex.toFixed(1)} esperados`);
    }
    for (const k of ['fome', 'rua', 'habito', 'pobreza']) {
      let n = 0, e = 0; for (const q of Object.values(T.pov)) { n += q.furtoCond[k] || 0; e += q.expo[k] || 0; }
      const ex = e ? n / e * (p.expo[k] || 0) : 0, got = p.furtoCond[k] || 0;
      if (got >= 8 && got > 2 * ex && (got - ex) / Math.sqrt(Math.max(1, ex)) > 3) flags.push(`${c}: furtos na condição «${k}» ${got} contra ${ex.toFixed(1)} esperados`);
    }
    if (p.afetoN >= 50 && T.pov && (p.odiado / p.afetoN) > 3 * (Object.values(T.pov).reduce((a, q) => a + q.odiado, 0) / Math.max(1, Object.values(T.pov).reduce((a, q) => a + q.afetoN, 0))) + 0.02) flags.push(`${c}: odiado em ${p.odiado} de ${p.afetoN} laços`);
  }
  console.log(flags.length ? 'POR POVO, FORA DA FAIXA: ' + flags.join(' · ') : 'por povo: nenhum povo fora da faixa');
}
