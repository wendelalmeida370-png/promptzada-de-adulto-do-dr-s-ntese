'use strict';
// ============================================================
//  Polity: how a people is ruled, and who holds the wealth.
//  The regimes a people can come to — the chief and the king, the
//  king who must hear his council, the lords and their serfs, the
//  republic of consuls, the assembly of all citizens, the merchants
//  who rule by their money, the general who took power, the commune
//  where all is shared, the land with no ruler at all — and its
//  economic order (free trade, all belongs to the crown, the land
//  belongs to the lords, all belongs to all, the temple keeps the
//  granaries). Inside every people, the estates of the realm: the
//  landowners, the merchants, the priests, the soldiers, the
//  craftsmen and the common people, each with real members, a
//  leader, its wealth, its say, what it wants and how angry it is.
//  The ruler decides (raise the taxes, seize the merchants' houses,
//  grant lands, open the council, hand out bread); the groups answer
//  — a petition at the palace door, a plot, a coup, a revolution —
//  and a people can end up ruled in a new way.
// ============================================================
(function (G) {
  const Po = G.Polity = {};
  const P = G.Politics, E = G.Eco;
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);
  const DAY = () => G.DAY_LEN;
  const oa = v => (v && v.g === 'f' ? 'a' : 'o');
  const cap1 = t => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);
  // 'Rainha Eir, a Grande,' — the closing comma before the verb
  const styledV = (f, v) => { const t = P.styled(f, v); return t.includes(',') ? t + ',' : t; };
  const pl = k => (k === 'povo' ? ['foi', 'voltou'] : ['foram', 'voltaram']);

  // ------------------------------ the regimes, by people ------------------------------
  const CIVGOV = {
    grego: { parlamento: ['Reino com Boulé', 'Basileu', 'Basilissa'], feudal: ['Senhorio dos Eupátridas', 'Basileu', 'Basilissa'], republica: ['Politeia', 'Arconte Epônimo', 'Arconte Epônima'], democracia: ['Democracia da Assembleia', 'Estratego', 'Estratega'], oligarquia: ['Oligarquia', 'Oligarca', 'Oligarca'], ditadura: ['Tirania dos Estrategos', 'Estratego Autocrata', 'Estratega Autocrata'], comuna: ['Koinonia', 'Guardião do Celeiro', 'Guardiã do Celeiro'], anarquia: ['Anarquia', 'Voz da Ágora', 'Voz da Ágora'] },
    nordico: { parlamento: ['Reino com Thing', 'Rei', 'Rainha'], feudal: ['Reino dos Jarls', 'Rei', 'Rainha'], republica: ['Althing', 'Falador da Lei', 'Faladora da Lei'], democracia: ['Thing de Todos', 'Falador da Lei', 'Faladora da Lei'], oligarquia: ['Liga dos Mercadores', 'Mestre da Liga', 'Mestra da Liga'], ditadura: ['Senhorio da Guerra', 'Senhor da Guerra', 'Senhora da Guerra'], comuna: ['Comuna dos Bóndi', 'Guardião do Celeiro', 'Guardiã do Celeiro'], anarquia: ['Terra sem Rei', 'Voz do Thing', 'Voz do Thing'] },
    egipcio: { parlamento: ['Reino com Conselho', 'Faraó', 'Faraó'], feudal: ['Reino dos Nomarcas', 'Faraó', 'Faraó'], republica: ['Conselho dos Sábios', 'Vizir', 'Vizira'], democracia: ['Assembleia do Povo', 'Porta-voz do Povo', 'Porta-voz do Povo'], oligarquia: ['Conselho dos Mercadores', 'Grão-Mercador', 'Grã-Mercadora'], ditadura: ['Governo do General', 'General', 'Generala'], comuna: ['Celeiro Comum', 'Guardião do Celeiro', 'Guardiã do Celeiro'], anarquia: ['Terra sem Faraó', 'Voz do Povo', 'Voz do Povo'] },
    asteca: { parlamento: ['Senhorio com Conselho', 'Tlatoani', 'Cihuatlatoani'], feudal: ['Senhorio dos Pipiltin', 'Tlatoani', 'Cihuatlatoani'], republica: ['Conselho dos Calpulli', 'Cihuacoatl', 'Cihuacoatl'], democracia: ['Assembleia dos Calpulli', 'Porta-voz', 'Porta-voz'], oligarquia: ['Conselho dos Pochteca', 'Pochtecatl-Mor', 'Pochtecatl-Mor'], ditadura: ['Governo dos Cavaleiros-Águia', 'Tlacochcalcatl', 'Tlacochcalcatl'], comuna: ['Calpulli Comum', 'Guardião do Celeiro', 'Guardiã do Celeiro'], anarquia: ['Terra sem Tlatoani', 'Voz do Povo', 'Voz do Povo'] },
    romano: { parlamento: ['Monarquia com Senado', 'Rei', 'Rainha'], feudal: ['Senhorio dos Patrícios', 'Rei', 'Rainha'], republica: ['República', 'Cônsul', 'Cônsul'], democracia: ['República da Plebe', 'Tribuno da Plebe', 'Tribuna da Plebe'], oligarquia: ['República dos Équites', 'Primeiro dos Équites', 'Primeira dos Équites'], ditadura: ['Governo das Legiões', 'Imperator', 'Imperatrix'], comuna: ['Comuna da Plebe', 'Guardião do Celeiro', 'Guardiã do Celeiro'], anarquia: ['Terra sem Senado', 'Voz do Fórum', 'Voz do Fórum'] },
  };
  for (const c in CIVGOV) if (G.CIVS[c]) Object.assign(G.CIVS[c].gov, CIVGOV[c]);
  // (a regime needs the people to be ready for it: laws need writing, lords need lands to rule)
  function available(f, gov) {
    const era = f.era || 0, sets = G.Fac.settlementsOf(f.id).length, writ = G.Civ.has(f.id, 'escrita');
    switch (gov) {
      case 'republica': case 'democracia': case 'oligarquia': case 'parlamento': return era >= 3 || writ;
      case 'comuna': case 'anarquia': return era >= 2;
      case 'feudal': return era >= 2 && sets >= 2;
      case 'teocracia': return G.Fac.has(f.id, 'temple');
      case 'ditadura': return era >= 2;
      default: return true;
    }
  }
  Po.available = available;

  // ------------------------------ the economic order ------------------------------
  const ECON = {
    livre: { name: 'Livre comércio', desc: 'Mercadores e donos de terra enriquecem; o governo vive dos impostos.' },
    estatal: { name: 'Tudo é do governante', desc: 'As terras, as minas e o comércio são do governante; ninguém enriquece sem ele.' },
    feudal: { name: 'Terras dos senhores', desc: 'A terra é dos nobres; os camponeses trabalham e pagam a eles com a colheita.' },
    comunal: { name: 'Tudo é de todos', desc: 'Terras e celeiros comuns: o que sobra é repartido por igual.' },
    templo: { name: 'Economia do templo', desc: 'Os celeiros são do templo: os sacerdotes guardam e repartem.' },
  };
  Po.ECON = ECON;
  const CIV_ECON = { grego: 'livre', romano: 'livre', egipcio: 'templo', nordico: 'feudal', asteca: 'comunal' };
  Po.econOf = f => f.econ || (f.econ = CIV_ECON[f.civ] || 'livre');

  // ------------------------------ the estates of the realm ------------------------------
  const GR = {
    nobreza: { name: 'Nobreza', pl: 'os nobres', one: ['nobre', 'nobre'], col: '#c8a24a' },
    mercadores: { name: 'Mercadores', pl: 'os mercadores', one: ['mercador', 'mercadora'], col: '#d08a3a' },
    sacerdotes: { name: 'Sacerdotes', pl: 'os sacerdotes', one: ['sacerdote', 'sacerdotisa'], col: '#9a7ad8' },
    militares: { name: 'Militares', pl: 'os soldados', one: ['soldado', 'soldada'], col: '#c0504a' },
    artesaos: { name: 'Artesãos', pl: 'os artesãos', one: ['artesão', 'artesã'], col: '#7aa0b8' },
    povo: { name: 'Povo', pl: 'o povo', one: ['camponês', 'camponesa'], col: '#8ab86a' },
  };
  Po.GR = GR; const GK = Object.keys(GR);
  const MERCH = { mercador: 1, feirante: 1, ourives: 1, taverneiro: 1, contrabandista: 1 };
  const CRAFT = { oleiro: 1, ferreiro: 1, tecelao: 1, acougueiro: 1, construtor: 1, escriba: 1, cavalarico: 1, salgador: 1, sericultor: 1, cobrador: 1 };
  const LAND = { farm: 1, pomar: 1, plantacao: 1, vinhedo: 1, apiario: 1, salina: 1, mina: 1 };
  // what each regime and each economic order means to each group (-30 hated .. +30 their own)
  const AFF = {
    tribo: { nobreza: 0, mercadores: -4, sacerdotes: 0, militares: 0, artesaos: 0, povo: 5 },
    chefia: { nobreza: 8, mercadores: 0, sacerdotes: 3, militares: 5, artesaos: 0, povo: 0 },
    reino: { nobreza: 15, mercadores: 0, sacerdotes: 8, militares: 8, artesaos: -2, povo: -2 },
    imperio: { nobreza: 15, mercadores: 5, sacerdotes: 8, militares: 15, artesaos: 0, povo: -5 },
    parlamento: { nobreza: 15, mercadores: 18, sacerdotes: 5, militares: 3, artesaos: 5, povo: 0 },
    feudal: { nobreza: 28, mercadores: -8, sacerdotes: 6, militares: 10, artesaos: -6, povo: -18 },
    teocracia: { nobreza: -5, mercadores: -8, sacerdotes: 30, militares: -5, artesaos: -3, povo: 0 },
    tirania: { nobreza: -10, mercadores: -15, sacerdotes: -8, militares: 8, artesaos: -15, povo: -22 },
    ditadura: { nobreza: -8, mercadores: -10, sacerdotes: -5, militares: 28, artesaos: -10, povo: -15 },
    conselho: { nobreza: 0, mercadores: 8, sacerdotes: 0, militares: -3, artesaos: 8, povo: 10 },
    oligarquia: { nobreza: 5, mercadores: 30, sacerdotes: -3, militares: -3, artesaos: -5, povo: -12 },
    republica: { nobreza: 8, mercadores: 18, sacerdotes: 0, militares: 5, artesaos: 10, povo: 8 },
    democracia: { nobreza: -12, mercadores: 8, sacerdotes: -5, militares: -5, artesaos: 18, povo: 22 },
    comuna: { nobreza: -30, mercadores: -28, sacerdotes: -10, militares: -5, artesaos: 15, povo: 25 },
    livre: { nobreza: -10, mercadores: 0, sacerdotes: 0, militares: -5, artesaos: 10, povo: 18 },
    anarquia: { nobreza: -30, mercadores: -15, sacerdotes: -15, militares: -20, artesaos: 10, povo: 20 },
  };
  const EAFF = {
    livre: { nobreza: 8, mercadores: 20, sacerdotes: 0, militares: 0, artesaos: 5, povo: -4 },
    estatal: { nobreza: -18, mercadores: -28, sacerdotes: -5, militares: 5, artesaos: -6, povo: 2 },
    feudal: { nobreza: 22, mercadores: -10, sacerdotes: 5, militares: 3, artesaos: -5, povo: -14 },
    comunal: { nobreza: -25, mercadores: -25, sacerdotes: -5, militares: 0, artesaos: 8, povo: 16 },
    templo: { nobreza: 0, mercadores: -6, sacerdotes: 22, militares: 0, artesaos: 0, povo: 4 },
  };
  // the weight of each group under each regime (who has the say)
  const POW = {
    reino: { nobreza: 1.4 }, imperio: { nobreza: 1.3, militares: 1.4 }, chefia: { nobreza: 1.2, militares: 1.2 },
    parlamento: { nobreza: 1.3, mercadores: 1.5 }, feudal: { nobreza: 2 }, teocracia: { sacerdotes: 2.2 },
    tirania: { militares: 1.6 }, ditadura: { militares: 2.2 }, oligarquia: { mercadores: 2.2 },
    republica: { mercadores: 1.4, nobreza: 1.2 }, democracia: { povo: 1.5, artesaos: 1.4 }, conselho: { artesaos: 1.2, povo: 1.2 },
    comuna: { povo: 1.8, artesaos: 1.4 }, anarquia: { povo: 1.6 }, livre: { povo: 1.4 },
  };
  // what each group would put in place if it could
  const WISH = {
    nobreza: ['feudal', 'parlamento', 'reino'], mercadores: ['oligarquia', 'republica', 'parlamento'], sacerdotes: ['teocracia'],
    militares: ['ditadura', 'imperio'], artesaos: ['democracia', 'republica', 'comuna'], povo: ['democracia', 'comuna', 'anarquia'],
  };
  const EWISH = { nobreza: 'feudal', mercadores: 'livre', sacerdotes: 'templo', militares: 'estatal', artesaos: 'livre', povo: 'comunal' };
  const TAXW = { nobreza: 0.45, mercadores: 0.85, sacerdotes: 0.25, militares: 0.3, artesaos: 0.8, povo: 0.9 };
  const HUNGER = { nobreza: 4, mercadores: 8, sacerdotes: 6, militares: 12, artesaos: 15, povo: 25 };

  // ------------------------------ who belongs where ------------------------------
  function ownerHouses(f) {
    const m = new Map(); for (const b of G.S.buildings.values()) if (b.owner > 0 && LAND[b.type] && G.Village.facOfSet(b.set) === f.id) m.set(b.owner, (m.get(b.owner) || 0) + 1);
    return m;
  }
  const courtOf = (v, r) => !!r && (v === r || v.id === r.partner || (r.kids || []).includes(v.id) || r.mother === v.id || r.father === v.id);
  function groupOf(v, owners, ruler) {
    if (v.role === 'sacerdote') return 'sacerdotes';
    if (v.role === 'guerreiro') return 'militares';
    if (courtOf(v, ruler) || (v.home && owners.has(v.home))) return 'nobreza';
    if (MERCH[v.role]) return 'mercadores';
    const h = v.home && G.S.buildings.get(v.home);
    if (h && (h.elite || (h.trade || 0) > 12 || (h.coin || 0) > 45)) return 'mercadores';
    if (CRAFT[v.role]) return 'artesaos';
    return 'povo';
  }
  Po.groupOf = v => v.grp || 'povo';
  function standing(v, k, h) {
    const pe = P.persona(v);
    let s = (h ? (h.coin || 0) * 0.04 : 0) + v.courage * 1.5 + pe.amb * 3 + (v.hero ? 3 : 0) + (v.age >= 28 && v.age <= 58 ? 1.5 : 0);
    if (k === 'militares') s += (v.kills || 0) * 0.4 + (v.officer ? 3 : 0) + (v.elite ? 1.5 : 0);
    if (k === 'sacerdotes') s += (v.devotion || 0) * 0.02 + (v.oracle ? 3 : 0);
    if (k === 'mercadores' && h && h.elite) s += 4;
    return s;
  }

  // ------------------------------ the groups, recounted ------------------------------
  function ctxOf(f) {
    const pop = G.Fac.pop(f.id); const coin = E.coinage(f.id);
    return {
      pop, coin, tax: coin ? E.taxRate(f) : (G.Court ? G.Court.tributeRate(f) : 0), hungry: f.stock.food < pop * 0.5,
      war: G.Fac.enemiesOf(f.id).length > 0, pe: P.leaderPe(f), ruler: P.ruler(f),
      palace: !!(G.Court && G.Court.buildingPalace && G.Court.buildingPalace(f)),
    };
  }
  function target(f, k, c) {
    let t = 60;
    t += (AFF[f.gov] || {})[k] || 0;
    t += (EAFF[Po.econOf(f)] || {})[k] || 0;
    t -= c.tax * 100 * TAXW[k];
    if (c.hungry) t -= HUNGER[k];
    if (c.war) t += k === 'militares' ? (f.weariness < 40 ? 6 : -f.weariness * 0.15) : -f.weariness * (k === 'mercadores' ? 0.22 : k === 'povo' ? 0.25 : 0.12);
    const pe = c.pe;
    if (k === 'povo' || k === 'artesaos') t -= pe.cru * 14;
    if (k === 'sacerdotes') t += (pe.pie - 0.5) * 24;
    if (k === 'militares') t += (pe.agg - 0.5) * 16;
    if (k === 'mercadores' && c.coin) t += Math.min(8, (f.exports || 0) / 400);
    if (c.ruler && c.ruler.grp === k) t += 8;
    t -= (f.terror || 0) * (k === 'militares' ? 0.02 : 0.12);
    for (const key in f.pol || {}) { const p = f.pol[key]; const age = G.S.day - p.day; if (age < 14 && p.d && p.d[k]) t += p.d[k] * (1 - age / 14); }
    if (f.grpHurt && G.S.day - (f.grpHurt[k] || -99) < 8) t -= 12;
    if (f.golden > 0) t += 12;
    if (c.palace && (k === 'povo' || k === 'artesaos')) t -= 8;
    return G.clamp(t, 0, 100);
  }
  function recount(f, dt) {
    const S = G.S; const ruler = P.ruler(f);
    const owners = ownerHouses(f);
    const g = f.grp || (f.grp = {});
    for (const k of GK) { const q = g[k] || (g[k] = { sat: 55, press: 0 }); q.n = 0; q.wealth = 0; q._b = null; q._bs = -1e9; }
    const houses = new Set();
    for (const v of S.villagers.values()) {
      if (v.captive || v.age < 16 || G.Fac.idOfV(v) !== f.id) { if (v.grp && v.captive) v.grp = ''; continue; }
      const k = groupOf(v, owners, ruler); v.grp = k;
      const q = g[k]; q.n++;
      const h = v.home && S.buildings.get(v.home);
      if (h && !houses.has(h.id)) { houses.add(h.id); q.wealth += (h.coin || 0) + (owners.get(h.id) || 0) * 6; }
      if (v !== ruler) { const s = standing(v, k, h); if (s > q._bs) { q._bs = s; q._b = v; } }
    }
    let tot = 0; const pw = POW[f.gov] || {};
    for (const k of GK) {
      const q = g[k];
      let w = q.n + q.wealth / 12 + (k === 'militares' ? q.n * 0.8 : 0) + (k === 'nobreza' ? (q.n ? 3 : 0) : 0) + (k === 'sacerdotes' && G.Fac.has(f.id, 'temple') ? 3 : 0);
      w *= pw[k] || 1; q.w = q.n ? w : 0; tot += q.w;
    }
    const c = ctxOf(f);
    for (const k of GK) {
      const q = g[k];
      q.inf = tot ? Math.round(q.w / tot * 100) : 0;
      q.lead = q._b ? q._b.id : 0; delete q._b; delete q._bs;
      const t = target(f, k, c);
      q.sat = q.n ? G.clamp(q.sat + (t - q.sat) * Math.min(1, dt * 0.02), 0, 100) : 55;
      q.dem = q.n && q.sat < 40 ? demandOf(f, k, c) : '';
      q.press = q.n && q.sat < 35 && q.inf >= 12 ? (q.press || 0) + dt / DAY() : Math.max(0, (q.press || 0) - dt / DAY() * 0.6);
    }
  }
  Po.recount = recount;
  // what an angry group asks for, by what hurts it most
  function demandOf(f, k, c) {
    const aff = (AFF[f.gov] || {})[k] || 0, eaff = (EAFF[Po.econOf(f)] || {})[k] || 0;
    const tx = c.tax * 100 * TAXW[k];
    if (c.hungry && (k === 'povo' || k === 'artesaos' || k === 'militares')) return 'pao';
    if (c.war && f.weariness > 45 && k !== 'militares') return 'paz';
    if (k === 'militares' && f.stock.moedas < 5 && c.coin) return 'soldo';
    const opts = [['impostos', tx], ['regime', -aff * 1.1], ['econ', -eaff]];
    opts.sort((a, b) => b[1] - a[1]);
    const top = opts[0][0];
    if (top === 'regime') { const w = WISH[k].find(x => x !== f.gov && available(f, x)); if (w) return 'regime:' + w; }
    if (top === 'econ' && EWISH[k] !== Po.econOf(f)) return 'econ:' + EWISH[k];
    return tx > 4 ? 'impostos' : k === 'sacerdotes' ? 'templo' : 'impostos';
  }
  const DEM_TXT = {
    pao: 'pão: os celeiros abertos', paz: 'o fim da guerra', soldo: 'o soldo atrasado', impostos: 'impostos mais baixos', templo: 'o dízimo do templo',
  };
  Po.demandText = (f, d) => { if (!d) return ''; if (DEM_TXT[d]) return DEM_TXT[d]; const [a, b] = d.split(':'); if (a === 'regime') return `${G.gen(govNameOf(f, b)) === 'a' ? 'uma' : 'um'} ${govNameOf(f, b).toLowerCase()}`; if (a === 'econ') return ECON[b] ? ECON[b].name.toLowerCase() : b; return d; };
  function govNameOf(f, gov) { const c = G.CIVS[f.civ]; return (c && c.gov[gov] && c.gov[gov][0]) || (P.GOV[gov] || {}).name || gov; }
  Po.govNameOf = govNameOf;

  // ------------------------------ land, rent and the common granary ------------------------------
  function pickOwner(b, f) {
    const S = G.S; const set = S.settlements.get(b.set); if (!set) return 0;
    const owned = ownerHouses(f); let best = 0, bs = -1e9;
    for (const h of S.buildings.values()) {
      if (h.set !== b.set || !h.built || !G.BDEF[h.type] || !G.BDEF[h.type].housing || h.type === 'hut') continue;
      const n = owned.get(h.id) || 0; if (n >= 5) continue;
      const lord = set.lord && [...S.villagers.values()].some(v => v.home === h.id && v.id === set.lord);
      const s = (h.coin || 0) + n * 30 + (h.type === 'sobrado' || h.type === 'insula' ? 6 : 0) + (lord ? 60 : 0) + G.hash(h.id * 3) * 8;
      if (s > bs) { bs = s; best = h.id; }
    }
    return best;
  }
  function landTick(f, newDay) {
    const S = G.S; const econ = Po.econOf(f); const coin = E.coinage(f.id);
    let rent = 0; const pool = [];
    for (const b of S.buildings.values()) {
      if (!b.built || !LAND[b.type] || G.Village.facOfSet(b.set) !== f.id) continue;
      if (econ === 'estatal' || econ === 'comunal') { b.owner = 0; if (newDay && coin && econ === 'estatal') rent += 1.2; continue; }
      if (econ === 'templo') { b.owner = -1; if (newDay && coin) rent += 0.6; continue; }
      const h = b.owner > 0 && S.buildings.get(b.owner);
      if (!h || !h.built || h.set !== b.set) b.owner = pickOwner(b, f);
      if (newDay && b.owner > 0 && coin) { const o = S.buildings.get(b.owner); if (o) o.coin = (o.coin || 0) + (econ === 'feudal' ? 1.6 : 1.1); }
    }
    if (newDay && rent) f.stock.moedas += rent;
    // all is shared: what the houses saved goes back to a common purse, and out again, the same for each
    if (newDay && econ === 'comunal' && coin) {
      let sum = 0; for (const h of S.buildings.values()) if (h.coin && G.Village.facOfSet(h.set) === f.id) { sum += h.coin; pool.push(h); }
      for (const h of S.buildings.values()) if (G.BDEF[h.type] && G.BDEF[h.type].housing && h.built && G.Village.facOfSet(h.set) === f.id && !pool.includes(h)) pool.push(h);
      if (pool.length) { const each = Math.round(sum / pool.length * 10) / 10; for (const h of pool) h.coin = each; }
    }
    // the lords of the land: in each town, the noble with most standing
    if (econ === 'feudal' || f.gov === 'feudal') {
      for (const s of G.Fac.settlementsOf(f.id)) {
        const l = s.lord && S.villagers.get(s.lord);
        if (l && !l.captive && l.set === s.id && l.grp === 'nobreza') continue;
        let best = null, bs = -1e9; for (const v of S.villagers.values()) if (v.set === s.id && v.grp === 'nobreza' && !v.captive && v.age >= 20 && v.id !== f.leader) { const h = S.buildings.get(v.home); const sc = standing(v, 'nobreza', h); if (sc > bs) { bs = sc; best = v; } }
        s.lord = best ? best.id : 0;
      }
    } else for (const s of G.Fac.settlementsOf(f.id)) if (s.lord) s.lord = 0;
  }
  Po.landOwner = b => (b && b.owner > 0 ? G.S.buildings.get(b.owner) : null);

  // ------------------------------ taxes and loyalty, as the rest of the game sees them ------------------------------
  Po.taxMod = function (f, r) {
    const econ = Po.econOf(f);
    r += f.taxMod || 0;
    if (econ === 'estatal') r += 0.05; else if (econ === 'feudal') r += 0.03; else if (econ === 'comunal') r *= 0.4;
    if (f.gov === 'anarquia') r = 0;
    return r;
  };
  Po.loyaltyMod = function (s, f) {
    const g = f.grp; if (!g) return 0;
    let w = 0, sum = 0; for (const k of GK) { const q = g[k]; if (!q || !q.n) continue; w += q.inf; sum += q.sat * q.inf; }
    return w ? (sum / w - 50) * 0.25 : 0;
  };

  // ------------------------------ a change of regime ------------------------------
  const REG_NEWS = {
    parlamento: (f, v) => `${f.name} tem agora ${govNameOf(f, 'parlamento').toLowerCase().startsWith('reino') || govNameOf(f, 'parlamento').toLowerCase().startsWith('senhorio') ? 'um' : 'uma'} ${govNameOf(f, 'parlamento')}: ${v ? P.styled(f, v) : 'o soberano'} reina, mas nenhum imposto e nenhuma guerra passam sem o conselho dos nobres e dos mercadores.`,
    feudal: (f, v) => `${f.name} virou um ${govNameOf(f, 'feudal').replace(/^Reino/, 'reino').replace(/^Senhorio/, 'senhorio')}: as terras foram repartidas entre os senhores, que juraram lealdade a ${v ? P.styled(f, v) : 'o soberano'}. Os camponeses agora pagam a eles.`,
    republica: (f, v) => `Nasce ${G.gen(govNameOf(f, 'republica')) === 'a' ? 'a' : 'o'} ${govNameOf(f, 'republica')} de ${f.name}: ninguém mais herda o poder. ${v ? v.name + ' foi ' + (v.g === 'f' ? 'a primeira escolhida' : 'o primeiro escolhido') + ' para governar, por um tempo.' : ''}`,
    democracia: (f, v) => `${f.name} é agora uma democracia: a assembleia de todos os cidadãos vota as leis${v ? ', e escolheu ' + v.name + ' para governar' : ''}.`,
    oligarquia: (f, v) => `As famílias mais ricas tomaram ${f.name}: ${govNameOf(f, 'oligarquia')}${v ? ', com ' + v.name + ' à frente' : ''}. Quem tem ouro tem voz.`,
    ditadura: (f, v) => `${v ? v.name : 'Um general'} tomou ${f.name} com os soldados: ${govNameOf(f, 'ditadura').toLowerCase()}. Os quartéis mandam.`,
    comuna: (f, v) => `${f.name} virou uma comuna: as terras, os celeiros e as ferramentas agora são de todos${v ? '. ' + v.name + ' guarda o celeiro comum' : ''}.`,
    anarquia: (f) => `${f.name} não tem mais governante: as decisões são tomadas em roda, ninguém paga imposto, ninguém manda em ninguém.`,
    teocracia: (f, v) => `${f.name} tornou-se uma teocracia: ${v ? P.styled(f, v) : 'os sacerdotes'} governa em nome dos deuses.`,
    reino: (f, v) => `${f.name} voltou a ser governad${G.Fac.oa(f)} por ${v ? P.styled(f, v) : 'um soberano'}, sem conselho a quem prestar contas.`,
  };
  Po.setRegime = function (f, gov, how, quiet) {
    if (!gov || f.gov === gov) return false;
    const old = f.gov; f.gov = gov;
    const v = P.ruler(f);
    if (f.rulers.length) f.rulers[f.rulers.length - 1].title = v ? P.title(f, v) : '';
    if (!quiet) announce(f, gov, v, old, how);
    econFollows(f, gov);
    if (gov === 'comuna' || gov === 'anarquia') G.War && G.War.freeAllOf(f, 'abolicao');
    f.term = G.S.day; f.taxMod = 0;
    G.Stories && G.Stories.signal('regime', { fac: f.id, gov, old, how: how || '', who: v ? v.id : 0 });
    return true;
  };
  function announce(f, gov, v, old, how) {
    const c = G.Fac.capitalOf(f.id); const txt = REG_NEWS[gov] ? REG_NEWS[gov](f, v, old, how) : `${f.name} é agora ${govNameOf(f, gov)}.`;
    log(txt, 'crown', c ? c.cx : undefined, c ? c.cy : undefined);
    G.UI && G.UI.toast(govNameOf(f, gov), `${f.name} muda o jeito de ser governad${G.Fac.oa(f)}.`, 'crown');
    G.Lore && G.Lore.note('gov', { fac: f.id, gov });
  }
  function econFollows(f, gov) {
    const was = Po.econOf(f);
    const to = gov === 'comuna' || gov === 'anarquia' ? 'comunal' : gov === 'oligarquia' || gov === 'republica' || gov === 'democracia' ? (was === 'templo' ? was : 'livre') : gov === 'feudal' ? 'feudal' : gov === 'teocracia' ? 'templo' : was;
    f.econ = to;
  }
  // called by politics.js after a coup or a revolution has crowned someone
  Po.afterChange = function (f, how, v, old) {
    if (!v) return;
    econFollows(f, f.gov);
    if (!REG_NEWS[f.gov] || f.gov === 'conselho' || f.gov === 'tirania') return;
    announce(f, f.gov, v, '', how);
    f.term = G.S.day; f.taxMod = 0;
    const pol = f.pol || (f.pol = {});
    const won = Object.keys(WISH).filter(k => WISH[k].includes(f.gov));
    const d = {}; for (const k of GK) d[k] = won.includes(k) ? 18 : -6;
    pol.regime = { day: G.S.day, d };
    G.Stories && G.Stories.signal('regime', { fac: f.id, gov: f.gov, how, who: v.id, old: old ? old.id : 0 });
  };

  // ------------------------------ the ruler decides ------------------------------
  const memo = (f, key, d) => { (f.pol || (f.pol = {}))[key] = { day: G.S.day, d }; };
  function richHouses(f) { const out = []; for (const h of G.S.buildings.values()) if ((h.coin || 0) > 20 && G.Village.facOfSet(h.set) === f.id && G.BDEF[h.type] && G.BDEF[h.type].housing) out.push(h); return out; }
  Po.decide = function (f) {
    const S = G.S; const r = P.ruler(f); if (!r || f.rev || f.coup) return;
    if (S.day - (f.lastDecision || -9) < 3) return;
    const g = f.grp; if (!g) return;
    const pe = P.leaderPe(f); const pop = G.Fac.pop(f.id); const coin = E.coinage(f.id); const econ = Po.econOf(f);
    const vain = G.Court ? G.Court.vanity(r) : 0.4; const war = G.Fac.enemiesOf(f.id).length > 0;
    const palace = !!(G.Court && G.Court.buildingPalace && G.Court.buildingPalace(f));
    const angry = GK.filter(k => g[k].n && g[k].sat < 35 && g[k].inf >= 12).length;
    const rich = richHouses(f); const richW = rich.reduce((s, h) => s + h.coin, 0);
    const opts = [];
    if (f.gov !== 'anarquia' && f.gov !== 'comuna') {
      const need = (coin && f.stock.moedas < pop * 1.5) || palace || war;
      const taxCD = S.day - (f.taxDay || -99) >= 6;
      if (need && taxCD && (f.taxMod || 0) < 0.15) opts.push(['impostosMais', 0.3 + pe.amb * 0.25 + vain * 0.15 + (palace ? 0.15 : 0) - angry * 0.12 - (g.povo.sat < 40 ? 0.2 : 0) - (f.gov === 'democracia' || f.gov === 'comuna' ? 0.3 : 0)]);
      if (taxCD && (f.taxMod || 0) > -0.08 && (g.povo.sat < 38 || g.mercadores.sat < 35 || g.artesaos.sat < 35)) opts.push(['impostosMenos', 0.3 + (1 - pe.cru) * 0.3 - pe.amb * 0.2 + (P.free(f) ? 0.1 : 0)]);
    }
    if (econ !== 'estatal' && econ !== 'comunal' && richW > 70 && pe.amb > 0.55 && (pe.cru > 0.45 || P.tyr(f)) && !P.free(f)) opts.push(['estatizar', 0.2 + pe.amb * 0.3 + pe.cru * 0.3 + (coin && f.stock.moedas < pop ? 0.2 : 0) - g.mercadores.inf / 200 - (g.militares.sat < 40 ? 0.3 : 0)]);
    if (econ === 'estatal' && g.mercadores.n && (coin ? f.stock.moedas < pop : true) && pe.cru < 0.6) opts.push(['privatizar', 0.2 + (1 - pe.cru) * 0.2 + g.mercadores.inf / 150]);
    if (econ !== 'feudal' && P.fam(f) === 'dyn' && g.nobreza.inf >= 15 && g.nobreza.sat < 45 && (f.era || 0) >= 2 && G.Fac.settlementsOf(f.id).length >= 2) opts.push(['terras', 0.25 + (1 - pe.amb) * 0.15 + g.nobreza.inf / 150]);
    if (P.fam(f) === 'dyn' && f.gov !== 'parlamento' && f.gov !== 'feudal' && available(f, 'parlamento') && (g.mercadores.inf + g.nobreza.inf) > 40 && (g.mercadores.sat < 42 || g.nobreza.sat < 42) && pe.cru < 0.5) opts.push(['conselho', 0.25 + (1 - pe.amb) * 0.3]);
    if (g.povo.n && g.povo.sat < 42 && f.stock.food > pop * 6 && S.day - ((f.pol || {}).pao || { day: -99 }).day >= 7) opts.push(['pao', 0.3 + (1 - pe.cru) * 0.2]);
    if (pe.pie > 0.65 && g.sacerdotes.n && g.sacerdotes.sat < 55 && G.Fac.has(f.id, 'temple') && S.day - ((f.pol || {}).dizimo || { day: -99 }).day >= 10) opts.push(['dizimo', 0.25 + pe.pie * 0.2]);
    if (!opts.length) return;
    G.Secrets && G.Secrets.bend(f, opts);
    opts.sort((a, b) => b[1] - a[1]);
    const [k, u] = opts[0];
    if (u < 0.45 || G.R() > 0.55) return;
    f.lastDecision = S.day;
    apply(f, k, r, 'decisao');
  };
  // what a decision does (also what a ruler concedes to a petition)
  function apply(f, k, r, how, by) {
    const S = G.S; const c = G.Fac.capitalOf(f.id); const x = c ? c.cx : undefined, y = c ? c.cy : undefined;
    G.Stories && G.Stories.signal('policy', { fac: f.id, k, how: how || '', by: by || '', who: r ? r.id : 0 });
    const who = r ? styledV(f, r) : 'O governo'; const pop = G.Fac.pop(f.id);
    switch (k) {
      case 'impostosMais': f.taxDay = S.day; f.taxMod = Math.min(0.15, (f.taxMod || 0) + 0.05); memo(f, 'impostos', { povo: -6, artesaos: -5, mercadores: -6 }); log(`${who} aumentou os impostos de ${f.name}. Os cobradores já estão batendo nas portas.`, 'coin', x, y); break;
      case 'impostosMenos': f.taxDay = S.day; f.taxMod = Math.max(-0.08, (f.taxMod || 0) - 0.05); memo(f, 'impostos', { povo: 8, artesaos: 6, mercadores: 6 }); log(how === 'peticao' ? `${who} baixou os impostos.` : `${who} baixou os impostos de ${f.name}. Nas ruas, o povo respira.`, 'coin', x, y); break;
      case 'estatizar': {
        let took = 0, houses = 0;
        for (const h of richHouses(f)) { const t = Math.round(h.coin * 0.6); h.coin -= t; took += t; houses++; if (h.elite) { h.elite = null; } }
        if (E.coinage(f.id)) f.stock.moedas += took;
        f.econ = 'estatal';
        for (const b of S.buildings.values()) if (LAND[b.type] && G.Village.facOfSet(b.set) === f.id) b.owner = 0;
        memo(f, 'estatizou', { mercadores: -32, nobreza: -26, povo: 6, militares: 4 });
        log(`${who} declarou que as terras, as minas e o comércio de ${f.name} agora são ${r && r.g === 'f' ? 'dela' : 'dele'}. Os guardas entraram nas casas ricas${took ? ' e levaram ' + took + ' moedas' : ''}; as bandeiras dos mercadores foram arrancadas das portas.`, 'tyrant', x, y);
        G.UI && G.UI.toast('Estatização', `${f.name}: tudo agora é do governante.`, 'tyrant');
        G.Stories && G.Stories.signal('nationalize', { fac: f.id, who: r ? r.id : 0, took, houses });
        break;
      }
      case 'privatizar': f.econ = 'livre'; memo(f, 'privatizou', { mercadores: 22, nobreza: 12, povo: -3 }); log(`${who} devolveu o comércio e as terras de ${f.name} a quem quiser trabalhar nelas. Os mercadores voltam a pendurar suas bandeiras.`, 'trade', x, y); break;
      case 'terras': f.econ = 'feudal'; memo(f, 'terras', { nobreza: 26, povo: -8, mercadores: -4 }); log(`${who} repartiu as terras de ${f.name} entre os nobres, em troca de lealdade e de soldados. Os camponeses agora trabalham para os senhores.`, 'crown', x, y); if (G.R() < 0.5 && available(f, 'feudal') && P.fam(f) === 'dyn') Po.setRegime(f, 'feudal', how); break;
      case 'conselho': memo(f, 'conselho', { mercadores: 24, nobreza: 16 }); Po.setRegime(f, 'parlamento', how); break;
      case 'pao': { const n = Math.round(Math.min(f.stock.food * 0.25, pop * 2)); f.stock.food -= n; memo(f, 'pao', { povo: 16, artesaos: 10 }); log(`${who} mandou abrir os celeiros de ${f.name}: ${n} sacos de comida repartidos na praça.`, 'food', x, y); if (c) Po.crowd(c, 'pao'); break; }
      case 'dizimo': f.taxMod = Math.min(0.15, (f.taxMod || 0) + 0.02); memo(f, 'dizimo', { sacerdotes: 20, povo: -3 }); log(`${who} instituiu o dízimo: uma parte de tudo o que se colhe em ${f.name} vai para o templo.`, 'faith', x, y); break;
      case 'paz': { const en = G.Fac.enemiesOf(f.id)[0]; if (en) { const o = typeof en === 'object' ? en : G.Fac.get(en); if (o) P.sendEnvoy(f, o, 'paz'); } memo(f, 'paz', { povo: 10, mercadores: 10 }); log(`${who} prometeu buscar a paz.`, 'peace', x, y); break; }
      case 'soldo': { const n = Math.min(Math.floor(f.stock.moedas || 0), 30); f.stock.moedas -= n; memo(f, 'soldo', { militares: 22 }); log(`${who} pagou o soldo atrasado dos soldados${n ? ' (' + n + ' moedas)' : ''}.`, 'sword', x, y); break; }
      case 'templo': memo(f, 'templo', { sacerdotes: 18 }); log(`${who} prometeu ofertas ao templo.`, 'faith', x, y); break;
      default: {
        const [a, b] = k.split(':');
        if (a === 'regime') Po.setRegime(f, b, how);
        else if (a === 'econ') { f.econ = b; memo(f, 'econ', { [by || 'povo']: 18 }); log(`${who} aceitou: ${f.name} passa a viver de ${ECON[b].name.toLowerCase()}.`, 'crown', x, y); }
      }
    }
  }
  Po.apply = apply;

  // ------------------------------ petitions: a group at the ruler's door ------------------------------
  const CONCEDE = { pao: 'pao', paz: 'paz', soldo: 'soldo', impostos: 'impostosMenos', templo: 'templo' };
  function petition(f, k) {
    const S = G.S; const q = f.grp[k]; const r = P.ruler(f);
    const lead = q.lead && S.villagers.get(q.lead); if (!lead || !r || lead.captive || lead.held || lead.task && lead.task.pri >= 3) return false;
    const cap = G.Fac.capitalOf(f.id); if (!cap) return false;
    const at = Po.seat(f) || [cap.cx, cap.cy];
    const id = (f.petN = (f.petN || 0) + 1);
    f.pet = { id, k, lead: lead.id, dem: q.dem, x: at[0], y: at[1], t: 0, day: S.day };
    G.Vg.endTask(lead); G.Vg.setTask(lead, { type: 'petition', pet: id, lead: true, x: at[0], y: at[1], pri: 2.3, st: 0, kind: 'petition' });
    let n = 0;
    for (const v of S.villagers.values()) {
      if (n >= 4) break;
      if (v === lead || v.grp !== k || v.set !== lead.set || v.captive || v.age < 18 || (v.task && v.task.pri >= 2)) continue;
      if (G.R() < 0.6 && G.Vg.give(v, { type: 'petition', pet: id, x: at[0] + G.rr(-1.6, 1.6), y: at[1] + G.rr(0.8, 2), pri: 2.2, st: 0, kind: 'petition' })) n++;
    }
    log(`${cap1(GR[k].pl)} de ${cap.name}, com ${lead.name} à frente, ${pl(k)[0]} até ${P.styled(f, r)} pedir ${Po.demandText(f, q.dem)}.`, 'scroll', at[0], at[1]);
    G.Stories && G.Stories.signal('petition', { fac: f.id, grp: k, lead: lead.id, dem: q.dem, x: at[0], y: at[1] });
    return true;
  }
  // where the ruler receives: the palace, or the fire of the capital
  Po.seat = function (f) {
    const S = G.S; const cap = G.Fac.capitalOf(f.id); if (!cap) return null;
    const pal = G.Court && G.Court.bestPalace ? G.Court.bestPalace(f) : null;
    if (pal && pal.built && pal.set === cap.id) { const fr = G.Village.frontTile(pal); return [fr[0], fr[1] + 1]; }
    for (const b of S.buildings.values()) if (b.set === cap.id && b.built && (b.type === 'praca' || b.type === 'palacio')) { const c = G.Village.center(b); return [c[0], c[1] + 1]; }
    const cf = S.buildings.get(cap.campfire); return cf ? [cf.x + 1.5, cf.y + 0.8] : [cap.cx, cap.cy];
  };
  function answer(f) {
    const S = G.S; const pt = f.pet; f.pet = null; if (!pt) return;
    const r = P.ruler(f); const lead = S.villagers.get(pt.lead); const q = f.grp[pt.k];
    for (const v of S.villagers.values()) if (v.task && v.task.type === 'petition' && v.task.pet === pt.id) G.Vg.endTask(v);
    if (!r || !lead || !q) return;
    const pe = P.leaderPe(f);
    let p = 0.22 + (1 - pe.cru) * 0.35 + q.inf / 200 - pe.amb * 0.2 + (P.free(f) ? 0.15 : 0) - (P.tyr(f) ? 0.25 : 0);
    const [a, b] = (pt.dem || '').split(':');
    if (a === 'regime') { const ok = (P.fam(f) === 'dyn' && (b === 'parlamento' || b === 'feudal')) || (P.free(f) && (b === 'democracia' || b === 'republica' || b === 'oligarquia')); if (!ok || !available(f, b)) p = 0; else p -= 0.15; }
    const who = styledV(f, r);
    G.Life && G.Life.bio(lead, 'note', `Levou ${GR[pt.k].pl} até ${r.name} para pedir ${Po.demandText(f, pt.dem)}`);
    if (G.R() < p) {
      const conc = CONCEDE[pt.dem] || pt.dem;
      log(`${who} ouviu ${lead.name} e cedeu.`, 'crown', pt.x, pt.y);
      apply(f, conc, r, 'peticao', pt.k);
      memo(f, 'peticao_' + pt.k, { [pt.k]: 18 });
      q.press = 0;
      G.Stories && G.Stories.signal('petitionAnswer', { fac: f.id, grp: pt.k, lead: lead.id, ok: 1, dem: pt.dem });
      return;
    }
    q.refused = S.day; q.press = Math.max(q.press || 0, 1.5);
    memo(f, 'recusa_' + pt.k, { [pt.k]: -10 });
    const arrest = pe.cru > 0.6 || (P.tyr(f) && pe.cru > 0.4);
    log(`${who} mandou ${lead.name} e ${GR[pt.k].pl} de volta para casa sem nada${arrest ? '. Na saída, os guardas prenderam ' + lead.name + ' por insolência.' : '.'}`, arrest ? 'tyrant' : 'crown', pt.x, pt.y);
    G.Stories && G.Stories.signal('petitionAnswer', { fac: f.id, grp: pt.k, lead: lead.id, ok: 0, arrest: arrest ? 1 : 0, dem: pt.dem });
    if (arrest) { (f.grpHurt || (f.grpHurt = {}))[pt.k] = S.day; if (Po.sentence) Po.sentence(f, [lead], 'por insolência diante d' + (r.g === 'f' ? 'a' : 'o') + ' ' + P.title(f, r).toLowerCase()); else P.execute(f, lead, 'por insolência'); }
  }

  // ------------------------------ when asking is not enough ------------------------------
  function escalate(f) {
    const S = G.S; const g = f.grp; const r = P.ruler(f); if (!r || f.rev || f.coup || f.exec || f.pet) return;
    const angry = GK.filter(k => g[k].n && g[k].sat < 32 && g[k].inf >= 10 && (g[k].press || 0) >= 2.5 && S.day - (g[k].refused || -99) < 8);
    if (!angry.length || G.R() > 0.3) return;
    angry.sort((a, b) => g[b].inf - g[a].inf);
    const k = angry[0]; const q = g[k]; const lead = S.villagers.get(q.lead); if (!lead || lead.captive) return;
    const want = (q.dem || '').startsWith('regime:') ? q.dem.split(':')[1] : WISH[k].find(x => available(f, x)) || 'conselho';
    const soldiersAngry = g.militares.sat < 45;
    if (k === 'militares' || ((k === 'nobreza' || k === 'mercadores' || k === 'sacerdotes') && soldiersAngry && G.R() < 0.6)) {
      P.startCoup(f, lead); if (f.coup) { f.coup.goal = k === 'militares' ? 'ditadura' : want; f.coup.grp = k; }
      G.Stories && G.Stories.signal('plot', { fac: f.id, grp: k, lead: lead.id, goal: want });
      q.press = 0;
      return;
    }
    // the many rise: the common people and the craftsmen — with the merchants' money behind them, sometimes
    const with_ = angry.filter(x => x !== 'militares');
    if (with_.some(x => x === 'povo' || x === 'artesaos') || with_.length >= 2) {
      const goal = with_.includes('mercadores') && !with_.includes('povo') ? 'republica' : (P.persona(lead).agg > 0.6 && available(f, 'comuna') ? 'comuna' : available(f, want) ? want : 'conselho');
      Po.uprising(f, lead, with_, goal, whyOf(f, q.dem));
      for (const x of with_) g[x].press = 0;
    }
  }
  function whyOf(f, d) {
    if (!d) return '';
    if (d === 'impostos') return 'contra os impostos'; if (d === 'pao') return 'por pão'; if (d === 'paz') return 'contra a guerra';
    const [a, b] = d.split(':'); if (a === 'regime') return `por ${G.gen(govNameOf(f, b)) === 'a' ? 'uma' : 'um'} ${govNameOf(f, b).toLowerCase()}`;
    if (a === 'econ') return b === 'livre' ? 'pelo direito de comerciar' : b === 'comunal' ? 'para que tudo seja de todos' : b === 'feudal' ? 'pelas terras' : '';
    return '';
  }
  // a revolution with a purpose: the ones who rise, the regime they want
  Po.uprising = function (f, lead, groups, goal, why) {
    const S = G.S; const ruler = P.ruler(f); if (!ruler || f.rev || !lead) return false;
    const rebels = [lead];
    for (const v of S.villagers.values()) {
      if (v === lead || v === ruler || v.captive || v.age < 16 || G.Fac.idOfV(v) !== f.id || !groups.includes(v.grp)) continue;
      const pe = P.persona(v); if (G.R() < 0.25 + v.courage * 0.35 + pe.agg * 0.2) rebels.push(v);
    }
    if (goal === 'comuna' || goal === 'anarquia' || goal === 'democracia') for (const v of S.villagers.values()) if (v.captive && G.Fac.idOfV(v) === f.id && v.age >= 16 && v.hp > 50 && G.R() < 0.6) rebels.push(v);
    if (rebels.length < 3) return false;
    f.rev = { leader: lead.id, rebels: rebels.map(v => v.id), t: 0, goal, why: why || '', groups };
    for (const v of rebels) { v.rebel = f.id; G.Vg.setTask(v, { type: 'combat', id: ruler.id, pri: 4.7, rebel: true, any: true, cause: 'war', kind: 'combat' }); }
    for (const v of S.villagers.values()) {
      if (v.rebel || v.role !== 'guerreiro' || G.Fac.idOfV(v) !== f.id || v.grp === 'povo') continue;
      let t = null, bd = 1e9; for (const o of rebels) { const d = G.dist2(v.x, v.y, o.x, o.y); if (d < bd) { bd = d; t = o; } }
      if (t && bd < 30 * 30) G.Vg.setTask(v, { type: 'combat', id: t.id, pri: 4.6, guard: true, any: true, kind: 'combat' });
    }
    const gn = groups.map(k => GR[k].pl).join(' e ');
    log(`Revolução em ${f.name}! ${lead.name} lidera ${rebels.length} revoltosos — ${gn} — contra ${P.styled(f, ruler)}${why ? ', ' + why : ''}. Querem ${G.gen(govNameOf(f, goal)) === 'a' ? 'uma' : 'um'} ${govNameOf(f, goal).toLowerCase()}.`, 'tyrant', ruler.x, ruler.y);
    G.UI && G.UI.toast('Revolução!', `${f.name}: ${gn} se levantam${why ? ' ' + why : ''}.`, 'tyrant');
    G.Audio && G.Audio.play('horn');
    G.Stories && G.Stories.signal('uprising', { fac: f.id, lead: lead.id, groups, goal, why: why || '', n: rebels.length });
    return true;
  };

  // ------------------------------ elections ------------------------------
  const TERM = { republica: 4, democracia: 3, oligarquia: 6, conselho: 5 };
  const VOTERS = { oligarquia: { mercadores: 3, nobreza: 2 }, republica: { nobreza: 1.5, mercadores: 1.5, artesaos: 1, militares: 1, povo: 0.7, sacerdotes: 1 } };
  function election(f) {
    const S = G.S; const term = TERM[f.gov]; if (!term) return;
    if (f.term === undefined) f.term = S.day;
    if (S.day - f.term < term || f.rev || f.coup || f.exec) return;
    f.term = S.day;
    const g = f.grp; const r = P.ruler(f);
    const cands = []; for (const k of GK) { const v = g[k] && g[k].lead && S.villagers.get(g[k].lead); if (v && !v.captive && v.age >= 25 && !cands.includes(v)) cands.push(v); }
    if (r && !cands.includes(r)) cands.push(r);
    if (cands.length < 2) return;
    const votes = new Map(cands.map(c => [c.id, 0]));
    const wt = VOTERS[f.gov] || null;
    for (const v of S.villagers.values()) {
      if (v.captive || v.age < 18 || G.Fac.idOfV(v) !== f.id) continue;
      const w = wt ? (wt[v.grp] || 0) : 1; if (!w) continue;
      let best = null, bs = -1e9;
      for (const c of cands) {
        let s = c.grp === v.grp ? 3 : ((AFF[WISH[c.grp] ? WISH[c.grp][0] : 'conselho'] || {})[v.grp] || 0) / 10;
        s += G.hash(v.id * 7 + c.id) * 2 + (c === r ? (g[v.grp] ? (g[v.grp].sat - 50) / 15 : 0) : 0) + (St() && St().relOf(v, c) ? 4 : 0) + (G.Secrets ? G.Secrets.voteBias(v, c) : 0);
        if (s > bs) { bs = s; best = c; }
      }
      votes.set(best.id, votes.get(best.id) + w);
    }
    const ranked = cands.slice().sort((a, b) => votes.get(b.id) - votes.get(a.id) || (b === r ? 1 : 0) - (a === r ? 1 : 0));
    const win = ranked[0], second = ranked[1];
    const cap = G.Fac.capitalOf(f.id); const at = Po.seat(f) || (cap ? [cap.cx, cap.cy] : [win.x, win.y]);
    Po.crowd(cap, 'voto');
    const vt = n => Math.round(n);
    if (win === r) { log(`Eleição em ${cap ? cap.name : f.name}: ${P.styled(f, r)} foi reeleit${oa(r)} com ${vt(votes.get(r.id))} votos contra ${vt(votes.get(second.id))} de ${second.name}.`, 'scroll', at[0], at[1]); return; }
    P.endReign(f, 'mandato');
    P.crown(f, win, 'eleicao', true);
    log(`Eleição em ${cap ? cap.name : f.name}: ${win.name}, d${win.grp === 'nobreza' ? 'a nobreza' : win.grp === 'mercadores' ? 'os mercadores' : win.grp === 'povo' ? 'o povo' : win.grp === 'artesaos' ? 'os artesãos' : win.grp === 'militares' ? 'o exército' : 'o templo'}, venceu com ${vt(votes.get(win.id))} votos${second ? ' contra ' + vt(votes.get(second.id)) + ' de ' + second.name : ''}. Agora é ${P.title(f, win).toLowerCase()} de ${f.name}.`, 'scroll', at[0], at[1]);
    G.Stories && G.Stories.signal('election', { fac: f.id, who: win.id, lost: second ? second.id : 0, x: at[0], y: at[1] });
  }
  const St = () => G.Stories;
  // the street rises (riots.js)
  Po.riot = (f, set, why, o) => (G.Riots ? G.Riots.start(f, set, why, o) : null);
  // the people gather in the square: to vote, to get bread, to hear a sentence
  Po.crowd = function (set, why) {
    if (!set) return; const S = G.S; const f = G.Fac.get(set.fac); const at = (f && Po.seat(f)) || [set.cx, set.cy];
    let n = 0;
    for (const o of S.villagers.values()) { if (n >= 24) break; if (o.set !== set.id || o.age < 8 || o.captive || G.dist(o.x, o.y, at[0], at[1]) > 22) continue; if (G.Vg.give(o, { type: 'assembly', x: at[0], y: at[1], pri: 1.7, kind: 'assembly', why })) n++; }
  };

  // ------------------------------ the petition, walked ------------------------------
  Po.run = function (v, t, dt, H) {
    if (t.type !== 'petition') return false;
    const f = G.Fac.ofV(v); const pt = f && f.pet;
    if (!pt || pt.id !== t.pet) { H.end(v); return true; }
    if (t.st === 0) { if (!H.goto(v, t.x, t.y, false) && !H.goto(v, t.x, t.y, true)) { H.end(v); return true; } t.st = 1; return true; }
    if (t.st === 1) { v.act = ''; if (H.move(v, dt, 1)) { t.st = 2; v.actT = 0; } if (t.age > 90) { if (t.lead) answer(f); else H.end(v); } return true; }
    // at the door: the leader speaks, the others stand behind with their arms crossed
    v.moving = false; v.act = t.lead ? 'talk' : ''; G.faceTo(v, t.x - v.x, t.y - 1 - v.y);
    if (!v.emo || v.emo.t < 0.2) G.Vg.emote(v, t.lead ? 'chat' : 'angry', 1.4);
    if (t.lead && v.actT > 7) answer(f);
    return true;
  };
  Po.taskText = function (v, t) {
    if (t.type !== 'petition') return null;
    const f = G.Fac.ofV(v); const pt = f && f.pet; const r = f && P.ruler(f);
    return t.lead ? `Levando a ${r ? r.name : 'quem governa'} o pedido d${pt && pt.k === 'povo' ? 'o povo' : 'os ' + (pt ? GR[pt.k].name.toLowerCase() : 'seus')}` : 'Na porta de quem governa, com os outros';
  };

  // ------------------------------ the loop ------------------------------
  let tA = 0, tB = 0, lastDay = -1;
  Po.update = function (dt) {
    const S = G.S; if (!S) return;
    tA += dt; tB += dt;
    const newDay = S.day !== lastDay; if (newDay) lastDay = S.day;
    if (tA >= 4 || newDay) {
      const d = tA; tA = 0;
      for (const f of G.Fac.all()) { if (!f.alive) continue; Po.econOf(f); recount(f, d); landTick(f, newDay); }
    }
    if (tB >= 9) {
      tB = 0;
      for (const f of G.Fac.all()) {
        if (!f.alive || !f.grp || G.Fac.pop(f.id) < 8) continue;
        election(f);
        Po.decide(f);
        if (!f.pet && !f.rev && !f.coup) { const g = f.grp; const k = GK.filter(x => g[x].n && g[x].sat < 35 && g[x].inf >= 12 && (g[x].press || 0) >= 1 && S.day - (g[x].pet || -99) >= 3).sort((a, b) => g[b].inf - g[a].inf)[0]; if (k && G.R() < 0.5 && petition(f, k)) g[k].pet = S.day; }
        escalate(f);
        G.Riots && G.Riots.consider(f);
      }
    }
    // a petition left unanswered (the ruler away, the road blocked) is answered anyway
    for (const f of G.Fac.all()) if (f.pet && (f.pet.t += dt) > 120) answer(f);
  };

  // ------------------------------ the realm panel ------------------------------
  const oldRealm = E.realmHTML;
  E.realmHTML = function (f, esc) {
    const base = oldRealm(f, esc);
    const g = f.grp; if (!g) return base;
    const S = G.S; const econ = Po.econOf(f);
    const rows = GK.filter(k => g[k] && g[k].n).sort((a, b) => g[b].inf - g[a].inf).map(k => {
      const q = g[k]; const l = q.lead && S.villagers.get(q.lead); const sat = Math.round(q.sat);
      return `<div class="sc-g" title="${esc(GR[k].name)}: ${q.n} pessoas · influência ${q.inf}% · satisfação ${sat}%"><i style="background:${GR[k].col}"></i><b>${esc(GR[k].name)}</b><small>${q.n} · ${q.inf}%</small><span class="sc-bar"><em class="${sat < 35 ? 'bad' : sat > 65 ? 'good' : ''}" style="width:${sat}%"></em></span>${l ? `<a data-m="leader" data-id="${l.id}">${esc(l.name)}</a>` : '<span></span>'}${q.dem ? `<em class="sc-dem">quer ${esc(Po.demandText(f, q.dem))}</em>` : ''}</div>`;
    }).join('');
    const pol = Object.entries(f.pol || {}).filter(([, p]) => S.day - p.day < 10).sort((a, b) => b[1].day - a[1].day).slice(0, 3).map(([k]) => POLNAME[k.split('_')[0]] || '').filter(Boolean);
    const lords = (econ === 'feudal' || f.gov === 'feudal') ? G.Fac.settlementsOf(f.id).filter(s => s.lord && S.villagers.get(s.lord)).map(s => `${esc(s.name)}: ${esc(S.villagers.get(s.lord).name)}`) : [];
    return base + `<div class="rm-soc">
      <div class="sc-reg"><b>${esc(P.govName(f))}</b><span>${esc(P.GOV_DESC[f.gov] || '')}</span></div>
      <div class="sc-reg"><b>${esc(ECON[econ].name)}</b><span>${esc(ECON[econ].desc)}</span></div>
      ${lords.length ? `<div class="sc-lords">Senhores: ${lords.join(' · ')}</div>` : ''}
      <div class="sc-grps">${rows}</div>
      ${pol.length ? `<div class="sc-pol">Últimas decisões: ${esc(pol.join(' · '))}</div>` : ''}
      ${f.pet ? `<div class="sc-pol hot">Uma petição está na porta de quem governa.</div>` : ''}
      ${nowLines(f, esc)}
    </div>`;
  };
  // what is happening right now: a riot in the streets, a sentence set, people in the cells
  function nowLines(f, esc) {
    const S = G.S; const out = [];
    if (G.Riots) for (const r of G.Riots.list()) if (r.fac === f.id) { const set = S.settlements.get(r.set); out.push(`Motim em ${esc(set ? set.name : '')}${r.wtxt ? ' ' + esc(r.wtxt) : ''}.`); }
    if (G.Justice) for (const e of G.Justice.list()) if (e.fac === f.id && e.phase !== 'done' && e.phase !== 'after') { const set = S.settlements.get(e.set); const m = G.Justice.METHOD[e.method]; out.push(`${e.sac ? 'Sacrifício' : 'Execução'} em ${esc(set ? set.name : '')}: ${esc(e.names.join(', '))}${m && !e.sac ? ' (' + (e.method === 'pedras' ? 'apedrejamento' : e.method) + ')' : ''}${e.phase === 'wait' ? ', ao meio-dia' : ', agora'}.`); }
    let jailed = 0; for (const v of S.villagers.values()) if (v.task && v.task.type === 'jail' && v.task.fac === f.id) jailed++;
    if (jailed) out.push(`${jailed} ${jailed > 1 ? 'presos esperam' : 'preso espera'} a sentença.`);
    return out.map(t => `<div class="sc-pol hot">${t}</div>`).join('');
  }
  const POLNAME = { impostos: 'impostos', estatizou: 'estatização', privatizou: 'comércio livre', terras: 'terras aos nobres', conselho: 'o conselho', pao: 'pão ao povo', dizimo: 'dízimo', paz: 'busca da paz', soldo: 'soldo pago', templo: 'ofertas ao templo', peticao: 'petição atendida', recusa: 'petição recusada', regime: 'novo regime', econ: 'nova economia' };
})(window.G);
