'use strict';
// ============================================================
//  The tavern's feasts, each with its cause (T1 of the fourth wave:
//  D-818 to D-824). A tavern celebrates what happened in the world:
//  its people took a town (the conquest), a new ruler (after the
//  mourning, if the old one died; never a usurper's coup), its town
//  grew a step, the town held against the enemy (the victory), the
//  people's barns filled (the rich harvest), and the good news of
//  its keeper's own life — his wedding, a child born, the house that
//  prospered. The feast is that night (or the next, the cause come
//  after the closing), once a cause, and only where the world lets
//  one be (no war, no fire, no mourning, no sickness, no hunger:
//  G.TavernaContexto.semFesta). On it:
//   · the word at the door, and the keeper's speech (discurso) — the
//     cup raised, the reason told; the chronicle carries it to the
//     body's NOTÍCIA;
//   · the feast dish of the people — a plate that takes more of the
//     shelf, of the part it is of, only while there is enough;
//   · the round of the house, paid by the keeper by the ledger
//     («rodada-casa»: the drink of his shelf, given);
//   · the bards: the town's real musicians, playing together — one
//     at the stage, the others round it;
//   · the decorations of what the people has — the flowers of its
//     gardens or of the land, the ribbons of the cloth it weaves,
//     its banners, the lamps of its oil or its wax —, spent by the
//     ledger («enfeites»);
//   · the dance in a ring, and the drinking match.
//  And any night, between two strong ones at a table — of the índole
//  for it, the drink helping —, the arm wrestle, with the bet by the
//  ledger and the table round them cheering. The strength is the
//  heavy trade's and the years', never the look.
//  b.festa = { motivo, causa, dia, ate, prato, enfeites: [{ k, de }],
//  bardos: [ids] } (the contract of the fourth wave; ate the day it
//  ends, a day of the world, read by the sound) — only this file
//  writes it (guard rule 345). No chance of the world in any of it:
//  the índole, the drink, the clock and the ids (G.hash).
// ============================================================
(function (G) {
  const T = G.Taverna, A = G.Act, D = G.Depot, E = G.Eco; if (!T || !A || !D || !E) return;
  const TF = G.TavernaFesta = {};
  const TC = () => G.TavernaContexto;
  const OR = () => G.Origem;
  const S_ = () => G.S;
  const EPS = 1e-6;
  const r1 = x => Math.round(x * 10) / 10;
  const r2 = x => Math.round(x * 100) / 100;
  const fidOf = b => G.Village.facOfSet(b.set);
  const say = (v, key, ctx) => G.Falas && v && G.Falas.say(v, key, ctx);
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);
  const oa = v => (v && v.g === 'f' ? 'a' : 'o');
  const ax = (v, k) => (G.Indole ? G.Indole.ax(v, k) : 50) / 99;
  const fac = (v, k) => (G.Indole && G.Indole.faceta ? G.Indole.faceta(v, k) : 0.5);
  const coin = b => !!(G.Eco && G.Eco.coinage && G.Eco.coinage(fidOf(b)));

  // ------------------------------ the numbers ------------------------------
  TF.OLHA = 4;          // seconds of the world between two looks at the causes
  TF.VALE = 1;          // days a cause is celebrated within
  TF.MEMORIA = 12;      // the causes a house remembers having celebrated
  TF.DISCURSO_N = 3;    // at the tables for the speech — or, past TF.DISCURSO_ATE of the day after the opening, with whoever is there
  TF.DISCURSO_ATE = 0.05;
  TF.DISCURSO_T = 4.5;  // the speech's seconds
  TF.PRATO_MIN = 4;     // of the part the feast dish is of, on the shelf: the dish is on
  TF.PRATO_N = 1.5;     // what a plate of it takes of the shelf (a plain plate takes 1)
  TF.BARDOS = [2, 3, 4]; // the bards of a feast: the small house, the tavern, the inn
  TF.WISH = 0.4;        // the feast night: the wish of the night higher for all
  TF.BARDO_GO = 1.2;    // a bard's errand to the feast: above the evening's other choices
  TF.PANO = 0.5;        // the cloth of the ribbons, and of the banners; the wood of the banners' poles; the oil or wax of the lamps
  TF.MADEIRA = 1;
  TF.LUZ = 0.15;
  TF.RODA = 3;          // dancers for a ring
  TF.CONC_X = 0.55;     // who takes up the drinking match: of the índole past this
  TF.CONC_DEPOIS = 25;  // seconds after the speech before a match may start, and between two of its rounds
  TF.CONC_T = 7;
  TF.CONC_MAX = 4;      // at most in a match
  TF.CONC_LIM = 0.85;   // how drunk one gives up at — more, the stubborn
  TF.CONC_TEIMA = 0.45;
  TF.FORTE = 0.62;      // the arm wrestle: strong past this, of the índole past TF.BRACO_X
  TF.BRACO_X = 0.5;
  TF.BRACO_JAN = 40;    // a table's look for one, each this many seconds; its share of the looks, a plain night and a feast
  TF.BRACO_P = 0.2;
  TF.BRACO_PF = 0.45;
  TF.BRACO_T = 6;       // its seconds, and up to 3 more by the pair
  TF.APOSTA = 0.2;      // the bet
  TF.FIM_T = 1.5;       // the seconds the end of a wrestle shows

  // ------------------------------ the causes ------------------------------
  // (a reign a tavern drinks to — never a usurper's coup — and how it is said)
  const REIGN = { heranca: 1, escolha: 1, eleicao: 1, ungido: 1, revolucao: 1, fundacao: 1, secessao: 1, divina: 1 };
  const ORDER = ['conquista', 'vitoria', 'governante', 'cidade', 'colheita', 'casamento', 'filho', 'prospera'];
  TF.MOTIVOS = Object.freeze(ORDER.slice());
  TF.festa = b => { const f = b && b.festa; return f && f.dia >= S_().day - (f.fim ? 0 : 1) ? f : null; };
  // the feast of tonight at a tavern, open (prepared and not ended) — or none
  TF.noiteDe = function (b) { const f = b && b.festa; return f && f.dia === S_().day && f.fase >= 1 && f.fase < 9 ? f : null; };
  const done = (b, k) => Array.isArray(b.festas) && b.festas.includes(k);
  // (the causes of a town and of a people, each look: what has a day of its own is read from the world — the conquest's set.conq, the
  // victory's set.victory, the reign's from —; what has none, by the world's memory of the step it was at — G.mod, in the save: the
  // town's highest step, the people's barns full or not)
  function townCauses(set, f, out) {
    const S = S_(); const fid = f.id;
    for (const s of S.settlements.values()) if (s.fac === fid && Number.isFinite(s.conq) && s.origFac !== fid && S.day - s.conq <= TF.VALE) out.push({ m: 'conquista', c: `a conquista de ${s.name}`, k: `conq:${s.id}:${s.conq}`, d: s.conq });
    if (Number.isFinite(set.victory) && S.day - set.victory <= TF.VALE) out.push({ m: 'vitoria', c: `a vitória de ${set.name}: o inimigo recuou`, k: `vit:${set.id}:${set.victory}`, d: set.victory });
    const r = f.rulers && f.rulers[f.rulers.length - 1];
    if (r && r.to === undefined && r.id === f.leader && REIGN[r.how]) {
      // (after a ruler who died, the mourning first: the new one is drunk to when it is over — D-818)
      const prev = f.rulers.length > 1 ? f.rulers[f.rulers.length - 2] : null; const due = r.from + (prev && (prev.end === 'morte' || prev.end === 'batalha') && prev.to >= r.from - 1 ? TC().LUTO : 0);
      const v = S.villagers.get(r.id); const P = G.Politics;
      if (v && S.day >= due && S.day - due <= TF.VALE) out.push({ m: 'governante', c: `${P && P.title ? 'o novo ' + P.title(f, v).toLowerCase() + ', ' : 'o novo governante, '}${P && P.regnal ? P.regnal(v) : v.name}`, k: `gov:${fid}:${r.id}:${r.from}`, d: due });
    }
    const key = 'tf.best.' + set.id; const best = set.best || 0; const mem = G.mod(key);
    if (mem === undefined) G.mod(key, best);
    else if (best > mem) { G.mod(key, best); G.mod(key + '.d', S.day); }
    const bd = G.mod(key + '.d'); const TI = G.City && G.City.TIERS;
    if (Number.isFinite(bd) && S.day - bd <= TF.VALE && best >= 1) out.push({ m: 'cidade', c: `${set.name} virou ${TI ? (best >= 4 ? 'uma ' : best === 1 ? 'uma ' : 'uma ') + TI[best].toLowerCase() : 'maior'}`, k: `cid:${set.id}:${best}`, d: bd });
    // (the barns full: the people's store past nine tenths of what it holds, from under seven — once a year of the world at the most)
    const cap = G.Village.cap(fid) || 1; const food = f.stock.food || 0; const fk = 'tf.farto.' + fid; const was = G.mod(fk);
    if (was === undefined) G.mod(fk, food >= cap * 0.9 ? 1 : 0);
    else if (!was && food >= cap * 0.9) { G.mod(fk, 1); const ld = G.mod(fk + '.d'); if (!Number.isFinite(ld) || S.day - ld >= 1) G.mod(fk + '.d', S.day); }
    else if (was && food < cap * 0.7) G.mod(fk, 0);
    const fd = G.mod(fk + '.d'); if (Number.isFinite(fd) && S.day - fd <= TF.VALE) out.push({ m: 'colheita', c: `a colheita que encheu o celeiro de ${f.name}`, k: `col:${fid}:${fd}`, d: fd });
  }
  // (the good news of the keeper's own life: the wedding — the pair's door, G.Vg.pairHooks, queues it —, a child born in the last day,
  // the house that prospered — the interiors' record of its wealth, a step up)
  function keeperCauses(b, k, out) {
    const S = S_();
    for (const q of Array.isArray(b.festaQ) ? b.festaQ : []) if (q && S.day - q.d <= TF.VALE) out.push(q);
    for (const id of k.kids || []) { const c = S.villagers.get(id); if (c && c.age < 1) out.push({ m: 'filho', c: `o nascimento de ${c.name}, filh${oa(c)} de ${k.name}`, k: `fil:${c.id}`, d: S.day }); }
    const h = b.ip && Array.isArray(b.ip.h) ? b.ip.h.filter(x => Array.isArray(x) && x[1] === 'riqueza') : [];
    if (h.length) { const last = h[h.length - 1]; const before = h.length > 1 ? +h[h.length - 2][2] : 0; if (S.day - last[0] <= TF.VALE && +last[2] > before) out.push({ m: 'prospera', c: 'a casa que prosperou', k: `pro:${b.id}:${last[0]}`, d: last[0] }); }
  }
  // (the wedding of a keeper — or of a keeper's: either of the pair keeps a tavern —, queued at his house in the step)
  if (G.Vg && G.Vg.pairHooks) G.Vg.pairHooks.push((a, c, como, on) => {
    if (!on || !G.inSim || !a || !c) return; const S = S_();
    for (const v of [a, c]) { const b = v.role === 'taverneiro' && v.job ? S.buildings.get(v.job) : null; if (!b || b.type !== 'taverna') continue;
      const q = Array.isArray(b.festaQ) ? b.festaQ.filter(x => x && S.day - x.d <= TF.VALE) : []; q.push({ m: 'casamento', c: `o casamento de ${a.name} e ${c.name}`, k: `cas:${Math.min(a.id, c.id)}:${Math.max(a.id, c.id)}:${S.day}`, d: S.day }); b.festaQ = q.slice(-4); }
  });
  // the look (each TF.OLHA seconds of the world, by the world's clock): the feasts of yesterday taken down; for each tavern with its keeper
  // and none planned, its strongest cause not yet celebrated, if the world lets a feast be — planned for tonight, or for the next night
  function look() {
    const S = S_(); if (S.clock < (G.mod('tf.olha') || 0)) return; G.mod('tf.olha', r1(S.clock + TF.OLHA));
    const byTown = new Map();
    for (const set of S.settlements.values()) {
      const L = E.byType(set.id, 'taverna'); if (!L.length) continue; const f = G.Fac.get(set.fac); if (!f) continue;
      const tc = []; townCauses(set, f, tc); byTown.set(set.id, tc);
      for (const b of L) {
        if (!b.built) continue;
        if (b.festa && b.festa.dia < S.day) delete b.festa; // (the decorations down the next day)
        if (Array.isArray(b.festaQ)) { b.festaQ = b.festaQ.filter(q => q && S.day - q.d <= TF.VALE); if (!b.festaQ.length) delete b.festaQ; }
        if (b.festa) continue; const k = T.keeperOf(b); if (!k || A.isBody(k)) continue;
        const why = TC() ? TC().semFesta(b) : ''; if (why) continue;
        const own = []; keeperCauses(b, k, own);
        const all = tc.concat(own).filter(q => !done(b, q.k)).sort((p, q) => ORDER.indexOf(p.m) - ORDER.indexOf(q.m) || (p.k < q.k ? -1 : p.k > q.k ? 1 : 0));
        if (all.length) plan(b, k, all[0]);
      }
    }
  }
  // (a feast planned: tonight while the tavern has time before its closing; else the next night)
  function plan(b, k, q) {
    const S = S_(); const h = T.horas(b); const dia = S.time < h.fecha - 0.08 ? S.day : S.day + 1;
    b.festas = (Array.isArray(b.festas) ? b.festas : []).concat([q.k]).slice(-TF.MEMORIA);
    b.festa = { motivo: q.m, causa: q.c, dia, ate: dia, prato: null, enfeites: [], bardos: [], por: k.id, chave: q.k, fase: 0, anuncio: `Hoje, festa: ${q.c}!` };
  }
  TF.plan = (b, m, c, k) => { if (!G.inSim || !b || b.festa || !ORDER.includes(m)) return null; const kp = T.keeperOf(b); if (!kp) return null; plan(b, kp, { m, c: c || m, k: k || `mao:${m}:${b.id}:${S_().day}`, d: S_().day }); return b.festa; }; // (the proofs' and the god's hand)

  // ------------------------------ the preparing, at the opening (D-819, D-820) ------------------------------
  // the feast dish of each people: the part of the food it is of, and its name — the first whose part the shelf has enough of
  TF.BANQUETE = Object.freeze({
    romano: [['carne', 'leitão assado com mel'], ['peixe', 'peixe com garo e ervas'], ['trigo', 'pão de festa com mel e queijo']],
    grego: [['carne', 'cordeiro no espeto'], ['peixe', 'peixe grelhado com azeite'], ['trigo', 'bolo de mel e trigo']],
    egipcio: [['carne', 'ganso assado'], ['peixe', 'peixe do rio com tâmaras'], ['cevada', 'pão doce de tâmaras'], ['trigo', 'pão doce de tâmaras']],
    nordico: [['carne', 'javali assado no espeto'], ['peixe', 'arenque defumado'], ['cevada', 'pão de cevada com manteiga']],
    asteca: [['carne', 'peru com molho de cacau'], ['milho', 'tamales da festa'], ['peixe', 'peixe do lago com pimenta']],
    classico: [['carne', 'carne assada da festa'], ['peixe', 'peixe da festa'], ['trigo', 'o pão da festa'], ['cevada', 'o pão da festa']],
  });
  function dishOf(b) {
    if (!OR() || (TC() && TC().fome(b))) return null; const f = G.Fac.get(fidOf(b)); const L = TF.BANQUETE[(f && f.civ) || 'classico'] || TF.BANQUETE.classico;
    for (const [de, nome] of L) if (OR().free('b:' + b.id, 'food', [de]) >= TF.PRATO_MIN - EPS) return { de: [de], nome }; // (de: the parts it spends, T7's)
    return null;
  }
  // the decorations: what the people has, each spent by the ledger where it is a good — the flowers gathered, a garland and the petals
  // (of its gardens, or of the flora of a land that is not of snow), the bunting and the drapes of its cloth, its banners — of the cloth
  // on a pole of the house's wood, or a board of the wood —, the candles of the house's wax (the kinds the drawing knows, T7: D-880)
  function decorate(b, k) {
    const S = S_(); const fid = fidOf(b); const out = []; const ref = 'b:' + b.id, st = 'f:' + fid;
    const use = (from, g, n) => D.use(from, g, n, { code: 'enfeites', by: k.id }).ok;
    const horta = [...S.buildings.values()].some(q => q.type === 'horta' && q.built && q.set === b.set);
    const cold = G.Atmos && G.Atmos.cold ? G.Atmos.cold(b.x + b.w / 2, b.y + b.h / 2) : 0;
    const fl = horta ? 'horta' : cold < 2 ? 'flora' : null; if (fl) { out.push({ k: 'guirlanda', de: fl }); out.push({ k: 'petalas', de: fl }); }
    if (D.free(st, 'tecido') >= TF.PANO * 2 - EPS && use(st, 'tecido', TF.PANO)) out.push({ k: 'fita', de: 'pano' });
    if (D.free(st, 'tecido') >= TF.PANO * 3 - EPS && use(st, 'tecido', TF.PANO)) out.push({ k: 'pano', de: 'pano' });
    const pole = D.free(ref, 'wood') >= TF.MADEIRA - EPS ? ref : D.free(st, 'wood') >= TF.MADEIRA + 2 - EPS ? st : null;
    if (pole && D.free(st, 'tecido') >= TF.PANO - EPS && use(st, 'tecido', TF.PANO) && use(pole, 'wood', TF.MADEIRA)) out.push({ k: 'estandarte', de: 'pano' });
    else if (pole && use(pole, 'wood', TF.MADEIRA)) out.push({ k: 'estandarte', de: 'madeira' });
    if (D.free(ref, 'cera') >= TF.LUZ * 2 - EPS && use(ref, 'cera', TF.LUZ)) out.push({ k: 'vela', de: 'cera' });
    return out;
  }
  // the bards: the town's own who play — the índole's ext and abe, the sociable (T.muse) —, grown, free, the most of it first
  function bardsOf(b, k) {
    const S = S_(); const L = []; const sz = ({ taberna: 0, taverna: 1, hospedaria: 2 })[b.esc]; const max = TF.BARDOS[sz === undefined ? 1 : sz];
    for (const v of S.villagers.values()) {
      if (v.set !== b.set || v === k || A.isBody(v) || v.captive || v.jail || v.aboard || v.age < 16 || v.age >= 70 || v.sick > 0 || v.role === 'taverneiro') continue;
      const s = T.muse(v); if (s >= T.MUSE) L.push([s, v.id]);
    }
    L.sort((p, q) => q[0] - p[0] || p[1] - q[1]); return L.slice(0, max).map(x => x[1]);
  }
  // (the feast opened with the day: the decorations up, the bards called, the dish chosen — once)
  TF.prep = function (op, b) {
    const f = TF.festa(b); if (!f || f.dia !== S_().day || f.fase !== 0 || !G.inSim) return; const k = T.keeperOf(b); if (!k) return;
    f.enfeites = decorate(b, k); f.bardos = bardsOf(b, k); f.prato = dishOf(b); f.fase = 1; f.aberta = r1(S_().clock);
  };
  // (the plate of the feast: its name, what it takes of the shelf and of which part — while there is enough of it; else the plain plate)
  TF.pratoFor = function (b) {
    const f = TF.noiteDe(b); if (!f || !f.prato || f.prato.fim) return null;
    if (OR() && OR().free('b:' + b.id, 'food', f.prato.de) >= TF.PRATO_N - EPS) return { n: TF.PRATO_N, of: f.prato.de.slice(), dish: f.prato.nome };
    f.prato.fim = r1(S_().clock); return null;
  };
  // (who is a bard of a feast tonight at a tavern of one's town: that tavern)
  TF.bardoDe = function (v) { if (!v || v.age < 16) return null; for (const b of E.byType(v.set, 'taverna')) { const f = TF.noiteDe(b); if (f && f.bardos.includes(v.id)) return b; } return null; };
  // (the feast night's wish: higher for all; a bard's, the errand to it)
  TF.vontade = b => (TF.noiteDe(b) ? TF.WISH : 0);

  // ------------------------------ the speech and the round of the house (D-821) ------------------------------
  // (the keeper at his counter: the speech when the room has its people — or the night is on —, before anything else)
  TF.fala = function (v, t, b, op) {
    const f = TF.noiteDe(b); if (!f || f.fase !== 1 || f.por !== v.id && T.keeperOf(b) !== v) return false;
    const n = Object.keys(op.data.mesa).length; const h = T.horas(b);
    if (n < TF.DISCURSO_N && S_().time < h.abre + TF.DISCURSO_ATE) return false;
    t.st = 40; v.actT = 0; return true;
  };
  // (st 40: the cup raised, the reason told — the slate, the chronicle that the body hears; at its end the round of the house)
  TF.runKeeper = function (v, t, b, op, H) {
    const S = S_(); const f = TF.noiteDe(b); if (!f || t.st !== 40) return false;
    v.act = 'discurso';
    if (!t.disc && v.actT >= 0.4) {
      t.disc = 1; say(v, 'festa_discurso', { bem: f.causa }); const set = S.settlements.get(b.set);
      log(`Festa na taverna de ${set ? set.name : ''}: ${f.causa}. ${v.name} ergueu a caneca${f.prato ? ` e mandou servir ${f.prato.nome}` : ''} — a primeira rodada é da casa.`, 'fest', b.x + b.w / 2, b.y + b.h / 2);
      const o = op.data.atos || (op.data.atos = {}); const e = o.discurso || (o.discurso = {}); e['festa:' + f.motivo] = (e['festa:' + f.motivo] || 0) + 1;
    }
    if (v.actT < TF.DISCURSO_T) return true;
    f.fase = 2; f.discurso = r1(S.clock); rodada(op, b); t.st = 1; t.disc = 0; v.actT = 0; return true;
  };
  // (the round of the house: everyone of the world at the tables with the hands free asks for a drink, the keeper's to give — serve()
  // pours it with no coin, «rodada-casa», D-821)
  function rodada(op, b) {
    const S = S_(); const d = op.data; let n = 0;
    for (const id of Object.keys(d.mesa).sort((p, q) => p - q)) {
      const m = d.mesa[id]; const v = S.villagers.get(+id); if (!v || m.body || m.corpo || m.st === 6 || m.st === 9 || (v.carry && v.carry.n > EPS)) continue;
      if (!(m.st === 2 || m.st === 5 || m.st === 4)) continue;
      m.casa = 1; m.want = 'drink'; m.st = 2; if (v.task && v.task.type === 'tavern' && v.task.op === op.id) v.task.st = 2; if (!d.fila.includes(+id)) d.fila.push(+id); n++;
    }
    const f = TF.noiteDe(b); if (f) f.rodada = n;
  }

  // ------------------------------ the bards together (D-822) ------------------------------
  // (a bard at the tables of his feast, the leader at the stage: the others play round it, as long as his set — the same instrument
  // of the people's kit, standing by the stage)
  TF.coro = function (op, b, lead) {
    const S = S_(); const f = TF.noiteDe(b); if (!f) return; const d = op.data; const In = G.Interiors; const lt = lead.task; const mp = In && In.placeOf ? In.placeOf(lead) : null;
    const coro = [];
    for (const id of f.bardos) {
      if (id === lead.id) continue; const m = d.mesa[id]; const v = S.villagers.get(id); if (!m || !v || m.st !== 5 || !v.task || v.task.type !== 'tavern' || m.zz || (v.carry && v.carry.n > EPS)) continue;
      const t = v.task; m.use = t.use; t.use = 'dancar'; t.near = mp && mp.item ? [mp.item, mp.q] : null; t.st = 6; m.st = 6; t.coro = 1; t.mw = lt.mw; t.me = lt.me; v.actT = 0; coro.push(id);
      if (!d.musicos.includes(id)) d.musicos.push(id);
    }
    d.coro = coro; f.tocaram = Array.from(new Set((f.tocaram || []).concat([lead.id], coro)));
  };
  // (the feast's music: the bards before anyone, from the opening — the first of them at the tables)
  TF.lider = function (op, b) { const f = TF.noiteDe(b); if (!f || f.fase < 2) return null; const d = op.data; for (const id of f.bardos) { const m = d.mesa[id]; if (m && m.st === 5 && !m.zz) return S_().villagers.get(id) || null; } return null; };

  // ------------------------------ the drinking match and the arm wrestle (D-823, D-824) ------------------------------
  const compete = v => 0.5 * fac(v, 'ambicioso') + 0.3 * ax(v, 'ext') + 0.2 * (1 - ax(v, 'con'));
  // how drunk one is: the drink's own measure where the world keeps it (v.ebrio, T2's), else the rounds of the night
  TF.bebado = v => (typeof v.ebrio === 'number' && Number.isFinite(v.ebrio) ? v.ebrio : (v.drinks || 0) * 0.22);
  const limite = v => TF.CONC_LIM + TF.CONC_TEIMA * (0.6 * fac(v, 'ambicioso') + 0.4 * fac(v, 'confiante'));
  TF.limite = limite;
  // (the strength of an arm: the heavy trade — the forge, the mine, the axe, the stone, the quay, the arms —, the years — the best from
  // 22 to 40 —, the health; never the look)
  const HEAVY = { ferreiro: 0.3, mineiro: 0.3, lenhador: 0.25, construtor: 0.22, estivador: 0.28, guerreiro: 0.26, cacador: 0.15, pescador: 0.12, agricultor: 0.14, lavrador: 0.14, pastor: 0.1, acougueiro: 0.18, ourives: 0.05 };
  TF.forca = function (v) {
    const a = v.age || 0; const yr = a < 16 ? 0 : a < 22 ? 0.1 + (a - 16) * 0.017 : a <= 40 ? 0.2 : a < 60 ? 0.2 - (a - 40) * 0.009 : 0.02;
    const r = HEAVY[v.roleBack || v.role] || 0; const hp = Math.max(0, Math.min(1, (v.hp === undefined ? 100 : v.hp) / 100));
    return r2(0.3 + r + yr + 0.12 * hp);
  };
  const seated = (v, m, op) => !!v && !!v.task && v.task.type === 'tavern' && v.task.op === op.id && !m.body && !m.corpo && !m.zz && !(T.brawling && T.brawling(v));
  // (a table's own look: the arm wrestle of two of it — once a while, by the hash of the day, the table and the moment)
  TF.mesa = function (op, b, d, g, L) {
    const S = S_(); if (TC() && TC().calado(b)) return; const B = d.braco || (d.braco = {});
    const w = B[g];
    if (w) { if (S.clock >= w.ate + TF.FIM_T || !d.mesa[w.a] || !d.mesa[w.b]) { if (!w.fim && d.mesa[w.a] && d.mesa[w.b]) end(op, b, w); delete B[g]; } else if (S.clock >= w.ate && !w.fim) end(op, b, w); return; }
    if (d.jogo && d.jogo[g]) return;
    const k = Math.floor(S.clock / TF.BRACO_JAN); const jk = d.bk || (d.bk = {}); if (jk[g] === k) return; jk[g] = k;
    const fest = !!TF.noiteDe(b); const gn = T.gk ? T.gk(g) : 0;
    if (G.hash(Math.imul(op.id | 0, 31) + Math.imul(gn, 7) + Math.imul(k, 977) + 11) >= (fest ? TF.BRACO_PF : TF.BRACO_P)) return;
    const C = L.filter(([v, m]) => m.st === 5 && seated(v, m, op) && !(v.carry && v.carry.n > EPS) && v.age >= 18 && v.age < 58 && v.hp > 50 && ((m.r || 0) >= 1 || (v.drinks || 0) >= 1) && TF.forca(v) >= TF.FORTE && compete(v) >= TF.BRACO_X && !(d.concurso && d.concurso.quem.includes(v.id)))
      .map(([v]) => v).sort((p, q) => TF.forca(q) - TF.forca(p) || p.id - q.id);
    if (C.length < 2) return;
    const a = C[0], c = C[1]; const h1 = G.hash(Math.imul(a.id | 0, 53) + Math.imul(k, 17) + 5), h2 = G.hash(Math.imul(c.id | 0, 53) + Math.imul(k, 17) + 5);
    const vence = TF.forca(a) + 0.25 * h1 >= TF.forca(c) + 0.25 * h2 ? a.id : c.id;
    const bet = coin(b) && E.purse(a) >= TF.APOSTA + T.PRICE.drink && E.purse(c) >= TF.APOSTA + T.PRICE.drink && E.coinRef(a) !== E.coinRef(c) ? TF.APOSTA : 0;
    B[g] = { a: a.id, b: c.id, t0: r1(S.clock), ate: r1(S.clock + TF.BRACO_T + 3 * G.hash(Math.imul(a.id | 0, 7) + Math.imul(c.id | 0, 11) + k)), vence, aposta: bet, por: fest ? 'festa' : (a.drinks || 0) >= 2 ? 'bebida' : 'indole' };
  };
  function end(op, b, w) {
    w.fim = r1(S_().clock); const S = S_(); const W = S.villagers.get(w.vence), Lo = S.villagers.get(w.vence === w.a ? w.b : w.a); if (!W || !Lo) return;
    if (w.aposta && E.purse(Lo) + EPS >= w.aposta) { if (E.spend(Lo, w.aposta, E.coinRef(W), 'aposta-braco')) w.pago = w.aposta; }
    if (G.Lacos) G.Lacos.ato(W, Lo, fac(Lo, 'rancoroso') > 0.6 ? 'atrito' : 'mesa');
    if (G.Fama && G.Fama.feito) G.Fama.feito(W, 'braco');
    const o = op.data.atos || (op.data.atos = {}); const e = o['queda-de-braco'] || (o['queda-de-braco'] = {}); e[w.por] = (e[w.por] || 0) + 1;
    op.data.bracos = (op.data.bracos || 0) + 1;
  }
  // (the night's own look: the feast prepared, the match started and run, the ring of the dancers)
  TF.noite = function (op, b) {
    const S = S_(); const d = op.data; const f = b.festa && b.festa.dia === S.day ? b.festa : null;
    if (f && f.fase === 0) TF.prep(op, b);
    // (the ring: three or more dancing to the feast's music — who they are, for the drawing of the ring)
    if (TF.noiteDe(b)) { const q = Object.keys(d.mesa).filter(id => d.mesa[id].st === 9).map(Number).sort((p, c) => p - c); if (q.length >= TF.RODA) { if (!d.roda || d.roda.quem.join() !== q.join()) d.roda = { quem: q, t: r1(S.clock) }; } else if (d.roda) delete d.roda; }
    else if (d.roda) delete d.roda;
    match(op, b);
  };
  function match(op, b) {
    const S = S_(); const d = op.data; const f = TF.noiteDe(b);
    let c = d.concurso;
    if (!c) {
      if (!f || f.fase < 2 || d.concursoN || S.clock < (f.discurso || 0) + TF.CONC_DEPOIS) return;
      const L = [];
      for (const id of Object.keys(d.mesa)) { const m = d.mesa[id]; const v = S.villagers.get(+id); if (!v || !seated(v, m, op) || !(m.st === 5 || m.st === 3) || v.age < 18 || v.age >= 60 || v.energy < 30 || (m.r || 0) < 1) continue;
        if (coin(b) && E.purse(v) + EPS < T.PRICE.drink * 3) continue; const s = compete(v); if (s >= TF.CONC_X) L.push([s, v.id]); }
      if (L.length < 2) return;
      L.sort((p, q) => q[0] - p[0] || p[1] - q[1]);
      c = d.concurso = { quem: L.slice(0, TF.CONC_MAX).map(x => x[1]), t0: r1(S.clock), prox: r1(S.clock + 2), rodadas: {}, fora: {}, n: 0 }; d.concursoN = 1;
      say(S.villagers.get(c.quem[0]), 'concurso_desafio', {});
    }
    if (c.fim) { if (S.clock > c.fim + 4) delete d.concurso; return; }
    if (S.clock < c.prox) return;
    c.prox = r1(S.clock + TF.CONC_T); c.n++;
    const k = T.keeperOf(b);
    for (const id of c.quem) {
      if (c.fora[id]) continue; const v = S.villagers.get(id); const m = d.mesa[id];
      // (out: up and gone — the drink's own fall takes one from the table —, fainted, out of coin, or past what one takes)
      if (!v || !m || !v.task || v.task.type !== 'tavern' || v.act === 'desmaio') { c.fora[id] = 'caiu'; continue; }
      if (TF.bebado(v) >= limite(v)) { c.fora[id] = 'desistiu'; continue; }
      if (coin(b) && E.purse(v) + EPS < T.PRICE.drink) { c.fora[id] = 'sem-dinheiro'; continue; }
      // (the round of each, by his own coin: poured from the shelf — by the keeper's hand, or one's own — and downed at once)
      if (v.carry && v.carry.op === op.id && v.carry.n > EPS && v.carry.k !== 'food') T.gole(v, op);
      m.want = 'drink'; const r = T.serve(op, k && !A.isBody(k) && k.inside === b.id ? k : v, v);
      if (!r.ok) { c.fora[id] = 'acabou'; continue; }
      T.gole(v, op); c.rodadas[id] = (c.rodadas[id] || 0) + 1; m.st = 5; if (v.task) v.task.st = 5; m.cm = r1(S.clock);
    }
    const left = c.quem.filter(id => !c.fora[id]);
    if (left.length <= 1) {
      let w = left[0] || 0; if (!w) { let best = -1; for (const id of c.quem) { const n = c.rodadas[id] || 0; if (n > best) { best = n; w = id; } else if (n === best) w = 0; } }
      c.fim = r1(S.clock); c.vence = w; const W = S.villagers.get(w);
      const o = d.atos || (d.atos = {}); const e = o['concurso-bebida'] || (o['concurso-bebida'] = {}); e.festa = (e.festa || 0) + 1;
      if (W) { if (G.Fama && G.Fama.feito) G.Fama.feito(W, 'concurso'); say(W, 'concurso_vence', {}); }
    }
  }
  // what one does between the rounds by the feast and the table (mood, act-taverna.js): in the match — the draughts —, at the arm
  // wrestle, or cheering one on round it. The torcida is of who is in the room with them: the match's, everyone; the wrestle's, the table
  TF.TORCE_T = 3;
  TF.actOf = function (v, m, op, b) {
    const S = S_(); const d = op.data;
    const c = d.concurso;
    if (c && !c.fim && c.quem.includes(v.id) && !c.fora[v.id]) return 'concurso-bebida';
    const w = m.g && d.braco ? d.braco[m.g] : null;
    if (w && (w.a === v.id || w.b === v.id)) return 'queda-de-braco';
    if (w && !w.fim) return 'torcer';
    if (c && (!c.fim || S.clock - c.fim < TF.TORCE_T) && !c.quem.includes(v.id) && S.clock - (c.t0 || 0) > 1) return 'torcer';
    return null;
  };

  // (what a cheer is for — the event it is counted once by, and its cause: the table's wrestle, the room's match)
  TF.torcida = function (op, m) {
    const d = op.data; const w = m.g && d.braco ? d.braco[m.g] : null; if (w) return ['b:' + m.g + ':' + w.t0, 'braco'];
    const c = d.concurso; return c ? ['c:' + c.t0, 'concurso'] : null;
  };
  // (the round of the house of the bards of the feast: their drink is the keeper's)
  TF.naCasa = function (b, c) { const f = TF.noiteDe(b); return !!(f && c && f.bardos.includes(c.id)); };

  // ------------------------------ the end of the feast, and the save ------------------------------
  // (the closing: the feast over — its decorations stay till the next day —, the match ended where it was)
  TF.fim = function (op, b) { const f = b && b.festa; if (f && f.dia === S_().day && f.fase >= 1 && f.fase < 9) { f.fase = 9; f.fim = r1(S_().clock); f.serv = op.data.servidos; } };
  A.hooks.tick.push(look);
  (G.saveHooks = G.saveHooks || []).push({
    save() { },
    // (the feast, the causes celebrated and the ones waiting, as they were — a damaged one let go, never trusted)
    load() {
      for (const b of S_().buildings.values()) {
        if (b.type !== 'taverna') continue;
        const f = b.festa; if (f !== undefined && !(f && typeof f === 'object' && ORDER.includes(f.motivo) && Number.isFinite(f.dia) && Array.isArray(f.enfeites) && Array.isArray(f.bardos) && Number.isFinite(f.fase))) delete b.festa;
        if (b.festas !== undefined && !(Array.isArray(b.festas) && b.festas.every(k => typeof k === 'string'))) delete b.festas;
        if (b.festaQ !== undefined && !(Array.isArray(b.festaQ) && b.festaQ.every(q => q && ORDER.includes(q.m) && typeof q.k === 'string' && Number.isFinite(q.d)))) delete b.festaQ;
      }
      // (the night's match and wrestles, as they were; a damaged one let go)
      for (const op of A.all()) { if (op.def !== 'taverna' || !op.data) continue; const d = op.data;
        if (d.concurso && !(Array.isArray(d.concurso.quem) && d.concurso.fora && typeof d.concurso.fora === 'object' && Number.isFinite(d.concurso.prox))) delete d.concurso;
        if (d.braco && typeof d.braco === 'object') for (const g of Object.keys(d.braco)) { const w = d.braco[g]; if (!(w && Number.isFinite(w.a) && Number.isFinite(w.b) && Number.isFinite(w.ate))) delete d.braco[g]; } }
    },
  });
})(window.G);
