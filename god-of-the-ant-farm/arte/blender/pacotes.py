# pacotes: how the libraries of the interiors' models are written (the interiors 3, the front X — the F8 of planos/interiores-3.md;
# D-1020 to D-1029): what arte/blender/moveis.py (the furniture) and arte/blender/deco.py (the decoration) share when they write a
# model. The 16-bit form (v 2, D-1021): a model's points as whole numbers of 16 bits over its own box (the box the file has always
# said, to a tenth of a millimetre: the points kept inside it), its normals in two bytes (octahedral: the code nearest the shape's own
# normal), its uv as whole numbers of 16 bits over their own box, the light a point gives itself in one grey byte (three where a point
# has its own colour: the dishes); the index, the parts and what the game reads to set a model down as they were. Half the bytes of
# the floats of before (v 1), and every model made is decoded again here and set beside the shape's own numbers before it is written:
# a point never more than a millimetre from where the shape put it, a normal never more than a degree — or nothing is written. The
# game reads it in js/mesh3d.js (G.Mesh3D: the one reader of G.MESH3D).
import base64, math
import numpy as np

Q16 = 65535
TOL = {'pos': 0.001, 'nor': 1.0, 'uv': 0.001}  # (the 16 bits' tolerance: a millimetre, a degree, a millimetre of the uv's metres)

def b64(a): return base64.b64encode(a.tobytes()).decode()

def _oct_dec(qx, qy):
    """a normal's two bytes back to the unit vector they stand for — the same sums as js/mesh3d.js"""
    x, y = qx / 127.0, qy / 127.0; z = 1.0 - abs(x) - abs(y)
    if z < 0: x, y = (1.0 - abs(y)) * (1.0 if x >= 0 else -1.0), (1.0 - abs(x)) * (1.0 if y >= 0 else -1.0)
    l = math.sqrt(x * x + y * y + z * z) or 1.0
    return (x / l, y / l, z / l)

def oct16(n):
    """a normal in two bytes: the octahedron's code of it, the nearest of its neighbours to the normal itself (Cigolle et al. 2014)"""
    x, y, z = n; l = abs(x) + abs(y) + abs(z)
    if l == 0: return (0, 0)
    x, y, z = x / l, y / l, z / l
    if z < 0: x, y = (1.0 - abs(y)) * (1.0 if x >= 0 else -1.0), (1.0 - abs(x)) * (1.0 if y >= 0 else -1.0)
    q0 = (int(round(x * 127)), int(round(y * 127))); m = math.sqrt(n[0] ** 2 + n[1] ** 2 + n[2] ** 2) or 1.0; u = (n[0] / m, n[1] / m, n[2] / m)
    best, bd = q0, -2.0
    for du in (-1, 0, 1):
        for dv in (-1, 0, 1):
            q = (max(-127, min(127, q0[0] + du)), max(-127, min(127, q0[1] + dv))); d = _oct_dec(*q); c = d[0] * u[0] + d[1] * u[1] + d[2] * u[2]
            if c > bd + 1e-12: bd, best = c, q
    return best

def _over(V, lo, hi):
    """values as whole numbers of 16 bits over [lo, hi] on each axis (an axis of no extent: all 0), kept inside it"""
    span = hi - lo; k = np.where(span > 0, Q16 / np.where(span > 0, span, 1.0), 0.0)
    return np.clip(np.rint((V - lo) * k), 0, Q16).astype('<u2')

def _back(Q, lo, hi): return lo + Q.astype(np.float64) * ((hi - lo) / Q16)

def form16(name, P, Nf, UV, C, I, parts):
    """a model's geometry in the 16-bit form: P its points (the shape's, to 5 decimals), Nf the shape's own normals, UV its uv (to 4
    decimals), C each point's colour (0–255), I the index, parts [[name, start, count]] — the dict's fields, checked against the shape
    (decoded again here: the points, the normals and the uv within the tolerance, or nothing is written)"""
    P = np.array(P, '<f4'); UV = np.array(UV, '<f4'); C = np.array(C, 'u1'); I = np.array(I); n = len(P)
    lo, hi = P.min(0), P.max(0); box = [round(float(v), 4) for v in list(lo) + list(hi)]
    blo, bhi = np.array(box[:3], np.float64), np.array(box[3:], np.float64)
    p16 = _over(P.astype(np.float64), blo, bhi)
    ul, uh = UV.min(0).astype(np.float64), UV.max(0).astype(np.float64); ub = [round(float(v), 5) for v in list(ul) + list(uh)]
    ulo, uhi = np.array(ub[:2], np.float64), np.array(ub[2:], np.float64); u16 = _over(UV.astype(np.float64), ulo, uhi)
    n8 = np.array([oct16(v) for v in Nf], '<i1').reshape(-1, 2)
    # (decoded again, as the game decodes it, beside the shape's own numbers)
    dp = np.abs(_back(p16, blo, bhi) - P.astype(np.float64)).max() if n else 0.0
    du = np.abs(_back(u16, ulo, uhi) - UV.astype(np.float64)).max() if n else 0.0
    dn = 0.0
    for (qx, qy), v in zip(n8.tolist(), Nf):
        m = math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2) or 1.0; d = _oct_dec(qx, qy)
        dn = max(dn, math.degrees(math.acos(max(-1.0, min(1.0, (d[0] * v[0] + d[1] * v[1] + d[2] * v[2]) / m)))))
    if dp > TOL['pos'] or dn > TOL['nor'] or du > TOL['uv']:
        raise SystemExit(f'{name}: a forma de 16 bits passa da tolerância — ponto {dp * 1000:.3f} mm, normal {dn:.3f}°, uv {du * 1000:.3f} mm')
    grey = bool(len(C) == 0 or ((C[:, 0] == C[:, 1]) & (C[:, 0] == C[:, 2])).all()); big = n > 65535
    d = {'v': 2, 'n': int(n), 't': int(len(I) // 3), 'box': box, 'p16': b64(p16), 'n8': b64(n8), 'idx': b64(I.astype('<u4' if big else '<u2')), 'i32': bool(big),
         'parts': parts, 'ub': ub, 'u16': b64(u16)}
    if grey: d['cg'] = b64(np.ascontiguousarray(C[:, 0]) if len(C) else C)
    else: d['col'] = b64(C)
    err = {'pos': float(dp), 'nor': float(dn), 'uv': float(du)}
    for k in WORST: WORST[k] = max(WORST[k], err[k])
    return d, (lo, hi), err

WORST = {'pos': 0.0, 'nor': 0.0, 'uv': 0.0}  # (the farthest of the 16 bits from the shapes, of the models written in this run)
def worst(): return f"os 16 bits: o ponto mais longe a {WORST['pos'] * 1000:.3f} mm da forma, a normal a {WORST['nor']:.3f}°, o uv a {WORST['uv'] * 1000:.3f} mm"
