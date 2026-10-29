// terreiro: a olaria e a taverna de lote de 8 m como o deus as desenha (B2d) — a parte coberta ao fundo (o galpão do oleiro
// num canto, a casa da taverna, o salão do hidromel do norte) e o terreiro diante dela, cercado baixo, aberto ao céu, o
// portão na rua — provadas em Node, sem mundo, sobre o código do jogo (M.load):
//   1. a família do terreiro se arma em todo povo, lado da rua e frente aberta; a casca leva o terreiro (shell.yard: a cerca
//      no lote) e as peças dele (yard: o forno, os secadores, a pilha, a eira, a roda, o barreiro; a mesa com os bancos, as
//      pipas, a talha do grego e do romano) — as mesmas da planta inteira e de toda tentativa (o que se vê de longe é o que
//      o corpo usa)
//   2. cada peça do terreiro num cômodo aberto do térreo, dentro da cerca; cada uso do ofício com um lugar livre (o oleiro no
//      forno, na roda, no barreiro, na eira, nas prateleiras; o freguês na mesa de fora)
//   3. o portão diante de uma casa da frente aberta à rua; só a outra aberta: tudo espelhado
//   4. o corpo pisa o terreiro (Space.inBody) e o telheiro de um anexo (L-285), não o beco ao lado da casa da taverna
//   5. a escolha: o terreiro primeiro onde se arma (a taverna com os andares do deus: o salão do norte de um, a casa de dois);
//      as outras famílias seguem valendo para quem já as tem
//   6. a ruína não leva as peças do terreiro (o entulho, como o resto)
//   node qa/terreiro.js
const M = require('./nodemundo.js');
const G = M.load({});
const In = G.Interiors, Sp = G.Space;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | terreiro ${name} | ${info}`); if (!c) fails.push(name); };
G.S = { villagers: new Map(), buildings: new Map(), dead: new Map(), settlements: new Map(), clock: 100, day: 3, time: 0.9, avatar: null, nextId: 1000, history: [], fire: new Float32Array(G.N * G.N) };
const POVOS = ['classico', 'grego', 'romano', 'egipcio', 'asteca', 'nordico'];
const rec = (t, c, f, s, o) => ({ v: 4, f, r: 0, t, u: In.TYPES[t].use, s, o, c, e: 3, k: 'ae', cl: c === 'egipcio' ? 'q' : 't', fl: 0, d: 1, w: 1, pw: 0, h: [], m: 0, fx: [], dr: {}, hh: 0, nm: 0, vz: 0, ab: 0 });
const famOf = (t, c) => (t === 'taverna' && c !== 'nordico' ? 'w-terreiro.andar' : 'w-terreiro.terreo');
const USES = { olaria: ['cozer', 'tornear', 'amassar', 'moldar', 'guardar'], taverna: ['comer', 'guardar'] };
const KINDS = { olaria: ['forno-olaria', 'secador', 'pilha-tijolos', 'eira', 'roda-oleiro', 'tanque-barro'], taverna: ['mesa-terreiro', 'pipas'] };
const inR = (r, x, z, e) => x >= r[0] - (e || 0) && x <= r[2] + (e || 0) && z >= r[1] - (e || 0) && z <= r[3] + (e || 0);
let nid = 7001;
// (each attempt's plan, as the maker makes it: In.trace)
let tries = []; In.trace = (a, p) => { tries.push(p); };
const made = [];
for (const t of ['olaria', 'taverna']) for (const c of POVOS) for (const [s, o] of [['S', 3], ['S', 1], ['S', 2], ['E', 2], ['N', 1], ['W', 3]]) for (const k of [0, 1]) {
  const f = famOf(t, c); const b = { id: (nid += 37 + k), type: t, x: 8, y: 8, w: 2, h: 2, built: true, set: 0 }; b.ip = rec(t, c, f, s, o);
  tries = []; const p = In.makeFam(b, b.ip, f); const att = tries.slice(); tries = [];
  G.S.buildings.set(b.id, b); const so = In.shellOf(b);
  made.push({ t, c, s, o, b, p, so, att });
}
In.trace = null;
// ---------------------------------------------------------------- 1. laid out, the shell with its yard and its pieces
{
  const bad = made.filter(m => !m.p.ok); const noYard = made.filter(m => m.p.ok && !(m.p.shell.yard && inR([0, 0, 8, 8], m.p.shell.yard.r[0], m.p.shell.yard.r[1]) && inR([0, 0, 8, 8], m.p.shell.yard.r[2], m.p.shell.yard.r[3])));
  ok('1a a olaria e a taverna no terreiro em todo povo, lado e frente', !bad.length && !noYard.length, `${made.length - bad.length} de ${made.length} plantas${bad.length ? '; ' + bad.slice(0, 3).map(m => `${m.t} ${m.c} ${m.s} o${m.o}: ${m.p.errs.slice(0, 2).join(' | ')}`).join(' / ') : ''}${noYard.length ? `; ${noYard.length} sem o terreiro na casca` : ''}`);
  const kinds = made.filter(m => m.p.ok).map(m => { const have = new Set((m.p.yard || []).map(q => q.kind)); const want = KINDS[m.t].concat(m.t === 'taverna' && (m.c === 'grego' || m.c === 'romano') ? ['talha'] : []); return want.filter(k => !have.has(k)); });
  const miss = kinds.filter(x => x.length);
  ok('1b as peças do terreiro na casca: o forno, os secadores, a pilha, a eira, a roda, o barreiro; a mesa com os bancos, as pipas, a talha', !miss.length, miss.length ? `faltam ${miss.slice(0, 3).map(x => x.join(',')).join(' / ')}` : `${made.length} plantas com todas`);
  // (the shell alone — what the god's view and the 3D from afar draw — is the plan's, all of it as written: its yard, its pieces,
  // where they stand)
  const strip = o => { const x = Object.assign({}, o); delete x.key; return JSON.stringify(x); };
  const diff = made.filter(m => m.p.ok && (!m.so || strip(m.so) !== strip(In.shellOfPlan(m.p))));
  const sameAtt = made.filter(m => m.p.ok && m.att.some(q => q.shell && JSON.stringify(q.yard || null) !== JSON.stringify(m.p.yard || null)));
  const atts = made.reduce((n, m) => n + m.att.length, 0);
  ok('1c a casca sozinha leva o mesmo terreiro da planta inteira, e toda tentativa o mesmo', !diff.length && !sameAtt.length, `${diff.length} cascas diferentes da planta; ${sameAtt.length} plantas com uma tentativa de outro terreiro (${atts} tentativas)`);
  // (each piece of the yard in the plan's own list, marked, with the same place on the lot)
  const lost = made.filter(m => m.p.ok && (m.p.yard || []).some(q => { const it = m.p.items.find(i => i.id === q.id); return !it || !it.yard || it.kind !== q.kind || JSON.stringify(it.r) !== JSON.stringify(q.r); }));
  ok('1d cada peça da casca é a peça da planta (o mesmo id, o tipo, o lugar), marcada do terreiro', !lost.length, lost.length ? `${lost.length} plantas com peça perdida` : 'todas');
}
// ---------------------------------------------------------------- 2. in the yard's open rooms, a free place for each use
{
  const out = [];
  for (const m of made) {
    if (!m.p.ok) continue; const p = m.p; const Y = p.shell.yard.r;
    for (const it of p.items.filter(i => i.yard)) { const r = p.rooms[it.room]; if (!r || !r.open || r.fn !== 'terreiro' || r.lv !== 0 || !inR(Y, it.r[0], it.r[1], 1e-6) || !inR(Y, it.r[2], it.r[3], 1e-6)) out.push(`${m.t} ${m.c}: ${it.kind} fora do terreiro`); }
    for (const u of USES[m.t]) if (!In.freePlace(m.b, u)) out.push(`${m.t} ${m.c} ${m.s} o${m.o}: sem lugar de ${u}`);
  }
  ok('2a cada peça do terreiro num cômodo aberto do térreo, dentro da cerca; um lugar livre para cada uso do ofício', !out.length, out.length ? out.slice(0, 4).join(' / ') : `olaria: ${USES.olaria.join(', ')}; taverna: ${USES.taverna.join(', ')}`);
  // (the trade's two hands at the pottery: the wheel in the yard and the one in the shed — and the tavern's keeper at its counter)
  const jobs = made.filter(m => m.p.ok && m.p.cap.jobs < (G.BDEF[m.t].jobs || 0));
  ok('2b os postos de trabalho do ofício (o oleiro: as duas rodas; o taverneiro: o balcão)', !jobs.length, jobs.length ? `${jobs.length} plantas com menos postos` : `olaria ${G.BDEF.olaria.jobs}, taverna ${G.BDEF.taverna.jobs}`);
}
// ---------------------------------------------------------------- 3. the gate before the street; mirrored
{
  const out = []; let flips = 0;
  for (const m of made) {
    if (!m.p.ok) continue; const e = m.p.entrance; const d = m.p.doors[e.door];
    // (the entrance in the lot's frame: along the front of the record's side, the tile it is before)
    const along = m.s === 'S' ? e.x : m.s === 'N' ? 8 - e.x : m.s === 'E' ? 8 - e.z : e.z; const tile = Math.floor(along / 4);
    if (!d || d.kind !== 'portao' || !d.rooms.includes('rua')) out.push(`${m.t} ${m.c}: a entrada não é o portão da rua`);
    if (!((m.o >> tile) & 1)) out.push(`${m.t} ${m.c} ${m.s} o${m.o}: o portão diante da casa ${tile}, fechada`);
    // (the roofed part on the side of the yard the god draws: the first tile's side, or mirrored)
    const sh = m.p.shell.r; const mid = m.s === 'S' ? (sh[0] + sh[2]) / 2 : m.s === 'N' ? 8 - (sh[0] + sh[2]) / 2 : m.s === 'E' ? 8 - (sh[1] + sh[3]) / 2 : (sh[1] + sh[3]) / 2;
    const flip = !(m.o & 1) && (m.o & 2); if (flip) flips++;
    if (m.t === 'olaria' && (flip ? mid < 4 : mid > 4)) out.push(`${m.t} ${m.c} ${m.s} o${m.o}: o galpão do lado errado`);
  }
  ok('3a o portão diante de uma casa da frente aberta à rua; só a outra aberta, tudo espelhado', !out.length, out.length ? out.slice(0, 4).join(' / ') : `${made.filter(m => m.p.ok).length} portões; ${flips} espelhados`);
}
// ---------------------------------------------------------------- 4. the body's floor: the yard, the lean-to; not the alley
{
  const tv = made.find(m => m.p.ok && m.t === 'taverna' && m.c === 'classico' && m.s === 'S' && m.o === 3);
  const ol = made.find(m => m.p.ok && m.t === 'olaria' && m.c === 'classico' && m.s === 'S' && m.o === 3);
  const sh = tv.p.shell; const yard = sh.yard.r;
  const inYard = Sp.inBody(sh, 0, (yard[0] + yard[2]) / 2, (yard[1] + yard[3]) / 2), alley = Sp.inBody(sh, 0, 7.2, 2.0), upYard = Sp.inBody(sh, 1, (yard[0] + yard[2]) / 2, (yard[1] + yard[3]) / 2);
  const kiln = ol.p.items.find(i => i.kind === 'forno-olaria'); const sp = kiln.spots[0]; const atKiln = Sp.inBody(ol.p.shell, 0, sp.x, sp.z) && In.standsAt(ol.p, 0, sp.x, sp.z, 0.25);
  ok('4a o corpo pisa o terreiro, diante do forno; não o beco ao lado da casa da taverna, nem o terreiro no andar de cima', inYard && atKiln && !alley && !upYard, `no terreiro ${inYard}, diante do forno ${atKiln}, no beco ${alley}, no andar de cima ${upYard}`);
  // (the lean-to of a hall with its annex: the plan's floor is the feet's there too — before, the street's: L-285)
  let ax = null;
  for (let k = 0; k < 8 && !ax; k++) { const b = { id: 9100 + k * 13, type: 'workshop', x: 8, y: 8, w: 2, h: 2, built: true }; b.ip = rec('workshop', 'classico', 'w-anexo.terreo', 'S', 3); const p = In.makeFam(b, b.ip, 'w-anexo.terreo'); if (p.ok && (p.shell.annex || []).length) ax = p; }
  const a = ax && ax.shell.annex[0]; const lean = ax && ax.rooms.find(r => r.fn === 'telheiro');
  const inLean = !!(a && lean && Sp.inBody(ax.shell, 0, (lean.r[0] + lean.r[2]) / 2, (lean.r[1] + lean.r[3]) / 2));
  ok('4b o corpo pisa o telheiro do anexo (L-285)', inLean, ax ? `o telheiro ${JSON.stringify(lean && lean.r)} dentro do corpo do prédio: ${inLean}` : 'sem planta de anexo');
}
// ---------------------------------------------------------------- 5. the choice
{
  const out = [];
  for (const t of ['olaria', 'taverna']) for (const c of POVOS) {
    const r = rec(t, c, '', 'S', 3); const fam = In.familiesFor(r); const T = In.TYPES[t]; const pool = T.prefer ? T.prefer(r, fam.ok) : fam.ok;
    if (pool.length !== 1 || pool[0] !== famOf(t, c)) out.push(`${t} ${c}: ${pool.join(',') || 'nenhuma'} (${fam.ok.length} válidas${fam.ok.includes(famOf(t, c)) ? '' : '; o terreiro: ' + (fam.why[famOf(t, c)] || '?')})`);
    if (fam.ok.length < 2) out.push(`${t} ${c}: só ${fam.ok.length} famílias válidas`);
  }
  ok('5a a escolha: o terreiro primeiro (a taverna com os andares do deus); as outras famílias seguem válidas', !out.length, out.length ? out.slice(0, 4).join(' / ') : 'olaria e taverna dos seis povos');
}
// ---------------------------------------------------------------- 6. the ruin
{
  const m = made.find(q => q.p.ok && q.t === 'olaria' && q.c === 'grego');
  const b = Object.assign({}, m.b, { id: m.b.id + 1, type: 'ruin' }); b.ip = Object.assign({}, m.b.ip); G.S.buildings.set(b.id, b);
  const so = In.shellOf(b); const p = In.make(b, b.ip);
  ok('6a a ruína não leva as peças do terreiro', !!so && !so.yard && !!p && !p.yard, `casca: ${so ? (so.yard ? so.yard.length + ' peças' : 'sem peças') : 'nenhuma'}; planta: ${p && p.yard ? p.yard.length + ' peças' : 'sem peças'}`);
}
const err = M.erros(); if (Object.keys(err.mod).length || err.console.length) ok('sem erros de módulo', false, JSON.stringify(err).slice(0, 300));
console.log(fails.length ? `FALHAS: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
