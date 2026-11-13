// roupa: what a person wears and how they carry themselves, read from the world (Bairros Vivos, BV-4 — D-162) — in Node, the
// simulation of qa/nodemundo.js with three.js and the 3D's own files after it (as qa/visual/tres-node.js loads them):
//   node qa/roupa.js [mundo]          (default: the ready world «metropole»;  ONLY=r1,r4 runs some)
// The clothes are People3D's own (P3.outfit), their inputs G.Atmos.dress, the god's view Art.rank — nothing here is a copy.
//   r1  o grupo        the same person noble, merchant, craftsman and of the plain people, in each people: the mantle, the
//                      cut, the metal and the trim tell them apart — and the figure far off too
//   r2  o indivíduo    two of the same trade, standing and people do not dress alike; who dresses out of their station
//                      (one in a dozen, by the id) goes on doing it; the same person twice is the same
//   r3  a época        a people with and without its loom, with and without cloth in the store: woven and dyed, or hides
//                      and the fleece undyed; silk only where the people have it and the house is rich; the helmet of the
//                      metal the people forge
//   r4  o frio         the god's sudden winter over someone in the street: a cloak, a hood, nothing bare — and indoors, off
//   r5  a bebedeira    who drank too much weaves in the 3D (the body's pose, frame after frame) and who did not does not;
//                      where they stand in the world is the same
//   r6  só desenha     everyone dressed, a hundred frames drawn, the god's reading asked: the world is the same to the
//                      last number (the canonical state, the save, every person and building, the world's chance)
//   r7  o save         saved and loaded in the middle: everyone dressed as before
//   r8  o deus         the god's view reads the same standing (Art.rank): the noble's mantle in the 3D's own dye, the
//                      merchant's sash, the hood of the cold — painted (a canvas that records its colours)
//   r9  o verificador  the rules of qa/atmos-inv.js for the clothes, along a lived stretch with a drunk in the street and
//                      the god's winter over it: clean — and each accuses a lie told by the test's hand
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
const P3 = G.People3D, At = G.Atmos, A3 = G.Anim3D;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | roupa ${name} | ${info}`); if (!c) fails.push(name); };
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean); const run = k => !ONLY.length || ONLY.includes(k);
const WORLD = process.argv[2] || 'metropole';
M.pronto(WORLD);
let S = G.S; const TL = G.Space.TILE;
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
// the world to the last number: the canonical state, the save, every person and building as they are, the world's chance
const plain = o => JSON.stringify(o, (k, v) => (v instanceof Map ? [...v] : v instanceof Set ? [...v] : ArrayBuffer.isView(v) ? v.length : v));
const world = () => ({ canon: hash(JSON.stringify(QA.canon())), save: hash(G.Save.serialize()), people: hash(plain([...S.villagers.values()])), builds: hash(plain([...S.buildings.values()])), rng: plain(S.rng) });
const same = (a, b) => Object.keys(a).filter(k => a[k] !== b[k]);
// what of an outfit shows (its cache's own stamp aside)
const SHOW = ['cloth', 'over', 'cloak', 'trim', 'pants', 'metal', 'hat', 'beads', 'belt', 'cloakM', 'hatM', 'topM', 'skirt', 'sleeve', 'legs', 'torso', 'motif', 'cloakTrim', 'overK', 'feetK', 'strap', 'fur', 'fab', 'fabO', 'hairM', 'beard', 'beltH', 'bootTop'];
const shown = o => SHOW.map(k => k + '=' + o[k]).join(' ');
const civOf = v => { const f = G.Fac.ofV(v); return f ? f.civ : '?'; };
const adults = () => [...S.villagers.values()].filter(v => v.age >= 20 && v.age < 48 && !v.captive && !v.robe && !v.aboard).sort((a, b) => a.id - b.id);
const ruler = v => { const f = G.Fac.ofV(v); return !!f && f.leader === v.id; };
const PLAIN = { lenhador: 1, coletor: 1, agricultor: 1, construtor: 1, mineiro: 1 };
// (a cloak that is the people's own dress, whatever one's standing: the tilmatli knotted on the shoulder of every man of the jungle)
const ownCloak = v => civOf(v) === 'asteca' && v.g === 'm';
// (a factor alone: the test's hand on Atmos's reading of the cold — the clothes of r1 to r3 in a mild street)
const mild = fn => { const c = At.cold; At.cold = () => 0; try { return fn(); } finally { At.cold = c; } };
const flush = () => { At.flush(); };

// ------------------------------ r1: the standing ------------------------------
if (run('r1')) mild(() => {
  const info = [], bad = []; let n = 0;
  for (const civ of ['nordico', 'grego', 'romano', 'egipcio', 'asteca']) {
    for (const g of ['m', 'f']) {
      const v = adults().find(o => civOf(o) === civ && o.g === g && PLAIN[o.role] && !ruler(o) && !At.odd(o.id)); if (!v) continue;
      const grp0 = v.grp; const O = {}, far = {};
      for (const k of ['nobreza', 'mercadores', 'artesaos', 'povo']) { v.grp = k; flush(); const L = P3.look(v); O[k] = Object.assign({}, L.out); far[k] = P3.farCol(L); }
      v.grp = grp0; flush(); n++;
      const tag = `${civ} ${g} #${v.id}`;
      // the noble: the mantle (on the Nile the wig and the collar of gold), the highest rank, the woven band where the people weave
      const nb = O.nobreza, mc = O.mercadores, ar = O.artesaos, pv = O.povo;
      if (nb.rank !== 3 || mc.rank !== 2 || ar.rank !== 1 || pv.rank !== 0) bad.push(`${tag}: postos ${nb.rank}/${mc.rank}/${ar.rank}/${pv.rank}`);
      if (civ === 'egipcio' ? !(nb.hairM === 'peruca' && nb.beads !== pv.beads) : !nb.cloakM) bad.push(`${tag}: o nobre sem o manto (${nb.cloakM}, ${nb.hairM})`);
      if (civ !== 'egipcio' && !mc.cloakM) bad.push(`${tag}: o mercador sem a capa`);
      if (!mc.strap) bad.push(`${tag}: o mercador sem a alça da bolsa`);
      if (pv.cloakM && !ownCloak(v)) bad.push(`${tag}: o povo de manto (${pv.cloakM})`);
      if (ar.sleeve > 0.42 + 1e-9 || !(ar.beltH > pv.beltH)) bad.push(`${tag}: o artesão de manga comprida (${ar.sleeve}) ou sem o cinto largo (${ar.beltH})`);
      // each one's picture differs from the others'
      const S4 = [shown(nb), shown(mc), shown(ar), shown(pv)]; if (new Set(S4).size !== 4) bad.push(`${tag}: ${4 - new Set(S4).size} grupos vestidos igual`);
      // the metal: gold or silver on the noble of a people that has metal, never the bronze of a buckle
      if (At.dress(v).metal > 0 && nb.metal !== '#d8b04a' && nb.metal !== '#c8ccd2') bad.push(`${tag}: o nobre de ${nb.metal}`);
      // from afar, where the people weave: the dye of the noble's mantle and of the merchant's cape, not the plain people's cloth
      if (At.dress(v).weave && civ !== 'egipcio' && (far.nobreza === far.povo || far.mercadores === far.povo)) bad.push(`${tag}: de longe, igual ao povo (${far.nobreza}, ${far.mercadores}, ${far.povo})`);
      if (info.length < 5) info.push(`${tag}: nobre ${nb.cloakM || nb.hairM}/${nb.cloak} · mercador ${mc.cloakM || '-'}/${mc.cloak} · artesão manga ${ar.sleeve} · povo ${pv.cloakM || 'sem manto'}`);
    }
  }
  ok('r1 o grupo: a mesma pessoa nobre, mercadora, artesã e do povo, em cada povo — o manto, o corte, o metal e a guarnição dizem quem é, de perto e de longe', n >= 6 && !bad.length, `${n} pessoas × 4 grupos${bad.length ? ' · ' + bad.slice(0, 4).join(' · ') : ''} · ${info.join(' | ')}`);
});

// ------------------------------ r2: the person ------------------------------
if (run('r2')) mild(() => {
  // two of the same trade, standing, sex and people
  const by = new Map(); for (const v of adults()) { if (ruler(v)) continue; const k = `${civOf(v)}|${v.role}|${v.grp}|${v.g}`; if (!by.has(k)) by.set(k, []); by.get(k).push(v); }
  let pairs = 0, alike = 0; const ex = [];
  for (const [k, L] of by) for (let i = 0; i + 1 < L.length && i < 6; i++) { pairs++; const a = shown(P3.outfit(L[i])), b = shown(P3.outfit(L[i + 1])); if (a === b) { alike++; if (ex.length < 3) ex.push(`${k} #${L[i].id}/#${L[i + 1].id}`); } }
  // the same person twice — and with the cache thrown away between — is the same
  // (a mark the outfit's stamp has and these clothes do not show — the order's mask — turned and turned back: dressed anew)
  let twice = 0, n = 0; for (const v of adults().slice(0, 120)) { n++; const a = shown(P3.outfit(v)); const u = v.unmask; v.unmask = !u; P3.outfit(v); v.unmask = u; const b = shown(P3.outfit(v)); if (a !== b) twice++; }
  // out of their station: one in a dozen of the plain people wears a cape of colour, of the high ones dresses plainly — the id's
  const low = adults().filter(v => (v.grp === 'povo' || v.grp === 'artesaos') && PLAIN[v.role] && v.age < 50), high = adults().filter(v => (v.grp === 'nobreza' || v.grp === 'mercadores') && PLAIN[v.role] && !ruler(v) && v.age < 50);
  const oddLow = low.filter(v => At.odd(v.id)), oddHigh = high.filter(v => At.odd(v.id));
  const lowOut = oddLow.filter(v => !!P3.outfit(v).cloakM).length, lowIn = low.filter(v => !At.odd(v.id) && (!P3.outfit(v).cloakM || ownCloak(v))).length, plainLow = low.length - oddLow.length;
  const highPlain = oddHigh.filter(v => P3.outfit(v).rank < 2).length;
  const share = (oddLow.length + oddHigh.length) / Math.max(1, low.length + high.length);
  ok('r2 o indivíduo: dois do mesmo ofício, grupo e povo não se vestem iguais; a mesma pessoa é sempre a mesma; quem foge do padrão (um em doze, pelo id) foge sempre',
    pairs >= 20 && alike <= pairs * 0.05 && twice === 0 && lowOut === oddLow.length && lowIn === plainLow && highPlain === oddHigh.length && share > 0.02 && share < 0.2,
    `${pairs} pares, ${alike} iguais${ex.length ? ' (' + ex.join(', ') + ')' : ''} · ${n} pessoas vestidas duas vezes, ${twice} diferentes · fora do padrão ${oddLow.length + oddHigh.length} de ${low.length + high.length} (${(share * 100).toFixed(1)}%): ${lowOut}/${oddLow.length} do povo de capa, ${highPlain}/${oddHigh.length} dos altos sem o manto; ${lowIn}/${plainLow} do povo sem manto`);
});

// ------------------------------ r3: what the people can make ------------------------------
if (run('r3')) mild(() => {
  const info = []; const bad = [];
  const looms = f => [...S.buildings.values()].filter(b => b.type === 'tecelagem' && b.built && (S.settlements.get(b.set) || {}).fac === f.id);
  const people = f => adults().filter(v => G.Fac.ofV(v) === f && !ruler(v));
  // a people with looms: woven and dyed; its looms gone (the test's hand) and no cloth in the store: hides and the fleece; back: as before
  const fl = [...S.factions.values()].filter(f => f.alive && looms(f).length).sort((a, b) => a.id - b.id)[0];
  if (!fl) bad.push('nenhum povo com tear neste mundo');
  else {
    const P = people(fl); const L = looms(fl); const t0 = fl.stock.tecido;
    const w0 = P.filter(v => P3.outfit(v).raw).length, before = P.map(v => shown(P3.outfit(v)));
    for (const b of L) b.built = false; fl.stock.tecido = 0; flush();
    const w1 = P.filter(v => P3.outfit(v).raw).length; const dyed = P.filter(v => P3.outfit(v).motif || P3.outfit(v).cloakTrim).length;
    fl.stock.tecido = 3; flush(); const w2 = P.filter(v => P3.outfit(v).raw).length; // (cloth in the store, come by trade)
    for (const b of L) b.built = true; fl.stock.tecido = t0; flush();
    const back = P.filter((v, k) => shown(P3.outfit(v)) !== before[k]).length;
    if (w0 !== 0 || w1 !== P.length || dyed || w2 !== 0 || back) bad.push(`${fl.name}: cru ${w0} com tear, ${w1}/${P.length} sem tear e sem pano (${dyed} com faixa tecida), ${w2} com pano no armazém; ${back} não voltaram`);
    info.push(`${fl.name} (${L.length} tear(es), ${P.length} pessoas): cru ${w0} → ${w1} sem tear → ${w2} com pano no armazém → de volta ${back === 0 ? 'igual' : back + ' diferentes'}`);
    // (what shows of «raw»: no dye — the cloth among the fleece's and the hide's own colours)
    for (const b of L) b.built = false; fl.stock.tecido = 0; flush();
    const v = P.find(o => PLAIN[o.role]); const o = v ? P3.outfit(v) : null; const RAWC = ['#b9aa8c', '#a39478', '#8c7c64', '#c4b79c', '#97886c', '#6e5236', '#7c5c3c', '#5e452e'];
    if (o && !(RAWC.includes(o.cloth) && (o.fab === 1 || o.fab === 3))) bad.push(`#${v.id} cru de ${o.cloth}, tecido ${o.fab}`);
    for (const b of L) b.built = true; fl.stock.tecido = t0; flush();
    // (what a people can make is asked again with the day, nobody telling Atmos: the looms down and the store without cloth
    // by the test's hand — the same day, dressed as before; the day turned, hides)
    { const d0 = S.day; const a0 = P.filter(q => P3.outfit(q).raw).length; for (const b of L) b.built = false; fl.stock.tecido = 0; const a1 = P.filter(q => P3.outfit(q).raw).length; S.day = d0 + 1; const a2 = P.filter(q => P3.outfit(q).raw).length;
      for (const b of L) b.built = true; fl.stock.tecido = t0; S.day = d0; flush();
      if (a0 !== 0 || a1 !== 0 || a2 !== P.length) bad.push(`${fl.name}: sem tear nem pano, de cru ${a1} no mesmo dia e ${a2}/${P.length} virado o dia (antes ${a0})`); info.push(`o dia virado sem tear nem pano: cru ${a0} → ${a1} no mesmo dia → ${a2} no dia seguinte`); }
  }
  // silk: only where the people have it and the house is rich
  const fs2 = [...S.factions.values()].filter(f => f.alive && people(f).length > 20).sort((a, b) => a.id - b.id).find(f => looms(f).length) || fl;
  if (fs2) {
    const P = people(fs2).filter(v => v.role !== 'guerreiro'); const s0 = fs2.stock.seda; const richOf = v => { const h = S.buildings.get(v.home); return !!h && (!!h.elite || (h.coin || 0) > 40 || (h.inv && h.inv.seda >= 1)); };
    fs2.stock.seda = 0; flush(); const none = P.filter(v => P3.outfit(v).silk && !(S.buildings.get(v.home) && S.buildings.get(v.home).inv && S.buildings.get(v.home).inv.seda >= 1)).length;
    fs2.stock.seda = 6; flush(); const rich = P.filter(richOf), poor = P.filter(v => !richOf(v));
    const rs = rich.filter(v => P3.outfit(v).silk).length, ps = poor.filter(v => P3.outfit(v).silk).length;
    fs2.stock.seda = s0; flush();
    if (none || ps || (rich.length && rs !== rich.length)) bad.push(`seda: ${none} sem o povo ter seda; com seda, ${rs}/${rich.length} das casas ricas e ${ps}/${poor.length} das outras`);
    info.push(`seda em ${fs2.name}: sem seda no povo ${none}; com seda ${rs}/${rich.length} das casas ricas, ${ps}/${poor.length} das outras`);
  }
  // the helmet of the metal the people forge
  const w = [...S.villagers.values()].filter(v => v.role === 'guerreiro' && v.age >= 18 && !v.captive && !ruler(v) && civOf(v) !== 'egipcio' && civOf(v) !== 'asteca').sort((a, b) => a.id - b.id)[0];
  if (!w) info.push('sem guerreiro de elmo neste mundo');
  else {
    const f = G.Fac.ofV(w); const K = f.tech.known; const k0 = Object.assign({}, K); const civ = f.civ;
    const helm = () => { flush(); const o = P3.outfit(w); return `${o.hatM || 'cabeça nua'} ${o.hat}`; };
    delete K.bronze; delete K.ferro; const h0 = helm(); K.bronze = 1; const h1 = helm(); K.ferro = 2; const h2 = helm();
    for (const k of Object.keys(K)) delete K[k]; Object.assign(K, k0); flush();
    const metal0 = /elmo|galea/.test(h0), bronze = h1.endsWith('#b08a4a'), iron = civ === 'grego' ? h2.endsWith('#b08a4a') : h2.endsWith('#8a8e96');
    if (metal0 || !bronze || !iron) bad.push(`o elmo de #${w.id} (${civ}): sem bronze «${h0}», com bronze «${h1}», com ferro «${h2}»`);
    info.push(`elmo (${civ}): sem bronze «${h0}» · bronze «${h1}» · ferro «${h2}»`);
  }
  ok('r3 a época: o povo com tear (ou pano no armazém) veste tecido tingido, sem eles couro e lã crua; seda só onde o povo tem seda e a casa é rica; o elmo do metal que o povo forja', !bad.length, (bad.length ? bad.join(' · ') + ' · ' : '') + info.join(' | '));
});

// ------------------------------ r4: the cold ------------------------------
if (run('r4')) {
  // someone of a warm land out in the street, by day; the god's sudden winter over them
  const tp = v => (S.temp ? S.temp[G.W.idx(v.x, v.y)] / 255 : 0.5);
  M.viver(0.1); while (G.isNight() || S.time < 0.2 || S.time > 0.55) M.viver(5);
  const cand = adults().filter(v => !v.inside && !ruler(v) && PLAIN[v.role] && tp(v) > 0.5 && At.cold(v.x, v.y) === 0 && G.W.inb(v.x, v.y) && S.type[G.W.idx(v.x, v.y)] > G.T.SEA);
  const v = cand.find(o => civOf(o) === 'egipcio' && o.g === 'm') || cand.find(o => civOf(o) === 'asteca' && o.g === 'm') || cand[0];
  if (!v) ok('r4 o frio', false, 'ninguém numa rua amena neste mundo');
  else {
    const o0 = Object.assign({}, P3.outfit(v)); const x = v.x, y = v.y;
    S.faith = 999; const cast = G.Powers.cast('winter', x, y); M.viver(4);
    // (held where the winter fell, out of doors: the test's hand — the world would walk them on)
    v.x = x; v.y = y; const in0 = v.inside; v.inside = 0; flush();
    const c = At.cold(x, y), o1 = Object.assign({}, P3.outfit(v));
    v.inside = v.home || 1; flush(); const o2 = Object.assign({}, P3.outfit(v)); v.inside = in0; flush();
    const covered = o1.cloakM && o1.torso === 0 && o1.sleeve >= 0.4 && o1.feetK === 0 && (o1.hatM === 'capuz' || o1.hatM === 'gorro' || (o1.hatM && o1.hatM !== 'chapeu' && o1.hatM !== 'lenco')) && o1.cold === 2;
    ok('r4 o frio: sob o Inverno Súbito, quem está na rua põe manto e capuz, nada de peito nu, manga curta ou pé no chão — e dentro de casa tira',
      cast && c === 2 && !o0.cold && covered && !o2.cold && shown(o2) === shown(o0),
      `${v.name} #${v.id} (${civOf(v)}): antes ${o0.cloakM || 'sem manto'}/${o0.hatM || 'sem chapéu'}, peito ${o0.torso}, manga ${o0.sleeve}, pés ${o0.feetK} · no inverno (frio ${c}) ${o1.cloakM}/${o1.hatM}, peito ${o1.torso}, manga ${o1.sleeve}, pés ${o1.feetK} · dentro de casa ${o2.cloakM || 'sem manto'}/${o2.hatM || 'sem chapéu'}`);
  }
}

// ------------------------------ r5: the drink ------------------------------
if (run('r5')) {
  // two grown people standing in the street near one another; one of them drunk (the tavern's own mark: v.drunk)
  // (standing, or walking: with no gesture of a task — one in the middle of a stroke of work bends more than any drunk, and the
  // sober one of the case was «0.00 e 0.68» of sway and lean: T-852)
  const out = adults().filter(v => !v.inside && !v.sleeping && !v.act && G.W.inb(v.x, v.y) && !(v.drunk > S.clock));
  let a = null, b = null; for (const p of out) { const q = out.find(o => o !== p && G.dist(o.x, o.y, p.x, p.y) < 6); if (q) { a = p; b = q; break; } }
  if (!a) ok('r5 a bebedeira', false, 'ninguém de pé na rua perto de outro');
  else {
    const at = v => [v.x, v.y, v.face, v.moving, JSON.stringify(v.path || null)].join('|');
    a.drunk = S.clock + 200; a.drinks = 3; const w0 = [at(a), at(b)];
    const focus = { X: a.x * TL, Y: 0, Z: a.y * TL }; let ma = 0, mb = 0, na = 0, off = 0, face = 0;
    const span = (id, f) => { let lo = 1e9, hi = -1e9; return { put() { const s = P3.visOf(id); if (!s) return; const x = f(s); lo = Math.min(lo, x); hi = Math.max(hi, x); }, get: () => hi - lo }; };
    const sa = span(a.id, s => s.pose.sway), sb = span(b.id, s => s.pose.sway), la = span(a.id, s => s.pose.lean), lb = span(b.id, s => s.pose.lean);
    for (let k = 0; k < 200; k++) { P3.update(1 / 30, focus); sa.put(); sb.put(); la.put(); lb.put(); const s = P3.visOf(a.id); if (s) { na++; off = Math.max(off, Math.hypot(s.X - a.x * TL, s.Z - a.y * TL)); } }
    ma = sa.get(); mb = sb.get();
    const moved = [at(a), at(b)].filter((q, k) => q !== w0[k]).length;
    const La = P3.look(a), Lb = P3.look(b);
    const god = Math.abs(G.Court.sway(a)) >= 0 && G.Court.sway(b) === 0; // (the god's view weaves the same one)
    const errs = P3.check();
    a.drunk = 0; a.drinks = 0;
    ok('r5 a bebedeira: quem bebeu demais cambaleia no 3D — o tronco de um lado ao outro, a cabeça pendendo, o rosto corado — e quem não bebeu não; onde pisam no mundo é o mesmo',
      na >= 150 && ma > 0.2 && mb < 0.1 && la.get() > lb.get() + 0.05 && moved === 0 && off < 1e-6 && La.drunk > 0 && !Lb.drunk && La.mood && La.mood.blush > 0.3 && god && !errs.length,
      `${a.name} #${a.id} bêbado: o tronco balança ${ma.toFixed(2)} rad, a curvatura ${la.get().toFixed(2)}; ${b.name} #${b.id} sóbrio: ${mb.toFixed(2)} e ${lb.get().toFixed(2)} · ${na} quadros desenhados onde o mundo o tem (desvio ${off.toFixed(4)} m), ${moved} mudanças no mundo · rosto ${JSON.stringify(La.mood)}${errs.length ? ' · ' + errs[0] : ''}`);
  }
}

// ------------------------------ r6: only seen ------------------------------
if (run('r6')) {
  const w0 = world(); let n = 0, frames = 0, ranks = 0;
  for (const v of S.villagers.values()) { P3.outfit(v); At.dress(v); At.drunk(v); if (G.Art.rank(v)) ranks++; n++; }
  const who = [...S.villagers.values()].find(v => !v.inside && G.W.inb(v.x, v.y)); const focus = { X: who.x * TL, Y: 0, Z: who.y * TL };
  for (let k = 0; k < 100; k++) { P3.update(1 / 30, focus); frames++; }
  const d = same(w0, world());
  ok('r6 só desenha: toda a gente vestida, cem quadros desenhados e a leitura do deus pedida — o mundo igual até o último número (o canônico, o save, cada pessoa e prédio, o acaso do mundo)', !d.length && n > 50, `${n} pessoas vestidas, ${frames} quadros, ${ranks} leituras do deus com o que mostrar · ${d.length ? 'mudou: ' + d.join(', ') : 'nada mudou'}`);
}

// ------------------------------ r7: saved and loaded in the middle ------------------------------
if (run('r7')) {
  M.viver(3);
  const pic = () => { const m = new Map(); for (const v of S.villagers.values()) m.set(v.id, [shown(P3.outfit(v)), v.inside ? 1 : 0]); return m; };
  const a = pic(); const size = M.salvarCarregar(); S = G.S; const b = pic();
  let diff = 0, moved = 0; const ex = [];
  for (const [id, [o, ins]] of a) { const q = b.get(id); if (!q) { diff++; continue; } if (q[1] !== ins) { moved++; continue; } if (q[0] !== o) { diff++; if (ex.length < 2) ex.push(`#${id}: ${o.slice(0, 90)} → ${q[0].slice(0, 90)}`); } }
  ok('r7 o save no meio: salvo e carregado, cada um vestido como antes', a.size === b.size && diff === 0 && M.limpo(), `${a.size} pessoas, ${diff} vestidas diferente${ex.length ? ' (' + ex.join(' | ') + ')' : ''}; ${moved} que o save pôs à porta (dentro ↔ fora: o frio da rua) ficaram de fora da conta · save de ${size} caracteres`);
}

// ------------------------------ r8: the god's view ------------------------------
if (run('r8')) mild(() => {
  // a canvas that keeps the colours it is asked to fill with
  const canvas = () => { const fills = []; const fn = () => proxy; const proxy = new Proxy(function () { }, { get(t, k) { if (k === 'fills') return fills; if (typeof k === 'symbol') return undefined; return fn; }, set(t, k, v) { if (k === 'fillStyle') fills.push(String(v)); return true; }, apply() { return proxy; } }); return proxy; };
  const paint = (v, lod) => { const c = canvas(); G.Art.villager(c, v, 0, 0, 0, !!lod); return c.fills; };
  const bad = []; let nob = 0, mer = 0, pov = 0;
  for (const v0 of adults().filter(o => !ruler(o) && PLAIN[o.role] && !At.odd(o.id)).slice(0, 60)) {
    const v = Object.assign({}, v0, { _civ: civOf(v0), act: '', moving: false, inside: 0, sleeping: false, emo: null });
    const weave = At.dress(v0).weave;
    for (const k of ['nobreza', 'mercadores', 'povo']) {
      v.grp = k; const r = G.Art.rank(v); const f = paint(v), fl = paint(v, true);
      const dye = k === 'nobreza' ? (weave ? At.deep(v.id, v._civ) : '#6e5236') : k === 'mercadores' ? (weave ? At.bright(v.id) : '#6e5236') : null;
      if (k === 'povo') { pov++; if (r) bad.push(`#${v.id} povo com leitura ${JSON.stringify(r)}`); continue; }
      if (k === 'nobreza') nob++; else mer++;
      if (!r || r.k !== k || r.col !== dye) bad.push(`#${v.id} ${k}: leitura ${JSON.stringify(r)}, a tinta do 3D ${dye}`);
      else if (!f.includes(dye) || !fl.includes(dye)) bad.push(`#${v.id} ${k}: a tinta ${dye} não foi pintada (perto ${f.includes(dye)}, longe ${fl.includes(dye)})`);
      // (and it is the 3D's own dye: the mantle's, before the wool softens it)
      if (k === 'nobreza' && weave) { const g0 = v0.grp; v0.grp = k; flush(); const o = P3.outfit(v0); v0.grp = g0; flush(); if (civOf(v0) !== 'egipcio' && civOf(v0) !== 'romano' && !o.cloakM) bad.push(`#${v.id}: o 3D sem manto para o nobre`); }
    }
  }
  // the cold: a hood painted over a head in the freezing street
  const v1 = adults().find(o => !ruler(o) && PLAIN[o.role] && !At.odd(o.id)); let hood = false, none = true;
  if (v1) { const v = Object.assign({}, v1, { _civ: civOf(v1), act: '', moving: false, inside: 0, sleeping: false, emo: null, grp: 'povo' }); none = !G.Art.rank(v); const c = At.cold; At.cold = () => 2; try { const r = G.Art.rank(v); hood = !!r && r.cold === 2 && paint(v).filter(q => q === r.cloak).length >= 2; } finally { At.cold = c; } }
  ok('r8 o deus: a vista do deus lê o mesmo grupo (Art.rank) — o manto do nobre na tinta do 3D, a faixa do mercador, de perto e de longe; o povo sem marca; no frio de rachar, o manto e o capuz pintados', nob >= 10 && mer >= 10 && !bad.length && hood && none, `${nob} nobres, ${mer} mercadores e ${pov} do povo pintados${bad.length ? ' · ' + bad.slice(0, 3).join(' · ') : ''} · capuz no frio ${hood ? 'pintado' : 'não'}`);
});

// ------------------------------ r9: the checker's rules ------------------------------
if (run('r9')) {
  const atm = () => QA.check().filter(q => q.sys === 'atmos' && !/fum|fogo|janela|vazia|lenha/.test(q.msg));
  const bad = []; let looks = 0;
  // (a drunk — the tavern's own mark, by the test's hand — and the god's sudden winter over a street; then the world lived)
  const out = adults().filter(v => !v.inside && !v.sleeping && G.W.inb(v.x, v.y));
  const d = out[0]; if (d) { d.drunk = S.clock + 90; d.drinks = 3; S.faith = 999; G.Powers.cast('winter', d.x, d.y); }
  for (let k = 0; k < 8; k++) { M.viver(6); const q = atm(); looks++; for (const x of q.slice(0, 2)) bad.push(`S${x.sev} ${x.msg}`); }
  const told = [];
  const lie = (name, rx, on, off) => { let q; try { on(); q = atm(); } finally { off(); flush(); } const hit = q.filter(x => rx.test(x.msg)).length; told.push(`${name}: ${hit ? 'acusa' : 'CALA'}`); if (!hit) bad.push(`o verificador cala diante de «${name}»`); };
  const d0 = At.dress, k0 = At.drunk;
  lie('todos vestidos de povo', /veste-se como povo/, () => { At.dress = () => At.NEUTRAL; }, () => { At.dress = d0; });
  lie('o agasalho dentro de casa', /agasalhado para o frio da rua dentro/, () => { At.dress = v => (v.inside ? Object.assign({}, d0(v), { cold: 2 }) : d0(v)); }, () => { At.dress = d0; });
  lie('todos cambaleando', /cambaleando sem ter bebido/, () => { At.drunk = () => 0.6; }, () => { At.drunk = k0; });
  lie('o bêbado andando reto', /bêbado sem cambalear/, () => { const v = [...S.villagers.values()][0]; v.drunk = S.clock + 50; At.drunk = () => 0; }, () => { At.drunk = k0; [...S.villagers.values()][0].drunk = 0; });
  const after = atm();
  ok('r9 o verificador: as regras do qa/atmos-inv.js para a roupa limpas com um bêbado na rua e o inverno do deus — e cada uma acusa a mentira contada pela mão do teste', !!d && !bad.length && !after.length && looks >= 8,
    `${looks} olhadas ao longo de ${looks * 6} s de mundo · ${told.join(' · ')} · depois, ${after.length} violações${bad.length ? ' · ' + bad.slice(0, 5).join(' · ') : ' · nenhuma violação'}`);
}

const e = M.erros(); const clean = M.limpo();
ok('sem erro de módulo nem aviso no console', clean, clean ? 'limpo' : JSON.stringify(e).slice(0, 300));
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
