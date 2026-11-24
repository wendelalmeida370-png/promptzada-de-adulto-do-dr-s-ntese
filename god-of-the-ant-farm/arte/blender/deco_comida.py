# deco_comida: what is served at a tavern's tables, and what the tables keep of the night (the interiors 2.0, the front P5, D-748) —
# each dish as the kitchen makes it (js/act-taverna.js: the dish is the part of the food it is made of — G.Origem —, DISH and
# DESC_FOOD), on its plate or in its bowl; each drink in its own cup, the cup's level as much as is left; and the marks of the
# night: the rings of beer on the boards, the knucklebones of a game, the shards of a mug broken in a brawl, the puddle of what was
# spilt, the slate and the board and the painted plaque at the door. Drawn in the furniture's shapes (moveis_forma.py), with the
# dish's own colours in each point (the vertex colours: what the food is — the crust, the crumb, the fish's skin and flesh, the
# broth and what floats in it —, its light baked in with them), the plate's and the cup's stuff painted by the game (louca: fired
# clay where the people has had the potter's ware, turned wood where not — js/dentro3d.js).
# What is eaten goes in quarters, as the world counts what was eaten (js/atmos.js: the stage, 0 to 4): the parts of a dish are
#   bN — a bite: there while fewer than N quarters are eaten (the fish's flesh, a slice of bread, a tortilla, an egg);
#   fN — the same, painted the fruit of the people (comida-fruta);
#   nN — a level: there only at stage N (the broth in the bowl, the beer in the mug: its surface as much as is left);
#   nv — the level that goes down: one surface of a broth, a porridge, the oil, with what floats in it, set by the game at each
#        stage's height and width (the model's niv: the axis, and for each stage the drop and the scale — js/dentro3d.js);
#   rN — a remains: there once N quarters are eaten (the fish's bones bared, the shells emptied, the beer's lacing on the wall);
#   e0 / e1 — a beer's head: fresh (e0) and settled (e1), at the full level only;
#   vapor — the steam of a hot plate (drawn by its own light material, only while the plate is hot: js/dentro3d.js);
#   resto — always: what lies under the food (the bones, the juice, the smear at the bottom).
# Nothing is drawn by chance: every jitter is a seeded generator's or a function of the point — the same dish, the same shape.
import math, random
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree
import moveis_forma as F
from moveis_forma import torno, cilindro, tubo, curva, arco_pts, lamina, ovo, almofada, caixa, TAU

def R(seed): return random.Random(seed)

# ------------------------------ the colour of each point ------------------------------
# (every point a shape makes takes the colour in force — a colour, or a function of the point: the crust darker at the top, the
# grill's marks across the fish —; None: white, the part painted whole by the game)
COR = [None]
_v0 = F.Parte.v
def _v(self, p, n, uv):
    i = _v0(self, p, n, uv); K = self.__dict__.get('K')
    if K is None: K = self.K = []
    while len(K) < i: K.append(None)
    c = COR[-1]; K.append(c(self.P[i]) if callable(c) else c)
    return i
F.Parte.v = _v

class cor:
    def __init__(self, c): self.c = c
    def __enter__(self): COR.append(self.c)
    def __exit__(self, *a): COR.pop()

def mix(a, b, t): t = max(0.0, min(1.0, t)); return tuple(a[k] + (b[k] - a[k]) * t for k in range(3))
def mul(a, f): return tuple(min(255.0, a[k] * f) for k in range(3))
def hsh(*q):
    """a number 0..1 from a point: the same point, the same number"""
    s = 0.0
    for k, v in enumerate(q): s += v * (127.1 + 311.7 * k) + k * 17.3
    x = math.sin(s * 12.9898) * 43758.5453; return x - math.floor(x)
def grao(p, f=180.0):
    """a fine grain over a surface (the rice's grains, the crumb's holes, the chalk's dust): 0..1 by the point"""
    return hsh(math.floor(p[0] * f), math.floor(p[1] * f), math.floor(p[2] * f))
def jit(a, v, f=8.0, k=0):
    """a jitter over a disc by its point (never by the angle: the seam at a full turn stays shut)"""
    return hsh(round(math.cos(a) * v * f), round(math.sin(a) * v * f), k) - 0.5
def manchas(p, f=40.0):
    """soft patches: a value noise 0..1 by the point"""
    x, y, z = p[0] * f, p[1] * f, p[2] * f; ix, iy, iz = math.floor(x), math.floor(y), math.floor(z); fx, fy, fz = x - ix, y - iy, z - iz
    s = lambda t: t * t * (3 - 2 * t); fx, fy, fz = s(fx), s(fy), s(fz)
    def c(a, b, d): return hsh(ix + a, iy + b, iz + d)
    lerp = lambda a, b, t: a + (b - a) * t
    return lerp(lerp(lerp(c(0, 0, 0), c(1, 0, 0), fx), lerp(c(0, 1, 0), c(1, 1, 0), fx), fy), lerp(lerp(c(0, 0, 1), c(1, 0, 1), fx), lerp(c(0, 1, 1), c(1, 1, 1), fx), fy), fz)

# ------------------------------ the colours of the dishes (sRGB) ------------------------------
CRUSTA, MIOLO = (168, 100, 44), (234, 208, 162)
ARROZ = (240, 234, 216); CALDO = (196, 150, 80); CEVADA = (176, 136, 84); GRAO = (206, 174, 112); GORDO = (238, 206, 120)
SOPA = (150, 122, 56); CENOURA = (222, 116, 38); FOLHA = (78, 116, 42); FEIJAO = (200, 176, 132)
SORGO = (156, 86, 58); COALHADA = (242, 238, 224); SORO = (226, 216, 162); ENSOPADO = (112, 62, 34); NACO = (84, 40, 26)
TORTILHA = (226, 194, 124); TOSTADO = (146, 96, 48)
CROSTA, CARVAO, CORTE, GORDURA, OSSO = (118, 60, 30), (48, 30, 20), (176, 88, 66), (222, 186, 132), (230, 220, 196)
CONCHA, BORDA, NACAR, MARISCO = (34, 38, 52), (96, 104, 126), (176, 180, 196), (228, 142, 68)
CLARA, GEMA, CASCA = (246, 242, 230), (240, 176, 40), (228, 212, 188)
MEL, AZEITE, SUCO = (214, 146, 30), (178, 160, 50), (180, 118, 44)
PELE_DORSO, PELE_FLANCO, PELE_VENTRE, CARNE_PEIXE = (86, 80, 68), (196, 152, 90), (222, 208, 176), (238, 226, 206)
CERVEJA, ESPUMA, VINHO, PULQUE, HIDROMEL = (168, 104, 30), (244, 234, 208), (78, 16, 28), (232, 228, 208), (214, 148, 44)
CHIFRE_BASE, CHIFRE_PONTA = (228, 212, 172), (72, 54, 38)

# ------------------------------ the AO of parts that come and go ------------------------------
import re as _re
def staged(name): return name in ('vapor', 'nv') or name.startswith('x-') or bool(_re.match(r'^([bfnre]|cera)\d$', name))
def bake(M, rays=16, dist=0.2, lo=0.45):
    """the furniture's ambient light (bake_ao), but each part that comes and goes seen only with what is always there: the broth
    under the broth's other levels, the spine under the fish's flesh — each lit as it is when it shows"""
    always = [q for k, q in M.parts.items() if not staged(k) and q.T]
    def tree(extra):
        verts, tris = [], []
        for q in always + extra:
            o = len(verts); verts += [Vector(p) for p in q.P]; tris += [(a + o, b + o, c + o) for a, b, c in q.T]
        o = len(verts); Fl = 4.0; verts += [Vector((-Fl, -0.0005, -Fl)), Vector((Fl, -0.0005, -Fl)), Vector((Fl, -0.0005, Fl)), Vector((-Fl, -0.0005, Fl))]; tris += [(o, o + 2, o + 1), (o, o + 3, o + 2)]
        return BVHTree.FromPolygons(verts, tris)
    D = []
    for k in range(rays):
        z = 1 - (k + 0.5) / rays; r = math.sqrt(max(0.0, 1 - z * z)); t = k * 2.399963; D.append(Vector((r * math.cos(t), r * math.sin(t), z)))
    base = tree([])
    for name, q in M.parts.items():
        if name == 'vapor': q.C = [1.0] * len(q.P); continue
        bvh = tree([q]) if staged(name) else base; q.C = []
        for p, n in zip(q.P, q.N):
            N = Vector(n); P0 = Vector(p) + N * 0.002
            up = Vector((0, 0, 1)) if abs(N.z) < 0.9 else Vector((1, 0, 0)); e1 = N.cross(up).normalized(); e2 = N.cross(e1)
            hit = wt = 0.0
            for d in D:
                w = d.z; v = e1 * d.x + e2 * d.y + N * d.z; wt += w; h = bvh.ray_cast(P0, v, dist)
                if h[0] is not None: hit += w * (1 - (h[3] / dist) ** 2 * 0.6)
            occ = hit / wt if wt else 0.0; q.C.append(lo + (1 - lo) * (1 - occ) ** 1.15)

# ------------------------------ the vessels: plates and bowls, with their insides ------------------------------
def prato_fundo(M, part='louca', r=0.118, oval=1.0, seg=20):
    """a plate: its foot ring, its rim, its well — the well's floor at y = 0.014, r·0.68 across"""
    pf = [(0.0, r * 0.6), (0.006, r * 0.66), (0.01, r * 0.6), (0.016, r * 0.76), (0.024, r * 0.97), (0.028, r)]
    torno(M, part, pf, seg=seg, sharp=55, cap1=False, oval=oval)
    torno(M, part, [(0.028, r * 0.95), (0.018, r * 0.74), (0.014, r * 0.66), (0.014, 0.0001)], seg=seg, cap0=False, cap1=False, sharp=40, oval=oval)
    return 0.014

def tigela_funda(M, part='louca', r=0.084, h=0.072, seg=24):
    """a bowl, its inside to its bottom: → r_in(y), the inner wall's radius at a height, and the bottom's height"""
    pf = [(0.0, r * 0.42), (0.006, r * 0.48), (0.012, r * 0.44), (0.03, r * 0.72), (h * 0.7, r * 0.93), (h - 0.004, r), (h, r * 0.99)]
    torno(M, part, pf, seg=seg, sharp=55, cap1=False)
    yb = 0.016; ins = [(h, r * 0.95), (h * 0.7, r * 0.86), (0.034, r * 0.62), (yb + 0.004, r * 0.36), (yb, 0.0001)]
    torno(M, part, ins, seg=seg, cap0=False, cap1=False, sharp=60)
    return (lambda y: perfil_r(ins, y)), yb

def perfil_r(pf, y):
    """the radius of a profile [(y, r)] at a height (the inner wall going down)"""
    pts = sorted(pf)
    if y <= pts[0][0]: return pts[0][1]
    for (y0, r0), (y1, r1) in zip(pts, pts[1:]):
        if y0 <= y <= y1: return r0 + (r1 - r0) * (y - y0) / ((y1 - y0) or 1)
    return pts[-1][1]

def disco(M, part, y, r, seg=18, x=0.0, z=0.0, oval=1.0, alto=None, nv=None):
    """a surface: a disc at y (alto(u, v): its rise at a point — the meniscus, the heap), r across; u round, v out from the middle"""
    nv = nv or (3 if alto else 2) if M.lod == 0 else 2
    def f(u, v):
        a = u * TAU; rr = r * v; hy = alto(a, v) if alto else 0.0
        return (x + rr * math.cos(a), y + hy, z + rr * math.sin(a) * oval)
    lamina(M, part, f, seg, nv)

def nivel(M, part, y, rin, c, seg=16, ondas=0.0, alto=None):
    """the level of a liquid in its vessel: a disc just to its wall (a hair into it), the meniscus up at the rim"""
    r = rin(y) + 0.0015; o = M.tp((0.0, 0.0, 0.0))
    def h(a, v): return (0.0012 * v ** 6) + (alto(a, v) if alto else 0.0) + ondas * math.sin(a * 5 + v * 7) * v
    # (darker where it meets the wall — the meniscus in the shade of the rim —, as the colour of the liquid says elsewhere)
    def cc(p): d = math.hypot(p[0] - o[0], p[2] - o[2]) / max(r, 1e-4); k = c(p) if callable(c) else c; return mul(k, 1.0 - 0.22 * max(0.0, min(1.0, (d - 0.72) / 0.28)))
    with cor(cc): disco(M, part, y, r, seg=seg, alto=h, nv=3 if M.lod == 0 else 2)

def pedacos(M, part, y, rmax, lista, seed, seg=6, nv=3):
    """what floats on a broth or lies in a heap: [(colour, size, how many)] — small lumps over the surface, half under it"""
    rnd = R(seed)
    for c, s, n in lista:
        for k in range(n):
            a = rnd.uniform(0, TAU); rr = rmax * math.sqrt(rnd.uniform(0.02, 0.85)); x, z = rr * math.cos(a), rr * math.sin(a)
            sx, sy, sz = s * rnd.uniform(0.8, 1.25), s * rnd.uniform(0.55, 0.8), s * rnd.uniform(0.8, 1.25)
            with cor(lambda p, c=c: mul(c, 0.86 + 0.24 * manchas(p, 90))): ovo(M, part, x, y + sy * 0.1, z, sx, sy, sz, seg=seg, nv=nv)

def nivel_movel(M, rin, ys):
    """the stages of the level that goes down (part nv, made at ys[0]): the axis it narrows about, and each stage's drop and scale"""
    o = M.tp((0.0, 0.0, 0.0)); r0 = rin(ys[0]) + 0.0015
    M.niv = {'c': [round(o[0], 4), round(o[2], 4)], 'k': [[round(y - ys[0], 4), round((rin(y) + 0.0015) / r0, 4)] for y in ys]}

def colher(M, x, y, z, ang, L=0.15):
    """a wooden spoon resting in a bowl: its bowl down in it, its handle out over the rim"""
    M.at(x, y, z, ry=ang)
    tubo(M, 'madeira', [(0.0, 0.0, 0.0), (0.05, 0.022, 0.0), (L * 0.75, 0.05, 0.0), (L, 0.062, 0.0)], 0.0045, seg=6, oval=0.5, rs=[0.004, 0.0045, 0.005, 0.0045])
    ovo(M, 'madeira', -0.012, 0.0, 0.0, 0.018, 0.005, 0.013, seg=8, nv=3)
    M.pop()

def vapor(M, x, z, y0, h=0.14, w=0.05, n=3, seed=0):
    """the steam over a hot dish: n wisps rising and turning, wider as they go — their brightness in the colour of each point (the
    fade at the foot, at the top and at the edges); the game's own material moves the wisps up (js/dentro3d.js)"""
    rnd = R(seed)
    for k in range(n):
        ph = rnd.uniform(0, TAU); ox, oz = x + rnd.uniform(-0.025, 0.025), z + rnd.uniform(-0.025, 0.025); tw = rnd.uniform(1.6, 2.6) * (1 if k % 2 else -1); hh = h * rnd.uniform(0.85, 1.1)
        def f(u, v, ph=ph, ox=ox, oz=oz, tw=tw, hh=hh):
            t = ph + tw * v; ww = w * (0.45 + 0.9 * v); sway = 0.022 * math.sin(v * 4.2 + ph) * v
            return (ox + (u - 0.5) * ww * math.cos(t) + sway, y0 + hh * v, oz + (u - 0.5) * ww * math.sin(t) + sway * 0.6)
        def fade(p, ph=ph, ox=ox, oz=oz, hh=hh):
            v = max(0.0, min(1.0, (p[1] - y0) / hh)); a = min(1.0, v / 0.18) * (1 - v) ** 1.3
            return (255 * a, 255 * a, 255 * a)
        with cor(fade): lamina(M, 'vapor', f, 2, 6 if M.lod == 0 else 3, both=True)

# ------------------------------ the dishes ------------------------------
def _peixe_assado(M, L=0.21, y=0.016, P=None, leve=False):
    """a fish grilled whole, lying on its side on the plate: its head and tail and spine (resto) and its flesh in four pieces along
    it (b1 the middle, b2 behind it, b3 by the head, b4 by the tail): eaten, the bones are bared"""
    P = P or (lambda n: n)  # (the parts: its bites and its bones — or all of it one part, on a feast's platter)
    H = L * 0.21   # (half its height, from back to belly — across the plate, z)
    T = L * 0.075  # (half its thickness — up, y)
    x0 = -L / 2
    prof = lambda a: (math.sin(math.pi * min(1.0, a / 0.9) ** 0.75) ** 0.9) if a < 0.9 else 0.12
    def skin(p):
        a = (p[0] - x0) / L; zz = p[2] / H   # (-1 the belly, +1 the back)
        c = mix(PELE_VENTRE, PELE_FLANCO, (zz + 1) * 0.6); c = mix(c, PELE_DORSO, max(0.0, zz - 0.45) * 1.8)
        band = (p[0] * 0.8 + p[2] * 0.6) / 0.028; m = band - math.floor(band)
        if m < 0.22 and p[1] > y + T * 0.6: c = mix(c, CARVAO, 0.7)
        return mul(c, 0.9 + 0.18 * manchas(p, 70))
    def seg_(a0, a1, part, cap0=True, cap1=True, seg=10):
        if leve: seg, cap0, cap1 = 8, False, False  # (whole on a platter: never cut, never eaten by quarters)
        n = (4 if a1 - a0 > 0.18 else 3) if M.lod == 0 and not leve else 2; pts = [a0 + (a1 - a0) * k / n for k in range(n + 1)]
        def f(u, v):
            a = pts[0] + (pts[-1] - pts[0]) * u; t = v * TAU; r = prof(a)
            return (x0 + a * L, y + T + T * r * math.sin(t) * 0.98, H * r * math.cos(t))
        with cor(skin): lamina(M, P(part), f, n, seg)
        # (the flesh where it was cut from its neighbour: a face at each end, facing out of the piece)
        for a, on, sg in ((a0, cap0, -1), (a1, cap1, 1)):
            if not on: continue
            r = prof(a)
            def fc(u, v, a=a, r=r, sg=sg): t = sg * u * TAU; return (x0 + a * L, y + T + T * r * math.sin(t) * 0.98 * v, H * r * math.cos(t) * v)
            with cor(lambda p: mul(CARNE_PEIXE, 0.9 + 0.12 * manchas(p, 120))): lamina(M, P(part), fc, seg, 1)
    # (the head and the tail's root, always; the flesh between in four)
    seg_(0.0, 0.2, 'resto', cap0=False); seg_(0.82, 0.9, 'resto', cap1=False)
    for part, a0, a1 in (('b3', 0.2, 0.36), ('b1', 0.36, 0.52), ('b2', 0.52, 0.67), ('b4', 0.67, 0.82)): seg_(a0, a1, part)
    # (the tail fin, the eye, the gill's line)
    def fin(u, v):
        s = (u - 0.5) * 2; along = L * (0.88 + 0.13 * v); spread = H * (0.25 + 0.95 * v) * s
        return (x0 + along, y + T * 1.15, spread)
    with cor(lambda p: mix(PELE_FLANCO, CARVAO, 0.35 + 0.3 * abs(p[2]) / H)): lamina(M, P('resto'), fin, 3, 2, both=True)
    with cor((20, 18, 16)): ovo(M, P('resto'), x0 + L * 0.07, y + T * 1.95, H * 0.22, 0.0065, 0.002, 0.0065, seg=8, nv=3)
    with cor((236, 230, 214)): ovo(M, P('resto'), x0 + L * 0.07, y + T * 1.88, H * 0.22, 0.0095, 0.002, 0.0095, seg=8, nv=3)
    # (the bones, under the flesh: the spine, and the ribs out from it toward the belly)
    if leve: return
    with cor(OSSO):
        tubo(M, P('resto'), [(x0 + L * 0.18, y + T * 1.05, H * 0.08), (x0 + L * 0.5, y + T * 1.0, H * 0.12), (x0 + L * 0.84, y + T * 1.05, H * 0.05)], 0.0022, seg=5)
        for k in range(7 if M.lod == 0 else 4):
            a = 0.24 + 0.075 * k * (7 / (7 if M.lod == 0 else 4)); xa = x0 + L * a; r = prof(a)
            tubo(M, P('resto'), [(xa, y + T * 1.0, H * 0.1), (xa - 0.004, y + T * 0.95, -H * r * 0.45), (xa - 0.008, y + T * 0.8, -H * r * 0.78)], 0.0011, seg=4)
            tubo(M, P('resto'), [(xa, y + T * 1.0, H * 0.14), (xa - 0.003, y + T * 0.98, H * r * 0.7)], 0.0010, seg=4)

def comida_peixe(M, w, d, h):
    # (peixe do dia, da pesca do povo: grilled whole on a long plate, its juice under it)
    oval = 0.62; r = 0.135
    torno(M, 'louca', [(0.0, r * 0.55), (0.006, r * 0.62), (0.012, r * 0.58), (0.02, r * 0.84), (0.026, r)], seg=20, sharp=55, cap1=False, oval=oval)
    torno(M, 'louca', [(0.026, r * 0.95), (0.013, r * 0.62), (0.013, 0.0001)], seg=20, cap0=False, cap1=False, sharp=40, oval=oval)
    with cor(lambda p: mul(SUCO, 0.8 + 0.3 * manchas(p, 50))): disco(M, 'resto', 0.0142, 0.06, seg=14, oval=0.55, x=0.01)
    _peixe_assado(M, 0.205, 0.0145)
    vapor(M, 0.0, 0.0, 0.05, 0.13, 0.05, 3, seed=3)

def comida_carne(M, w, d, h):
    # (carne assada na brasa: a joint on its bone, browned and charred in its stripes, sliced off it in four — the bone left)
    y = prato_fundo(M, r=0.12)
    with cor(lambda p: mul(SUCO, 0.7 + 0.3 * manchas(p, 60))): disco(M, 'resto', y + 0.0006, 0.07, seg=14)
    # (the bone, across the plate)
    with cor(lambda p: mul(OSSO, 0.86 + 0.16 * manchas(p, 90))):
        tubo(M, 'resto', [(-0.085, y + 0.022, 0.0), (0.0, y + 0.024, 0.004), (0.09, y + 0.02, 0.0)], 0.0075, seg=8, rs=[0.009, 0.0065, 0.008])
        ovo(M, 'resto', -0.088, y + 0.022, 0.0, 0.014, 0.012, 0.016, seg=8, nv=4); ovo(M, 'resto', 0.093, y + 0.02, 0.0, 0.012, 0.011, 0.014, seg=8, nv=4)
    def roast(p):
        c = CROSTA; band = (p[0] * 0.7 + p[2] * 0.7) / 0.022; m = band - math.floor(band)
        if m < 0.2 and p[1] > y + 0.03: c = mix(c, CARVAO, 0.75)
        return mul(c, 0.82 + 0.3 * manchas(p, 80))
    # (the meat round the bone in four pieces: each a swollen lump, its cut face toward its neighbour pink)
    for part, x0, x1 in (('b4', -0.075, -0.04), ('b2', -0.04, 0.0), ('b1', 0.0, 0.04), ('b3', 0.04, 0.078)):
        cx = (x0 + x1) / 2; hw = (x1 - x0) / 2 + 0.002; tall = 0.034 - abs(cx) * 0.12
        with cor(roast): almofada(M, part, (cx - hw, y + 0.004, -0.04), (cx + hw, y + 0.004 + tall, 0.04), e=0.55, nu=10, nv=6)
        with cor(lambda p: mul(CORTE, 0.85 + 0.2 * manchas(p, 110))):
            for xx, sg in ((x0 + 0.0015, -1), (x1 - 0.0015, 1)):
                def fc(u, v, xx=xx, tall=tall, sg=sg): t = sg * u * TAU; return (xx, y + 0.004 + tall * 0.5 + tall * 0.42 * math.sin(t) * v, 0.036 * math.cos(t) * v)
                lamina(M, part, fc, 12, 1)
    vapor(M, 0.0, 0.0, y + 0.04, 0.13, 0.05, 3, seed=5)

def comida_marisco(M, w, d, h):
    # (mariscos da praia, cozidos: a heap of mussels opened by the boil, in four handfuls — the empty shells left on the rim)
    y = prato_fundo(M, r=0.12)
    with cor(lambda p: mul(SUCO, 0.75 + 0.3 * manchas(p, 60))): disco(M, 'resto', y + 0.0006, 0.075, seg=14)
    rnd = R(11)
    def concha(part, x, yy, z, ang, aberta=True, vazia=False):
        M.at(x, yy, z, ry=ang)
        for s in (-1, 1) if aberta else (1,):
            tilt = 0.55 * s if aberta else 0.0
            M.at(0, 0, s * 0.002, rx=tilt)
            def shell(p, s=s): return mix(CONCHA, BORDA, max(0.0, abs(p[0]) / 0.018 - 0.7) * 2.5) if True else CONCHA
            with cor(lambda p: mul(mix(CONCHA, BORDA, manchas(p, 160) * 0.5), 1.0)): ovo(M, part, 0, 0.003, 0, 0.019, 0.005, 0.0095, seg=8 if aberta else 6, nv=2)
            M.pop()
        if not vazia:
            with cor(lambda p: mul(MARISCO, 0.85 + 0.25 * manchas(p, 140))): ovo(M, part, 0, 0.006, 0.0, 0.013, 0.004, 0.007, seg=6, nv=2)
        M.pop()
    groups = (('b1', 0.0, 0.0), ('b2', 0.03, 0.025), ('b3', -0.032, 0.02), ('b4', 0.0, -0.035))
    for (part, gx, gz), nk in zip(groups, (3, 3, 2, 2)):
        for k in range(nk):
            a = rnd.uniform(0, TAU); concha(part, gx + 0.018 * math.cos(a), y + 0.004 + k * 0.004, gz + 0.018 * math.sin(a), rnd.uniform(0, TAU))
    # (the empties: three shells on the plate's rim for each handful eaten)
    for k, part in enumerate(('r1', 'r2', 'r3', 'r4')):
        a = 0.6 + k * 0.42
        for j in range(2): concha(part, 0.093 * math.cos(a + j * 0.13), 0.026 + j * 0.003, 0.093 * math.sin(a + j * 0.13), a + 1.2 + j, aberta=False, vazia=True)
    vapor(M, 0.0, 0.0, y + 0.03, 0.12, 0.05, 2, seed=7)

def _bowl_dish(M, rim, h, liquid, chunks, seed, spoon=True, steam=True, swirl=None, smear=None):
    """a dish of a bowl: its liquid's levels (n0 full to n3 a quarter left), what floats in it at each, the smear at its bottom"""
    rin, yb = tigela_funda(M, r=rim, h=h)
    top = h - 0.012; ys = [top - (top - yb - 0.006) * k / 4 for k in range(4)]
    # (one surface with what floats in it, set lower and narrower at each stage by the game: niv)
    c = (lambda p: mul(mix(liquid, swirl, manchas(p, 55) ** 2) if swirl else liquid, 0.88 + 0.16 * manchas(p, 120)))
    nivel(M, 'nv', ys[0], rin, c, seg=24)
    if chunks: pedacos(M, 'nv', ys[0], rin(ys[0]) * 0.8, chunks, seed)
    nivel_movel(M, rin, ys)
    with cor(lambda p: mul(smear or liquid, 0.7 + 0.25 * manchas(p, 70))): disco(M, 'resto', yb + 0.0008, rin(yb + 0.004) * 0.8, seg=14)
    if spoon: colher(M, -0.02, yb + 0.012, 0.0, 0.5)
    if steam: vapor(M, 0.0, 0.0, top + 0.01, 0.13, 0.045, 3, seed=seed)
    return rin, yb

def comida_arroz(M, w, d, h):
    # (arroz cozido, das lavouras: a heap of boiled rice in its bowl, scooped as it is eaten)
    rin, yb = tigela_funda(M, r=0.084, h=0.07)
    top = 0.07 - 0.008
    def rice(p): g = grao(p, 260); return mul(ARROZ, 0.86 + 0.16 * g) if g > 0.08 else mul(ARROZ, 0.72)
    for k in range(4):
        yy = top - k * (top - yb) * 0.22; rr = rin(yy)
        def heap(a, v, k=k):
            dome = (0.022 - k * 0.004) * (1 - v * v); scoop = -0.012 * max(0.0, 1 - ((math.cos(a - 0.7) * v - 0.45) ** 2 + (math.sin(a - 0.7) * v) ** 2) / 0.09) if k else 0.0
            return dome + scoop + 0.0025 * jit(a, v, 10, k)
        with cor(rice): disco(M, 'n%d' % k, yy, rr + 0.0015, seg=20, alto=heap)
    with cor(rice):
        for k in range(9): a = k * 2.4; ovo(M, 'resto', 0.03 * math.cos(a) * (0.4 + 0.07 * k), yb + 0.002, 0.03 * math.sin(a) * (0.4 + 0.07 * k), 0.003, 0.0015, 0.0016, seg=5, nv=2)
    vapor(M, 0.0, 0.0, top + 0.02, 0.13, 0.045, 3, seed=13)

def comida_trigo(M, w, d, h):
    # (pão de trigo com caldo quente: the bowl of broth on its plate, two pieces of the loaf by it)
    y = prato_fundo(M, r=0.12)
    M.at(-0.018, y, 0.0)
    rin, yb = _bowl_dish(M, 0.066, 0.058, CALDO, [((230, 196, 120), 0.006, 6)], 17, spoon=False, swirl=(220, 184, 110))
    M.pop()
    for part, x, z, ang in (('b2', 0.079, 0.032, 0.4), ('b4', 0.076, -0.042, -0.5)):
        M.at(x, y, z, ry=ang)
        with cor(lambda p: mul(mix(MIOLO, CRUSTA, min(1.0, max(0.0, (p[1] - y - 0.006) / 0.012))), 0.88 + 0.2 * manchas(p, 90))):
            ovo(M, part, 0, 0.016, 0, 0.03, 0.017, 0.024, seg=12, nv=5)
        with cor(lambda p: mix(CRUSTA, CARVAO, 0.3)): tubo(M, part, [(-0.02, 0.031, 0.0), (0.0, 0.034, 0.002), (0.02, 0.031, 0.0)], 0.004, seg=5, oval=0.5)
        M.pop()

def comida_cevada(M, w, d, h):
    # (caldo grosso de cevada: the thick broth, its grains swollen in it, the spoon in it)
    _bowl_dish(M, 0.084, 0.072, CEVADA, [(GRAO, 0.0062, 9), ((184, 146, 92), 0.0048, 5), (GORDO, 0.0032, 4)], 19, swirl=(198, 158, 100))

def comida_horta(M, w, d, h):
    # (sopa de legumes da horta: the broth, the roots and the leaves of the garden in it)
    _bowl_dish(M, 0.084, 0.072, SOPA, [(CENOURA, 0.007, 5), (FOLHA, 0.008, 4), (FEIJAO, 0.006, 5), (GORDO, 0.0032, 3)], 23, swirl=(178, 150, 70))

def comida_sorgo(M, w, d, h):
    # (mingau de sorgo: the reddish porridge, thick, the spoon standing in it)
    _bowl_dish(M, 0.08, 0.07, SORGO, None, 29, swirl=(196, 126, 86))

def comida_leite(M, w, d, h):
    # (coalhada fresca: the white curd, the whey shining on it in drops; cold — no steam)
    _bowl_dish(M, 0.08, 0.068, COALHADA, [(SORO, 0.004, 5)], 31, steam=False, swirl=(250, 248, 238))

def comida_provisao(M, w, d, h):
    # (o prato do dia — o que a cozinha tem hoje: a stew of what the store keeps, its lumps of meat and roots)
    _bowl_dish(M, 0.084, 0.072, ENSOPADO, [(NACO, 0.009, 6), (CENOURA, 0.007, 4), ((176, 140, 90), 0.007, 4), ((176, 120, 60), 0.003, 4)], 37, swirl=(140, 84, 44))

def comida_milho(M, w, d, h):
    # (tortilhas de milho, quentes: a stack of them on the plate, taken from the top — the last crumbs left)
    y = prato_fundo(M, r=0.12)
    def cake(p):
        s = manchas(p, 110); g = grao(p, 300); c = mix(TORTILHA, TOSTADO, max(0.0, s - 0.6) * 2.8)
        return mul(c, 0.9 + 0.14 * g) if s < 0.82 else mix(c, CARVAO, 0.35)
    # (four cakes, the top one eaten first: each its rim and its face, the face spotted where the comal toasted it, a little wavy)
    for k in range(4):
        part = ('b4', 'b3', 'b2', 'b1')[k]; yy = y + 0.002 + k * 0.0045; ox = 0.004 * math.sin(k * 2.1); oz = 0.004 * math.cos(k * 1.7); r = 0.077 + 0.002 * (k % 2)
        with cor(cake):
            torno(M, part, [(yy, r - 0.004), (yy + 0.0012, r), (yy + 0.0034, r - 0.001)], seg=18, x=ox, z=oz, sharp=50, cap0=False, cap1=False)
            disco(M, part, yy + 0.0034, r - 0.001, seg=18, x=ox, z=oz, alto=lambda a, v, k=k: 0.0012 * math.sin(a * 2 + k) * v ** 2 + 0.0008 * (1 - v * v), nv=4)
    with cor(lambda p: cake(p)):
        for k in range(5): a = k * 1.3; ovo(M, 'r4', 0.05 * math.cos(a), y + 0.002, 0.05 * math.sin(a), 0.004, 0.0012, 0.003, seg=5, nv=2)
    vapor(M, 0.0, 0.0, y + 0.03, 0.12, 0.05, 2, seed=41)

def comida_ovos(M, w, d, h):
    # (ovos cozidos: four, peeled — two whole, two halved to their yolks —, the bits of shell by them)
    y = prato_fundo(M, r=0.115)
    for part, x, z, ang, half in (('b1', -0.03, -0.02, 0.3, False), ('b2', 0.032, -0.018, 1.2, True), ('b3', -0.02, 0.035, 2.0, True), ('b4', 0.028, 0.03, -0.6, False)):
        M.at(x, y, z, ry=ang)
        if half:
            with cor(lambda p: mul(CLARA, 0.92 + 0.08 * manchas(p, 120))): torno(M, part, [(0.0, 0.0001), (0.004, 0.016), (0.012, 0.02), (0.016, 0.019)], seg=12, oval=0.75, cap1=False)
            with cor(lambda p: mul(CLARA, 0.94 + 0.06 * manchas(p, 120))): disco(M, part, 0.016, 0.0185, seg=12, oval=0.75)
            with cor(lambda p: mul(GEMA, 0.88 + 0.18 * manchas(p, 160))): ovo(M, part, 0.0, 0.0162, 0.0, 0.0105, 0.0045, 0.008, seg=10, nv=3)
        else:
            with cor(lambda p: mul(CLARA, 0.92 + 0.08 * manchas(p, 120))): ovo(M, part, 0, 0.017, 0, 0.023, 0.016, 0.017, seg=12, nv=5)
        M.pop()
    with cor(CASCA):
        for k, part in enumerate(('r1', 'r2', 'r3', 'r4')):
            for j in range(3): a = 2.6 + k * 0.5 + j * 0.15; ovo(M, part, 0.08 * math.cos(a), y + 0.0015 + j * 0.0005, 0.08 * math.sin(a), 0.006, 0.0008, 0.0045, seg=5, nv=2)
    vapor(M, 0.0, 0.0, y + 0.03, 0.11, 0.04, 2, seed=43)

def comida_fruta(M, w, d, h):
    # (frutas da estação: four of the people's fruit in a bowl — the fruit's colour is the people's, the game's — the cores left)
    rin, yb = tigela_funda(M, r=0.084, h=0.06)
    for part, x, yy, z, s in (('f1', -0.022, 0.044, -0.012, 1.0), ('f2', 0.024, 0.046, -0.016, 0.95), ('f3', 0.0, 0.05, 0.026, 1.05), ('f4', 0.0, 0.07, 0.0, 0.9)):
        # (the fruit's own blush: lighter where the sun was on it, a little darker round its foot — the colour is the people's fruit)
        with cor(lambda p, yy=yy, s=s: mul((255, 244, 236), 0.78 + 0.26 * max(0.0, min(1.0, (p[1] - yy) / (0.024 * s) * 0.5 + 0.5)) + 0.06 * manchas(p, 90))):
            ovo(M, part, x, yy, z, 0.026 * s, 0.024 * s, seg=14, nv=7)
        with cor((92, 64, 38)): tubo(M, part, [(x, yy + 0.022 * s, z), (x + 0.003, yy + 0.032 * s, z + 0.002)], 0.0013, seg=4)
    with cor(lambda p: mix((222, 206, 160), (120, 84, 48), manchas(p, 130) * 0.6)):
        for k, part in enumerate(('r1', 'r2', 'r3', 'r4')):
            a = 0.8 + k * 1.5; ovo(M, part, 0.03 * math.cos(a), yb + 0.008, 0.03 * math.sin(a), 0.008, 0.012, 0.007, seg=7, nv=4)

def _fatias(M, y, honey=False):
    # (four slices of a loaf, a little apart on the plate: the crust round each, the crumb on top — honey drawn over it where there is)
    for part, x, z, ang in (('b1', -0.035, -0.012, 0.25), ('b2', 0.0, -0.018, 0.05), ('b3', 0.036, -0.01, -0.2), ('b4', 0.0, 0.035, 1.5)):
        M.at(x, y, z, ry=ang)
        def crumb(p, x=x, z=z, ang=ang):
            top = p[1] > y + 0.011; c = mul(MIOLO, 0.84 + 0.2 * grao(p, 200)) if top else mul(CRUSTA, 0.85 + 0.2 * manchas(p, 90))
            if honey and top:
                lx = (p[0] - x) * math.cos(ang) - (p[2] - z) * math.sin(ang); m = math.sin(lx * 260 + (p[2] - z) * 90)
                if m > 0.55: c = mix(c, MEL, 0.85)
            return c
        with cor(crumb): almofada(M, part, (-0.016, 0.001, -0.026), (0.016, 0.013, 0.026), e=0.3, nu=10, nv=4)
        M.pop()
    with cor(lambda p: mul(MIOLO, 0.8)):
        for k in range(6): a = k * 1.1; ovo(M, 'r4', 0.055 * math.cos(a), y + 0.0015, 0.055 * math.sin(a), 0.003, 0.0015, 0.0025, seg=5, nv=2)

def comida_mel(M, w, d, h):
    # (pão com mel: the slices with the honey run over them, the little pot of it by them)
    y = prato_fundo(M, r=0.12); _fatias(M, y, honey=True)
    M.at(0.058, y, 0.05)
    torno(M, 'louca', [(0.0, 0.016), (0.004, 0.02), (0.02, 0.024), (0.032, 0.02), (0.036, 0.021)], seg=12, sharp=55, cap1=False)
    torno(M, 'louca', [(0.036, 0.019), (0.012, 0.016), (0.012, 0.0001)], seg=12, cap0=False, cap1=False)
    with cor(lambda p: mul(MEL, 0.9 + 0.15 * manchas(p, 100))): disco(M, 'resto', 0.03, 0.019, seg=12)
    M.pop()

def comida_azeite(M, w, d, h):
    # (pão com azeite: the slices, the little dish of oil they are dipped in — its oil lower as they go)
    y = prato_fundo(M, r=0.12); _fatias(M, y)
    M.at(0.058, y, 0.05)
    pf = [(0.0, 0.018), (0.004, 0.024), (0.014, 0.03), (0.018, 0.031)]; torno(M, 'louca', pf, seg=14, sharp=55, cap1=False)
    ins = [(0.018, 0.029), (0.008, 0.02), (0.006, 0.0001)]; torno(M, 'louca', ins, seg=14, cap0=False, cap1=False)
    ys = [0.015 - k * 0.002 for k in range(4)]
    with cor(lambda p: mul(AZEITE, 0.9 + 0.15 * manchas(p, 80))): disco(M, 'nv', ys[0], perfil_r(ins, ys[0]) + 0.001, seg=14)
    nivel_movel(M, lambda y: perfil_r(ins, y) - 0.0005, ys)
    with cor(lambda p: mul(AZEITE, 0.7)): disco(M, 'resto', 0.0066, 0.016, seg=12)
    M.pop()

# ------------------------------ the drinks ------------------------------
def _levels(M, rin, top, bottom, liquid, foam=False, seg=16):
    """a drink's levels (n0 full … n3 a quarter left), its dregs at the bottom (resto); beer's foam: the fresh head and the settled
    one at the full level, a film on the lower ones, the lacing left on the wall above each (r1 … r3)"""
    ys = [top - (top - bottom) * k / 4 for k in range(4)]
    for k, yy in enumerate(ys):
        if foam and k:
            c = lambda p: mix(mul(liquid, 0.9 + 0.12 * manchas(p, 70)), ESPUMA, max(0.0, manchas(p, 85) - 0.5) * 1.6)
        else: c = lambda p: mul(liquid, 0.92 + 0.12 * manchas(p, 70))
        nivel(M, 'n%d' % k, yy, rin, c, seg=seg)
        if foam and k:
            with cor(lambda p: mul(ESPUMA, 0.92 + 0.08 * manchas(p, 150))):
                torno(M, 'r%d' % k, [(ys[k - 1] + 0.0018, rin(ys[k - 1]) - 0.0006), (ys[k - 1] - 0.0018, rin(ys[k - 1]) - 0.0009)], seg=seg, cap0=False, cap1=False)
    with cor(mul(liquid, 0.55)): disco(M, 'resto', bottom - 0.004, rin(bottom - 0.004) * 0.9, seg=seg)
    if foam:
        y0 = ys[0]; r0 = rin(y0)
        with cor(lambda p: mul(ESPUMA, 0.9 + 0.1 * manchas(p, 140))):
            # (fresh: the head up over the rim, rounded and bubbled; settled: a finger of it, flat)
            disco(M, 'e0', y0 + 0.004, r0 + 0.002, seg=seg, alto=lambda a, v: 0.02 * (1 - v ** 4) + 0.0018 * jit(a, v, 9))
            disco(M, 'e1', y0 + 0.005, r0 + 0.0018, seg=seg, alto=lambda a, v: 0.0016 * (1 - v * v))

def _caneca(M, h=0.12, part='louca'):
    pf = [(0.0, 0.032), (0.006, 0.038), (0.012, 0.036), (0.05, 0.04), (h - 0.008, 0.045), (h, 0.047)]
    torno(M, part, pf, seg=16, sharp=55, cap1=False)
    ins = [(h, 0.043), (h * 0.5, 0.039), (0.014, 0.034), (0.012, 0.0001)]
    torno(M, part, ins, seg=16, cap0=False, cap1=False, sharp=60)
    tubo(M, part, curva([(0.042, h - 0.02, 0), (0.07, h - 0.03, 0), (0.072, 0.045, 0), (0.04, 0.03, 0)], 7), 0.007, seg=6, oval=0.7)
    return (lambda y: perfil_r(ins, y)), h - 0.016, 0.02

def _copo(M, h=0.085, part='louca'):
    pf = [(0.0, 0.026), (0.006, 0.03), (0.02, 0.046), (h - 0.012, 0.055), (h, 0.058)]
    torno(M, part, pf, seg=16, sharp=55, cap1=False)
    ins = [(h, 0.055), (h - 0.012, 0.051), (0.022, 0.04), (0.012, 0.022), (0.011, 0.0001)]
    torno(M, part, ins, seg=16, cap0=False, cap1=False, sharp=60)
    return (lambda y: perfil_r(ins, y)), h - 0.014, 0.018

def _taca(M, h=0.09, part='louca'):
    # (the skyphos: the deep bowl on its low foot, two flat handles at its lip)
    pf = [(0.0, 0.03), (0.008, 0.032), (0.014, 0.022), (0.025, 0.034), (0.05, 0.052), (h - 0.006, 0.06), (h, 0.061)]
    torno(M, part, pf, seg=18, sharp=55, cap1=False)
    ins = [(h, 0.058), (h - 0.012, 0.056), (0.045, 0.044), (0.026, 0.026), (0.024, 0.0001)]
    torno(M, part, ins, seg=18, cap0=False, cap1=False, sharp=60)
    for s in (-1, 1): tubo(M, part, curva([(s * 0.058, h - 0.012, 0), (s * 0.085, h - 0.01, 0), (s * 0.088, h - 0.026, 0), (s * 0.058, h - 0.032, 0)], 7), 0.006, seg=6, oval=0.5)
    return (lambda y: perfil_r(ins, y)), h - 0.016, 0.03

def bebida_cerveja(M, w, d, h):
    # (a mug of beer: amber, its head of foam — fresh and up over the rim, then settled —, the lacing left as it goes down)
    rin, top, bot = _caneca(M); _levels(M, rin, top, bot, CERVEJA, foam=True)

def bebida_cerveja_copo(M, w, d, h):
    # (the beer of the Nile and of the lake in its handleless cup)
    rin, top, bot = _copo(M); _levels(M, rin, top, bot, CERVEJA, foam=True)

def bebida_vinho(M, w, d, h):
    # (a cup of wine, dark: the skyphos of the Greeks and the Romans)
    rin, top, bot = _taca(M); _levels(M, rin, top, bot, VINHO)

def bebida_vinho_copo(M, w, d, h):
    rin, top, bot = _copo(M); _levels(M, rin, top, bot, VINHO)

def bebida_mel_caneca(M, w, d, h):
    # (mead in the people's mug, where there is no horn to drink it from)
    rin, top, bot = _caneca(M); _levels(M, rin, top, bot, HIDROMEL)

def bebida_pulque(M, w, d, h):
    # (pulque in its cuia: half a gourd, its rim cut and smoothed; the drink milky and thick)
    pf = [(0.0, 0.026), (0.004, 0.036), (0.014, 0.052), (0.03, 0.064), (0.048, 0.068), (0.06, 0.066)]
    torno(M, 'cabaca', pf, seg=18, sharp=60, cap1=False)
    ins = [(0.06, 0.063), (0.046, 0.064), (0.026, 0.056), (0.01, 0.034), (0.008, 0.0001)]
    torno(M, 'cabaca', ins, seg=18, cap0=False, cap1=False, sharp=60)
    rin = lambda y: perfil_r(ins, y); _levels(M, rin, 0.048, 0.016, PULQUE)

def bebida_mel(M, w, d, h):
    # (mead in a drinking horn, standing in its wooden stand: golden, the horn pale at its mouth and dark to its tip)
    with cor(lambda p: mix(CHIFRE_BASE, CHIFRE_PONTA, max(0.0, min(1.0, (0.16 - p[1]) / 0.12 + p[0] / 0.08)) ** 1.4)):
        n = 9; pts = curva([(0.05, 0.03, 0.0), (0.025, 0.05, 0.0), (0.006, 0.09, 0.0), (0.0, 0.13, 0.0), (0.0, 0.165, 0.0)], n)
        rs = [0.004 + 0.032 * (k / (n - 1)) ** 1.5 for k in range(n)]
        tubo(M, 'resto', pts, 0.03, seg=14, caps=False, rs=rs)
        # (the mouth's inside: the horn's wall turned in, down to where the drink can be seen)
        torno(M, 'resto', [(0.165, 0.0345), (0.15, 0.026), (0.13, 0.019), (0.112, 0.0001)], seg=14, cap0=False, cap1=False)
    # (the stand: a ring on three legs)
    for k in range(3):
        a = k * TAU / 3 + 0.4; tubo(M, 'madeira', [(0.034 * math.cos(a), 0.0, 0.034 * math.sin(a)), (0.03 * math.cos(a), 0.105, 0.03 * math.sin(a))], 0.0035, seg=5)
    tubo(M, 'madeira', arco_pts((0, 0.105, 0), 0.031, 0, TAU, 12, plane='xz'), 0.004, seg=5, closed=True)
    rin = lambda y: perfil_r([(0.165, 0.0345), (0.15, 0.026), (0.13, 0.019), (0.112, 0.004)], y)
    _levels(M, rin, 0.157, 0.125, HIDROMEL, seg=14)

# ------------------------------ the marks of the night ------------------------------
def mancha(estilo):
    """the rings and the drips of beer on the boards: a cup's foot set down wet, a drink run — a hair over the wood, darker"""
    def f(M, w, d, h):
        rnd = R(ord(estilo) * 7)
        if estilo in 'ab':
            for k in range(2 if estilo == 'a' else 1):
                cx, cz, r = rnd.uniform(-0.02, 0.02), rnd.uniform(-0.02, 0.02), rnd.uniform(0.032, 0.042)
                a0 = rnd.uniform(0, TAU); arc = rnd.uniform(4.2, 6.1)
                def ring(u, v, cx=cx, cz=cz, r=r, a0=a0, arc=arc): a = a0 + arc * u; rr = r + (v - 0.5) * 0.0042 * (0.35 + 0.65 * math.sin(math.pi * u)) * (0.7 + 0.3 * math.sin(a * 3)); return (cx + rr * math.cos(a), 0.0008, cz + rr * math.sin(a))
                lamina(M, 'mancha', ring, 20, 1)
        else:
            def blot(u, v):
                a = u * TAU; rr = (0.04 if estilo == 'c' else 0.026) * v * (0.75 + 0.25 * math.sin(a * 3 + 1) + 0.12 * math.sin(a * 7)); return (rr * math.cos(a) * 1.3, 0.0008, rr * math.sin(a))
            lamina(M, 'mancha', blot, 16, 2)
    return f

def ossos(M, w, d, h):
    # (the knucklebones of a game: five of the astragali of the slaughter, thrown on the table)
    rnd = R(3)
    for k in range(5):
        x, z, a = rnd.uniform(-0.05, 0.05), rnd.uniform(-0.035, 0.035), rnd.uniform(0, TAU)
        M.at(x, 0.0, z, ry=a)
        with cor(lambda p: mul(OSSO, 0.82 + 0.2 * manchas(p, 220))):
            almofada(M, 'osso', (-0.009, 0.0, -0.006), (0.009, 0.011, 0.006), e=0.6, nu=10, nv=6)
            if not M.lod: ovo(M, 'osso', 0.0, 0.0105, 0.0, 0.0045, 0.0018, 0.003, seg=6, nv=2)
        M.pop()

def cacos(M, w, d, h):
    # (a mug broken on the floor: its pieces of wall where they fell, its handle whole, the foot ring)
    rnd = R(9)
    for k in range(7):
        a0 = rnd.uniform(0, TAU); da = rnd.uniform(0.5, 1.1); x, z = rnd.uniform(-0.09, 0.09), rnd.uniform(-0.07, 0.07)
        M.at(x, 0.0, z, ry=rnd.uniform(0, TAU))
        def shard(u, v, a0=a0, da=da):
            a = a0 + da * (u - 0.5); hh = 0.035 * (0.6 + 0.4 * math.sin(u * math.pi)) * v
            return (0.044 * math.cos(a) - 0.044 * math.cos(a0), 0.004 + hh * 0.25 + 0.012 * (1 - abs(u - 0.5) * 2) * v, 0.044 * math.sin(a) - 0.044 * math.sin(a0) + hh)
        lamina(M, 'louca', shard, 4, 2, both=True)
        M.pop()
    tubo(M, 'louca', curva([(0.03, 0.006, 0.03), (0.055, 0.01, 0.045), (0.07, 0.006, 0.02), (0.05, 0.005, -0.004)], 6), 0.007, seg=6, oval=0.7)
    torno(M, 'louca', [(0.0, 0.034), (0.006, 0.038), (0.012, 0.036), (0.012, 0.0001)], seg=12, x=-0.06, z=-0.03, sharp=55)

def caneca_caida(M, w, d, h):
    # (a turned wooden mug knocked over — it does not break: it lies where it rolled)
    M.at(0, 0.047, 0, rz=math.pi / 2)
    pf = [(-0.05, 0.036), (-0.044, 0.042), (-0.03, 0.046), (0.04, 0.05), (0.05, 0.047)]
    torno(M, 'louca', pf, seg=12, sharp=55, cap1=False)
    torno(M, 'louca', [(0.05, 0.042), (-0.02, 0.038), (-0.02, 0.0001)], seg=12, cap0=False, cap1=False)
    M.pop()

def poca(M, w, d, h):
    # (what was spilt, on the floor: a flat spill of it, its edge as it ran — the drink's colour is the game's)
    def f(u, v):
        a = u * TAU; rr = 0.16 * v * (0.72 + 0.18 * math.sin(a * 3 + 0.6) + 0.1 * math.sin(a * 5 + 2.1) + 0.06 * math.sin(a * 9))
        return (rr * math.cos(a) * 1.15, 0.0012 * (1 - v ** 4), rr * math.sin(a))
    lamina(M, 'liquido', f, 22, 3)

def _quadro(M, w, d, h, face, frame=0.024, cord=True):
    """a board on the wall: its frame, its face, the words over it (escrita: the game writes them — js/dentro3d.js)"""
    t = d - 0.004
    caixa(M, face, (-w / 2 + frame, frame, -d / 2), (w / 2 - frame, h - frame, -d / 2 + t * 0.5), ch=0.002)
    for lo, hi in (((-w / 2, 0.0), (w / 2, frame)), ((-w / 2, h - frame), (w / 2, h)), ((-w / 2, frame), (-w / 2 + frame, h - frame)), ((w / 2 - frame, frame), (w / 2, h - frame))):
        caixa(M, 'madeira', (lo[0], lo[1], -d / 2), (hi[0], hi[1], -d / 2 + t), ch=0.004)
    zf = -d / 2 + t * 0.5 + 0.0012
    lamina(M, 'escrita', lambda u, v: (-w / 2 + frame + 0.004 + (w - 2 * frame - 0.008) * u, frame + 0.004 + (h - 2 * frame - 0.008) * v, zf), 1, 1, uvs=(1.0, 1.0))
    return zf

def lousa(M, w, d, h):
    # (the slate by the door of the small house: a slab of slate in a plain frame, hung from a nail by its cord)
    _quadro(M, w, d, h - 0.05, 'ardosia', frame=0.02)
    fio(M, (-w * 0.3, h - 0.052, -d / 2 + 0.005), (0.0, h - 0.004, -d / 2 + 0.004)); fio(M, (w * 0.3, h - 0.052, -d / 2 + 0.005), (0.0, h - 0.004, -d / 2 + 0.004))
    cilindro(M, 'ferro', 0.0, h - 0.008, -d / 2 + 0.006, 0.003, 0.006, seg=6)

def fio(M, a, b, r=0.0016): tubo(M, 'corda', [a, b], r, seg=4)

def quadro(M, w, d, h):
    # (the board of the middling house: a wider slab in a moulded frame, the ledge under it with its chalk)
    _quadro(M, w, d, h - 0.03, 'ardosia', frame=0.03)
    caixa(M, 'madeira', (-w / 2 + 0.03, 0.0, -d / 2), (w / 2 - 0.03, 0.012, d / 2), ch=0.003)
    with cor((236, 232, 220)): cilindro(M, 'giz', -w * 0.25, 0.012, d / 2 - 0.012, 0.004, 0.006, seg=6)
    with cor((236, 232, 220)): tubo(M, 'giz', [(w * 0.1, 0.016, d / 2 - 0.012), (w * 0.18, 0.016, d / 2 - 0.016)], 0.0035, seg=5)

def placa(M, w, d, h):
    # (the rich house's plaque: a board painted, its border in a second colour, the words painted on it)
    t = d - 0.004
    caixa(M, 'tinta2', (-w / 2, 0.0, -d / 2), (w / 2, h, -d / 2 + t * 0.6), ch=0.006)
    caixa(M, 'tinta', (-w / 2 + 0.026, 0.026, -d / 2 + t * 0.6 - 0.001), (w / 2 - 0.026, h - 0.026, -d / 2 + t * 0.6 + 0.002), ch=0.002)
    for x in (-w / 2 + 0.013, w / 2 - 0.013):
        for y in (0.013, h - 0.013): ovo(M, 'ferro', x, y, -d / 2 + t * 0.6, 0.0045, 0.0045, 0.0022, seg=6, nv=3)
    zf = -d / 2 + t * 0.6 + 0.0032
    lamina(M, 'escrita', lambda u, v: (-w / 2 + 0.032 + (w - 0.064) * u, 0.032 + (h - 0.064) * v, zf), 1, 1, uvs=(1.0, 1.0))

def lenha_pilha(M, w, d, h):
    """the split logs stacked by the fire, the pile as much of it as is left (b1 the top log goes first, then the two of the middle,
    then one of the bottom; the last two, b4): the bark and the cut ends in their own colours"""
    from moveis_forma import tora
    r = 0.055; rows = [(-0.12, 0.0, 0.12), (-0.06, 0.06), (0.0,)]
    parts = [['b4', 'b3', 'b4'], ['b2', 'b2'], ['b1']]
    k = 0
    for j, row in enumerate(rows):
        for i, z in enumerate(row):
            y = r + j * r * 1.72; L = w - 0.04 - 0.04 * ((k * 7) % 3)
            def col(p, L=L):
                if abs(p[0]) > L / 2 - 0.0015: return mix((206, 170, 118), (150, 112, 70), manchas(p, 160) * 0.8)
                return mul((92, 66, 44), 0.75 + 0.4 * manchas(p, 70))
            with cor(col):
                tora(M, parts[j][i], (-L / 2, y, z), (L / 2, y + 0.004 * ((k % 2) - 0.5), z), r * (0.9 + 0.12 * ((k * 5) % 3) / 2), seg=8, seed=k, casca=parts[j][i], cerne=parts[j][i])
            k += 1

def pano_ombro(M, w, d, h):
    # (the keeper's cloth over his shoulder: a towel folded long, hanging down the front and the back — for the body's drawing, P6)
    def f(u, v):
        s = (u - 0.5) * 2; a = (v - 0.5) * math.pi * 1.15; R0 = 0.05
        return (s * 0.06, h - 0.012 - R0 + R0 * math.cos(a) - max(0.0, abs(a) - 1.2) * 0.35 * (1 + 0.1 * s), R0 * math.sin(a) * 1.6 + 0.01 * math.sin(s * 3))
    lamina(M, 'pano', f, 3, 12, both=True)

def vela_noite(M, w, d, h):
    """a candle in its holder, as much of it as is left (cera0 whole … cera3 a stub), the flame at the top of each (chama, chama1…)"""
    torno(M, 'castical', [(0.0, 0.035), (0.005, 0.042), (0.012, 0.04), (0.014, 0.014), (0.04, 0.012), (0.05, 0.02), (0.055, 0.018)], seg=14, sharp=55)
    L = h - 0.065
    for k in range(4):
        hk = L * (1 - k * 0.24); top = 0.05 + hk; part = 'cera%d' % k
        # (the wax from the socket up, the rim of it run down at the top — more on the stub —, the hollow round the wick, the wick)
        torno(M, part, [(0.05, 0.0145), (top - 0.008, 0.0145), (top - 0.003, 0.0152), (top - 0.0015, 0.012), (top - 0.004, 0.0001)], seg=10, cap0=False, cap1=False, sharp=60)
        for j in range(min(k, 2) + 1): a = j * 2.2 + k; tubo(M, part, [(0.0148 * math.cos(a), top - 0.005, 0.0148 * math.sin(a)), (0.0156 * math.cos(a), top - 0.018 - 0.006 * j, 0.0156 * math.sin(a))], 0.002, seg=4, caps=False)
        with cor((40, 34, 28)): tubo(M, part, [(0, top - 0.004, 0), (0, top + 0.006, 0)], 0.0015, seg=4)
        M.anchor('chama' if k == 0 else 'chama%d' % k, 0.0, top + 0.006, 0.0, 0.0, 0.0)
