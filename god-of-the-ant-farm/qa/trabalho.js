// trabalho: os ofícios do corpo (20g; D-425 a D-433) — em Node, com o corpo e as mãos (space, possess, interact, avatar, os
// clipes) e o arcabouço do trabalho (js/trabalho.js), no mundo pronto «cidade» (ou o dado).   [ONLY=t1,t5] node qa/trabalho.js [mundo]
// As mãos da prova só põem a cena (T-1470): uma ferramenta na mochila pelo depósito (código «teste»), uma pessoa num lugar, um
// canteiro maduro, uma banca aberta na hora do mercado, um bicho morto; o trabalho é pedido como o jogador o pede (o E de cada
// provedor, os verbos F e E segurado), e o mundo o faz no seu passo.
//  t1 a ferramenta e o material: sem ela, o trabalho que não se faz diz por quê e o que se faz pior diz que demora; o material
//     conta contra a ferramenta que o povo daria ao ofício (a pedra devagar, o bronze, o ferro mais depressa; a do povo, o ritmo
//     do mundo — D-035, D-427); a mão nua, o martelo, a enxada; os jeitos de pescar pela coisa na mão;
//  t2 cortar: sem machado, não; com o machado de cada material, cada golpe é o trabalho de 0,55 s do lenhador vezes o material,
//     no contador do mundo; a árvore cai pelo Nature.fellTree; o machado na mão (G.Inv.held); a lenha do tronco vem pelo livro
//     («lenha»), o tronco a perde; o golpe dura o tempo do mundo;
//  t3 quebrar pedra: a picareta (a carga no 3,8 de trabalho do pedreiro vezes o material), o martelo (mais devagar), sem nada (não);
//     a pedra vem pelo livro («pedra») e sai da rocha;
//  t4 colher frutas: a carga no tempo de quem colhe, pelo livro («fruta»), a origem «fruta» nas mãos; o F come no lugar;
//  t5 pescar: as mãos, a vara (lançar, esperar, recolher), a rede, a lança — cada lance o gesto daquele jeito do mundo
//     (G.Pesca.castDur), pela porta do mundo (G.Pesca.cast, com o jeito da coisa na mão), o peixe pelo livro com a origem «peixe»;
//  t6 caçar e esfolar: o bicho morto, sem faca não; com ela, a carne pelo livro («caca», a origem «carne») e o couro junto, que
//     entra no armazém como entra o do caçador;
//  t7 colher o campo: o canteiro maduro com a foice (o tempo do lavrador) e com as mãos (o dobro); o grão daquele campo nas mãos;
//  t8 cavar argila na margem: a pá, a enxada (mais devagar), as mãos (três vezes mais); a argila pelo livro («barreiro»);
//  t9 minerar: sem picareta não; com ela, o turno do mineiro em golpes; o minério do veio pelo livro («mina»), a cidade o conta;
//  t10 vender numa banca: o corpo mercador na sua banca aberta, na hora do mercado — apregoar, a tela do dia da banca (o que está
//     no balcão, o preço, o que vendeu), fechar a banca pelo F (a porta da própria banca);
//  t11 os casos ruins: o save no meio de um golpe; a árvore que outro derruba antes do golpe; a ferramenta largada no meio; a mão
//     do deus (a pedra tirada, o corpo morto no meio); o chão que muda (a margem que vira rio); o trabalho segurado (cortar até cair)
//     e o jogador que anda;
//  t12 as pessoas do mundo fazendo o mesmo: os atos do lenhador, do pedreiro e do lavrador mostram os gestos dos ofícios; a ferramenta
//     do ato na mão de quem não tem coisas de verdade (o kit), e só a de verdade na mão de quem tem (D-426); o ato do corpo some
//     quando o trabalho acaba;
//  t13 os resultados do mundo iguais: a mesma semente vivida com e sem o arcabouço carregado, e na cópia do 76e3cae (o commit do
//     contrato da onda 2), dá o mesmo mundo (NODIGI=1 pula a cópia);
//  x  nenhum erro de módulo nem do console; o verificador limpo (o «trabalho», o «inventario», a «origem»).
const fs = require('fs'), path = require('path'), cp = require('child_process');
// (t13's child: the world of a seed lived a while, its print — with or without the body's files, in this game or another copy)
if (process.argv[2] === '--digital') {
  const M = require('./nodemundo.js'); const root = process.argv[3]; const body = process.argv[4] === '1';
  const ex = body ? ['js/space.js', 'js/people3d.js', 'js/possess.js', 'js/interact.js', 'js/avatar.js'].concat(fs.existsSync(path.join(root, 'js/trabalho.js')) ? ['js/trabalho.js', 'js/trabalho-clips.js'] : []) : [];
  const G = M.load({ root, extra: ex }); M.novo({ seed: 7123, type: 'continente', size: 96, tribes: 3 });
  for (let k = 0; k < 6; k++) M.viver(30);
  const S = G.S; const h = s => { let x = 0; for (let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) >>> 0; return x; };
  const vs = [...S.villagers.values()].map(v => [v.id, v.x.toFixed(3), v.y.toFixed(3), v.role, v.act, Math.round(v.hp), v.carry ? v.carry.k + v.carry.n : '']).join('|');
  const st = [...S.factions.values()].map(f => JSON.stringify(f.stock)).join('|');
  console.log('DIGITAL', JSON.stringify({ rng: S.rng, day: S.day, clock: S.clock.toFixed(2), pop: S.villagers.size, trees: S.trees.size, rocks: S.rocks.size, animals: S.animals.size, vs: h(vs), st: h(st), led: (S.ledger || []).length }));
  process.exit(0);
}
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js', 'js/people3d.js', 'js/possess.js', 'js/interact.js', 'js/avatar.js', 'js/anim-gait.js', 'js/anim-clips.js', 'js/anim-body.js', 'js/trabalho.js', 'js/trabalho-clips.js', 'qa/visual/corpo-qa.js', 'qa/trabalho-inv.js'] });
const WORLD = process.argv[2] || 'cidade';
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const on = (...ks) => !ONLY || ks.some(k => ONLY.includes(k));
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | trabalho ${name} | ${info}`); if (!c) fails.push(name.split(' ')[0]); };
const Tr = G.Trabalho, Inv = G.Inv, It = G.Itens, D = G.Depot, Po = G.Possess, W = G.W, I = G.Interact;
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
M.pronto(WORLD);
let S = G.S; const L = G.Space.TILE;
const RDT = 1 / 30;
const frame = (world) => { if (world !== false) G.debug.step(RDT * G.Space.TIME); G.Avatar.frame(RDT); Tr.pump(); };
const frames = (n, w) => { for (let k = 0; k < n; k++) frame(w); };
const until = (c, n) => { for (let k = 0; k < n; k++) { if (c()) return k; frame(); } return c() ? n : -1; };
const vbad = () => QA.check().filter(q => q.sev <= 2 && (q.sys === 'trabalho' || q.sys === 'inventario' || q.sys === 'origem' || q.sys === 'corpo' || q.sys === 'act'));
const vtxt = l => (l.length ? l.slice(0, 3).map(q => `S${q.sev} ${q.sys}: ${q.msg}`).join(' · ') : 'verificador limpo');
const base = new Set(vbad().map(q => q.sys + '|' + q.msg)); const vnew = () => vbad().filter(q => !base.has(q.sys + '|' + q.msg));
// (the ledger's lines since n: [n, day, clock, from, to, good, amount, op, code, who])
const ledN = () => (D.ledger ? D.ledger().length : 0);
const ledSince = n => (D.ledger ? D.ledger().slice(n) : []);
// the body's things: the bag emptied by the test's hand (by the depot), a thing put in it (by the depot, «teste»)
function clearBag(v) { god(() => { for (const k of Object.keys(Inv.bag(v))) { const n = Inv.count(v, k); if (n > 0) D.use('m:' + v.id, k, n, { code: 'teste', by: v.id }); } }); }
// (a thing of a metal or of leather: its material comes into the people first — a tool of that metal into its store, a hide —, as a
// thing that came from somewhere; nada vem do nada, and the checker of the origin asks it — T-1470)
function give(v, key, n) {
  const m = It.def(key) && It.def(key).mat; const fid = G.Fac.idOfV(v);
  if (fid && (m === 'bronze' || m === 'ferro') && !G.Origem.had(fid, m)) god(() => D.make('f:' + fid, 'ferramentas', 1, { code: 'teste', of: m }));
  if (fid && m === 'couro' && !G.Origem.had(fid, m)) god(() => D.make('f:' + fid, 'couro', 1, { code: 'teste' }));
  return god(() => D.make('m:' + v.id, key, n || 1, { code: 'teste', by: v.id }));
}
const clearHands = v => { if (v.carry && v.carry.n > 0) god(() => D.use('v:' + v.id, v.carry.k, v.carry.n, { code: 'teste', mine: true })); v.carry = null; };
// a grown person lived by the god, put a little off a thing (a walkable point r tiles from it), facing it; pred: who may be
function bodyAt(tx, ty, r, pred) {
  const cand = [...S.villagers.values()].filter(o => o.age >= 20 && o.age < 50 && !o.inside && !o.sick && Po.can(o).ok && (!pred || pred(o))).sort((a, b) => a.id - b.id);
  const v = cand[0]; if (!v) return null;
  for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; const x = tx + Math.cos(a) * r, y = ty + Math.sin(a) * r; if (!W.walkableXY(x, y)) continue;
    if (Po.body()) Po.release('deus'); G.Avatar.detach();
    G.Vg.endTask(v); v.x = x; v.y = y; v.path = null; const r0 = Po.take(v); if (!r0.ok) return null; M.viver(0.1);
    G.Avatar.attach(v, Math.atan2(ty - y, tx - x)); G.Avatar.state().yaw = Math.atan2(ty - y, tx - x); G.Avatar.input.camYaw = G.Avatar.state().yaw;
    v.hunger = 10; v.energy = 90; clearHands(v); clearBag(v); return v; }
  return null;
}
const face = (v, x, y) => { const b = G.Avatar.state(); b.yaw = Math.atan2(y * L - b.Z, x * L - b.X); };
// (the provider's E on its own target — the one the test means, so a passer-by does not take the prompt)
function E(id, t) { const p = I.list.find(q => q.id === id); return I.run({ id, p, t }); }
function F(id, t, k) { const p = I.list.find(q => q.id === id); return I.runVerb(k || 'outra', { id, p, t }); }
const target = (id, pick) => { const p = I.list.find(q => q.id === id); const ctx = I.ctx(); const L0 = ctx ? p.find(ctx) : []; return pick ? L0.find(pick) : L0[0]; };
const canOf = (id, t) => { const p = I.list.find(q => q.id === id); const ctx = I.ctx(); return p.can(ctx, t); };
// (one act of a work, answered by the world: a passer-by of the world who bumps the body before the contact cuts the act — no
// answer —, and the player presses E again: tried up to four times — T-1471. → { r, a, ts: when the answered act began })
function act1(id, t, n) {
  let r = null, a = null, ts = S.clock;
  for (let k = 0; k < 4; k++) { ts = S.clock; r = E(id, t); a = G.Avatar.actNow(); if (!r || !r.ok || !a) break; until(() => !G.Avatar.busy(), n || 6000); if (a.res) break; frames(4); }
  return { r, a, ts };
}
// (strokes again and again — E held — until c(), or n frames)
function strike(id, t, c, n) { let k = 0; for (; k < (n || 4000); k++) { if (c()) break; if (!G.Avatar.busy()) { const r = E(id, t); if (r && !r.ok) return { k, r }; } frame(); } return { k, r: null }; }
const freshTree = (pred) => [...S.trees.values()].filter(t => G.Nature.isChoppable(t) && t.stage === 'grow' && t.size >= 0.8 && !t.claim && !t.chop && (!pred || pred(t))).sort((a, b) => a.id - b.id).find(t => bodyAt(t.x, t.y, 0.42));
// (the test's hand keeps the beasts that kill away from a place of the water for the case — by the one door out, G.Animals.remove:
// a crocodile of the river took the body of an earlier run, and the next run's place was another — T-1471)
const safe = (x, y) => { for (const a of [...S.animals.values()]) if (!a.dead && G.Meio && G.Meio.DANGER.has(a.kind) && Math.hypot(a.x - x, a.y - y) < 30) god(() => G.Animals.remove(a)); };
const mats = kind => It.KINDS[kind].mats.map(m => It.keyOf(kind, m));

// ------------------------------ t1: the tool and its material ------------------------------
if (on('t1')) {
  const tr = freshTree(); const v = Po.body();
  if (!tr || !v) ok('t1 a ferramenta e o material', false, 'nenhuma árvore com chão ao lado');
  else {
    const none = Tr.tool(v, 'cortar'); const c0 = canOf('arvore', { tr, X: tr.x * L, Z: tr.y * L });
    const ref = Inv.made('machado', v); const res = {};
    for (const k of mats('machado')) { clearBag(v); give(v, k); res[k] = Tr.tool(v, 'cortar'); }
    const m = mats('machado').map(k => res[k].mul);
    const refMul = ref ? res[ref].mul : null;
    clearBag(v); give(v, 'martelo.bronze'); const ham = Tr.tool(v, 'quebrar'); give(v, 'picareta.bronze'); const pick = Tr.tool(v, 'quebrar');
    clearBag(v); const bareDig = Tr.tool(v, 'cavar'); give(v, 'enxada.bronze'); const hoe = Tr.tool(v, 'cavar'); give(v, 'pa.bronze'); const spade = Tr.tool(v, 'cavar');
    clearBag(v); const bareReap = Tr.tool(v, 'ceifar'); const bareFish = Tr.tool(v, 'pescar'); give(v, 'vara'); const rod = Tr.tool(v, 'pescar'); give(v, 'rede'); const net = Tr.tool(v, 'pescar');
    clearBag(v); const skin0 = Tr.tool(v, 'esfolar');
    ok('t1 sem a ferramenta: o trabalho que não se faz diz por quê', !none.key && none.mul === 0 && /machado/.test(none.why) && !c0.ok && /machado/.test(c0.why) && !skin0.key && /faca/.test(skin0.why), `cortar sem nada: «${none.why}» · o E: «${c0.why}» · esfolar: «${skin0.why}»`);
    ok('t1 o material: a pedra devagar, o bronze, o ferro mais depressa; a do povo, o ritmo do mundo', m[0] < m[1] && m[1] < m[2] && Math.abs(refMul - 1) < 1e-9, `machado ${mats('machado').map((k, i) => k.split('.')[1] + ' ×' + m[i].toFixed(3)).join(', ')} · o do povo (${ref}): ×${refMul}`);
    ok('t1 o que se faz pior diz que demora: o martelo na pedra, a enxada e as mãos na margem, as mãos no campo', ham.key === 'martelo.bronze' && ham.mul < pick.mul && pick.key === 'picareta.bronze' && !bareDig.key && bareDig.mul > 0 && bareDig.mul < hoe.mul && hoe.mul < spade.mul && /devagar|mais/.test(bareDig.slow) && !bareReap.key && bareReap.mul === 0.5 && /dobro/.test(bareReap.slow),
      `martelo ×${ham.mul.toFixed(2)} contra a picareta ×${pick.mul.toFixed(2)} · cavar: mãos ×${bareDig.mul}, enxada ×${hoe.mul.toFixed(2)}, pá ×${spade.mul.toFixed(2)} («${bareDig.slow}») · colher sem foice ×${bareReap.mul}`);
    ok('t1 pescar: o jeito é o da coisa na mão (as mãos, a linha da vara, a rede)', !bareFish.key && bareFish.how === 'maos' && rod.how === 'linha' && (net.how === 'rede' || net.how === 'linha'), `sem nada: ${bareFish.how} · com a vara: ${rod.how} · com a vara e a rede: ${net.how} (${net.key})`);
  } }

// ------------------------------ t2: felling ------------------------------
function fellWith(key) {
  const tr = freshTree(); const v = Po.body(); if (!tr || !v) return null;
  give(v, key); const wm = G.Vg.workMul(v); const tl = Tr.tool(v, 'cortar'); const T = { tr, X: tr.x * L, Z: tr.y * L };
  const c0 = tr.chop, t0 = S.clock; let felled = false, k = 0, durs = new Set(), heldAx = false;
  for (; k < 6000 && !felled; k++) { if (!G.Avatar.busy()) { const r = E('arvore', T); if (r && !r.ok) break; const a = G.Avatar.actNow(); if (a) durs.add(+a.dur.toFixed(3)); } frame(); if (Inv.held(v).mao === key) heldAx = true; if (tr.stage !== 'grow') felled = true; }
  const dw = S.clock - t0, done = (felled ? 3 * Math.max(0.5, tr.size) : tr.chop) - c0;
  return { tr, v, tl, wm, rate: done / dw / wm, felled, k, durs: [...durs], heldAx, dw };
}
if (on('t2')) {
  { const tr = freshTree(); const v = Po.body(); const r = tr && canOf('arvore', { tr, X: tr.x * L, Z: tr.y * L }); const best = tr && I.best();
    ok('t2 cortar sem machado: não, e diz por quê', !!r && !r.ok && /machado/.test(r.why) && (!best || best.id !== 'arvore' || !best.ok), r ? `«${r.why}»; o E na tela: ${best ? best.label + (best.ok ? '' : ' — ' + best.why) : '—'}` : 'sem árvore'); void v; }
  const out = {};
  for (const key of mats('machado')) out[key] = fellWith(key);
  const lines = Object.keys(out).map(k => { const o = out[k]; return o ? `${k}: ×${o.tl.mul.toFixed(2)} → ${o.rate.toFixed(2)}× o lenhador em ${o.dw.toFixed(1)} s${o.felled ? ', caiu' : ''}` : `${k}: sem árvore`; });
  const good = Object.keys(out).every(k => out[k] && out[k].felled && Math.abs(out[k].rate / out[k].tl.mul - 1) < 0.2);
  ok('t2 cada golpe é o trabalho de 0,55 s do lenhador vezes o material (a árvore cai pelo Nature.fellTree)', good, lines.join(' · '));
  const any = Object.values(out).filter(Boolean);
  ok('t2 o golpe dura o tempo do mundo (0,55 s), e o machado está na mão (G.Inv.held)', any.length && any.every(o => o.durs.length === 1 && Math.abs(o.durs[0] - Tr.WT.chop) < 1e-6 && o.heldAx), any.map(o => `${o.tl.key}: golpes de ${o.durs.join('/')} s; na mão: ${o.heldAx ? 'sim' : 'não'}`).join(' · '));
  // the wood of the fallen tree into the arms, by the ledger
  const o = any[any.length - 1];
  if (o) {
    const tr = o.tr, v = o.v; until(() => tr.stage === 'log', 3000); clearHands(v); const n0 = ledN(), w0 = tr.wood; const st0 = tr.stage;
    const T = { tr, X: tr.x * L, Z: tr.y * L }; const r = E('arvore', T); const a = G.Avatar.actNow(); until(() => !G.Avatar.busy(), 600);
    if (!v.carry) console.log('  (o tronco:', st0, 'claim', tr.claim, 'resposta', a && a.res, r && (r.msg || r.card && 'cartão'), ')');
    const lines2 = ledSince(n0).filter(e => e[4] === 'v:' + v.id && e[5] === 'wood');
    ok('t2 a lenha do tronco vem pelo livro («lenha»), na carga que os braços levantam, e sai do tronco', !!r && r.ok && v.carry && v.carry.k === 'wood' && lines2.length === 1 && lines2[0][8] === 'lenha' && Math.abs(w0 - tr.wood - v.carry.n) < 1e-6 && v.carry.n <= Math.floor(D.room('v:' + v.id, 'wood') + v.carry.n + 1e-9),
      `${v.carry ? v.carry.n + ' de ' + v.carry.k : 'nada'} nas mãos; o livro: ${lines2.map(e => e[6] + ' ' + e[8]).join(', ') || 'nada'}; o tronco ${w0} → ${tr.wood}`);
    clearHands(v);
  } }

// ------------------------------ t3: breaking stone ------------------------------
function breakWith(key) {
  const rock = [...S.rocks.values()].filter(r => r.stone >= 4 && !r.claim).sort((a, b) => a.id - b.id).find(r => bodyAt(r.x, r.y, 0.62));
  const v = Po.body(); if (!rock || !v) return null; if (key) give(v, key);
  const T = { r: rock, X: rock.x * L, Z: rock.y * L }; const c = canOf('pedra', T); if (!c.ok) return { rock, v, refused: c.why };
  const tl = Tr.tool(v, 'quebrar'); const wm = G.Vg.workMul(v); const s0 = rock.stone, t0 = S.clock, n0 = ledN();
  let heldNow = null; const r = strike('pedra', T, () => { if (G.Avatar.busy() && !heldNow) heldNow = Inv.held(v).mao; return (v.carry && v.carry.k === 'stone') || !S.rocks.has(rock.id); }, 6000);
  const dw = S.clock - t0; const got = v.carry && v.carry.k === 'stone' ? v.carry.n : 0;
  const led = ledSince(n0).filter(e => e[4] === 'v:' + v.id && e[5] === 'stone');
  return { rock, v, tl, wm, dw, want: Tr.WT.mineLoad / wm / tl.mul, got, s0, s1: S.rocks.has(rock.id) ? rock.stone : 0, led, held: heldNow, stop: r.r };
}
if (on('t3')) {
  const bare = breakWith(null);
  ok('t3 quebrar pedra sem nada: não, e diz por quê', !!bare && !!bare.refused && /picareta/.test(bare.refused), bare ? `«${bare.refused || 'quebrou'}»` : 'sem pedra');
  const pick = breakWith('picareta.bronze'); const ham = breakWith('martelo.bronze');
  const tx = o => (o ? `${o.tl.key}: ${o.got} pedras em ${o.dw.toFixed(2)} s do mundo (o pedreiro com ela: ${o.want.toFixed(2)} s)${o.stop ? ' — parou: ' + o.stop.msg : ''}` : 'sem pedra');
  ok('t3 a picareta: a carga no 3,8 de trabalho do pedreiro; o martelo, mais devagar', !!pick && !!ham && pick.got > 0 && ham.got > 0 && pick.dw > pick.want * 0.8 && pick.dw < pick.want * 1.6 && ham.dw > pick.dw * 1.5, `${tx(pick)} · ${tx(ham)}`);
  ok('t3 a pedra vem pelo livro («pedra») e sai da rocha; a ferramenta na mão (o martelo é o martelo)', !!pick && pick.led.length === 1 && pick.led[0][8] === 'pedra' && Math.abs(pick.s0 - pick.s1 - pick.got) < 1e-6 && pick.held === 'picareta.bronze' && !!ham && ham.held === 'martelo.bronze', pick ? `o livro: ${pick.led.map(e => e[6] + ' ' + e[8]).join(', ')}; a rocha ${pick.s0} → ${pick.s1}; na mão, golpeando: ${pick.held} e ${ham ? ham.held : '—'}` : '—');
  if (pick) clearHands(pick.v); if (ham) clearHands(ham.v);
}

// ------------------------------ t4: berries ------------------------------
if (on('t4')) {
  const bush = [...S.bushes.values()].filter(b => b.berries >= 3 && !b.claim && !b.burnt).sort((a, b) => a.id - b.id).find(b => bodyAt(b.x, b.y, 0.4));
  const v = Po.body();
  if (!bush || !v) ok('t4 colher frutas', false, 'nenhum arbusto com frutas');
  else {
    v.hunger = 10; const T = { bu: bush, X: bush.x * L, Z: bush.y * L }; const n0 = ledN(), b0 = bush.berries; const wm = G.Vg.workMul(v);
    const { r, ts } = act1('arbusto', T); const k = 0; const dw = S.clock - ts;
    const led = ledSince(n0).filter(e => e[4] === 'v:' + v.id && e[5] === 'food'); const pa = G.Origem ? G.Origem.parts('v:' + v.id, 'food') : {};
    ok('t4 a carga de frutas no tempo de quem colhe (2,2 s ÷ trabalho), pelo livro («fruta»), a origem «fruta» nas mãos', r && r.ok && k >= 0 && dw > 2.2 / wm * 0.9 && led.length === 1 && led[0][8] === 'fruta' && v.carry && (pa.fruta || 0) >= v.carry.n - 1e-6 && Math.abs(b0 - bush.berries - v.carry.n) < 1e-6,
      `${v.carry ? v.carry.n : 0} de frutas em ${dw.toFixed(2)} s do mundo (quem colhe: ${(2.2 / wm).toFixed(2)} s); o livro: ${led.map(e => e[6] + ' ' + e[8]).join(', ') || 'nada'}; a origem: ${JSON.stringify(pa)}`);
    clearHands(v); v.hunger = 30; const h0 = v.hunger;
    const f = F('arbusto', T); until(() => !G.Avatar.busy(), 2000);
    ok('t4 sem fome, o F come as frutas no lugar (com fome, o E come e o F colhe para levar)', f && f.ok && v.hunger < h0 - 20 && !v.carry, `fome ${h0} → ${v.hunger.toFixed(1)}; ${v.carry ? 'nas mãos: ' + v.carry.n : 'mãos vazias'}`);
  } }

// ------------------------------ t5: fishing ------------------------------
// (a ford of a river — the shallows the hands fish in — beside a bank the gear fishes from, the same ground)
function fordOf() {
  const N = G.N;
  for (let i = 0; i < S.type.length; i++) {
    if (S.type[i] !== G.T.RIVER || S.road[i] || !W.walkable(i)) continue;
    const fx = i % N + 0.5, fy = Math.floor(i / N) + 0.5; if (G.Space.surface(fx * L, fy * L).kind !== 'shallow') continue;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const x = fx + dx, y = fy + dy; if (!W.inb(x, y)) continue; const j = W.idx(x, y); if (W.walkable(j) && S.type[j] !== G.T.RIVER && S.type[j] >= G.T.SAND) return { ford: [fx, fy], bank: [x, y], wx: -dx, wy: -dy }; }
  }
  return null;
}
function castWith(key, pl) {
  // (the test's hand keeps the beasts that kill away from the ford for the case — by the one door out, G.Animals.remove: T-1471)
  safe(pl.ford[0], pl.ford[1]);
  const v = Po.body(); clearBag(v); clearHands(v); if (key) { give(v, key); god(() => Inv.equip(v, key)); } // (the gear in the hand: from the bank only with it there — the player's quick key)
  // (with a gear, at the bank's edge, the water a stride on; with the hands, in the ford)
  const at = key ? [pl.bank[0] + pl.wx * 0.38, pl.bank[1] + pl.wy * 0.38] : pl.ford; G.Avatar.place(at[0], at[1]); frames(3); const b = G.Avatar.state(); b.yaw = Math.atan2(pl.wy, pl.wx); G.Avatar.input.camYaw = b.yaw; frames(2);
  const P = G.Pesca; const cast0 = P.cast; const hows = []; P.cast = function (w, x, y, o) { const r = cast0.apply(this, arguments); if (w === v) hows.push([o && o.how, r.ok, S.clock]); return r; };
  const wm = G.Vg.workMul(v); const n0 = ledN(); let durs = new Set(), tries = 0, why = '', heldNow = null;
  try {
    for (let k = 0; k < 9000 && !(v.carry && v.carry.fish) && tries < 14; k++) {
      if (!G.Avatar.busy()) { const t = target('peixe'); if (!t) { why = 'sem água diante do corpo'; break; } P.stock && G.S.pesca && delete G.S.pesca[P.idAt(t.x, t.y)]; const r = E('peixe', t); if (!r || !r.ok) { why = r ? r.msg : 'nada'; break; } tries++; const a = G.Avatar.actNow(); if (a) durs.add(+a.dur.toFixed(3)); }
      frame(); if (G.Avatar.busy() && !heldNow) heldNow = Inv.held(v).mao;
    }
  } finally { P.cast = cast0; }
  if (Po.body() !== v) { const p = G.person ? G.person(v.id) : null; why = (why ? why + "; " : "") + `o corpo deixou de ser vivido (${S.villagers.has(v.id) ? "vivo: " + JSON.stringify({ hp: Math.round(v.hp), sleeping: v.sleeping, inside: v.inside, task: v.task && v.task.type, av: S.avatar }) : "morto: " + (p ? p.lastCause || p.cause : "?")})`; }
  const led = ledSince(n0).filter(e => e[4] === 'v:' + v.id && e[8] === 'pesca'); const pa = G.Origem ? G.Origem.parts('v:' + v.id, 'food') : {};
  return { key, v, hows, durs: [...durs], want: P.castDur(v, hows[0] ? hows[0][0] : 'maos'), wm, tries, why, got: v.carry && v.carry.fish ? v.carry.n : 0, led, pa, held: key ? heldNow : null };
}
if (on('t5')) {
  const pl = G.Pesca && fordOf(); const p = pl && bodyAt(pl.ford[0], pl.ford[1], 0.01);
  if (!pl || !p) ok('t5 pescar', false, !G.Pesca ? 'sem a pescaria' : !pl ? 'nenhum vau ao lado de uma margem' : 'ninguém para viver');
  else {
    const R = {}; for (const [k, how] of [[null, 'maos'], ['vara', 'linha'], ['rede', 'rede'], ['lanca.bronze', 'arpao']]) R[how] = castWith(k, pl);
    const line = how => { const o = R[how]; return `${how}: ${o.tries} lances (${o.hows.map(h => h[0]).filter((x, i, a) => a.indexOf(x) === i).join('/')}) de ${o.durs.join('/')} s (o mundo: ${o.want.toFixed(2)}), ${o.got} peixe(s)${o.why ? ' — ' + o.why : ''}`; };
    ok('t5 cada jeito pela porta do mundo (G.Pesca.cast) com o jeito da coisa na mão, cada lance o gesto daquele jeito (castDur)', Object.keys(R).every(h => R[h].tries > 0 && R[h].hows.length && R[h].hows.every(x => x[0] === h) && R[h].durs.every(d => Math.abs(d - R[h].want) < 1e-6)), Object.keys(R).map(line).join(' · '));
    ok('t5 o peixe vem pelo livro («pesca») com a origem «peixe»; a coisa na mão', Object.keys(R).every(h => R[h].got === 0 || (R[h].led.length >= 1 && (R[h].pa.peixe || 0) >= R[h].got - 1e-6)) && Object.keys(R).some(h => R[h].got > 0) && ['linha', 'rede', 'arpao'].every(h => R[h].held && It.def(R[h].held).kind === { linha: 'vara', rede: 'rede', arpao: 'lanca' }[h]),
      Object.keys(R).map(h => `${h}: ${R[h].got} no livro ${R[h].led.length}× · origem ${JSON.stringify(R[h].pa)} · na mão ${R[h].held || '—'}`).join(' · '));
    if (Po.body()) clearHands(Po.body()); else console.log("  (t5: o corpo não está mais vivido:", G.S.avatar, ")");
  } }

// ------------------------------ t6: hunting and skinning ------------------------------
if (on('t6')) {
  const sp = k => G.Riches && G.Riches.spoilsOf({ kind: k, id: 1 });
  const a = [...S.animals.values()].filter(x => !x.dead && !x.dom && !x.tamed && G.Animals.DEF[x.kind] && G.Animals.DEF[x.kind].cls !== 'water' && G.Animals.DEF[x.kind].cls !== 'air' && Object.keys(sp(x.kind) || {}).length && W.walkableXY(x.x, x.y)).sort((p, q) => p.id - q.id).find(x => bodyAt(x.x, x.y, 0.5));
  const v = Po.body();
  if (!a || !v) ok('t6 caçar e esfolar', false, 'nenhum bicho de couro com chão ao lado');
  else {
    god(() => G.Animals.kill(a, null, 'teste')); a.meat = Math.max(a.meat || 0, 4); face(v, a.x, a.y); frames(2);
    const T = { a, X: a.x * L, Z: a.y * L }; const c0 = canOf('carcaca', T);
    give(v, 'faca.bronze'); const wm = G.Vg.workMul(v) * Tr.tool(v, 'esfolar').mul; const n0 = ledN();
    const { r, ts } = act1('carcaca', T); const dw = S.clock - ts;
    const led = ledSince(n0).filter(e => e[4] === 'v:' + v.id && e[5] === 'food'); const pa = G.Origem ? G.Origem.parts('v:' + v.id, 'food') : {};
    ok('t6 sem faca não se esfola; com ela, no tempo do caçador (4 ÷ trabalho ÷ a faca), a carne pelo livro («caca») com a origem «carne» e o couro junto', !c0.ok && /faca/.test(c0.why) && r && r.ok && v.carry && v.carry.k === 'food' && v.carry.meat === a.kind && v.carry.extra && led.length === 1 && led[0][8] === 'caca' && (pa.carne || 0) >= v.carry.n - 1e-6 && dw > 4 / wm * 0.85 && a.skinned,
      `sem faca: «${c0.why}» · ${v.carry ? v.carry.n + ' de carne de ' + v.carry.meat + ' e ' + JSON.stringify(v.carry.extra) : 'nada'} em ${dw.toFixed(2)} s (o caçador: ${(4 / wm).toFixed(2)}); o livro: ${led.map(e => e[6] + ' ' + e[8]).join(', ')}; origem ${JSON.stringify(pa)}`);
    // (the load to the store: the meat and what came along with it, as the hunter's — Vg.deliver, Riches.unload, 'caca')
    const st = G.Village.nearestDropoff(v.x, v.y, v.set); const ex = Object.assign({}, v.carry ? v.carry.extra : {});
    if (st && v.carry) {
      const f = G.Fac.ofV(v); const k0 = Object.keys(ex)[0]; const s0 = f.stock[k0] || 0; const n1 = ledN();
      god(() => G.Vg.deliver(v, st));
      const led2 = ledSince(n1).filter(e => e[5] === k0 && e[8] === 'caca');
      ok('t6 o couro vai ao armazém com a carne, como o do caçador (Riches.unload, «caca»)', (f.stock[k0] || 0) > s0 && led2.length >= 1, `${k0}: ${s0} → ${f.stock[k0] || 0}; o livro: ${led2.map(e => e[6] + ' ' + e[8]).join(', ') || 'nada'}`);
    }
    clearHands(v);
  } }

// ------------------------------ t7: the field ------------------------------
if (on('t7')) {
  const farm = [...S.buildings.values()].filter(b => b.type === 'farm' && b.built && b.crops).sort((a, b) => a.id - b.id)[0];
  if (!farm) ok('t7 colher o campo', false, 'nenhuma fazenda');
  else {
    const fid = G.Village.facOfSet(farm.set); const [px, py] = G.Village.cropPos(farm, 4);
    const v = bodyAt(px, py, 0.45, o => G.Fac.idOfV(o) === fid);
    const res = {};
    for (const key of [null, 'foice.bronze']) {
      if (!v) break; clearBag(v); clearHands(v); if (key) give(v, key);
      // (the test's hand: the patch ripe, the farmers of the world sent to another errand for the case — they take a ripe patch first,
      // and one came between the ripening and the stroke — and the body back at the patch: T-1470)
      for (const o of S.villagers.values()) if (o.task && o.task.type === 'farm' && o.task.id === farm.id) G.Vg.endTask(o);
      const c = farm.crops[4]; c.s = 3; c.c = 0; G.Avatar.place(px + 0.45, py); frames(2);
      face(v, px, py); frames(2); const t = target('campo', q => q.b === farm && q.k === 4); const wm = G.Vg.workMul(v); const n0 = ledN();
      const { r, a, ts: t0 } = t ? act1('campo', t) : { r: null, a: null, ts: S.clock };
      const led = ledSince(n0).filter(e => e[4] === 'v:' + v.id && e[5] === 'food'); const pa = G.Origem ? G.Origem.parts('v:' + v.id, 'food') : {};
      res[key || 'maos'] = { ok: !!(r && r.ok), dw: S.clock - t0, want: 1.5 / wm / Tr.tool(v, 'ceifar').mul, got: v.carry ? v.carry.n : 0, led, pa, s: c.s, grain: farm.grain, why: !t ? 'sem o canteiro diante do corpo' : r && !r.ok ? r.msg : a && a.res && !a.res.ok ? a.res.why : '' };
    }
    const tx = k => { const o = res[k]; return o ? `${k}: ${o.got} em ${o.dw.toFixed(2)} s (o lavrador: ${o.want.toFixed(2)}), o canteiro ${o.s}, origem ${JSON.stringify(o.pa)}${o.why ? ' — ' + o.why : ''}` : `${k}: —`; };
    ok('t7 o canteiro maduro: com a foice no tempo do lavrador, com as mãos o dobro; o grão daquele campo nas mãos, pelo livro', !!v && ['maos', 'foice.bronze'].every(k => res[k] && res[k].ok && res[k].s === 0 && res[k].dw > res[k].want * 0.9 && res[k].dw < res[k].want * 1.4 && (res[k].got === 0 || (res[k].led[0] && res[k].led[0][8] === 'colheita' && (res[k].pa[res[k].grain] || 0) >= res[k].got - 1e-6))) && res.maos.dw > res['foice.bronze'].dw * 1.6,
      `${tx('maos')} · ${tx('foice.bronze')}`);
    if (v) clearHands(v);
  } }

// ------------------------------ t8: clay at a bank ------------------------------
function bankNear() {
  const N = G.N;
  for (let i = 0; i < S.type.length; i++) {
    if (S.type[i] !== G.T.RIVER) continue; const rx = i % N, ry = Math.floor(i / N);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const x = rx + dx, y = ry + dy; if (!W.inb(x, y)) continue; const j = W.idx(x, y); if (!W.walkable(j) || S.type[j] === G.T.RIVER || S.occ[j] || S.treeAt[j]) continue; return { x: x + 0.5, y: y + 0.5, wx: -dx, wy: -dy }; }
  }
  return null;
}
if (on('t8')) {
  const bk = bankNear(); if (bk) safe(bk.x, bk.y); const v = bk && bodyAt(bk.x, bk.y, 0.01);
  if (!bk || !v) ok('t8 cavar argila', false, 'nenhuma margem de rio');
  else {
    const res = {};
    for (const key of [null, 'enxada.bronze', 'pa.bronze']) {
      clearBag(v); clearHands(v); if (key) give(v, key);
      G.Avatar.place(bk.x - bk.wx * 0.3, bk.y - bk.wy * 0.3); frames(2); const b = G.Avatar.state(); b.yaw = Math.atan2(bk.wy, bk.wx); frames(1);
      const t = target('barro'); const wm = G.Vg.workMul(v); const tl = Tr.tool(v, 'cavar'); const n0 = ledN();
      const { r, ts: t0 } = t ? act1('barro', t) : { r: null, ts: S.clock };
      const led = ledSince(n0).filter(e => e[4] === 'v:' + v.id && e[5] === 'argila');
      res[key || 'maos'] = { ok: !!(r && r.ok), dw: S.clock - t0, want: 5 / wm / tl.mul, got: v.carry && v.carry.k === 'argila' ? v.carry.n : 0, led, t: !!t };
    }
    const tx = k => { const o = res[k]; return `${k}: ${o.got} de argila em ${o.dw.toFixed(2)} s (o oleiro com isso: ${o.want.toFixed(2)})${o.t ? '' : ' — sem margem diante do corpo'}`; };
    ok('t8 a pá no tempo do oleiro, a enxada mais devagar, as mãos três vezes mais; a argila pelo livro («barreiro»)', Object.keys(res).every(k => res[k].ok && res[k].got > 0 && res[k].led.length === 1 && res[k].led[0][8] === 'barreiro' && res[k].dw > res[k].want * 0.9 && res[k].dw < res[k].want * 1.3) && res.maos.dw > res['enxada.bronze'].dw && res['enxada.bronze'].dw > res['pa.bronze'].dw,
      Object.keys(res).map(tx).join(' · '));
    clearHands(v);
  } }

// ------------------------------ t9: a mine ------------------------------
if (on('t9')) {
  const mine = [...S.buildings.values()].filter(b => b.built && b.ore && (S.ores || []).some(o => o.id === b.ore && o.amt >= 3)).sort((a, b) => a.id - b.id)[0];
  if (!mine) ok('t9 minerar', false, 'nenhuma mina com veio no mundo');
  else {
    const fid = G.Village.facOfSet(mine.set); const d = G.Vg.door(mine); const v = bodyAt(d[0], d[1], 0.5, o => G.Fac.idOfV(o) === fid);
    if (!v) ok('t9 minerar', false, 'ninguém do povo da mina para viver');
    else {
      face(v, d[0], d[1]); frames(2); const t = target('mina', q => q.b === mine); const c0 = t && canOf('mina', t);
      give(v, 'picareta.bronze'); const o = S.ores.find(q => q.id === mine.ore); const a0 = o.amt; const n0 = ledN(), t0 = S.clock; const wm = G.Vg.workMul(v);
      const r = t && strike('mina', t, () => !!(v.carry && v.carry.n > 0), 20000);
      const led = ledSince(n0).filter(e => e[4] === 'v:' + v.id && e[8] === 'mina'); const need = ((o.kind === 'ouro' || o.kind === 'estanho') ? 13 : 10) / Math.max(0.5, (v.work || 1) * G.Civ.tV(v, 'build'));
      ok('t9 sem picareta não; com ela, o turno do mineiro em golpes, o minério do veio pelo livro («mina»)', !!t && !c0.ok && /picareta/.test(c0.why) && v.carry && led.length === 1 && Math.abs(a0 - o.amt - v.carry.n) < 1e-6 && S.clock - t0 > need * 0.8,
        `${t ? '' : 'sem a mina diante do corpo; '}sem picareta: «${c0 ? c0.why : '—'}» · ${v.carry ? v.carry.n + ' de ' + v.carry.k : 'nada'} em ${(S.clock - t0).toFixed(1)} s (o turno: ${need.toFixed(1)}); o veio ${a0} → ${o.amt}; o livro: ${led.map(e => e[6] + ' ' + e[5]).join(', ') || 'nada'}${r && r.r ? '; parou: ' + r.r.msg : ''}`);
      void wm; clearHands(v);
    } } }

// ------------------------------ t10: a stall ------------------------------
if (on('t10')) {
  const mk = [...S.buildings.values()].filter(b => b.built && (b.type === 'market' || b.type === 'mercado' || (G.BDEF[b.type] && G.BDEF[b.type].market))).sort((a, b) => a.id - b.id)[0];
  if (!mk || !G.Biz) ok('t10 vender numa banca', false, 'nenhum mercado no mundo');
  else {
    const fid = G.Village.facOfSet(mk.set); const d = G.Vg.door(mk);
    const v = bodyAt(d[0], d[1], 0.6, o => G.Fac.idOfV(o) === fid && !G.Biz.of(o));
    if (!v) ok('t10 vender numa banca', false, 'ninguém do povo do mercado para viver');
    else {
      // (the test's hand: the body a merchant of the market, its stall open at the market's hour, goods on its counter — T-1470)
      S.time = 0.25; v.role = 'mercador'; v.job = mk.id; const z = god(() => G.Biz.open(v, mk));
      if (!z) ok('t10 vender numa banca', false, 'o mercado sem banca livre');
      else {
        god(() => D.make('z:' + z.id, 'food', 6, { code: 'teste', by: v.id })); z.open = 1; z.day.open = 1;
        const sp = G.Biz.spots(z); G.Avatar.place(sp.seller[0], sp.seller[1]); frames(3); const b = G.Avatar.state(); b.yaw = Math.atan2(sp.dy, sp.dx); frames(2);
        const best = I.best(); const off = I.offer(best); const info = Tr.info();
        const r = best && best.id === 'banca' ? I.run(best) : null; const a = G.Avatar.actNow(); until(() => !G.Avatar.busy(), 600);
        ok('t10 na banca aberta, o E apregoa (o gesto do vendedor) e a tela diz o balcão, o preço e o dia; a banca tem quem venda', !!best && best.id === 'banca' && r && r.ok && a && a.anim === 'apregoar' && G.Biz.manned(z) && info && /comida a /.test(info.falta) && /hoje/.test(info.rende),
          `o E: ${best ? best.label : '—'} · o F: ${off ? (off.verbs.find(x => x.k === 'outra') || {}).label : '—'} · o gesto: ${a ? a.anim : '—'} · a tela: «${info ? info.titulo + ' — ' + info.falta + ' — ' + info.rende : '—'}» · com quem venda: ${G.Biz.manned(z)}`);
        const f = F('banca', best.t); until(() => !G.Avatar.busy(), 600); frames(4);
        ok('t10 o F fecha a banca pela porta da própria banca (a oferta do negócio)', f && f.ok && !z.open, `${f ? f.msg || 'feito' : '—'}; a banca ${z.open ? 'aberta' : 'fechada'}`);
      } } } }

// ------------------------------ t11: the bad cases ------------------------------
function untilAsked(id, t) { for (let k = 0; k < 3000; k++) { if (!G.Avatar.busy()) E(id, t); frame(); const a = G.Avatar.actNow(); if (a && a.asked && !a.asked.res) return a; } return null; }
if (on('t11')) {
  // (a) a save in the middle of a stroke: asked, not answered — after the load nothing of it happens, nothing hangs
  { const tr = freshTree(); const v = Po.body(); if (v) give(v, 'machado.bronze');
    const T = tr && { tr, X: tr.x * L, Z: tr.y * L }; const a = tr && untilAsked('arvore', T); const c0 = tr ? tr.chop : 0, id = tr ? tr.id : 0;
    if (a) { M.salvarCarregar(); S = G.S; } frames(30, true);
    const t2 = S.trees.get(id); ok('t11 o save no meio de um golpe: depois do load o golpe não acontece, nada fica preso', !!a && !!t2 && Math.abs(t2.chop - c0) < 1e-6 && !G.Avatar.busy() && !vnew().length, `${a ? 'golpe pedido' : 'sem golpe'}; o contador ${c0} → ${t2 ? t2.chop : '—'}; ${G.Avatar.busy() ? 'ocupado' : 'livre'}; ${vtxt(vnew())}`); }
  // (b) another fells the tree before the stroke lands
  { const tr = freshTree(); const v = Po.body(); if (v) give(v, 'machado.bronze');
    const T = tr && { tr, X: tr.x * L, Z: tr.y * L }; const a = tr && untilAsked('arvore', T);
    if (a) god(() => G.Nature.fellTree(tr, 1)); const c0 = tr ? tr.chop : 0; until(() => !G.Avatar.busy(), 300);
    ok('t11 a árvore que outro derruba antes do golpe: o mundo diz não, nada se soma', !!a && a.res && !a.res.ok && /de pé/.test(a.res.why) && tr.chop === c0, `${a ? 'resposta: ' + (a.res ? (a.res.ok ? 'feito' : a.res.why) : '—') : 'sem golpe'}`); }
  // (c) the tool dropped in the middle
  { const tr = freshTree(); const v = Po.body(); if (v) give(v, 'machado.bronze');
    const T = tr && { tr, X: tr.x * L, Z: tr.y * L }; let a = null;
    if (tr) { E('arvore', T); a = G.Avatar.actNow(); god(() => Inv.drop(v, 'machado.bronze')); }
    const c0 = tr ? tr.chop : 0; until(() => !G.Avatar.busy(), 300);
    ok('t11 a ferramenta largada no meio: o golpe não acontece, e diz por quê', !!a && a.res && !a.res.ok && /não tem mais|trocou/.test(a.res.why) && tr.chop === c0, `${a ? 'resposta: ' + (a.res ? (a.res.ok ? 'feito' : a.res.why) : '—') : 'sem golpe'}`); }
  // (d) the god's hand: the rock taken away between the stroke and the world's step; the body killed in the middle of the felling
  { const rock = [...S.rocks.values()].filter(r => r.stone >= 4 && !r.claim).sort((a, b) => a.id - b.id).find(r => bodyAt(r.x, r.y, 0.62)); const v = Po.body(); if (v) give(v, 'picareta.bronze');
    const T = rock && { r: rock, X: rock.x * L, Z: rock.y * L }; const a = rock && untilAsked('pedra', T);
    if (a) god(() => G.Nature.removeRock(rock)); until(() => !G.Avatar.busy(), 300);
    ok('t11 a mão do deus tira a pedra entre o golpe e o passo: não, nada nas mãos', !!a && a.res && !a.res.ok && !(v.carry && v.carry.n > 0), `${a ? 'resposta: ' + (a.res ? (a.res.ok ? 'feito' : a.res.why) : '—') : 'sem golpe'}`); }
  { const tr = freshTree(); const v = Po.body(); if (v) give(v, 'machado.bronze');
    const T = tr && { tr, X: tr.x * L, Z: tr.y * L }; const a = tr && untilAsked('arvore', T); const c0 = tr ? tr.chop : 0;
    if (a) { G.Village.kill(v, 'old'); frame(); G.Avatar.detach(); } frames(20);
    ok('t11 o corpo morto no meio do golpe: nada se soma, nada fica preso (o verificador limpo)', !!a && tr.chop === c0 && !Tr.chain() && !vnew().length, `o contador ${c0} → ${tr ? tr.chop : '—'}; ${vtxt(vnew())}`); }
  // (e) the ground changes: the bank dug becomes river in the middle
  { const bk = bankNear(); if (bk) safe(bk.x, bk.y); const v = bk && bodyAt(bk.x, bk.y, 0.01);
    if (v) { G.Avatar.place(bk.x - bk.wx * 0.3, bk.y - bk.wy * 0.3); frames(2); G.Avatar.state().yaw = Math.atan2(bk.wy, bk.wx); frames(1); }
    const t = v && target('barro'); const r = t && E('barro', t);
    if (t) { const i = W.idx(t.x, t.y); god(() => { S.type[i] = G.T.RIVER; S.typeVer = (S.typeVer || 0) + 1; W.invalidateLand && W.invalidateLand(); W.touchWalk && W.touchWalk(); }); }
    const a = G.Avatar.actNow(); until(() => !G.Avatar.busy(), 6000);
    ok('t11 o chão que muda (a margem vira rio no meio): o mundo diz não, nada nas mãos', !!(r && r.ok) && a && a.res && !a.res.ok && !(v.carry && v.carry.n > 0), `${a ? 'resposta: ' + (a.res ? (a.res.ok ? 'feito' : a.res.why) : '—') : 'sem cavar'}`); }
  // (f) the work held: «Cortar até cair» — stroke after stroke until the tree falls; and the player who walks lets it go
  { const tr = freshTree(); const v = Po.body(); if (v) give(v, 'machado.ferro');
    const T = tr && { tr, X: tr.x * L, Z: tr.y * L }; const off = tr && I.offer({ id: 'arvore', p: I.list.find(q => q.id === 'arvore'), t: T, label: '', ok: true });
    const r = tr && F('arvore', T, 'segurar'); const k = until(() => tr.stage !== 'grow', 8000); until(() => !Tr.chain(), 300);
    ok('t11 segurar o E corta até cair (golpe atrás de golpe, sem novo aperto)', !!r && r.ok && k >= 0 && !Tr.chain(), `os verbos: ${off ? off.verbs.map(x => x.k + ': ' + x.label).join(' · ') : '—'}; ${k >= 0 ? 'caiu em ' + k + ' quadros' : 'não caiu'}`);
    const tr2 = freshTree(); const v2 = Po.body(); if (v2) give(v2, 'machado.ferro'); const T2 = tr2 && { tr: tr2, X: tr2.x * L, Z: tr2.y * L };
    const r2 = tr2 && F('arvore', T2, 'segurar'); frames(40); const c0 = tr2.chop; G.Avatar.input.mx = 1; frame(); const still = !!Tr.chain(); G.Avatar.input.mx = 0; until(() => !G.Avatar.busy(), 300); const c1 = tr2.chop; frames(60);
    ok('t11 o jogador que anda solta o trabalho segurado (o golpe em curso acaba, o próximo não vem)', !!r2 && r2.ok && !still && tr2.stage === 'grow' && tr2.chop === c1 && c0 > 0, `${still ? 'continuou' : 'soltou'}; o contador ${c0.toFixed(2)} → ${c1.toFixed(2)} → ${tr2.chop.toFixed(2)}; a árvore ${tr2 ? tr2.stage : '—'}`); }
}

// ------------------------------ t12: the people of the world ------------------------------
if (on('t12')) {
  const A3 = G.Anim3D;
  ok('t12 os atos do mundo mostram os gestos dos ofícios (o machado de cima, a picareta, a foice), sem erro de registro', A3 && A3.CLIP_OF.chop === 'machado' && A3.CLIP_OF.cut === 'machado' && A3.CLIP_OF.mine === 'picareta' && A3.CLIP_OF.harvest === 'ceifar' && !A3.clipErr.length && ['machado', 'picareta', 'ceifar', 'vara', 'rede', 'lanca-agua', 'maos-agua', 'esfolar', 'colher-mato', 'pa', 'cavar-maos', 'apregoar'].every(c => A3.CLIPS[c]),
    `chop → ${A3 && A3.CLIP_OF.chop}, mine → ${A3 && A3.CLIP_OF.mine}, harvest → ${A3 && A3.CLIP_OF.harvest}; erros: ${A3 ? A3.clipErr.join('; ') || 'nenhum' : '—'}`);
  // (a woodcutter of the world without things of their own: the axe of the trade in the hand while chopping; a farmer, the sickle)
  const wc = [...S.villagers.values()].find(o => !Po.is(o) && !Inv.real(o) && o.age >= 16 && o.age < 60 && !o.carry);
  if (wc) {
    const a0 = wc.act; wc.act = 'chop'; const h1 = Inv.held(wc); wc.act = 'harvest'; const h2 = Inv.held(wc); wc.act = a0;
    ok('t12 quem é do mundo segura a ferramenta do ato (o kit): o machado de quem corta, a foice de quem colhe', h1.mao && It.def(h1.mao).kind === 'machado' && h2.mao && It.def(h2.mao).kind === 'foice', `${wc.name}: cortando ${h1.mao}, colhendo ${h2.mao}`);
  }
  // (the body: only its own — the hammer it breaks stone with is the hammer, not the pick of the act)
  const rock = [...S.rocks.values()].filter(r => r.stone >= 4 && !r.claim).sort((a, b) => a.id - b.id).find(r => bodyAt(r.x, r.y, 0.62)); const v = Po.body();
  if (rock && v) {
    god(() => Inv.realize(v)); clearBag(v); give(v, 'martelo.bronze'); const T = { r: rock, X: rock.x * L, Z: rock.y * L }; E('pedra', T); frames(4); const h = Inv.held(v); const act = v.act; until(() => !G.Avatar.busy(), 300); frames(3);
    ok('t12 o corpo segura só o que é seu (D-426): o martelo na pedra é o martelo; o ato do corpo some quando o golpe acaba', h.mao === 'martelo.bronze' && act === 'hammer' && v.act === '', `na mão: ${h.mao} (o ato ${act}); depois: «${v.act}»`);
  } }

// ------------------------------ t13: the world's results the same ------------------------------
if (on('t13')) {
  const me = path.join(__dirname, '..');
  const run = (root, body) => { const o = cp.spawnSync(process.execPath, [__filename, '--digital', root, body ? '1' : '0'], { encoding: 'utf8', timeout: 600000 }); const m = (o.stdout || '').match(/DIGITAL (.*)/); return m ? m[1] : 'ERRO ' + (o.stderr || '').slice(-300); };
  const a = run(me, false), b = run(me, true);
  ok('t13 o mesmo mundo com e sem o arcabouço do trabalho carregado (a mesma semente, três minutos do mundo)', a === b && !/^ERRO/.test(a), `sem: ${a.slice(0, 140)} · com: ${b === a ? 'igual' : b.slice(0, 140)}`);
  if (!process.env.NODIGI) {
    const old = path.join(process.env.TRABALHO_OLD || '/tmp/claude-0/-home-user-promptzada-de-adulto-do-dr-s-ntese/474a40dc-2376-5786-aa24-770c3a52b5eb/scratchpad/old76', 'god-of-the-ant-farm');
    if (!fs.existsSync(path.join(old, 'index.html'))) ok('t13 o mesmo mundo que o 76e3cae', false, `a cópia do 76e3cae não está em ${old} (git archive 76e3cae god-of-the-ant-farm | tar -x -C …; ou TRABALHO_OLD=…)`);
    else { const c = run(old, false), d = run(old, true); ok('t13 o mesmo mundo que o 76e3cae (com e sem o corpo)', c === a && d === a, `76e3cae: ${c === a ? 'igual' : c.slice(0, 140)} · com o corpo: ${d === a ? 'igual' : d.slice(0, 140)}`); }
  } }

// ------------------------------ x ------------------------------
{ const e = M.erros(); const bad = vnew();
  ok('x nenhum erro de módulo nem do console; o verificador limpo', !Object.keys(e.mod).length && !e.console.length && !bad.length, `módulos: ${JSON.stringify(e.mod).slice(0, 200)} · console: ${e.console.slice(0, 2).join(' | ').slice(0, 200)} · ${vtxt(bad)}`); }
console.log(fails.length ? `FALHOU: ${fails.length} (${[...new Set(fails)].join(', ')})` : 'PASSOU (trabalho)');
process.exit(fails.length ? 1 : 0);
