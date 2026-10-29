// casa-deus: as casas na tipologia do deus (D-082, a B2c do Patch 2) provadas em Node, sem mundo, sobre o código do jogo:
//   1. os andares do deus por tipo — a cabana de 1, a casa de 1, o sobrado de 2 (o nórdico, a casa longa com jirau), a ínsula
//      de 3 (a romana de 4, a nórdica de 2); no centro a ínsula de menos de 4 um a mais (num lote de 4 m os seus 14 não dormem
//      em 3) —, e um andar a mais só onde os do deus não abrigam a casa: toda família oferecida tem esses andares
//   2. o quintal fora do centro: a casa do tamanho do deus, ou crescida até abrigar a casa, no meio do lote, menor que ele; no
//      centro o lote cheio
//   3. ninguém dorme de pé: fora do centro no máximo 1 num chão guardado, com um chão livre de 0,7 × 1,9 m para ele; no centro
//      todos na cama (só o último recurso deita alguns no chão, cada um no seu)
//   4. a regra da fundação (In.secure, no passo do mundo): a casa cuja família não abriga a casa naquele lote passa à primeira
//      que abriga, na ordem do tipo girada pelo id — a mesma escolha duas vezes —, com o fato no registro e a planta válida; a
//      casa que abriga fica como está
//   5. a casa abandonada (leftOf) nas mesmas casas da grade da habitada: só as das coisas que a família leva livres, e as
//      pontas dos lances onde o corpo fica como na habitada
//   6. a cabana redonda do deus (T-161, com o P3): fora do centro, no lote inteiro, o fogo de chão no meio, 3 esteiras de 1,7 m
//      ao longo do anel e 1 no chão guardado diante da porta, o corpo chegando a cada esteira (0,5 m de chão em volta de um ponto
//      de pé dela, e o corpo inteiro a 0,7 m de um); no centro não é oferecida
//   node qa/casa-deus.js
const M = require('./nodemundo.js');
const G = M.load({});
const In = G.Interiors;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | casa-deus ${name} | ${info}`); if (!c) fails.push(name); };
G.S = { villagers: new Map(), buildings: new Map(), dead: new Map(), settlements: new Map(), clock: 100, day: 3, time: 0.4, avatar: null, nextId: 1000, history: [], fire: new Float32Array(G.N * G.N) };
const POVOS = Object.keys(In.TRAD);
const OUT = { k: '', cl: 't', fl: 0, d: 1, w: 0, e: 1 }, MID = { k: 'a', cl: 't', fl: 0, d: 3, w: 1, e: 3 };
const rec = (t, c, x, f, s) => ({ v: 4, f: f || '', r: 0, t, u: 'casa', s: s || 'S', o: 0, c, e: x.e, k: x.k, cl: x.cl, fl: x.fl, d: x.d, w: x.w, pw: 0, h: [[1, 'obra']], m: 0, fx: [], dr: {}, hh: 0, nm: 0, vz: 0, ab: 0 });
const nOf = f => { const o = In.parseV(f.split('.')[1]); return o ? o.n : 1; };
const L = 4;
// ---------------------------------------------------------------- 1. the god's storeys
{
  const god = (t, c, d) => { if (t === 'sobrado') return c === 'nordico' ? 1 : 2; if (t !== 'insula') return 1; const n = c === 'romano' ? 4 : c === 'nordico' ? 2 : 3; return d >= 2 && n < 4 ? n + 1 : n; };
  const bad = []; let n = 0;
  for (const t of ['hut', 'house', 'sobrado', 'insula']) for (const c of POVOS) for (const x of [OUT, MID]) {
    const want = god(t, c, x.d); const allow = t === 'hut' ? [1] : [want, want + 1];
    for (const f of In.familiesFor(rec(t, c, x)).ok) { n++; if (!allow.includes(nOf(f))) bad.push(`${t}/${c}/d${x.d} ${f}: ${nOf(f)} andares (o deus: ${want})`); }
  }
  ok('1 os andares do deus por tipo (e um a mais só onde não cabe)', n > 0 && !bad.length, `${n} famílias oferecidas em ${4 * POVOS.length * 2} combinações${bad.length ? '; ' + bad.slice(0, 3).join(' · ') : ''}`);
}
// ---------------------------------------------------------------- 2. the yard out of the centre; 3. nobody sleeps standing
{
  let nid = 3001; const plans = [];
  for (const t of ['hut', 'house', 'sobrado']) for (const c of POVOS) for (const x of [OUT, MID]) {
    const fams = In.familiesFor(rec(t, c, x)).ok.filter(f => !f.startsWith('anexo.') && !f.endsWith('.esteios'));
    for (const f of fams.slice(0, 4)) for (const s of ['S', 'E']) { const b = { id: (nid += 37), type: t, x: 10, y: 10, w: 1, h: 1 }; const r = rec(t, c, x, f, s); const p = In.make(b, r); if (p.ok && p.fam === f) plans.push({ t, c, x, f, p }); }
  }
  const rectOf = p => p.shell.kind === 'round' ? [p.shell.cu - p.shell.rad, p.shell.cv - p.shell.rad, p.shell.cu + p.shell.rad, p.shell.cv + p.shell.rad] : p.shell.r;
  const yard = plans.filter(q => q.x.d <= 1 && q.p.shell.kind === 'rect'), mid = plans.filter(q => q.x.d >= 2 && q.p.shell.kind === 'rect');
  const inYard = yard.filter(q => { const r = rectOf(q.p); return r[2] - r[0] < L - 0.5 - 1e-6 || r[3] - r[1] < L - 0.5 - 1e-6; });
  // (in the middle of the lot across the street — the lot's own axes, as the door's side turns the plan)
  const offMid = inYard.filter(q => { const r = rectOf(q.p); return Math.min(Math.abs((r[0] + r[2]) / 2 - L / 2), Math.abs((r[1] + r[3]) / 2 - L / 2)) > 0.02; });
  // (the lot filled but its eaves — the north's house a little longer than deep, along the street whichever side it faces)
  const notFull = mid.filter(q => { const r = rectOf(q.p); const a = r[2] - r[0], c = r[3] - r[1]; return Math.max(a, c) < L - 0.5 || Math.min(a, c) < L - 0.5 - 0.35; });
  ok('2 fora do centro o quintal onde a casa cabe (no meio do lote, menor que ele); no centro o lote cheio', inYard.length > 0 && !offMid.length && !notFull.length, `fora do centro ${inYard.length} de ${yard.length} casas no quintal — as outras não abrigam a casa no tamanho do deus nem crescidas aquém do lote (fora do meio: ${offMid.length}); no centro ${mid.length - notFull.length} de ${mid.length} no lote cheio${notFull.length ? ' (' + notFull.slice(0, 3).map(q => `${q.t}/${q.c} ${q.f} ${JSON.stringify(rectOf(q.p))}`).join(' · ') + ')' : ''}`);
  const def = t => G.BDEF[t].housing;
  const standing = plans.filter(q => (q.p.short || 0) > 0 && (!q.p.floorBeds || q.p.floorBeds.length < q.p.short));
  const twoOut = plans.filter(q => q.x.d <= 1 && (q.p.short || 0) > 1 && !(q.p._P && q.p._P.relax));
  const midShort = plans.filter(q => q.x.d >= 2 && (q.p.short || 0) > 0 && !(q.p._P && q.p._P.relax));
  const held = plans.filter(q => q.p.cap.places + (q.p.short || 0) < def(q.t));
  ok('3 ninguém dorme de pé: fora do centro no máximo 1 num chão guardado, no centro todos na cama', !standing.length && !twoOut.length && !midShort.length && !held.length, `${plans.length} plantas: ${plans.filter(q => q.p.short).length} com gente no chão guardado; sem o chão: ${standing.length}; fora do centro mais de 1: ${twoOut.length}; no centro: ${midShort.length}; a casa sem abrigar todos: ${held.length}`);
}
// ---------------------------------------------------------------- 4. the founding's rule
{
  // (houses that do not hold their household in their family on their lot — the ones the plans proof finds; and, if the grammar
  // lays those out by now, a search over a few more)
  const hints = [['hut', 'classico', { k: '', cl: 'f', fl: 0, d: 0, w: 0, e: 1 }, 'redonda.funda', 'S', 131952], ['hut', 'classico', { k: '', cl: 'f', fl: 0, d: 0, w: 0, e: 1 }, 'redonda.funda', 'W', 159628], ['house', 'nordico', { k: 'a', cl: 'q', fl: 0, d: 2, w: 0, e: 3 }, 'anexo.andarq', 'N', 120002]];
  const mk = (t, id) => ({ id, type: t, x: 10, y: 10, w: 1, h: 1, built: true });
  let found = null;
  for (const [t, c, x, f, s, id] of hints) { const b = mk(t, id); const r = rec(t, c, x, f, s); if (!In.make(b, r).ok) { found = { t, c, x, f, s, id }; break; } }
  if (!found) for (let q = 0; q < 200 && !found; q++) { const id = 70001 + q * 7919; const s = ['S', 'E', 'W', 'N'][q % 4]; const r = rec('hut', 'classico', { k: '', cl: 'f', fl: 0, d: 0, w: 0, e: 1 }, 'redonda.funda', s); if (!In.make(mk('hut', id), r).ok) found = { t: 'hut', c: 'classico', x: { k: '', cl: 'f', fl: 0, d: 0, w: 0, e: 1 }, f: 'redonda.funda', s, id }; }
  const run = () => { const b = mk(found.t, found.id); b.ip = rec(found.t, found.c, found.x, found.f, found.s); G.S.buildings.set(b.id, b); G.inSim++; try { In.secure(b); } finally { G.inSim--; } return b; };
  if (!found) ok('4 a regra da fundação: a casa que a família não abriga passa à que abriga', true, 'nenhuma casa inválida achada nas famílias oferecidas (nada a trocar)');
  else {
    const b1 = run(); const p1 = In.plan(b1); const f1 = b1.ip.f; G.S.buildings.delete(b1.id); In.uncache();
    const b2 = run(); const f2 = b2.ip.f; G.S.buildings.delete(b2.id);
    const fact = b1.ip.h.find(h => h[1] === 'reforma');
    ok('4 a regra da fundação: a casa que a família não abriga passa à que abriga, a mesma escolha duas vezes', f1 !== found.f && p1 && p1.ok && f1 === f2 && !!fact && In.familiesFor(b1.ip).ok.includes(f1), `${found.t}/${found.c} ${found.f} #${found.id}/${found.s} → ${f1} (planta válida: ${!!(p1 && p1.ok)}; a segunda vez: ${f2}; o fato: ${fact ? fact.slice(1).join(' ') : 'nenhum'})`);
  }
  // (a house its family holds stays as it is)
  const b = mk('house', 4001); b.ip = rec('house', 'grego', OUT, In.familiesFor(rec('house', 'grego', OUT)).ok[0], 'S'); G.S.buildings.set(b.id, b);
  const f0 = b.ip.f, h0 = b.ip.h.length; const p0 = In.make(b, b.ip); G.inSim++; try { In.secure(b); } finally { G.inSim--; }
  ok('4 a casa que a família abriga fica como está', !p0.ok || (b.ip.f === f0 && b.ip.h.length === h0), `${f0}: ${p0.ok ? (b.ip.f === f0 ? 'a mesma família, nenhum fato' : 'TROCOU para ' + b.ip.f) : 'a planta não sai (outra prova)'}`);
}
// ---------------------------------------------------------------- 5. the house given up, on the cells of the one lived in
{
  // (the houses of storeys of each people, each side: the plan given up — what the family takes gone — on the very cells of the
  // plan lived in, those of the pieces taken freed and no other; every flight's ends where the body stands as in the one lived
  // in. Its grid rasterised again in centimetres put a wall's edge on the other side of a cell's middle: the top of the stair of
  // the sobrado#6003 of the metropole, given up, a wall's cell from the body)
  const C = In.CELL; let n = 0, cells = 0; const bad = [];
  for (const t of ['sobrado', 'insula']) for (const c of POVOS) for (const [q, s] of ['S', 'E', 'W', 'N'].entries()) {
    const r0 = rec(t, c, OUT, '', s); const fams = In.familiesFor(r0).ok; if (!fams.length) continue;
    const f = fams[(c.length * 3 + q) % fams.length]; const b = { id: 6001 + n * 41 + q, type: t, x: 10, y: 10, w: 1, h: 1, built: true };
    const h = In.make(b, Object.assign({}, r0, { f })), a = In.make(b, Object.assign({}, r0, { f, ab: 40 }));
    if (!h.ok || !a.ok || !a.left) continue; n++;
    const taken = h.items.filter(it => In.ITEMS[it.kind] && In.ITEMS[it.kind].leva); const cs = h.grid.cs, N = h.grid.n;
    const inTaken = (lv, x, z) => taken.some(it => it.lv === lv && x > it.r[0] - cs && x < it.r[2] + cs && z > it.r[1] - cs && z < it.r[3] + cs);
    for (const lv in h.grid.lv) { const g0 = h.grid.lv[lv], g1 = a.grid.lv[lv]; for (let k = 0; k < N * N; k++) { if (g0[k] === g1[k]) continue; cells++; const x = (k % N + 0.5) * cs, z = (Math.floor(k / N) + 0.5) * cs;
      if (!((g1[k] === C.FLOOR || g1[k] === C.LOWROOF) && (g0[k] === C.LOW || g0[k] === C.SOLID) && inTaken(+lv, x, z))) { bad.push(`${t}/${c}/${s} ${f}: a casa ${x.toFixed(2)},${z.toFixed(2)} piso ${lv} era ${g0[k]}, abandonada ${g1[k]}`); break; } } }
    for (const st of a.stairs) { if (st.kind === 'degraus') continue; for (const [lv, p] of [[st.lv0, st.a], [st.lv1, st.b]]) if (In.landsAt(a, lv, p[0], p[1]) !== In.landsAt(h, lv, p[0], p[1])) bad.push(`${t}/${c}/${s} ${f}: a ponta do lance ${st.lv0}→${st.lv1} em ${p.join(',')}: o corpo ${In.landsAt(h, lv, p[0], p[1]) ? 'cabe' : 'não cabe'} na habitada, ${In.landsAt(a, lv, p[0], p[1]) ? 'cabe' : 'não cabe'} na abandonada`); }
  }
  ok('5 a casa abandonada nas mesmas casas da habitada, só as das coisas levadas livres', n > 0 && !bad.length, `${n} casas de andares (sobrado e ínsula, cada povo, cada lado): ${cells} casas da grade diferentes, todas de peças levadas${bad.length ? '; ' + bad.slice(0, 3).join(' · ') : ''}`);
}
// ---------------------------------------------------------------- 6. the round hut of the god
{
  // (T-161, with P3: out of the centre the round hut fills its lot — its fire on the ground in the middle, three mats of 1.7 m
  // along the ring round it, the fourth on the floor kept before the door —, every one of them where the body gets to it: a
  // standing point of the mat with half a metre of floor round it, and the whole body (In.BODY.r) within 0.7 m of one, the door
  // reaching it; in the centre it is not offered — the hut there is the shell's square one)
  const R = In.BODY.r; let n = 0; const bad = []; const sides = ['S', 'E', 'W', 'N'];
  const OUTS = [OUT, { k: '', cl: 'f', fl: 0, d: 0, w: 0, e: 1 }];
  for (const c of POVOS.filter(c => In.TRAD[c].round)) for (const x of OUTS) for (const f of ['redonda.terreo', 'redonda.funda']) for (let q = 0; q < 8; q++) {
    const b = { id: 7001 + q * 7919 + c.length * 31, type: 'hut', x: 10, y: 10, w: 1, h: 1, built: true }; const p = In.makeFam(b, rec('hut', c, x, f, sides[q % 4]), f); n++;
    const tag = `${c}/d${x.d}/${f}/${sides[q % 4]} #${b.id}`;
    if (!p.ok) { bad.push(`${tag}: não se arma (${(p.errs || [])[0]})`); continue; }
    const mats = p.items.filter(it => it.spots.some(sp => sp.use === 'deitar')); const fire = p.items.find(it => it.kind === 'fogo-chao'); const sh = p.shell;
    if (mats.length !== 3 || mats.some(it => it.kind !== 'esteira' || Math.abs(Math.max(it.w, it.d) - 1.7) > 0.01) || (p.short || 0) !== 1 || !(p.floorBeds || []).length) { bad.push(`${tag}: ${mats.length} esteiras (${mats.map(it => it.kind + ' ' + Math.max(it.w, it.d)).join(', ')}), ${p.short || 0} no chão`); continue; }
    if (!fire || Math.hypot(fire.x - sh.cx, fire.z - sh.cz) > 0.3) { bad.push(`${tag}: o fogo ${fire ? 'fora do meio' : 'que falta'}`); continue; }
    const g = p.reach || {}; const at = (lv, u, v) => { const G0 = g[lv]; return !!G0 && !!G0[Math.floor(v / p.grid.cs) * p.grid.n + Math.floor(u / p.grid.cs)]; };
    const half = it => it.spots.some(sp => !sp.on && sp.ok && In.standsAt(p, it.lv, sp.x, sp.z, 0.25));
    const whole = it => it.spots.some(sp => { if (sp.on || !sp.ok) return false; for (let r = 0; r <= 0.7 + 1e-6; r += 0.05) for (let k = 0; k < (r ? 24 : 1); k++) { const a = k / 24 * Math.PI * 2, u = sp.x + Math.cos(a) * r, v = sp.z + Math.sin(a) * r; if (In.standsAt(p, it.lv, u, v, R) && at(it.lv, u, v)) return true; } return false; });
    const far = mats.find(it => !half(it) || !whole(it)); if (far) bad.push(`${tag}: o corpo não chega à esteira em ${far.x},${far.z}`);
  }
  const mid = POVOS.filter(c => In.TRAD[c].round).filter(c => In.familiesFor(rec('hut', c, MID)).ok.some(f => f.startsWith('redonda')));
  ok('6 a cabana redonda do deus: o fogo no meio, 3 esteiras de 1,7 m em volta e 1 no chão, o corpo chegando a cada esteira; no centro não', n > 0 && !bad.length && !mid.length, `${n} cabanas redondas fora do centro (os povos de cabana redonda, terra e frio, térrea e funda, cada lado): ${n - bad.length} com tudo; no centro oferecida em ${mid.length ? mid.join(', ') : 'nenhum povo'}${bad.length ? '; ' + bad.slice(0, 3).join(' · ') : ''}`);
}
const err = M.erros(); if (Object.keys(err.mod).length || err.console.length) ok('sem erros de módulo', false, JSON.stringify(err).slice(0, 300));
console.log(fails.length ? `FALHAS: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
