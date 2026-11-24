'use strict';
// ============================================================
//  O Copo — the screen of the dice game (wave 4, T4: D-850 to
//  D-859). The table seen from above, in its people's look (the
//  Roman's marble with the Pompeian red, the Greek's wood with
//  the meander, Egypt's reed mat with lapis and gold, the North's
//  planks with the knotwork, the Aztec's palm mat with the
//  stepped fret, the plain boards of the others); the cups — of
//  leather, of clay or of wood, as the house has them —, shaken
//  and slammed; the body's own dice rolling with their weight,
//  bouncing, with their shadow, and stopping on the faces the
//  world threw; the faces of the others (G.Retrato3D) and their
//  names as the body knows them (G.Possess.knows); the coins of
//  the people in the pot; each bid in a balloon; the cups coming
//  up one by one, the sum counted, who hit it, who burnt a die;
//  the win and the loss.
//  Only seen (D-669): it reads the world — G.JogoDados.corpo, what
//  the body may know: its own dice, nobody else's till the cups
//  come up — and asks every change of it through the body's hands
//  (G.Possess.apply). The rolling is the view of the result: the
//  motion is the view's own chance (G.VR), the faces the world's.
//  Its sounds by the screen's door (G.Audio.ui: T8). Built for the
//  phone held upright and for the PC: the touch, the keys, the
//  controller.
// ============================================================
(function (G) {
  const UI = G.JogoDadosUI = {};
  const I = G.Interact; if (!I || !G.Possess) return;
  const JD = () => G.JogoDados, P = () => G.Possess;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const cap = s => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
  const toast = (txt, d) => { if (txt && G.IncUI && G.IncUI.toast) G.IncUI.toast(txt, d || 2.6); };
  const deny = r => { if (r && r.why) toast(r.why); if (G.Audio && G.Audio.play) G.Audio.play('deny'); };
  const snd = (k, o) => { if (G.Audio && G.Audio.ui) G.Audio.ui(k, o); };
  const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
  const ease = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  let panel = null, cv = null, ctx = null, open = false, closer = false, sig = '', pick = 0, pickFor = '', busy = false, note = '', help = false;
  let saidShown = '';
  let scene = null, faces = new Map(), lastKey = '', said = {}, seatEls = new Map(), upT = 0;
  G.worldHooks.push(() => { if (open) hide(true); scene = null; faces = new Map(); lastKey = ''; said = {}; saidShown = ''; sig = ''; pick = 0; pickFor = ''; });
  UI.isOpen = () => open;

  // ------------------------------ the verb at the table (F and the card's keys) ------------------------------
  // (seated at a tavern's table: call the table to the dice, join a game being called there, see the game one plays in, watch the one
  // of the table — what can be done is the world's: G.JogoDados.verbo)
  const vb = () => (JD() && JD().verbo ? JD().verbo(P().body()) : null);
  // (the label says where the dice of the game come from — the body's own, the house's lent and the rent, the wait for one free: the J
  // front, D-933 to D-935; the why is the world's: G.JogoDados.verbo)
  I.verb('taverna', { id: 'jd-dados', k: 'outra', ord: 3.5,
    label: (ctx, t) => { if (t.bal) return ''; const x = vb(); if (!x || !x.k) return '';
      if (x.k === 'chamar') return x.ok ? `Chamar a mesa para os dados — ${x.de}${x.aluguel ? ` (aluguel ${priceNow(x.aluguel)})` : ''}` : x.espera ? 'Chamar a mesa para os dados — esperando um jogo livre' : 'Chamar a mesa para os dados';
      if (x.k === 'entrar') return `Entrar no jogo de dados${x.aposta ? ` (aposta de ${priceNow(x.aposta)})` : ''}${x.de ? ` — ${x.de}` : ''}`;
      return x.k === 'jogo' ? 'Ver o jogo de dados' : 'Olhar o jogo de dados'; },
    can: () => { const x = vb(); return x && x.k ? { ok: x.ok, why: x.why } : { ok: false }; },
    run: () => {
      const x = vb(); if (!x || !x.k) return { ok: false };
      if (x.k === 'jogo' || x.k === 'olhar') { UI.open(true); return { ok: true }; }
      if (x.k === 'entrar') { const op = x.op; G.IncUI.when(G.Possess.apply(w => JD().entrar(w, op)), r => { snd('aposta', { n: 1 }); toast(r.msg, 2); UI.open(true); }, deny); return { ok: true }; }
      const s = (x.apostas || [0]).includes(UI.lastStake) ? UI.lastStake : (x.apostas || [0])[0];
      G.IncUI.when(G.Possess.apply(w => JD().chamar(w, s)), r => { toast(r.msg, 2.4); UI.open(true); }, deny); return { ok: true };
    } });
  // (a price as the body's tavern says it, for the verb's label)
  function priceNow(n) { const v = P().body(); const b = v && v.inside ? G.S.buildings.get(v.inside) : null; return b && JD().money ? JD().money(b, n) : String(n); }
  // (with no dice of its own, at a tavern: buy a set of the keeper — what is left over, or one he makes today of the house's stuff —, by
  // the hands, G.Possess.apply → G.JogosCasa.comprar; D-936. Only shown while the keeper could sell one, or the coins are what is short)
  const JCa = () => G.JogosCasa;
  const compra = () => { const v = P().body(); return v && JCa() && JCa().podeComprar ? JCa().podeComprar(v, 'dados') : null; };
  I.verb('taverna', { id: 'jc-dados-compra', k: 'outra', ord: 3.6,
    label: (ctx, t) => { if (t.bal) return ''; const v = P().body(); if (!v || !JCa() || JCa().proprio(v, 'dados')) return ''; const c = compra(); if (!c || !c.k) return '';
      return `Comprar um jogo de dados do taverneiro${c.preco ? ` (${priceNow(c.preco)})` : ''}`; },
    can: () => { const c = compra(); return c ? { ok: c.ok, why: c.why } : { ok: false }; },
    run: () => { G.IncUI.when(G.Possess.apply(w => G.JogosCasa.comprar(w, 'dados')), r => { snd('aposta', { n: 1 }); toast(r.msg, 2.4); }, deny); return { ok: true }; } });

  // ------------------------------ the looks of the peoples (only drawn here) ------------------------------
  // the table: its top and its rim; the money of the pot; the names of the game
  const LOOK = {
    romano: { top: 'marmore', titulo: 'Tesserae', sub: 'os dados no fritillus' },
    grego: { top: 'madeira-meandro', titulo: 'Kýboi', sub: 'os dados no copo' },
    egipcio: { top: 'esteira', titulo: 'Os dados de Thoth', sub: 'o jogo do copo' },
    nordico: { top: 'tabuas', titulo: 'Teningar', sub: 'os dados no copo' },
    asteca: { top: 'petate', titulo: 'O copo', sub: 'os dados sobre o petate' },
    classico: { top: 'tabuas-claras', titulo: 'O copo', sub: 'o jogo de dados da taverna' },
  };
  const COIN = { romano: 'denario', grego: 'dracma', egipcio: 'deben', nordico: 'prata', asteca: 'cacau', classico: 'bronze' };
  // (a small seeded generator for the painted grain of a table — the same table every frame, no chance of anyone's)
  const seeded = s => () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  // the top of the table, painted once for a size and a people (an offscreen canvas): w × h pixels
  const texMemo = new Map();
  function tableTex(tema, w, h) {
    const key = tema + ':' + w + 'x' + h; if (texMemo.has(key)) return texMemo.get(key);
    const t = document.createElement('canvas'); t.width = w; t.height = h; const c = t.getContext('2d'); const R = seeded(w * 7 + h * 13 + tema.length * 101);
    const kind = (LOOK[tema] || LOOK.classico).top; const rad = Math.min(w, h) * 0.08;
    c.save(); rr(c, 0, 0, w, h, rad); c.clip();
    if (kind === 'marmore') {
      const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#f3efe6'); g.addColorStop(0.55, '#e6dfd3'); g.addColorStop(1, '#d7cebf'); c.fillStyle = g; c.fillRect(0, 0, w, h);
      // (the stone's clouds, then its veins: a few long ones running one way, each a main thread and its fine branches)
      for (let i = 0; i < 9; i++) { const x = R() * w, y = R() * h, r = (0.2 + R() * 0.35) * Math.max(w, h); const cg = c.createRadialGradient(x, y, 0, x, y, r); cg.addColorStop(0, `rgba(${170 + R() * 30},${160 + R() * 25},${150 + R() * 20},.12)`); cg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = cg; c.fillRect(0, 0, w, h); }
      const vein = (x, y, ang, len, wd, a, depth) => { c.strokeStyle = `rgba(105,96,88,${a})`; c.lineWidth = wd; c.beginPath(); c.moveTo(x, y); const n = 14;
        for (let k = 1; k <= n; k++) { ang += (R() - 0.5) * 0.35; x += Math.cos(ang) * len / n; y += Math.sin(ang) * len / n; c.lineTo(x, y); if (depth < 2 && R() < 0.12) vein(x, y, ang + (R() < 0.5 ? -0.7 : 0.7), len * 0.35, wd * 0.5, a * 0.8, depth + 1); } c.stroke(); };
      for (let i = 0; i < 7; i++) vein(-w * 0.1 + R() * w * 0.4, R() * h, 0.55 + (R() - 0.5) * 0.4, Math.max(w, h) * (0.6 + R() * 0.6), 0.6 + R() * 1.4, 0.1 + R() * 0.12, 0);
      const gl = c.createRadialGradient(w * 0.35, h * 0.25, 0, w * 0.35, h * 0.25, w * 0.8); gl.addColorStop(0, 'rgba(255,255,255,.25)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gl; c.fillRect(0, 0, w, h);
      // (the inlaid band: Pompeian red between gold fillets)
      const b = Math.min(w, h) * 0.055; c.lineWidth = b; c.strokeStyle = '#9a2a1d'; rr(c, b * 1.1, b * 1.1, w - b * 2.2, h - b * 2.2, rad * 0.7); c.stroke();
      c.lineWidth = 1.6; c.strokeStyle = '#c59a3d'; rr(c, b * 0.55, b * 0.55, w - b * 1.1, h - b * 1.1, rad * 0.8); c.stroke(); rr(c, b * 1.65, b * 1.65, w - b * 3.3, h - b * 3.3, rad * 0.6); c.stroke();
    } else if (kind === 'esteira' || kind === 'petate') {
      const A = kind === 'esteira' ? ['#d8c38c', '#c5ab6c', '#b39558'] : ['#cfae73', '#b8955a', '#a17f47'];
      c.fillStyle = A[1]; c.fillRect(0, 0, w, h); const s = Math.max(10, Math.min(w, h) / 22);
      if (kind === 'esteira') for (let y = 0; y < h; y += s) for (let x = 0; x < w; x += s) { const hz = ((x / s | 0) + (y / s | 0)) % 2; c.fillStyle = hz ? A[0] : A[2]; for (let k = 0; k < 4; k++) { c.globalAlpha = 0.55 + R() * 0.3; if (hz) c.fillRect(x, y + k * s / 4 + 0.6, s, s / 4 - 1.2); else c.fillRect(x + k * s / 4 + 0.6, y, s / 4 - 1.2, s); } c.globalAlpha = 1; }
      // (the palm mat: strips woven on the bias, two over two under — each strip with its fibres and the dark of the one it dives under)
      else { c.save(); c.translate(w / 2, h / 2); c.rotate(Math.PI / 4); const D = Math.hypot(w, h); const q = s * 0.8;
        for (let y = -D / 2; y < D / 2; y += q) for (let x = -D / 2; x < D / 2; x += q) { const i = Math.floor(x / q), j = Math.floor(y / q); const hz = ((i + j) % 4 + 4) % 4 < 2;
          const gg = hz ? c.createLinearGradient(x, y, x, y + q) : c.createLinearGradient(x, y, x + q, y); gg.addColorStop(0, A[2]); gg.addColorStop(0.25, A[0]); gg.addColorStop(0.75, A[1]); gg.addColorStop(1, A[2]); c.fillStyle = gg;
          c.globalAlpha = 0.8 + R() * 0.2; c.fillRect(x + (hz ? 0 : 0.8), y + (hz ? 0.8 : 0), hz ? q : q - 1.6, hz ? q - 1.6 : q);
          c.globalAlpha = 0.18; c.strokeStyle = '#5a3f1c'; c.lineWidth = 0.6; c.beginPath(); for (let f = 1; f < 3; f++) { if (hz) { c.moveTo(x, y + f * q / 3); c.lineTo(x + q, y + f * q / 3); } else { c.moveTo(x + f * q / 3, y); c.lineTo(x + f * q / 3, y + q); } } c.stroke(); }
        c.restore(); c.globalAlpha = 1; }
      // (the border: lapis and gold, or the stepped fret in turquoise on red)
      const b = Math.min(w, h) * 0.07;
      if (kind === 'esteira') { c.lineWidth = b * 0.6; c.strokeStyle = '#1f3d8a'; rr(c, b * 0.5, b * 0.5, w - b, h - b, rad); c.stroke(); c.lineWidth = b * 0.18; c.strokeStyle = '#c9971f'; rr(c, b * 0.92, b * 0.92, w - b * 1.84, h - b * 1.84, rad * 0.8); c.stroke(); rr(c, b * 0.12, b * 0.12, w - b * 0.24, h - b * 0.24, rad); c.stroke(); }
      else { c.lineWidth = b; c.strokeStyle = '#9e2a20'; rr(c, b / 2, b / 2, w - b, h - b, rad); c.stroke(); c.strokeStyle = '#22a89d'; c.lineWidth = b * 0.22; const st = b * 1.4;
        const fret = (x0, y0, len, horiz) => { c.beginPath(); for (let p = 0; p < len; p += st) { const a = horiz ? [x0 + p, y0] : [x0, y0 + p]; const q = (u, v) => (horiz ? [a[0] + u * st, a[1] + v * b] : [a[0] + v * b, a[1] + u * st]); const pts = [q(0, 0.75), q(0.25, 0.75), q(0.25, 0.45), q(0.5, 0.45), q(0.5, 0.2), q(0.85, 0.2), q(0.85, 0.6), q(0.65, 0.6)]; c.moveTo(pts[0][0], pts[0][1]); for (const pt of pts.slice(1)) c.lineTo(pt[0], pt[1]); } c.stroke(); };
        fret(b * 0.7, 0, w - b * 1.4, true); fret(b * 0.7, h - b, w - b * 1.4, true); fret(0, b * 0.7, h - b * 1.4, false); fret(w - b, b * 0.7, h - b * 1.4, false); }
    } else {
      // (planks: the North's dark heavy boards with knots and nails; the Greek's warm walnut; the others' plain boards)
      const P0 = kind === 'tabuas' ? ['#4c311d', '#3d2716', '#5a3b23'] : kind === 'madeira-meandro' ? ['#7a4f2f', '#6a4327', '#87593a'] : ['#8a6640', '#7a5835', '#98734b'];
      const n = kind === 'tabuas' ? 5 : 6; const pw = w / n;
      for (let i = 0; i < n; i++) { const g = c.createLinearGradient(i * pw, 0, (i + 1) * pw, 0); g.addColorStop(0, P0[(i % 3)]); g.addColorStop(0.5, P0[(i + 1) % 3]); g.addColorStop(1, P0[i % 3]); c.fillStyle = g; c.fillRect(i * pw, 0, pw + 1, h);
        for (let k = 0; k < 9; k++) { c.strokeStyle = `rgba(20,10,4,${0.08 + R() * 0.14})`; c.lineWidth = 0.6 + R() * 1.4; c.beginPath(); const x0 = i * pw + R() * pw; c.moveTo(x0, 0); for (let y = 0; y <= h; y += h / 8) c.lineTo(x0 + Math.sin(y / h * 6 + k) * pw * 0.06 + (R() - 0.5) * 2, y); c.stroke(); }
        c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(i * pw - 1, 0, 2, h); }
      if (kind === 'tabuas') {
        for (let k = 0; k < 6; k++) { const x = R() * w, y = R() * h; const g = c.createRadialGradient(x, y, 0, x, y, 10 + R() * 12); g.addColorStop(0, 'rgba(15,7,2,.6)'); g.addColorStop(1, 'rgba(15,7,2,0)'); c.fillStyle = g; c.beginPath(); c.ellipse(x, y, 14, 7, 0, 0, 7); c.fill(); }
        for (let i = 0; i < n; i++) for (const y of [h * 0.07, h * 0.93]) { c.fillStyle = '#1a1512'; c.beginPath(); c.arc(i * pw + pw / 2, y, 3.2, 0, 7); c.fill(); c.fillStyle = 'rgba(200,200,210,.35)'; c.beginPath(); c.arc(i * pw + pw / 2 - 0.8, y - 0.8, 1.2, 0, 7); c.fill(); }
        const b = Math.min(w, h) * 0.05; c.lineCap = 'round';
        for (const [x0, y0, x1, y1] of [[b, b, w - b, b], [b, h - b, w - b, h - b]]) for (const ph of [0, Math.PI]) { c.strokeStyle = '#1c1008'; c.lineWidth = 6; c.beginPath(); for (let x = x0; x <= x1; x += 4) c.lineTo(x, y0 + Math.sin((x - x0) / 18 + ph) * b * 0.32); c.stroke(); c.strokeStyle = '#c99a4c'; c.lineWidth = 2.4; c.stroke(); }
      } else if (kind === 'madeira-meandro') {
        const b = Math.min(w, h) * 0.075; c.fillStyle = '#c7672f'; for (const [x, y, ww, hh] of [[0, 0, w, b], [0, h - b, w, b], [0, 0, b, h], [w - b, 0, b, h]]) c.fillRect(x, y, ww, hh);
        c.strokeStyle = '#1b120c'; c.lineWidth = Math.max(1.6, b * 0.12); const u = b * 0.75;
        const band = (x0, y0, len, horiz) => { for (let p = 0; p + u <= len; p += u) { const o = (a, bb) => (horiz ? [x0 + p + a * u, y0 + bb * u] : [x0 + bb * u, y0 + p + a * u]); const pts = [o(0, 0.85), o(0, 0.15), o(0.8, 0.15), o(0.8, 0.65), o(0.35, 0.65), o(0.35, 0.4)]; c.beginPath(); c.moveTo(...pts[0]); for (const q of pts.slice(1)) c.lineTo(...q); c.stroke(); } };
        band(b * 0.15, b * 0.12, w - b * 0.3, true); band(b * 0.15, h - b * 0.88, w - b * 0.3, true); band(b * 0.12, b, h - b * 2, false); band(w - b * 0.88, b, h - b * 2, false);
      } else { const b = Math.min(w, h) * 0.05; c.strokeStyle = 'rgba(40,24,10,.55)'; c.lineWidth = 2; rr(c, b, b, w - b * 2, h - b * 2, rad * 0.6); c.stroke(); rr(c, b * 1.4, b * 1.4, w - b * 2.8, h - b * 2.8, rad * 0.5); c.stroke(); }
    }
    // (the light of the room on the board, and the worn middle)
    const lg = c.createRadialGradient(w * 0.5, h * 0.42, Math.min(w, h) * 0.1, w * 0.5, h * 0.5, Math.max(w, h) * 0.75); lg.addColorStop(0, 'rgba(255,214,150,.14)'); lg.addColorStop(1, 'rgba(0,0,0,.32)'); c.fillStyle = lg; c.fillRect(0, 0, w, h);
    c.restore();
    texMemo.set(key, t); if (texMemo.size > 8) texMemo.delete(texMemo.keys().next().value);
    return t;
  }

  // ------------------------------ the things on the table ------------------------------
  // (the pips of a face, on a unit square −1..1)
  const PIPS = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
  const DIE = { osso: ['#fbf3df', '#dccaa2', '#3a2514', '#efe3c6'], madeira: ['#c58a4f', '#8f5d31', '#24150b', '#b27a44'] };
  // a die seen from above: at x, y, s the side, a the turn, f the face (0: a die whose face is not known — a plain top), lift the height
  function die(c, x, y, s, a, f, mat, lift, alpha) {
    const C = DIE[mat] || DIE.osso; const h = lift || 0; c.save(); c.globalAlpha = alpha === undefined ? 1 : alpha;
    // (the shadow: farther and softer the higher it is)
    c.fillStyle = `rgba(10,5,2,${0.38 - Math.min(0.22, h * 0.006)})`; c.save(); c.translate(x + s * 0.12 + h * 0.5, y + s * 0.16 + h * 0.65); c.rotate(a); rr(c, -s / 2, -s / 2, s, s, s * 0.22); c.filter = h > 2 ? `blur(${Math.min(6, h * 0.12)}px)` : 'none'; c.fill(); c.restore();
    c.translate(x, y - h * 0.15); c.rotate(a); const k = 1 + h * 0.004; c.scale(k, k);
    // (the body of the die: its sides showing a little below the top, the top lit from the lamp)
    c.fillStyle = C[1]; rr(c, -s / 2, -s / 2 + s * 0.05, s, s, s * 0.22); c.fill();
    const g = c.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2); g.addColorStop(0, C[0]); g.addColorStop(1, C[3]); c.fillStyle = g; rr(c, -s / 2, -s / 2, s, s * 0.95, s * 0.22); c.fill();
    if (mat === 'madeira') { c.strokeStyle = 'rgba(60,30,10,.25)'; c.lineWidth = 0.7; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(-s / 2 + 2, i * s * 0.18); c.quadraticCurveTo(0, i * s * 0.18 + s * 0.05, s / 2 - 2, i * s * 0.18); c.stroke(); } }
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = Math.max(0.8, s * 0.04); rr(c, -s / 2 + s * 0.06, -s / 2 + s * 0.05, s * 0.88, s * 0.82, s * 0.18); c.stroke();
    if (f >= 1 && f <= 6) { c.fillStyle = C[2]; const q = s * 0.26; for (const [u, v] of PIPS[f]) { c.beginPath(); c.arc(u * q, v * q - s * 0.02, s * 0.085, 0, 7); c.fill(); } }
    c.restore();
  }
  // the cup upside down on the table (its foot ring seen from above), or lifted (k 0..1: down → up and aside)
  const CUP = { couro: ['#6d4024', '#4a2914', '#8a5634'], barro: ['#a85d38', '#6a3420', '#c27a52'], madeira: ['#8a6038', '#5c3d20', '#a97b4e'] };
  function cup(c, x, y, r, mat, k, jig) {
    const C = CUP[mat] || CUP.madeira; const up = ease(k || 0); const lift = up * r * 1.25; const jx = jig ? jig[0] : 0, jy = jig ? jig[1] : 0;
    c.save(); c.translate(jx, jy);
    // (its shadow: tight and dark on the board; lifted, it spreads and fades — a soft pool, never a disc)
    c.save(); if (up > 0.05) c.filter = `blur(${(2 + up * 7).toFixed(1)}px)`; c.fillStyle = `rgba(8,4,2,${(0.45 * (1 - up * 0.7)).toFixed(3)})`; c.beginPath(); c.ellipse(x + r * 0.18 + lift * 0.35, y + r * 0.24 + lift * 0.55, r * (1.02 + up * 0.1), r * (0.98 + up * 0.1), 0, 0, 7); c.fill(); c.restore();
    const cx = x - lift * 0.15, cy = y - lift * 0.55; const rr2 = r * (1 + up * 0.18);
    const g = c.createRadialGradient(cx - rr2 * 0.35, cy - rr2 * 0.4, rr2 * 0.1, cx, cy, rr2); g.addColorStop(0, C[2]); g.addColorStop(0.7, C[0]); g.addColorStop(1, C[1]); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, rr2, 0, 7); c.fill();
    c.strokeStyle = C[1]; c.lineWidth = Math.max(1, r * 0.07); c.beginPath(); c.arc(cx, cy, rr2 * 0.62, 0, 7); c.stroke();
    if (mat === 'couro') { c.setLineDash([r * 0.12, r * 0.09]); c.strokeStyle = 'rgba(240,215,170,.55)'; c.lineWidth = Math.max(0.8, r * 0.035); c.beginPath(); c.arc(cx, cy, rr2 * 0.86, 0, 7); c.stroke(); c.setLineDash([]); }
    else if (mat === 'barro') { c.strokeStyle = '#2a140a'; c.lineWidth = Math.max(1.4, r * 0.1); c.beginPath(); c.arc(cx, cy, rr2 * 0.8, 0, 7); c.stroke(); }
    else { c.strokeStyle = 'rgba(40,20,8,.35)'; c.lineWidth = 0.8; for (const q of [0.3, 0.45, 0.75, 0.9]) { c.beginPath(); c.arc(cx, cy, rr2 * q, 0, 7); c.stroke(); } }
    c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.ellipse(cx - rr2 * 0.35, cy - rr2 * 0.4, rr2 * 0.3, rr2 * 0.16, -0.6, 0, 7); c.fill();
    c.restore();
  }
  // the coins of the pot, in the people's money: silver denarii and drachmas, copper rings of deben, bits of hacksilver, cacao beans,
  // bronze coins — n of them, piled in stacks
  function coins(c, x, y, s, n, kind) {
    const N = Math.min(42, n); const per = 7; const stacks = Math.ceil(N / per);
    for (let i = 0; i < stacks; i++) {
      const a = i * 2.39996, d = i === 0 ? 0 : s * (0.9 + 0.55 * Math.sqrt(i)); const sx = x + Math.cos(a) * d, sy = y + Math.sin(a) * d * 0.8; const m = Math.min(per, N - i * per);
      for (let k = 0; k < m; k++) coin(c, sx + Math.sin(k * 1.7 + i) * s * 0.06, sy - k * s * 0.17, s, kind, (i * 7 + k) % 5);
    }
  }
  function coin(c, x, y, s, kind, v) {
    c.save(); c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(x + 1.5, y + 2.5, s * 0.55, s * 0.33, 0, 0, 7); c.fill();
    if (kind === 'cacau') { c.translate(x, y); c.rotate(v * 0.6); const g = c.createLinearGradient(-s * 0.5, 0, s * 0.5, 0); g.addColorStop(0, '#4a2412'); g.addColorStop(0.5, '#7a3e1f'); g.addColorStop(1, '#3a1a0c'); c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, s * 0.5, s * 0.3, 0, 0, 7); c.fill(); c.strokeStyle = 'rgba(255,220,180,.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-s * 0.4, 0); c.quadraticCurveTo(0, -s * 0.06, s * 0.4, 0); c.stroke(); c.restore(); return; }
    if (kind === 'prata') { c.translate(x, y); c.rotate(v); const g = c.createLinearGradient(-s * 0.4, -s * 0.2, s * 0.4, s * 0.2); g.addColorStop(0, '#e9ecef'); g.addColorStop(1, '#8e959c'); c.fillStyle = g; c.beginPath(); c.moveTo(-s * 0.5, -s * 0.1); c.lineTo(-s * 0.15, -s * 0.3); c.lineTo(s * 0.45, -s * 0.18); c.lineTo(s * 0.35, s * 0.22); c.lineTo(-s * 0.3, s * 0.28); c.closePath(); c.fill(); c.strokeStyle = 'rgba(60,64,70,.6)'; c.lineWidth = 0.8; c.stroke(); c.restore(); return; }
    const M = { denario: ['#eef0f2', '#a9b0b7', '#7b838b'], dracma: ['#f2f2ee', '#b4b6ae', '#80827a'], deben: ['#e3955a', '#b0602e', '#7c3c18'], bronze: ['#e0a45e', '#a8682c', '#734214'] }[kind] || ['#e0a45e', '#a8682c', '#734214'];
    c.fillStyle = M[2]; c.beginPath(); c.ellipse(x, y + s * 0.07, s * 0.52, s * 0.31, 0, 0, 7); c.fill();
    const g = c.createLinearGradient(x - s * 0.5, y - s * 0.3, x + s * 0.5, y + s * 0.3); g.addColorStop(0, M[0]); g.addColorStop(1, M[1]); c.fillStyle = g; c.beginPath(); c.ellipse(x, y, s * 0.52, s * 0.31, 0, 0, 7); c.fill();
    if (kind === 'deben') { c.fillStyle = M[2]; c.beginPath(); c.ellipse(x, y, s * 0.22, s * 0.13, 0, 0, 7); c.fill(); }
    else { c.strokeStyle = 'rgba(0,0,0,.22)'; c.lineWidth = 0.8; c.beginPath(); c.ellipse(x, y, s * 0.38, s * 0.22, 0, 0, 7); c.stroke(); c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(x + s * (v - 2) * 0.03, y, s * 0.13, s * 0.1, 0, 0, 7); c.fill(); }
    c.restore();
  }

  // ------------------------------ the seats ------------------------------
  // where each one sits round the table (fractions of the table's rect): the body at the bottom; the others round it
  const LAY = { 1: [[0.5, 0.86]], 2: [[0.5, 0.86], [0.5, 0.14]], 3: [[0.5, 0.86], [0.2, 0.2], [0.8, 0.2]], 4: [[0.5, 0.86], [0.1, 0.5], [0.5, 0.14], [0.9, 0.5]] };
  // (the players in the order of the seats: the body first, then round the table as they sat)
  function seated(s) { const L = s.jogadores.slice(); const i = L.findIndex(p => p.eu); if (i > 0) return L.slice(i).concat(L.slice(0, i)); return L; }

  // ------------------------------ the scene: what the view keeps between frames (never the world) ------------------------------
  // the body's dice rolling (physics in the canvas's pixels), the cups' moments, the balloons' births, the coins' flights
  function newScene(s) { return { op: s.op, r: -1, fase: '', t0: 0, dice: [], bids: {}, revT: 0, lastLift: -1, counted: 0, coinsFly: null, banner: null, shake: 0, rolled: false, ended: false }; }
  // the throw of the body's dice: out of its cup toward the middle, each its own speed and spin (the view's chance), to land on the
  // faces the world threw
  function throwDice(sc, F, geo, mat) {
    const L = []; const base = geo.myCup; const n = F.length;
    for (let i = 0; i < n; i++) L.push({ x: base[0] + geo.cupR * 0.7 + G.vrr(-4, 4), y: base[1] - geo.cupR * 0.2 + G.vrr(-6, 6), z: 26 + G.vrr(0, 16), vx: G.vrr(150, 260) * geo.k, vy: -G.vrr(40, 170) * geo.k, vz: G.vrr(60, 120), a: G.vrr(0, 6.28), w: G.vrr(-14, 14), f: F[i], show: 1 + G.vri(0, 5), flick: 0, rest: false, mat });
    sc.dice = L; sc.rolled = true; snd('dados-rolar', { mat, n });
  }
  function stepDice(sc, dt, geo) {
    let moving = 0;
    for (const d of sc.dice) {
      if (d.rest) continue; moving++;
      d.vz -= 900 * dt; d.z += d.vz * dt; if (d.z < 0) { d.z = 0; if (Math.abs(d.vz) > 60) { d.vz = -d.vz * 0.42; d.w *= 0.7; snd('dados-parar', { mat: d.mat, n: 1, vol: 0.25 }); } else d.vz = 0; }
      d.x += d.vx * dt; d.y += d.vy * dt; d.a += d.w * dt;
      const fr = d.z > 0 ? 0.25 : 3.2; d.vx *= Math.max(0, 1 - fr * dt); d.vy *= Math.max(0, 1 - fr * dt); d.w *= Math.max(0, 1 - (d.z > 0 ? 0.3 : 2.6) * dt);
      const T = geo.tray; if (d.x < T[0]) { d.x = T[0]; d.vx = Math.abs(d.vx) * 0.5; } if (d.x > T[2]) { d.x = T[2]; d.vx = -Math.abs(d.vx) * 0.5; } if (d.y < T[1]) { d.y = T[1]; d.vy = Math.abs(d.vy) * 0.5; } if (d.y > T[3]) { d.y = T[3]; d.vy = -Math.abs(d.vy) * 0.5; }
      for (const o of sc.dice) { if (o === d) continue; const dx = d.x - o.x, dy = d.y - o.y, dd = Math.hypot(dx, dy), m = geo.myDie * 1.05; if (dd > 0 && dd < m) { const p = (m - dd) / 2; d.x += dx / dd * p; d.y += dy / dd * p; o.x -= dx / dd * p; o.y -= dy / dd * p; } }
      d.flick -= dt; if (d.flick <= 0 && (d.z > 0 || Math.hypot(d.vx, d.vy) > 40)) { d.flick = 0.07; d.show = 1 + G.vri(0, 5); }
      if (d.z === 0 && Math.hypot(d.vx, d.vy) < 14 && Math.abs(d.w) < 1.2) { d.rest = true; d.show = d.f; d.a = Math.round(d.a / (Math.PI / 2)) * (Math.PI / 2) + G.vrr(-0.18, 0.18); }
    }
    if (!moving && sc.rolled && !sc.settled) { sc.settled = true; snd('dados-parar', { mat: (sc.dice[0] || {}).mat, n: sc.dice.length }); }
  }

  // ------------------------------ the panel ------------------------------
  function build() {
    const root = G.IncUI && G.IncUI.root && G.IncUI.root(); if (!root) return false; if (panel) return true;
    panel = document.createElement('div'); panel.id = 'dados-panel'; panel.className = 'jd hidden';
    panel.innerHTML = `<div class="jd-card"><div class="jd-band"></div>
      <header class="jd-top"><i class="jd-emb"></i><div class="jd-tit"><h3>O copo</h3><small></small></div><div class="jd-pote"><b>0</b><small></small></div>
        <button class="jd-ajuda" data-a="ajuda" aria-label="Como se joga" title="Como se joga">?</button><button class="x" data-a="close" aria-label="Fechar" title="Fechar (Esc)">×</button></header>
      <div class="jd-mesa"><canvas></canvas><div class="jd-seats"></div><div class="jd-mid"></div><div class="jd-banner"></div></div>
      <div class="jd-ctl"></div><div class="jd-regras hidden"></div></div>`;
    root.appendChild(panel); cv = panel.querySelector('canvas'); ctx = cv.getContext('2d');
    panel.addEventListener('click', onClick); panel.addEventListener('contextmenu', e => e.preventDefault());
    if (!closer) { closer = true; G.IncUI.closers.push(() => { if (open) hide(); }); }
    return true;
  }
  // open the screen of the game the body plays in, or watches at its table: true when open. With the screen put away (H) it waits for
  // the hands — the verb — and never opens by itself
  UI.open = function (force) {
    const v = P().body(); if (!G.Modes.inc() || !v || !build()) return false;
    const s = JD().corpo(v); if (!s) return false;
    if (!force && (G.Modes.panel() || (G.IncUI.hudOff && G.IncUI.hudOff()))) return false;
    G.IncUI.closeAll(); G.Modes.setPanel('dados'); G.Input3D.free(); G.IncUI.root().classList.add('jd-on');
    const look = Object.assign({ tema: s.tema }, UI.force || {});
    panel.className = `jd t-${look.tema || 'classico'}`; open = true; sig = ''; note = ''; busy = false; help = false;
    if (!scene || scene.op !== s.op) scene = newScene(s);
    void panel.offsetWidth; render(s, 0); return true;
  };
  function hide(quiet) {
    open = false; if (panel) panel.classList.add('hidden'); { const r = G.IncUI && G.IncUI.root && G.IncUI.root(); if (r) r.classList.remove('jd-on'); }
    if (G.Modes && G.Modes.panelIs && G.Modes.panelIs('dados')) G.Modes.setPanel(null); void quiet;
  }
  UI.close = () => { if (open) hide(); };

  // the geometry of the table in the canvas's pixels (W × H): the table's rect, the seats, the cups, the body's tray, the sizes
  function geoOf(W, H, n) {
    const mx = W * 0.05, my = H * 0.07; const tw = W - mx * 2, th = H - my * 2; const m = Math.min(tw, th); const k = m / 400;
    const lay = LAY[Math.max(1, Math.min(4, n))]; const cx = mx + tw / 2, cy = my + th / 2;
    const seats = lay.map(([u, v]) => { const x = mx + u * tw, y = my + v * th; const dx = cx - x, dy = cy - y, dl = Math.hypot(dx, dy) || 1; return { x, y, ux: dx / dl, uy: dy / dl }; });
    const cupR = m * 0.07, die = m * 0.06, myDie = m * 0.085;
    // (the cups: each one's by its seat, a little in; the body's tipped on its side to the left of its tray — its dice tumbled out before it)
    const cups = seats.map((s2, i) => (i === 0 ? [cx - tw * 0.3, s2.y - m * 0.06] : [s2.x + s2.ux * m * 0.17, s2.y + s2.uy * m * 0.17]));
    // (each one's dice lie where the cup stood: it comes up and back toward its player, and there they are)
    const rows = seats.map((s2, i) => [s2.x + s2.ux * m * (i === 0 ? 0.2 : 0.18), s2.y + s2.uy * m * (i === 0 ? 0.2 : 0.18)]);
    const myCup = cups[0]; const tray = [cx - tw * 0.16, cy + th * 0.19, cx + tw * 0.3, seats[0].y - m * 0.09];
    return { W, H, mx, my, tw, th, m, k, cx, cy, seats, cups, rows, cupR, die, myDie, myCup, tray };
  }
  // (the canvas sized to its box, at the screen's own sharpness)
  function fit() { const r = cv.parentElement.getBoundingClientRect(); const dpr = Math.min(2, window.devicePixelRatio || 1); const w = Math.max(200, Math.round(r.width)), h = Math.max(200, Math.round(r.height));
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); } return { w, h, dpr }; }

  // ------------------------------ the frame: the world read, the scene moved, the table drawn ------------------------------
  function render(s, dt) {
    const v = P().body(); if (!panel || !v) return; s = s || JD().corpo(v); if (!s) { hide(true); return; }
    if (!scene || scene.op !== s.op) scene = newScene(s);
    const sc = scene; const now = s.now; const F = (s.fase === 'revela' || s.fase === 'fim') ? 1 : 0; void F;
    const L = seated(s); const me = L.find(p => p.eu) || null;
    const { w, h, dpr } = fit(); const geo = geoOf(w, h, L.length); const set = s.set || { mat: 'osso' }; const mat = set.mat;
    // (the table resized — the hands' strip taller in another phase, the window turned —: the body's dice go with the board, not the pixels)
    const gk = `${geo.mx}:${geo.my}:${geo.tw}:${geo.th}`;
    if (sc.geo && sc.geo.k !== gk) for (const d of sc.dice) { d.x = geo.mx + (d.x - sc.geo.mx) * geo.tw / sc.geo.tw; d.y = geo.my + (d.y - sc.geo.my) * geo.th / sc.geo.th; }
    sc.geo = { k: gk, mx: geo.mx, my: geo.my, tw: geo.tw, th: geo.th };
    // (a new round: the scene's round moments again; the body's dice thrown as the cups are slammed)
    const key = `${s.op}:${s.rodada}:${s.fase}`;
    if (key !== lastKey) { const was = lastKey; lastKey = key; onPhase(s, sc, geo, me, mat, was); }
    // (the cup shaken a moment, then tipped toward the body: its dice out on the table, rolling to the faces the world threw — or, the
    // screen opened after the throw, where they lie)
    if (me && me.faces && !sc.rolled) { if (s.fase === 'sacode' && performance.now() - sc.shake > 480) throwDice(sc, me.faces, geo, mat); else if (s.fase !== 'sacode' && s.fase !== 'convite') placeDice(sc, me.faces, geo, mat); }
    if (sc.dice.length) stepDice(sc, dt, geo);
    // (the bids said since the last frame: a balloon born, a tick of the board)
    for (const p of L) if (p.palpite !== null && !sc.bids[p.id]) { sc.bids[p.id] = { t: performance.now() }; }
    draw(s, sc, geo, L, me, mat, dpr, now);
    seats(s, sc, geo, L, w, h);
    mid(s, sc, geo, L);
    controls(s, me);
  }
  // the moments of a phase as it begins (once): the sounds of the screen and the scene's own starts
  function onPhase(s, sc, geo, me, mat, was) {
    if (s.fase === 'sacode') { sc.r = s.rodada; sc.dice = []; sc.bids = {}; sc.rolled = false; sc.settled = false; sc.revT = 0; sc.lastLift = -1; sc.counted = 0; sc.shake = performance.now(); snd('dados-copo', { mat: s.copo === 'couro' ? 'couro' : mat, n: s.jogadores.reduce((a, p) => a + p.n, 0) });
      if (s.rodada === 1 && s.moeda && s.aposta) snd('aposta', { n: s.jogadores.length }); }
    if (s.fase === 'revela') { sc.revT = performance.now(); sc.lastLift = -1; sc.counted = 0; }
    if (s.fase === 'fim' && !sc.ended) { sc.ended = true; const won = s.venc && s.venc === s.eu; snd(won ? 'vitoria' : s.eu && s.venc > 0 ? 'derrota' : 'aposta', { n: 3 }); sc.coinsFly = { t: performance.now(), to: s.venc }; }
    void was; void geo; void me;
  }
  function draw(s, sc, geo, L, me, mat, dpr, now) {
    const c = ctx; c.setTransform(dpr, 0, 0, dpr, 0, 0); const { W, H } = geo; c.clearRect(0, 0, W, H);
    // (the room round the table: the dark of the tavern, the lamp's pool)
    const bg = c.createRadialGradient(W / 2, H * 0.45, 10, W / 2, H / 2, Math.max(W, H) * 0.7); bg.addColorStop(0, '#3b2a1c'); bg.addColorStop(1, '#120c08'); c.fillStyle = bg; c.fillRect(0, 0, W, H);
    // (the table: its shadow, its rim, its top)
    c.save(); c.fillStyle = 'rgba(0,0,0,.55)'; c.filter = 'blur(10px)'; rr(c, geo.mx + 6, geo.my + 12, geo.tw, geo.th, geo.m * 0.08); c.fill(); c.restore();
    const rim = { romano: '#b9b0a2', grego: '#4a2e1a', egipcio: '#6b5228', nordico: '#2a190d', asteca: '#6e4a24', classico: '#5a3e24' }[s.tema] || '#5a3e24';
    c.fillStyle = rim; rr(c, geo.mx - 5, geo.my - 5, geo.tw + 10, geo.th + 10, geo.m * 0.09); c.fill();
    const tx = tableTex(s.tema || 'classico', Math.round(geo.tw * dpr), Math.round(geo.th * dpr)); c.drawImage(tx, geo.mx, geo.my, geo.tw, geo.th);
    // (the pot in the middle: the people's coins)
    const potN = s.moeda ? Math.round((s.pote || 0) / 0.1) : 0; let flyK = 0;
    if (sc.coinsFly) flyK = clamp((performance.now() - sc.coinsFly.t) / 900, 0, 1);
    if (potN > 0 && !(sc.coinsFly && flyK >= 1)) coins(c, geo.cx, geo.cy - geo.m * 0.02, geo.m * 0.075, potN, COIN[s.tema] || 'bronze');
    if (sc.coinsFly && sc.coinsFly.to > 0) { const i = L.findIndex(p => p.id === sc.coinsFly.to); const st = i >= 0 ? geo.seats[i] : null; const n = Math.max(3, Math.round((s.ganho || s.pote || 0.3) / 0.1));
      if (st) for (let k = 0; k < Math.min(14, n); k++) { const t = clamp(flyK * 1.4 - k * 0.04, 0, 1); if (t <= 0 || t >= 1) continue; const e = ease(t); const x = geo.cx + (st.x - geo.cx) * e + Math.sin(k * 2.3) * geo.m * 0.05 * Math.sin(e * Math.PI), y = geo.cy + (st.y - geo.cy) * e - Math.sin(e * Math.PI) * geo.m * 0.15; coin(c, x, y, geo.m * 0.07, COIN[s.tema] || 'bronze', k % 5); } }
    // (the cups and the dice of each one)
    const T = performance.now(); const shaking = s.fase === 'sacode' && T - sc.shake < 1100;
    const order = s.ordem && s.ordem.length ? s.ordem : L.map(p => p.id);
    const revK = s.fase === 'revela' ? (T - sc.revT) / 1000 : s.fase === 'fim' ? 99 : -1;
    L.forEach((p, i) => {
      const cp = geo.cups[i]; const row = geo.rows[i]; const out = !!p.fora && !(p.faces && p.faces.length);
      const jig = shaking && !p.fora ? [Math.sin(T / 38 + i * 2) * geo.cupR * 0.12, Math.cos(T / 31 + i) * geo.cupR * 0.08] : null;
      // (the cups come up one by one in the order of the bids; the body's own is tipped aside from the first, its dice before it)
      const li = order.indexOf(p.id); const liftAt = 0.25 + Math.max(0, li) * 0.45; let k = 0;
      if (p.eu && s.fase !== 'convite') k = 1; else if (revK >= 0) k = clamp((revK - liftAt) / 0.35, 0, 1);
      if (out && !p.eu) { cup(c, cp[0], cp[1], geo.cupR * 0.85, s.copo, 1, null); return; }
      if (revK >= liftAt && li > sc.lastLift && !p.eu && p.faces) { sc.lastLift = li; snd('dados-parar', { mat, n: p.faces.length, vol: 0.6 }); }
      // (the dice: the body's rolling or resting in its tray; the others' in a row before their cups, shown as their cups come up)
      if (p.eu) { cup(c, cp[0], cp[1], geo.cupR * 0.86, s.copo, k ? 0.85 : 0, jig); if (p.faces && sc.dice.length) for (const d of sc.dice) die(c, d.x, d.y, geo.myDie, d.a, d.rest ? d.f : d.show, mat, d.z); }
      else { if (p.faces && k > 0.2) { const n = p.faces.length; p.faces.forEach((f, j) => { const ox = (j - (n - 1) / 2) * geo.die * 1.25; const px = row[0] + ox * Math.abs(geo.seats[i].uy), py = row[1] + ox * Math.abs(geo.seats[i].ux); const pop = 1 - ease((k - 0.2) / 0.5); die(c, px, py, geo.die, (j * 0.7 + i) % 1.2 - 0.6, f, mat, pop * 14, clamp((k - 0.2) * 3, 0, 1)); }); }
        cup(c, cp[0] - (k > 0 ? geo.seats[i].ux * geo.cupR * 1.9 * ease(k) : 0), cp[1] - (k > 0 ? geo.seats[i].uy * geo.cupR * 1.9 * ease(k) : 0), geo.cupR, s.copo, k, jig); }
    });
    // (the burnt die of the round slides off: a mark at the seat)
    if (s.res && revK > 0.6 + order.length * 0.45) for (const id of s.res.queimou) { const i = L.findIndex(p => p.id === id); if (i < 0) continue; const st = geo.seats[i]; const t = clamp((revK - 0.6 - order.length * 0.45) / 0.8, 0, 1);
      die(c, st.x - st.ux * geo.m * 0.02 * t, st.y - st.uy * geo.m * 0.02 * t + t * 10, geo.die * 0.9, t * 3, 0, mat, 0, 1 - t); }
    // (the vignette and the lamp)
    const vg = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.45)'); c.fillStyle = vg; c.fillRect(0, 0, W, H);
    if (s.fase === 'segura') { const p = 0.5 + 0.5 * Math.sin(T / 160); c.fillStyle = `rgba(0,0,0,${0.12 + 0.1 * p})`; c.fillRect(0, 0, W, H); }
    void now; void me;
  }
  // (the body's dice already resting — a screen opened in the middle of a round: where they lie, without a throw)
  function placeDice(sc, F, geo, mat) { const T = geo.tray; sc.dice = F.map((f, i) => ({ x: (T[0] + T[2]) / 2 + (i - (F.length - 1) / 2) * geo.myDie * 1.5, y: (T[1] + T[3]) / 2 + (i % 2 ? -1 : 1) * geo.myDie * 0.25, z: 0, vx: 0, vy: 0, vz: 0, a: (i % 3 - 1) * 0.2, w: 0, f, show: f, rest: true, mat })); sc.rolled = true; sc.settled = true; }

  // the faces, names, dice and balloons of each seat (the DOM over the canvas)
  function seats(s, sc, geo, L, w, h) {
    const box = panel.querySelector('.jd-seats'); const want = L.map(p => p.id).join(',');
    if (box.dataset.k !== want) { box.dataset.k = want; box.innerHTML = ''; seatEls = new Map();
      for (const p of L) { const el = document.createElement('div'); el.className = 'jd-seat'; el.innerHTML = `<span class="jd-face"><canvas width="96" height="96"></canvas></span><span class="jd-nm"></span><span class="jd-pips"></span><span class="jd-bal"></span>`; box.appendChild(el); seatEls.set(p.id, el); faceOf(el.querySelector('canvas'), G.S.villagers.get(p.id)); } }
    L.forEach((p, i) => {
      const el = seatEls.get(p.id); if (!el) return; const st = geo.seats[i]; const side = i === 0 ? 'b' : Math.abs(st.ux) > 0.7 ? (st.ux > 0 ? 'l' : 'r') : 't';
      el.style.left = `${(st.x / w) * 100}%`; el.style.top = `${(st.y / h) * 100}%`; el.dataset.side = side;
      el.classList.toggle('vez', s.vez === p.id); el.classList.toggle('fora', !!p.fora); el.classList.toggle('eu', p.eu);
      el.classList.toggle('cravou', !!(s.res && s.res.cravou === p.id)); el.classList.toggle('queimou', !!(s.res && s.res.queimou.includes(p.id)));
      el.classList.toggle('venc', !!(s.venc && s.venc === p.id && s.fase === 'fim'));
      const nm = el.querySelector('.jd-nm'); const t = p.eu ? 'Você' : p.nome; if (nm.textContent !== t) nm.textContent = cap(t);
      const pips = el.querySelector('.jd-pips'); const ph = p.fora ? (p.fora === 'pego' ? 'pego!' : p.fora === 'queimou' ? 'fora' : p.fora === 'saiu' || p.fora === 'demorou' ? 'saiu' : 'dormiu') : '●'.repeat(p.n);
      if (pips.textContent !== ph) pips.textContent = ph;
      const bal = el.querySelector('.jd-bal'); const said = p.palpite !== null && s.fase !== 'convite';
      const bt = said ? String(p.palpite) : s.fase === 'convite' && p.convite ? (p.convite === 'sim' ? '✓' : '✗') : s.vez === p.id && !p.eu ? '…' : '';
      if (bal.dataset.t !== bt) { bal.dataset.t = bt; bal.innerHTML = said ? `<b>${p.palpite}</b><small>${esc(G.JogoDados.extenso(p.palpite))}</small>` : bt ? `<b>${esc(bt)}</b>` : ''; bal.classList.remove('pop'); void bal.offsetWidth; if (bt) bal.classList.add('pop'); }
      bal.classList.toggle('on', !!bt); bal.classList.toggle('perto', !!(s.res && said && s.res.dist && s.res.dist[p.id] === Math.min(...Object.values(s.res.dist))));
    });
  }
  // (a face: the 3D's portrait where it can be made, else the god's drawing — as the menu's, D-645)
  function faceOf(canvas, o) {
    const x = canvas.getContext('2d'); x.setTransform(1.5, 0, 0, 1.5, 0, 0); x.clearRect(0, 0, 64, 64);
    const g = x.createRadialGradient(32, 26, 4, 32, 32, 36); g.addColorStop(0, '#f6e4bd'); g.addColorStop(1, '#a8834f'); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    if (!o) return; if (G.Retrato3D && G.Retrato3D.into(canvas, o)) return;
    if (G.Art && G.Art.villager && o.age >= 2) { x.save(); x.translate(32, 54); x.scale(3.6, 3.6); G.Art.villager(x, Object.assign({}, o, { act: '', moving: false, face: 1, sleeping: false, inside: 0, hurt: 0, torch: false, emo: null }), 0, 0, 0, false); x.restore(); }
  }
  // (what the cups up say, in words: the cheat caught or the body's unseen, who hit the sum, who lost a die)
  function resWords(s, L) {
    const nm = id => { const p = L.find(q => q.id === id); return p ? (p.eu ? 'Você' : cap(p.nome)) : 'alguém'; }; const r = s.res; const o = [];
    if (r.trap && r.trap.pego) o.push(`<b class="trap">${esc(nm(r.trap.id))} ${r.trap.id === s.eu ? 'foi pego' : 'foi pego'} virando um dado${r.trap.euVi ? ' — você viu' : ''}!</b>`);
    else if (r.trap && r.trap.id === s.eu) o.push('<b class="mao">A mão rápida: ninguém viu.</b>');
    if (r.cravou) o.push(`<b class="crava">${esc(nm(r.cravou))} cravou a soma!</b> ${r.cravou === s.eu ? 'Cada um dos outros perde um dado.' : r.queimou.includes(s.eu) ? 'Você e os outros perdem um dado.' : 'Os outros perdem um dado.'}`);
    else if (r.queimou.length) o.push(`${r.queimou.map(id => esc(nm(id))).join(' e ')} ${r.queimou.length > 1 || r.queimou[0] === s.eu ? (r.queimou.length > 1 ? 'ficaram mais longe e perdem' : 'ficou mais longe e perde') : 'ficou mais longe e perde'} um dado.`);
    else o.push('Empate: ninguém perde dado.');
    return o.join(' ');
  }
  // the middle of the table: the sum counted as the cups come up, who hit it, the cheat; the end's word
  function mid(s, sc, geo, L) {
    const el = panel.querySelector('.jd-mid'); const ban = panel.querySelector('.jd-banner'); let bh = ''; const parts = [];
    const order = s.ordem && s.ordem.length ? s.ordem : L.map(p => p.id);
    if (s.fase === 'revela' || s.fase === 'fim') {
      const T = (performance.now() - sc.revT) / 1000; let sum = 0; let all = true;
      for (let k = 0; k < order.length; k++) { const p = L.find(q => q.id === order[k]); if (!p || !p.faces) continue; if (p.eu || T >= 0.25 + k * 0.45 + 0.2 || s.fase === 'fim') sum += p.faces.reduce((a, b) => a + b, 0); else all = false; }
      const done = all && s.res; if (s.fase === 'revela' && sum !== sc.counted) sc.counted = sum;
      parts.push({ k: 'soma', cls: 'jd-soma' + (done ? ' fim' : ''), num: s.res && done ? s.res.total : sum });
      // (the word of the round goes under the table, with the hands: the middle keeps the sum, the seats round it stay in sight)
      const said = done && s.res ? resWords(s, L) : ''; if (said !== sc.said) { sc.said = said; sig = ''; }
      if (done && s.res && s.res.cravou) parts.push({ k: 'crava', cls: 'jd-res crava', txt: 'Cravou!' });
      else if (done && s.res && s.res.trap && s.res.trap.pego) parts.push({ k: 'trap', cls: 'jd-res trap', txt: 'Trapaça!' });
    } else if (s.fase === 'segura') parts.push({ k: 'segura', cls: 'jd-res suspense', txt: 'Os copos vão subir…' });
    else if (s.fase === 'convite') parts.push({ k: 'convite', cls: 'jd-res', txt: s.moeda ? `Aposta: ${s.price(s.aposta)}` : 'Pela glória' });
    // (each piece of the middle is born once — its pop then, never again: the sum counted in place, the pill turned gold in place at the
    // end of the count, the word of the round beside it; before, the whole middle was written again as the count ended, and the pill
    // faded out and popped back at the very moment of the sum — caught there by a photo, half seen through, the pot's coins under it)
    for (const ch of [...el.children]) if (!parts.some(p => p.k === ch.dataset.k)) ch.remove();
    parts.forEach((p, i) => {
      let ch = el.querySelector(`:scope > [data-k="${p.k}"]`);
      if (!ch) { ch = document.createElement('div'); ch.dataset.k = p.k; ch.className = p.cls + ' pop'; ch.innerHTML = p.k === 'soma' ? '<small>soma</small><b></b>' : ''; }
      else if (ch.className.replace(' pop', '') !== p.cls) ch.className = p.cls + (ch.classList.contains('pop') ? ' pop' : '');
      if (p.k === 'soma') { const b = ch.querySelector('b'); if (b.textContent !== String(p.num)) b.textContent = p.num; } else if (ch.textContent !== p.txt) ch.textContent = p.txt;
      if (el.children[i] !== ch) el.insertBefore(ch, el.children[i] || null);
    });
    if (s.fase === 'fim') {
      const won = s.venc && s.venc === s.eu; const lost = s.eu && s.venc !== s.eu; const v = L.find(p => p.id === s.venc);
      bh = won ? `<div class="jd-ban win"><b>Você levou o pote!</b>${s.ganho ? `<small>+ ${esc(s.price(s.ganho))}</small>` : ''}</div>` : v ? `<div class="jd-ban ${lost ? 'lose' : ''}"><b>${esc(cap(v.nome))} levou o pote</b>${lost && s.moeda && s.aposta ? `<small>− ${esc(s.price(s.aposta))}</small>` : ''}</div>` : '<div class="jd-ban"><b>O jogo acabou</b><small>o pote voltou a quem apostou</small></div>';
    }
    if (ban.dataset.h !== bh) { ban.dataset.h = bh; ban.innerHTML = bh; ban.classList.toggle('on', !!bh); }
  }

  // ------------------------------ the controls (what the hands can do now) ------------------------------
  // (the coins one has, as one knows them: one's own purse, or the house's — G.Possess.knows.house)
  function purse(v, s) {
    if (!s.moeda) return { txt: 'O povo não usa moeda: joga-se pela glória.', n: Infinity };
    const ref = G.Eco.coinRef(v); const home = ref[0] === 'h' ? G.S.buildings.get(+ref.slice(2)) : null;
    const n = !home || G.Possess.knows.house(v, home) ? G.Depot.get(ref, 'moedas') : null; if (n === null) return { txt: '', n: Infinity };
    return { txt: `${home ? 'Na bolsa da casa' : 'Na bolsa'}: <b>${esc(s.price(n))}</b>`, n };
  }
  // (the free numbers nearest the sum one expects: the quick picks)
  function quick(s) { const e = s.espero === null ? (s.faixa[0] + s.faixa[1]) / 2 : s.espero; return s.livres.slice().sort((a, b) => Math.abs(a - e) - Math.abs(b - e) || a - b).slice(0, 5).sort((a, b) => a - b); }
  function controls(s, me) {
    const v = P().body(); const pu = purse(v, s); const touch = !!G.Input3D.touch; const myTurn = s.fase === 'palpite' && s.vez === s.eu && !!s.eu;
    if (myTurn && pickFor !== s.op + ':' + s.rodada) { pickFor = s.op + ':' + s.rodada; const q = quick(s); pick = q.length ? q[Math.floor(q.length / 2)] : s.faixa[0]; }
    if (myTurn && !s.livres.includes(pick)) pick = quick(s)[0] || pick;
    const st = JSON.stringify([s.fase, s.vez, s.eu, s.jogo, myTurn ? pick : 0, s.livres.length, s.armado, s.trapacaOk, busy, note, touch, s.aposta, s.convite.map(x => x.id + (x.sim ? 1 : 0) + x.por), pu.n, s.venc, help, s.jogadores.map(p => p.fora).join(), (s.hist || []).length]);
    if (st === sig) return; sig = st;
    const el = panel.querySelector('.jd-ctl'); const top = panel.querySelector('.jd-top'); const lk = LOOK[s.tema] || LOOK.classico;
    // (where the dice on the table come from — «dados da casa, emprestados», «os seus dados», «os dados de Orm» — and the rent paid: D-932)
    const fonte = s.set ? ` · ${s.set.de} (${s.set.mat === 'osso' ? 'de osso' : 'de madeira'})${s.set.alug ? `, aluguel ${s.price(s.set.alug)}` : s.set.vem ? `, aluguel ${s.price(s.set.vem)} ao começar` : ''}` : '';
    top.querySelector('h3').textContent = lk.titulo; top.querySelector('.jd-tit small').textContent = s.torneio ? `torneio da noite · prêmio ${s.price(s.torneio.premio)}${fonte}` : `${lk.sub}${fonte}`;
    top.querySelector('.jd-pote b').textContent = s.moeda ? String(Math.round((s.pote || 0) * 10) / 10).replace('.', ',') : '—'; top.querySelector('.jd-pote small').textContent = s.moeda ? `no pote` : 'sem moeda';
    const k = (n, t) => (touch ? '' : `<kbd>${t}</kbd>`);
    let h = '';
    if (s.fase === 'convite' && s.euHost) {
      const chips = s.apostas.map((a, i) => `<button class="jd-chip${a === s.aposta ? ' sel' : ''}" data-a="aposta" data-n="${a}"${pu.n + 1e-6 >= a ? '' : ' disabled'}>${k(0, i + 1)}${esc(s.price(a))}</button>`).join('');
      const yes = s.convite.filter(x => x.sim).length;
      h = `<div class="jd-sec">${s.moeda ? 'A aposta de cada um' : 'Pela glória: o povo não usa moeda'}</div>${s.moeda ? `<div class="jd-chips">${chips}</div>` : ''}
        <div class="jd-who">${s.convite.length ? s.convite.map(x => `<span class="${x.sim ? 'sim' : 'nao'}">${x.sim ? '✓' : '✗'} ${esc(cap(x.nome))}${x.sim ? '' : ` <em>${esc(x.por)}</em>`}</span>`).join('') : '<span class="nao">Ninguém à mesa quer jogar.</span>'}</div>
        <div class="jd-btns"><button class="jd-no" data-a="sair">Agora não</button><button class="jd-go" data-a="comecar"${yes && !busy ? '' : ' disabled'}>${k(0, G.Input3D.label('interagir'))}Começar${yes ? ` (${yes + 1} à mesa)` : ''}</button></div>`;
    } else if (s.fase === 'convite' && !s.eu) {
      h = `<div class="jd-wait">Chamam a mesa para o copo${s.moeda ? ` — aposta de ${esc(s.price(s.aposta))}` : ''}.</div><div class="jd-btns"><button class="jd-no" data-a="close">Agora não</button><button class="jd-go" data-a="entrar"${pu.n + 1e-6 >= s.aposta && !busy ? '' : ' disabled'}>${k(0, G.Input3D.label('interagir'))}Entrar</button></div>`;
    } else if (s.fase === 'convite') {
      h = `<div class="jd-wait">Esperando quem chamou começar…</div><div class="jd-btns"><button class="jd-no" data-a="sair">Sair do jogo</button></div>`;
    } else if (myTurn) {
      const q = quick(s); const said = s.jogadores.filter(p => p.palpite !== null).map(p => p.palpite);
      h = `<div class="jd-sec">A sua vez: quanto dão <b>todos</b> os dados da mesa?</div>
        <div class="jd-dial"><button data-a="menos" aria-label="Menos">−</button><output>${pick}</output><button data-a="mais" aria-label="Mais">+</button></div>
        <div class="jd-chips">${q.map((n, i) => `<button class="jd-chip${n === pick ? ' sel' : ''}" data-a="pick" data-n="${n}">${k(0, i + 1)}${n}</button>`).join('')}</div>
        ${regua(s, pick)}
        <button class="jd-go big" data-a="dizer"${busy ? ' disabled' : ''}>${k(0, G.Input3D.label('interagir'))}Dizer «${esc(G.JogoDados.extenso(pick))}»</button>
        <div class="jd-hint">${s.espero !== null ? `Os seus dados somam <b>${me && me.faces ? me.faces.reduce((a, b) => a + b, 0) : '?'}</b>; com os dos outros, uns <b>${Math.round(s.espero)}</b>. ` : ''}${said.length ? `Já disseram ${said.join(', ')}.` : ''}</div>`;
    } else if ((s.fase === 'palpite' || s.fase === 'segura') && s.jogo) {
      const w = s.jogadores.find(p => p.id === s.vez);
      h = `<div class="jd-wait">${s.fase === 'segura' ? 'Os copos vão subir…' : w ? `${esc(cap(w.nome))} pensa no palpite<i class="dots"><b>.</b><b>.</b><b>.</b></i>` : '…'}</div>${regua(s, null)}
        ${s.trapacaOk ? `<button class="jd-trap${s.armado ? ' on' : ''}" data-a="trapaca" title="Na hora de levantar o copo, virar um dado a seu favor — se alguém vir, é confusão">${k(0, G.Input3D.label('outra'))}${s.armado ? 'A mão rápida está pronta' : 'Mão rápida: virar um dado'}<small>${s.olhos} ${s.olhos === 1 ? 'par de olhos' : 'pares de olhos'} na mesa · risco ${Math.round(s.risco * 100)}%</small></button>` : ''}`;
    } else if (s.fase === 'sacode') {
      h = `<div class="jd-wait">${s.jogo ? 'Sacudam os copos!' : 'Os copos na mesa…'}</div>${regua(s, null)}`;
    } else if (s.fase === 'revela') {
      const sk = scene && scene.said ? `${s.op}:${s.rodada}:${scene.said}` : ''; const fresh = !!sk && sk !== saidShown; if (sk) saidShown = sk; // (the round's words pop in once — written again with the hands, they stay)
      h = `${scene && scene.said ? `<div class="jd-said${fresh ? ' pop' : ''}">${scene.said}</div>` : '<div class="jd-wait">Levantam-se os copos…</div>'}${regua(s, null)}`;
    } else if (s.fase === 'fim') {
      const x = vb(); h = `${regua(s, null)}<div class="jd-btns"><button class="jd-no" data-a="close">Sair</button>${x && x.k === 'chamar' && x.ok ? `<button class="jd-go" data-a="denovo">${k(0, G.Input3D.label('interagir'))}Jogar de novo</button>` : ''}</div>`;
    } else if (!s.jogo && s.eu) h = `<div class="jd-wait">Você está fora desta. Olhe o fim.</div>${regua(s, null)}`;
    if (!s.eu && s.fase !== 'convite' && s.fase !== 'fim') h = `<div class="jd-wait">Você olha o jogo da sua mesa.</div>${regua(s, null)}`;
    if (s.jogo && s.fase !== 'fim' && s.fase !== 'convite') h += `<div class="jd-btns sm"><button class="jd-no" data-a="sair">Largar o jogo${s.moeda && s.aposta ? ' (a aposta fica)' : ''}</button></div>`;
    // (the rounds gone by, the last first — on the wide screen, under the hands)
    if (s.hist && s.hist.length) h += `<div class="jd-log">${s.hist.slice().reverse().map(x => `<div><b>Rodada ${x.r}</b> · soma ${x.total}${x.cravou ? ` · ${esc(cap(x.cravou))} cravou` : x.queimou.length ? ` · ${x.queimou.map(q => esc(cap(q))).join(' e ')} perde${x.queimou.length > 1 ? 'm' : ''} um dado` : ' · empate'}</div>`).join('')}</div>`;
    h += `${note ? `<div class="jd-note">${esc(note)}</div>` : ''}<div class="jd-purse">${pu.txt}</div>`;
    if (!touch) h += `<div class="jd-hint keys">${myTurn ? '<kbd>←</kbd><kbd>→</kbd> muda · <kbd>1</kbd>–<kbd>5</kbd> escolhe · ' : ''}<kbd>Enter</kbd> confirma · <kbd>Esc</kbd> fecha · <kbd>?</kbd> regras</div>`;
    el.innerHTML = h;
    const rg = panel.querySelector('.jd-regras'); rg.classList.toggle('hidden', !help);
    if (help && !rg.innerHTML) rg.innerHTML = `<h4>Como se joga o copo</h4><ol><li>Cada um põe a aposta no pote e esconde <b>dois dados</b> debaixo do copo (três, quando são só dois à mesa). Você vê só os seus.</li>
      <li>Na sua vez, diga quanto dá a <b>soma de todos os dados da mesa</b> — os seus e os dos outros. Não vale repetir um número que alguém já disse.</li>
      <li>Levantam-se os copos. Quem <b>cravou</b> a soma em cheio faz <b>cada um dos outros</b> perder um dado. Se ninguém cravou, quem ficou <b>mais longe</b> perde um.</li>
      <li>Quem fica sem dados está fora. O último que ainda tem dados leva o pote.</li></ol>
      <p>Dica: o palpite dos outros diz alguma coisa dos dados deles — ou é blefe. E há quem vire um dado na hora de levantar o copo… se ninguém estiver olhando.</p><button class="jd-go" data-a="ajuda">Entendi</button>`;
  }
  // (the line of the numbers — the least and the most the dice on the table can make —: the bids said, the one chosen, the sum expected,
  // and, the cups up, the sum)
  function regua(s, mine) {
    const [a, b] = s.faixa; if (!(b > a)) return ''; const W = 300, x = n => 10 + (n - a) / (b - a) * (W - 20);
    const marks = s.jogadores.filter(p => p.palpite !== null).map(p => `<g class="${p.eu ? 'eu' : ''}${s.res && s.res.cravou === p.id ? ' crava' : ''}"><circle cx="${x(p.palpite).toFixed(1)}" cy="14" r="5.5"/><text x="${x(p.palpite).toFixed(1)}" y="32">${p.palpite}</text></g>`).join('');
    const e = s.espero !== null && s.jogo ? `<rect class="prov" x="${x(Math.max(a, s.espero - 3)).toFixed(1)}" y="9" width="${(x(Math.min(b, s.espero + 3)) - x(Math.max(a, s.espero - 3))).toFixed(1)}" height="10" rx="5"/>` : '';
    const tot = s.res && (s.fase === 'fim' || s.fase === 'revela') ? `<g class="tot"><path d="M${x(s.res.total).toFixed(1)} 2 v24"/><text x="${x(s.res.total).toFixed(1)}" y="44">soma ${s.res.total}</text></g>` : '';
    const pk = mine !== null ? `<g class="pick"><circle cx="${x(mine).toFixed(1)}" cy="14" r="7"/></g>` : '';
    const near = n => !!(s.res && (s.fase === 'fim' || s.fase === 'revela') && Math.abs(x(s.res.total) - x(n)) < 34); // (the sum's word at an end of the line: the end's number makes way)
    return `<svg class="jd-regua" viewBox="0 0 ${W} 48" preserveAspectRatio="none"><path class="line" d="M10 14 H${W - 10}"/>${e}${near(a) ? '' : `<text class="lim" x="10" y="44">${a}</text>`}${near(b) ? '' : `<text class="lim" x="${W - 10}" y="44">${b}</text>`}${marks}${pk}${tot}</svg>`;
  }

  // ------------------------------ the hands ------------------------------
  function ask(fn, ok) { busy = true; sig = ''; G.IncUI.when(G.Possess.apply(fn), r => { busy = false; note = ''; sig = ''; if (ok) ok(r); }, r => { busy = false; note = (r && r.why) || 'Agora não deu.'; sig = ''; deny(r); }); }
  function act(a, n) {
    const v = P().body(); const s = v && JD().corpo(v); if (!s) return;
    if (a === 'close') { hide(); return; }
    if (a === 'ajuda') { help = !help; sig = ''; return; }
    if (a === 'aposta') { UI.lastStake = n; ask(w => JD().aposta(w, s.op, n), () => snd('aposta', { n: 1, vol: 0.5 })); return; }
    if (a === 'comecar') { ask(w => JD().comecar(w, s.op), r => { toast(r.msg, 1.8); snd('aposta', { n: s.jogadores.length }); }); return; }
    if (a === 'entrar') { ask(w => JD().entrar(w, s.op), () => snd('aposta', { n: 1 })); return; }
    if (a === 'sair') { ask(w => JD().sair(w, s.op), r => { toast(r.msg, 2.2); if (s.fase === 'convite' && s.euHost) hide(); }); return; }
    if (a === 'menos' || a === 'mais') { stepPick(a === 'mais' ? 1 : -1, s); return; }
    if (a === 'pick') { if (pick === n) { act('dizer'); return; } pick = n; sig = ''; return; }
    if (a === 'dizer') { const k = pick; ask(w => JD().palpite(w, s.op, k)); return; }
    if (a === 'trapaca') { const on = !s.armado; ask(w => JD().trapacear(w, s.op, on), r => toast(r.on ? 'A mão está pronta: na hora dos copos, um dado vira — se ninguém vir.' : 'Você desiste da mão rápida.', 2.4)); return; }
    if (a === 'denovo') { const x = vb(); const st = x && x.apostas ? (x.apostas.includes(UI.lastStake) ? UI.lastStake : x.apostas[0]) : 0; ask(w => JD().chamar(w, st), r => { toast(r.msg, 2); scene = null; }); return; }
  }
  // (the bid up or down to the next number nobody said)
  function stepPick(d, s) { const L = s.livres; if (!L.length) return; let i = L.indexOf(pick); if (i < 0) i = L.findIndex(n => n > pick) - (d > 0 ? 1 : 0); i = clamp(i + d, 0, L.length - 1); pick = L[i]; sig = ''; snd('dados-parar', { mat: 'madeira', vol: 0.15 }); }
  function onClick(e) { const b = e.target.closest('[data-a]'); if (!b || b.disabled) return; act(b.dataset.a, b.dataset.n !== undefined ? +b.dataset.n : undefined); }
  // (the primary of the moment: say the bid, begin, join, again)
  function primary() { const v = P().body(); const s = v && JD().corpo(v); if (!s) return false;
    if (s.fase === 'palpite' && s.vez === s.eu) act('dizer'); else if (s.fase === 'convite' && s.euHost) act('comecar'); else if (s.fase === 'convite' && !s.eu) act('entrar'); else if (s.fase === 'fim') { const x = vb(); if (x && x.k === 'chamar' && x.ok) act('denovo'); else hide(); } else return false; return true; }
  // the keys and the controller: ← → (and ↑ ↓) the bid or the stake, the number keys the quick picks, the hands' key the primary, the
  // second verb's key the quick hand; Enter too (a key of the screen's own)
  { const ck0 = G.IncUI && G.IncUI.cardKey; if (G.IncUI) G.IncUI.cardKey = function (i) {
    if (open) { const v = P().body(); const s = v && JD().corpo(v);
      if (s && G.Input3D && G.Input3D.device === 'pad') { if (s.fase === 'palpite' && s.vez === s.eu) stepPick(i === 0 || i === 1 ? 1 : -1, s); return true; }
      if (s && s.fase === 'palpite' && s.vez === s.eu) { const q = quick(s); if (q[i] !== undefined) act('pick', q[i]); }
      else if (s && s.fase === 'convite' && s.euHost && s.apostas[i] !== undefined) act('aposta', s.apostas[i]);
      return true; }
    return ck0 ? ck0.apply(this, arguments) : false; }; }
  if (G.Input3D && G.Input3D.on) {
    G.Input3D.on('interagir', () => (open ? primary() || true : false));
    G.Input3D.on('outra', () => { if (!open) return false; const v = P().body(); const s = v && JD().corpo(v); if (s && s.trapacaOk) act('trapaca'); return true; });
    for (const [a, d] of [['esquerda', -1], ['direita', 1], ['frente', 1], ['tras', -1]]) G.Input3D.on(a, () => { if (!open) return false; const v = P().body(); const s = v && JD().corpo(v);
      if (s && s.fase === 'palpite' && s.vez === s.eu) stepPick(d, s); else if (s && s.fase === 'convite' && s.euHost && s.moeda) { const i = clamp(s.apostas.indexOf(s.aposta) + d, 0, s.apostas.length - 1); if (s.apostas[i] !== s.aposta) act('aposta', s.apostas[i]); } return true; });
  }
  window.addEventListener('keydown', e => { if (!open || e.repeat) return; if (e.key === 'Enter') { if (primary()) e.preventDefault(); } else if (e.key === '?') { help = !help; sig = ''; } });

  // ------------------------------ the frame ------------------------------
  // (every frame of the body's screen: the screen opened when the body's game asks for it — a game it calls or joins, its turn —, the
  // table drawn and moved; shut when the game is gone; the words of the moment once)
  UI.frame = function (rdt) {
    if (!G.Modes || !G.Modes.inc()) { if (open) hide(true); return; }
    const v = P().body(); if (!v || !JD()) return;
    if (open && !G.Modes.panelIs('dados')) { open = false; if (panel) panel.classList.add('hidden'); G.IncUI.root().classList.remove('jd-on'); }
    const s = JD().corpo(v);
    if (open) { if (!s) { hide(true); return; } render(s, Math.min(0.05, rdt || 0)); return; }
    upT -= rdt || 0; if (upT > 0) return; upT = 0.2;
    if (!s) return;
    // (the body in a game, and it is its turn, or the game it called: open — once a turn; a game called at its table: a word)
    const k = `${s.op}:${s.rodada}:${s.vez}`;
    if (s.jogo && ((s.fase === 'palpite' && s.vez === s.eu) || (s.fase === 'convite' && s.euHost) || s.fase === 'sacode') && said.open !== k) { said.open = k; UI.open(false); }
    if (!s.eu && s.fase === 'convite' && said.call !== s.op) { said.call = s.op; const x = vb(); if (x && x.k === 'entrar') { const how = G.AcoesUI && G.AcoesUI.how ? G.AcoesUI.how('jd-dados') : ''; toast(`Chamam a sua mesa para o jogo de copo${s.moeda ? ` (${s.price(s.aposta)})` : ''}. Para entrar: ${how || (G.Input3D.touch ? 'toque em «Ações»' : `«Ações» (${G.Input3D.label('acoes')})`)}.`, 3.4); } } // (the bar's own slot: the F is the table's first verb that can be done — the round —, and the phone has none: L-2183)
  };
  UI.render = (s, dt) => render(s, dt || 0); // (the photos' hand: a frame drawn from a view of their own, never the world's)
  UI.scene = () => scene;
  const frame0 = G.IncUI && G.IncUI.frame;
  if (frame0) G.IncUI.frame = function (rdt) { const r = frame0.apply(this, arguments); UI.frame(rdt); return r; };
})(window.G);
