// forma-deus-fotos: o degrau grande na visão do deus, num navegador (Arquitetura Monumental, D-106) —
//   bash qa/navegador.sh node qa/visual/forma-deus-fotos.js [PASTA_DO_JOGO] [SAIDA]
// Na «metropole», o Coliseu de 10 casas (a forma do M1 quando houver; até lá, o gerador de teste de visual/forma-deus-lib.js)
// fundado pela mão do deus em Roma, pronto; três pessoas da cidade postas em volta dele: uma diante da face da frente à
// direita, uma diante da face da frente à esquerda, uma atrás. O mundo parado; quadros da visão do deus.
//   1. o «sprite» do degrau: o pintor da forma, do tamanho do lote (largura (2 × 10) × 16 + 16 px), quanto custa fazê-lo (ms,
//      no navegador) e quanta memória (o quadro a 3× e as cópias menores)
//   2. o quadro: a mediana de 15 quadros com o Coliseu na tela (ms, por software: o piso, não a placa de vídeo), e a parte dele
//      que desenha os prédios (o medidor do render.js, R.prof: e4)
//   3. a ordem do desenho: a chave do prédio na lista do quadro (R.bkey) e a de cada pessoa, cada uma do lado certo dele
//   4. as fotos (JPG pequenos): de frente, de perto do lado (a pessoa diante da face), e girado um quarto
//   5. nenhum erro de página nem de módulo; o desenho não muda o mundo (a impressão do mundo, QA.canon, igual)
//   6. a obra pela metade (o mundo pronto de novo, o Coliseu fundado como obra): o andaime da altura da forma desse tamanho
//      (R.siteH) e a foto dela
// Numa pasta do jogo de antes do pintor (sem G.Arch.formSprite), só tira as fotos de antes (o degrau desenhado à moda antiga).
const path = require('path'), fs = require('fs'), os = require('os');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..')), OUT = path.resolve(process.argv[3] || path.join(os.tmpdir(), 'forma-deus'));
fs.mkdirSync(OUT, { recursive: true });
const { open } = require('./vistas.js'); const LIB = require('./forma-deus-lib.js');
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | forma-deus-fotos ${name} | ${info}`); if (!c) fails.push(name); };
(async () => {
  const t0 = Date.now();
  const { browser, page, errs } = await open(ROOT, { worlds: ['metropole'], w: +process.env.VW || 880, h: +process.env.VH || 560 });
  // (the god's canvas itself — the view, without the panels over it)
  const shot = async name => { try { const u = await page.evaluate(() => document.getElementById('game').toDataURL('image/jpeg', 0.72)); fs.writeFileSync(path.join(OUT, name + '.jpg'), Buffer.from(u.split(',')[1], 'base64')); } catch (e) { console.log(`(foto ${name} não saiu: ${e.message.slice(0, 80)})`); } };
  try {
    const r = await page.evaluate(([gen, N]) => {
      G.Save.apply(JSON.parse(G.Ready.data.metropole)); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(0); if (G.Audio) G.Audio.mute = true;
      const Fo = G.Forma, S = G.S; const teste = !Fo.has('maravilha', 'romano', N); if (teste && Fo.def) Fo.def('maravilha', 'romano', (0, eval)('(' + gen + ')'), [N]);
      const set = [...S.settlements.values()].find(s => s.name === 'Roma') || [...S.settlements.values()].find(s => G.Civ.idOfFac(s.fac) === 'romano');
      if (!set) return { err: 'nenhuma cidade romana' };
      let b = null; G.inSim++; try { b = G.Village.handFound ? G.Village.handFound(set, 'maravilha', 'maravilha', { built: true }) : null; } finally { G.inSim--; }
      if (!b) return { err: `a mão do deus não achou um lote de ${N} casas em ${set.name}` };
      // (three of the town round it: before its front-right face, before its front-left one, behind it — in the first view)
      const free = o => o.age >= 16 && !o.inside && !o.aboard && !o.held && !o.captive && !o.jail && !o.dead && o.set === set.id;
      const ps = [...S.villagers.values()].filter(free).sort((a, c) => a.id - c.id).slice(0, 3);
      const spots = [[b.x + b.w + 0.45, b.y + b.h * 0.3], [b.x + b.w * 0.35, b.y + b.h + 0.45], [b.x - 0.55, b.y + b.h * 0.5]];
      ps.forEach((v, k) => { G.Vg.endTask(v); v.x = spots[k][0]; v.y = spots[k][1]; v.path = null; v.moving = false; v.sleeping = false; });
      if (G.FX && G.FX.list) G.FX.list.length = 0; // (the wonder's feast — its ring of light, its name — only seen: out of the photos)
      return { id: b.id, x: b.x, y: b.y, w: b.w, set: set.name, st: G.Civ.idOfFac(set.fac), teste, ps: ps.map(v => v.id), pinta: !!G.Arch.formSprite };
    }, [LIB.coliseuTeste.toString(), LIB.N]);
    if (r.err) { ok('o Coliseu fundado', false, r.err); throw new Error(r.err); }
    console.log(`o Coliseu de ${r.w} casas em ${r.set} (${r.st}), #${r.id} em ${r.x},${r.y}${r.teste ? ' — a forma de teste' : ''}`);
    // (the view on it, near: its middle on the screen, the god's zoom of a town)
    const m = await page.evaluate(([id, people]) => {
      const S = G.S, R = G.Render, b = S.buildings.get(id); const canon0 = window.QA && QA.canon ? JSON.stringify(QA.canon()) : null;
      R.centerOn(b.x + b.w / 2, b.y + b.h / 2 + 1, 1.25); window.__VIS.f(3);
      const out = { canon0 };
      if (G.Arch.formSprite) {
        // (1) the sprite: made anew, timed; its canvas at 3× and the smaller copies
        const k = 'f-maravilha' + (b.style || 'romano') + b.w; G.Art.clear(); const t1 = performance.now(); const spr = G.Arch.formSprite('maravilha', b.style || 'romano', b.w, false); out.ms = performance.now() - t1;
        out.spr = spr ? { w: spr.w, h: spr.h, cw: spr.c.width, ch: spr.c.height } : null; out.st = G.Arch.formStats; void k;
        window.__VIS.f(4);
        // (2) the frame with it on the screen: the median of 15; and the buildings' own share of it — the render's profiler,
        // R.prof: e4 —, over 20
        const ts = []; for (let j = 0; j < 15; j++) { const t2 = performance.now(); G.Main.frameFor(33); ts.push(performance.now() - t2); } ts.sort((a, c) => a - c); out.frame = ts[7];
        R.prof.t = {}; R.prof.on = true; try { for (let j = 0; j < 20; j++) G.Main.frameFor(33); } finally { R.prof.on = false; } out.e4 = (R.prof.t.e4 || 0) / 20;
        // (3) the order of the drawing: the building's key and each person's — by the render's own numbers
        const bk = R.bkey(b); out.order = people.map(pid => { const v = S.villagers.get(pid); const key = R.depth(v.x, v.y) + 0.05; return { id: pid, after: key > bk, before: key < bk }; });
      }
      return out;
    }, [r.id, r.ps]).catch(e => ({ err: e.message }));
    if (m.err) throw new Error(m.err);
    await shot(r.pinta ? 'deus-coliseu' : 'antes-deus-coliseu');
    if (r.pinta) {
      const W2 = (2 * r.w) * 16 + 16; const mb = m.spr ? m.spr.cw * m.spr.ch * 4 / 1048576 : 0;
      ok('1: o «sprite» do degrau, do tamanho do lote', !!m.spr && Math.abs(m.spr.w - W2) < 0.5, m.spr ? `${m.spr.w.toFixed(0)} × ${m.spr.h.toFixed(0)} px (o lote: ${W2}); feito em ${m.ms.toFixed(0)} ms no navegador — ${m.st && m.st.parts} partes, ${m.st && m.st.edges} «atrás de» —; ${mb.toFixed(1)} MB a 3× (mais ⅓ nas cópias menores: ${(mb * 4 / 3).toFixed(1)} MB)` : 'nenhum');
      ok('2: o quadro com o Coliseu na tela', m.frame > 0, `mediana de 15 quadros: ${m.frame.toFixed(1)} ms (canvas e WebGL por software: o piso, não a placa de vídeo); o desenho dos prédios na tela (R.prof e4): ${m.e4.toFixed(2)} ms por quadro`);
      const wrong = m.order.filter((o, k) => (k < 2 ? !o.after : !o.before));
      ok('3: a ordem do desenho em volta do Coliseu', !wrong.length, m.order.map((o, k) => `#${o.id} ${k < 2 ? 'diante de uma face: depois do prédio' : 'atrás: antes'} ${(k < 2 ? o.after : o.before) ? 'sim' : 'NÃO'}`).join('; '));
    }
    // (4) near, on its side: the one before the front-right face; then the view turned a quarter
    await page.evaluate(id => { const b = G.S.buildings.get(id); G.Render.centerOn(b.x + b.w + 0.5, b.y + b.h * 0.35, 3.2); window.__VIS.f(3); }, r.id);
    await shot(r.pinta ? 'deus-coliseu-lado' : 'antes-deus-coliseu-lado');
    await page.evaluate(id => { const b = G.S.buildings.get(id); G.Render.centerOn(b.x + b.w / 2, b.y + b.h / 2 + 1, 1.25); G.Render.rotate(1); window.__VIS.f(40); G.Render.centerOn(b.x + b.w / 2, b.y + b.h / 2 + 1, 1.25); window.__VIS.f(3); }, r.id);
    await shot(r.pinta ? 'deus-coliseu-girado' : 'antes-deus-coliseu-girado');
    // (5) the world unchanged by the drawing; no error
    const after = await page.evaluate(c0 => ({ canon: window.QA && QA.canon ? JSON.stringify(QA.canon()) : null, diff: window.QA && QA.diff && c0 ? QA.diff(JSON.parse(c0), QA.canon()).slice(0, 3) : [], mod: G.modErr ? Object.keys(G.modErr) : [] }), m.canon0);
    if (r.pinta) ok('5: o desenho não muda o mundo', m.canon0 === null || m.canon0 === after.canon, m.canon0 === null ? 'sem QA.canon' : m.canon0 === after.canon ? 'a impressão do mundo igual depois dos quadros, do «sprite» e do giro' : 'mudou: ' + JSON.stringify(after.diff).slice(0, 300));
    // (6) the site of the step, half built: the ready world again, the Colosseum founded by the god's hand as a work, at half
    // of it — its scaffold as tall as its form of that size (R.siteH, the god's site: render.js drawSite), its name over it
    const o6 = await page.evaluate(([gen, N]) => {
      G.Save.apply(JSON.parse(G.Ready.data.metropole)); G.Main.mode = 'game'; G.UI.setSpeed(0);
      const Fo = G.Forma, S = G.S; if (!Fo.has('maravilha', 'romano', N) && Fo.def) Fo.def('maravilha', 'romano', (0, eval)('(' + gen + ')'), [N]);
      const set = [...S.settlements.values()].find(s => s.name === 'Roma') || [...S.settlements.values()].find(s => G.Civ.idOfFac(s.fac) === 'romano');
      let b = null; G.inSim++; try { b = set && G.Village.handFound ? G.Village.handFound(set, 'maravilha', 'maravilha', { built: false }) : null; } finally { G.inSim--; }
      if (!b) return { err: 'a mão do deus não fundou a obra' };
      b.progress = 0.5; if (G.FX && G.FX.list) G.FX.list.length = 0;
      G.Render.centerOn(b.x + b.w / 2, b.y + b.h / 2 + 1, 1.25); window.__VIS.f(3);
      const F = Fo.of('maravilha', b.style || 'romano', b.w);
      return { w: b.w, built: b.built, h: G.Render.siteH ? G.Render.siteH(b) : null, top: F ? F.top * Fo.ZPX : null };
    }, [LIB.coliseuTeste.toString(), LIB.N]).catch(e => ({ err: e.message }));
    if (o6.err) ok('6: a obra do Coliseu pela metade', false, o6.err);
    else {
      await shot(r.pinta && o6.h !== null ? 'deus-coliseu-obra' : 'antes-deus-coliseu-obra');
      if (o6.h !== null) ok('6: a obra do Coliseu pela metade, da altura da forma', !o6.built && o6.top !== null && Math.abs(o6.h - o6.top) < 0.01, `a obra de ${o6.w} casas: o andaime a ${o6.h.toFixed(1)} px (a forma desse tamanho: ${o6.top === null ? 'nenhuma' : o6.top.toFixed(1) + ' px'})`);
    }
    const mod6 = await page.evaluate(() => (G.modErr ? Object.keys(G.modErr) : [])); for (const k of mod6) if (!after.mod.includes(k)) after.mod.push(k);
    ok('5: nenhum erro', !errs.length && !after.mod.length, errs.length || after.mod.length ? errs.slice(0, 4).join(' | ') + ' ' + after.mod.join(',') : 'nenhum erro de página nem de módulo');
  } catch (e) { ok('a prova', false, e.message); }
  finally { await browser.close(); }
  console.log(`(${((Date.now() - t0) / 1000).toFixed(0)} s; fotos em ${OUT})`);
  console.log(fails.length ? `FALHOU: ${fails.length}` : 'PASSOU');
  process.exit(fails.length ? 1 : 0);
})();
