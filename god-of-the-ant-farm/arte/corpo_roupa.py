# corpo_roupa: hair, beards, the clothes that stand off the body, and the hats — in the clay of corpo_sdf, shaped on the
# head and the body of corpo_forma (the same bind pose). Each piece: its primitives, its zone (how js/body3d.js paints
# it) and how its points are weighted to the rig's bones (rules of where they are: hair from the head down the back,
# a skirt following the legs, a cape the shoulders then its own bones).
import numpy as np
from corpo_sdf import Sphere, Ellipsoid, RoundCone, RBox, Plane, Custom, Torus, smin, smax, rot_x, rot_y, rot_z
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
            face = np.maximum.reduce([0.075 * HK - np.abs(q[:, 0]), q[:, 2] - 0.03, H([0, 1.748, 0])[1] - P[:, 1]])
            return smax(d, face, 0.004)
        P = [Custom(bob, (CRAN_C - 0.16, CRAN_C + 0.16)).set(bone='head')]
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
def skirt(long):
    """A tunic's skirt from the belt to the knee — or a dress, a robe, to the ankle: a thin shell round the hips that flares,
    its folds deepening toward the hem."""
    y0, y1 = 1.012, (0.12 if long else 0.5)
    rx0, rz0 = 0.168, 0.124; rx1, rz1 = (0.29, 0.27) if long else (0.22, 0.185)
    def f(P):
        y = P[:, 1]; t = np.clip((y0 - y) / (y0 - y1), 0, 1); e = t ** 0.8
        rx = rx0 + (rx1 - rx0) * e; rz = rz0 + (rz1 - rz0) * e
        th = np.arctan2(P[:, 0], P[:, 2])
        rr = 1.0 + 0.035 * t * np.sin(th * 13 + 0.6 * np.sin(th * 3)) + 0.02 * t * np.sin(th * 5)
        q = np.stack([P[:, 0] / (rx * rr), (P[:, 2] + 0.006) / (rz * rr)], 1); k0 = np.linalg.norm(q, axis=1)
        d = (k0 - 1.0) * np.minimum(rx, rz)                       # (≈ the distance to the ellipse round the body)
        shell = np.abs(d) - 0.006
        return smax(shell, np.maximum(y - y0, y1 - y), 0.003)
    ext = rx1 + 0.04
    return [Custom(f, (np.array([-ext, y1 - 0.02, -ext]), np.array([ext, y0 + 0.02, ext]))).set(bone='pel')]


def cape():
    """A cape over the back: from the shoulders (over their tops, pinned at the chest) to the knees, falling wider."""
    yT, yB = 1.49, 0.55
    def f(P):
        y = P[:, 1]; t = np.clip((yT - y) / (yT - yB), 0, 1)
        rx = 0.25 + 0.08 * t ** 0.7; rz = 0.155 + 0.075 * t
        th = np.arctan2(P[:, 0], P[:, 2] + 0.02)
        rr = 1.0 + 0.03 * t * np.sin(th * 9)
        q = np.stack([P[:, 0] / (rx * rr), (P[:, 2] + 0.02) / (rz * rr)], 1); k0 = np.linalg.norm(q, axis=1)
        shell = np.abs((k0 - 1.0) * np.minimum(rx, rz)) - 0.0055
        # (behind the body, wrapping the shoulders; the opening in front a little wider below)
        front = (P[:, 2] + 0.02) / rz - (0.55 - 0.45 * np.clip((1.36 - y) / 0.2, 0, 1))
        top = smax(y - yT, yB - y, 0.004)
        # (over the shoulders the cape lies on them: near its top it narrows round the neck and the shoulder line)
        return smax(smax(shell, top, 0.003), front * 0.1, 0.004)
    def g(P):
        # (the narrowing: at the top the cape's ellipse shrinks toward the neck, so it rests on the shoulders, not over the air)
        y = P[:, 1]; k = np.clip((y - 1.36) / (yT - 1.36), 0, 1); Q = P.copy(); Q[:, 0] = P[:, 0] * (1 + 0.32 * k); Q[:, 2] = (P[:, 2] + 0.02) * (1 + 0.5 * k) - 0.02
        return f(Q) / (1 + 0.4 * k)
    P = [Custom(g, (np.array([-0.36, yB - 0.02, -0.26]), np.array([0.36, yT + 0.03, 0.2]))).set(bone='clk1')]
    return P


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
