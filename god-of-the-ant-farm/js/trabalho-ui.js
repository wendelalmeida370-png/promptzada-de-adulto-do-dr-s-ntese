'use strict';
// ============================================================
//  The work's screen (20g, D-432): while the body works, or faces
//  a work it could do, a card by the corner of the body's screen
//  says the work, the tool in the hand (its figure, its material
//  and what it does against the trade's own — or that there is
//  none, and why, or that it goes slower), how far along it is,
//  what is left and what it gives. Inside G.IncUI.hud(), drawn on
//  the body's beat by the hook of the second wave (G.IncUI.frames,
//  D-462) — the same frame, the same pause. Only read: the words
//  come from G.Trabalho.info (each work's own, read only) and the
//  next stroke of a work held is asked on this beat (Tr.pump: the
//  provider's own E, through the hands).
// ============================================================
(function (G) {
  if (!G.IncUI || !G.IncUI.frames || !G.Trabalho) return;
  const Tr = G.Trabalho;
  const UI = G.TrabalhoUI = {};
  const esc = s => String(s === undefined || s === null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const num = x => String(Math.round(x * 100) / 100).replace('.', ',');
  let el = null, sig = '', upT = 0, shown = null;
  UI.shown = () => shown; // (for the proofs: what the card says now, or null)
  UI.el = () => el;
  function build() {
    const hud = G.IncUI.hud && G.IncUI.hud(); if (!hud) return false;
    if (el && el.parentNode === hud) return true;
    el = document.createElement('div'); el.className = 'ih-work panel hidden'; hud.appendChild(el); sig = ''; return true;
  }
  // (the figure of a thing: the inventory's sign — the art's icon or its fallback)
  const sign = k => (k && G.InvUI && G.InvUI.sign ? G.InvUI.sign(k) : '');
  function render(o) {
    if (!o) { el.classList.add('hidden'); shown = null; sig = ''; return; }
    const s = JSON.stringify([o.titulo, o.tool, o.toolKey, o.mul, o.pct === null ? null : Math.round(o.pct * 50), o.falta, o.rende, o.why, o.slow, o.busy, o.chain]);
    shown = o; if (s === sig) return; sig = s;
    const rate = o.toolKey && Math.abs(o.mul - 1) > 0.02 ? `<em class="${o.mul < 1 ? 'slow' : 'fast'}">${o.mul < 1 ? 'mais devagar' : 'mais depressa'} · ×${num(o.mul)}</em>` : '';
    const tool = o.toolKey ? `<span class="iw-tool"><i class="ic">${sign(o.toolKey)}</i>${esc(G.cap(o.tool))}${rate}</span>` : o.why ? '' : `<span class="iw-tool bare">com as mãos${o.mul < 1 - 0.02 ? ` <em class="slow">mais devagar · ×${num(o.mul)}</em>` : ''}</span>`;
    el.innerHTML = `<div class="iw-head"><b>${esc(o.titulo || o.nome)}</b>${o.chain ? '<small>sem parar</small>' : ''}</div>${tool}`
      + (o.pct !== null && o.pct !== undefined ? `<div class="iw-bar"><b style="width:${Math.round(Math.max(0, Math.min(1, o.pct)) * 100)}%"></b></div>` : '')
      + (o.falta ? `<div class="iw-row">${esc(o.falta)}</div>` : '') + (o.rende ? `<div class="iw-row iw-yield">${esc(o.rende)}</div>` : '')
      + (o.why ? `<div class="iw-warn">${esc(o.why)}</div>` : o.slow ? `<div class="iw-warn soft">${esc(o.slow)}</div>` : '');
    el.classList.remove('hidden');
  }
  G.IncUI.frames.push(rdt => {
    if (!G.Modes || !G.Modes.inc || !G.Modes.inc()) { if (el) el.classList.add('hidden'); shown = null; return; }
    Tr.pump(); // (the work held: its next stroke on the body's beat — the provider's own E, asked again)
    if (!build()) return;
    upT -= rdt || 0; if (upT > 0) return; upT = 0.1;
    const v = G.Possess.body(); render(v && !v.sleeping && !(G.Modes.panel && G.Modes.panel()) ? Tr.info() : null);
  });
})(window.G);
