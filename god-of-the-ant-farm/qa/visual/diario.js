// diario: o Diário de Vida (§39; D-061) — num navegador, no mundo pronto «metropole»:
//   bash qa/navegador.sh node qa/visual/diario.js [PASTA_DO_JOGO] [SAIDA]
// The page of a life's diary (js/diario-ui.js), read from the world's own record of it (G.Act.diary: only what the person
// knows), over the body's eyes and in the god's view. Two families of a town of coin that need a house: one with the coins for
// it, lived first; one saving for it, lived after. The proofs:
//   1. the panel over the body's eyes: its key (J) opens and closes it, the HUD's button and the self card's open it; each line
//      of it says where it came from and the day; only the kinds of the diary the world has lines of (SAIDA/diario-antes.png)
//   2. the body accepts a purchase — a house for the family, by the house's own offer at the people's store, the act of the
//      hands done by the world in its step —: its line in the diary, from the house, today (SAIDA/diario-compra.png)
//   3. the page only reads: the world stopped (the menu over the body), frames drawn with the page open and read again — the
//      world's fingerprint (QA.canon), its chance and its clock the same
//   4. the other family's body: its goal of a house, with the button to let it go; let go by the body's hands — asked, and
//      done by the world in its next step (G.Possess.apply → G.Casa.giveUp), not by the page —: the goal gone, the saving
//      stopped, the note with the day in the diary of each grown one of the family (SAIDA/diario-deixado.png)
//   5. saved and loaded with the body lived: the goal still let go, the note there, the saving still stopped
//   6. the three days of D-061: the god's view back, the town's day (G.Casa.day) and the family's own decision (G.Casa.order)
//      leave the family unsaving those days; the fourth day it saves again and its goal comes back — mind changed again
//   7. the god's view: the same page of the person, read only — no button to let anything go; the god's pause and the page
//      drawn change nothing in the world (SAIDA/diario-deus.png)
//   8. no page error, no module error, and the checker clean of the house's rules (D-061 among them)
const path = require('path'), fs = require('fs'), os = require('os');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..')), OUT = path.resolve(process.argv[3] || path.join(os.tmpdir(), 'diario'));
fs.mkdirSync(OUT, { recursive: true });
const { open } = require('./vistas.js');
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | diario ${name} | ${info}`); if (!c) fails.push(name); };
(async () => {
  const t0 = Date.now();
  const { browser, page, errs } = await open(ROOT, { worlds: ['metropole'] }); // (qa.js brings the house's rules with it: junta-inv)
  const shot = async name => { try { await page.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); } catch (e) { console.log(`(foto ${name} não saiu: ${e.message.slice(0, 80)})`); } };
  const frames = n => page.evaluate(n => window.__VIS.f(n), n);
  try {
    // ------------------------------ the two families ------------------------------
    const s = await page.evaluate(Q => {
      const V = window.__VIS; G.Realm.setQuality(Q);
      G.Save.apply(JSON.parse(G.Ready.data.metropole)); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
      const S = G.S, K = G.Casa, E = G.Eco; const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
      god(() => { S.time = 0.3; if (S.weather) S.weather.storm = 0; });
      const coin = id => { const t = S.settlements.get(id); return !!t && E.coinage(t.fac); };
      // (the day of the houses of every town of coin, first — as the world runs it each day: each house gets its owner, and the
      // families in need decide —; the families of the cases are chosen after it, their need what the world's next days keep)
      for (const t of [...S.settlements.values()].filter(t => coin(t.id)).sort((a, c) => a.id - c.id)) god(() => K.day(t));
      const free = o => o.age >= 18 && o.age < 55 && !o.inside && !o.sleeping && !o.aboard && !o.captive && !o.jail && G.Possess.can(o).ok;
      const L = [...S.villagers.values()].filter(o => coin(o.set) && free(o) && K.need(o) && !K.waiting(o) && !K.gaveUp(o) && o.home && S.buildings.get(o.home)).sort((a, c) => a.id - c.id);
      const A = L.find(o => K.can(o).ok);
      const fam = o => K.family(o).map(m => m.id);
      const B = L.find(o => A && o.home !== A.home && !fam(A).includes(o.id) && o.set === A.set && /Falta dinheiro/.test(K.can(o).why || '')) || L.find(o => A && o.home !== A.home && !fam(A).includes(o.id) && /Falta dinheiro/.test(K.can(o).why || ''));
      if (!A || !B) return { err: `famílias que precisam de casa numa cidade de moeda: ${L.length}; com com que pagar: ${A ? A.name : 'nenhuma'}; juntando: ${B ? B.name : 'nenhuma'}` };
      // (the family short of coin decides now what any family of its town would — to save: the town's own decision, by the god's hand)
      const rb = god(() => K.order(B)); const hb = S.buildings.get(B.home);
      // (what the checker said of the activities before the cases: only what comes after counts)
      window.__D = { A: A.id, B: B.id, setA: A.set, setB: B.set, hb: hb.id, bad0: QA.check().filter(x => x.sys === 'act').map(x => x.msg) };
      return { A: `${A.name} #${A.id} (${K.need(A)}, ${Math.floor(K.savings(A))} moedas)`, B: `${B.name} #${B.id} (${K.need(B)}, ${Math.floor(K.savings(B))} moedas)`, town: (S.settlements.get(A.set) || {}).name, townB: (S.settlements.get(B.set) || {}).name,
        saving: !!(hb.poupa && fam(B).includes(hb.poupa.by)), rb: rb.why || (rb.ok ? 'ok' : '') };
    }, process.env.Q || 'media');
    if (s.err) { ok('o cenário', false, s.err); throw new Error(s.err); }
    console.log(`(${s.town}: com com que pagar ${s.A}; ${s.townB}: juntando ${s.B} — ${s.saving ? 'a casa junta' : 'a casa NÃO junta: ' + s.rb})`);
    // (the lines of the panel as drawn — DOM —, and as the page made them: the text, the origin and the day of each)
    const panel = () => page.evaluate(() => {
      const c = document.querySelector('#inc-card'); const on = !!c && !c.classList.contains('hidden') && c.classList.contains('diario');
      const rows = on ? [...c.querySelectorAll('.dl-e')].map(e => ({ sec: e.parentNode.dataset.k, txt: e.querySelector('.dl-t').textContent, meta: e.querySelector('.dl-o').textContent.replace('Deixar de lado', '').trim(), drop: !!e.querySelector('button[data-c="drop"]') })) : [];
      return { on, rows, secs: on ? [...c.querySelectorAll('.dl-sec')].map(e => e.dataset.k) : [], head: on && c.querySelector('.dl-head') ? c.querySelector('.dl-head').textContent : '' };
    });

    // ------------------------------ 1. the panel over the body's eyes ------------------------------
    await page.evaluate(() => { const V = window.__VIS; G.Modes.enter(G.S.villagers.get(window.__D.A)); V.until(() => G.Modes.state === 'INC', 300, 100); V.f(6); });
    const keyOpen = async k => { await page.keyboard.press(k); await frames(1); return (await panel()).on; };
    const j1 = await keyOpen('j'); const j2 = await keyOpen('j');
    await page.click('#inc-hud .ih-diary'); await frames(1); const j3 = (await panel()).on;
    await page.keyboard.press('j'); await frames(1); await page.keyboard.press('Tab'); await frames(1);
    const selfBtn = await page.$('#inc-card [data-c="diary"]'); if (selfBtn) await selfBtn.click(); await frames(1); const j4 = (await panel()).on;
    const p1 = await panel();
    const days = p1.rows.filter(r => /(hoje|ontem|dia \d+)/.test(r.meta)).length, origins = p1.rows.filter(r => r.meta && !/^(hoje|ontem|dia \d+)$/.test(r.meta)).length;
    const needA = p1.rows.find(r => r.sec === 'goals' && /a casa nova/.test(r.meta));
    // (a goal never reads as nonsense: «juntadas 52 de 18 moedas» for a family that has enough already, L-218)
    const over = p1.rows.filter(r => { const m = /juntadas (\d+) de (\d+) moedas/.exec(r.txt); return !!m && +m[1] >= +m[2]; });
    await shot('diario-antes');
    ok('1. o painel do diário sobre os olhos do corpo: a tecla J abre e fecha, o botão do HUD e o da ficha abrem; cada linha com a origem e o dia; só as seções que o mundo tem', j1 && !j2 && j3 && j4 && p1.rows.length > 0 && origins === p1.rows.length && days === p1.rows.length && !!needA && !over.length && p1.secs.every(k => p1.rows.some(r => r.sec === k)),
      `J ${j1 ? 'abriu' : 'NÃO abriu'}, J de novo ${j2 ? 'NÃO fechou' : 'fechou'}, o botão ${j3 ? 'abriu' : 'NÃO abriu'}, a ficha ${j4 ? 'abriu' : 'NÃO abriu'}; ${p1.rows.length} linhas em ${p1.secs.join(', ')}: ${origins} com origem, ${days} com o dia; o objetivo da casa: ${needA ? `«${needA.txt}» (${needA.meta})` : 'NENHUM'}${over.length ? ` — uma conta sem sentido: «${over[0].txt}»` : ''}`);

    // ------------------------------ 2. the body accepts a purchase: a house for the family ------------------------------
    await page.keyboard.press('j'); await frames(1);
    const buy = await page.evaluate(() => {
      const D0 = window.__D, S = G.S, K = G.Casa, TL = G.Space.TILE; const v = S.villagers.get(D0.A);
      const st = G.Village.nearestDropoff(v.x, v.y, v.set); if (!st) return { err: 'o povo sem armazém' };
      // (before the store, on ground the feet stand on: its front tile, or the nearest open point by it)
      const [fx, fy] = G.Village.frontTile(st);
      const at = (() => { for (let r = 0; r <= 1.5; r += 0.25) for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) { const x = fx + dx * r, y = fy + dy * r; if (G.W.walkableXY(x, y)) return [x, y]; } return null; })();
      if (!at || !G.Avatar.place(at[0], at[1])) return { err: `nenhum chão diante do armazém ${st.type}#${st.id} (${fx},${fy})` };
      window.__VIS.warm(1); window.__VIS.f(4);
      const o = G.Act.offers(v, v.x, v.y, 2.6 / TL + 2).find(q => q.def === 'casa' && q.act === 'encomendar');
      if (!o) return { err: 'nenhuma oferta da casa diante do armazém: ' + G.Act.offers(v, v.x, v.y, 2.6 / TL + 2).map(q => q.def + '.' + q.act).join(', ') };
      if (o.ok === false) return { err: 'a oferta da casa recusada: ' + o.why };
      // (facing the place of the offer, as a player turns to it)
      { const b = G.Avatar.state(); if (b) b.yaw = Math.atan2(o.at[1] * TL - b.Z, o.at[0] * TL - b.X); }
      const n0 = (v.diary || []).length, d0 = S.day; const r = G.Interact.run({ id: 'atividade', t: { o, X: o.at[0] * TL, Z: o.at[1] * TL } });
      if (!r || !r.ok) return { err: `a oferta da casa não foi feita: ${r ? r.msg || '' : 'nenhuma resposta'}` };
      const k = window.__VIS.until(() => (v.diary || []).length > n0 && v.diary[v.diary.length - 1].src === 'casa', 400);
      const e = (v.diary || [])[v.diary.length - 1];
      return { label: o.label, run: !!(r && r.ok), why: r && !r.ok ? r.msg : '', k, note: e && e.src === 'casa' ? e.txt : null, day: e ? e.day : null, d0, waiting: !!K.waiting(v), need: K.need(v) };
    });
    if (buy.err) ok('2. a compra', false, buy.err);
    else {
      await page.keyboard.press('j'); await frames(1); const p2 = await panel();
      const line = p2.rows.find(r => r.txt === buy.note);
      await shot('diario-compra');
      ok('2. o corpo aceita uma compra (pagar uma casa para a família, pela oferta da casa no armazém): a linha dela no diário, da casa, de hoje', buy.run && buy.k >= 0 && !!line && /a casa/.test(line.meta) && /hoje/.test(line.meta),
        `«${buy.label}»${buy.run ? '' : ' RECUSADA: ' + buy.why} (${buy.k} quadros): no diário «${line ? line.txt : buy.note || '—'}» (${line ? line.meta : 'não aparece no painel'}); depois: ${buy.waiting ? 'a casa sendo levantada' : buy.need ? 'ainda precisa de casa' : 'a família tem casa'}`);
    }

    // ------------------------------ 3. the page only reads: the world stopped, the page drawn ------------------------------
    const fpOf = () => page.evaluate(() => { const s = JSON.stringify(QA.canon()); let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return { h: h >>> 0, rng: JSON.stringify(G.S.rng), clock: G.S.clock, led: G.Depot.ledger().length, q: G.Possess.pending() }; });
    await page.evaluate(() => { G.Modes.menu(true); window.__VIS.f(1); });
    const w0 = await fpOf();
    const drawn = await page.evaluate(() => { let n = 0; const v = G.Possess.body(); for (let k = 0; k < 60; k++) { window.__VIS.f(1); if (k % 10 === 0) n += G.DiarioUI.page(v, { mine: true }).lines.length; } return n; });
    const w1 = await fpOf();
    ok('3. o diário só lê: o mundo parado (o menu sobre o corpo), 60 quadros com a página aberta e lida de novo — a impressão do mundo, o acaso, o relógio e o livro iguais', w0.h === w1.h && w0.rng === w1.rng && w0.clock === w1.clock && w0.led === w1.led && drawn > 0,
      `${drawn} linhas desenhadas; impressão ${w0.h === w1.h ? 'igual' : 'MUDOU'}, acaso ${w0.rng === w1.rng ? 'igual' : 'MUDOU'}, relógio ${w0.clock === w1.clock ? 'parado' : 'andou'}, livro ${w0.led === w1.led ? 'igual' : 'MUDOU'}`);
    await page.evaluate(() => { G.Modes.menu(false); window.__VIS.f(1); });

    // ------------------------------ 4. the other family's body lets its goal go ------------------------------
    await page.evaluate(() => { const V = window.__VIS; G.IncUI.closeAll(); G.Modes.setPanel(null); G.Modes.switchTo(G.S.villagers.get(window.__D.B)); V.until(() => (G.Possess.body() || {}).id === window.__D.B, 200, 50); V.f(20); });
    await page.keyboard.press('j'); await frames(1);
    const p4 = await panel(); const goal = p4.rows.find(r => r.sec === 'goals' && r.drop);
    await shot('diario-b-antes');
    const hState = () => page.evaluate(() => { const D0 = window.__D, S = G.S, K = G.Casa; const v = S.villagers.get(D0.B), h = S.buildings.get(D0.hb); const fam = v ? K.family(v) : [];
      const notes = fam.filter(m => m.age >= 16).map(m => ({ id: m.id, n: (m.diary || []).filter(e => e.src === 'casa' && e.dropped !== undefined).map(e => e.dropped) }));
      return { day: S.day, saving: !!(h && h.poupa && fam.some(m => m.id === h.poupa.by)), gaveUp: v ? K.gaveUp(v) : 0, notes, grown: notes.length, goal: v ? (G.Act.diary(v).goals || []).filter(g => g.src === 'casa-nova').map(g => g.txt) : [], q: G.Possess.pending() }; });
    const h0 = await hState();
    let asked = null, h1 = null, p5 = null;
    const btn = await page.$('#inc-card .dl-e button[data-c="drop"]');
    if (btn) { await btn.click(); asked = await hState(); await frames(3); await page.evaluate(() => window.__VIS.until(() => !document.querySelector('#inc-card button[data-c="drop"][disabled]'), 120)); h1 = await hState(); await frames(2); p5 = await panel(); }
    const gone = p5 && !p5.rows.some(r => r.sec === 'goals' && /a casa nova/.test(r.meta));
    const memo = p5 && p5.rows.find(r => r.sec === 'memories' && /Deixamos a casa nova para depois/.test(r.txt));
    await shot('diario-deixado');
    ok('4. o corpo deixa o objetivo da casa nova de lado: pedido pelas mãos do corpo e feito pelo mundo no passo seguinte — o objetivo sai, a casa para de juntar, a nota com o dia no diário de cada adulto da família', !!goal && h0.saving && !!asked && asked.saving && asked.q > 0 && !!h1 && !h1.saving && !!h1.gaveUp && h1.notes.length >= 1 && h1.notes.every(m => m.n.includes(h1.day)) && gone && !!memo,
      `o objetivo: ${goal ? `«${goal.txt}» (${goal.meta})` : 'SEM botão de deixar de lado'}; antes: ${h0.saving ? 'juntando' : 'NÃO juntava'}; logo depois do clique: ${asked ? `${asked.q} pedido na fila, ${asked.saving ? 'ainda juntando (o mundo não fez ainda)' : 'JÁ MUDOU (a tela escreveu?)'}` : '—'}; no passo seguinte: ${h1 ? `${h1.saving ? 'AINDA JUNTANDO' : 'parou de juntar'}, até o dia ${h1.gaveUp}; notas em ${h1.notes.map(m => '#' + m.id + ' ' + m.n.join('/')).join(', ')}` : '—'}; no painel: ${gone ? 'o objetivo saiu' : 'o objetivo AINDA LÁ'}, ${memo ? `«${memo.txt}» (${memo.meta})` : 'SEM a nota'}`);

    // ------------------------------ 5. saved and loaded with the body lived ------------------------------
    const sl = await page.evaluate(() => { const V = window.__VIS; const str = G.Save.serialize(); G.Save.apply(JSON.parse(str)); V.until(() => G.Modes.state === 'INC', 300, 100); V.f(6); const b = G.Possess.body(); return { size: str.length, inc: G.Modes.state, body: b ? b.id : 0, same: !!b && b.id === window.__D.B }; });
    await page.keyboard.press('j'); await frames(1);
    const h2 = await hState(); const p6 = await panel();
    ok('5. salvo e carregado com o corpo vivido: o objetivo continua deixado, a nota lá, a casa sem juntar', sl.inc === 'INC' && sl.same && !h2.saving && !!h2.gaveUp && h2.notes.every(m => m.n.length >= 1) && !p6.rows.some(r => r.sec === 'goals' && /a casa nova/.test(r.meta)) && p6.rows.some(r => /Deixamos a casa nova para depois/.test(r.txt)),
      `save de ${Math.round(sl.size / 1024)} KB; de volta ${sl.inc === 'INC' ? 'no corpo' : 'NO MODO ' + sl.inc} (#${sl.body}); ${h2.saving ? 'JUNTANDO' : 'sem juntar'}, até o dia ${h2.gaveUp}; no painel: ${p6.rows.some(r => r.sec === 'goals' && /a casa nova/.test(r.meta)) ? 'o objetivo VOLTOU' : 'sem o objetivo'}, ${p6.rows.some(r => /Deixamos a casa nova para depois/.test(r.txt)) ? 'com a nota' : 'SEM a nota'}`);

    // ------------------------------ 6. the three days of D-061 ------------------------------
    const days3 = await page.evaluate(() => {
      const V = window.__VIS, S = G.S, K = G.Casa, D0 = window.__D; const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
      G.IncUI.closeAll(); G.Modes.setPanel(null); G.Modes.leave('deus'); V.until(() => G.Modes.state === 'GOD', 400, 50);
      const v = S.villagers.get(D0.B), set = S.settlements.get(D0.setB), h = S.buildings.get(D0.hb); const fam = K.family(v);
      const saving = () => !!(h.poupa && fam.some(m => m.id === h.poupa.by));
      const rows = []; const d0 = Math.max(...fam.flatMap(m => (m.diary || []).filter(e => e.src === 'casa' && e.dropped !== undefined).map(e => e.dropped)));
      const next = () => { const d = S.day; god(() => { S.time = Math.max(S.time, 0.9995); }); V.until(() => S.day !== d, 600, 50); V.f(4); };
      while (S.day < d0 + K.DROP_DAYS) { god(() => K.day(set)); const r = god(() => K.order(v)); rows.push({ day: S.day, saving: saving(), why: r.why || (r.ok ? 'decidiu' : ''), goal: (G.Act.diary(v).goals || []).some(g => g.src === 'casa-nova') }); next(); }
      // (the fourth day: the family may think of it again — the need, the goal, and short of coin, the saving)
      const r4 = god(() => K.order(v)); const g4 = (G.Act.diary(v).goals || []).find(g => g.src === 'casa-nova');
      return { d0, rows, day4: S.day, saving4: saving(), why4: r4.why || (r4.ok ? 'decidiu' : ''), need4: K.need(v), goal4: g4 ? g4.txt : null, drop4: !!(g4 && g4.drop), gaveUp4: K.gaveUp(v), waits: Math.max(0, d0 + K.DROP_DAYS - (rows.length ? rows[0].day : S.day)) };
    });
    // (the days of the letting go, from the one after the load to the third: none saving, none with the goal; the fourth, the
    // need thought of again — the goal back, with its button —, unless the family no longer needs a house)
    ok('6. os três dias do D-061: o dia da cidade e a decisão da própria família não voltam a juntar; no quarto dia a família volta a pensar na casa, e o objetivo volta', days3.rows.length >= 1 && days3.rows.length === days3.waits && days3.rows.every(r => !r.saving && !r.goal && /deixou a casa nova para depois/.test(r.why)) && !days3.gaveUp4 && (days3.need4 ? !!days3.goal4 && days3.drop4 : !days3.goal4),
      `deixada no dia ${days3.d0}: ${days3.rows.map(r => `dia ${r.day} ${r.saving ? 'JUNTANDO' : 'sem juntar'}${r.goal ? ', COM o objetivo' : ''} («${r.why}»)`).join('; ')}; dia ${days3.day4}: ${days3.saving4 ? 'junta de novo' : 'não junta'} («${days3.why4}»), o objetivo ${days3.goal4 ? `de volta: «${days3.goal4}»` : 'NÃO voltou'}`);

    // ------------------------------ 7. the god's view: the same page, read only ------------------------------
    const gv = await page.evaluate(() => { const D0 = window.__D; G.UI.setSpeed(0); window.__VIS.f(1); G.UI.select(G.S.villagers.get(D0.B)); window.__VIS.f(2);
      const b = document.querySelector('#inspector [data-act="diary"]'); if (b) b.click(); window.__VIS.f(2);
      const m = document.querySelector('#modal'); const rows = m ? [...m.querySelectorAll('.dl-e')].map(e => ({ txt: e.querySelector('.dl-t').textContent, meta: e.querySelector('.dl-o').textContent })) : [];
      return { button: !!b, open: !!(m && m.querySelector('.dl-page')), rows, drops: m ? m.querySelectorAll('button[data-c="drop"]').length : -1, title: m && m.querySelector('h2') ? m.querySelector('h2').textContent : '' }; });
    const w2 = await fpOf();
    await page.evaluate(() => { for (let k = 0; k < 3; k++) { G.UI.openDiary(window.__D.B); window.__VIS.f(10); } });
    const w3 = await fpOf();
    await shot('diario-deus');
    ok('7. no Modo Deus, a mesma página da pessoa, só leitura (sem botão de deixar de lado); a pausa do deus e a página desenhada não mudam o mundo', gv.button && gv.open && gv.rows.length > 0 && gv.drops === 0 && gv.rows.some(r => /a casa nova/.test(r.meta)) && w2.h === w3.h && w2.rng === w3.rng && w2.clock === w3.clock,
      `«${gv.title}»: ${gv.rows.length} linhas, ${gv.drops} botões de deixar de lado; o objetivo da casa ${gv.rows.some(r => /a casa nova/.test(r.meta)) ? 'lá' : 'NÃO'}; a página aberta 3 vezes com 30 quadros: impressão ${w2.h === w3.h ? 'igual' : 'MUDOU'}, acaso ${w2.rng === w3.rng ? 'igual' : 'MUDOU'}, relógio ${w2.clock === w3.clock ? 'parado' : 'andou'}`);
    await page.evaluate(() => { G.UI.closeModal && G.UI.closeModal(); G.UI.setSpeed(1); window.__VIS.f(1); });

    // ------------------------------ 8. no error; the checker clean of the house's rules ------------------------------
    const q = await page.evaluate(() => { const b0 = new Set(window.__D.bad0); return { mod: JSON.stringify(G.modErr || {}), bad: QA.check().filter(x => x.sev <= 3 && x.sys === 'act' && !b0.has(x.msg)).map(x => `S${x.sev} ${x.msg}`).slice(0, 4) }; });
    ok('8. nenhum erro de página nem de módulo, e o verificador limpo das regras da casa', !errs.length && q.mod === '{}' && !q.bad.length, `${errs.length ? errs.slice(0, 3).join(' · ') : 'sem erro de página'}; módulos ${q.mod}; ${q.bad.length ? q.bad.join(' · ') : 'verificador limpo'}`);
  } catch (e) { ok('a prova', false, e.message); }
  await browser.close();
  console.log(`${fails.length ? 'FALHAS: ' + fails.join(', ') : 'TUDO PASSOU'} (${Math.round((Date.now() - t0) / 1000)} s; fotos em ${OUT})`);
  process.exit(fails.length ? 1 : 0);
})();
