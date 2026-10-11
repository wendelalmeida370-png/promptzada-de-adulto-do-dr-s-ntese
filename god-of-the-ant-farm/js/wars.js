'use strict';
// ============================================================
//  Wars as history. A war is no longer a flag between two peoples that sends
//  a handful of raiders every day: it is a thing in the world, with a cause, a
//  name, sides and aims, that begins before the first blow and goes on after
//  the last one.
//
//    TENSION      grudges, raids, a city lost, a border pasture, a rich neighbour,
//                 a hungry winter: between two peoples the temperature rises in
//                 steps (friction, crisis, the brink) — patrols, smiths working
//                 at night, granaries filled — and only then is war declared
//                 (a surprise attack is a ruler's choice, not the rule).
//    THE WAR      a name ("a Guerra do Passo de Arkan"), a cause, aims for each
//                 side, a scale that follows from the aims and the peoples
//                 (two villages fight a little war; empires fight a great one).
//    MOBILIZATION the levy is called across the whole realm; each town keeps a
//                 garrison; the called walk to the rally point, take weapons from
//                 the armoury, wait for the others; wagons are loaded; a
//                 commander is named; then the army marches as one.
//    CAMPAIGNS    an army is a body with a commander, companies, morale, food
//                 carried in its wagons and a mission (take this city, hold that
//                 one). It camps at night (tents, fires), forages in enemy land,
//                 starves when the wagons are empty, loses deserters, takes a
//                 city and leaves a garrison and marches on, or comes home.
//    BATTLES      two armies in the field form their lines, wait, advance; the
//                 battle is recorded with its name, place, forces, commanders,
//                 dead, wounded, captured and the side that kept the field.
//    SIEGES       a walled city is besieged, not stormed by six men: camps, the
//                 larder inside, hunger, sickness, engines, surrender, a relief
//                 army, or the siege lifted.
//    OCCUPATION   a taken city is occupied before it is integrated: a garrison,
//                 low loyalty, and sometimes a rising that gives it back.
//    EXHAUSTION   time, dead, lost battles, lost cities, hunger, the men away from
//                 the fields: a people tires of war, and then it seeks peace.
//    PEACE        a treaty with a name: cities kept or given back, prisoners
//                 exchanged, tribute; soldiers march home, veterans remember,
//                 the dead are mourned, and the losers do not forget.
//  The outcome is never written: armies, morale, hunger and the ground decide.
// ============================================================
(function (G) {
  const Wz = G.Wars = {};
  let N = G.N; G.mapHooks.push(n => { N = n; reach.clear(); cache.t = -1; });
  const W = G.W, T = G.T;
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);
  const DAY = () => G.DAY_LEN;
  const P = id => (id && G.S.villagers.get(id)) || null;
  const F = id => G.Fac.get(id);
  const fid = v => G.Fac.idOfV(v);
  const oa = v => (v && v.g === 'f' ? 'a' : 'o');
  const pick = arr => arr[Math.floor(G.R() * arr.length)];
  const cap1 = t => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);
  const key = (a, b) => (a < b ? a + '-' + b : b + '-' + a);
  // "do Clã de Hrafn", "da Liga de Roma": a people's name after "de"
  const ofF = f => (f ? (G.Fac.oa(f) === 'a' ? 'da ' : 'do ') + f.name : 'do inimigo');
  Wz.ofF = ofF;
  const dist = G.dist;
  const st = () => G.S.wz || (G.S.wz = { wars: [], battles: [], armies: [], tension: {}, seq: 1 });
  Wz.state = st;
  const FOOD = 2; // what a soldier eats in a day, from the wagons
  const SAY = { a: 'o', f: 'a' };
  void SAY;

  // ------------------------------ counting people (once a tick) ------------------------------
  const cache = { t: -1, pop: new Map(), adults: new Map(), setAdults: new Map() };
  function refresh() {
    const S = G.S; if (cache.t === S.clock) return; cache.t = S.clock;
    cache.pop.clear(); cache.adults.clear(); cache.setAdults.clear();
    for (const v of S.villagers.values()) {
      if (v.captive) continue; const s = S.settlements.get(v.set); if (!s) continue;
      cache.pop.set(s.fac, (cache.pop.get(s.fac) || 0) + 1);
      if (v.age >= 16 && v.age < 58) { cache.adults.set(s.fac, (cache.adults.get(s.fac) || 0) + 1); cache.setAdults.set(s.id, (cache.setAdults.get(s.id) || 0) + 1); }
    }
  }
  Wz.pop = f => { refresh(); return cache.pop.get(f) || 0; };
  Wz.adults = f => { refresh(); return cache.adults.get(f) || 0; };

  // ------------------------------ lookups ------------------------------
  const wars = () => st().wars;
  Wz.active = () => wars().filter(w => !w.end);
  Wz.get = id => wars().find(w => w.id === id) || null;
  function warOf(a, b) { for (const w of wars()) if (!w.end && ((w.a.includes(a) && w.b.includes(b)) || (w.a.includes(b) && w.b.includes(a)))) return w; return null; }
  Wz.warOf = warOf;
  const sideOf = (w, f) => (w.a.includes(f) ? 'a' : w.b.includes(f) ? 'b' : null);
  const foesOf = (w, f) => { const s = sideOf(w, f); return s === 'a' ? w.b : s === 'b' ? w.a : []; };
  const liveFoes = (w, f) => foesOf(w, f).filter(e => { const x = G.Fac.get(e); return x && x.alive && G.Fac.atWar(f, e); });
  Wz.sideOf = sideOf;
  const armies = () => st().armies;
  Wz.army = id => armies().find(a => a.id === id) || null;
  Wz.armyOfBand = b => (b && b.campaign ? Wz.army(b.campaign) : null);
  Wz.armyOf = v => { let t = v && v.task; if (!t) return null; if (t.type === 'scene' && G.Scene && G.Scene.prevTask) t = G.Scene.prevTask(v) || t; if (t.type === 'muster') return Wz.army(t.army); if (t.type === 'band') { const b = G.War.bands.get(t.band); return b ? Wz.armyOfBand(b) : null; } return null; };
  Wz.battle = id => st().battles.find(b => b.id === id) || null;
  const liveArmies = f => armies().filter(a => a.fac === f && !a.done);
  Wz.liveArmies = liveArmies;
  function nearestTo(list, x, y) { let best = null, bd = 1e9; for (const s of list) { const d = dist(s.cx, s.cy, x, y); if (d < bd) { bd = d; best = s; } } return best; }
  const reach = new Map();
  function reachableAny(fId, tgt) { for (const s of G.Fac.settlementsOf(fId)) if (reachable(s, tgt)) return true; return false; }
  function reachable(a, b) {
    if (!a || !b) return false; const k = a.id + '>' + b.id; const c = reach.get(k);
    if (c && c.day === G.S.day) return c.ok;
    const ok = !!W.findPath(a.cx, a.cy, b.cx, b.cy, true, N * N); reach.set(k, { day: G.S.day, ok }); return ok;
  }

  // ------------------------------ names of places, battles and wars ------------------------------
  const FEM = /^(Lagoa|Cachoeira|Agulha|Garganta|Trilha|Escadaria|Subida|Portela|Queda|Gruta|Lapa|Furna|Toca|Caverna|Serra|Cordilheira|Pedra|Boca|Cova|Fenda|Ponta|Montanha|Colina|Cratera|Ilha|Praia|Baía|Enseada|Torre|Rocha)/;
  const de = n => (FEM.test(n) ? 'da ' : 'do ') + n;
  // what a stretch of ground is called, for a battle fought on it
  function placeOf(x, y) {
    const S = G.S; let pl = null, pd = 13;
    if (G.Relief && G.Relief.places) for (const p of G.Relief.places()) { const d = dist(x, y, p.x, p.y); if (d < pd) { pd = d; pl = p; } }
    if (pl) return { of: de(pl.name), name: pl.name };
    let set = null, sd = 46; for (const s of S.settlements.values()) { const d = dist(x, y, s.cx, s.cy); if (d < sd) { sd = d; set = s; } }
    if (set && sd < (set.radius || 8) + 2) return { of: 'de ' + set.name, name: set.name, set: set.id };
    let water = 0, trees = 0, hi = -1e9, lo = 1e9;
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const px = x + dx, py = y + dy; if (!W.inb(px, py)) continue; const i = W.idx(px, py); if (S.type[i] === T.RIVER) water++; if (S.treeAt[i]) trees++; const h = W.tileH(i); if (h > hi) hi = h; if (h < lo) lo = h; }
    const near = set ? set.name : null;
    if (water >= 4) return { of: near ? 'do Vau de ' + near : 'do Vau', name: near };
    if (trees >= 14) return { of: near ? 'da Mata de ' + near : 'da Mata Escura', name: near };
    if (hi - lo > 1.6) return { of: near ? 'das Colinas de ' + near : 'das Colinas', name: near };
    if (near) return { of: 'dos Campos de ' + near, name: near };
    return { of: 'dos Ermos', name: '' };
  }
  Wz.placeOf = placeOf;
  const ORD = ['', 'Primeira', 'Segunda', 'Terceira', 'Quarta', 'Quinta', 'Sexta', 'Sétima'];
  function nameWar(w) {
    const A = F(w.att), B = F(w.def); const g = w.goals[w.att] || {}; const tg = G.S.settlements.get(g.set);
    let base;
    if (w.ww) base = w.ww;
    else switch (w.reason) {
      case 'reconquista': base = tg ? `a Guerra da Reconquista de ${tg.name}` : `a Guerra da Reconquista`; break;
      case 'secessao': base = B && B.parent === A.id ? `a Guerra dos Rebeldes ${ofF(B)}` : `a Guerra da Independência ${ofF(A)}`; break;
      case 'vassalo': base = `a Guerra das Correntes ${ofF(A)}`; break;
      case 'fome': base = tg ? `a Guerra dos Celeiros de ${tg.name}` : 'a Guerra da Fome'; break;
      case 'riqueza': case 'rota': base = w.good ? `a Guerra ${w.good}` : tg ? `a Guerra de ${tg.name}` : 'a Guerra das Riquezas'; break;
      case 'vinganca': base = `a Guerra do Sangue ${ofF(B)}`; break;
      case 'fronteira': { const mid = midOf(A, B); const pl = mid && placeOf(mid[0], mid[1]); base = pl && pl.name && !pl.set ? `a Guerra ${pl.of}` : tg ? `a Guerra das Terras de ${tg.name}` : 'a Guerra da Fronteira'; break; }
      case 'ambicao': base = tg && G.Fac.capitalOf(B.id) === tg ? `a Guerra pela Coroa ${ofF(B)}` : tg ? `a Guerra de ${tg.name}` : `a Guerra entre ${A.name} e ${B.name}`; break;
      case 'desconfianca': base = `a Guerra do Medo`; break;
      default: base = tg ? `a Guerra de ${tg.name}` : `a Guerra entre ${A.name} e ${B.name}`;
    }
    // the same name again: the second, the third
    const same = wars().filter(o => o !== w && o.base === base).length;
    w.base = base;
    return same ? base.replace(/^a Guerra/, `a ${ORD[same + 1] || 'Nova'} Guerra`) : base;
  }
  function midOf(A, B) { const a = G.Fac.capitalOf(A.id), b = G.Fac.capitalOf(B.id); return a && b ? [(a.cx + b.cx) / 2, (a.cy + b.cy) / 2] : null; }
  function nameBattle(w, x, y) {
    const pl = placeOf(x, y); let n = `a Batalha ${pl.of}`;
    const same = w ? w.battles.map(Wz.battle).filter(b => b && b.base === n).length : 0;
    const base = n; if (same) n = `a ${ORD[same + 1] || 'Nova'} Batalha ${pl.of}`;
    return { name: n, base };
  }
  const ARMY_W = ['do Norte', 'do Sul', 'do Leste', 'do Oeste'];
  function nameArmy(f, front, role, tgt) {
    if (role === 'defesa') return tgt && tgt !== front ? `o Exército de Socorro de ${front.name}` : `a Guarda de ${front.name}`;
    const civ = f.civ || 'classico';
    const host = { romano: 'a Legião', grego: 'a Falange', nordico: 'a Hoste', asteca: 'o Exército Jaguar', egipcio: 'o Exército' }[civ] || 'o Exército';
    const n = liveArmies(f.id).length + armies().filter(a => a.fac === f.id).length;
    if (tgt && front) { const dx = tgt.cx - front.cx, dy = tgt.cy - front.cy; const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 2 : 3) : (dy > 0 ? 1 : 0); if (n <= 1) return `${host} ${ARMY_W[dir]}`; }
    return front ? `${host} de ${front.name}` : `${host} ${ofF(f)}`;
  }
  Wz.armyName = a => a ? a.name : '';

  // ------------------------------ the chronicle of a war ------------------------------
  function event(w, txt, x, y, ic, o) {
    if (!w) return;
    w.events.push({ d: G.S.day, txt, x: x !== undefined ? +(+x).toFixed(1) : undefined, y: y !== undefined ? +(+y).toFixed(1) : undefined });
    if (w.events.length > 60) w.events.splice(4, 1);
    if (!(o && o.quiet)) log(txt, ic || 'war', x, y);
  }
  Wz.event = event;

  // ====================================================================================
  //  TENSION
  // ====================================================================================
  const STAGE = [0, 30, 55, 75];
  Wz.STAGE_TXT = ['calma', 'atrito', 'crise', 'à beira da guerra'];
  function tensionOf(a, b) { const T0 = st().tension; const k = key(a, b); return T0[k] || (T0[k] = { v: 0, stage: 0, day: G.S.day, raids: 0, push: 0, said: {}, why: '' }); }
  Wz.tension = (a, b) => tensionOf(a, b);
  function claims(a, b) { let n = 0, set = null; for (const s of G.S.settlements.values()) if (s.fac === b && s.origFac === a) { n++; set = s; } return { n, set }; }
  function tensionTick(dDays) {
    const S = G.S; const fs = G.Fac.all();
    for (let i = 0; i < fs.length; i++) for (let j = i + 1; j < fs.length; j++) {
      const a = fs[i], b = fs[j]; const r = G.Fac.rel(a.id, b.id); if (!r || !r.met) continue;
      const t = tensionOf(a.id, b.id);
      if (r.st === 'guerra') { t.v = Math.max(t.v, 78); t.stage = 3; continue; }
      const pa = G.Politics.leaderPe(a), pb = G.Politics.leaderPe(b);
      const ca = claims(a.id, b.id), cb = claims(b.id, a.id);
      const touch = G.Fac.touch ? G.Fac.touch[key(a.id, b.id)] || 0 : 0;
      const comp = {
        grudge: (r.grudge || 0) * 0.45,
        raids: Math.min(30, (t.raids || 0) * 7),
        claim: (ca.n || cb.n) ? 24 : 0,
        border: Math.min(16, touch * 1.3),
        covet: (G.Trade && G.Trade.covet ? Math.max((G.Trade.covet(a, b) || {}).w || 0, (G.Trade.covet(b, a) || {}).w || 0) : 0) * 70,
        hunger: (a.stock.food < Wz.pop(a.id) * 0.45 || b.stock.food < Wz.pop(b.id) * 0.45) ? 12 : 0,
        ruler: Math.max(0, Math.max(pa.agg + pa.amb * 0.5, pb.agg + pb.amb * 0.5) - 0.75) * 34,
        will: t.push || 0,
      };
      let target = 0; let why = ''; let wv = 0;
      for (const k in comp) { target += comp[k]; if (comp[k] > wv) { wv = comp[k]; why = k; } }
      target -= Math.max(0, r.op || 0) * 0.3 + (r.friend || 0) * 0.2;
      if (r.st === 'alianca' || r.st === 'vassalo') target *= 0.25;
      if (r.st === 'tregua') target *= 0.4;
      if (S.divinePeace > 0) target = 0;
      target = G.clamp(target, 0, 100);
      t.v += (target - t.v) * Math.min(1, dDays * 0.9);
      t.raids *= Math.exp(-dDays * 0.45); t.push *= Math.exp(-dDays * 0.35);
      t.why = why; t.claim = (ca.set || cb.set) ? (ca.set || cb.set).id : 0; t.claimBy = ca.n ? a.id : cb.n ? b.id : 0;
      let stage = 0; for (let s = 3; s >= 1; s--) if (t.v >= STAGE[s]) { stage = s; break; }
      if (stage > t.stage) { t.stage = stage; t.day = S.day; signs(a, b, t, stage); }
      else if (stage < t.stage && t.v < STAGE[t.stage] - 8) { t.stage = stage; t.day = S.day; }
      // the crisis: both get ready
      if (t.stage >= 2) { for (const f of [a, b]) { f.prep = { vs: f === a ? b.id : a.id, until: S.day + 3, brink: t.stage >= 3 }; } }
    }
  }
  // what a watchful god sees before a war: the signs
  const BORDER = ['brigaram pelas mesmas pastagens', 'disputaram a mesma fonte', 'derrubaram os marcos um do outro', 'trocaram pedradas por um campo de trigo'];
  function signs(a, b, t, stage) {
    const S = G.S; const k = key(a.id, b.id) + ':' + stage; const said = t.said || (t.said = {});
    if (said[k] && S.day - said[k] < 8) return; said[k] = S.day;
    const ca = G.Fac.capitalOf(a.id), cb = G.Fac.capitalOf(b.id); const mid = ca && cb ? [(ca.cx + cb.cx) / 2, (ca.cy + cb.cy) / 2] : null;
    const pl = mid ? placeOf(mid[0], mid[1]) : null;
    const big = Wz.pop(a.id) >= Wz.pop(b.id) ? a : b; const small = big === a ? b : a;
    if (stage === 1) {
      const claim = t.claim && S.settlements.get(t.claim);
      const txt = t.why === 'claim' && claim ? `Em ${claim.name}, que já foi ${claim.origFac === a.id ? 'de ' + a.name : 'de ' + b.name}, os velhos ainda falam a língua de antes. Nem ${a.name} nem ${b.name} esqueceram.`
        : t.why === 'raids' ? `Gado roubado, um celeiro queimado: na fronteira entre ${a.name} e ${b.name} ninguém dorme tranquilo.`
        : t.why === 'border' ? `Pastores de ${a.name} e de ${b.name} ${pick(BORDER)}${pl && pl.name ? ' perto ' + pl.of : ''}.`
        : t.why === 'covet' ? `Os mercadores de ${small.name} voltam de ${big.name} falando das riquezas que não podem comprar.`
        : t.why === 'hunger' ? `Os celeiros de ${a.stock.food < b.stock.food ? a.name : b.name} estão quase vazios — e os do vizinho, cheios.`
        : t.why === 'ruler' ? `${G.Politics.styled(big, G.Politics.ruler(big))} fala de ${small.name} com desprezo diante da corte.`
        : `As relações entre ${a.name} e ${b.name} esfriam.`;
      log(txt, 'tension', mid ? mid[0] : undefined, mid ? mid[1] : undefined);
    } else if (stage === 2) {
      const who = t.claimBy ? F(t.claimBy) : big;
      const lines = [`${who.name} reforça as patrulhas na fronteira com ${(who === a ? b : a).name}.`, `Os ferreiros de ${who.name} trabalham dia e noite: lanças, espadas, pontas de flecha.`, `Os celeiros de ${who.name} estão sendo enchidos, e ninguém diz para quê.`, `Mensageiros de ${who.name} visitam os aliados, de porta em porta.`];
      log(`Crise entre ${a.name} e ${b.name}. ${pick(lines)}`, 'tension', mid ? mid[0] : undefined, mid ? mid[1] : undefined);
      G.UI && G.UI.notice(`Crise entre ${a.name} e ${b.name}`, 'war');
    } else {
      const who = big; const front = cb && ca ? nearestTo(G.Fac.settlementsOf(who.id), (who === a ? cb : ca).cx, (who === a ? cb : ca).cy) : null;
      log(`${who.name} junta homens${front ? ' em ' + front.name : ''}. Em ${(who === a ? b : a).name}, já se fala abertamente em guerra.`, 'tension', front ? front.cx : undefined, front ? front.cy : undefined);
      G.UI && G.UI.notice(`${a.name} e ${b.name} à beira da guerra`, 'war');
    }
    G.Stories && G.Stories.signal('tension', { a: a.id, b: b.id, stage, why: t.why });
  }
  // politics asks: may this ruler declare war now? — or is it still too soon (the crisis must ripen)
  Wz.ready = function (a, b, reason, want) {
    const S = G.S; const t = tensionOf(a.id, b.id); const pa = G.Politics.leaderPe(a);
    // a surprise attack: a cruel and fierce ruler, much the stronger
    const ratio = G.Politics.strength(a.id) / Math.max(1, G.Politics.strength(b.id));
    if (pa.agg > 0.78 && pa.cru > 0.55 && ratio > 1.5 && G.R() < 0.12) { t.surprise = S.day; return true; }
    if (t.stage >= 2 && S.day - t.day >= 0.6) return true;
    if (reason === 'secessao' || reason === 'vassalo') return t.stage >= 1;
    // not yet: the ruler's will pushes the temperature up (speeches, a closed border)
    t.push = Math.min(45, (t.push || 0) + 9 * Math.max(0.3, want || 0.5));
    return false;
  };
  Wz.preparing = fid => { const f = F(fid); return !!(f && f.prep && f.prep.until > G.S.day); };
  Wz.raided = function (a, b) { const t = tensionOf(a, b); t.raids = (t.raids || 0) + 1; };

  // ====================================================================================
  //  A WAR BEGINS
  // ====================================================================================
  const CAUSE = {
    reconquista: (A, B, tg) => `${A.name} quer de volta ${tg ? tg.name : 'a cidade que perdeu'}`,
    secessao: (A, B) => (B.parent === A.id ? `${B.name} rompeu com ${A.name}, e ${A.name} não aceita` : `${A.name} quer ser livre de ${B.name}`),
    vassalo: (A, B) => `${A.name} não quer mais pagar tributo ${G.Fac.oa(B) === 'a' ? 'à' : 'ao'} ${B.name}`,
    fome: (A, B) => `fome: os celeiros ${ofF(A)} estão vazios, e os ${ofF(B)} cheios`,
    riqueza: (A, B, tg, w) => `as riquezas ${ofF(B)}${w.good ? ' — ' + w.good.replace(/^(do|da|dos|das) /, '') : ''}, que ${A.name} cobiça`,
    rota: (A, B) => `as caravanas ${ofF(A)}, roubadas nas estradas ${ofF(B)}`,
    vinganca: (A, B) => `vingança: o sangue que ${B.name} derramou ainda não foi pago`,
    fronteira: (A, B, tg) => `a fronteira: ${A.name} e ${B.name} disputam as terras ${tg ? 'em volta de ' + tg.name : 'entre os dois'}`,
    ambicao: (A, B, tg) => `a ambição de ${G.Politics.styled(A, G.Politics.ruler(A))}, que quer ${tg ? tg.name : 'mais terra'}`,
    desconfianca: (A, B) => `medo: ${B.name} está ficando forte demais`,
    divina: () => 'uma fúria mandada pelos deuses',
    alianca: (A, B) => `uma aliança: ${A.name} entrou na guerra contra ${B.name}`,
    mundial: () => 'a guerra que engoliu o mundo',
    antiga: (A, B) => `rixas antigas entre ${A.name} e ${B.name}, que ninguém mais lembra como começaram`,
    traicao: (A, B) => `a traição: ${A.name} rompeu a aliança com ${B.name}`,
  };
  const GOAL = {
    conquista: (A, B, s) => `tomar ${s ? s.name : 'terras ' + ofF(B)}`,
    reconquista: (A, B, s) => `retomar ${s ? s.name : 'o que perdeu'}`,
    submeter: (A, B) => `submeter os rebeldes ${ofF(B)}`,
    independencia: (A, B) => `livrar-se ${ofF(B)}`,
    saque: (A, B, s) => `saquear os celeiros ${s ? 'de ' + s.name : 'do inimigo'}`,
    enfraquecer: (A, B) => `quebrar o poder ${ofF(B)}`,
    riqueza: (A, B, s) => `tomar ${s ? s.name : 'as terras ricas ' + ofF(B)}`,
    fronteira: (A, B, s) => `ficar com as terras ${s ? 'de ' + s.name : 'da fronteira'}`,
    defesa: (A, B, s) => `defender ${s ? s.name : 'suas terras'} ${ofF(B)}`,
    ajuda: (A, B) => `ajudar os aliados contra ${B.name}`,
  };
  const IMP = { saque: 1, enfraquecer: 1, fronteira: 2, riqueza: 2, conquista: 2, reconquista: 2, submeter: 3, independencia: 2, ajuda: 1, defesa: 2 };
  Wz.GOAL = GOAL;
  function goalFor(A, B, reason) {
    const setsB = G.Fac.settlementsOf(B.id); if (!setsB.length) return { k: 'enfraquecer', set: 0, imp: 1 };
    const capA = G.Fac.capitalOf(A.id) || G.Fac.settlementsOf(A.id)[0]; const capB = G.Fac.capitalOf(B.id);
    const near = capA ? nearestTo(setsB, capA.cx, capA.cy) : setsB[0];
    let k = 'conquista', set = null;
    if (reason === 'reconquista') { k = 'reconquista'; set = setsB.find(s => s.origFac === A.id) || null; if (!set && G.Stories && G.Stories.warTarget) { const id = G.Stories.warTarget(A, B); set = id ? G.S.settlements.get(id) : null; } }
    else if (reason === 'secessao' && B.parent === A.id) { k = 'submeter'; set = capB; }
    else if (reason === 'secessao' || reason === 'vassalo') { k = 'independencia'; set = near; }
    else if (reason === 'fome') { k = 'saque'; set = setsB.slice().sort((p, q) => G.Village.pop(q.id) - G.Village.pop(p.id) + (dist(p.cx, p.cy, capA.cx, capA.cy) - dist(q.cx, q.cy, capA.cx, capA.cy)) * 0.5)[0]; }
    else if (reason === 'vinganca' || reason === 'desconfianca') { k = 'enfraquecer'; set = near; }
    else if (reason === 'riqueza' || reason === 'rota') { k = 'riqueza'; set = near; }
    else if (reason === 'fronteira') { k = 'fronteira'; set = near; }
    else if (reason === 'alianca') { k = 'ajuda'; set = near; }
    else { const strong = G.Politics.strength(A.id) > G.Politics.strength(B.id) * 1.6; set = strong && capB && capA && dist(capA.cx, capA.cy, capB.cx, capB.cy) < dist(capA.cx, capA.cy, near.cx, near.cy) * 1.6 ? capB : near; }
    if (!set) set = near;
    let imp = IMP[k] || 2; if (set && capB === set && k !== 'saque') imp = 3;
    return { k, set: set ? set.id : 0, imp, txt: GOAL[k](A, B, set) };
  }
  function newSide(f) { return { mob: 0, dead: 0, wounded: 0, captured: 0, deserted: 0, won: 0, lost: 0, taken: 0, lostSets: 0, exh: 0, pop0: Wz.pop(f.id), levies: 0 }; }
  Wz.onDeclare = function (a, b, reason) {
    if (!a || !b) return null;
    const S = G.S;
    if (warOf(a.id, b.id)) return null;
    // an ally comes in: it joins the war already burning
    // (or a false friend changes sides: it joins the war against the one it swore to help)
    if (reason === 'alianca' || reason === 'traicao') {
      for (const w of Wz.active()) {
        const sb = sideOf(w, b.id); if (!sb) continue;
        const mine = sb === 'a' ? w.b : w.a; if (mine.includes(a.id)) return w;
        mine.push(a.id); w.side[a.id] = newSide(a); w.goals[a.id] = goalFor(a, b, reason === 'traicao' ? 'ambicao' : 'alianca');
        const nm = w.name.replace(/^(a|o) /, (m, x) => x === 'a' ? 'na ' : 'no ');
        if (reason === 'traicao') event(w, `Traição! ${a.name} rompeu a aliança com ${b.name} e entrou ${nm} ao lado de ${F(mine[0]).name}.`, undefined, undefined, 'war');
        else event(w, `${a.name} honrou a aliança e entrou ${nm}, ao lado de ${F(mine[0]).name}.`, undefined, undefined, 'ally');
        return w;
      }
    }
    return createWar(a, b, reason);
  };
  function createWar(a, b, reason, o) {
    const S = G.S; o = o || {};
    const t0 = tensionOf(a.id, b.id);
    const w = { id: st().seq++, start: S.day, t0: S.clock, end: 0, a: [a.id], b: [b.id], ten: { v: Math.round(t0.v), stage: t0.stage, since: t0.day }, att: a.id, def: b.id, reason, goals: {}, side: {}, battles: [], sieges: [], events: [], armies: [], treaty: null, ww: o.ww || '', surprise: tensionOf(a.id, b.id).surprise === S.day };
    if ((reason === 'riqueza' || reason === 'rota') && G.Trade && G.Trade._whyK && G.Eco) { const k = G.Trade._whyK; const nm = G.Riches && G.Riches.is(k) ? G.Riches.the(k) : G.Eco.name(k); w.good = nm ? nm.replace(/^o /, 'do ').replace(/^a /, 'da ').replace(/^os /, 'dos ').replace(/^as /, 'das ') : ''; if (w.good && !/^(do|da|dos|das) /.test(w.good)) w.good = 'de ' + w.good; }
    w.side[a.id] = newSide(a); w.side[b.id] = newSide(b);
    w.goals[a.id] = goalFor(a, b, reason);
    const tg = S.settlements.get(w.goals[a.id].set);
    w.goals[b.id] = { k: 'defesa', set: tg ? tg.id : 0, imp: tg && G.Fac.capitalOf(b.id) === tg ? 3 : 2, txt: GOAL.defesa(b, a, tg) };
    w.scale = Math.max(w.goals[a.id].imp, 1);
    w.cause = { k: reason, txt: (CAUSE[reason] || CAUSE.desconfianca)(a, b, tg, w) };
    if (o.ww) w.cause.txt = o.why || w.cause.txt;
    w.name = nameWar(w);
    st().wars.push(w);
    const x = tg ? tg.cx : undefined, y = tg ? tg.cy : undefined;
    event(w, `${cap1(w.name)} começou${w.surprise ? ' com um ataque de surpresa' : ''}: ${a.name} contra ${b.name}. A causa: ${w.cause.txt}. ${a.name} quer ${w.goals[a.id].txt}.`, x, y, 'war');
    G.Stories && G.Stories.signal('warDeclared', { war: w.id, a: a.id, b: b.id, reason, x, y });
    w.planT = 0;
    return w;
  }
  Wz.createWar = createWar;
  // a war that began without a declaration (the world war, a god's fury): it still has a name and a cause
  Wz.ensure = function (a, b) {
    if (!a || !b || warOf(a.id, b.id)) return;
    const ww = G.WorldWar && G.WorldWar.active();
    if (ww) {
      const sa = G.WorldWar.sideOf(a.id), sb = G.WorldWar.sideOf(b.id);
      let w = Wz.active().find(x => x.ww === ww.name);
      if (!w) { w = createWar(a, b, 'mundial', { ww: ww.name, why: G.WorldWar.REASONS[ww.reason] ? G.WorldWar.REASONS[ww.reason].why : '' }); w.wwBlocs = ww.blocs; return; }
      const add = (f, s) => { const arr = s === 'a' ? w.a : w.b; if (!arr.includes(f.id) && !w.a.includes(f.id) && !w.b.includes(f.id)) { arr.push(f.id); w.side[f.id] = newSide(f); w.goals[f.id] = goalFor(f, s === 'a' ? F(w.b[0]) : F(w.a[0]), 'mundial'); } };
      const s0a = G.WorldWar.sideOf(w.a[0]);
      add(a, sa === s0a ? 'a' : 'b'); add(b, sb === s0a ? 'a' : 'b');
      return;
    }
    createWar(a, b, 'antiga');
  };

  // ====================================================================================
  //  MOBILIZATION
  // ====================================================================================
  const LEVY = { tribo: 0.32, chefia: 0.36, reino: 0.42, imperio: 0.5, teocracia: 0.4, tirania: 0.55, conselho: 0.38, livre: 0.3, parlamento: 0.4, feudal: 0.48, republica: 0.42, democracia: 0.36, oligarquia: 0.32, ditadura: 0.58, comuna: 0.34, anarquia: 0.22 };
  const SHARE = { 1: 0.18, 2: 0.32, 3: 0.48 };
  function canServe(v) { return !v.captive && v.age >= 16 && v.age < 58 && v.hp >= 55 && !(v.preg > 0) && !v.held && !v.air && !v.aboard && !v.ug && !(v.deserter && G.S.day - v.deserter < 6) && !(v.task && (v.task.pri >= 4 || v.task.type === 'band' || v.task.type === 'muster' || v.task.type === 'combat' || v.task.type === 'jail' || v.task.type === 'condemned' || v.task.type === 'scene' || v.task.type === 'envoy' || v.task.type === 'trade')); }
  // each town keeps some at home: more behind walls, more at the capital
  function garrisonOf(set, f) {
    const A = cache.setAdults.get(set.id) || 0; const w = G.Siege && G.Siege.wallOf(set.id);
    const walled = !!(w && w.fac === set.fac && (w.done || w.built > w.tiles.length * 0.6));
    return Math.ceil(A * (walled ? 0.16 : 0.08)) + (G.Fac.capitalOf(f.id) === set ? 2 : 0);
  }
  // how many a people sends: the aims, the regime, the ruler, the granary, the weariness
  function levySize(f, imp, adults) {
    const pe = G.Politics.leaderPe(f);
    let share = SHARE[imp] * ((LEVY[f.gov] || 0.38) / 0.38) * (0.85 + pe.agg * 0.3) * Math.min(1.3, G.Civ.t(f.id, 'war') || 1);
    share *= 1 - Math.min(0.6, (f.weariness || 0) / 160);
    let n = Math.round(adults * Math.min(0.58, share));
    // an army that cannot be fed is not raised: two days of food in the wagons at the very least
    const food = f.stock.food || 0; const maxFed = Math.floor(food * 0.6 / (FOOD * 2));
    if (n > maxFed) n = Math.max(Math.min(n, 6), maxFed);
    return n;
  }
  Wz.levySize = levySize;
  function musterSpot(front, tgt) {
    const dir = tgt ? Math.atan2(tgt.cy - front.cy, tgt.cx - front.cx) : 0;
    const og = G.Army && G.Army.openGround ? G.Army.openGround(front.cx, front.cy, dir, (front.radius || 8) * 0.6 + 2, (front.radius || 8) + 6) : null;
    return og || W.nearestLand(front.cx + Math.cos(dir) * 4, front.cy + Math.sin(dir) * 4, 4) || [front.cx, front.cy];
  }
  // the call to arms: a levy walks to the rally point
  function mobilize(w, f, role, tgt, o) {
    const S = G.S; o = o || {}; refresh();
    const own = G.Fac.settlementsOf(f.id); if (!own.length || !tgt) return null;
    const relief = role === 'defesa' && o.relief ? o.relief : null;
    // (an army that will cross the sea gathers at a port: o.front, o.at)
    const front = o.front || relief || (role === 'defesa' ? tgt : own.filter(s => reachable(s, tgt)).sort((p, q) => dist(p.cx, p.cy, tgt.cx, tgt.cy) - dist(q.cx, q.cy, tgt.cx, tgt.cy))[0]);
    if (!front) return null;
    const adults = Wz.adults(f.id);
    const g = w.goals[f.id] || { imp: 2 };
    const imp = relief ? 3 : role === 'defesa' ? Math.max(2, g.set === tgt.id ? g.imp || 2 : 2) : g.imp || 2;
    let n = o.n || levySize(f, imp, adults);
    if (o.reinforce) n = Math.round(n * 0.6);
    n = Math.min(n, 260); // (beyond this a realm raises a second army, not a bigger one)
    if (o.minN && n < o.minN) return null; // (a relief too small to break the siege is not sent to die)
    // the garrisons first: who stays at home
    const keep = new Set();
    for (const s of own) {
      const gN = role === 'defesa' && s === tgt ? 0 : garrisonOf(s, f);
      const best = [...S.villagers.values()].filter(v => v.set === s.id && canServe(v)).sort((p, q) => (q.role === 'guerreiro') - (p.role === 'guerreiro') || q.courage - p.courage).slice(0, gN);
      for (const v of best) keep.add(v.id);
    }
    const muster = o.at ? o.at.slice() : role === 'defesa' && !relief ? (W.nearestLand(front.cx, front.cy, 4) || [front.cx, front.cy]) : musterSpot(front, tgt);
    const land = W.landIds ? W.landIds() : null; const myLand = land ? land[W.idx(muster[0], muster[1])] : 0;
    const cands = [];
    for (const v of S.villagers.values()) {
      if (fid(v) !== f.id || keep.has(v.id) || !canServe(v)) continue;
      if (v.id === f.leader && role !== 'defesa' && !(G.Politics.leaderPe(f).agg > 0.7 && G.R() < 0.5)) continue;
      if (land && land[W.idx(v.x, v.y)] !== myLand) continue;
      const d = dist(v.x, v.y, muster[0], muster[1]); if (d > 70) continue;
      const wgt = (v.role === 'guerreiro' ? 4 : v.role === 'cacador' ? 1.6 : 0) + v.courage + (v.fury > 0 ? 2 : 0) + (G.Stories ? G.Stories.warPull(v, liveFoes(w, f.id)[0]) : 0) - d / 60 + (v.vet || 0) * 0.3;
      cands.push([wgt, v]);
    }
    cands.sort((p, q) => q[0] - p[0]);
    n = Math.min(n, cands.length);
    if (n < (role === 'defesa' ? 4 : 8)) return null; // (fewer than this is a raid, not an army)
    const ms = cands.slice(0, n).map(c => c[1]);
    const a = { id: st().seq++, war: w.id, fac: f.id, role, front: front.id, target: tgt.id, muster, members: ms.map(v => v.id), start: n, pop0: Wz.pop(f.id), called: S.clock, day: S.day, phase: 'mobilizar', gen: 0, band: 0, food: 0, morale: 70, name: '', done: false, battles: [], dead: 0, deserted: 0, n0: n, reinforce: !!o.reinforce };
    a.name = nameArmy(f, front, role, tgt);
    armies().push(a); w.armies.push(a.id);
    w.side[f.id] = w.side[f.id] || newSide(f); w.side[f.id].mob += n; w.side[f.id].levies++;
    ms.forEach((v, k) => { G.Vg.endTask(v); v.sleeping = false; G.Vg.setTask(v, { type: 'muster', army: a.id, k, pri: 3.15, kind: 'muster', st: 0 }); v.mob = (v.mob || 0) + 1; G.Life && G.Life.bio(v, 'mustered', F(liveFoes(w, f.id)[0]) ? F(liveFoes(w, f.id)[0]).name : '', w.name); });
    const kindTxt = relief ? `${f.name} junta um exército de socorro para ${tgt.name}: ${n} se reúnem em ${front.name}` : role === 'defesa' ? `${front.name} chama seus defensores: ${n} pegam em armas` : o.reinforce ? `Segunda leva: ${f.name} chama mais ${n} para a guerra` : `${f.name} convoca ${n} para a guerra`;
    if (relief) a.relief = 1;
    event(w, `${kindTxt}${role === 'defesa' ? '' : `. O ponto de reunião é ${front.name}`}.`, muster[0], muster[1], 'army');
    G.Stories && G.Stories.signal('mobilized', { war: w.id, army: a.id, fac: f.id, ids: a.members.slice(), x: muster[0], y: muster[1] });
    return a;
  }
  Wz.mobilize = mobilize;
  Wz.mobilizeAt = (w, f, tgt, front, at, n, o) => mobilize(w, f, 'campanha', tgt, Object.assign({}, o || {}, { front, at, n }));
  // a soldier on the way to the rally point, and waiting there
  function runMuster(v, t, dt, H) {
    const a = Wz.army(t.army); if (!a || a.phase !== 'mobilizar') return H.end(v);
    if (!t.spot) {
      const k = t.k || 0; const ang = k * 2.39996; const r = 0.8 + Math.sqrt(k) * 0.55;
      const p = [a.muster[0] + Math.cos(ang) * r, a.muster[1] + Math.sin(ang) * r * 0.8];
      t.spot = W.walkableXY(p[0], p[1]) ? p : (W.nearestLand(p[0], p[1], 3) || a.muster.slice());
    }
    if (t.st === 0) { if (t.age < (t.k % 16) * 0.2) { v.act = 'talk'; return; } if (!H.goto(v, t.spot[0], t.spot[1], false, N * N) && !H.goto(v, t.spot[0], t.spot[1], true, N * N)) { t.fail = (t.fail || 0) + 1; if (t.fail > 3) return H.end(v); return; } t.st = 1; return; }
    if (t.st === 1) {
      v.act = ''; if (H.move(v, dt, 1.08) || dist(v.x, v.y, t.spot[0], t.spot[1]) < 0.4) { t.st = 2; v.actT = 0; t.eq = equip(v, a) ? 1.6 : 0; }
      else if (t.age > 160) { t.st = 2; }
      return;
    }
    v.moving = false; v.path = null;
    if (t.eq > 0) { t.eq -= dt; v.act = 'brandish'; return; }
    G.faceTo(v, a.muster[0] - v.x + 0.01, a.muster[1] - v.y);
    v.act = t.k % 6 === 0 ? 'drill' : t.k % 4 === 1 ? 'sit' : t.k % 5 === 2 ? 'talk' : 'guard';
  }
  // the armoury: a levy takes a weapon (without one, a club and a sickle)
  function equip(v, a) {
    const f = F(a.fac); if (!f || v._armed || v.role === 'guerreiro') { if (v.role === 'guerreiro') v._armed = true; return false; }
    if ((f.stock.armas || 0) >= 1) { f.stock.armas -= 1; v._armed = true; v._levy = true; G.FX && G.FX.chips && G.FX.chips(v.x, v.y, '#b8bcc4'); G.Audio && G.Audio.at(v.x, v.y, 'clang', false, 0.3); return true; }
    return false;
  }
  // the levy is (mostly) gathered: the companies form, the wagons are loaded, a commander is named
  function formArmy(a) {
    const S = G.S; const w = Wz.get(a.war); const f = F(a.fac); const tgt = S.settlements.get(a.target); const front = S.settlements.get(a.front);
    const ms = a.members.map(P).filter(v => v && v.task && v.task.type === 'muster' && v.task.army === a.id && (v.task.st === 2 || dist(v.x, v.y, a.muster[0], a.muster[1]) < 22));
    // the late ones go back to their fields
    for (const id of a.members) { const v = P(id); if (v && v.task && v.task.type === 'muster' && v.task.army === a.id && !ms.includes(v)) G.Vg.endTask(v); }
    if (!w || w.end || !f || !tgt || ms.length < 3) { a.done = true; a.phase = 'dispersado'; for (const v of ms) G.Vg.endTask(v); return; }
    const th = a.role === 'defesa' ? Wz.threatTo(tgt.id) : null;
    const en = F(th ? th.fac : liveFoes(w, f.id).includes(tgt.fac) ? tgt.fac : liveFoes(w, f.id)[0]);
    if (!en) { a.done = true; a.phase = 'dispersado'; for (const v of ms) G.Vg.endTask(v); return; }
    let b;
    if (a.role === 'defesa') { const tb = th && th.band ? G.War.bands.get(th.band) : null; b = G.Army.raiseDefense(tgt, f, ms, en, tb, { relief: !!a.relief, from: a.muster }); }
    else {
      const g = w.goals[f.id] || {}; const bg = g.k === 'saque' || g.k === 'enfraquecer' ? G.War.chooseGoal(f, en, tgt, ms.length) : 'conquista';
      b = G.War.makeBand(f, en, tgt, ms, bg === 'defesa' ? 'conquista' : bg, { from: front ? front.id : tgt.id });
      const ang = Math.atan2(tgt.cy - a.muster[1], tgt.cx - a.muster[0]); const rad = (tgt.radius || 8) * 0.8;
      const stage = W.randomNear(tgt.cx - Math.cos(ang) * rad, tgt.cy - Math.sin(ang) * rad, 2) || W.nearestLand(tgt.cx, tgt.cy, 4) || [tgt.cx, tgt.cy];
      b.rx = a.muster[0]; b.ry = a.muster[1]; b.tx = stage[0]; b.ty = stage[1]; b.st = 'reunir';
      b.campaign = a.id;
      G.Army.organize(b, ms, f, en, tgt, front || tgt, {});
    }
    if (!b) { a.done = true; a.phase = 'dispersado'; for (const v of ms) G.Vg.endTask(v); return; }
    b.campaign = a.id; a.band = b.id; a.gen = b.army ? b.army.gen : ms[0].id; a.phase = a.role === 'defesa' ? 'posicao' : 'reunir'; a.start = ms.length; a.formed = S.clock; a.members = ms.map(v => v.id);
    // the wagons: food for some days (what the granary can spare)
    const need = a.role === 'defesa' && !a.relief ? 0 : ms.length * FOOD * 3; const take = Math.floor(Math.min((f.stock.food || 0) * 0.55, need));
    f.stock.food -= take; a.food = take; a.wagons = Math.max(1, Math.ceil(ms.length / 28));
    a.comp = composition(b);
    const gen = P(a.gen); const T0 = G.Army.TITLES[f.civ || 'classico'] || G.Army.TITLES.classico;
    a.genName = gen ? gen.name : ''; a.genTitle = gen ? T0.gen[gen.g === 'f' ? 1 : 0] : '';
    const ready = /^as /.test(a.name) ? 'prontas' : /^os /.test(a.name) ? 'prontos' : /^a /.test(a.name) ? 'pronta' : 'pronto';
    if (b.army) b.army.intro = `${cap1(a.name)} está ${ready}: ${ms.length} soldados (${compTxt(a.comp)}) sob ${a.genTitle.toLowerCase()} ${a.genName}. Leva comida para ${Math.max(1, Math.round(supplyDays(a)))} dias. Missão: ${a.role === 'defesa' ? 'defender ' + tgt.name : (w.goals[f.id] || {}).txt || 'atacar ' + tgt.name}.`;
    if (gen) G.Life && G.Life.bio(gen, 'command', a.name, w.name);
    if (a.role === 'defesa') event(w, `${cap1(a.name)} toma posição: ${ms.length} ${a.relief ? 'soldados' : 'defensores'} sob ${a.genTitle.toLowerCase()} ${a.genName}.`, a.muster[0], a.muster[1], 'army', { quiet: true });
    G.Stories && G.Stories.signal('armyFormed', { war: w.id, army: a.id, gen: a.gen, n: ms.length });
  }
  function composition(b) {
    const c = {}; if (!b || !b.army) { c.milicia = b ? b.members.length : 0; return c; }
    for (const co of b.army.cos) c[co.kind] = (c[co.kind] || 0) + co.members.length;
    return c;
  }
  Wz.composition = a => { const b = a && a.band && G.War.bands.get(a.band); return b ? composition(b) : a ? a.comp || {} : {}; };
  function compTxt(c) { return Object.keys(c).filter(k => c[k]).map(k => `${c[k]} ${(G.Army.UNIT[k] || { name: k }).name.toLowerCase()}`).join(', '); }
  Wz.compTxt = compTxt;
  function supplyDays(a) { const n = a.band && G.War.bands.get(a.band) ? G.War.bands.get(a.band).members.length : a.members.length; return n ? a.food / (n * FOOD) : 0; }
  Wz.supplyDays = supplyDays;
  // a soldier on campaign eats from the wagons; near home, from the granary; in enemy land, what can be foraged
  // (null: not on campaign, eat as anyone in the field does; true: fed; false: the wagons are empty)
  Wz.provision = function (v) {
    const a = Wz.armyOf(v); if (!a || a.phase === 'mobilizar' || a.role === 'defesa' && a.food < 1) return null;
    if (a.food >= 1) { a.food -= 1; return true; }
    const f = F(a.fac); const home = G.S.settlements.get(v.set);
    if (f && home && home.fac === f.id && dist(v.x, v.y, home.cx, home.cy) < (home.radius || 8) + 6 && f.stock.food >= 1) { f.stock.food -= 1; return true; }
    a.hungry = G.S.clock; return false;
  };

  // ====================================================================================
  //  THE CAMPAIGN, every half second
  // ====================================================================================
  function armyTick(a, dt) {
    const S = G.S; const w = Wz.get(a.war); const f = F(a.fac);
    if (!f || !f.alive) { a.done = true; a.phase = 'dispersado'; return; }
    if (a.phase === 'mobilizar') {
      const ms = a.members.map(P).filter(v => v && v.task && v.task.type === 'muster' && v.task.army === a.id);
      const there = ms.filter(v => v.task.st === 2).length; const age = S.clock - a.called;
      // (someone still at the door saying goodbye: the army waits for them, a while)
      const held = a.members.some(id => { const v = P(id); const pt = v && G.Scene && G.Scene.prevTask && G.Scene.prevTask(v); return pt && pt.type === 'muster' && pt.army === a.id; });
      if (held && age < DAY() * 0.6) return;
      if (ms.length < 3 && age > DAY() * 0.2) { a.done = true; a.phase = 'dispersado'; for (const v of ms) G.Vg.endTask(v); return; }
      if ((there >= ms.length * 0.85 && age > 12) || (age > DAY() * 0.5 && there >= ms.length * 0.65) || age > DAY() * 0.8) { if (a.sea && !a.beach && G.Fleets) { if (G.Fleets.embark(a)) return; if (age < DAY() * 1.5) return; a.done = true; a.phase = 'dispersado'; for (const v of ms) G.Vg.endTask(v); return; } formArmy(a); }
      return;
    }
    // at sea, the fleet carries the army (there are no wagons, no desertions: there is nowhere to run)
    if (a.phase === 'embarque' || a.phase === 'travessia') { const fl = G.Fleets && G.Fleets.get(a.sea); if (!fl || !G.Fleets.live(fl)) { a.done = true; a.phase = 'dispersado'; } return; }
    const b = a.band ? G.War.bands.get(a.band) : null;
    if (!b) { if (!a.done) { a.done = true; if (a.phase !== 'retorno' && a.phase !== 'dispersado') a.phase = 'dispersado'; homecoming(a); } return; }
    a.members = b.members.slice();
    if (b.army) { a.gen = b.army.gen; const ms = b.army.cos.filter(c => !c.rout); a.morale = ms.length ? Math.round(ms.reduce((s, c) => s + c.morale, 0) / ms.length) : 0; }
    a.phase = b.st === 'retorno' ? (b.retreat ? 'retirada' : 'retorno') : b.army ? ({ reunir: 'reunir', marcha: 'marcha', acampar: 'acampado', batalha: 'batalha', cerco: 'cerco', cercar: 'cerco', assalto: 'assalto', invadir: 'assalto', guerrilha: 'guerrilha', posicao: 'posicao' }[b.army.phase] || b.army.phase) : b.st;
    if (a.phase === 'retorno' || a.phase === 'retirada') return;
    // the wagons and the march
    a.t = (a.t || 0) + dt;
    if (a.t >= DAY() * 0.05) {
      const dd = a.t / DAY(); a.t = 0;
      const lead = P(a.gen) || P(b.members[0]);
      // forage and plunder in enemy land: the fields around a town feed an army for a while
      if (lead && a.role !== 'defesa') {
        const own = G.Fac.ownerAt(lead.x | 0, lead.y | 0);
        if (own && own !== f.id && G.Fac.atWar(own, f.id)) { const ef = F(own); if (ef && ef.stock.food > 4) { const k = Math.min(ef.stock.food * 0.04 * dd * 20, b.members.length * FOOD * dd * 0.7); ef.stock.food -= k; a.food += k; a.forage = (a.forage || 0) + k; } }
        else if (own === f.id) { const k = Math.min((f.stock.food || 0) * 0.08, b.members.length * FOOD * dd); f.stock.food -= k; a.food += k; }
      }
      // hunger in the ranks: morale falls, men slip away
      const starving = a.food < 1 && S.clock - (a.hungry || -1e9) < DAY() * 0.2;
      if (starving && b.army) for (const co of b.army.cos) co.morale -= 4 * dd * 20;
      desertion(a, b, w, dd, starving);
      // a siege that eats itself: lift it or storm the walls
      if (starving && b.army && b.army.phase === 'cerco' && b.army.siege) b.army.siege.impatient = true;
      if (starving && a.food <= 0 && (a.starveT = (a.starveT || 0) + dd) > 0.6 && b.st !== 'retorno') { b.st = 'retorno'; b.t = 0; b.retreat = true; event(w, `Sem comida, ${a.name} desistiu da campanha e voltou para casa.`, lead ? lead.x : undefined, lead ? lead.y : undefined, 'army'); }
    }
  }
  // men leave in the night: hunger, fear, a long war, a bad commander
  function desertion(a, b, w, dd, starving) {
    if (!b.army || b.members.length < 6) return;
    const exh = (F(a.fac).weariness || 0) / 100;
    const morale = a.morale / 100;
    const base = 0.012 * dd * 20 * (starving ? 3 : 1) * (morale < 0.35 ? 2.5 : morale < 0.55 ? 1.2 : 0.3) * (0.4 + exh * 1.4);
    let n = 0; const S = G.S; const out = [];
    for (const id of b.members) {
      const v = P(id); if (!v || b.army.gen === id) continue;
      if (G.R() > base * (1.25 - v.courage) * (v.role === 'guerreiro' ? 0.4 : 1)) continue;
      out.push(v); if (out.length > b.members.length * 0.15) break;
    }
    for (const v of out) {
      G.Vg.endTask(v); v.deserter = S.day; n++;
      G.Life && G.Life.bio(v, 'deserted', a.name);
      G.Stories && G.Stories.signal('deserted', { v: v.id, army: a.id, war: w ? w.id : 0 });
    }
    if (n) {
      a.deserted += n; if (w) { w.side[a.fac].deserted += n; }
      if (n >= 3 || (a.deserted >= 5 && a.deserted - n < 5)) { const lead = P(a.gen); event(w, `${n} ${n > 1 ? 'soldados desertaram' : 'soldado desertou'} d${a.name.startsWith('a ') ? 'a ' + a.name.slice(2) : a.name.startsWith('os ') ? 'os ' + a.name.slice(3) : 'o ' + a.name.replace(/^o /, '')} durante a noite${starving ? ': não havia mais comida nas carroças' : a.morale < 35 ? ': ninguém mais acreditava na vitória' : ''}.`, lead ? lead.x : undefined, lead ? lead.y : undefined, 'army'); }
    }
  }
  // home again: the veterans, the families
  function homecoming(a) {
    const S = G.S; const w = Wz.get(a.war); if (!w) return;
    const f = F(a.fac); let n = 0;
    for (const id of a.members) {
      const v = P(id); if (!v || v.captive) continue; n++;
      if (!v._vetWar || v._vetWar !== w.id) { v._vetWar = w.id; G.Life && G.Life.bio(v, 'veteran', w.name, a.battles.length); }
      if (v.unit) v.unit = null;
      const kin = G.Stories ? G.Stories.kin(v).filter(k => !k.captive && dist(k.x, k.y, v.x, v.y) < 14) : [];
      for (const k of kin.slice(0, 2)) { G.Vg.emote(k, 'heart', 3); }
      if (kin.length) G.Vg.emote(v, 'heart', 3);
    }
    if (n && w && !w.end) a.home = S.day;
    if (n >= 5 && a.role !== 'defesa' && w) { const home = G.S.settlements.get(a.front); event(w, `${cap1(a.name)} voltou para casa${a.dead ? ` — dos ${a.n0} que partiram, ${a.dead} ficaram pelo caminho` : ''}.`, home ? home.cx : undefined, home ? home.cy : undefined, 'army', { quiet: !w.end && n < 20 }); }
    if (n && f) G.Stories && G.Stories.signal('armyHome', { war: w.id, army: a.id, fac: a.fac, ids: a.members.slice(), n });
  }

  // ====================================================================================
  //  BATTLES
  // ====================================================================================
  // two hosts form their lines: a battle begins (both sides call this; the second joins the first's record)
  Wz.battleStart = function (b, foe) {
    const S = G.S; if (!b || !foe) return null;
    const open = st().battles.find(x => x.open && !x.naval && x.bands.includes(foe.id));
    if (open) { if (!open.bands.includes(b.id)) { open.bands.push(b.id); addSide(open, b); } b.battle = open.id; return open; }
    const w = warOf(b.fac, foe.fac);
    // the same two hosts closing again on the same ground, moments later: it is still the same battle
    const g0 = P(b.army && b.army.gen) || P(b.members[0]);
    const again = g0 && st().battles.find(x => !x.open && !x.town && !x.naval && x.sides[b.fac] && x.sides[foe.fac] && S.clock - (x.t1 || 0) < 90 && dist(x.x, x.y, g0.x, g0.y) < 24);
    if (again) { again.open = true; again.reopened = (again.reopened || 0) + 1; for (const o of [b, foe]) if (!again.bands.includes(o.id)) { again.bands.push(o.id); addSide(again, o); } b.battle = again.id; foe.battle = again.id; return again; }
    const g1 = P(b.army && b.army.gen), g2 = P(foe.army && foe.army.gen);
    const x = g1 && g2 ? (g1.x + g2.x) / 2 : g1 ? g1.x : foe.members.length ? P(foe.members[0]).x : 0;
    const y = g1 && g2 ? (g1.y + g2.y) / 2 : g1 ? g1.y : foe.members.length ? P(foe.members[0]).y : 0;
    const nm = nameBattle(w, x, y);
    const bt = { id: st().seq++, war: w ? w.id : 0, name: nm.name, base: nm.base, x: +x.toFixed(1), y: +y.toFixed(1), d: S.day, t0: S.clock, t1: 0, sides: {}, winner: 0, bands: [b.id, foe.id], open: true, ids: [] };
    addSide(bt, b); addSide(bt, foe);
    st().battles.push(bt); if (st().battles.length > 80) st().battles.splice(0, st().battles.length - 80);
    b.battle = bt.id; foe.battle = bt.id;
    if (w) w.battles.push(bt.id);
    const tot = Object.values(bt.sides).reduce((s, q) => s + q.n, 0); bt.n0 = tot;
    const A = F(b.fac), B = F(foe.fac);
    if (tot >= 12) {
      const sz = tot >= 30 ? 'Batalha' : 'Escaramuça';
      bt.kind = tot >= 30 ? 'batalha' : 'escaramuca';
      if (tot >= 30) event(w, `${cap1(bt.name)} vai começar: ${A.name} (${bt.sides[b.fac].n}) contra ${B.name} (${bt.sides[foe.fac].n}).`, x, y, 'battle');
      void sz;
    } else bt.kind = 'refrega';
    G.Stories && G.Stories.signal('battleStart', { battle: bt.id, war: w ? w.id : 0, x, y, n: tot });
    return bt;
  };
  function addSide(bt, b) {
    const s = bt.sides[b.fac] || (bt.sides[b.fac] = { n: 0, gen: 0, genName: '', dead: 0, wounded: 0, captured: 0, fled: 0, army: '', bands: [] });
    s.n += b.members.length; s.bands.push(b.id);
    const g = P(b.army && b.army.gen); if (g && !s.gen) { s.gen = g.id; s.genName = g.name; }
    const a = Wz.armyOfBand(b); if (a && !s.army) { s.army = a.name; a.battles.push(bt.id); }
    for (const id of b.members) if (!bt.ids.includes(id)) bt.ids.push(id);
  }
  // the field is quiet: who kept it?
  Wz.battleEnd = function (b) {
    const S = G.S; const bt = b && b.battle ? Wz.battle(b.battle) : null; if (!bt || !bt.open) return;
    bt.open = false; bt.t1 = S.clock;
    const holding = {};
    for (const id of bt.bands) { const o = G.War.bands.get(id); if (o && o.st !== 'retorno' && o.members.length) holding[o.fac] = (holding[o.fac] || 0) + o.members.length; }
    // (the fled were counted as they ran)
    const facs = Object.keys(bt.sides).map(Number);
    // who won: the side that kept the field — unless keeping it cost far more than the other lost
    const lossOf = k => { const q = bt.sides[k]; return (q.dead + q.captured + q.fled) / Math.max(1, q.n); };
    let win = 0, best = -1; for (const k of facs) { const h = holding[k] || 0; if (h > best) { best = h; win = k; } }
    if (best <= 0) win = 0;
    const other = facs.find(k => k !== win);
    if (win && other && lossOf(win) > lossOf(other) + 0.3) win = other;
    if (!win && facs.length === 2 && Math.abs(lossOf(facs[0]) - lossOf(facs[1])) > 0.15) win = lossOf(facs[0]) < lossOf(facs[1]) ? facs[0] : facs[1];
    bt.winner = win;
    // the wounded: those who came out of it bleeding
    for (const id of bt.ids) {
      const v = P(id); if (!v || v.captive) continue;
      const s = bt.sides[fid(v)]; if (!s) continue;
      if (v.hp < 55) { s.wounded++; v.wound = { d: S.day, sev: v.hp < 25 ? 'grave' : 'leve', bt: bt.id }; G.Life && G.Life.bio(v, 'wounded', placeOf(bt.x, bt.y).name || ''); }
      v.vet = (v.vet || 0) + 1;
      if (bt.kind !== 'refrega') G.Life && G.Life.bio(v, 'battle', bt.name, fid(v) === win ? 1 : 0);
      if (fid(v) === win) { v.courage = Math.min(1, v.courage + 0.02); } else v.fear = Math.min(100, (v.fear || 0) + 8);
    }
    const w = Wz.get(bt.war);
    if (w && win) { for (const k of facs) { const sd = w.side[k]; if (!sd) continue; if (k === win) sd.won++; else sd.lost++; } }
    const tot = facs.reduce((s, k) => s + bt.sides[k].n, 0);
    const dead = facs.reduce((s, k) => s + bt.sides[k].dead, 0), wounded = facs.reduce((s, k) => s + bt.sides[k].wounded, 0), capd = facs.reduce((s, k) => s + bt.sides[k].captured, 0);
    bt.total = tot;
    if (bt.kind !== 'refrega' && (tot >= 12 || dead >= 3)) {
      const W0 = F(win); const forces = facs.map(k => `${(F(k) || {}).name || '?'}: ${bt.sides[k].n}`).join(' · ');
      const L0 = F(facs.find(k => k !== win));
      const txt = dead + capd === 0 ? `${cap1(placeOf(bt.x, bt.y).of.replace(/^de /, 'em ').replace(/^(d)(o|a|os|as) /, (m, d0, a) => 'n' + a + ' '))}, ${facs.map(k => (F(k) || {}).name).join(' e ')} formaram as linhas frente a frente${W0 && L0 ? `; ${L0.name} recuou sem combate` : ', e ninguém avançou'}.`
        : `${cap1(bt.name)} terminou${W0 ? ' — vitória de ' + W0.name : ' sem vencedor'}. ${forces}. Mortos: ${dead}${wounded ? ', feridos: ' + wounded : ''}${capd ? ', capturados: ' + capd : ''}${bt.civ ? ` — e ${bt.civ} ${bt.civ > 1 ? 'civis' : 'civil'} morreram em volta` : ''}.`;
      if (dead + capd === 0) bt.kind = 'confronto';
      event(w, txt, bt.x, bt.y, 'battle');
      if (tot >= 40 && G.UI) G.UI.toast(cap1(bt.name).replace(/^A /, ''), W0 ? `Vitória de ${W0.name}. ${dead} mortos.` : `${dead} mortos, sem vencedor.`, 'war');
      if (dead >= 15 && G.Lore && G.Lore.legend) G.Lore.legend('bt' + bt.id, cap1(bt.name).replace(/^A /, ''), `No dia ${bt.d}, ${forces}. ${W0 ? W0.name + ' ficou com o campo.' : 'Ninguém ficou com o campo.'} ${dead} morreram ali.`, { kind: 'war' });
    }
    G.Stories && G.Stories.signal('battleEnd', { battle: bt.id, war: w ? w.id : 0, winner: win, x: bt.x, y: bt.y, ids: bt.ids.slice(0, 120), dead });
  };
  // an assault on a town with its people fighting back is a battle too
  Wz.assault = function (b, set) {
    if (!b || b.battle || !set) return;
    const S = G.S; let def = 0; const ids = [];
    for (const v of S.villagers.values()) if (v.set === set.id && !v.captive && v.age >= 16 && v.age < 62) { def++; if (ids.length < 200) ids.push(v.id); }
    if (def < 6 || b.members.length < 8) return;
    const w = warOf(b.fac, set.fac);
    const base = `o Assalto a ${set.name}`; const same = w ? w.battles.map(Wz.battle).filter(x => x && x.base === base).length : 0;
    const nm = { name: same ? `o ${ORD[same + 1] === 'Segunda' ? 'Segundo' : ORD[same + 1] === 'Terceira' ? 'Terceiro' : 'Novo'} Assalto a ${set.name}` : base, base };
    const bt = { id: st().seq++, war: w ? w.id : 0, name: nm.name, base: nm.base, x: set.cx, y: set.cy, d: S.day, t0: S.clock, t1: 0, sides: {}, winner: 0, bands: [b.id], open: true, ids: ids.slice(), kind: b.members.length + def >= 30 ? 'batalha' : 'escaramuca', town: set.id };
    addSide(bt, b);
    bt.sides[set.fac] = { n: def, gen: 0, genName: '', dead: 0, wounded: 0, captured: 0, fled: 0, army: `o povo de ${set.name}`, bands: [] };
    st().battles.push(bt); if (st().battles.length > 80) st().battles.splice(0, st().battles.length - 80); b.battle = bt.id; if (w) w.battles.push(bt.id);
  };
  Wz.assaultEnd = function (b, won) {
    const bt = b && b.battle ? Wz.battle(b.battle) : null; if (!bt || !bt.open || !bt.town) return;
    const set = G.S.settlements.get(bt.town);
    bt.open = false; bt.t1 = G.S.clock; bt.winner = won ? b.fac : set ? (set.fac === b.fac ? b.fac : set.fac) : 0;
    const facs = Object.keys(bt.sides).map(Number);
    const w = Wz.get(bt.war);
    const dead = facs.reduce((s, k) => s + bt.sides[k].dead, 0);
    if (w && bt.winner && dead >= 2) for (const k of facs) { const sd = w.side[k]; if (sd) { if (k === bt.winner) sd.won++; else sd.lost++; } }
    if (dead >= 3) event(w, `${cap1(bt.name)}: ${bt.winner === b.fac ? (F(b.fac) || {}).name + ' entrou na cidade' : 'a cidade resistiu'}. Mortos: ${dead}.`, bt.x, bt.y, 'battle');
  };
  // every death and every capture in a war is counted where it happened
  Wz.onDeath = function (v, killer, cause) {
    if (!v || !{ war: 1, arrow: 1, massacre: 1, siege: 1, oil: 1, gore: 1, rock: 1 }[cause] && !(killer && fid(killer) !== fid(v))) return;
    const f0 = fid(v); const kf = killer ? fid(killer) : 0;
    const w = kf ? warOf(f0, kf) : Wz.active().find(x => x.side[f0]);
    if (w && w.side[f0]) w.side[f0].dead++;
    let b = null; for (const o of G.War.bands.values()) if (o.members.includes(v.id)) { b = o; break; }
    // a soldier of the battle counts on his side; anyone else killed around it is a civilian of that battle
    const bt = b && b.battle ? Wz.battle(b.battle) : null;
    if (bt && bt.open && bt.sides[f0]) bt.sides[f0].dead++;
    else if (!b) { const nb = st().battles.find(x => x.open && dist(x.x, x.y, v.x, v.y) < 18); if (nb) nb.civ = (nb.civ || 0) + 1; }
    const a = b ? Wz.armyOfBand(b) : null; if (a) a.dead++;
  };
  // a soldier who leaves the field running (a broken company, a wound): counted once
  Wz.onFlee = function (v, b) { const bt = b && b.battle ? Wz.battle(b.battle) : null; if (bt && bt.open && bt.sides[b.fac]) bt.sides[b.fac].fled++; };
  Wz.onCapture = function (o, captor) {
    const f0 = o.captive ? o.captive.from : fid(o); const kf = captor ? fid(captor) : 0;
    const w = kf ? warOf(f0, kf) : null; if (w && w.side[f0]) w.side[f0].captured++;
    const bt = st().battles.find(x => x.open && dist(x.x, x.y, o.x, o.y) < 18 && x.sides[f0]); if (bt) bt.sides[f0].captured++;
  };
  // a commander falls
  Wz.commanderLost = function (b, who) {
    const a = Wz.armyOfBand(b); const w = a ? Wz.get(a.war) : warOf(b.fac, b.enemy);
    if (!who) return;
    const bt = b.battle ? Wz.battle(b.battle) : null; if (bt) bt.genFell = (bt.genFell || []).concat([who.name]);
    if (a) event(w, `${a.genTitle || 'O comandante'} ${who.name}, que comandava ${a.name}, tombou. O exército vacila.`, who.x, who.y, 'war', { quiet: true });
    G.Stories && G.Stories.signal('commanderKilled', { v: who.id, army: a ? a.id : 0, war: w ? w.id : 0, x: who.x, y: who.y });
  };

  // ====================================================================================
  //  SIEGES AND OCCUPATION
  // ====================================================================================
  Wz.siegeStart = function (b, set) {
    const w = warOf(b.fac, set.fac); if (!w) return;
    if (w.sieges.some(s => s.set === set.id && !s.end)) return;
    const sg = { set: set.id, name: `o Cerco de ${set.name}`, att: b.fac, def: set.fac, start: G.S.day, t0: G.S.clock, end: 0, how: '', band: b.id };
    w.sieges.push(sg);
    const a = Wz.armyOfBand(b);
    event(w, `${(F(b.fac) || {}).name} iniciou ${sg.name}${a ? ' com ' + a.name : ''}. ${set.name} fecha os portões.`, set.cx, set.cy, 'siege');
    G.Stories && G.Stories.signal('cityBesieged', { war: w.id, set: set.id, by: b.fac, x: set.cx, y: set.cy });
  };
  Wz.siegeEnd = function (set, how, by) {
    for (const w of wars()) for (const sg of w.sieges) {
      if (sg.set !== set.id || sg.end) continue;
      sg.end = G.S.day; sg.how = how; const days = Math.max(1, Math.round((G.S.clock - sg.t0) / DAY() * 10) / 10);
      sg.days = days;
      const txt = how === 'rendicao' ? `${set.name} se rendeu depois de ${days} ${days === 1 ? 'dia' : 'dias'} de cerco.` : how === 'assalto' ? `${cap1(sg.name)} acabou no assalto, depois de ${days} ${days === 1 ? 'dia' : 'dias'}.` : how === 'socorro' ? `${cap1(sg.name)} foi rompido: o exército de socorro chegou.` : `${cap1(sg.name)} foi levantado depois de ${days} ${days === 1 ? 'dia' : 'dias'}.`;
      event(w, txt, set.cx, set.cy, 'siege');
      void by;
    }
  };
  // a city taken: occupied first, integrated later — or lost again
  Wz.onConquer = function (set, b, old) {
    const S = G.S; const w = warOf(b.fac, old.id) || Wz.active().find(x => x.side[b.fac] && x.side[old.id]);
    set.occ = { by: b.fac, from: old.id, day: S.day, war: w ? w.id : 0 };
    if (w) { w.side[b.fac].taken++; if (w.side[old.id]) w.side[old.id].lostSets++; event(w, `${set.name} caiu: ${(F(b.fac) || {}).name} ocupa a cidade.`, set.cx, set.cy, 'war', { quiet: true }); }
    G.Stories && G.Stories.signal('cityFell', { war: w ? w.id : 0, set: set.id, by: b.fac, from: old.id, x: set.cx, y: set.cy });
  };
  // after the fall, the army: a garrison stays, the rest marches on — or goes home
  Wz.afterConquest = function (b, set) {
    const S = G.S; const a = Wz.armyOfBand(b); const w = a ? Wz.get(a.war) : null; const f = F(b.fac);
    const gN = Math.max(3, Math.ceil(b.members.length * 0.3));
    const garr = b.members.slice(0, gN);
    for (const id of garr) { const v = P(id); if (v) { if (v.task && v.task.type === 'band') G.Vg.endTask(v); v.set = set.id; v.home = 0; } }
    b.members = b.members.slice(gN);
    if (set.occ) set.occ.garrison = garr.length;
    if (!a || !w || w.end || b.members.length < 8 || supplyDays(a) < 0.5) { b.st = 'retorno'; b.t = 0; if (a && w) event(w, `${cap1(a.name)} deixou ${garr.length} de guarnição em ${set.name} e voltou para casa.`, set.cx, set.cy, 'army'); return; }
    // the next aim: the enemy's nearest town still standing (the capital, if the aim was the crown)
    const foes = liveFoes(w, f.id).map(F).filter(Boolean);
    const cands = []; for (const e of foes) for (const s of G.Fac.settlementsOf(e.id)) if (reachable(set, s)) cands.push(s);
    const g = w.goals[f.id] || {};
    const wantCap = g.k === 'submeter' || g.k === 'conquista' && g.imp >= 3;
    const next = cands.sort((p, q) => dist(p.cx, p.cy, set.cx, set.cy) - dist(q.cx, q.cy, set.cx, set.cy) - (wantCap && G.Fac.capitalOf(q.fac) === q ? 30 : 0))[0];
    const enough = g.k !== 'saque' && g.k !== 'reconquista' && g.k !== 'fronteira' && g.k !== 'riqueza' || G.Politics.leaderPe(f).amb > 0.7;
    if (!next || !enough || dist(next.cx, next.cy, set.cx, set.cy) > 60) { b.st = 'retorno'; b.t = 0; event(w, `${cap1(a.name)} deixou ${garr.length} de guarnição em ${set.name} e voltou para casa.`, set.cx, set.cy, 'army'); return; }
    b.set = next.id; b.enemy = next.fac; b.st = 'marcha'; b.t = 0; b.reached = false; b.quiet = 0; b.siege = null; b.battle = 0; b.defRaised = false;
    const ang = Math.atan2(next.cy - set.cy, next.cx - set.cx); const rad = (next.radius || 8) * 0.8;
    const stage = W.randomNear(next.cx - Math.cos(ang) * rad, next.cy - Math.sin(ang) * rad, 2) || [next.cx, next.cy]; b.tx = stage[0]; b.ty = stage[1];
    a.target = next.id;
    if (b.army) { b.army.phase = 'marcha'; b.army.siege = null; b.army.trench = null; b.army.trail = []; for (const co of b.army.cos) { co.form = 'coluna'; co.path = null; co.camp = null; } }
    event(w, `${cap1(a.name)} deixou ${garr.length} de guarnição em ${set.name} e marcha agora sobre ${next.name}.`, set.cx, set.cy, 'army');
  };
  function occupationTick(dDays) {
    const S = G.S;
    for (const s of S.settlements.values()) {
      const o = s.occ; if (!o) continue;
      if (s.fac !== o.by) { s.occ = null; continue; }
      const days = S.day - o.day;
      // integrated: the garrison is part of the town now, the town part of the realm
      if (days >= 4 && (s.loyalty || 0) >= 48) { s.occ = null; log(`${s.name} deixou de ser terra ocupada: agora é parte de ${(F(s.fac) || {}).name}.`, 'crown', s.cx, s.cy); continue; }
      // a rising: the old masters still have friends inside
      const from = F(o.from);
      let garr = 0; for (const v of S.villagers.values()) if (v.set === s.id && !v.captive && (v.role === 'guerreiro' || v.vet) && fid(v) === o.by) garr++;
      const pop = G.Village.pop(s.id);
      if (from && from.alive && (s.loyalty ?? 50) < 26 && garr < pop * 0.12 && G.R() < dDays * 0.35) {
        const by = F(s.fac); s.fac = from.id; s.occ = null; s.origFac = by ? by.id : s.origFac; s.loyalty = 45;
        const w = Wz.get(o.war);
        const txt = `${s.name} se levantou contra os ocupantes de ${by ? by.name : 'fora'} e voltou para ${from.name}.`;
        if (w && !w.end) event(w, txt, s.cx, s.cy, 'war'); else log(txt, 'war', s.cx, s.cy);
        G.Fac.updateTerritory();
        G.Stories && G.Stories.signal('cityRose', { set: s.id, from: o.by, to: from.id, x: s.cx, y: s.cy });
      }
    }
  }

  // ====================================================================================
  //  STRATEGY: what each people does with its war
  // ====================================================================================
  function plan(w, dt) {
    const S = G.S;
    const all = w.a.concat(w.b);
    for (const fId of all) {
      const f = F(fId); if (!f || !f.alive) continue;
      const foes = foesOf(w, fId).map(F).filter(e => e && e.alive && G.Fac.atWar(fId, e.id));
      if (!foes.length) continue;
      const mine = liveArmies(fId).filter(a => a.war === w.id);
      const g = w.goals[fId] || { k: 'defesa' };
      const side = w.side[fId];
      const exh = f.weariness || 0;
      // ---- defence: the scouts see the enemy levy gather, and the threatened town calls its own
      for (const e of foes) for (const ea of liveArmies(e.id)) {
        if (ea.role === 'defesa' || !{ mobilizar: 1, reunir: 1, marcha: 1, acampado: 1, cerco: 1, travessia: 1 }[ea.phase]) continue;
        const tg = S.settlements.get(ea.target); if (!tg || tg.fac !== fId) continue;
        const besieged = ea.phase === 'cerco';
        if (mine.some(a => a.role === 'defesa' && a.target === tg.id && (!besieged || a.relief))) continue;
        if ((w.planD && w.planD[tg.id] || 0) > S.clock) continue;
        (w.planD || (w.planD = {}))[tg.id] = S.clock + DAY() * 0.4;
        if (besieged) {
          // a city under siege waits for a relief army from the rest of the realm
          const others = G.Fac.settlementsOf(fId).filter(s => s !== tg && reachable(s, tg));
          const from = nearestTo(others, tg.cx, tg.cy);
          const besiegers = ea.members.length;
          if (from) { const a = mobilize(w, f, 'defesa', tg, { relief: from, minN: Math.round(besiegers * 0.6) }); if (a) a.relief = 1; }
        } else mobilize(w, f, 'defesa', tg);
      }
      if (g.k === 'defesa') {
        // a small people strikes back the way small peoples do: a raid
        const n = levySize(f, 1, Wz.adults(fId));
        if (n < 8 && (f.attackCD || 0) <= 0 && !G.War.bandsOf(fId).some(b => b.goal !== 'defesa') && G.Politics.leaderPe(f).agg > 0.4 && G.R() < 0.25) raid(w, f, foes[0], n);
        // the counter-stroke: the invader's armies are broken, and we are not
        const enemyArmies = foes.reduce((k, e) => k + liveArmies(e.id).filter(a => a.war === w.id && a.role !== 'defesa' && a.phase !== 'retorno' && a.phase !== 'retirada').length, 0);
        if (!enemyArmies && side.won > side.lost && exh < 55 && !mine.some(a => a.role !== 'defesa') && G.R() < dt / DAY() * 0.8 && G.Politics.leaderPe(f).agg > 0.35) {
          const e = foes[0]; const home = G.Fac.capitalOf(fId); const tgt = home ? nearestTo(G.Fac.settlementsOf(e.id), home.cx, home.cy) : null;
          if (tgt) { w.goals[fId] = { k: 'conquista', set: tgt.id, imp: 2, txt: GOAL.conquista(f, e, tgt), counter: 1 }; event(w, `${f.name} passa ao ataque: agora quer ${w.goals[fId].txt}.`, tgt.cx, tgt.cy, 'war'); }
        }
        continue;
      }
      // ---- the offensive: one army in the field at a time; a new levy when it is spent
      if (mine.some(a => a.role !== 'defesa')) continue;
      if ((w.nextLevy && w.nextLevy[fId] || 0) > S.clock) continue;
      if (exh > 75 && side.levies > 0) continue;
      let tgt = S.settlements.get(g.set);
      if (!tgt || !foes.some(e => e.id === tgt.fac)) {
        // the aim is won (the city is ours): satisfied — the envoys will carry the terms
        if (tgt && tgt.fac === fId && side.levies > 0) { w.goalMet = w.goalMet || {}; if (!w.goalMet[fId]) { w.goalMet[fId] = S.day; event(w, `${f.name} alcançou o que queria nesta guerra: ${g.txt.replace(/^(tomar|retomar|ficar com) /, '')} é sua.`, tgt.cx, tgt.cy, 'crown', { quiet: true }); } continue; }
        const home = G.Fac.capitalOf(fId); tgt = home ? nearestTo(foes.flatMap(e => G.Fac.settlementsOf(e.id)), home.cx, home.cy) : null;
        if (!tgt) continue;
        w.goals[fId] = Object.assign({}, g, { set: tgt.id, txt: GOAL[g.k] ? GOAL[g.k](f, F(tgt.fac), tgt) : g.txt });
      }
      const n = levySize(f, g.imp || 2, Wz.adults(fId));
      // too few for an army: the war is fought in raids, as small peoples fight
      if (n < 8) { if ((f.attackCD || 0) <= 0 && !G.War.bandsOf(fId).some(b => b.goal !== 'defesa')) raid(w, f, F(tgt.fac), n, tgt); continue; }
      // (a city over the water: the army goes by sea, or not at all)
      const a = mobilize(w, f, 'campanha', tgt, { reinforce: side.levies > 0 }) || (G.Fleets && !reachableAny(fId, tgt) && G.Fleets.amphibious(w, f, tgt, { reinforce: side.levies > 0 }));
      (w.nextLevy || (w.nextLevy = {}))[fId] = S.clock + DAY() * (a ? 0.8 : 0.3);
    }
  }
  function raid(w, f, en, n, tgt) {
    if (!en) return;
    if (!tgt) { const home = G.Fac.capitalOf(f.id); tgt = home ? nearestTo(G.Fac.settlementsOf(en.id), home.cx, home.cy) : null; }
    const r = G.War.launch(f, en, { target: tgt ? tgt.id : 0, size: Math.max(3, Math.min(n + 2, 14)), raid: true });
    if (r && r.id) { Wz.raided(f.id, en.id); const b = G.War.bands.get(r.id); if (b) b.war = w.id; w.side[f.id].raids = (w.side[f.id].raids || 0) + 1; }
    else if (!r) f.attackCD = G.rr(40, 80);
  }
  // the old raid planner is replaced for every people in a war with a name
  Wz.handles = f => Wz.active().some(w => (w.a.includes(f.id) || w.b.includes(f.id)) && foesOf(w, f.id).some(e => G.Fac.atWar(f.id, e)));
  // a death cluster of the old reports that a recorded battle already tells
  Wz.covers = function (x, y, t) { void t; const now = G.S.clock; return st().battles.some(b => (b.open || now - b.t1 < 40) && b.kind !== 'refrega' && dist(b.x, b.y, x, y) < 22); };
  // the defenders of a town (already called, perhaps still gathering)
  Wz.defenseFor = function (setId) { return armies().find(a => !a.done && a.role === 'defesa' && a.target === setId) || null; };
  Wz.formNow = function (a) { if (a && a.phase === 'mobilizar') formArmy(a); return a && a.band ? G.War.bands.get(a.band) || null : null; };
  // who still threatens a town: an enemy army bound for it
  Wz.threatTo = function (setId) {
    const s = G.S.settlements.get(setId); if (!s) return null;
    for (const a of armies()) { if (a.done || a.role === 'defesa' || a.target !== setId || !G.Fac.atWar(a.fac, s.fac)) continue; if (a.phase === 'retorno' || a.phase === 'retirada' || a.phase === 'dispersado') continue; return a; }
    return null;
  };

  // ====================================================================================
  //  EXHAUSTION, PEACE, AFTERMATH
  // ====================================================================================
  function exhaustion(w) {
    const S = G.S; const days = (S.clock - w.t0) / DAY();
    for (const k of w.a.concat(w.b)) {
      const f = F(k); const sd = w.side[k]; if (!f || !sd) continue;
      const pop0 = Math.max(10, sd.pop0 || Wz.pop(k));
      const away = liveArmies(k).filter(a => a.war === w.id).reduce((n, a) => n + a.members.length, 0);
      const hungry = (f.stock.food || 0) < Wz.pop(k) * 0.4 ? 14 : 0;
      const e = days * 5 + sd.dead / pop0 * 260 + sd.captured / pop0 * 120 + sd.lost * 7 - sd.won * 3 + sd.lostSets * 16 + hungry + away / Math.max(10, Wz.pop(k)) * 30 + sd.deserted / pop0 * 80;
      sd.exh = Math.round(G.clamp(e, 0, 100));
      f._exh = Math.max(f._exh || 0, sd.exh);
    }
    // the aim reached: the winner offers peace on its own terms
    for (const k of w.a.concat(w.b)) {
      const met = w.goalMet && w.goalMet[k]; if (!met) continue;
      const f = F(k); if (!f || (w.offerT || 0) > S.clock) continue;
      const foe = foesOf(w, k).map(F).find(e => e && G.Fac.atWar(k, e.id));
      if (foe && G.Politics.sendEnvoy) { w.offerT = S.clock + DAY() * 1.2; G.Politics.sendEnvoy(f, foe, 'paz'); }
    }
  }
  // an army of this people is in the field against that one, in good heart, its aim not yet won
  Wz.winningCampaign = function (f, foe) {
    const w = warOf(f, foe); if (!w || (w.goalMet && w.goalMet[f])) return false;
    return liveArmies(f).some(a => a.war === w.id && a.role !== 'defesa' && a.phase !== 'retorno' && a.phase !== 'retirada' && a.morale > 40 && supplyDays(a) > 0.4);
  };
  Wz.score = function (w, k) { const sd = w.side[k]; if (!sd) return 0; return sd.won * 2 - sd.lost * 2 + sd.taken * 5 - sd.lostSets * 5 - sd.dead / Math.max(10, sd.pop0) * 20; };
  // politics made peace between two peoples: the treaty, and the end of the war (for them)
  Wz.onPeace = function (from, to, terms, winner) {
    const S = G.S; const w = warOf(from.id, to.id); if (!w) return;
    const sa = sideOf(w, from.id); const loserSide = winner ? (sideOf(w, winner.id) === 'a' ? 'b' : 'a') : null;
    void sa;
    const lines = [];
    // the cities: an occupier that won keeps them; one that lost gives them back
    for (const s of S.settlements.values()) {
      const o = s.occ; if (!o || o.war !== w.id) continue;
      if (![from.id, to.id].includes(o.by) || ![from.id, to.id].includes(o.from)) continue;
      // (a white peace is the world as it was: every occupied city goes back)
      const occupierLost = !winner || sideOf(w, o.by) === loserSide;
      if (occupierLost && F(o.from) && F(o.from).alive) { s.fac = o.from; s.occ = null; s.loyalty = 55; lines.push(`${s.name} foi devolvida a ${F(o.from).name}`); }
      else lines.push(`${s.name} ficou com ${(F(o.by) || {}).name}`);
    }
    if (lines.length) G.Fac.updateTerritory();
    // prisoners exchanged
    const caps = [...S.villagers.values()].filter(v => v.captive && ((v.captive.from === from.id && fid(v) === to.id) || (v.captive.from === to.id && fid(v) === from.id)));
    if (caps.length) { G.War.liberate(caps, 'troca'); lines.push(`${caps.length} prisioneiros foram trocados`); }
    if (terms && terms !== 'sem vencedores') lines.unshift(terms);
    // the place of the treaty: where the war was decided
    const lastSiege = w.sieges.filter(x => x.end).slice(-1)[0];
    const capL = winner ? G.Fac.capitalOf(winner.id === from.id ? to.id : from.id) : null;
    const bigB = w.battles.map(Wz.battle).filter(Boolean).sort((p, q) => (q.total || 0) - (p.total || 0))[0];
    const place = lastSiege ? S.settlements.get(lastSiege.set) : capL || null;
    const tname = place ? `o Tratado de ${place.name}` : bigB ? `a Paz ${placeOf(bigB.x, bigB.y).of}` : `a Paz de ${(G.Fac.capitalOf(to.id) || {}).name || to.name}`;
    // the rest of the war goes on if there are others still fighting (the record keeps every side)
    const still = (x, y) => G.Fac.atWar(x, y) && !((x === from.id && y === to.id) || (x === to.id && y === from.id));
    const ends = !w.a.some(x => w.b.some(y => still(x, y)));
    if (!ends) (w.peaces || (w.peaces = [])).push({ a: from.id, b: to.id, d: S.day, name: tname });
    const total = Object.values(w.side).reduce((s, q) => s + q.dead, 0);
    if (ends) {
      w.end = S.day; w.t1 = S.clock;
      w.treaty = { name: tname, d: S.day, terms: lines, winner: winner ? winner.id : 0 };
      w.dead = total;
      const days = Math.max(1, Math.round((w.t1 - w.t0) / DAY()));
      const res = winner ? `vitória de ${winner.name}` : 'ninguém venceu';
      event(w, `${cap1(tname)} encerrou ${w.name}, depois de ${days} ${days === 1 ? 'dia' : 'dias'}: ${res}.${lines.length ? ' ' + cap1(lines.join('; ')) + '.' : ''} Mortos: ${total}.`, place ? place.cx : undefined, place ? place.cy : undefined, 'peace');
      if (total >= 20 && G.Lore && G.Lore.legend) G.Lore.legend('war' + w.id, cap1(w.name), `Do dia ${w.start} ao dia ${w.end}. A causa: ${w.cause.txt}. ${winner ? winner.name + ' venceu.' : 'Ninguém venceu.'} ${total} morreram. ${lines.length ? cap1(lines.join('; ')) + '.' : ''}`, { kind: 'war' });
      // revanchism: the losers keep the claim, and the grudge
      if (winner) { const loser = winner.id === from.id ? to : from; const r = G.Fac.rel(winner.id, loser.id); if (r) r.grudge = Math.min(100, (r.grudge || 0) + 12 + Math.min(30, total * 0.4)); }
      G.Stories && G.Stories.signal('warEnded', { war: w.id, winner: winner ? winner.id : 0, a: from.id, b: to.id, dead: total });
    } else {
      event(w, `${from.name} e ${to.name} fizeram ${tname.replace(/^o Tratado/, 'um tratado').replace(/^a Paz/, 'a paz')}; ${w.name} continua para os outros.`, undefined, undefined, 'peace');
    }
    // the soldiers these two sent against each other go home (in a war of many peoples, an army
    // marching on a third one keeps marching: the peace was not made with that people)
    for (const a of armies()) {
      if (a.done || a.war !== w.id || ![from.id, to.id].includes(a.fac)) continue;
      if (!ends) {
        const foe = a.fac === from.id ? to.id : from.id;
        const left = foesOf(w, a.fac).filter(y => still(a.fac, y));
        if (left.length) {
          const bd = G.War.bands.get(a.band); const tg = S.settlements.get(a.target);
          const th = a.role === 'defesa' ? Wz.threatTo(a.target) : null;
          const vs = bd ? bd.enemy : th ? th.fac : a.role !== 'defesa' && tg ? tg.fac : 0;
          if (vs !== foe) continue;
        }
      }
      if (a.phase === 'mobilizar') { for (const id of a.members) { const v = P(id); if (v && v.task && v.task.type === 'muster') G.Vg.endTask(v); } a.done = true; a.phase = 'dispersado'; continue; }
      const b = G.War.bands.get(a.band); if (b && a.role === 'defesa') G.War.disband(b, true); else if (b && b.st !== 'retorno') { b.st = 'retorno'; b.t = 0; }
    }
    // the refugees can go home
    for (const v of S.villagers.values()) if (v.task && v.task.type === 'refugio') v.task.over = 1;
  };

  // ====================================================================================
  //  CIVILIANS: who runs before an army
  // ====================================================================================
  function refugees(dDays) {
    const S = G.S;
    for (const a of armies()) {
      if (a.done || a.role === 'defesa' || a.phase !== 'marcha') continue;
      const b = G.War.bands.get(a.band); if (!b) continue;
      const tgt = S.settlements.get(b.set); const lead = P(a.gen); if (!tgt || !lead) continue;
      if (tgt.fled === a.id || dist(lead.x, lead.y, tgt.cx, tgt.cy) > 28) continue;
      const wl = G.Siege && G.Siege.wallOf(tgt.id); if (wl && wl.fac === tgt.fac && wl.done) continue; // behind walls they stay
      tgt.fled = a.id;
      const safe = G.Fac.settlementsOf(tgt.fac).filter(s => s !== tgt && reachable(tgt, s)).sort((p, q) => dist(q.cx, q.cy, lead.x, lead.y) - dist(p.cx, p.cy, lead.x, lead.y))[0];
      if (!safe) continue;
      let n = 0;
      for (const v of S.villagers.values()) {
        if (v.set !== tgt.id || v.captive || v.held || (v.task && v.task.pri >= 3)) continue;
        const frail = v.age < 13 || v.age >= 58 || (v.g === 'f' && (v.kids || []).some(id => { const k = P(id); return k && k.age < 6; }));
        if (!frail || G.R() > 0.65) continue;
        G.Vg.endTask(v); G.Vg.setTask(v, { type: 'refugio', to: safe.id, from: tgt.id, pri: 3.05, kind: 'refugio', st: 0 }); n++;
      }
      if (n >= 3) { const w = Wz.get(a.war); event(w, `Com ${a.name} a caminho, ${n} pessoas de ${tgt.name} — velhos, crianças, mães com bebês — fogem para ${safe.name}.`, tgt.cx, tgt.cy, 'flee'); G.Stories && G.Stories.signal('refugees', { set: tgt.id, to: safe.id, n, war: a.war }); }
    }
    void dDays;
  }
  function runRefugio(v, t, dt, H) {
    const S = G.S; const to = S.settlements.get(t.to), from = S.settlements.get(t.from);
    if (!to || !from) return H.end(v);
    // the danger passed (or the war ended): back home
    const home = t.back ? from : to;
    if (t.st === 0) { const p = W.randomNear(home.cx, home.cy, 3) || [home.cx, home.cy]; if (!H.goto(v, p[0], p[1], false, N * N) && !H.goto(v, p[0], p[1], true, N * N)) return H.end(v); t.st = 1; return; }
    if (t.st === 1) { v.act = t.back ? '' : 'run'; if (H.move(v, dt, t.back ? 0.95 : 1.2)) { t.st = 2; v.actT = 0; if (t.back) return H.end(v); } else if (t.age > 260) return H.end(v); return; }
    v.moving = false; v.act = t.age % 30 < 20 ? 'sit' : '';
    t.chk = (t.chk || 0) - dt;
    if (t.chk <= 0) { t.chk = 6; const threat = G.War.threat(from.id) || from.fac !== to.fac; if ((t.over || (!threat && t.age > 90)) && from.fac === v.fac0 || (!threat && t.age > 120) || t.over) { t.back = true; t.st = 0; } }
  }

  // ====================================================================================
  //  TASKS, UPDATE, SAVE
  // ====================================================================================
  Wz.run = function (v, t, dt, H) {
    if (t.type === 'muster') { runMuster(v, t, dt, H); return true; }
    if (t.type === 'refugio') { runRefugio(v, t, dt, H); return true; }
    return false;
  };
  Wz.taskText = function (v, t) {
    if (t.type === 'muster') { const a = Wz.army(t.army); const S = G.S; const fr = a && S.settlements.get(a.front); return t.st < 2 ? `Atendendo ao chamado às armas${fr ? ': rumo a ' + fr.name : ''}` : t.eq > 0 ? 'Recebendo uma arma do arsenal' : `No ponto de reunião, esperando os outros${a ? ' — ' + a.name : ''}`; }
    if (t.type === 'refugio') { const to = G.S.settlements.get(t.back ? t.from : t.to); return t.back ? `Voltando para casa depois do perigo` : t.st < 2 ? `Fugindo da guerra para ${to ? to.name : 'longe'}` : `Refugiad${oa(v)} em ${to ? to.name : 'outra cidade'}, esperando a guerra passar`; }
    return null;
  };
  let tk = 0, tTen = 0, tOcc = 0, tRef = 0;
  Wz.update = function (dt) {
    const S = G.S; if (!S) return;
    tk += dt; tTen += dt; tOcc += dt; tRef += dt;
    if (tk < 0.5) return; const d = tk; tk = 0;
    refresh();
    for (const a of armies()) if (!a.done) armyTick(a, d);
    if (tTen >= DAY() * 0.1) { tensionTick(tTen / DAY()); tTen = 0; }
    if (tOcc >= DAY() * 0.1) { occupationTick(tOcc / DAY()); tOcc = 0; }
    if (tRef >= 3) { refugees(tRef / DAY()); tRef = 0; }
    for (const w of Wz.active()) {
      // a war whose sides no longer fight each other (a people fell, a peace made outside the treaty path) closes quietly
      if (!w.a.some(x => w.b.some(y => G.Fac.atWar(x, y)))) { if (!w.end) { w.end = S.day; w.t1 = S.clock; w.dead = Object.values(w.side).reduce((s, q) => s + q.dead, 0); const gone = w.a.concat(w.b).map(F).filter(f => f && !f.alive); event(w, `${cap1(w.name)} acabou${gone.length ? ': ' + gone.map(f => f.name).join(', ') + (gone.length > 1 ? ' deixaram' : ' deixou') + ' de existir' : ''}. Mortos: ${w.dead}.`, undefined, undefined, 'peace'); G.Stories && G.Stories.signal('warEnded', { war: w.id, winner: 0, dead: w.dead }); for (const a of armies()) if (!a.done && a.war === w.id) { const b = G.War.bands.get(a.band); if (b && a.role === 'defesa') G.War.disband(b, true); else if (b) { b.st = 'retorno'; b.t = 0; } else if (a.phase === 'mobilizar') { for (const id of a.members) { const v = P(id); if (v && v.task && v.task.type === 'muster') G.Vg.endTask(v); } a.done = true; } } } continue; }
      w.planT = (w.planT || 0) - d;
      if (w.planT <= 0) { w.planT = 2; plan(w, 2); }
      exhaustion(w);
    }
    for (const f of G.Fac.all()) if (f._exh !== undefined) { f.weariness = f._exh; delete f._exh; }
    // close battles whose bands are all gone
    for (const bt of st().battles) if (bt.open && !bt.naval && !bt.bands.some(id => G.War.bands.has(id))) { const b0 = { battle: bt.id }; if (bt.town) Wz.assaultEnd(Object.assign(b0, { fac: Object.keys(bt.sides).map(Number)[0] }), false); else Wz.battleEnd(b0); }
    // keep the archive short
    if (armies().length > 120) st().armies = armies().filter(a => !a.done || G.S.day - (a.day || 0) < 30).slice(-120);
    if (wars().length > 60) { const keep = wars().filter(w => !w.end).concat(wars().filter(w => w.end).slice(-50)); st().wars = wars().filter(w => keep.includes(w)); }
  };
  // after a load: the armies in the field come back together where their soldiers stand
  function resume() {
    const S = G.S;
    for (const a of armies()) {
      if (a.done) continue;
      const w = Wz.get(a.war); if (!w || w.end) { a.done = true; continue; }
      const f = F(a.fac); const tgt = S.settlements.get(a.target);
      const ms = a.members.map(P).filter(v => v && !v.captive && fid(v) === a.fac);
      if (!f || !tgt || ms.length < 3) { a.done = true; continue; }
      if (a.sea && (a.phase === 'embarque' || a.phase === 'travessia')) continue;
      if (a.phase === 'mobilizar') { a.called = S.clock; ms.forEach((v, k) => G.Vg.setTask(v, { type: 'muster', army: a.id, k, pri: 3.15, kind: 'muster', st: 0 })); continue; }
      if (a.phase === 'retorno' || a.phase === 'retirada' || a.phase === 'dispersado') { a.done = true; continue; }
      // the soldiers fall in again around their commander
      const lead = P(a.gen) || ms[0];
      a.muster = [lead.x, lead.y];
      ms.forEach((v, k) => G.Vg.setTask(v, { type: 'muster', army: a.id, k, pri: 3.15, kind: 'muster', st: 0 }));
      a.phase = 'mobilizar'; a.called = S.clock - DAY() * 0.3; a.band = 0;
    }
    // (a land battle is fought again when the lines meet; a sea battle in progress goes on — the fleets keep it)
    for (const bt of st().battles) if (bt.open && !bt.naval) { bt.open = false; bt.t1 = S.clock; }
  }
  (G.saveHooks = G.saveHooks || []).push({
    save(out) { if (G.S.wz) out.wz = G.S.wz; },
    load(o) {
      if (o.wz) { G.S.wz = o.wz; resume(); }
      // (a world saved before wars had names: the wars already burning get one now)
      const fs = G.Fac.all(); for (let i = 0; i < fs.length; i++) for (let j = i + 1; j < fs.length; j++) if (G.Fac.atWar(fs[i].id, fs[j].id) && !warOf(fs[i].id, fs[j].id)) { const r = G.Fac.rel(fs[i].id, fs[j].id); const A = r && r.by === fs[j].id ? fs[j] : fs[i]; Wz.ensure(A, A === fs[i] ? fs[j] : fs[i]); }
    },
  });
  Wz.reset = function () { reach.clear(); cache.t = -1; };
})(window.G);
