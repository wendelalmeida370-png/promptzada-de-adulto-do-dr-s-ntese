'use strict';
// ============================================================
//  Estates: the land worked for more than bread. Orchards of
//  apple, olive, date, banana, açaí and mulberry; plantations
//  of cacao, coffee, pepper and frankincense; vineyards with a
//  treading vat; apiaries; the silk house fed with mulberry
//  leaves; salt pans by the sea and the salting yard. Each is
//  planted only where it grows and by a people who knows it —
//  from the wild trees nearby, from its own customs, or from
//  what its caravans brought home. Captives are sent to work
//  the plantations and the salt. The grain fields themselves
//  change with the land: wheat, barley, rice, maize, sorghum.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const Es = G.Estates = {};
  const E = G.Eco;
  const TAU = Math.PI * 2;
  const DAY = () => G.DAY_LEN;
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);

  // ------------------------------ the buildings and their people ------------------------------
  Object.assign(G.BDEF, {
    pomar: { name: 'Pomar', w: 3, h: 3, cost: { wood: 14 }, work: 14, blocks: false, hp: 70, jobs: 2, role: 'fruticultor', field: 1 },
    plantacao: { name: 'Plantação', w: 3, h: 3, cost: { wood: 16 }, work: 16, blocks: false, hp: 70, jobs: 3, role: 'lavrador', field: 1 },
    vinhedo: { name: 'Vinhedo', w: 3, h: 3, cost: { wood: 20 }, work: 16, blocks: false, hp: 70, jobs: 2, role: 'vinhateiro', field: 1 },
    apiario: { name: 'Apiário', w: 2, h: 2, cost: { wood: 10 }, work: 10, blocks: false, hp: 50, jobs: 1, role: 'apicultor', field: 1 },
    salina: { name: 'Salina', w: 3, h: 3, cost: { wood: 8, stone: 10 }, work: 16, blocks: false, hp: 90, jobs: 2, role: 'salineiro', field: 1 },
    sericultura: { name: 'Casa da Seda', w: 2, h: 2, cost: { wood: 24, stone: 10 }, work: 30, blocks: true, hp: 130, jobs: 2, role: 'sericultor' },
    salga: { name: 'Salga', w: 2, h: 2, cost: { wood: 20, stone: 6 }, work: 20, blocks: true, hp: 110, jobs: 1, role: 'salgador' },
  });
  Object.assign(G.BDESC, {
    pomar: 'Árvores frutíferas plantadas em fileiras. Levam dias para crescer e depois dão fruta todo ano: comida, azeite, tâmaras.',
    plantacao: 'Cacau, café, pimenta ou incenso, plantados onde crescem. Rende pouco para comer e muito para vender.',
    vinhedo: 'Parreiras em fileiras. As uvas são pisadas na tina e viram vinho.',
    apiario: 'Colmeias de palha perto das flores. Mel e cera sem precisar subir em árvore.',
    salina: 'Tanques rasos à beira-mar. O sol seca a água e deixa o sal, que é raspado e ensacado.',
    sericultura: 'Lagartas criadas em bandejas e alimentadas com folha de amoreira. Os casulos viram fio de seda.',
    salga: 'Sal e carne (ou peixe) viram reservas que duram meses: comida de viagem, de guerra e de inverno.',
  });
  Object.assign(G.ROLE, {
    fruticultor: ['Fruticultor', 'Fruticultora'], lavrador: ['Lavrador', 'Lavradora'], vinhateiro: ['Vinhateiro', 'Vinhateira'],
    apicultor: ['Apicultor', 'Apicultora'], salineiro: ['Salineiro', 'Salineira'], sericultor: ['Sericultor', 'Sericultora'], salgador: ['Salgador', 'Salgadeira'],
  });
  const ROLES = { fruticultor: 'pomar', lavrador: 'plantacao', vinhateiro: 'vinhedo', apicultor: 'apiario', salineiro: 'salina', sericultor: 'sericultura', salgador: 'salga' };
  for (const r in ROLES) if (!E.JOB_ROLES.includes(r)) E.JOB_ROLES.push(r);
  const EST = { pomar: 1, plantacao: 1, vinhedo: 1, apiario: 1, salina: 1, sericultura: 1, salga: 1 };
  const FIELDS = { pomar: 1, plantacao: 1, vinhedo: 1 };
  Es.is = type => !!EST[type];
  if (G.City) Object.assign(G.City.IDEAL, { pomar: 8, plantacao: 9.5, vinhedo: 8.5, apiario: 6.5, sericultura: 5, salga: 5.5 });
  if (G.Art && G.Art.CLOTH) Object.assign(G.Art.CLOTH, { fruticultor: '#6a9a3a', lavrador: '#b89a6a', vinhateiro: '#6a2a4a', apicultor: '#e8c860', salineiro: '#d8d8d0', sericultor: '#e8dcc8', salgador: '#5a7a8a' });

  // ------------------------------ what is planted ------------------------------
  // tree: the wild kind it comes from · out: what a harvest gives · n: per unit of fruit · press: crushed in the vat first
  Es.CROPS = {
    apple: { field: 'pomar', tree: 'apple', out: 'food', n: 3, name: 'Pomar de Macieiras', fruit: 'maçãs', grow: 0.4, rate: 1.1, col: '#d8302a' },
    olive: { field: 'pomar', tree: 'olive', out: 'azeite', n: 0.5, press: 1, name: 'Olival', fruit: 'azeitonas', grow: 0.32, rate: 0.9, col: '#5a5a3a', know: ['grego', 'romano', 'classico'] },
    date: { field: 'pomar', tree: 'date', out: 'tamaras', n: 1, name: 'Tamareiral', fruit: 'tâmaras', grow: 0.32, rate: 0.9, col: '#c8702a', know: ['egipcio'] },
    banana: { field: 'pomar', tree: 'banana', out: 'food', n: 4, name: 'Bananal', fruit: 'bananas', grow: 0.65, rate: 1.2, col: '#e8d03a' },
    acai: { field: 'pomar', tree: 'acai', out: 'food', n: 3, name: 'Açaizal', fruit: 'açaí', grow: 0.45, rate: 1.1, col: '#3a1a4a' },
    mulberry: { field: 'pomar', tree: 'mulberry', out: 'food', n: 2, name: 'Amoreiral', fruit: 'amoras', grow: 0.55, rate: 1.2, col: '#4a1a3a' },
    cacao: { field: 'plantacao', tree: 'cacao', out: 'cacau', n: 0.6, name: 'Cacaual', fruit: 'cacau', grow: 0.5, rate: 1, col: '#e8a030', know: ['asteca'] },
    coffee: { field: 'plantacao', tree: 'coffee', out: 'cafe', n: 0.6, name: 'Cafezal', fruit: 'café', grow: 0.6, rate: 1.1, col: '#c8202a' },
    pepper: { field: 'plantacao', tree: 'pepper', out: 'especiarias', n: 0.5, name: 'Pimental', fruit: 'pimenta', grow: 0.55, rate: 0.9, col: '#c83a2a', know: ['asteca'] },
    incense: { field: 'plantacao', tree: 'incense', out: 'incenso', n: 0.5, name: 'Bosque de Olíbano', fruit: 'resina', grow: 0.35, rate: 0.7, col: '#f2e2a8', know: ['egipcio'] },
    grape: { field: 'vinhedo', tree: null, out: 'vinho', n: 0.5, press: 1, name: 'Vinhedo', fruit: 'uvas', grow: 0.5, rate: 1, col: '#5a2a5a', know: ['grego', 'romano', 'classico', 'egipcio'] },
  };
  const CR = Es.CROPS;
  // the names the fields take from what grows in them
  const oldNameOf = G.Village.nameOf;
  G.Village.nameOf = function (type, b) { if (b && b.crop && CR[b.crop] && FIELDS[type]) return CR[b.crop].name; return oldNameOf(type, b); };
  // sampling the land round a town: does this kind grow here?
  function grows(k, set) {
    const S = G.S; const c = CR[k]; let ok = 0, n = 0;
    for (let a = 0; a < 24; a++) {
      const ang = a * 2.39996, r = 3 + (a % 6) * 2.2; const x = Math.floor(set.cx + Math.cos(ang) * r), y = Math.floor(set.cy + Math.sin(ang) * r);
      if (!W.inb(x, y)) continue; const i = y * N + x; if (S.type[i] < T.SAND || S.type[i] === T.RIVER) continue; n++;
      const bio = S.biome ? S.biome[i] : 0;
      if (k === 'grape') { if (bio === 0 || (bio === 5 && (S.moist ? S.moist[i] > 90 : true))) ok++; continue; }
      if (G.Biome && G.Biome.canGrow(c.tree, i)) ok++;
    }
    return n > 0 && ok / n >= 0.3;
  }
  // and do they know it? (wild trees they have seen, their own customs, what their caravans brought)
  function known(k, set, f) {
    const c = CR[k]; if (c.know && f && c.know.includes(f.civ)) return true;
    if (f && (f.stock[c.out] || 0) >= 1 && c.out !== 'food') return true;
    if (!c.tree) return false;
    return !!(G.Animals.treeNear && G.Animals.treeNear(set.cx, set.cy, 28, t => t.kind === c.tree));
  }
  // each people favours what it loves (and a town does not plant the same thing everywhere)
  const LOVE = { grego: { olive: 3, grape: 3 }, romano: { grape: 3, olive: 2 }, classico: { olive: 2, grape: 2 }, egipcio: { date: 3, incense: 2, grape: 1 }, asteca: { cacao: 4, pepper: 2 }, nordico: { apple: 2 } };
  function pickCrop(set, field) {
    const S = G.S; const f = G.Fac.get(set.fac); if (!f) return null;
    const have = {}; for (const b of S.buildings.values()) if (b.set === set.id && b.type === field && b.crop) have[b.crop] = (have[b.crop] || 0) + 1;
    let best = null, bs = -1e9;
    for (const k in CR) {
      if (CR[k].field !== field || !grows(k, set) || !known(k, set, f)) continue;
      const sc = ((LOVE[f.civ] || {})[k] || 0) + (CR[k].out !== 'food' ? 1 : 0) - (have[k] || 0) * 2.5 + G.hash(set.id * 7 + k.length) * 0.5;
      if (sc > bs) { bs = sc; best = k; }
    }
    return best;
  }
  Es.cropFor = function (set, field) {
    const S = G.S; const m = set._crop || (set._crop = {}); const c = m[field];
    if (c && c.d === S.day) return c.k;
    const k = pickCrop(set, field); m[field] = { d: S.day, k }; return k;
  };

  // ------------------------------ the grain of each land ------------------------------
  // (the ordinary farm changes too: barley in the north, rice in the wet, maize for the Aztecs, sorghum on the savanna)
  Es.GRAIN = {
    trigo: { name: 'Trigal', ripe: '#e0b84a', head: '#f2cc5a', green: [110, 180, 80], h: 5 },
    cevada: { name: 'Campo de Cevada', ripe: '#d8c070', head: '#e8d890', green: [120, 170, 90], h: 4.4, beard: 1 },
    arroz: { name: 'Arrozal', ripe: '#c8c060', head: '#e0d880', green: [90, 190, 90], h: 3.4, flood: 1 },
    milho: { name: 'Milharal', ripe: '#c8b050', head: '#f2c83a', green: [80, 160, 60], h: 8, ear: 1 },
    sorgo: { name: 'Sorgal', ripe: '#b8783a', head: '#a83a2a', green: [120, 170, 70], h: 6.4 },
  };
  Es.grainOf = function (b) {
    if (b.grain) return Es.GRAIN[b.grain];
    const S = G.S; const i = W.idx(b.x + 1, b.y + 1); const bio = S.biome ? S.biome[i] : 0;
    const f = G.Fac.get(G.Village.facOfSet(b.set)); const civ = (f && f.civ) || b.style;
    let wet = 0; for (let dy = -2; dy <= 4; dy++) for (let dx = -2; dx <= 4; dx++) { const x = b.x + dx, y = b.y + dy; if (W.inb(x, y) && S.type[y * N + x] === T.RIVER) wet++; }
    b.grain = civ === 'asteca' ? 'milho' : (bio === 3 || bio === 4) && wet ? 'arroz' : bio === 2 || bio === 1 || civ === 'nordico' ? 'cevada' : bio === 5 ? 'sorgo' : 'trigo';
    return Es.GRAIN[b.grain];
  };
  G.Village.nameOf = (function (prev) { return function (type, b) { if (type === 'farm' && b && b.built !== undefined && b.set !== undefined && b.x !== undefined) return Es.grainOf(b).name; return prev(type, b); }; })(G.Village.nameOf);

  // ------------------------------ silk: a secret that is found, or stolen ------------------------------
  function mulberriesNear(set, r) {
    const S = G.S;
    for (const b of E.byType(set.id, 'pomar')) if (b.crop === 'mulberry') return { b };
    const t = G.Animals.treeNear && G.Animals.treeNear(set.cx, set.cy, r || 18, q => q.kind === 'mulberry' && q.stage === 'grow' && q.size > 0.5);
    void S; return t ? { t } : null;
  }
  function silkTick(f) {
    if (f.silk) return;
    for (const s of G.S.settlements.values()) {
      if (s.fac !== f.id || (s.tier || 0) < 2) continue;
      const weavers = E.byType(s.id, 'tecelagem').length;
      if (!weavers || !mulberriesNear(s, 20)) continue;
      // a weaver notices the cocoons on the mulberry leaves (or a silk bale from abroad shows the way)
      if (G.R() > ((f.stock.seda || 0) > 0 ? 0.35 : 0.12)) continue;
      f.silk = G.S.day;
      const w = [...G.S.villagers.values()].find(v => v.set === s.id && v.role === 'tecelao') || [...G.S.villagers.values()].find(v => v.set === s.id && v.age > 16 && !v.captive);
      const who = w ? w.name : 'Uma tecelã';
      log(`${who}, de ${s.name}, reparou nos casulos das lagartas que comem folha de amoreira e desenrolou deles um fio fino como cabelo e forte como corda. ${f.name} descobriu a seda.`, 'star', s.cx, s.cy);
      G.Village.milestone('silk' + f.id, 'A seda', `${f.name} aprendeu a fiar os casulos.`, 'star');
      G.Stories && G.Stories.signal('discovery', { who: w ? w.id : 0, what: 'seda', fac: f.id, x: s.cx, y: s.cy });
      return;
    }
  }

  // ------------------------------ planning ------------------------------
  function saltCoast(set) { const S = G.S; const i = W.idx(set.cx, set.cy); const bio = S.biome ? S.biome[i] : 0; return bio === 0 || bio === 5 || bio === 6 || bio === 3; }
  const oldPlan = E.plan;
  E.plan = function (set, fac, c, want, pop) {
    oldPlan(set, fac, c, want, pop);
    const S = G.S; const t = set.tier || 0; const st = fac.stock;
    const n = k => (c[k] || 0); const site = k => !!c.siteTypes[k];
    const fed = st.food >= pop * 2;
    if (t >= 2 && pop >= 18 && fed && n('pomar') < 1 + Math.floor(pop / 75) && !site('pomar') && Es.cropFor(set, 'pomar')) want.push('pomar');
    if (t >= 2 && pop >= 22 && n('plantacao') < 1 + Math.floor(pop / 55) && !site('plantacao') && Es.cropFor(set, 'plantacao')) want.push('plantacao');
    if (t >= 2 && pop >= 22 && fed && n('vinhedo') < 1 + Math.floor(pop / 100) && !site('vinhedo') && Es.cropFor(set, 'vinhedo')) want.push('vinhedo');
    if (t >= 1 && pop >= 14 && !n('apiario') && !site('apiario') && ((st.mel || 0) >= 1 || (S.hives || []).some(h => G.dist(h.x, h.y, set.cx, set.cy) < 24))) want.push('apiario');
    if (t >= 1 && pop >= 14 && !n('salina') && !site('salina') && saltCoast(set) && Es.salinaSite(set, true)) want.push('salina');
    if (t >= 2 && pop >= 24 && fac.silk && !n('sericultura') && !site('sericultura') && mulberriesNear(set, 18)) want.push('sericultura');
    if (t >= 2 && pop >= 24 && !n('salga') && !site('salga') && ((st.sal || 0) >= 4 || n('salina')) && st.food >= pop * 2.5) want.push('salga');
  };
  // salt pans: flat ground on the shore, the sea on one side
  Es.salinaSite = function (set, test) {
    const S = G.S; if (test && set._salDay === S.day) return set._sal;
    let best = null, bs = -1e9; const R = Math.min(20, Math.round((set.radius || 8) + 6));
    const cx = Math.floor(set.cx), cy = Math.floor(set.cy);
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      const x = cx + dx, y = cy + dy; if (x < 3 || y < 3 || x + 4 > N - 3 || y + 4 > N - 3) continue;
      let ok = true;
      for (let ty = y; ty < y + 3 && ok; ty++) for (let tx = x; tx < x + 3; tx++) { const i = ty * N + tx; const tt = S.type[i]; if (tt < T.SAND || tt === T.RIVER || S.occ[i] || S.objAt[i] || S.treeAt[i] || S.wall[i] || S.road[i] || S.fire[i] > 0) { ok = false; break; } }
      if (!ok) continue;
      let sea = 0; for (let k = -1; k <= 3; k++) for (const [tx, ty] of [[x - 1, y + k], [x + 3, y + k], [x + k, y - 1], [x + k, y + 3]]) if (W.inb(tx, ty) && S.type[ty * N + tx] <= T.SEA) sea++;
      if (sea < 3) continue;
      const sl = W.slope(x, y, 3, 3); if (sl > 0.7) continue;
      const sc = -G.dist(x + 1.5, y + 1.5, set.cx, set.cy) + sea * 0.3 - sl * 3;
      if (sc > bs) { bs = sc; best = [x, y]; if (test) break; }
    }
    if (test) { set._salDay = S.day; set._sal = best; }
    return best;
  };
  const oldSite = E.findSite;
  E.findSite = function (set, type) { if (type === 'salina') return Es.salinaSite(set, false); return oldSite(set, type); };
  const oldPlaced = E.onPlaced;
  E.onPlaced = function (b) {
    oldPlaced(b);
    if (FIELDS[b.type]) { const set = G.S.settlements.get(b.set); b.crop = set ? Es.cropFor(set, b.type) : null; if (!b.crop) b.crop = b.type === 'vinhedo' ? 'grape' : b.type === 'pomar' ? 'apple' : 'coffee'; if (set) set._crop = null; }
  };
  // planted when finished: saplings that take days to bear
  function initEstate(b) {
    if (FIELDS[b.type] && !b.pl) b.pl = Array.from({ length: 9 }, (_, k) => ({ g: CR[b.crop] && CR[b.crop].press && k === 8 ? -1 : 0.02 + G.hash(b.id + k) * 0.04, f: 0 }));
    if (b.type === 'apiario' && !b.hv) b.hv = [0.5, 0.3, 0.6, 0.2];
    if (b.type === 'salina' && !b.salt) b.salt = Array.from({ length: 9 }, () => 0);
  }
  const vatOf = b => (CR[b.crop] && CR[b.crop].press ? 8 : -1);
  Es.plantPos = (b, k) => [b.x + (k % 3) + 0.5, b.y + Math.floor(k / 3) + 0.5];

  // ------------------------------ growth: every couple of seconds ------------------------------
  function grow(dt) {
    const S = G.S; const dayF = dt / DAY();
    const rain = S.weather.rain > 0.2, drought = S.weather.drought > 0, night = G.isNight();
    for (const b of S.buildings.values()) {
      if (!EST[b.type] || !b.built) continue;
      initEstate(b);
      const burnt = S.fire[W.idx(b.x + 1, b.y + 1)] > 0.3;
      if (FIELDS[b.type]) {
        const c = CR[b.crop]; if (!c) continue;
        const wet = drought ? 0.3 : rain ? 1.2 : 1; const aq = b.aqua ? 1.25 : 1;
        for (const p of b.pl) {
          if (p.g < 0) continue;
          if (burnt) { p.g = Math.min(p.g, 0.05); p.f = 0; continue; }
          if (p.g < 1) p.g = Math.min(1, p.g + dayF * c.grow * wet * aq);
          else p.f = Math.min(3, p.f + dayF * c.rate * wet * aq * (G.Flora && G.Flora.hiveNear(b.x + 1.5, b.y + 1.5, 9) ? 1.25 : 1));
        }
      } else if (b.type === 'apiario') {
        let fl = 0; for (let dy = -3; dy <= 4; dy++) for (let dx = -3; dx <= 4; dx++) { const x = b.x + dx, y = b.y + dy; if (!W.inb(x, y)) continue; const i = y * N + x; if (S.type[i] === T.MEADOW || (S.bloom && S.bloom[i] > 0)) fl++; else { const o = S.occ[i] && S.buildings.get(S.occ[i]); if (o && (o.type === 'pomar' || o.type === 'farm' || o.type === 'vinhedo')) fl += 0.6; } }
        const r = (0.6 + Math.min(1.6, fl / 14)) * (drought ? 0.5 : rain ? 0.6 : 1);
        for (let k = 0; k < 4; k++) b.hv[k] = Math.min(3, b.hv[k] + dayF * r * 1.1);
      } else if (b.type === 'salina') {
        const bio = S.biome ? S.biome[W.idx(b.x + 1, b.y + 1)] : 0;
        const sun = rain ? -0.6 : night ? 0.05 : (bio === 6 ? 1.5 : bio === 5 ? 1.2 : 0.8) * (drought ? 1.4 : 1);
        for (let k = 0; k < 9; k++) b.salt[k] = G.clamp(b.salt[k] + dayF * sun * 1.4, 0, 3);
      }
    }
  }

  // ------------------------------ how many hands each estate needs ------------------------------
  const oldDemand = E.demand;
  E.demand = function (set, fac, A) {
    const out = oldDemand(set, fac, A);
    const mine = {}; let tot = 0; const add = (r, n) => { if (n > 0) { mine[r] = (mine[r] || 0) + n; tot += n; } };
    for (const type in EST) for (const b of E.byType(set.id, type)) {
      initEstate(b);
      const role = G.BDEF[type].role;
      if (FIELDS[type]) { let ripe = 0, young = 0; for (const p of b.pl) { if (p.g < 0) continue; if (p.f >= 1) ripe++; else if (p.g < 1) young++; } add(role, ripe >= 3 ? G.BDEF[type].jobs : ripe || young ? 1 : 0); }
      else if (type === 'apiario') add(role, b.hv.some(h => h >= 1) ? 1 : 0);
      else if (type === 'salina') add(role, b.salt.filter(s => s >= 1).length >= 3 ? 2 : b.salt.some(s => s >= 1) ? 1 : 0);
      else if (type === 'sericultura') add(role, fac.silk ? 2 : 0);
      else if (type === 'salga') add(role, (fac.stock.sal || 0) >= 1 || (b.inv && b.inv.carne_seca > 0) ? 1 : 0);
    }
    const pop = G.Village.pop(set.id); const hungry = fac.stock.food < pop * 1.5;
    // the hands go one by one: first one to each estate, then the rest, as far as the town can spare
    let budget = Math.max(hungry ? 0 : 1, Math.floor(A * (hungry ? 0.08 : 0.2)));
    const give = {};
    for (let round = 0; budget > 0 && round < 4; round++) for (const r in mine) { if (budget <= 0) break; if ((give[r] || 0) < mine[r]) { give[r] = (give[r] || 0) + 1; budget--; } }
    for (const r in give) out[r] = (out[r] || 0) + give[r];
    void tot; return out;
  };

  // ------------------------------ the day's work ------------------------------
  const oldJob = E.jobTask;
  E.jobTask = function (v, H) {
    if (!ROLES[v.role]) return oldJob(v, H);
    const S = G.S; const b = v.job && S.buildings.get(v.job);
    if (!b || !b.built || !EST[b.type]) return null;
    const f = G.Fac.ofV(v); if (!f) return null; E.ensure(f); initEstate(b);
    return estateTask(v, b, f, H);
  };
  const free = (b, k, v) => { const c = b.claim && b.claim[k]; return !c || c === v.id || !G.S.villagers.has(c); };
  function claim(b, k, v) { (b.claim || (b.claim = {}))[k] = v.id; }
  function estateTask(v, b, f, H) {
    const I = b.inv || (b.inv = {});
    if (FIELDS[b.type]) {
      const c = CR[b.crop]; if (!c) return null;
      // full vat: tread it; full store: haul it
      if (c.press && (I[c.out] || 0) >= 3) return H.setTask(v, { type: 'haul', id: b.id, pri: 1, keys: [c.out] });
      if (c.press && (b.must || 0) >= 2 && free(b, 'vat', v)) { claim(b, 'vat', v); const p = Es.plantPos(b, vatOf(b)); return H.setTask(v, { type: 'estate', id: b.id, do: 'press', k: 'vat', x: p[0] - 0.05, y: p[1] - 0.05, pri: 1 }); }
      let pick = -1, pf = 0, tend = -1, tg = 2;
      for (let k = 0; k < 9; k++) { const p = b.pl[k]; if (p.g < 0 || !free(b, k, v)) continue; if (p.f >= 1 && p.f > pf) { pf = p.f; pick = k; } else if (p.g < 1 && p.g < tg && !(p.tT > G.S.clock)) { tg = p.g; tend = k; } }
      if (pick >= 0) { claim(b, pick, v); const p = Es.plantPos(b, pick); return H.setTask(v, { type: 'estate', id: b.id, do: 'harvest', k: pick, x: p[0] + 0.32, y: p[1] + 0.3, pri: 1 }); }
      if (tend >= 0) { claim(b, tend, v); const p = Es.plantPos(b, tend); return H.setTask(v, { type: 'estate', id: b.id, do: 'tend', k: tend, x: p[0] + 0.3, y: p[1] + 0.32, pri: 1 }); }
      if (c.press && (I[c.out] || 0) > 0) return H.setTask(v, { type: 'haul', id: b.id, pri: 1, keys: [c.out] });
      return null;
    }
    if (b.type === 'apiario') {
      let k = -1, best = 1; for (let q = 0; q < 4; q++) if (b.hv[q] >= best && free(b, q, v)) { best = b.hv[q]; k = q; }
      if (k < 0) return null; claim(b, k, v); const p = hivePos(b, k);
      return H.setTask(v, { type: 'estate', id: b.id, do: 'smoke', k, x: p[0] + 0.3, y: p[1] + 0.3, pri: 1 });
    }
    if (b.type === 'salina') {
      let k = -1, best = 1; for (let q = 0; q < 9; q++) if (b.salt[q] >= best && free(b, q, v)) { best = b.salt[q]; k = q; }
      if (k < 0) return null; claim(b, k, v); const p = Es.plantPos(b, k);
      return H.setTask(v, { type: 'estate', id: b.id, do: 'rake', k, x: p[0] + 0.25, y: p[1] + 0.3, pri: 1 });
    }
    if (b.type === 'sericultura') {
      if (!f.silk) return null;
      if ((I.seda || 0) >= 2) return H.setTask(v, { type: 'haul', id: b.id, pri: 1, keys: ['seda'] });
      if ((b.worms || 0) >= 3) return H.setTask(v, { type: 'estate', id: b.id, do: 'reel', pri: 1 });
      if ((b.leaves || 0) >= 1) return H.setTask(v, { type: 'estate', id: b.id, do: 'feed', pri: 1 });
      const src = leafSource(b, v); if (!src) return (I.seda || 0) > 0 ? H.setTask(v, { type: 'haul', id: b.id, pri: 1, keys: ['seda'] }) : null;
      return H.setTask(v, { type: 'estate', id: b.id, do: 'leaves', x: src[0], y: src[1], tree: src[2], pri: 1 });
    }
    if (b.type === 'salga') {
      if ((I.carne_seca || 0) >= 4) return H.setTask(v, { type: 'haul', id: b.id, pri: 1, keys: ['carne_seca'] });
      if ((I.sal || 0) >= 1 && (I.food || 0) >= 4) return H.setTask(v, { type: 'estate', id: b.id, do: 'salt', pri: 1 });
      const need = (I.sal || 0) < 1 ? 'sal' : 'food';
      if ((f.stock[need] || 0) >= (need === 'sal' ? 1 : 8)) return H.setTask(v, { type: 'fetch', id: b.id, k: need, n: need === 'sal' ? Math.min(3, Math.floor(f.stock.sal)) : 8, pri: 1 });
      if ((I.carne_seca || 0) > 0) return H.setTask(v, { type: 'haul', id: b.id, pri: 1, keys: ['carne_seca'] });
      return null;
    }
    return null;
  }
  const hivePos = (b, k) => [b.x + 0.5 + (k % 2), b.y + 0.5 + Math.floor(k / 2)];
  function leafSource(b, v) {
    const S = G.S;
    for (const o of E.byType(b.set, 'pomar')) if (o.crop === 'mulberry' && o.pl) { const k = o.pl.findIndex(p => p.g >= 0.8); if (k >= 0) { const p = Es.plantPos(o, k); return [p[0] + 0.3, p[1] + 0.3, 0]; } }
    const t = G.Animals.treeNear && G.Animals.treeNear(b.x + 1, b.y + 1, 18, q => q.kind === 'mulberry' && q.stage === 'grow' && q.size > 0.5 && W.sameLand(v.x, v.y, q.x, q.y));
    void S; return t ? [t.x + 0.35, t.y + 0.35, t.id] : null;
  }

  // ------------------------------ running the work ------------------------------
  function walk(v, t, x, y, dt, H) { if (!t.go) { t.go = 1; if (!H.goto(v, x, y, false)) return -1; } if (H.move(v, dt, 0.95)) { t.go = 0; return 1; } return 0; }
  function walkB(v, t, b, dt, H) { if (!t.gob) { t.gob = 1; if (!G.Vg.gotoB(v, b, 0.25)) return -1; } if (H.move(v, dt)) { t.gob = 0; return 1; } return 0; }
  const unclaim = (b, k) => { if (b.claim) delete b.claim[k]; };
  function done(v, b, t, H) { unclaim(b, t.k); H.end(v); }
  const faceTo = (v, x, y) => G.faceTo(v, x - v.x, y - v.y);
  const mul = v => (G.Vg.workMul ? G.Vg.workMul(v) : 1);
  const oldRun = E.run;
  E.run = function (v, t, dt, H) { if (t.type === 'estate') return runEstate(v, t, dt, H), true; return oldRun(v, t, dt, H); };
  function runEstate(v, t, dt, H) {
    const S = G.S; const b = S.buildings.get(t.id);
    if (!b || !b.built) return H.end(v);
    const f = G.Fac.ofV(v); if (!f) return done(v, b, t, H);
    const I = b.inv || (b.inv = {});
    switch (t.do) {
      case 'harvest': case 'tend': {
        const p = b.pl && b.pl[t.k]; const c = CR[b.crop]; if (!c || (!p && t.st !== 2)) { v.carry = v.carry && v.carry.must !== undefined ? null : v.carry; return done(v, b, t, H); }
        if (!t.st) { const r = walk(v, t, t.x, t.y, dt, H); if (r < 0) return done(v, b, t, H); if (r > 0) { t.st = 1; v.actT = 0; } return; }
        const pp = Es.plantPos(b, t.k); faceTo(v, pp[0], pp[1]);
        if (t.do === 'tend') {
          v.act = b.type === 'vinhedo' ? 'pick' : 'dig';
          if (G.R() < dt * 1.2) G.FX && G.FX.chips(pp[0], pp[1], '#7a5a3a');
          if (v.actT < 3 / mul(v)) return;
          p.g = Math.min(1, p.g + 0.08); p.tT = S.clock + 30; return done(v, b, t, H);
        }
        if (t.st === 1) {
          // the tall trees are climbed, the low ones picked standing, the vines cut with a knife
          v.act = (c.tree === 'date' || c.tree === 'acai') ? 'climb' : c.tree === 'coffee' || c.tree === 'pepper' || !c.tree ? 'harvest' : 'pick';
          if (v.actT < 3.4 / mul(v)) return;
          const take = Math.min(p.f, 2); p.f -= take;
          if (c.press) { v.carry = { k: 'food', n: 0, basket: c.col, must: take }; t.st = 2; unclaim(b, t.k); t.k = 'vat'; const q = Es.plantPos(b, vatOf(b)); t.x = q[0] - 0.05; t.y = q[1] - 0.05; t.go = 0; return; }
          const n = c.out === 'food' ? Math.max(1, Math.round(take * c.n)) : Math.max(1, Math.round(take * c.n * 1.6));
          v.carry = c.out === 'food' ? { k: 'food', n, basket: c.col } : { k: c.out, n };
          E.made(f, c.out, n); E.pay(v, c.out, n); first(f, b, c);
          G.Vg.emote(v, 'happy', 1); unclaim(b, t.k); H.end(v); G.Vg.setTask(v, { type: 'deliver', pri: 1, kind: 'work' });
          return;
        }
        // with the basket to the vat
        const r = walk(v, t, t.x, t.y, dt, H); if (r < 0) { v.carry = null; return done(v, b, t, H); }
        if (r > 0) { b.must = (b.must || 0) + ((v.carry && v.carry.must) || 0); v.carry = null; H.end(v); }
        return;
      }
      case 'press': {
        const c = CR[b.crop]; if (!c) return done(v, b, t, H);
        if (!t.st) { const r = walk(v, t, t.x, t.y, dt, H); if (r < 0) return done(v, b, t, H); if (r > 0) { t.st = 1; v.actT = 0; } return; }
        v.act = b.crop === 'grape' ? 'press' : 'crank'; G.faceTo(v, 1, -1);
        if (G.R() < dt * 3) G.FX && G.FX.chips(v.x + G.rr(-0.2, 0.2), v.y + 0.1, b.crop === 'grape' ? '#6a1a3a' : '#8a8a3a');
        if (v.actT < 5 / mul(v)) return;
        const m = Math.min(b.must || 0, 4); b.must = (b.must || 0) - m;
        const n = Math.max(1, Math.round(m * c.n * 1.2)); I[c.out] = (I[c.out] || 0) + n;
        E.made(f, c.out, n); first(f, b, c);
        return done(v, b, t, H);
      }
      case 'smoke': {
        const h = b.hv; if (!h) return done(v, b, t, H);
        if (!t.st) { const r = walk(v, t, t.x, t.y, dt, H); if (r < 0) return done(v, b, t, H); if (r > 0) { t.st = 1; v.actT = 0; } return; }
        const hp = hivePos(b, t.k); faceTo(v, hp[0], hp[1]); v.act = 'smoke';
        b.angry = S.clock + 3;
        if (G.FX && G.R() < dt * 5) G.FX.spawn({ x: v.x + G.rr(-0.2, 0.2), y: v.y + G.rr(-0.2, 0.2), z: 8, vz: G.rr(5, 10), vx: G.rr(-0.3, 0.3), life: G.rr(1, 1.8), s0: 1.4, s1: 4.5, c: 'rgba(220,220,220,0.5)', k: 2 });
        if (G.R() < dt * 0.4) G.Audio && G.Audio.at(hp[0], hp[1], 'bees');
        if (v.actT < 4.2 / mul(v)) return;
        const take = Math.min(h[t.k], 2); h[t.k] -= take;
        const n = Math.max(1, Math.round(take * 1.3));
        v.carry = { k: 'mel', n, extra: G.R() < 0.6 ? { cera: 1 } : null }; if (!v.carry.extra) delete v.carry.extra;
        E.made(f, 'mel', n); E.pay(v, 'mel', n); first(f, b, { out: 'mel' });
        unclaim(b, t.k); H.end(v); G.Vg.setTask(v, { type: 'deliver', pri: 1, kind: 'work' });
        return;
      }
      case 'rake': {
        if (!t.st) { const r = walk(v, t, t.x, t.y, dt, H); if (r < 0) return done(v, b, t, H); if (r > 0) { t.st = 1; v.actT = 0; } return; }
        const pp = Es.plantPos(b, t.k); faceTo(v, pp[0], pp[1]); v.act = 'rake';
        if (G.R() < dt * 2) G.FX && G.FX.chips(pp[0], pp[1], '#f4f4f0');
        if (v.actT < 4 / mul(v)) return;
        const take = Math.min(b.salt[t.k], 3); b.salt[t.k] -= take;
        const n = Math.max(1, Math.round(take * 1.4));
        v.carry = { k: 'sal', n }; E.made(f, 'sal', n); E.pay(v, 'sal', n); first(f, b, { out: 'sal' });
        unclaim(b, t.k); H.end(v); G.Vg.setTask(v, { type: 'deliver', pri: 1, kind: 'work' });
        return;
      }
      case 'leaves': {
        if (!t.st) { const r = walk(v, t, t.x, t.y, dt, H); if (r < 0) return H.end(v); if (r > 0) { t.st = 1; v.actT = 0; } return; }
        if (t.st === 1) { v.act = 'pick'; if (v.actT < 3 / mul(v)) return; v.carry = { k: 'food', n: 0, basket: '#5a9a3a', leaves: 1 }; t.st = 2; return; }
        const r = walkB(v, t, b, dt, H); if (r < 0) { v.carry = null; return H.end(v); }
        if (r > 0) { v.carry = null; b.leaves = (b.leaves || 0) + 2; H.end(v); }
        return;
      }
      case 'feed': case 'reel': {
        if (!t.st) { const r = walkB(v, t, b, dt, H); if (r < 0) return H.end(v); if (r > 0) { t.st = 1; v.actT = 0; } return; }
        const [cx, cy] = G.Village.center(b); faceTo(v, cx, cy);
        if (t.do === 'feed') { v.act = 'feed'; if (v.actT < 4 / mul(v)) return; b.leaves = Math.max(0, (b.leaves || 0) - 1); b.worms = (b.worms || 0) + 1; return H.end(v); }
        v.act = 'reel'; if (v.actT < 6 / mul(v)) return;
        b.worms = Math.max(0, (b.worms || 0) - 3); I.seda = (I.seda || 0) + 1; E.made(f, 'seda', 1); first(f, b, { out: 'seda' });
        G.FX && G.FX.sparkle(v.x, v.y); return H.end(v);
      }
      case 'salt': {
        if (!t.st) { const r = walkB(v, t, b, dt, H); if (r < 0) return H.end(v); if (r > 0) { t.st = 1; v.actT = 0; } return; }
        const [cx, cy] = G.Village.center(b); faceTo(v, cx, cy); v.act = 'salt';
        if (G.R() < dt * 2) G.FX && G.FX.chips(v.x + v.face * 0.3, v.y, '#f4f4f0');
        if (v.actT < 6 / mul(v)) return;
        if ((I.sal || 0) < 1 || (I.food || 0) < 4) return H.end(v);
        I.sal -= 1; I.food -= 4; E.used(f, 'sal', 1); E.used(f, 'food', 4);
        I.carne_seca = (I.carne_seca || 0) + 2; E.made(f, 'carne_seca', 2); first(f, b, { out: 'carne_seca' });
        return H.end(v);
      }
    }
    H.end(v);
  }
  // the first harvest of an estate is news
  function first(f, b, c) {
    const fs = f.estFirst || (f.estFirst = {}); const k = c.out + (b.crop || ''); if (fs[k]) return; fs[k] = G.S.day;
    const set = G.S.settlements.get(b.set); const nm = G.Village.buildName(b); const [x, y] = G.Village.center(b);
    const TXT = {
      azeite: `A primeira prensa ${G.gen(nm) === 'a' ? 'da' : 'do'} ${nm} de ${set ? set.name : f.name} encheu as ânforas de azeite verde.`,
      vinho: `Pisaram as primeiras uvas na tina ${G.gen(nm) === 'a' ? 'da' : 'do'} ${nm} de ${set ? set.name : f.name}: ${f.name} tem vinho.`,
      mel: `As colmeias de palha de ${set ? set.name : f.name} deram o primeiro mel sem ninguém precisar subir em árvore.`,
      sal: `Os tanques da salina de ${set ? set.name : f.name} secaram ao sol e deixaram o primeiro sal.`,
      seda: `O primeiro fio de seda saiu da Casa da Seda de ${set ? set.name : f.name}.`,
      carne_seca: `A salga de ${set ? set.name : f.name} pendurou as primeiras mantas de carne-seca: reserva para viagens, guerras e anos ruins.`,
    };
    const txt = TXT[c.out] || (c.name ? `${G.cap(G.gen(nm) === 'a' ? 'a' : 'o')} ${nm} de ${set ? set.name : f.name} deu a primeira colheita de ${c.fruit}.` : null);
    if (txt) log(txt, c.out === 'mel' ? 'food' : 'trade', x, y);
  }
  // captives are sent to the plantations and the salt
  Es.captiveTask = function (v, H) {
    const S = G.S; const f = G.Fac.ofV(v); if (!f) return null;
    for (const type of ['plantacao', 'salina', 'vinhedo', 'pomar']) for (const b of S.buildings.values()) {
      if (b.type !== type || !b.built || G.Village.facOfSet(b.set) !== f.id || G.dist2(b.x, b.y, v.x, v.y) > 30 * 30) continue;
      initEstate(b); const t = estateTask(v, b, f, H); if (t) return t;
    }
    return null;
  };

  // ------------------------------ update ------------------------------
  let tG = 0, tSilk = 0;
  Es.update = function (dt) {
    const S = G.S; if (!S) return;
    tG += dt; tSilk += dt;
    if (tG >= 2) { grow(tG); tG = 0; }
    if (tSilk >= 20) { tSilk = 0; for (const f of G.Fac.all()) silkTick(f); }
  };

  // ------------------------------ words ------------------------------
  const oldText = E.taskText;
  E.taskText = function (v, t) {
    if (t.type !== 'estate') return oldText(v, t);
    const b = G.S.buildings.get(t.id); const c = b && CR[b.crop]; const nm = b ? G.Village.buildName(b) : 'o campo';
    switch (t.do) {
      case 'harvest': return t.st === 2 ? `Levando ${c ? c.fruit : 'a colheita'} para a tina` : t.st ? `Colhendo ${c ? c.fruit : ''}` : `Indo colher ${c ? c.fruit : ''} no ${nm}`;
      case 'tend': return b && b.type === 'vinhedo' ? 'Podando as parreiras' : b && b.type === 'pomar' ? 'Cuidando das mudas do pomar' : 'Capinando entre as mudas';
      case 'press': return b && b.crop === 'grape' ? 'Pisando uvas na tina' : 'Prensando azeitonas';
      case 'smoke': return 'Defumando as colmeias para tirar o mel';
      case 'rake': return 'Raspando o sal dos tanques';
      case 'leaves': return t.st === 2 ? 'Levando folhas de amoreira às lagartas' : 'Colhendo folhas de amoreira';
      case 'feed': return 'Alimentando as lagartas da seda';
      case 'reel': return 'Desenrolando os casulos em fio de seda';
      case 'salt': return 'Salgando carne e pendurando para secar';
    }
    return null;
  };
  const oldHTML = E.buildingHTML;
  E.buildingHTML = function (b, plink, esc) {
    let h = oldHTML(b, plink, esc);
    if (!EST[b.type] || !b.built) return h;
    initEstate(b);
    if (FIELDS[b.type] && CR[b.crop]) {
      const c = CR[b.crop]; const pl = b.pl.filter(p => p.g >= 0); const grown = pl.filter(p => p.g >= 1).length, ripe = pl.filter(p => p.f >= 1).length;
      const avg = pl.reduce((s, p) => s + Math.min(1, p.g), 0) / Math.max(1, pl.length);
      h += `<div class="doing">${grown < pl.length ? `Mudas crescendo: <b>${Math.round(avg * 100)}%</b> · ` : ''}${grown} de ${pl.length} ${b.type === 'vinhedo' ? 'parreiras' : 'pés'} dando ${esc(c.fruit)}${ripe ? ` · <b>${ripe}</b> prontos para colher` : ''}${c.press ? ` · tina: ${Math.round((b.must || 0) * 10) / 10}` : ''}<br><span class="muted">Dá ${esc(G.Eco.name(c.out))}${c.out === 'food' ? '' : ` (vale ${G.Eco.PRICE[c.out]} cada)`}</span></div>`;
    } else if (b.type === 'apiario') h += `<div class="doing">Mel nas colmeias: ${b.hv.map(x => Math.round(x * 10) / 10).join(' · ')}</div>`;
    else if (b.type === 'salina') h += `<div class="doing">Sal nos tanques: <b>${Math.round(b.salt.reduce((s, x) => s + x, 0))}</b>${G.S.weather.rain > 0.2 ? ' · <em>a chuva está dissolvendo o sal</em>' : ''}</div>`;
    else if (b.type === 'sericultura') { const f = G.Fac.ofSet(b.set); h += `<div class="doing">${f && f.silk ? `Folhas: ${b.leaves || 0} · lagartas prontas: ${b.worms || 0}` : 'Ninguém aqui sabe ainda criar o bicho-da-seda.'}</div>`; }
    return h;
  };

  // ------------------------------ drawing ------------------------------
  G.renderHooks = G.renderHooks || { ground: [], ents: [] };
  const SOIL = { pomar: 'rgba(120,150,70,0.32)', plantacao: 'rgba(104,74,44,0.5)', vinhedo: 'rgba(150,112,72,0.45)', apiario: 'rgba(140,170,80,0.35)', salina: 'rgba(200,190,170,0.6)' };
  G.renderHooks.ground.push(function (c, proj, view, t, nightF, diamond) {
    const S = G.S;
    for (const b of S.buildings.values()) {
      if (!SOIL[b.type]) continue;
      const [cx, cy] = G.Village.center(b); const p = proj(cx, cy, 2);
      if (p[0] < view[0] - 90 || p[0] > view[2] + 90 || p[1] < view[1] - 60 || p[1] > view[3] + 90) continue;
      c.fillStyle = b.built ? SOIL[b.type] : 'rgba(150,120,80,0.3)'; diamond(b.x + 0.05, b.y + 0.05, b.x + b.w - 0.05, b.y + b.h - 0.05, 0.02); c.fill();
      if (!b.built) continue;
      initEstate(b);
      if (b.type === 'plantacao' || b.type === 'vinhedo') { // rows
        c.strokeStyle = b.type === 'vinhedo' ? 'rgba(90,60,30,0.45)' : 'rgba(60,40,20,0.5)'; c.lineWidth = 0.7; c.beginPath();
        for (let r = 0; r < 3; r++) { const y = b.y + r + 0.5; const a = proj(b.x + 0.15, y, W.hAt(b.x + 0.15, y)), e = proj(b.x + 2.85, y, W.hAt(b.x + 2.85, y)); c.moveTo(a[0], a[1]); c.lineTo(e[0], e[1]); }
        c.stroke();
      } else if (b.type === 'pomar') {
        c.fillStyle = 'rgba(110,80,50,0.35)'; for (let k = 0; k < 9; k++) { const [x, y] = Es.plantPos(b, k); const q = proj(x, y, W.hAt(x, y)); c.beginPath(); c.ellipse(q[0], q[1], 7, 3.5, 0, 0, TAU); c.fill(); }
      } else if (b.type === 'salina') { // pans of brine, white where the salt is left
        for (let k = 0; k < 9; k++) {
          const x = b.x + (k % 3), y = b.y + Math.floor(k / 3); const s = b.salt[k] / 3;
          c.fillStyle = '#9a8a70'; diamond(x + 0.04, y + 0.04, x + 0.96, y + 0.96, 0.02); c.fill();
          c.fillStyle = G.rgb(G.lerpColor([120, 190, 215], [246, 246, 240], Math.min(1, s * 1.2))); diamond(x + 0.12, y + 0.12, x + 0.88, y + 0.88, 0.03); c.fill();
          if (s < 0.6 && !nightF) { c.fillStyle = 'rgba(255,255,255,' + (0.18 + 0.12 * Math.sin(t * 2 + k)) + ')'; const q = proj(x + 0.45, y + 0.4, W.hAt(x + 0.45, y + 0.4)); c.fillRect(q[0] - 3, q[1] - 0.4, 6, 0.8); }
        }
      } else if (b.type === 'apiario') {
        for (let k = 0; k < 16; k++) { const x = b.x + 0.15 + G.hash(b.id + k) * 1.7, y = b.y + 0.15 + G.hash(b.id * 3 + k) * 1.7; const q = proj(x, y, W.hAt(x, y)); c.fillStyle = ['#f2d05a', '#e86a8a', '#ffffff', '#b88ae8'][k % 4]; c.fillRect(q[0] - 0.6, q[1] - 1, 1.2, 1.2); }
      }
    }
  });
  // what stands in the fields, sorted with the people among them
  const entCache = new WeakMap();
  function ents(b) {
    let l = entCache.get(b); if (l && l.n === (b.pl ? b.pl.length : 0) + (b.crop || '')) return l.list;
    const list = [];
    if (FIELDS[b.type]) for (let k = 0; k < 9; k++) list.push({ b, k, fn: drawPlant });
    if (b.type === 'apiario') for (let k = 0; k < 4; k++) list.push({ b, k, fn: drawSkep });
    if (b.type === 'salina') for (let k = 0; k < 9; k++) list.push({ b, k, fn: drawHeap });
    entCache.set(b, l = { n: (b.pl ? b.pl.length : 0) + (b.crop || ''), list }); return list;
  }
  G.renderHooks.ents.push(function (add, view, zoom) {
    const S = G.S; if (!S) return;
    for (const b of S.buildings.values()) {
      if (!EST[b.type] || G.BDEF[b.type].blocks) continue;
      if (!b.built) { if (FIELDS[b.type] || b.type === 'apiario') add(b.x + b.y + b.w, { b, fn: drawStakes }, b.x + b.w / 2, b.y + b.h / 2); continue; }
      initEstate(b);
      for (const e of ents(b)) {
        const [x, y] = b.type === 'apiario' ? hivePos(b, e.k) : Es.plantPos(b, e.k);
        add(x + y + 0.1, e, x, y);
      }
    }
  });
  // a site being laid out: stakes and string
  function drawStakes(c, e, sx, sy) {
    const b = e.b; const n = Math.round(4 + b.progress * 8);
    c.strokeStyle = '#7a5a3a'; c.lineWidth = 0.7;
    for (let k = 0; k < n; k++) { const dx = ((k % 4) - 1.5) * 0.7, dy = (Math.floor(k / 4) - 1) * 0.7; const o = G.Render.off(dx, dy); c.beginPath(); c.moveTo(sx + o[0], sy + o[1]); c.lineTo(sx + o[0], sy + o[1] - 4); c.stroke(); }
  }
  // an orchard or plantation tree, a vine, or the vat and the press
  const pseudo = new WeakMap();
  function drawPlant(c, e, sx, sy, t) {
    const b = e.b; const p = b.pl[e.k]; const cr = CR[b.crop]; if (!cr) return;
    const Art = G.Art;
    if (p.g < 0) return drawVat(c, b, sx, sy, t);
    if (b.type === 'vinhedo') return drawVine(c, b, p, sx, sy, t);
    if (p.g < 0.25) { Art.draw(c, Art.sapling(), sx, sy, 0.5 + p.g * 1.5); return; }
    let o = pseudo.get(p); if (!o) pseudo.set(p, o = { kind: cr.tree, v: (b.id + e.k) % 3, id: b.id * 9 + e.k, size: 1, fruit: 0 });
    o.kind = cr.tree; o.fruit = p.f;
    const s = (cr.tree === 'coffee' || cr.tree === 'pepper' || cr.tree === 'incense' ? 0.75 : 0.5) * (0.45 + 0.55 * Math.min(1, p.g));
    const sway = Math.sin(t * 1.4 + e.k * 1.7) * 0.5 * s;
    if (cr.tree === 'date' || cr.tree === 'acai' || cr.tree === 'banana') { Art.draw(c, Art.canopy(cr.tree, o.v), sx + sway, sy, s); }
    else { Art.draw(c, Art.trunk(cr.tree, o.v), sx, sy, s); Art.draw(c, Art.canopy(cr.tree, o.v), sx + sway, sy, s); }
    if (p.f > 0.2) Art.fruit(c, o, sx + sway, sy, s);
  }
  function drawVine(c, b, p, sx, sy, t) {
    const g = Math.min(1, p.g);
    // stakes and the wire along the row
    c.strokeStyle = '#6a4a2c'; c.lineWidth = 0.7;
    for (const dx of [-7, 7]) { c.beginPath(); c.moveTo(sx + dx, sy + dx * 0.5); c.lineTo(sx + dx, sy + dx * 0.5 - 9); c.stroke(); }
    c.strokeStyle = 'rgba(80,60,40,0.6)'; c.lineWidth = 0.3; c.beginPath(); c.moveTo(sx - 7, sy - 3.5 - 4.5); c.lineTo(sx + 7, sy + 3.5 - 4.5); c.moveTo(sx - 7, sy - 3.5 - 8); c.lineTo(sx + 7, sy + 3.5 - 8); c.stroke();
    // the vine: a twisted stem, then leaves along the wires
    c.strokeStyle = '#5a3a22'; c.lineWidth = 1; c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(sx - 1, sy - 3, sx, sy - 5 * Math.max(0.3, g)); c.stroke();
    const n = Math.round(3 + g * 9); const sw = Math.sin(t * 1.5 + b.id) * 0.4;
    for (let k = 0; k < n; k++) { const f = (k / Math.max(1, n - 1)) * 2 - 1; const x = sx + f * 6.5 + sw, y = sy + f * 3.25 - 6 - (k % 2) * 2.4; c.fillStyle = k % 3 ? '#5a8a32' : '#6a9a3a'; c.beginPath(); c.ellipse(x, y, 1.7, 1.2, 0.4, 0, TAU); c.fill(); }
    // purple bunches as the grapes ripen
    const bunches = Math.round(Math.min(3, p.f) * 1.7);
    for (let k = 0; k < bunches; k++) { const f = ((k + 0.5) / 6) * 2 - 1; const x = sx + f * 6 + sw, y = sy + f * 3 - 4.6; c.fillStyle = p.f >= 1 ? '#4a1a4a' : '#7a8a3a'; for (let q = 0; q < 5; q++) { c.beginPath(); c.arc(x + (q % 2) * 0.6 - 0.3, y + Math.floor(q / 2) * 0.6, 0.45, 0, TAU); c.fill(); } }
  }
  function drawVat(c, b, sx, sy, t) {
    const wine = b.crop === 'grape'; const m = Math.min(1, (b.must || 0) / 4);
    if (wine) { // a wide wooden tub
      c.fillStyle = '#6a4a2c'; c.beginPath(); c.ellipse(sx, sy - 1, 7, 3.4, 0, 0, Math.PI); c.lineTo(sx - 7, sy - 4); c.lineTo(sx + 7, sy - 4); c.closePath(); c.fill(); c.fillRect(sx - 7, sy - 4.6, 14, 3.6);
      c.fillStyle = '#4a3020'; c.beginPath(); c.ellipse(sx, sy - 4.6, 7, 3.4, 0, 0, TAU); c.fill();
      c.fillStyle = m > 0 ? '#5a1a3a' : '#3a2a1a'; c.beginPath(); c.ellipse(sx, sy - 4.4, 6.2, 2.8, 0, 0, TAU); c.fill();
      if (m > 0.1) { c.fillStyle = 'rgba(160,60,110,0.5)'; c.beginPath(); c.ellipse(sx - 1.6, sy - 4.8, 2 + Math.sin(t * 3) * 0.3, 0.8, 0, 0, TAU); c.fill(); }
      c.strokeStyle = '#8a6a44'; c.lineWidth = 0.4; for (const z of [1.8, 3.4]) { c.beginPath(); c.ellipse(sx, sy - z, 7, 3.4, 0, 0.1, Math.PI - 0.1); c.stroke(); }
      // amphorae waiting
      const n = Math.min(3, Math.floor((b.inv && b.inv.vinho) || 0)); for (let k = 0; k < n; k++) G.Arch.kit().jar(c, sx + 9 + k * 2.6, sy + 1 + k * 1.3, 0.8, '#b8704a');
      return;
    }
    // the olive press: a stone basin and a beam
    c.fillStyle = '#9a958c'; c.beginPath(); c.ellipse(sx, sy - 1.5, 6, 3, 0, 0, TAU); c.fill(); c.fillRect(sx - 6, sy - 3.4, 12, 2);
    c.fillStyle = '#b8b2a6'; c.beginPath(); c.ellipse(sx, sy - 3.4, 6, 3, 0, 0, TAU); c.fill();
    c.fillStyle = m > 0 ? '#6a6a3a' : '#7a7468'; c.beginPath(); c.ellipse(sx, sy - 3.4, 4.6, 2.2, 0, 0, TAU); c.fill();
    c.fillStyle = '#8a8478'; c.beginPath(); c.ellipse(sx + Math.sin(t * 0.8) * 1.6, sy - 5.2, 1.8, 2.8, 0, 0, TAU); c.fill();
    c.strokeStyle = '#6a4a2c'; c.lineWidth = 1; c.beginPath(); c.moveTo(sx - 7, sy - 6); c.lineTo(sx + 7, sy - 4.4); c.stroke();
    const n = Math.min(3, Math.floor((b.inv && b.inv.azeite) || 0)); for (let k = 0; k < n; k++) G.Arch.kit().jar(c, sx + 9 + k * 2.6, sy + 1 + k * 1.3, 0.8, '#b8704a');
  }
  // straw skeps with the bees round them
  function drawSkep(c, e, sx, sy, t) {
    const b = e.b; const h = b.hv ? b.hv[e.k] : 0;
    c.fillStyle = '#6a4a2c'; c.fillRect(sx - 4, sy - 2.4, 8, 1.4);
    c.fillStyle = '#d8b062'; c.beginPath(); c.moveTo(sx - 3.6, sy - 2.4); c.quadraticCurveTo(sx - 3.8, sy - 9.4, sx, sy - 9.8); c.quadraticCurveTo(sx + 3.8, sy - 9.4, sx + 3.6, sy - 2.4); c.closePath(); c.fill();
    c.strokeStyle = '#a8803a'; c.lineWidth = 0.4; for (let k = 1; k < 5; k++) { const y = sy - 2.4 - k * 1.5; const w = 3.6 * Math.sqrt(1 - Math.pow(k / 5.2, 2)); c.beginPath(); c.moveTo(sx - w, y); c.lineTo(sx + w, y); c.stroke(); }
    c.fillStyle = '#3a2a1a'; c.beginPath(); c.ellipse(sx + 0.6, sy - 3.4, 0.9, 0.6, 0, 0, TAU); c.fill();
    const angry = b.angry > G.S.clock; const n = angry ? 14 : 2 + Math.round(h * 2); c.fillStyle = '#2a2010';
    for (let k = 0; k < n; k++) { const a = t * (1.6 + (k % 4) * 0.5) + k * 2.3, r = (angry ? 5 : 3) + Math.sin(t * 2 + k) * 1.2; c.fillRect(sx + Math.cos(a) * r, sy - 6 + Math.sin(a * 1.3) * r * 0.6, 0.45, 0.45); }
  }
  // heaps of raked salt
  function drawHeap(c, e, sx, sy) {
    const b = e.b; const s = b.salt ? b.salt[e.k] : 0; if (s < 1.6) return;
    const h = 1.5 + (s - 1.6) * 1.6;
    c.fillStyle = '#f6f6f2'; c.beginPath(); c.moveTo(sx - 3, sy); c.lineTo(sx, sy - h); c.lineTo(sx + 3, sy); c.closePath(); c.fill();
    c.fillStyle = 'rgba(180,180,190,0.5)'; c.beginPath(); c.moveTo(sx, sy - h); c.lineTo(sx + 3, sy); c.lineTo(sx + 0.6, sy); c.closePath(); c.fill();
  }

  // ------------------------------ the silk house and the salting yard ------------------------------
  if (G.Arch && G.Arch.EXT) {
    const K = G.Arch.kit(); const { P, poly, ln, walls, box, roof, shade, jar, barrel } = K;
    const house = (c, m, p, st, x0, y0, x1, y1, H) => {
      box(c, x0 - 0.04, y0 - 0.04, x1 + 0.04, y1 + 0.04, 0, 1.5, p.base[0], p.base[1], p.base[2]);
      walls(c, x0, y0, x1, y1, 1.5, H, p.wl, p.wr); K.onL(c, y1, (x0 + x1) / 2 - 0.1, (x0 + x1) / 2 + 0.1, 1.5, 8, p.door);
      K.winsR(c, m, p, x1, y0, y1, H * 0.55, 2.4, 2);
      if (st === 'nordico') return roof(c, m, p, x0, y0, x1, y1, H, { kind: 'turf' });
      if (st === 'egipcio' || st === 'asteca') return roof(c, m, p, x0, y0, x1, y1, H, { par: 1.2 });
      return roof(c, m, p, x0, y0, x1, y1, H, {});
    };
    G.Arch.EXT.sericultura = {
      maxz: 44, draw(c, m, p, st) {
        house(c, m, p, st, -0.9, -0.9, 0.2, 0.1, 15);
        // racks of trays under an open roof, white with cocoons
        for (const [x, y] of [[0.4, -0.75], [0.85, -0.75], [0.4, -0.1], [0.85, -0.1]]) box(c, x - 0.03, y - 0.03, x + 0.03, y + 0.03, 0, 11, '#6e4a2c', '#553820', '#6e4a2c');
        for (const z of [3, 6, 9]) { poly(c, [P(0.35, -0.8, z), P(0.9, -0.8, z), P(0.9, -0.05, z), P(0.35, -0.05, z)], '#c8b088', 'rgba(80,60,30,0.4)', 0.3); for (let k = 0; k < 6; k++) { const q = P(0.42 + (k % 3) * 0.17, -0.6 + Math.floor(k / 3) * 0.35, z + 0.3); c.fillStyle = '#f8f4ea'; c.beginPath(); c.ellipse(q[0], q[1], 1, 0.6, 0, 0, Math.PI * 2); c.fill(); } }
        poly(c, [P(0.3, -0.85, 12.5), P(0.95, -0.85, 12), P(0.95, 0, 11), P(0.3, 0, 11.5)], st === 'nordico' ? '#5a7631' : p.roof[0], 'rgba(0,0,0,0.3)', 0.4);
        // skeins of silk drying on a line, and a mulberry bush
        ln(c, P(-0.8, 0.6, 9), P(0.6, 0.6, 9), 'rgba(80,60,30,0.6)', 0.3); for (const x of [-0.8, 0.6]) ln(c, P(x, 0.6, 0), P(x, 0.6, 9.4), '#6a4a2c', 0.6);
        for (let k = 0; k < 5; k++) { const q = P(-0.65 + k * 0.28, 0.6, 9); c.strokeStyle = ['#f6eede', '#f2e6a8', '#e8c8c0', '#f6eede', '#d8e0f0'][k]; c.lineWidth = 0.9; c.beginPath(); c.ellipse(q[0], q[1] + 2.4, 0.7, 2.2, 0, 0, Math.PI * 2); c.stroke(); }
        const t = P(0.75, 0.6, 0); c.fillStyle = '#4a7a2a'; c.beginPath(); c.arc(t[0], t[1] - 4, 3.4, 0, Math.PI * 2); c.fill(); c.fillStyle = '#4a1a3a'; c.fillRect(t[0] - 1, t[1] - 5, 0.8, 0.8); c.fillRect(t[0] + 1, t[1] - 3.4, 0.8, 0.8);
        void shade; void jar; void barrel;
        return 24;
      },
    };
    G.Arch.EXT.salga = {
      maxz: 40, draw(c, m, p, st) {
        house(c, m, p, st, -0.9, -0.9, 0.1, 0.0, 13);
        // drying racks hung with fish and meat
        for (const y of [0.25, 0.75]) {
          for (const x of [-0.85, 0.85]) ln(c, P(x, y, 0), P(x, y, 10), '#6a4a2c', 0.7);
          ln(c, P(-0.85, y, 9.6), P(0.85, y, 9.6), '#5a3c22', 0.6); ln(c, P(-0.85, y, 6), P(0.85, y, 6), '#5a3c22', 0.5);
          for (let k = 0; k < 7; k++) { const q = P(-0.75 + k * 0.25, y, 9.6); const fish = (k + (y > 0.5 ? 1 : 0)) % 2; c.fillStyle = fish ? '#d8d0b8' : '#8a3a2a'; c.beginPath(); c.ellipse(q[0], q[1] + 1.8, fish ? 0.8 : 0.6, fish ? 2 : 1.6, 0, 0, Math.PI * 2); c.fill(); if (fish) { c.fillStyle = '#c8c0a8'; c.beginPath(); c.moveTo(q[0] - 0.8, q[1] + 3.6); c.lineTo(q[0], q[1] + 3); c.lineTo(q[0] + 0.8, q[1] + 3.6); c.fill(); } }
        }
        for (const [x, y] of [[0.45, -0.6], [0.7, -0.35]]) { const q = P(x, y, 0); barrel(c, q[0], q[1], 1); c.fillStyle = '#f4f4f0'; c.beginPath(); c.ellipse(q[0], q[1] - 6.4, 2.2, 1, 0, 0, Math.PI * 2); c.fill(); }
        return 22;
      },
    };
  }
})(window.G);
