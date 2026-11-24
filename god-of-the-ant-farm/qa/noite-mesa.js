// noite-mesa: a noite que dura para quem a vive (a onda 4, frente N — D-960 a D-964), em Node, na metrópole pronta.
// O dono jogou uma partida das Tabuletas e, quando acabou, a taverna estava vazia: o dia do mundo tem 200 s, o corpo o vive a 0,27
// (Space.TIME), e do anoitecer ao fechamento eram menos de dois minutos de verdade — e o outro largou a mesa no meio («Empate — 10 × 8 —
// O outro foi embora: cada um leva o que pôs»). Agora o relógio do dia se demora com o corpo na taverna (G.linger: «taverna», «mesa»),
// o que a noite gasta vai com ele (o copo, o prato, a conversa, a espera, a bebida no sangue: G.paceCorpo), quem joga com o corpo fica até
// o fim, o fechamento espera a última partida e quem larga a mesa perde.
//  n1 os minutos de verdade da noite do corpo na taverna, do anoitecer (0,73) ao fechamento: sentado a uma mesa — e sem o corpo
//  n2 uma partida custa no máximo uma hora do jogo: as Tabuletas e o copo dos dados no passo de um jogador; o passo do dia é o da mesa
//  n3 as rodadas, os pratos e a bebida dos fregueses por freguês-hora da noite, com e sem o corpo (com tolerância) — e com o corpo mas sem
//     o relógio da noite (a mão da prova): muito mais
//  n4 o fechamento espera a última partida, diz isso, e fecha quando ela acaba; a paciência do taverneiro (T.ULTIMA); depois do chamado,
//     nenhuma partida nova
//  n5 ninguém larga a partida do corpo no meio (a hora dele, a fome, o cansaço, a espera sem serviço); e quem larga perde — o pânico, o
//     desmaio da bebida —; no copo, quem sai perde os dados, e o dono dos dados que sai perde o que pôs
//  n6 o save no meio da partida e no meio da espera do fechamento: o mesmo futuro duas vezes; a demora não vai no save
//  n7 os casos ruins: o corpo que morre no meio, o deus que tira a bebida, a taverna que pega fogo, a guerra à porta
//  n8 sem o corpo, o mundo igual ao de antes, numa cópia do jogo de antes: node qa/noite-mesa.js igual PASTA
//  e o verificador (QA.check: «noite», «dia», «taverna») e nenhum erro de módulo nem aviso no console.
//   [ONLY=n1,…,n7] node qa/noite-mesa.js [mundo]       (≈ 8 min; a n3 é a mais longa)
//   node qa/noite-mesa.js igual PASTA                  (≈ 3 min: as duas árvores, cada uma no seu processo)
'use strict';
const path = require('path');
if (process.argv[2] === 'igual') { igual(process.argv[3]); return; }
const M = require('./nodemundo.js'); const G = M.load({ qa: true, extra: ['js/space.js', 'js/people3d.js', 'js/anim-gait.js', 'js/anim-clips.js', 'js/anim-body.js', 'js/possess.js', 'js/interact.js', 'js/avatar.js', 'js/interacao-clips.js'] });
const C = G.Cartas, JD = G.JogoDados, D = G.Depot, A = G.Act, T = G.Taverna, V = G.Village;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | noite-mesa ${name} | ${info}`); if (!c) fails.push(name.split(' ')[0]); };
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null; const on = k => !ONLY || ONLY.includes(k);
const world = process.argv[2] || 'metropole';
const S = () => G.S;
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
const calm = () => { const w = S().weather; w.rain = 0; if (w.storm) w.storm = 0; if (!(S().divinePeace > G.DAY_LEN * 0.5)) god(() => G.Politics.divinePeace()); for (const s of S().settlements.values()) { if (s.alarmT > 0) s.alarmT = 0; s.festPlan = { day: S().day, key: null, done: true }; } };
const TL = () => G.Space.TILE; const RDT = 1 / 30;
const frame = () => { G.debug.step(RDT * G.Space.TIME); G.Avatar.frame(RDT); };
const fast = () => { G.debug.step(0.1); G.Avatar.frame(RDT); }; // (the body's frame only with a body: Avatar.frame)
const until = (f, sec) => { const t0 = S().clock; while (!f() && S().clock - t0 < sec) fast(); return f(); };
const r2 = x => Math.round(x * 100) / 100;
// (the hour of the HUD — incui.js hourOf: the day from 6 h to 19 h over 0,02–0,73, the night from 19 h to 6 h over the rest)
const H = t => (t >= 0.02 && t <= 0.73 ? 6 + (t - 0.02) / 0.71 * 13 : 19 + (((t - 0.73) + 1) % 1) / 0.29 * 11);
const hoursBetween = (t0, t1) => { let h = H(t1) - H(t0); if (h < -1e-9) h += 24; return h; };
const THINK = 25; // (the player's seconds of thought before each move: seven rounds thought through, three minutes)
const think = sec => { const n = Math.round(sec * G.Space.TIME / 0.1); for (let k = 0; k < n; k++) fast(); };
// (the rules this proof watches — the S2 and worse of the night, the day and the tavern —, new against the start of each part)
const SYS = new Set(['noite', 'dia', 'taverna', 'dados', 'jogos', 'ebrio']);
let base = new Set(); const rebase = () => { base = new Set(QA.check().filter(q => q.sev <= 2 && SYS.has(q.sys)).map(q => q.sys + '|' + q.msg)); };
const novas = () => QA.check().filter(q => q.sev <= 2 && SYS.has(q.sys) && !base.has(q.sys + '|' + q.msg)).map(q => `S${q.sev} ${q.sys}: ${q.msg.slice(0, 140)}`);
// (the ledger's lines of the pots and of the tables: [n, day, clock, from, to, good, n, op, code, by])
const led = []; D.onMove.push(e => led.push({ from: String(e[3]), to: String(e[4]), k: e[5], n: e[6], c: e[8], by: e[9], t: G.S ? G.S.time : 0 }));
// (what the keepers said — the closing, the last game)
const said = []; { const s0 = G.Falas.say; G.Falas.say = function (v, key, ctx) { said.push({ key, v: v && v.id, t: G.S ? G.S.time : 0 }); return s0.apply(this, arguments); }; }

// ---------------- sitting the body at a table (the verb «lugar», as the player does it — qa/cartas.js c7) ----------------
const SEATK = { banquinho: 1, banco: 1, cadeira: 1 };
function seatIn(b, v, pick) {
  const In = G.Interiors, Po = G.Possess, I = G.Interact;
  const p = G.Space.planNow(b); if (!p || !p.entrance) return { why: 'sem planta' };
  const lv = p.entryLv || 0; const ex = p.entrance.x, ez = p.entrance.z;
  const pls = In.freeNear(b, lv, ex, ez, 40, ['sentar', 'comer']).filter(q => SEATK[q.it.kind] && In.walkIn(b, q) < Infinity && (!pick || pick(q)));
  if (!pls.length) return { why: 'nenhum assento livre' };
  const pl = pls[0]; pl.at = In.standFor(b, pl, pl.x, pl.z);
  if (!Po.is(v)) { G.Vg.endTask(v); v.path = null; if (!Po.take(v).ok) return { why: 'não encarnou' }; } else G.Avatar.detach();
  v.inside = b.id; v.x = b.x + pl.at[0] / TL(); v.y = b.y + pl.at[1] / TL(); Po.setLevel(pl.lv); G.Avatar.attach(v, 0); for (let k = 0; k < 4; k++) frame();
  const st = G.Avatar.state(); let best = null;
  for (let k = 0; k < 60 && !(best && best.id === 'lugar'); k++) { const ya = Math.atan2(b.y * TL() + pl.z - st.Z, b.x * TL() + pl.x - st.X); G.Avatar.input.camYaw = ya; st.yaw = ya; best = I.best(); frame(); }
  if (!(best && best.id === 'lugar')) return { why: `o E oferece ${best ? '«' + best.label + '»' : 'nada'}` };
  I.run(best); for (let k = 0; k < 150 && !(G.Avatar.seatNow() && G.Avatar.seatNow().k >= 1); k++) frame();
  const u = Po.useOf(); return { ok: !!u && u.b === b.id };
}
// (an open tavern with a table of people, someone of its people for the god to live, sat at that table; for a game, someone there who
// plays the body's game — the tablets with the two decks of the house free and, for a stake, of another house than the body's (of the
// same house one plays dry); the dice with its own set in the bag (o.dados: the proof's hand gives a set of wood) and someone free there.
// findSeat.why: what was found where nothing was)
function findSeat(o) {
  o = o || {}; const Po = G.Possess; findSeat.why = [];
  const L = A.all().filter(x => x.def === 'taverna' && A.live(x)).sort((a, b) => Object.keys(b.data.mesa).length - Object.keys(a.data.mesa).length || a.id - b.id);
  for (const op of L) {
    const b = S().buildings.get(op.at); if (!b || !T.aberta(b) || !G.Interiors.has(b)) continue;
    if (o.cartas && G.JogosCasa.casa(b, 'baralho').livres < 2) { findSeat.why.push(`#${b.id} sem dois baralhos livres`); continue; }
    const fid = V.facOfSet(b.set); const kp = T.keeperOf(b);
    const gs = [...new Set(Object.keys(op.data.mesa).map(id => op.data.mesa[id]).filter(m => m.st >= 2 && m.g && !m.corpo).map(m => String(m.g)))].sort(); if (!gs.length) continue;
    const homes = new Set(Object.keys(op.data.mesa).map(id => S().villagers.get(+id)).filter(Boolean).map(q => G.Eco.coinRef(q)));
    const v = [...S().villagers.values()].filter(q => q !== kp && q.age >= 18 && q.age < 55 && !q.sleeping && !q.inside && G.Fac.idOfV(q) === fid && Po.can(q).ok && D.get(G.Eco.coinRef(q), 'moedas') >= 1.5 && !(o.aposta && homes.has(G.Eco.coinRef(q)))).sort((a, c) => G.dist(a.x, a.y, b.x, b.y) - G.dist(c.x, c.y, b.x, b.y) || a.id - c.id)[0];
    if (!v) { findSeat.why.push(`#${b.id} sem quem viver`); continue; }
    for (const g of gs) {
      const r = seatIn(b, v, q => String(G.Interiors.groupOf(b, q.it.id)) === g); if (!r.ok) continue;
      if (o.cartas) { until(() => C.podeCorpo(v).ok, 3); const pc = C.podeCorpo(v); if (pc.ok && (!o.aposta || pc.apostas.length > 1)) return { b, body: v, op }; findSeat.why.push(`#${b.id} mesa ${g}: ${pc.why || 'sem aposta'}`); continue; }
      if (o.dados) { if (!D.get('m:' + v.id, 'dados.madeira')) god(() => D.make('m:' + v.id, 'dados.madeira', 1, { code: 'teste', by: v.id })); until(() => JD.verbo(v).ok, 3); const vb = JD.verbo(v); if (vb.k === 'chamar' && vb.ok && (!o.aposta || (vb.apostas || []).some(x => x > 0))) return { b, body: v, op }; findSeat.why.push(`#${b.id} mesa ${g}: ${vb.k || '-'} ${vb.why || ''}`); continue; }
      return { b, body: v, op };
    }
    if (Po.body()) Po.release('teste'); fast();
  }
  return null;
}
const ask = fn => { const it = G.Possess.apply(fn); until(() => !!it.res, 2); return it.res || { ok: false, why: 'sem resposta' }; };
// (the body challenges the best one at its table, at a stake when the people has coin)
function challenge(body) {
  const pc = C.podeCorpo(body); if (!pc.ok) return { why: pc.why };
  const ap = pc.apostas.length > 1 ? pc.apostas[1] : 0;
  const d = ask(w => C.desafia(w, pc.o, ap)); if (!d.ok) return { why: d.why };
  const j = C.vivoDe(body); return j ? { j, o: S().villagers.get(pc.o), ap } : { why: 'sem partida' };
}
// (one move of the body's — after its thought —: the double asked answered yes, else the card its own good sense would choose)
function move(body, j, sec) {
  think(sec); j = C.jogo(j.id); if (!j || j.fase !== 'jogo') return j;
  const vv = C.doCorpo(body); if (!vv) return C.jogo(j.id);
  if (vv.dobra === 'outro') { ask(w => C.respondeCorpo(w, j.id, true)); return C.jogo(j.id); }
  const id = C.ia(j.s, j.corpo, { ousado: 0.5 }); ask(w => C.lance(w, j.id, id, false)); return C.jogo(j.id);
}
const awayFrom = (op, ids) => Object.keys(op.data.mesa).filter(id => !op.data.mesa[id].corpo && !ids.includes(+id)).length;
const coins = v => D.get(G.Eco.coinRef(v), 'moedas');

// ---------------- the snapshots: the ready world at the fall of night, and an hour and a half into it ----------------
M.pronto(world); M.viver(5);
{ let k = 0; while (!(S().time > 0.7 && S().time < 0.72) && k++ < 6000) { calm(); M.viver(1); } }
const DUSK = G.Save.serialize();
{ let k = 0; while (!(S().time > 0.78 && S().time < 0.8) && k++ < 6000) { calm(); M.viver(1); } }
const NIGHT = G.Save.serialize();
// (a snapshot opened: the 3D body of the one before let go — the world's body, if the save has one, goes on by its hands, Possess.apply)
const open = snap => { G.Avatar.detach(); M.abrir(JSON.parse(snap)); G.Main.mode = 'game'; calm(); rebase(); };

// ================================ n1: the minutes of the night ================================
if (on('n1')) {
  const bad = [];
  // (the body sat at a table of the fullest tavern, living the night to its closing; and the same night with nobody's body)
  open(DUSK); const P = findSeat({}); let corpo = null, sem = null;
  if (!P) bad.push('nenhuma taverna com uma mesa de gente e alguém para o deus viver');
  else {
    const b = P.b, bid = b.id; const fecha = T.horas(b).fecha; let secs = 0, k = 0; const paces = new Map();
    while (S().time < 0.73 && k++ < 20000) { calm(); fast(); }
    // (the pace sampled while the house is open: past its hour its day ends at the next look of it, a second later)
    while (T.dia(b) && k++ < 40000) { calm(); const aberta = T.aberta(b); fast(); secs += 0.1; if (aberta) paces.set(G.pace, (paces.get(G.pace) || 0) + 1); }
    corpo = { secs, min: secs / G.Space.TIME / 60, paces: [...paces].map(([p, n]) => `${p} ×${n}`).join(', '), fecha, t: S().time };
    if ([...paces.keys()].some(p => p !== T.PACE_SALA)) bad.push(`o passo do dia com o corpo à mesa (sem jogar) foi ${corpo.paces}, não ${T.PACE_SALA}`);
    if (G.Possess.body()) G.Possess.release('teste'); fast();
    open(DUSK); const b2 = S().buildings.get(bid); let s2 = 0; k = 0;
    while (S().time < 0.73 && k++ < 20000) { calm(); M.viver(0.1); }
    while (T.dia(b2) && k++ < 40000) { calm(); M.viver(0.1); s2 += 0.1; }
    sem = { secs: s2, min: s2 / G.Space.TIME / 60 };
    if (!(corpo.min >= 10 && corpo.min <= 15)) bad.push(`com o corpo, ${corpo.min.toFixed(1)} min de verdade do anoitecer ao fechamento (o alvo: 10 a 15)`);
    if (!(sem.min < 2.5)) bad.push(`sem o corpo, ${sem.min.toFixed(1)} min — a noite de antes devia ser a mesma (menos de 2,5)`);
  }
  ok('n1 os minutos de verdade da noite, do anoitecer ao fechamento', !bad.length && M.limpo() && !novas().length,
    corpo ? `${G.Village.buildName(P.b)} de ${S().settlements.get(P.b.set).name} (fecha às ${corpo.fecha}): com o corpo sentado, ${corpo.secs.toFixed(0)} s do mundo = ${corpo.min.toFixed(1)} min de verdade (o passo: ${corpo.paces}); sem o corpo, ${sem.secs.toFixed(0)} s = ${sem.min.toFixed(1)} min${bad.length ? ' — ' + bad.join(' | ') : ''} ${novas().slice(0, 2).join(' | ')}` : bad.join(' | '));
}

// ================================ n2: a game costs at most an hour of the game ================================
if (on('n2')) {
  const bad = [], info = [];
  open(NIGHT); const P = findSeat({ cartas: 1 });
  if (!P) bad.push('nenhuma mesa onde o corpo possa jogar as Tabuletas');
  else {
    const body = P.body; const c = challenge(body); if (!c.j) bad.push('o desafio: ' + c.why);
    else {
      let j = c.j; const t0 = S().time, c0 = S().clock; const paces = new Map(); const o = c.o; let held = 0, looks = 0;
      while (j && j.fase === 'jogo') { const n0 = S().clock; j = move(body, j, THINK); paces.set(G.pace, (paces.get(G.pace) || 0) + 1); looks++; if (o.task && o.task.type === 'tavern' && o.task.pri >= T.SEGURA) held++; if (S().clock - c0 > 900) break; void n0; }
      const hrs = hoursBetween(t0, S().time), real = (S().clock - c0) / G.Space.TIME / 60; const fim = j && j.s.fim;
      info.push(`as Tabuletas com ${o.name}: ${fim ? fim.por : 'sem fim'} em ${real.toFixed(1)} min de verdade, ${(hrs * 60).toFixed(0)} min do jogo (das ${H(t0).toFixed(2)} h às ${H(S().time).toFixed(2)} h); o passo ${[...paces.keys()].join(', ')}; ${o.name} segurado em ${held} de ${looks} olhadas`);
      if (!fim) bad.push('a partida não acabou'); else if (fim.por === 'abandono') bad.push('o outro largou a mesa');
      if (!(hrs <= 1)) bad.push(`a partida custou ${hrs.toFixed(2)} horas do jogo`);
      if ([...paces.keys()].some(p => p !== T.PACE_MESA)) bad.push(`o passo na partida foi ${[...paces.keys()].join(', ')}, não ${T.PACE_MESA}`);
      if (held < looks - 1) bad.push(`o adversário não pesava T.SEGURA na partida (${held} de ${looks})`);
    }
    if (G.Possess.body()) G.Possess.release('teste'); fast();
  }
  // (the dice: the body calls its table to the cup, and bids in its turn, thinking as long)
  open(NIGHT); const Q = findSeat({ dados: 1 });
  if (!Q) info.push(`o copo: nenhuma mesa com quem jogue os dados com o corpo nesta noite (${findSeat.why.slice(0, 4).join('; ')})`);
  else {
    const body = Q.body; const vb = JD.verbo(body); const ap = vb.apostas && vb.apostas.length ? vb.apostas[0] : 0;
    const r = ask(w => JD.chamar(w, ap)); const op = r.ok ? A.get(r.op) : null;
    if (!op || op.data.quem.length < 2) info.push(`o copo: ninguém aceitou (${r.why || ''})`);
    else {
      const st = ask(w => JD.comecar(w, op.id)); const t0 = S().time, c0 = S().clock; const paces = new Set(); const quem = op.data.quem.filter(id => id !== body.id);
      if (!st.ok) bad.push('o copo não começou: ' + st.why);
      while (A.live(op) && op.data.fase !== 'fim' && S().clock - c0 < 900) {
        const d = op.data;
        if (d.fase === 'palpite' && d.ordem[d.vez] === body.id) { think(12); if (!A.live(op) || op.data.fase !== 'palpite' || op.data.ordem[op.data.vez] !== body.id) continue; const L = JD.R.livres(d); const want = JD.R.soma(d.faces[body.id]) + 3.5 * (JD.R.nDados(d) - (d.n[body.id] | 0)); const n = L.slice().sort((x, y) => Math.abs(x - want) - Math.abs(y - want) || x - y)[0]; ask(w => JD.palpite(w, op.id, n)); }
        else fast();
        if (JD.gameOf(body)) paces.add(G.pace);
      }
      const hrs = hoursBetween(t0, S().time), real = (S().clock - c0) / G.Space.TIME / 60; const fora = quem.filter(id => op.data.fora[id] === 'saiu');
      info.push(`o copo com ${quem.length}: ${op.data.fim || (A.live(op) ? 'sem fim' : 'acabou')} em ${real.toFixed(1)} min de verdade, ${(hrs * 60).toFixed(0)} min do jogo; o passo ${[...paces].join(', ')}; ${fora.length} saíram`);
      if (!(hrs <= 1)) bad.push(`o copo custou ${hrs.toFixed(2)} horas do jogo`);
      if ([...paces].some(p => p !== T.PACE_MESA)) bad.push(`o passo no copo foi ${[...paces].join(', ')}`);
      if (fora.length) bad.push(`${fora.length} largaram o copo do corpo no meio`);
    }
    if (G.Possess.body()) G.Possess.release('teste'); fast();
  }
  ok('n2 uma partida custa no máximo uma hora do jogo', !bad.length && M.limpo() && !novas().length, `${info.join('; ')}${bad.length ? ' — ' + bad.join(' | ') : ''} ${novas().slice(0, 2).join(' | ')}`);
}

// ================================ n3: the rounds and the drink of the night, with and without the body ================================
if (on('n3')) {
  const bad = [], info = [];
  // (the god's body at another tavern, by the proof's hand: inside it, a guest of it, awake — the sun lingers for it; its own tavern's
  // tables are not the ones measured)
  const lingerAt = avoid => { const Po = G.Possess; for (const b of [...S().buildings.values()].filter(q => q.type === 'taverna' && q.built && T.aberta(q) && !avoid.includes(q.id)).sort((x, y) => x.id - y.id)) {
    const fid = V.facOfSet(b.set); const v = [...S().villagers.values()].filter(q => q.age >= 18 && q.age < 55 && !q.sleeping && !q.inside && q.job !== b.id && q.home !== b.id && G.Fac.idOfV(q) === fid && Po.can(q).ok).sort((x, y) => x.id - y.id)[0];
    if (!v) continue; god(() => { G.Vg.endTask(v); v.path = null; Po.take(v); const d = G.Vg.door(b); v.x = d[0]; v.y = d[1]; v.inside = b.id; }); M.viver(0.1); if (G.pace === T.PACE_SALA) return v; if (Po.body()) Po.release('teste'); } return null; };
  // ---- a: a round lasts the same share of the night — the cups at the tables when the night is taken, to their end, with and without the
  // body lingering the sun (the same cup, the same stamp; only the clock differs)
  { open(NIGHT); const cups = []; for (const op of A.all().filter(x => x.def === 'taverna' && A.live(x)).sort((x, y) => x.id - y.id)) for (const id of Object.keys(op.data.mesa).sort((x, y) => x - y)) {
      const m = op.data.mesa[id]; const v = S().villagers.get(+id); if (!v || m.corpo || m.body || m.st !== 3 || !v.carry || v.carry.op !== op.id || T.brawling(v)) continue; if (cups.length < 6) cups.push({ id: +id, op: op.id, b: op.at, cup: m.cup }); }
    const end = (withBody) => { open(NIGHT); const avoid = cups.map(c => c.b); const body = withBody ? lingerAt(avoid) : null; if (withBody && !body) return null; const t0 = S().time, out = {}; let k = 0;
      while (Object.keys(out).length < cups.length && k++ < 6000) { if (body) fast(); else M.viver(0.1); for (const c of cups) { if (out[c.id] !== undefined) continue; const op = A.get(c.op); const m = op && op.data.mesa[c.id]; const v = S().villagers.get(c.id);
        if (!m || m.st !== 3 || !v || !v.carry || v.carry.op !== c.op) out[c.id] = S().time - t0; } }
      if (G.Possess.body()) G.Possess.release('teste'); fast(); return out; };
    if (!cups.length) info.push('a: nenhum copo nas mesas nesta noite');
    else { const A0 = end(false), B0 = end(true); if (!B0) bad.push('a: o corpo não achou outra taverna para demorar o sol');
      else { const diffs = cups.map(c => [A0[c.id], B0[c.id]]); const off = diffs.filter(([x, y]) => !(Math.abs(x - y) <= Math.max(6e-4, 0.03 * x)));
        info.push(`a: ${cups.length} copos às mesas, o resto de cada um até o fim — sem o corpo ${diffs.map(d => (d[0] * 100).toFixed(2)).join(', ')} centésimos do dia; com o corpo demorando o sol ${diffs.map(d => (d[1] * 100).toFixed(2)).join(', ')}`);
        if (off.length) bad.push(`a: ${off.length} copos duraram outra parte da noite com o corpo`); } } }
  // ---- b: the drink in the blood goes down the same by the hour of the night — one with a night's drink in him, by the proof's hand
  { const pick = () => [...S().villagers.values()].filter(v => v.age >= 25 && v.age < 55 && !v.sleeping && !v.inside && !(v.task && v.task.type === 'tavern') && !(S().avatar && S().avatar.id === v.id)).sort((x, y) => x.id - y.id)[0];
    const blood = withBody => { open(NIGHT); if (withBody && !lingerAt([])) return null; const y = pick(); god(() => G.Ebrio.prova(y, 0.6)); const t0 = S().time; let k = 0; while (S().time - t0 < 0.01 && k++ < 3000) { calm(); if (withBody) fast(); else M.viver(0.1); } const r = { id: y.id, e: y.ebrio, dt: S().time - t0 }; if (G.Possess.body()) G.Possess.release('teste'); fast(); return r; };
    const a0 = blood(false), b0 = blood(true);
    if (!b0) bad.push('b: o corpo não achou taverna para demorar o sol');
    else { info.push(`b: o sangue de #${a0.id} de 0,6 para ${a0.e.toFixed(4)} em ${(a0.dt * 100).toFixed(2)} centésimos do dia sem o corpo, ${b0.e.toFixed(4)} em ${(b0.dt * 100).toFixed(2)} com ele`);
      if (a0.id !== b0.id || Math.abs(a0.e - b0.e) > 0.02 * Math.max(0.05, 0.6 - a0.e) + 1e-3) bad.push('b: a bebida no sangue desceu outra coisa por hora da noite com o corpo'); } }
  // ---- c: the city's night, measured — from a little after the fall of night to before the closing call, every tavern of the world: the
  // rounds and the plates by the ledger («bebida», «refeição»), the customer-hours at the tables (each one seated, by the hours of the HUD
  // that went by), the mean of the drink in the blood of who sits there; with the body sat at a table, and without. What is lived stays
  // in the seconds of the world — the walk there, the keeper's legs —: with the night longer, a round comes sooner in the night's hours,
  // and the last one comes before one's hour to go home where it used to come after it (D-961). A ceiling, not an equality: CRU=1 also
  // lives the night with the body and no night's clock (the proof's hand), to show what it holds back
  { const T1 = 0.86; let SNAP3 = null; { open(DUSK); let k = 0; while (S().time < 0.735 && k++ < 20000) { calm(); M.viver(0.1); } SNAP3 = G.Save.serialize(); }
    const run = kind => {
      open(SNAP3); const orig = G.dayPace.corpo; let body = null;
      if (kind !== 'sem') { const P = findSeat({}); body = P ? P.body : null; if (!body) return null; if (kind === 'cru') G.dayPace.corpo = () => 1; }
      const L0 = led.length, t0 = S().time; let ch = 0, bl = 0, k = 0; const me = () => (S().avatar ? S().avatar.id : 0);
      while (S().time < T1 && k++ < 40000) { calm(); const tp = S().time; if (body) fast(); else M.viver(0.1); const dh = H(S().time) - H(tp);
        for (const v of S().villagers.values()) { const t = v.task; if (t && t.type === 'tavern' && t.st >= 2 && v.id !== me()) { ch += dh; bl += (v.ebrio || 0) * dh; } } }
      G.dayPace.corpo = orig;
      const L = led.slice(L0); const not = l => +l.by !== (body ? body.id : -1); const r = L.filter(l => l.c === 'bebida' && not(l)).length, p = L.filter(l => l.c === 'refeicao' && not(l)).length;
      if (G.Possess.body()) G.Possess.release('teste'); fast();
      return { kind, ch, r, p, rph: (r + p) / ch, dph: r / ch, blood: bl / ch, t0 };
    };
    const sem = run('sem'), corpo = run('corpo'), cru = process.env.CRU ? run('cru') : null;
    const fmt = x => (x ? `${x.r} rodadas e ${x.p} pratos em ${x.ch.toFixed(0)} fregueses-hora (${x.rph.toFixed(3)} por freguês-hora; o sangue à mesa ${x.blood.toFixed(4)})` : '—');
    info.push(`c: a cidade das ${H(0.735).toFixed(1)} h às ${H(T1).toFixed(1)} h — sem o corpo ${fmt(sem)}; com o corpo à mesa ${fmt(corpo)}${cru ? `; com o corpo e sem o relógio da noite ${fmt(cru)}` : ''}`);
    // (measured and said, D-965: a night's few dozen rounds carry a noise of a third of their count; what is held is that it is never the
    // gross distortion the night's clock is there to prevent — the rounds of three times the night, the blood running up)
    if (!sem || !corpo) bad.push('c: uma das noites não pôde ser vivida');
    else { const q = sem.rph > 0 ? corpo.rph / sem.rph : 1; const n = sem.r + sem.p + corpo.r + corpo.p; info.push(`c: ${q.toFixed(2)}× as rodadas por freguês-hora (o ruído de uma noite: ±${(q * Math.sqrt(1 / Math.max(1, sem.r + sem.p) + 1 / Math.max(1, corpo.r + corpo.p))).toFixed(2)}, de ${n} copos)`);
      console.log(`MEDIDO | noite-mesa n3c a cidade por freguês-hora | sem o corpo ${sem.rph.toFixed(3)}, com o corpo ${corpo.rph.toFixed(3)} (${q.toFixed(2)}×)${cru ? `, sem o relógio da noite ${cru.rph.toFixed(3)} (${(cru.rph / sem.rph).toFixed(2)}×)` : ''}; o sangue à mesa ${sem.blood.toFixed(4)} e ${corpo.blood.toFixed(4)}`);
      if (!(q <= 2.5)) bad.push(`c: com o corpo, ${q.toFixed(2)}× as rodadas e os pratos por freguês-hora`); if (!(corpo.blood <= sem.blood * 1.5 + 0.003)) bad.push(`c: com o corpo, o sangue à mesa ${corpo.blood.toFixed(4)} contra ${sem.blood.toFixed(4)}`); } }
  ok('n3 a mesma noite dos fregueses com o corpo: o copo, a bebida no sangue, a cidade', !bad.length && M.limpo(), `${info.join('; ')}${bad.length ? ' — ' + bad.join(' | ') : ''}`);
}

// ================================ n4: the closing waits for the last game ================================
if (on('n4')) {
  const bad = [], info = [];
  // (a game begun, and the proof's hand on the clock to a moment past the closing call and before the hour — the call comes at the next
  // look of the day: the one at the game with the body is held; the rest of the game goes past the hour)
  const begin = () => { open(NIGHT); const P = findSeat({ cartas: 1, aposta: 1 }); if (!P) return null; const c = challenge(P.body); if (!c.j) return null; const j = move(P.body, c.j, THINK); const h = T.horas(P.b); S().time = h.fecha - 0.004; return Object.assign(P, { j, o: c.o, h }); };
  const P = begin();
  if (!P) bad.push('nenhuma partida do corpo para levar ao fechamento');
  else {
    const { b, body, o, h } = P; let j = P.j; const s0 = said.length; until(() => !!(T.dia(b) && T.dia(b).data.ultima), 30); const op = T.dia(b);
    if (!op || !op.data.ultima) bad.push('o chamado do fechamento não guardou a última partida');
    else {
      until(() => awayFrom(op, [o.id]) === 0, 25); // (the musician ends his song first; the one out of drink goes down at the door after three rises)
      const keys = said.slice(s0).map(x => x.key); if (!keys.includes('ultima_partida')) bad.push(`o taverneiro não disse «última partida» (disse: ${keys.join(', ') || 'nada'})`);
      const rest = awayFrom(op, [o.id]); if (rest) bad.push(`${rest} ainda à mesa depois do chamado, além de quem joga`);
      const jv = JD.verbo(body); if (jv.ok || !/fechando/.test(jv.why || '')) bad.push(`depois do chamado os dados ainda se chamam (${jv.why})`);
      let past = 0; while (j && j.fase === 'jogo') { j = move(body, j, THINK); if (S().time > h.fecha && T.aberta(b)) past++; }
      const fim = j && j.s.fim; const s1 = said.length; until(() => !T.dia(b), 10); const shut = !T.dia(b); const k2 = said.slice(s1).map(x => x.key);
      info.push(`a partida com ${o.name} foi até o fim (${fim ? fim.por : '?'}), ${past} olhadas depois da hora (${h.fecha}) com a casa aberta; a casa ${shut ? 'fechou' : 'NÃO FECHOU'} às ${S().time.toFixed(4)} («${k2.filter(k => /ultima/.test(k)).join(', ')}»)`);
      if (!fim || fim.por === 'abandono' || fim.por === 'fechou') bad.push(`a última partida acabou por «${fim ? fim.por : '?'}»`);
      if (!past) bad.push('a partida não passou da hora: a prova não viu a espera'); if (!shut) bad.push('a casa não fechou depois da última partida'); if (!k2.includes('ultima_fim')) bad.push('sem a palavra do fim da última partida');
    }
    if (G.Possess.body()) G.Possess.release('teste'); fast();
  }
  // (the keeper's patience: the body stops playing — the game stands — and at the end of it the door shuts: each takes back what he put)
  const Q = begin();
  if (!Q) bad.push('nenhuma partida para a paciência do taverneiro');
  else {
    const { b, body, o, h } = Q; const j = Q.j; const L0 = led.length; const c0 = coins(body) + (j.pago[j.corpo] || 0), co = coins(o) + (j.pago[1 - j.corpo] || 0); until(() => !!(T.dia(b) && T.dia(b).data.ultima), 30); // (what each one has, and what each one put: back at the closing)
    const ate = T.dia(b) && T.dia(b).data.ultima ? T.dia(b).data.ultima.ate : 0; const s0 = said.length;
    let k = 0; while (T.dia(b) && k++ < 20000) fast(); const jj = C.jogo(j.id); const fim = jj && jj.s.fim;
    const back = led.slice(L0).filter(l => l.c === 'pote-volta').length; const keys = said.slice(s0).map(x => x.key);
    info.push(`parado na partida: a casa fechou às ${S().time.toFixed(4)} (a paciência até ${ate}), a partida «${fim ? fim.por : '?'}», ${back} devoluções do pote, «${keys.filter(x => /ultima/.test(x)).join(', ')}»`);
    if (!(S().time >= ate - 1e-6)) bad.push(`a casa fechou antes da paciência (${S().time} < ${ate})`); if (!fim || fim.por !== 'fechou') bad.push('a partida parada não acabou com a casa fechando');
    if (j.aposta > 0 && back < 2) bad.push('o pote não voltou a cada um'); if (!keys.includes('ultima_tempo')) bad.push('sem a palavra da paciência acabada');
    if (Math.abs(coins(body) - c0) > 1e-6 || Math.abs(coins(o) - co) > 1e-6) bad.push('as moedas de quem jogava mudaram com a casa fechando (cada um leva o que pôs)');
    if (G.Possess.body()) G.Possess.release('teste'); fast();
  }
  // (after the call, no game begins: the body gives up the one it plays — and the tablets say so)
  const R = begin();
  if (R) { until(() => !!(T.dia(R.b) && T.dia(R.b).data.fecha), 30); ask(w => C.desisteCorpo(w, R.j.id)); const pc = C.podeCorpo(R.body); info.push(`depois do chamado: «${pc.why}»`); if (pc.ok || !/fechando/.test(pc.why || '')) bad.push('depois do chamado as Tabuletas começam outra partida'); if (G.Possess.body()) G.Possess.release('teste'); fast(); }
  ok('n4 o fechamento espera a última partida e depois fecha; a paciência do taverneiro; nenhuma partida nova', !bad.length && M.limpo() && !novas().length, `${info.join('; ')}${bad.length ? ' — ' + bad.join(' | ') : ''} ${novas().slice(0, 2).join(' | ')}`);
}

// ================================ n5: nobody leaves the body's game; who leaves loses ================================
if (on('n5')) {
  const bad = [], info = [];
  // (held: the proof's hand makes the other one hungry and worn out, past his hour to go home and long waiting a round — what would take
  // him from the table on any other night)
  open(NIGHT); let P = findSeat({ cartas: 1, aposta: 1 }); let c = P ? challenge(P.body) : null;
  if (!c || !c.j) bad.push('nenhuma partida do corpo: ' + (c && c.why));
  else {
    const { body, b } = P; const o = c.o; let j = c.j; const lv = T.leaveOf(o, b);
    god(() => { o.hunger = 95; o.energy = 14; if (o.task && o.task.st === 2) o.task.wt = T.WAIT + 30; S().time = Math.max(S().time, Math.min(lv + 0.002, T.horas(b).fecha - T.FECHA - 0.004)); });
    let away = 0; while (j && j.fase === 'jogo') { j = move(body, j, THINK); god(() => { o.hunger = Math.max(o.hunger, 95); }); if (!(o.task && o.task.type === 'tavern')) away++; }
    const fim = j && j.s.fim; info.push(`${o.name} com fome 95, cansaço 14, passada a hora dele (${lv.toFixed(3)}): ${fim ? fim.por : '?'} — ${away ? 'SAIU' : 'ficou até o fim'}`);
    if (!fim || fim.por === 'abandono' || away) bad.push('quem jogava com o corpo largou a mesa');
    for (let k = 0; k < 30; k++) fast(); if (o.task && o.task.type === 'tavern' && o.task.pri >= T.SEGURA) bad.push('acabada a partida, o afazer dele ainda pesa T.SEGURA');
    if (G.Possess.body()) G.Possess.release('teste'); fast();
  }
  // (who leaves loses: the panic takes the other one from the table — a force of the world —: the pot is the body's)
  open(NIGHT); P = findSeat({ cartas: 1, aposta: 1 }); c = P ? challenge(P.body) : null;
  if (!c || !c.j) bad.push('nenhuma partida para o pânico');
  else {
    const { body } = P; const o = c.o; let j = move(body, c.j, THINK); const L0 = led.length; const pote = j.cofre;
    god(() => { (S().panic = S().panic || []).push({ x: o.x, y: o.y, r: 2.2, t: 2, why: 'panic' }); }); until(() => { const q = C.jogo(j.id); return !q || q.fase !== 'jogo'; }, 6);
    j = C.jogo(j.id); const fim = j && j.s.fim; const paid = led.slice(L0).filter(l => l.c === 'pote' && l.to === G.Eco.coinRef(body)).reduce((a, l) => a + l.n, 0);
    info.push(`o pânico tira ${o.name}: ${JSON.stringify(fim)}, ${r2(paid)} do pote (de ${r2(pote)}) à casa do corpo`);
    if (!fim || fim.por !== 'abandono' || fim.w !== j.corpo || fim.saiu !== o.id || fim.causa !== 'saiu') bad.push('quem saiu no pânico não perdeu (o fim não é do corpo, por abandono)');
    if (pote > 0 && Math.abs(paid - pote) > 1e-6) bad.push(`o pote não foi inteiro ao corpo (${paid} de ${pote})`);
    if (G.Possess.body()) G.Possess.release('teste'); fast();
  }
  // (the faint: the drink takes the other one down at the table — the game is the body's)
  open(NIGHT); P = findSeat({ cartas: 1, aposta: 1 }); c = P ? challenge(P.body) : null;
  if (!c || !c.j) bad.push('nenhuma partida para o desmaio');
  else {
    const { body } = P; const o = c.o; let j = move(body, c.j, THINK); const lim = G.Ebrio.limiar(o, 'desmaio');
    if (lim + 0.02 > G.Ebrio.MAX) info.push(`o desmaio: ${o.name} aguenta mais do que o sangue pode ter (${lim.toFixed(2)})`);
    else {
      god(() => G.Ebrio.prova(o, lim + 0.02)); until(() => { const q = C.jogo(j.id); return !q || q.fase !== 'jogo'; }, 6);
      j = C.jogo(j.id); const fim = j && j.s.fim; info.push(`o desmaio de ${o.name}: ${JSON.stringify(fim)}`);
      if (!fim || fim.por !== 'abandono' || fim.w !== j.corpo || fim.causa !== 'desmaio') bad.push('quem desmaiou não perdeu a partida');
    }
    if (G.Possess.body()) G.Possess.release('teste'); fast();
  }
  // (the cup: the body's own set — given by the proof's hand to its bag —, a game with one more; the body leaves it in the middle: who
  // leaves loses — the stake stays, the dice go with their owner and the game with them: the other takes the pot)
  open(NIGHT); const Q = findSeat({ dados: 1, aposta: 1 });
  if (!Q) info.push(`o copo: nenhuma mesa para o dono dos dados que sai (${findSeat.why.slice(0, 4).join('; ')})`);
  else {
    const body = Q.body; // (its own set of wood in the bag: findSeat, the proof's hand)
    const vb = JD.verbo(body); const ap = vb.apostas && vb.apostas.length ? vb.apostas[vb.apostas.length > 1 ? 1 : 0] : 0;
    const r = vb.ok ? ask(w => JD.chamar(w, ap)) : { ok: false, why: vb.why }; const op = r.ok ? A.get(r.op) : null;
    if (!op || op.data.quem.length < 2 || !op.data.set || op.data.set.dono !== body.id) info.push(`o copo: ${!op ? r.why : op.data.quem.length < 2 ? 'ninguém aceitou' : 'os dados não são os do corpo'}`);
    else {
      ask(w => JD.comecar(w, op.id)); think(4); const L0 = led.length; const pote = op.data.pote; const others = op.data.quem.filter(id => id !== body.id);
      ask(w => JD.sair(w, op.id)); until(() => !A.live(op), 6);
      const got = led.slice(L0).filter(l => l.c === 'dados-premio').reduce((a, l) => a + l.n, 0), back = led.slice(L0).filter(l => l.c === 'dados-volta' && l.to === G.Eco.coinRef(body)).reduce((a, l) => a + l.n, 0);
      info.push(`o copo do corpo com ${others.length}: o corpo, dono dos dados, sai — ${r2(got)} do pote de ${r2(pote)} a quem ficou, ${r2(back)} de volta ao corpo (o fim «${op.data.fim || op.end && op.end.why}»)`);
      if (pote > 0 && (Math.abs(got - pote) > 1e-6 || back > 1e-6)) bad.push('o dono dos dados que saiu levou a aposta de volta');
    }
    if (G.Possess.body()) G.Possess.release('teste'); fast();
  }
  ok('n5 ninguém larga a partida do corpo no meio; quem larga perde', !bad.length && M.limpo() && !novas().length, `${info.join('; ')}${bad.length ? ' — ' + bad.join(' | ') : ''} ${novas().slice(0, 2).join(' | ')}`);
}

// ================================ n6: the save in the middle ================================
if (on('n6')) {
  const bad = [], info = [];
  open(NIGHT); const P = findSeat({ cartas: 1 }); const c = P ? challenge(P.body) : null;
  if (!c || !c.j) bad.push('nenhuma partida do corpo para salvar no meio');
  else {
    let j = move(P.body, c.j, THINK); j = move(P.body, j, THINK); const snap = G.Save.serialize(); const jid = j.id, bodyId = P.body.id, oid = c.o.id, bid = P.b.id;
    if (/"paceCorpo"|"dayPace"|"lingers"|"pace":/.test(snap)) bad.push('a demora foi no save');
    const life = () => {
      G.Avatar.detach(); M.abrir(JSON.parse(snap)); G.Main.mode = 'game'; const p0 = [G.pace, G.paceCorpo]; const body = S().villagers.get(bodyId), o = S().villagers.get(oid);
      fast(); const p1 = G.pace; fast(); const held = !!(o && o.task && o.task.type === 'tavern' && o.task.pri >= T.SEGURA);
      let q = C.jogo(jid); let k = 0; while (q && q.fase === 'jogo' && k++ < 12) q = move(body, q, THINK);
      for (let s = 0; s < 20; s++) fast(); const op = T.dia(S().buildings.get(bid));
      return { p0, p1, held, fim: q ? JSON.stringify(q.s.fim) + q.s.p.map(x => x.gl).join(':') : 'apagada', mesa: op ? Object.keys(op.data.mesa).sort().join(',') : 'fechada', coins: [coins(body), coins(o)].map(r2).join('/'), t: S().time.toFixed(5) };
    };
    const a = life(), b2 = life();
    info.push(`a partida no meio: depois do load o passo ${a.p0.join('/')} e, no passo seguinte, ${a.p1}; o outro segurado ${a.held ? 'sim' : 'NÃO'}; as duas vidas ${JSON.stringify(a) === JSON.stringify(b2) ? 'iguais' : 'DIFERENTES'} (${a.fim})`);
    if (a.p0[0] !== 1 || a.p0[1] !== 1) bad.push('o passo do dia não recomeçou em 1 no load'); if (a.p1 !== T.PACE_MESA) bad.push(`o passo depois do load foi ${a.p1}, não o da mesa`);
    if (!a.held) bad.push('depois do load o outro não está segurado'); if (JSON.stringify(a) !== JSON.stringify(b2)) bad.push('o mesmo save viveu dois futuros');
    if (G.Possess.body()) G.Possess.release('teste'); fast();
  }
  // (the save in the middle of the wait for the last game)
  open(NIGHT); const Q = findSeat({ cartas: 1 }); const c2 = Q ? challenge(Q.body) : null;
  if (!c2 || !c2.j) bad.push('nenhuma partida para a espera do fechamento');
  else {
    let j = move(Q.body, c2.j, THINK); S().time = T.horas(Q.b).fecha - T.FECHA - 0.0005; until(() => !!(T.dia(Q.b) && T.dia(Q.b).data.ultima), 30); j = C.jogo(j.id);
    const snap = G.Save.serialize(); const jid = j.id, bodyId = Q.body.id, bid = Q.b.id;
    const life = () => { G.Avatar.detach(); M.abrir(JSON.parse(snap)); G.Main.mode = 'game'; const body = S().villagers.get(bodyId); const b = S().buildings.get(bid); const ul = !!(T.dia(b) && T.dia(b).data.ultima);
      let q = C.jogo(jid); let k = 0; while (q && q.fase === 'jogo' && k++ < 12) q = move(body, q, THINK); let n = 0; while (T.dia(b) && n++ < 4000) fast();
      return { ul, fim: q ? JSON.stringify(q.s.fim) : 'apagada', fechou: S().time.toFixed(5), aberta: !!T.dia(b) }; };
    const a = life(), b2 = life();
    info.push(`na espera do fechamento: a última partida ${a.ul ? 'de volta' : 'PERDIDA'} no load; ${a.fim}, a casa fechou às ${a.fechou}; as duas vidas ${JSON.stringify(a) === JSON.stringify(b2) ? 'iguais' : 'DIFERENTES'}`);
    if (!a.ul) bad.push('a última partida não voltou no load'); if (a.aberta) bad.push('a casa não fechou depois da última partida'); if (JSON.stringify(a) !== JSON.stringify(b2)) bad.push('o save na espera do fechamento viveu dois futuros');
    if (G.Possess.body()) G.Possess.release('teste'); fast();
  }
  ok('n6 o save no meio da partida e no meio da espera do fechamento', !bad.length && M.limpo() && !novas().length, `${info.join('; ')}${bad.length ? ' — ' + bad.join(' | ') : ''} ${novas().slice(0, 2).join(' | ')}`);
}

// ================================ n7: the bad cases ================================
if (on('n7')) {
  const bad = [], info = [];
  const game = () => { open(NIGHT); const P = findSeat({ cartas: 1, aposta: 1 }); const c = P ? challenge(P.body) : null; if (!c || !c.j) return null; return Object.assign(P, { j: move(P.body, c.j, THINK), o: c.o }); };
  // (the body dies in the middle: the other one stayed — the pot is his)
  let P = game();
  if (!P) bad.push('nenhuma partida para o corpo que morre');
  else { const { body, o } = P; const L0 = led.length; god(() => V.kill(body, 'teste', true)); for (let k = 0; k < 20; k++) M.viver(0.1); const j = C.jogo(P.j.id); const fim = j && j.s.fim;
    const paid = led.slice(L0).filter(l => l.c === 'pote' && l.to === G.Eco.coinRef(o)).reduce((a, l) => a + l.n, 0);
    info.push(`o corpo morre: ${JSON.stringify(fim)}, ${r2(paid)} a ${o.name}; o passo ${G.pace}`);
    if (!fim || fim.por !== 'abandono' || fim.w !== 1 - j.corpo || fim.causa !== 'morreu') bad.push('o corpo morto não perdeu a partida'); if (P.j.aposta > 0 && !(paid > 0)) bad.push('o pote não foi a quem ficou'); if (G.pace !== 1 || G.paceCorpo !== 1) bad.push('o sol ainda se demora sem o corpo'); }
  // (the god takes the drink off the shelf: nothing served of nothing, the game goes on)
  P = game();
  if (!P) bad.push('nenhuma partida para o deus que tira a bebida');
  else { const { b, body } = P; let j = P.j; const ref = 'b:' + b.id; const DR = ['vinho', 'mel', 'cerveja', 'pulque']; god(() => { for (const k of DR) { const n = D.get(ref, k); if (n > 0) D.use(ref, k, n, { code: 'deus', part: true }); } }); const L0 = led.length;
    while (j && j.fase === 'jogo') j = move(body, j, THINK);
    // (what left the emptied shelf — into the keeper's hands, to a customer's — against what came onto it since by a door of its own: the
    // keeper's purchase, the vat's batch; nothing of nothing — qa/taverna-vida.js v4)
    const L = led.slice(L0); const out = L.filter(l => DR.includes(l.k) && l.from === ref && (l.c === 'taverna' || l.c === 'taverna-caneca')).reduce((a, l) => a + l.n, 0);
    const came = L.filter(l => DR.includes(l.k) && l.to === ref && l.c !== 'taverna-volta').reduce((a, l) => a + l.n, 0);
    info.push(`o deus tira a bebida: ${r2(out)} saiu da prateleira, ${r2(came)} chegou a ela pelo livro; a partida ${j ? j.s.fim.por : '?'}`); if (out > came + 1e-6) bad.push('bebida servida do nada'); if (!j || j.s.fim.por === 'abandono') bad.push('a partida não foi até o fim sem a bebida'); if (G.Possess.body()) G.Possess.release('teste'); fast(); }
  // (the tavern catches fire beside it: the day shuts, each takes back what he put; the sun no longer lingers)
  for (const caso of ['fogo', 'guerra']) {
    P = game();
    if (!P) { bad.push(`nenhuma partida para ${caso === 'fogo' ? 'o fogo' : 'a guerra'}`); continue; }
    const { b, body, o } = P; const L0 = led.length; const j0 = P.j; const c0 = coins(body) + (j0.pago[j0.corpo] || 0), co = coins(o) + (j0.pago[1 - j0.corpo] || 0); const set = S().settlements.get(b.set); const tile = G.W.idx(b.x + b.w + 1, b.y); // (and back what each one put)
    for (let k = 0; k < 30 && T.dia(b); k++) { god(() => { if (caso === 'fogo') S().fire[tile] = 0.9; else set.alarmT = 60; }); fast(); }
    fast(); fast(); // (the pace of a step is asked at its start: the next one knows the house shut)
    const j = C.jogo(j0.id); const fim = j && j.s.fim; const back = led.slice(L0).filter(l => l.c === 'pote-volta').length;
    info.push(`${caso === 'fogo' ? 'o fogo ao lado' : 'a guerra à porta'}: a casa ${T.dia(b) ? 'ABERTA' : 'fechou'}, a partida «${fim ? fim.por : 'apagada'}», ${back} devoluções; o passo ${G.pace}`);
    if (T.dia(b)) bad.push(`${caso}: a casa não fechou`); if (!fim || fim.por !== 'fechou') bad.push(`${caso}: a partida não acabou com a casa`);
    if (Math.abs(coins(body) - c0) > 1e-6 || Math.abs(coins(o) - co) > 1e-6) bad.push(`${caso}: as moedas de quem jogava mudaram (cada um leva o que pôs)`);
    if (G.pace < T.PACE_SALA - 1e-9 || (G.pace === T.PACE_MESA)) bad.push(`${caso}: o sol ainda se demora pela partida (${G.pace})`);
    god(() => { S().fire[tile] = 0; set.alarmT = 0; }); if (G.Possess.body()) G.Possess.release('teste'); fast();
  }
  ok('n7 os casos ruins: o corpo que morre, o deus que tira a bebida, o fogo, a guerra', !bad.length && M.limpo() && !novas().length, `${info.join('; ')}${bad.length ? ' — ' + bad.join(' | ') : ''} ${novas().slice(0, 2).join(' | ')}`);
}

{ const e = M.erros(); ok('erros', M.limpo(), Object.keys(e.mod).length ? JSON.stringify(e.mod).slice(0, 300) : e.console.length ? e.console.slice(0, 2).join(' · ') : 'nenhum erro de módulo nem aviso no console'); }
console.log(fails.length ? `FALHOU: ${fails.length} (${fails.join(', ')})` : 'PASSOU (noite-mesa)');
process.exit(fails.length ? 1 : 0);

// ================================ n8: the world without the body, the same as before ================================
// (the ready metropolis lived from where it stands through a whole evening of its taverns and into the next morning, and a year of the
// skip after it, with nobody's body — here and in the other tree of the game, each in a process of its own: the same chance, the same
// day, the same print of the world, the same games at the tables)
function igual(baseDir) {
  const cp = require('child_process'), fs = require('fs');
  const here = path.join(__dirname, '..'); const there = baseDir ? path.resolve(baseDir) : null;
  if (!there || !fs.existsSync(path.join(there, 'index.html'))) { console.log('FALHOU | noite-mesa n8 | dê a pasta do jogo de antes: node qa/noite-mesa.js igual PASTA'); process.exit(1); }
  const code = root => `const M = require(${JSON.stringify(path.join(__dirname, 'nodemundo.js'))}); const G = M.load({ qa: true, root: ${JSON.stringify(root)} });
    M.pronto('metropole'); const S = G.S; const d0 = S.day; let k = 0; while (!(S.day > d0 && S.time > 0.05) && k++ < 6000) M.viver(1);
    const tav = () => { let n = 0, r = 0; for (const op of G.Act.all()) if (op.def === 'taverna') { n += op.data.servidos || 0; r += op.data.receita || 0; } return n + ':' + Math.round(r * 100); };
    const h = o => require('crypto').createHash('sha1').update(JSON.stringify(o)).digest('hex').slice(0, 12);
    const a = { rng: S.rng, day: S.day, t: S.time, canon: h(QA.canon()), tav: tav(), cartas: S.cartas ? JSON.stringify(S.cartas.n) : '-' };
    M.saltar(1); const b = { rng: S.rng, day: S.day, canon: h(QA.canon()), cartas: S.cartas ? JSON.stringify(S.cartas.n) : '-' };
    process.stdout.write(JSON.stringify({ noite: a, salto: b, err: M.limpo() ? 0 : JSON.stringify(M.erros()).slice(0, 200) }));`;
  const run = root => JSON.parse(cp.execFileSync(process.execPath, ['-e', code(root)], { maxBuffer: 1 << 26 }).toString());
  const a = run(here), b = run(there); const same = JSON.stringify(a) === JSON.stringify(b);
  console.log(`${same && !a.err ? 'PASSOU' : 'FALHOU'} | noite-mesa n8 sem o corpo, o mundo igual ao de antes | a metrópole pronta por uma noite inteira das tavernas e um ano de salto, sem corpo nenhum — aqui ${JSON.stringify(a)}; ${path.basename(there)} ${JSON.stringify(b)}`);
  process.exit(same && !a.err ? 0 : 1);
}
