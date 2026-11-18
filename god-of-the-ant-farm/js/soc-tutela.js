// soc-tutela: who raises a child whose parents are gone (22b D-632, D-633). v.tutor is the one who took the child in: the town's day
// gives an orphan to who loves it most among those with a house and room for one more — the grandmother, an aunt, a grown sibling,
// a neighbour fond of it; a brother or a sister with the one who took the first —, and the body may take one in (soc-verbos.js). The
// world asks one door, G.Tutela.de: the house the child lives in (village.js assignHousing), the family that goes whole (villagers.js
// familyOf, and so canSend), the stories' kin, the body's kin (Possess.kin), what the two feel (G.Lacos.kin) and who may court whom
// (Vg.relatedClose). Only this file writes v.tutor (guard rule 232), inside the world's step; the readings are pure. The day never
// decides for the body: the god's body takes in only by the player's hands.
(function (G) {
  'use strict';
  const T = G.Tutela = {};
  T.MAX = 6; // (the little ones a house takes in: its own under sixteen and the ones it raises)
  T.fora = 0;
  const S_ = () => G.S;
  const alive = id => (id && G.S.villagers.get(id)) || null;
  const oa = v => (v && v.g === 'f' ? 'a' : 'o');
  // ------------------------------ the readings (pure) ------------------------------
  // a child with no living mother nor father
  T.orfao = c => !!(c && c.age < 14 && !c.captive && !alive(c.mother) && !alive(c.father));
  // the one raising the child, alive — or none
  T.de = c => { const t = c && c.tutor ? alive(c.tutor) : null; return t && t !== c ? t : null; };
  // the little ones of a house: one's own under sixteen and the ones one raises
  T.carga = function (t) {
    let n = 0; for (const c of S_().villagers.values()) if (c.age < 16 && (c.mother === t.id || c.father === t.id || c.tutor === t.id || (t.partner && (c.mother === t.partner || c.father === t.partner || c.tutor === t.partner)))) n++;
    return n;
  };
  // (of the blood: a grandparent, an aunt or uncle, a grown brother or sister — by the records, dead parents included)
  const rec = id => (id && (G.S.villagers.get(id) || (G.S.dead && G.S.dead.get(id)))) || null;
  const shares = (a, b) => !!(a && b && ((a.mother && a.mother === b.mother) || (a.father && a.father === b.father)));
  T.parente = function (c, a) {
    if (!c || !a) return false; if (shares(c, a)) return true;
    for (const p of [rec(c.mother), rec(c.father)]) { if (!p) continue; if (p.mother === a.id || p.father === a.id || shares(p, a)) return true; }
    return false;
  };
  // (who may take one in: grown, free, with a house of beds)
  const pode = t => !!(t && t.age >= 20 && t.age < 66 && !t.captive && !t.jail && !t.aboard && t.home && G.Village.bedsOf && G.S.buildings.get(t.home) && G.Village.bedsOf(G.S.buildings.get(t.home)) > 0);
  T.pode = (t, c) => !!(pode(t) && T.orfao(c) && !T.de(c) && t.set === c.set && T.carga(t) < T.MAX);
  // ------------------------------ the door that writes (only in the world's step) ------------------------------
  T.adota = function (t, c, como) {
    if (!G.inSim) { T.fora++; return false; }
    const S = S_(); if (!t || !c || t === c || !S.villagers.has(t.id) || !S.villagers.has(c.id) || !T.orfao(c) || T.de(c) || !pode(t)) return false;
    c.tutor = t.id;
    if (G.Lacos) G.Lacos.ato(t, c, 'tutela');
    if (G.Life) { G.Life.bio(c, 'note', `${como === 'corpo' ? 'Foi adotad' : 'Passou a ser criad'}${oa(c)} por ${t.name}.`); G.Life.bio(t, 'note', `${como === 'corpo' ? 'Adotou' : 'Passou a criar'} ${c.name}.`); }
    return true;
  };
  // ------------------------------ the town's day (from the ties' day, soc-lacos.js) ------------------------------
  // the one raising a child gone: the child is an orphan again; and each orphan of the town to who loves it most and has room
  T.dayOf = function (set) {
    const S = S_(); const body = S.avatar ? S.avatar.id : 0; const L = G.Lacos;
    const kids = [], adults = [];
    for (const v of S.villagers.values()) {
      if (v.set !== set.id) continue;
      if (v.tutor && !alive(v.tutor)) v.tutor = 0;
      if (T.orfao(v) && !T.de(v)) kids.push(v); else if (pode(v) && v.id !== body) adults.push(v);
    }
    if (!kids.length || !adults.length) return;
    kids.sort((a, b) => a.id - b.id);
    // (the little ones each house has now: one pass over the town)
    const load = new Map(); const inc = id => { if (id) load.set(id, (load.get(id) || 0) + 1); };
    for (const c of S.villagers.values()) {
      if (c.set !== set.id || c.age >= 16) continue; const ids = new Set();
      for (const pid of [c.mother, c.father, c.tutor]) { const p = alive(pid); if (!p) continue; ids.add(p.id); if (p.partner) ids.add(p.partner); }
      for (const id of ids) inc(id); // (each little one once in each house that has it)
    }
    for (const c of kids) {
      let best = null, bs = -Infinity;
      for (const a of adults) {
        const n = load.get(a.id) || 0; if (n >= T.MAX) continue;
        const s = L ? L.sente(a, c) : null;
        const sib = kids.some(k => k !== c && k.tutor === a.id && shares(k, c));
        const sc = (s ? s.afeto : 0) + (T.parente(c, a) ? 40 : 0) + (sib ? 50 : 0) + (a.partner ? 10 : 0) + (G.Indole ? G.Indole.ax(a, 'ama') / 10 : 5) - n * 6;
        if (sc > bs || (sc === bs && best && a.id < best.id)) { bs = sc; best = a; }
      }
      if (best && T.adota(best, c, 'cidade')) { inc(best.id); if (best.partner) inc(best.partner); }
    }
  };
  // (a save of before: nobody raises anyone — the town's day gives them; a damaged one: only an id of someone alive)
  G.saveHooks.push({
    save() { },
    load() { for (const v of S_().villagers.values()) if (v.tutor !== undefined && !(Number.isInteger(v.tutor) && v.tutor > 0 && v.tutor !== v.id)) v.tutor = undefined; },
  });
})(window.G);
