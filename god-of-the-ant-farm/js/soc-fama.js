// soc-fama: the name a person has in each community and the memory of a town (SOCIEDADE.md §3.5, D-545; 22b D-584, D-585). The fame
// of a person is kept by community — v.fama = [[set, renome, estima, rotulos], …], up to four: in this wave the home town —: renown
// 0..100 (how many there know who the person is), esteem −100..100 (what they think), and the labels in bits (hero, saviour,
// generous, healer, brave; murderer, thief, traitor, coward, cruel, aggressor). It comes from the person's place (who rules, the
// hero of the wars, the healer, the priest) and from what the town saw the person do (G.Fama.feito, by the society's doors: the help,
// the theft that was punished, the blow, the murder), and fades as days pass without anything new. The memory of a town —
// set.memoria = [[tipo, sujeito, dia, peso, extra], …], up to twelve — is what the whole town remembers: the murder, the execution,
// the death of the one who ruled, the hero, the day of many dead; a heavy one does not fade. Only this file writes v.fama and
// set.memoria (guard rule 206), and only inside the world's step; the readings are pure (rule 208).
(function (G) {
  'use strict';
  const F = G.Fama = {};
  const S_ = () => G.S;
  const clampI = (x, lo, hi) => (x < lo ? lo : x > hi ? hi : Math.round(x));
  const ROT = F.ROT = Object.freeze({ heroi: 1, salvador: 2, generoso: 4, curandeiro: 8, valente: 16, assassino: 32, ladrao: 64, traidor: 128, covarde: 256, cruel: 512, governante: 1024, agressor: 2048 });
  const ROTS = Object.keys(ROT);
  // the memory of a town: its kinds, and how much each weighs when it happens
  const TIPOS = F.TIPOS = Object.freeze({ assassinato: 60, execucao: 40, governante: 55, heroi: 50, mortandade: 55, salvamento: 35, agressao: 25 });
  F.fora = 0;
  // (the town's own: a town no longer in the world is remembered only by the memory of the quarters, S.urbPast)
  F.lembrada = id => !!(G.S && G.S.urbPast && (Array.isArray(G.S.urbPast) ? G.S.urbPast.some(p => p && (p.id === id || p.set === id)) : G.S.urbPast[id]));

  // ------------------------------ the readings (pure) ------------------------------
  const row = (v, sid) => { const a = v && v.fama; if (!a) return null; for (const c of a) if (c[0] === sid) return c; return null; };
  F.de = function (v, sid) {
    if (!v) return null; const c = row(v, sid === undefined ? v.set : sid); if (!c) return null;
    const rot = []; for (const k of ROTS) if (c[3] & ROT[k]) rot.push(k);
    return { renome: c[1], estima: c[2], rotulos: rot };
  };
  // the people of renown near a point: [{ id, renome, estima }], the most renowned first
  F.notavel = function (x, y, r) {
    const S = S_(); if (!S) return []; const out = []; const r2 = r * r;
    for (const v of S.villagers.values()) { if (!v.fama || G.dist2(v.x, v.y, x, y) > r2) continue; const c = row(v, v.set); if (c && c[1] >= 30) out.push({ id: v.id, renome: c[1], estima: c[2] }); }
    return out.sort((a, b) => b.renome - a.renome || a.id - b.id).slice(0, 12);
  };
  // how o receives v: does o know of v's name (one of the town, sampled by the hash — the many know by part, never by a list), and
  // what o thinks of it, weighed by o's distrust (the wary weigh the bad)
  F.recebe = function (o, v) {
    const c = v && row(v, o ? o.set : 0); if (!o || !c) return { sabe: false, estima: 0 };
    const I = G.Indole; const ext = I ? I.ax(o, 'ext') / 99 : 0.5;
    const sabe = G.hash(o.id * 7741 + v.id * 31 + 5) < (c[1] / 100) * (0.5 + 0.5 * ext);
    if (!sabe) return { sabe: false, estima: 0 };
    const wary = I ? I.faceta(o, 'desconfiado') : 0.5;
    return { sabe: true, estima: Math.round(c[2] < 0 ? c[2] * (0.7 + 0.6 * wary) : c[2] * (1.2 - 0.5 * wary)) };
  };
  F.memoria = set => ((set && set.memoria) || []).slice();
  F.temida = (set, days) => !!(set && set.memoria && set.memoria.some(m => m[0] === 'assassinato' && G.S.day - m[2] <= (days || 3) && !m[5]));

  // ------------------------------ the doors that write (only in the world's step) ------------------------------
  // what the town saw the person do: the esteem moves by it, the renown grows, a label sticks
  const FEITO = {
    ajudou: { re: 4, es: 6, rot: 'generoso' }, salvou: { re: 14, es: 18, rot: 'salvador' }, curou: { re: 3, es: 4, rot: 'curandeiro' },
    furtou: { re: 8, es: -18, rot: 'ladrao' }, agrediu: { re: 10, es: -22, rot: 'agressor' }, matou: { re: 25, es: -55, rot: 'assassino' },
    heroi: { re: 20, es: 20, rot: 'heroi' }, valente: { re: 8, es: 8, rot: 'valente' }, traiu: { re: 10, es: -25, rot: 'traidor' },
    cruel: { re: 8, es: -15, rot: 'cruel' }, pagou: { re: 1, es: 3 }, caloteiro: { re: 3, es: -8 },
    // (22b phase 3: the name that a rumour carries to another town; the one who spread a lie that was denied)
    nome: { re: 15, es: 0 }, mentiu: { re: 3, es: -10 },
  };
  F.FEITOS = () => Object.keys(FEITO);
  F.feito = function (v, tipo, sid) {
    if (!G.inSim) { F.fora++; return false; }
    const d = FEITO[tipo]; const S = S_(); if (!d || !v || !S.villagers.has(v.id)) return false;
    const at = sid === undefined ? v.set : sid; if (!S.settlements.has(at)) return false;
    const c = take(v, at); if (!c) return false;
    c[1] = clampI(c[1] + d.re, 0, 100); c[2] = clampI(c[2] + d.es, -100, 100); if (d.rot) c[3] |= ROT[d.rot];
    return true;
  };
  function take(v, sid) {
    const a = v.fama || (v.fama = []); let c = row(v, sid); if (c) return c;
    if (a.length >= 4) { let li = -1, lr = Infinity; for (let i = 0; i < a.length; i++) if (a[i][0] !== v.set && a[i][1] < lr) { lr = a[i][1]; li = i; } if (li < 0) return null; a.splice(li, 1); }
    c = [sid, 0, 0, 0]; a.push(c); return c;
  }
  // what a rumour said of someone and was denied (the culprit swapped, soc-boatos.js): the esteem back, the label off
  F.desfeito = function (v, tipo, sid) {
    if (!G.inSim) { F.fora++; return false; }
    const d = FEITO[tipo]; const c = d && v && row(v, sid); if (!c) return false;
    c[2] = clampI(c[2] - d.es, -100, 100); if (d.rot) c[3] &= ~ROT[d.rot];
    return true;
  };
  // the memory of a people (f.memoria = [[tipo, sujeito, dia, peso, extra, palavras], …], up to eight: what went through most of its
  // towns — the murder, the execution, the ruler gone, the conquest, the rising, the coup, the battle —, in the words its capital
  // told; a heavy one stays, a light one fades on the capital's day (22b D-626)
  const TIPOS_POVO = F.TIPOS_POVO = Object.freeze({ assassinato: 60, execucao: 55, governante: 60, golpe: 75, levante: 70, conquista: 85, batalha: 55 });
  F.lembraPovo = function (f, tipo, sujeito, extra, peso, txt) {
    if (!G.inSim) { F.fora++; return false; }
    if (!f || !TIPOS_POVO[tipo]) return false;
    const S = S_(); const w = clampI(peso || TIPOS_POVO[tipo], 1, 100); const m = f.memoria || (f.memoria = []);
    // (the same thing again — the executions of one ruler, the same subject — is one memory, heavier and newer)
    const same = m.find(q => q[0] === tipo && (q[1] === (sujeito || 0) || (tipo === 'execucao' && extra && q[4] === extra)));
    if (same) { same[2] = S.day; same[3] = Math.min(100, same[3] + 5); if (txt) same[5] = String(txt).slice(0, 200); return true; }
    if (m.length >= 8) { let li = -1, lw = Infinity; for (let i = 0; i < m.length; i++) if (m[i][3] < lw) { lw = m[i][3]; li = i; } if (lw >= w) return false; m.splice(li, 1); }
    m.push([tipo, sujeito || 0, S.day, w, extra || 0, String(txt || '').slice(0, 200)]);
    return true;
  };
  F.memoriaPovo = f => ((f && f.memoria) || []).slice();
  // what the towns of a people think of someone: the mean of the esteem in each (a town without a row, nothing) — the ruler's,
  // read by the estates (polity.js)
  F.estimaPovo = function (v, fid) {
    if (!v || !v.fama) return 0; let n = 0, s = 0;
    for (const set of G.S.settlements.values()) { if (set.fac !== fid) continue; n++; const c = row(v, set.id); if (c) s += c[2]; }
    return n ? s / n : 0;
  };
  // a memory of the whole town (the murder, the execution, the ruler gone, the hero, the day of many dead…)
  F.lembra = function (set, tipo, sujeito, extra, peso) {
    if (!G.inSim) { F.fora++; return false; }
    if (!set || !TIPOS[tipo]) return false;
    const S = S_(); const w = clampI(peso || TIPOS[tipo], 1, 100); const m = set.memoria || (set.memoria = []);
    const old = m.find(q => q[0] === tipo && q[1] === (sujeito || 0) && S.day - q[2] <= 1); if (old) { old[3] = Math.max(old[3], w); return true; }
    if (m.length >= 12) { let li = -1, lw = Infinity; for (let i = 0; i < m.length; i++) if (m[i][3] < lw) { lw = m[i][3]; li = i; } if (lw >= w) return false; m.splice(li, 1); }
    m.push([tipo, sujeito || 0, S.day, w, extra || 0, 0]);
    return true;
  };
  // (the murder answered: the killer taken — the town breathes again)
  F.respondida = function (set, sujeito) { if (!G.inSim) { F.fora++; return; } for (const q of (set && set.memoria) || []) if (q[0] === 'assassinato' && q[1] === sujeito) q[5] = 1; };

  // ------------------------------ the day of a town (from the ties' day, soc-lacos.js) ------------------------------
  // the renown the place gives (who rules, who ruled, the hero, the one with a name, the healer, the priest), the esteem back a little
  // toward nothing, the renown toward the place's, the fame of the dead out; the town's lighter memories fade
  F.dayOf = function (set) {
    const S = S_(); const f = G.Fac && G.Fac.get(set.fac);
    for (const v of S.villagers.values()) {
      if (v.set !== set.id) continue;
      const base = place(v, f);
      if (base > 0 && !row(v, set.id)) { const c = take(v, set.id); if (c) { c[1] = base; if (f && f.leader === v.id) c[3] |= ROT.governante; if (v.hero) c[3] |= ROT.heroi; if (v.role === 'curandeiro') c[3] |= ROT.curandeiro; } }
      const a = v.fama; if (!a) continue;
      for (let i = a.length - 1; i >= 0; i--) {
        const c = a[i]; if (!S.settlements.has(c[0])) { a.splice(i, 1); continue; }
        const b = c[0] === set.id ? base : 0;
        if (c[1] > b) c[1] = Math.max(b, c[1] - Math.max(1, Math.round((c[1] - b) * 0.06))); else if (c[1] < b) c[1] = b;
        if (c[2]) c[2] = c[2] > 0 ? Math.max(0, c[2] - Math.max(1, Math.round(c[2] * 0.04))) : Math.min(0, c[2] + Math.max(1, Math.round(-c[2] * 0.03)));
        if (f && f.leader === v.id) c[3] |= ROT.governante; if (v.hero) c[3] |= ROT.heroi;
        if (!c[1] && !c[2]) a.splice(i, 1);
      }
      if (!a.length) v.fama = undefined;
    }
    const m = set.memoria; if (m) { for (let i = m.length - 1; i >= 0; i--) { const q = m[i]; if (q[3] < 60) { q[3] -= 2; if (q[3] < 5) m.splice(i, 1); } } if (!m.length) set.memoria = undefined; }
    // (the people's memory fades on its capital's day: the light ones by a little)
    const pm = f && f.capital === set.id && f.memoria;
    if (pm) { for (let i = pm.length - 1; i >= 0; i--) { const q = pm[i]; if (q[3] < 60) { q[3] -= 1; if (q[3] < 5) pm.splice(i, 1); } } if (!pm.length) f.memoria = undefined; }
  };
  function place(v, f) {
    let b = 0;
    if (f && f.leader === v.id) b = 75; else if (v.reigned) b = 45;
    if (v.hero) b = Math.max(b, 50); if (v.ep) b = Math.max(b, 45); if ((v.kills || 0) >= 3) b = Math.max(b, 25);
    if (v.role === 'sacerdote' || v.role === 'curandeiro') b = Math.max(b, 22);
    return b;
  }

  // ------------------------------ what the name and the memory change ------------------------------
  // (a murder not yet answered keeps the nervous at home in the evening — fewer at the tavern and at the plaza for a few days)
  if (G.Vg && G.Vg.weigh) for (const k of ['tavern', 'praca']) G.Vg.weigh(k, v => { const set = G.S.settlements.get(v.set); return F.temida(set, 3) ? 1 - 0.5 * (G.Indole ? G.Indole.ax(v, 'neu') / 99 : 0.5) : 1; });

  // ------------------------------ the load ------------------------------
  // (a save from before: no fame — it comes from the place in a day; a damaged one: whole numbers within their bounds, the caps, no
  // community that is gone; the town's memory the same)
  G.saveHooks.push({
    save() { },
    load() {
      const S = S_();
      for (const v of S.villagers.values()) {
        if (v.fama === undefined) continue;
        if (!Array.isArray(v.fama)) { v.fama = undefined; continue; }
        const out = []; for (const c of v.fama) if (Array.isArray(c) && c.length >= 4 && S.settlements.has(c[0]) && !out.some(q => q[0] === c[0])) out.push([c[0], clampI(+c[1] || 0, 0, 100), clampI(+c[2] || 0, -100, 100), (c[3] | 0) & 4095]);
        v.fama = out.length ? out.slice(0, 4) : undefined;
      }
      for (const f of S.factions.values()) {
        if (f.memoria === undefined) continue;
        if (!Array.isArray(f.memoria)) { f.memoria = undefined; continue; }
        const out = f.memoria.filter(q => Array.isArray(q) && TIPOS_POVO[q[0]] && Number.isInteger(q[2])).map(q => [q[0], q[1] | 0, Math.min(q[2], S.day), clampI(+q[3] || 1, 1, 100), q[4] | 0, String(q[5] || '').slice(0, 200)]).slice(-8);
        f.memoria = out.length ? out : undefined;
      }
      for (const set of S.settlements.values()) {
        if (set.memoria === undefined) continue;
        if (!Array.isArray(set.memoria)) { set.memoria = undefined; continue; }
        const out = set.memoria.filter(q => Array.isArray(q) && TIPOS[q[0]] && Number.isInteger(q[2])).map(q => [q[0], q[1] | 0, Math.min(q[2], S.day), clampI(+q[3] || 1, 1, 100), q[4] | 0, q[5] ? 1 : 0]).slice(-12);
        set.memoria = out.length ? out : undefined;
      }
    },
  });
})(window.G);
