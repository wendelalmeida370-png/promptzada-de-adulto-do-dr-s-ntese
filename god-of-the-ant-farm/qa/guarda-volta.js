// guarda-volta: node qa/guarda-volta.js [mundo] — o guarda que não acha o ladrão desiste por hoje, não para sempre (L-646).
// A caça dizia «then the guard gives up for today», mas apagava a caça (v.hunt = 0): nem a ronda nem o ofício voltavam ao crime
// contado, e o roubo ficava aberto para sempre, o ladrão com as moedas.
//   g1 um roubo de verdade (a tarefa do jogo, as moedas pelo livro), contado a um guarda da cidade; o ladrão escondido dentro de
//      outro prédio pela mão da prova: o guarda procura na casa dele e em volta, e desiste — o roubo segue aberto e a caça dele
//      também (c.gave é hoje);
//   g2 no mesmo dia, a ronda e o ofício não o mandam de novo atrás do ladrão;
//   g3 no dia seguinte, com o ladrão na rua: o guarda volta a ele e o prende (o roubo sai de «aberto»);
//   g4 com um save no meio (entre a desistência e o dia seguinte): a caça e a marca atravessam o save;
//   g5 um roubo que ninguém resolveu em Cr.PRESC dias prescreve, e a caça acaba;
//   g6 o verificador limpo (S0–S2), nenhum erro de módulo.
// O esconderijo é a casa da cidade mais longe da casa do ladrão (onde o guarda procura), e o ladrão fica lá dentro, parado,
// enquanto o caso dura; as testemunhas do roubo são as que contaram ao guarda (T-1004).
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | guarda-volta ${name} | ${info}`); if (!c) fails.push(name); return c; };
const world = process.argv[2] || 'metropole';
M.pronto(world); let S = G.S; const Vg = G.Vg, H = Vg.H;
const LAW = { vigia: 1, guerreiro: 1 };
// a town with a guard at liberty, a house with coins and another adult to be the thief
let pick = null;
for (const set of [...S.settlements.values()].sort((a, b) => a.id - b.id)) {
  const ppl = [...S.villagers.values()].filter(v => v.set === set.id && !v.captive && !v.jail && !v.aboard && !v.ug && v.age >= 18 && v.age < 60 && !(S.avatar && S.avatar.id === v.id));
  const g = ppl.filter(v => LAW[v.role] && !v.hunt && !(v.task && v.task.pri >= 3)).sort((a, b) => (a.role === 'vigia' ? 0 : 1) - (b.role === 'vigia' ? 0 : 1) || a.id - b.id)[0];
  const h = [...S.buildings.values()].filter(b => b.set === set.id && b.built && G.BDEF[b.type].housing && (b.coin || 0) >= 6).sort((a, b) => b.coin - a.coin || a.id - b.id)[0];
  const th = g && h && ppl.filter(v => v !== g && !LAW[v.role] && v.home && v.home !== h.id && S.buildings.get(v.home) && !(v.task && v.task.pri >= 3) && G.W.canWalk(v.x, v.y, ...Vg.door(h))).sort((a, b) => a.id - b.id)[0];
  // (the hiding place: the house of the town farthest from the thief's own — the guard looks there first, and around it —, not
  // from the robbed one: in the metrópole of the generation 20 the farthest from the robbed house of Argos was hut#7335, two
  // steps from the thief's hut#7387, on the guard's way to its door. T-1004)
  const hd0 = th && Vg.door(S.buildings.get(th.home));
  const hide = th && [...S.buildings.values()].filter(b => b.set === set.id && b.built && b.blocks && b.id !== th.home && b.id !== h.id && G.BDEF[b.type].housing).sort((a, b) => G.dist2(b.x, b.y, hd0[0], hd0[1]) - G.dist2(a.x, a.y, hd0[0], hd0[1]) || a.id - b.id)[0];
  if (g && h && th && hide) { pick = { set, g, h, th, hide }; break; }
}
if (!pick) { ok('g1 um roubo contado a um guarda', false, 'nenhuma cidade com um guarda livre, uma casa com moedas e um ladrão'); console.log('FALHOU: 1'); process.exit(1); }
const { set, g, h, hide } = pick; let th = pick.th; const day0 = S.day;
// the theft, by the game's own task
const n0 = S.crimes ? S.crimes.length : 0; const [dx, dy] = Vg.door(h);
Vg.endTask(th); th.sleeping = false; th.inside = 0; th.hunger = 5; th.energy = 95; th.x = dx; th.y = dy + 0.4; th.path = null; Vg.give(th, { type: 'furto', house: h.id, pri: 2.05, st: 0, kind: 'furto' }); const seenT = new Set();
let c = null; for (let k = 0; k < 600 && !c; k++) { M.viver(0.1); seenT.add(th.task ? th.task.type + ':' + (th.task.st === undefined ? '' : th.task.st) : 'nada'); c = (S.crimes || []).slice(n0).find(q => q.thief === th.id) || null; }
if (!c) console.log('(tarefas do ladrão: ' + [...seenT].join(', ') + '; moedas da casa ' + h.coin + ')');
if (!ok('g0 o roubo pela tarefa do jogo', !!c && c.st === 'aberto' && c.n > 0, c ? `${th.name} levou ${c.n} moedas de ${h.type}#${h.id} em ${set.name}` : 'o roubo não aconteceu')) { console.log('FALHOU: 1'); process.exit(1); }
// told to the guard; the thief hidden by the proof's hand
// (hidden, he stays inside: still, over the call of his bed — at night the bed (1,5) took him out to walk home, in the street at
// the door of the hiding place, where a guard who passes sees him —; and the crime told to the guard is told: the witnesses of the
// theft are the ones who told him, their mark gone as the game takes it from a witness who tells (crime.js). In the generation 20
// a witness crossed another soldier of Argos in the seconds of the case, and that one took the thief at the door of the hiding
// place: «o roubo devolvido (não havia cela livre: só a devolução)», T-1004)
const hid = () => { th.inside = hide.id; th.sleeping = false; const d = Vg.door(hide); th.x = d[0]; th.y = d[1]; th.path = null; if (!(th.task && th.task.type === 'idle')) { Vg.endTask(th); H.setTask(th, { type: 'idle', pri: 1.6, wait: 600, kind: 'idle' }); } };
for (const o of S.villagers.values()) { if (o.hunt === c.id && o !== g) o.hunt = 0; if (o.saw && o.saw.crime === c.id) o.saw = null; }
g.hunt = c.id; c.told = S.day; Vg.endTask(g); g.sleeping = false; g.inside = 0; g.energy = 95; g.hunger = 5; hid();
H.setTask(g, { type: 'prender', crime: c.id, id: th.id, pri: 1.6, st: 0, look: 0 });
let hunted = 0; for (let k = 0; k < 3000 && c.gave !== S.day && c.st === 'aberto' && S.day === day0; k++) { hid(); M.viver(0.1); if (g.task && g.task.type === 'prender') hunted++; }
ok('g1 o ladrão escondido: o guarda procura e desiste por hoje, e a caça fica', c.st === 'aberto' && c.gave === S.day && g.hunt === c.id && hunted > 20, `${g.name} (${g.role}) procurou ${(hunted / 10).toFixed(0)} s; o roubo ${c.st}; desistiu hoje: ${c.gave === S.day ? 'sim' : 'NÃO'}; a caça dele: ${g.hunt === c.id ? 'guardada' : 'APAGADA'}`);
// the same day: no hunt given again
{ let again = 0; for (let k = 0; k < 6; k++) { Vg.endTask(g); const t = g.role === 'guerreiro' ? G.Eco.guardTask(g, H) : G.Eco.jobTask(g, H); if (t && t.type === 'prender') again++; } Vg.endTask(g);
  ok('g2 no mesmo dia a ronda e o ofício não o mandam de novo', again === 0 && g.hunt === c.id, `${again} de 6 tarefas foram a caça`); }
// a save in the middle
{ const gid = g.id, cid = c.id, tid = th.id; M.salvarCarregar(); S = G.S; const g1 = S.villagers.get(gid), c1 = S.crimes.find(q => q.id === cid);
  ok('g4 um save no meio: a caça e a marca atravessam', !!g1 && !!c1 && g1.hunt === cid && c1.gave === S.day && c1.st === 'aberto', g1 && c1 ? `a caça ${g1.hunt === cid ? 'igual' : 'PERDIDA'}, a marca ${c1.gave === S.day ? 'igual' : 'PERDIDA'}` : 'o guarda ou o roubo sumiram');
  // the next day, the thief in the street by the guard
  const g2 = g1; th = S.villagers.get(tid); c = c1; S.day += 1; th.inside = 0; th.sleeping = false; Vg.endTask(th); th.x = g2.x + 1.2; th.y = g2.y + 0.6; th.path = null; g2.sleeping = false; g2.inside = 0; g2.energy = 95; g2.hunger = 5; Vg.endTask(g2);
  const t = g2.role === 'guerreiro' ? G.Eco.guardTask(g2, H) : G.Eco.jobTask(g2, H); const went = !!t && t.type === 'prender';
  let k = 0; for (; k < 1500 && c.st === 'aberto'; k++) { M.viver(0.1); if (!(g2.task && g2.task.type === 'prender') && c.st === 'aberto') { Vg.endTask(g2); g2.role === 'guerreiro' ? G.Eco.guardTask(g2, H) : G.Eco.jobTask(g2, H); } }
  ok('g3 no dia seguinte o guarda volta ao roubo e prende o ladrão', went && c.st !== 'aberto' && c.st !== 'prescrito' && g2.hunt === 0, `a primeira tarefa do dia: ${went ? 'a caça' : (t ? t.type : 'nenhuma')}; depois de ${(k / 10).toFixed(0)} s o roubo está «${c.st}»${c.how ? ' (' + c.how + ')' : ''}`);
  // an old theft prescribes
  const old = { id: S.nextId++, kind: 'furto', day: S.day - (G.Crime.PRESC + 1), set: g2.set, thief: th.id, house: c.house, n: 1, x: c.x, y: c.y, seen: [], told: S.day - 3, found: 0, st: 'aberto' }; S.crimes.push(old); g2.hunt = old.id; th.jail = 0;
  Vg.endTask(g2); const t2 = g2.role === 'guerreiro' ? G.Eco.guardTask(g2, H) : G.Eco.jobTask(g2, H);
  ok('g5 um roubo sem solução em ' + G.Crime.PRESC + ' dias prescreve', old.st === 'prescrito' && g2.hunt === 0 && !(t2 && t2.type === 'prender'), `o roubo de ${G.Crime.PRESC + 1} dias atrás: «${old.st}»; a caça ${g2.hunt ? 'AINDA LÁ' : 'acabou'}`);
  S.crimes.splice(S.crimes.indexOf(old), 1);
  const v = QA.check().filter(q => q.sev <= 2); const e = M.erros();
  ok('g6 verificador e erros de módulo', !v.length && M.limpo(), `${v.length} violações S0–S2${v.length ? ': ' + v[0].msg : ''}; erros de módulo ${JSON.stringify(e.mod)}`); }
console.log(fails.length ? `FALHOU: ${fails.length}` : 'TUDO PASSOU'); process.exit(fails.length ? 1 : 0);
