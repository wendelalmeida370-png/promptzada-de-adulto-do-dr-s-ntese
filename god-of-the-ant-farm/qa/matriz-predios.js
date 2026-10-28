'use strict';
// matriz-predios: a matriz de cobertura por categoria de prédio (os adendos 2 e 11 do pedido do Patch 2, D-089) — feita do
// código e das folhas dos donos (qa/categorias/pN.js; o formato está no comentário do p4.js), nunca à mão. Para cada
// categoria (CATS: os 56 tipos do G.BDEF, cada um numa só), as atividades que as folhas dizem — essenciais ou não, quem as
// faz, o que usam (peças, usos, a tarefa do mundo, o ato do G.Act, o verbo do corpo, os sistemas), o que mudam, quando valem,
// as provas —, conferidas contra o código: as peças e os usos nas plantas de amostra de cada tipo e povo, a tarefa no código
// que a dá, o ato no G.Act.DEFS, o verbo no interact.js, os sistemas no G, as provas no disco e — com --resultados — no
// resultado da regressão. O estado de cada categoria sai daí (não auditada · auditada · parcial · funcional · validada: o
// formato diz quando cada um vale); o gerador nunca o inventa.
// FALHA (sai com 1): um tipo sem categoria ou em duas; uma folha com categoria, peça, uso, ato, verbo, sistema ou prova que
// não existem; uma atividade feita (feito: true) cujo código não está lá; uma folha que afirma um estado acima do calculado.
// O que falta (atividade não feita, essencial sem prova) sai como lacuna, contada.
//   node qa/matriz-predios.js [--resultados <pasta da regressão>] [--sem-plantas] [--categorias] [saída.md]
//   (padrão: qa/MATRIZ-PREDIOS.md; só lê o código — M.load —, nenhum mundo)
const fs = require('fs'), path = require('path');
const M = require('./nodemundo.js');
const G = M.load({}); const In = G.Interiors;
const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2);
const opt = k => { const i = args.indexOf(k); return i >= 0 ? (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true) : null; };
const RES = opt('--resultados'), NOPLAN = !!opt('--sem-plantas'), LIST = !!opt('--categorias');
const OUT = args.filter((a, i) => !a.startsWith('--') && !(i && args[i - 1] === '--resultados'))[0] || path.join(__dirname, 'MATRIZ-PREDIOS.md');

// ------------------------------ the categories ------------------------------
// (by what each building is for in the world; dono: whose sheet speaks for the category first — the others add to it)
const CATS = [
  { id: 'moradia', nome: 'Moradias', dono: 'P1', tipos: ['hut', 'house', 'sobrado', 'insula', 'quarteirao', 'barraco'] },
  { id: 'religiao', nome: 'Religião e memória', dono: 'P1', tipos: ['temple', 'cemetery'] },
  { id: 'armazem', nome: 'Armazéns e celeiros', dono: 'P2', tipos: ['storehouse', 'celeiro', 'armazem'] },
  { id: 'comercio', nome: 'Comércio', dono: 'P2', tipos: ['mercado', 'feira', 'mercado_negro'] },
  { id: 'oficio', nome: 'Ofícios', dono: 'P2', tipos: ['workshop', 'forja', 'tecelagem', 'olaria', 'ourives', 'acougue', 'sericultura', 'salga', 'perolaria'] },
  { id: 'servico', nome: 'Serviços e convívio', dono: 'P2', tipos: ['taverna', 'banhos'] },
  { id: 'campo', nome: 'Campo e criação', dono: 'P2', tipos: ['farm', 'pomar', 'plantacao', 'vinhedo', 'apiario', 'salina', 'horta', 'curral', 'estabulo', 'cercado'] },
  { id: 'extracao', nome: 'Extração e pesca', dono: 'P2', tipos: ['mina', 'doca'] },
  { id: 'governo', nome: 'Governo, justiça e guarda', dono: 'P2', tipos: ['administracao', 'coletoria', 'cadeia', 'quartel', 'torre'] },
  { id: 'palacio', nome: 'Palácios', dono: 'P2', tipos: ['paco', 'palacio', 'grande_palacio', 'palacio_colossal'] },
  { id: 'cultura', nome: 'Cultura e espetáculo', dono: 'P3', tipos: ['teatro', 'biblioteca', 'maravilha', 'monument', 'estatua'] },
  { id: 'cidade', nome: 'Obras abertas da cidade', dono: 'P4', tipos: ['praca', 'well', 'aqueduto', 'campfire', 'ruin'] },
];
const STATES = ['não auditada', 'auditada', 'parcial', 'funcional', 'validada'];
if (LIST) { for (const c of CATS) console.log(`${c.id.padEnd(9)} ${c.nome} (folha: ${c.dono}): ${c.tipos.join(', ')}`); process.exit(0); }
const fails = []; const fail = why => { fails.push(why); };

// ------------------------------ every type in one category ------------------------------
const catOf = new Map();
for (const c of CATS) for (const t of c.tipos) { if (catOf.has(t)) fail(`tipo ${t} em duas categorias (${catOf.get(t)} e ${c.id})`); catOf.set(t, c.id); if (!G.BDEF[t]) fail(`tipo ${t} da categoria ${c.id} não existe no G.BDEF`); }
for (const t of Object.keys(G.BDEF)) if (!catOf.has(t)) fail(`tipo ${t} (${G.BDEF[t].name}) sem categoria`);

// ------------------------------ what the code has ------------------------------
const src = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const JS = fs.readdirSync(path.join(ROOT, 'js')).filter(f => f.endsWith('.js')).map(f => ['js/' + f, src('js/' + f)]);
// (the tasks the world gives: the types its code sets and runs)
const TASKS = new Set(); for (const [, s] of JS) { for (const m of s.matchAll(/type:\s*'([a-zA-Z_]+)'/g)) TASKS.add(m[1]); for (const m of s.matchAll(/case\s+'([a-zA-Z_]+)'/g)) TASKS.add(m[1]); }
// (the body's verbs: the ids of what G.Interact offers — read in its source, which the Node world does not load)
const VERBS = new Set(); for (const m of src('js/interact.js').matchAll(/I\.add\(\{\s*\n?\s*id:\s*'([a-zA-Z_]+)'/g)) VERBS.add(m[1]);
// (the systems: G.X made by some module)
const SYSTEMS = new Set(); for (const [, s] of JS) for (const m of s.matchAll(/G\.([A-Z][A-Za-z0-9]*)\s*=/g)) SYSTEMS.add('G.' + m[1]);
// (the uses of the pieces, at their own size)
const USES = new Map(); for (const k in In.ITEMS) { const D = In.ITEMS[k]; let sp = []; try { sp = D.spots ? D.spots({ w: D.w || 1.2, d: D.d || 0.8, h: D.h || 0.5 }) : []; } catch (e) { sp = []; } for (const s of sp) { if (!USES.has(s.use)) USES.set(s.use, new Set()); USES.get(s.use).add(k); } }
// (the plans of each type that has them: one of each people, the first family its rules allow that is laid out — the pieces
// in them, the uses of their places: of the pieces, the rows of seats, the places with no piece)
const SAMPLE = new Map(); // type → { pieces: Set, uses: Set, fams: n, made: n }
if (!NOPLAN) for (const t of Object.keys(In.TYPES)) {
  const T = In.TYPES[t]; const def = G.BDEF[t]; if (!def) continue; const o = { pieces: new Set(), uses: new Set(), fams: (T.fams || []).length, made: 0, peoples: [] };
  for (const c of Object.keys(In.TRAD)) {
    const rec = { v: 4, f: '', r: 0, t, u: T.use, s: 'S', o: 0, c, e: 3, k: 'ae', cl: 't', fl: 0, d: 3, w: 0, pw: 0, h: [], m: 0, fx: [], dr: {}, hh: 0, nm: 0, vz: 0, ab: 0 };
    let tries = 0;
    for (const f of T.fams || []) {
      const F = In.FAMS[f]; if (!F || (F.can && F.can(rec, T, In.TRAD[c]))) continue; if (++tries > 3) break;
      const p = In.makeFam({ id: 101, type: t, x: 8, y: 8, w: def.w, h: def.h }, Object.assign({}, rec, { f }), f); if (!p.ok) continue;
      o.made++; o.peoples.push(c);
      for (const it of p.items) { o.pieces.add(it.kind); for (const s of it.spots) o.uses.add(s.use); }
      for (const T2 of p.tiers || []) o.uses.add(T2.use || 'assistir');
      for (const M2 of p.marks || []) o.uses.add(M2.use);
      break;
    }
  }
  SAMPLE.set(t, o);
}
// (a proof's outcome in the regression's folder: its own file — qa/x.js, x.txt or x_….txt —, passed with no failure)
const passed = f => {
  if (!RES || RES === true) return null; const base = path.basename(f, '.js'); let files = [];
  try { files = fs.readdirSync(RES).filter(n => n === base + '.txt' || n.startsWith(base + '_')); } catch (e) { return null; }
  if (!files.length) return null; const all = files.map(n => fs.readFileSync(path.join(RES, n), 'utf8')).join('\n');
  return /^PASSOU/m.test(all) && !/^FALHOU/m.test(all);
};

// ------------------------------ the sheets ------------------------------
const DIR = path.join(__dirname, 'categorias'); const sheets = [];
for (const n of (fs.existsSync(DIR) ? fs.readdirSync(DIR) : []).filter(n => /^p\d\.js$/.test(n)).sort()) {
  let s; try { s = require(path.join(DIR, n)); } catch (e) { fail(`folha ${n} não carrega: ${e.message}`); continue; }
  if (!s || !s.dono || !s.categorias) { fail(`folha ${n} sem dono ou sem categorias`); continue; } s.file = n; sheets.push(s);
}
const byCat = new Map(CATS.map(c => [c.id, { cat: c, sheets: [], acts: [], claims: [] }]));
for (const s of sheets) for (const id in s.categorias) {
  const C = byCat.get(id); if (!C) { fail(`folha ${s.file}: categoria ${id} não existe (node qa/matriz-predios.js --categorias)`); continue; }
  const f = s.categorias[id]; C.sheets.push(s.dono);
  if (f.estado) { if (!STATES.includes(f.estado)) fail(`folha ${s.file}, ${id}: estado '${f.estado}' não existe`); else C.claims.push([s.dono, f.estado]); }
  for (const k of ['funcao', 'quem', 'notas']) if (f[k] && !C[k]) C[k] = f[k]; else if (f[k] && k === 'notas') C.notas += ' · ' + f[k];
  C.sistemas = (C.sistemas || []).concat(f.sistemas || []);
  for (const a of f.atividades || []) C.acts.push(Object.assign({ dono: s.dono, folha: s.file }, a));
}
// ------------------------------ each activity against the code ------------------------------
const tick = b => (b ? 'sim' : 'não');
for (const C of byCat.values()) {
  const ids = new Set(); const types = C.cat.tipos;
  for (const sys of C.sistemas || []) if (!SYSTEMS.has(sys)) fail(`${C.cat.id}: o sistema ${sys} não existe no código`);
  for (const a of C.acts) {
    const where = `${C.cat.id}/${a.id || '?'} (${a.folha})`;
    if (!a.id || !a.o) fail(`${where}: atividade sem id ou sem descrição`); if (ids.has(a.id)) fail(`${where}: id repetido na categoria`); ids.add(a.id);
    const ts = a.tipos || types; for (const t of ts) if (!types.includes(t)) fail(`${where}: o tipo ${t} não é desta categoria`);
    const miss = []; // (what the code does not have of what the activity says it uses)
    for (const k of a.pecas || []) { if (!In.ITEMS[k]) { fail(`${where}: a peça ${k} não existe`); miss.push('peça ' + k); continue; } if (!NOPLAN && !ts.some(t => SAMPLE.get(t) && SAMPLE.get(t).pieces.has(k))) miss.push(`peça ${k} nas plantas`); }
    for (const u of a.usos || []) { const inPlans = !NOPLAN && ts.some(t => SAMPLE.get(t) && SAMPLE.get(t).uses.has(u)); if (!USES.has(u) && !inPlans && !In.USE_ST[u]) { fail(`${where}: o uso ${u} não existe (nenhuma peça, fileira ou marca o tem, nem o estado do 3D)`); miss.push('uso ' + u); continue; } if (!NOPLAN && !inPlans) miss.push(`uso ${u} nas plantas`); }
    if (a.tarefa && !TASKS.has(a.tarefa)) miss.push('tarefa ' + a.tarefa);
    if (a.ato) { const [d, act] = String(a.ato).split('/'); const D = G.Act && G.Act.DEFS[d]; if (!D) { fail(`${where}: o G.Act '${d}' não existe`); miss.push('ato ' + a.ato); } else if (act && !(D.acts && D.acts[act])) miss.push('ato ' + a.ato); }
    if (a.corpo && !VERBS.has(a.corpo)) { fail(`${where}: o verbo do corpo '${a.corpo}' não existe no interact.js`); miss.push('verbo ' + a.corpo); }
    for (const p of a.provas || []) if (!fs.existsSync(path.join(ROOT, p))) fail(`${where}: a prova ${p} não existe`);
    a.miss = miss; a.found = !miss.length;
    if (a.feito === true && !a.found) fail(`${where}: a folha diz feita, o código não tem: ${miss.join(', ')}`);
    a.pass = (a.provas || []).map(p => [p, passed(p)]);
  }
  // the state
  const ess = C.acts.filter(a => a.essencial);
  let st = 0; if (C.acts.length) st = 1;
  if (ess.some(a => a.feito === true || a.feito === 'parcial')) st = 2;
  if (ess.length && ess.every(a => a.feito === true && a.found)) st = 3;
  if (st === 3 && ess.every(a => a.pass.length && a.pass.every(([, ok]) => ok === true))) st = 4;
  C.state = st; C.ess = ess;
  for (const [who, cl] of C.claims) if (STATES.indexOf(cl) > st) fail(`${C.cat.id}: a folha de ${who} afirma '${cl}', o gerador acha '${STATES[st]}'`);
}

// ------------------------------ the matrix ------------------------------
const L = [];
L.push('# A matriz por prédio', '', `Gerada por \`node qa/matriz-predios.js\` em ${new Date().toISOString().slice(0, 10)} — do código e das folhas \`qa/categorias/pN.js\` (o formato está no \`p4.js\`); nunca editada à mão.${RES && RES !== true ? ' Resultado da regressão: `' + RES + '`.' : ' Sem resultado de regressão: nenhuma categoria chega a validada.'}`, '');
L.push('| Categoria | Tipos | Estado | Essenciais feitas | Folhas |', '|---|---|---|---|---|');
for (const C of byCat.values()) { const done = C.ess.filter(a => a.feito === true && a.found).length; L.push(`| ${C.cat.nome} | ${C.cat.tipos.length} | **${STATES[C.state]}** | ${done}/${C.ess.length} | ${[...new Set(C.sheets)].join(', ') || '—'} |`); }
L.push('');
for (const C of byCat.values()) {
  L.push(`## ${C.cat.nome} — ${STATES[C.state]}`, '');
  if (C.funcao) L.push(`**Função:** ${C.funcao}${C.quem ? ' · **Quem:** ' + C.quem : ''}`, '');
  if ((C.sistemas || []).length) L.push(`**Sistemas:** ${[...new Set(C.sistemas)].join(', ')}`, '');
  L.push('| Tipo | Planta | Peças nas plantas de amostra | Usos |', '|---|---|---|---|');
  for (const t of C.cat.tipos) { const T = In.TYPES[t]; const S = SAMPLE.get(t); L.push(`| ${t} (${G.BDEF[t] ? G.BDEF[t].name : '?'}) | ${T ? `${(T.fams || []).length} famílias${S ? `, ${S.made} de ${Object.keys(In.TRAD).length} povos armados` : ''}` : 'sem planta'} | ${S ? [...S.pieces].sort().join(', ') : '—'} | ${S ? [...S.uses].sort().join(', ') : '—'} |`); }
  L.push('');
  if (C.acts.length) {
    L.push('| Atividade | Essencial | Quem faz | Feita | No código | Provas |', '|---|---|---|---|---|---|');
    for (const a of C.acts) L.push(`| ${a.o} (\`${a.id}\`) | ${a.essencial ? 'sim' : ''} | ${a.dono} | ${a.feito === true ? 'sim' : a.feito === 'parcial' ? 'parcial' : 'não'} | ${a.found ? 'sim' : 'falta: ' + a.miss.join(', ')} | ${a.pass.map(([p, ok]) => `${p}${ok === true ? ' ✓' : ok === false ? ' ✗' : ''}`).join(', ') || '—'} |`);
    L.push('');
  } else L.push('*Nenhuma folha fala desta categoria ainda.*', '');
  if (C.notas) L.push(`**Notas:** ${C.notas}`, '');
}
const gaps = []; for (const C of byCat.values()) for (const a of C.acts) { if (a.essencial && a.feito !== true) gaps.push(`${C.cat.id}/${a.id}: não feita`); else if (a.essencial && !(a.provas || []).length) gaps.push(`${C.cat.id}/${a.id}: sem prova`); }
L.push('## Lacunas', '', ...(gaps.length ? gaps.map(g => '- ' + g) : ['- nenhuma']), '');
if (fails.length) L.push('## Falhas', '', ...fails.map(f => '- ' + f), '');
fs.writeFileSync(OUT, L.join('\n'));
for (const C of byCat.values()) console.log(`${C.cat.id.padEnd(9)} ${STATES[C.state].padEnd(12)} essenciais ${C.ess.filter(a => a.feito === true && a.found).length}/${C.ess.length}, folhas: ${[...new Set(C.sheets)].join(', ') || '—'}`);
for (const f of fails) console.log('FALHOU | matriz | ' + f);
console.log(`${fails.length ? 'FALHAS: ' + fails.length : 'PASSOU | matriz | ' + CATS.length + ' categorias, ' + Object.keys(G.BDEF).length + ' tipos, ' + sheets.length + ' folhas'}; lacunas ${gaps.length}; escrito ${path.relative(process.cwd(), OUT)}`);
const err = M.erros(); if (Object.keys(err.mod).length || err.console.length) { console.log('FALHOU | matriz | erros de módulo: ' + JSON.stringify(err).slice(0, 300)); process.exit(1); }
process.exit(fails.length ? 1 : 0);
