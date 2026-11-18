// soc-boatos: what is said — the rumours and the memory of the many (SOCIEDADE.md; the study §4.6; 22b D-620 to D-626). The truth
// stays in the world — the fact of the stories (S.saga.facts), the crime (S.crimes), the chronicle of the god —: a rumour is what
// the towns say of it. S.boatos.list, up to B.MAX (the coldest out), keeps the truth's names as they were and, by town, a row:
// how many there know (a part 0..1000), how true it still is (a fidelity 0..100), the version told there (bits: exaggerated, a
// motive invented, the culprit another — and denied), the culprit of that version, the day it came, who brought it.
// Who matters knows by name (v.sabe, up to six: the witness, the family, the carrier, who heard it from the body); the many know
// by part — G.Boatos.sabe(v, r): the person's hash under the part of their town, as the luck of the day is (not a byte a person).
// It runs on the town's day (from the ties' day: a contagion by the life of the quarters — the tavern, the market) and between
// towns only by who carries it there: anyone in another town's streets (the merchant, the soldier, the envoy, the migrant), the
// crew at a foreign quay (naval.js). Each passage loses a little of the truth; under thresholds the version changes by rules with
// a cause, by the hash of the rumour and the town — never by the look nor the people of anyone (rule 194): the exaggeration, the
// motive, and the culprit — only one the town already suspects for what they did or a known enemy of the victim. A witness
// living in the town denies the swapped culprit, and the judgment brings the version back to the truth. Only this file writes
// S.boatos and v.sabe (guard rule 228); the readings are pure (229); no chance of the world here (231).
(function (G) {
  'use strict';
  const B = G.Boatos = {};
  B.MAX = 120; B.SABE = 6; B.SWEEP = 10; B.SEED = 15; B.AGE = 90;
  B.fora = 0; // (asked to write outside the world's step: nothing done, counted)
  const P = 1, FID = 2, VER = 3, CUL = 4, DIA = 5, TEL = 6; // a town's row: [sid, part, fidelity, version, culprit, day, teller]
  const EXA = 1, MOT = 2, TROCA = 4, DESM = 8, FAMA = 16; // (the motive's number in the bits above: (ver >> 5) & 7)
  B.VER = Object.freeze({ EXA, MOT, TROCA, DESM, FAMA });
  // the kinds: how much it matters (sal), how fast it runs in a town (r), how many days it holds before it fades, the fame it gives
  // the culprit of the version, the memory of the people it may become; who (a culprit to swap), mot (a motive), exa (to exaggerate)
  const KD = B.KINDS = Object.freeze({
    homicidio: { sal: 85, r: 1.1, hold: 8, fama: 'matou', pp: 'assassinato', who: 1, mot: 1, exa: 1 },
    agressao: { sal: 50, r: 0.8, hold: 4, fama: 'agrediu', who: 1, mot: 1, exa: 1 },
    furto: { sal: 35, r: 0.6, hold: 3, fama: 'furtou', who: 1, mot: 1, exa: 1 },
    execucao: { sal: 65, r: 1.0, hold: 6, pp: 'execucao', mot: 1, exa: 1 },
    morte: { sal: 60, r: 0.9, hold: 5, pp: 'governante', exa: 1 },
    golpe: { sal: 80, r: 1.2, hold: 8, pp: 'golpe', exa: 1 },
    levante: { sal: 75, r: 1.2, hold: 7, pp: 'levante', exa: 1 },
    motim: { sal: 55, r: 1.0, hold: 4, exa: 1 },
    coroa: { sal: 55, r: 1.0, hold: 5, mot: 1 },
    conquista: { sal: 85, r: 1.3, hold: 8, pp: 'conquista', exa: 1 },
    batalha: { sal: 60, r: 1.0, hold: 5, pp: 'batalha', exa: 1 },
    cerco: { sal: 55, r: 1.1, hold: 4, exa: 1 },
    fera: { sal: 45, r: 0.8, hold: 4, exa: 1 },
    fofoca: { sal: 25, r: 0.25, hold: 3 },
    traicao: { sal: 55, r: 1.0, hold: 5, fama: 'traiu', exa: 1 }, // (the kiss with another that someone saw: soc-verbos.js, D-634)
  });
  const HOW = B.HOW = Object.freeze({ viu: 3, soube: 2, ouviu: 1, boato: 0 });
  const S_ = () => G.S;
  const clampI = (x, lo, hi) => (x < lo ? lo : x > hi ? hi : Math.round(x));
  const person = id => (id && G.S.villagers.get(id)) || null;
  const EMPTY = Object.freeze([]);
  const list = () => (G.S && G.S.boatos && G.S.boatos.list) || EMPTY;
  const st = () => { const S = S_(); if (!S.boatos) S.boatos = { v: 1, n: 1, tot: 0, d0: S.day, list: [] }; return S.boatos; };
  const rowOf = (r, sid) => { for (const w of r.at) if (w[0] === sid) return w; return null; };
  B.byId = id => { for (const r of list()) if (r.id === id) return r; return null; };
  B.row = (r, sid) => (r ? rowOf(r, sid) : null);
  B.list = () => list().slice();

  // ------------------------------ the readings (pure) ------------------------------
  // does v know of r: 'viu', 'soube', 'ouviu' by name; 'boato' by the part of the town v lives in; false
  B.sabe = function (v, r) {
    if (!v || !r) return false;
    if (v.sabe) for (const e of v.sabe) if (e[0] === r.id) return e[1];
    if (v.age < 8 || !v.set) return false;
    const w = rowOf(r, v.set); if (!w || w[P] <= 0) return false;
    const ext = G.Indole ? G.Indole.ax(v, 'ext') / 99 : 0.5;
    return G.hash(v.id * 2654 + r.id * 97 + 13) < w[P] / 1000 * (0.5 + 0.5 * ext) ? 'boato' : false;
  };
  // the town whose version v knows: by name, the one they heard it in (0, the truth: they saw it); by part, their own
  B.deQuem = function (v, r) { if (v && v.sabe) for (const e of v.sabe) if (e[0] === r.id) return e[1] === 'viu' ? 0 : e[3] || 0; return v ? v.set : 0; };
  // what is said in a town: the kind, the culprit of the version, the bits (exaggerated, the motive, swapped, denied)
  B.versao = function (r, sid) {
    const w = sid ? rowOf(r, sid) : null; const ver = w ? w[VER] : 0;
    return { k: r.k, a: r.a, b: r.b, culpado: ver & TROCA ? w[CUL] : r.q, exagero: !!(ver & EXA), motivo: ver & MOT ? (ver >> 5) & 7 : -1, trocado: !!(ver & TROCA), desmentido: !!(ver & DESM), parte: w ? w[P] / 1000 : 0, fid: w ? w[FID] : 100 };
  };
  const nm = id => { const v = person(id); if (v) return v.name; const d = id && G.S.dead && G.S.dead.get(id); return d ? d.name : 'alguém'; };
  const oa = g => (g === 'f' ? 'a' : 'o');
  const MOTIVO = ['por ciúmes', 'por dinheiro', 'por uma dívida antiga', 'por vingança', 'a mando de alguém importante', 'por um amor'];
  const MOT_EXE = ['por ter falado contra quem governa', 'para dar exemplo', 'sem julgamento nenhum', 'por capricho de quem manda', 'por um crime que não cometeu', 'para calar uma família'];
  const MOT_COROA = ['comprando quem devia', 'por cima de quem tinha direito', 'com a bênção dos sacerdotes', 'com a espada na mão', 'prometendo o que não vai cumprir', 'pela mão de uma família rica'];
  // the words of a rumour as a town tells it (without «dizem que»)
  B.texto = function (r, sid) {
    const x = B.versao(r, sid); const n = r.n || {}; const c = x.culpado; const ex = x.exagero; const m = x.motivo;
    const mot = (tab) => (m >= 0 ? ' ' + tab[m % tab.length] : '');
    switch (r.k) {
      case 'homicidio': return `${c ? nm(c) + ' matou ' : 'mataram '}${n.a}${ex ? ' a sangue-frio' : ''}${mot(MOTIVO)}`;
      case 'agressao': return ex ? `${c ? nm(c) + ' matou ' : 'mataram '}${n.a} de pancada${mot(MOTIVO)}` : `${c ? nm(c) + ' bateu em ' : 'bateram em '}${n.a}${mot(MOTIVO)}`;
      case 'furto': return ex ? `${c ? nm(c) + ' levou' : 'levaram'} tudo o que havia na casa de ${n.a}${mot(MOTIVO)}` : `${c ? nm(c) + ' roubou' : 'roubaram'} a casa de ${n.a}${mot(MOTIVO)}`;
      case 'execucao': return ex ? `executaram ${n.a} e mais gente em ${n.s}${mot(MOT_EXE)}` : `${n.a} foi executad${oa(r.g)} em ${n.s}${mot(MOT_EXE)}`;
      case 'morte': return ex ? `${n.a} morreu — e há quem diga que não foi de morte natural` : `${n.a} morreu${r.gov ? `, ${r.g === 'f' ? 'ela' : 'ele'} que governava ${n.fa}` : ''}`;
      case 'golpe': return `${n.a} tomou o poder em ${n.fa}${ex ? ', e correu sangue no palácio' : ''}`;
      case 'levante': return `${n.a ? n.a + ' levantou' : 'levantou-se'} gente contra quem governa ${n.fa}${ex ? ', e já são milhares' : ''}`;
      case 'motim': return `houve um motim em ${n.s}${ex ? ', e a cidade ardeu' : ''}`;
      case 'coroa': return `${n.a} agora governa ${n.fa}${mot(MOT_COROA)}`;
      case 'conquista': return ex ? `${n.s} foi arrasada pelos de ${n.fb}` : `${n.s} caiu nas mãos dos de ${n.fb}`;
      case 'batalha': return `houve uma batalha${n.pl || ''}${r.mortos ? `, com ${ex ? r.mortos * 3 : r.mortos} mortos` : ''}`;
      case 'cerco': return `os de ${n.fb} cercaram ${n.s}${ex ? ', e lá dentro já se morre de fome' : ''}`;
      case 'fera': return r.b ? `${nm(r.b)} matou ${n.beast}${ex ? ' com as próprias mãos' : ''}` : `${n.beast} matou ${n.a}${ex ? ', e há outros como ele no mato' : ''}`;
      case 'traicao': return ex ? `${n.a} trai ${n.b} há muito tempo` : `${n.a} traiu ${n.b}${n.c ? ' com ' + n.c : ''}`;
      case 'fofoca': { const t = String(r.tx || '').replace(/\.$/, ''); return n.a && t.startsWith(n.a) ? t : t.charAt(0).toLowerCase() + t.slice(1); }
    }
    return '';
  };
  // the line as the person says it: what they saw, what the family told, what is said
  B.frase = function (r, sid, how) {
    const t = B.texto(r, sid); if (!t) return '';
    const d = sid && (rowOf(r, sid) || [])[VER] & DESM;
    if (how === 'viu') return G.cap(t) + '.';
    if (d) return `Já se sabe a verdade: ${t}.`;
    return (how === 'soube' ? 'Contaram em casa que ' : 'Dizem que ') + t + '.';
  };
  // the news of the body's ears (Possess.knows.boatos): what the lived person knows now, in the version they heard, the newest
  // first; a key that changes when the version does (a denial is heard again)
  B.doCorpo = function (v) {
    const out = []; if (!v) return out;
    for (const r of list()) {
      const how = B.sabe(v, r); if (!how) continue;
      const sid = B.deQuem(v, r); const w = sid ? rowOf(r, sid) : null;
      out.push({ id: r.id, key: r.id + ':' + (w ? w[VER] & ~FAMA : 0) + ':' + (r.j ? 1 : 0), txt: B.frase(r, sid, how), how, d: w ? w[DIA] : r.d, sal: KD[r.k].sal });
    }
    return out.sort((a, b) => b.d - a.d || b.sal - a.sal || a.id - b.id).slice(0, 12);
  };
  // how hot the town's talk of a rumour of secrets.js is (its heat, read from the part of the town: the same thing, D-624)
  // (a talk of before the rumours — a save of before — keeps the heat it had; one of the rumours' time that is gone is cold)
  B.heat = function (sr) { if (!sr) return 0; const r = find(q => q.sec === sr.id); if (!r) return G.S.boatos && sr.day >= G.S.boatos.d0 ? 0 : sr.heat || 0; const w = rowOf(r, r.set); return w ? w[P] / 1000 * 2.5 : 0; };
  const find = fn => { for (const r of list()) if (fn(r)) return r; return null; };
  B.ofCrime = cid => find(r => r.c === cid);
  // who a town already suspects for a deed against the victim: a known enemy of the victim, else one the town gives an ill name
  // for what they did (the labels of the fame there) — the people and the look of no one (rule 194); sorted by id, picked by hash
  const ILL = ['ladrao', 'assassino', 'agressor', 'cruel', 'traidor'];
  B.suspeitos = function (r, set) {
    const S = S_(); const out = [];
    for (const id of r.e || []) { const o = person(id); if (o && o.set === set.id && o.id !== r.q && o.id !== r.a && o.age >= 14) out.push(o); }
    if (out.length) return out;
    if (!G.Fama) return out;
    for (const o of S.villagers.values()) {
      if (o.set !== set.id || !o.fama || o.age < 14 || o.id === r.a || o.id === r.q || o.captive) continue;
      const f = G.Fama.de(o, set.id); if (f && (f.estima <= -30 || f.rotulos.some(k => ILL.includes(k)))) out.push(o);
    }
    return out.sort((a, b) => a.id - b.id);
  };
  // (how lively a town's talk is: the tavern's rounds and the market's trade of its whole, against what makes the profile of it)
  B.vida = function (set) {
    const w = G.Urban && G.Urban.wholeOf ? G.Urban.wholeOf(set) : null; const q = w && w.vida; if (!q) return 1;
    return 0.75 + 0.25 * Math.min(1.2, (q.noite || 0) / 0.3) + 0.25 * Math.min(1.2, (q.troca || 0) / 0.3);
  };

  // ------------------------------ the doors that write (only in the world's step) ------------------------------
  // a rumour is born where the thing happened, known by name to its witnesses and its family; the part that knows already
  B.nasce = function (k, o) {
    if (!G.inSim) { B.fora++; return null; }
    const S = S_(); const set = o && S.settlements.get(o.set); if (!set || !KD[k]) return null;
    const s = st();
    const dup = find(r => r.k === k && ((o.c && r.c === o.c) || (o.f && r.f === o.f) || (o.sec && r.sec === o.sec) || (!o.c && !o.f && !o.sec && r.a === (o.a | 0) && r.b === (o.b | 0) && S.day - r.d <= 1)));
    if (dup) return dup;
    const r = { id: s.n++, k, a: o.a | 0, b: o.b | 0, q: o.q | 0, g: o.g || '', set: set.id, d: S.day, c: o.c | 0, f: o.f | 0, sec: o.sec | 0, fa: o.fa | 0, fb: o.fb | 0, j: 0, n: o.n || {}, e: (o.e || []).slice(0, 2), at: [] };
    if (o.tx) r.tx = String(o.tx).slice(0, 220); if (o.gov) r.gov = 1; if (o.boo) r.boo = 1; if (o.mortos) r.mortos = o.mortos | 0;
    r.at.push([set.id, clampI(o.p0 || 40, 1, 1000), 100, 0, 0, S.day, 0]);
    s.list.push(r); s.tot++;
    for (const id of o.viu || []) ensina(person(id), r, 'viu', 0);
    for (const id of o.soube || []) ensina(person(id), r, 'soube', set.id);
    trim();
    return r;
  };
  // v comes to know r by name (the version of the town sid; 0, the truth); when full, the least of the six gives way
  function ensina(v, r, how, sid) {
    const S = S_(); if (!v || !S.villagers.has(v.id) || v.age < 6 || !HOW.hasOwnProperty(how)) return false;
    const a = v.sabe || (v.sabe = []);
    for (const e of a) if (e[0] === r.id) { if (HOW[how] > HOW[e[1]]) { e[1] = how; e[3] = how === 'viu' ? 0 : sid | 0; } return true; }
    const score = (h, rr, d) => HOW[h] * 100 + (rr ? KD[rr.k].sal : 0) - (S.day - d) * 2;
    if (a.length >= B.SABE) {
      let li = -1, ls = Infinity; for (let i = 0; i < a.length; i++) { const sc = score(a[i][1], B.byId(a[i][0]), a[i][2]); if (sc < ls) { ls = sc; li = i; } }
      if (ls >= score(how, r, S.day)) return false;
      a.splice(li, 1);
    }
    a.push([r.id, how, S.day, how === 'viu' ? 0 : sid | 0]);
    return true;
  }
  B.ensina = function (v, r, how, sid) { if (!G.inSim) { B.fora++; return false; } return ensina(v, r, how, sid === undefined ? (v ? v.set : 0) : sid); };
  // the rumour reaches a town that did not have it: one teller, the version they carry (a passage: a little less true)
  function semeia(r, sid, from, tel) {
    const S = S_(); if (rowOf(r, sid) || !S.settlements.has(sid)) return false;
    const src = from ? rowOf(r, from) : null;
    const fid = Math.max(0, Math.round((src ? src[FID] : 100) * 0.8) - 4);
    const ver = src ? src[VER] & (EXA | MOT | TROCA | 0xE0) : 0;
    r.at.push([sid, B.SEED, fid, ver, ver & TROCA ? src[CUL] : 0, S.day, tel | 0]);
    return true;
  }
  B.leva = function (v, sid) { if (!G.inSim) { B.fora++; return 0; } return carry(v, sid, null); };
  // a person in a town's streets: what they know by name reaches it; abroad, they hear (by the part there) up to two of its own
  function carry(v, sid, has) {
    let n = 0;
    if (v.sabe) for (const e of v.sabe) { const r = B.byId(e[0]); if (r && !(has ? has.has(r.id * 4194304 + sid) : rowOf(r, sid)) && semeia(r, sid, e[1] === 'viu' ? 0 : e[3], v.id)) { n++; if (has) has.add(r.id * 4194304 + sid); } }
    if (sid === v.set) return n;
    const ext = G.Indole ? G.Indole.ax(v, 'ext') / 99 : 0.5; let got = 0;
    for (const r of list()) {
      if (got >= 2) break;
      const w = rowOf(r, sid); if (!w || w[P] < 100 || (v.set && rowOf(r, v.set))) continue;
      if (v.sabe && v.sabe.some(e => e[0] === r.id)) continue;
      if (G.hash(v.id * 2654 + r.id * 97 + sid * 31 + 7) < w[P] / 1000 * (0.5 + 0.5 * ext) && ensina(v, r, 'ouviu', sid)) got++;
    }
    return n;
  }
  // the crew at a foreign quay (naval.js): each of them in the port's talk
  B.porto = function (s, sid) { if (!G.inSim) { B.fora++; return; } if (!s || !G.Naval || !G.S.settlements.has(sid)) return; for (const v of G.Naval.aboardOf(s)) carry(v, sid, null); };
  // the talk of secrets.js is a rumour of the town (D-624): born with its heat, warmer when told again, silenced by the ruler
  B.fofoca = function (sr) {
    if (!G.inSim) { B.fora++; return null; }
    const S = S_(); let set = S.settlements.get(sr.set); if (!set && G.Fac) set = G.Fac.capitalOf(sr.fac); if (!set) return null;
    const acc = person(sr.accused);
    return B.nasce('fofoca', { set: set.id, sec: sr.id, a: acc ? acc.id : 0, tx: sr.txt, n: { a: acc ? acc.name : '' }, p0: 250 });
  };
  B.fala = function (sr) { if (!G.inSim) { B.fora++; return; } const r = find(q => q.sec === sr.id); const w = r && rowOf(r, r.set); if (w) { w[P] = clampI(w[P] + 150, 0, 1000); w[DIA] = S_().day; } };
  B.cala = function (sr) { if (!G.inSim) { B.fora++; return; } const r = find(q => q.sec === sr.id); const w = r && rowOf(r, r.set); if (w) w[P] = 0; };
  // the cap: the coldest go (the salience times how many know, everywhere)
  function trim() {
    const s = st(); if (s.list.length <= B.MAX) return;
    const heat = r => KD[r.k].sal * (1 + r.at.reduce((a, w) => a + w[P], 0) / 1000) - (S_().day - r.d);
    let li = -1, lh = Infinity; for (let i = 0; i < s.list.length; i++) { const h = heat(s.list[i]); if (h < lh) { lh = h; li = i; } }
    const gone = s.list.splice(li, 1)[0]; forget(new Set([gone.id]));
  }
  // (a rumour gone: nobody knows it by name any more)
  function forget(ids) {
    if (!ids.size) return;
    for (const v of S_().villagers.values()) { const a = v.sabe; if (!a) continue; for (let i = a.length - 1; i >= 0; i--) if (ids.has(a[i][0])) a.splice(i, 1); if (!a.length) v.sabe = undefined; }
  }

  // ------------------------------ the town's day (from the ties' day, soc-lacos.js) ------------------------------
  B.dayOf = function (set) {
    const S = S_();
    crimes(set);
    if (!S.boatos || !S.boatos.list.length) return;
    const F = G.Fama; const life = B.vida(set);
    // who lives here and saw it with their own eyes (one witness of each rumour is enough)
    const wits = new Map(); let folk = null, talker;
    for (const v of S.villagers.values()) if (v.set === set.id && v.sabe && v.age >= 12) for (const e of v.sabe) if (e[1] === 'viu' && !wits.has(e[0])) wits.set(e[0], v);
    const talk = () => { if (talker === undefined) { folk = folk || [...S.villagers.values()].filter(v => v.set === set.id && v.age >= 16 && !v.captive); talker = G.Convivio && folk.length ? G.Convivio.fofoqueiro(folk) : null; } return talker; };
    const gone = new Set();
    for (const r of S.boatos.list) {
      for (let i = r.at.length - 1; i >= 0; i--) if (!S.settlements.has(r.at[i][0])) r.at.splice(i, 1);
      const w = rowOf(r, set.id); if (!w) { if (!r.at.length || S.day - r.d > B.AGE) gone.add(r.id); continue; }
      const D = KD[r.k]; const p = w[P] / 1000; const age = S.day - w[DIA];
      if (age <= D.hold) { const dp = D.r * life * p * (1 - p) + (p < 0.01 ? 0.004 : 0); w[P] = clampI((p + dp) * 1000, 0, 1000); w[FID] = clampI(w[FID] - dp * 22 - 1, 0, 100); }
      else w[P] = Math.floor(w[P] * 0.8);
      const wit = wits.get(r.id) || null;
      if (wit) { if (w[FID] < 60) w[FID] = 60; if (w[VER] & TROCA) desmente(r, w, set, wit); }
      distort(r, w, set, wit, talk);
      if (r.j && !(w[VER] & DESM) && w[VER] & (TROCA | EXA | MOT) && G.hash(r.id * 977 + set.id * 13 + S.day) < 0.4 + p) desmente(r, w, set, null);
      if (!(w[VER] & FAMA) && w[P] >= 350) { w[VER] |= FAMA; if (F) fama(r, w, set); }
      if (w[P] < 10 && age > D.hold) r.at.splice(r.at.indexOf(w), 1);
      if (!r.at.length || S.day - r.d > B.AGE) gone.add(r.id);
    }
    if (gone.size) { S.boatos.list = S.boatos.list.filter(r => !gone.has(r.id)); forget(gone); }
    povo(set);
  };
  // the version changes with the passages, by rules with a cause (the hash of the rumour and the town)
  function distort(r, w, set, wit, talk) {
    const D = KD[r.k]; const f = w[FID]; let ver = w[VER]; if (ver & DESM) return;
    const h = n => G.hash(r.id * 7919 + set.id * 104729 + n);
    if (D.exa && !(ver & EXA) && f < 70 && h(1) < 0.55) ver |= EXA;
    if (D.mot && !(ver & MOT) && f < 50 && h(2) < 0.5) ver |= MOT | ((Math.floor(h(3) * 6) & 7) << 5);
    if (D.who && !(ver & TROCA) && !wit && f < (r.q ? 35 : 60) && h(4) < 0.6) {
      const sus = B.suspeitos(r, set);
      if (sus.length) { const s = sus[Math.floor(h(5) * sus.length)]; ver |= TROCA; w[CUL] = s.id; if (!w[TEL]) { const t = talk(); w[TEL] = t && t.id !== s.id ? t.id : 0; } }
    }
    w[VER] = ver;
  }
  // the truth told again: by a witness who lives here, or by the judgment — the name of the one wrongly said cleared, the one who
  // spread it less believed
  function desmente(r, w, set, wit) {
    const F = G.Fama; const D = KD[r.k];
    if (w[VER] & TROCA && F) {
      const inn = person(w[CUL]); if (inn && w[VER] & FAMA && D.fama) F.desfeito(inn, D.fama, set.id);
      const tel = person(w[TEL]); if (tel && tel !== wit) F.feito(tel, 'mentiu', set.id);
    }
    w[VER] = (w[VER] & FAMA) | DESM; w[CUL] = 0; w[FID] = Math.max(w[FID], 85);
  }
  // what the town does with what it says, once most know: the fame of the version's culprit here (in the crime's own town the
  // answer to the crime gives it — soc-vida.js —, the rumour only when it names another); the deeds of who rules
  function fama(r, w, set) {
    const F = G.Fama; const D = KD[r.k]; const cul = w[VER] & TROCA ? w[CUL] : r.q;
    if (D.fama && cul && !(r.c && set.id === r.set && cul === r.q)) { const v = person(cul); if (v) F.feito(v, D.fama, set.id); }
    if (r.k === 'execucao' && r.boo && r.b) { const v = person(r.b); if (v) F.feito(v, 'cruel', set.id); }
    if ((r.k === 'coroa' || r.k === 'golpe' || r.k === 'levante') && r.a) { const v = person(r.a); if (v) F.feito(v, 'nome', set.id); }
    if (r.k === 'fera' && r.b) { const v = person(r.b); if (v) F.feito(v, 'valente', set.id); }
  }
  // the memory of the people (f.memoria, soc-fama.js): what went through most of its towns, on the day of its capital
  function povo(set) {
    const S = S_(); const F = G.Fama; if (!F || !F.lembraPovo) return;
    const f = G.Fac && G.Fac.get(set.fac); if (!f || f.capital !== set.id) return;
    const sets = []; for (const s of S.settlements.values()) if (s.fac === f.id) sets.push(s.id);
    if (!sets.length) return;
    for (const r of S.boatos.list) {
      const D = KD[r.k]; if (!D.pp || (r.k === 'morte' && !r.gov) || (r.mp && r.mp.includes(f.id))) continue;
      let sum = 0; for (const sid of sets) { const w = rowOf(r, sid); if (w) sum += w[P]; }
      if (sum / sets.length < 500) continue;
      const sid = rowOf(r, set.id) ? set.id : r.at[0][0];
      if (F.lembraPovo(f, D.pp, r.a || r.b, r.b || r.fb, D.sal, B.texto(r, sid))) (r.mp || (r.mp = [])).push(f.id);
    }
  }
  // the crimes of the town found or seen (crime.js): a rumour each, known by who saw it and the victim's family; the judgment
  // (the arrest, S.crimes' dayArrest) is the truth told — the town knows now who did it
  function crimes(set) {
    const S = S_(); const L = G.Lacos;
    for (const c of S.crimes || []) {
      if (c.set !== set.id || S.day - c.day > 2) continue;
      const r0 = S.boatos ? find(q => q.c === c.id) : null;
      if (r0) { if (c.dayArrest !== undefined && !r0.j && c.thief) { r0.j = S.day; r0.q = c.thief; } continue; }
      const k = c.kind === 'homicidio' || c.kind === 'agressao' ? c.kind : c.kind === 'furto' ? 'furto' : null; if (!k) continue;
      if (k === 'furto' && !c.found && !(c.seen && c.seen.length)) continue;
      let vic = person(c.victim) || (c.victim && S.dead.get(c.victim)) || null;
      if (k === 'furto') { vic = null; for (const o of S.villagers.values()) if (o.home === c.house && o.age >= 16 && (!vic || o.age > vic.age || (o.age === vic.age && o.id < vic.id))) vic = o; }
      if (!vic) continue;
      const seen = (c.seen || []).filter(id => person(id)).slice(0, 5);
      const knows = seen.length > 0 || (k === 'agressao' && !!person(c.victim));
      const viu = seen.slice(); if (k === 'agressao' && person(c.victim)) viu.push(c.victim);
      const soube = []; if (G.Stories && G.Stories.kin) for (const o of G.Stories.kin(vic).slice(0, 4)) soube.push(o.id);
      // (the known enemies of the victim, the culprit a town would name: whom the victim holds a grudge against, or who holds one)
      const e = [];
      if (L) { const pv = person(vic.id); for (const o of S.villagers.values()) { if (e.length >= 2) break; if (o.set !== set.id || o.id === c.thief || o.id === vic.id || o.age < 14) continue; const t = pv && L.find(pv, o.id) ? L.sente(pv, o) : null; const u = L.find(o, vic.id) ? L.sente(o, vic) : null; if ((t && t.afeto <= -30) || (u && u.afeto <= -30)) e.push(o.id); } }
      B.nasce(k, { set: set.id, c: c.id, a: vic.id, g: vic.g, q: knows ? c.thief : 0, n: { a: vic.name, s: set.name }, viu, soube, e, p0: 30 + 25 * seen.length });
    }
  }

  // ------------------------------ the facts the stories hear (St.listen) ------------------------------
  const facName = id => { const f = G.Fac && G.Fac.get(id); return f ? f.name : ''; };
  const setName = id => { const s = G.S.settlements.get(id); return s ? s.name : ''; };
  function nearSet(x, y, R) { let best = null, bd = R * R; if (!Number.isFinite(x)) return null; for (const s of G.S.settlements.values()) { const d = G.dist2(x, y, s.cx, s.cy); if (d < bd) { bd = d; best = s; } } return best; }
  function eyes(x, y, n) { const out = []; if (!Number.isFinite(x)) return out; for (const o of G.S.villagers.values()) { if (out.length >= n) break; if (o.age < 8 || o.sleeping || o.inside || o.captive || o.aboard || o.ug) continue; if (G.dist2(o.x, o.y, x, y) < 81) out.push(o.id); } return out; }
  const capOf = fid => (G.Fac ? G.Fac.capitalOf(fid) : null);
  function ouve(f) {
    if (!G.inSim || !f) return;
    const S = S_(); const P0 = G.Politics;
    switch (f.k) {
      case 'executado': {
        const ids = (f.ids || []).filter(Boolean); if (!ids.length) return; const set = S.settlements.get(f.set) || nearSet(f.x, f.y, 40); if (!set) return;
        const d = S.dead.get(ids[0]) || person(ids[0]); const fac = G.Fac.get(f.fac); const ru = fac && P0 ? P0.ruler(fac) : null;
        return void B.nasce('execucao', { set: set.id, f: f.id || 0, a: ids[0], g: d ? d.g : '', b: ru ? ru.id : 0, fa: f.fac, boo: (f.boo || 0) > (f.cheer || 0), n: { a: d ? d.name : 'alguém', s: set.name, fa: facName(f.fac) }, viu: eyes(f.x, f.y, 6), p0: 120 });
      }
      case 'coroa': {
        if (f.how === 'fundacao') return; const v = person(f.a); const set = capOf(f.fac); if (!v || !set) return;
        return void B.nasce(f.how === 'golpe' ? 'golpe' : 'coroa', { set: set.id, a: v.id, g: v.g, fa: f.fac, n: { a: v.name, s: set.name, fa: facName(f.fac) }, p0: 150 });
      }
      case 'levante': { const set = capOf(f.fac); if (!set) return; const v = person(f.a); return void B.nasce('levante', { set: set.id, a: f.a || 0, g: v ? v.g : '', fa: f.fac, n: { a: v ? v.name : '', s: set.name, fa: facName(f.fac) }, p0: 200 }); }
      case 'motim': { const set = S.settlements.get(f.set); if (!set) return; return void B.nasce('motim', { set: set.id, a: f.a || 0, fa: f.fac, n: { s: set.name, fa: facName(f.fac) }, viu: eyes(f.x, f.y, 4), p0: 150 }); }
      case 'conquista': { const set = S.settlements.get(f.set); if (!set) return; return void B.nasce('conquista', { set: set.id, fa: f.fa, fb: f.fb, n: { s: set.name, fa: facName(f.fa), fb: facName(f.fb) }, p0: 400 }); }
      case 'cerco': { const set = S.settlements.get(f.set); if (!set) return; return void B.nasce('cerco', { set: set.id, fb: f.by || 0, n: { s: set.name, fb: facName(f.by) }, p0: 250 }); }
      case 'batalha': {
        if ((f.dead || 0) < 6) return; const set = nearSet(f.x, f.y, 40); if (!set) return;
        const pl = G.Stories && G.Stories.where ? G.Stories.where(f.x, f.y).at : '';
        return void B.nasce('batalha', { set: set.id, f: f.id || 0, fa: f.winner || 0, mortos: f.dead, n: { s: set.name, pl }, p0: 80 });
      }
      case 'fera-morta': {
        if (!f.by || !f.n || !f.n.beast) return; const v = person(f.by); const set = v && S.settlements.get(v.set); if (!set) return;
        return void B.nasce('fera', { set: set.id, f: f.id || 0, b: v.id, n: { beast: f.n.beast, s: set.name }, viu: eyes(f.x, f.y, 4), p0: 80 });
      }
      case 'morte': {
        if (!f.n || !f.n.beast || !(f.cause === 'beast' || f.cause === 'wolf' || f.cause === 'boar')) return;
        const set = nearSet(f.x, f.y, 30); if (!set) return;
        return void B.nasce('fera', { set: set.id, f: f.id || 0, a: f.a, n: { a: f.n.a, beast: f.n.beast, s: set.name }, viu: (f.w || []).slice(0, 4), soube: (f.kn || []).slice(0, 4), p0: 60 });
      }
    }
  }
  if (G.Stories && G.Stories.listen) G.Stories.listen(ouve);

  // ------------------------------ a death of note, and the legend ------------------------------
  // (who ruled, a hero, one with a name in the town: their death is told; who dies with a heavy name, or as the subject of what
  // many towns said, becomes a legend — in the words the towns told, true or not: a legend is what is said, D-625)
  const LEG = { heroi: ['herói', 'heroína'], salvador: ['quem salvou os seus', 'quem salvou os seus'], valente: ['valente', 'valente'], assassino: ['assassino', 'assassina'], cruel: ['cruel', 'cruel'], traidor: ['traidor', 'traidora'] };
  const kill0 = G.Village.kill;
  G.Village.kill = function (v, cause) {
    const S = S_();
    if (G.inSim && v && S.villagers.has(v.id)) { try { atDeath(v, cause); } catch (e) { console.warn('boatos death', e); } }
    return kill0.apply(this, arguments);
  };
  function atDeath(v, cause) {
    const S = S_(); const F = G.Fama; const set = S.settlements.get(v.set); if (!set) return;
    const fac = G.Fac.get(set.fac); const ruled = !!(fac && fac.leader === v.id);
    const fm = F ? F.de(v, v.set) : null;
    const beastNamed = (cause === 'beast' || cause === 'wolf' || cause === 'boar') && v.lastBeast && (S.animals.get(v.lastBeast) || {}).named;
    if (!beastNamed && cause !== 'execution' && cause !== 'homicidio' && (ruled || v.hero || v.ep || (fm && fm.renome >= 40)))
      B.nasce('morte', { set: set.id, a: v.id, g: v.g, gov: ruled, fa: set.fac, n: { a: v.name, s: set.name, fa: facName(set.fac) }, soube: (G.Stories && G.Stories.kin ? G.Stories.kin(v) : []).slice(0, 4).map(o => o.id), p0: ruled ? 300 : 120 });
    if (!G.Lore || !G.Lore.legend) return;
    // the rumour most told of the person (as the subject, or the culprit of a version), and where it is told most
    let best = null, bw = null, bs = 0;
    for (const r of list()) {
      if (KD[r.k].sal < 60 || (r.k === 'morte' && r.a === v.id)) continue; // (the death itself is not the story)
      let sum = 0, top = null; for (const w of r.at) { const cul = w[VER] & TROCA ? w[CUL] : r.q; if (r.a !== v.id && r.b !== v.id && cul !== v.id) continue; sum += w[P]; if (!top || w[P] > top[P]) top = w; }
      if (sum > bs) { bs = sum; best = r; bw = top; }
    }
    const lab = fm && fm.renome >= 60 ? fm.rotulos.find(k => LEG[k]) : null;
    if (!(best && bs >= 1500) && !lab) return;
    const key = 'boato:' + v.id; const where = best ? setName(bw[0]) || set.name : set.name;
    if (bs < 1500) best = null;
    const txt = best ? `No ano ${S.day}, morreu ${v.name}. Em ${where} ainda se conta que ${B.texto(best, bw[0])} — e assim ficou, verdade ou não.`
      : `No ano ${S.day}, morreu ${v.name}. Em ${set.name} lembram-se ${v.g === 'f' ? 'dela' : 'dele'} como ${LEG[lab][v.g === 'f' ? 1 : 0]}.`;
    G.Lore.legend(key, `A lenda de ${v.name}`, txt, { kind: 'boato', who: v.id });
  }

  // ------------------------------ the carriers (a sweep of the world's streets) ------------------------------
  // every few seconds of the world (G.mod: the same at the skip and at the step, and after a load): whoever stands in a town's
  // streets brings it what they know by name; a stranger there hears its talk
  B.update = function () {
    const S = S_(); if (!S || !S.boatos || !S.boatos.list.length || !G.Urban || !G.Urban.at) return;
    const t = G.mod('boato.t'); if (t !== undefined && S.clock < t) return;
    G.mod('boato.t', Math.ceil(S.clock) + B.SWEEP);
    const has = new Set(); for (const r of S.boatos.list) for (const w of r.at) has.add(r.id * 4194304 + w[0]);
    for (const v of S.villagers.values()) {
      if (!v.set || v.age < 12 || v.captive || v.ug) continue;
      const q = G.Urban.at(v.x, v.y); const sid = q && q.set; if (!sid || !S.settlements.has(sid)) continue;
      if (!v.sabe && sid === v.set) continue;
      carry(v, sid, has);
    }
  };
  if (G.Lacos && G.Lacos.update) { const lu = G.Lacos.update; G.Lacos.update = function () { const r = lu.apply(this, arguments); B.update(); return r; }; }

  // ------------------------------ the load ------------------------------
  // (a save of before: no rumours — they are born from now on; a damaged one: only whole rumours of known kinds, rows of towns
  // that exist, numbers within their bounds, the caps; v.sabe of live rumours only, up to six)
  G.saveHooks.push({
    save(out) { out.boatos = G.S.boatos || null; },
    load(o) {
      const S = S_(); const b = o && o.boatos; S.boatos = undefined;
      if (b && typeof b === 'object' && Array.isArray(b.list)) {
        const out = []; const ids = new Set();
        for (const r of b.list) {
          if (!r || typeof r !== 'object' || !KD[r.k] || !Number.isInteger(r.id) || r.id <= 0 || ids.has(r.id) || !Array.isArray(r.at)) continue;
          const at = []; for (const w of r.at) if (Array.isArray(w) && w.length >= 7 && S.settlements.has(w[0]) && !at.some(q => q[0] === w[0])) at.push([w[0], clampI(+w[1] || 0, 0, 1000), clampI(+w[2] || 0, 0, 100), (w[3] | 0) & 0xFF, w[4] | 0, Math.min(w[5] | 0, S.day), w[6] | 0]);
          if (!at.length) continue;
          ids.add(r.id);
          out.push(Object.assign({}, r, { a: r.a | 0, b: r.b | 0, q: r.q | 0, set: r.set | 0, d: Math.min(r.d | 0, S.day), c: r.c | 0, f: r.f | 0, sec: r.sec | 0, fa: r.fa | 0, fb: r.fb | 0, j: r.j | 0, n: r.n && typeof r.n === 'object' ? r.n : {}, e: Array.isArray(r.e) ? r.e.filter(Number.isInteger).slice(0, 2) : [], at, mp: Array.isArray(r.mp) ? r.mp.filter(Number.isInteger) : undefined }));
        }
        const top = out.reduce((m, r) => Math.max(m, r.id), 0);
        S.boatos = { v: 1, n: Math.max(top + 1, b.n | 0, 1), tot: b.tot | 0, d0: Number.isInteger(b.d0) ? Math.min(b.d0, S.day) : S.day, list: out.slice(-B.MAX) };
      }
      const live = new Set(list().map(r => r.id));
      for (const v of S.villagers.values()) {
        if (v.sabe === undefined) continue;
        const a = Array.isArray(v.sabe) ? v.sabe.filter(e => Array.isArray(e) && live.has(e[0]) && HOW.hasOwnProperty(e[1])).map(e => [e[0], e[1], Math.min(e[2] | 0, S.day), e[3] | 0]) : [];
        const seen = new Set(); const u = a.filter(e => !seen.has(e[0]) && seen.add(e[0]));
        v.sabe = u.length ? u.slice(-B.SABE) : undefined;
      }
    },
  });
})(window.G);
