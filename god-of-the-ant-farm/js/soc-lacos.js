// soc-lacos: the ties between people and the memory of who did what (SOCIEDADE.md §3.2, §3.5, D-542, D-545; 22b D-571 to D-576). What
// each one feels for another — four whole numbers: affection (−100..100), trust (−100..100), respect (−100..100), attraction (0..100) —
// and the feelings the owner named read from them (friendship, love, passion, hatred, rivalry, admiration, respect, trust, envy,
// resentment, indifference). A tie is directed (each keeps what they feel; a love may go unanswered), sparse and capped (16 for a
// grown one, 8 for a child; full, the weakest goes). The family is implicit: what a child feels for the mother for being her child is
// read from the kinship the world keeps (L.base), never stored — a stored tie holds only what life changed of it. Kept as
// v.lacos = [[id, afeto, confianca, respeito, atracao, dia, bits], …], only by this file (guard rule 205). The ties change only by
// events, through one door — L.ato(a, b, tipo), only inside the world's step, at the end of what happened (a talk ended, the
// tavern's table left, a courtship answered) —, and cool on the town's day (G.mod('soc.day'), one town a step, its turn in the
// save). The readings are pure (rule 208).
(function (G) {
  'use strict';
  const L = G.Lacos = {};
  const CAP = L.CAP = 16, CAP_KID = L.CAP_KID = 8;
  const AF = 1, CF = 2, RS = 3, AT = 4, DIA = 5, BITS = 6;
  // (the bits of a tie: met face to face; the courtship refused — by the other, the day in dia; drank at the same table)
  const BIT = L.BIT = Object.freeze({ frente: 1, recusa: 2, mesa: 4 });
  const S_ = () => G.S;
  const clampI = (x, lo, hi) => (x < lo ? lo : x > hi ? hi : Math.round(x));
  L.fora = 0; // (asked outside the world's step: nothing done, counted — the proofs read it)
  G.worldHooks.push(() => { L.fora = 0; roster.t = -1; });

  // ------------------------------ the family, implicit ------------------------------
  // what one feels for another by the kinship alone: the partner (and the one widowed of), the parents, the children, the siblings
  const BASE = {
    par: Object.freeze([60, 55, 30, 45]), pai: Object.freeze([55, 55, 40, 0]), filho: Object.freeze([62, 45, 20, 0]),
    irmao: Object.freeze([35, 35, 15, 0]), viuvo: Object.freeze([50, 40, 25, 10]),
  };
  const ZERO = Object.freeze([0, 0, 0, 0]);
  function kin(v, o) {
    if (!v || !o || v.id === o.id) return null;
    if (v.partner === o.id) return 'par';
    if (v.widow === o.id) return 'viuvo';
    if (v.mother === o.id || v.father === o.id) return 'pai';
    if (o.mother === v.id || o.father === v.id) return 'filho';
    if ((v.mother && v.mother === o.mother) || (v.father && v.father === o.father)) return 'irmao';
    return null;
  }
  L.kin = kin;
  L.base = (v, o) => { const k = kin(v, o); return k ? BASE[k] : ZERO; };
  // the stored tie of v toward the id, or null
  const find = (v, id) => { const a = v && v.lacos; if (!a) return null; for (let i = 0; i < a.length; i++) if (a[i][0] === id) return a[i]; return null; };
  L.find = (v, id) => find(v, id); // (read only)

  // ------------------------------ the readings (pure) ------------------------------
  // what v feels for o: the kinship's base plus what life changed; the labels the owner named read from the four numbers (and the
  // marks, phase 2); null for one v has no tie with and no kin
  L.sente = function (v, o) {
    if (!v || !o) return null; const k = kin(v, o); const t = find(v, o.id);
    if (!k && !t) return null;
    const b = k ? BASE[k] : ZERO;
    const af = clampI(b[0] + (t ? t[AF] : 0), -100, 100), cf = clampI(b[1] + (t ? t[CF] : 0), -100, 100), rs = clampI(b[2] + (t ? t[RS] : 0), -100, 100), at = clampI(b[3] + (t ? t[AT] : 0), 0, 100);
    return { afeto: af, confianca: cf, respeito: rs, atracao: at, kin: k, dia: t ? t[DIA] : -1, rotulos: labels(v, o, af, cf, rs, at, k) };
  };
  function labels(v, o, af, cf, rs, at, k) {
    const out = [];
    if (af >= 30 && cf >= 20 && !k) out.push('amizade');
    if (at >= 40 && af >= 40) out.push('amor'); else if (at >= 45 && af < 40) out.push('paixao');
    if (af <= -50) out.push('odio');
    if (af < 0 && rs >= 20 && !k && rival(v, o)) out.push('rivalidade');
    if (rs >= 50) out.push('admiracao'); else if (rs >= 25) out.push('respeito');
    if (cf >= 45) out.push('confianca'); else if (cf <= -40) out.push('desconfianca');
    if (af < 10 && rs >= 30 && above(o, v) && G.Indole && G.Indole.ax(v, 'amb') >= 60 && G.Indole.ax(v, 'hon') <= 45) out.push('inveja');
    if (L.ferida && L.ferida(v, o)) out.push('ressentimento');
    if (!out.length && Math.abs(af) < 10 && cf < 10 && at < 10) out.push('indiferenca');
    return out;
  }
  // (two who want the same: the same trade, the same post)
  const rival = (v, o) => !!(v.role && v.role === o.role && v.set === o.set);
  // (the other above in what the person cares for: rule, renown, a trade of more standing)
  const above = (o, v) => !!((o.reigned && !v.reigned) || (o.hero || 0) > (v.hero || 0) || (o.elite && !v.elite));
  // the ids v has a tie with, by a label ('amizade', 'amor', 'odio', …): the stored ties and the family
  L.de = function (v, rotulo) {
    const S = S_(); const out = []; if (!v || !S) return out;
    for (const t of v.lacos || []) { const o = S.villagers.get(t[0]); if (!o) continue; const s = L.sente(v, o); if (s && s.rotulos.includes(rotulo)) out.push(o.id); }
    return out;
  };
  // the score of one as the one to go to for this — the talk, the courtship, a visit — at the squared distance d2 (−Infinity: not
  // that one). The nearest still counts, but a friend ten houses off beats a stranger three; whoever one hates is not sought
  L.peso = function (v, o, tipo, d2) {
    const s = L.sente(v, o); const d = Math.sqrt(d2);
    if (tipo === 'conversa') {
      if (!s) return d2 < 144 ? -d / 1.5 - 2 : -Infinity;
      if (s.afeto <= -30) return -Infinity;
      return -d / 1.5 + (s.afeto + s.confianca * 0.3) / 8 + (s.dia === S_().day ? -0.8 : 0.4);
    }
    if (tipo === 'corte') {
      if (s && (s.afeto < -10 || (s.dia >= S_().day - 4 && (L.find(v, o.id) || [])[BITS] & BIT.recusa))) return -Infinity;
      if (!s || s.atracao < 4) return d2 < 196 ? -d * 0.6 - 3 : -Infinity;
      return s.atracao * 0.5 + s.afeto * 0.25 + 8 * (G.Indole ? G.Indole.par(v, o) : 0) - d * 0.3;
    }
    if (tipo === 'visita') { if (!s || s.afeto < 20) return -Infinity; return s.afeto + (o.age >= 55 ? 25 : 0) - d * 0.2; }
    return -d;
  };
  L.alvo = function (v, tipo, cands) { let best = null, bs = -Infinity; for (const o of cands) { if (!o || o === v) continue; const s = L.peso(v, o, tipo, G.dist2(v.x, v.y, o.x, o.y)); if (s > bs) { bs = s; best = o; } } return best; };

  // ------------------------------ the per-town roster ------------------------------
  // the people of each town, made once a step (the choices of a step ask it many times; the whole world was walked for each one)
  const roster = { t: -1, p: -1, S: null, m: new Map() };
  L.roster = function (sid) {
    const S = S_();
    if (roster.S !== S || roster.t !== S.clock || roster.p !== G.part) {
      roster.S = S; roster.t = S.clock; roster.p = G.part; roster.m.clear();
      for (const o of S.villagers.values()) { let a = roster.m.get(o.set); if (!a) roster.m.set(o.set, a = []); a.push(o); }
    }
    return roster.m.get(sid) || [];
  };

  // ------------------------------ the door of the events ------------------------------
  // what an event does to how a feels for b (a) and b for a (b): [afeto, confianca, respeito, atracao]; the attraction only between two
  // grown ones of the other sex who are not close kin
  const TIPO = {
    conversa: { a: [8, 4, 1, 3], b: [8, 4, 1, 3], frente: 1 },
    visita: { a: [4, 3, 1, 0], b: [5, 3, 1, 0], frente: 1 },
    mesa: { a: [7, 4, 1, 2], b: [7, 4, 1, 2], frente: 1, bit: BIT.mesa },
    corte: { a: [4, 2, 1, 18], b: [3, 1, 1, 11], frente: 1 },
    trabalho: { a: [4, 3, 2, 2], b: [4, 3, 2, 2] }, atrito: { a: [-4, -2, 0, -2], b: [-4, -2, 0, -2] }, vizinho: { a: [3, 3, 1, 2], b: [3, 3, 1, 2] }, brincar: { a: [4, 2, 0, 0], b: [4, 2, 0, 0] },
    recusa: { a: [-3, -2, 0, -4], b: [0, 0, 0, 0] },
    // (phase 2: what people do for and against each other — a the one who did it, b the one it was done to; for 'matou', a is one of
    // the dead's and b the killer)
    ajuda: { a: [3, 2, 2, 0], b: [14, 10, 8, 0], frente: 1 }, dadiva: { a: [2, 1, 0, 0], b: [10, 6, 3, 0], frente: 1 },
    emprestimo: { a: [2, 0, 0, 0], b: [8, 6, 2, 0], frente: 1 }, cumpriu: { a: [2, 0, 0, 0], b: [6, 14, 4, 0], frente: 1 },
    quebrou: { a: [-2, 0, 0, 0], b: [-14, -25, -6, 0] }, salvou: { a: [4, 2, 0, 0], b: [30, 25, 20, 0], frente: 1 },
    discussao: { a: [-8, -4, -2, -4], b: [-8, -4, -2, -4], frente: 1 }, insulto: { a: [-3, 0, 0, 0], b: [-14, -8, -6, -6], frente: 1 },
    briga: { a: [-12, -8, -3, -6], b: [-15, -10, -3, -8], frente: 1 }, agressao: { a: [-5, 0, 0, 0], b: [-30, -30, -10, -20], frente: 1 },
    furto: { a: [0, 0, 0, 0], b: [-20, -30, -5, 0] }, denunciou: { a: [-4, 0, 0, 0], b: [-25, -25, 0, 0] },
    matou: { a: [-60, -50, 0, -20], b: [0, 0, 0, 0] }, separacao: { a: [-20, -20, -5, -20], b: [-20, -20, -5, -20] },
    reconcilia: { a: [12, 6, 2, 0], b: [12, 6, 2, 0], frente: 1 },
    // (phase 4: what the body's hands do to someone — soc-verbos.js; a the body, b the other — and the hug of anyone)
    cumprimento: { a: [2, 1, 0, 0], b: [2, 1, 0, 0], frente: 1 }, elogio: { a: [1, 0, 0, 0], b: [6, 2, 5, 1], frente: 1 },
    lisonja: { a: [0, 0, 0, 0], b: [-2, -6, -2, 0], frente: 1 }, beijo: { a: [6, 3, 0, 12], b: [6, 3, 0, 12], frente: 1 },
    ameaca: { a: [-4, 0, 0, 0], b: [-16, -14, 4, -8], frente: 1 }, abraco: { a: [5, 3, 0, 1], b: [6, 3, 0, 1], frente: 1 },
    convite: { a: [3, 2, 0, 1], b: [6, 3, 1, 1], frente: 1 }, pedido: { a: [0, 0, 0, 0], b: [0, 0, -2, 0], frente: 1 },
  };
  L.TIPOS = () => Object.keys(TIPO);
  L.tipo = (k, def) => { if (!TIPO[k]) TIPO[k] = def; };
  const canLove = (a, b) => a.age >= 16 && b.age >= 16 && a.g !== b.g && !(G.Vg.relatedClose && G.Vg.relatedClose(a, b));
  function strength(t) { return Math.abs(t[AF]) + Math.abs(t[CF]) * 0.5 + Math.abs(t[RS]) * 0.5 + t[AT]; }
  L.strength = strength;
  // (a tie that must stay while it is full: one tied to a live mark — phase 2 —, or the partner's)
  const keeps = (v, t) => (L.marked ? L.marked(v, t[0]) : false);
  // the change of how one feels for the other, weighed by who feels it: the kind forgive and warm sooner, the nervous keep an offence,
  // two who get on warm faster; the attraction asks the other sex and the age
  function feel(v, o, d, def, x) {
    const k = kin(v, o); const b = k ? BASE[k] : ZERO;
    const I = G.Indole; const ama = I ? I.ax(v, 'ama') / 99 : 0.5, neu = I ? I.ax(v, 'neu') / 99 : 0.5;
    const par = I ? I.par(v, o) : 0;
    const pos = (0.6 + 0.8 * ama) * (1 + 0.5 * par), neg = 0.6 + 0.6 * neu + 0.4 * (1 - ama);
    const ch = [0, 0, 0, 0];
    for (let i = 0; i < 3; i++) ch[i] = d[i] > 0 ? d[i] * pos : d[i] * neg;
    ch[3] = d[3] > 0 ? (canLove(v, o) ? d[3] * (1 + 0.6 * par) * (x && x.atr !== undefined ? x.atr : 1) : 0) : d[3];
    let t = find(v, o.id);
    if (!t) {
      if (ch.every(c => Math.abs(c) < 0.5)) return null;
      t = [o.id, 0, 0, 0, 0, S_().day, 0];
      const cap = v.age < 16 ? CAP_KID : CAP; const a = v.lacos || (v.lacos = []);
      if (a.length >= cap) {
        let wi = -1, ws = Infinity; for (let i = 0; i < a.length; i++) { if (keeps(v, a[i])) continue; const s = strength(a[i]); if (s < ws) { ws = s; wi = i; } }
        const mine = Math.abs(ch[0]) + Math.abs(ch[1]) * 0.5 + Math.abs(ch[2]) * 0.5 + Math.max(0, ch[3]);
        if (wi < 0 || mine <= ws) return null; // (not dear enough to push another out)
        a.splice(wi, 1);
      }
      a.push(t);
    }
    t[AF] = clampI(t[AF] + ch[0], -100 - b[0], 100 - b[0]); t[CF] = clampI(t[CF] + ch[1], -100 - b[1], 100 - b[1]);
    t[RS] = clampI(t[RS] + ch[2], -100 - b[2], 100 - b[2]); t[AT] = clampI(t[AT] + ch[3], -b[3], 100 - b[3]);
    t[DIA] = S_().day; if (def.frente) t[BITS] |= BIT.frente; if (def.bit) t[BITS] |= def.bit; if (x && x.bit) t[BITS] |= x.bit;
    return t;
  }
  // the one door: a and b lived something together (tipo), at its end — only inside the world's step (outside it, nothing, and counted)
  L.ato = function (a, b, tipo, x) {
    if (!G.inSim) { L.fora++; return false; }
    const def = TIPO[tipo]; if (!def || !a || !b || a === b || a.id === b.id) return false;
    if (!G.S.villagers.has(a.id) || !G.S.villagers.has(b.id)) return false;
    const xa = x && x.a, xb = x && x.b;
    feel(a, b, def.a, def, xa); if (def.b.some(c => c) || def.frente) feel(b, a, def.b, def, xb);
    return true;
  };

  // ------------------------------ the marks: who did what (phase 2, D-577) ------------------------------
  // v.marcas = [[tipo, quem, dia, peso, extra], …], up to MARCAS (the lightest goes): what someone did to the person, or to one of
  // theirs — the memory of a relation, short, with ids, that decides (the biography tells the world; the mark is the person's). Its
  // weight is how much it stays on the mind: an offence weighs more and lasts longer in one who keeps grudges (nervous and unkind), a
  // kindness in the kind; and a weight that fades, day by day. A debt or a promise does not fade: it is paid, or broken (soc-vida.js)
  const MARCA = L.MARCA = Object.freeze({
    salvou: 1, ajudou: 1, deu: 1, consolou: 1, pagou: 1, ensinou: 1, defendeu: 1,
    humilhou: -1, insultou: -1, bateu: -1, roubou: -1, traiu: -1, matou: -1, denunciou: -1, recusou: -1, ameacou: -1,
    deve: 0, emprestou: 0, prometeu: 0,
  });
  L.MARCAS = 8;
  const mk = (v, tipo, quem) => { const m = v && v.marcas; if (!m) return null; for (const q of m) if (q[0] === tipo && q[1] === quem) return q; return null; };
  L.marca = function (a, tipo, quem, peso, extra) {
    if (!G.inSim) { L.fora++; return false; }
    if (!a || !Object.prototype.hasOwnProperty.call(MARCA, tipo) || !quem || quem === a.id || !G.S.villagers.has(a.id)) return false;
    const sg = MARCA[tipo]; const I = G.Indole;
    const k = sg < 0 ? 0.6 + 0.8 * I.faceta(a, 'rancoroso') : sg > 0 ? 0.6 + 0.6 * I.ax(a, 'ama') / 99 : 1;
    const w = clampI(peso * k, 1, 100); const S = S_();
    const old = mk(a, tipo, quem);
    if (old) { old[2] = S.day; old[3] = Math.max(old[3], w); if (extra !== undefined) old[4] = extra; return true; }
    const m = a.marcas || (a.marcas = []);
    if (m.length >= L.MARCAS) {
      let li = -1, lw = Infinity; for (let i = 0; i < m.length; i++) if (MARCA[m[i][0]] !== 0 && m[i][3] < lw) { lw = m[i][3]; li = i; }
      if (li < 0 || lw >= w) return false;
      m.splice(li, 1);
    }
    m.push(extra === undefined ? [tipo, quem, S.day, w] : [tipo, quem, S.day, w, extra]);
    return true;
  };
  L.desmarca = function (a, tipo, quem) { if (!G.inSim) { L.fora++; return false; } const m = a && a.marcas; if (!m) return false; const i = m.findIndex(q => q[0] === tipo && q[1] === quem); if (i < 0) return false; m.splice(i, 1); if (!m.length) a.marcas = undefined; return true; };
  // (readings, pure: the marks a person keeps about someone; whether a tie is held by one; the floor a live offence keeps the
  // affection under; the freshest offence on the mind, 0..1; whether v resents o)
  L.lembra = (v, quem) => ((v && v.marcas) || []).filter(q => quem === undefined || q[1] === quem);
  L.marked = (v, id) => !!(v && v.marcas && v.marcas.some(q => q[1] === id));
  L.holds = function (v, id) {
    let w = 0; for (const q of (v && v.marcas) || []) if (q[1] === id && MARCA[q[0]] < 0) w += q[3];
    return w ? { af: -Math.min(90, Math.round(w * 0.8)), cf: -Math.min(80, Math.round(w * 0.6)) } : null;
  };
  L.ferido = function (v) { const S = S_(); let w = 0; for (const q of (v && v.marcas) || []) if (MARCA[q[0]] < 0 && S.day - q[2] <= 2) w = Math.max(w, q[3]); return w / 100; };
  L.ferida = (v, o) => !!(v && o && v.marcas && v.marcas.some(q => q[1] === o.id && MARCA[q[0]] < 0 && q[3] >= 20));
  // (the day of the marks: each fades by its weight — the grudge of one who keeps grudges slowly —, and the ones of somebody the
  // world no longer remembers go)
  function fadeMarks(v) {
    const S = S_(); const m = v.marcas; if (!m) return;
    const I = G.Indole; const ranc = I.faceta(v, 'rancoroso'), ama = I.ax(v, 'ama') / 99;
    for (let i = m.length - 1; i >= 0; i--) {
      const q = m[i]; if (!S.villagers.has(q[1]) && !S.dead.has(q[1])) { m.splice(i, 1); continue; }
      const sg = MARCA[q[0]]; if (sg === 0) continue;
      const rate = sg < 0 ? 0.13 - 0.09 * ranc : 0.1 - 0.05 * ama;
      q[3] = Math.max(0, q[3] - Math.max(1, Math.round(q[3] * rate)));
      if (q[3] < 3) m.splice(i, 1);
    }
    if (!m.length) v.marcas = undefined;
  }
  L.fadeMarks = v => fadeMarks(v);

  // ------------------------------ the courtship: the yes of both ------------------------------
  // a courtship's talk has ended: it warms both (the other by how much she or he is drawn — how well the two get on, and the
  // affection already there), and asks the yes of both: 'sim' (the one draw of the world says when), 'nao' (the other is not drawn,
  // after enough asking: the one who asked keeps the refusal, and leaves that one alone a few days), or 'ainda'
  L.CORTE = { A: 30, B: 20, AF: 8 };
  L.corte = function (v, o) {
    if (!G.inSim) { L.fora++; return 'ainda'; }
    const I = G.Indole; const par = I ? I.par(v, o) : 0;
    // (how much the other is drawn: how well the two get on, the affection already there, how outgoing the other is, and the name the
    // one courting has in the town, if the other knows it — G.Fama.recebe)
    const so0 = L.sente(o, v); const fm = G.Fama && G.Fama.recebe ? G.Fama.recebe(o, v) : null;
    const pull = Math.max(0.2, 1 + par * 0.9 + (so0 ? so0.afeto / 80 : 0) + (I ? (I.ax(o, 'ext') - 50) / 200 : 0) + (fm && fm.sabe ? fm.estima / 150 : 0));
    L.ato(v, o, 'corte', { b: { atr: pull } });
    const sv = L.sente(v, o), so = L.sente(o, v); if (!sv || !so) return 'ainda';
    const r = G.R();
    if (sv.atracao >= L.CORTE.A && so.atracao >= L.CORTE.B && sv.afeto >= L.CORTE.AF && so.afeto >= L.CORTE.AF) {
      const rom = (v.traits || []).includes('Romântico') || (o.traits || []).includes('Romântico');
      return r < (rom ? 0.92 : 0.8) ? 'sim' : 'ainda';
    }
    if (sv.atracao >= 24 && so.atracao < 10) { L.ato(v, o, 'recusa', { a: { bit: BIT.recusa } }); return 'nao'; }
    return 'ainda';
  };

  // ------------------------------ the day of a town ------------------------------
  // (one town a step, its turn the world's — G.mod, in the save, L-694 —: the ties cool toward what the kinship gives, the ties to the
  // dead go, and the family arranges a match for whoever found none)
  L.update = function () {
    const S = S_(); if (!S) return;
    if (S.day !== G.mod('soc.day')) { G.mod('soc.day', S.day); G.mod('soc.cur', 0); }
    const cur = G.mod('soc.cur') | 0;
    const sets = [...S.settlements.values()].sort((a, b) => a.id - b.id);
    if (cur >= sets.length) return;
    const set = sets[cur]; G.mod('soc.cur', cur + 1);
    L.dayOf(set);
  };
  // the cooling of a day: each number back a little toward the kinship's (a stranger's affection gone in about fifteen days without a
  // word; a deep one fades slower; trust slower still; a love not answered cools): the dead and the empty ties out
  L.dayOf = function (set) {
    const S = S_();
    for (const v of S.villagers.values()) {
      if (v.set !== set.id) continue;
      if (v.marcas) fadeMarks(v);
      if (!v.lacos || !v.lacos.length) continue;
      const a = v.lacos;
      for (let i = a.length - 1; i >= 0; i--) {
        const t = a[i]; const o = S.villagers.get(t[0]);
        if (!o || t[0] === v.id) { a.splice(i, 1); continue; }
        const hold = L.holds ? L.holds(v, t[0]) : null; // (a live mark holds the hatred, phase 2)
        t[AF] = cool(t[AF], Math.abs(t[AF]) >= 50 ? 0.03 : 0.07, hold ? hold.af : null);
        t[CF] = cool(t[CF], 0.04, hold ? hold.cf : null); t[RS] = cool(t[RS], 0.025, null);
        t[AT] = cool(t[AT], v.partner && v.partner !== o.id ? 0.15 : o.partner && o.partner !== v.id ? 0.1 : 0.05, null);
        if (t[BITS] & BIT.recusa && S.day - t[DIA] > 4) t[BITS] &= ~BIT.recusa;
        if (!t[AF] && !t[CF] && !t[RS] && !t[AT] && !keeps(v, t)) a.splice(i, 1);
      }
      if (!a.length) v.lacos = undefined;
    }
    colleagues(set);
    arrange(set);
    // (the name of each one in the town and its memory, and the life between people — loans, debts, crimes answered: soc-fama.js,
    // soc-vida.js, on the same day of the town)
    if (G.Fama && G.Fama.dayOf) G.Fama.dayOf(set);
    if (G.Convivio && G.Convivio.dayOf) G.Convivio.dayOf(set);
    if (G.Boatos && G.Boatos.dayOf) G.Boatos.dayOf(set); // (what is said: the rumours of the town, soc-boatos.js)
  };
  function cool(x, rate, floor) {
    if (!x) return 0;
    const d = Math.max(1, Math.round(Math.abs(x) * rate)); let y = x > 0 ? Math.max(0, x - d) : Math.min(0, x + d);
    if (floor !== null && floor !== undefined) { if (floor < 0 && x <= floor) y = Math.min(y, floor); else if (floor > 0 && x >= floor) y = Math.max(y, floor); }
    return y;
  }

  // ------------------------------ the day's work together ------------------------------
  // (the ones who hold a post at the same building worked side by side through the day: each with the next two of them, by the order
  // of the ids turned by the day — the same in the leap and in the step, the trade of the day the cause)
  // (and the ones who live next door, each with one of the next houses, by day; and the children of the town who played together — of
  // ages close, two each a day, by the order of the ages turned by the day)
  function neighbours(set) {
    const S = S_(); const res = new Map();
    for (const v of S.villagers.values()) { if (v.set !== set.id || !v.home || v.age < 14 || v.captive || v.jail || v.aboard) continue; let a = res.get(v.home); if (!a) res.set(v.home, a = []); if (a.length < 8) a.push(v); }
    const hs = [...res.keys()].map(id => S.buildings.get(id)).filter(Boolean);
    for (const h of hs) {
      const near = []; for (const o of hs) { if (o === h) continue; const d = G.dist2(h.x, h.y, o.x, o.y); if (d > 64) continue; near.push([d, o.id]); }
      near.sort((p, q) => p[0] - q[0] || p[1] - q[1]); const A = res.get(h.id);
      for (let j = 0; j < Math.min(2, near.length); j++) { const B = res.get(near[j][1]); for (let i = 0; i < A.length; i++) { const o = B[(i + S.day) % B.length]; if (o && o !== A[i]) L.ato(A[i], o, 'vizinho'); } }
    }
    const kids = []; for (const v of S.villagers.values()) if (v.set === set.id && v.age >= 4 && v.age < 16 && !v.captive && !v.aboard) kids.push(v);
    kids.sort((a, b) => a.age - b.age || a.id - b.id); const n = kids.length;
    if (n >= 2) for (let i = 0; i < n; i++) { const j = i + 1 + (S.day % 2); if (j < n && Math.abs(kids[j].age - kids[i].age) <= 4) L.ato(kids[i], kids[j], 'brincar'); }
  }
  // (two who do not get on, side by side all day — the worst pairs of temperaments, G.Indole.par under L.ATRITO —: the friction of the
  // post instead of its fellowship; and two who already dislike each other quarrel now and then, by the hash of the two and the day —
  // the more nervous one says the word, the other keeps it: the offence a score may be settled for, D-580)
  L.ATRITO = { par: 0.15, af: -30, q: 0.2 };
  function work(v, o) {
    if (!G.Indole || G.Indole.par(v, o) >= L.ATRITO.par) { L.ato(v, o, 'trabalho'); return; }
    L.ato(v, o, 'atrito');
    const s = L.sente(v, o), t = L.sente(o, v); if (!s || !t || s.afeto > L.ATRITO.af || t.afeto > L.ATRITO.af) return;
    if (G.hash(v.id * 131 + o.id * 17 + S_().day * 7 + 5) >= L.ATRITO.q) return;
    const [by, to] = G.Indole.ax(v, 'neu') >= G.Indole.ax(o, 'neu') ? [v, o] : [o, v];
    if (L.marca) L.marca(to, 'insultou', by.id, 25);
  }
  function colleagues(set) {
    neighbours(set);
    const S = S_(); const by = new Map();
    for (const v of S.villagers.values()) { if (v.set !== set.id || !v.job || v.age < 16 || v.captive || v.jail || v.aboard) continue; let a = by.get(v.job); if (!a) by.set(v.job, a = []); if (a.length < 12) a.push(v); }
    for (const a of by.values()) {
      const n = a.length; if (n < 2) continue; const k0 = S.day % n;
      for (let i = 0; i < n; i++) { const v = a[(i + k0) % n], o = a[(i + k0 + 1) % n]; if (v !== o) work(v, o); if (n > 3 && i % 2 === 0) { const q = a[(i + k0 + 2) % n]; if (q !== v) work(v, q); } }
    }
  }

  // ------------------------------ the match the family arranges (D-574) ------------------------------
  // (whoever has found no partner by the age of it: the family — the parents, or for one without them the elders of the town — weds
  // them to a single one of the other sex of the same town who does not dislike them, the one who gets on best with them and is
  // nearest in age; never the body the god lives — the day never decides for the god's family —, nor one in a cell, at sea, in
  // mourning. A few a town a day, the eldest first)
  L.ARR = { f: 20, m: 22, max: 2 };
  const free = v => !v.partner && v.mourn <= 0 && !v.captive && !v.jail && !v.aboard && !v.ug && !v.held && !(G.S.avatar && G.S.avatar.id === v.id) && v.age >= 18 && v.age <= 46;
  function arrange(set) {
    const S = S_(); const all = [];
    for (const v of S.villagers.values()) if (v.set === set.id && free(v)) all.push(v);
    if (all.length < 2) return;
    const due = all.filter(v => v.age >= L.ARR[v.g === 'f' ? 'f' : 'm']).sort((a, b) => b.age - a.age || a.id - b.id);
    const done = new Set(); let n = 0;
    for (const w of due) {
      if (n >= L.ARR.max) break; if (done.has(w.id)) continue;
      let best = null, bs = -Infinity;
      for (const o of all) {
        if (o === w || o.g === w.g || done.has(o.id) || Math.abs(o.age - w.age) > 12 || G.Vg.relatedClose(w, o)) continue;
        const sw = L.sente(w, o), so = L.sente(o, w);
        if ((sw && sw.afeto < -20) || (so && so.afeto < -20)) continue;
        // (no family gives a child to one the town holds a thief or a killer — the name in the town, G.Fama)
        if (G.Fama && [w, o].some(p => { const f = G.Fama.de(p, set.id); return f && f.estima <= -30; })) continue;
        const s = 2 * (G.Indole ? G.Indole.par(w, o) : 0) + ((sw ? sw.afeto + sw.atracao : 0) + (so ? so.afeto + so.atracao : 0)) / 60 - Math.abs(o.age - w.age) / 6;
        if (s > bs) { bs = s; best = o; }
      }
      if (!best) continue;
      done.add(w.id); done.add(best.id); n++;
      G.Vg.pair(w, best, 'arranjado');
      S.stats.couples++;
      if (G.Life) { G.Life.bio(w, 'couple', best.id); G.Life.bio(best, 'couple', w.id); }
      const fam = [w, best].some(p => S.villagers.has(p.mother) || S.villagers.has(p.father));
      for (const p of [w, best]) G.Life && G.Life.bio(p, 'note', fam ? 'O casamento foi arranjado pelas famílias.' : 'O casamento foi arranjado pelos mais velhos da cidade.', null);
      if (S.villagers.size < 35) { const [a, b] = w.g === 'f' ? [w, best] : [best, w]; G.Village.log(`${a.name} e ${b.name} casaram-se, num casamento arranjado ${fam ? 'pelas famílias' : 'pelos mais velhos'}.`, 'heart', w.x, w.y); }
    }
  }

  // ------------------------------ the couple made and undone (G.Vg.pairHooks) ------------------------------
  // (the kinship's base changes when two marry or one is widowed: what each one's stored tie holds is what life added to the base it
  // had, and the new base would carry it past the bounds — the attraction of a courtship, 92 on 0, became 137 on the partner's 45:
  // L-1710. The tie is set again on the new base, within its bounds)
  function rebase(v, id) {
    const t = find(v, id); if (!t) return; const o = S_().villagers.get(id); const b = o ? L.base(v, o) : ZERO;
    t[AF] = clampI(t[AF], -100 - b[0], 100 - b[0]); t[CF] = clampI(t[CF], -100 - b[1], 100 - b[1]); t[RS] = clampI(t[RS], -100 - b[2], 100 - b[2]); t[AT] = clampI(t[AT], -b[3], 100 - b[3]);
  }
  L.rebase = (v, id) => rebase(v, id);
  if (G.Vg && G.Vg.pairHooks) G.Vg.pairHooks.push((a, b, como, on) => { if (on) { rebase(a, b.id); rebase(b, a.id); } else { rebase(a, b); const o = S_().villagers.get(b); if (o) rebase(o, a.id); } });

  // ------------------------------ the load: a save from before, a damaged one ------------------------------
  // (the caps, whole numbers within their bounds, nobody tied to themselves, no tie to one who is not alive, no tie equal to the
  // family's base — an empty one —; a save from before the ties: none, the family already there)
  G.saveHooks.push({
    save() { },
    load() {
      const S = S_();
      for (const v of S.villagers.values()) {
        const a = v.lacos; if (a === undefined) continue;
        if (!Array.isArray(a)) { v.lacos = undefined; continue; }
        const seen = new Set(); const out = [];
        for (const t of a) {
          if (!Array.isArray(t) || t.length < 7 || !Number.isInteger(t[0]) || t[0] === v.id || seen.has(t[0]) || !S.villagers.has(t[0])) continue;
          const k = kin(v, S.villagers.get(t[0])); const b = k ? BASE[k] : ZERO;
          const n = [t[0], clampI(+t[1] || 0, -100 - b[0], 100 - b[0]), clampI(+t[2] || 0, -100 - b[1], 100 - b[1]), clampI(+t[3] || 0, -100 - b[2], 100 - b[2]), clampI(+t[4] || 0, -b[3], 100 - b[3]), Number.isInteger(t[5]) ? Math.min(t[5], S.day) : S.day, (t[6] | 0) & 7];
          if (!n[1] && !n[2] && !n[3] && !n[4]) continue;
          seen.add(t[0]); out.push(n);
        }
        const cap = v.age < 16 ? CAP_KID : CAP;
        if (out.length > cap) out.sort((p, q) => strength(q) - strength(p) || p[0] - q[0]).length = cap;
        v.lacos = out.length ? out : undefined;
      }
    },
  });
  // the day of the ties lives with the town's social day (social.js), after it
  if (G.Social && G.Social.update) { const su = G.Social.update; G.Social.update = function (dt) { const r = su.apply(this, arguments); L.update(dt); return r; }; }
})(window.G);
