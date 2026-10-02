'use strict';
// ============================================================
//  Economy: goods and the chains that make them. Herds in the
//  corral, wool carried to the loom, ore from the mine to the
//  forge, gold to the goldsmith and to the god's statue; markets,
//  fairs, taverns, wages, taxes collected door to door and the
//  black market that grows where taxes bite. Every worker has a
//  home and a workplace, and walks between them.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const E = G.Eco = {};
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);
  const DAY = () => G.DAY_LEN;
  const oa = v => (v && v.g === 'f' ? 'a' : 'o');

  // ------------------------------ goods ------------------------------
  E.GOODS = {
    la: { name: 'lã', title: 'Lã', price: 0.4, col: '#f2eee2' },
    tecido: { name: 'tecido', title: 'Tecido', price: 1.6, col: '#c8503a' },
    couro: { name: 'couro', title: 'Couro', price: 0.9, col: '#8a5a34' },
    minerio: { name: 'minério', title: 'Minério', price: 0.6, col: '#7a5a4a' },
    ferramentas: { name: 'ferramentas', title: 'Ferramentas', price: 2, col: '#9aa0a8' },
    armas: { name: 'armas', title: 'Armas', price: 2.6, col: '#b8bcc4' },
    ouro: { name: 'ouro', title: 'Ouro', price: 5, col: '#f2c14e' },
    joias: { name: 'joias', title: 'Joias', price: 9, col: '#e8b83a' },
    argila: { name: 'argila', title: 'Argila', price: 0.2, col: '#a86a44' },
    ceramica: { name: 'cerâmica', title: 'Cerâmica', price: 1.1, col: '#c8683a' },
    moedas: { name: 'moedas', title: 'Moedas', price: 1, col: '#e8c24a' },
  };
  E.KEYS = Object.keys(E.GOODS);
  E.PRICE = { food: 0.25, wood: 0.3, stone: 0.35 };
  for (const k of E.KEYS) E.PRICE[k] = E.GOODS[k].price;
  E.name = k => (E.GOODS[k] ? E.GOODS[k].name : ({ food: 'comida', wood: 'madeira', stone: 'pedra', water: 'água' })[k] || k);
  E.ensure = function (f) { if (!f || !f.stock) return; for (const k of E.KEYS) if (typeof f.stock[k] !== 'number') f.stock[k] = 0; if (!f.eco) f.eco = { made: {}, used: {}, day: G.S ? G.S.day : 0, tax: 0, wages: 0, sales: 0 }; };
  const oldCreate = G.Fac.create;
  G.Fac.create = function (o) { const f = oldCreate(o); E.ensure(f); return f; };
  G.Fac._nullStock = Object.assign(G.Fac._nullStock, Object.fromEntries(E.KEYS.map(k => [k, 0])));
  function made(f, k, n) { E.ensure(f); f.eco.made[k] = (f.eco.made[k] || 0) + n; }
  function used(f, k, n) { E.ensure(f); f.eco.used[k] = (f.eco.used[k] || 0) + n; }
  E.made = made; E.used = used;

  // ------------------------------ buildings ------------------------------
  Object.assign(G.BDEF, {
    curral: { name: 'Curral', w: 3, h: 3, cost: { wood: 16 }, work: 12, blocks: false, hp: 80, jobs: 2, role: 'pastor', pen: 8 },
    estabulo: { name: 'Estábulo', w: 3, h: 3, cost: { wood: 30, stone: 8 }, work: 26, blocks: false, hp: 140, jobs: 2, role: 'cavalarico', pen: 7 },
    acougue: { name: 'Açougue', w: 1, h: 1, cost: { wood: 12, stone: 6 }, work: 16, blocks: true, hp: 100, jobs: 1, role: 'acougueiro' },
    tecelagem: { name: 'Tecelagem', w: 2, h: 2, cost: { wood: 24, stone: 8 }, work: 26, blocks: true, hp: 140, jobs: 3, role: 'tecelao' },
    mina: { name: 'Mina', w: 1, h: 1, cost: { wood: 18, stone: 4 }, work: 18, blocks: true, hp: 260, jobs: 4, role: 'mineiro' },
    forja: { name: 'Forja', w: 2, h: 2, cost: { wood: 18, stone: 26 }, work: 32, blocks: true, hp: 190, jobs: 2, role: 'ferreiro' },
    ourives: { name: 'Ourivesaria', w: 1, h: 1, cost: { wood: 10, stone: 16 }, work: 24, blocks: true, hp: 140, jobs: 1, role: 'ourives' },
    olaria: { name: 'Olaria', w: 2, h: 2, cost: { wood: 16, stone: 12 }, work: 22, blocks: true, hp: 130, jobs: 2, role: 'oleiro' },
    feira: { name: 'Feira', w: 3, h: 3, cost: { wood: 20 }, work: 14, blocks: false, hp: 999, jobs: 4, role: 'feirante' },
    taverna: { name: 'Taverna', w: 2, h: 2, cost: { wood: 26, stone: 8 }, work: 24, blocks: true, hp: 130, jobs: 1, role: 'taverneiro' },
    administracao: { name: 'Administração', w: 2, h: 2, cost: { wood: 24, stone: 44 }, work: 50, blocks: true, hp: 260, civic: 1, jobs: 2, role: 'escriba' },
    coletoria: { name: 'Coletoria', w: 1, h: 1, cost: { wood: 12, stone: 26 }, work: 30, blocks: true, hp: 240, jobs: 3, role: 'cobrador' },
    mercado_negro: { name: 'Mercado Clandestino', w: 1, h: 1, cost: { wood: 8 }, work: 8, blocks: true, hp: 60, jobs: 2, role: 'contrabandista' },
    estatua: { name: 'Estátua de Ouro', w: 1, h: 1, cost: { stone: 24, ouro: 18 }, work: 60, blocks: true, hp: 420, civic: 1 },
  });
  G.BDEF.mercado.jobs = 3; G.BDEF.mercado.role = 'mercador';
  Object.assign(G.BDESC, {
    curral: 'Cercado com gado de verdade. Pastores levam o rebanho para pastar, tosquiam, ordenham — e os animais dão cria.',
    estabulo: 'Cavalos criados por cavalariços. Sem eles não há cavalaria nem carros de guerra.',
    acougue: 'O açougueiro busca um animal no curral, abate e leva a carne ao armazém. O couro fica para os artesãos.',
    tecelagem: 'Teares: a lã tosquiada vira tecido para roupas, velas de navio e tendas de campanha.',
    mina: 'Galerias escavadas num veio de minério ou de ouro. Mineiros entram, somem na montanha e voltam carregados.',
    forja: 'Minério e carvão viram ferramentas (trabalho mais rápido) e armas (sem elas não há exército de verdade).',
    ourives: 'O ouro bruto vira joias — luxo das casas ricas e oferendas aos deuses.',
    olaria: 'Argila tirada da beira do rio, torneada e cozida no forno: potes e ânforas para as casas e o comércio.',
    feira: 'Toda manhã, barracas se armam: feirantes vendem comida e mercadorias, e mercadores de outros povos aparecem.',
    taverna: 'À noite, quem terminou o trabalho vem comer, beber e conversar.',
    administracao: 'Escribas contam gente, grãos e impostos. Menos desvio, mais ordem e mais lealdade.',
    coletoria: 'Coletores batem de porta em porta cobrando impostos, e o ouro vira moeda cunhada. Exige a Moeda.',
    mercado_negro: 'Num beco escuro, contrabandistas vendem o que foi desviado dos armazéns — sem imposto nenhum.',
    estatua: 'Uma estátua do deus, coberta de ouro trazido pelos carregadores. Brilha ao sol e à luz das tochas.',
  });
  Object.assign(G.ROLE, {
    pastor: ['Pastor', 'Pastora'], cavalarico: ['Cavalariço', 'Cavalariça'], acougueiro: ['Açougueiro', 'Açougueira'],
    tecelao: ['Tecelão', 'Tecelã'], ferreiro: ['Ferreiro', 'Ferreira'], ourives: ['Ourives', 'Ourives'], oleiro: ['Oleiro', 'Oleira'],
    mercador: ['Mercador', 'Mercadora'], feirante: ['Feirante', 'Feirante'], taverneiro: ['Taverneiro', 'Taverneira'],
    escriba: ['Escriba', 'Escriba'], cobrador: ['Coletor de Impostos', 'Coletora de Impostos'], contrabandista: ['Contrabandista', 'Contrabandista'],
  });
  // roles that belong to a workplace
  E.JOB_ROLES = ['pastor', 'cavalarico', 'acougueiro', 'tecelao', 'ferreiro', 'ourives', 'oleiro', 'mercador', 'feirante', 'taverneiro', 'escriba', 'cobrador', 'contrabandista'];
  E.JOB_OF = {}; for (const k in G.BDEF) if (G.BDEF[k].role) E.JOB_OF[G.BDEF[k].role] = (E.JOB_OF[G.BDEF[k].role] || []).concat(k);
  E.isJobRole = r => E.JOB_ROLES.includes(r);
  if (G.City) Object.assign(G.City.IDEAL, { curral: 8.5, estabulo: 9.5, acougue: 5, tecelagem: 5.5, forja: 6.2, ourives: 3.6, olaria: 7, feira: 4.2, taverna: 3.8, administracao: 3, coletoria: 3.2, mercado_negro: 9, estatua: 2.2 });

  // ------------------------------ livestock of each people ------------------------------
  E.HERDS = { grego: ['ovelha', 'cabra'], romano: ['porco', 'ovelha', 'vaca'], egipcio: ['vaca', 'cabra'], nordico: ['ovelha', 'vaca'], asteca: ['peru'], classico: ['ovelha', 'vaca'] };
  // herds per pen, rebuilt once per tick (the renderer and the jobs ask many times)
  let herdS = null, herdT = -1; const HERDS = new Map(); const NONE = [];
  E.penAnimals = b => {
    const S = G.S;
    if (herdS !== S || herdT !== S.clock) { herdS = S; herdT = S.clock; HERDS.clear(); for (const a of S.animals.values()) if (a.pen && !a.dead) { let l = HERDS.get(a.pen); if (!l) HERDS.set(a.pen, l = []); l.push(a); } }
    return HERDS.get(b.id) || NONE;
  };
  E.penDirty = () => { herdT = -1; };
  // buildings by settlement and type, rebuilt every second
  let idxS = null, idxT = -1e9; const IDX = new Map(); const EMPTY = [];
  E.byType = function (setId, type) {
    const S = G.S;
    if (idxS !== S || S.clock - idxT > 1 || S.clock < idxT) { idxS = S; idxT = S.clock; IDX.clear(); for (const b of S.buildings.values()) { if (!b.built) continue; let m = IDX.get(b.set); if (!m) IDX.set(b.set, m = {}); (m[b.type] || (m[b.type] = [])).push(b); } }
    const m = IDX.get(setId); return (m && m[type]) || EMPTY;
  };
  function penOf(fid, pred) { for (const s of G.S.settlements.values()) { if (s.fac !== fid) continue; for (const t of ['curral', 'estabulo']) for (const b of E.byType(s.id, t)) if (!pred || pred(b)) return b; } return null; }
  E.horses = function (fid) { let n = 0; for (const a of G.S.animals.values()) if (a.kind === 'cavalo' && a.dom === fid && !a.dead && a.grown >= 1) n++; return n; };
  function spawnStock(b, kind, n, silent) {
    const set = G.S.settlements.get(b.set); const fid = set ? set.fac : 0;
    for (let k = 0; k < n; k++) {
      const x = b.x + G.rr(0.5, b.w - 0.5), y = b.y + G.rr(0.5, b.h - 0.5);
      G.Animals.spawn(kind, x, y, { dom: fid, pen: b.id, grown: G.R() < 0.3 ? 0.6 : 1, age: G.rr(0.5, 4), hunger: 0.1, hx: x, hy: y, state: 'pen' });
    }
    E.penDirty();
    if (!silent && set) { const sp = G.Animals.DEF[kind]; log(`${set.name} recebeu seus primeiros animais: ${n} ${G.Animals.plural(sp, n).replace(/^\d+ /, '')}.`, 'deer', b.x + 1, b.y + 1); }
  }
  E.spawnStock = spawnStock;
  function penKind(b) { if (b.kind) return b.kind; const s = G.S.settlements.get(b.set); const f = s && G.Fac.get(s.fac); const opts = E.HERDS[(f && f.civ) || 'classico']; if (b.type === 'estabulo') return (b.kind = 'cavalo'); let have = {}; for (const o of G.S.buildings.values()) if (o.type === 'curral' && o.set === b.set && o.kind) have[o.kind] = 1; b.kind = opts.find(k => !have[k]) || opts[0]; return b.kind; }
  E.penKind = penKind;

  // ------------------------------ ore deposits ------------------------------
  E.genDeposits = function (S) {
    const rng = G.mulberry32((S.seed || 1) * 31 + 7);
    S.ores = [];
    const want = { ferro: Math.max(3, Math.round(N * N / 1500)), ouro: Math.max(2, Math.round(N * N / 3200)) };
    for (const kind of ['ferro', 'ouro']) {
      let tries = 0;
      while (S.ores.filter(o => o.kind === kind).length < want[kind] && tries++ < 3000) {
        const x = Math.floor(rng() * (N - 8)) + 4, y = Math.floor(rng() * (N - 8)) + 4; const i = y * N + x;
        const t = S.type[i]; if (t < T.SAND || t === T.RIVER) continue;
        const h = W.tileH(i);
        // iron in the rocky highlands; gold in mountains, deserts and the jungle's rivers
        const bio = S.biome ? S.biome[i] : 0;
        let ok = kind === 'ferro' ? (t === T.ROCKY || h > G.SEA + 3.2) : (t === T.ROCKY && h > G.SEA + 2.4) || ((bio === 6 || bio === 4) && rng() < 0.25);
        if (!ok) continue;
        if (S.ores.some(o => G.dist(o.x, o.y, x, y) < 9)) continue;
        if (S.starts && S.starts.some(p => G.dist(p[0], p[1], x, y) < 5)) continue;
        if (S.occ[i] || S.objAt[i] || S.treeAt[i]) continue;
        const max = kind === 'ferro' ? Math.round(160 + rng() * 120) : Math.round(50 + rng() * 60);
        S.ores.push({ id: S.nextId++, x, y, kind, amt: max, max, mine: 0 });
      }
    }
  };
  E.oreAt = i => { const S = G.S; if (!S.ores) return null; const x = i % N, y = (i / N) | 0; return S.ores.find(o => o.x === x && o.y === y) || null; };

  // ------------------------------ planning ------------------------------
  const has = (fid, k) => G.Civ.has(fid, k);
  E.plan = function (set, fac, c, want, pop) {
    const S = G.S; const st = fac.stock; const t = set.tier || 0; E.ensure(fac);
    const isCap = G.Fac.capitalOf(fac.id) === set;
    const n = k => (c[k] || 0);
    const site = k => !!c.siteTypes[k];
    if (t >= 1 && pop >= 10 && n('curral') < 1 + Math.floor(pop / 45) && !site('curral') && (n('farm') || S.day >= 6)) want.push('curral');
    if (pop >= 16 && !n('acougue') && !site('acougue') && E.penCount(set.id) >= 4) want.push('acougue');
    if (pop >= 18 && !n('tecelagem') && !site('tecelagem') && (E.hasSheep(set.id) || st.la >= 6)) want.push('tecelagem');
    if (pop >= 14 && !n('olaria') && !site('olaria') && E.riverNear(set, 16)) want.push('olaria');
    const ores = E.oresNear(set, 22);
    for (const o of ores) { if (o.mine || site('mina')) continue; if (o.kind === 'ferro' && !has(fac.id, 'bronze')) continue; if (pop < 14) continue; want.push('mina'); set._mineFor = o.id; break; }
    if (pop >= 18 && !n('forja') && !site('forja') && has(fac.id, 'bronze') && (st.minerio >= 4 || E.hasMine(set.id, 'ferro'))) want.push('forja');
    if (pop >= 20 && !n('ourives') && !site('ourives') && (st.ouro >= 3 || E.hasMine(set.id, 'ouro'))) want.push('ourives');
    if (t >= 2 && pop >= 24 && !n('feira') && !site('feira')) want.push('feira');
    if (t >= 2 && pop >= 28 && n('taverna') < 1 + Math.floor(pop / 90) && !site('taverna')) want.push('taverna');
    if (t >= 2 && pop >= 28 && has(fac.id, 'moeda') && n('coletoria') < 1 + Math.floor(pop / 160) && !site('coletoria')) want.push('coletoria');
    if (t >= 3 && has(fac.id, 'escrita') && (isCap || pop >= 70) && !n('administracao') && !site('administracao')) want.push('administracao');
    if (has(fac.id, 'roda') && fac.civ !== 'asteca' && (n('quartel') || G.Fac.has(fac.id, 'quartel')) && pop >= 30 && !n('estabulo') && !site('estabulo')) want.push('estabulo');
    if (t >= 2 && (n('temple') || n('maravilha')) && !n('estatua') && !site('estatua') && (st.ouro >= 12 || (isCap && E.hasMine(set.id, 'ouro') && st.ouro >= 6))) want.push('estatua');
  };
  E.penCount = setId => { let n = 0; for (const b of E.byType(setId, 'curral')) n += E.penAnimals(b).length; return n; };
  E.hasSheep = setId => { for (const b of E.byType(setId, 'curral')) if (penKind(b) === 'ovelha') return true; return false; };
  E.hasMine = (setId, kind) => { for (const b of E.byType(setId, 'mina')) if (b.ore) { const o = G.S.ores.find(q => q.id === b.ore); if (o && o.kind === kind && o.amt > 0) return true; } return false; };
  E.riverNear = function (set, R) {
    if (set._rvDay === G.S.day) return set._rv;
    const S = G.S; let ok = false;
    for (let dy = -R; dy <= R && !ok; dy += 2) for (let dx = -R; dx <= R; dx += 2) { const x = Math.floor(set.cx) + dx, y = Math.floor(set.cy) + dy; if (W.inb(x, y) && S.type[y * N + x] === T.RIVER) { ok = true; break; } }
    set._rvDay = S.day; set._rv = ok; return ok;
  };
  E.oresNear = (set, R) => (G.S.ores || []).filter(o => o.amt > 0 && G.dist(o.x + 0.5, o.y + 0.5, set.cx, set.cy) < R).sort((a, b) => G.dist(a.x, a.y, set.cx, set.cy) - G.dist(b.x, b.y, set.cx, set.cy));
  // mines sit on their deposit; everything else uses the town planner
  E.findSite = function (set, type) {
    const S = G.S;
    if (type === 'mina') {
      const o = (S.ores || []).find(q => q.id === set._mineFor) || E.oresNear(set, 22).find(q => !q.mine); if (!o) return null;
      const i = o.y * N + o.x; if (S.occ[i] || S.wall[i]) return null;
      if (!W.findPath(set.cx, set.cy, o.x + 0.5, o.y + 0.5, true, 4000)) return null;
      return [o.x, o.y];
    }
    return undefined;
  };
  E.onPlaced = function (b) {
    if (b.type === 'mina') { const o = (G.S.ores || []).find(q => q.x === b.x && q.y === b.y); if (o) { b.ore = o.id; o.mine = b.id; } }
  };

  // ------------------------------ jobs: how many hands each workplace needs ------------------------------
  E.demand = function (set, fac, A) {
    const S = G.S; const st = fac.stock; E.ensure(fac);
    const out = {}; const add = (r, n) => { out[r] = (out[r] || 0) + n; };
    const pop = G.Village.pop(set.id);
    const night = G.isNight();
    for (const b of S.buildings.values()) {
      if (b.set !== set.id || !b.built) continue;
      const d = G.BDEF[b.type]; if (!d.jobs) continue;
      let n = 0;
      switch (b.type) {
        case 'curral': case 'estabulo': { const k = E.penAnimals(b).length; n = k ? (k >= 5 ? 2 : 1) : 0; break; }
        case 'acougue': n = E.penCount(set.id) >= 4 ? 1 : 0; break;
        case 'tecelagem': n = Math.min(3, (st.la >= 2 || (b.inv && b.inv.la >= 2) ? 1 + Math.floor(st.la / 8) : 0) + (b.inv && b.inv.tecido > 0 ? 1 : 0)); break;
        case 'mina': { const o = S.ores && S.ores.find(q => q.id === b.ore); n = o && o.amt > 0 ? Math.min(4, 2 + Math.floor(pop / 60)) : 0; break; }
        case 'forja': n = st.minerio >= 2 || (b.inv && (b.inv.minerio || 0) >= 2) ? 2 : (b.inv && (b.inv.armas || b.inv.ferramentas) ? 1 : 0); break;
        case 'ourives': n = st.ouro >= 1 || (b.inv && b.inv.ouro) ? 1 : 0; break;
        case 'olaria': n = 2; break;
        case 'mercado': n = Math.min(3, 1 + Math.floor(pop / 50)); break;
        case 'feira': n = Math.min(4, 2 + Math.floor(pop / 70)); break;
        case 'taverna': n = 1; break;
        case 'administracao': n = 2; break;
        case 'coletoria': n = Math.min(3, 1 + Math.floor(pop / 90)); break;
        case 'mercado_negro': n = 2; break;
      }
      if (n > 0) add(d.role, n);
    }
    // there is no craft without bread: hungry towns send their artisans back to the fields
    const hungry = st.food < pop * 1.5;
    const capN = Math.floor(A * (hungry ? 0.18 : 0.38));
    let tot = 0; for (const k in out) tot += out[k];
    if (tot > capN && tot > 0) { const f = capN / tot; for (const k in out) out[k] = Math.max(k === 'pastor' ? 1 : 0, Math.floor(out[k] * f)); }
    void night;
    return out;
  };
  // every worker of a workplace role gets a concrete workplace (and keeps it)
  E.place = function (set) {
    const S = G.S; const slots = new Map();
    for (const b of S.buildings.values()) { if (b.set !== set.id || !b.built) continue; const d = G.BDEF[b.type]; if (d.jobs) slots.set(b.id, { b, left: d.jobs }); }
    const workers = [];
    for (const v of S.villagers.values()) {
      if (v.set !== set.id || v.captive) continue;
      const r = v.role;
      const isW = E.isJobRole(r) || (r === 'mineiro' && v.job);
      if (!isW) { if (v.job) v.job = 0; continue; }
      if (r === 'mineiro' && !v.job) continue;
      workers.push(v);
    }
    // keep the valid ones
    for (const v of workers) {
      const s = v.job && slots.get(v.job);
      if (s && G.BDEF[s.b.type].role === v.role && s.left > 0) { s.left--; v._ok = true; } else { v.job = 0; v._ok = false; }
    }
    for (const v of workers) {
      if (v._ok) continue;
      let best = null, bd = 1e9;
      for (const s of slots.values()) { if (s.left <= 0 || G.BDEF[s.b.type].role !== v.role) continue; const d = G.dist2(v.x, v.y, s.b.x, s.b.y); if (d < bd) { bd = d; best = s; } }
      if (best) { v.job = best.b.id; best.left--; }
    }
    // idle miners take up the free places in the mines
    for (const s of slots.values()) {
      if (s.b.type !== 'mina' || s.left <= 0) continue;
      const o = S.ores && S.ores.find(q => q.id === s.b.ore); if (!o || o.amt <= 0) continue;
      for (const v of S.villagers.values()) { if (s.left <= 0) break; if (v.set === set.id && v.role === 'mineiro' && !v.job && !v.captive) { v.job = s.b.id; s.left--; } }
    }
  };

  // ------------------------------ money ------------------------------
  E.coinage = fid => has(fid, 'moeda');
  const TAX = { tribo: 0, chefia: 0.08, reino: 0.12, imperio: 0.16, teocracia: 0.12, tirania: 0.3, conselho: 0.08, livre: 0.05 };
  E.taxRate = function (f) {
    if (!f || !E.coinage(f.id)) return 0;
    let r = TAX[f.gov] !== undefined ? TAX[f.gov] : 0.1;
    if (G.Fac.enemiesOf(f.id).length) r += 0.06; // war costs money
    if (f.law === 'honra') r += 0.03; // the tithe
    if (f.golden > 0) r *= 0.6;
    return Math.min(0.45, r);
  };
  const homeOf = v => { const h = v.home && G.S.buildings.get(v.home); return h && G.BDEF[h.type].housing ? h : null; };
  // the state pays for what a worker brings in (when it has coins)
  E.pay = function (v, k, n) {
    const f = G.Fac.ofV(v); if (!f || v.captive || !E.coinage(f.id)) return 0;
    const wage = Math.round((E.PRICE[k] || 0.3) * n * 0.35 * 100) / 100;
    if (f.stock.moedas < wage) { v.unpaid = (v.unpaid || 0) + 1; return 0; }
    f.stock.moedas -= wage; f.eco.wages += wage; v.unpaid = 0;
    const h = homeOf(v); if (h) h.coin = (h.coin || 0) + wage; else v.purse = (v.purse || 0) + wage;
    return wage;
  };
  function purse(v) { const h = homeOf(v); return h ? (h.coin || 0) : (v.purse || 0); }
  function spend(v, n) { const h = homeOf(v); if (h) { if ((h.coin || 0) < n) return false; h.coin -= n; return true; } if ((v.purse || 0) < n) return false; v.purse -= n; return true; }
  E.purse = purse;

  // ------------------------------ helpers for the task machines ------------------------------
  function walkTo(v, t, key, x, y, adj, dt, H, sp) {
    if (t.wk !== key) { t.wk = key; if (!H.goto(v, x, y, adj)) { t.wk = null; return -1; } }
    if (H.move(v, dt, sp || 1)) { t.wk = null; return 1; }
    return 0;
  }
  function walkB(v, t, b, dt, H, sp) {
    const key = 'b' + b.id;
    if (t.wk !== key) { t.wk = key; if (!G.Vg.gotoB(v, b, 0.25)) { t.wk = null; return -1; } }
    if (H.move(v, dt, sp || 1)) { t.wk = null; return 1; }
    return 0;
  }
  const store = v => G.Village.nearestDropoff(v.x, v.y, v.set);
  function faceB(v, b) { const [cx, cy] = G.Village.center(b); G.faceTo(v, cx - v.x, cy - v.y); }
  function inv(b) { return b.inv || (b.inv = {}); }
  function invN(b, keys) { const I = inv(b); let n = 0; for (const k of keys) n += I[k] || 0; return n; }

  // ------------------------------ recipes ------------------------------
  E.RECIPE = {
    tecelao: { in: { la: 2 }, out: { tecido: 1 }, t: 7, act: 'weave' },
    ferreiro: { in: { minerio: 2 }, fuel: 1, out: null, n: 2, t: 8, act: 'forge' },
    ourives: { in: { ouro: 1 }, out: { joias: 1 }, t: 9, act: 'craft' },
    oleiro: { in: { argila: 2 }, fuel: 1, out: { ceramica: 2 }, t: 8, act: 'pottery', dig: true },
  };
  // the smith forges what the realm needs most: weapons in war, tools in peace
  function forgeOut(f) {
    const war = G.Fac.enemiesOf(f.id).length > 0; const pop = G.Fac.pop(f.id);
    const soldiers = G.War ? G.War.warriorsOf(f.id) : 0;
    const wantArms = war ? soldiers * 1.5 + 10 : soldiers * 0.8 + 4;
    return f.stock.armas < wantArms && (war || f.stock.ferramentas >= pop * 0.15) ? 'armas' : 'ferramentas';
  }
  const mainIn = R => Object.keys(R.in)[0];
  function canCraft(b, R) { const I = inv(b); for (const k in R.in) if ((I[k] || 0) < R.in[k]) return false; return true; }

  // ------------------------------ choosing the day's work ------------------------------
  E.jobTask = function (v, H) {
    const S = G.S; const b = v.job && S.buildings.get(v.job);
    if (!b || !b.built) return null;
    const f = G.Fac.ofV(v); if (!f) return null; E.ensure(f);
    const R = E.RECIPE[v.role];
    if (R) return crafterTask(v, b, R, f, H);
    switch (v.role) {
      case 'pastor': case 'cavalarico': return pastorTask(v, b, f, H);
      case 'acougueiro': return butcherTask(v, b, f, H);
      case 'mineiro': return H.setTask(v, { type: 'minejob', id: b.id, pri: 1 });
      case 'mercador': return merchantTask(v, b, f, H);
      case 'feirante': return fairTask(v, b, f, H);
      case 'taverneiro': return tavernTask(v, b, f, H);
      case 'escriba': return H.setTask(v, { type: 'desk', id: b.id, pri: 1, dur: G.rr(14, 24) });
      case 'cobrador': return collectorTask(v, b, f, H);
      case 'contrabandista': return smugglerTask(v, b, f, H);
    }
    return null;
  };
  function crafterTask(v, b, R, f, H) {
    const I = inv(b);
    const outs = R.out ? Object.keys(R.out) : ['armas', 'ferramentas'];
    const outN = invN(b, outs);
    const ready = canCraft(b, R) && (!R.fuel || f.stock.wood >= R.fuel);
    if (outN >= 4 || (outN > 0 && !ready && (f.stock[mainIn(R)] || 0) < R.in[mainIn(R)])) return H.setTask(v, { type: 'haul', id: b.id, pri: 1, keys: outs });
    if (ready) return H.setTask(v, { type: 'craft', id: b.id, pri: 1, n: 0 });
    const k = mainIn(R);
    if ((f.stock[k] || 0) >= R.in[k]) return H.setTask(v, { type: 'fetch', id: b.id, k, n: Math.min(G.Vg.cap(v) * 2, Math.floor(f.stock[k]), R.in[k] * 3), pri: 1 });
    if (R.dig) { const s = clayPit(v, b); if (s) return H.setTask(v, { type: 'dig', id: b.id, x: s[0], y: s[1], pri: 1 }); }
    if (outN > 0) return H.setTask(v, { type: 'haul', id: b.id, pri: 1, keys: outs });
    void I;
    return null;
  }
  function clayPit(v, b) {
    const S = G.S; const cx = Math.floor(b.x + 1), cy = Math.floor(b.y + 1);
    let best = null, bd = 1e9;
    for (let dy = -14; dy <= 14; dy++) for (let dx = -14; dx <= 14; dx++) {
      const x = cx + dx, y = cy + dy; if (!W.inb(x, y)) continue; const i = y * N + x;
      if (!W.walkable(i) || S.type[i] === T.RIVER || S.occ[i] || S.treeAt[i]) continue;
      let wet = false; for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { if (W.inb(x + ax, y + ay) && S.type[(y + ay) * N + x + ax] === T.RIVER) { wet = true; break; } }
      if (!wet) continue;
      const d = dx * dx + dy * dy + G.hash(i + S.day) * 6; if (d < bd) { bd = d; best = [x + 0.5, y + 0.5]; }
    }
    return best;
  }
  function pastorTask(v, b, f, H) {
    const S = G.S; const herd = E.penAnimals(b);
    if (!herd.length) return null;
    const out = herd.find(a => a.state === 'herd');
    // somebody is already out with the flock
    if (out && S.villagers.has(out.herder) && out.herder !== v.id) return tendTask(v, b, herd, H) || H.setTask(v, { type: 'penwork', id: b.id, pri: 1, dur: G.rr(8, 14) });
    const t = S.time;
    const hungry = herd.reduce((s, a) => s + a.hunger, 0) / herd.length;
    const lowGrass = E.penGrass(b) < 0.35;
    if (!out && t > 0.08 && t < 0.42 && (hungry > 0.28 || lowGrass) && !G.isNight() && !(b.herdCD > S.clock)) return H.setTask(v, { type: 'herd', id: b.id, pri: 1.1, st: 0 });
    // no pasture now (night, wolves, winter of grass): hay from the granary to the trough
    if (hungry > 0.45 && (f.stock.food || 0) >= 6 && !(b.fedT > S.clock)) { b.fedT = S.clock + 25; return H.setTask(v, { type: 'fodder', id: b.id, pri: 1.1, n: Math.min(8, 2 + herd.length) }); }
    return tendTask(v, b, herd, H) || H.setTask(v, { type: 'penwork', id: b.id, pri: 1, dur: G.rr(8, 14) });
  }
  function tendTask(v, b, herd, H) {
    let best = null, what = null;
    for (const a of herd) {
      if (a.state !== 'pen' || a.grown < 1 || a.tended > G.S.clock) continue;
      if (a.kind === 'ovelha' && a.wool >= 1) { best = a; what = 'shear'; break; }
      if ((a.kind === 'vaca' || a.kind === 'cabra') && a.milk >= 1) { best = a; what = 'milk'; }
      else if (a.kind === 'peru' && a.eggs >= 1 && !best) { best = a; what = 'eggs'; }
      else if (a.kind === 'cavalo' && !best && G.R() < 0.3) { best = a; what = 'groom'; }
    }
    if (!best) return null;
    best.tended = G.S.clock + 20;
    return H.setTask(v, { type: 'tend', id: b.id, a: best.id, what, pri: 1 });
  }
  function butcherTask(v, b, f, H) {
    const S = G.S; const I = inv(b);
    if ((I.couro || 0) >= 3) return H.setTask(v, { type: 'haul', id: b.id, pri: 1, keys: ['couro'] });
    // a beast from a pen with more than the breeding stock — the oldest first
    let pick = null, pen = null;
    for (const p of S.buildings.values()) {
      if (p.type !== 'curral' || !p.built || G.Village.facOfSet(p.set) !== f.id) continue;
      const herd = E.penAnimals(p).filter(a => a.state === 'pen');
      const adults = herd.filter(a => a.grown >= 1);
      const keep = 3 + (f.stock.food > G.Fac.pop(f.id) * 4 ? 2 : 0);
      if (herd.length <= keep || adults.length <= 2) continue;
      const a = adults.sort((x, y) => y.age - x.age)[0];
      if (!pick || G.dist2(p.x, p.y, b.x, b.y) < G.dist2(pen.x, pen.y, b.x, b.y)) { pick = a; pen = p; }
    }
    if (!pick) return (I.couro || 0) > 0 ? H.setTask(v, { type: 'haul', id: b.id, pri: 1, keys: ['couro'] }) : null;
    return H.setTask(v, { type: 'slaughter', id: b.id, pen: pen.id, a: pick.id, pri: 1 });
  }
  function merchantTask(v, b, f, H) {
    const I = inv(b);
    const wants = ['tecido', 'ceramica', 'joias', 'couro', 'food'];
    const low = wants.filter(k => (I[k] || 0) < (k === 'food' ? 8 : 3) && (f.stock[k] || 0) >= (k === 'food' ? 12 : 2));
    if (low.length && G.R() < 0.6) return H.setTask(v, { type: 'restock', id: b.id, k: low[Math.floor(G.R() * low.length)], pri: 1 });
    let stock = 0; for (const k of wants) stock += I[k] || 0;
    if (!stock) return low.length ? H.setTask(v, { type: 'restock', id: b.id, k: low[0], pri: 1 }) : null;
    return H.setTask(v, { type: 'sell', id: b.id, pri: 1, dur: G.rr(14, 24) });
  }
  E.fairOpen = () => { const t = G.S.time; return t > 0.08 && t < 0.5; };
  function fairTask(v, b, f, H) {
    if (!E.fairOpen()) return null;
    const I = inv(b);
    const goods = ['food', 'tecido', 'ceramica', 'couro'];
    const low = goods.filter(k => (I[k] || 0) < (k === 'food' ? 10 : 2) && (f.stock[k] || 0) >= (k === 'food' ? 14 : 2));
    if (low.length && G.R() < 0.5) return H.setTask(v, { type: 'restock', id: b.id, k: low[Math.floor(G.R() * low.length)], pri: 1 });
    return H.setTask(v, { type: 'sell', id: b.id, pri: 1, dur: G.rr(16, 26), fair: true });
  }
  function tavernTask(v, b, f, H) {
    const I = inv(b);
    if ((I.food || 0) < 6 && f.stock.food >= 16) return H.setTask(v, { type: 'restock', id: b.id, k: 'food', pri: 1 });
    return H.setTask(v, { type: 'serve', id: b.id, pri: 1, dur: G.rr(16, 26) });
  }
  function collectorTask(v, b, f, H) {
    const S = G.S;
    // gold becomes coin at the treasury
    if (f.stock.ouro >= 1 && E.coinage(f.id) && f.stock.moedas < G.Fac.pop(f.id) * 3 && G.R() < 0.5 && !(G.Fac.enemiesOf(f.id).length === 0 && f.stock.ouro < 4)) return H.setTask(v, { type: 'mint', id: b.id, pri: 1 });
    const rate = E.taxRate(f); if (rate <= 0) return H.setTask(v, { type: 'desk', id: b.id, pri: 1, dur: 12 });
    // a round of doors, the nearest houses nobody visited lately
    const homes = [];
    for (const h of S.buildings.values()) if (h.set === v.set && h.built && G.BDEF[h.type].housing && !(h.taxT > S.clock) && (h.coin || 0) >= 0.5) homes.push(h);
    if (!homes.length) return H.setTask(v, { type: 'desk', id: b.id, pri: 1, dur: 12 });
    homes.sort((a, c) => G.dist2(a.x, a.y, b.x, b.y) - G.dist2(c.x, c.y, b.x, b.y));
    const route = homes.slice(0, 5).map(h => h.id);
    for (const id of route) S.buildings.get(id).taxT = S.clock + DAY() * 0.6;
    return H.setTask(v, { type: 'taxes', id: b.id, route, k: 0, bag: 0, pri: 1.05 });
  }
  function smugglerTask(v, b, f, H) {
    const S = G.S; const I = inv(b);
    let stock = 0; for (const k in I) if (k !== 'moedas') stock += I[k];
    if (G.isNight() || (G.isEvening() && G.R() < 0.4)) {
      const d = G.Village.nearestDropoff(b.x, b.y, v.set);
      const pick = ['tecido', 'ceramica', 'joias', 'food', 'couro', 'ferramentas'].filter(k => (f.stock[k] || 0) >= 3);
      if (d && pick.length && stock < 12) return H.setTask(v, { type: 'steal', id: b.id, drop: d.id, k: G.pick(pick), pri: 1.2 });
      return null;
    }
    if (stock > 0) return H.setTask(v, { type: 'sell', id: b.id, pri: 1, dur: G.rr(16, 26), shady: true });
    return null;
  }

  // ------------------------------ the pens ------------------------------
  E.penGrass = function (b) { const S = G.S; if (!S.veg) return 1; let v = 0, c = 0; for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) { const i = y * N + x; v += S.veg[i]; c += Math.max(0.2, G.Animals.vegCap(i) || 0.6); } return c ? v / c : 1; };
  function pastureSpot(b) {
    const S = G.S; let best = null, bs = -1e9;
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    for (let k = 0; k < 40; k++) {
      const a = G.R() * 6.283, r = G.rr(5, 13); const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      if (!W.inb(x, y)) continue; const i = W.idx(x, y);
      if (!W.walkable(i) || S.type[i] === T.RIVER || S.occ[i] || S.fire[i] > 0) continue;
      let g = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const j = W.idx(G.clamp(x + dx, 0, N - 1), G.clamp(y + dy, 0, N - 1)); g += S.veg ? S.veg[j] : 0.5; if (S.occ[j]) g -= 0.5; }
      let danger = 0; G.Animals.near(x, y, 8, o => { if (!o.dead && G.Animals.predator(o.kind) && !o.dom) danger++; });
      const sc = g - danger * 3 - r * 0.05;
      if (sc > bs) { bs = sc; best = [x, y]; }
    }
    return best;
  }
  function releaseHerd(b) { for (const a of E.penAnimals(b)) if (a.state === 'herd') { a.state = 'pen'; a.herder = 0; } }

  // ------------------------------ task machines ------------------------------
  E.run = function (v, t, dt, H) {
    switch (t.type) {
      case 'craft': return runCraft(v, t, dt, H), true;
      case 'fetch': return runFetch(v, t, dt, H), true;
      case 'haul': return runHaul(v, t, dt, H), true;
      case 'dig': return runDig(v, t, dt, H), true;
      case 'herd': return runHerd(v, t, dt, H), true;
      case 'tend': return runTend(v, t, dt, H), true;
      case 'fodder': return runFodder(v, t, dt, H), true;
      case 'penwork': return runStay(v, t, dt, H, 'sweep'), true;
      case 'slaughter': return runSlaughter(v, t, dt, H), true;
      case 'minejob': return runMine(v, t, dt, H), true;
      case 'restock': return runRestock(v, t, dt, H), true;
      case 'sell': return runStay(v, t, dt, H, t.shady ? 'lurk' : 'sell'), true;
      case 'serve': return runStay(v, t, dt, H, 'serve'), true;
      case 'desk': return runStay(v, t, dt, H, 'write'), true;
      case 'mint': return runMint(v, t, dt, H), true;
      case 'taxes': return runTaxes(v, t, dt, H), true;
      case 'steal': return runSteal(v, t, dt, H), true;
      case 'shop': return runShop(v, t, dt, H), true;
      case 'tavern': return runTavernVisit(v, t, dt, H), true;
      case 'guard': return runGuard(v, t, dt, H), true;
      case 'goHome': return runGoHome(v, t, dt, H), true;
    }
    return false;
  };
  function workB(v, t, H) { const b = G.S.buildings.get(t.id); if (!b || !b.built) { H.end(v); return null; } return b; }
  // stand at the workplace doing the job's gesture
  function runStay(v, t, dt, H, act) {
    const b = workB(v, t, H); if (!b) return;
    if (t.st === 0) {
      let r;
      if (!b.blocks) { if (!t.spot) t.spot = b.type === 'feira' && E.stallSpot ? E.stallSpot(b, v.id, false) : [b.x + G.rr(0.4, b.w - 0.4), b.y + G.rr(0.4, b.h - 0.4)]; r = walkTo(v, t, 'spot', t.spot[0], t.spot[1], false, dt, H); }
      else r = walkB(v, t, b, dt, H);
      if (r < 0) return H.end(v);
      if (r > 0) { t.st = 1; v.actT = 0; }
      return;
    }
    v.act = act; if (b.blocks) faceB(v, b); else { const f = b.type === 'feira' ? 1 : v.id % 2 ? 1 : -1; G.faceTo(v, f, -f); }
    if (b.type === 'feira') { b.openT = G.S.clock; if (!E.fairOpen()) return H.end(v); }
    if (act === 'sell' && G.R() < dt * 0.05) G.Vg.emote(v, G.pick(['chat', 'happy', 'food']), 1.3);
    if (act === 'write' && G.R() < dt * 0.03) G.Vg.emote(v, 'chat', 1);
    if (act === 'lurk' && G.R() < dt * 0.03) G.Vg.emote(v, 'question', 1);
    if (act === 'serve' && G.R() < dt * 0.05) G.Vg.emote(v, 'food', 1.2);
    if (act === 'sweep' && G.R() < dt * 0.3) { G.FX && G.FX.dust(v.x + v.face * 0.3, v.y, 1); }
    if (t.type === 'desk') { const f = G.Fac.ofV(v); if (f) f._scribes = G.S.clock; }
    if (v.actT > (t.dur || 12)) H.end(v);
  }
  function runFetch(v, t, dt, H) {
    const S = G.S; const b = workB(v, t, H); if (!b) return;
    const f = G.Fac.ofV(v); if (!f) return H.end(v);
    if (t.st === 0) { const d = store(v); if (!d) return H.end(v); t.d = d.id; const r = walkB(v, t, d, dt, H); if (r < 0) return H.end(v); if (r > 0) t.st = 1; return; }
    if (t.st === 1) {
      const n = Math.min(t.n, Math.floor(f.stock[t.k] || 0));
      if (n <= 0) return H.end(v);
      f.stock[t.k] -= n; v.carry = { k: t.k, n }; t.st = 2; return;
    }
    const r = walkB(v, t, b, dt, H);
    if (r < 0) { G.Village.addStock(v.carry.k, v.carry.n, f.id); v.carry = null; return H.end(v); }
    if (r > 0) { const I = inv(b); I[v.carry.k] = (I[v.carry.k] || 0) + v.carry.n; v.carry = null; H.end(v); }
    void S;
  }
  function runHaul(v, t, dt, H) {
    const b = workB(v, t, H); if (!b) return;
    if (t.st === 0) { const r = walkB(v, t, b, dt, H); if (r < 0) return H.end(v); if (r > 0) t.st = 1; return; }
    const I = inv(b); const k = (t.keys || []).find(q => (I[q] || 0) > 0);
    if (!k) return H.end(v);
    const n = Math.min(I[k], G.Vg.cap(v) + 2); I[k] -= n;
    v.carry = { k, n }; G.Vg.emote(v, 'happy', 1);
    E.pay(v, k, n);
    H.end(v); G.Vg.setTask(v, { type: 'deliver', pri: 1, kind: 'work' });
  }
  function runCraft(v, t, dt, H) {
    const b = workB(v, t, H); if (!b) return;
    const f = G.Fac.ofV(v); const R = E.RECIPE[v.role]; if (!f || !R) return H.end(v);
    if (t.st === 0) { const r = walkB(v, t, b, dt, H); if (r < 0) return H.end(v); if (r > 0) { t.st = 1; v.actT = 0; } return; }
    v.act = R.act; faceB(v, b);
    if (v.actT > 0.6 && G.R() < dt * 2) {
      if (R.act === 'forge') { G.FX && G.FX.chips(v.x + v.face * 0.3, v.y - 0.1, '#ffb050'); G.Audio && G.Audio.at(v.x, v.y, 'hammer'); }
      else if (R.act === 'craft') G.FX && G.FX.chips(v.x + v.face * 0.2, v.y, '#f2c14e');
    }
    const speed = G.Civ.tV(v, 'build') * (f.stock.ferramentas > 0 ? 1.2 : 1) * (v.work || 1);
    if (v.actT < R.t / speed) return;
    if (!canCraft(b, R) || (R.fuel && f.stock.wood < R.fuel)) return H.end(v);
    const I = inv(b);
    for (const k in R.in) { I[k] -= R.in[k]; used(f, k, R.in[k]); }
    if (R.fuel) { f.stock.wood -= R.fuel; used(f, 'wood', R.fuel); }
    const out = R.out || { [forgeOut(f)]: R.n };
    for (const k in out) { I[k] = (I[k] || 0) + out[k]; made(f, k, out[k]); }
    if (f.stock.ferramentas > 0 && G.R() < 0.08) { f.stock.ferramentas -= 1; used(f, 'ferramentas', 1); }
    v.actT = 0; t.n++;
    G.FX && G.FX.sparkle(v.x, v.y);
    if (t.n >= 3 || !canCraft(b, R)) H.end(v);
  }
  function runDig(v, t, dt, H) {
    const b = workB(v, t, H); if (!b) return;
    if (t.st === 0) { const r = walkTo(v, t, 'pit', t.x, t.y, false, dt, H); if (r < 0) return H.end(v); if (r > 0) { t.st = 1; v.actT = 0; } return; }
    if (t.st === 1) {
      v.act = 'dig';
      if (G.R() < dt * 1.5) G.FX && G.FX.chips(t.x, t.y, '#8a5a3a');
      if (v.actT > 5) { v.carry = { k: 'argila', n: 3 }; t.st = 2; }
      return;
    }
    const r = walkB(v, t, b, dt, H);
    if (r < 0) { v.carry = null; return H.end(v); }
    if (r > 0) { const I = inv(b); I.argila = (I.argila || 0) + v.carry.n; const f = G.Fac.ofV(v); if (f) made(f, 'argila', v.carry.n); v.carry = null; H.end(v); }
  }
  // take the flock out to graze and bring it back before dark
  function runHerd(v, t, dt, H) {
    const S = G.S; const b = workB(v, t, H); if (!b) return;
    const herd = E.penAnimals(b);
    if (!herd.length) { releaseHerd(b); return H.end(v); }
    if (t.st === 0) { const r = walkB(v, t, b, dt, H); if (r < 0) return H.end(v); if (r > 0) { t.st = 1; } return; }
    if (t.st === 1) {
      const p = pastureSpot(b); if (!p) { b.herdCD = S.clock + 40; return H.end(v); }
      t.px = p[0]; t.py = p[1];
      for (const a of herd) { if (a.state === 'led') continue; a.state = 'herd'; a.herder = v.id; }
      v.act = 'call'; G.Vg.emote(v, 'chat', 1.4);
      t.st = 2; return;
    }
    if (t.st === 2) {
      const r = walkTo(v, t, 'past', t.px, t.py, false, dt, H, 0.7);
      if (r < 0) { t.st = 4; return; }
      if (r > 0) { t.st = 3; v.actT = 0; t.dur = G.rr(22, 34); }
      return;
    }
    if (t.st === 3) {
      v.act = 'herd';
      // wolves near the flock: the shepherd drives them off
      let wolf = null; G.Animals.near(v.x, v.y, 7, o => { if (!o.dead && !o.dom && G.Animals.predator(o.kind) && G.Animals.DEF[o.kind].cls !== 'air' && (o.state === 'chase' || o.state === 'lunge')) wolf = o; });
      if (wolf && v.hp > 40) { G.Vg.emote(v, 'angry', 2); G.Vg.setTask(v, { type: 'fight', id: wolf.id, pri: 4, rt: 0, kind: 'fight' }); return; }
      const avgH = herd.reduce((s, a) => s + a.hunger, 0) / herd.length;
      if (v.actT > t.dur || S.time > 0.6 || (avgH < 0.05 && v.actT > 10)) { t.st = 4; }
      return;
    }
    if (t.st === 4) {
      const r = walkB(v, t, b, dt, H, 0.7);
      if (r !== 0) { releaseHerd(b); b.herdCD = S.clock + DAY() * 0.3; H.end(v); }
    }
  }
  function runFodder(v, t, dt, H) {
    const b = workB(v, t, H); if (!b) return;
    const f = G.Fac.ofV(v); if (!f) return H.end(v);
    if (t.st === 0) { const d = store(v); if (!d) return H.end(v); const r = walkB(v, t, d, dt, H); if (r < 0) return H.end(v); if (r > 0) t.st = 1; return; }
    if (t.st === 1) { const n = Math.min(t.n, Math.floor(f.stock.food || 0)); if (n <= 0) return H.end(v); f.stock.food -= n; used(f, 'food', n); v.carry = { k: 'food', n, hay: 1 }; t.st = 2; return; }
    if (t.st === 2) {
      if (!t.spot) t.spot = [b.x + b.w - 0.45, b.y + b.h / 2];
      const r = walkTo(v, t, 'spot', t.spot[0], t.spot[1], false, dt, H);
      if (r < 0) { G.Village.addStock('food', v.carry ? v.carry.n : 0, f.id); v.carry = null; return H.end(v); }
      if (r > 0) { t.st = 3; v.actT = 0; }
      return;
    }
    v.act = 'feed'; G.faceTo(v, -1, 1);
    if (v.actT < 3.5) return;
    // the flock crowds the trough and eats the hay
    const herd = E.penAnimals(b).filter(a => a.state === 'pen');
    const per = (v.carry ? v.carry.n : 0) / Math.max(1, herd.length);
    for (const a of herd) { a.hunger = Math.max(0, a.hunger - per * 0.45); a.tx = t.spot[0] - G.rr(0.2, 0.8); a.ty = t.spot[1] + G.rr(-0.8, 0.8); a.t = 4; }
    v.carry = null; H.end(v);
  }
  function runTend(v, t, dt, H) {
    const S = G.S; const b = workB(v, t, H); if (!b) return;
    const a = S.animals.get(t.a);
    if (!a || a.dead || a.pen !== b.id || a.state !== 'pen') return H.end(v);
    if (t.st === 0) { const r = walkTo(v, t, 'an', a.x - 0.35, a.y + 0.2, false, dt, H, 0.9); if (r < 0) return H.end(v); if (r > 0) { t.st = 1; v.actT = 0; a.hold = 6; } return; }
    v.act = t.what === 'shear' ? 'shear' : t.what === 'milk' ? 'milk' : t.what === 'groom' ? 'groom' : 'gather';
    G.faceTo(v, a.x - v.x, a.y - v.y);
    a.hold = 1;
    if (t.what === 'shear' && G.R() < dt * 3) G.FX && G.FX.chips(a.x, a.y - 0.1, '#f4f0e6');
    if (v.actT < (t.what === 'shear' ? 4.5 : 3.2)) return;
    const f = G.Fac.ofV(v);
    let carry = null;
    if (t.what === 'shear') { const n = Math.max(1, Math.floor(a.wool)); a.wool = 0; a.shorn = DAY() * 0.5; carry = { k: 'la', n: n * 2 }; }
    else if (t.what === 'milk') { a.milk = 0; carry = { k: 'food', n: 2 }; }
    else if (t.what === 'eggs') { a.eggs = 0; carry = { k: 'food', n: 2 }; }
    else { a.hunger = Math.max(0, a.hunger - 0.2); if (f) f._grooms = (f._grooms || 0) + 1; }
    a.hold = 0;
    if (carry) { if (f) made(f, carry.k, carry.n); v.carry = carry; E.pay(v, carry.k, carry.n); H.end(v); G.Vg.setTask(v, { type: 'deliver', pri: 1, kind: 'work' }); }
    else H.end(v);
  }
  function runSlaughter(v, t, dt, H) {
    const S = G.S; const b = workB(v, t, H); if (!b) return;
    const pen = S.buildings.get(t.pen); const a = S.animals.get(t.a);
    if (!a || a.dead) { if (a && a.ledBy === v.id) a.ledBy = 0; return H.end(v); }
    if (t.st === 0) {
      if (!pen) return H.end(v);
      const r = walkTo(v, t, 'an', a.x - 0.3, a.y + 0.2, false, dt, H); if (r < 0) return H.end(v);
      if (r > 0 || G.dist(v.x, v.y, a.x, a.y) < 0.8) { t.st = 1; a.state = 'led'; a.ledBy = v.id; G.Vg.emote(v, 'chat', 1); }
      return;
    }
    if (t.st === 1) {
      if (a.state !== 'led' || a.ledBy !== v.id) return H.end(v);
      const r = walkB(v, t, b, dt, H, 0.75); if (r < 0) { a.state = 'pen'; a.ledBy = 0; return H.end(v); }
      if (r > 0) { t.st = 2; v.actT = 0; }
      return;
    }
    v.act = 'butcher'; faceB(v, b);
    if (v.actT < 3.2) return;
    const sp = G.Animals.DEF[a.kind]; const f = G.Fac.ofV(v);
    const meat = Math.max(2, Math.round(sp.meat * 0.8 * G.Civ.tV(v, 'hunt')));
    const hide = a.kind === 'peru' ? 0 : a.kind === 'porco' ? 1 : 2;
    G.FX && G.FX.blood(a.x, a.y);
    const eco = S.eco || (S.eco = { deaths: {}, born: {} }); eco.slaughter = (eco.slaughter || 0) + 1;
    G.Animals.remove(a);
    const I = inv(b); if (hide) I.couro = (I.couro || 0) + hide;
    if (f) { made(f, 'food', meat); if (hide) made(f, 'couro', hide); }
    v.carry = { k: 'food', n: meat }; E.pay(v, 'food', meat);
    H.end(v); G.Vg.setTask(v, { type: 'deliver', pri: 1, kind: 'work' });
  }
  // miners vanish into the mountain and come back loaded
  function runMine(v, t, dt, H) {
    const S = G.S; const b = workB(v, t, H); if (!b) return;
    const o = S.ores && S.ores.find(q => q.id === b.ore);
    if (!o || o.amt <= 0) return H.end(v);
    if (t.st === 0) { const r = walkB(v, t, b, dt, H); if (r < 0) return H.end(v); if (r > 0) { t.st = 1; v.actT = 0; v.inside = b.id; } return; }
    if (t.st === 1) {
      v.act = 'mine';
      if (G.R() < dt * 0.8) G.Audio && G.Audio.at(b.x, b.y, 'mine');
      const need = (o.kind === 'ouro' ? 13 : 10) / Math.max(0.5, (v.work || 1) * G.Civ.tV(v, 'build'));
      if (v.actT < need) return;
      const n = Math.min(o.amt, o.kind === 'ouro' ? 1 + (G.R() < 0.4 ? 1 : 0) : 2 + (G.R() < 0.5 ? 1 : 0));
      o.amt -= n;
      const k = o.kind === 'ouro' ? 'ouro' : 'minerio';
      const [dx, dy] = G.Vg.door(b); v.inside = 0; v.x = dx; v.y = dy;
      v.carry = { k, n }; const f = G.Fac.ofV(v); if (f) made(f, k, n); E.pay(v, k, n);
      G.FX && G.FX.dust(dx, dy, 2);
      if (o.kind === 'ouro' && f && !f._gold) { f._gold = S.day; log(`Os mineiros de ${G.S.settlements.get(b.set).name} encontraram ouro na montanha!`, 'star', b.x, b.y); G.Village.milestone('firstGold', 'Ouro!', 'Mineiros tiraram o primeiro ouro da montanha.', 'star'); }
      if (o.amt <= 0) { const s = S.settlements.get(b.set); log(`A mina de ${o.kind === 'ouro' ? 'ouro' : 'minério'}${s ? ' de ' + s.name : ''} se esgotou.`, 'stone', b.x, b.y); }
      H.end(v); G.Vg.setTask(v, { type: 'deliver', pri: 1, kind: 'work' });
    }
  }
  function runRestock(v, t, dt, H) {
    const b = workB(v, t, H); if (!b) return;
    const f = G.Fac.ofV(v); if (!f) return H.end(v);
    if (t.st === 0) { const d = store(v); if (!d) return H.end(v); const r = walkB(v, t, d, dt, H); if (r < 0) return H.end(v); if (r > 0) t.st = 1; return; }
    if (t.st === 1) {
      const n = Math.min(t.k === 'food' ? 8 : 4, Math.floor(f.stock[t.k] || 0));
      if (n <= 0) return H.end(v);
      // merchants buy wholesale from the state stores
      if (E.coinage(f.id) && b.type !== 'feira' && b.type !== 'taverna') { const cost = Math.round(E.PRICE[t.k] * n * 0.6 * 100) / 100; if (spend(v, cost)) { f.stock.moedas += cost; f.eco.sales += cost; } }
      f.stock[t.k] -= n; v.carry = { k: t.k, n }; t.st = 2; return;
    }
    const r = walkB(v, t, b, dt, H);
    if (r < 0) { G.Village.addStock(v.carry.k, v.carry.n, f.id); v.carry = null; return H.end(v); }
    if (r > 0) { const I = inv(b); I[v.carry.k] = (I[v.carry.k] || 0) + v.carry.n; v.carry = null; H.end(v); }
  }
  function runMint(v, t, dt, H) {
    const b = workB(v, t, H); if (!b) return;
    const f = G.Fac.ofV(v); if (!f) return H.end(v);
    if (t.st === 0) { const r = walkB(v, t, b, dt, H); if (r < 0) return H.end(v); if (r > 0) { t.st = 1; v.actT = 0; } return; }
    v.act = 'craft'; faceB(v, b);
    if (G.R() < dt * 2) G.FX && G.FX.chips(v.x, v.y, '#f2c14e');
    if (v.actT < 6) return;
    if (f.stock.ouro >= 1) { f.stock.ouro -= 1; f.stock.moedas += 6; used(f, 'ouro', 1); made(f, 'moedas', 6); if (!f._minted) { f._minted = G.S.day; const s = G.S.settlements.get(b.set); log(`${f.name} cunhou suas primeiras moedas${s ? ' em ' + s.name : ''}.`, 'trade', b.x, b.y); } }
    H.end(v);
  }
  // door to door: knock, collect, move on; back to the treasury with the bag
  function runTaxes(v, t, dt, H) {
    const S = G.S; const b = workB(v, t, H); if (!b) return;
    const f = G.Fac.ofV(v); if (!f) return H.end(v);
    if (t.k < t.route.length) {
      const h = S.buildings.get(t.route[t.k]);
      if (!h || !h.built) { t.k++; t.st = 0; return; }
      if (t.st === 0) { const r = walkB(v, t, h, dt, H); if (r < 0) { t.k++; return; } if (r > 0) { t.st = 1; v.actT = 0; } return; }
      v.act = 'knock'; faceB(v, h);
      if (v.actT < 1.8) return;
      const rate = E.taxRate(f);
      const due = Math.round((h.coin || 0) * rate * 100) / 100;
      if (due > 0.01) { h.coin -= due; t.bag += due; G.FX && G.FX.chips(v.x, v.y, '#f2c14e'); }
      // an unhappy house grumbles at the door
      if (rate > 0.22) { for (const o of S.villagers.values()) if (o.home === h.id && !o.inside && G.dist2(o.x, o.y, v.x, v.y) < 9 && G.R() < 0.4) G.Vg.emote(o, 'angry', 2); }
      t.k++; t.st = 0; return;
    }
    if (t.st === 0 && t.bag > 0) v.carry = { k: 'moedas', n: Math.max(1, Math.round(t.bag)) };
    const r = walkB(v, t, b, dt, H);
    if (r !== 0) {
      f.stock.moedas += t.bag; f.eco.tax += t.bag; made(f, 'moedas', 0);
      if (t.bag > 0) G.FX && G.FX.deposit(v.x, v.y, 'moedas', Math.round(t.bag));
      v.carry = null;
      if (!f._taxed && t.bag > 0) { f._taxed = S.day; log(`Os primeiros coletores de impostos de ${f.name} bateram de porta em porta.`, 'trade', b.x, b.y); }
      H.end(v);
    }
    if (t.st === 0) t.st = 1;
  }
  function runSteal(v, t, dt, H) {
    const S = G.S; const b = workB(v, t, H); if (!b) return;
    const d = S.buildings.get(t.drop); const f = G.Fac.ofV(v); if (!d || !f) return H.end(v);
    if (t.st === 0) { const r = walkB(v, t, d, dt, H, 0.85); if (r < 0) return H.end(v); if (r > 0) { t.st = 1; v.actT = 0; } v.act = 'sneak'; return; }
    if (t.st === 1) {
      v.act = 'sneak';
      if (v.actT < 2) return;
      const n = Math.min(t.k === 'food' ? 5 : 3, Math.floor(f.stock[t.k] || 0));
      if (n <= 0) return H.end(v);
      f.stock[t.k] -= n; used(f, t.k, n); f.eco.stolen = (f.eco.stolen || 0) + n;
      v.carry = { k: t.k, n, stolen: true }; t.st = 2; return;
    }
    v.act = 'sneak';
    const r = walkB(v, t, b, dt, H, 0.85);
    if (r < 0) { v.carry = null; return H.end(v); }
    if (r > 0) { const I = inv(b); I[v.carry.k] = (I[v.carry.k] || 0) + v.carry.n; v.carry = null; H.end(v); }
  }
  // ------------------------------ citizens: shopping, the tavern, going home ------------------------------
  const HOUSE_WANTS = { tecido: 0.3, ceramica: 0.15, joias: 0.03, couro: 0.05 };
  E.shopTask = function (v, H) {
    const S = G.S; const h = homeOf(v); if (!h || v.captive) return null;
    const I = inv(h); const res = h.res || 1;
    const need = Object.keys(HOUSE_WANTS).filter(k => (I[k] || 0) < Math.max(1, res * HOUSE_WANTS[k] * 2));
    if (!need.length && G.R() > 0.15) return null;
    const f = G.Fac.ofV(v); if (!f) return null;
    // the black market tempts the poor and the disloyal
    const set = S.settlements.get(v.set);
    const shops = [];
    for (const b of E.byType(v.set, 'mercado').concat(E.fairOpen() ? E.byType(v.set, 'feira') : EMPTY, E.byType(v.set, 'mercado_negro'))) {
      {
        const bi = inv(b); const k = need.find(q => (bi[q] || 0) >= 1) || (bi.food >= 2 && h.pantry < res ? 'food' : null);
        if (!k) continue;
        let w = 1;
        if (b.type === 'mercado_negro') w = (set && set.loyalty < 45 ? 1.5 : 0.3) + (E.taxRate(f) > 0.2 ? 1 : 0);
        if (b.type === 'feira') w = 1.6;
        shops.push([b, k, w / (1 + G.dist(v.x, v.y, b.x, b.y) * 0.06)]);
      }
    }
    if (!shops.length) return null;
    let tot = 0; for (const s of shops) tot += s[2];
    let r = G.R() * tot, pick = shops[0]; for (const s of shops) { r -= s[2]; if (r <= 0) { pick = s; break; } }
    return H.setTask(v, { type: 'shop', id: pick[0].id, k: pick[1], pri: 0.35 });
  };
  function runShop(v, t, dt, H) {
    const S = G.S; const b = workB(v, t, H); if (!b) return;
    const h = homeOf(v);
    if (t.st === 0) {
      let r;
      if (!b.blocks) { if (!t.spot) { t.si = Math.floor(G.R() * 4); } if (!t.spot) t.spot = b.type === 'feira' && E.stallSpot ? E.stallSpot(b, t.si, true) : [b.x + G.rr(0.3, b.w - 0.3), b.y + G.rr(0.3, b.h - 0.3)]; r = walkTo(v, t, 'spot', t.spot[0], t.spot[1], false, dt, H); }
      else r = walkB(v, t, b, dt, H);
      if (r < 0) return H.end(v); if (r > 0) { t.st = 1; v.actT = 0; } return;
    }
    if (t.st === 1) {
      // a line at the stall (or at the shop door) when others got there first
      if (G.Life && !t.served) {
        let fx, fy, dx, dy;
        if (b.blocks) { const d = G.Vg.door(b), c = G.Village.center(b); fx = d[0]; fy = d[1]; dx = d[0] - c[0]; dy = d[1] - c[1]; }
        else { fx = t.spot[0]; fy = t.spot[1]; dx = 0.72; dy = 0.63; }
        const key = t.qkey = 'shop:' + b.id + ':' + (b.type === 'feira' ? t.si : 0);
        if (v._q !== key && G.Life.queueFull(key)) { G.Vg.emote(v, 'sad', 1); return H.end(v); } // too long: another time
        if (!G.Life.inLine(v, t, key, fx, fy, dx, dy, dt, H)) { if (t.waited > 30) { G.Life.leaveQueue(v); return H.end(v); } return; }
        t.served = true; v.actT = 0;
      }
      v.act = 'buy'; if (b.blocks) faceB(v, b); else if (b.type === 'feira') G.faceTo(v, -1, 1);
      if (v.actT < (t.qkey && G.Life.queueLen(t.qkey) > 1 ? 1.2 : 2.4)) return; // with a line behind, the seller hurries
      const I = inv(b); const k = t.k;
      if ((I[k] || 0) < 1) return H.end(v);
      const f = G.Fac.ofV(v); const n = k === 'food' ? Math.min(3, I[k]) : 1;
      const shady = b.type === 'mercado_negro';
      const price = Math.round(E.PRICE[k] * n * (shady ? 0.7 : 1) * 100) / 100;
      if (f && E.coinage(f.id)) {
        if (!spend(v, price)) { G.Vg.emote(v, 'sad', 1.5); return H.end(v); }
        // the seller's household keeps the money (the state runs the fair)
        const seller = [...S.villagers.values()].find(o => o.job === b.id);
        if (b.type === 'feira' || !seller) { f.stock.moedas += price; f.eco.sales += price; }
        else { const sh = homeOf(seller); if (sh) sh.coin = (sh.coin || 0) + price; else seller.purse = (seller.purse || 0) + price; }
        if (shady) f.eco.lostTax = (f.eco.lostTax || 0) + price * E.taxRate(f);
      }
      I[k] -= n; v.carry = { k, n, bought: true }; G.Life && G.Life.leaveQueue(v);
      G.Vg.emote(v, 'happy', 1.2);
      if (!h) { v.carry = null; return H.end(v); }
      t.st = 2; return;
    }
    const r = walkB(v, t, h, dt, H);
    if (r < 0) { v.carry = null; return H.end(v); }
    if (r > 0) { const I = inv(h); if (v.carry.k === 'food') h.pantry = (h.pantry || 0) + v.carry.n; else I[v.carry.k] = (I[v.carry.k] || 0) + v.carry.n; v.carry = null; H.end(v); }
  }
  E.tavernTask = function (v, H) {
    const S = G.S; if (v.captive || v.age < 16) return null;
    let best = null, bd = 1e9;
    for (const b of E.byType(v.set, 'taverna')) if ((inv(b).food || 0) >= 1) { const d = G.dist2(v.x, v.y, b.x, b.y); if (d < bd) { bd = d; best = b; } }
    if (!best || bd > 30 * 30) return null;
    return H.setTask(v, { type: 'tavern', id: best.id, pri: 0.4 });
  };
  function runTavernVisit(v, t, dt, H) {
    const b = workB(v, t, H); if (!b) return;
    if (t.st === 0) {
      if (!t.spot) { const [dx, dy] = G.Vg.door(b); t.spot = [dx + G.rr(-0.6, 0.6), dy + G.rr(-0.1, 0.5)]; }
      const r = walkTo(v, t, 'spot', t.spot[0], t.spot[1], false, dt, H); if (r < 0) return H.end(v); if (r > 0) { t.st = 1; v.actT = 0; } return;
    }
    v.act = v.actT % 6 < 4 ? 'drink' : 'talk'; faceB(v, b);
    if (G.R() < dt * 0.08) G.Vg.emote(v, G.pick(['happy', 'chat', 'heart']), 1.3);
    if (v.actT > 12 && !t.paid) {
      t.paid = true;
      const I = inv(b); const f = G.Fac.ofV(v);
      if ((I.food || 0) >= 1) { I.food -= 1; v.hunger = Math.max(0, v.hunger - 35); if (f && E.coinage(f.id) && spend(v, 0.4)) { const keeper = [...G.S.villagers.values()].find(o => o.job === b.id); const kh = keeper && homeOf(keeper); if (kh) kh.coin = (kh.coin || 0) + 0.4; } }
    }
    if (v.actT > 16) H.end(v);
  }
  // the end of the working day: back to the house
  E.goHomeTask = function (v, H) { const h = homeOf(v); if (!h || !h.built) return null; return H.setTask(v, { type: 'goHome', id: h.id, pri: 0.5 }); };
  function runGoHome(v, t, dt, H) {
    const h = G.S.buildings.get(t.id); if (!h || !h.built) return H.end(v);
    if (t.st === 0) { const r = walkB(v, t, h, dt, H); if (r < 0) return H.end(v); if (r > 0) { t.st = 1; v.actT = 0; t.dur = G.rr(6, 14); if (G.R() < 0.5) v.inside = h.id; } return; }
    // eat from the family pantry, then rest at the door
    if (v.hunger > 45 && (h.pantry || 0) >= 1) { h.pantry -= 1; v.hunger = Math.max(0, v.hunger - 55); v.act = 'eat'; }
    else if (!v.inside) v.act = 'sit';
    if (v.actT > t.dur) H.end(v);
  }
  // ------------------------------ soldiers keep watch ------------------------------
  E.guardTask = function (v, H) {
    const S = G.S; const set = S.settlements.get(v.set); if (!set) return null;
    const posts = [];
    for (const t of ['torre', 'palacio', 'coletoria', 'quartel', 'mercado_negro', 'mercado']) for (const b of E.byType(v.set, t)) posts.push({ b });
    const w = G.Siege && G.Siege.wallOf(set.id);
    if (w && w.done) for (const i of w.gates) posts.push({ gate: i });
    if (!posts.length) return null;
    const p = G.pick(posts);
    if (p.b) return H.setTask(v, { type: 'guard', id: p.b.id, pri: 1, dur: G.rr(22, 40), tower: p.b.type === 'torre' });
    const gx = (p.gate % N) + 0.5, gy = ((p.gate / N) | 0) + 0.5;
    const spot = W.randomNear(gx + (set.cx > gx ? 0.9 : -0.9), gy + (set.cy > gy ? 0.9 : -0.9), 0.7) || W.nearestLand(gx, gy, 2);
    if (!spot) return null;
    return H.setTask(v, { type: 'guard', gate: p.gate, x: spot[0], y: spot[1], pri: 1, dur: G.rr(24, 44) });
  };
  function runGuard(v, t, dt, H) {
    const S = G.S;
    if (t.st === 0) {
      let r;
      if (t.id) { const b = S.buildings.get(t.id); if (!b || !b.built) return H.end(v); r = walkB(v, t, b, dt, H); }
      else r = walkTo(v, t, 'post', t.x, t.y, false, dt, H);
      if (r < 0) return H.end(v);
      if (r > 0) { t.st = 1; v.actT = 0; if (t.tower) v.inside = t.id; }
      return;
    }
    v.act = 'guard';
    if (t.tower) { const b = S.buildings.get(t.id); if (b) b.manned = S.clock + 2; }
    // the watch catches smugglers with stolen goods
    if (G.R() < dt * 0.5) for (const o of S.villagers.values()) {
      if (o.role !== 'contrabandista' || o.set !== v.set || !(o.carry && o.carry.stolen) || o.inside) continue;
      if (G.dist2(o.x, o.y, v.x, v.y) > 36) continue;
      E.arrest(o, v); break;
    }
    if (v.actT > (t.dur || 30)) H.end(v);
  }
  E.arrest = function (o, guard) {
    const S = G.S; const f = G.Fac.ofV(o); const set = S.settlements.get(o.set);
    G.Vg.emote(guard, 'angry', 2); G.Vg.emote(o, 'fear', 3);
    if (o.carry) { if (f) G.Village.addStock(o.carry.k, o.carry.n, f.id); o.carry = null; }
    const shop = S.buildings.get(o.job);
    const h = homeOf(o); if (h && f) { const fine = Math.round((h.coin || 0) * 0.8 * 100) / 100; h.coin -= fine; f.stock.moedas += fine; }
    o.role = null; o.job = 0; G.Vg.endTask(o);
    const ruler = f && G.Politics.ruler(f);
    const cruel = ruler && G.Politics.persona(ruler).cru > 0.65;
    log(`${guard.name} flagrou ${o.name} com mercadoria roubada${set ? ' em ' + set.name : ''}.${cruel ? ' O governante mandou executá-l' + oa(o) + '.' : ' Multa pesada e a mercadoria de volta ao armazém.'}`, 'chain', o.x, o.y);
    if (cruel && G.Politics.execute) G.Politics.execute(f, o, 'por contrabando');
    if (shop && shop.type === 'mercado_negro') {
      shop.raids = (shop.raids || 0) + 1;
      if (shop.raids >= 2) { log(`A guarda fechou o mercado clandestino${set ? ' de ' + set.name : ''}.`, 'chain', shop.x, shop.y); G.Village.removeBuilding(shop); }
    }
  };

  // ------------------------------ the black market grows where taxes bite ------------------------------
  function considerBlackMarket(set, f) {
    const S = G.S;
    if ((set.tier || 0) < 2) return;
    for (const b of S.buildings.values()) if (b.type === 'mercado_negro' && b.set === set.id) return;
    const rate = E.taxRate(f);
    const pop = G.Village.pop(set.id);
    const short = f.stock.tecido + f.stock.ceramica < pop * 0.1 && (f.stock.tecido + f.stock.ceramica) > 0;
    const push = (rate - 0.15) * 3 + (set.loyalty < 40 ? 0.6 : 0) + (short ? 0.3 : 0) + (G.Fac.enemiesOf(f.id).length ? 0.2 : 0);
    if (push <= 0 || G.R() > push * 0.25) return;
    // two disloyal souls set up shop in a back alley
    const crooks = [...S.villagers.values()].filter(v => v.set === set.id && !v.captive && v.age >= 18 && v.age < 55 && v.role !== 'guerreiro' && !G.Fac.all().some(q => q.leader === v.id)).sort((a, b) => (a.devotion + (a.traits.includes('Cético') ? -10 : 0)) - (b.devotion + (b.traits.includes('Cético') ? -10 : 0)));
    if (crooks.length < 2) return;
    const pos = G.Village.findSite(set, 'mercado_negro'); if (!pos) return;
    const b = G.Village.addBuilding('mercado_negro', pos[0], pos[1], set.id, true);
    for (const v of crooks.slice(0, 2)) { v.role = 'contrabandista'; v.job = b.id; }
    log(`Num beco de ${set.name}, surgiu um mercado clandestino. Mercadoria sem imposto — e sem pergunta.`, 'chain', b.x, b.y);
  }

  // ------------------------------ slow ticks: pens, houses, statues ------------------------------
  function penTick(dt) {
    const S = G.S;
    for (const b of S.buildings.values()) {
      if ((b.type !== 'curral' && b.type !== 'estabulo') || !b.built) continue;
      const set = S.settlements.get(b.set); if (!set) continue;
      const kind = penKind(b);
      const herd = E.penAnimals(b);
      // the pen is a sown paddock: its grass grows back faster than the wild
      if (S.veg) for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) { const i = y * N + x; S.veg[i] = Math.min(Math.max(0.6, G.Animals.vegCap(i) || 0), S.veg[i] + dt / DAY() * 0.9); }
      if (!b.stocked) { b.stocked = true; if (!herd.length) spawnStock(b, kind, kind === 'cavalo' ? 3 : 4, false); continue; }
      // young are born when the flock is fed and there is room
      const adults = herd.filter(a => a.grown >= 1);
      const fed = herd.length ? herd.reduce((s, a) => s + a.hunger, 0) / herd.length < 0.45 : false;
      const cap = G.BDEF[b.type].pen;
      if (adults.length >= 2 && herd.length < cap && fed && G.R() < dt / DAY() * (kind === 'peru' ? 3 : kind === 'porco' ? 2.4 : 1.4)) {
        const m = G.pick(adults);
        G.Animals.spawn(kind, m.x + G.rr(-0.3, 0.3), m.y + G.rr(-0.3, 0.3), { dom: set.fac, pen: b.id, grown: 0.3, age: 0, hunger: 0.1, hx: m.x, hy: m.y, state: 'pen' }); E.penDirty();
      }
    }
  }
  function houseTick(dt) {
    const S = G.S; const dayF = dt / DAY();
    const bySet = new Map();
    for (const h of S.buildings.values()) {
      if (!h.built || !G.BDEF[h.type].housing) continue;
      const I = inv(h); const res = h.res || 0; if (!res) continue;
      let sat = 0, cnt = 0;
      for (const k in HOUSE_WANTS) {
        const need = res * HOUSE_WANTS[k];
        const use = need * dayF;
        const have = I[k] || 0;
        if (have >= use) { I[k] = have - use; sat += 1; } else { I[k] = 0; sat += have / Math.max(0.0001, use); }
        cnt++;
      }
      h.well = G.lerp(h.well === undefined ? 0.5 : h.well, sat / cnt, Math.min(1, dayF * 2));
      let a = bySet.get(h.set); if (!a) bySet.set(h.set, a = [0, 0]); a[0] += h.well * res; a[1] += res;
    }
    for (const s of S.settlements.values()) { const a = bySet.get(s.id); s.prosp = a && a[1] ? a[0] / a[1] : 0.3; }
  }
  E.loyaltyMod = function (s, f) {
    let m = ((s.prosp === undefined ? 0.3 : s.prosp) - 0.3) * 18;
    m -= Math.max(0, E.taxRate(f) - 0.1) * 60;
    if (f._scribes && G.S.clock - f._scribes < 60) m += 3;
    if (s.feast > 0) m += 8;
    return m;
  };

  // ------------------------------ update ------------------------------
  let tPen = 0, tHouse = 0, tBM = 0, tDay = -1;
  E.update = function (dt) {
    const S = G.S; if (!S) return;
    if (!S.ores) E.genDeposits(S);
    tPen += dt; tHouse += dt; tBM += dt;
    if (tPen >= 2) { penTick(tPen); tPen = 0; }
    if (tHouse >= 3) { houseTick(tHouse); tHouse = 0; }
    if (tBM >= 30) { tBM = 0; for (const s of S.settlements.values()) { const f = G.Fac.get(s.fac); if (f) { E.ensure(f); considerBlackMarket(s, f); } } }
    if (tDay !== S.day) { tDay = S.day; for (const f of G.Fac.all()) { E.ensure(f); f.eco.last = { made: f.eco.made, used: f.eco.used, tax: f.eco.tax, wages: f.eco.wages, sales: f.eco.sales, stolen: f.eco.stolen || 0 }; f.eco.made = {}; f.eco.used = {}; f.eco.tax = 0; f.eco.wages = 0; f.eco.sales = 0; f.eco.stolen = 0; } }
  };

  // ------------------------------ words ------------------------------
  E.taskText = function (v, t) {
    const S = G.S; const bn = id => { const b = S.buildings.get(id); return b ? G.Village.buildName(b) : 'o trabalho'; };
    const gn = k => E.name(k);
    switch (t.type) {
      case 'craft': return ({ weave: 'Tecendo no tear', forge: 'Martelando na forja', craft: 'Trabalhando o ouro', pottery: 'Torneando potes de barro' })[E.RECIPE[v.role] ? E.RECIPE[v.role].act : ''] || 'Trabalhando';
      case 'fetch': return t.st < 2 ? `Indo buscar ${gn(t.k)} no armazém` : `Levando ${gn(t.k)} para ${bn(t.id)}`;
      case 'haul': return 'Levando a produção ao armazém';
      case 'dig': return t.st < 1 ? 'Indo tirar argila na beira do rio' : t.st === 1 ? 'Cavando argila' : 'Levando argila para a olaria';
      case 'herd': return t.st <= 1 ? 'Indo soltar o rebanho' : t.st === 2 ? 'Levando o rebanho ao pasto' : t.st === 3 ? 'Vigiando o rebanho no pasto' : 'Trazendo o rebanho de volta';
      case 'fodder': return t.st < 2 ? 'Buscando feno no celeiro' : t.st === 2 ? 'Levando feno ao curral' : 'Enchendo o cocho';
      case 'tend': return ({ shear: 'Tosquiando uma ovelha', milk: 'Ordenhando', eggs: 'Recolhendo ovos', groom: 'Escovando um cavalo' })[t.what] || 'Cuidando dos animais';
      case 'penwork': return 'Limpando o curral';
      case 'slaughter': return t.st === 0 ? 'Indo buscar um animal no curral' : t.st === 1 ? 'Levando o animal ao açougue' : 'Abatendo e cortando a carne';
      case 'minejob': return v.inside ? 'Cavando nas galerias da mina' : 'Indo para a mina';
      case 'restock': return t.st < 2 ? `Buscando ${gn(t.k)} no armazém` : `Levando ${gn(t.k)} para ${bn(t.id)}`;
      case 'sell': return t.shady ? 'Vendendo mercadoria desviada' : t.fair ? 'Vendendo na feira' : 'Vendendo no mercado';
      case 'serve': return 'Servindo na taverna';
      case 'desk': return v.role === 'cobrador' ? 'Contando moedas na coletoria' : 'Escrevendo registros';
      case 'mint': return 'Cunhando moedas';
      case 'taxes': return t.k < t.route.length ? 'Cobrando impostos de porta em porta' : 'Levando os impostos à coletoria';
      case 'steal': return t.st < 2 ? 'Esgueirando-se até o armazém' : 'Levando mercadoria roubada';
      case 'shop': return t.st < 2 ? `Comprando ${gn(t.k)} em ${bn(t.id)}` : `Levando ${gn(t.k)} para casa`;
      case 'tavern': return 'Bebendo e conversando na taverna';
      case 'guard': return t.tower ? 'De vigia no alto da torre' : t.gate !== undefined ? 'De guarda no portão' : `De guarda em ${bn(t.id)}`;
      case 'goHome': return v.inside ? 'Em casa, depois do trabalho' : t.st ? 'Descansando na porta de casa' : 'Voltando para casa depois do trabalho';
    }
    return null;
  };
  E.workplaceText = function (v) {
    const S = G.S; const b = v.job && S.buildings.get(v.job);
    return b ? G.Village.buildName(b) : null;
  };

  // ------------------------------ inspector & realm panel ------------------------------
  const fmt = n => n >= 100 ? Math.round(n) : Math.round(n * 10) / 10;
  E.realmHTML = function (f, esc) {
    E.ensure(f); const st = f.stock; const L = f.eco.last || {};
    const goods = E.KEYS.filter(k => k !== 'moedas' && (st[k] || 0) >= 1).map(k => `<span title="${E.GOODS[k].title}"><i style="background:${E.GOODS[k].col}"></i>${esc(E.GOODS[k].title)} <b>${Math.floor(st[k])}</b></span>`).join('');
    const coin = E.coinage(f.id);
    let homes = 0; for (const h of G.S.buildings.values()) if (h.coin && G.Village.facOfSet(h.set) === f.id) homes += h.coin;
    const made = Object.keys(L.made || {}).filter(k => L.made[k] >= 1).map(k => `${Math.round(L.made[k])} ${E.name(k)}`).join(', ');
    const rate = Math.round(E.taxRate(f) * 100);
    return `<div class="rm-eco">${goods ? `<div class="rm-goods">${goods}</div>` : ''}
      <div class="rm-money">${coin ? `Tesouro <b>${Math.floor(st.moedas)}</b> moedas · famílias <b>${Math.floor(homes)}</b> · imposto <b>${rate}%</b>` : `Sem moeda: tudo vai ao armazém e é repartido${rate ? ` · tributo <b>${rate}%</b>` : ''}`}</div>
      ${made || L.tax || L.sales ? `<div class="rm-day">Ontem: ${made ? 'produziu ' + esc(made) : 'nenhuma produção de ofício'}${L.tax ? ` · arrecadou ${fmt(L.tax)}` : ''}${L.wages ? ` · pagou ${fmt(L.wages)} em salários` : ''}${L.sales ? ` · vendeu ${fmt(L.sales)}` : ''}${L.stolen ? ` · <em class="neg">${fmt(L.stolen)} roubados</em>` : ''}</div>` : ''}</div>`;
  };
  const ROLE_OF = b => (G.BDEF[b.type] || {}).role;
  E.buildingHTML = function (b, plink, esc) {
    const S = G.S; let h = '';
    const I = b.inv || {};
    const def = G.BDEF[b.type];
    if (def.jobs) {
      const ws = [...S.villagers.values()].filter(v => v.job === b.id);
      h += `<div class="family"><div>Trabalham aqui (${ws.length}/${def.jobs}):</div><div>${ws.map(v => plink(v.id)).join(', ') || '<span class="muted">ninguém trabalha aqui agora</span>'}</div></div>`;
    }
    if (b.type === 'curral' || b.type === 'estabulo') {
      const herd = E.penAnimals(b); const kind = b.kind || (b.type === 'estabulo' ? 'cavalo' : null);
      const sp = kind && G.Animals.DEF[kind];
      const young = herd.filter(a => a.grown < 1).length;
      const out = herd.filter(a => a.state === 'herd').length;
      const ready = herd.filter(a => a.wool >= 1 || a.milk >= 1 || a.eggs >= 1).length;
      const hungry = herd.length ? herd.reduce((s, a) => s + a.hunger, 0) / herd.length : 0;
      h += `<div class="doing">${herd.length ? `<b>${herd.length}</b> ${esc(G.Animals.plural(sp, herd.length).replace(/^\d+ /, ''))}${young ? ` (${young} filhote${young > 1 ? 's' : ''})` : ''} de ${def.pen}` : 'Nenhum animal — ainda'}${out ? ` · ${out} no pasto` : ''}${ready ? ` · ${ready} pronto${ready > 1 ? 's' : ''} para ${kind === 'ovelha' ? 'tosquiar' : kind === 'peru' ? 'recolher ovos' : 'ordenhar'}` : ''}<br>Capim do curral: ${Math.round(E.penGrass(b) * 100)}% · fome do rebanho ${Math.round(hungry * 100)}%</div>`;
    }
    if (b.type === 'mina') { const o = (S.ores || []).find(q => q.id === b.ore); h += `<div class="doing">${o ? `Veio de <b>${o.kind === 'ouro' ? 'ouro' : 'ferro'}</b>: ${Math.round(o.amt)} de ${o.max} restantes` : 'Sem veio de minério.'}</div>`; }
    if (b.type === 'feira') h += `<div class="doing">${E.fairOpen() ? (b.openT && S.clock - b.openT < 6 ? 'Barracas armadas: dia de feira!' : 'Esperando os feirantes.') : 'Fechada — a feira abre de manhã.'}</div>`;
    if (b.type === 'coletoria') { const f = G.Fac.ofSet(b.set); if (f) h += `<div class="doing">Imposto de ${esc(f.name)}: <b>${Math.round(E.taxRate(f) * 100)}%</b>${E.coinage(f.id) ? ` · tesouro com ${Math.floor(f.stock.moedas)} moedas` : ' · sem moeda ainda'}</div>`; }
    if (b.type === 'mercado_negro') h += `<div class="doing">${b.raids ? `Já foi batido ${b.raids} ${b.raids > 1 ? 'vezes' : 'vez'} pelos guardas.` : 'Ninguém sabe de nada. Ninguém viu nada.'}</div>`;
    if (G.BDEF[b.type].housing && b.res) {
      const wants = Object.keys(HOUSE_WANTS).map(k => `${E.name(k)} ${fmt(I[k] || 0)}`).join(' · ');
      h += `<div class="doing">Bem-estar da casa: <b>${Math.round((b.well === undefined ? 0.5 : b.well) * 100)}%</b>${b.coin ? ` · ${fmt(b.coin)} moedas guardadas` : ''}<br><span class="muted">${esc(wants)}${b.pantry ? ` · despensa ${fmt(b.pantry)}` : ''}</span></div>`;
    }
    const inv = E.KEYS.concat(['food', 'wood']).filter(k => (I[k] || 0) >= 1 && !(G.BDEF[b.type].housing && HOUSE_WANTS[k] !== undefined));
    if (inv.length && !G.BDEF[b.type].housing) h += `<div class="doing">Estoque aqui: ${inv.map(k => `<b>${Math.floor(I[k])}</b> ${esc(E.name(k))}`).join(', ')}</div>`;
    return h;
  };
  E.personLine = function (v) {
    const S = G.S; const b = v.job && S.buildings.get(v.job);
    const parts = [];
    if (b) parts.push('trabalha n' + (G.gen(G.Village.buildName(b).toLowerCase()) === 'a' ? 'a ' : 'o ') + G.Village.buildName(b));
    if (v.unpaid > 0.5) parts.push('salário atrasado');
    return parts.join(' · ');
  };

  // ------------------------------ save ------------------------------
  (G.saveHooks = G.saveHooks || []).push({
    save(out) { out.ores = G.S.ores || null; },
    load(o) { const S = G.S; S.ores = o.ores || null; if (!S.ores) E.genDeposits(S); for (const f of S.factions.values()) E.ensure(f); },
  });
})(window.G);
