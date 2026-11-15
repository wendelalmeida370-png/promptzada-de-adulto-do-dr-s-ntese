'use strict';
// ============================================================
//  Receitas: each gesture of G.Gestos as the body makes it, per
//  family (D-281) — the four-legged (most kinds), the birds, the
//  snakes, the sprawlers (the crocodile, the lizard), the frog,
//  the seals —, written as layers for FaunaAnim.Gest to pose:
//  how far the body goes down, which legs it takes and where it
//  puts them, where the head goes, the mouth, the ears, the tail.
//  The same recipe serves the kinds of a family by their ways (a
//  cow lies on its folded legs, a dog like a sphinx; a horse kicks
//  behind, a moose strikes in front). Each recipe: f(u seconds into
//  it, d its length — 0 held). Only seen.
// ============================================================
(function (G) {
  const FG = G.FaunaAnim && G.FaunaAnim.Gest; if (!FG) return;
  const I = FG.I, C = FG.C, A = FG.add, X = FG.mx, Lg = FG.leg, Ab = FG.ab, M = FG.moves, def = FG.def;
  const { ramp, bell, osc, hz } = FG.ease;
  const fr = (u, d, cyc) => (d > 0 ? Math.min(1, u / d) : (u % cyc) / cyc); // (how far into it: of its length, or of a cycle when held)
  const W = FG.w, setW = FG.setW;
  const with_ = (w, f) => { const k0 = W(); setW(k0 * w); f(); setW(k0); }; // (a part of a recipe at a weight of its own)
  const S = () => C.s;
  const FRONT = [0, 1], HIND = [2, 3];
  const sideLeg = (front, sd) => (front ? (sd > 0 ? 0 : 1) : (sd > 0 ? 2 : 3)); // (the leg of that side: + left)

  // ================================ the four-legged ================================
  // ---------------- rest ----------------
  def('sleep', { in: 1.2, out: 0.9, still: 1, quad(u) {
    const s = S(), sd = C.side; A(I.EYE, 1); A(I.BREATH, 0.7); A(I.BRATE, -0.55); A(I.EARD, 0.8); A(I.TTUCK, 0.2);
    const flat = s.cat ? G.hash(C.id * 3 + 1) < 0.55 : s.equid ? G.hash(C.id * 3 + 1) < 0.3 : s.eleph || s.hippo ? G.hash(C.id * 3 + 1) < 0.6 : false;
    if (s.monkey || s.sloth) { A(I.SIT, 1); A(I.NDOWN, 0.75); A(I.HROLL, 0.3 * sd); return; }
    if (flat) { M.sideDown(1, sd); A(I.NDOWN, 0.2); return; } // (stretched out on its side)
    if (s.sphinx) { M.lieDown(1); A(I.YAW, sd * 0.95); A(I.NYAW, sd * 1.15); A(I.NDOWN, 1.0); A(I.TSIDE, sd * 1.4); A(I.HROLL, sd * 0.35); return; } // (curled round, the nose to the tail)
    M.lieDown(1); A(I.NDOWN, 0.95); if (G.hash(C.id * 5 + 2) < 0.5) { A(I.NYAW, sd * 1.0); A(I.YAW, sd * 0.25); } // (the head on the ground, or turned back along the flank)
  } });
  def('lie', { in: 1.0, out: 0.8, still: 1, quad(u) { M.lieDown(1); A(I.NUP, 0.05); A(I.EARY, 0.35); A(I.HYAW, osc(u, 0.07, C.id) * 0.25); } });
  def('ruminate', { in: 1.0, out: 0.8, still: 1, quad(u) { M.lieDown(1); A(I.CHEW, 1); A(I.EARY, 0.25); A(I.EYE, 0.25); A(I.NUP, 0.05); } });
  def('yawn', { in: 0.3, out: 0.4, quad(u, d) {
    const f = fr(u, d, 2.2), o = bell(f, 0.05, 0.45, 0.92);
    A(I.JAW, 1.3 * o); A(I.NUP, 0.35 * o); A(I.HPITCH, -0.3 * o); A(I.EARB, 0.6 * o); A(I.EYE, ramp(o, 0.55, 0.85)); A(I.TRUP, S().eleph ? 0.5 * o : 0);
  } });
  def('stretch', { in: 0.3, out: 0.4, still: 1, quad(u, d) {
    const f = fr(u, d, 2.8), b = bell(f, 0, 0.25, 0.55), h = bell(f, 0.5, 0.72, 0.98);
    A(I.BOW, 1.5 * b); A(I.NUP, -0.15 * b); A(I.HPITCH, -0.2 * b); A(I.TUP, 0.5 * b); A(I.JAW, 0.5 * b); A(I.EYE, 0.6 * b);
    with_(b, () => { for (const k of FRONT) Lg(k, 0.85, 0, 0.1, 0); });
    with_(h, () => { Lg(sideLeg(false, C.side), -0.85, 0.12, -0.2, 0.6); A(I.PITCH, -0.06); });
  } });
  def('shake', { in: 0.15, out: 0.3, still: 1, any(u, d) {
    const f = fr(u, d, 1.4), a = bell(f, 0, 0.12, 1); const q = Math.sin(u * hz(6.5));
    A(I.ROLL, q * 0.2 * a); A(I.HROLL, Math.sin(u * hz(6.5) - 0.9) * 0.55 * a); A(I.NYAW, Math.sin(u * hz(6.5) - 0.5) * 0.3 * a);
    A(I.EARO, Math.abs(q) * 0.6 * a); A(I.TWAG, a); A(I.WOPEN, 0.25 * a); A(I.EYE, 0.5 * a);
  } });
  def('groom', { in: 0.5, out: 0.5, still: 1, quad(u) {
    const s = S(), sd = C.side, lick = Math.max(0, Math.sin(u * hz(2.2))) * 0.25;
    if (s.cat && G.hash(C.id * 7 + 1) < 0.5) { A(I.SIT, 1); with_(1, () => Lg(sideLeg(true, sd), 0.4, 0.62, 2.1, -0.7)); A(I.NDOWN, 0.15); A(I.HPITCH, 0.45); A(I.NYAW, sd * 0.3); A(I.JAW, lick); A(I.EYE, 0.5); return; } // (a paw licked, sitting)
    if (s.rabbit || s.small) { A(I.SIT, s.rabbit ? 0 : 0.8); A(I.DROP, 0.3); A(I.NDOWN, 0.4); A(I.HPITCH, 0.4); A(I.JAW, lick); A(I.EARB, 0.5); return; }
    M.lieDown(s.hoof ? 0 : 1); A(I.NYAW, sd * 1.35); A(I.YAW, sd * 0.55); A(I.NDOWN, 0.45); A(I.HROLL, sd * 0.4); A(I.JAW, lick); A(I.EYE, 0.4);
  } });
  def('scratch', { in: 0.35, out: 0.4, still: 1, quad(u) {
    const s = S(), sd = C.side, q = Math.sin(u * hz(7));
    if (s.canid || s.cat || s.rabbit || s.bear || s.monkey) { A(I.SIT, 0.85); with_(1, () => { Lg(sideLeg(false, sd), 0.85 + q * 0.06, 0.55 + q * 0.05, -1.6, 0.4); Ab(sideLeg(false, sd), 0.35); }); A(I.HROLL, sd * 0.45); A(I.NYAW, sd * 0.35); A(I.EYE, 0.6); A(I.EARB, 0.3); return; }
    A(I.NYAW, sd * 1.25); A(I.YAW, sd * 0.45); A(I.NDOWN, 0.35); A(I.HYAW, q * 0.06); A(I.JAW, 0.15 + Math.max(0, q) * 0.15); // (a hoofed one nibbles its flank)
  } });
  def('roll', { in: 0.5, out: 0.6, still: 1, quad(u, d) {
    const f = fr(u, d, 3.5), sd = C.side, back = bell(f, 0.2, 0.5, 0.8);
    A(I.ROLL, sd * (1.42 + 1.4 * back + Math.sin(u * hz(1.8)) * 0.15 * back)); A(I.GROUND, 1); A(I.LIMP, 0.6); A(I.THRASH, 0.45 * back); A(I.NYAW, -sd * 0.3); A(I.EYE, 0.4);
  } });
  def('wallow', { in: 1.0, out: 0.8, still: 1, quad(u) {
    const s = S(), sd = C.side;
    if (s.eleph || s.hippo) { M.sideDown(0.75, sd); A(I.ROLL, Math.sin(u * hz(0.18)) * 0.35); A(I.TRUP, s.eleph ? 0.4 + 0.4 * osc(u, 0.3) : 0); return; }
    M.lieDown(1); A(I.ROLL, Math.sin(u * hz(0.22)) * 0.45 + sd * 0.2); A(I.NDOWN, 0.75); A(I.HROLL, Math.sin(u * hz(0.22) - 0.6) * 0.3); A(I.EYE, 0.5); A(I.TWAG, s.swine ? 0.6 : 0);
  } });
  def('dustbath', { in: 0.4, out: 0.5, still: 1, quad(u, d) {
    const s = S(), f = fr(u, d, 5);
    if (s.eleph) { const c = (u % 2.4) / 2.4; A(I.TRDN, bell(c, 0, 0.25, 0.5)); A(I.TRUP, 1.4 * bell(c, 0.4, 0.65, 0.95)); A(I.TRCURL, 0.6 * bell(c, 0.45, 0.7, 0.95)); A(I.NUP, 0.2 * bell(c, 0.4, 0.65, 0.95)); A(I.NDOWN, 0.4 * bell(c, 0, 0.2, 0.45)); A(I.EARO, 0.3); return; }
    REC_.roll.quad(u, d);
  } });
  def('bask', { in: 1.0, out: 0.8, still: 1, quad(u) {
    const s = S(); if (s.monkey) { A(I.SIT, 1); A(I.NUP, 0.2); A(I.EYE, 0.6); return; }
    M.sideDown(1, C.side); A(I.EYE, 0.75); A(I.BREATH, 0.5); A(I.NDOWN, 0.1);
  } });
  def('pant', { in: 0.5, out: 0.6, quad() { A(I.PANT, 1); A(I.JAW, S().hunter ? 0.75 : 0.3); A(I.NDOWN, 0.1); A(I.EARD, 0.3); } });
  // ---------------- the senses ----------------
  def('sniff', { in: 0.4, out: 0.4, quad(u) { A(I.NDOWN, 1.0); A(I.HYAW, osc(u, 0.8) * 0.25); A(I.EARF, 0.3); A(I.HPITCH, 0.1); A(I.TRDN, 0.3); A(I.TRCURL, 0.2 * osc(u, 1.3)); } });
  def('scent', { in: 0.4, out: 0.4, still: 0.6, quad(u) { A(I.NUP, 0.6); A(I.HPITCH, -0.4); A(I.HYAW, osc(u, 0.5) * 0.18); A(I.EARF, 0.6); A(I.JAW, (S().equid || S().cat) ? 0.12 : 0); A(I.TRUP, S().eleph ? 0.9 : 0); A(I.TRCURL, S().eleph ? 0.4 : 0); } });
  def('alert', { in: 0.2, out: 0.6, still: 0.8, quad(u) { const s = S(); A(I.NUP, 0.5); A(I.EARF, 1); A(I.AIM, 0.3); A(I.TUP, s.rumin || s.antler ? 0.6 : 0); A(I.EARO, s.eleph ? 0.9 : 0); A(I.TRUP, s.eleph ? 0.5 : 0); A(I.DROP, s.hunter ? 0.1 : 0); } });
  def('listen', { in: 0.3, out: 0.4, still: 0.7, quad(u) { A(I.NUP, 0.3); A(I.EARY, 1); A(I.EARF, 0.4); A(I.HROLL, osc(u, 0.3) * 0.15); } });
  def('stare', { in: 0.3, out: 0.5, still: 0.9, quad() { const s = S(); A(I.NFWD, 0.3); A(I.EARF, 0.9); A(I.AIM, 0.35); A(I.DROP, s.hunter ? 0.25 : 0); A(I.NUP, s.hunter ? -0.05 : 0.3); } });
  def('startle', { in: 0.04, out: 0.4, quad(u, d) {
    const f = fr(u, d, 0.7), j = bell(f, 0, 0.12, 0.6);
    A(I.FWD, -0.08 * j); A(I.LIFT, 0.14 * bell(f, 0, 0.1, 0.35)); A(I.NUP, 0.6 * j); A(I.EARF, j); A(I.TUP, 0.7 * j); A(I.DROP, 0.25 * bell(f, 0.3, 0.6, 1)); A(I.ROLL, C.side * 0.06 * j); A(I.EARO, S().eleph ? j : 0);
  } });
  def('stot', { in: 0.15, out: 0.3, still: 0.4, quad(u) {
    const air = Math.max(0, Math.sin(u * hz(2.2))); A(I.LIFT, 0.5 * air); A(I.ARCH, 0.14); A(I.NUP, 0.35); A(I.TUP, 0.9); A(I.EARF, 0.5);
    for (let k = 0; k < 4; k++) Lg(k, 0, 0.0, 0, 0); // (the legs held straight under it, stiff: the body flies off them)
  } });
  def('snort', { in: 0.15, out: 0.3, quad(u, d) { const f = fr(u, d, 1.2); A(I.NUP, 0.45 * bell(f, 0, 0.3, 0.5)); A(I.NDOWN, 0.4 * bell(f, 0.4, 0.6, 1)); A(I.HPITCH, 0.25 * bell(f, 0.45, 0.6, 0.85)); A(I.JAW, 0.15 * bell(f, 0.45, 0.55, 0.7)); A(I.EARB, 0.3); A(I.TRUP, S().eleph ? 0.6 * bell(f, 0.3, 0.55, 0.9) : 0); } });
  def('howl', { in: 0.6, out: 0.6, still: 1, quad(u, d) {
    const f = fr(u, d, 4), o = bell(f, 0, 0.18, 0.96); A(I.SIT, S().canid && C.id % 3 !== 0 ? 0.85 : 0);
    A(I.NUP, 1.45 * o); A(I.HPITCH, -0.6 * o); A(I.JAW, (0.45 + 0.1 * osc(u, 0.4)) * o); A(I.EARB, 0.35 * o); A(I.EYE, 0.4 * o); A(I.BREATH, o);
  } });
  def('roar', { in: 0.3, out: 0.5, still: 1, quad(u, d) {
    const s = S(), f = fr(u, d, 3), o = bell(f, 0.05, 0.25, 0.9), pu = 0.7 + 0.3 * Math.abs(Math.sin(u * hz(1.4)));
    if (s.hippo) { A(I.NUP, 0.85 * o); A(I.JAW, 1.25 * o); A(I.EARB, 0.4 * o); return; }
    if (s.bear) { A(I.NDOWN, 0.3 * o); A(I.NFWD, 0.5 * o); A(I.JAW, 1.1 * o * pu); A(I.HYAW, osc(u, 0.6) * 0.25 * o); A(I.EARB, o); A(I.DROP, 0.15 * o); return; }
    A(I.NDOWN, 0.2 * o); A(I.NFWD, 0.65 * o); A(I.HPITCH, -0.45 * o); A(I.JAW, 1.25 * o * pu); A(I.EARB, 0.5 * o); A(I.BREATH, 2 * o); A(I.ARCH, -0.05 * o); A(I.EYE, 0.3 * o);
  } });
  def('trumpet', { in: 0.25, out: 0.5, still: 0.5, quad(u, d) { const f = fr(u, d, 2.5), o = bell(f, 0, 0.2, 0.9); A(I.TRUP, 1.3 * o); A(I.TRCURL, 0.35 * o); A(I.NUP, 0.55 * o); A(I.EARO, 1.1 * o); A(I.JAW, 0.35 * o); A(I.TUP, 0.4 * o); } });
  def('bellow', { in: 0.3, out: 0.5, still: 0.8, quad(u, d) { const f = fr(u, d, 3), o = bell(f, 0.05, 0.3, 0.92); A(I.NFWD, 0.85 * o); A(I.NUP, 0.4 * o); A(I.HPITCH, -0.65 * o); A(I.JAW, (0.55 + 0.1 * osc(u, 1.1)) * o); A(I.BREATH, 1.5 * o); A(I.EARB, 0.3 * o); } });
  def('call', { in: 0.15, out: 0.3, any(u, d) { const f = fr(u, d, 1.8), o = bell(f, 0, 0.2, 0.45) + bell(f, 0.5, 0.7, 0.95); A(I.NUP, 0.3 * o); A(I.JAW, 0.55 * o); A(I.HPITCH, -0.15 * o); A(I.EARF, 0.3); A(I.SAC, 0.8 * o); A(I.TRUP, S().eleph ? 0.8 * o : 0); } });
  // ---------------- eating and drinking ----------------
  def('browse', { in: 0.6, out: 0.6, still: 0.7, quad(u) {
    const s = S(); A(I.CHEW, 1);
    if (s.giraffe) { A(I.NUP, 1.15); A(I.HPITCH, -0.55); A(I.HYAW, osc(u, 0.15) * 0.2); return; }
    if (s.eleph) { A(I.TRUP, 1.15); A(I.TRFWD, 0.4); A(I.NUP, 0.45); A(I.TRCURL, 0.3 * osc(u, 0.4)); return; }
    if ((C.kind === 'cabra' || C.kind === 'ibex') && G.hash(C.id * 11) < 0.6) { A(I.REAR, 0.85); A(I.NUP, 0.7); A(I.HPITCH, -0.4); for (const k of FRONT) Lg(k, 0.4, 0.95, 1.4, 0); return; }
    A(I.NUP, 0.8); A(I.HPITCH, -0.4); A(I.HYAW, osc(u, 0.2) * 0.15);
  } });
  def('rear', { in: 0.35, out: 0.5, still: 1, quad(u, d) {
    const s = S(), f = fr(u, d, 2.5), r = d > 0 ? bell(f, 0.03, 0.35, 0.92) : 1; A(I.REAR, r); A(I.NUP, 0.55 * r); A(I.TUP, 0.3 * r); A(I.EARF, 0.5 * r);
    with_(r, () => { for (const k of FRONT) {
      if (s.equid) Lg(k, 0.4, 0.75, 1.9 + 0.5 * Math.sin(u * hz(1.8) + k * Math.PI), -0.6);
      else if (s.bear || s.monkey) Lg(k, 0.3, 1.0, 1.0, 0.5);
      else Lg(k, 0.3, 0.8, 2.3, 0.6); } });
    A(I.TRUP, s.eleph ? 1.0 * r : 0); A(I.EARO, s.eleph ? r : 0);
  } });
  def('dig', { in: 0.3, out: 0.4, still: 0.85, quad(u) {
    const s = S(); A(I.NDOWN, 0.75); A(I.EARB, 0.2);
    if (s.swine) { REC_.root.quad(u); return; }
    if (s.eleph) { const q = u * hz(1.2); with_(1, () => Lg(0, 0.25 - 0.3 * Math.sin(q), 0.12 * Math.max(0, Math.cos(q)), 0.6, 0.2)); A(I.TRDN, 0.8); return; }
    A(I.BOW, 0.55); for (const k of FRONT) { const q = u * hz(3.2) + k * Math.PI; Lg(k, 0.3 + 0.32 * Math.sin(q), 0.04 + 0.16 * Math.max(0, Math.cos(q)), 1.3, 0.3); }
  } });
  def('root', { in: 0.4, out: 0.4, still: 0.5, quad(u) { A(I.NDOWN, 1.1); A(I.FWD, 0.03 * Math.sin(u * hz(1.8))); A(I.HPITCH, 0.25 * Math.sin(u * hz(1.8) - 0.6)); A(I.HYAW, osc(u, 0.5) * 0.15); A(I.TWAG, 0.4); } });
  def('drink', { in: 0.6, out: 0.6, still: 1, quad(u) {
    const s = S(), lap = Math.max(0, Math.sin(u * hz(3.2)));
    if (s.giraffe) { A(I.DROP, 0.55); for (const k of FRONT) { Lg(k, 0.25, 0, 0, 0); Ab(k, 0.62); } A(I.NDOWN, 1.25); A(I.HPITCH, 0.15); return; } // (the forelegs splayed wide, to reach the water)
    if (s.eleph) { const c = (u % 3.2) / 3.2; A(I.TRDN, 1.1 * bell(c, 0, 0.2, 0.55)); A(I.TRUP, 0.7 * bell(c, 0.5, 0.72, 0.95)); A(I.TRCURL, 1.3 * bell(c, 0.5, 0.72, 0.95)); A(I.NDOWN, 0.25); return; }
    if (s.cat) { A(I.DROP, 1.15); A(I.NDOWN, 1.05); A(I.JAW, 0.15 * lap); A(I.EARB, 0.15); return; } // (crouched at the edge, lapping)
    if (s.canid || s.bear) { A(I.NDOWN, 1.05); A(I.JAW, 0.12 * lap); return; }
    A(I.NDOWN, 1.08); A(I.HPITCH, 0.05 * Math.sin(u * hz(0.9))); A(I.EARY, 0.3);
  } });
  def('chew', { in: 0.3, out: 0.3, any() { A(I.CHEW, 1); A(I.NUP, 0.1); } });
  def('tear', { in: 0.3, out: 0.4, still: 0.85, body: 1, quad(u) {
    const s = S(), c = (u * 0.85 + G.hash(C.id) ) % 1, pull = bell(c, 0.1, 0.38, 0.72), shk = Math.sin(u * hz(1.15));
    A(I.DROP, 0.15); A(I.NDOWN, 0.5 - 0.3 * pull); A(I.AIM, 0.85 * (1 - pull * 0.5)); A(I.FWD, -0.07 * pull); A(I.NUP, 0.35 * pull); A(I.HYAW, C.side * 0.35 * shk * pull);
    A(I.JAW, 0.25 + 0.45 * (1 - pull)); A(I.EARB, 0.35); A(I.TLASH, 0.3);
    for (const k of FRONT) Lg(k, 0.22, 0, 0, 0); for (const k of HIND) Lg(k, -0.2, 0, 0, 0); // (braced: the forefeet forward, the hind ones back)
    if (s.bear || s.cat) with_(0.8, () => Lg(sideLeg(true, C.side), 0.55, 0.06, 0.5, 0.1)); // (a forepaw holding the carcass down)
  } });
  def('gnaw', { in: 0.6, out: 0.5, still: 1, quad(u) {
    const s = S(), j = Math.max(0, Math.sin(u * hz(4))) * 0.22;
    if (s.beaver) { A(I.REAR, 0.5); A(I.AIM, 0.6); A(I.JAW, 0.2 + j); A(I.HROLL, 0.4 * C.side); A(I.TUP, -0.2); for (const k of FRONT) Lg(k, 0.35, 0.6, 1.5, 0.2); return; }
    M.lieDown(1); A(I.NDOWN, 0.75); A(I.HROLL, C.side * 0.5); A(I.JAW, 0.2 + j); A(I.HYAW, osc(u, 0.5) * 0.1);
  } });
  def('fish', { in: 0.5, out: 0.5, still: 0.9, quad(u) {
    const c = (u % 3.4) / 3.4, st = bell(c, 0.72, 0.8, 0.96);
    A(I.NDOWN, 0.7 + 0.4 * st); A(I.EARF, 0.8); A(I.JAW, st);
    with_(1, () => Lg(sideLeg(true, C.side), 0.5 + 0.15 * st, 0.35 * (1 - st) + 0.04, 1.3 * (1 - st), 0)); A(I.SWIM, S().otter ? 1 : 0);
  } });
  def('fell', { in: 0.6, out: 0.6, still: 1, quad(u, d) {
    const f = fr(u, d, 6), cl = bell(f, 0.45, 0.72, 0.95);
    A(I.FWD, 0.08 + 0.04 * Math.sin(u * hz(0.8))); A(I.NDOWN, 0.2); A(I.HPITCH, 0.3); A(I.TRUP, 0.7); A(I.TRFWD, 0.5); A(I.EARO, 0.5); A(I.REAR, 0.3 * cl);
    with_(cl, () => Lg(sideLeg(true, C.side), 0.45, 0.5, 1.6, 0)); A(I.AIM, 0.4);
  } });
  def('carry', { in: 0.3, out: 0.4, quad() { A(I.NUP, 0.15); A(I.JAW, 0.3); A(I.HPITCH, 0.1); A(I.TUP, 0.1); } });
  def('drag', { in: 0.4, out: 0.5, body: 1, quad(u) { const j = Math.max(0, Math.sin(u * hz(0.9))); A(I.DROP, 0.4); A(I.NDOWN, 0.55); A(I.JAW, 0.3); A(I.FWD, -0.05 - 0.03 * j); A(I.NUP, 0.2 * j); A(I.EARB, 0.3); A(I.AIM, 0.5); for (const k of HIND) Lg(k, -0.15, 0, 0, 0); } });
  def('cache', { in: 0.3, out: 0.4, still: 1, quad(u, d) { const f = fr(u, d, 4); with_(1 - ramp(f, 0.5, 0.6), () => REC_.dig.quad(u)); with_(ramp(f, 0.5, 0.6), () => { A(I.NDOWN, 1.1); A(I.FWD, 0.04 * Math.max(0, Math.sin(u * hz(1.6)))); }); } });
  // ---------------- among their own ----------------
  def('nuzzle', { in: 0.5, out: 0.5, still: 0.8, body: 1, quad(u) { A(I.AIM, 0.75); A(I.NFWD, 0.3); A(I.EARD, 0.4); A(I.EYE, 0.35); A(I.HROLL, 0.2 * C.side); A(I.TRFWD, S().eleph ? 0.7 : 0); } });
  def('allogroom', { in: 0.5, out: 0.5, still: 1, body: 1, quad(u) { A(I.AIM, 0.85); A(I.JAW, 0.12 + Math.max(0, Math.sin(u * hz(2))) * 0.18); A(I.EYE, 0.45); A(I.EARD, 0.3); A(I.TRFWD, S().eleph ? 0.7 : 0); } });
  def('play', { in: 0.25, out: 0.4, still: 0.3, quad(u) {
    const s = S(), c = ((u + G.hash(C.id) * 7) % 2.4) / 2.4, ph = Math.floor((u + G.hash(C.id) * 7) / 2.4 + C.id) % 3;
    if (s.eleph) { A(I.TRUP, 0.6 + 0.5 * osc(u, 0.7)); A(I.EARO, 0.6 + 0.4 * osc(u, 1.1)); A(I.HYAW, osc(u, 0.5) * 0.3); A(I.LIFT, 0.04 * Math.abs(osc(u, 1.2))); return; }
    if (ph === 0) { const b = bell(c, 0, 0.2, 0.8); A(I.BOW, 1.3 * b); A(I.TWAG, 1); A(I.TUP, 0.6 * b); A(I.HROLL, 0.3 * b * C.side); with_(b, () => { for (const k of FRONT) Lg(k, 0.7, 0, 0.1, 0); }); A(I.JAW, 0.3); return; } // (the bow: come and play)
    if (ph === 1) { const j = Math.max(0, Math.sin(c * Math.PI * 2)); A(I.LIFT, 0.35 * j); A(I.YAW, C.side * 0.35 * Math.sin(c * Math.PI * 2)); A(I.NUP, 0.3); A(I.TUP, 0.5); A(I.EARF, 0.6); return; } // (a bounce, a twist in the air)
    if (s.hoof || s.equid) { M.hindKick(c, true, C.side); A(I.LIFT, 0.2 * bell(c, 0, 0.2, 0.4)); return; } // (a kick of the heels)
    A(I.ROLL, C.side * 1.2 * bell(c, 0.1, 0.4, 0.8)); A(I.GROUND, bell(c, 0.1, 0.4, 0.8)); A(I.THRASH, 0.4 * bell(c, 0.1, 0.4, 0.8)); A(I.JAW, 0.5); // (a roll, the paws batting)
  } });
  def('suckle', { in: 0.6, out: 0.5, still: 1, body: 1, quad(u) {
    const s = S(); A(I.AIM, 0.9); A(I.TWAG, s.hoof ? 0.9 : 0.3); A(I.FWD, 0.015 * Math.sin(u * hz(1.3))); A(I.EYE, 0.3); A(I.EARD, 0.3);
    if (!s.hoof && !s.equid && !s.pachy) { M.lieDown(1); A(I.NDOWN, 0.2); } else { A(I.NUP, 0.2); A(I.DROP, 0.12); for (const k of FRONT) Lg(k, 0.12, 0, 0, 0); }
  } });
  def('nurse', { in: 0.8, out: 0.8, still: 1, quad(u) {
    const s = S();
    if (s.cat || s.canid || s.bear || s.swine || s.rabbit || s.otter || s.beaver) { M.sideDown(1, C.side); A(I.NUP, 0.25); A(I.NYAW, C.side * 0.35); A(I.EYE, 0.35); return; } // (lying on her side, the young at the belly)
    if (s.monkey) { A(I.SIT, 1); A(I.NDOWN, 0.4); return; }
    A(I.NYAW, C.side * 0.9); A(I.NDOWN, 0.3); A(I.TLASH, 0.3); A(I.EARD, 0.3);
  } });
  def('mate', { in: 0.5, out: 0.5, still: 1, quad(u) {
    const s = S();
    if (C.sx > 0.5) { // (he mounts: the forelegs over her back)
      if (s.cat) { A(I.DROP, 0.25); A(I.FWD, 0.15); A(I.AIM, 0.7); A(I.JAW, 0.3); return; } // (the cat over her, the jaws at her nape)
      A(I.REAR, 0.62); A(I.FWD, 0.2 + 0.03 * Math.sin(u * hz(2.2))); A(I.NFWD, 0.35); A(I.EARB, 0.3);
      for (const k of FRONT) Lg(k, 0.6, 0.6, 1.7, 0.6); return;
    }
    if (s.cat) { M.lieDown(1); A(I.EARB, 0.6); A(I.TSIDE, 0.8 * C.side); return; } // (she lies under him)
    A(I.DROP, 0.1); A(I.NDOWN, 0.2); A(I.TSIDE, 0.7 * C.side); A(I.TUP, 0.2);
  } });
  def('court', { in: 0.5, out: 0.5, quad(u) {
    const s = S(); A(I.NUP, 0.55); A(I.HPITCH, 0.35); A(I.ARCH, 0.05); A(I.EARF, 0.6); A(I.TUP, 0.5);
    if (C.kind === 'vaca' || C.kind === 'bison' || s.equid) { A(I.HPITCH, -0.8); A(I.JAW, 0.22); } // (the lip curled over the scent of her)
    if (s.cat) { A(I.NUP, -0.4); A(I.HPITCH, -0.35); A(I.TLASH, 0.5); A(I.AIM, 0.4); }
    if (s.antler) { A(I.NFWD, 0.4); A(I.JAW, 0.2); }
  } });
  def('display', { in: 0.35, out: 0.5, still: 0.6, quad(u, d) {
    const s = S(), f = fr(u, d, 3), o = d > 0 ? bell(f, 0, 0.2, 0.9) : 1;
    if (s.eleph) { A(I.EARO, 1.25 * o); A(I.TRUP, 0.8 * o); A(I.NUP, 0.6 * o); A(I.REAR, 0.08 * o); A(I.TUP, 0.4 * o); return; }
    if (s.bear) { A(I.REAR, o); A(I.NUP, 0.4 * o); A(I.JAW, 0.55 * o); for (const k of FRONT) with_(o, () => Lg(k, 0.35, 1.0, 1.0, 0.5)); return; }
    if (s.hippo) { A(I.JAW, 1.3 * o); A(I.NUP, 0.75 * o); return; }
    if (s.cat) { A(I.ARCH, 0.38 * o); A(I.YAW, C.side * 0.3 * o); A(I.JAW, 0.75 * o); A(I.EARB, o); A(I.TUP, 0.6 * o); A(I.LIFT, 0.06 * o); A(I.AIM, 0.3 * o); return; } // (the arched back, side on, hissing)
    if (s.canid) { A(I.ARCH, 0.16 * o); A(I.LIFT, 0.05 * o); A(I.TUP, 0.85 * o); A(I.JAW, 0.55 * o); A(I.EARF, o); A(I.NFWD, 0.3 * o); A(I.AIM, 0.3 * o); return; }
    // (the horned, the great: the head low, the weapons shown, the ground pawed)
    A(I.NDOWN, 0.55 * o); A(I.HYAW, osc(u, 0.4) * 0.3 * o); A(I.EARB, 0.4 * o); A(I.TUP, 0.4 * o);
    with_(o, () => { const q = u * hz(1.5); Lg(sideLeg(true, C.side), 0.25 - 0.35 * Math.sin(q), 0.1 * Math.max(0, Math.cos(q)), 0.7, 0.2); });
  } });
  def('submit', { in: 0.3, out: 0.5, still: 1, quad(u, d) {
    const s = S(); A(I.EARB, 1); A(I.TTUCK, 1);
    if (s.canid) { M.lieDown(0.7); A(I.ROLL, C.side * 0.95); A(I.GROUND, 0.6); A(I.NDOWN, 0.35); A(I.NYAW, -C.side * 0.4); A(I.THRASH, 0.1); return; } // (rolled over, the belly shown)
    if (s.cat || s.bear) { A(I.DROP, 0.95); A(I.NDOWN, 0.55); return; }
    if (s.monkey) { A(I.SIT, 0.8); A(I.NDOWN, 0.6); return; }
    A(I.NDOWN, 0.6); A(I.HYAW, -C.side * 0.4); A(I.DROP, 0.15); A(I.EARD, 0.5);
  } });
  def('dominate', { in: 0.35, out: 0.5, still: 0.6, quad() { A(I.LIFT, 0.05); A(I.NUP, 0.45); A(I.TUP, 0.85); A(I.EARF, 0.8); A(I.AIM, 0.45); A(I.ARCH, 0.05); } });
  def('mark', { in: 0.35, out: 0.45, still: 1, quad(u, d) {
    const s = S(), sd = C.side, f = fr(u, d, 3), o = d > 0 ? bell(f, 0.05, 0.3, 0.9) : 1;
    if (s.canid) { if (C.sx > 0.5) with_(o, () => { const k = sideLeg(false, sd); Lg(k, -0.15, 0.62, -1.2, 0.3); Ab(k, 0.7); }); else { with_(o, () => { for (const k of HIND) Lg(k, 0.25, 0.05, -2.0, 0); }); A(I.PITCH, -0.12 * o); } A(I.TUP, 0.5); return; }
    if (s.cat) { if (G.hash(C.id * 17) < 0.5) { A(I.TUP, 1.2 * o); A(I.TWAG, 0.8 * o); A(I.KICKP, 0.12 * o); } else { A(I.NYAW, sd * 0.4); A(I.HROLL, sd * 0.6 * Math.sin(u * hz(0.8))); A(I.EYE, 0.6); } return; } // (the spray, the tail up and quivering — or the cheek rubbed)
    if (s.bear) { A(I.REAR, 0.85 * o); A(I.LAT, sd * 0.3 * Math.sin(u * hz(0.7))); A(I.ROLL, sd * 0.15 * o); A(I.EYE, 0.5); for (const k of FRONT) with_(o, () => Lg(k, 0.25, 0.9, 1.2, 0.4)); return; } // (the back rubbed on a tree)
    if (s.antler) { A(I.NDOWN, 0.5 * o); A(I.HYAW, Math.sin(u * hz(1.4)) * 0.5 * o); A(I.HROLL, Math.sin(u * hz(1.4) - 0.5) * 0.4 * o); return; } // (the antlers thrashed on the bush)
    if (s.rhino || s.hippo) { for (const k of HIND) { const q = u * hz(2) + k * Math.PI; Lg(k, -0.25 + 0.2 * Math.sin(q), 0.1 * Math.max(0, Math.cos(q)), -0.6, 0.3); } A(I.TWAG, s.hippo ? 1.5 : 0.3); return; } // (the dung kicked about, the tail paddling)
    A(I.ROLL, sd * 0.25 * Math.sin(u * hz(0.5))); A(I.NDOWN, 0.3);
  } });
  def('paw', { in: 0.25, out: 0.35, still: 0.9, quad(u) {
    const q = u * hz(1.6); A(I.NDOWN, S().cat ? 0.1 : 0.45); A(I.EARB, 0.4); A(I.JAW, 0.08 * Math.max(0, Math.sin(q * 0.5)));
    with_(1, () => Lg(sideLeg(true, C.side), 0.3 - 0.45 * Math.sin(q), 0.04 + 0.14 * Math.max(0, Math.cos(q)), 1.0, 0.3));
  } });
  def('mourn', { in: 1.2, out: 1.0, still: 1, quad(u) {
    const s = S(); A(I.EARD, 0.8); A(I.EYE, 0.25);
    if (s.eleph) { A(I.NDOWN, 0.5); A(I.TRDN, 0.9); A(I.TRFWD, 0.6); A(I.AIM, 0.35); A(I.ROLL, 0.04 * osc(u, 0.12)); A(I.TRCURL, 0.25 * osc(u, 0.2)); return; }
    if (s.monkey) { A(I.SIT, 1); A(I.NDOWN, 0.7); return; }
    if (s.canid) { M.lieDown(1); A(I.NDOWN, 0.75); return; }
    A(I.NDOWN, 0.55); A(I.AIM, 0.3);
  } });
  def('carryyoung', { in: 0.4, out: 0.4, quad() { A(I.NUP, 0.1); A(I.JAW, 0.25); A(I.HPITCH, 0.15); A(I.EARD, 0.2); } });
  def('huddle', { in: 0.8, out: 0.6, still: 1, quad(u) {
    const s = S(); if (s.canid || s.cat) { M.lieDown(1); A(I.YAW, C.side * 0.6); A(I.NDOWN, 0.85); A(I.NYAW, C.side * 0.6); A(I.EYE, 0.5); A(I.TSIDE, C.side); return; }
    A(I.DROP, 0.25); A(I.NDOWN, 0.5); A(I.SHIV, 0.3); A(I.EARB, 0.5); A(I.TTUCK, 0.6);
  } });
  // ---------------- the fight and the hunt ----------------
  def('threat', { in: 0.2, out: 0.5, still: 0.7, quad(u) {
    const s = S(); A(I.AIM, 0.3);
    if (s.canid) { A(I.DROP, 0.3); A(I.NFWD, 0.7); A(I.NUP, -0.12); A(I.JAW, 0.62); A(I.EARB, 0.7); A(I.ARCH, 0.13); A(I.TUP, 0.6); return; } // (the snarl: the head low and out, the hackles up)
    if (s.cat) { A(I.DROP, 0.55); A(I.JAW, 0.95); A(I.EARB, 1); A(I.NFWD, 0.4); A(I.TLASH, 1); with_(0.45, () => Lg(sideLeg(true, C.side), 0.25, 0.22, 1.3, 0)); return; } // (the hiss, a paw ready)
    if (s.bear) { A(I.NDOWN, 0.35); A(I.JAW, 0.55 + 0.25 * Math.max(0, Math.sin(u * hz(1.8)))); A(I.HYAW, osc(u, 0.6) * 0.3); A(I.EARB, 1); A(I.DROP, 0.1); return; }
    if (s.hippo) { A(I.JAW, 1.3); A(I.NUP, 0.85); return; }
    if (s.monkey) { A(I.JAW, 0.95); A(I.NUP, 0.2); A(I.HPITCH, 0.2 * Math.sin(u * hz(2))); A(I.EARB, 0.8); A(I.REAR, 0.15); return; }
    A(I.NDOWN, 0.45); A(I.JAW, s.swine ? 0.4 : 0.1); A(I.EARF, 0.8); A(I.HYAW, osc(u, 0.5) * 0.15);
  } });
  def('charge', { in: 0.2, out: 0.5, quad() { const s = S(); A(I.NDOWN, s.eleph ? 0.15 : 0.55); A(I.NFWD, 0.4); A(I.EARB, s.eleph ? 0 : 0.8); A(I.EARO, s.eleph ? 1.1 : 0); A(I.TRCURL, s.eleph ? 1 : 0); A(I.TUP, 0.75); A(I.JAW, s.bear ? 0.5 : 0); } });
  def('clash', { in: 0.15, out: 0.4, still: 0.6, body: 1, eff: 'brow', quad(u, d) {
    const s = S(), f = fr(u, d, 2.2), j = bell(f, 0.1, 0.17, 0.35);
    const up = (C.kind === 'ibex' || C.kind === 'cabra' || C.kind === 'ovelha') ? bell(f, 0, 0.1, 0.2) : 0; // (the goats rear and drop onto it)
    A(I.REAR, up * 0.9); A(I.NDOWN, 0.55 * (1 - up)); A(I.HPITCH, 0.4); A(I.FWD, -0.07 * j + 0.02 * Math.sin(u * hz(1.3))); A(I.DROP, 0.25); A(I.AIM, 0.55 * (1 - up)); A(I.EARB, 0.6); A(I.TUP, 0.3);
    for (const k of HIND) Lg(k, -0.3, 0, 0, 0); for (const k of FRONT) Lg(k, 0.12, 0, 0, 0);
    if (s.eleph) { A(I.TRCURL, 0.8); A(I.EARO, 0.6); }
  } });
  def('neck', { in: 0.4, out: 0.5, still: 0.8, quad(u) { const q = Math.sin(u * hz(0.45)); A(I.NYAW, q * 1.05); A(I.NDOWN, 0.12 + 0.12 * Math.abs(q)); A(I.ROLL, -q * 0.07); A(I.HYAW, q * 0.3); for (let k = 0; k < 4; k++) Ab(k, 0.2); } });
  def('spar', { in: 0.3, out: 0.5, still: 0.7, quad(u) {
    const s = S(), q = u * hz(1.9); A(I.EARB, 1); A(I.AIM, 0.45);
    if (s.eleph) { A(I.NDOWN, 0.2); A(I.TRUP, 0.4); A(I.TRFWD, 0.8); A(I.FWD, 0.04 * Math.sin(u * hz(0.6))); A(I.EARO, 0.6); A(I.AIM, 0.3); return; } // (the trunks wrestling, the heads pushing)
    const rr = s.equid ? 0.85 : s.bear ? 1 : s.cat ? 0.75 : s.canid ? 0.62 : 0.6; A(I.REAR, rr); A(I.JAW, 0.3 + 0.4 * Math.abs(Math.sin(q * 0.5)));
    for (const k of FRONT) { const p = q + k * Math.PI;
      if (s.equid) Lg(k, 0.5, 0.62 + 0.22 * Math.sin(p), 1.5 + 0.5 * Math.sin(p), -0.5);
      else if (s.canid) Lg(k, 0.62, 0.52, 1.2, 0.3);
      else Lg(k, 0.4 + 0.28 * Math.sin(p), 0.9 + 0.1 * Math.cos(p), 0.8, 0.2); }
  } });
  def('bite', { in: 0.06, out: 0.25, body: 1, quad(u, d) {
    const f = fr(u, d, 0.5), lunge = bell(f, 0, 0.45, 1); A(I.JAW, 1.0 * bell(f, 0, 0.3, 0.5)); A(I.FWD, 0.08 * lunge); A(I.NFWD, 0.55 * lunge); A(I.AIM, 0.9 * lunge); A(I.EARB, 1); A(I.DROP, 0.15 * lunge);
  } });
  def('grip', { in: 0.15, out: 0.4, still: 0.6, body: 1, quad(u) {
    const pull = 0.5 + 0.5 * Math.sin(u * hz(0.9)); A(I.JAW, 0.35); A(I.AIM, 1); A(I.DROP, 0.1); A(I.FWD, -0.06 * pull); A(I.HYAW, Math.sin(u * hz(1.7)) * 0.2); A(I.EARB, 1); A(I.TLASH, 0.6);
    for (const k of HIND) Lg(k, -0.25, 0, 0, 0); for (const k of FRONT) Lg(k, 0.22, 0, 0, 0);
  } });
  def('throat', { in: 0.25, out: 0.5, still: 1, body: 1, quad(u) {
    const sd = C.aimSide || C.side; A(I.AIM, 1); A(I.JAW, 0.4); A(I.DROP, 0.15); A(I.EARB, 0.8); A(I.TLASH, 0.45); A(I.BREATH, 1.2); A(I.NYAW, 0.04 * Math.sin(u * hz(0.3)));
    with_(1, () => { Lg(sideLeg(true, sd), 0.6, 0.38, 1.4, 0.3); Lg(sideLeg(true, -sd), 0.4, 0, 0, 0); }); // (a foreleg over the prey's shoulder, the other braced)
    for (const k of HIND) { Lg(k, -0.22, 0, 0, 0); Ab(k, 0.14); }
  } });
  def('nape', { in: 0.25, out: 0.5, still: 1, body: 1, quad(u) {
    A(I.AIM, 1); A(I.JAW, 0.4); A(I.FWD, 0.12); A(I.EARB, 1); A(I.TLASH, 0.5); A(I.BREATH, 1);
    for (const k of FRONT) { Lg(k, 0.65, 0.28, 1.6, 0.4); Ab(k, 0.25); } for (const k of HIND) Lg(k, -0.1, 0, 0, 0); // (the forelegs clasped round the prey, the hind ones planted)
  } });
  def('shakekill', { in: 0.1, out: 0.35, still: 1, quad(u, d) {
    const f = fr(u, d, 1.6), a = bell(f, 0, 0.1, 1), q = u * hz(4.8);
    A(I.HYAW, Math.sin(q) * 0.45 * a); A(I.NYAW, Math.sin(q - 0.6) * 0.6 * a); A(I.ROLL, Math.sin(q - 1) * 0.08 * a); A(I.JAW, 0.3); A(I.NUP, 0.2); A(I.EARB, 1);
    for (let k = 0; k < 4; k++) Ab(k, 0.12);
  } });
  def('swipe', { in: 0.05, out: 0.3, quad(u, d) {
    const f = fr(u, d, 0.6), r = bell(f, 0, 0.3, 0.45), s = bell(f, 0.3, 0.42, 0.75), k = sideLeg(true, C.side);
    with_(Math.max(r, s), () => { Lg(k, 0.35 + 0.6 * s, 0.55 * r + 0.32 * s, 1.6 * r + 0.2 * s, -0.4); Ab(k, 0.3 * s); });
    A(I.REAR, 0.22 * r); A(I.NYAW, -C.side * 0.2 * s); A(I.JAW, 0.7); A(I.EARB, 1); A(I.FWD, 0.05 * s); A(I.AIM, 0.3);
  } });
  def('maul', { in: 0.2, out: 0.5, still: 1, body: 1, quad(u) {
    const q = u * hz(1.2); A(I.REAR, 0.3 * (0.5 + 0.5 * Math.sin(q))); A(I.AIM, 0.7); A(I.JAW, 0.7 * Math.abs(Math.sin(u * hz(1.5)))); A(I.NDOWN, 0.4); A(I.EARB, 1); A(I.PITCH, 0.05 * Math.sin(q));
    for (const k of FRONT) Lg(k, 0.55, 0.32 * Math.max(0, Math.sin(q + k * Math.PI)) + 0.06, 1.2, 0.3);
  } });
  def('kick', { in: 0.05, out: 0.3, quad(u, d) {
    const s = S(), f = fr(u, d, 0.7), both = (Math.abs(C.var) | 0) % 2 === 0;
    if (C.kind === 'moose' || C.kind === 'deer' || C.kind === 'reindeer' || C.kind === 'gazelle') M.foreStrike(f, both, C.side, 0.35); // (the deer strike with their forefeet)
    else M.hindKick(f, both || s.equid, C.side);
  } });
  def('stomp', { in: 0.08, out: 0.3, quad(u, d) {
    const s = S(), f = fr(u, d, 1);
    if (s.eleph || s.rhino) { const r = bell(f, 0, 0.45, 0.6), k = sideLeg(true, C.side); with_(r, () => Lg(k, 0.25, 0.7, 2.0, 0)); A(I.REAR, 0.15 * r); A(I.EARO, s.eleph ? 0.8 : 0); A(I.TRUP, s.eleph ? 0.7 * r : 0); return; }
    M.foreStrike(f, true, C.side, 0.32); A(I.EARB, 1); A(I.AIM, 0.2);
  } });
  def('gore', { in: 0.06, out: 0.3, quad(u, d) {
    const s = S(), f = fr(u, d, 0.9), dip = bell(f, 0, 0.3, 0.45), hook = bell(f, 0.3, 0.5, 0.85);
    A(I.NDOWN, 0.7 * dip); A(I.HPITCH, 0.4 * dip - 0.5 * hook); A(I.NUP, 0.9 * hook); A(I.HYAW, C.side * 0.3 * hook); A(I.FWD, 0.1 * bell(f, 0.1, 0.4, 0.8)); A(I.AIM, 0.5 * dip); A(I.EARB, 1); A(I.TUP, 0.5);
    if (s.eleph) { A(I.TRCURL, 1); A(I.EARO, 1); }
    if (s.swine) { A(I.HYAW, C.side * 0.4 * hook); A(I.HROLL, C.side * 0.4 * hook); }
  } });
  def('toss', { in: 0.06, out: 0.35, quad(u, d) {
    const s = S(), f = fr(u, d, 1.2), dip = bell(f, 0, 0.2, 0.35), hook = bell(f, 0.25, 0.5, 0.9);
    A(I.NDOWN, 0.75 * dip); A(I.HPITCH, 0.4 * dip - 0.7 * hook); A(I.NUP, 1.4 * hook); A(I.REAR, 0.25 * hook); A(I.FWD, 0.08 * dip); A(I.EARB, 1); A(I.TRUP, s.eleph ? 1.3 * hook : 0); A(I.TRCURL, s.eleph ? 0.6 * dip : 0);
  } });
  def('buck', { in: 0.08, out: 0.3, still: 0.3, quad(u) {
    const c = (u * 1.7) % 1, kq = bell(c, 0.15, 0.45, 0.85); A(I.KICKP, kq); A(I.LIFT, 0.25 * bell(c, 0, 0.25, 0.55)); A(I.NDOWN, 0.6); A(I.ARCH, 0.25); A(I.EARB, 1); A(I.TUP, 0.8);
    with_(kq, () => { for (const k of HIND) Lg(k, -0.8, 0.5, -0.3, 0.8); });
  } });
  def('pin', { in: 0.25, out: 0.5, still: 1, body: 1, quad(u) {
    A(I.DROP, 0.3); A(I.FWD, 0.1); A(I.AIM, 1); A(I.JAW, 0.4); A(I.EARB, 1); A(I.TLASH, 0.5);
    for (const k of FRONT) { Lg(k, 0.72, 0.22, 1.0, 0.4); Ab(k, 0.15); } // (the forepaws pressing it down)
  } });
  // (held: reading the one that holds it — on its side under a nape bite, a pin, the talons, the death roll, the coils; on its
  // feet in a throat hold or a grip, stamping, twisting, the head tossing, leaning away)
  const DOWNHOLD = { nape: 1, pin: 1, maul: 1, talons: 1, mantle: 1, deathroll: 1, coil: 1, swallow: 1 };
  def('struggle', { in: 0.15, out: 0.5, still: 0.8, quad(u) {
    const s = S(), sd = C.side, down = C.down > 0 || DOWNHOLD[C.held] || (Math.abs(C.var) | 0) === 1;
    A(I.EARB, 1); A(I.JAW, 0.35 + 0.3 * Math.abs(Math.sin(u * hz(1.3)))); A(I.BRATE, 2); A(I.TUP, 0.4);
    if (C.held === 'coil') { M.sideDown(1, sd); A(I.THRASH, 0.25); A(I.SHIV, 1); A(I.NUP, 0.3 * Math.abs(Math.sin(u * hz(0.4)))); return; } // (crushed: only the head and a shiver)
    if (C.held === 'deathroll') { M.sideDown(1, sd); A(I.ROLL, Math.sin(C.rollWith) * 0.7); A(I.THRASH, 0.9); return; } // (dragged over on its side, rocked over and back as the crocodile turns)
    if (down) { M.sideDown(1, sd); A(I.THRASH, 1); A(I.NUP, 0.45 * Math.abs(Math.sin(u * hz(0.8)))); A(I.NYAW, sd * 0.4 * Math.sin(u * hz(0.6))); return; }
    A(I.DROP, 0.2); A(I.ROLL, 0.14 * Math.sin(u * hz(1.3))); A(I.HYAW, 0.5 * Math.sin(u * hz(1.1))); A(I.NUP, 0.35 * Math.abs(Math.sin(u * hz(0.9)))); A(I.LAT, -C.aimSide * 0.25);
    for (let k = 0; k < 4; k++) { const q = Math.max(0, Math.sin(u * hz(2.3) + k * 1.7)); Lg(k, 0.05 * Math.sin(u * hz(2.3) + k), 0.16 * q, k < 2 ? 1.1 * q : -0.9 * q, 0); } // (stamping, kicking out)
    if (s.equid || s.kicker) with_(bell((u * 0.6) % 1, 0.3, 0.5, 0.7), () => { for (const k of HIND) Lg(k, -0.7, 0.4, -0.2, 0.7); A(I.KICKP, 0.6); });
  } });
  def('stagger', { in: 0.05, out: 0.4, quad(u, d) {
    const f = fr(u, d, 0.8), s = bell(f, 0, 0.25, 0.9), sd = C.side;
    A(I.ROLL, sd * 0.35 * s); A(I.DROP, 0.4 * s); A(I.NDOWN, 0.4 * s); A(I.NYAW, -sd * 0.3 * s); A(I.EARB, 1); A(I.HROLL, sd * 0.3 * s); A(I.LAT, sd * 0.2 * s);
    with_(s, () => Lg(sideLeg(true, sd), -0.1, 0.12, 1.7, 0.5)); // (a foreleg buckling)
  } });
  def('fall', { in: 0.05, out: 0.6, still: 1, keep: 1, quad(u, d) {
    const f = fr(u, d, 0.9), g = ramp(f, 0.12, 0.85), sd = C.side;
    A(I.DROP, 0.6 * bell(f, 0, 0.3, 0.7)); M.sideDown(g, sd); A(I.THRASH, 0.55 * bell(f, 0.3, 0.6, 1)); A(I.EARB, 1); A(I.JAW, 0.45); A(I.NUP, -0.25 * g);
    with_(1 - g, () => Lg(sideLeg(true, sd), -0.15, 0.15, 1.9, 0.5));
  } });
  def('rise', { in: 0.05, out: 0.4, still: 1, quad(u, d) {
    const f = fr(u, d, 1.2), sd = C.side, side = 1 - ramp(f, 0, 0.42), ch = bell(f, 0.15, 0.42, 0.9);
    M.sideDown(side, sd); M.lieDown(ch * (1 - side)); A(I.NUP, 0.45 * ch); A(I.EARF, 0.5); A(I.KICKP, S().equid ? 0 : 0.35 * bell(f, 0.45, 0.65, 0.9));
  } });
  def('throes', { in: 0.15, out: 0.8, still: 1, keep: 1, quad(u, d) {
    const f = fr(u, d, 3), sd = C.side, fade = 1 - 0.75 * f;
    M.sideDown(1, sd); A(I.THRASH, 0.95 * fade); A(I.ARCH, -0.2 * Math.max(0, Math.sin(u * hz(0.5)))); A(I.HPITCH, -0.4 * fade); A(I.NUP, 0.5 * Math.max(0, Math.sin(u * hz(0.45))) * fade);
    A(I.JAW, 0.6 * Math.abs(Math.sin(u * hz(0.7)))); A(I.EARB, 1); A(I.EYE, 0.5 * f); A(I.BRATE, 1.5 * fade);
  } });
  // ---------------- the escape ----------------
  def('jink', { in: 0.04, out: 0.25, quad(u, d) {
    const f = fr(u, d, 0.5), c = bell(f, 0, 0.25, 0.9), sd = C.side;
    A(I.ROLL, sd * 0.45 * c); A(I.YAW, sd * 0.5 * c); A(I.NYAW, sd * 0.5 * c); A(I.LAT, -sd * 0.25 * c); A(I.EARB, 1); A(I.TUP, 0.8); Ab(sideLeg(true, -sd), 0.4 * c);
  } });
  def('hide', { in: 0.4, out: 0.5, still: 1, quad() {
    const s = S(); A(I.EARB, 1); A(I.TTUCK, 1);
    if (s.cat) { A(I.DROP, 1.05); A(I.NFWD, 0.5); A(I.NUP, -0.15); return; }
    M.lieDown(1); A(I.DROP, 0.2); A(I.NDOWN, 1.15); A(I.NFWD, 0.6); // (flat, the neck along the ground)
  } });
  def('burrow', { in: 0.15, out: 0.3, still: 0.5, quad(u, d) { const f = fr(u, d, 1.2); A(I.DROP, ramp(f, 0, 0.35)); A(I.NDOWN, 0.95); A(I.NFWD, 0.5); A(I.LIFT, -0.9 * ramp(f, 0.3, 1)); A(I.FWD, 0.2 * f); A(I.EARB, 1); A(I.PITCH, 0.25 * ramp(f, 0.2, 0.6)); } });
  def('dive', { in: 0.08, out: 0.3, still: 0.5, quad(u, d) {
    const f = fr(u, d, 1); A(I.PITCH, 0.65 * ramp(f, 0, 0.55)); A(I.LIFT, 0.3 * bell(f, 0, 0.3, 0.6) - 1.0 * ramp(f, 0.5, 1)); A(I.EARB, 1); A(I.NFWD, 0.4);
    for (const k of FRONT) Lg(k, 0.75, 0.35, 0.2, -0.5); for (const k of HIND) Lg(k, -0.75, 0.3, -0.2, 0.7);
  } });
  def('swim', { in: 0.5, out: 0.6, still: 1, quad(u) {
    const s = S(), q = u * hz(s.otter || s.beaver ? 2.2 : 1.4); A(I.SWIM, 1); A(I.LIFT, s.hippo ? -0.7 : -0.55); A(I.NUP, 0.55); A(I.HPITCH, -0.3); A(I.EARB, 0.3); A(I.TUP, 0.35); A(I.TRUP, s.eleph ? 1.0 : 0);
    for (const k of FRONT) { const p = q + k * Math.PI; Lg(k, 0.3 + 0.3 * Math.sin(p), 0.4 + 0.22 * Math.cos(p), 1.1 + 0.6 * Math.sin(p), 0.2); } // (the dog's paddle)
    for (const k of HIND) { const p = q + k * Math.PI + 1.2; Lg(k, -0.4 - 0.25 * Math.sin(p), 0.3 + 0.1 * Math.cos(p), -0.8, 0.5); }
  } });
  def('wade', { in: 0.5, out: 0.5, quad(u) { A(I.NDOWN, 0.35); A(I.HPITCH, 0.2); A(I.TUP, 0.15); A(I.EARF, 0.3); A(I.TRDN, S().eleph ? 0.5 : 0); } });
  def('shelter', { in: 0.8, out: 0.6, still: 1, quad() {
    const s = S(); if (s.canid || s.cat || s.rabbit || s.small) { REC_.curl.quad(0); return; }
    A(I.DROP, 0.3); A(I.NDOWN, 0.45); A(I.EARB, 0.8); A(I.TTUCK, 0.8); A(I.SHIV, 0.3); A(I.EYE, 0.4);
  } });
  def('shiver', { in: 0.4, out: 0.5, any() { A(I.SHIV, 1); A(I.DROP, 0.15); A(I.EARB, 0.5); A(I.TTUCK, 0.7); A(I.NDOWN, 0.2); A(I.WFOLD, 0.5); } });
  def('curl', { in: 0.9, out: 0.8, still: 1, quad() { M.lieDown(1); const sd = C.side; A(I.YAW, sd * 1.1); A(I.NYAW, sd * 1.35); A(I.NDOWN, 0.95); A(I.TSIDE, sd * 1.6); A(I.EYE, 0.85); A(I.EARD, 0.6); A(I.HROLL, sd * 0.4); } });
  def('spray', { in: 0.3, out: 0.5, still: 0.8, quad(u) { const c = (u % 3) / 3; A(I.TRDN, 1.1 * bell(c, 0, 0.2, 0.45)); A(I.NDOWN, 0.3 * bell(c, 0, 0.2, 0.45)); A(I.TRUP, 1.45 * bell(c, 0.4, 0.65, 0.95)); A(I.TRCURL, 0.6 * bell(c, 0.5, 0.7, 0.95)); A(I.NUP, 0.3 * bell(c, 0.4, 0.65, 0.95)); A(I.EARO, 0.3); } });
  def('splash', { in: 0.6, out: 0.6, still: 1, quad(u) {
    const s = S();
    if (s.eleph) { REC_.spray.quad(u); M.lieDown(0.4); return; }
    if (s.hippo) { A(I.ROLL, C.side * 0.6 * Math.sin(u * hz(0.25))); A(I.LIFT, -0.35); A(I.JAW, 0.3 * Math.max(0, osc(u, 0.3))); return; }
    M.lieDown(1); A(I.ROLL, 0.25 * Math.sin(u * hz(0.3))); A(I.NUP, 0.25); with_(Math.max(0, osc(u, 0.4)), () => Lg(0, 0.7, 0.25, 1.0, 0)); A(I.EYE, 0.3);
  } });
  def('curious', { in: 0.4, out: 0.5, still: 0.6, quad(u) {
    const b = bell((u % 3) / 3, 0.2, 0.45, 0.8); A(I.NFWD, 0.45); A(I.HROLL, 0.25 * Math.sin(u * hz(0.4))); A(I.EARF, 1); A(I.AIM, 0.35); A(I.DROP, 0.1); A(I.TRFWD, S().eleph ? 0.6 : 0);
    with_(0.7 * b, () => Lg(sideLeg(true, C.side), 0.12, 0.18, 1.4, 0)); // (a forefoot lifted, unsure)
  } });
  def('mob', { in: 0.2, out: 0.4, quad(u) {
    const s = S(); if (s.eleph) { A(I.EARO, 1.1); A(I.TRUP, 0.6); A(I.NUP, 0.5); return; }
    if (s.monkey) { A(I.REAR, 0.35); A(I.JAW, 0.9); A(I.LIFT, 0.12 * Math.abs(osc(u, 1.5))); return; }
    A(I.NUP, 0.45); A(I.HPITCH, -0.2); A(I.EARF, 0.6); A(I.TUP, 0.6); A(I.HYAW, osc(u, 0.7) * 0.25);
  } });
  const REC_ = FG.REC;

  // ================================ the birds ================================
  // (on its side: the wings beating, the legs kicking — the bird held, dying)
  const bSide = (w, sd) => { with_(w, () => { A(I.ROLL, sd * 1.3); A(I.GROUND, 1); A(I.LIE, 0.6); }); };
  def('sleep', { bird(u) { const s = S(); A(I.EYE, 1); A(I.LIE, s.wader || s.penguin ? 0 : 0.85); A(I.NYAW, C.side * 2.6); A(I.NDOWN, 0.3); A(I.HPITCH, 0.3); A(I.SHIV, 0); A(I.BREATH, 0.5);
    if (s.wader) A(I.LEGF, 0); if (s.penguin) { A(I.NYAW, -C.side * 2.3); A(I.NDOWN, 0.6); } } }); // (the head turned back into the wing)
  def('alert', { bird() { A(I.NUP, 0.55); A(I.HPITCH, -0.1); A(I.AIM, 0.25); A(I.WFOLD, 0.3); } });
  def('stare', { bird() { A(I.NFWD, 0.35); A(I.AIM, 0.35); A(I.HROLL, 0.15 * C.side); } });
  def('startle', { bird(u, d) { const f = fr(u, d, 0.7), j = bell(f, 0, 0.1, 0.6); A(I.LIFT, 0.25 * bell(f, 0, 0.12, 0.4)); A(I.WOPEN, 0.9 * j); A(I.WFLAP, 0.5 * j); A(I.NUP, 0.5 * j); } });
  def('call', { bird(u, d) { const f = fr(u, d, 1.8), o = bell(f, 0, 0.25, 0.6) + 0.6 * bell(f, 0.55, 0.75, 0.95); A(I.NUP, 0.6 * o); A(I.HPITCH, -0.45 * o); A(I.JAW, 0.85 * o); A(I.WLIFT, C.kind === 'galinha' && C.sx > 0.5 ? 0.6 * o : 0); } }); // (the cock's crow: the head thrown up, the wings lifted)
  def('drink', { bird(u) { const c = (u % 2.2) / 2.2, dip = bell(c, 0, 0.3, 0.55), tip = bell(c, 0.5, 0.7, 0.95); A(I.NDOWN, 1.1 * dip); A(I.NUP, 0.6 * tip); A(I.HPITCH, -0.7 * tip); A(I.JAW, 0.15 * dip); } }); // (the beak dipped, then the head tipped back to swallow)
  def('tear', { bird(u) { const c = (u * 0.9) % 1, pull = bell(c, 0.15, 0.4, 0.7); A(I.NDOWN, 1.0 - 0.6 * pull); A(I.NUP, 0.35 * pull); A(I.HYAW, C.side * 0.3 * pull); A(I.JAW, 0.3 + 0.4 * (1 - pull)); A(I.AIM, 0.6 * (1 - pull)); A(I.LEGF, 0.45); A(I.WLIFT, 0.25); A(I.DROP, 0.4); } }); // (a foot on the meat, the beak pulling up)
  def('peck', { bird(u) { const p = Math.max(0, Math.sin(u * hz(1.1) + C.id)); A(I.NDOWN, 1.05 * p); A(I.JAW, 0.2 * p); } });
  def('dig', { bird(u) { const q = Math.sin(u * hz(2.2)); A(I.LEGF, 0.45 * Math.max(0, q)); A(I.NDOWN, 0.6 + 0.4 * Math.max(0, -q)); A(I.DROP, 0.25); } }); // (the hen scratches back, and pecks)
  def('fish', { bird(u) { const c = (u % 3) / 3, st = bell(c, 0.7, 0.78, 0.95), coil = 1 - st; A(I.NDOWN, 0.4 + 0.9 * st); A(I.NFWD, 0.4 * st); A(I.NUP, -0.3 * coil); A(I.JAW, st * 0.8); A(I.HPITCH, 0.3); A(I.DROP, 0.2 * coil); } }); // (the neck drawn back, the strike)
  def('carry', { bird() { A(I.JAW, 0.3); A(I.NUP, 0.15); } });
  def('swallow', { bird(u) { const p = Math.abs(Math.sin(u * hz(1.4))); A(I.NUP, 0.9); A(I.HPITCH, -0.8); A(I.JAW, 0.5 + 0.3 * p); SC_(B_().neck1, 1 + 0.15 * p); } }); // (the head thrown back, the prey down the throat)
  def('preen', { bird(u) { const sd = C.side; A(I.NYAW, sd * 1.9); A(I.NDOWN, 0.4); A(I.HROLL, sd * 0.4); A(I.JAW, 0.15 * Math.max(0, Math.sin(u * hz(3)))); A(I.WOPEN, 0.35); A(I.HYAW, 0.15 * Math.sin(u * hz(1.4))); } });
  def('pant', { bird() { A(I.JAW, 0.8); A(I.WOPEN, 0.35); A(I.PANT, 1); } }); // (the beak open, the wings held off the body)
  def('mate', { bird(u) { if (C.sx > 0.5) { A(I.LIFT, 0.5); A(I.WFLAP, 0.6); A(I.WOPEN, 0.6); A(I.AIM, 0.5); A(I.FWD, 0.15); } else { A(I.LIE, 0.8); A(I.NDOWN, 0.2); A(I.WOPEN, 0.3); } } });
  def('court', { bird(u) { const s = S();
    if (C.kind === 'peru') { A(I.TFAN, 1); A(I.WOPEN, 0.5); A(I.WFOLD, 0); A(I.NUP, -0.25); A(I.HPITCH, 0.4); return; } // (the fan, the wings dragged)
    if (s.ostrich) { A(I.LIE, 0.7); A(I.WOPEN, 1); A(I.WFLAP, 0.4); A(I.NYAW, Math.sin(u * hz(0.6)) * 0.8); return; } // (down on its knees, the wings fanned, the neck swaying)
    A(I.NUP, 0.4); A(I.WOPEN, 0.45); A(I.TFAN, 0.5); A(I.LIFT, 0.12 * Math.abs(Math.sin(u * hz(1.2)))); A(I.HROLL, 0.2 * Math.sin(u * hz(0.8))); } });
  def('display', { bird(u, d) { const s = S(), f = fr(u, d, 3), o = d > 0 ? bell(f, 0, 0.2, 0.9) : 1;
    if (C.kind === 'peru') { A(I.TFAN, o); A(I.WOPEN, 0.5 * o); return; }
    A(I.WOPEN, 1.1 * o); A(I.WLIFT, 0.5 * o); A(I.NFWD, 0.5 * o); A(I.JAW, 0.7 * o); A(I.NUP, s.ostrich ? -0.3 * o : 0); A(I.AIM, 0.3 * o); } });
  def('kick', { bird(u, d) { const f = fr(u, d, 0.7); A(I.LEGF, bell(f, 0.1, 0.4, 0.8)); A(I.PITCH, -0.12 * bell(f, 0.1, 0.4, 0.8)); A(I.WOPEN, 0.5); A(I.NUP, 0.3); } }); // (the ostrich's kick, forward and down)
  def('stomp', { bird(u, d) { const f = fr(u, d, 1); A(I.LEGF, bell(f, 0, 0.35, 0.55) * 0.9); A(I.WOPEN, 0.5); A(I.NDOWN, 0.3 * bell(f, 0.4, 0.6, 0.9)); } });
  def('charge', { bird() { A(I.NFWD, 0.6); A(I.NDOWN, 0.3); A(I.WOPEN, 0.7); A(I.JAW, 0.5); } });
  def('jink', { bird(u, d) { const f = fr(u, d, 0.5), c = bell(f, 0, 0.25, 0.9); A(I.ROLL, C.side * 0.35 * c); A(I.NYAW, C.side * 0.5 * c); A(I.WOPEN, 0.8 * c); } });
  def('strike', { bird(u, d) { const f = fr(u, d, 0.5), st = bell(f, 0.2, 0.45, 0.9); A(I.NUP, -0.4 * (1 - st)); A(I.NDOWN, 1.0 * st); A(I.NFWD, 0.6 * st); A(I.JAW, 0.6 * st); A(I.AIM, 0.6 * st); } });
  // (the stoop: the wings folded back, the body pitched down; the talons thrown forward at the end)
  def('stoop', { in: 0.25, out: 0.3, wing: 1, bird(u) { A(I.WFOLD, 0.92); A(I.PITCH, 0.85); A(I.LEGF, ramp(u, 0.6, 1.2)); A(I.NUP, -0.3); A(I.EYE, 0); } });
  def('talons', { in: 0.15, out: 0.4, still: 1, wing: 1, bird(u) { const c = (u * 0.8) % 1, pull = bell(c, 0.2, 0.45, 0.75);
    A(I.LEGF, 0.5); A(I.WDROOP, 0.55); A(I.WFLAP, 0.25 * Math.max(0, Math.sin(u * hz(0.7)))); A(I.NDOWN, 0.9 - 0.5 * pull); A(I.JAW, 0.35 + 0.3 * pull); A(I.AIM, 0.5); A(I.DROP, 0.35); A(I.TFAN, 0.5); } });
  def('mantle', { in: 0.4, out: 0.5, still: 1, wing: 1, bird(u) { A(I.WDROOP, 1); A(I.PITCH, 0.3); A(I.NDOWN, 0.25); A(I.NFWD, 0.3); A(I.HYAW, osc(u, 0.3) * 0.4); A(I.TFAN, 0.7); A(I.DROP, 0.5); } }); // (the wings spread down over the prey, the head up watching)
  def('mob', { bird(u) { A(I.WOPEN, 0.8); A(I.WFLAP, 0.6); A(I.JAW, 0.6 * Math.abs(Math.sin(u * hz(2)))); A(I.NFWD, 0.5); A(I.NDOWN, C.kind === 'goose' ? 0.45 : 0); } });
  def('dive', { bird(u, d) { const f = fr(u, d, 1); A(I.PITCH, 0.9 * ramp(f, 0, 0.5)); A(I.WFOLD, 0.6); A(I.LIFT, -0.5 * ramp(f, 0.4, 1)); A(I.NFWD, 0.5); } });
  def('swim', { bird(u) { const s = S(); if (s.penguin) { A(I.PITCH, 1.25); A(I.LIFT, -0.35); A(I.WFLAP, 0.6); A(I.NFWD, 0.4); return; } A(I.LIE, 0.55); A(I.LEGF, 0.25 * Math.max(0, Math.sin(u * hz(1.5)))); A(I.NUP, 0.25); } });
  def('wade', { bird(u) { A(I.NDOWN, 0.35); A(I.HPITCH, 0.35); A(I.NFWD, 0.25); } });
  def('shelter', { bird() { A(I.LIE, 0.7); A(I.NUP, -0.45); A(I.SHIV, 0.3); A(I.EYE, 0.4); A(I.WFOLD, 0.5); } });
  def('splash', { bird(u) { A(I.LIE, 0.55); A(I.WFLAP, 0.9); A(I.WOPEN, 0.5); A(I.NDOWN, 0.6 * Math.max(0, Math.sin(u * hz(1.2)))); A(I.ROLL, 0.15 * Math.sin(u * hz(2))); } });
  def('spread', { in: 0.4, out: 0.5, wing: 1, bird(u, d) { const f = fr(u, d, 4), o = d > 0 ? bell(f, 0, 0.2, 0.9) : 1; A(I.WOPEN, 1.3 * o); A(I.WLIFT, 0.3 * o); A(I.WDROOP, 0.2 * o); A(I.EYE, 0.3 * o); A(I.NUP, 0.2 * o); } });
  def('brood', { in: 0.8, out: 0.6, still: 1, bird(u) { A(I.LIE, 1); A(I.NUP, -0.25); A(I.WOPEN, 0.25); A(I.EYE, 0.4); A(I.TFAN, 0.2); } });
  def('curious', { bird(u) { A(I.NFWD, 0.4); A(I.HROLL, 0.55 * Math.sin(u * hz(0.6))); A(I.AIM, 0.3); } }); // (the head cocked one way, then the other)
  def('huddle', { bird() { A(I.LIE, S().penguin ? 0 : 0.8); A(I.NUP, -0.5); A(I.SHIV, 0.4); A(I.WFOLD, 0.6); A(I.EYE, 0.4); A(I.DROP, S().penguin ? 0.3 : 0); } });
  def('dustbath', { bird(u, d) { bSide(0.6, C.side); A(I.WFLAP, 0.8); A(I.WOPEN, 0.6); A(I.NDOWN, 0.4); A(I.EYE, 0.5); A(I.ROLL, 0.2 * Math.sin(u * hz(0.8))); } });
  def('struggle', { bird(u) { bSide(C.held === 'talons' || C.held === 'mantle' || C.down > 0 ? 1 : 0.5, C.side); A(I.THRASH, 1); A(I.WFLAP, 1); A(I.WOPEN, 0.8); A(I.JAW, 0.6); A(I.NUP, 0.4 * Math.abs(Math.sin(u * hz(1.1)))); } });
  def('stagger', { bird(u, d) { const f = fr(u, d, 0.8), s = bell(f, 0, 0.25, 0.9); A(I.ROLL, C.side * 0.4 * s); A(I.WOPEN, 0.7 * s); A(I.NDOWN, 0.3 * s); A(I.DROP, 0.4 * s); } });
  def('fall', { keep: 1, bird(u, d) { const g = ramp(fr(u, d, 0.9), 0.1, 0.85); bSide(g, C.side); A(I.WOPEN, 0.8); A(I.THRASH, 0.5 * (1 - g)); } });
  def('rise', { bird(u, d) { const f = fr(u, d, 1.2); bSide(1 - ramp(f, 0, 0.5), C.side); A(I.WOPEN, 0.9 * bell(f, 0.2, 0.5, 0.9)); A(I.WFLAP, 0.6 * bell(f, 0.2, 0.5, 0.9)); } });
  def('throes', { keep: 1, bird(u, d) { const f = fr(u, d, 3); bSide(1, C.side); A(I.THRASH, 0.9 * (1 - 0.7 * f)); A(I.WFLAP, 0.8 * (1 - f)); A(I.WOPEN, 0.7); A(I.JAW, 0.5); A(I.EYE, 0.5 * f); } });
  for (const n of ['kick', 'stomp', 'jink', 'charge', 'dig', 'fish', 'carry', 'mob', 'wade', 'splash', 'huddle', 'dustbath', 'shake', 'pant']) if (REC_[n] && !REC_[n].bird && REC_[n].any) REC_[n].bird = REC_[n].any;

  // ================================ the snakes ================================
  def('sleep', { snake() { A(I.PILE, 1); A(I.EYE, 1); A(I.BREATH, 0.4); } });
  def('bask', { snake(u) { A(I.EYE, 0.5); A(I.YAW, 0.2); } });
  def('alert', { snake() { A(I.RAISE, 0.6); A(I.AIM, 0.3); } });
  def('stare', { snake() { A(I.RAISE, 0.45); A(I.AIM, 0.4); } });
  def('startle', { snake(u, d) { const f = fr(u, d, 0.7); A(I.RAISE, 0.9 * bell(f, 0, 0.15, 0.8)); A(I.WRITHE, 0.4 * bell(f, 0, 0.1, 0.5)); } });
  def('call', { snake(u, d) { const f = fr(u, d, 1.8), o = bell(f, 0, 0.2, 0.9); A(I.RAISE, 0.5 * o); A(I.JAW, 0.6 * o); } }); // (the hiss)
  def('drink', { snake(u) { A(I.NDOWN, 0.8); A(I.JAW, 0.08 * Math.max(0, Math.sin(u * hz(2)))); } });
  def('chew', { snake(u) { A(I.JAW, 0.3 + 0.2 * Math.abs(Math.sin(u * hz(0.8)))); } });
  def('swallow', { snake(u) { const p = Math.abs(Math.sin(u * hz(0.4))); A(I.JAW, 1.2); A(I.NUP, 0.3 + 0.2 * p); A(I.HPITCH, -0.25 * p); SC_(B_().neck2, 1 + 0.35 * p); SC_(B_().neck1, 1 + 0.25 * (1 - p)); } }); // (the jaws walked over the prey, the neck swelling)
  def('mate', { snake(u) { A(I.WRITHE, 0.35); A(I.RAISE, 0.2); } });
  def('display', { snake(u, d) { const f = fr(u, d, 3), o = d > 0 ? bell(f, 0, 0.2, 0.9) : 1; A(I.RAISE, 1.1 * o); A(I.JAW, 0.7 * o); A(I.AIM, 0.25 * o); } });
  def('threat', { snake(u) { A(I.RAISE, 1); A(I.JAW, 0.45 + 0.2 * Math.abs(Math.sin(u * hz(0.8)))); A(I.AIM, 0.3); } });
  def('bite', { snake(u, d) { const f = fr(u, d, 0.5); A(I.RAISE, 0.8 * (1 - ramp(f, 0.2, 0.45))); A(I.STRIKE, bell(f, 0.15, 0.4, 0.9)); A(I.JAW, 1.1 * bell(f, 0.1, 0.35, 0.55)); A(I.AIM, 0.7 * bell(f, 0.15, 0.4, 0.9)); } });
  def('strike', { snake(u, d) { REC_.bite.snake(u, d); } });
  def('coil', { in: 0.5, out: 0.6, still: 1, snake(u) { A(I.COIL, 1); A(I.JAW, 0.55); A(I.AIM, 0.6); } });
  def('struggle', { snake(u) { A(I.WRITHE, 1); A(I.JAW, 0.6); A(I.RAISE, 0.3 * Math.abs(Math.sin(u * hz(0.7)))); } });
  def('stagger', { snake(u, d) { const f = fr(u, d, 0.8); A(I.WRITHE, 0.6 * bell(f, 0, 0.2, 0.9)); A(I.ROLL, C.side * 0.6 * bell(f, 0, 0.3, 0.9)); } });
  def('fall', { keep: 1, snake(u, d) { const g = ramp(fr(u, d, 0.9), 0.1, 0.8); A(I.ROLL, C.side * 2.0 * g); A(I.GROUND, g); A(I.WRITHE, 0.5 * (1 - g)); } });
  def('rise', { snake(u, d) { const f = fr(u, d, 1.2); A(I.ROLL, C.side * 2.0 * (1 - ramp(f, 0, 0.6))); A(I.GROUND, 1 - ramp(f, 0, 0.6)); A(I.WRITHE, 0.4 * bell(f, 0.1, 0.4, 0.9)); } });
  def('throes', { keep: 1, snake(u, d) { const f = fr(u, d, 3); A(I.ROLL, C.side * (1.6 + 0.6 * Math.sin(u * hz(0.4)))); A(I.GROUND, 1); A(I.WRITHE, 0.9 * (1 - 0.7 * f)); A(I.JAW, 0.6); A(I.EYE, 0.5 * f); } });
  def('hide', { snake() { A(I.PILE, 0.85); A(I.EYE, 0); A(I.NDOWN, 0.2); } });
  def('burrow', { snake(u, d) { const f = fr(u, d, 1.2); A(I.NDOWN, 0.6); A(I.LIFT, -1.2 * ramp(f, 0.2, 1)); A(I.FWD, 0.15 * f); } });
  def('dive', { snake(u, d) { const f = fr(u, d, 1); A(I.NDOWN, 0.6); A(I.LIFT, -1.5 * ramp(f, 0.2, 1)); } });
  def('swim', { snake(u) { A(I.NUP, 0.35); A(I.LIFT, -0.4); } });
  def('shelter', { snake() { A(I.PILE, 0.9); A(I.EYE, 0.4); } });
  def('curl', { snake() { A(I.PILE, 1); A(I.EYE, 0.7); } });
  def('curious', { snake(u) { A(I.RAISE, 0.55); A(I.HYAW, 0.3 * Math.sin(u * hz(0.5))); A(I.AIM, 0.3); A(I.JAW, 0.06 * Math.max(0, Math.sin(u * hz(3)))); } });

  // ================================ the sprawlers ================================
  def('sleep', { sprawl() { A(I.LIE, 1); A(I.EYE, 1); A(I.BREATH, 0.4); } });
  def('lie', { sprawl() { A(I.LIE, 1); A(I.HPITCH, -0.05); } });
  def('yawn', { sprawl(u, d) { const f = fr(u, d, 2.2), o = bell(f, 0.05, 0.45, 0.92); A(I.JAW, 1.25 * o); A(I.HPITCH, -0.25 * o); A(I.EYE, ramp(o, 0.5, 0.8)); } });
  def('bask', { sprawl() { A(I.LIE, 1); A(I.JAW, C.kind === 'croc' ? 0.9 : 0); A(I.EYE, 0.5); } });
  def('gape', { sprawl() { A(I.LIE, 0.9); A(I.JAW, 1.3); A(I.HPITCH, -0.12); } });
  def('alert', { sprawl() { A(I.HIGH, 0.6); A(I.HPITCH, -0.3); A(I.AIM, 0.3); } });
  def('stare', { sprawl() { A(I.HIGH, 0.3); A(I.AIM, 0.4); } });
  def('startle', { sprawl(u, d) { const f = fr(u, d, 0.7); A(I.HIGH, 0.9 * bell(f, 0, 0.15, 0.7)); A(I.LIFT, 0.3 * bell(f, 0, 0.1, 0.35)); A(I.TCURL, 0.6 * bell(f, 0, 0.2, 0.8)); } });
  def('roar', { sprawl(u, d) { const f = fr(u, d, 3), o = bell(f, 0.05, 0.25, 0.9); A(I.ARCH, -0.9 * o); A(I.HPITCH, -0.45 * o); A(I.JAW, 0.35 * o); A(I.SHIV, 1.5 * o); A(I.TUP, 0.6 * o); } }); // (the bellow: the head and the tail up, the back sunk, the water dancing on it)
  def('call', { sprawl(u, d) { const f = fr(u, d, 1.8), o = bell(f, 0, 0.2, 0.9); A(I.HPITCH, -0.35 * o); A(I.JAW, 0.5 * o); A(I.ARCH, -0.3 * o); } });
  def('drink', { sprawl(u) { A(I.NDOWN, 0.35); A(I.LIE, 0.6); A(I.JAW, 0.12 * Math.max(0, Math.sin(u * hz(0.8)))); } });
  def('chew', { sprawl(u) { A(I.JAW, 0.2 + 0.25 * Math.abs(Math.sin(u * hz(0.9)))); A(I.HPITCH, -0.15 * Math.abs(Math.sin(u * hz(0.9)))); } });
  def('tear', { sprawl(u) { const c = (u * 0.7) % 1, rip = bell(c, 0.2, 0.45, 0.8); A(I.JAW, 0.35); A(I.AIM, 0.7 * (1 - rip)); A(I.HYAW, C.side * 0.7 * rip); A(I.YAW, C.side * 0.5 * rip); A(I.ROLL, C.side * 0.35 * rip); A(I.HIGH, 0.3); } }); // (the jaws clamped, the head and the body thrown aside to rip a piece off)
  def('drag', { sprawl(u) { A(I.JAW, 0.35); A(I.AIM, 0.6); A(I.FWD, -0.08); A(I.HPITCH, 0.2); A(I.HIGH, 0.25); A(I.TCURL, 0.3 * Math.sin(u * hz(0.8))); } });
  def('swallow', { sprawl(u) { const p = Math.abs(Math.sin(u * hz(0.8))); A(I.HPITCH, -0.7 * p); A(I.JAW, 0.9 * p); A(I.HIGH, 0.4); } }); // (the head thrown up, the prey jerked back into the throat)
  def('mate', { sprawl() { A(I.LIE, 0.8); A(I.FWD, C.sx > 0.5 ? 0.25 : 0); A(I.LIFT, C.sx > 0.5 ? 0.3 : 0); A(I.HPITCH, -0.1); } });
  def('display', { sprawl(u, d) { const f = fr(u, d, 3), o = d > 0 ? bell(f, 0, 0.2, 0.9) : 1;
    if (C.kind === 'lizard') { A(I.HIGH, (0.5 + 0.5 * Math.sin(u * hz(1.6))) * o); A(I.HPITCH, -0.3 * Math.sin(u * hz(3.2)) * o); return; } // (the push-ups, the head bobbing)
    const sl = bell((u % 2) / 2, 0.3, 0.55, 0.7); A(I.HPITCH, -0.6 * o + 0.9 * sl * o); A(I.JAW, 0.9 * o * (1 - sl)); A(I.ARCH, -0.5 * o); A(I.TUP, 0.5 * o); } }); // (the head raised and slapped down on the water)
  def('threat', { sprawl(u) { A(I.HIGH, 0.6); A(I.JAW, 1.0); A(I.LIFT, 0.1); A(I.TCURL, 0.7); A(I.AIM, 0.3); A(I.SHIV, 0.3); } }); // (up on its legs, the jaws wide, hissing)
  def('bite', { sprawl(u, d) { const f = fr(u, d, 0.5), l = bell(f, 0, 0.4, 1); A(I.JAW, 1.1 * bell(f, 0, 0.3, 0.5)); A(I.FWD, 0.12 * l); A(I.HYAW, C.side * 0.3 * l); A(I.YAW, C.side * 0.3 * l); A(I.AIM, 0.8 * l); } });
  def('grip', { sprawl(u) { A(I.JAW, 0.35); A(I.AIM, 1); A(I.FWD, -0.05); A(I.HIGH, 0.3); A(I.HYAW, 0.15 * Math.sin(u * hz(1.4))); } });
  def('shakekill', { sprawl(u, d) { const f = fr(u, d, 1.6), a = bell(f, 0, 0.1, 1); A(I.HYAW, Math.sin(u * hz(4)) * 0.6 * a); A(I.YAW, Math.sin(u * hz(4) - 0.5) * 0.5 * a); A(I.JAW, 0.3); A(I.HPITCH, -0.25); } });
  def('strike', { sprawl(u, d) { const f = fr(u, d, 0.5), l = bell(f, 0, 0.35, 0.9); A(I.FWD, 0.35 * l); A(I.LIFT, 0.35 * bell(f, 0.05, 0.3, 0.6)); A(I.JAW, 1.3 * bell(f, 0, 0.3, 0.55)); A(I.HPITCH, -0.3 * l); A(I.AIM, 0.6 * l); A(I.HIGH, 0.5 * l); } }); // (the lunge from the water, the jaws wide, snapping shut)
  def('deathroll', { in: 0.2, out: 0.5, still: 1, body: 1, sprawl(u) { A(I.DROLL, 1); A(I.JAW, 0.35); A(I.AIM, 1); A(I.TCURL, 0.2); } });
  def('struggle', { sprawl(u) { A(I.THRASH, 1); A(I.ROLL, C.side * 0.6 * Math.sin(u * hz(0.9))); A(I.JAW, 0.8); A(I.YAW, 0.4 * Math.sin(u * hz(1.3))); A(I.TCURL, 0.6 * Math.sin(u * hz(1.1))); } });
  def('stagger', { sprawl(u, d) { const f = fr(u, d, 0.8), s = bell(f, 0, 0.25, 0.9); A(I.ROLL, C.side * 0.5 * s); A(I.YAW, -C.side * 0.3 * s); A(I.JAW, 0.4 * s); } });
  def('fall', { keep: 1, sprawl(u, d) { const g = ramp(fr(u, d, 0.9), 0.1, 0.85); A(I.ROLL, C.side * Math.PI * 0.9 * g); A(I.GROUND, g); A(I.THRASH, 0.5 * (1 - g)); } }); // (thrown onto its back)
  def('rise', { sprawl(u, d) { const f = fr(u, d, 1.2); A(I.ROLL, C.side * Math.PI * 0.9 * (1 - ramp(f, 0, 0.55))); A(I.GROUND, 1 - ramp(f, 0, 0.55)); A(I.THRASH, 0.6 * bell(f, 0, 0.3, 0.6)); } });
  def('throes', { keep: 1, sprawl(u, d) { const f = fr(u, d, 3); A(I.ROLL, C.side * Math.PI * 0.9); A(I.GROUND, 1); A(I.THRASH, 0.8 * (1 - 0.7 * f)); A(I.JAW, 0.5); A(I.TCURL, 0.5 * Math.sin(u * hz(0.6))); A(I.EYE, 0.5 * f); } });
  def('hide', { sprawl() { A(I.LIE, 1); A(I.LIFT, C.kind === 'croc' ? -0.6 : 0); A(I.EYE, 0); } }); // (only the eyes and the nostrils over the water)
  def('burrow', { sprawl(u, d) { const f = fr(u, d, 1.2); A(I.LIE, 1); A(I.LIFT, -1.4 * ramp(f, 0.2, 1)); A(I.YAW, 0.3 * Math.sin(u * hz(3))); A(I.NDOWN, 0.6); } });
  def('dive', { sprawl(u, d) { const f = fr(u, d, 1); A(I.SWIM, 1); A(I.PITCH, 0.25 * ramp(f, 0, 0.5)); A(I.LIFT, -1.0 * ramp(f, 0.2, 1)); } });
  def('swim', { sprawl(u) { A(I.SWIM, 1); A(I.HPITCH, -0.1); } });
  def('shelter', { sprawl() { A(I.LIE, 1); A(I.EYE, 0.5); A(I.TCURL, 0.5); } });
  def('curious', { sprawl(u) { A(I.HIGH, 0.35); A(I.AIM, 0.35); A(I.HYAW, 0.2 * Math.sin(u * hz(0.4))); } });

  // ================================ the frog ================================
  def('sleep', { frog() { A(I.LIE, 1); A(I.EYE, 1); } });
  def('bask', { frog() { A(I.LIE, 0.7); A(I.EYE, 0.6); } });
  def('alert', { frog() { A(I.NUP, 0.6); A(I.AIM, 0.3); } });
  def('stare', { frog() { A(I.NUP, 0.4); A(I.AIM, 0.35); } });
  def('startle', { frog(u, d) { const f = fr(u, d, 0.7); A(I.LIFT, 0.6 * bell(f, 0, 0.2, 0.5)); A(I.LEGF, bell(f, 0, 0.15, 0.5)); } });
  def('call', { frog(u, d) { const p = Math.max(0, Math.sin(u * hz(2.2))); A(I.SAC, p); A(I.NUP, 0.3); } }); // (the throat puffed out, again and again)
  def('drink', { frog() { A(I.LIE, 0.8); A(I.EYE, 0.3); } });
  def('chew', { frog(u) { A(I.EYE, Math.max(0, Math.sin(u * hz(1.2))) > 0.7 ? 1 : 0); A(I.NDOWN, 0.2); } }); // (the eyes pulled down to push the food)
  def('swallow', { frog(u) { A(I.JAW, 0.6); A(I.EYE, 0.8 * Math.abs(Math.sin(u * hz(0.8)))); A(I.NUP, 0.2); } });
  def('mate', { frog() { if (C.sx > 0.5) { A(I.LIFT, 0.35); A(I.FWD, 0.25); A(I.PITCH, 0.2); } else A(I.LIE, 0.6); } }); // (he clasps her back)
  def('struggle', { frog(u) { A(I.THRASH, 1); A(I.ROLL, C.down > 0 ? Math.PI * 0.9 : 0.5 * Math.sin(u * hz(1))); } });
  def('stagger', { frog(u, d) { const f = fr(u, d, 0.8); A(I.ROLL, C.side * 0.6 * bell(f, 0, 0.3, 0.9)); } });
  def('fall', { keep: 1, frog(u, d) { const g = ramp(fr(u, d, 0.9), 0.1, 0.8); A(I.ROLL, Math.PI * 0.95 * g); A(I.GROUND, g); A(I.LEGF, 0.5 * g); } });
  def('rise', { frog(u, d) { const f = fr(u, d, 1.2); A(I.ROLL, Math.PI * 0.95 * (1 - ramp(f, 0, 0.6))); A(I.GROUND, 1 - ramp(f, 0, 0.6)); } });
  def('throes', { keep: 1, frog(u, d) { const f = fr(u, d, 3); A(I.ROLL, Math.PI * 0.95); A(I.GROUND, 1); A(I.THRASH, 0.8 * (1 - 0.7 * f)); A(I.EYE, 0.6 * f); } });
  def('hide', { frog() { A(I.LIE, 1); A(I.DROP, 0.6); A(I.EYE, 0); } });
  def('burrow', { frog(u, d) { const f = fr(u, d, 1.2); A(I.LIE, 1); A(I.LIFT, -1.2 * ramp(f, 0.2, 1)); A(I.THRASH, 0.5); } });
  def('dive', { frog(u, d) { const f = fr(u, d, 1); A(I.LIFT, 0.5 * bell(f, 0, 0.25, 0.5) - 1.2 * ramp(f, 0.5, 1)); A(I.PITCH, 0.7 * ramp(f, 0.2, 0.6)); A(I.LEGF, ramp(f, 0, 0.3)); } });
  def('swim', { frog(u) { const q = Math.max(0, Math.sin(u * hz(1.4))); A(I.LEGF, q); A(I.LIFT, -0.3); A(I.NUP, -0.2); } }); // (the frog's kick)
  def('shelter', { frog() { A(I.LIE, 1); A(I.EYE, 0.6); } });
  def('curious', { frog() { A(I.NUP, 0.3); A(I.AIM, 0.3); } });

  // ================================ the seals ================================
  def('sleep', { seal() { A(I.ROLL, C.side * 1.2); A(I.GROUND, 1); A(I.EYE, 1); A(I.NDOWN, 0.6); A(I.BREATH, 0.5); } });
  def('lie', { seal() { A(I.NDOWN, 0.2); A(I.GROUND, 1); } });
  def('bask', { seal(u) { A(I.ARCH, -0.8); A(I.ROLL, C.side * 0.9); A(I.GROUND, 1); A(I.EYE, 0.6); A(I.WOPEN, 0.5 * Math.max(0, Math.sin(u * hz(0.15)))); } }); // (the banana: the head and the tail flippers up, on its side, a flipper waved)
  def('alert', { seal() { A(I.NUP, 0.8); A(I.AIM, 0.3); } });
  def('stare', { seal() { A(I.NUP, 0.5); A(I.AIM, 0.4); } });
  def('startle', { seal(u, d) { const f = fr(u, d, 0.7); A(I.NUP, 0.9 * bell(f, 0, 0.15, 0.7)); A(I.LIFT, 0.12 * bell(f, 0, 0.1, 0.35)); } });
  def('call', { seal(u, d) { const f = fr(u, d, 1.8), o = bell(f, 0, 0.2, 0.45) + bell(f, 0.5, 0.7, 0.95); A(I.NUP, 0.8); A(I.HPITCH, -0.5 * o); A(I.JAW, 0.7 * o); } }); // (the bark, the head up)
  def('drink', { seal() { A(I.NDOWN, 0.8); } });
  def('chew', { seal(u) { A(I.JAW, 0.15 + 0.2 * Math.abs(Math.sin(u * hz(1.5)))); A(I.NUP, 0.3); } });
  def('nuzzle', { seal() { A(I.AIM, 0.75); A(I.NUP, 0.3); A(I.EYE, 0.3); } });
  def('suckle', { seal(u) { A(I.AIM, 0.9); A(I.NDOWN, 0.3); A(I.EYE, 0.4); } });
  def('nurse', { seal() { A(I.ROLL, C.side * 1.2); A(I.GROUND, 1); A(I.NUP, 0.3); A(I.EYE, 0.3); } });
  def('mate', { seal() { if (C.sx > 0.5) { A(I.NUP, 0.6); A(I.FWD, 0.3); A(I.LIFT, 0.25); A(I.AIM, 0.6); } else A(I.NDOWN, 0.3); } });
  def('bite', { seal(u, d) { const f = fr(u, d, 0.5), l = bell(f, 0, 0.4, 1); A(I.NUP, 0.6); A(I.NFWD, 0.6 * l); A(I.JAW, 1.0 * bell(f, 0, 0.3, 0.5)); A(I.AIM, 0.8 * l); A(I.FWD, 0.06 * l); } });
  def('struggle', { seal(u) { A(I.THRASH, 1); A(I.ROLL, C.side * (C.down > 0 ? 1.2 : 0.4 * Math.sin(u * hz(1)))); A(I.GROUND, C.down > 0 ? 1 : 0); A(I.NUP, 0.5 * Math.abs(Math.sin(u * hz(0.9)))); A(I.JAW, 0.6); A(I.YAW, 0.35 * Math.sin(u * hz(1.2))); } });
  def('stagger', { seal(u, d) { const f = fr(u, d, 0.8); A(I.ROLL, C.side * 0.5 * bell(f, 0, 0.3, 0.9)); A(I.NDOWN, 0.4 * bell(f, 0, 0.3, 0.9)); } });
  def('fall', { keep: 1, seal(u, d) { const g = ramp(fr(u, d, 0.9), 0.1, 0.85); A(I.ROLL, C.side * 1.4 * g); A(I.GROUND, g); } });
  def('rise', { seal(u, d) { const f = fr(u, d, 1.2); A(I.ROLL, C.side * 1.4 * (1 - ramp(f, 0, 0.6))); A(I.GROUND, 1 - ramp(f, 0, 0.6)); A(I.NUP, 0.5 * bell(f, 0.4, 0.7, 1)); } });
  def('throes', { keep: 1, seal(u, d) { const f = fr(u, d, 3); A(I.ROLL, C.side * 1.4); A(I.GROUND, 1); A(I.THRASH, 0.8 * (1 - 0.7 * f)); A(I.NUP, 0.4 * Math.max(0, Math.sin(u * hz(0.5)))); A(I.EYE, 0.5 * f); } });
  def('dive', { seal(u, d) { const f = fr(u, d, 1); A(I.PITCH, 0.8 * ramp(f, 0, 0.5)); A(I.LIFT, -0.8 * ramp(f, 0.3, 1)); A(I.SWIM, ramp(f, 0.3, 0.8)); } });
  def('swim', { seal() { A(I.SWIM, 1); A(I.NUP, 0.3); } });
  def('shelter', { seal() { A(I.NDOWN, 0.5); A(I.EYE, 0.5); A(I.YAW, 0.4 * C.side); } });
  def('shiver', { seal() { A(I.SHIV, 1); A(I.NDOWN, 0.3); } });
  def('curious', { seal(u) { A(I.NUP, 0.5); A(I.AIM, 0.3); A(I.HROLL, 0.3 * Math.sin(u * hz(0.4))); } });
  // (the layers that are a bone's size: the throat swelling as the prey goes down)
  function B_() { return G.FaunaAnim.B; }
  function SC_(bone, v) { const sc = G.FaunaAnim.K.SC; const w = W(); sc[bone] = 1 + (v - 1) * w; }
})(window.G);
