# rosto: the parts of the face the clay of corpo_forma does not make (22a, D-553) — the lids of each eye (a shell over the globe
# with a rounded rim, turned by a bone of its own: the blink, the wide eyes of fear, the narrowed ones of a laugh), the mouth opened
# along the line of the lips (the lower lip goes with the jaw), the inside of the mouth (its dark, the teeth, the tongue) and the
# jaw's share of the skin. Every number in metres in the rig's bind pose, the head grown as corpo_forma grows it. Read by
# arte/corpo.py; the bones' hinges go to js/bodymesh.js (face) for js/body3d.js.
import numpy as np
import corpo_forma as CF
from corpo_sdf import field_at

C0 = CF.HEAD_PIVOT + np.array([0, 0.03, 0]); K = 1.06   # (the head's growth: corpo_forma.body)


def g(p):
    return C0 + (np.asarray(p, float) - C0) * K


MOUTH_Y = float(g([0, 1.612, 0.104])[1])   # where the lips meet (the cut between them, corpo_forma.head)
CORNER = 0.0232                             # half the mouth: the lips joined beyond it
JAW = g([0, 1.652, -0.004])                # the jaw's hinge, in front of the ears: the axis across the head
# the lids' edges at rest, as elevations about the eye's centre — stylised (D-553): the opening ≈ 1.36× the old painted one, the
# eye a wide almond; the corners where the two edges meet
LID_UP, LID_LO, LID_CORNER, LID_PHI = np.radians(35.0), np.radians(38.0), np.radians(64.0), np.radians(115.0)
# the calm rest (D-557): each lid turned on its bone's axis, kept in the mesh — the upper one down over the top of the iris (a tenth
# or so of it), the lower one a little open, to the iris's rim; the white above and below is the wide channel's, never the rest's
LID_REST_UP, LID_REST_LO = np.radians(14.0), np.radians(6.0)


def smooth(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)


def landmarks(fem=0.0):
    """What js/body3d.js needs to turn the face's bones: the jaw's hinge, the eyes' centres, the lids' edges at rest."""
    E = CF.eyes(fem)
    return {'jaw': [round(float(x), 6) for x in JAW], 'eyes': [[round(float(x), 6) for x in c] for c, r in E], 'eyeR': round(float(E[0][1]), 6),
            'mouth': round(MOUTH_Y, 6), 'lid': [round(float(LID_UP - LID_REST_UP), 5), round(float(LID_LO + LID_REST_LO), 5), round(float(LID_CORNER), 5)]}


# ------------------------------ the jaw's share of the skin ------------------------------
def jaw_weight(V):
    """How much each point of the skin goes with the jaw: the lower lip, the chin and the jaw's line wholly; the cheeks less toward
    the hinge; the throat and the nape not at all."""
    x, y, z = V[:, 0], V[:, 1], V[:, 2]; ax = np.abs(x)
    line = MOUTH_Y + np.maximum(0, ax - CORNER) * 0.7       # (past the corners the line rises toward the hinge)
    # (between the corners the lower lip goes whole and the upper lip not at all — the skin is cut there, split_mouth —; past them
    # a band, and the corners stretch half way: the mouth opens as an oval, never as a star)
    hard = (y < line - 1e-7).astype(float); soft = smooth(line + 0.002, line - 0.006, y)
    k = smooth(CORNER - 0.002, CORNER + 0.004, ax)
    below = hard * (1 - k) + soft * k
    below = below * (1 - 0.45 * smooth(CORNER - 0.006, CORNER + 0.008, ax) * smooth(line - 0.014, line, y))
    front = smooth(-0.01, 0.035, z)
    side = smooth(0.08, 0.062, ax)
    under = smooth(1.50, 1.535, y)
    return below * front * side * under


def split_mouth(V, T):
    """The lips opened: the skin cut along the line where the lips meet (the triangles across it split there, the new points on
    the line), and the points of the line between the corners made twice — the lower lip's triangles taking the copies. At rest
    the copies are where the points were: the mouth is closed; the jaw opens it. Returns (V2, T2, side): +1 a point of the line
    the upper lip keeps, -1 its copy, 0 the others."""
    Y = MOUTH_Y; V = [np.asarray(v, float) for v in V]; cache = {}; out = []
    def cut(a, b):
        key = (min(a, b), max(a, b))
        if key not in cache:
            pa, pb = V[a], V[b]; t = (Y - pa[1]) / (pb[1] - pa[1]); q = pa + (pb - pa) * t; q[1] = Y
            V.append(q); cache[key] = len(V) - 1
        return cache[key]
    for tri in T:
        P3 = [V[k] for k in tri]; c = (P3[0] + P3[1] + P3[2]) / 3
        if not (abs(c[0]) < CORNER + 0.008 and abs(c[1] - Y) < 0.016 and c[2] > 0.08): out.append((list(tri), 0)); continue
        sg = [1 if q[1] >= Y else -1 for q in P3]
        if sg[0] == sg[1] == sg[2]: out.append((list(tri), sg[0])); continue
        # (one point alone on its side: the triangle split into one on its side and two on the other, the winding kept)
        k = [m for m in range(3) if sg[m] != sg[(m + 1) % 3] and sg[m] != sg[(m + 2) % 3]][0]
        a, b, cc = tri[k], tri[(k + 1) % 3], tri[(k + 2) % 3]
        pq, qq = cut(a, b), cut(a, cc)
        out.append(([a, pq, qq], sg[k])); out.append(([pq, b, cc], -sg[k])); out.append(([pq, cc, qq], -sg[k]))
    V = np.array(V); T2 = np.array([t for t, _ in out]); sd = np.array([q for _, q in out])
    online = (np.abs(V[:, 1] - Y) < 1e-9) & (np.abs(V[:, 0]) < CORNER)
    used_low = np.zeros(len(V), bool); used_low[T2[sd == -1].ravel()] = True
    dup = np.where(online & used_low)[0]
    mp = np.full(len(V), -1); mp[dup] = len(V) + np.arange(len(dup))
    low = T2[sd == -1]; T2[sd == -1] = np.where(mp[low] >= 0, mp[low], low)
    side = np.zeros(len(V) + len(dup), np.int8); side[dup] = 1; side[len(V):] = -1
    return np.vstack([V, V[dup]]), T2, side


# ------------------------------ the lids ------------------------------
def _sph(c, r, phi, e):
    return c + np.stack([r * np.sin(phi) * np.cos(e), r * np.sin(e), r * np.cos(phi) * np.cos(e)], -1)


def lid_edge(phi, top):
    """The edge of a lid at azimuth phi (0 forward, ±π behind): the almond between the corners, the eye's equator beyond them."""
    t = np.clip(1 - (phi / LID_CORNER) ** 2, 0, 1)
    return LID_UP * t ** 0.55 if top else -LID_LO * t ** 0.7


def lid(c, rg, top, nu=18, rim=3, shell=4, prims=None):
    """A lid of the eye at c (the left one; corpo.py mirrors it): a cap of the sphere a little over the globe — the whole upper
    (lower) half of it but the almond of the opening —, closing at the pole, with a thick round rim at its edge, dark with the
    lashes in front. Turned on its bone about the eye's centre it stays on that sphere: closed, the upper one comes down under the
    lower one (the lower a hair outside it), and the line seen is the lower lid's — a gentle curve, as a closed eye has.
    Returns V, T, N, zone (0 lid, 1 rim of lashes)."""
    ro, ri = rg * (1.08 if top else 1.09), rg * 1.012; rm, rt = (ro + ri) / 2, (ro - ri) / 2
    sg = 1 if top else -1
    t = np.linspace(-1, 1, nu, endpoint=False) + 1.0 / nu          # (a closed ring of columns, denser in front: the almond)
    phis = np.sign(t) * np.pi * np.abs(t) ** 1.5
    edge = lid_edge(phis, top)
    front = np.abs(phis) < LID_CORNER + np.radians(8)              # (the lashes only along the opening)
    rows = [(ri, sg * np.radians(8.0), None)]                      # (the flap under the rim, hidden against the globe)
    for k in range(rim + 1):
        a = -np.pi / 2 + np.pi * k / rim
        rows.append((rm + rt * np.sin(a), -sg * (rt / rm) * np.cos(a), 'rim'))
    for k in range(1, shell + 1):
        rows.append((ro, None, k / (shell + 1)))                   # (toward the pole, a share of the way from the edge)
    V = []; Z = []
    for r, de, z in rows:
        if z is None or z == 'rim': e = edge + de
        else: e = edge + (sg * np.pi / 2 - edge) * (z ** 0.9)
        V.append(_sph(c, r, phis, e)); Z.append(np.where(front, 1, 0) if z == 'rim' else np.zeros(nu, int))
    V.append(_sph(c, ro, np.zeros(1), np.array([sg * np.pi / 2]))); Z.append(np.zeros(1, int))   # (the pole)
    V = np.concatenate(V); Z = np.concatenate(Z).astype(np.uint8)
    nr = len(rows); T = []
    for j in range(nr - 1):
        for i in range(nu):
            i2 = (i + 1) % nu; a, b, cc, d = j * nu + i, j * nu + i2, (j + 1) * nu + i, (j + 1) * nu + i2
            T += [[a, cc, b], [b, cc, d]]
    pole = nr * nu
    for i in range(nu): T.append([(nr - 1) * nu + i, pole, (nr - 1) * nu + (i + 1) % nu])
    T = np.array(T)
    fn = np.cross(V[T[:, 1]] - V[T[:, 0]], V[T[:, 2]] - V[T[:, 0]]); N = np.zeros_like(V)
    for k in range(3): np.add.at(N, T[:, k], fn)
    N /= np.maximum(np.linalg.norm(N, axis=1), 1e-12)[:, None]
    # (wound so that the outside faces out: away from the globe — the shell's rows, not the flap's)
    sh = slice((rim + 2) * nu, nr * nu)
    if ((V[sh] - c) * N[sh]).sum(1).mean() < 0: T = T[:, [0, 2, 1]]; N = -N
    # (the calm rest: turned about the eye's centre on the bone's own axis — x —, as Body3D turns it: positive closes the upper
    # one and opens the lower one)
    a = LID_REST_UP if top else LID_REST_LO; ca, sa = np.cos(a), np.sin(a)
    def turn(P, o):
        q = P - o; return np.stack([q[:, 0], q[:, 1] * ca - q[:, 2] * sa, q[:, 1] * sa + q[:, 2] * ca], 1) + o
    V = turn(V, np.asarray(c, float)); N = turn(N, np.zeros(3))
    return V, T, N, Z


# ------------------------------ the inside of the mouth ------------------------------
def _ellipsoid(c, r, nu, nv, inward=False):
    V = []; T = []
    for j in range(nv + 1):
        th = np.pi * j / nv
        for i in range(nu):
            ph = 2 * np.pi * i / nu
            V.append(c + r * np.array([np.sin(th) * np.sin(ph), np.cos(th), np.sin(th) * np.cos(ph)]))
    for j in range(nv):
        for i in range(nu):
            a = j * nu + i; b = j * nu + (i + 1) % nu; cc = (j + 1) * nu + i; d = (j + 1) * nu + (i + 1) % nu
            if j > 0: T.append([a, cc, b])
            if j < nv - 1: T.append([b, cc, d])
    V = np.array(V); T = np.array(T)
    N = (V - c) / (r * r); N /= np.linalg.norm(N, axis=1)[:, None]
    if inward: T = T[:, [0, 2, 1]]; N = -N
    return V, T, N


def _inside(prims, V, by=0.0025, toward=None):
    """Points of a part of the mouth kept inside the head: pulled toward its middle until the clay is around them."""
    if prims is None: return V
    toward = V.mean(0) if toward is None else toward
    f = field_at(prims, V); bad = f > -by
    for _ in range(20):
        if not bad.any(): break
        V[bad] = toward + (V[bad] - toward) * 0.95
        f = field_at(prims, V); bad = f > -by
    return V


def teeth(top, n=11):
    """A row of teeth behind the lips: an arch of a band, its front, its edge and its back."""
    xs = np.linspace(-0.0205, 0.0205, n); zf = 0.0955 - 26 * xs ** 2
    y0, y1 = (MOUTH_Y + 0.004, MOUTH_Y - 0.0042) if top else (MOUTH_Y - 0.002, MOUTH_Y - 0.0105)
    if not top: zf = zf - 0.0016
    th = 0.0028
    # (the arch's outward direction at each column)
    dz = -52 * xs; nx = -dz; nz = np.ones_like(xs); l = np.hypot(nx, nz); nx /= l; nz /= l
    rows = [(y0, 0.0), (y1 + (0.0008 if top else -0.0008), 0.0), (y1, th * 0.5), (y1 + (0.0008 if top else -0.0008), th), (y0, th)]
    V = []; N = []
    for y, back in rows:
        for i in range(n):
            V.append([xs[i] - nx[i] * back, y, zf[i] - nz[i] * back]); N.append([nx[i], 0.0, nz[i]])
    V = np.array(V); N = np.array(N); T = []
    for j in range(len(rows) - 1):
        for i in range(n - 1):
            a, b, c, d = j * n + i, j * n + i + 1, (j + 1) * n + i, (j + 1) * n + i + 1
            T += [[a, c, b], [b, c, d]] if top else [[a, b, c], [b, d, c]]
    T = np.array(T)
    fn = np.cross(V[T[:, 1]] - V[T[:, 0]], V[T[:, 2]] - V[T[:, 0]]); N = np.zeros_like(V)
    for k in range(3): np.add.at(N, T[:, k], fn)
    N /= np.maximum(np.linalg.norm(N, axis=1), 1e-12)[:, None]
    if (N[:n, 2]).mean() < 0: T = T[:, [0, 2, 1]]; N = -N
    return V, T, N


def mouth(prims=None, near=True):
    """The inside of the mouth: [(V, T, N, zone name, bone)] — its dark (one with the head, one with the jaw: open, the two cover
    the hollow), the teeth above (the head's) and below (the jaw's), the tongue (the jaw's)."""
    out = []
    nu, nv = (12, 8) if near else (8, 5)
    mid = np.array([0, MOUTH_Y - 0.004, 0.082])
    for bone in ('head', 'jaw'):
        V, T, N = _ellipsoid(mid, np.array([0.031, 0.018, 0.032]), nu, nv, inward=True)
        V = _inside(prims, V, 0.002, mid)
        out.append((V, T, N, 'boca', bone))
    for top in (True, False):
        V, T, N = teeth(top, 11 if near else 7)
        V = _inside(prims, V, 0.0012, mid)
        out.append((V, T, N, 'dente', 'head' if top else 'jaw'))
    V, T, N = _ellipsoid(np.array([0, MOUTH_Y - 0.0095, 0.078]), np.array([0.0165, 0.0048, 0.019]), 10 if near else 6, 5 if near else 4)
    out.append((V, T, N, 'lingua', 'jaw'))
    return out
