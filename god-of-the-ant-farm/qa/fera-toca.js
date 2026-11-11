// fera-toca: a fera de uma história debaixo do teto de uma caverna, e a que vai embora (L-656).   [ONLY=t1,t4] node qa/fera-toca.js [mundo]
// Um urso que dorme na toca e um bicho que se abriga da tempestade saem de S.animals (ficam na lista da caverna) e voltam de
// manhã ou quando a chuva passa. A história «Fera Rara» só procurava a fera no mundo aberto: contava os dias «sem rastro» com a
// fera dormindo a nove casas da cidade, e o verificador acusava S3 («elenco beast=… não existe em lugar nenhum»). E uma fera
// viva que sai do mundo de vez (o lobo da razia que vai embora, o bicho que o mar leva) ficava no elenco até o turno seguinte da
// história. Agora: quem está numa caverna se acha por G.Caves.guest / G.Animals.find, e a porta de saída (G.Animals.remove)
// avisa as histórias na hora (G.Stories.left).
// A prova arma o caso pela regra do jogo: a fera rara nasce perto de uma cidade (como a receita do painel), a cidade a vê, a
// semente é promovida (St._promote, como o painel); a mão da prova só põe a hora (o entardecer) e segura a tempestade.
// t1 o urso raro dorme na toca: o verificador limpo a cada segundo da noite, a história viva e sem contar dias; de manhã o
//    mesmo urso (a mesma identidade) está de volta;   t2 o mesmo com save e load no meio da noite;
// t3 a fera rara se abriga da tempestade numa caverna, e sai quando a chuva passa;
// t4 a fera viva sai do mundo de vez (G.Animals.remove, a porta do lobo que vai embora): o elenco a solta no mesmo passo, o
//    verificador limpo, a história guarda quem era (data.fled) e acaba «sem rastro» nos dias dela;
// t5 a semente de uma fera que dorme na toca não é jogada fora (valid);   t8 um save de antes (o hóspede só com a espécie, a
//    idade e o nome) ainda carrega, e o urso sai de manhã;
// e o save dos bichos (L-699, achado por esta prova): t2 o urso que dorme na toca volta do load inteiro (o pelo raro, a vida, a
// fome), e a cidade não o «vê» de novo (a.rareSeen vai no save: nenhuma semente nova da mesma fera); t6 o corpo já esfolado
// segue esfolado depois do load (não dá segunda pele); t7 o corpo de um bicho da cidade (um gato) não some no load;
// e nenhum erro.
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const WORLD = process.argv[2] || 'cidade';
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const on = k => !ONLY || ONLY.includes(k);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | fera-toca ${name} | ${info}`); if (!c) fails.push(name); };
const story = id => G.S.saga.stories.find(s => s.id === id);
const said = id => QA.check().filter(q => q.sys === 'story' && q.msg.includes(`história #${id} `)).map(q => `[S${q.sev}] ${q.msg}`);
const clear = () => { const w = G.S.weather; w.storm = 0; w.rain = 0; };
const used = new Set();

// the towns with a cave of the wanted kind near enough for the town to see a beast beside its mouth
function spots(den) {
  const S = G.S; const out = [];
  for (const cv of G.Caves.all()) {
    if (!cv.mouths.length || cv.mine || cv.bandits || (den && !cv.den)) continue; const m = cv.mouths[0];
    for (const set of S.settlements.values()) { if (!G.Fac.get(set.fac) || G.Village.pop(set.id) < 6) continue; const d = G.dist(m.x, m.y, set.cx, set.cy); if (d <= 13.5) out.push({ cv, set, d }); }
  }
  return out.sort((a, b) => used.has(a.cv.id) - used.has(b.cv.id) || a.d - b.d || a.cv.id - b.cv.id);
}
// a rare beast of that kind beside the cave's mouth, seen by the town, its story promoted
function arm(kinds, den, promote) {
  const S = G.S, St = G.Stories;
  for (const { cv, set } of spots(den)) {
    used.add(cv.id); const m = cv.mouths[0]; let spot = null, kind = null;
    for (let g = 0; g < 40 && !spot; g++) {
      const ang = g * 0.7 + cv.id, r = 1.5 + (g % 5);
      const q = G.W.nearestLand(m.x + 0.5 + Math.cos(ang) * r, m.y + 0.5 + Math.sin(ang) * r, 2); if (!q || G.dist(q[0], q[1], set.cx, set.cy) > 14 || G.dist(q[0], q[1], m.x, m.y) > 9) continue;
      const k = kinds.find(x => G.Animals.walkOK({ kind: x }, q[0], q[1])); if (k) { spot = q; kind = k; }
    }
    if (!spot) continue;
    S.time = 0.3; clear();
    const a = G.Animals.spawn(kind, spot[0], spot[1], { morph: 'albino' });
    let sd = null;
    for (let k = 0; k < 30 && !sd && S.animals.has(a.id) && !a.dead; k++) { M.viver(1); sd = S.saga.seeds.find(x => x.type === 'fera-rara' && x.cast && x.cast.beast === a.id); }
    if (!sd) continue;
    if (!promote) return { sd, aid: a.id, cv, set: set.id, kind, town: set.name };
    sd.ripe = 0; let st = null; G.inSim++; try { st = St._promote(sd); } finally { G.inSim--; }
    if (st && st.st === 'ativa' && S.animals.has(a.id) && !a.dead && S.villagers.has(st.protag)) return { sid: st.id, aid: a.id, cv, set: set.id, kind, town: set.name };
  }
  return null;
}
// the evening: the bear goes to its den by the game's own rule (the hand of the proof sets the hour, and walks the bear back
// to the mouth if the afternoon took it beyond the eighteen tiles a bear goes for a den)
function toDen(c) {
  const S = G.S; const a = S.animals.get(c.aid); if (!a) return false; const m = c.cv.mouths[0];
  if (G.dist(a.x, a.y, m.x, m.y) > 16) { const q = G.W.nearestLand(m.x + 0.5, m.y + 1.5, 3); if (q) { a.x = q[0]; a.y = q[1]; } }
  S.time = 0.655; clear();
  for (let k = 0; k < 14 && S.animals.has(c.aid); k++) M.viver(1);
  return !S.animals.has(c.aid) && !!G.Caves.guest(c.aid);
}
// the night lived second by second: what the checker says of the story, and whether the story counted a day without a sign
function night(c, secs) {
  const S = G.S; const bad = []; let counted = 0, lost = 0;
  for (let k = 0; k < secs; k++) {
    M.viver(1); const s = story(c.sid); const w = said(c.sid); if (w.length && bad.length < 3) bad.push(`${k} s: ${w[0]}`);
    if (!s || s.st !== 'ativa') { lost = k + 1; break; }
    if (s.data.gone) counted++;
    if (S.animals.has(c.aid)) break; // (out again: the morning)
  }
  return { bad, counted, lost };
}

M.pronto(WORLD); M.viver(2);
const BEAR = ['bear'];
// (for the storm: a beast the caves shelter — of the land, 0,8 to 1,2 of size — and that the town sees)
const MID = G.Animals.ids.filter(k => { const d = G.Animals.sp({ kind: k }); return d.cls === 'land' && d.size >= 0.95 && d.size <= 1.2 && !d.dom && !d.town && !d.apex && d.diet !== 'carn'; });

// ---------------- t1 the rare bear sleeps in the den ----------------
let c1 = null;
if (on('t1') || on('t2') || on('t4')) {
  c1 = arm(BEAR, true, true);
  if (!c1) ok(`t1 ${WORLD}`, false, 'nenhuma história de fera rara armada com um urso perto de uma toca');
  else if (on('t1')) {
    const slept = toDen(c1);
    if (!slept) ok(`t1 ${WORLD}`, false, `o urso #${c1.aid} não foi dormir na toca #${c1.cv.id} ao entardecer`);
    else {
      const g = G.Caves.guest(c1.aid); const w0 = said(c1.sid);
      const n = night(c1, 110); const s = story(c1.sid); const a = G.S.animals.get(c1.aid);
      ok(`t1 ${WORLD}`, !w0.length && !n.bad.length && !n.lost && !n.counted && !!a && a.id === c1.aid && !a.dead && s && s.st === 'ativa' && s.cast.beast === c1.aid && !G.Caves.guest(c1.aid),
        `${c1.town}, urso #${c1.aid} na toca #${g.cv.id}: o verificador ${w0.length || n.bad.length ? 'acusou: ' + (w0[0] || n.bad[0]) : 'limpo a noite inteira'}; a história ${n.lost ? 'acabou aos ' + n.lost + ' s (' + (s && s.end ? s.end.k : '?') + ')' : 'viva'}, ${n.counted} s contando dias sem rastro; de manhã o urso ${a ? 'de volta com a mesma identidade' : 'NÃO voltou'}`);
    }
  }
}
// ---------------- t2 save and load in the middle of the night ----------------
if (on('t2') && c1 && story(c1.sid) && story(c1.sid).st === 'ativa' && G.S.animals.has(c1.aid)) {
  const slept = toDen(c1);
  if (!slept) ok(`t2 ${WORLD}`, false, `o urso #${c1.aid} não foi dormir na toca ao entardecer`);
  else {
    M.viver(20); const b0 = G.Caves.guest(c1.aid).a; const before = { hp: b0.hp, maxHp: b0.maxHp, hunger: b0.hunger || 0, rareSeen: b0.rareSeen, lifeMul: b0.lifeMul };
    M.salvarCarregar(); c1.cv = G.Caves.all().find(x => x.id === c1.cv.id);
    const g = G.Caves.guest(c1.aid); const s0 = story(c1.sid); const w0 = said(c1.sid);
    const af = g ? { morph: g.a.morph, hp: g.a.hp, maxHp: g.a.maxHp, hunger: g.a.hunger || 0, rareSeen: g.a.rareSeen, lifeMul: g.a.lifeMul } : null; // (as it came from the load)
    const whole = !!af && af.morph === 'albino' && Math.abs(af.hp - before.hp) < 0.2 && af.maxHp === before.maxHp && Math.abs(af.hunger - before.hunger) < 0.02 && af.rareSeen === before.rareSeen && Math.abs(af.lifeMul - before.lifeMul) < 0.01;
    const n = night(c1, 110); const s = story(c1.sid); const a = G.S.animals.get(c1.aid);
    // (and the town does not «see» it again: the same beast gives no second seed)
    M.viver(25); const again = G.S.saga.seeds.filter(x => x.type === 'fera-rara' && x.cast && x.cast.beast === c1.aid).length;
    ok(`t2 ${WORLD}`, whole && s0 && s0.st === 'ativa' && s0.cast.beast === c1.aid && !w0.length && !n.bad.length && !n.lost && !n.counted && !!a && !a.dead && a.morph === 'albino' && !again,
      `depois do load: o urso ${g ? 'segue na toca #' + g.cv.id + (whole ? ', inteiro (pelo ' + af.morph + ', vida ' + af.hp.toFixed(0) + '/' + af.maxHp + ', visto no dia ' + af.rareSeen + ')' : ', MUDADO (pelo ' + af.morph + ', vida ' + af.hp + ' de ' + before.hp + ', fome ' + af.hunger.toFixed(2) + ' de ' + before.hunger.toFixed(2) + ', visto no dia ' + af.rareSeen + ' de ' + before.rareSeen + ')') : 'SUMIU'}, a história ${s0 && s0.st === 'ativa' ? 'viva com ele no elenco' : 'perdida'}; o verificador ${w0.length || n.bad.length ? 'acusou: ' + (w0[0] || n.bad[0]) : 'limpo'}; de manhã ${a ? 'o urso ' + (a.morph === 'albino' ? 'branco' : 'COMUM') + ' de volta' : 'o urso NÃO voltou'}; ${again} semente(s) nova(s) da mesma fera${s && s.st !== 'ativa' ? '; a história acabou (' + (s.end ? s.end.k : '?') + ')' : ''}`);
  }
}
// ---------------- t4 the living beast leaves the world for good ----------------
if (on('t4') && c1 && story(c1.sid) && story(c1.sid).st === 'ativa' && G.S.animals.has(c1.aid)) {
  const S = G.S; S.time = 0.3; clear(); M.viver(1);
  const a = S.animals.get(c1.aid); const d0 = S.day;
  G.inSim++; try { G.Animals.remove(a); } finally { G.inSim--; }
  const s = story(c1.sid); const w0 = said(c1.sid); const let0 = !s.cast.beast && s.data.fled === c1.aid;
  const bad = []; let endDay = -1;
  for (let k = 0; k < 900 && story(c1.sid).st === 'ativa'; k++) { M.viver(1); if (k % 5 === 0) { const w = said(c1.sid); if (w.length && bad.length < 3) bad.push(w[0]); } }
  const s2 = story(c1.sid); if (s2.st === 'fim') endDay = S.day;
  ok(`t4 ${WORLD}`, let0 && !w0.length && !bad.length && s2.st === 'fim' && s2.end && s2.end.k === 'esquecida' && endDay - d0 >= 2 && endDay - d0 <= 4,
    `a fera saiu do mundo pela porta: o elenco ${let0 ? 'a soltou no mesmo passo (data.fled = ' + s.data.fled + ')' : 'NÃO a soltou (beast=' + s.cast.beast + ')'}; o verificador ${w0.length || bad.length ? 'acusou: ' + (w0[0] || bad[0]) : 'limpo'}; a história ${s2.st === 'fim' ? 'acabou «' + (s2.end ? s2.end.k : '?') + '» ' + (endDay - d0) + ' dia(s) depois' : 'NÃO acabou em 900 s'}`);
}
// ---------------- t3 out of the storm, under a cave's roof ----------------
if (on('t3')) {
  const S = G.S; S.time = 0.3; clear();
  const c = arm(MID, false, true);
  if (!c) ok(`t3 ${WORLD}`, false, 'nenhuma história de fera rara armada perto de uma caverna');
  else {
    // (the hand of the proof holds the storm. The game sends to the mouth five of the beasts within twelve tiles, in the order of
    // the world's list — the newest last —: if the cave filled before its turn, the hand gives it the place, and the game does
    // the rest: the walk to the mouth, the roof, the way out)
    const bad = []; let inside = -1, counted = 0, hand = 0;
    for (let k = 0; k < 150; k++) {
      S.weather.storm = 30; S.weather.rain = 0.9; if (S.time > 0.55) S.time = 0.3;
      const a = S.animals.get(c.aid); const m = c.cv.mouths[0];
      // (the storm scares it far: the hand walks it back within the twelve tiles, on ground it stands on)
      if (a && !a.shelter && G.dist(a.x, a.y, m.x, m.y) > 11) { const q = G.W.nearestLand(m.x + 0.5, m.y + 2.5, 3); if (q && G.Animals.walkOK(a, q[0], q[1])) { a.x = q[0]; a.y = q[1]; } }
      if (a && !a.shelter && k >= 12 && !hand) { a.shelter = c.cv.id; hand = 1; }
      M.viver(1); const s = story(c.sid); const w = said(c.sid); if (w.length && bad.length < 3) bad.push(`${k} s: ${w[0]}`);
      if (!s || s.st !== 'ativa') break;
      if (!S.animals.has(c.aid)) { if (inside < 0) inside = k; if (s.data.gone) counted++; if (k - inside > 40) break; }
      else if (a && a.dead) break;
    }
    const g = G.Caves.guest(c.aid); const sIn = story(c.sid);
    clear(); let out = -1; for (let k = 0; k < 20 && out < 0; k++) { M.viver(1); if (G.S.animals.has(c.aid)) out = k; }
    const w1 = said(c.sid); const s = story(c.sid);
    ok(`t3 ${WORLD}`, inside >= 0 && !!g && !bad.length && !counted && sIn && sIn.st === 'ativa' && out >= 0 && !w1.length && s && s.st === 'ativa' && s.cast.beast === c.aid,
      `${c.town}, ${c.kind} #${c.aid}: ${inside >= 0 ? 'abrigou-se aos ' + inside + ' s na caverna #' + (g ? g.cv.id : '?') + (hand ? ' (o lugar dado pela mão da prova)' : ' (escolhida pelo jogo)') : 'NÃO se abrigou em 150 s de tempestade'}; o verificador ${bad.length || w1.length ? 'acusou: ' + (bad[0] || w1[0]) : 'limpo'}; ${counted} s contando dias sem rastro; ${out >= 0 ? 'saiu ' + out + ' s depois da chuva, a história viva com ela no elenco' : 'NÃO saiu depois da chuva'}`);
  }
}
// ---------------- t5 the seed of a beast asleep in its den is kept ----------------
if (on('t5')) {
  M.pronto(WORLD); M.viver(2); used.clear(); // (a world where the town has not told this tale yet)
  const S = G.S; S.time = 0.3; clear();
  const c = arm(BEAR, true, false);
  if (!c) ok(`t5 ${WORLD}`, false, 'nenhuma semente de fera rara com um urso perto de uma toca');
  else {
    const slept = toDen(c); M.viver(30);
    const sd = S.saga.seeds.find(x => x.type === 'fera-rara' && x.cast && x.cast.beast === c.aid) || S.saga.stories.find(x => x.type === 'fera-rara' && (x.cast.beast === c.aid));
    const def = G.Stories.DEF['fera-rara'];
    ok(`t5 ${WORLD}`, slept && !!G.Caves.guest(c.aid) && def.valid(c.sd) && !!sd,
      `o urso #${c.aid} ${slept ? 'dorme na toca' : 'NÃO foi à toca'}: a semente ${def.valid(c.sd) ? 'vale' : 'NÃO vale'} e ${sd ? 'segue guardada (ou virou história)' : 'foi jogada fora'}`);
  }
}
// ---------------- t6 a body already skinned stays skinned over a load (L-699) ----------------
if (on('t6')) {
  const S = G.S; S.time = 0.3; clear();
  // a hunter of a town and a big beast with a hide beside it; the spear is the hunter's (G.Animals.kill), the skinning the game's
  let done = null;
  for (const set of [...S.settlements.values()].filter(s => G.Fac.get(s.fac) && G.Village.pop(s.id) >= 6).sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id) || a.id - b.id).slice(0, 4)) {
    const v = [...S.villagers.values()].filter(x => x.set === set.id && x.age >= 16 && !x.captive && !x.aboard && !x.jail && !x.carry && !x.inside && !(S.avatar && S.avatar.id === x.id) && !G.Vg.handsBusy(x)).sort((a, b) => (b.role === 'cacador') - (a.role === 'cacador') || a.id - b.id)[0];
    if (!v) continue;
    const q = G.W.nearestLand(v.x + 2, v.y + 1, 3); if (!q || !G.Animals.walkOK({ kind: 'bear' }, q[0], q[1]) || !G.W.reaches(v, q[0], q[1])) continue;
    const a = G.Animals.spawn('bear', q[0], q[1], { morph: null });
    G.inSim++; try { G.Animals.kill(a, v); } finally { G.inSim--; }
    G.Vg.setTask(v, { type: 'hunt', id: a.id, pri: 4 });
    for (let k = 0; k < 600 && S.animals.has(a.id) && !a.skinned; k++) { M.viver(0.1); if (k % 50 === 49 && !(v.carry && v.carry.n > 1e-6) && (!v.task || v.task.id !== a.id)) G.Vg.setTask(v, { type: 'hunt', id: a.id, pri: 4 }); }
    if (S.animals.has(a.id) && a.skinned) { done = { aid: a.id, vid: v.id, meat: a.meat }; break; }
  }
  if (!done) ok(`t6 ${WORLD}`, false, 'nenhum corpo esfolado com carne sobrando (nenhum caçador chegou a um urso abatido)');
  else {
    M.salvarCarregar(); const a = G.S.animals.get(done.aid);
    const other = [...G.S.villagers.values()].find(x => x.id !== done.vid && x.age >= 16 && !x.captive && !x.carry);
    const again = a && other ? G.Riches.spoils(other, a, {}) : null;
    ok(`t6 ${WORLD}`, !!a && a.dead && a.skinned === true && again === false,
      `o corpo do urso #${done.aid} (carne ${done.meat.toFixed(0)}) depois do load: ${a ? (a.skinned ? 'segue esfolado' : 'voltou COM a pele') : 'sumiu'}; outra mão ${again === false ? 'não tira segunda pele' : 'tiraria OUTRA pele'}`);
  }
}
// ---------------- t7 the body of a town's animal does not vanish on a load (L-699) ----------------
if (on('t7')) {
  const S = G.S;
  const cat = [...S.animals.values()].find(a => !a.dead && a.set && G.Animals.DEF[a.kind] && G.Animals.DEF[a.kind].town);
  if (!cat) ok(`t7 ${WORLD}`, false, 'nenhum bicho de cidade vivo neste mundo');
  else {
    G.inSim++; try { G.Animals.kill(cat, null, 'other'); } finally { G.inSim--; }
    M.viver(1); const had = S.animals.has(cat.id); const set0 = cat.set;
    M.salvarCarregar(); const b = G.S.animals.get(cat.id);
    ok(`t7 ${WORLD}`, had && !!b && b.dead && b.set === set0, `o corpo d${G.Animals.DEF[cat.kind].g === 'f' ? 'a' : 'o'} ${cat.kind} #${cat.id} ${b ? 'segue no mundo depois do load, da mesma cidade' : 'SUMIU no load'}`);
  }
}
// ---------------- t8 a save of before (the guest with its kind, age and name only) still loads ----------------
if (on('t8')) {
  M.pronto(WORLD); M.viver(2); const S0 = G.S; S0.time = 0.3; clear();
  const sp = spots(true)[0];
  if (!sp) ok(`t8 ${WORLD}`, false, 'nenhuma toca perto de uma cidade');
  else {
    const m = sp.cv.mouths[0]; const q = G.W.nearestLand(m.x + 0.5, m.y + 1.5, 3);
    const a = G.Animals.spawn('bear', q[0], q[1], { morph: 'albino' }); const c = { aid: a.id, cv: sp.cv };
    const slept = toDen(c);
    const o = JSON.parse(G.Save.serialize());
    for (const cv of o.ug.caves) cv.sleepers = (cv.sleepers || []).map(x => ({ id: x.id, kind: x.kind, age: x.age, grown: x.grown, named: x.named, sx: x.sx, sy: x.sy }));
    G.Save.apply(o); const g = G.Caves.guest(c.aid);
    for (let k = 0; k < 110 && !G.S.animals.has(c.aid); k++) M.viver(1);
    const b = G.S.animals.get(c.aid);
    ok(`t8 ${WORLD}`, slept && !!g && g.a.kind === 'bear' && g.a.morph === null && !!b && !b.dead && QA.check().filter(x => x.sev <= 1).length === 0,
      `o hóspede de um save de antes ${g ? 'carrega (um urso, sem pelo raro: ' + g.a.morph + ')' : 'NÃO carrega'} e ${b ? 'sai da toca de manhã' : 'NÃO sai da toca'}`);
  }
}
const e = M.erros();
ok('erros', M.limpo(), M.limpo() ? 'nenhum erro de módulo nem aviso' : JSON.stringify(e).slice(0, 300));
console.log(fails.length ? `FALHOU: ${fails.length} (${fails.join(', ')})` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
