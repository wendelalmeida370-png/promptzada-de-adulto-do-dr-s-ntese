// Motor de áudio 100% sintetizado (WebAudio). Nenhum arquivo de som externo.
import { settings } from './settings.js';
import { rand, pick, clamp } from './util.js';

const VOWELS = [
  [800, 1200, 2500], [400, 2000, 2600], [300, 2300, 3000], [450, 800, 2500], [325, 700, 2400], [600, 1000, 2400],
];

function midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.ready = false;
    this.occlude = null; // (x,y,z) => 0..1
    this.loops = new Set();
    this.musicHandle = null;
    this.duck = 1;
  }

  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = (this.ctx = new AC());
    this.master = ctx.createGain();
    this.comp = ctx.createDynamicsCompressor();
    this.comp.threshold.value = -10;
    this.comp.knee.value = 8;
    this.comp.ratio.value = 6;
    this.comp.attack.value = 0.003;
    this.comp.release.value = 0.25;
    this.master.connect(this.comp).connect(ctx.destination);

    this.sfx = ctx.createGain();
    this.amb = ctx.createGain();
    this.mus = ctx.createGain();
    this.voice = ctx.createGain();
    this.duckGain = ctx.createGain();
    this.sfx.connect(this.master);
    this.voice.connect(this.master);
    this.amb.connect(this.duckGain);
    this.mus.connect(this.duckGain);
    this.duckGain.connect(this.master);

    // reverb
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this._impulse(2.4, 2.6);
    this.revGain = ctx.createGain();
    this.revGain.gain.value = 0.32;
    this.reverb.connect(this.revGain).connect(this.master);
    this.revSend = ctx.createGain();
    this.revSend.gain.value = 1;
    this.revSend.connect(this.reverb);

    this.noiseBuf = this._noise(3, 'white');
    this.pinkBuf = this._noise(3, 'pink');
    this.brownBuf = this._noise(4, 'brown');
    this.distCurve = this._distCurve(40);
    this.hardCurve = this._distCurve(400);
    this.ready = true;
    this.applyVolumes();
  }

  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); }
  get now() { return this.ctx ? this.ctx.currentTime : 0; }

  applyVolumes() {
    if (!this.ready) return;
    const t = this.now;
    this.master.gain.setTargetAtTime(settings.master, t, 0.05);
    this.sfx.gain.setTargetAtTime(settings.sfx, t, 0.05);
    this.amb.gain.setTargetAtTime(settings.sfx * 0.9, t, 0.05);
    this.mus.gain.setTargetAtTime(settings.music, t, 0.05);
    this.voice.gain.setTargetAtTime(settings.voices, t, 0.05);
  }

  setDuck(v, time = 0.4) {
    if (!this.ready) return;
    this.duckGain.gain.setTargetAtTime(v, this.now, time);
  }

  // ---------------------------------------------------------------- buffers
  _noise(sec, type) {
    const ctx = this.ctx;
    const len = Math.floor(ctx.sampleRate * sec);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (type === 'white') d[i] = w;
      else if (type === 'pink') {
        b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
        b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
      } else { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    }
    return buf;
  }
  _impulse(sec, decay) {
    const ctx = this.ctx;
    const len = Math.floor(ctx.sampleRate * sec);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }
  _distCurve(k) {
    const n = 2048, c = new Float32Array(n);
    for (let i = 0; i < n; i++) { const x = (i * 2) / n - 1; c[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x)); }
    return c;
  }

  // ---------------------------------------------------------------- roteamento
  // Cria o destino de um som: posicional (panner + oclusão) ou 2D.
  _dest(o = {}) {
    const ctx = this.ctx;
    const bus = o.bus === 'amb' ? this.amb : o.bus === 'voice' ? this.voice : o.bus === 'mus' ? this.mus : this.sfx;
    const g = ctx.createGain();
    g.gain.value = o.vol === undefined ? 1 : o.vol;
    let head = g;
    if (o.pos) {
      const p = ctx.createPanner();
      p.panningModel = 'HRTF';
      p.distanceModel = 'inverse';
      p.refDistance = o.ref || 1.2;
      p.rolloffFactor = o.rolloff || 1.3;
      p.maxDistance = 60;
      this._setPannerPos(p, o.pos);
      const occ = this.occlude ? this.occlude(o.pos) : 0;
      if (occ > 0) {
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 5000 - 4200 * occ;
        g.connect(lp);
        const og = ctx.createGain();
        og.gain.value = 1 - 0.45 * occ;
        lp.connect(og);
        og.connect(p);
      } else g.connect(p);
      p.connect(bus);
      const send = ctx.createGain();
      send.gain.value = o.rev === undefined ? 0.35 : o.rev;
      p.connect(send).connect(this.revSend);
      head.panner = p;
    } else {
      if (o.pan) {
        const sp = ctx.createStereoPanner();
        sp.pan.value = o.pan;
        g.connect(sp).connect(bus);
      } else g.connect(bus);
      if (o.rev) {
        const send = ctx.createGain();
        send.gain.value = o.rev;
        g.connect(send).connect(this.revSend);
      }
    }
    return head;
  }
  _setPannerPos(p, pos) {
    const t = this.now;
    const x = pos.x !== undefined ? pos.x : pos[0];
    const y = pos.y !== undefined ? pos.y : pos[1];
    const z = pos.z !== undefined ? pos.z : pos[2];
    if (p.positionX) { p.positionX.setValueAtTime(x, t); p.positionY.setValueAtTime(y, t); p.positionZ.setValueAtTime(z, t); }
    else p.setPosition(x, y, z);
  }

  updateListener(cam) {
    if (!this.ready) return;
    const L = this.ctx.listener;
    const e = cam.matrixWorld.elements;
    const px = e[12], py = e[13], pz = e[14];
    const fx = -e[8], fy = -e[9], fz = -e[10];
    const ux = e[4], uy = e[5], uz = e[6];
    const t = this.now;
    if (L.positionX) {
      L.positionX.setValueAtTime(px, t); L.positionY.setValueAtTime(py, t); L.positionZ.setValueAtTime(pz, t);
      L.forwardX.setValueAtTime(fx, t); L.forwardY.setValueAtTime(fy, t); L.forwardZ.setValueAtTime(fz, t);
      L.upX.setValueAtTime(ux, t); L.upY.setValueAtTime(uy, t); L.upZ.setValueAtTime(uz, t);
    } else { L.setPosition(px, py, pz); L.setOrientation(fx, fy, fz, ux, uy, uz); }
  }

  _env(g, t, a, peak, d, sustain = 0) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, sustain), t + a + d);
  }
  _src(buf, loop = false, rate = 1) {
    const s = this.ctx.createBufferSource();
    s.buffer = buf; s.loop = loop; s.playbackRate.value = rate;
    if (loop) s.loopStart = Math.random() * 1.5;
    return s;
  }
  _filter(type, f, q = 1) {
    const b = this.ctx.createBiquadFilter();
    b.type = type; b.frequency.value = f; b.Q.value = q;
    return b;
  }
  _osc(type, f) { const o = this.ctx.createOscillator(); o.type = type; o.frequency.value = f; return o; }
  _noiseBurst(dest, t, dur, { type = 'bandpass', f = 1000, q = 1, peak = 0.5, a = 0.002, buf } = {}) {
    const s = this._src(buf || this.noiseBuf);
    const fl = this._filter(type, f, q);
    const g = this.ctx.createGain();
    this._env(g, t, a, peak, dur);
    s.connect(fl).connect(g).connect(dest);
    s.start(t, Math.random() * 2);
    s.stop(t + a + dur + 0.05);
    return { s, fl, g };
  }
  _tone(dest, t, type, f, dur, peak, a = 0.005) {
    const o = this._osc(type, f);
    const g = this.ctx.createGain();
    this._env(g, t, a, peak, dur);
    o.connect(g).connect(dest);
    o.start(t);
    o.stop(t + a + dur + 0.05);
    return { o, g };
  }

  // ---------------------------------------------------------------- one-shots
  play(name, o = {}) {
    if (!this.ready) return null;
    const fn = this['_' + name];
    if (!fn) { console.warn('som desconhecido', name); return null; }
    const t = this.now + (o.delay || 0);
    const dest = this._dest(o);
    try { return fn.call(this, dest, t, o) || null; } catch (e) { console.warn(e); return null; }
  }

  _step(d, t, o) {
    const s = o.surface || 'wood';
    const v = (o.soft ? 0.35 : 1) * rand(0.8, 1.1);
    if (s === 'tile') {
      this._noiseBurst(d, t, 0.05, { f: rand(2200, 3200), q: 1.5, peak: 0.35 * v });
      this._tone(d, t, 'sine', rand(120, 150), 0.05, 0.25 * v);
    } else if (s === 'stairs') {
      this._noiseBurst(d, t, 0.09, { type: 'lowpass', f: 500, peak: 0.6 * v });
      this._tone(d, t, 'sine', rand(70, 90), 0.1, 0.5 * v);
      this._noiseBurst(d, t + 0.03, 0.18, { f: rand(700, 1100), q: 12, peak: 0.08 * v });
    } else {
      this._noiseBurst(d, t, 0.07, { type: 'lowpass', f: rand(500, 800), peak: 0.5 * v });
      this._tone(d, t, 'sine', rand(80, 100), 0.07, 0.35 * v);
      if (Math.random() < 0.12) this._noiseBurst(d, t + 0.05, 0.25, { f: rand(900, 1400), q: 18, peak: 0.05 });
    }
  }

  _creak(d, t, o) {
    const dur = o.dur || rand(0.7, 1.2);
    const osc = this._osc('sawtooth', 40);
    const f = osc.frequency;
    f.setValueAtTime(rand(25, 40), t);
    const steps = 8;
    for (let i = 1; i <= steps; i++) f.linearRampToValueAtTime(rand(30, 110), t + (dur * i) / steps);
    const b1 = this._filter('bandpass', rand(700, 1000), 9);
    const b2 = this._filter('bandpass', rand(1600, 2200), 12);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime((o.v || 1) * 0.5, t + 0.08);
    g.gain.linearRampToValueAtTime((o.v || 1) * 0.35, t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(b1).connect(g);
    osc.connect(b2).connect(g);
    g.connect(d);
    osc.start(t); osc.stop(t + dur + 0.1);
  }
  _door_open(d, t, o) {
    this._noiseBurst(d, t, 0.04, { f: 3000, q: 3, peak: 0.4 });
    this._tone(d, t, 'square', 1200, 0.02, 0.05);
    if (o.creak !== false && Math.random() < (o.creakChance || 0.75)) this._creak(d, t + 0.05, { dur: rand(0.6, 1.1), v: o.creakV || 0.9 });
  }
  _door_close(d, t) {
    this._noiseBurst(d, t, 0.12, { type: 'lowpass', f: 400, peak: 0.9 });
    this._tone(d, t, 'sine', 70, 0.15, 0.7);
    this._noiseBurst(d, t + 0.02, 0.04, { f: 2500, q: 3, peak: 0.35 });
  }
  _door_slam(d, t) {
    this._noiseBurst(d, t, 0.35, { type: 'lowpass', f: 700, peak: 1.4 });
    this._tone(d, t, 'sine', 55, 0.4, 1.2);
    this._noiseBurst(d, t + 0.03, 0.2, { f: 1800, q: 2, peak: 0.5 });
    for (let i = 0; i < 4; i++) this._noiseBurst(d, t + 0.1 + i * 0.05, 0.03, { f: 3000, q: 4, peak: 0.12 });
  }
  _locked(d, t) {
    for (let i = 0; i < 3; i++) {
      this._noiseBurst(d, t + i * 0.09, 0.05, { f: 2400, q: 5, peak: 0.45 });
      this._tone(d, t + i * 0.09, 'square', 900 + i * 40, 0.02, 0.05);
    }
  }
  _knock(d, t, o) {
    const n = o.n || 3;
    for (let i = 0; i < n; i++) {
      const tt = t + i * (o.gap || 0.32) + rand(0, 0.03);
      this._noiseBurst(d, tt, 0.09, { type: 'lowpass', f: 600, peak: 1.0 * (o.v || 1) });
      this._tone(d, tt, 'sine', 110, 0.1, 0.8 * (o.v || 1));
    }
  }
  _drawer(d, t, o) {
    const dur = 0.35;
    const n = this._src(this.noiseBuf);
    const bp = this._filter('bandpass', 700, 2);
    bp.frequency.setValueAtTime(o.close ? 1400 : 600, t);
    bp.frequency.linearRampToValueAtTime(o.close ? 600 : 1400, t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.35, t + 0.04);
    g.gain.linearRampToValueAtTime(0.2, t + dur);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.05);
    n.connect(bp).connect(g).connect(d);
    n.start(t, rand(0, 2)); n.stop(t + dur + 0.1);
    if (o.close) this._noiseBurst(d, t + dur, 0.06, { type: 'lowpass', f: 500, peak: 0.6 });
  }
  _switch(d, t) {
    this._noiseBurst(d, t, 0.015, { type: 'highpass', f: 2000, peak: 0.5 });
    this._tone(d, t, 'square', 2600, 0.01, 0.08);
  }
  _breaker(d, t) {
    this._noiseBurst(d, t, 0.08, { type: 'lowpass', f: 1200, peak: 1.0 });
    this._tone(d, t, 'sine', 90, 0.12, 0.8);
    this._noiseBurst(d, t + 0.01, 0.02, { f: 4000, q: 2, peak: 0.6 });
  }
  _power_up(d, t) {
    // lâmpadas voltando + geladeira religando
    for (let i = 0; i < 5; i++) this._noiseBurst(d, t + i * rand(0.05, 0.14), 0.03, { f: rand(3000, 6000), q: 3, peak: 0.25 });
    const o = this._osc('sawtooth', 50);
    const g = this.ctx.createGain();
    const lp = this._filter('lowpass', 300, 1);
    this._env(g, t + 0.3, 0.2, 0.25, 1.4);
    o.frequency.setValueAtTime(30, t + 0.3);
    o.frequency.linearRampToValueAtTime(60, t + 1.2);
    o.connect(lp).connect(g).connect(d);
    o.start(t + 0.3); o.stop(t + 2);
  }
  _power_down(d, t) {
    const o = this._osc('sawtooth', 60);
    const g = this.ctx.createGain();
    const lp = this._filter('lowpass', 500, 1);
    this._env(g, t, 0.01, 0.5, 1.2);
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(20, t + 1.2);
    o.connect(lp).connect(g).connect(d);
    o.start(t); o.stop(t + 1.4);
    this._noiseBurst(d, t, 0.1, { type: 'lowpass', f: 900, peak: 0.8 });
  }
  _pickup(d, t) {
    this._noiseBurst(d, t, 0.12, { f: 1800, q: 0.8, peak: 0.25 });
    this._tone(d, t + 0.02, 'sine', 660, 0.12, 0.06);
  }
  _page(d, t) {
    const n = this._src(this.noiseBuf);
    const bp = this._filter('bandpass', 3000, 0.7);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    for (let i = 0; i < 6; i++) g.gain.linearRampToValueAtTime(rand(0.05, 0.25), t + i * 0.05);
    g.gain.linearRampToValueAtTime(0, t + 0.35);
    n.connect(bp).connect(g).connect(d); n.start(t, rand(0, 2)); n.stop(t + 0.4);
  }
  _ui(d, t) { this._tone(d, t, 'sine', 880, 0.05, 0.04); }
  _ui_back(d, t) { this._tone(d, t, 'sine', 520, 0.06, 0.04); }
  _phone_vibrate(d, t, o) {
    const n = o.n || 2;
    for (let k = 0; k < n; k++) {
      const tt = t + k * 0.45;
      const osc = this._osc('square', 150);
      const lp = this._filter('lowpass', 260, 2);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0, tt);
      g.gain.linearRampToValueAtTime(0.35, tt + 0.02);
      g.gain.setValueAtTime(0.35, tt + 0.28);
      g.gain.linearRampToValueAtTime(0, tt + 0.3);
      osc.connect(lp).connect(g).connect(d); osc.start(tt); osc.stop(tt + 0.32);
    }
  }
  _phone_notify(d, t) {
    this._tone(d, t, 'sine', 1318, 0.12, 0.12);
    this._tone(d, t + 0.1, 'sine', 1760, 0.18, 0.1);
  }
  _phone_glitch(d, t) {
    for (let i = 0; i < 8; i++) this._tone(d, t + i * 0.035, 'square', rand(300, 2400), 0.03, 0.06);
    this._noiseBurst(d, t, 0.3, { f: 2500, q: 0.5, peak: 0.15 });
  }
  _shutter(d, t) {
    this._noiseBurst(d, t, 0.03, { type: 'highpass', f: 3000, peak: 0.5 });
    this._noiseBurst(d, t + 0.07, 0.04, { type: 'highpass', f: 2500, peak: 0.4 });
  }
  _record_beep(d, t) { this._tone(d, t, 'sine', 1000, 0.15, 0.1); }
  _intercom(d, t, o) {
    const dur = o.dur || 1.4;
    const a = this._osc('square', 460);
    const b = this._osc('square', 473);
    const am = this._osc('square', 32);
    const amg = this.ctx.createGain(); amg.gain.value = 0.5;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.28, t + 0.01);
    g.gain.setValueAtTime(0.28, t + dur);
    g.gain.linearRampToValueAtTime(0, t + dur + 0.02);
    const mod = this.ctx.createGain(); mod.gain.value = 0.5;
    am.connect(amg).connect(mod.gain);
    const bp = this._filter('bandpass', 1400, 0.8);
    a.connect(mod); b.connect(mod); mod.connect(bp).connect(g).connect(d);
    [a, b, am].forEach((x) => { x.start(t); x.stop(t + dur + 0.05); });
  }
  _intercom_static(d, t, o) { this._noiseBurst(d, t, o.dur || 1.2, { f: 1800, q: 0.6, peak: 0.25, a: 0.05 }); }
  _meow(d, t, o) {
    const dur = o.dur || rand(0.55, 0.8);
    const base = o.pitch || rand(480, 620);
    const osc = this._osc('sawtooth', base);
    osc.frequency.setValueAtTime(base * 0.8, t);
    osc.frequency.linearRampToValueAtTime(base * 1.45, t + dur * 0.35);
    osc.frequency.linearRampToValueAtTime(base * 0.9, t + dur);
    const vib = this._osc('sine', 7); const vg = this.ctx.createGain(); vg.gain.value = 12; vib.connect(vg).connect(osc.frequency);
    const f1 = this._filter('bandpass', 800, 4);
    f1.frequency.setValueAtTime(700, t);
    f1.frequency.linearRampToValueAtTime(1900, t + dur * 0.4);
    f1.frequency.linearRampToValueAtTime(900, t + dur);
    const f2 = this._filter('bandpass', 2600, 6);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.35 * (o.v || 1), t + 0.06);
    g.gain.linearRampToValueAtTime(0.25 * (o.v || 1), t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(f1).connect(g); osc.connect(f2).connect(g); g.connect(d);
    osc.start(t); osc.stop(t + dur + 0.05); vib.start(t); vib.stop(t + dur + 0.05);
  }
  _hiss(d, t) {
    const n = this._noiseBurst(d, t, 1.0, { type: 'highpass', f: 2500, peak: 0.45, a: 0.05 });
    n.g.gain.setValueAtTime(0.45, t + 0.3);
    n.g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
  }
  _honk(d, t, o) {
    const one = (tt, f) => {
      const a = this._osc('sawtooth', f);
      a.frequency.setValueAtTime(f * 1.05, tt);
      a.frequency.linearRampToValueAtTime(f * 0.93, tt + 0.22);
      const ws = this.ctx.createWaveShaper(); ws.curve = this.distCurve;
      const b1 = this._filter('bandpass', 950, 3);
      const b2 = this._filter('bandpass', 2100, 5);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, tt);
      g.gain.linearRampToValueAtTime(0.5 * (o.v || 1), tt + 0.02);
      g.gain.setValueAtTime(0.45 * (o.v || 1), tt + 0.18);
      g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.3);
      a.connect(ws); ws.connect(b1).connect(g); ws.connect(b2).connect(g); g.connect(d);
      a.start(tt); a.stop(tt + 0.35);
      this._noiseBurst(d, tt, 0.05, { f: 3500, q: 6, peak: 0.12 });
    };
    const f = o.pitch || 300;
    one(t, f);
    if (o.single !== true) one(t + 0.36, f * 0.94);
  }
  _clock(d, t, o) { this._noiseBurst(d, t, 0.012, { f: o.tock ? 1800 : 2600, q: 8, peak: 0.5 }); }
  _heartbeat(d, t, o) {
    const v = o.v || 1;
    const beat = (tt, p) => {
      const osc = this._osc('sine', 62);
      osc.frequency.setValueAtTime(70, tt); osc.frequency.exponentialRampToValueAtTime(38, tt + 0.12);
      const g = this.ctx.createGain(); this._env(g, tt, 0.008, p * v, 0.16);
      osc.connect(g).connect(d); osc.start(tt); osc.stop(tt + 0.2);
    };
    beat(t, 0.9); beat(t + 0.24, 0.6);
  }
  _breath(d, t, o) {
    const out = o.out;
    const dur = o.dur || (out ? 1.3 : 1.0);
    const n = this._src(this.pinkBuf);
    const bp = this._filter('bandpass', out ? 900 : 1300, 0.6);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime((o.v || 1) * 0.3, t + dur * 0.35);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    n.connect(bp).connect(g).connect(d); n.start(t, rand(0, 2)); n.stop(t + dur + 0.05);
  }
  _gasp(d, t) {
    const n = this._src(this.pinkBuf);
    const bp = this._filter('bandpass', 1500, 0.8);
    const g = this.ctx.createGain(); this._env(g, t, 0.02, 0.6, 0.45);
    n.connect(bp).connect(g).connect(d); n.start(t, rand(0, 2)); n.stop(t + 0.5);
  }
  _whisper(d, t, o) {
    const syl = o.syl || Math.floor(rand(5, 11));
    const n = this._src(this.pinkBuf);
    const g = this.ctx.createGain();
    const fs = [this._filter('bandpass', 800, 8), this._filter('bandpass', 1500, 10), this._filter('bandpass', 2500, 12)];
    const hp = this._filter('highpass', 4000, 0.7); const hg = this.ctx.createGain(); hg.gain.value = 0;
    fs.forEach((f) => n.connect(f).connect(g));
    n.connect(hp).connect(hg).connect(d);
    g.connect(d);
    g.gain.setValueAtTime(0, t);
    let tt = t;
    for (let i = 0; i < syl; i++) {
      const v = pick(VOWELS);
      const len = rand(0.12, 0.24);
      fs.forEach((f, k) => f.frequency.setValueAtTime(v[k] * rand(0.9, 1.1), tt));
      if (Math.random() < 0.4) { hg.gain.setValueAtTime(0.25 * (o.v || 1), tt); hg.gain.linearRampToValueAtTime(0, tt + 0.07); }
      g.gain.linearRampToValueAtTime((o.v || 1) * rand(1.2, 2.4), tt + len * 0.3);
      g.gain.linearRampToValueAtTime(0.02, tt + len);
      tt += len + rand(0, 0.06);
    }
    g.gain.linearRampToValueAtTime(0, tt + 0.05);
    n.start(t, rand(0, 2)); n.stop(tt + 0.1);
    return { dur: tt - t };
  }
  _entity_step(d, t, o) {
    this._tone(d, t, 'sine', rand(40, 50), 0.25, 0.9 * (o.v || 1));
    this._noiseBurst(d, t, 0.15, { type: 'lowpass', f: 250, peak: 0.9 * (o.v || 1) });
    if (Math.random() < 0.5) this._noiseBurst(d, t + rand(0.02, 0.1), 0.03, { f: rand(2500, 4500), q: 3, peak: 0.35 * (o.v || 1) });
  }
  _crack(d, t) {
    for (let i = 0; i < 4; i++) this._noiseBurst(d, t + i * rand(0.02, 0.06), 0.025, { f: rand(1500, 5000), q: 2, peak: 0.5 });
  }
  _growl(d, t, o) {
    const dur = o.dur || 1.6;
    const a = this._osc('sawtooth', 52), b = this._osc('sawtooth', 55.5);
    const lp = this._filter('lowpass', 380, 3);
    lp.frequency.setValueAtTime(200, t); lp.frequency.linearRampToValueAtTime(700, t + dur * 0.5); lp.frequency.linearRampToValueAtTime(180, t + dur);
    const ws = this.ctx.createWaveShaper(); ws.curve = this.distCurve;
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.6 * (o.v || 1), t + 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    a.connect(ws); b.connect(ws); ws.connect(lp).connect(g).connect(d);
    a.start(t); b.start(t); a.stop(t + dur + 0.1); b.stop(t + dur + 0.1);
    this._noiseBurst(d, t, dur * 0.9, { f: 200, q: 2, peak: 0.5 * (o.v || 1), a: 0.3 });
  }
  _scream(d, t, o) {
    const dur = o.dur || 1.8;
    const v = o.v || 1;
    const ws = this.ctx.createWaveShaper(); ws.curve = this.hardCurve;
    const bp = this._filter('bandpass', 1900, 0.9);
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.55 * v, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    ws.connect(bp).connect(g).connect(d);
    const lfo = this._osc('sine', 13); const lg = this.ctx.createGain(); lg.gain.value = 70; lfo.connect(lg);
    [1850, 1930, 2470, 3120, 740].forEach((f) => {
      const o2 = this._osc('sawtooth', f);
      o2.frequency.setValueAtTime(f * 1.1, t); o2.frequency.exponentialRampToValueAtTime(f * 0.7, t + dur);
      lg.connect(o2.frequency);
      o2.connect(ws); o2.start(t); o2.stop(t + dur + 0.05);
    });
    lfo.start(t); lfo.stop(t + dur + 0.05);
    this._noiseBurst(d, t, dur * 0.7, { type: 'highpass', f: 900, peak: 0.45 * v });
  }
  _stinger(d, t, o) {
    // jump scare principal: subgrave + guincho + ruído + metais
    const v = o.v || 1;
    const sub = this._osc('sine', 60);
    sub.frequency.setValueAtTime(75, t); sub.frequency.exponentialRampToValueAtTime(28, t + 1.4);
    const sg = this.ctx.createGain(); this._env(sg, t, 0.004, 1.4 * v, 1.6);
    sub.connect(sg).connect(d); sub.start(t); sub.stop(t + 1.8);
    this._scream(d, t, { dur: 1.6, v: 1.1 * v });
    this._noiseBurst(d, t, 0.9, { type: 'highpass', f: 600, peak: 0.9 * v });
    [523, 587, 622, 740, 1244].forEach((f) => this._tone(d, t, 'triangle', f * rand(0.98, 1.02), 2.2, 0.12 * v));
    for (let i = 0; i < 6; i++) this._noiseBurst(d, t + 0.05 + i * 0.06, 0.05, { f: rand(2000, 6000), q: 3, peak: 0.3 * v });
  }
  _stinger_small(d, t, o) {
    const v = o.v || 1;
    [620, 660, 698].forEach((f) => {
      const a = this._osc('sawtooth', f);
      const bp = this._filter('bandpass', f * 1.5, 2);
      const g = this.ctx.createGain(); this._env(g, t, 0.01, 0.22 * v, 0.9);
      a.connect(bp).connect(g).connect(d); a.start(t); a.stop(t + 1);
    });
    this._tone(d, t, 'sine', 50, 0.6, 0.8 * v);
  }
  _swell(d, t, o) {
    // "respiração invertida" que cresce e corta seco
    const dur = o.dur || 1.6;
    const n = this._src(this.noiseBuf);
    const bp = this._filter('bandpass', 400, 0.8);
    bp.frequency.setValueAtTime(200, t); bp.frequency.exponentialRampToValueAtTime(3500, t + dur);
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.7 * (o.v || 1), t + dur); g.gain.setValueAtTime(0.0001, t + dur + 0.01);
    n.connect(bp).connect(g).connect(d); n.start(t, rand(0, 1)); n.stop(t + dur + 0.05);
    const o2 = this._osc('sawtooth', 55); o2.frequency.exponentialRampToValueAtTime(110, t + dur);
    const g2 = this.ctx.createGain(); g2.gain.setValueAtTime(0.0001, t); g2.gain.exponentialRampToValueAtTime(0.25 * (o.v || 1), t + dur); g2.gain.setValueAtTime(0.0001, t + dur + 0.01);
    const lp = this._filter('lowpass', 600, 1);
    o2.connect(lp).connect(g2).connect(d); o2.start(t); o2.stop(t + dur + 0.05);
  }
  _wrong(d, t, o) {
    // a casa mudou: acorde de fita desacelerando
    const v = o.v || 1;
    [220, 261.6, 311.1, 415.3].forEach((f) => {
      const a = this._osc('triangle', f);
      a.frequency.setValueAtTime(f, t); a.frequency.linearRampToValueAtTime(f * 0.82, t + 2.2);
      const g = this.ctx.createGain(); this._env(g, t, 0.3, 0.09 * v, 2.2);
      const lp = this._filter('lowpass', 1400, 1);
      a.connect(lp).connect(g).connect(d); a.start(t); a.stop(t + 2.6);
    });
    this._noiseBurst(d, t, 2.0, { f: 3000, q: 0.5, peak: 0.03 * v, a: 0.4 });
  }
  _boom(d, t, o) {
    const s = this._osc('sine', 50);
    s.frequency.setValueAtTime(60, t); s.frequency.exponentialRampToValueAtTime(25, t + 2.5);
    const g = this.ctx.createGain(); this._env(g, t, 0.01, 1.2 * (o.v || 1), 3);
    s.connect(g).connect(d); s.start(t); s.stop(t + 3.1);
    this._noiseBurst(d, t, 1.5, { type: 'lowpass', f: 200, peak: 0.8 * (o.v || 1) });
  }
  _chime(d, t, o) {
    const notes = o.notes || [57, 64, 69, 73, 76];
    notes.forEach((n, i) => this._bell(d, t + i * 0.12, midi(n), 3.5, 0.08 * (o.v || 1)));
  }
  _bell(d, t, f, dur, peak) {
    [[1, 1], [2.01, 0.35], [3.02, 0.15], [4.2, 0.07]].forEach(([m, a]) => this._tone(d, t, 'sine', f * m, dur / m, peak * a, 0.004));
  }
  _tv_on(d, t) {
    this._noiseBurst(d, t, 0.5, { f: 4000, q: 0.4, peak: 0.6 });
    this._tone(d, t, 'sine', 7800, 0.8, 0.02);
    this._noiseBurst(d, t, 0.03, { type: 'lowpass', f: 300, peak: 0.6 });
  }
  _tv_off(d, t) {
    const o = this._osc('sine', 4000);
    o.frequency.exponentialRampToValueAtTime(200, t + 0.25);
    const g = this.ctx.createGain(); this._env(g, t, 0.005, 0.12, 0.3);
    o.connect(g).connect(d); o.start(t); o.stop(t + 0.35);
    this._noiseBurst(d, t, 0.03, { type: 'lowpass', f: 400, peak: 0.5 });
  }
  _stove(d, t) { for (let i = 0; i < 4; i++) this._noiseBurst(d, t + i * 0.18, 0.012, { f: 3500, q: 3, peak: 0.6 }); this._noiseBurst(d, t + 0.75, 0.8, { f: 700, q: 0.6, peak: 0.12, a: 0.1 }); }
  _fridge_open(d, t) { this._noiseBurst(d, t, 0.08, { type: 'lowpass', f: 700, peak: 0.6 }); this._noiseBurst(d, t, 0.4, { f: 2500, q: 0.6, peak: 0.08, a: 0.05 }); }
  _microwave(d, t, o) {
    const dur = o.dur || 3;
    const a = this._osc('sawtooth', 120);
    const lp = this._filter('lowpass', 500, 1);
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.12, t + 0.1); g.gain.setValueAtTime(0.12, t + dur); g.gain.linearRampToValueAtTime(0, t + dur + 0.05);
    a.connect(lp).connect(g).connect(d); a.start(t); a.stop(t + dur + 0.1);
    for (let i = 0; i < 3; i++) this._tone(d, t + dur + 0.2 + i * 0.35, 'sine', 2100, 0.2, 0.15);
  }
  _ice(d, t) { for (let i = 0; i < 6; i++) this._noiseBurst(d, t + i * rand(0.02, 0.07), 0.04, { f: rand(3000, 7000), q: 4, peak: 0.25 }); }
  _unlock(d, t) {
    this._noiseBurst(d, t, 0.05, { f: 2800, q: 4, peak: 0.5 });
    this._noiseBurst(d, t + 0.15, 0.08, { f: 1800, q: 3, peak: 0.6 });
    this._tone(d, t + 0.15, 'square', 700, 0.03, 0.08);
  }
  _glass(d, t) { for (let i = 0; i < 10; i++) this._tone(d, t + i * rand(0.005, 0.03), 'sine', rand(2500, 7000), rand(0.2, 0.6), 0.08); this._noiseBurst(d, t, 0.3, { type: 'highpass', f: 3000, peak: 0.5 }); }
  _thud(d, t, o) { this._noiseBurst(d, t, 0.2, { type: 'lowpass', f: 300, peak: 1.0 * (o.v || 1) }); this._tone(d, t, 'sine', 60, 0.25, 0.9 * (o.v || 1)); }
  _water_drip(d, t) { const a = this._osc('sine', 1400); a.frequency.exponentialRampToValueAtTime(700, t + 0.08); const g = this.ctx.createGain(); this._env(g, t, 0.002, 0.12, 0.1); a.connect(g).connect(d); a.start(t); a.stop(t + 0.15); }
  _car(d, t) {
    const dur = rand(4, 7);
    const n = this._src(this.brownBuf);
    const bp = this._filter('bandpass', 300, 0.5);
    bp.frequency.setValueAtTime(200, t); bp.frequency.linearRampToValueAtTime(700, t + dur / 2); bp.frequency.linearRampToValueAtTime(250, t + dur);
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.15, t + dur / 2); g.gain.linearRampToValueAtTime(0, t + dur);
    n.connect(bp).connect(g).connect(d); n.start(t, rand(0, 2)); n.stop(t + dur);
  }
  _musicbox_note(d, t, o) { this._bell(d, t, o.f, o.dur || 1.8, o.v || 0.12); }

  // melodia original da caixinha de música (lá menor, 3/4, levemente "gasta")
  musicBox(pos, vol = 1, speed = 1) {
    if (!this.ready) return 0;
    const mel = [
      [69, 1], [72, 1], [76, 1], [74, 2], [72, 1], [71, 3],
      [69, 1], [64, 1], [69, 1], [68, 2], [71, 1], [76, 3],
      [77, 1], [76, 1], [74, 1], [72, 2], [71, 1], [69, 1], [72, 1], [71, 1], [69, 3],
      [64, 1], [69, 1], [72, 1], [71, 2], [68, 1], [69, 4],
    ];
    const beat = 0.34 / speed;
    let t = this.now + 0.05;
    const d = this._dest({ pos, vol, rev: 0.5 });
    for (const [n, len] of mel) {
      const f = midi(n) * Math.pow(2, rand(-10, 10) / 1200);
      this._bell(d, t + rand(0, 0.02), f, 2.2, 0.14);
      if (len >= 3) this._bell(d, t, midi(n - 24), 2.5, 0.05);
      t += beat * len * rand(0.97, 1.05);
    }
    return t - this.now;
  }

  // ---------------------------------------------------------------- loops
  loop(name, o = {}) {
    if (!this.ready) return null;
    const dest = this._dest({ ...o, vol: 0 });
    const fn = this['_loop_' + name];
    if (!fn) { console.warn('loop desconhecido', name); return null; }
    const nodes = [];
    const extra = fn.call(this, dest, nodes, o) || {};
    const target = o.vol === undefined ? 1 : o.vol;
    dest.gain.setTargetAtTime(target, this.now, o.fade || 0.5);
    const self = this;
    const handle = {
      name, dest, nodes, extra, vol: target, stopped: false,
      setVol(v, time = 0.3) { if (this.stopped) return; this.vol = v; dest.gain.setTargetAtTime(Math.max(0, v), self.now, time); },
      setPos(p) { if (dest.panner) self._setPannerPos(dest.panner, p); },
      set(param, v) { if (extra[param]) extra[param](v); },
      stop(fade = 0.4) {
        if (this.stopped) return; this.stopped = true;
        dest.gain.setTargetAtTime(0, self.now, fade / 3);
        setTimeout(() => { nodes.forEach((n) => { try { n.stop(); } catch (e) { /* já parado */ } }); try { dest.disconnect(); } catch (e) { /* ok */ } }, fade * 1000 + 200);
        self.loops.delete(this);
      },
    };
    this.loops.add(handle);
    return handle;
  }
  stopAllLoops(fade = 0.5) { for (const l of [...this.loops]) l.stop(fade); }

  _loop_roomtone(d, nodes) {
    const n = this._src(this.brownBuf, true);
    const lp = this._filter('lowpass', 180, 0.7);
    const g = this.ctx.createGain(); g.gain.value = 0.35;
    n.connect(lp).connect(g).connect(d); n.start(); nodes.push(n);
  }
  _loop_city(d, nodes) {
    const n = this._src(this.brownBuf, true);
    const bp = this._filter('bandpass', 350, 0.4);
    const g = this.ctx.createGain(); g.gain.value = 0.35;
    const lfo = this._osc('sine', 0.05); const lg = this.ctx.createGain(); lg.gain.value = 0.15; lfo.connect(lg).connect(g.gain);
    n.connect(bp).connect(g).connect(d); n.start(); lfo.start(); nodes.push(n, lfo);
    const n2 = this._src(this.noiseBuf, true);
    const hp = this._filter('bandpass', 5000, 0.5); const g2 = this.ctx.createGain(); g2.gain.value = 0.015;
    n2.connect(hp).connect(g2).connect(d); n2.start(); nodes.push(n2);
  }
  _loop_fridge(d, nodes) {
    const a = this._osc('sine', 100), b = this._osc('sine', 50.4), c = this._osc('triangle', 150.5);
    const g = this.ctx.createGain(); g.gain.value = 0.08;
    const gb = this.ctx.createGain(); gb.gain.value = 0.5;
    a.connect(g); b.connect(gb).connect(g); c.connect(gb);
    g.connect(d);
    const n = this._src(this.pinkBuf, true); const lp = this._filter('lowpass', 400, 1); const ng = this.ctx.createGain(); ng.gain.value = 0.05;
    n.connect(lp).connect(ng).connect(d);
    [a, b, c, n].forEach((x) => { x.start(); nodes.push(x); });
  }
  _loop_fan(d, nodes, o) {
    const n = this._src(this.pinkBuf, true);
    const bp = this._filter('bandpass', 380, 0.6);
    const g = this.ctx.createGain(); g.gain.value = 0.3;
    const lfo = this._osc('sine', o.rate || 3.2); const lg = this.ctx.createGain(); lg.gain.value = 0.18;
    lfo.connect(lg).connect(g.gain);
    n.connect(bp).connect(g).connect(d); n.start(); lfo.start(); nodes.push(n, lfo);
    const cr = this._osc('sine', o.rate || 3.2); const cg = this.ctx.createGain(); cg.gain.value = 0;
    nodes.push(cr);
    return { rate: (v) => { lfo.frequency.setTargetAtTime(v, this.now, 1); } };
  }
  _loop_static(d, nodes, o) {
    const n = this._src(this.noiseBuf, true);
    const hp = this._filter('highpass', o.hp || 900, 0.7);
    const pk = this._filter('peaking', 4000, 1); pk.gain.value = 6;
    const g = this.ctx.createGain(); g.gain.value = 0.28;
    n.connect(hp).connect(pk).connect(g).connect(d); n.start(); nodes.push(n);
    const hum = this._osc('sawtooth', 60); const hl = this._filter('lowpass', 200, 1); const hg = this.ctx.createGain(); hg.gain.value = 0.04;
    hum.connect(hl).connect(hg).connect(d); hum.start(); nodes.push(hum);
  }
  _loop_radio(d, nodes) {
    const n = this._src(this.noiseBuf, true);
    const bp = this._filter('bandpass', 1800, 0.5);
    const g = this.ctx.createGain(); g.gain.value = 0.0;
    n.connect(bp).connect(g).connect(d); n.start(); nodes.push(n);
    const crack = this._src(this.noiseBuf, true, 0.5);
    const cf = this._filter('highpass', 2500, 1); const cg = this.ctx.createGain(); cg.gain.value = 0;
    const lfo = this._osc('square', 9); const lg = this.ctx.createGain(); lg.gain.value = 0;
    lfo.connect(lg).connect(cg.gain);
    crack.connect(cf).connect(cg).connect(d); crack.start(); lfo.start(); nodes.push(crack, lfo);
    const tone = this._osc('sine', 1200); const tg = this.ctx.createGain(); tg.gain.value = 0; tone.connect(tg).connect(d); tone.start(); nodes.push(tone);
    return {
      level: (v) => {
        const t = this.now;
        g.gain.setTargetAtTime(0.04 + 0.4 * v, t, 0.1);
        lg.gain.setTargetAtTime(0.35 * v * v, t, 0.1);
        lfo.frequency.setTargetAtTime(6 + 20 * v, t, 0.2);
        bp.frequency.setTargetAtTime(1600 + 1400 * v, t, 0.2);
        tg.gain.setTargetAtTime(v > 0.85 ? 0.04 : 0, t, 0.05);
        tone.frequency.setTargetAtTime(900 + rand(0, 800), t, 0.02);
      },
    };
  }
  _loop_drone(d, nodes, o) {
    const base = o.base || 55;
    const g = this.ctx.createGain(); g.gain.value = 0.25;
    const lp = this._filter('lowpass', o.cut || 260, 1);
    const lfo = this._osc('sine', 0.07); const lg = this.ctx.createGain(); lg.gain.value = 120; lfo.connect(lg).connect(lp.frequency);
    const oscs = [
      this._osc('sine', base), this._osc('sine', base * 1.012), this._osc('sawtooth', base * 2.003),
    ];
    if (o.dark) oscs.push(this._osc('triangle', base * 1.414), this._osc('sawtooth', base * 0.5));
    oscs.forEach((x) => { x.connect(lp); x.start(); nodes.push(x); });
    lp.connect(g).connect(d); lfo.start(); nodes.push(lfo);
    return { cut: (v) => lp.frequency.setTargetAtTime(v, this.now, 1) };
  }
  _loop_heart(d, nodes, o) {
    // batimento contínuo com ritmo ajustável
    let rate = o.rate || 1.1;
    let alive = true;
    const tick = () => {
      if (!alive) return;
      this._heartbeat(d, this.now + 0.02, { v: 0.9 });
      setTimeout(tick, 1000 / rate);
    };
    tick();
    nodes.push({ stop: () => { alive = false; } });
    return { rate: (v) => { rate = clamp(v, 0.6, 3.2); } };
  }
  _loop_clock(d, nodes) {
    let alive = true, tock = false;
    const tick = () => {
      if (!alive) return;
      this._clock(d, this.now + 0.01, { tock });
      tock = !tock;
      setTimeout(tick, 1000);
    };
    tick();
    nodes.push({ stop: () => { alive = false; } });
  }
  _loop_growl(d, nodes) {
    const a = this._osc('sawtooth', 41), b = this._osc('sawtooth', 43.7);
    const lp = this._filter('lowpass', 240, 4);
    const lfo = this._osc('sine', 0.4); const lg = this.ctx.createGain(); lg.gain.value = 140; lfo.connect(lg).connect(lp.frequency);
    const g = this.ctx.createGain(); g.gain.value = 0.35;
    const am = this._osc('sine', 1.7); const ag = this.ctx.createGain(); ag.gain.value = 0.2; am.connect(ag).connect(g.gain);
    a.connect(lp); b.connect(lp); lp.connect(g).connect(d);
    const n = this._src(this.pinkBuf, true); const bp = this._filter('bandpass', 160, 2); const ng = this.ctx.createGain(); ng.gain.value = 0.6;
    n.connect(bp).connect(ng).connect(g);
    [a, b, lfo, am, n].forEach((x) => { x.start(); nodes.push(x); });
  }
  _loop_shower(d, nodes) {
    const n = this._src(this.noiseBuf, true);
    const hp = this._filter('highpass', 400, 0.5); const lp = this._filter('lowpass', 6000, 0.5);
    const g = this.ctx.createGain(); g.gain.value = 0.25;
    n.connect(hp).connect(lp).connect(g).connect(d); n.start(); nodes.push(n);
  }
  _loop_whispers(d, nodes, o) {
    let alive = true;
    const go = () => {
      if (!alive) return;
      const r = this._whisper(d, this.now + 0.05, { v: o.v || 0.7 });
      setTimeout(go, (r.dur + rand(0.3, 2.5)) * 1000);
    };
    go();
    nodes.push({ stop: () => { alive = false; } });
  }
  _loop_party(d, nodes) {
    // memória de festa: murmúrio de crianças abafado e distante
    let alive = true;
    const go = () => {
      if (!alive) return;
      this._whisper(d, this.now + 0.02, { v: 0.35, syl: 4 + Math.floor(rand(0, 4)) });
      if (Math.random() < 0.25) this._noiseBurst(d, this.now + 0.1, 0.4, { f: 1200, q: 0.8, peak: 0.05 });
      setTimeout(go, rand(300, 1100));
    };
    go();
    nodes.push({ stop: () => { alive = false; } });
  }

  // ---------------------------------------------------------------- música
  music(kind) {
    if (!this.ready) return;
    if (this.musicHandle && this.musicHandle.kind === kind) return;
    this.stopMusic();
    if (!kind) return;
    let alive = true;
    const d = this._dest({ bus: 'mus', vol: 0 });
    d.gain.setTargetAtTime(1, this.now, 1.5);
    const nodes = [];
    const self = this;
    if (kind === 'menu' || kind === 'memory' || kind === 'end' || kind === 'nowhere') {
      const prog = kind === 'end'
        ? [[57, 64, 69, 72], [53, 60, 65, 69], [48, 55, 64, 67], [52, 59, 64, 68]]
        : kind === 'nowhere'
          ? [[50, 57, 62, 66], [47, 54, 59, 62], [43, 50, 55, 59], [45, 52, 57, 61]]
          : [[57, 60, 64, 69], [53, 57, 60, 65], [50, 53, 57, 62], [52, 56, 59, 64]];
      let step = 0;
      const pad = this._loop_drone(d, nodes, { base: kind === 'memory' ? 110 : 55, cut: kind === 'memory' ? 700 : 300 });
      const next = () => {
        if (!alive) return;
        const ch = prog[step % prog.length];
        const t = self.now + 0.05;
        ch.forEach((n, i) => {
          const f = midi(n) * Math.pow(2, rand(-12, 12) / 1200);
          const wob = kind === 'memory' ? 1.8 : 3.4;
          self._bell(d, t + i * (kind === 'nowhere' ? 0.5 : 0.62), f, wob, kind === 'end' ? 0.07 : 0.05);
        });
        if (step % 2 === 1 && kind !== 'nowhere') self._bell(d, t + 2.6, midi(ch[3] + 12), 3, 0.025);
        step++;
        setTimeout(next, kind === 'nowhere' ? 4200 : 4800);
      };
      next();
      void pad;
    } else if (kind === 'chase') {
      const drone = this._loop_drone(d, nodes, { base: 41.2, cut: 500, dark: true });
      void drone;
      const pulse = () => {
        if (!alive) return;
        self._heartbeat(d, self.now + 0.02, { v: 0.9 });
        self._noiseBurst(d, self.now + 0.3, 0.06, { f: rand(1500, 4000), q: 6, peak: 0.08 });
        setTimeout(pulse, 520);
      };
      pulse();
    } else if (kind === 'dread') {
      this._loop_drone(d, nodes, { base: 36.7, cut: 180, dark: true });
    }
    this.musicHandle = {
      kind,
      stop() { alive = false; d.gain.setTargetAtTime(0, self.now, 0.6); setTimeout(() => { nodes.forEach((n) => { try { n.stop(); } catch (e) { /* ok */ } }); try { d.disconnect(); } catch (e) { /* ok */ } }, 2500); },
    };
  }
  stopMusic() { if (this.musicHandle) { this.musicHandle.stop(); this.musicHandle = null; } }

  // ---------------------------------------------------------------- vozes (TTS opcional)
  speak(text, o = {}) {
    if (!settings.tts || !window.speechSynthesis) return;
    try {
      const u = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const pt = voices.filter((v) => /pt[-_]BR/i.test(v.lang));
      const v = (o.female ? pt.find((x) => /female|maria|francisca|luciana|vit|fem/i.test(x.name)) : null) || pt[0] || voices.find((x) => /^pt/i.test(x.lang));
      if (v) u.voice = v;
      u.lang = 'pt-BR';
      u.pitch = o.pitch === undefined ? 1 : o.pitch;
      u.rate = o.rate === undefined ? 0.9 : o.rate;
      u.volume = clamp(settings.master * settings.voices * (o.vol === undefined ? 1 : o.vol), 0, 1);
      window.speechSynthesis.speak(u);
    } catch (e) { /* sem voz */ }
  }
  hush() { try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) { /* ok */ } }
}

export const audio = new AudioEngine();
