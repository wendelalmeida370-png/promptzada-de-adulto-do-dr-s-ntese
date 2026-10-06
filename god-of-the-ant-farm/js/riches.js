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
    luxuries(step);
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
