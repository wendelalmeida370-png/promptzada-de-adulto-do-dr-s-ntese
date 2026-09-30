'use strict';
// ============================================================
//  Festivals: every people keeps its own calendar. The Greeks
//  carry the new peplos to Athena and hold the Games; the Romans
//  turn the world upside down at the Saturnalia; the Egyptians
//  carry Amun's golden barque to the river and spend a night
//  among their dead; the Aztecs sacrifice the god's image at
//  Toxcatl and, once every 52 years, put out every fire in the
//  city; the Norse light the Yule fire and drink to the gods.
//  Everything happens in the world: who walks, who carries,
//  who dies, what is eaten.
// ============================================================
(function (G) {
  const FE = G.Fest = {};
  let N = G.N; G.mapHooks.push(n => { N = n; });
  const W = G.W;
  const DAY = () => G.DAY_LEN;
  const log = (txt, ic, x, y) => G.Village.log(txt, ic, x, y);
  const gen = s => G.gen(s);

  // ------------------------------ the calendars ------------------------------
  // at: time of the day-year it begins; dur: fraction of a day-year; every/off: cycle in years
  FE.DEF = {
    panateneias: { art: 'as', civ: 'grego', name: 'Panateneias', at: 0.2, dur: 0.16, every: 1, sacred: 1,
      desc: 'o peplo novo levado em procissão à deusa, uma novilha sacrificada e um banquete para a cidade' },
    dionisias: { art: 'as', civ: 'grego', name: 'Dionísias', at: 0.6, dur: 0.12, every: 1,
      desc: 'coros, máscaras e tragédias em honra de Dioniso — e muito vinho' },
    olimpiadas: { art: 'os', civ: 'grego', name: 'Jogos Olímpicos', at: 0.12, dur: 0.16, every: 4, off: 2, truce: 1,
      desc: 'atletas correm e lutam diante da cidade; todas as guerras param pela trégua sagrada' },
    saturnalia: { art: 'a', civ: 'romano', name: 'Saturnália', at: 0.76, dur: 0.16, every: 1,
      desc: 'o mundo de pernas para o ar: senhores servem, cativos comem à mesa, trocam-se presentes à luz das velas' },
    ludi: { art: 'os', civ: 'romano', name: 'Jogos Romanos', at: 0.3, dur: 0.12, every: 1,
      desc: 'gladiadores na arena e pão para a multidão' },
    triunfo: { art: 'o', civ: 'romano', name: 'Triunfo', at: 0.2, dur: 0.14, every: 0, trigger: 'victory',
      desc: 'o exército vitorioso desfila com os cativos acorrentados até o templo' },
    opet: { art: 'a', civ: 'egipcio', name: 'Festa de Opet', at: 0.18, dur: 0.18, every: 1, sacred: 1,
      desc: 'a barca dourada do deus é carregada nos ombros dos sacerdotes do templo até o rio, e de volta' },
    vale: { art: 'a', civ: 'egipcio', name: 'Bela Festa do Vale', at: 0.62, dur: 0.2, every: 1,
      desc: 'as famílias passam a noite no cemitério, com tochas, oferendas e música, comendo com seus mortos' },
    wepet: { art: 'o', civ: 'egipcio', name: 'Wepet Renpet', at: 0.03, dur: 0.1, every: 1,
      desc: 'o ano novo da cheia: água do rio levada ao templo, para que os campos deem mais' },
    toxcatl: { art: 'o', civ: 'asteca', name: 'Toxcatl', at: 0.74, dur: 0.16, every: 1, sacred: 1,
      desc: 'o cativo que foi o deus Tezcatlipoca por um ano sobe a pirâmide quebrando suas flautas — e é sacrificado' },
    fogonovo: { art: 'a', civ: 'asteca', name: 'Cerimônia do Fogo Novo', at: 0.76, dur: 0.2, every: 52, off: 26, sacred: 1,
      desc: 'o fim de um ciclo de 52 anos: todos os fogos se apagam, a cerâmica é quebrada, e só um fogo novo, aceso no alto do templo, pode salvar o mundo' },
    tlacaxipe: { art: 'o', civ: 'asteca', name: 'Tlacaxipehualiztli', at: 0.3, dur: 0.12, every: 1, sacred: 1,
      desc: 'um cativo amarrado à pedra redonda luta com um bastão de penas contra guerreiros-águia e guerreiros-jaguar' },
    jol: { art: 'o', civ: 'nordico', name: 'Jól', at: 0.8, dur: 0.18, every: 1, sacred: 1,
      desc: 'a grande fogueira do inverno, o blót — um animal sacrificado aos deuses — e chifres de hidromel até o amanhecer' },
    midsommar: { art: 'o', civ: 'nordico', name: 'Midsommar', at: 0.46, dur: 0.14, every: 1,
      desc: 'a noite mais curta: danças de roda em volta do mastro e fogueiras no crepúsculo' },
    thing: { art: 'o', civ: 'nordico', name: 'Thing', at: 0.26, dur: 0.1, every: 2,
      desc: 'os homens livres se reúnem; o recitador das leis fala e as disputas são julgadas' },
    colheita: { art: 'a', civ: 'classico', name: 'Festa da Colheita', at: 0.52, dur: 0.12, every: 1,
      desc: 'dança de roda, pão novo e os primeiros frutos oferecidos ao deus' },
  };
  FE.of = civ => Object.keys(FE.DEF).filter(k => FE.DEF[k].civ === civ);
  // Portuguese articles: "as Panateneias", "o Jól", "nas Dionísias"
  const artOf = (d, grand) => grand ? 'as' : d.art;
  const theName = (d, grand) => `${artOf(d, grand)} ${(grand ? 'Grandes ' : '') + d.name}`;
  const inName = (d, grand) => ({ a: 'na', o: 'no', as: 'nas', os: 'nos' })[artOf(d, grand)] + ' ' + (grand ? 'Grandes ' : '') + d.name;
  const ended = (d, grand) => /s$/.test(artOf(d, grand)) ? 'Terminaram' : 'Terminou';

  // ------------------------------ state ------------------------------
  // live festivals are not saved: a festival cut by a save simply ends
  let live = new Map(), liveS = null, nextId = 1;
  function reset() { if (liveS !== G.S) { liveS = G.S; live = new Map(); lastConq = new Map(); } }
  FE.list = () => { reset(); return [...live.values()]; };
  FE.active = setId => { reset(); for (const f of live.values()) if (f.set === setId) return f; return null; };

  // ------------------------------ places ------------------------------
  const byType = (setId, t) => G.Eco ? G.Eco.byType(setId, t) : [...G.S.buildings.values()].filter(b => b.set === setId && b.built && b.type === t);
  function frontOf(b) { return b.blocks ? G.Vg.door(b) : [b.x + b.w / 2, b.y + b.h / 2]; }
  function place(set, kind) {
    const S = G.S; const pick = t => byType(set.id, t)[0];
    const praca = pick('praca'), temple = pick('maravilha') || pick('temple'), teatro = pick('teatro'), cem = pick('cemetery'), camp = pick('campfire'), adm = pick('administracao');
    const center = praca ? [praca.x + praca.w / 2, praca.y + praca.h / 2] : camp ? frontOf(camp) : [set.cx, set.cy];
    switch (kind) {
      case 'praca': return center;
      case 'temple': return temple ? frontOf(temple) : null;
      case 'altar': return temple ? frontOf(temple) : (praca ? [praca.x + praca.w - 0.3, praca.y + praca.h - 0.3] : [center[0] + 1, center[1] + 1]);
      case 'from': { // where a procession starts: the square, or the edge of town if the altar is on the square
        if (temple && praca) return center;
        const e = place(set, 'edge'); return e;
      }
      case 'templeB': return temple || null;
      case 'teatro': return teatro ? [teatro.x + teatro.w / 2, teatro.y + teatro.h + 0.6] : center;
      case 'cemetery': return cem ? [cem.x + cem.w / 2, cem.y + cem.h / 2] : null;
      case 'river': return riverBank(set);
      case 'thing': return adm ? frontOf(adm) : center;
      case 'edge': { const a = G.hash(set.id + S.day) * 6.283; for (let r = 9; r >= 4; r--) { const x = set.cx + Math.cos(a) * r, y = set.cy + Math.sin(a) * r; if (W.inb(x, y) && W.walkableXY(x, y)) return [x, y]; } return center; }
    }
    return center;
  }
  function riverBank(set) {
    const S = G.S; let best = null, bd = 1e9;
    for (let dy = -16; dy <= 16; dy++) for (let dx = -16; dx <= 16; dx++) {
      const x = Math.floor(set.cx) + dx, y = Math.floor(set.cy) + dy; if (!W.inb(x, y)) continue; const i = y * N + x;
      if (!W.walkable(i) || S.type[i] === G.T.RIVER) continue;
      let wet = false; for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (W.inb(x + ax, y + ay) && S.type[(y + ay) * N + x + ax] <= G.T.RIVER) wet = true;
      if (!wet) continue; const d = dx * dx + dy * dy; if (d < bd) { bd = d; best = [x + 0.5, y + 0.5]; }
    }
    return best;
  }
  // slots in rings around a point, only on open ground
  function ring(cx, cy, n, r0, gap) {
    const out = []; let r = r0 || 1.2; let tries = 0;
    while (out.length < n && tries++ < 12) {
      const k = Math.max(6, Math.round(2 * Math.PI * r / (gap || 0.55)));
      for (let q = 0; q < k && out.length < n; q++) { const a = q / k * 6.283 + r; const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; if (W.inb(x, y) && W.walkableXY(x, y)) out.push([x, y, a]); }
      r += 0.6;
    }
    return out;
  }

  // ------------------------------ who takes part ------------------------------
  const BUSY = { band: 1, combat: 1, fire: 1, flee: 1, escort: 1, escorted: 1, envoy: 1, trade: 1, migrate: 1, aboard: 1, embark: 1, fight: 1, condemned: 1, escape: 1, swim: 1, army: 1, siege: 1 };
  function free(v) { return !v.aboard && !v.held && !v.air && v.age >= 4 && (!v.task || (!BUSY[v.task.type] && v.task.pri < 3)) && v.hp > 25; }
  function people(set, opt) {
    const out = [];
    for (const v of G.S.villagers.values()) {
      if (v.set !== set.id || !free(v)) continue;
      if (v.captive && !(opt && opt.captives)) continue;
      out.push(v);
    }
    return out;
  }
  function enlist(fe, v, role, extra) {
    if (!v || v.set !== fe.set || !free(v) || fe.parts.includes(v.id)) return false;
    G.Vg.endTask(v);
    G.Vg.setTask(v, Object.assign({ type: 'fest', fid: fe.id, role, pri: role === 'victim' ? 6 : 3.2, kind: 'fest', st: 0, delay: G.R() * 1.5 }, extra || {}));
    fe.parts.push(v.id);
    if (role !== 'crowd') fe.roles[role] = (fe.roles[role] || []).concat(v.id);
  }

  // ------------------------------ starting ------------------------------
  function start(set, key, opt) {
    const S = G.S; const d = FE.DEF[key]; const f = G.Fac.get(set.fac); if (!f) return null;
    const fe = { id: nextId++, key, set: set.id, fac: f.id, t: 0, len: d.dur * DAY() * 1.15, stage: -1, parts: [], roles: {}, trail: [], props: {}, lit: new Set(), dark: false, fx: [], note: {} };
    fe.grand = !!(opt && opt.grand);
    // captives only take part where the rite needs them: guests, the chained, the victims
    const pop = people(set, { captives: true });
    if (pop.filter(v => !v.captive).length < 6) return null;
    // not the whole town: the neighbours of the square, the devout, children, elders and whoever is off duty
    const free0 = pop.filter(v => !v.captive).length;
    const cap = Math.min(60, Math.max(8, Math.round(free0 * (d.sacred ? 0.42 : 0.32))));
    const crowd = pop.filter(v => !v.captive).sort(() => G.R() - 0.5);
    const adults = crowd.filter(v => v.age >= 16 && v.age < 60);
    const priest = crowd.find(v => v.role === 'sacerdote' && v.age >= 16) || crowd.find(v => v.age >= 40) || adults[0];
    const ruler = S.villagers.get(f.leader);
    const take = (list, n, pred) => { const out = []; for (const v of list) { if (out.length >= n) break; if (fe.parts.includes(v.id) || (pred && !pred(v))) continue; out.push(v); } return out; };
    const S0 = (k) => place(set, k);
    const setup = SETUP[key]; if (!setup) return null;
    const ok = setup(fe, { set, f, d, pop, crowd, adults, priest, ruler, take, S0, cap });
    if (!ok) { for (const id of fe.parts) { const v = S.villagers.get(id); if (v && v.task && v.task.type === 'fest') G.Vg.endTask(v); } return null; }
    // the rest: those living closest to the festival, and those with no shift to keep
    const venue = fe.C || fe.A || [set.cx, set.cy];
    const ON_SHIFT = { agricultor: 1, construtor: 1, mineiro: 1, lenhador: 1, pastor: 1, cavalarico: 1, ferreiro: 1, tecelao: 1, oleiro: 1, mercador: 1, feirante: 1, guerreiro: 1, cobrador: 1 };
    const score = v => { const h = S.buildings.get(v.home); const hx = h ? h.x : v.x, hy = h ? h.y : v.y; return G.dist(hx, hy, venue[0], venue[1]) + (ON_SHIFT[v.role] ? 7 : 0) - (v.age < 16 || v.age >= 60 ? 3 : 0) - v.devotion / 25 + G.R() * 2; };
    const rest = crowd.filter(v => !fe.parts.includes(v.id)).map(v => [score(v), v]).sort((a, b) => a[0] - b[0]).map(e => e[1]);
    for (const v of take(rest, cap - fe.parts.length)) enlist(fe, v, 'crowd');
    live.set(fe.id, fe);
    set.festDone = set.festDone || {}; set.festDone[key] = S.day;
    f.st.festivals = (f.st.festivals || 0) + 1;
    const p = fe.C || fe.A || [set.cx, set.cy];
    log(`${set.name} celebra ${theName(d, fe.grand)}: ${d.desc}.`, 'fest', p[0], p[1]);
    nextStage(fe);
    return fe;
  }
  FE.start = (set, key, opt) => { reset(); return start(set, key, opt); };

  // ------------------------------ scripts ------------------------------
  // each festival: a setup (places + roles) and a list of stages (share of the time, what each role does)
  const SETUP = {
    panateneias(fe, c) {
      fe.A = c.S0('from'); fe.B = c.S0('altar'); if (!fe.A || !fe.B) return false;
      fe.C = fe.B;
      const bearers = c.take(c.adults, 4); if (bearers.length < 2) return false;
      enlist(fe, c.priest, 'leader'); bearers.forEach(v => enlist(fe, v, 'bearer'));
      fe.props.peplos = true;
      fe.victim = leadAnimal(fe, ['vaca', 'ovelha', 'cabra', 'porco'], bearers[1] || bearers[0]);
      const athletes = fe.grand ? c.take(c.adults, 5, v => v.age < 35) : [];
      athletes.forEach(v => enlist(fe, v, 'athlete'));
      fe.plan = [['gather', 0.12], ['march', 0.32], ['rite', 0.14]].concat(fe.grand ? [['race', 0.16]] : []).concat([['feast', fe.grand ? 0.26 : 0.42]]);
      return true;
    },
    dionisias(fe, c) {
      fe.C = c.S0('teatro'); if (!fe.C) return false;
      c.take(c.adults, 3).forEach(v => enlist(fe, v, 'actor'));
      c.take(c.crowd, 6, v => v.age >= 12).forEach(v => enlist(fe, v, 'chorus'));
      fe.plan = [['gather', 0.18], ['perform', 0.56], ['feast', 0.26]];
      return true;
    },
    olimpiadas(fe, c) {
      fe.C = c.S0('praca'); if (!fe.C) return false;
      const course = trackFrom(fe.C); if (!course) return false; fe.course = course;
      const ath = c.take(c.adults, 6, v => v.age < 34); if (ath.length < 3) return false;
      ath.forEach(v => enlist(fe, v, 'athlete'));
      fe.plan = [['gather', 0.14], ['race', 0.3], ['wrestle', 0.22], ['crown', 0.08], ['feast', 0.26]];
      fe.truce = true;
      return true;
    },
    saturnalia(fe, c) {
      fe.C = c.S0('praca'); if (!fe.C) return false;
      // the masters serve the table; the captives sit at it
      const servers = [c.ruler, ...c.take(c.adults, 3, v => v.traits.includes('Ambicioso') || v.role === 'mercador' || v.role === 'escriba')].filter(v => v && free(v) && !fe.parts.includes(v.id));
      servers.forEach(v => enlist(fe, v, 'server'));
      for (const v of c.pop) if (v.captive && free(v)) enlist(fe, v, 'guest');
      fe.plan = [['gather', 0.14], ['feast', 0.72], ['end', 0.14]];
      fe.torches = true;
      return true;
    },
    ludi(fe, c) {
      fe.C = c.S0('teatro'); if (!fe.C) return false;
      const glad = c.take(c.adults.slice().sort((a, b) => (b.role === 'guerreiro') - (a.role === 'guerreiro') || b.courage - a.courage), 2); if (glad.length < 2) return false;
      glad.forEach(v => enlist(fe, v, 'gladiator'));
      fe.plan = [['gather', 0.16], ['duel', 0.5], ['feast', 0.34]];
      return true;
    },
    triunfo(fe, c) {
      fe.A = c.S0('edge'); fe.B = c.S0('temple') || c.S0('praca'); if (!fe.A || !fe.B) return false; fe.C = fe.B;
      const gen0 = c.ruler && free(c.ruler) ? c.ruler : c.adults.find(v => v.role === 'guerreiro');
      if (!gen0) return false;
      enlist(fe, gen0, 'leader');
      for (const v of c.crowd) if (v.role === 'guerreiro' && free(v) && !fe.parts.includes(v.id)) enlist(fe, v, 'soldier');
      for (const v of c.pop) if (v.captive && free(v) && !fe.parts.includes(v.id)) enlist(fe, v, 'chained');
      if ((fe.roles.soldier || []).length < 2) return false;
      fe.plan = [['gather', 0.18], ['march', 0.46], ['rite', 0.12], ['feast', 0.24]];
      return true;
    },
    opet(fe, c) {
      fe.A = c.S0('altar'); fe.B = c.S0('river') || c.S0('edge'); if (!fe.A || !fe.B) return false; fe.C = fe.B;
      const bearers = c.take(c.adults, 4); if (bearers.length < 4) return false;
      enlist(fe, c.priest, 'leader'); bearers.forEach(v => enlist(fe, v, 'bearer'));
      fe.props.barca = true;
      fe.plan = [['gather', 0.1], ['march', 0.3], ['rite', 0.12], ['return', 0.3], ['feast', 0.18]];
      return true;
    },
    vale(fe, c) {
      fe.C = c.S0('cemetery'); if (!fe.C) return false;
      fe.plan = [['gather', 0.26], ['vigil', 0.62], ['end', 0.12]];
      fe.torches = true;
      return true;
    },
    wepet(fe, c) {
      fe.A = c.S0('river'); fe.B = c.S0('altar'); if (!fe.A || !fe.B) return false; fe.C = fe.A;
      enlist(fe, c.priest, 'leader');
      c.take(c.adults, 6).forEach(v => enlist(fe, v, 'bearer'));
      fe.plan = [['gather', 0.3], ['water', 0.2], ['march', 0.36], ['end', 0.14]];
      return true;
    },
    toxcatl(fe, c) {
      fe.A = c.S0('from'); fe.T = c.S0('templeB'); fe.B = c.S0('altar'); if (!fe.A || !fe.B) return false; fe.C = fe.A;
      const cap = c.pop.find(v => v.captive && v.age >= 14 && v.age < 45 && free(v));
      enlist(fe, c.priest, 'leader');
      const aides = c.take(c.adults, 2, v => v.role === 'sacerdote' || v.age >= 30); aides.forEach(v => enlist(fe, v, 'priest'));
      if (cap) { enlist(fe, cap, 'victim'); fe.victimV = cap.id; }
      else fe.victim = leadAnimal(fe, ['peru'], aides[0] || c.priest); // no captive: a turkey is offered instead
      if (!cap && !fe.victim) return false;
      // without a pyramid, the knife falls at the altar on the square
      fe.plan = [['gather', 0.2], ['dance', 0.18], ['march', 0.2], [fe.T ? 'climb' : 'rite', 0.22], ['end', 0.2]];
      fe.torches = true;
      return true;
    },
    fogonovo(fe, c) {
      fe.T = c.S0('templeB'); fe.C = fe.T ? c.S0('temple') : null; if (!fe.C || !fe.T) return false;
      enlist(fe, c.priest, 'leader');
      c.take(c.adults, 6, v => v.age < 32).forEach(v => enlist(fe, v, 'runner'));
      fe.plan = [['smash', 0.16], ['dark', 0.22], ['newfire', 0.1], ['relight', 0.36], ['feast', 0.16]];
      return true;
    },
    tlacaxipe(fe, c) {
      fe.C = c.S0('praca'); if (!fe.C) return false;
      const cap = c.pop.find(v => v.captive && v.age >= 16 && v.age < 50 && free(v)); if (!cap) return false;
      const w = c.take(c.adults, 4, v => v.role === 'guerreiro'); if (w.length < 2) return false;
      enlist(fe, cap, 'victim'); fe.victimV = cap.id;
      w.forEach(v => enlist(fe, v, 'gladiator'));
      enlist(fe, c.priest, 'leader');
      fe.props.stone = true;
      fe.plan = [['gather', 0.18], ['bout', 0.54], ['end', 0.28]];
      return true;
    },
    jol(fe, c) {
      fe.C = c.S0('praca'); if (!fe.C) return false;
      enlist(fe, c.priest || c.ruler, 'leader');
      const b = c.take(c.adults, 1); b.forEach(v => enlist(fe, v, 'bearer'));
      fe.victim = leadAnimal(fe, ['porco', 'ovelha', 'vaca', 'cabra', 'cavalo'], b[0]);
      fe.props.bonfire = true; fe.torches = true;
      fe.plan = [['gather', 0.14], ['blot', 0.16], ['feast', 0.6], ['end', 0.1]];
      return true;
    },
    midsommar(fe, c) {
      fe.C = c.S0('praca'); if (!fe.C) return false;
      fe.props.pole = true;
      fe.plan = [['gather', 0.18], ['dance', 0.5], ['feast', 0.32]];
      return true;
    },
    thing(fe, c) {
      fe.C = c.S0('thing'); if (!fe.C) return false;
      const law = c.crowd.find(v => v.age >= 50 && free(v)) || c.ruler || c.priest;
      if (!law || !free(law)) return false;
      enlist(fe, law, 'leader');
      fe.plan = [['gather', 0.26], ['speech', 0.6], ['end', 0.14]];
      return true;
    },
    colheita(fe, c) {
      fe.C = c.S0('praca'); if (!fe.C) return false;
      enlist(fe, c.priest, 'leader'); fe.props.pole = true;
      fe.plan = [['gather', 0.18], ['dance', 0.46], ['feast', 0.36]];
      return true;
    },
  };
  // a beast from the city's own pens, led on a rope
  function leadAnimal(fe, kinds, by) {
    if (!by || !G.Eco) return null;
    for (const k of kinds) for (const b of byType(fe.set, k === 'cavalo' ? 'estabulo' : 'curral')) {
      const a = G.Eco.penAnimals(b).find(q => q.kind === k && q.grown >= 1 && q.state === 'pen');
      if (a) { a.state = 'led'; a.ledBy = by.id; fe.animalPen = b.id; return a.id; }
    }
    return null;
  }
  // a straight running track from the square
  function trackFrom(p) {
    let best = null, bl = 0;
    for (let k = 0; k < 8; k++) {
      const a = k / 8 * 6.283; let l = 0;
      for (let s = 1; s <= 12; s++) { const x = p[0] + Math.cos(a) * s * 0.7, y = p[1] + Math.sin(a) * s * 0.7; if (!W.inb(x, y) || !W.walkableXY(x, y)) break; l = s * 0.7; }
      if (l > bl) { bl = l; best = [p[0], p[1], p[0] + Math.cos(a) * l, p[1] + Math.sin(a) * l]; }
    }
    return bl >= 4 ? best : null;
  }

  // ------------------------------ stages ------------------------------
  function nextStage(fe) {
    fe.stage++; fe.st = 0; fe.stT = 0; fe.arrived = 0; fe.arrT = 0;
    const s = fe.plan[fe.stage];
    if (!s) return finish(fe);
    fe.sname = s[0]; fe.sdur = s[1] * fe.len;
    const S = G.S;
    for (const id of fe.parts) { const v = S.villagers.get(id); if (v && v.task && v.task.type === 'fest' && v.task.fid === fe.id) { v.task.st = 0; v.task.slot = null; v.path = null; } }
    // layouts: where each role stands in this stage
    const n = fe.parts.length; const C = fe.C;
    switch (fe.sname) {
      case 'gather': case 'feast': case 'vigil': case 'speech': case 'blot': case 'perform': case 'duel': case 'bout': case 'wrestle': case 'crown': case 'dance': case 'water': case 'dark': case 'newfire': case 'smash':
        if (fe.sname === 'gather' && fe.A && fe.key !== 'wepet') fe.slots = ring(fe.A[0], fe.A[1], n, 1.4);
        else if (fe.sname === 'water' || (fe.sname === 'gather' && fe.key === 'wepet')) fe.slots = ring(fe.A[0], fe.A[1], n, 0.9, 0.5);
        else fe.slots = ring(C[0], C[1], n, fe.sname === 'dance' ? 1.3 : fe.sname === 'feast' ? 1.5 : 1.8);
        break;
      case 'march': case 'return': fe.trail = []; fe.slots = ring((fe.sname === 'return' ? fe.A : fe.B)[0], (fe.sname === 'return' ? fe.A : fe.B)[1], n, 1.5); break;
      case 'rite': case 'climb': fe.slots = ring(fe.B[0], fe.B[1], n, 1.4); break;
      case 'race': fe.slots = raceSlots(fe); fe.racers = {}; break;
      case 'relight': fe.slots = ring(C[0], C[1], n, 1.6); fe.houses = [...G.S.buildings.values()].filter(b => b.set === fe.set && b.built && G.BDEF[b.type].housing).map(b => b.id); fe.hk = 0; break;
      default: fe.slots = ring(C[0], C[1], n, 1.6);
    }
    fe.slotOf = new Map(); fe.parts.forEach((id, k) => fe.slotOf.set(id, k));
    onStage(fe);
  }
  function raceSlots(fe) {
    const c = fe.course || trackFrom(fe.C); if (!c) return ring(fe.C[0], fe.C[1], fe.parts.length, 1.6);
    fe.course = c;
    // the crowd lines both sides of the track
    const out = []; const dx = c[2] - c[0], dy = c[3] - c[1]; const l = Math.hypot(dx, dy); const nx = -dy / l, ny = dx / l;
    for (let k = 0; out.length < fe.parts.length && k < 400; k++) { const f = (k % 12) / 12, side = (Math.floor(k / 12) % 2 ? 1 : -1) * (1.1 + Math.floor(k / 24) * 0.5); const x = c[0] + dx * f + nx * side, y = c[1] + dy * f + ny * side; if (W.inb(x, y) && W.walkableXY(x, y)) out.push([x, y, 0]); }
    while (out.length < fe.parts.length) out.push([fe.C[0], fe.C[1], 0]);
    return out;
  }
  function onStage(fe) {
    const S = G.S; const f = G.Fac.get(fe.fac); const set = S.settlements.get(fe.set);
    if (fe.sname === 'feast') fe.food = Math.min(f ? f.stock.food : 0, fe.parts.length * (fe.grand ? 1.2 : 0.7));
    if (fe.sname === 'smash' && f && G.Eco) { const n = Math.min(Math.floor(f.stock.ceramica || 0), Math.ceil(fe.parts.length / 3)); f.stock.ceramica -= n; fe.note.pots = n; }
    if (fe.sname === 'dark') { fe.dark = true; }
    if (fe.sname === 'newfire') { fe.props.newfire = true; const p = fe.T ? G.Village.center(fe.T) : fe.C; G.FX && G.FX.ring(p[0], p[1], 0.3, 3, 1.4, 'rgba(255,190,80,0.9)', 2, true); }
    if (fe.sname === 'gather' && fe.props.bonfire) fe.props.fireOn = true;
    if (fe.sname === 'crown' && fe.winner) { const w = S.villagers.get(fe.winner); if (w) { G.Vg.emote(w, 'happy', 4); log(`${w.name} venceu ${fe.key === 'olimpiadas' ? 'os Jogos Olímpicos' : 'os jogos'} em ${set.name} e recebeu a coroa de oliveira.`, 'fest', w.x, w.y); w.kills = w.kills || 0; } }
    void f;
  }

  // ------------------------------ ending ------------------------------
  function finish(fe) {
    const S = G.S; const set = S.settlements.get(fe.set); const f = G.Fac.get(fe.fac); const d = FE.DEF[fe.key];
    for (const id of fe.parts) { const v = S.villagers.get(id); if (v && v.task && v.task.type === 'fest' && v.task.fid === fe.id) { v.torch = false; v.z = 0; G.Vg.endTask(v); } }
    if (fe.victim) { const a = S.animals.get(fe.victim); if (a && !a.dead) { a.state = 'pen'; a.ledBy = 0; } }
    live.delete(fe.id);
    if (!set || !f) return;
    set.feast = Math.max(set.feast || 0, DAY() * (fe.grand ? 2 : 1.2));
    let n = 0; for (const id of fe.parts) if (S.villagers.has(id)) n++;
    if (d.sacred) S.faith = Math.min(999, S.faith + 4 + Math.round(n / 8));
    for (const id of fe.parts) { const v = S.villagers.get(id); if (v && !v.captive) { v.devotion = Math.min(100, v.devotion + (d.sacred ? 4 : 1.5)); v.fear = Math.max(0, v.fear - 5); } }
    set.loyalty = Math.min(100, set.loyalty + (fe.grand ? 8 : 4));
    const bits = [];
    if (fe.note.sac) bits.push(fe.note.sac);
    if (fe.note.eaten) bits.push(`${Math.round(fe.note.eaten)} de comida no banquete`);
    if (fe.note.pots) bits.push(`${fe.note.pots} potes quebrados`);
    if (fe.note.water) bits.push('os campos regados com a água nova');
    if (fe.winner) { const w = S.villagers.get(fe.winner) || S.dead.get(fe.winner); if (w) bits.push(`${w.name} campe${w.g === 'f' ? 'ã' : 'ão'}`); }
    const nm = (fe.grand ? 'Grandes ' : '') + d.name;
    log(`${ended(d, fe.grand)} ${theName(d, fe.grand)} em ${set.name}: ${n} pessoas${bits.length ? ' · ' + bits.join(' · ') : ''}.`, 'fest', set.cx, set.cy);
    if (fe.key === 'fogonovo') log(`O fogo novo foi aceso: o mundo continua por mais 52 anos em ${set.name}.`, 'fest', set.cx, set.cy);
    if (!S.milestones.fest) G.Village.milestone('fest', 'Festividade', `${set.name} celebrou ${theName(d, fe.grand)}.`, 'fest');
    G.Lore && G.Lore.note && G.Lore.note('fest', { fac: f.id, name: nm, set: set.name });
  }
  function abort(fe, why) {
    const S = G.S;
    for (const id of fe.parts) { const v = S.villagers.get(id); if (v && v.task && v.task.type === 'fest' && v.task.fid === fe.id) { v.torch = false; v.z = 0; G.Vg.endTask(v); } }
    if (fe.victim) { const a = S.animals.get(fe.victim); if (a && !a.dead) { a.state = 'pen'; a.ledBy = 0; } }
    live.delete(fe.id);
    const set = S.settlements.get(fe.set);
    if (set && why) { const d = FE.DEF[fe.key]; const a = artOf(d, fe.grand); log(`${G.cap(theName(d, fe.grand))} em ${set.name} ${/s$/.test(a) ? 'foram interrompid' + a : 'foi interrompid' + a}: ${why}.`, 'fest', set.cx, set.cy); }
  }

  // ------------------------------ the festival clock ------------------------------
  function tick(fe, dt) {
    const S = G.S; const set = S.settlements.get(fe.set); const f = G.Fac.get(fe.fac);
    if (!set || !f || set.fac !== fe.fac) return abort(fe, 'a cidade mudou de mãos');
    if (set.alarmT > 0 || (G.Village.alarm && G.Village.alarm(set.id))) return abort(fe, 'o inimigo chegou');
    fe.t += dt; fe.stT += dt;
    if (fe.truce) f.truce = S.clock + 5;
    const s = fe.sname;
    // leaving the stage when its time is up (a march waits for its leader, a gathering for its people)
    let done = fe.stT >= fe.sdur;
    if (TRAVEL[s]) {
      fe.arrT = (fe.arrT || 0) - dt;
      if (fe.arrT <= 0) { fe.arrT = 1; let n = 0, ok = 0; for (const id of fe.parts) { const v = S.villagers.get(id); if (!v || !v.task || v.task.type !== 'fest') continue; const k = fe.slotOf.get(id); const sl = fe.slots[k % Math.max(1, fe.slots.length)]; n++; if (!sl || G.dist(v.x, v.y, sl[0], sl[1]) < 1.2) ok++; } fe.arrived = n ? ok / n : 1; }
      if (done && (fe.arrived || 0) < 0.6 && fe.stT < fe.sdur * 1.6) done = false;
    }
    const ready = !TRAVEL[s] || (fe.arrived || 0) >= 0.5 || fe.stT > fe.sdur * 1.2;
    if ((s === 'march' || s === 'return') && fe.leaderAt !== fe.stage && fe.stT < fe.sdur * 2) done = false;
    // the rites happen at their moment
    if ((s === 'rite' || s === 'blot') && !fe.riteDone && fe.stT > fe.sdur * 0.55 && ready) rite(fe);
    if (s === 'climb' && !fe.riteDone && fe.stT > fe.sdur * 0.7) rite(fe);
    if (s === 'bout' && !fe.riteDone && fe.stT > fe.sdur * 0.92) rite(fe);
    if (s === 'water' && !fe.note.water && fe.stT > fe.sdur * 0.8 && ready) { fe.note.water = true; for (const b of byType(fe.set, 'farm')) if (b.crops) for (const c of b.crops) c.g = Math.min(1, (c.g || 0) + 0.25); }
    if (s === 'feast' && fe.food > 0) { const eat = Math.min(fe.food, dt * fe.parts.length * 0.02); f.stock.food = Math.max(0, f.stock.food - eat); fe.food -= eat; fe.note.eaten = (fe.note.eaten || 0) + eat; }
    if (s === 'relight' && fe.houses && fe.houses.length) { const want = Math.floor(fe.stT / fe.sdur * fe.houses.length * 1.1); while (fe.lit.size < Math.min(want, fe.houses.length)) fe.lit.add(fe.houses[fe.lit.size]); }
    if (s === 'relight' && fe.stT > fe.sdur * 0.95) fe.dark = false;
    if (s === 'duel' && fe.stT > fe.sdur * 0.95 && !fe.riteDone) rite(fe);
    if (done) nextStage(fe);
  }
  const TRAVEL = { gather: 1, rite: 1, water: 1, vigil: 1, feast: 0 };
  // the moment of the rite: sacrifices, offerings, verdicts
  function rite(fe) {
    fe.riteDone = true;
    const S = G.S; const f = G.Fac.get(fe.fac); const set = S.settlements.get(fe.set);
    const at = fe.T ? G.Village.center(fe.T) : fe.B || fe.C;
    const blood = (x, y, z) => { G.FX && G.FX.ring(x, y, 0.2, 2.2, 1.2, 'rgba(210,40,30,0.9)', 2, true); for (let k = 0; k < 12; k++) G.FX && G.FX.spawn({ x: x + G.rr(-0.3, 0.3), y: y + G.rr(-0.3, 0.3), z: z || 6, vz: G.rr(15, 40), vx: G.rr(-0.4, 0.4), vy: G.rr(-0.4, 0.4), g: -8, life: G.rr(0.7, 1.4), s0: 1.1, s1: 0.2, c: '#c8281e', k: 4, layer: 1 }); };
    if (fe.victimV) {
      const v = S.villagers.get(fe.victimV); if (!v) return;
      const name = v.name; const from = v.captive && G.Fac.get(v.captive.from);
      blood(v.x, v.y, (v.z || 0) + 6);
      G.Village.kill(v, 'sacrifice', false);
      S.faith = Math.min(999, S.faith + 10);
      f.st.sacrifices = (f.st.sacrifices || 0) + 1;
      fe.note.sac = `${name}${from ? ', cativ' + (v.g === 'f' ? 'a' : 'o') + ' de ' + from.name + ',' : ''} sacrificad${v.g === 'f' ? 'a' : 'o'}`;
      if (from) { const r = G.Fac.rel(f.id, from.id); if (r) { r.op -= 10; r.grudge = Math.min(100, (r.grudge || 0) + 10); } }
      return;
    }
    if (fe.victim) {
      const a = S.animals.get(fe.victim); if (!a || a.dead) return;
      const sp = G.Animals.DEF[a.kind];
      blood(a.x, a.y, 4);
      const meat = Math.max(4, a.meat || sp.meat || 6);
      G.Animals.kill(a, null, 'sacrifice'); a.meat = 0; G.Animals.remove(a);
      G.Village.addStock('food', meat, f.id);
      G.Eco && G.Eco.penDirty && G.Eco.penDirty();
      fe.note.sac = `${sp.name.toLowerCase()} sacrificad${sp.g === 'f' ? 'a' : 'o'} aos deuses`;
      fe.props.altar = true;
      return;
    }
    if (fe.key === 'panateneias' && f.stock.tecido >= 1) { f.stock.tecido -= Math.min(2, f.stock.tecido); fe.note.sac = 'o peplo novo vestido na estátua da deusa'; }
    if (fe.key === 'ludi' || fe.key === 'duel') {
      const g = (fe.roles.gladiator || []).map(id => S.villagers.get(id)).filter(Boolean);
      if (g.length >= 2) { const [a, b] = g; const w = a.courage + G.R() > b.courage + G.R() ? a : b; const l = w === a ? b : a; fe.winner = w.id; G.Vg.damage(l, G.rr(15, 45), 'war'); G.Vg.emote(w, 'happy', 3); G.Vg.emote(l, 'sad', 3); }
    }
    if (fe.key === 'thing') { set.loyalty = Math.min(100, set.loyalty + 6); fe.note.sac = 'as leis recitadas'; }
    void at;
  }

  // ------------------------------ each participant ------------------------------
  function steer(v, tx, ty, dt, mul) {
    const dx = tx - v.x, dy = ty - v.y; const d = Math.hypot(dx, dy);
    if (d < 0.08) { v.moving = false; return true; }
    const sp = v.speed * (mul || 1) * dt; const k = Math.min(1, sp / d);
    const nx = v.x + dx * k, ny = v.y + dy * k;
    if (!W.walkableXY(nx, ny)) { v.moving = false; return false; }
    v.x = nx; v.y = ny; const sdx = dx - dy; if (Math.abs(sdx) > 0.02) v.face = sdx > 0 ? 1 : -1;
    v.walkPh += sp * 8.5; v.moving = true;
    return d <= sp;
  }
  function faceTo(v, x, y) { const s = (x - y) - (v.x - v.y); if (Math.abs(s) > 0.05) v.face = s > 0 ? 1 : -1; }
  // walk to a slot: pathfinding once, then small direct corrections
  function toSlot(v, t, dt, H, slot, mul) {
    if (!slot) return true;
    const d = G.dist(v.x, v.y, slot[0], slot[1]);
    if (d < 0.35) { v.moving = false; return true; }
    if (t.delay > 0) { t.delay -= dt; v.moving = false; return false; }
    t.rp = (t.rp || 0) - dt;
    // close by and in the open: walk straight there
    if (d < 3 && !t.stuck) { if (steer(v, slot[0], slot[1], dt, mul)) return true; if (!v.moving) t.stuck = 1; return false; }
    // a path, planned again only when the goal has really moved (and not too often)
    const moved = !t.pt || G.dist(t.pt[0], t.pt[1], slot[0], slot[1]) > 1.5;
    if ((moved || !v.path || v.pi >= v.path.length) && t.rp <= 0) {
      t.rp = 1.5; t.pt = [slot[0], slot[1]]; t.stuck = 0;
      if (!H.goto(v, slot[0], slot[1], false, 5000)) { t.rp = 3; return false; }
    }
    if (!v.path || v.pi >= v.path.length) { steer(v, slot[0], slot[1], dt, mul); return false; }
    return H.move(v, dt, mul);
  }
  FE.run = function (v, t, dt, H) {
    if (t.type !== 'fest') return false;
    const fe = live.get(t.fid);
    if (!fe || liveS !== G.S) { v.torch = false; v.z = 0; H.end(v); return true; }
    const s = fe.sname; const k = fe.slotOf ? fe.slotOf.get(v.id) : 0; const slot = fe.slots && fe.slots[k % Math.max(1, fe.slots.length)];
    const role = t.role; const C = fe.C || [v.x, v.y];
    const night = G.isNight() || G.isEvening();
    v.torch = !!(fe.torches && night && !fe.dark && (role !== 'crowd' || v.id % 3 === 0)) || (fe.key === 'fogonovo' && role === 'runner' && s === 'relight');
    if (role === 'chained') v.act = 'bound';
    v.z = 0;
    switch (s) {
      case 'gather': case 'feast': case 'vigil': case 'speech': case 'smash': case 'dark': case 'water': case 'perform': case 'duel': case 'bout': case 'wrestle': case 'crown': case 'blot': case 'newfire': {
        // performers take the middle, everyone else their place in the ring
        const mid = MIDDLE(fe, s, role, v);
        if (mid) { if (toSlot(v, t, dt, H, mid.p, mid.run ? 1.4 : 1)) { v.act = mid.act; v.actT += 0; if (mid.face) faceTo(v, mid.face[0], mid.face[1]); } else if (role === 'chained') v.act = 'bound'; if (mid.z) v.z = mid.z; return true; }
        if (toSlot(v, t, dt, H, slot)) {
          faceTo(v, C[0], C[1]);
          v.act = crowdAct(fe, s, role, v);
          if (s === 'feast' && v.hunger > 20) v.hunger = Math.max(0, v.hunger - dt * 4);
          if (G.R() < dt * 0.025) G.Vg.emote(v, s === 'vigil' ? (G.R() < 0.5 ? 'sad' : 'heart') : s === 'dark' ? 'fear' : s === 'speech' ? 'chat' : G.R() < 0.5 ? 'happy' : 'heart', 1.6);
        } else if (role === 'chained') v.act = 'bound';
        return true;
      }
      case 'dance': {
        // a ring that turns: everyone steps round the pole or the fire
        const n = Math.max(1, fe.slots.length); const a = (k / n) * 6.283 + fe.stT * 0.35; const r = 1.3 + (k % 3) * 0.55;
        const tx = C[0] + Math.cos(a) * r, ty = C[1] + Math.sin(a) * r;
        if (G.dist(v.x, v.y, tx, ty) > 2.5 && !t.inRing) { toSlot(v, t, dt, H, slot); return true; }
        t.inRing = true; steer(v, tx, ty, dt, 0.8); if (!v.moving) v.act = 'dance'; else v.act = 'dance';
        if (fe.key === 'toxcatl' && role === 'victim' && G.R() < dt * 0.3) G.Vg.emote(v, 'awe', 1.2);
        return true;
      }
      case 'march': case 'return': {
        const to = s === 'return' ? fe.A : fe.B;
        if (role === 'leader' || (!fe.roles.leader && k === 0)) {
          if (fe.leaderAt === fe.stage) { v.act = 'pray'; return true; }
          if (!v.path || t.pathFor !== to) { t.pathFor = to; if (!H.goto(v, to[0], to[1], false)) { fe.leaderAt = fe.stage; return true; } }
          const last = fe.trail[fe.trail.length - 1];
          if (!last || G.dist(last[0], last[1], v.x, v.y) > 0.3) fe.trail.push([v.x, v.y]);
          if (H.move(v, dt, 0.7)) fe.leaderAt = fe.stage;
          return true;
        }
        // the column: each follows the leader's footsteps, two abreast
        const order = MARCH_ORDER(fe, v, role, k);
        const idx = fe.trail.length - 1 - Math.floor(order / 2) * 2 - 2;
        if (idx < 0) { if (!fe.trail.length) toSlot(v, t, dt, H, s === 'return' ? fe.B : fe.A); else v.moving = false; return true; }
        const p = fe.trail[idx]; const side = order % 2 ? 0.28 : -0.28;
        const q = fe.trail[Math.max(0, idx - 1)]; const dx = p[0] - q[0], dy = p[1] - q[1]; const l = Math.hypot(dx, dy) || 1;
        let tx = p[0] - dy / l * side, ty = p[1] + dx / l * side; if (!W.walkableXY(tx, ty)) { tx = p[0]; ty = p[1]; }
        if (G.dist(v.x, v.y, tx, ty) > 4) { if (!toSlot(v, t, dt, H, [tx, ty])) return true; }
        steer(v, tx, ty, dt, 0.95);
        if (role === 'chained') v.act = 'bound'; else if (!v.moving) v.act = role === 'soldier' ? 'guard' : '';
        return true;
      }
      case 'rite': case 'climb': {
        if (s === 'climb' && (role === 'victim' || role === 'leader' || role === 'priest')) {
          // up the steps: shown standing on top of the pyramid
          const T = fe.T; if (!T) return true;
          const [cx, cy] = G.Village.center(T);
          const f = Math.min(1, fe.stT / (fe.sdur * 0.6));
          const top = TEMPLE_TOP[T.style] || 26;
          const off = role === 'victim' ? 0 : role === 'leader' ? 0.18 : -0.18;
          const fx = T.x + T.w / 2 + 0.25 + (T.w / 2 + 0.05) * (1 - f) + off, fy = T.y + T.h / 2 + 0.25 + (T.h / 2 + 0.05) * (1 - f) - off;
          v.x = fx; v.y = fy; v.z = top * f; v.path = null; t.perch = true;
          v.act = f < 1 ? '' : role === 'victim' ? '' : 'pray'; v.moving = f < 1; if (f < 1) v.walkPh += dt * 4; v.face = -1;
          if (role === 'victim' && f < 1 && G.R() < dt * 1.5) G.FX && G.FX.chips(v.x, v.y, '#c8a060');
          void cx; void cy; return true;
        }
        if (toSlot(v, t, dt, H, slot)) { faceTo(v, (fe.B || C)[0], (fe.B || C)[1]); v.act = role === 'leader' ? 'pray' : role === 'bearer' ? '' : (G.R() < 0.5 ? 'pray' : ''); }
        return true;
      }
      case 'race': {
        if (role !== 'athlete') { if (toSlot(v, t, dt, H, slot)) { const c = fe.course; faceTo(v, c[2], c[3]); v.act = G.R() < 0.02 ? 'dance' : v.act; if (G.R() < dt * 0.2) G.Vg.emote(v, 'happy', 1); } return true; }
        const c = fe.course || [C[0], C[1], C[0] + 3, C[1]];
        const R = fe.racers[v.id] || (fe.racers[v.id] = { leg: 0, ready: false });
        if (!R.ready) { if (toSlot(v, t, dt, H, [c[0], c[1]])) { R.ready = true; } return true; }
        if (fe.stT < fe.sdur * 0.15) { v.act = ''; faceTo(v, c[2], c[3]); return true; }
        const goal = R.leg === 0 ? [c[2], c[3]] : [c[0], c[1]];
        const pace = 1.5 + (1 - Math.abs(v.age - 24) / 30) * 0.4 + v.courage * 0.2 + G.hash(v.id + G.S.day) * 0.25;
        if (R.leg < 2) { v.act = 'run'; if (steer(v, goal[0], goal[1], dt, pace)) R.leg++; if (!v.moving && R.leg < 2) { v.x += (goal[0] - v.x) * Math.min(1, dt * 2); v.y += (goal[1] - v.y) * Math.min(1, dt * 2); } }
        if (R.leg >= 2 && !fe.winner) { fe.winner = v.id; G.Vg.emote(v, 'happy', 3); }
        if (R.leg >= 2) v.act = v.id === fe.winner ? 'dance' : '';
        return true;
      }
      case 'relight': {
        if (role === 'runner' && fe.houses && fe.houses.length) {
          // torch runners go house to house
          if (!t.house || fe.lit.has(t.house)) { const h = fe.houses[(fe.hk++) % fe.houses.length]; t.house = h; t.pathFor = null; }
          const b = G.S.buildings.get(t.house); if (!b) { t.house = 0; return true; }
          const d = G.Vg.door(b);
          if (toSlot(v, t, dt, H, d, 1.5)) { fe.lit.add(b.id); t.house = 0; }
          v.act = 'run';
          return true;
        }
        if (toSlot(v, t, dt, H, slot)) { faceTo(v, C[0], C[1]); v.act = G.R() < 0.5 ? 'dance' : ''; }
        return true;
      }
      case 'end': {
        if (toSlot(v, t, dt, H, slot)) { v.act = fe.key === 'toxcatl' ? 'dance' : fe.key === 'vale' ? 'sit' : ''; faceTo(v, C[0], C[1]); }
        return true;
      }
    }
    return true;
  };
  const TEMPLE_TOP = { asteca: 26, egipcio: 14, grego: 6, romano: 7, nordico: 4, classico: 6 }; // px above the ground
  // who stands in the middle and does what, stage by stage
  function MIDDLE(fe, s, role, v) {
    const C = fe.C; const S = G.S;
    const at = (dx, dy) => [C[0] + dx, C[1] + dy];
    if (s === 'perform') {
      if (role === 'actor') { const k = (fe.roles.actor || []).indexOf(v.id); const a = fe.stT * 0.4 + k * 2.1; return { p: at(Math.cos(a) * 0.5, Math.sin(a) * 0.5), act: 'act', face: at(0, 2) }; }
      if (role === 'chorus') { const k = (fe.roles.chorus || []).indexOf(v.id); return { p: at(-0.9 + k * 0.35, 0.9), act: 'dance' }; }
    }
    if ((s === 'duel' || s === 'wrestle') && (role === 'gladiator' || role === 'athlete')) {
      const list = fe.roles[role] || []; const k = list.indexOf(v.id);
      if (k === 0 || k === 1) { const other = S.villagers.get(list[1 - k]); return { p: at(k ? 0.35 : -0.35, 0), act: s === 'duel' ? 'fight' : 'beat', face: other ? [other.x, other.y] : C }; }
    }
    if (s === 'bout') {
      if (role === 'victim') return { p: at(0, 0), act: 'fight' };
      if (role === 'gladiator') { const list = fe.roles.gladiator || []; const k = list.indexOf(v.id); const turn = Math.floor(fe.stT / (fe.sdur / Math.max(1, list.length))) % Math.max(1, list.length); return k === turn ? { p: at(0.5, 0.1), act: 'fight', face: C } : null; }
    }
    if (s === 'blot' && (role === 'leader' || role === 'bearer')) return { p: at(role === 'leader' ? 0.4 : -0.4, 0.2), act: role === 'leader' ? 'butcher' : 'pray', face: C };
    if (s === 'speech' && role === 'leader') return { p: at(0, 0), act: 'talk', face: at(1, 1) };
    if (s === 'newfire' && role === 'leader') return null;
    if (s === 'feast' && role === 'server') { const a = fe.stT * 0.3 + v.id; return { p: at(Math.cos(a) * 1.1, Math.sin(a) * 1.1), act: 'serve', run: false }; }
    if (s === 'water' && role !== 'crowd') return null;
    if (s === 'smash') return null;
    return null;
  }
  function crowdAct(fe, s, role, v) {
    if (role === 'chained') return 'bound';
    switch (s) {
      case 'feast': return role === 'guest' ? 'eat' : (v.id + Math.floor(fe.stT)) % 5 === 0 ? 'drink' : (v.id + Math.floor(fe.stT / 3)) % 3 === 0 ? 'talk' : 'eat';
      case 'vigil': return v.id % 3 === 0 ? 'mourn' : 'sit';
      case 'speech': return '';
      case 'smash': return fe.stT < fe.sdur * 0.6 ? 'throw' : '';
      case 'dark': return v.id % 4 === 0 ? 'pray' : '';
      case 'water': return 'fill';
      case 'perform': case 'duel': case 'bout': case 'wrestle': case 'race': return (v.id + Math.floor(fe.stT * 2)) % 7 === 0 ? 'dance' : '';
      case 'blot': return 'pray';
      case 'newfire': return 'pray';
      case 'crown': return 'dance';
    }
    return '';
  }
  // the order of the column: leader, bearers with the sacred thing, the beast, soldiers, chained captives, the crowd
  const RANK = { leader: 0, priest: 1, victim: 1, bearer: 2, athlete: 3, soldier: 4, chained: 5, server: 6, crowd: 7, guest: 7, runner: 7, actor: 7, chorus: 7, gladiator: 3 };
  function MARCH_ORDER(fe, v, role, k) {
    if (!fe.order || fe.orderStage !== fe.stage) {
      const S = G.S; fe.orderStage = fe.stage;
      const list = fe.parts.map(id => S.villagers.get(id)).filter(q => q && q.task && q.task.type === 'fest').sort((a, b) => (RANK[a.task.role] || 7) - (RANK[b.task.role] || 7) || a.id - b.id);
      fe.order = new Map(list.map((q, i) => [q.id, i]));
    }
    return fe.order.get(v.id) || k;
  }

  // ------------------------------ the calendar runs ------------------------------
  let tCheck = 0; let lastConq = new Map();
  FE.update = function (dt) {
    reset();
    const S = G.S;
    for (const fe of [...live.values()]) tick(fe, dt);
    // loyalty glow after a festival fades
    for (const s of S.settlements.values()) if (s.feast > 0) s.feast = Math.max(0, s.feast - dt);
    tCheck -= dt; if (tCheck > 0) return; tCheck = 0.5;
    for (const set of S.settlements.values()) {
      const f = G.Fac.get(set.fac); if (!f || !f.civ) continue;
      if ((set.tier || 0) < 1 && G.Village.pop(set.id) < 14) continue;
      if (FE.active(set.id) || set.alarmT > 0) continue;
      // a victory at war becomes a triumph in Rome
      const nc = f.st.conquests || 0; const pc = lastConq.get(f.id); lastConq.set(f.id, nc);
      if (pc !== undefined && nc > pc && f.civ === 'romano') f.pendingTriumph = S.day;
      // the triumph is not on the calendar: it follows a victory
      const tri = FE.of(f.civ).find(k => FE.DEF[k].trigger === 'victory');
      if (tri && f.pendingTriumph >= S.day - 1 && G.Fac.capitalOf(f.id) === set && S.time >= FE.DEF[tri].at && S.time <= FE.DEF[tri].at + 0.4) { f.pendingTriumph = -1; start(set, tri); continue; }
      const plan = yearPlan(set, f);
      if (!plan || plan.done) continue;
      const d = FE.DEF[plan.key];
      if (S.time < d.at || S.time > d.at + 0.03) continue;
      plan.done = true;
      const grand = plan.key === 'panateneias' && S.day % 4 === 0 && G.Fac.capitalOf(f.id) === set;
      if (!start(set, plan.key, { grand })) {
        // it could not be held (no temple, no captive...): the next one on the calendar, later in the year
        const next = FE.of(f.civ).filter(k => !FE.DEF[k].trigger && FE.DEF[k].every <= 1 && FE.DEF[k].at > S.time + 0.03);
        if (next.length) { plan.key = next[(set.festTurn || 0) % next.length]; plan.done = false; }
      }
    }
  };
  // the festival of the year for a town: the great cycles when they fall due (the Games every four
  // years, the New Fire every fifty-two), otherwise the next feast in turn. Small towns every other year.
  function yearPlan(set, f) {
    const S = G.S;
    if (set.festPlan && set.festPlan.day === S.day) return set.festPlan;
    const small = (set.tier || 0) < 2 && G.Village.pop(set.id) < 40;
    const cal = FE.of(f.civ).filter(k => !FE.DEF[k].trigger);
    const due = cal.filter(k => FE.DEF[k].every > 1 && ((S.day + (FE.DEF[k].off || 0)) % FE.DEF[k].every) === 0 && FE.DEF[k].every !== 2);
    const yearly = cal.filter(k => FE.DEF[k].every <= 1 || (FE.DEF[k].every === 2 && S.day % 2 === 0));
    let key = null;
    if (due.length) key = due[0];
    else if (!(small && (S.day + set.id) % 2)) { set.festTurn = (set.festTurn || 0) + 1; key = yearly.length ? yearly[set.festTurn % yearly.length] : null; }
    set.festPlan = { day: S.day, key, done: !key };
    return set.festPlan;
  }
  // the new fire: while it is out, no fire burns in the city
  FE.dark = function (setId) { reset(); for (const fe of live.values()) if (fe.set === setId && fe.dark) return fe; return null; };
  FE.darkB = function (b) { const fe = FE.dark(b.set); return !!fe && !fe.lit.has(b.id); };

  // ------------------------------ words ------------------------------
  const ROLE_TXT = { leader: 'Conduzindo', priest: 'Oficiando', bearer: 'Carregando', victim: '', athlete: 'Competindo', soldier: 'Desfilando', chained: 'Acorrentad', server: 'Servindo a mesa', guest: 'Convidado à mesa', runner: 'Correndo com a tocha', actor: 'Atuando', chorus: 'Cantando no coro', gladiator: 'Lutando', crowd: '' };
  FE.taskText = function (v, t) {
    if (t.type !== 'fest') return null;
    const fe = live.get(t.fid); if (!fe) return 'Voltando da festa';
    const d = FE.DEF[fe.key]; const nm = (fe.grand ? 'Grandes ' : '') + d.name; const na = ({ a: 'na', o: 'no', as: 'nas', os: 'nos' })[artOf(d, fe.grand)];
    const s = fe.sname; const r = t.role;
    if (r === 'victim') return fe.key === 'toxcatl' ? (s === 'climb' ? 'Subindo a pirâmide, quebrando suas flautas' : 'Vivendo como o deus Tezcatlipoca, pela última vez') : 'Amarrad' + (v.g === 'f' ? 'a' : 'o') + ' à pedra, lutando pela vida';
    if (r === 'bearer' && fe.props.peplos) return `Carregando o peplo ${na} ${nm}`;
    if (r === 'bearer' && fe.props.barca) return `Carregando a barca sagrada ${na} ${nm}`;
    if (r === 'chained') return `Acorrentad${v.g === 'f' ? 'a' : 'o'} no desfile ${({ a: 'da', o: 'do', as: 'das', os: 'dos' })[artOf(d, fe.grand)]} ${nm}`;
    const what = { gather: 'Reunindo-se para', march: 'Em procissão ' + na, return: 'Voltando em procissão ' + na, rite: 'Assistindo ao rito ' + na, feast: 'Banqueteando ' + na, vigil: 'Velando os mortos ' + na, dance: 'Dançando ' + na, perform: 'Assistindo ao teatro ' + na, race: 'Vendo a corrida ' + na, wrestle: 'Vendo a luta ' + na, duel: 'Vendo os gladiadores ' + na, bout: 'Vendo o combate ' + na, crown: 'Celebrando o campeão ' + na, blot: 'Assistindo ao blót ' + na, speech: 'Ouvindo as leis ' + na, water: 'Tirando água nova do rio ' + na, smash: 'Quebrando a cerâmica velha ' + na, dark: 'Esperando no escuro ' + na, newfire: 'Vendo o fogo novo nascer ' + na, relight: 'Reacendendo os lares ' + na, climb: 'Ao pé da pirâmide ' + na, end: 'Festejando ' + na }[s] || 'Festejando ' + na;
    const rt = ROLE_TXT[r];
    return rt && s !== 'gather' ? `${rt} ${na} ${nm}` : s === 'gather' ? `Reunindo-se para ${theName(d, fe.grand)}` : `${what} ${nm}`;
  };

  // ------------------------------ props ------------------------------
  const P = (dx, dy, z) => [(dx - dy) * 16, (dx + dy) * 8 - (z || 0)];
  function propPeplos(c, x, y, t) { const w = Math.sin(t * 3) * 1.2; c.fillStyle = '#e8a23a'; c.beginPath(); c.moveTo(x - 9, y - 18); c.quadraticCurveTo(x, y - 20 + w, x + 9, y - 18); c.lineTo(x + 8, y - 11); c.quadraticCurveTo(x, y - 13 + w, x - 8, y - 11); c.fill(); c.strokeStyle = '#6a2a5a'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(x - 8, y - 12.5); c.quadraticCurveTo(x, y - 14.5 + w, x + 8, y - 12.5); c.stroke(); c.fillStyle = '#6a2a5a'; c.beginPath(); c.arc(x, y - 16 + w * 0.5, 1.3, 0, 6.283); c.fill(); for (const s of [-8.5, 8.5]) { c.strokeStyle = '#6e4a2c'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(x + s, y - 18); c.lineTo(x + s, y - 6); c.stroke(); } }
  function propBarca(c, x, y, t) {
    const b = Math.sin(t * 2) * 0.4; y -= 13 + b;
    c.strokeStyle = '#6e4a2c'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(x - 10, y + 3); c.lineTo(x + 10, y + 3); c.stroke();
    c.fillStyle = '#e8b83a'; c.beginPath(); c.moveTo(x - 11, y - 3); c.quadraticCurveTo(x, y + 4, x + 11, y - 3); c.lineTo(x + 8, y + 1); c.lineTo(x - 8, y + 1); c.closePath(); c.fill();
    c.fillStyle = '#c8962a'; c.fillRect(x - 3, y - 7, 6, 5); c.fillStyle = '#2f8f8a'; c.fillRect(x - 3, y - 7.6, 6, 1);
    c.fillStyle = '#f2ecdc'; c.beginPath(); c.moveTo(x - 4, y - 7.6); c.lineTo(x, y - 10); c.lineTo(x + 4, y - 7.6); c.fill();
    c.fillStyle = '#e8b83a'; c.beginPath(); c.arc(x - 11, y - 4, 1.2, 0, 6.283); c.arc(x + 11, y - 4, 1.2, 0, 6.283); c.fill();
  }
  function propPole(c, x, y, t) {
    c.fillStyle = '#7a5a3a'; c.fillRect(x - 0.8, y - 34, 1.6, 34);
    c.strokeStyle = '#3f7a3a'; c.lineWidth = 2; c.beginPath(); c.ellipse(x, y - 30, 5, 2, 0, 0, 6.283); c.stroke();
    const cols = ['#c8483a', '#3f6fb0', '#e8b83a', '#f4efe3'];
    for (let k = 0; k < 6; k++) { const a = t * 0.8 + k * 1.05; c.strokeStyle = cols[k % 4]; c.lineWidth = 0.6; c.beginPath(); c.moveTo(x, y - 33); c.quadraticCurveTo(x + Math.cos(a) * 8, y - 20, x + Math.cos(a) * 14, y - 4 + Math.sin(a) * 3); c.stroke(); }
    c.fillStyle = '#f4d24a'; for (let k = 0; k < 5; k++) { const a = k / 5 * 6.283; c.beginPath(); c.arc(x + Math.cos(a) * 5, y - 30 + Math.sin(a) * 2, 0.8, 0, 6.283); c.fill(); }
  }
  function propStone(c, x, y) { c.fillStyle = '#8e877b'; c.beginPath(); c.ellipse(x, y - 2, 9, 4.4, 0, 0, 6.283); c.fill(); c.fillStyle = '#a8a094'; c.beginPath(); c.ellipse(x, y - 3.4, 9, 4.4, 0, 0, 6.283); c.fill(); c.strokeStyle = '#6a6258'; c.lineWidth = 0.5; c.beginPath(); c.ellipse(x, y - 3.4, 5, 2.4, 0, 0, 6.283); c.stroke(); }
  function propBonfire(c, x, y) { c.fillStyle = '#5a3a22'; for (let k = 0; k < 6; k++) { c.save(); c.translate(x, y - 2); c.rotate(k / 6 * 3.14); c.fillRect(-7, -1, 14, 2); c.restore(); } c.fillStyle = '#2a2220'; c.beginPath(); c.ellipse(x, y, 7, 3.4, 0, 0, 6.283); c.fill(); }
  function propAltar(c, x, y) { c.fillStyle = '#a8a094'; c.fillRect(x - 4, y - 5, 8, 5); c.fillStyle = '#c8c0b0'; c.fillRect(x - 4.6, y - 6, 9.2, 1.4); }
  G.renderHooks = G.renderHooks || { ground: [], ents: [] };
  const ents = new WeakMap();
  const ent = (fe, k, fn, x, y) => { let m = ents.get(fe); if (!m) ents.set(fe, m = {}); const e = m[k] || (m[k] = { fe, fn }); e.x = x; e.y = y; return e; };
  G.renderHooks.ents.push(function (add) {
    if (liveS !== G.S) return;
    const S = G.S;
    for (const fe of live.values()) {
      const C = fe.C;
      if (fe.props.peplos || fe.props.barca) {
        const bs = (fe.roles.bearer || []).map(id => S.villagers.get(id)).filter(v => v && v.task && v.task.type === 'fest');
        if (bs.length) { let x = 0, y = 0; for (const v of bs) { x += v.x; y += v.y; } x /= bs.length; y /= bs.length; const s = fe.sname; if (s !== 'feast' && s !== 'end' && !(s === 'rite' && fe.riteDone && fe.props.peplos)) add(x + y + 0.12, ent(fe, 'carry', fe.props.peplos ? drawPeplos : drawBarca, x, y), x, y); }
      }
      if (fe.props.pole && C) add(C[0] + C[1] + 0.01, ent(fe, 'pole', drawPole, C[0], C[1]), C[0], C[1]);
      if (fe.props.stone && C) add(C[0] + C[1] - 0.2, ent(fe, 'stone', drawStone, C[0], C[1]), C[0], C[1]);
      if (fe.props.bonfire && fe.props.fireOn && C) add(C[0] + C[1] + 0.01, ent(fe, 'fire', drawBonfire, C[0], C[1]), C[0], C[1]);
      if (fe.props.altar && fe.B) add(fe.B[0] + fe.B[1], ent(fe, 'altar', drawAltar, fe.B[0], fe.B[1]), fe.B[0], fe.B[1]);
      if (fe.props.newfire && fe.T) { const [cx, cy] = G.Village.center(fe.T); add(fe.T.x + fe.T.w + fe.T.y + fe.T.h + 0.5, ent(fe, 'nf', drawNewFire, cx, cy), cx, cy); }
    }
  });
  function drawPeplos(c, e, sx, sy, t) { propPeplos(c, sx, sy, t); }
  function drawBarca(c, e, sx, sy, t) { propBarca(c, sx, sy, t); }
  function drawPole(c, e, sx, sy, t) { propPole(c, sx, sy, t); }
  function drawStone(c, e, sx, sy) { propStone(c, sx, sy); }
  function drawAltar(c, e, sx, sy, t, nightF, fx) { propAltar(c, sx, sy); fx.fire(sx, sy - 6, 0.5); fx.light(sx, sy - 8, 40, 'warm', 0.7); }
  function drawBonfire(c, e, sx, sy, t, nightF, fx) { propBonfire(c, sx, sy); fx.fire(sx, sy - 3, 2.4 + 0.2 * Math.sin(t * 5)); fx.fire(sx - 4, sy - 1, 1.2); fx.fire(sx + 4, sy - 2, 1.4); fx.light(sx, sy - 10, 130 + Math.sin(t * 9) * 6, 'warm', 0.9); }
  function drawNewFire(c, e, sx, sy, t, nightF, fx) { const top = (TEMPLE_TOP[e.fe.T.style] || 26) + 4; fx.fire(sx, sy - top - 2, 2 + 0.3 * Math.sin(t * 6)); fx.light(sx, sy - top, 160, 'warm', 1); fx.glow(sx, sy - top - 4, 18, 'gold', 0.7); }
  void P;

  // ------------------------------ save ------------------------------
  (G.saveHooks = G.saveHooks || []).push({ save() { }, load() { live = new Map(); liveS = G.S; } });
})(window.G);
