# corpo_forma: the shape of a person, in the clay of corpo_sdf — the body (a man's, a woman's), the hands with their
# thumbs, the shoes, the face (eye sockets, nose, lips, ears). Every number is in metres in the rig's bind pose: the
# frames js/people3d.js computes (pelvis at 0.92, the shoulders 0.235 out and 1.44 up, the arms open by BIND_ROLL, the
# hips 0.095 out, thigh 0.44, shin SHIN, the ankle 0.02 forward). Each piece names the bone that carries it.
# The look is stylised: a head and hands a little big, a man's shoulders broad and his waist narrow, a woman's waist
# and hips, round strong calves, sturdy shoes — clothes are painted over this shape, so it is a clothed shape.
import numpy as np
from corpo_sdf import Sphere, Ellipsoid, RoundCone, RBox, Plane, Custom, rot_x, rot_y, rot_z

# ------------------------------ the rig's bind pose (must match js/body3d.js: it checks) ------------------------------
HIP_Y = 0.92
TRUNK = 0.06            # pelvis → trunk
NECK = 0.56             # trunk → neck (the head's pivot)
SH_X, SH_Y = 0.235, 0.46  # trunk → shoulder
UPPER, FORE = 0.30, 0.29
HIP_X, HIP_DY = 0.095, -0.04
THIGH, SHIN, ANKLE_Z = 0.44, 0.40, 0.02
BIND_ROLL = 0.6         # the arms open from the body (A-pose) in the bind: the rig's roll sr + sd*0.05
KNUCKLE = 0.092         # wrist → knuckles (the fingers' bone)
TOE_Z, TOE_Y = 0.118, -0.035   # ankle → the ball of the foot, forward and down (the toes' bone)

S_L = np.array([SH_X, HIP_Y + TRUNK + SH_Y, 0.0])
D_L = np.array([np.sin(BIND_ROLL), -np.cos(BIND_ROLL), 0.0])   # down the left arm
O_L = np.array([np.cos(BIND_ROLL), np.sin(BIND_ROLL), 0.0])    # out (and up) from it, in the body's plane
FW = np.array([0.0, 0.0, 1.0])
E_L = S_L + D_L * UPPER
W_L = E_L + D_L * FORE
HIPJ_L = np.array([HIP_X, HIP_Y + HIP_DY, 0.0])
KNEE_L = HIPJ_L + np.array([0, -THIGH, 0])
ANK_L = KNEE_L + np.array([0, -SHIN, ANKLE_Z])
ARM_R = np.stack([O_L, -D_L, FW], axis=1)   # the arm's own frame (columns: out, up the arm, forward)
HEAD_PIVOT = np.array([0, HIP_Y + TRUNK + NECK, 0.0])


def joints():
    """The bind position of every bone's origin (the left ones; the right ones mirrored)."""
    J = {'pel': [0, HIP_Y, 0], 'chest': [0, HIP_Y + TRUNK, 0], 'head': HEAD_PIVOT,
         'shL': S_L, 'faL': E_L, 'hdL': W_L, 'fgL': W_L + D_L * KNUCKLE,
         'thL': HIPJ_L, 'snL': KNEE_L, 'ftL': ANK_L, 'toeL': ANK_L + np.array([0, TOE_Y, TOE_Z])}
    out = {}
    for k, v in J.items():
        v = np.asarray(v, float); out[k] = v
        if k.endswith('L'): out[k[:-1] + 'R'] = v * np.array([-1, 1, 1])
    return out


def mirror(p, sd):
    return np.asarray(p, float) * np.array([sd, 1, 1])


def arm(sd, t, o=0.0, f=0.0):
    """A point down the arm (t metres from the shoulder joint), o out from it, f forward — on the side sd."""
    return mirror(S_L + D_L * t + O_L * o + FW * f, sd)


def armR(sd):
    R = ARM_R.copy()
    if sd < 0: R = np.diag([-1, 1, 1]) @ R @ np.diag([-1, 1, 1])
    return R


def E(c, r, R=None, **kw):
    return Ellipsoid(c, r, R).set(**kw)


def side(sd, name):
    return name + ('L' if sd > 0 else 'R')


def grow(prims, c, k):
    """The primitives scaled about c by k: a part made bigger without moving its joint."""
    c = np.asarray(c, float)
    for p in prims:
        if isinstance(p, Sphere): p.c = c + (p.c - c) * k; p.r *= k
        elif isinstance(p, Ellipsoid): p.c = c + (p.c - c) * k; p.r = p.r * k
        elif isinstance(p, RoundCone): p.a = c + (p.a - c) * k; p.b = c + (p.b - c) * k; p.ra *= k; p.rb *= k
        elif isinstance(p, RBox): p.c = c + (p.c - c) * k; p.h = p.h * k; p.r *= k
        p.k *= k
    return prims


# ------------------------------ the body ------------------------------
def body(fem=0.0):
    """The primitives of a body: fem 0 a man, 1 a woman."""
    m = lambda a, b: a + (b - a) * fem   # (a man's number, a woman's)
    P = []
    # the trunk: hips, belly, waist, ribs, the shoulder girdle; the chest (or the bust), the back, the buttocks
    P += [E([0, 0.915, -0.004], [m(0.158, 0.172), 0.108, m(0.106, 0.11)], bone='pel', tau=0.05),
          E([0, 1.0, 0.012], [m(0.142, 0.14), 0.1, m(0.098, 0.094)], op='u', k=0.06, bone='pel', tau=0.05),
          E([0, 1.09, 0.008], [m(0.135, 0.116), 0.1, m(0.095, 0.085)], op='u', k=0.06, bone='chest', tau=0.05),
          E([0, 1.255, -0.008], [m(0.165, 0.14), 0.165, m(0.116, 0.1)], op='u', k=0.06, bone='chest', tau=0.04),
          E([0, 1.385, -0.014], [m(0.2, 0.165), 0.075, m(0.1, 0.09)], op='u', k=0.05, bone='chest', tau=0.03)]
    for sd in (1, -1):
        if fem < 0.5:
            P.append(E(mirror([0.072, 1.318, 0.06], sd), [0.084, 0.06, 0.052], rot_z(0.25 * sd), op='u', k=0.035, bone='chest', tau=0.03))
        else:
            P.append(E(mirror([0.056, 1.29, 0.068], sd), [0.064, 0.062, 0.058], rot_z(0.2 * sd) @ rot_x(0.15), op='u', k=0.03, bone='chest', tau=0.03))
        P.append(E(mirror([0.09, 1.27, -0.05], sd), [m(0.09, 0.072), 0.14, 0.068], op='u', k=0.05, bone='chest', tau=0.03))
        P.append(E(mirror([0.072, 0.873, -0.052], sd), [m(0.088, 0.098), m(0.094, 0.102), m(0.076, 0.084)], op='u', k=0.04, bone='pel', tau=0.03))
        # (the trapezius: from the neck out to the shoulder, high — a short strong neck, not a long thin one)
        P.append(RoundCone(mirror([0.045, 1.505, -0.03], sd), mirror([m(0.2, 0.172), 1.445, -0.018], sd), m(0.036, 0.03), m(0.04, 0.032)).set(op='u', k=0.045, bone='chest', tau=0.02))
    # the neck: its lower half the trunk's, its upper half the head's
    P += [RoundCone([0, 1.44, -0.014], [0, 1.535, -0.006], m(0.062, 0.052), m(0.056, 0.047)).set(op='u', k=0.04, bone='chest', tau=0.02),
          RoundCone([0, 1.535, -0.006], [0, 1.61, 0.0], m(0.056, 0.047), m(0.053, 0.045)).set(op='u', k=0.025, bone='head', tau=0.02)]
    P += grow(head(fem), HEAD_PIVOT + np.array([0, 0.03, 0]), 1.06)
    for sd in (1, -1):
        P += arm_prims(sd, fem)
        P += leg_prims(sd, fem)
    return P


def head(fem=0.0):
    m = lambda a, b: a + (b - a) * fem
    H = dict(bone='head', tau=0.03)
    P = [E([0, 1.705, -0.014], [0.089, 0.103, 0.103], op='u', k=0.03, **H),
         E([0, 1.652, 0.028], [m(0.074, 0.068), m(0.086, 0.082), 0.078], op='u', k=0.035, **H)]
    for sd in (1, -1):
        # (the jaw from under the ear to the chin: a man's square, a woman's soft)
        P.append(RoundCone(mirror([m(0.06, 0.054), 1.63, 0.0], sd), mirror([0.022, m(1.577, 1.583), 0.07], sd), m(0.025, 0.02), m(0.021, 0.017)).set(op='u', k=0.03, **H))
        P.append(E(mirror([0.05, 1.668, 0.066], sd), [0.026, 0.016, 0.02], op='u', k=0.03, **H))
    P += [E([0, m(1.574, 1.579), m(0.082, 0.079)], [m(0.025, 0.02), m(0.02, 0.018), 0.018], op='u', k=0.022, **H),
          E([0, 1.722, 0.083], [0.058, m(0.015, 0.011), m(0.014, 0.01)], op='u', k=0.025, **H)]
    for sd in (1, -1):
        P.append(Sphere(mirror([0.035, 1.696, 0.1], sd), 0.0225).set(op='s', k=0.012))
    ns = m(1.0, 0.86)
    P += [RoundCone([0, 1.712, 0.092], [0, 1.662, 0.092 + 0.026 * ns], 0.0095 * ns, 0.012 * ns).set(op='u', k=0.012, **H),
          Sphere([0, 1.656, 0.092 + 0.028 * ns], 0.0142 * ns).set(op='u', k=0.008, **H)]
    for sd in (1, -1):
        P.append(Sphere(mirror([0.0138 * ns, 1.652, 0.092 + 0.016 * ns], sd), 0.0105 * ns).set(op='u', k=0.008, **H))
    lp = m(1.0, 1.25)
    P += [E([0, 1.62, 0.097], [0.024, 0.0085 * lp, 0.012], op='u', k=0.009, **H),
          E([0, 1.604, 0.093], [0.02, 0.009 * lp, 0.012], op='u', k=0.009, **H),
          E([0, 1.612, 0.104], [0.023, 0.0015, 0.01], op='s', k=0.003)]
    for sd in (1, -1):
        Re = rot_y(0.4 * sd)
        P.append(E(mirror([0.088, 1.675, -0.012], sd), [0.012, 0.031, 0.021], Re, op='u', k=0.007, **H))
        P.append(E(mirror([0.097, 1.673, -0.006], sd), [0.006, 0.02, 0.012], Re, op='s', k=0.004))
    return P


def arm_prims(sd, fem=0.0):
    m = lambda a, b: a + (b - a) * fem
    R = armR(sd); a = lambda t, o=0.0, f=0.0: arm(sd, t, o, f)
    sh, fa = side(sd, 'sh'), side(sd, 'fa')
    th = m(1.0, 0.86)  # (a woman's arms slimmer)
    P = [E(a(0.05, 0.016), [0.062 * th, 0.088, 0.066 * th], R, op='u', k=0.045, bone=sh, tau=0.02),
         RoundCone(a(0.02), a(UPPER), 0.052 * th, 0.04 * th).set(op='u', k=0.03, bone=sh, tau=0.02),
         E(a(0.15, 0.0, 0.013), [0.042 * th, 0.088, 0.044 * th], R, op='u', k=0.03, bone=sh, tau=0.02),
         E(a(0.13, 0.0, -0.01), [0.044 * th, 0.092, 0.042 * th], R, op='u', k=0.03, bone=sh, tau=0.02),
         Sphere(a(UPPER, 0.0, -0.006), 0.037 * th).set(op='u', k=0.03, bone={sh: 0.5, fa: 0.5}, tau=0.025),
         RoundCone(a(UPPER), a(UPPER + FORE), 0.041 * th, 0.027 * th).set(op='u', k=0.03, bone=fa, tau=0.02),
         E(a(UPPER + 0.07), [0.048 * th, 0.082, 0.045 * th], R, op='u', k=0.035, bone=fa, tau=0.02),
         E(a(UPPER + FORE - 0.006), [0.021 * th, 0.022, 0.029 * th], R, op='u', k=0.02, bone=fa, tau=0.02)]
    P += hand(sd, fem)
    return P


def hand(sd, fem=0.0):
    """A hand, relaxed: the palm, four fingers a little curled toward it, the thumb in front (the palm faces the body)."""
    hs = 1.08 - 0.09 * fem
    R = armR(sd); w = UPPER + FORE
    a = lambda t, o=0.0, f=0.0: arm(sd, w + t * hs, o * hs, f * hs)
    hd, fg, tb = side(sd, 'hd'), side(sd, 'fg'), side(sd, 'tb')
    O = mirror(O_L, sd); D = mirror(D_L, sd)
    P = [RBox(a(0.047), np.array([0.006, 0.034, 0.03]) * hs, 0.012 * hs, R).set(op='u', k=0.014, bone=hd, tau=0.012),
         E(a(0.036, -0.011, 0.018), np.array([0.012, 0.025, 0.017]) * hs, R, op='u', k=0.01, bone=hd, tau=0.012)]
    # (the fingers among themselves: a sharp join — the grooves between them read; with the palm, a soft one)
    fingers = []
    for f, l1, l2, r in [(0.025, 0.044, 0.038, 0.0092), (0.0085, 0.05, 0.042, 0.0095), (-0.008, 0.047, 0.04, 0.0089), (-0.0235, 0.037, 0.032, 0.0078)]:
        b0 = a(KNUCKLE / hs - 0.004, 0.0, f)
        d1 = D * np.cos(0.25) - O * np.sin(0.25); d2 = D * np.cos(0.85) - O * np.sin(0.85)
        mid = b0 + d1 * l1 * hs; tip = mid + d2 * l2 * hs
        fingers.append((RoundCone(b0, mid, r * hs, r * 0.94 * hs), RoundCone(mid, tip, r * 0.94 * hs, r * 0.8 * hs)))
    def fing(P3):
        acc = np.full(len(P3), 1e3)
        for c1, c2 in fingers:
            acc = np.minimum(acc, np.minimum(c1.sdf(P3), c2.sdf(P3)))
        return acc
    los, his = zip(*[c.bbox() for pair in fingers for c in pair])
    P.append(Custom(fing, (np.min(los, 0), np.max(his, 0))).set(op='u', k=0.01, bone=fg, tau=0.012))
    # the thumb: from the heel of the palm, forward and down, bending toward the palm
    t0 = a(0.022, -0.007, 0.03)
    dA = D * 0.55 + FW * 0.65 - O * 0.3; dA = dA / np.linalg.norm(dA)
    dB = D * 0.75 + FW * 0.35 - O * 0.55; dB = dB / np.linalg.norm(dB)
    t1 = t0 + dA * 0.04 * hs; t2 = t1 + dB * 0.032 * hs
    P += [RoundCone(t0, t1, 0.0128 * hs, 0.0108 * hs).set(op='u', k=0.01, bone=tb, tau=0.012),
          RoundCone(t1, t2, 0.0108 * hs, 0.009 * hs).set(op='u', k=0.006, bone=tb, tau=0.012)]
    return P


def leg_prims(sd, fem=0.0):
    m = lambda a, b: a + (b - a) * fem
    th, sn, ft, toe = side(sd, 'th'), side(sd, 'sn'), side(sd, 'ft'), side(sd, 'toe')
    M = lambda x, y, z: mirror([x, y, z], sd)
    fs = m(1.07, 0.98)  # (sturdy shoes)
    P = [RoundCone(M(0.092, 0.885, -0.005), M(0.095, 0.47, 0.006), m(0.088, 0.092), 0.056).set(op='u', k=0.04, bone=th, tau=0.03),
         E(M(0.098, 0.68, 0.03), [0.067, 0.17, m(0.062, 0.06)], op='u', k=0.04, bone=th, tau=0.03),
         E(M(m(0.126, 0.132), 0.75, -0.005), [m(0.052, 0.06), 0.14, 0.066], op='u', k=0.04, bone=th, tau=0.03),
         Sphere(M(0.095, 0.44, 0.008), 0.047).set(op='u', k=0.03, bone={th: 0.5, sn: 0.5}, tau=0.03),
         E(M(0.095, 0.447, 0.046), [0.025, 0.029, 0.014], op='u', k=0.016, bone=sn, tau=0.02),
         RoundCone(M(0.095, 0.43, -0.004), M(0.095, 0.08, 0.002), m(0.049, 0.046), m(0.034, 0.031)).set(op='u', k=0.025, bone=sn, tau=0.03),
         E(M(0.097, 0.32, -0.028), [m(0.056, 0.05), 0.11, m(0.054, 0.048)], op='u', k=0.035, bone=sn, tau=0.03),
         E(M(0.095, 0.075, 0.005), [0.035 * fs, 0.04, 0.037 * fs], op='u', k=0.02, bone=ft, tau=0.02),
         # the shoe: heel, the arch, the toes (their own bone: they stay on the ground as the heel lifts); a flat sole
         E(M(0.095, 0.03, -0.024), np.array([0.039, 0.04, 0.044]) * fs, op='u', k=0.02, bone=ft, tau=0.02),
         E(M(0.097, 0.034, 0.06 * fs), np.array([0.046, 0.04, 0.076]) * fs, op='u', k=0.03, bone=ft, tau=0.02),
         E(M(0.1, 0.022, 0.15 * fs), np.array([0.048, 0.03, 0.058]) * fs, op='u', k=0.03, bone=toe, tau=0.02)]
    lo, hi = M(0.02, -0.06, -0.12), M(0.19, 0.055, 0.28)
    P.append(Plane([0, -0.004, 0], [0, -1, 0], (np.minimum(lo, hi), np.maximum(lo, hi))).set(op='i', k=0.006))
    return P


EYE_R = 0.0172


def eyes(fem=0.0):
    """The eyeballs (their own spheres in the sockets): centre and radius, left then right — the head's growth included."""
    r = EYE_R * (1.0 + 0.04 * fem) * 1.06
    c0 = HEAD_PIVOT + np.array([0, 0.03, 0])
    return [(c0 + (np.array([0.035 * sd, 1.696, 0.084]) - c0) * 1.06, r) for sd in (1, -1)]
