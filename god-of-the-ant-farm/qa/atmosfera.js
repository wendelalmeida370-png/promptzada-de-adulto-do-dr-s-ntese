// atmosfera: the smoke, the lit windows, the things about a house and the wear of its walls follow what really happens
// (Bairros Vivos, BV-4 — D-163 to D-165) — in Node, the simulation of qa/nodemundo.js with three.js and the 3D's own files:
//   node qa/atmosfera.js [mundo]      (default: the ready world «metropole»;  ONLY=a1,a3 runs some)
// What is asked is the game's own: G.Atmos (the one source), and what each view makes of it — FX3D.smokeRate / doorLit,
// Build3D's panes, Props3D's pieces, Render.smokeOf / windowLit. The cause is reckoned here again, from the world's records
// (the operations, the people inside), never from G.Atmos: the two must agree.
//   a1  a fumaça       a whole day lived, looked at every few seconds: every roof smokes with a fire under it — a batch
//                      burning, the forge hot, the furnace, the tavern open, someone at the house's fire — and only then,
//                      in the 3D and in the god's view; forges, kilns, taverns, baths and houses seen both ways
//   a2  o fogo apaga   the cause taken away by hand and given back: the kiln's heat, the smith's waking, the tavern's
//                      hours, the furnace, the cook — the smoke goes and comes with it
//   a3  a janela       at night, a window is lit only with someone awake inside: the world's count, the 3D's panes (each
//                      pane's own mark), the light out of the door, the god's windows; a house all asleep is dark, one
//                      woken lights it, asleep again it goes dark; the pane's shader reads the mark
//   a4  os objetos     what lies about every house is what it has: firewood only at a woodcutter's, a cask only where
//                      there is drink, a bench and washing only where someone lives, the things of a trade only where it
//                      lives; an empty house has nothing; pots only where they dry, casks only with drink to pour, nets
//                      only with fishing boats, rope only on a quay that works; taken away by hand, gone — and the
//                      picture knows it must be made again. The houses and the tavern as the game draws them, from their
//                      plans (D-186: no hand on the drawing), and then from their kit; where each thing may lie is
//                      qa/quintal.js
//   a5  o desgaste     the years, the water and the care: older shows older, by the water damper, an empty house and a
//                      quarter in decline more worn, a rich one kept; the 3D's picture changes with it
//   a6  só desenha     all of it asked for every building, the pictures made: the world the same to the last number
//   a7  o save         saved and loaded in the middle: the same answers for every building; the care, that reads the town's
//                      look of the day, back once every town has its look again (a step a town)
//   a8  o Fogo Novo    the night every flame of a town is out: no smoke, no lit window, the campfire cold
//   a9  o verificador  the rules of qa/atmos-inv.js looked at along a lived evening: clean — and each of them accuses a lie
//                      told by the test's hand (smoke with no fire, a window lit on nobody, things about an empty house,
//                      an answer kept from an instant before)
const fs = require('fs'), path = require('path');
const M = require('./nodemundo.js');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const all = [...html.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map(m => m[1]);
global.atob = global.atob || (s => Buffer.from(s, 'base64').toString('binary'));
global.performance = global.performance || { now: () => Date.now() };
const G = M.load({ qa: true, extra: all.slice(all.indexOf('js/lib/three.min.js')).concat(['qa/atmos-inv.js']) });
global.THREE = window.THREE;
G.Realm.shapes(); G.Build3D.init(THREE, G.Realm);
const scene = new THREE.Scene(); const realm = Object.assign(Object.create(G.Realm), { scene: () => scene, renderer: () => null, camera: () => null });
G.People3D.init(THREE, realm);
const At = G.Atmos, B3 = G.Build3D, F3 = G.FX3D, PR = G.Props3D, R = G.Render, A = G.Act, U = G.Urban;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | atmosfera ${name} | ${info}`); if (!c) fails.push(name); };
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean); const run = k => !ONLY.length || ONLY.includes(k);
M.pronto(process.argv[2] || 'metropole');
let S = G.S; const EPS = 1e-6;
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const plain = o => JSON.stringify(o, (k, v) => (v instanceof Map ? [...v] : v instanceof Set ? [...v] : ArrayBuffer.isView(v) ? v.length : v));
const world = () => ({ canon: hash(JSON.stringify(QA.canon())), save: hash(G.Save.serialize()), people: hash(plain([...S.villagers.values()])), builds: hash(plain([...S.buildings.values()])), acts: hash(plain(S.acts || [])), rng: plain(S.rng) });
const same = (a, b) => Object.keys(a).filter(k => a[k] !== b[k]);
const housing = b => !!(G.BDEF[b.type] && G.BDEF[b.type].housing);
const built = () => [...S.buildings.values()].filter(b => b.built && b.type !== 'ruin').sort((a, b) => a.id - b.id);
const tag = b => `${b.type}#${b.id}`;
const flush = () => At.flush();
// (what lies about a building, whatever order the world lists its people in)
const aboutKey = a => JSON.stringify(Object.assign({}, a, { roles: a.roles.slice().sort() }));

// ------------------------------ the cause, reckoned here from the world's own records ------------------------------
const insiders = b => [...S.villagers.values()].filter(v => v.inside === b.id);
const awakeIn = b => insiders(b).filter(v => !v.sleeping);
const opsAt = (b, def) => A.all().filter(o => o.def === def && A.live(o) && o.at === b.id);
const stageOf = op => { const t = G.Oficio.DEFS[op.data.of]; const Rx = t && t.rx[op.data.p]; return Rx ? [Rx.st[op.data.s], Rx.st[op.data.s - 1]] : [null, null]; };
function cause(b) {
  if (!b.built || b.type === 'ruin' || (G.Fest && G.Fest.darkB(b))) return null;
  if (b.type === 'campfire') return 'fogueira';
  if (b.type === 'banhos') return opsAt(b, 'termas').some(o => o.data.calor > EPS) ? 'fornalha' : null;
  if (b.type === 'taverna') return opsAt(b, 'taverna').some(o => o.st === 'on') && G.Taverna.inHours(b) ? 'taverna' : null;
  let forge = false;
  for (const op of opsAt(b, 'oficio')) { const [s, p] = stageOf(op); if (!s) continue; if (s.kind === 'fogo' && op.data.calor > EPS) return 'fornada'; if (s.kind === 'mao' && s.kiln && op.st === 'on' && p && p.kind === 'fogo' && awakeIn(b).length) forge = true; }
  if (forge) return 'forja';
  if (housing(b)) { const L = awakeIn(b).filter(v => v.task && v.task.type === 'lar' && v.task.st >= 2 && v.task.home === b.id); if (L.some(v => v.task.what === 'cozinhar')) return 'cozinha'; if (L.some(v => v.task.what !== 'acamado')) return 'lareira'; }
  return null;
}
const litBy = b => b.built && b.type !== 'ruin' && awakeIn(b).length > 0 && !(G.Fest && G.Fest.darkB(b));
const SMOKE2D = { house: 1, workshop: 1, sobrado: 1, insula: 1, quarteirao: 1, banhos: 1, hut: 1, forja: 1, olaria: 1, taverna: 1, ourives: 1, barraco: 1 };
// (one look at every building: what each view says against the cause; the kinds seen burning and cold)
const seenHot = {}, seenCold = {}; let looks = 0, checked = 0; const wrong = [];
function lookAll() {
  looks++; flush();
  for (const b of built()) {
    checked++; const c = cause(b), f = At.fire(b), r3 = F3.smokeRate(b, 0.5, false), r2 = R.smokeOf(b);
    const kind = housing(b) ? 'casa' : b.type;
    if (c) seenHot[kind] = (seenHot[kind] || 0) + 1; else seenCold[kind] = (seenCold[kind] || 0) + 1;
    if ((f ? f.why : null) !== c) { if (wrong.length < 6) wrong.push(`${tag(b)}: a causa é ${c || 'nenhuma'}, G.Atmos diz ${f ? f.why : 'nada'}`); continue; }
    if ((r3 > 0) !== (!!c && b.type !== 'campfire')) { if (wrong.length < 6) wrong.push(`${tag(b)}: ${c || 'sem fogo'}, mas o 3D solta ${r3} baforadas por segundo`); continue; }
    if (!!r2 !== (!!c && !!SMOKE2D[b.type])) { if (wrong.length < 6) wrong.push(`${tag(b)}: ${c || 'sem fogo'}, mas a vista do deus ${r2 ? 'fuma' : 'não fuma'}`); continue; }
    if (At.lit(b) !== litBy(b) || R.windowLit(b) !== litBy(b) || (F3.doorLit(b) > 0) !== (litBy(b) && lamp(b))) { if (wrong.length < 6) wrong.push(`${tag(b)}: ${awakeIn(b).length} acordado(s) dentro, mas janela ${At.lit(b)}, a do deus ${R.windowLit(b)}, a porta ${F3.doorLit(b)}`); }
  }
}
// (the kinds whose doorway the 3D lights at all — its own table: a type it never lights says nothing)
const LAMP = {}; const lamp = b => { if (LAMP[b.type] === undefined) { const l = At.lit; At.lit = () => true; try { LAMP[b.type] = F3.doorLit(b) > 0; } finally { At.lit = l; } } return LAMP[b.type]; };

// ------------------------------ a1: a day looked at ------------------------------
if (run('a1')) {
  const d0 = S.day; let steps = 0;
  while (S.day - d0 < 1 && steps < 60) { lookAll(); M.viver(4); steps++; }
  lookAll();
  const need = ['casa', 'taverna'].concat(built().some(b => b.type === 'banhos') ? ['banhos'] : []).concat(built().some(b => b.type === 'forja') ? ['forja'] : []);
  const both = need.filter(k => seenHot[k] && seenCold[k]);
  ok('a1 a fumaça: um dia inteiro olhado — todo telhado fuma com fogo de verdade embaixo e só então, no 3D e na vista do deus; a janela acesa só com gente acordada dentro', !wrong.length && both.length === need.length && looks >= 40,
    `${looks} olhadas, ${checked} prédios conferidos, ${wrong.length} em desacordo${wrong.length ? ': ' + wrong.slice(0, 3).join(' · ') : ''} · com fogo ${JSON.stringify(seenHot)} · sem fogo ${JSON.stringify(Object.fromEntries(need.concat(['olaria', 'ourives', 'workshop', 'tecelagem']).filter(k => seenCold[k]).map(k => [k, seenCold[k]])))}${both.length < need.length ? ' · não vistos dos dois jeitos: ' + need.filter(k => !both.includes(k)).join(', ') : ''}`);
}

// ------------------------------ a2: the cause taken away and given back ------------------------------
if (run('a2')) {
  const got = []; const bad = [];
  const three = b => { flush(); return [At.fire(b) ? At.fire(b).why : null, F3.smokeRate(b, 0.5, false) > 0, !!R.smokeOf(b)]; };
  const pair = (name, b, off, on) => { const a0 = three(b); off(); const a1 = three(b); on(); const a2 = three(b); const good = a0[0] && a0[1] && (a0[2] || !SMOKE2D[b.type]) && !a1[0] && !a1[1] && !a1[2] && a2[0] === a0[0] && a2[1]; got.push(`${name} ${tag(b)}: ${a0[0]} → ${a1[0] || 'nada'} → ${a2[0]}`); if (!good) bad.push(`${name} ${tag(b)}: ${JSON.stringify(a0)} → ${JSON.stringify(a1)} → ${JSON.stringify(a2)}`); };
  // (live on until each cause is there to take — four minutes of the world at the most, two for the forge; the kiln and the
  // furnace of the baths, up to three days: a town at war, or with no wood, has days with no furnace lit in any of its baths —
  // measured in the metropole, 11 to 14 lit of 20 baths-days —, and the question here is the smoke, not the stoker. T-700)
  const wait = (find, max) => { for (let k = 0; k < (max || 60); k++) { flush(); const x = find(); if (x) return x; M.viver(4); } return null; };
  // a kiln burning: its heat
  const kiln = wait(() => { for (const b of built()) for (const op of opsAt(b, 'oficio')) { const [s] = stageOf(op); if (s && s.kind === 'fogo' && op.data.calor > 2) return [b, op]; } return null; }, 180);
  if (kiln) { const [b, op] = kiln; const c = op.data.calor; pair('o forno', b, () => { op.data.calor = 0; }, () => { op.data.calor = c; }); } else bad.push('nenhuma fornada no fogo em três dias');
  // the forge hot with the smith at it: the smith asleep
  const forge = wait(() => { for (const b of built()) if (cause(b) === 'forja') return b; return null; }, 30);
  if (forge) { const L = awakeIn(forge); pair('a forja', forge, () => { for (const v of L) v.sleeping = true; }, () => { for (const v of L) v.sleeping = false; }); } else got.push('a forja: nenhuma quente com o ferreiro nela nesta espera (T-700)');
  // the tavern open: shut by the hour
  const tav = wait(() => built().find(b => b.type === 'taverna' && cause(b)));
  if (tav) { const t = S.time; pair('a taverna', tav, () => { S.time = 0.3; }, () => { S.time = t; }); } else bad.push('nenhuma taverna aberta em um dia');
  // the furnace of the baths
  const bath = wait(() => { for (const b of built()) if (b.type === 'banhos') { const op = opsAt(b, 'termas').find(o => o.data.calor > 2); if (op) return [b, op]; } return null; }, 180);
  if (bath) { const [b, op] = bath; const c = op.data.calor; pair('a fornalha', b, () => { op.data.calor = 0; }, () => { op.data.calor = c; }); } else if (built().some(b => b.type === 'banhos')) bad.push('nenhuma fornalha acesa em três dias'); else got.push('sem banhos neste mundo');
  // someone at the house's fire: asleep
  const home = wait(() => built().find(b => housing(b) && cause(b)));
  if (home) { const L = awakeIn(home); pair('o fogo da casa', home, () => { for (const v of L) v.sleeping = true; }, () => { for (const v of L) v.sleeping = false; }); } else bad.push('ninguém junto ao fogo de casa em um dia');
  // a building at rest: a forge, a pottery, a workshop with no batch at the fire does not smoke, whatever the hour
  flush(); const rest = built().filter(b => (b.type === 'forja' || b.type === 'olaria' || b.type === 'workshop' || b.type === 'ourives' || b.type === 'tecelagem' || b.type === 'acougue') && !cause(b));
  const smoking = rest.filter(b => At.fire(b) || F3.smokeRate(b, 1, true) > 0 || R.smokeOf(b));
  ok('a2 o fogo apaga: tirada a causa à mão — o calor do forno, o ferreiro acordado, a hora da taverna, a fornalha, quem está junto ao fogo — a fumaça para; devolvida, volta; prédio parado não fuma', !bad.length && got.length >= 4 && !smoking.length,
    `${got.join(' · ')} · ${rest.length} oficinas paradas, ${smoking.length} fumando${bad.length ? ' · ' + bad.join(' · ') : ''}`);
}

// ------------------------------ a3: the window ------------------------------
if (run('a3')) {
  // into the night
  let k = 0; while (!(S.time > 0.76 && S.time < 0.86) && k++ < 80) M.viver(4);
  flush(); const night = G.isNight();
  // every building of the world: lit by who is awake inside
  let lit = 0, dark = 0, off = 0; for (const b of built()) { const w = litBy(b); if (At.lit(b) !== w || R.windowLit(b) !== w) off++; if (w) lit++; else dark++; }
  // the panes of a town's near pictures: each building's panes carry its own mark
  const set = [...S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0]; const C = 16; const geos = [];
  for (let cy = Math.floor((set.cy - 20) / C); cy <= Math.floor((set.cy + 20) / C); cy++) for (let cx = Math.floor((set.cx - 20) / C); cx <= Math.floor((set.cx + 20) / C); cx++) { const g = B3.nearGeo(cx * C, cy * C, C); if (g.glass) geos.push(g.glass); for (const q of ['solid', 'plants', 'water']) if (g[q]) g[q].dispose(); }
  const paneOf = id => { for (const g of geos) { const P = g.userData.panes; for (let i = 0; i < P.length; i += 3) if (P[i] === id) { const a = g.attributes.aDark.array; let lo = 2, hi = -1; for (let q = P[i + 1]; q < P[i + 2]; q++) { lo = Math.min(lo, a[q]); hi = Math.max(hi, a[q]); } return [lo, hi, P[i + 2] - P[i + 1]]; } } return null; };
  // (a lit pane among them, so that the count is of both marks: on a night when every glazed house of the pictures sleeps — the
  // town at a feast in its square, 110 of them, in the life the second round of the full house lives: 2 buildings of the world
  // with someone awake inside, none of them glazed — the proof's hand wakes one in one of them for the count, and puts them
  // back to sleep after it. T-839)
  const glazedLit = () => built().some(b => paneOf(b.id) && litBy(b)); let woke = null;
  if (!glazedLit()) { const h = built().find(b => housing(b) && paneOf(b.id) && insiders(b).length >= 1 && !awakeIn(b).length); if (h) { woke = insiders(h)[0]; woke.sleeping = false; flush(); } }
  B3.paneStep(); let panes = 0, pbad = 0, plit = 0; const pex = [];
  for (const b of built()) { const p = paneOf(b.id); if (!p) continue; panes++; const want = litBy(b) ? 0 : 1; if (!want) plit++; if (p[0] !== want || p[1] !== want) { pbad++; if (pex.length < 2) pex.push(`${tag(b)}: ${awakeIn(b).length} acordado(s), vidros ${p[0]}..${p[1]}`); } }
  if (woke) { woke.sleeping = true; flush(); B3.paneStep(); }
  // a house with everyone asleep: dark; one woken: lit; asleep again: dark
  const sleepers = built().find(b => housing(b) && paneOf(b.id) && insiders(b).length >= 2 && !awakeIn(b).length);
  let turn = 'nenhuma casa com vidros e todos dormindo';
  let tOK = false;
  if (sleepers) {
    const v = insiders(sleepers)[0]; const st = () => { flush(); B3.paneStep(); return [At.lit(sleepers), paneOf(sleepers.id)[1], F3.doorLit(sleepers) > 0, R.windowLit(sleepers)]; };
    const s0 = st(); v.sleeping = false; const s1 = st(); v.sleeping = true; const s2 = st();
    tOK = !s0[0] && s0[1] === 1 && !s0[2] && !s0[3] && s1[0] && s1[1] === 0 && s1[2] && s1[3] && !s2[0] && s2[1] === 1 && !s2[2] && !s2[3];
    turn = `${tag(sleepers)} com ${insiders(sleepers).length} dormindo: escura (vidro ${s0[1]}) → ${v.name} acorda: acesa (vidro ${s1[1]}, porta ${s1[2]}, deus ${s1[3]}) → dorme: escura (vidro ${s2[1]})`;
  }
  // nobody inside: dark (a house empty at this hour, a workshop shut)
  const empty = built().filter(b => !insiders(b).length && (housing(b) || lamp(b))); const emptyLit = empty.filter(b => At.lit(b) || F3.doorLit(b) > 0 || R.windowLit(b) || (paneOf(b.id) && paneOf(b.id)[0] === 0));
  // the pane's shader reads the mark: the emission of a pane times (1 − aDark), in three's own Phong shader
  const sh = { uniforms: {}, vertexShader: THREE.ShaderLib.phong.vertexShader, fragmentShader: THREE.ShaderLib.phong.fragmentShader }; B3.glassMat().onBeforeCompile(sh);
  const shader = /vDark = aDark/.test(sh.vertexShader) && /totalEmissiveRadiance \*= \(1\.0 - vDark\)/.test(sh.fragmentShader) && /attribute float aDark/.test(sh.vertexShader);
  for (const g of geos) g.dispose();
  ok('a3 a janela: à noite, acesa só com gente acordada dentro — a conta do mundo, os vidros do 3D (a marca de cada vidro), a luz da porta e as janelas do deus; a casa toda dormindo fica escura, um acorda e ela acende, dorme e apaga',
    night && !off && panes >= 20 && !pbad && plit >= 1 && tOK && !emptyLit.length && shader,
    `hora ${S.time.toFixed(2)}: ${lit} prédios com gente acordada, ${dark} sem — ${off} em desacordo · ${panes} prédios com vidros em ${geos.length} quadros de ${set.name}: ${plit} acesos${woke ? ' (um acordado pela mão da prova: nesta noite todas as casas de vidro dos quadros dormiam)' : ''}, ${pbad} com a marca errada${pex.length ? ' (' + pex.join('; ') + ')' : ''} · ${turn} · ${empty.length} prédios vazios, ${emptyLit.length} acesos · o vidro lê a marca: ${shader}`);
}

// ------------------------------ a4: what lies about ------------------------------
if (run('a4')) {
  flush(); const bad = [], prov = []; const shellOf = B3.shellOf;
  const things = b => PR.pieces(b).filter(p => !p.part).map(p => p.thing).filter(Boolean);
  const TR = { lenhador: 1, pescador: 1, cacador: 1, guerreiro: 1, arqueiro: 1, tecelao: 1, agricultor: 1, coletor: 1, vinhateiro: 1 };
  // (the things of a house someone lives in: the bench and the washing of a yard; on a hand of wall the broom, the tub, the
  // braid, the basket — D-186)
  const LIVED = { banco: 1, varal: 1, vassoura: 1, tina: 1, restia: 1, cesto: 1 };
  const res = b => [...S.villagers.values()].filter(v => v.home === b.id);
  const drink = b => ['vinho', 'mel', 'cerveja', 'pulque', 'azeite', 'oleo'].filter(k => ((b.inv || {})[k] || 0) >= 1).length;
  const sigOf = b => B3.sig(b.x, b.y, 1);
  // (the houses as the game draws them — from their plans: what lies about them has its place on their own lot, D-186, T-703
  // closed — and then from their kit, as where a house has no plan: the test's hand on the drawing, put back after. The same
  // rules both ways)
  const seen = {};
  for (const mode of ['planta', 'kit']) {
    B3.shellOf = mode === 'kit' ? (b => (housing(b) ? null : shellOf(b))) : shellOf; flush();
    const cnt = {}; let houses = 0, emptyH = 0, emptyThings = 0, total = 0;
    for (const b of built()) {
      if (!housing(b)) continue; houses++; const L = res(b), T = things(b), all = PR.pieces(b).length; const roles = new Set(L.filter(v => v.age >= 14 && !v.captive).map(v => v.roleBack || v.role)); total += all; // (the trade one goes back to: D-195)
      for (const t of T) cnt[t] = (cnt[t] || 0) + 1;
      if (!L.length) { emptyH++; emptyThings += all; if (all) bad.push(`${mode}: ${tag(b)} vazia com ${all} coisa(s) em volta`); continue; }
      if (T.includes('lenha') && !roles.has('lenhador')) bad.push(`${mode}: ${tag(b)}: lenha sem lenhador na casa`);
      if (T.includes('barril') && !drink(b)) bad.push(`${mode}: ${tag(b)}: barril sem bebida nem óleo na casa`);
      for (const t of T) if (TR[t] && !roles.has(t)) bad.push(`${mode}: ${tag(b)}: coisas de ${t} sem ${t} na casa`);
    }
    // taken away by hand, gone: the woodcutter's wood, the cask's drink, the house's people — and the picture's signature says so
    const wood = built().find(b => housing(b) && things(b).includes('lenha'));
    if (wood) { const L = res(wood).filter(v => v.role === 'lenhador'); const s0 = sigOf(wood); for (const v of L) v.role = 'coletor'; flush(); const t1 = things(wood), s1 = sigOf(wood); for (const v of L) v.role = 'lenhador'; flush(); const t2 = things(wood);
      prov.push(`${mode}: a lenha de ${tag(wood)}: ${t1.includes('lenha') ? 'ficou' : 'sumiu'} sem o lenhador, ${t2.includes('lenha') ? 'voltou' : 'não voltou'} com ele`); if (t1.includes('lenha') || !t2.includes('lenha') || s0 === s1) bad.push(`${mode}: a lenha de ${tag(wood)} não segue o lenhador (assinatura ${s0} → ${s1})`); }
    else prov.push(`${mode}: nenhuma casa de lenhador com lugar para a lenha`);
    // (and called away by an emergency — the war makes him a warrior, with the trade he goes back to kept: village.js, D-212 —,
    // the pile stays at the door: the house shows the trade its people keep, D-195)
    if (wood) { const L = res(wood).filter(v => v.role === 'lenhador'); const b0 = L.map(v => v.roleBack); for (const v of L) { v.roleBack = 'lenhador'; v.role = 'guerreiro'; } flush(); const t3 = things(wood); L.forEach((v, k) => { v.role = 'lenhador'; v.roleBack = b0[k]; }); flush(); const t4 = things(wood);
      prov.push(`${mode}: o lenhador de ${tag(wood)} chamado às armas: a lenha ${t3.includes('lenha') ? 'ficou' : 'SUMIU'} à porta`); if (!t3.includes('lenha') || !t4.includes('lenha')) bad.push(`${mode}: a lenha de ${tag(wood)} sumiu com o lenhador chamado às armas (D-195)`); }
    const lived = built().find(b => housing(b) && res(b).length >= 2 && things(b).some(t => LIVED[t]));
    if (lived) { const L = res(lived); const s0 = sigOf(lived); for (const v of L) v.home = 0; flush(); const n1 = PR.pieces(lived).length, s1 = sigOf(lived); for (const v of L) v.home = lived.id; flush(); const n2 = PR.pieces(lived).length;
      prov.push(`${mode}: ${tag(lived)} esvaziada: ${n1} coisas; de volta: ${n2}`); if (n1 || !n2 || s0 === s1) bad.push(`${mode}: ${tag(lived)} vazia ficou com ${n1} coisas (assinatura ${s0} → ${s1})`); }
    else bad.push(`${mode}: nenhuma casa habitada com as coisas de quem mora (banco, varal, vassoura, tina, réstia)`);
    // a cask where the house has drink: given a jar of wine by hand, then taken
    const dry = built().find(b => housing(b) && res(b).length && !drink(b) && !things(b).includes('barril') && (() => { const I = b.inv || (b.inv = {}); I.vinho = 2; flush(); const t = things(b).includes('barril'); delete I.vinho; flush(); return t; })());
    if (dry) prov.push(`${mode}: ${tag(dry)}: sem bebida, sem barril; com vinho, um barril à porta`); else if (mode === 'planta') bad.push('planta: nenhuma casa com lugar para o barril da bebida à porta'); else prov.push('kit: nenhuma casa com lugar para um barril à porta (T-701)');
    seen[mode] = { cnt, houses, emptyH, emptyThings, total, lived: Object.keys(cnt).filter(k => LIVED[k]).reduce((a, k) => a + cnt[k], 0) };
  }
  B3.shellOf = shellOf; flush();
  // (and a house drawn from its plan with no room at all for things — where there is one: what it has about it changes nothing
  // in its picture; in the ready worlds every house has its hand of wall or its corners now — the proof of it by the test's
  // hand is qa/quintal.js q4)
  const noYard = built().find(b => housing(b) && shellOf(b) && !PR.pieces(b).length && PR.roomOf(b) === 0 && res(b).length && !drink(b));
  if (noYard) { const I = noYard.inv || (noYard.inv = {}); const s0 = sigOf(noYard), a0 = At.about(noYard).sig; I.vinho = 2; flush(); const s1 = sigOf(noYard), a1 = At.about(noYard).sig; delete I.vinho; flush();
    prov.push(`${noYard.type}#${noYard.id} (de planta, sem lugar) com vinho: o que tem em volta ${a0} → ${a1}, o quadro ${s0 === s1 ? 'o mesmo' : 'refeito'}`); if (s0 !== s1) bad.push('a casa de planta, sem lugar, tem o quadro refeito pelo que não mostra'); if (At.about(noYard).sig === undefined) bad.push('sem assinatura do que há em volta'); }
  else prov.push('nenhuma casa de planta sem lugar para coisas neste mundo (quintal q4)');
  // the pottery's pots, the tavern's casks, the market's baskets, the quay's nets: what they have
  const cnt = {};
  for (const b of built()) {
    const T = things(b);
    if (b.type === 'olaria') { const cru = G.Oficio.show(b).cru; if (T.includes('potes') && !(cru > 0)) bad.push(`${tag(b)}: potes secando sem nada cru`); }
    if (b.type === 'taverna') { const n = ['vinho', 'mel', 'cerveja', 'pulque'].reduce((a, k) => a + ((b.inv || {})[k] || 0), 0); if (T.includes('barris') && n < 1) bad.push(`${tag(b)}: barris com a prateleira vazia`); }
    if (b.type === 'mercado' || b.type === 'feira' || b.type === 'mercado_negro') { const n = Object.values(b.inv || {}).filter(x => x >= 1).length; const c = T.filter(t => t === 'cesto').length; if (c > n) bad.push(`${tag(b)}: ${c} cestos com ${n} bens na prateleira`); }
    if (b.type === 'doca') { const n = S.ships.filter(s => s.dock === b.id && s.kind === 'pesca').length; if (T.includes('redes') && !n) bad.push(`${tag(b)}: redes sem barco de pesca`);
      // (the coils of rope: only on a quay that works — a ship of its own, or its quarter a busy port or a fishing shore)
      const q = U.at(b.x + b.w / 2, b.y + b.h / 2); const works = S.ships.some(s => s.dock === b.id) || (q && (U.is(q, 'porto') || U.is(q, 'pesqueiro'))); if (T.includes('corda') && !works) bad.push(`${tag(b)}: cordas num cais parado`); }
    for (const t of T) if (!housing(b)) cnt[t] = (cnt[t] || 0) + 1;
  }
  // the tavern's casks: wine on the shelf by the test's hand, then the shelf emptied — the tavern as the game draws it, from
  // its plan (the casks on its lot out of its yard: D-186), and from its kit (its yard)
  const POUR = ['vinho', 'mel', 'cerveja', 'pulque'];
  for (const mode of ['planta', 'kit']) {
    B3.shellOf = mode === 'kit' ? (b => (b.type === 'taverna' ? null : shellOf(b))) : shellOf; flush();
    const tav = built().filter(b => b.type === 'taverna').find(b => { const I = b.inv || (b.inv = {}); const keep = {}; for (const k of POUR) keep[k] = I[k]; I.vinho = 6; flush(); const on = things(b).includes('barris');
      for (const k of POUR) I[k] = 0; flush(); const off = things(b).includes('barris'); for (const k of POUR) { if (keep[k] === undefined) delete I[k]; else I[k] = keep[k]; } flush();
      if (on) { prov.push(`${mode}: ${tag(b)}: com vinho na prateleira, barris; vazia, ${off ? 'barris ainda' : 'nenhum'}`); if (off) bad.push(`${mode}: ${tag(b)}: barris com a prateleira vazia`); } return on; });
    if (!tav) bad.push(`${mode}: nenhuma taverna com lugar para barris`);
  }
  B3.shellOf = shellOf; flush();
  const P = seen.planta, K = seen.kit;
  ok('a4 os objetos: em volta de cada casa só o que ela tem — lenha só na casa do lenhador, barril só com bebida, as coisas de quem mora só com morador, as de um ofício só onde ele mora; casa vazia, nada; potes só secando, barris só com o que servir, redes só com barco de pesca; tirado à mão, some — no desenho pela planta (o do jogo) e no do kit',
    !bad.length && P.houses > 50 && P.lived > 5 && K.lived > 5, `pela planta: ${P.houses} casas (${P.emptyH} vazias, ${P.emptyThings} coisas nelas), ${P.total} coisas: ${JSON.stringify(P.cnt)} · pelo kit: ${K.total} coisas: ${JSON.stringify(K.cnt)} · os outros prédios: ${JSON.stringify(cnt)} · ${prov.join(' · ')}${bad.length ? ' · ' + bad.slice(0, 4).join(' · ') : ''}`);
}

// ------------------------------ a5: the wear ------------------------------
if (run('a5')) {
  flush(); const bad = []; const info = [];
  const H = built().filter(b => housing(b) && b.type !== 'barraco' && !B3.formOf(b));
  const colours = b => { const g = B3.nearGeo(b.x, b.y, 1); const c = g.solid ? hash(plain(Array.from(g.solid.attributes.color.array))) : 0; for (const q in g) if (g[q]) g[q].dispose(); return c; };
  // the years: the same house new and old
  const h = H.find(b => At.wear(b).dampLv === 0 && [...S.villagers.values()].some(v => v.home === b.id)) || H[0];
  { const born = h.born; h.born = S.day; flush(); const w0 = At.wear(h), c0 = colours(h), s0 = At.sig(h); h.born = S.day - 60; flush(); const w1 = At.wear(h), c1 = colours(h), s1 = At.sig(h); h.born = born; flush();
    info.push(`${tag(h)} nova: idade ${w0.age.toFixed(2)}, sujeira ${w0.grime.toFixed(2)}; com 60 anos: ${w1.age.toFixed(2)}, ${w1.grime.toFixed(2)}`);
    if (!(w1.age > w0.age && w1.grime > w0.grime && w1.ageLv === 4 && w0.ageLv === 0) || c0 === c1 || s0 === s1) bad.push(`${tag(h)}: os anos não aparecem (idade ${w0.age} → ${w1.age}, quadro ${c0 === c1 ? 'igual' : 'mudou'}, assinatura ${s0 === s1 ? 'igual' : 'mudou'})`);
    // (a new wall someone cares for is clean: no dirt of years it has not lived)
    if (w0.care >= 1 && w0.grime !== 0) bad.push(`${tag(h)} nova e cuidada com sujeira ${w0.grime}`);
    // (and a building whose birth the world does not know — a save of before the births were kept, one made by a proof's
    // hand —: no wear at all, drawn by its id as it always was; the god's and the 3D's pictures of it compared as before)
    h.born = undefined; flush(); const wn = At.wear(h), sn = At.sig(h, false, true), cn = colours(h); h.born = S.day - 60; flush(); const co = colours(h); h.born = born; flush();
    info.push(`sem nascimento: ${wn === null ? 'sem desgaste' : 'com desgaste'}`);
    if (wn !== null || sn !== 0 || cn === co) bad.push(`${tag(h)} sem nascimento: desgaste ${JSON.stringify(wn)}, assinatura ${sn}, quadro ${cn === co ? 'o de 60 anos' : 'outro'}`); }
  // the water: by its count over the world, every damp house has water within two tiles, every dry one none
  let wetN = 0, dryN = 0;
  for (const b of built()) { const d = At.wear(b).dampLv; let water = false; for (let y = b.y - 2; y < b.y + b.h + 2; y++) for (let x = b.x - 2; x < b.x + b.w + 2; x++) if (G.W.inb(x, y) && S.type[G.W.idx(x, y)] <= G.T.RIVER) water = true; if (d) wetN++; else dryN++; if (!!d !== water) bad.push(`${tag(b)}: umidade ${d} ${water ? 'com' : 'sem'} água a duas casas`); }
  info.push(`${wetN} prédios junto da água úmidos, ${dryN} secos`);
  // the care: a house with no one in it is neglected; its quarter in decline, neglected; a rich quarter, kept
  const lived = H.find(b => At.wear(b).care === 1 && At.wear(b).ageLv >= 1 && At.wear(b).ageLv <= 3 && [...S.villagers.values()].some(v => v.home === b.id) && U.at(b.x + b.w / 2, b.y + b.h / 2));
  if (!lived) bad.push('nenhuma casa habitada de cuidado médio num bairro');
  else {
    const q = U.at(lived.x + lived.w / 2, lived.y + lived.h / 2); const t0 = q.tags ? q.tags.slice() : null; const c1 = At.wear(lived).care, a1 = At.wear(lived).age;
    q.tags = (t0 || []).concat(['decadencia']); flush(); const c0 = At.wear(lived).care, a0 = At.wear(lived).age;
    q.tags = (t0 || []).filter(x => x !== 'pobre' && x !== 'vazio').concat(['nobre']); flush(); const c2 = At.wear(lived).care, a2 = At.wear(lived).age;
    if (t0) q.tags = t0; else delete q.tags; flush();
    const L = [...S.villagers.values()].filter(v => v.home === lived.id); for (const v of L) v.home = 0; flush(); const ce = At.wear(lived).care; for (const v of L) v.home = lived.id; flush();
    info.push(`${tag(lived)}: cuidado ${c1}; o bairro em decadência ${c0}; rico ${c2}; sem ninguém ${ce} · idade à vista ${a0.toFixed(2)} ≥ ${a1.toFixed(2)} ≥ ${a2.toFixed(2)}`);
    if (!(c0 === 0 && c2 === 2 && ce === 0 && a0 > a1 && a1 > a2)) bad.push(`${tag(lived)}: o cuidado não segue o bairro (${c0}, ${c1}, ${c2}; vazia ${ce})`);
    // (the dirt is of the years: this house of an ordinary quarter, new, is clean — it looks as the god draws it — and old, dirty)
    const bn = lived.born; lived.born = S.day; flush(); const g0 = At.wear(lived).grime; lived.born = S.day - 60; flush(); const g1 = At.wear(lived).grime; lived.born = bn; flush();
    info.push(`a sujeira dela: nova ${g0.toFixed(2)}, com 60 anos ${g1.toFixed(2)}`); if (g0 !== 0 || !(g1 > 0)) bad.push(`${tag(lived)}: a sujeira não é dos anos (nova ${g0}, velha ${g1})`);
  }
  // across the world: the empty houses and the shacks are the neglected ones
  let emptyN = 0, emptyKept = 0; for (const b of H) if (![...S.villagers.values()].some(v => v.home === b.id)) { emptyN++; if (At.wear(b).care !== 0) emptyKept++; }
  info.push(`${emptyN} casas vazias, ${emptyKept} com cuidado`);
  if (emptyKept) bad.push(`${emptyKept} casas vazias com cuidado`);
  ok('a5 o desgaste: mais anos, mais velha à vista; junto da água, úmida; casa vazia e bairro em decadência, largados; bairro rico, cuidado — e o quadro do 3D muda com isso', !bad.length, info.join(' · ') + (bad.length ? ' · ' + bad.slice(0, 4).join(' · ') : ''));
}

// ------------------------------ a6: only seen ------------------------------
if (run('a6')) {
  const w0 = world(); let n = 0, pcs = 0;
  for (const b of built()) { At.fire(b); At.lit(b); At.awake(b); At.about(b); At.wear(b); At.sig(b); At.why(b); F3.smokeRate(b, 0.5, false); F3.doorLit(b); R.smokeOf(b); R.windowLit(b); n++; }
  const set = [...S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0]; const C = 16; let chunks = 0;
  for (let cy = Math.floor((set.cy - 16) / C); cy <= Math.floor((set.cy + 16) / C); cy++) for (let cx = Math.floor((set.cx - 16) / C); cx <= Math.floor((set.cx + 16) / C); cx++) { B3.sig(cx * C, cy * C, C); const g = B3.nearGeo(cx * C, cy * C, C); chunks++; for (const q in g) if (g[q]) g[q].dispose(); }
  B3.paneStep(); for (const b of built().slice(0, 150)) pcs += PR.pieces(b).length;
  const d = same(w0, world());
  ok('a6 só desenha: tudo perguntado para cada prédio, os quadros do 3D feitos — o mundo igual até o último número (o canônico, o save, cada pessoa, prédio e operação, o acaso do mundo)', !d.length, `${n} prédios, ${chunks} quadros de ${set.name}, ${pcs} coisas em volta · ${d.length ? 'mudou: ' + d.join(', ') : 'nada mudou'}`);
}

// ------------------------------ a7: saved and loaded in the middle ------------------------------
if (run('a7')) {
  M.viver(2); flush();
  const pic = () => { const m = new Map(); for (const b of built()) m.set(b.id, [At.fire(b) ? At.fire(b).why : '', At.lit(b), aboutKey(At.about(b)), At.wear(b).ageLv + '/' + At.wear(b).dampLv, At.wear(b).care, insiders(b).length + ':' + awakeIn(b).length, cause(b) || '', litBy(b)]); return m; };
  const a = pic(); const size = M.salvarCarregar(); S = G.S; flush(); const b = pic();
  let fire = 0, lit = 0, about = 0, wear = 0, care = 0, moved = 0, truth = 0;
  for (const [id, p] of a) { const q = b.get(id); if (!q) { about++; continue; } if (q[5] !== p[5]) moved++; else { if (q[0] !== p[0]) fire++; if (q[1] !== p[1]) lit++; } if (q[2] !== p[2]) about++; if (q[3] !== p[3]) wear++; if (q[4] !== p[4]) care++; if (q[0] !== q[6] || q[1] !== q[7]) truth++; }
  // (the care reads the land's worth from the town's look of the day, derived and never saved: a loaded world gives each town
  // its look again one a step — Urban.update, L-694 —, the look of the hour of the load, not the dawn's: after a step a town
  // the care is back but for the few buildings whose land changed its worth since dawn — counted and said, T-702)
  const towns = S.settlements.size; M.viver(towns * 0.1 + 0.1); flush(); let care2 = 0; for (const q of built()) { const p = a.get(q.id); if (p && At.wear(q).care !== p[4]) care2++; }
  ok('a7 o save no meio: salvo e carregado, as mesmas respostas para cada prédio — o fogo, a janela, o que há em volta, os anos e a umidade — e, carregado, a fumaça e a janela de acordo com a causa', a.size === b.size && !fire && !lit && !about && !wear && !truth && M.limpo(),
    `${a.size} prédios: fogo ${fire}, janela ${lit}, em volta ${about}, anos e umidade ${wear} diferentes; ${truth} em desacordo com a causa depois do load · ${moved} prédios de onde o save tirou gente (à porta) ficaram fora da conta do fogo e da janela · cuidado diferente em ${care} logo depois do load (o valor da terra é do retrato do dia de cada cidade, que o mundo refaz uma cidade por passo: T-702) e em ${care2} depois de ${towns} passos (${towns} cidades: o retrato de volta, o da hora do load) · save de ${size} caracteres`);
}

// ------------------------------ a8: the New Fire ------------------------------
if (run('a8')) {
  flush(); const B = built(); const hot = B.filter(b => At.fire(b)), lit = B.filter(b => At.lit(b));
  // (the festival's own doors, held by the test's hand: every flame of every town out)
  const d0 = G.Fest.darkB, d1 = G.Fest.dark; G.Fest.darkB = () => true; G.Fest.dark = () => ({ lit: new Set() });
  let f = 0, l = 0, s3 = 0, s2 = 0; try { flush(); for (const b of B) { if (At.fire(b)) f++; if (At.lit(b) || F3.doorLit(b) > 0 || R.windowLit(b)) l++; if (F3.smokeRate(b, 1, false) > 0) s3++; if (R.smokeOf(b)) s2++; } } finally { G.Fest.darkB = d0; G.Fest.dark = d1; flush(); }
  const back = B.filter(b => At.fire(b)).length;
  ok('a8 o Fogo Novo: na noite em que toda chama da cidade se apaga, nenhuma fumaça, nenhuma janela acesa, a fogueira fria — e depois tudo de volta', hot.length > 0 && !f && !l && !s3 && !s2 && back === hot.length, `antes ${hot.length} fogos e ${lit.length} janelas; apagado: ${f} fogos, ${l} janelas, ${s3} fumaças no 3D, ${s2} na vista do deus; de volta ${back} fogos`);
}

// ------------------------------ a9: the checker's rules ------------------------------
if (run('a9')) {
  const atm = () => QA.check().filter(q => q.sys === 'atmos');
  const bad = []; let looks = 0;
  // (along the evening and into the night: the houses' fires lit and left, the taverns open and shut, the people to bed)
  for (let k = 0; k < 10; k++) { M.viver(12); const q = atm(); looks++; for (const x of q.slice(0, 2)) bad.push(`S${x.sev} ${x.msg}`); }
  // a lie in each rule, told by the test's hand on Atmos's own doors: the rule must accuse it
  const told = [];
  const lie = (name, rx, on, off) => { let q; try { on(); q = atm(); } finally { off(); flush(); } const hit = q.filter(x => rx.test(x.msg)).length; told.push(`${name}: ${hit ? 'acusa' : 'CALA'}`); if (!hit) bad.push(`o verificador cala diante de «${name}»`); };
  const f0 = At.fire, l0 = At.lit, a0 = At.about;
  lie('fumaça sem fogo', /fumando .* sem fogo/, () => { At.fire = b => f0(b) || (b && b.built && b.type !== 'ruin' ? At.FIRE.lareira : null); }, () => { At.fire = f0; });
  lie('a fumaça de outro fogo', /fumando por .* quando o fogo embaixo é/, () => { At.fire = b => (f0(b) ? (f0(b) === At.FIRE.lareira ? At.FIRE.fornada : At.FIRE.lareira) : null); }, () => { At.fire = f0; });
  lie('fogo sem fumaça', /com fogo de verdade .* sem fumaça/, () => { At.fire = () => null; }, () => { At.fire = f0; });
  lie('janela acesa sem ninguém', /janela acesa sem ninguém acordado/, () => { At.lit = b => !!b && !!b.built && b.type !== 'ruin'; }, () => { At.lit = l0; });
  lie('janela apagada com gente', /acordado\(s\) dentro e a janela apagada/, () => { At.lit = () => false; }, () => { At.lit = l0; });
  lie('coisas numa casa vazia', /vazia com coisas em volta/, () => { At.about = b => Object.assign({}, a0(b), { bench: true, wash: 2 }); }, () => { At.about = a0; });
  lie('lenha sem lenhador', /lenha em volta sem lenhador/, () => { At.about = b => Object.assign({}, a0(b), { wood: true }); }, () => { At.about = a0; });
  // (and an answer kept from the instant before: someone awake in a lit house put to sleep by the test's hand, Atmos not told)
  flush(); const home = built().find(b => housing(b) && At.lit(b) && awakeIn(b).length > 0); let kept = null;
  if (home) { const W0 = awakeIn(home); lie('a resposta guardada de um instante antes', /janela acesa sem ninguém acordado/, () => { for (const v of W0) v.sleeping = true; }, () => { for (const v of W0) v.sleeping = false; }); kept = tag(home); }
  else { M.viver(0); told.push('nenhuma casa acesa agora para a resposta guardada'); }
  const after = atm();
  ok('a9 o verificador: as regras do qa/atmos-inv.js limpas ao longo de uma noite vivida — e cada uma acusa a mentira contada pela mão do teste', !bad.length && !after.length && looks >= 10,
    `${looks} olhadas ao longo de ${looks * 12} s de mundo · ${told.join(' · ')}${kept ? ' (' + kept + ')' : ''} · depois, ${after.length} violações${bad.length ? ' · ' + bad.slice(0, 5).join(' · ') : ' · nenhuma violação'}`);
}

const e = M.erros(); const clean = M.limpo();
ok('sem erro de módulo nem aviso no console', clean, clean ? 'limpo' : JSON.stringify(e).slice(0, 300));
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
