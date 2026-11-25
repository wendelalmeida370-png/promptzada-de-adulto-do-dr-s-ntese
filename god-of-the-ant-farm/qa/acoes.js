// acoes: a interação clara (a quarta onda da taverna, I — D-915 a D-929), em Node, pelo qa/nodemundo.js, no mundo pronto (a metrópole),
// à noite, com as tavernas abertas e gente às mesas. O que o corpo pode fazer agora se vê e se alcança:
//  a1 a barra da mesa: o corpo sentado a uma mesa com gente tem a barra — o pedido (o E da mesa), a rodada, os dados, as tabuletas, os
//     ossinhos, a música, a gorjeta, levantar —, cada uma com a sua tecla; o que não dá agora está lá, apagado, com o porquê do mundo
//     (o mesmo do can de cada verbo: T.verbos, G.JogoDados.verbo, G.Cartas.podeCorpo)
//  a2 cada ação da barra chega ao mundo pelas portas do verbo: o pedido chama quem serve; a rodada é paga pelo livro; os dados chamam a
//     mesa (o jogo existe); as tabuletas abrem o convite (com quem e a aposta); levantar solta o lugar; um gole no meio não tira o corpo
//     do assento (L-2177)
//  a3 as pessoas da sala: quem está à mesa é alvo do corpo, na lista, com os verbos sociais, dar, pagar uma bebida, as tabuletas e os
//     dados; falar, cumprimentar e discutir não tiram ninguém do lugar (a tarefa da taverna e o lugar seguem); pagar uma bebida chega
//     ao livro (a caneca dela paga pelo corpo); o insulto de quem é brigão vira a briga das mesas, não uma briga de rua; o duelo apagado
//  a4 o apagado e o porquê: sem moedas, a rodada e a bebida dizem quanto custam; sem ninguém para jogar, os dados dizem por quê
//  a5 os casos ruins: o save no meio da bebida paga (volta paga, paga uma vez); a pessoa convidada morre antes de ser servida (nada pago,
//     nada quebra); o deus tira a bebida da prateleira (o convite apaga, com o porquê)
//  a7 na soleira da taverna, de fora, diante da porta fechada: o E é a porta (abrir, bater), não «Examinar taverna» (T-2061, L-2178); a
//     lista junta a porta e a taverna, a porta primeiro
//  a8 de pé na sala, de frente para um assento livre de uma mesa com gente, ao longo do caminho até ele: o E é o assento, não quem
//     senta ao lado (L-2181)
//  a9 os jogos da casa (a frente J): de onde vem o jogo e o aluguel sob o nome dele, na barra; sem um livre, «esperando um jogo livre»
//     com o porquê do mundo, e a compra do seu na lista, ao preço do taverneiro; comprado pela lista, «os seus dados»
//  a10 a barra de um lugar que não é a taverna (F14, D-1030 a D-1033), de ponta a ponta: a prova registra, como uma onda registraria, o
//     lugar (um provedor), os verbos dele no registro e a barra («Trono», no palácio ou num templo), e — como um ofício que vem depois, do
//     seu arquivo — um verbo e o seu lugar na barra, com a sua figura; o corpo senta lá pelo verbo «lugar»: a barra na ordem, com as teclas
//     e o apagado com o porquê; cada lugar chega ao mundo pela porta do verbo (a oferta pelo livro, uma vez); a lista do lugar; levantar; a
//     figura com o nome de outra recusada e o lugar trazido de um verbo que a barra tem, o dela (D-1036); a pergunta de uma barra que quebra,
//     erro do módulo dela, e a tela segue; e os casos ruins: o save no meio, a mão do deus, o corpo que morre, o prédio que cai
//  a12 a palavra da primeira vez é da sua barra (L-2270): uma linha da lista feita longe de qualquer barra não esconde a palavra da mesa
//  a6 o verificador limpo em tudo (as regras «interacao» e as da taverna), nenhum erro de módulo
//   node qa/acoes.js [mundo]          (≈ 4 min; ONLY=a1,a2 para algumas)
//   node qa/acoes.js igual PASTA      a «Mesa» igual à de antes (F14): a mesma mão — o corpo senta à mesa, a barra, a lista da mesa e a de uma
//                                     pessoa, a rodada pela barra, levantar — sobre o jogo daqui e sobre o da PASTA (uma cópia do jogo de
//                                     antes), cada um no seu processo; a barra e as listas iguais letra por letra (≈ 3 min)
//   RAIZ=PASTA node qa/acoes.js       a prova sobre o jogo da PASTA (ONLY=a12 sobre uma cópia de antes do L-2270 o reproduz)
const path = require('path');
if (process.argv[2] === 'igual') { igual(process.argv[3]); return; }
const M = require('./nodemundo.js');
const G = M.load({ qa: true, root: process.env.RAIZ || undefined, extra: ['js/space.js', 'js/people3d.js', 'js/anim-gait.js', 'js/anim-clips.js', 'js/anim-body.js', 'js/possess.js', 'js/interact.js', 'js/avatar.js', 'js/interacao-clips.js', 'js/cam3d.js', 'js/input3d.js', 'js/incui.js', 'js/cardapio-ui.js', 'js/cartas-arte.js', 'js/cartas-ui.js', 'js/jogo-dados-ui.js', 'js/acoes-ui.js', 'js/combate-clips.js', 'js/combate3d.js', 'js/combate-ui.js', 'js/modes.js', 'qa/interacao-inv.js', 'qa/taverna-vida-inv.js'] });
const D = G.Depot, T = G.Taverna, In = G.Interiors, Po = G.Possess, I = G.Interact, U = G.AcoesUI;
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null; const on = k => !ONLY || ONLY.includes(k);
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | acoes ${name} | ${info}`); if (!c) fails.push(name.split(' ')[0]); };
const world = process.argv[2] || 'metropole';
const clock = () => { const c = process.cpuUsage(); return (c.user + c.system) / 1e6; }; const c0 = clock();
const S = () => G.S; const TL = G.Space.TILE; const RDT = 1 / 30;
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
const frame = () => { G.debug.step(RDT * G.Space.TIME); G.Avatar.frame(RDT); };
const fast = () => { G.debug.step(0.1); G.Avatar.frame(RDT); };
const until = (f, sec) => { const t0 = S().clock; while (!f() && S().clock - t0 < sec) fast(); return f(); };
const calm = () => { const w = S().weather; w.rain = 0; if (w.storm) w.storm = 0; if (!(S().divinePeace > G.DAY_LEN * 0.5)) god(() => G.Politics.divinePeace()); for (const s of S().settlements.values()) { if (s.alarmT > 0) s.alarmT = 0; } god(() => { G.mod('tf.olha', S().clock + 1e9); for (const b of S().buildings.values()) if (b.festa) delete b.festa; }); };
const seen = []; D.onMove.push(e => { seen.push({ t: e[2], from: e[3], to: e[4], k: e[5], n: e[6], op: e[7], c: e[8], by: e[9] }); });
const bad = []; const watch = () => { for (const q of QA.check().filter(q => q.sev <= 2 && (q.sys === 'taverna' || q.sys === 'interacao' || q.sys === 'int'))) { const m = `S${q.sev} ${q.sys}: ${q.msg}`; if (bad.length < 8 && !bad.includes(m)) bad.push(m); } };
const SEATK = { banquinho: 1, banco: 1, cadeira: 1 };
const nameOf = o => Po.knows.call(Po.body(), o);

// ---------------- the evening: the taverns open, people at the tables ----------------
M.pronto(world); calm();
while (S().time < 0.68) { calm(); M.viver(1); }
const SNAP = G.Save.serialize();
const fresh = () => { seen.length = 0; if (Po.body()) Po.release('deus'); G.Avatar.detach(); M.reseed(4242); G.Save.apply(JSON.parse(SNAP)); G.Main.mode = 'game'; if (G.UI && G.UI.setSpeed) G.UI.setSpeed(0); calm(); };
// (a table of an open tavern with two or more of the customers at it, and a free seat there — the body's place among them)
function pick() {
  const out = [];
  for (const b of [...S().buildings.values()].filter(b => b.type === 'taverna' && b.built && In.has(b) && T.dia(b) && T.aberta(b)).sort((a, c) => a.id - c.id)) {
    const kp = T.keeperOf(b); if (!kp || !T.atHand(b)) continue; const d = T.dia(b).data; const p = G.Space.planNow(b); if (!p || !p.entrance) continue;
    const at = new Map(); for (const id of Object.keys(d.mesa)) { const m = d.mesa[id]; const o = S().villagers.get(+id); if (!m.g || m.body || !o || o.age < 16 || m.st < 2 || m.st === 6 || m.st === 9) continue; at.set(m.g, (at.get(m.g) || 0) + 1); }
    const seats = In.freeNear(b, p.entryLv || 0, p.entrance.x, p.entrance.z, 60, ['sentar', 'comer']).filter(q => SEATK[q.it.kind] && In.walkIn(b, q) < Infinity && (at.get(In.groupOf(b, q.it.id)) || 0) >= 2);
    // (and the house's games free there — the dice and the two decks, the J's: a tavern whose games are all at other tables only waits)
    const JC = G.JogosCasa; const games = JC ? (JC.casa(b, 'dados').livres >= 1 ? 1 : 0) + (JC.casa(b, 'baralho').livres >= 2 ? 1 : 0) : 0;
    if (seats.length) out.push({ b, kp, seat: seats[0], n: at.get(In.groupOf(b, seats[0].it.id)), games });
  }
  return out.sort((x, y) => y.games - x.games || y.n - x.n)[0] || null;
}
function bodyFor(b, kp) {
  const fid = G.Village.facOfSet(b.set);
  const L = [...S().villagers.values()].filter(o => o !== kp && o.age >= 18 && o.age < 55 && !o.sleeping && !o.inside && G.Fac.idOfV(o) === fid && Po.can(o).ok && D.get(G.Eco.coinRef(o), 'moedas') >= 2 && D.strength(o) > 0)
    .sort((a, c) => G.dist(a.x, a.y, b.x, b.y) - G.dist(c.x, c.y, b.x, b.y) || a.id - c.id);
  return L[0] || null;
}
// (into the tavern at that seat by the verb 'lugar' — as the qa/taverna-corpo.js does)
function seatIn(b, v, pl) {
  pl.at = In.standFor(b, pl, pl.x, pl.z);
  if (!Po.is(v)) { G.Vg.endTask(v); v.path = null; if (!Po.take(v).ok) return { why: 'não encarnou' }; } else G.Avatar.detach();
  v.inside = b.id; v.x = b.x + pl.at[0] / TL; v.y = b.y + pl.at[1] / TL; Po.setLevel(pl.lv); G.Avatar.attach(v, 0); for (let k = 0; k < 4; k++) frame();
  const st = G.Avatar.state(); let best = null;
  for (let k = 0; k < 60 && !(best && best.id === 'lugar'); k++) { const ya = Math.atan2(b.y * TL + pl.z - st.Z, b.x * TL + pl.x - st.X); G.Avatar.input.camYaw = ya; st.yaw = ya; best = I.best(); frame(); }
  if (!(best && best.id === 'lugar')) return { why: `o E oferece ${best ? '«' + best.label + '»' : 'nada'}` };
  I.run(best); for (let k = 0; k < 150 && !(G.Avatar.seatNow() && G.Avatar.seatNow().k >= 1); k++) frame();
  const u = Po.useOf(); return { ok: !!u && u.b === b.id };
}
let PK = null; { const p = pick(); if (p) { const v = bodyFor(p.b, p.kp); if (v) PK = { b: p.b.id, seat: p.seat, v: v.id, n: p.n }; } }
if (!PK) { ok('o retrato', false, 'nenhuma taverna aberta com uma mesa de dois ou mais e um lugar livre nela'); process.exit(1); }
const B = () => S().buildings.get(PK.b); const OP = () => T.dia(B());
// (seated, and the tavern's book has the body at its table — its entry is made by the tavern's second of the world: taverna-corpo c14)
function sit() { const v = S().villagers.get(PK.v); const pl = In.freeFor(B(), PK.seat.it.id, PK.seat.q, PK.seat.x, PK.seat.z) || PK.seat; const r = seatIn(B(), v, Object.assign({}, PK.seat, pl));
  if (r.ok) until(() => { const m = OP() && OP().data.mesa[v.id]; return !!m && !!m.corpo && !!m.seat && !!m.g; }, 6); return r; }
// (the keeper come to the body's table with the menu, sent back — «agora não», as the menu's own button: he serves the others meanwhile)
// (a few seconds at most: the evening is short — the day is 200 s of the world, the tavern open about 60 of them —, and he may be busy)
function freeKeeper(sec) { const v = Po.body(); until(() => { const s = T.corpo(v); return s && s.cv === 'carta'; }, sec || 8); const s = T.corpo(v); if (s && s.cv === 'carta') { const ask = Po.apply(w => T.dismiss(w, s.op)); until(() => !!ask.res, 2); } }
// (those at the body's table: by the share-out's tables)
const mates = () => { const v = Po.body(); const u = Po.useOf(); if (!u) return []; const g = In.groupOf(B(), u.it); return [...S().villagers.values()].filter(o => o !== v && o.inside === B().id && !o.sleeping && o.task && o.task.type === 'tavern' && In.placeOf(o) && In.placeOf(o).item && In.groupOf(B(), In.placeOf(o).item) === g); };
// (the choice of a person in the body's room, as the list gets it: their target of the look)
const personOf = o => { const sn = I.scan(); const c = sn && sn.all.find(q => q.p.id === 'pessoa' && q.t.o === o); return c ? I.asChoice({ p: c.p, t: c.t }) : null; };
const rowOf = (c, id) => { const m = U.lista(c); return m ? m.verbs.findIndex(q => q.id === id) : -1; };
const slot = id => { const m = U.mesa(); return m ? m.items.findIndex(q => q.id === id) : -1; };
// (the words told to the player — a greyed slot's why, an answer)
const toasts = []; { const t0 = G.IncUI.toast; G.IncUI.toast = function (t) { toasts.push(String(t || '')); return t0.apply(this, arguments); }; }

// ---------------- the portrait of the table's bar (RETRATO=1, for «igual»: the same hand over this game and over a copy of before) ----------------
// (seated at the table: the bar, the table's list, a person's of the table, the dice's word; the round by the bar; up — each as the screen
// reads it, only the fields the bar had before F14: the same letters, or the Mesa is not the same)
if (process.env.RETRATO) {
  fresh(); const r = sit(); const out = { sat: !!r.ok, why: r.why || '', meta: { raiz: M.root, registro: typeof U.bar === 'function' } }; // (meta: which game ran — out of the comparison)
  const bar = m => (m ? { b: m.b, tema: m.tema, nome: m.nome, items: m.items } : null);
  const lst = m => (m ? { key: m.key, id: m.id, nome: m.nome, sub: m.sub, o: m.o, icon: m.icon, verbs: m.verbs.map(q => ({ k: q.k, id: q.id, label: q.label, sub: q.sub, ok: q.ok, why: q.why, icon: q.icon, key: q.key })) } : null);
  if (r.ok) {
    for (let k = 0; k < 20; k++) frame();
    out.mesa = bar(U.mesa()); out.listaMesa = lst(U.lista(I.here('taverna'))); out.how = U.how('jd-dados');
    const o = mates().filter(x => personOf(x))[0]; out.pessoa = o ? lst(U.lista(personOf(o))) : null;
    const ir = slot('tv-rodada'); out.rodada = ir >= 0 ? U.faz(ir) : null; for (let k = 0; k < 30; k++) frame(); out.mesa2 = bar(U.mesa()); out.toasts = toasts.slice();
    const il = slot('levantar'); out.up = U.faz(il); for (let k = 0; k < 40; k++) frame(); out.mesa3 = bar(U.mesa()); out.listaUp = lst(U.lista(I.here('taverna')));
  }
  process.stdout.write('\nRETRATO ' + JSON.stringify(out) + '\n'); process.exit(0);
}

// ---------------- a12 the word of the first time is its bar's (L-2270) ----------------
// (first of the parts: the table's word not yet seen in this run. A greeting done by the list in the street — away from any bar — leaves the
// table's word to show; a slot of the table's bar, then, marks it seen — the tavern's key, «gotaf-dica-mesa» —, and only it)
if (on('a12')) {
  fresh(); bad.length = 0; let pair = null;
  for (const v of [...S().villagers.values()].filter(o => o.age >= 18 && o.age < 55 && !o.sleeping && !o.inside && !o.aboard && Po.can(o).ok).sort((a, c) => a.id - c.id)) {
    const o = [...S().villagers.values()].find(x => x !== v && x.age >= 16 && !x.sleeping && !x.inside && !x.aboard && !x.held && G.dist(x.x, x.y, v.x, v.y) * TL < 2.4 && G.dist(x.x, x.y, v.x, v.y) * TL > 0.6); if (o) { pair = { v, o }; break; } }
  const seen0 = U.dicaVista();
  if (!pair) ok('a12 a palavra da primeira vez', false, 'ninguém na rua ao lado de alguém');
  else {
    const { v, o } = pair; G.Vg.endTask(v); v.path = null; Po.take(v); G.Avatar.attach(v, Math.atan2(o.y - v.y, o.x - v.x)); for (let k = 0; k < 4; k++) frame();
    const c = personOf(o); const ig = c ? rowOf(c, 'soc-cumprimentar') : -1; if (ig >= 0) U.lado(ig, c); for (let k = 0; k < 10; k++) frame();
    let kept = null; try { kept = localStorage.getItem('gotaf-dica-mesa'); } catch (e) { kept = 'erro'; }
    const street = U.dicaVista(); let after = null;
    // (then at the table, the bar used: the table's word is done with)
    // (a slot that can be done now — getting up always can: a greyed one tapped only says why, and was never a use of the bar)
    fresh(); const r = sit(); if (r.ok) { for (let k = 0; k < 10; k++) frame(); U.faz(slot('levantar')); after = U.dicaVista(); }
    ok('a12 a palavra da primeira vez é da sua barra: cumprimentar alguém na rua pela lista não esconde a palavra da mesa da taverna; usar a barra da mesa, sim (L-2270)',
      !seen0 && ig >= 0 && !street && kept === null && (!r.ok || after === true), `antes ${seen0 ? 'JÁ VISTA' : 'não vista'}; ${ig >= 0 ? `cumprimentou ${nameOf(o)} na rua pela lista` : 'SEM O VERBO'}: a palavra da mesa ${street ? 'DADA POR VISTA' : 'ainda por ver'} (no navegador: ${kept === null ? 'nada guardado' : `«${kept}»`}); à mesa, depois de usar a barra: ${after === null ? '—' : after ? 'vista' : 'AINDA POR VER'}`);
    watch(); ok('a12 o verificador limpo', !bad.length, bad.join(' | ') || 'nada');
  }
}

// ---------------- a1 the bar of the table ----------------
if (on('a1') || on('a2')) {
  fresh(); bad.length = 0; const r = sit(); const v = Po.body();
  if (!r.ok) ok('a1 o corpo senta à mesa', false, r.why || 'não sentou');
  else {
    for (let k = 0; k < 20; k++) frame();
    const m = U.mesa(); const ids = m ? m.items.map(q => q.id) : [];
    // (the dice's slot is there while their verb says something — its words or its why: the can of the dice says none while the table
    // plays bones, G.JogoDados.verbo's k null — T-2070)
    const want = ['', 'tv-rodada', 'tv-cartas', 'tv-jogo', 'tv-musica', 'levantar'].concat(G.JogoDados.verbo(v).k ? ['jd-dados'] : []);
    const keysOk = m && m.items.every((q, i) => (q.id === 'levantar' ? q.key === G.Input3D.label('pular') : i < 8 ? !!q.key : true));
    ok('a1 sentado a uma mesa com gente, a barra da mesa: o pedido, a rodada, os dados, as tabuletas, os ossinhos, a música (e a gorjeta com quem toque) e levantar, cada um com a sua tecla',
      !!m && want.every(id => ids.includes(id)) && keysOk, m ? m.items.map(q => `[${q.key}] ${q.nome}${q.ok ? '' : ` — «${q.why}»`}${q.sub ? ` (${q.sub})` : ''}`).join(' · ') : 'sem barra');
    // (what cannot be done now: there, greyed, with the world's own why)
    const vb = T.verbos(v); const jd = G.JogoDados.verbo(v); const cp = G.Cartas.podeCorpo(v); const it = id => m.items.find(q => q.id === id) || {};
    const same = [['tv-rodada', vb.rodada], ['jd-dados', jd.k ? jd : { ok: true }], ['tv-cartas', cp], ['tv-jogo', vb.jogo], ['tv-musica', vb.musica]].filter(([id, c]) => !c.ok && c.why).map(([id, c]) => [id, it(id).why === c.why && !it(id).ok, c.why]);
    const offWhy = m.items.filter(q => !q.ok).every(q => !!q.why);
    ok('a1 o apagado diz por quê, e o porquê é o do mundo (o can de cada verbo)', offWhy && same.every(x => x[1]), same.map(x => `${x[0]}: «${x[2]}» ${x[1] ? 'igual' : 'DIFERENTE'}`).join('; ') || 'tudo pode agora');
    // (the person's dice — the table's call, by its own words — and the list of the table)
    const tb = I.here('taverna'); const L = U.lista(tb);
    ok('a1 a lista da mesa: as mesmas ações, com as palavras inteiras', !!L && L.verbs.length >= 5 && L.nome === 'A mesa', L ? L.verbs.map(q => `${q.label}${q.ok ? '' : ` — ${q.why}`}`).join(' | ') : '-');
    watch(); ok('a1 o verificador limpo', !bad.length, bad.join(' | ') || 'nada');
  }
  // ---------------- a2 each action of the bar reaches the world ----------------
  if (r.ok && on('a2')) {
    bad.length = 0; const op = OP().id;
    // (the table's E: the keeper called, or the menu opened — the world's step answers)
    const i0 = slot(''); const s0 = T.corpo(v); const did0 = U.faz(i0); until(() => { const s = T.corpo(v); return s && (s.cv === 'chama' || s.cv === 'carta'); }, 6); const s1 = T.corpo(v);
    ok('a2 o pedido (o E da mesa): pelas mãos, chama quem serve ou abre o cardápio', did0 && !!s1 && (s1.cv === 'chama' || s1.cv === 'carta'), `antes ${s0 && s0.cv}, depois ${s1 && s1.cv}`);
    // (the round: paid by the ledger, each cup the body's)
    const ir = slot('tv-rodada'); const q = U.mesa().items[ir]; const t1 = S().clock;
    if (q && q.ok) { U.faz(ir); until(() => seen.some(e => e.t >= t1 && e.c === 'taverna' && e.op === op && e.k === 'moedas' && e.from === G.Eco.coinRef(v)), 60);
      const paid = seen.filter(e => e.t >= t1 && e.c === 'taverna' && e.op === op && e.k === 'moedas' && e.from === G.Eco.coinRef(v)).length;
      ok('a2 a rodada: pela barra, o taverneiro serve a mesa e o corpo paga pelo livro', paid >= 1, `${paid} caneca(s) paga(s) pelas moedas do corpo`); }
    else ok('a2 a rodada', true, `não dá agora: «${q ? q.why : '-'}» — a parte não se aplica`);
    // (a sip under way and a verb asked: the body stays on its seat — the act cut, the seat kept, L-2177)
    G.Avatar.act({ anim: 'mesa-beber', dur: 2.6, contact: 1.2, free: true }); for (let k = 0; k < 3; k++) frame();
    const busy0 = G.Avatar.busy(); const tb0 = I.here('taverna'); const vk = I.verbsOf(tb0, false).find(x => x.k === 'outra' && x.ok && x.id !== 'tv-rodada');
    if (vk) I.runVerb('outra', tb0, vk.id); else G.Avatar.cancelAct(); for (let k = 0; k < 6; k++) frame();
    const st = G.Avatar.state();
    ok('a2 um verbo no meio de um gole: o gole cede, e o corpo fica no assento (L-2177)', busy0 && !!st && st.loco === 'seat' && G.Avatar.seated() && !!Po.useOf(), `${vk ? '«' + vk.label + '»' : 'o gole cortado'}; loco ${st && st.loco}, sentado ${G.Avatar.seated()}, o lugar ${Po.useOf() ? 'seu' : 'solto'}`);
    { const jc0 = G.JogoDados.corpo(v); if (jc0 && jc0.eu) { const ask = Po.apply(w => G.JogoDados.sair(w, jc0.op)); until(() => !!ask.res, 2); until(() => !G.JogoDados.corpo(v) || !G.JogoDados.corpo(v).eu, 30); } }
    // (a game waiting for one free — the house's all at other tables —: one's own bought of the keeper by the list, where the waiting
    // slot sends (D-926), as the player would; then the game is the body's own)
    const bought = []; const buyFor = id => { const q = U.mesa().items[slot(id)]; if (!q || q.ok || !q.buy) return q; const tb = I.here('taverna'); const L = tb ? U.lista(tb) : null; const i = L ? L.verbs.findIndex(x => x.id === q.buy && x.ok) : -1; if (i < 0) return q;
      const tipo = id === 'jd-dados' ? 'dados' : 'baralho'; U.lado(i, tb); until(() => !!G.JogosCasa.proprio(v, tipo), 3); for (let k = 0; k < 4; k++) frame(); bought.push(`comprou ${tipo === 'dados' ? 'os seus dados' : 'o seu baralho'}: «${(U.mesa().items[slot(id)] || {}).sub || ''}»`); return U.mesa().items[slot(id)]; };
    // (the dice: the table called — a game of the world, the body its host)
    const idd = slot('jd-dados'); const qd = buyFor('jd-dados');
    if (qd && qd.ok) { const k0 = G.JogoDados.verbo(v).k; U.faz(idd); until(() => !!G.JogoDados.corpo(v) && (k0 !== 'chamar' || G.JogoDados.corpo(v).euHost) && (k0 !== 'entrar' || G.JogoDados.corpo(v).eu === v.id), 4); const jc = G.JogoDados.corpo(v);
      // (by what the verb was: the table called — the body the host —; the game called at the table, joined; one under way, watched)
      const right = !!jc && (k0 === 'chamar' ? jc.euHost : k0 === 'entrar' ? jc.eu === v.id : true);
      ok('a2 os dados: pela barra, a mesa é chamada para o copo, o corpo entra no jogo chamado ou olha o da mesa (o jogo do mundo)', right, jc ? `${bought.length ? bought.join('; ') + '; ' : ''}«${qd.label}» (${k0}): fase ${jc.fase}, o corpo ${jc.euHost ? 'chamou' : jc.eu === v.id ? 'entrou' : 'olha'}; ${jc.convite.map(x => `${x.nome}: ${x.sim ? 'sim' : 'não (' + x.por + ')'}`).join(', ')}` : 'nenhum jogo');
      const ask = Po.apply(w => G.JogoDados.sair(w, jc ? jc.op : 0)); until(() => !!ask.res, 2); }
    else ok('a2 os dados', true, `não dá agora: «${qd ? qd.why : '-'}» — a parte não se aplica`);
    // (the Tabuletas: the invitation opens — with whom and at what stake —, the screen's first step)
    const ic = slot('tv-cartas'); const qc = buyFor('tv-cartas'); let conv = null; const c0b = G.CartasUI.convite; G.CartasUI.convite = id => { conv = { id }; return true; };
    if (qc && qc.ok) { U.faz(ic); ok('a2 as tabuletas: pela barra, o convite abre (com quem e a aposta: a tela do jogo)', !!conv, `${bought.filter(x => /baralho/.test(x)).join('; ')}${conv ? ' o convite' : ' nada'}`); }
    else ok('a2 as tabuletas', true, `não dá agora: «${qc ? qc.why : '-'}» — a parte não se aplica`);
    G.CartasUI.convite = c0b;
    // (getting up: the jump of the feet — the seat let go by the world)
    const il = slot('levantar'); U.faz(il); for (let k = 0; k < 40; k++) frame();
    ok('a2 levantar: pela barra, o corpo se levanta e o mundo solta o lugar', !G.Avatar.seated() && !Po.useOf() && !U.mesa(), `sentado ${G.Avatar.seated()}, o lugar ${Po.useOf() ? 'ainda seu' : 'solto'}, a barra ${U.mesa() ? 'ainda lá' : 'fora'}`);
    watch(); ok('a2 o verificador limpo', !bad.length, bad.join(' | ') || 'nada');
  }
}

// ---------------- a3 the people of the room ----------------
if (on('a3')) {
  fresh(); bad.length = 0; const r = sit(); const v = Po.body();
  if (!r.ok) ok('a3 o corpo senta à mesa', false, r.why || 'não sentou');
  else {
    for (let k = 0; k < 20; k++) frame(); freeKeeper();
    // (of those at the table, the ones in the hands' reach — a long table has some beyond it —, one between rounds first: a cup paid for
    // them is ordered at once)
    const sn = I.scan(); const tgt = sn ? sn.all.filter(c => c.p.id === 'pessoa' && c.t.room).map(c => c.t.o) : [];
    const L = mates().filter(x => tgt.includes(x)).sort((a, c) => ((OP().data.mesa[c.id] || {}).st === 5 ? 1 : 0) - ((OP().data.mesa[a.id] || {}).st === 5 ? 1 : 0)); const o = L[0];
    const cands = I.candidates(sn).filter(c => c.id === 'pessoa').map(c => c.t.o);
    ok('a3 quem está à mesa do corpo é uma pessoa para ele (alvo do E, na lista e na troca de alvos)', !!o && L.every(x => cands.includes(x)), `à mesa e ao alcance: ${L.map(nameOf).join(', ') || 'ninguém'}; na troca de alvos: ${cands.map(nameOf).join(', ') || 'nenhum'}`);
    if (o) {
      const c = personOf(o); const lm = c ? U.lista(c) : null; const has = id => !!lm && lm.verbs.some(q => q.id === id);
      const bebe = lm && lm.verbs.find(q => q.id === 'soc-beber'); const duel = lm && lm.verbs.find(q => q.id === 'desafiar');
      ok('a3 a lista da pessoa: falar, os verbos sociais, dar, pagar uma bebida, as tabuletas e os dados; o duelo apagado, com o porquê',
        !!lm && has('soc-cumprimentar') && has('soc-elogiar') && has('dar') && !!bebe && /^Pagar uma bebida/.test(bebe.label) && has('pe-cartas') && has('pe-dados') && !!duel && !duel.ok && /dentro/.test(duel.why),
        lm ? lm.verbs.map(q => `${q.label}${q.ok ? '' : ` — ${q.why}`}`).join(' | ') : 'sem lista');
      // (the word: said from their place — the tavern's errand and the place go on)
      const task0 = o.task && o.task.type; const pl0 = In.placeOf(o); const t2 = S().clock; U.lado(0, c); for (let k = 0; k < 30; k++) frame(); until(() => S().clock - t2 > 3, 4);
      const said = G.Talk && G.Talk.list.some(b => b.id === o.id && b.t0 >= t2 - 0.01); const pl1 = In.placeOf(o);
      ok('a3 falar com quem está à mesa: responde do lugar — a tarefa da taverna e o lugar seguem', said && o.inside === B().id && o.task && o.task.type === task0 && !!pl1 && !!pl0 && pl1.item === pl0.item && pl1.q === pl0.q,
        `disse ${said ? 'sim' : 'não'}; ${o.task ? o.task.type : 'sem tarefa'} (era ${task0}); no lugar ${pl1 && pl0 && pl1.item === pl0.item ? 'o mesmo' : 'outro'}`);
      // (a greeting: the answer is a word only, the errand kept; and counted)
      const c2 = personOf(o); const ig = rowOf(c2, 'soc-cumprimentar'); const d0 = (S().avatar.deeds || {}).cumprimento || 0; U.lado(ig, c2); for (let k = 0; k < 20; k++) frame(); until(() => ((S().avatar.deeds || {}).cumprimento || 0) > d0, 4);
      ok('a3 cumprimentar quem está à mesa: o feito conta, e a pessoa não sai do lugar', ((S().avatar.deeds || {}).cumprimento || 0) > d0 && o.inside === B().id && o.task && o.task.type === 'tavern', `feito ${(S().avatar.deeds || {}).cumprimento || 0}; ${o.task ? o.task.type : '-'}`);
      // (a cup paid for them: the tavern's door — the next of theirs is the body's, paid by the ledger as it is handed over)
      until(() => !OP() || (OP().data.mesa[o.id] || {}).st === 5, 15); // (between rounds: the cup paid is ordered at once — or the tavern shut meanwhile)
      const c3 = OP() ? personOf(o) : null; const ib = c3 ? rowOf(c3, 'soc-beber') : -1; const qb = ib >= 0 ? U.lista(c3).verbs[ib] : null; const t3 = S().clock;
      if (qb && qb.ok) {
        const mo = () => (OP() ? OP().data.mesa[o.id] : null); const st3 = (mo() || {}).st; U.lado(ib, c3); until(() => { const m = mo(); return !!m && m.paga === v.id; }, 3); const marked = !!(mo() && mo().paga === v.id); const st4 = (mo() || {}).st;
        until(() => seen.some(e => e.t >= t3 && e.c === 'taverna' && e.k === 'moedas' && e.from === G.Eco.coinRef(v)), 90);
        const paid = seen.filter(e => e.t >= t3 && e.c === 'taverna' && e.k === 'moedas' && e.from === G.Eco.coinRef(v)).length; const toO = seen.some(e => e.t >= t3 && e.c === 'taverna' && e.k !== 'moedas' && e.to === 'v:' + o.id);
        const m9 = OP() ? OP().data.mesa[o.id] : null; const kp9 = T.keeperOf(B());
        ok('a3 pagar uma bebida a quem está à mesa: o taverneiro serve, e a caneca dela é paga pelo corpo, uma vez', marked && paid === 1 && toO, `marcada ${marked} (st ${st3} → ${st4}); ${paid} paga(s) pelo corpo; a bebida ${toO ? 'nas mãos dela' : 'não chegou'}; agora st ${m9 ? m9.st : '-'} want ${m9 ? m9.want : '-'} paga ${m9 ? m9.paga : '-'}; fila ${OP() ? JSON.stringify(OP().data.fila) : '-'}; o taverneiro ${kp9 ? (kp9.task ? kp9.task.type + ':' + kp9.task.st : 'sem tarefa') : '-'}; a tarefa dela ${o.task ? o.task.type + ':' + o.task.st : '-'}; ${seen.filter(e => e.t >= t3 && (e.to === 'v:' + o.id || e.from === 'v:' + o.id)).map(e => e.c + ' ' + e.k).join(', ')}`);
      } else ok('a3 pagar uma bebida', true, `não dá agora: «${qb ? qb.why : !OP() ? 'a taverna fechou' : '-'}» — a parte não se aplica`);
      // (the insult of a quarrelsome one: the brawl of the tables — not a street fight: they stay in the room)
      const q2 = mates().filter(x => personOf(x)).find(x => x !== o && !T.brawling(x)) || o; const fa = G.Indole && G.Indole.faceta ? G.Indole.faceta : null;
      const c4 = personOf(q2); const ii = c4 ? rowOf(c4, 'soc-insultar') : -1;
      if (ii >= 0 && fa) {
        const keep = G.Indole.faceta; G.Indole.faceta = (w, k) => (w === q2 && (k === 'agressivo' || k === 'impulsivo') ? 1 : keep(w, k)); const keepN = G.Indole.ax; G.Indole.ax = (w, k) => (w === q2 && k === 'neu' ? 0 : keepN(w, k));
        U.lado(ii, c4); for (let k = 0; k < 12; k++) frame(); const brawl = T.brawling(q2); G.Indole.faceta = keep; G.Indole.ax = keepN;
        ok('a3 o insulto a um brigão à mesa: a briga das mesas (a da taverna), e ele fica na sala', brawl && q2.inside === B().id && !(q2.task && q2.task.type === 'combat'), `briga ${brawl}; ${q2.inside === B().id ? 'na sala' : 'fora'}; ${q2.task ? q2.task.type : '-'}`);
      } else ok('a3 o insulto', true, 'sem o verbo à mão — a parte não se aplica');
    }
    watch(); ok('a3 o verificador limpo', !bad.length, bad.join(' | ') || 'nada');
  }
}

// ---------------- a4 greyed, and why ----------------
if (on('a4')) {
  fresh(); bad.length = 0; const r = sit(); const v = Po.body();
  if (!r.ok) ok('a4 o corpo senta à mesa', false, r.why || 'não sentou');
  else {
    for (let k = 0; k < 20; k++) frame();
    // (no coins: the round says what it costs; the cup for someone too)
    const ref = G.Eco.coinRef(v); const n0 = D.get(ref, 'moedas'); god(() => D.use(ref, 'moedas', n0, { code: 'teste', by: v.id }));
    const m = U.mesa(); const rd = m.items.find(q => q.id === 'tv-rodada'); const o = mates()[0]; const c = o ? personOf(o) : null; const bb = c ? U.lista(c).verbs.find(q => q.id === 'soc-beber') : null;
    const coin = G.Eco.coinage(G.Village.facOfSet(B().set));
    ok('a4 sem moedas: a rodada e a bebida apagadas, dizendo quanto custam', !coin || (!!rd && !rd.ok && /Falta dinheiro/.test(rd.why) && (!bb || (!bb.ok && /Falta dinheiro/.test(bb.why)))), coin ? `rodada «${rd && rd.why}»; bebida «${bb ? bb.why : '-'}»` : 'o povo não usa moeda');
    god(() => D.make(ref, 'moedas', n0, { code: 'teste', by: v.id }));
    // (nobody at the table to play with: the dice say why)
    const away = mates(); const keepT = new Map(); god(() => { for (const q of away) { keepT.set(q.id, q.task); G.Vg.endTask(q); } }); for (let k = 0; k < 10; k++) frame();
    const m2 = U.mesa(); const dd = m2 ? m2.items.find(q => q.id === 'jd-dados') : null; const jv = G.JogoDados.verbo(v);
    ok('a4 ninguém à mesa: os dados apagados, com o porquê do jogo', !!dd && !dd.ok && !!dd.why && dd.why === jv.why, `dados «${dd ? dd.why : '-'}»; o jogo diz «${jv.why}»`);
    watch(); ok('a4 o verificador limpo', !bad.length, bad.join(' | ') || 'nada');
  }
}

// ---------------- a5 the bad cases ----------------
if (on('a5')) {
  fresh(); bad.length = 0; const r = sit(); const v = Po.body();
  if (!r.ok) ok('a5 o corpo senta à mesa', false, r.why || 'não sentou');
  else {
    for (let k = 0; k < 20; k++) frame(); freeKeeper();
    const L = mates().filter(x => personOf(x)); const o = L[0]; const c = o ? personOf(o) : null; const ib = c ? rowOf(c, 'soc-beber') : -1; const qb = ib >= 0 ? U.lista(c).verbs[ib] : null;
    if (qb && qb.ok) {
      // (a save with the cup paid: back paid, paid once)
      U.lado(ib, c); until(() => !!(OP().data.mesa[o.id] && OP().data.mesa[o.id].paga === v.id), 3);
      // (what came back from the save, read at once — the cup may be served in the seconds after)
      const snap = G.Save.serialize(); G.Save.apply(JSON.parse(snap)); const o2 = S().villagers.get(o.id); const m2 = OP() ? Object.assign({}, OP().data.mesa[o.id]) : null; const t5 = S().clock;
      G.Avatar.attach(Po.body(), 0); for (let k = 0; k < 4; k++) frame(); freeKeeper(4); // (the menu the keeper brings again after the load, sent back)
      // (served and paid once; or gone before the cup came — the feast of the city took them, the tavern shut —: nothing paid)
      const gone = () => { const x = S().villagers.get(o.id); return !x || x.inside !== B().id || !(x.task && x.task.type === 'tavern') || !OP(); };
      until(() => gone() || seen.some(e => e.t >= t5 && e.c === 'taverna' && e.k === 'moedas' && e.from === G.Eco.coinRef(Po.body())), 90); for (let k = 0; k < 10; k++) fast();
      const paid = seen.filter(e => e.t >= t5 && e.c === 'taverna' && e.k === 'moedas' && e.from === G.Eco.coinRef(Po.body())).length; const left = gone() && !paid;
      const m3 = OP() ? OP().data.mesa[o.id] : null; const kp3 = T.keeperOf(B()); const o3 = S().villagers.get(o.id);
      ok(left ? 'a5 um save com a bebida paga: volta paga; e quem saiu antes de ser servido não custa nada' : 'a5 um save com a bebida paga: volta paga, e é paga uma vez', !!o2 && !!m2 && m2.paga === Po.body().id && (left ? paid === 0 : paid === 1), `marcada depois do load ${m2 ? m2.paga === Po.body().id : '-'}; ${paid} paga(s)${left ? ` — saiu antes (${o3 && o3.task ? o3.task.type : 'sem tarefa'})` : ''}; agora st ${m3 ? m3.st : '-'} paga ${m3 ? m3.paga : '-'}; o taverneiro ${kp3 && kp3.task ? kp3.task.type + ':' + kp3.task.st : '-'}; o corpo ${JSON.stringify(T.corpo(Po.body()) && { cv: T.corpo(Po.body()).cv, seat: T.corpo(Po.body()).seat })}`);
    } else ok('a5 o save com a bebida paga', true, `não dá agora: «${qb ? qb.why : '-'}» — a parte não se aplica`);
    // (the one invited dies before being served: nothing paid, nothing breaks)
    fresh(); const r2 = sit(); const v2 = Po.body();
    if (r2.ok) { for (let k = 0; k < 10; k++) frame(); freeKeeper(); const q = mates().find(x => personOf(x)); const cq = q ? personOf(q) : null; const iq = cq ? rowOf(cq, 'soc-beber') : -1; const qq = iq >= 0 ? U.lista(cq).verbs[iq] : null;
      if (qq && qq.ok) { U.lado(iq, cq); until(() => !!(OP().data.mesa[q.id] && OP().data.mesa[q.id].paga === v2.id), 3); const t6 = S().clock; god(() => G.Village.kill(q, 'teste', true)); for (let k = 0; k < 200; k++) fast();
        const paid = seen.filter(e => e.t >= t6 && e.c === 'taverna' && e.k === 'moedas' && e.from === G.Eco.coinRef(v2)).length;
        ok('a5 a pessoa convidada morre antes de ser servida: nada pago, nada quebra', !S().villagers.has(q.id) && paid === 0 && !Object.keys(G.modErr || {}).length, `${S().villagers.has(q.id) ? 'viva' : 'morta'}; ${paid} paga(s) pelo corpo`); }
      else ok('a5 a pessoa convidada morre', true, `não dá agora: «${qq ? qq.why : '-'}» — a parte não se aplica`);
      // (the god takes the drink off the shelf: the cup greyed, with why)
      const free3 = x => { const m = OP().data.mesa[x.id]; return !!m && !m.zz && !m.paga && m.st >= 2 && m.st !== 6 && m.st !== 9; }; // (one the cup could be paid for, but for the drink)
      const q3 = mates().find(x => personOf(x) && free3(x)); if (q3) { const bid = 'b:' + B().id; god(() => { for (const k of ['cerveja', 'vinho', 'mel', 'pulque']) { const n = D.get(bid, k); if (n > 0) D.use(bid, k, n, { code: 'teste', by: 0 }); } }); for (let k = 0; k < 4; k++) frame();
        const cq3 = personOf(q3); const b3 = cq3 ? U.lista(cq3).verbs.find(x => x.id === 'soc-beber') : null;
        ok('a5 o deus tira a bebida da prateleira: pagar uma bebida apagado, com o porquê', !!b3 && !b3.ok && /beber|bebida/.test(b3.why), `«${b3 ? b3.why : '-'}»`); }
    }
    watch(); ok('a5 o verificador limpo', !bad.length, bad.join(' | ') || 'nada');
  }
}
// ---------------- a7 at the tavern's door, from the street (T-2061) ----------------
if (on('a7')) {
  fresh(); bad.length = 0; const b = B(); const p = G.Space.planNow(b); const e = p && p.entrance; const d = e && p.doors[e.door];
  if (!e || !e.out || !d || d.kind === 'vao') ok('a7 a porta da taverna', true, 'uma entrada sem folha — a parte não se aplica');
  else {
    // (the door shut or locked: the tavern closed — the night past, the morning before it opens —, nobody passing by it)
    until(() => { const q = In.doorState(b, d.id); return !T.aberta(b) && q && q.state !== 'aberta'; }, 220);
    const v = S().villagers.get(PK.v); G.Vg.endTask(v); v.path = null; Po.take(v); G.Avatar.detach();
    const w = p.walls[d.wall]; const len = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1; const dX = w.a[0] + (w.b[0] - w.a[0]) * d.at / len, dZ = w.a[1] + (w.b[1] - w.a[1]) * d.at / len;
    // (on the doorstep, where the world's people stand to go in — its offer's point, G.Vg.door —, facing the leaf; the door shut)
    god(() => { v.inside = 0; v.x = b.x + e.out[0] / TL; v.y = b.y + e.out[1] / TL; }); Po.setLevel(null); G.Avatar.attach(v, Math.atan2(dZ - e.out[1], dX - e.out[0])); for (let k = 0; k < 6; k++) frame();
    const st0 = In.doorState(b, d.id); const best = I.best(); const sn = I.scan(); const cands = I.candidates(sn); const exam = cands.find(c => c.id === 'porta' && c.t.b === b);
    const lm = best ? U.lista(best, U.par(best)) : null; const r0 = lm && lm.verbs[0];
    ok('a7 na soleira da taverna, diante da porta fechada: o E abre ou bate — não «Examinar» (T-2061)', !!st0 && st0.state !== 'aberta' && !!best && best.id === 'portaPlanta' && /porta/i.test(best.label), `a porta ${st0 ? st0.state : '-'}; o E «${best ? best.label : '-'}» (${best ? best.id : '-'}); na troca: ${cands.map(c => c.label).join(' | ')}`);
    ok('a7 a lista da porta: abrir ou bater primeiro, e a taverna depois, na mesma lista', !!lm && !!r0 && /porta/i.test(r0.label) && (!exam || lm.verbs.some(q => /Examinar/.test(q.label))) && /^A porta d/.test(lm.nome), lm ? `«${lm.nome}»: ${lm.verbs.map(q => q.label).join(' | ')}` : '-');
    watch(); ok('a7 o verificador limpo', !bad.length, bad.join(' | ') || 'nada');
  }
}
// ---------------- a8 standing in the room, the free seat faced (L-2181) ----------------
// (every free seat of a table with people, of every open tavern, walked up to along its way in: at each quarter of a metre within its
// reach, the body facing the seat — the proof's hand puts the body's look there, I.ctx, as the body walking would have it —, the E is the
// seat, or someone more in front than it, nearer in line (one standing in the way); never someone of the room beside it)
if (on('a8')) {
  fresh(); bad.length = 0; const v = S().villagers.get(PK.v); G.Vg.endTask(v); v.path = null; Po.take(v); const ctx0 = I.ctx; let n = 0, lost = 0, seen1 = 0; const ex = [];
  const angOf = (X, Z, yaw, x2, z2) => Math.abs(Math.atan2(Math.sin(Math.atan2(z2 - Z, x2 - X) - yaw), Math.cos(Math.atan2(z2 - Z, x2 - X) - yaw)));
  try {
    for (const b of [...S().buildings.values()].filter(q => q.type === 'taverna' && q.built && In.has(q) && T.dia(q) && T.aberta(q)).sort((a, c) => a.id - c.id)) {
      const p = G.Space.planNow(b); if (!p || !p.entrance) continue; const d = T.dia(b).data;
      const at = new Map(); for (const id of Object.keys(d.mesa)) { const m = d.mesa[id]; const o = S().villagers.get(+id); if (!m.g || !o || o.age < 16) continue; at.set(m.g, (at.get(m.g) || 0) + 1); }
      const seats = In.freeNear(b, p.entryLv || 0, p.entrance.x, p.entrance.z, 60, ['sentar', 'comer']).filter(q => SEATK[q.it.kind] && In.walkIn(b, q) < Infinity && (at.get(In.groupOf(b, q.it.id)) || 0) >= 1);
      if (!seats.length) continue;
      G.Avatar.detach(); god(() => { v.inside = b.id; v.x = b.x + p.entrance.x / TL; v.y = b.y + p.entrance.z / TL; }); Po.setLevel(p.entryLv || 0); G.Avatar.attach(v, 0); frame();
      for (const q of seats) {
        const wp = In.pathIn(b, q); const way = wp && wp.pts; if (!way || way.length < 2) continue; const sx = b.x * TL + q.x, sz = b.y * TL + q.z;
        const pts = []; for (let i = way.length - 1; i > 0; i--) { const a = way[i], c = way[i - 1]; const L = Math.hypot(c[0] - a[0], c[1] - a[1]); for (let u = 0; u < L; u += 0.25) pts.push([a[0] + (c[0] - a[0]) * u / L, a[1] + (c[1] - a[1]) * u / L]); }
        for (const pt of pts) {
          const X = b.x * TL + pt[0], Z = b.y * TL + pt[1]; const dd = Math.hypot(sx - X, sz - Z); if (dd > 2.2 || dd < 0.3) continue;
          const yaw = Math.atan2(sz - Z, sx - X); I.ctx = () => ({ v, X, Y: 0, Z, yaw, x: X / TL, y: Z / TL });
          const best = I.best(); n++; if (best && best.id === 'lugar') seen1++;
          // (someone of the room as the E: only one more in front than the seat — in line with it and nearer, standing in the way)
          if (best && best.id === 'pessoa' && best.t.room) { const pa = angOf(X, Z, yaw, best.t.X, best.t.Z); if (pa > 1e-3) { lost++; if (ex.length < 3) ex.push(`taverna#${b.id} ${q.it.id} a ${dd.toFixed(2)} m: «${best.label}» a ${(pa * 180 / Math.PI).toFixed(0)}°`); } }
        }
      }
    }
  } finally { I.ctx = ctx0; }
  ok('a8 de pé na sala, de frente para um assento livre de uma mesa com gente: o E é o assento, não quem senta ao lado (L-2181)', n > 40 && !lost, `${n} pontos dos caminhos até os assentos livres, ao alcance; o assento é o E em ${seen1}; uma pessoa da sala ao lado dele em ${lost}${ex.length ? ': ' + ex.join(' | ') : ''}`);
  watch(); ok('a8 o verificador limpo', !bad.length, bad.join(' | ') || 'nada');
}
// ---------------- a9 the house's games, as the bar and the list show them (the J's doors, D-933 to D-936) ----------------
// (seated with the house's dice free: the dice's slot says where they come from and the rent — the words of G.JogoDados.verbo —, and the
// Tabuletas' those of G.Cartas.podeCorpo; the god takes the house's dice from the shelf: the slot greys «esperando um jogo livre», with
// the world's why whole, and sends to the list, where buying one's own of the keeper is, at the price of G.JogosCasa.podeComprar; bought by
// the list's row — the world's door, by the hands —, the dice are the body's own: «os seus dados», no rent)
if (on('a9')) {
  fresh(); bad.length = 0; const r = sit(); const v = Po.body(); const JD = G.JogoDados, C = G.Cartas, JC = G.JogosCasa;
  if (!r.ok || !JC) ok('a9 os jogos da casa', !JC, JC ? r.why || 'não sentou' : 'sem os jogos da casa (a frente J) — a parte não se aplica');
  else {
    freeKeeper(); for (let k = 0; k < 10; k++) frame();
    const it = id => (U.mesa() || { items: [] }).items.find(q => q.id === id) || null;
    // (a) the source of each game, under its name
    const jd = JD.verbo(v), cp = C.podeCorpo(v), d0 = it('jd-dados'), c0 = it('tv-cartas'); const said = [];
    if (jd.k === 'chamar' && jd.ok) { if (!d0 || !d0.ok || !d0.sub.includes(jd.de) || (jd.aluguel > 1e-6) !== /^aluguel \d/.test(d0.sub)) bad.push(`os dados: o verbo diz «${jd.de}»${jd.aluguel ? ` e o aluguel ${jd.aluguel}` : ''}, a barra «${d0 ? d0.sub : '-'}»`); said.push(`Dados: «${d0 && d0.sub}»`); }
    else said.push(`os dados: ${jd.k || 'nada'}${jd.why ? ` (${jd.why})` : ''} — a fonte não se aplica`);
    if (cp.ok && !cp.jogo) { if (!c0 || !c0.ok || !c0.sub.includes(cp.de)) bad.push(`as tabuletas: o verbo diz «${cp.de}», a barra «${c0 ? c0.sub : '-'}»`); said.push(`Tabuletas: «${c0 && c0.sub}»`); }
    // (b) the god takes the house's dice: the wait, and the way out
    const b = B(); for (const k of JC.keys('dados')) { const n = Math.floor(D.get('b:' + b.id, k) + 1e-6); if (n >= 1) god(() => D.use('b:' + b.id, k, n, { code: 'deus', mine: true })); }
    for (let k = 0; k < 8; k++) frame();
    const x = JD.verbo(v), d1 = it('jd-dados'), pc = JC.podeComprar(v, 'dados'); const tb = I.here('taverna'); const L = tb ? U.lista(tb) : null;
    const buyRow = L ? L.verbs.findIndex(q => q.id === 'jc-dados-compra') : -1; const br = buyRow >= 0 ? L.verbs[buyRow] : null;
    if (!x.espera) bad.push(`sem os dados da casa, o verbo não espera: ${JSON.stringify({ k: x.k, ok: x.ok, why: x.why })}`);
    else {
      if (!d1 || d1.ok || d1.est !== 'esperando um jogo livre' || d1.why !== x.why) bad.push(`o lugar dos dados esperando: ${JSON.stringify(d1)} — o porquê do mundo «${x.why}»`);
      said.push(`Dados esperando: «${d1 && d1.est}» — «${d1 && d1.why}»`);
      if (pc.k) { // (the keeper sells one: the list has it, at his price; the waiting slot sends to it)
        const price = G.Cartas.preco(b, pc.preco);
        if (!br || (pc.ok && (!br.ok || !br.sub.includes(price))) || (!pc.ok && (br.ok || br.why !== pc.why))) bad.push(`a compra na lista: ${JSON.stringify(br)} — o taverneiro ${JSON.stringify(pc)}`);
        if (pc.ok && (!d1 || d1.buy !== 'jc-dados-compra')) bad.push(`o lugar esperando não leva à compra: ${JSON.stringify(d1)}`);
        if (it('jc-dados-compra')) bad.push('a compra está na barra (é da lista)');
        said.push(`na lista: «${br && br.label}» (${br && (br.ok ? br.sub : br.why)})`);
        // (c) bought by the list's row: the body's own dice
        if (pc.ok) { const c1 = D.get(G.Eco.coinRef(v), 'moedas'); U.lado(buyRow, tb); until(() => !!JC.proprio(v, 'dados'), 3); for (let k = 0; k < 6; k++) frame();
          const x2 = JD.verbo(v), d2 = it('jd-dados'); const paid = c1 - D.get(G.Eco.coinRef(v), 'moedas');
          if (!JC.proprio(v, 'dados') || Math.abs(paid - pc.preco) > 1e-6) bad.push(`a compra pela lista: dados seus ${!!JC.proprio(v, 'dados')}, pagou ${paid} de ${pc.preco}`);
          else if (x2.k === 'chamar' && x2.ok && (!d2 || !d2.ok || !d2.sub.includes(x2.de) || /aluguel/.test(d2.sub))) bad.push(`com os seus dados, a barra: ${JSON.stringify(d2)} — o verbo «${x2.de}»`);
          said.push(`comprou (${G.Cartas.preco(b, paid)}): «${d2 && (d2.ok ? d2.sub : d2.why)}»`); }
      } else said.push(`o taverneiro não vende agora: ${pc.why}`);
    }
    ok('a9 os jogos da casa na barra e na lista: de onde vem o jogo e o aluguel, a espera por um livre, a compra do seu', !bad.length, `${bad.length ? 'FALHOU: ' + bad.join(' | ') + ' — ' : ''}${said.join('; ')}`);
    bad.length = 0; watch(); ok('a9 o verificador limpo', !bad.length, bad.join(' | ') || 'nada');
  }
}
// ---------------- a10 the bar of a place that is no tavern, end to end (F14) ----------------
// (the proof registers what a building's wave and a trade that comes later would, each as from its own file: the place — a provider whose
// find is the place the body holds in that building —, its verbs in the registry, its bar («Trono»); and the trade's verb with its slot on
// that bar and its figure. The body sits there by the verb «lugar», as the player does)
const usable = q => I.PURE.has(q.use) || !!I.useRuleOf(q.use);
function placeFor() {
  const order = t => (/palac/.test(t) ? 0 : t === 'temple' ? 1 : 2);
  for (const b of [...S().buildings.values()].filter(q => q.built && q.type !== 'taverna' && In.has(q)).sort((a, c) => order(a.type) - order(c.type) || a.id - c.id)) {
    const p = G.Space.planNow(b); if (!p || !p.entrance) continue;
    const seats = In.freeNear(b, p.entryLv || 0, p.entrance.x, p.entrance.z, 60, ['sentar', 'comer', 'rezar', 'aquecer', 'ler']).filter(q => usable(q) && In.walkIn(b, q) < Infinity);
    const v = seats.length ? bodyFor(b, null) : null; if (v) return { b, seat: seats[0], v };
  }
  return null;
}
if (on('a10')) {
  fresh(); bad.length = 0; const P0 = placeFor();
  if (!P0) ok('a10 a barra de um lugar que não é a taverna', false, 'nenhum prédio com um lugar livre que o verbo «lugar» ofereça e alguém para o deus viver');
  else {
    const fid = G.Village.facOfSet(P0.b.set); const coin = G.Eco.coinage(fid); const PL = { b: P0.b.id, olhou: 0, arauto: 0 };
    // (the building's wave: the place, its verbs, its bar)
    I.add({ id: 'prova-trono', prio: 4.45, reach: 2.4,
      find(ctx) { const u = Po.useOf(); if (!PL.b || !u || u.b !== PL.b || ctx.v.inside !== PL.b) return []; return [{ u, X: ctx.X + Math.cos(ctx.yaw) * 0.45, Z: ctx.Z + Math.sin(ctx.yaw) * 0.45, pref: 2 }]; },
      label: () => 'Olhar o salão', can: () => ({ ok: true }), run: () => { PL.olhou++; return { ok: true, msg: 'Você olha o salão.' }; } });
    I.verb('prova-trono', { id: 'pt-oferta', k: 'outra', ord: 1, label: () => (coin ? 'Deixar uma oferta (0,2)' : ''), can: ctx => (G.Eco.purse(ctx.v) + 1e-6 >= 0.2 ? { ok: true } : { ok: false, why: 'Você não tem com que deixar uma oferta.' }),
      run: () => { const ask = Po.apply(w => (G.Eco.spend(w, 0.2, 'f:' + fid, 'prova-oferta') ? { ok: true, msg: 'Você deixa a oferta.' } : { ok: false, why: 'Falta dinheiro.' })); return { ok: true, ask, get msg() { return (ask.res && (ask.res.msg || ask.res.why)) || '…'; } }; } });
    I.verb('prova-trono', { id: 'pt-decreto', k: 'outra', ord: 2, label: 'Ler o decreto', can: () => ({ ok: false, why: 'Não há decreto nenhum para ler.' }), run: () => ({ ok: false, msg: 'Não há decreto nenhum para ler.' }) });
    const barOk = U.bar('prova-trono', ['', { id: 'pt-oferta', nome: 'Oferta', icon: 'gorjeta', dft: 'Deixar uma oferta' }, { id: 'pt-decreto', nome: 'Decreto', icon: 'tabuletas', dft: 'Ler o decreto' }],
      { rotulo: 'Trono', icon: 'mesa', levantar: 'Levantar do trono', alvo: () => 'O trono', alvoSub: () => 'onde você está', dica: { chave: 'gotaf-dica-prova-trono', html: () => '<b>No trono</b><p>A barra do lugar.</p>' } });
    // (a trade that comes later, from its own file: its verb in the registry, its slot on the place's bar — between the offering and the
    // decree — and its figure)
    const ARAUTO = '<path d="M4 10h3l7-4v12l-7-4H4z"/><path d="M17.5 9c1.4 1.2 1.4 4.8 0 6"/>'; const icOk = U.icone('arauto', ARAUTO);
    I.verb('prova-trono', { id: 'pt-arauto', k: 'outra', ord: 3, label: 'Chamar o arauto', can: () => ({ ok: true }), run: () => { PL.arauto++; return { ok: true, msg: 'O arauto vem.' }; } });
    const slOk = U.slot('prova-trono', { id: 'pt-arauto', nome: 'Arauto', icon: 'arauto', dft: 'Chamar o arauto', ord: 1.5 });
    // (another file bringing a slot of a verb the bar already has: it stays the bar's, at its own place — the verb shown once)
    const dupOk = U.slot('prova-trono', { id: 'pt-decreto', nome: 'Outro decreto', icon: 'mais', ord: 0.5 });
    // (what is no bar, no slot and no new figure is refused — said in the console, the words kept here; this file's own figure never replaced)
    const w0 = console.warn; const warned = []; console.warn = (...a) => warned.push(a.join(' ')); let refused;
    // (and a figure under a name already another's — this file's own, or one another file brought with other strokes —: refused; the same
    // strokes again are the same figure)
    try { refused = [U.bar('', []), U.bar('x', 'nada'), U.slot('prova-trono', { nome: 'sem id' }), U.icone('mesa', '<path d="M0 0"/>'), U.icone('arauto', '<path d="M1 1"/>')]; } finally { console.warn = w0; }
    const again = U.icone('arauto', ARAUTO);
    const { b } = P0; const sitAt = w => { const bb = S().buildings.get(PL.b); const pl = In.freeFor(bb, P0.seat.it.id, P0.seat.q, P0.seat.x, P0.seat.z) || P0.seat; return seatIn(bb, w, Object.assign({}, P0.seat, pl)); };
    const r = sitAt(P0.v); const v = Po.body();
    if (!r.ok) ok('a10 o corpo senta no lugar', false, r.why || 'não sentou');
    else {
      for (let k = 0; k < 12; k++) frame();
      const m = U.mesa(); const ids = m ? m.items.map(q => q.id) : []; const want = ['', coin ? 'pt-oferta' : null, 'pt-arauto', 'pt-decreto', 'levantar'].filter(x => x !== null);
      const keyOk = !!m && m.items.every((q, i) => q.key === (q.id === 'levantar' ? G.Input3D.label('pular') : i < 5 ? G.Input3D.label('rapido' + (i + 1)) : G.Input3D.label('acao' + (i + 1))));
      const dec = m ? m.items.find(q => q.id === 'pt-decreto') : null; const how = U.how('pt-arauto'); const i3 = slot('pt-arauto');
      ok('a10 a barra de um lugar que não é a taverna: registrada pela onda (bar), um lugar trazido por um ofício de outro arquivo (slot, entre os da barra pelo ord) com a sua figura, as teclas pela ordem, o apagado com o porquê; o que não é barra, lugar nem figura nova recusado (a figura com o nome de outra também), e o lugar de um verbo que a barra já tem fica o dela',
        barOk && slOk && icOk && dupOk && again && refused.every(x => x === false) && warned.length === refused.length && !!m && m.prov === 'prova-trono' && m.rotulo === 'Trono' && JSON.stringify(ids) === JSON.stringify(want) && keyOk && !!dec && dec.nome === 'Decreto' && !dec.ok && dec.why === 'Não há decreto nenhum para ler.' && how === `a tecla ${G.Input3D.label('rapido' + (i3 + 1))} («Arauto», na barra do trono)` && U.barras().some(x => x.prov === 'taverna'),
        `${G.Village.buildName(b)} #${b.id} (${b.type}), o lugar «${P0.seat.use}»: ${m ? `«${m.rotulo}» — ${m.items.map(q => `[${q.key}] ${q.nome}${q.ok ? '' : ` — «${q.why}»`}`).join(' · ')}` : 'SEM BARRA'}; «${how}»; recusados ${refused.filter(x => x === false).length} de ${refused.length} (${warned.length} ditos no console); a mesma figura de novo ${again ? 'aceita' : 'RECUSADA'}`);
      // (each slot reaches the world by the verb's own door — the offering by the ledger, from the body's coins to the people's treasury, once;
      // the trade's herald; the place's E —; the greyed one says why, and does nothing)
      const t0 = S().clock; const n0 = PL.olhou, a0 = PL.arauto; const ofer = () => seen.filter(e => e.t >= t0 && e.c === 'prova-oferta');
      if (coin) { U.faz(slot('pt-oferta')); until(() => ofer().length > 0, 3); }
      U.faz(slot('pt-arauto')); for (let k = 0; k < 4; k++) frame(); U.faz(slot('')); for (let k = 0; k < 6; k++) frame();
      const said0 = toasts.length; U.faz(slot('pt-decreto')); for (let k = 0; k < 6; k++) frame(); const denied = toasts.slice(said0).some(t => /decreto/.test(t));
      const paid = ofer();
      ok('a10 cada lugar chega ao mundo pela porta do verbo: a oferta pelo livro (das moedas do corpo ao tesouro do povo, no passo do mundo, uma vez), o arauto do ofício, o E do lugar; o apagado diz por quê e não faz nada',
        (!coin || (paid.length === 1 && paid[0].from === G.Eco.coinRef(v) && paid[0].to === 'f:' + fid && Math.abs(paid[0].n - 0.2) < 1e-9)) && PL.arauto === a0 + 1 && PL.olhou === n0 + 1 && denied && ofer().length === (coin ? 1 : 0),
        `${coin ? `a oferta: ${paid.map(e => `${e.from} → ${e.to}, ${e.n} (${e.c})`).join('; ') || 'NADA NO LIVRO'}` : 'o povo não usa moeda'}; o arauto ${PL.arauto - a0}×; o E ${PL.olhou - n0}×; o decreto: «${toasts.slice(said0).join(' | ')}»`);
      // (the place's list — the key Y, the «Ações» of the fingers —: the throne by its bar's word, every verb with its words, the greyed one
      // with why, getting up at the end)
      const L = U.lista(I.here('prova-trono')); const rows = L ? L.verbs : [];
      ok('a10 a lista do lugar: o alvo pelo nome que a barra dá, cada verbo com as suas palavras e a figura do seu lugar, o apagado com o porquê, levantar no fim',
        !!L && L.nome === 'O trono' && L.sub === 'onde você está' && rows.length >= 4 && rows[rows.length - 1].id === 'levantar' && rows[rows.length - 1].label === 'Levantar do trono' && rows.some(q => q.id === 'pt-decreto' && !q.ok && /decreto/.test(q.why) && q.icon === 'tabuletas') && rows.some(q => q.id === 'pt-arauto' && q.ok && q.icon === 'arauto'),
        L ? `«${L.nome}» (${L.sub}): ${rows.map(q => `${q.label}${q.ok ? '' : ` — ${q.why}`} [${q.icon}]`).join(' | ')}` : 'sem lista');
      // (getting up: the jump of the feet — the place let go by the world, the bar gone)
      U.faz(slot('levantar')); for (let k = 0; k < 40; k++) frame();
      ok('a10 levantar pela barra: o corpo se levanta, o mundo solta o lugar, a barra sai', !G.Avatar.seated() && !Po.useOf() && !U.mesa(), `sentado ${G.Avatar.seated()}, o lugar ${Po.useOf() ? 'ainda seu' : 'solto'}, a barra ${U.mesa() ? 'ainda lá' : 'fora'}`);
      // (a module whose bar's question breaks: that module's error — G.modErr, said in the console —, and the screen goes on: on one's feet no
      // bar, seated on the throne its bar. The fault the proof's own, caught here and wiped after: the broken bar made harmless again)
      { const e0 = console.error; const errs = []; let m0 = 'x', m1 = 'x', thrown = '';
        console.error = (...a) => errs.push(a.map(String).join(' ').slice(0, 120));
        try { U.bar('prova-quebra', [''], { rotulo: 'Quebra', quando: () => { throw new Error('a pergunta quebrou'); } }); try { m0 = U.mesa(); } catch (e) { thrown = e.message; }
          sitAt(Po.body() || P0.v); for (let k = 0; k < 8; k++) frame(); try { m1 = U.mesa(); } catch (e) { thrown = thrown || e.message; } }
        finally { console.error = e0; }
        const n = G.modErr['barra:prova-quebra'] || 0; U.bar('prova-quebra', [''], { rotulo: 'Quebra', quando: () => null }); delete G.modErr['barra:prova-quebra'];
        ok('a10 a pergunta de uma barra que quebra é erro do módulo dela (G.modErr, dito no console), e a tela segue: de pé nenhuma barra, sentado no trono a dele',
          !thrown && m0 === null && !!m1 && m1.prov === 'prova-trono' && n > 0 && errs.length > 0, `de pé: ${thrown ? 'A TELA QUEBROU: ' + thrown : m0 === null ? 'nenhuma barra' : 'UMA BARRA'}; sentado no trono: ${m1 && m1.prov ? `a barra «${m1.rotulo}»` : 'SEM BARRA'}; o erro do módulo ${n}× (${errs.length} linha(s) no console)`);
        U.faz(slot('levantar')); for (let k = 0; k < 40; k++) frame(); }
      // (the bad cases: a save with the bar up; the god's hand takes the body out; the body dies at the place; the building falls with a
      // body at it — the bar follows the world, nothing breaks)
      const bad10 = [];
      { const r2 = sitAt(Po.body() || P0.v); for (let k = 0; k < 8; k++) frame(); const before = U.mesa();
        G.Save.apply(JSON.parse(G.Save.serialize())); G.Avatar.attach(Po.body(), 0); for (let k = 0; k < 8; k++) frame(); const after = U.mesa(); const held = !!(Po.useOf() && Po.useOf().b === PL.b);
        if (!r2.ok || !before || (held ? !after || after.items.map(q => q.id).join() !== before.items.map(q => q.id).join() : !!after)) bad10.push(`o save: antes ${before ? 'a barra' : 'NADA'}, depois ${after ? 'a barra' : 'nada'} (o lugar ${held ? 'seu' : 'solto'})`); else bad10.push(`o save: a barra ${held ? 'volta com o lugar' : 'sai com o lugar'}`); }
      { const w = Po.body(); const bb = S().buildings.get(PL.b); god(() => { const d = G.Vg.door(bb); w.x = d[0]; w.y = d[1]; w.inside = 0; }); for (let k = 0; k < 12; k++) frame(); const m2 = U.mesa();
        if (m2 || Po.useOf()) bad10.push(`a mão do deus: a barra ${m2 ? 'AINDA LÁ' : 'fora'}, o lugar ${Po.useOf() ? 'AINDA SEU' : 'solto'}`); else bad10.push('a mão do deus: a barra sai'); }
      { const r3 = sitAt(Po.body()); for (let k = 0; k < 8; k++) frame(); const up = !!U.mesa(); god(() => G.Village.kill(Po.body(), 'teste', true)); for (let k = 0; k < 12; k++) frame();
        if (!r3.ok || !up || Po.body() || U.mesa()) bad10.push(`a morte: sentado ${r3.ok}, a barra antes ${up}, depois ${U.mesa() ? 'AINDA LÁ' : 'fora'}`); else bad10.push('a morte no lugar: a barra sai'); }
      { const bb = S().buildings.get(PL.b); const w = bodyFor(bb, null); const r4 = w ? sitAt(w) : { why: 'ninguém' }; for (let k = 0; k < 8; k++) frame(); const up = !!U.mesa(); god(() => G.Village.damageBuilding(bb, 1e9, 'deus')); for (let k = 0; k < 20; k++) frame();
        if (!r4.ok || !up || U.mesa()) bad10.push(`o prédio cai: sentado ${!!r4.ok}, a barra antes ${up}, depois ${U.mesa() ? 'AINDA LÁ' : 'fora'}`); else bad10.push('o prédio cai: a barra sai'); }
      ok('a10 os casos ruins: o save com a barra de pé, a mão do deus, o corpo que morre no lugar, o prédio que cai — a barra segue o mundo, nada quebra', bad10.length === 4 && bad10.every(s => !/AINDA|NADA|false/.test(s)) && M.limpo(), bad10.join('; '));
    }
    PL.b = 0; I.list = I.list.filter(p => p.id !== 'prova-trono'); if (Po.body()) god(() => Po.release('teste'));
    watch(); ok('a10 o verificador limpo', !bad.length, bad.join(' | ') || 'nada');
  }
}
// ---------------- a6 the errors ----------------
{ const e = M.erros(); ok('a6 nenhum erro de módulo nem do console', !Object.keys(e.mod || {}).length && !e.console.length, JSON.stringify(e).slice(0, 300)); }
console.log(`(${(clock() - c0).toFixed(0)} s de máquina)`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'acoes: PASSOU');
process.exit(fails.length ? 1 : 0);
// ---------------- igual: the table's bar the same as before (F14, D-1030) ----------------
// (the same hand — RETRATO=1 — over the game here and over the game of the folder given, each in its own process: the bar, the table's list,
// a person's, the dice's word, the round and getting up, letter by letter)
function igual(baseDir) {
  const cp = require('child_process'), fs = require('fs');
  const here = path.join(__dirname, '..'); const there = baseDir ? path.resolve(baseDir) : null;
  if (!there || !fs.existsSync(path.join(there, 'index.html'))) { console.log('FALHOU | acoes igual | dê a pasta do jogo de antes: node qa/acoes.js igual PASTA'); process.exit(1); }
  const run = root => { const s = cp.execFileSync(process.execPath, [__filename], { env: Object.assign({}, process.env, { RETRATO: '1', RAIZ: root, ONLY: 'retrato' }), maxBuffer: 1 << 28 }).toString(); const m = /\nRETRATO (.*)\n/.exec(s); return m ? JSON.parse(m[1]) : null; };
  const a = run(here), b = run(there); const noMeta = x => JSON.stringify(Object.assign({}, x, { meta: 0 })); const A = noMeta(a), B = noMeta(b);
  // (where they part, when they do: the first key that differs, each side's)
  const diff = (x, y, at) => { if (JSON.stringify(x) === JSON.stringify(y)) return ''; if (x && y && typeof x === 'object' && typeof y === 'object') { for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) { const d = diff(x[k], y[k], at + '.' + k); if (d) return d; } } return `${at}: aqui ${JSON.stringify(x).slice(0, 160)} — antes ${JSON.stringify(y).slice(0, 160)}`; };
  // (the two sides ran their own games: here the bars' registry, there — a copy of before F14 — none)
  const two = !!a && !!b && a.meta.raiz !== b.meta.raiz;
  const same = !!a && !!b && a.sat && two && A === B;
  console.log(`${same ? 'PASSOU' : 'FALHOU'} | acoes igual a «Mesa» da taverna igual à de antes: a barra, a lista da mesa e a de uma pessoa, a palavra dos dados, a rodada e levantar, letra por letra | ${!a || !b ? 'um dos dois não deu o retrato' : !a.sat ? 'o corpo não sentou: ' + a.why : same ? `${a.mesa.items.length} lugares (${a.mesa.items.map(q => q.nome).join(', ')}); a lista da mesa com ${a.listaMesa ? a.listaMesa.verbs.length : 0} linhas; a de ${a.pessoa ? a.pessoa.nome : '—'} com ${a.pessoa ? a.pessoa.verbs.length : 0}; «${a.how}»` : diff(Object.assign({}, a, { meta: 0 }), Object.assign({}, b, { meta: 0 }), 'retrato')}${a && b ? ` (aqui ${a.meta.registro ? 'com' : 'sem'} o registro das barras; lá ${b.meta.registro ? 'com' : 'sem'})` : ''}`);
  process.exit(same ? 0 : 1);
}
