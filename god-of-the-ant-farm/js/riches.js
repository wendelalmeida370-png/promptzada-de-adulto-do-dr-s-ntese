'use strict';
// ============================================================
//  Riches: what the land, the beasts and the sea give besides
//  bread and timber. Ivory and pelts, a white tiger's hide worth
//  a house, snake and crocodile leather, rhino horn and plumes;
//  honey, wax and silk; cacao, coffee, spices, dates, incense,
//  oil and wine; salt, cod, tuna, shrimp, pearls and coral.
//  Hunters skin the kill where it fell and come home with the
//  meat on one shoulder and the hide on the other; rich houses
//  want what is rare; hungry towns eat their salted reserves.
// ============================================================
(function (G) {
  const R = G.Riches = {};
  const E = G.Eco;
  const TAU = Math.PI * 2;
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);
  const DAY = () => G.DAY_LEN;

  // ------------------------------ the catalogue ------------------------------
  // cat: where it comes from · tier: comum < fino < luxo < raro · ed: food it makes when a town starves
  // g/pl: grammar (o marfim, as peles) · from: how people describe its source
  R.GOODS = {
    marfim: { name: 'marfim', title: 'Marfim', price: 7, col: '#f2ead2', cat: 'animal', tier: 'luxo', g: 'm', from: 'as presas de elefantes e morsas' },
    peles: { name: 'peles', title: 'Peles', price: 3.2, col: '#8a6a4a', cat: 'animal', tier: 'fino', g: 'f', pl: 1, from: 'lobos, ursos, raposas e focas' },
    pele_rara: { name: 'peles raras', title: 'Peles raras', price: 30, col: '#f4f0e6', cat: 'animal', tier: 'raro', g: 'f', pl: 1, from: 'feras de pelagem rara' },
    couro_exotico: { name: 'couro exótico', title: 'Couro exótico', price: 4.5, col: '#6a7a3a', cat: 'animal', tier: 'fino', g: 'm', from: 'crocodilos e serpentes' },
    chifre: { name: 'chifre de rinoceronte', title: 'Chifre', price: 12, col: '#8a8478', cat: 'animal', tier: 'luxo', g: 'm', from: 'os rinocerontes da savana' },
    plumas: { name: 'plumas', title: 'Plumas', price: 3, col: '#e84a6a', cat: 'animal', tier: 'fino', g: 'f', pl: 1, from: 'avestruzes e araras' },
    mel: { name: 'mel', title: 'Mel', price: 1.4, col: '#e8a82a', cat: 'animal', tier: 'comum', g: 'm', ed: 2, from: 'as colmeias' },
    cera: { name: 'cera', title: 'Cera', price: 1.1, col: '#f2d878', cat: 'animal', tier: 'comum', g: 'f', from: 'os favos' },
    seda: { name: 'seda', title: 'Seda', price: 6.5, col: '#f6eede', cat: 'animal', tier: 'luxo', g: 'f', from: 'o bicho-da-seda, que come folha de amoreira' },
    oleo: { name: 'óleo', title: 'Óleo', price: 2.4, col: '#c8a04a', cat: 'mar', tier: 'fino', g: 'm', from: 'a gordura de baleias e focas' },
    queijo: { name: 'queijo', title: 'Queijo', price: 1.3, col: '#f2d06a', cat: 'animal', tier: 'comum', g: 'm', ed: 3, from: 'o leite do rebanho' },
    carne_seca: { name: 'carne-seca', title: 'Carne-seca', price: 1.2, col: '#8a3a2a', cat: 'animal', tier: 'comum', g: 'f', ed: 3, from: 'a carne salgada ao sol' },
    cacau: { name: 'cacau', title: 'Cacau', price: 4, col: '#c87a2a', cat: 'planta', tier: 'luxo', g: 'm', from: 'os cacaueiros da selva' },
    cafe: { name: 'café', title: 'Café', price: 3.6, col: '#6a3a22', cat: 'planta', tier: 'fino', g: 'm', from: 'os cafezais' },
    especiarias: { name: 'especiarias', title: 'Especiarias', price: 5.5, col: '#c8502a', cat: 'planta', tier: 'luxo', g: 'f', pl: 1, from: 'pimenteiras e ervas da selva' },
    azeite: { name: 'azeite', title: 'Azeite', price: 2.2, col: '#a8a83a', cat: 'planta', tier: 'fino', g: 'm', ed: 1, from: 'as oliveiras' },
    vinho: { name: 'vinho', title: 'Vinho', price: 2.6, col: '#7a1a3a', cat: 'planta', tier: 'fino', g: 'm', from: 'os vinhedos' },
    tamaras: { name: 'tâmaras', title: 'Tâmaras', price: 1.4, col: '#a8602a', cat: 'planta', tier: 'comum', g: 'f', pl: 1, ed: 2, from: 'as tamareiras dos oásis' },
    incenso: { name: 'incenso', title: 'Incenso', price: 4.5, col: '#e8dca0', cat: 'planta', tier: 'luxo', g: 'm', from: 'a resina do olíbano do deserto' },
    sal: { name: 'sal', title: 'Sal', price: 0.9, col: '#f4f4f0', cat: 'mar', tier: 'comum', g: 'm', from: 'as salinas' },
    bacalhau: { name: 'bacalhau', title: 'Bacalhau', price: 2.2, col: '#d8d0b8', cat: 'mar', tier: 'fino', g: 'm', ed: 3, from: 'os mares gelados' },
    atum: { name: 'atum', title: 'Atum', price: 1.8, col: '#3a5a8a', cat: 'mar', tier: 'comum', g: 'm', ed: 3, from: 'os mares quentes' },
    camarao: { name: 'camarão', title: 'Camarão', price: 1.6, col: '#f08a6a', cat: 'mar', tier: 'comum', g: 'm', ed: 2, from: 'os mangues e as águas rasas' },
    perolas: { name: 'pérolas', title: 'Pérolas', price: 15, col: '#f4f0ea', cat: 'mar', tier: 'raro', g: 'f', pl: 1, from: 'as ostras dos recifes' },
    coral: { name: 'coral', title: 'Coral', price: 6, col: '#e8584a', cat: 'mar', tier: 'luxo', g: 'm', from: 'os recifes quentes' },
  };
  const GD = R.GOODS;
  R.KEYS = Object.keys(GD);
  R.is = k => !!GD[k];
  R.LUX = R.KEYS.filter(k => GD[k].tier === 'luxo' || GD[k].tier === 'raro');
  // "o marfim", "as peles": the article for a sentence
  R.art = k => { const g = GD[k]; if (!g) return 'o'; return (g.g === 'f' ? 'a' : 'o') + (g.pl ? 's' : ''); };
  R.the = k => R.art(k) + ' ' + (GD[k] ? GD[k].name : E.name(k));
  // into the economy: stock, prices, the realm panel
  for (const k of R.KEYS) {
    E.GOODS[k] = GD[k]; if (!E.KEYS.includes(k)) E.KEYS.push(k);
    E.PRICE[k] = GD[k].price; G.Fac._nullStock[k] = 0;
  }
  // shop shelves: the market sells the fine things, the fair the everyday ones
  for (const k of ['mel', 'vinho', 'azeite', 'especiarias', 'cafe', 'cacau', 'queijo', 'tamaras', 'sal', 'peles', 'seda', 'perolas', 'plumas', 'incenso', 'carne_seca', 'bacalhau', 'cera']) if (!E.MARKET_GOODS.includes(k)) E.MARKET_GOODS.push(k);
  for (const k of ['queijo', 'mel', 'carne_seca', 'tamaras', 'sal', 'bacalhau', 'camarao', 'atum', 'azeite', 'vinho']) if (!E.FAIR_GOODS.includes(k)) E.FAIR_GOODS.push(k);

  // ------------------------------ rich houses want what is rare ------------------------------
  const WISH = ['vinho', 'mel', 'azeite', 'especiarias', 'cafe', 'cacau', 'queijo', 'tamaras', 'incenso', 'seda', 'peles', 'plumas', 'perolas', 'coral', 'pele_rara', 'marfim'];
  E.wishes = function (h, v) {
    const coin = h.coin || 0; if (coin < 2.5) return [];
    const I = h.inv || {}; const out = [];
    for (const k of WISH) { if ((I[k] || 0) >= 1 || coin < GD[k].price * 2.5) continue; if (G.R() < 0.4) out.push(k); if (out.length >= 2) break; }
    void v; return out;
  };

  // ------------------------------ the hunt: skin at the kill, home with hide and meat ------------------------------
  // what a body gives besides its meat (a rare coat is a fortune of its own)
  function spoilsOf(a) {
    const sp = G.Animals.DEF[a.kind]; const goods = (sp && sp.goods) || {}; const out = {};
    for (const k in goods) {
      let n = goods[k]; n = n >= 1 ? Math.round(n) : (G.hash(a.id * 13 + k.length) < n ? 1 : 0);
      if (!n) continue;
      if (a.morph && (k === 'peles' || k === 'couro')) { out.pele_rara = (out.pele_rara || 0) + 1; continue; }
      if (E.GOODS[k]) out[k] = (out[k] || 0) + n;
    }
    // a white elephant's tusks: twice the ivory and a sin
    if (a.morph && out.marfim) out.marfim *= 2;
    if (a.morph && !out.pele_rara && !out.marfim) out.pele_rara = 1;
    return out;
  }
  R.spoilsOf = spoilsOf;
  const hasSpoils = a => { for (const k in spoilsOf(a)) return true; return false; };
  // the hunter at the carcass (villagers' hunt task, once the body is reached)
  R.carcass = function (v, a, t, dt, H) {
    if (a.skinned || a.meat <= 0.5 || !hasSpoils(a)) return false;
    if (t.sk === undefined) { t.sk = 0; v.actT = 0; a.claim = v.id; }
    v.act = 'skin'; G.faceTo(v, a.x - v.x, a.y - v.y); v.path = null; v.moving = false;
    t.sk += dt * (G.Vg.workMul ? G.Vg.workMul(v) : 1);
    a.flay = Math.min(1, t.sk / 4);
    if (G.R() < dt * 2.2) G.FX && G.FX.blood(a.x + G.rr(-0.2, 0.2), a.y + G.rr(-0.1, 0.1));
    if (t.sk < 4) return true;
    a.skinned = true; a.flay = 1;
    const spoils = spoilsOf(a); const sp = G.Animals.DEF[a.kind];
    const take = Math.min(8, Math.max(1, a.meat)); a.meat -= take;
    const meat = Math.max(1, Math.round(take * G.Civ.tV(v, 'hunt')));
    v.carry = { k: 'food', n: meat, meat: a.kind, extra: spoils, from: a.kind, morph: a.morph || null };
    if (a.meat <= 0.5) G.Animals.remove(a); else a.claim = 0;
    G.Vg.emote(v, a.morph ? 'star' : 'food', 1.6);
    noteKill(v, a, sp, spoils);
    H.end(v); G.Vg.setTask(v, { type: 'deliver', pri: 1 });
    return true;
  };
  // a fighter who killed a beast with a fine coat stays to skin it
  R.spoils = function (v, a, t) {
    if (v.carry || a.skinned || !hasSpoils(a) || v.age < 16 || v.captive) return false;
    if (G.War && G.War.threat && G.War.threat(v.set)) return false;
    t.type = 'hunt'; t.carc = false; t.age = 0; return true;
  };
  // the tusks, the striped hide, the white one
  function noteKill(v, a, sp, spoils) {
    const S = G.S; const set = S.settlements.get(v.set); const f = G.Fac.ofV(v);
    const near = G.Stories && G.Stories.where ? G.Stories.where(a.x, a.y).at : set ? ' perto de ' + set.name : '';
    if (a.morph) {
      const nm = G.Animals.rareName ? G.Animals.rareName(a) : sp.name.toLowerCase();
      const fem = nm === 'pantera-negra' || sp.g === 'f';
      log(`${v.name} matou ${fem ? 'a' : 'o'} ${nm}${near}. A pele de cor rara vale mais que uma casa — e todo mundo quer ver.`, 'star', a.x, a.y);
      G.Stories && G.Stories.signal('rarekill', { who: v.id, kind: a.kind, morph: a.morph, x: a.x, y: a.y });
      if (f) { f.rareKills = (f.rareKills || 0) + 1; }
      return;
    }
    if (!f) return;
    const firsts = f.firsts || (f.firsts = {});
    for (const k in spoils) {
      if (!GD[k] || firsts[k]) continue;
      firsts[k] = S.day;
      const what = k === 'marfim' ? `as presas de ${G.gen(sp.name) === 'a' ? 'uma' : 'um'} ${sp.name.toLowerCase()}` : k === 'chifre' ? `o chifre de um ${sp.name.toLowerCase()}` : k === 'plumas' ? `as plumas de ${G.gen(sp.name) === 'a' ? 'uma' : 'um'} ${sp.name.toLowerCase()}` : `a pele de ${G.gen(sp.name) === 'a' ? 'uma' : 'um'} ${sp.name.toLowerCase()}`;
      log(`${v.name} voltou da caça com ${what}: ${R.the(k)} entr${GD[k].pl ? 'am' : 'a'} pela primeira vez nos armazéns de ${f.name}.`, 'trade', a.x, a.y);
      break;
    }
  }
  // hunters go after the beasts that carry what sells (and an ivory town thins its elephants)
  R.huntPull = function (v, a) {
    const sp = G.Animals.DEF[a.kind]; if (!sp || !sp.goods) return 0;
    let val = 0; for (const k in sp.goods) val += (E.PRICE[k] || 0) * sp.goods[k];
    if (a.morph) val += 30;
    const f = G.Fac.ofV(v); const trade = f && (f.exports || 0) > 0 ? 2 : f && G.Civ.has(f.id, 'moeda') ? 1.4 : 1;
    return val * 7 * trade;
  };
  // the store takes what came along with the meat
  R.unload = function (v, extra) {
    const f = G.Fac.ofV(v); if (!f) return;
    let dy = 0;
    for (const k in extra) {
      const n = extra[k]; if (!(n > 0)) continue;
      const add = G.Village.addStock(k, n, f.id);
      if (add > 0) { E.made(f, k, add); E.pay(v, k, add); v.st[k] = (v.st[k] || 0) + add; if (G.FX) G.FX.deposit(v.x, v.y - (dy += 0.25), k, add); }
    }
  };

  // ------------------------------ where the food came from (the fair shows it) ------------------------------
  const GAME = { deer: 1, boar: 1, reindeer: 1, moose: 1, gnu: 1, zebra: 1, gazelle: 1, buffalo: 1, bison: 1, capybara: 1, tapir: 1, camel: 1, giraffe: 1, ibex: 1, rhino: 1, elephant: 1, hippo: 1, muskox: 1, seal: 1, walrus: 1, penguin: 1, ostrich: 1, monkey: 1, beaver: 1, otter: 1 };
  R.fishAt = (x, y) => (G.Waters && G.Waters.fishAt ? G.Waters.fishAt(x, y) : 1);
  R.foodKey = function (carry) {
    if (!carry || carry.k !== 'food' || carry.hay) return null;
    if (carry.meat) { const m = carry.meat; return m === 'porco' ? 'porco' : m === 'vaca' ? 'boi' : m === 'ovelha' || m === 'cabra' ? 'cordeiro' : m === 'peru' || m === 'galinha' ? 'aves' : m === 'whale' ? 'baleia' : m === 'rabbit' || m === 'hare' ? 'coelho' : GAME[m] ? 'caca' : 'caca'; }
    if (carry.fish) return typeof carry.fish === 'string' ? 'peixe:' + carry.fish : 'peixe';
    if (carry.shell) return 'marisco';
    if (carry.basket && !carry.leaves && !carry.must) return 'fruta:' + carry.basket;
    if (carry.grain) return 'grao';
    if (carry.berries) return 'bagas';
    return null;
  };
  R.noteFood = function (fid, key, n) {
    const f = G.Fac.get(fid); if (!f || !key || !(n > 0)) return;
    const m = f.foodSrc || (f.foodSrc = {}); m[key] = (m[key] || 0) + n;
  };
  R.delivered = function (v, carry, add) { const k = R.foodKey(carry); if (k) R.noteFood(G.Fac.idOfV(v), k, add || carry.n); };
  function decaySrc(dt) { for (const f of G.Fac.all()) { const m = f.foodSrc; if (!m) continue; const d = Math.pow(0.5, dt / (DAY() * 0.8)); for (const k in m) { m[k] *= d; if (m[k] < 0.3) delete m[k]; } } }
  // what a fair stall shows: the goods it holds, and for food the town's own (the boar the hunters brought, the pigs of the pen, the catch)
  R.stallGoods = function (b, k) {
    const I = b.inv || {}; const S = G.S;
    if (b._sg && b._sg.t > S.clock - 4) return b._sg.l[k % b._sg.l.length];
    const keys = Object.keys(I).filter(q => I[q] >= 1).sort((a, c) => I[c] - I[a]);
    const f = G.Fac.get(G.Village.facOfSet(b.set)); const src = f && f.foodSrc ? Object.keys(f.foodSrc).sort((a, c) => f.foodSrc[c] - f.foodSrc[a]) : [];
    const l = [];
    for (const q of keys) { if (q === 'food') { for (const s2 of src.slice(0, 3)) l.push('food:' + s2); if (!src.length) l.push('food'); } else l.push(q); }
    if (!l.length) l.push(src.length ? 'food:' + src[0] : 'food');
    b._sg = { t: S.clock, l }; return l[k % l.length];
  };
  // the counter of a stall (in the stall sprite's own space), and what hangs from its awning
  R.drawCounter = function (c, P, goods, C) {
    const TAU2 = TAU; const at = (q, z) => P(-0.16 + q * 0.1, 0.06, z === undefined ? 3.5 : z);
    const hang = (q, fn) => { const a = P(-0.2 + q * 0.13, 0.3, 8.6); c.strokeStyle = 'rgba(60,40,20,0.7)'; c.lineWidth = 0.3; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(a[0], a[1] + 1.2); c.stroke(); fn(a[0], a[1] + 1.2); };
    const blob = (x, y, rx, ry, col, rot) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, rot || 0, 0, TAU2); c.fill(); };
    const [kind, sub] = goods.split(':').length > 1 ? [goods.split(':')[1], goods.split(':').slice(2).join(':')] : [goods, ''];
    switch (goods.startsWith('food:') ? kind : goods) {
      case 'porco': for (let q = 0; q < 3; q++) hang(q, (x, y) => { blob(x, y + 1.6, 1, 1.9, q % 2 ? '#b8604a' : '#c8705a'); c.fillStyle = '#f2ead8'; c.fillRect(x - 0.3, y - 0.1, 0.6, 0.6); });
        for (let q = 0; q < 3; q++) { const g = at(q); blob(g[0], g[1] - 0.6, 1.2, 0.7, '#e8a090'); } c.strokeStyle = '#a84a3a'; c.lineWidth = 0.7; { const g = at(3); c.beginPath(); for (let q = 0; q < 4; q++) c.arc(g[0] - 1 + q * 0.7, g[1] - 0.5, 0.35, 0, TAU2); c.stroke(); } return;
      case 'boi': case 'cordeiro': hang(1, (x, y) => { blob(x, y + 2.4, 1.3, 2.6, '#9a2a32'); c.fillStyle = '#f2e6d8'; c.fillRect(x - 0.9, y + 1.4, 1.8, 0.35); c.fillRect(x - 0.8, y + 2.8, 1.6, 0.35); });
        for (let q = 0; q < 4; q++) { const g = at(q); c.fillStyle = q % 2 ? '#a8343a' : '#b8444a'; c.fillRect(g[0] - 1, g[1] - 1, 2, 1); c.fillStyle = '#f2e6d8'; c.fillRect(g[0] - 1, g[1] - 1, 2, 0.25); } return;
      case 'aves': for (let q = 0; q < 3; q++) hang(q, (x, y) => { blob(x, y + 1.5, 0.9, 1.5, '#f0d8c0'); c.strokeStyle = '#d8a060'; c.lineWidth = 0.35; c.beginPath(); c.moveTo(x - 0.3, y); c.lineTo(x - 0.4, y - 0.6); c.moveTo(x + 0.3, y); c.lineTo(x + 0.4, y - 0.6); c.stroke(); }); for (let q = 0; q < 3; q++) { const g = at(q); blob(g[0], g[1] - 0.5, 0.5, 0.65, '#f4eee0'); } return;
      case 'caca': case 'coelho': // venison or hare, and antlers on the post
        if (kind === 'coelho') for (let q = 0; q < 3; q++) hang(q, (x, y) => blob(x, y + 1.6, 0.6, 1.6, '#b8a890'));
        else { hang(0, (x, y) => { blob(x, y + 2.2, 1.2, 2.3, '#7a2228'); c.fillStyle = '#f2ead8'; c.fillRect(x - 0.3, y, 0.6, 0.6); }); const a = P(0.28, 0.3, 9.2); c.strokeStyle = '#d8c8a0'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(a[0] - 1.6, a[1] - 2.2); c.moveTo(a[0] - 0.8, a[1] - 1.1); c.lineTo(a[0] - 1.8, a[1] - 0.9); c.moveTo(a[0], a[1]); c.lineTo(a[0] + 1.6, a[1] - 2.2); c.moveTo(a[0] + 0.8, a[1] - 1.1); c.lineTo(a[0] + 1.8, a[1] - 0.9); c.stroke(); }
        for (let q = 0; q < 4; q++) { const g = at(q); c.fillStyle = q % 2 ? '#7a2228' : '#8a2a30'; c.fillRect(g[0] - 1, g[1] - 1, 2, 1); } return;
      case 'baleia': for (let q = 0; q < 4; q++) { const g = at(q); c.fillStyle = q % 2 ? '#5a1a22' : '#6a2228'; c.fillRect(g[0] - 1.2, g[1] - 1.2, 2.4, 1.2); } { const g = P(0.22, 0.12, 3.5); c.fillStyle = '#7a5a34'; c.fillRect(g[0] - 1, g[1] - 2.6, 2, 2.6); } return;
      case 'peixe': { const col = sub && G.Waters && G.Waters.FISH && G.Waters.FISH[sub] ? G.Waters.FISH[sub].col : '#b8c8d8'; for (let q = 0; q < 4; q++) { const g = at(q); c.save(); c.translate(g[0], g[1] - 0.5); c.rotate(0.3); blob(0, 0, 1.4, 0.5, col); c.fillStyle = col; c.beginPath(); c.moveTo(1.2, 0); c.lineTo(2, -0.6); c.lineTo(2, 0.6); c.fill(); c.fillStyle = '#2a2a30'; c.fillRect(-1, -0.2, 0.25, 0.25); c.restore(); } hang(1, (x, y) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y + 1.8, 0.5, 1.6, 0, 0, TAU2); c.fill(); }); return; }
      case 'marisco': for (let q = 0; q < 4; q++) { const g = at(q); for (let k = 0; k < 3; k++) blob(g[0] - 0.6 + k * 0.6, g[1] - 0.5 - (k % 2) * 0.3, 0.45, 0.3, k % 2 ? '#2a3a5a' : '#e8d8c0'); } return;
      case 'fruta': for (let q = 0; q < 4; q++) { const g = at(q); for (let k = 0; k < 3; k++) blob(g[0] - 0.5 + k * 0.5, g[1] - 0.5, 0.45, 0.45, sub || '#d8302a'); blob(g[0], g[1] - 1.1, 0.45, 0.45, sub || '#d8302a'); } return;
      case 'grao': case 'food': for (let q = 0; q < 4; q++) { const g = at(q); if (q % 2) blob(g[0], g[1] - 0.7, 1.1, 0.7, '#c8903a'); else { c.fillStyle = '#d8c090'; c.fillRect(g[0] - 0.9, g[1] - 1.8, 1.8, 1.8); c.fillStyle = '#e8c24a'; blob(g[0], g[1] - 1.9, 0.9, 0.4, '#e8c24a'); } } return;
      case 'bagas': for (let q = 0; q < 4; q++) { const g = at(q); blob(g[0], g[1] - 0.4, 0.9, 0.5, '#a07040'); for (let k = 0; k < 4; k++) blob(g[0] - 0.5 + (k % 2) * 0.7, g[1] - 0.8 - Math.floor(k / 2) * 0.3, 0.3, 0.3, k % 2 ? '#8a1a3a' : '#c8202a'); } return;
      case 'queijo': for (let q = 0; q < 3; q++) { const g = at(q); blob(g[0], g[1] - 0.7, 1.2, 0.6, '#f2d06a'); c.fillStyle = '#e8b84a'; c.fillRect(g[0] - 1.2, g[1] - 0.7, 2.4, 0.6); } return;
      case 'mel': case 'azeite': case 'vinho': for (let q = 0; q < 4; q++) { const g = at(q); G.Arch.kit().jar(c, g[0], g[1], 0.5, goods === 'mel' ? '#c8803a' : '#b8704a'); c.fillStyle = goods === 'mel' ? '#f2b23a' : goods === 'vinho' ? '#6a1a3a' : '#8a8a3a'; c.fillRect(g[0] - 0.4, g[1] - 2.5, 0.8, 0.4); } return;
      case 'especiarias': case 'cafe': case 'cacau': case 'sal': case 'incenso': case 'tamaras': {
        const cols = { especiarias: ['#c8402a', '#e8902a', '#e8c83a', '#6a8a3a'], cafe: ['#6a3a22', '#b82a2a', '#6a3a22', '#4a2a18'], cacau: ['#c8702a', '#e8a030', '#8a4a1a', '#c8702a'], sal: ['#f4f4f0', '#ffffff', '#e8e8e4', '#f4f4f0'], incenso: ['#f2e2a8', '#e8d090', '#f2e2a8', '#d8c890'], tamaras: ['#8a4a1a', '#a8602a', '#8a4a1a', '#7a3a10'] }[goods];
        for (let q = 0; q < 4; q++) { const g = at(q); c.fillStyle = '#c8b090'; c.fillRect(g[0] - 0.9, g[1] - 0.9, 1.8, 0.9); c.fillStyle = cols[q]; c.beginPath(); c.moveTo(g[0] - 0.8, g[1] - 0.9); c.lineTo(g[0], g[1] - 2); c.lineTo(g[0] + 0.8, g[1] - 0.9); c.fill(); }
        return;
      }
      case 'peles': case 'pele_rara': case 'couro_exotico': case 'couro': for (let q = 0; q < 3; q++) hang(q, (x, y) => { c.fillStyle = goods === 'pele_rara' ? (q % 2 ? '#f4f0e6' : '#1e1a1c') : goods === 'couro_exotico' ? '#5a6a32' : goods === 'couro' ? '#8a5a34' : ['#8a8a8e', '#6a4a30', '#d8742a'][q]; c.beginPath(); c.moveTo(x - 1, y); c.lineTo(x + 1, y); c.lineTo(x + 1.2, y + 3); c.lineTo(x, y + 3.6); c.lineTo(x - 1.2, y + 3); c.closePath(); c.fill(); if (goods === 'pele_rara' && q % 2 === 0) { c.strokeStyle = '#8a8a90'; c.lineWidth = 0.3; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(x - 0.9, y + 0.8 + k); c.lineTo(x + 0.9, y + 0.6 + k); c.stroke(); } } }); return;
      case 'seda': case 'tecido': for (let q = 0; q < 4; q++) { const g = at(q); c.fillStyle = goods === 'seda' ? ['#f6eede', '#e8a8b8', '#a8c8e8', '#f2e6a8'][q] : C[q % C.length]; c.fillRect(g[0] - 1.1, g[1] - 1.3, 2.2, 1.3); c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(g[0] - 1, g[1] - 1.25, 0.4, 1.2); } return;
      case 'perolas': case 'joias': case 'coral': for (let q = 0; q < 4; q++) { const g = at(q); c.fillStyle = '#5a3a22'; c.fillRect(g[0] - 0.9, g[1] - 0.5, 1.8, 0.5); for (let k = 0; k < 3; k++) blob(g[0] - 0.5 + k * 0.5, g[1] - 0.8, 0.3, 0.3, goods === 'perolas' ? '#f8f4ee' : goods === 'coral' ? '#e8584a' : ['#e8b83a', '#6ad0e8', '#e84a6a'][k]); } return;
      case 'carne_seca': case 'bacalhau': for (let q = 0; q < 4; q++) hang(q % 3, (x, y) => { c.fillStyle = goods === 'bacalhau' ? '#d8d0b8' : '#7a2a22'; c.fillRect(x - 0.5 + (q > 2 ? 0.5 : 0), y, 1, 3.4); }); return;
      case 'atum': for (let q = 0; q < 2; q++) { const g = at(q * 2 + 0.5); c.save(); c.translate(g[0], g[1] - 0.8); blob(0, 0, 2.2, 0.8, '#3a5a8a'); blob(0, 0.3, 2, 0.4, '#c8d0d8'); c.restore(); } return;
      case 'camarao': for (let q = 0; q < 4; q++) { const g = at(q); blob(g[0], g[1] - 0.4, 1, 0.5, '#a07040'); for (let k = 0; k < 3; k++) { c.fillStyle = '#f08a6a'; c.beginPath(); c.arc(g[0] - 0.5 + k * 0.5, g[1] - 0.8, 0.35, 0.2, Math.PI * 1.6); c.fill(); } } return;
      case 'ceramica': for (let q = 0; q < 4; q++) { const g = at(q); G.Arch.kit().jar(c, g[0], g[1] + 0.6, 0.55, ['#c8683a', '#b85a30', '#d8804a'][q % 3]); } return;
      case 'plumas': case 'marfim': case 'chifre': case 'cera': case 'oleo':
      default: for (let q = 0; q < 4; q++) { const g = at(q); const col = (G.Eco.GOODS[goods] && G.Eco.GOODS[goods].col) || '#e05a3a'; blob(g[0], g[1] - 0.7, 0.9, 0.7, col); } return;
    }
  };

  // ------------------------------ hungry towns eat their reserves ------------------------------
  function reserves(f) {
    const pop = G.Fac.pop(f.id); if (!pop) return;
    if (f.stock.food >= pop * 1.2) return;
    let ate = null;
    for (const k of ['carne_seca', 'bacalhau', 'queijo', 'atum', 'tamaras', 'camarao', 'mel', 'azeite']) {
      const ed = GD[k].ed; if (!ed || (f.stock[k] || 0) < 1) continue;
      const n = Math.min(f.stock[k], Math.ceil((pop * 1.5 - f.stock.food) / ed)); if (n <= 0) continue;
      f.stock[k] -= n; f.stock.food += n * ed; E.used(f, k, n); ate = ate || k;
      if (f.stock.food >= pop * 1.5) break;
    }
    if (ate && G.S.day - (f._ateRes || -9) >= 4) { f._ateRes = G.S.day; const cap = G.Fac.capitalOf(f.id); log(`Com os celeiros vazios, ${f.name} começou a comer suas reservas de ${GD[ate].name}.`, 'food', cap ? cap.cx : undefined, cap ? cap.cy : undefined); }
  }
  // the rich enjoy what they bought (and it shows: the house becomes a fine house)
  function luxuries(dt) {
    const S = G.S; const dayF = dt / DAY();
    for (const h of S.buildings.values()) {
      if (!h.built || !G.BDEF[h.type].housing || !h.inv) continue;
      let n = 0;
      for (const k of WISH) { const q = h.inv[k] || 0; if (q <= 0) continue; n++; h.inv[k] = Math.max(0, q - dayF * (GD[k].tier === 'raro' ? 0.02 : GD[k].tier === 'luxo' ? 0.15 : 0.4)); }
      h.lux = G.lerp(h.lux || 0, Math.min(1, n / 4), Math.min(1, dayF * 1.5));
    }
  }

  // ------------------------------ update ------------------------------
  let tSlow = 0, hooked = false;
  function hookFX() {
    if (hooked || !G.FX) return; hooked = true;
    const old = G.FX.deposit;
    G.FX.deposit = function (x, y, k, n) {
      const g = GD[k] || (k !== 'food' && k !== 'wood' && k !== 'stone' && E.GOODS[k]); if (!g) return old(x, y, k, n);
      if (!G.Render || G.Render.cam.zoom < 1.6) return;
      G.FX.floater(x, y, '+' + (n % 1 ? n.toFixed(1) : n) + ' ' + g.name, g.col === '#f4f4f0' || g.col === '#f4f0ea' || g.col === '#f6eede' || g.col === '#f2ead2' || g.col === '#f4f0e6' ? '#fffaf0' : shadeUp(g.col), 1.3);
    };
  }
  function shadeUp(hex) { const r = G.hex2rgb(hex); return G.rgb(r.map(v => v + (255 - v) * 0.45)); }
  R.update = function (dt) {
    const S = G.S; if (!S) return; hookFX();
    tSlow += dt; if (tSlow < 4) return;
    const step = tSlow; tSlow = 0;
    for (const f of G.Fac.all()) { E.ensure(f); reserves(f); }
    luxuries(step); decaySrc(step);
  };
  R.onWorld = function () { hookFX(); };
  R.run = () => false;
  R.taskText = () => null;

  // ------------------------------ drawing what people carry ------------------------------
  const FUR = { wolf: '#8a8a8e', bear: '#6a4a30', polarbear: '#f2eee4', fox: '#d8742a', arcticfox: '#f4f2ee', seal: '#7a7a80', lion: '#c89a5a', jaguar: '#d8a040', tiger: '#e0802a', leopard: '#d8a850', snowleopard: '#e0e0dc', muskox: '#4a3a2a', beaver: '#7a4a2a', otter: '#6a4a32', reindeer: '#9a8a74', bison: '#4a3020', rabbit: '#b8a890', hare: '#f0eee8' };
  function e(c, x, y, rx, ry, rot, col) { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, rot || 0, 0, TAU); c.fill(); }
  function sack(c, col, tie) { c.fillStyle = col; c.beginPath(); c.moveTo(-2.4, -9.8); c.quadraticCurveTo(-3, -12.6, -1, -13.4); c.lineTo(1, -13.4); c.quadraticCurveTo(3, -12.6, 2.4, -9.8); c.closePath(); c.fill(); c.fillStyle = tie || 'rgba(0,0,0,0.25)'; c.fillRect(-0.9, -13.8, 1.8, 0.6); }
  function basket(c, fill) { c.fillStyle = '#a07040'; c.beginPath(); c.moveTo(-2.9, -11.8); c.lineTo(2.9, -11.8); c.lineTo(2.2, -9.6); c.lineTo(-2.2, -9.6); c.fill(); c.strokeStyle = 'rgba(70,40,20,0.5)'; c.lineWidth = 0.3; c.beginPath(); c.moveTo(-2.6, -10.8); c.lineTo(2.6, -10.8); c.stroke(); if (fill) fill(); }
  function amphora(c, body, seal) {
    c.save(); c.translate(0.6, -12); c.rotate(-0.6);
    e(c, 0, 0, 1.7, 2.6, 0, body); c.fillRect(-0.55, -3.6, 1.1, 1.4); c.fillStyle = seal; c.fillRect(-0.7, -4, 1.4, 0.6);
    c.strokeStyle = body; c.lineWidth = 0.4; c.beginPath(); c.arc(-1, -2.4, 0.6, Math.PI * 0.5, Math.PI * 1.5); c.arc(1, -2.4, 0.6, -Math.PI * 0.5, Math.PI * 0.5); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillRect(-1, -1, 0.5, 1.6); c.restore();
  }
  function pelt(c, col, stripe, spots) {
    c.fillStyle = col; c.beginPath(); c.moveTo(-3.8, -10.2); c.quadraticCurveTo(-1, -14.6, 3.6, -11.6); c.lineTo(3.2, -8.2); c.quadraticCurveTo(2.6, -9.6, 1.4, -9.8); c.lineTo(-1.6, -9.8); c.quadraticCurveTo(-3, -9.4, -3.8, -7.6); c.closePath(); c.fill();
    if (stripe) { c.strokeStyle = stripe; c.lineWidth = 0.45; for (const x of [-2.4, -1, 0.4, 1.8]) { c.beginPath(); c.moveTo(x, -12.4 + Math.abs(x) * 0.3); c.lineTo(x + 0.5, -10.2); c.stroke(); } }
    if (spots) { c.fillStyle = spots; for (const [x, y] of [[-2.2, -11], [-0.6, -12.2], [1, -11.4], [2.2, -10.4], [-1.2, -10.4]]) { c.beginPath(); c.arc(x, y, 0.42, 0, TAU); c.fill(); } }
    // the tail hanging down the back
    c.strokeStyle = col; c.lineWidth = 0.7; c.beginPath(); c.moveTo(-3.6, -8.4); c.quadraticCurveTo(-4.4, -6.4, -3.6, -4.6); c.stroke();
  }
  // (on the head and the shoulder, above the face: drawn before the head, so lifted clear of it)
  R.drawCarry = function (c, k, carry, t) {
    c.save(); c.translate(k === 'marfim' || k === 'bacalhau' || k === 'atum' || k === 'peles' || k === 'pele_rara' || k === 'couro_exotico' ? 0.6 : 0.3, -2.5);
    const r = drawGood(c, k, carry, t); c.restore(); return r;
  };
  function drawGood(c, k, carry, t) {
    switch (k) {
      case 'marfim': { // a curved tusk over the shoulder
        c.fillStyle = '#f2ead2'; c.beginPath(); c.moveTo(-4.6, -10.6); c.quadraticCurveTo(0, -15.4, 4.8, -12.4); c.lineTo(4.4, -11.4); c.quadraticCurveTo(0, -13.8, -4.2, -9.6); c.closePath(); c.fill();
        c.fillStyle = '#d8cca8'; c.beginPath(); c.moveTo(4.8, -12.4); c.lineTo(5.6, -12.8); c.lineTo(4.4, -11.4); c.fill();
        if ((carry.n || 1) > 1) { c.fillStyle = '#e8dcc0'; c.beginPath(); c.moveTo(-3.8, -11.4); c.quadraticCurveTo(0.4, -15.8, 4.4, -13.6); c.lineTo(4.1, -12.9); c.quadraticCurveTo(0.2, -14.6, -3.6, -10.8); c.closePath(); c.fill(); }
        return true;
      }
      case 'peles': pelt(c, FUR[carry.from] || '#8a6a4a', carry.from === 'tiger' ? '#2a1a10' : null, carry.from === 'jaguar' || carry.from === 'leopard' || carry.from === 'snowleopard' ? '#3a2a1a' : null); return true;
      case 'pele_rara': { const black = carry.morph === 'melanico'; pelt(c, black ? '#1e1a1c' : '#f4f0e6', black ? null : (carry.from === 'tiger' ? '#8a8a90' : null), black ? '#3a3236' : (carry.from === 'jaguar' || carry.from === 'leopard' ? '#c8c4bc' : null)); c.fillStyle = 'rgba(255,240,180,' + (0.3 + Math.sin(t * 3) * 0.2) + ')'; c.fillRect(2.6, -13.6, 0.5, 0.5); return true; }
      case 'couro_exotico': { c.fillStyle = '#5a6a32'; c.beginPath(); c.moveTo(-3.8, -10); c.quadraticCurveTo(0, -14, 3.8, -10.6); c.lineTo(3.2, -9.4); c.lineTo(-3.2, -9.2); c.fill(); c.fillStyle = '#3e4a22'; for (let x = -2.8; x <= 2.8; x += 1.1) for (const y of [-11.4, -10.2]) c.fillRect(x, y + Math.abs(x) * 0.15, 0.6, 0.5); return true; }
      case 'chifre': { c.fillStyle = '#8a8478'; c.beginPath(); c.moveTo(-1.8, -10.2); c.quadraticCurveTo(0.4, -11, 1.4, -15.2); c.quadraticCurveTo(2, -11.4, 2, -10.2); c.closePath(); c.fill(); c.fillStyle = 'rgba(255,255,255,0.2)'; c.fillRect(0.4, -13, 0.4, 2.4); return true; }
      case 'plumas': { const cols = carry.from === 'ostrich' ? ['#f4f0e8', '#2a2420', '#f4f0e8'] : ['#e8343a', '#2a7ad8', '#f2c14e']; for (let q = 0; q < 3; q++) { c.save(); c.translate(-0.6 + q * 0.7, -10.4); c.rotate(-0.5 + q * 0.4 + Math.sin(t * 3 + q) * 0.06); e(c, 0, -2.6, 0.8, 2.8, 0, cols[q]); c.restore(); } return true; }
      case 'mel': { e(c, 0, -11.2, 2.1, 1.8, 0, '#b8704a'); c.fillStyle = '#8a4a2a'; c.fillRect(-1.2, -13.4, 2.4, 0.7); c.fillStyle = '#f2b23a'; c.fillRect(-1, -13, 2, 0.5); const d = (t * 0.6) % 1; c.fillRect(1.3, -12.6 + d * 2, 0.45, 0.8); return true; }
      case 'cera': { for (let q = 0; q < 3; q++) { c.fillStyle = q % 2 ? '#e8c860' : '#f2d878'; c.fillRect(-2.4 + q * 1.6, -12.6 + (q % 2) * 0.4, 1.5, 2.6); } return true; }
      case 'seda': { for (let q = 0; q < 3; q++) { c.strokeStyle = ['#f6eede', '#e8d0c8', '#f2e6a8'][q]; c.lineWidth = 0.9; c.beginPath(); c.ellipse(-1.6 + q * 1.6, -11.6, 0.9, 1.6, 0.3, 0, TAU); c.stroke(); } c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(-1.8, -13, 0.4, 0.8); return true; }
      case 'oleo': { c.fillStyle = '#7a5a34'; c.fillRect(-2.2, -13.2, 4.4, 3.6); c.fillStyle = '#5a3a20'; c.fillRect(-2.2, -12.4, 4.4, 0.4); c.fillRect(-2.2, -10.6, 4.4, 0.4); c.fillStyle = '#c8a04a'; c.fillRect(-0.4, -13.6, 0.8, 0.5); return true; }
      case 'queijo': { e(c, 0, -11, 2.6, 1.3, 0, '#e8b84a'); c.fillStyle = '#f2d06a'; c.fillRect(-2.6, -12.4, 5.2, 1.4); e(c, 0, -12.4, 2.6, 1.3, 0, '#f6dc7a'); return true; }
      case 'carne_seca': { c.strokeStyle = '#7a5a3a'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(-3.6, -13.4); c.lineTo(3.6, -13.8); c.stroke(); c.fillStyle = '#8a3a2a'; for (let q = 0; q < 4; q++) c.fillRect(-3 + q * 1.7, -13.4, 0.9, 2.6 + (q % 2) * 0.6); return true; }
      case 'cacau': basket(c, () => { for (const [x, col] of [[-1.4, '#d8902a'], [0.2, '#c8602a'], [1.6, '#e8b03a']]) e(c, x, -12.4, 0.9, 1.4, 0.3, col); }); return true;
      case 'cafe': sack(c, '#c8b08a', '#7a5a3a'); c.fillStyle = '#b82a2a'; for (const [x, y] of [[-0.8, -13.6], [0, -14], [0.8, -13.6], [0.3, -13.2]]) { c.beginPath(); c.arc(x, y, 0.5, 0, TAU); c.fill(); } return true;
      case 'especiarias': { const cols = ['#c8402a', '#e8902a', '#e8c83a']; for (let q = 0; q < 3; q++) { c.fillStyle = cols[q]; c.beginPath(); c.ellipse(-1.8 + q * 1.8, -11.2, 1, 1.4, 0, 0, TAU); c.fill(); c.fillStyle = '#8a6a44'; c.fillRect(-2.2 + q * 1.8, -12.8, 0.8, 0.4); } return true; }
      case 'azeite': amphora(c, '#b8704a', '#6a7a2a'); return true;
      case 'vinho': amphora(c, '#a85a3a', '#6a1a2a'); return true;
      case 'tamaras': { c.strokeStyle = '#c89a4a'; c.lineWidth = 0.4; c.beginPath(); c.moveTo(0, -14.4); c.lineTo(0, -12.8); c.stroke(); c.fillStyle = '#8a4a1a'; for (const [x, y] of [[-1.2, -12.2], [0, -12.6], [1.2, -12.2], [-0.6, -11.2], [0.6, -11.2], [0, -10.4]]) { c.beginPath(); c.ellipse(x, y, 0.5, 0.75, 0, 0, TAU); c.fill(); } return true; }
      case 'incenso': { sack(c, '#d8c8a0'); c.fillStyle = '#f2e2a8'; for (const [x, y] of [[-0.6, -13.6], [0.5, -13.8]]) { c.beginPath(); c.arc(x, y, 0.55, 0, TAU); c.fill(); } c.fillStyle = 'rgba(230,230,230,0.35)'; c.beginPath(); c.arc(0.4 + Math.sin(t * 2) * 0.4, -16 - (t % 1), 0.9, 0, TAU); c.fill(); return true; }
      case 'sal': { sack(c, '#e8e4dc'); c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(-1.2, -13.2); c.lineTo(0, -14.6); c.lineTo(1.2, -13.2); c.fill(); return true; }
      case 'bacalhau': { c.save(); c.translate(0, -12); c.rotate(-0.25); c.fillStyle = '#d8d0b8'; c.beginPath(); c.moveTo(-4, 0); c.quadraticCurveTo(0, -2.2, 3.4, -0.4); c.lineTo(4.6, -1.4); c.lineTo(4.4, 0.8); c.lineTo(3.4, 0.4); c.quadraticCurveTo(0, 1.6, -4, 0); c.fill(); c.strokeStyle = 'rgba(120,100,70,0.5)'; c.lineWidth = 0.3; c.beginPath(); c.moveTo(-3, 0); c.lineTo(3, -0.2); c.stroke(); c.restore(); return true; }
      case 'atum': { c.save(); c.translate(0, -12); c.rotate(-0.2); c.fillStyle = '#3a5a8a'; c.beginPath(); c.moveTo(-4.4, 0); c.quadraticCurveTo(0, -2.6, 3.4, -0.2); c.lineTo(5, -1.6); c.lineTo(4.8, 1.2); c.lineTo(3.4, 0.2); c.quadraticCurveTo(0, 1.8, -4.4, 0); c.fill(); c.fillStyle = '#c8d0d8'; c.beginPath(); c.moveTo(-4, 0.2); c.quadraticCurveTo(0, 1.6, 3.2, 0.3); c.lineTo(-4, 0.2); c.fill(); c.fillStyle = '#f2c14e'; c.fillRect(1.2, -1.1, 0.4, 0.3); c.restore(); return true; }
      case 'camarao': basket(c, () => { c.fillStyle = '#f08a6a'; for (const [x, y] of [[-1.6, -12.2], [-0.4, -12.6], [0.8, -12.3], [1.8, -12], [0.2, -11.9]]) { c.beginPath(); c.arc(x, y, 0.6, 0.2, Math.PI * 1.6); c.fill(); } }); return true;
      case 'perolas': { c.fillStyle = '#6a4a2a'; c.fillRect(-1.6, -12.4, 3.2, 2); c.fillStyle = '#8a6a3a'; c.fillRect(-1.6, -12.8, 3.2, 0.5); c.fillStyle = '#f8f4ee'; for (const x of [-0.8, 0, 0.8]) { c.beginPath(); c.arc(x, -13.1, 0.45, 0, TAU); c.fill(); } c.fillStyle = 'rgba(255,255,255,' + (0.5 + Math.sin(t * 4) * 0.4) + ')'; c.fillRect(0.1, -13.5, 0.3, 0.3); return true; }
      case 'coral': { c.strokeStyle = '#e8584a'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(0, -10); c.lineTo(0, -13); c.moveTo(0, -12); c.lineTo(-1.6, -14); c.moveTo(0, -12.6); c.lineTo(1.5, -14.4); c.moveTo(-1, -13.2); c.lineTo(-1.8, -15); c.stroke(); return true; }
      case 'food': {
        if (carry.meat) { // a haunch with the bone sticking out (small game hangs by its feet)
          const small = G.Animals.DEF[carry.meat] && (G.Animals.DEF[carry.meat].size || 1) < 0.8;
          if (small) { const col = FUR[carry.meat] || '#9a7a5a'; c.save(); c.translate(1.6, -10.6); c.rotate(0.15 + Math.sin(t * 4) * 0.08); e(c, 0, 1.6, 0.9, 1.8, 0, col); c.strokeStyle = col; c.lineWidth = 0.4; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -1); c.stroke(); c.restore(); return true; }
          c.fillStyle = '#a8343a'; c.beginPath(); c.moveTo(-3.6, -10.6); c.quadraticCurveTo(-3.6, -14, 0, -13.4); c.quadraticCurveTo(2.6, -13, 2.4, -11.4); c.quadraticCurveTo(0, -9.6, -3.6, -10.6); c.fill();
          c.fillStyle = '#e8c8b8'; c.beginPath(); c.ellipse(-1.4, -12.2, 1.2, 0.5, -0.3, 0, TAU); c.fill();
          c.fillStyle = '#f2ead8'; c.fillRect(2.2, -12.6, 2, 0.7); c.beginPath(); c.arc(4.3, -12.5, 0.55, 0, TAU); c.arc(4.3, -11.9, 0.5, 0, TAU); c.fill();
          return true;
        }
        const FD = carry.fish && typeof carry.fish === 'string' && G.Waters && G.Waters.FISH ? G.Waters.FISH[carry.fish] : null;
        if (FD && FD.big) { c.save(); c.translate(0, -12); c.rotate(-0.25); e(c, 0, 0, 4.4, 1.3, 0, FD.col); c.fillStyle = FD.col; c.beginPath(); c.moveTo(3.8, 0); c.lineTo(5.6, -1.6); c.lineTo(5.6, 1.6); c.fill(); c.fillStyle = 'rgba(255,255,255,0.3)'; c.beginPath(); c.ellipse(-0.5, 0.5, 3.2, 0.4, 0, 0, TAU); c.fill(); c.fillStyle = '#1a1a20'; c.fillRect(-3.4, -0.4, 0.4, 0.4); c.restore(); return true; }
        if (carry.fish) { const col = FD ? FD.col : '#b8c8d8'; c.strokeStyle = '#7a5a3a'; c.lineWidth = 0.4; c.beginPath(); c.moveTo(-3, -12.6); c.lineTo(3, -13); c.stroke(); for (let q = 0; q < 3; q++) { c.save(); c.translate(-2 + q * 2, -12.6); c.rotate(Math.PI / 2 + Math.sin(t * 3 + q) * 0.08); e(c, 1.3, 0, 1.3, 0.55, 0, col); c.fillStyle = col; c.beginPath(); c.moveTo(2.4, 0); c.lineTo(3.1, -0.6); c.lineTo(3.1, 0.6); c.fill(); c.restore(); } return true; }
        if (carry.shell) { basket(c, () => { for (const [x, y, col] of [[-1.4, -12.1, '#2a3a5a'], [0, -12.5, '#e8d8c0'], [1.4, -12.1, '#2a3a5a'], [-0.6, -11.6, '#e8c8a8'], [0.8, -11.6, '#2a3a5a']]) e(c, x, y, 0.8, 0.5, 0.3, col); }); return true; }
        if (carry.berries) { basket(c, () => { for (const [x, y] of [[-1.5, -12.2], [0, -12.5], [1.5, -12.2], [-0.7, -11.7], [0.8, -11.7]]) e(c, x, y, 0.6, 0.6, 0, '#a8203a'); }); return true; }
        if (carry.grain) { c.save(); c.translate(0.4, -12); c.rotate(-0.5); c.strokeStyle = '#c8a040'; c.lineWidth = 0.5; for (let q = -3; q <= 3; q++) { c.beginPath(); c.moveTo(q * 0.3, 3); c.lineTo(q * 0.55, -3); c.stroke(); } c.fillStyle = '#e8c24a'; for (let q = -3; q <= 3; q++) e(c, q * 0.6, -3.4, 0.35, 0.9, q * 0.1, '#e8c24a'); c.fillStyle = '#8a6a3a'; c.fillRect(-1.2, 0.6, 2.4, 0.6); c.restore(); return true; }
        if (carry.basket) { basket(c, () => { c.fillStyle = carry.basket; for (const [x, y] of [[-1.5, -12.2], [0, -12.6], [1.5, -12.2], [-0.7, -11.6], [0.8, -11.6]]) { c.beginPath(); c.arc(x, y, 0.75, 0, TAU); c.fill(); } }); return true; }
        return false;
      }
    }
    return false;
  }
  // what rides along: the hide over the other shoulder, a tusk, a bundle of plumes
  R.drawExtra = function (c, extra, carry, t) {
    let k = null; for (const q in extra) if (extra[q] > 0) { k = q; break; } if (!k) return;
    c.save(); c.translate(-2.2, 3.4); c.scale(0.78, 0.78);
    R.drawCarry(c, k === 'couro' ? 'peles' : k, Object.assign({}, carry, { n: extra[k] }), t);
    c.restore();
  };
  // the flayed carcass left where it fell
  R.drawFlay = function (c, a, sp) {
    const q = sp.q; const y = -(q ? q.leg + 1.4 : 2.4); const L = q ? q.len : 3.2;
    c.globalAlpha *= Math.min(1, a.flay || 0);
    e(c, 0, y, L * 0.62, (q ? q.h || 1.6 : 1.6) * 0.9, 0, '#b8404a');
    c.strokeStyle = 'rgba(250,236,220,0.75)'; c.lineWidth = 0.35;
    for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(k * L * 0.18, y - 1); c.quadraticCurveTo(k * L * 0.18 + 0.3, y, k * L * 0.18, y + 1); c.stroke(); }
    e(c, -L * 0.2, y - 0.6, L * 0.2, 0.35, 0, 'rgba(250,240,225,0.6)');
  };
})(window.G);
