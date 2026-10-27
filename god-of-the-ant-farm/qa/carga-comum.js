// carga-comum: as mãos de quem carrega, provocadas de propósito (C1, L-186) — no mundo pronto «metrópole».
//   node qa/carga-comum.js
// (em Node). A carga comum (lenha, frutas, pedra: sem operação, sem destino) vai ao armazém do povo; nunca fica dias nas
// mãos de uma criança, e nunca some debaixo de outra coisa.
// m1 a criança com carga ao anoitecer dorme com ela, e de manhã o primeiro afazer a leva ao armazém; m2 de dia, a carga vai
// ao seu lugar antes da brincadeira; m3 a colheita com as mãos cheias do mesmo bem soma (o que estava nelas e o que veio do
// arbusto chegam juntos, pelo livro); m4 com outro bem nas mãos, a colheita não escreve por cima: as frutas ficam no
// arbusto e o que estava nas mãos vai ao armazém (e o verificador vê a colheita com as mãos ocupadas); m5 a fruta e o mel,
// idem; m6 o mariscar, idem; m7 save/load no meio — a criança indo ao armazém, e dormindo com a carga —: a carga chega;
// m8 a criança morre no meio: a carga vai ao estoque do povo pelo livro ('herdado'), não some com ela; m9 a tripulação de
// uma expedição guarda a carga no armazém antes do cais; m10 o verificador vê a carga parada nas mãos de uma criança de
// dia; m11 quem desce à mina com carga nas mãos sobe com ela: o achado da caverna não escreve por cima (L-202); e o
// verificador limpo, sem erro de módulo. Quem o caso precisa (a criança, o arbusto, a árvore, a colmeia, a praia
// na maré baixa, o povo do mar) vem pela regra; sem um que sirva, o caso falha dizendo o que falta.
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js', 'js/possess.js', 'qa/atividades-inv.js'] });
const fails = []; const mid = []; // (what the checker saw in the middle of a case: the case fails, even if the end looks clean)
const ok = (name, c, info) => { const m = mid.splice(0); const pass = c && !m.length; console.log(`${pass ? 'PASSOU' : 'FALHOU'} | carga comum ${name} | ${info}${m.length ? ' — o verificador, no meio do caso: ' + m.slice(0, 2).join(' · ') : ''}`); if (!pass) fails.push(name); };
const others = new Map();
// (one look of the checker: what weighs — the activities' rules and the numbers, S0 to S2 — and the two rules of L-186, S3)
let l186 = [];
const look = () => { const q = QA.check(); l186 = q.filter(x => /L-186/.test(x.msg)); return q.filter(x => x.sev <= 2).filter(x => { if (x.sys === 'act' || x.sys === 'nan') return true; others.set(x.msg, (others.get(x.msg) || 0) + 1); return false; }); };
const watch = () => { const bb = look(); for (const q of bb) if (!mid.includes(q.msg)) mid.push(q.msg); return bb.length > 0; };
const D = G.Depot, Fl = G.Flora;
const r2 = x => Math.round(x * 100) / 100;
let S;
// (the world lives while the case waits; the checker looks every half second)
const live = (sec, until) => { for (let k = 0; k < sec * 10; k++) { M.viver(0.1); if (k % 5 === 4 && watch()) return false; if (until && until()) return true; } return false; };
// the ledger's lines, as they are written (a long case outlives the ledger's window of the last lines)
const lines = []; D.onMove.push(e => lines.push(e));
const outOf = (id, n0) => lines.slice(n0).filter(e => e[3] === 'v:' + id);
const sum = L => r2(L.reduce((a, e) => a + e[6], 0));
const hands = v => (v && v.carry && v.carry.n > 1e-6 ? `${r2(v.carry.n)} de ${v.carry.k}${v.carry.op || v.carry.to || v.carry.cid ? ' (marcada)' : ''}` : 'nada');
const nm = v => `${v.name} (${Math.floor(v.age)} anos)`;
// who the case needs, by the rule: free (not the god's body, not at sea, not in a cell), well, with a home and a store of
// the people, the hands empty; the first by id, past the ones taken
const used = new Set();
const storeIn = v => { const d = G.Village.nearestDropoff(v.x, v.y, v.set); return !!d && G.W.reaches(v, ...G.Village.frontTile(d)); };
// (a calm town: no festival, assembly, levy, fire or execution calling its people — the world's call would take the person
// from the case, and the load with it)
const GATHER = { justice: 1, assembly: 1, fest: 1, muster: 1, fire: 1 };
const calm = id => { let n = 0; for (const o of S.villagers.values()) if (o.set === id && o.task && GATHER[o.task.type]) n++; return n < 3 && !(S.execs || []).some(e => e.set === id && e.phase === 'wait'); };
const free = v => !v.captive && !v.jail && !v.aboard && !v.ug && !v.held && !v.air && !(S.avatar && S.avatar.id === v.id) && v.hp > 50 && v.home && storeIn(v) && calm(v.set);
function person(min, max, pred) {
  const v = [...S.villagers.values()].filter(o => o.age >= min && o.age < max && free(o) && !used.has(o.id) && !(o.carry && o.carry.n > 1e-6) && (!pred || pred(o))).sort((a, b) => a.id - b.id)[0];
  if (v) used.add(v.id); return v || null;
}
// (the test's hand: a load in the hands — through the ledger —, rested and fed, the errand of before forgotten)
function give(v, k, n) {
  G.Vg.endTask(v); if (v.carry && v.carry.n > 1e-6) D.use('v:' + v.id, v.carry.k, v.carry.n, { code: 'teste', mine: true });
  D.make('v:' + v.id, k, n, { code: 'teste' }); v.hunger = Math.min(v.hunger, 20); v.energy = Math.max(v.energy, 75); v._noStore = 0;
  return !!(v.carry && v.carry.k === k && Math.abs(v.carry.n - n) < 1e-6);
}
const bushNear = v => [...S.bushes.values()].filter(b => b.berries >= 2 && !(b.claim && S.villagers.has(b.claim)) && G.dist(v.x, v.y, b.x, b.y) < 20 && G.W.reaches(v, b.x, b.y)).sort((a, b) => G.dist2(a.x, a.y, v.x, v.y) - G.dist2(b.x, b.y, v.x, v.y))[0] || null;
const store = v => 'f:' + G.Fac.idOfV(v);

M.pronto('metropole'); S = G.S; M.viver(2); G.inSim++;
S.weather.storm = 0;

// ---------------- m1: a child with a load at nightfall sleeps with it; in the morning the first errand takes it to the store
{
  S.time = 0.74; // (the night has come: the bed takes the child before the store — the errand that took the load is cut)
  const v = person(10, 14.5);
  if (!v || !give(v, 'wood', 2)) ok('m1 a criança com carga ao anoitecer', false, v ? `${nm(v)} não aguenta 2 de lenha nas mãos` : 'nenhuma criança livre de 10 a 14 anos com casa e armazém do povo');
  else {
    const n0 = lines.length; let slept = false, woke = null, at = null;
    live(150, () => {
      if (!slept && v.sleeping && v.carry && v.carry.k === 'wood') slept = true;
      if (slept && woke === null && !v.sleeping) woke = S.clock;
      at = outOf(v.id, n0).find(e => e[5] === 'wood' && e[8] === 'entrega');
      return !!at || !S.villagers.has(v.id);
    });
    const dt = at && woke !== null ? r2(S.clock - woke) : null;
    ok('m1 a criança com carga ao anoitecer', slept && woke !== null && !!at && at[4] === store(v) && at[6] === 2 && dt <= 30 && !look().length,
      `${nm(v)} com 2 de lenha às 0,74: ${slept ? 'dormiu com ela' : 'NÃO dormiu com ela'}; ${woke === null ? 'NÃO acordou' : 'acordou'}; ${at ? `de manhã levou-a ao armazém (${at[8]}, ${at[6]} para ${at[4]}, ${dt} s depois de acordar)` : `NÃO a levou (nas mãos: ${hands(v)}, ${v.task ? v.task.type : 'sem afazer'})`}`);
  }
}
// ---------------- m2: by day, the load goes to its place before play
{
  S.time = 0.3;
  const v = person(10, 14.5);
  if (!v || !give(v, 'wood', 2)) ok('m2 de dia, antes da brincadeira', false, v ? `${nm(v)} não aguenta 2 de lenha` : 'nenhuma criança livre de 10 a 14 anos');
  else {
    G.Vg.setTask(v, { type: 'play', pri: 0.1, kind: 'play' }); v.think = 0;
    const n0 = lines.length, t0 = S.clock; const seen = [];
    const went = live(60, () => { const ty = v.task ? v.task.type : '-'; if (seen[seen.length - 1] !== ty) seen.push(ty); return outOf(v.id, n0).some(e => e[5] === 'wood' && e[8] === 'entrega'); });
    const e = outOf(v.id, n0).find(q => q[5] === 'wood');
    ok('m2 de dia, antes da brincadeira', went && seen.indexOf('deliver') >= 0 && seen.indexOf('deliver') <= 2 && e[4] === store(v) && !look().length,
      `${nm(v)} brincando com 2 de lenha nas mãos: ${went ? `em ${r2(S.clock - t0)} s a lenha foi ao armazém (${e[8]}, ${e[6]} para ${e[4]})` : `NÃO foi (nas mãos: ${hands(v)})`}; afazeres: ${seen.join(' → ')}`);
  }
}
// ---------------- m3: gathering with the hands full of the same good: the berries are added
{
  S.time = 0.3;
  const v = person(12, 14.5, bushNear); const b = v && bushNear(v);
  if (!v || !b || !give(v, 'food', 1)) ok('m3 a colheita soma o mesmo bem', false, v ? `${nm(v)}: sem arbusto ao alcance, ou não aguenta 1 de comida` : 'nenhuma criança de 12 a 15 anos com um arbusto com frutas ao alcance');
  else {
    b.claim = v.id; G.Vg.setTask(v, { type: 'gather', id: b.id, pri: 1 });
    const n0 = lines.length, b0 = b.berries; let held = null;
    const got = live(60, () => { if (b.berries < b0 && held === null) held = v.carry && v.carry.k === 'food' ? v.carry.n : 0; return held !== null; });
    const picked = r2(b0 - b.berries);
    const home = live(90, () => outOf(v.id, n0).some(e => e[5] === 'food' && e[8] === 'entrega'));
    const out = outOf(v.id, n0).filter(e => e[5] === 'food');
    ok('m3 a colheita soma o mesmo bem', got && picked > 0 && Math.abs(held - (1 + picked)) < 1e-6 && home && Math.abs(sum(out) - (1 + picked)) < 1e-6 && !look().length,
      `${nm(v)} com 1 de comida nas mãos, mandado(a) colher: ${got ? `colheu ${picked} do arbusto e ficou com ${r2(held)} nas mãos (1 + ${picked})` : 'NÃO colheu'}; ${home ? `levou ${sum(out)} ao armazém (${out.map(e => e[8] + ' ' + e[6]).join(', ')})` : `NÃO levou (nas mãos: ${hands(v)})`}`);
  }
}
// ---------------- m4: with another good in the hands, the gathering does not write over it
{
  S.time = 0.3;
  const v = person(10, 14.5, bushNear); const b = v && bushNear(v);
  if (!v || !b || !give(v, 'wood', 2)) ok('m4 a colheita não escreve por cima', false, v ? `${nm(v)}: sem arbusto ao alcance, ou não aguenta 2 de lenha` : 'nenhuma criança de 10 a 15 anos com um arbusto com frutas ao alcance');
  else {
    b.claim = v.id; G.Vg.setTask(v, { type: 'gather', id: b.id, pri: 1 });
    const n0 = lines.length, b0 = b.berries; let saw = '';
    const went = live(90, () => { if (!saw) { look(); const q = l186.find(x => x.msg.includes('#' + v.id + ':') && x.msg.includes('gather')); if (q) saw = q.msg; } return outOf(v.id, n0).some(e => e[5] === 'wood' && e[8] === 'entrega'); });
    const food = outOf(v.id, n0).filter(e => e[5] === 'food');
    ok('m4 a colheita não escreve por cima', went && b.berries === b0 && !food.length && !!saw && !look().length,
      `${nm(v)} com 2 de lenha nas mãos, mandado(a) colher: o arbusto ${b.berries === b0 ? `ficou com as suas ${b0} frutas` : `PERDEU ${r2(b0 - b.berries)}`}; ${went ? 'a lenha foi ao armazém' : `a lenha NÃO foi (nas mãos: ${hands(v)})`}${food.length ? `; comida das mãos: ${sum(food)}` : ''}; o verificador: ${saw ? '«' + saw + '»' : 'NÃO viu a colheita com as mãos ocupadas'}`);
  }
}
// ---------------- m5: the fruit and the honey, the same
{
  S.time = 0.3;
  // (a tree with fruit anywhere in the world, and a grown-up of a people who walks to it — brought beside it by the test's
  // hand: the case is the hands, not the walk)
  const trees = Fl ? [...S.trees.values()].filter(q => Fl.KIND[q.kind] && q.stage === 'grow' && q.fruit >= 1 && !(q.claim && S.villagers.has(q.claim))).sort((a, b) => a.id - b.id) : [];
  const beside = q => { for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) if (G.W.walkableXY(q.x + dx, q.y + dy)) return [q.x + dx + 0.5, q.y + dy + 0.5]; return null; };
  // (one the world calls away before the case ends — the cave's errand, of 1,6, took one for eighty seconds; the night put
  // the next to bed — gives it to another, by day, at the next tree or hive, up to three: the case is the hands, not the call)
  const calledAway = (o, own) => !!(o.task && o.task.type !== own && o.task.type !== 'deliver' && (o.task.pri || 0) > 1);
  const away = [];
  let info = trees.length ? `nenhum adulto livre alcança as ${trees.length} árvores com fruta` : 'nenhuma árvore com fruta no mundo', fine = false;
  for (let a = 0, i0 = 0; a < 3 && !fine; a++) {
    S.time = 0.3;
    let tr = null, v = null;
    for (; i0 < trees.length && !v; i0++) { const q = trees[i0]; if (!(q.fruit >= 1) || (q.claim && S.villagers.has(q.claim))) continue; const p = beside(q); if (!p) continue; v = person(16, 60, o => G.W.reaches(o, p[0], p[1]) && G.dist(o.x, o.y, p[0], p[1]) < 60); if (v) { tr = q; v.x = p[0]; v.y = p[1]; v.path = null; } }
    if (!v || !tr || !give(v, 'stone', 2)) break;
    const K = Fl.KIND[tr.kind];
    tr.claim = v.id; G.Vg.setTask(v, { type: 'pick', id: tr.id, pri: 1, st: 0 });
    const n0 = lines.length, f0 = tr.fruit; let cut = '';
    const went = live(120, () => { if (calledAway(v, 'pick')) cut = v.task.type; return !!cut || outOf(v.id, n0).some(e => e[5] === 'stone' && e[8] === 'entrega'); });
    if (cut) { away.push(`${nm(v)} chamad${v.g === 'f' ? 'a' : 'o'} para ${cut}`); continue; }
    const fr = outOf(v.id, n0).filter(e => e[5] === (K.good || 'food'));
    fine = went && tr.fruit === f0 && !fr.length;
    info = `${nm(v)} com 2 de pedra nas mãos, mandado(a) a ${K.name}: a árvore ${tr.fruit === f0 ? 'ficou com as suas frutas' : `PERDEU ${r2(f0 - tr.fruit)}`}; ${went ? 'a pedra foi ao armazém' : `a pedra NÃO foi (nas mãos: ${hands(v)})`}`;
    break;
  }
  // (a hive with honey anywhere, and a grown-up who walks to it, brought beside it)
  const hives = (S.hives || []).filter(q => q.honey >= 1.5 && !(q.sting > 0) && !(q.claim && S.villagers.has(q.claim))).sort((a, b) => a.id - b.id);
  let infoH = hives.length ? `nenhum adulto livre alcança as ${hives.length} colmeias com mel` : 'nenhuma colmeia com mel no mundo', fineH = false;
  for (let a = 0, i0 = 0; a < 3 && !fineH; a++) {
    S.time = 0.3;
    let h = null, w = null;
    for (; i0 < hives.length && !w; i0++) { const q = hives[i0]; if (!(q.honey >= 1.5) || q.sting > 0 || (q.claim && S.villagers.has(q.claim))) continue; const p = beside({ x: Math.floor(q.x), y: Math.floor(q.y) }); if (!p) continue; w = person(16, 60, o => G.W.reaches(o, p[0], p[1]) && G.dist(o.x, o.y, p[0], p[1]) < 60); if (w) { h = q; w.x = p[0]; w.y = p[1]; w.path = null; } }
    if (!w || !h || !give(w, 'mel', 1)) break;
    h.claim = w.id; G.Vg.setTask(w, { type: 'honey', id: h.id, pri: 1, st: 0 });
    const n0 = lines.length; const h0 = h.honey; let held = null, cut = '';
    live(90, () => { if (held === null && h.honey < h0) held = w.carry && w.carry.k === 'mel' ? w.carry.n : 0; if (held === null && calledAway(w, 'honey')) cut = w.task.type; return held !== null || !!cut || !S.villagers.has(w.id); });
    if (cut) { away.push(`${nm(w)} chamad${w.g === 'f' ? 'a' : 'o'} para ${cut}`); continue; }
    const raided = r2(h0 - h.honey); const got = held !== null ? r2(held - 1) : 0;
    const home = live(240, () => outOf(w.id, n0).some(e => e[5] === 'mel' && (e[8] === 'entrega' || e[8] === 'herdado')) || !S.villagers.has(w.id));
    const out = outOf(w.id, n0).filter(e => e[5] === 'mel');
    fineH = held !== null && got >= 1 && home && Math.abs(sum(out) - r2(held)) < 1e-6;
    infoH = `${nm(w)} com 1 de mel nas mãos, à colmeia: ${held !== null ? `tirou ${raided} da colmeia e ficou com ${r2(held)} nas mãos (1 + ${got})` : 'NÃO tirou mel'}; ${home ? `levou ${sum(out)} ao armazém` : `NÃO levou (nas mãos: ${hands(w)})`}`;
    break;
  }
  ok('m5 a fruta e o mel', fine && fineH && !look().length, info + ' · ' + infoH + (away.length ? ` (antes: ${away.join('; ')})` : ''));
}
// ---------------- m6: the flats at low water, the same
{
  // (the low water of the day: the tide's own clock, at the start of its ebb)
  const frac = x => x - Math.floor(x);
  const ebb = () => { const t0 = frac((0.36 - frac(S.day * 0.13)) / 2); S.time = t0 < 0.08 ? t0 + 0.5 : t0; };
  const spotFor = o => G.Sea && G.Sea.lowTide() && G.Sea.shellSpot(o.x, o.y, 18);
  let info = '', fine = false; const away = []; let sp0 = null;
  // (one the world calls away from the flats before the catch — the cave's errand, of 1,3, took one for fifty seconds and
  // the tide came back — gives the case to another, at the next ebb, on the same flats, up to three: the case is the hands,
  // not the call)
  for (let a = 0; a < 3 && !fine && !info; a++) {
    ebb();
    // (the first by id with flats in reach — or, after a call, anyone on the same flats — who can hold the two of wood)
    let v = null, sp = null;
    for (let g = 0; g < 6 && !v; g++) {
      let o = person(16, 60, spotFor), q = o && spotFor(o);
      if (!o && sp0 && G.Sea.lowTide()) { o = person(16, 60); q = o && sp0; }
      if (!o) break;
      if (q && give(o, 'wood', 2)) { v = o; sp = q; }
    }
    if (!v) { info = `nenhum adulto com mariscos ao alcance na maré baixa (maré ${G.Sea ? r2(G.Sea.tide()) : '?'})`; break; }
    sp0 = sp0 || sp;
    // (brought to the beach by the test's hand: the ebb does not wait for a long walk)
    if (G.W.walkableXY(sp.x, sp.y)) { v.x = sp.x; v.y = sp.y; v.path = null; }
    G.Vg.setTask(v, { type: 'mariscar', x: sp.x, y: sp.y, wx: sp.wx, wy: sp.wy, rock: sp.rock, pri: 1 });
    const n0 = lines.length; let caught = 0, cut = '';
    const went = live(120, () => {
      if (v.task && v.task.type === 'mariscar' && v.task.got) caught = v.task.got;
      if (!caught && v.task && v.task.type !== 'mariscar' && v.task.type !== 'deliver' && (v.task.pri || 0) > 1) cut = v.task.type;
      return !!cut || outOf(v.id, n0).some(e => e[5] === 'wood' && e[8] === 'entrega');
    });
    if (cut) { away.push(`${nm(v)} chamad${v.g === 'f' ? 'a' : 'o'} para ${cut}`); continue; }
    const food = outOf(v.id, n0).filter(e => e[5] === 'food');
    fine = went && caught > 0 && !food.length;
    info = `${nm(v)} com 2 de lenha nas mãos, na maré baixa: ${caught ? `achou ${caught} de mariscos, que ficaram na água` : 'NÃO achou mariscos'}; ${went ? 'a lenha foi ao armazém' : `a lenha NÃO foi (nas mãos: ${hands(v)})`}${food.length ? `; comida das mãos: ${sum(food)}` : ''}`;
  }
  if (!info) info = 'ninguém ficou na praia até achar mariscos';
  if (away.length) info += ` (antes: ${away.join('; ')} antes de achar)`;
  ok('m6 o mariscar', fine && !look().length, info);
}
// ---------------- m7: a save in the middle — the child on the way to the store, and the child asleep with its load —: the load gets there
{
  S.time = 0.3;
  const a = person(10, 14.5); const b = person(10, 14.5);
  if (!a || !b || !give(a, 'wood', 2)) ok('m7 save/load no meio', false, a ? `${nm(a)} não aguenta a lenha` : 'faltam duas crianças livres de 10 a 14 anos');
  else {
    G.Vg.setTask(a, { type: 'deliver', pri: 1 });
    live(20, () => a.task && a.task.type === 'deliver' && a.task.st === 1);
    const stA = a.task ? `${a.task.type}.${a.task.st}` : 'sem afazer';
    const ida = a.id, idb = b.id, n0 = lines.length;
    const str = G.Save.serialize(); G.Save.apply(JSON.parse(str)); G.Main.mode = 'game'; S = G.S;
    const a2 = S.villagers.get(ida); const heldA = a2 ? hands(a2) : 'ninguém';
    const goneA = live(90, () => outOf(ida, n0).some(e => e[5] === 'wood' && e[8] === 'entrega'));
    // (b: at night, in bed with the load)
    let b2 = S.villagers.get(idb); S.time = 0.745; const gotB = !!b2 && give(b2, 'wood', 1); if (b2) b2.think = 0;
    live(60, () => b2 && b2.sleeping); // (home first, then the bed)
    const asleep = !!(b2 && b2.sleeping && b2.carry && b2.carry.k === 'wood');
    const n1 = lines.length; const str2 = G.Save.serialize(); G.Save.apply(JSON.parse(str2)); G.Main.mode = 'game'; S = G.S;
    const goneB = live(150, () => outOf(idb, n1).some(e => e[5] === 'wood' && e[8] === 'entrega'));
    ok('m7 save/load no meio', !!a2 && heldA === '2 de wood' && goneA && gotB && asleep && goneB && !look().length,
      `${nm(a2 || a)} salvo(a) no caminho do armazém (${stA}), com ${heldA} depois do load: ${goneA ? 'chegou ao armazém' : 'NÃO chegou'}; ${nm(b)} salvo(a) dormindo com a lenha (${asleep ? 'sim' : 'NÃO'}): ${goneB ? 'de manhã a levou ao armazém' : `NÃO levou (nas mãos: ${hands(S.villagers.get(idb))})`}`);
  }
}
// ---------------- m8: the child dies in the middle: the load goes to the people's store, in the ledger
{
  S.time = 0.3;
  const v = person(10, 14.5);
  if (!v || !give(v, 'wood', 2)) ok('m8 a criança morre no meio', false, 'nenhuma criança livre de 10 a 14 anos que aguente a lenha');
  else {
    // (on the way to the store, the load still in the hands: the death a moment after the errand began)
    G.Vg.setTask(v, { type: 'deliver', pri: 1 }); M.viver(0.1);
    const n0 = lines.length, f = store(v), was = D.get(f, 'wood'), id = v.id, held = v.carry && v.carry.k === 'wood' ? v.carry.n : 0;
    G.Village.kill(v, 'old');
    const out = outOf(id, n0);
    // (the store gets at least what the ledger says she left it: the same death can open a new cemetery, and the clearing of
    // its ground puts wood in the store too, the old economy's way, with no line — in the world of the later fixes, three)
    const inStore = r2(D.get(f, 'wood') - was); const left = sum(out.filter(e => e[8] === 'herdado'));
    ok('m8 a criança morre no meio', held === 2 && !S.villagers.has(id) && Math.abs(sum(out) - 2) < 1e-6 && out.every(e => e[8] === 'herdado' || e[8] === 'sem-lugar') && inStore >= left - 1e-6 && !look().length,
      `${nm(v)} morreu com ${held} de lenha nas mãos: ${out.length ? out.map(e => `${e[8]} ${e[6]} para ${e[4]}`).join(', ') : 'NENHUM lançamento — a lenha sumiu com ela'}; o estoque do povo ganhou ${inStore}${inStore > left + 1e-6 ? ` (${r2(inStore - left)} de outra coisa no mesmo instante)` : ''}`);
  }
}
// ---------------- m9: an expedition's crew puts the load in the store before the quay
{
  S.time = 0.25;
  const X = G.Expe; let e = null; const tried = [];
  for (const f of [...S.factions.values()].filter(q => q.alive && G.Civ.has(q.id, 'navegacao')).sort((a, b) => a.id - b.id)) {
    if (!X || e) break;
    // (the people's own reasons first; with none today, the god's word: a voyage toward the middle of the sea)
    e = X.consider(f, { many: true }) || X.launch(f, { k: 'terra', w: 1, why: 'terra', txt: '', x: G.N / 2, y: G.N / 2 }, 'media', {});
    tried.push(f.name + (e ? '' : ' (não)'));
  }
  const crew = e ? e.crew.map(id => S.villagers.get(id)).filter(v => v && v.task && v.task.type === 'cais' && !v.aboard && !(S.avatar && S.avatar.id === v.id)) : [];
  const v = crew.find(q => !(q.carry && q.carry.n > 1e-6)) || null;
  if (!e || !v) ok('m9 a tripulação guarda a carga antes do cais', false, e ? `a expedição ${e.name} sem tripulante livre no cais` : `nenhum povo do mar lançou uma expedição (${tried.join(', ') || 'nenhum com navegação'})`);
  else {
    D.make('v:' + v.id, 'minerio', 1, { code: 'teste' });
    const n0 = lines.length; const seen = [];
    const went = live(120, () => { const ty = v.task ? v.task.type : '-'; if (seen[seen.length - 1] !== ty) seen.push(ty); return outOf(v.id, n0).some(e2 => e2[5] === 'minerio') || v.aboard; });
    const out = outOf(v.id, n0).find(e2 => e2[5] === 'minerio');
    ok('m9 a tripulação guarda a carga antes do cais', went && !!out && out[8] === 'entrega' && out[4] === store(v) && !look().length,
      `${v.name}, da tripulação de ${e.name}, chamado(a) ao cais com 1 de minério nas mãos: ${out ? `${out[8]} ${out[6]} para ${out[4]}` : `NÃO guardou (${v.aboard ? 'embarcou com ele' : 'nas mãos: ' + hands(v)})`}; afazeres: ${seen.join(' → ')}`);
  }
}
// ---------------- m10: the checker sees a child's load standing still in the hands by day
{
  // (the test's hand: the child idles a minute and does not stop to think — as under the old childDecide, which never took
  // a load anywhere: an errand that ends sends it to think, and now to the store. A call of the world in the middle — a
  // festival, a levy — takes the child from the idling: the case starts again with another one, up to three times)
  let info = 'nenhuma criança livre de 10 a 14 anos que aguente a lenha', fine = false; const calls = [];
  for (let att = 0; att < 3 && !fine; att++) {
    S.time = 0.3;
    const v = person(10, 14.5); if (!v || !give(v, 'wood', 2)) break;
    G.Vg.setTask(v, { type: 'idle', pri: 0.2, wait: 60, kind: 'play' }); v.think = 1e9;
    let saw = '', called = '';
    live(45, () => { if (!v.task || v.task.type !== 'idle') { called = v.task ? v.task.type : 'sem afazer'; return true; } look(); const q = l186.find(x => x.msg.includes('#' + v.id + ',')); if (q) saw = q.msg; return !!saw; });
    v.think = 0;
    if (called && !saw) { calls.push(`${v.name}: ${called}`); continue; }
    const n0 = lines.length;
    const went = live(60, () => outOf(v.id, n0).some(e => e[5] === 'wood' && e[8] === 'entrega'));
    fine = !!saw && went;
    info = `${nm(v)} parado(a) com 2 de lenha, sem pensar: ${saw ? '«' + saw + '»' : 'o verificador NÃO viu'}; solto(a), ${went ? 'levou-a ao armazém' : `NÃO a levou (${v.task ? v.task.type : 'sem afazer'}, nas mãos: ${hands(v)})`}${calls.length ? ` (antes, o mundo chamou: ${calls.join(', ')})` : ''}`;
  }
  ok('m10 o verificador vê a carga parada', fine && !look().length, info);
}
// ---------------- m11: the cave's find never writes over the hands (L-202): one sent down a mine with a load in the hands —
// the test's hand gives the shift; the world no longer sends anyone down with something in them — comes up with it: the ore
// stays in the rock, and the load goes to its place
{
  S.time = 0.3;
  const mines = [...S.buildings.values()].filter(b => b.type === 'mina' && b.built && b.ore && (S.ores || []).some(o => o.id === b.ore && o.amt >= 3)).sort((a, b) => a.id - b.id);
  let info = mines.length ? 'nenhum adulto livre de uma cidade com mina que chegue à porta dela' : 'nenhuma mina com minério no mundo', fine = false;
  for (const b of mines) {
    if (!G.Caves || !G.Caves.mineShift) { info = 'o mundo não tem cavernas'; break; }
    const o = S.ores.find(q => q.id === b.ore); const door = G.Vg.door(b);
    const v = person(16, 60, q => q.set === b.set && G.W.reaches(q, door[0], door[1]));
    if (!v || !give(v, 'wood', 2)) continue;
    v.x = door[0]; v.y = door[1]; v.path = null;
    const amt0 = o.amt, n0 = lines.length;
    if (!G.Caves.mineShift(v, b, o)) { info = `${nm(v)}: a mina #${b.id} não deu um turno`; continue; }
    // (what she dug, read in the errand, and the deposit at the step she came up: it gets back what she dug — the mine's other
    // miners dig from it meanwhile, and in a newer world they took 2 while the case lived)
    let up = false, held = '', dug = 0, before = o.amt, back = 0;
    const done = live(150, () => {
      if (!up && v.task && v.task.type === 'caverna' && v.task.carry) dug = v.task.carry.n;
      if (!up && !(v.task && v.task.type === 'caverna')) { up = true; held = hands(v); back = r2(o.amt - before); }
      before = o.amt;
      return up && outOf(v.id, n0).some(e => e[5] === 'wood' && e[8] === 'entrega');
    });
    const wood = outOf(v.id, n0).filter(e => e[5] === 'wood');
    fine = up && held === '2 de wood' && done && Math.abs(sum(wood) - 2) < 1e-6 && dug > 0 && back >= dug - 1e-6;
    info = `${nm(v)} desceu à mina #${b.id} com 2 de lenha nas mãos${dug ? ` e cavou ${dug} de minério` : ', e NÃO cavou'}: ${up ? `subiu com ${held}` : 'NÃO subiu'}; ${done ? `a lenha foi ao armazém (${wood.map(e => e[8] + ' ' + e[6]).join(', ')})` : `a lenha NÃO foi (no livro: ${wood.map(e => e[8] + ' ' + e[6]).join(', ') || 'nada'}; nas mãos: ${hands(v)})`}; o veio ${back >= dug - 1e-6 && dug ? `recebeu de volta os ${dug} na saída` : `NÃO recebeu de volta (${back} na saída)`} (no caso todo, ${r2(o.amt - amt0)})`;
    break;
  }
  ok('m11 a caverna não escreve por cima das mãos', fine && !look().length, info);
}

const e = M.erros();
if (others.size) console.log(`   (o verificador, em outros sistemas, durante o cenário: ${[...others.keys()].slice(0, 6).join(' · ')}${others.size > 6 ? ` · e mais ${others.size - 6}` : ''})`);
ok('limpo', M.limpo() && !look().length, M.limpo() ? 'sem erro de módulo nem aviso no console' : JSON.stringify(e.mod) + ' ' + e.console.slice(0, 4).join(' | '));
console.log(fails.length ? `CARGA COMUM: FALHOU (${fails.join(', ')})` : 'CARGA COMUM: ok');
process.exit(fails.length ? 1 : 0);
