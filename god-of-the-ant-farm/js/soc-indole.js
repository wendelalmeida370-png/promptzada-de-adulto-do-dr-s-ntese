// soc-indole: who a person is — the temperament and the values (SOCIEDADE.md §3.2, D-542; 22b D-570): six axes (ext, ama, con, neu,
// abe, hon) and three values (amb, fe, lea), whole numbers 0–99, kept as v.indole = [ext, ama, con, neu, abe, hon, amb, fe, lea]. Each
// one is born from the hash of the id (two hashes averaged: most people near the middle), half from the parents' (the heritability
// of a temperament is about a half), and anchored in the traits of today, so the person stays the same one — never from the world's
// chance, never from the look nor the people. Only this file writes v.indole (guard rule 204): at birth, through the door every
// newcomer passes (G.Vg.born), and at a load, for a save from before (the same account without the parents: the same person has the
// same temperament at every load). The readings are pure (rule 208): they never write, never draw a chance.
(function (G) {
  'use strict';
  const I = G.Indole = {};
  I.EIXOS = Object.freeze(['ext', 'ama', 'con', 'neu', 'abe', 'hon', 'amb', 'fe', 'lea']);
  const K = {}; I.EIXOS.forEach((k, i) => { K[k] = i; });
  I.IDX = Object.freeze(K);
  const clamp = x => (x < 0 ? 0 : x > 99 ? 99 : Math.round(x));
  // the anchor of today's traits on the axes: a Sociável is outgoing, a Medroso nervous, a Devoto devout…
  const ANCHOR = {
    'Sociável': { ext: 22, ama: 6 }, 'Romântico': { ext: 8, ama: 12 }, 'Trabalhador': { con: 22 }, 'Preguiçoso': { con: -22 },
    'Curioso': { abe: 22 }, 'Medroso': { neu: 22, ext: -6 }, 'Corajoso': { neu: -16, ext: 6 }, 'Devoto': { fe: 26, abe: -6 },
    'Cético': { fe: -26, abe: 8 }, 'Glutão': { con: -8 }, 'Resistente': { neu: -8, con: 6 },
  };
  // (one axis of one person, from the id alone: two hashes averaged, 0..1)
  const own = (id, i) => (G.hash(id * 7919 + (i + 1) * 104729 + 31) + G.hash(id * 104723 + (i + 1) * 7907 + 977)) / 2;
  // the temperament a person is born with: the hash of the id, half the parents', the traits' anchor
  function make(v, mae, pai) {
    const ps = [mae, pai].map(p => (p && Array.isArray(p.indole) && p.indole.length === 9 ? p.indole : null)).filter(Boolean);
    const out = new Array(9);
    for (let i = 0; i < 9; i++) {
      const h = own(v.id, i) * 99;
      let x = ps.length ? 0.45 * (ps.reduce((a, p) => a + p[i], 0) / ps.length) + 0.55 * h : h;
      out[i] = x;
    }
    for (const t of v.traits || []) { const a = ANCHOR[t]; if (a) for (const k in a) out[K[k]] += a[k]; }
    return out.map(clamp);
  }
  I.make = (v, mae, pai) => make(v, mae, pai); // (pure: what nasce writes, for the proofs to compare)
  // at birth — and whoever comes into the world: the door G.Vg.born gives every newcomer here, in the order registered; one who
  // brings a temperament (back from the dead, come from elsewhere) keeps it
  I.nasce = function (v, mae, pai) { if (ok(v.indole)) return; v.indole = make(v, mae, pai); };
  const ok = a => Array.isArray(a) && a.length === 9 && a.every(x => Number.isInteger(x) && x >= 0 && x <= 99);
  I.ok = ok;
  if (G.Vg && G.Vg.born) G.Vg.born.push((v, m, f) => I.nasce(v, m || null, f || null));
  // a save from before the temperament, or a damaged one: the account without the parents (the same at every load), in the order of
  // birth; and a broken one mended the same way
  G.saveHooks.push({
    save() { },
    load() { const S = G.S; for (const v of S.villagers.values()) if (!ok(v.indole)) v.indole = make(v, null, null); },
  });

  // ------------------------------ the readings (pure) ------------------------------
  // one axis, 0..99 (50 for one with no temperament: a body of the god's making, a test's stand-in)
  I.ax = (v, k) => { const a = v && v.indole; return a && a.length === 9 ? a[typeof k === 'number' ? k : K[k]] : 50; };
  I.de = v => { const a = v && v.indole; if (!a || a.length !== 9) return null; const o = {}; for (let i = 0; i < 9; i++) o[I.EIXOS[i]] = a[i]; return o; };
  // the facets the owner named, read from the axes: 0..1
  const F = {
    agressivo: v => (0.55 * (99 - I.ax(v, 'ama')) + 0.3 * I.ax(v, 'neu') + 0.15 * (99 - I.ax(v, 'con'))) / 99,
    empatico: v => (0.7 * I.ax(v, 'ama') + 0.3 * (99 - I.ax(v, 'neu'))) / 99,
    generoso: v => (0.55 * I.ax(v, 'ama') + 0.45 * I.ax(v, 'hon')) / 99,
    impulsivo: v => (0.5 * I.ax(v, 'neu') + 0.5 * (99 - I.ax(v, 'con'))) / 99,
    desconfiado: v => (0.4 * (99 - I.ax(v, 'ama')) + 0.3 * I.ax(v, 'neu') + 0.3 * (99 - I.ax(v, 'abe'))) / 99,
    ambicioso: v => I.ax(v, 'amb') / 99,
    extrovertido: v => I.ax(v, 'ext') / 99,
    confiante: v => (0.6 * (99 - I.ax(v, 'neu')) + 0.4 * I.ax(v, 'ext')) / 99,
    honesto: v => I.ax(v, 'hon') / 99,
    leal: v => I.ax(v, 'lea') / 99,
    devoto: v => I.ax(v, 'fe') / 99,
    rancoroso: v => (0.5 * I.ax(v, 'neu') + 0.5 * (99 - I.ax(v, 'ama'))) / 99,
  };
  I.FACETAS = Object.freeze(Object.keys(F));
  I.faceta = (v, nome) => { const f = F[nome]; return f ? Math.max(0, Math.min(1, f(v))) : 0.5; };
  // the mood beneath, −1..1: the needs, the grief, the fear, the drink, the wounds, weighed by how nervous the person is — read, never kept
  I.humor = function (v) {
    if (!v) return 0;
    const n = I.ax(v, 'neu') / 99; const S = G.S;
    let m = 0.15 + (I.ax(v, 'ext') - 50) / 400;
    if (v.hunger > 60) m -= (v.hunger - 60) / 80;
    if (v.energy < 30) m -= (30 - v.energy) / 90;
    if (v.sick > 0) m -= 0.35;
    if (v.hp < 60) m -= (60 - v.hp) / 150;
    if (v.mourn > 0) m -= 0.55;
    if (v.fear > 30) m -= (v.fear - 30) / 140;
    if (S && v.drunk > S.clock) m += 0.25;
    if (v.rua) m -= 0.2;
    if (v.jail) m -= 0.4;
    if (G.Lacos && G.Lacos.ferido) m -= G.Lacos.ferido(v) * 0.4; // (a fresh offence on the mind, phase 2)
    m *= 0.6 + n * 0.8;
    return Math.max(-1, Math.min(1, m));
  };
  // how well two get on, −1..1: alike in their values and in their openness, both kind, both outgoing
  I.par = function (a, b) {
    if (!a || !b || !a.indole || !b.indole) return 0;
    const x = a.indole, y = b.indole;
    const near = i => 1 - Math.abs(x[i] - y[i]) / 50; // (1 alike, −1 far apart)
    let s = 0.22 * near(K.fe) + 0.16 * near(K.amb) + 0.14 * near(K.abe) + 0.12 * near(K.con) + 0.1 * near(K.lea);
    s += 0.16 * ((x[K.ama] + y[K.ama]) / 99 - 1) + 0.1 * ((x[K.ext] + y[K.ext]) / 99 - 1);
    return Math.max(-1, Math.min(1, s));
  };
  // the temperament in words (the card of a person, for whoever can know it)
  I.palavras = function (v) {
    const a = v && v.indole; if (!a) return [];
    const f = v.g === 'f'; const w = [];
    if (a[K.ext] >= 70) w.push('expansiv' + (f ? 'a' : 'o')); else if (a[K.ext] <= 28) w.push('reservad' + (f ? 'a' : 'o'));
    if (a[K.ama] >= 70) w.push('bondos' + (f ? 'a' : 'o')); else if (a[K.ama] <= 28) w.push('ásper' + (f ? 'a' : 'o'));
    if (a[K.con] >= 72) w.push('cuidados' + (f ? 'a' : 'o')); else if (a[K.con] <= 26) w.push('descuidad' + (f ? 'a' : 'o'));
    if (a[K.neu] >= 72) w.push('nervos' + (f ? 'a' : 'o')); else if (a[K.neu] <= 26) w.push('calm' + (f ? 'a' : 'o'));
    if (a[K.abe] >= 72) w.push('curios' + (f ? 'a' : 'o'));
    if (a[K.hon] >= 74) w.push('honest' + (f ? 'a' : 'o')); else if (a[K.hon] <= 24) w.push('ardilos' + (f ? 'a' : 'o'));
    if (a[K.amb] >= 75) w.push('ambicios' + (f ? 'a' : 'o'));
    return w.slice(0, 3);
  };

  // ------------------------------ the weight of who one is on the free time (G.Vg.weigh, D-566) ------------------------------
  // (each a multiplier near 1 for one in the middle of every axis: the outgoing go out and talk, the quiet stay in and rest, the
  // curious walk and read, the devout pray, the careful work a little longer; the courtship asks the outgoing a little more)
  const W = (kind, fn) => G.Vg && G.Vg.weigh && G.Vg.weigh(kind, fn);
  const ax = (v, k) => I.ax(v, k) / 99;
  W('social', v => 0.55 + ax(v, 'ext') * 0.9);
  W('tavern', v => 0.7 + ax(v, 'ext') * 0.45 + (1 - ax(v, 'con')) * 0.15);
  W('praca', v => 0.7 + ax(v, 'ext') * 0.6);
  W('rest', v => 1.3 - ax(v, 'ext') * 0.6);
  W('pray', v => 0.55 + ax(v, 'fe') * 0.9);
  W('explore', v => 0.6 + ax(v, 'abe') * 0.8);
  W('ler', v => 0.65 + ax(v, 'abe') * 0.7);
  W('court', v => 0.8 + ax(v, 'ext') * 0.4);
  W('work', v => 0.88 + ax(v, 'con') * 0.24);
})(window.G);
