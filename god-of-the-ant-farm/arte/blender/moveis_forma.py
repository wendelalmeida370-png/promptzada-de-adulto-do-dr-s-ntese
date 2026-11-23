# moveis_forma: the shapes the furniture of the interiors is made of (the interiors 2.0, the front P2, D-710) — a small
# library of solids written straight in the game's frame (metres, Y up, the front toward +Z, the foot of the piece at y = 0),
# each with its normals, its UV and its part (the material the game paints it in), so a piece is a few lines of shapes:
#   the chamfered box (its edges and corners cut, the faces' normals kept flat and the chamfer bending the light from one
#   face to the next — the edge catches the light, as a planed board's does), the board and the top of boards with their
#   seams, the turned leg and every lathe (a profile round the vertical), the tube along a line (a handle, a curved leg, a
#   hoop, a rope), the sheet (a cloth that falls over an edge, a rug), the cushion, the lumpy stone and the embers, the log,
#   the block with an arch cut into it.
# UV: in metres, v along the grain of the wood (the stack's wood pictures run their grain up the picture), u across it — the
# shader scales them by the picture's own metres. The ambient light of each point (how much of the sky a point of the piece
# sees, with the floor under it) is baked into the vertex colours (bake_ao), with Blender's ray tree (mathutils.bvhtree).
# Nothing here is drawn by chance: every jitter comes from a seeded generator, the same piece the same shape.
import math, random
import bpy  # (Blender as a module of Python: its mathutils come with it)
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree

TAU = math.pi * 2

class Parte:
    """the points (position, normal, uv) and the triangles of one material of a model"""
    def __init__(self, name):
        self.name = name; self.P = []; self.N = []; self.UV = []; self.T = []
    def v(self, p, n, uv):
        self.P.append((float(p[0]), float(p[1]), float(p[2]))); l = math.sqrt(n[0] ** 2 + n[1] ** 2 + n[2] ** 2) or 1.0
        self.N.append((n[0] / l, n[1] / l, n[2] / l)); self.UV.append((float(uv[0]), float(uv[1]))); return len(self.P) - 1
    def tri(self, a, b, c):
        """a triangle, wound so its face looks the way its points' normals do (the game draws one side of a face only)"""
        P, N = self.P, self.N; A, B, C = P[a], P[b], P[c]
        ux, uy, uz = B[0] - A[0], B[1] - A[1], B[2] - A[2]; vx, vy, vz = C[0] - A[0], C[1] - A[1], C[2] - A[2]
        nx, ny, nz = uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx
        if nx * nx + ny * ny + nz * nz < 1e-18: return
        sx = N[a][0] + N[b][0] + N[c][0]; sy = N[a][1] + N[b][1] + N[c][1]; sz = N[a][2] + N[b][2] + N[c][2]
        self.T.append((a, b, c) if nx * sx + ny * sy + nz * sz >= 0 else (a, c, b))
    def quad(self, a, b, c, d): self.tri(a, b, c); self.tri(a, c, d)
    @property
    def ntri(self): return len(self.T)

class Modelo:
    """a piece under construction: its parts by material; mat: the frame every shape is put in (a matrix, pushed and popped)"""
    def __init__(self, nome, lod=0):
        self.nome = nome; self.lod = lod; self.parts = {}; self.stack = [Matrix.Identity(4)]; self.anc = []
    def p(self, name):
        q = self.parts.get(name)
        if q is None: q = self.parts[name] = Parte(name)
        return q
    @property
    def M(self): return self.stack[-1]
    def push(self, m): self.stack.append(self.stack[-1] @ m); return self
    def pop(self): self.stack.pop(); return self
    def at(self, x=0, y=0, z=0, ry=0.0, rx=0.0, rz=0.0, s=None):
        m = Matrix.Translation((x, y, z)) @ Matrix.Rotation(ry, 4, 'Y') @ Matrix.Rotation(rx, 4, 'X') @ Matrix.Rotation(rz, 4, 'Z')
        if s is not None: m = m @ Matrix.Diagonal((s[0], s[1], s[2], 1.0))
        return self.push(m)
    # (a point and a normal through the frame)
    def tp(self, p): q = self.M @ Vector((p[0], p[1], p[2], 1.0)); return (q[0], q[1], q[2])
    def tn(self, n):
        m3 = self.M.to_3x3().inverted_safe().transposed(); q = m3 @ Vector(n); l = q.length or 1.0; return (q[0] / l, q[1] / l, q[2] / l)
    def anchor(self, k, x, y, z, w, d):
        """a place where a thing may rest on the piece (the decoration of the second wave sets its things there): a top, a shelf, a hook, a niche"""
        p = self.tp((x, y, z)); self.anc.append({'k': k, 'x': round(p[0], 3), 'y': round(p[1], 3), 'z': round(p[2], 3), 'w': round(w, 3), 'd': round(d, 3)})
    @property
    def ntri(self): return sum(q.ntri for q in self.parts.values())

# ------------------------------ the chamfered box ------------------------------
AX = {'x': 0, 'y': 1, 'z': 2}
def caixa(M, part, lo, hi, ch=0.012, grain=None, jit=0.0, seed=0, top=True, bottom=True):
    """a box from lo to hi (in the frame), its edges cut ch wide; grain: the axis the wood runs along ('x', 'y', 'z'; the
    longest by default). jit: the faces pushed a little in and out (a hewn board), by the seed. top/bottom: whether its top
    and its underside are made (a board lying on another has no underside to see)"""
    P = M.p(part); sx, sy, sz = hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]
    if sx <= 1e-5 or sy <= 1e-5 or sz <= 1e-5: return
    if M.lod > 0: ch = 0.0
    ch = min(ch, sx * 0.3, sy * 0.3, sz * 0.3)
    g = AX[grain] if grain else max(range(3), key=lambda a: (sx, sy, sz)[a])
    c = [(lo[a] + hi[a]) / 2 for a in range(3)]; h = [sx / 2, sy / 2, sz / 2]
    rnd = random.Random(seed * 7919 + 13)
    jt = [[(rnd.uniform(-1, 1) * jit if jit else 0.0) for _ in range(4)] for _ in range(6)]
    jt[2] = [0.0] * 4   # (its underside stays true: what stands on the floor stands on it, never into it)
    # (the six faces: the axis out of it and its sign; the corner points of each face, inset by ch on the other two axes)
    faces = []; idx = {}
    for a in range(3):
        for s in (-1, 1):
            if a == 1 and s > 0 and not top: continue
            if a == 1 and s < 0 and not bottom: continue
            b1, b2 = [q for q in range(3) if q != a]
            n = [0, 0, 0]; n[a] = s
            # (uv: v along the grain where the grain lies in this face, else along b2)
            vv = g if g != a else b2; uu = b1 if vv == b2 else b2
            ids = []
            for k, (e1, e2) in enumerate(((-1, -1), (1, -1), (1, 1), (-1, 1))):
                p = [0, 0, 0]; p[a] = c[a] + s * (h[a] + jt[a * 2 + (s > 0)][k] * 0.5); p[b1] = c[b1] + e1 * (h[b1] - ch); p[b2] = c[b2] + e2 * (h[b2] - ch)
                ids.append(P.v(M.tp(p), M.tn(n), (p[uu] - lo[uu], p[vv] - lo[vv])))
                idx[(a, s, e1, e2)] = ids[-1]
            # (wound out of the box)
            if (s > 0) == ((b1, b2) in ((1, 2), (2, 0), (0, 1))): P.quad(ids[0], ids[1], ids[2], ids[3])
            else: P.quad(ids[0], ids[3], ids[2], ids[1])
            faces.append((a, s, b1, b2))
    if ch <= 0: return
    # the chamfers along the twelve edges: between the face (a, sa) and the face (b, sb), along the third axis
    def vid(a, s, other):  # the point of face (a, s) at the corner given by the signs of the other two axes
        b1, b2 = [q for q in range(3) if q != a]; return idx.get((a, s, other[b1], other[b2]))
    for a in range(3):
        for b in range(a + 1, 3):
            t = 3 - a - b
            for sa in (-1, 1):
                for sb in (-1, 1):
                    ends = []
                    for st in (-1, 1):
                        sg = [0, 0, 0]; sg[a] = sa; sg[b] = sb; sg[t] = st
                        ends.append((vid(a, sa, sg), vid(b, sb, sg)))
                    (p0, q0), (p1, q1) = ends
                    if None in (p0, q0, p1, q1): continue
                    # (wound out: the face's outward normal is roughly (sa e_a + sb e_b))
                    A, B, C = Vector(P.P[p0]), Vector(P.P[p1]), Vector(P.P[q1]); nn = (B - A).cross(C - A)
                    out = M.tn([sa if q == a else sb if q == b else 0 for q in range(3)])
                    if nn.dot(Vector(out)) >= 0: P.quad(p0, p1, q1, q0)
                    else: P.quad(p0, q0, q1, p1)
    # the eight corners: one triangle between the three faces' points
    for sx_ in (-1, 1):
        for sy_ in (-1, 1):
            for sz_ in (-1, 1):
                sg = (sx_, sy_, sz_); ids = [vid(a, sg[a], sg) for a in range(3)]
                if None in ids: continue
                A, B, C = (Vector(P.P[i]) for i in ids); nn = (B - A).cross(C - A); out = Vector(M.tn(sg))
                if nn.dot(out) >= 0: P.tri(*ids)
                else: P.tri(ids[0], ids[2], ids[1])

def tabua(M, part, lo, hi, ch=0.008, seed=0, grain=None, jit=0.0015):
    """a board: a chamfered box whose faces are a hair out of true, as sawn and planed by hand"""
    caixa(M, part, lo, hi, ch=ch, grain=grain, jit=jit, seed=seed)

def tampo(M, part, x0, x1, z0, z1, y0, y1, n, along='x', gap=0.006, ch=0.008, seed=0, battens=None):
    """a top of n boards side by side, their seams a few millimetres apart and their tops a hair off each other: along 'x'
    the boards run across the piece (seams along x), 'z' from front to back"""
    rnd = random.Random(seed * 31 + 5)
    if M.lod > 0: n = max(1, min(n, 2)); gap = 0.0
    if along == 'x':
        L = z1 - z0; wb = (L - gap * (n - 1)) / n
        for k in range(n):
            a = z0 + k * (wb + gap); dy = rnd.uniform(-0.0015, 0.0015) if M.lod == 0 else 0
            tabua(M, part, (x0, y0, a), (x1, y1 + dy, a + wb), ch=ch, seed=seed + k, grain='x')
    else:
        L = x1 - x0; wb = (L - gap * (n - 1)) / n
        for k in range(n):
            a = x0 + k * (wb + gap); dy = rnd.uniform(-0.0015, 0.0015) if M.lod == 0 else 0
            tabua(M, part, (a, y0, z0), (a + wb, y1 + dy, z1), ch=ch, seed=seed + k, grain='z')

# ------------------------------ the lathe ------------------------------
def torno(M, part, perfil, seg=12, x=0.0, z=0.0, y=0.0, sharp=50.0, cap0=True, cap1=True, a0=0.0, oval=1.0, rot=None, ur=None, flat=False):
    """a profile turned round the vertical through (x, y, z): perfil = [(y, r), ...] from the foot up (r ≥ 0); the light
    breaks where the profile turns sharper than `sharp` degrees; the ends closed by a flat cap where r > 0. oval squashes it
    along z; rot: a matrix turning the whole (a turned piece lying down). u round it in metres (at radius ur, the largest by
    default), v up the profile in metres"""
    if M.lod > 0 and not flat: seg = max(5, int(round(seg * 0.5)))
    # (the middle level: every other point of a long profile — the ends kept)
    if M.lod > 0 and len(perfil) > 4: perfil = [perfil[0]] + [p for k, p in enumerate(perfil[1:-1]) if k % 2 == 1] + [perfil[-1]]
    P = M.p(part); pts = [(float(a), float(b)) for a, b in perfil]
    if rot is not None: M.push(Matrix.Translation((x, y, z)) @ rot); ox, oy, oz = 0.0, 0.0, 0.0
    else: ox, oy, oz = x, y, z
    R = ur if ur else max(r for _, r in pts) or 0.01
    # (the length up the profile, for v; the normal of each segment in the (r, y) plane)
    sl = [0.0]
    for k in range(1, len(pts)): sl.append(sl[-1] + math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]))
    segn = []
    for k in range(len(pts) - 1):
        dy = pts[k + 1][0] - pts[k][0]; dr = pts[k + 1][1] - pts[k][1]; l = math.hypot(dy, dr) or 1.0
        segn.append((dy / l, -dr / l))   # (nr, ny): out of the surface
    def ring(k, nr, ny):
        yv, r = pts[k]; ids = []
        for i in range(seg + 1):
            t = a0 + TAU * i / seg; cx, sz = math.cos(t), math.sin(t)
            p = (ox + r * cx, oy + yv, oz + r * sz * oval); n = (nr * cx, ny, nr * sz / oval)
            ids.append(P.v(M.tp(p), M.tn(n), (R * TAU * i / seg, sl[k])))
        return ids
    rings_lo = []; rings_hi = []
    for k in range(len(pts)):
        # (the normal of point k: the mean of its two segments', or each its own where the profile breaks sharp)
        if k == 0: n0 = n1 = segn[0]
        elif k == len(pts) - 1: n0 = n1 = segn[-1]
        else:
            a, b = segn[k - 1], segn[k]; ang = math.degrees(math.acos(max(-1, min(1, a[0] * b[0] + a[1] * b[1]))))
            if ang > sharp: n0, n1 = a, b
            else: m = (a[0] + b[0], a[1] + b[1]); l = math.hypot(*m) or 1.0; n0 = n1 = (m[0] / l, m[1] / l)
        r_in = ring(k, *n0); r_out = r_in if n1 == n0 else ring(k, *n1)
        rings_lo.append(r_in); rings_hi.append(r_out)
    for k in range(len(pts) - 1):
        A, B = rings_hi[k], rings_lo[k + 1]
        for i in range(seg):
            if pts[k][1] < 1e-6 and pts[k + 1][1] < 1e-6: continue
            if flat:
                # (a faceted lathe — a square post —: each side its own flat normal, the light breaking at its corners)
                t = a0 + TAU * (i + 0.5) / seg; nr, ny = segn[k]; n = M.tn((nr * math.cos(t), ny, nr * math.sin(t) / oval))
                q = [P.v(P.P[j], n, P.UV[j]) for j in (A[i], A[i + 1], B[i + 1], B[i])]; P.quad(*q)
            else: P.quad(A[i], A[i + 1], B[i + 1], B[i])
    # (caps: flat, facing down at the foot and up at the top — and inward when the profile turns back)
    def cap(k, up):
        yv, r = pts[k]
        if r < 1e-5: return
        n = (0, 1 if up else -1, 0); c = P.v(M.tp((ox, oy + yv, oz)), M.tn(n), (R, R)); ids = []
        for i in range(seg + 1):
            t = a0 + TAU * i / seg; p = (ox + r * math.cos(t), oy + yv, oz + r * math.sin(t) * oval)
            ids.append(P.v(M.tp(p), M.tn(n), (R + r * math.cos(t), R + r * math.sin(t))))
        for i in range(seg):
            if up: P.tri(c, ids[i + 1], ids[i])
            else: P.tri(c, ids[i], ids[i + 1])
    if cap0: cap(0, pts[1][0] < pts[0][0])
    if cap1: cap(len(pts) - 1, pts[-1][0] >= pts[-2][0])
    if rot is not None: M.pop()

def cilindro(M, part, x, y0, z, r, h, seg=10, ch=0.006, cap0=True, cap1=True, oval=1.0):
    """a round post or a disc, its edges eased"""
    c = min(ch, r * 0.3, h * 0.3) if M.lod == 0 else 0.0
    if c > 0: perfil = [(0, r - c), (c * 0.3, r - c * 0.3), (c, r), (h - c, r), (h - c * 0.3, r - c * 0.3), (h, r - c)]
    else: perfil = [(0, r), (h, r)]
    torno(M, part, [(y0 + a, b) for a, b in perfil], seg=seg, x=x, z=z, cap0=cap0, cap1=cap1, oval=oval, sharp=60)

def perna_torneada(M, part, x, z, y0, y1, r, estilo='bulbo', seg=10):
    """a turned leg from y0 to y1, its thickest r: 'bulbo' (a vase and rings, the Greek and Roman), 'carretel' (reels), 'conica'
    (tapering to the foot), 'grossa' (a plain thick post, eased)"""
    H = y1 - y0; f = lambda *q: [(y0 + H * a, r * b) for a, b in q]
    if estilo == 'bulbo': pf = f((0, 0.55), (0.04, 0.62), (0.08, 0.5), (0.18, 0.62), (0.36, 1.0), (0.5, 0.82), (0.62, 0.58), (0.7, 0.72), (0.74, 0.55), (0.86, 0.62), (0.92, 0.9), (1.0, 0.9))
    elif estilo == 'carretel': pf = f((0, 0.6), (0.06, 0.8), (0.14, 0.55), (0.3, 0.75), (0.42, 0.55), (0.58, 0.75), (0.7, 0.55), (0.86, 0.8), (0.92, 0.95), (1.0, 0.95))
    elif estilo == 'conica': pf = f((0, 0.55), (0.05, 0.62), (0.1, 0.6), (0.85, 0.95), (0.9, 1.0), (1.0, 1.0))
    else: pf = f((0, 0.9), (0.03, 1.0), (0.97, 1.0), (1.0, 0.9))
    if M.lod > 0: pf = [pf[0], pf[len(pf) // 2], pf[-1]]
    torno(M, part, pf, seg=min(seg, 8), x=x, z=z, sharp=55)

# ------------------------------ the tube ------------------------------
def tubo(M, part, pts, r, seg=8, caps=True, closed=False, rs=None, oval=1.0, twist=0.0, chao=0.0):
    """a tube along the line through pts (each (x, y, z)), round r (or rs, one radius a point); closed: a ring (a hoop).
    u round it in metres, v along it"""
    if M.lod > 0: seg = max(4, int(round(seg * 0.5)))
    if M.lod > 0 and len(pts) > 3 and not closed:
        keep = [0] + [k for k in range(1, len(pts) - 1) if k % 2 == 0] + [len(pts) - 1]
        pts = [pts[k] for k in keep]; rs = [rs[k] for k in keep] if rs else None
    P = M.p(part); V = [Vector(p) for p in pts]; n = len(V)
    if closed: V.append(V[0])
    rr = list(rs) if rs else [r] * n
    if closed: rr.append(rr[0])
    T = []
    for k in range(len(V)):
        if k == 0: t = (V[1] - V[0]) if not closed else (V[1] - V[-2])
        elif k == len(V) - 1: t = (V[-1] - V[-2]) if not closed else (V[1] - V[-2])
        else: t = V[k + 1] - V[k - 1]
        T.append(t.normalized())
    # (frames carried along without twisting)
    up = Vector((0, 1, 0)) if abs(T[0].y) < 0.9 else Vector((1, 0, 0))
    nrm = T[0].cross(up).normalized(); frames = []
    for k in range(len(V)):
        if k > 0:
            ax = T[k - 1].cross(T[k])
            if ax.length > 1e-6: nrm = Matrix.Rotation(math.atan2(ax.length, T[k - 1].dot(T[k])), 3, ax.normalized()) @ nrm
            nrm = (nrm - T[k] * nrm.dot(T[k])).normalized()
        frames.append((nrm.copy(), T[k].cross(nrm).normalized()))
    sl = [0.0]
    for k in range(1, len(V)): sl.append(sl[-1] + (V[k] - V[k - 1]).length)
    R0 = max(rr); rings = []
    # (nothing under the floor: a leg's foot is cut flat on it — chao, the floor's height in the frame; None, no floor)
    fl = (lambda q: Vector((q.x, max(chao, q.y), q.z))) if chao is not None else (lambda q: q)
    for k in range(len(V)):
        a, b = frames[k]; ids = []
        for i in range(seg + 1):
            t = TAU * i / seg + twist * k; d = a * math.cos(t) + b * math.sin(t) * oval
            ids.append(P.v(M.tp(fl(V[k] + d * rr[k])), M.tn(a * math.cos(t) + b * math.sin(t) / oval), (R0 * TAU * i / seg, sl[k])))
        rings.append(ids)
    for k in range(len(V) - 1):
        A, B = rings[k], rings[k + 1]
        for i in range(seg): P.quad(A[i], B[i], B[i + 1], A[i + 1])
    if caps and not closed:
        for k, sgn in ((0, -1), (len(V) - 1, 1)):
            a, b = frames[k]; nn = T[k] * sgn
            if chao is not None and (V[k].y - rr[k] < chao): nn = Vector((0, -1, 0))
            c = P.v(M.tp(fl(V[k])), M.tn(nn), (0, 0)); ids = []
            for i in range(seg + 1):
                t = TAU * i / seg + twist * k; ids.append(P.v(M.tp(fl(V[k] + (a * math.cos(t) + b * math.sin(t) * oval) * rr[k])), M.tn(nn), (math.cos(t) * rr[k], math.sin(t) * rr[k])))
            for i in range(seg):
                if sgn > 0: P.tri(c, ids[i], ids[i + 1])
                else: P.tri(c, ids[i + 1], ids[i])

def arco_pts(c, r, a0, a1, n, plane='xy'):
    """points along an arc round c, from angle a0 to a1"""
    out = []
    for k in range(n + 1):
        t = a0 + (a1 - a0) * k / n
        if plane == 'xy': out.append((c[0] + r * math.cos(t), c[1] + r * math.sin(t), c[2]))
        elif plane == 'xz': out.append((c[0] + r * math.cos(t), c[1], c[2] + r * math.sin(t)))
        else: out.append((c[0], c[1] + r * math.sin(t), c[2] + r * math.cos(t)))
    return out

def curva(pts, n):
    """a smooth line through the control points (Catmull-Rom), n points in all"""
    P = [Vector(p) for p in pts]; out = []
    segs = len(P) - 1
    for k in range(n):
        u = k / (n - 1) * segs; i = min(int(u), segs - 1); t = u - i
        p0 = P[max(0, i - 1)]; p1 = P[i]; p2 = P[i + 1]; p3 = P[min(segs, i + 2)]
        t2 = t * t; t3 = t2 * t
        q = 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
        out.append((q.x, q.y, q.z))
    return out

# ------------------------------ the sheet, the cushion ------------------------------
def lamina(M, part, f, nu, nv, both=False, uvs=None):
    """a smooth sheet: f(u, v) → (x, y, z) for u, v in 0..1 over nu × nv cells, seen from the side its normal faces (both: a
    cloth seen from under it too, a hair apart); uvs: (metres across, metres down) of its picture"""
    if M.lod > 0: nu = max(2, nu // 2); nv = max(2, nv // 2)
    P = M.p(part); G = [[Vector(f(i / nu, j / nv)) for i in range(nu + 1)] for j in range(nv + 1)]
    su, sv = uvs if uvs else (1.0, 1.0)
    def nor(i, j):
        a = G[j][max(0, i - 1)]; b = G[j][min(nu, i + 1)]; c = G[max(0, j - 1)][i]; d = G[min(nv, j + 1)][i]
        n = (b - a).cross(d - c); return n.normalized() if n.length > 1e-9 else Vector((0, 1, 0))
    for side in ((1, -1) if both else (1,)):
        ids = [[P.v(M.tp(G[j][i] + nor(i, j) * (0.002 if side < 0 else 0) * -1), M.tn(nor(i, j) * side), (su * i / nu, sv * j / nv)) for i in range(nu + 1)] for j in range(nv + 1)]
        for j in range(nv):
            for i in range(nu):
                a, b, c, d = ids[j][i], ids[j][i + 1], ids[j + 1][i + 1], ids[j + 1][i]
                if side > 0: P.quad(a, d, c, b)
                else: P.quad(a, b, c, d)

def almofada(M, part, lo, hi, e=0.35, nu=10, nv=6):
    """a cushion, a mattress, a folded blanket: a box swollen round (a superellipsoid; e near 0 a box, 1 a ball), its faces
    soft, from lo to hi"""
    if M.lod > 0: nu, nv = 6, 4
    P = M.p(part); c = [(lo[a] + hi[a]) / 2 for a in range(3)]; h = [(hi[a] - lo[a]) / 2 for a in range(3)]
    sg = lambda w, m: math.copysign(abs(w) ** m, w)
    rings = []
    for j in range(nv + 1):
        th = -math.pi / 2 + math.pi * j / nv; ids = []
        for i in range(nu + 1):
            ph = TAU * i / nu
            cx, sx = math.cos(ph), math.sin(ph); ct, st = math.cos(th), math.sin(th)
            x = sg(ct, e) * sg(cx, e); y = sg(st, e); z = sg(ct, e) * sg(sx, e)
            p = (c[0] + h[0] * x, c[1] + h[1] * y, c[2] + h[2] * z)
            # (the normal of the superellipsoid: its gradient)
            ee = 2.0 / e
            nx = (abs(x) ** (ee - 1)) * math.copysign(1, x) / h[0] if abs(x) > 1e-9 else 0
            ny = (abs(y) ** (ee - 1)) * math.copysign(1, y) / h[1] if abs(y) > 1e-9 else 0
            nz = (abs(z) ** (ee - 1)) * math.copysign(1, z) / h[2] if abs(z) > 1e-9 else 0
            if abs(nx) + abs(ny) + abs(nz) < 1e-9: ny = math.copysign(1, st)
            ids.append(P.v(M.tp(p), M.tn((nx, ny, nz)), ((h[0] * 2 + h[2] * 2) * i / nu, h[1] * 2 * j / nv)))
        rings.append(ids)
    for j in range(nv):
        for i in range(nu): P.quad(rings[j][i], rings[j][i + 1], rings[j + 1][i + 1], rings[j + 1][i])

def ovo(M, part, x, y, z, rx, ry, rz=None, seg=10, nv=6):
    """a ball (an ellipsoid): a loaf, a bulb, a knob"""
    rz = rz if rz is not None else rx
    pf = [(y - ry + ry * (1 - math.cos(math.pi * k / nv)), rx * math.sin(math.pi * k / nv)) for k in range(nv + 1)]
    torno(M, part, pf, seg=seg, x=x, z=z, oval=rz / rx if rx else 1, cap0=False, cap1=False, sharp=89)

# ------------------------------ stone, embers, logs ------------------------------
def pedra(M, part, lo, hi, seed=0, jit=0.012, ch=0.02):
    """a dressed stone (a kerb of the hearth, a block of the counter): a chamfered box knocked a little out of true"""
    caixa(M, part, lo, hi, ch=ch, jit=jit, seed=seed)

def brasas(M, part, x0, x1, z0, z1, y, h, seed=0, n=8):
    """a bed of embers and ash: a low mound, lumpy, from x0..x1, z0..z1, its top h over y"""
    rnd = random.Random(seed * 101 + 7)
    nu = n if M.lod == 0 else max(3, n // 2); nv = max(3, int(nu * (z1 - z0) / max(0.01, x1 - x0)))
    def f(u, v):
        e = math.sin(math.pi * u) * math.sin(math.pi * v)
        bump = 0.0 if e < 0.05 else (math.sin(u * 17 + seed) * math.cos(v * 13 + seed * 2) * 0.25 + 0.75)
        return (x0 + (x1 - x0) * u, y + h * (e ** 0.6) * bump, z0 + (z1 - z0) * v)
    lamina(M, part, f, nu, nv)

def tora(M, part, a, b, r, seg=8, seed=0, casca='madeira2', cerne=None):
    """a log from a to b, round r: its bark (the part casca) and its two cut ends (cerne, or the same)"""
    rnd = random.Random(seed * 17 + 3); A = Vector(a); B = Vector(b)
    pts = [A.lerp(B, t) for t in (0, 0.33, 0.66, 1)]
    rs = [r * (1 + rnd.uniform(-0.08, 0.08)) for _ in pts]
    tubo(M, casca, [tuple(p) for p in pts], r, seg=seg, caps=False, rs=rs)
    part_end = cerne or casca; d = (B - A).normalized()
    for p, rr, sgn in ((A, rs[0], -1), (B, rs[-1], 1)):
        up = Vector((0, 1, 0)) if abs(d.y) < 0.9 else Vector((1, 0, 0)); e1 = d.cross(up).normalized(); e2 = d.cross(e1).normalized()
        P = M.p(part_end); s = seg if M.lod == 0 else max(4, seg // 2); c = P.v(M.tp(p), M.tn(d * sgn), (0, 0)); ids = []
        for i in range(s + 1):
            t = TAU * i / s; q = p + (e1 * math.cos(t) + e2 * math.sin(t)) * rr; q.y = max(0.0, q.y)
            ids.append(P.v(M.tp(q), M.tn(d * sgn), (math.cos(t) * rr, math.sin(t) * rr)))
        for i in range(s):
            if sgn > 0: P.tri(c, ids[i], ids[i + 1])
            else: P.tri(c, ids[i + 1], ids[i])

# ------------------------------ the hood ------------------------------
def tronco(M, part, a, b, ya, yb, faces='fes', ch=0.0):
    """a frustum between the rectangle a = (x0, z0, x1, z1) at ya and the rectangle b at yb — a hood over a fire, a flue's
    foot: its sides flat, the ones named in faces made (f front +z, e/d the left and right, t the back, s its underside, c its
    top)"""
    P = M.p(part)
    A = [(a[0], ya, a[3]), (a[2], ya, a[3]), (a[2], ya, a[1]), (a[0], ya, a[1])]   # front-left, front-right, back-right, back-left
    B = [(b[0], yb, b[3]), (b[2], yb, b[3]), (b[2], yb, b[1]), (b[0], yb, b[1])]
    def side(i, j, key):
        if key not in faces: return
        p = [A[i], A[j], B[j], B[i]]
        u = [p[1][q] - p[0][q] for q in range(3)]; v = [p[3][q] - p[0][q] for q in range(3)]
        n = (u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0])
        c = [(a[0] + a[2]) / 2, ya, (a[1] + a[3]) / 2]; m = [sum(q[k] for q in p) / 4 for k in range(3)]
        if (m[0] - c[0]) * n[0] + (m[2] - c[2]) * n[2] + (m[1] - (ya + yb) / 2) * n[1] * 0 < 0: n = (-n[0], -n[1], -n[2])
        L = math.sqrt(u[0] ** 2 + u[2] ** 2)
        ids = [P.v(M.tp(p[k]), M.tn(n), ((0, L, L, 0)[k], (0, 0, yb - ya, yb - ya)[k])) for k in range(4)]
        P.quad(*ids)
    side(0, 1, 'f'); side(3, 0, 'e'); side(1, 2, 'd'); side(2, 3, 't')
    for key, R, y, n in (('s', A, ya, (0, -1, 0)), ('c', B, yb, (0, 1, 0))):
        if key in faces: ids = [P.v(M.tp(q), M.tn(n), (q[0], q[2])) for q in R]; P.quad(*ids)

# ------------------------------ the cask of staves ------------------------------
def aduelas(M, part, H, raio, n=14, t=0.022, gap=0.0035, rings=7, chime=0.02, part_dentro=None, aberto=False):
    """the staves of a cask or a vat standing on its foot, H high: raio(y) its outer radius at each height (the bulge), n staves
    each its own curved board — the light breaking at the seams between them —, t thick (the top of each stave shows it, and
    the inside above the head where it is closed — chime: how far the staves stand over the head —, the whole inside where it
    is open: aberto). u round, v up (the grain of a stave runs up it)"""
    if M.lod > 0: n = max(8, n // 2); rings = max(3, rings // 2); gap = 0.0
    P = M.p(part); Q = M.p(part_dentro or part); da = TAU / n; ga = gap / max(0.05, raio(H / 2))
    ys = [H * k / (rings - 1) for k in range(rings)]
    def nrm(y, a):
        e = 0.002; dr = (raio(min(H, y + e)) - raio(max(0.0, y - e))) / (2 * e)
        return (math.cos(a), -dr, math.sin(a))
    for s in range(n):
        a0 = s * da + ga / 2; a1 = (s + 1) * da - ga / 2; am = (a0 + a1) / 2; sub = 2 if M.lod == 0 and n < 14 else 1
        angs = [a0 + (a1 - a0) * i / sub for i in range(sub + 1)]
        grid = [[P.v(M.tp((raio(y) * math.cos(a), y, raio(y) * math.sin(a))), M.tn(nrm(y, a)), (raio(y) * (a - a0), y)) for a in angs] for y in ys]
        for j in range(rings - 1):
            for i in range(sub): P.quad(grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i])
        # (the stave's top: its thickness seen from above; and its inside, down to the head or, open, to the foot)
        ri = lambda y: raio(y) - t
        top = [P.v(M.tp((raio(H) * math.cos(a), H, raio(H) * math.sin(a))), M.tn((0, 1, 0)), (a * raio(H), 0)) for a in (a0, a1)]
        topi = [P.v(M.tp((ri(H) * math.cos(a), H, ri(H) * math.sin(a))), M.tn((0, 1, 0)), (a * raio(H), t)) for a in (a0, a1)]
        P.quad(top[0], top[1], topi[1], topi[0])
        y_in = 0.0 if aberto else H - chime - 0.01
        yi = [y for y in ys if y >= y_in - 1e-6] if aberto else [y_in, H]
        if aberto and yi[0] > 1e-6: yi = [0.0] + yi
        gi = [[Q.v(M.tp((ri(y) * math.cos(a), y, ri(y) * math.sin(a))), M.tn((-math.cos(a), 0, -math.sin(a))), (ri(y) * (a - a0), y)) for a in angs] for y in yi]
        for j in range(len(yi) - 1):
            for i in range(sub): Q.quad(gi[j][i], gi[j][i + 1], gi[j + 1][i + 1], gi[j + 1][i])

def aros(M, part, H, raio, ys, larg=0.035, esp=0.006, seg=20):
    """the hoops round a cask: a band larg wide, esp proud of the staves at each height of ys"""
    for y in ys:
        r0 = raio(y - larg / 2) + esp * 0.2; r1 = raio(y + larg / 2) + esp * 0.2
        torno(M, part, [(y - larg / 2, r0), (y - larg / 2 + esp * 0.5, r0 + esp), (y + larg / 2, r1 + esp)], seg=seg, cap0=False, cap1=False, sharp=40)

def fundo_tabuas(M, part, r, y, n=3, t=0.02):
    """the head of a cask: a round of n boards, its top at y"""
    from moveis_pecas import tampo_redondo
    tampo_redondo(M, part, r, y - t, y, n=n, gap=0.003, seg=18, so_topo=True)

# ------------------------------ the block with an arch ------------------------------
def bloco_arco(M, part, lo, hi, aw, ah, depth, seg=8, part_fundo=None, ch=0.01):
    """a block of masonry from lo to hi with an arched opening cut into its front (+z) face: aw wide, ah high to the top of
    its round head, depth into the block (the niche under a Roman hearth where the wood was kept); part_fundo paints its
    inside (the dark of it)"""
    if M.lod > 0: seg = max(3, seg // 2)
    P = M.p(part); x0, y0, z0 = lo; x1, y1, z1 = hi; cx = (x0 + x1) / 2
    r = aw / 2; ys = y0 + ah - r   # (the spring of the arch)
    # (the front face: the rectangle less the arch — a fan of strips from the arch's outline to the face's edge)
    arch = [(cx - r, y0)] + [(cx - r * math.cos(math.pi * k / seg), ys + r * math.sin(math.pi * k / seg)) for k in range(seg + 1)] + [(cx + r, y0)]
    # (each arch point paired with a point of the face's border: left side, top, right side)
    def border(t):  # t 0..1 round the arch from bottom-left to bottom-right → the border point
        L = (y1 - y0) + (x1 - x0) + (y1 - y0); s = t * L
        if s <= y1 - y0: return (x0, y0 + s)
        s -= y1 - y0
        if s <= x1 - x0: return (x0 + s, y1)
        s -= x1 - x0; return (x1, y1 - s)
    n = len(arch); nf = (0, 0, 1); fz = z1
    A = [P.v(M.tp((p[0], p[1], fz)), M.tn(nf), (p[0] - x0, p[1] - y0)) for p in arch]
    Bp = [border(k / (n - 1)) for k in range(n)]
    B = [P.v(M.tp((p[0], p[1], fz)), M.tn(nf), (p[0] - x0, p[1] - y0)) for p in Bp]
    for k in range(n - 1): P.quad(A[k], A[k + 1], B[k + 1], B[k])
    # (the other faces of the block: the back, the sides, the top — the bottom is the floor)
    for (a, b, c, d, nn) in (((x0, y0, z0), (x0, y1, z0), (x1, y1, z0), (x1, y0, z0), (0, 0, -1)),
                             ((x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0), (-1, 0, 0)),
                             ((x1, y0, z0), (x1, y1, z0), (x1, y1, z1), (x1, y0, z1), (1, 0, 0)),
                             ((x0, y1, z0), (x0, y1, z1), (x1, y1, z1), (x1, y1, z0), (0, 1, 0))):
        ids = [P.v(M.tp(q), M.tn(nn), (q[0] + q[2], q[1] + q[2])) for q in (a, b, c, d)]; P.quad(*ids)
    # (the inside of the arch: its sides and its round head, back to the niche's floor and its back wall)
    Q = M.p(part_fundo or part); zb = z1 - depth
    for k in range(len(arch) - 1):
        p, q = arch[k], arch[k + 1]
        if abs(p[1] - y0) < 1e-6 and abs(q[1] - y0) < 1e-6: continue
        nx, ny = -(q[1] - p[1]), (q[0] - p[0]); l = math.hypot(nx, ny) or 1.0
        nn = (-nx / l, -ny / l, 0)   # (into the opening)
        if (cx - (p[0] + q[0]) / 2) * nn[0] + (ys - (p[1] + q[1]) / 2) * nn[1] < 0: nn = (-nn[0], -nn[1], 0)
        ids = [Q.v(M.tp((p[0], p[1], fz)), M.tn(nn), (0, 0)), Q.v(M.tp((p[0], p[1], zb)), M.tn(nn), (0, depth)), Q.v(M.tp((q[0], q[1], zb)), M.tn(nn), (0.1, depth)), Q.v(M.tp((q[0], q[1], fz)), M.tn(nn), (0.1, 0))]
        Q.quad(ids[0], ids[3], ids[2], ids[1])
    # (the niche's back: the arch's outline, a fan)
    c = Q.v(M.tp((cx, (y0 + ys) / 2, zb)), M.tn((0, 0, 1)), (0, 0)); ids = [Q.v(M.tp((p[0], p[1], zb)), M.tn((0, 0, 1)), (p[0], p[1])) for p in arch]
    for k in range(len(ids) - 1): Q.tri(c, ids[k + 1], ids[k])

# ------------------------------ the light the piece gives itself: the ambient occlusion, baked ------------------------------
def bake_ao(M, rays=20, dist=0.45, floor=True, lo=0.42):
    """how much of the sky each point of the piece sees — its own other parts and the floor under it in the way —, as a grey
    from lo (shut in: under a top, between the legs at the floor) to 1 (open): one colour a point, the same at every load"""
    tris = []; verts = []
    for q in M.parts.values():
        o = len(verts); verts += [Vector(p) for p in q.P]; tris += [(a + o, b + o, c + o) for a, b, c in q.T]
    if floor:
        o = len(verts); F = 4.0; verts += [Vector((-F, -0.0005, -F)), Vector((F, -0.0005, -F)), Vector((F, -0.0005, F)), Vector((-F, -0.0005, F))]; tris += [(o, o + 2, o + 1), (o, o + 3, o + 2)]
    bvh = BVHTree.FromPolygons(verts, tris)
    # (the directions, the same for every point: a spiral over the hemisphere about +Z, turned to each normal)
    D = []
    for k in range(rays):
        z = 1 - (k + 0.5) / rays; r = math.sqrt(max(0.0, 1 - z * z)); t = k * 2.399963
        D.append(Vector((r * math.cos(t), r * math.sin(t), z)))
    memo = {}
    for q in M.parts.values():
        q.C = []
        for p, n in zip(q.P, q.N):
            key = (round(p[0], 4), round(p[1], 4), round(p[2], 4), round(n[0], 2), round(n[1], 2), round(n[2], 2))
            a = memo.get(key)
            if a is None:
                N = Vector(n); P0 = Vector(p) + N * 0.003
                up = Vector((0, 0, 1)) if abs(N.z) < 0.9 else Vector((1, 0, 0)); e1 = N.cross(up).normalized(); e2 = N.cross(e1)
                hit = 0.0; wt = 0.0
                for d in D:
                    w = d.z; v = e1 * d.x + e2 * d.y + N * d.z; wt += w
                    h = bvh.ray_cast(P0, v, dist)
                    if h[0] is not None: hit += w * (1 - (h[3] / dist) ** 2 * 0.6)
                occ = hit / wt if wt else 0.0
                a = lo + (1 - lo) * (1 - occ) ** 1.15
                memo[key] = a
            q.C.append(a)
