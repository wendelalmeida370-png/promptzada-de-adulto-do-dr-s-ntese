# corpo_roupa: hair, beards, the clothes that stand off the body, and the hats — in the clay of corpo_sdf, shaped on the
# head and the body of corpo_forma (the same bind pose). Each piece: its primitives, its zone (how js/body3d.js paints
# it) and how its points are weighted to the rig's bones (rules of where they are: hair from the head down the back,
# a skirt following the legs, a cape the shoulders then its own bones).
import numpy as np
from corpo_sdf import Sphere, Ellipsoid, RoundCone, RBox, Plane, Custom, Torus, smin, smax, rot_x, rot_y, rot_z, frame_from as frame_rot
import corpo_forma as CF

# the grown head (corpo_forma.body grows the head by 1.06 about this point)
HC0 = CF.HEAD_PIVOT + np.array([0, 0.03, 0]); HK = 1.06
def H(p): return HC0 + (np.asarray(p, float) - HC0) * HK
CRAN_C = H([0, 1.705, -0.014]); CRAN_R = np.array([0.089, 0.103, 0.103]) * HK   # the skull


def ell_sdf(P, c, r):
    q = (P - c) / r; k0 = np.linalg.norm(q, axis=1); k1 = np.linalg.norm((P - c) / (r * r), axis=1)
    return k0 * (k0 - 1.0) / np.maximum(k1, 1e-9)


def hairline(P):
    """How far above the line where the hair grows (negative above it): high on the forehead, down to the temples, a
    sideburn before the ear, low at the nape."""
    q = P - CRAN_C; th = np.arctan2(q[:, 0], q[:, 2]); a = np.abs(th)
    y = 1.6975 + 0.08 * np.cos(th) - 0.0025 * np.cos(2 * th) + 0.012 * HK - 0.032 * np.exp(-((a - 1.22) / 0.16) ** 2)
    return y - P[:, 1]


# ------------------------------ hair ------------------------------
def cap(lift=0.0, back=0.0, front=0.0, vol=0.015, top=0.024, tufts=1.0):
    """The hair on the skull: a shell of the skull's shape grown by vol (more on the top), above the hairline (raised by
    lift; at the back lowered by back), its locks in soft ridges."""
    c = CRAN_C + np.array([0, 0.004, -0.003])
    r = CRAN_R + np.array([vol, top, vol])
    nape_c = H([0, 1.655, -0.072]); nape_r = np.array([0.084, 0.07, 0.056]) + vol * 0.6
    def f(P):
        d = smin(ell_sdf(P, c, r), ell_sdf(P, nape_c, nape_r), 0.03)   # (the hair goes down the back of the head to the nape)
        q = P - CRAN_C; th = np.arctan2(q[:, 0], q[:, 2]); ph = np.arctan2(q[:, 1], np.hypot(q[:, 0], q[:, 2]))
        # (locks: soft ridges running back from the crown, broken so they read as clumps, not as a pattern)
        d += tufts * 0.0036 * (np.sin(th * 9 + np.sin(ph * 4) * 1.6) * 0.65 + np.sin(th * 19 + ph * 7) * 0.35) * np.clip((ph + 0.5) * 1.2, 0, 1)
        hl = hairline(P) - lift + back * np.clip(-q[:, 2] / 0.09, 0, 1) - front * np.clip(q[:, 2] / 0.08, 0, 1)
        return smax(d, hl, 0.006)
    lo = c - r - 0.03; hi = c + r + 0.03
    return Custom(f, (lo, hi))


def hair(style):
    """The primitives of a hairstyle."""
    if style == 'curto':
        P = [cap().set(bone='head'), E(H([0, 1.775, 0.062]), [0.05, 0.02, 0.035], rot_x(-0.4), op='u', k=0.02, bone='head')]
    elif style == 'longo':
        P = [cap(back=0.06).set(bone='head')]
        # (locks from the back of the head down over the shoulder blades, a little apart, thinning to their ends)
        for x, zl, yl, r in [(0.0, -0.11, 1.36, 0.034), (0.045, -0.105, 1.37, 0.031), (-0.045, -0.105, 1.37, 0.031), (0.082, -0.085, 1.39, 0.027), (-0.082, -0.085, 1.39, 0.027)]:
            P.append(RoundCone(H([x * 0.8, 1.66, -0.085]), [x, yl, zl], r, r * 0.55).set(op='u', k=0.03, bone='chest', tau=0.03))
        for sd in (1, -1):
            P.append(RoundCone(H([0.078 * sd, 1.668, -0.03]), [0.098 * sd, 1.43, -0.045], 0.028, 0.016).set(op='u', k=0.03, bone='chest', tau=0.03))
    elif style == 'trancas':
        P = [cap(back=0.02, tufts=0.6).set(bone='head')]
        for sd in (1, -1):
            # (a braid: knots of hair one after another, turning left and right, from behind the ear down over the shoulder)
            a = H([0.07 * sd, 1.655, -0.045]); b = np.array([0.105 * sd, 1.3, 0.075]); n = 17
            for i in range(n):
                t = i / (n - 1); c = a + (b - a) * t + np.array([0, 0, 0.03]) * np.sin(t * np.pi); r = 0.019 - 0.0065 * t
                P.append(E(c + np.array([0.005 * sd * (1 if i % 2 else -1), 0, 0]), [r * 1.1, r * 1.35, r * 0.95], rot_z(0.55 * (1 if i % 2 else -1)), op='u', k=0.012, bone='chest' if t > 0.25 else 'head'))
            P.append(E(b + np.array([0, -0.025, 0.005]), [0.011, 0.02, 0.011], op='u', k=0.006, bone='chest'))
    elif style == 'coque':
        P = [cap(lift=-0.004, tufts=0.5).set(bone='head'), Sphere(H([0, 1.74, -0.118]), 0.043).set(op='u', k=0.02, bone='head'),
             Torus(H([0, 1.737, -0.098]), 0.034, 0.006, rot_x(1.25)).set(op='u', k=0.004, bone='head')]
    elif style == 'careca':
        cut = Plane([0, H([0, 1.712, 0])[1], 0], [0, 1, 0], (CRAN_C - 0.2, CRAN_C + 0.2)).set(op='i', k=0.012)
        P = [cap(vol=0.01, top=0.01, tufts=0.7).set(bone='head'), cut]
    elif style == 'rabo':
        P = [cap(tufts=0.6).set(bone='head'), Torus(H([0, 1.69, -0.11]), 0.022, 0.007, rot_x(1.2)).set(op='u', k=0.004, bone='head'),
             RoundCone(H([0, 1.69, -0.118]), [0, 1.5, -0.14], 0.024, 0.012).set(op='u', k=0.012, bone='chest')]
    elif style == 'chanel':
        # (the straight-cut hair of the Nile and of the jungle: to the jaw all round, a straight fringe over the brow)
        def bob(P):
            q = P - CRAN_C; d = ell_sdf(P, CRAN_C + np.array([0, -0.02, -0.004]), CRAN_R + np.array([0.022, 0.04, 0.02]))
            d = smax(d, (H([0, 1.585, 0])[1] - P[:, 1]), 0.006)            # (cut straight at the jaw)
            face = np.minimum.reduce([0.075 * HK - np.abs(q[:, 0]), q[:, 2] - 0.03, H([0, 1.748, 0])[1] - P[:, 1]])   # (the face: inside all three)
            return smax(d, face, 0.004)
        P = [Custom(bob, (CRAN_C - 0.16, CRAN_C + 0.16)).set(bone='head')]
    elif style == 'peruca':
        # (the wig of the Nile: black, full, falling straight from the crown to the shoulders, a fringe straight over the brow,
        # two locks in front of the shoulders — its strands the hair's own paint)
        def wig(P):
            q = P - CRAN_C; y = P[:, 1]
            d = ell_sdf(P, CRAN_C + np.array([0, -0.01, -0.006]), CRAN_R + np.array([0.03, 0.045, 0.028]))
            fl = 1.0 + 0.1 * np.clip((1.62 - y) / 0.15, 0, 1)                             # (falling a little wider to the shoulders)
            col = np.hypot(q[:, 0] / (0.122 * fl), (q[:, 2] + 0.008) / (0.118 * fl)) - 1.0      # (the fall: a column round the head)
            col = smax(col * 0.12, np.maximum(1.465 - y, y - (CRAN_C[1] + 0.02)), 0.01)
            d = smin(d, col, 0.03)
            face = np.minimum.reduce([0.072 * HK - np.abs(q[:, 0]), q[:, 2] - 0.025, H([0, 1.75, 0])[1] - y])
            return smax(d, face, 0.004)
        P = [Custom(wig, (CRAN_C - np.array([0.17, 0.3, 0.17]), CRAN_C + np.array([0.17, 0.16, 0.17]))).set(bone='head')]
        for sd in (1, -1):
            P.append(RBox(np.array([0.088 * sd, 1.5, 0.045]), [0.028, 0.085, 0.01], 0.008, rot_z(0.06 * sd)).set(op='u', k=0.02, bone='chest', tau=0.03))
    else:
        raise ValueError(style)
    return P


def beard(style):
    """A beard grows on the face (a shell over the jaw, the chin and the upper lip), not over the lips."""
    head = [p for p in CF.body(0.0) if p.bone == 'head' and p.op == 'u' and not isinstance(p, RoundCone) or (p.bone == 'head' and isinstance(p, RoundCone) and p.a[1] > 1.56)]
    hp = [p for p in CF.body(0.0) if (p.bone == 'head' and p.op in 'us')]
    th = {'barba': 0.013, 'curta': 0.006, 'bigode': 0.0}[style]
    def face(P):
        acc = np.full(len(P), 1e3)
        for p in hp:
            if p.op == 'u': acc = smin(acc, p.sdf(P), p.k)
            else: acc = smax(acc, -p.sdf(P), p.k)
        return acc
    def f(P):
        d = face(P) - th
        ax = np.abs(P[:, 0]); y = P[:, 1]; z = P[:, 2]
        line = 1.628 + 0.05 * np.clip((ax - 0.025) / 0.065, 0, 1) ** 1.3          # (the cheek's line, rising to the sideburn)
        reg = smax(smax(y - line, -0.004 - z, 0.012), H([0, 1.6, 0])[1] - 0.14 - y, 0.01)
        mouth = ell_sdf(P, H([0, 1.613, 0.108]), np.array([0.026, 0.011, 0.03]))
        d = smax(smax(d, reg, 0.01), -mouth, 0.005)
        return d
    P = []
    if style != 'bigode':
        P.append(Custom(f, (H([-0.12, 1.5, -0.08]), H([0.12, 1.7, 0.16]))).set(bone='head'))
        if style == 'barba':
            P.append(E(H([0, 1.545, 0.074]), [0.054, 0.058, 0.044], op='u', k=0.035, bone='head'))
    # (the moustache over the upper lip, down at the corners)
    for sd in (1, -1):
        P.append(RoundCone(H([0.003 * sd, 1.634, 0.113]), H([0.031 * sd, 1.617, 0.102]), 0.009, 0.006).set(op='u', k=0.008, bone='head'))
    return P


# ------------------------------ clothes that stand off the body ------------------------------
SZ = -0.008          # (a skirt's axis: a little behind the body's middle, where the hips are)


def skirt_hem(th):
    """How far the hem of a skirt rises or falls round the body (metres; th from the front, + toward the body's left): a
    cloth never hangs level — body3d paints the hem's band along the same line."""
    return 0.011 * np.sin(th * 3.0 + 1.0) + 0.006 * np.sin(th * 7.0 + 0.4)


_SKT = {}
def drape_hips(gap=0.005):
    """How far from the skirt's axis the body is at each angle round it and each height, from the belt down — the hips,
    the buttocks, the thighs (a man's body or a woman's, the wider): what a skirt is tied on and falls from."""
    if 'R' in _SKT: return _SKT['TH'], _SKT['YS'], _SKT['RB']
    TH = np.linspace(-np.pi, np.pi, 181); YS = np.arange(1.06, 0.05, -0.01); RS = np.arange(0.0, 0.36, 0.004)
    T, Yg, Rg = np.meshgrid(TH, YS, RS, indexing='ij')
    P = np.stack([np.sin(T) * Rg, Yg, SZ + np.cos(T) * Rg], -1).reshape(-1, 3)
    rb = np.zeros(T.shape[:2])
    for fem in (0.0, 1.0):
        F = _union([q for q in _torso(fem) if not _deltoid(q)], P).reshape(T.shape); ins = F < 0
        last = len(RS) - 1 - np.argmax(ins[..., ::-1], axis=2); nxt = np.minimum(last + 1, len(RS) - 1)
        fa = np.take_along_axis(F, last[..., None], 2)[..., 0]; fb = np.take_along_axis(F, nxt[..., None], 2)[..., 0]
        rb = np.maximum(rb, np.where(ins.any(2), RS[last] + (RS[1] - RS[0]) * np.clip(fa / np.minimum(fa - fb, -1e-9), 0, 1), 0.0))
    for _ in range(2):
        Rp = np.pad(rb, 1, mode='edge'); rb = (4 * rb + Rp[:-2, 1:-1] + Rp[2:, 1:-1] + Rp[1:-1, :-2] + Rp[1:-1, 2:]) / 8
    _SKT.update(TH=TH, YS=YS, RB=rb, R=1)
    return TH, YS, rb


def skirt(long):
    """A tunic's skirt from the belt to the knee — or a dress, a robe, to the ankle: tied snug at the belt, over the hips
    as they are, then falling from their widest and opening toward the hem, in folds — round crests, the hollows between
    them sharper, irregularly spaced, deeper below —; the hem never level (skirt_hem), its folds swinging (body3d)."""
    y0, y1 = 1.012, (0.12 if long else 0.5)
    TH, YS, RB = drape_hips()
    F = 0.13 if long else 0.1                                              # (how much it opens: metres out per metre down)
    R = np.zeros_like(RB); R[:, 0] = RB[:, 0] + 0.007                      # (the cloth's inside off the skin)
    for j in range(1, len(YS)):
        fl = F * smooth01((0.93 - YS[j]) / 0.3) + 0.01
        R[:, j] = np.maximum(RB[:, j] + 0.007, R[:, j - 1] + fl * 0.01)
    # (the folds: about nine round it, not mirrored, from nothing at the hips to their depth at the hem)
    u = TH[:, None] * (9.0 if long else 7.0) + 0.8 * np.sin(TH[:, None] * 2.3 + 0.4) + 0.4 * np.sin(TH[:, None] * 5.1 + 1.7)
    fo = 2.0 * (0.5 + 0.5 * np.cos(u)) ** 0.6 - 1.0
    t = np.clip((0.9 - YS[None, :]) / (0.9 - y1), 0, 1)
    A = (0.028 if long else 0.017) * t ** 1.15
    Rf = np.maximum(R + A * (fo + 0.15 * t * np.sin(TH[:, None] * 17.0 + 1.3)), RB + 0.008)
    dRt = (np.roll(Rf, -1, axis=0) - np.roll(Rf, 1, axis=0)) / (2 * (TH[1] - TH[0])); dRy = np.gradient(Rf, -0.01, axis=1)
    def f(P):
        x, y, z = P[:, 0], P[:, 1], P[:, 2]
        th = np.arctan2(x, z - SZ); rho = np.hypot(x, z - SZ)
        Rr = _table(TH, YS, Rf, th, y); gt = _table(TH, YS, dRt, th, y) / np.maximum(rho, 0.05); gy = _table(TH, YS, dRy, th, y)
        shell = np.abs((rho - Rr) / np.sqrt(1 + gt * gt + gy * gy)) - 0.006
        return smax(shell, np.maximum(y - y0, (y1 + skirt_hem(th)) - y), 0.003)
    ext = float(Rf.max()) + 0.03
    return [Custom(f, (np.array([-ext, y1 - 0.04, SZ - ext]), np.array([ext, y0 + 0.02, SZ + ext]))).set(bone='pel')]


# ------------------------------ the cape ------------------------------
CZ = -0.035           # (the cape's axis: a little behind the body's)
CAPE_HEM = 0.55       # (its hem at the back, in the bind: just above the knees)


def _bones(p): return set(p.bone) if isinstance(p.bone, dict) else {p.bone}


def _deltoid(p):
    """The first, roundest piece of clay of an arm (its shoulder cap) — not the biceps under it."""
    return isinstance(p, Ellipsoid) and bool(_bones(p) & {'shL', 'shR'}) and p.r[0] > 0.055 and p.r[1] > 0.085


HUNG_ROLL = 0.21      # (the arms as they hang under a cloak: the rig's roll with its armOut — in the bind they are out, 0.6)


def _hung(p):
    """A shoulder cap turned down about its shoulder from the bind's open arm to the arm hanging: what a cloak lies on."""
    sd = 1.0 if 'shL' in _bones(p) else -1.0; S = CF.mirror(CF.S_L, sd); a = sd * (HUNG_ROLL - CF.BIND_ROLL)
    Rz = rot_z(a); q = Ellipsoid(S + Rz @ (p.c - S), p.r, Rz @ (p.R if p.R is not None else np.eye(3)))
    return q.set(op=p.op, k=p.k, bone=p.bone, tau=p.tau, tag=p.tag)


def _union(prims, P):
    acc = np.full(len(P), 1e3)
    for p in prims: acc = smin(acc, p.sdf(P), p.k)
    return acc


def _torso(fem):
    """The pieces of clay a cape lies on: the trunk, the buttocks, the thighs, the shoulder caps (not the arms below them)."""
    out = []
    for p in CF.body(fem):
        if p.op != 'u' or p.bone is None: continue
        b = _bones(p)
        if b & {'pel', 'chest', 'thL', 'thR'}: out.append(p)
        elif b & {'shL', 'shR'} and _deltoid(p): out.append(_hung(p))   # (the deltoid — the shoulder cap — with the arm hanging)
    return out


def _girdle():
    """The shoulders a cloak lies on: the upper chest and back, the trapezius, the shoulder caps (not the neck)."""
    out = []
    for p in _torso(0.0):
        b = _bones(p)
        if b & {'shL', 'shR'}: out.append(p); continue
        if 'chest' not in b: continue
        if isinstance(p, RoundCone):
            if abs(p.a[0]) < 0.01 and abs(p.b[0]) < 0.01: continue         # (the neck)
            if max(p.a[1], p.b[1]) > 1.2: out.append(p)
        elif p.c[1] > 1.2: out.append(p)
    return out


def no_arms(prims):
    """A body without its arms (the shoulder caps kept): what a cloak's own shadow is cast by — in the bind the arms are
    out, in the world they hang inside it."""
    arm = {'shL', 'shR', 'faL', 'faR', 'hdL', 'hdR', 'fgL', 'fgR', 'tbL', 'tbR', 'elHL', 'elHR'}
    return [p for p in prims if not (p.bone is not None and _bones(p) & arm and not _deltoid(p))]


_DRAPE = {}
def drape(gap=0.013, flare=0.09):
    """How far from the cape's axis the cloth hangs, at each angle round the back (0 behind, + toward the body's left) and
    each height: on the body where it is the widest so far from the top (the shoulder blades, then the buttocks), falling
    straight down from there and opening a little (flare: metres out per metre down) — a man's body or a woman's, the wider."""
    if 'R' in _DRAPE: return _DRAPE['TH'], _DRAPE['YS'], _DRAPE['R'], _DRAPE['RB']
    TH = np.linspace(-np.pi, np.pi, 145); YS = np.arange(1.60, 0.30, -0.01); RS = np.arange(0.0, 0.46, 0.004)
    T, Yg, Rg = np.meshgrid(TH, YS, RS, indexing='ij')
    P = np.stack([np.sin(T) * Rg, Yg, CZ - np.cos(T) * Rg], -1).reshape(-1, 3)
    rb = np.zeros(T.shape[:2])
    for fem in (0.0, 1.0):
        F = _union(_torso(fem), P).reshape(T.shape); ins = F < 0
        last = len(RS) - 1 - np.argmax(ins[..., ::-1], axis=2); nxt = np.minimum(last + 1, len(RS) - 1)
        # (where the surface crosses between the last sample inside and the next: not the samples' 4 mm steps)
        fa = np.take_along_axis(F, last[..., None], 2)[..., 0]; fb = np.take_along_axis(F, nxt[..., None], 2)[..., 0]
        r = RS[last] + (RS[1] - RS[0]) * np.clip(fa / np.minimum(fa - fb, -1e-9), 0, 1)
        rb = np.maximum(rb, np.where(ins.any(2), r, 0.0))
    for _ in range(2):                                        # (and a little smoothing, round and down)
        Rp = np.pad(rb, 1, mode='edge'); rb = (4 * rb + Rp[:-2, 1:-1] + Rp[2:, 1:-1] + Rp[1:-1, :-2] + Rp[1:-1, 2:]) / 8
    R = np.zeros_like(rb); R[:, 0] = rb[:, 0] + gap
    fl = flare * (1 + 1.2 * np.clip(np.abs(TH) / 1.5, 0, 1) ** 2)       # (opening more at the sides: the hem wider than the shoulders)
    # (and over the shoulder blades a little more: the arms swing them back under it)
    gp = gap + 0.009 * smooth01((YS[None, :] - 1.33) / 0.06) * smooth01((np.abs(TH)[:, None] - 0.2) / 0.3)
    R[:, 0] = rb[:, 0] + gp[:, 0]
    for j in range(1, len(YS)): R[:, j] = np.maximum(rb[:, j] + gp[:, j], R[:, j - 1] + fl * 0.01)
    _DRAPE.update(TH=TH, YS=YS, R=R, RB=rb)
    return TH, YS, R, rb


_TOP = {}
def shoulder_top():
    """The height of the top of the shoulders over each point of the ground plan (the upper chest and back, the trapezius,
    the shoulder caps), and its slope: what a cloak's yoke lies on. Where there is no shoulder under a point, very low."""
    if 'H' in _TOP: return _TOP['X'], _TOP['Z'], _TOP['H'], _TOP['GX'], _TOP['GZ']
    XS = np.arange(-0.38, 0.3801, 0.004); ZS = np.arange(-0.18, 0.1801, 0.004); YS = np.arange(1.62, 1.20, -0.002)
    X, Z, Y = np.meshgrid(XS, ZS, YS, indexing='ij')
    F = _union(_girdle(), np.stack([X.ravel(), Y.ravel(), Z.ravel()], 1)).reshape(X.shape); ins = F < 0
    first = np.argmax(ins, axis=2); has = ins.any(2); prv = np.maximum(first - 1, 0)
    fa = np.take_along_axis(F, first[..., None], 2)[..., 0]; fb = np.take_along_axis(F, prv[..., None], 2)[..., 0]
    H = np.where(has, YS[first] + (YS[0] - YS[1]) * np.clip(fa / np.minimum(fa - fb, -1e-9), 0, 1), 0.0)   # (the crossing, between samples)
    # (beyond the shoulders' outline the height falls away as a cone, and the whole is smoothed: the cloth's edge is a
    # smooth line, not the steps of the grid)
    for _ in range(30):
        Hp = np.pad(H, 1, mode='edge'); nb = np.max([Hp[:-2, 1:-1], Hp[2:, 1:-1], Hp[1:-1, :-2], Hp[1:-1, 2:]], axis=0) - 0.008
        H = np.where(has, H, np.maximum(H, nb))
    for _ in range(4):
        Hp = np.pad(H, 1, mode='edge'); H = (4 * H + Hp[:-2, 1:-1] + Hp[2:, 1:-1] + Hp[1:-1, :-2] + Hp[1:-1, 2:]) / 8
    H = np.where(H > 0.2, H, 0.6)
    GX, GZ = np.gradient(H, XS, ZS)
    GX = np.clip(GX, -6, 6); GZ = np.clip(GZ, -6, 6)
    _TOP.update(X=XS, Z=ZS, H=H, GX=GX, GZ=GZ)
    return XS, ZS, H, GX, GZ


def _table(TH, YS, A, th, y):
    """A table over (angle, height) read at points (bilinear; the heights run downward)."""
    fi = np.clip((th - TH[0]) / (TH[1] - TH[0]), 0, len(TH) - 1.001); fj = np.clip((YS[0] - y) / (YS[0] - YS[1]), 0, len(YS) - 1.001)
    i = fi.astype(int); j = fj.astype(int); u = fi - i; v = fj - j
    return (A[i, j] * (1 - u) + A[i + 1, j] * u) * (1 - v) + (A[i, j + 1] * (1 - u) + A[i + 1, j + 1] * u) * v


def pleat(th, y):
    """The folds of a hanging cloth: round crests, sharp hollows between them, about seven across the back, deeper toward
    the hem (none where it lies on the shoulders)."""
    # (not mirrored: a cloth never hangs the same on both sides — seven big folds, irregularly spaced, smaller ones between)
    u = th * 7.2 + 0.7 * np.sin(th * 2.3 + 0.4) + 0.35 * np.sin(th * 4.9 + 1.7)
    f = 2.0 * (0.5 + 0.5 * np.cos(u)) ** 0.6 - 1.0
    t = np.clip((1.33 - y) / (1.33 - CAPE_HEM), 0, 1)
    F = f * 0.85 + 0.15 * t * np.sin(th * 15.0 + 1.3 + 0.8 * np.sin(th * 3.1))
    return (0.05 * t ** 1.1 + 0.004 * t) * F, f


def cape():
    """A cloak of wool: over the shoulders (lying on them and on the collarbones), pinned at the throat by a brooch, a
    rolled collar round the back of the neck, down the back to the knees — standing off the back as cloth falls, from
    the shoulder blades over the buttocks; folds deepening toward the hem, the hem waving with them; its sides behind
    the arms. The yoke over the shoulders is the body's own shape grown by the cloth; the rest hangs (drape)."""
    TH, YS, R0, RB = drape()
    th_ = 0.009                                              # (the cloth's thickness: a heavy wool)
    # (the hanging part, with its folds — never into the body — and its slopes, for a true distance)
    PL = np.stack([pleat(t, YS)[0] for t in TH]); Rf = np.maximum(R0 + PL, RB + 0.008)
    dRt = np.gradient(Rf, TH, axis=0); dRy = np.gradient(Rf, -0.01, axis=1)
    girdle = _girdle()
    def hang(P):
        x, y, z = P[:, 0], P[:, 1], P[:, 2]
        th = np.arctan2(x, -(z - CZ)); rho = np.hypot(x, z - CZ)
        Rr = _table(TH, YS, Rf, th, y); gt = _table(TH, YS, dRt, th, y) / np.maximum(rho, 0.05); gy = _table(TH, YS, dRy, th, y)
        d = (rho - Rr) / np.sqrt(1 + gt * gt + gy * gy)
        shell = np.abs(d) - th_ * 0.5 * np.clip((1.50 - y) / 0.04, 0.3, 1)   # (thinning under the yoke: no edge to show)
        # (the hem: lower at the back than at the sides, waving with the folds; the sides behind the arms)
        f = pleat(th, y)[1]; hem = CAPE_HEM + 0.035 * (th / 1.4) ** 2 + 0.006 * f
        side = (np.abs(th) - (1.56 - 0.26 * np.clip((1.38 - y) / 0.43, 0, 1))) * rho   # (from the shoulder tip, then behind the arm)
        top = y - 1.50                                         # (above, the yoke: the two lie together over the shoulder blades)
        return smax(smax(smax(shell, hem - y, 0.004), side, 0.006), top, 0.004)
    XS, ZS, HT, GX, GZ = shoulder_top()
    def yoke(P):
        # (lying on the top of the shoulders: the cloth at the shoulders' height plus its gap, wherever there is a shoulder
        # under it and it is not too steep — down the steep sides it is the hanging part that goes on)
        x, y, z = P[:, 0], P[:, 1], P[:, 2]; ax = np.abs(x)
        fx = np.clip((x - XS[0]) / (XS[1] - XS[0]), 0, len(XS) - 1.001); fz = np.clip((z - ZS[0]) / (ZS[1] - ZS[0]), 0, len(ZS) - 1.001)
        i = fx.astype(int); j = fz.astype(int); u = fx - i; v = fz - j
        bl = lambda A: (A[i, j] * (1 - u) + A[i + 1, j] * u) * (1 - v) + (A[i, j + 1] * (1 - u) + A[i + 1, j + 1] * u) * v
        hh = bl(HT); gx = bl(GX); gz = bl(GZ); g2 = gx * gx + gz * gz
        # (more over the shoulder caps — an arm raised lifts them — and over the shoulder blades, which the arms swing)
        gap = 0.012 + 0.01 * smooth01((ax - 0.17) / 0.09) + 0.009 * smooth01((-0.02 - z) / 0.04) * smooth01((ax - 0.04) / 0.06)
        shell = np.abs((y - hh - gap) / np.sqrt(1 + g2)) - th_ * 0.5
        steep = np.maximum((np.sqrt(g2) - 1.25) * 0.03, (1.25 - hh) * 0.5)   # (too steep — the back goes on below — or no shoulder under it)
        # (its front edge: from the shoulder tops down to the brooch at the throat — a V; behind, no cut)
        vy = 1.405 + 0.095 * np.clip(ax / 0.165, 0, 1) + 0.55 * np.clip(ax - 0.165, 0, None)
        w = smooth01((z + 0.02) / 0.05); front = (vy - y) * w - (1 - w) * 0.05
        neck = 0.083 - np.hypot(x, z + 0.012)                # (round the neck, the collar's opening)
        # (out over the shoulder cap, to its top only: the cloth's edge across the shoulder, square to the arm)
        S = np.stack([ax - CF.S_L[0], y - CF.S_L[1]], 1); tip = S @ np.array([np.sin(HUNG_ROLL), -np.cos(HUNG_ROLL)]) - 0.035
        return smax(smax(smax(smax(shell, front, 0.008), neck, 0.006), steep, 0.006), tip, 0.008)
    def f(P): return smin(hang(P), yoke(P), 0.012)
    P = [Custom(f, (np.array([-0.40, CAPE_HEM - 0.04, -0.34]), np.array([0.40, 1.60, 0.16]))).set(bone='clk1')]
    # (the collar: a roll of the cloth round the back of the neck; the brooch at the throat, of the person's metal)
    def collar(Q):
        # (the roll lies on the yoke: its height at each point round the neck is the shoulders' there, plus the cloth)
        x, y, z = Q[:, 0], Q[:, 1], Q[:, 2]; a = np.arctan2(x, -(z + 0.012)); rr = 0.093 + 0.025 * np.clip(np.abs(a) / 2.2, 0, 1)
        xr, zr = np.sin(a) * rr, -0.012 - np.cos(a) * rr
        fx = np.clip((xr - XS[0]) / (XS[1] - XS[0]), 0, len(XS) - 1.001); fz = np.clip((zr - ZS[0]) / (ZS[1] - ZS[0]), 0, len(ZS) - 1.001)
        i = fx.astype(int); j = fz.astype(int); u = fx - i; v = fz - j
        hh = (HT[i, j] * (1 - u) + HT[i + 1, j] * u) * (1 - v) + (HT[i, j + 1] * (1 - u) + HT[i + 1, j + 1] * u) * v
        yc = np.maximum(hh, 1.40) + 0.012 + 0.014
        d = np.hypot(np.hypot(x, z + 0.012) - rr, (y - yc) * 0.9) - 0.016
        return smax(d, np.abs(a) - 2.55, 0.01)
    P.append(Custom(collar, (np.array([-0.16, 1.36, -0.14]), np.array([0.16, 1.62, 0.15]))).set(op="u", k=0.006, bone="chest", tag="fur"))
    P.append(E([0, 1.405, 0.122], [0.021, 0.021, 0.007], rot_x(0.35), op='u', k=0.004, bone='chest', tag='gold'))
    P.append(Torus([0, 1.405, 0.127], 0.016, 0.0035, rot_x(0.35 + np.pi / 2)).set(op='u', k=0.002, bone='chest', tag='gold'))
    return P


def smooth01(x):
    t = np.clip(x, 0, 1); return t * t * (3 - 2 * t)


# ------------------------------ the mantle of the south: a toga, a himation ------------------------------
TOGA_N = np.array([0.856, -0.517, 0.0]); TOGA_C = np.array([-0.025, 1.26, 0.0]); TOGA_W = 0.11


def toga():
    """The draped mantle of the south — a Roman's toga, a Greek's himation (worn over a long robe, saiaL): a broad band of
    it round the body from the right hip up across the chest and the back to the left shoulder, lying on them, thick with
    the rolls of its folds; its two ends falling from the left shoulder — down the front to the knee, down the back to the
    calf — in folds of their own. The left arm hangs beside the ends, not inside them."""
    TH, YS, R0, RB = drape()
    torso = _torso(0.0)
    th_ = 0.012                                              # (a thick wool, two cells of the grid at least: no torn sheet)
    def band(P):
        x, y, z = P[:, 0], P[:, 1], P[:, 2]
        sb = (P - TOGA_C) @ TOGA_N                                    # (across the band: 0 along its middle)
        # (its rolls: four across it, round, the hollows between them deeper; a little crooked along the body)
        ph = sb / 0.055 * 2 * np.pi + 0.6 + 1.1 * np.sin(y * 9.0 + z * 6.0)
        off = 0.016 + 0.016 * (0.5 + 0.5 * np.cos(ph)) ** 0.7 + 0.004 * np.sin(y * 23.0 + x * 17.0)
        shell = np.abs(_union(torso, P) - off) - th_ * 0.5
        across = np.abs(sb) - TOGA_W
        low = 0.93 - y                                                 # (from the hip up: the thighs move under it)
        return smax(smax(shell, across, 0.01), low, 0.02)
    # (the two ends: hanging as a cape hangs, from under the band at the left — in front, toward the middle of the chest;
    # behind, over the left shoulder blade — their folds narrower)
    PL = np.stack([0.8 * pleat(t * 1.6 + 0.3, YS)[0] for t in TH]); Rf = np.maximum(R0 + PL, RB + 0.01)
    dRt = np.gradient(Rf, TH, axis=0); dRy = np.gradient(Rf, -0.01, axis=1)
    def ends(P):
        x, y, z = P[:, 0], P[:, 1], P[:, 2]
        th = np.arctan2(x, -(z - CZ)); rho = np.hypot(x, z - CZ)
        Rr = _table(TH, YS, Rf, th, y); gt = _table(TH, YS, dRt, th, y) / np.maximum(rho, 0.05); gy = _table(TH, YS, dRy, th, y)
        shell = np.abs((rho - Rr) / np.sqrt(1 + gt * gt + gy * gy)) - th_ * 0.5
        # (in front: between 22° and 58° from the middle toward the left, from the band to the knee; behind: from 10° to 52°
        # from the middle toward the left, from the band to the calf)
        fr = np.maximum(np.maximum((1.92 - th) * rho, (th - 2.86) * rho), np.maximum(0.45 - y, y - 1.40))   # (arcs, in metres)
        bk = np.maximum(np.maximum((-0.05 - th) * rho, (th - 1.05) * rho), np.maximum(0.32 - y, y - 1.47))
        return smax(shell, np.minimum(fr, bk), 0.006)
    def f(P): return smin(band(P), ends(P), 0.02)
    return [Custom(f, (np.array([-0.32, 0.28, -0.3]), np.array([0.36, 1.68, 0.26]))).set(bone='chest')]


def tanga():
    """The loincloth of the jungle, the maxtlatl: a band of cotton round the waist; its ends hanging in front and behind to
    above the knees, a hand and a half wide, standing a little off the thighs."""
    y0, y1 = 1.0, 0.6
    def f(P):
        x, y, z = P[:, 0], P[:, 1], P[:, 2]
        t = np.clip((y0 - y) / (y0 - y1), 0, 1)
        rx = 0.168 + 0.03 * t; rz = 0.126 + 0.05 * t
        k0 = np.hypot(x / rx, (z + 0.006) / rz); shell = np.abs((k0 - 1.0) * np.minimum(rx, rz)) - 0.0055
        band = np.maximum(y - y0, 0.935 - y)                                  # (all round the waist)
        flap = np.maximum(np.abs(x) - (0.08 + 0.012 * t), np.maximum(y1 - y, y - 0.97))   # (in front and behind)
        return smax(shell, np.minimum(band, flap), 0.004)
    return [Custom(f, (np.array([-0.24, y1 - 0.03, -0.24]), np.array([0.24, y0 + 0.02, 0.24]))).set(bone='pel')]


def piece(name):
    """The pieces made by a function of their own (not a hair, a beard, a skirt, a hat), by name — or None."""
    f = {'toga': toga, 'tanga': tanga}.get(name)
    return f() if f else None


# ------------------------------ hats ------------------------------
def hat(kind):
    c = CRAN_C
    if kind == 'gorro':
        # (a cap of wool, a little pointed, its edge rolled)
        def f(P):
            d = ell_sdf(P, c + np.array([0, 0.012, -0.004]), CRAN_R + np.array([0.026, 0.034, 0.026]))
            d = smin(d, ell_sdf(P, c + np.array([0, 0.085, -0.02]), np.array([0.05, 0.05, 0.05])), 0.04)
            q = P - c; rim = 1.735 * 1.0 + 0.012 * np.cos(np.arctan2(q[:, 0], q[:, 2])) - 0.0
            return smax(d, rim - 0.02 - P[:, 1], 0.005)
        return [Custom(f, (c - 0.16, c + 0.2)).set(bone='head', tag='hat'), Torus(c + np.array([0, 1.733 - c[1] - 0.012, -0.004]), 0.1, 0.012, rot_x(0.12), sy=0.9).set(op='u', k=0.006, bone='head', tag='hat')]
    if kind == 'elmo':
        # (the northern helmet: a dome of iron plates, a band round the brow, the guard down over the nose)
        def f(P):
            d = ell_sdf(P, c + np.array([0, 0.01, -0.004]), CRAN_R + np.array([0.03, 0.04, 0.03]))
            d = smin(d, ell_sdf(P, c + np.array([0, 0.09, -0.005]), np.array([0.035, 0.05, 0.035])), 0.05)
            q = P - c; rim = 1.738 + 0.01 * np.cos(np.arctan2(q[:, 0], q[:, 2]))
            return smax(d, rim - 0.022 - P[:, 1], 0.004)
        P = [Custom(f, (c - 0.17, c + 0.2)).set(bone='head', tag='metal'),
             Torus(c + np.array([0, 1.728 - c[1], -0.004]), 0.106, 0.009, rot_x(0.1), sy=1.4).set(op='u', k=0.004, bone='head', tag='metal'),
             RBox(H([0, 1.69, 0.128]), [0.007, 0.034, 0.005], 0.004, rot_x(-0.22)).set(op='u', k=0.004, bone='head', tag='metal')]
        return P
    if kind == 'chapeu':
        def f(P):
            d = ell_sdf(P, c + np.array([0, 0.03, -0.004]), CRAN_R * np.array([1, 0.85, 1]) + np.array([0.03, 0.03, 0.03]))
            return smax(d, 1.735 - P[:, 1], 0.006)
        P = [Custom(f, (c - 0.16, c + 0.2)).set(bone='head', tag='straw'),
             E(c + np.array([0, 1.742 - c[1], 0.0]), [0.21, 0.007, 0.2], rot_x(0.08), op='u', k=0.02, bone='head', tag='straw')]
        return P
    if kind == 'capuz':
        # (a hood: round the head with the face open, down over the neck to a cowl on the shoulders, a point behind)
        def f(P):
            q = P - c
            d = ell_sdf(P, c + np.array([0, 0.0, -0.012]), CRAN_R + np.array([0.034, 0.03, 0.04]))
            cowl = ell_sdf(P, np.array([0, 1.46, -0.01]), np.array([0.2, 0.08, 0.15]))
            neck = ell_sdf(P, np.array([0, 1.56, -0.012]), np.array([0.095, 0.1, 0.1]))
            d = smin(smin(d, cowl, 0.05), neck, 0.04)
            d = smin(d, RoundCone(c + np.array([0, 0.05, -0.08]), c + np.array([0, -0.02, -0.17]), 0.05, 0.01).sdf(P), 0.04)
            shell = np.abs(d) - 0.006
            opening = ell_sdf(P, c + np.array([0, -0.075, 0.12]), np.array([0.072, 0.105, 0.11]))
            return smax(smax(shell, -opening, 0.008), 1.4 - P[:, 1], 0.005)
        return [Custom(f, (np.array([-0.24, 1.36, -0.3]), np.array([0.24, 1.95, 0.24]))).set(bone='head', tag='hood')]
    if kind == 'lenco':
        # (a headscarf of linen over the hair, its knot at the nape, its ends down the neck)
        def f(P):
            d = ell_sdf(P, c + np.array([0, 0.006, -0.008]), CRAN_R + np.array([0.022, 0.024, 0.024]))
            q = P - c; edge = hairline(P) * 0 + (1.745 + 0.0 * q[:, 0]) - P[:, 1] + np.clip(-q[:, 2] / 0.09, 0, 1) * 0.13
            shell = smax(np.abs(d) - 0.004, edge, 0.006)
            knot = ell_sdf(P, H([0, 1.645, -0.112]), np.array([0.03, 0.022, 0.02]))
            ends = RoundCone(H([0, 1.64, -0.115]), np.array([0, 1.5, -0.105]), 0.022, 0.03).sdf(P)
            return smin(smin(shell, knot, 0.01), np.maximum(ends, np.abs(P[:, 2] + 0.105) - 0.006), 0.01)
        return [Custom(f, (c - 0.16, c + np.array([0.16, 0.16, 0.16]))).set(bone='head', tag='scarf'), ]
    if kind == 'galea':
        # (the helmet of the south — a legionary's, a hoplite's: a dome, a brim round the brow, a guard flaring over the nape,
        # cheek-pieces down the face; a crest of dyed horsehair along its top, front to back)
        def f(P):
            d = ell_sdf(P, c + np.array([0, 0.012, -0.004]), CRAN_R + np.array([0.03, 0.038, 0.03]))
            q = P - c; a = np.arctan2(q[:, 0], q[:, 2]); rim = 1.733 + 0.012 * np.cos(a)
            d = smax(d, rim - 0.02 - P[:, 1], 0.004)
            # (the nape guard: a flared shell behind, from the rim down and out)
            neck = np.abs(ell_sdf(P, c + np.array([0, -0.03, -0.02]), CRAN_R + np.array([0.045, 0.02, 0.05]))) - 0.004
            neck = smax(smax(neck, q[:, 2] + 0.035, 0.01), np.maximum(1.645 - P[:, 1], P[:, 1] - 1.735), 0.008)
            return smin(d, neck, 0.012)
        P = [Custom(f, (c - np.array([0.19, 0.19, 0.19]), c + np.array([0.19, 0.2, 0.19]))).set(bone='head', tag='metal')]
        for sd in (1, -1):
            P.append(E(H([0.09 * sd, 1.66, 0.04]), [0.008, 0.042, 0.03], rot_y(-0.45 * sd) @ rot_x(0.1), op='u', k=0.01, bone='head', tag='metal'))
        # (the crest: a brush of horsehair, an arch from over the brow to the nape, standing a hand high, thinning at its ends)
        cc = c + np.array([0, 0.012, -0.004]); r0 = CRAN_R[1] + 0.034
        def crest(Q):
            q = Q - cc; rho = np.hypot(q[:, 1], q[:, 2]); a = np.arctan2(q[:, 2], q[:, 1])
            h = 0.075 * (1 - (a / 1.2) ** 2).clip(0.15, 1)
            return np.maximum.reduce([np.abs(q[:, 0]) - 0.012, np.abs(rho - r0 - h / 2) - h / 2, np.abs(a) - 1.2])
        P.append(Custom(crest, (cc - np.array([0.02, 0.0, 0.25]), cc + np.array([0.02, 0.25, 0.25]))).set(op='u', k=0.008, bone='head', tag='crista'))
        P.append(RoundCone(c + np.array([0, 0.1, 0.075]), c + np.array([0, 0.135, 0.02]), 0.01, 0.008).set(op='u', k=0.01, bone='head', tag='metal'))
        return P
    if kind == 'nemes':
        # (the striped headcloth of a pharaoh: close over the skull, a band across the brow; flaring behind the ears into two
        # lappets that fall in front of the shoulders to the chest; gathered behind into a tail; the cobra over the brow)
        def f(P):
            q = P - c; y = P[:, 1]
            d = ell_sdf(P, c + np.array([0, 0.008, -0.01]), CRAN_R + np.array([0.022, 0.024, 0.026]))
            front = (1.752 + 0.004 * np.cos(np.arctan2(q[:, 0], q[:, 2]))) - y
            d = smax(d, front * smooth01(q[:, 2] / 0.04 + 0.5) - (1 - smooth01(q[:, 2] / 0.04 + 0.5)) * 0.05, 0.004)
            return d
        P = [Custom(f, (c - np.array([0.21, 0.32, 0.19]), c + np.array([0.21, 0.16, 0.19]))).set(bone='head', tag='nemes')]
        for sd in (1, -1):
            # (the flap: a plate from the temple behind the ear, leaning out as it falls to the shoulder — then the lappet in
            # front of the shoulder, to the chest)
            P.append(RBox(np.array([0.12 * sd, 1.6, -0.012]), [0.006, 0.11, 0.092], 0.006, rot_z(0.3 * sd) @ rot_y(0.12 * sd)).set(op='u', k=0.045, bone='head', tag='nemes', tau=0.03))
            P.append(RBox(np.array([0.148 * sd, 1.43, 0.05]), [0.034, 0.07, 0.008], 0.006, rot_z(0.1 * sd)).set(op='u', k=0.035, bone='chest', tag='nemes', tau=0.03))
        P.append(RoundCone(H([0, 1.655, -0.105]), np.array([0, 1.47, -0.13]), 0.03, 0.02).set(op='u', k=0.03, bone='chest', tag='nemes', tau=0.03))
        P.append(RoundCone(H([0, 1.752, 0.112]), H([0, 1.79, 0.118]), 0.008, 0.012).set(op='u', k=0.006, bone='head', tag='gold'))
        return P
    if kind == 'penacho':
        # (the feathers of a lord of the jungle: a band round the head, of gold, and a fan of long quetzal feathers rising
        # from it behind, from ear to ear, curving back)
        P = [Torus(c + np.array([0, 0.04, -0.008]), 0.1, 0.011, rot_x(0.18), sy=1.4).set(bone='head', tag='gold')]
        for k in range(9):
            a = (k / 8 - 0.5) * 2.5                                     # (from beside one ear round the back to the other)
            base = c + np.array([np.sin(a) * 0.098, 0.045 + 0.02 * np.cos(a), -np.cos(a) * 0.098 - 0.01])
            L = 0.36 + 0.14 * np.cos(a * 0.9)
            d = np.array([np.sin(a) * 1.0, 1.0, -np.cos(a) * 0.75 - 0.45]); d /= np.linalg.norm(d)
            tip = base + d * L
            P.append(E((base + tip) / 2, [0.045, L / 2, 0.007], frame_rot(d, np.array([np.sin(a), 0, -np.cos(a)])), op='u', k=0.008, bone='head', tag='plumas'))
        return P
    if kind == 'louro':
        # (a wreath of laurel: a ring a little higher behind, its leaves along it in pairs, pointing back)
        P = [Torus(c + np.array([0, 0.045, -0.01]), 0.1, 0.0055, rot_x(0.22)).set(bone='head', tag='folha')]
        for k in range(22):
            a = (k / 22) * 2 * np.pi; sd = 1 if k % 2 else -1
            if abs(np.sin(a / 2)) < 0.17: continue                     # (open over the brow)
            p0 = c + np.array([np.sin(a) * 0.101, 0.045 + 0.022 * (0.5 - 0.5 * np.cos(a)) + 0.007 * sd, np.cos(a) * 0.101 - 0.01])
            tg = np.array([np.cos(a), 0.15, -np.sin(a)]); out = np.array([np.sin(a), 0.4 * sd, np.cos(a)])
            P.append(E(p0 + tg * 0.016 * np.sign(np.sin(a)) + out * 0.008, [0.01, 0.003, 0.024], frame_rot(out, tg), op='u', k=0.004, bone='head', tag='folha'))
        return P
    if kind == 'coroa':
        P = [Torus(c + np.array([0, 1.762 - c[1], -0.006]), 0.094, 0.009, sy=1.6).set(bone='head', tag='gold')]
        for k in range(5):
            a = k / 5 * 2 * np.pi + np.pi / 5 * 0
            p0 = c + np.array([np.sin(a) * 0.094, 1.772 - c[1], np.cos(a) * 0.094 - 0.006])
            P.append(RoundCone(p0, p0 + np.array([0, 0.034, 0]), 0.012, 0.003).set(op='u', k=0.006, bone='head', tag='gold'))
        return P
    raise ValueError(kind)


def E(c, r, R=None, **kw):
    return Ellipsoid(c, r, R).set(**kw)
