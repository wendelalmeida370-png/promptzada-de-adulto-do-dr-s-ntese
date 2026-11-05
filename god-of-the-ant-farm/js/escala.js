'use strict';
// ============================================================
//  Escala: the size of a building (D-106). Each type has a ladder
//  of steps — the village shrine and the great temple, the small
//  tavern and the inn, the 48 m amphitheatre of a capital —, and a
//  town tries them from the biggest it can justify and pay for to
//  the smallest: the first whose lot it finds land for is built
//  (Village.startProject). The building keeps its step (b.esc) and
//  its lot (b.w = b.h = n tiles of 4 m), written by village.js
//  only; the form (G.Forma.of(type, style, n)), the plan (its lot
//  is b.w × 4) and the god's and the body's pictures read that n.
//  A step is offered only where its people knows how to raise it:
//  a form of that size (G.Forma.has(type, style, n)) or a plan of
//  that size (G.Interiors.sizeOk) — the classic step, the size of
//  the type's table (G.BDEF), always.
//  Pure: it reads the world and writes nothing, and draws on no
//  chance: the same town picks the same step.
// ============================================================
(function (G) {
  const Es = G.Escala = {};
  // A step: { id, nome, n (the lot's side, tiles), req: { tier, pop, era } (what its town needs to justify it), k (its bill over
  // the type's: the materials), kw (its work; k when absent), legado (the buildings already standing only: never founded again
  // where a bigger step of its people is to be had), familia (a family's own choice — the rich house —, never the town's) }.
  // The numbers measured by the city (D-117): a town's monument takes years of its stone. With the turn a great work has with the
  // builders, in one life of 30 years of the metrópole the theatre of 6 stood in 13 years and the palace of 6 and the wonder of
  // 10 reached 95% and 90% at the first bills (in another, the wonder stopped at 27%: a town's fate weighs more than its bill):
  // the materials (k) of the biggest steps now a fifth below those, their work (kw) as it was — the hands are not what holds a
  // monument back, the stone is
  const LADDER = Es.LADDER = {};
  const classic = type => { const d = G.BDEF[type]; return d ? d.w : 1; };
  Es.n0 = classic;
  Es.add = function (type, steps) { LADDER[type] = steps.map(s => Object.freeze(Object.assign({ req: {}, k: 1 }, s))); bills.clear(); };
  const C = (id, nome, extra) => Object.assign({ id, nome, n: null, k: 1, classico: true }, extra || {}); // (the classic step: the table's size)
  const deferred = [];
  // (the ladders are set once the types are known: every module adds its types to G.BDEF on loading)
  Es.define = (type, steps) => deferred.push([type, steps]);
  Es.define('maravilha', [C('antiga', 'Maravilha antiga', { legado: true }), { id: 'maravilha', nome: 'Maravilha', n: 10, k: 3.2, kw: 4 }, { id: 'colossal', nome: 'Maravilha colossal', n: 13, k: 5, kw: 6.5, req: { tier: 5, pop: 250 } }]);
  Es.define('teatro', [C('antigo', 'Teatro antigo', { legado: true }), { id: 'teatro', nome: 'Teatro', n: 6, k: 2.5 }, { id: 'grande', nome: 'Grande teatro', n: 8, k: 3.4, kw: 4, req: { pop: 120 } }, { id: 'monumental', nome: 'Teatro monumental', n: 10, k: 4.6, kw: 5.5, req: { tier: 4, pop: 220 } }]);
  Es.define('palacio', [C('antigo', 'Palácio antigo', { legado: true }), { id: 'palacio', nome: 'Palácio', n: 6, k: 2.1, kw: 2.5 }]);
  Es.define('grande_palacio', [C('antigo', 'Grande palácio antigo', { legado: true }), { id: 'grande_palacio', nome: 'Grande palácio', n: 8, k: 1.8, kw: 2.2 }]);
  Es.define('palacio_colossal', [C('antigo', 'Palácio colossal antigo', { legado: true }), { id: 'palacio_colossal', nome: 'Palácio colossal', n: 10, k: 1.8, kw: 2.2 }]);
  Es.define('paco', [C('paco', 'Casa do chefe'), { id: 'paco_grande', nome: 'Paço', n: 3, k: 1.8, req: { tier: 2, pop: 60 } }]);
  Es.define('temple', [C('santuario', 'Santuário'), { id: 'templo', nome: 'Templo', n: 4, k: 2.2, req: { tier: 2, pop: 40 } }, { id: 'grande', nome: 'Grande templo', n: 6, k: 2.8, kw: 3.6, req: { tier: 3, pop: 90 } }, { id: 'monumental', nome: 'Santuário monumental', n: 8, k: 4.2, kw: 5.5, req: { tier: 4, pop: 180 } }]);
  Es.define('monument', [C('monumento', 'Monumento'), { id: 'grande', nome: 'Grande monumento', n: 4, k: 2.5, req: { pop: 120 } }]);
  Es.define('taverna', [C('taberna', 'Taberna'), { id: 'taverna', nome: 'Taverna', n: 3, k: 1.8, req: { pop: 60 } }, { id: 'hospedaria', nome: 'Hospedaria', n: 4, k: 2.6, req: { pop: 120 } }]);
  Es.define('banhos', [C('banhos', 'Banhos'), { id: 'termas', nome: 'Termas', n: 5, k: 2.6, kw: 3, req: { pop: 120 } }, { id: 'grandes', nome: 'Grandes termas', n: 7, k: 3.6, kw: 4.5, req: { tier: 4, pop: 220 } }]);
  Es.define('biblioteca', [C('biblioteca', 'Biblioteca'), { id: 'grande', nome: 'Grande biblioteca', n: 4, k: 2.4, req: { pop: 150 } }]);
  Es.define('mercado', [C('mercado', 'Mercado'), { id: 'coberto', nome: 'Mercado coberto', n: 4, k: 2.4, req: { pop: 150 } }]);
  Es.define('administracao', [C('administracao', 'Administração'), { id: 'paco_municipal', nome: 'Paço municipal', n: 4, k: 2.2, req: { pop: 150 } }]);
  Es.define('house', [C('casa', 'Casa'), { id: 'domus', nome: 'Casa rica', n: 2, k: 2.5, familia: true }]);
  // (asked on the first question, when every module has put its types in the table; a type not there yet waits)
  function ready() {
    for (let k = deferred.length - 1; k >= 0; k--) {
      const [type, steps] = deferred[k]; if (!G.BDEF[type]) continue; deferred.splice(k, 1);
      Es.add(type, steps.map(s => (s.classico ? Object.assign({}, s, { n: classic(type) }) : s)));
    }
  }
  // the steps of a type, small to big (a type with no ladder: its classic step alone)
  Es.steps = type => { if (deferred.length) ready(); return LADDER[type] || [Object.freeze({ id: 'classico', nome: '', n: classic(type), req: {}, k: 1, classico: true })]; };
  Es.classic = type => Es.steps(type).find(s => s.n === classic(type)) || Es.steps(type)[0];
  // can its people raise a step: a form of that size (a type with a form), a plan of that size (a type its plans lay out) —
  // the classic size, always
  Es.can = function (type, style, n) {
    if (n === classic(type)) return true;
    const st = style || 'classico';
    if (G.Forma && G.Forma.has(type, st)) return G.Forma.has(type, st, n);
    const In = G.Interiors; return !!(In && In.sizeOk && In.sizeOk(type, st, n));
  };
  // (what a town is, for its ladders: its people, its rank, its people's era)
  const meets = (s, set, pop, f) => { const r = s.req || {}; return !((r.tier && (set.tier || 0) < r.tier) || (r.pop && pop < r.pop) || (r.era && (!f || (f.era || 0) < r.era))); };
  // the steps a town would raise of a type, from the biggest to the smallest (never empty: the classic step at the least).
  // A step of a family's own (the rich house) only when asked for one (ctx.familia); a step of old (legado) only where its
  // people has no other to be had
  Es.choose = function (set, type, ctx) {
    const steps = Es.steps(type); const fid = G.Village.facOfSet(set.id); const f = G.Fac.get(fid);
    const style = G.Civ.idOfFac(fid) || 'classico'; const pop = G.Village.pop(set.id); const fam = !!(ctx && ctx.familia);
    const ok = steps.filter(s => (fam || !s.familia) && Es.can(type, style, s.n) && (s.classico || meets(s, set, pop, f)));
    const fresh = ok.filter(s => !s.legado); const out = (fresh.length ? fresh : ok).slice().reverse();
    return out.length ? out : [Es.classic(type)];
  };
  // the step of a building: by the record it keeps (b.esc), or — one of before the ladders — by its size
  Es.of = function (b) {
    const steps = Es.steps(b.type);
    return steps.find(s => s.id === b.esc) || steps.find(s => s.n === b.w) || { id: 'antigo', nome: '', n: b.w, req: {}, k: 1 };
  };
  // what a step costs: the type's materials and work, by its multipliers (the classic step: the table's, exactly)
  const bills = new Map();
  Es.bill = function (type, step) {
    const key = type + ':' + step.id + ':' + step.n; let o = bills.get(key); if (o) return o;
    const def = G.BDEF[type] || { cost: {}, work: 0 }; const k = step.k || 1, kw = step.kw || k; const cost = {};
    for (const m in def.cost) cost[m] = k === 1 ? def.cost[m] : Math.ceil(def.cost[m] * k - 1e-9);
    o = Object.freeze({ cost: Object.freeze(cost), work: kw === 1 ? def.work || 0 : Math.ceil((def.work || 0) * kw - 1e-9) });
    bills.set(key, o); return o;
  };
  Es.billOf = b => Es.bill(b.type, Es.of(b));
})(window.G = window.G || {});
