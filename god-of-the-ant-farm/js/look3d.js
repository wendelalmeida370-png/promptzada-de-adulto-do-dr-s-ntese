'use strict';
// ============================================================
//  Look3D: a person's look and clothes, as the 3D draws them
//  (22a, SOCIEDADE.md §3.9: cut from people3d.js with no change
//  of behaviour) — the height of their age and sex, the colours
//  of their skin and hair greying with the years, what the hands
//  and the body carry, and the clothes of their people, trade,
//  standing, wealth and the cold (outfitOf). Every choice by the
//  person's id: never a roll. Only seen: nothing here is saved,
//  nothing here changes the world. People3D asks here for the
//  look (P3.look, P3.lookInto) and puts the face's mood over it.
// ============================================================
(function (G) {
  const P3 = G.People3D; if (!P3) return;
  const Lk = G.Look3D = {};
  const itemKind = key => (G.Itens ? G.Itens.parse(key)[0] : String(key)); // (a thing's kind: as people3d.js reads it)
  // ------------------------------ looks ------------------------------
  const C3 = {};
  function color(hex) { let c = C3[hex]; if (!c) { c = new window.THREE.Color(); c.set(hex || '#888888'); C3[hex] = c; } return c; }
  const darker = (hex, f) => { const r = G.hex2rgb(hex); return '#' + r.map(v => Math.max(0, Math.min(255, Math.round(v * f))).toString(16).padStart(2, '0')).join(''); };
  // a person's look, from the world's own record of them — a new one for whoever asks (the tests, the interface); the frame keeps
  // one a person and fills it again (lookFill: nothing made each frame but what changed — L-1105)
  function lookFill(L, v, skin) {
    const fac = G.Fac.ofV ? G.Fac.ofV(v) : null;
    const facHex = fac ? G.Fac.hex(fac.id) : null;
    const cloth = v.captive ? '#8b8478' : v.age < 16 ? (v.kidCloth || '#4fa0d8') : v.role === 'guerreiro' ? (facHex || '#8a3a2a') : ((G.Art && G.Art.CLOTH && G.Art.CLOTH[v.role]) || '#c9763a');
    const ad = v.age;
    const h = ad < 2 ? 0.55 : ad < 16 ? 0.75 + (ad / 16) * 0.9 : ad >= 70 ? 1.68 : 1.75;
    L.s = (h / 1.75) * (v.g === 'f' && ad >= 14 ? 0.95 : 1);
    // (the shape and the colours from the person's genome — G.Feicao, D-552: the height about the age's, the skin, the hair, the
    // eyes; one born before the genome keeps the colour of their v.skin and v.hair. A proof's bare person, with none, as before)
    const Fe = G.Feicao ? G.Feicao.of(v) : null; L.fe = Fe;
    if (Fe) L.s *= Fe.alt;
    const skin0 = Fe ? Fe.skin : v.skin, hair0 = Fe ? Fe.hair : v.hair;
    L.robe = v.role === 'sacerdote' || v.role === 'anciao' || v.role === 'escriba' || (v.g === 'f' && ad >= 12 && (v.id % 3 !== 0));
    // (the colours: made again only when what they are made of changes — the trade's cloth, the hair greying with the years)
    // (the grey: by the genome's age for it — salt and pepper, then white, D-635 —; one with none, as before, from sixty-two)
    const gT = Fe ? Fe.greyT : ad >= 62 ? G.clamp((Math.floor(ad) - 62) / 18, 0, 0.85) : 0, grey = Math.round(gT * 50);
    if (L._cloth !== cloth || L._hair !== hair0 || L._skin !== skin0 || L._grey !== grey) {
      L._cloth = cloth; L._hair = hair0; L._skin = skin0; L._grey = grey;
      // (the hair as it is now: the feição's, the god's view paints the same — D-640; one with no genome greys by the years alone)
      const h0 = G.hex2rgb(hair0 || '#3a2a1a'), salt = G.lerpColor(h0, [150, 146, 140], 0.55);
      const hair = !Fe && grey ? (gT < 0.45 ? G.lerpColor(h0, salt, gT / 0.45) : G.lerpColor(salt, [226, 223, 216], (gT - 0.45) / 0.55)) : null;
      L.skin = skin0 || '#d8a888'; L.hair = Fe ? Fe.hairNow : hair ? '#' + hair.map(q => Math.round(q).toString(16).padStart(2, '0')).join('') : hair0 || '#3a2a1a';
      L.cloth = cloth; L.pants = darker(cloth, 0.62); L.feet = '#3a2a1e'; L.belt = darker(cloth, 0.38); L.brow = darker(L.hair, 0.8); L.nose = darker(skin0 || '#d8a888', 0.88); L.lips = darker(skin0 || '#d8a888', 0.62);
    }
    L.fem = v.g === 'f' && ad >= 13; L.bun = v.g === 'f' && ad >= 16 && v.id % 3 === 1; L.beard = v.g === 'm' && ad >= 26 && v.id % 3 === 0; L.long = v.g === 'f' && ad >= 8 && v.id % 3 !== 1; L.bald = v.g === 'm' && ad >= 55 && v.id % 4 === 0;
    L.act = v.act; L.lantern = !!v.lantern && !v.inside;
    L.strap = ad >= 14 && (v.role === 'cacador' || v.role === 'guerreiro' || v.role === 'mercador' || v.role === 'explorador' || (G.Possess && G.Possess.body && G.Possess.body() === v));
    L.id = v.id || 0; // (only for the drawing's own clocks: each one's cloth moves on its own beat)
    // (what the hands hold — the world's load, as the thing it is — and the strength that carries it: a child's, an elder's;
    // the work of the hands sets it down beside them; a load on both hands leaves none for the torch, one on the right none
    // for the thing in the hand — the god's view puts the spear away under a load too)
    L.held = P3.held(v, (fac && fac.civ) || v._civ || v.civ || 'nordico'); L.carry = !!L.held;
    L.str = (ad < 12 ? 0.35 : ad < 16 ? 0.7 : ad >= 70 ? 0.6 : ad >= 55 ? 0.8 : 1) * (v.g === 'f' ? 0.85 : 1);
    // (the things on the body: what the inventory says — G.Inv.held, the one door (D-336): a person's own things, or their trade's
    // kit — asked again only when what it reads changes)
    L.inv = invOf(v, L);
    // (22a: a hand lost holds nothing — the stump is drawn, D-555; what it held is not drawn floating where the hand was)
    const lo = v.lost; if (lo && (lo.armL || lo.armR)) { const k = L._lostOf; if (!k || k.src !== L.inv) L._lostOf = { src: L.inv, inv: Object.assign({}, L.inv, { mao: lo.armR ? null : L.inv.mao, outra: lo.armL ? null : L.inv.outra }) }; L.inv = L._lostOf.inv; }
    // (P6, D-754: the helmet the inventory puts on the head comes off under a roof and in bed — on, at one's post: the guard, the round)
    if (L.inv.cabeca && headOff(P3.dressOf(v))) { const k = L._headOf; if (!k || k.src !== L.inv) L._headOf = { src: L.inv, inv: Object.assign({}, L.inv, { cabeca: null }) }; L.inv = L._headOf.inv; }
    L.torch = torchOf(v) || (L.inv.outra === 'tocha' && !v.inside && !v.sleeping); L.cuir = cuirOf(L.inv.corpo);
    if (L.held) { if (P3.BUSY_HANDS.has(v.act) || v.sleeping) L.held = P3.setDown(L.held); if (L.held.hands.includes('L')) { L.torch = false; L.lantern = false; } }
    L.reach = null; L.pair = null; L.bind = false;
    // (how drunk the world has them — the tavern's rounds, the wine of the wells —: the body weaves, Anim.stagger)
    L.drunk = P3.drunkOf(v);
    if (skin) {
      L.out = outfitOf(v, L, fac); L.headK = L.fe ? L.fe.prop.cabeca : L.out.headK;
      // (the legs, the arms and the trunk of a child against a grown one — G.Feicao's, D-639: the rig poses the bones by them)
      L.legK = L.fe ? L.fe.prop.perna : 1; L.armK = L.fe ? L.fe.prop.braco : 1; L.trunkK = L.fe ? L.fe.prop.tronco : 1; L.armOut = L.out.skirt === 'saiaL' || L.out.cloakM || L.out.topM ? 0.07 : 0;
    }
    return L;
  }
  // what is on a person's body (G.Inv.held: { mao, outra, costas, cinto, cabeca, corpo, real }), kept by the inventory in the
  // look's memo while what it reads is the same (G.Inv.heldFor)
  function invOf(v, L) {
    if (!G.Inv || !G.Inv.held) return P3.NO_INV;
    // (the inventory keeps the answer in the look's memo while what it reads is the same: it alone reads the bag and the places — rule 128, L-1114)
    return G.Inv.heldFor ? G.Inv.heldFor(v, L._inv || (L._inv = {})) : G.Inv.held(v);
  }
  P3.drunkOf = v => (G.Atmos && G.Atmos.drunk ? G.Atmos.drunk(v) : 0);
  // (a cuirass worn: the height of its lower edge in the body as modelled — what the skin's shader takes from the hips to the
  // chest, D-351; 0 for none. The edge of a cuirass's solid part: its waist flaps, which hang free, kept out of it)
  const CUIR = new Map();
  function cuirOf(key) {
    if (!key) return 0; let e = CUIR.get(key); if (e !== undefined) return e;
    const k = itemKind(key), inf = k === 'couraca' && G.ItemArt && G.ItemArt.info ? G.ItemArt.info(key) : null, bind = G.BODYMESH && G.BODYMESH.bind && G.BODYMESH.bind.chest;
    e = inf && bind ? bind[1] + Math.max(inf.lo[1], -0.06) : 0; CUIR.set(key, e); return e;
  }
  P3.cuirOf = cuirOf;

  // ------------------------------ clothes ------------------------------
  // What a person wears, from who they are: their people (the north's tunic and wrapped legs, the apron-dress with its
  // brooches; the Greek and Roman chiton and sandals; the Egyptian kilt and broad collar; the Aztec cloak and huipil),
  // their trade (the smith's leather apron, the farmer's straw hat, the priest's robe, the warrior's helmet), their sex
  // and age, their wealth (a cloak, a brooch of gold, trims of a dyed thread), the ruler's crown, the captive's undyed
  // rags. The colour of their trade is the god's (Art.CLOTH), only softened to a dyed wool's. Every choice by the
  // person's id (G.hash): the same person always the same — never a roll. Kept a while per person (only seen).
  // And, read from the world by G.Atmos.dress (D-162): their standing among their people (v.grp — the noble's mantle of a
  // deep dye with its border, the merchant's bright cape, the craftsman's rolled sleeves, the plain people's tunic; one in a
  // dozen dresses out of their station, by their id, and goes on doing it), what their people can make (no loom standing:
  // hides and undyed wool; silk only where the people have it and the house is rich; no bronze: horn and bone for a
  // buckle, no helmet of metal; bronze, then iron), what their house has to wear (furs for a collar, jewels for the gold),
  // and the cold out of doors (a cloak; freezing, a hood too — nobody bare-chested, barefoot or short-sleeved in the snow)
  const OUT = new Map(); G.worldHooks.push(() => OUT.clear());
  const mixHex = (a, b, t) => { const p = G.hex2rgb(a), q = G.hex2rgb(b); return '#' + p.map((v, i) => Math.round(v + (q[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
  const wool = hex => mixHex(hex, '#8a7d6a', 0.28); // (a trade's colour, as a dyed wool would show it: never a neon)
  const LEATHER = ['#5a3e28', '#6b4a2e', '#4a3322', '#7a5634'], METAL = { bronze: '#b08a4a', gold: '#d8b04a', iron: '#8a8e96', silver: '#c8ccd2', bone: '#d6ccb2' };
  // (undyed: the fleece as it comes off the sheep — cream, grey, brown — and the hide)
  const RAW = ['#b9aa8c', '#a39478', '#8c7c64', '#c4b79c', '#97886c'], HIDE = ['#6e5236', '#7c5c3c', '#5e452e'];
  // (the deep dye of a noble's mantle and the bright one of a merchant's cape: each one's own, by their id — Atmos has the
  // dyes of each people, the god's view paints the same ones)
  const deepOf = (id, civ) => (G.Atmos && G.Atmos.deep ? G.Atmos.deep(id, civ) : '#6a2858'), brightOf = id => (G.Atmos && G.Atmos.bright ? G.Atmos.bright(id) : '#c8962a');
  const PURPLE = '#6a2050'; // (the border of a Roman's toga)
  // (no world to ask — a proof's bare person —: dressed as the plain people of a people that weaves and has bronze)
  const DRESS0 = { code: -1, grp: 'povo', weave: true, silk: false, fur: false, jewel: false, metal: 1, cold: 0 };
  P3.dressOf = v => (G.Atmos && G.Atmos.dress ? G.Atmos.dress(v) : DRESS0);
  const IRIS = ['#4a3020', '#5a3a22', '#3a2a1a', '#4a6a8a', '#5a7a9a', '#6a7a5a', '#7a6a3a'];
  const HAIRS = { m: ['curto', 'curto', 'rabo', 'longo', 'curto'], f: ['trancas', 'coque', 'longo', 'trancas', 'coque'] };
  // ------------------------------ under a roof, in bed (P6, D-754) ------------------------------
  // The hat comes off indoors — the sun's straw hat, the cap, the hood one walks in, the helmet — and everything on the head in bed;
  // a kerchief, a priest's hood and an order's, and the signs of an office (the laurel, the crown, the nemes, the feathers) stay on
  // awake; the helmet of one at their post (G.Atmos.dress: duty) stays on. What the world says: under a roof (v.inside), asleep
  const OFF_IN = { chapeu: 1, gorro: 1, capuz: 1, elmo: 1, galea: 1 };
  const headOff = D => D.bed || (D.inside && !D.duty);
  Lk.headOff = headOff;
  function hatIndoors(o, D, v) {
    if (!o.hatM) return; if (D.bed) { o.hatM = null; return; }
    if (!D.inside || !OFF_IN[o.hatM]) return;
    if ((o.hatM === 'elmo' || o.hatM === 'galea') && D.duty) return;
    if (o.hatM === 'capuz' && (v.robe || v.role === 'sacerdote' || v.role === 'contrabandista')) return; // (an order's hood, the smuggler's)
    o.hatM = null;
  }
  // ------------------------------ the colour of the trade, the house's dye, the hair (P6, D-755, D-756) ------------------------------
  // The trade shows where it would: the sash at the waist dyed the trade's colour (the god's, Art.CLOTH — a trade the god has no
  // colour for, one of the old dyes by the trade's name: the madder, the woad, the weld, the walnut, the kermes…), the apron of the
  // trades of the hands; the linen of the south and of the Nile a little whiter or creamier by the person; and the dye as strong as the
  // house can pay now (G.Atmos.dress: rich — washed out in a poor house, deep in a rich one, with the woven band and the beads).
  // The hair: four or five ways of each people, by the age, the standing, the marriage and the work of the hands — the one of those
  // the person's id picks: never a roll
  const DYES = ['#a8442e', '#3f5f9a', '#c8a43c', '#6a4a2e', '#8a2a3a', '#4a7a4a', '#b8783a', '#5a4a7a', '#2f7a7a', '#9a6a2a'];
  const roleDye = role => { if (G.Art && G.Art.CLOTH && G.Art.CLOTH[role]) return G.Art.CLOTH[role]; let h = 0; for (const c of role || '') h = (h * 31 + c.charCodeAt(0)) >>> 0; return DYES[G.hash(h % 100003) * DYES.length | 0]; };
  Lk.roleDye = roleDye;
  const WASH = [0.6, 0.4, 0.2, 0.05]; // (how much of the undyed thread shows in the dye, by how well off the house is)
  const LINEN = ['#f1ead6', '#ece2c8', '#f4efe2', '#e8dcc0', '#efe6d2'];
  const HANDS_T = new Set(['ferreiro', 'acougueiro', 'taverneiro', 'oleiro', 'feirante', 'salgador', 'foguista', 'apicultor', 'tecelao', 'sericultor', 'salineiro', 'construtor', 'vinhateiro']);
  // (the ways of the hair, by people and sex: [style, the causes that ask for it — an age band (a: [min, max]), the standing (hi: noble,
  // merchant, priest; a well-off house), the married (wed), the work of the hands (work)] — those of a person's causes, the id picks)
  const HAIRWAYS = {
    egipcio: { f: [['peruca', { hi: 1 }], ['chanel', {}], ['trancas', {}], ['longo', { a: [12, 24] }], ['rabo', { work: 1 }]],
      m: [['curto', {}], ['chanel', {}], ['peruca', { hi: 1 }], ['careca', { a: [30, 99] }], ['rabo', { a: [14, 26] }]] },
    grego: { f: [['coque', { wed: 1 }], ['trancas', {}], ['longo', { a: [12, 22] }], ['rabo', { work: 1 }], ['coque', { a: [35, 99] }]],
      m: [['curto', {}], ['longo', { a: [40, 99] }], ['curto', {}], ['rabo', { a: [14, 28] }]] },
    romano: { f: [['coque', { wed: 1 }], ['coque', { hi: 1 }], ['trancas', {}], ['longo', { a: [12, 20] }], ['rabo', { work: 1 }]],
      m: [['curto', {}], ['curto', {}], ['chanel', { a: [14, 24] }]] },
    classico: { f: [['coque', { wed: 1 }], ['trancas', { a: [12, 28] }], ['longo', { a: [12, 22] }], ['rabo', { work: 1 }], ['coque', {}]],
      m: [['curto', {}], ['curto', {}], ['rabo', { a: [14, 30] }], ['longo', { a: [40, 99] }]] },
    nordico: { f: [['trancas', {}], ['longo', { a: [12, 22] }], ['coque', { wed: 1 }], ['rabo', { work: 1 }], ['trancas', { a: [12, 30] }]],
      m: [['longo', {}], ['rabo', {}], ['curto', {}], ['trancas', { a: [16, 40] }], ['longo', { a: [40, 99] }]] },
    asteca: { f: [['trancas', {}], ['coque', { wed: 1 }], ['longo', { a: [12, 22] }], ['rabo', { work: 1 }], ['trancas', { a: [12, 30] }]],
      m: [['chanel', {}], ['chanel', {}], ['longo', { a: [30, 99] }], ['rabo', { a: [16, 40] }]] },
  };
  function hairWay(civ, fem, ad, hi, wed, work, k) {
    const W = HAIRWAYS[civ]; if (!W) return null; const L = W[fem ? 'f' : 'm'];
    const ok = L.filter(([, c]) => (!c.a || (ad >= c.a[0] && ad <= c.a[1])) && (!c.hi || hi) && (!c.wed || wed) && (!c.work || work));
    // (a cause of one's own counts double against the plain ways: the married woman's bun, the noble's wig)
    const w = ok.map(([, c]) => (c.hi || c.wed || c.work ? 2 : 1)); const tot = w.reduce((a, b) => a + b, 0); if (!tot) return null;
    let x = k * tot; for (let i = 0; i < ok.length; i++) { x -= w[i]; if (x < 0) return ok[i][0]; } return ok[ok.length - 1][0];
  }
  Lk.HAIRWAYS = HAIRWAYS;
  function outfitOf(v, L, fac) {
    const S = G.S; const id = v.id || 0; const now = S ? S.clock : 0;
    const civ = (fac && fac.civ) || v._civ || v.civ || 'nordico'; const CV = (G.CIVS && G.CIVS[civ]) || {};
    const home = G.Eco && G.Eco.homeOf && v.home ? G.Eco.homeOf(v) : null;
    const ruler = !!(fac && fac.leader && fac.leader === v.id);
    const wealth = v.captive ? 0 : ruler ? 3 : !home ? (v.home ? 1 : 0) : home.type === 'barraco' ? 0 : home.type === 'hut' ? 1 + ((home.coin || 0) > 25 ? 1 : 0) : 2 + ((home.coin || 0) > 40 || home.type === 'sobrado' ? 1 : 0);
    // (what the world says besides: the standing, the people's arts, the house's furs and jewels, the cold — one code)
    const D = P3.dressOf(v);
    const inv = L.inv || P3.NO_INV, worn = `${inv.cabeca || ''}/${L.cuir ? inv.corpo : ''}`; // (what the inventory puts on the head and the trunk)
    const sig = `${v.role}|${Math.floor(v.age)}|${civ}|${v.captive ? 1 : 0}|${ruler ? 1 : 0}|${wealth}|${v.robe || ''}|${v.unmask ? 1 : 0}|${v.g}|${L.cloth}|${L.hair}|${worn}|${v.partner ? 1 : 0}|${D.code}`;
    let o = OUT.get(id); if (o && o.sig === sig) return o;
    o = { sig, t: now };
    const hh = k => G.hash(id * 13 + k * 7919); // (this person's own coin flips, always the same)
    const ad = v.age, fem = v.g === 'f', kid = ad < 13, role = v.role || '';
    // (the standing: the mantle is the noble's and the merchant's — and of one in a dozen of the plain people, who dress out
    // of their station as one in a dozen of the high dress plainly: by the id, so always the same ones)
    const grp = kid || v.captive ? '' : D.grp; const odd = !!grp && hh(41) < 0.08; // (Atmos.odd: the god's view asks the same)
    const high = grp === 'nobreza' || grp === 'mercadores', low = grp === 'povo' || grp === 'artesaos';
    const mantle = high ? !odd : low ? odd : wealth >= 2;
    o.body = fem && ad >= 11 ? 'corpoF' : 'corpoM';
    o.headK = kid ? 1 + 0.32 * G.clamp(1 - ad / 13, 0, 1) : 1;
    // (the colours: the trade's, softened; the people's trim; the trousers and boots of leather and wool)
    const base = v.captive ? '#8b8478' : kid ? (v.kidCloth || '#4fa0d8') : role === 'guerreiro' ? (L.cloth) : L.cloth;
    o.cloth = wool(base); o.trim = CV.trim ? mixHex(CV.trim, ['#b33a2a', '#3f6fb0', '#c8a040', '#2f7a5a'][Math.floor(hh(1) * 4)], hh(2) * 0.5) : '#9a3a2a';
    o.pants = v.captive ? '#6a645a' : ['#4a4038', '#3e3a34', '#5a4a3a', '#4a4a44'][Math.floor(hh(3) * 4)];
    o.boots = LEATHER[Math.floor(hh(4) * LEATHER.length)]; o.belt = darker(LEATHER[Math.floor(hh(5) * LEATHER.length)], 0.8);
    // (the metal of a brooch and a buckle: gold where the house has jewels — and on a ruler —, silver on the well-off, bronze,
    // iron on the soldiers of a people that forges it; horn and bone before the bronze)
    o.metal = ruler ? METAL.gold : D.jewel || (grp === 'nobreza' && !odd && D.metal > 0) ? (hh(6) < 0.5 ? METAL.gold : METAL.silver) : D.metal === 0 ? METAL.bone : wealth >= 3 || (grp === 'mercadores' && !odd) ? METAL.silver : D.metal >= 2 && grp === 'militares' ? METAL.iron : METAL.bronze;
    o.over = o.cloth; o.beads = ['#c87a2a', '#d89a3a', '#b8582a'][Math.floor(hh(7) * 3)]; o.cloak = wool(darker(base, 0.75)); o.hat = o.cloth;
    o.iris = IRIS[(Math.floor(hh(8) * 7) + (G.hex2rgb(L.skin)[0] < 170 ? 0 : 0)) % IRIS.length];
    if (G.hex2rgb(L.skin)[0] < 175) o.iris = IRIS[Math.floor(hh(8) * 3)]; // (dark skin, dark eyes)
    if (L.fe) o.iris = L.fe.iris; // (the eyes of the genome, 22a: the person's own)
    o.lips = mixHex(L.skin, '#a8524a', fem ? 0.5 : 0.4); // (22a: a lip's own colour, the women's a little more — the first sheet of five faces)
    // (the cut: sleeves to the wrist, the round neckline, shoes to the ankle, trousers, the belt at the waist)
    o.sleeve = 0.585; o.neck = 0; o.bootTop = 0.11; o.legs = 1; o.beltY = 1.01; o.beltH = 0.017; o.overK = 0; o.strap = L.strap ? 1 : 0;
    o.torso = 0; o.motif = wealth >= 2 && hh(9) < 0.7 ? 1 : 0; o.feetK = 0; o.hem = 1; o.cloakTrim = wealth >= 2 ? 1 : 0;
    o.skirt = null; o.cloakM = null; o.hatM = null; o.beard = null; o.topM = null;
    o.hairM = ad >= 55 && !fem && hh(10) < 0.35 ? 'careca' : HAIRS[fem ? 'f' : 'm'][Math.floor(hh(11) * 5)];
    if (!fem && ad >= 22 && hh(12) < (civ === 'nordico' ? 0.62 : civ === 'grego' ? 0.5 : 0.22)) o.beard = hh(13) < 0.55 ? 'barba' : hh(13) < 0.8 ? 'curta' : 'bigode';
    o.blush = fem || kid ? 0.12 : 0.04; // (the warmth of the cheeks at rest: a little more in the women and the children — never rouge, L-1675)
    if (kid) { o.skirt = fem ? 'saiaL' : 'saiaC'; o.legs = fem ? 0 : 1; o.feetK = hh(14) < 0.45 ? 1 : 0; o.hairM = fem ? (hh(15) < 0.5 ? 'trancas' : 'longo') : 'curto'; o.motif = 0; o.sleeve = 0.45; }
    else if (civ === 'nordico') {
      if (fem) { o.skirt = 'saiaL'; o.over = wool(base); o.cloth = ['#e8e0cc', '#d8cfb8', '#c8b898'][Math.floor(hh(16) * 3)]; o.overK = 1; o.legs = 0; if (hh(17) < 0.38 && ad >= 18) o.hatM = 'lenco', o.hat = ['#e8e2d0', '#c8b898', '#9a3a2a'][Math.floor(hh(18) * 3)]; }
      else { o.skirt = 'saiaC'; o.legs = hh(19) < 0.7 ? 2 : 1; if (hh(20) < 0.3) o.hatM = 'gorro', o.hat = wool(['#7a3a2a', '#3a4a6a', '#5a5a3a', '#6a4a3a'][Math.floor(hh(21) * 4)]); }
      if (mantle && hh(22) < 0.6 || ad >= 50 && hh(22) < 0.5) o.cloakM = 'capa';
      o.bootTop = hh(23) < 0.4 ? 0.2 : 0.11;
    } else if (civ === 'grego' || civ === 'romano' || civ === 'classico') {
      o.cloth = mixHex(CV.cloth || '#efe9dc', o.cloth, kid ? 0.6 : 0.35); o.sleeve = 0.16; o.legs = 0; o.feetK = 2; o.skirt = fem ? 'saiaL' : 'saiaC'; o.bootTop = 0.0;
      if (fem) o.hairM = hh(24) < 0.7 ? 'coque' : 'longo'; else o.hairM = 'curto';
      // (a Greek woman's chiton falls doubled at the top: its overfold, a loose blouse; a rich man's mantle is a toga — of
      // white wool for a Roman — or a himation of colour; a rich woman's, a palla over the shoulders)
      if (fem && civ === 'grego' && ad >= 13) o.topM = 'bata';
      if (mantle) { if (fem) o.cloakM = 'capa', o.cloak = wool(darker(base, 0.9)); else o.cloakM = 'toga', o.cloak = civ === 'romano' ? '#ebe5d5' : wool(darker(base, 0.9)); }
    } else if (civ === 'egipcio') {
      o.cloth = '#f1ead6'; o.legs = 0; o.feetK = hh(25) < 0.5 ? 1 : 2; o.bootTop = 0; o.skirt = fem ? 'saiaL' : 'saiaC';
      if (!fem) { o.torso = wealth >= 2 || role === 'sacerdote' ? 2 : 1; o.beltY = 0.98; } else { o.sleeve = 0.04; o.torso = wealth >= 2 ? 0 : 0; }
      o.hairM = role === 'sacerdote' ? 'careca' : wealth >= 2 || (fem && hh(30) < 0.5) ? 'peruca' : 'chanel'; o.trim = CV.trim || '#2f8f8a'; o.beard = null;
    } else if (civ === 'asteca') {
      o.cloth = mixHex('#e8dcc0', o.cloth, 0.3); o.legs = 0; o.feetK = 2; o.bootTop = 0; o.trim = CV.trim || '#2fae8f'; o.motif = 1;
      // (a woman: the huipil — a loose blouse with its woven panel — over the cueitl, a wrapped skirt of a dyed cotton; a man:
      // the maxtlatl, the loincloth, and the tilmatli knotted over the shoulder)
      if (fem) { o.skirt = 'saiaL'; o.topM = 'bata'; o.overK = 3; o.over = ['#3a5a7a', '#8a3a2a', '#e8dcc0', '#4a6a3a', '#6a4a7a'][Math.floor(hh(31) * 5)]; o.sleeve = 0.18; o.hairM = hh(26) < 0.6 ? 'trancas' : 'longo'; }
      else { o.skirt = 'tanga'; o.torso = 1; o.cloakM = 'capa'; o.cloak = mixHex('#e8dcc0', base, 0.5); o.hairM = 'chanel'; }
    }
    // (the trades: the robe of the priest and the elder, the scribe's; aprons; the hats)
    if (!kid) {
      // (the robe is of the trade's wool — a woman of the north takes off her apron-dress for it, not down to her linen)
      const south = civ === 'romano' || civ === 'grego';
      if (role === 'sacerdote' || role === 'anciao' || role === 'escriba') { if (o.overK === 1) o.cloth = o.over; o.skirt = 'saiaL'; o.legs = 0; o.overK = 0; o.topM = null; o.sleeve = 0.585; if (role === 'anciao') o.cloakM = south && !fem ? 'toga' : 'capa'; if (role === 'sacerdote' && civ !== 'egipcio') { if (south) o.hatM = 'louro', o.hat = '#4a6a2a'; else o.hatM = hh(27) < 0.5 ? 'capuz' : null, o.cloak = o.cloth; } }
      if (role === 'ferreiro' || role === 'acougueiro' || role === 'taverneiro' || role === 'oleiro' || role === 'feirante') { o.overK = 2; o.over = role === 'ferreiro' ? '#5a3a24' : role === 'oleiro' ? '#b8946a' : '#e8e0cc'; o.sleeve = role === 'ferreiro' ? 0.2 : 0.42; }
      if (role === 'agricultor' || role === 'pastor' || role === 'vinhateiro' || role === 'lavrador') { o.hatM = 'chapeu'; o.hat = '#d8b86a'; o.sleeve = 0.4; }
      if (role === 'cacador' && hh(28) < 0.5) { o.hatM = 'capuz'; o.cloak = wool('#5a4a2a'); }
      // (the warriors' helmets: the crested galea of the south — its crest of red horsehair —, a lord's feathers in the jungle,
      // none on the Nile, the iron helmet of the north)
      if (role === 'guerreiro') { o.hatM = south || civ === 'classico' ? 'galea' : civ === 'asteca' ? (wealth >= 2 ? 'penacho' : null) : civ === 'egipcio' ? null : 'elmo'; o.hat = civ === 'grego' ? METAL.bronze : METAL.iron; if (o.hatM === 'galea') o.trim = '#8a2418'; o.cloth = wool(base); o.cloakM = civ === 'asteca' ? o.cloakM : wealth >= 2 || hh(29) < 0.4 ? 'capa' : o.cloakM; o.bootTop = south || civ === 'asteca' || civ === 'egipcio' ? 0 : 0.22; }
      if (role === 'pescador') { o.hatM = civ === 'nordico' ? 'gorro' : 'chapeu'; o.hat = civ === 'nordico' ? wool('#5a5a4a') : '#d8b86a'; o.sleeve = 0.3; }
      if (role === 'contrabandista') { o.cloakM = 'capa'; o.hatM = 'capuz'; o.cloak = '#2a2430'; }
      if (role === 'mercador' || role === 'ourives') { o.cloakM = 'capa'; o.motif = 1; }
      // (the helmet is of the metal the people forge: bronze, then iron — the Greek's stays of bronze —; before the bronze,
      // no helmet of metal: a cap of hide in the north, a bare head elsewhere)
      if (role === 'guerreiro' && (o.hatM === 'elmo' || o.hatM === 'galea')) { if (D.metal === 0) { o.hatM = civ === 'nordico' ? 'gorro' : null; o.hat = HIDE[Math.floor(hh(47) * HIDE.length)]; } else o.hat = D.metal >= 2 && civ !== 'grego' ? METAL.iron : METAL.bronze; }
    }
    // (P6, D-755, D-756: the colour of the trade where it shows, the dye as strong as the house can pay now — where the people weave
    // and dye at all —, and the hair of the person's causes; one dressed by an office keeps the office's dress)
    if (!kid && !v.captive) {
      const office = role === 'sacerdote' || role === 'guerreiro' || role === 'anciao' || role === 'escriba' || !!v.robe;
      if (!office && D.weave) {
        const R = D.rich, raw = RAW[Math.floor(hh(44) * RAW.length)], dye = mixHex(wool(roleDye(role)), raw, WASH[R]);
        // (the linen of the Nile as it comes, whiter or creamier; a house well off dyes it a little — the red, the blue-green of its sheaths)
        if (civ === 'egipcio') { o.cloth = LINEN[Math.floor(hh(49) * LINEN.length)]; if (R >= 2 && fem) o.cloth = mixHex(o.cloth, ['#b8402a', '#2f8f8a', '#c8a040', '#3a6ab0'][Math.floor(hh(51) * 4)], R >= 3 ? 0.42 : 0.24); }
        // (the wool and the linen of the south: undyed — the fleece's own cream, grey or brown — in a poor house; the trade's colour as the
        // house can pay it, deeper the richer)
        else if (civ === 'grego' || civ === 'romano' || civ === 'classico') o.cloth = R === 0 ? mixHex(raw, CV.cloth || '#efe9dc', 0.35) : mixHex(CV.cloth || '#efe9dc', wool(base), [0, 0.34, 0.5, 0.66][R]);
        else if (civ === 'nordico') { if (o.overK === 1) o.over = mixHex(o.over, raw, WASH[R]); else o.cloth = mixHex(o.cloth, raw, WASH[R]); }
        // (the apron of the trades of the hands where nothing is worn over the tunic — the smith's leather and the potter's clay keep theirs —,
        // the dyed sash of the others)
        if (HANDS_T.has(role) && o.overK === 0) { o.overK = 2; o.over = dye; o.sleeve = Math.min(o.sleeve, 0.42); }
        else if (o.overK !== 2 && grp !== 'artesaos') { o.belt = dye; o.beltH = 0.026; } // (narrower than the broad leather belt of the craftsman, D-163)
        if (R >= 2) o.motif = 1;
        if (civ === 'egipcio' || civ === 'asteca') o.beads = R >= 1 ? ['#2f8f8a', '#3a6ab0', '#b8402a', '#c8a040'][Math.floor(hh(50) * 4)] : '#8a7a5a';
      }
      if (!(civ === 'egipcio' && role === 'sacerdote')) {
        const hi = (D.rich >= 3 && ad >= 18) || ((grp === 'nobreza' || grp === 'mercadores' || grp === 'sacerdotes') && !odd);
        const hw = hairWay(civ, fem, ad, hi, !!v.partner, HANDS_T.has(role), hh(48)); if (hw) o.hairM = hw;
      }
    }
    // (the standing among one's people, within the people's own dress)
    o.rank = 0;
    if (grp) {
      const south = civ === 'romano' || civ === 'grego' || civ === 'classico';
      const deep = deepOf(id, civ), bright = brightOf(id);
      const trade = role === 'sacerdote' || role === 'guerreiro' || role === 'anciao' || role === 'escriba'; // (dressed by their office)
      if (grp === 'nobreza' && !odd) {
        // (the noble: the mantle of a deep dye with its woven border and the brooch; their cloth of a better dye than a
        // trade's; a Roman's toga white with its purple border; on the Nile the wig, the broad collar and gold)
        o.rank = 3; o.motif = 1; o.cloakTrim = 1;
        if (civ === 'egipcio') { o.hairM = role === 'sacerdote' ? o.hairM : 'peruca'; if (!fem && !trade) o.torso = 2; o.trim = METAL.gold; o.beads = '#2f8f8a'; }
        else {
          if (!o.cloakM) o.cloakM = south && !fem ? 'toga' : 'capa';
          if (!v.robe) { o.cloak = civ === 'romano' && o.cloakM === 'toga' ? '#ebe5d5' : wool(deep); o.trim = civ === 'romano' ? PURPLE : mixHex(deep, METAL.gold, 0.35); }
        }
        if (!trade && o.overK !== 2 && civ !== 'egipcio') { const c = wool(mixHex(base, deep, 0.5)); if (o.overK === 1 || o.overK === 3) o.over = c; else o.cloth = south ? mixHex(CV.cloth || '#efe9dc', c, 0.3) : c; }
      } else if (grp === 'mercadores' && !odd) {
        // (the merchant: a cape of a bright dye over the shoulders, the strap of the purse across the chest, a woven band)
        o.rank = 2; o.motif = 1; o.strap = 1; o.cloakTrim = 1;
        if (!o.cloakM && civ !== 'egipcio') o.cloakM = 'capa';
        if ((o.cloakM === 'capa' || (o.cloakM === 'toga' && civ !== 'romano')) && !v.robe && role !== 'contrabandista') o.cloak = wool(bright); // (a Roman's toga stays white)
        if (civ === 'egipcio') o.beads = bright;
      } else if (grp === 'artesaos') {
        // (the craftsman: the sleeves rolled to the elbow, the broad belt of the work — nothing loose in the way of the hands)
        o.rank = 1; o.sleeve = Math.min(o.sleeve, 0.42); o.beltH = 0.03;
      } else if (grp === 'militares' || grp === 'sacerdotes') o.rank = grp === 'sacerdotes' ? 2 : 1;
      // (out of their station: one of the plain people in a cape of colour — the high one's plain dress is the people's own, above)
      if (odd && low && !trade) { if (!o.cloakM) o.cloakM = 'capa'; if (o.cloakM === 'capa' && !v.robe) o.cloak = wool(bright); o.motif = 1; }
      // (the plain people: no woven band unless the house is well off)
      if (grp === 'povo' && !odd && wealth < 3) { o.motif = civ === 'asteca' ? o.motif : 0; o.cloakTrim = 0; }
    }
    if (v.robe && !v.hood) { o.cloakM = 'capa'; o.cloak = v.robe; o.hatM = v.unmask ? o.hatM : 'capuz'; }
    // (a ruler: the crown and the cloak of the people's colour — the laurel of gold and a toga of purple in the south, the nemes
    // on the Nile with the bare chest and its collar, the feathers and the turquoise cloak of the jungle)
    if (ruler && ad >= 10) { o.hatM = 'coroa'; o.cloakM = 'capa'; o.cloak = wool(darker(fac && G.Fac.hex ? G.Fac.hex(fac.id) : '#8a2a2a', 0.85)); o.metal = METAL.gold; o.motif = 1; o.cloakTrim = 1;
      if (civ === 'romano' || civ === 'grego') { o.hatM = 'louro'; o.hat = '#c8a040'; if (!fem) o.cloakM = 'toga', o.cloak = civ === 'romano' ? '#5a2048' : o.cloak; }
      else if (civ === 'egipcio') { o.hatM = 'nemes'; o.cloakM = null; if (!fem) o.torso = 2; }
      else if (civ === 'asteca') { o.hatM = 'penacho'; o.cloak = '#2f7a8a'; } }
    if (v.captive) { o.cloakM = null; o.hatM = null; o.motif = 0; o.overK = 0; o.feetK = 1; o.trim = o.cloth; o.belt = '#6a5a4a'; o.cloakTrim = 0; }
    // (what the clothes are made of: wool in the north and on soldiers, linen and cotton in the south, on the Nile and in the
    // jungle — a northern woman's dress of linen under her apron-dress of wool; an apron of leather on the smith)
    o.fab = (civ === 'nordico' && !(fem && o.overK === 1)) || role === 'guerreiro' ? 1 : 2; o.fabO = o.overK === 2 ? (role === 'ferreiro' ? 3 : 2) : o.overK === 3 ? 2 : 1;
    // (what the people can make. No loom standing among them and no cloth in the house: hides and the fleece as it comes
    // off the sheep — nothing dyed, no woven band; the robe of an order is the order's. Silk — the people have it and the
    // house is rich, or the house has a bolt of it —: a paler, finer cloth with a thread of gold)
    o.raw = 0; o.silk = 0;
    if (!D.weave && !v.robe) {
      const raw = RAW[Math.floor(hh(44) * RAW.length)], hide = HIDE[Math.floor(hh(45) * HIDE.length)]; const leather = !fem && hh(46) < 0.5;
      o.raw = leather ? 2 : 1; o.cloth = leather ? hide : raw; if (o.overK !== 2) o.over = mixHex(raw, hide, 0.35);
      o.trim = darker(o.cloth, 0.78); o.motif = 0; o.cloakTrim = 0; o.cloak = hide; o.pants = darker(hide, 0.85);
      if (o.hatM === 'gorro' || o.hatM === 'capuz' || o.hatM === 'lenco') o.hat = mixHex(raw, hide, 0.5);
      o.fab = leather ? 3 : 1; if (o.overK !== 2) o.fabO = 1;
    } else if (D.silk && !v.captive && !kid && role !== 'guerreiro' && !v.robe) {
      o.silk = 1; o.motif = 1; o.trim = METAL.gold; o.fab = 2;
      if (o.overK === 1 || o.overK === 3) o.over = mixHex(o.over, '#f6eede', 0.3); else o.cloth = mixHex(o.cloth, '#f6eede', 0.3);
    }
    // (the cold out of doors: a cloak over whatever one wears — of hide where the people do not weave —, the chest and the
    // arms covered, the legs wrapped, shoes on the feet; freezing, a hood too — a cap in the north. Indoors it comes off)
    o.cold = 0;
    if (D.cold >= 1 && !v.captive && ad >= 3) {
      o.cold = D.cold;
      if (!o.cloakM) { o.cloakM = 'capa'; o.cloak = o.raw ? HIDE[Math.floor(hh(45) * HIDE.length)] : wool(darker(base, 0.7)); o.cloakTrim = 0; }
      if (o.torso) o.torso = 0; if (o.sleeve < 0.4) o.sleeve = 0.585; if (o.feetK) { o.feetK = 0; o.bootTop = Math.max(o.bootTop, 0.11); }
      if (o.legs === 0 && o.skirt !== 'saiaL') o.legs = 2; if (o.skirt === 'tanga') o.skirt = 'saiaC';
      if (D.cold >= 2 && (!o.hatM || o.hatM === 'chapeu' || o.hatM === 'lenco' || o.hatM === 'louro')) { o.hatM = civ === 'nordico' && !fem ? 'gorro' : 'capuz'; o.hat = o.cloakM === 'capa' ? o.cloak : wool(darker(base, 0.7)); }
    }
    // (a cloak's collar of fur: the north's own — white on a ruler's —, and anyone's whose house has furs; else of its cloth)
    o.fur = o.cloakM === 'capa' && !v.robe && (civ === 'nordico' || D.fur) ? (ruler ? 2 : 1) : 0;
    // (22a, D-555: the hair and the beard of the genome — the kind of hair turns the style the people and the trade chose into its
    // waves, its curls, its tight curls; the hair goes from the temples and then from the crown with the years, early or late by the
    // gene; the beard as thick as the gene — kept to what the meshes have)
    const fe = L.fe; if (fe) {
      const has = n => !!(G.BODYMESH && G.BODYMESH.meshes && G.BODYMESH.meshes[n]);
      const T = fe.tex, H0 = o.hairM;
      const turn = { longo: ['longo', 'ondulado', 'cacheado', 'crespo'], curto: ['curto', 'curto', 'cacheado', 'crespo'], chanel: ['chanel', 'chanel', 'cacheado', 'crespo'] };
      if (H0 && turn[H0] && !(civ === 'egipcio' && H0 === 'chanel' && T < 3)) { const n = turn[H0][T]; if (has(n)) o.hairM = n; }
      if (!fem && ad >= 25 && o.hairM && o.hairM !== 'peruca' && o.hairM !== 'careca') {
        // (the years bring it on: a gene a spread above the middle at 47 is a bald one at 60 — by the whole years, as the outfit is
        // keyed: drawn again after a load, the hair must not turn, L-1672)
        const c = fe.calv + (Math.floor(ad) - 25) / 22;
        if (c > 2.2 && ad >= 40) o.hairM = 'careca'; else if (c > 1.0 && has('entradas') && (o.hairM === 'curto' || o.hairM === 'cacheado' || o.hairM === 'crespo' || o.hairM === 'ondulado')) o.hairM = 'entradas';
      }
      if (o.beard) { const d = fe.barba; o.beard = d > 0.6 ? 'barba' : d > -0.4 ? 'curta' : 'bigode'; }
      else if (!fem && ad >= 22 && fe.barba > 1.4 && civ !== 'egipcio' && !kid) o.beard = 'curta';
    }
    // (what is worn over the clothes, from the inventory (G.Inv.held, D-346): a helmet takes the hat's place and the hair under
    // it — every hair of the body would show through a helmet that fits the head, D-350; a cuirass goes over the tunic, and
    // the blouse, the toga and the cloak, whose yokes hug the trunk, are not worn over it)
    hatIndoors(o, D, v); // (under a roof, in bed: D-754)
    if (inv.cabeca) { o.hatM = null; o.hairM = null; }
    if (L.cuir) { o.topM = null; if (o.cloakM) { o.cloakM = null; o.fur = 0; } }
    // (nobody naked: the hips always under a skirt, a kilt or trousers — and no cloth the colour of its wearer's skin: a linen
    // as pale as the skin is dyed a little darker, until it reads as cloth; Body3D.bare is the verifier's own rule)
    if (!o.skirt && !(o.legs >= 1)) o.skirt = 'saiaC';
    const linOf = () => { o.lin = {}; for (const k of ['cloth', 'trim', 'pants', 'boots', 'belt', 'metal', 'over', 'beads', 'cloak', 'hat', 'iris', 'lips']) { const c = color(o[k]); o.lin[k] = [c.r, c.g, c.b]; } };
    linOf(); // (the colours once, as the graphics card wants them: linear)
    for (let k = 0; k < 3 && G.Body3D && G.Body3D.bare && G.Body3D.bare(o, L.skin); k++) { for (const q of ['cloth', 'over', 'pants']) o[q] = mixHex(o[q], '#5a4030', 0.3); linOf(); }
    OUT.set(id, o); if (OUT.size > 2000) OUT.clear();
    return o;
  }
  P3.outfit = v => outfitOf(v, P3.look(v), G.Fac.ofV ? G.Fac.ofV(v) : null);
  // (the one colour a simple figure far off is dressed in: what the fine body wears over all)
  P3.farCol = L => { const o = L.out; return o ? (o.cloakM ? o.cloak : o.overK === 1 || o.overK === 3 ? o.over : o.cloth) : L.cloth; };
  // (who carries a torch: the god's own rule — at night, walking, one in three grown people, those whose errand asks for one,
  // and those the scenes hand one to; and the body, at night, always: the player has to see)
  function torchOf(v) {
    if (v.inside || v.sleeping) return false; if (v.holdTorch) return true;
    if (G.Render.nightness() <= 0.5) return false;
    if (G.Possess && G.Possess.body && G.Possess.body() === v) return true;
    return !!(v.moving && v.age >= 14 && ((v.task && v.task.torch) || v.id % 3 === 0));
  }
  Lk.fill = lookFill;
  Lk.outfitOf = outfitOf;
  Lk.IRIS = IRIS; Lk.HAIRS = HAIRS;
})(window.G);
