// ladrao-bairro: o ladrão e a vigia pelo bairro (Bairros Vivos, D-156) e a noite do roubo que atravessa o save (L-704).
//   [ONLY=b1,b3] node qa/ladrao-bairro.js [mundo]
// O ladrão escolhia a casa pela bolsa e pela distância, e a ronda da vigia passava por quatro bairros tirados pelo dia. Agora
// os dois leem a vida do bairro (G.Urban): a ronda vai primeiro aos bairros que a cidade chama de perigosos, e o ladrão pesa
// o quanto a casa está vigiada esta noite — ao pé de um cruzamento da ronda, não; longe de todos, sim; numa rua acordada de
// noite (o bairro da taverna), há olhos; num bairro que esvaziou, não há.
// A prova vive dez anos de metrópole pelo salto do jogo (a vida dos bairros se forma) e, num bairro da maior cidade, a mão
// da prova diz à porta do jogo (G.Urban.note) três roubos por ano — o resto é do jogo: o perfil «perigoso», a ronda, a escolha.
// b1 a ronda vai aonde há crime: o bairro perigoso é o primeiro cruzamento da ronda, três noites seguidas (a ronda que o
//    vigia recebe ao escurecer é essa);
// b2 o ladrão pesa a ronda desta noite: a casa ao pé de um cruzamento é mais vigiada que a de longe de todos; com as bolsas
//    iguais, em quarenta escolhas o ladrão quase nunca vai à casa ao pé da ronda (sem ronda nenhuma, ia);
// b3 a rua acordada de noite tem olhos, o bairro vazio não: a mesma casa, com a vida do bairro dela mudada pela porta do
//    jogo, fica mais vigiada com a noite movimentada e menos com o bairro vazio;
// b4 a noite do roubo é do mundo (L-704): o sorteio da noite não se repete depois de um load — o relógio vai no save, e
//    nenhum roubo novo começa na mesma meia-noite;
// b5 a crônica diz o bairro: numa cidade de bairros, «uma casa do Bairro … de Mênfis»; numa vila, «de» a vila (a porta
//    G.Urban.ofPlace, que só lê);
// b6 o preso está na cela a cada passo do mundo (L-723): a tarefa da cela não acaba aos 70 s como um afazer comum; o guarda
//    chamado no meio do caminho deixa o preso na cela, sem um passo solto; a pena cumprida solta;
// e nenhum erro.
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const WORLD = process.argv[2] || 'metropole';
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const on = k => !ONLY || ONLY.includes(k);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | ladrao-bairro ${name} | ${info}`); if (!c) fails.push(name); };
const Cr = G.Crime, U = G.Urban, D = G.Depot, V = G.Village;
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
let S = M.pronto(WORLD);
const novas = base => QA.check().filter(q => q.sev <= 2 && !base.has(q.sys + '|' + q.msg)).map(q => `[S${q.sev}] ${q.sys}: ${q.msg}`);
const houses = set => [...S.buildings.values()].filter(h => h.set === set.id && h.built && G.BDEF[h.type].housing).sort((a, b) => a.id - b.id);
const near = (h, pts) => Math.min(...pts.map(p => G.dist(p[0], p[1], h.x, h.y)));

// the biggest town with three quarters at least that are not fields; one of them — the one with the most houses — is where
// the thefts of the proof happen
const town = [...S.settlements.values()].filter(s => G.Fac.get(s.fac) && U.districtsOf(s).filter(d => d.k !== 'agrario').length >= 3).sort((a, b) => V.pop(b.id) - V.pop(a.id) || a.id - b.id)[0] || null;
if (!town) { ok('a cidade', false, 'nenhuma cidade com três bairros neste mundo'); console.log('LADRAO-BAIRRO: FALHOU (1)'); process.exit(1); }
const inQ = (h, d) => U.at(h.x, h.y) === d;
let bad = U.districtsOf(town).filter(d => d.k !== 'agrario').map(d => [houses(town).filter(h => inQ(h, d)).length, d]).sort((a, b) => b[0] - a[0] || a[1].id - b[1].id)[0][1];
const badId = bad.id; const bx = bad.x, by = bad.y;
// ten years by the game's skip; each year the test's hand tells the game's door three thefts in that quarter
for (let y = 0; y < 10; y++) { god(() => U.note(bx, by, 'crime', 3)); M.saltar(1); }
S = G.S; const set = S.settlements.get(town.id); bad = U.districtsOf(set).find(d => d.id === badId) || null;
const base = new Set(QA.check().filter(q => q.sev <= 2).map(q => q.sys + '|' + q.msg));
console.log(`(${set.name}, ${V.pop(set.id)} habitantes, ${U.districtsOf(set).length} bairros; o bairro dos roubos: ${bad ? `${bad.name} — ${U.profile(bad) || 'sem perfil'}, crime ${((bad.vida || {}).crime || 0).toFixed(2)}` : 'SUMIU'})`);

// ---------------------------------------------------------------- b1
if (on('b1')) {
  const danger = !!bad && U.is(bad, 'perigoso'); const firsts = []; let hit = 0;
  const p0 = bad ? (G.W.nearestLand(bad.x, bad.y, 3) || [bad.x, bad.y]) : [0, 0];
  const d0 = S.day; for (let k = 0; k < 3; k++) { S.day = d0 + k; const pts = god(() => Cr.rondaPoints(set)); firsts.push(pts[0].map(x => x.toFixed(1)).join(',')); if (G.dist(pts[0][0], pts[0][1], bad.x, bad.y) <= 3.5) hit++; } S.day = d0;
  ok('b1 a ronda vai aonde há crime: o bairro perigoso é o primeiro cruzamento, três noites seguidas', danger && hit === 3, `${bad ? bad.name : '—'} ${danger ? 'é «perigoso»' : 'NÃO ficou «perigoso»'} (${bad ? U.profile(bad) : ''}); o primeiro cruzamento da ronda nas três noites: ${firsts.join(' · ')} (o do bairro: ${p0.map(x => x.toFixed(1)).join(',')}): ${hit} de 3`);
  // (and the round the watch takes at dusk is that one — on an evening with the watch in town: after the ten years of the skip
  // the town may be mustering an army that very evening, and its vigia and its warrior, called to arms (muster 3,15, embark
  // 3,3), take no round, as the game has it — crime.js: nobody with a task of 1,6 or more —: Tenochtitlan, in the metrópole
  // of the Bairros Vivos, T-697. The gods' peace by the test's hand, and up to three evenings)
  if (!(S.divinePeace > G.DAY_LEN * 0.25)) G.Politics.divinePeace();
  let g = null; const armed = [];
  const watchOf = () => [...S.villagers.values()].filter(v => v.set === set.id && (v.role === 'vigia' || v.role === 'guerreiro') && !v.captive);
  for (let e = 0; e < 3 && !g; e++) {
    if (e) { const d = S.day; S.time = Math.max(S.time, 0.9995); for (let k = 0; k < 60 && S.day === d; k++) M.viver(0.1); }
    S.time = 0.6; const busy = new Set();
    for (let t = 0; t < 40 && !g; t++) { M.viver(1); g = [...S.villagers.values()].find(v => v.set === set.id && v.task && v.task.type === 'ronda') || null; if (G.isEvening()) for (const w of watchOf()) if (w.task && (w.task.pri || 0) >= 1.6) busy.add(`${w.role} ${w.task.type}`); }
    if (!g) armed.push(`no dia ${S.day} ninguém (${watchOf().length} da vigia${busy.size ? ': ' + [...busy].join(', ') : ''})`);
  }
  const pts = g ? g.task.pts : null; const nv = novas(base);
  // (the crossing is the free ground nearest the quarter's middle, three houses around it at the most: W.nearestLand)
  ok('b1 ao escurecer o vigia recebe essa ronda', !!pts && G.dist(pts[0][0], pts[0][1], bad.x, bad.y) <= 3.5 && !nv.length, g ? `${g.name} (${g.role}) na ronda: primeiro a ${pts[0].join(',')}, depois ${pts.slice(1).map(p => p.join(',')).join(' · ')}; verificador: ${nv.length ? nv.slice(0, 2).join(' | ') : 'limpo'}${armed.length ? ` (antes: ${armed.join('; ')})` : ''}` : `ninguém tomou a ronda em três entardeceres: ${armed.join('; ')}`);
}

// ---------------------------------------------------------------- b2
if (on('b2')) {
  // tonight's round, on a watcher of the town (as the dusk gives it), and the purses of the town's houses made equal by the
  // test's hand: the choice left to the walk, the watch and the chance
  let g = [...S.villagers.values()].find(v => v.set === set.id && v.task && v.task.type === 'ronda') || null;
  const pts = g ? g.task.pts : god(() => Cr.rondaPoints(set));
  if (!g) { g = [...S.villagers.values()].filter(v => v.set === set.id && (v.role === 'vigia' || v.role === 'guerreiro') && !v.captive && !v.aboard).sort((a, b) => a.id - b.id)[0] || null; if (g) god(() => { G.Vg.endTask(g); G.Vg.setTask(g, { type: 'ronda', pts, k: 0, pri: 1.6, st: 0, loop: 1, kind: 'ronda' }); }); }
  const hs = houses(set); god(() => { for (const h of hs) { const c = h.coin || 0; if (c < 12) D.make('h:' + h.id, 'moedas', 12 - c, { code: 'teste' }); else if (c > 12) D.use('h:' + h.id, 'moedas', c - 12, { code: 'teste' }); h.robbed = 0; } });
  const A = hs.filter(h => near(h, pts) < Cr.NEAR), B = hs.filter(h => near(h, pts) > Cr.FAR);
  const thief = [...S.villagers.values()].filter(v => v.set === set.id && v.age >= 18 && v.age < 60 && !v.captive && !v.aboard && v.role !== 'vigia' && v.role !== 'guerreiro').sort((a, b) => a.id - b.id)[0];
  const round = Cr.roundOf(set.id);
  if (!g || !round || !A.length || !B.length || !thief) ok('b2 o ladrão pesa a ronda desta noite', false, `sem o cenário: vigia ${!!g}, ronda ${!!round}, casas ao pé da ronda ${A.length}, casas longe ${B.length}`);
  else {
    const wA = Cr.watched(A[0], round), wB = Cr.watched(B[0], round);
    const q0 = U.at(A[0].x, A[0].y), q1 = U.at(B[0].x, B[0].y);
    ok('b2 a casa ao pé de um cruzamento da ronda é mais vigiada que a de longe de todos', wA - wB >= 1.5 - 1e-9 - Math.min(1, ((q1 && q1.vida && q1.vida.noite) || 0) * 2) && Cr.watched(A[0], null) < wA, `casa #${A[0].id} a ${near(A[0], pts).toFixed(1)} da ronda: ${wA.toFixed(2)} (sem ronda: ${Cr.watched(A[0], null).toFixed(2)}); casa #${B[0].id} a ${near(B[0], pts).toFixed(1)}: ${wB.toFixed(2)}${q0 ? `; bairros: ${q0.whole ? 'o todo' : q0.name} e ${q1 ? (q1.whole ? 'o todo' : q1.name) : '—'}` : ''}`);
    // forty choices from the middle of the town, with the round and with nobody on it
    const count = () => { let n = 0; for (let k = 0; k < 40; k++) { const h = god(() => Cr.victimFor(thief)); if (h && near(h, pts) < Cr.NEAR) n++; } return n; };
    thief.x = set.cx; thief.y = set.cy;
    const withR = count(); const task = g.task; g.task = null; const without = count(); g.task = task;
    ok('b2 com as bolsas iguais, o ladrão quase nunca vai à casa ao pé da ronda', without >= 6 && withR * 3 <= without, `${A.length} casas ao pé da ronda e ${B.length} longe, de ${hs.length} com 12 moedas; em 40 escolhas de ${thief.name}, do meio da cidade: ${withR} ao pé da ronda (sem ninguém na ronda: ${without})`);
  }
}

// ---------------------------------------------------------------- b3
if (on('b3')) {
  // one house of the quarter of the thefts, and the life of its quarter changed by the game's door: the night's count
  const h = bad ? houses(set).find(x => inQ(x, bad)) : null;
  if (!h) ok('b3 a rua acordada de noite tem olhos, o bairro vazio não', false, 'nenhuma casa no bairro dos roubos');
  else {
    const n0 = (bad.vida && bad.vida.noite) || 0; const tags0 = (bad.tags || []).slice(); const vida0 = Object.assign({}, bad.vida); const wNow = Cr.watched(h, null);
    // (the quarter's nights set by the test's hand on the slow mean the life keeps: quiet streets, then as years of a full
    // tavern leave them, then the quarter emptied — the same house, read three times; and the life put back as it was)
    const quiet = tags0.filter(t => t !== 'vazio');
    bad.tags = quiet; bad.vida.noite = 0; const w0 = Cr.watched(h, null);
    bad.vida.noite = 0.5; const w1 = Cr.watched(h, null);
    bad.vida.noite = 0; bad.tags = quiet.concat(['vazio']); const w2 = Cr.watched(h, null);
    bad.vida = vida0; bad.tags = tags0;
    ok('b3 a rua acordada de noite tem olhos, o bairro vazio não', w1 - w0 >= 0.99 && w2 - w0 <= -0.39 && Cr.watched(h, null) === wNow, `casa #${h.id} em ${bad.name} (a noite de hoje: ${n0.toFixed(2)}, vigiada ${wNow.toFixed(2)}): com a rua quieta ${w0.toFixed(2)}; com a noite do bairro a 0,50: ${w1.toFixed(2)}; com o bairro vazio: ${w2.toFixed(2)}`);
  }
}

// ---------------------------------------------------------------- b4
if (on('b4')) {
  // the evening's draw of the theft, and a save loaded in the same evening: the clock is the world's
  S.time = 0.61; M.viver(3); const nk = S.day * 2; const c0 = G.mod('crime.night');
  // (whoever the evening sent to steal is let go by the test's hand: the case is the second draw)
  const going = () => [...S.villagers.values()].filter(v => v.task && v.task.type === 'furto');
  const first = going().length; god(() => { for (const v of going()) G.Vg.endTask(v); });
  M.salvarCarregar(); S = G.S; const c1 = G.mod('crime.night');
  let again = 0; for (let t = 0; t < 20 && G.isEvening(); t++) { M.viver(1); again = Math.max(again, going().length); }
  const nv = novas(base);
  ok('b4 a noite do roubo é do mundo: o sorteio não se repete depois de um load (L-704)', c0 === nk && c1 === nk && again === 0 && !nv.length, `ao entardecer do ano ${S.day}: o relógio do roubo ${c0 === nk ? 'marcou a noite' : `NÃO marcou (${c0})`} (${first} roubo(s) sorteado(s)); depois do load: ${c1 === nk ? 'a mesma noite' : `PERDEU a noite (${c1})`}; roubos novos no mesmo entardecer: ${again}; verificador: ${nv.length ? nv.slice(0, 2).join(' | ') : 'limpo'}`);
}

// ---------------------------------------------------------------- b5
if (on('b5')) {
  const set5 = S.settlements.get(town.id); const big = (set5.tier || 0) >= 3;
  const h = houses(set5).find(x => { const q = U.at(x.x, x.y); return q && !q.whole && q.set === set5.id; });
  const q = h ? U.at(h.x, h.y) : null; const w = h ? U.ofPlace(h.x, h.y, set5) : '';
  const small = [...S.settlements.values()].filter(s => G.Fac.get(s.fac) && (s.tier || 0) < 3).sort((a, b) => a.id - b.id)[0] || null;
  const ws = small ? U.ofPlace(small.cx, small.cy, small) : ''; const acc0 = JSON.stringify(S.urbAcc || {});
  ok('b5 a crônica diz o bairro: «uma casa do Bairro … da cidade»; numa vila, a vila', big && !!q && w === ` ${U.ofName(q)} de ${set5.name}` && w.includes(q.name) && (!small || ws === ` de ${small.name}`) && U.ofPlace(undefined, undefined, set5) === ` de ${set5.name}` && JSON.stringify(S.urbAcc || {}) === acc0,
    `${set5.name} (nível ${set5.tier}): «uma casa${w}»; ${small ? `${small.name} (nível ${small.tier || 0}): «uma casa${ws}»` : 'nenhuma vila neste mundo'}; sem lugar: «${U.ofPlace(undefined, undefined, set5).trim()}»`);
}

// ---------------------------------------------------------------- b6
if (on('b6')) {
  // a prisoner in his cell, every step of the world: the hand of the proof sentences a free grown-up of a town with a jail
  // and asks an errand of him — the game's own door (Cr.keeps) gives him the cell
  const jail = [...S.buildings.values()].filter(b => b.type === 'cadeia' && b.built && S.settlements.get(b.set)).sort((a, b) => a.id - b.id)[0] || null;
  const free = v => v.age >= 18 && !v.captive && !v.jail && !v.aboard && !v.ug && !v.held && !Cr.law(v) && !(S.avatar && S.avatar.id === v.id) && !(v.task && v.task.pri >= 3);
  const folk = jail ? [...S.villagers.values()].filter(v => v.set === jail.set && free(v)).sort((a, b) => a.id - b.id) : [];
  const held = v => !!(v.task && (v.task.type === 'cela' || v.task.type === 'levado'));
  const p = folk[0] || null, q = folk[1] || null, g = folk[2] || null;
  let gaps = 0, steps = 0, inCell = false, walkGap = 0, walked = false, out = false, again = 0;
  if (p && q && g) {
    god(() => { p.jail = jail.id; p.jailUntil = S.day + 3; G.Vg.setTask(p, { type: 'wander', pri: 0 }); });
    inCell = held(p) && p.task.type === 'cela'; let cell = p.task;
    // (160 s of the world, a tenth at a time: the cell's task used to end at 70 s and at 140 s, and be given again at the
    // prisoner's next choice — a part of a step later, so the tenth of a second seldom saw him with none: the task of the
    // cell is the same one from the first step to the last)
    for (let k = 0; k < 1600 && p.jail; k++) { M.viver(0.1); steps++; if (p.jail && !held(p)) gaps++; if (p.jail && p.task !== cell) { again++; cell = p.task; } }
    // the walk to the jail whose guard is called away: the one led is in the cell at the next step, and stays
    god(() => { q.jail = jail.id; q.jailUntil = S.day + 3; G.Vg.setTask(q, { type: 'levado', by: g.id, pri: 5.4, kind: 'levado' }); G.Vg.setTask(g, { type: 'levar', id: q.id, jail: jail.id, pri: 3.2, kind: 'levar', st: 0 }); });
    M.viver(1); walked = !!(q.task && q.task.type === 'levado'); god(() => G.Vg.endTask(g));
    for (let k = 0; k < 30 && q.jail; k++) { M.viver(0.1); if (q.jail && !held(q)) walkGap++; }
    // the sentence served: out at the next step of the cell
    god(() => { p.jailUntil = S.day; q.jailUntil = S.day; }); M.viver(1); out = !p.jail && !q.jail;
  }
  const nv = novas(base);
  ok('b6 o preso está na cela a cada passo do mundo: a tarefa da cela não acaba aos 70 s, o guarda chamado no caminho deixa o preso na cela, e a pena cumprida solta (L-723)',
    !!p && !!q && !!g && inCell && steps >= 1600 && gaps === 0 && again === 0 && walked && walkGap === 0 && out && !nv.length,
    !jail ? 'nenhuma cadeia de pé neste mundo' : !(p && q && g) ? `só ${folk.length} adultos livres em ${S.settlements.get(jail.set).name}` :
    `${p.name}, de ${S.settlements.get(jail.set).name}: ${inCell ? 'na cela pela porta do jogo' : 'NÃO foi para a cela'}; em ${steps} passos (160 s), ${gaps} sem a tarefa da cela, e a tarefa da cela ${again ? `ACABOU E FOI DADA DE NOVO ${again} vez(es)` : 'a mesma do começo ao fim'}; ${q.name}, levado por ${g.name}: ${walked ? 'a caminho' : 'NÃO ficou a caminho'}, e com o guarda chamado, ${walkGap} passo(s) sem a cela; a pena cumprida: ${out ? 'os dois soltos' : 'NÃO soltos'}${nv.length ? ' · o verificador: ' + nv.slice(0, 2).join(' · ') : ''}`);
}

ok('nenhum erro', M.limpo(), M.limpo() ? 'nenhum erro de módulo, nenhum aviso' : JSON.stringify(M.erros()).slice(0, 300));
console.log(fails.length ? `LADRAO-BAIRRO: FALHOU (${fails.length})` : 'LADRAO-BAIRRO: PASSOU');
process.exit(fails.length ? 1 : 0);
