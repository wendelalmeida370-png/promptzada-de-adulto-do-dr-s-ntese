// quintal: what lies about the buildings drawn from their plans — the houses, the taverns, the potteries of a real town —
// has a place and a cause (Bairros Vivos, D-186; T-703 closed) — in Node, the simulation of qa/nodemundo.js with three.js and
// the 3D's own files, with no hand on the drawing (the houses as the game draws them: Build3D's shell):
//   node qa/quintal.js [mundo]      (default: the ready world «metropole»; also «cidade», «mega»;  ONLY=q1,q3 runs some)
// What a building has is counted here from the world's own records (who lives there and their trades, the house's goods, the
// tavern's shelf, the raw pieces of the pottery's batches), never from G.Atmos; what is drawn is asked of the drawing
// (Props3D.pieces: the building drawn again with what lies about it, each piece's box on its lot).
//   q1  o lugar        every house someone lives in shows something, every woodcutter's house its wood, every house with a
//                      trade a thing of it, every tavern with drink to pour its casks, every pottery with raw pieces its pots —
//                      or the exception, counted and said (no room: which, and why); nothing drawn without its cause; an
//                      empty house, a dry tavern, a pottery at rest show nothing
//   q2  posto e tirado the cause given and taken by hand — a woodcutter, a jar of wine, the family, the tavern's shelf, the
//                      pottery's raw pieces —: the thing comes and goes, and the picture's signature says it must be made again
//   q3  o caminho      piece by piece, by the geometry: on its own lot, out of every wall, on no ground anyone walks — the
//                      world's map, the plan's doorsteps, the steps before the doors —, before no door or gate, on no window,
//                      none on another; the same with the plans made and not made
//   q4  o quadro       the picture is made again only for what it shows: the same world, the same signature; a change that
//                      shows nothing, the same; a house with no room for things, the same with a jar of wine
//   q5  só desenha     every piece asked, the plans made, the near pictures built: the world the same to the last number
//   q6  o save         saved and loaded in the middle: the same pieces about every building
//   q7  o verificador  the rules of qa/quintal-inv.js (QA.yard) clean over the world — and each accuses a lie told by the test's
//                      hand: wood drawn at no woodcutter's, a thing out on the street, a thing before a door, a house with
//                      things by the world and nothing drawn
//   q8  o custo        the triangles and the pieces what lies about adds, by house and over the world (said, not judged)
const fs = require('fs'), path = require('path');
const M = require('./nodemundo.js');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const all = [...html.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map(m => m[1]);
global.atob = global.atob || (s => Buffer.from(s, 'base64').toString('binary'));
global.performance = global.performance || { now: () => Date.now() };
const G = M.load({ qa: true, extra: all.slice(all.indexOf('js/lib/three.min.js')).concat(['qa/atmos-inv.js', 'qa/quintal-inv.js']) });
global.THREE = window.THREE;
G.Realm.shapes(); G.Build3D.init(THREE, G.Realm);
const scene = new THREE.Scene(); const realm = Object.assign(Object.create(G.Realm), { scene: () => scene, renderer: () => null, camera: () => null });
G.People3D.init(THREE, realm);
const At = G.Atmos, B3 = G.Build3D, PR = G.Props3D, A = G.Act, Sp = G.Space;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | quintal ${name} | ${info}`); if (!c) fails.push(name); };
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean); const run = k => !ONLY.length || ONLY.includes(k);
const world = process.argv[2] || process.env.MUNDO || 'metropole';
M.pronto(world);
G.Realm.setQuality('alta'); // (the preset that draws all of the decoration: what a house has is never left out for the machine's sake)
let S = G.S;
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const plain = o => JSON.stringify(o, (k, v) => (v instanceof Map ? [...v] : v instanceof Set ? [...v] : ArrayBuffer.isView(v) ? v.length : v));
const state = () => ({ canon: hash(JSON.stringify(QA.canon())), save: hash(G.Save.serialize()), people: hash(plain([...S.villagers.values()])), builds: hash(plain([...S.buildings.values()])), acts: hash(plain(S.acts || [])), rng: plain(S.rng) });
const same = (a, b) => Object.keys(a).filter(k => a[k] !== b[k]);
const housing = b => !!(G.BDEF[b.type] && G.BDEF[b.type].housing);
const built = () => [...S.buildings.values()].filter(b => b.built && b.type !== 'ruin').sort((a, b) => a.id - b.id);
const mine = () => built().filter(b => housing(b) || b.type === 'taverna' || b.type === 'olaria');
const tag = b => `${b.type}#${b.id}`; const flush = () => At.flush();
// ------------------------------ the cause, from the world's own records ------------------------------
const DRINK = ['vinho', 'mel', 'cerveja', 'pulque', 'azeite', 'oleo'], POUR = ['vinho', 'mel', 'cerveja', 'pulque'];
const TR = ['pescador', 'cacador', 'guerreiro', 'arqueiro', 'tecelao', 'agricultor', 'coletor', 'vinhateiro'];
const LIVED = ['banco', 'varal', 'vassoura', 'tina', 'restia', 'cesto'];
const res = b => [...S.villagers.values()].filter(v => v.home === b.id);
const rolesOf = b => new Set(res(b).filter(v => v.role && v.age >= 14 && !v.captive).map(v => v.role));
const drink = b => DRINK.filter(k => ((b.inv || {})[k] || 0) >= 1).length;
const pour = b => POUR.reduce((a, k) => a + ((b.inv || {})[k] || 0), 0);
const rawOps = b => A.all().filter(o => o.def === 'oficio' && A.live(o) && o.at === b.id);
const raw = b => rawOps(b).reduce((a, o) => a + (o.data.cru || 0), 0);
const things = b => PR.pieces(b).filter(p => !p.part).map(p => p.thing).filter(Boolean);
const sigOf = b => B3.sig(b.x, b.y, 1);
const kindOf = b => { const s = B3.shellOf(b); return s ? s.shell.kind : 'kit'; };

// ------------------------------ q1: the place ------------------------------
if (run('q1')) {
  flush(); const bad = []; const cnt = {}; const ex = { redonda: [], semFaixa: [], semVao: [] };
  let houses = 0, lived = 0, livedShow = 0, empty = 0, emptyThings = 0, wood = 0, woodShow = 0, cask = 0, caskShow = 0, trade = 0, tradeShow = 0, plan = 0, thin = 0, pieces = 0;
  const why = (b, what) => { const k = kindOf(b); (k === 'round' ? ex.redonda : !(PR.roomOf(b) > 0) ? ex.semFaixa : ex.semVao).push(`${tag(b)} (${what})`); };
  for (const b of built()) {
    if (!housing(b)) continue; houses++; const L = res(b), P = PR.pieces(b), T = P.filter(p => !p.part).map(p => p.thing).filter(Boolean), roles = rolesOf(b); pieces += P.length; thin += P.filter(p => p.thin).length; if (kindOf(b) !== 'kit') plan++;
    for (const t of T) cnt[t] = (cnt[t] || 0) + 1;
    if (!L.length) { empty++; emptyThings += P.length; if (P.length) bad.push(`${tag(b)} vazia com ${P.length} coisa(s) em volta`); continue; }
    lived++; if (P.length) livedShow++; else why(b, 'habitada, nada à vista');
    if (roles.has('lenhador')) { wood++; if (T.includes('lenha')) woodShow++; else why(b, 'lenhador sem lenha à vista'); }
    if (drink(b)) { cask++; if (T.includes('barril')) caskShow++; else why(b, 'bebida sem barril à vista'); }
    const mt = TR.filter(r => roles.has(r)); if (mt.length) { trade++; if (T.some(t => mt.includes(t))) tradeShow++; else why(b, 'ofício sem as suas coisas à vista'); }
    if (T.includes('lenha') && !roles.has('lenhador')) bad.push(`${tag(b)}: lenha sem lenhador na casa`);
    if (T.includes('barril') && !drink(b)) bad.push(`${tag(b)}: barril sem bebida nem óleo na casa`);
    for (const t of T) if (TR.includes(t) && !roles.has(t)) bad.push(`${tag(b)}: coisas de ${t} sem ${t} na casa`);
    if (P.some(p => !p.thing)) bad.push(`${tag(b)}: uma coisa sem nome em volta`);
  }
  // the taverns and the potteries
  let tav = 0, tavHas = 0, tavShow = 0, pot = 0, potHas = 0, potShow = 0;
  for (const b of built()) {
    if (b.type === 'taverna') { tav++; const T = things(b), n = pour(b); if (n >= 1) { tavHas++; if (T.includes('barris')) tavShow++; else why(b, 'bebida na prateleira sem barris à vista'); } else if (T.length) bad.push(`${tag(b)}: ${T.join(', ')} com a prateleira vazia`); }
    if (b.type === 'olaria') { pot++; const T = things(b), n = raw(b); if (n > 0) { potHas++; if (T.includes('potes')) potShow++; else why(b, 'peças cruas sem potes à vista'); } else if (T.length) bad.push(`${tag(b)}: ${T.join(', ')} sem nada cru`); }
  }
  const nEx = ex.redonda.length + ex.semFaixa.length + ex.semVao.length;
  // (what must hold: nothing without its cause; every lived house shows something, every woodcutter's its wood, every house
  // with drink its cask, every tavern and pottery with the cause its things — but a house in twenty at the most, with no room
  // at all, said; of the houses of a trade, seven in ten at the least show a thing of it: the rest have no span of wall free
  // of windows for it, said too)
  const strict = ex.semVao.filter(q => /habitada|lenhador|bebida/.test(q)); const few = n => Math.max(1, Math.ceil(n * 0.05));
  ok(`q1 o lugar (${world}): toda casa habitada mostra algo, toda casa de lenhador a lenha, todo ofício as suas coisas, toda taverna com o que servir os barris, toda olaria com peças cruas os potes — ou a exceção contada; nada sem causa; casa vazia, nada`,
    !bad.length && !strict.length && lived > 5 && lived - livedShow <= few(lived) && wood - woodShow <= (wood ? few(wood) : 0) && cask - caskShow <= (cask ? few(cask) : 0) && tradeShow >= trade * 0.7 && tavShow === tavHas && potShow === potHas,
    `${houses} casas (${plan} pela planta): ${lived} habitadas, ${livedShow} com algo à vista · lenhador ${woodShow}/${wood} · bebida ${caskShow}/${cask} · ofício ${tradeShow}/${trade} · ${empty} vazias com ${emptyThings} coisas · tavernas ${tavShow}/${tavHas} com o que servir (de ${tav}) · olarias ${potShow}/${potHas} com peças cruas (de ${pot}) · ${pieces} coisas nas casas (${thin} finas): ${JSON.stringify(cnt)} · exceções ${nEx}: cabana redonda ${ex.redonda.length}${ex.redonda.length ? ' [' + ex.redonda.slice(0, 4).join('; ') + ']' : ''}, sem faixa ${ex.semFaixa.length}${ex.semFaixa.length ? ' [' + ex.semFaixa.slice(0, 4).join('; ') + ']' : ''}, sem vão livre na parede ${ex.semVao.length}${ex.semVao.length ? ' [' + ex.semVao.slice(0, 6).join('; ') + ']' : ''}${bad.length ? ' · SEM CAUSA: ' + bad.slice(0, 4).join(' · ') : ''}`);
}

// ------------------------------ q2: given and taken ------------------------------
if (run('q2')) {
  flush(); const bad = [], prov = [];
  const H = built().filter(b => housing(b) && kindOf(b) === 'rect' && PR.pieces(b).length >= 0 && PR.roomOf(b) > 0);
  // the woodcutter's wood: gone with his trade, back with it
  const wood = H.find(b => things(b).includes('lenha'));
  if (wood) { const L = res(wood).filter(v => v.role === 'lenhador'); const s0 = sigOf(wood); for (const v of L) v.role = 'construtor'; flush(); const t1 = things(wood), s1 = sigOf(wood); for (const v of L) v.role = 'lenhador'; flush(); const t2 = things(wood), s2 = sigOf(wood);
    prov.push(`a lenha de ${tag(wood)}: ${t1.includes('lenha') ? 'ficou' : 'sumiu'} sem o lenhador, ${t2.includes('lenha') ? 'voltou' : 'não voltou'} com ele`); if (t1.includes('lenha') || !t2.includes('lenha') || s0 === s1 || s2 !== s0) bad.push(`a lenha de ${tag(wood)} não segue o lenhador (assinatura ${s0} → ${s1} → ${s2})`); }
  else if (built().some(b => housing(b) && rolesOf(b).has('lenhador'))) bad.push('nenhuma casa de planta com a lenha de um lenhador à vista'); else prov.push('nenhum lenhador mora numa casa deste mundo');
  // a woodcutter come to a house that had none
  const noW = H.find(b => res(b).some(v => v.age >= 14 && !v.captive && v.role && v.role !== 'lenhador') && !rolesOf(b).has('lenhador') && !things(b).includes('lenha') && PR.spanOf(b) >= 0.9);
  if (noW) { const v = res(noW).find(q => q.age >= 14 && !q.captive && q.role && q.role !== 'lenhador'); const r0 = v.role, s0 = sigOf(noW); v.role = 'lenhador'; flush(); const t1 = things(noW), s1 = sigOf(noW); v.role = r0; flush(); const t2 = things(noW);
    prov.push(`${tag(noW)}: ${v.name} vira lenhador — lenha ${t1.includes('lenha') ? 'aparece' : 'NÃO aparece'}; deixa de ser — ${t2.includes('lenha') ? 'FICA' : 'some'}`); if (!t1.includes('lenha') || t2.includes('lenha') || s0 === s1) bad.push(`${tag(noW)}: a lenha não vem com o lenhador (assinatura ${s0} → ${s1})`); }
  else bad.push('nenhuma casa de planta sem lenhador, com parede livre, para receber um');
  // a jar of wine: the cask by the door
  const dry = H.find(b => res(b).length && !drink(b) && !things(b).includes('barril') && PR.spanOf(b) >= 0.9);
  if (dry) { const I = dry.inv || (dry.inv = {}); const s0 = sigOf(dry); I.vinho = 2; flush(); const t1 = things(dry), s1 = sigOf(dry), thin1 = PR.pieces(dry).some(p => p.thing === 'barril' && p.thin); delete I.vinho; flush(); const t2 = things(dry), s2 = sigOf(dry);
    prov.push(`${tag(dry)}: com vinho, ${t1.includes('barril') ? (thin1 ? 'a botija à porta' : 'o barril à porta') : 'NADA'}; sem ele, ${t2.includes('barril') ? 'FICA' : 'some'}`); if (!t1.includes('barril') || t2.includes('barril') || s0 === s1 || s2 !== s0) bad.push(`${tag(dry)}: o barril não segue a bebida (assinatura ${s0} → ${s1} → ${s2})`); }
  else bad.push('nenhuma casa de planta habitada e sem bebida, com parede livre');
  // the family gone: nothing; back: its things
  const fam = H.find(b => res(b).length >= 2 && PR.pieces(b).length >= 1);
  if (fam) { const L = res(fam); const n0 = PR.pieces(fam).length, s0 = sigOf(fam); for (const v of L) v.home = 0; flush(); const n1 = PR.pieces(fam).length, s1 = sigOf(fam); for (const v of L) v.home = fam.id; flush(); const n2 = PR.pieces(fam).length;
    prov.push(`${tag(fam)} com ${n0} coisas; esvaziada, ${n1}; de volta, ${n2}`); if (n1 || n2 !== n0 || s0 === s1) bad.push(`${tag(fam)} vazia ficou com ${n1} coisas (assinatura ${s0} → ${s1})`); }
  else bad.push('nenhuma casa de planta habitada com coisas à vista');
  // the tavern's shelf: wine by the test's hand, then emptied
  const tavs = built().filter(b => b.type === 'taverna');
  const tv = tavs.find(b => { const I = b.inv || (b.inv = {}); const keep = {}; for (const k of POUR) keep[k] = I[k]; for (const k of POUR) I[k] = 0; flush(); const off = things(b), s0 = sigOf(b); I.vinho = 6; flush(); const on = things(b), s1 = sigOf(b);
    for (const k of POUR) { if (keep[k] === undefined) delete I[k]; else I[k] = keep[k]; } flush();
    if (on.includes('barris')) { prov.push(`${tag(b)} (${kindOf(b)}): a prateleira vazia, ${off.length ? off.join(',') : 'nada'}; com vinho, barris`); if (off.length || s0 === s1) bad.push(`${tag(b)}: os barris não seguem a prateleira (vazia: ${off.join(',') || 'nada'}; assinatura ${s0} → ${s1})`); return true; } return false; });
  if (!tv && tavs.length) bad.push('nenhuma taverna mostra barris com vinho na prateleira'); if (!tavs.length) prov.push('sem taverna neste mundo');
  // the pottery's raw pieces
  const ols = built().filter(b => b.type === 'olaria');
  const ol = ols.find(b => rawOps(b).length);
  if (ol) { const O = rawOps(ol); const keep = O.map(o => o.data.cru); O.forEach(o => { o.data.cru = 0; }); flush(); const off = things(ol), s0 = sigOf(ol); O[0].data.cru = 6; flush(); const on = things(ol), s1 = sigOf(ol), n = PR.pieces(ol).filter(p => p.thing === 'potes').length; O.forEach((o, k) => { o.data.cru = keep[k]; }); flush();
    prov.push(`${tag(ol)}: sem nada cru, ${off.length ? off.join(',') : 'nada'}; com seis peças cruas, potes (${n} fileira(s))`); if (off.length || !on.includes('potes') || s0 === s1) bad.push(`${tag(ol)}: os potes não seguem as peças cruas (${off.join(',') || 'nada'} → ${on.join(',') || 'nada'}; assinatura ${s0} → ${s1})`); }
  else if (ols.length) prov.push('nenhuma olaria com fornada aberta neste instante'); else prov.push('sem olaria neste mundo');
  ok(`q2 posto e tirado (${world}): o lenhador, a jarra de vinho, a família, a prateleira da taverna e as peças cruas da olaria dados e tirados à mão — a coisa aparece e some, e a assinatura do quadro muda com ela`, !bad.length, prov.join(' · ') + (bad.length ? ' · ' + bad.join(' · ') : ''));
}

// ------------------------------ q3: nothing in the way ------------------------------
if (run('q3')) {
  flush(); const B = mine();
  // (as the game draws them from afar and from near: the shell of Interiors.shellOf, then with every plan made — the doorsteps
  // of the plan are the body's then: Space.indoor)
  const key = b => PR.pieces(b).map(p => `${p.thing}:${p.x0.toFixed(3)},${p.z0.toFixed(3)},${p.x1.toFixed(3)},${p.z1.toFixed(3)},${p.y.toFixed(3)}`).join('|');
  const k0 = new Map(B.map(b => [b.id, key(b)])); const v0 = QA.yard(B).filter(q => !/pelo mundo e nada desenhado/.test(q[1]));
  let made = 0; for (const b of B) if (Sp.planNow(b)) made++;
  const moved = B.filter(b => key(b) !== k0.get(b.id)); const v1 = QA.yard(B).filter(q => !/pelo mundo e nada desenhado/.test(q[1]));
  let pcs = 0, thin = 0, withP = 0; const sides = {}; for (const b of B) { const P = PR.pieces(b); if (P.length) withP++; pcs += P.length; for (const p of P) { if (p.thin) thin++; sides[p.side] = (sides[p.side] || 0) + 1; } }
  // (and the measure itself, said: how far the pieces keep from the lot's edge and from the wall)
  let minEdge = 1e9, minDoor = 1e9;
  for (const b of B) { const lw = b.w * Sp.TILE, ld = b.h * Sp.TILE; const body = PR.pieces(b).length ? B3.propsOf(b) : null;
    for (const p of PR.pieces(b)) { minEdge = Math.min(minEdge, p.x0, p.z0, lw - p.x1, ld - p.z1);
      if (body && body.door) { const d = body.door, ax = d.o[1] !== 0, a = (ax ? body.x : body.z) + d.a; if (p.side === d.side) { const lo = ax ? p.x0 : p.z0, hi = ax ? p.x1 : p.z1; minDoor = Math.min(minDoor, Math.max(lo - a, a - hi)); } } } }
  ok(`q3 o caminho (${world}): coisa a coisa, pela geometria — no próprio lote, fora de toda parede, em nenhum chão que alguém anda (o mapa do mundo, a soleira e os degraus das portas), na frente de nenhuma porta, sobre nenhuma janela, nenhuma em cima de outra — com as plantas por fazer e feitas`,
    !v0.length && !v1.length && !moved.length && pcs > 20 && made >= B.length * 0.9,
    `${B.length} casas, tavernas e olarias, ${withP} com coisas: ${pcs} coisas (${thin} finas; por lado ${JSON.stringify(sides)}) · ${made} plantas feitas, ${moved.length} prédios com as coisas noutro lugar depois · violações ${v0.length} antes e ${v1.length} depois${v0.concat(v1).length ? ': ' + v0.concat(v1).slice(0, 4).map(q => q[1]).join(' · ') : ''} · a que mais chega à beira do lote fica a ${(minEdge * 100).toFixed(1)} cm dentro dele; a mais próxima do meio de uma porta, a ${minDoor === 1e9 ? '—' : minDoor.toFixed(2) + ' m'}`);
}

// ------------------------------ q4: the picture made again only for what it shows ------------------------------
if (run('q4')) {
  flush(); const bad = [], info = [];
  const H = built().filter(housing); for (const b of H) PR.pieces(b); // (every house drawn once: its room known)
  // the same world, the same signature
  const s0 = H.map(sigOf); flush(); const s1 = H.map(sigOf); const drift = s0.filter((q, k) => q !== s1[k]).length; if (drift) bad.push(`${drift} casas com outra assinatura sem nada mudar`);
  // a change that shows nothing: a trade with no thing of its own (a builder becomes a smith)
  const plainH = H.find(b => res(b).some(v => v.role === 'construtor' && v.age >= 14 && !v.captive));
  if (plainH) { const v = res(plainH).find(q => q.role === 'construtor' && q.age >= 14 && !q.captive); const a = sigOf(plainH); v.role = 'ferreiro'; flush(); const c = sigOf(plainH); v.role = 'construtor'; flush(); info.push(`${tag(plainH)}: um construtor vira ferreiro — o quadro ${a === c ? 'o mesmo' : 'REFEITO'}`); if (a !== c) bad.push(`${tag(plainH)} refeita por um ofício que não mostra nada`); }
  // a house with no room for things: what it has changes nothing in its picture
  const noRoom = H.find(b => B3.shellOf(b) && PR.roomOf(b) === 0 && res(b).length && !drink(b));
  if (noRoom) { const I = noRoom.inv || (noRoom.inv = {}); const a = sigOf(noRoom), a0 = At.about(noRoom).sig; I.vinho = 2; flush(); const c = sigOf(noRoom), a1 = At.about(noRoom).sig; delete I.vinho; flush();
    info.push(`${tag(noRoom)} (${kindOf(noRoom)}, sem lugar) com vinho: o que tem ${a0} → ${a1}, o quadro ${a === c ? 'o mesmo' : 'REFEITO'}`); if (a !== c || a0 === a1) bad.push(`${tag(noRoom)}, sem lugar para coisas, refeita pelo que não mostra`); }
  else {
    // (none in this world — every house has its hand of wall or its corners —: one made by the test's hand, its shell to the
    // very edge of its lot while it is looked at; put back after)
    const cand = H.find(b => kindOf(b) === 'rect' && res(b).length && !drink(b) && PR.roomOf(b) > 0);
    if (!cand) bad.push('nenhuma casa de planta habitada e sem bebida para a prova do quadro sem lugar');
    else { const real = B3.shellOf, L2 = cand.w * Sp.TILE; B3.shellOf = b => { const S0 = real(b); return b !== cand || !S0 ? S0 : Object.assign({}, S0, { shell: Object.assign({}, S0.shell, { r: [0.005, 0.005, L2 - 0.005, L2 - 0.005] }) }); };
      try { const n = PR.pieces(cand).length, room = PR.roomOf(cand); const I = cand.inv || (cand.inv = {}); const a = sigOf(cand), a0 = At.about(cand).sig; I.vinho = 2; flush(); const c = sigOf(cand), a1 = At.about(cand).sig; delete I.vinho; flush();
        info.push(`${tag(cand)} com a casca até a beira do lote pela mão da prova (${room} faixas, ${n} coisas) e vinho: o que tem ${a0} → ${a1}, o quadro ${a === c ? 'o mesmo' : 'REFEITO'}`); if (room !== 0 || n || a !== c || a0 === a1) bad.push(`${tag(cand)}, sem lugar para coisas, refeita pelo que não mostra (faixas ${room}, coisas ${n})`); }
      finally { B3.shellOf = real; PR.pieces(cand); flush(); } }
  }
  // an empty house: nothing to show, nothing to make again when a house beside it changes
  const emptyH = H.find(b => !res(b).length); if (emptyH) { const a = sigOf(emptyH); const o = H.find(b => b !== emptyH && res(b).length); const I = o.inv || (o.inv = {}); const had = I.mel; I.mel = 3; flush(); const c = sigOf(emptyH); if (had === undefined) delete I.mel; else I.mel = had; flush(); if (a !== c) bad.push(`${tag(emptyH)} vazia refeita pelo que outra casa tem`); info.push(`${tag(emptyH)} vazia: o quadro ${a === c ? 'o mesmo' : 'REFEITO'} quando outra casa ganha mel`); }
  // a store drawn from its plan, where its lot leaves it a yard: the heaps of its people's stock are in its signature (L-841:
  // they stood as they were drawn, whatever the stock did since)
  const store = built().find(b => PR.shows(b) && B3.shellOf(b) && PR.pieces(b).some(p => p.pile));
  if (store) { const f = G.Fac.ofSet(store.set); const st = f.stock; const keep = [st.wood, st.stone, st.food]; const p0 = PR.piles(store).join('/'), a = sigOf(store);
    const cap = Math.max(1, G.Village.cap(f.id)); st.wood = keep[0] > cap / 2 ? 0 : cap; st.stone = keep[1] > cap / 2 ? 0 : cap; st.food = keep[2] > cap / 2 ? 0 : cap; const p1 = PR.piles(store).join('/'), c = sigOf(store); st.wood = keep[0]; st.stone = keep[1]; st.food = keep[2];
    info.push(`${tag(store)} (de planta, com quintal): os montes do estoque ${p0} → ${p1}, o quadro ${a === c ? 'O MESMO' : 'refeito'}`); if (p0 === p1 || a === c) bad.push(`${tag(store)}: os montes do estoque mudam (${p0} → ${p1}) e o quadro não é refeito`); }
  else info.push('nenhum armazém de planta com montes no quintal neste mundo');
  ok(`q4 o quadro (${world}): refeito só pelo que mostra — o mesmo mundo, a mesma assinatura; um ofício que não mostra nada, a mesma; a casa sem lugar para coisas, a mesma com uma jarra de vinho`, !bad.length, `${H.length} casas, ${drift} com a assinatura mudada sem causa · ${info.join(' · ')}${bad.length ? ' · ' + bad.join(' · ') : ''}`);
}

// ------------------------------ q5: only seen ------------------------------
if (run('q5')) {
  const w0 = state(); let n = 0, pcs = 0, plans = 0;
  for (const b of mine()) { pcs += PR.pieces(b).length; PR.roomOf(b); PR.spanOf(b); sigOf(b); if (Sp.planNow(b)) plans++; pcs += PR.pieces(b).length; n++; }
  const set = [...S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0]; const C = 16; let chunks = 0;
  for (let cy = Math.floor((set.cy - 16) / C); cy <= Math.floor((set.cy + 16) / C); cy++) for (let cx = Math.floor((set.cx - 16) / C); cx <= Math.floor((set.cx + 16) / C); cx++) { B3.sig(cx * C, cy * C, C); const g = B3.nearGeo(cx * C, cy * C, C); chunks++; for (const q in g) if (g[q]) g[q].dispose(); }
  const v = QA.yard(mine()).length; const d = same(w0, state());
  ok(`q5 só desenha (${world}): as coisas de cada prédio pedidas, as plantas feitas, os quadros de perto montados, as regras olhadas — o mundo igual até o último número (o canônico, o save, cada pessoa, prédio e operação, o acaso do mundo)`, !d.length, `${n} prédios, ${plans} plantas, ${pcs} coisas, ${chunks} quadros de ${set.name}, ${v} violações · ${d.length ? 'mudou: ' + d.join(', ') : 'nada mudou'}`);
}

// ------------------------------ q6: saved and loaded in the middle ------------------------------
if (run('q6')) {
  M.viver(2); flush();
  const pic = () => { const m = new Map(); for (const b of mine()) m.set(b.id, PR.pieces(b).map(p => `${p.thing}:${p.side}:${p.x0.toFixed(2)},${p.z0.toFixed(2)}`).join('|')); return m; };
  const a = pic(); const na = [...a.values()].filter(Boolean).length; const size = M.salvarCarregar(); S = G.S; flush(); const b = pic();
  let diff = 0; const exs = []; for (const [id, p] of a) { if (b.get(id) !== p) { diff++; if (exs.length < 3) exs.push(`${id}: ${p || 'nada'} → ${b.get(id) || 'nada'}`); } }
  const v = QA.yard(mine()).filter(q => !/pelo mundo e nada desenhado/.test(q[1]));
  ok(`q6 o save no meio (${world}): salvo e carregado, as mesmas coisas, nos mesmos lugares, em volta de cada prédio — e nenhuma onde não pode`, a.size === b.size && !diff && !v.length && na > 5 && M.limpo(), `${a.size} prédios, ${na} com coisas; ${diff} diferentes depois do load${exs.length ? ' (' + exs.join('; ') + ')' : ''} · ${v.length} violações · save de ${size} caracteres`);
}

// ------------------------------ q7: the checker's rules ------------------------------
if (run('q7')) {
  flush(); const B = mine(); const clean = QA.yard(B); const bad = clean.slice(0, 4).map(q => `S${q[0]} ${q[1]}`); const told = [];
  const lie = (name, rx, on, off) => { let q; try { on(); flush(); q = QA.yard(B); } finally { off(); flush(); } const hit = q.filter(x => rx.test(x[1])).length; told.push(`${name}: ${hit ? 'acusa (' + hit + ')' : 'CALA'}`); if (!hit) bad.push(`o verificador cala diante de «${name}»`); };
  const a0 = At.about, p0 = PR.pieces;
  lie('lenha desenhada sem lenhador', /lenha desenhada sem lenhador/, () => { At.about = b => { const a = a0(b); return a.res ? Object.assign({}, a, { wood: true }) : a; }; }, () => { At.about = a0; });
  lie('coisas em volta de uma casa vazia', /vazia com \d+ coisa/, () => { At.about = b => (housing(b) ? Object.assign({}, a0(b), { res: 2, bench: true, wash: 2 }) : a0(b)); }, () => { At.about = a0; });
  if (!B.some(b => b.type === 'taverna')) told.push('sem taverna neste mundo'); else lie('barris de prateleira vazia', /barris desenhados e a prateleira vazia/, () => { At.about = b => (b.type === 'taverna' ? Object.assign({}, a0(b), { casks: 2 }) : a0(b)); for (const b of B) if (b.type === 'taverna') b.invKeep = b.inv; for (const b of B) if (b.type === 'taverna') b.inv = {}; }, () => { At.about = a0; for (const b of B) if (b.type === 'taverna') { b.inv = b.invKeep; delete b.invKeep; } });
  // (a piece moved by the test's hand, as a drawing gone wrong would have it: out on the street, before the door, into the wall)
  const shift = (dx, dz, pickB) => { PR.pieces = b => { const P = p0(b); if (!pickB(b) || !P.length) return P; const body = B3.propsOf(b); const o = body && body.door ? body.door.o : [0, 1]; return P.map((p, k) => (k ? p : Object.assign({}, p, { x0: p.x0 + dx(o, p, body), x1: p.x1 + dx(o, p, body), z0: p.z0 + dz(o, p, body), z1: p.z1 + dz(o, p, body) }))); }; };
  const SO = { S: [0, 1], N: [0, -1], E: [1, 0], W: [-1, 0] };
  lie('uma coisa meio metro para fora, na rua', /fora do lote|em chão que se anda/, () => shift((o, p) => SO[p.side][0] * 0.5, (o, p) => SO[p.side][1] * 0.5, housing), () => { PR.pieces = p0; });
  lie('uma coisa metida na parede', /dentro de uma parede/, () => shift((o, p) => -SO[p.side][0] * 0.3, (o, p) => -SO[p.side][1] * 0.3, housing), () => { PR.pieces = p0; });
  lie('uma coisa diante da porta', /na frente de uma porta|onde o corpo pisa|sobre os degraus/, () => { PR.pieces = b => { const P = p0(b); if (!housing(b) || !P.length) return P; const body = B3.propsOf(b); if (!body || !body.door) return P; const d = body.door, ax = d.o[1] !== 0, a = (ax ? body.x : body.z) + d.a; const k = P.findIndex(p => p.side === d.side); if (k < 0) return P;
    const p = P[k], l = ax ? p.x1 - p.x0 : p.z1 - p.z0; const q = Object.assign({}, p, ax ? { x0: a - l / 2, x1: a + l / 2 } : { z0: a - l / 2, z1: a + l / 2 }); return P.map((x, j) => (j === k ? q : x)); }; }, () => { PR.pieces = p0; });
  lie('uma casa com coisas pelo mundo e nada desenhado', /pelo mundo e nada desenhado/, () => { PR.pieces = b => (housing(b) ? (p0(b), []) : p0(b)); }, () => { PR.pieces = p0; });
  const after = QA.yard(B);
  ok(`q7 o verificador (${world}): as regras do quintal (qa/quintal-inv.js, QA.yard) limpas no mundo inteiro — e cada uma acusa a mentira contada pela mão do teste`, !bad.length && !after.length, `${B.length} prédios olhados, ${clean.length} violações · ${told.join(' · ')} · depois, ${after.length} violações${bad.length ? ' · ' + bad.join(' · ') : ''}`);
}

// ------------------------------ q8: the cost, said ------------------------------
if (run('q8')) {
  flush(); const B = mine(); const tris = g => (g ? g.attributes.position.count / 3 : 0);
  const cost = b => { const g = B3.nearGeo(b.x, b.y, 1); const n = tris(g.solid) + tris(g.glass) + tris(g.plants); for (const q in g) if (g[q]) g[q].dispose(); return n; };
  let withT = 0, without = 0, pcs = 0, hmax = 0, hsum = 0, hn = 0; const per = {};
  const P3 = G.Props3D; const base = new Map(); G.Props3D = null; try { for (const b of B) base.set(b.id, cost(b)); } finally { G.Props3D = P3; }
  for (const b of B) { const n = cost(b), d = n - base.get(b.id), np = PR.pieces(b).length; withT += n; without += base.get(b.id); pcs += np; if (np) { hn++; hsum += d; hmax = Math.max(hmax, d); const k = housing(b) ? 'casa' : b.type; (per[k] = per[k] || []).push(d); } }
  const avg = L => Math.round(L.reduce((a, q) => a + q, 0) / L.length);
  ok(`q8 o custo (${world}): os triângulos que as coisas em volta somam — por prédio e no mundo inteiro, de perto; nenhuma malha a mais (vão na geometria do pedaço do mapa)`, withT >= without && Number.isFinite(withT),
    `${B.length} casas, tavernas e olarias: ${without} triângulos sem as coisas, ${withT} com elas (+${withT - without}, ${(100 * (withT - without) / Math.max(1, without)).toFixed(1)} %) · ${pcs} coisas em ${hn} prédios: em média +${hn ? Math.round(hsum / hn) : 0} triângulos por prédio com coisas, no máximo +${hmax} · ${Object.keys(per).map(k => `${k} +${avg(per[k])} (${per[k].length})`).join(', ')} · malhas a mais: 0 · de longe: nada`);
}

const e = M.erros(); const clean = M.limpo();
ok('sem erro de módulo nem aviso no console', clean, clean ? 'limpo' : JSON.stringify(e).slice(0, 300));
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
