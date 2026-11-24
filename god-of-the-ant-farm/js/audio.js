'use strict';
// ============================================================
//  Audio: everything synthesized with WebAudio (no files)
// ============================================================
(function (G) {
  const A = G.Audio = {};
  let ac = null, master, sfx, amb, mus, rev, revIn, noise, ambLP, ambIn, roomIn;
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
    // (P9: the place's sounds go two ways — the world out there, which a roof over the ear muffles (ambLP), and the room the ear is
    // in (ambIn), clean and into the room's own echo (roomIn): the walls make the difference, D-786)
    amb = ac.createGain(); amb.gain.value = A.ambOn ? 0.55 : 0; ambLP = ac.createBiquadFilter(); ambLP.type = 'lowpass'; ambLP.frequency.value = 18000; ambLP.Q.value = 0.5; amb.connect(ambLP); ambLP.connect(master);
    ambIn = ac.createGain(); ambIn.gain.value = A.ambOn ? 0.55 : 0; ambIn.connect(master);
    roomIn = ac.createGain(); roomIn.gain.value = 1;
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
  // (the world's own music bows to a musician heard in the room: the tune of the place is the one playing there, D-785)
  let duck = 1;
  const musLevel = () => (A.musicOn ? 0.3 * duck : 0);
  A.setMusic = on => { A.musicOn = on; if (mus) mus.gain.setTargetAtTime(musLevel(), ac.currentTime, 0.2); A.save(); };
  A.setAmb = on => { A.ambOn = on; if (amb) { amb.gain.setTargetAtTime(on ? 0.55 : 0, ac.currentTime, 0.2); ambIn.gain.setTargetAtTime(on ? 0.55 : 0, ac.currentTime, 0.2); } A.save(); };

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
    // (a sound of the room the ear is in, sala: clean, by the room's way, and a share of it into the room's echo — P9)
    let head = sp.to === 'amb' ? (sp.sala ? ambIn : amb) : sfx;
    if (sp.pan && ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = G.clamp(sp.pan, -1, 1); p.connect(head); head = p; }
    if (sp.muf) { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2400 - 1900 * G.clamp(sp.muf, 0, 1); f.Q.value = 0.4; f.connect(head); head = f; }
    if (sp.sala && roomIn) { const e = ac.createGain(), w = ac.createGain(); w.gain.value = G.clamp(sp.wet === undefined ? roomMix() : sp.wet, 0, 1); e.connect(head); e.connect(w); w.connect(roomIn); head = e; }
    return head;
  }
  // (how much of the room's echo a sound of it sends: the room's own share, from its plan — audio-src.js A.ecoDe)
  const roomMix = () => (cena && cena.sala && cena.sala.eco ? cena.sala.eco.mix : 0.25);
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
  // (P9) a syllable with no word: the buzz of a voice through the two formants of a vowel of the speaker's people — F1, F2 of a man's
  // throat (a woman's and a child's higher, less than the pitch: tom) —, sliding from one pitch to the next
  const VOGAL = { a: [730, 1090], e: [530, 1840], E: [610, 1700], i: [270, 2290], o: [570, 840], O: [590, 880], u: [300, 870], y: [280, 1750], oe: [400, 1500], ae: [660, 1720], schwa: [500, 1500] };
  // (each people's tongue, as timbre: its vowels, how many syllables a second, how much breath of s, the throat of the Egyptian's
  // emphatics, the tl of the Aztec's — never a word)
  const LINGUA = {
    classico: { v: ['a', 'e', 'i', 'o', 'u', 'a', 'e'], ritmo: 5.6, sib: 0.3 }, grego: { v: ['a', 'e', 'E', 'i', 'o', 'O', 'y'], ritmo: 6, sib: 0.35 },
    romano: { v: ['a', 'e', 'i', 'o', 'u', 'a', 'u'], ritmo: 6.2, sib: 0.4 }, nordico: { v: ['a', 'e', 'i', 'o', 'u', 'y', 'oe', 'ae'], ritmo: 5, sib: 0.2 },
    egipcio: { v: ['a', 'a', 'i', 'u', 'schwa'], ritmo: 5.4, sib: 0.25, gut: 1 }, asteca: { v: ['a', 'e', 'i', 'o', 'a', 'o'], ritmo: 6.4, sib: 0.3, tl: 1 },
  };
  const lingua = o => LINGUA[(o && o.povo) || 'classico'] || LINGUA.classico;
  function syl(f, t, dur, peak, vg, f2, a, dest, tom) {
    const o = ac.createOscillator(), g = ac.createGain(), b1 = ac.createBiquadFilter(), b2 = ac.createBiquadFilter(), g2 = ac.createGain();
    const F = VOGAL[vg] || VOGAL.a; const k = tom ? Math.pow(tom, 0.45) : 1;
    o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    b1.type = 'bandpass'; b1.frequency.value = F[0] * k; b1.Q.value = 4; b2.type = 'bandpass'; b2.frequency.value = F[1] * k; b2.Q.value = 6; g2.gain.value = 0.55;
    env(g, t, a || 0.025, peak, dur);
    o.connect(b1); o.connect(b2); b1.connect(g); b2.connect(g2); g2.connect(g); g.connect(out(dest));
    o.start(t); o.stop(t + (a || 0.025) + dur + 0.05);
    return g;
  }
  // (and the consonant before it: the breath of an s, the stop of a t, the throat of the Egyptian, the tl of the Aztec)
  function cons(t, peak, L, dest) {
    const r = G.VR();
    if (L.tl && r < 0.25) { nz(t, 0.05, peak * 0.6, 'bandpass', 2600, 3, dest, 1800); return 0.05; }
    if (L.gut && r < 0.25) { nz(t, 0.05, peak * 0.5, 'bandpass', 900, 2, dest, 600); return 0.05; }
    if (r < L.sib) { nz(t, 0.06, peak * 0.35, 'highpass', 4800, 0, dest); return 0.05; }
    if (r < L.sib + 0.3) { nz(t, 0.012, peak * 0.6, 'bandpass', 1800, 1.5, dest); return 0.015; }
    return 0;
  }
  // (P9) a plucked string: Karplus–Strong — the noise of the pluck running along the string and dying on it, a gut string's warmth
  // (one buffer a pitch, kept: what only sounds may draw on the look's chance)
  const strings = new Map();
  function string(f, keep) {
    const key = Math.round(f * 4) + ':' + keep; let b = strings.get(key); if (b) return b;
    const sr = ac.sampleRate, n = Math.max(2, Math.round(sr / f)), len = Math.floor(sr * 2.4); b = ac.createBuffer(1, len, sr); const d = b.getChannelData(0);
    let lp = 0; for (let i = 0; i < n; i++) { lp += 0.6 * ((G.VR() * 2 - 1) - lp); d[i] = lp; } // (a soft finger: the pluck's noise a little dull)
    for (let i = n; i < len; i++) d[i] = keep * 0.5 * (d[i - n] + d[i - n + 1]);
    strings.set(key, b); if (strings.size > 64) strings.delete(strings.keys().next().value);
    return b;
  }
  function pluckStr(f, t, peak, bright, dest) {
    const s = ac.createBufferSource(); s.buffer = string(f, 0.9965); const body = ac.createBiquadFilter(), lp = ac.createBiquadFilter(), g = ac.createGain();
    body.type = 'peaking'; body.frequency.value = 290; body.Q.value = 1.2; body.gain.value = 6; // (the lyre's sound box, the tortoise shell under the hide)
    lp.type = 'lowpass'; lp.frequency.value = bright || 3200; g.gain.setValueAtTime(peak, t); g.gain.setTargetAtTime(0.0001, t + 1.4, 0.35);
    s.connect(body); body.connect(lp); lp.connect(g); g.connect(out(dest)); s.start(t); s.stop(t + 2.4);
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
    // the little things of the idle that sound (22c fase 6, D-610): the cough, the sneeze, the yawn, the sigh, the drunk's hiccup, the
    // teeth chattering in the cold — a breath shaped by a band, low and short (the tom: the voice of the one)
    cough: (t, v, o) => { const f = 520 * ((o && o.tom) || 1); nz(t, 0.09, 0.12 * v, 'bandpass', f, 2.5, sfx, 260); nz(t + 0.16, 0.08, 0.09 * v, 'bandpass', f * 0.9, 2.5, sfx, 240); },
    sneeze: (t, v, o) => { const f = 900 * ((o && o.tom) || 1); nz(t, 0.18, 0.025 * v, 'highpass', 2200); nz(t + 0.2, 0.12, 0.14 * v, 'bandpass', f, 1.6, sfx, 380); },
    yawn: (t, v, o) => { const f = 210 * ((o && o.tom) || 1); osc('sawtooth', f, t, 0.9, 0.018 * v, sfx, f * 0.75, 0.2); nz(t, 0.9, 0.03 * v, 'bandpass', 600, 1.2, sfx, 400); },
    sigh: (t, v) => { nz(t, 0.7, 0.04 * v, 'bandpass', 900, 1.1, sfx, 450); },
    hiccup: (t, v, o) => { const f = 330 * ((o && o.tom) || 1); osc('triangle', f, t, 0.07, 0.06 * v, sfx, f * 1.4); nz(t, 0.05, 0.05 * v, 'bandpass', 1400, 3); },
    teeth: (t, v) => { for (let k = 0; k < 6; k++) nz(t + k * 0.045, 0.012, 0.03 * v, 'highpass', 3600); },
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
  // ---------------- the tavern's own (P9, D-781 to D-785): the things of a room at night ----------------
  // (o: what the source gives — the voice's pitch (tom) and its people's tongue (povo), how drunk (bebado), the cup's material (mat:
  // the clay, the turned wood, a metal), the floor under the feet (piso: the plan's), the note of the tune (nota))
  // (a cup's knock on a table or on another cup, by what it is made of: the clay's short ring, the wood's dull tock, a metal's bell)
  function cupKnock(t, v, mat, hi) {
    if (mat === 'barro') { for (const [f, a, d] of [[2150, 0.05, 0.07], [3420, 0.03, 0.05], [5100, 0.015, 0.03]]) osc('sine', f * (hi || 1), t, d, a * v, sfx, f * 0.97 * (hi || 1)); nz(t, 0.012, 0.12 * v, 'bandpass', 1600, 2); osc('triangle', 520, t, 0.04, 0.06 * v, sfx, 380); }
    else if (mat === 'metal') { for (const [f, a] of [[2650, 0.05], [4120, 0.03], [6200, 0.015]]) { const n = osc('sine', f * (hi || 1), t, 0.38, a * v, sfx, f * 0.995 * (hi || 1)); n.g.connect(revIn); } nz(t, 0.01, 0.1 * v, 'highpass', 3000); }
    else { nz(t, 0.03, 0.2 * v, 'bandpass', 820 * (hi || 1), 5); nz(t, 0.02, 0.12 * v, 'bandpass', 1450 * (hi || 1), 4); osc('sine', 300, t, 0.04, 0.08 * v, sfx, 220); }
  }
  // (a laugh: «ha» after «ha», the breath between, the pitch falling — longer and looser with the drink)
  function laugh(t, v, o) {
    const L = lingua(o), tom = (o && o.tom) || 1, beb = (o && o.bebado) || 0; const f0 = 150 * tom; const n = 4 + (G.VR() * (3 + 4 * beb) | 0); const gap = G.vrr(0.13, 0.17) * (1 + 0.15 * beb);
    for (let k = 0; k < n; k++) { const at = t + k * gap; const f = f0 * (1.35 - k * 0.05) * G.vrr(0.95, 1.08); nz(at, 0.03, 0.05 * v, 'bandpass', 1500, 1.4); syl(f, at + 0.02, gap * 0.55, 0.11 * v * (1 - k / (n + 2)), k % 3 === 2 ? 'E' : 'a', f * 0.92, 0.012, sfx, tom); }
    return n * gap;
  }
  // (the bench under someone sitting down or getting up: wood dragged on the floor, stick and slip)
  function scrape(t, v, piso) {
    const s = ac.createBufferSource(); s.buffer = noise; s.loop = true; const f = ac.createBiquadFilter(), g = ac.createGain(), am = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain();
    const hard = piso === 'laje' || piso === 'lajota'; f.type = 'bandpass'; f.frequency.setValueAtTime(hard ? 1400 : piso === 'tabua' ? 650 : 420, t); f.frequency.exponentialRampToValueAtTime(hard ? 900 : 380, t + 0.3); f.Q.value = hard ? 3 : 2;
    lfo.type = 'square'; lfo.frequency.value = G.vrr(28, 46); lg.gain.value = 0.5; am.gain.value = 0.5; lfo.connect(lg); lg.connect(am.gain);
    env(g, t, 0.03, (piso === 'terra' ? 0.07 : 0.13) * v, 0.28);
    s.connect(f); f.connect(am); am.connect(g); g.connect(out(sfx)); s.start(t, G.VR()); lfo.start(t); s.stop(t + 0.4); lfo.stop(t + 0.4);
    if (piso === 'tabua') osc('sine', 160, t + 0.26, 0.08, 0.1 * v, sfx, 110); // (the legs set down on the boards)
  }
  // (a foot on the floor: the heel, the sole a breath after — on earth a dull thud, on boards a hollow knock that now and then creaks,
  // on fired tiles and on flags a hard click)
  function step(t, v, piso, w) {
    w = w || 1; const tw = t + 0.03;
    if (piso === 'tabua') { nz(t, 0.035, 0.16 * v * w, 'bandpass', 260, 3); nz(tw, 0.03, 0.09 * v * w, 'bandpass', 620, 4); osc('sine', 120, t, 0.06, 0.12 * v * w, sfx, 80); if (G.VR() < 0.12) nz(t + 0.05, 0.22, 0.03 * v, 'bandpass', 720, 12, sfx, 560, 0.04); }
    else if (piso === 'lajota') { nz(t, 0.02, 0.12 * v * w, 'bandpass', 1900, 1.2); nz(tw, 0.025, 0.07 * v * w, 'bandpass', 1100, 1.5); osc('sine', 95, t, 0.04, 0.08 * v * w, sfx, 70); }
    else if (piso === 'laje') { nz(t, 0.015, 0.13 * v * w, 'highpass', 2600); nz(tw, 0.02, 0.07 * v * w, 'bandpass', 1500, 1.5); osc('sine', 90, t, 0.035, 0.07 * v * w, sfx, 65); }
    else { nz(t, 0.05, 0.13 * v * w, 'lowpass', 380); nz(tw, 0.04, 0.05 * v * w, 'bandpass', 900, 1); osc('sine', 75, t, 0.05, 0.09 * v * w, sfx, 55); }
  }
  Object.assign(LIB, {
    // the drink poured from the jar into the cup (the keeper at the shelf): the stream, the cup's note rising as it fills, a gurgle
    verter: (t, v) => { nz(t, 0.8, 0.07 * v, 'bandpass', 620, 4, sfx, 1500, 0.08); nz(t + 0.05, 0.7, 0.03 * v, 'highpass', 3500, 0, sfx, 0, 0.1); for (let k = 0; k < 3; k++) osc('sine', G.vrr(350, 520), t + 0.15 + k * 0.21, 0.04, 0.025 * v, sfx, G.vrr(600, 900)); },
    // a draught: the throat's gulp, and the cup set down on the table after it
    gole: (t, v, o) => { const tom = (o && o.tom) || 1; osc('sine', 190 * Math.sqrt(tom), t, 0.07, 0.07 * v, sfx, 120); nz(t, 0.05, 0.05 * v, 'bandpass', 420, 3); if (G.VR() < 0.5) { osc('sine', 175 * Math.sqrt(tom), t + 0.32, 0.07, 0.06 * v, sfx, 115); nz(t + 0.32, 0.05, 0.04 * v, 'bandpass', 420, 3); } cupKnock(t + 0.8, 0.7 * v, (o && o.mat) || 'madeira'); },
    // the toast: two cups knocked together in what they are made of, the table's «hey!», and its laugh
    brinde: (t, v, o) => { const mat = (o && o.mat) || 'madeira'; cupKnock(t, v, mat, 1); cupKnock(t + 0.018, 0.8 * v, mat, 1.07); const tom = (o && o.tom) || 1; for (let k = 0; k < 3; k++) { const f = 125 * tom * [1, 1.5, 0.8][k] * G.vrr(0.95, 1.05); syl(f * 1.4, t + 0.12 + k * 0.03, 0.3, 0.07 * v, 'e', f * 1.8, 0.03, sfx, k === 1 ? 1.5 : tom); } laugh(t + 0.55, 0.7 * v, o); },
    // a laugh at the table (the world's own: the act of laughing; the drunk's)
    riso: (t, v, o) => { laugh(t, v, o); },
    // the talk of one who drank: louder, the pitch sliding, the words run together, and the laugh at the end of what he said
    vozBebado: (t, v, o) => { const L = lingua(o), tom = (o && o.tom) || 1, f0 = 112 * tom; const n = 3 + (G.VR() * 4 | 0); let at = t; for (let k = 0; k < n; k++) { const f = f0 * G.vrr(0.85, 1.35); at += cons(at, 0.06 * v, L); const d = G.vrr(0.11, 0.2); syl(f, at, d, 0.1 * v, G.vpick(L.v), f * G.vrr(0.75, 1.2), 0.02, sfx, tom); at += d + G.vrr(0, 0.05); } if (G.VR() < 0.45) laugh(at + 0.08, 0.6 * v, Object.assign({}, o, { bebado: 1 })); },
    // the knucklebones: shaken in the fist, thrown, tumbling on the table's wood and settling — and the thrower's cry
    ossos: (t, v, o) => { for (let k = 0; k < 5; k++) nz(t + k * 0.05 + G.vrr(0, 0.02), 0.006, 0.08 * v, 'bandpass', G.vrr(2500, 4200), 4); let at = t + 0.38, gap = 0.12; for (let k = 0; k < 6; k++) { const h = G.vrr(1100, 2400); nz(at, 0.008, 0.16 * v * (1 - k * 0.12), 'bandpass', h, 5); osc('triangle', h * 0.5, at, 0.02, 0.03 * v, sfx, h * 0.45); at += gap; gap *= 0.72; } nz(at, 0.12, 0.03 * v, 'bandpass', 1800, 2, sfx, 1200); const tom = (o && o.tom) || 1; if (G.VR() < 0.7) syl(150 * tom, at + 0.35, 0.28, 0.1 * v, G.vpick(['a', 'o', 'e']), 190 * tom, 0.02, sfx, tom); if (G.VR() < 0.35) laugh(at + 0.7, 0.55 * v, o); },
    // the cloth wiped over the table: two or three strokes, there and back
    pano: (t, v) => { for (let k = 0; k < 3; k++) { const up = k % 2 === 0; nz(t + k * 0.3, 0.24, 0.05 * v, 'bandpass', up ? 1500 : 2600, 1.2, sfx, up ? 2600 : 1500, 0.07); } },
    // the cups gathered, one on the other
    canecas: (t, v, o) => { const mat = (o && o.mat) || 'madeira'; for (let k = 0; k < 4; k++) cupKnock(t + k * 0.13 + G.vrr(0, 0.03), v * (0.7 + 0.1 * k), mat, 1 + k * 0.06); },
    // the coin of the tip set down on the table: its ring, then its rim spinning faster and faster as it settles
    gorjeta: (t, v) => { for (const [f, a] of [[3200, 0.05], [5350, 0.025], [7700, 0.012]]) osc('sine', f, t, 0.3, a * v, sfx, f * 0.99); let at = t + 0.12, gap = 0.08; for (let k = 0; k < 14; k++) { osc('sine', 3000 + k * 60, at, 0.012, 0.02 * v * (1 - k / 18), sfx); at += gap; gap *= 0.86; } nz(at, 0.03, 0.04 * v, 'bandpass', 2600, 3); },
    // the keeper throwing someone out: his voice raised twice, and the shove at the door
    expulsa: (t, v, o) => { const tom = (o && o.tom) || 1, f0 = 118 * tom; voc(f0 * 1.6, t, 0.34, 0.1 * v, 1100, f0 * 2, 0.03); voc(f0 * 1.45, t + 0.5, 0.42, 0.09 * v, 1000, f0 * 1.1, 0.03); osc('sine', 100, t + 1, 0.14, 0.25 * v, sfx, 60); nz(t + 1, 0.08, 0.18 * v, 'lowpass', 600); },
    // the closing: the benches lifted onto the tables, the bar put across the door
    fechar: (t, v) => { for (let k = 0; k < 2; k++) { nz(t + k * 0.4, 0.05, 0.18 * v, 'bandpass', 700, 4); osc('sine', 150, t + k * 0.4, 0.07, 0.15 * v, sfx, 100); } osc('sine', 95, t + 1.1, 0.2, 0.3 * v, sfx, 55); nz(t + 1.1, 0.1, 0.2 * v, 'lowpass', 700); osc('square', 1500, t + 1.32, 0.02, 0.04 * v, sfx, 1000); },
    // one dozing at the table: a soft snore in, a breath out
    ronco: (t, v) => { const s = ac.createBufferSource(); s.buffer = noise; s.loop = true; const f = ac.createBiquadFilter(), g = ac.createGain(), am = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain(); f.type = 'lowpass'; f.frequency.value = 480; lfo.frequency.value = 26; lg.gain.value = 0.5; am.gain.value = 0.5; lfo.connect(lg); lg.connect(am.gain); env(g, t, 0.35, 0.06 * v, 0.7); s.connect(f); f.connect(am); am.connect(g); g.connect(out(sfx)); s.start(t, G.VR()); lfo.start(t); s.stop(t + 1.2); lfo.stop(t + 1.2); nz(t + 1.25, 0.6, 0.025 * v, 'bandpass', 800, 1, sfx, 500, 0.2); },
    // the hands of the room on the pulse
    palmas: (t, v, o) => { const k = (o && o.tom) || 1; nz(t, 0.03, 0.2 * v, 'bandpass', 1250 * Math.sqrt(k), 0.9); nz(t + 0.004, 0.025, 0.12 * v, 'bandpass', 2300 * Math.sqrt(k), 1.4); },
    // a dancing foot on the floor: on boards the floor booms, on earth it thuds, on flags it slaps
    pe: (t, v, o) => { const p = (o && o.piso) || 'terra'; if (p === 'tabua') { osc('sine', 72, t, 0.18, 0.3 * v, sfx, 46); nz(t, 0.04, 0.16 * v, 'bandpass', 320, 2); } else if (p === 'terra') { osc('sine', 62, t, 0.12, 0.2 * v, sfx, 42); nz(t, 0.05, 0.12 * v, 'lowpass', 300); } else { nz(t, 0.02, 0.16 * v, 'bandpass', 1500, 1); osc('sine', 85, t, 0.08, 0.14 * v, sfx, 55); } },
    // a voice singing with the music (or the musician's own, with no instrument: D-764), on the tune's note
    canto: (t, v, o) => { const tom = (o && o.tom) || 1; const n = (o && o.nota) || 196; const f = n * (tom >= 1.3 ? 1 : 0.5); syl(f, t, (o && o.dur) || 0.5, 0.09 * v, G.vpick(['a', 'o', 'a', 'e']), f * 1.003, 0.05, sfx, tom); },
    // the lyre: a gut string plucked, the box under it — and, on a strong pulse, the low string with it
    lira: (t, v, o) => { const n = (o && o.nota) || 261.63; pluckStr(n, t, 0.23 * v, (o && o.brilho) || 3200); if (o && o.forte) pluckStr(o.baixo || n / 2, t + 0.004, 0.13 * v, 1800); },
    // the drum (the huehuetl): its middle, deep; its rim, high
    tambor: (t, v, o) => { if (o && o.forte) { osc('sine', 96, t, 0.42, 0.3 * v, sfx, 56); nz(t, 0.07, 0.15 * v, 'lowpass', 420); } else { osc('triangle', 232, t, 0.12, 0.16 * v, sfx, 176); nz(t, 0.025, 0.13 * v, 'bandpass', 1900, 1.2); } },
    // the feet (one step: the plan's floor) and the bench (the scrape of who sits down or gets up)
    passo: (t, v, o) => step(t, v, (o && o.piso) || 'terra', (o && o.tom) || 1),
    banco: (t, v, o) => scrape(t, v, (o && o.piso) || 'terra'),
    // the door that swings for who passes (the latch, the hinges) — and shuts behind them
    porta: (t, v) => LIB.door(t, v),
    portaFecha: (t, v) => LIB.doorShut(t, v),
    // (the room's beds — the talk, the fire, the pot, the rain on the roof — are the engines', below; these are their single grains,
    // for a source heard alone: a few voices, a crackle, a bubble, a drop on the roof)
    lareira: (t, v) => { for (let k = 0; k < 4; k++) nz(t + G.vrr(0, 0.5), G.vrr(0.004, 0.012), G.vrr(0.08, 0.2) * v, 'bandpass', G.vrr(1500, 5000), 1.5); },
    panela: (t, v) => { for (let k = 0; k < 3; k++) osc('sine', G.vrr(240, 320), t + k * 0.11, 0.05, 0.05 * v, sfx, G.vrr(520, 700)); },
    chuvaTelhado: (t, v) => { for (let k = 0; k < 8; k++) nz(t + G.vrr(0, 0.4), 0.008, 0.22 * v, 'bandpass', G.vrr(1500, 4500), 2); },
  });
  // ---------------- the tavern's fourth wave (T8, D-890 to D-899): the context, the drink, the trades, the games ----------------
  // (a heavy thing falling on a floor: on boards the floor booms, on earth it flops, on flags it slaps)
  function fall(t, v, piso, heavy) {
    const h = heavy || 1;
    if (piso === 'tabua') { osc('sine', 78, t, 0.3, 0.42 * v * h, sfx, 44); nz(t, 0.08, 0.22 * v * h, 'bandpass', 260, 2); }
    else if (piso === 'terra') { osc('sine', 60, t, 0.2, 0.32 * v * h, sfx, 40); nz(t, 0.1, 0.2 * v * h, 'lowpass', 320); }
    else { nz(t, 0.04, 0.26 * v * h, 'bandpass', 1300, 1); osc('sine', 88, t, 0.14, 0.28 * v * h, sfx, 52); }
  }
  // (knocks of wood or clay on wood: dice, tablets — bone bright, wood dull, clay short and ringing, wax soft)
  const KNOCK = { osso: [2600, 4200, 5], madeira: [1100, 2000, 4], barro: [1800, 3000, 6], cera: [700, 1200, 2], papiro: [2200, 3600, 1] };
  function tick(t, v, mat, k) { const K = KNOCK[mat] || KNOCK.madeira; const f = G.vrr(K[0], K[1]) * (k || 1); nz(t, mat === 'osso' ? 0.006 : 0.01, 0.16 * v, 'bandpass', f, K[2]); if (mat !== 'papiro' && mat !== 'cera') osc('triangle', f * 0.5, t, 0.018, 0.035 * v, sfx, f * 0.42); }
  // (dice tumbling on a board: each a few bounces closer and closer, a little roll at the end)
  function tumble(t, v, mat, n) { let end = t; for (let d = 0; d < (n || 2); d++) { let at = t + d * G.vrr(0.01, 0.05), gap = G.vrr(0.09, 0.14); for (let k = 0; k < 6; k++) { tick(at, v * (1 - k * 0.13), mat); at += gap; gap *= G.vrr(0.62, 0.78); } nz(at, 0.1, 0.025 * v, 'bandpass', mat === 'osso' ? 2600 : 1300, 2, sfx, mat === 'osso' ? 1800 : 900); end = Math.max(end, at + 0.1); } return end; }
  // (a shout of many: n voices of the room, a breath apart, the vowels of its people)
  function multidao(t, v, o, n, vg, f2k) { const L = lingua(o); n = Math.min(10, Math.max(2, n | 0)); for (let k = 0; k < n; k++) { const tom = k % 3 === 1 ? 1.5 : G.vrr(0.9, 1.15); const f = 130 * tom * G.vrr(1.15, 1.45); syl(f, t + G.vrr(0, 0.12), G.vrr(0.3, 0.5), 0.08 * v / Math.sqrt(n / 2), vg || G.vpick(['e', 'a', 'E']), f * (f2k || 1.25), 0.025, sfx, tom); } }
  Object.assign(LIB, {
    // the bar dropped across the door into its brackets: the wood sliding, its weight falling home, the brackets ringing
    tranca: (t, v) => { nz(t, 0.28, 0.07 * v, 'bandpass', 620, 2, sfx, 950, 0.04); osc('sine', 110, t + 0.3, 0.2, 0.38 * v, sfx, 58); nz(t + 0.3, 0.06, 0.24 * v, 'lowpass', 600); nz(t + 0.3, 0.05, 0.14 * v, 'bandpass', 420, 4); for (let k = 0; k < 2; k++) nz(t + 0.42 + k * 0.07, 0.02, 0.08 * v, 'bandpass', 900, 4); },
    // the keeper calling the street in, low and urgent: «venham!»
    chamado: (t, v, o) => { const L = lingua(o), tom = (o && o.tom) || 1, f0 = 125 * tom; let at = t; for (let k = 0; k < 3; k++) { at += cons(at, 0.08 * v, L); syl(f0 * [1.5, 1.7, 1.4][k], at, 0.2, 0.13 * v, G.vpick(L.v), f0 * [1.7, 1.6, 1.2][k], 0.02, sfx, tom); at += 0.24; } },
    // the held breath of who hides in a corner: a shaking breath in, a slow one out
    respiro: (t, v) => { const s = ac.createBufferSource(); s.buffer = noise; s.loop = true; const f = ac.createBiquadFilter(), g = ac.createGain(), am = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain(); f.type = 'bandpass'; f.frequency.value = 1300; f.Q.value = 1; lfo.frequency.value = 9; lg.gain.value = 0.4; am.gain.value = 0.6; lfo.connect(lg); lg.connect(am.gain); env(g, t, 0.15, 0.03 * v, 0.3); s.connect(f); f.connect(am); am.connect(g); g.connect(out(sfx)); s.start(t, G.VR()); lfo.start(t); s.stop(t + 0.6); lfo.stop(t + 0.6); nz(t + 0.7, 0.8, 0.012 * v, 'bandpass', 800, 1, sfx, 500, 0.3); },
    // a blow on the door being forced: the shoulder or the axe, the leaf's panel booming, the bar rattling in its brackets — and the wood
    // that cracks more with every blow (golpes: the blows so far)
    arrombar: (t, v, o) => { osc('sine', 72, t, 0.26, 0.5 * v, sfx, 44); nz(t, 0.09, 0.32 * v, 'lowpass', 520); nz(t, 0.32, 0.12 * v, 'bandpass', 185, 5); for (let k = 0; k < 3; k++) nz(t + 0.05 + k * 0.045, 0.015, 0.09 * v, 'bandpass', 950, 4); const c = Math.min(1, ((o && o.golpes) || 1) / 6); const n = Math.floor(2 + 10 * c); for (let k = 0; k < n; k++) nz(t + 0.02 + G.vrr(0, 0.12), 0.004, (0.05 + 0.12 * c) * v, 'bandpass', G.vrr(2200, 6000), 2); },
    // the door that yields: the wood splitting, the leaf slamming the wall, the bar clattering on the floor
    portaCede: (t, v) => { const g = nz(t, 0.35, 0.32 * v, 'highpass', 1800, 0, sfx, 0, 0.005); g.connect(revIn); for (let k = 0; k < 18; k++) nz(t + G.vrr(0, 0.25), 0.005, G.vrr(0.08, 0.24) * v, 'bandpass', G.vrr(1500, 6500), 2); osc('sine', 64, t + 0.18, 0.35, 0.55 * v, sfx, 36); nz(t + 0.18, 0.12, 0.3 * v, 'lowpass', 700); let at = t + 0.55; for (let k = 0; k < 3; k++) { nz(at, 0.03, 0.16 * v * (1 - k * 0.25), 'bandpass', 700, 4); osc('sine', 140, at, 0.06, 0.1 * v, sfx, 100); at += 0.16 * (1 - k * 0.3); } },
    // a speech: one long phrase, the voice rising to what it says and falling, the pause after it (who gives the feast, raising the cup)
    discurso: (t, v, o) => { const L = lingua(o), tom = (o && o.tom) || 1, f0 = 120 * tom; const n = 6 + (G.VR() * 4 | 0); let at = t; for (let k = 0; k < n; k++) { const u = k / (n - 1); const arc = 1 + 0.45 * Math.sin(Math.PI * Math.min(1, u * 1.3)); const f = f0 * arc * G.vrr(0.96, 1.04); at += cons(at, 0.07 * v, L); const d = (k === n - 1 ? 0.34 : 1 / L.ritmo * G.vrr(0.8, 1.2)); syl(f, at, d, 0.12 * v, G.vpick(L.v), f * (k === n - 1 ? 0.8 : G.vrr(0.95, 1.05)), 0.025, sfx, tom); at += d + (k === Math.floor(n / 2) ? 0.12 : 0); } },
    // the hall's viva: as many voices as cheer (n), with the claps and the cups of who holds one knocked together (canecas)
    viva: (t, v, o) => { const n = (o && o.n) || 3; multidao(t, v, o, n, null, 1.3); for (let k = 0; k < Math.min(8, Math.ceil(n / 2)); k++) LIB.palmas(t + 0.15 + k * G.vrr(0.04, 0.12), 0.5 * v, { tom: G.vrr(0.85, 1.2) }); for (let k = 0; k < Math.min(4, Math.floor(((o && o.canecas) || 0) / 2)); k++) cupKnock(t + G.vrr(0.05, 0.4), 0.5 * v, (o && o.mat) || 'barro', G.vrr(0.95, 1.1)); },
    // the crowd at a match, cheering it on: «hey! hey!» together, the claps on it — more voices, louder (n)
    torcida: (t, v, o) => { const n = (o && o.n) || 3; for (let b = 0; b < 2; b++) { multidao(t + b * 0.42, v * (0.8 + 0.2 * b), o, n, b ? 'e' : 'E', 1.15); for (let k = 0; k < Math.min(6, n); k++) LIB.palmas(t + b * 0.42 + 0.05 + G.vrr(-0.02, 0.02), 0.45 * v, { tom: G.vrr(0.85, 1.2) }); } },
    // the dancers' ring at the head of the music's turn: «hop!»
    roda: (t, v, o) => { multidao(t, 0.8 * v, o, Math.max(3, (o && o.n) || 3), 'o', 1.4); },
    // the drink thrown: the cup's swing, the liquid through the air and on the other's face and clothes, the drips — and the thrower's shout
    jogarBebida: (t, v, o) => { const tom = (o && o.tom) || 1; nz(t, 0.18, 0.08 * v, 'bandpass', 2200, 1.5, sfx, 800); nz(t + 0.16, 0.18, 0.2 * v, 'bandpass', 900, 1.5, sfx, 500); nz(t + 0.16, 0.12, 0.1 * v, 'lowpass', 1500); for (let k = 0; k < 4; k++) osc('sine', G.vrr(900, 1600), t + 0.4 + k * G.vrr(0.08, 0.18), 0.04, 0.025 * v, sfx, G.vrr(500, 800)); voc(118 * tom * 1.6, t + 0.02, 0.32, 0.1 * v, 1100, 118 * tom * 1.3, 0.03); },
    // the one it was thrown on: the gasp, the outraged «ei!»
    molhado: (t, v, o) => { const tom = (o && o.tom) || 1; nz(t, 0.22, 0.06 * v, 'bandpass', 950, 1.4, sfx, 1600, 0.04); syl(130 * tom * 1.5, t + 0.28, 0.32, 0.13 * v, 'E', 130 * tom * 2, 0.02, sfx, tom); },
    // the drunk singing alone and loud: the people's tune, out of tune — the notes off by a quarter tone, the lines sliding, the time unsteady
    cantoria: (t, v, o) => { const N = (o && o.notas) || PENTA; const tom = (o && o.tom) || 1; const L = lingua(o); const base = Math.floor(N.length / 3); let at = t, i = base + (G.VR() * 3 | 0); const n = 4 + (G.VR() * 3 | 0);
      for (let k = 0; k < n; k++) { i = G.clamp(i + G.vpick([-2, -1, 0, 1, 1, 2]), 0, N.length - 1); const off = Math.pow(2, G.vrr(-0.7, 0.7) / 12); const f = N[i] * (tom >= 1.3 ? 1 : 0.5) * off; const d = G.vrr(0.22, 0.55); syl(f, at, d, 0.14 * v, G.vpick(L.v), f * Math.pow(2, G.vrr(-1.2, 0.6) / 12), 0.04, sfx, tom); at += d + G.vrr(0, 0.12); }
      if (G.VR() < 0.3) LIB.hiccup(at + 0.05, 0.8 * v, o); },
    // the faint: the knees, then the body on the floor — the cup out of the hand rolling away
    desmaio: (t, v, o) => { const p = (o && o.piso) || 'terra'; fall(t, 0.5 * v, p, 0.6); fall(t + 0.22, v, p, 1.2); nz(t + 0.24, 0.3, 0.05 * v, 'bandpass', 600, 1, sfx, 300); if (o && o.mat) { cupKnock(t + 0.3, 0.6 * v, o.mat); for (let k = 0; k < 3; k++) cupKnock(t + 0.5 + k * 0.17, 0.25 * v * (1 - k * 0.25), o.mat, 1.05); } syl(95 * ((o && o.tom) || 1), t + 1.1, 0.5, 0.05 * v, 'o', 80 * ((o && o.tom) || 1), 0.1, sfx); },
    // a body dragged on the floor: the clothes and the heels on earth, boards or flags — and the breath of who pulls
    arrastar: (t, v, o) => { const p = (o && o.piso) || 'terra'; const F = p === 'tabua' ? [700, 2] : p === 'terra' ? [380, 1.2] : [1300, 1.6]; const s = ac.createBufferSource(); s.buffer = noise; s.loop = true; const f = ac.createBiquadFilter(), g = ac.createGain(), am = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain(); f.type = 'bandpass'; f.frequency.value = F[0]; f.Q.value = F[1]; lfo.frequency.value = G.vrr(14, 24); lg.gain.value = 0.35; am.gain.value = 0.65; lfo.connect(lg); lg.connect(am.gain); env(g, t, 0.12, 0.13 * v, 0.9); s.connect(f); f.connect(am); am.connect(g); g.connect(out(sfx)); s.start(t, G.VR()); lfo.start(t); s.stop(t + 1.2); lfo.stop(t + 1.2); LIB.heave(t + 0.1, 0.8 * v, o); },
    // the brewer's paddle in the vat: its knock on the staves, the wort turned over — and, the vat on the fire, its boil (ferve)
    cuba: (t, v, o) => { nz(t, 0.03, 0.16 * v, 'bandpass', 320, 5); osc('sine', 180, t, 0.05, 0.08 * v, sfx, 140); nz(t + 0.06, 0.55, 0.08 * v, 'bandpass', 650, 1.2, sfx, 1300, 0.12); nz(t + 0.4, 0.3, 0.05 * v, 'bandpass', 1000, 1.2, sfx, 550, 0.08); if (o && o.ferve) for (let k = 0; k < 5; k++) { const f0 = G.vrr(140, 260); osc('sine', f0, t + 0.2 + k * G.vrr(0.08, 0.2), 0.06, 0.06 * v, sfx, f0 * 2.1); } },
    // the vat on the fire, by itself: the big slow bubbles of the boiling wort, the hiss under them
    fervura: (t, v) => { nz(t, 1, 0.025 * v, 'bandpass', 900, 0.8, sfx, 700, 0.2); for (let k = 0; k < 6; k++) { const f0 = G.vrr(110, 240); osc('sine', f0, t + G.vrr(0, 1), G.vrr(0.05, 0.1), G.vrr(0.04, 0.09) * v, sfx, f0 * G.vrr(1.8, 2.6)); } },
    // the knucklebones of the T4 — the dice in their cup, thrown, tumbling, still — and the thrower's cry, the table's laugh
    dados: (t, v, o) => { const m = (o && o.mat) || 'madeira'; for (let k = 0; k < 9; k++) tick(t + k * 0.045 + G.vrr(0, 0.02), 0.5 * v, m, 0.9); const end = tumble(t + 0.6, v, m, 2); const tom = (o && o.tom) || 1; if (G.VR() < 0.65) syl(140 * tom, end + 0.15, 0.28, 0.1 * v, G.vpick(['a', 'o', 'e']), 185 * tom, 0.02, sfx, tom); if (G.VR() < 0.3) laugh(end + 0.5, 0.5 * v, o); },
    // the cards of the T5, tablets of each people's stuff: shuffled (clacked, or riffled where they are papyrus), laid down, a word over them
    cartas: (t, v, o) => { const m = (o && o.mat) || 'madeira'; if (m === 'papiro') { nz(t, 0.35, 0.05 * v, 'highpass', 3200, 0, sfx, 0, 0.05); } else for (let k = 0; k < 6; k++) tick(t + k * 0.06, 0.4 * v, m); tick(t + 0.6, 0.8 * v, m, 0.8); nz(t + 0.6, 0.03, 0.06 * v, 'bandpass', 1500, 1.5); if (G.VR() < 0.4) { const tom = (o && o.tom) || 1; syl(130 * tom, t + 0.9, 0.22, 0.07 * v, G.vpick(['a', 'e', 'o']), 140 * tom, 0.02, sfx, tom); } },
    // the arm wrestle: two straining, through the teeth, and the table creaking under the elbows
    bracoForca: (t, v, o) => { const tom = (o && o.tom) || 1; for (let k = 0; k < 2; k++) { const f = 105 * tom * (k ? 1.12 : 1); syl(f, t + k * 0.1, 0.75, 0.07 * v, k ? 'schwa' : 'e', f * G.vrr(1.08, 1.2), 0.1, sfx, tom); } nz(t + 0.2, 0.5, 0.04 * v, 'bandpass', 520, 9, sfx, 700, 0.1); },
    // its end: the beaten arm slammed on the table, the cups jumping on it, the winner's shout and the room's «oh!»
    bracoBate: (t, v, o) => { osc('sine', 140, t, 0.12, 0.42 * v, sfx, 70); nz(t, 0.05, 0.3 * v, 'bandpass', 500, 2); for (let k = 0; k < 3; k++) cupKnock(t + 0.04 + k * 0.05, 0.35 * v, (o && o.mat) || 'barro', 1 + k * 0.05); const tom = (o && o.tom) || 1; voc(118 * tom * 1.6, t + 0.15, 0.3, 0.1 * v, 1100, 118 * tom * 1.9, 0.03); multidao(t + 0.3, 0.7 * v, o, 4, 'o', 1.05); },
    // the cheat: next to nothing — a tablet or a die slid under the hand on the wood
    trapaca: (t, v) => { nz(t, 0.16, 0.02 * v, 'bandpass', 2600, 2, sfx, 2000, 0.05); },
    // the cheat caught: the voices raised over each other, the bench shoved back, the fist on the table, the cups knocked over
    confusao: (t, v, o) => { const tom = (o && o.tom) || 1; for (let k = 0; k < 3; k++) voc(118 * tom * G.vrr(1.3, 1.9), t + k * G.vrr(0.08, 0.2), 0.35, 0.09 * v, G.vpick([900, 1100, 1300]), 118 * tom * G.vrr(1.1, 2), 0.03); scrape(t + 0.15, v, (o && o.piso) || 'tabua'); osc('sine', 130, t + 0.45, 0.1, 0.35 * v, sfx, 70); nz(t + 0.45, 0.04, 0.22 * v, 'bandpass', 600, 2); for (let k = 0; k < 2; k++) cupKnock(t + 0.5 + k * 0.12, 0.4 * v, (o && o.mat) || 'barro'); },
    // the drinking match: draught after draught, the throat working
    goles: (t, v, o) => { const tom = (o && o.tom) || 1; for (let k = 0; k < 5; k++) { const at = t + k * G.vrr(0.26, 0.34); osc('sine', 185 * Math.sqrt(tom), at, 0.07, 0.08 * v, sfx, 118); nz(at, 0.05, 0.05 * v, 'bandpass', 420, 3); } },
    // the last cup of the match slammed on the table, the breath let out
    canecaBate: (t, v, o) => { cupKnock(t, 1.3 * v, (o && o.mat) || 'barro'); osc('sine', 120, t, 0.08, 0.2 * v, sfx, 70); nz(t + 0.15, 0.55, 0.06 * v, 'bandpass', 900, 1.1, sfx, 450, 0.06); },
    // the cooking at a fire — the home's and the tavern's (T3: the same gesture): the sizzle, the ladle on the pot, a bubble
    cook: (t, v) => { const s = ac.createBufferSource(); s.buffer = noise; s.loop = true; const f = ac.createBiquadFilter(), g = ac.createGain(), am = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain(); f.type = 'highpass'; f.frequency.value = 3200; lfo.type = 'square'; lfo.frequency.value = G.vrr(20, 40); lg.gain.value = 0.35; am.gain.value = 0.65; lfo.connect(lg); lg.connect(am.gain); env(g, t, 0.05, 0.035 * v, 0.6); s.connect(f); f.connect(am); am.connect(g); g.connect(out(sfx)); s.start(t, G.VR()); lfo.start(t); s.stop(t + 0.8); lfo.stop(t + 0.8); if (G.VR() < 0.5) { osc('sine', 2350, t + 0.3, 0.12, 0.02 * v, sfx, 2300); osc('sine', 3650, t + 0.3, 0.08, 0.012 * v, sfx); } for (let k = 0; k < 2; k++) { const f0 = G.vrr(260, 380); osc('sine', f0, t + 0.15 + k * 0.2, 0.05, 0.03 * v, sfx, f0 * 1.9); } },
  });
  // ---------------- the screen's own sounds (T8, D-896): a sound of no place, for the screen — the games of the body ----------------
  // G.Audio.ui(nome, o): the dice game and the cards of the T4 and the T5 call it (o: { mat — 'osso', 'madeira', the cards' stuff —, n — how
  // many dice, coins —, vol }, or the material alone). No owner in the world: the screen is its owner; nothing of the world is read
  const UI = {
    // the dice shaken in the cup (the cup's own hollow over them)
    'dados-copo': (t, v, o) => { const m = o.mat || 'madeira'; const n = 14 + ((o.n || 2) - 2) * 3; for (let k = 0; k < n; k++) tick(t + k * 0.04 + G.vrr(0, 0.018), 0.55 * v, m, 0.85); nz(t, 0.6, 0.03 * v, 'bandpass', 700, 3, sfx, 760, 0.05); },
    // thrown on the board: each die bouncing and rolling
    'dados-rolar': (t, v, o) => { tumble(t, v, o.mat || 'madeira', o.n || 2); },
    // still: the last knock and the wobble
    'dados-parar': (t, v, o) => { const m = o.mat || 'madeira'; tick(t, 0.9 * v, m); tick(t + 0.07, 0.4 * v, m, 1.05); tick(t + 0.11, 0.2 * v, m, 1.1); },
    // the tablets shuffled: a run of knocks swelling, the deck squared — the papyrus and the amate riffled
    'cartas-embaralhar': (t, v, o) => { const m = o.mat || 'madeira'; if (m === 'papiro') { const s = ac.createBufferSource(); s.buffer = noise; s.loop = true; const f = ac.createBiquadFilter(), g = ac.createGain(), am = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain(); f.type = 'highpass'; f.frequency.value = 2600; lfo.frequency.value = 38; lg.gain.value = 0.5; am.gain.value = 0.5; lfo.connect(lg); lg.connect(am.gain); env(g, t, 0.1, 0.09 * v, 0.45); s.connect(f); f.connect(am); am.connect(g); g.connect(out(sfx)); s.start(t, G.VR()); lfo.start(t); s.stop(t + 0.7); lfo.stop(t + 0.7); }
      else for (let k = 0; k < 14; k++) tick(t + k * 0.035 + G.vrr(0, 0.01), (0.3 + 0.04 * k) * v, m); tick(t + 0.62, 0.8 * v, m, 0.8); tick(t + 0.72, 0.7 * v, m, 0.8); },
    // one card dealt: the slide, the landing
    'cartas-dar': (t, v, o) => { const m = o.mat || 'madeira'; nz(t, 0.08, 0.08 * v, 'bandpass', 2600, 1.5, sfx, 1600); if (m === 'papiro') nz(t + 0.08, 0.02, 0.1 * v, 'bandpass', 1500, 1); else tick(t + 0.08, 0.5 * v, m, 0.9); },
    // a card played on the table: firmer
    'cartas-jogar': (t, v, o) => { const m = o.mat || 'madeira'; nz(t, 0.05, 0.1 * v, 'bandpass', 2200, 1.5, sfx, 1300); if (m === 'papiro') { nz(t + 0.05, 0.03, 0.2 * v, 'bandpass', 1600, 1); osc('sine', 150, t + 0.05, 0.05, 0.12 * v, sfx, 100); } else { tick(t + 0.05, v, m, 0.8); osc('sine', 160, t + 0.05, 0.05, 0.1 * v, sfx, 110); } },
    // a card turned over: the flick and the light knock
    'cartas-virar': (t, v, o) => { const m = o.mat || 'madeira'; nz(t, 0.05, 0.06 * v, 'bandpass', 3000, 2, sfx, 1800); nz(t + 0.06, 0.05, 0.05 * v, 'bandpass', 2200, 2, sfx, 3000); if (m === 'papiro') nz(t + 0.12, 0.02, 0.08 * v, 'bandpass', 1500, 1); else tick(t + 0.12, 0.45 * v, m); },
    // the stake: the coins set down on the table, one on the other, the last one ringing
    aposta: (t, v, o) => { const n = Math.min(8, o.n || 3); for (let k = 0; k < n; k++) { const at = t + k * G.vrr(0.06, 0.1); const f = G.vrr(2900, 3500); osc('sine', f, at, 0.1, 0.045 * v, sfx, f * 0.99); osc('sine', f * 1.66, at, 0.06, 0.02 * v, sfx); nz(at, 0.008, 0.06 * v, 'bandpass', 4200, 3); } },
    // the win: a run up the lyre, the coins' shimmer over it
    vitoria: (t, v) => { [392, 493.9, 587.3, 783.99].forEach((f, k) => { const n = pluckStr(f, t + k * 0.09, 0.2 * v, 3600); n.connect(revIn); }); for (let k = 0; k < 5; k++) osc('sine', G.vrr(3200, 4400), t + 0.35 + k * 0.05, 0.12, 0.018 * v, sfx); },
    // the loss: down the lyre, softly, and the hand on the table
    derrota: (t, v) => { [392, 349.2, 293.7].forEach((f, k) => { const n = pluckStr(f, t + k * 0.16, 0.16 * v, 1800); n.connect(revIn); }); osc('sine', 120, t + 0.55, 0.12, 0.14 * v, sfx, 75); nz(t + 0.55, 0.04, 0.08 * v, 'lowpass', 600); },
  };
  // (the level of each, measured — T-2021: the dice and the cards about the clatter of a table, the win and the loss under the buttons)
  const UI_GAIN = { 'dados-copo': 2.4, 'dados-rolar': 2, 'dados-parar': 2.2, 'cartas-embaralhar': 2, 'cartas-dar': 2, 'cartas-jogar': 1.3, 'cartas-virar': 2.4, aposta: 1.3, vitoria: 0.6, derrota: 0.75 };
  for (const k in UI_GAIN) { const f0 = UI[k]; UI[k] = (t, v, o) => f0(t, v * UI_GAIN[k], o); }
  A.UI = Object.freeze(Object.keys(UI));
  A.tocouUi = []; // (what the screen rang — kept while A.gravar is on: the proofs')
  A.ui = function (nome, o) {
    const fn = UI[nome]; if (!fn || !ac || !A.sfxOn || A.mute || ac.state !== 'running') return false;
    const opt = typeof o === 'string' ? { mat: o } : o || NONE; const now = ac.currentTime;
    if (last['ui:' + nome] && now - last['ui:' + nome] < 0.03) return false; last['ui:' + nome] = now;
    bus = null; fn(now + 0.01, opt.vol === undefined ? 1 : opt.vol, opt);
    if (A.gravar) { A.tocouUi.push({ t: now, s: nome, mat: opt.mat || null }); if (A.tocouUi.length > 200) A.tocouUi.splice(0, 100); }
    return true;
  };
  // the talk at a speaker's side, in the timbre of the speaker's people: two to four syllables (the voice of one, P9 — D-780)
  LIB.voz = (t, v, o) => { const L = lingua(o), tom = (o && o.tom) || 1, f0 = 118 * tom; const n = 2 + (G.VR() * 3 | 0); let at = t; for (let k = 0; k < n; k++) { const f = f0 * G.vrr(0.9, 1.22); at += cons(at, 0.05 * v, L); const d = 1 / L.ritmo * G.vrr(0.6, 1); syl(f, at, d, 0.085 * v, G.vpick(L.v), f * G.vrr(0.86, 1.1), 0.02, sfx, tom); at += d; } };
  A.sons = () => Object.keys(LIB); // (for the proofs: every sound a table names is in the library)
  // the music leans to the scene: a held breath, a grief, a wonder (null: back to the world's own music)
  A.mood = function (m) { A.moodNow = m || null; A.moodT = 0; };
  const GAP = { chop: 0.07, hammer: 0.06, mine: 0.07, hit: 0.05, hover: 0.04, swish: 0.08, horn: 1.2, fire: 0.3, gore: 0.12, clang: 0.06, scream: 0.4, caw: 0.6, drum: 1.4, bark: 0.35, cluck: 0.5, rooster: 3, flap: 0.5, gull: 2, owl: 4, frog: 0.8, trill: 1, cuckoo: 3, wave: 1.5, bees: 1.6, monkey: 2.5,
    voz: 0.16, hey: 0.5, pregao: 1.2, cheer: 0.5, murmur: 0.45, chant: 0.7, hum: 1.2, lute: 0.16, anvil: 0.14, clap: 0.08, sail: 1, fornalha: 0.6, baa: 1.2, moo: 2.5, oink: 1, neigh: 3, meow: 3, coo: 1.5, gobble: 1.5, scythe: 0.2, hoe: 0.2, loom: 0.2,
    // (P9: the room's — a few at once of the many at the tables, never a machine-gun of one)
    vozBebado: 0.3, riso: 0.35, brinde: 0.2, gole: 0.12, verter: 0.4, ossos: 0.5, pano: 0.4, canecas: 0.4, gorjeta: 0.3, expulsa: 1, fechar: 1, ronco: 1, passo: 0.06, banco: 0.12, porta: 0.3, portaFecha: 0.3, lareira: 0.3, panela: 0.3, chuvaTelhado: 0.3 };
  // one sound of the library, now: sp — its way out (pan: the side; muf: the walls between; to: 'amb' for a sound of the
  // place, which the ambience's switch rules; o: what the source gives it)
  function emit(name, vol, sp) {
    const fn = LIB[name]; if (!fn) return false;
    const now = ac.currentTime;
    if (last[name] && now - last[name] < (GAP[name] || 0.02)) return false;
    last[name] = now;
    bus = sp && (sp.pan || sp.muf || sp.to === 'amb' || sp.sala) ? way(sp) : null;
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
  // (what a source gives its sound: the voice's pitch and tongue, the cup's material, the floor, the drink — P9)
  const giveOf = f => ({ tom: f.tom, notas: f.notas || null, povo: f.povo || null, mat: f.mat || null, piso: f.piso || null, bebado: f.bebado || f.ebrio || 0, n: f.n || 0, canecas: f.canecas || 0, ferve: f.ferve || 0 });
  // (as: another sound of the same source — the door that shuts behind the one it swung for, the bench under who sits down)
  // (extra: what the player's own memory adds — the blows on a door so far, T8)
  function ring(f, vol, far, peso, as, extra) {
    const s = as || f.s;
    if (!emit(s, vol, { pan: f.pan, muf: far ? Math.max(0.7, f.muf || 0) : f.muf, to: 'amb', sala: far ? 0 : f.sala || 0, o: extra ? Object.assign(giveOf(f), extra) : giveOf(f) })) return;
    note(s, f, vol, far, peso);
  }
  function note(s, f, vol, far, peso) {
    if (A.gravar) { A.tocou.push({ t: ac.currentTime, s, k: f.k, de: f.de, gain: vol, pan: f.pan, muf: f.muf, longe: far ? 1 : 0, peso: far ? peso : 0, sala: f.sala || 0 }); if (A.tocou.length > 600) A.tocou.splice(0, 200); }
  }
  // (the voices of the room the talk's bed already has: the near table told apart, the rest in the bed — D-780)
  const VOZ = { voz: 1, vozBebado: 1 };
  const inBed = f => f.sala && VOZ[f.s] && f.d * 4 > 3 && walla && walla.sala === f.sala && walla.on;
  const LOOK = 0.25; // (seconds between two looks at the scene)
  function place(t, dtLook) {
    const c = cena; if (!c) return; stamp++;
    const sp = Math.max(1, G.speed || 1);
    // (a gesture whose contact fell between two looks — the act ends at its contact, or began again —: it reached it if the
    // world's seconds since the last look carry its clock there)
    const reached = st => st.f.q === 'contato' && !st.fired && st.fase + (LOOK + 0.1) * sp >= st.f.contato;
    for (const f of c.fontes) {
      // (P9: a bed of the room — the talk, the fire, the pot, the rain on the roof — is its engine's; the tune is the music's, and who
      // claps, dances or sings to a music heard here goes on its pulse)
      if (f.q === 'leito' || f.musica || (f.ritmo && musics.has('v' + f.ritmo.de))) continue;
      if (f.q === 'estado') { // (a door someone passes: it swings open for them — unless it stands open by its rule —, and shuts after)
        const st0 = rung.get(f.k); if (!st0) { rung.set(f.k, { f, seen: stamp }); if (!f.fica) ring(f, f.gain, false, 0, 'porta'); } else { st0.f = f; st0.seen = stamp; }
        continue;
      }
      let st = rung.get(f.k);
      // (the act with a sound at its end over, the same one now at another act — the arm wrestle ended, back to the talk: its end, T8)
      if (st && st.f.fim && st.f.ato !== f.ato) ring(st.f, st.f.gain, false, 0, st.f.fim);
      if (!st) { st = { f, fase: f.fase, fired: f.q === 'contato' && f.fase >= f.contato, next: t + (f.cada || 0.3) * (f.q === 'acaso' ? G.vrr(0.2, 1.2) : G.vrr(0, 0.5)), seen: stamp }; rung.set(f.k, st);
        if (f.tipo === 'passos' && f.pass === 'sai' && f.banco) ring(f, f.gain, false, 0, 'banco'); // (up from the bench, and away)
        if (f.q === 'contato') continue; }
      if (inBed(f)) { st.f = f; st.seen = stamp; continue; }
      // (a door being forced: the crash the moment its state turns to broken — the world's door, In.doorState —, T8 D-895)
      if (f.porta !== undefined) { if (f.porta === 'arrombada' && st.porta !== undefined && st.porta !== 'arrombada') ring(f, Math.min(1, f.gain * 1.2), false, 0, 'portaCede'); st.porta = f.porta; if (f.porta === 'arrombada') { st.f = f; st.seen = stamp; continue; } }
      if (f.q === 'contato') {
        if (f.fase < st.fase) { if (reached(st)) ring(st.f, st.f.gain); st.fired = false; } // (a new gesture began)
        st.f = f; st.fase = f.fase; st.seen = stamp;
        if (!st.fired && f.fase >= f.contato) { st.fired = true; ring(f, f.gain); }
        continue;
      }
      st.f = f; st.seen = stamp;
      if (t < st.next) continue;
      st.next = t + f.cada * (f.q === 'acaso' ? G.vrr(0.5, 1.6) : G.vrr(0.9, 1.15));
      if (f.porta !== undefined) { st.n = (st.n || 0) + 1; ring(f, f.gain, false, 0, null, { golpes: st.n }); } else ring(f, f.gain);
    }
    for (const [k, st] of rung) {
      if (st.seen === stamp) continue; if (stamp - st.seen === 1 && reached(st)) ring(st.f, st.f.gain);
      // (the door shut after the last one through; the bench under the one come to the seat)
      if (st.f.q === 'estado') { if (!st.f.fica) ring(st.f, st.f.gain, false, 0, 'portaFecha'); rung.delete(k); continue; }
      if (st.f.tipo === 'passos' && stamp - st.seen === 1 && st.f.pass === 'entra' && st.f.banco) ring(st.f, st.f.gain, false, 0, 'banco');
      // (the sound of an act's end, the act over: the arm slammed on the table, the match's last cup put down — T8)
      if (st.f.fim && stamp - st.seen === 1) ring(st.f, st.f.gain, false, 0, st.f.fim);
      if (stamp - st.seen > 12 || st.f.q === 'contato') rung.delete(k);
    }
    // the quarter's bed: the far voices of its own work, as loud as its habit and the hands at it now — moving slowly
    bedMix = A.blend(bedMix, c.fundo ? c.fundo.w : null, dtLook);
    // (the god from high above hears as little of it as of anything else: the ear's own measure, k)
    const kb = c.ear.k;
    if (c.fundo && kb > 0.05) for (const fam of A.FAMS) {
      const m = bedMix[fam]; const L = c.fundo.de[fam]; if (!(m > 0.03) || !L || !L.length) continue;
      if (t < (bedT[fam] || 0)) continue;
      bedT[fam] = t + G.vrr(1.2, 3.2) / (0.4 + m);
      ring(G.vpick(L), (0.05 + 0.12 * m) * kb, true, m);
    }
  }
  // ---------------- the room's engines (P9, D-780 to D-786): the beds the scene says the room has, played on and on ----------------
  // The scene decides (audio-src.js: the talk of who talks now, the fire lit, the pot cooking, the rain over the roof, the music of
  // who plays); here they are only played — the voices with no words, the crackle, the bubble, the drops on the straw, the tiles or
  // the boards — each by its source's side and walls, and into the room's own echo. Nothing here reads the world: only the scene
  // (a way kept for a sound that lasts: its side, its walls — the street's muffle —, and the way into the room and its echo, by where
  // the ear is)
  function bedWay() {
    const inG = ac.createGain(); inG.gain.value = 0; const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 18000; lp.Q.value = 0.5;
    const pn = ac.createStereoPanner ? ac.createStereoPanner() : null; const toOut = ac.createGain(), toIn = ac.createGain(), toRoom = ac.createGain(); toIn.gain.value = 0; toRoom.gain.value = 0;
    inG.connect(lp); const last = pn ? pn : lp; if (pn) lp.connect(pn); last.connect(toOut); last.connect(toIn); lp.connect(toRoom); toOut.connect(amb); toIn.connect(ambIn); toRoom.connect(roomIn);
    return { inG, set(f, t, g) {
      const inR = !!(f && f.sala); inG.gain.setTargetAtTime(f ? g : 0, t, 0.35);
      if (!f) return; if (pn) pn.pan.setTargetAtTime(G.clamp(f.pan || 0, -1, 1), t, 0.15); lp.frequency.setTargetAtTime(f.muf ? 520 : 18000, t, 0.2);
      toOut.gain.setTargetAtTime(inR ? 0 : 1, t, 0.15); toIn.gain.setTargetAtTime(inR ? 1 : 0, t, 0.15); toRoom.gain.setTargetAtTime(inR ? roomMix() : 0, t, 0.15);
    } };
  }
  const loopN = (filt, f, q, g, dest) => { const s = ac.createBufferSource(); s.buffer = noise; s.loop = true; const fl = ac.createBiquadFilter(); fl.type = filt; fl.frequency.value = f; if (q) fl.Q.value = q; const gg = ac.createGain(); gg.gain.value = g; s.connect(fl); fl.connect(gg); gg.connect(dest); s.start(0, G.VR() * 1.5); return { fl, g: gg }; };
  // (the loudest source of a kind in the scene)
  const top = (c, pred) => { let b = null; for (const f of c.fontes) if (pred(f) && (!b || f.gain > b.gain)) b = f; return b; };
  // ---- the room's echo: made from its plan (A.ecoDe: the floor, the walls, the roof, the height, the people), two of them to pass from
  // one room to the next without a cut; the echo of each room made once and kept
  let room = null; const irs = new Map();
  function irOf(E) {
    let b = irs.get(E.sig); if (b) return b;
    const sr = ac.sampleRate, len = Math.max(2, Math.floor(sr * Math.min(2.4, E.rt * 1.2 + 0.05))), pre = Math.floor(E.pre * sr); b = ac.createBuffer(2, len, sr);
    const dk = Math.exp(-6.9 / (E.rt * sr)); // (−60 dB at the room's rt)
    const side = Math.sqrt(E.m2 || 30); const taps = [E.h * 2, side, side * 1.4, E.h * 2 + side * 0.6]; // (the first reflections: the floor and the roof, the walls about)
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch); let lp = 0, e = 1, fc = E.tom; const fd = Math.exp(-2.2 / (E.rt * sr)); // (the high end dies first)
      for (let i = pre; i < len; i++) { const a = Math.min(1, 2 * Math.PI * (fc + 350) / sr); lp += a * ((G.VR() * 2 - 1) - lp); d[i] = lp * e * 0.5; e *= dk; fc *= fd; }
      for (const m of taps) { const i = pre + Math.floor(m / 343 * sr) + (ch ? Math.floor(sr * 0.0007) : 0); if (i < len) d[i] += (G.VR() < 0.5 ? 0.35 : -0.35); }
    }
    irs.set(E.sig, b); if (irs.size > 8) irs.delete(irs.keys().next().value);
    return b;
  }
  function roomTick(t, c) {
    if (!room) { const mk = () => { const cv = ac.createConvolver(), g = ac.createGain(); g.gain.value = 0; roomIn.connect(cv); cv.connect(g); g.connect(master); return { cv, g }; }; room = { slots: [mk(), mk()], cur: 0, sig: '' }; }
    const E = c && c.sala && c.sala.eco; const sig = E ? E.sig : '';
    if (sig === room.sig) return; room.sig = sig;
    room.slots[room.cur].g.gain.setTargetAtTime(0, t, 0.3);
    if (E) { room.cur = 1 - room.cur; const s1 = room.slots[room.cur]; s1.cv.buffer = irOf(E); s1.g.gain.setTargetAtTime(0.85, t + 0.03, 0.3); }
  }
  // ---- the talk of a room (D-780): voices with no words, one for each who talks there now up to six told apart, the hum of a crowd
  // past them; in the timbre of the room's people, the drink louder and looser — and the laugh of who drank, in the talk itself
  const W6 = 6; let walla = null;
  function wallaMake() {
    const B = bedWay(); const vs = [];
    for (let k = 0; k < W6; k++) {
      const o = ac.createOscillator(); o.type = 'sawtooth'; const fem = k % 2 === 1; const f0 = fem ? 185 + 12 * k : 100 + 9 * k; o.frequency.value = f0;
      const b1 = ac.createBiquadFilter(), b2 = ac.createBiquadFilter(), g2 = ac.createGain(), vg = ac.createGain(); b1.type = b2.type = 'bandpass'; b1.Q.value = 4; b2.Q.value = 6; g2.gain.value = 0.55; vg.gain.value = 0;
      const pn = ac.createStereoPanner ? ac.createStereoPanner() : null; if (pn) pn.pan.value = (k / (W6 - 1) - 0.5) * 1.1;
      o.connect(b1); o.connect(b2); b1.connect(vg); b2.connect(g2); g2.connect(vg); if (pn) { vg.connect(pn); pn.connect(B.inG); } else vg.connect(B.inG); o.start();
      vs.push({ o, b1, b2, vg, f0, fem, next: 0, left: 0 });
    }
    const crowd = loopN('bandpass', 560, 0.8, 0, B.inG);
    walla = { B, vs, crowd, on: false, sala: 0, riso: 0, rec: 0 };
  }
  function wallaTick(t, c, live) {
    const f = live ? top(c, x => x.s === 'murmur') : null; if (!f && !walla) return; if (!walla) wallaMake();
    // (a feast fills the hall louder and laughs more; mourners in the room hush the talk and stop the laughter — T8, D-890, D-892)
    const W = walla; W.on = !!f; W.sala = f ? f.sala || 0 : 0; const fz = f && f.festa ? 1.3 : 1, lt = f ? 1 - 0.6 * Math.min(1, f.luto || 0) : 1; W.B.set(f, t, f ? f.gain * 2.2 * fz * lt : 0); if (!f) { for (const V of W.vs) V.vg.gain.setTargetAtTime(0, t, 0.2); W.crowd.g.gain.setTargetAtTime(0, t, 0.4); return; }
    const L = lingua(f), beb = f.bebado || 0, act = Math.min(W6, f.fala || 0);
    for (let k = 0; k < W6; k++) {
      const V = W.vs[k]; if (k >= act) { V.vg.gain.setTargetAtTime(0, t, 0.2); continue; } if (t < V.next) continue;
      // (a breath — the other's turn to talk —, or a syllable)
      if (V.left <= 0) { V.left = G.vri(3, 12); V.next = t + G.vrr(0.25, 1.1) * (1 - 0.4 * beb); V.vg.gain.setTargetAtTime(0, t, 0.05); continue; }
      V.left--; const d = 1 / (L.ritmo * (1 + 0.15 * beb)) * G.vrr(0.7, 1.35); const F = VOGAL[G.vpick(L.v)] || VOGAL.a; const kk = V.fem ? 1.17 : 1;
      V.b1.frequency.setTargetAtTime(F[0] * kk, t, 0.02); V.b2.frequency.setTargetAtTime(F[1] * kk, t, 0.025);
      const gl = 0.1 + 0.25 * beb; V.o.frequency.setTargetAtTime(V.f0 * (1 + G.vrr(-gl, gl * 1.4)), t, 0.04);
      const pk = (0.05 + 0.03 * beb) * G.vrr(0.55, 1.1); V.vg.gain.setTargetAtTime(pk, t, 0.012); V.vg.gain.setTargetAtTime(0.0001, t + d * 0.65, 0.03);
      if (G.VR() < 0.5) cons(t, pk * 0.8, L, W.B.inG);
      V.next = t + d;
    }
    W.crowd.g.gain.setTargetAtTime(f.fala > W6 ? Math.min(0.06, 0.008 * (f.fala - W6 + 1)) : 0, t, 0.5);
    // (the laugh of who drank, in the talk: as many as drank, as drunk as they are)
    if ((beb > 0.3 || f.festa) && !(f.luto > 0.1) && t >= W.riso) { W.riso = t + G.vrr(3, 9) / Math.max(1, f.fala * Math.max(beb, f.festa ? 0.5 : 0)); bus = W.B.inG; laugh(t + 0.02, 0.55, { tom: G.vpick([1, 1, 1.5]), povo: f.povo, bebado: beb }); bus = null; note('riso', f, f.gain); }
    if (t - W.rec >= 1) { W.rec = t; note('murmur', f, f.gain); }
  }
  // ---- the fire of the room (D-782): only lit (the scene asks G.Atmos.fire) — the low breath of the embers, the crackle of the wood, a
  // knot that bursts now and then, a log that settles — the long fire of the north's hall bigger than a stove's covered flame
  let fogo = null;
  function fogoTick(t, c, live) {
    const f = live ? top(c, x => x.s === 'lareira' && x.q === 'leito') : null; if (!f && !fogo) return;
    if (!fogo) { const B = bedWay(); fogo = { B, rum: loopN('lowpass', 240, 0, 0.55, B.inG), hiss: loopN('bandpass', 1300, 0.4, 0.07, B.inG), next: 0, burst: 0, stir: 0, rec: 0 }; }
    const F = fogo; F.B.set(f, t, f ? f.gain * 0.9 : 0); if (!f) return; const k = f.forca || 0.6;
    while (F.next < t + 0.06) { const at = Math.max(t, F.next); nz(at, G.vrr(0.003, 0.012), G.vrr(0.06, 0.22), 'bandpass', G.vrr(1400, 5600), G.vrr(1, 3), F.B.inG); F.next = at + G.vrr(0.02, 0.25) / (0.5 + k); }
    if (t >= F.burst) { F.burst = t + G.vrr(1.5, 6) / k; const n = G.vri(4, 9); for (let j = 0; j < n; j++) nz(t + j * G.vrr(0.008, 0.02), 0.006, G.vrr(0.12, 0.3), 'bandpass', G.vrr(2200, 6500), 2, F.B.inG); }
    if (t >= F.stir) { if (F.stir) { osc('sine', 85, t, 0.25, 0.35, F.B.inG, 50); nz(t, 0.5, 0.12, 'bandpass', 500, 1, F.B.inG, 1400, 0.1); } F.stir = t + G.vrr(10, 26); }
    if (t - F.rec >= 1) { F.rec = t; note('lareira', f, f.gain); }
  }
  // ---- the pot on the fire (D-782): the cooking the scene says — the bubbles, the simmer
  let panela = null;
  function panelaTick(t, c, live) {
    const f = live ? top(c, x => x.s === 'panela') : null; if (!f && !panela) return;
    if (!panela) { const B = bedWay(); panela = { B, sim: loopN('bandpass', 760, 1, 0.05, B.inG), next: 0, rec: 0 }; }
    const P = panela; P.B.set(f, t, f ? f.gain : 0); if (!f) return;
    while (P.next < t + 0.06) { const at = Math.max(t, P.next); const f0 = G.vrr(220, 340); osc('sine', f0, at, G.vrr(0.03, 0.06), G.vrr(0.05, 0.12), P.B.inG, f0 * G.vrr(1.8, 2.4)); P.next = at + G.vrr(0.06, 0.3); }
    if (t - P.rec >= 1) { P.rec = t; note('panela', f, f.gain); }
  }
  // ---- the rain on the roof (D-783): what it beats on is the roof the 3D lays — the straw hushes it, the turf all but swallows it, the
  // tiles tick under it, the boards drum, the flat earth thuds dull —, and an old roof no one keeps lets a drop in
  let telhado = null;
  const ROOF = { palha: ['lowpass', 1600, 0.5, 0.11], turfa: ['lowpass', 650, 0.5, 0.06], telha: ['bandpass', 2800, 0.6, 0.08], tabua: ['bandpass', 1150, 0.8, 0.09], terraco: ['lowpass', 1050, 0.6, 0.07] };
  function telhadoTick(t, c, live) {
    const f = live ? top(c, x => x.s === 'chuvaTelhado') : null; if (!f && !telhado) return;
    if (!telhado) { const B = bedWay(); telhado = { B, bed: loopN('lowpass', 1600, 0.5, 0.1, B.inG), kind: '', next: 0, drip: 0, rec: 0 }; }
    const R = telhado; R.B.set(f, t, f ? f.gain : 0); if (!f) return;
    const K = ROOF[f.telhado] || ROOF.telha; if (R.kind !== f.telhado) { R.kind = f.telhado; R.bed.fl.type = K[0]; R.bed.fl.frequency.setTargetAtTime(K[1], t, 0.3); R.bed.fl.Q.value = K[2]; R.bed.g.gain.setTargetAtTime(K[3], t, 0.3); }
    const r = f.chuva || 0;
    // (the storm: the rain heavier on the roof, and the wind against the shutters — S.weather.storm, the wind's strength: T8, D-892)
    if (f.tempestade) { R.bed.g.gain.setTargetAtTime(K[3] * 1.6, t, 0.5); if (t >= (R.gust || 0)) { if (R.gust) { const w = G.clamp(f.vento || 0.6, 0.3, 1); const g0 = nz(t, 2.6, 0.12 * w, 'lowpass', 380, 0, R.B.inG, 220, 0.9); g0.connect(revIn); for (let k = 0; k < G.vri(2, 4); k++) nz(t + 0.8 + k * G.vrr(0.08, 0.16), 0.02, 0.12 * w, 'bandpass', 700, 4, R.B.inG); } R.gust = t + G.vrr(5, 14); } }
    else if (R.kind) R.bed.g.gain.setTargetAtTime(K[3], t, 0.5);
    // (the drops one by one: on the tiles a click, on the boards a knock, on the flat earth a pat; the straw and the turf have none)
    if (f.telhado === 'telha' || f.telhado === 'tabua' || f.telhado === 'terraco') while (R.next < t + 0.06) { const at = Math.max(t, R.next);
      if (f.telhado === 'telha') nz(at, 0.003, G.vrr(0.04, 0.12), 'highpass', G.vrr(3000, 6500), 0, R.B.inG);
      else if (f.telhado === 'tabua') nz(at, 0.012, G.vrr(0.06, 0.16), 'bandpass', G.vrr(500, 1100), 4, R.B.inG);
      else nz(at, 0.02, G.vrr(0.04, 0.09), 'lowpass', 700, 0, R.B.inG);
      R.next = at + G.vrr(0.01, 0.06) / Math.max(0.15, r); }
    if (f.goteira && t >= R.drip) { R.drip = t + G.vrr(1.2, 3.5); const p = G.vrr(1300, 2100); osc('sine', p, t, 0.09, 0.12, R.B.inG, p * 0.45); }
    if (t - R.rec >= 1) { R.rec = t; note('chuvaTelhado', f, f.gain); }
  }
  // ---- the music of who plays (D-784, D-785): a tune on the player's people's ladder, on its own pulse — the pulse of the world where
  // the world goes at a body's pace (the clap the 3D draws can follow it: A.compasso), its own where the god runs the time —, the low
  // string with the strong pulses, the drum's middle and rim; and the room on the same pulse: who claps, who dances, who sings along
  const musics = new Map();
  let rate = 1, rateT = -1, rateC = 0;
  // (a band — the musician of the night, the bards of a feast, T8 D-890 —: one pulse and one tune, the leader's (musica.de); each its part)
  function musicTick(t, c, live) {
    const S = G.S, T = (G.Space && G.Space.TIME) || 0.27; const bands = new Map();
    if (live) for (const f of c.fontes) { if (!f.musica || !(f.gain >= 0.02)) continue; const key = 'v' + f.musica.de; let L = bands.get(key); if (!L) bands.set(key, L = []); L.push(f); }
    for (const [key, L] of bands) {
      L.sort((a, b) => ((a.banda && a.banda.papel) || 0) - ((b.banda && b.banda.papel) || 0) || (a.k < b.k ? -1 : 1));
      const C = L[0].musica; const per = 60 / C.bpm;
      let M = musics.get(key); if (!M) { M = { next: t + 0.05, pulse: 0, deg: 0, note: 0 }; musics.set(key, M); } M.L = L; M.C = C;
      // (at the body's pace, the pulse of the world: the set's start and its pulses in the world's seconds)
      if (rate > 0.02 && rate <= T * 1.4 && C.t0 > 0) { const k = Math.floor((S.clock - C.t0) / C.periodo) + 1; const at = t + (C.t0 + k * C.periodo - S.clock) / rate; if (at > t && Math.abs(at - M.next) > 0.08) { M.next = at; M.pulse = k; } }
      while (M.next < t + 0.12) { pulse(M, M.next, c, per); M.next += per; M.pulse++; }
    }
    for (const k of [...musics.keys()]) if (!bands.has(k)) musics.delete(k);
    // (the world's own music bows while a musician is heard here)
    const d0 = duck; duck = musics.size ? 0.2 : 1; if (d0 !== duck && mus) mus.gain.setTargetAtTime(musLevel(), t, 0.8);
  }
  function pulse(M, at, c, per) {
    const C = M.C; const N = C.notas || PENTA; const top = N.length - 1; const cyc = C.ciclo || [1, 0, 0.5, 0]; const a = cyc[M.pulse % cyc.length]; const len = cyc.length;
    const deg = Math.max(1, Math.round(N.length / 3)); // (the ladder's degrees in one octave)
    // (the tune: a walk on the ladder from the middle octave; home to the tonic at the phrase's end — four cycles)
    const endP = M.pulse % (len * 4) === len * 4 - len;
    const play = a >= 0.5 || G.VR() < 0.3;
    if (play) { M.deg = endP ? 0 : G.clamp(M.deg + G.vpick([-2, -1, -1, 0, 1, 1, 2]), -Math.floor(deg / 2), deg + 2); M.note = N[G.clamp(deg + M.deg, 0, top)]; }
    const idx = G.clamp(deg + M.deg, 0, top); const note0 = M.note || N[deg];
    // (each its part, in the people's ladder: the tune; its harmony two steps of the ladder over it (under it at the top); the low string an
    // octave under, on the strong pulses; more players double the tune an octave down — and a second drum fills the pulses between)
    let drums = 0;
    for (const f of M.L) {
      const p = (f.banda && f.banda.papel) || 0; const nota = p === 1 ? N[G.clamp(idx + (idx + 2 <= top ? 2 : -2), 0, top)] : p >= 2 ? N[Math.max(0, idx - deg)] : note0;
      const on = p === 2 ? a >= 1 : p >= 3 ? a >= 0.5 : play;
      bus = way({ pan: f.pan, muf: f.muf, to: 'amb', sala: f.sala || 0 }); let rang = false;
      if (f.s === 'lira') { if (on) { LIB.lira(at + (p ? G.vrr(0, 0.012) : 0), f.gain * (a >= 1 ? 1 : 0.75) * (p ? 0.8 : 1), { nota, forte: a >= 1 && p === 0, baixo: N[0], brilho: C.timbre ? C.timbre.brilho : 3200 }); rang = true; } }
      else if (f.s === 'tambor') { const second = drums++ > 0; if (second ? a === 0 && G.VR() < 0.55 : a >= 0.5 || G.VR() < 0.25) { LIB.tambor(at, f.gain * (second ? 0.5 : a >= 0.5 ? 1 : 0.45), { forte: !second && a >= 1 }); rang = true; } }
      else if (on) { LIB.canto(at, f.gain, { nota, tom: f.tom, dur: per * (a >= 1 ? 1.6 : 0.9) }); rang = true; }
      bus = null; if (rang) note(f.s, f, f.gain);
    }
    // (the room on the pulse: the hands, the feet, the voices that join — and the dancers' ring calling out at the head of every other turn)
    if (a < 0.5) return;
    let ring0 = null, dancers = 0;
    for (const g of c.fontes) {
      if (!g.ritmo || g.ritmo.de !== C.de || g.gain < 0.02) continue; const j = G.vrr(-0.012, 0.012); // (each a hair off the pulse: a person, not a clock)
      bus = way({ pan: g.pan, muf: g.muf, to: 'amb', sala: g.sala || 0 });
      if (g.s === 'palmas') LIB.palmas(at + 0.012 + j, g.gain, { tom: g.tom });
      else if (g.s === 'pe') { LIB.pe(at + 0.015 + j, g.gain * (a >= 1 ? 1 : 0.6), { piso: g.piso }); dancers++; if (!ring0) ring0 = g; }
      else if (g.s === 'canto' && play) LIB.canto(at + 0.02 + j, g.gain, { nota: note0, tom: g.tom, dur: per * 0.9 });
      bus = null; note(g.s, g, g.gain);
    }
    if (ring0 && dancers >= 3 && M.pulse % (len * 2) === 0) { bus = way({ pan: ring0.pan, muf: ring0.muf, to: 'amb', sala: ring0.sala || 0 }); LIB.roda(at + 0.02, ring0.gain, { n: dancers, povo: ring0.povo }); bus = null; note('roda', ring0, ring0.gain); }
  }
  // the room, each frame: the outside muffled under a roof (more with the door shut), the echo of the room, its beds and its music. A
  // world standing still (paused, a panel open) plays none of the place: only the land goes on
  function salaTick(t, dt, ear, live) {
    const c = cena; if (!c) return;
    // (how many of the world's seconds go by a second of the ear's: the god's speed, or the body's pace — the music's pulse follows it)
    const S = G.S; if (rateT >= 0 && t > rateT + 0.2) { const r = (S.clock - rateC) / (t - rateT); rate = G.lerp(rate, Math.max(0, r), 0.5); rateT = t; rateC = S.clock; } else if (rateT < 0) { rateT = t; rateC = S.clock; }
    const inside = !!ear.dentro && !ear.ug; const open = c.sala && c.sala.porta === 'aberta';
    ambLP.frequency.setTargetAtTime(inside ? (open ? 1500 : 650) : 18000, t, 0.25);
    roomTick(t, c); wallaTick(t, c, live); fogoTick(t, c, live); panelaTick(t, c, live); telhadoTick(t, c, live); musicTick(t, c, live);
  }
  G.worldHooks.push(() => { musics.clear(); rateT = -1; });
  A.update = function (dt) {
    if (!ac || ac.state !== 'running' || !G.S) return;
    const S = G.S; const t = ac.currentTime;
    const ear = earNow = A.ear(); if (!ear) return;
    scapeT -= dt;
    if (scapeT <= 0 && (!A.mute || !cena)) { // (while the sound is off — the skip of time — the scene is not asked again)
      scapeT = LOOK; analyse(ear); cena = A.cena = A.scene(ear); A.musNow = cena.musica;
      scape.people = cena.gente; scape.sell = cena.fundo ? cena.fundo.maos.troca || 0 : 0; const luta = cena.fontes.find(f => f.tipo === 'luta'); scape.fight = luta ? luta.n : 0;
      // (a world standing still — paused, a panel open — makes no gesture: nothing of the place rings; the land goes on)
      if (A.ambOn && !A.mute && (G.speed || 0) > 0 && !(G.Main && G.Main.modalOpen)) place(t, bedAt ? Math.min(2, t - bedAt) : LOOK);
      bedAt = t;
    }
    salaTick(t, dt, ear, A.ambOn && !A.mute && (G.speed || 0) > 0 && !(G.Main && G.Main.modalOpen)); // (the room's beds and its music, P9)
    const zf = scape.zoomF;
    const coast = Math.min(1, scape.sea * 2.2);
    // under the ground the world above goes quiet: drips, and the hum of the rock; under a roof, the street is muffled
    // (and more of the street with the door open: the tavern in its hours, P9)
    const UND = !!ear.ug, uf = UND ? 0.07 : ear.dentro ? (cena && cena.sala && cena.sala.porta === 'aberta' ? 0.5 : 0.35) : 1;
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
  // (for the proofs, in a page — P9, T-1860: no one hears the sounds made here, so they are measured) each sound of the library rendered
  // alone, off the line (an OfflineAudioContext of the same rate), at full volume: its peak and its loudest 50 ms. A sound no one could
  // hear, one that clips, one that fails to be made, is said — nothing is hidden, and nothing of the world is read or played
  A.ensaio = async function (names, o, secs) {
    const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext; if (!OAC) return null;
    const sr = ac ? ac.sampleRate : 48000; const res = {};
    for (const name of names) {
      const fn = LIB[name] || UI[name]; if (!fn) { res[name] = { err: 'não está na biblioteca' }; continue; } // (and the screen's own: T8)
      const off = new OAC(2, Math.floor(sr * (secs || 3)), sr); const keep = [ac, master, sfx, amb, ambIn, revIn, noise, bus];
      ac = off; master = off.createGain(); master.connect(off.destination); sfx = amb = ambIn = master; revIn = off.createGain(); revIn.gain.value = 0.35; revIn.connect(master); bus = null;
      noise = off.createBuffer(1, sr * 2, sr); const nd = noise.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = G.VR() * 2 - 1;
      let err = null; try { fn(0.02, 1, o || NONE); } catch (e) { err = String(e && e.message || e); }
      [ac, master, sfx, amb, ambIn, revIn, noise, bus] = keep;
      if (err) { res[name] = { err }; continue; }
      const buf = await off.startRendering(); let pk = 0, win = 0; const W = Math.floor(sr * 0.05);
      for (let ch = 0; ch < buf.numberOfChannels; ch++) { const d = buf.getChannelData(ch); let s2 = 0; for (let i = 0; i < d.length; i++) { const a = Math.abs(d[i]); if (a > pk) pk = a; s2 += d[i] * d[i]; if (i >= W) s2 -= d[i - W] * d[i - W]; if (i >= W && s2 > win) win = s2; } }
      const db = x => Math.round(20 * Math.log10(Math.max(1e-9, x)) * 10) / 10;
      res[name] = { pico: db(pk), alto: db(Math.sqrt(win / W)) };
    }
    return res;
  };
  // (and how loud the whole of what plays is now: the last tenth of a second at the master — the proofs' meter)
  let meter = null;
  A.medir = function () {
    if (!ac || !master) return null; if (!meter) { meter = ac.createAnalyser(); meter.fftSize = 4096; master.connect(meter); }
    const d = new Float32Array(meter.fftSize); meter.getFloatTimeDomainData(d); let pk = 0, s2 = 0; for (const x of d) { const a = Math.abs(x); if (a > pk) pk = a; s2 += x * x; }
    const db = x => Math.round(20 * Math.log10(Math.max(1e-9, x)) * 10) / 10; return { pico: db(pk), rms: db(Math.sqrt(s2 / d.length)) };
  };

})(window.G);
