// baloes: the words and the little texts of the world over the body's eyes (L-211) — in a browser, the ready world «metropole»:
//   bash qa/navegador.sh node qa/visual/baloes.js [PASTA_DO_JOGO] [SAIDA]
// The god's view draws over the world the words said (G.Talk: a bubble over the one who speaks, typed out letter by letter) and
// the little texts that rise where something happens (G.FX.floaters: a load put in the store, the coins of a sale); the 3D of
// the Modo Encarnado draws the same lists (incui.js, the bubbles by the god's own hand, Talk.paint), only reading them. At the
// market of a merchant of the town — the first by id; his stall opened by the god's hand where it is not, and held open (the
// merchant fed and at his counter: the god's hand) — someone of the town of another house is lived and haggles there, through
// the stall's own offer (G.Act: the body's offer and the merchant's answer said through G.Talk, as anyone's). The market is
// alive: the merchant may be speaking to someone else before and after — his answer is the line said with the body's offer.
// The proofs:
//   1. before the haggle: no bubble over the body, which has said nothing (photo SAIDA/baloes-antes.png)
//   2. the merchant's answer: a bubble over his head in the 3D — its point above his head on the screen, ink on the words' layer
//      there —, typed out by the world's clock: a few letters first, all of them later; and the body's offer over its own head
//      (SAIDA/baloes-pechincha.png)
//   3. a load put in the store (G.FX.deposit, the activities' own): its little text rises in the 3D (SAIDA/baloes-deposito.png)
//   4. nothing changes in the world: the world paused (the menu), frames drawn with the bubbles and the texts — the world's
//      fingerprint (QA.canon), its chance and the list of words as they were
//   5. the answer over: its bubble gone, no ink where it was but another's words (SAIDA/baloes-depois.png)
//   6. no page error, no module error
const path = require('path'), fs = require('fs'), os = require('os');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..')), OUT = path.resolve(process.argv[3] || path.join(os.tmpdir(), 'baloes'));
fs.mkdirSync(OUT, { recursive: true });
const { open } = require('./vistas.js');
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | baloes ${name} | ${info}`); if (!c) fails.push(name); };
(async () => {
  const t0 = Date.now();
  const { browser, page, errs } = await open(ROOT, { worlds: ['metropole'] });
  const shot = async name => { try { await page.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); } catch (e) { console.log(`(foto ${name} não saiu: ${e.message.slice(0, 80)})`); } };
  try {
    // ------------------------------ the merchant, his stall, the body before it ------------------------------
    const s = await page.evaluate(Q => {
      const V = window.__VIS; G.Realm.setQuality(Q);
      G.Save.apply(JSON.parse(G.Ready.data.metropole)); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
      const S = G.S, D = G.Depot; const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
      god(() => { S.time = 0.3; }); // (market hours)
      const free = o => o.age >= 18 && o.age < 55 && !o.inside && !o.sleeping && !o.aboard && !o.captive && !o.jail;
      const mks = new Map([...S.buildings.values()].filter(b => b.type === 'mercado' && b.built).map(b => [b.id, b]));
      const owner = [...S.villagers.values()].filter(o => o.role === 'mercador' && mks.has(o.job) && G.Eco.homeOf(o) && free(o)).sort((a, c) => a.id - c.id)[0];
      if (!owner) return { err: 'nenhum mercador com emprego num mercado' };
      const mk = mks.get(owner.job); let z = G.Biz.of(owner); if (!z) z = god(() => G.Biz.open(owner, mk)); if (!z) return { err: 'o mercador sem banca' };
      // the body: someone of the town of another house, with empty hands — lived first (the way down into the body takes a moment
      // of the world), then put before the counter
      const home = q => (G.Eco.homeOf(q) || {}).id;
      const v = [...S.villagers.values()].filter(q => q.set === mk.set && free(q) && q.id !== owner.id && home(q) && home(q) !== home(owner) && !(q.carry && q.carry.n > 0) && !G.Biz.of(q) && G.Possess.can(q).ok).sort((a, c) => a.id - c.id)[0];
      if (!v) return { err: 'ninguém de outra casa para viver diante da banca' };
      G.Modes.enter(v); V.until(() => G.Modes.state === 'INC', 300, 100); V.f(4);
      // (the stall with goods — from the people's store where its counter has nothing —, open, its owner behind it, fed and kept
      // there: the god's hand — a merchant's errands, to the store for more, would take him away in the middle)
      god(() => { if (!G.Biz.display(z).length) D.move('f:' + z.fac, 'z:' + z.id, 'food', 6, { code: 'teste', by: owner.id, part: true }); z.open = 1; z.day.open = 1; });
      // (the two at the counter — twice: near the body the market's plan is made, and the counter is then where the plan has it,
      // Biz.spotOf)
      const st = G.Avatar.state(); const TL = G.Space.TILE; let look = 0, at = null;
      const put = () => { at = G.Biz.spots(z); if (!at) return;
        god(() => { G.Vg.endTask(owner); owner.inside = 0; owner.x = at.seller[0]; owner.y = at.seller[1]; owner.path = null; owner.hunger = 5; owner.energy = 95; G.Vg.setTask(owner, { type: 'banca', biz: z.id, pri: 3, st: 1, dur: 60 }); });
        G.Avatar.place(at.buyer[0], at.buyer[1]); look = Math.atan2(at.seller[1] * TL - st.Z, at.seller[0] * TL - st.X); st.yaw = look;
        // (the eye behind the body, a little to one side and up: the merchant seen over his counter, both heads in the picture)
        G.Cam3D.OPT.follow = false; G.Cam3D.yaw = look + 0.3; G.Cam3D.pitch = 0.55; G.Cam3D.dist = 5; G.Cam3D.cur = 5; };
      put(); V.warm(2); V.f(8); put(); V.warm(1); V.f(4); st.yaw = look; G.Cam3D.yaw = look + 0.3; V.f(2);
      if (!at) return { err: 'a banca sem lugar' };
      window.__B = { owner: owner.id, body: v.id, z: z.id, look };
      return { town: (S.settlements.get(mk.set) || {}).name, market: mk.id, stall: z.id, owner: owner.name + ' #' + owner.id, body: v.name + ' #' + v.id, inc: G.Modes.state, at: at.buyer.map(q => +q.toFixed(2)), plan: !!(G.Biz.spotOf && G.Biz.spotOf(mk, z.slot)), goods: G.Biz.display(z).length };
    }, process.env.Q || 'media');
    if (s.err) { ok('o cenário', false, s.err); throw new Error(s.err); }
    console.log(`(${s.town}: o mercado #${s.market}, a banca #${s.stall} de ${s.owner}, ${s.goods} coisas à mostra; o corpo: ${s.body}, diante dela em ${s.at}${s.plan ? ' (o balcão da planta)' : ''}; ${s.inc})`);
    // (the photos: the HUD's panels out of the way, the words' layer kept)
    const panels = on => page.evaluate(on => { document.querySelectorAll('#inc-hud > *:not(#inc-air), #inc-label, #inc-menu, #inc-banner, #inc-card').forEach(e => { e.style.visibility = on ? '' : 'hidden'; }); }, on);
    // (what the 3D drew over the heads this frame, where each one's head is on the screen, and what each one says now)
    const air = () => page.evaluate(() => {
      const B = window.__B, S = G.S, P3 = G.People3D, cam = G.Realm.camera(); const L = G.IncUI.airAt || [];
      const head = id => { const v = S.villagers.get(id); const s = id === B.body ? G.Avatar.pos() : P3.visOf(id); if (!v || !s) return null; const q = new THREE.Vector3(s.X, s.Y + 1.75 * P3.look(v).s, s.Z); q.project(cam); return [(q.x * 0.5 + 0.5) * innerWidth, (-q.y * 0.5 + 0.5) * innerHeight]; };
      const line = b => (b ? { txt: b.txt, t0: b.t0, n: G.Talk.typed(b), until: b.until } : null);
      return { owner: L.filter(q => q.id === B.owner), body: L.filter(q => q.id === B.body), texts: L.filter(q => q.text), n: L.length, headO: head(B.owner), headB: head(B.body), said: line(G.Talk.of(B.owner)), mine: line(G.Talk.of(B.body)), clock: S.clock };
    });
    // (the ink on the words' layer in a box of the screen — CSS pixels —: how many pixels are painted. Read from a copy of the
    // test's own, made for reading: the game never reads its layer back, and is not asked to)
    const ink = (x, y, w, h) => page.evaluate(([x, y, w, h]) => { const cv = document.querySelector('#inc-air'); if (!cv) return -1; const k = cv.width / innerWidth;
      const cp = window.__inkCv || (window.__inkCv = document.createElement('canvas')); cp.width = cv.width; cp.height = cv.height; const c = cp.getContext('2d', { willReadFrequently: true }); c.drawImage(cv, 0, 0);
      const X = Math.max(0, Math.round(x * k)), Y = Math.max(0, Math.round(y * k)); const d = c.getImageData(X, Y, Math.max(1, Math.round(w * k)), Math.max(1, Math.round(h * k))).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 8) n++; return n; }, [x, y, w, h]);
    const frames = n => page.evaluate(n => window.__VIS.f(n), n);
    const of = (L, l) => (l ? L.find(q => q.t0 === l.t0) || null : null); // (the bubble of that line among the ones drawn)

    // ------------------------------ 1. before ------------------------------
    await frames(2); const a0 = await air();
    await panels(false); await shot('baloes-antes'); await panels(true);
    ok('antes da pechincha: nenhum balão sobre o corpo, que nada disse', !a0.body.length && !a0.mine, `o corpo ${a0.mine ? 'diz: ' + a0.mine.txt : 'calado'}; o mercador ${a0.said ? 'falando com outro: «' + a0.said.txt + '»' : 'calado'}; ${a0.n} coisa(s) desenhada(s) sobre o mundo perto`);

    // ------------------------------ 2. the haggle: the merchant's answer over his head ------------------------------
    const h = await page.evaluate(() => {
      const B = window.__B, S = G.S, TL = G.Space.TILE; const v = S.villagers.get(B.body);
      const o = G.Act.offers(v, v.x, v.y, 2.6 / TL + 2).find(q => q.def === 'negocio' && q.act === 'pechinchar' && q.ok !== false);
      if (!o) { const z = G.Biz.get(B.z), sp = z && G.Biz.spots(z), ow = S.villagers.get(B.owner);
        return { err: 'nenhuma oferta de pechincha diante da banca: ' + G.Act.offers(v, v.x, v.y, 2.6 / TL + 2).map(q => q.act + (q.ok === false ? ' (' + q.why + ')' : '')).join(', ') + ` — o corpo a ${sp ? G.dist(v.x, v.y, sp.buyer[0], sp.buyer[1]).toFixed(2) : '?'} casas do lugar do comprador; a banca ${z ? (z.open ? 'aberta' : 'fechada') + ', ' + (G.Biz.manned(z) ? 'atendida' : 'sem ninguém') + ', ' + G.Biz.display(z).length + ' coisas à mostra' : 'sumiu'}; o dono: ${ow ? (ow.task ? ow.task.type : 'sem tarefa') + ' a ' + (sp ? G.dist(ow.x, ow.y, sp.seller[0], sp.seller[1]).toFixed(2) : '?') : 'sumiu'}` }; }
      const c0 = S.clock; const r = G.Interact.run({ id: 'atividade', t: { o, X: o.at[0] * TL, Z: o.at[1] * TL } });
      // (until the body's offer is said — at the gesture's contact, in the world's step —, and with it the merchant's answer)
      const k = window.__VIS.until(() => { const m = G.Talk.of(B.body); return !!m && m.t0 >= c0; }, 900);
      const m = G.Talk.of(B.body), a = G.Talk.of(B.owner);
      return { label: o.label, run: !!(r && r.ok), k, offer: m ? { txt: m.txt, t0: m.t0 } : null, answer: a && m && a.t0 >= m.t0 ? { txt: a.txt, t0: a.t0, until: a.until } : null };
    });
    if (h.err) ok('a pechincha', false, h.err);
    const ans = h.answer;
    // (a bubble fades in over its first moment: in the frame it is said it is not painted yet — two frames on, a letter or two)
    await frames(2); const a1 = await air();
    await frames(3); const a2 = await air();
    // (the answer typed out to its end: then the picture, the world held still a moment by the menu)
    if (ans) await page.evaluate(t0 => { const B = window.__B; window.__VIS.until(() => { const b = G.Talk.of(B.owner); return !b || b.t0 !== t0 || G.Talk.typed(b) >= b.txt.length; }, 600); }, ans.t0);
    const a3 = await air();
    const b1 = of(a1.owner, ans), b2 = of(a2.owner, ans), b3 = of(a3.owner, ans), m1 = h.offer ? of(a1.body, h.offer) : null;
    const over = b1 && a1.headO && b1.y < a1.headO[1] - 4 && Math.abs(b1.x - a1.headO[0]) < 40;
    const inkO = b1 ? await ink(...b1.box) : 0;
    ok('na pechincha, o balão do mercador com a resposta aparece sobre a cabeça dele no 3D', !!ans && !!over && inkO > 30,
      `${h.label || '-'} (${h.k} quadros depois do pedido): o corpo diz «${h.offer ? h.offer.txt : '—'}», o mercador responde «${ans ? ans.txt : '—'}»; o balão em ${b1 ? b1.x + ',' + b1.y : 'nenhum lugar'}, a cabeça em ${a1.headO ? a1.headO.map(q => q.toFixed(0)).join(',') : '-'}; tinta no balão: ${inkO} px`);
    ok('e o da oferta sobre a cabeça do corpo', !!m1 && !!a1.headB && m1.y < a1.headB[1] - 4, `o balão do corpo em ${m1 ? m1.x + ',' + m1.y : 'nenhum lugar'}, a cabeça em ${a1.headB ? a1.headB.map(q => q.toFixed(0)).join(',') : '-'}`);
    ok('as palavras aparecem letra por letra, no relógio do mundo', !!b1 && !!b3 && b1.n < ans.txt.length && b3.n === ans.txt.length && (!b2 || b2.n >= b1.n),
      b1 ? `${b1.n} → ${b2 ? b2.n : '-'} → ${b3 ? b3.n : '-'} de ${ans.txt.length} letras` : 'sem balão');
    await page.evaluate(() => { G.Modes.menu(true); window.__VIS.f(1); });
    await panels(false); await shot('baloes-pechincha'); await panels(true);

    // ------------------------------ 3. a load put in the store: its little text ------------------------------
    // (put up by the god's hand as the activities put it — the merchant's own '+3' —, the world paused: it rises in real time)
    await page.evaluate(() => { const o = G.S.villagers.get(window.__B.owner); G.FX.deposit(o.x, o.y, 'food', 3); window.__VIS.f(4); });
    const a4 = await air();
    ok('o texto que sobe de um depósito (G.FX.deposit) aparece no 3D', a4.texts.some(q => q.text === '+3'), a4.texts.length ? a4.texts.map(q => `«${q.text}» em ${q.x},${q.y}`).join(' · ') : 'nenhum texto');
    await panels(false); await shot('baloes-deposito'); await panels(true);

    // ------------------------------ 4. nothing changes in the world ------------------------------
    // (the world paused, frames drawn with the words and the texts over it)
    const w5 = await page.evaluate(() => {
      const S = G.S; const fp = () => { const s = JSON.stringify(QA.canon()); let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
      const o = S.villagers.get(window.__B.owner); G.FX.deposit(o.x, o.y, 'food', 3);
      const f0 = fp(), r0 = JSON.stringify(S.rng), t0 = JSON.stringify(G.Talk.list), c0 = S.clock; let drawn = 0;
      for (let k = 0; k < 30; k++) { window.__VIS.f(1); drawn += (G.IncUI.airAt || []).length; }
      return { same: fp() === f0, rng: JSON.stringify(S.rng) === r0, talk: JSON.stringify(G.Talk.list) === t0, clock: S.clock === c0, drawn };
    });
    ok('o desenho não muda o mundo: o mundo parado, 30 quadros com os balões e os textos — a impressão do mundo, o acaso e a lista das falas iguais', w5.same && w5.rng && w5.talk && w5.clock && w5.drawn > 0,
      `${w5.drawn} desenhos sobre o mundo nos 30 quadros; impressão ${w5.same ? 'igual' : 'MUDOU'}, acaso ${w5.rng ? 'igual' : 'MUDOU'}, falas ${w5.talk ? 'iguais' : 'MUDARAM'}, relógio ${w5.clock ? 'parado' : 'andou'}`);
    await page.evaluate(() => { G.Modes.menu(false); window.__VIS.f(1); });

    // ------------------------------ 5. the answer over: its bubble gone ------------------------------
    // (frames of a tenth of a second while waiting: the world's seconds go three times as fast for the same frames drawn)
    const end = await page.evaluate(until => window.__VIS.until(() => G.S.clock > until + 0.05, 1200, 100), ans ? ans.until : 0);
    const a5 = await air(); const b5 = of(a5.owner, ans);
    const inkE = b3 ? await ink(...b3.box) : -1;
    // (another's words painted over the same place now — someone else speaking near, the merchant's next line — are no ink of
    // the answer's)
    const near = b3 ? await page.evaluate(B => (G.IncUI.airAt || []).filter(q => q.box && q.box[0] < B[0] + B[2] && q.box[0] + q.box[2] > B[0] && q.box[1] < B[1] + B[3] && q.box[1] + q.box[3] > B[1]).length, b3.box) : 0;
    ok('quando a resposta acaba, o balão dela some', !!ans && end >= 0 && !b5 && (near > 0 || inkE === 0),
      `a fala acabou ${end} quadros depois (o relógio do mundo em ${a5.clock.toFixed(2)}, a fala até ${ans ? ans.until.toFixed(2) : '-'}); o balão dela: ${!ans ? '-' : b5 ? 'ainda lá' : 'nenhum'}${a5.said && ans && a5.said.t0 !== ans.t0 ? ` (o mercador já diz outra: «${a5.said.txt}»)` : ''}; tinta onde ele estava: ${inkE} px${near ? ' (outra fala ali agora)' : ''}`);
    await panels(false); await shot('baloes-depois'); await panels(true);

    // ------------------------------ 6. errors ------------------------------
    const me = await page.evaluate(() => JSON.stringify(G.modErr));
    ok('sem erros de página nem de módulo', !errs.length && me === '{}', `${errs.slice(0, 3).join(' | ') || 'página limpa'}; módulos: ${me}`);
  } catch (e) { ok('a prova até o fim', false, e.message.split('\n')[0]); }
  finally { await browser.close(); }
  console.log(`${fails.length ? 'FALHAS: ' + fails.join(', ') : 'TUDO PASSOU'} (${((Date.now() - t0) / 1000).toFixed(0)} s; fotos em ${OUT})`);
  process.exit(fails.length ? 1 : 0);
})();
