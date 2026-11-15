'use strict';
// ============================================================
//  Photo: stop the world and take its picture. The simulation
//  freezes, the interface goes away, the camera stays free; a
//  small darkroom offers filters, a miniature (tilt-shift) look,
//  a vignette, a frame with the place and the date, and the hour
//  of the day. The shot is saved as a PNG, exactly as framed.
// ============================================================
(function (G) {
  const P = G.Photo = { on: false };
  const $ = s => document.querySelector(s);
  const FILTERS = [
    ['natural', 'Natural', 'none'], ['dourado', 'Dourado', 'sepia(0.25) saturate(1.3) brightness(1.05) hue-rotate(-8deg)'],
    ['sepia', 'Sépia', 'sepia(0.85) contrast(1.05)'], ['pb', 'Preto e branco', 'grayscale(1) contrast(1.15)'],
    ['vivo', 'Vivo', 'saturate(1.45) contrast(1.08)'], ['lua', 'Luar', 'saturate(0.6) hue-rotate(185deg) brightness(0.9) contrast(1.1)'],
  ];
  const opt = { filter: 'natural', tilt: false, vignette: true, frame: false, labels: false };
  let el = null, saved = null;

  P.init = function () {
    const d = document.createElement('div'); d.id = 'photo';
    d.innerHTML = `<div class="ph-tilt top"></div><div class="ph-tilt bot"></div><div class="ph-vig"></div>
      <div class="ph-frame"><div class="ph-cap"><b></b><span></span></div></div><div class="ph-flash"></div>
      <div class="ph-bar panel">
        <div class="ph-row ph-filters">${FILTERS.map(f => `<button data-f="${f[0]}">${f[1]}</button>`).join('')}</div>
        <div class="ph-row">
          <button data-t="tilt">Miniatura</button><button data-t="vignette">Vinheta</button><button data-t="frame">Moldura</button><button data-t="labels">Nomes</button>
          <label class="ph-time">Hora <input type="range" min="0" max="1" step="0.005"></label>
          <button class="primary ph-shot">Capturar</button><button class="ph-x" title="Sair (Esc)">×</button>
        </div>
        <div class="ph-hint">Arraste e use a roda para enquadrar · <kbd>Esc</kbd> ou <kbd>P</kbd> sai</div>
      </div>`;
    document.body.appendChild(d);
    el = { root: d, bar: d.querySelector('.ph-bar'), frame: d.querySelector('.ph-frame'), cap: d.querySelector('.ph-cap'), flash: d.querySelector('.ph-flash'), time: d.querySelector('.ph-time input') };
    d.querySelector('.ph-filters').addEventListener('click', e => { const b = e.target.closest('[data-f]'); if (!b) return; opt.filter = b.dataset.f; G.Audio.play('click'); refresh(); });
    d.addEventListener('click', e => {
      const b = e.target.closest('[data-t]'); if (b) { opt[b.dataset.t] = !opt[b.dataset.t]; G.Audio.play('click'); refresh(); }
      if (e.target.closest('.ph-shot')) P.shoot();
      if (e.target.closest('.ph-x')) P.stop();
    });
    el.time.addEventListener('input', () => { if (G.S) G.S.time = +el.time.value; });
    for (const ev of ['mousedown', 'wheel', 'touchstart']) el.bar.addEventListener(ev, e => e.stopPropagation(), { passive: true });
  };
  function refresh() {
    const f = FILTERS.find(q => q[0] === opt.filter) || FILTERS[0];
    $('#game').style.filter = f[2] === 'none' ? '' : f[2];
    el.root.classList.toggle('tilt', opt.tilt); el.root.classList.toggle('vig', opt.vignette); el.root.classList.toggle('framed', opt.frame);
    el.root.querySelectorAll('[data-f]').forEach(b => b.classList.toggle('on', b.dataset.f === opt.filter));
    el.root.querySelectorAll('[data-t]').forEach(b => b.classList.toggle('on', !!opt[b.dataset.t]));
    G.Render.showLabels = opt.labels;
    const [t1, t2] = caption(); el.cap.querySelector('b').textContent = t1; el.cap.querySelector('span').textContent = t2;
  }
  function caption() {
    const S = G.S; const R = G.Render;
    const [x, y] = R.screenToTile(R.VW / 2, R.VH / 2);
    const place = G.Village.nearSettlementName(x, y) || 'Os ermos';
    const world = (S.lore && S.lore.world) || 'O mundo';
    return [place, `${world} · Dia ${S.day}`];
  }
  P.start = function () {
    if (P.on || !G.Main || G.Main.mode !== 'game' || !el) return;
    if (G.Cinema && G.Cinema.on) G.Cinema.stop();
    P.on = true;
    const R = G.Render;
    saved = { speed: G.speed, time: G.S.time, labels: R.showLabels, borders: R.showBorders };
    if (G.speed) G.Main.lastSpeed = G.speed;
    G.UI.select(null); G.UI.setPower(null); G.UI.setSpeed(0); G.UI.showHUD(false);
    R.showBorders = false; R.hover = null; R.preview = null; R.cam.follow = 0;
    el.time.value = G.S.time;
    el.root.classList.add('on');
    refresh();
  };
  P.stop = function () {
    if (!P.on) return;
    P.on = false;
    const R = G.Render;
    el.root.classList.remove('on', 'tilt', 'vig', 'framed');
    $('#game').style.filter = '';
    if (saved) { G.S.time = saved.time; R.showLabels = saved.labels; R.showBorders = saved.borders; G.UI.setSpeed(saved.speed); }
    if (G.Main.mode === 'game') G.UI.showHUD(true);
  };
  P.toggle = () => (P.on ? P.stop() : P.start());
  // the frame's caption follows the camera
  let capT = 0;
  P.update = function (rdt) { if (!P.on || !opt.frame || (capT -= rdt) > 0) return; capT = 0.5; const [t1, t2] = caption(); el.cap.querySelector('b').textContent = t1; el.cap.querySelector('span').textContent = t2; };

  // ------------------------------ the darkroom ------------------------------
  P.render = function () {
    const src = $('#game'); const w = src.width, h = src.height;
    const out = document.createElement('canvas'); out.width = w; out.height = h;
    const c = out.getContext('2d');
    const f = FILTERS.find(q => q[0] === opt.filter) || FILTERS[0];
    const canFilter = 'filter' in c;
    if (canFilter) c.filter = f[2];
    c.drawImage(src, 0, 0);
    if (canFilter) c.filter = 'none';
    if (opt.tilt && canFilter) {
      // blur the top and the bottom, keep a sharp band in the middle
      const b = document.createElement('canvas'); b.width = w; b.height = h; const bc = b.getContext('2d');
      bc.filter = `blur(${Math.round(h * 0.006)}px)`; bc.drawImage(out, 0, 0); bc.filter = 'none';
      bc.globalCompositeOperation = 'destination-in';
      const g = bc.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.3, 'rgba(0,0,0,0)'); g.addColorStop(0.62, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,1)');
      bc.fillStyle = g; bc.fillRect(0, 0, w, h);
      c.drawImage(b, 0, 0);
      c.fillStyle = 'rgba(255,255,255,0.03)'; c.fillRect(0, 0, w, h);
    }
    if (opt.vignette) {
      const g = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.hypot(w, h) * 0.62);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(10,6,4,0.55)');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
    }
    if (opt.frame) {
      const m = Math.round(Math.min(w, h) * 0.035);
      c.strokeStyle = '#f4ead6'; c.lineWidth = m; c.strokeRect(m / 2, m / 2, w - m, h - m);
      c.strokeStyle = 'rgba(40,30,20,0.6)'; c.lineWidth = Math.max(1, m * 0.08); c.strokeRect(m, m, w - m * 2, h - m * 2);
      const [t1, t2] = caption();
      const fs = Math.round(h * 0.034);
      c.textAlign = 'left'; c.textBaseline = 'alphabetic';
      c.font = `700 ${fs}px Cinzel, serif`; c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillText(t1, m * 2 + 2, h - m * 2 - fs * 0.7 + 2); c.fillStyle = '#fff6e2'; c.fillText(t1, m * 2, h - m * 2 - fs * 0.7);
      c.font = `700 ${Math.round(fs * 0.5)}px Nunito, sans-serif`; c.fillStyle = '#f1d9a4'; c.fillText(t2.toUpperCase(), m * 2, h - m * 2);
    }
    return out;
  };
  P.shoot = function () {
    const S = G.S;
    el.flash.classList.remove('go'); void el.flash.offsetWidth; el.flash.classList.add('go');
    G.Audio && G.Audio.play('shutter');
    const out = P.render();
    const name = `god-of-the-ant-farm-dia-${S.day}.png`;
    out.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      // try the download; also show the photo, so it can be saved by hand where downloads are blocked
      try { const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); } catch (e) { }
      let v = $('#photo-view'); if (!v) { v = document.createElement('div'); v.id = 'photo-view'; document.body.appendChild(v); v.addEventListener('click', e => { if (e.target === v || e.target.closest('.pv-x')) v.classList.remove('on'); }); }
      v.innerHTML = `<div class="pv-box panel"><img alt="Foto do mundo"><div class="pv-row"><a class="pv-dl" download="${name}">Baixar a foto</a><span>ou clique com o botão direito na imagem e salve</span><button class="pv-x">Fechar</button></div></div>`;
      v.querySelector('img').src = url; v.querySelector('.pv-dl').href = url;
      v.classList.add('on');
    }, 'image/png');
  };
})(window.G);
