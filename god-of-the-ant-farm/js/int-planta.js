'use strict';
// ============================================================
//  A planta no Modo Deus: o prédio escolhido aberto por cima,
//  piso por piso — os cômodos pelo que são, as paredes e o que
//  abre nelas, as escadas, os móveis —, no lugar do desenho do
//  prédio enquanto o deus a olha (só então: o resto do mundo fica
//  como está). Só desenha: lê a planta pela fila (want/pump, nunca
//  trava o quadro) e não toca no mundo nem no acaso dele.
// ============================================================
(function (G) {
  const PV = G.PlanView = { id: 0, lv: null };
  const In = () => G.Interiors;
  const TILE = 4;
  let rep = null; // (the dev mode's report of the plan open: kept while the plan and the ground are the same)
  G.worldHooks.push(() => { PV.id = 0; PV.lv = null; rep = null; });
  const sel = () => (G.UI && G.UI.selected) || null;
  const isB = b => !!(b && b.type && G.BDEF[b.type] && b.ip && In() && In().has(b));
  // (the plan is shown for the building chosen, only while it stays chosen)
  PV.open = b => !!(b && PV.id === b.id && sel() === b);
  PV.drawn = b => PV.open(b) && In().ready(b);
  const levelsOf = p => p.levels.slice().sort((a, b) => a.lv - b.lv);
  const storeyName = (l, levels) => {
    if (!l) return '';
    if (l.kind === 'porao') return 'porão'; if (l.kind === 'jirau') return 'jirau'; if (l.kind === 'galeria') return 'galeria'; if (l.kind === 'terraco') return 'terraço';
    if (l.lv === 0) return l.kind === 'semienterrado' ? 'térreo semienterrado' : l.kind === 'elevado' ? 'térreo sobre esteios' : 'térreo';
    return `${levels.filter(q => q.kind === 'andar' && q.lv <= l.lv).length}º andar`;
  };
  // the inspector's buttons: open and close the plan, a storey up or down
  PV.act = function (act, b) {
    if (!isB(b)) return;
    if (act === 'plan') { if (PV.id === b.id) { PV.id = 0; PV.lv = null; } else { PV.id = b.id; PV.lv = null; In().want(b); } return; }
    const p = In().ready(b) ? In().plan(b) : null; if (!p) return;
    const ls = levelsOf(p); const cur = PV.lv === null ? p.entryLv : PV.lv; let k = ls.findIndex(l => l.lv === cur); if (k < 0) k = 0;
    k = Math.max(0, Math.min(ls.length - 1, k + (act === 'plan-up' ? 1 : -1))); PV.lv = ls[k].lv;
  };
  PV.panelHTML = function (b, esc) {
    if (!isB(b) || !b.built) return '';
    const sh = In().shellOf(b); const fam = sh ? In().famName(sh.fam) : '';
    const open = PV.id === b.id; const p = open && In().ready(b) ? In().plan(b) : null;
    let nav = '';
    if (open && !p) nav = '<span class="muted">desenhando a planta…</span>';
    else if (p) {
      const ls = levelsOf(p); const cur = PV.lv === null ? p.entryLv : PV.lv; const l = ls.find(q => q.lv === cur) || ls[0];
      nav = `<button data-act="plan-down">▼</button> ${esc(storeyName(l, ls))} (${ls.indexOf(l) + 1} de ${ls.length}) <button data-act="plan-up">▲</button>`;
      if (p.short) nav += `<br><span class="muted">${p.short} ${p.short > 1 ? 'dormem' : 'dorme'} no chão: não coube cama para todos.</span>`;
      if (G.Dev && G.Dev.on) nav += checkHTML(b, p, esc);
    }
    return `<div class="doing">Planta: <b>${esc(fam)}</b>${sh ? ` · ${sh.shell.floors} ${sh.shell.floors > 1 ? 'pavimentos' : 'pavimento'}` : ''}<br><button data-act="plan" class="${open ? 'on' : ''}">${open ? 'Fechar a planta' : 'Ver a planta'}</button> ${nav}</div>`;
  };
  // (the dev mode: the plan's geometric report, the one qa/geometria.js gives — Parte 7.4: each defect, and the choices said;
  // a ruin's plan is what is left of one, and has none)
  function checkHTML(b, p, esc) {
    if (b.type === 'ruin') return '';
    const S = G.S; const key = (S.walkVer || 0) + ':' + (S.typeVer || 0);
    if (!rep || rep.p !== p || rep.key !== key) rep = { p, key, list: In().report(b, p, { world: true }) };
    const f = rep.list.filter(x => x.k === 'FALHA'), e = rep.list.filter(x => x.k === 'ESCOLHA');
    let h = `<br><span class="muted">Geometria: ${f.length ? `<b style="color:var(--red)">${f.length} ${f.length > 1 ? 'falhas' : 'falha'}</b>` : 'nenhuma falha'} · ${e.length} ${e.length === 1 ? 'escolha' : 'escolhas'}. Na planta, o chão que a porta alcança; os pontos de uso e as pontas das escadas: verde onde o corpo fica, vermelho onde não.</span>`;
    for (const x of f.slice(0, 4)) h += `<br><span style="color:var(--red)">✗ ${esc(x.what)}</span>`;
    for (const x of e.slice(0, 3)) h += `<br><span class="muted">· ${esc(x.what)}</span>`;
    return h;
  }

  // ------------------------------ the drawing ------------------------------
  const FN = {
    lar: '#d8c39a', salao: '#d8c39a', leitos: '#9fb6c8', quarto: '#9fb6c8', oficina: '#d9a86c', frente: '#d9b07a', cela: '#cfb48a', ala: '#cdbb95',
    corredor: '#e6dcc4', passagem: '#e6dcc4', nave: '#e2d6bb', 'nave-lateral': '#d6c7a6', despensa: '#a9a197', anexo: '#c9ab80', telheiro: '#c9ab80',
    galeria: '#b7a9c9', sobrado: '#b7a9c9', patio: '#a9c58e', terraco: '#b9cf9a',
    guarda: '#c9a27a', vestiario: '#d9cbb0', frio: '#9cc3d1', quente: '#d79a7a', trono: '#d8b56a', aposento: '#9fb6c8', cozinha: '#d9a86c',
    banquete: '#dcc08f', vestibulo: '#e6dcc4', ruas: '#cdbf98', praca: '#cdbf98', largo: '#cdbf98',
  };
  // (the dev mode's look at the plan's geometry, Parte 7.4: the floor the door reaches, tinted; each place where a body stands
  // to use a piece, a dot; the foot and the top of each flight, a ring the size of the body — green where the plan says the
  // body stands there, red where not)
  function drawCheck(ctx, p, lv, S, px) {
    const I = In(); const g = p.reach && p.reach[lv]; const n = p.grid ? p.grid.n : 0, cs = p.grid ? p.grid.cs : I.CS;
    if (g) {
      ctx.beginPath();
      for (let z = 0; z < n; z++) for (let x = 0; x < n; x++) {
        if (!g[z * n + x]) continue; const a = S(x * cs, z * cs), c = S((x + 1) * cs, z * cs), d = S((x + 1) * cs, (z + 1) * cs), e = S(x * cs, (z + 1) * cs);
        ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.lineTo(e[0], e[1]); ctx.closePath();
      }
      ctx.fillStyle = 'rgba(80,210,120,0.22)'; ctx.fill();
    }
    const dot = (x, z, ok, r) => { const s = S(x, z); ctx.beginPath(); ctx.arc(s[0], s[1], r * px, 0, Math.PI * 2); ctx.fillStyle = ok ? '#4fd27a' : '#ff4d4d'; ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.75)'; ctx.lineWidth = px; ctx.stroke(); };
    for (const it of p.items) if (it.lv === lv) for (const sp of it.spots) if (!sp.on) dot(sp.x, sp.z, sp.ok, 2.4);
    for (const M of p.marks || []) if (M.lv === lv) for (const q of M.pts) dot(q.x, q.z, q.ok, 1.8);
    const ring = (q, l) => {
      ctx.beginPath(); for (let k = 0; k <= 16; k++) { const a = k / 16 * Math.PI * 2; const s = S(q[0] + Math.cos(a) * I.BODY.r, q[1] + Math.sin(a) * I.BODY.r); if (k) ctx.lineTo(s[0], s[1]); else ctx.moveTo(s[0], s[1]); }
      ctx.strokeStyle = I.landsAt(p, l, q[0], q[1]) ? '#4fd27a' : '#ff4d4d'; ctx.lineWidth = 1.6 * px; ctx.stroke();
    };
    for (const s of p.stairs) { if (s.kind === 'degraus') continue; if (s.lv0 === lv) ring(s.a, s.lv0); if (s.lv1 === lv) ring(s.b, s.lv1); }
  }
  function drawPlan(ctx, b, p, lv) {
    const R = G.Render; const gh = G.W.groundH(b.x + b.w / 2, b.y + b.h / 2) + 0.02;
    const S = (x, z) => R.proj(b.x + x / TILE, b.y + z / TILE, gh);
    const poly = pts => { ctx.beginPath(); pts.forEach((q, i) => { const s = S(q[0], q[1]); if (i) ctx.lineTo(s[0], s[1]); else ctx.moveTo(s[0], s[1]); }); ctx.closePath(); };
    const rect = r => poly([[r[0], r[1]], [r[2], r[1]], [r[2], r[3]], [r[0], r[3]]]);
    const L = p.lot.w; const m0 = S(0, 0), m1 = S(1, 0); const ppm = Math.hypot(m1[0] - m0[0], m1[1] - m0[1]) || 1;
    const px = 1 / Math.max(0.2, R.cam.zoom); // (the drawing is in the world's pixels, scaled by the zoom: a screen pixel is this much)
    ctx.save();
    rect([0, 0, L, L]); ctx.fillStyle = 'rgba(22,18,14,0.9)'; ctx.fill();
    // the rooms of the storey, by what they are for
    for (const m of p.rooms) { if (m.lv !== lv) continue; poly(m.poly); ctx.fillStyle = FN[m.fn] || '#d2c4a4'; ctx.globalAlpha = m.open ? 0.75 : 0.95; ctx.fill(); }
    ctx.globalAlpha = 1;
    // the flights: those that rise from this storey, and the openings of those that arrive
    for (const s of p.stairs) {
      if (s.lv0 === lv && s.kind !== 'degraus') {
        rect(s.r); ctx.fillStyle = '#8f7a5e'; ctx.fill(); ctx.strokeStyle = '#4e4232'; ctx.lineWidth = px; ctx.stroke();
        const n = Math.max(3, Math.round((s.dir[0] ? s.r[2] - s.r[0] : s.r[3] - s.r[1]) / 0.25)); ctx.beginPath();
        for (let k = 1; k < n; k++) { const f = k / n; const a = s.dir[0] ? S(s.r[0] + (s.r[2] - s.r[0]) * f, s.r[1]) : S(s.r[0], s.r[1] + (s.r[3] - s.r[1]) * f), c = s.dir[0] ? S(s.r[0] + (s.r[2] - s.r[0]) * f, s.r[3]) : S(s.r[2], s.r[1] + (s.r[3] - s.r[1]) * f); ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]); }
        ctx.stroke();
      }
      if (s.lv1 === lv && s.hole) { rect(s.hole); ctx.setLineDash([3 * px, 3 * px]); ctx.strokeStyle = '#efe6d2'; ctx.lineWidth = px; ctx.stroke(); ctx.setLineDash([]); }
      if (s.kind === 'degraus' && s.lv1 === lv) { rect(s.r); ctx.fillStyle = 'rgba(160,140,110,0.85)'; ctx.fill(); }
    }
    // the things: what stands, what lies low (beds, benches), what is hung on the wall
    for (const it of p.items) {
      if (it.lv !== lv) continue; rect(it.r);
      ctx.fillStyle = it.niche ? '#8a7356' : it.places ? '#efe3c6' : it.low ? '#b99b72' : '#6e5235'; ctx.fill();
      ctx.strokeStyle = 'rgba(30,22,14,0.85)'; ctx.lineWidth = 0.8 * px; ctx.stroke();
    }
    // the walls, and what opens in them: a way through cut out, a window in pale blue
    for (const w of p.walls) {
      if (w.lv !== lv) continue; const a = S(w.a[0], w.a[1]), c = S(w.b[0], w.b[1]);
      const thin = w.kind === 'guarda-corpo' || w.kind === 'parapeito';
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]);
      ctx.strokeStyle = w.outer ? '#2b241b' : '#3d3428'; ctx.lineWidth = Math.max((thin ? 1 : 1.5) * px, w.t * ppm); if (thin) ctx.setLineDash([2 * px, 2 * px]); ctx.stroke(); ctx.setLineDash([]);
    }
    for (const h of p.holes) {
      const w = p.walls[h.wall]; if (!w || w.lv !== lv) continue; const len = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1;
      const tx = (w.b[0] - w.a[0]) / len, tz = (w.b[1] - w.a[1]) / len; const u0 = h.at - h.w / 2, u1 = h.at + h.w / 2;
      const a = S(w.a[0] + tx * u0, w.a[1] + tz * u0), c = S(w.a[0] + tx * u1, w.a[1] + tz * u1);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]);
      if (h.kind === 'janela') { ctx.strokeStyle = '#a9d2f0'; ctx.lineWidth = Math.max(px, w.t * ppm * 0.45); }
      else { ctx.strokeStyle = '#e8dcc2'; ctx.lineWidth = Math.max(1.5 * px, w.t * ppm + px); }
      ctx.stroke();
    }
    // the way in, from the street
    if (p.entrance && lv === p.entryLv) { const e = S(p.entrance.x, p.entrance.z), o = S(p.entrance.out[0], p.entrance.out[1]); const dx = e[0] - o[0], dy = e[1] - o[1], d = Math.hypot(dx, dy) || 1; const ux = dx / d, uy = dy / d; const q = 7 * px; ctx.beginPath(); ctx.moveTo(e[0], e[1]); ctx.lineTo(e[0] - ux * q * 1.6 - uy * q * 0.7, e[1] - uy * q * 1.6 + ux * q * 0.7); ctx.lineTo(e[0] - ux * q * 1.6 + uy * q * 0.7, e[1] - uy * q * 1.6 - ux * q * 0.7); ctx.closePath(); ctx.fillStyle = '#ffd66e'; ctx.fill(); }
    if (G.Dev && G.Dev.on && b.type !== 'ruin') drawCheck(ctx, p, lv, S, px);
    // its name and the storey, over the lot
    const ls = levelsOf(p); const l = ls.find(q => q.lv === lv); const top = [S(0, 0), S(L, 0), S(L, L), S(0, L)].reduce((m, s) => (s[1] < m[1] ? s : m));
    const txt = `${p.famName} — ${storeyName(l, ls)}${ls.length > 1 ? ` (${ls.indexOf(l) + 1}/${ls.length})` : ''}`;
    ctx.font = `600 ${(11 * px).toFixed(2)}px system-ui, sans-serif`; const tw = ctx.measureText(txt).width;
    ctx.fillStyle = 'rgba(20,16,12,0.82)'; ctx.fillRect(top[0] - tw / 2 - 6 * px, top[1] - 24 * px, tw + 12 * px, 17 * px); ctx.fillStyle = '#f3e7cc'; ctx.textAlign = 'center'; ctx.fillText(txt, top[0], top[1] - 11.5 * px);
    ctx.restore();
  }
  // (the plan takes the building's place in the drawing — the same depth —, while the god looks at it; until it is made, the
  // building as it is, and the line of plans moves a little every frame)
  const HK = G.renderHooks = G.renderHooks || { ground: [], ents: [] };
  HK.ents.push(add => {
    const b = sel(); if (!isB(b) || PV.id !== b.id) return;
    const I = In(); if (!I.ready(b)) { I.want(b); I.pump(3); return; }
    const p = I.plan(b); if (!p || !p.rooms) return;
    const lv = PV.lv === null || !p.levels.some(l => l.lv === PV.lv) ? p.entryLv : PV.lv;
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    add(cx + cy + (b.w + b.h) / 2 - 0.8, { fn: ctx => drawPlan(ctx, b, p, lv) }, cx, cy);
  });
})(window.G);
