'use strict';
// matriz: the coverage matrix of the activities (the v37 request, §48) — made from the code, never by hand. For every action
// that matters — what the god's body can do (G.Act.DEFS: casa, negocio, pesca, descarga; their acts and the offers that lead
// to them; the body's own verbs that reach them, G.Interact) and what the world's people do (the steps the activities hand
// them, and the steps elsewhere that call into an activity) —: the object it acts on, the logical interaction (the ledger's
// codes, the next errand), the animation (the gesture of G.Act.ANIM, the act the world sees, the pose the 3D gives it — the
// people's, G.Anim3D.stateOf and the hands' gestures; the body's, Interact.GEST), the audiovisual answer (a sound, a
// particle, a line over the head, a sign, the words to the player), what starts it, what cancels it, the state it ends in.
// The offers depend on the state of the world: they are gathered for real, in the ready worlds «cidade» and «metropole» —
// people at stalls, quays, houses, the water's edge, asking G.Act.offers — and, where the world gives none, by the god's hand:
// a catch landed on a quay, a crate taken up and set down, the stock of a stall bought, a price haggled. The gaps come out
// as gaps, counted:
//   (a) an offer or a step whose animation is not in G.Act.ANIM             — fails (exit 1): an incoherence
//   (b) an act of G.Act.ANIM with no pose in the 3D                          — fails (exit 1): an incoherence
//   (c) a gesture of G.Act.ANIM nobody uses                                  — a gap, listed
//   (d) acts of a definition with no offer and no step of the world's people — a gap, listed
//   (e) an action with no audiovisual answer at all                          — a gap, listed
// Only reads: the worlds it loads are its own, and what the god's hand does in them is never saved.
//   node qa/matriz.js [saida.md]      (default: qa/MATRIZ.md)
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const OUT = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, 'MATRIZ.md');
const T = require(path.join(__dirname, 'visual', 'tres-node.js'));
const { G, M } = T.load();
const A = G.Act, D = G.Depot;
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };

// ------------------------------ reading the code ------------------------------
const src = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const html = src('index.html');
const SCRIPTS = [...html.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map(m => m[1]);
const ACTFILES = SCRIPTS.filter(f => f === 'js/activity.js' || /^js\/act-[a-z]+\.js$/.test(f));
// (the end of a block: from the '{' at i, its matching '}' — strings, templates and comments skipped)
function blockEnd(s, i) {
  let d = 0; const tmpl = [];
  for (let k = i; k < s.length; k++) {
    const c = s[k];
    if (c === '/' && s[k + 1] === '/') { k = s.indexOf('\n', k); if (k < 0) return -1; continue; }
    if (c === '/' && s[k + 1] === '*') { k = s.indexOf('*/', k + 2) + 1; continue; }
    if (c === "'" || c === '"') { for (k++; k < s.length && s[k] !== c; k++) if (s[k] === '\\') k++; continue; }
    if (c === '`') { tmpl.push(d); for (k++; k < s.length; k++) { if (s[k] === '\\') { k++; continue; } if (s[k] === '`') { tmpl.pop(); break; } if (s[k] === '$' && s[k + 1] === '{') { const e = blockEnd(s, k + 1); if (e < 0) return -1; k = e; } } continue; }
    if (c === '{') d++;
    else if (c === '}') { d--; if (d === 0) return k; }
  }
  return -1;
}
const bodyAt = (s, i) => { const a = s.indexOf('{', i); const b = a < 0 ? -1 : blockEnd(s, a); return b < 0 ? '' : s.slice(a, b + 1); };
const fnBody = (s, name) => { const m = new RegExp('function\\s+' + name + '\\s*\\(').exec(s); return m ? bodyAt(s, m.index + m[0].length) : ''; };
// (the expression after a key, to its end at the top level: up to a ',', a ';', or the closing of what holds it)
function exprAt(s, i) { let d = 0; for (let k = i; k < s.length; k++) { const c = s[k]; if (c === "'" || c === '"') { for (k++; k < s.length && s[k] !== c; k++) if (s[k] === '\\') k++; continue; } if (c === '`') { for (k++; k < s.length && s[k] !== '`'; k++) if (s[k] === '\\') k++; continue; } if ('([{'.includes(c)) d++; else if (')]}'.includes(c)) { if (d === 0) return s.slice(i, k); d--; } else if ((c === ',' || c === ';') && d === 0) return s.slice(i, k); } return s.slice(i); }
const quoted = e => [...e.matchAll(/'([^'\\]*)'/g)].map(m => m[1]);
const words = t => t.replace(/\$\{[^}]*\}/g, '…').replace(/\s+/g, ' ').trim();
// (the texts of an expression: its quoted strings and its templates)
const texts = e => [...e.matchAll(/`([^`]*)`|'([^'\\]*)'/g)].map(m => words(m[1] !== undefined ? m[1] : m[2])).filter(Boolean);
// (the functions of a file, by name — `function x(` and a module's `X.x = function` —: what a step or an act calls is part of
// it; followed through the file, each once)
function fnsOf(s) { const F = new Map(); for (const m of s.matchAll(/function\s+(\w+)\s*\(/g)) F.set(m[1], bodyAt(s, m.index + m[0].length)); for (const m of s.matchAll(/\b([A-Z])\.(\w+)\s*=\s*function\s*\(/g)) F.set(m[1] + '.' + m[2], bodyAt(s, m.index + m[0].length)); return F; }
function deep(code, F, seen) { seen = seen || new Set(); let all = code; for (const m of code.matchAll(/\b([A-Z]\.)?([a-z]\w*)\(/g)) { const k = (m[1] || '') + m[2]; if (seen.has(k) || !F.has(k)) continue; seen.add(k); all += '\n' + deep(F.get(k), F, seen); } return all; }
// what a piece of code does that the matrix reads: the gestures it plays, the acts it shows, its lines, its effects and
// sounds, the signs over heads, the ledger's codes, the errands it hands on, why it stops, its words
function feats(code) {
  const f = { anims: new Set(), acts: new Set(), says: new Set(), fx: new Set(), fx3d: new Set(), sounds: new Set(), emotes: new Set(), codes: new Set(), tasks: new Set(), drops: new Set(), pauses: new Set(), whys: [], msgs: [], holders: new Set(), ends: 0, body: [], hud: 0, deny: 0 };
  for (const m of code.matchAll(/\b(?:AN|A\.ANIM|G\.Act\.ANIM)\.([A-Za-z]\w*)/g)) f.anims.add(m[1]);
  for (const m of code.matchAll(/\bv\.act\s*=\s*/g)) for (const q of quoted(exprAt(code, m.index + m[0].length))) if (q) f.acts.add(q);
  for (const m of code.matchAll(/\b(?:say|F\.say|G\.Falas\.say)\(/g)) { const a = exprAt(code, m.index + m[0].length); const rest = code.slice(m.index + m[0].length + a.length + 1); const k = exprAt(rest, 0); for (const q of quoted(k)) if (/^[a-z_]+$/.test(q)) f.says.add(q); }
  for (const m of code.matchAll(/\bG\.FX\.(\w+)\(/g)) f.fx.add(m[1]);
  for (const m of code.matchAll(/\bG\.FX3D\.(\w+)\(/g)) f.fx3d.add(m[1]);
  for (const m of code.matchAll(/\bG\.Audio(?:\s*&&\s*G\.Audio\.\w+)?\s*&&\s*G\.Audio\.(?:play|at)\(|\bG\.Audio\.(?:play|at)\(/g)) for (const q of quoted(exprAt(code, m.index + m[0].length).split(/,/).slice(0, 3).join(','))) if (/^[a-zA-Z]+$/.test(q)) f.sounds.add(q);
  for (const m of code.matchAll(/\b(?:G\.Vg\.emote|emote)\(\s*\w+\s*,\s*'(\w+)'/g)) f.emotes.add(m[1]);
  // (the codes an expression gives — not the ones it only compares with: `why === 'morte' ? 'caiu' : 'pousou'`)
  for (const m of code.matchAll(/\bcode:\s*|\bconst code = /g)) for (const q of quoted(exprAt(code, m.index + m[0].length).replace(/[=!]==\s*'[^']*'|'[^']*'\s*[=!]==/g, ''))) if (q) f.codes.add(q);
  for (const m of code.matchAll(/(?:setTask|\bgive)\(\s*\w+\s*,\s*\{\s*type:\s*'(\w+)'/g)) f.tasks.add(m[1]);
  for (const m of code.matchAll(/\bdrop\(\s*\w+\s*,\s*\w+\s*,\s*'([^']+)'/g)) f.drops.add(m[1]);
  for (const m of code.matchAll(/\bA\.pause\(\s*\w+\s*,\s*'([^']+)'/g)) f.pauses.add(m[1]);
  for (const m of code.matchAll(/why:\s*(?:'([^']*)'|`([^`]*)`)/g)) { const w = words(m[1] !== undefined ? m[1] : m[2]); if (w && !f.whys.includes(w)) f.whys.push(w); }
  for (const m of code.matchAll(/msg:\s*/g)) for (const w of texts(exprAt(code, m.index + m[0].length))) if (!f.msgs.includes(w)) f.msgs.push(w);
  for (const m of code.matchAll(/'([a-z]):'\s*\+/g)) f.holders.add(m[1]);
  f.ends = (code.match(/\bH\.end\(v\)|\bdone\(v, H\)|\bend\(v\)/g) || []).length;
  // (the body's own: the animation it plays, what the world sees it do meanwhile, the words to the player, a refusal)
  for (const m of code.matchAll(/Avatar\.act\(\{([\s\S]*?)\b(?:op|then|done|reach|keep|cut):/g)) { const a = /anim:\s*(?:'(\w+)'|(\w[\w.[\] |'"]*))/.exec(m[1]); const va = /vact:\s*(?:'(\w+)'|([\w.]+))/.exec(m[1]); f.body.push({ anim: a ? a[1] || a[2].trim() : '', vact: va ? va[1] || va[2] : '' }); }
  f.hud = (code.match(/\bsay\(\s*(?:`|'|r\.msg|res\.msg|r\.why)/g) || []).length; f.deny = (code.match(/\bdeny\b/g) || []).length;
  return f;
}
const merge = (...L) => { const f = feats(''); for (const g of L) for (const k in f) { if (f[k] instanceof Set) for (const x of g[k]) f[k].add(x); else if (Array.isArray(f[k])) { for (const x of g[k]) if (!f[k].includes(x)) f[k].push(x); } else f[k] += g[k]; } return f; };

// the definitions' files: the activity each one defines, the module it keeps (G.Casa, G.Biz, G.Pesca, G.Porto)
const FILE = {};
for (const file of ACTFILES) { const s = src(file); const d = /A\.def\('(\w+)'/.exec(s); const mo = /const \w+ = (G\.[A-Z]\w+) = \{/.exec(s); FILE[file] = { s, def: d ? d[1] : 'comum', mod: mo ? mo[1] : null, F: fnsOf(s) }; }
const MODOF = {}; for (const file in FILE) if (FILE[file].def !== 'comum' && FILE[file].mod) MODOF[FILE[file].mod] = FILE[file].def;
const fileOf = def => Object.keys(FILE).find(f => FILE[f].def === def);

// ------------------------------ the steps of the world's people ------------------------------
// (the errands an activity's file runs — its task machines: `t.type === 'x' … runX(` — and the places that hand them out)
const STEPS = [];
for (const file of ACTFILES) {
  const { s, def } = FILE[file];
  for (const m of s.matchAll(/t\.type === '(\w+)'[^{;]*\)\s*\{\s*(run\w+)\(/g)) { if (STEPS.some(q => q.type === m[1])) continue; const body = fnBody(s, m[2]); STEPS.push({ type: m[1], fn: m[2], file, def, f: feats(deep(body, FILE[file].F, new Set([m[2]]))), givers: [] }); }
}
// (and the steps elsewhere that call into an activity's module: a case of the people's own errands — villagers.js — that
// reaches G.Pesca, G.Biz, G.Porto, G.Casa)
{ const file = 'js/villagers.js', s = src(file);
  for (const m of s.matchAll(/case '(\w+)':\s*(?:case '\w+':\s*)*\{/g)) { const body = bodyAt(s, m.index + m[0].length - 1); const mods = Object.keys(MODOF).filter(mo => body.includes(mo + '.')); if (!mods.length || STEPS.some(q => q.type === m[1])) continue; STEPS.push({ type: m[1], fn: 'case ' + m[1], file, def: MODOF[mods[0]], f: feats(body), givers: [] }); } }
// (a decision of the day an activity takes for a family, with no errand: A.hooks.tick)
for (const file of ACTFILES) { const { s, def, F } = FILE[file]; for (const m of s.matchAll(/A\.hooks\.tick\.push\(function/g)) { const body = bodyAt(s, m.index); STEPS.push({ type: '(decisão)', fn: 'A.hooks.tick', file, def, f: feats(deep(body, F)), givers: [{ by: 'o passo do mundo, uma vez por dia', file }], decision: true }); } }
// who hands each errand out: every `setTask(…, { type: 'x' … })` — or `A.give`, `Vg.give` — in the game's files, by the function it is in (a method's
// shorthand, `name(…) {`, too — never a word of the language)
const KEYW = new Set(['if', 'for', 'while', 'switch', 'catch', 'function', 'return', 'else', 'do', 'with']);
const enclosing = (s, i) => { const h = s.slice(Math.max(0, i - 6000), i); const L = [...h.matchAll(/(?:function\s+(\w+)\s*\(|([\w.]+)\s*=\s*function\s*\(|\n\s{2,6}(\w+)\s*\([^)]*\)\s*\{)/g)].filter(m => !KEYW.has(m[1] || m[2] || m[3])); const m = L[L.length - 1]; return m ? m[1] || m[2] || m[3] : '?'; };
for (const file of SCRIPTS.filter(f => !f.startsWith('js/lib/'))) { const s = src(file); for (const m of s.matchAll(/(?:setTask|\bgive)\(\s*\w+\s*,\s*\{\s*type:\s*'(\w+)'/g)) { const st = STEPS.find(q => q.type === m[1]); if (!st) continue; const by = enclosing(s, m.index); if (!st.givers.some(g => g.by === by && g.file === file)) st.givers.push({ by, file }); } }

// ------------------------------ the body: the definitions' acts, and the verbs that reach them ------------------------------
const ACTS = [];
for (const id of Object.keys(A.DEFS)) {
  const def = A.DEFS[id]; const off = def.offers ? def.offers.toString() : '';
  // (the offers in the code: each object an offers() builds — its act and its gesture)
  const inCode = []; for (const m of off.matchAll(/\{\s*id:\s*'/g)) { const e = blockEnd(off, m.index); if (e < 0) continue; const o = off.slice(m.index, e + 1); const ac = /\bact:\s*'(\w+)'/.exec(o), an = /\banim:\s*'(\w+)'/.exec(o); if (ac) inCode.push({ act: ac[1], anim: an ? an[1] : '' }); }
  const F = (FILE[fileOf(id)] || {}).F || new Map();
  for (const k of Object.keys(def.acts || {})) {
    const a = def.acts[k]; const fs0 = ['can', 'begin', 'run', 'abort'].map(n => (a[n] ? feats(deep(a[n].toString(), F)) : feats('')));
    ACTS.push({ def: id, act: k, deed: a.deed || '', can: fs0[0], begin: fs0[1], run: fs0[2], abort: fs0[3], hasAbort: !!a.abort, hasBegin: !!a.begin, offersInCode: inCode.filter(o => o.act === k), harvested: [] });
  }
  if (!Object.keys(def.acts || {}).length) ACTS.push({ def: id, act: '', none: true, offersInCode: inCode, harvested: [] });
}
// (a call into an activity's module — `G.Pesca.cast(` — is that module's function, read in its own file and followed there)
function viaMods(code) { let all = code; for (const m of code.matchAll(/\b(G\.[A-Z]\w+)\.(\w+)\(/g)) { const file = Object.keys(FILE).find(f => FILE[f].mod === m[1]); if (!file) continue; const lt = /const (\w+) = G\.[A-Z]\w+ = \{/.exec(FILE[file].s); const k = lt ? lt[1] + '.' + m[2] : ''; const F = FILE[file].F; if (F.has(k)) all += '\n' + deep(F.get(k), F, new Set([k])); } return all; }
// the body's verbs (G.Interact) whose code reaches the activities: through their offers, or a module of one of them
const VERBS = [];
{ const s = src('js/interact.js');
  for (const m of s.matchAll(/I\.add\(\{\s*id:\s*'(\w+)'/g)) { const body = bodyAt(s, m.index); const mods = Object.keys(MODOF).filter(mo => body.includes(mo + '.')); const acts = body.includes('G.Act.offers') || body.includes('G.Act.begin');
    if (!mods.length && !acts) continue; VERBS.push({ id: m[1], defs: acts ? ['(as ofertas)'] : mods.map(mo => MODOF[mo]), f: feats(viaMods(body)) }); } }

// ------------------------------ the 3D: the pose of each act ------------------------------
const AN3 = G.Anim3D, P3 = G.People3D, GEST = (G.Interact && G.Interact.GEST) || null;
const STATES = new Set(AN3.STATES);
// (the pose of the world's people for an act: the state the 3D picks for someone standing with it — and, for a gesture held
// while walking, walking; mapped by the 3D itself, or a gesture of the hands — not the stance anyone has who does nothing)
function poseOf(act) {
  const still = AN3.stateOf({ act, carry: null }, 0), held = AN3.stateOf({ act, carry: { n: 1 } }, 0), walk = AN3.stateOf({ act, carry: null }, 1);
  const mapped = still !== 'idle' || held !== 'carry';
  const hands = (P3.LIFT_ACTS && P3.LIFT_ACTS.has(act)) || (P3.PUT_ACTS && P3.PUT_ACTS.has(act));
  return { still, held, walk, mapped, hands: !!hands, ok: mapped || !!hands };
}
const bodyPose = act => (GEST ? GEST[act] || 'interact' : '?');

// ------------------------------ the offers, gathered for real ------------------------------
const HARV = []; // { world, def, act, anim, hands, ok, why, label, how }
const key = o => o.def + '.' + o.act + ':' + (o.anim || '');
function gather(world) {
  M.pronto(world); const S = G.S; const W = G.W;
  const seen = new Map();
  const ask = (v, x, y, how) => { if (!v) return; for (const o of A.offers(v, x, y, 2.5)) { const k = key(o); const h = seen.get(k); if (h) { h.n++; h.hows.add(how); if (o.ok !== false && h.ok === false) Object.assign(h, { ok: true, why: '', label: o.label }); continue; } seen.set(k, { world, def: o.def, act: o.act, anim: o.anim || '', hands: o.hands, ok: o.ok !== false, why: o.why || '', label: o.label || '', hows: new Set([how]), n: 1 }); } return true; };
  const around = (v, x, y, how, r) => { r = r || 1.5; for (let dy = -r; dy <= r + 1e-9; dy += 0.5) for (let dx = -r; dx <= r + 1e-9; dx += 0.5) if (W.inb(x + dx, y + dy)) ask(v, x + dx, y + dy, how); };
  const able = v => v && v.age >= 16 && !v.captive && !v.jail && !v.aboard && G.Possess.can(v).ok;
  const people = [...S.villagers.values()].filter(v => able(v) && !v.inside).sort((a, c) => a.id - c.id);
  const of = set => people.filter(v => v.set === set);
  const perform = (v, pick) => { const L = A.offers(v, v.x, v.y, 2.5).filter(pick); const o = L.find(q => q.ok !== false) || L[0]; return o ? god(() => A.perform(v, o)) : null; };
  const putAt = (v, x, y) => god(() => { G.Vg.endTask(v); v.inside = 0; v.x = x; v.y = y; v.path = null; });
  // (the stalls, in market hours: their owners at the counter — with goods bought at the people's store in the hands, then put
  // out —, someone of another house before it, haggling; where the world has none open — a world of before the stalls —, the
  // god's hand opens one at the market of the biggest town, for one of its people with a house)
  god(() => { S.time = 0.3; });
  if (G.Biz && !G.Biz.all().some(q => q.st === 'on')) {
    const pop = id => [...S.villagers.values()].filter(v => v.set === id).length;
    const mk = [...S.buildings.values()].filter(b => b.type === 'mercado' && b.built).sort((a, c) => pop(c.set) - pop(a.set) || a.id - c.id)[0];
    const v = mk && of(mk.set).find(q => G.Eco.homeOf(q) && !G.Biz.of(q)); if (v) god(() => G.Biz.open(v, mk));
  }
  for (const z of (G.Biz ? G.Biz.all() : []).filter(q => q.st === 'on').sort((a, c) => a.id - c.id).slice(0, 4)) {
    const sp = G.Biz.spots(z); if (!sp) continue; const owner = S.villagers.get(z.owner); if (!able(owner)) continue;
    putAt(owner, sp.seller[0], sp.seller[1]); around(owner, sp.seller[0], sp.seller[1], 'dono na banca', 1);
    const d = G.Village.nearestDropoff(owner.x, owner.y, owner.set);
    if (d && !owner.carry) { const [fx, fy] = G.Village.frontTile(d); putAt(owner, fx, fy); around(owner, fx, fy, 'dono no armazém', 1); const r = perform(owner, o => o.def === 'negocio' && o.act === 'atacado');
      if (r && r.ok) { putAt(owner, sp.seller[0], sp.seller[1]); around(owner, sp.seller[0], sp.seller[1], 'dono com mercadoria nas mãos', 1); perform(owner, o => o.def === 'negocio' && o.act === 'porNaBanca'); around(owner, sp.seller[0], sp.seller[1], 'dono com a banca arrumada', 1); } }
    // (someone at the counter: the merchant's own errand there, as the world gives it)
    { const ab = A.offers(owner, sp.seller[0], sp.seller[1], 2.5).find(o => o.def === 'negocio' && o.act === 'abrir'); god(() => { if (!z.open && ab) A.perform(owner, ab); G.Vg.setTask(owner, { type: 'banca', biz: z.id, pri: 1, st: 1, dur: 60 }); }); }
    const buyer = of(z.set).find(v => v.id !== z.owner && G.Eco.homeOf(v) && !v.carry && !(G.Biz.of(v)));
    if (buyer) { putAt(buyer, sp.buyer[0], sp.buyer[1]); around(buyer, sp.buyer[0], sp.buyer[1], 'comprador diante da banca', 1); for (let k = 0; k < 4; k++) { const r = perform(buyer, o => o.def === 'negocio' && o.act === 'pechinchar'); if (r && r.counter) { around(buyer, sp.buyer[0], sp.buyer[1], 'comprador com contraproposta', 1); break; } } }
  }
  // (the quays: a catch landed by the god's hand where none is being unloaded; a crate taken up, set down at the store's door
  // and on the ground)
  for (const dock of [...S.buildings.values()].filter(b => b.type === 'doca' && b.built).sort((a, c) => a.id - c.id).slice(0, 3)) {
    let op = G.Porto.opAt(dock); if (!op || !(dock.crates || []).some(c => c.op === op.id)) { god(() => G.Porto.landCatch(dock, 'food', 16, 'arenque', '#a8c0d0', 0)); op = G.Porto.opAt(dock); }
    if (!op) continue; const v = of(dock.set).find(q => !q.carry); if (!v) continue;
    const p = G.Fishers && G.Fishers.crateSpot ? god(() => G.Fishers.crateSpot(dock)) : [dock.x + 1, dock.y + 1];
    putAt(v, p[0], p[1]); around(v, p[0], p[1], 'no cais', 1.5);
    const r = perform(v, o => o.def === 'descarga' && o.act === 'pegar'); if (!r || !r.ok) continue;
    around(v, v.x, v.y, 'com a caixa nas mãos', 1); const dest = G.Porto.destOf(op); if (dest) { const [fx, fy] = G.Village.frontTile(dest); around(v, fx, fy, 'com a caixa, na porta do armazém', 1); }
    const r2 = perform(v, o => o.def === 'descarga' && o.act === 'pousar'); if (r2 && r2.ok) around(v, v.x, v.y, 'a caixa no chão', 1);
  }
  // (the houses: a family that needs one, at the people's store where houses are paid)
  if (G.Casa) { const v = people.find(q => G.Casa.need(q)); if (v) { const d = G.Village.nearestDropoff(v.x, v.y, v.set); if (d) { const [fx, fy] = G.Village.frontTile(d); around(v, fx, fy, 'família sem casa, no armazém', 1); } } }
  // (the water's edge: someone beside it — the fishing offers nothing of its own: the body fishes by its hands' verb)
  { const N = G.N; let done = 0; for (const v of people) { if (done >= 3) break; const e = G.Pesca && G.Pesca.edge(v.x, v.y, 3); if (!e) continue; ask(v, v.x, v.y, 'na beira da água'); done++; } }
  for (const h of seen.values()) HARV.push(Object.assign(h, { how: [...h.hows].join(' · ') }));
}
for (const w of ['cidade', 'metropole']) gather(w);
for (const a of ACTS) a.harvested = HARV.filter(h => h.def === a.def && h.act === a.act);

// ------------------------------ the checks ------------------------------
const ANIM = A.ANIM; const ANIMACTS = new Set(Object.values(ANIM).map(g => g.act));
const fail = { a: [], b: [] }, gap = { c: [], d: [], e: [], e2: [] };
// (a) the gesture of every offer — in the code and gathered — and of every step is one of G.Act.ANIM; an act a step shows
// by name is one some gesture of G.Act.ANIM shows
for (const a of ACTS) for (const o of a.offersInCode.concat(a.harvested)) if (!o.anim || !ANIM[o.anim]) fail.a.push(`a oferta ${a.def}.${o.act || a.act} usa o gesto «${o.anim || '(nenhum)'}», que não está em G.Act.ANIM`);
for (const h of HARV) if (!ACTS.some(a => a.def === h.def && a.act === h.act)) fail.a.push(`a oferta colhida ${h.def}.${h.act} não tem ato na definição`);
for (const st of STEPS) { for (const k of st.f.anims) if (!ANIM[k]) fail.a.push(`o passo «${st.type}» (${st.file}) usa o gesto «${k}», que não está em G.Act.ANIM`); for (const k of st.f.acts) if (!ANIMACTS.has(k)) fail.a.push(`o passo «${st.type}» (${st.file}) mostra o ato «${k}», que nenhum gesto de G.Act.ANIM tem`); }
// (b) every act of G.Act.ANIM has a pose in the 3D: for the world's people (and, held while walking, walking), and for the
// body (the state Interact.GEST gives it is one the 3D has)
const POSES = {};
for (const k of Object.keys(ANIM)) {
  const g = ANIM[k]; const p = g.act ? poseOf(g.act) : { still: 'carry', held: 'carry', walk: 'carryWalk', mapped: true, hands: false, ok: true, carry: true };
  POSES[k] = p; if (!g.act) continue;
  if (!p.ok) fail.b.push(`«${g.act}» (${k}): as pessoas do mundo ficam como quem não faz nada (parado ${p.still}, com carga ${p.held})`);
  if (g.dur === 0 && g.hands === 2 && g.pair && p.walk !== 'carryWalk') fail.b.push(`«${g.act}» (${k}): carregando em dupla, andando, a pessoa anda de mãos soltas (${p.walk})`);
  const bp = bodyPose(g.act); if (!STATES.has(bp)) fail.b.push(`«${g.act}» (${k}): o corpo do jogador faria «${bp}», um estado que o 3D não tem`);
}
for (const v of VERBS) for (const b of v.f.body) if (/^\w+$/.test(b.anim) && !STATES.has(b.anim)) fail.b.push(`o verbo «${v.id}» faz «${b.anim}», um estado que o 3D não tem`);
// (c) the gestures nobody uses: no offer and no step plays them (a field that only names one — GEAR's anim — is no use)
const USED = new Map(); const use = (k, by) => { if (!USED.has(k)) USED.set(k, []); if (!USED.get(k).includes(by)) USED.get(k).push(by); };
for (const a of ACTS) for (const o of a.offersInCode.concat(a.harvested)) if (o.anim) use(o.anim, `oferta ${a.def}.${o.act || a.act}`);
for (const st of STEPS) for (const k of st.f.anims) use(k, `passo ${st.type}`);
for (const k of Object.keys(ANIM)) if (!USED.has(k)) gap.c.push(k);
// (d) the acts of a definition with no offer and no step of the world's people (a step that writes the same in the ledger, or
// plays the same gesture, is the same act done by someone of the world)
const npcOf = a => STEPS.filter(st => st.def === a.def && ([...a.run.codes].some(c => st.f.codes.has(c)) || a.offersInCode.some(o => o.anim && st.f.anims.has(o.anim))));
// (a definition with no acts at all — the fishing: the body fishes by its hands' own verb — is told in its row, not a gap here)
for (const a of ACTS) { if (a.none) continue; a.npc = npcOf(a); if (!a.offersInCode.length && !a.harvested.length && !a.npc.length) gap.d.push(`${a.def}.${a.act}`); }
// (e) actions with no audiovisual answer: no sound, no particle, no line, no sign, no words to the player
const av = f => [...f.sounds].map(x => 'som ' + x).concat([...f.fx].map(x => 'partícula ' + x + ' (vista do deus)'), [...f.fx3d].map(x => 'partícula 3D ' + x), [...f.says].map(x => 'fala ' + x + ' (balão, vista do deus)'), [...f.emotes].map(x => 'sinal ' + x));
for (const a of ACTS) { if (a.none) continue; const f = merge(a.can, a.begin, a.run, a.abort); a.av = av(f); a.words = a.run.msgs.length ? 'as palavras ao jogador (' + a.run.msgs.length + ')' : ''; if (!a.av.length && !a.words) gap.e.push(`o ato do corpo ${a.def}.${a.act}`); }
for (const st of STEPS) { st.av = av(st.f); if (!st.av.length) gap.e.push(`o passo «${st.type}» (${st.def}, ${st.file})`); }
// (and the answer only the god's view shows: the lines over the heads — G.Talk — and the god's view's particles — G.FX — are
// drawn there and not in the 3D of the Modo Encarnado: a step whose answer is only these says nothing to the one living a body)
for (const st of STEPS) if (st.av.length && st.av.every(x => /vista do deus/.test(x))) gap.e2.push(`o passo «${st.type}» (${st.def}): ${st.av.join(', ')}`);
for (const v of VERBS) { v.av = av(v.f).concat(v.f.hud ? ['palavras ao jogador'] : [], v.f.deny ? ['som deny e palavras, na recusa'] : []); if (!v.av.length) gap.e.push(`o verbo do corpo «${v.id}»`); }

// ------------------------------ the page ------------------------------
const esc = t => String(t).replace(/\|/g, '\\|').replace(/\n/g, ' ');
const list = (L, n) => { const a = [...L]; return a.length ? a.slice(0, n || 99).map(esc).join(', ') + (a.length > (n || 99) ? ` (+${a.length - (n || 99)})` : '') : '—'; };
const out = [];
out.push('# Matriz de cobertura das atividades');
out.push('');
out.push('Gerada por `node qa/matriz.js` a partir do código (as definições `G.Act.DEFS`, os gestos `G.Act.ANIM`, as tarefas que os passos dão às pessoas, as poses do 3D, os efeitos e sons), com as ofertas colhidas de verdade nos mundos prontos «cidade» e «metrópole». Não se edita à mão: muda o código, roda de novo.');
out.push('');
out.push(`**Incoerências (falham a prova):** (a) oferta ou passo com gesto fora de \`G.Act.ANIM\`: **${fail.a.length}**; (b) ato de \`G.Act.ANIM\` sem pose no 3D: **${fail.b.length}**.`);
out.push('');
out.push(`**Lacunas (listadas, não falham):** (c) gestos que ninguém usa: **${gap.c.length}**; (d) atos sem oferta e sem passo de NPC: **${gap.d.length}**; (e) ações sem retorno audiovisual nenhum: **${gap.e.length}**, e passos cujo retorno só a vista do deus mostra: **${gap.e2.length}**.`);
out.push('');
out.push('Uma lacuna é uma lacuna: o que está aqui sem animação, sem pose ou sem retorno não está pronto.');
out.push('');
out.push('## Ações do corpo (as definições e os verbos que as alcançam)');
out.push('');
out.push('| Ação | Objeto | Interação lógica | Animação (gesto → ato → pose do corpo / das pessoas) | Retorno audiovisual | Início | Cancelamento | Estado final esperado |');
out.push('|---|---|---|---|---|---|---|---|');
const HK = { f: 'armazém do povo', h: 'casa', b: 'prateleira do prédio', z: 'banca', q: 'cais', s: 'porão do navio', v: 'mãos', p: 'bolsa', g: 'chão' };
for (const a of ACTS) {
  if (a.none) { const vb = VERBS.filter(v => v.defs.includes(a.def)).map(v => '«' + v.id + '»'), st = STEPS.filter(q => q.def === a.def).map(q => '«' + q.type + '»'); out.push(`| ${a.def} (nenhum ato) | — | — | — | — | — | — | a definição não tem atos nem ofertas: o corpo, pelo verbo ${vb.join(', ') || '(nenhum)'}; as pessoas, pelo passo ${st.join(', ') || '(nenhum)'} |`); continue; }
  const anims = [...new Set(a.offersInCode.concat(a.harvested).map(o => o.anim).filter(Boolean))];
  const anim = anims.length ? anims.map(k => { const g = ANIM[k]; const p = POSES[k]; return g ? `${k} → ${g.act || '(carregar)'} → corpo ${g.act ? bodyPose(g.act) : 'carry'} / pessoas ${p ? (p.ok ? (p.hands && !p.mapped ? 'gesto das mãos' : p.still) : 'SEM POSE') : '?'}` : `${k} → FORA DE G.Act.ANIM`; }).join('; ') : 'sem oferta';
  const objs = [...new Set([...a.run.holders, ...a.can.holders])].map(k => HK[k] || k);
  const codes = [...a.run.codes]; const start = a.can.whys.length ? 'pode, salvo: ' + a.can.whys.slice(0, 4).join(' · ') : 'sempre';
  const cancel = [a.hasAbort ? 'cortado: desfaz o que o início reservou (abort)' : 'cortado antes do contato: nada acontece', 'na hora do contato o mundo pergunta de novo (can)'].concat(a.run.whys.slice(0, 3)).join(' · ');
  const fin = (codes.length ? 'livro-razão: ' + codes.join(', ') : 'sem lançamento no livro') + (a.run.msgs.length ? ' — «' + a.run.msgs[0] + '»' : '');
  const got = a.harvested.length ? `colhida: ${a.harvested.map(h => h.world + (h.ok ? '' : ' (não pode: ' + h.why + ')')).join(', ')}` : (a.offersInCode.length ? 'oferta no código, não colhida' : 'sem oferta');
  out.push(`| ${a.def}.${a.act}${a.deed ? ' (' + a.deed + ')' : ''} — ${esc(got)} | ${esc(objs.join(', ') || '—')} | ${esc((a.hasBegin ? 'reserva no início; ' : '') + 'feita no contato do gesto' + (a.npc && a.npc.length ? '; o mesmo pelas pessoas: ' + a.npc.map(s => s.type).join(', ') : ''))} | ${esc(anim)} | ${esc(list(a.av, 6) === '—' ? (a.words || '—') : list(a.av, 6) + (a.words ? '; ' + a.words : ''))} | ${esc(start)} | ${esc(cancel)} | ${esc(fin)} |`);
}
for (const v of VERBS) {
  const anims = v.f.body.map(b => `${/GEST/.test(b.anim) ? 'o gesto da oferta, pela tabela Interact.GEST' : b.anim}${b.vact ? ' (o mundo vê ' + (/g\.act/.test(b.vact) ? 'o ato do gesto' : b.vact) + ')' : ''}`);
  out.push(`| verbo «${v.id}» (${v.defs.join(', ')}) | ${esc([...v.f.holders].map(k => HK[k] || k).join(', ') || '—')} | pela porta do mundo (Possess.apply), no contato do gesto | ${esc(anims.join('; ') || '—')} | ${esc(list(v.av, 6))} | ${esc(v.f.whys.slice(0, 3).join(' · ') || '—')} | cortado antes do contato: nada acontece | ${esc(v.f.codes.size ? 'livro-razão: ' + [...v.f.codes].join(', ') : 'o que a oferta faz (as linhas acima)')} |`);
}
out.push('');
out.push('## Passos das pessoas do mundo');
out.push('');
out.push('| Passo (tarefa) | Atividade | Objeto | Interação lógica | Animação (gesto → ato → pose) | Retorno audiovisual | Início (quem dá) | Cancelamento | Estado final esperado |');
out.push('|---|---|---|---|---|---|---|---|---|');
for (const st of STEPS) {
  const anims = [...st.f.anims].map(k => { const g = ANIM[k]; const p = POSES[k]; return g ? `${k} → ${g.act || '(carregar)'} → ${p ? (p.ok ? (p.hands && !p.mapped ? 'gesto das mãos' : p.still) : 'SEM POSE') : '?'}` : `${k} → FORA DE G.Act.ANIM`; }).concat([...st.f.acts].filter(k => ![...st.f.anims].some(a => ANIM[a] && ANIM[a].act === k)).map(k => { const p = poseOf(k); return `«${k}» → ${p.ok ? p.still : 'SEM POSE'}`; }));
  const cancel = [...st.f.drops].map(x => 'larga: ' + x).concat([...st.f.pauses].map(x => 'para a operação: ' + x), st.f.ends ? [`${st.f.ends} saídas (fim da tarefa)`] : []);
  const fin = [st.f.codes.size ? 'livro-razão: ' + [...st.f.codes].join(', ') : '', st.f.tasks.size ? 'depois: ' + [...st.f.tasks].join(', ') : ''].filter(Boolean).join('; ') || '—';
  out.push(`| ${st.type} (${st.fn}, ${st.file}) | ${st.def} | ${esc([...st.f.holders].map(k => HK[k] || k).join(', ') || '—')} | ${esc(st.decision ? 'decisão, sem tarefa nem corpo que se veja' : 'a tarefa da pessoa, passo a passo')} | ${esc(anims.join('; ') || (st.decision ? 'nenhuma: não há gesto' : 'nenhuma'))} | ${esc(list(st.av, 6))} | ${esc(st.givers.map(g => g.by + ' (' + g.file.replace('js/', '') + ')').join(', ') || '—')} | ${esc(cancel.join(' · ') || '—')} | ${esc(fin)} |`);
}
out.push('');
out.push('## Os gestos (G.Act.ANIM) e as poses do 3D');
out.push('');
out.push('| Gesto | Ato | Duração (s do mundo) | Contato | Mãos | Pessoas paradas | Com carga | Andando | Gesto das mãos | Corpo do jogador | Quem usa |');
out.push('|---|---|---|---|---|---|---|---|---|---|---|');
for (const k of Object.keys(ANIM)) { const g = ANIM[k], p = POSES[k]; out.push(`| ${k} | ${g.act || '(carregar)'} | ${g.dur} | ${g.contact} | ${g.hands}${g.heavy ? ' (pesado)' : ''}${g.pair ? ' (em dupla)' : ''} | ${p.ok ? p.still : 'SEM POSE (' + p.still + ')'} | ${p.held} | ${p.walk} | ${p.hands ? 'sim' : g.pair && Array.isArray(P3.pairs) ? 'a caixa de quem conduz, entre os dois (G.Act.pair → People3D)' : '—'} | ${g.act ? bodyPose(g.act) : 'carry'} | ${esc(list(USED.get(k) || [], 4))} |`); }
out.push('');
out.push('## As ofertas colhidas nos mundos prontos');
out.push('');
out.push('| Mundo | Oferta | Gesto | Mãos | Vezes | Onde | Pode? | Exemplo |');
out.push('|---|---|---|---|---|---|---|---|');
for (const h of HARV.slice().sort((a, c) => (a.world + key(a) < c.world + key(c) ? -1 : 1))) out.push(`| ${h.world} | ${h.def}.${h.act} | ${h.anim || '—'} | ${h.hands === undefined ? '—' : h.hands} | ${h.n} | ${esc(h.how)} | ${h.ok ? 'sim' : 'não: ' + esc(h.why)} | ${esc(h.label)} |`);
out.push('');
out.push('## Incoerências e lacunas');
out.push('');
const sect = (t, L) => { out.push(`### ${t} — ${L.length}`); out.push(''); if (!L.length) out.push('Nenhuma.'); else for (const x of L) out.push('- ' + x); out.push(''); };
sect('(a) Oferta ou passo com gesto fora de G.Act.ANIM (falha)', fail.a);
sect('(b) Ato de G.Act.ANIM sem pose no 3D (falha)', fail.b);
sect('(c) Gestos de G.Act.ANIM que ninguém usa', gap.c.map(k => `${k} (${ANIM[k].act || 'carregar'}, ${ANIM[k].dur} s)`));
sect('(d) Atos de uma definição sem oferta e sem passo de NPC', gap.d);
sect('(e) Ações sem retorno audiovisual nenhum', gap.e);
sect('(e, no 3D) Passos cujo retorno só a vista do deus mostra — as falas (G.Talk) e as partículas (G.FX) não são desenhadas no 3D do Modo Encarnado', gap.e2);
const text = out.join('\n') + '\n';
fs.writeFileSync(OUT, text);
const okAll = !fail.a.length && !fail.b.length && !Object.keys(G.modErr).length;
console.log(`${fail.a.length ? 'FALHOU' : 'PASSOU'} | matriz (a) toda oferta e todo passo com gesto de G.Act.ANIM | ${fail.a.length} fora${fail.a.length ? ': ' + fail.a.slice(0, 4).join(' · ') : ''}`);
console.log(`${fail.b.length ? 'FALHOU' : 'PASSOU'} | matriz (b) todo ato de G.Act.ANIM com pose no 3D | ${fail.b.length} sem pose${fail.b.length ? ': ' + fail.b.slice(0, 6).join(' · ') : ''}`);
console.log(`PASSOU | matriz lacunas (c) ${gap.c.length} gestos sem uso · (d) ${gap.d.length} atos sem oferta nem passo · (e) ${gap.e.length} ações sem retorno, ${gap.e2.length} passos com retorno só na vista do deus | ${ACTS.length} atos do corpo, ${VERBS.length} verbos, ${STEPS.length} passos, ${HARV.length} ofertas colhidas; escrita em ${path.relative(process.cwd(), OUT) || OUT}`);
console.log(`${Object.keys(G.modErr).length ? 'FALHOU' : 'PASSOU'} | matriz módulos | ${JSON.stringify(G.modErr)}`);
process.exit(okAll ? 0 : 1);
