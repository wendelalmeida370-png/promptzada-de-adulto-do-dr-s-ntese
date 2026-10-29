// rebanho: o curral de ponta a ponta num mundo pronto, em Node, pelo qa/nodemundo.js — o mundo de verdade: o pastor pelas
// tarefas dele (economy.js: 'herd', 'fodder', 'tend'), os bichos do curral pelo passo deles (animals.js), o armazém e o livro.
//  r1 o pasto: de manhã, com o rebanho com fome, o pastor o leva ao pasto, ele pasta e volta antes de escurecer — todos de
//     novo dentro do curral, nenhum perdido, menos fome
//  r2 o feno: de noite, com fome, o pastor traz feno do armazém ('feno', do armazém às mãos) e o rebanho come ('feno', das
//     mãos ao uso): sai do armazém só o que o rebanho comeu
//  r3 a tosquia, a ordenha e os ovos: o que o bicho dá nasce nas mãos pelo livro ('tosquia', 'ordenha', 'ovos') e vai ao
//     armazém ('entrega'); o bicho fica sem lã, sem leite, sem ovos até dar de novo
//  r4 um save com o rebanho no pasto: carregado, o rebanho volta para o curral, nenhum fica solto para sempre
//  r5 o pastor morre no pasto: o rebanho volta sozinho para o curral
//  r6 sem capim em volta do curral (a cidade o cercou de ruas): o pastor não leva o rebanho ao chão nu, e o feno vem do armazém
//     (L-396: levava, e o rebanho voltava com mais fome do que foi) — num mundo sem curral assim, o capim em volta do curral
//     do caso tirado pela mão do deus
//  e o verificador (S0–S2) sem nada novo, nenhum erro de módulo nem aviso no console.
// O corpo do deus não pastoreia (o interact.js não tem o verbo): o salto é das vidas longas da regressão.
//   node qa/rebanho.js [mundo]    (rodar pela catraca: bash SP/onda2/catraca.sh node qa/rebanho.js)
const M = require('./nodemundo.js'); const G = M.load({ qa: true });
const D = G.Depot, E = G.Eco, V = G.Village;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | rebanho ${name} | ${info}`); if (!c) fails.push(name); };
const world = process.argv[2] || 'metropole';
M.pronto(world); M.viver(1);
const snap = G.Save.serialize();
const fresh = () => { M.reseed(4242); G.Save.apply(JSON.parse(snap)); G.Main.mode = 'game'; if (G.UI && G.UI.setSpeed) G.UI.setSpeed(0); };
const S = () => G.S;
const r2 = x => Math.round(x * 100) / 100;
const seen = []; D.onMove.push(e => { seen.push(e); });
G.inSim++;
const live = (sec, each, until) => { for (let k = 0; k < sec * 10; k++) { M.viver(0.1); if (each) each(); if (until && until()) return true; } return false; };
const base = () => new Set(QA.check().filter(q => q.sev <= 2).map(q => `${q.sys}|${q.msg}`));
const newBad = B => QA.check().filter(q => q.sev <= 2 && !B.has(`${q.sys}|${q.msg}`)).slice(0, 3).map(q => `S${q.sev} ${q.sys} ${q.msg}`);
const fit = v => v && !v.captive && !v.jail && !v.aboard && !v.held && v.age >= 16 && v.age < 60;
const GIVES = { ovelha: 'wool', vaca: 'milk', cabra: 'milk', peru: 'eggs' };
// (the grass round a pen, read as the herder reads it: the walkable, free spots of 5 to 13 steps whose nine tiles hold grass
// enough to graze — 1,5 and up, economy.js PASTURE_MIN, L-396 —, counted on the whole ring, no chance drawn)
const pastures = b => { const S0 = S(); const W = G.W; const cx = b.x + b.w / 2, cy = b.y + b.h / 2; let n = 0; for (let y = Math.floor(cy - 13); y <= cy + 13; y++) for (let x = Math.floor(cx - 13); x <= cx + 13; x++) { const r = Math.hypot(x + 0.5 - cx, y + 0.5 - cy); if (r < 5 || r > 13 || !W.inb(x, y)) continue; const i = W.idx(x, y); if (!W.walkable(i) || S0.type[i] === G.T.RIVER || S0.occ[i]) continue; let g = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const j = W.idx(G.clamp(x + dx, 0, G.N - 1), G.clamp(y + dy, 0, G.N - 1)); g += S0.veg ? S0.veg[j] : 0.5; if (S0.occ[j]) g -= 0.5; } if (g >= 1.5) n++; } return n; };
// (the pen whose flock gives the most — wool, milk, eggs —, with its herder; for the pasture, one with grass round it — and
// the barest one, for the r6)
function pick(grass) {
  let best = null;
  for (const b of [...S().buildings.values()].sort((p, q) => p.id - q.id)) {
    if ((b.type !== 'curral' && b.type !== 'estabulo') || !b.built) continue;
    const role = G.BDEF[b.type].role; const hs = [...S().villagers.values()].filter(v => v.job === b.id && v.role === role && fit(v));
    const herd = E.penAnimals(b).filter(a => !a.dead); const giving = herd.filter(a => GIVES[a.kind]).length;
    if (!hs.length || herd.length < 2) continue;
    const pa = pastures(b); if (grass ? pa < 12 : pa > 0) continue;
    const sc = giving * 10 + herd.length; if (!best || sc > best.sc) best = { id: b.id, sc };
  }
  return best && best.id;
}
const PEN = pick(true), BARE = pick(false);
if (!PEN) { console.log(`FALHOU | rebanho mundo | ${world}: nenhum curral com pastor, bichos e capim em volta`); process.exit(1); }
{ const b = S().buildings.get(PEN); const herd = E.penAnimals(b); console.log(`${world}: ${V.buildName(b)} #${b.id} de ${S().settlements.get(b.set).name}, ${herd.length} bichos (${[...new Set(herd.map(a => a.kind))].join(', ')}), ${pastures(b)} lugares de pasto em volta${BARE ? `; sem capim em volta: #${BARE}` : ''}`); }
// each case: the pen, its flock (inside, at rest), its herder at the gate; the hour of the case
function setup(time, hunger, pen) {
  fresh(); S().time = time; S().weather.rain = 0; OLD.clear();
  const b = S().buildings.get(pen || PEN); const role = G.BDEF[b.type].role;
  const v = [...S().villagers.values()].filter(x => x.job === b.id && x.role === role && fit(x)).sort((p, q) => p.id - q.id)[0];
  const herd = E.penAnimals(b).filter(a => !a.dead).sort((p, q) => p.id - q.id);
  for (const a of herd) { a.state = 'pen'; a.herder = 0; a.ledBy = 0; a.hold = 0; a.x = b.x + 0.5 + ((a.id * 7) % (b.w * 10 - 10)) / 10; a.y = b.y + 0.5 + ((a.id * 3) % (b.h * 10 - 10)) / 10; if (hunger !== undefined) a.hunger = hunger; }
  b.herdCD = 0; b.fedT = 0; E.penDirty();
  return { b, v, herd, ids: herd.map(a => a.id), base: base() };
}
function send(v, b) {
  G.Vg.endTask(v); if (v.ug && G.Caves) G.Caves.exitNow(v); v.sleeping = false; v.inside = 0; v.energy = 95; v.hunger = 10;
  if (v.carry && v.carry.n > 1e-6 && v.carry.k !== 'water') G.Vg.toStore(v, G.Fac.idOfV(v), 'teste');
  const [fx, fy] = V.frontTile(b); v.x = fx + 0.5; v.y = fy + 0.5; v.path = null; v.think = 0;
  return G.Vg.H.workTask(v);
}
const inPen = (a, b) => a.x >= b.x - 0.2 && a.x <= b.x + b.w + 0.2 && a.y >= b.y - 0.2 && a.y <= b.y + b.h + 0.2;
const flock = P => P.ids.map(id => S().animals.get(id)).filter(a => a && !a.dead);
const avgH = L => r2(L.reduce((s, a) => s + a.hunger, 0) / Math.max(1, L.length));
// (one of the flock who died of old age in the case is no beast lost — in the generation 7 the oldest ewe of Birka, of 11,6
// years, dies in the pen in the first minute of the morning, T-268 —; one taken by a wolf, or gone, is. Seen while it lies there:
// a dead beast does not go into the save, and after a load it is simply not in the world)
const OLD = new Set();
const seeOld = P => { for (const id of P.ids) { const a = S().animals.get(id); if (a && a.dead && a.cause === 'old') OLD.add(id); } };
const aged = P => { seeOld(P); return P.ids.filter(id => OLD.has(id)); };
const home = P => { const L = flock(P); const old = aged(P).filter(id => !L.some(a => a.id === id)).length; return { n: L.length, old, all: L.length + old === P.ids.length, pen: L.filter(a => a.state === 'pen').length, inside: L.filter(a => inPen(a, P.b)).length }; };
const oldSaid = H => (H.old ? ` (${H.old} morreu de velhice no caminho do caso)` : '');

// r1 the pasture
{
  const P = setup(0.15, 0.5); const t0 = send(P.v, P.b); const h0 = avgH(P.herd);
  const out = live(90, null, () => P.v.task && P.v.task.type === 'herd' && P.v.task.st === 3);
  const went = flock(P).filter(a => a.state === 'herd' && a.herder === P.v.id).length;
  // (back from the pasture: the herder's own way home, st 4, done — a wolf that makes him fight, or a danger that makes him run,
  // ends the herding for a while, and he takes it up again: in the generation 7 a wolf comes at 0,20, T-268)
  let home4 = false; const fights = new Set();
  const back = live(150, () => { const t = P.v.task; if (t && t.type === 'herd' && t.st === 4) home4 = true; if (t && t.type !== 'herd') fights.add(t.type); }, () => home4 && !(P.v.task && P.v.task.type === 'herd'));
  live(90, null, () => { const H = home(P); return H.pen === H.n && H.inside === H.n; });
  const H = home(P); const h1 = avgH(flock(P)); const bad = newBad(P.base);
  ok('r1', !!t0 && t0.type === 'herd' && out && went + H.old >= P.ids.length && back && H.all && H.pen === H.n && H.inside === H.n && h1 < h0 && S().time < 0.75 && !bad.length,
    `${P.v.name} (${t0 ? t0.type : 'sem tarefa'}): ${went} de ${P.ids.length} foram ao pasto${fights.size ? ` (no meio: ${[...fights].join(', ')})` : ''}; ${back ? 'voltaram' : 'não voltaram'} (hora ${r2(S().time)}); no curral ${H.pen} de ${H.n}${oldSaid(H)} (dentro da cerca ${H.inside}); a fome ${h0} → ${h1}${bad.length ? '; ' + bad.join(' · ') : ''}`);
}
// r2 hay at night
{
  const P = setup(0.86, 0.6); const f = G.Fac.ofV(P.v); if (D.free('f:' + f.id, 'food') < 12) D.make('f:' + f.id, 'food', 12, { code: 'teste', part: true });
  const L0 = seen.length; const t0 = send(P.v, P.b); const h0 = avgH(P.herd);
  live(120, null, () => seen.slice(L0).some(e => e[8] === 'feno' && e[3] === 'v:' + P.v.id));
  live(2);
  const took = r2(seen.slice(L0).filter(e => e[8] === 'feno' && e[3] === 'f:' + f.id && e[4] === 'v:' + P.v.id).reduce((s, e) => s + e[6], 0));
  const ate = r2(seen.slice(L0).filter(e => e[8] === 'feno' && e[3] === 'v:' + P.v.id && e[4] === '@uso').reduce((s, e) => s + e[6], 0));
  const hands = P.v.carry && P.v.carry.hay ? r2(P.v.carry.n) : 0; const h1 = avgH(flock(P)); const bad = newBad(P.base);
  ok('r2', !!t0 && t0.type === 'fodder' && took > 0 && Math.abs(took - ate) < 0.01 && !hands && h1 < h0 && !bad.length,
    `${P.v.name} de noite (${t0 ? t0.type : 'sem tarefa'}): do armazém às mãos ${took} de feno, comido ${ate}, ainda nas mãos ${hands}; a fome ${h0} → ${h1}${bad.length ? '; ' + bad.join(' · ') : ''}`);
}
// r3 shearing, milking, eggs
{
  // (the afternoon: past the hour of the pasture, a flock not hungry — the herder's work is the tending; three of them ready)
  const P = setup(0.5, 0.1); const f = G.Fac.ofV(P.v); const ready = P.herd.filter(a => GIVES[a.kind] && a.grown >= 1).slice(0, 3);
  // (only those three have anything to give: the rest of the flock was tended this morning)
  for (const a of P.herd) if (GIVES[a.kind]) a[GIVES[a.kind]] = 0;
  for (const a of ready) { a[GIVES[a.kind]] = 1.5; a.tended = 0; if (a.kind === 'ovelha') a.shorn = 0; }
  const L0 = seen.length;
  send(P.v, P.b);
  live(300, null, () => ready.every(a => a[GIVES[a.kind]] < 1) && !(P.v.carry && P.v.carry.n > 1e-6));
  const made = {}, sent = {}; const L = seen.slice(L0);
  for (const e of L) { if (e[3] === '@mundo' && e[4] === 'v:' + P.v.id && ['tosquia', 'ordenha', 'ovos'].includes(e[8])) made[e[5]] = r2((made[e[5]] || 0) + e[6]); if (e[3] === 'v:' + P.v.id && String(e[4]).startsWith('f:') && e[8] === 'entrega') sent[e[5]] = r2((sent[e[5]] || 0) + e[6]); }
  const given = ready.filter(a => a[GIVES[a.kind]] < 1).length; const bad = newBad(P.base);
  const same = Object.keys(made).length > 0 && Object.keys(made).every(k => Math.abs((sent[k] || 0) - made[k]) < 0.01);
  ok('r3', ready.length > 0 && given === ready.length && same && !(P.v.carry && P.v.carry.n > 1e-6) && !bad.length,
    `${ready.length} bicho(s) prontos (${[...new Set(ready.map(a => a.kind))].join(', ')}): deram ${given}; nasceu nas mãos pelo livro ${JSON.stringify(made)}, ao armazém ${JSON.stringify(sent)}; ${f ? '' : 'sem povo; '}nas mãos no fim ${P.v.carry ? r2(P.v.carry.n) + ' de ' + P.v.carry.k : 'nada'}${bad.length ? '; ' + bad.join(' · ') : ''}`);
}
// r4 a save with the flock out at pasture
{
  const P = setup(0.15, 0.5); send(P.v, P.b);
  const out = live(90, null, () => P.v.task && P.v.task.type === 'herd' && P.v.task.st === 3); live(4);
  const went = flock(P).filter(a => a.state === 'herd').length;
  seeOld(P); M.salvarCarregar(); G.inSim = Math.max(G.inSim, 1);
  P.b = S().buildings.get(PEN);
  live(120, null, () => { const H = home(P); return H.pen === H.n && H.inside === H.n; });
  const H = home(P); const bad = newBad(P.base);
  ok('r4', out && went > 0 && H.all && H.pen === H.n && H.inside === H.n && !bad.length,
    `save com ${went} no pasto: depois do load, no curral ${H.pen} de ${H.n}${oldSaid(H)} (dentro da cerca ${H.inside})${bad.length ? '; ' + bad.join(' · ') : ''}`);
}
// r5 the herder dies at pasture
{
  const P = setup(0.15, 0.5); send(P.v, P.b);
  const out = live(90, null, () => P.v.task && P.v.task.type === 'herd' && P.v.task.st === 3); live(4);
  const went = flock(P).filter(a => a.state === 'herd').length; V.kill(P.v, 'wolf');
  live(120, null, () => { const H = home(P); return H.pen === H.n && H.inside === H.n; });
  const H = home(P); const bad = newBad(P.base);
  ok('r5', out && went > 0 && H.all && H.pen === H.n && H.inside === H.n && !bad.length,
    `${P.v.name} morreu com ${went} no pasto: no curral ${H.pen} de ${H.n}${oldSaid(H)} (dentro da cerca ${H.inside})${bad.length ? '; ' + bad.join(' · ') : ''}`);
}
// r6 no grass near: the herder does not lead the flock to bare ground, and the hay comes (L-396: the pastor of a city's pen led
// the flock to the bare streets round it, and it came back hungrier than it went). The world's barest pen; in a world whose
// pens all have grass round them, the case's pen with the grass round it gone — the god's hand, a drought there: the case is
// the herder's choice, not where the world has a pen without grass
{
  const P = setup(0.15, 0.6, BARE || PEN); const f = G.Fac.ofV(P.v); if (D.free('f:' + f.id, 'food') < 12) D.make('f:' + f.id, 'food', 12, { code: 'teste', part: true });
  // (the grass is made by the beasts' first step after a load — S.veg does not go into the save —: a tenth of a second first)
  if (!BARE) { M.viver(0.1); const cx = P.b.x + P.b.w / 2, cy = P.b.y + P.b.h / 2; for (let y = Math.floor(cy - 15); y <= cy + 15; y++) for (let x = Math.floor(cx - 15); x <= cx + 15; x++) if (G.W.inb(x, y) && Math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= 15) S().veg[G.W.idx(x, y)] = 0; }
  const L0 = seen.length; const t0 = send(P.v, P.b);
  let out = 0, at = null; const hay = live(120, () => { const n = flock(P).filter(a => a.state === 'herd').length; if (n > out) out = n; const t = P.v.task; if (!at && t && t.type === 'herd' && t.px !== undefined) at = [t.px, t.py]; }, () => seen.slice(L0).some(e => e[8] === 'feno' && e[4] === 'v:' + P.v.id));
  const grassAt = p => { let g = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) g += S().veg[G.W.idx(G.clamp(Math.floor(p[0]) + dx, 0, G.N - 1), G.clamp(Math.floor(p[1]) + dy, 0, G.N - 1))]; return r2(g); };
  const bad = newBad(P.base);
  ok('r6', !out && hay && !bad.length, `${V.buildName(P.b)} #${P.b.id} de ${S().settlements.get(P.b.set).name}, ${BARE ? 'sem capim em volta' : `o capim em volta tirado pela mão do deus (${pastures(P.b)} lugares de pasto)`}, o rebanho com fome (0,6): ${P.v.name} (${t0 ? t0.type : 'sem tarefa'}) ${out ? `LEVOU ${out} ao chão sem capim${at ? ` (${r2(at[0])},${r2(at[1])}, capim ${grassAt(at)})` : ''}` : 'não o levou ao pasto'}; o feno ${hay ? 'veio do armazém (\'feno\')' : 'NÃO veio em 120 s'}${bad.length ? '; ' + bad.join(' · ') : ''}`);
}
const er = M.erros();
ok('erros', !Object.keys(er.mod).length && !er.console.length, `módulos: ${JSON.stringify(er.mod)}; console: ${er.console.slice(0, 2).join(' | ') || 'nada'}`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
