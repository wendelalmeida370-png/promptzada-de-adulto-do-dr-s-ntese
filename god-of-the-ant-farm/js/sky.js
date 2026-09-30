'use strict';
// ============================================================
//  Sky: the weather worth stopping for. Mist in the low ground
//  at dawn, sun rays at the golden hours, a rainbow when a
//  shower passes, cloud shadows sliding over the fields,
//  fireflies over warm nights, leaves in the wind, dust devils
//  on the dry plains, sheet lightning inside a storm.
//  It all follows the real clock, wind, rain and biomes.
// ============================================================
(function (G) {
  const K = G.Sky = {};
  let N = G.N; const W = G.W;
  G.mapHooks.push(n => { N = n; });
  const TAU = Math.PI * 2;
  const BIO = { TEMP: 0, SNOW: 1, TAIGA: 2, SWAMP: 3, JUNGLE: 4, SAVANNA: 5, DESERT: 6 };
  // soft round puffs: white for the mist, grey-blue for the cloud shadows
  const sprites = {};
  function puff(key, rgb) {
    if (sprites[key]) return sprites[key];
    const c = sprites[key] = document.createElement('canvas'); c.width = 96; c.height = 48;
    const x = c.getContext('2d'); x.scale(1, 0.5);
    const g = x.createRadialGradient(48, 48, 2, 48, 48, 46);
    g.addColorStop(0, `rgba(${rgb},0.9)`); g.addColorStop(0.5, `rgba(${rgb},0.45)`); g.addColorStop(1, `rgba(${rgb},0)`);
    x.fillStyle = g; x.fillRect(0, 0, 96, 96);
    return c;
  }
  const mistSprite = () => puff('mist', '255,255,255');
  const shadowSprite = () => puff('shadow', '60,70,90');
  const bio = i => (G.S.biome ? G.S.biome[i] : 0);
  // ------------------------------ state that follows the weather ------------------------------
  const st = { rainPeak: 0, rainbow: 0, rainbowMax: 0, flash: 0, devil: null, shadows: [] };
  K.state = st;
  K.update = function (dt, rdt) {
    const S = G.S; if (!S) return;
    const w = S.weather; const t = S.time;
    // a rainbow after a real shower, while the sun is up
    st.rainPeak = Math.max(st.rainPeak * (1 - dt * 0.02), w.rain);
    if (st.rainPeak > 0.3 && w.rain < 0.12 && t > 0.08 && t < 0.6 && st.rainbow <= 0) { st.rainbow = st.rainbowMax = 22; st.rainPeak = 0; }
    if (st.rainbow > 0) st.rainbow -= dt;
    // sheet lightning inside a storm
    if (w.storm > 0 && G.R() < dt * 0.25) { st.flash = 0.35; G.Audio && G.Audio.play('thunderFar', 0.8); }
    if (st.flash > 0) st.flash = Math.max(0, st.flash - rdt * 2.5);
    // cloud shadows: a handful of big soft shapes riding the wind
    if (st.shadows.length < 5) st.shadows.push({ x: G.rr(0, N), y: G.rr(0, N), r: G.rr(4, 8), s: G.rr(0.6, 1.2) });
    const wx = Math.cos(w.windA) * (0.3 + w.windS * 0.9), wy = Math.sin(w.windA) * (0.3 + w.windS * 0.9);
    for (const c of st.shadows) { c.x += wx * dt; c.y += wy * dt; if (c.x < -12 || c.y < -12 || c.x > N + 12 || c.y > N + 12) { c.x = N / 2 - wx * N * 0.7 + G.rr(-N / 2, N / 2); c.y = N / 2 - wy * N * 0.7 + G.rr(-N / 2, N / 2); } }
    // dust devils on the hot dry plains at midday
    if (!st.devil && t > 0.28 && t < 0.52 && w.rain < 0.05 && G.R() < dt * 0.02) {
      const R = G.Render; const [x, y] = R.screenToTile(R.VW * G.rr(0.25, 0.75), R.VH * G.rr(0.3, 0.7));
      if (W.inb(x, y)) { const b = bio(W.idx(x, y)); if ((b === BIO.DESERT || b === BIO.SAVANNA) && S.type[W.idx(x, y)] >= G.T.SAND) st.devil = { x, y, t: 0, life: G.rr(14, 22), vx: wx * 0.8 + G.rr(-0.3, 0.3), vy: wy * 0.8 + G.rr(-0.3, 0.3) }; }
    }
    if (st.devil) {
      const d = st.devil; d.t += dt; d.x += d.vx * dt; d.y += d.vy * dt;
      if (d.t > d.life || !W.inb(d.x, d.y)) st.devil = null;
      else if (G.FX) for (let k = 0; k < 3; k++) { const a = G.R() * TAU, z = G.rr(0, 22); G.FX.spawn({ x: d.x + Math.cos(a) * (0.15 + z * 0.012), y: d.y + Math.sin(a) * (0.15 + z * 0.012), z, vz: G.rr(8, 18), vx: -Math.sin(a) * 1.4 + d.vx, vy: Math.cos(a) * 1.4 + d.vy, life: G.rr(0.8, 1.5), s0: 1.6, s1: 3.2, c: 'rgba(210,180,130,0.35)', k: 2 }); }
    }
    // leaves on a windy day, from the trees in sight
    if (w.windS > 0.45 && G.FX && G.R() < dt * 6 * w.windS && G.Render.cam.zoom > 1) {
      const R = G.Render; const [x, y] = R.screenToTile(G.R() * R.VW, G.R() * R.VH);
      if (W.inb(x, y)) { const tr = S.trees.get(S.treeAt[W.idx(x, y)]); if (tr && tr.stage === 'grow') G.FX.spawn({ x: tr.x, y: tr.y, z: G.rr(8, 16), vx: wx * 1.2, vy: wy * 1.2, vz: G.rr(-3, 3), g: 4, drag: 0.2, life: G.rr(3, 5), s0: 1.4, s1: 1.2, c: G.pick(['#8ab04a', '#c8a040', '#b07a3a']), k: 5, rot: G.R() * 6, vr: G.rr(-4, 4) }); }
    }
  };

  // ------------------------------ on the ground: cloud shadows ------------------------------
  G.renderHooks = G.renderHooks || { ground: [], ents: [] };
  G.renderHooks.air = G.renderHooks.air || []; G.renderHooks.screen = G.renderHooks.screen || [];
  G.renderHooks.ground.push(function (ctx, proj, view, t, nightF) {
    const S = G.S; if (nightF > 0.5 || S.weather.rain > 0.3) return;
    const a = 0.1 * (1 - nightF * 2);
    if (a <= 0.01) return;
    const spr = shadowSprite();
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = a;
    for (const c of st.shadows) { const p = proj(c.x, c.y, G.SEA); const w = c.r * 40 * c.s, h = w * 0.5; if (p[0] + w < view[0] || p[0] - w > view[2] || p[1] + h < view[1] || p[1] - h > view[3]) continue; ctx.drawImage(spr, p[0] - w, p[1] - h / 2, w * 2, h); }
    ctx.restore();
  });

  // ------------------------------ in the air: mist, fireflies ------------------------------
  G.renderHooks.air.push(function (ctx, proj, view, t, nightF, FXA) {
    const S = G.S; const R = G.Render; const tm = S.time;
    const zoom = R.cam.zoom;
    // mist: the hour after dawn, in the low wet ground, by the water, in the swamps
    const dawn = tm < 0.16 ? Math.sin(Math.min(1, tm / 0.16) * Math.PI) : tm > 0.93 ? (tm - 0.93) / 0.07 * 0.5 : 0;
    const afterRain = Math.max(0, st.rainPeak - S.weather.rain) * 0.6;
    const base = Math.max(dawn, afterRain);
    {
      const step = zoom > 1.6 ? 2 : zoom > 0.9 ? 3 : 5;
      const [x0, y0] = R.screenToTile(0, 0), [x1, y1] = R.screenToTile(R.VW, R.VH), [x2, y2] = R.screenToTile(R.VW, 0), [x3, y3] = R.screenToTile(0, R.VH);
      const tx0 = Math.max(0, Math.floor(Math.min(x0, x1, x2, x3)) - 2), tx1 = Math.min(N - 1, Math.ceil(Math.max(x0, x1, x2, x3)) + 2);
      const ty0 = Math.max(0, Math.floor(Math.min(y0, y1, y2, y3)) - 2), ty1 = Math.min(N - 1, Math.ceil(Math.max(y0, y1, y2, y3)) + 2);
      const spr = mistSprite(); const wx = Math.cos(S.weather.windA) * 0.4, wy = Math.sin(S.weather.windA) * 0.4;
      let n = 0;
      ctx.save();
      for (let y = ty0 - (ty0 % step); y <= ty1 && n < 160; y += step) for (let x = tx0 - (tx0 % step); x <= tx1 && n < 160; x += step) {
        const i = y * N + x; const b = bio(i); const ty = S.type[i];
        if (ty <= G.T.SEA) continue;
        const swamp = b === BIO.SWAMP ? 0.45 : 0;
        const low = S.H ? G.clamp(1 - (S.H[i] - G.SEA) / 6, 0, 1) : 0.5;
        const wet = ty === G.T.RIVER ? 1 : (G.dOcean && G.dOcean[i] <= 2) ? 0.6 : 0;
        let a = Math.max(base * (0.35 + low * 0.45 + wet * 0.4), swamp * (0.5 + dawn * 0.5));
        if (b === BIO.DESERT) a *= 0.2;
        a *= 0.5 + 0.5 * Math.sin(G.hash(i) * 20 + t * 0.25);
        if (a < 0.05) continue;
        const px = x + 0.5 + Math.sin(t * 0.08 + G.hash(i * 3) * 6) * 1.2 + wx * ((t * 0.3) % 3), py = y + 0.5 + Math.cos(t * 0.07 + G.hash(i * 5) * 6) * 1.2 + wy * ((t * 0.3) % 3);
        const p = proj(px, py, W.groundH(x + 0.5, y + 0.5));
        const w = step * 26 * (0.8 + G.hash(i * 7) * 0.6);
        ctx.globalAlpha = Math.min(0.55, a * 0.55) * (1 - nightF * 0.5);
        ctx.drawImage(spr, p[0] - w, p[1] - 8 - w * 0.25, w * 2, w * 0.5);
        n++;
      }
      ctx.restore();
    }
    // fireflies: warm nights over grass, trees and water — anchored to their own patch of ground
    if (nightF > 0.45 && zoom > 0.9 && S.weather.rain < 0.2) {
      const [a0, b0] = R.screenToTile(0, 0), [a1, b1] = R.screenToTile(R.VW, R.VH), [a2, b2] = R.screenToTile(R.VW, 0), [a3, b3] = R.screenToTile(0, R.VH);
      const fx0 = Math.max(0, Math.floor(Math.min(a0, a1, a2, a3))), fx1 = Math.min(N - 1, Math.ceil(Math.max(a0, a1, a2, a3)));
      const fy0 = Math.max(0, Math.floor(Math.min(b0, b1, b2, b3))), fy1 = Math.min(N - 1, Math.ceil(Math.max(b0, b1, b2, b3)));
      let n = 0;
      for (let y = fy0; y <= fy1 && n < 110; y++) for (let x = fx0; x <= fx1 && n < 110; x++) {
        const i = y * N + x; const h = G.hash(i * 13 + 7); if (h > 0.12) continue;
        const b = bio(i);
        if (b === BIO.SNOW || b === BIO.TAIGA || b === BIO.DESERT || S.type[i] <= G.T.SEA) continue;
        if (!(S.treeAt[i] || S.type[i] === G.T.RIVER || b === BIO.SWAMP || b === BIO.JUNGLE || h < 0.05)) continue;
        const ph = t * (0.6 + h * 6) + i;
        const bl = Math.pow(Math.max(0, Math.sin(ph * 2.3)), 2);
        if (bl < 0.05) continue;
        const fx = x + 0.5 + Math.sin(ph * 0.7) * 0.7, fy = y + 0.5 + Math.cos(ph * 0.5) * 0.7;
        const p = proj(fx, fy, W.groundH(G.clamp(fx, 0, N - 0.01), G.clamp(fy, 0, N - 0.01)));
        if (p[0] < view[0] || p[0] > view[2] || p[1] < view[1] || p[1] > view[3]) continue;
        const z = 5 + Math.sin(ph * 1.3) * 3;
        FXA.glow(p[0], p[1] - z, 10, '210,255,120', 0.9 * bl * Math.min(1, (nightF - 0.4) * 2));
        ctx.fillStyle = `rgba(245,255,180,${0.95 * bl})`; ctx.fillRect(p[0] - 0.9, p[1] - z - 0.9, 1.8, 1.8);
        n++;
      }
    }
  });

  // ------------------------------ on the glass: sun rays, rainbow, lightning ------------------------------
  G.renderHooks.screen.push(function (ctx, w, h, t, nightF, dpr) {
    const S = G.S; const tm = S.time; const rain = S.weather.rain;
    // god rays at the golden hours
    const gold = tm > 0.03 && tm < 0.13 ? Math.sin((tm - 0.03) / 0.1 * Math.PI) : tm > 0.54 && tm < 0.69 ? Math.sin((tm - 0.54) / 0.15 * Math.PI) : 0;
    const a = gold * (1 - rain * 1.5) * 0.2;
    if (a > 0.005) {
      const morning = tm < 0.3;
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      const ox = morning ? -w * 0.1 : w * 1.1, oy = -h * 0.15;
      for (let k = 0; k < 7; k++) {
        const ang = (morning ? 0.55 : Math.PI - 0.55) + (k - 3) * 0.09 + Math.sin(t * 0.05 + k) * 0.02;
        const len = Math.hypot(w, h) * 1.3, wd = (0.03 + G.hash(k) * 0.05) * len;
        const g = ctx.createLinearGradient(ox, oy, ox + Math.cos(ang) * len, oy + Math.sin(ang) * len);
        const col = morning ? '255,232,190' : '255,196,130';
        g.addColorStop(0, `rgba(${col},${a * (0.6 + G.hash(k * 3) * 0.6)})`); g.addColorStop(0.7, `rgba(${col},${a * 0.25})`); g.addColorStop(1, `rgba(${col},0)`);
        ctx.fillStyle = g; ctx.beginPath();
        const px = -Math.sin(ang) * wd, py = Math.cos(ang) * wd;
        ctx.moveTo(ox, oy); ctx.lineTo(ox + Math.cos(ang) * len + px, oy + Math.sin(ang) * len + py); ctx.lineTo(ox + Math.cos(ang) * len - px, oy + Math.sin(ang) * len - py); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
    // the rainbow
    if (st.rainbow > 0) {
      const life = st.rainbow / st.rainbowMax; const fa = Math.min(1, (1 - life) * 5, life * 3) * 0.34;
      if (fa > 0.005) {
        ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.lineWidth = Math.max(5, h * 0.016);
        const cx = w * 0.62, cy = h * 1.05, r0 = h * 0.82;
        const cols = ['255,70,70', '255,150,60', '255,230,90', '110,220,110', '90,160,255', '120,110,230', '190,110,220'];
        for (let k = 0; k < cols.length; k++) { ctx.strokeStyle = `rgba(${cols[k]},${fa})`; ctx.beginPath(); ctx.arc(cx, cy, r0 - k * ctx.lineWidth, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke(); }
        ctx.restore();
      }
    }
    if (st.flash > 0) { ctx.fillStyle = `rgba(210,220,255,${st.flash * 0.35})`; ctx.fillRect(0, 0, w, h); }
  });
})(window.G);
