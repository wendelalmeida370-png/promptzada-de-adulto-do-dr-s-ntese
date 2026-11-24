// soc-vida: the life that arises between people by itself (22b, D-578 to D-583; the study §4.8) — no file of its own on the person:
// it asks the society's pure readings (G.Indole, G.Lacos, G.Fama) and changes the world only by the world's doors (setTask, G.Depot,
// G.Crime, G.Lacos.ato and marca, G.Fama.feito). What lives here, each with its cause in the world:
//   · the score to settle (acerto): one with a heavy offence on the mind — a blow, a theft, an insult, one of theirs killed (the mark
//     «matou»: the revenge reads it) — goes to the one who did it, by day, in the same town; they argue (the act argue, the two bodies
//     at its distance, facing, held for its length); it may end there, in a reconciliation, or in a fight — and a fight that turns
//     grave is a crime of the world (G.Crime.assault, with today's witnesses and hunt): an assault (the combat that stops at the
//     first blood, cause 'brawl') or, rarely, a homicide (the combat to the end, cause 'homicidio');
//   · the tavern's fight has a cause: whom a drunk one dislikes at the table, and how quarrelsome the drunk is;
//   · the help to a stranger: one kind and with food at home gives a meal to one starving in the town (from the house's larder, in
//     the ledger: 'dadiva'); the helped one keeps the mark, the town sees it (the fame);
//   · the loan and the debt: a friend with coins lends to one in want (in the ledger: 'emprestimo'), the debt a mark on both; paid
//     back when there are coins ('divida'), or broken after long enough — the trust gone;
//   · the witness who weighs the ties (G.Convivio.denuncia, asked by crime.js): the kin and the friend of the thief keep quiet, the
//     less the honester; the enemy goes looking for the guard;
//   · what the town takes from a crime answered (the fame, the marks of the ones robbed), and from a death by a hand (the mark
//     «matou» in the dead's kin and friends; the town's memory of a murder).
// The body the god lives is never taken by these (its social verbs are of the wave 2) and never placed by them.
(function (G) {
  'use strict';
  const C = G.Convivio = {};
  const S_ = () => G.S;
  const L = G.Lacos, I = G.Indole, F = G.Fama;
  const isBody = v => !!(v && G.S.avatar && G.S.avatar.id === v.id);
  const TM = 1 / 4; // (tiles per metre: a tile is 4 m, space.js)
  const free = v => v && !v.captive && !v.jail && !v.aboard && !v.ug && !v.held && !v.air && !v.inside && !v.sleeping && !isBody(v);

  // ------------------------------ the place of a two-person act (D-544: the world's) ------------------------------
  // both bodies at the act's distance, facing, where the ground lets them stand; the other held for the act's length by a 'duo' task
  C.place = function (a, b, act) {
    const d = G.SocAtos.of(act); const dist = (d && d.dist ? d.dist : 1.2) * TM;
    let ux = b.x - a.x, uy = b.y - a.y; const n = Math.hypot(ux, uy) || 1; ux /= n; uy /= n;
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const ax = mx - ux * dist / 2, ay = my - uy * dist / 2, bx = mx + ux * dist / 2, by = my + uy * dist / 2;
    if (G.W.walkableXY(ax, ay) && G.W.walkableXY(bx, by)) { a.x = ax; a.y = ay; b.x = bx; b.y = by; }
    a.path = null; b.path = null; a.moving = false; b.moving = false;
    G.faceTo(a, b.x - a.x, b.y - a.y); G.faceTo(b, a.x - b.x, a.y - b.y);
  };
  // (the other of a two-person act: held for its length — its own act, the vocabulary's answer —, never from a task of more weight
  // nor from busy hands, D-094)
  C.hold = function (b, a, act, papel, dur) {
    if (!b || isBody(b) || (b.task && b.task.pri > 1) || G.Vg.handsBusy(b)) return false;
    const d = G.SocAtos.of(act); const rev = (d && d.rev) || act;
    G.Vg.setTask(b, { type: 'duo', id: a.id, act: G.SocAtos.has(rev) ? rev : act, papel: papel || 'b', pri: 0.95, wait: dur || (d ? d.dur : 3), kind: 'duo' });
    return true;
  };
  function runDuo(v, t, dt, H) {
    const o = S_().villagers.get(t.id);
    if (!o || !o.task || o.task.id !== v.id || o.task.st < 2) return H.end(v);
    v.act = t.act; v.path = null; v.moving = false; G.faceTo(v, o.x - v.x, o.y - v.y);
    t.wait -= dt; if (t.wait <= 0) H.end(v);
  }

  // ------------------------------ the score to settle ------------------------------
  // the offences that call for it, and how hard: a death of one's own above all
  const CALL = { matou: 1.5, bateu: 1, traiu: 0.9, roubou: 0.8, denunciou: 0.7, humilhou: 0.6, insultou: 0.4 };
  C.ACERTO = { min: 0.08, pri: 0.7, k: 3.2 };
  // (the heaviest grudge of v against someone alive in the same town, met not today: [mark, target] or null — pure)
  C.grudge = function (v) {
    const m = v && v.marcas; if (!m || v.age < 18 || v.age > 62) return null;
    const S = S_(); let best = null, bs = 0;
    for (const q of m) {
      const w = CALL[q[0]]; if (!w) continue;
      const o = S.villagers.get(q[1]); if (!o || o.set !== v.set || L.kin(v, o) === 'par') continue;
      const t = L.find(v, o.id); if (t && t[5] === S.day) continue; // (already faced today)
      const s = w * q[3]; if (s > bs) { bs = s; best = [q, o]; }
    }
    return best;
  };
  G.Vg.want('acerto', {
    pri: C.ACERTO.pri,
    urge(v, cur, night) {
      if (night || !v.marcas || v.hp < 60 || v.mourn > G.DAY_LEN * 0.6 || v.hunger > 70 || isBody(v)) return 0;
      const g = C.grudge(v); if (!g) return 0;
      const a = I.faceta(v, 'agressivo'), r = I.faceta(v, 'rancoroso');
      // (as heavy as an evening's wish — the tavern, the plaza — for one quick to anger with a fresh offence: measured, at 1,6 the score
      // was never settled in four years of the metropolis, T-1591)
      const u = (g[0][3] / 100) * (CALL[g[0][0]] || 0.5) * (a * 0.7 + r * 0.5 - 0.35) * C.ACERTO.k;
      return u > C.ACERTO.min ? Math.min(0.95, u) : 0;
    },
    go(v, H) { const g = C.grudge(v); if (!g || !free(g[1])) return null; return H.setTask(v, { type: 'acerto', id: g[1].id, papel: 'a', mark: g[0][0], pri: C.ACERTO.pri, st: 0 }); },
  });
  function runAcerto(v, t, dt, H) {
    const S = S_(); const o = S.villagers.get(t.id);
    if (!o || !free(o) || o.set !== v.set) return H.end(v);
    if (t.st === 0) {
      if (G.dist(v.x, v.y, o.x, o.y) < 1.1) { t.st = 1; }
      else { t.rt = (t.rt || 0) - dt; if (t.rt <= 0 || H.arrived(v)) { t.rt = 1.2; if (!H.goto(v, o.x, o.y, false)) return H.end(v); } H.move(v, dt); }
      if (t.age > 30) return H.end(v);
      return;
    }
    if (t.st === 1) {
      // (face to face: the other stops to answer — or the one who came speaks to a back turned, and goes)
      if (!C.hold(o, v, 'argue', 'b', 5)) { L.ato(v, o, 'discussao'); return H.end(v); }
      C.place(v, o, 'argue'); t.st = 2; v.actT = 0; G.Vg.emote(v, 'angry', 2);
      return;
    }
    v.act = 'argue'; v.path = null; G.faceTo(v, o.x - v.x, o.y - v.y);
    if (v.actT < 5) return;
    settle(v, o, t.mark);
    H.end(v);
  }
  // the end of an argument: words only (most often), a reconciliation (two kind ones, an offence not of blood), or a fight — the grave
  // one a crime. One draw of the world says which, weighed by who the two are, how deep it runs and the mood of the day
  C.MATA = 0.55; // (of the fights over a death of one's own, the part that goes to the end in the one quick to anger)
  function settle(v, o, mark) {
    const S = S_(); const sv = L.sente(v, o); const af = sv ? sv.afeto : 0;
    const a = I.faceta(v, 'agressivo'), kindO = I.ax(o, 'ama') / 99, kindV = I.ax(v, 'ama') / 99;
    const mood = I.humor(v); const r = G.R();
    const fight = Math.max(0, (a - 0.42) * 1.4 + (-af - 40) / 120 - mood * 0.15);
    const peace = mark === 'matou' ? 0 : Math.max(0, (kindV + kindO - 1.1) * 0.8);
    L.ato(v, o, 'discussao');
    if (r < peace) {
      L.ato(v, o, 'reconcilia'); L.desmarca(v, mark, o.id); G.Vg.emote(v, 'happy', 2); G.Vg.emote(o, 'happy', 2);
      return 'paz';
    }
    if (r < peace + fight) {
      L.ato(v, o, 'briga'); L.marca(o, 'bateu', v.id, 40);
      const lethal = mark === 'matou' && af <= -70 && a >= 0.62 && G.R() < C.MATA;
      C.agride(v, o, lethal);
      return lethal ? 'morte' : 'briga';
    }
    L.marca(o, 'insultou', v.id, 25); G.Vg.emote(o, 'angry', 2);
    return 'palavras';
  }
  // the blow of one of the world at another: a crime as the body's is (G.Crime.assault: the witnesses awake and near, the guard told,
  // the hunt and the law), and a fight of the world — the combat of the world's own step, which stops at the first blood (cause
  // 'brawl'), or, for the rare one that means to kill, goes to the end (cause 'homicidio')
  C.agride = function (v, o, letal) {
    if (!G.inSim || !v || !o || isBody(v)) return false;
    G.Crime.assault(v, o, false);
    L.ato(v, o, 'agressao'); L.marca(o, 'bateu', v.id, letal ? 80 : 60);
    if (F) F.feito(v, 'agrediu');
    G.Vg.setTask(v, { type: 'combat', id: o.id, pri: 3.4, any: true, skirmish: !letal, cause: letal ? 'homicidio' : 'brawl', kind: 'combat', soc: 1 });
    G.Vg.emote(v, 'angry', 3); G.Vg.emote(o, 'fear', 2);
    const set = S_().settlements.get(v.set);
    if (set && (S_().villagers.size < 60 || letal)) G.Village.log(letal ? `${v.name} atacou ${o.name} em ${set.name} para matar.` : `${v.name} e ${o.name} brigaram em ${set.name}: uma velha mágoa acabou em socos.`, letal ? 'skull' : 'theft', v.x, v.y);
    return true;
  };

  // ------------------------------ the tavern's fight, with a cause ------------------------------
  // (how much likelier a drunk one is to start a fight than the old chance, and with whom: the one they dislike most at the table — a
  // quarrelsome drunk with anyone; asked by act-taverna.js, pure)
  C.briga = v => 0.3 + 1.7 * I.faceta(v, 'agressivo') * (1 - Math.max(0, I.humor(v)) * 0.4);
  C.rival = function (v, ids) {
    const S = S_(); let best = null, bs = Infinity; const quarrel = I.faceta(v, 'agressivo') >= 0.6;
    for (const id of ids) {
      const q = S.villagers.get(+id); if (!q || q === v || !(G.Ebrio && G.Ebrio.bebado(q)) || isBody(q)) continue; // (drunk: G.Ebrio, T2)
      const s = L.sente(v, q); const af = s ? s.afeto : 0; if (s && s.kin) continue;
      if (af < bs) { bs = af; best = q; }
    }
    return best && (bs < 0 || quarrel) ? best : null;
  };
  // (the tavern's fight begun: the two keep it; one who hates the other deeply and is quick to anger turns it into a blow that is a crime)
  C.brigou = function (v, o) {
    // (the fists at the table leave each one something against the other: the one hit keeps the blow, the one who started keeps the
    // shame of it — the score that may be settled another day, D-581)
    L.ato(v, o, 'briga'); L.marca(o, 'bateu', v.id, 30); L.marca(v, 'humilhou', o.id, 20);
    const s = L.sente(v, o);
    if (s && s.afeto <= -55 && I.faceta(v, 'agressivo') >= 0.62 && G.R() < 0.35) { C.agride(v, o, false); return true; }
    return false;
  };

  // ------------------------------ the help to a stranger ------------------------------
  // (one starving in the town — hunger at the top, nothing at home, no coin — and one kind with food at home goes to give a meal)
  const needy = { t: -1, p: -1, S: null, m: new Map() };
  const larder = v => { const h = v.home && S_().buildings.get(v.home); return h && G.Village.livable(h) ? h : null; };
  function needyOf(sid) {
    const S = S_();
    if (needy.S !== S || needy.t !== S.clock || needy.p !== G.part) { needy.S = S; needy.t = S.clock; needy.p = G.part; needy.m.clear(); }
    let a = needy.m.get(sid); if (a) return a;
    a = [];
    for (const o of L.roster(sid)) {
      if (o.set !== sid || o.hunger < 80 || o.age < 3 || !free(o) || (o.task && (o.task.type === 'eat' || o.task.pri >= 1.5))) continue;
      const h = larder(o); if (h && G.Depot.get('h:' + h.id, 'food') >= 1) continue;
      if (G.Eco && G.Eco.purse(o) >= 1) continue;
      a.push(o);
    }
    needy.m.set(sid, a); return a;
  }
  G.worldHooks.push(() => { needy.S = null; needy.m.clear(); });
  C.AJUDA = { gen: 0.6, pri: 0.55 };
  G.Vg.want('ajudar', {
    pri: C.AJUDA.pri,
    urge(v, cur, night) {
      if (night || v.hunger > 55 || isBody(v) || I.faceta(v, 'generoso') < C.AJUDA.gen) return 0;
      const h = larder(v); if (!h || G.Depot.get('h:' + h.id, 'food') < 3) return 0;
      const n = needyOf(v.set); if (!n.length) return 0;
      return 0.35 + I.faceta(v, 'empatico') * 0.5;
    },
    go(v, H) {
      let best = null, bd = Infinity; for (const o of needyOf(v.set)) { if (o === v || L.kin(v, o) === 'par') continue; const d = G.dist2(v.x, v.y, o.x, o.y); if (d < bd && d < 900) { bd = d; best = o; } }
      return best ? H.setTask(v, { type: 'ajudar', id: best.id, papel: 'a', pri: C.AJUDA.pri, st: 0 }) : null;
    },
  });
  function runAjudar(v, t, dt, H) {
    const S = S_(); const o = S.villagers.get(t.id); const h = larder(v);
    if (!o || !free(o) || !h || o.hunger < 50) return H.end(v);
    if (t.st === 0) {
      if (G.dist(v.x, v.y, o.x, o.y) < 1.1) { t.st = 1; }
      else { t.rt = (t.rt || 0) - dt; if (t.rt <= 0 || H.arrived(v)) { t.rt = 1.2; if (!H.goto(v, o.x, o.y, false)) return H.end(v); } H.move(v, dt); }
      if (t.age > 40) return H.end(v);
      return;
    }
    if (t.st === 1) { C.hold(o, v, 'help', 'b', 3); C.place(v, o, 'help'); t.st = 2; v.actT = 0; return; }
    v.act = 'help'; v.path = null; G.faceTo(v, o.x - v.x, o.y - v.y);
    if (v.actT < 2.5) return;
    // (a meal from the house's larder, eaten there and then: in the ledger)
    if (G.Depot.use('h:' + h.id, 'food', 1, { code: 'dadiva', by: v.id }).ok) {
      o.hunger = Math.max(0, o.hunger - 45);
      L.ato(v, o, 'ajuda'); L.marca(o, 'ajudou', v.id, 45); if (F) F.feito(v, 'ajudou');
      G.Vg.emote(o, 'happy', 2.5); G.Vg.emote(v, 'heart', 1.5);
      if (G.Life && !L.kin(v, o)) G.Life.bio(o, 'note', `Num dia de fome, ${v.name} deu-lhe de comer.`, `Quando tive fome, ${v.name} me deu de comer`);
    }
    H.end(v);
  }

  // ------------------------------ the witness who weighs the ties (asked by crime.js) ------------------------------
  // 'cala' (the kin or a friend of the one seen: quiet, the likelier the less honest — by the hash of the witness and the crime, one
  // answer for the whole while), 'corre' (an enemy of the one seen: goes looking for the guard), 'conta' (the others, as always). Pure
  C.denuncia = function (o, th, c) {
    if (!o || !th) return 'conta';
    const s = L.sente(o, th); if (!s) return 'conta';
    if (s.kin || s.afeto >= 35) { const fm = F && F.de(th, o.set); const known = fm && fm.rotulos.some(r => r === 'ladrao' || r === 'assassino' || r === 'agressor'); const quiet = (0.85 - 0.6 * I.ax(o, 'hon') / 99) * (known ? 0.5 : 1); return G.hash(o.id * 131 + (c ? c.id : 0) * 7 + 3) < quiet ? 'cala' : 'conta'; }
    if (s.afeto <= -30) return 'corre';
    return 'conta';
  };
  // (the houses the thief will not touch — the kin's and the friends' — and the ones of the people he dislikes, that tempt him more)
  C.casas = function (v) {
    const S = S_(); const no = new Set(), yes = new Map();
    for (const id of [v.mother, v.father, v.partner, ...(v.kids || [])]) { const o = S.villagers.get(id); if (o && o.home) no.add(o.home); }
    for (const t of v.lacos || []) { const o = S.villagers.get(t[0]); if (!o || !o.home) continue; const s = L.sente(v, o); if (!s) continue; if (s.kin || s.afeto >= 30) no.add(o.home); else if (s.afeto <= -30) yes.set(o.home, Math.max(yes.get(o.home) || 0, Math.min(2, -s.afeto / 40))); }
    return { no, yes };
  };

  // ------------------------------ the gossip's prejudice (asked by secrets.js) ------------------------------
  // (the one who talks: of the town's grown ones, the most talkative and the least trusting — pure, the same for the same town)
  C.fofoqueiro = function (folk) {
    let best = null, bs = -Infinity;
    for (const v of folk) { if (isBody(v)) continue; const s = I.faceta(v, 'desconfiado') * 0.6 + I.ax(v, 'ext') / 99 * 0.4 - I.ax(v, 'hon') / 99 * 0.2 + G.hash(v.id * 17 + G.S.day) * 0.15; if (s > bs) { bs = s; best = v; } }
    return best;
  };
  // (whom that one would accuse: those they dislike or hold a grudge against — their own experience —; failing them, the ones they do
  // not know that the town sets apart, as many as their distrust reaches. Never by the look nor the people: the accusation is the
  // accuser's, the accused is no more guilty for it)
  C.suspeitos = function (say, folk) {
    const own = folk.filter(v => v !== say && !v.secret && (L.ferida(say, v) || ((L.sente(say, v) || {}).afeto <= -20)));
    if (own.length) return own;
    const wary = I.faceta(say, 'desconfiado'); if (wary < 0.4) return [];
    return folk.filter(v => v !== say && !v.secret && !L.sente(say, v) && (v.age > 58 || v.role === 'curandeiro' || (v.g === 'f' && !v.partner && v.age > 40)));
  };

  // ------------------------------ the day of a town (from the ties' day, soc-lacos.js) ------------------------------
  // the loans and the debts, and what the town takes from the crimes answered yesterday
  C.EMP = { n: 4, rico: 12, prazo: 12, max: 2 };
  C.dayOf = function (set) {
    const S = S_(); const f = G.Fac && G.Fac.get(set.fac); const coin = !!(f && G.Eco && G.Eco.coinage(f.id));
    const folk = []; for (const v of S.villagers.values()) if (v.set === set.id) folk.push(v);
    if (coin) {
      // the debts: paid back when there are coins, broken after the term
      for (const v of folk) for (const q of (v.marcas || []).slice()) {
        if (q[0] !== 'deve') continue;
        const lender = S.villagers.get(q[1]); const n = q[4] || C.EMP.n;
        if (!lender) { L.desmarca(v, 'deve', q[1]); continue; }
        if (G.Eco.purse(v) >= n + 6 && G.Eco.spend(v, n, G.Eco.coinRef(lender), 'divida')) {
          L.desmarca(v, 'deve', lender.id); L.desmarca(lender, 'emprestou', v.id); L.ato(v, lender, 'cumpriu'); L.marca(lender, 'pagou', v.id, 30); if (F) F.feito(v, 'pagou');
        } else if (S.day - q[2] > C.EMP.prazo) {
          L.desmarca(v, 'deve', lender.id); L.desmarca(lender, 'emprestou', v.id); L.ato(v, lender, 'quebrou'); L.marca(lender, 'traiu', v.id, 35); if (F) F.feito(v, 'caloteiro');
        }
      }
      // the loans: one in want — hungry with an empty purse, or in the street — and a friend with coins to spare, generous enough
      let n = 0;
      for (const v of folk) {
        if (n >= C.EMP.max) break;
        if (v.age < 16 || !free(v) || G.Eco.purse(v) >= 1 || !(v.hunger > 60 || v.rua) || (v.marcas && v.marcas.some(q => q[0] === 'deve'))) continue;
        let best = null, bs = 0;
        for (const t of v.lacos || []) {
          const o = S.villagers.get(t[0]); if (!o || o.set !== v.set || isBody(o) || G.Eco.purse(o) < C.EMP.rico) continue;
          const s = L.sente(o, v); if (!s || s.afeto < 40 || I.faceta(o, 'generoso') < 0.45) continue;
          if (G.Eco.coinRef(o) === G.Eco.coinRef(v)) continue; // (the same house's pot)
          if (s.afeto > bs) { bs = s.afeto; best = o; }
        }
        if (!best || !G.Eco.spend(best, C.EMP.n, G.Eco.coinRef(v), 'emprestimo')) continue;
        n++; L.ato(best, v, 'emprestimo'); L.marca(v, 'deve', best.id, 50, C.EMP.n); L.marca(best, 'emprestou', v.id, 50, C.EMP.n);
      }
    }
    // the crimes answered yesterday in this town: the fame, the marks of the ones robbed or hurt, the town's memory of a murder taken
    for (const c of S.crimes || []) {
      if (c.set !== set.id || c.dayArrest !== S.day - 1) continue;
      const th = S.villagers.get(c.thief); if (!th) continue;
      if (F) F.feito(th, c.kind === 'homicidio' ? 'matou' : c.kind === 'agressao' ? 'agrediu' : 'furtou', set.id);
      if (c.kind === 'homicidio' && F) F.respondida(set, c.victim);
      if (c.kind === 'furto') for (const o of folk) if (o.home && o.home === c.house && o.age >= 12) { L.ato(th, o, 'furto'); L.marca(o, 'roubou', th.id, 50); }
    }
  };

  // ------------------------------ a death by a hand ------------------------------
  // (the kin and the friends of one killed — in a war, a murder, an execution, a coup — keep who did it: the mark «matou»; a murder of
  // the world is a crime, and the town remembers it)
  const VIOLENT = { war: 1, arrow: 1, massacre: 1, execution: 1, coup: 1, homicidio: 1, brawl: 1, vinganca: 1 };
  const kill0 = G.Village.kill;
  G.Village.kill = function (v, cause) {
    const S = S_();
    if (G.inSim && v && S.villagers.has(v.id) && VIOLENT[cause] && v.lastBy && v.lastBy !== v.id) {
      const k = S.villagers.get(v.lastBy);
      if (k) {
        if (cause === 'homicidio') { G.Crime.assault(k, v, true); const set = S.settlements.get(v.set); if (set && F) F.lembra(set, 'assassinato', v.id, k.id); }
        for (const o of S.villagers.values()) {
          if (o === k || o === v || o.age < 6) continue;
          const kn = L.kin(o, v); let s = null;
          if (!kn) { if (!o.lacos || !L.find(o, v.id)) continue; s = L.sente(o, v); if (!s || s.afeto < 45) continue; }
          L.marca(o, 'matou', k.id, kn ? 75 : 55, v.id); L.ato(o, k, 'matou');
        }
      }
    }
    return kill0.apply(this, arguments);
  };

  // ------------------------------ the tasks ------------------------------
  const E = G.Eco; const oldRun = E.run;
  E.run = function (v, t, dt, H) {
    switch (t.type) {
      case 'duo': return runDuo(v, t, dt, H), true;
      case 'acerto': return runAcerto(v, t, dt, H), true;
      case 'ajudar': return runAjudar(v, t, dt, H), true;
    }
    return oldRun(v, t, dt, H);
  };
  const oldText = E.taskText;
  E.taskText = function (v, t) {
    const o = t && t.id && G.S.villagers.get(t.id);
    switch (t.type) {
      case 'duo': return o ? (t.act === 'argue' ? `Discutindo com ${o.name}` : t.act === 'helped' ? `Recebendo a ajuda de ${o.name}` : `Com ${o.name}`) : 'Com alguém';
      case 'acerto': return o ? (t.st < 2 ? `Indo tirar satisfação com ${o.name}` : `Discutindo com ${o.name}`) : 'Tirando satisfação';
      case 'ajudar': return o ? `Levando comida a ${o.name}, que passa fome` : 'Ajudando alguém';
    }
    return oldText(v, t);
  };
})(window.G);
