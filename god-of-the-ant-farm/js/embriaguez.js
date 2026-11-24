'use strict';
// ============================================================
//  A bebedeira (G.Ebrio; a taverna, quarta onda — T2, D-830 a D-839).
//  O álcool no corpo de cada um: cada bebida tem o seu, por rodada (a
//  dose que a taverna serve, G.Taverna.DOSE): a cerveja de cereal pouco,
//  o pulque pouco, o vinho mais, o hidromel mais. O que se bebe vai ao
//  estômago (v.ebrioG) e passa ao sangue (v.ebrio, de 0 a cerca de 1,5)
//  aos poucos — mais devagar, e um pouco menos, com comida no estômago
//  —; o fígado o tira no seu passo, sempre o mesmo (mais depressa em
//  quem bebe todas as noites e com comida no estômago), e o sono — e o
//  desmaio, que é sono — o tira de vez. Quanto cada um aguenta é do
//  hábito (as noites que a taverna lembra, b.freg), da idade, da doença;
//  nunca da altura, do genoma nem do povo (regra 194). Passado o ponto,
//  o corpo cai (v.ebrioD, o relógio do desmaio): à mesa ou no chão da
//  taverna, na rua; o taverneiro o arrasta para fora, um amigo o leva
//  para casa, e ele acorda depois, com a ressaca (v.ressaca), que pesa
//  no cansaço e na fome do dia seguinte. O que o bêbado faz é da índole
//  dele (G.Ebrio.impulso, puro): o agressivo xinga, provoca, cospe,
//  joga a bebida no outro e chama para a briga; o expansivo ri, brinda,
//  puxa conversa com quem não conhece, abraça, canta alto e dança no
//  meio do salão; o triste chora e desabafa; o indiscreto conta o
//  segredo que guardava (in vino veritas — o discreto aguenta mais); o
//  desinibido corteja; o ciumento arma a briga. Nada sorteado: a
//  índole, o quanto bebeu, quem está em volta e o G.hash da pessoa e do
//  momento. Só este arquivo escreve v.ebrio, v.ebrioG, v.ebrioP,
//  v.ebrioD, v.ressaca e v.molhado (regra 360); o corpo do deus cai e é
//  levado pelas portas do possess.js (Possess.desmaia, arrasta, acorda),
//  e o que ele vê bêbado é do embriaguez-corpo.js.
//  As portas para quem serve bebida (a festa da T1, o concurso):
//  G.Ebrio.dose(v, bebida[, n]) — uma rodada da bebida, ou n do bem —,
//  G.Ebrio.de(v), grau(v), desmaiado(v), limiar(v, nome), k(v).
// ============================================================
(function (G) {
  const E = G.Ebrio = {};
  const S_ = () => G.S;
  const r1 = x => Math.round(x * 10) / 10, r4 = x => Math.round(x * 1e4) / 1e4;
  const oa = v => (v && v.g === 'f' ? 'a' : 'o');
  const isBody = v => !!(v && G.S && G.S.avatar && G.S.avatar.id === v.id);

  // ------------------------------ the numbers ------------------------------
  // the drink of a round in the blood of one of a middling tolerance (per round of the tavern's dose — G.Taverna.DOSE: a cup of
  // beer is a quarter of a jar, a cup of wine a tenth of an amphora): the grain's beer and the pulque weak, the wine and the mead
  // strong (D-831). A round lasts hours of the world's short day — the cup, the talk, the next one —: it is the drink of those hours
  E.ALC = Object.freeze({ cerveja: 0.17, pulque: 0.16, vinho: 0.27, mel: 0.3 });
  // (the marks of the blood, for a tolerance of 1 — each one's are these times E.tol: merry, drunk, staggering, out)
  const LIM = E.LIM = Object.freeze({ alegre: 0.25, bebado: 0.55, tonto: 0.9, desmaio: 1.3 });
  E.MAX = 1.6;        // (the blood's top: past it the stomach waits — what would be a poisoning the world does not have yet)
  E.ELIM = 0.0035;    // (what the liver takes a second of the world, the same at any level — zero order, as in life: a drunk one awake is
                      //  sober again in about a day of the world)
  E.SONO = 10;        // (asleep or out: that many times as fast — the night's sleep clears it, D-832)
  E.COMIDA = 0.3;     // (food in the stomach: the liver up to this much quicker…)
  E.PERDA = 0.2;      //  (…and this share of the drink never reaches the blood)
  E.ABS = 5; E.ABS_CHEIO = 14; // (seconds of the world the stomach takes to give a drink to the blood: empty, full)
  E.HAB_N = 30;       // (the nights at the tavern of a whole habit)
  E.HAB = 0.45;       // (the habit raises what one bears by up to this…)
  E.HAB_ELIM = 0.5;   //  (…and the liver's pace by up to this)
  E.DESMAIO_MIN = 25; // (seconds of the world one stays out, at the least)
  E.RES = Object.freeze({ de: 0.45, ate: 1.3, T: 90 }); // (the night's top from which there is a hangover; the top of a full one; its seconds awake)
  E.FOME = 0.35; E.CANSA = 0.5; // (the hangover in the day: the hunger up to this much faster, the tiredness this much)
  E.MOLHADO = 30;     // (seconds of the world the clothes take to dry of a drink thrown over one — the drying the 3D reads, G.Atmos.molhado, T7)
  E.PRI = 3.3;        // (out: nothing of the day takes one from it — a fire, a panic of 4 and more wakes one)
  E.PRI_SAI = 2.9;    // (dragged and dragging: under 3, the two walk out by the door as anyone of a stay — D-765)
  E.PRI_ARR = 3.0;    // (and once out, the dragging holds)
  E.PUXA = 0.45;      // (the pace of one dragging a body, of one's walk)

  // ------------------------------ the readings (pure) ------------------------------
  // the habit: the nights at the tavern of one's town the houses remember (b.freg — act-taverna.js), the last one not long ago; 0..1
  E.habito = function (v) {
    const T = G.Taverna, Ec = G.Eco, S = S_(); if (!T || !T.freg || !Ec || !Ec.byType || !v || !v.set || !S) return 0;
    let n = 0;
    for (const b of Ec.byType(v.set, 'taverna')) { const e = T.freg(b, v); if (!e) continue; const gone = Math.max(0, S.day - e[2] - 7); n = Math.max(n, e[1] * Math.max(0, 1 - gone / 60)); }
    return Math.min(1, n / E.HAB_N);
  };
  // what one bears: the habit, the years, the illness, a resistant constitution — never the look nor the people (rule 194)
  E.tol = function (v) {
    if (!v) return 1; let t = 1 + E.HAB * E.habito(v); const a = v.age || 0;
    if (a < 16) t -= 0.4; else if (a < 20) t -= 0.15; if (a >= 62) t -= 0.15;
    if (v.sick > 0) t -= 0.15; if (v.traits && v.traits.includes('Resistente')) t += 0.1;
    return G.clamp(t, 0.55, 1.5);
  };
  E.de = v => (v && v.ebrio > 0 ? v.ebrio : 0);
  E.total = v => E.de(v) + (v && v.ebrioG > 0 ? v.ebrioG : 0); // (and what is still on its way from the stomach)
  E.g = v => (v && v.ebrio > 0 ? v.ebrio / E.tol(v) : 0);       // (the blood against what one bears)
  E.limiar = (v, k) => (LIM[k] || 0) * E.tol(v);
  E.GRAUS = Object.freeze(['sobrio', 'alegre', 'bebado', 'tonto', 'desmaiado']);
  E.grau = function (v) { if (!v) return 0; if (v.ebrioD > 0) return 4; if (!(v.ebrio > 0.13)) return 0; const g = E.g(v); return g >= LIM.tonto ? 3 : g >= LIM.bebado ? 2 : g >= LIM.alegre ? 1 : 0; };
  E.alegre = v => E.grau(v) >= 1;
  E.bebado = v => E.grau(v) >= 2;
  E.tonto = v => E.grau(v) >= 3;
  E.desmaiado = v => !!(v && v.ebrioD > 0);
  // the drink as the eye sees it, 0..1 (G.Atmos.drunk is this — one truth): none below merry; the stagger with the arms out from the
  // staggering mark (vida3d V3.DRUNK, 0,55), the whole of it out
  E.k = function (v) {
    if (!v) return 0; if (v.ebrioD > 0) return 1; if (!(v.ebrio > 0.13)) return 0;
    const g = E.g(v); if (g < LIM.alegre) return 0;
    if (g < LIM.tonto) return 0.25 + 0.3 * (g - LIM.alegre) / (LIM.tonto - LIM.alegre);
    return Math.min(1, 0.55 + 0.45 * (g - LIM.tonto) / (LIM.desmaio - LIM.tonto));
  };
  E.ressaca = v => (v && v.ressaca > 0 ? Math.min(1, v.ressaca) : 0);
  // (how wet with a drink thrown over one, 1 just now, 0 dry — v.molhado: { t: the clock it was thrown at, k: the drink }, which the 3D
  // reads the same way: G.Atmos.molhado, T7 D-883)
  const molhadoT = m => (typeof m === 'number' ? m : m && typeof m === 'object' ? m.t : NaN);
  E.molhado = v => { const S = S_(); const t = v ? molhadoT(v.molhado) : NaN; return S && Number.isFinite(t) ? G.clamp(1 - (S.clock - t) / E.MOLHADO, 0, 1) : 0; };
  E.cheio = v => G.clamp((60 - ((v && v.hunger) || 0)) / 50, 0, 1); // (food in the stomach: the hunger of one just fed is low)
  // (one who can drag or carry a body: grown, strong, whole, sober enough — never the god's body, whose hands are the player's)
  E.forte = v => !!v && !isBody(v) && v.age >= 16 && v.age < 66 && (v.hp === undefined || v.hp > 40) && !!G.Depot && G.Depot.strength(v) > 0 && E.grau(v) <= 1 && !(v.ebrioD > 0);
  // where one is out: at the table, on the tavern's floor, in the street, in one's bed
  E.onde = function (v) {
    if (!v || !(v.ebrioD > 0)) return null; const t = v.task;
    if (t && t.type === 'tavern') { const op = G.Act && G.Act.get(t.op); const m = op && op.data && op.data.mesa ? op.data.mesa[v.id] : null; return (m && m.dz) || 'mesa'; }
    if (t && t.type === 'desmaio') return v.inside && v.inside === v.home ? 'casa' : v.inside ? 'chao' : 'rua';
    if (t && t.type === 'arrastado') return 'arrastado';
    return v.inside ? 'chao' : 'rua';
  };
  // who drags whom (for the 3D and the sound: the act of two — T6, T8)
  E.arrasto = function (v) {
    const t = v && v.task; if (!t) return null;
    if (t.type === 'arrastado') return { por: t.id, papel: 'b' };
    if (t.type === 'arrastar') return { de: t.id, para: t.para, papel: 'a' };
    if (t.type === 'atender' && t.st === 41 && t.ex) return { de: t.ex, para: 'rua', papel: 'a' };
    return null;
  };
  // how the person feels it, in words (the body's own screen asks it through G.Possess.knows: one knows how drunk one feels)
  E.palavra = function (v) {
    const g = E.grau(v); const a = oa(v);
    if (g === 4) return `desmaiad${a}`; if (g === 3) return `muito bêbad${a} — o chão gira`; if (g === 2) return `bêbad${a}`; if (g === 1) return `alegre da bebida`;
    const r = E.ressaca(v); return r > 0.5 ? 'de ressaca forte' : r > 0.12 ? 'de ressaca' : '';
  };

  // ------------------------------ the doors that write (only in the world's step) ------------------------------
  // a drink taken: a round of k (or n of the good, by the tavern's dose) into the stomach — the blood has it as it goes in
  E.dose = function (v, k, n) {
    if (!G.inSim || !v || !E.ALC[k] || v.ebrioD > 0) return 0;
    const dz = (G.Taverna && G.Taverna.DOSE && G.Taverna.DOSE[k]) || 0.25; const u = n === undefined ? 1 : n / dz;
    if (!(u > 0) || !Number.isFinite(u)) return 0;
    const a = r4(E.ALC[k] * u); v.ebrioG = r4((v.ebrioG > 0 ? v.ebrioG : 0) + a); return a;
  };
  // (wet with a drink thrown over one — the tavern's: act-taverna.js)
  E.molha = function (v, k) { if (!G.inSim || !v) return false; v.molhado = { t: r1(G.S.clock), k: E.ALC[k] ? k : 'cerveja' }; return true; };
  // the drink in the body over a step of the world (villagers.js needs, every person, every step): the stomach gives to the blood, the
  // liver takes from it; past what one bears one falls, and wakes when it lets go — with the hangover, the drink gone. → the hangover now,
  // 0..1 (the needs weigh the hunger and the tiredness by it — and nothing else changes the energy for it: D-833)
  E.passo = function (v, dt) {
    if (!(v.ebrio > 0 || v.ebrioG > 0 || v.ressaca > 0 || v.ebrioD > 0) || !(dt > 0)) return 0;
    const S = S_(); const cheio = E.cheio(v); const fora = v.sleeping || v.ebrioD > 0;
    if (v.ebrioG > 0) {
      const tau = G.lerp(E.ABS, E.ABS_CHEIO, cheio); const a = v.ebrioG * (1 - Math.exp(-dt / tau));
      v.ebrioG = v.ebrioG - a < 1e-4 ? 0 : v.ebrioG - a;
      v.ebrio = Math.min(E.MAX, (v.ebrio > 0 ? v.ebrio : 0) + a * (1 - E.PERDA * cheio));
    }
    if (v.ebrio > 0) { const r = E.ELIM * (1 + E.HAB_ELIM * E.habito(v)) * (1 + E.COMIDA * cheio) * (fora ? E.SONO : 1); v.ebrio -= r * dt; if (v.ebrio < 1e-4) v.ebrio = 0; }
    if (v.ebrio > (v.ebrioP > 0 ? v.ebrioP : 0)) v.ebrioP = v.ebrio;
    if (!(v.ebrioD > 0)) { if (v.ebrio > 0.5 && v.ebrio >= E.limiar(v, 'desmaio')) cai(v); }
    else if (!holds(v)) acorda(v, 'perigo');
    else if (!(v.ebrio >= E.limiar(v, 'alegre')) && S.clock - v.ebrioD >= E.DESMAIO_MIN) acorda(v);
    // (the drink gone: the hangover by how far the night went)
    if (!(v.ebrio > 0.02) && !(v.ebrioG > 0) && v.ebrioP > 0 && !(v.ebrioD > 0)) ressacaDe(v);
    if (v.ressaca > 0 && !v.sleeping) { v.ressaca -= dt / E.RES.T; if (v.ressaca < 1e-3) v.ressaca = 0; }
    return v.ressaca > 0 ? v.ressaca : 0;
  };
  function ressacaDe(v) { if (v.ebrioP >= E.RES.de) v.ressaca = Math.max(v.ressaca > 0 ? v.ressaca : 0, G.clamp((v.ebrioP - E.RES.de) / (E.RES.ate - E.RES.de), 0.15, 1)); v.ebrioP = 0; }
  // (what keeps one who is out: the errand of the faint, the tavern's table, being dragged, the god's body's sleep — anything else of
  // weight that took one — a fire in the house, a panic — woke one; of less weight, one is down again where one is)
  const FAINT = { desmaio: 1, arrastado: 1, avatar: 1 };
  function holds(v) {
    const t = v.task; if (isBody(v)) return !!v.sleeping; if (t && (FAINT[t.type] || (t.type === 'tavern' && t.st >= 1))) return true;
    if (t && (t.pri || 0) >= 4) return false;
    G.Vg.setTask(v, { type: 'desmaio', pri: E.PRI, kind: 'desmaio', st: 0 }); return true;
  }
  // past what one bears: down — the god's body by its door (the world takes it, Possess.desmaia); at the tavern's tables the house's own
  // (act-taverna.js); anywhere else, where one is, the load in the hands to the ground
  function cai(v) {
    const S = S_(); if (v.aboard || v.held || v.air || v.ug || v.age < 2 || v.jail || v.captive) return false;
    v.ebrioD = r1(S.clock) || 0.1;
    if (G.Life) G.Life.bio(v, 'note', 'Desmaiou de tanto beber');
    if (isBody(v)) { if (G.Possess && G.Possess.desmaia) G.Possess.desmaia(v); return true; }
    const t = v.task; if (t && ((t.type === 'tavern' && t.st >= 1) || t.type === 'arrastado' || t.type === 'desmaio')) return true; // (on the way to the tavern still: down in the street)
    const c = v.carry; if (c && c.n > 1e-6 && G.Depot && G.Depot.drop) G.Depot.drop('v:' + v.id, c.k, c.n, v.x, v.y, { op: c.op || 0, code: 'desmaio', by: v.id });
    G.Vg.setTask(v, { type: 'desmaio', pri: E.PRI, kind: 'desmaio', st: 0 });
    return true;
  }
  // the drink let go of one (or a danger woke one): the hangover now, and the god's body given back to the player's hands, the cause said
  function acorda(v, why) {
    v.ebrioD = 0; ressacaDe(v); if (v.ebrio > 0 && why !== 'perigo') v.ebrioP = v.ebrio;
    if (isBody(v) && G.Possess && G.Possess.acorda) G.Possess.acorda(v, why || 'bebida');
  }
  // the drag (D-835): one passed out, out of a building by its door and down the street — or home — in the hands of one who can (the
  // keeper, a friend: G.Ebrio.forte). The two walk out together (the walk out of the old errand, D-765); the god's body is moved by
  // the possess.js door. → whether it began
  E.arrasta = function (a, o, b, para) {
    if (!G.inSim || !a || !o || a === o || !(o.ebrioD > 0) || isBody(a)) return false;
    if (!isBody(o)) { G.Vg.setTask(o, { type: 'arrastado', id: a.id, pri: E.PRI_SAI, kind: 'arrastado', b: b ? b.id : 0 }); o.act = 'arrastado'; }
    G.Vg.setTask(a, { type: 'arrastar', id: o.id, pri: E.PRI_SAI, kind: 'arrastar', b: b ? b.id : 0, para: para === 'casa' ? 'casa' : 'rua', st: 0 }); a.act = 'arrastar';
    return true;
  };
  // (out at the tavern's door — the day closed over one still out, nobody to drag one: down in front of it)
  E.aoChao = function (v) { if (!G.inSim || !v || !(v.ebrioD > 0) || isBody(v)) return false; G.Vg.setTask(v, { type: 'desmaio', pri: E.PRI, kind: 'desmaio', st: 0 }); return true; };
  // (for the proofs only: the blood set to e — a night's drinking at once —, the stomach empty)
  E.prova = function (v, e) { if (!v) return; v.ebrio = Math.max(0, Math.min(E.MAX, +e || 0)); v.ebrioG = 0; if (v.ebrio > (v.ebrioP > 0 ? v.ebrioP : 0)) v.ebrioP = v.ebrio; };

  // ------------------------------ the errands of the faint ------------------------------
  // down where one fell, or laid down where the one who carried one let go — at home, in one's bed (t.casa): asleep, the drink going;
  // woken at home in the night, to bed — the sleep goes on there —; else up, the head heavy
  function runDesmaio(v, t, dt, H) {
    const S = S_();
    if (!(v.ebrioD > 0)) { const h = S.buildings.get(v.home); if (v.inside && v.inside === v.home && G.Village.livable(h) && (G.isNight() || S.time < 0.2)) { v.sleeping = false; return H.setTask(v, { type: 'sleep', pri: 0.5, stay: v.inside, st: 0 }); } return H.end(v); }
    t.pri = E.PRI;
    if (t.st === 0) { const h = t.casa ? S.buildings.get(t.casa) : null; if (h && G.Village.livable(h) && !v.inside) G.Vg.enter(v, h); t.st = 1; }
    v.sleeping = true; v.act = 'desmaio'; v.moving = false; v.path = null;
  }
  // limp, in the hands of who drags one (who puts one where one goes: runArrastar); let go, down where one is
  function runArrastado(v, t, dt, H) {
    const S = S_(); const a = S.villagers.get(t.id); const at = a && a.task;
    if (!(v.ebrioD > 0)) return H.end(v); // (woke on the way: on one's own feet)
    v.act = 'arrastado'; v.sleeping = false; v.moving = false; v.path = null; if (!v.inside) t.pri = E.PRI;
    if (!a || !at || at.type !== 'arrastar' || at.id !== v.id || t.age > 150) { v.act = ''; return H.setTask(v, { type: 'desmaio', pri: E.PRI, kind: 'desmaio', st: 0 }); }
  }
  // the one who drags: a friend on the way to one down in the street first (st −1); out of the building by its door with the one dragged
  // — the walk out is the world's —, then down the street to the spot in front of it, or home, slowly, the body behind at the length of
  // the arms; laid down there
  function runArrastar(v, t, dt, H) {
    const S = S_(); const o = S.villagers.get(t.id);
    if (!o || !(o.ebrioD > 0)) return H.end(v);
    if (t.st === -1) {
      if (o.inside || !o.task || o.task.type !== 'desmaio') return H.end(v);
      if (G.dist(v.x, v.y, o.x, o.y) < 0.9) { G.Vg.setTask(o, { type: 'arrastado', id: v.id, pri: E.PRI, kind: 'arrastado' }); o.act = 'arrastado'; t.st = 0; v.actT = 0; return; }
      t.rt = (t.rt || 0) - dt; if (t.rt <= 0 || H.arrived(v)) { t.rt = 1.5; if (!H.goto(v, o.x, o.y, false)) return H.end(v); }
      H.move(v, dt); if (t.age > 60) return H.end(v); return;
    }
    if (!isBody(o) && (!o.task || o.task.type !== 'arrastado' || o.task.id !== v.id)) return H.end(v);
    if (v.inside) return; // (still walking out by the door)
    t.pri = E.PRI_ARR; v.act = 'arrastar';
    if (t.st === 0) {
      if (isBody(o)) { if (o.inside) { const b = S.buildings.get(o.inside); const d = b ? G.Vg.door(b) : [v.x, v.y]; G.Possess.arrasta(o, d[0], d[1]); } }
      else if (o.inside) return; // (the one dragged still on the walk out)
      const to = destOf(v, o, t);
      if (!to || (!H.goto(v, to[0], to[1], false) && !H.goto(v, to[0], to[1], true))) { lay(v, o, t); return H.end(v); }
      t.st = 1; return;
    }
    const done = H.move(v, dt, E.PUXA); behind(v, o);
    if (!done && t.age < 90) return;
    lay(v, o, t); return H.end(v);
  }
  // (the one dragged behind, at the length of the arms — on ground one stands on, else at the feet of the one dragging)
  function behind(v, o) {
    const fx = v.fx || 0, fy = v.fy || 0; const n = Math.hypot(fx, fy) || 1; const x = v.x - fx / n * 0.17, y = v.y - fy / n * 0.17;
    const ok = G.W.walkableXY(x, y); const px = ok ? x : v.x, py = ok ? y : v.y;
    if (isBody(o)) G.Possess.arrasta(o, px, py); else { o.x = px; o.y = py; }
    G.faceTo(o, v.x - o.x, v.y - o.y);
  }
  // (where the one dragged is laid down: home, by its door, when the one who carries can get there; else in front of the building one
  // was dragged out of — a little out from its door, out of the way of who comes in)
  function destOf(v, o, t) {
    const S = S_();
    if (t.para === 'casa' && !isBody(o)) { const h = S.buildings.get(o.home); if (G.Village.livable(h)) { const d = G.Vg.door(h); if (G.W.reaches(v, d[0], d[1])) return d; } t.para = 'rua'; }
    const b = S.buildings.get(t.b); if (!b) return [v.x, v.y];
    const d = G.Vg.door(b); let ux = d[0] - (b.x + b.w / 2), uy = d[1] - (b.y + b.h / 2); const n = Math.hypot(ux, uy) || 1; ux /= n; uy /= n;
    const side = (G.hash(Math.imul(o.id | 0, 97) + 5) < 0.5 ? -1 : 1) * 0.6;
    for (const k of [1.3, 0.9, 0.5]) { const x = d[0] + ux * k - uy * side, y = d[1] + uy * k + ux * side; if (G.W.walkableXY(x, y)) return [x, y]; }
    return d;
  }
  function lay(v, o, t) {
    if (isBody(o)) return; // (the body lies where it was let go, till it wakes)
    const S = S_(); const h = t.para === 'casa' ? S.buildings.get(o.home) : null;
    const home = !!h && G.Village.livable(h) && G.Vg.atDoor(o, h, 2.2);
    G.Vg.setTask(o, { type: 'desmaio', pri: E.PRI, kind: 'desmaio', st: 0, casa: home ? h.id : 0 });
    if (t.para === 'casa' && G.Lacos) { G.Lacos.ato(v, o, 'ajuda'); if (home && G.Life) G.Life.bio(o, 'note', `Desmaiou de bêbado e foi carregad${oa(o)} para casa por ${v.name}`); }
  }
  const Ec = G.Eco;
  if (Ec && Ec.run) {
    const oldRun = Ec.run;
    Ec.run = function (v, t, dt, H) {
      if (t.type === 'desmaio') { runDesmaio(v, t, dt, H); return true; }
      if (t.type === 'arrastado') { runArrastado(v, t, dt, H); return true; }
      if (t.type === 'arrastar') { runArrastar(v, t, dt, H); return true; }
      return oldRun(v, t, dt, H);
    };
    const pname = id => { const o = G.S.villagers.get(id); return o ? o.name : 'alguém'; };
    const oldText = Ec.taskText;
    Ec.taskText = function (v, t) {
      if (t.type === 'desmaio') return v.inside && v.inside === v.home ? 'Desmaiado de bêbado, na cama' : 'Desmaiado de bêbado no chão';
      if (t.type === 'arrastado') return `Sendo levado por ${pname(t.id)}, desmaiado`;
      if (t.type === 'arrastar') return t.st === -1 ? `Indo buscar ${pname(t.id)}, caído de bêbado` : t.para === 'casa' ? `Levando ${pname(t.id)} para casa` : `Arrastando ${pname(t.id)} para fora`;
      return oldText ? oldText(v, t) : '';
    };
  }

  // ------------------------------ the friends carry the one down in the street home ------------------------------
  // (who is out in the street now — once a step, the world's — and a friend near, sober and strong, goes and carries one home: the
  // family, or one who likes one well — G.Lacos —; one at a time)
  const down = { t: -1, p: -1, S: null, L: [] };
  function caidos() {
    const S = S_();
    if (down.S !== S || down.t !== S.clock || down.p !== G.part) { down.S = S; down.t = S.clock; down.p = G.part; down.L = []; for (const o of S.villagers.values()) if (o.ebrioD > 0 && o.task && o.task.type === 'desmaio' && !o.inside && !isBody(o)) down.L.push(o); }
    return down.L;
  }
  G.worldHooks.push(() => { down.S = null; down.L = []; });
  E.AMIGO = 20; // (the affection that has one carry the other home)
  function friendDown(v) {
    const S = S_(); const L = G.Lacos; let best = null, bs = -Infinity;
    for (const o of caidos()) {
      if (o === v || o.set !== v.set || !(o.ebrioD > 0) || !o.task || o.task.type !== 'desmaio' || o.inside || G.dist2(v.x, v.y, o.x, o.y) > 225) continue; // (still down: the list is the step's)
      const by = o.task.by && S.villagers.get(o.task.by); if (by && by.task && by.task.type === 'arrastar' && by.task.id === o.id) continue;
      const h = S.buildings.get(o.home); if (!G.Village.livable(h)) continue;
      const s = L ? L.sente(v, o) : null; const f = s ? s.afeto + (s.kin ? 30 : 0) : 0; if (f < E.AMIGO) continue;
      if (f > bs || (f === bs && o.id < best.id)) { bs = f; best = o; }
    }
    return best;
  }
  if (G.Vg && G.Vg.want) G.Vg.want('levar-bebado', {
    pri: 0.9,
    urge(v) { if (!E.forte(v) || v.captive || v.jail || v.aboard || v.inside || G.Vg.handsBusy(v) || !caidos().length) return 0; const o = friendDown(v); return o ? 1.15 : 0; },
    go(v, H) { const o = friendDown(v); if (!o || !G.W.reaches(v, o.x, o.y)) return null; const t = H.setTask(v, { type: 'arrastar', id: o.id, pri: 0.9, kind: 'arrastar', para: 'casa', st: -1 }); if (t && o.task) o.task.by = v.id; return t; },
  });

  // ------------------------------ what the drunk do (pure: G.Ebrio.impulso) ------------------------------
  // (D-834) at a look of one at the tavern's tables: the índole (G.Indole: the facets, the axes), how far the drink has gone (the marks
  // against what one bears), who is about (ctx.quem: [[person, at one's own table]] — the tavern gives it), the cup in the hand, the
  // music on, the partner drawn to another (ctx.par: [partner, the other]) — and the hash of the person and of the look. → null, or
  // { a: the act, o: the other's id, dur, fam: the way of it — agressivo, expansivo, triste, segredo, corte, ciume —, why }
  const hh = (v, slot, n) => G.hash(Math.imul(v.id | 0, 7919) + Math.imul(slot | 0, 104729) + Math.imul(n, 31337) + 17);
  const ax = (v, k) => (G.Indole ? G.Indole.ax(v, k) / 99 : 0.5);
  const fc = (v, k) => (G.Indole ? G.Indole.faceta(v, k) : 0.5);
  const sente = (v, o) => (G.Lacos && G.Lacos.sente ? G.Lacos.sente(v, o) : null);
  E.DUR = Object.freeze({ swear: 2, shout: 2.2, insult: 2.2, threaten: 2.4, spit: 1.2, 'jogar-bebida': 1.4, briga: 0, laugh: 2, cheer: 2.6, talk: 4.5, hug: 3, cantoria: 6, danca: 10, weep: 4.5, tell: 6 });
  E.impulso = function (v, ctx) {
    if (!v || !ctx || v.ebrioD > 0) return null; const g = E.g(v); if (g < LIM.alegre) return null;
    const slot = ctx.slot | 0; const h = n => hh(v, slot, n);
    const solto = G.smooth(LIM.alegre, LIM.bebado, g), forte = G.smooth(LIM.bebado, LIM.tonto, g), zonzo = G.smooth(LIM.tonto, LIM.desmaio, g);
    const agr = fc(v, 'agressivo'), ext = ax(v, 'ext'), ama = ax(v, 'ama'), neu = ax(v, 'neu'), con = ax(v, 'con');
    const quem = ctx.quem || []; const opts = [];
    const add = (s, a, o, fam, why) => { if (s > 0) opts.push({ s, a, o: o ? o.id : 0, fam, why: why || fam, dur: E.DUR[a] || 3 }); };
    // (1) the jealous: the partner here drawn into another's talk or hug — the suspicious and the resentful, loving the partner
    if (ctx.par && ctx.par[1]) { const cz = fc(v, 'desconfiado') * 0.6 + fc(v, 'rancoroso') * 0.4; const s = sente(v, ctx.par[0]); const love = s ? s.afeto : 30;
      if (cz >= 0.45 && love >= 20) add((cz - 0.3) * 2 * (0.5 + forte), 'shout', ctx.par[1], 'ciume', 'ciume'); }
    // (2) in vino veritas: the secret one keeps, once a night — the discreet bears more before it comes out
    if (!ctx.dito) { const sg = E.segredoDe(v); if (sg) { const disc = 0.55 * con + 0.45 * (1 - ext); const gate = LIM.bebado * (1 + 0.7 * disc);
      if (g >= gate) { const o = friendIn(v, quem) || firstAt(quem); if (o) add(0.5 + (g - gate) * 1.5, 'tell', o, 'segredo', sg.k); } } }
    // (3) the courtship: single, loosened, not yet staggering — to the one one is most drawn to here
    if (!v.partner && v.age >= 17 && v.age <= 55 && !(v.mourn > 0) && g < LIM.tonto) {
      const sx = 0.5 * ext + 0.2 * (1 - neu) + 0.5 * solto - 0.45;
      if (sx > 0) { const o = drawnTo(v, quem, ctx.cj); if (o) add(sx * 1.6, 'talk', o, 'corte', 'atracao'); }
    }
    // (4) the aggressive: the words first, then the threat, the spit, the cup thrown, the call to the fists — the drunker, the worse
    const sAg = Math.max(0, agr - 0.45) * 2.4 * (0.4 * solto + 0.6 * forte) * (1 - 0.5 * zonzo);
    if (sAg > 0) {
      const r = rivalIn(v, quem, agr, forte); const sev = h(2) * (0.5 + forte + agr * 0.6);
      if (!r || sev < 0.45) add(sAg, h(3) < 0.5 ? 'swear' : 'shout', null, 'agressivo');
      else if (sev < 0.85) add(sAg, 'insult', r, 'agressivo');
      else if (sev < 1.15) add(sAg, 'threaten', r, 'agressivo');
      else if (sev < 1.4 && agr >= 0.55) add(sAg, 'spit', r, 'agressivo');
      else if (ctx.cup && agr >= 0.55) add(sAg, 'jogar-bebida', r, 'agressivo');
      else if (agr >= 0.6 && forte > 0.3 && E.alegre(r)) add(sAg, 'briga', r, 'agressivo');
      else add(sAg, 'insult', r, 'agressivo');
    }
    // (5) the merry and outgoing: the laugh and the toast, the talk with a stranger, the hug of a friend, the song alone and the dance in
    // the middle of the hall — the last two only with no music on (with it, the dance and the song along are the tavern's: listen)
    const sAm = Math.max(0, 0.55 * ext + 0.45 * ama - 0.42) * 2.2 * solto * (1 - 0.6 * zonzo);
    if (sAm > 0) {
      const k = h(4); const amigo = friendIn(v, quem), novo = strangerIn(v, quem);
      if (!ctx.musica && ext >= 0.6 && forte > 0.3 && k < 0.18 && v.energy > 30 && v.age < 60) add(sAm, 'danca', null, 'expansivo');
      else if (!ctx.musica && ext >= 0.55 && forte > 0.15 && k < 0.36) add(sAm, 'cantoria', null, 'expansivo');
      else if (novo && ext >= 0.5 && k < 0.62) add(sAm, 'talk', novo, 'expansivo', 'estranho');
      else if (amigo && ama >= 0.5 && forte > 0.1 && k < 0.8) add(sAm, 'hug', amigo, 'expansivo');
      else add(sAm, k < 0.9 ? 'laugh' : 'cheer', null, 'expansivo');
    }
    // (6) the sad: the nervous, the grieving, the low — the tears, or the heart poured out to a friend
    const hu = G.Indole && G.Indole.humor ? G.Indole.humor(v) : 0;
    const sad = Math.max(0, (neu - 0.55) * 1.4 + (v.mourn > 0 ? 0.7 : 0) + (hu < -0.25 ? 0.35 : 0)); const sTr = sad * (0.4 * solto + 0.6 * forte) * 1.2;
    if (sTr > 0) { const amigo = friendIn(v, quem); add(sTr, amigo && h(5) < 0.55 ? 'tell' : 'weep', amigo && h(5) < 0.55 ? amigo : null, 'triste', v.mourn > 0 ? 'luto' : 'triste'); }
    if (!opts.length) return null;
    opts.sort((x, y) => y.s - x.s || (x.a < y.a ? -1 : x.a > y.a ? 1 : 0));
    const best = opts[0]; return h(1) < Math.min(0.8, best.s) ? best : null;
  };
  // (the one at one's table first, else the first about)
  const firstAt = quem => { for (const q of quem) if (q[1]) return q[0]; return quem.length ? quem[0][0] : null; };
  // (whom one quarrels with: the one one dislikes most — who hurt one lately above all, at one's own table first —; a quarrelsome drunk
  // with anyone not of one's own)
  function rivalIn(v, quem, agr, forte) {
    let best = null, bs = Infinity;
    for (const [o, same] of quem) { const s = sente(v, o); if (s && s.kin) continue; let af = s ? s.afeto : 0; if (same) af -= 4; if (G.Lacos && G.Lacos.ferida && G.Lacos.ferida(v, o)) af -= 30; if (af < bs || (af === bs && best && o.id < best.id)) { bs = af; best = o; } }
    return best && (bs < -5 || (agr >= 0.6 && forte > 0.25)) ? best : null;
  }
  // (a friend about: the kin or one dear — at one's own table first)
  function friendIn(v, quem) { let best = null, bs = 14; for (const [o, same] of quem) { const s = sente(v, o); const f = s ? s.afeto + (same ? 5 : 0) : -1; if (f > bs || (f === bs && best && o.id < best.id)) { bs = f; best = o; } } return best; }
  // (one never spoken to: no tie at all — at one's own table first)
  function strangerIn(v, quem) { for (const pass of [true, false]) for (const [o, same] of quem) if (same === pass && !sente(v, o)) return o; return null; }
  // (the one most drawn to, single and of the other sex, grown, not near kin, not courted already tonight)
  function drawnTo(v, quem, done) {
    let best = null, bs = 8;
    for (const [o, same] of quem) {
      if (o.g === v.g || o.partner || o.age < 17 || o.age > 55 || o.mourn > 0 || Math.abs(o.age - v.age) > 16 || o.id === done) continue;
      if (G.Vg.relatedClose && G.Vg.relatedClose(v, o)) continue;
      const s = sente(v, o); const sc = (s ? s.atracao + s.afeto * 0.3 : 0) + (G.Indole ? G.Indole.par(v, o) * 20 : 0) + (same ? 5 : 0);
      if (sc > bs || (sc === bs && best && o.id < best.id)) { bs = sc; best = o; }
    }
    return best;
  }
  // the secret one keeps (in vino veritas): the order one swore to (G.Secrets), a love for someone not one's partner, a theft nobody
  // answered for yet — the first of them. Pure
  E.segredoDe = function (v) {
    const S = S_(); if (!v || !S) return null;
    const Sc = G.Secrets; if (v.secret && Sc && Sc.get && Sc.get(v.secret)) return { k: 'ordem', id: v.secret };
    let best = null, bs = 34;
    for (const t of v.lacos || []) { if (t[0] === v.partner) continue; const o = S.villagers.get(t[0]); if (!o) continue; const s = sente(v, o); if (s && !s.kin && s.atracao > bs) { bs = s.atracao; best = o; } }
    if (best) return { k: 'amor', o: best.id };
    if ((v.thefts || 0) > 0 && (S.crimes || []).some(c => c.thief === v.id && c.kind === 'furto' && c.st === 'aberto')) return { k: 'furto' };
    return null;
  };
  // the other's answer to a drunk one's act, by who they are (pure): the quarrelsome answer back, the nervous cower, the rest disagree;
  // the wet one is wet; the stranger and the friend listen; the hugged hugs back
  E.resposta = function (o, a, v, fam) {
    const agr = fc(o, 'agressivo'), neu = ax(o, 'neu'); void v;
    switch (a) {
      case 'insult': case 'threaten': case 'spit': case 'shout': return agr >= 0.55 || (E.bebado(o) && agr >= 0.45) ? (a === 'threaten' ? 'threaten' : a === 'shout' ? 'shout' : 'insult') : neu >= 0.55 ? 'cower' : 'disagree';
      case 'jogar-bebida': return 'molhado';
      case 'talk': return fam === 'corte' ? 'listen' : 'listen';
      case 'tell': return 'listen';
      case 'hug': return 'hug';
    }
    return '';
  };
  // (the wet one hits back: the quick to anger, or drunk and not far from it)
  E.revida = (o, v) => { void v; const a = fc(o, 'agressivo'); return a >= 0.5 || (E.bebado(o) && a >= 0.4); };

  // ------------------------------ what the drunk say ------------------------------
  // (a line of the act, by the hash of the one and the moment: {o} the other as one calls them — the name of one known, else a word —,
  // {s} the order, {a} the one loved, {m} the one mourned, {p} the partner; {x} the ending of the speaker)
  const FALA = {
    swear: ['Maldito seja este dia!', 'Raios e trovões!', 'Que os deuses levem esta vida!', 'Ninguém presta nesta cidade!'],
    shout: ['Mais uma aqui, e depressa!', 'Quem manda nesta mesa sou eu!', 'Silêncio! Eu quero falar!', 'Ninguém me respeita aqui!'],
    insult: ['{o}, você é um porco!', 'Olha só quem fala… {o}, seu verme!', '{o}, nem a sua mãe te aguenta!', 'Cara de bode, {o}!'],
    threaten: ['Fala mais uma, {o}, e eu te quebro!', 'Lá fora, {o}! Vamos resolver isso agora!', 'Você vai ver só, {o}!'],
    spit: ['Ptu! É o que eu penso de você, {o}!'],
    'jogar-bebida': ['Toma, {o}! Pra esfriar essa cabeça!', 'Bebe isso, {o}!'],
    molhado: ['Ei! Você me molhou tod{x}!', 'Meu manto! Seu bêbado!'],
    briga: ['Agora você apanha, {o}!', 'Vem, {o}! Vem!'],
    laugh: ['Ha! Ha! Essa foi boa!', 'Hahaha! Eu não aguento!'],
    cheer: ['Saúde! À nossa!', 'Viva esta taverna!', 'Mais uma rodada, que a noite é nossa!'],
    talk: ['Ei, {o}! Nunca te vi por aqui… de onde você é?', 'Senta mais perto, {o}! Deixa eu te contar uma coisa…', 'Você parece gente boa, {o}!'],
    hug: ['Você é {o} meu melhor amigo, sabia?', 'Eu gosto de você, {o}! De verdade!'],
    cantoria: ['♪ Enche a caneca, enche outra vez! ♪', '♪ Ó noite boa, não acabe não! ♪', '♪ Lá-lá-lá… mais uma, mais uma! ♪'],
    danca: ['Música ou não, eu vou dançar!', 'Abram espaço! Lá vou eu!'],
    weep: ['Ninguém me entende…', 'A vida é tão dura…', 'Eu não sirvo pra nada…'],
    luto: ['Sinto tanta falta de {m}…', '{m}… por que você me deixou?'],
    tell: ['Vou te contar uma coisa, {o}… a vida não é fácil.', '{o}, você é o único que me escuta…'],
    ordem: ['Psiu, {o}… eu sou {s}. Mas não conta pra ninguém!'],
    amor: ['Vou confessar, {o}: eu sou doid{x} por {a}!'],
    furto: ['Sabe aquela casa roubada? Fui eu! Ha! Não conta, hein?'],
    corte: ['{o}, já te disseram que você tem uns olhos lindos?', 'Que tal mais uma rodada, só nós dois, {o}?'],
    ciume: ['Tira os olhos de quem é meu, {o}!', 'O que você quer com {p}, {o}?'],
    arrastar: ['Chega por hoje. Para a rua!', 'Vamos, para fora, que aqui não é cama!'],
    levar: ['Vem, amigo. Vamos para casa.', 'Apoia em mim. Pra casa, vamos.'],
  };
  E.FALA = FALA;
  const callOf = (v, o) => (!o ? '' : sente(v, o) ? o.name : o.g === 'f' ? 'moça' : 'rapaz');
  E.fala = function (v, a, o, imp, slot) {
    const S = S_(); if (!v) return null;
    let key = a; if (imp && (imp.fam === 'segredo' || imp.fam === 'corte' || imp.fam === 'ciume')) key = imp.fam === 'segredo' ? imp.why : imp.fam; if (a === 'weep' && v.widow && v.mourn > 0) key = 'luto';
    const L = FALA[key]; if (!L || !L.length) return null;
    const t = L[Math.floor(hh(v, (slot | 0) + 7, key.length) * L.length) % L.length];
    const sg = key === 'ordem' || key === 'amor' ? E.segredoDe(v) : null;
    const morto = key === 'luto' ? (S.villagers.get(v.widow) || S.dead.get(v.widow)) : null; const par = key === 'ciume' && v.partner ? S.villagers.get(v.partner) : null;
    const amado = sg && sg.o ? S.villagers.get(sg.o) : null; const q = sg && sg.k === 'ordem' && G.Secrets && G.Secrets.get ? G.Secrets.get(sg.id) : null;
    return t.replace(/\{o\}/g, callOf(v, o) || 'amigo').replace(/\{x\}/g, oa(v)).replace(/\{m\}/g, morto ? morto.name : 'quem se foi').replace(/\{p\}/g, par ? par.name : 'ela')
      .replace(/\{a\}/g, amado ? amado.name : 'alguém').replace(/\{s\}/g, q && G.Secrets.art ? G.Secrets.art(q.name, 'de') : 'de uma ordem secreta');
  };

  // ------------------------------ what a drunk one's act leaves (only in the world's step) ------------------------------
  // (the end of the act at the tables: between the two, the tie and the mark — G.Lacos —; the secret told runs as a rumour — G.Secrets,
  // G.Boatos —, heard by name by who was at the table; the courtship asks the yes of both and the couple's door — G.Lacos.corte,
  // G.Vg.pair. ouvintes: who heard it)
  if (G.Lacos && G.Lacos.tipo) G.Lacos.tipo('bebida', { a: [-4, 0, 0, 0], b: [-18, -10, -6, -8], frente: 1 }); // (a drink thrown over one)
  E.fim = function (v, a, o, fam, why, ouvintes) {
    if (!G.inSim || !v) return null; const L = G.Lacos; if (!L) return null;
    if (fam === 'segredo') return conta(v, why, ouvintes);
    if (fam === 'corte') return o ? corteja(v, o) : null;
    if (!o) return null;
    switch (a) {
      case 'insult': L.ato(v, o, 'insulto'); L.marca(o, 'insultou', v.id, 25); break;
      case 'threaten': L.ato(v, o, 'ameaca'); L.marca(o, 'ameacou', v.id, 30); break;
      case 'spit': L.ato(v, o, 'insulto'); L.marca(o, 'humilhou', v.id, 30); break;
      case 'shout': L.ato(v, o, 'discussao'); break;
      case 'talk': case 'tell': L.ato(v, o, 'conversa'); break;
      case 'hug': L.ato(v, o, 'abraco'); break;
    }
    return a;
  };
  function conta(v, kind, ouvintes) {
    const S = S_(); const set = S.settlements.get(v.set); const sg = E.segredoDe(v); if (!set || !sg || sg.k !== kind) return null;
    const Bo = G.Boatos; let r = null;
    if (kind === 'ordem' && G.Secrets && G.Secrets.rumor) {
      const q = G.Secrets.get(sg.id); const f = G.Fac.ofV(v);
      const sr = G.Secrets.rumor(f ? f.id : 0, v.set, `${v.name} contou, bêbad${oa(v)} na taverna, que é ${G.Secrets.art ? G.Secrets.art(q.name, 'de') : q.name}.`, q.id, true, 1.6, { accused: v.id });
      r = Bo && sr ? Bo.list().find(x => x.sec === sr.id) || null : null;
    } else if (Bo && Bo.nasce) {
      const x = sg.o ? S.villagers.get(sg.o) : null;
      const tx = kind === 'amor' ? `${v.name}, bêbad${oa(v)} na taverna, confessou que é apaixonad${oa(v)} por ${x ? x.name : 'alguém'}.` : `${v.name}, bêbad${oa(v)} na taverna, se gabou de ter roubado uma casa.`;
      r = Bo.nasce('fofoca', { set: set.id, a: v.id, b: x ? x.id : 0, tx, n: { a: v.name }, p0: kind === 'amor' ? 120 : 160 });
    }
    if (r && Bo && Bo.ensina) for (const w of ouvintes || []) if (w && w !== v) Bo.ensina(w, r, 'ouviu', v.set);
    return r ? kind : null;
  }
  function corteja(v, o) {
    const L = G.Lacos; if (!L.corte || v.partner || o.partner) return null;
    const r = L.corte(v, o);
    if (r === 'sim' && G.Vg.pair(v, o, 'corte')) {
      const S = S_(); S.stats.couples = (S.stats.couples || 0) + 1;
      if (G.Life) { G.Life.bio(v, 'couple', o.id); G.Life.bio(o, 'couple', v.id); }
      const set = S.settlements.get(v.set); const [a, b] = v.g === 'f' ? [v, o] : [o, v];
      G.Village.log(`${a.name} e ${b.name} se acertaram numa noite de bebedeira na taverna${set ? ' de ' + set.name : ''}.`, 'heart', v.x, v.y);
    }
    return r;
  }
  // (another round? the drink calls for more drink — the impulsive the more —, until it is too much to ask: what again() of the tavern
  // adds, and how many rounds past the usual four one goes)
  E.sede = v => { const g = E.g(v); if (g < LIM.alegre) return 0; const imp = fc(v, 'impulsivo'); return 0.3 * G.smooth(LIM.alegre, LIM.bebado, g) * (0.4 + 0.6 * imp) - 0.45 * G.smooth(LIM.tonto, LIM.desmaio, g); };
  E.mais = v => { const g = E.g(v); const s = G.smooth(LIM.alegre, LIM.bebado, g); return s < 0.5 ? 0 : Math.round(1 + 3 * fc(v, 'impulsivo') * s); };
  // (the drunk walk slower: the staggering most — the world's pace of a step, villagers.js move)
  E.lento = v => (v && v.ebrio > 0.3 ? 1 - 0.25 * G.smooth(LIM.bebado, LIM.desmaio, E.g(v)) : 1);

  // ------------------------------ the save ------------------------------
  // (the drink of each one is in the person, in the save with the shape; a save of before the drink in the blood kept only the clock the
  // tavern's mark wore off at — v.drunk —: read as a level once, and let go; a damaged number mended to nothing)
  const NUMS = ['ebrio', 'ebrioG', 'ebrioP', 'ebrioD', 'ressaca'];
  G.saveHooks.push({
    save() { },
    load() {
      const S = S_();
      for (const v of S.villagers.values()) {
        if (v.drunk !== undefined) { if (v.drunk > S.clock && !(v.ebrio > 0)) v.ebrio = r4(Math.min(1.2, 0.35 + (v.drunk - S.clock) / 150)); v.drunk = undefined; }
        for (const k of NUMS) if (v[k] !== undefined && !(Number.isFinite(v[k]) && v[k] >= 0)) v[k] = 0;
        if (v.ebrio > E.MAX) v.ebrio = E.MAX; if (v.ressaca > 1) v.ressaca = 1;
        if (v.molhado !== undefined && !Number.isFinite(molhadoT(v.molhado))) v.molhado = undefined;
      }
    },
  });
})(window.G);
