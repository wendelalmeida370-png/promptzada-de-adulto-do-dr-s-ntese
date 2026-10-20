'use strict';
// ============================================================
//  Talk: words above heads.
//  A line said in the world appears over the speaker the way a comic
//  draws it — typed out letter by letter, held long enough to be read,
//  then gone. A shout is a jagged white burst; a whisper a dim, dotted
//  breath; a thought a little cloud; a chant floats up without a bubble
//  in the colour of the order. The bubbles keep the same size on the
//  screen however far the camera is, and step out of each other's way.
//  (The scenes, the executions, the riots and the secret orders all
//  speak through here.)
// ============================================================
(function (G) {
  const T = G.Talk = { list: [] };
  const TAU = Math.PI * 2;
  const FONT = 'Nunito, sans-serif';
  const MAXW = 168;

  // say(v, text, { style: 'say'|'shout'|'whisper'|'think'|'chant', dur, name, col, scene })
  T.say = function (v, txt, o) {
    if (!v || !txt || !G.S) return null;
    o = o || {};
    const S = G.S;
    for (let k = T.list.length - 1; k >= 0; k--) if (T.list[k].id === v.id) T.list.splice(k, 1);
    const style = o.style || (/!$/.test(txt) && txt.length < 26 ? 'shout' : 'say');
    const dur = o.dur || T.durOf(txt, style);
    const b = { id: v.id, txt: String(txt), style, t0: S.clock, until: S.clock + dur, dur, name: o.name || '', col: o.col || '', scene: o.scene || 0, lines: null, w: 0 };
    T.list.push(b);
    if (T.list.length > 24) T.list.shift();
    if (T.onSay) try { T.onSay(v, b); } catch (e) { /* a listener is never worth an error */ }
    return b;
  };
  // how long a line stays: long enough to read it twice
  T.durOf = (txt, style) => Math.min(9, (style === 'shout' ? 1.3 : style === 'chant' ? 2.4 : 1.6) + String(txt).length / 13.5);
  T.busy = id => T.list.some(b => b.id === id && G.S.clock < b.until);
  T.of = id => T.list.find(b => b.id === id && G.S.clock < b.until) || null;
  T.clear = () => { T.list.length = 0; };
  // how much of the line has been typed out (sim time: a pause freezes the words too)
  T.typed = b => Math.min(b.txt.length, Math.floor((G.S.clock - b.t0) * (b.style === 'shout' ? 60 : 34)) + 1);

  // ------------------------------ layout ------------------------------
  function wrap(c, txt, max) {
    const words = txt.split(/\s+/); const out = []; let line = '';
    for (const w of words) {
      const t = line ? line + ' ' + w : w;
      if (c.measureText(t).width > max && line) { out.push(line); line = w; } else line = t;
    }
    if (line) out.push(line);
    return out.slice(0, 5);
  }
  function fontOf(style) {
    if (style === 'shout') return `900 13.5px ${FONT}`;
    if (style === 'whisper' || style === 'think') return `italic 700 12px ${FONT}`;
    if (style === 'chant') return `italic 800 12.5px Cinzel, serif`;
    return `700 12.5px ${FONT}`;
  }

  // ------------------------------ drawing ------------------------------
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function spiky(c, x, y, w, h, seed) {
    // a burst: points all round the box
    const cx = x + w / 2, cy = y + h / 2; const n = 18;
    c.beginPath();
    for (let k = 0; k <= n; k++) {
      const a = k / n * TAU; const r = k % 2 ? 1 : 1.16 + G.hash(seed * 7 + k) * 0.14;
      const px = cx + Math.cos(a) * (w / 2 + 7) * r, py = cy + Math.sin(a) * (h / 2 + 6) * r;
      if (k) c.lineTo(px, py); else c.moveTo(px, py);
    }
    c.closePath();
  }
  function cloud(c, x, y, w, h) {
    c.beginPath();
    const n = Math.max(4, Math.round(w / 22));
    for (let k = 0; k < n; k++) { const px = x + (k + 0.5) * w / n; c.moveTo(px + 10, y + 2); c.arc(px, y + 2, 10, 0, TAU); c.moveTo(px + 10, y + h - 2); c.arc(px, y + h - 2, 10, 0, TAU); }
    c.moveTo(x + 2 + 9, y + h / 2); c.arc(x + 2, y + h / 2, 9, 0, TAU); c.moveTo(x + w - 2 + 9, y + h / 2); c.arc(x + w - 2, y + h / 2, 9, 0, TAU);
    rr(c, x, y, w, h, 8);
  }
  const placed = [];
  G.renderHooks = G.renderHooks || { ground: [], ents: [] };
  G.renderHooks.air = G.renderHooks.air || [];
  G.renderHooks.air.push(function (ctx, proj, view) {
    const S = G.S; if (!S || !T.list.length) return;
    const R = G.Render; if (R.under) return;
    const z = R.cam.zoom; if (z < 0.5) return;
    const k = 1 / z;
    // drop the old ones
    for (let i = T.list.length - 1; i >= 0; i--) { const b = T.list[i]; if (S.clock > b.until || !S.villagers.has(b.id)) T.list.splice(i, 1); }
    placed.length = 0;
    // the nearest to the bottom of the screen first: the ones behind step up
    const items = [];
    for (const b of T.list) {
      const v = S.villagers.get(b.id); if (!v || v.inside || v.aboard) continue;
      const p = proj(v.x, v.y, G.W.groundH(v.x, v.y));
      const sc = v.age < 16 ? 0.55 + (v.age / 16) * 0.42 : 1;
      const hx = p[0], hy = p[1] - (v.z || 0) - (22 * sc + (v.emo ? 13 : 0) + 3);
      if (hx < view[0] - 80 || hx > view[2] + 80 || hy < view[1] - 60 || hy > view[3] + 40) continue;
      items.push({ b, v, hx, hy });
    }
    items.sort((a, b) => b.hy - a.hy);
    ctx.save();
    ctx.textBaseline = 'alphabetic';
    for (const it of items) {
      const b = it.b;
      ctx.font = fontOf(b.style);
      if (!b.lines) { b.lines = wrap(ctx, b.txt, MAXW); b.w = Math.max(...b.lines.map(l => ctx.measureText(l).width)); }
      const lh = b.style === 'shout' ? 15 : 14.5;
      const head = b.name ? 12 : 0;
      const bw = Math.max(26, b.w + 16), bh = b.lines.length * lh + 9 + head;
      // fade in/out, a little pop on a shout
      const age = S.clock - b.t0, left = b.until - S.clock;
      const a = Math.min(1, age / 0.18, left / 0.35);
      if (a <= 0) continue;
      const pop = b.style === 'shout' ? 1 + Math.max(0, 0.25 - age) * 1.6 : 1;
      // the screen box (in screen pixels around the head), nudged up out of the others' way
      let ox = it.hx, oy = it.hy;
      let bx = -bw / 2, by = -bh - (b.style === 'think' ? 16 : 9);
      for (let guard = 0; guard < 6; guard++) {
        const sx0 = ox / k + bx, sy0 = oy / k + by;
        const hit = placed.find(q => sx0 < q[0] + q[2] && sx0 + bw > q[0] && sy0 < q[1] + q[3] && sy0 + bh > q[1]);
        if (!hit) break;
        by -= (sy0 + bh) - hit[1] + 4;
      }
      placed.push([ox / k + bx, oy / k + by, bw, bh]);
      ctx.save();
      ctx.translate(ox, oy); ctx.scale(k * pop, k * pop);
      ctx.globalAlpha = a;
      if (b.style === 'shout') { const j = age < 0.6 ? Math.sin(age * 60) * (0.6 - age) * 2 : 0; ctx.translate(j, 0); }
      const n = T.typed(b);
      if (b.style === 'chant') {
        // no bubble: words that rise from the hood and fade
        const rise = Math.min(14, age * 7);
        ctx.translate(0, -rise);
        ctx.textAlign = 'center';
        ctx.shadowColor = b.col || '#c8a24a'; ctx.shadowBlur = 8;
        ctx.fillStyle = b.col || '#f2dca0';
        let left2 = n; b.lines.forEach((l, i) => { const s = l.slice(0, Math.max(0, left2)); left2 -= l.length + 1; ctx.fillText(s, 0, by + 12 + i * lh); });
        ctx.restore(); continue;
      }
      // the bubble
      ctx.lineWidth = 1.2;
      if (b.style === 'shout') { spiky(ctx, bx, by, bw, bh, b.id); ctx.fillStyle = '#fffdf6'; ctx.fill(); ctx.strokeStyle = '#a8322a'; ctx.lineWidth = 1.6; ctx.stroke(); }
      else if (b.style === 'think') { cloud(ctx, bx, by, bw, bh); ctx.fillStyle = 'rgba(250,248,240,0.94)'; ctx.fill(); ctx.strokeStyle = 'rgba(60,50,40,0.45)'; ctx.stroke(); }
      else if (b.style === 'whisper') { rr(ctx, bx, by, bw, bh, 8); ctx.fillStyle = 'rgba(24,20,30,0.78)'; ctx.fill(); ctx.setLineDash([2.5, 2.5]); ctx.strokeStyle = 'rgba(230,220,200,0.55)'; ctx.stroke(); ctx.setLineDash([]); }
      else { rr(ctx, bx, by, bw, bh, 8); ctx.fillStyle = 'rgba(253,249,238,0.96)'; ctx.fill(); ctx.strokeStyle = 'rgba(58,42,28,0.55)'; ctx.stroke(); }
      // the tail, down to the mouth
      const ty = by + bh;
      if (b.style === 'think') { ctx.fillStyle = 'rgba(250,248,240,0.94)'; for (const [dx, dy, r] of [[2, 6, 3.6], [4, 11, 2.3]]) { ctx.beginPath(); ctx.arc(dx, ty + dy, r, 0, TAU); ctx.fill(); ctx.stroke(); } }
      else if (b.style !== 'shout') {
        ctx.beginPath(); ctx.moveTo(-5, ty - 1); ctx.lineTo(4, ty - 1); ctx.lineTo(1, ty + 7); ctx.closePath();
        ctx.fillStyle = b.style === 'whisper' ? 'rgba(24,20,30,0.78)' : 'rgba(253,249,238,0.96)'; ctx.fill();
      }
      // who speaks (in a scene): a small caps name over the words
      if (b.name) { ctx.font = `800 9.5px ${FONT}`; ctx.textAlign = 'left'; ctx.fillStyle = b.style === 'whisper' ? 'rgba(240,220,170,0.85)' : '#9a5a2a'; ctx.fillText(b.name.toUpperCase(), bx + 8, by + 11); ctx.font = fontOf(b.style); }
      // the words, typed out
      ctx.textAlign = 'center';
      ctx.fillStyle = b.style === 'whisper' ? '#efe6d4' : b.style === 'shout' ? '#5a1410' : '#2a1c14';
      let left2 = n;
      b.lines.forEach((l, i) => { const s = l.slice(0, Math.max(0, left2)); left2 -= l.length + 1; ctx.fillText(s, 0, by + head + 4 + (i + 1) * lh - 3.5); });
      ctx.restore();
    }
    ctx.restore();
  });
  (G.saveHooks = G.saveHooks || []).push({ save() { }, load() { T.list.length = 0; } });
})(window.G);
