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
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (G.VR() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    rev.buffer = ir;
    revIn = ac.createGain(); revIn.gain.value = 0.35; revIn.connect(rev); const rg = ac.createGain(); rg.gain.value = 0.5; rev.connect(rg); rg.connect(master);
    noise = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const nd = noise.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = G.VR() * 2 - 1;
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
  // a sound's own way out: its side (pan) and the walls between it and the ear (muffle), then the bus it belongs to. While
  // a sound of the library is being made, what it sends to the effects or to the ambience goes by this way (bus)
  let bus = null;
  const out = d => (bus && (!d || d === sfx || d === amb) ? bus : d || sfx);
  function way(sp) {
    let head = sp.to === 'amb' ? amb : sfx;
    if (sp.pan && ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = G.clamp(sp.pan, -1, 1); p.connect(head); head = p; }
    if (sp.muf) { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2400 - 1900 * G.clamp(sp.muf, 0, 1); f.Q.value = 0.4; f.connect(head); head = f; }
    return head;
  }
  function osc(type, f, t, dur, peak, dest, f2, a) {
    const o = ac.createOscillator(); const g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    env(g, t, a || 0.005, peak, dur);
    o.connect(g); g.connect(out(dest));
    o.start(t); o.stop(t + (a || 0.005) + dur + 0.05);
    return { o, g };
  }
  function nz(t, dur, peak, filt, f, q, dest, f2, a) {
    const s = ac.createBufferSource(); s.buffer = noise; s.loop = true;
    const fl = ac.createBiquadFilter(); fl.type = filt; fl.frequency.setValueAtTime(f, t); if (q) fl.Q.value = q;
    if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const g = ac.createGain(); env(g, t, a || 0.004, peak, dur);
    s.connect(fl); fl.connect(g); g.connect(out(dest));
    s.start(t, G.VR()); s.stop(t + (a || 0.004) + dur + 0.05);
    return g;
  }
  // a voice with no words: a reed's buzz through a mouth (a band of it), sliding from one pitch to another
  function voc(f, t, dur, peak, ff, f2, a) {
    const o = ac.createOscillator(), fl = ac.createBiquadFilter(), g = ac.createGain();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    fl.type = 'bandpass'; fl.frequency.value = ff; fl.Q.value = 2.5;
    env(g, t, a || 0.03, peak, dur);
    o.connect(fl); fl.connect(g); g.connect(out());
    o.start(t); o.stop(t + (a || 0.03) + dur + 0.05);
    return g;
  }
  const PENTA = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
  const NONE = {};

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
      const sh = ac.createWaveShaper(); const cur = new Float32Array(256); for (let i = 0; i < 256; i++) { const x = i / 128 - 1; cur[i] = Math.tanh(x * 3); } sh.curve = cur; sh.connect(out(sfx));
      osc('sine', 120, t, 2.2, 0.9 * v, sh, 26, 0.01);
      nz(t, 3.5, 0.9 * v, 'lowpass', 1400, 0, sh, 90, 0.01);
      const g = nz(t + 0.1, 4, 0.5 * v, 'lowpass', 400, 0, sfx, 60, 0.2); g.connect(revIn);
    },
    rainStart: (t, v) => nz(t, 1.2, 0.18 * v, 'highpass', 1500, 0, sfx, 0, 0.4),
    magic: (t, v) => { for (let k = 0; k < 8; k++) { const f = PENTA[5 + Math.floor(G.VR() * 6)] * (G.VR() < 0.3 ? 2 : 1); const n = osc('sine', f, t + k * 0.07, 0.7, 0.05 * v); n.g.connect(revIn); } },
    // a story begins (a plucked rising figure) — or closes (the same, falling)
    saga: (t, v) => { [329.63, 440, 554.37, 659.25].forEach((f, k) => { const n = osc('triangle', f, t + k * 0.11, 1.6, 0.045 * v, sfx, 0, 0.25); n.g.connect(revIn); }); },
    sagaEnd: (t, v) => { [659.25, 554.37, 440, 329.63].forEach((f, k) => { const n = osc('triangle', f, t + k * 0.14, 1.9, 0.04 * v, sfx, 0, 0.25); n.g.connect(revIn); }); },
    heal: (t, v) => { [392, 493.9, 587.3, 783.99].forEach((f, k) => { const n = osc('sine', f, t + k * 0.05, 1.8, 0.06 * v, sfx, 0, 0.3); n.g.connect(revIn); }); LIB.magic(t + 0.2, v * 0.7); },
    fertility: (t, v) => { [523.25, 659.25, 783.99, 987.8, 1174.7, 1318.5].forEach((f, k) => { const n = osc('triangle', f, t + k * 0.08, 1.2, 0.05 * v); n.g.connect(revIn); }); },
    splash: (t, v) => { nz(t, 0.25, 0.25 * v, 'bandpass', 1300, 1, sfx, 500); },
    coin: (t, v) => { for (let k = 0; k < 3; k++) { osc('sine', 2400 + k * 380, t + k * 0.07, 0.12, 0.06 * v, sfx, 2100 + k * 300); osc('triangle', 3600 + k * 200, t + k * 0.07, 0.05, 0.03 * v); } },
    thud: (t, v) => { osc('sine', 110, t, 0.2, 0.4 * v, sfx, 50); nz(t, 0.12, 0.25 * v, 'lowpass', 400); },
    hit: (t, v) => { nz(t, 0.08, 0.3 * v, 'bandpass', 900, 2); osc('square', 200, t, 0.05, 0.05 * v, sfx, 120); },
    bite: (t, v) => { nz(t, 0.07, 0.25 * v, 'bandpass', 2500, 3); },
    horn: (t, v) => { for (const [f, d] of [[146.83, 0], [220, 0.04], [293.66, 0.5]]) { const n = osc('sawtooth', f, t + d, d ? 0.9 : 1.5, 0.035 * v, sfx, f * 1.015, 0.18); n.g.connect(revIn); } nz(t, 1.2, 0.04 * v, 'bandpass', 600, 1); },
    swish: (t, v) => { nz(t, 0.14, 0.12 * v, 'bandpass', 3400, 2, sfx, 1500); },
    // war: a wet cut, metal on metal, a cry cut short
    gore: (t, v) => { nz(t, 0.16, 0.38 * v, 'bandpass', 700, 1.2, sfx, 260); osc('sine', 95, t, 0.18, 0.3 * v, sfx, 50); nz(t + 0.05, 0.25, 0.12 * v, 'lowpass', 500, 0, sfx, 200, 0.02); },
    clang: (t, v) => { for (const [f, a] of [[2310, 0.07], [3470, 0.045], [5120, 0.03]]) { const n = osc('sine', f, t, 0.35, a * v, sfx, f * 0.98); n.g.connect(revIn); } nz(t, 0.03, 0.15 * v, 'highpass', 4000); },
    scream: (t, v) => {
      const o = ac.createOscillator(); o.type = 'sawtooth'; const f0 = G.vrr(360, 520);
      o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * 1.15, t + 0.08); o.frequency.exponentialRampToValueAtTime(f0 * 0.45, t + 0.55);
      const f1 = ac.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.value = 900; f1.Q.value = 4;
      const f2 = ac.createBiquadFilter(); f2.type = 'bandpass'; f2.frequency.value = 1500; f2.Q.value = 5;
      const g = ac.createGain(); env(g, t, 0.02, 0.05 * v, 0.55);
      o.connect(f1); o.connect(f2); f1.connect(g); f2.connect(g); g.connect(out(sfx)); g.connect(revIn); o.start(t); o.stop(t + 0.65);
    },
    caw: (t, v) => { for (const d of [0, 0.32]) { osc('square', 620, t + d, 0.16, 0.025 * v, amb, 430, 0.01); nz(t + d, 0.14, 0.03 * v, 'bandpass', 1300, 3, amb); } },
    bark: (t, v) => { for (const d of [0, 0.22]) { osc('sawtooth', 420, t + d, 0.09, 0.035 * v, sfx, 260, 0.005); nz(t + d, 0.07, 0.06 * v, 'bandpass', 900, 2); } },
    cluck: (t, v) => { for (let k = 0; k < 3; k++) osc('square', 880 - k * 60, t + k * 0.09, 0.05, 0.012 * v, amb, 620); },
    rooster: (t, v) => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(560, t); o.frequency.linearRampToValueAtTime(760, t + 0.25); o.frequency.linearRampToValueAtTime(700, t + 0.7); o.frequency.linearRampToValueAtTime(420, t + 1.1); const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 3; const g = ac.createGain(); env(g, t, 0.05, 0.05 * v, 1.1); o.connect(f); f.connect(g); g.connect(out(amb)); g.connect(revIn); o.start(t); o.stop(t + 1.2); },
    flap: (t, v) => { for (let k = 0; k < 5; k++) nz(t + k * 0.05, 0.04, 0.05 * v, 'bandpass', 1800, 1, amb); },
    whoosh: (t, v) => { nz(t, 0.34, 0.16 * v, 'bandpass', 520, 0.8); nz(t + 0.06, 0.26, 0.1 * v, 'bandpass', 1300, 1.2); },
    shutter: (t, v) => { nz(t, 0.03, 0.4 * v, 'highpass', 3000); nz(t + 0.07, 0.04, 0.3 * v, 'bandpass', 2200, 2); osc('square', 1800, t, 0.02, 0.05 * v); },
    // a door of planks: the latch lifted, the hinges' creak as it swings; shut, the thud of the leaf on its frame and the latch
    door: (t, v) => { osc('square', 1400, t, 0.02, 0.03 * v, sfx, 900); nz(t + 0.05, 0.45, 0.07 * v, 'bandpass', 520, 9, sfx, 340, 0.08); nz(t + 0.12, 0.3, 0.04 * v, 'bandpass', 760, 12, sfx, 610, 0.05); },
    doorShut: (t, v) => { osc('sine', 115, t, 0.16, 0.32 * v, sfx, 60); nz(t, 0.09, 0.22 * v, 'lowpass', 650); osc('square', 1700, t + 0.1, 0.02, 0.04 * v, sfx, 1100); },
    gull: (t, v) => { for (let k = 0; k < 3; k++) { osc('sine', 1350, t + k * 0.2, 0.16, 0.018 * v, amb, 820, 0.01); nz(t + k * 0.2, 0.12, 0.01 * v, 'bandpass', 2400, 4, amb); } },
    owl: (t, v) => { for (const [d, f, l] of [[0, 390, 0.35], [0.5, 330, 0.6]]) { const n = osc('sine', f, t + d, l, 0.03 * v, amb, f * 0.94, 0.05); n.g.connect(revIn); } },
    bees: (t, v) => { for (let k = 0; k < 3; k++) osc('sawtooth', 210 + k * 37 + G.VR() * 20, t + k * 0.05, 0.9, 0.006 * v, amb, 230 + k * 30, 0.15); },
    monkey: (t, v) => { const n = 3 + (G.VR() * 3 | 0); for (let k = 0; k < n; k++) osc('square', 620 + G.VR() * 200, t + k * 0.12, 0.08, 0.01 * v, amb, 900, 0.01); },
    frog: (t, v) => { const n = 2 + (G.VR() * 3 | 0); for (let k = 0; k < n; k++) osc('square', 190, t + k * 0.11, 0.06, 0.012 * v, amb, 120, 0.005); },
    trill: (t, v) => { const f = G.vrr(3200, 4600); for (let k = 0; k < 8; k++) osc('sine', f + (k % 2) * 300, t + k * 0.045, 0.035, 0.013 * v, amb); },
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
        o.connect(g); g.connect(out(sfx)); g.connect(revIn); o.start(t + d); lfo.start(t + d); o.stop(t + d + 2.5); lfo.stop(t + d + 2.5);
      }
    },
  };

  // ---------------- the stories' own sounds ----------------
  Object.assign(LIB, {
    // a dramatic hit: a low boom under a dark chord
    sting: (t, v) => { osc('sine', 62, t, 1.4, 0.32 * v, sfx, 38, 0.01); nz(t, 0.9, 0.14 * v, 'lowpass', 900, 0, sfx, 120, 0.02); for (const f of [220, 261.63, 311.13, 415.3]) { const n = osc('triangle', f, t + 0.02, 2.2, 0.035 * v, mus, 0, 0.04); n.g.connect(revIn); } },
    reveal: (t, v) => { for (let k = 0; k < 7; k++) { const n = osc('sine', [880, 1046.5, 1318.5, 1567.98, 1760, 2093, 2637][k], t + k * 0.07, 1.8, 0.03 * v, sfx, 0, 0.05); n.g.connect(revIn); } nz(t, 1.2, 0.05 * v, 'highpass', 4000, 0, sfx, 0, 0.4); },
    heartbeat: (t, v) => { osc('sine', 64, t, 0.16, 0.42 * v, sfx, 44); osc('sine', 58, t + 0.2, 0.2, 0.32 * v, sfx, 40); },
    twig: (t, v) => { nz(t, 0.05, 0.42 * v, 'highpass', 2600); nz(t + 0.03, 0.04, 0.3 * v, 'bandpass', 1500, 3); },
    arrow: (t, v) => { osc('sine', 1900, t, 0.28, 0.05 * v, sfx, 700); nz(t, 0.26, 0.08 * v, 'bandpass', 3000, 2, sfx, 1200); osc('sine', 140, t + 0.3, 0.08, 0.3 * v, sfx, 90); nz(t + 0.3, 0.05, 0.2 * v, 'bandpass', 900, 2); },
    ropecut: (t, v) => { nz(t, 0.06, 0.4 * v, 'bandpass', 2200, 2); osc('triangle', 180, t + 0.02, 0.35, 0.12 * v, sfx, 70); },
    gasp: (t, v) => { nz(t, 0.35, 0.16 * v, 'bandpass', 900, 2, sfx, 2200, 0.08); },
    knock: (t, v) => { for (let k = 0; k < 3; k++) { osc('sine', 150, t + k * 0.24, 0.1, 0.4 * v, sfx, 80); nz(t + k * 0.24, 0.05, 0.2 * v, 'lowpass', 700); } },
    slam: (t, v) => { osc('sine', 90, t, 0.35, 0.5 * v, sfx, 40); nz(t, 0.18, 0.4 * v, 'lowpass', 900); },
    toll: (t, v) => { for (const [f, a] of [[196, 0.09], [392.4, 0.05], [587.3, 0.035], [831, 0.02]]) { const n = osc('sine', f, t, 4.5, a * v, sfx, 0, 0.005); n.g.connect(revIn); } },
    drumroll: (t, v) => { let d = 0; for (let k = 0; k < 16; k++) { const gap = 0.16 * Math.pow(0.86, k); d += gap; osc('sine', 100 + k * 2, t + d, 0.12, (0.12 + k * 0.012) * v, sfx, 60); nz(t + d, 0.05, 0.08 * v, 'bandpass', 600, 1); } },
    choir: (t, v) => { for (const f of [110, 164.8, 220]) { const o = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter(), lfo = ac.createOscillator(), lg = ac.createGain(); o.type = 'sawtooth'; o.frequency.value = f; lfo.frequency.value = 5.2; lg.gain.value = f * 0.012; lfo.connect(lg); lg.connect(o.frequency); lp.type = 'lowpass'; lp.frequency.value = 700; lp.Q.value = 6; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.025 * v, t + 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6); o.connect(lp); lp.connect(g); g.connect(out(sfx)); g.connect(revIn); o.start(t); lfo.start(t); o.stop(t + 2.7); lfo.stop(t + 2.7); } },
    triumph: (t, v) => { [392, 493.9, 587.3, 783.99, 987.8].forEach((f, k) => { const n = osc('sawtooth', f, t + k * 0.1, 0.9, 0.025 * v, sfx, 0, 0.03); n.g.connect(revIn); }); osc('sine', 98, t, 1.4, 0.18 * v, sfx); },
    sob: (t, v) => { for (let k = 0; k < 3; k++) nz(t + k * 0.32, 0.18, 0.06 * v, 'bandpass', 700 + k * 60, 3, sfx, 420); },
    // the dragon: a roar from deep in the chest, the rush of its breath
    roar: (t, v) => { const a = osc('sawtooth', 112, t, 1.9, 0.11 * v, sfx, 50, 0.16); a.g.connect(revIn); const b = osc('sawtooth', 167, t + 0.05, 1.6, 0.05 * v, sfx, 72, 0.22); b.g.connect(revIn); nz(t, 1.8, 0.24 * v, 'lowpass', 760, 1, sfx, 170, 0.12); nz(t + 0.1, 1.1, 0.08 * v, 'bandpass', 1500, 2, sfx, 520, 0.1); },
    flame: (t, v) => { nz(t, 1.1, 0.22 * v, 'bandpass', 600, 0.8, sfx, 1900, 0.08); nz(t + 0.12, 0.9, 0.1 * v, 'highpass', 2600, 0, sfx, 0, 0.1); },
    // the sea: the waters drawing back with a long roar, and their falling back
    seapart: (t, v) => { nz(t, 3.4, 0.34 * v, 'lowpass', 280, 0, sfx, 950, 0.8); osc('sine', 38, t, 3.1, 0.3 * v, sfx, 62, 0.6); const g = nz(t + 0.4, 2.8, 0.12 * v, 'bandpass', 1200, 0.7, amb, 560, 0.6); g.connect(revIn); },
    seaclose: (t, v) => { nz(t, 2.6, 0.5 * v, 'lowpass', 1300, 0, sfx, 190, 0.05); osc('sine', 54, t, 2.2, 0.42 * v, sfx, 30, 0.02); const g = nz(t + 0.2, 2, 0.18 * v, 'bandpass', 900, 0.6, amb, 300, 0.1); g.connect(revIn); },
  });
  // ---------------- the sounds of the places: the gestures, the trades, the voices, the beasts ----------------
  // (each one a line of the tables of audio-src.js — A.GESTO, A.ATO, A.BICHO — or of a building at work; o: what the source
  // gives the sound — the pitch of a person's voice, tom, the ladder of a people's scale, notas)
  Object.assign(LIB, {
    heave: (t, v, o) => { voc(96 * (o.tom || 1), t, 0.2, 0.05 * v, 520, 72 * (o.tom || 1)); nz(t + 0.06, 0.14, 0.05 * v, 'bandpass', 430, 7, sfx, 560); },
    clack: (t, v) => { osc('triangle', 620, t, 0.04, 0.1 * v, sfx, 380); nz(t, 0.03, 0.12 * v, 'bandpass', 1900, 3); },
    voz: (t, v, o) => { const f0 = 118 * (o.tom || 1); const n = 2 + (G.VR() * 3 | 0); for (let k = 0; k < n; k++) { const f = f0 * G.vrr(0.9, 1.22); voc(f, t + k * 0.16, 0.11, 0.05 * v, G.vpick([650, 900, 1250]), f * G.vrr(0.86, 1.1)); } },
    hey: (t, v, o) => { const f0 = 118 * (o.tom || 1); voc(f0 * 1.5, t, 0.32, 0.09 * v, 1050, f0 * 1.9, 0.04); },
    pregao: (t, v, o) => { const f0 = 118 * (o.tom || 1); [1.3, 1.62, 1.45].forEach((m, k) => voc(f0 * m, t + k * 0.26, 0.24, 0.07 * v, 950, f0 * m * (k === 2 ? 0.8 : 1.04), 0.04)); },
    cheer: (t, v, o) => { const f0 = 118 * (o.tom || 1); for (let k = 0; k < 3; k++) voc(f0 * (1.4 + k * 0.16), t + k * 0.07, 0.4, 0.045 * v, 1150, f0 * 2, 0.06); },
    murmur: (t, v) => { for (let k = 0; k < 4; k++) { const f = 100 + G.VR() * 130; voc(f, t + G.VR() * 0.7, 0.2, 0.024 * v, 480 + G.VR() * 520, f * G.vrr(0.9, 1.1)); } },
    chant: (t, v, o) => { const f0 = 110 * (o.tom || 1); const a = voc(f0, t, 1.4, 0.035 * v, 620, 0, 0.3); a.connect(revIn); voc(f0 * 1.5, t + 0.1, 1.2, 0.018 * v, 820, 0, 0.3); },
    hum: (t, v, o) => { const f0 = 196 * (o.tom || 1.3) / 1.3; osc('sine', f0 * 1.12, t, 0.8, 0.03 * v, sfx, 0, 0.2); osc('sine', f0, t + 0.9, 1, 0.03 * v, sfx, 0, 0.2); },
    lute: (t, v, o) => { const N = o.notas || PENTA; const f = N[Math.min(N.length - 1, 2 + (G.VR() * 6 | 0))]; osc('triangle', f, t, 0.9, 0.07 * v); osc('sine', f * 2, t, 0.4, 0.025 * v); if (G.VR() < 0.4) osc('triangle', N[Math.min(N.length - 1, 3 + (G.VR() * 5 | 0))], t + 0.25, 0.7, 0.05 * v); },
    slosh: (t, v) => { nz(t, 0.5, 0.1 * v, 'bandpass', 700, 1, sfx, 1400, 0.12); },
    pour: (t, v) => { nz(t, 0.7, 0.06 * v, 'bandpass', 1800, 2, sfx, 2600, 0.1); for (let k = 0; k < 4; k++) osc('sine', 700 + G.VR() * 500, t + 0.1 + k * 0.13, 0.05, 0.018 * v, sfx, 1100); },
    dig: (t, v) => { nz(t, 0.12, 0.2 * v, 'lowpass', 900, 0, sfx, 300); osc('sine', 120, t, 0.08, 0.12 * v, sfx, 70); },
    squelch: (t, v) => { nz(t, 0.16, 0.12 * v, 'bandpass', 500, 2, sfx, 250, 0.03); },
    slap: (t, v) => { nz(t, 0.05, 0.16 * v, 'bandpass', 1100, 1.5); osc('sine', 180, t, 0.05, 0.08 * v, sfx, 110); },
    wheel: (t, v) => { nz(t, 1.2, 0.04 * v, 'bandpass', 380, 3, sfx, 440, 0.3); },
    whirr: (t, v) => { nz(t, 0.9, 0.035 * v, 'bandpass', 2400, 5, sfx, 3000, 0.25); },
    loom: (t, v) => { osc('triangle', 520, t, 0.04, 0.09 * v, sfx, 360); nz(t, 0.03, 0.08 * v, 'bandpass', 1500, 2); osc('triangle', 410, t + 0.28, 0.04, 0.07 * v, sfx, 300); },
    anvil: (t, v) => { for (const [f, a] of [[1850, 0.1], [2760, 0.05], [4100, 0.03]]) { const n = osc('sine', f, t, 0.5, a * v, sfx, f * 0.995); n.g.connect(revIn); } nz(t, 0.03, 0.2 * v, 'bandpass', 2600, 2); },
    tink: (t, v) => { osc('sine', 3100 + G.VR() * 500, t, 0.09, 0.05 * v, sfx, 2900); },
    mint: (t, v) => { osc('triangle', 1700, t, 0.12, 0.14 * v, sfx, 1500); nz(t, 0.03, 0.2 * v, 'highpass', 3500); LIB.coin(t + 0.1, v * 0.6); },
    cup: (t, v) => { osc('sine', 1900, t, 0.06, 0.035 * v, sfx, 1700); osc('triangle', 420, t + 0.02, 0.05, 0.05 * v, sfx, 300); },
    scratch: (t, v) => { nz(t, 0.18, 0.03 * v, 'highpass', 4500, 0, sfx, 0, 0.02); nz(t + 0.25, 0.12, 0.025 * v, 'highpass', 5000); },
    cook: (t, v) => { nz(t, 0.6, 0.04 * v, 'bandpass', 900, 1.5, sfx, 600, 0.15); for (let k = 0; k < 3; k++) osc('sine', 300 + G.VR() * 200, t + k * 0.18, 0.05, 0.02 * v, sfx, 500); },
    drill: (t, v, o) => { nz(t, 0.14, 0.1 * v, 'bandpass', 3000, 2, sfx, 1400); osc('sine', 100, t + 0.16, 0.1, 0.2 * v, sfx, 60); voc(140 * (o.tom || 1), t + 0.02, 0.1, 0.04 * v, 800); },
    scythe: (t, v) => { nz(t, 0.28, 0.1 * v, 'bandpass', 4200, 1.5, sfx, 1800, 0.05); },
    hoe: (t, v) => { nz(t, 0.08, 0.16 * v, 'lowpass', 700); osc('sine', 140, t, 0.07, 0.1 * v, sfx, 80); },
    rustle: (t, v) => { nz(t, 0.3, 0.035 * v, 'highpass', 3000, 0, sfx, 0, 0.1); },
    snip: (t, v) => { for (let k = 0; k < 2; k++) nz(t + k * 0.09, 0.03, 0.08 * v, 'highpass', 5000); },
    sweep: (t, v) => { nz(t, 0.35, 0.06 * v, 'bandpass', 2600, 1, sfx, 1500, 0.08); },
    creak: (t, v) => { nz(t, 0.45, 0.05 * v, 'bandpass', 600, 10, sfx, 820, 0.08); voc(180, t, 0.4, 0.02 * v, 900, 240, 0.1); },
    cleaver: (t, v) => { osc('sine', 150, t, 0.08, 0.25 * v, sfx, 80); nz(t, 0.04, 0.18 * v, 'bandpass', 1400, 2); },
    clap: (t, v) => { nz(t, 0.035, 0.16 * v, 'bandpass', 1500, 1.2); nz(t + 0.012, 0.03, 0.1 * v, 'bandpass', 2300, 1.5); },
    sail: (t, v) => { nz(t, 1.6, 0.06 * v, 'lowpass', 600, 0, sfx, 300, 0.5); nz(t + 0.3, 0.25, 0.04 * v, 'bandpass', 1500, 1); },
    fornalha: (t, v) => { nz(t, 1.2, 0.09 * v, 'lowpass', 420, 0, sfx, 260, 0.3); nz(t + G.VR() * 0.6, 0.03, 0.08 * v, 'bandpass', 2200, 2); },
    baa: (t, v, o) => { const f = 300 * (o.tom || 1); voc(f, t, 0.25, 0.06 * v, 1100, f * 1.08, 0.05); voc(f * 1.05, t + 0.27, 0.3, 0.05 * v, 1000, f * 0.85); },
    moo: (t, v) => { voc(112, t, 1, 0.08 * v, 420, 96, 0.15); },
    oink: (t, v) => { for (let k = 0; k < 2; k++) voc(190, t + k * 0.2, 0.12, 0.06 * v, 700, 150); },
    neigh: (t, v) => { voc(720, t, 0.7, 0.05 * v, 1800, 300, 0.05); },
    meow: (t, v) => { voc(520, t, 0.45, 0.04 * v, 1500, 400, 0.08); },
    coo: (t, v) => { for (let k = 0; k < 3; k++) osc('sine', 420, t + k * 0.28, 0.2, 0.02 * v, sfx, 360, 0.05); },
    gobble: (t, v) => { for (let k = 0; k < 5; k++) osc('square', 520 - k * 30, t + k * 0.07, 0.05, 0.012 * v, sfx, 380); },
  });
  A.sons = () => Object.keys(LIB); // (for the proofs: every sound a table names is in the library)
  // the music leans to the scene: a held breath, a grief, a wonder (null: back to the world's own music)
  A.mood = function (m) { A.moodNow = m || null; A.moodT = 0; };
  const GAP = { chop: 0.07, hammer: 0.06, mine: 0.07, hit: 0.05, hover: 0.04, swish: 0.08, horn: 1.2, fire: 0.3, gore: 0.12, clang: 0.06, scream: 0.4, caw: 0.6, drum: 1.4, bark: 0.35, cluck: 0.5, rooster: 3, flap: 0.5, gull: 2, owl: 4, frog: 0.8, trill: 1, cuckoo: 3, wave: 1.5, bees: 1.6, monkey: 2.5,
    voz: 0.16, hey: 0.5, pregao: 1.2, cheer: 0.5, murmur: 0.45, chant: 0.7, hum: 1.2, lute: 0.16, anvil: 0.14, clap: 0.08, sail: 1, fornalha: 0.6, baa: 1.2, moo: 2.5, oink: 1, neigh: 3, meow: 3, coo: 1.5, gobble: 1.5, scythe: 0.2, hoe: 0.2, loom: 0.2 };
  // one sound of the library, now: sp — its way out (pan: the side; muf: the walls between; to: 'amb' for a sound of the
  // place, which the ambience's switch rules; o: what the source gives it)
  function emit(name, vol, sp) {
    const fn = LIB[name]; if (!fn) return false;
    const now = ac.currentTime;
    if (last[name] && now - last[name] < (GAP[name] || 0.02)) return false;
    last[name] = now;
    bus = sp && (sp.pan || sp.muf || sp.to === 'amb') ? way(sp) : null;
    try { fn(now + 0.01, vol === undefined ? 1 : vol, (sp && sp.o) || NONE); } catch (e) { } finally { bus = null; }
    return true;
  }
  A.play = function (name, vol, sp) {
    if (!ac || !A.sfxOn || A.mute || ac.state !== 'running') return;
    emit(name, vol, sp);
  };
  // the ear of now: the body's, where the god lives one (it hears from where the body stands, turned as the eye is — the
  // camera's heading —, shut in what the body is shut in); else the god's, at the middle of the screen, its right side the
  // screen's, hearing as far as the screen shows and less from high above. A.ouvido, when set, is the ear (the proofs')
  A.ear = function () {
    if (A.ouvido) return A.ouvido;
    const S = G.S; const R = G.Render; if (!S || !A.earOf) return null;
    const body = G.Modes && !G.Modes.god() && S.avatar ? S.villagers.get(S.avatar.id) : null;
    if (body) return A.earOf({ x: body.x, y: body.y, yaw: G.Cam3D ? G.Cam3D.yaw : NaN, inside: body.inside, ug: body.ug, modo: 'corpo' });
    if (!R || !(R.VW > 0) || !(R.VH > 0)) return null;
    const c = R.screenToTile(R.VW / 2, R.VH / 2);
    const o = R.proj(c[0], c[1], 0), ax = R.proj(c[0] + 1, c[1], 0), ay = R.proj(c[0], c[1] + 1, 0);
    const rx = ax[0] - o[0], ry = ay[0] - o[0]; const px = Math.hypot(rx, ry) || 1; // (the screen's pixels a tile to the right is)
    return A.earOf({ x: c[0] + 0.5, y: c[1] + 0.5, rx, ry, r: Math.max(6, R.VW / 2 / R.cam.zoom / px * 1.25), k: G.clamp((R.cam.zoom - 0.8) / 1.4, 0, 1), ug: R.under && S.ug, modo: 'deus' });
  };
  // a sound of the world at a place (a blow, a splash, a horn): heard by the ear of now — the distance, the side, the walls
  // (a place under a roof is the building's inside); important: heard from afar and from any height
  A.at = function (x, y, name, important, vol) {
    if (!ac || !G.Render || A.mute || !A.hear) return;
    let ear = A.ouvido || earNow || A.ear(); if (!ear) return; // (the frame's ear: a battle rings many blows a step)
    if (important) ear = Object.assign({}, ear, { k: 1 });
    const W = G.W; const bid = W.inb(Math.floor(x), Math.floor(y)) ? G.S.occ[W.idx(Math.floor(x), Math.floor(y))] : 0;
    const h = A.hear(ear, x, y, bid ? A.fechado(bid) : 0, 1.25);
    const v = important ? Math.max(h.gain, 0.35) : h.gain;
    if (v < 0.04) return;
    A.play(name, v * (vol || 1), { pan: h.pan, muf: h.muf });
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
  let river, leaves, crowd, battle, scapeT = 0, waveT = 3, gullT = 5, owlT = 7, frogT = 2;
  // what the ear has around it is what you hear: the land (here), the people and the works (the scene, audio-src.js)
  const scape = A.scape = { sea: 0, river: 0, forest: 0, town: 0, snow: 0, desert: 0, swamp: 0, people: 0, fight: 0, sell: 0, zoomF: 1, falls: 0, alt: 0, fires: 0 };
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
  // the land about the ear: what the screen shows, for the god; the ground around the body, for one who lives it
  function analyse(ear) {
    const S = G.S; const R = G.Render; const W = G.W; const T = G.T;
    let sea = 0, riv = 0, forest = 0, town = 0, snow = 0, desert = 0, swamp = 0, n = 0;
    const tile = (x, y) => {
      n++; if (!W.inb(x, y)) { sea++; return; }
      const i = W.idx(x, y); const ty = S.type[i];
      if (ty <= T.SEA) sea++; else if (ty === T.RIVER) riv++;
      if (S.treeAt[i]) forest++; if (S.occ[i]) town++;
      const b = S.biome ? S.biome[i] : 0; if (b === 1 || b === 2) snow++; else if (b === 6) desert++; else if (b === 3) swamp++;
    };
    if (ear.modo === 'deus' && R.VW > 0) { for (let gy = 0; gy < 7; gy++) for (let gx = 0; gx < 11; gx++) { const [x, y] = R.screenToTile((gx + 0.5) / 11 * R.VW, (gy + 0.5) / 7 * R.VH); tile(x, y); } }
    else { const st = ear.r / 4.8; for (let gy = -4; gy <= 4; gy++) for (let gx = -4; gx <= 4; gx++) tile(Math.floor(ear.x + gx * st), Math.floor(ear.y + gy * st)); }
    Object.assign(scape, { sea: sea / n, river: riv / n, forest: forest / n, town: town / n, snow: snow / n, desert: desert / n, swamp: swamp / n });
    const near = (x, y, k) => Math.hypot(x - ear.x, y - ear.y) < ear.r * (k || 1);
    // waterfalls roar when they are near; the high mountains whistle; a fire crackles where it burns
    let falls = 0; for (const f of (S.relief && S.relief.falls) || []) if (near(f.tx + 0.5, f.ty + 0.5, 1.2)) falls += Math.min(2, f.drop / 2);
    scape.falls = falls;
    let fires = 0, seenF = 0; for (const i of G.Nature.fireSet) { if (++seenF > 600) break; if (near(i % G.N + 0.5, Math.floor(i / G.N) + 0.5, 1.3)) { fires++; if (fires > 12) break; } }
    scape.fires = fires;
    const ex = Math.floor(ear.x), ey = Math.floor(ear.y); scape.alt = W.inb(ex, ey) ? Math.max(0, W.tileH(W.idx(ex, ey)) - G.SEA) : 0;
    scape.zoomF = ear.modo === 'deus' ? G.clamp((R.cam.zoom - 0.45) / 1.4, 0.15, 1) : 1;
  }

  // ---------------- the place: what the scene says would sound, sounded ----------------
  // each source rings by its own clock: at its gesture's contact, again while the gesture lasts, or when the ear's chance
  // says (a beast's voice). Only the look's chance is drawn; the world is only read
  let cena = null, earNow = null; const rung = new Map(); let stamp = 0, bedMix = null, bedAt = 0; const bedT = {};
  G.worldHooks.push(() => { cena = null; A.cena = null; earNow = null; rung.clear(); bedMix = null; bedAt = 0; scapeT = 0; A.musNow = null; });
  A.tocou = []; // (what the place rang, and of whom — kept while A.gravar is on: the proofs')
  function ring(f, vol, far) {
    if (!emit(f.s, vol, { pan: f.pan, muf: far ? Math.max(0.7, f.muf || 0) : f.muf, to: 'amb', o: { tom: f.tom, notas: f.notas || null } })) return;
    if (A.gravar) { A.tocou.push({ t: ac.currentTime, s: f.s, k: f.k, de: f.de, gain: vol, pan: f.pan, muf: f.muf, longe: far ? 1 : 0 }); if (A.tocou.length > 600) A.tocou.splice(0, 200); }
  }
  const LOOK = 0.25; // (seconds between two looks at the scene)
  function place(t, dtLook) {
    const c = cena; if (!c) return; stamp++;
    const sp = Math.max(1, G.speed || 1);
    // (a gesture whose contact fell between two looks — the act ends at its contact, or began again —: it reached it if the
    // world's seconds since the last look carry its clock there)
    const reached = st => st.f.q === 'contato' && !st.fired && st.fase + (LOOK + 0.1) * sp >= st.f.contato;
    for (const f of c.fontes) {
      let st = rung.get(f.k);
      if (!st) { st = { f, fase: f.fase, fired: f.q === 'contato' && f.fase >= f.contato, next: t + (f.cada || 0.3) * (f.q === 'acaso' ? G.vrr(0.2, 1.2) : G.vrr(0, 0.5)), seen: stamp }; rung.set(f.k, st); if (f.q === 'contato') continue; }
      if (f.q === 'contato') {
        if (f.fase < st.fase) { if (reached(st)) ring(st.f, st.f.gain); st.fired = false; } // (a new gesture began)
        st.f = f; st.fase = f.fase; st.seen = stamp;
        if (!st.fired && f.fase >= f.contato) { st.fired = true; ring(f, f.gain); }
        continue;
      }
      st.f = f; st.seen = stamp;
      if (t < st.next) continue;
      st.next = t + f.cada * (f.q === 'acaso' ? G.vrr(0.5, 1.6) : G.vrr(0.9, 1.15));
      ring(f, f.gain);
    }
    for (const [k, st] of rung) { if (st.seen === stamp) continue; if (stamp - st.seen === 1 && reached(st)) ring(st.f, st.f.gain); if (stamp - st.seen > 12 || st.f.q === 'contato') rung.delete(k); }
    // the quarter's bed: the far voices of its own work, as loud as its habit and the hands at it now — moving slowly
    bedMix = A.blend(bedMix, c.fundo ? c.fundo.w : null, dtLook);
    if (c.fundo) for (const fam of A.FAMS) {
      const m = bedMix[fam]; const L = c.fundo.de[fam]; if (!(m > 0.03) || !L || !L.length) continue;
      if (t < (bedT[fam] || 0)) continue;
      bedT[fam] = t + G.vrr(1.2, 3.2) / (0.4 + m);
      ring(G.vpick(L), 0.05 + 0.12 * m, true);
    }
  }
  A.update = function (dt) {
    if (!ac || ac.state !== 'running' || !G.S) return;
    const S = G.S; const t = ac.currentTime;
    const ear = earNow = A.ear(); if (!ear) return;
    scapeT -= dt;
    if (scapeT <= 0 && (!A.mute || !cena)) { // (while the sound is off — the skip of time — the scene is not asked again)
      scapeT = LOOK; analyse(ear); cena = A.cena = A.scene(ear); A.musNow = cena.musica;
      scape.people = cena.gente; scape.sell = cena.fundo ? cena.fundo.maos.troca || 0 : 0; const luta = cena.fontes.find(f => f.tipo === 'luta'); scape.fight = luta ? luta.n : 0;
      if (A.ambOn && !A.mute) place(t, bedAt ? Math.min(2, t - bedAt) : LOOK);
      bedAt = t;
    }
    const zf = scape.zoomF;
    const coast = Math.min(1, scape.sea * 2.2);
    // under the ground the world above goes quiet: drips, and the hum of the rock; under a roof, the street is muffled
    const UND = !!ear.ug, uf = UND ? 0.07 : ear.dentro ? 0.4 : 1;
    ocean.g.gain.setTargetAtTime(((0.018 + 0.05 * coast) * (1 + 0.35 * Math.sin(t * 0.35)) + (ear.modo === 'deus' ? 0.012 / G.Render.cam.zoom : 0)) * uf, t, 0.6);
    river.g.gain.setTargetAtTime(Math.min(1.8, scape.river * 7 + (scape.falls || 0) * 0.6) * 0.05 * zf * uf, t, 0.6);
    leaves.g.gain.setTargetAtTime(Math.min(1, scape.forest * 1.6) * (0.25 + S.weather.windS) * 0.018 * zf * uf, t, 0.8);
    // (the murmur of the people about — awake, under the sky, within the ear's reach —, livelier where hands trade)
    const busy = scape.people ? Math.min(1, Math.log(1 + scape.people) / 4.2) : 0;
    crowd.g.gain.setTargetAtTime(busy * (0.05 + Math.min(0.03, scape.sell * 0.006)) * zf * uf, t, 0.8);
    battle.g.gain.setTargetAtTime(Math.min(1, scape.fight / 14) * 0.13 * zf * uf, t, 0.4);
    wind.g.gain.setTargetAtTime(UND ? 0.03 : (0.012 + S.weather.windS * 0.06 + (scape.snow + scape.desert) * 0.03 + (1 - zf) * 0.02 + Math.min(0.03, (scape.alt || 0) * 0.0012)) * uf, t, 0.5);
    windF.frequency.setTargetAtTime(UND ? 140 + Math.sin(t * 0.13) * 30 : 350 + S.weather.windS * 500 + Math.sin(t * 0.2) * 80, t, 0.5);
    if (UND && A.ambOn) { dripT -= dt; if (dripT <= 0) { dripT = G.vrr(0.3, 1.5); const f = G.vrr(800, 2000); osc('sine', f, t, 0.14, 0.045, amb, f * 0.42); if (G.VR() < 0.3) osc('sine', f * 1.5, t + 0.18, 0.1, 0.02, amb, f * 0.6); } }
    // rain loudness from global + the clouds over the ear
    let r = S.weather.rain;
    for (const c of S.clouds) if (Math.hypot(c.x - ear.x, c.y - ear.y) < ear.r * 1.6) r = Math.max(r, G.Nature.cloudIntensity(c) * 0.8);
    rain.g.gain.setTargetAtTime(r * 0.22 * uf, t, 0.4);
    if (UND) return;
    // fire crackles, where it burns near the ear
    const fires = scape.fires;
    crackleT -= dt;
    if (fires && crackleT <= 0 && A.ambOn) {
      crackleT = G.vrr(0.03, 0.18) / Math.min(4, fires * 0.5 + 0.5);
      nz(t, 0.02 + G.VR() * 0.03, (0.05 + G.VR() * 0.08 * Math.min(1, fires / 6)) * uf, 'bandpass', 1500 + G.VR() * 3000, 1.5, amb);
    }
    const night = G.Render.nightness() > 0.55;
    birdT -= dt;
    if (!night && !ear.dentro && birdT <= 0 && S.weather.rain < 0.2 && scape.forest + scape.town * 0.3 > 0.04 && scape.snow < 0.6) {
      birdT = G.vrr(1.5, 6) / Math.min(2, 0.5 + scape.forest * 3);
      if (G.VR() < 0.25) A.play(G.VR() < 0.6 ? 'trill' : 'cuckoo', zf);
      else { const f = G.vrr(2400, 4200); const n = G.vri(2, 4); for (let k = 0; k < n; k++) osc('sine', f * G.vrr(0.9, 1.1), t + k * 0.11, 0.07, 0.018, amb, f * G.vrr(1.1, 1.4)); }
    }
    if (A.ambOn) {
      waveT -= dt; if (coast > 0.12 && waveT <= 0) { waveT = G.vrr(3, 7); A.play('wave', coast * uf); }
      gullT -= dt; if (coast > 0.1 && !night && gullT <= 0) { gullT = G.vrr(5, 14); A.play('gull', Math.min(1, coast + 0.2) * zf * uf); }
      owlT -= dt; if (night && scape.forest > 0.12 && owlT <= 0) { owlT = G.vrr(8, 18); A.play('owl', zf * uf); }
      frogT -= dt; if (night && (scape.river > 0.03 || scape.swamp > 0.1) && frogT <= 0) { frogT = G.vrr(0.8, 2.6); A.play('frog', zf * uf); }
    }
    cricketT -= dt;
    if (night && cricketT <= 0) {
      cricketT = G.vrr(0.4, 1.4);
      for (let k = 0; k < 3; k++) osc('sine', 4600, t + k * 0.05, 0.03, 0.01 * uf, amb);
    }
  };

  // ---------------- generative music ----------------
  // the world's own music is played on the scale and with the timbre of the people of the ground the ear is on, in the age
  // of the arts they know (A.musicOf, audio-src.js: a people of stone on three notes of breath and drum, of bronze on five
  // with its own instrument, of iron on its whole mode) — never a tune by quarter; in the wild, the plain scale
  const CHORDS = [[0, 2, 4], [3, 5, 7], [1, 3, 5], [4, 6, 8]];
  const TB0 = { onda: 'triangle', onda2: 'sine', brilho: 2800, ataque: 0.01, cauda: 2.2, sopro: 0, dobra: 0 };
  const LOUD = { sawtooth: 0.5, square: 0.45, triangle: 1, sine: 1 }; // (a reed's wave is louder than a string's at the same peak)
  let beat = 0, chord = 0;
  function pluck(f, t, v, dest, tb) {
    tb = tb || TB0; v *= LOUD[tb.onda] || 1;
    const o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter();
    o.type = tb.onda; o2.type = tb.onda2; o.frequency.value = f; o2.frequency.value = f * (tb.dobra ? 2.004 : 2.001);
    lp.type = 'lowpass'; lp.frequency.setValueAtTime(tb.brilho, t); lp.frequency.exponentialRampToValueAtTime(Math.max(300, tb.brilho * 0.22), t + tb.cauda * 0.7);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + tb.ataque); g.gain.exponentialRampToValueAtTime(0.0001, t + tb.cauda);
    const g2 = ac.createGain(); g2.gain.value = tb.dobra ? 0.4 : 0.25;
    o.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); g.connect(dest); g.connect(revIn);
    o.start(t); o2.start(t); o.stop(t + tb.cauda + 0.1); o2.stop(t + tb.cauda + 0.1);
    if (tb.sopro) nz(t, tb.cauda * 0.5, v * tb.sopro * 0.5, 'bandpass', f * 2, 6, dest, 0, Math.max(0.02, tb.ataque)); // (the breath of a flute)
  }
  function pad(freqs, t, dur) {
    for (const f of freqs) {
      const o = ac.createOscillator(); const g = ac.createGain(); o.type = 'sine'; o.frequency.value = f / 2;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.035, t + dur * 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(mus); g.connect(revIn); o.start(t); o.stop(t + dur + 0.1);
    }
  }
  // the scenes' music: each mood its chords, its pulse and its notes
  const MOOD = {
    tense: { chord: [55, 82.4, 116.5], pulse: 2, notes: [311.13, 329.63, 466.16], p: 0.18, step: 0.62 },
    dread: { chord: [49, 51.9, 73.4], pulse: 4, notes: [233.08, 246.94], p: 0.1, step: 0.8 },
    sad: { chord: [110, 130.81, 164.81], pulse: 0, notes: [220, 261.63, 293.66, 329.63, 392, 440], p: 0.32, step: 0.85 },
    awe: { chord: [130.81, 196, 246.94], pulse: 0, notes: [523.25, 659.25, 783.99, 987.77, 1046.5, 1318.5], p: 0.5, step: 0.55 },
    triumph: { chord: [98, 146.83, 196], pulse: 4, notes: [392, 493.88, 587.33, 783.99], p: 0.5, step: 0.5 },
    night: { chord: [65.4, 98, 123.47], pulse: 0, notes: [261.63, 311.13, 392, 466.16], p: 0.14, step: 0.9 },
  };
  function moodBeat() {
    const M = MOOD[A.moodNow]; if (!M) return;
    const t = ac.currentTime + 0.05;
    if (beat % 16 === 0) pad(M.chord.map(f => f * 2), t, M.step * 16);
    if (M.pulse && beat % M.pulse === 0) { osc('sine', M.chord[0] * 1.2, t, 0.3, A.moodNow === 'triumph' ? 0.1 : 0.16, mus, M.chord[0] * 0.8); if (A.moodNow === 'tense') osc('sine', M.chord[0] * 1.1, t + 0.2, 0.25, 0.1, mus, M.chord[0] * 0.75); }
    if (G.VR() < M.p) pluck(M.notes[Math.floor(G.VR() * M.notes.length)], t, A.moodNow === 'dread' ? 0.03 : 0.05, mus);
  }
  // one beat of the world's own music, on a people's ladder (m: A.musicOf's; none: the plain scale)
  function worldBeat(m, night, step) {
    const N = m ? m.notas : PENTA; const tb = m ? m.timbre : TB0; const top = N.length - 1;
    const t = ac.currentTime + 0.05;
    if (beat % 16 === 0) { chord = (chord + (G.VR() < 0.7 ? 1 : 2)) % CHORDS.length; pad(CHORDS[chord].map(i => N[Math.min(top, i)]), t, step * 16); }
    const tension = G.S ? (G.S.meteors.length > 0 || G.Nature.fireSet.size > 5) : false;
    if (G.VR() < (night ? 0.28 : 0.42)) {
      const c = CHORDS[chord];
      let idx = c[Math.floor(G.VR() * 3)] + (G.VR() < 0.4 ? 2 : 0);
      idx = Math.min(top, idx + (night ? 0 : 2));
      pluck(N[idx] * (tension ? 0.5 : 1), t, night ? 0.05 : 0.065, mus, tb);
    }
    // (the drum of a people that keeps one: the first beat of four, softer by night)
    if (m && m.tambor && beat % 4 === 0) osc('sine', 84, t, 0.24, (night ? 0.05 : 0.09) * m.tambor, mus, 46);
  }
  function musicLoop() {
    if (!ac) return;
    const night = G.S && G.Render ? G.Render.nightness() > 0.55 : false;
    const step = night ? 0.85 : 0.62;
    if (A.musicOn && ac.state === 'running' && A.moodNow) { moodBeat(night); beat++; }
    else if (A.musicOn && ac.state === 'running') { worldBeat(G.S ? A.musNow : null, night, step); beat++; }
    setTimeout(musicLoop, (A.moodNow && MOOD[A.moodNow] ? MOOD[A.moodNow].step : night ? 0.85 : 0.62) * 1000);
  }
  A.batida = () => { if (ac && ac.state === 'running') worldBeat(G.S ? A.musNow : null, false, 0.62); }; // (one beat now: the proofs', where no timer runs)

})(window.G);
