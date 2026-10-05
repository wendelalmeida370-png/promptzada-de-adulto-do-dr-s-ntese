'use strict';
// ============================================================
//  Cities: growth from camp to metropolis, civic buildings,
//  house upgrades, paved streets, highways & bridges, carts on
//  trade routes, aqueducts, and everyday city life
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const Ci = G.City = {};
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);

  // ------------------------------ new buildings ------------------------------
  Object.assign(G.BDEF, {
    sobrado: { name: 'Sobrado', w: 1, h: 1, cost: { wood: 16, stone: 20 }, work: 34, housing: 9, blocks: true, hp: 150 },
    insula: { name: 'Ínsula', w: 1, h: 1, cost: { wood: 22, stone: 36 }, work: 48, housing: 14, blocks: true, hp: 200 },
    praca: { name: 'Praça', w: 2, h: 2, cost: { stone: 22 }, work: 20, blocks: false, hp: 999, civic: 1 },
    mercado: { name: 'Mercado', w: 2, h: 2, cost: { wood: 30, stone: 14 }, work: 32, blocks: true, hp: 160, storage: 50, civic: 1 },
    celeiro: { name: 'Celeiro', w: 2, h: 2, cost: { wood: 26, stone: 12 }, work: 28, blocks: true, dropoff: true, storage: 110, hp: 170 },
    biblioteca: { name: 'Biblioteca', w: 2, h: 2, cost: { wood: 20, stone: 44 }, work: 55, blocks: true, hp: 220, civic: 1 },
    teatro: { name: 'Teatro', w: 3, h: 3, cost: { wood: 24, stone: 80 }, work: 80, blocks: true, hp: 320, civic: 1 },
    banhos: { name: 'Banhos', w: 2, h: 2, cost: { wood: 14, stone: 50 }, work: 52, blocks: true, hp: 240, civic: 1 },
    palacio: { name: 'Palácio', w: 3, h: 3, cost: { wood: 50, stone: 100 }, work: 100, blocks: true, hp: 420, civic: 1 },
    doca: { name: 'Doca', w: 2, h: 2, cost: { wood: 40 }, work: 34, blocks: true, dropoff: true, hp: 180 },
    aqueduto: { name: 'Aqueduto', w: 1, h: 1, cost: { wood: 10, stone: 55 }, work: 55, blocks: true, hp: 300 },
    maravilha: { name: 'Maravilha', w: 3, h: 3, cost: { wood: 60, stone: 240 }, work: 300, blocks: true, hp: 900, civic: 1 },
    quarteirao: { name: 'Quarteirão', w: 2, h: 2, cost: { wood: 40, stone: 80 }, work: 95, housing: 40, blocks: true, hp: 380 },
  });
  Object.assign(G.BDESC, {
    sobrado: 'Casa de dois andares, de pedra. Abriga várias famílias. Exige Alvenaria.',
    insula: 'Prédio de muitos andares: a cidade cresce para cima. Exige Engenharia.',
    praca: 'O coração da cidade: encontros, notícias e festas. Aumenta a lealdade.',
    mercado: 'Barracas e mercadores. Melhora o comércio e as rotas de carroças.',
    celeiro: 'Guarda grãos longe dos ratos. Mais espaço no estoque.',
    biblioteca: 'Rolos, tábuas e sábios. Acelera a pesquisa de novas tecnologias.',
    teatro: 'Espetáculos, jogos e rituais. Deixa o povo leal e curioso.',
    banhos: 'Água quente, conversa e higiene. Menos doenças, mais lealdade.',
    palacio: 'A sede do poder. Dá legitimidade a quem governa e lealdade à capital.',
    doca: 'Porto com cais e estaleiro. Barcos de pesca, navios mercantes e de guerra.',
    aqueduto: 'Caixa d\'água ligada por arcos a um rio. Água corrente: colheitas melhores, mais gente, menos doenças.',
    maravilha: 'Uma obra que desafia o tempo. Fé, orgulho e lealdade em todo o reino.',
    quarteirao: 'Um bloco inteiro de prédios altos em volta de um pátio. É assim que as metrópoles viram megalópoles. Exige Engenharia.',
  });
  Ci.TIERS = ['Acampamento', 'Aldeia', 'Vila', 'Cidade', 'Metrópole', 'Megalópole'];
  const CROWD = [30, 42, 60, 100, 170, 320];
  const STREETS = [0, 0, 26, 64, 120, 200];
  Ci.IDEAL = { praca: 2.2, mercado: 3.6, celeiro: 6.5, biblioteca: 4.5, teatro: 6.5, banhos: 5, palacio: 4.2, aqueduto: 4, maravilha: 7.5, doca: 8 };
  const LOY = { praca: 3, teatro: 5, banhos: 3, palacio: 6, temple: 2, mercado: 1, biblioteca: 1 };

  Ci.claims = new Map();
  const noRoute = new Map();
  Ci.reset = function () { Ci.claims.clear(); noRoute.clear(); tT = 4; tR = 5; tA = 0; };

  // ------------------------------ tiers ------------------------------
  function tally() {
    const m = new Map();
    for (const b of G.S.buildings.values()) {
      if (b.type === 'ruin') continue;
      // a house being rebuilt still counts as the house it was
      const type = b.built ? b.type : b.upgradeFrom; if (!type) continue;
      let c = m.get(b.set); if (!c) { c = {}; m.set(b.set, c); }
      c[type] = (c[type] || 0) + 1;
    }
    return m;
  }
  Ci.tierOf = function (set, c, pop) {
    c = c || {};
    const homes = (c.hut || 0) + (c.house || 0) + (c.sobrado || 0) + (c.insula || 0) + (c.quarteirao || 0);
    const stoneH = (c.house || 0) + (c.sobrado || 0) + (c.insula || 0) + (c.quarteirao || 0), tall = (c.sobrado || 0) + (c.insula || 0) + (c.quarteirao || 0) * 2;
    let t = 0;
    if (pop >= 6 && homes >= 2) t = 1;
    if (t >= 1 && pop >= 16 && homes >= 4 && c.storehouse && c.farm) t = 2;
    if (t >= 2 && pop >= 30 && (c.praca || c.mercado) && stoneH >= 5 && (c.temple || c.celeiro || c.biblioteca || (c.mercado && c.praca))) t = 3;
    if (t >= 3 && pop >= 50 && tall >= 5 && (c.palacio || c.maravilha || c.teatro) && (c.aqueduto || c.banhos || c.biblioteca) && (set.streets || 0) >= 18) t = 4;
    if (t >= 4 && pop >= 140 && (c.quarteirao || 0) >= 3 && (c.palacio || c.maravilha) && c.teatro && c.mercado && (c.aqueduto || c.banhos) && (set.streets || 0) >= 50) t = 5;
    return t;
  };
  Ci.tierName = s => Ci.TIERS[(s && s.tier) || 0];
  function countStreets(set) {
    const S = G.S; const r = Math.ceil((set.radius || 8)); let n = 0;
    const cx = Math.floor(set.cx), cy = Math.floor(set.cy);
    for (let y = Math.max(0, cy - r); y <= Math.min(N - 1, cy + r); y++) for (let x = Math.max(0, cx - r); x <= Math.min(N - 1, cx + r); x++) if (S.road[y * N + x]) n++;
    return n;
  }
  function updateTiers() {
    const S = G.S; const m = tally();
    const wonder = new Set();
    for (const s of S.settlements.values()) {
      const c = m.get(s.id) || {}; s._c = c;
      if (c.maravilha) wonder.add(s.fac);
      s.streets = countStreets(s);
      const pop = G.Politics.freePopOfSet(s.id);
      const t = Ci.tierOf(s, c, pop);
      if (s.tier === undefined) { s.tier = t; s.best = t; continue; }
      if (t > s.tier) {
        // only a real first-time growth is news; recovering after a bad spell is quiet — and must hold a while
        const recovering = t <= (s.best || 0);
        s.tierHigh = (s.tierHigh || 0) + 1;
        if (!recovering || s.tierHigh >= 20) {
          s.tierLow = 0; s.tierHigh = 0; const from = s.tier; s.tier = t;
          if (t > (s.best || 0)) { s.best = t; tierUp(s, t, from); }
        }
      } else if (t < s.tier) {
        s.tierLow = (s.tierLow || 0) + 1; s.tierHigh = 0;
        if (s.tierLow >= 36) {
          s.tier = t; s.tierLow = 0;
          if (S.day - (s.decayDay === undefined ? -99 : s.decayDay) >= 8) { s.decayDay = S.day; log(`${s.name} decaiu: voltou a ser ${t === 0 ? 'um ' : 'uma '}${Ci.TIERS[t].toLowerCase()}.`, 'city', s.cx, s.cy); }
        }
      } else { s.tierLow = 0; s.tierHigh = 0; }
      // aqueduct water reaches the fields
      if (s.aqua) for (const b of S.buildings.values()) if (b.set === s.id && b.type === 'farm') b.aqua = true;
    }
    for (const f of S.factions.values()) f._wonder = wonder.has(f.id);
  }
  function tierUp(s, t, from) {
    const S = G.S; const f = G.Fac.get(s.fac); if (!f) return;
    if (from === 0 && t === 1 && S.day < 3) return;
    const TXT = [null,
      `${s.name} deixou de ser um acampamento: agora é uma aldeia.`,
      `${s.name} cresceu e virou uma vila: ruas de terra batida, ofícios, vizinhos.`,
      `${s.name} tornou-se uma cidade — praça, casas de pedra, comércio e gente de toda parte.`,
      `${s.name} é agora uma metrópole, o coração pulsante de ${f.name}.`,
      `${s.name} virou uma megalópole: um mar de telhados, ruas que não acabam e gente de todos os cantos do mundo.`];
    log(TXT[t], 'city', s.cx, s.cy);
    if (t >= 3) {
      G.UI && G.UI.toast(t === 5 ? 'Megalópole' : t === 4 ? 'Metrópole' : 'Nasce uma cidade', `${s.name} · ${f.name}`, 'city');
      G.Village.milestone(t === 5 ? 'firstMega' : t === 4 ? 'firstMetro' : 'firstCity', t === 5 ? 'Primeira megalópole' : t === 4 ? 'Primeira metrópole' : 'Primeira cidade', `${s.name} (${f.name}).`, 'city');
    }
    if (t >= 2) {
      // the whole town comes out to celebrate
      for (const v of S.villagers.values()) if (v.set === s.id && v.age >= 3 && !v.captive && (!v.task || v.task.pri < 2) && G.dist(v.x, v.y, s.cx, s.cy) < 20 && G.R() < 0.7) G.Vg.give(v, { type: 'celebrate', pri: 1.1, kind: 'celebrate' });
      G.FX && G.FX.ring(s.cx, s.cy, 0.5, (s.radius || 8) * 0.8, 1.6, 'rgba(255,220,140,0.9)', 2, true);
    }
    G.Lore && G.Lore.note('city', { set: s.id, name: s.name, tier: t, fac: f.id });
  }
  Ci.crowdCap = function (setId) { const s = G.S.settlements.get(setId); if (!s) return 48; const c = CROWD[s.tier || 0]; return c + (s.aqua ? Math.max(12, c * 0.15) : 0); };
  Ci.loyaltyBonus = function (s) {
    const c = s._c || {}; let n = 0;
    for (const k in LOY) if (c[k]) n += LOY[k];
    if (s.aqua) n += 3;
    const f = G.Fac.get(s.fac); if (f && f._wonder) n += 6;
    return Math.min(18, n);
  };
  Ci.linked = function (s) {
    if (s.linkDay !== undefined && G.S.day - s.linkDay < 5) return true;
    for (const r of G.S.routes) if (r.kind === 'interno' && r.ok && (r.a === s.id || r.b === s.id) && r.paved >= r.tiles.length * 0.7) return true;
    return false;
  };

  // ------------------------------ planning ------------------------------
  const has = (fac, k) => G.Civ.has(fac.id, k);
  Ci.homeType = function (set, fac, workshop, st) {
    const t = set.tier || 0;
    if (t >= 4 && has(fac, 'engenharia') && st.stone >= 80 && st.wood >= 40 && G.R() < 0.6) return 'quarteirao';
    if (t >= 3 && has(fac, 'engenharia') && st.stone >= 40 && st.wood >= 22 && G.R() < 0.5) return 'insula';
    if (t >= 2 && has(fac, 'alvenaria') && st.stone >= 22 && st.wood >= 16) return 'sobrado';
    return workshop && st.stone >= 6 ? 'house' : 'hut';
  };
  Ci.upgradeHomes = function (set, fac, c, st) {
    const t = set.tier || 0; if (t < 2) return false;
    let from = null, to = null;
    if (t >= 3 && has(fac, 'engenharia') && (c.sobrado || 0) > 2 && !c.siteTypes.insula && st.stone >= 40 && st.wood >= 22) { from = 'sobrado'; to = 'insula'; }
    else if (has(fac, 'alvenaria') && (c.house || 0) > 0 && !c.siteTypes.sobrado && st.stone >= 22 && st.wood >= 16) { from = 'house'; to = 'sobrado'; }
    if (!from) return false;
    // the city densifies from its heart outwards
    let old = null, bd = 1e9;
    for (const b of G.S.buildings.values()) if (b.set === set.id && b.type === from && b.built) { const d = G.dist(b.x + 0.5, b.y + 0.5, set.cx, set.cy); if (d < bd) { bd = d; old = b; } }
    if (!old) return false;
    const def = G.BDEF[to];
    old.type = to; old.built = false; old.progress = 0; old.upgradeFrom = from;
    old.need = Object.assign({ wood: 0, stone: 0 }, def.cost); old.incoming = { wood: 0, stone: 0 };
    old.hp = def.hp; old.maxHp = def.hp;
    return true;
  };
  function siteAnywhere(fac, type) { for (const b of G.S.buildings.values()) if (b.type === type && G.Village.facOfSet(b.set) === fac.id) return true; return false; }
  function trades(fac) { for (const k in fac.rel) if (fac.rel[k].trade > 0) return true; return false; }
  Ci.plan = function (set, fac, c, want, pop) {
    const t = set.tier || 0; if (t < 2) return;
    const st = fac.stock;
    const isCap = G.Fac.capitalOf(fac.id) === set;
    // big cities want a second (third...) square, market, bath-house
    const need = k => !c.siteTypes[k] && (c[k] || 0) < 1 + (k === 'praca' ? Math.floor(pop / 110) : k === 'mercado' ? Math.floor(pop / 140) : k === 'banhos' ? Math.floor(pop / 180) : k === 'teatro' ? Math.floor(pop / 260) : k === 'celeiro' ? Math.floor(pop / 150) : 0);
    if (need('celeiro') && (c.farm || 0) >= 2 && pop >= 18) want.push('celeiro');
    if (need('doca') && has(fac, 'navegacao') && pop >= 12 && Ci.coastal(set)) want.push('doca');
    if (need('aqueduto') && t >= 3 && has(fac, 'engenharia') && st.stone >= 40 && Ci.waterSource(set)) want.push('aqueduto');
    // only one great civic project at a time
    for (const k in c.siteTypes) if (G.BDEF[k] && G.BDEF[k].civic) return;
    const opts = [];
    if (need('praca') && pop >= 18) opts.push('praca');
    if (need('mercado') && pop >= 22 && (has(fac, 'moeda') || has(fac, 'roda') || trades(fac))) opts.push('mercado');
    if (t >= 3) {
      if (need('biblioteca') && has(fac, 'escrita') && st.stone >= 30) opts.push('biblioteca');
      if (need('palacio') && isCap && fac.gov !== 'tribo' && st.stone >= 50) opts.push('palacio');
      // a city without a palace, theatre or wonder dreams of one before it wants baths: it is what makes a metropolis
      const crown = c.palacio || c.teatro || c.maravilha;
      const theatre = need('teatro') && (has(fac, 'filosofia') || has(fac, 'escrita')) && pop >= 36 && st.stone >= 50;
      if (theatre && !crown) opts.push('teatro');
      if (need('banhos') && has(fac, 'alvenaria') && pop >= 32) opts.push('banhos');
      if (theatre && crown) opts.push('teatro');
      if (need('maravilha') && isCap && !fac._wonder && !siteAnywhere(fac, 'maravilha') && has(fac, 'alvenaria') && (fac.civ === 'egipcio' || has(fac, 'engenharia')) && G.Fac.pop(fac.id) >= 55 && st.stone >= 80) opts.push('maravilha');
    }
    // in order of wish: if the first finds no room, the next one gets its turn (still one great project at a time)
    for (const k of opts) want.push(k);
  };

  // ------------------------------ sites by the water ------------------------------
  Ci.dockSite = function (set, test) {
    const S = G.S; let best = null, bs = -1e9;
    const R = Math.min(18, Math.round((set.radius || 8) + 4));
    const cx = Math.floor(set.cx), cy = Math.floor(set.cy);
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      const x = cx + dx, y = cy + dy;
      if (x < 2 || y < 2 || x + 2 > N - 2 || y + 2 > N - 2) continue;
      let ok = true;
      for (let ty = y; ty < y + 2 && ok; ty++) for (let tx = x; tx < x + 2; tx++) { const i = ty * N + tx; if (S.type[i] < T.SAND || S.occ[i] || S.objAt[i] || S.wall[i] || S.fire[i] > 0) { ok = false; break; } }
      if (!ok) continue;
      let sea = 0;
      for (let k = -1; k <= 2; k++) for (const [tx, ty] of [[x - 1, y + k], [x + 2, y + k], [x + k, y - 1], [x + k, y + 2]]) { if (W.inb(tx, ty) && S.type[ty * N + tx] <= T.SEA) sea++; }
      if (sea < 2) continue;
      if (G.Naval && !G.Naval.openSea(x + 1, y + 1)) continue;
      const sl = W.slope(x, y, 2, 2); if (sl > 1.5) continue;
      const d = G.dist(x + 1, y + 1, set.cx, set.cy);
      const sc = -d * 0.8 + sea * 0.4 - sl * 2 + G.R();
      if (sc > bs) { bs = sc; best = [x, y]; if (test) return best; }
    }
    return best;
  };
  Ci.coastal = function (set) {
    if (set._coastDay === G.S.day) return set._coast;
    set._coastDay = G.S.day; set._coast = !!Ci.dockSite(set, true);
    return set._coast;
  };
  Ci.waterSource = function (set) {
    if (set._wsDay === G.S.day) return set._ws;
    const S = G.S; let best = null, bd = 1e9;
    const cx = Math.floor(set.cx), cy = Math.floor(set.cy);
    for (let dy = -22; dy <= 22; dy++) for (let dx = -22; dx <= 22; dx++) {
      const x = cx + dx, y = cy + dy; if (!W.inb(x, y)) continue;
      const t = S.type[y * N + x];
      const d = Math.hypot(dx, dy); if (d < 5) continue;
      const sc = t === T.RIVER ? d : t === T.ROCKY && W.tileH(y * N + x) > W.tileH(cy * N + cx) + 1.5 ? d + 4 : 1e9;
      if (sc < bd) { bd = sc; best = [x, y]; }
    }
    set._wsDay = S.day; set._ws = best;
    return best;
  };

  // ------------------------------ completion ------------------------------
  Ci.onComplete = function (b, set) {
    const S = G.S; if (!set) return;
    const f = G.Fac.get(set.fac); const nm = G.Village.buildName(b); const oa = G.gen(nm);
    const [cx, cy] = G.Village.center(b);
    switch (b.type) {
      case 'praca': log(`${set.name} ganhou ${oa} ${nm}: um lugar para notícias, festas e fofocas.`, 'city', cx, cy); break;
      case 'mercado': log(`Abriu ${oa === 'a' ? 'a' : 'o'} ${nm} de ${set.name}. Barracas, gritos, cheiros de especiaria.`, 'trade', cx, cy); break;
      case 'celeiro': log(`${set.name} construiu ${oa} ${nm}: grãos a salvo da chuva e dos ratos.`, 'food', cx, cy); break;
      case 'biblioteca': log(`${G.cap(oa)} ${nm} de ${set.name} começou a guardar o saber de ${f ? f.name : 'seu povo'}.`, 'tech', cx, cy); break;
      case 'teatro': log(`${G.cap(oa)} ${nm} de ${set.name} lotou na estreia. O povo ri, chora e aplaude.`, 'city', cx, cy); break;
      case 'banhos': log(`${set.name} inaugurou ${oa} ${nm}. Água quente e conversa fiada.`, 'city', cx, cy); break;
      case 'palacio':
        log(`${f ? f.name : set.name} ergueu ${oa} ${nm} em ${set.name}. O poder agora tem endereço.`, 'crown', cx, cy);
        if (f) f.legit = Math.min(100, (f.legit || 50) + 12);
        break;
      case 'doca': log(`${set.name} construiu ${oa} ${nm}: o mar agora é caminho.`, 'ship', cx, cy); G.Village.milestone('firstDock', 'Porto', `${set.name} se abre para o mar.`, 'ship'); break;
      case 'aqueduto': startAqueduct(b, set); break;
      case 'maravilha': {
        log(`Concluíd${oa} ${oa} ${nm} de ${set.name}! Gerações trabalharam nela; gerações vão admirá-la.`, 'wonder', cx, cy);
        G.UI && G.UI.toast(nm, `${f ? f.name : set.name} concluiu sua maravilha.`, 'wonder');
        G.Village.milestone('wonder' + (f ? f.id : 0), 'Uma maravilha do mundo', `${nm} · ${set.name}.`, 'wonder');
        G.FX && G.FX.ring(cx, cy, 0.5, 9, 2.4, 'rgba(255,230,150,0.95)', 3, true);
        for (const v of S.villagers.values()) if (G.Village.facOfSet(v.set) === set.fac && !v.captive) v.devotion = Math.min(100, v.devotion + 10);
        G.Lore && G.Lore.note('wonder', { set: set.id, fac: set.fac, name: nm });
        break;
      }
      default: return false;
    }
    if (b.type !== 'maravilha') G.Lore && G.Lore.note('build', { set: set.id, fac: set.fac, type: b.type, name: nm });
    return true;
  };

  // ------------------------------ aqueducts ------------------------------
  function lTiles(x0, y0, x1, y1, xFirst) {
    const out = [];
    let x = x0, y = y0;
    const sx = Math.sign(x1 - x0), sy = Math.sign(y1 - y0);
    out.push([x, y, xFirst ? 'x' : 'y']);
    if (xFirst) { while (x !== x1) { x += sx; out.push([x, y, 'x']); } while (y !== y1) { y += sy; out.push([x, y, 'y']); } }
    else { while (y !== y1) { y += sy; out.push([x, y, 'y']); } while (x !== x1) { x += sx; out.push([x, y, 'x']); } }
    return out;
  }
  function startAqueduct(b, set) {
    const S = G.S;
    const src = Ci.waterSource(set);
    const [cx, cy] = G.Village.center(b);
    if (!src) { set.aqua = true; log(`${set.name} cavou uma cisterna: água limpa guardada para os dias secos.`, 'aqueduct', cx, cy); return; }
    const bad = list => list.reduce((n, [x, y]) => { const i = y * N + x; return n + (S.type[i] < T.RIVER ? 50 : 0) + (S.occ[i] && S.occ[i] !== b.id ? 3 : 0) + (S.wall[i] === 1 ? 5 : 0); }, 0);
    const A = lTiles(src[0], src[1], b.x, b.y, true), B = lTiles(src[0], src[1], b.x, b.y, false);
    let path = bad(A) <= bad(B) ? A : B;
    path = path.filter(([x, y]) => !(x === b.x && y === b.y));
    // corners take the direction of the next leg
    for (let k = 0; k < path.length - 1; k++) if (path[k][2] !== path[k + 1][2]) path[k][2] = 'c';
    S.aqueducts.push({ id: S.nextId++, set: set.id, b: b.id, tiles: path.map(([x, y, d]) => [x, y, d]), built: 0, done: false, fac: set.fac });
    log(`${set.name} começou a erguer os arcos de um aqueduto, trazendo água de longe.`, 'aqueduct', cx, cy);
  }
  function buildAqueducts(dt) {
    const S = G.S;
    for (const a of S.aqueducts) {
      if (a.done) continue;
      const set = S.settlements.get(a.set), b = S.buildings.get(a.b);
      if (!set || !b || b.type !== 'aqueduto') { a.dead = true; continue; }
      const f = G.Fac.get(set.fac); if (!f || f.stock.stone < 2) continue;
      if (G.R() > 0.8) continue;
      f.stock.stone -= 2;
      const [x, y] = a.tiles[a.built]; const i = y * N + x;
      if (!S.wall[i] && !(S.occ[i] && S.buildings.get(S.occ[i]) && S.buildings.get(S.occ[i]).blocks)) S.wall[i] = 3;
      a.built++;
      G.FX && G.FX.dust(x + 0.5, y + 0.5, 2);
      if (a.built >= a.tiles.length) {
        a.done = true; set.aqua = true;
        const [cx, cy] = G.Village.center(b);
        log(`O aqueduto de ${set.name} está pronto: água corrente chega às casas e aos campos.`, 'aqueduct', cx, cy);
        G.Village.milestone('firstAqueduct', 'Aqueduto', `A água chegou a ${set.name}.`, 'aqueduct');
        G.FX && G.FX.splash(cx, cy, 1.2);
        G.Lore && G.Lore.note('aqueduct', { set: set.id, fac: set.fac });
      }
    }
    if (S.aqueducts.some(a => a.dead)) {
      for (const a of S.aqueducts) if (a.dead) for (let k = 0; k < a.built; k++) { const [x, y] = a.tiles[k]; const i = y * N + x; if (S.wall[i] === 3) S.wall[i] = 0; }
      S.aqueducts = S.aqueducts.filter(a => !a.dead);
    }
  }
  // a ruined castellum takes its arches down with it
  Ci.onDestroyed = function (b) {
    if (b.origType === 'aqueduto' || b.type === 'aqueduto') {
      for (const a of G.S.aqueducts) if (a.b === b.id) a.dead = true;
      const s = G.S.settlements.get(b.set); if (s) s.aqua = false;
    }
  };

  // ------------------------------ streets & highways ------------------------------
  function claimed(i, v) {
    const c = Ci.claims.get(i); if (!c || c === v.id) return false;
    const o = G.S.villagers.get(c);
    if (!o || !o.task || o.task.type !== 'pave' || o.task.i !== i) { Ci.claims.delete(i); return false; }
    return true;
  }
  const highways = fac => has(fac, 'engenharia') || (G.Civ.t(fac.id, 'roads', 0) > 0 && has(fac, 'roda'));
  function nextToBuilding(i) {
    const S = G.S; const x = i % N, y = (i / N) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny)) continue;
      const o = S.occ[ny * N + nx]; if (o) { const b = S.buildings.get(o); if (b && b.blocks && b.type !== 'ruin') return true; }
    }
    return false;
  }
  function pickPave(set, fac, v, near) {
    const S = G.S; const t = set.tier || 0;
    const lvl = has(fac, 'alvenaria') ? 2 : 1;
    let best = null, bs = 1e9;
    // streets of the town itself, growing from the centre outwards
    const room = (set.streets || 0) < STREETS[t];
    if (t >= 2 && (lvl === 1 || fac.stock.stone >= 4)) {
      const r = 3 + t * 2.3; const cx = Math.floor(set.cx), cy = Math.floor(set.cy); const R = Math.ceil(r);
      for (let y = Math.max(1, cy - R); y <= Math.min(N - 2, cy + R); y++) for (let x = Math.max(1, cx - R); x <= Math.min(N - 2, cx + R); x++) {
        const i = y * N + x;
        if (S.type[i] < T.SAND || S.occ[i] || S.road[i] >= lvl || S.wall[i] === 1 || S.fire[i] > 0 || S.treeAt[i] || S.objAt[i]) continue;
        const d = G.dist(x + 0.5, y + 0.5, set.cx, set.cy); if (d > r) continue;
        // new streets follow the paths people already walk; old gravel gets paved in stone
        if (!S.road[i] && (!room || (S.wear[i] < 6 && !nextToBuilding(i)))) continue;
        if (claimed(i, v)) continue;
        let sc = d - Math.min(3, S.wear[i] * 0.05) + G.hash(i + S.day) * 0.6;
        if (near !== undefined) sc += G.dist(x, y, near % N, (near / N) | 0) * 1.5;
        if (sc < bs) { bs = sc; best = { i, lvl }; }
      }
      if (best) return best;
    }
    // highways along the routes, each town paving its own half
    if (!highways(fac) || fac.stock.stone < 3) return null;
    for (const r of S.routes) {
      if (!r.ok || (r.a !== set.id && r.b !== set.id)) continue;
      const other = S.settlements.get(r.a === set.id ? r.b : r.a); if (!other) continue;
      for (const i of r.tiles) {
        if (S.road[i] >= 3 || S.occ[i] || S.wall[i] === 1 || S.type[i] < T.RIVER) continue;
        const x = (i % N) + 0.5, y = ((i / N) | 0) + 0.5;
        const dm = G.dist(x, y, set.cx, set.cy), dO = G.dist(x, y, other.cx, other.cy);
        if (dm > dO + 0.5) continue;
        if (claimed(i, v)) continue;
        let sc = dm + (near !== undefined ? G.dist(x, y, (near % N) + 0.5, ((near / N) | 0) + 0.5) * 2 : 0);
        if (sc < bs) { bs = sc; best = { i, lvl: 3, route: r.id }; }
      }
    }
    return best;
  }
  Ci.paveTask = function (v, H) {
    const S = G.S; const set = S.settlements.get(v.set); if (!set) return null;
    const fac = G.Fac.get(set.fac); if (!fac) return null;
    if ((v._paveCD || 0) > S.clock) return null;
    const p = pickPave(set, fac, v);
    if (!p) { v._paveCD = S.clock + 25; return null; }
    Ci.claims.set(p.i, v.id);
    return H.setTask(v, { type: 'pave', i: p.i, lvl: p.lvl, route: p.route || 0, pri: 1, n: 0 });
  };
  function runPave(v, t, dt, H) {
    const S = G.S;
    const x = (t.i % N) + 0.5, y = ((t.i / N) | 0) + 0.5;
    if (t.st === 0) {
      Ci.claims.set(t.i, v.id);
      if (!H.goto(v, x + G.rr(-0.2, 0.2), y + G.rr(-0.2, 0.2), false, N * N)) { Ci.claims.delete(t.i); return H.end(v); }
      t.st = 1; t.walk = 0; return;
    }
    if (t.st === 1) { t.walk += dt; if (H.move(v, dt)) { t.st = 2; v.actT = 0; } else if (t.walk > 70) { Ci.claims.delete(t.i); H.end(v); } return; }
    v.act = 'build'; G.faceTo(v, x - v.x, y - v.y);
    if (v.actT > 0.5 && G.R() < 0.2) { G.Audio && G.Audio.at(x, y, 'hammer'); G.FX && G.FX.dust(x, y, 1); }
    const need = (t.lvl >= 3 ? 2.6 : t.lvl === 2 ? 2 : 1.3) / Math.max(0.5, v.work || 1);
    if (v.actT < need) return;
    const set = S.settlements.get(v.set); const fac = set && G.Fac.get(set.fac);
    if (!fac) { Ci.claims.delete(t.i); return H.end(v); }
    const bridge = S.type[t.i] === T.RIVER;
    const stone = t.lvl === 1 ? 0 : bridge ? 3 : 1, wood = bridge ? 2 : 0;
    if (fac.stock.stone < stone || fac.stock.wood < wood || S.occ[t.i]) { Ci.claims.delete(t.i); return H.end(v); }
    fac.stock.stone -= stone; fac.stock.wood -= wood;
    if (S.road[t.i] < t.lvl) S.road[t.i] = t.lvl;
    G.Nature.markDirty(t.i);
    G.FX && G.FX.chips(x, y, t.lvl >= 2 ? '#b8b0a0' : '#a08a66');
    Ci.claims.delete(t.i);
    if (t.route) { const r = S.routes.find(q => q.id === t.route); if (r) r.paved = r.tiles.reduce((n, i) => n + (S.road[i] >= 3 ? 1 : 0), 0); if (r && bridge && !r.bridged) { r.bridged = true; log(`Uma ponte de pedra agora cruza o rio na estrada de ${set.name}.`, 'road', x, y); } }
    t.n++;
    if (t.n < 7) {
      const nx = pickPave(set, fac, v, t.i);
      if (nx && G.dist(x, y, (nx.i % N) + 0.5, ((nx.i / N) | 0) + 0.5) < 3.5) { t.i = nx.i; t.lvl = nx.lvl; t.route = nx.route || 0; t.st = 0; return; }
    }
    H.end(v);
  }

  // ------------------------------ routes & carts ------------------------------
  function rasterize(pts) {
    const tiles = []; const seen = new Set();
    for (let k = 1; k < pts.length; k++) {
      const [x0, y0] = pts[k - 1], [x1, y1] = pts[k];
      const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 0.25));
      for (let s = 0; s <= n; s++) { const i = W.idx(x0 + (x1 - x0) * s / n, y0 + (y1 - y0) * s / n); if (!seen.has(i)) { seen.add(i); tiles.push(i); } }
    }
    return tiles;
  }
  function makeRoute(a, b, kind) {
    const S = G.S; const key = a.id + '>' + b.id;
    const nr = noRoute.get(key); if (nr !== undefined && S.day - nr < 12) return null;
    const p = W.findPath(a.cx, a.cy, b.cx, b.cy, true, N * N);
    if (!p || !p.length) { noRoute.set(key, S.day); return null; }
    const pts = [[a.cx, a.cy]].concat(p).map(q => [Math.round(q[0] * 100) / 100, Math.round(q[1] * 100) / 100]);
    const r = { id: S.nextId++, a: a.id, b: b.id, kind, pts, tiles: rasterize(pts), day: S.day, ok: true, cartT: G.rr(4, 14), paved: 0, trips: 0 };
    S.routes.push(r);
    return r;
  }
  const PEACE = { paz: 1, alianca: 1, vassalo: 1 };
  function updateRoutes() {
    const S = G.S;
    // validate
    for (const r of S.routes) {
      const a = S.settlements.get(r.a), b = S.settlements.get(r.b);
      if (!a || !b) { r.dead = true; continue; }
      if (r.kind === 'interno') { if (a.fac !== b.fac) r.dead = true; continue; }
      const rel = G.Fac.rel(a.fac, b.fac);
      r.ok = !!rel && !!PEACE[rel.st] && a.fac !== b.fac;
      if (a.fac === b.fac) r.dead = true;
    }
    if (S.routes.some(r => r.dead)) { S.routes = S.routes.filter(r => !r.dead); S.carts = S.carts.filter(c => S.routes.some(r => r.id === c.route)); }
    // new routes: at most one path search per round
    for (const f of G.Fac.all()) {
      if (!has(f, 'roda')) continue;
      const cap = G.Fac.capitalOf(f.id); if (!cap) continue;
      for (const s of G.Fac.settlementsOf(f.id)) {
        if (s === cap || G.dist(s.cx, s.cy, cap.cx, cap.cy) < 7) continue;
        if (S.routes.some(r => (r.a === cap.id && r.b === s.id) || (r.a === s.id && r.b === cap.id))) continue;
        if (makeRoute(cap, s, 'interno')) { log(`Carroças começaram a ligar ${cap.name} a ${s.name}.`, 'cart', s.cx, s.cy); return; }
      }
      let mine = S.routes.filter(r => r.kind === 'comercio' && (S.settlements.get(r.a) || {}).fac === f.id).length;
      const maxT = 1 + (G.Fac.has(f.id, 'mercado') ? 1 : 0) + (has(f, 'moeda') ? 1 : 0);
      if (mine >= maxT) continue;
      for (const o of G.Fac.all()) {
        if (o.id === f.id) continue;
        const rel = G.Fac.rel(f.id, o.id); if (!rel || !rel.met || !PEACE[rel.st] || rel.op < 0) continue;
        if (!(rel.trade >= 1 || rel.st === 'alianca' || rel.st === 'vassalo')) continue;
        const oc = G.Fac.capitalOf(o.id); if (!oc) continue;
        if (S.routes.some(r => r.kind === 'comercio' && ((r.a === cap.id && r.b === oc.id) || (r.a === oc.id && r.b === cap.id)))) continue;
        if (makeRoute(cap, oc, 'comercio')) { log(`Nasce uma rota comercial entre ${cap.name} (${f.name}) e ${oc.name} (${o.name}).`, 'trade', oc.cx, oc.cy); G.Lore && G.Lore.note('route', { a: f.id, b: o.id }); return; }
      }
    }
  }
  const RES = ['food', 'wood', 'stone'];
  const MAT = { food: 'comida', wood: 'madeira', stone: 'pedra' };
  function spawnCart(r, from, to) {
    const S = G.S; const fa = G.Fac.get(from.fac), fb = G.Fac.get(to.fac); if (!fa || !fb) return;
    const capA = G.Village.cap(fa.id), capB = G.Village.cap(fb.id);
    let goods = null;
    if (r.kind === 'comercio') {
      // send what we have plenty of and they lack
      const sur = k => fa.stock[k] / capA - fb.stock[k] / capB;
      const give = RES.slice().sort((x, y) => sur(y) - sur(x))[0];
      const n = Math.min(14, Math.floor(fa.stock[give] * 0.08));
      if (n < 3) return;
      fa.stock[give] -= n; goods = { k: give, n };
    } else {
      const k = G.pick(RES); goods = { k, n: 0 };
    }
    const fwd = from.id === r.a;
    const pts = r.pts; const start = fwd ? pts[0] : pts[pts.length - 1];
    S.carts.push({ id: S.nextId++, route: r.id, fwd, k: fwd ? 1 : pts.length - 2, x: start[0], y: start[1], fac: fa.id, home: from.id, dest: to.id, goods, back: false, face: 1, civ: fa.civ || null, t: 0 });
  }
  function arrive(c, r) {
    const S = G.S; const home = S.settlements.get(c.home), dest = S.settlements.get(c.dest);
    if (!home || !dest) return true;
    if (r.kind === 'interno') {
      if (!c.back) { dest.linkDay = S.day; dest.loyalty = Math.min(100, (dest.loyalty || 60) + 1.5); c.back = true; return false; }
      return true;
    }
    const fa = G.Fac.get(home.fac), fb = G.Fac.get(dest.fac); if (!fa || !fb) return true;
    const rel = G.Fac.rel(fa.id, fb.id);
    if (!c.back) {
      if (c.goods) G.Village.addStock(c.goods.k, c.goods.n, fb.id);
      const deal = 1.05 * G.Civ.t(fa.id, 'trade') * (has(fa, 'moeda') ? 1.15 : 1) * (G.Fac.has(fa.id, 'mercado') ? 1.2 : 1);
      const want = RES.filter(k => !c.goods || k !== c.goods.k).sort((x, y) => (fb.stock[y] - fa.stock[y]) - (fb.stock[x] - fa.stock[x]))[0];
      const m = Math.min(Math.round((c.goods ? c.goods.n : 5) * deal), Math.floor(fb.stock[want] * 0.12));
      if (m > 0) { fb.stock[want] -= m; c.ret = { k: want, n: m }; }
      if (rel) { rel.op = Math.min(100, rel.op + 1.5); rel.friend = Math.min(100, (rel.friend || 0) + 1); rel.trade = (rel.trade || 0) + 1; }
      r.trips++;
      if (r.trips === 1) log(`A primeira carroça de ${home.name} chegou a ${dest.name} com ${MAT[c.goods ? c.goods.k : 'food']}.`, 'cart', dest.cx, dest.cy);
      c.back = true; return false;
    }
    if (c.ret) G.Village.addStock(c.ret.k, c.ret.n, fa.id);
    return true;
  }
  function updateCarts(dt) {
    const S = G.S;
    for (const r of S.routes) {
      if (!r.ok) continue;
      r.cartT -= dt; if (r.cartT > 0) continue;
      r.cartT = G.rr(35, 60) / (r.kind === 'comercio' ? 1 : 1.3);
      const a = S.settlements.get(r.a), b = S.settlements.get(r.b); if (!a || !b) continue;
      let n = 0; for (const c of S.carts) if (c.route === r.id) n++;
      if (n >= (r.kind === 'comercio' ? 3 : 2)) continue;
      if (G.Fac.pop(a.fac) < 12) continue;
      // trade flows both ways; internal carts leave the capital
      const flip = r.kind === 'comercio' && (r.side = !r.side);
      spawnCart(r, flip ? b : a, flip ? a : b);
    }
    for (let k = S.carts.length - 1; k >= 0; k--) {
      const c = S.carts[k]; const r = S.routes.find(q => q.id === c.route);
      if (!r || !r.ok) { S.carts.splice(k, 1); continue; }
      c.t += dt;
      const pts = r.pts; const dir = (c.fwd !== c.back) ? 1 : -1;
      if (c.k < 0 || c.k >= pts.length) { if (arrive(c, r)) { S.carts.splice(k, 1); continue; } c.k = dir > 0 ? pts.length - 2 : 1; continue; }
      const p = pts[c.k];
      const i = W.idx(c.x, c.y);
      const sp = 1.25 * (S.road[i] >= 3 ? 1.6 : S.road[i] ? 1.35 : S.type[i] === T.RIVER ? 0.5 : 1) * dt;
      const dx = p[0] - c.x, dy = p[1] - c.y; const d = Math.hypot(dx, dy);
      if (d <= sp) { c.x = p[0]; c.y = p[1]; c.k += (c.fwd !== c.back) ? 1 : -1; }
      else { c.x += dx / d * sp; c.y += dy / d * sp; }
      if (Math.abs(dx - dy) > 0.02) G.faceTo(c, dx, dy);
      c.dx = dx / (d || 1); c.dy = dy / (d || 1);
      if (c.t > 400) S.carts.splice(k, 1);
    }
  }

  // ------------------------------ city life ------------------------------
  const LEIS = { praca: 3, mercado: 3, teatro: 2, banhos: 2, maravilha: 1, biblioteca: 1 };
  Ci.leisureTask = function (v, H) {
    const S = G.S; const set = S.settlements.get(v.set); if (!set || (set.tier || 0) < 2 || G.isNight()) return null;
    const opts = [];
    for (const b of S.buildings.values()) if (b.set === v.set && b.built && LEIS[b.type]) for (let k = 0; k < LEIS[b.type]; k++) opts.push(b);
    if (!opts.length) return null;
    const b = G.pick(opts);
    return H.setTask(v, { type: 'citylife', id: b.id, pri: 0.3, st: 0 });
  };
  function runCity(v, t, dt, H) {
    const S = G.S; const b = S.buildings.get(t.id);
    if (!b || !b.built) return H.end(v);
    if (t.st === 0) {
      let tx, ty;
      if (!b.blocks) { tx = b.x + G.rr(0.25, b.w - 0.25); ty = b.y + G.rr(0.25, b.h - 0.25); }
      else { const d = G.Vg.door(b); tx = d[0] + G.rr(-0.3, 0.3); ty = d[1] + G.rr(-0.3, 0.3); }
      if (!H.goto(v, tx, ty, false)) return H.end(v);
      t.st = 1; return;
    }
    if (t.st === 1) { if (H.move(v, dt, 0.85)) { t.st = 2; v.actT = 0; t.dur = G.rr(6, 13); if (b.type === 'teatro' || b.type === 'banhos' || b.type === 'biblioteca') v.inside = b.id; } else if (t.age > 40) H.end(v); return; }
    if (!v.inside) {
      v.act = b.type === 'praca' || b.type === 'mercado' ? 'talk' : '';
      if (G.R() < dt * 0.3) G.Vg.emote(v, b.type === 'mercado' ? G.pick(['food', 'chat', 'happy']) : G.pick(['chat', 'happy']), 1.4);
    }
    if (v.actT > t.dur) { if (b.type === 'teatro') v.devotion = Math.min(100, v.devotion + 0.5); if (b.type === 'banhos' && v.sick > 0) v.sick = Math.max(0, v.sick - 20); H.end(v); }
  }

  Ci.run = function (v, t, dt, H) {
    switch (t.type) {
      case 'pave': runPave(v, t, dt, H); return true;
      case 'citylife': runCity(v, t, dt, H); return true;
    }
    return false;
  };
  Ci.taskText = function (v, t) {
    const S = G.S;
    switch (t.type) {
      case 'pave': return t.lvl >= 3 ? (S.type[t.i] === T.RIVER ? 'Erguendo uma ponte' : 'Calçando a estrada') : t.lvl === 2 ? 'Calçando as ruas com pedra' : 'Abrindo uma rua';
      case 'citylife': {
        const b = S.buildings.get(t.id); if (!b) return 'Passeando pela cidade';
        const n = G.Village.buildName(b); const o = G.gen(n);
        return ({ praca: `Conversando n${o} ${n}`, mercado: `Fazendo compras n${o} ${n}`, teatro: `Assistindo a um espetáculo n${o} ${n}`, banhos: `Relaxando n${o} ${n}`, biblioteca: `Lendo n${o} ${n}`, maravilha: `Admirando ${o} ${n}` })[b.type] || 'Passeando pela cidade';
      }
    }
    return null;
  };

  // ------------------------------ update ------------------------------
  let tT = 4, tR = 5, tA = 0;
  Ci.update = function (dt) {
    tT += dt; tR += dt; tA += dt;
    if (tT >= 5) { tT = 0; updateTiers(); }
    if (tR >= 15) { tR = 0; updateRoutes(); }
    if (tA >= 1.2) { buildAqueducts(tA); tA = 0; }
    updateCarts(dt);
  };

  // ------------------------------ save ------------------------------
  const rle = a => { const o = []; let v = a[0], n = 0; for (let k = 0; k < a.length; k++) { if (a[k] === v) n++; else { o.push(v, n); v = a[k]; n = 1; } } o.push(v, n); return o; };
  const unrle = (o, into) => { let p = 0; for (let k = 0; k < o.length; k += 2) { into.fill(o[k], p, p + o[k + 1]); p += o[k + 1]; } };
  (G.saveHooks = G.saveHooks || []).push({
    save(out, r) {
      const S = G.S;
      out.road = rle(S.road); out.wall = rle(S.wall); out.wallFac = rle(S.wallFac);
      out.routes = S.routes; out.aqueducts = S.aqueducts;
      out.carts = S.carts.map(c => Object.assign({}, c, { x: r(c.x, 2), y: r(c.y, 2) }));
    },
    load(o) {
      const S = G.S;
      if (o.road) unrle(o.road, S.road);
      if (o.wall) unrle(o.wall, S.wall);
      if (o.wallFac) unrle(o.wallFac, S.wallFac);
      S.routes = o.routes || []; S.aqueducts = o.aqueducts || []; S.carts = o.carts || [];
      Ci.reset();
    },
  });
})(window.G);
