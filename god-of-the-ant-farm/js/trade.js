'use strict';
// ============================================================
//  Trade in fine things, and what it does to the world.
//  A realm with ivory, silk, coffee or pearls to spare sends a
//  merchant with a pack horse (an Aztec trader carries it on his
//  back) to a people who has none; coin or goods come back. The
//  same road walked again and again gets a name — the Ivory Road,
//  the Silk Road — and the merchants who walk it grow rich: their
//  houses fly a banner, and a merchant elite can one day unseat a
//  tyrant and rule as a council. A people that is the only one
//  selling something holds a monopoly; one that buys it and
//  cannot make it may covet the coffee fields of its neighbour
//  and go to war for them. Caravans crossing hostile land are
//  robbed, and a robbed road can start a war of its own.
// ============================================================
(function (G) {
  const Tr = G.Trade = {};
  const E = G.Eco, P = G.Politics, R = G.Riches;
  const TAU = Math.PI * 2;
  const DAY = () => G.DAY_LEN;
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);

  // what can be sold abroad: the riches, and the crafts
  const TRADE = R.KEYS.concat(['joias', 'tecido', 'ceramica']);
  const ROUTE_NAME = { marfim: 'Rota do Marfim', seda: 'Rota da Seda', especiarias: 'Rota das Especiarias', incenso: 'Rota do Incenso', cafe: 'Rota do Café', cacau: 'Rota do Cacau', sal: 'Rota do Sal', perolas: 'Rota das Pérolas', peles: 'Rota das Peles', pele_rara: 'Rota das Peles', vinho: 'Rota do Vinho', azeite: 'Rota do Azeite', bacalhau: 'Rota do Bacalhau', mel: 'Rota do Mel', joias: 'Rota do Ouro', tecido: 'Rota dos Tecidos', coral: 'Rota do Coral', plumas: 'Rota das Plumas', tamaras: 'Rota das Tâmaras', ceramica: 'Rota das Ânforas', couro_exotico: 'Rota dos Couros', chifre: 'Rota do Chifre' };
  const routeName = k => ROUTE_NAME[k] || ('Rota ' + (R.GOODS[k] && R.GOODS[k].g === 'f' ? 'da' : 'do') + (R.GOODS[k] && R.GOODS[k].pl ? 's' : '') + ' ' + G.cap(E.name(k)));
  const rkey = (a, b, k) => a + '>' + b + ':' + k;
  const routes = () => G.S.luxRoutes || (G.S.luxRoutes = {});
  Tr.routes = routes;

  // ------------------------------ choosing a caravan ------------------------------
  const surplus = (f, k) => Math.floor((f.stock[k] || 0) - (R.GOODS[k] && R.GOODS[k].tier === 'raro' ? 0 : 2));
  function partnerOK(a, b) {
    const r = G.Fac.rel(a.id, b.id); if (!r || !r.met || !b.alive) return null;
    if (!(r.st === 'paz' || r.st === 'alianca' || r.st === 'vassalo' || r.st === 'tregua') || r.op < -15) return null;
    return r;
  }
  function bestDeal(a) {
    let best = null;
    for (const b of G.Fac.all()) {
      if (b.id === a.id) continue; const r = partnerOK(a, b); if (!r || (r.luxDay || 0) > G.S.day) continue;
      const ca = G.Fac.capitalOf(a.id), cb = G.Fac.capitalOf(b.id); if (!ca || !cb) continue;
      const land = G.W.sameLand(ca.cx, ca.cy, cb.cx, cb.cy);
      if (!land) continue; // (overseas, the merchant ships carry it)
      for (const k of TRADE) {
        const n = surplus(a, k); if (n < 2) continue;
        if ((b.stock[k] || 0) >= 4) continue; // they have their own
        const made = b.eco && b.eco.last && b.eco.last.made && b.eco.last.made[k] || 0; if (made > 2) continue;
        const v = (E.PRICE[k] || 1) * Math.min(n, 8) * (1 + (r.trade || 0) * 0.02) * (R.LUX.includes(k) ? 1.3 : 1) - G.dist(ca.cx, ca.cy, cb.cx, cb.cy) * 0.05;
        if (!best || v > best.v) best = { b, k, n: Math.min(n, 8), v, r };
      }
    }
    return best && best.v > 3 ? best : null;
  }
  Tr.launch = a => launch(a);
  function launch(a) {
    const S = G.S; const d = bestDeal(a); if (!d) return;
    const cap = G.Fac.capitalOf(a.id); if (!cap) return;
    // the merchant: someone of the market if there is one, otherwise a willing adult
    let m = null;
    for (const v of S.villagers.values()) {
      if (v.set !== cap.id || v.captive || v.age < 18 || v.age > 58 || v.id === a.leader || v.role === 'guerreiro' || v.carry || (v.task && v.task.pri >= 2)) continue;
      if (v.role === 'mercador' || v.merchant) { m = v; break; }
      if (!m && (v.role === 'coletor' || v.role === 'lenhador' || v.role === 'feirante')) m = v;
    }
    if (!m) return;
    a.stock[d.k] -= d.n; d.r.luxDay = S.day + 0.6 + G.R() * 0.6;
    G.Vg.endTask(m); m.merchant = (m.merchant || 0) + 1;
    m.carry = { k: d.k, n: d.n, from: d.k === 'peles' ? G.pick(['wolf', 'bear', 'fox']) : undefined };
    const t = G.Vg.setTask(m, { type: 'trade', to: d.b.id, from: a.id, give: d.k, n: d.n, want: 'moedas', lux: 1, pri: 1.8, kind: 'trade' });
    // a pack horse with saddlebags (the Aztec trader carries the load himself)
    if (a.civ !== 'asteca' && G.Animals.DEF.cavalo) {
      const drop = G.Village.nearestDropoff(m.x, m.y, m.set);
      const h = G.Animals.spawn('cavalo', m.x - 0.4, m.y + 0.2, { dom: a.id, grown: 1, age: 4, hunger: 0.1, state: 'led', pen: drop ? drop.id : 0 });
      if (h) { h.ledBy = m.id; h.pack = d.k; if (t) t.pack = h.id; }
    }
    if (!a._caravan) { a._caravan = S.day; log(`${m.name} partiu de ${cap.name} com ${d.n} de ${E.name(d.k)} para vender em ${d.b.name}. É a primeira caravana de ${a.name}.`, 'trade', m.x, m.y); }
  }

  // ------------------------------ the merchant arrives ------------------------------
  const oldArrive = P.tradeArrive;
  P.tradeArrive = function (v, t) {
    if (!t.lux) return oldArrive(v, t);
    const S = G.S; const a = G.Fac.get(t.from), b = G.Fac.get(t.to); if (!a || !b || !b.alive) return false;
    const r = G.Fac.rel(a.id, b.id); if (!r || r.st === 'guerra') return false;
    const k = t.give, n = v.carry && v.carry.k === k ? v.carry.n : t.n;
    if (v.carry) { G.Village.addStock(v.carry.k, v.carry.n, b.id); v.carry = null; }
    // the price: dearer for a monopoly, better for a people of traders
    const mono = Tr.monopolyOf(k) === a.id ? 1.5 : 1;
    const value = (E.PRICE[k] || 1) * n * 1.15 * G.Civ.t(a.id, 'trade') * mono;
    let back = null;
    if (E.coinage(b.id) && b.stock.moedas >= value * 0.6) { const c = Math.round(Math.min(value, b.stock.moedas * 0.5)); b.stock.moedas -= c; back = { k: 'moedas', n: c }; }
    else {
      // barter: something of theirs worth as much (their own fine things first)
      const opts = TRADE.filter(q => q !== k && surplus(b, q) >= 1 && (a.stock[q] || 0) < 4).sort((x, y) => (E.PRICE[y] || 0) - (E.PRICE[x] || 0));
      const q = opts[0];
      if (q) { const m = Math.max(1, Math.min(surplus(b, q), Math.round(value / (E.PRICE[q] || 1)))); b.stock[q] -= m; back = { k: q, n: m }; }
      else { const g = ['food', 'wood', 'stone'].sort((x, y) => b.stock[y] - b.stock[x])[0]; const m = Math.min(Math.floor(b.stock[g] * 0.3), Math.round(value / (E.PRICE[g] || 0.3))); if (m > 0) { b.stock[g] -= m; back = { k: g, n: m }; } }
    }
    if (back) v.carry = back;
    r.op = Math.min(100, r.op + 4); r.friend = Math.min(100, (r.friend || 0) + 3); r.trade = (r.trade || 0) + 1;
    a.exports = (a.exports || 0) + value; b.imports = (b.imports || 0) + value;
    const im = b.dep || (b.dep = {}); im[k] = { from: a.id, n: ((im[k] && im[k].from === a.id ? im[k].n : 0) + n), day: S.day };
    // the merchant's house takes its share
    const h = E.homeOf(v); const cut = Math.round(value * 0.18 * 10) / 10;
    if (h) { h.coin = (h.coin || 0) + cut; h.trade = (h.trade || 0) + value; h.tradeGood = k; checkElite(h, v, a, k); } else v.purse = (v.purse || 0) + cut;
    // the road gets a name when it is walked again and again
    const rt = routes(); const key = rkey(a.id, b.id, k); const ro = rt[key] || (rt[key] = { a: a.id, b: b.id, k, n: 0, since: S.day, val: 0 });
    ro.n++; ro.val += value; ro.last = S.day;
    const cb = G.Fac.capitalOf(b.id);
    if (ro.n === 3 && !ro.name) {
      ro.name = routeName(k);
      log(`Os mercadores de ${a.name} já fizeram três vezes o caminho até ${b.name} com ${E.name(k)}: nasceu a ${ro.name}.`, 'trade', cb ? cb.cx : v.x, cb ? cb.cy : v.y);
      G.Stories && G.Stories.signal('route', { a: a.id, b: b.id, k, name: ro.name, who: v.id });
    } else if (ro.n === 1 && (r.luxN = (r.luxN || 0) + 1) <= 2) {
      const who = v.ship ? `Um navio de ${a.name}` : `${v.name}, mercador${v.g === 'f' ? 'a' : ''} de ${a.name},`;
      log(`${who} vendeu ${n} de ${E.name(k)} em ${b.name}${back ? ' e volta com ' + back.n + ' de ' + E.name(back.k) : ''}.`, 'trade', v.x, v.y);
    }
    if (v.id && !v.ship) G.Stories && G.Stories.signal('luxSale', { who: v.id, a: a.id, b: b.id, k, n, value: Math.round(value), back: back ? back.k : '' });
    checkMonopoly(a, k);
    return true;
  };
  // the pack horse goes home with its merchant; when the trip ends it goes back to the stable
  function packTick() {
    const S = G.S;
    for (const a of [...S.animals.values()]) {
      if (!a.pack) continue;
      const v = S.villagers.get(a.ledBy);
      if (!v || !v.task || v.task.type !== 'trade') { G.Animals.remove(a); continue; }
      if (v.carry && v.carry.k) a.pack = v.carry.k;
    }
  }

  // ------------------------------ merchant houses: an elite ------------------------------
  function checkElite(h, v, f, k) {
    const S = G.S;
    if (h.elite || h.trade < 45) return;
    h.elite = { k, since: S.day, fam: v.name };
    const set = S.settlements.get(h.set);
    log(`A família de ${v.name} enriqueceu vendendo ${E.name(k)} a outros povos: é a primeira casa de mercadores de ${set ? set.name : f.name}. Bandeira na porta, criados, seda na janela.`, 'trade', h.x, h.y);
    G.Stories && G.Stories.signal('elite', { who: v.id, fac: f.id, k, house: h.id });
  }
  Tr.eliteOf = function (fid) { const out = []; for (const h of G.S.buildings.values()) if (h.elite && G.Village.facOfSet(h.set) === fid) out.push(h); return out; };
  // a strong merchant elite under a cruel or greedy ruler: the council of merchants takes over
  function eliteTick(f) {
    const S = G.S; if (f.gov === 'conselho' || f.gov === 'livre' || f.gov === 'tribo') return;
    const el = Tr.eliteOf(f.id); if (el.length < 2) return;
    const ruler = P.ruler(f); if (!ruler) return;
    const pe = P.persona(ruler); const vain = G.Court ? G.Court.vanity(ruler) : 0.4;
    const tax = E.taxRate(f); const wealth = el.reduce((s, h) => s + (h.coin || 0), 0);
    const anger = (pe.cru > 0.6 ? 0.3 : 0) + (vain > 0.75 ? 0.25 : 0) + (tax > 0.2 ? 0.3 : 0) + (f.legit < 40 ? 0.2 : 0) + Math.min(0.4, wealth / 200);
    if (anger < 0.8 || G.R() > 0.15) return;
    // the head of the richest house
    const rich = el.sort((a, b) => (b.coin || 0) - (a.coin || 0))[0];
    const head = [...S.villagers.values()].filter(v => v.home === rich.id && v.age >= 25 && !v.captive && v.id !== ruler.id && v.partner !== ruler.id && v.mother !== ruler.id && v.father !== ruler.id && ruler.mother !== v.id && ruler.father !== v.id).sort((a, b) => b.age - a.age)[0];
    if (!head) return;
    const cap = G.Fac.capitalOf(f.id);
    log(`As casas de mercadores de ${f.name}, cansadas dos impostos e dos caprichos de ${P.styled ? P.styled(f, ruler) : ruler.name}, compraram a guarda. ${ruler.name} foi deposto sem uma gota de sangue: agora um conselho de mercadores governa, com ${head.name} à frente.`, 'crown', cap ? cap.cx : undefined, cap ? cap.cy : undefined);
    P.endReign(f, 'revolucao'); P.crown(f, head, 'revolucao', true);
    G.Stories && G.Stories.signal('merchantRevolt', { fac: f.id, who: head.id, from: ruler.id });
  }

  // ------------------------------ monopolies ------------------------------
  Tr.monopolyOf = function (k) {
    const S = G.S; let who = 0, n = 0;
    for (const ro of Object.values(routes())) if (ro.k === k && S.day - (ro.last || 0) < 8) { if (!who) who = ro.a; if (ro.a !== who) return 0; n += ro.n; }
    return n >= 4 ? who : 0;
  };
  function checkMonopoly(a, k) {
    const m = a.mono || (a.mono = {}); if (m[k] || Tr.monopolyOf(k) !== a.id) return;
    m[k] = G.S.day; const cap = G.Fac.capitalOf(a.id);
    log(`Só ${a.name} vende ${E.name(k)} no mundo conhecido: é dela o monopólio, e o preço sobe.`, 'trade', cap ? cap.cx : undefined, cap ? cap.cy : undefined);
    G.Stories && G.Stories.signal('monopoly', { fac: a.id, k });
  }

  // ------------------------------ coveting the source ------------------------------
  // what a people that buys something and cannot make it thinks of the people that sells it
  const PLACE = { cafe: 'os cafezais', cacau: 'os cacauais', especiarias: 'os pimentais', vinho: 'os vinhedos', azeite: 'os olivais', incenso: 'os bosques de olíbano', tamaras: 'os palmeirais', seda: 'a seda', marfim: 'o marfim', perolas: 'os recifes de pérolas', sal: 'as salinas', bacalhau: 'os pesqueiros', mel: 'os apiários', peles: 'as peles', coral: 'os recifes de coral' };
  Tr.covet = function (a, b) {
    const dep = a.dep || {}; let best = null;
    const pa = P.leaderPe(a); const vain = G.Court ? G.Court.vanity(P.ruler(a)) : 0.4;
    for (const k in dep) {
      const d = dep[k]; if (d.from !== b.id || G.S.day - d.day > 6) continue;
      const made = a.eco && a.eco.last && a.eco.last.made && a.eco.last.made[k] || 0; if (made > 1) continue;
      const w = Math.min(0.35, (E.PRICE[k] || 1) * d.n / 120) * (0.4 + pa.amb * 0.6 + vain * 0.4) * (Tr.monopolyOf(k) === b.id ? 1.6 : 1);
      if (!best || w > best.w) best = { w, k };
    }
    if (!best) return null;
    best.why = `para tomar ${PLACE[best.k] || E.name(best.k)} de ${b.name}`; Tr._whyK = best.k;
    return best;
  };

  // ------------------------------ robbed on the road ------------------------------
  function roadTick() {
    const S = G.S;
    for (const v of S.villagers.values()) {
      const t = v.task; if (!t || t.type !== 'trade' || !t.lux || t.st !== 0 || !v.carry || !R.is(v.carry.k) && v.carry.k !== 'joias') continue;
      const own = G.Fac.ownerAt(v.x | 0, v.y | 0); if (!own || own === t.from || own === t.to) continue;
      const o = G.Fac.get(own); const r = G.Fac.rel(own, t.from); if (!o || !r) continue;
      const pe = P.leaderPe(o); const hostile = r.st === 'guerra' || (r.op < -10 && pe.agg > 0.5) || (pe.cru > 0.7 && pe.agg > 0.6);
      if (!hostile || G.R() > 0.06) continue;
      const a = G.Fac.get(t.from); const k = v.carry.k, n = v.carry.n;
      G.Village.addStock(k, n, own); v.carry = null; G.Vg.emote(v, 'fear', 3);
      r.grudge = Math.min(100, (r.grudge || 0) + 25); r.op = Math.max(-100, r.op - 15);
      const ro = routes()[rkey(t.from, t.to, k)]; if (ro) ro.robbed = (ro.robbed || 0) + 1;
      log(`Guerreiros de ${o.name} cercaram a caravana de ${a ? a.name : 'mercadores'} e levaram ${n} de ${E.name(k)}. ${v.name} escapou de mãos vazias.`, 'war', v.x, v.y);
      G.Stories && G.Stories.signal('robbery', { who: v.id, by: own, fac: t.from, k });
      // a road robbed twice is a cause for war
      if (a && ro && ro.robbed >= 2 && r.st !== 'guerra' && P.leaderPe(a).agg > 0.35) { Tr._why = `para proteger a ${ro.name || routeName(k)}`; Tr._whyK = k; P.declareWar(a, o, 'rota'); }
      G.Vg.endTask(v);
    }
  }

  // ------------------------------ by sea ------------------------------
  Tr.loadShip = function (f, s, route) {
    const S = G.S; const ob = S.buildings.get(route.a === s.dock ? route.b : route.a); if (!ob) return;
    const fb = G.Fac.get(G.Village.facOfSet(ob.set)); if (!fb || fb.id === f.id || !partnerOK(f, fb)) return;
    const k = TRADE.filter(q => surplus(f, q) >= 2 && (fb.stock[q] || 0) < 4).sort((x, y) => (E.PRICE[y] || 0) - (E.PRICE[x] || 0))[0]; if (!k) return;
    const n = Math.min(surplus(f, k), 10); f.stock[k] -= n; s.lux = { k, n };
  };
  Tr.shipArrive = function (s, fa, fb) {
    if (!s.lux || fa === fb) return;
    const fake = { name: 'Um navio', g: 'm', x: s.x, y: s.y, carry: { k: s.lux.k, n: s.lux.n }, id: 0, ship: 1 };
    P.tradeArrive(fake, { lux: 1, from: fa.id, to: fb.id, give: s.lux.k, n: s.lux.n });
    if (fake.carry) s.ret2 = fake.carry; s.lux = null;
  };
  Tr.shipHome = function (s) { if (s.ret2) { G.Village.addStock(s.ret2.k, s.ret2.n, s.fac); s.ret2 = null; } };

  // ------------------------------ update ------------------------------
  let tL = 0, tR = 0, tE = 0;
  Tr.update = function (dt) {
    const S = G.S; if (!S) return;
    tL += dt; tR += dt; tE += dt;
    if (tR >= 2) { tR = 0; roadTick(); packTick(); }
    if (tL >= 8) { tL = 0; for (const f of G.Fac.all()) { if (G.Fac.pop(f.id) < 12 || G.isNight()) continue; if (G.R() < 0.35) launch(f); } }
    if (tE >= 30) { tE = 0; for (const f of G.Fac.all()) { eliteTick(f); f.exports = (f.exports || 0) * 0.85; f.imports = (f.imports || 0) * 0.85; } }
  };
  // the realm panel: what goes out, what comes in, the roads with names
  const oldRealm = E.realmHTML;
  E.realmHTML = function (f, esc) {
    let h = oldRealm(f, esc);
    const S = G.S; const out = [], inn = [];
    for (const ro of Object.values(routes())) { if (S.day - (ro.last || 0) > 10) continue; const o = G.Fac.get(ro.a === f.id ? ro.b : ro.a); if (!o) continue; const txt = `${esc(E.name(ro.k))} ${ro.a === f.id ? '→' : '←'} ${esc(o.name)}${ro.name ? ` <em>(${esc(ro.name)})</em>` : ''}`; if (ro.a === f.id) out.push(txt); else if (ro.b === f.id) inn.push(txt); }
    const el = Tr.eliteOf(f.id); const mono = Object.keys(f.mono || {}).filter(k => Tr.monopolyOf(k) === f.id);
    const lives = Object.keys(f.livesBy || {});
    if (out.length || inn.length || el.length || mono.length || lives.length) {
      h += `<div class="rm-day">${out.length ? 'Exporta: ' + out.join(' · ') : ''}${inn.length ? `${out.length ? '<br>' : ''}Importa: ${inn.join(' · ')}` : ''}${mono.length ? `<br>Monopólio: <b>${mono.map(k => esc(E.name(k))).join(', ')}</b>` : ''}${el.length ? `<br>Casas de mercadores: ${el.length} (${el.map(x => esc(E.name(x.elite.k))).join(', ')})` : ''}${lives.length ? `<br>Vive ${lives.map(k => 'do ' + esc(E.name(k))).join(' e ')}` : ''}</div>`;
    }
    return h;
  };
  // the trade task's words for fine goods
  Tr.taskText = function (v, t) { if (t.type !== 'trade' || !t.lux) return null; const f = G.Fac.get(t.st ? t.from : t.to); return t.st ? `Voltando da caravana${v.carry ? ' com ' + v.carry.n + ' de ' + E.name(v.carry.k) : ''}` : `Levando ${t.n} de ${E.name(t.give)} para vender em ${f ? f.name : 'outro povo'}`; };

  (G.saveHooks = G.saveHooks || []).push({ save(out) { out.luxRoutes = G.S.luxRoutes || {}; }, load(o) { G.S.luxRoutes = o.luxRoutes || {}; } });

  // ------------------------------ drawing: saddlebags and the merchant's banner ------------------------------
  Tr.drawPack = function (c, a) {
    const col = (E.GOODS[a.pack] && E.GOODS[a.pack].col) || '#8a6a44';
    c.fillStyle = '#7a5a34'; c.fillRect(-1.6, -6.6, 3.2, 0.8);
    for (const s of [-1, 1]) { c.fillStyle = '#8a6a44'; c.fillRect(-1.2 + s * 0.2, -6.2, 2.4, 2.4); c.fillStyle = col; c.fillRect(-0.9 + s * 0.2, -6.6, 1.8, 0.9); }
  };
  G.renderHooks = G.renderHooks || { ground: [], ents: [] };
  const banEnt = new WeakMap();
  G.renderHooks.ents.push(function (add, view, zoom) {
    const S = G.S; if (!S || zoom < 0.9) return;
    for (const h of S.buildings.values()) { if (!h.elite || !h.built) continue; let e = banEnt.get(h); if (!e) banEnt.set(h, e = { h, fn: drawBanner }); add(h.x + h.y + h.w + 0.05, e, h.x + h.w - 0.1, h.y + h.h - 0.1); }
  });
  function drawBanner(c, e, sx, sy, t) {
    const col = (E.GOODS[e.h.elite.k] && E.GOODS[e.h.elite.k].col) || '#c83a2a';
    c.strokeStyle = '#5a3c22'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx, sy - 20); c.stroke();
    const w = Math.sin(t * 3 + e.h.id) * 0.8;
    c.fillStyle = col; c.beginPath(); c.moveTo(sx, sy - 20); c.lineTo(sx + 6, sy - 19 + w); c.lineTo(sx + 6, sy - 14 + w); c.lineTo(sx, sy - 15); c.closePath(); c.fill();
    c.fillStyle = '#f2c14e'; c.beginPath(); c.arc(sx + 3, sy - 17 + w * 0.5, 0.9, 0, TAU); c.fill();
  }
})(window.G);
