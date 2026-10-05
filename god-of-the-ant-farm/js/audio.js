'use strict';
// ============================================================
//  Audio: everything synthesized with WebAudio (no files)
// ============================================================
(function (G) {
  const A = G.Audio = {};
  let ac = null, master, sfx, amb, mus, rev, revIn, noise;
  const last = {};
  A.sfxOn = true; A.musicOn = true; A.ambOn = true;
  try { const s = JSON.parse(localStorage.getItem('gotaf-audio') || '{}'); if (s.sfx === false) A.sfxOn = false; if (s.music === false) A.musicOn = false; if (s.amb === false) A.ambOn = false; } catch (e) { }
  A.save = () => { try { localStorage.setItem('gotaf-audio', JSON.stringify({ sfx: A.sfxOn, music: A.musicOn, amb: A.ambOn })); } catch (e) { } };

  A.init = function () {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    master = ac.createGain(); master.gain.value = 0.85;
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
    master.connect(comp); comp.connect(ac.destination);
    sfx = ac.createGain(); sfx.gain.value = A.sfxOn ? 0.9 : 0; sfx.connect(master);
    amb = ac.createGain(); amb.gain.value = A.ambOn ? 0.55 : 0; amb.connect(master);
    mus = ac.createGain(); mus.gain.value = A.musicOn ? 0.3 : 0; mus.connect(master);
    // reverb
    rev = ac.createConvolver();
    const len = ac.sampleRate * 2.6, ir = ac.createBuffer(2, len, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    rev.buffer = ir;
    revIn = ac.createGain(); revIn.gain.value = 0.35; revIn.connect(rev); const rg = ac.createGain(); rg.gain.value = 0.5; rev.connect(rg); rg.connect(master);
    noise = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const nd = noise.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    startAmbience();
  };
  A.setSfx = on => { A.sfxOn = on; if (sfx) sfx.gain.setTargetAtTime(on ? 0.9 : 0, ac.currentTime, 0.05); A.save(); };
  A.setMusic = on => { A.musicOn = on; if (mus) mus.gain.setTargetAtTime(on ? 0.3 : 0, ac.currentTime, 0.2); A.save(); };
  A.setAmb = on => { A.ambOn = on; if (amb) amb.gain.setTargetAtTime(on ? 0.55 : 0, ac.currentTime, 0.2); A.save(); };

  // ---------------- primitives ----------------
  function env(g, t, a, peak, d, sustain) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }
  function osc(type, f, t, dur, peak, dest, f2, a) {
    const o = ac.createOscillator(); const g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    env(g, t, a || 0.005, peak, dur);
    o.connect(g); g.connect(dest || sfx);
    o.start(t); o.stop(t + (a || 0.005) + dur + 0.05);
    return { o, g };
  }
  function nz(t, dur, peak, filt, f, q, dest, f2, a) {
    const s = ac.createBufferSource(); s.buffer = noise; s.loop = true;
    const fl = ac.createBiquadFilter(); fl.type = filt; fl.frequency.setValueAtTime(f, t); if (q) fl.Q.value = q;
    if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const g = ac.createGain(); env(g, t, a || 0.004, peak, dur);
    s.connect(fl); fl.connect(g); g.connect(dest || sfx);
    s.start(t, Math.random()); s.stop(t + (a || 0.004) + dur + 0.05);
    return g;
  }
  const PENTA = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];

  // ---------------- sound library ----------------
  const LIB = {
    click: (t, v) => osc('sine', 700, t, 0.06, 0.12 * v, sfx, 520),
    hover: (t, v) => osc('sine', 1300, t, 0.025, 0.03 * v),
    select: (t, v) => { osc('sine', 520, t, 0.08, 0.12 * v); osc('sine', 780, t + 0.06, 0.12, 0.1 * v); },
    deny: (t, v) => osc('square', 140, t, 0.14, 0.05 * v, sfx, 110),
    power: (t, v) => { osc('triangle', 660, t, 0.25, 0.08 * v); osc('sine', 990, t + 0.04, 0.3, 0.05 * v); },
    grab: (t, v) => osc('sine', 300, t, 0.15, 0.15 * v, sfx, 700),
    chop: (t, v) => { nz(t, 0.05, 0.3 * v, 'bandpass', 1700, 3); osc('sine', 190, t, 0.07, 0.25 * v, sfx, 120); },
    mine: (t, v) => { osc('triangle', 1500, t, 0.09, 0.12 * v, sfx, 1100); nz(t, 0.04, 0.15 * v, 'highpass', 3000); },
    hammer: (t, v) => { osc('triangle', 950, t, 0.06, 0.12 * v, sfx, 800); nz(t, 0.03, 0.12 * v, 'bandpass', 2400, 2); },
    treeFall: (t, v) => { osc('sawtooth', 130, t, 0.5, 0.05 * v, sfx, 70, 0.1); nz(t + 0.55, 0.35, 0.35 * v, 'lowpass', 500); osc('sine', 80, t + 0.55, 0.3, 0.35 * v, sfx, 40); },
    built: (t, v) => { [523.25, 659.25, 783.99, 1046.5].forEach((f, k) => { const n = osc('sine', f, t + k * 0.09, 0.9, 0.09 * v); n.g.connect(revIn); }); },
    collapse: (t, v) => { nz(t, 1.2, 0.5 * v, 'lowpass', 700, 0, sfx, 150); osc('sine', 70, t, 0.7, 0.4 * v, sfx, 35); },
    birth: (t, v) => { [783.99, 1046.5, 1318.5].forEach((f, k) => { const n = osc('sine', f, t + k * 0.12, 1.1, 0.07 * v); n.g.connect(revIn); }); },
    death: (t, v) => { const a = osc('sine', 220, t, 2.2, 0.08 * v, sfx, 0, 0.02); a.g.connect(revIn); const b = osc('sine', 329.6, t + 0.05, 2, 0.05 * v); b.g.connect(revIn); },
    milestone: (t, v) => { [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, k) => { const n = osc('triangle', f, t + k * 0.1, 0.8, 0.08 * v); n.g.connect(revIn); }); [261.63, 392, 523.25].forEach(f => { const n = osc('sine', f, t + 0.45, 1.8, 0.05 * v, sfx, 0, 0.2); n.g.connect(revIn); }); },
    lightning: (t, v) => {
      nz(t, 0.12, 0.9 * v, 'highpass', 1800); nz(t, 0.25, 0.6 * v, 'bandpass', 900, 1);
      const g = nz(t + 0.08, 2.8, 0.7 * v, 'lowpass', 900, 0, sfx, 90, 0.05); g.connect(revIn);
      osc('sine', 60, t + 0.05, 1.5, 0.5 * v, sfx, 30);
    },
    thunderFar: (t, v) => { const g = nz(t, 3.2, 0.3 * v, 'lowpass', 300, 0, amb, 80, 0.4); g.connect(revIn); },
    boom: (t, v) => {
      const sh = ac.createWaveShaper(); const cur = new Float32Array(256); for (let i = 0; i < 256; i++) { const x = i / 128 - 1; cur[i] = Math.tanh(x * 3); } sh.curve = cur; sh.connect(sfx);
      osc('sine', 120, t, 2.2, 0.9 * v, sh, 26, 0.01);
      nz(t, 3.5, 0.9 * v, 'lowpass', 1400, 0, sh, 90, 0.01);
      const g = nz(t + 0.1, 4, 0.5 * v, 'lowpass', 400, 0, sfx, 60, 0.2); g.connect(revIn);
    },
    rainStart: (t, v) => nz(t, 1.2, 0.18 * v, 'highpass', 1500, 0, sfx, 0, 0.4),
    magic: (t, v) => { for (let k = 0; k < 8; k++) { const f = PENTA[5 + Math.floor(Math.random() * 6)] * (Math.random() < 0.3 ? 2 : 1); const n = osc('sine', f, t + k * 0.07, 0.7, 0.05 * v); n.g.connect(revIn); } },
    heal: (t, v) => { [392, 493.9, 587.3, 783.99].forEach((f, k) => { const n = osc('sine', f, t + k * 0.05, 1.8, 0.06 * v, sfx, 0, 0.3); n.g.connect(revIn); }); LIB.magic(t + 0.2, v * 0.7); },
    fertility: (t, v) => { [523.25, 659.25, 783.99, 987.8, 1174.7, 1318.5].forEach((f, k) => { const n = osc('triangle', f, t + k * 0.08, 1.2, 0.05 * v); n.g.connect(revIn); }); },
    splash: (t, v) => { nz(t, 0.25, 0.25 * v, 'bandpass', 1300, 1, sfx, 500); },
    thud: (t, v) => { osc('sine', 110, t, 0.2, 0.4 * v, sfx, 50); nz(t, 0.12, 0.25 * v, 'lowpass', 400); },
    hit: (t, v) => { nz(t, 0.08, 0.3 * v, 'bandpass', 900, 2); osc('square', 200, t, 0.05, 0.05 * v, sfx, 120); },
    bite: (t, v) => { nz(t, 0.07, 0.25 * v, 'bandpass', 2500, 3); },
    horn: (t, v) => { for (const [f, d] of [[146.83, 0], [220, 0.04], [293.66, 0.5]]) { const n = osc('sawtooth', f, t + d, d ? 0.9 : 1.5, 0.035 * v, sfx, f * 1.015, 0.18); n.g.connect(revIn); } nz(t, 1.2, 0.04 * v, 'bandpass', 600, 1); },
    swish: (t, v) => { nz(t, 0.14, 0.12 * v, 'bandpass', 3400, 2, sfx, 1500); },
    // war: a wet cut, metal on metal, a cry cut short
    gore: (t, v) => { nz(t, 0.16, 0.38 * v, 'bandpass', 700, 1.2, sfx, 260); osc('sine', 95, t, 0.18, 0.3 * v, sfx, 50); nz(t + 0.05, 0.25, 0.12 * v, 'lowpass', 500, 0, sfx, 200, 0.02); },
    clang: (t, v) => { for (const [f, a] of [[2310, 0.07], [3470, 0.045], [5120, 0.03]]) { const n = osc('sine', f, t, 0.35, a * v, sfx, f * 0.98); n.g.connect(revIn); } nz(t, 0.03, 0.15 * v, 'highpass', 4000); },
    scream: (t, v) => {
      const o = ac.createOscillator(); o.type = 'sawtooth'; const f0 = G.rr(360, 520);
      o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * 1.15, t + 0.08); o.frequency.exponentialRampToValueAtTime(f0 * 0.45, t + 0.55);
      const f1 = ac.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.value = 900; f1.Q.value = 4;
      const f2 = ac.createBiquadFilter(); f2.type = 'bandpass'; f2.frequency.value = 1500; f2.Q.value = 5;
      const g = ac.createGain(); env(g, t, 0.02, 0.05 * v, 0.55);
      o.connect(f1); o.connect(f2); f1.connect(g); f2.connect(g); g.connect(sfx); g.connect(revIn); o.start(t); o.stop(t + 0.65);
    },
    caw: (t, v) => { for (const d of [0, 0.32]) { osc('square', 620, t + d, 0.16, 0.025 * v, amb, 430, 0.01); nz(t + d, 0.14, 0.03 * v, 'bandpass', 1300, 3, amb); } },
    bark: (t, v) => { for (const d of [0, 0.22]) { osc('sawtooth', 420, t + d, 0.09, 0.035 * v, sfx, 260, 0.005); nz(t + d, 0.07, 0.06 * v, 'bandpass', 900, 2); } },
    cluck: (t, v) => { for (let k = 0; k < 3; k++) osc('square', 880 - k * 60, t + k * 0.09, 0.05, 0.012 * v, amb, 620); },
    rooster: (t, v) => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(560, t); o.frequency.linearRampToValueAtTime(760, t + 0.25); o.frequency.linearRampToValueAtTime(700, t + 0.7); o.frequency.linearRampToValueAtTime(420, t + 1.1); const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 3; const g = ac.createGain(); env(g, t, 0.05, 0.05 * v, 1.1); o.connect(f); f.connect(g); g.connect(amb); g.connect(revIn); o.start(t); o.stop(t + 1.2); },
    flap: (t, v) => { for (let k = 0; k < 5; k++) nz(t + k * 0.05, 0.04, 0.05 * v, 'bandpass', 1800, 1, amb); },
    whoosh: (t, v) => { nz(t, 0.34, 0.16 * v, 'bandpass', 520, 0.8); nz(t + 0.06, 0.26, 0.1 * v, 'bandpass', 1300, 1.2); },
    shutter: (t, v) => { nz(t, 0.03, 0.4 * v, 'highpass', 3000); nz(t + 0.07, 0.04, 0.3 * v, 'bandpass', 2200, 2); osc('square', 1800, t, 0.02, 0.05 * v); },
    gull: (t, v) => { for (let k = 0; k < 3; k++) { osc('sine', 1350, t + k * 0.2, 0.16, 0.018 * v, amb, 820, 0.01); nz(t + k * 0.2, 0.12, 0.01 * v, 'bandpass', 2400, 4, amb); } },
    owl: (t, v) => { for (const [d, f, l] of [[0, 390, 0.35], [0.5, 330, 0.6]]) { const n = osc('sine', f, t + d, l, 0.03 * v, amb, f * 0.94, 0.05); n.g.connect(revIn); } },
    frog: (t, v) => { const n = 2 + (Math.random() * 3 | 0); for (let k = 0; k < n; k++) osc('square', 190, t + k * 0.11, 0.06, 0.012 * v, amb, 120, 0.005); },
    trill: (t, v) => { const f = G.rr(3200, 4600); for (let k = 0; k < 8; k++) osc('sine', f + (k % 2) * 300, t + k * 0.045, 0.035, 0.013 * v, amb); },
    cuckoo: (t, v) => { osc('sine', 740, t, 0.22, 0.02 * v, amb, 720, 0.02); osc('sine', 590, t + 0.3, 0.3, 0.02 * v, amb, 570, 0.02); },
    wave: (t, v) => { const g = nz(t, 2.2, 0.09 * v, 'lowpass', 900, 0, amb, 300, 0.9); g.connect(revIn); },
    drum: (t, v) => { for (let k = 0; k < 4; k++) { osc('sine', 110, t + k * 0.28, 0.35, (k === 3 ? 0.4 : 0.28) * v, sfx, 55); nz(t + k * 0.28, 0.08, 0.12 * v, 'lowpass', 800); } },
    quake: (t, v) => { nz(t, 2.6, 0.5 * v, 'lowpass', 240, 0, sfx, 80, 0.25); osc('sine', 48, t, 2.4, 0.4 * v, sfx, 30, 0.2); nz(t + 0.4, 1.4, 0.25 * v, 'lowpass', 900, 0, sfx, 200, 0.1); },
    plague: (t, v) => { const a = osc('triangle', 196, t, 1.8, 0.07 * v, sfx, 164.8, 0.3); a.g.connect(revIn); const b = osc('triangle', 233.1, t + 0.15, 1.6, 0.05 * v, sfx, 196, 0.3); b.g.connect(revIn); },
    fire: (t, v) => { nz(t, 0.7, 0.2 * v, 'bandpass', 900, 1, sfx, 380, 0.05); },
    howl: (t, v) => {
      for (const [d, m] of [[0, 1], [0.35, 1.19]]) {
        const o = ac.createOscillator(); const g = ac.createGain(); const lfo = ac.createOscillator(); const lg = ac.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(380 * m, t + d); o.frequency.linearRampToValueAtTime(620 * m, t + d + 0.6); o.frequency.linearRampToValueAtTime(470 * m, t + d + 2.2);
        lfo.frequency.value = 5.5; lg.gain.value = 8; lfo.connect(lg); lg.connect(o.frequency);
        g.gain.setValueAtTime(0.0001, t + d); g.gain.exponentialRampToValueAtTime(0.09 * v, t + d + 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 2.4);
        o.connect(g); g.connect(sfx); g.connect(revIn); o.start(t + d); lfo.start(t + d); o.stop(t + d + 2.5); lfo.stop(t + d + 2.5);
      }
    },
  };

  A.play = function (name, vol) {
    if (!ac || !A.sfxOn || A.mute || ac.state !== 'running') return;
    const now = ac.currentTime;
    const gap = { chop: 0.07, hammer: 0.06, mine: 0.07, hit: 0.05, hover: 0.04, swish: 0.08, horn: 1.2, fire: 0.3, gore: 0.12, clang: 0.06, scream: 0.4, caw: 0.6, drum: 1.4, bark: 0.35, cluck: 0.5, rooster: 3, flap: 0.5, gull: 2, owl: 4, frog: 0.8, trill: 1, cuckoo: 3, wave: 1.5 }[name] || 0.02;
    if (last[name] && now - last[name] < gap) return;
    last[name] = now;
    try { LIB[name] && LIB[name](now + 0.01, vol === undefined ? 1 : vol); } catch (e) { }
  };
  // positional: louder when on screen & zoomed in
  A.at = function (x, y, name, important, vol) {
    if (!ac || !G.Render || A.mute) return;
    const [sx, sy] = G.Render.proj(x, y, G.W.groundH(x, y));
    const [px, py] = G.Render.worldPxToScreen(sx, sy);
    const VW = G.Render.VW, VH = G.Render.VH;
    const dx = (px - VW / 2) / (VW * 0.6), dy = (py - VH / 2) / (VH * 0.6);
    const d = Math.hypot(dx, dy);
    let v = G.clamp(1.25 - d, 0, 1);
    if (!important) v *= G.clamp((G.Render.cam.zoom - 0.8) / 1.4, 0, 1);
    else v = Math.max(v, 0.35);
    if (v < 0.04) return;
    A.play(name, v * (vol || 1));
  };
  A.meteorFall = function (dur) {
    if (!ac || !A.sfxOn || ac.state !== 'running') return;
    const t = ac.currentTime + 0.02;
    const s = ac.createBufferSource(); s.buffer = noise; s.loop = true;
    const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.5; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(1800, t + dur);
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + dur - 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.05);
    s.connect(f); f.connect(g); g.connect(sfx); s.start(t); s.stop(t + dur + 0.1);
    const o = ac.createOscillator(); const og = ac.createGain(); o.type = 'sine';
    o.frequency.setValueAtTime(1500, t); o.frequency.exponentialRampToValueAtTime(350, t + dur);
    og.gain.setValueAtTime(0.0001, t); og.gain.exponentialRampToValueAtTime(0.07, t + dur * 0.8); og.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(og); og.connect(sfx); o.start(t); o.stop(t + dur + 0.05);
  };

  // ---------------- ambience ----------------
  let ocean, wind, rain, windF, crackleT = 0, birdT = 2, cricketT = 0, dripT = 0;
  let river, leaves, crowd, battle, scapeT = 0, waveT = 3, gullT = 5, owlT = 7, frogT = 2, forgeT = 1, townT = 4, clangT = 1;
  // what the camera sees is what you hear
  const scape = A.scape = { sea: 0, river: 0, forest: 0, town: 0, snow: 0, desert: 0, swamp: 0, people: 0, fight: 0, forge: null, sell: 0, pets: [], zoomF: 1, fightAt: null };
  function loopNoise(filtType, f, q, gain) {
    const s = ac.createBufferSource(); s.buffer = noise; s.loop = true;
    const fl = ac.createBiquadFilter(); fl.type = filtType; fl.frequency.value = f; if (q) fl.Q.value = q;
    const g = ac.createGain(); g.gain.value = gain;
    s.connect(fl); fl.connect(g); g.connect(amb); s.start();
    return { s, fl, g };
  }
  function startAmbience() {
    ocean = loopNoise('lowpass', 420, 0, 0.06);
    wind = loopNoise('bandpass', 500, 0.6, 0.02); windF = wind.fl;
    rain = loopNoise('highpass', 900, 0, 0.0);
    river = loopNoise('bandpass', 1500, 1.1, 0);
    { const l = ac.createOscillator(); const lg = ac.createGain(); l.frequency.value = 3.1; lg.gain.value = 520; l.connect(lg); lg.connect(river.fl.frequency); l.start(); }
    leaves = loopNoise('highpass', 3200, 0, 0);
    crowd = loopNoise('bandpass', 520, 0.9, 0);
    { const l = ac.createOscillator(); const lg = ac.createGain(); l.frequency.value = 0.7; lg.gain.value = 160; l.connect(lg); lg.connect(crowd.fl.frequency); l.start(); }
    battle = loopNoise('lowpass', 650, 0, 0);
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 7000; rain.g.disconnect(); rain.g.connect(lp); lp.connect(amb);
    musicLoop();
  }
  function analyse() {
    const S = G.S; const R = G.Render; const W = G.W; const T = G.T;
    let sea = 0, riv = 0, forest = 0, town = 0, snow = 0, desert = 0, swamp = 0, n = 0;
    for (let gy = 0; gy < 7; gy++) for (let gx = 0; gx < 11; gx++) {
      const [x, y] = R.screenToTile((gx + 0.5) / 11 * R.VW, (gy + 0.5) / 7 * R.VH); n++;
      if (!W.inb(x, y)) { sea++; continue; }
      const i = W.idx(x, y); const ty = S.type[i];
      if (ty <= T.SEA) sea++; else if (ty === T.RIVER) riv++;
      if (S.treeAt[i]) forest++; if (S.occ[i]) town++;
      const b = S.biome ? S.biome[i] : 0; if (b === 1 || b === 2) snow++; else if (b === 6) desert++; else if (b === 3) swamp++;
    }
    Object.assign(scape, { sea: sea / n, river: riv / n, forest: forest / n, town: town / n, snow: snow / n, desert: desert / n, swamp: swamp / n });
    const vis = (x, y) => { const [sx, sy] = R.proj(x, y, 2); const [px, py] = R.worldPxToScreen(sx, sy); return px > -40 && py > -40 && px < R.VW + 40 && py < R.VH + 40; };
    let people = 0, sell = 0; scape.forge = null;
    for (const v of S.villagers.values()) { if (v.inside || v.aboard || !vis(v.x, v.y)) continue; people++; if (!scape.forge && v.act === 'forge') scape.forge = v; if (v.act === 'sell' || v.act === 'buy') sell++; }
    let fight = 0; scape.fightAt = null; for (const v of G.War.fighters) if (vis(v.x, v.y)) { fight++; if (!scape.fightAt || G.R() < 0.2) scape.fightAt = v; }
    scape.pets = []; for (const a of S.animals.values()) { if ((a.kind === 'cao' || a.kind === 'galinha') && scape.pets.length < 6 && vis(a.x, a.y)) scape.pets.push(a); }
    scape.people = people; scape.sell = sell; scape.fight = fight;
    // waterfalls roar when they are on screen; the high mountains whistle
    let falls = 0; for (const f of (S.relief && S.relief.falls) || []) if (vis(f.tx + 0.5, f.ty + 0.5)) falls += Math.min(2, f.drop / 2);
    scape.falls = falls;
    const [cx, cy] = R.screenToTile(R.VW / 2, R.VH / 2); scape.alt = W.inb(cx, cy) ? Math.max(0, W.tileH(W.idx(cx, cy)) - G.SEA) : 0;
    scape.zoomF = G.clamp((R.cam.zoom - 0.45) / 1.4, 0.15, 1);
  }
  A.update = function (dt) {
    if (!ac || ac.state !== 'running' || !G.S) return;
    const S = G.S; const t = ac.currentTime;
    const zoom = G.Render.cam.zoom;
    scapeT -= dt; if (scapeT <= 0) { scapeT = 0.5; analyse(); }
    const zf = scape.zoomF, night0 = G.Render.nightness() > 0.55;
    const coast = Math.min(1, scape.sea * 2.2);
    // under the ground the world above goes quiet: drips, and the hum of the rock
    const UND = !!(G.Render.under && S.ug), uf = UND ? 0.07 : 1;
    ocean.g.gain.setTargetAtTime(((0.018 + 0.05 * coast) * (1 + 0.35 * Math.sin(t * 0.35)) + 0.012 / zoom) * uf, t, 0.6);
    river.g.gain.setTargetAtTime(Math.min(1.8, scape.river * 7 + (scape.falls || 0) * 0.6) * 0.05 * zf * uf, t, 0.6);
    leaves.g.gain.setTargetAtTime(Math.min(1, scape.forest * 1.6) * (0.25 + S.weather.windS) * 0.018 * zf * uf, t, 0.8);
    const busy = scape.people ? Math.min(1, Math.log(1 + scape.people) / 4.2) : 0;
    crowd.g.gain.setTargetAtTime(busy * (night0 ? 0.25 : 1) * (0.05 + Math.min(0.03, scape.sell * 0.006)) * zf * uf, t, 0.8);
    battle.g.gain.setTargetAtTime(Math.min(1, scape.fight / 14) * 0.13 * zf * uf, t, 0.4);
    wind.g.gain.setTargetAtTime(UND ? 0.03 : 0.012 + S.weather.windS * 0.06 + (scape.snow + scape.desert) * 0.03 + (1 - zf) * 0.02 + Math.min(0.03, (scape.alt || 0) * 0.0012), t, 0.5);
    windF.frequency.setTargetAtTime(UND ? 140 + Math.sin(t * 0.13) * 30 : 350 + S.weather.windS * 500 + Math.sin(t * 0.2) * 80, t, 0.5);
    if (UND && A.ambOn) { dripT -= dt; if (dripT <= 0) { dripT = G.rr(0.3, 1.5); const f = G.rr(800, 2000); osc('sine', f, t, 0.14, 0.045, amb, f * 0.42); if (G.R() < 0.3) osc('sine', f * 1.5, t + 0.18, 0.1, 0.02, amb, f * 0.6); } }
    // rain loudness from global + visible clouds
    let r = S.weather.rain;
    for (const c of S.clouds) { const [sx, sy] = G.Render.proj(c.x, c.y, 2); const [px, py] = G.Render.worldPxToScreen(sx, sy); if (px > -200 && px < G.Render.VW + 200 && py > -200 && py < G.Render.VH + 200) r = Math.max(r, G.Nature.cloudIntensity(c) * 0.8); }
    rain.g.gain.setTargetAtTime(r * 0.22 * uf, t, 0.4);
    if (UND) return;
    // fire crackles
    let fires = 0; for (const i of G.Nature.fireSet) { fires++; if (fires > 12) break; }
    crackleT -= dt;
    if (fires && crackleT <= 0 && A.ambOn) {
      crackleT = G.rr(0.03, 0.18) / Math.min(4, fires * 0.5 + 0.5);
      nz(t, 0.02 + Math.random() * 0.03, 0.05 + Math.random() * 0.08 * Math.min(1, fires / 6), 'bandpass', 1500 + Math.random() * 3000, 1.5, amb);
    }
    const night = G.Render.nightness() > 0.55;
    birdT -= dt;
    if (!night && birdT <= 0 && S.weather.rain < 0.2 && scape.forest + scape.town * 0.3 > 0.04 && scape.snow < 0.6) {
      birdT = G.rr(1.5, 6) / Math.min(2, 0.5 + scape.forest * 3);
      if (G.R() < 0.25) A.play(G.R() < 0.6 ? 'trill' : 'cuckoo', zf);
      else { const f = G.rr(2400, 4200); const n = G.ri(2, 4); for (let k = 0; k < n; k++) osc('sine', f * G.rr(0.9, 1.1), t + k * 0.11, 0.07, 0.018, amb, f * G.rr(1.1, 1.4)); }
    }
    if (A.ambOn) {
      waveT -= dt; if (coast > 0.12 && waveT <= 0) { waveT = G.rr(3, 7); A.play('wave', coast); }
      gullT -= dt; if (coast > 0.1 && !night && gullT <= 0) { gullT = G.rr(5, 14); A.play('gull', Math.min(1, coast + 0.2) * zf); }
      owlT -= dt; if (night && scape.forest > 0.12 && owlT <= 0) { owlT = G.rr(8, 18); A.play('owl', zf); }
      frogT -= dt; if (night && (scape.river > 0.03 || scape.swamp > 0.1) && frogT <= 0) { frogT = G.rr(0.8, 2.6); A.play('frog', zf); }
      forgeT -= dt; if (scape.forge && forgeT <= 0) { forgeT = G.rr(0.55, 1); A.at(scape.forge.x, scape.forge.y, 'hammer'); }
      townT -= dt; if (scape.pets.length && townT <= 0 && !night) { townT = G.rr(4, 10); const a = G.pick(scape.pets); A.at(a.x, a.y, a.kind === 'cao' ? 'bark' : 'cluck'); }
      clangT -= dt; if (scape.fight > 1 && clangT <= 0 && scape.fightAt) { clangT = G.rr(0.15, 0.7) * 6 / Math.min(12, scape.fight + 2); A.at(scape.fightAt.x + G.rr(-1, 1), scape.fightAt.y + G.rr(-1, 1), G.R() < 0.6 ? 'clang' : 'hit'); }
    }
    cricketT -= dt;
    if (night && cricketT <= 0) {
      cricketT = G.rr(0.4, 1.4);
      for (let k = 0; k < 3; k++) osc('sine', 4600, t + k * 0.05, 0.03, 0.01, amb);
    }
  };

  // ---------------- generative music ----------------
  const CHORDS = [[0, 2, 4], [3, 5, 7], [1, 3, 5], [4, 6, 8]];
  let beat = 0, chord = 0;
  function pluck(f, t, v, dest) {
    const o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter();
    o.type = 'triangle'; o2.type = 'sine'; o.frequency.value = f; o2.frequency.value = f * 2.001;
    lp.type = 'lowpass'; lp.frequency.setValueAtTime(2800, t); lp.frequency.exponentialRampToValueAtTime(600, t + 1.5);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
    const g2 = ac.createGain(); g2.gain.value = 0.25;
    o.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); g.connect(dest); g.connect(revIn);
    o.start(t); o2.start(t); o.stop(t + 2.3); o2.stop(t + 2.3);
  }
  function pad(freqs, t, dur) {
    for (const f of freqs) {
      const o = ac.createOscillator(); const g = ac.createGain(); o.type = 'sine'; o.frequency.value = f / 2;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.035, t + dur * 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(mus); g.connect(revIn); o.start(t); o.stop(t + dur + 0.1);
    }
  }
  function musicLoop() {
    if (!ac) return;
    const night = G.S && G.Render ? G.Render.nightness() > 0.55 : false;
    const step = night ? 0.85 : 0.62;
    if (A.musicOn && ac.state === 'running') {
      const t = ac.currentTime + 0.05;
      if (beat % 16 === 0) { chord = (chord + (Math.random() < 0.7 ? 1 : 2)) % CHORDS.length; pad(CHORDS[chord].map(i => PENTA[i]), t, step * 16); }
      const tension = G.S ? (G.S.meteors.length > 0 || G.Nature.fireSet.size > 5) : false;
      if (Math.random() < (night ? 0.28 : 0.42)) {
        const c = CHORDS[chord];
        let idx = c[Math.floor(Math.random() * 3)] + (Math.random() < 0.4 ? 2 : 0);
        idx = Math.min(PENTA.length - 1, idx + (night ? 0 : 2));
        pluck(PENTA[idx] * (tension ? 0.5 : 1), t, night ? 0.05 : 0.065, mus);
      }
      beat++;
    }
    setTimeout(musicLoop, (night ? 0.85 : 0.62) * 1000);
  }
})(window.G);
