// mesa-medidas: bash qa/navegador.sh node qa/visual/mesa-medidas.js PASTA [telas] — a mesa das Tabuletas e a tabuleta pequena medidas
// nas telas do dono (a frente E da onda 4: D-941 a D-944, L-2200, L-2201). As telas: 411x724 (o app do Claude no Android, a do dono),
// 390x844, 360x740 e pc (1280 × 760); TELAS=411x724,pc para só algumas. No celular, a letra mínima do WebView do Android (8 px: o
// Chromium inteiro com a preferência minimum_font_size — o texto menor é empurrado para 8 e transborda, L-2200); no PC, a de sempre.
// O painel é o do próprio cartas-ui.js, numa partida de verdade da regra (a asteca contra a nórdica, duas rodadas pelas inteligências),
// com quem joga e o rosto de alguém do mundo pronto; a mão da foto troca as perguntas da tela por um retrato (UI.force), e nada é pedido
// ao mundo. Mede, em cada tela:
//  m1 as zonas da mesa — o rosto, o nome e o subtítulo do outro; a mão dele; a trilha; a glória dele; as duas mesas e os seus nomes; a
//     oferenda e o pote; a faixa da rodada; a glória do corpo, as etiquetas (o baralho, o presságio) e o monte; a mão (com a erguida);
//     os botões; a dica —: nenhuma sobre outra, todas dentro da tela, sem rolagem de lado, nenhum texto cortado, os botões de tocar com
//     44 px ou mais (no PC, 32), com a mão de 5, de 7 e de 9 tabuletas;
//  m2 a tabuleta pequena de cada uma das 120 (os seis povos, as regras mais longas primeiro), na mão (erguida) e na mesa: o nome dentro
//     da faixa, a regra inteira dentro do painel, nenhum dos dois sobre o outro nem sobre a força e o tipo, e a letra de 8 px ou mais (no
//     PC, 10) — e nenhuma frase do mito nela;
//  m3 a tabuleta grande (a que se segura) de cada uma: a regra e o mito inteiros no painel, nada cortado.
// Fotos: PASTA/<tela>-mesa.png (uma erguida), -faixa.png (a faixa da rodada com o nome mais longo dos povos, «Nezahualcóyotl leva 12 de
// glória», e as etiquetas; com a mão de 7, a do corpo com o selo «Sete seguidas!» por cima, como a frente F a escreve), -mao9.png, -grande.png.
// E nenhum erro de página nem aviso no console.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '../..');
const OUT = process.argv[2] || path.join(require('os').tmpdir(), 'mesa-medidas'); fs.mkdirSync(OUT, { recursive: true });
const ALL = { '411x724': [411, 724, 2, 1], '390x844': [390, 844, 2, 1], '360x740': [360, 740, 2, 1], pc: [1280, 760, 1, 0] };
const TELAS = (process.argv[3] || process.env.TELAS || Object.keys(ALL).join(',')).split(',').filter(t => ALL[t]);
const fails = []; const ok = (name, cond, info) => { console.log(`${cond ? 'PASSOU' : 'FALHOU'} | mesa-medidas ${name} | ${info}`); if (!cond) fails.push(name); };
(async () => {
  for (const tela of TELAS) {
    const [W, H, DSF, PHONE] = ALL[tela];
    // (the browser: the whole Chromium, with its own profile — the phone's with the WebView's minimum font)
    const ud = path.join(OUT, '.perfil-' + tela); fs.rmSync(ud, { recursive: true, force: true }); fs.mkdirSync(path.join(ud, 'Default'), { recursive: true });
    if (PHONE) fs.writeFileSync(path.join(ud, 'Default', 'Preferences'), JSON.stringify({ webkit: { webprefs: { minimum_font_size: 8, minimum_logical_font_size: 8 } } }));
    const ctx = await chromium.launchPersistentContext(ud, Object.assign({ channel: 'chromium', viewport: { width: W, height: H }, deviceScaleFactor: DSF, args: ['--js-flags=--max-old-space-size=8192'] }, PHONE ? { isMobile: true, hasTouch: true } : {}));
    const page = ctx.pages()[0] || await ctx.newPage();
    const errs = []; page.on('pageerror', e => errs.push(e.message));
    page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|WebGL|GL Driver|GroupMarkerNotSet/.test(t)) errs.push('console: ' + t.slice(0, 200)); });
    await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(800);
    await page.addScriptTag({ path: path.join(ROOT, 'worlds', 'metropole.js') });
    const minF = await page.evaluate(() => { const d = document.createElement('div'); d.style.fontSize = '3px'; d.textContent = 'x'; document.body.appendChild(d); const f = parseFloat(getComputedStyle(d).fontSize); d.remove(); return f; });
    await page.evaluate(([phone]) => {
      G.Save.apply(JSON.parse(G.Ready.data.metropole)); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden');
      G.IncUI.init(); if (phone) G.Input3D.touch = true;
      const C = G.Cartas; const people = [...G.S.villagers.values()].filter(o => o.age >= 22 && o.age < 60).sort((a, b) => a.id - b.id);
      // (who plays with the body: the longest name the world has at hand — the worst case of the top)
      const v = people[0]; const o = people.filter(q => q.id !== v.id).sort((a, b) => b.name.length - a.name.length || a.id - b.id)[0];
      G.Possess.body = () => v; G.Modes.inc = () => true; G.Modes.panel = () => false; G.Modes.setPanel = () => { }; G.Modes.panelIs = p => p === 'cartas'; G.Input3D.free = () => { };
      if (G.JogosEnsina && G.JogosEnsina.esquece) G.JogosEnsina.desliga = true; // (the guide stays off: this proof measures the table)
      const s = C.nova({ id: 777, seed: 4242, civ: ['asteca', 'nordico'], aposta: 0.2 }); const ind = [{ ousado: 0.6 }, { ousado: 0.4 }];
      for (let r = 0; r < 2; r++) { C.abre(s); for (let k = 0; k < 2; k++) { const i = C.vez(s); C.joga(s, i, C.ia(s, i, ind[i])); } C.resolve(s); }
      C.abre(s);
      const mk = o2 => Object.assign({ jogo: 777, me: 0, ai: 1, o: o.id, fase: 'jogo', r: s.r, of: C.OF.slice(), pote: 0.4 * s.x, aposta: 0.2, x: s.x, mao: s.p[0].mao.slice(), monte: [s.p[0].monte.length, s.p[1].monte.length], maoOutro: s.p[1].mao.length, gl: [s.p[0].gl, s.p[1].gl], potePedras: s.altar, vis: '', aberta: null, posta: false, dobra: '', podeDobrar: true, hist: s.hist.slice(-8), fim: null, civ: s.civ.slice(), bonus: 0, mal: 0, desc: [0, 0], preco: n => G.Falas.price('asteca', n), moeda: true, baralho: 'baralho.amate', trap: null, n: s.hist.length, fontes: ['baralho da casa, emprestado', 'baralho da casa, emprestado'], alug: 0.2, casas: 2 }, o2 || {});
      window.__T = { s, mk, v, o }; G.CartasUI.force = () => window.__T.view; window.__T.view = mk();
      G.CartasUI.abrir(777);
    }, [!!PHONE]);
    // (what the screen shows, measured: the zones, the texts cut, the buttons)
    const zonas = () => page.evaluate(([phone]) => {
      const P = document.querySelector('#tab-panel'); const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
      const vis = e => !!e && e.offsetParent !== null && getComputedStyle(e).visibility !== 'hidden' && e.getBoundingClientRect().width > 0;
      const uni = L => { L = L.filter(vis).map(R); if (!L.length) return null; return { l: Math.min(...L.map(x => x.l)), t: Math.min(...L.map(x => x.t)), r: Math.max(...L.map(x => x.r)), b: Math.max(...L.map(x => x.b)) }; };
      const q = s => [...P.querySelectorAll(s)];
      // (the text of an element where it is drawn: the union of its lines — not its box, which may be wider than the words —, kept inside
      // its box's height: the lines of a block of text are its box, and a tight line lets the font's room spill over the next one by a pixel)
      const txt = e => { if (!vis(e)) return null; const rg = document.createRange(); rg.selectNodeContents(e); const L = [...rg.getClientRects()].filter(x => x.width > 0.5); if (!L.length) return null; const bx = e.getBoundingClientRect();
        return { l: Math.min(...L.map(x => x.left)), t: Math.max(bx.top, Math.min(...L.map(x => x.top))), r: Math.max(...L.map(x => x.right)), b: Math.min(bx.bottom, Math.max(...L.map(x => x.bottom))) }; };
      const Z = {
        rosto: uni(q('.tb-face')), nome: txt(P.querySelector('.tb-nm b')), sub: txt(P.querySelector('.tb-nm small')), 'glória dele': uni(q('.tb-gl-o')), ajuda: uni(q('.tb-top .tb-ajuda')), sair: uni(q('.tb-x')),
        'mão dele': uni(q('.tb-mo .ct-card')), trilha: uni(q('.tb-trilha .tb-tk')), 'mesa dele': uni(q('.tb-so')), 'mesa sua': uni(q('.tb-sm')), 'nome da mesa dele': txt(P.querySelector('.tb-so-n')), 'nome da mesa sua': txt(P.querySelector('.tb-sm-n')),
        oferenda: uni(q('.tb-of')), pote: uni(q('.tb-pote > *')), faixa: uni(q('.tb-msg .tb-ev')), seguidas: uni(q('.tb-msg .tb-seguidas')),
        'sua glória': uni(q('.tb-gl-m')), etiquetas: uni(q('.tb-info .tb-tag')), monte: uni(q('.tb-monte')),
        'sua mão': uni(q('.tb-mao .ct-card')), botões: uni(q('.tb-btns .tb-b')), dica: txt(P.querySelector('.tb-hint')),
      };
      const names = Object.keys(Z).filter(k => Z[k]); const over = [];
      for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) { const a = Z[names[i]], b = Z[names[j]]; const ix = Math.min(a.r, b.r) - Math.max(a.l, b.l), iy = Math.min(a.b, b.b) - Math.max(a.t, b.t); if (ix > 0.5 && iy > 0.5) over.push(`${names[i]} × ${names[j]} (${Math.round(ix)}×${Math.round(iy)})`); }
      const fora = names.filter(k => Z[k].l < -0.5 || Z[k].t < -0.5 || Z[k].r > innerWidth + 0.5 || Z[k].b > innerHeight + 0.5).map(k => `${k} (${Math.round(Z[k].l)},${Math.round(Z[k].t)}–${Math.round(Z[k].r)},${Math.round(Z[k].b)})`);
      // (a text cut: its words hidden — wider than its box (the ellipsis included), or taller by more than the font's own room over a tight
      // line, 45 % of the letter: the ascent of the Cinzel spills a little over a line of 1,05 and hides nothing)
      const cortes = q('.tb-nm b, .tb-nm small, .tb-tag, .tb-ev, .tb-of b, .tb-of small, .tb-pote span, .tb-b, .tb-hint, .tb-tk, .tb-gl b, .tb-gl small, .tb-slot-n').filter(vis).filter(e => e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1 + 0.45 * parseFloat(getComputedStyle(e).fontSize)).map(e => `${e.className || e.tagName}: «${e.textContent.trim().slice(0, 30)}» (${e.scrollWidth}×${e.scrollHeight} em ${e.clientWidth}×${e.clientHeight})`);
      const MIN = phone ? 44 : 32; const peq = q('button').filter(vis).filter(b => !b.closest('.tb-over') && !b.closest('.tb-zoom') && !b.closest('.ens')).filter(b => b.getBoundingClientRect().height < MIN - 0.5 || b.getBoundingClientRect().width < MIN - 0.5).map(b => `${b.className}:${Math.round(b.getBoundingClientRect().width)}×${Math.round(b.getBoundingClientRect().height)}`);
      const lado = document.documentElement.scrollWidth > innerWidth + 1;
      return { over, fora, cortes, peq, lado, Z: Object.fromEntries(names.map(k => [k, [Math.round(Z[k].l), Math.round(Z[k].t), Math.round(Z[k].r), Math.round(Z[k].b)]])), cwh: P.querySelector('.tb-mao .ct-card') ? Math.round(P.querySelector('.tb-mao .ct-card').getBoundingClientRect().width) : 0 };
    }, [!!PHONE]);
    const show = (o2, sel) => page.evaluate(([o2, sel]) => { const T = window.__T; T.view = T.mk(o2); G.CartasUI._test.view = T.view; G.CartasUI._test.render(); for (const c of document.querySelectorAll('#tab-panel .tb-mao .ct-card')) c.classList.remove('tb-in'); if (sel >= 0) G.CartasUI._test.escolhe(sel); }, [o2, sel]);
    // (the hand of n: the deck's own tablets, the longest rules first)
    const hand = n => page.evaluate(n => { const D = G.Cartas.DECKS.asteca.slice().sort((a, b) => (b.txt.length - a.txt.length) || (a.id < b.id ? -1 : 1)); return D.slice(0, n).map(c => c.id); }, n);
    // ======== m1: the zones, with a hand of 5, 7 and 9; the round's banner and two tags
    // (the round's banner as the F front writes it — D-950 —: the other's name in it, the longest of the peoples' names, when he wins it; the
    // seal of the streak floating over it when the body wins three or more in a row)
    const FAIXA = { 5: '<span class="tb-ev big down">Nezahualcóyotl leva 12 de glória</span>', 7: '<span class="tb-ev big up">Você leva 12 de glória</span><span class="tb-seguidas s3">Sete seguidas!</span>', 9: '<span class="tb-ev big up">Você leva 8 de glória</span>' };
    for (const n of [5, 7, 9]) {
      const mao = await hand(n);
      await show({ mao, maoOutro: Math.min(9, n), bonus: 3 }, n - 1); await page.evaluate(h => { document.querySelector('#tab-panel .tb-msg').innerHTML = h; }, FAIXA[n]);
      await page.waitForTimeout(700); const z = await zonas(); // (the seal of the streak grown to its size: 0,6 s)
      ok(`m1 ${tela} as zonas da mesa, a mão de ${n}`, !z.over.length && !z.fora.length && !z.cortes.length && !z.peq.length && !z.lado,
        `tabuleta da mão ${z.cwh} px${z.over.length ? '; SOBRE: ' + z.over.join(', ') : ''}${z.fora.length ? '; FORA DA TELA: ' + z.fora.join(', ') : ''}${z.cortes.length ? '; CORTADOS: ' + z.cortes.join(', ') : ''}${z.peq.length ? '; botões pequenos: ' + z.peq.join(', ') : ''}${z.lado ? '; ROLAGEM DE LADO' : ''}${process.env.ZONAS ? '; ' + JSON.stringify(z.Z) : ''}`);
      if (n === 5) await page.screenshot({ path: path.join(OUT, `${tela}-faixa.png`) });
      if (n === 7) await page.screenshot({ path: path.join(OUT, `${tela}-seguidas.png`) });
      if (n === 9) await page.screenshot({ path: path.join(OUT, `${tela}-mao9.png`) });
    }
    // (the photo of the table as it is in a round: a tablet raised, the message of a power)
    await show({ mao: (await hand(9)).slice(2, 7) }, 2); await page.evaluate(() => { document.querySelector('#tab-panel .tb-msg').innerHTML = `<span class="tb-ev">${G.CartasArte.icone('golpe')} Ahuízotl golpeia: a outra perde 2.</span>`; });
    await page.waitForTimeout(400); await page.screenshot({ path: path.join(OUT, `${tela}-mesa.png`) });
    // ======== m2: the small tablet of each of the 120, raised in the hand and on the table
    const m2 = await page.evaluate(([phone, minF]) => {
      const C = G.Cartas, A = G.CartasArte; const T = window.__T; const all = C.all().slice().sort((a, b) => (b.txt.length - a.txt.length) || (b.nome.length - a.nome.length) || (a.id < b.id ? -1 : 1));
      const FLOOR = phone ? Math.max(8, minF) : 10; const bad = []; let low = 99, hi = 0, worst = '';
      const R = e => e.getBoundingClientRect(); const fsz = e => parseFloat(getComputedStyle(e).fontSize);
      const inside = (a, b, tol) => a.left >= b.left - tol && a.right <= b.right + tol && a.top >= b.top - tol && a.bottom <= b.bottom + tol;
      const cross = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0.5 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0.5;
      const meas = (card, where, id) => {
        if (!card) { bad.push(`${id} (${where}): sem a tabuleta`); return; }
        if (!card.classList.contains('ct-mini')) bad.push(`${id} (${where}): não é a pequena`);
        if (card.querySelector('.ct-mito')) bad.push(`${id} (${where}): a frase do mito na pequena`);
        const nome = card.querySelector('.ct-nome'), sp = nome && nome.querySelector('span'), pw = card.querySelector('.ct-pw'), p = pw && pw.querySelector('p'), f = card.querySelector('.ct-f'), ti = card.querySelector('.ct-tipo');
        if (!sp || !p) { bad.push(`${id} (${where}): sem o nome ou a regra`); return; }
        const rc = R(card), rn = R(nome), rs = R(sp), rp = R(pw), rq = R(p);
        for (const e of [sp, p]) { const s = fsz(e); if (s < low) { low = s; worst = id; } if (s > hi) hi = s; if (s < FLOOR - 0.01) bad.push(`${id} (${where}): letra de ${s.toFixed(1)} px`); }
        if (!inside(rs, rn, 0.6)) bad.push(`${id} (${where}): o nome sai da faixa (${Math.round(rs.width)}×${Math.round(rs.height)} em ${Math.round(rn.width)}×${Math.round(rn.height)})`);
        if (!inside(rq, rp, 0.6) || pw.scrollHeight > pw.clientHeight + 1) bad.push(`${id} (${where}): a regra sai do painel (${Math.round(rq.height)} em ${Math.round(rp.height)})`);
        if (!inside(rn, rc, 0.6) || !inside(rp, rc, 0.6)) bad.push(`${id} (${where}): texto fora da tabuleta`);
        if (cross(rs, rq)) bad.push(`${id} (${where}): o nome sobre a regra`);
        for (const e of [f, ti]) if (e && (cross(R(e), rs) || cross(R(e), rq))) bad.push(`${id} (${where}): a força ou o tipo sobre o texto`);
      };
      for (const c of all) {
        // (raised in a hand of five, in the middle — the one the player reads — and on the player's table, open)
        const others = C.DECKS[c.povo].filter(x => x.id !== c.id).slice(0, 4).map(x => x.id); const mao = [others[0], others[1], c.id, others[2], others[3]];
        T.view = T.mk({ mao, civ: [c.povo, 'nordico'] }); G.CartasUI._test.view = T.view; G.CartasUI._test.render(); for (const el of document.querySelectorAll('#tab-panel .tb-mao .ct-card')) el.classList.remove('tb-in'); G.CartasUI._test.escolhe(2);
        meas(document.querySelector('#tab-panel .tb-mao .ct-card.sel'), 'na mão', c.id);
        const sm = document.querySelector('#tab-panel .tb-sm'); sm.innerHTML = `<div class="tb-flip open"><div class="tb-fr">${A.html(c.id, { mini: true })}</div><div class="tb-bk">${A.htmlVerso(c.povo)}</div></div>`;
        meas(sm.querySelector('.ct-card:not(.ct-verso)'), 'na mesa', c.id); sm.innerHTML = '';
      }
      return { bad, n: all.length, low: +low.toFixed(2), hi: +hi.toFixed(2), worst, FLOOR };
    }, [!!PHONE, minF]);
    ok(`m2 ${tela} a tabuleta pequena de cada uma, na mão e na mesa`, !m2.bad.length, `${m2.n} tabuletas; a letra de ${m2.low} a ${m2.hi} px (o piso: ${m2.FLOOR}; a menor em ${m2.worst}); o mínimo do navegador: ${minF} px${m2.bad.length ? ' — FALHOU: ' + m2.bad.slice(0, 8).join(' | ') + (m2.bad.length > 8 ? ` (+${m2.bad.length - 8})` : '') : ''}`);
    // ======== m3: the big tablet (held), each of the 120
    const m3 = await page.evaluate(() => {
      const C = G.Cartas, A = G.CartasArte; const bad = []; const z = document.querySelector('#tab-panel .tb-zoom'); let cw = 0;
      const R = e => e.getBoundingClientRect(); const inside = (a, b) => a.left >= b.left - 0.6 && a.right <= b.right + 0.6 && a.top >= b.top - 0.6 && a.bottom <= b.bottom + 0.6;
      for (const c of C.all()) {
        z.innerHTML = A.html(c.id, { cls: 'ct-big' }); z.classList.remove('hidden'); const card = z.querySelector('.ct-card'); cw = R(card).width;
        const tx = card.querySelector('.ct-tx'), mi = card.querySelector('.ct-mito'), pw = card.querySelector('.ct-pw');
        if (!tx || !mi || !pw) { bad.push(c.id + ': sem a regra ou o mito'); continue; }
        if (tx.scrollHeight > tx.clientHeight + 1 || !inside(R(mi), R(tx)) || !inside(R(pw), R(tx))) bad.push(`${c.id}: o texto sai do painel (${tx.scrollHeight} em ${tx.clientHeight})`);
        if (mi.scrollHeight > mi.clientHeight + 1 + 0.45 * parseFloat(getComputedStyle(mi).fontSize)) bad.push(`${c.id}: o mito cortado (${mi.scrollHeight} em ${mi.clientHeight})`);
        if (!inside(R(card.querySelector('.ct-nome span')), R(card))) bad.push(`${c.id}: o nome fora`);
      }
      z.classList.add('hidden'); return { bad, cw: Math.round(cw) };
    });
    ok(`m3 ${tela} a tabuleta grande de cada uma`, !m3.bad.length, `a grande com ${m3.cw} px; a regra e o mito inteiros${m3.bad.length ? ' — FALHOU: ' + m3.bad.slice(0, 8).join(' | ') : ''}`);
    // (the photo of the big one: the longest myth)
    await page.evaluate(() => { const c = G.Cartas.all().slice().sort((a, b) => b.mito.length - a.mito.length)[0]; const z = document.querySelector('#tab-panel .tb-zoom'); z.innerHTML = G.CartasArte.html(c.id, { cls: 'ct-big' }); z.classList.remove('hidden'); });
    await page.waitForTimeout(300); await page.screenshot({ path: path.join(OUT, `${tela}-grande.png`) });
    const me = await page.evaluate(() => Object.keys(G.modErr || {}));
    ok(`${tela} sem erros`, !errs.length && !me.length, errs.concat(me).join(' | ').slice(0, 300) || 'nenhum');
    await ctx.close(); fs.rmSync(ud, { recursive: true, force: true });
  }
  console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU'); process.exit(fails.length ? 1 : 0);
})();
