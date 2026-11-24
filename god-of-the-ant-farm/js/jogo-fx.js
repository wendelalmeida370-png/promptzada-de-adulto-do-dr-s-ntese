'use strict';
// jogo-fx: a festa das mesas — as faíscas, os confetes, as moedas que voam para a bolsa, a glória que sobe contando, o tranco e
// o clarão — para as telas dos jogos da taverna (as Tabuletas, o copo dos dados) e para quem mais quiser festejar (D-940: ganhar
// dá gosto; a frente F, D-950 a D-959). Só se vê: o acaso é o do que só se vê (G.vrr), nunca o do mundo; não lê nem escreve o
// mundo. Uma camada só, por cima da tela, que dorme quando nada voa; quem pede menos movimento ao navegador (prefers-reduced-motion)
// vê um terço das partículas e nenhum tremor; o celular tem um teto menor de partículas no ar (D-955). Cada limpeza começa uma geração
// nova: o que ainda corria — as moedas no ar, a glória contando, o tilintar de cada uma — para ali, e nada roda com a tela fechada.
// As telas chamam:
//   G.JogoFX.em(el, o)            — um estouro no meio de um elemento (o: { tipo, n, cores, forca, sobe })
//   G.JogoFX.burst(x, y, o)       — o mesmo num ponto da tela (px do CSS); tipos: faisca, brilho, confete, moeda, poeira
//   G.JogoFX.anel(el, o)          — a onda de choque de um golpe na mesa (o: { cor, r, n })
//   G.JogoFX.chuva(o)             — confetes caindo do alto da tela (o: { n, cores, dur })
//   G.JogoFX.moedas(de, para, n, o) → Promise — moedas voando de um elemento a outro (o.cada(i): cada uma que chega — o tilintar)
//   G.JogoFX.conta(el, de, para, ms, fmt, o) → Promise — o número subindo (ou descendo) até o fim, com o pulo no fim (o.passo(n):
//                                   cada número inteiro novo — o tique)
//   G.JogoFX.flutua(el, txt, o)   — um número ou uma palavra que sobe de um elemento e some (o: { cls, cor, dy })
//   G.JogoFX.pulso(el, cls, ms)   — uma classe de animação posta e tirada (de novo, mesmo no meio)
//   G.JogoFX.tremor(el, forca)    — o tranco de um golpe
//   G.JogoFX.clarao(cor, ms)      — um clarão na tela inteira
//   G.JogoFX.raios(el, on)        — os raios de luz girando atrás de um elemento (a vitória)
//   G.JogoFX.cores(povo)          — o ouro e as tintas de um povo, para a festa dele
//   G.JogoFX.limpa()              — tudo some (a tela fechou)
//   G.JogoFX.menos()              — quem pediu menos movimento
// e, para as provas: vivas() (as partículas no ar), ativo() (algo ainda corre), teto() (o teto de agora), medida() (o tempo do
// desenho de cada quadro da camada, em ms)
(function (G) {
  const FX = G.JogoFX = {};
  const R = (a, b) => G.vrr(a, b);
  const TAU = Math.PI * 2;
  const OURO = ['#ffd76a', '#f5b638', '#fff1b8', '#e8932a', '#fffbe6'];
  // (as tintas de cada povo, as das tabuletas e das mesas dele, com o ouro de todos à frente)
  const POVO = {
    romano: ['#ffd76a', '#d2402e', '#fbf3e4', '#e8b04a', '#9a2a1d'],
    grego: ['#ffd76a', '#e8834a', '#fbe8cc', '#c7672f', '#3a2a1e'],
    egipcio: ['#ffd76a', '#3a6fd0', '#5ccfd2', '#c9971f', '#f5e6b8'],
    nordico: ['#ffd76a', '#dfe5ea', '#c99a4c', '#8fb7d0', '#b8483a'],
    asteca: ['#ffd76a', '#22b8aa', '#d8402f', '#68d890', '#f2c14e'],
    classico: ['#ffd76a', '#b890f0', '#f0d488', '#7a8ae0', '#fff3d2'],
  };
  FX.cores = povo => (POVO[povo] || OURO).slice();
  let cv = null, cx = null, raf = 0, last = 0, W = 0, H = 0, dpr = 1, MAX = 520;
  let ger = 0, nConta = 0, nMoeda = 0; const pend = new Set(); // (a geração; o que conta e o que voa agora; as promessas que esperam)
  const P = [];
  const menos = () => { try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; } };
  const doc = () => (typeof document !== 'undefined' && document.body ? document : null);
  FX.menos = menos;
  // (o teto das partículas no ar: o dedo e a tela estreita do celular levam menos; a mais velha cede o lugar à nova)
  function tetoDe() { try { const dedo = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches); return dedo || Math.min(window.innerWidth, window.innerHeight) < 560 ? 240 : 520; } catch (e) { return 240; } }
  try { MAX = tetoDe(); } catch (e) { } // (o teto já no carregamento: a primeira festa do celular não passa do dele)
  FX.teto = () => MAX;

  // ------------------------------ a camada das partículas ------------------------------
  function camada() {
    if (cv && cv.isConnected) return true;
    const d = doc(); if (!d) return false;
    cv = d.createElement('canvas'); cv.className = 'jfx-camada'; cv.setAttribute('aria-hidden', 'true'); d.body.appendChild(cv);
    cx = cv.getContext('2d'); medir(); return !!cx;
  }
  function medir() { dpr = Math.min(2, window.devicePixelRatio || 1); W = window.innerWidth; H = window.innerHeight; cv.width = Math.max(1, Math.round(W * dpr)); cv.height = Math.max(1, Math.round(H * dpr)); MAX = tetoDe(); }
  if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('resize', () => { if (cv) medir(); });
  function acorda() { if (!raf && typeof requestAnimationFrame === 'function') { last = 0; raf = requestAnimationFrame(passo); } }
  // (o tempo do desenho de cada quadro, para as provas: os últimos 240)
  const custos = [];
  function passo(ts) {
    raf = 0; if (!cx) return; const t0 = performance.now();
    const dt = last ? Math.min(1 / 30, (ts - last) / 1000) : 1 / 60; last = ts;
    if (cv.width !== Math.round(window.innerWidth * Math.min(2, window.devicePixelRatio || 1))) medir();
    cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H);
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i]; p.t += dt; if (p.t >= p.vida) { P.splice(i, 1); continue; }
      if (p.t < 0) continue; // (ainda esperando a sua vez: a chuva sai aos poucos)
      p.vx *= Math.pow(p.ar, dt * 60); p.vy = p.vy * Math.pow(p.ar, dt * 60) + p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.giro += p.vg * dt;
      desenha(p);
    }
    if (P.length) raf = requestAnimationFrame(passo); else cx.clearRect(0, 0, W, H);
    custos.push(performance.now() - t0); if (custos.length > 240) custos.shift();
  }
  // (a luz redonda de uma cor, pintada uma vez e carimbada: um gradiente novo por faísca a cada quadro era o custo da camada antiga)
  const SPR = new Map();
  // (uma cor — #hex ou rgb(…) — com a transparência dada; uma que não se lê vira o ouro, nunca o preto)
  const rgba = (cor, a) => { const c = String(cor).trim(); const h = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c);
    if (h) { const x = h[1].length === 3 ? h[1].replace(/./g, d => d + d) : h[1]; const n = parseInt(x, 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; }
    const q = /^rgba?\(([^)]+)\)$/i.exec(c); if (q) { const [r, g, b] = q[1].split(',').map(v => parseFloat(v)); if ([r, g, b].every(Number.isFinite)) return `rgba(${r},${g},${b},${a})`; }
    return `rgba(255,215,106,${a})`; };
  function luz(cor) {
    let c = SPR.get(cor); if (c) return c; const d = doc(); if (!d) return null;
    c = d.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.16, rgba(cor, 1)); g.addColorStop(0.45, rgba(cor, 0.35)); g.addColorStop(1, rgba(cor, 0));
    x.fillStyle = g; x.fillRect(0, 0, 64, 64); SPR.set(cor, c); if (SPR.size > 48) SPR.delete(SPR.keys().next().value); return c;
  }
  // (a nuvem macia do pó, da mesma cor de borda a borda: sem o miolo branco da luz)
  const NUV = new Map();
  function nuvem(cor) {
    let c = NUV.get(cor); if (c) return c; const d = doc(); if (!d) return null;
    c = d.createElement('canvas'); c.width = c.height = 48; const x = c.getContext('2d'); const g = x.createRadialGradient(24, 24, 0, 24, 24, 24);
    g.addColorStop(0, rgba(cor, 0.7)); g.addColorStop(0.5, rgba(cor, 0.3)); g.addColorStop(1, rgba(cor, 0));
    x.fillStyle = g; x.fillRect(0, 0, 48, 48); NUV.set(cor, c); if (NUV.size > 16) NUV.delete(NUV.keys().next().value); return c;
  }
  function desenha(p) {
    const k = p.t / p.vida; const a = p.tipo === 'confete' ? Math.min(1, (1 - k) * 4) : 1 - k * k;
    cx.globalAlpha = Math.max(0, a);
    if (p.tipo === 'faisca') {
      cx.globalCompositeOperation = 'lighter'; const r = p.s * (1 - k * 0.6); const sp = luz(p.cor);
      if (sp) cx.drawImage(sp, p.x - r * 3, p.y - r * 3, r * 6, r * 6);
      cx.strokeStyle = p.cor; cx.lineWidth = r * 0.8; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(p.x - p.vx * 0.035, p.y - p.vy * 0.035); cx.stroke();
      cx.globalCompositeOperation = 'source-over';
    } else if (p.tipo === 'brilho') {
      cx.globalCompositeOperation = 'lighter'; const r = p.s * Math.sin(Math.PI * Math.min(1, k * 1.2));
      cx.fillStyle = p.cor; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.giro); cx.beginPath();
      for (let j = 0; j < 8; j++) { const rr = j % 2 ? r * 0.28 : r; const an = j * Math.PI / 4; cx.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); }
      cx.closePath(); cx.fill(); cx.restore(); cx.globalCompositeOperation = 'source-over';
    } else if (p.tipo === 'anel') { // (a onda de um golpe: um anel que abre depressa e se apaga)
      const e = 1 - Math.pow(1 - k, 3); cx.globalAlpha = Math.max(0, (1 - k) * 0.9); cx.strokeStyle = p.cor; cx.lineWidth = Math.max(0.5, p.s * (1 - k));
      cx.beginPath(); cx.arc(p.x, p.y, p.r0 + (p.r1 - p.r0) * e, 0, TAU); cx.stroke();
    } else if (p.tipo === 'poeira') { // (o pó que a tabuleta levanta ao bater na mesa: um sopro redondo que cresce e some)
      cx.globalAlpha = Math.max(0, (1 - k) * 0.5); const r = p.s * (1.2 + k * 1.8); const sp = nuvem(p.cor); if (sp) cx.drawImage(sp, p.x - r, p.y - r, r * 2, r * 2);
    } else if (p.tipo === 'moeda') {
      const sx = Math.abs(Math.cos(p.giro)) * 0.85 + 0.15; cx.save(); cx.translate(p.x, p.y); cx.scale(sx, 1);
      cx.fillStyle = '#b97a14'; cx.beginPath(); cx.arc(0, 0, p.s, 0, TAU); cx.fill();
      cx.fillStyle = p.cor; cx.beginPath(); cx.arc(0, 0, p.s * 0.8, 0, TAU); cx.fill();
      cx.fillStyle = 'rgba(255,255,255,.55)'; cx.beginPath(); cx.arc(-p.s * 0.25, -p.s * 0.3, p.s * 0.25, 0, TAU); cx.fill(); cx.restore();
    } else { // (confete: um papelzinho que gira e balança na queda)
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.giro); cx.scale(1, Math.cos(p.giro * 1.7 + p.fase)); cx.fillStyle = p.cor;
      cx.fillRect(-p.s / 2, -p.s * 0.8, p.s, p.s * 1.6); cx.restore();
    }
    cx.globalAlpha = 1;
  }
  // (uma partícula: o tipo, o lugar, a velocidade, a cor; a vida em segundos; o atraso negativo da chuva)
  const VIDA = { confete: [2.2, 3.6], faisca: [0.45, 0.9], moeda: [1.1, 1.6], poeira: [0.5, 0.8], anel: [0.42, 0.5], brilho: [0.7, 1.3] };
  const TAM = { confete: [5, 9], faisca: [1.6, 3.2], moeda: [6, 9], poeira: [5, 11], anel: [3, 4], brilho: [7, 14] };
  const GRAV = { confete: 380, faisca: 260, moeda: 900, poeira: -30, anel: 0, brilho: -20 };
  const AR = { confete: 0.985, faisca: 0.93, moeda: 0.995, poeira: 0.9, anel: 1, brilho: 0.96 };
  function poe(tipo, x, y, vx, vy, cor, o) {
    if (P.length >= MAX) P.shift();
    const V = VIDA[tipo] || VIDA.brilho, T = TAM[tipo] || TAM.brilho;
    const p = { tipo, x, y, vx, vy, cor, t: o.atraso ? -o.atraso : 0, vida: o.vida || R(V[0], V[1]), s: o.s || R(T[0], T[1]),
      g: o.g !== undefined ? o.g : GRAV[tipo] !== undefined ? GRAV[tipo] : -20, ar: AR[tipo] || 0.96, giro: R(0, TAU), vg: R(-9, 9), fase: R(0, TAU), r0: 0, r1: 0 };
    P.push(p); return p;
  }

  // ------------------------------ as portas ------------------------------
  // um estouro num ponto: as faíscas e os brilhos saem em roda (o.sobe: mais para cima — uma fonte), os confetes e as moedas
  // pulam para cima e caem, a poeira se espalha rente (o.chao: para os lados, um pouco para cima)
  FX.burst = function (x, y, o) {
    o = o || {}; if (!camada()) return; const tipo = o.tipo || 'faisca'; const cores = o.cores && o.cores.length ? o.cores : OURO;
    let n = Math.round(o.n || (tipo === 'confete' ? 40 : tipo === 'moeda' ? 12 : tipo === 'poeira' ? 10 : 26)); if (menos()) n = Math.ceil(n / 3);
    n = Math.min(n, Math.ceil(MAX * 0.6)); const f = o.forca || 1;
    for (let i = 0; i < n; i++) {
      if (tipo === 'poeira') { const L = o.larg || 12, lado = i % 2 ? 1 : -1; poe('poeira', x + R(-L, L), y + R(-2, 2), lado * R(30, 120) * f, -R(5, 40) * f, cores[i % cores.length], o); continue; }
      const an = o.sobe ? -Math.PI / 2 + R(-0.9, 0.9) : R(0, TAU); const v = (tipo === 'faisca' ? R(160, 460) : tipo === 'brilho' ? R(20, 90) : R(220, 520)) * f;
      const up = tipo === 'confete' || tipo === 'moeda' ? -R(260, 560) * f : 0;
      poe(tipo, x + R(-6, 6), y + R(-6, 6), Math.cos(an) * v * (tipo === 'confete' || tipo === 'moeda' ? 0.6 : 1), Math.sin(an) * v + up, cores[i % cores.length], o);
    }
    acorda();
  };
  const centro = el => { if (!el) return null; if (Number.isFinite(el.x) && Number.isFinite(el.y) && !el.getBoundingClientRect) return { x: el.x, y: el.y, w: el.w || 0, h: el.h || 0 };
    if (!el.getBoundingClientRect) return null; const r = el.getBoundingClientRect(); if (!r.width && !r.height) return null; return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; };
  FX.em = function (el, o) { const c = centro(el); if (c) FX.burst(c.x, c.y + ((o && o.dy) || 0), o); };
  // a onda de choque de um golpe (a tabuleta que bate, o «Cravou!»): um anel ou dois, do tamanho do que bateu
  FX.anel = function (el, o) {
    o = o || {}; const c = centro(el); if (!c || !camada()) return; const r1 = o.r || Math.max(c.w, c.h) * 0.9 || 60; const n = menos() ? 1 : o.n || 2;
    for (let i = 0; i < n; i++) { const p = poe('anel', c.x, c.y, 0, 0, o.cor || 'rgba(255,230,160,1)', { vida: 0.45 + i * 0.12, s: (o.s || 4) * (1 - i * 0.3), g: 0, atraso: i * 0.07 }); p.r0 = r1 * 0.25; p.r1 = r1 * (1 + i * 0.35); }
    acorda();
  };
  // confetes caindo do alto, aos poucos, pela largura da tela
  FX.chuva = function (o) {
    o = o || {}; if (!camada()) return; const cores = o.cores && o.cores.length ? o.cores : OURO.concat(['#e0463a', '#3a8fe0', '#4cc27a']);
    let n = Math.round(o.n || 140); if (menos()) n = Math.ceil(n / 4); n = Math.min(n, Math.ceil(MAX * 0.7)); const dur = o.dur || 1.6;
    for (let i = 0; i < n; i++) poe('confete', R(0, W), R(-40, -10), R(-60, 60), R(40, 160), cores[i % cores.length], { atraso: R(0, dur) });
    acorda();
  };
  // moedas de verdade (elementos da página) voando de um a outro, uma atrás da outra, numa curva; o.cada(i) quando cada uma
  // chega (o tilintar), o pulo de quem as recebe na última. Limpa a tela no meio: as que voam somem, nenhuma tilinta depois
  FX.moedas = function (de, para, n, o) {
    o = o || {}; const d = doc(); const a = centro(de), b = centro(para);
    if (!d || !a || !b || !(n > 0)) return Promise.resolve();
    n = Math.max(1, Math.min(14, Math.round(n))); if (menos()) n = Math.min(n, 3);
    const passo0 = o.passo || 90; const dur = o.dur || 620; const g0 = ger; nMoeda += n;
    return new Promise(fim => {
      let chegou = 0; const acaba = () => { pend.delete(acaba); fim(); }; pend.add(acaba);
      for (let i = 0; i < n; i++) {
        const m = d.createElement('div'); m.className = 'jfx-moeda'; m.style.left = a.x + 'px'; m.style.top = a.y + 'px'; d.body.appendChild(m);
        const dx = b.x - a.x + R(-6, 6), dy = b.y - a.y + R(-4, 4), alto = -Math.min(160, 60 + Math.abs(dx) * 0.35) + R(-20, 20);
        const fr = []; for (let k = 0; k <= 10; k++) { const t = k / 10; fr.push({ transform: `translate(calc(-50% + ${dx * t}px), calc(-50% + ${dy * t + alto * 4 * t * (1 - t)}px)) scale(${1 + 0.25 * Math.sin(Math.PI * t)}) rotateY(${t * 540}deg)`, opacity: t < 0.08 ? t / 0.08 : 1 }); }
        const an = m.animate ? m.animate(fr, { duration: dur, delay: i * passo0, easing: 'cubic-bezier(.45,.05,.55,.95)', fill: 'forwards' }) : null;
        const done = () => { m.remove(); nMoeda = Math.max(0, nMoeda - 1); if (g0 !== ger) return; chegou++; if (o.cada) o.cada(i); if (chegou === n) { FX.pulso(para, 'jfx-pega', 420); acaba(); } };
        if (an) an.onfinish = done; else setTimeout(done, i * passo0 + dur);
      }
    });
  };
  // o número subindo até o fim, com o pulo no fim (fmt: como se escreve cada número; o.passo(n): cada inteiro novo no caminho)
  FX.conta = function (el, de, para, ms, fmt, o) {
    if (!el) return Promise.resolve(); fmt = fmt || (x => String(Math.round(x))); o = o || {};
    if (menos() || typeof requestAnimationFrame !== 'function') { el.textContent = fmt(para); if (o.passo && Math.round(para) !== Math.round(de)) o.passo(Math.round(para)); return Promise.resolve(); }
    ms = ms || 700; const t0 = performance.now(); const g0 = ger; let visto = Math.round(de); nConta++;
    return new Promise(fim => {
      const acaba = () => { pend.delete(acaba); nConta = Math.max(0, nConta - 1); fim(); }; pend.add(acaba);
      const vai = ts => {
        if (g0 !== ger || !el.isConnected) { acaba(); return; }
        const k = Math.min(1, ((ts || performance.now()) - t0) / ms); const e = 1 - Math.pow(1 - k, 3); const x = de + (para - de) * e; el.textContent = fmt(x);
        const r = Math.round(x); if (r !== visto) { visto = r; if (o.passo) o.passo(r); }
        if (k < 1) requestAnimationFrame(vai); else { FX.pulso(el, 'jfx-sobe', 380); acaba(); } };
      requestAnimationFrame(vai);
    });
  };
  // uma palavra ou um número que sobe de um elemento e some (o «+3» da glória, o «−1 dado»), por cima de tudo — o.desce: o que está no
  // alto da tela desce, para não sair dela
  FX.flutua = function (el, txt, o) {
    o = o || {}; const d = doc(); const c = centro(el); if (!d || !c) return; const f = d.createElement('div'); f.className = 'jfx-flutua' + (o.cls ? ' ' + o.cls : ''); f.textContent = txt;
    f.style.left = c.x + 'px'; f.style.top = (c.y + (o.dy || 0)) + 'px'; if (o.cor) f.style.color = o.cor; d.body.appendChild(f);
    const Y = o.desce ? [-70, -30, -10, 90] : [-30, -70, -90, -190]; const y = i => `translate(-50%, ${Y[i]}%)`; // (o caminho: para cima, ou — o.desce — o mesmo para baixo)
    const an = f.animate && !menos() ? f.animate([{ transform: `${y(0)} scale(.6)`, opacity: 0 }, { transform: `${y(1)} scale(1.2)`, opacity: 1, offset: 0.2 }, { transform: `${y(2)} scale(1)`, opacity: 1, offset: 0.6 }, { transform: `${y(3)} scale(.95)`, opacity: 0 }], { duration: o.ms || 1300, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards' }) : null;
    const sai = () => f.remove(); if (an) an.onfinish = sai; else setTimeout(sai, menos() ? 900 : o.ms || 1300);
  };
  // uma classe de animação posta e tirada — tirada e posta de novo se já estava (o reflow faz a animação recomeçar)
  FX.pulso = function (el, cls, ms) {
    if (!el || !el.classList) return; cls = cls || 'jfx-pop'; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
    clearTimeout(el['_jfx_' + cls]); el['_jfx_' + cls] = setTimeout(() => el.classList.remove(cls), ms || 600);
  };
  FX.tremor = function (el, forca) {
    if (!el || !el.animate || menos()) return; const f = 6 * (forca || 1);
    el.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${-f}px,${f * 0.3}px)` }, { transform: `translate(${f}px,${-f * 0.3}px)` }, { transform: `translate(${-f * 0.6}px,0)` }, { transform: `translate(${f * 0.4}px,0)` }, { transform: 'translate(0,0)' }], { duration: 320, easing: 'ease-out' });
  };
  FX.clarao = function (cor, ms) {
    const d = doc(); if (!d) return; const f = d.createElement('div'); f.className = 'jfx-clarao'; f.style.background = cor || 'radial-gradient(circle at 50% 45%, rgba(255,236,170,.55), rgba(255,200,90,0) 70%)';
    d.body.appendChild(f); const an = f.animate ? f.animate([{ opacity: 0 }, { opacity: menos() ? 0.5 : 1, offset: 0.18 }, { opacity: 0 }], { duration: ms || 520, easing: 'ease-out' }) : null;
    if (an) an.onfinish = () => f.remove(); else setTimeout(() => f.remove(), ms || 520);
  };
  FX.raios = function (el, on) { if (el && el.classList) el.classList.toggle('jfx-raios', on !== false); };
  // tudo some: as partículas, as moedas no ar, os clarões, os números que sobem, os raios; o que contava para no número de agora
  FX.limpa = function () {
    ger++; P.length = 0; if (raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(raf); raf = 0;
    if (cx) { cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, cv.width, cv.height); }
    const d = doc(); if (d) { for (const m of d.querySelectorAll('.jfx-moeda, .jfx-clarao, .jfx-flutua')) m.remove(); for (const e of d.querySelectorAll('.jfx-raios')) e.classList.remove('jfx-raios'); }
    for (const f of [...pend]) f(); nMoeda = 0; nConta = 0;
  };
  FX.vivas = () => P.length; // (as provas: quantas partículas estão no ar)
  FX.ativo = () => !!raf || nConta > 0 || nMoeda > 0 || P.length > 0;
  FX.medida = () => { if (!custos.length) return { n: 0, media: 0, max: 0 }; const s = custos.reduce((a, b) => a + b, 0); return { n: custos.length, media: Math.round(s / custos.length * 100) / 100, max: Math.round(Math.max(...custos) * 100) / 100 }; };
  FX.medidaZera = () => { custos.length = 0; };
  G.worldHooks = G.worldHooks || []; G.worldHooks.push(() => FX.limpa()); // (um mundo novo ou um save aberto: nada no ar)
})(window.G);
