# corpo_sdf: the clay the people are modelled in — signed distance fields (a shape is "how far is this point from the
# surface": negative inside), blended smoothly as a sculptor blends clay, turned into a mesh by surface nets.
# Pure numpy: the same numbers every run (no randomness), so the generated mesh never changes unless the shapes do.
# Coordinates are the body's own (the rig of js/people3d.js): metres, +X the body's left, +Y up, +Z forward.
import numpy as np

F = np.float32


def _rot(R):
    return None if R is None else np.asarray(R, dtype=np.float64)


def rot_x(a):
    c, s = np.cos(a), np.sin(a)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])


def rot_y(a):
    c, s = np.cos(a), np.sin(a)
    return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])


def rot_z(a):
    c, s = np.cos(a), np.sin(a)
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])


def frame_from(y_axis, z_hint=(0, 0, 1)):
    """A rotation whose local Y is y_axis (normalised) and whose local Z leans toward z_hint."""
    y = np.asarray(y_axis, dtype=np.float64); y = y / np.linalg.norm(y)
    z = np.asarray(z_hint, dtype=np.float64); z = z - y * np.dot(z, y); z = z / np.linalg.norm(z)
    x = np.cross(y, z)
    return np.stack([x, y, z], axis=1)  # columns: local axes in world


# ------------------------------ primitives (each: sdf(P) for P of shape (n, 3)) ------------------------------
class Prim:
    """A shape, how it joins the ones before it (op: 'u' union, 's' subtraction, 'i' intersection, k: the blend), the
    bone that owns it (for the skin weights) and how soft that ownership is (tau, metres)."""
    op = 'u'; k = 0.0; bone = None; tau = 0.02; tag = None

    def bbox(self):
        raise NotImplementedError

    def sdf(self, P):
        raise NotImplementedError

    def set(self, op='u', k=0.0, bone=None, tau=None, tag=None):
        self.op, self.k, self.bone = op, k, bone
        if tau is not None: self.tau = tau
        self.tag = tag
        return self


class Sphere(Prim):
    def __init__(self, c, r): self.c = np.asarray(c, float); self.r = float(r)
    def bbox(self): return self.c - self.r, self.c + self.r
    def sdf(self, P): return np.linalg.norm(P - self.c, axis=1) - self.r


class Ellipsoid(Prim):
    """An ellipsoid of radii (rx, ry, rz) turned by R (local → world). Inigo Quilez's bound: exact enough near the surface."""
    def __init__(self, c, radii, R=None): self.c = np.asarray(c, float); self.r = np.asarray(radii, float); self.R = _rot(R)
    def bbox(self):
        if self.R is None: return self.c - self.r, self.c + self.r
        ext = np.abs(self.R) @ self.r
        return self.c - ext, self.c + ext
    def sdf(self, P):
        q = P - self.c
        if self.R is not None: q = q @ self.R
        k0 = np.linalg.norm(q / self.r, axis=1); k1 = np.linalg.norm(q / (self.r * self.r), axis=1)
        return k0 * (k0 - 1.0) / np.maximum(k1, 1e-9)


class RoundCone(Prim):
    """A limb: from a (radius ra) to b (radius rb), round at both ends (Inigo Quilez's exact round cone)."""
    def __init__(self, a, b, ra, rb, flat=None):
        self.a = np.asarray(a, float); self.b = np.asarray(b, float); self.ra = float(ra); self.rb = float(rb)
        # (flat: (axis, factor) squash the cross-section along a world axis — a wrist wider than it is deep)
        self.flat = flat
    def bbox(self):
        r = max(self.ra, self.rb)
        return np.minimum(self.a, self.b) - r, np.maximum(self.a, self.b) + r
    def sdf(self, P):
        a, b, r1, r2 = self.a, self.b, self.ra, self.rb
        if self.flat is not None:
            ax, f = self.flat; ax = np.asarray(ax, float); ax = ax / np.linalg.norm(ax)
            # (squash: stretch the points along the axis about the segment, so the section is narrower that way)
            m = (a + b) / 2; q = P - m; d = q @ ax
            P = P + np.outer(d, ax) * (1.0 / f - 1.0)
        ba = b - a; l2 = float(np.dot(ba, ba)); rr = r1 - r2; a2 = l2 - rr * rr; il2 = 1.0 / l2
        pa = P - a; y = pa @ ba; z = y - l2
        xv = pa * l2 - np.outer(y, ba); x2 = np.einsum('ij,ij->i', xv, xv)
        y2 = y * y * l2; z2 = z * z * l2
        k = np.sign(rr) * rr * rr * x2
        out = (np.sqrt(x2 * a2 * il2) + y * rr) * il2 - r1
        m1 = np.sign(z) * a2 * z2 > k
        m2 = np.sign(y) * a2 * y2 < k
        out = np.where(m1, np.sqrt(x2 + z2) * il2 - r2, out)
        out = np.where(m2 & ~m1, np.sqrt(x2 + y2) * il2 - r1, out)
        return out


class RBox(Prim):
    """A rounded box: half sizes h, rounding r, turned by R."""
    def __init__(self, c, h, r, R=None): self.c = np.asarray(c, float); self.h = np.asarray(h, float); self.r = float(r); self.R = _rot(R)
    def bbox(self):
        e = self.h + self.r
        if self.R is not None: e = np.abs(self.R) @ e
        return self.c - e, self.c + e
    def sdf(self, P):
        q = P - self.c
        if self.R is not None: q = q @ self.R
        d = np.abs(q) - self.h
        return np.linalg.norm(np.maximum(d, 0.0), axis=1) + np.minimum(np.max(d, axis=1), 0.0) - self.r


class Plane(Prim):
    """A half-space: inside where dot(p - c, n) < 0 (n points out). Unbounded: give it a box to act in."""
    def __init__(self, c, n, box): self.c = np.asarray(c, float); n = np.asarray(n, float); self.n = n / np.linalg.norm(n); self.box = box
    def bbox(self): return np.asarray(self.box[0], float), np.asarray(self.box[1], float)
    def sdf(self, P): return (P - self.c) @ self.n


class Torus(Prim):
    """A ring: major radius R0 about the local Y axis, tube radius r, turned by R."""
    def __init__(self, c, R0, r, R=None, sy=1.0): self.c = np.asarray(c, float); self.R0 = float(R0); self.r = float(r); self.R = _rot(R); self.sy = sy
    def bbox(self):
        e = np.array([self.R0 + self.r, self.r * self.sy, self.R0 + self.r])
        if self.R is not None: e = np.abs(self.R) @ e
        return self.c - e, self.c + e
    def sdf(self, P):
        q = P - self.c
        if self.R is not None: q = q @ self.R
        a = np.sqrt(q[:, 0] ** 2 + q[:, 2] ** 2) - self.R0
        return np.sqrt(a * a + (q[:, 1] / self.sy) ** 2) - self.r


class Custom(Prim):
    """Any shape given as a function, with its box."""
    def __init__(self, f, box): self.f = f; self.box = box
    def bbox(self): return np.asarray(self.box[0], float), np.asarray(self.box[1], float)
    def sdf(self, P): return self.f(P)


# ------------------------------ blends ------------------------------
def smin(a, b, k):
    if k <= 0: return np.minimum(a, b)
    h = np.maximum(k - np.abs(a - b), 0.0) / k
    return np.minimum(a, b) - h * h * k * 0.25


def smax(a, b, k):
    return -smin(-a, -b, k)


def combine(acc, d, p):
    if p.op == 'u': return smin(acc, d, p.k)
    if p.op == 's': return smax(acc, -d, p.k)
    if p.op == 'i': return smax(acc, d, p.k)
    raise ValueError(p.op)


def field_at(prims, P, upto=None):
    """The shape at arbitrary points (every primitive, in order)."""
    acc = np.full(len(P), 1e3)
    for p in prims[:upto]:
        if p.op == 'i':
            # (a cut acts only inside its own box, as on the grid)
            b0, b1 = p.bbox(); g = p.k + 0.02
            m = np.all((P >= b0 - g) & (P <= b1 + g), axis=1)
            if m.any(): acc[m] = smax(acc[m], p.sdf(P[m]), p.k)
            continue
        acc = combine(acc, p.sdf(P), p)
    return acc


# ------------------------------ the grid ------------------------------
def grid_field(prims, lo, hi, h):
    """The field sampled on a grid of step h over [lo, hi], each primitive evaluated only inside its own box (grown by
    its blend): far from a primitive its blend changes nothing."""
    lo = np.asarray(lo, float); hi = np.asarray(hi, float)
    n = np.ceil((hi - lo) / h).astype(int) + 1
    Fg = np.full(tuple(n), 1e3, dtype=np.float32)
    # (a cut — an intersection — acts only inside its own box: a flat sole under the feet, not a plane through the world)
    for p in prims:
        b0, b1 = p.bbox(); g = p.k + 3 * h
        i0 = np.maximum(np.floor((b0 - g - lo) / h).astype(int), 0); i1 = np.minimum(np.ceil((b1 + g - lo) / h).astype(int) + 1, n)
        if np.any(i1 <= i0): continue
        xs = lo[0] + h * np.arange(i0[0], i1[0]); ys = lo[1] + h * np.arange(i0[1], i1[1]); zs = lo[2] + h * np.arange(i0[2], i1[2])
        X, Y, Z = np.meshgrid(xs, ys, zs, indexing='ij')
        P = np.stack([X.ravel(), Y.ravel(), Z.ravel()], axis=1)
        sub = Fg[i0[0]:i1[0], i0[1]:i1[1], i0[2]:i1[2]]
        d = p.sdf(P).reshape(sub.shape)
        if p.op == 'u': sub[...] = smin(sub, d, p.k)
        elif p.op == 's': sub[...] = smax(sub, -d, p.k)
        else: sub[...] = smax(sub, d, p.k)
    return Fg, lo, n


# ------------------------------ surface nets ------------------------------
def surface_nets(Fg, lo, h):
    """A quad mesh of the zero surface: one vertex per cell the surface crosses (the mean of where it crosses the
    cell's edges), one quad per grid edge it crosses. Faces wind counter-clockwise seen from outside."""
    s = Fg < 0
    nx, ny, nz = Fg.shape
    c = [s[i:nx - 1 + i, j:ny - 1 + j, k:nz - 1 + k] for i in (0, 1) for j in (0, 1) for k in (0, 1)]
    anyin = np.zeros_like(c[0]); allin = np.ones_like(c[0])
    for q in c: anyin |= q; allin &= q
    mixed = anyin & ~allin
    ci = np.argwhere(mixed)
    vid = -np.ones(mixed.shape, dtype=np.int32); vid[mixed] = np.arange(len(ci), dtype=np.int32)
    # the 12 edges of a cell, between its corners (corner offsets)
    corners = np.array([[i, j, k] for i in (0, 1) for j in (0, 1) for k in (0, 1)])
    edges = [(a, b) for a in range(8) for b in range(a + 1, 8) if np.sum(np.abs(corners[a] - corners[b])) == 1]
    acc = np.zeros((len(ci), 3)); cnt = np.zeros(len(ci))
    for a, b in edges:
        A = ci + corners[a]; B = ci + corners[b]
        fa = Fg[A[:, 0], A[:, 1], A[:, 2]].astype(np.float64); fb = Fg[B[:, 0], B[:, 1], B[:, 2]].astype(np.float64)
        m = (fa < 0) != (fb < 0)
        t = np.where(m, fa / np.where(m, fa - fb, 1.0), 0.0)
        p = A + (B - A) * t[:, None]
        acc[m] += p[m]; cnt[m] += 1
    V = lo + h * (acc / np.maximum(cnt, 1)[:, None])
    quads = []
    # (an edge along axis a between sample p and p + e_a crossing the surface: the four cells round it)
    for ax in range(3):
        e = np.zeros(3, int); e[ax] = 1
        u, w = [(1, 2), (0, 2), (0, 1)][ax]
        sl0 = [slice(None)] * 3; sl1 = [slice(None)] * 3
        sl0[ax] = slice(0, s.shape[ax] - 1); sl1[ax] = slice(1, s.shape[ax])
        a0 = s[tuple(sl0)]; a1 = s[tuple(sl1)]
        cross = a0 != a1
        idx = np.argwhere(cross)
        # (only edges with all four cells inside the grid)
        ok = (idx[:, u] >= 1) & (idx[:, w] >= 1) & (idx[:, u] < s.shape[u] - 1) & (idx[:, w] < s.shape[w] - 1)
        idx = idx[ok]
        inside_first = a0[tuple(idx.T)]
        def cell(du, dw):
            q = idx.copy(); q[:, u] -= du; q[:, w] -= dw
            return vid[q[:, 0], q[:, 1], q[:, 2]]
        c00 = cell(1, 1); c10 = cell(0, 1); c11 = cell(0, 0); c01 = cell(1, 0)
        Q = np.stack([c00, c10, c11, c01], axis=1)
        # (orientation: the normal points from inside to outside; flip when the inside is the far sample)
        # ((u, w, ax) turns the right way for x and z, the wrong way for y)
        flip = ~inside_first if ax != 1 else inside_first
        Q[flip] = Q[flip][:, ::-1]
        quads.append(Q)
    Q = np.concatenate(quads, axis=0)
    Q = Q[np.all(Q >= 0, axis=1)]
    return V, Q


def project(prims, V, iters=3, eps=1e-4, maxstep=None):
    """Move each vertex onto the surface along the field's gradient (each step at most maxstep: where a field is nearly
    flat — the edge of a cut — a full step would throw the vertex far away)."""
    V = V.copy()
    for _ in range(iters):
        f = field_at(prims, V)
        g = np.zeros_like(V)
        for a in range(3):
            d = np.zeros(3); d[a] = eps
            g[:, a] = (field_at(prims, V + d) - field_at(prims, V - d)) / (2 * eps)
        gl2 = np.maximum(np.einsum('ij,ij->i', g, g), 1e-12)
        st = (f / gl2)[:, None] * g
        if maxstep is not None:
            L = np.linalg.norm(st, axis=1); st *= np.minimum(1.0, maxstep / np.maximum(L, 1e-12))[:, None]
        V -= st
    return V


def normals_of(prims, V, eps=2e-4):
    g = np.zeros_like(V)
    for a in range(3):
        d = np.zeros(3); d[a] = eps
        g[:, a] = field_at(prims, V + d) - field_at(prims, V - d)
    return g / np.maximum(np.linalg.norm(g, axis=1), 1e-12)[:, None]


def band_field(prims, lo, hi, h, coarse=4):
    """The field on a fine grid of step h, evaluated only near the surface: first on a grid coarse× coarser, then the
    fine points within two coarse steps of the surface (a thin finger is never missed: it is that near some coarse
    point). Elsewhere the fine grid keeps the coarse field's sign — all surface nets needs there."""
    lo = np.asarray(lo, float); hi = np.asarray(hi, float)
    hc = h * coarse
    Fc, lo_c, nc = grid_field(prims, lo, hi + hc, hc)
    n = (nc - 1) * coarse + 1
    # (the fine grid starts as the coarse one, repeated: the sign is right away from the surface)
    Fg = np.repeat(np.repeat(np.repeat(Fc, coarse, 0), coarse, 1), coarse, 2)[:n[0], :n[1], :n[2]].astype(np.float32)
    near = np.abs(Fc) < 2.2 * hc
    blk = np.argwhere(near)
    if not len(blk): return Fg, lo, n
    # every fine point of every coarse cell near the surface (each cell: coarse^3 points from its corner)
    o = np.stack(np.meshgrid(*[np.arange(coarse)] * 3, indexing='ij'), -1).reshape(-1, 3)
    idx = (blk[:, None, :] * coarse + o[None, :, :]).reshape(-1, 3)
    idx = idx[np.all(idx < n, axis=1)]
    P = lo + h * idx
    acc = np.full(len(P), 1e3)
    for p in prims:
        b0, b1 = p.bbox(); g = p.k + 3 * h
        m = np.all((P >= b0 - g) & (P <= b1 + g), axis=1)
        if not m.any(): continue
        d = p.sdf(P[m])
        if p.op == 'u': acc[m] = smin(acc[m], d, p.k)
        elif p.op == 's': acc[m] = smax(acc[m], -d, p.k)
        else: acc[m] = smax(acc[m], d, p.k)
    Fg[idx[:, 0], idx[:, 1], idx[:, 2]] = acc
    return Fg, lo, n


def mesh_of(prims, h, pad=0.02, box=None, coarse=4, maxstep=None):
    """The mesh of a list of primitives at grid step h."""
    if box is None:
        los, his = zip(*[p.bbox() for p in prims if p.op == 'u'])
        lo = np.min(los, axis=0) - pad; hi = np.max(his, axis=0) + pad
    else:
        lo, hi = np.asarray(box[0], float), np.asarray(box[1], float)
    if coarse > 1: Fg, lo, n = band_field(prims, lo, hi, h, coarse)
    else: Fg, lo, n = grid_field(prims, lo, hi, h)
    V, Q = surface_nets(Fg, lo, h)
    V = project(prims, V, maxstep=maxstep)
    return V, Q


def tris_of(Q):
    """Quads to triangles (split along the shorter diagonal is left to the decimator)."""
    return np.concatenate([Q[:, [0, 1, 2]], Q[:, [0, 2, 3]]], axis=0)
