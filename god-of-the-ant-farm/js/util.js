'use strict';
// ============================================================
//  GOD OF THE ANT FARM — utilities
// ============================================================
window.G = window.G || {};
(function (G) {
  // ---------- dev-mode knobs: G.Dev sets them, everything else reads 1 ----------
  G.DV = {};
  G.dv = k => { const v = G.DV[k]; return v === undefined ? 1 : v; };
  // ---------- seeded RNG (used by world generation) ----------
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  G.mulberry32 = mulberry32;

  // ---------- chance: one generator per system ----------
  // the world's (G.R, rr, ri, pick, chance): seeded by the world's seed, its state lives in G.S.rng and goes into the save,
  // so the same seed and the same acts of the god give the same world, and a save loaded twice lives the same future
  let loose = (Math.random() * 4294967296) | 0; // (before any world exists)
  const R = () => {
    const S = G.S; let a = S && S.rng !== undefined ? S.rng : loose;
    a = (a + 0x6D2B79F5) | 0;
    if (S) S.rng = a; else loose = a;
    if (G.rngWatch) G.rngWatch(0);
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  G.R = R;
  G.rr = (a, b) => a + R() * (b - a);
  G.ri = (a, b) => Math.floor(a + R() * (b - a + 1));
  G.pick = arr => arr[Math.floor(R() * arr.length)];
  G.chance = p => R() < p;
  // what only shows or sounds (particles, sky, the camera, music) draws from its own: watching never changes what happens
  let look = (Math.random() * 4294967296) | 0;
  const VR = () => {
    let a = look = (look + 0x6D2B79F5) | 0;
    if (G.rngWatch) G.rngWatch(1);
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  G.VR = VR;
  G.vrr = (a, b) => a + VR() * (b - a);
  G.vri = (a, b) => Math.floor(a + VR() * (b - a + 1));
  G.vpick = arr => arr[Math.floor(VR() * arr.length)];
  G.vchance = p => VR() < p;
  // the world's seed for its generator (a new world, or a save from before the generator was saved)
  G.rngSeed = (seed, day) => ((seed ^ 0x2545F491) + Math.imul(day | 0, 0x9E3779B1)) | 0;
  // (the QA tools set G.rngWatch to see who draws from which generator, and G.inSim says whether the world is living a step)
  G.rngWatch = null; G.inSim = 0;
  // During the time skip a few head counts (people of a realm or a town, a realm's stores, a well) are taken once per part
  // of a step instead of once per asker: a birth, a death or a new store in the same part shows in the next one, half a
  // second later. On the screen, and outside the world's step, they are always counted fresh. (G.Main.skipStep turns G.part)
  G.part = 0;
  G.perPart = function (count, key) {
    let part = -1; const memo = new Map();
    return function (a, b) {
      if (!G.inSim || !(G.Skip && G.Skip.on)) return count(a, b);
      if (part !== G.part) { part = G.part; memo.clear(); }
      const k = key ? key(a, b) : a; let r = memo.get(k);
      if (r === undefined) { r = count(a, b); memo.set(k, r); }
      return r;
    };
  };

  // ---------- math ----------
  G.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  G.lerp = (a, b, t) => a + (b - a) * t;
  G.smooth = (a, b, v) => { const t = G.clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  G.dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
  G.dist2 = (ax, ay, bx, by) => { const dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; };
  G.easeOut = t => 1 - Math.pow(1 - t, 3);
  G.easeIn = t => t * t * t;
  G.easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  G.hash = (i) => { // deterministic per-integer pseudo random [0,1)
    let x = (i | 0) * 374761393 + 668265263;
    x = (x ^ (x >>> 13)) * 1274126177;
    x = x ^ (x >>> 16);
    return ((x >>> 0) % 100000) / 100000;
  };
  G.lerpColor = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  G.rgb = (c, a) => a === undefined
    ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`
    : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  G.hex2rgb = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  G.shade = (hex, f) => { const c = G.hex2rgb(hex); return G.rgb(f >= 0 ? G.lerpColor(c, [255, 255, 255], f) : G.lerpColor(c, [0, 0, 0], -f)); };

  // ---------- Perlin-like gradient noise ----------
  G.makeNoise = function (seed) {
    const rng = mulberry32(seed);
    const perm = new Uint8Array(512);
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = p[i]; p[i] = p[j]; p[j] = t; }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
    const gx = new Float32Array(256), gy = new Float32Array(256);
    for (let i = 0; i < 256; i++) { const a = rng() * Math.PI * 2; gx[i] = Math.cos(a); gy[i] = Math.sin(a); }
    const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
    return function (x, y) {
      const xi = Math.floor(x), yi = Math.floor(y);
      const xf = x - xi, yf = y - yi;
      const X = xi & 255, Y = yi & 255;
      const g = (h, dx, dy) => gx[h] * dx + gy[h] * dy;
      const aa = perm[perm[X] + Y], ab = perm[perm[X] + Y + 1];
      const ba = perm[perm[X + 1] + Y], bb = perm[perm[X + 1] + Y + 1];
      const u = fade(xf), v = fade(yf);
      const x1 = G.lerp(g(aa, xf, yf), g(ba, xf - 1, yf), u);
      const x2 = G.lerp(g(ab, xf, yf - 1), g(bb, xf - 1, yf - 1), u);
      return G.lerp(x1, x2, v) * 1.414;
    };
  };
  G.fbm = function (noise, x, y, oct, lac, gain) {
    lac = lac || 2; gain = gain || 0.5;
    let a = 1, f = 1, s = 0, n = 0;
    for (let i = 0; i < oct; i++) { s += noise(x * f, y * f) * a; n += a; a *= gain; f *= lac; }
    return s / n;
  };

  // ---------- binary min-heap keyed by float, holding integers (tile indices) ----------
  // typed arrays: the pathfinder pushes and pops thousands of nodes a second and must not make garbage
  G.Heap = class {
    constructor() { this.k = new Float64Array(1024); this.v = new Int32Array(1024); this.n = 0; }
    get size() { return this.n; }
    clear() { this.n = 0; }
    push(val, key) {
      if (this.n === this.k.length) { const k = new Float64Array(this.n * 2), v = new Int32Array(this.n * 2); k.set(this.k); v.set(this.v); this.k = k; this.v = v; }
      const k = this.k, v = this.v; let i = this.n++;
      while (i > 0) { const p = (i - 1) >> 1; if (k[p] <= key) break; k[i] = k[p]; v[i] = v[p]; i = p; }
      k[i] = key; v[i] = val;
    }
    pop() {
      if (!this.n) return undefined;
      const k = this.k, v = this.v; const top = v[0]; const n = --this.n;
      if (n > 0) {
        const lk = k[n], lv = v[n];
        let i = 0;
        while (true) {
          let l = 2 * i + 1, r = l + 1, m = i, mk = lk;
          if (l < n && k[l] < mk) { m = l; mk = k[l]; }
          if (r < n && k[r] < mk) { m = r; mk = k[r]; }
          if (m === i) break;
          k[i] = k[m]; v[i] = v[m]; i = m;
        }
        k[i] = lk; v[i] = lv;
      }
      return top;
    }
  };

  // ---------- names ----------
  G.NAMES_F = ['Lina', 'Mara', 'Aila', 'Nira', 'Sela', 'Tessa', 'Iara', 'Luma', 'Naia', 'Yara', 'Cora', 'Elia', 'Mina', 'Rhea',
    'Zina', 'Talia', 'Veda', 'Oma', 'Kira', 'Liora', 'Nuri', 'Ayla', 'Ema', 'Isa', 'Juna', 'Lia', 'Mei', 'Nala', 'Pia', 'Sari',
    'Tuli', 'Vina', 'Zoe', 'Alba', 'Bia', 'Dara', 'Flora', 'Gaia', 'Hana', 'Ines', 'Jade', 'Kaia', 'Lara', 'Maia', 'Nina',
    'Olivia', 'Rosa', 'Sofia', 'Tainá', 'Uma', 'Vera', 'Wanda', 'Xena', 'Yuna', 'Ágata', 'Célia', 'Denise', 'Eva', 'Fiona',
    'Glória', 'Helena', 'Irene', 'Joana', 'Karin', 'Lúcia', 'Marta', 'Noemi', 'Otília', 'Paula', 'Raquel', 'Selma', 'Tereza'];
  G.NAMES_M = ['Taren', 'Bram', 'Oren', 'Kael', 'Davi', 'Tomas', 'Ivo', 'Rui', 'Caio', 'Enzo', 'Lior', 'Nico', 'Otto', 'Pedro',
    'Ravi', 'Saulo', 'Teo', 'Ugo', 'Vito', 'Yuri', 'Zeca', 'Arno', 'Beto', 'Ciro', 'Edu', 'Fael', 'Gil', 'Hugo', 'Ian', 'Joca',
    'Kiko', 'Leo', 'Milo', 'Noah', 'Orin', 'Piero', 'Quim', 'Raul', 'Sami', 'Tito', 'Ulisses', 'Vasco', 'Wil', 'Xande', 'Zion',
    'Anselmo', 'Bento', 'Caetano', 'Dario', 'Elias', 'Fábio', 'Gael', 'Heitor', 'Ícaro', 'Jonas', 'Lauro', 'Mateus', 'Nestor',
    'Olavo', 'Paulo', 'Rodrigo', 'Samuel', 'Tiago', 'Valter', 'Aurélio', 'Bruno', 'Cássio', 'Diogo', 'Emílio', 'Félix'];
  G.SETTLEMENT_NAMES = ['Primeira Chama', 'Vale do Orvalho', 'Pedra Rasa', 'Nova Aurora', 'Porto Sereno', 'Bosque Alto',
    'Ribeira Clara', 'Colina Dourada', 'Recanto do Vento', 'Campo das Luzes', 'Pouso Verde', 'Serra Fria', 'Água Mansa', 'Lagoa Funda',
    'Rocha Negra', 'Monte Sereno', 'Várzea Grande', 'Três Pinheiros', 'Olho d\'Água', 'Beira-Mar', 'Campina Alta', 'Toca da Raposa',
    'Encosta do Sol', 'Porto das Brumas', 'Vau das Garças', 'Cerro Partido', 'Fonte Velha', 'Pedra Branca', 'Vila das Cinzas', 'Clareira Funda'];

  // map size can change between worlds: modules register a hook to refresh their cached N
  G.mapHooks = [];
  // (a module that throws does not stop the others: it is reported a few times, then only counted)
  G.modErr = {};
  G.tryRun = function (name, fn, dt) { try { fn(dt); } catch (e) { const n = G.modErr[name] = (G.modErr[name] || 0) + 1; if (n <= 3 || n % 500 === 0) console.error(`[${name}]${n > 1 ? ` (${n}×)` : ''}`, e); } };
  // a new world begins (a new game, a save loaded): the modules drop what belonged to the one before
  G.worldHooks = [];
  G.newWorld = function () { for (const h of G.worldHooks) { try { h(); } catch (e) { console.warn('world hook', e); } } };
  G.setMapSize = function (n) { G.N = n; for (const h of G.mapHooks) h(n); };

  // facing: 'face' is the side on screen for the first view (+1 right); fx, fy keep the world direction
  // so the other three views can show it too
  // the side something faces in the world (the first view's right is +1): for the world's own placing, never the screen's
  G.wface = o => (o.fx !== undefined && o.fx !== null ? (o.fx - o.fy > 0 ? 1 : -1) : (o.face || 1));
  G.faceTo = (o, dx, dy) => { o.face = dx - dy > 0 ? 1 : -1; o.fx = dx; o.fy = dy; };
  G.faceAs = (o, src, flip) => { o.face = flip ? -src.face : src.face; const k = flip ? -1 : 1; if (src.fx !== undefined) { o.fx = src.fx * k; o.fy = src.fy * k; } else { o.fx = undefined; o.fy = undefined; } };

  G.fmt = n => (n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(Math.floor(n)));
  G.cap = s => s.charAt(0).toUpperCase() + s.slice(1);
})(window.G);
