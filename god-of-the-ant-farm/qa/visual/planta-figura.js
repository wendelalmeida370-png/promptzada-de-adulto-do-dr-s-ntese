// planta-figura: a planta de um prédio desenhada de cima num PNG, para os olhos de quem não lê código (as figuras do relatório
// do dono) — em Node, sem navegador e sem biblioteca: os cômodos pela função, as paredes, as portas e as janelas, os lances, e
// cada peça pelo que ela é: as camas claras, o FOGO laranja, ONDE SE COME verde (a mesa com os bancos, o banco de comer, a
// esteira de comer), os guardados cinza; um ponto em cada lugar de uso que o corpo ocupa (verde: comer; vermelho: cozinhar ou
// se aquecer; azul: deitar). Só lê a planta que o jogo faz (In.make): nada do mundo.
//   node qa/visual/planta-figura.js <saída.png> "<título>" tipo povo família id lado ['{"cl":"t","w":0,"d":1}'] [; outra planta…]
//       várias plantas lado a lado: os sete argumentos de cada uma separados por um «;» sozinho
//       JOGO=<pasta do jogo>  outra cópia do jogo (o «antes»: uma cópia do commit de antes)   ESCALA=70 (pixels por metro)
'use strict';
const path = require('path'), fs = require('fs'), zlib = require('zlib');
const game = process.env.JOGO ? path.resolve(process.env.JOGO) : path.resolve(__dirname, '..', '..');
const M = require(path.join(game, 'qa', 'nodemundo.js')); const G = M.load({}); const In = G.Interiors; const IT = In.ITEMS;
const PPM = +(process.env.ESCALA || 70);
const args = process.argv.slice(2); const out = args.shift(); const specs = []; let cur = [];
for (const a of args) { if (a === ';') { specs.push(cur); cur = []; } else cur.push(a); } if (cur.length) specs.push(cur);
if (!out || !specs.length || specs.some(s => s.length < 6)) { console.log('uso: node qa/visual/planta-figura.js <saída.png> "<título>" tipo povo família id lado [contexto] [; …]'); process.exit(2); }
// ------------------------------ a small canvas ------------------------------
function canvas(W, H, bg) {
  const d = Buffer.alloc(W * H * 3); for (let q = 0; q < W * H; q++) { d[q * 3] = bg[0]; d[q * 3 + 1] = bg[1]; d[q * 3 + 2] = bg[2]; }
  const C = { W, H, d };
  C.px = (x, y, c, a) => { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= W || y >= H) return; const q = (y * W + x) * 3; const k = a === undefined ? 1 : a; for (let j = 0; j < 3; j++) d[q + j] = Math.round(d[q + j] * (1 - k) + c[j] * k); };
  C.rect = (x0, y0, x1, y1, c, a) => { for (let y = Math.round(y0); y < Math.round(y1); y++) for (let x = Math.round(x0); x < Math.round(x1); x++) C.px(x, y, c, a); };
  C.frame = (x0, y0, x1, y1, c, t) => { t = t || 1; C.rect(x0, y0, x1, y0 + t, c); C.rect(x0, y1 - t, x1, y1, c); C.rect(x0, y0, x0 + t, y1, c); C.rect(x1 - t, y0, x1, y1, c); };
  C.disc = (cx, cy, r, c, a) => { for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) if ((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r) C.px(x, y, c, a); };
  C.line = (x0, y0, x1, y1, c, t) => { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0))); const h = (t || 1) / 2; for (let k = 0; k <= n; k++) { const x = x0 + (x1 - x0) * k / n, y = y0 + (y1 - y0) * k / n; C.rect(x - h, y - h, x + h, y + h, c); } };
  return C;
}
const FONT = { A: '01110100011000111111100011000110001', B: '11110100011000111110100011000111110', C: '01110100011000010000100001000101110', D: '11110100011000110001100011000111110', E: '11111100001000011110100001000011111', F: '11111100001000011110100001000010000', G: '01110100011000010111100011000101111', H: '10001100011000111111100011000110001', I: '01110001000010000100001000010001110', J: '00111000100001000010000101001001100', K: '10001100101010011000101001001010001', L: '10000100001000010000100001000011111', M: '10001110111010110101100011000110001', N: '10001110011010110011100011000110001', O: '01110100011000110001100011000101110', P: '11110100011000111110100001000010000', Q: '01110100011000110001101011001001101', R: '11110100011000111110101001001010001', S: '01111100001000001110000010000111110', T: '11111001000010000100001000010000100', U: '10001100011000110001100011000101110', V: '10001100011000110001100010101000100', W: '10001100011000110101101011101110001', X: '10001100010101000100010101000110001', Y: '10001100010101000100001000010000100', Z: '11111000010001000100010001000011111',
  0: '01110100011001110101110011000101110', 1: '00100011000010000100001000010001110', 2: '01110100010000100010001000100011111', 3: '11110000010000101110000010000111110', 4: '00010001100101010010111110001000010', 5: '11111100001111000001000011000101110', 6: '00110010001000011110100011000101110', 7: '11111000010001000100010000100001000', 8: '01110100011000101110100011000101110', 9: '01110100011000101111000010001001100',
  '-': '00000000000000011111000000000000000', ':': '00000001000010000000001000010000000', '.': '00000000000000000000000000110001100', ',': '00000000000000000000001100010001000', '(': '00010001000100001000010000010000010', ')': '01000001000001000010000100010001000', '/': '00001000010001000100010001000010000', '+': '00000001000010011111001000010000000', '=': '00000000001111100000111110000000000' };
const plain = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
function text(C, x, y, s, c, k) { k = k || 2; let cx = x; for (const ch of plain(s)) { const g = FONT[ch]; if (g) for (let r = 0; r < 7; r++) for (let q = 0; q < 5; q++) if (g[r * 5 + q] === '1') C.rect(cx + q * k, y + r * k, cx + (q + 1) * k, y + (r + 1) * k, c); cx += 6 * k; } return cx; }
const textW = (s, k) => plain(s).length * 6 * (k || 2);
// ------------------------------ one plan ------------------------------
const FN = { lar: [222, 204, 164], salao: [222, 204, 164], leitos: [176, 196, 212], quarto: [176, 196, 212], oficina: [222, 180, 124], despensa: [182, 174, 164], anexo: [208, 182, 142], patio: [182, 208, 156], terraco: [196, 214, 168], vestibulo: [232, 224, 204], terreiro: [200, 214, 170] };
const COL = { wall: [52, 42, 32], inner: [86, 72, 56], door: [246, 236, 214], win: [140, 196, 236], bed: [240, 232, 208], pillow: [176, 160, 128], fire: [238, 132, 40], ember: [200, 40, 24], eat: [72, 168, 84], eatD: [28, 104, 44], store: [150, 144, 136], wood: [128, 96, 62], stair: [150, 128, 98], ink: [40, 32, 24], sub: [110, 96, 80] };
const isEat = it => { const D = IT[it.kind] || {}; return !!(D.min && D.min.comer) || it.kind === 'mesa' || it.kind === 'mesa-baixa'; };
function planOf(spec) {
  const [title, type, c, f, idS, side, ctxS] = spec; const def = G.BDEF[type]; const ctx = Object.assign({ k: 'a', cl: 't', fl: 0, d: 1, w: 0, e: 3 }, ctxS ? JSON.parse(ctxS) : {});
  const n = ctx.n || def.w; const b = { id: +idS, type, x: 10, y: 10, w: n, h: n };
  const rec = { v: 4, f, r: 0, t: type, u: In.TYPES[type].use, s: side, o: 0, c, e: ctx.e, k: ctx.k, cl: ctx.cl, fl: ctx.fl, d: ctx.d, w: ctx.w, pw: 0, h: [], m: 0, fx: [], dr: {} }; if (ctx.n) rec.n = ctx.n;
  const p = In.make(b, rec); return { title, p, b };
}
const STOREY = { porao: 'porao', jirau: 'jirau', terraco: 'terraco', andar: 'andar de cima', piso: 'terreo', semienterrado: 'terreo', elevado: 'terreo' };
function draw(C, ox, oy, P, lv) {
  const p = P.p; const L = p.lot.w; const X = x => ox + x * PPM, Y = z => oy + z * PPM;
  C.rect(X(0), Y(0), X(L), Y(L), [226, 222, 212]);
  for (const m of p.rooms) { if (m.lv !== lv) continue; const col = FN[m.fn] || [214, 200, 172];
    if (m.circ) C.disc(X(m.circ[0]), Y(m.circ[1]), m.circ[2] * PPM, col); else C.rect(X(m.r[0]), Y(m.r[1]), X(m.r[2]), Y(m.r[3]), col, m.open ? 0.6 : 1); }
  for (const s of p.stairs) { if (s.kind === 'degraus' ? s.lv1 !== lv : s.lv0 !== lv) { if (s.lv1 === lv && s.hole) C.frame(X(s.hole[0]), Y(s.hole[1]), X(s.hole[2]), Y(s.hole[3]), COL.sub, 2); continue; }
    C.rect(X(s.r[0]), Y(s.r[1]), X(s.r[2]), Y(s.r[3]), COL.stair); const k = Math.max(3, Math.round((s.dir[0] ? s.r[2] - s.r[0] : s.r[3] - s.r[1]) / 0.25));
    for (let q = 1; q < k; q++) { if (s.dir[0]) { const x = s.r[0] + (s.r[2] - s.r[0]) * q / k; C.line(X(x), Y(s.r[1]), X(x), Y(s.r[3]), COL.inner, 1); } else { const z = s.r[1] + (s.r[3] - s.r[1]) * q / k; C.line(X(s.r[0]), Y(z), X(s.r[2]), Y(z), COL.inner, 1); } } }
  // the pieces
  const labels = [];
  for (const it of p.items) {
    if (it.lv !== lv) continue; const r = it.r; const D = IT[it.kind] || {}; const cx = X(it.x), cy = Y(it.z);
    if (it.niche) { C.frame(X(r[0]), Y(r[1]), X(r[2]), Y(r[3]), COL.store, 2); continue; }
    if (it.fire) { C.rect(X(r[0]), Y(r[1]), X(r[2]), Y(r[3]), COL.fire); C.disc(cx, cy, Math.min(r[2] - r[0], r[3] - r[1]) * PPM * 0.28, COL.ember); C.disc(cx, cy, Math.min(r[2] - r[0], r[3] - r[1]) * PPM * 0.13, [255, 220, 90]); labels.push([cx, cy, 'FOGO', COL.ember]); }
    else if (isEat(it)) { C.rect(X(r[0]), Y(r[1]), X(r[2]), Y(r[3]), COL.eat); labels.push([cx, cy, it.kind === 'esteira-comer' ? 'ESTEIRA' : it.kind === 'banco-comer' ? 'BANCO' : 'MESA', COL.eatD]); }
    else if (it.places) { C.rect(X(r[0]), Y(r[1]), X(r[2]), Y(r[3]), COL.bed); const h = 0.22; const s = Math.sin(it.ry), co = Math.cos(it.ry); // (the pillow at its head: against its front)
      const head = Math.abs(co) > 0.5 ? (co > 0 ? [r[0], r[1], r[2], r[1] + h] : [r[0], r[3] - h, r[2], r[3]]) : (s > 0 ? [r[0], r[1], r[0] + h, r[3]] : [r[2] - h, r[1], r[2], r[3]]);
      if (!D.per) C.rect(X(head[0]), Y(head[1]), X(head[2]), Y(head[3]), COL.pillow); }
    else if (it.store) C.rect(X(r[0]), Y(r[1]), X(r[2]), Y(r[3]), COL.store);
    else C.rect(X(r[0]), Y(r[1]), X(r[2]), Y(r[3]), COL.wood);
    C.frame(X(r[0]), Y(r[1]), X(r[2]), Y(r[3]), COL.ink, 1);
  }
  // the walls, the ways through and the windows
  for (const w of p.walls) { if (w.lv !== lv) continue; const t = Math.max(2, w.t * PPM); const low = w.kind === 'guarda-corpo' || w.kind === 'parapeito' || w.kind === 'cerca';
    C.line(X(w.a[0]), Y(w.a[1]), X(w.b[0]), Y(w.b[1]), low ? COL.sub : w.outer ? COL.wall : COL.inner, low ? Math.max(2, t * 0.5) : t); }
  for (const h of p.holes) { const w = p.walls[h.wall]; if (!w || w.lv !== lv) continue; const len = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1; const tx = (w.b[0] - w.a[0]) / len, tz = (w.b[1] - w.a[1]) / len;
    const a = [w.a[0] + tx * (h.at - h.w / 2), w.a[1] + tz * (h.at - h.w / 2)], c = [w.a[0] + tx * (h.at + h.w / 2), w.a[1] + tz * (h.at + h.w / 2)];
    C.line(X(a[0]), Y(a[1]), X(c[0]), Y(c[1]), h.kind === 'janela' ? COL.win : COL.door, Math.max(3, w.t * PPM + 1) * (h.kind === 'janela' ? 0.6 : 1)); }
  // the places the body takes: where one eats, where one cooks or warms oneself, where one lies
  for (const it of p.items) { if (it.lv !== lv) continue; for (const sp of it.spots) { if (!sp.ok) continue; const c = sp.use === 'comer' ? COL.eatD : sp.use === 'cozinhar' || sp.use === 'assar' || sp.use === 'aquecer' ? COL.ember : sp.use === 'deitar' ? [70, 110, 170] : sp.use === 'sentar' ? COL.eatD : null; if (!c) continue;
    C.disc(X(sp.x), Y(sp.z), sp.use === 'deitar' ? 3 : 5, [255, 255, 255]); C.disc(X(sp.x), Y(sp.z), sp.use === 'deitar' ? 2 : 4, c); } }
  for (const [cx, cy, s, col] of labels) { const k = 1; const w = textW(s, k); C.rect(cx - w / 2 - 2, cy + 9, cx + w / 2 + 1, cy + 20, [255, 255, 255], 0.82); text(C, cx - w / 2, cy + 11, s, col, k); }
  // the way in
  if (p.entrance && lv === p.entryLv) { const e = p.entrance; const dx = e.out[0] - e.x, dz = e.out[1] - e.z; const d = Math.hypot(dx, dz) || 1; const ux = dx / d, uz = dz / d; const bx = X(e.x) + ux * 16, by = Y(e.z) + uz * 16;
    for (let q = 0; q <= 12; q++) C.line(bx - uz * (q - 6) * 1.1 + ux * 0, by + ux * (q - 6) * 1.1, X(e.x) + ux * 3, Y(e.z) + uz * 3, [226, 168, 30], 1); }
  C.frame(X(0), Y(0), X(L), Y(L), COL.sub, 1);
}
// ------------------------------ the sheet ------------------------------
const plans = specs.map(planOf); const PAD = 22, HEAD = 62, FOOT = 34;
const cols = []; for (const P of plans) { const lvs = P.p.levels ? P.p.levels.filter(l => P.p.rooms.some(m => m.lv === l.lv)).map(l => l.lv) : []; for (const lv of lvs) cols.push({ P, lv, first: lv === lvs[0], n: lvs.length }); }
const widthOf = c => c.P.p.lot.w * PPM; const W = cols.reduce((s, c) => s + widthOf(c) + PAD, PAD); const H = HEAD + Math.max(...cols.map(c => c.P.p.lot.w * PPM)) + FOOT + PAD + 26;
const C = canvas(Math.max(W, 520), H, [250, 248, 242]); let ox = PAD;
for (const c of cols) {
  const p = c.P.p; const ea = p.items.filter(isEat); const seats = ea.reduce((s, it) => s + it.spots.filter(q => q.use === 'comer' && q.ok).length, 0); const fires = p.items.filter(it => it.fire).length;
  if (c.first) { text(C, ox, 10, c.P.title, COL.ink, 2); text(C, ox, 30, `${p.ok ? '' : 'INVALIDA - '}${p.cap ? p.cap.places : 0} lugares de dormir - fogo: ${fires ? 'sim' : 'NAO'} - onde comer: ${ea.length ? seats + ' lugares' : 'NAO TEM'}`, ea.length ? COL.eatD : COL.ember, 1); }
  const l = p.levels.find(q => q.lv === c.lv); text(C, ox, 44, c.n > 1 ? (STOREY[l.kind] || l.kind) : '', COL.sub, 1);
  draw(C, ox, HEAD, c.P, c.lv); ox += widthOf(c) + PAD;
}
// the legend
{ let x = PAD; const y = H - 30; const sw = (col, s) => { C.rect(x, y, x + 14, y + 14, col); C.frame(x, y, x + 14, y + 14, COL.ink, 1); x = text(C, x + 19, y + 4, s, COL.ink, 1) + 14; };
  sw(COL.fire, 'fogo'); sw(COL.eat, 'onde a familia come (ponto verde: um lugar)'); sw(COL.bed, 'camas e esteiras'); sw(COL.store, 'guardados'); sw(COL.wood, 'outros'); }
// the PNG (zlib, no library)
const raw = Buffer.alloc((C.W * 3 + 1) * C.H); for (let y = 0; y < C.H; y++) { raw[y * (C.W * 3 + 1)] = 0; C.d.copy(raw, y * (C.W * 3 + 1) + 1, y * C.W * 3, (y + 1) * C.W * 3); }
const crcT = []; for (let n = 0; n < 256; n++) { let c = n; for (let q = 0; q < 8; q++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcT[n] = c >>> 0; }
const crc = buf => { let c = 0xffffffff; for (const v of buf) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (t, d) => { const len = Buffer.alloc(4); len.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
const ih = Buffer.alloc(13); ih.writeUInt32BE(C.W, 0); ih.writeUInt32BE(C.H, 4); ih[8] = 8; ih[9] = 2;
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
fs.writeFileSync(out, Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
for (const P of plans) console.log(`${P.title}: ${P.p.fam} #${P.b.id} ${P.p.ok ? 'válida' : 'INVÁLIDA: ' + (P.p.errs || []).join('; ')} — ${P.p.items.map(i => i.kind).join(' ')}`);
console.log(`gravado ${out} (${C.W}×${C.H})`);
