'use strict';
// ============================================================
//  Minimap: the whole world in a corner. Terrain by biome,
//  kingdoms' borders, cities, and the rectangle of the god's gaze.
//  Click or drag to fly there.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T;
  G.mapHooks.push(n => { N = n; });
  const MM = G.Minimap = {};
  const W_CSS = 212, H_CSS = 112;
  let box, cv, cx, img, ictx, pix, refreshT = 0, drag = false, dpr = 1, shown = null;
  const WATER = [[38, 104, 152], [58, 146, 186], [92, 182, 198]];
  const BASE = { 3: [232, 214, 160], 4: [118, 172, 78], 5: [134, 186, 84], 6: [150, 146, 132] };

  MM.init = function () {
    box = document.getElementById('minimap'); if (!box) return;
    cv = box.querySelector('canvas'); cx = cv.getContext('2d');
    img = document.createElement('canvas'); ictx = img.getContext('2d');
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = W_CSS * dpr; cv.height = H_CSS * dpr; cv.style.width = W_CSS + 'px'; cv.style.height = H_CSS + 'px';
    const go = e => {
      const r = cv.getBoundingClientRect();
      const [wx, wy] = toWorld(e.clientX - r.left, e.clientY - r.top);
      const cam = G.Render.cam; cam.follow = 0; cam.target = null;
      if (drag === 'jump') cam.target = [wx, wy]; else { cam.x = wx; cam.y = wy; }
    };
    cv.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); drag = 'jump'; try { cv.setPointerCapture(e.pointerId); } catch (_) { } go(e); drag = true; });
    cv.addEventListener('pointermove', e => { if (drag) go(e); });
    const up = () => { drag = false; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', e => e.preventDefault(), { passive: false });
    box.querySelector('.mm-x').onclick = () => MM.toggle(false);
  };
  // whether the map starts open: big worlds need it, small screens don't have room
  MM.reset = function () {
    let pref = null; try { pref = localStorage.getItem('gotaf-minimap'); } catch (e) { }
    const small = window.innerWidth < 760;
    shown = pref === null ? (N >= 128 && !small) : pref === '1';
    refreshT = 0; apply();
  };
  MM.toggle = function (on) {
    shown = on === undefined ? !shown : !!on;
    try { localStorage.setItem('gotaf-minimap', shown ? '1' : '0'); } catch (e) { }
    refreshT = 0; apply();
  };
  MM.visible = () => !!shown;
  function apply() {
    if (!box) return;
    box.classList.toggle('hidden', !shown);
    document.body.classList.toggle('has-minimap', !!shown);
    const b = document.getElementById('btn-map'); if (b) b.classList.toggle('on', !!shown);
  }

  // layout: the land (not the whole ocean) fitted into the widget; iso: x->(s,s/2), y->(-s,s/2)
  let bounds = null;
  function fit() {
    const b = bounds || [-N, N, 0, 2 * N]; // u = x - y, v = x + y
    const du = Math.max(8, b[1] - b[0]), dv = Math.max(8, b[3] - b[2]);
    const s = Math.min((W_CSS - 10) / du, (H_CSS - 10) / (dv / 2)) * dpr;
    const ox = cv.width / 2 - (b[0] + b[1]) / 2 * s, oy = cv.height / 2 - (b[2] + b[3]) / 4 * s;
    return { s, ox, oy };
  }
  // minimap css px -> world px (the renderer's projected space)
  function toWorld(mx, my) {
    const { s, ox, oy } = fit(); const k = s / 16;
    return [(mx * dpr - ox) / k, (my * dpr - oy) / k - G.SEA * 4];
  }

  function rebuild() {
    const S = G.S; if (!S) return;
    if (img.width !== N) { img.width = N; img.height = N; pix = ictx.createImageData(N, N); }
    const d = pix.data; const terr = G.Fac.terrFac; const B = G.Biome; const road = S.road;
    let u0 = 1e9, u1 = -1e9, v0 = 1e9, v1 = -1e9;
    for (let i = 0; i < N * N; i++) {
      const t = S.type[i]; let c;
      if (t >= T.RIVER) { const [x, y] = G.Render.toView((i % N) + 0.5, ((i / N) | 0) + 0.5); const u = x - y, v = x + y; if (u < u0) u0 = u; if (u > u1) u1 = u; if (v < v0) v0 = v; if (v > v1) v1 = v; }
      if (t <= T.RIVER) c = WATER[t];
      else {
        c = B ? B.groundColor(i, t, BASE[t] || BASE[4]) : (BASE[t] || BASE[4]);
        if (S.treeAt[i]) c = [c[0] * 0.72, c[1] * 0.78, c[2] * 0.7];
        if (S.burnt[i] > 0) c = [70, 62, 56];
        if (road && road[i]) c = road[i] >= 2 ? [196, 186, 168] : [176, 150, 110];
        if (S.occ[i]) c = [226, 206, 178];
      }
      let r = c[0], g = c[1], b = c[2];
      const f = terr && terr[i];
      if (f && t > T.RIVER) {
        const fc = hexRGB(G.Fac.hex(f));
        const x = i % N, y = (i / N) | 0;
        const edge = (x > 0 && terr[i - 1] !== f) || (x < N - 1 && terr[i + 1] !== f) || (y > 0 && terr[i - N] !== f) || (y < N - 1 && terr[i + N] !== f);
        const a = edge ? 0.85 : 0.22;
        r = r * (1 - a) + fc[0] * a; g = g * (1 - a) + fc[1] * a; b = b * (1 - a) + fc[2] * a;
      }
      const o = i * 4; d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = 255;
    }
    ictx.putImageData(pix, 0, 0);
    const m = Math.max(4, N * 0.04);
    bounds = u1 > u0 ? [u0 - m, u1 + m, v0 - m, v1 + m + 1] : null;
  }
  const hexCache = {};
  function hexRGB(h) { return hexCache[h] || (hexCache[h] = [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]); }

  MM.refresh = () => { refreshT = 0; };
  // the whole world as a little picture (the time skip draws it big)
  MM.image = () => { if (!G.S || !img) return null; rebuild(); return img; };
  MM.update = function (dt) {
    if (!shown || !box || !G.S) return;
    refreshT -= dt;
    if (refreshT <= 0) { refreshT = N >= 160 ? 3 : 2; rebuild(); }
    draw();
  };
  function draw() {
    const S = G.S; const { s, ox, oy } = fit();
    cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, cv.width, cv.height);
    // the terrain image, sheared into the isometric diamond
    cx.imageSmoothingEnabled = s < 1.5;
    // (turned with the camera: world pixel -> view -> the diamond)
    const r = G.Render.rot();
    const A = r === 0 ? [1, 0, 0, 1, 0, 0] : r === 1 ? [0, 1, -1, 0, N, 0] : r === 2 ? [-1, 0, 0, -1, N, N] : [0, -1, 1, 0, 0, N]; // X = A0 x + A2 y + A4, Y = A1 x + A3 y + A5
    const mX = (X, Y) => [(X - Y) * s, (X + Y) * s / 2];
    const c0 = mX(A[0], A[1]), c1 = mX(A[2], A[3]), tr = mX(A[4], A[5]);
    cx.setTransform(c0[0], c0[1], c1[0], c1[1], ox + tr[0], oy + tr[1]);
    cx.drawImage(img, 0, 0);
    cx.setTransform(1, 0, 0, 1, 0, 0);
    const P = (x, y) => { const [X, Y] = G.Render.toView(x, y); return [ox + (X - Y) * s, oy + (X + Y) * s / 2]; };
    // cities
    for (const st of S.settlements.values()) {
      if (!st.fac) continue;
      const [px, py] = P(st.cx + 0.5, st.cy + 0.5);
      const tier = (G.City && st.tier) || 0; const rr = (1.6 + tier * 0.7) * dpr;
      cx.beginPath(); cx.arc(px, py, rr, 0, Math.PI * 2);
      cx.fillStyle = G.Fac.hex(st.fac); cx.fill();
      cx.lineWidth = dpr; cx.strokeStyle = G.Fac.capitalOf(st.fac) === st ? '#fff6d8' : 'rgba(20,16,12,.8)'; cx.stroke();
    }
    // fleets at sea
    if (S.ships) { cx.fillStyle = '#f4ecd8'; for (const sh of S.ships) { const [px, py] = P(sh.x, sh.y); cx.fillRect(px - dpr, py - dpr, 2 * dpr, 2 * dpr); } }
    // the god's gaze
    const v = G.Render.viewRect(0); const k = s / 16; const sy = G.SEA * 4;
    const x0 = ox + v[0] * k, y0 = oy + (v[1] + sy) * k, x1 = ox + v[2] * k, y1 = oy + (v[3] - 40 + sy) * k;
    cx.lineWidth = 1.5 * dpr; cx.strokeStyle = 'rgba(255,240,200,.95)';
    cx.strokeRect(Math.max(1, x0), Math.max(1, y0), Math.min(cv.width - 2, x1) - Math.max(1, x0), Math.min(cv.height - 2, y1) - Math.max(1, y0));
  }
})(window.G);
