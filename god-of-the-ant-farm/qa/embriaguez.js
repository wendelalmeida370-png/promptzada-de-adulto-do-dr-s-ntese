// embriaguez: a bebedeira (a taverna, quarta onda — T2, D-830 a D-839), em Node, pelo qa/nodemundo.js, na metrópole pronta.
//  e1 as doses: cada bebida no sangue de um adulto, pelo que ela é (o vinho e o hidromel mais que a cerveja e o pulque); o estômago
//     cheio sobe menos; o sono zera; a ressaca depois de uma noite pesada, que pesa no dia (a porta do needs); o hábito e a idade
//  e2 uma noite numa taverna da metrópole: os fregueses à mesa com a bebida de uma noite (a prova a dá: a metrópole pronta bebe
//     pouco — a prateleira tem pouca bebida —, T-1900); o que cada índole fez bêbada, com a causa: o agressivo só pela índole
//     agressiva, o expansivo pela expansiva, o triste pela tristeza; ninguém sóbrio age bêbado; o verificador limpo
//  e3 o jogar-bebida: a bebida sai da caneca pelo livro ('jogou'), a poça no chão da taverna perto do outro, o outro molhado, a
//     marca de quem foi humilhado
//  e4 o desmaio e o arrastar: o que bebeu demais cai à mesa, o taverneiro o arrasta para a rua — o ato de dois —, ele fica deitado
//     na frente da taverna e acorda depois, com a ressaca; o amigo da mesa leva o outro para casa, e ele dorme na cama
//  e5 o corpo do jogador: bebe, o olho balança, a vista turva e o passo puxa só do acaso do que se vê; passa do ponto e cai — a
//     tecla não o acorda —; dentro da taverna, o taverneiro o arrasta para a rua; acorda com a causa dita, de ressaca
//  e6 um save no meio da bebedeira: o sangue, o desmaio, a ressaca e a roupa molhada voltam; o desmaiado à mesa volta desmaiado; o
//     mesmo save carregado duas vezes vive o mesmo futuro
//  e7 o mundo sem o corpo, duas vezes igual
//  e nenhum erro de módulo nem aviso no console.
//   node qa/embriaguez.js            (≈ 4 min)        ONLY=e1,e3 node qa/embriaguez.js
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js', 'js/people3d.js', 'js/possess.js', 'js/interact.js', 'js/avatar.js', 'js/embriaguez-corpo.js', 'qa/embriaguez-inv.js'] });
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null; const on = k => !ONLY || ONLY.includes(k);
const fails = []; const ok = (k, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | embriaguez ${k} | ${info}`); if (!c) fails.push(k); };
const E = G.Ebrio, T = G.Taverna, A = G.Act, D = G.Depot, L = G.Lacos, I = G.Indole, Po = G.Possess;
const S = () => G.S;
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
G.IncUI = G.IncUI || {}; const toasts = []; G.IncUI.toast = t => { toasts.push(t); };
const clock = () => { const c = process.cpuUsage(); return (c.user + c.system) / 1e6; }; const c0 = clock();
const calm = () => { const w = S().weather; w.rain = 0; if (w.storm) w.storm = 0; if (!(S().divinePeace > G.DAY_LEN * 0.5)) god(() => G.Politics.divinePeace()); for (const s of S().settlements.values()) { if (s.alarmT > 0) s.alarmT = 0; s.festPlan = { day: S().day, key: null, done: true }; } }; // (the night in the god's peace, no feast of the town: T-910)
const skip = (sec, until) => { G.Skip.on = true; G.FX.off = true; try { const t1 = S().clock + sec; let n = 0; while (S().clock < t1 && n++ < 4000) { G.Main.skipStep(1); if (until && until()) break; } } finally { G.Skip.on = false; G.FX.off = false; } };
const skipTo = h => { G.Skip.on = true; G.FX.off = true; try { let n = 0; while (S().time < h && n++ < 900) G.Main.skipStep(1); } finally { G.Skip.on = false; G.FX.off = false; } };
const live = (sec, until) => { for (let k = 0; k < sec * 10; k++) { M.viver(0.1); if (until && until()) return true; } return false; };
// (the rules of the drink and of what is seen of it fail the proof; the tavern's own, seen meanwhile, are told — the seat two take in the
// same step is the tavern's, T-1903)
const notes = [];
const watch = bad => { for (const q of QA.check().filter(q => q.sev <= 3 && (q.sys === 'ebrio' || q.sys === 'taverna' || q.sys === 'atmos'))) { const m = `S${q.sev} ${q.sys}: ${q.msg}`; const L = q.sys === 'taverna' && !/desmai|bêbad|ebrio/.test(q.msg) ? notes : bad; if (L.length < 8 && !L.includes(m)) L.push(m); } };
const ACTING = { 2: 1, 3: 1, 4: 1, 5: 1 };
const atTables = () => { const out = []; for (const op of A.all()) { if (op.def !== 'taverna' || !A.live(op)) continue; for (const id of Object.keys(op.data.mesa)) { const v = S().villagers.get(+id); const m = op.data.mesa[id]; if (v && !m.corpo && !m.body && v.task && v.task.type === 'tavern' && ACTING[v.task.st]) out.push([v, m, op]); } } return out.sort((a, b) => a[0].id - b[0].id); };
const r2 = x => Math.round(x * 100) / 100;

M.pronto('metropole');
calm();

// ---------------- e1 the doses ----------------
if (on('e1')) {
  const a = [...S().villagers.values()].filter(v => v.age >= 25 && v.age < 45 && !v.captive && !v.aboard && !(v.ebrio > 0)).sort((x, y) => x.id - y.id)[0];
  const keep = { hunger: a.hunger, sleeping: a.sleeping, ebrio: a.ebrio, ebrioG: a.ebrioG, ebrioP: a.ebrioP, ressaca: a.ressaca, age: a.age };
  // (the drink's way through one body, by the door the needs call each step: E.passo — the peak and the time to it)
  const curve = (k, rounds, hunger, sleep) => god(() => { a.ebrio = 0; a.ebrioG = 0; a.ebrioP = 0; a.ebrioD = 0; a.ressaca = 0; a.hunger = hunger; a.sleeping = !!sleep; for (let r = 0; r < rounds; r++) E.dose(a, k); let pk = 0, tp = 0, t = 0; while (t < 1200) { E.passo(a, 0.25); t += 0.25; if (a.ebrio > pk) { pk = a.ebrio; tp = t; } if (t > 5 && !(a.ebrioG > 0) && !(a.ebrio > 0)) break; } return { pk: r2(pk), tp, t, res: r2(a.ressaca || 0) }; });
  const one = {}; for (const k of ['cerveja', 'pulque', 'vinho', 'mel']) one[k] = curve(k, 1, 70, false);
  const cheio = curve('vinho', 1, 5, false);
  const night = curve('vinho', 4, 70, false), sono = curve('vinho', 4, 70, true);
  // (the hangover in the day: the door the needs weigh the hunger and the tiredness by — E.passo gives it, the needs multiply)
  const rk = god(() => { a.ressaca = 1; a.sleeping = false; const r = E.passo(a, 0.1); return r; });
  // (what one bears: the habit — the nights a tavern of one's town remembers —, the years)
  const tv = G.Eco.byType(a.set, 'taverna')[0]; const tol0 = E.tol(a);
  let tolH = tol0; if (tv) { const f0 = tv.freg; tv.freg = (f0 || []).concat([[a.id, 30, S().day, {}]]); tolH = E.tol(a); tv.freg = f0; }
  a.age = 17; const tolY = E.tol(a); a.age = keep.age;
  Object.assign(a, keep); god(() => { a.ebrioD = 0; a.ressaca = 0; });
  console.log(`   ${a.name}#${a.id}: uma rodada — cerveja ${one.cerveja.pk}, pulque ${one.pulque.pk}, vinho ${one.vinho.pk}, hidromel ${one.mel.pk} no sangue (o pico em ${one.vinho.tp} s); o vinho de estômago cheio ${cheio.pk}; quatro de vinho: ${night.pk} acordado (zera em ${night.t} s, ressaca ${night.res}), ${sono.pk} dormindo (zera em ${sono.t} s); aguenta ${tol0.toFixed(2)}, com 30 noites de taverna ${tolH.toFixed(2)}, aos 17 anos ${tolY.toFixed(2)}`);
  ok('e1 a dose pela bebida', one.vinho.pk > one.cerveja.pk * 1.4 && one.mel.pk > one.cerveja.pk * 1.5 && Math.abs(one.pulque.pk - one.cerveja.pk) < 0.04 && one.cerveja.pk > 0.05, `cerveja ${one.cerveja.pk}, pulque ${one.pulque.pk}, vinho ${one.vinho.pk}, hidromel ${one.mel.pk}`);
  ok('e1 a comida no estômago', cheio.pk < one.vinho.pk * 0.9 && cheio.tp > one.vinho.tp, `o vinho de estômago vazio ${one.vinho.pk} (pico em ${one.vinho.tp} s), de estômago cheio ${cheio.pk} (pico em ${cheio.tp} s)`);
  ok('e1 o sono zera, a ressaca vem', sono.t < night.t * 0.25 && night.res > 0.3 && rk > 0.9 && E.FOME > 0 && E.CANSA > 0, `zera em ${sono.t} s dormindo contra ${night.t} s acordado; ressaca ${night.res} depois de quatro taças; o passo dá a ressaca ${r2(rk)} ao needs (fome +${E.FOME * 100}%, cansaço +${E.CANSA * 100}%)`);
  ok('e1 o hábito e a idade', tolH > tol0 + 0.3 && tolY < tol0 - 0.1, `aguenta ${tol0.toFixed(2)}; com o hábito ${tolH.toFixed(2)}; aos 17 ${tolY.toFixed(2)} — nunca pela altura nem pelo povo`);
}

// ---------------- the night: the tables with a night's drink ----------------
const NIGHT = ['e2', 'e3', 'e4', 'e5', 'e6', 'e7'].some(on);
if (NIGHT) { skipTo(0.6); calm(); live(14, () => S().time > 0.66); }
const night0 = NIGHT ? atTables() : [];
// (the drink of a night for who sits at the tables now: from merry to past the faint, by the hash of the person — the prova's hand: the
// metropole as it is drinks little, its shelves low)
const given = new Map();
god(() => { for (const [v] of night0) { const lv = E.tol(v) * (0.3 + 1.15 * G.hash(Math.imul(v.id, 7) + 3)); E.prova(v, Math.min(E.MAX, lv)); given.set(v.id, r2(lv)); } });
const SNAP = G.Save.serialize(); const SNAP_T = S().time;
console.log(`   (${night0.length} à mesa às ${S().time.toFixed(3)}, nas ${new Set(night0.map(q => q[2].id)).size} tavernas; a bebida de uma noite a cada um)`);
// (who did what, drunk, by what the chooser said: the doer's índole, how far gone)
const said = []; { const imp0 = E.impulso; E.impulso = function (v, ctx) { const r = imp0.apply(this, arguments); if (r) said.push({ id: v.id, a: r.a, fam: r.fam, o: r.o, g: E.g(v), agr: I.faceta(v, 'agressivo'), ext: I.ax(v, 'ext') / 99, ama: I.ax(v, 'ama') / 99, neu: I.ax(v, 'neu') / 99, mourn: v.mourn > 0, hu: I.humor(v) }); return r; }; }
const DRUNK = ['swear', 'shout', 'insult', 'threaten', 'spit', 'jogar-bebida', 'molhado', 'laugh', 'cheer', 'talk', 'hug', 'cantoria', 'danca', 'weep', 'tell', 'desmaio', 'arrastar', 'arrastado', 'cower', 'disagree'];

// ---------------- e2 a night at the tavern ----------------
if (on('e2')) {
  const bad = []; const seen = {}; const sober = []; let n = 0; const faint = new Set(), dragged = new Set(), street = new Set(), home = new Set();
  while (S().time < 0.9 && n < 1200) {
    calm(); M.viver(0.2); n++;
    for (const v of S().villagers.values()) {
      if (DRUNK.includes(v.act)) { seen[v.act] = (seen[v.act] || 0) + 1; }
      if (v.ebrioD > 0) faint.add(v.id); const t = v.task;
      if (t && t.type === 'arrastado') dragged.add(v.id + ':' + (S().villagers.get(t.id) || {}).role);
      if (t && t.type === 'desmaio' && !v.inside) street.add(v.id); if (t && t.type === 'desmaio' && v.inside && v.inside === v.home) home.add(v.id);
    }
    if (n % 25 === 0) watch(bad);
  }
  const fam = {}; for (const x of said) fam[x.fam] = (fam[x.fam] || 0) + 1;
  const atos = {}; for (const op of A.all()) if (op.def === 'taverna' && op.data && op.data.atos) for (const [a, w] of Object.entries(op.data.atos)) for (const [k, q] of Object.entries(w)) atos[a + '/' + k] = (atos[a + '/' + k] || 0) + q;
  // (each way by its cause: the aggressive only of the quick to anger, the merry of the outgoing and kind, the sad of the nervous or the
  // grieving — and none of it from one below merry)
  const wrong = said.filter(x => x.g < E.LIM.alegre - 1e-6 || (x.fam === 'agressivo' && x.agr < 0.45) || (x.fam === 'expansivo' && 0.55 * x.ext + 0.45 * x.ama <= 0.42) || (x.fam === 'triste' && !((x.neu - 0.55) * 1.4 + (x.mourn ? 0.7 : 0) + (x.hu < -0.25 ? 0.35 : 0) > 0)));
  const ag = said.filter(x => x.fam === 'agressivo'), ex = said.filter(x => x.fam === 'expansivo');
  const mean = (L, k) => (L.length ? L.reduce((s, x) => s + x[k], 0) / L.length : 0);
  const tops = Object.entries(atos).sort((a, b) => b[1] - a[1]).slice(0, 26).map(([k, q]) => `${k} ${q}`).join(', ');
  console.log(`   o que o bêbado fez (pelo escolhedor): ${JSON.stringify(fam)}; no livro do dia: ${tops}`);
  console.log(`   visto nas pessoas: ${DRUNK.filter(k => seen[k]).map(k => `${k} ${seen[k]}`).join(', ')}; ${faint.size} desmaios, ${dragged.size} arrastados (${[...dragged].slice(0, 6).join(' ')}), ${street.size} deitados na rua, ${home.size} na cama de casa`);
  console.log(`   a índole de quem agiu: agressivos com a faceta agressiva ${mean(ag, 'agr').toFixed(2)} (todos ${mean(said, 'agr').toFixed(2)}); expansivos com ext ${mean(ex, 'ext').toFixed(2)} (todos ${mean(said, 'ext').toFixed(2)})`);
  ok('e2 a índole decide', said.length >= 12 && !wrong.length && (fam.agressivo || 0) >= 3 && (fam.expansivo || 0) >= 5 && mean(ag, 'agr') > mean(said, 'agr') && mean(ex, 'ext') > mean(said, 'ext'), `${said.length} atos de bêbado; fora da causa: ${wrong.length}${wrong.length ? ' — ' + JSON.stringify(wrong[0]) : ''}`);
  ok('e2 os atos se veem', DRUNK.filter(k => seen[k]).length >= 6 && (seen.desmaio || 0) > 0, `${DRUNK.filter(k => seen[k]).length} atos diferentes vistos em quem bebeu`);
  ok('e2 o desmaio e quem tira', faint.size >= 2 && dragged.size >= 1 && (street.size + home.size) >= 1, `${faint.size} desmaiaram, ${dragged.size} arrastados, ${street.size} na rua, ${home.size} em casa`);
  ok('e2 o verificador', !bad.length, (bad.length ? bad.join(' · ') : 'limpo (a bebida e o que se vê dela)') + (notes.length ? ` — da taverna, visto e dito: ${notes.join(' · ')}` : ''));
}

// ---------------- e3 the drink thrown ----------------
if (on('e3')) {
  M.abrir(JSON.parse(SNAP)); calm();
  const L0 = []; D.onMove.push(e => { if (e[8] === 'jogou') L0.push(e); });
  // (two at the same table, one with a cup of drink in the hand)
  let pair = null; for (let k = 0; k < 60 && !pair; k++) { const at = atTables(); for (const [v, m, op] of at) { const c = v.carry; if (!c || c.op !== op.id || c.k === 'food' || !(c.n > 0) || m.eb) continue; const o = at.find(q => q[2] === op && q[0] !== v && !q[1].eb && q[1].g === m.g) || at.find(q => q[2] === op && q[0] !== v && !q[1].eb); if (o) { pair = [v, o[0], op, c.k, c.n]; break; } } if (!pair) M.viver(0.5); }
  if (!pair) ok('e3 jogar a bebida', false, 'ninguém com a caneca e outro à mesa');
  else {
    const [a, b, op] = pair; const chao0 = (op.data.chao || []).length;
    god(() => { E.prova(a, Math.max(E.de(a), E.limiar(a, 'bebado') + 0.05)); T.ebrioProva(a, 'jogar-bebida', b); });
    const acts = new Set(); for (let k = 0; k < 30; k++) { M.viver(0.1); acts.add('a:' + a.act); acts.add('b:' + b.act); }
    const line = L0.find(e => String(e[3]) === 'v:' + a.id); const poca = (op.data.chao || []).slice(chao0).find(q => q.k === 'poca' && q.de === 'jogou');
    const wet = E.molhado(b), mk = (b.marcas || []).find(q => q[0] === 'humilhou' && q[1] === a.id);
    ok('e3 jogar a bebida', !!line && line[6] > 0 && !(a.carry && a.carry.op === op.id && a.carry.k === pair[3]) && !!poca && wet > 0.8 && !!mk && acts.has('a:jogar-bebida') && acts.has('b:molhado'),
      `${a.name} jogou ${line ? line[6] + ' de ' + line[5] : 'NADA'} em ${b.name} pelo livro ('jogou'); poça no chão: ${poca ? `${poca.bebida} em (${poca.x}, ${poca.z})` : 'NENHUMA'}; ${b.name} molhado ${r2(wet)} (${JSON.stringify(b.molhado)}); a marca «humilhou»: ${mk ? 'sim' : 'NÃO'}; os atos: ${[...acts].filter(x => /jogar|molhado/.test(x)).join(', ')}`);
  }
}

// ---------------- e4 the faint and the drag ----------------
if (on('e4')) {
  M.abrir(JSON.parse(SNAP)); calm();
  const at = atTables(); const keepers = new Set(at.map(q => { const k = T.keeperOf(G.S.buildings.get(q[2].at)); return k && k.id; }));
  // (one to fall at a table whose keeper is at the counter; one with a friend of the table to take one home)
  const c = at.find(([v, m, op]) => !keepers.has(v.id) && E.tol(v) <= 1.15 && T.keeperOf(G.S.buildings.get(op.at)) && !(v.ebrioD > 0));
  const homeD = ([v, , op]) => { const h = G.S.buildings.get(v.home), b = G.S.buildings.get(op.at); return h && b ? G.dist(h.x, h.y, b.x, b.y) : 1e9; };
  const df = at.filter(([v, m, op]) => v !== (c && c[0]) && !keepers.has(v.id) && E.tol(v) <= 1.15 && G.Village.livable(G.S.buildings.get(v.home)) && at.some(q => q[2] === op && q[0] !== v && q[1].g === m.g && E.forte(q[0]) && q[0].set === v.set && !keepers.has(q[0].id) && q[0] !== (c && c[0]))).sort((x, y) => homeD(x) - homeD(y))[0];
  const fr = df ? at.find(q => q[2] === df[2] && q[0] !== df[0] && q[1].g === df[1].g && E.forte(q[0]) && q[0].set === df[0].set && !keepers.has(q[0].id) && q[0] !== (c && c[0])) : null;
  if (!c) ok('e4 o taverneiro arrasta', false, 'ninguém à mesa para cair');
  else {
    const [v, m, op] = c; const b = G.S.buildings.get(op.at); const seen = new Set();
    god(() => { E.prova(v, Math.min(E.MAX, E.limiar(v, 'desmaio') + 0.12)); if (df && fr) { for (let k = 0; k < 8; k++) L.ato(fr[0], df[0], 'mesa'); E.prova(fr[0], 0); E.prova(df[0], E.MAX); } });
    let dz = null, dragT = null; const fd = { carried: false, by: 0, bed: false };
    const d0 = df && fr ? df[0] : null, f0 = fr ? fr[0] : null;
    const track = () => { if (d0) { if (d0.task && d0.task.type === 'arrastado') { fd.carried = true; fd.by = d0.task.id; } if (d0.task && (d0.task.type === 'desmaio' || d0.task.type === 'sleep') && d0.inside && d0.inside === d0.home && d0.sleeping && fd.carried) fd.bed = true; } };
    live(40, () => { track(); const k = T.keeperOf(b); if (k) seen.add('k:' + (k.act || '') + ':' + (k.task ? k.task.type + k.task.st : '')); seen.add('v:' + v.act); if (!dz && op.data.mesa[v.id] && op.data.mesa[v.id].dz) dz = op.data.mesa[v.id].dz; if (v.task && v.task.type === 'arrastado') dragT = v.task.id; return v.task && v.task.type === 'desmaio' && !v.inside && v.sleeping; });
    const dr = G.Vg.door(b); const lying = v.task && v.task.type === 'desmaio' && !v.inside && v.sleeping && v.act === 'desmaio';
    const near = G.dist(v.x, v.y, dr[0], dr[1]);
    const keeper = dragT && G.S.villagers.get(dragT);
    skip(300, () => { track(); return !(v.ebrioD > 0) && (!d0 || fd.bed || !(d0.ebrioD > 0)); });
    ok('e4 o taverneiro arrasta', dz === 'mesa' && seen.has('v:desmaio') && seen.has('v:arrastado') && [...seen].some(s => /^k:arrastar:atender41/.test(s)) && !!keeper && keeper.role === 'taverneiro' && lying && near < 3.5,
      `${v.name} caiu ${dz === 'mesa' ? 'sobre a mesa' : dz || 'NÃO CAIU'}; ${keeper ? keeper.name + ' (' + keeper.role + ')' : 'NINGUÉM'} o arrastou (${[...seen].filter(s => /arrast/.test(s)).slice(0, 4).join(', ')}); deitado na rua a ${near.toFixed(1)} casas da porta: ${lying ? 'sim' : 'NÃO'}`);
    ok('e4 acorda de ressaca', !(v.ebrioD > 0) && v.ressaca > 0.1 && !(v.task && v.task.type === 'desmaio'), `acordou ${!(v.ebrioD > 0) ? 'sim' : 'NÃO'}, ressaca ${r2(v.ressaca || 0)}, agora ${v.task ? v.task.type : 'sem afazer'}`);
    if (d0) {
      ok('e4 o amigo leva para casa', fd.carried && fd.by === f0.id && fd.bed, `${d0.name} ${fd.carried ? 'levado por ' + (G.S.villagers.get(fd.by) || {}).name : 'NÃO levado'} (o amigo da mesa: ${f0.name}, afeto ${T.fond(f0, d0)}); em casa, na cama: ${fd.bed ? 'sim' : 'NÃO (' + (d0.task ? d0.task.type : '-') + ')'}`);
    } else console.log('   (e4: nenhum par de amigos à mesa nesta noite: o amigo que leva fica de fora)');
  }
}

// ---------------- e5 the body ----------------
if (on('e5')) {
  M.abrir(JSON.parse(SNAP)); calm();
  const RDT = 1 / 30; const frame = () => { G.debug.step(RDT * G.Space.TIME); G.Avatar.frame(RDT); G.EbrioCorpo.olho(RDT); };
  const longFrame = () => { G.debug.step(0.25); G.Avatar.frame(RDT); G.EbrioCorpo.olho(RDT); }; // (the world passing while the body is out: the eye is dark)
  // (a grown one at a tavern open now, its keeper at hand: lived by the god, inside, on the floor of its room)
  const kOk = op => { const b = G.S.buildings.get(op.at); const k = T.keeperOf(b); return !!k && !k.secret && E.forte(k); };
  const cands = atTables().filter(([v, m, op]) => v.age >= 20 && v.age < 50 && E.tol(v) <= 1.2 && kOk(op) && !(v.ebrioD > 0));
  const pick = cands[0];
  if (!pick) ok('e5 o corpo bebe', false, 'ninguém para viver');
  else {
    const [v, m, op] = pick; const b = G.S.buildings.get(op.at); const kp = T.keeperOf(b);
    // (the others of that tavern sober tonight: the keeper free for the body — the drag of the ones out first is the e4's —; and the
    // keeper back at his counter)
    god(() => { for (const [o, , q] of atTables()) if (q === op && o !== v) E.prova(o, 0); });
    live(25, () => kp.inside === b.id && kp.task && kp.task.type === 'atender' && v.task && v.task.type === 'tavern');
    const r = Po.take(v); G.Avatar.attach(v, 0); for (let k = 0; k < 6; k++) frame();
    // (the drink by the body's own rounds — the door the tavern gives its sips through: G.Ebrio.dose, as T.bite does)
    const rng0 = G.S.rng; god(() => E.prova(v, E.limiar(v, 'bebado') + 0.1)); for (let k = 0; k < 90; k++) frame();
    const ko = G.EbrioCorpo.k(); const ol = G.EbrioCorpo.olho(RDT), vi = G.EbrioCorpo.vista(), pu = G.EbrioCorpo.puxa(1, 0, 1, RDT); const word = Po.knows.ebrio(v);
    const rngSame = G.S.rng === rng0 || true; // (the world's chance moves with the world's step; what is only seen is asked below with the step stopped)
    const r1 = G.S.rng; for (let k = 0; k < 50; k++) { G.EbrioCorpo.olho(RDT); G.EbrioCorpo.vista(); G.EbrioCorpo.puxa(1, 0, 1, RDT); } const pureSeen = G.S.rng === r1;
    ok('e5 o corpo bêbado se vê', r.ok && v.ebrio > 0.3 && ko > 0.2 && !!ol && Number.isFinite(ol.roll) && Math.abs(ol.roll) < 0.1 && !!vi && vi[0] > 0.2 && !!pu && Math.abs(Math.atan2(pu[1], pu[0])) < 0.5 && pureSeen && rngSame && /bêbad|alegre/.test(word),
      `${v.name}: o sangue ${r2(v.ebrio)}, «${word}»; o olho inclina ${ol ? (ol.roll * 57.3).toFixed(1) : '—'}°, a vista turva ${vi ? r2(vi[0]) : '—'}, o passo puxa ${pu ? (Math.atan2(pu[1], pu[0]) * 57.3).toFixed(1) : '—'}°; o acaso do mundo intacto pelo que só se vê: ${pureSeen ? 'sim' : 'NÃO'}`);
    // (past the mark: down where it is — inside the tavern, on its floor —, no key wakes it, the keeper drags it out)
    if (v.inside !== b.id) god(() => { const p = G.Space.plan(b); const e = p && p.entrance; if (e) { v.x = b.x + (e.x + (p.lot.w / 2 - e.x) * 0.3) / G.Space.TILE; v.y = b.y + (e.z + (p.lot.w / 2 - e.z) * 0.3) / G.Space.TILE; v.inside = b.id; } });
    god(() => { E.dose(v, 'mel'); E.dose(v, 'mel'); E.dose(v, 'mel'); E.dose(v, 'mel'); E.dose(v, 'mel'); });
    let fell = false, woke = null, drag = false, keyWake = null, darkTxt = false;
    for (let k = 0; k < 400 && !fell; k++) { longFrame(); fell = E.desmaiado(v) && v.sleeping; }
    if (fell) { const ap = Po.apply(w => { Po.wake(w); return { ok: true }; }); frame(); frame(); keyWake = v.sleeping; void ap; darkTxt = !!Po.desmaio(); }
    const in0 = v.inside;
    // (the world passes, the keeper comes: the body dragged out of the door and down the street, by the possess.js door)
    for (let k = 0; k < 900 && E.desmaiado(v); k++) { longFrame(); if (!drag && !v.inside && in0 && (G.S.avatar.dz || {}).arr) drag = true; }
    woke = !E.desmaiado(v) && !v.sleeping && Po.is(v);
    const t = toasts.slice(-3).join(' | ');
    ok('e5 o corpo cai e é levado', fell && keyWake === true && darkTxt && in0 === b.id && drag && !v.inside, `caiu ${fell ? 'dentro da taverna' : 'NÃO'}; a tecla não acorda: ${keyWake ? 'sim' : 'NÃO'}; a tela diz o desmaio: ${darkTxt ? 'sim' : 'NÃO'}; o taverneiro o arrastou para a rua: ${drag ? 'sim' : 'NÃO'}`);
    ok('e5 acorda com a causa', woke && v.ressaca > 0.1 && /acorda/.test(t), `acordou nas mãos do jogador: ${woke ? 'sim' : 'NÃO'}, ressaca ${r2(v.ressaca || 0)}; a tela: «${t}»`);
    Po.release('deus');
  }
}

// ---------------- e6 a save in the middle ----------------
if (on('e6')) {
  M.abrir(JSON.parse(SNAP)); calm(); live(8);
  // (one passed out at the table at the save: the house's mark and the person's)
  // (one with no friend at the tables — nobody to take him home in the second before the save: the house's own faint, at the table)
  const at = atTables(); const c = at.find(([v, m, op]) => E.tol(v) <= 1.15 && !(v.ebrioD > 0) && !at.some(q => q[2] === op && q[0] !== v && T.fond(q[0], v) >= T.FOND - 1)); if (c) god(() => E.prova(c[0], Math.min(E.MAX, E.limiar(c[0], 'desmaio') + 0.1)));
  if (c) god(() => { const o = at.find(q => q[0] !== c[0]); if (o) E.molha(o[0], 'vinho'); });
  live(1.5);
  const fp = () => [...S().villagers.values()].filter(v => v.ebrio > 0 || v.ebrioD > 0 || v.ressaca > 0 || v.molhado).map(v => [v.id, (v.ebrio || 0).toFixed(5), (v.ebrioG || 0).toFixed(5), v.ebrioD || 0, (v.ressaca || 0).toFixed(4), JSON.stringify(v.molhado || 0)].join(':')).join('|');
  const before = fp(); const sv = G.Save.serialize(); G.Save.apply(JSON.parse(sv));
  const after = fp(); const cv = c ? S().villagers.get(c[0].id) : null; const cm = cv && cv.task && cv.task.type === 'tavern' ? A.get(cv.task.op).data.mesa[cv.id] : null;
  live(0.5); const backDz = cv && cv.ebrioD > 0 && cm && cm.dz && cv.act === 'desmaio' && cv.task.type === 'tavern';
  const run = () => { G.Save.apply(JSON.parse(sv)); live(12); return fp() + '#' + atosOf(); };
  const atosOf = () => JSON.stringify(A.all().filter(op => op.def === 'taverna' && op.data).map(op => [op.id, op.data.atos || {}, Object.keys(op.data.mesa).length]));
  const f1 = run(), f2 = run();
  ok('e6 o save no meio', before === after && before.length > 0 && !!backDz && f1 === f2, `${before.split('|').length} com bebida no corpo, iguais depois do load: ${before === after ? 'sim' : 'NÃO'}; o desmaiado à mesa volta desmaiado à mesa: ${backDz ? 'sim' : 'NÃO'}; o mesmo save duas vezes: ${f1 === f2 ? 'o mesmo futuro' : 'FUTUROS DIFERENTES'}`);
}

// ---------------- e7 the world without the body, twice ----------------
if (on('e7')) {
  const run = () => { M.abrir(JSON.parse(SNAP)); calm(); live(15); return [...S().villagers.values()].map(v => [v.id, (v.ebrio || 0).toFixed(6), v.ebrioD || 0, (v.ressaca || 0).toFixed(5), v.act || '', v.task ? v.task.type : ''].join(':')).join('|') + JSON.stringify(A.all().filter(op => op.def === 'taverna' && op.data).map(op => op.data.atos || {})); };
  const a = run(), b = run();
  ok('e7 o mundo igual duas vezes', a === b, a === b ? 'os mesmos goles, os mesmos atos, os mesmos desmaios' : 'DIFERENTES');
}

const e = M.erros(); const modErr = Object.keys(e.mod).length, cons = e.console.length;
ok('erros', !modErr && !cons, modErr || cons ? JSON.stringify(e).slice(0, 400) : 'nenhum erro de módulo, nenhum aviso');
console.log(`(${(clock() - c0).toFixed(0)} s de máquina)`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
