'use strict';
// ============================================================
//  Renderer: isometric diorama, cached terrain chunks, water,
//  depth-sorted entities, day/night lighting, weather, effects
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  const R = G.Render = {};
  const HS = 4; R.HS = HS;
  const RS = 2;                 // terrain cache resolution
  const C = 16; let NC = N / C;     // chunks
  G.mapHooks.push(n => { N = n; NC = n / C; });
  const TAU = Math.PI * 2;
  R.cam = { x: 0, y: 256, zoom: 1.6, tz: 1.6, shake: 0, follow: 0, anchor: null };
  let canvas, ctx, lightC, lctx, VW = 0, VH = 0, dpr = 1;
  // ------------------------------ the four views ------------------------------
  // the god can walk around the diorama: rot turns the map a quarter at a time. Everything that
  // lands on screen goes through proj, so turning the world is turning this one function.
  // While the world is being turned (spin), the view is at any angle phi around the map's centre;
  // rot is then the nearest quarter, which the sprites use to know which side they show.
  let rot = 0, spin = null, cphi = 1, sphi = 0;
  const proj = (x, y, h) => {
    let X = x, Y = y;
    if (spin) { const c = N / 2, dx = x - c, dy = y - c; X = c + dx * cphi - dy * sphi; Y = c + dx * sphi + dy * cphi; }
    else if (rot === 1) { X = N - y; Y = x; } else if (rot === 2) { X = N - x; Y = N - y; } else if (rot === 3) { X = y; Y = N - x; }
    return [(X - Y) * 16, (X + Y) * 8 - h * HS];
  };
  R.proj = proj;
  R.rot = () => rot;
  // how far back (small) or front (big) a point is in this view: the painter's order
  const depth = (x, y) => spin ? N + (x - N / 2) * (cphi + sphi) + (y - N / 2) * (cphi - sphi) : rot === 0 ? x + y : rot === 1 ? N - y + x : rot === 2 ? 2 * N - x - y : y + N - x;
  R.depth = depth;
  R.toView = (x, y) => { if (spin) { const c = N / 2, dx = x - c, dy = y - c; return [c + dx * cphi - dy * sphi, c + dx * sphi + dy * cphi]; } return rot === 0 ? [x, y] : rot === 1 ? [N - y, x] : rot === 2 ? [N - x, N - y] : [y, N - x]; };
  R.fromView = (X, Y) => { if (spin) { const c = N / 2, a = X - c, b = Y - c; return [c + a * cphi + b * sphi, c - a * sphi + b * cphi]; } return rot === 0 ? [X, Y] : rot === 1 ? [Y, N - X] : rot === 2 ? [N - X, N - Y] : [N - Y, X]; };
  // a view-space direction back to a world direction
  R.vdirToWorld = (dX, dY) => spin ? [dX * cphi + dY * sphi, -dX * sphi + dY * cphi] : rot === 0 ? [dX, dY] : rot === 1 ? [dY, -dX] : rot === 2 ? [-dX, -dY] : [-dY, dX];
  // which way a world direction points on screen: +1 right, -1 left
  R.sdir = (dx, dy) => ((spin ? (dx * cphi - dy * sphi) - (dx * sphi + dy * cphi) : rot === 0 ? dx - dy : rot === 1 ? -dy - dx : rot === 2 ? dy - dx : dy + dx) > 0 ? 1 : -1);
  let mirOver = -1; // (while turning: the picture of the other side, for the cross-fade)
  R.mirror = () => ((mirOver >= 0 ? mirOver : rot) & 1 ? -1 : 1);
  // the side a creature faces on screen (its world direction when known)
  R.sface = o => (o.fx !== undefined && o.fx !== null ? R.sdir(o.fx, o.fy) : (o.face || 1) * (rot >= 2 ? -1 : 1));
  // a world offset around an anchor, on screen
  R.off = (dx, dy, z) => { let X = dx, Y = dy; if (spin) { X = dx * cphi - dy * sphi; Y = dx * sphi + dy * cphi; } else if (rot === 1) { X = -dy; Y = dx; } else if (rot === 2) { X = -dx; Y = -dy; } else if (rot === 3) { X = dy; Y = -dx; } return [(X - Y) * 16, (X + Y) * 8 - (z || 0)]; };
  // an offset in a sprite's own space (sprites are mirrored on the side views)
  R.soff = (dx, dy, z) => [(dx - dy) * 16 * (rot & 1 ? -1 : 1), (dx + dy) * 8 - (z || 0)];
  // a sprite's screen-x offset (in its own space) as a world offset
  R.sprToWorld = px => { const X = px * (rot & 1 ? -1 : 1) / 32; return R.vdirToWorld(X, -X); };
  // the edges of a rectangle, split into the two at the back and the two at the front of this view
  R.rectEdges = (x0, y0, x1, y1) => {
    const E = [[x0, y1, x0, y0], [x0, y0, x1, y0], [x1, y0, x1, y1], [x0, y1, x1, y1]];
    const c = depth((x0 + x1) / 2, (y0 + y1) / 2);
    const back = [], front = [];
    for (const e of E) (depth((e[0] + e[2]) / 2, (e[1] + e[3]) / 2) < c ? back : front).push(e);
    return { back, front };
  };
  R.hover = null;
  R.preview = null; // {power, x, y}
  R.time = 0;

  R.init = function (cv) {
    canvas = cv; ctx = cv.getContext('2d');
    lightC = document.createElement('canvas'); lctx = lightC.getContext('2d');
    R.resize();
    window.addEventListener('resize', () => { R.needResize = true; });
  };
  R.quality = 1; // adaptive: lowered automatically when frames get slow
  R.resize = function () {
    VW = window.innerWidth; VH = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    while (VW * VH * dpr * dpr > 4.2e6 && dpr > 1) dpr -= 0.25;
    dpr *= R.quality;
    canvas.width = Math.floor(VW * dpr); canvas.height = Math.floor(VH * dpr);
    canvas.style.width = VW + 'px'; canvas.style.height = VH + 'px';
    lightC.width = Math.ceil(canvas.width / 2); lightC.height = Math.ceil(canvas.height / 2);
    R.VW = VW; R.VH = VH;
  };
  R.shake = a => { R.cam.shake = Math.max(R.cam.shake, a); };
  let perfAcc = 0, perfN = 0, perfT = 0;
  R.perfSample = function (rdt) {
    perfAcc += rdt; perfN++; perfT += rdt;
    if (perfT < 3) return;
    const avg = perfAcc / perfN; perfAcc = 0; perfN = 0; perfT = 0;
    // applied at the start of the next frame, so a resized (cleared) canvas is never presented
    if (avg > 0.03 && R.quality > 0.6) { R.quality = Math.max(0.6, R.quality - 0.15); R.needResize = true; }
    else if (avg < 0.0135 && R.quality < 1) { R.quality = Math.min(1, R.quality + 0.1); R.needResize = true; }
  };

  // ------------------------------ coordinates ------------------------------
  R.screenToWorldPx = (px, py) => [(px - VW / 2) / R.cam.zoom + R.cam.x, (py - VH / 2) / R.cam.zoom + R.cam.y];
  R.worldPxToScreen = (wx, wy) => [(wx - R.cam.x) * R.cam.zoom + VW / 2, (wy - R.cam.y) * R.cam.zoom + VH / 2];
  R.maxH = 12;
  R.screenToTile = function (px, py) {
    const [wx, wy] = R.screenToWorldPx(px, py);
    const a = wx / 16;
    const at = h => { const b = (wy + h * HS) / 8; return R.fromView((a + b) / 2, (b - a) / 2); };
    const inside = p => p[0] >= 0 && p[1] >= 0 && p[0] < N && p[1] < N;
    // the first surface the ray meets, coming from the front of the view
    const gh = R.groundAt;
    const top = R.under ? UF() + UW() + 0.5 : R.maxH + 0.5, step = 0.4;
    for (let h = top; h >= -1; h -= step) {
      const p = at(h); if (!inside(p)) continue;
      if (gh(p[0], p[1]) >= h) {
        let lo = h, up = h + step;
        for (let k = 0; k < 7; k++) { const m = (lo + up) / 2; const q = at(m); if (inside(q) && gh(q[0], q[1]) >= m) lo = m; else up = m; }
        return at(lo);
      }
    }
    return at(G.SEA);
  };
  // ------------------------------ turning the world ------------------------------
  // The god turns the table with two fingers, a drag or Q/E. While it turns, the world is drawn at any
  // angle (spin); when the hand lets go it settles on the nearest side, where the full drawing returns.
  // The terrain pictures (chunks) belong to one side: during a settle they are laid out and painted for
  // the side it is going to, a few per frame, so the end of the turn costs nothing.
  R.rotHooks = []; R.angleHooks = [];
  let restPhi = 0; // the view's angle at rest, never wrapped (the compass needle keeps turning the same way)
  const QT = Math.PI / 2, mod4 = q => ((q % 4) + 4) % 4;
  R.angle = () => spin ? spin.phi : restPhi;
  R.spinning = () => !!spin;
  function asChunkView(fn) { if (!spin) return fn(); const ks = spin, kr = rot; rot = ks.laidFor; spin = null; try { return fn(); } finally { rot = kr; spin = ks; } }
  function setPhi(phi) {
    spin.phi = phi; cphi = Math.cos(phi); sphi = Math.sin(phi);
    const r = mod4(Math.round(phi / QT)); if (r !== rot) { rot = r; R.view = r; }
    // the point the god turns around stays where it is on screen
    const p = proj(spin.cx, spin.cy, spin.ch); R.cam.x = p[0]; R.cam.y = p[1];
    for (const h of R.angleHooks) h(phi);
  }
  function spinStart(hold) {
    const c = R.screenToTile(VW / 2, VH / 2);
    const cx = G.clamp(c[0], 0.5, N - 0.5), cy = G.clamp(c[1], 0.5, N - 0.5);
    spin = { phi: restPhi, hold, cx, cy, ch: R.groundAt(cx, cy), rot0: rot, laidFor: rot, from: restPhi, to: restPhi, k: 1, dur: 0.3, target: rot };
    R.cam.target = null; R.cam.follow = 0;
    setPhi(restPhi);
  }
  R.spinBegin = function () { if (!G.S) return; if (spin) spin.hold = true; else spinStart(true); };
  R.spinBy = function (d) { if (!G.S) return; if (!spin) spinStart(true); spin.hold = true; setPhi(spin.phi + d); };
  // let go: settle on the nearest side (a quick flick carries on to the next one)
  R.spinRelease = function (vel) {
    if (!spin) return;
    let q = Math.round(spin.phi / QT);
    if (Math.abs(vel || 0) > 1.5) { const f = spin.phi / QT; q = vel > 0 ? Math.ceil(f - 0.05) : Math.floor(f + 0.05); }
    settleTo(q, 0.32);
  };
  function settleTo(q, per) {
    spin.hold = false; spin.from = spin.phi; spin.to = q * QT; spin.k = 0;
    spin.dur = G.clamp(Math.abs(spin.to - spin.from) / QT * (per || 0.5), 0.16, 0.9);
    spin.target = mod4(q);
    if (spin.laidFor !== spin.target) layoutFor(spin.target);
  }
  // Q/E and the compass: a quarter turn, smooth
  R.rotate = function (dir) {
    if (!G.S) return;
    dir = dir > 0 ? 1 : -1;
    if (spin && spin.hold) return;
    if (!spin) spinStart(false);
    settleTo(Math.round((spin.k < 1 ? spin.to : spin.phi) / QT) + dir, 0.55);
    G.Audio && G.Audio.play && G.Audio.play('whoosh');
  };
  // where every chunk sits in the current view; a picture already painted for this view is kept
  function relayout() {
    for (const ch of chunks) {
      const nc = makeChunk(ch.cx, ch.cy);
      if (nc.w !== ch.w || nc.h !== ch.h) { dropHi(ch); ch.lo = null; ch.lctx = null; ch.loRot = -1; ch.prL = null; }
      ch.sx = nc.sx; ch.sy = nc.sy; ch.w = nc.w; ch.h = nc.h; ch.vx0 = nc.vx0; ch.vy0 = nc.vy0;
      ch.dirty = ch.dirty || ch.rot !== rot; ch.dirtyLo = ch.dirtyLo || ch.loRot !== rot;
    }
    sortChunks();
  }
  function layoutFor(r) {
    const ks = spin, kr = rot; rot = r; spin = null;
    try { relayout(); } finally { rot = kr; spin = ks; }
    if (ks) ks.laidFor = r;
  }
  // while turning: paint, a part at a time, the pictures of the side the turn is heading for
  function paintTarget(ms) {
    if (!spin || spin.laidFor !== spin.target) return;
    const ks = spin, kr = rot; rot = ks.target; spin = null;
    try {
      const p = proj(ks.cx, ks.cy, ks.ch); const hw = VW / 2 / R.cam.zoom + 40, hh = VH / 2 / R.cam.zoom + 40;
      const lo = bigMap && R.cam.zoom * dpr <= LRS * 1.05; const until = now() + ms;
      for (const ch of chunkOrder) {
        if (ch.empty || (lo ? !(ch.dirtyLo || ch.loRot !== rot) : !(ch.dirty || ch.rot !== rot))) continue;
        if (ch.sx > p[0] + hw || ch.sx + ch.w < p[0] - hw || ch.sy > p[1] + hh + 40 || ch.sy + ch.h < p[1] - hh) continue;
        if (now() > until) break;
        paintStep(ch, lo, until);
      }
    } finally { rot = kr; spin = ks; }
  }
  function updateSpin(dt) {
    if (!spin) return;
    if (spin.hold) {
      // the hand still turns it: get ready for the side it is nearest to (clearly nearest: no dithering at 45°)
      const q = Math.round(spin.phi / QT), r = mod4(q);
      if (r !== spin.target && Math.abs(spin.phi - q * QT) < QT * 0.36) { spin.target = r; if (spin.laidFor !== r) layoutFor(r); }
      return;
    }
    spin.k = Math.min(1, spin.k + dt / spin.dur);
    const e = 1 - Math.pow(1 - spin.k, 3);
    setPhi(spin.from + (spin.to - spin.from) * e);
    if (spin.k >= 1) endSpin();
  }
  function endSpin() {
    const ks = spin; const q = Math.round(ks.to / QT); const r = mod4(q);
    spin = null; cphi = 1; sphi = 0; restPhi = q * QT; rot = r; R.view = r;
    if (ks.laidFor !== r) layoutFor(r);
    R.centerOn(ks.cx, ks.cy);
    if (r !== ks.rot0) { borderCache.ver = -1; for (const h of R.rotHooks) h(rot); G.Minimap && G.Minimap.refresh && G.Minimap.refresh(); }
    for (const h of R.angleHooks) h(restPhi);
    // (pictures not painted yet are drawn tile by tile meanwhile; they arrive over the next frames)
  }
  // a cut to another view, with no turning (the cinema uses it behind a fade)
  R.turnTo = function (r) { r = mod4(r | 0); if (spin) { spin.to = Math.round(spin.phi / QT) * QT; endSpin(); } if (r === rot || !G.S) return; restPhi += ((r - rot + 4) % 4 === 3 ? -1 : (r - rot + 4) % 4) * QT; applyView(r); for (const h of R.angleHooks) h(restPhi); };
  R.paintVisible = () => paintVisible();
  function applyView(r) {
    rot = r; R.view = rot;
    relayout();
    borderCache.ver = -1;
    for (const h of R.rotHooks) h(rot);
    G.Minimap && G.Minimap.refresh && G.Minimap.refresh();
  }
  // what is on screen gets painted at once; the rest follows over the next frames
  function paintVisible() {
    const vr = viewRect(40);
    for (const ch of chunkOrder) if (!ch.empty && (ch.dirty || ch.rot !== rot) && !(ch.sx > vr[2] || ch.sx + ch.w < vr[0] || ch.sy > vr[3] || ch.sy + ch.h < vr[1])) renderChunk(ch, bigMap && R.cam.zoom * dpr <= LRS * 1.05);
  }
  // (before a world is built: the terrain is painted afterwards for this view)
  R.setView = function (r) { r = mod4(r | 0); spin = null; cphi = 1; sphi = 0; rot = r; R.view = r; restPhi = r * QT; borderCache.ver = -1; for (const h of R.rotHooks) h(rot); for (const h of R.angleHooks) h(restPhi); };
  R.view = 0;
  R.centerOn = function (x, y, zoom) {
    const [sx, sy] = proj(x, y, R.groundAt(x, y));
    R.cam.x = sx; R.cam.y = sy;
    if (zoom) { R.cam.zoom = zoom; R.cam.tz = zoom; }
  };
  R.panTo = function (x, y) { R.cam.target = proj(x, y, R.groundAt(x, y)); };

  // ------------------------------ terrain cache ------------------------------
  let chunks = [], shore = [], shoreRiver = [], sparkles = [], dLand = null;
  const COL = {
    grass: [118, 172, 78], meadow: [134, 186, 84], sand: [232, 214, 160], rocky: [150, 146, 132], river: [92, 182, 198],
    dirt: [176, 146, 102], burnt: [60, 54, 50], scar: [78, 60, 48],
  };
  const WATER = [[108, 205, 210], [80, 176, 200], [58, 146, 186], [44, 118, 166], [38, 104, 152]];
  R.DEEP = 'rgb(38,104,152)';
  R.reshape = function (x, y, r) {
    G.Sea && G.Sea.build();
    computeDLand(); buildShore(); buildOcean();
    sparkles = sparkles.filter(s => G.S.type[W.idx(s[0], s[1])] <= T.RIVER);
    R.invalidateTerrain(x, y, r);
  };
  // The open ocean: one pixel per tile, laid under the world with the view's own slant and smoothed —
  // the blue of the shelf darkens away from the coasts into the abyss, with trenches in it.
  // The water over the shallows is a second such picture (its colour and how thick it is, tile by tile),
  // laid smoothed over the visible sea of each cached chunk: no grid, no seams.
  let oceanC = null, waterC = null;
  function buildOcean() {
    const S = G.S; if (!dLand) return;
    if (!oceanC) { oceanC = document.createElement('canvas'); waterC = document.createElement('canvas'); }
    oceanC.width = waterC.width = N; oceanC.height = waterC.height = N;
    const o = oceanC.getContext('2d'); const img = o.createImageData(N, N), D = img.data;
    const wimg = waterC.getContext('2d').createImageData(N, N), WD = wimg.data;
    const nz = G.makeNoise((S.seed | 0) + 4242);
    const Sea = G.Sea && G.Sea.floor ? G.Sea : null;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const i = y * N + x, p = i * 4; const tp = S.temp ? S.temp[i] / 255 : 0.5;
      const k = G.smooth(2.5, 15, dLand[i]) * (0.82 + G.fbm(nz, x * 0.05, y * 0.05, 3) * 0.5);
      const tr = G.smooth(4, 12, dLand[i]) * Math.max(0, 1 - Math.abs(G.fbm(nz, x * 0.03 + 30, y * 0.03 - 12, 2)) * 10) * 0.7;
      let c = G.lerpColor([38, 104, 152], tp < 0.34 ? [24, 62, 96] : tp > 0.6 ? [14, 60, 122] : [18, 58, 112], G.clamp(k, 0, 1));
      c = G.lerpColor(c, [8, 32, 72], tr);
      D[p] = c[0]; D[p + 1] = c[1]; D[p + 2] = c[2]; D[p + 3] = 255;
      // the water: the deep sea is the ocean itself; the shallows, their own look; the land, the look of its sea
      if (!Sea) continue;
      const t = S.type[i];
      let wc = c, wa = 1;
      if (t === T.SEA) { const L = Sea.look(i, dLand[i]); wc = L[0]; wa = L[1]; }
      else if (t >= T.RIVER) {
        let n = 0, r = 0, g = 0, b = 0, a = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny)) continue; const j = ny * N + nx; if (S.type[j] !== T.SEA) continue; const L = Sea.look(j, dLand[j]); r += L[0][0]; g += L[0][1]; b += L[0][2]; a += L[1]; n++; }
        if (n) { wc = [r / n, g / n, b / n]; wa = Math.max(0.2, a / n - 0.1); } else { wc = [92, 196, 204]; wa = 0.3; }
      }
      WD[p] = wc[0]; WD[p + 1] = wc[1]; WD[p + 2] = wc[2]; WD[p + 3] = Math.round(wa * 255);
    }
    o.putImageData(img, 0, 0);
    if (Sea) waterC.getContext('2d').putImageData(wimg, 0, 0);
  }
  // the glass of a chunk: where the sea's surface shows (land in front cuts it out), filled with the water
  let glassC = null;
  function seaGlass(ch, c, rs) {
    const S = G.S; if (!G.Sea || !G.Sea.floor || !waterC || waterC.width !== N) return;
    const cv = c.canvas;
    if (!glassC) glassC = document.createElement('canvas');
    if (glassC.width < cv.width || glassC.height < cv.height) { glassC.width = Math.max(glassC.width, cv.width); glassC.height = Math.max(glassC.height, cv.height); }
    const g = glassC.getContext('2d'); const H = S.H, V = N + 1, SEA = G.SEA;
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, cv.width, cv.height);
    g.setTransform(rs, 0, 0, rs, -ch.sx * rs, -ch.sy * rs); g.lineJoin = 'round'; g.lineWidth = 0.7; g.fillStyle = g.strokeStyle = '#fff';
    let any = false;
    for (let Y = ch.vy0; Y < ch.vy0 + C; Y++) for (let X = ch.vx0; X < ch.vx0 + C; X++) {
      const tt = tileFromView(X, Y), x = tt[0], y = tt[1], i = y * N + x, t = S.type[i];
      let a, b, d, e;
      if (t === T.SEA || (t === T.DEEP && dLand[i] <= 3)) { if (!any) any = true; g.globalCompositeOperation = 'source-over'; a = proj(x, y, SEA); b = proj(x + 1, y, SEA); d = proj(x + 1, y + 1, SEA); e = proj(x, y + 1, SEA); }
      else if (t === T.DEEP) continue;
      else {
        if (!any) continue; // (nothing to cut yet)
        g.globalCompositeOperation = 'destination-out';
        if (t === T.RIVER) { const hh = S.wl[i]; a = proj(x, y, hh); b = proj(x + 1, y, hh); d = proj(x + 1, y + 1, hh); e = proj(x, y + 1, hh); }
        else { a = proj(x, y, H[y * V + x]); b = proj(x + 1, y, H[y * V + x + 1]); d = proj(x + 1, y + 1, H[(y + 1) * V + x + 1]); e = proj(x, y + 1, H[(y + 1) * V + x]); }
      }
      g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(d[0], d[1]); g.lineTo(e[0], e[1]); g.closePath(); g.fill(); g.stroke();
    }
    if (!any) return;
    g.globalCompositeOperation = 'source-in';
    const m0 = proj(0, 0, SEA), m1 = proj(1, 0, SEA), m2 = proj(0, 1, SEA);
    g.save(); g.transform(m1[0] - m0[0], m1[1] - m0[1], m2[0] - m0[0], m2[1] - m0[1], m0[0], m0[1]); g.imageSmoothingEnabled = true; g.drawImage(waterC, 0, 0); g.restore();
    // what floats on it (the kelp's canopy), only where the water shows
    g.globalCompositeOperation = 'source-atop';
    const KELP = G.Sea.F.KELP, fl = G.Sea.floor;
    for (let Y = ch.vy0; Y < ch.vy0 + C; Y++) for (let X = ch.vx0; X < ch.vx0 + C; X++) { const tt = tileFromView(X, Y), i = tt[1] * N + tt[0]; if (fl[i] === KELP) G.Sea.kelpCanopy(g, proj, tt[0], tt[1], i); }
    g.globalCompositeOperation = 'source-over';
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(glassC, 0, 0, cv.width, cv.height, 0, 0, cv.width, cv.height); c.restore();
  }
  function drawOcean() {
    if (!oceanC || oceanC.width !== N) return;
    const m0 = proj(0, 0, G.SEA), m1 = proj(1, 0, G.SEA), m2 = proj(0, 1, G.SEA);
    ctx.save(); ctx.transform(m1[0] - m0[0], m1[1] - m0[1], m2[0] - m0[0], m2[1] - m0[1], m0[0], m0[1]);
    ctx.imageSmoothingEnabled = true; ctx.drawImage(oceanC, 0, 0); ctx.restore();
  }
  function computeDLand() {
    const S = G.S;
    dLand = new Int32Array(N * N).fill(99);
    const q = [];
    for (let i = 0; i < N * N; i++) if (S.type[i] >= T.RIVER) { dLand[i] = 0; q.push(i); }
    for (let h = 0; h < q.length; h++) {
      const a = q[h]; const x = a % N, y = (a / N) | 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny)) continue;
        const j = ny * N + nx; if (dLand[j] > dLand[a] + 1) { dLand[j] = dLand[a] + 1; q.push(j); }
      }
    }
  }
  R.buildTerrain = function () {
    const S = G.S;
    G.Sea && G.Sea.build();
    computeDLand(); buildOcean();
    for (const ch of chunks) { if (ch.canvas) ch.canvas.width = ch.canvas.height = 0; if (ch.lo) ch.lo.width = ch.lo.height = 0; }
    chunks = []; hiLive = 0; bigMap = N >= 128; warm = 40; spinCol = null;
    for (let cy = 0; cy < NC; cy++) for (let cx = 0; cx < NC; cx++) chunks.push(makeChunk(cx, cy));
    sortChunks(); measureRelief();
    buildShore();
    sparkles = [];
    for (let k = 0; k < 320; k++) {
      const i = Math.floor(Math.random() * N * N);
      if (S.type[i] <= T.RIVER) sparkles.push([(i % N) + Math.random(), ((i / N) | 0) + Math.random(), Math.random() * 20, 0.5 + Math.random()]);
    }
    G.Nature.dirty.clear();
  };
  // back to front in the current view
  let chunkOrder = [];
  function sortChunks() { chunkOrder = chunks.slice().sort((a, b) => a.vy0 - b.vy0 || a.vx0 - b.vx0); }
  function measureRelief() { let m = G.SEA; const H = G.S.H; for (let k = 0; k < H.length; k++) if (H[k] > m) m = H[k]; R.maxH = m + 1; }
  // the world tile under a tile of the view
  const tileFromView = (X, Y) => rot === 0 ? [X, Y] : rot === 1 ? [Y, N - 1 - X] : rot === 2 ? [N - 1 - X, N - 1 - Y] : [N - 1 - Y, X];
  function makeChunk(cx, cy) {
    const S = G.S; const x0 = cx * C, y0 = cy * C;
    let empty = true;
    for (let y = y0; y < y0 + C && empty; y++) for (let x = x0; x < x0 + C; x++) if (S.type[y * N + x] !== T.DEEP) { empty = false; break; }
    let hmin = G.SEA, hmax = G.SEA;
    for (let y = y0; y <= y0 + C; y++) for (let x = x0; x <= x0 + C; x++) { const h = W.vh(x, y); if (h < hmin) hmin = h; if (h > hmax) hmax = h; }
    hmax += 1.5; hmin = Math.min(hmin, G.SEA) - 0.5;
    // where the chunk sits in this view
    const c0 = R.toView(x0, y0), c1 = R.toView(x0 + C, y0 + C);
    const vx0 = Math.min(c0[0], c1[0]), vy0 = Math.min(c0[1], c1[1]);
    const sx = (vx0 - (vy0 + C)) * 16 - 4, ex = (vx0 + C - vy0) * 16 + 4;
    const sy = (vx0 + vy0) * 8 - hmax * HS - 6, ey = (vx0 + vy0 + 2 * C) * 8 - hmin * HS + 4;
    return { cx, cy, x0, y0, vx0, vy0, sx, sy, w: ex - sx, h: ey - sy, hmax, canvas: null, ctx: null, lo: null, lctx: null, empty, dirty: true, dirtyLo: true, seen: -1, rot: -1, loRot: -1 };
  }
  // Big maps keep a low-resolution copy of every chunk (cheap, used when zoomed out) and
  // only a bounded set of full-resolution canvases near the camera (LRU), so memory stays flat.
  const LRS = 1, HI_CAP = 60;
  let bigMap = false, hiLive = 0, frameNo = 0, visCount = 0, warm = 0; // (warm: the first frames of a world paint more)
  function chunkCanvas(ch, lo) {
    const rs = lo ? LRS : RS;
    const cv = document.createElement('canvas');
    cv.width = Math.ceil(ch.w * rs); cv.height = Math.ceil(ch.h * rs);
    return cv;
  }
  function renderChunk(ch, lo) {
    if (ch.empty) { ch.dirty = false; ch.dirtyLo = false; ch.rot = ch.loRot = rot; ch.pr = ch.prL = null; return; }
    if (lo) ch.prL = null; else ch.pr = null;
    const rs = lo ? LRS : RS;
    let cv = lo ? ch.lo : ch.canvas;
    if (!cv) {
      cv = chunkCanvas(ch, lo);
      if (lo) { ch.lo = cv; ch.lctx = cv.getContext('2d'); } else { ch.canvas = cv; ch.ctx = cv.getContext('2d'); hiLive++; }
    }
    const c = lo ? ch.lctx : ch.ctx;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
    c.setTransform(rs, 0, 0, rs, -ch.sx * rs, -ch.sy * rs);
    c.lineJoin = 'round';
    for (let Y = ch.vy0; Y < ch.vy0 + C; Y++) for (let X = ch.vx0; X < ch.vx0 + C; X++) { const t = tileFromView(X, Y); drawTile(c, t[0], t[1]); }
    seaGlass(ch, c, rs);
    if (lo) { ch.dirtyLo = false; ch.loRot = rot; } else { ch.dirty = false; ch.rot = rot; }
    if (ch.occRot !== rot || ch.occDirty) buildOcc(ch);
  }
  // A picture for another view (or a new one) is painted a part at a time: it is not shown until it is
  // whole (the tiles stand in for it meanwhile), so the work can be spread over frames.
  function paintPart(ch, lo, until) {
    if (ch.empty) { renderChunk(ch, lo); return true; }
    const key = lo ? 'prL' : 'pr'; let pr = ch[key];
    if (!pr || pr.rot !== rot) {
      let cv = lo ? ch.lo : ch.canvas;
      if (!cv) {
        cv = chunkCanvas(ch, lo);
        if (lo) { ch.lo = cv; ch.lctx = cv.getContext('2d'); } else { ch.canvas = cv; ch.ctx = cv.getContext('2d'); hiLive++; }
      }
      if (lo) ch.loRot = -1; else ch.rot = -1;
      const c = lo ? ch.lctx : ch.ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
      pr = ch[key] = { rot, k: 0 };
    }
    const rs = lo ? LRS : RS, c = lo ? ch.lctx : ch.ctx;
    c.setTransform(rs, 0, 0, rs, -ch.sx * rs, -ch.sy * rs); c.lineJoin = 'round';
    const n = C * C;
    while (pr.k < n) {
      const t = tileFromView(ch.vx0 + pr.k % C, ch.vy0 + ((pr.k / C) | 0)); drawTile(c, t[0], t[1]); pr.k++;
      if ((pr.k & 7) === 0 && now() > until) break;
    }
    if (pr.k < n) return false;
    seaGlass(ch, c, rs);
    ch[key] = null;
    if (lo) { ch.dirtyLo = false; ch.loRot = rot; } else { ch.dirty = false; ch.rot = rot; }
    if (ch.occRot !== rot || ch.occDirty) buildOcc(ch);
    return true;
  }
  // a picture on show is painted again at once (no gap); one that cannot be shown yet, a part at a time
  function paintStep(ch, lo, until) {
    const shown = lo ? ch.lo && ch.loRot === rot : ch.canvas && ch.rot === rot;
    if (shown) { renderChunk(ch, lo); return true; }
    return paintPart(ch, lo, until);
  }
  // ------------------------------ what the mountains hide ------------------------------
  // A tile that rises above the ground behind it (a ridge, a crest, a cliff seen from below) can hide
  // whoever stands back there. Such tiles are grouped per diagonal of the view; during the entity pass
  // each group is painted again (clipped from the chunk's own picture) right after the things behind it.
  const BACK = [[-1, 0, 1], [0, -1, 1], [-1, -1, 2], [-2, -1, 3], [-1, -2, 3], [-2, -2, 4], [-3, -2, 5], [-2, -3, 5], [-3, -3, 6], [-4, -3, 7], [-3, -4, 7]];
  function buildOcc(ch) {
    const S = G.S; const H = S.H; const V = N + 1; const groups = new Map();
    for (let Y = ch.vy0; Y < ch.vy0 + C; Y++) for (let X = ch.vx0; X < ch.vx0 + C; X++) {
      const [x, y] = tileFromView(X, Y); const i = y * N + x;
      if (S.type[i] < T.SAND) continue;
      const top = Math.max(H[y * V + x], H[y * V + x + 1], H[(y + 1) * V + x], H[(y + 1) * V + x + 1]);
      let occ = false;
      for (const [ox, oy, dd] of BACK) {
        const bX = X + ox, bY = Y + oy; if (bX < 0 || bY < 0 || bX >= N || bY >= N) continue;
        const [bx, by] = tileFromView(bX, bY);
        // (only when the rise would hide a real part of someone standing back there, not just their feet)
        if (top - W.tileH(by * N + bx) > dd * 2 + 1) { occ = true; break; }
      }
      if (!occ) continue;
      const d = X + Y; let g = groups.get(d);
      if (!g) { g = { d, path: new Path2D(), x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 }; groups.set(d, g); }
      const q = [proj(x, y, H[y * V + x]), proj(x + 1, y, H[y * V + x + 1]), proj(x + 1, y + 1, H[(y + 1) * V + x + 1]), proj(x, y + 1, H[(y + 1) * V + x])];
      g.path.moveTo(q[0][0], q[0][1]); for (let k = 1; k < 4; k++) g.path.lineTo(q[k][0], q[k][1]); g.path.closePath();
      for (const p of q) { if (p[0] < g.x0) g.x0 = p[0]; if (p[0] > g.x1) g.x1 = p[0]; if (p[1] < g.y0) g.y0 = p[1]; if (p[1] > g.y1) g.y1 = p[1]; }
    }
    ch.occ = [...groups.values()].sort((a, b) => a.d - b.d);
    for (const g of ch.occ) { g.x0 = Math.max(ch.sx, Math.floor(g.x0) - 1); g.y0 = Math.max(ch.sy, Math.floor(g.y0) - 1); g.x1 = Math.min(ch.sx + ch.w, Math.ceil(g.x1) + 1); g.y1 = Math.min(ch.sy + ch.h, Math.ceil(g.y1) + 1); }
    ch.occRot = rot; ch.occDirty = false;
  }
  function dropHi(ch) { if (ch.canvas) { ch.canvas.width = ch.canvas.height = 0; ch.canvas = null; ch.ctx = null; hiLive--; } ch.dirty = true; ch.pr = null; ch.rot = -1; }
  function evictHi() {
    if (!bigMap || hiLive <= HI_CAP) return;
    const live = chunks.filter(ch => ch.canvas && ch.seen < frameNo).sort((a, b) => a.seen - b.seen);
    for (let k = 0; k < live.length && hiLive > HI_CAP; k++) dropHi(live[k]);
  }
  R.chunkStats = () => ({ hi: hiLive, lo: chunks.filter(c => c.lo).length, n: chunks.filter(c => !c.empty).length, vis: visCount, big: bigMap });
  const chunkOf = (x, y) => chunks[Math.floor(y / C) * NC + Math.floor(x / C)];
  function redrawTile(x, y) {
    if (!W.inb(x, y)) return;
    if (spinCol) spinCol[y * N + x] = -1;
    const ch = chunkOf(x, y); if (!ch) return;
    ch.pr = ch.prL = null; // (a picture half painted starts again)
    // (the sea under its glass is painted only with its whole chunk)
    const ti = G.S.type[y * N + x];
    if (ti === T.SEA || ti === T.DEEP) { if (G.S.road[y * N + x]) ch.dirty = ch.dirtyLo = true; return; }
    // while turning, or a picture kept for another view: painted again when it is needed
    if (spin) { ch.dirty = ch.dirtyLo = true; return; }
    if (ch.canvas && !ch.dirty && ch.rot === rot) { const c = ch.ctx; c.setTransform(RS, 0, 0, RS, -ch.sx * RS, -ch.sy * RS); drawTile(c, x, y); } else if (ch.rot !== rot) ch.dirty = true;
    if (ch.lo && !ch.dirtyLo && ch.loRot === rot) { const c = ch.lctx; c.setTransform(LRS, 0, 0, LRS, -ch.sx * LRS, -ch.sy * LRS); drawTile(c, x, y); } else if (ch.loRot !== rot) ch.dirtyLo = true;
  }
  // a changed tile, then the ones in front of it that may rise over it (painter's order)
  function redrawAround(x, y) {
    const [TX, TY] = R.toView(x + 0.5, y + 0.5).map(Math.floor);
    for (let b = 0; b <= 2; b++) for (let a = 0; a <= 2; a++) { const t = tileFromView(TX + a, TY + b); redrawTile(t[0], t[1]); }
  }
  R.invalidateTerrain = function (x, y, r) {
    G.Relief && G.Relief.fixArea(Math.floor(x - r), Math.floor(y - r), Math.ceil(x + r), Math.ceil(y + r));
    spinCol = null;
    asChunkView(() => { for (const ch of chunks) {
      const cx = ch.x0 + C / 2, cy = ch.y0 + C / 2;
      if (Math.abs(cx - x) < C / 2 + r + 1 && Math.abs(cy - y) < C / 2 + r + 1) {
        const nc = makeChunk(ch.cx, ch.cy); // recompute bounds (heights changed)
        if (nc.w !== ch.w || nc.h !== ch.h || nc.sx !== ch.sx || nc.sy !== ch.sy) { dropHi(ch); ch.lo = null; ch.lctx = null; ch.sx = nc.sx; ch.sy = nc.sy; ch.w = nc.w; ch.h = nc.h; ch.vx0 = nc.vx0; ch.vy0 = nc.vy0; }
        ch.hmax = nc.hmax; ch.empty = nc.empty; ch.dirty = true; ch.dirtyLo = true; ch.occDirty = true; ch.pr = ch.prL = null;
      }
    } });
    measureRelief();
  };
  function tileColor(i, x, y) {
    const S = G.S; const t = S.type[i];
    let c;
    const hv = G.hash(i * 7 + 3) - 0.5;
    const th = W.tileH(i);
    if (t === T.SAND) c = COL.sand.slice();
    else if (t === T.ROCKY) c = COL.rocky.slice();
    else if (t === T.MEADOW) c = COL.meadow.slice();
    else c = COL.grass.slice();
    const bio = S.temp && S.biome ? S.biome[i] : -1;
    if (bio >= 0) c = G.Biome.groundColor(i, t, c).slice();
    if ((t === T.GRASS || t === T.MEADOW) && bio !== 1) {
      const f = S.fert[i];
      c = G.lerpColor(c, bio >= 0 ? [c[0] * 0.8, c[1] * 0.86, c[2] * 0.8] : [96, 150, 70], G.clamp((th - G.SEA) / 8, 0, 1) * 0.5);
      if (bio < 0 || bio === 0) c = G.lerpColor(c, [150, 180, 88], (1 - f) * 0.25);
      if (t === T.MEADOW && bio >= 0) c = G.lerpColor(c, [c[0] * 1.08, c[1] * 1.1, c[2] * 0.95], 0.6);
    }
    c[0] += hv * 12; c[1] += hv * 14; c[2] += hv * 8;
    const lv = G.pathLevel(S.wear[i]);
    if (lv && t !== T.RIVER) c = G.lerpColor(c, COL.dirt, [0, 0.38, 0.66, 0.88][lv]);
    if (S.scar[i] > 0) c = G.lerpColor(c, COL.scar, S.scar[i] > G.DAY_LEN * 2 ? 0.92 : 0.5);
    else if (S.burnt[i] > 0) c = G.lerpColor(c, COL.burnt, S.burnt[i] > G.DAY_LEN * 0.5 ? 0.85 : 0.45);
    return c;
  }
  // bare rock: granite, red sandstone in the dry lands, snow clinging where it is cold
  function rockColor(i, base, rg) {
    const S = G.S; const b = S.biome ? S.biome[i] : -1; const tp = S.temp ? S.temp[i] / 255 : 0.5;
    let c = [140, 134, 124];
    if (b === 6 || b === 5) c = [186, 124, 86];
    else if (b === 4) c = [118, 116, 100];
    c = G.lerpColor(c, [c[0] * 0.86, c[1] * 0.9, c[2] * 0.96], G.hash(i * 13 + 7));
    if (tp < 0.24) c = G.lerpColor(c, [226, 232, 240], G.clamp((0.24 - tp) * 6, 0, 0.7) * (rg > 3.5 ? 0.6 : 1));
    return c;
  }
  // layers of rock drawn as contour lines across a steep face
  function strata(c, x, y, i, h00, h10, h11, h01, col) {
    const P = [[x, y, h00], [x + 1, y, h10], [x + 1, y + 1, h11], [x, y + 1, h01]];
    const lo = Math.min(h00, h10, h11, h01), hi = Math.max(h00, h10, h11, h01);
    const step = 1.15, off = (G.hash(Math.floor(x / 5) * 31 + Math.floor(y / 5) * 17) * step);
    const dark = G.rgb([col[0] * 0.72, col[1] * 0.7, col[2] * 0.68]), lite = G.rgb([Math.min(255, col[0] * 1.14), Math.min(255, col[1] * 1.12), Math.min(255, col[2] * 1.1)]);
    for (let L = Math.ceil((lo - off) / step) * step + off; L < hi; L += step) {
      const pts = [];
      for (let k = 0; k < 4; k++) {
        const p = P[k], q = P[(k + 1) % 4];
        if ((p[2] - L) * (q[2] - L) < 0) { const f = (L - p[2]) / (q[2] - p[2]); pts.push(proj(p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f, L)); }
      }
      if (pts.length < 2) continue;
      c.lineWidth = 0.55; c.strokeStyle = dark; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); c.lineTo(pts[1][0], pts[1][1]); if (pts.length === 4) { c.moveTo(pts[2][0], pts[2][1]); c.lineTo(pts[3][0], pts[3][1]); } c.stroke();
      c.lineWidth = 0.4; c.strokeStyle = lite; c.beginPath(); c.moveTo(pts[0][0], pts[0][1] + 0.6); c.lineTo(pts[1][0], pts[1][1] + 0.6); c.stroke();
    }
    // loose stones at the foot of the face
    c.fillStyle = G.rgb([col[0] * 0.8, col[1] * 0.78, col[2] * 0.76]);
    for (let k = 0; k < 2; k++) { const u = 0.2 + G.hash(i * 7 + k) * 0.6, v = 0.2 + G.hash(i * 11 + k) * 0.6; const px = x + u, py = y + v; const p = proj(px, py, W.hAt(px, py)); c.fillRect(p[0] - 0.6, p[1] - 0.4, 1.3, 0.8); }
  }
  // where a mountain river or a lake steps down: falls and rapids facing the camera, and wet banks
  function waterSteps(c, x, y, i, lv) {
    const S = G.S; const H = S.H; const V = N + 1;
    const cd = depth(x + 0.5, y + 0.5);
    const NB = [[1, 0, x + 1, y, x + 1, y + 1], [-1, 0, x, y, x, y + 1], [0, 1, x, y + 1, x + 1, y + 1], [0, -1, x, y, x + 1, y]];
    for (const [dx, dy, ax, ay, bx, by] of NB) {
      const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny)) continue;
      if (depth(nx + 0.5, ny + 0.5) >= cd) continue; // only edges at the back of this tile are seen
      const j = ny * N + nx; const nt = S.type[j];
      const ha = H[ay * V + ax], hb = H[by * V + bx];
      let top;
      if (nt === T.RIVER && S.wl[j] > lv + 0.05) top = S.wl[j];
      else if (nt >= T.SAND && Math.max(ha, hb) > lv + 0.05) top = null;
      else continue;
      const a0 = proj(ax, ay, lv), b0 = proj(bx, by, lv);
      if (top !== null) {
        const a1 = proj(ax, ay, top), b1 = proj(bx, by, top); const dh = top - lv;
        if (dh < 0.3) { // a gentle step: just a brighter lip on the water
          c.fillStyle = 'rgba(150,215,230,0.9)'; c.beginPath(); c.moveTo(a1[0], a1[1]); c.lineTo(b1[0], b1[1]); c.lineTo(b0[0], b0[1]); c.lineTo(a0[0], a0[1]); c.closePath(); c.fill();
          continue;
        }
        const big = dh > 0.8;
        const g = c.createLinearGradient(0, Math.min(a1[1], b1[1]), 0, Math.max(a0[1], b0[1]));
        g.addColorStop(0, big ? '#e8f6fb' : '#cdeaf2'); g.addColorStop(0.6, big ? '#b8e2f0' : '#a9d8e6'); g.addColorStop(1, '#f4fbff');
        c.fillStyle = g; c.beginPath(); c.moveTo(a1[0], a1[1]); c.lineTo(b1[0], b1[1]); c.lineTo(b0[0], b0[1]); c.lineTo(a0[0], a0[1]); c.closePath(); c.fill();
        c.fillStyle = big ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)'; c.beginPath(); c.ellipse((a0[0] + b0[0]) / 2, (a0[1] + b0[1]) / 2, big ? 8 : 5, big ? 2.2 : 1.4, 0, 0, TAU); c.fill();
      } else {
        const a1 = proj(ax, ay, Math.max(lv, ha)), b1 = proj(bx, by, Math.max(lv, hb));
        c.fillStyle = '#6a6052'; c.beginPath(); c.moveTo(a1[0], a1[1]); c.lineTo(b1[0], b1[1]); c.lineTo(b0[0], b0[1]); c.lineTo(a0[0], a0[1]); c.closePath(); c.fill();
      }
    }
  }
  // ------------------------------ the sea: a floor under clear water ------------------------------
  // The bottom is the land going on under the water, at its own heights, seen through the water: clear at
  // the beach and thicker as it deepens — turquoise in the warm seas, grey-green in the cold ones.
  // (The water is mixed into the colours as they are painted, so the cached picture has no seams of glass.)
  const CORAL = [[236, 112, 138], [246, 150, 76], [160, 104, 196], [238, 214, 92], [92, 196, 176], [226, 190, 140], [250, 120, 96]];
  function drawSea(c, x, y, i) {
    const S = G.S, H = S.H, V = N + 1, SEA = G.SEA, Sea = G.Sea;
    const top = SEA + 0.04, hv = v => (H[v] < top ? H[v] : top);
    const h00 = hv(y * V + x), h10 = hv(y * V + x + 1), h11 = hv((y + 1) * V + x + 1), h01 = hv((y + 1) * V + x);
    const a = proj(x, y, h00), b = proj(x + 1, y, h10), d = proj(x + 1, y + 1, h11), e = proj(x, y + 1, h01);
    const look = Sea.look(i, dLand[i]), al = look[1];
    const gx = ((h10 + h11) - (h00 + h01)) / 2, gy = ((h01 + h11) - (h00 + h10)) / 2;
    const vx = rot === 0 ? gx : rot === 1 ? -gy : rot === 2 ? -gx : gy, vy = rot === 0 ? gy : rot === 1 ? gx : rot === 2 ? -gy : -gx;
    const lt = G.clamp(1 + vx * 0.16 + vy * 0.06, 0.72, 1.25), jit = (G.hash(i * 3 + 1) - 0.5) * 8;
    // (deeper, the bottom loses its light)
    const fc = G.lerpColor(Sea.floorCol(i), [44, 74, 96], look[2] * 0.7); const base = [fc[0] * lt + jit, fc[1] * lt + jit, fc[2] * lt + jit * 0.6];
    // (the bottom in its own colours: the glass laid over the chunk brings the water)
    const tint = (col, less, alpha) => (alpha === undefined ? G.rgb(col) : G.rgb(col, alpha));
    const fill = tint(base);
    c.fillStyle = fill; c.strokeStyle = fill; c.lineWidth = 0.7;
    c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(d[0], d[1]); c.lineTo(e[0], e[1]); c.closePath(); c.fill(); c.stroke();
    if (al > 0.9) return; // too deep to see anything
    const fh = (u, v) => { const px = x + u, py = y + v; const h = W.hAt(px, py); return h < top ? h : top; };
    const pt = (u, v) => proj(x + u, y + v, fh(u, v));
    const r = k => G.hash(i * 17 + k * 7);
    const f = Sea.floor[i], F = Sea.F;
    if (f === F.SAND || f === F.HOLE || f === F.MUD) {
      // ripples the waves leave in the sand, a shell or two
      c.lineWidth = 0.5; c.strokeStyle = tint([base[0] * 0.86, base[1] * 0.84, base[2] * 0.8]);
      c.beginPath();
      for (let k = 0; k < 3; k++) {
        const v = 0.2 + k * 0.28 + r(k) * 0.08, u0 = 0.1 + r(k + 3) * 0.2, u1 = 0.7 + r(k + 5) * 0.2;
        const p0 = pt(u0, v), pm = pt((u0 + u1) / 2, v + 0.07), p1 = pt(u1, v);
        c.moveTo(p0[0], p0[1]); c.quadraticCurveTo(pm[0], pm[1], p1[0], p1[1]);
      }
      c.stroke();
      if (r(9) < 0.3) { const p = pt(0.2 + r(10) * 0.6, 0.2 + r(11) * 0.6); c.fillStyle = tint([246, 236, 222], 0.15); c.fillRect(p[0] - 0.6, p[1] - 0.3, 1.2, 0.7); }
    } else if (f === F.ROCK) {
      // boulders, with weed on them
      for (let k = 0; k < 3; k++) {
        if (r(k) < 0.25) continue;
        const p = pt(0.15 + r(k + 4) * 0.7, 0.15 + r(k + 8) * 0.7), w = 1.6 + r(k + 12) * 2.2;
        c.fillStyle = tint([base[0] * 0.7, base[1] * 0.7, base[2] * 0.72]); c.beginPath(); c.ellipse(p[0], p[1], w, w * 0.6, 0, 0, TAU); c.fill();
        c.fillStyle = tint([Math.min(255, base[0] * 1.15), Math.min(255, base[1] * 1.15), Math.min(255, base[2] * 1.12)]); c.beginPath(); c.ellipse(p[0] - w * 0.25, p[1] - w * 0.22, w * 0.5, w * 0.26, 0, 0, TAU); c.fill();
        if (r(k + 20) < 0.6) { c.fillStyle = tint([84, 120, 64]); c.fillRect(p[0] - w * 0.4, p[1] - w * 0.55, w * 0.5, 0.7); }
      }
    } else if (f === F.GRASS) {
      // a meadow of sea grass, leaning with the current
      c.lineWidth = 0.55; c.strokeStyle = tint([70, 128, 58], 0.1);
      c.beginPath();
      for (let k = 0; k < 9; k++) { const p = pt(0.08 + r(k) * 0.84, 0.08 + r(k + 30) * 0.84); const ln = 1.6 + r(k + 60) * 1.6; c.moveTo(p[0], p[1]); c.quadraticCurveTo(p[0] + 0.6, p[1] - ln * 0.6, p[0] + 1.3, p[1] - ln); }
      c.stroke();
    } else if (f === F.REEF) {
      // corals: round brain corals, branching ones, sea fans — the colours only the shallows keep
      const n = 5 + Math.floor(r(1) * 4);
      for (let k = 0; k < n; k++) {
        const p = pt(0.1 + r(k + 2) * 0.8, 0.1 + r(k + 40) * 0.8), col = CORAL[Math.floor(r(k + 80) * CORAL.length)], kind = r(k + 120), s = 1 + r(k + 160) * 1.3;
        if (kind < 0.4) {
          c.fillStyle = tint(col, 0.22); c.beginPath(); c.ellipse(p[0], p[1] - s * 0.6, s * 1.6, s * 1.1, 0, 0, TAU); c.fill();
          c.strokeStyle = tint([col[0] * 0.75, col[1] * 0.75, col[2] * 0.75], 0.22); c.lineWidth = 0.4; c.beginPath(); c.moveTo(p[0] - s, p[1] - s * 0.6); c.quadraticCurveTo(p[0], p[1] - s * 1.4, p[0] + s, p[1] - s * 0.5); c.stroke();
        } else if (kind < 0.75) {
          c.strokeStyle = tint(col, 0.22); c.lineWidth = 0.75; c.beginPath();
          c.moveTo(p[0], p[1]); c.lineTo(p[0], p[1] - s * 2.2); c.moveTo(p[0], p[1] - s); c.lineTo(p[0] - s * 1.1, p[1] - s * 2.4); c.moveTo(p[0], p[1] - s * 1.3); c.lineTo(p[0] + s * 1.2, p[1] - s * 2.6);
          c.stroke();
        } else {
          c.fillStyle = tint(col, 0.22, 0.9); c.beginPath(); c.moveTo(p[0], p[1]); c.arc(p[0], p[1], s * 2.4, -Math.PI * 0.85, -Math.PI * 0.15); c.closePath(); c.fill();
        }
      }
      // the white sand between them
      c.fillStyle = tint([236, 226, 200], 0.1); for (let k = 0; k < 3; k++) { const p = pt(r(k + 200), r(k + 210)); c.fillRect(p[0], p[1], 1.2, 0.6); }
    } else if (f === F.KELP) {
      // a kelp forest: stalks from the rocks to the light, the fronds floating on top
      c.lineWidth = 0.8;
      for (let k = 0; k < 4; k++) {
        const u = 0.12 + r(k) * 0.76, v = 0.12 + r(k + 9) * 0.76, p = pt(u, v), q = proj(x + u + 0.08, y + v - 0.05, SEA);
        const gr = c.createLinearGradient(0, p[1], 0, q[1]); gr.addColorStop(0, tint([96, 92, 44], 0)); gr.addColorStop(1, G.rgb([120, 112, 52]));
        c.strokeStyle = gr; c.beginPath(); c.moveTo(p[0], p[1]); c.bezierCurveTo(p[0] + 1.5, (p[1] * 2 + q[1]) / 3, q[0] - 1.5, (p[1] + q[1] * 2) / 3, q[0], q[1]); c.stroke();
        c.fillStyle = 'rgba(128,116,54,0.85)'; c.beginPath(); c.ellipse(q[0] + 1, q[1], 2.4, 0.9, 0.2, 0, TAU); c.fill();
      }
    }
    // the light the waves focus on a clear bottom
    if (al < 0.6) {
      c.strokeStyle = `rgba(255,255,236,${(0.6 - al) * 0.4})`; c.lineWidth = 0.45; c.beginPath();
      for (let k = 0; k < 2; k++) {
        const v = 0.25 + k * 0.45 + r(k + 300) * 0.1;
        const p0 = pt(0.05, v), p1 = pt(0.35, v - 0.12), p2 = pt(0.65, v + 0.1), p3 = pt(0.95, v - 0.05);
        c.moveTo(p0[0], p0[1]); c.bezierCurveTo(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
      }
      c.stroke();
    }
  }
  function drawTile(c, x, y) {
    const S = G.S; const i = y * N + x; const t = S.type[i];
    if (t === T.DEEP) return; // (the open sea is the ocean picture under the world; its glass blends into it)
    const V = N + 1; const H = S.H;
    if (t === T.SEA && G.Sea && G.Sea.floor) { drawSea(c, x, y, i); if (S.road[i]) drawBridge(c, x, y, i); return; }
    if (t <= T.RIVER) {
      const hh = t === T.RIVER ? S.wl[i] : G.SEA;
      const a = proj(x, y, hh), b = proj(x + 1, y, hh), d = proj(x + 1, y + 1, hh), e = proj(x, y + 1, hh);
      let col;
      if (t === T.RIVER) {
        // lakes deepen toward their middle
        let wn = 0; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny) || S.type[ny * N + nx] <= T.RIVER) wn++; }
        col = G.lerpColor(COL.river, [52, 132, 176], G.clamp((wn - 11) / 13, 0, 1)).map(v => v + (G.hash(i) - 0.5) * 6);
      } else col = WATER[Math.min(4, Math.max(0, dLand[i] - 1))].slice();
      const f = G.rgb(col);
      c.fillStyle = f; c.strokeStyle = f; c.lineWidth = 0.7;
      c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(d[0], d[1]); c.lineTo(e[0], e[1]); c.closePath(); c.fill(); c.stroke();
      if (t === T.RIVER) waterSteps(c, x, y, i, hh);
      // hint of the sea floor near shores
      if (dLand[i] === 1 && t !== T.RIVER) {
        c.fillStyle = 'rgba(255,245,210,0.13)';
        for (let k = 0; k < 3; k++) { const u = G.hash(i * 5 + k), v = G.hash(i * 11 + k); const p = proj(x + u, y + v, hh); c.fillRect(p[0], p[1], 1.4, 0.7); }
      }
      if (S.road[i]) drawBridge(c, x, y, i);
      return;
    }
    const h00 = H[y * V + x], h10 = H[y * V + x + 1], h11 = H[(y + 1) * V + x + 1], h01 = H[(y + 1) * V + x];
    const a = proj(x, y, h00), b = proj(x + 1, y, h10), d = proj(x + 1, y + 1, h11), e = proj(x, y + 1, h01);
    const gx = ((h10 + h11) - (h00 + h01)) / 2, gy = ((h01 + h11) - (h00 + h10)) / 2;
    const vx = rot === 0 ? gx : rot === 1 ? -gy : rot === 2 ? -gx : gy, vy = rot === 0 ? gy : rot === 1 ? gx : rot === 2 ? -gy : -gx;
    const hmn = Math.min(h00, h10, h11, h01), hmx = Math.max(h00, h10, h11, h01), rg = hmx - hmn;
    const steep = rg > G.Relief.STEEP && S.burnt[i] <= 0 && S.scar[i] <= 0;
    const light = steep ? G.clamp(1 + vx * 0.085 + vy * 0.03, 0.5, 1.34) : G.clamp(1 + vx * 0.13 + vy * 0.045, 0.62, 1.28);
    let base = tileColor(i, x, y);
    if (steep) base = rockColor(i, base, rg);
    else if (rg > 0.9 && (t === T.GRASS || t === T.MEADOW)) base = G.lerpColor(base, [142, 128, 104], G.clamp((rg - 0.9) / 0.8, 0, 1) * 0.35);
    const col = [base[0] * light, base[1] * light, base[2] * light];
    const f = G.rgb(col);
    c.fillStyle = f; c.strokeStyle = f; c.lineWidth = 0.7;
    c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(d[0], d[1]); c.lineTo(e[0], e[1]); c.closePath(); c.fill(); c.stroke();
    if (steep) { strata(c, x, y, i, h00, h10, h11, h01, col); if (!S.road[i]) return; }
    if (S.road[i] && S.burnt[i] <= 0 && S.scar[i] <= 0) { drawRoad(c, x, y, i, S.road[i], light); return; }
    // details
    const lv = G.pathLevel(S.wear[i]);
    const burnt = S.burnt[i] > 0 || S.scar[i] > 0;
    const pt = (u, v) => { const px = x + u, py = y + v; return proj(px, py, W.hAt(px, py)); };
    if (burnt) {
      c.fillStyle = S.scar[i] > 0 ? 'rgba(30,20,15,0.5)' : 'rgba(120,115,110,0.5)';
      for (let k = 0; k < 5; k++) { const p = pt(0.1 + G.hash(i * 3 + k) * 0.8, 0.1 + G.hash(i * 13 + k) * 0.8); c.fillRect(p[0], p[1], 1.1, 0.6); }
      if (S.scar[i] > 0) {
        c.strokeStyle = 'rgba(25,15,10,0.55)'; c.lineWidth = 0.5;
        const p = pt(0.2, 0.3), q2 = pt(0.5, 0.55), r2 = pt(0.8, 0.5);
        c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q2[0], q2[1]); c.lineTo(r2[0], r2[1]); c.stroke();
      }
      return;
    }
    const sty = S.temp && S.biome ? G.Biome.style(i) : 'grass';
    if ((t === T.GRASS || t === T.MEADOW) && sty !== 'grass' && sty !== 'taiga') {
      if (sty === 'snow') {
        // wind-carved snow: soft blue shadows and glints
        c.fillStyle = 'rgba(150,175,215,0.35)';
        for (let k = 0; k < 2; k++) { const p = pt(0.15 + G.hash(i * 17 + k) * 0.7, 0.15 + G.hash(i * 23 + k) * 0.7); c.beginPath(); c.ellipse(p[0], p[1], 2.4, 0.7, 0, 0, TAU); c.fill(); }
        c.fillStyle = 'rgba(255,255,255,0.9)';
        for (let k = 0; k < 3; k++) { const p = pt(0.1 + G.hash(i * 41 + k) * 0.8, 0.1 + G.hash(i * 43 + k) * 0.8); c.fillRect(p[0], p[1], 0.7, 0.7); }
        if (G.hash(i * 7) < 0.12) { c.strokeStyle = 'rgba(110,120,90,0.7)'; c.lineWidth = 0.5; const p = pt(0.5, 0.5); c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(p[0] - 0.8, p[1] - 1.8); c.moveTo(p[0], p[1]); c.lineTo(p[0] + 0.7, p[1] - 1.6); c.stroke(); }
      } else if (sty === 'swamp') {
        // puddles of dark water and reeds
        if (G.hash(i * 5) < 0.55) { const p = pt(0.3 + G.hash(i * 9) * 0.4, 0.3 + G.hash(i * 11) * 0.4); c.fillStyle = 'rgba(46,78,74,0.75)'; c.beginPath(); c.ellipse(p[0], p[1], 3.2 + G.hash(i) * 2, 1.4 + G.hash(i * 2) * 0.8, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(160,200,190,0.25)'; c.beginPath(); c.ellipse(p[0] - 0.8, p[1] - 0.3, 1.2, 0.4, 0, 0, TAU); c.fill(); }
        c.strokeStyle = 'rgba(70,90,40,0.9)'; c.lineWidth = 0.6;
        for (let k = 0; k < 4; k++) { const p = pt(0.1 + G.hash(i * 17 + k) * 0.8, 0.1 + G.hash(i * 29 + k) * 0.8); c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(p[0] + 0.3, p[1] - 3.2); c.moveTo(p[0] + 0.8, p[1]); c.lineTo(p[0] + 1.3, p[1] - 2.6); c.stroke(); if (G.hash(i * 31 + k) < 0.3) { c.fillStyle = '#6a4a2a'; c.fillRect(p[0] + 0.1, p[1] - 3.8, 0.7, 1.4); } }
      } else if (sty === 'savanna') {
        c.strokeStyle = 'rgba(150,120,50,0.7)'; c.lineWidth = 0.55;
        for (let k = 0; k < 5; k++) { const p = pt(0.1 + G.hash(i * 17 + k) * 0.8, 0.1 + G.hash(i * 23 + k) * 0.8); c.beginPath(); c.moveTo(p[0], p[1]); c.quadraticCurveTo(p[0] - 0.3, p[1] - 2, p[0] + 0.6, p[1] - 3.4); c.moveTo(p[0] + 0.5, p[1]); c.quadraticCurveTo(p[0] + 0.8, p[1] - 1.6, p[0] + 1.6, p[1] - 2.6); c.stroke(); }
      } else if (sty === 'jungle') {
        for (let k = 0; k < 4; k++) {
          const p = pt(0.12 + G.hash(i * 17 + k) * 0.76, 0.12 + G.hash(i * 23 + k) * 0.76);
          c.fillStyle = G.hash(i * 37 + k) < 0.5 ? 'rgba(30,90,30,0.75)' : 'rgba(90,170,60,0.7)';
          c.beginPath(); c.ellipse(p[0] - 1, p[1] - 1, 1.6, 0.6, -0.6, 0, TAU); c.ellipse(p[0] + 1, p[1] - 1.1, 1.6, 0.6, 0.6, 0, TAU); c.fill();
        }
        if (S.bloom[i] > 0 || G.hash(i * 61) < 0.08) { const p = pt(0.5, 0.4); c.fillStyle = G.hash(i) < 0.5 ? '#ff5a8a' : '#ffb13a'; c.beginPath(); c.arc(p[0], p[1] - 1, 0.9, 0, TAU); c.fill(); }
      }
    } else if (t === T.GRASS || t === T.MEADOW) {
      if (lv < 2) {
        const n = lv ? 2 : 4;
        for (let k = 0; k < n; k++) {
          const p = pt(0.12 + G.hash(i * 17 + k) * 0.76, 0.12 + G.hash(i * 23 + k) * 0.76);
          const dark = G.hash(i + k * 31) < 0.6;
          c.strokeStyle = dark ? G.rgb([col[0] * 0.78, col[1] * 0.82, col[2] * 0.75]) : G.rgb([Math.min(255, col[0] * 1.15), Math.min(255, col[1] * 1.12), col[2] * 1.05]);
          c.lineWidth = 0.55;
          c.beginPath(); c.moveTo(p[0] - 0.9, p[1]); c.lineTo(p[0] - 1.3, p[1] - 1.8); c.moveTo(p[0], p[1]); c.lineTo(p[0], p[1] - 2.4); c.moveTo(p[0] + 0.9, p[1]); c.lineTo(p[0] + 1.4, p[1] - 1.7); c.stroke();
        }
      }
      const flowers = (t === T.MEADOW && lv === 0 ? 3 : 0) + (S.bloom[i] > 0 ? 9 : 0);
      const FC = ['#ffffff', '#ffe066', '#ff8fb3', '#b99cff', '#ff7a5a'];
      for (let k = 0; k < flowers; k++) {
        const p = pt(0.1 + G.hash(i * 41 + k) * 0.8, 0.1 + G.hash(i * 43 + k) * 0.8);
        c.fillStyle = FC[Math.floor(G.hash(i * 47 + k) * FC.length)];
        c.beginPath(); c.arc(p[0], p[1] - 0.8, 0.75, 0, TAU); c.fill();
      }
    } else if (t === T.SAND && sty === 'dune') {
      // wind ripples on the dunes
      c.strokeStyle = 'rgba(190,150,90,0.55)'; c.lineWidth = 0.5;
      for (let k = 0; k < 3; k++) { const v = 0.2 + k * 0.28 + (G.hash(i * 3 + k) - 0.5) * 0.08; const p0 = pt(0.05, v), p1 = pt(0.5, v - 0.08), p2 = pt(0.95, v + 0.02); c.beginPath(); c.moveTo(p0[0], p0[1]); c.quadraticCurveTo(p1[0], p1[1] - 0.8, p2[0], p2[1]); c.stroke(); }
      if (G.hash(i * 91) < 0.05) { const p = pt(0.5, 0.5); c.fillStyle = '#e8dcc4'; c.fillRect(p[0] - 1, p[1] - 0.5, 2, 0.8); }
    } else if (t === T.SAND) {
      c.fillStyle = 'rgba(160,130,80,0.35)';
      for (let k = 0; k < 5; k++) { const p = pt(0.1 + G.hash(i * 3 + k) * 0.8, 0.1 + G.hash(i * 7 + k) * 0.8); c.fillRect(p[0], p[1], 0.8, 0.5); }
      if (G.hash(i * 91) < 0.08) { const p = pt(0.5, 0.5); c.fillStyle = '#fff4e4'; c.beginPath(); c.arc(p[0], p[1], 0.8, 0, TAU); c.fill(); }
    } else if (t === T.ROCKY) {
      for (let k = 0; k < 3; k++) {
        const p = pt(0.15 + G.hash(i * 3 + k) * 0.7, 0.15 + G.hash(i * 5 + k) * 0.7);
        c.fillStyle = 'rgba(95,90,82,0.6)'; c.beginPath(); c.ellipse(p[0] + 0.3, p[1] + 0.2, 1.3, 0.7, 0, 0, TAU); c.fill();
        c.fillStyle = 'rgba(200,196,186,0.8)'; c.beginPath(); c.ellipse(p[0], p[1], 1.1, 0.55, 0, 0, TAU); c.fill();
      }
      if (G.hash(i * 19) < 0.5) {
        c.fillStyle = 'rgba(110,150,80,0.6)';
        for (let k = 0; k < 3; k++) { const p = pt(0.2 + G.hash(i * 29 + k) * 0.6, 0.2 + G.hash(i * 37 + k) * 0.6); c.fillRect(p[0], p[1] - 1.5, 0.6, 1.5); }
      }
    }
    if (lv >= 2) {
      c.fillStyle = 'rgba(120,95,65,0.35)';
      for (let k = 0; k < 3; k++) { const p = pt(0.2 + G.hash(i * 53 + k) * 0.6, 0.2 + G.hash(i * 59 + k) * 0.6); c.fillRect(p[0], p[1], 1, 0.6); }
    }
  }
  // ------------------------------ streets, highways, bridges ------------------------------
  const ROADCOL = [null, [184, 164, 128], [190, 182, 164], [146, 142, 134]];
  function drawRoad(c, x, y, i, rd, light) {
    const S = G.S;
    const pt = (u, v, lift) => { const px = x + u, py = y + v; return proj(px, py, W.hAt(px, py) + (lift || 0)); };
    const quad = (u0, v0, u1, v1, col) => { const p0 = pt(u0, v0, 0.02), p1 = pt(u1, v0, 0.02), p2 = pt(u1, v1, 0.02), p3 = pt(u0, v1, 0.02); c.fillStyle = col; c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.lineTo(p2[0], p2[1]); c.lineTo(p3[0], p3[1]); c.closePath(); c.fill(); };
    const base = ROADCOL[rd].map(v => v * light);
    quad(0, 0, 1, 1, G.rgb(base));
    if (rd === 1) { // packed gravel
      c.fillStyle = G.rgb(base.map(v => v * 0.8));
      for (let k = 0; k < 7; k++) { const p = pt(0.1 + G.hash(i * 7 + k) * 0.8, 0.1 + G.hash(i * 13 + k) * 0.8); c.fillRect(p[0], p[1], 0.9, 0.5); }
      return;
    }
    // stones: a grid of pavers, each a slightly different shade
    const n = rd === 3 ? 3 : 4, g = 0.06;
    for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) {
      const off = rd === 2 && b % 2 ? 0.5 / n : 0;
      const u0 = a / n + off, v0 = b / n;
      if (u0 >= 1) continue;
      const sh = 0.86 + G.hash(i * 31 + a * 7 + b) * 0.2;
      quad(u0 + g / n, v0 + g / n, Math.min(1, u0 + 1 / n) - g / n, v0 + 1 / n - g / n, G.rgb(base.map(v => Math.min(255, v * sh * 1.04))));
    }
    if (rd === 3) { // highway kerbs where the road meets grass
      c.strokeStyle = G.rgb([200 * light, 196 * light, 186 * light]); c.lineWidth = 0.7;
      for (const [dx, dy, u0, v0, u1, v1] of [[1, 0, 1, 0, 1, 1], [-1, 0, 0, 0, 0, 1], [0, 1, 0, 1, 1, 1], [0, -1, 0, 0, 1, 0]]) {
        const nx = x + dx, ny = y + dy; if (W.inb(nx, ny) && S.road[ny * N + nx]) continue;
        const p0 = pt(u0, v0, 0.05), p1 = pt(u1, v1, 0.05); c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.stroke();
      }
    }
  }
  function drawBridge(c, x, y, i) {
    const S = G.S; const hh = S.wl[i] + 0.45; const wh = S.wl[i];
    const alongX = (W.inb(x - 1, y) && S.road[y * N + x - 1]) || (W.inb(x + 1, y) && S.road[y * N + x + 1]) || (W.inb(x - 1, y) && S.type[y * N + x - 1] >= T.SAND && W.inb(x + 1, y) && S.type[y * N + x + 1] >= T.SAND);
    const p = (u, v, z) => proj(x + u, y + v, hh + (z || 0));
    const deck = (col, z) => { const a = p(0, 0, z), b = p(1, 0, z), d = p(1, 1, z), e = p(0, 1, z); c.fillStyle = col; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(d[0], d[1]); c.lineTo(e[0], e[1]); c.closePath(); c.fill(); };
    // shadow on the water, the deck and its parapets
    c.fillStyle = 'rgba(20,50,70,0.35)'; { const a = proj(x + 0.1, y + 0.3, wh), b = proj(x + 1.1, y + 0.3, wh), d = proj(x + 1.1, y + 1.2, wh), e = proj(x + 0.1, y + 1.2, wh); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(d[0], d[1]); c.lineTo(e[0], e[1]); c.fill(); }
    deck('#9a8c78', 0);
    c.strokeStyle = 'rgba(60,50,40,0.35)'; c.lineWidth = 0.4;
    for (let k = 1; k < 5; k++) { const f = k / 5; const a = alongX ? p(f, 0) : p(0, f), b = alongX ? p(f, 1) : p(1, f); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
    c.strokeStyle = '#c8bca6'; c.lineWidth = 1.1;
    const rails = alongX ? [[0, 0.04, 1, 0.04], [0, 0.96, 1, 0.96]] : [[0.04, 0, 0.04, 1], [0.96, 0, 0.96, 1]];
    for (const [u0, v0, u1, v1] of rails) { const a = p(u0, v0, 1.1), b = p(u1, v1, 1.1); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
    // arch under the front edge
    const ed = alongX ? (depth(x + 0.5, y + 1) > depth(x + 0.5, y) ? [[0, 1], [1, 1]] : [[0, 0], [1, 0]]) : (depth(x + 1, y + 0.5) > depth(x, y + 0.5) ? [[1, 0], [1, 1]] : [[0, 0], [0, 1]]);
    c.fillStyle = '#7e725f'; const f0 = p(ed[0][0], ed[0][1], 0), f1 = p(ed[1][0], ed[1][1], 0);
    c.beginPath(); c.moveTo(f0[0], f0[1]); c.lineTo(f1[0], f1[1]); c.lineTo(f1[0], f1[1] + 2.2); c.quadraticCurveTo((f0[0] + f1[0]) / 2, (f0[1] + f1[1]) / 2 - 0.5, f0[0], f0[1] + 2.2); c.closePath(); c.fill();
  }
  function buildShore() {
    const S = G.S; shore = []; shoreRiver = [];
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const i = y * N + x; if (S.type[i] > T.RIVER) continue;
      const river = S.type[i] === T.RIVER;
      const edges = [[1, 0, x + 1, y, x + 1, y + 1], [-1, 0, x, y + 1, x, y], [0, 1, x + 1, y + 1, x, y + 1], [0, -1, x, y, x + 1, y]];
      for (const [dx, dy, ax, ay, bx, by] of edges) {
        const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny)) continue;
        if (S.type[ny * N + nx] >= T.SAND) (river ? shoreRiver : shore).push([ax, ay, bx, by, -dx, -dy, river ? S.wl[i] : G.SEA]);
      }
    }
  }
  R.rebuildShore = buildShore;

  // ------------------------------ ambient light ------------------------------
  const AMB = [[0, [225, 186, 176]], [0.05, [255, 226, 206]], [0.12, [255, 255, 255]], [0.56, [255, 252, 244]], [0.63, [255, 216, 172]], [0.69, [232, 172, 140]], [0.725, [150, 138, 172]], [0.765, [104, 114, 172]], [0.965, [100, 110, 168]], [1.0, [225, 186, 176]]];
  function ambient() {
    const S = G.S; const t = S.time;
    let c = AMB[0][1];
    for (let k = 0; k < AMB.length - 1; k++) {
      if (t >= AMB[k][0] && t <= AMB[k + 1][0]) { c = G.lerpColor(AMB[k][1], AMB[k + 1][1], (t - AMB[k][0]) / (AMB[k + 1][0] - AMB[k][0])); break; }
    }
    const w = S.weather;
    if (w.rain > 0.05) c = G.lerpColor(c, [c[0] * 0.66, c[1] * 0.7, c[2] * 0.8], Math.min(1, w.rain * 1.2));
    if (w.drought > 0) c = G.lerpColor(c, [c[0], c[1] * 0.95, c[2] * 0.85], 0.6);
    return c;
  }
  R.ambient = ambient;
  R.nightness = function () { const a = ambient(); return G.clamp(1 - (a[0] + a[1] + a[2]) / 3 / 255, 0, 1) / 0.58; };

  // ------------------------------ cosmetic life ------------------------------
  const birds = [], skyClouds = [];
  let birdT = 5;
  function initSky() {
    skyClouds.length = 0;
    for (let k = 0; k < 6; k++) skyClouds.push({ x: G.rr(-10, N + 10), y: G.rr(-10, N + 10), v: k % 3, s: G.rr(1.3, 2.2) });
  }
  R.initSky = initSky;
  function updateCosmetic(dt) {
    const S = G.S; const w = S.weather;
    const wx = Math.cos(w.windA) * (0.25 + w.windS * 0.6), wy = Math.sin(w.windA) * (0.25 + w.windS * 0.6);
    for (const c of skyClouds) {
      c.x += wx * dt; c.y += wy * dt;
      if (c.x > N + 16) c.x = -16; if (c.x < -16) c.x = N + 16; if (c.y > N + 16) c.y = -16; if (c.y < -16) c.y = N + 16;
    }
    birdT -= dt;
    if (birdT <= 0 && !G.isNight()) {
      birdT = G.rr(10, 25);
      const a = G.R() * TAU; const sx = N / 2 - Math.cos(a) * N * 0.8, sy = N / 2 - Math.sin(a) * N * 0.8;
      const n = G.ri(3, 7); const fl = [];
      for (let k = 0; k < n; k++) fl.push([Math.floor((k + 1) / 2) * 0.6, (k % 2 ? 1 : -1) * Math.floor((k + 1) / 2) * 0.5, G.R() * 6]);
      birds.push({ x: sx, y: sy, vx: Math.cos(a) * 2.2, vy: Math.sin(a) * 2.2, fl, t: 0 });
    }
    for (let k = birds.length - 1; k >= 0; k--) {
      const b = birds[k]; b.x += b.vx * dt; b.y += b.vy * dt; b.t += dt;
      if (b.t > 60) birds.splice(k, 1);
    }
  }

  // ------------------------------ main frame ------------------------------
  const drawList = []; let drawN = 0;
  const lights = []; // [sx, sy, r, color, a]
  const emisWin = []; const emisFire = []; const emisGlow = []; const emisTorch = []; const overlays = [];
  function pushD(d, type, o, sx, sy) {
    let e = drawList[drawN]; if (!e) { e = {}; drawList[drawN] = e; }
    e.d = d; e.t = type; e.o = o; e.sx = sx; e.sy = sy; drawN++;
  }
  function light(sx, sy, r, c, a) { lights.push(sx, sy, r, c, a); }
  R.lightAt = light;
  // other files draw their own things: on the ground, or sorted among the people
  const HK = G.renderHooks = G.renderHooks || { ground: [], ents: [] };
  HK.air = HK.air || []; HK.screen = HK.screen || []; // above the people (mist, fireflies) and on the glass (sun rays, rainbows)
  const FXA = { light, glow: (sx, sy, r, c, a) => emisGlow.push(sx, sy, r, c, a), fire: (sx, sy, f) => emisFire.push(sx, sy, f), torch: (sx, sy) => emisTorch.push(sx, sy), overlay: (o, sx, sy) => overlays.push(o, sx, sy) };
  R.fxApi = FXA;

  R.update = function (dt, gdt) {
    const cam = R.cam;
    // follow selected
    if (cam.follow) {
      const v = G.S.villagers.get(cam.follow) || G.S.animals.get(cam.follow) || G.S.ships.find(o => o.id === cam.follow);
      if (v) { const [sx, sy] = proj(v.x, v.y, v.ug ? UF() : W.groundH(v.x, v.y)); cam.x += (sx - cam.x) * Math.min(1, dt * 4); cam.y += (sy - 8 - cam.y) * Math.min(1, dt * 4); }
      else cam.follow = 0;
    } else if (cam.target) {
      cam.x += (cam.target[0] - cam.x) * Math.min(1, dt * 4); cam.y += (cam.target[1] - cam.y) * Math.min(1, dt * 4);
      if (Math.abs(cam.target[0] - cam.x) < 1 && Math.abs(cam.target[1] - cam.y) < 1) cam.target = null;
    }
    // smooth zoom around an anchor
    if (Math.abs(cam.tz - cam.zoom) > 0.0005) {
      const an = (!spin && cam.anchor) || [VW / 2, VH / 2]; // (while the world turns it turns around the middle)
      const before = R.screenToWorldPx(an[0], an[1]);
      cam.zoom += (cam.tz - cam.zoom) * Math.min(1, dt * 12);
      const after = R.screenToWorldPx(an[0], an[1]);
      if (!cam.follow) { cam.x += before[0] - after[0]; cam.y += before[1] - after[1]; }
    }
    cam.x = G.clamp(cam.x, -N * 16, N * 16);
    cam.y = G.clamp(cam.y, -60 - R.maxH * HS, N * 16 + 40);
    if (cam.shake > 0) cam.shake = Math.max(0, cam.shake - dt * 1.8);
    updateCosmetic(dt);
    if (gdt > 0) spawnAmbient(Math.min(gdt, 0.1));
  };

  const SMOKE = { house: 1, workshop: 1, sobrado: 1, insula: 1, quarteirao: 1, banhos: 1, hut: 1, forja: 1, olaria: 1 };
  const KILN = { workshop: 1, forja: 1, olaria: 1, ourives: 1 };
  const APRON = { monument: 1, temple: 1, palacio: 1, maravilha: 1, teatro: 1, biblioteca: 1, mercado: 1, banhos: 1 };
  const FIRELIT = { temple: 1, torre: 1, quartel: 1, maravilha: 1, praca: 1, palacio: 1 };
  function spawnAmbient(dt) {
    const S = G.S; const cam = R.cam; const t = R.time;
    const view = viewRect(80);
    const inView = (x, y) => { const [sx, sy] = proj(x, y, 2); return sx > view[0] && sx < view[2] && sy > view[1] && sy < view[3]; };
    const wx = Math.cos(S.weather.windA) * S.weather.windS, wy = Math.sin(S.weather.windA) * S.weather.windS;
    // fires
    for (const i of G.Nature.fireSet) {
      const x = (i % N) + 0.5, y = ((i / N) | 0) + 0.5; const f = S.fire[i];
      if (!inView(x, y)) continue;
      const tree = S.treeAt[i] > 0, bld = S.occ[i] > 0;
      const zb = tree ? 10 : bld ? 8 : 0;
      if (G.R() < dt * f * 22) FX_flame(x + G.rr(-0.35, 0.35), y + G.rr(-0.35, 0.35), zb + G.rr(0, 8), f);
      if (G.R() < dt * f * 4) G.FX.spawn({ x: x + G.rr(-0.3, 0.3), y: y + G.rr(-0.3, 0.3), z: zb + 12, vz: G.rr(14, 26), vx: wx * 0.8, vy: wy * 0.8, life: G.rr(2.2, 3.8), s0: 4, s1: 13, c: 'rgba(70,66,64,0.42)', k: 2, drag: 0.1 });
      if (G.R() < dt * f * 3) G.FX.spawn({ x, y, z: zb + 6, vz: G.rr(30, 60), vx: G.rr(-0.4, 0.4) + wx, vy: G.rr(-0.4, 0.4) + wy, g: -5, life: G.rr(1, 2), s0: 0.9, s1: 0.2, c: '#ffb050', k: 4, layer: 1 });
    }
    // chimneys & campfires
    const night = R.nightness();
    for (const b of S.buildings.values()) {
      if (!b.built || b.type === 'ruin') continue;
      const [cx, cy] = G.Village.center(b);
      if (!inView(cx, cy)) continue;
      if (b.type === 'campfire') {
        if (G.R() < dt * 1.3) G.FX.spawn({ x: cx + G.rr(-0.1, 0.1), y: cy + G.rr(-0.1, 0.1), z: 10, vz: G.rr(12, 22), vx: wx * 0.6, vy: wy * 0.6, life: G.rr(2, 3.5), s0: 3, s1: 9, c: 'rgba(150,150,150,0.3)', k: 2 });
        if (G.R() < dt * 2.2) G.FX.spawn({ x: cx, y: cy, z: 5, vz: G.rr(20, 45), vx: G.rr(-0.3, 0.3), vy: G.rr(-0.3, 0.3), life: G.rr(0.6, 1.4), s0: 0.9, s1: 0.2, c: '#ffc060', k: 4, layer: 1 });
      } else if (SMOKE[b.type] && (KILN[b.type] || b.type === 'banhos' || G.R() < 0.5 + night)) {
        const spr = G.Art.building(b.type, b.v, b.style, b.wd);
        const steam = b.type === 'banhos';
        if (spr && spr.fires.length && G.R() < dt * (KILN[b.type] ? 1.2 : steam ? 1.4 : 0.55 + night * 0.5)) {
          const h = W.groundH(cx, cy);
          const f = G.pick(spr.fires);
          // convert sprite-local px to world tile offset
          const wo = R.sprToWorld(f[0]), oz = -f[1];
          G.FX.spawn({ x: cx + wo[0], y: cy + wo[1], h, z: oz, vz: G.rr(10, 18), vx: wx * 0.5, vy: wy * 0.5, life: G.rr(2.5, 4), s0: 2.2, s1: steam ? 9 : 7, c: steam ? 'rgba(240,245,250,0.45)' : 'rgba(200,200,205,0.35)', k: 2 });
          if ((b.type === 'workshop' || b.type === 'forja') && G.R() < 0.3) G.FX.spawn({ x: cx + wo[0], y: cy + wo[1], h, z: oz, vz: G.rr(25, 45), vx: G.rr(-0.3, 0.3), vy: G.rr(-0.3, 0.3), life: 0.8, s0: 0.8, s1: 0.1, c: '#ffb040', k: 4, layer: 1 });
        }
      }
    }
    // rain from clouds
    for (const c of S.clouds) {
      if (!inView(c.x, c.y) && !inView(c.x + c.r, c.y) && !inView(c.x - c.r, c.y)) continue;
      const inten = G.Nature.cloudIntensity(c);
      const n = dt * c.r * c.r * 14 * inten * (c.kind === 'storm' ? 1.4 : 1);
      for (let k = 0; k < n; k++) {
        const a = G.R() * TAU, d = Math.sqrt(G.R()) * c.r;
        G.FX.spawn({ x: c.x + Math.cos(a) * d, y: c.y + Math.sin(a) * d, z: G.rr(60, 95), vz: -420, vx: wx * 1.2, vy: wy * 1.2, life: 1, s0: 1, c: 'rgba(190,215,240,0.55)', k: 3 });
      }
    }
    // meteors in flight
    for (const m of S.meteors) {
      const k = G.clamp(m.t / m.delay, 0, 1); const e = k * k;
      const off = 1 - e; // 1 far, 0 impact
      const dx = 300 * off, dz = 520 * off;
      if (k > 0.05) {
        for (let q = 0; q < 3; q++) G.FX.spawn({ x: m.x + dx / 32 + G.rr(-0.1, 0.1), y: m.y - dx / 32 + G.rr(-0.1, 0.1), z: dz + G.rr(-6, 6), vz: G.rr(-10, 30), vx: G.rr(-0.3, 0.3), vy: G.rr(-0.3, 0.3), life: G.rr(0.3, 0.8), s0: G.rr(3, 6), s1: 0.5, c: G.pick(['#ffdd88', '#ff9944', '#ff6622']), k: 1, layer: 1 });
        G.FX.spawn({ x: m.x + dx / 32, y: m.y - dx / 32, z: dz, vz: 5, life: G.rr(1.5, 2.5), s0: 6, s1: 16, c: 'rgba(80,70,65,0.45)', k: 2 });
      }
      if (m.t > m.delay - 1.4) R.shake(0.12);
    }
    // fireflies & butterflies near the camera
    if (G.R() < dt * 3) {
      const [tx, ty] = R.screenToTile(G.rr(0, VW), G.rr(0, VH));
      if (W.inb(tx, ty)) {
        const i = W.idx(tx, ty);
        if (S.type[i] >= T.GRASS && S.fire[i] === 0) {
          if (night > 0.55 && (S.treeAt[i] || S.type[i] === T.MEADOW)) G.FX.spawn({ x: tx, y: ty, z: G.rr(4, 14), vx: G.rr(-0.2, 0.2), vy: G.rr(-0.2, 0.2), vz: G.rr(-2, 2), life: G.rr(3, 6), s0: 1.6, s1: 1.2, c: '#d8ff7a', k: 1, layer: 1, fadeIn: 1 });
          else if (night < 0.2 && (S.type[i] === T.MEADOW || S.bloom[i] > 0) && S.weather.rain < 0.1) G.FX.spawn({ x: tx, y: ty, z: G.rr(3, 8), vx: G.rr(-0.3, 0.3), vy: G.rr(-0.3, 0.3), vz: G.rr(-3, 3), life: G.rr(3, 6), s0: 1.3, c: G.pick(['#fff3a0', '#ffffff', '#ffb0d0', '#a8d8ff']), k: 10 });
        }
      }
    }
    // spray rising from the waterfalls
    for (const fl of S.relief.falls || []) {
      if (!inView(fl.tx + 0.5, fl.ty + 0.5) || G.R() > dt * (1 + fl.drop * 0.4)) continue;
      G.FX.spawn({ x: fl.tx + 0.5 + G.rr(-0.3, 0.3), y: fl.ty + 0.5 + G.rr(-0.3, 0.3), h: S.wl[fl.ty * N + fl.tx], z: 2, vz: G.rr(6, 14), vx: G.rr(-0.2, 0.2), vy: G.rr(-0.2, 0.2), life: G.rr(1.5, 2.6), s0: 3, s1: 10, c: 'rgba(240,248,255,0.42)', k: 2 });
    }
    // fish jumping near the shore
    if (G.R() < dt * 0.5 && shore.length) {
      const s = G.pick(shore); const x = s[0] + s[4] * 1.3, y = s[1] + s[5] * 1.3;
      if (inView(x, y)) G.FX.spawn({ x, y, h: G.SEA, z: 0, vz: 55, g: 170, vx: G.rr(-0.5, 0.5), vy: G.rr(-0.5, 0.5), life: 0.65, s0: 1.5, c: '#bcd8e8', k: 11 });
    }
  }
  function FX_flame(x, y, z, f) {
    G.FX.spawn({ x, y, z, vz: G.rr(18, 36), vx: G.rr(-0.1, 0.1), vy: G.rr(-0.1, 0.1), life: G.rr(0.35, 0.7), s0: G.rr(4, 7) * (0.6 + f * 0.5), s1: 0.6, c: G.pick(['#ffcf5a', '#ff9a3a', '#ff6a2a']), k: 1, layer: 1 });
  }

  function viewRect(margin) {
    const cam = R.cam; const hw = VW / 2 / cam.zoom, hh = VH / 2 / cam.zoom;
    return [cam.x - hw - margin, cam.y - hh - margin, cam.x + hw + margin, cam.y + hh + margin + 40];
  }
  R.viewRect = viewRect;
  // the bigger the world, the further the god may pull back to see it whole
  R.minZoom = () => N >= 160 ? 0.3 : N >= 128 ? 0.38 : 0.55;

  R.dbg = {};
  R.showBorders = true;
  const rulerIds = new Set();
  const PROF = R.prof = { on: false, t: {}, mark(k, t0) { if (this.on) this.t[k] = (this.t[k] || 0) + performance.now() - t0; } };
  const now = () => performance.now();
  R.frame = function (dt) {
    const S = G.S; if (!S) return;
    if (R.needResize) { R.needResize = false; R.resize(); }
    let t0 = now();
    R.time += dt;
    const t = R.time;
    const cam = R.cam;
    // process dirty tiles/chunks (bounded work per frame; big maps: visible chunks first)
    frameNo++;
    updateSpin(dt);
    const zPx = cam.zoom * dpr, wantHi = !bigMap || (zPx > LRS * 1.05 && visCount <= HI_CAP);
    let nVis = 0;
    const lim = warm > 0 ? 40 : 8; if (warm > 0) warm--;
    if (spin) paintTarget(spin.hold ? 3 : 7);
    else if (!bigMap) {
      // pictures on show that changed: two a frame; pictures for this view still missing: by time
      let budget = 2; const vr = viewRect(40), tb = now();
      for (const ch of chunkOrder) if (ch.dirty && !(ch.sx > vr[2] || ch.sx + ch.w < vr[0] || ch.sy > vr[3] || ch.sy + ch.h < vr[1])) {
        if (ch.canvas && ch.rot === rot) { if (budget > 0) { renderChunk(ch, false); budget--; } }
        else if (now() - tb < lim) paintPart(ch, false, tb + lim);
      }
      for (const ch of chunkOrder) if (ch.dirty) {
        if (ch.canvas && ch.rot === rot) { if (budget > 0) { renderChunk(ch, false); budget--; } }
        else if (now() - tb < 3) paintPart(ch, false, tb + 3);
      }
    }
    else {
      const vr = viewRect(40), tb = now();
      for (const ch of chunkOrder) {
        if (ch.empty) continue;
        const vis = !(ch.sx > vr[2] || ch.sx + ch.w < vr[0] || ch.sy > vr[3] || ch.sy + ch.h < vr[1]);
        if (vis) { ch.seen = frameNo; nVis++; }
        if (now() - tb > lim) continue;
        if (vis && wantHi && ch.dirty) paintStep(ch, false, tb + lim);
        else if (ch.dirtyLo && (vis || now() - tb < 3)) paintStep(ch, true, tb + (vis ? lim : 3));
      }
      visCount = nVis; evictHi();
    }
    if (G.Nature.dirty.size && !spin) {
      let n = 0;
      for (const i of G.Nature.dirty) {
        const x = i % N, y = (i / N) | 0;
        redrawAround(x, y);
        G.Nature.dirty.delete(i);
        if (++n > 120) break;
      }
    }
    PROF.mark('dirty', t0); t0 = now();
    underT += dt;
    if (R.under && S.ug) { frameUnder(t, dt); return; }
    const nightF = G.clamp(R.nightness(), 0, 1);
    // ---------- background ----------
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const nq = Math.round(nightF * 40) / 40;
    const tt = S.time; const duskF = Math.round(20 * (tt > 0.58 && tt < 0.78 ? Math.sin((tt - 0.58) / 0.2 * Math.PI) : tt < 0.1 ? Math.sin(tt / 0.1 * Math.PI) * 0.8 : 0) * (1 - S.weather.rain)) / 20;
    if (nq !== R._bgN || duskF !== R._bgD || !R._bgC) {
      R._bgN = nq; R._bgD = duskF;
      const c = R._bgC || (R._bgC = document.createElement('canvas')); c.width = 2; c.height = 128;
      const x = c.getContext('2d');
      const dayTop = [214, 232, 236], dayBot = [150, 190, 204], nTop = [14, 20, 42], nBot = [30, 40, 70];
      const g = x.createLinearGradient(0, 0, 0, 128);
      g.addColorStop(0, G.rgb(G.lerpColor(G.lerpColor(dayTop, nTop, nq), [214, 140, 150], duskF * 0.75))); g.addColorStop(1, G.rgb(G.lerpColor(G.lerpColor(dayBot, nBot, nq), [246, 176, 110], duskF * 0.8)));
      x.fillStyle = g; x.fillRect(0, 0, 2, 128);
    }
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(R._bgC, 0, 0, 2, 128, 0, 0, canvas.width, canvas.height);
    if (nightF > 0.3) {
      ctx.fillStyle = '#fff';
      for (let k = 0; k < 90; k++) {
        const sx = G.hash(k * 3) * canvas.width, sy = G.hash(k * 7 + 1) * canvas.height;
        const a = (nightF - 0.3) * (0.4 + 0.6 * Math.abs(Math.sin(t * (0.5 + G.hash(k) * 2) + k)));
        ctx.globalAlpha = a * 0.8; ctx.fillRect(sx, sy, 1.5 * dpr, 1.5 * dpr);
      }
      ctx.globalAlpha = 1;
    }
    // ---------- world transform ----------
    const shx = cam.shake > 0 ? (Math.random() - 0.5) * cam.shake * 16 : 0;
    const shy = cam.shake > 0 ? (Math.random() - 0.5) * cam.shake * 16 : 0;
    const z = cam.zoom * dpr;
    const setWorld = (c, scale) => c.setTransform(z * scale, 0, 0, z * scale, (VW / 2 - (cam.x + shx) * cam.zoom) * dpr * scale, (VH / 2 - (cam.y + shy) * cam.zoom) * dpr * scale);
    setWorld(ctx, 1);
    const view = viewRect(60);
    // diorama shadow
    if (view[3] > N * 16 - 20) {
      ctx.save(); ctx.globalAlpha = 0.35 * (1 - nightF * 0.5);
      ctx.drawImage(G.Art.puff(), -N * 19, N * 16 - N * 3, N * 38, N * 10);
      ctx.restore();
    }
    if (!R.dbg.noBase) drawBase();
    // ocean base diamond
    ctx.fillStyle = R.DEEP;
    const o0 = proj(0, 0, G.SEA), o1 = proj(N, 0, G.SEA), o2 = proj(N, N, G.SEA), o3 = proj(0, N, G.SEA);
    ctx.beginPath(); ctx.moveTo(o0[0], o0[1]); ctx.lineTo(o1[0], o1[1]); ctx.lineTo(o2[0], o2[1]); ctx.lineTo(o3[0], o3[1]); ctx.closePath(); ctx.fill();
    drawOcean();
    PROF.mark('bg+base', t0); t0 = now();
    // terrain chunks (while the world turns: the terrain itself, at the angle of the moment)
    if (spin) drawSpinTerrain(view);
    else if (!R.dbg.noChunks) for (const ch of chunkOrder) {
      if (ch.empty) continue;
      if (ch.sx > view[2] || ch.sx + ch.w < view[0] || ch.sy > view[3] || ch.sy + ch.h < view[1]) continue;
      const hiOK = ch.canvas && ch.rot === rot, loOK = ch.lo && ch.loRot === rot;
      const cv = hiOK && ((wantHi && !ch.dirty) || !loOK) ? ch.canvas : loOK ? ch.lo : null;
      if (cv) ctx.drawImage(cv, ch.sx, ch.sy, ch.w, ch.h); else quadChunk(ch);
    }
    PROF.mark('chunks', t0); t0 = now();
    if (!R.dbg.noWater) { drawWater(t, view); G.Naval && G.Naval.drawWater(ctx, proj, t, view); }
    PROF.mark('water', t0); t0 = now();
    if (S.weather.drought > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(255,225,170,0.5)';
      ctx.beginPath(); ctx.moveTo(o0[0], o0[1] - 60); ctx.lineTo(o1[0] + 20, o1[1]); ctx.lineTo(o2[0], o2[1] + 20); ctx.lineTo(o3[0] - 20, o3[1]); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    // ---------- ground layer ----------
    lights.length = 0; emisWin.length = 0; emisFire.length = 0; emisGlow.length = 0; emisTorch.length = 0; overlays.length = 0;
    if (!R.dbg.noGround) drawGround(t, view, nightF);
    PROF.mark('ground', t0); t0 = now();
    // ---------- sorted entities ----------
    drawN = 0;
    const vis = (x, y, h) => { const p = proj(x, y, h); return (p[0] > view[0] && p[0] < view[2] && p[1] > view[1] && p[1] < view[3]) ? p : null; };
    for (const tr of S.trees.values()) { const p = vis(tr.x, tr.y, W.groundH(tr.x, tr.y)); if (p) pushD(depth(tr.x, tr.y), 1, tr, p[0], p[1]); }
    for (const r of S.rocks.values()) { const p = vis(r.x, r.y, W.groundH(r.x, r.y)); if (p) pushD(depth(r.x, r.y), 2, r, p[0], p[1]); }
    farLod = R.cam.zoom < 0.56; // whole-continent view: skip what would be a pixel or two
    if (!farLod) for (const b of S.bushes.values()) { const p = vis(b.x, b.y, W.groundH(b.x, b.y)); if (p) pushD(depth(b.x, b.y), 3, b, p[0], p[1]); }
    for (const b of S.buildings.values()) {
      if (b.type === 'farm') continue;
      const [cx, cy] = G.Village.center(b);
      const base = W.maxH(b.x, b.y, b.w, b.h);
      const p = proj(cx, cy, base);
      if (p[0] < view[0] - 60 || p[0] > view[2] + 60 || p[1] < view[1] - 30 || p[1] > view[3] + 140) continue;
      pushD(b.type === 'praca' ? depth(cx, cy) - (b.w + b.h) / 2 + 0.4 : depth(cx, cy) + (b.w + b.h) / 2 - 0.8, 4, b, p[0], p[1]);
    }
    // aqueduct arches, carts on the roads
    for (const a of S.aqueducts) for (let k = 0; k < a.built; k++) {
      const [x, y, d] = a.tiles[k]; const i = y * N + x;
      if (S.occ[i]) { const ob = S.buildings.get(S.occ[i]); if (ob && ob.blocks) continue; }
      const p = vis(x + 0.5, y + 0.5, W.groundH(x + 0.5, y + 0.5)); if (p) pushD(depth(x + 0.5, y + 0.5) + 0.05, 8, { d, x, y, st: a.style || (a.style = (G.Fac.get(a.fac) || {}).civ || 'classico') }, p[0], p[1]);
    }
    for (const c of S.carts) { const p = vis(c.x, c.y, W.groundH(c.x, c.y)); if (p) pushD(depth(c.x, c.y) + 0.03, 9, c, p[0], p[1]); }
    for (const s of S.ships) { const p = vis(s.x, s.y, W.groundH(s.x, s.y)); if (p) pushD(depth(s.x, s.y) + 0.3, 10, s, p[0], p[1]); }
    // city walls, gates and siege engines
    for (const w of S.walls) for (let k = 0; k < w.built; k++) {
      const i = w.tiles[k]; const wv = S.wall[i]; if (wv !== 1 && wv !== 2 && wv !== 4) continue;
      const x = i % N, y = (i / N) | 0; const p = vis(x + 0.5, y + 0.5, W.groundH(x + 0.5, y + 0.5)); if (p) pushD(depth(x + 0.5, y + 0.5), 11, { i, w }, p[0], p[1]);
    }
    for (const b of G.War.bands.values()) if (b.engines) for (const e of b.engines) { const p = vis(e.x, e.y, W.groundH(e.x, e.y)); if (p) pushD(depth(e.x, e.y) + 0.05, 12, e, p[0], p[1]); }
    const setHex = new Map(), setCiv = new Map(); for (const s of S.settlements.values()) { setHex.set(s.id, G.Fac.hex(s.fac)); const f = G.Fac.get(s.fac); setCiv.set(s.id, f ? f.civ : null); }
    rulerIds.clear(); for (const f of G.Fac.all()) if (f.leader) rulerIds.add(f.leader);
    for (const v of S.villagers.values()) { v.babyOn = null; v._fc = v.captive ? null : (setHex.get(v.set) || null); v._ruler = rulerIds.has(v.id); v._civ = v.captive ? v.civ : (setCiv.get(v.set) || v.civ || null); }
    for (const v of S.villagers.values()) if (v.age < 2 && v.carried) { const c = S.villagers.get(v.carrier); if (c) c.babyOn = v; }
    for (const v of S.villagers.values()) {
      if (v.inside || v.held || v.aboard || (v.age < 2 && v.carried)) continue;
      const p = vis(v.x, v.y, W.groundH(v.x, v.y)); if (p) pushD(depth(v.x, v.y) + 0.05, 5, v, p[0], p[1] - (v.z || 0));
    }
    for (const a of S.animals.values()) {
      if (a.held) continue; const sd = G.Animals.DEF[a.kind]; if (!sd) continue;
      if (sd.cls === 'air' && a.z > 4) continue; // flying birds get their own pass above everything
      const p = vis(a.x, a.y, W.groundH(a.x, a.y)); if (p) pushD(depth(a.x, a.y) + 0.04, 6, a, p[0], p[1] - (sd.cls === 'water' ? 0 : (a.z || 0)));
    }
    for (const b of S.boats) { const p = vis(b.x, b.y, W.groundH(b.x, b.y)); if (p) pushD(depth(b.x, b.y), 7, b, p[0], p[1]); }
    if (G.Caves && S.ug) {
      for (const cv of G.Caves.all()) for (const m of cv.mouths) { if (m.kind === 'mina') continue; const p = vis(m.x + 0.5, m.y + 0.5, W.groundH(m.x + 0.5, m.y + 0.5)); if (p) pushD(depth(m.x + 0.5, m.y + 0.5) - 0.3, 14, { cv, m }, p[0], p[1]); }
      for (const a of G.Caves.actors) { if (a.delay > 0) continue; const p = vis(a.x, a.y, W.groundH(a.x, a.y)); if (p) pushD(depth(a.x, a.y) + 0.05, 15, a, p[0], p[1]); }
    }
    // other modules give depths for the first view (x + y + offset): keep their offset, turn the rest
    if (HK.ents.length) { const add = (d, e, x, y, h) => { const p = proj(x, y, h === undefined ? W.groundH(x, y) : h); if (p[0] > view[0] - 70 && p[0] < view[2] + 70 && p[1] > view[1] - 20 && p[1] < view[3] + 120) pushD(rot ? depth(x, y) + (d - x - y) : d, 13, e, p[0], p[1]); }; for (const h of HK.ents) h(add, view, R.cam.zoom); }
    const list = drawList.slice(0, drawN).sort((a, b) => a.d - b.d);
    G.Art.px = R.cam.zoom * dpr;
    if (nightF > 0.15) { homesLit.clear(); for (const v of S.villagers.values()) if (v.home) homesLit.add(v.home); }
    // shadows first
    ctx.fillStyle = 'rgba(20,30,20,0.2)';
    ctx.beginPath();
    if (!farLod) for (const e of list) {
      const o = e.o;
      if (e.t === 1) { if (o.stage === 'grow' && o.size > 0.3) { const s = o.size; ctx.moveTo(e.sx + 3 + 11 * s, e.sy + 1); ctx.ellipse(e.sx + 3, e.sy + 1, 11 * s, 5 * s, 0, 0, TAU); } }
      else if (e.t === 5 || e.t === 6) { ctx.moveTo(e.sx + 3.2, e.sy + (o.z || 0)); ctx.ellipse(e.sx, e.sy + (o.z || 0), 3.2, 1.4, 0, 0, TAU); }
    }
    ctx.fill();
    PROF.mark('collect+shadows', t0); t0 = now();
    const pieces = R.dbg.noOcc || spin ? [] : occluders(list, view, wantHi);
    if (!R.dbg.noEnt) {
      let pk = 0;
      for (const e of list) {
        while (pk < pieces.length && pieces[pk].key <= e.d) drawPiece(pieces[pk++]);
        if (PROF.on) { const t1 = now(); drawEntity(e, t, nightF); PROF.mark('e' + e.t, t1); } else drawEntity(e, t, nightF);
      }
      while (pk < pieces.length) drawPiece(pieces[pk++]);
      // whoever the god is looking at stays visible through the rock, as a faint ghost
      if (pieces.length) for (const o of [G.UI && G.UI.selected, R.hover]) {
        if (!o || o.x === undefined || o.type || o.inside || o.dead) continue;
        const e = list.find(q => q.o === o); if (!e) continue;
        ctx.save(); ctx.globalAlpha = 0.38; drawEntity(e, t, nightF); ctx.restore();
      }
    }
    R.dbg.pieces = pieces.length;
    G.Siege && G.Siege.drawMissiles(ctx, proj);
    G.Powers.drawWorld && G.Powers.drawWorld(ctx, proj, t);
    G.Animals.drawAir && G.Animals.drawAir(ctx, proj, t, view, R.cam.zoom);
    drawCaveBats(t, view);
    PROF.mark('entities', t0); t0 = now();
    // ---------- world particles, clouds ----------
    drawParticles(0, view);
    for (const h of HK.air) h(ctx, proj, view, t, nightF, FXA);
    PROF.mark('particles', t0); t0 = now();
    if (!R.dbg.noClouds) drawClouds(t, view, nightF);
    PROF.mark('clouds', t0); t0 = now();
    // ---------- lighting ----------
    lightingPass(setWorld, nightF, t);
    PROF.mark('lighting', t0); t0 = now();
    // ---------- emissive ----------
    setWorld(ctx, 1);
    drawEmissive(t, nightF, view);
    PROF.mark('emissive', t0); t0 = now();
    // ---------- overlays ----------
    drawOverlays(t, view);
    PROF.mark('overlays', t0); t0 = now();
    // ---------- screen space ----------
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // what climate is the camera looking at? snow falls instead of rain in the cold
    const ctile = R.screenToTile(VW / 2, VH / 2); const ci = W.inb(ctile[0], ctile[1]) ? W.idx(ctile[0], ctile[1]) : -1;
    const coldView = ci >= 0 && S.biome && S.temp && S.temp[ci] < 72;
    if (coldView) {
      const dens = Math.max(S.weather.rain, S.temp[ci] < 45 ? 0.35 : 0.12);
      const wxs = Math.cos(S.weather.windA) * S.weather.windS * 30;
      ctx.fillStyle = 'rgba(245,250,255,0.85)';
      const n = Math.floor(140 * dens);
      for (let k = 0; k < n; k++) {
        const sp = 30 + G.hash(k) * 40, sz = (1 + G.hash(k * 5) * 1.6) * dpr;
        const x = ((G.hash(k * 13) * canvas.width + t * wxs * dpr + Math.sin(t * 1.3 + k) * 12 * dpr) % canvas.width + canvas.width) % canvas.width;
        const y = (G.hash(k * 7 + 3) * canvas.height + t * sp * dpr) % canvas.height;
        ctx.fillRect(x, y, sz, sz);
      }
    } else if (S.weather.rain > 0.05) {
      ctx.strokeStyle = `rgba(200,220,245,${0.35 * S.weather.rain})`; ctx.lineWidth = 1 * dpr;
      ctx.beginPath();
      const wxs = Math.cos(S.weather.windA) * S.weather.windS * 12;
      const n = Math.floor(160 * S.weather.rain);
      for (let k = 0; k < n; k++) {
        const x = ((G.hash(k * 13) * canvas.width + t * (60 + G.hash(k) * 40) * wxs) % canvas.width + canvas.width) % canvas.width;
        const y = (G.hash(k * 7 + 3) * canvas.height + t * (900 + G.hash(k * 3) * 300) * dpr) % canvas.height;
        ctx.moveTo(x, y); ctx.lineTo(x + wxs * dpr, y + 16 * dpr);
      }
      ctx.stroke();
    }
    for (const h of HK.screen) h(ctx, canvas.width, canvas.height, t, nightF, dpr);
    G.Powers.drawSky && G.Powers.drawSky(ctx, canvas.width, canvas.height, t, dpr);
    if (underT < 0.4) { ctx.fillStyle = `rgba(0,0,0,${1 - underT / 0.4})`; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    if (G.FX.flash > 0) {
      ctx.fillStyle = `rgba(${G.FX.flashColor},${Math.min(1, G.FX.flash) * 0.85})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  // ------------------------------ base of the diorama ------------------------------
  function drawBase() {
    const S = G.S; const V = N + 1; const BOT = -6;
    const wv = (X, Y) => { const p = R.fromView(X, Y); return S.H[Math.round(p[1]) * V + Math.round(p[0])]; };
    let faces;
    if (!spin) faces = [
      { pts: k => R.fromView(k, N), vh: k => wv(k, N), dark: 0.72 },
      { pts: k => R.fromView(N, k), vh: k => wv(N, k), dark: 0.88 },
    ];
    else {
      // turning: the sides of the world that face the god, each shaded by where it faces
      const dX = cphi + sphi, dY = cphi - sphi, sX = cphi - sphi, sY = -(sphi + cphi);
      const side = (nx, ny) => ({ dark: 0.8 + 0.115 * G.clamp((nx * sX + ny * sY) / 1.4142, -1, 1) });
      faces = [];
      if (dY > 0) faces.push({ pts: k => [k, N], vh: k => S.H[N * V + k], ...side(0, 1) });
      if (dY < 0) faces.push({ pts: k => [N - k, 0], vh: k => S.H[N - k], ...side(0, -1) });
      if (dX > 0) faces.push({ pts: k => [N, k], vh: k => S.H[k * V + N], ...side(1, 0) });
      if (dX < 0) faces.push({ pts: k => [0, N - k], vh: k => S.H[(N - k) * V], ...side(-1, 0) });
    }
    let yLo = -1e9; for (const c of [[0, 0], [N, 0], [0, N], [N, N]]) yLo = Math.max(yLo, proj(c[0], c[1], 2)[1]);
    for (const f of faces) {
      // soil
      const g = ctx.createLinearGradient(0, yLo - 20, 0, yLo + (2 - BOT) * HS);
      g.addColorStop(0, G.rgb([128 * f.dark, 94 * f.dark, 66 * f.dark])); g.addColorStop(0.5, G.rgb([96 * f.dark, 70 * f.dark, 50 * f.dark])); g.addColorStop(1, G.rgb([60 * f.dark, 48 * f.dark, 40 * f.dark]));
      ctx.fillStyle = g;
      ctx.beginPath();
      for (let k = 0; k <= N; k++) { const [x, y] = f.pts(k); const p = proj(x, y, f.vh(k)); if (k === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); }
      { const [x, y] = f.pts(N); const p = proj(x, y, BOT); ctx.lineTo(p[0], p[1]); }
      { const [x, y] = f.pts(0); const p = proj(x, y, BOT); ctx.lineTo(p[0], p[1]); }
      ctx.closePath(); ctx.fill();
      // strata
      ctx.strokeStyle = 'rgba(40,28,20,0.25)'; ctx.lineWidth = 1;
      for (const hh of [0, -2.5]) { ctx.beginPath(); for (let k = 0; k <= N; k++) { const [x, y] = f.pts(k); const p = proj(x, y, Math.min(hh + Math.sin(k * 0.7) * 0.3, f.vh(k) - 0.4)); if (k === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); } ctx.stroke(); }
      // water column
      ctx.fillStyle = `rgba(70,150,190,${0.78 * f.dark + 0.1})`;
      ctx.beginPath();
      for (let k = 0; k <= N; k++) { const [x, y] = f.pts(k); const p = proj(x, y, G.SEA); if (k === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); }
      for (let k = N; k >= 0; k--) { const [x, y] = f.pts(k); const p = proj(x, y, Math.min(G.SEA, f.vh(k))); ctx.lineTo(p[0], p[1]); }
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(220,245,255,0.6)'; ctx.lineWidth = 1;
      ctx.beginPath(); { const [x0, y0] = f.pts(0), [x1, y1] = f.pts(N); const a = proj(x0, y0, G.SEA), b = proj(x1, y1, G.SEA); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); } ctx.stroke();
    }
  }

  // ------------------------------ water animation ------------------------------
  function drawWater(t, view) {
    // shore foam
    const inV = (p) => p[0] > view[0] - 20 && p[0] < view[2] + 20 && p[1] > view[1] - 20 && p[1] < view[3] + 20;
    for (let pass = 0; pass < 2; pass++) {
      ctx.beginPath();
      const segs = pass === 0 ? shore : shore;
      for (const s of segs) {
        const ph = t * (pass ? 0.9 : 1.3) + (s[0] + s[1]) * 0.8 + pass * 2;
        const off = pass ? 0.22 + 0.16 * (0.5 + 0.5 * Math.sin(ph)) : 0.05 + 0.07 * (0.5 + 0.5 * Math.sin(ph));
        const a = proj(s[0] + s[4] * off, s[1] + s[5] * off, G.SEA), b = proj(s[2] + s[4] * off, s[3] + s[5] * off, G.SEA);
        if (!inV(a)) continue;
        ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
      }
      ctx.strokeStyle = pass ? `rgba(255,255,255,${0.16 + 0.1 * Math.sin(t * 0.9)})` : `rgba(255,255,255,${0.55 + 0.15 * Math.sin(t * 1.3)})`;
      ctx.lineWidth = pass ? 1 : 1.5;
      ctx.stroke();
    }
    ctx.beginPath();
    for (const s of shoreRiver) {
      const a = proj(s[0] + s[4] * 0.06, s[1] + s[5] * 0.06, s[6]), b = proj(s[2] + s[4] * 0.06, s[3] + s[5] * 0.06, s[6]);
      if (!inV(a)) continue; ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
    }
    ctx.strokeStyle = 'rgba(235,250,255,0.4)'; ctx.lineWidth = 0.9; ctx.stroke();
    drawCurrents(t, inV);
    // glints
    ctx.fillStyle = '#ffffff';
    for (const s of sparkles) {
      const a = Math.sin(t * s[3] + s[2]); if (a < 0.9) continue;
      const p = proj(s[0] + Math.sin(t * 0.3 + s[2]) * 0.2, s[1], W.waterH(s[0], s[1]));
      if (!inV(p)) continue;
      ctx.globalAlpha = (a - 0.9) * 10 * 0.8;
      ctx.fillRect(p[0] - 2, p[1], 4, 0.8);
    }
    ctx.globalAlpha = 1;
  }

  // ------------------------------ running water ------------------------------
  // rivers glide downhill (little bright streaks moving with the current); waterfalls pour
  const FLOW = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  function drawCurrents(t, inV) {
    const S = G.S; const tv = R.tileView; if (!tv || R.cam.zoom < 0.7) return;
    ctx.strokeStyle = 'rgba(235,250,255,0.55)'; ctx.lineWidth = 0.8; ctx.beginPath();
    for (let y = tv[1]; y <= tv[3]; y++) for (let x = tv[0]; x <= tv[2]; x++) {
      const i = y * N + x; if (S.type[i] !== T.RIVER) continue;
      const lv = S.wl[i]; let bd = -1, bl = lv - 0.004;
      for (let k = 0; k < 4; k++) { const nx = x + FLOW[k][0], ny = y + FLOW[k][1]; if (!W.inb(nx, ny)) continue; const j = ny * N + nx; const tj = S.type[j]; if (tj > T.RIVER) continue; const l = tj === T.RIVER ? S.wl[j] : G.SEA; if (l < bl) { bl = l; bd = k; } }
      if (bd < 0) continue;
      const [dx, dy] = FLOW[bd]; const ph = (t * 0.45 + G.hash(i * 3)) % 1;
      for (let q = 0; q < 2; q++) {
        const f = (ph + q * 0.5) % 1; const side = 0.25 + G.hash(i * 7 + q) * 0.5;
        const u = dx ? (dx > 0 ? f : 1 - f) : side, v = dy ? (dy > 0 ? f : 1 - f) : side;
        const a = proj(x + u, y + v, lv), b = proj(x + u + dx * 0.16, y + v + dy * 0.16, lv);
        if (!inV(a)) continue;
        ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
      }
    }
    ctx.stroke();
    // waterfalls facing the camera
    for (const fl of S.relief.falls || []) {
      const x = fl.x, y = fl.y, tx = fl.tx, ty = fl.ty;
      if (depth(x + 0.5, y + 0.5) >= depth(tx + 0.5, ty + 0.5)) continue;
      const top = S.wl[y * N + x], low = S.wl[ty * N + tx];
      let ax, ay, bx, by;
      if (tx > x) { ax = x + 1; ay = y; bx = x + 1; by = y + 1; } else if (tx < x) { ax = x; ay = y; bx = x; by = y + 1; } else if (ty > y) { ax = x; ay = y + 1; bx = x + 1; by = y + 1; } else { ax = x; ay = y; bx = x + 1; by = y; }
      const mid = proj((ax + bx) / 2, (ay + by) / 2, low); if (!inV(mid)) continue;
      ctx.save(); ctx.lineCap = 'round';
      for (let k = 0; k < 6; k++) {
        const u = (k + 0.5) / 6; const px = ax + (bx - ax) * u, py = ay + (by - ay) * u;
        const p0 = proj(px, py, top), p1 = proj(px, py, low);
        ctx.strokeStyle = `rgba(255,255,255,${0.45 + 0.25 * G.hash(k * 13 + x)})`; ctx.lineWidth = 1.1;
        ctx.setLineDash([3 + G.hash(k + y) * 3, 4]); ctx.lineDashOffset = -t * (26 + k * 3);
        ctx.beginPath(); ctx.moveTo(p0[0] + Math.sin(t * 3 + k) * 0.3, p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
      }
      ctx.setLineDash([]);
      // the pool boils white where it lands
      for (let k = 0; k < 3; k++) { const a = (t * 1.3 + k * 2.1) % TAU; ctx.fillStyle = `rgba(255,255,255,${0.35 + 0.2 * Math.sin(t * 4 + k)})`; ctx.beginPath(); ctx.ellipse(mid[0] + Math.cos(a) * 5, mid[1] + 1 + Math.sin(a) * 1.2, 5 + k, 1.8, 0, 0, TAU); ctx.fill(); }
      ctx.restore();
    }
  }

  // ------------------------------ ground layer ------------------------------
  function diamond(x0, y0, x1, y1, lift) {
    const a = proj(x0, y0, W.hAt(x0, y0) + (lift || 0)), b = proj(x1, y0, W.hAt(x1, y0) + (lift || 0)), c = proj(x1, y1, W.hAt(x1, y1) + (lift || 0)), d = proj(x0, y1, W.hAt(x0, y1) + (lift || 0));
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath();
  }
  function groundEllipse(x, y, r) {
    const h = W.groundH(x, y); const p = proj(x, y, h);
    ctx.beginPath(); ctx.ellipse(p[0], p[1], r * 22.63, r * 11.31, 0, 0, TAU);
  }
  R.groundEllipse = groundEllipse;
  function drawGround(t, view, nightF) {
    const S = G.S;
    // wet ground
    const [tx0, ty0] = R.screenToTile(0, 0), [tx1, ty1] = R.screenToTile(VW, VH);
    const [tx2, ty2] = R.screenToTile(VW, 0), [tx3, ty3] = R.screenToTile(0, VH);
    const minX = Math.max(0, Math.floor(Math.min(tx0, tx1, tx2, tx3)) - 2), maxX = Math.min(N - 1, Math.ceil(Math.max(tx0, tx1, tx2, tx3)) + 2);
    const minY = Math.max(0, Math.floor(Math.min(ty0, ty1, ty2, ty3)) - 2), maxY = Math.min(N - 1, Math.ceil(Math.max(ty0, ty1, ty2, ty3)) + 2);
    R.tileView = [minX, minY, maxX, maxY];
    for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
      const i = y * N + x; const w = S.wet[i];
      if (w > 0.08 && S.type[i] >= T.SAND) { ctx.fillStyle = `rgba(30,40,55,${Math.min(0.2, w * 0.2)})`; diamond(x, y, x + 1, y + 1); ctx.fill(); }
    }
    // cloud shadows (sky clouds & rain clouds)
    const zoomFade = G.clamp((2.2 - R.cam.zoom) / 1.2, 0, 1);
    for (const c of skyClouds) {
      const p = proj(c.x, c.y, G.SEA);
      ctx.globalAlpha = 0.12 * (1 - nightF);
      ctx.drawImage(G.Art.puff(), p[0] - 90 * c.s, p[1] - 30 * c.s, 180 * c.s, 60 * c.s);
    }
    for (const c of S.clouds) {
      const p = proj(c.x, c.y, W.groundH(c.x, c.y));
      ctx.globalAlpha = 0.28 * G.Nature.cloudIntensity(c);
      ctx.drawImage(G.Art.puff(), p[0] - c.r * 26, p[1] - c.r * 13, c.r * 52, c.r * 26);
    }
    ctx.globalAlpha = 1;
    // lava fields
    G.Powers.drawGround && G.Powers.drawGround(ctx, proj, t);
    // zones
    for (const zn of S.zones) {
      if (zn.kind !== 'fertility') continue;
      const a = Math.min(1, zn.t / 20) * (0.5 + 0.2 * Math.sin(t * 2));
      groundEllipse(zn.x, zn.y, zn.r); ctx.strokeStyle = `rgba(255,170,210,${a * 0.6})`; ctx.lineWidth = 1.4; ctx.setLineDash([4, 5]); ctx.lineDashOffset = -t * 8; ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = `rgba(255,190,220,${a * 0.1})`; ctx.fill();
    }
    // kingdoms: borders, war alarms, pens and executions
    if (R.showBorders && G.Fac.borders.length && G.Fac.all().length > 1) drawBorders();
    for (const s of S.settlements.values()) if (s.alarmT > 0) {
      groundEllipse(s.cx, s.cy, (s.radius || 8) * 0.85); ctx.strokeStyle = `rgba(255,70,50,${Math.min(1, s.alarmT / 4) * (0.35 + 0.25 * Math.sin(t * 6))})`;
      ctx.lineWidth = 1.6; ctx.setLineDash([6, 5]); ctx.lineDashOffset = t * 12; ctx.stroke(); ctx.setLineDash([]);
    }
    for (const f of G.Fac.all()) if (f.exec) { groundEllipse(f.exec.x + 1.2, f.exec.y + 0.7, 0.9); ctx.fillStyle = `rgba(120,10,20,${0.25 + 0.1 * Math.sin(t * 4)})`; ctx.fill(); }
    // farms, construction ground, cemetery ground, campfire seats
    for (const b of S.buildings.values()) {
      const [cx, cy] = G.Village.center(b);
      const p = proj(cx, cy, 2); if (p[0] < view[0] - 60 || p[0] > view[2] + 60 || p[1] < view[1] - 60 || p[1] > view[3] + 60) continue;
      if (b.type === 'farm') drawFarm(b, t);
      else if (!b.built) { ctx.fillStyle = 'rgba(120,90,60,0.35)'; diamond(b.x + 0.05, b.y + 0.05, b.x + b.w - 0.05, b.y + b.h - 0.05); ctx.fill(); }
      else if (b.type === 'cemetery') { ctx.fillStyle = 'rgba(60,90,50,0.25)'; diamond(b.x + 0.1, b.y + 0.1, b.x + b.w - 0.1, b.y + b.h - 0.1); ctx.fill(); }
      else if (b.type === 'praca') {
        ctx.fillStyle = G.Arch.plazaColor(b.style); diamond(b.x + 0.02, b.y + 0.02, b.x + b.w - 0.02, b.y + b.h - 0.02, 0.04); ctx.fill();
        if (b.style !== 'nordico') {
          ctx.strokeStyle = 'rgba(90,80,65,0.28)'; ctx.lineWidth = 0.4; ctx.beginPath();
          for (let k = 1; k < 8; k++) { const f = k / 8 * b.w; let a = proj(b.x + f, b.y, W.hAt(b.x + f, b.y) + 0.04), c2 = proj(b.x + f, b.y + b.h, W.hAt(b.x + f, b.y + b.h) + 0.04); ctx.moveTo(a[0], a[1]); ctx.lineTo(c2[0], c2[1]); a = proj(b.x, b.y + f, W.hAt(b.x, b.y + f) + 0.04); c2 = proj(b.x + b.w, b.y + f, W.hAt(b.x + b.w, b.y + f) + 0.04); ctx.moveTo(a[0], a[1]); ctx.lineTo(c2[0], c2[1]); }
          ctx.stroke();
        }
      }
      else if (APRON[b.type]) { ctx.fillStyle = 'rgba(200,190,170,0.35)'; diamond(b.x - 0.3, b.y - 0.3, b.x + b.w + 0.3, b.y + b.h + 0.3); ctx.fill(); }
      else if (b.type === 'cercado') { ctx.fillStyle = 'rgba(110,86,60,0.45)'; diamond(b.x + 0.05, b.y + 0.05, b.x + b.w - 0.05, b.y + b.h - 0.05); ctx.fill(); penStakes(b, penBack(b), 1); }
      else if (b.type === 'quartel') { ctx.fillStyle = 'rgba(150,130,100,0.35)'; diamond(b.x - 0.2, b.y - 0.2, b.x + b.w + 0.2, b.y + b.h + 0.2); ctx.fill(); }
    }
    for (const h of HK.ground) h(ctx, proj, view, t, nightF, diamond, FXA);
    // selection & hover rings
    const sel = G.UI && G.UI.selected;
    const ring = (o, col, w) => {
      if (!o) return;
      if (o.type && G.BDEF[o.type]) { diamond(o.x - 0.05, o.y - 0.05, o.x + o.w + 0.05, o.y + o.h + 0.05, 0.05); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke(); return; }
      if (o.x === undefined) return;
      groundEllipse(o.x, o.y, 0.42); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
    };
    if (R.hover && R.hover !== sel) ring(R.hover, 'rgba(255,255,255,0.75)', 1);
    if (sel) ring(sel, `rgba(255,214,110,${0.75 + 0.25 * Math.sin(t * 5)})`, 1.6);
    // an open prayer glows above the village
    if (S.prayer) {
      const p = S.prayer; const set = S.settlements.get(p.set);
      if (set) { const pos = proj(set.cx, set.cy, W.groundH(set.cx, set.cy)); emisGlow.push(pos[0], pos[1] - 46 - Math.sin(t * 2) * 3, 16, 'gold', 0.55 + 0.25 * Math.sin(t * 3)); overlays.push({ prayerIcon: true }, pos[0], pos[1] - 46 - Math.sin(t * 2) * 3); }
      if (p.kind === 'fire' || p.kind === 'protect') { groundEllipse(p.x, p.y, 1.2); ctx.strokeStyle = `rgba(255,214,110,${0.5 + 0.3 * Math.sin(t * 4)})`; ctx.lineWidth = 1.2; ctx.setLineDash([3, 4]); ctx.stroke(); ctx.setLineDash([]); }
    }
    // meteor shadows
    for (const m of S.meteors) {
      const k = G.clamp(m.t / m.delay, 0, 1);
      groundEllipse(m.x, m.y, m.r * (0.25 + k * 0.85));
      ctx.fillStyle = `rgba(20,5,0,${0.1 + k * 0.4})`; ctx.fill();
      groundEllipse(m.x, m.y, m.r);
      ctx.strokeStyle = `rgba(255,80,40,${0.4 + 0.4 * Math.sin(t * 12)})`; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]); ctx.lineDashOffset = t * 20; ctx.stroke(); ctx.setLineDash([]);
    }
  }
  let borderCache = { ver: -1, n: 0, paths: [] };
  function drawBorders() {
    const F = G.Fac;
    // (the lines are kept for the view they were drawn for; while the world turns they are drawn anew)
    const ang = spin ? 'p' + spin.phi : rot;
    if (borderCache.ver !== F.bordersVer || borderCache.n !== N || borderCache.ang !== ang) {
      borderCache = { ver: F.bordersVer, n: N, ang, paths: [] };
      for (const b of F.borders) {
        const p = new Path2D(), pc = new Path2D(); const s = b.s;
        for (let k = 0; k < s.length; k += 5) {
          const a = proj(s[k], s[k + 1], W.hAt(s[k], s[k + 1]) + 0.12), c = proj(s[k + 2], s[k + 3], W.hAt(s[k + 2], s[k + 3]) + 0.12);
          const path = s[k + 4] ? pc : p; path.moveTo(a[0], a[1]); path.lineTo(c[0], c[1]);
        }
        borderCache.paths.push({ p, pc, rgb: G.hex2rgb(F.hex(b.fid)) });
      }
    }
    ctx.save(); ctx.lineCap = 'round';
    for (const b of borderCache.paths) {
      ctx.strokeStyle = G.rgb(b.rgb, 0.18); ctx.lineWidth = 3.4; ctx.stroke(b.p); ctx.stroke(b.pc);
      ctx.strokeStyle = G.rgb(b.rgb, 0.75); ctx.lineWidth = 0.9; ctx.setLineDash([3, 2.5]); ctx.stroke(b.p);
      ctx.setLineDash([]); ctx.strokeStyle = G.rgb(b.rgb, 0.95); ctx.lineWidth = 1.2; ctx.stroke(b.pc);
    }
    ctx.restore();
  }
  function drawFarm(b, t) {
    const S = G.S;
    const wind = Math.sin(t * 2.2) * (0.6 + S.weather.windS * 1.5);
    for (let k = 0; k < 9; k++) {
      const x = b.x + (k % 3), y = b.y + Math.floor(k / 3);
      const i = y * N + x; const burnt = S.burnt[i] > 0;
      ctx.fillStyle = burnt ? '#4a3e34' : (b.built ? '#8a6440' : 'rgba(138,100,64,0.5)');
      diamond(x + 0.04, y + 0.04, x + 0.96, y + 0.96, 0.02); ctx.fill();
      if (!b.built) continue;
      // furrows
      ctx.strokeStyle = 'rgba(70,48,28,0.55)'; ctx.lineWidth = 0.6;
      ctx.beginPath();
      for (let r = 1; r < 4; r++) { const a = proj(x + 0.1, y + r / 4, W.hAt(x + 0.1, y + r / 4)), c2 = proj(x + 0.9, y + r / 4, W.hAt(x + 0.9, y + r / 4)); ctx.moveTo(a[0], a[1]); ctx.lineTo(c2[0], c2[1]); }
      ctx.stroke();
      const c = b.crops[k]; if (!c || c.s === 0 || burnt) continue;
      const g = c.g;
      for (let r = 0; r < 3; r++) for (let q = 0; q < 4; q++) {
        const px = x + 0.18 + q * 0.21, py = y + 0.2 + r * 0.3;
        const p = proj(px, py, W.hAt(px, py));
        if (c.s === 1) { ctx.fillStyle = '#7ec45a'; ctx.fillRect(p[0] - 0.6, p[1] - 1.2, 1.2, 1.2); }
        else {
          const hgt = 2 + g * 5; const ripe = c.s === 3;
          const sway = wind * (ripe ? 0.9 : 0.5);
          ctx.strokeStyle = ripe ? '#e0b84a' : G.rgb(G.lerpColor([110, 180, 80], [200, 190, 90], Math.max(0, g - 0.6) * 2));
          ctx.lineWidth = 0.7;
          ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0] + sway, p[1] - hgt); ctx.stroke();
          if (ripe) { ctx.fillStyle = '#f2cc5a'; ctx.beginPath(); ctx.ellipse(p[0] + sway, p[1] - hgt - 0.8, 0.7, 1.4, 0.2, 0, TAU); ctx.fill(); }
        }
      }
    }
    // fence posts
    ctx.fillStyle = '#6e4a2c';
    for (let k = 0; k <= 3; k++) for (const [fx, fy] of [[b.x + k, b.y], [b.x + k, b.y + 3], [b.x, b.y + k], [b.x + 3, b.y + k]]) {
      const p = proj(fx, fy, W.hAt(Math.min(fx, N - 0.01), Math.min(fy, N - 0.01))); ctx.fillRect(p[0] - 0.5, p[1] - 3.2, 1, 3.2);
    }
  }

  // ------------------------------ the world below ------------------------------
  // With the god's eye under the ground, the rock is cut flat at the height of the cave roofs and every
  // cave is a pit in it: the walls at the back rise whole, the rock in front of a cave is cut down to a
  // lip, so nothing inside hides. Down there it is dark: what lights it is the day falling through the
  // mouths, the torches people carry, the outlaws' fire, glow-worms, crystals and the oracle's vapours.
  R.under = 0; let underT = 9;
  const UF = () => (G.Caves ? G.Caves.FLOOR : 2), UW = () => (G.Caves ? G.Caves.WALL : 3.2);
  const UG_STUB = 0.42, UG_AMB = [146, 134, 144];
  function ugGround(x, y) { const U = G.S && G.S.ug; const xi = Math.floor(x), yi = Math.floor(y); if (!U || xi < 0 || yi < 0 || xi >= N || yi >= N) return UF() + UW(); const k = U.k[yi * N + xi]; return k ? (k === G.Caves.K.PIT ? UF() : G.Caves.floorAt(x, y)) : UF() + UW(); }
  R.groundAt = (x, y) => (R.under && G.S && G.S.ug ? ugGround(x, y) : W.groundH(x, y));
  R.underHooks = [];
  R.setUnder = function (on, quiet) {
    on = on ? 1 : 0; if (on === R.under || (on && !(G.S && G.S.ug))) return;
    if (spin) { spin.to = Math.round(spin.phi / QT) * QT; endSpin(); }
    const c = G.S ? R.screenToTile(VW / 2, VH / 2) : [N / 2, N / 2];
    R.under = on; underT = quiet ? 9 : 0; ugVer = -1;
    if (G.S) { const p = proj(c[0], c[1], R.groundAt(c[0], c[1])); R.cam.x = p[0]; R.cam.y = p[1]; R.cam.target = null; }
    if (!quiet && G.Audio && G.Audio.play) G.Audio.play('whoosh');
    for (const h of R.underHooks) h(on);
    G.Minimap && G.Minimap.refresh && G.Minimap.refresh();
  };
  let ugImg = null, ugVer = -1, ugCells = [], ugCol = null, ugStub = null, ugSet = null, ugSeen = null, ugCave = null, ugStubH = null;
  const ugRockOf = id => { const cv = id && G.Caves.get(id); return G.Caves.ROCKS[cv ? G.Caves.rockOf(cv) : 'calcario']; };
  const ugRockName = id => { const cv = id && G.Caves.get(id); return cv ? G.Caves.rockOf(cv) : 'calcario'; };
  function floorCol(i, k) {
    const U = G.S.ug, K = G.Caves.K; const hv = (G.hash(i * 3 + 7) - 0.5) * 12;
    const rk = ugRockOf(U.id[i]), rn = ugRockName(U.id[i]);
    // patches: pale calcite, dark wet earth, wind-sorted sand
    const x = i % N, y = (i / N) | 0; const pn = G.hash(((x / 3) | 0) * 71 + ((y / 3) | 0) * 1013 + 5) - 0.5;
    let c = k === K.LAKE ? (rn === 'gelo' ? [150, 192, 218] : [30, 58, 82]) : k === K.STREAM ? (rn === 'gelo' ? [128, 176, 206] : [62, 124, 156]) : k === K.PIT ? rk.deep.map(v => v * 0.45)
      : k === K.MOUTH ? [168, 152, 124] : k === K.DUG ? [140, 110, 78] : k === K.HALL ? rk.floor.slice() : rk.gal.slice();
    if (k === K.HALL || k === K.GAL) { c = c.map(v => v + pn * 16); const lv = G.Caves.level(i); if (lv > 0.3) c = c.map(v => v * 1.08 + 6); }
    if (U.f[i] === G.Caves.FT.GUANO) c = G.lerpColor(c, [92, 74, 52], 0.45);
    return [c[0] + hv, c[1] + hv, c[2] + hv * 0.8];
  }
  // the stone of the land above: red under the deserts, blue-grey under the sea, lighter under the towns;
  // near a cave, the stone of the cave itself
  function buildUnder() {
    const S = G.S, U = S.ug; const NN = N * N;
    ugVer = U.ver;
    if (!ugImg || ugImg.width !== N) { ugImg = document.createElement('canvas'); ugImg.width = ugImg.height = N; }
    ugCol = new Int32Array(NN); ugStub = new Uint8Array(NN); ugSet = new Uint8Array(NN); ugSeen = new Uint8Array(NN); ugCave = new Int16Array(NN); ugStubH = new Float32Array(NN);
    for (let i = 0; i < NN; i++) {
      if (!U.k[i]) continue; ugSet[i] = 1; ugCave[i] = U.id[i];
      const x = i % N, y = (i / N) | 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const j = ny * N + nx; if (!U.k[j]) { ugSet[j] = 2; ugCave[j] = U.id[i]; } }
    }
    for (let i = 0; i < NN; i++) {
      if (ugSet[i] !== 2) continue; const x = i % N, y = (i / N) | 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const j = ny * N + nx; if (!ugSet[j]) { ugSet[j] = 3; ugCave[j] = ugCave[i]; } }
    }
    const xc = ugImg.getContext('2d'); const img = xc.createImageData(N, N); const d = img.data;
    ugCells = [];
    for (let i = 0; i < NN; i++) {
      let c;
      if (U.k[i]) c = floorCol(i, U.k[i]);
      else {
        const t = S.type[i];
        if (t <= T.SEA) c = [52, 64, 80]; else if (t === T.RIVER) c = [64, 76, 90];
        else { const h = W.tileH(i) - G.SEA; const b = S.biome ? S.biome[i] : 0; c = b === 6 || b === 5 ? [124, 88, 66] : b === 1 ? [102, 106, 118] : [92, 85, 78]; const l = Math.min(h, 14) * 2; c = [c[0] + l, c[1] + l, c[2] + l]; }
        if (S.occ[i]) c = [c[0] + 20, c[1] + 16, c[2] + 10]; else if (S.road[i]) c = [c[0] + 9, c[1] + 8, c[2] + 6];
        if (ugSet[i]) c = G.lerpColor(c, ugRockOf(ugCave[i]).wall, ugSet[i] === 2 ? 0.8 : 0.5);
        if (U.ore[i]) c = G.lerpColor(c, G.hex2rgb(G.Caves.ORES[U.ore[i]].col), 0.2);
        const hv = (G.hash(i * 5 + 1) - 0.5) * 10; c = [c[0] + hv, c[1] + hv, c[2] + hv * 0.8];
      }
      const r = G.clamp(Math.round(c[0]), 0, 255), g = G.clamp(Math.round(c[1]), 0, 255), b = G.clamp(Math.round(c[2]), 0, 255);
      ugCol[i] = (r << 16) | (g << 8) | b;
      d[i * 4] = r; d[i * 4 + 1] = g; d[i * 4 + 2] = b; d[i * 4 + 3] = ugSet[i] === 1 || ugSet[i] === 2 ? 0 : 255;
      if (ugSet[i]) ugCells.push(i);
    }
    xc.putImageData(img, 0, 0);
  }
  const ugRGB = (c, f) => 'rgb(' + Math.min(255, ((c >> 16) & 255) * f | 0) + ',' + Math.min(255, ((c >> 8) & 255) * f | 0) + ',' + Math.min(255, (c & 255) * f | 0) + ')';
  const ugRGBA = (c, f, a) => 'rgba(' + Math.min(255, ((c >> 16) & 255) * f | 0) + ',' + Math.min(255, ((c >> 8) & 255) * f | 0) + ',' + Math.min(255, (c & 255) * f | 0) + ',' + a + ')';
  function quadFill(a, b, c, d, col) {
    ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  function ugH(i) {
    const U = G.S.ug; const k = U.k[i];
    if (k) return UF() + G.Caves.level(i);
    return ugSet[i] === 2 && ugStub[i] ? ugStubH[i] : UF() + UW();
  }
  const EDGE = { '1,0': [1, 0, 1, 1], '-1,0': [0, 0, 0, 1], '0,1': [0, 1, 1, 1], '0,-1': [0, 0, 1, 0] };
  // the strata are cut at the same heights all around a cave, so the layers run along its walls
  const STRATA = [0.55, 1.25, 1.9, 2.55, -0.2, -0.95, -1.7, -2.5];
  // the sides of a cell that face the god and stand over something lower
  function ugFaces(i, x, y, h, col, t, ore, rock) {
    const U = G.S.ug, K = G.Caves.K;
    const d0 = depth(x + 0.5, y + 0.5);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
      if (depth(nx + 0.5, ny + 0.5) <= d0 + 0.01) continue;
      const j = ny * N + nx; const hn = ugSet[j] ? ugH(j) : UF() + UW(); if (hn >= h - 0.01) continue;
      const e = EDGE[dx + ',' + dy]; const ax = x + e[0], ay = y + e[1], bx = x + e[2], by = y + e[3];
      const a = proj(ax, ay, h), b = proj(bx, by, h), c = proj(bx, by, hn), d = proj(ax, ay, hn);
      const o = R.off(dx, dy); const sh = 0.7 - 0.13 * G.clamp(o[0] / 20, -1, 1);
      quadFill(a, b, c, d, ugRGB(col, sh));
      const tall = h - hn;
      if (rock) {
        const rn = rock; const sd = i * 31 + dx * 7 + dy * 13;
        // the layers of the rock
        ctx.lineWidth = 0.7;
        for (let q = 0; q < STRATA.length; q++) {
          const hh = UF() + STRATA[q]; if (hh <= hn + 0.08 || hh >= h - 0.08) continue;
          const p = proj(ax, ay, hh), r = proj(bx, by, hh);
          ctx.strokeStyle = q % 2 ? 'rgba(255,240,220,0.07)' : 'rgba(18,12,8,0.2)'; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(r[0], r[1]); ctx.stroke();
          if (rn === 'arenito') { const p2 = proj(ax, ay, hh + 0.22), r2 = proj(bx, by, hh + 0.16); ctx.strokeStyle = 'rgba(255,200,150,0.09)'; ctx.beginPath(); ctx.moveTo(p2[0], p2[1]); ctx.lineTo(r2[0], r2[1]); ctx.stroke(); }
        }
        if (rn === 'basalto') { // the black stone stands in columns
          ctx.strokeStyle = 'rgba(0,0,0,0.28)'; ctx.lineWidth = 0.6;
          for (let q = 1; q < 4; q++) { const u = q / 4 + (G.hash(sd + q) - 0.5) * 0.08; const p = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u], r = [d[0] + (c[0] - d[0]) * u, d[1] + (c[1] - d[1]) * u]; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(r[0], r[1]); ctx.stroke(); }
        } else if (G.hash(sd) < (rn === 'calcario' ? 0.45 : 0.25)) { // flowstone: pale curtains where the water ran down
          const u = 0.2 + G.hash(sd + 1) * 0.6, w = 0.08 + G.hash(sd + 2) * 0.1, len = 0.35 + G.hash(sd + 3) * 0.45;
          const p0 = [a[0] + (b[0] - a[0]) * (u - w), a[1] + (b[1] - a[1]) * (u - w)], p1 = [a[0] + (b[0] - a[0]) * (u + w), a[1] + (b[1] - a[1]) * (u + w)];
          const dyp = (d[1] - a[1]) * len;
          const fs = ctx.createLinearGradient(0, p0[1], 0, p0[1] + dyp);
          fs.addColorStop(0, rn === 'gelo' ? 'rgba(235,250,255,0.55)' : 'rgba(240,226,200,0.32)'); fs.addColorStop(1, 'rgba(240,226,200,0)');
          ctx.fillStyle = fs; ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]);
          ctx.quadraticCurveTo(p1[0] - 0.5, p1[1] + dyp * 0.7, (p0[0] + p1[0]) / 2, p0[1] + dyp); ctx.quadraticCurveTo(p0[0] + 0.5, p0[1] + dyp * 0.7, p0[0], p0[1]); ctx.fill();
        }
        // teeth of stone (or ice) hanging from the rim
        if (tall > 1.2) {
          const n = rn === 'gelo' ? 4 : G.hash(sd + 5) < 0.5 ? 2 : 0;
          ctx.fillStyle = rn === 'gelo' ? 'rgba(220,244,255,0.85)' : ugRGB(col, sh * 1.12);
          for (let q = 0; q < n; q++) { const u = 0.12 + G.hash(sd + q * 3 + 9) * 0.76, L = (rn === 'gelo' ? 2.5 : 1.6) + G.hash(sd + q * 5) * 3; const px = a[0] + (b[0] - a[0]) * u, py = a[1] + (b[1] - a[1]) * u; ctx.beginPath(); ctx.moveTo(px - 0.8, py); ctx.lineTo(px + 0.8, py); ctx.lineTo(px, py + L); ctx.closePath(); ctx.fill(); }
        }
        // moss and drips on wet stone; a tide mark above the water
        if (rn === 'musgo' && tall > 1) { ctx.fillStyle = 'rgba(96,140,70,0.45)'; for (let q = 0; q < 3; q++) { const u = 0.1 + G.hash(sd + q * 11) * 0.8; const px = a[0] + (b[0] - a[0]) * u, py = a[1] + (b[1] - a[1]) * u; ctx.beginPath(); ctx.ellipse(px, py + 1.2, 1.8, 1.1, 0, 0, Math.PI * 2); ctx.fill(); } }
        const kj = U.k[j];
        if (kj === K.LAKE || kj === K.STREAM) { const w0 = proj(ax, ay, hn + 0.5), w1 = proj(bx, by, hn + 0.5); const g = ctx.createLinearGradient(0, w0[1], 0, d[1]); g.addColorStop(0, 'rgba(10,16,20,0)'); g.addColorStop(1, 'rgba(10,16,20,0.45)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(w0[0], w0[1]); ctx.lineTo(w1[0], w1[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); ctx.fill(); }
        // the lit rim of the cut
        ctx.strokeStyle = 'rgba(255,244,226,0.16)'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      } else if (tall < 2) { // a ledge in the floor: its lip catches the light
        ctx.strokeStyle = 'rgba(255,240,215,0.22)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      }
      // down into a chasm: the light gives out
      if (U.k[j] === K.PIT) {
        const g = ctx.createLinearGradient(0, Math.min(a[1], b[1]), 0, Math.max(c[1], d[1]));
        g.addColorStop(0, 'rgba(4,3,5,0)'); g.addColorStop(0.35, 'rgba(4,3,5,0.55)'); g.addColorStop(1, 'rgba(2,1,3,0.96)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); ctx.fill();
      }
      if (ore && tall > 1) { // the vein shows in the cut
        const oc = G.Caves.ORES[ore].col;
        for (let k = 0; k < 4; k++) {
          const u = 0.15 + G.hash(i * 11 + k) * 0.7, v = 0.2 + G.hash(i * 13 + k * 3) * 0.6;
          const px = a[0] + (b[0] - a[0]) * u, py = a[1] + (b[1] - a[1]) * u + (d[1] - a[1]) * v;
          ctx.fillStyle = oc; ctx.beginPath(); ctx.moveTo(px, py - 1.1); ctx.lineTo(px + 0.9, py); ctx.lineTo(px, py + 1.1); ctx.lineTo(px - 0.9, py); ctx.closePath(); ctx.fill();
          if (k === 0) emisGlow.push(px, py, 3.5, ore === 4 ? 'gold' : ore === 6 ? 'purple' : 'white', 0.25 + 0.25 * Math.max(0, Math.sin(t * 2 + i)));
        }
      }
    }
  }
  // the floor: speckles and cracks, rubble at the foot of the walls, puddles, rimstone pools, sand ripples,
  // ice; water that moves; a chasm breathing its mist
  function ugFloor(i, t) {
    const U = G.S.ug, K = G.Caves.K; const x = i % N, y = (i / N) | 0; const k = U.k[i]; const h = ugH(i); const c = ugCol[i];
    const rn = ugRockName(U.id[i]); const hs = G.hash(i * 17 + 3);
    const a = proj(x, y, h), b = proj(x + 1, y, h), d = proj(x + 1, y + 1, h), e = proj(x, y + 1, h);
    quadFill(a, b, d, e, ugRGB(c, 1));
    const m = proj(x + 0.5, y + 0.5, h);
    if (k === K.LAKE || k === K.STREAM) {
      const frozen = rn === 'gelo';
      if (!frozen) {
        // deeper toward the middle; the shore wet and pale
        const gx = ctx.createRadialGradient(m[0], m[1], 0, m[0], m[1], 12); gx.addColorStop(0, 'rgba(4,12,22,0.35)'); gx.addColorStop(1, 'rgba(4,12,22,0)');
        ctx.fillStyle = gx; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(d[0], d[1]); ctx.lineTo(e[0], e[1]); ctx.closePath(); ctx.fill();
        const ph = t * (k === K.STREAM ? 1.6 : 0.5) + (x + y) * 0.9;
        ctx.strokeStyle = `rgba(170,215,240,${0.16 + 0.12 * Math.sin(ph)})`; ctx.lineWidth = 0.6;
        if (k === K.STREAM) { for (let q = 0; q < 2; q++) { const f = ((t * 0.45 + q * 0.5 + hs) % 1); const p0 = proj(x + 0.2 + f * 0.6, y + 0.3 + q * 0.4, h); ctx.beginPath(); ctx.moveTo(p0[0] - 2, p0[1]); ctx.lineTo(p0[0] + 2, p0[1] + 0.6); ctx.stroke(); } }
        else { ctx.beginPath(); ctx.ellipse(m[0] + Math.sin(ph) * 3, m[1] + Math.cos(ph * 0.7) * 1.2, 4 + Math.sin(ph * 1.3) * 1.5, 1.2, 0, 0, Math.PI * 2); ctx.stroke(); }
        // a drop from the roof: a ring that runs out over the black water
        if (hs < 0.22) { const f = (t * 0.23 + hs * 7) % 1; if (f < 0.5) { const r = f * 14; ctx.strokeStyle = `rgba(200,230,250,${0.45 * (1 - f * 2)})`; ctx.beginPath(); ctx.ellipse(m[0] + (hs - 0.1) * 30, m[1], r, r * 0.45, 0, 0, Math.PI * 2); ctx.stroke(); } }
        // mist over the cold water
        if (k === K.LAKE && hs > 0.7) { const f = (t * 0.05 + hs * 3) % 1; ctx.fillStyle = `rgba(210,225,235,${0.08 * Math.sin(f * Math.PI)})`; ctx.beginPath(); ctx.ellipse(m[0] + (f - 0.5) * 14, m[1] - 2 - f * 3, 11, 3, 0, 0, Math.PI * 2); ctx.fill(); }
      } else {
        // frozen: white cracks and a gleam
        ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 0.4; ctx.beginPath(); ctx.moveTo(m[0] - 6 + hs * 4, m[1] - 1); ctx.lineTo(m[0], m[1] + 1); ctx.lineTo(m[0] + 5, m[1] - 1.5 + hs * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.ellipse(m[0] - 2, m[1] - 0.6, 3.5, 0.8, -0.3, 0, Math.PI * 2); ctx.fill();
      }
      // a pale wet line where the water meets the floor
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; const kj = U.k[ny * N + nx]; if (kj === K.LAKE || kj === K.STREAM || !kj) continue; const ed = EDGE[dx + ',' + dy]; const p = proj(x + ed[0], y + ed[1], h), q = proj(x + ed[2], y + ed[3], h); ctx.strokeStyle = 'rgba(220,235,240,0.3)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); }
    } else if (k === K.PIT) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(d[0], d[1]); ctx.lineTo(e[0], e[1]); ctx.closePath(); ctx.fill();
      // the chasm breathes: a cold mist rises out of it now and then
      const f = (t * 0.12 + hs * 5) % 1; const top = proj(x + 0.5, y + 0.5, UF() + 0.2);
      ctx.fillStyle = `rgba(190,200,210,${0.1 * Math.sin(f * Math.PI)})`; ctx.beginPath(); ctx.ellipse(top[0] + Math.sin(t * 0.3 + hs * 9) * 3, top[1] - f * 8, 6 + f * 6, 2 + f * 2, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      // grain of the floor
      ctx.fillStyle = ugRGB(c, 0.78); ctx.fillRect(m[0] - 4 + hs * 8, m[1] - 1 + G.hash(i * 5) * 2, 0.9, 0.6);
      ctx.fillStyle = ugRGB(c, 1.2); ctx.fillRect(m[0] - 5 + G.hash(i * 9) * 10, m[1] - 1.5 + G.hash(i * 11) * 3, 0.8, 0.5);
      if (rn === 'arenito' && hs < 0.5) { ctx.strokeStyle = ugRGBA(c, 1.18, 0.6); ctx.lineWidth = 0.4; for (let q = 0; q < 3; q++) { const yy = m[1] - 2 + q * 1.6; ctx.beginPath(); ctx.moveTo(m[0] - 6, yy); ctx.quadraticCurveTo(m[0] - 2, yy - 0.8, m[0] + 1, yy); ctx.quadraticCurveTo(m[0] + 4, yy + 0.8, m[0] + 7, yy); ctx.stroke(); } }
      else if (rn === 'gelo' && hs < 0.4) { ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.beginPath(); ctx.ellipse(m[0] + (hs - 0.2) * 20, m[1], 3.5, 1, 0.2, 0, Math.PI * 2); ctx.fill(); }
      else if (hs < 0.12) { ctx.strokeStyle = ugRGBA(c, 0.6, 0.7); ctx.lineWidth = 0.4; ctx.beginPath(); ctx.moveTo(m[0] - 5, m[1] - 0.5); ctx.lineTo(m[0] - 2, m[1] + 0.8); ctx.lineTo(m[0] + 1, m[1] - 0.2); ctx.lineTo(m[0] + 4, m[1] + 1); ctx.stroke(); }
      // a skirt of fallen stone at the foot of each wall behind, so the rock meets the floor softly
      const d0 = depth(x + 0.5, y + 0.5);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy; if (U.k[ny * N + nx] || depth(nx + 0.5, ny + 0.5) > d0) continue;
        const ed = EDGE[dx + ',' + dy]; const p0 = [x + ed[0], y + ed[1]], p1 = [x + ed[2], y + ed[3]];
        const ix = -dx * 0.24, iy = -dy * 0.24; const wob = (G.hash(i * 7 + dx * 3 + dy) - 0.5) * 0.12;
        const A0 = proj(p0[0], p0[1], h), A1 = proj(p1[0], p1[1], h), M = proj((p0[0] + p1[0]) / 2 + ix + wob, (p0[1] + p1[1]) / 2 + iy - wob, h), U0 = proj(p0[0], p0[1], h + 0.35), U1 = proj(p1[0], p1[1], h + 0.35);
        ctx.fillStyle = ugRGB(c, 0.82); ctx.beginPath(); ctx.moveTo(U0[0], U0[1]); ctx.lineTo(U1[0], U1[1]); ctx.lineTo(A1[0], A1[1]); ctx.quadraticCurveTo(M[0], M[1], A0[0], A0[1]); ctx.closePath(); ctx.fill();
      }
      // rubble at the foot of the walls
      let wall = 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!U.k[(y + dy) * N + x + dx]) wall++;
      if (wall && G.hash(i * 23 + 1) < 0.38 && !U.f[i]) {
        const n = 2 + Math.floor(G.hash(i * 29) * 3);
        for (let q = 0; q < n; q++) {
          const ox = (G.hash(i * 31 + q) - 0.5) * 12, oy = (G.hash(i * 37 + q) - 0.5) * 4, r = 1 + G.hash(i * 41 + q) * 1.6;
          ctx.fillStyle = ugRGB(c, 0.62); ctx.beginPath(); ctx.ellipse(m[0] + ox, m[1] + oy + 0.4, r * 1.2, r * 0.5, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = ugRGB(c, rn === 'gelo' ? 1.25 : 0.92); ctx.beginPath(); ctx.moveTo(m[0] + ox - r, m[1] + oy); ctx.lineTo(m[0] + ox - r * 0.4, m[1] + oy - r * 1.1); ctx.lineTo(m[0] + ox + r * 0.6, m[1] + oy - r * 0.9); ctx.lineTo(m[0] + ox + r, m[1] + oy); ctx.closePath(); ctx.fill();
        }
      }
      // puddles in the hollows and on wet stone; rimstone pools where the floor steps down in the limestone
      const lv = G.Caves.level(i);
      const hollow = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const j = (y + dy) * N + x + dx; return U.k[j] && U.k[j] !== K.PIT && U.k[j] !== K.LAKE && G.Caves.level(j) > lv + 0.3; });
      if (k === K.HALL && rn !== 'arenito' && (hollow ? hs < 0.6 : hs > 0.92)) {
        const px = m[0] + (hs - 0.5) * 6, py = m[1] + 0.5;
        if (rn === 'calcario' && hs < 0.3) { ctx.strokeStyle = 'rgba(232,220,196,0.55)'; ctx.lineWidth = 0.7; for (let q = 0; q < 3; q++) { ctx.beginPath(); ctx.ellipse(px, py + q * 1.2, 5 - q * 1.2, 1.6 - q * 0.3, 0, Math.PI * 0.05, Math.PI * 0.95); ctx.stroke(); } ctx.fillStyle = 'rgba(120,170,190,0.35)'; ctx.beginPath(); ctx.ellipse(px, py - 0.2, 4.2, 1.3, 0, 0, Math.PI * 2); ctx.fill(); }
        else { ctx.fillStyle = rn === 'gelo' ? 'rgba(220,240,255,0.5)' : 'rgba(40,60,70,0.45)'; ctx.beginPath(); ctx.ellipse(px, py, 3.5, 1.2, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(200,225,240,0.25)'; ctx.beginPath(); ctx.ellipse(px - 1, py - 0.3, 1.6, 0.4, 0, 0, Math.PI * 2); ctx.fill(); }
      }
    }
    if (k === K.DUG) { ctx.strokeStyle = '#6a4a28'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(m[0] - 7, m[1]); ctx.lineTo(m[0] - 7, m[1] - 11); ctx.lineTo(m[0] + 7, m[1] - 11); ctx.lineTo(m[0] + 7, m[1]); ctx.stroke(); }
    ugFaces(i, x, y, h, c, t, 0, null);
  }
  // a lone column of rock standing in a hall is round, not a box
  function ugPillar(i, x, y, h, c) {
    const U = G.S.ug; let low = 9;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const j = (y + dy) * N + x + dx; if (U.k[j] && U.k[j] !== G.Caves.K.PIT) low = Math.min(low, G.Caves.level(j)); }
    const hb = UF() + (low < 9 ? low : 0); if (hb >= h - 0.05) return false;
    const top = proj(x + 0.5, y + 0.5, h), bot = proj(x + 0.5, y + 0.5, hb); const rx = 12 + G.hash(i * 3) * 2, ry = rx * 0.5;
    const g = ctx.createLinearGradient(top[0] - rx, 0, top[0] + rx, 0); g.addColorStop(0, ugRGB(c, 0.95)); g.addColorStop(0.4, ugRGB(c, 0.78)); g.addColorStop(1, ugRGB(c, 0.48));
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(top[0] - rx, top[1]); ctx.quadraticCurveTo(top[0] - rx * 0.86, (top[1] + bot[1]) / 2, bot[0] - rx * 1.06, bot[1]);
    ctx.ellipse(bot[0], bot[1], rx * 1.06, ry * 1.06, 0, Math.PI, 0, true); ctx.quadraticCurveTo(top[0] + rx * 0.86, (top[1] + bot[1]) / 2, top[0] + rx, top[1]); ctx.ellipse(top[0], top[1], rx, ry, 0, 0, Math.PI); ctx.closePath(); ctx.fill();
    // its layers wrap around it
    ctx.lineWidth = 0.6;
    for (let q = 0; q < STRATA.length; q++) { const hh = UF() + STRATA[q]; if (hh <= hb + 0.1 || hh >= h - 0.1) continue; const p = proj(x + 0.5, y + 0.5, hh); ctx.strokeStyle = q % 2 ? 'rgba(255,240,220,0.07)' : 'rgba(18,12,8,0.22)'; ctx.beginPath(); ctx.ellipse(p[0], p[1], rx * 0.98, ry * 0.98, 0, 0.1, Math.PI - 0.1); ctx.stroke(); }
    ctx.fillStyle = ugRGB(c, 1.08); ctx.beginPath(); ctx.ellipse(top[0], top[1], rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,244,226,0.18)'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.ellipse(top[0], top[1], rx, ry, 0, Math.PI * 0.85, Math.PI * 1.9); ctx.stroke();
    return true;
  }
  function ugRock(i, t) {
    const U = G.S.ug; const x = i % N, y = (i / N) | 0; const h = ugH(i); const stub = h < UF() + UW() - 0.2;
    const c = ugCol[i];
    if (ugSet[i] === 2) { let open = 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) if (U.k[(y + dy) * N + x + dx]) open++; if (open >= 6 && ugPillar(i, x, y, h, c)) return; }
    const a = proj(x, y, h), b = proj(x + 1, y, h), d = proj(x + 1, y + 1, h), e = proj(x, y + 1, h);
    quadFill(a, b, d, e, ugRGB(c, stub ? 1.18 : 1));
    ugFaces(i, x, y, h, c, t, U.ore[i], ugRockName(ugCave[i]));
  }
  // a painting on the face of the wall it was made on (seen only when that face turns to the god)
  function ugPainting(p) {
    const r = p.i + p.w[0] + p.w[1] * N; const rx = r % N, ry = (r / N) | 0;
    const e = EDGE[(-p.w[0]) + ',' + (-p.w[1])]; if (!e) return;
    const base = UF() + G.Caves.level(p.i);
    let A = proj(rx + e[0], ry + e[1], base + 0.15), B = proj(rx + e[2], ry + e[3], base + 0.15);
    if (B[0] < A[0]) { const q = A; A = B; B = q; }
    const Hh = Math.min(UW(), UF() + UW() - base - 0.3) * HS;
    ctx.save(); ctx.transform(B[0] - A[0], B[1] - A[1], 0, -Hh, A[0], A[1]);
    G.CaveArt.painting(ctx, p, G.S.day - p.day);
    ctx.restore();
  }
  // the sides of the slab of rock
  function drawUnderSides(top) {
    const BOT = -6;
    const dX = depth(1, 0) - depth(0, 0), dY = depth(0, 1) - depth(0, 0);
    const faces = [];
    if (dY > 0) faces.push([0, N, N, N, 0, 1]); if (dY < 0) faces.push([N, 0, 0, 0, 0, -1]);
    if (dX > 0) faces.push([N, N, N, 0, 1, 0]); if (dX < 0) faces.push([0, 0, 0, N, -1, 0]);
    for (const [ax, ay, bx, by, nx, ny] of faces) {
      const a = proj(ax, ay, top), b = proj(bx, by, top), c = proj(bx, by, BOT), d = proj(ax, ay, BOT);
      const o = R.off(nx, ny); const sh = 0.75 - 0.12 * G.clamp(o[0] / 20, -1, 1);
      const g = ctx.createLinearGradient(0, Math.min(a[1], b[1]), 0, Math.max(c[1], d[1]));
      g.addColorStop(0, G.rgb([78 * sh, 70 * sh, 62 * sh])); g.addColorStop(1, G.rgb([34 * sh, 28 * sh, 24 * sh]));
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(20,14,10,0.3)'; ctx.lineWidth = 1;
      for (const hh of [top - 2.5, top - 5.5, 0]) { const p = proj(ax, ay, hh), q = proj(bx, by, hh); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); }
    }
  }
  const bandLooks = new Map();
  function banditLook(cv, k) {
    const key = cv.id * 10 + k; let l = bandLooks.get(key);
    if (!l) { const SK = ['#c99a74', '#a8784e', '#7a5232', '#e0b894'], HA = ['#2a1e16', '#4a3020', '#6a4a2a', '#1a1a1a']; l = { id: 8e6 + key, age: 30, g: 'm', skin: SK[(k + cv.id) % 4], hair: HA[(k * 3 + cv.id) % 4], role: 'cacador', _cloth: ['#3b3530', '#4a2a22', '#2f3a30'][k % 3], traits: [], face: 1, walkPh: 0, act: 'sit', actT: 0, moving: false, kidCloth: '#555' }; bandLooks.set(key, l); }
    return l;
  }
  function drawUnderItem(e, t) {
    const S = G.S, U = S.ug, FT = G.Caves.FT; const fl = UF();
    switch (e.t) {
      case 5: drawEntity(e, t, 1); break;
      case 20: ugFloor(e.o, t); break;
      case 21: ugRock(e.o, t); break;
      case 22: {
        const i = e.o; const f = U.f[i]; const sd = i * 7 + 3; const ox = (G.hash(sd) - 0.5) * 6, oy = (G.hash(sd + 1) - 0.5) * 3;
        const roof = (UW() - G.Caves.level(i)) * HS; const rn = ugRockName(U.id[i]);
        G.CaveArt.deco(ctx, f, e.sx + ox, e.sy + oy, sd, t, roof, rn);
        if ((f === FT.STAL || f === FT.COL) && G.hash(sd * 3) < 0.7) { // a drop falls from the roof, and splashes
          const ph = (t * 0.32 + G.hash(sd * 5) * 9) % 1; const dx = e.sx + ox + (G.hash(sd * 7) - 0.5) * 8;
          if (ph < 0.3) { const yy = e.sy - roof + (ph / 0.3) ** 2 * roof; ctx.strokeStyle = rn === 'gelo' ? 'rgba(230,248,255,0.8)' : 'rgba(200,225,240,0.75)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(dx, yy - 1.4); ctx.lineTo(dx, yy); ctx.stroke(); }
          else if (ph < 0.42) { const f2 = (ph - 0.3) / 0.12; ctx.strokeStyle = `rgba(210,230,240,${0.5 * (1 - f2)})`; ctx.lineWidth = 0.4; ctx.beginPath(); ctx.ellipse(dx, e.sy + 0.5, 1 + f2 * 3, (1 + f2 * 3) * 0.4, 0, 0, Math.PI * 2); ctx.stroke(); }
        }
        if (f === FT.CRYS) light(e.sx, e.sy - 6, 26, 'purple', 0.55);
        else if (f === FT.GLOW) light(e.sx, e.sy - roof, 34, 'green', 0.45);
        else if (f === FT.SHROOM && G.hash(sd * 7) < 0.5) light(e.sx, e.sy - 2, 16, 'cool', 0.4);
        break;
      }
      case 23: ugPainting(e.o); break;
      case 24: G.CaveArt.tomb(ctx, e.o, e.sx, e.sy, t); if (!e.o.robbed && e.o.gold) emisGlow.push(e.sx, e.sy - 3, 6, 'gold', 0.25); break;
      case 25: { const cv = e.o; const here = !!(cv.oracle && cv.oracle.here); G.CaveArt.oracle(ctx, e.sx, e.sy, t, here); light(e.sx, e.sy - 8, here ? 46 : 24, 'purple', here ? 0.8 : 0.4); break; }
      case 26: {
        const cv = e.o, b = cv.bandits; if (!b) break;
        G.CaveArt.camp(ctx, e.sx, e.sy, t, b); emisFire.push(e.sx, e.sy - 1, 0.6); light(e.sx, e.sy - 6, 64, 'fire', 0.95);
        const out = G.Caves.actors.filter(a => a.cave === cv.id).length; const home = Math.max(0, b.n - out);
        const cx = b.camp % N + 0.5, cy = ((b.camp / N) | 0) + 0.5;
        for (let k = 0; k < home; k++) {
          const a = k / Math.max(1, home) * Math.PI * 2 + 0.3; const ox = Math.cos(a) * 0.72, oy = Math.sin(a) * 0.72;
          const q = proj(cx + ox, cy + oy, G.Caves.floorAt(cx, cy)); const lk = banditLook(cv, k); lk.act = k === 0 ? 'sittalk' : (k % 2 ? 'sit' : 'sittalk'); lk.actT = t; G.faceTo(lk, -ox, -oy);
          G.Art.villager(ctx, lk, q[0], q[1], t, R.cam.zoom < 0.95);
        }
        break;
      }
      case 27: G.CaveArt.treasure(ctx, e.sx, e.sy, t, e.o.x * 7 + e.o.y); light(e.sx, e.sy - 3, 14, 'gold', 0.35); break;
      case 28: G.CaveArt.beast(ctx, e.o, e.sx, e.sy + (e.o.kind === 'peixe' ? 1.5 : 0), t); break;
      case 29: { const a = e.o; a.pose = 'sleep'; a.moving = false; G.Art.animal(ctx, a, e.sx, e.sy, t); break; }
      case 30: { const cv = e.o; const ph = G.Caves.batPhase(cv); const n = !ph ? cv.bats : ph.night ? cv.bats * 0.08 : ph.out ? cv.bats * (1 - ph.k) : cv.bats * ph.k; G.CaveArt.roost(ctx, e.sx, e.sy, n, t, cv.id * 13); break; }
      case 31: {
        const m = e.o; const dayA = G.clamp(1 - R.nightness() * 0.85, 0.12, 1); const kind = G.Caves.mouthKind(m, G.Caves.at(m.y * N + m.x));
        G.CaveArt.shaft(ctx, e.sx, e.sy, dayA, kind === 'poco' || kind === 'dolina' || kind === 'mina' ? 110 : 70, kind === 'mina' ? 'poco' : kind);
        // dust turning slowly in the light that falls in
        for (let q = 0; q < 9; q++) { const sd = m.x * 13 + m.y * 7 + q * 3; const f = (t * (0.03 + G.hash(sd) * 0.04) + G.hash(sd + 1)) % 1; const px = e.sx + (G.hash(sd + 2) - 0.5) * 18 + Math.sin(t * 0.4 + q) * 2, py = e.sy - f * 50; ctx.fillStyle = `rgba(255,244,214,${0.5 * dayA * Math.sin(f * Math.PI)})`; ctx.fillRect(px, py, 0.7, 0.7); }
        light(e.sx, e.sy - 12, 86, dayA > 0.4 ? 'gold' : 'cool', 0.25 + 0.75 * dayA);
        break;
      }
      case 32: { const a = e.o; a.pose = a.kind === 'cervo' || a.kind === 'veado' ? 'rest' : 'sleep'; a.moving = false; G.Art.animal(ctx, a, e.sx, e.sy, t); break; }
    }
  }
  function frameUnder(t, dt) {
    const S = G.S, U = S.ug, cam = R.cam; const C = G.Caves;
    if (ugVer !== U.ver || !ugImg || ugImg.width !== N) buildUnder();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const bg = ctx.createLinearGradient(0, 0, 0, canvas.height); bg.addColorStop(0, '#0e0c0c'); bg.addColorStop(1, '#231b16');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const shx = cam.shake > 0 ? (Math.random() - 0.5) * cam.shake * 16 : 0, shy = cam.shake > 0 ? (Math.random() - 0.5) * cam.shake * 16 : 0;
    const z = cam.zoom * dpr;
    const setWorld = (c, scale) => c.setTransform(z * scale, 0, 0, z * scale, (VW / 2 - (cam.x + shx) * cam.zoom) * dpr * scale, (VH / 2 - (cam.y + shy) * cam.zoom) * dpr * scale);
    setWorld(ctx, 1);
    const view = viewRect(60);
    lights.length = 0; emisWin.length = 0; emisFire.length = 0; emisGlow.length = 0; emisTorch.length = 0; overlays.length = 0;
    const fl = UF(), top = fl + UW();
    drawUnderSides(top);
    // the rock, cut flat (one picture: a tile per pixel)
    const p0 = proj(0, 0, top), p1 = proj(1, 0, top), p2 = proj(0, 1, top);
    ctx.save(); ctx.transform(p1[0] - p0[0], p1[1] - p0[1], p2[0] - p0[0], p2[1] - p0[1], p0[0], p0[1]); ctx.imageSmoothingEnabled = false; ctx.drawImage(ugImg, 0, 0); ctx.restore(); ctx.imageSmoothingEnabled = true;
    // the rock in front of a cave is cut down to a lip
    drawN = 0;
    for (const i of ugCells) {
      const x = i % N, y = (i / N) | 0; const k = U.k[i];
      const q = proj(x + 0.5, y + 0.5, k ? fl + C.level(i) : top);
      if (q[0] < view[0] - 40 || q[0] > view[2] + 40 || q[1] < view[1] - 50 || q[1] > view[3] + 60) continue;
      const d = depth(x + 0.5, y + 0.5);
      if (!k && ugSet[i] === 2) {
        // the rock in front of a cave is cut down to a lip just above the floor behind it
        let st = 0, low = 9;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const j = ny * N + nx; if (U.k[j] && depth(nx + 0.5, ny + 0.5) < d - 0.01) { st = 1; if (U.k[j] !== C.K.PIT) low = Math.min(low, C.level(j)); } }
        ugStub[i] = st; ugStubH[i] = fl + (low < 9 ? Math.max(low, -C.LV.max) : 0) + UG_STUB;
      }
      pushD(k ? d - 0.9 : d, k ? 20 : 21, i, q[0], q[1]);
      if (k && U.f[i]) pushD(d + 0.02, 22, i, q[0], q[1]);
    }
    for (const cv of C.all()) {
      const cq = proj(cv.cx + 0.5, cv.cy + 0.5, fl); if (cq[0] < view[0] - 420 || cq[0] > view[2] + 420 || cq[1] < view[1] - 320 || cq[1] > view[3] + 320) continue;
      for (const p of cv.paintings) {
        if (!p.w) continue;
        const r = p.i + p.w[0] + p.w[1] * N; const rx = r % N, ry = (r / N) | 0;
        if (ugStub[r] || depth((p.i % N) + 0.5, ((p.i / N) | 0) + 0.5) <= depth(rx + 0.5, ry + 0.5) + 0.01) continue;
        pushD(depth(rx + 0.5, ry + 0.5) + 0.02, 23, p, 0, 0);
      }
      const at = (i, dd, ty, o) => { const x = (i % N) + 0.5, y = ((i / N) | 0) + 0.5; const q = proj(x, y, fl + C.level(i)); pushD(depth(x, y) + dd, ty, o, q[0], q[1]); };
      for (const tb of cv.tombs) at(tb.i, 0.03, 24, tb);
      if (cv.oracle && cv.oracle.cell >= 0) at(cv.oracle.cell, 0.01, 25, cv);
      if (cv.bandits && cv.bandits.camp >= 0) at(cv.bandits.camp, 0.01, 26, cv);
      for (const tr of cv.treasures) if (!tr.found) at(tr.y * N + tr.x, 0.02, 27, tr);
      for (const a of cv.sleepers) { const q = proj(a.sx, a.sy, C.floorAt(a.sx, a.sy)); pushD(depth(a.sx, a.sy) + 0.04, 29, a, q[0], q[1]); }
      for (const a of cv.sheltered || []) { const q = proj(a.sx, a.sy, C.floorAt(a.sx, a.sy)); pushD(depth(a.sx, a.sy) + 0.04, 32, a, q[0], q[1]); }
      if (cv.bats && cv.roost) { const q = proj(cv.roost.x + 0.5, cv.roost.y + 0.5, top); pushD(depth(cv.roost.x + 0.5, cv.roost.y + 0.5) + 0.6, 30, cv, q[0], q[1] + 3); }
      for (const m of cv.mouths) at(m.y * N + m.x, 0.1, 31, m);
    }
    for (const b of U.beasts) { const q = proj(b.x, b.y, C.floorAt(b.x, b.y)); if (q[0] < view[0] || q[0] > view[2] || q[1] < view[1] || q[1] > view[3]) continue; pushD(depth(b.x, b.y) + 0.03, 28, b, q[0], q[1]); }
    for (const id of C.inside) {
      const v = S.villagers.get(id); if (!v || !v.ug) continue;
      if (v.age < 2 && v.carried) { const c = S.villagers.get(v.carrier); if (c) c.babyOn = v; continue; }
      const q = proj(v.x, v.y, C.floorAt(v.x, v.y)); pushD(depth(v.x, v.y) + 0.05, 5, v, q[0], q[1]);
    }
    const list = drawList.slice(0, drawN).sort((a, b) => a.d - b.d);
    ctx.lineJoin = 'round';
    for (const e of list) drawUnderItem(e, t);
    for (const id of C.inside) { const v = S.villagers.get(id); if (v) v.babyOn = null; }
    const sel = G.UI && G.UI.selected;
    if (sel && sel.x !== undefined && (sel.isCaveThing || sel.ug)) { const q = proj(sel.x, sel.y, C.floorAt(sel.x, sel.y)); ctx.strokeStyle = `rgba(255,214,110,${0.6 + 0.3 * Math.sin(t * 5)})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(q[0], q[1], 7, 3.5, 0, 0, Math.PI * 2); ctx.stroke(); }
    lightingPass(setWorld, 1, t, UG_AMB, 1);
    setWorld(ctx, 1);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawFlames(t); ctx.restore(); ctx.globalAlpha = 1;
    drawOverlays(t, view);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // a vignette: the eye adjusts to the dark
    const vg = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) * 0.3, canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (underT < 0.4) { ctx.fillStyle = `rgba(0,0,0,${1 - underT / 0.4})`; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    if (G.FX.flash > 0) { ctx.fillStyle = `rgba(${G.FX.flashColor},${Math.min(1, G.FX.flash) * 0.85})`; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  }
  // seen from above: bats leaving at dusk in a black ribbon, a few hunting at night, coming back at dawn
  function drawCaveBats(t, view) {
    if (!G.Caves || !G.S.ug) return;
    // swifts nest in the cliffs: in the first and the last light of the day they wheel and scream around the stone
    const tm = G.S.time; const swiftT = (tm > 0.04 && tm < 0.2) || (tm > 0.6 && tm < 0.71);
    if (swiftT) for (const cv of G.Caves.all()) for (const m of cv.mouths) {
      const kind = G.Caves.mouthKind(m, cv); if (kind !== 'paredao' && kind !== 'abrigo') continue;
      const base = proj(m.x + 0.5, m.y + 0.5, W.groundH(m.x + 0.5, m.y + 0.5));
      if (base[0] < view[0] - 200 || base[0] > view[2] + 200 || base[1] < view[1] - 200 || base[1] > view[3] + 120) continue;
      const fade = tm < 0.2 ? Math.sin((tm - 0.04) / 0.16 * Math.PI) : Math.sin((tm - 0.6) / 0.11 * Math.PI);
      const n = Math.round(10 * fade);
      for (let k = 0; k < n; k++) {
        const r = G.hash(m.x * 97 + m.y * 13 + k), r2 = G.hash(m.x * 31 + k * 7);
        const a = t * (1.6 + r * 1.4) * (k % 2 ? 1 : -1) + r2 * 6.28, R0 = 14 + r * 40;
        const x = base[0] + Math.cos(a) * R0 * 1.4, y = base[1] - 26 - r2 * 22 + Math.sin(a) * R0 * 0.38 + Math.sin(t * 3 + k) * 3;
        const f = Math.sin(t * 22 + k * 1.3) * 0.35;
        ctx.strokeStyle = 'rgba(28,24,30,0.85)'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(x - 3.2, y - 0.6 + f * 2); ctx.quadraticCurveTo(x - 1.2, y - 1.4, x, y); ctx.quadraticCurveTo(x + 1.2, y - 1.4, x + 3.2, y - 0.6 + f * 2); ctx.stroke();
      }
    }
    for (const cv of G.Caves.all()) {
      const ph = G.Caves.batPhase(cv); if (!ph) continue;
      const m = cv.mouths[0]; if (!m) continue;
      const base = proj(m.x + 0.5, m.y + 0.5, W.groundH(m.x + 0.5, m.y + 0.5));
      if (base[0] < view[0] - 320 || base[0] > view[2] + 320 || base[1] < view[1] - 260 || base[1] > view[3] + 200) continue;
      const n = Math.min(90, Math.round(cv.bats / 2.5));
      for (let k = 0; k < n; k++) {
        const r = G.hash(cv.id * 97 + k), r2 = G.hash(cv.id * 31 + k * 3);
        let x, y;
        if (ph.night) {
          if (k % 5) continue;
          const a = t * (0.5 + r * 0.9) + r2 * Math.PI * 2, R0 = 24 + r * 70; x = base[0] + Math.cos(a) * R0 * 1.5; y = base[1] - 36 - r2 * 30 + Math.sin(a) * R0 * 0.45;
        } else {
          const k0 = ph.out ? ph.k : 1 - ph.k; const s = k0 * 1.7 - r * 0.7; if (s < 0 || s > 1) continue;
          const a = r2 * Math.PI * 2 + s * 7; const dist = s * (60 + r * 160);
          x = base[0] + Math.cos(a) * 9 * (1 - s) + Math.cos(r2 * Math.PI * 2) * dist; y = base[1] - 8 - s * (40 + r2 * 70) + Math.sin(a) * 6;
        }
        G.CaveArt.bat(ctx, x, y, t, k);
      }
    }
  }

  // ------------------------------ the world at any angle ------------------------------
  // While the world turns, its ground is drawn tile by tile, back to front, at the angle of the moment,
  // with the colours and the light of the pictures of the four sides (not their small details); the
  // buildings stand as their masses (walls in their people's colours, the roof of their style).
  let spinCol = null, spinOrd = null, spinKey = null, spinSorted = null, spinBuck = null;
  function spinBase(i, x, y) {
    const S = G.S; const t = S.type[i]; let col;
    if (t === T.RIVER) {
      let wn = 0; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny) || S.type[ny * N + nx] <= T.RIVER) wn++; }
      col = G.lerpColor(COL.river, [52, 132, 176], G.clamp((wn - 11) / 13, 0, 1)).map(v => v + (G.hash(i) - 0.5) * 6);
    } else if (t === T.SEA && G.Sea && G.Sea.floor) col = G.Sea.seen(i, dLand[i]);
    else if (t <= T.SEA) col = WATER[Math.min(4, Math.max(0, dLand[i] - 1))];
    else {
      const H = S.H, V = N + 1;
      const h00 = H[y * V + x], h10 = H[y * V + x + 1], h11 = H[(y + 1) * V + x + 1], h01 = H[(y + 1) * V + x];
      const rg = Math.max(h00, h10, h11, h01) - Math.min(h00, h10, h11, h01);
      col = tileColor(i, x, y);
      if (rg > G.Relief.STEEP && S.burnt[i] <= 0 && S.scar[i] <= 0) col = rockColor(i, col, rg);
      else if (rg > 0.9 && (t === T.GRASS || t === T.MEADOW)) col = G.lerpColor(col, [142, 128, 104], G.clamp((rg - 0.9) / 0.8, 0, 1) * 0.35);
      if (S.road[i]) col = G.lerpColor(col, S.road[i] >= 2 ? [178, 170, 154] : COL.dirt, 0.75);
    }
    const q = v => Math.max(0, Math.min(255, Math.round(v)));
    return (q(col[0]) << 16) | (q(col[1]) << 8) | q(col[2]);
  }
  // far away a block of s×s tiles is one quad (a whole continent in sight stays cheap)
  const lodStep = () => { const z = R.cam.zoom, tiles = VW * VH / (256 * z * z); let st = 1; while (st < 8 && (tiles / (st * st) > 14000 || 32 * z * st < 5)) st *= 2; return st; };
  let qc = 1, qs = 0; // the turn of the light (the view's angle)
  // Quads of one colour that follow each other are filled together; each is pushed out by half a pixel
  // so no seam shows between neighbours (cheaper than outlining every one).
  const qStr = new Map(); let qCol = -1, qOpen = false, qGrow = 0;
  const qFlush = () => { if (qOpen) { ctx.fill(); qOpen = false; } qCol = -1; };
  function qPoly(a, q, d, e, col) {
    if (col !== qCol) {
      if (qOpen) ctx.fill();
      let f = qStr.get(col); if (!f) { if (qStr.size > 6000) qStr.clear(); f = 'rgb(' + (col >> 16) + ',' + ((col >> 8) & 255) + ',' + (col & 255) + ')'; qStr.set(col, f); }
      ctx.fillStyle = f; ctx.beginPath(); qCol = col; qOpen = true;
    }
    const cx = (a[0] + q[0] + d[0] + e[0]) / 4, cy = (a[1] + q[1] + d[1] + e[1]) / 4;
    const P = [a, q, d, e];
    for (let k = 0; k < 4; k++) {
      const v = P[k], dx = v[0] - cx, dy = v[1] - cy, l = Math.abs(dx) + Math.abs(dy) * 2 + 0.01, g = qGrow / l;
      if (k === 0) ctx.moveTo(v[0] + dx * g, v[1] + dy * g); else ctx.lineTo(v[0] + dx * g, v[1] + dy * g);
    }
    ctx.closePath();
  }
  function quadTile(x, y, s) {
    const S = G.S; const H = S.H, V = N + 1, STEEP = G.Relief.STEEP;
    const x1 = Math.min(N, x + s), y1 = Math.min(N, y + s);
    const cx = Math.min(N - 1, x + (s >> 1)), cy = Math.min(N - 1, y + (s >> 1)), i = cy * N + cx; const t = S.type[i];
    let c = spinCol[i]; if (c < 0) c = spinCol[i] = spinBase(i, cx, cy);
    let r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255;
    let a, q, d, e;
    if (t <= T.RIVER) { const hh = t === T.RIVER ? S.wl[i] : G.SEA; a = proj(x, y, hh); q = proj(x1, y, hh); d = proj(x1, y1, hh); e = proj(x, y1, hh); }
    else {
      const h00 = H[y * V + x], h10 = H[y * V + x1], h11 = H[y1 * V + x1], h01 = H[y1 * V + x];
      a = proj(x, y, h00); q = proj(x1, y, h10); d = proj(x1, y1, h11); e = proj(x, y1, h01);
      const gx = ((h10 + h11) - (h00 + h01)) / 2 / s, gy = ((h01 + h11) - (h00 + h10)) / 2 / s;
      const vx = gx * qc - gy * qs, vy = gx * qs + gy * qc;
      const rg = (Math.max(h00, h10, h11, h01) - Math.min(h00, h10, h11, h01)) / s;
      const light = rg > STEEP ? G.clamp(1 + vx * 0.085 + vy * 0.03, 0.5, 1.34) : G.clamp(1 + vx * 0.13 + vy * 0.045, 0.62, 1.28);
      r *= light; g *= light; b *= light;
    }
    // (a little rounding: neighbours of nearly one colour share a fill)
    r = r > 252 ? 252 : (r / 4 | 0) * 4; g = g > 252 ? 252 : (g / 4 | 0) * 4; b = b > 252 ? 252 : (b / 4 | 0) * 4;
    qPoly(a, q, d, e, (r << 16) | (g << 8) | b);
    if (t === T.RIVER && s === 1) { qFlush(); waterSteps(ctx, x, y, i, S.wl[i]); }
  }
  function spinBuffers() {
    const NN = N * N;
    if (!spinCol || spinCol.length !== NN) spinCol = new Int32Array(NN).fill(-1);
    if (!spinOrd || spinOrd.length !== NN) { spinOrd = new Int32Array(NN); spinKey = new Int32Array(NN); spinSorted = new Int32Array(NN); }
  }
  function drawSpinTerrain(view) {
    const S = G.S; spinBuffers();
    // the tiles in sight, with room for the mountains rising into the picture from below
    const cs = [R.screenToTile(0, 0), R.screenToTile(VW, 0), R.screenToTile(0, VH), R.screenToTile(VW, VH)];
    const mg = 3 + Math.ceil((R.maxH - G.SEA) * HS / 16);
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const p of cs) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
    const st = lodStep();
    x0 = Math.max(0, Math.floor(x0) - mg); y0 = Math.max(0, Math.floor(y0) - mg); x1 = Math.min(N - 1, Math.ceil(x1) + mg); y1 = Math.min(N - 1, Math.ceil(y1) + mg);
    x0 -= x0 % st; y0 -= y0 % st;
    // back to front: a counting sort on the depth of each tile's (block's) middle
    const NB = 6 * N + 8; if (!spinBuck || spinBuck.length !== NB + 1) spinBuck = new Int32Array(NB + 1);
    spinBuck.fill(0);
    let n = 0; const hs = st / 2, mx = 40 + st * 16, my = 50 + st * 8;
    for (let y = y0; y <= y1; y += st) for (let x = x0; x <= x1; x += st) {
      const cx = Math.min(N - 1, x + (st >> 1)), cy = Math.min(N - 1, y + (st >> 1)), i = cy * N + cx; const t = S.type[i];
      if (t === T.DEEP) continue;
      const hc = t <= T.RIVER ? (t === T.RIVER ? S.wl[i] : G.SEA) : S.th[i];
      const p = proj(x + hs, y + hs, hc);
      if (p[0] < view[0] - mx || p[0] > view[2] + mx || p[1] < view[1] - my || p[1] > view[3] + my + 20) continue;
      const k = Math.max(0, Math.min(NB, Math.round((depth(x + hs, y + hs) + N * 0.5) * 2)));
      spinKey[n] = k; spinOrd[n] = y * N + x; spinBuck[k]++; n++;
    }
    for (let k = 1; k <= NB; k++) spinBuck[k] += spinBuck[k - 1];
    for (let m = n - 1; m >= 0; m--) spinSorted[--spinBuck[spinKey[m]]] = spinOrd[m];
    qc = cphi; qs = sphi; qGrow = 0.6 / R.cam.zoom; qCol = -1;
    for (let m = 0; m < n; m++) { const i = spinSorted[m]; quadTile(i % N, (i / N) | 0, st); }
    qFlush();
  }
  // a chunk whose picture for this view is not painted yet: its tiles stand in for it, in the same order
  function quadChunk(ch) {
    spinBuffers();
    const st = lodStep(); qc = Math.cos(rot * QT); qs = Math.sin(rot * QT); qGrow = 0.6 / R.cam.zoom; qCol = -1;
    const S = G.S;
    for (let Y = ch.vy0; Y < ch.vy0 + C; Y += st) for (let X = ch.vx0; X < ch.vx0 + C; X += st) {
      const a = tileFromView(X, Y), b = tileFromView(X + st - 1, Y + st - 1);
      const x = Math.min(a[0], b[0]), y = Math.min(a[1], b[1]);
      if (S.type[Math.min(N - 1, y + (st >> 1)) * N + Math.min(N - 1, x + (st >> 1))] === T.DEEP) continue;
      quadTile(x, y, st);
    }
    qFlush();
  }
  // a box standing on the ground: the walls that face the god, then its top
  function massBox(x0, y0, x1, y1, base, hgt, colL, colR, colTop, roof) {
    const C = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    const lo = C.map(c => proj(c[0], c[1], base)), hi = C.map(c => proj(c[0], c[1], base + hgt));
    const mid = depth((x0 + x1) / 2, (y0 + y1) / 2), msx = (lo[0][0] + lo[2][0]) / 2;
    for (let k = 0; k < 4; k++) {
      const a = C[k], b = C[(k + 1) % 4];
      if (depth((a[0] + b[0]) / 2, (a[1] + b[1]) / 2) <= mid) continue; // the back walls are hidden
      ctx.fillStyle = (lo[k][0] + lo[(k + 1) % 4][0]) / 2 < msx ? colL : colR;
      const p = lo[k], q = lo[(k + 1) % 4], u = hi[(k + 1) % 4], v = hi[k];
      ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.lineTo(u[0], u[1]); ctx.lineTo(v[0], v[1]); ctx.closePath(); ctx.fill();
    }
    if (!roof) { ctx.fillStyle = colTop; ctx.beginPath(); ctx.moveTo(hi[0][0], hi[0][1]); for (let k = 1; k < 4; k++) ctx.lineTo(hi[k][0], hi[k][1]); ctx.closePath(); ctx.fill(); return; }
    // a hipped roof: four slopes up to a ridge (or a point), the back ones first
    const [rh, rc0, rc1, ridge] = roof; const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    const along = (x1 - x0) >= (y1 - y0); const half = ridge ? (along ? (x1 - x0) : (y1 - y0)) * 0.3 : 0;
    const R0 = along ? [cx - half, cy] : [cx, cy - half], R1 = along ? [cx + half, cy] : [cx, cy + half];
    const top0 = proj(R0[0], R0[1], base + hgt + rh), top1 = proj(R1[0], R1[1], base + hgt + rh);
    const faces = [];
    for (let k = 0; k < 4; k++) {
      const a = C[k], b = C[(k + 1) % 4]; const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      // the ridge end nearest to this eave
      const d0 = Math.hypot(mx - R0[0], my - R0[1]), d1 = Math.hypot(mx - R1[0], my - R1[1]);
      const pts = Math.abs(d0 - d1) < 1e-6 ? [hi[k], hi[(k + 1) % 4], top1, top0] : [hi[k], hi[(k + 1) % 4], d0 < d1 ? top0 : top1];
      faces.push({ d: depth(mx, my), pts, lit: (lo[k][0] + lo[(k + 1) % 4][0]) / 2 < msx });
    }
    faces.sort((a, b) => a.d - b.d);
    for (const f of faces) { ctx.fillStyle = f.lit ? rc0 : rc1; ctx.beginPath(); ctx.moveTo(f.pts[0][0], f.pts[0][1]); for (let k = 1; k < f.pts.length; k++) ctx.lineTo(f.pts[k][0], f.pts[k][1]); ctx.closePath(); ctx.fill(); }
  }
  // how tall each kind of building stands (walls, then roof), in pixels of the four-side pictures
  const MASS = {
    hut: [10, 12], house: [15, 11], sobrado: [26, 12], insula: [38, 12], quarteirao: [40, 14], storehouse: [16, 14], workshop: [18, 14],
    temple: [24, 16], monument: [40, 26], well: [5, 0], campfire: [1, 0], quartel: [18, 12], torre: [40, 9], mercado: [10, 10],
    biblioteca: [24, 10], teatro: [22, 8], banhos: [20, 10], palacio: [30, 16], aqueduto: [28, 6], maravilha: [46, 40], doca: [5, 0],
    celeiro: [20, 14], ruin: [6, 0], _: [16, 12],
  };
  const FLATROOF = { teatro: 1, mercado: 1, banhos: 1, doca: 1, well: 1, campfire: 1, ruin: 1, aqueduto: 1 };
  function drawMass(b, sx, sy, t, nightF) {
    if (b.type === 'praca' || b.type === 'farm') return; // they lie on the ground layer
    // the small things keep their own drawing (round, or made of posts: they look the same from any side)
    if (b.type === 'campfire') { drawCampfire(b, sx, sy, t, nightF); return; }
    if (b.type === 'cemetery') { drawCemetery(b, sx, sy, t); return; }
    if (b.type === 'cercado') { penStakes(b, penFront(b), b.built ? 1 : b.progress); return; }
    if (b.type === 'well' && b.built) { const base = W.maxH(b.x, b.y, b.w, b.h); massBox(b.x + 0.28, b.y + 0.28, b.x + b.w - 0.28, b.y + b.h - 0.28, base, 5 / HS, '#a39a8c', '#7f776b', '#34536c', null); return; }
    const pal = G.Arch.PAL[b.style] || G.Arch.PAL.classico; const m = MASS[b.type] || MASS._;
    const ruin = b.type === 'ruin', site = !b.built && !b.upgradeFrom;
    let wall = m[0] / HS, rh = m[1] / HS;
    if (site) { wall = Math.max(0.35, wall * (b.progress || 0)); rh = 0; }
    const base = W.maxH(b.x, b.y, b.w, b.h); const inset = b.w > 1 ? 0.14 : 0.12;
    const wl = site ? '#c4a57a' : ruin ? '#8a8378' : pal.wl, wr = site ? '#9c8058' : ruin ? '#6a645a' : pal.wr;
    const flat = site || ruin || FLATROOF[b.type] || pal.kind === 'flat' || rh < 0.3;
    const roof = flat ? null : [rh * (pal.pitch ? 0.6 + pal.pitch * 0.45 : 1), pal.roof[0], pal.roof[1] || pal.roof[0], b.w !== b.h || b.w > 1];
    massBox(b.x + inset, b.y + inset, b.x + b.w - inset, b.y + b.h - inset, base, wall, wl, wr, site ? '#b39466' : (pal.top || pal.roof[0]), roof);
  }

  // While the world turns, a building keeps its whole picture (roofs, walls, every detail): the picture of
  // the side it is nearest to. Around the middle of a quarter turn the picture of the next side fades in
  // over it, so the building turns with the world instead of jumping. (Far away, the masses are enough.)
  function drawSpinBuilding(b, sx, sy, t, nightF) {
    if (R.cam.zoom < 0.42) { drawMass(b, sx, sy, t, nightF); return; }
    drawBuilding(b, sx, sy, t, nightF);
    const q = spin.phi / QT, fr = q - Math.floor(q), d = Math.abs(fr - 0.5);
    if (d > 0.13) return;
    const other = fr < 0.5 ? Math.floor(q) + 1 : Math.floor(q);
    const a = Math.pow(1 - d / 0.13, 1.6);
    if (((other % 2) + 2) % 2 === (rot & 1)) return; // (the same picture: nothing to fade)
    ctx.save(); ctx.globalAlpha = a; mirOver = ((other % 4) + 4) % 4;
    try { drawBuilding(b, sx, sy, t, nightF); } finally { mirOver = -1; ctx.restore(); }
  }

  // ------------------------------ entities ------------------------------
  let farLod = false;
  // in water the body goes under: waders show from the knees up, swimmers only their back and head
  function sinkOf(o) {
    if (o.air || o.inside || o.aboard || o.held || o.dead || (o.z || 0) > 0.3) return 0;
    const S = G.S; const xi = o.x | 0, yi = o.y | 0; if (xi < 0 || yi < 0 || xi >= N || yi >= N) return 0;
    const i = yi * N + xi; const ty = S.type[i]; if (ty > T.RIVER) return 0;
    if (o.kind) { const d = G.Animals.DEF[o.kind]; if (!d || d.cls === 'water' || d.cls === 'air') return 0; return (ty <= T.SEA || S.deep[i] ? 3.4 : 1.4) * (d.size || 1); }
    return o.act === 'swim' || (o.task && o.task.type === 'swim') ? 0 : 2.4;
  }
  function drawSunk(draw, sx, sy, w, t) {
    ctx.save(); ctx.beginPath(); ctx.rect(sx - 80, sy - 160, 160, 159.6); ctx.clip(); draw(); ctx.restore();
    ctx.strokeStyle = 'rgba(235,248,255,0.55)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.ellipse(sx, sy, w + Math.sin(t * 4 + sx) * 0.35, w * 0.42, 0, 0, TAU); ctx.stroke();
  }

  function drawEntity(e, t, nightF) {
    const o = e.o; const sx = e.sx, sy = e.sy;
    const S = G.S; const Art = G.Art;
    switch (e.t) {
      case 1: { // tree
        const burning = S.fire[W.idx(o.x, o.y)] > 0.2;
        if (o.stage === 'grow') {
          if (o.size < 0.32) { if (!farLod) Art.draw(ctx, Art.sapling(), sx, sy, 0.6 + o.size); break; }
          const s = o.size;
          if (farLod && o.kind !== 'palm') { Art.draw(ctx, Art.canopy(o.kind, o.v), sx, sy, s); if (burning) emisFire.push(sx, sy - 12 * s, S.fire[W.idx(o.x, o.y)] * 1.4); break; }
          const wind = S.weather.windS;
          const sway = Math.sin(t * (1.3 + wind) + o.ph) * (0.6 + wind * 2.2) * s + Math.sin(t * 3.1 + o.ph * 2) * wind * 0.8;
          if (o.kind === 'palm') {
            Art.draw(ctx, Art.palmTrunk(), sx, sy, s);
            Art.draw(ctx, Art.canopy('palm', o.v), sx + 4 * s + sway * 1.3, sy - 20 * s, s);
          } else {
            Art.draw(ctx, Art.trunk(o.kind, o.v), sx, sy, s);
            Art.draw(ctx, Art.canopy(o.kind, o.v), sx + sway, sy, s);
          }
          if (o.chop > 0) { ctx.fillStyle = '#e8c890'; ctx.fillRect(sx - 1.2 * s, sy - 3 * s, 2.4 * s, 1.2 * s); }
        } else if (o.stage === 'fall') {
          const k = G.easeIn(Math.min(1, o.fallT / 0.9));
          ctx.save(); ctx.translate(sx, sy); ctx.rotate(R.sdir(o.fallDir, -o.fallDir) * k * Math.PI / 2 * 0.92);
          if (o.burntLog) Art.draw(ctx, Art.burntTree(), 0, 0, o.size);
          else { Art.draw(ctx, Art.trunk(o.kind === 'palm' ? 'oak' : o.kind, o.v), 0, 0, o.size); Art.draw(ctx, Art.canopy(o.kind === 'palm' ? 'oak' : o.kind, o.v), 0, 0, o.size); }
          ctx.restore();
          if (o.fallT > 0.85 && !o.dusted) { o.dusted = true; G.FX.dust(o.x + o.fallDir * 0.6, o.y - o.fallDir * 0.6, 5); G.FX.poof(o.x + o.fallDir * 0.8, o.y - o.fallDir * 0.8, '#5f9a3e'); }
        } else if (o.stage === 'log') {
          ctx.save(); ctx.translate(sx, sy); if (R.sdir(o.fallDir, -o.fallDir) < 0) ctx.scale(-1, 1);
          Art.draw(ctx, Art.stump(), 0, 0, 0.9); Art.draw(ctx, Art.log(o.burntLog), 9, 1, Math.max(0.6, o.size) * Math.min(1, 0.5 + o.wood / 8)); ctx.restore();
        } else if (o.stage === 'burnt') Art.draw(ctx, Art.burntTree(), sx, sy, Math.max(0.6, o.size));
        else if (o.stage === 'stump') Art.draw(ctx, Art.stump(), sx, sy, 0.9);
        if (burning) emisFire.push(sx, sy - 12 * o.size, S.fire[W.idx(o.x, o.y)] * 1.4);
        break;
      }
      case 2: { // rock
        const sc = 0.5 + 0.5 * Math.sqrt(o.stone / Math.max(1, o.max));
        Art.draw(ctx, Art.rock(o.v, o.meteor), sx, sy, sc);
        if (o.meteor && o.stone > o.max * 0.6) emisGlow.push(sx, sy - 4, 12, 'red', 0.35 + 0.1 * Math.sin(t * 3 + o.id));
        break;
      }
      case 3: { // bush
        const dry = o.burnt > 0 || S.weather.drought > 0;
        Art.draw(ctx, Art.bush(o.v, o.burnt > 0), sx, sy, 1);
        if (!o.burnt && o.berries > 0) Art.berries(ctx, sx, sy, o.berries, 1);
        break;
      }
      case 4: if (spin) drawSpinBuilding(o, sx, sy, t, nightF); else drawBuilding(o, sx, sy, t, nightF); break;
      case 5: {
        const v = o;
        const night = nightF > 0.5;
        v.torch = R.under ? (v.age >= 10 && (v.moving || v.id % 2 === 0)) : night && !v.sleeping && v.moving && v.age >= 14 && ((v.task && v.task.torch) || v.id % 3 === 0);
        if (v.age >= 2) {
          const baby = v.babyOn;
          const sink = sinkOf(v);
          if (sink) drawSunk(() => G.Art.villager(ctx, v, sx, sy + sink, t, R.cam.zoom < 0.95), sx, sy, 4.2, t);
          else G.Art.villager(ctx, v, sx, sy, t, R.cam.zoom < 0.95);
          if (v._ruler && !v.inside) { const sc = v.age < 16 ? 0.55 + (v.age / 16) * 0.42 : 1; emisGlow.push(sx, sy - 15 * sc, 6, 'gold', 0.3 + 0.1 * Math.sin(t * 3)); }
          if ((v.chosen || v.prophet) && !v.inside) emisGlow.push(sx, sy - 8, v.chosen ? 11 : 9, v.chosen ? 'gold' : 'cool', 0.28 + 0.12 * Math.sin(t * 2.5 + v.id));
        } else { // baby lying (no carrier)
          ctx.fillStyle = '#f4efe3'; ctx.beginPath(); ctx.ellipse(sx, sy - 1, 2.2, 1.2, 0, 0, TAU); ctx.fill();
          ctx.fillStyle = v.skin; ctx.beginPath(); ctx.arc(sx - 1.8, sy - 1.6, 1, 0, TAU); ctx.fill();
        }
        if (v.torch) { const tx = sx + R.sface(v) * 3, ty = sy - 12.5; light(tx, ty, R.under ? 48 : 30, 'warm', 0.85); emisTorch.push(tx, ty); }
        if (v.emo || (R.hover === v) || (G.UI && G.UI.selected === v)) overlays.push(v, sx, sy);
        break;
      }
      case 6: {
        if (o.tamed && !o.dead) { // the guardian's collar: a ring in its people's colour
          ctx.strokeStyle = G.Fac.hex(o.tamed); ctx.lineWidth = 1.4; ctx.globalAlpha = 0.85;
          ctx.beginPath(); ctx.ellipse(sx, sy, 6 * (o.big || 1), 2.6 * (o.big || 1), 0, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
        }
        const sink = sinkOf(o) * (o.big || 1);
        if (sink) drawSunk(() => { ctx.save(); ctx.translate(sx, sy + sink); ctx.scale(o.big || 1, o.big || 1); G.Art.animal(ctx, o, 0, 0, t, false); ctx.restore(); }, sx, sy, 3.6 * (o.big || 1) * ((G.Animals.DEF[o.kind] || {}).size || 1), t);
        else if (o.big > 1) { ctx.save(); ctx.translate(sx, sy); ctx.scale(o.big, o.big); G.Art.animal(ctx, o, 0, 0, t, false); ctx.restore(); }
        else G.Art.animal(ctx, o, sx, sy, t, R.cam.zoom < 0.7);
        if (o.legend && !o.dead) emisGlow.push(sx + R.sface(o) * 4 * o.big, sy - 6 * o.big, 4, 'red', 0.5 + 0.2 * Math.sin(t * 3 + o.id));
        if (o.kind === 'wolf' && !o.dead && nightF > 0.4) emisGlow.push(sx + R.sface(o) * 5.4, sy - 5.7, 2.5, o.summoned ? 'red' : 'gold', 0.9);
        if (R.hover === o || (G.UI && G.UI.selected === o)) overlays.push(o, sx, sy);
        break;
      }
      case 7: G.Art.boat(ctx, o, sx, sy, t); break;
      case 8: if (spin) { const pl = G.Arch.PAL[o.st] || G.Arch.PAL.classico; const bh = W.groundH(o.x + 0.5, o.y + 0.5); massBox(o.x + 0.3, o.y + 0.3, o.x + 0.7, o.y + 0.7, bh, 6, pl.wl, pl.wr, pl.top || pl.wl); } else G.Art.drawM(ctx, G.Arch.arch(o.d, o.st), sx, sy, 1); break;
      case 9: {
        const g = o.back ? o.ret : o.goods;
        const spr = G.Arch.cart(o.civ, !!g, g ? g.k : 'food');
        const bob = Math.abs(Math.sin(t * 7 + o.id)) * 0.4;
        ctx.fillStyle = 'rgba(20,30,20,0.2)'; ctx.beginPath(); ctx.ellipse(sx - 2, sy, 9, 2.6, 0, 0, TAU); ctx.fill();
        const cf = R.sface(o);
        ctx.save(); ctx.translate(sx, sy - bob); ctx.scale(cf, 1); G.Art.draw(ctx, spr, 0, 0, 0.8); ctx.restore();
        if (nightF > 0.45) { const lx = sx + cf * 9, ly = sy - 9; light(lx, ly, 26, 'warm', 0.55 * nightF); emisTorch.push(lx, ly); }
        break;
      }
      case 10: G.Naval && G.Naval.drawShip(ctx, o, sx, sy, t, nightF, light, emisTorch); break;
      case 11: if (spin) { const x = o.i % N, y = (o.i / N) | 0; const stone = o.w.mat === 'pedra'; massBox(x + 0.18, y + 0.18, x + 0.82, y + 0.82, W.groundH(x + 0.5, y + 0.5), S.wall[o.i] === 1 ? 4.2 : 5, stone ? '#b8b0a0' : '#9a7650', stone ? '#8e8678' : '#76583a', stone ? '#cfc8b8' : '#ad8a62'); break; } else { const wv = S.wall[o.i]; const hp = S.wallHp[o.i] || 0; G.Art.drawM(ctx, G.Siege.wallSprite(G.Siege.wallDir(o.i), o.w.style, o.w.mat, wv !== 1, wv === 4, hp < (o.w.mat === 'pedra' ? 90 : 35)), sx, sy, 1); if (wv === 4 && nightF > 0.3) { light(sx, sy - 14, 22, 'warm', 0.5 * nightF); emisTorch.push(sx + 6, sy - 16); } break; }
      case 12: G.Siege.drawEngine(ctx, o, sx, sy, t); break;
      case 13: o.fn(ctx, o, sx, sy, t, nightF, FXA); break;
      case 14: {
        const cv = o.cv, m = o.m; const kind = G.Caves.mouthKind(m, cv); const bi = S.biome ? S.biome[m.y * N + m.x] : 0;
        // the door looks down the slope: mirrored when the slope falls to the left of the screen
        const off = m.fx || m.fy ? R.off(m.fx, m.fy) : [1, 0];
        // on chill mornings (and frosty nights in the snow) the cave's breath shows at the door
        const tm = S.time; const cold = bi === 1 || bi === 2; const morn = tm > 0.01 && tm < 0.2 ? Math.sin((tm - 0.01) / 0.19 * Math.PI) : 0;
        const breath = Math.max(morn * (cold ? 1 : S.weather && S.weather.rain > 0.2 ? 0.7 : 0.4), cold && nightF > 0.5 ? 0.6 : 0);
        G.CaveArt.mouth(ctx, sx, sy, t, { kind, biome: bi, mirror: off[0] < -0.5, spring: !!m.spring, seed: m.x * 31 + m.y * 7, breath, sealed: !!m.sealed, tomb: cv.tombs.length > 0, oracle: !!cv.oracle, mine: !!cv.dug, camp: !!cv.bandits, night: nightF > 0.5 }); if (cv.bandits && nightF > 0.5) light(sx, sy - 3, 22, 'fire', 0.55); if (cv.oracle && cv.oracle.here) emisGlow.push(sx, sy - 14, 8, 'purple', 0.35); break; }
      case 15: G.Art.villager(ctx, o.look, sx, sy, t, R.cam.zoom < 0.95); break;
    }
  }

  // which pieces of hiding terrain have someone behind them this frame
  const OG = 48; let ogrid = new Float32Array(0);
  function occluders(list, view, wantHi) {
    const out = [];
    const gw = Math.ceil((view[2] - view[0]) / OG) + 1, gh = Math.ceil((view[3] - view[1] + 200) / OG) + 1;
    if (ogrid.length < gw * gh) ogrid = new Float32Array(gw * gh);
    ogrid.fill(1e9, 0, gw * gh);
    const oy = view[1] - 200;
    let any = false;
    for (const e of list) {
      let hw = 14, top = 46;
      if (e.t === 4) { hw = (e.o.w + e.o.h) * 16; top = 90; } else if (e.t === 1) { hw = 16; top = 56; } else if (e.t === 10) { hw = 26; top = 60; }
      const cx0 = Math.max(0, Math.floor((e.sx - hw - view[0]) / OG)), cx1 = Math.min(gw - 1, Math.floor((e.sx + hw - view[0]) / OG));
      const cy0 = Math.max(0, Math.floor((e.sy - top - oy) / OG)), cy1 = Math.min(gh - 1, Math.floor((e.sy + 4 - oy) / OG));
      for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) { const k = cy * gw + cx; if (e.d < ogrid[k]) { ogrid[k] = e.d; any = true; } }
    }
    if (!any) return out;
    for (const ch of chunkOrder) {
      if (ch.empty || !ch.occ || !ch.occ.length || ch.occRot !== rot) continue;
      if (ch.sx > view[2] || ch.sx + ch.w < view[0] || ch.sy > view[3] || ch.sy + ch.h < view[1]) continue;
      const hiOK = ch.canvas && ch.rot === rot, loOK = ch.lo && ch.loRot === rot;
      const cv = hiOK && ((wantHi && !ch.dirty) || !loOK) ? ch.canvas : loOK ? ch.lo : null; if (!cv) continue;
      const rs = cv === ch.canvas ? RS : LRS;
      for (const g of ch.occ) {
        if (g.x1 < view[0] || g.x0 > view[2] || g.y1 < view[1] || g.y0 > view[3]) continue;
        const key = g.d + 0.98;
        const cx0 = Math.max(0, Math.floor((g.x0 - view[0]) / OG)), cx1 = Math.min(gw - 1, Math.floor((g.x1 - view[0]) / OG));
        const cy0 = Math.max(0, Math.floor((g.y0 - oy) / OG)), cy1 = Math.min(gh - 1, Math.floor((g.y1 - oy) / OG));
        let hit = false;
        for (let cy = cy0; cy <= cy1 && !hit; cy++) for (let cx = cx0; cx <= cx1; cx++) if (ogrid[cy * gw + cx] < key) { hit = true; break; }
        if (hit) out.push({ key, g, ch, cv, rs });
      }
    }
    out.sort((a, b) => a.key - b.key);
    return out;
  }
  function drawPiece(p) {
    const g = p.g, ch = p.ch, rs = p.rs;
    ctx.save(); ctx.clip(g.path);
    ctx.drawImage(p.cv, (g.x0 - ch.sx) * rs, (g.y0 - ch.sy) * rs, (g.x1 - g.x0) * rs, (g.y1 - g.y0) * rs, g.x0, g.y0, g.x1 - g.x0, g.y1 - g.y0);
    ctx.restore();
  }

  function drawCrown(x, y, t) {
    ctx.fillStyle = '#f2c14e';
    ctx.beginPath(); ctx.moveTo(x - 2.4, y); ctx.lineTo(x - 2.6, y - 2.6); ctx.lineTo(x - 1.2, y - 1.3); ctx.lineTo(x, y - 3.2); ctx.lineTo(x + 1.2, y - 1.3); ctx.lineTo(x + 2.6, y - 2.6); ctx.lineTo(x + 2.4, y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#b8862a'; ctx.fillRect(x - 2.4, y - 0.7, 4.8, 0.7);
    ctx.fillStyle = '#e8453c'; ctx.fillRect(x - 0.4, y - 1.6, 0.8, 0.8);
    emisGlow.push(x, y - 1.5, 5, 'gold', 0.35 + 0.1 * Math.sin(t * 3));
  }
  function drawBanner(x, y, hex, t, h) {
    h = h || 24;
    ctx.strokeStyle = '#5a3c22'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - h); ctx.stroke();
    ctx.fillStyle = '#d8b25a'; ctx.beginPath(); ctx.arc(x, y - h - 0.6, 0.9, 0, TAU); ctx.fill();
    const w = Math.sin(t * 3 + x * 0.05);
    ctx.fillStyle = hex;
    ctx.beginPath(); ctx.moveTo(x, y - h + 0.5);
    ctx.bezierCurveTo(x + 3, y - h - 0.6 + w, x + 6, y - h + 1.2 - w, x + 10, y - h + 0.3 + w * 0.8);
    ctx.lineTo(x + 10, y - h + 6.3 + w * 0.8);
    ctx.bezierCurveTo(x + 6, y - h + 7.2 - w, x + 3, y - h + 5.4 + w, x, y - h + 6.5);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.16)'; ctx.fillRect(x, y - h + 4.2, 10, 0.8);
    ctx.fillStyle = 'rgba(255,248,225,0.92)'; ctx.beginPath(); ctx.arc(x + 5, y - h + 3.2 + w * 0.3, 1.25, 0, TAU); ctx.fill();
  }
  R.drawBanner = drawBanner;
  function penStakes(b, edges, frac) {
    ctx.fillStyle = '#7a5634';
    const n = Math.max(1, Math.round(b.w * 5));
    let drawn = 0; const total = edges.length * n;
    for (const [x0, y0, x1, y1] of edges) for (let k = 0; k <= n; k++) {
      if (drawn++ > total * frac) return;
      const px = x0 + (x1 - x0) * k / n, py = y0 + (y1 - y0) * k / n;
      const p = proj(px, py, W.hAt(px, py));
      ctx.fillRect(p[0] - 0.7, p[1] - 7, 1.4, 7);
      ctx.beginPath(); ctx.moveTo(p[0] - 0.7, p[1] - 7); ctx.lineTo(p[0], p[1] - 8.6); ctx.lineTo(p[0] + 0.7, p[1] - 7); ctx.fill();
    }
  }
  const penBack = b => R.rectEdges(b.x + 0.05, b.y + 0.05, b.x + b.w - 0.05, b.y + b.h - 0.05).back;
  const penFront = b => R.rectEdges(b.x + 0.05, b.y + 0.05, b.x + b.w - 0.05, b.y + b.h - 0.05).front;
  function drawBuilding(b, sx, sy, t, nightF) {
    const S = G.S; const Art = G.Art;
    const def = G.BDEF[b.type];
    const [cx, cy] = G.Village.center(b);
    const base = W.maxH(b.x, b.y, b.w, b.h);
    const minH = W.minH(b.x, b.y, b.w, b.h);
    // plinth so buildings sit on slopes
    if (b.built && b.type !== 'cemetery' && b.type !== 'ruin' && b.type !== 'campfire' && base - minH > 0.15) {
      const hx = b.w / 2 - 0.02, hy = b.h / 2 - 0.02;
      const drop = (base - minH) * HS + 1; const m = R.mirror();
      ctx.fillStyle = '#8a7a64';
      ctx.beginPath(); const a = [sx + (-hx - hy) * 16 * m, sy + (-hx + hy) * 8], bb = [sx + (hx - hy) * 16 * m, sy + (hx + hy) * 8], c2 = [sx + (hx + hy) * 16 * m, sy + (hx - hy) * 8];
      ctx.moveTo(a[0], a[1]); ctx.lineTo(bb[0], bb[1]); ctx.lineTo(c2[0], c2[1]); ctx.lineTo(c2[0], c2[1] + drop); ctx.lineTo(bb[0], bb[1] + drop); ctx.lineTo(a[0], a[1] + drop); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.beginPath(); ctx.moveTo(bb[0], bb[1]); ctx.lineTo(c2[0], c2[1]); ctx.lineTo(c2[0], c2[1] + drop); ctx.lineTo(bb[0], bb[1] + drop); ctx.closePath(); ctx.fill();
    }
    const burning = S.fire[W.idx(b.x, b.y)] > 0.15 || (b.w > 1 && S.fire[W.idx(b.x + 1, b.y + 1)] > 0.15);
    if (b.type === 'campfire') { drawCampfire(b, sx, sy, t, nightF); return; }
    if (b.type === 'cemetery') { drawCemetery(b, sx, sy, t); return; }
    if (b.type === 'ruin') { drawRuin(b, sx, sy, t); return; }
    if (b.type === 'cercado') { if (b.built) penStakes(b, penFront(b), 1); else { penStakes(b, penFront(b), b.progress); overlays.push(b, sx, sy - 14); } return; }
    if (!b.built) { drawSite(b, sx, sy, t); if (burning) emisFire.push(sx, sy - 8, 1); return; }
    const spr = Art.building(b.type, b.v, b.style, b.wd);
    if (!spr) return;
    // storehouse piles
    if (b.type === 'storehouse' && !b.style) drawPiles(b, sx, sy);
    Art.drawM(ctx, spr, sx, sy, 1);
    const m = R.mirror();
    if (b.hp < b.maxHp * 0.6) { ctx.fillStyle = 'rgba(30,20,15,0.25)'; ctx.beginPath(); ctx.ellipse(sx, sy - 8, 10 * b.w, 6 * b.h, 0, 0, TAU); ctx.fill(); }
    // night windows & fires
    const occupied = G.Village && (!def.housing ? true : hasResidents(b));
    if (nightF > 0.15 && occupied && spr.win.length && !(G.Fest && G.Fest.darkB(b))) {
      emisWin.push(spr, sx, sy, nightF * (0.85 + 0.15 * Math.sin(t * 3 + b.id)) * m);
      light(sx, sy - 8, 30 + b.w * 12, 'warm', 0.55 * nightF);
    }
    if (b.type === 'temple' || b.type === 'maravilha' || b.type === 'palacio') { for (const f of spr.fires) { emisFire.push(sx + f[0] * m, sy + f[1], 0.45); light(sx + f[0] * m, sy + f[1], 40, 'warm', 0.8); } for (const g of spr.glow) emisGlow.push(sx + g[0] * m, sy + g[1], b.type === 'maravilha' ? 14 : 8, 'gold', 0.4 + nightF * 0.5 + (b.type === 'maravilha' ? 0.15 * Math.sin(t * 2) : 0)); if (b.type === 'maravilha') light(sx, sy - 50, 110, 'gold', 0.6 * nightF + 0.1); }
    else if (KILN[b.type]) { for (const g of spr.glow) emisGlow.push(sx + g[0] * m, sy + g[1], b.type === 'ourives' ? 3 : 6, b.type === 'ourives' ? 'gold' : 'fire', 0.6 + 0.3 * Math.sin(t * 9 + b.id)); light(sx + 10 * m, sy - 4, 28, 'warm', 0.5 * nightF + 0.1); for (const f of spr.fires) if (b.type !== 'workshop' && b.type !== 'forja' && b.type !== 'olaria') emisFire.push(sx + f[0] * m, sy + f[1], 0.3); }
    else if (b.type === 'estatua' || b.type === 'mina') { for (const g of spr.glow) emisGlow.push(sx + g[0] * m, sy + g[1], b.type === 'estatua' ? 12 : 3, 'gold', (b.type === 'estatua' ? 0.45 : 0.3) + nightF * 0.5 + 0.15 * Math.sin(t * 2 + g[1])); if (b.type === 'estatua') light(sx, sy - 30, 60, 'gold', 0.6 * nightF + 0.1); for (const f of spr.fires) { emisTorch.push(sx + f[0] * m, sy + f[1]); light(sx + f[0] * m, sy + f[1], 22, 'warm', 0.6 * nightF); } }
    else if (b.type === 'mercado_negro') { for (const f of spr.fires) { emisTorch.push(sx + f[0] * m, sy + f[1]); light(sx + f[0] * m, sy + f[1], 20, 'warm', 0.7 * nightF + 0.05); } }
    else if (FIRELIT[b.type]) for (const f of spr.fires) { emisFire.push(sx + f[0] * m, sy + f[1], 0.35); light(sx + f[0] * m, sy + f[1], 34, 'warm', 0.7); }
    if (b.type === 'monument' || b.type === 'praca' || b.type === 'biblioteca') { for (const g of spr.glow) emisGlow.push(sx + g[0] * m, sy + g[1], 10, 'gold', 0.5 + nightF * 0.6 + 0.15 * Math.sin(t * 2)); if (b.type === 'monument') light(sx, sy - 60, 80, 'gold', 0.7 * nightF + 0.1); }
    if (b.type === 'quartel') { const f = G.Fac.ofSet(b.set); if (f) drawBanner(sx - 22 * m, sy - 16, G.Fac.hex(f.id), t, 22); }
    if (b.type === 'torre') { const f = G.Fac.ofSet(b.set); if (f) drawBanner(sx + 1 * m, sy - 50, G.Fac.hex(f.id), t, 10); }
    if (burning) emisFire.push(sx, sy - 14, 1.2);
  }
  const homesLit = new Set(); // homes with someone living in them (rebuilt each night frame)
  function hasResidents(b) { return homesLit.has(b.id); }
  function drawPiles(b, sx, sy) {
    const fac = G.Fac.ofSet(b.set); if (!fac) return;
    const cap = G.Village.cap(fac.id); const st = fac.stock;
    const wood = Math.ceil(Math.min(1, st.wood / cap) * 8), stone = Math.ceil(Math.min(1, st.stone / cap) * 6), food = Math.ceil(Math.min(1, st.food / cap) * 6);
    const at = (dx, dy) => { const o = R.soff(dx, dy); return [sx + o[0], sy + o[1]]; };
    for (let k = 0; k < wood; k++) { const [px, py] = at(1.05, -0.6 + (k % 4) * 0.2); ctx.fillStyle = '#8f6238'; ctx.fillRect(px - 4, py - 2 - Math.floor(k / 4) * 1.6, 7, 1.5); ctx.fillStyle = '#d6b27a'; ctx.fillRect(px + 3, py - 2 - Math.floor(k / 4) * 1.6, 0.8, 1.5); }
    for (let k = 0; k < stone; k++) { const [px, py] = at(-0.6 + (k % 3) * 0.25, 1.05); ctx.fillStyle = k % 2 ? '#a9a49a' : '#8a857c'; ctx.beginPath(); ctx.ellipse(px, py - 1.5 - Math.floor(k / 3) * 1.8, 2.2, 1.4, 0, 0, TAU); ctx.fill(); }
    for (let k = 0; k < food; k++) { const [px, py] = at(0.3 + (k % 3) * 0.22, 1.05); ctx.fillStyle = '#9a6a3a'; ctx.fillRect(px - 1.8, py - 3.5 - Math.floor(k / 3) * 3, 3.6, 3.2); ctx.fillStyle = k % 2 ? '#e05a3a' : '#e8c24a'; ctx.fillRect(px - 1.4, py - 3.9 - Math.floor(k / 3) * 3, 2.8, 1); }
  }
  function drawCampfire(b, sx, sy, t, nightF) {
    // log seats around
    ctx.fillStyle = '#7a5230';
    for (const [dx, dy, r] of [[1.1, 0.1, 0.4], [-0.2, 1.1, -0.3], [-1, -0.6, 0.6]]) { const o = R.off(dx, dy); const px = sx + o[0], py = sy + o[1]; ctx.save(); ctx.translate(px, py); ctx.rotate(r); ctx.fillRect(-5, -1.5, 10, 3); ctx.fillStyle = '#c9a26b'; ctx.fillRect(4.2, -1.5, 1, 3); ctx.restore(); ctx.fillStyle = '#7a5230'; }
    // stones
    for (let k = 0; k < 9; k++) { const a = k / 9 * TAU; const px = sx + Math.cos(a) * 6.5, py = sy + Math.sin(a) * 3.2; ctx.fillStyle = k % 2 ? '#8e8a82' : '#a8a49a'; ctx.beginPath(); ctx.ellipse(px, py - 0.6, 1.8, 1.2, 0, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#2a2220'; ctx.beginPath(); ctx.ellipse(sx, sy, 4.5, 2.2, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(sx - 4, sy + 1); ctx.lineTo(sx + 3, sy - 2); ctx.moveTo(sx - 3, sy - 2); ctx.lineTo(sx + 4, sy + 1); ctx.stroke();
    if (!b.built) return;
    const fac = G.Fac.ofSet(b.set); if (fac) drawBanner(sx + 9, sy + 2, G.Fac.hex(fac.id), t, 24);
    if (G.Fest && G.Fest.dark(b.set)) return; // the New Fire: every flame in the city is out
    emisFire.push(sx, sy - 3, 0.9 + 0.1 * Math.sin(t * 7));
    light(sx, sy - 4, 70 + Math.sin(t * 9) * 4 + Math.sin(t * 13) * 3, 'warm', 0.65 + nightF * 0.45);
  }
  function drawCemetery(b, sx, sy, t) {
    // low fence
    ctx.strokeStyle = '#7a6a54'; ctx.lineWidth = 0.7;
    const hx = b.w / 2 - 0.08, hy = b.h / 2 - 0.08;
    const cor = [[-hx, -hy], [hx, -hy], [hx, hy], [-hx, hy]].map(([dx, dy]) => { const o = R.off(dx, dy); return [sx + o[0], sy + o[1]]; });
    ctx.beginPath(); for (let k = 0; k < 4; k++) { ctx.moveTo(cor[k][0], cor[k][1] - 2.5); ctx.lineTo(cor[(k + 1) % 4][0], cor[(k + 1) % 4][1] - 2.5); } ctx.stroke();
    ctx.fillStyle = '#6a5a44'; for (const c of cor) ctx.fillRect(c[0] - 0.5, c[1] - 3.5, 1, 3.5);
    const S = G.S;
    b.graves.forEach((id, k) => {
      const dx = -0.62 + (k % 4) * 0.42, dy = -0.55 + Math.floor(k / 4) * 0.5;
      const o = R.off(dx, dy); const px = sx + o[0], py = sy + o[1];
      const p = S.dead.get(id);
      const cross = p && p.g === 'm' ? id % 2 : id % 3 === 0;
      if (cross) { ctx.fillStyle = '#6e5238'; ctx.fillRect(px - 0.5, py - 6, 1, 6); ctx.fillRect(px - 2, py - 4.6, 4, 1); }
      else { ctx.fillStyle = '#a8a39a'; ctx.beginPath(); ctx.moveTo(px - 1.8, py); ctx.lineTo(px - 1.8, py - 4); ctx.arc(px, py - 4, 1.8, Math.PI, TAU); ctx.lineTo(px + 1.8, py); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#7e7970'; ctx.fillRect(px + 0.6, py - 4.5, 1.2, 4.5); }
      ctx.fillStyle = 'rgba(80,60,40,0.4)'; ctx.beginPath(); ctx.ellipse(px + 1.5, py + 1.5, 3, 1.2, 0, 0, TAU); ctx.fill();
      if (p && S.day - p.died < 3) { ctx.fillStyle = ['#ff8fb0', '#ffe066', '#ffffff'][id % 3]; ctx.beginPath(); ctx.arc(px + 2.2, py + 0.8, 0.8, 0, TAU); ctx.arc(px + 3.2, py + 1.2, 0.7, 0, TAU); ctx.fill(); }
    });
  }
  function drawRuin(b, sx, sy, t) {
    const a = Math.min(1, b.ruinT / 30);
    ctx.globalAlpha = a;
    ctx.fillStyle = '#3a302a';
    for (let k = 0; k < 6 * b.w; k++) { const dx = (G.hash(b.id * 7 + k) - 0.5) * b.w * 0.8, dy = (G.hash(b.id * 13 + k) - 0.5) * b.h * 0.8; const o = R.off(dx, dy); const px = sx + o[0], py = sy + o[1]; ctx.beginPath(); ctx.ellipse(px, py - 1, 2.5 + G.hash(k + b.id) * 2, 1.5, 0, 0, TAU); ctx.fill(); }
    ctx.strokeStyle = '#1e1714'; ctx.lineWidth = 1.2;
    for (let k = 0; k < 3 * b.w; k++) { const dx = (G.hash(b.id * 3 + k) - 0.5) * b.w * 0.7; const px = sx + dx * 20, py = sy + G.hash(b.id + k * 5) * 6 - 3; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + (G.hash(k * 9) - 0.5) * 8, py - 5 - G.hash(k) * 5); ctx.stroke(); }
    ctx.globalAlpha = 1;
    if (G.R() < 0.02) G.FX.smokePuff(b.x + b.w / 2, b.y + b.h / 2);
  }
  function drawSite(b, sx, sy, t) {
    const def = G.BDEF[b.type];
    const p = b.progress;
    const hx = b.w / 2 - 0.1, hy = b.h / 2 - 0.1;
    const P = (dx, dy, z) => { const o = R.soff(dx, dy, z); return [sx + o[0], sy + o[1]]; };
    const wallH = b.type === 'hut' ? 7 : b.type === 'temple' ? 22 : b.type === 'monument' ? 30 : b.type === 'farm' ? 0 : b.type === 'maravilha' ? 34 : b.type === 'quarteirao' ? 30 : b.type === 'insula' ? 24 : b.type === 'sobrado' ? 18 : def.w >= 3 ? 20 : 12;
    if (b.type === 'farm') return;
    if (b.upgradeFrom && p < 0.35) {
      const old = G.Art.building(b.upgradeFrom, b.v, b.style); if (old) G.Art.drawM(ctx, old, sx, sy, 1);
      // scaffolding goes up around the old house
      ctx.strokeStyle = '#8a6a44'; ctx.lineWidth = 0.8;
      for (const [dx, dy] of [[-0.45, 0.45], [0.45, 0.45], [0.45, -0.45]]) { const a = P(dx, dy, 0), c2 = P(dx, dy, wallH + 8); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(c2[0], c2[1]); ctx.stroke(); }
    } else {
      // foundation stones along the edges
      ctx.fillStyle = '#9a958c';
      const edge = [[-hx, -hy, hx, -hy], [hx, -hy, hx, hy], [hx, hy, -hx, hy], [-hx, hy, -hx, -hy]];
      for (const [x0, y0, x1, y1] of edge) for (let k = 0; k <= 4 * b.w; k++) { const f = k / (4 * b.w); const q = P(x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, 0); ctx.fillRect(q[0] - 1, q[1] - 1.2, 2, 1.4); }
      if (p > 0.15) {
        const fh = wallH * G.clamp((p - 0.15) / 0.3, 0, 1);
        const wf = G.clamp((p - 0.45) / 0.4, 0, 1) * wallH;
        // partial walls
        if (wf > 0) {
          ctx.fillStyle = '#c9a26b';
          ctx.beginPath(); const a = P(-hx, hy, 0), c2 = P(hx, hy, 0), d = P(hx, hy, wf), e = P(-hx, hy, wf); ctx.moveTo(a[0], a[1]); ctx.lineTo(c2[0], c2[1]); ctx.lineTo(d[0], d[1]); ctx.lineTo(e[0], e[1]); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#a07f50';
          ctx.beginPath(); const f1 = P(hx, hy, 0), f2 = P(hx, -hy, 0), f3 = P(hx, -hy, wf), f4 = P(hx, hy, wf); ctx.moveTo(f1[0], f1[1]); ctx.lineTo(f2[0], f2[1]); ctx.lineTo(f3[0], f3[1]); ctx.lineTo(f4[0], f4[1]); ctx.closePath(); ctx.fill();
        }
        // posts & beams
        ctx.strokeStyle = '#7a5230'; ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (const [dx, dy] of [[-hx, -hy], [hx, -hy], [hx, hy], [-hx, hy]]) { const a = P(dx, dy, 0), c2 = P(dx, dy, fh); ctx.moveTo(a[0], a[1]); ctx.lineTo(c2[0], c2[1]); }
        if (p > 0.45) { const q = [P(-hx, -hy, fh), P(hx, -hy, fh), P(hx, hy, fh), P(-hx, hy, fh)]; ctx.moveTo(q[0][0], q[0][1]); for (let k = 1; k <= 4; k++) ctx.lineTo(q[k % 4][0], q[k % 4][1]); }
        ctx.stroke();
        if (p > 0.85) {
          ctx.globalAlpha = (p - 0.85) / 0.15;
          const spr = G.Art.building(b.type, b.v, b.style, b.wd); if (spr) G.Art.drawM(ctx, spr, sx, sy, 1);
          ctx.globalAlpha = 1;
        }
      }
    }
    // delivered materials piles
    const tot = G.Village.totalCost(def);
    const delivered = tot - b.need.wood - b.need.stone;
    const woodIn = (def.cost.wood || 0) - b.need.wood, stoneIn = (def.cost.stone || 0) - b.need.stone;
    const left = 1 - p;
    for (let k = 0; k < Math.min(6, Math.ceil(woodIn * left / 3)); k++) { const q = P(hx + 0.3, -hy + 0.2 + (k % 3) * 0.15, Math.floor(k / 3) * 1.5); ctx.fillStyle = '#8f6238'; ctx.fillRect(q[0] - 4, q[1] - 1.5, 7, 1.5); }
    for (let k = 0; k < Math.min(5, Math.ceil(stoneIn * left / 4)); k++) { const q = P(-hx + 0.2 + k * 0.18, hy + 0.3, 0); ctx.fillStyle = '#9a958c'; ctx.beginPath(); ctx.ellipse(q[0], q[1] - 1, 1.8, 1.2, 0, 0, TAU); ctx.fill(); }
    overlays.push(b, sx, sy - wallH - 12);
  }

  // ------------------------------ particles ------------------------------
  function drawParticles(layer, view) {
    const L = G.FX.list;
    const puff = G.Art.puff();
    let rainPath = false;
    if (layer === 0) { ctx.beginPath(); }
    for (let k = 0; k < L.length; k++) {
      const p = L[k]; if (p.layer !== layer) continue;
      const q = proj(p.x, p.y, p.h); const sx = q[0], sy = q[1] - p.z;
      if (sx < view[0] || sx > view[2] || sy < view[1] - 100 || sy > view[3]) continue;
      if (p.k === 3) { ctx.moveTo(sx, sy); ctx.lineTo(sx - p.vx * 3, sy - 7); rainPath = true; }
    }
    if (layer === 0 && rainPath) { ctx.strokeStyle = 'rgba(200,222,245,0.6)'; ctx.lineWidth = 0.7; ctx.stroke(); }
    for (let k = 0; k < L.length; k++) {
      const p = L[k]; if (p.layer !== layer || p.k === 3) continue;
      const q = proj(p.x, p.y, p.h); const sx = q[0], sy = q[1] - p.z;
      if (sx < view[0] || sx > view[2] || sy < view[1] - 100 || sy > view[3]) continue;
      const f = 1 - p.life / p.max;
      let a = p.a * (p.life < 0.3 * p.max ? p.life / (0.3 * p.max) : 1);
      if (p.fadeIn && f < p.fadeIn) a *= f / p.fadeIn;
      const s = p.s0 + (p.s1 - p.s0) * f;
      ctx.globalAlpha = a;
      switch (p.k) {
        case 0: ctx.fillStyle = p.c; ctx.fillRect(sx - s / 2, sy - s / 2, s, s); break;
        case 1: ctx.drawImage(G.Art.glow(p.c.startsWith('#') ? p.c : 'warm'), sx - s * 2, sy - s * 2, s * 4, s * 4); break;
        case 2: { const img = tintedPuff(p.c); ctx.drawImage(img, sx - s, sy - s, s * 2, s * 2); break; }
        case 4: { const o = R.off(p.vx, p.vy); ctx.strokeStyle = p.c; ctx.lineWidth = s * 0.7; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx - o[0] * 0.25, sy + p.vz * 0.04 - o[1] * 0.25); ctx.stroke(); break; }
        case 5: ctx.fillStyle = p.c; ctx.save(); ctx.translate(sx, sy); ctx.rotate(p.rot); ctx.fillRect(-s / 2, -s / 4, s, s / 2); ctx.restore(); break;
        case 6: ctx.fillStyle = p.c; ctx.save(); ctx.translate(sx, sy); ctx.rotate(p.rot); ctx.fillRect(-s / 2, -s / 2, s, s); ctx.restore(); break;
        case 7: ctx.fillStyle = p.c; ctx.beginPath(); ctx.moveTo(sx, sy + s * 0.9); ctx.bezierCurveTo(sx - s * 1.4, sy - s * 0.1, sx - s * 0.7, sy - s * 1.2, sx, sy - s * 0.4); ctx.bezierCurveTo(sx + s * 0.7, sy - s * 1.2, sx + s * 1.4, sy - s * 0.1, sx, sy + s * 0.9); ctx.fill(); break;
        case 8: { ctx.fillStyle = p.c; ctx.beginPath(); ctx.moveTo(sx, sy - s); ctx.lineTo(sx + s * 0.28, sy - s * 0.28); ctx.lineTo(sx + s, sy); ctx.lineTo(sx + s * 0.28, sy + s * 0.28); ctx.lineTo(sx, sy + s); ctx.lineTo(sx - s * 0.28, sy + s * 0.28); ctx.lineTo(sx - s, sy); ctx.lineTo(sx - s * 0.28, sy - s * 0.28); ctx.closePath(); ctx.fill(); break; }
        case 9: ctx.fillStyle = p.c; ctx.save(); ctx.translate(sx, sy); ctx.rotate(p.rot); ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.55, 0, 0, TAU); ctx.fill(); ctx.restore(); break;
        case 10: { ctx.fillStyle = p.c; const fl = Math.abs(Math.sin(R.time * 18 + k)); ctx.fillRect(sx - s * fl, sy - s * 0.5, s * fl, s); ctx.fillRect(sx, sy - s * 0.5, s * fl, s); break; }
        case 12: { const o = R.off(p.vx, p.vy, p.vz); const svx = o[0], svy = o[1]; const l = Math.hypot(svx, svy) || 1; ctx.strokeStyle = p.c; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx - svx / l * 6, sy - svy / l * 6); ctx.stroke(); ctx.fillStyle = '#e8e2d0'; ctx.fillRect(sx - svx / l * 6 - 0.6, sy - svy / l * 6 - 0.6, 1.2, 1.2); break; }
        case 13: { const fl = Math.sin(R.time * 14 + k) * 2; ctx.strokeStyle = p.c; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(sx - 3, sy - fl); ctx.lineTo(sx, sy); ctx.lineTo(sx + 3, sy - fl); ctx.stroke(); break; }
        case 11: { ctx.fillStyle = p.c; ctx.save(); ctx.translate(sx, sy); ctx.rotate(p.vz < 0 ? 0.6 : -0.6); ctx.beginPath(); ctx.ellipse(0, 0, 2.2, 0.9, 0, 0, TAU); ctx.fill(); ctx.restore(); if (p.life < 0.05) G.FX.splash(p.x, p.y, 0.2); break; }
      }
    }
    ctx.globalAlpha = 1;
  }
  const puffTints = {};
  function tintedPuff(col) {
    // col like rgba(r,g,b,a) -> tint puff (alpha ignored; particle alpha drives it)
    let c = puffTints[col]; if (c) return c;
    const m = col.match(/\d+(\.\d+)?/g) || [255, 255, 255, 1];
    const a = m[3] !== undefined ? parseFloat(m[3]) : 1;
    c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, `rgba(${m[0]},${m[1]},${m[2]},${a})`); g.addColorStop(0.55, `rgba(${m[0]},${m[1]},${m[2]},${a * 0.6})`); g.addColorStop(1, `rgba(${m[0]},${m[1]},${m[2]},0)`);
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    puffTints[col] = c; return c;
  }

  // ------------------------------ clouds ------------------------------
  function drawClouds(t, view, nightF) {
    const S = G.S;
    const zoomFade = G.clamp((2.4 - R.cam.zoom) / 1.2, 0.25, 1);
    for (const c of S.clouds) {
      const h = W.groundH(c.x, c.y);
      const p = proj(c.x, c.y, h);
      const inten = G.Nature.cloudIntensity(c);
      const spr = G.Art.cloud(c.kind === 'natural' ? 0 : 1 + (Math.floor(c.ph) % 2), c.kind !== 'natural');
      ctx.globalAlpha = Math.min(1, inten * 1.2) * 0.9 * zoomFade;
      const sc = c.r / 4.2;
      G.Art.draw(ctx, spr, p[0] + Math.sin(t * 0.4 + c.ph) * 3, p[1] - 92 + Math.sin(t * 0.7 + c.ph) * 2, sc * 1.4);
    }
    const skyA = G.clamp((1.9 - R.cam.zoom) / 0.9, 0, 1) * 0.55 * (1 - nightF * 0.6);
    if (skyA > 0.01) {
      ctx.globalAlpha = skyA;
      for (const c of skyClouds) { const p = proj(c.x, c.y, G.SEA); G.Art.draw(ctx, G.Art.cloud(3 + c.v, false), p[0], p[1] - 170, c.s); }
    }
    ctx.globalAlpha = 1;
    // birds
    ctx.strokeStyle = nightF > 0.5 ? 'rgba(220,220,240,0.6)' : 'rgba(40,40,50,0.75)'; ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (const b of birds) {
      const p = proj(b.x, b.y, G.SEA);
      for (const [ox, oy, ph] of b.fl) {
        const bx = p[0] - ox * 16 * R.sdir(b.vx, b.vy), by = p[1] - 120 + oy * 10;
        const fl = Math.sin(t * 10 + ph) * 1.6;
        ctx.moveTo(bx - 3, by - fl); ctx.lineTo(bx, by); ctx.lineTo(bx + 3, by - fl);
      }
    }
    ctx.stroke();
  }

  // ------------------------------ lighting ------------------------------
  function lightingPass(setWorld, nightF, t, ambOver, strOver) {
    const S = G.S;
    const amb = ambOver || ambient();
    const glowActive = G.FX.glows.length > 0;
    if (!ambOver && Math.min(amb[0], amb[1], amb[2]) > 236 && !glowActive) return;
    lctx.setTransform(1, 0, 0, 1, 0, 0);
    lctx.globalCompositeOperation = 'source-over';
    lctx.fillStyle = G.rgb(amb); lctx.fillRect(0, 0, lightC.width, lightC.height);
    lctx.globalCompositeOperation = 'lighter';
    setWorld(lctx, 0.5);
    const strength = strOver !== undefined ? strOver : G.clamp((nightF - 0.25) * 1.6, 0, 1);
    for (let k = 0; k < lights.length; k += 5) {
      const a = lights[k + 4] * strength; if (a <= 0.01) continue;
      const r = lights[k + 2];
      lctx.globalAlpha = Math.min(1, a);
      lctx.drawImage(G.Art.glow(lights[k + 3]), lights[k] - r, lights[k + 1] - r, r * 2, r * 2);
    }
    // fires light the night
    for (let k = 0; k < emisFire.length; k += 3) {
      const r = 26 + emisFire[k + 2] * 30;
      lctx.globalAlpha = Math.min(1, (0.5 + emisFire[k + 2] * 0.4) * (0.3 + strength * 0.7));
      lctx.drawImage(G.Art.glow('fire'), emisFire[k] - r, emisFire[k + 1] - r, r * 2, r * 2);
    }
    for (const gl of G.FX.glows) {
      const [sx, sy] = proj(gl.x, gl.y, gl.h);
      const a = gl.life / gl.max; lctx.globalAlpha = a;
      lctx.drawImage(G.Art.glow(gl.c), sx - gl.r, sy - gl.r * 0.7, gl.r * 2, gl.r * 1.4);
    }
    for (const p of G.FX.list) {
      if (p.layer !== 1 || p.k !== 1 || p.s0 < 3) continue;
      const q = proj(p.x, p.y, p.h); const sx = q[0], sy = q[1] - p.z;
      lctx.globalAlpha = 0.25 * p.life / p.max; const r = p.s0 * 5;
      lctx.drawImage(G.Art.glow('fire'), sx - r, sy - r, r * 2, r * 2);
    }
    lctx.globalAlpha = 1;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(lightC, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  // fires, torches and glows (also the only light of the world below)
  function drawFlames(t) {
    // fires (flame shapes)
    for (let k = 0; k < emisFire.length; k += 3) {
      const sx = emisFire[k], sy = emisFire[k + 1], f = emisFire[k + 2];
      const s = 3 + f * 5;
      ctx.globalAlpha = 0.55;
      ctx.drawImage(G.Art.glow('fire'), sx - s * 3, sy - s * 3, s * 6, s * 5);
      for (let q = 0; q < 3; q++) {
        const fl = Math.sin(t * (9 + q * 3) + sx * 0.1 + q * 2);
        const hgt = s * (1.6 + 0.4 * fl) * (q === 1 ? 1.2 : 0.8);
        const ox = (q - 1) * s * 0.55;
        const g = ctx.createLinearGradient(0, sy, 0, sy - hgt);
        g.addColorStop(0, 'rgba(255,120,40,0.95)'); g.addColorStop(0.5, 'rgba(255,190,70,0.85)'); g.addColorStop(1, 'rgba(255,240,170,0)');
        ctx.globalAlpha = 0.9; ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(sx + ox - s * 0.5, sy); ctx.quadraticCurveTo(sx + ox - s * 0.6, sy - hgt * 0.5, sx + ox + fl * 1.2, sy - hgt); ctx.quadraticCurveTo(sx + ox + s * 0.6, sy - hgt * 0.5, sx + ox + s * 0.5, sy); ctx.closePath(); ctx.fill();
      }
    }
    // torches
    for (let k = 0; k < emisTorch.length; k += 2) {
      const sx = emisTorch[k], sy = emisTorch[k + 1]; const fl = Math.sin(t * 17 + sx) * 0.4;
      ctx.globalAlpha = 0.7; ctx.drawImage(G.Art.glow('fire'), sx - 7, sy - 8, 14, 14);
      ctx.globalAlpha = 1; ctx.fillStyle = '#ffd27a';
      ctx.beginPath(); ctx.moveTo(sx - 1.2, sy); ctx.quadraticCurveTo(sx - 1, sy - 2, sx + fl, sy - 3.6); ctx.quadraticCurveTo(sx + 1, sy - 2, sx + 1.2, sy); ctx.closePath(); ctx.fill();
    }
    // glows
    for (let k = 0; k < emisGlow.length; k += 5) {
      const r = emisGlow[k + 2]; ctx.globalAlpha = Math.min(1, emisGlow[k + 4]);
      ctx.drawImage(G.Art.glow(emisGlow[k + 3]), emisGlow[k] - r, emisGlow[k + 1] - r, r * 2, r * 2);
    }
  }
  // ------------------------------ emissive ------------------------------
  function drawEmissive(t, nightF, view) {
    const S = G.S;
    ctx.save();
    // windows
    for (let k = 0; k < emisWin.length; k += 4) {
      const spr = emisWin[k], sx = emisWin[k + 1], sy = emisWin[k + 2], a = Math.abs(emisWin[k + 3]), m = emisWin[k + 3] < 0 ? -1 : 1;
      ctx.globalAlpha = Math.min(1, a);
      ctx.fillStyle = '#ffcf73';
      for (const w of spr.win) { ctx.beginPath(); ctx.moveTo(sx + w[0][0] * m, sy + w[0][1]); for (let q = 1; q < w.length; q++) ctx.lineTo(sx + w[q][0] * m, sy + w[q][1]); ctx.closePath(); ctx.fill(); }
    }
    ctx.globalCompositeOperation = 'lighter';
    G.Powers.drawGlow && G.Powers.drawGlow(ctx, proj, t, nightF);
    ctx.globalAlpha = 1;
    drawFlames(t);
    // crater embers
    const tv = R.tileView;
    if (tv) for (let y = tv[1]; y <= tv[3]; y++) for (let x = tv[0]; x <= tv[2]; x++) {
      const i = y * N + x; const sc = S.scar[i];
      if (sc > G.DAY_LEN * 6) {
        const a = (sc - G.DAY_LEN * 6) / G.DAY_LEN;
        const p = proj(x + 0.5, y + 0.5, W.hAt(x + 0.5, y + 0.5));
        ctx.globalAlpha = a * (0.45 + 0.2 * Math.sin(t * 3 + i));
        ctx.drawImage(G.Art.glow('red'), p[0] - 18, p[1] - 10, 36, 20);
      }
    }
    // glow particles
    drawParticles(1, view);
    // healing pillar
    const pl = G.FX.pillar;
    if (pl && pl.t > 0) {
      pl.t -= 1 / 60;
      const p = proj(pl.x, pl.y, W.groundH(pl.x, pl.y)); const a = pl.t / pl.max;
      const g = ctx.createLinearGradient(0, p[1] - 300, 0, p[1]);
      g.addColorStop(0, `rgba(${pl.c},0)`); g.addColorStop(1, `rgba(${pl.c},${0.5 * a})`);
      ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(p[0] - 30 * a - 10, p[1] - 300, (30 * a + 10) * 2, 300);
    }
    // rings
    for (const r of G.FX.rings) {
      const f = 1 - r.life / r.max; const rad = r.r0 + (r.r1 - r.r0) * G.easeOut(f);
      const p = proj(r.x, r.y, r.h);
      ctx.globalCompositeOperation = r.glow ? 'lighter' : 'source-over';
      ctx.globalAlpha = (1 - f);
      ctx.strokeStyle = r.c; ctx.lineWidth = r.w * (1 - f * 0.5);
      ctx.beginPath(); ctx.ellipse(p[0], p[1], rad * 22.6, rad * 11.3, 0, 0, TAU); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'lighter';
    // lightning bolts
    for (const b of G.FX.bolts) {
      const p = proj(b.x, b.y, b.h);
      const a = b.life / b.max; const flick = Math.random() < 0.3 ? 0.4 : 1;
      for (const [w, col] of [[6, `rgba(150,180,255,${0.35 * a * flick})`], [2.6, `rgba(220,230,255,${0.9 * a * flick})`], [1, `rgba(255,255,255,${a * flick})`]]) {
        ctx.globalAlpha = 1; ctx.strokeStyle = col; ctx.lineWidth = w;
        ctx.beginPath(); ctx.moveTo(p[0] + b.segs[0][0], p[1] - b.segs[0][1]);
        for (const s of b.segs) ctx.lineTo(p[0] + s[0], p[1] - s[1]);
        for (const br of b.branches) { ctx.moveTo(p[0] + br[0][0], p[1] - br[0][1]); for (const s of br) ctx.lineTo(p[0] + s[0], p[1] - s[1]); }
        ctx.stroke();
      }
    }
    // meteors
    for (const m of S.meteors) {
      const k = G.clamp(m.t / m.delay, 0, 1); const e = k * k; const off = 1 - e;
      const p = proj(m.x, m.y, W.groundH(m.x, m.y));
      const mx = p[0] + 300 * off, my = p[1] - 520 * off;
      if (k < 0.02) continue;
      for (let q = 9; q >= 0; q--) {
        const tx = mx + 300 * 0.045 * q * (0.4 + k), ty = my - 520 * 0.045 * q * (0.4 + k);
        const r = (26 - q * 2.2) * (0.6 + k * 0.7);
        ctx.globalAlpha = 0.55 - q * 0.05;
        ctx.drawImage(G.Art.glow(q < 3 ? 'gold' : 'fire'), tx - r, ty - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1;
      const r = 9 + k * 10;
      ctx.drawImage(G.Art.glow('gold'), mx - r * 2.4, my - r * 2.4, r * 4.8, r * 4.8);
      ctx.drawImage(G.Art.glow('white'), mx - r, my - r, r * 2, r * 2);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#3a2a24'; ctx.beginPath(); ctx.arc(mx, my, 2.2 + k * 3, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ffcf7a'; ctx.beginPath(); ctx.arc(mx - 0.8 - k, my + 0.6 + k, 1 + k * 1.6, 0, TAU); ctx.fill();
      ctx.globalCompositeOperation = 'lighter';
    }
    ctx.restore();
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }

  // ------------------------------ overlays ------------------------------
  R.showLabels = true;
  function drawCityLabels(view) {
    const S = G.S; const zoom = R.cam.zoom;
    if (!R.showLabels || !G.Main || G.Main.mode !== 'game' || (G.Cinema && G.Cinema.on) || R.under) return;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const s of S.settlements.values()) {
      const tier = s.tier || 0;
      const p = proj(s.cx, s.cy, W.groundH(s.cx, s.cy));
      const y = p[1] - (46 + tier * 9);
      if (p[0] < view[0] - 80 || p[0] > view[2] + 80 || y < view[1] - 40 || y > view[3] + 40) continue;
      const f = G.Fac.get(s.fac); const hex = f ? G.Fac.hex(f.id) : '#cccccc';
      const fs = (10.5 + tier * 1.3) / zoom, ss = 8 / zoom;
      ctx.font = `700 ${fs}px Cinzel, Georgia, serif`;
      const tw = ctx.measureText(s.name).width;
      const sub = G.City.TIERS[tier] + (f && G.Fac.capitalOf(f.id) === s ? ' · capital' : '');
      ctx.font = `600 ${ss}px Nunito, sans-serif`;
      const sw = ctx.measureText(sub).width;
      const w = Math.max(tw, sw) + 18 / zoom, h = fs + ss + 8 / zoom;
      const a = zoom > 2.6 ? 0.5 : 0.85;
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(22,18,14,0.62)';
      const r = 6 / zoom, x0 = p[0] - w / 2, y0 = y - h / 2;
      ctx.beginPath(); ctx.moveTo(x0 + r, y0); ctx.arcTo(x0 + w, y0, x0 + w, y0 + h, r); ctx.arcTo(x0 + w, y0 + h, x0, y0 + h, r); ctx.arcTo(x0, y0 + h, x0, y0, r); ctx.arcTo(x0, y0, x0 + w, y0, r); ctx.fill();
      ctx.fillStyle = hex; ctx.fillRect(x0, y0 + h - 2.2 / zoom, w, 2.2 / zoom);
      ctx.beginPath(); ctx.moveTo(p[0] - 3 / zoom, y0 + h); ctx.lineTo(p[0] + 3 / zoom, y0 + h); ctx.lineTo(p[0], y0 + h + 4 / zoom); ctx.fill();
      ctx.fillStyle = tier >= 3 ? '#ffe4a0' : '#fff4dc'; ctx.font = `700 ${fs}px Cinzel, Georgia, serif`; ctx.fillText(s.name, p[0], y0 + 3 / zoom + fs / 2);
      ctx.fillStyle = 'rgba(240,225,200,0.75)'; ctx.font = `600 ${ss}px Nunito, sans-serif`; ctx.fillText(sub, p[0], y0 + 4 / zoom + fs + ss / 2);
    }
    ctx.globalAlpha = 1; ctx.textBaseline = 'alphabetic';
  }
  // the named places of the land: peaks, passes, waterfalls, lakes
  const PICON = { pico: '▲', passo: '⌇', cachoeira: '≋', lago: '◌', caverna: '◖' };
  function drawPlaceLabels(view) {
    const zoom = R.cam.zoom;
    if (!R.showLabels || !G.Main || G.Main.mode !== 'game' || (G.Cinema && G.Cinema.on) || zoom < 0.55 || zoom > 3.2) return;
    const places = R.under ? [] : G.Relief.places().slice();
    // the caves: their doors on the surface (once someone found them), their halls below
    if (G.Caves) for (const cv of G.Caves.all()) {
      if (R.under) places.push({ kind: 'caverna', name: cv.name, x: cv.cx + 0.5, y: cv.cy + 0.5, under: 1 });
      else if (cv.found && cv.mouths[0]) places.push({ kind: 'caverna', name: cv.name, x: cv.mouths[0].x + 0.5, y: cv.mouths[0].y + 0.5 });
    }
    if (!places.length) return;
    const a = G.clamp(Math.min((zoom - 0.55) / 0.3, (3.2 - zoom) / 0.6), 0, 1) * 0.92;
    ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    const taken = [];
    for (const p of places) {
      const h = p.kind === 'pico' ? p.h : p.under ? UF() + UW() + 1 : W.groundH(p.x, p.y);
      const q = proj(p.x, p.y, h); const y = q[1] - (p.kind === 'pico' ? 12 : p.kind === 'caverna' && !p.under ? 16 : 8);
      if (q[0] < view[0] - 60 || q[0] > view[2] + 60 || y < view[1] - 30 || y > view[3] + 30) continue;
      const fs = (p.kind === 'pico' ? 12 : 10.5) / zoom;
      ctx.font = `italic 700 ${fs}px Cinzel, Georgia, serif`;
      const txt = (PICON[p.kind] || '') + ' ' + p.name;
      // (places never write over each other: the bigger ones come first)
      const w = ctx.measureText(txt).width, box = [q[0] - w / 2, y - fs, q[0] + w / 2, y + fs * (p.kind === 'pico' ? 1.7 : 0.8)];
      if (taken.some(b => box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1])) continue;
      taken.push(box);
      ctx.lineWidth = 3 / zoom; ctx.strokeStyle = 'rgba(20,16,12,0.7)'; ctx.strokeText(txt, q[0], y);
      ctx.fillStyle = p.kind === 'lago' || p.kind === 'cachoeira' ? '#dff4ff' : p.kind === 'caverna' ? '#f0dcc0' : '#fff1d6'; ctx.fillText(txt, q[0], y);
      if (p.kind === 'pico' && zoom > 0.9) { ctx.font = `700 ${8.5 / zoom}px Nunito, sans-serif`; ctx.strokeText(p.alt, q[0], y + fs * 0.95); ctx.fillStyle = 'rgba(240,225,200,0.85)'; ctx.fillText(p.alt, q[0], y + fs * 0.95); }
    }
    ctx.restore();
  }
  function drawOverlays(t, view) {
    const S = G.S; const zoom = R.cam.zoom;
    const is = G.clamp(1.5 / zoom, 0.7, 1.4);
    drawPlaceLabels(view);
    drawCityLabels(view);
    for (let k = 0; k < overlays.length; k += 3) {
      const o = overlays[k], sx = overlays[k + 1], sy = overlays[k + 2];
      if (o.prayerIcon) { G.Art.draw(ctx, G.Art.icon('awe'), sx, sy + 6, is * 1.5); continue; }
      if (o.type && G.BDEF[o.type]) { // construction progress bar
        const w = 18;
        ctx.fillStyle = 'rgba(20,20,25,0.65)'; ctx.fillRect(sx - w / 2 - 1, sy - 1, w + 2, 4);
        ctx.fillStyle = '#ffd166'; ctx.fillRect(sx - w / 2, sy, w * o.progress, 2);
        const al = G.Vg.allowedProgress(o);
        ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(sx - w / 2 + w * o.progress, sy, Math.max(0, w * (al - o.progress)), 2);
        continue;
      }
      const isV = !o.kind;
      const sc = isV ? (o.age < 2 ? 0.45 : o.age < 16 ? 0.55 + (o.age / 16) * 0.42 : 1) : 0.7;
      const headY = sy - (isV ? 14 : 10) * sc;
      if (isV && o.emo) {
        const a = Math.min(1, o.emo.t * 3);
        ctx.globalAlpha = a;
        G.Art.draw(ctx, G.Art.icon(o.emo.k), sx, headY - 1 - (1 - a) * 3, is);
        ctx.globalAlpha = 1;
      }
      if (R.hover === o || (G.UI && G.UI.selected === o)) {
        const name = isV ? o.name : G.Animals.DEF[o.kind].name;
        ctx.font = `600 ${Math.round(9 * is)}px Nunito, sans-serif`; ctx.textAlign = 'center';
        const y = headY - (isV && o.emo ? 16 * is : 3);
        ctx.lineWidth = 3 * is; ctx.strokeStyle = 'rgba(20,20,30,0.7)'; ctx.strokeText(name, sx, y);
        ctx.fillStyle = '#fff4dc'; ctx.fillText(name, sx, y);
      }
    }
    // floating texts
    ctx.textAlign = 'center';
    for (const f of (R.under ? [] : G.FX.floaters)) {
      const p = proj(f.x, f.y, f.h);
      ctx.globalAlpha = Math.min(1, f.life / f.max * 2);
      ctx.font = `800 ${Math.round(9 * is)}px Nunito, sans-serif`;
      ctx.lineWidth = 3 * is; ctx.strokeStyle = 'rgba(20,15,10,0.6)'; ctx.strokeText(f.text, p[0], p[1] - f.z);
      ctx.fillStyle = f.c; ctx.fillText(f.text, p[0], p[1] - f.z);
    }
    ctx.globalAlpha = 1;
    // power preview
    const pv = R.preview;
    if (pv && W.inb(pv.x, pv.y)) {
      const pw = G.Powers.byId(pv.power);
      const ok = G.Powers.canCast(pv.power, pv.x, pv.y);
      const col = !ok ? '255,90,90' : pw.good === true ? (pv.power === 'rain' ? '140,200,255' : pv.power === 'fertility' ? '255,170,210' : pv.power === 'heal' ? '255,235,150' : '160,255,140') : pw.good === false ? '255,140,70' : '255,255,255';
      groundEllipse(pv.x, pv.y, pw.r);
      ctx.fillStyle = `rgba(${col},0.12)`; ctx.fill();
      ctx.strokeStyle = `rgba(${col},0.9)`; ctx.lineWidth = 1.5 / Math.sqrt(zoom); ctx.setLineDash([6, 5]); ctx.lineDashOffset = -t * 14; ctx.stroke(); ctx.setLineDash([]);
      const p = proj(pv.x, pv.y, W.groundH(pv.x, pv.y));
      ctx.strokeStyle = `rgba(${col},0.9)`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(p[0] - 5, p[1]); ctx.lineTo(p[0] + 5, p[1]); ctx.moveTo(p[0], p[1] - 2.5); ctx.lineTo(p[0], p[1] + 2.5); ctx.stroke();
      if (pv.power === 'meteor' || pv.power === 'lightning') { ctx.globalAlpha = 0.4 + 0.3 * Math.sin(t * 6); ctx.strokeStyle = `rgba(${col},1)`; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0], p[1] - 120); ctx.stroke(); ctx.globalAlpha = 1; }
    }
    // held entity (divine hand)
    const hd = G.Input && G.Input.held;
    if (hd && hd.e) {
      const e = hd.e;
      const [wx, wy] = R.screenToWorldPx(hd.sx, hd.sy);
      const sway = Math.sin(t * 6) * 0.25;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.55 + 0.15 * Math.sin(t * 4);
      ctx.drawImage(G.Art.glow('gold'), wx - 16, wy - 12, 32, 32); ctx.restore();
      if (!e.kind) G.Art.draw(ctx, G.Art.icon('fear'), wx, wy - 8, is);
      ctx.save(); ctx.translate(wx, wy + 8); ctx.rotate(sway); ctx.scale(1.25, 1.25);
      if (e.kind) G.Art.animal(ctx, e, 0, 0, t); else { const mv = e.moving; e.moving = true; e.act = 'run'; G.Art.villager(ctx, e, 0, 0, t, false); e.moving = mv; }
      ctx.restore();
      // shadow on the ground under it
      const [tx, ty] = R.screenToTile(hd.sx, hd.sy + 30);
      if (W.inb(tx, ty)) { groundEllipse(tx, ty, 0.3); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fill(); }
    }
  }
})(window.G);
