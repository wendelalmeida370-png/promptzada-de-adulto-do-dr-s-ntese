// festa-fotos: bash qa/navegador.sh node qa/visual/festa-fotos.js PASTA [celular|pc] (sem o aparelho, os dois) — a festa das mesas (a frente F, D-950 a D-959),
// para ver e para provar. Cada momento das Tabuletas e do copo, em pequenas sequências de fotos, no celular do dono (411 × 724, o toque,
// a tela 2×) e no PC (1280 × 760): a tabuleta que voa e bate na mesa, o suspense e a virada, a rodada ganha (a terceira seguida), a
// perdida, o empate; a vitória com aposta (as moedas à bolsa, a taverna que aplaude) e a seco, a derrota com a revanche, o fim de quem
// largou a mesa (o «10 × 8» do dono); no copo, os dados contados um a um, o «Cravou!», o dado que voa, o último dado, o pote ganho, a
// derrota, quem largou a mesa e a partida que parou. Prova:
//   - nenhum erro de página nem aviso no console;
//   - os sons pedidos pelos nomes da tabela do G.Audio.ui (espiado) e os de cada momento; e o pico de cada som de tela, tocado num contexto
//     sem alto-falante (G.Audio.pico), e o da vitória inteira juntos: nenhum estoura;
//   - o título certo para cada fim — cada «por» das Tabuletas com quem venceu, quem perdeu e ninguém, e cada fim do copo —, nunca «Empate»
//     numa partida interrompida;
//   - as partículas de volta a zero depois de cada festa, e nada rodando com a tela fechada no meio dela (nenhuma partícula, moeda, número
//     subindo nem som depois de fechar);
//   - a taverna aplaude só com gente acordada na sala; o teto das partículas do celular; quem pede menos movimento vê menos;
//   - no PC, o tempo de cada quadro durante a festa (e o do desenho da camada).
// O mundo não muda: a mão das fotos troca as perguntas da tela (o corpo, o modo, a partida) por retratos feitos aqui — partidas de verdade
// da regra das Tabuletas, uma leitura do copo no formato do G.JogoDados.corpo — e nada é pedido ao mundo. Os sons não tocam (no navegador
// sem cabeça ninguém aperta o play): confere-se o pedido. Grava PASTA/<aparelho>/NN-momento.png e a folha de cada aparelho.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '../..');
const OUT = process.argv[2] || path.join(require('os').tmpdir(), 'festa-fotos'); fs.mkdirSync(OUT, { recursive: true });
const QUAIS = process.argv[3] || 'ambos'; const DEVS = QUAIS === 'pc' ? ['pc'] : QUAIS === 'celular' ? ['celular'] : ['celular', 'pc'];
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | festa ${name} | ${info}`); if (!c) fails.push(name); };
const wait = ms => new Promise(r => setTimeout(r, ms));
const hr = () => Date.now(); const t0 = hr();

// ------------------------------ a página: o jogo, a metrópole pronta, a mão das fotos ------------------------------
async function abre(browser, dev, reduz) {
  const pc = dev === 'pc'; const W = pc ? 1280 : 411, H = pc ? 760 : 724; const rm = reduz ? 'reduce' : 'no-preference';
  const ctx = await browser.newContext(pc ? { viewport: { width: W, height: H }, reducedMotion: rm } : { viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: rm });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|WebGL|GL Driver/.test(t)) errs.push('console: ' + t.slice(0, 200)); });
  // (o laço do jogo — o passo do mundo e o desenho dele — parado: só o que a festa pede ao quadro corre — a camada, as contagens, a medida)
  await page.addInitScript(() => { const r0 = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = cb => (cb && (cb.name === 'loop' || cb.name === 'frame') ? 0 : r0(cb)); try { localStorage.clear(); localStorage.setItem('gotaf-guia-tabuletas', '1'); localStorage.setItem('gotaf-guia-copo', '1'); } catch (e) { } }); // (o guia da primeira partida — a frente E — já visto: esta prova é da festa, D-947)
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(700);
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', 'metropole.js') });
  const info = await page.evaluate(pc => {
    G.Save.apply(JSON.parse(G.Ready.data.metropole)); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden');
    G.IncUI.init(); if (!pc) G.Input3D.touch = true;
    // (o espião dos sons: cada pedido da tela, com o que levou e quando)
    window.__sons = []; const ui0 = G.Audio.ui.bind(G.Audio); G.Audio.ui = (n, o) => { window.__sons.push({ n, o: o && typeof o === 'object' ? JSON.parse(JSON.stringify(o)) : o || null, t: performance.now() }); return ui0(n, o); };
    const pl0 = G.Audio.play.bind(G.Audio); G.Audio.play = (n, v, sp) => { window.__sons.push({ n, mundo: 1, t: performance.now() }); return pl0(n, v, sp); };
    // (quem joga: o corpo e o outro, do mesmo povo; a sala cheia — o prédio com mais gente acordada — e uma sala sem ninguém)
    const people = [...G.S.villagers.values()].filter(o => o.age >= 22 && o.age < 60).sort((a, b) => a.id - b.id);
    const v0 = people.find(q => G.Eco.coinRef(q) && G.Depot.get(G.Eco.coinRef(q), 'moedas') >= 0.8) || people[0];
    const o = people.find(q => q.id !== v0.id && G.Fac.idOfV(q) === G.Fac.idOfV(v0)) || people[1];
    const bs = [...G.S.buildings.values()].filter(b => b.built && b.type !== 'ruin');
    // (o mundo pronto pode abrir de madrugada, com todos dormindo: vive até haver uma sala com gente acordada — T-2115)
    for (let k = 0; k < 4000 && !bs.some(b => G.Atmos.awake(b) >= 3); k++) G.debug.step(0.1);
    const cheio = bs.filter(b => G.Atmos.awake(b) >= 3).sort((a, b) => G.Atmos.awake(b) - G.Atmos.awake(a))[0] || null;
    const vazio = bs.find(b => G.Atmos.inside(b) === 0) || null;
    // (o corpo das fotos: a pessoa, num prédio dado — um retrato, nunca uma pessoa do mundo mudada)
    const corpo = b => Object.assign({}, v0, { inside: b ? b.id : 0, sleeping: false });
    // (quatro do mesmo povo para o copo, o corpo o primeiro)
    const fid = G.Fac.idOfV(v0); const P4 = [v0].concat(people.filter(q => q.id !== v0.id && G.Fac.idOfV(q) === fid).slice(0, 3));
    window.__F = { v0, o, cheio, vazio, corpo, P4 }; window.__F.body = corpo(cheio);
    G.Possess.body = () => window.__F.body; G.Modes.inc = () => true; G.Modes.panel = () => false; G.Modes.setPanel = () => { }; G.Modes.panelIs = p => p === window.__painel; G.Input3D.free = () => { };
    G.JogoDados.verbo = () => ({ k: 'chamar', ok: true, apostas: [0.1, 0.2, 0.3, 0.5, 1] });
    // (as Tabuletas: uma partida de verdade da regra, jogada pelas inteligências até a rodada dada — o estado antes dela —, e o retrato que a
    // tela lê, no formato do G.Cartas.doCorpo)
    const C = G.Cartas; const IND = [{ ousado: 0.5 }, { ousado: 0.5 }];
    const joga = s => { C.abre(s); for (let k = 0; k < 2; k++) { const i = C.vez(s); if (i < 0) break; C.joga(s, i, C.ia(s, i, IND[i])); } return C.resolve(s); };
    // (cada rodada com a visão de antes dela: sem ela, os dois lances na ordem de sempre — a escolha da prova é a da regra)
    const hist = (seed, civ) => { const s = C.nova({ id: 1, seed, civ, aposta: 0.2 }); const hs = []; for (let r = 0; r < 7 && !s.fim; r++) { const vis = s.vis; const h = joga(s); hs.push({ w: h.w, vis }); } return hs; };
    const ate = (seed, civ, r, jogo) => { const s = C.nova({ id: jogo, seed, civ, aposta: 0.2 }); for (let k = 0; k < r; k++) joga(s); C.abre(s); return s; };
    const mk = (s, jogo, civ) => ({ jogo, me: 0, ai: 1, o: o.id, fase: s.fim ? 'fim' : 'jogo', r: s.r, of: C.OF.slice(), pote: 0.4 * s.x, aposta: 0.2, x: s.x, mao: s.p[0].mao.slice(), monte: [s.p[0].monte.length, s.p[1].monte.length], maoOutro: s.p[1].mao.length, gl: [s.p[0].gl, s.p[1].gl], potePedras: s.altar, vis: s.vis === 0 ? 'eu' : s.vis === 1 ? 'outro' : '', aberta: null, posta: false, dobra: '', podeDobrar: false, hist: s.hist.slice(-8), fim: s.fim ? Object.assign({}, s.fim, { meu: s.fim.w === 0 ? 1 : s.fim.w === 1 ? -1 : 0 }) : null, civ: s.civ.slice(), bonus: s.p[0].bonus, mal: s.p[0].mal, desc: [s.p[0].desc.length, s.p[1].desc.length], preco: n => G.Falas.price(civ[0], n), moeda: true, baralho: 'baralho.madeira', trap: null, n: s.hist.length, fontes: [], alug: 0, casas: 0 });
    window.__C = { hist, ate, mk, joga, IND };
    return { v: v0.name, o: o.name, cheio: cheio ? `${cheio.type} #${cheio.id} (${G.Atmos.awake(cheio)} acordados)` : null, vazio: vazio ? `${vazio.type} #${vazio.id}` : null, teto: G.JogoFX.teto(), fx: !!G.JogoFX, P4: P4.map(q => q.name) };
  }, pc);
  return { page, ctx, errs, info, pc, W, H, dev };
}

// ------------------------------ as fotos e a folha ------------------------------
function camera(P) {
  const dir = path.join(OUT, P.dev); fs.mkdirSync(dir, { recursive: true }); let k = 0; const fotos = [];
  return { fotos, foto: async (nome) => { k++; const f = path.join(dir, `${String(k).padStart(2, '0')}-${nome}.png`); await P.page.screenshot({ path: f }); fotos.push([nome, f]); return f; } };
}
async function folha(browser, P, fotos) {
  const cols = P.pc ? 4 : 6; const cw = P.pc ? 400 : 200, chh = Math.round(cw * P.H / P.W);
  const html = `<html><body style="margin:0;background:#151210;display:grid;grid-template-columns:repeat(${cols},${cw}px);gap:6px;padding:6px;font:12px sans-serif;color:#ccc">${fotos.map(([n, f]) => `<div><img src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}" style="width:${cw}px;height:${chh}px;display:block"><div>${n}</div></div>`).join('')}</body></html>`;
  const pg = await browser.newPage({ viewport: { width: cols * (cw + 6) + 6, height: 100 } }); await pg.setContent(html); await pg.waitForTimeout(400);
  const f = path.join(OUT, `folha-${P.dev}.png`); await pg.screenshot({ path: f, fullPage: true }); await pg.close(); return f;
}
const sons = (P, desde) => P.page.evaluate(d => window.__sons.filter(x => x.t >= d).map(x => x), desde);
const agora = P => P.page.evaluate(() => performance.now());
// (espera a festa acabar: nenhuma partícula, moeda, contagem nem número subindo — até ms)
const calma = (P, ms) => P.page.waitForFunction(() => G.JogoFX.vivas() === 0 && !G.JogoFX.ativo() && !document.querySelector('.jfx-moeda, .jfx-flutua, .jfx-clarao'), null, { timeout: ms || 9000, polling: 100 }).then(() => true, () => false);

// ------------------------------ as Tabuletas ------------------------------
async function tabuletas(P, cam) {
  const { page } = P; const civ = ['asteca', 'nordico'];
  // (as partidas da regra: a que o corpo vence as três primeiras rodadas, a que perde a segunda, a que empata uma)
  const seeds = await page.evaluate(civ => { const C = window.__C; const out = {};
    for (let seed = 1; seed < 600 && Object.keys(out).length < 3; seed++) { const hs = C.hist(seed, civ);
      if (!out.ganha && hs.length > 3 && hs[0].w === 0 && hs[1].w === 0 && hs[2].w === 0 && hs[2].vis < 0) out.ganha = { seed, r: 2 };
      if (!out.perde && hs.length > 2 && hs[1].w === 1 && hs[1].vis < 0) out.perde = { seed, r: 1 };
      if (!out.empate) { const r = hs.findIndex((h, k) => k > 0 && k < 5 && h.w === -1 && h.vis < 0); if (r > 0) out.empate = { seed, r }; } }
    return out; }, civ);
  ok('t0 as-partidas-da-regra', !!(seeds.ganha && seeds.perde && seeds.empate), JSON.stringify(seeds));
  let jogo = 900;
  const prepara = (q, body) => page.evaluate(([q, civ, jogo, body]) => {
    const F = window.__F; F.body = F.corpo(body === 'vazio' ? F.vazio : F.cheio); window.__painel = 'cartas'; G.CartasUI.close(); G.JogoFX.limpa();
    const s = window.__C.ate(q.seed, civ, q.r, jogo); const view = window.__C.mk(s, jogo, civ); window.__T = { s, view }; G.CartasUI.force = () => window.__T.view;
    G.CartasUI.abrir(jogo); for (const c of document.querySelectorAll('#tab-panel .tb-mao .ct-card')) c.classList.remove('tb-in');
    const id = G.Cartas.ia(s, 0, window.__C.IND[0]); return s.p[0].mao.indexOf(id);
  }, [q, civ, ++jogo, body]);
  const resolve = () => page.evaluate(() => { const T = window.__T; const s = T.s; const C = G.Cartas; const id0 = s.p[0].mao[window.__mi]; for (let k = 0; k < 2; k++) { const i = C.vez(s); if (i < 0) break; C.joga(s, i, i === 0 ? id0 : C.ia(s, i, window.__C.IND[i])); } const h = C.resolve(s); G.CartasUI._test.anima(h); return { w: h.w, ganho: h.ganho, vale: h.vale, ev: h.ev.length }; });
  // a) a rodada ganha — a terceira seguida: a minha voa, bate na mesa, o suspense, a virada, a festa e a glória que sobe
  {
    const i = await prepara(seeds.ganha); await page.evaluate(i => { window.__mi = i; }, i); const t1 = await agora(P);
    await page.evaluate(i => G.CartasUI._test.voa(i), i); await wait(200); await cam.foto('tab-voa');
    await page.waitForSelector('#tab-panel .tb-sm .tb-flip', { timeout: 3000 }).catch(() => null); await wait(40); await cam.foto('tab-pouso');
    const h = await resolve();
    await page.waitForSelector('#tab-panel .tb-slot.tb-tenso', { timeout: 5000 }).catch(() => null); await wait(P.pc ? 250 : 120); await cam.foto('tab-suspense');
    await page.waitForFunction(() => document.querySelectorAll('#tab-panel .tb-slot .tb-flip.open').length >= 2, null, { timeout: 5000 }).catch(() => null); await wait(330); await cam.foto('tab-virada');
    await page.waitForSelector('#tab-panel .tb-slot.tb-ganha', { timeout: 15000 }).catch(() => null); await wait(260); await cam.foto('tab-ganha');
    await page.waitForSelector('.jfx-flutua', { timeout: 5000 }).catch(() => null); await wait(200); await cam.foto('tab-gloria-sobe');
    const seg = await page.evaluate(() => (document.querySelector('#tab-panel .tb-seguidas') || {}).textContent || '');
    await calma(P, 9000); const L = await sons(P, t1); const nomes = L.map(x => x.n);
    const g = L.find(x => x.n === 'rodada-ganha');
    ok('t1 a-rodada-ganha', h.w === 0 && nomes.includes('pouso') && nomes.includes('suspense') && nomes.includes('cartas-virar') && !!g && g.o && g.o.n === 3 && nomes.filter(n => n === 'gloria-tique').length >= 1 && /Três seguidas/.test(seg),
      `a terceira rodada ganha seguida (+${h.ganho} de glória, ${h.ev} poderes): «${seg}»; os sons: ${[...new Set(nomes)].join(', ')} — o acorde com n ${g && g.o ? g.o.n : '?'}`);
  }
  // b) a rodada perdida: o baque abafado, a tabuleta que escurece
  {
    const i = await prepara(seeds.perde); await page.evaluate(i => { window.__mi = i; }, i); const t1 = await agora(P);
    await page.evaluate(i => G.CartasUI._test.voa(i), i); await page.waitForSelector('#tab-panel .tb-sm .tb-flip', { timeout: 3000 }).catch(() => null);
    const h = await resolve(); await page.waitForSelector('#tab-panel .tb-slot.tb-perde', { timeout: 15000 }).catch(() => null); await wait(380); await cam.foto('tab-perde');
    await calma(P, 9000); const nomes = (await sons(P, t1)).map(x => x.n);
    ok('t2 a-rodada-perdida', h.w === 1 && nomes.includes('rodada-perdida') && !nomes.includes('rodada-ganha') && !nomes.includes('gloria-tique'), `perdida (${h.ganho} de glória para o outro): ${[...new Set(nomes)].join(', ')}`);
  }
  // c) o empate da rodada: as duas em prata, a oferenda fica no altar
  {
    const i = await prepara(seeds.empate); await page.evaluate(i => { window.__mi = i; }, i); const t1 = await agora(P);
    await page.evaluate(i => G.CartasUI._test.voa(i), i); await page.waitForSelector('#tab-panel .tb-sm .tb-flip', { timeout: 3000 }).catch(() => null);
    const h = await resolve(); await page.waitForSelector('#tab-panel .tb-slot.tb-empata', { timeout: 15000 }).catch(() => null); await wait(420); await cam.foto('tab-empate');
    await calma(P, 9000); const nomes = (await sons(P, t1)).map(x => x.n);
    ok('t3 o-empate-da-rodada', h.w === -1 && nomes.includes('rodada-empate'), `empate (${h.vale} fica no altar): ${[...new Set(nomes)].join(', ')}`);
  }
  // o fim: a vista de fim de uma partida (o que o mundo diria), com a glória e o pote dados
  const fim = (o, body) => page.evaluate(([o, civ, jogo, body]) => {
    const F = window.__F; F.body = F.corpo(body === 'vazio' ? F.vazio : F.cheio); window.__painel = 'cartas'; G.CartasUI.close(); G.JogoFX.limpa();
    const s = window.__C.ate(4, civ, 3, jogo); const view = Object.assign(window.__C.mk(s, jogo, civ), { gl: o.gl, fim: o.fim, pote: 0, aposta: o.aposta, moeda: o.aposta > 0, x: 1 });
    window.__T = { s, view }; G.CartasUI.force = () => window.__T.view; G.CartasUI.abrir(jogo); G.CartasUI._test.view = view; G.CartasUI._test.render();
    const h3 = document.querySelector('#tab-panel .tb-end h3'); const sc = document.querySelector('#tab-panel .tb-end .tb-score');
    const btns = [...document.querySelectorAll('#tab-panel .tb-end .tb-sbtns button')].map(b => b.textContent.trim());
    const quem = G.Possess.knows.call(F.body, F.o); return { h3: h3 ? h3.textContent : '', score: sc ? sc.textContent.replace(/\s+/g, ' ').trim() : '', btns, quem: quem.charAt(0).toUpperCase() + quem.slice(1), primeiro: (document.querySelector('#tab-panel .tb-end .tb-sbtns .tb-go') || {}).textContent || '' };
  }, [o, civ, ++jogo, body]);
  // d) a vitória com aposta, com gente na sala: o sol e os raios, os confetes, a fanfarra, a glória contando, as moedas voando à bolsa, os aplausos
  let medida = null;
  {
    const t1 = await agora(P);
    await page.evaluate(() => { window.__vmax = 0; window.__amostra = setInterval(() => { window.__vmax = Math.max(window.__vmax, G.JogoFX.vivas()); }, 40); });
    const r = await fim({ gl: [12, 7], fim: { w: 0, por: 'gloria', meu: 1 }, aposta: 0.2 });
    await wait(130); await cam.foto('tab-vitoria-1'); await wait(450); await cam.foto('tab-vitoria-2'); await wait(700); await cam.foto('tab-vitoria-3');
    await wait(900); await cam.foto('tab-vitoria-4'); await wait(1300); await cam.foto('tab-vitoria-5');
    const vmax = await page.evaluate(() => { clearInterval(window.__amostra); return window.__vmax; });
    const zero = await calma(P, 9000); const L = await sons(P, t1); const nomes = L.map(x => x.n);
    const moedas = L.filter(x => x.n === 'moeda-bolsa'); const ultima = moedas.length && moedas[moedas.length - 1].o && moedas[moedas.length - 1].o.ultima;
    const bolsa = await page.evaluate(() => (document.querySelector('#tab-panel .tb-bolsa-v b') || {}).textContent || ''); r.score = await page.evaluate(() => document.querySelector('#tab-panel .tb-end .tb-score').textContent.replace(/\s+/g, ' ').trim()); // (o placar depois de contar)
    const ap = await page.evaluate(() => (document.querySelector('#tab-panel .tb-aplausos.on') || {}).textContent || '');
    ok('t4 a-vitoria-com-aposta', r.h3 === 'Vitória!' && /12/.test(r.score) && nomes.includes('vitoria-fanfarra') && nomes.filter(n => n === 'gloria-tique').length >= 3 && moedas.length >= 3 && !!ultima && nomes.includes('aplauso') && !!ap && r.primeiro === 'Jogar de novo',
      `«${r.h3}» ${r.score}; ${nomes.filter(n => n === 'gloria-tique').length} tiques da glória, ${moedas.length} moedas à bolsa (a última com o baque da bolsa: ${ultima ? 'sim' : 'NÃO'}), a bolsa em «${bolsa}»; «${ap || 'SEM APLAUSO'}»; os botões ${r.btns.join(' | ')}; no máximo ${vmax} partículas no ar (o teto ${P.info.teto})`);
    ok('t5 as-particulas-voltam-a-zero', zero && vmax <= P.info.teto && vmax > 30, `depois da festa: ${zero ? 'nada no ar, nada contando' : 'AINDA HÁ FESTA'}; o máximo no ar ${vmax} de um teto de ${P.info.teto}`);
  }
  // (no PC, o quadro durante a festa, sem fotos no meio: o intervalo entre os quadros e o tempo do desenho da camada)
  if (P.pc) {
    await page.evaluate(() => { window.__q = []; window.__vmax = 0; let last = 0; window.__medindo = true; G.JogoFX.medidaZera(); const f = ts => { if (last) window.__q.push(ts - last); last = ts; window.__vmax = Math.max(window.__vmax, G.JogoFX.vivas()); if (window.__medindo) requestAnimationFrame(f); }; requestAnimationFrame(f); });
    await fim({ gl: [12, 7], fim: { w: 0, por: 'gloria', meu: 1 }, aposta: 0.2 }); await wait(3500);
    const m = await page.evaluate(() => { window.__medindo = false; const q = window.__q.slice().sort((a, b) => a - b); const at = k => q[Math.min(q.length - 1, Math.floor(q.length * k))] || 0; return { n: q.length, p50: Math.round(at(0.5) * 10) / 10, p95: Math.round(at(0.95) * 10) / 10, max: Math.round((q[q.length - 1] || 0) * 10) / 10, desenho: G.JogoFX.medida(), vmax: window.__vmax }; });
    medida = m; await calma(P, 9000);
    // (o que é da festa é o desenho da camada — nunca um quadro inteiro —; o intervalo entre os quadros é também da máquina: com ela ocupada
    // por outros navegadores, só se relata, com a carga — T-2113)
    const carga = require('os').loadavg()[0].toFixed(1);
    ok('t6 o-quadro-na-festa', m.n > 10 && m.desenho.media < 4 && m.desenho.max < 16, `${m.n} quadros em 3,5 s de festa (${m.vmax} partículas no máximo; a carga da máquina ${carga} em ${require('os').cpus().length} núcleos): o intervalo mediano ${m.p50} ms, o de 95% ${m.p95} ms, o maior ${m.max} ms; o desenho da camada ${m.desenho.media} ms em média, ${m.desenho.max} ms no pior quadro`);
  }
  void medida;
  // e) a vitória a seco, numa sala vazia: sem moedas, sem aplauso
  {
    const t1 = await agora(P); const r = await fim({ gl: [9, 4], fim: { w: 0, por: 'gloria', meu: 1 }, aposta: 0 }, 'vazio');
    await wait(1400); await cam.foto('tab-vitoria-a-seco'); await calma(P, 9000); const nomes = (await sons(P, t1)).map(x => x.n);
    ok('t7 a-vitoria-a-seco-e-a-sala-vazia', r.h3 === 'Vitória!' && nomes.includes('vitoria-fanfarra') && !nomes.includes('moeda-bolsa') && !nomes.includes('aplauso'), `«${r.h3}» ${r.score}: ${[...new Set(nomes)].join(', ')} — sem moedas e sem aplauso (ninguém na sala)`);
  }
  // f) a derrota: curta e quente, a revanche primeiro
  {
    const t1 = await agora(P); const r = await fim({ gl: [8, 10], fim: { w: 1, por: 'gloria', meu: -1 }, aposta: 0.2 });
    await wait(700); await cam.foto('tab-derrota'); await calma(P, 4000); const nomes = (await sons(P, t1)).map(x => x.n);
    ok('t8 a-derrota-e-a-revanche', r.h3 === 'Derrota' && r.btns[0] === 'Revanche!' && nomes.includes('derrota-suave') && !nomes.includes('vitoria-fanfarra') && !nomes.includes('moeda-bolsa'), `«${r.h3}» ${r.score}, os botões ${r.btns.join(' | ')}; ${[...new Set(nomes)].join(', ')}`);
  }
  // g) o título de cada fim (o por das Tabuletas): quem venceu, quem perdeu, ninguém — e o caso do dono, o outro que largou a mesa no 10 × 8
  {
    const L = await page.evaluate(() => { const out = []; for (const por of ['gloria', 'recusa', 'desiste', 'trapaca', 'abandono', 'fechou', 'sumiu', 'sem-moeda', 'sem-baralho', 'sem-aluguel']) for (const meu of [1, -1, 0]) { const gl = por === 'gloria' && meu === 0 ? [9, 9] : [10, 8]; out.push(Object.assign({ por, meu }, G.CartasUI.fimDe({ por, w: meu > 0 ? 0 : meu < 0 ? 1 : -1, meu }, 'Nezahualcóyotl', gl))); } return out; });
    const bad = L.filter(x => (x.meu === 0 && x.por !== 'gloria' && (/Empate/.test(x.tit) || x.tipo !== 'int' || !/^Partida (interrompida|desfeita)$/.test(x.tit))) || (x.meu === 0 && x.por === 'gloria' && x.tit !== 'Empate')
      || (x.meu > 0 && !/^Vitória/.test(x.tit)) || (x.meu < 0 && !/^(Derrota|Pego na trapaça)/.test(x.tit)) || (x.meu > 0 && ['recusa', 'desiste', 'trapaca', 'abandono'].includes(x.por) && !x.tit.includes('Nezahualcóyotl')));
    const ab1 = L.find(x => x.por === 'abandono' && x.meu === 1), ab0 = L.find(x => x.por === 'abandono' && x.meu === 0);
    // (a causa de quem largou a partida do corpo, que o mundo diz — D-966: o desmaio é vitória; a morte, sem festa)
    const ca = await page.evaluate(() => ({ desmaio: G.CartasUI.fimDe({ por: 'abandono', w: 0, meu: 1, causa: 'desmaio' }, 'Nezahualcóyotl', [10, 8]), morreu: G.CartasUI.fimDe({ por: 'abandono', w: 0, meu: 1, causa: 'morreu' }, 'Nezahualcóyotl', [10, 8]) }));
    if (!(ca.desmaio.tipo === 'win' && ca.desmaio.tit === 'Vitória — Nezahualcóyotl apagou na mesa' && ca.morreu.tipo === 'int' && ca.morreu.tit === 'Partida encerrada' && /morreu à mesa/.test(ca.morreu.sub))) bad.push({ por: 'abandono/causa', tit: `${ca.desmaio.tit} | ${ca.morreu.tit}` });
    const d0 = await fim({ gl: [10, 8], fim: { w: -1, por: 'abandono', meu: 0 }, aposta: 0.2 }); await wait(500); await cam.foto('tab-fim-interrompida');
    const d1 = await fim({ gl: [10, 8], fim: { w: 0, por: 'abandono', meu: 1 }, aposta: 0.2 }); await wait(900); await cam.foto('tab-fim-largou-a-mesa');
    await calma(P, 9000);
    ok('t9 o-titulo-de-cada-fim', !bad.length && ab1.tit === 'Vitória — Nezahualcóyotl largou a mesa' && ab0.tit === 'Partida interrompida' && d0.h3 === 'Partida interrompida' && /quando parou/.test(d0.score) && d1.h3 === `Vitória — ${d1.quem} largou a mesa`,
      `${L.length} fins conferidos${bad.length ? ', ERRADOS: ' + bad.map(x => `${x.por}/${x.meu}: «${x.tit}»`).join('; ') : ''}; o caso do dono (o outro largou a mesa no 10 × 8): «${d0.h3}» — ${d0.score}; com o pote de quem ficou (a frente N): «${d1.h3}»`);
  }
  // h) a tela fechada no meio da festa: nada fica rodando, nada soa depois
  {
    await fim({ gl: [12, 7], fim: { w: 0, por: 'gloria', meu: 1 }, aposta: 0.2 }); await wait(1300);
    const fechou = await page.evaluate(() => { const antes = { vivas: G.JogoFX.vivas(), moedas: document.querySelectorAll('.jfx-moeda').length }; G.CartasUI.close(); return Object.assign(antes, { t: performance.now() }); });
    await wait(160); const r = await page.evaluate(() => ({ vivas: G.JogoFX.vivas(), ativo: G.JogoFX.ativo(), dom: document.querySelectorAll('.jfx-moeda, .jfx-flutua, .jfx-clarao, .jfx-raios').length }));
    await wait(2600); const depois = (await sons(P, fechou.t + 40)).map(x => x.n);
    ok('t10 a-tela-fechada-no-meio-da-festa', fechou.vivas > 0 && r.vivas === 0 && !r.ativo && !r.dom && !depois.length, `fechada com ${fechou.vivas} partículas e ${fechou.moedas} moedas no ar: depois, ${r.vivas} partículas, ${r.ativo ? 'ALGO CORRE' : 'nada correndo'}, ${r.dom} restos na página; ${depois.length ? 'SONS DEPOIS: ' + depois.join(', ') : 'nenhum som depois'}`);
  }
}

// ------------------------------ o copo ------------------------------
async function copo(P, cam) {
  const { page } = P;
  // (a leitura do copo, no formato do G.JogoDados.corpo: quatro à mesa, o corpo o primeiro; o momento e o resultado dados)
  const poe = (o) => page.evaluate(o => {
    const F = window.__F; const P4 = F.P4.slice(0, o.n || 4); const me = P4[0]; window.__painel = 'dados'; F.body = F.corpo(o.vazio ? F.vazio : F.cheio);
    const nm = ['Você'].concat(P4.slice(1).map(v => G.Possess.knows.call(F.body, v)));
    const now = G.S.clock; const tema = o.tema || 'romano';
    const s = { op: o.op, b: o.vazio ? (F.vazio ? F.vazio.id : 0) : F.cheio ? F.cheio.id : 0, g: 'x', fase: o.fase, t: now, ate: now + 1, now, rodada: o.rodada || 3, host: P4[1].id, euHost: false, eu: me.id, jogo: o.jogo === undefined ? 1 : o.jogo,
      jogadores: P4.map((v, i) => ({ id: v.id, nome: nm[i], eu: i === 0, n: (o.ns || [2, 2, 2, 1])[i], fora: (o.foras || [])[i] || '', palpite: (o.bids || [])[i] === undefined ? null : o.bids[i], faces: (o.faces || [])[i] || null, olho: 'atento', convite: '' })),
      ordem: P4.map(v => v.id).slice(1).concat([me.id]), vez: 0, livres: [], faixa: [P4.length, 6 * P4.length * 2], espero: 18, aposta: 0.3, moeda: true, pote: o.pote === undefined ? 1.2 : o.pote, apostas: [0.1, 0.2, 0.3, 0.5, 1], convite: [],
      res: o.res ? Object.assign({ dist: {}, trap: null }, o.res, { cravou: o.res.cravou === undefined ? 0 : P4[o.res.cravou].id, queimou: (o.res.queimou || []).map(i => P4[i].id) }) : null,
      armado: false, trapacaOk: false, olhos: 3, risco: 0.4, venc: o.venc === undefined ? 0 : o.venc === -1 ? -1 : P4[o.venc].id, fim: o.fim || '', ganho: o.ganho || 0,
      set: { k: 'dados.osso', mat: 'osso', meus: false, de: 'dados da casa, emprestados' }, torneio: null, tema, copo: 'couro', price: x => G.Falas.price(tema, x), hist: [] };
    window.__S = s; G.JogoDados.corpo = () => window.__S; clearInterval(window.__tick); G.JogoDadosUI.close(); G.JogoFX.limpa(); G.JogoDadosUI.force = { tema }; G.JogoDadosUI.open(true); G.JogoDadosUI.render(s, 0);
    window.__tick = setInterval(() => { if (window.__S) G.JogoDadosUI.render(window.__S, 1 / 30); }, 33); return { me: me.name, nomes: nm };
  }, o);
  const para = () => page.evaluate(() => clearInterval(window.__tick));
  // a) os dados contados um a um, e o «Cravou!» do corpo: o carimbo, o anel, a festa; os dados dos outros voando da mesa
  {
    const t1 = await agora(P);
    await poe({ op: 501, fase: 'revela', faces: [[5, 3], [4, 2], [6, 6], [3]], bids: [29, 21, 26, 23], res: { total: 29, cravou: 0, queimou: [1, 2, 3] } });
    await page.waitForFunction(() => (G.JogoDadosUI.scene() || {}).nCont >= 4, null, { timeout: 6000 }).catch(() => null); await cam.foto('copo-contando');
    await page.waitForSelector('#dados-panel .jd-res.crava', { timeout: 6000 }).catch(() => null); await wait(300); await cam.foto('copo-cravou');
    await page.waitForFunction(() => Object.keys((G.JogoDadosUI.scene() || {}).voou || {}).length >= 2, null, { timeout: 6000 }).catch(() => null); await wait(260); await cam.foto('copo-dados-voam');
    await wait(900); await para(); const L = await sons(P, t1); const nomes = L.map(x => x.n);
    const contas = L.filter(x => x.n === 'dado-conta'); const soma = await page.evaluate(() => (document.querySelector('#dados-panel .jd-soma b') || {}).textContent);
    ok('c1 os-dados-contados-e-o-cravou', contas.length >= 6 && contas.every((x, k) => !k || x.o.i > contas[k - 1].o.i) && soma === '29' && nomes.includes('cravou') && nomes.includes('rodada-ganha') && nomes.filter(n => n === 'dado-voa').length === 3,
      `${contas.length} dados contados um a um (a nota subindo: ${contas.map(x => x.o.i).join(',')}), a soma ${soma}; ${[...new Set(nomes)].join(', ')}`);
  }
  // b) o dado do corpo perdido: voa do lado dele, o tranco e o «−1 dado»
  {
    const t1 = await agora(P);
    await poe({ op: 502, fase: 'revela', faces: [[2, 1], [4, 2], [6, 6], [3]], bids: [15, 21, 24, 26], res: { total: 24, cravou: 2, queimou: [0, 1, 3] } });
    const fl = await page.waitForSelector('.jfx-flutua.jfx-perde', { timeout: 8000 }).then(h => h.textContent(), () => ''); await wait(160); await cam.foto('copo-perde-um-dado'); await wait(1200); await para();
    const nomes = (await sons(P, t1)).map(x => x.n);
    ok('c2 o-dado-perdido-voa', fl === '−1 dado' && nomes.includes('dado-voa') && nomes.includes('cravou') && !nomes.includes('rodada-ganha'), `«${fl}» do lado do corpo; ${[...new Set(nomes)].join(', ')}`);
  }
  // c) o último dado: o coração antes de os copos subirem, a borda vermelha, a bolinha que bate
  {
    const t1 = await agora(P);
    await poe({ op: 503, fase: 'segura', ns: [1, 2, 1, 1], faces: [[4], null, null, null], bids: [12, 15, 9, 11] });
    await wait(820); await cam.foto('copo-ultimo-dado'); await wait(1300); await para();
    const nomes = (await sons(P, t1)).map(x => x.n); const ult = await page.evaluate(() => !!document.querySelector('#dados-panel .jd-seat.eu.ultimo'));
    ok('c3 o-ultimo-dado', nomes.includes('suspense') && nomes.filter(n => n === 'tensao').length >= 2 && ult, `${nomes.filter(n => n === 'tensao').length} batidas do coração, o suspense; a bolinha do corpo ${ult ? 'batendo' : 'PARADA'}`);
  }
  // d) o pote ganho: o cartão do fim, a festa, as moedas da mesa à bolsa, a taverna que aplaude
  {
    const t1 = await agora(P); await page.evaluate(() => { window.__vmax = 0; window.__amostra = setInterval(() => { window.__vmax = Math.max(window.__vmax, G.JogoFX.vivas()); }, 40); });
    await poe({ op: 504, fase: 'fim', ns: [1, 0, 0, 0], foras: ['', 'queimou', 'queimou', 'queimou'], faces: [[6, 3], null, null, null], bids: [9, 7, null, null], res: { total: 9, cravou: 0, queimou: [1] }, venc: 0, fim: 'cravou', ganho: 1.2, pote: 0 });
    await wait(160); await cam.foto('copo-pote-1'); await wait(650); await cam.foto('copo-pote-2'); await wait(900); await cam.foto('copo-pote-3'); await wait(1400); await cam.foto('copo-pote-4');
    await para(); const vmax = await page.evaluate(() => { clearInterval(window.__amostra); return window.__vmax; });
    const zero = await calma(P, 9000); const L = await sons(P, t1); const nomes = L.map(x => x.n); const moedas = L.filter(x => x.n === 'moeda-bolsa');
    const r = await page.evaluate(() => ({ t: (document.querySelector('#dados-panel .jd-fim-tit') || {}).textContent || '', b: (document.querySelector('#dados-panel .jd-fim-bolsa b') || {}).textContent || '', ap: (document.querySelector('#dados-panel .jd-fim-ap.on') || {}).textContent || '', btn: [...document.querySelectorAll('#dados-panel .jd-fim-btns button')].map(b => b.textContent.trim()) }));
    ok('c4 o-pote-ganho', r.t === 'Vitória!' && nomes.includes('vitoria-fanfarra') && moedas.length >= 3 && !!(moedas[moedas.length - 1].o || {}).ultima && nomes.includes('aplauso') && !!r.ap && r.btn[1] === 'Jogar de novo' && zero && vmax <= P.info.teto,
      `«${r.t}», a bolsa em «${r.b}», ${moedas.length} moedas; «${r.ap || 'SEM APLAUSO'}»; ${r.btn.join(' | ')}; ${vmax} partículas no máximo, ${zero ? 'e depois nada no ar' : 'E A FESTA NÃO PAROU'}`);
  }
  // e) a derrota no copo: a revanche primeiro; f) quem largou a mesa (o pote de quem ficou); g) todos sem dados juntos: o empate
  {
    const t1 = await agora(P);
    await poe({ op: 505, fase: 'fim', ns: [0, 0, 1, 0], foras: ['queimou', 'queimou', '', 'queimou'], venc: 2, fim: 'sobrou', ganho: 0, pote: 0 }); await wait(700); await cam.foto('copo-derrota');
    const r1 = await page.evaluate(() => ({ t: document.querySelector('#dados-panel .jd-fim-tit').textContent, btn: [...document.querySelectorAll('#dados-panel .jd-fim-btns button')].map(b => b.textContent.trim()) }));
    await poe({ op: 506, n: 2, fase: 'fim', ns: [2, 0], foras: ['', 'saiu'], venc: 0, fim: 'sobrou', ganho: 0.6, pote: 0 }); await wait(1500); await cam.foto('copo-largou-a-mesa');
    const r2 = await page.evaluate(() => document.querySelector('#dados-panel .jd-fim-tit').textContent);
    const quem = await page.evaluate(() => { const q = G.Possess.knows.call(window.__F.body, window.__F.P4[1]); return q.charAt(0).toUpperCase() + q.slice(1); });
    await poe({ op: 507, n: 2, fase: 'fim', ns: [0, 0], foras: ['queimou', 'queimou'], venc: -1, fim: 'sobrou', ganho: 0, pote: 0 }); await wait(500);
    const r3 = await page.evaluate(() => document.querySelector('#dados-panel .jd-fim-tit').textContent); await para(); await calma(P, 9000);
    const nomes = (await sons(P, t1)).map(x => x.n);
    ok('c5 a-derrota-quem-largou-e-o-empate', r1.t === 'Derrota' && r1.btn[0] === 'Revanche!' && r2 === `Vitória — ${quem} largou a mesa` && r3 === 'Empate' && nomes.includes('derrota-suave'), `«${r1.t}» (${r1.btn.join(' | ')}); «${r2}»; todos sem dados na mesma rodada: «${r3}»`);
  }
  // h) a partida que some da mesa no meio: o fim diz «Partida interrompida», e os títulos de cada fim do copo
  {
    await poe({ op: 508, fase: 'palpite', faces: [[3, 4], null, null, null], bids: [null, 14, null, null] }); await para();
    const r = await page.evaluate(() => { G.JogoDadosUI.frame(1 / 30); window.__S = null; G.JogoDadosUI.frame(1 / 30); const t = document.querySelector('#dados-panel .jd-fim-tit'); return { t: t ? t.textContent : '', sub: (document.querySelector('#dados-panel .jd-fim-sub') || {}).textContent || '', aberto: G.JogoDadosUI.isOpen() }; });
    await wait(500); await cam.foto('copo-partida-interrompida');
    const L = await page.evaluate(() => { const F = window.__F; const P4 = F.P4; const base = { b: 0, eu: P4[0].id, jogadores: P4.map((v, i) => ({ id: v.id, nome: i ? v.name : 'Você', eu: !i, n: 1, fora: '' })) };
      const f = (o, por) => G.JogoDadosUI.fimDe(Object.assign({}, base, o), por);
      return { cravou: f({ venc: P4[0].id, fim: 'cravou' }), perde: f({ venc: P4[1].id, fim: 'cravou' }), empate: f({ venc: -1, fim: 'sobrou' }), vazio: f({ venc: -1, fim: 'vazio' }), parou: f({ venc: 0, fim: '' }, 'parou'),
        // (o porquê do mundo numa partida desfeita, pelo G.JogoDados.parou — D-966)
        porque: f({ venc: 0, fim: '', motivo: 'o dono levou os dados' }, 'parou'), levou: f({ venc: P4[0].id, fim: 'sobrou', motivo: 'o dono levou os dados' }) }; });
    ok('c6 a-partida-que-parou-e-os-fins-do-copo', r.aberto && r.t === 'Partida interrompida' && /cada um leva o que pôs/.test(r.sub) && L.cravou.tit === 'Vitória!' && L.perde.tit === 'Derrota' && L.empate.tit === 'Empate' && L.vazio.tit === 'Partida interrompida' && L.parou.tit === 'Partida interrompida' && !/Empate/.test(L.vazio.tit + L.parou.tit)
      && /^O dono levou os dados: cada um leva o que pôs/.test(L.porque.sub) && L.levou.tipo === 'win' && /^O dono levou os dados: o pote ficou com quem tinha mais dados/.test(L.levou.sub),
      `a partida sumiu da mesa no meio: «${r.t}» — ${r.sub}; cravou «${L.cravou.tit}», perdeu «${L.perde.tit}», todos sem dados «${L.empate.tit}», ninguém ficou «${L.vazio.tit}», parou «${L.parou.tit}»`);
    await page.evaluate(() => { G.JogoDadosUI.close(); G.JogoFX.limpa(); });
  }
  // h2) «Jogar de novo» apertado com a mesa ainda no fim: espera a mesa ficar livre («Chamando a mesa…»); sem com quem jogar, o botão volta e
  // o porquê é o do mundo (L-2212: no fim o verbo da mesa é «jogo» ou «olhar», nunca «chamar»)
  {
    await poe({ op: 510, fase: 'fim', ns: [1, 0, 0, 0], foras: ['', 'queimou', 'queimou', 'queimou'], venc: 0, fim: 'cravou', ganho: 0.6, pote: 0 }); await para(); await wait(300);
    const r = await page.evaluate(async () => { const JD = G.JogoDados; const v0 = JD.verbo; const b = () => document.querySelector('#dados-panel .jd-fim [data-a="denovo"]');
      JD.verbo = () => ({ k: 'olhar', ok: true }); b().click(); const espera = { t: b().textContent, d: b().disabled };
      JD.verbo = () => ({ k: 'chamar', ok: false, why: 'Não há ninguém à sua mesa para jogar.' }); G.JogoDadosUI.frame(1 / 30);
      const volta = { t: b().textContent, d: b().disabled }; const toast = [...document.querySelectorAll('.ih-toast')].some(e => /Não há ninguém à sua mesa/.test(e.textContent)); JD.verbo = v0; return { espera, volta, toast }; });
    ok('c8 o-de-novo-espera-a-mesa', r.espera.t === 'Chamando a mesa…' && r.espera.d && r.volta.t === 'Jogar de novo' && !r.volta.d && r.toast, `apertado no fim: «${r.espera.t}»${r.espera.d ? ' (esperando)' : ''}; sem com quem jogar: «${r.volta.t}»${r.volta.d ? ' PRESO' : ''}, e o porquê ${r.toast ? 'dito' : 'CALADO'}`);
    await page.evaluate(() => { G.JogoDadosUI.close(); G.JogoFX.limpa(); });
  }
  // i) a tela do copo fechada no meio da festa
  {
    await poe({ op: 509, fase: 'fim', ns: [1, 0, 0, 0], foras: ['', 'queimou', 'queimou', 'queimou'], venc: 0, fim: 'cravou', ganho: 1.2, pote: 0 }); await wait(900);
    const fechou = await page.evaluate(() => { const antes = G.JogoFX.vivas(); clearInterval(window.__tick); G.JogoDadosUI.close(); return { vivas: antes, t: performance.now() }; });
    await wait(160); const r = await page.evaluate(() => ({ vivas: G.JogoFX.vivas(), ativo: G.JogoFX.ativo(), dom: document.querySelectorAll('.jfx-moeda, .jfx-flutua, .jfx-clarao, .jfx-raios').length }));
    await wait(2400); const depois = (await sons(P, fechou.t + 40)).map(x => x.n);
    ok('c7 a-tela-do-copo-fechada-na-festa', fechou.vivas > 0 && r.vivas === 0 && !r.ativo && !r.dom && !depois.length, `fechada com ${fechou.vivas} partículas no ar: depois ${r.vivas}, ${r.ativo ? 'ALGO CORRE' : 'nada correndo'}; ${depois.length ? 'SONS DEPOIS: ' + depois.join(', ') : 'nenhum som depois'}`);
  }
}

(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192'] });
  for (const dev of DEVS) {
    const P = await abre(browser, dev, false); const cam = camera(P);
    console.log(`— ${dev} (${P.W} × ${P.H}): ${P.info.v} contra ${P.info.o}; a sala cheia ${P.info.cheio}, a vazia ${P.info.vazio}; o teto das partículas ${P.info.teto}`);
    ok(`${dev} o-teto`, P.info.fx && P.info.cheio && P.info.vazio && (P.pc ? P.info.teto === 520 : P.info.teto === 240), `a festa carregada, o teto das partículas ${P.info.teto} (o celular leva menos)`);
    await tabuletas(P, cam); await copo(P, cam);
    // (os nomes pedidos: todos da tabela do G.Audio.ui)
    const r = await P.page.evaluate(() => { const T = new Set(G.Audio.UI); const L = window.__sons.filter(x => !x.mundo); return { n: L.length, fora: [...new Set(L.filter(x => !T.has(x.n)).map(x => x.n))], usados: [...new Set(L.map(x => x.n))] }; });
    ok(`${dev} os-nomes-dos-sons`, !r.fora.length, `${r.n} pedidos à porta da tela, ${r.usados.length} nomes: ${r.usados.join(', ')}${r.fora.length ? '; FORA DA TABELA: ' + r.fora.join(', ') : ''}`);
    if (P.pc) { // (o pico de cada som de tela, e o da vitória inteira: nada estoura)
      const pk = await P.page.evaluate(async () => { const out = {}; for (const n of G.Audio.UI) { let m = 0; for (let k = 0; k < 2; k++) m = Math.max(m, await G.Audio.pico([[n, { n: 3, i: 6, ultima: 1, mat: 'osso', povo: 'asteca' }, 0]])); out[n] = m; }
        out['a vitória inteira'] = await G.Audio.pico([['vitoria-fanfarra', {}, 0], ['gloria-tique', { i: 1 }, 0.45], ['gloria-tique', { i: 2 }, 0.55], ['gloria-tique', { i: 3 }, 0.65], ['moeda-bolsa', { i: 0 }, 1.0], ['moeda-bolsa', { i: 1 }, 1.09], ['moeda-bolsa', { i: 2 }, 1.18], ['moeda-bolsa', { i: 3, ultima: 1 }, 1.27], ['aplauso', { n: 9, povo: 'asteca' }, 1.4]]);
        out['o cravou inteiro'] = await G.Audio.pico([['dado-conta', { i: 5 }, 0], ['cravou', { n: 3, mat: 'osso' }, 0.2], ['rodada-ganha', { n: 3 }, 0.2], ['dado-voa', { mat: 'osso' }, 0.8], ['dado-voa', { mat: 'osso' }, 0.98], ['dado-voa', { mat: 'osso' }, 1.16]]); return out; });
      const alto = Object.entries(pk).filter(([, v]) => !(v > 0) || v >= 0.9);
      ok('pc os-picos-dos-sons', !alto.length, Object.entries(pk).map(([k, v]) => `${k} ${v}`).join(', ') + (alto.length ? ' — ESTOURA OU CALA: ' + alto.map(x => x[0]).join(', ') : ''));
    }
    ok(`${dev} sem-erros`, !P.errs.length, P.errs.length ? P.errs.join(' | ').slice(0, 700) : 'nenhum erro de página nem aviso no console');
    console.log(`folha: ${await folha(browser, P, cam.fotos)}`);
    await P.ctx.close();
  }
  // (quem pede menos movimento: um terço das partículas e nenhum tremor; os números já no fim)
  {
    const P = await abre(browser, 'pc', true);
    await P.page.evaluate(() => { window.__vmax = 0; window.__amostra = setInterval(() => { window.__vmax = Math.max(window.__vmax, G.JogoFX.vivas()); }, 40); });
    const r = await P.page.evaluate(() => { const F = window.__F; window.__painel = 'cartas'; const civ = ['grego', 'romano']; const s = window.__C.ate(4, civ, 3, 4242); const view = Object.assign(window.__C.mk(s, 4242, civ), { gl: [12, 7], fim: { w: 0, por: 'gloria', meu: 1 }, pote: 0, aposta: 0.2, x: 1 });
      window.__T = { s, view }; G.CartasUI.force = () => window.__T.view; G.CartasUI.abrir(4242); G.CartasUI._test.view = view; G.CartasUI._test.render(); return { menos: G.JogoFX.menos(), placar: document.querySelector('#tab-panel .tb-sc-m').textContent, brilha: getComputedStyle(document.querySelector('#tab-panel .jfx-brilha')).animationName }; });
    await wait(2600); const vmax = await P.page.evaluate(() => { clearInterval(window.__amostra); return window.__vmax; }); await calma(P, 9000);
    ok('menos-movimento', r.menos && r.placar === '12' && r.brilha === 'none' && vmax > 0 && vmax <= 70, `pedido ao navegador: ${r.menos ? 'sim' : 'NÃO'}; o placar já no fim (${r.placar}), o botão sem pulsar (${r.brilha}); no máximo ${vmax} partículas no ar (com movimento, passa de 150)`);
    ok('menos-movimento sem-erros', !P.errs.length, P.errs.length ? P.errs.join(' | ').slice(0, 500) : 'nenhum erro');
    await P.ctx.close();
  }
  await browser.close();
  console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : `FESTA: ok (${Math.round((hr() - t0) / 1000)} s; as fotos em ${OUT})`);
  process.exit(fails.length ? 1 : 0);
})();
