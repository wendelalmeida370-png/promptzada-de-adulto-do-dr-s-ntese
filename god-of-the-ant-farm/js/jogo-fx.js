'use strict';
// jogo-fx: a festa das mesas — as faíscas, os confetes, as moedas que voam para a bolsa, a glória que sobe contando, o tranco e
// o clarão — para as telas dos jogos da taverna (as Tabuletas, o copo dos dados) e para quem mais quiser festejar (D-940: ganhar
// dá gosto). Só se vê: o acaso é o do que só se vê (G.vrr), nunca o do mundo; não lê nem escreve o mundo. Uma camada só, por
// cima da tela, que dorme quando nada voa; quem pede menos movimento ao navegador (prefers-reduced-motion) vê menos partículas
// e nenhum tremor. As telas chamam:
//   G.JogoFX.em(el, o)            — um estouro no meio de um elemento (o: { tipo, n, cores, forca, sobe })
//   G.JogoFX.burst(x, y, o)       — o mesmo num ponto da tela (px do CSS)
//   G.JogoFX.chuva(o)             — confetes caindo do alto da tela (o: { n, cores, dur })
//   G.JogoFX.moedas(de, para, n, o) → Promise — moedas voando de um elemento a outro (o.cada(i): cada uma que chega — o tilintar)
//   G.JogoFX.conta(el, de, para, ms, fmt) → Promise — o número subindo (ou descendo) até o fim, com o pulo no fim
//   G.JogoFX.pulso(el, cls, ms)   — uma classe de animação posta e tirada (de novo, mesmo no meio)
//   G.JogoFX.tremor(el, forca)    — o tranco de um golpe
//   G.JogoFX.clarao(cor, ms)      — um clarão na tela inteira
//   G.JogoFX.raios(el, on)        — os raios de luz girando atrás de um elemento (a vitória)
//   G.JogoFX.limpa()              — tudo some (a tela fechou)
(function (G) {
  const FX = G.JogoFX = {};
  const R = (a, b) => G.vrr(a, b);
  const TAU = Math.PI * 2;
  const OURO = ['#ffd76a', '#f5b638', '#fff1b8', '#e8932a', '#fffbe6'];
  let cv = null, cx = null, raf = 0, last = 0, W = 0, H = 0, dpr = 1;
  const P = []; const MAX = 520;
  const menos = () => { try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; } };
  const doc = () => (typeof document !== 'undefined' && document.body ? document : null);
  FX.menos = menos;

  // ------------------------------ a camada das partículas ------------------------------
  function camada() {
    if (cv && cv.isConnected) return true;
    const d = doc(); if (!d) return false;
    cv = d.createElement('canvas'); cv.className = 'jfx-camada'; cv.setAttribute('aria-hidden', 'true'); d.body.appendChild(cv);
    cx = cv.getContext('2d'); medir(); return !!cx;
  }
  function medir() { dpr = Math.min(2, window.devicePixelRatio || 1); W = window.innerWidth; H = window.innerHeight; cv.width = Math.max(1, Math.round(W * dpr)); cv.height = Math.max(1, Math.round(H * dpr)); }
  if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('resize', () => { if (cv) medir(); });
  function acorda() { if (!raf && typeof requestAnimationFrame === 'function') { last = 0; raf = requestAnimationFrame(passo); } }
  function passo(ts) {
    raf = 0; if (!cx) return;
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
  }
  function desenha(p) {
    const k = p.t / p.vida; const a = p.tipo === 'confete' ? Math.min(1, (1 - k) * 4) : 1 - k * k;
    cx.globalAlpha = Math.max(0, a);
    if (p.tipo === 'faisca') {
      cx.globalCompositeOperation = 'lighter'; const r = p.s * (1 - k * 0.6);
      const gr = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3); gr.addColorStop(0, p.cor); gr.addColorStop(1, 'rgba(255,200,80,0)');
      cx.fillStyle = gr; cx.beginPath(); cx.arc(p.x, p.y, r * 3, 0, TAU); cx.fill();
      cx.strokeStyle = p.cor; cx.lineWidth = r * 0.8; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(p.x - p.vx * 0.035, p.y - p.vy * 0.035); cx.stroke();
      cx.globalCompositeOperation = 'source-over';
    } else if (p.tipo === 'brilho') {
      cx.globalCompositeOperation = 'lighter'; const r = p.s * Math.sin(Math.PI * Math.min(1, k * 1.2));
      cx.fillStyle = p.cor; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.giro); cx.beginPath();
      for (let j = 0; j < 8; j++) { const rr = j % 2 ? r * 0.28 : r; const an = j * Math.PI / 4; cx.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); }
      cx.closePath(); cx.fill(); cx.restore(); cx.globalCompositeOperation = 'source-over';
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
  function poe(tipo, x, y, vx, vy, cor, o) {
    if (P.length >= MAX) P.shift();
    const conf = tipo === 'confete', faisca = tipo === 'faisca', moeda = tipo === 'moeda';
    P.push({ tipo, x, y, vx, vy, cor, t: o.atraso ? -o.atraso : 0, vida: o.vida || (conf ? R(2.2, 3.6) : faisca ? R(0.45, 0.9) : moeda ? R(1.1, 1.6) : R(0.7, 1.3)),
      s: o.s || (conf ? R(5, 9) : faisca ? R(1.6, 3.2) : moeda ? R(6, 9) : R(7, 14)), g: o.g !== undefined ? o.g : conf ? 380 : faisca ? 260 : moeda ? 900 : -20,
      ar: conf ? 0.985 : faisca ? 0.93 : moeda ? 0.995 : 0.96, giro: R(0, TAU), vg: R(-9, 9), fase: R(0, TAU) });
  }

  // ------------------------------ as portas ------------------------------
  // um estouro num ponto: as faíscas e os brilhos saem em roda (o.sobe: mais para cima — uma fonte), os confetes e as moedas
  // pulam para cima e caem
  FX.burst = function (x, y, o) {
    o = o || {}; if (!camada()) return; const tipo = o.tipo || 'faisca'; const cores = o.cores && o.cores.length ? o.cores : OURO;
    let n = Math.round(o.n || (tipo === 'confete' ? 40 : tipo === 'moeda' ? 12 : 26)); if (menos()) n = Math.ceil(n / 3);
    const f = o.forca || 1;
    for (let i = 0; i < n; i++) {
      const an = o.sobe ? -Math.PI / 2 + R(-0.9, 0.9) : R(0, TAU); const v = (tipo === 'faisca' ? R(160, 460) : tipo === 'brilho' ? R(20, 90) : R(220, 520)) * f;
      const up = tipo === 'confete' || tipo === 'moeda' ? -R(260, 560) * f : 0;
      poe(tipo, x + R(-6, 6), y + R(-6, 6), Math.cos(an) * v * (tipo === 'confete' || tipo === 'moeda' ? 0.6 : 1), Math.sin(an) * v + up, cores[i % cores.length], o);
    }
    acorda();
  };
  const centro = el => { if (!el || !el.getBoundingClientRect) return null; const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; };
  FX.em = function (el, o) { const c = centro(el); if (c) FX.burst(c.x, c.y, o); };
  // confetes caindo do alto, aos poucos, pela largura da tela
  FX.chuva = function (o) {
    o = o || {}; if (!camada()) return; const cores = o.cores && o.cores.length ? o.cores : OURO.concat(['#e0463a', '#3a8fe0', '#4cc27a']);
    let n = Math.round(o.n || 140); if (menos()) n = Math.ceil(n / 4); const dur = o.dur || 1.6;
    for (let i = 0; i < n; i++) poe('confete', R(0, W), R(-40, -10), R(-60, 60), R(40, 160), cores[i % cores.length], { atraso: R(0, dur) });
    acorda();
  };
  // moedas de verdade (elementos da página) voando de um a outro, uma atrás da outra, numa curva; o.cada(i) quando cada uma
  // chega (o tilintar), o pulo de quem as recebe na última
  FX.moedas = function (de, para, n, o) {
    o = o || {}; const d = doc(); const a = centro(de), b = centro(para);
    if (!d || !a || !b || !(n > 0)) return Promise.resolve();
    n = Math.max(1, Math.min(14, Math.round(n))); if (menos()) n = Math.min(n, 3);
    const passo0 = o.passo || 90; const dur = o.dur || 620; const vivas = [];
    return new Promise(fim => {
      let chegou = 0;
      for (let i = 0; i < n; i++) {
        const m = d.createElement('div'); m.className = 'jfx-moeda'; m.style.left = a.x + 'px'; m.style.top = a.y + 'px'; d.body.appendChild(m); vivas.push(m);
        const dx = b.x - a.x + R(-6, 6), dy = b.y - a.y + R(-4, 4), alto = -Math.min(160, 60 + Math.abs(dx) * 0.35) + R(-20, 20);
        const fr = []; for (let k = 0; k <= 10; k++) { const t = k / 10; fr.push({ transform: `translate(calc(-50% + ${dx * t}px), calc(-50% + ${dy * t + alto * 4 * t * (1 - t)}px)) scale(${1 + 0.25 * Math.sin(Math.PI * t)}) rotateY(${t * 540}deg)`, opacity: t < 0.08 ? t / 0.08 : 1 }); }
        const go = () => {
          const an = m.animate ? m.animate(fr, { duration: dur, delay: i * passo0, easing: 'cubic-bezier(.45,.05,.55,.95)', fill: 'forwards' }) : null;
          const done = () => { m.remove(); chegou++; if (o.cada) o.cada(i); if (chegou === n) { FX.pulso(para, 'jfx-pega', 420); fim(); } };
          if (an) an.onfinish = done; else setTimeout(done, i * passo0 + dur);
        };
        go();
      }
    });
  };
  // o número subindo até o fim, com o pulo no fim (fmt: como se escreve cada número)
  FX.conta = function (el, de, para, ms, fmt) {
    if (!el) return Promise.resolve(); fmt = fmt || (x => String(Math.round(x)));
    if (menos() || typeof requestAnimationFrame !== 'function') { el.textContent = fmt(para); return Promise.resolve(); }
    ms = ms || 700; const t0 = performance.now();
    return new Promise(fim => {
      const vai = ts => { const k = Math.min(1, (ts - t0) / ms); const e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(de + (para - de) * e);
        if (k < 1) requestAnimationFrame(vai); else { FX.pulso(el, 'jfx-sobe', 380); fim(); } };
      requestAnimationFrame(vai);
    });
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
    d.body.appendChild(f); const an = f.animate ? f.animate([{ opacity: 0 }, { opacity: 1, offset: 0.18 }, { opacity: 0 }], { duration: ms || 520, easing: 'ease-out' }) : null;
    if (an) an.onfinish = () => f.remove(); else setTimeout(() => f.remove(), ms || 520);
  };
  FX.raios = function (el, on) { if (el && el.classList) el.classList.toggle('jfx-raios', on !== false); };
  FX.limpa = function () { P.length = 0; if (cx) { cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, cv.width, cv.height); } const d = doc(); if (d) for (const m of d.querySelectorAll('.jfx-moeda, .jfx-clarao')) m.remove(); };
  FX.vivas = () => P.length; // (as provas: quantas partículas estão no ar)
  G.worldHooks = G.worldHooks || []; G.worldHooks.push(() => FX.limpa()); // (um mundo novo ou um save aberto: nada no ar)
})(window.G);
